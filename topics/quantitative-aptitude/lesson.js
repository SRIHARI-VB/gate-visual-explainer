/* ==========================================================================
   quantitative-aptitude — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The model is computation wherever computation is possible:
     - the coin question multiplies each share by its denomination and divides
       by the value total, and also computes the two wrong bases the paper
       offers, so "10%" is a result rather than a quoted key;
     - the diet question turns shares into kilocalories and kilocalories into
       grams, and checks that the sector angles close at 360 degrees;
     - the logarithm question is solved by squaring the relation, and the
       answer 79 is checked against a numeric root of r^2 - 9r + 1 = 0;
     - the mensuration question computes both readings of "longer edges", so
       the reader can see that the option set decides between them;
     - the sample is sorted, and median, mean, mode and the count above the
       median are all computed from the sorted list;
     - both probability spaces are enumerated exhaustively — eight tosses and
       twenty-eight unordered pairs — instead of trusting the binomial form;
     - the recurrence is run backwards and then forwards, and the two given
       terms must come out exactly;
     - the estimation facts are computed, not quoted, including the 2.4 per
       cent error in 2^10 = 1000.
   ========================================================================== */

(function () {
  'use strict';

  var W = 900, H = 470;
  var K = window.LessonKit;
  var PR = window.Painters;
  var PAL = (PR && PR.PAL) ? PR.PAL : {
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

  var CHECKS = [];
  function check(name, pass, detail) {
    CHECKS.push({ name: name, pass: !!pass, detail: detail || '' });
  }

  function r2(x) { return Math.round(x * 100) / 100; }
  function r3(x) { return Math.round(x * 1000) / 1000; }
  function near(a, b, tol) { return Math.abs(a - b) <= (tol === undefined ? 1e-9 : tol); }

  /* ======================================================================
     LAYER 1 - THE MODEL
     ====================================================================== */

  /* ---------- 1a. the coin question: ratio to value to percentage ----------
     GATE CSE 2024 Set 1, GA Question 4. Shares 5 : 3 : 13 of Rs 1, Rs 5 and
     Rs 10 coins. The question asks what percentage of the money is in Rs 5
     coins, so the base is the total VALUE, not the total count. */

  var COIN = (function () {
    var shares = [5, 3, 13];
    var den = [1, 5, 10];
    var values = shares.map(function (s, i) { return s * den[i]; });
    var total = values.reduce(function (a, b) { return a + b; }, 0);
    var counts = shares.reduce(function (a, b) { return a + b; }, 0);
    return {
      shares: shares,
      den: den,
      values: values,
      total: total,
      counts: counts,
      pct: values.map(function (v) { return 100 * v / total; }),
      answer: 100 * values[1] / total,
      /* the two wrong bases the paper's options come from */
      wrongByCount: 100 * 3 / counts,
      wrongByPart: 100 * values[1] / 50
    };
  })();

  /* ---------- 1b. the diet question: share -> energy -> mass ----------
     GATE CSE 2024 Set 1, GA Question 8. Shares of a 2,000 kcal diet and a
     table of energy densities. Total fat means all three fats. */

  var PIE = (function () {
    var total = 2000;
    var rows = [
      { name: 'Carbohydrates', pct: 35, dens: 4 },
      { name: 'Proteins', pct: 20, dens: 4 },
      { name: 'Unsaturated fat', pct: 20, dens: 9 },
      { name: 'Saturated fat', pct: 20, dens: 9 },
      { name: 'Trans fat', pct: 5, dens: 9 }
    ];
    rows.forEach(function (r) {
      r.kcal = total * r.pct / 100;
      r.grams = r.kcal / r.dens;
      r.sector = 3.6 * r.pct;      /* degrees of the pie */
    });
    var fats = rows.filter(function (r) { return /fat/.test(r.name); });
    var fatPct = fats.reduce(function (a, r) { return a + r.pct; }, 0);
    var fatKcal = fats.reduce(function (a, r) { return a + r.kcal; }, 0);
    /* every fat has the same density here, which is what makes the grouping exact */
    var sameDensity = fats.every(function (r) { return r.dens === fats[0].dens; });
    var fatGrams = sameDensity
      ? fatKcal / fats[0].dens
      : fats.reduce(function (a, r) { return a + r.grams; }, 0);
    return {
      total: total,
      rows: rows,
      fats: fats,
      fatPct: fatPct,
      fatKcal: fatKcal,
      fatGrams: fatGrams,
      sameDensity: sameDensity,
      pctSum: rows.reduce(function (a, r) { return a + r.pct; }, 0),
      kcalSum: rows.reduce(function (a, r) { return a + r.kcal; }, 0),
      sectorSum: rows.reduce(function (a, r) { return a + r.sector; }, 0)
    };
  })();

  /* ---------- 1c. the logarithm question ----------
     GATE CSE 2024 Set 1, GA Question 5.
     log(p^2 + q^2) = log p + log q + 2 log 3  =>  p^2 + q^2 = 9 p q.
     Squaring gives (p^2+q^2)^2 = 81 p^2 q^2, so p^4 + q^4 = 79 p^2 q^2. */

  var LOGQ = (function () {
    var r = (9 + Math.sqrt(77)) / 2;          /* p/q from r^2 - 9r + 1 = 0 */
    var rOther = (9 - Math.sqrt(77)) / 2;
    var ratio = (Math.pow(r, 4) + 1) / (r * r);
    var ratioOther = (Math.pow(rOther, 4) + 1) / (rOther * rOther);
    return {
      r: r,
      rOther: rOther,
      sumOverProduct: (r * r + 1) / r,        /* p/q + q/p */
      ratio: ratio,
      ratioOther: ratioOther,
      answer: 79,
      /* the dropped-middle-term error */
      wrongIfMiddleDropped: 81
    };
  })();

  /* ---------- 1d. the mensuration question ----------
     GATE CSE 2024 Set 1, GA Question 7. A 54 x 4 sheet rolled so that its two
     LONGER edges meet: the seam runs along the 54, so height 54, circumference
     4. A cube of the same surface area has side 6. */

  var MENS = (function () {
    var longSide = 54, shortSide = 4;
    var area = longSide * shortSide;
    var side = Math.sqrt(area / 6);
    var cubeVol = Math.pow(side, 3);
    /* correct reading: the two 54 cm edges are joined */
    var rTube = shortSide / (2 * Math.PI);
    var tubeVol = Math.PI * rTube * rTube * longSide;
    /* the other reading: the two 4 cm edges are joined */
    var rAlt = longSide / (2 * Math.PI);
    var altVol = Math.PI * rAlt * rAlt * shortSide;
    /* the radius-forgot-to-halve error: circumference used as a radius */
    var rWrong = shortSide / Math.PI;
    var wrongVol = Math.PI * rWrong * rWrong * longSide;
    return {
      longSide: longSide, shortSide: shortSide,
      area: area, side: side, cubeVol: cubeVol,
      rTube: rTube, tubeVol: tubeVol, ratio: tubeVol / cubeVol,
      rAlt: rAlt, altVol: altVol, altRatio: altVol / cubeVol,
      wrongVol: wrongVol, wrongRatio: wrongVol / cubeVol
    };
  })();

  /* ---------- 1e. the sample: median, mean, mode ----------
     GATE CSE 2024 Set 1, GA Question 3. */

  var STAT = (function () {
    var raw = [9, 18, 11, 14, 15, 17, 10, 69, 11, 13];
    var sorted = raw.slice().sort(function (a, b) { return a - b; });
    var n = sorted.length;
    var median = n % 2
      ? sorted[(n - 1) / 2]
      : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
    var sum = sorted.reduce(function (a, b) { return a + b; }, 0);
    var mean = sum / n;
    var counts = {};
    sorted.forEach(function (v) { counts[v] = (counts[v] || 0) + 1; });
    var mode = null, modeCount = 0;
    Object.keys(counts).forEach(function (k) {
      if (counts[k] > modeCount) { modeCount = counts[k]; mode = Number(k); }
    });
    var without = sorted.filter(function (v) { return v !== 69; });
    var sumWithout = without.reduce(function (a, b) { return a + b; }, 0);
    return {
      raw: raw, sorted: sorted, n: n,
      median: median, sum: sum, mean: mean,
      mode: mode, modeCount: modeCount,
      aboveMedian: sorted.filter(function (v) { return v > median; }).length,
      belowMedian: sorted.filter(function (v) { return v < median; }).length,
      meanWithout: sumWithout / without.length,
      medianWithout: without[Math.floor((without.length - 1) / 2)],
      /* a three-value sample where MORE than half exceed the mean */
      skew: [0, 10, 10],
      skewMean: (0 + 10 + 10) / 3,
      skewAbove: [0, 10, 10].filter(function (v) { return v > (0 + 10 + 10) / 3; }).length
    };
  })();

  /* ---------- 1f. probability: enumerate, do not trust the formula ---------- */

  var PROB = (function () {
    var toss = [];
    for (var a = 0; a < 2; a++) {
      for (var b = 0; b < 2; b++) {
        for (var c = 0; c < 2; c++) {
          var bits = [a, b, c];
          toss.push({
            bits: bits,
            label: bits.map(function (x) { return x ? 'H' : 'T'; }).join(''),
            heads: bits.reduce(function (s, x) { return s + x; }, 0)
          });
        }
      }
    }
    var atLeastOne = toss.filter(function (o) { return o.heads >= 1; }).length;
    var none = toss.filter(function (o) { return o.heads === 0; }).length;

    /* the bag: 5 red, 3 blue, two drawn without replacement */
    var bag = [];
    for (var i = 0; i < 8; i++) bag.push(i < 5 ? 'R' : 'B');
    var pairs = 0, bothBlue = 0;
    for (var i2 = 0; i2 < 8; i2++) {
      for (var j = i2 + 1; j < 8; j++) {
        pairs++;
        if (bag[i2] === 'B' && bag[j] === 'B') bothBlue++;
      }
    }
    return {
      toss: toss,
      space: toss.length,
      atLeastOne: atLeastOne,
      none: none,
      pAtLeastOne: atLeastOne / toss.length,
      pNone: none / toss.length,
      red: 5, blue: 3,
      pairs: pairs,
      bothBlue: bothBlue,
      atLeastOneRed: pairs - bothBlue,
      pAtLeastOneRed: (pairs - bothBlue) / pairs,
      /* with replacement, the same question */
      pReplace: 1 - Math.pow(3 / 8, 2)
    };
  })();

  /* ---------- 1g. the recurrence, backwards then forwards ----------
     GATE CSE 2023, GA Question 3. F(n+1) = F(n) + F(n-1), F6 = 37, F7 = 60. */

  var SERIES = (function () {
    var f = new Array(8).fill(null);      /* index 1..7 */
    f[6] = 37; f[7] = 60;
    var steps = [];
    for (var i = 6; i >= 2; i--) {
      f[i - 1] = f[i + 1] - f[i];
      steps.push({ hi: f[i + 1], lo: f[i], result: f[i - 1], from: i + 1, to: i - 1 });
    }
    var forward = [f[1], f[2]];
    while (forward.length < 7) forward.push(forward[forward.length - 1] + forward[forward.length - 2]);
    var diffs = [];
    for (var k = 2; k <= 7; k++) diffs.push(f[k] - f[k - 1]);
    return {
      f: f, steps: steps, forward: forward, diffs: diffs,
      answer: f[1]
    };
  })();

  /* ---------- 1h. estimation ---------- */

  var EST = (function () {
    var p10 = Math.pow(2, 10), p20 = Math.pow(2, 20), p30 = Math.pow(2, 30), p40 = Math.pow(2, 40);
    return {
      p10: p10, p20: p20, p30: p30, p40: p40,
      log10p10: Math.log10(p10),
      log10p20: Math.log10(p20),
      err2_10: (p10 - 1000) / 1000,
      g14: Math.pow(1.05, 14),
      g15: Math.pow(1.05, 15),
      rule72: 72 / 5,
      simple14: 1 + 0.05 * 14
    };
  })();

  var V = {
    coin: COIN,
    pie: PIE,
    log: LOGQ,
    mens: MENS,
    stat: STAT,
    prob: PROB,
    series: SERIES,
    est: EST
  };

  /* ======================================================================
     LAYER 2 - THE CHECKS
     Each computed value is re-tested against the definition it came from.
     ====================================================================== */

  /* --- the coin question --- */
  check('the three value parts are 5, 15 and 130',
    COIN.values.join(',') === '5,15,130', COIN.values.join(' + '));
  check('the value total is 150, and it is not the coin count',
    COIN.total === 150 && COIN.counts === 21, '21 coins, Rs 150');
  check('the value total equals the sum of the three parts',
    COIN.total === COIN.values.reduce(function (a, b) { return a + b; }, 0));
  check('the three shares add up to 100 per cent',
    near(COIN.pct.reduce(function (a, b) { return a + b; }, 0), 100, 1e-9));
  check('the answer is exactly 10 per cent',
    near(COIN.answer, 10, 1e-12), '15 / 150');
  check('the count-based wrong base gives about 14.29 per cent',
    near(COIN.wrongByCount, 100 * 3 / 21, 1e-12) && COIN.wrongByCount > 14 && COIN.wrongByCount < 14.3,
    '3 / 21 = 14 2/7 %');
  check('the wrong-base answers are both different from 10 per cent',
    Math.abs(COIN.wrongByCount - 10) > 1 && Math.abs(COIN.wrongByPart - 10) > 1);

  /* --- the diet question --- */
  check('the shares sum to 100 per cent',
    near(PIE.pctSum, 100, 1e-9), PIE.pctSum + ' per cent');
  check('the sector angles close at 360 degrees',
    near(PIE.sectorSum, 360, 1e-9), PIE.sectorSum + ' degrees');
  check('35 per cent of 2,000 kcal is 700 kcal',
    near(PIE.rows[0].kcal, 700, 1e-9));
  check('the five energy figures sum to the stated 2,000 kcal',
    near(PIE.kcalSum, 2000, 1e-9), PIE.kcalSum + ' kcal');
  check('the three fats are 45 per cent of the diet',
    PIE.fatPct === 45 && PIE.fats.length === 3, PIE.fats.length + ' fats');
  check('the fats carry 900 kcal between them',
    near(PIE.fatKcal, 900, 1e-9));
  check('all three fats share one density, so grouping is exact',
    PIE.sameDensity === true, '9 kcal/g');
  check('the grouped answer equals the per-row sum',
    near(PIE.fatGrams, PIE.fats.reduce(function (a, r) { return a + r.grams; }, 0), 1e-9));
  check('the answer is 100 grams',
    near(PIE.fatGrams, 100, 1e-9), '900 / 9');
  check('one fat alone is 44.4 g, which is the planted distractor',
    near(PIE.rows[2].grams, 400 / 9, 1e-9) && Math.abs(PIE.rows[2].grams - 100) > 1,
    '400 / 9');
  check('carbohydrate and protein grams are 175 and 100',
    near(PIE.rows[0].grams, 175, 1e-9) && near(PIE.rows[1].grams, 100, 1e-9));

  /* --- the logarithm question --- */
  check('the root of r^2 - 9r + 1 = 0 satisfies the relation',
    near(LOGQ.r * LOGQ.r - 9 * LOGQ.r + 1, 0, 1e-9), 'r = ' + r3(LOGQ.r));
  check('the other root satisfies it too',
    near(LOGQ.rOther * LOGQ.rOther - 9 * LOGQ.rOther + 1, 0, 1e-9));
  check('p/q + q/p is exactly 9 under the relation',
    near(LOGQ.sumOverProduct, 9, 1e-9));
  check('the ratio (p^4 + q^4) / (p^2 q^2) is 79',
    near(LOGQ.ratio, 79, 1e-7), 'computed ' + LOGQ.ratio);
  check('both roots give the same ratio, so the answer does not depend on which',
    near(LOGQ.ratio, LOGQ.ratioOther, 1e-7));
  check('dropping the middle term would give 81, not 79',
    LOGQ.wrongIfMiddleDropped === 81 && Math.abs(81 - 79) === 2,
    '81 - 2 = 79');

  /* --- the mensuration question --- */
  check('the sheet area is 216 square centimetres',
    MENS.area === 216);
  check('the cube side is 6 from six equal faces',
    near(MENS.side, 6, 1e-12), '6 a^2 = 216');
  check('the cube volume is 216, equal to the area because the side is 6',
    near(MENS.cubeVol, 216, 1e-9));
  check('rolling the sheet conserves area: circumference times height is 216',
    near(MENS.shortSide * MENS.longSide, MENS.area, 1e-12),
    '4 x 54');
  check('the tube volume is 216 over pi',
    near(MENS.tubeVol, 216 / Math.PI, 1e-9), 'pi (2/pi)^2 x 54');
  check('the ratio is 1 over pi',
    near(MENS.ratio, 1 / Math.PI, 1e-12), 'about ' + r3(MENS.ratio));
  check('the other reading of the fold gives 13.5 over pi, a different question',
    near(MENS.altRatio, 13.5 / Math.PI, 1e-9), 'about ' + r3(MENS.altRatio));
  check('the two readings really do differ by more than a factor of ten',
    MENS.altRatio / MENS.ratio > 10);
  check('using the circumference as a radius gives four times the correct volume',
    near(MENS.wrongRatio, 4 * MENS.ratio, 1e-12), '4/pi is an offered option');

  /* --- the sample --- */
  check('the sorted sample is 9, 10, 11, 11, 13, 14, 15, 17, 18, 69',
    STAT.sorted.join(',') === '9,10,11,11,13,14,15,17,18,69');
  check('sorting preserves the multiset',
    STAT.sorted.reduce(function (a, b) { return a + b; }, 0) === STAT.sum);
  check('the median of an even sample is the mean of the two central values',
    near(STAT.median, (STAT.sorted[4] + STAT.sorted[5]) / 2, 1e-12) && STAT.median === 13.5);
  check('the median is not one of the data values, which is allowed for an even count',
    STAT.sorted.indexOf(STAT.median) === -1);
  check('the sum is 187 and the mean is 18.7',
    STAT.sum === 187 && near(STAT.mean, 18.7, 1e-12));
  check('the mean is above the median, so the sample leans right',
    STAT.mean > STAT.median, r2(STAT.mean) + ' > ' + STAT.median);
  check('removing the outlier drops the mean and barely moves the median',
    STAT.meanWithout < STAT.mean - 4 && Math.abs(STAT.medianWithout - 13) < 1,
    'mean ' + r2(STAT.meanWithout) + ', median ' + STAT.medianWithout);
  check('the mode is 11, occurring twice',
    STAT.mode === 11 && STAT.modeCount === 2);
  check('exactly five of the ten values lie above the median, and five below',
    STAT.aboveMedian === 5 && STAT.belowMedian === 5, 'half, never more');
  check('no sample can have more than half its values above the median',
    STAT.sorted.filter(function (v) { return v > STAT.median; }).length <= STAT.n / 2);
  check('a sample CAN have more than half above the mean, so the claim is false for the mean',
    STAT.skewAbove > STAT.skew.length / 2, '[0, 10, 10] mean ' + r2(STAT.skewMean) + ', ' + STAT.skewAbove + ' above');

  /* --- probability --- */
  check('three tosses give eight equally likely outcomes',
    PROB.space === 8 && PROB.toss.length === 8);
  check('the eight labels are distinct and exhaustive',
    new Set(PROB.toss.map(function (o) { return o.label; })).size === 8);
  check('exactly one outcome has no head',
    PROB.none === 1, PROB.toss.filter(function (o) { return o.heads === 0; })[0].label);
  check('seven outcomes have at least one head',
    PROB.atLeastOne === 7);
  check('the two counts are exhaustive: seven plus one is eight',
    PROB.atLeastOne + PROB.none === PROB.space);
  check('at least one head is 7/8',
    near(PROB.pAtLeastOne, 7 / 8, 1e-12));
  check('the bag has 28 unordered pairs',
    PROB.pairs === 28, 'C(8,2)');
  check('exactly three pairs are both blue',
    PROB.bothBlue === 3, 'C(3,2)');
  check('the two counts partition the pairs: 25 plus 3 is 28',
    PROB.atLeastOneRed + PROB.bothBlue === PROB.pairs);
  check('at least one red is 25/28',
    near(PROB.pAtLeastOneRed, 25 / 28, 1e-12));
  check('with replacement the answer differs, so replacement matters',
    Math.abs(PROB.pReplace - PROB.pAtLeastOneRed) > 0.01,
    '55/64 = ' + r3(PROB.pReplace));

  /* --- the recurrence --- */
  check('the backward chain gives 23, 14, 9, 5, 4',
    [SERIES.f[5], SERIES.f[4], SERIES.f[3], SERIES.f[2], SERIES.f[1]].join(',') === '23,14,9,5,4');
  check('the first term is 4',
    SERIES.answer === 4);
  check('running forward from 4 and 5 reproduces both given terms',
    SERIES.forward[5] === 37 && SERIES.forward[6] === 60,
    SERIES.forward.join(', '));
  check('every backward step satisfies the recurrence it was derived from',
    SERIES.steps.every(function (s) { return s.lo + s.result === s.hi; }));
  check('the first differences are not constant, so this is not a difference-table series',
    new Set(SERIES.diffs).size > 1, SERIES.diffs.join(', '));

  /* --- estimation --- */
  check('two to the tenth is 1024',
    EST.p10 === 1024);
  check('the error in calling it a thousand is 2.4 per cent',
    near(EST.err2_10, 0.024, 1e-12), '24 per thousand');
  check('log base ten of 1024 is just over three',
    EST.log10p10 > 3 && EST.log10p10 < 3.02, r3(EST.log10p10));
  check('two to the twentieth is within five per cent of a million',
    Math.abs(EST.p20 / 1e6 - 1) < 0.05, '1.0486 million');
  check('two to the thirtieth is about a billion',
    Math.abs(EST.p30 / 1e9 - 1) < 0.08);
  check('1.05 to the fourteenth is just under two, and the fifteenth passes it',
    EST.g14 < 2 && EST.g15 > 2, r3(EST.g14) + ' then ' + r3(EST.g15));
  check('the rule of seventy-two gives 14.4 years, within a year of the computed crossing',
    near(EST.rule72, 14.4, 1e-12) && Math.abs(EST.rule72 - 14) <= 1);
  check('simple interest over fourteen years reaches only 1.70, so compounding is the point',
    near(EST.simple14, 1.7, 1e-12) && EST.simple14 < EST.g14);

  /* ======================================================================
     LAYER 3 - RENDER
     ====================================================================== */

  function pct(p) { return K.clamp01(p); }
  function beat(t, sc, a, b) { return pct((t - sc.start - a) / (b - a)); }

  function heading(label, sub) {
    P.text(28, 20, label, { size: 15, bold: true, color: INK });
    if (sub) P.text(28, 42, sub, { size: 11.5, color: DIM });
  }

  function card(x, y, w, h, stroke, fill) {
    P.rect(x, y, w, h, { fill: fill || SURF, stroke: stroke || BORDER, radius: 8, sw: 1.3 });
  }

  /* ---------- scene 1 ---------- */
  function drawAsk(t, sc) {
    var p = pct((t - sc.start) / (sc.end - sc.start));
    heading('Quantitative Aptitude — five computations, four headings',
      'Section 2 of the General Aptitude syllabus, GATE 2027, IIT Madras');

    var cards = [
      { k: 'RATIO', a: 'share of one base', b: 'part over total' },
      { k: 'DATA', a: 'percent x total', b: 'then divide by a rate' },
      { k: 'LOG', a: 'product to a sum', b: 'power to a factor' },
      { k: 'SHAPE', a: 'length to area to', b: 'volume: k squared, cubed' },
      { k: 'COUNT', a: 'the complement', b: 'and the right centre' }
    ];
    cards.forEach(function (c, i) {
      var x = 28 + i * 174;
      var on = beat(t, sc, 0.4 + i * 0.5, 1.6 + i * 0.5);
      P.alpha(0.15 + 0.85 * on);
      card(x, 68, 164, 96, on > 0.5 ? ACC : BORDER, SURF);
      P.text(x + 12, 82, c.k, { size: 11, bold: true, color: ACC });
      P.text(x + 12, 108, c.a, { size: 11.5, color: INK });
      P.text(x + 12, 128, c.b, { size: 11.5, color: DIM });
      P.alpha(1);
    });

    if (beat(t, sc, 3, 5) > 0) {
      card(28, 182, 844, 108, BORDER, SURF2);
      P.text(44, 196, 'SECTION 2 — QUANTITATIVE APTITUDE, quoted', { size: 10.5, bold: true, color: DIM });
      P.text(44, 220, 'Data interpretation: data graphs (bar graphs, pie charts, and other graphs representing data),', { size: 11.5, color: INK });
      P.text(44, 240, '2- and 3-dimensional plots, maps, and tables. Numerical computation and estimation: ratios,', { size: 11.5, color: INK });
      P.text(44, 260, 'percentages, powers, exponents and logarithms, permutations and combinations, and series.', { size: 11.5, color: INK });
      P.text(44, 280, 'Mensuration and geometry, Elementary statistics and probability.', { size: 11.5, color: INK });
    }

    if (beat(t, sc, 5, 7.5) > 0) {
      P.text(28, 314, 'Five computations, not four topics. Each scene below is one of the five,', { size: 13, color: INK });
      P.text(28, 336, 'with a previous-year item wherever the paper has one.', { size: 13, color: INK });
      P.text(28, 366, 'Permutations and combinations belong to the counting lesson, and distributions', { size: 12, color: DIM });
      P.text(28, 386, 'to the probability lesson; both are linked from the Overview tab.', { size: 12, color: DIM });
      P.text(28, 418, 'Nothing here is a trick. Every question is arithmetic with one decision in it.', { size: 12.5, bold: true, color: ACC });
    }
  }

  /* ---------- scene 2 ---------- */
  function drawBase(t, sc) {
    var p = pct((t - sc.start) / (sc.end - sc.start));
    heading('Ratios and percentages: one base',
      'GATE CSE 2024 Set 1 GA Q4 — coins of Rs 1, Rs 5 and Rs 10 in the ratio 5 : 3 : 13');

    /* left: the three parts */
    COIN.shares.forEach(function (s, i) {
      var on = beat(t, sc, 0.5 + i * 0.9, 1.6 + i * 0.9);
      if (on <= 0) return;
      var y = 84 + i * 58;
      P.alpha(on);
      P.circle(58, y + 18, 15, { fill: ACCDIM, stroke: ACC, sw: 1.4 });
      P.text(58, y + 18, String(COIN.den[i]), { size: 12, bold: true, color: ACC, align: 'center', base: 'middle' });
      P.text(84, y + 12, s + ' coins of Rs ' + COIN.den[i], { size: 13, color: INK });
      P.text(84, y + 30, '= Rs ' + COIN.values[i], { size: 13, bold: true, color: VAL });
      P.alpha(1);
    });

    if (beat(t, sc, 2.4, 3.6) > 0) {
      P.text(28, 264, 'total value', { size: 11, bold: true, color: DIM });
      P.text(28, 288, 'Rs ' + COIN.total, { size: 22, bold: true, color: ACC });
      P.text(120, 288, '(5 + 15 + 130, from ' + COIN.counts + ' coins)', { size: 12, color: DIM });
    }

    /* right: the bar chart of values */
    if (beat(t, sc, 1.6, 3) > 0) {
      var base = 290, scale = 150 / 130;
      P.text(470, 68, 'value in rupees', { size: 11, bold: true, color: DIM });
      P.line(470, base, 862, base, { stroke: BORDER, sw: 1.4 });
      COIN.values.forEach(function (v, i) {
        var x = 486 + i * 122;
        var h = Math.max(4, v * scale);
        var on = beat(t, sc, 1.8 + i * 0.5, 2.8 + i * 0.5);
        P.alpha(on);
        P.rect(x, base - h, 76, h, { fill: i === 1 ? ACCDIM : SURF2, stroke: i === 1 ? ACC : BORDER, radius: 3, sw: 1.2 });
        P.text(x + 38, base - h - 8, String(v), { size: 12, bold: true, color: i === 1 ? ACC : INK, align: 'center', base: 'bottom' });
        P.text(x + 38, base + 8, 'Rs ' + COIN.den[i], { size: 11, color: DIM, align: 'center' });
        P.alpha(1);
      });
    }

    if (beat(t, sc, 3.6, 4.6) > 0) {
      card(28, 310, 844, 74, ACC, ACCDIM);
      P.text(44, 324, 'Rs 15 of Rs 150 = 15 / 150 = 10 per cent', { size: 17, bold: true, color: INK });
      P.text(44, 352, 'the base is the total value, not the total number of coins — official key C', { size: 12, color: DIM });
    }
    if (beat(t, sc, 4.6, 5.6) > 0) {
      P.text(28, 402, 'the distractor 14 2/7 per cent is 3 / 21: a count divided by a count', { size: 12.5, color: WARN });
      P.text(28, 424, 'the distractor 30 per cent is 15 / 50: a part divided by the wrong part', { size: 12.5, color: WARN });
    }
  }

  /* ---------- scene 3 ---------- */
  function drawData(t, sc) {
    heading('Data interpretation is a multiplication chain',
      'GATE CSE 2024 Set 1 GA Q8 — shares of a 2,000 kcal diet, densities from a table');

    /* the share bar: every 1 per cent is 3.6 degrees of the pie */
    var x0 = 28, bw = 844, y = 84, bh = 30;
    var colours = [ACC, INFO, VAL, WARN, FAINT];
    var cursor = x0;
    P.text(x0, 64, 'share of 2,000 kcal — each 1 per cent is 3.6 degrees of the pie', { size: 11, bold: true, color: DIM });
    PIE.rows.forEach(function (r, i) {
      var w = bw * r.pct / 100;
      var on = beat(t, sc, 0.5 + i * 0.35, 1.4 + i * 0.35);
      P.alpha(on);
      P.rect(cursor, y, w, bh, { fill: colours[i], stroke: SURF, radius: 2, sw: 1.5 });
      if (w > 34) {
        P.text(cursor + w / 2, y + bh / 2, r.pct + '%', {
          size: 11.5, bold: true, color: '#ffffff', align: 'center', base: 'middle'
        });
      }
      cursor += w;
      P.alpha(1);
    });

    /* the chain table */
    var rows = PIE.rows;
    var colName = 32, colPct = 392, colKcal = 500, colDens = 610, colGram = 730;
    if (beat(t, sc, 2, 3) > 0) {
      P.text(colPct - 60, 140, 'share', { size: 10.5, bold: true, color: DIM });
      P.text(colKcal - 70, 140, 'x 2000', { size: 10.5, bold: true, color: DIM });
      P.text(colDens - 60, 140, 'divide by', { size: 10.5, bold: true, color: DIM });
      P.text(colGram - 50, 140, 'grams', { size: 10.5, bold: true, color: DIM });
      P.line(colName, 156, 800, 156, { stroke: BORDER, sw: 1 });
    }
    rows.forEach(function (r, i) {
      var on = beat(t, sc, 2.2 + i * 0.4, 3.1 + i * 0.4);
      if (on <= 0) return;
      var ry = 176 + i * 26;
      var isFat = /fat/.test(r.name);
      P.alpha(on);
      P.text(colName, ry, r.name, { size: 12, color: isFat ? INK : DIM, bold: isFat });
      P.text(colPct, ry, r.pct + '%', { size: 12, color: DIM, align: 'right', mono: true });
      P.text(colKcal, ry, String(r.kcal), { size: 12, color: DIM, align: 'right', mono: true });
      P.text(colDens, ry, String(r.dens), { size: 12, color: DIM, align: 'right', mono: true });
      P.text(colGram, ry, r.grams.toFixed(1), { size: 12, color: isFat ? ACC : INK, align: 'right', mono: true, bold: isFat });
      P.alpha(1);
    });

    if (beat(t, sc, 4, 5) > 0) {
      card(28, 316, 844, 66, ACC, ACCDIM);
      P.text(44, 328, 'fat = 20% + 20% + 5% = 45%  →  900 kcal  →  900 / 9 = 100 g', { size: 15, bold: true, color: INK });
      P.text(44, 354, 'the same density for all three fats is what makes one division exact — official key C', { size: 12, color: DIM });
    }
    if (beat(t, sc, 5.2, 6.4) > 0) {
      P.text(28, 404, 'two fats of different densities would need the division per row, then the sum', { size: 12.5, color: WARN });
      P.text(28, 426, 'the distractor 44.4 is one fat alone; 3,600 is the energy with no division at all', { size: 12.5, color: DIM });
    }
  }

  /* ---------- scene 4 ---------- */
  function drawLog(t, sc) {
    heading('Logarithms: a product becomes a sum',
      'GATE CSE 2024 Set 1 GA Q5 — log(p^2 + q^2) = log p + log q + 2 log 3');

    var steps = [
      { f: 'log(ab) = log a + log b', g: 'a product becomes a sum; 2 log 3 = log 9' },
      { f: 'log(p^2 + q^2) = log(9pq)', g: 'combine the right-hand side first' },
      { f: 'p^2 + q^2 = 9pq', g: 'equal logarithms mean equal numbers' },
      { f: 'p^4 + q^4 = (9pq)^2 - 2p^2q^2', g: 'square, then subtract the middle term' }
    ];
    steps.forEach(function (s, i) {
      var on = beat(t, sc, 0.5 + i * 1.6, 1.7 + i * 1.6);
      if (on <= 0) return;
      var y = 76 + i * 62;
      P.alpha(on);
      card(28, y, 556, 54, on > 0.6 ? ACC : BORDER, SURF);
      P.circle(50, y + 27, 12, { fill: ACCDIM, stroke: ACC, sw: 1.2 });
      P.text(50, y + 27, String(i + 1), { size: 11, bold: true, color: ACC, align: 'center', base: 'middle' });
      P.text(72, y + 10, s.f, { size: 14, bold: true, color: INK, mono: true });
      P.text(72, y + 32, s.g, { size: 11.5, color: DIM });
      P.alpha(1);
    });

    if (beat(t, sc, 4, 5.4) > 0) {
      card(600, 76, 272, 178, BORDER, SURF2);
      P.text(616, 90, 'checked numerically', { size: 10.5, bold: true, color: DIM });
      P.text(616, 114, 'r = p/q', { size: 12, color: INK, mono: true });
      P.text(616, 136, 'r = (9 + sqrt 77)/2', { size: 12, color: INK, mono: true });
      P.text(616, 158, 'r = ' + r3(LOGQ.r), { size: 12, color: ACC, mono: true });
      P.text(616, 182, 'p/q + q/p = ' + r2(LOGQ.sumOverProduct), { size: 12, color: INK, mono: true });
      P.text(616, 206, 'ratio = ' + r2(LOGQ.ratio), { size: 12, bold: true, color: VAL, mono: true });
      P.text(616, 232, 'both roots agree', { size: 11, color: DIM });
    }

    if (beat(t, sc, 5.4, 6.6) > 0) {
      card(28, 330, 844, 62, VAL, SURF);
      P.text(44, 344, 'the ratio is 79 — official key A', { size: 17, bold: true, color: VAL });
      P.text(44, 370, '81 minus 2: the middle term of the square is 2 p^2 q^2, and it is not optional', { size: 12, color: DIM });
    }
    if (beat(t, sc, 6.6, 7.6) > 0) {
      P.text(28, 412, 'log of a sum does not split: there is no rule for log(a + b)', { size: 12.5, color: WARN });
      P.text(28, 434, 'and a coefficient is an exponent, so 2 log 3 is log 9 and not log 6', { size: 12.5, color: WARN });
    }
  }

  /* ---------- scene 5 ---------- */
  function drawMens(t, sc) {
    heading('Mensuration: which edge becomes the circumference',
      'GATE CSE 2024 Set 1 GA Q7 — a 54 cm x 4 cm sheet and a cube of the same surface area');

    /* the sheet */
    if (beat(t, sc, 0.4, 1.4) > 0) {
      P.text(40, 68, 'the sheet', { size: 11, bold: true, color: DIM });
      P.rect(40, 84, 330, 24, { fill: SURF2, stroke: BORDER, radius: 2, sw: 1.3 });
      P.text(40, 120, '54 cm x 4 cm = 216 cm squared', { size: 12.5, color: INK });
    }

    /* the tube: the seam runs along the 54, so the 4 is the distance around */
    if (beat(t, sc, 1.6, 2.8) > 0) {
      var on = beat(t, sc, 1.6, 2.8);
      P.alpha(on);
      P.rect(64, 166, 76, 104, { fill: ACCDIM, stroke: ACC, radius: 0, sw: 1.4 });
      P.circle(102, 166, 38, { fill: SURF, stroke: ACC, sw: 1.4 });
      P.circle(102, 270, 38, { fill: SURF, stroke: ACC, sw: 1.4 });
      P.text(102, 166, '2/pi', { size: 11, color: ACC, align: 'center', base: 'middle', mono: true });
      P.text(160, 186, 'height 54', { size: 12.5, color: INK });
      P.text(160, 208, 'around 4', { size: 12.5, color: INK });
      P.text(160, 234, 'radius = 4 / 2pi', { size: 11.5, color: DIM, mono: true });
      P.alpha(1);
    }

    /* the cube */
    if (beat(t, sc, 3, 4.2) > 0) {
      var on2 = beat(t, sc, 3, 4.2);
      P.alpha(on2);
      P.rect(612, 168, 104, 104, { fill: SURF, stroke: VAL, radius: 2, sw: 1.5 });
      P.line(612, 168, 650, 140, { stroke: VAL, sw: 1.3 });
      P.line(716, 168, 754, 140, { stroke: VAL, sw: 1.3 });
      P.line(650, 140, 754, 140, { stroke: VAL, sw: 1.3 });
      P.line(650, 140, 650, 244, { stroke: VAL, sw: 1.0, dash: [4, 3] });
      P.line(754, 140, 754, 244, { stroke: VAL, sw: 1.3 });
      P.line(650, 244, 754, 244, { stroke: VAL, sw: 1.3 });
      P.text(664, 226, 'side 6', { size: 12.5, bold: true, color: VAL, align: 'center' });
      P.text(586, 128, 'six faces of 36', { size: 11.5, color: DIM });
      P.alpha(1);
    }

    /* the arithmetic */
    if (beat(t, sc, 4.2, 5.4) > 0) {
      P.text(28, 322, 'tube   pi (2/pi)^2 x 54 = 216/pi = ' + r2(MENS.tubeVol), { size: 13, color: INK, mono: true });
      P.text(28, 346, 'cube   6 cubed = ' + r2(MENS.cubeVol), { size: 13, color: INK, mono: true });
      P.text(28, 372, 'ratio  216/pi over 216 = 1/pi = ' + r3(MENS.ratio), { size: 13, bold: true, color: VAL, mono: true });
    }
    if (beat(t, sc, 5.4, 6.6) > 0) {
      P.text(28, 402, 'the other reading — joining the two 4 cm edges — gives ' + r2(MENS.altRatio) + ', about 13.5/pi', { size: 12, color: WARN });
      P.text(28, 424, 'using 4 as a radius instead of a circumference gives ' + r2(MENS.wrongRatio) + ', which is 4/pi: an offered option', { size: 12, color: WARN });
    }
  }

  /* ---------- scene 6 ---------- */
  function drawStat(t, sc) {
    heading('Statistics: the median is a position, the mean is a sum',
      'GATE CSE 2024 Set 1 GA Q3 — the median of 9, 18, 11, 14, 15, 17, 10, 69, 11, 13');

    var axisY = 250, lo = 8, hi = 71, x0 = 60, x1 = 840;
    function X(v) { return x0 + (v - lo) / (hi - lo) * (x1 - x0); }

    if (beat(t, sc, 0.5, 2) > 0) {
      P.text(28, 68, 'sorted', { size: 11, bold: true, color: DIM });
      P.line(x0, axisY, x1, axisY, { stroke: BORDER, sw: 1.4 });
      STAT.sorted.forEach(function (v, i) {
        var on = beat(t, sc, 0.7 + i * 0.12, 1.2 + i * 0.12);
        P.alpha(on);
        P.circle(X(v), axisY, 5, { fill: v === 69 ? BADDIM : ACCDIM, stroke: v === 69 ? BAD : ACC, sw: 1.2 });
        P.text(X(v), 268 + (i % 2) * 18, String(v), { size: 10.5, color: v === 69 ? BAD : DIM, align: 'center' });
        P.alpha(1);
      });
    }

    if (beat(t, sc, 2.2, 3.4) > 0) {
      P.line(X(13.5), 152, X(13.5), axisY, { stroke: VAL, sw: 1.6, dash: [5, 4] });
      P.text(X(13.5), 142, 'median 13.5', { size: 12, bold: true, color: VAL, align: 'center', base: 'bottom' });
      P.text(X(13.5), 160, '5th and 6th', { size: 10.5, color: DIM, align: 'center' });
    }
    if (beat(t, sc, 3.6, 4.8) > 0) {
      P.line(X(18.7), 104, X(18.7), axisY, { stroke: INFO, sw: 1.6, dash: [5, 4] });
      P.text(X(18.7), 96, 'mean 18.7', { size: 12, bold: true, color: INFO, align: 'center', base: 'bottom' });
      P.text(X(18.7), 118, '187 / 10', { size: 10.5, color: DIM, align: 'center' });
    }

    if (beat(t, sc, 5, 6.2) > 0) {
      var xs = [28, 310, 592];
      var labels = [
        { k: 'MEDIAN', v: '13.5', s: 'position 5 and 6, averaged' },
        { k: 'MEAN', v: '18.7', s: 'sum 187 over 10 values' },
        { k: 'MODE', v: '11', s: 'appears twice, the most of any value' }
      ];
      labels.forEach(function (L, i) {
        card(xs[i], 312, 270, 76, i === 0 ? VAL : BORDER, SURF);
        P.text(xs[i] + 12, 324, L.k, { size: 10.5, bold: true, color: i === 0 ? VAL : DIM });
        P.text(xs[i] + 12, 342, L.v, { size: 17, bold: true, color: INK });
        P.text(xs[i] + 12, 368, L.s, { size: 10.5, color: DIM });
      });
    }
    if (beat(t, sc, 6.2, 7.4) > 0) {
      P.text(28, 406, 'five of the ten values lie above the median, and five below: half, and never more', { size: 12.5, color: INK });
      P.text(28, 428, 'drop the 69 and the mean falls to ' + r2(STAT.meanWithout) + '; the median moves to ' + STAT.medianWithout + ' — that is resistance', { size: 12.5, color: DIM });
    }
  }

  /* ---------- scene 7 ---------- */
  function drawProb(t, sc) {
    heading('Probability: count the complement',
      'three tosses and a bag of five red and three blue — both counted exhaustively');

    /* the eight outcomes */
    if (beat(t, sc, 0.4, 2) > 0) {
      P.text(28, 68, 'three tosses, eight outcomes', { size: 11, bold: true, color: DIM });
      PROB.toss.forEach(function (o, i) {
        var col = i % 4, row = Math.floor(i / 4);
        var x = 28 + col * 106, y = 82 + row * 50;
        var on = beat(t, sc, 0.6 + i * 0.15, 1.1 + i * 0.15);
        P.alpha(on);
        var bad = o.heads === 0;
        P.rect(x, y, 96, 40, { fill: bad ? BADDIM : ACCDIM, stroke: bad ? BAD : VAL, radius: 5, sw: 1.3 });
        P.text(x + 48, y + 20, o.label, { size: 14, bold: true, color: bad ? BAD : VAL, align: 'center', base: 'middle', mono: true });
        P.alpha(1);
      });
      P.text(28, 214, 'at least one head: 7 of 8', { size: 13, bold: true, color: VAL });
      P.text(28, 236, 'no head at all: 1 of 8', { size: 13, bold: true, color: BAD });
    }

    /* the bag */
    if (beat(t, sc, 2.4, 4) > 0) {
      P.text(470, 68, 'five red, three blue, two drawn', { size: 11, bold: true, color: DIM });
      for (var i = 0; i < 5; i++) {
        P.circle(490 + i * 38, 96, 14, { fill: BADDIM, stroke: BAD, sw: 1.3 });
        P.text(490 + i * 38, 96, 'R', { size: 11, bold: true, color: BAD, align: 'center', base: 'middle' });
      }
      for (var j = 0; j < 3; j++) {
        P.circle(490 + j * 38, 134, 14, { fill: SURF2, stroke: INFO, sw: 1.3 });
        P.text(490 + j * 38, 134, 'B', { size: 11, bold: true, color: INFO, align: 'center', base: 'middle' });
      }
      P.text(470, 176, 'pairs in all: 8 choose 2 = ' + PROB.pairs, { size: 12.5, color: INK });
      P.text(470, 198, 'both blue: 3 choose 2 = ' + PROB.bothBlue, { size: 12.5, color: INK });
      P.text(470, 220, 'at least one red: ' + PROB.atLeastOneRed + ' of ' + PROB.pairs, { size: 12.5, bold: true, color: VAL });
    }

    if (beat(t, sc, 4, 5.4) > 0) {
      card(28, 258, 844, 56, ACC, SURF2);
      P.text(44, 272, 'P(at least one) = 1 - P(none)', { size: 16, bold: true, color: ACC, mono: true });
      P.text(44, 296, 'seven eighths, and twenty-five over twenty-eight: the complement turned many cases into one', { size: 11.5, color: DIM });
    }
    if (beat(t, sc, 5.4, 6.6) > 0) {
      P.text(28, 340, 'with replacement the bag answer would be 1 - (3/8) squared = ' + r3(PROB.pReplace) + ', so replacement matters', { size: 12.5, color: INK });
      P.text(28, 366, 'the complement of at least one is none, not exactly one', { size: 12.5, color: WARN });
      P.text(28, 396, 'adding three separate one-half chances gives three halves, which is not a probability', { size: 12, color: DIM });
    }
  }

  /* ---------- scene 8 ---------- */
  function drawSeries(t, sc) {
    heading('Series: run the recurrence backwards',
      'GATE CSE 2023 GA Q3 — F(n+1) = F(n) + F(n-1), with F6 = 37 and F7 = 60');

    var bw = 108, gap = 12, y = 120, bh = 64;
    for (var i = 1; i <= 7; i++) {
      var x = 28 + (i - 1) * (bw + gap);
      var known = (i === 6 || i === 7);
      /* the derivation order is 5, 4, 3, 2, 1 */
      var revealAt = known ? 0.4 : 0.4 + (6 - i) * 1.05;
      var on = beat(t, sc, revealAt, revealAt + 0.8);
      P.alpha(known ? 1 : on);
      P.rect(x, y, bw, bh, {
        fill: known ? ACCDIM : SURF2,
        stroke: known ? ACC : BORDER,
        radius: 6, sw: 1.4
      });
      if (known || on > 0.3) {
        P.text(x + bw / 2, y + bh / 2, String(SERIES.f[i]), {
          size: 24, bold: true, color: known ? ACC : INK, align: 'center', base: 'middle'
        });
      }
      P.text(x + bw / 2, y + bh + 12, 'F' + i, { size: 11, color: DIM, align: 'center' });
      P.alpha(1);
    }

    /* the subtraction chain */
    SERIES.steps.forEach(function (s, i) {
      var on = beat(t, sc, 1.2 + i * 1.05, 2 + i * 1.05);
      if (on <= 0) return;
      P.alpha(on);
      P.text(28, 236 + i * 26, 'F' + (s.from - 1) + ' = F' + s.from + ' - F' + (s.from - 1) + '  =  ' + s.hi + ' - ' + s.lo + '  =  ' + s.result, {
        size: 12.5, color: INK, mono: true
      });
      P.alpha(1);
    });

    if (beat(t, sc, 6, 7.2) > 0) {
      card(28, 372, 844, 52, VAL, SURF);
      P.text(44, 384, 'the first term is 4 — official key A', { size: 15, bold: true, color: VAL });
      P.text(44, 408, 'forward check: ' + SERIES.forward.join(', ') + ' — both given terms come out exactly', { size: 11.5, color: DIM, mono: true });
    }
  }

  /* ---------- scene 9 ---------- */
  function drawEst(t, sc) {
    heading('Estimation: name the size before the digits',
      'two facts, computed rather than quoted');

    var cards = [
      { k: 'TEN DOUBLINGS', a: '2^10 = ' + EST.p10, b: 'call it 10^3', c: 'error ' + (100 * EST.err2_10).toFixed(1) + '%', d: 'log10 = ' + r3(EST.log10p10) },
      { k: 'DOUBLING TIME', a: '1.05^14 = ' + r2(EST.g14), b: '1.05^15 = ' + r2(EST.g15), c: '72 / 5 = ' + EST.rule72, d: 'years to double' },
      { k: 'SIZE LADDER', a: '2^20 ~ ' + (EST.p20 / 1e6).toFixed(2) + ' million', b: '2^30 ~ ' + (EST.p30 / 1e9).toFixed(2) + ' billion', c: '2^40 ~ ' + (EST.p40 / 1e12).toFixed(2) + ' trillion', d: 'ten doublings, three digits' }
    ];
    cards.forEach(function (c, i) {
      var on = beat(t, sc, 0.5 + i * 1.2, 1.6 + i * 1.2);
      if (on <= 0) return;
      var x = 28 + i * 282;
      P.alpha(on);
      card(x, 76, 270, 152, on > 0.6 ? ACC : BORDER, SURF);
      P.text(x + 14, 90, c.k, { size: 10.5, bold: true, color: ACC });
      P.text(x + 14, 116, c.a, { size: 13, color: INK, mono: true });
      P.text(x + 14, 142, c.b, { size: 13, color: INK, mono: true });
      P.text(x + 14, 168, c.c, { size: 13, color: INK, mono: true });
      P.text(x + 14, 200, c.d, { size: 11, color: DIM });
      P.alpha(1);
    });

    if (beat(t, sc, 4, 5.4) > 0) {
      card(28, 250, 844, 58, BORDER, SURF2);
      P.text(44, 264, 'estimate to eliminate, compute to decide', { size: 15, bold: true, color: ACC });
      P.text(44, 288, 'an estimate that differs from your answer by a factor of ten is an arithmetic slip, and five seconds finds it', { size: 11.5, color: DIM });
    }
    if (beat(t, sc, 5.4, 6.6) > 0) {
      P.text(28, 334, 'compounding is repeated doubling in disguise: 1 + 0.05 x 14 = ' + r2(EST.simple14) + ' simple, against ' + r2(EST.g14) + ' compounded', { size: 12.5, color: INK });
      P.text(28, 360, 'so five per cent of the original, added fourteen times, is not a doubling', { size: 12.5, color: WARN });
      P.text(28, 392, 'seventy-two is tuned near eight per cent: at one per cent a year the true doubling time is about seventy', { size: 12, color: DIM });
      P.text(28, 414, 'an estimate is not an excuse for a wrong order of magnitude — the size is what is being asked', { size: 12, color: DIM });
    }
  }

  /* ---------- scene 10 ---------- */
  function drawProc(t, sc) {
    heading('The five-step procedure', 'in the order they should be tried');

    var rows = [
      { k: 'Name the base', d: 'and write down what it is a total of; most wrong options are right arithmetic on the wrong base' },
      { k: 'Write the chain with units', d: 'percent x total, then divide by the rate; if the units do not cancel, the chain is wrong' },
      { k: 'For a shape: the conserved quantity', d: 'area survives rolling and volume does not; a side to an area squares, to a volume cubes' },
      { k: 'Sort before a median, count before a probability', d: 'an even sample averages two central values; the complement is usually the shorter count' },
      { k: 'Estimate, compute, then compare', d: 'ten doublings are three digits and 72 over the rate is the doubling time; a factor of ten means a slip' }
    ];
    rows.forEach(function (r, i) {
      var on = beat(t, sc, 0.3 + i * 1.15, 1.2 + i * 1.15);
      if (on <= 0) return;
      var y = 70 + i * 68;
      P.alpha(on);
      card(28, y, 844, 58, on > 0.6 ? ACC : BORDER, SURF);
      P.circle(54, y + 29, 15, { fill: ACCDIM, stroke: ACC, sw: 1.3 });
      P.text(54, y + 29, String(i + 1), { size: 12, bold: true, color: ACC, align: 'center', base: 'middle' });
      P.text(82, y + 10, r.k, { size: 13.5, bold: true, color: INK });
      P.text(82, y + 33, r.d, { size: 11.5, color: DIM });
      P.alpha(1);
    });

    if (beat(t, sc, 6, 7.4) > 0) {
      P.text(28, 424, 'five moves, and every question in Section 2 is answered by one of them', { size: 12.5, bold: true, color: ACC });
    }
  }

  /* ---------- dispatch ---------- */

  var SCENE_DRAW = {
    ask: drawAsk,
    base: drawBase,
    data: drawData,
    log: drawLog,
    mens: drawMens,
    stat: drawStat,
    prob: drawProb,
    series: drawSeries,
    est: drawEst,
    proc: drawProc
  };

  function drawFrame(painter) {
    P = painter;
    if (!P) return;
    P.alpha(1);
    P.clear();
    var st = K.state, tl = window.LESSON_TIMELINE;
    if (!tl) return;
    var t = st.elapsed, scenes = tl.scenes, i = 0;
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
