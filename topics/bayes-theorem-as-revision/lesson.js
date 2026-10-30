/* ==========================================================================
   bayes-theorem-as-revision — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The drawing code reads V. It performs no probability arithmetic of its own:
   every figure on the canvas was computed once here and checked against the
   rule it is supposed to satisfy — the five-coin posterior, the sum over paths,
   the base-rate table across four prevalences, the odds chain, the sequential
   update to five heads, the three-box posteriors, the two conditional
   directions, the two-box posterior, and the four ways the rule fails.
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

/* ======================================================================
   LAYER 1 - THE MODEL
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}

function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a || 1; }
function frac(n, d) { var g = gcd(n, d); return (n / g) + '/' + (d / g); }
function fx(v, k) { return v.toFixed(k === undefined ? 4 : k); }
function near(a, b, tol) { return Math.abs(a - b) < (tol === undefined ? 1e-12 : tol); }

var V = {};

/* ---------- 1. five coins, one fake, two heads ----------
   Prior 1/5 and 4/5. Likelihood of two heads: 1 under the fake, 1/4 under a
   regular coin. Products 0.20 and 0.20; evidence 0.40; posterior 0.50. */

V.coin = (function () {
  var priorF = 1 / 5, priorR = 4 / 5;
  var likF = 1, likR = 1 / 4;
  var jF = priorF * likF, jR = priorR * likR;
  var ev = jF + jR;
  return {
    priorF: priorF, priorR: priorR, likF: likF, likR: likR,
    jF: jF, jR: jR, ev: ev,
    postF: jF / ev, postR: jR / ev
  };
})();

/* ---------- 2a. the shop's bulbs: the evidence and nothing else ----------
   GATE CSE 2016 Set 2. Equal numbers of two types, so the prior is 1/2 each.
   The answer is the sum, with no division afterwards. */

V.led = (function () {
  var prior = 0.5, p1 = 0.7, p2 = 0.4;
  var part1 = prior * p1, part2 = prior * p2;
  return { prior: prior, p1: p1, p2: p2, part1: part1, part2: part2, ev: part1 + part2 };
})();

/* ---------- 2b. the noisy channel: the same sum, then a posterior ----------
   GATE CSE 2021 Set 1 Q54. Sent H with 0.1, L with 0.9; received H with 0.3
   given H, and 0.8 given L. Paths 0.03 and 0.72; evidence 0.75; posteriors
   0.04 and 0.96. */

V.signal = (function () {
  var pH = 0.1, pL = 0.9, lHH = 0.3, lLH = 0.8;
  var jH = pH * lHH, jL = pL * lLH;
  var ev = jH + jL;
  return {
    pH: pH, pL: pL, lHH: lHH, lLH: lLH,
    jH: jH, jL: jL, ev: ev, postH: jH / ev, postL: jL / ev
  };
})();

/* ---------- 3. the base rate ----------
   Prevalence 1 per cent, sensitivity and specificity both 99 per cent.
   The same test at four prevalences, to show which input moves the answer. */

V.test = (function () {
  var prev = 0.01, sens = 0.99, spec = 0.99;
  var tp = prev * sens, fp = (1 - prev) * (1 - spec);
  var pop = 10000;
  var ill = pop * prev, healthy = pop - ill;
  var illPos = ill * sens, healthyPos = healthy * (1 - spec);
  var table = [0.001, 0.01, 0.1, 0.5].map(function (p) {
    var a = p * sens, b = (1 - p) * (1 - spec);
    return { prev: p, post: a / (a + b) };
  });
  return {
    prev: prev, sens: sens, spec: spec, tp: tp, fp: fp, post: tp / (tp + fp),
    pop: pop, ill: ill, healthy: healthy, illPos: illPos, healthyPos: healthyPos,
    postFromCounts: illPos / (illPos + healthyPos),
    table: table
  };
})();

/* ---------- 4. the odds form ----------
   Prior odds 1:4, likelihood ratio 1 / (1/4) = 4, posterior odds 1:1. */

V.odds = (function () {
  var priorOdds = V.coin.priorF / V.coin.priorR;      /* 1/4 */
  var lr = V.coin.likF / V.coin.likR;                 /* 4 */
  var postOdds = priorOdds * lr;                      /* 1 */
  return {
    priorOdds: priorOdds, lr: lr, postOdds: postOdds,
    post: postOdds / (1 + postOdds),
    priorPart: V.coin.priorF, postPart: postOdds / (1 + postOdds)
  };
})();

/* ---------- 5. sequential updating ----------
   One head at a time on the same coin, then the batch formula for k heads.
   The two must agree at every k, which is what makes the split legal. */

