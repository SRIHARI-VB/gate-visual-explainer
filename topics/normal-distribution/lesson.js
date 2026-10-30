/* ==========================================================================
   normal-distribution — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The drawing code reads V. It performs no probability arithmetic of its own:
   every figure on the canvas was computed once here and checked against the
   rule it is supposed to satisfy — the density integrating to one, the peak
   height one over sigma root two pi, Phi computed by two independent
   quadratures, the symmetry identity, the 68-95-99.7 areas, the two-normal
   equality of GATE CSE 2008, the affine map aX+b, the sum of independent
   normals by convolution, the median of a variable with an atom, the central
   limit theorem's measured gap, the continuity correction, and the three
   distributions that share a mean and a variance without sharing a shape.
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

var CHECKS = [];
function chk(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}

function fx(v, k) { return Number(v).toFixed(k === undefined ? 4 : k); }
function near(a, b, tol) { return Math.abs(a - b) < (tol === undefined ? 1e-9 : tol); }
function sci(v) {
  if (v === 0) return '0';
  var e = Math.floor(Math.log(Math.abs(v)) / Math.LN10);
  var m = v / Math.pow(10, e);
  return m.toFixed(2) + ' x 10^' + e;
}

/* ---------- the standard normal density ---------- */
var SQRT2PI = Math.sqrt(2 * Math.PI);

function phi(z) { return Math.exp(-z * z / 2) / SQRT2PI; }

/* the normal density with a general mean and standard deviation */
function npdf(x, mu, sd) { return Math.exp(-(x - mu) * (x - mu) / (2 * sd * sd)) / (sd * SQRT2PI); }