V.seq = (function () {
  var priorF = 1 / 5, likHeadF = 1, likHeadR = 0.5;
  var chain = [priorF];
  var p = priorF;
  for (var step = 0; step < 5; step++) {
    var jF = p * likHeadF, jR = (1 - p) * likHeadR;
    p = jF / (jF + jR);
    chain.push(p);
  }
  var rows = [];
  for (var k = 0; k <= 5; k++) {
    var batch = priorF / (priorF + (1 - priorF) * Math.pow(0.5, k));
    var oddsNum = Math.pow(2, k);                    /* odds 2^k : 4 */
    rows.push({
      k: k, post: batch,
      odds: oddsNum + ' : 4',
      simpleOdds: (oddsNum / 4 >= 1)
        ? (oddsNum / 4) + ' : 1'
        : '1 : ' + (4 / oddsNum)
    });
  }
  /* the chain must equal the batch formula at every k, not only at k = 2 */
  var chainMatch = rows.every(function (r) { return near(r.post, chain[r.k], 1e-12); });
  return {
    chain: chain, rows: rows, chainMatch: chainMatch,
    likHeadF: likHeadF, likHeadR: likHeadR, lr: likHeadF / likHeadR
  };
})();

/* ---------- 6. three boxes, one white ball ----------
   GATE DA 2025. Priors 1/2, 1/6, 1/3; likelihoods 1/3, 2/3, 1/2.
   Products 1/6, 1/9, 1/6; evidence 4/9; posteriors 3/8, 1/4, 3/8. */

V.boxes = (function () {
  var raw = [
    { name: 'Box 1', prior: 1 / 2, lik: 1 / 3 },
    { name: 'Box 2', prior: 1 / 6, lik: 2 / 3 },
    { name: 'Box 3', prior: 1 / 3, lik: 1 / 2 }
  ];
  var ev = 0;
  raw.forEach(function (r) { r.joint = r.prior * r.lik; ev += r.joint; });
  raw.forEach(function (r) { r.post = r.joint / ev; });
  var maxLik = 0, maxPost = 0;
  raw.forEach(function (r, i) {
    if (r.lik > raw[maxLik].lik) maxLik = i;
    if (r.post > raw[maxPost].post) maxPost = i;
  });
  return { rows: raw, ev: ev, maxLik: maxLik, maxPost: maxPost };
})();

/* ---------- 7. both conditional directions ----------
   GATE CSE 2017 Set 2 Q26. P(P) = 1/4, P(P|Q) = 1/2, P(Q|P) = 1/3.
   Joint 1/12; P(Q) = 1/6; union 1/3; answer P(P'|Q') = 4/5. */

V.job = (function () {
  var pP = 1 / 4, pPgivenQ = 1 / 2, pQgivenP = 1 / 3;
  var joint = pQgivenP * pP;                 /* 1/12 */
  var pQ = joint / pPgivenQ;                 /* 1/6 */
  var union = pP + pQ - joint;               /* 1/3 */
  var pQc = 1 - pQ;                          /* 5/6 */
  var pNeither = 1 - union;                  /* 2/3 */
  return {
    pP: pP, pPgivenQ: pPgivenQ, pQgivenP: pQgivenP,
    joint: joint, pQ: pQ, union: union, pQc: pQc, pNeither: pNeither,
    answer: pNeither / pQc
  };
})();

/* ---------- 8. two boxes, one red ball ----------
   GATE CSE 2005 Q51. Priors 1/3, 2/3; likelihoods 2/5, 3/4.
   Paths 2/15 and 1/2; evidence 19/30; posterior 4/19. Drop a box and the
   posterior becomes 1, which is the failure the arithmetic cannot detect. */

V.twobox = (function () {
  var priors = [1 / 3, 2 / 3], liks = [2 / 5, 3 / 4];
  var joints = [priors[0] * liks[0], priors[1] * liks[1]];
  var ev = joints[0] + joints[1];
  var posts = [joints[0] / ev, joints[1] / ev];
  var dropped = joints[0] / joints[0];
  return {
    priors: priors, liks: liks, joints: joints, ev: ev, posts: posts,
    dropped: dropped
  };
})();

/* ---------- 9. a hypothesis left out of the sum ----------
   Three hypotheses, only two summed: the posterior is inflated by evAll/evTwo
   while the posteriors still add to one. */

V.gap = (function () {
  var priors = [0.5, 0.3, 0.2], liks = [0.5, 0.2, 0.4];
  var j = priors.map(function (p, i) { return p * liks[i]; });
  var evAll = j[0] + j[1] + j[2];
  var evTwo = j[0] + j[1];
  return {
    priors: priors, liks: liks, joints: j,
    evAll: evAll, evTwo: evTwo,
    postAll: j[0] / evAll, postTwo: j[0] / evTwo,
    inflation: evAll / evTwo
  };
})();

/* ---------- 10. the two limits that have no number ---------- */

V.limits = (function () {
  var zeroDen = 0 / 0;                        /* NaN, deliberately */
  var honest = V.seq.chain[1];                /* one head, entered once */
  var doubled = V.seq.chain[2];               /* the same head, entered twice */
  return { zeroDen: zeroDen, isNaN: isNaN(zeroDen), honest: honest, doubled: doubled };
})();

/* ======================================================================
   LAYER 2 - THE CHECKS. Each one re-derives a figure a second way.
   ====================================================================== */

chk('the fake coin prior is one fifth', near(V.coin.priorF, 0.2), fx(V.coin.priorF));
chk('the regular coin prior is four fifths', near(V.coin.priorR, 0.8), fx(V.coin.priorR));
chk('the two priors add to one', near(V.coin.priorF + V.coin.priorR, 1), 'sum = 1');
chk('the fake path weighs 0.20', near(V.coin.jF, 0.2), fx(V.coin.jF));
chk('the regular path weighs 0.20', near(V.coin.jR, 0.2), fx(V.coin.jR));
chk('the evidence is 0.40', near(V.coin.ev, 0.4), fx(V.coin.ev));
chk('the posterior is exactly one half', near(V.coin.postF, 0.5), fx(V.coin.postF));
chk('the two posteriors add to one', near(V.coin.postF + V.coin.postR, 1), 'sum = 1');

chk('the bulb parts are 0.35 and 0.20', near(V.led.part1, 0.35) && near(V.led.part2, 0.20),
  fx(V.led.part1) + ' and ' + fx(V.led.part2));
chk('the bulb evidence is 0.55', near(V.led.ev, 0.55), fx(V.led.ev));

chk('the channel paths are 0.03 and 0.72', near(V.signal.jH, 0.03) && near(V.signal.jL, 0.72),
  fx(V.signal.jH) + ' and ' + fx(V.signal.jL));
chk('the channel evidence is 0.75', near(V.signal.ev, 0.75), fx(V.signal.ev));
chk('the channel posterior is 0.04', near(V.signal.postH, 0.04), fx(V.signal.postH));
chk('the channel posteriors add to one', near(V.signal.postH + V.signal.postL, 1), 'sum = 1');

chk('the true positive weight is 0.0099', near(V.test.tp, 0.0099), fx(V.test.tp));
chk('the false positive weight equals the true positive weight',
  near(V.test.fp, V.test.tp), fx(V.test.fp));
chk('the base-rate posterior is one half', near(V.test.post, 0.5), fx(V.test.post));
chk('the population of 10,000 splits into 100 and 9,900',
  V.test.ill === 100 && V.test.healthy === 9900, V.test.ill + ' and ' + V.test.healthy);
chk('99 ill people and 99 healthy people test positive',
  near(V.test.illPos, 99) && near(V.test.healthyPos, 99),
  fx(V.test.illPos, 2) + ' and ' + fx(V.test.healthyPos, 2));
chk('counting people gives the same posterior as the formula',
  near(V.test.postFromCounts, V.test.post), fx(V.test.postFromCounts));
chk('the prevalence table is strictly increasing',
  V.test.table.every(function (r, i) { return i === 0 || r.post > V.test.table[i - 1].post; }),
  V.test.table.map(function (r) { return fx(r.post, 3); }).join(', '));
chk('the prevalence table starts at 0.0902', near(V.test.table[0].post, 0.0902, 1e-4),
  fx(V.test.table[0].post));

chk('the prior odds are one to four', near(V.odds.priorOdds, 0.25), fx(V.odds.priorOdds));
chk('the likelihood ratio is four', near(V.odds.lr, 4), fx(V.odds.lr));
chk('the posterior odds are one to one', near(V.odds.postOdds, 1), fx(V.odds.postOdds));
chk('the odds form reproduces the fraction form', near(V.odds.post, V.coin.postF),
  fx(V.odds.post));

chk('one head moves the belief to one third', near(V.seq.chain[1], 1 / 3), fx(V.seq.chain[1]));
chk('two heads move it to one half', near(V.seq.chain[2], 0.5), fx(V.seq.chain[2]));
chk('the sequential chain equals the batch formula at every k', V.seq.chainMatch,
  'six values agree');
chk('the posterior rises with every head',
  V.seq.rows.every(function (r, i) { return i === 0 || r.post > V.seq.rows[i - 1].post; }),
  V.seq.rows.map(function (r) { return fx(r.post, 3); }).join(', '));

chk('the three box products are 1/6, 1/9 and 1/6',
  near(V.boxes.rows[0].joint, 1 / 6) && near(V.boxes.rows[1].joint, 1 / 9) &&
  near(V.boxes.rows[2].joint, 1 / 6), 'products');
chk('the three-box evidence is 4/9', near(V.boxes.ev, 4 / 9), fx(V.boxes.ev));
chk('the three-box posteriors add to one',
  near(V.boxes.rows.reduce(function (s, r) { return s + r.post; }, 0), 1), 'sum = 1');
chk('the largest likelihood is not the largest posterior', V.boxes.maxLik !== V.boxes.maxPost,
  'box ' + (V.boxes.maxLik + 1) + ' against box ' + (V.boxes.maxPost + 1));

chk('the job joint is 1/12', near(V.job.joint, 1 / 12), fx(V.job.joint));
chk('Q applies with 1/6', near(V.job.pQ, 1 / 6), fx(V.job.pQ));
chk('the union is 1/3', near(V.job.union, 1 / 3), fx(V.job.union));
chk('the job answer is 4/5', near(V.job.answer, 0.8), fx(V.job.answer));

chk('the two-box evidence is 19/30', near(V.twobox.ev, 19 / 30), fx(V.twobox.ev));
chk('the two-box posterior is 4/19', near(V.twobox.posts[0], 4 / 19), fx(V.twobox.posts[0]));
chk('the two-box posteriors add to one',
  near(V.twobox.posts[0] + V.twobox.posts[1], 1), 'sum = 1');