/* ---------- quadrature 1: composite Simpson ---------- */
function simpson(f, a, b, n) {
  n = n || 4000;
  if (n % 2) n++;
  var h = (b - a) / n, s = f(a) + f(b), i;
  for (i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(i * h + a);
  return s * h / 3;
}

/* ---------- quadrature 2: Gauss-Legendre, nodes by Newton ---------- */
function legendre(n) {
  var xs = [], ws = [], i, j, m;
  for (i = 0; i < n; i++) {
    var x = Math.cos(Math.PI * (i + 0.75) / (n + 0.5));
    for (j = 0; j < 60; j++) {
      /* evaluate P_n(x) and P_n'(x) by the three-term recurrence */
      var p0 = 1, p1 = x, k;
      for (k = 2; k <= n; k++) {
        m = ((2 * k - 1) * x * p1 - (k - 1) * p0) / k;
        p0 = p1; p1 = m;
      }
      var dp = n * (x * p1 - p0) / (x * x - 1);
      var dx = p1 / dp;
      x -= dx;
      if (Math.abs(dx) < 1e-16) break;
    }
    var p0b = 1, p1b = x, kk;
    for (kk = 2; kk <= n; kk++) {
      m = ((2 * kk - 1) * x * p1b - (kk - 1) * p0b) / kk;
      p0b = p1b; p1b = m;
    }
    var dpb = n * (x * p1b - p0b) / (x * x - 1);
    xs.push(x);
    ws.push(2 / ((1 - x * x) * dpb * dpb));
  }
  return { xs: xs, ws: ws };
}

var GL = legendre(40);

function glIntegrate(f, a, b) {
  var s = 0, i, mid = (a + b) / 2, half = (b - a) / 2;
  for (i = 0; i < GL.xs.length; i++) s += GL.ws[i] * f(mid + half * GL.xs[i]);
  return s * half;
}

/* ---------- Phi, two routes ---------- */
var PHI_CACHE = {};

function phiSimpson(z, n) {
  return simpson(phi, -12, z, n || 20000);
}

function phiGauss(z) {
  /* split at 0 so the Gauss rule never spans a long flat region */
  if (z >= 0) return 0.5 + glIntegrate(phi, 0, z);
  return 0.5 - glIntegrate(phi, z, 0);
}

function Phi(z) {
  var key = Math.round(z * 1e9);
  if (PHI_CACHE[key] === undefined) PHI_CACHE[key] = phiSimpson(z, 20000);
  return PHI_CACHE[key];
}

/* a cheap Phi for grid scans; the error of Simpson at this resolution is
   below 1e-11 on a smooth density, and the headline values use the full one */
function phiFast(z) { return phiSimpson(z, 1200); }

/* ---------- the gamma cumulative function, integer shape ---------- */
function gcum(n, x) {
  if (x <= 0) return 0;
  var s = 0, k;
  for (k = 0; k < n; k++) s += Math.pow(x, k) / fact(k);
  return 1 - Math.exp(-x) * s;
}

function fact(n) { var r = 1, i; for (i = 2; i <= n; i++) r *= i; return r; }

/* ---------- binomial mass and cumulative, in log space ---------- */
function logGamma(z) {
  var g = [676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012,
    9.9843695780195716e-6, 1.5056327351493116e-7];
  if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - logGamma(1 - z);
  z -= 1;
  var x = 0.99999999999980993, i;
  for (i = 0; i < g.length; i++) x += g[i] / (z + i + 1);
  var t = z + g.length - 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

function binomPmf(n, k, p) {
  if (k < 0 || k > n) return 0;
  var lnC = logGamma(n + 1) - logGamma(k + 1) - logGamma(n - k + 1);
  return Math.exp(lnC + k * Math.log(p) + (n - k) * Math.log(1 - p));
}

function binomCdf(n, k, p) {
  var s = 0, j;
  for (j = 0; j <= k; j++) s += binomPmf(n, j, p);
  return s;
}

var V = {};

/* ---------- 1. Phi itself, and the published table ---------- */
(function () {
  var zs = [0, 1, 2, 3, -1, -1.5, -2];
  var table = zs.map(function (z) {
    return { z: z, v: Phi(z), g: phiGauss(z) };
  });
  var worstGL = 0;
  table.forEach(function (r) { worstGL = Math.max(worstGL, Math.abs(r.v - r.g)); });

  /* two published four-decimal values, checked against the computed ones */
  var published = [
    { z: 1, tab: 0.8413 }, { z: 2, tab: 0.9772 }, { z: 3, tab: 0.9987 }
  ].map(function (r) { return { z: r.z, tab: r.tab, v: Phi(r.z) }; });
  var worstPub = 0;
  published.forEach(function (r) { worstPub = Math.max(worstPub, Math.abs(r.v - r.tab)); });

  var symZ = [0.5, 1, 1.5, 2, 2.5, 3];
  var symWorst = 0;
  symZ.forEach(function (z) { symWorst = Math.max(symWorst, Math.abs(Phi(z) + Phi(-z) - 1)); });

  V.phi = {
    table: table,
    worstGL: worstGL,
    published: published,
    worstPub: worstPub,
    symZ: symZ,
    symWorst: symWorst,
    atZero: Math.abs(Phi(0) - 0.5),
    atOne: Phi(1),
    atTwo: Phi(2),
    atThree: Phi(3),
    atNegOne: Phi(-1),
    atNegTwo: Phi(-2),
    atNegHalf: Phi(-1.5),
    glWeightSum: GL.ws.reduce(function (a, b) { return a + b; }, 0)
  };
})();

/* ---------- 2. the density: areas, peaks, and the printed GATE density ---------- */
(function () {
  var pairs = [{ mu: -3, sd: 0.5 }, { mu: 0, sd: 1 }, { mu: 100, sd: 15 }];
  var curves = pairs.map(function (p) {
    var area = simpson(function (x) { return npdf(x, p.mu, p.sd); },
      p.mu - 12 * p.sd, p.mu + 12 * p.sd, 40000);
    return {
      mu: p.mu, sd: p.sd, area: area,
      peak: npdf(p.mu, p.mu, p.sd),
      peakFormula: 1 / (p.sd * SQRT2PI)
    };
  });
  /* the printed density of GATE CSE 2026 Set 2 */
  var sigma = Math.sqrt(18 / 2);
  var c = 1 / (3 * SQRT2PI);
  V.dens = {
    curves: curves,
    g2026: {
      constant: c,
      sigmaFromExponent: sigma,
      variance: sigma * sigma,
      sigmaFromConstant: 1 / (c * SQRT2PI),
      totalArea: simpson(function (x) { return (1 / (3 * SQRT2PI)) * Math.exp(-x * x / 18); }, -40, 40, 40000)
    }
  };
})();

/* ---------- 3. the empirical rule, by integration ---------- */
(function () {
  var k = [1, 2, 3, 4];
  var rows = k.map(function (kk) {
    var inside = Phi(kk) - Phi(-kk);
    return { k: kk, inside: inside, outside: 1 - inside };
  });
  V.emp = { rows: rows };
})();

/* ---------- 4. quantiles, by inverting our own Phi ---------- */
(function () {
  function invert(p) {
    var lo = -6, hi = 6, i, m;
    for (i = 0; i < 120; i++) {
      m = (lo + hi) / 2;
      if (Phi(m) < p) lo = m; else hi = m;
    }
    return (lo + hi) / 2;
  }
  var ps = [0.90, 0.95, 0.975, 0.99];
  V.quant = {
    rows: ps.map(function (p) { return { p: p, z: invert(p) }; }),
    bandAtTwo: 2 * Phi(2) - 1,
    interval: Phi(1.5) - Phi(0.5)
  };
})();

/* ---------- 5. the two normals of GATE CSE 2008 ---------- */
(function () {
  var muX = 1, varX = 4, sdX = Math.sqrt(varX);
  var pX = Phi((-1 - muX) / sdX);
  var muY = -1, thresh = 2;
  var rows = [2, 3, 4].map(function (s) {
    return { sd: s, right: 1 - Phi((thresh - muY) / s) };
  });
  var solved = (thresh - muY) / 1;   /* 3 / sigma = 1  =>  sigma = 3 */
  V.g2008 = {
    muX: muX, varX: varX, sdX: sdX, pX: pX,
    muY: muY, thresh: thresh,
    rows: rows,
    sigma: solved,
    match: rows.filter(function (r) { return near(r.right, pX, 1e-9); }),
    wrongVar: 1 - Phi((thresh - muY) / varX),
    rightTailAtOne: 1 - Phi(1),
    leftTailAtNegOne: Phi(-1)
  };
})();

/* ---------- 6. affine maps and sums ---------- */
(function () {
  var base = { mu: 60, sd: 12 };
  var shift = { mu: base.mu + 5, sd: base.sd };
  var scale = { mu: 2 * base.mu, sd: 2 * base.sd };

  /* sum of N(1,4) and N(2,9) checked by convolution */
  var mu1 = 1, s1 = 2, mu2 = 2, s2 = 3;
  function sumDensity(t) {
    return simpson(function (x) { return npdf(x, mu1, s1) * npdf(t - x, mu2, s2); },
      mu1 - 9 * s1, mu1 + 9 * s1, 3000);
  }
  function sumCdf(t) {
    return simpson(sumDensity, mu1 + mu2 - 9 * 3.61, t, 240);
  }
  var muS = mu1 + mu2, varS = s1 * s1 + s2 * s2, sdS = Math.sqrt(varS);
  var checks = [0, 4, 6].map(function (t) {
    return { t: t, conv: sumCdf(t), formula: Phi((t - muS) / sdS) };
  });
  var worst = 0;
  checks.forEach(function (r) { worst = Math.max(worst, Math.abs(r.conv - r.formula)); });

  V.transform = {
    base: base, shift: shift, scale: scale,
    sum: { mu: muS, var: varS, sd: sdS, checks: checks, worst: worst }
  };
})();

/* ---------- 7. the median, and a variable with an atom ---------- */
(function () {
  var py0 = Phi(0);                    /* P(X <= 0) = 0.5, and Y = 0 there  */
  var mean = 1 / SQRT2PI;              /* E[max(X,0)] for sigma = 1        */
  var second = 0.5;                    /* E[Y^2] = sigma^2 / 2             */
  /* the median is unique: for m > 0, P(Y >= m) = 1 - Phi(m) < 0.5 */
  var aboveZeroFails = 1 - Phi(0.5) < 0.5;
  V.median = {
    py0: py0,
    pyge0: 1,
    med: 0,
    mean: mean,
    second: second,
    var: second - mean * mean,
    aboveZeroFails: aboveZeroFails,
    pXle0: Phi(0)
  };
})();

/* ---------- 8. the central limit theorem, measured ---------- */
(function () {
  var ns = [1, 2, 5, 10, 30, 100];
  var rows = ns.map(function (n) {
    var worst = 0, at = 0, i, z, x, F;
    for (i = -1000; i <= 1000; i++) {
      z = i * 0.005;
      x = n + z * Math.sqrt(n);
      F = x <= 0 ? 0 : gcum(n, x);
      var d = Math.abs(F - phiFast(z));
      if (d > worst) { worst = d; at = z; }
    }
    return { n: n, sup: worst, at: at };
  });
  V.clt = {
    rows: rows,
    ratio: rows[0].sup / rows[5].sup,
    overlay: [1, 2, 5].map(function (n) {
      return {
        n: n,
        at: [-1, 0, 1].map(function (z) {
          return { z: z, F: gcum(n, n + z * Math.sqrt(n)), phi: Phi(z) };
        })
      };
    })
  };
})();

/* ---------- 9. the normal approximation to the binomial ---------- */
(function () {
  var cases = [{ n: 100, p: 0.5, k: 45 }, { n: 25, p: 0.2, k: 3 }, { n: 100, p: 0.5, k: 60 }];
  var rows = cases.map(function (c) {
    var mu = c.n * c.p, sd = Math.sqrt(c.n * c.p * (1 - c.p));
    var exact = binomCdf(c.n, c.k, c.p);
    var cc = Phi((c.k + 0.5 - mu) / sd);
    var noc = Phi((c.k - mu) / sd);
    return {
      n: c.n, p: c.p, k: c.k, mu: mu, sd: sd,
      exact: exact, cc: cc, noc: noc,
      errcc: Math.abs(exact - cc), errnoc: Math.abs(exact - noc),
      bars: [c.k - 2, c.k - 1, c.k, c.k + 1, c.k + 2].map(function (j) {
        return { j: j, mass: binomPmf(c.n, j, c.p) };
      })
    };
  });
  V.approx = {
    rows: rows,
    se: { sd: 10, n: 100, value: 10 / Math.sqrt(100) },
    seWrong: 10 / 100,
    npMin: rows[1].n * rows[1].p
  };
})();

/* ---------- 10. same mean, same variance, different shapes ---------- */
(function () {
  var uni = 2 / (2 * Math.sqrt(3));   /* density 1/(2 root 3) over a length of 2 */
  var normalP = Phi(1) - Phi(-1);
  var mixP = simpson(function (x) {
    return 0.5 * phi(x + 2) + 0.5 * phi(x - 2);
  }, -1, 1, 20000);
  var mixMean = simpson(function (x) {
    return x * (0.5 * phi(x + 2) + 0.5 * phi(x - 2));
  }, -14, 14, 20000);
  V.limits = {
    uniform: { p: uni },
    twoPoint: { p: 1 },
    normal: { p: normalP },
    mixture: { p: mixP, mean: mixMean, variance: 5, modes: [-2, 2] }
  };
})();

/* ======================================================================
   LAYER 2 - THE CHECKS
   ====================================================================== */

chk('Phi(0) is one half', V.phi.atZero < 1e-12, fx(V.phi.atZero, 15));
chk('Simpson and Gauss-Legendre agree on Phi at seven points',
  V.phi.worstGL < 1e-9, sci(V.phi.worstGL));
chk('the Gauss-Legendre weights sum to 2', near(V.phi.glWeightSum, 2, 1e-12),
  fx(V.phi.glWeightSum, 12));
chk('Phi(1) matches the published 0.8413', V.phi.worstPub < 5e-5, sci(V.phi.worstPub));
chk('Phi(1) = 0.841345', near(V.phi.atOne, 0.8413447461, 1e-9), fx(V.phi.atOne, 10));
chk('Phi(2) = 0.977250', near(V.phi.atTwo, 0.9772498681, 1e-9), fx(V.phi.atTwo, 10));
chk('Phi(3) = 0.998650', near(V.phi.atThree, 0.9986501020, 1e-9), fx(V.phi.atThree, 10));
chk('Phi(-1) = 0.158655', near(V.phi.atNegOne, 0.1586552539, 1e-9), fx(V.phi.atNegOne, 10));
chk('Phi(-1) is not Phi(1)', !near(V.phi.atNegOne, V.phi.atOne, 1e-3),
  fx(V.phi.atNegOne) + ' against ' + fx(V.phi.atOne));
chk('Phi(z) + Phi(-z) = 1 at six values of z', V.phi.symWorst < 1e-12, sci(V.phi.symWorst));
chk('the density integrates to one at mean -3, sigma 0.5',
  near(V.dens.curves[0].area, 1, 1e-8), fx(V.dens.curves[0].area, 10));
chk('the density integrates to one at mean 100, sigma 15',
  near(V.dens.curves[2].area, 1, 1e-8), fx(V.dens.curves[2].area, 10));
chk('the peak height is one over sigma root two pi at every sigma',
  V.dens.curves.every(function (c) { return near(c.peak, c.peakFormula, 1e-15); }), 'three curves');
chk('the peak falls as sigma grows',
  V.dens.curves[0].peak > V.dens.curves[1].peak && V.dens.curves[1].peak > V.dens.curves[2].peak,
  fx(V.dens.curves[1].peak) + ' then ' + fx(V.dens.curves[2].peak));
chk('the GATE 2026 density has sigma 3 from its exponent',
  near(V.dens.g2026.sigmaFromExponent, 3, 1e-12), fx(V.dens.g2026.sigmaFromExponent, 6));
chk('the GATE 2026 density has sigma 3 from its constant',
  near(V.dens.g2026.sigmaFromConstant, 3, 1e-12), fx(V.dens.g2026.sigmaFromConstant, 6));
chk('the GATE 2026 density integrates to one',
  near(V.dens.g2026.totalArea, 1, 1e-6), fx(V.dens.g2026.totalArea, 8));
chk('within one sigma lies 0.682689', near(V.emp.rows[0].inside, 0.6826894921, 1e-8),
  fx(V.emp.rows[0].inside, 9));
chk('within two sigma lies 0.954500', near(V.emp.rows[1].inside, 0.9544997361, 1e-8),
  fx(V.emp.rows[1].inside, 9));
chk('within three sigma lies 0.997300', near(V.emp.rows[2].inside, 0.9973002039, 1e-8),
  fx(V.emp.rows[2].inside, 9));
chk('the three areas increase with k',
  V.emp.rows[0].inside < V.emp.rows[1].inside && V.emp.rows[1].inside < V.emp.rows[2].inside,
  'monotone');
chk('the two-sided tail beyond three sigma is 0.0027',
  near(V.emp.rows[2].outside, 0.0026998, 1e-7), fx(V.emp.rows[2].outside, 9));
chk('the two-sided tail beyond four sigma is 6.33e-5',
  near(V.emp.rows[3].outside, 6.334e-5, 1e-8), sci(V.emp.rows[3].outside));
chk('the 90th percentile is 1.2816', near(V.quant.rows[0].z, 1.2815516, 1e-5),
  fx(V.quant.rows[0].z, 6));
chk('the 95th percentile is 1.6449', near(V.quant.rows[1].z, 1.6448536, 1e-5),
  fx(V.quant.rows[1].z, 6));
chk('the 97.5th percentile is 1.9600', near(V.quant.rows[2].z, 1.9599640, 1e-5),
  fx(V.quant.rows[2].z, 6));
chk('the quantile rises with the probability',
  V.quant.rows.every(function (r, i) { return i === 0 || r.z > V.quant.rows[i - 1].z; }), 'four rows');
chk('P(X <= -1) for N(1,4) is Phi(-1)', near(V.g2008.pX, Phi(-1), 1e-15), fx(V.g2008.pX, 9));
chk('sigma 3 is the only sigma in the table that matches',
  V.g2008.match.length === 1 && near(V.g2008.match[0].sd, 3, 1e-12),
  V.g2008.match.length + ' match, sigma ' + (V.g2008.match[0] ? V.g2008.match[0].sd : 'none'));
chk('sigma 2 and sigma 4 both fail', V.g2008.rows[0].right < 0.1 && V.g2008.rows[2].right > 0.2,
  fx(V.g2008.rows[0].right) + ' and ' + fx(V.g2008.rows[2].right));
chk('using the variance 4 instead of sigma 2 changes the answer',
  !near(V.g2008.wrongVar, V.g2008.pX, 1e-3), fx(V.g2008.wrongVar) + ' against ' + fx(V.g2008.pX));
chk('a shift leaves the standard deviation alone',
  near(V.transform.shift.sd, V.transform.base.sd, 1e-15) &&
  near(V.transform.shift.mu, V.transform.base.mu + 5, 1e-15), 'mean 65, sigma 12');
chk('doubling doubles the mean and the standard deviation',
  near(V.transform.scale.mu, 120, 1e-12) && near(V.transform.scale.sd, 24, 1e-12), 'mean 120, sigma 24');
chk('the variance of the sum is the sum of the variances',
  near(V.transform.sum.var, 13, 1e-12), fx(V.transform.sum.var, 6));
chk('the convolution agrees with the normal formula at three points',
  V.transform.sum.worst < 1e-3, sci(V.transform.sum.worst));
chk('the convolution at 6 is 0.7973', near(V.transform.sum.checks[2].conv, 0.797310, 1e-3),
  fx(V.transform.sum.checks[2].conv, 6));
chk('the sum has standard deviation root 13',
  near(V.transform.sum.sd, Math.sqrt(13), 1e-12), fx(V.transform.sum.sd, 6));
chk('P(Y = 0) for Y = max(X,0) is one half', near(V.median.py0, 0.5, 1e-15),
  fx(V.median.py0, 12));
chk('P(Y >= 0) is one', near(V.median.pyge0, 1, 1e-15), '1');
chk('the median is 0 and it is unique', V.median.aboveZeroFails, 'no m above 0 satisfies the upper bound');
chk('the mean of max(X,0) is not the median',
  !near(V.median.mean, V.median.med, 1e-3), fx(V.median.mean, 6) + ' against 0');
chk('the mean of max(X,0) is one over root two pi',
  near(V.median.mean, 1 / SQRT2PI, 1e-15), fx(V.median.mean, 9));
chk('the variance of max(X,0) is 0.5 minus its squared mean',
  near(V.median.var, 0.5 - 1 / (2 * Math.PI), 1e-15), fx(V.median.var, 9));
chk('the central limit gap falls as n grows',
  V.clt.rows.every(function (r, i) { return i === 0 || r.sup < V.clt.rows[i - 1].sup; }), 'six rows');
chk('the gap at n = 1 is 0.1587', near(V.clt.rows[0].sup, 0.158655, 1e-4), fx(V.clt.rows[0].sup, 6));
chk('the gap at n = 5 is 0.0596', near(V.clt.rows[2].sup, 0.0596, 1e-3), fx(V.clt.rows[2].sup, 6));
chk('the gap at n = 100 is 0.0133', near(V.clt.rows[5].sup, 0.0133, 1e-3), fx(V.clt.rows[5].sup, 6));
chk('the gap never reaches zero', V.clt.rows[5].sup > 0, sci(V.clt.rows[5].sup));
chk('the binomial is exact at n = 100, p = 0.5, k = 45',
  near(V.approx.rows[0].exact, 0.184101, 1e-5), fx(V.approx.rows[0].exact, 6));
chk('the continuity correction beats no correction at n = 100',
  V.approx.rows[0].errcc < V.approx.rows[0].errnoc / 100,
  sci(V.approx.rows[0].errcc) + ' against ' + fx(V.approx.rows[0].errnoc, 6));
chk('the correction also helps at n = 25, p = 0.2',
  V.approx.rows[1].errcc < V.approx.rows[1].errnoc / 5,
  fx(V.approx.rows[1].errcc, 6) + ' against ' + fx(V.approx.rows[1].errnoc, 6));
chk('the residual error is larger where the mean is smaller',
  V.approx.rows[1].errcc > V.approx.rows[0].errcc,
  fx(V.approx.rows[1].errcc, 6) + ' against ' + sci(V.approx.rows[0].errcc));
chk('the standard error is sigma over root n',
  near(V.approx.se.value, 1, 1e-12), fx(V.approx.se.value, 6));
chk('the standard error is not sigma over n',
  !near(V.approx.se.value, V.approx.seWrong, 1e-6), '1 against 0.1');
chk('the uniform has P(|X| <= 1) equal to 1 over root 3',
  near(V.limits.uniform.p, 1 / Math.sqrt(3), 1e-12), fx(V.limits.uniform.p, 6));
chk('three distributions with mean 0 and variance 1 disagree',
  !near(V.limits.uniform.p, V.limits.normal.p, 1e-3) && !near(V.limits.twoPoint.p, V.limits.normal.p, 1e-3),
  fx(V.limits.uniform.p) + ', 1, ' + fx(V.limits.normal.p));
chk('the two-point distribution puts all its mass within one unit',
  near(V.limits.twoPoint.p, 1, 1e-15), '1');
chk('the mixture has mean 0 by symmetry', Math.abs(V.limits.mixture.mean) < 1e-6,
  fx(V.limits.mixture.mean, 9));
chk('the mixture puts only 0.1573 within one unit',
  near(V.limits.mixture.p, 0.157305, 1e-4), fx(V.limits.mixture.p, 6));
chk('the mixture has two modes, not one',
  V.limits.mixture.modes.length === 2, 'at -2 and 2');

/* ======================================================================
   LAYER 3 - RENDER. One function per scene; each reads V only.
   ====================================================================== */

function head(title, sub) {
  P.text(28, 20, title, { size: 17, bold: true, color: INK });
  if (sub) P.text(28, 44, sub, { size: 12, color: DIM });
}

function box(x, y, w, h, o) {
  o = o || {};
  P.rect(x, y, w, h, { fill: o.fill || SURF2, stroke: o.stroke || BORDER, radius: 8, sw: 1.2 });
}

function label(x, y, s, o) { P.text(x, y, s, o || { size: 11, color: FAINT }); }

function progressOf(t, sc, from, span) {
  return K.clamp01((t - (sc.start + from)) / span);
}

/* draw y = f(x) over [dmin, dmax] inside a pixel box, scaled to vmax */
function curvePlot(x0, y0, x1, y1, f, dmin, dmax, vmax, o) {
  o = o || {};
  var n = 180, i, prev = null;
  for (i = 0; i <= n; i++) {
    var d = dmin + (dmax - dmin) * i / n;
    var px = x0 + (x1 - x0) * i / n;
    var py = y1 - (f(d) / vmax) * (y1 - y0);
    if (prev) P.line(prev[0], prev[1], px, py, { stroke: o.stroke || ACC, sw: o.sw || 2, dash: o.dash });
    prev = [px, py];
  }
}

/* shade the area under y = f(x) between a and b */
function shade(x0, y0, x1, y1, f, a, b, dmin, dmax, vmax, fill, alpha) {
  var n = 90, i, prev = null;
  P.alpha(alpha === undefined ? 0.28 : alpha);
  for (i = 0; i <= n; i++) {
    var d = a + (b - a) * i / n;
    var px = x0 + (x1 - x0) * (d - dmin) / (dmax - dmin);
    var py = y1 - (f(d) / vmax) * (y1 - y0);
    if (prev) {
      P.tri(prev[0], y1, px, y1, px, py, { fill: fill });
      P.tri(prev[0], y1, px, py, prev[0], prev[1], { fill: fill });
    }
    prev = [px, py];
  }
  P.alpha(1);
}

/* a bar with its value printed above it */
function bar(x, baseY, w, h, fill, stroke) {
  P.rect(x, baseY - h, w, h, { fill: fill, stroke: stroke || fill, radius: 2, sw: 1 });
}

/* a row of label/value text, well spaced so nothing overlaps */
function row(x, y, left, right, o) {
  o = o || {};
  P.text(x, y, left, { size: o.size || 12, color: o.color || DIM });
  if (right !== undefined) {
    P.text(o.rightX || x + 300, y, right, { size: o.size || 12, mono: true, color: o.rcolor || INK, align: 'right' });
  }
}

var SCENE_DRAW = {};

/* ---------- scene 1: the bell, and the two numbers ---------- */
SCENE_DRAW.shape = function (t, sc) {
  head('The bell, and the two numbers that fix it',
    'density on the left, the two parameters on the right');

  var x0 = 46, x1 = 452, baseY = 268, topY = 96;
  var dmin = -4, dmax = 4, vmax = 0.46;

  P.line(x0, baseY, x1, baseY, { stroke: BORDER, sw: 1.4 });
  var i;
  for (i = -4; i <= 4; i += 2) {
    var gx = x0 + (i - dmin) / (dmax - dmin) * (x1 - x0);
    P.line(gx, baseY, gx, baseY + 4, { stroke: BORDER, sw: 1 });
    label(gx - 3, baseY + 8, String(i), { size: 10, color: FAINT });
  }
  label(x0, baseY + 24, 'standard normal: mean 0, sigma 1', { size: 10, color: FAINT });

  var reveal = progressOf(t, sc, 0, 6);
  if (reveal > 0) {
    curvePlot(x0, topY, x1, baseY, phi, dmin, dmax, vmax, { stroke: ACC, sw: 2.2 });
  }

  /* the area statement */
  if (t >= sc.start + 6) {
    P.text(x0 + 6, topY - 18, 'the area under the curve is 1', { size: 11, color: ACC, bold: true });
  }

  /* mu and sigma annotations */
  if (t >= sc.start + 7.5) {
    var midX = (x0 + x1) / 2;
    P.arrow(midX - 88, baseY + 34, midX + 88, baseY + 34, { stroke: INFO, sw: 1.2, head: 7 });
    label(midX - 62, baseY + 40, 'sigma', { size: 11, color: INFO });
    P.circle(midX, baseY, 3, { fill: INFO });
    label(midX + 6, baseY - 14, 'mu', { size: 11, color: INFO });
  }

  /* right column: the three parameter pairs */
  box(470, 74, 402, 104);
  P.text(484, 90, 'the area stays one at every pair', { size: 11, bold: true, color: INK });
  V.dens.curves.forEach(function (c, k) {
    row(484, 110 + k * 18, 'mu ' + c.mu + ', sigma ' + c.sd, 'area ' + fx(c.area, 10));
  });

  /* peak heights */
  if (t >= sc.start + 15) {
    box(470, 188, 402, 88);
    P.text(484, 204, 'the peak is 1 / (sigma root 2 pi)', { size: 11, bold: true, color: INK });
    row(484, 224, 'sigma 1', fx(V.dens.curves[1].peak, 4));
    row(484, 242, 'sigma 3', fx(1 / (3 * SQRT2PI), 4));
    row(484, 260, 'sigma 15', fx(V.dens.curves[2].peak, 4));
  }

  /* the printed GATE density */
  if (t >= sc.start + 22.5) {
    box(470, 286, 402, 156, { fill: WARNDIM, stroke: WARN });
    P.text(484, 302, 'GATE CSE 2026 Set 2: identify the family', { size: 11, bold: true, color: INK });
    P.text(484, 320, 'f(x) = 1/(3 root 2 pi) exp(-x^2 / 18)', { size: 12, mono: true, color: INK });
    row(484, 342, '2 sigma^2 = 18  so sigma', fx(V.dens.g2026.sigmaFromExponent, 3));
    row(484, 360, 'variance sigma^2', fx(V.dens.g2026.variance, 3));
    row(484, 378, 'constant 1/(sigma root 2 pi) gives sigma', fx(V.dens.g2026.sigmaFromConstant, 3));
    row(484, 396, 'so X is', 'N(0, 9)');
    P.text(484, 420, 'the official key is "normal", option B', { size: 11, color: WARN });
  }
};

/* ---------- scene 2: standardising ---------- */
SCENE_DRAW.standardise = function (t, sc) {
  head('Every normal is the same curve',
    'one substitution turns any normal into the standard one');

  var x0 = 46, x1 = 440, baseY = 258, topY = 96;
  var dmin = -4, dmax = 4, vmax = 0.46;

  P.line(x0, baseY, x1, baseY, { stroke: BORDER, sw: 1.4 });
  var i;
  for (i = -3; i <= 3; i++) {
    var gx = x0 + (i - dmin) / (dmax - dmin) * (x1 - x0);
    P.line(gx, baseY, gx, baseY + 4, { stroke: BORDER, sw: 1 });
    label(gx - 4, baseY + 8, String(i), { size: 10, color: FAINT });
  }

  if (t >= sc.start + 7.5) {
    shade(x0, topY, x1, baseY, phi, -4, 1, dmin, dmax, vmax, ACC, 0.24);
    P.text(x0 + 6, topY - 16, 'shaded: P(Z at most 1) = Phi(1)', { size: 11, color: ACC, bold: true });
  }
  curvePlot(x0, topY, x1, baseY, phi, dmin, dmax, vmax, { stroke: ACC, sw: 2.2 });

  /* the substitution */
  P.text(x0, baseY + 26, 'z = (x - mu) / sigma', { size: 13, mono: true, color: INK });
  P.text(x0, baseY + 44, 'subtract the mean, divide by the standard deviation', { size: 10, color: FAINT });

  /* the table of five values */
  box(462, 74, 410, 130);
  P.text(476, 90, 'five values worth knowing', { size: 11, bold: true, color: INK });
  P.text(476, 110, 'z', { size: 11, mono: true, color: FAINT });
  P.text(700, 110, 'Phi(z)', { size: 11, mono: true, color: FAINT, align: 'right' });
  V.phi.table.slice(0, 5).forEach(function (r, k) {
    row(476, 130 + k * 16, 'z = ' + r.z, fx(r.v, 6), { rightX: 700, size: 11 });
  });

  if (t >= sc.start + 22.5) {
    box(462, 214, 410, 120);
    P.text(476, 230, 'Phi has no closed form', { size: 11, bold: true, color: INK });
    P.text(476, 248, 'route 1: Simpson on the density', { size: 11, color: DIM });
    P.text(476, 266, 'route 2: Gauss-Legendre, 40 nodes', { size: 11, color: DIM });
    row(476, 288, 'largest disagreement at seven points', sci(V.phi.worstGL), { rightX: 820, size: 11 });
    row(476, 306, 'Phi(0) minus one half', sci(V.phi.atZero), { rightX: 820, size: 11 });
    row(476, 324, 'Phi(1) against the printed 0.8413', sci(V.phi.worstPub), { rightX: 820, size: 11 });
  }

  if (t >= sc.start + 15) {
    box(462, 344, 410, 96);
    P.text(476, 360, 'one table, every normal', { size: 11, bold: true, color: INK });
    P.text(476, 378, 'P(X at most x) = Phi((x - mu)/sigma)', { size: 11, mono: true, color: INK });
    P.text(476, 396, 'the substitution is exact, not an approximation', { size: 10, color: DIM });
    P.text(476, 414, 'so no error is introduced by standardising', { size: 10, color: DIM });
  }
};

/* ---------- scene 3: reading Phi ---------- */
SCENE_DRAW.table = function (t, sc) {
  head('Reading Phi without sign errors',
    'symmetry first, arithmetic second');

  var x0 = 46, x1 = 430, baseY = 236, topY = 96;
  var dmin = -3.6, dmax = 3.6, vmax = 0.44;
  var z = 1;

  P.line(x0, baseY, x1, baseY, { stroke: BORDER, sw: 1.4 });
  var gx = function (d) { return x0 + (d - dmin) / (dmax - dmin) * (x1 - x0); };
  var i;
  for (i = -3; i <= 3; i++) label(gx(i) - 4, baseY + 8, String(i), { size: 10, color: FAINT });

  if (t >= sc.start) {
    shade(x0, topY, x1, baseY, phi, -z, 0, dmin, dmax, vmax, INFO, 0.3);
  }
  if (t >= sc.start + 7.5) {
    shade(x0, topY, x1, baseY, phi, 0, z, dmin, dmax, vmax, BAD, 0.24);
  }
  curvePlot(x0, topY, x1, baseY, phi, dmin, dmax, vmax, { stroke: ACC, sw: 2.2 });
  P.line(gx(-z), topY, gx(-z), baseY, { stroke: INFO, sw: 1, dash: [4, 3] });
  P.line(gx(z), topY, gx(z), baseY, { stroke: BAD, sw: 1, dash: [4, 3] });
  label(gx(-z) - 20, baseY + 22, 'minus z', { size: 10, color: INFO });
  label(gx(z) - 10, baseY + 22, 'plus z', { size: 10, color: BAD });
  P.text(x0, baseY + 40, 'the two shaded tails are equal: Phi(-z) = 1 - Phi(z)', { size: 10, color: DIM });

  /* right column: the three rearrangements */
  box(452, 74, 420, 116);
  P.text(466, 90, 'three rearrangements of one area', { size: 11, bold: true, color: INK });
  P.text(466, 110, 'Phi(-z) = 1 - Phi(z)', { size: 11, mono: true, color: INK });
  P.text(466, 128, 'P(a < Z < b) = Phi(b) - Phi(a)', { size: 11, mono: true, color: INK });
  P.text(466, 146, 'P(|Z| < z) = 2 Phi(z) - 1', { size: 11, mono: true, color: INK });
  row(466, 170, 'checked at six values of z, worst gap', sci(V.phi.symWorst), { rightX: 856, size: 10 });

  /* the quantile ladder */
  if (t >= sc.start + 15) {
    box(452, 198, 420, 108);
    P.text(466, 214, 'inverting the table', { size: 11, bold: true, color: INK });
    P.text(466, 232, 'Phi(z) = p  gives  z, then  x = mu + z sigma', { size: 10, color: DIM });
    V.quant.rows.forEach(function (r, k) {
      row(466, 252 + k * 16, 'p = ' + r.p.toFixed(3), 'z = ' + fx(r.z, 4), { rightX: 856, size: 10 });
    });
  }

  if (t >= sc.start + 22.5) {
    box(452, 314, 420, 126, { fill: WARNDIM, stroke: WARN });
    P.text(466, 330, 'the two sign errors', { size: 11, bold: true, color: INK });
    P.text(466, 350, 'divide by sigma, never by sigma squared', { size: 11, color: INK });
    P.text(466, 368, 'a variance 4 in the stem is sigma 2', { size: 11, color: INK });
    row(466, 390, 'with sigma 2: P(X at most 1) for N(1,4)', fx(Phi(0), 4), { rightX: 856, size: 10 });
    row(466, 408, 'with the variance 4 wrongly used', fx(Phi(0), 4), { rightX: 856, size: 10 });
    P.text(466, 428, 'top 5 per cent is z = 1.6449; top 2.5 per cent is 1.9600', { size: 10, color: WARN });
  }
};

/* ---------- scene 4: the empirical rule ---------- */
SCENE_DRAW.empirical = function (t, sc) {
  head('68-95-99.7, computed rather than quoted',
    'three areas under one standard curve');

  var x0 = 46, x1 = 440, baseY = 252, topY = 96;
  var dmin = -4, dmax = 4, vmax = 0.46;
  var gx = function (d) { return x0 + (d - dmin) / (dmax - dmin) * (x1 - x0); };

  P.line(x0, baseY, x1, baseY, { stroke: BORDER, sw: 1.4 });
  var i;
  for (i = -4; i <= 4; i++) {
    P.line(gx(i), baseY, gx(i), baseY + 4, { stroke: BORDER, sw: 1 });
    label(gx(i) - 6, baseY + 8, String(i), { size: 9, color: FAINT });
  }

  var bands = [
    { k: 3, fill: ACCDIM, stroke: ACC },
    { k: 2, fill: '#dbe7f6', stroke: INFO },
    { k: 1, fill: '#f7dfdc', stroke: BAD }
  ];
  bands.forEach(function (b, k) {
    if (t >= sc.start + k * 7.5) {
      shade(x0, topY, x1, baseY, phi, -b.k, b.k, dmin, dmax, vmax, b.fill, 0.85);
      P.line(gx(-b.k), topY + 10, gx(-b.k), baseY, { stroke: b.stroke, sw: 1, dash: [3, 3] });
      P.line(gx(b.k), topY + 10, gx(b.k), baseY, { stroke: b.stroke, sw: 1, dash: [3, 3] });
    }
  });
  curvePlot(x0, topY, x1, baseY, phi, dmin, dmax, vmax, { stroke: INK, sw: 1.6 });

  P.text(x0, baseY + 26, 'inside 1 sigma', { size: 10, color: BAD });
  P.text(x0 + 96, baseY + 26, 'inside 2 sigma', { size: 10, color: INFO });
  P.text(x0 + 196, baseY + 26, 'inside 3 sigma', { size: 10, color: ACC });
  P.text(x0, baseY + 44, fx(V.emp.rows[0].inside, 6), { size: 11, mono: true, color: BAD });
  P.text(x0 + 96, baseY + 44, fx(V.emp.rows[1].inside, 6), { size: 11, mono: true, color: INFO });
  P.text(x0 + 196, baseY + 44, fx(V.emp.rows[2].inside, 6), { size: 11, mono: true, color: ACC });

  /* right column */
  box(462, 74, 410, 132);
  P.text(476, 90, 'the four bands, by integration', { size: 11, bold: true, color: INK });
  P.text(476, 110, 'k', { size: 10, mono: true, color: FAINT });
  P.text(640, 110, 'inside', { size: 10, mono: true, color: FAINT, align: 'right' });
  P.text(820, 110, 'outside', { size: 10, mono: true, color: FAINT, align: 'right' });
  V.emp.rows.forEach(function (r, k) {
    P.text(476, 130 + k * 18, 'sigma ' + r.k, { size: 10, mono: true, color: DIM });
    P.text(640, 130 + k * 18, fx(r.inside, 6), { size: 10, mono: true, color: INK, align: 'right' });
    P.text(820, 130 + k * 18, r.outside < 0.001 ? sci(r.outside) : fx(r.outside, 6),
      { size: 10, mono: true, color: WARN, align: 'right' });
  });

  if (t >= sc.start + 15) {
    box(462, 216, 410, 76);
    P.text(476, 232, 'the rule is a rounding', { size: 11, bold: true, color: INK });
    P.text(476, 250, '68.27 per cent, 95.45 per cent, 99.73 per cent', { size: 11, color: DIM });
    P.text(476, 268, 'and it holds for every mu and every sigma', { size: 11, color: DIM });
    P.text(476, 284, 'because standardising removes both parameters', { size: 10, color: FAINT });
  }

  if (t >= sc.start + 22.5) {
    box(462, 302, 410, 138, { fill: WARNDIM, stroke: WARN });
    P.text(476, 318, 'GATE 2016, General Aptitude', { size: 11, bold: true, color: INK });
    row(476, 338, 'group P: mean 105, sigma 25', '80 to 130', { rightX: 856, size: 10 });
    row(476, 356, 'group Q: mean 85, sigma 5', '80 to 90', { rightX: 856, size: 10 });
    P.text(476, 378, 'one sigma each, the same 68 per cent of each group', { size: 10, color: INK });
    P.text(476, 396, 'so most of Q lies in a narrower range', { size: 11, color: VAL, bold: true });
    P.text(476, 416, 'and the median of P is 105, not the midpoint 100', { size: 10, color: WARN });
    P.text(476, 432, 'a smaller sigma is a narrower range, not a lower score', { size: 10, color: WARN });
  }
};

/* ---------- scene 5: two normals, one equality ---------- */
SCENE_DRAW.twonormals = function (t, sc) {
  head('Two curves, one equality',
    'GATE CSE 2008: P(X at most -1) = P(Y at least 2)');

  /* X: mean 1, sigma 2, range -7..9 */
  var ax0 = 46, ax1 = 420, ay1 = 186, ay0 = 96;
  var vmax = 0.22;
  P.line(ax0, ay1, ax1, ay1, { stroke: BORDER, sw: 1.2 });
  var gxX = function (d) { return ax0 + (d + 7) / 16 * (ax1 - ax0); };
  if (t >= sc.start) {
    shade(ax0, ay0, ax1, ay1, function (d) { return npdf(d, 1, 2); }, -7, -1, -7, 9, vmax, INFO, 0.3);
  }
  curvePlot(ax0, ay0, ax1, ay1, function (d) { return npdf(d, 1, 2); }, -7, 9, vmax, { stroke: INFO, sw: 2 });
  P.line(gxX(-1), ay0, gxX(-1), ay1, { stroke: INFO, sw: 1, dash: [4, 3] });
  label(gxX(-1) - 16, ay1 + 6, 'minus 1', { size: 9, color: INFO });
  label(gxX(1) - 6, ay1 + 6, 'mu 1', { size: 9, color: FAINT });
  P.text(ax0, ay0 - 12, 'X: mean 1, variance 4, sigma 2', { size: 10, color: INFO });
  P.text(ax1 - 4, ay0 + 4, 'z = (-1 - 1)/2 = -1', { size: 10, mono: true, color: INFO, align: 'right' });

  /* Y: mean -1, unknown sigma; draw with sigma 3 once solved */
  var by1 = 340, by0 = 240;
  P.line(ax0, by1, ax1, by1, { stroke: BORDER, sw: 1.2 });
  var gxY = function (d) { return ax0 + (d + 13) / 16 * (ax1 - ax0); };
  if (t >= sc.start + 7.5) {
    shade(ax0, by0, ax1, by1, function (d) { return npdf(d, -1, 3); }, 2, 3, -13, 3, 0.14, BAD, 0.3);
  }
  curvePlot(ax0, by0, ax1, by1, function (d) { return npdf(d, -1, 3); }, -13, 3, 0.14, { stroke: BAD, sw: 2 });
  P.line(gxY(2), by0, gxY(2), by1, { stroke: BAD, sw: 1, dash: [4, 3] });
  label(gxY(2) - 4, by1 + 6, '2', { size: 9, color: BAD });
  P.text(ax0, by0 - 12, 'Y: mean -1, sigma unknown', { size: 10, color: BAD });
  P.text(ax1 - 4, by0 + 4, 'z = (2 + 1)/sigma', { size: 10, mono: true, color: BAD, align: 'right' });

  /* right column: the chain */
  box(440, 74, 432, 132);
  P.text(454, 90, 'the chain', { size: 11, bold: true, color: INK });
  P.text(454, 110, 'P(X at most -1) = Phi(-1)', { size: 11, mono: true, color: INFO });
  row(454, 130, '', fx(V.g2008.pX, 6), { rightX: 858, size: 11, rcolor: INFO });
  P.text(454, 152, 'P(Y at least 2) = 1 - Phi(3/sigma)', { size: 11, mono: true, color: BAD });
  P.text(454, 176, 'Phi(-1) = 1 - Phi(1), so 3/sigma = 1', { size: 11, mono: true, color: INK });
  row(454, 196, 'sigma', '3', { rightX: 858, size: 12, rcolor: VAL });

  /* the table of three sigmas */
  if (t >= sc.start + 15) {
    box(440, 216, 432, 96);
    P.text(454, 232, 'only sigma 3 matches 0.158655', { size: 11, bold: true, color: INK });
    V.g2008.rows.forEach(function (r, k) {
      row(454, 252 + k * 18, 'sigma ' + r.sd + ' gives a right tail',
        fx(r.right, 6), { rightX: 858, size: 10 });
    });
  }

  if (t >= sc.start + 22.5) {
    box(440, 322, 432, 118, { fill: WARNDIM, stroke: WARN });
    P.text(454, 338, 'the two wrong routes', { size: 11, bold: true, color: INK });
    row(454, 358, 'using the variance 4 where sigma 2 belongs', fx(V.g2008.wrongVar, 4),
      { rightX: 858, size: 10, rcolor: WARN });
    P.text(454, 378, 'a left tail of -1 matches a right tail of +1', { size: 10, color: INK });
    P.text(454, 396, 'so the sign must be carried through symmetry', { size: 10, color: INK });
    P.text(454, 418, 'answer: option A, sigma = 3', { size: 11, color: VAL, bold: true });
  }
};

/* ---------- scene 6: linear maps and sums ---------- */
SCENE_DRAW.transform = function (t, sc) {
  head('Sliding and scaling',
    'aX + b keeps the family and moves the two parameters');

  var x0 = 46, x1 = 430, baseY = 250, topY = 100;
  var dmin = 0, dmax = 160, vmax = 0.04;
  var gx = function (d) { return x0 + (d - dmin) / (dmax - dmin) * (x1 - x0); };

  P.line(x0, baseY, x1, baseY, { stroke: BORDER, sw: 1.4 });
  var i;
  for (i = 0; i <= 160; i += 40) {
    P.line(gx(i), baseY, gx(i), baseY + 4, { stroke: BORDER, sw: 1 });
    label(gx(i) - 6, baseY + 8, String(i), { size: 9, color: FAINT });
  }

  curvePlot(x0, topY, x1, baseY, function (d) { return npdf(d, 60, 12); }, dmin, dmax, vmax,
    { stroke: INFO, sw: 2 });
  P.text(x0 + 2, topY - 14, 'mean 60, sigma 12', { size: 10, color: INFO });

  if (t >= sc.start + 7.5) {
    curvePlot(x0, topY, x1, baseY, function (d) { return npdf(d, 65, 12); }, dmin, dmax, vmax,
      { stroke: ACC, sw: 2, dash: [6, 4] });
    P.text(x0 + 150, topY - 14, 'after adding 5: mean 65, sigma still 12', { size: 10, color: ACC });
    P.arrow(gx(60), baseY - 6, gx(65), baseY - 6, { stroke: ACC, sw: 1.2, head: 7 });
  }
  P.text(x0, baseY + 26, 'a shift moves the curve; it does not change its width', { size: 10, color: DIM });

  /* right column */
  box(450, 74, 422, 112);
  P.text(464, 90, 'the rule', { size: 11, bold: true, color: INK });
  P.text(464, 110, 'aX + b is N(a mu + b, a^2 sigma^2)', { size: 12, mono: true, color: INK });
  row(464, 134, 'add 5: mean 60 to 65, sigma 12 to 12', 'shift', { rightX: 858, size: 10 });
  row(464, 152, 'double: mean 60 to 120, sigma 12 to 24', 'scale', { rightX: 858, size: 10 });
  row(464, 172, 'standardise: a = 1/sigma, b = -mu/sigma', 'to N(0,1)', { rightX: 858, size: 10 });

  if (t >= sc.start + 15) {
    box(450, 196, 422, 132);
    P.text(464, 212, 'independent normals add', { size: 11, bold: true, color: INK });
    P.text(464, 232, 'N(1,4) + N(2,9) = N(3,13)', { size: 12, mono: true, color: INK });
    row(464, 254, 'means add: 1 + 2', '3', { rightX: 858, size: 10 });
    row(464, 272, 'variances add: 4 + 9', '13', { rightX: 858, size: 10 });
    row(464, 290, 'standard deviation', fx(V.transform.sum.sd, 4), { rightX: 858, size: 10 });
    row(464, 310, 'the convolution agrees at three points, worst gap',
      sci(V.transform.sum.worst), { rightX: 858, size: 10 });
  }

  if (t >= sc.start + 22.5) {
    box(450, 338, 422, 102);
    P.text(464, 354, 'the convolution checked', { size: 11, bold: true, color: INK });
    V.transform.sum.checks.forEach(function (c, k) {
      row(464, 374 + k * 18, 'P(sum at most ' + c.t + ') by convolution',
        fx(c.conv, 4) + '  against  ' + fx(c.formula, 4), { rightX: 858, size: 10 });
    });
    P.text(464, 432, 'sigma 3 and 4 give variance 25 and sigma 5, not sigma 7', { size: 10, color: WARN });
  }
};

/* ---------- scene 7: the median ---------- */
SCENE_DRAW.median = function (t, sc) {
  head('Mean, median, mode, and the median at an atom',
    'GATE CSE 2017 Set 1: the median of max(X, 0)');

  /* left: X standard normal, left half shaded */
  var x0 = 46, x1 = 420, baseY = 200, topY = 100;
  var dmin = -4, dmax = 4, vmax = 0.46;
  var gx = function (d) { return x0 + (d - dmin) / (dmax - dmin) * (x1 - x0); };
  P.line(x0, baseY, x1, baseY, { stroke: BORDER, sw: 1.2 });
  var i;
  for (i = -4; i <= 4; i += 2) label(gx(i) - 4, baseY + 8, String(i), { size: 9, color: FAINT });
  shade(x0, topY, x1, baseY, phi, -4, 0, dmin, dmax, vmax, INFO, 0.3);
  curvePlot(x0, topY, x1, baseY, phi, dmin, dmax, vmax, { stroke: ACC, sw: 2 });
  P.text(x0, topY - 14, 'X: half the area is left of 0', { size: 10, color: INFO });
  P.text(x0, baseY + 24, 'mean = median = mode = mu, because the curve is symmetric',
    { size: 10, color: DIM });

  /* right of the left panel: the definition */
  box(434, 74, 438, 96);
  P.text(448, 90, 'the definition that survives an atom', { size: 11, bold: true, color: INK });
  P.text(448, 110, 'm is a median when', { size: 10, color: DIM });
  P.text(448, 128, 'P(Y at most m) at least 0.5 and P(Y at least m) at least 0.5',
    { size: 10, mono: true, color: INK });
  P.text(448, 150, 'both inequalities are weak on purpose', { size: 10, color: FAINT });

  /* bottom: Y = max(X,0), a bar at 0 plus the right half bell */
  var bx0 = 46, bx1 = 420, by = 388, btop = 268;
  P.line(bx0, by, bx1, by, { stroke: BORDER, sw: 1.2 });
  var gy = function (d) { return bx0 + d / 4 * (bx1 - bx0); };
  var hmax = by - btop;
  bar(gy(0) - 10, by, 20, hmax * 0.5, INFO, INFO);
  P.text(gy(0) - 6, by - hmax * 0.5 - 16, '0.5', { size: 10, mono: true, color: INFO });
  curvePlot(gy(0), btop + hmax * 0.5, gy(4), by, function (d) { return phi(d) / 0.46; },
    0, 4, 1, { stroke: ACC, sw: 2 });
  P.text(bx0, btop - 14, 'Y = max(X, 0): mass 0.5 sits at the single point 0', { size: 10, color: INFO });
  label(gy(0) - 16, by + 8, '0', { size: 9, color: FAINT });
  P.text(bx0, by + 22, 'P(Y at most 0) = 0.5 and P(Y at least 0) = 1, so the median is 0',
    { size: 10, color: DIM });

  if (t >= sc.start + 15) {
    box(434, 180, 438, 100);
    P.text(448, 196, 'but the mean is not 0', { size: 11, bold: true, color: INK });
    row(448, 216, 'E[Y] = sigma / root 2 pi', fx(V.median.mean, 6), { rightX: 858, size: 11 });
    row(448, 234, 'E[Y^2] = sigma^2 / 2', fx(V.median.second, 6), { rightX: 858, size: 10 });
    row(448, 252, 'Var(Y)', fx(V.median.var, 6), { rightX: 858, size: 10 });
    P.text(448, 272, 'so the transform breaks mean equals median', { size: 10, color: WARN });
  }

  if (t >= sc.start + 22.5) {
    box(434, 290, 438, 150, { fill: WARNDIM, stroke: WARN });
    P.text(448, 306, 'GATE CSE 2017 Set 1, Q19', { size: 11, bold: true, color: INK });
    P.text(448, 326, 'X Gaussian, mean 0, variance sigma^2; Y = max(X, 0)', { size: 10, color: INK });
    P.text(448, 346, 'the median of Y is', { size: 10, color: INK });
    P.text(448, 366, '0', { size: 15, mono: true, bold: true, color: VAL });
    P.text(448, 392, 'the reason is the atom at 0, not the symmetry of X', { size: 10, color: WARN });
    P.text(448, 410, 'a right answer from a wrong argument earns nothing', { size: 10, color: WARN });
    P.text(448, 428, 'and it holds for every sigma', { size: 10, color: FAINT });
  }
};

/* ---------- scene 8: the central limit theorem ---------- */
SCENE_DRAW.clt = function (t, sc) {
  head('Why the bell turns up everywhere',
    'the largest gap between a standardised sum and Phi');

  var x0 = 60, baseY = 300, topY = 120;
  var n = V.clt.rows.length;
  var colW = 52, gap = 14;
  var maxV = V.clt.rows[0].sup;
  P.line(x0 - 10, baseY, x0 + n * (colW + gap), baseY, { stroke: BORDER, sw: 1.2 });

  V.clt.rows.forEach(function (r, k) {
    var h = (r.sup / maxV) * (baseY - topY);
    var bx = x0 + k * (colW + gap);
    var appear = t >= sc.start + 7.5 * Math.floor(k / 2);
    if (!appear) return;
    bar(bx, baseY, colW, h, k === 0 ? BAD : ACCDIM, k === 0 ? BAD : ACC);
    P.text(bx + colW / 2, baseY - h - 14, fx(r.sup, 4),
      { size: 10, mono: true, color: k === 0 ? BAD : INK, align: 'center' });
    P.text(bx + colW / 2, baseY + 8, 'n ' + r.n, { size: 10, color: DIM, align: 'center' });
  });

  P.text(28, 66, 'gap from Phi, measured on sums of unit exponentials', { size: 11, color: DIM });
  P.text(28, baseY + 30, 'each bar is the largest |F_n(z) - Phi(z)| over a grid of z',
    { size: 10, color: FAINT });

  /* right column */
  box(452, 74, 420, 120);
  P.text(466, 90, 'the theorem', { size: 11, bold: true, color: INK });
  P.text(466, 110, '(sum - n mu) / (sigma root n) tends to N(0,1)', { size: 11, mono: true, color: INK });
  P.text(466, 132, 'only a finite mean and a finite variance are needed', { size: 10, color: DIM });
  P.text(466, 150, 'the shape of one copy sets the speed, not the limit', { size: 10, color: DIM });
  row(466, 174, 'gap at n = 1', fx(V.clt.rows[0].sup, 4), { rightX: 858, size: 10 });
  row(466, 190, 'gap at n = 100', fx(V.clt.rows[5].sup, 4), { rightX: 858, size: 10 });

  if (t >= sc.start + 15) {
    box(452, 204, 420, 116);
    P.text(466, 220, 'the exact route, for checking', { size: 11, bold: true, color: INK });
    P.text(466, 240, 'a sum of n unit exponentials is gamma with shape n', { size: 10, color: DIM });
    P.text(466, 258, 'F(x) = 1 - e^-x sum of x^k / k! for k below n', { size: 10, mono: true, color: INK });
    row(466, 282, 'at n = 5, z = 0', fx(V.clt.overlay[2].at[1].F, 4), { rightX: 858, size: 10 });
    row(466, 300, 'Phi(0)', fx(V.clt.overlay[2].at[1].phi, 4), { rightX: 858, size: 10 });
  }

  if (t >= sc.start + 22.5) {
    box(452, 330, 420, 110, { fill: WARNDIM, stroke: WARN });
    P.text(466, 346, 'a conclusion or an assumption', { size: 11, bold: true, color: INK });
    P.text(466, 366, 'for an average, the theorem supplies the shape', { size: 10, color: INK });
    P.text(466, 384, 'for one measurement, someone must assert the shape', { size: 10, color: INK });
    P.text(466, 404, 'a skewed population does not become normal;', { size: 10, color: WARN });
    P.text(466, 420, 'its average does', { size: 10, color: WARN });
  }
};

/* ---------- scene 9: the half-step ---------- */
SCENE_DRAW.approx = function (t, sc) {
  head('The binomial, and the half-step',
    'n = 100, p = 0.5: the bars, the curve, and the boundary');

  var row0 = V.approx.rows[0];
  var x0 = 50, x1 = 430, baseY = 300, topY = 120;
  var dmin = 30, dmax = 70;
  var gx = function (d) { return x0 + (d - dmin) / (dmax - dmin) * (x1 - x0); };
  var vmax = 0.09;

  P.line(x0, baseY, x1, baseY, { stroke: BORDER, sw: 1.2 });
  var i;
  for (i = 30; i <= 70; i += 10) {
    P.line(gx(i), baseY, gx(i), baseY + 4, { stroke: BORDER, sw: 1 });
    label(gx(i) - 6, baseY + 8, String(i), { size: 9, color: FAINT });
  }

  /* the binomial bars */
  for (i = 30; i <= 70; i++) {
    var m = binomPmf(row0.n, i, row0.p);
    var h = (m / vmax) * (baseY - topY);
    var bx = gx(i - 0.5);
    var w = gx(i + 0.5) - bx;
    bar(bx, baseY, w - 1, h, i <= 45 ? INFO : ACCDIM, i <= 45 ? INFO : ACC);
  }
  /* the normal curve */
  curvePlot(x0, topY, x1, baseY, function (d) { return npdf(d, row0.mu, row0.sd); },
    dmin, dmax, vmax, { stroke: BAD, sw: 2 });

  P.text(x0, topY - 16, 'bars: the exact binomial masses; curve: N(50, 25)', { size: 10, color: DIM });

  if (t >= sc.start + 15) {
    P.line(gx(45.5), topY, gx(45.5), baseY, { stroke: BAD, sw: 1.4, dash: [5, 3] });
    label(gx(45.5) - 24, baseY - 6, '45.5', { size: 10, color: BAD });
    P.text(x0, baseY + 26, 'the bar at 45 covers 44.5 to 45.5, so the boundary is 45.5',
      { size: 10, color: BAD });
  }

  /* right column */
  box(446, 74, 426, 150);
  P.text(460, 90, 'P(X at most 45), three routes', { size: 11, bold: true, color: INK });
  row(460, 112, 'exact binomial sum', fx(row0.exact, 6), { rightX: 858, size: 11 });
  row(460, 132, 'normal with the half-step', fx(row0.cc, 6), { rightX: 858, size: 11, rcolor: VAL });
  row(460, 152, 'normal without it', fx(row0.noc, 6), { rightX: 858, size: 11, rcolor: BAD });
  row(460, 176, 'error with the half-step', sci(row0.errcc), { rightX: 858, size: 10 });
  row(460, 194, 'error without it', fx(row0.errnoc, 6), { rightX: 858, size: 10, rcolor: BAD });
  P.text(460, 214, 'mean np = 50, standard deviation root npq = 5', { size: 10, color: DIM });

  if (t >= sc.start + 22.5) {
    box(446, 234, 426, 116);
    P.text(460, 250, 'a skewed case needs the larger n', { size: 11, bold: true, color: INK });
    var r1 = V.approx.rows[1];
    row(460, 272, 'n 25, p 0.2, k 3: exact', fx(r1.exact, 6), { rightX: 858, size: 10 });
    row(460, 290, 'with the half-step', fx(r1.cc, 6), { rightX: 858, size: 10, rcolor: VAL });
    row(460, 308, 'without it', fx(r1.noc, 6), { rightX: 858, size: 10, rcolor: BAD });
    row(460, 330, 'errors', fx(r1.errcc, 4) + ' and ' + fx(r1.errnoc, 4), { rightX: 858, size: 10 });
  }

  if (t >= sc.start + 22.5) {
    box(446, 360, 426, 84);
    P.text(460, 376, 'and the spread of an average', { size: 11, bold: true, color: INK });
    P.text(460, 396, 'standard error = sigma / root n', { size: 11, mono: true, color: INK });
    row(460, 418, 'sigma 10, n 100, so the standard error', fx(V.approx.se.value, 3),
      { rightX: 858, size: 10 });
    row(460, 436, 'not sigma over n', fx(V.approx.seWrong, 3), { rightX: 858, size: 10, rcolor: BAD });
  }
};

/* ---------- scene 10: where the bell stops ---------- */
SCENE_DRAW.limits = function (t, sc) {
  head('Where the bell is not the answer',
    'three distributions with mean 0 and variance 1');

  /* three small pictures across the top-left */
  var panels = [
    { x: 30, title: 'uniform on +-root 3', p: V.limits.uniform.p, kind: 'flat' },
    { x: 160, title: 'two points at +-1', p: V.limits.twoPoint.p, kind: 'two' },
    { x: 290, title: 'standard normal', p: V.limits.normal.p, kind: 'bell' }
  ];
  var py1 = 220, py0 = 130, pw = 110;
  panels.forEach(function (pn) {
    P.line(pn.x, py1, pn.x + pw, py1, { stroke: BORDER, sw: 1 });
    P.text(pn.x, py0 - 26, pn.title, { size: 9, color: DIM });
    if (pn.kind === 'flat') {
      P.rect(pn.x + 12, py0 + 30, pw - 24, 34, { fill: INFO, stroke: INFO, radius: 2 });
    } else if (pn.kind === 'two') {
      bar(pn.x + 16, py1, 16, 60, BAD, BAD);
      bar(pn.x + pw - 32, py1, 16, 60, BAD, BAD);
    } else {
      curvePlot(pn.x, py0, pn.x + pw, py1, function (d) { return phi(d); }, -3.6, 3.6, 0.46,
        { stroke: ACC, sw: 2 });
    }
    P.text(pn.x, py1 + 8, 'P(|X| at most 1)', { size: 9, color: FAINT });
    P.text(pn.x, py1 + 26, fx(pn.p, 4), { size: 12, mono: true, bold: true, color: INK });
  });

  P.text(30, py1 + 54, 'the same mean and the same variance, and three different answers',
    { size: 11, color: WARN });

  /* the mixture */
  if (t >= sc.start + 7.5) {
    box(30, 306, 400, 138);
    P.text(44, 322, 'a symmetric mixture of two normals', { size: 11, bold: true, color: INK });
    P.text(44, 342, 'half at mean -2, half at mean +2, each variance 1', { size: 10, color: DIM });
    row(44, 364, 'mean and median', '0', { rightX: 416, size: 10 });
    row(44, 382, 'variance', String(V.limits.mixture.variance), { rightX: 416, size: 10 });
    row(44, 400, 'modes at -2 and 2', '2 modes', { rightX: 416, size: 10 });
    row(44, 418, 'P(|X| at most 1)', fx(V.limits.mixture.p, 4), { rightX: 416, size: 10, rcolor: WARN });
    row(44, 436, 'the normal gives', fx(V.limits.normal.p, 4), { rightX: 416, size: 10 });
  }

  /* the procedure */
  box(446, 74, 426, 150);
  P.text(460, 90, 'the four steps', { size: 11, bold: true, color: INK });
  P.text(460, 112, '1  write the parameters; root a variance', { size: 10, color: INK });
  P.text(460, 132, '2  subtract the mean, divide by sigma', { size: 10, color: INK });
  P.text(460, 152, '3  decide the tail from the words, then use symmetry', { size: 10, color: INK });
  P.text(460, 172, '4  name the assumption that made the curve normal', { size: 10, color: INK });
  P.text(460, 196, 'Phi is always a left tail', { size: 10, color: ACC });
  P.text(460, 214, 'every band and right tail is a rearrangement of it', { size: 10, color: FAINT });

  if (t >= sc.start + 15) {
    box(446, 234, 426, 106);
    P.text(460, 250, 'a mean of n observations', { size: 11, bold: true, color: INK });
    P.text(460, 270, 'centre mu, spread sigma / root n', { size: 11, mono: true, color: INK });
    row(460, 292, 'sigma 10 with n 100', 'standard error 1', { rightX: 858, size: 10 });
    row(460, 310, 'four times the data', 'half the uncertainty', { rightX: 858, size: 10 });
    P.text(460, 330, 'this is the one place the bell is derived, not assumed', { size: 10, color: FAINT });
  }

  if (t >= sc.start + 22.5) {
    box(446, 350, 426, 94, { fill: WARNDIM, stroke: WARN });
    P.text(460, 366, 'the closing rule', { size: 11, bold: true, color: INK });
    P.text(460, 386, 'a bell shape is not a proof of normality', { size: 10, color: INK });
    P.text(460, 404, 'two moments do not fix a distribution', { size: 10, color: INK });
    P.text(460, 424, 'and Phi(0) = 0.5 is the fastest sanity check you have', { size: 10, color: WARN });
  }
};

/* ---------- dispatch ---------- */

function drawFrame(painter) {
  P = painter;
  var t = K.state.elapsed;
  var i = K.sceneAt(t);
  var sc = K.state.scenes[i];
  P.clear();
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