chk('dropping a hypothesis makes the posterior certain', near(V.twobox.dropped, 1),
  fx(V.twobox.dropped));

chk('the full evidence is 0.39 and the partial evidence 0.31',
  near(V.gap.evAll, 0.39) && near(V.gap.evTwo, 0.31),
  fx(V.gap.evAll) + ' and ' + fx(V.gap.evTwo));
chk('omitting a hypothesis inflates the posterior', V.gap.postTwo > V.gap.postAll,
  fx(V.gap.postAll) + ' becomes ' + fx(V.gap.postTwo));
chk('the inflation factor is 39/31', near(V.gap.inflation, 39 / 31), fx(V.gap.inflation));

chk('zero evidence leaves the posterior undefined', V.limits.isNaN === true, '0/0 is not a number');
chk('entering one head twice overstates the belief',
  near(V.limits.honest, 1 / 3) && near(V.limits.doubled, 0.5),
  fx(V.limits.honest) + ' against ' + fx(V.limits.doubled));

/* ======================================================================
   LAYER 3 - RENDER. One function per scene; each reads V only.
   ====================================================================== */

function head(title, sub) {
  P.text(28, 22, title, { size: 17, bold: true, color: INK });
  if (sub) P.text(28, 46, sub, { size: 12, color: DIM });
}

function box(x, y, w, h, o) {
  o = o || {};
  P.rect(x, y, w, h, { fill: o.fill || SURF2, stroke: o.stroke || BORDER, radius: 8, sw: 1.2 });
}

function label(x, y, s, o) { P.text(x, y, s, o || { size: 11, color: FAINT }); }

function progressOf(t, sc, from, span) {
  return K.clamp01((t - (sc.start + from)) / span);
}

var SCENE_DRAW = {};

/* ---------- scene 1: the three inputs and the output ---------- */
SCENE_DRAW.revision = function (t, sc) {
  head('A belief meets evidence and is revised',
    'five coins, one fake; two heads seen; prior 0.20 becomes posterior 0.50');

  var step = progressOf(t, sc, 0, 14);
  var done = progressOf(t, sc, 14, 10);

  var bw = 190, gap = 22, y0 = 100, bh = 96;
  var cards = [
    ['prior  P(fake)', fx(V.coin.priorF, 2), 'one coin in five'],
    ['likelihood  P(HH | fake)', fx(V.coin.likF, 2), 'certain under the fake'],
    ['evidence  P(HH)', fx(V.coin.ev, 2), '0.20 + 0.20 over both'],
    ['posterior  P(fake | HH)', fx(V.coin.postF, 2), 'the revised belief']
  ];

  cards.forEach(function (c, i) {
    if (step * 4 < i + 0.3) return;
    var x = 34 + i * (bw + gap);
    var last = i === 3;
    box(x, y0, bw, bh, { fill: last ? ACCDIM : SURF2, stroke: last ? ACC : BORDER });
    label(x + 14, y0 + 20, c[0], { size: 11, color: FAINT });
    P.text(x + 14, y0 + 52, c[1], { size: 22, bold: true, color: last ? ACC : INK });
    P.text(x + 14, y0 + 82, c[2], { size: 10, color: DIM });
  });

  if (step > 0.55) {
    for (var i = 0; i < 3; i++) {
      var ax = 34 + i * (bw + gap) + bw + 3;
      P.arrow(ax, y0 + bh / 2, ax + gap - 6, y0 + bh / 2, { stroke: FAINT, sw: 1.4, head: 7 });
    }
  }

  if (done > 0) {
    P.text(34, 232, 'posterior  =  prior  x  likelihood  /  evidence', { size: 16, bold: true, color: INK });
    P.text(34, 272, fx(V.coin.priorF, 2) + ' x ' + fx(V.coin.likF, 2) +
      ' / ' + fx(V.coin.ev, 2) + ' = ' + fx(V.coin.postF, 2),
      { size: 20, bold: true, color: ACC });
  }
  if (done > 0.4) {
    P.text(34, 306, 'the three inputs are given; the fourth is what the theorem computes',
      { size: 12, color: DIM });
  }
  if (done > 0.7) {
    box(34, 326, 832, 106, { fill: SURF2, stroke: BORDER });
    P.text(48, 352, 'the posterior is a legitimate prior for the next observation', { size: 12, color: INK });
    P.text(48, 378, 'so a sequence of observations is handled one at a time', { size: 12, color: INK });
    P.text(48, 404, 'and the order of the observations never changes the final answer', { size: 12, color: INK });
  }
};

/* ---------- scene 2: the denominator is a sum ---------- */
SCENE_DRAW.denominator = function (t, sc) {
  head('The evidence is a sum over the hypotheses',
    'the shop bulbs give the sum alone; the noisy channel divides by it');

  var step = progressOf(t, sc, 0, 14);
  var done = progressOf(t, sc, 14, 10);

  label(34, 84, 'the evidence, computed for its own sake');
  P.text(34, 116, 'Type 1:  0.5 x 0.7 = ' + fx(V.led.part1, 2), { size: 13, color: INK });
  P.text(34, 144, 'Type 2:  0.5 x 0.4 = ' + fx(V.led.part2, 2), { size: 13, color: INK });
  P.line(34, 162, 420, 162, { stroke: BORDER, sw: 1 });
  if (step > 0.2) {
    P.text(34, 188, 'P(lifetime over 100 h) = ' + fx(V.led.ev, 2), { size: 14, bold: true, color: ACC });
    P.text(34, 214, 'GATE CSE 2016 Set 2 asks only for this sum', { size: 11, color: DIM });
  }

  label(470, 84, 'the same sum, with a posterior at the end');
  if (step > 0.35) {
    P.text(470, 116, 'sent H, prior ' + fx(V.signal.pH, 2), { size: 12, color: INK });
    P.text(470, 144, 'sent L, prior ' + fx(V.signal.pL, 2), { size: 12, color: INK });
    P.text(620, 116, 'x 0.3 = ' + fx(V.signal.jH, 2), { size: 12, color: ACC });
    P.text(620, 144, 'x 0.8 = ' + fx(V.signal.jL, 2), { size: 12, color: ACC });
  }
  if (step > 0.6) {
    P.text(470, 186, 'P(received H) = ' + fx(V.signal.jH, 2) + ' + ' + fx(V.signal.jL, 2) +
      ' = ' + fx(V.signal.ev, 2), { size: 13, bold: true, color: INK });
  }
  if (done > 0) {
    P.text(470, 216, 'P(sent H | received H) = ' + fx(V.signal.jH, 2) + ' / ' +
      fx(V.signal.ev, 2) + ' = ' + fx(V.signal.postH, 2), { size: 13, bold: true, color: ACC });
    P.text(470, 244, 'the other posterior is ' + fx(V.signal.jL, 2) + ' / ' + fx(V.signal.ev, 2) +
      ' = ' + fx(V.signal.postL, 2), { size: 12, color: DIM });
    P.text(470, 268, '0.04 + 0.96 = 1', { size: 12, color: VAL });
  }

  if (done > 0.5) {
    box(34, 296, 832, 134, { fill: SURF2, stroke: BORDER });
    P.text(48, 322, 'Every hypothesis contributes exactly one path.', { size: 12, color: INK });
    P.text(48, 348, 'The evidence is the total weight of the paths that produce what you saw.', { size: 12, color: INK });
    P.text(48, 374, 'Miss one path and the denominator is too small, so every posterior is too large.', { size: 12, color: WARN });
    P.text(48, 400, 'The same 0.75 divides every path, which is why the posteriors add to one.', { size: 12, color: DIM });
  }
};

/* ---------- scene 3: the base rate ---------- */
SCENE_DRAW.baserate = function (t, sc) {
  head('A 99 per cent accurate test, and a posterior of one half',
    'prevalence 1 in 100; sensitivity 0.99; specificity 0.99');

  var step = progressOf(t, sc, 0, 14);
  var done = progressOf(t, sc, 14, 10);

  var inputs = [
    ['prevalence', '1 in 100'],
    ['sensitivity', '0.99'],
    ['specificity', '0.99']
  ];
  inputs.forEach(function (c, i) {
    if (step * 3 < i + 0.3) return;
    var x = 34 + i * 296;
    box(x, 82, 262, 64, { fill: SURF2, stroke: BORDER });
    label(x + 14, 104, c[0]);
    P.text(x + 14, 130, c[1], { size: 17, bold: true, color: INK });
  });

  if (step > 0.45) {
    P.text(34, 172, 'the same test applied to 10,000 people', { size: 13, bold: true, color: INK });
    box(34, 190, 400, 92, { fill: SURF2, stroke: BORDER });
    P.text(48, 214, '100 are ill', { size: 13, bold: true, color: INK });
    P.text(48, 240, '99 test positive', { size: 12, color: ACC });
    P.text(48, 262, '1 tests negative', { size: 12, color: DIM });

    box(470, 190, 400, 92, { fill: SURF2, stroke: BORDER });
    P.text(484, 214, '9,900 are healthy', { size: 13, bold: true, color: INK });
    P.text(484, 240, '99 test positive', { size: 12, color: WARN });
    P.text(484, 262, '9,801 test negative', { size: 12, color: DIM });
  }

  if (done > 0) {
    label(34, 296, 'true positives');
    label(470, 296, 'false positives');
    P.rect(34, 316, 240, 22, { fill: ACCDIM, stroke: ACC, radius: 4, sw: 1 });
    P.rect(470, 316, 240, 22, { fill: WARNDIM, stroke: WARN, radius: 4, sw: 1 });
    P.text(154, 328, '99', { size: 12, color: INK, align: 'center', base: 'middle' });
    P.text(590, 328, '99', { size: 12, color: INK, align: 'center', base: 'middle' });
  }
  if (done > 0.4) {
    P.text(34, 360, '99 / (99 + 99) = ' + fx(V.test.post, 2), { size: 18, bold: true, color: ACC });
    P.text(34, 392, 'the naive answer 0.99 counts only the left column', { size: 12, color: DIM });
  }
  if (done > 0.7) {
    P.text(34, 418, 'prevalence 0.1% gives 0.090, 1% gives 0.500, 10% gives 0.917, 50% gives 0.990',
      { size: 11, color: INFO });
  }
};

/* ---------- scene 4: the odds form ---------- */
SCENE_DRAW.odds = function (t, sc) {
  head('The odds form: one multiplication per observation',
    'prior odds 1 to 4, likelihood ratio 4, posterior odds 1 to 1');

  var step = progressOf(t, sc, 0, 14);
  var done = progressOf(t, sc, 14, 10);

  label(34, 84, 'prior odds, fake against regular');
  P.rect(34, 100, 832, 34, { fill: SURF2, stroke: BORDER, radius: 6, sw: 1.2 });
  if (step > 0.15) {
    P.rect(34, 100, 166, 34, { fill: ACCDIM, stroke: ACC, radius: 6, sw: 1.2 });
    P.text(117, 122, 'fake, 1 part', { size: 11, color: INK, align: 'center', base: 'middle' });
    P.text(533, 122, 'regular, 4 parts', { size: 11, color: INK, align: 'center', base: 'middle' });
  }
  if (step > 0.3) {
    P.text(34, 160, 'prior odds = 0.20 : 0.80 = 1 : 4', { size: 13, color: INK });
  }
  if (step > 0.5) {
    P.text(34, 196, 'likelihood ratio = P(HH | fake) / P(HH | regular) = 1 / 0.25 = 4',
      { size: 13, color: INK });
    P.text(34, 232, 'posterior odds = 4 x (1 : 4) = 4 : 4 = 1 : 1', { size: 13, bold: true, color: ACC });
  }
  if (done > 0) {
    P.rect(34, 254, 832, 34, { fill: SURF2, stroke: BORDER, radius: 6, sw: 1.2 });
    P.rect(34, 254, 416, 34, { fill: ACCDIM, stroke: ACC, radius: 6, sw: 1.2 });
    P.text(242, 276, 'fake, 1 part', { size: 11, color: INK, align: 'center', base: 'middle' });
    P.text(658, 276, 'regular, 1 part', { size: 11, color: INK, align: 'center', base: 'middle' });
    P.text(34, 316, 'p = o / (1 + o) = 1 / 2 = ' + fx(V.odds.post, 2), { size: 18, bold: true, color: ACC });
    P.text(34, 352, 'the odds form multiplies where the fraction form divides', { size: 12, color: DIM });
  }
  if (done > 0.6) {
    box(34, 374, 832, 66, { fill: WARNDIM, stroke: WARN });
    P.text(48, 398, 'one likelihood ratio per observation; multiply them only if the observations are',
      { size: 12, color: INK });
    P.text(48, 420, 'independent given the hypothesis', { size: 12, color: INK });
  }
};

/* ---------- scene 5: one observation at a time ---------- */
SCENE_DRAW.sequential = function (t, sc) {
  head('Updating one observation at a time',
    'each head doubles the odds: 1 to 4, then 1 to 2, then 1 to 1');

  var step = progressOf(t, sc, 0, 14);
  var done = progressOf(t, sc, 14, 10);

  var bw = 232, y0 = 90, bh = 92;
  var cards = [
    ['prior', fx(V.seq.chain[0], 3), 'odds 1 : 4'],
    ['after one head', fx(V.seq.chain[1], 3), 'odds 1 : 2'],
    ['after two heads', fx(V.seq.chain[2], 3), 'odds 1 : 1']
  ];
  cards.forEach(function (c, i) {
    if (step * 3 < i + 0.3) return;
    var x = 34 + i * 272;
    var last = i === 2;
    box(x, y0, bw, bh, { fill: last ? ACCDIM : SURF2, stroke: last ? ACC : BORDER });
    label(x + 14, y0 + 22, c[0]);
    P.text(x + 14, y0 + 52, c[1], { size: 22, bold: true, color: last ? ACC : INK });
    P.text(x + 14, y0 + 78, c[2], { size: 11, color: DIM });
  });
  if (step > 0.6) {
    P.arrow(270, 136, 302, 136, { stroke: FAINT, sw: 1.4, head: 7 });
    P.arrow(542, 136, 574, 136, { stroke: FAINT, sw: 1.4, head: 7 });
    P.text(286, 116, 'x 2', { size: 11, color: ACC, align: 'center' });
    P.text(558, 116, 'x 2', { size: 11, color: ACC, align: 'center' });
  }

  if (step > 0.5) {
    P.text(34, 210, 'each head multiplies the odds by P(head | fake) / P(head | regular) = 1 / 0.5 = 2',
      { size: 12, color: INK });
  }

  if (done > 0) {
    label(34, 240, 'heads seen');
    label(200, 240, 'posterior P(fake | k heads)');
    label(470, 240, 'odds after k heads');
    V.seq.rows.forEach(function (r) {
      var y = 266 + r.k * 26;
      P.text(34, y, 'k = ' + r.k, { size: 12, color: INK, mono: true });
      P.text(200, y, fx(r.post, 3), { size: 12, color: ACC, mono: true });
      P.text(470, y, r.simpleOdds, { size: 12, color: DIM, mono: true });
    });
  }
  if (done > 0.5) {
    P.text(34, 424, 'GATE CSE 2025 Set 1 asks for k = 2, and the answer is ' + fx(V.seq.rows[2].post, 2),
      { size: 11, color: DIM });
  }
};

/* ---------- scene 6: three hypotheses ---------- */
SCENE_DRAW.multi = function (t, sc) {
  head('Three hypotheses, and the largest likelihood loses',
    'priors 1/2, 1/6, 1/3; likelihoods 1/3, 2/3, 1/2; evidence 4/9');

  var step = progressOf(t, sc, 0, 14);
  var done = progressOf(t, sc, 14, 10);

  label(34, 92, 'box');
  label(150, 92, 'prior');
  label(300, 92, 'P(white | box)');
  label(520, 92, 'prior x likelihood');
  label(740, 92, 'posterior');

  V.boxes.rows.forEach(function (r, i) {
    if (step * 3 < i + 0.3) return;
    var y = 124 + i * 36;
    P.text(34, y, r.name, { size: 13, color: INK, bold: true });
    P.text(150, y, frac(Math.round(r.prior * 6), 6), { size: 13, color: DIM, mono: true });
    P.text(300, y, frac(Math.round(r.lik * 6), 6), { size: 13, color: DIM, mono: true });
    P.text(520, y, frac(Math.round(r.joint * 18), 18), { size: 13, color: DIM, mono: true });
    P.text(740, y, frac(Math.round(r.post * 8), 8), { size: 13, color: ACC, bold: true, mono: true });
  });

  if (done > 0) {
    P.line(34, 226, 866, 226, { stroke: BORDER, sw: 1 });
    P.text(34, 250, 'evidence = 1/6 + 1/9 + 1/6 = ' + frac(4, 9), { size: 14, bold: true, color: INK });
    P.text(34, 280, 'posteriors 3/8 + 1/4 + 3/8 = 1', { size: 12, color: VAL });
    P.text(34, 312, 'Box 2 has the largest likelihood, 2/3, and the smallest posterior, 1/4.',
      { size: 13, color: INK });
    P.text(34, 340, 'Box 1 has the smallest likelihood, 1/3, and ties for the largest posterior.',
      { size: 13, color: INK });
  }
  if (done > 0.6) {
    box(34, 362, 832, 78, { fill: WARNDIM, stroke: WARN });
    P.text(48, 388, 'rank hypotheses by prior times likelihood, never by likelihood alone',
      { size: 12, color: INK });
    P.text(48, 412, 'box 2 was the least likely box to have been chosen, and that is what decided it',
      { size: 12, color: INK });
  }
};

/* ---------- scene 7: the two conditional directions ---------- */
SCENE_DRAW.swap = function (t, sc) {
  head('P(A given B) is not P(B given A)',
    'GATE CSE 2017 Set 2: one joint, two denominators, one answer');

  var step = progressOf(t, sc, 0, 14);
  var done = progressOf(t, sc, 14, 10);

  label(34, 84, 'given in the question');
  P.text(34, 112, 'P(P applies) = 1/4', { size: 13, color: INK });
  P.text(34, 140, 'P(P | Q) = 1/2', { size: 13, color: INK });
  P.text(34, 168, 'P(Q | P) = 1/3', { size: 13, color: INK });
  if (step > 0.3) {
    P.text(34, 202, 'both conditionals hold the same joint', { size: 11, color: DIM });
    P.text(34, 228, 'P(P and Q) = (1/3)(1/4) = 1/12', { size: 13, bold: true, color: ACC });
    P.text(34, 258, 'P(Q) = (1/12) / (1/2) = 1/6', { size: 13, color: INK });
  }
  if (step > 0.6) {
    P.text(34, 290, 'so P(P | Q) = 1/2 but P(Q | P) = 1/3', { size: 12, color: WARN });
  }

  label(470, 84, 'what the question asks');
  if (done > 0) {
    P.text(470, 112, 'P(P\u2019 | Q\u2019) = P(P\u2019 and Q\u2019) / P(Q\u2019)', { size: 13, color: INK });
    P.text(470, 142, 'P(P or Q) = 1/4 + 1/6 - 1/12 = 1/3', { size: 12, color: DIM });
    P.text(470, 168, 'P(P\u2019 and Q\u2019) = 1 - 1/3 = 2/3', { size: 12, color: DIM });
    P.text(470, 194, 'P(Q\u2019) = 1 - 1/6 = 5/6', { size: 12, color: DIM });
    P.text(470, 232, '(2/3) / (5/6) = ' + frac(4, 5), { size: 20, bold: true, color: ACC });
    P.text(470, 266, 'the answer, and neither of the two given conditionals', { size: 11, color: DIM });
  }

  if (done > 0.5) {
    box(34, 310, 832, 122, { fill: SURF2, stroke: BORDER });
    P.text(48, 336, 'P(A | B) and P(B | A) share the numerator P(A and B).', { size: 12, color: INK });
    P.text(48, 362, 'They differ in the denominator: P(B) against P(A).', { size: 12, color: INK });
    P.text(48, 388, 'Here the denominators are 1/6 and 1/4, so the two numbers differ.', { size: 12, color: INK });
    P.text(48, 414, 'Swapping the condition is the commonest lost mark in this topic.', { size: 12, color: WARN });
  }
};

/* ---------- scene 8: a hypothesis left out ---------- */
SCENE_DRAW.missing = function (t, sc) {
  head('A hypothesis left out of the sum',
    'GATE CSE 2005: two boxes, one red ball, posterior 4/19');

  var step = progressOf(t, sc, 0, 14);
  var done = progressOf(t, sc, 14, 10);

  label(34, 84, 'two boxes, one red ball');
  if (step > 0.2) {
    P.text(34, 114, 'box P: chosen 1/3, red 2/5, path ' + frac(2, 15), { size: 13, color: INK });
    P.text(34, 142, 'box Q: chosen 2/3, red 3/4, path ' + frac(1, 2), { size: 13, color: INK });
    P.text(34, 178, 'evidence = 2/15 + 1/2 = ' + frac(19, 30), { size: 14, bold: true, color: INK });
  }
  if (step > 0.55) {
    P.text(34, 212, 'P(P | red) = (2/15) / (19/30) = ' + frac(4, 19), { size: 16, bold: true, color: ACC });
    P.text(34, 246, 'P(Q | red) = (1/2) / (19/30) = ' + frac(15, 19), { size: 12, color: DIM });
    P.text(34, 272, '4/19 + 15/19 = 1', { size: 12, color: VAL });
  }
  if (done > 0) {
    box(34, 298, 832, 142, { fill: WARNDIM, stroke: WARN });
    P.text(48, 324, 'Drop box Q from the denominator: (2/15) / (2/15) = ' + fx(V.twobox.dropped, 0) + '.',
      { size: 12, color: INK });
    P.text(48, 350, 'Every posterior becomes certain, and the remaining ones still add to one.', { size: 12, color: INK });
    P.text(48, 376, 'The hypotheses must be disjoint: no ball is drawn from two boxes.', { size: 12, color: INK });
    P.text(48, 402, 'They must be exhaustive: every way of drawing red appears in the sum.', { size: 12, color: INK });
  }
};

/* ---------- scene 9: the procedure ---------- */
SCENE_DRAW.procedure = function (t, sc) {
  head('The five steps, in order',
    'and the two places a correct-looking answer goes wrong');

  var step = progressOf(t, sc, 0, 14);
  var done = progressOf(t, sc, 14, 10);

  var steps = [
    'name the hypotheses, and check that they partition the sample space',
    'write each prior, and the likelihood of the evidence under it',
    'multiply, then add the products: that sum is the evidence',
    'divide the product for the hypothesis you want by that sum',
    'check the posteriors add to one, and re-read the direction asked'
  ];
  steps.forEach(function (s, i) {
    if (step * 5 < i + 0.3) return;
    var y = 88 + i * 56;
    P.circle(52, y + 14, 15, { fill: ACC, stroke: ACC });
    P.text(52, y + 15, String(i + 1), { size: 12, color: '#ffffff', align: 'center', base: 'middle', bold: true });
    P.text(78, y + 19, s, { size: 12, color: INK });
  });

  if (done > 0) {
    box(34, 348, 832, 92, { fill: WARNDIM, stroke: WARN });
    P.text(48, 374, 'traps: a hypothesis left out of the sum; the prior dropped from the numerator;',
      { size: 12, color: INK });
    P.text(48, 398, 'the likelihood reported as the posterior; the two conditional directions swapped.',
      { size: 12, color: INK });
    P.text(48, 422, 'each of the four produces a number that looks like an answer', { size: 12, color: INK });
  }
};

/* ---------- scene 10: where the rule stops ---------- */
SCENE_DRAW.limits = function (t, sc) {
  head('Where the rule stops applying',
    'four limits, each one of the conditions written into the theorem');

  var step = progressOf(t, sc, 0, 14);
  var done = progressOf(t, sc, 14, 10);

  var cards = [
    ['evidence impossible everywhere', 'denominator 0, posterior 0/0', 'no revision is defined', 'P(E) above 0 is part of the rule'],
    ['hypotheses that overlap', 'one outcome, two paths', 'the evidence is over-counted', 'posteriors pulled to the overlap'],
    ['the same observation twice', '0.500 where the truth is 0.333', 'likelihoods multiplied wrongly', 'needs conditional independence'],
    ['the prior is an input', 'the theorem does not choose it', 'it revises what you supply', 'changing it changes the answer']
  ];
  var pos = [[34, 84], [462, 84], [34, 254], [462, 254]];
  cards.forEach(function (c, i) {
    if (step * 4 < i + 0.3) return;
    var x = pos[i][0], y = pos[i][1];
    box(x, y, 404, 150, { fill: SURF2, stroke: BORDER });
    P.text(x + 16, y + 24, c[0], { size: 12, bold: true, color: INK });
    P.text(x + 16, y + 54, c[1], { size: 11, color: ACC });
    P.text(x + 16, y + 78, c[2], { size: 11, color: DIM });
    P.text(x + 16, y + 102, c[3], { size: 11, color: DIM });
  });

  if (done > 0) {
    P.text(34, 428, 'the rule is arithmetic on conditional probability, and nothing more',
      { size: 11, color: INFO });
  }
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
