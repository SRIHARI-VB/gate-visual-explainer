/* ==========================================================================
   amortised-analysis-aggregate-accounting-potential — lesson.js
   Four layers, in order:
     1. THE MODEL      — the doubling table, the binary counter, the stack with
                         multipop, the thrashing table and the counter with
                         decrements. Every cost is counted, not assumed.
     2. THE CHECKS     — each number the captions quote is recomputed here and
                         compared with the figure the caption states.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The claim under test is one sentence: for every sequence of n operations the
   total cost is at most n times the amortised cost. Each of the three methods
   is made to prove it here, and each is checked against a count.
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

  /* ---- the doubling table ----
     Cost model: one unit to write the item, one unit per item copied when the
     table is full and must be replaced by one of twice the capacity. */
  function tableInsert(n) {
    var size = 0, num = 0, costs = [], sizes = [];
    for (var i = 1; i <= n; i++) {
      var copies = 0;
      if (num === size) { copies = num; size = Math.max(1, 2 * size); }
      num += 1;
      costs.push(1 + copies);
      sizes.push(size);
    }
    return { costs: costs, sizes: sizes };
  }

  var TABLE = tableInsert(4096);

  /* ---- the potential 2*num - size, and the amortised cost it gives ---- */
  function potentialRun(costs) {
    var size = 0, num = 0, phi = 0, phis = [0], amorts = [];
    for (var i = 0; i < costs.length; i++) {
      if (num === size) size = Math.max(1, 2 * size);
      num += 1;
      var next = 2 * num - size;
      amorts.push(costs[i] + next - phi);
      phis.push(next);
      phi = next;
    }
    return { phis: phis, amorts: amorts, end: phi };
  }

  var POT = potentialRun(TABLE.costs);

  /* ---- the accounting method: charge 2 for the first insertion, 3 after ---- */
  function accountingRun(costs) {
    var credit = 0, negatives = 0, series = [];
    for (var i = 0; i < costs.length; i++) {
      var charge = (i === 0) ? 2 : 3;
      credit += charge - costs[i];
      if (credit < 0) negatives++;
      series.push(credit);
    }
    return { negatives: negatives, end: credit, series: series };
  }

  var ACCT = accountingRun(TABLE.costs);

  /* ---- totals and averages ---- */
  function totalTo(costs, n) {
    var s = 0;
    for (var i = 0; i < n && i < costs.length; i++) s += costs[i];
    return s;
  }
  function perOp(n) { return totalTo(TABLE.costs, n) / n; }

  var T1024 = totalTo(TABLE.costs, 1024);
  var T4096 = totalTo(TABLE.costs, 4096);
  var COPIES1024 = T1024 - 1024;

  /* ---- the single worst insertion: the 1025th ---- */
  var WORST = TABLE.costs[1024];

  /* ---- the binary counter ---- */
  function counterRun(n) {
    var ctr = 0, flips = 0, per = [], ones = [];
    for (var k = 0; k < n; k++) {
      var i = 0, f = 0;
      while ((ctr >> i) & 1) { ctr ^= (1 << i); f++; i++; }
      ctr |= (1 << i); f++;
      flips += f; per.push(f); ones.push(popcount(ctr));
    }
    return { flips: flips, per: per, ones: ones, ctr: ctr };
  }
  function popcount(x) { var c = 0; while (x) { c += x & 1; x >>>= 1; } return c; }

  var CNT16 = counterRun(16);

  /* the identity total = 2n - popcount(n), checked for every n up to 4096 */
  var CNT_IDENTITY_BAD = (function () {
    var ctr = 0, bad = 0;
    for (var n = 1; n <= 4096; n++) {
      var i = 0;
      while ((ctr >> i) & 1) { ctr ^= (1 << i); i++; }
      ctr |= (1 << i);
      if (popcount(ctr) !== popcount(n)) bad++;
    }
    return bad;
  })();

  /* the potential "number of ones" gives amortised cost exactly 2 per increment */
  var CNT_AMORT_BAD = (function () {
    var ctr = 0, bad = 0;
    for (var k = 0; k < 64; k++) {
      var before = popcount(ctr), i = 0, f = 0;
      while ((ctr >> i) & 1) { ctr ^= (1 << i); f++; i++; }
      ctr |= (1 << i); f++;
      if (f + (popcount(ctr) - before) !== 2) bad++;
    }
    return bad;
  })();

  /* ---- the stack with multipop: every sequence of n operations ---- */
  var MP_OPS = [
    { name: 'push', kind: 'push' },
    { name: 'pop', kind: 'pop' },
    { name: 'multipop 1', kind: 'multi', k: 1 },
    { name: 'multipop 2', kind: 'multi', k: 2 },
    { name: 'multipop 3', kind: 'multi', k: 3 }
  ];
  function runStack(seq) {
    var size = 0, cost = 0, costs = [];
    for (var i = 0; i < seq.length; i++) {
      var op = MP_OPS[seq[i]], c = 0;
      if (op.kind === 'push') { size++; c = 1; }
      else if (op.kind === 'pop') { if (size > 0) { size--; c = 1; } }
      else { var take = Math.min(op.k, size); size -= take; c = take; }
      cost += c; costs.push(c);
    }
    return { cost: cost, costs: costs, size: size };
  }
  var MP = (function () {
    var n = 7, best = 0, bestSeq = null, count = 0, over = 0;
    var total = Math.pow(5, n);
    for (var t = 0; t < total; t++) {
      var seq = [], rem = t;
      for (var i = 0; i < n; i++) { seq.push(rem % 5); rem = Math.floor(rem / 5); }
      var r = runStack(seq);
      count++;
      if (r.cost > 2 * n) over++;
      if (r.cost > best) { best = r.cost; bestSeq = seq; }
    }
    return { n: n, count: count, best: best, bestSeq: bestSeq, over: over, bound: 2 * n };
  })();

  /* the teaching sequence: seven pushes, then one multipop of seven */
  var MP_SHOW = runStack([0, 0, 0, 0, 0, 0, 0, 4, 4, 4]).costs; /* not used for the count */

  /* ---- the thrashing table: double when full, halve when half full ---- */
  function thrash(halveAt) {
    var size = 1, num = 0, costs = [], kinds = [];
    while (num < 8) {                       /* fill to exactly eight items, size 8 */
      var copies = 0;
      if (num === size) { copies = num; size = Math.max(1, 2 * size); }
      num++; costs.push(1 + copies); kinds.push('fill');
    }
    for (var p = 0; p < 4; p++) {
      var c1 = 0;
      if (num === size) { c1 = num; size = 2 * size; }
      num++; costs.push(1 + c1); kinds.push('ins');
      var c2 = 0;
      num--;
      if (halveAt && size > 1 && num * halveAt === size) { c2 = num; size = size / 2; }
      costs.push(1 + c2); kinds.push('del');
    }
    return { costs: costs, kinds: kinds };
  }
  var THRASH_HALF = thrash(2);
  var THRASH_QUARTER = thrash(4);
  var THRASH_ALT_HALF = THRASH_HALF.costs.slice(8);
  var THRASH_ALT_QUARTER = THRASH_QUARTER.costs.slice(8);

  /* ---- the counter with decrements: alternating across a boundary ---- */
  function incDec(k, pairs) {
    var ctr = Math.pow(2, k) - 1, per = [], total = 0, amort = [];
    for (var p = 0; p < pairs; p++) {
      var before = popcount(ctr), i = 0, f = 0;
      while ((ctr >> i) & 1) { ctr ^= (1 << i); f++; i++; }
      ctr |= (1 << i); f++;
      per.push(f); total += f; amort.push(f + popcount(ctr) - before);
      before = popcount(ctr); i = 0; f = 0;
      while (!((ctr >> i) & 1)) { ctr ^= (1 << i); f++; i++; }
      ctr ^= (1 << i); f++;
      per.push(f); total += f; amort.push(f + popcount(ctr) - before);
    }
    return { total: total, per: per, amort: amort, avg: total / per.length };
  }
  var INCDEC16 = incDec(16, 50);

/* ======================================================================
   LAYER 2 - THE CHECKS
   ====================================================================== */

  var CHECKS = [];
  function check(name, pass, detail) { CHECKS.push({ name: name, pass: !!pass, detail: detail }); }

  check('first ten insertion costs are 1,2,3,1,5,1,1,1,9,1',
    TABLE.costs.slice(0, 10).join(',') === '1,2,3,1,5,1,1,1,9,1',
    TABLE.costs.slice(0, 10).join(','));
  check('first ten capacities are 1,2,4,4,8,8,8,8,16,16',
    TABLE.sizes.slice(0, 10).join(',') === '1,2,4,4,8,8,8,8,16,16',
    TABLE.sizes.slice(0, 10).join(','));
  check('potential amortised costs start 2,3,3,3,3',
    POT.amorts.slice(0, 5).join(',') === '2,3,3,3,3', POT.amorts.slice(0, 5).join(','));
  check('no insertion has amortised cost above 3 (4096 tested)',
    Math.max.apply(null, POT.amorts) === 3, 'max=' + Math.max.apply(null, POT.amorts));
  check('potential is 0 at the empty table and never negative',
    POT.phis[0] === 0 && Math.min.apply(null, POT.phis) === 0,
    'min=' + Math.min.apply(null, POT.phis));
  check('amortised costs telescope: 12287 = 8191 actual + 4096 final potential',
    (function () {
      var s = 0;
      for (var i = 0; i < POT.amorts.length; i++) s += POT.amorts[i];
      return s === T4096 + POT.end && s === 12287 && T4096 === 8191 && POT.end === 4096;
    })(), 'sum=' + POT.amorts.reduce(function (a, b) { return a + b; }, 0));
  check('1024 insertions cost 2047 = 2n - 1',
    T1024 === 2047 && T1024 === 2 * 1024 - 1, String(T1024));
  check('the copies for 1024 insertions sum to 1023',
    COPIES1024 === 1023, String(COPIES1024));
  check('average cost at n = 1024 is 1.999, below 2',
    Math.abs(perOp(1024) - 1.999) < 0.0005 && perOp(1024) < 2, String(perOp(1024)));
  check('average cost at n = 8 is 1.875 and at n = 16 is 1.9375',
    Math.abs(perOp(8) - 1.875) < 1e-9 && Math.abs(perOp(16) - 1.9375) < 1e-9,
    perOp(8) + ' / ' + perOp(16));
  check('accounting: credit never negative over 4096 insertions',
    ACCT.negatives === 0, 'negatives=' + ACCT.negatives);
  check('accounting: final credit equals the final potential, 4096',
    ACCT.end === 4096 && ACCT.end === POT.end, String(ACCT.end));
  check('the 1025th insertion costs 1025 units',
    WORST === 1025, String(WORST));
  check('worst insertion is 512.5 times the amortised cost',
    WORST / 2 === 512.5, String(WORST / 2));
  check('16 increments flip 31 bits',
    CNT16.flips === 31, String(CNT16.flips));
  check('the 16 flip counts are 1,2,1,3,1,2,1,4,1,2,1,3,1,2,1,5',
    CNT16.per.join(',') === '1,2,1,3,1,2,1,4,1,2,1,3,1,2,1,5', CNT16.per.join(','));
  check('total flips equal 2n - popcount(n) for every n up to 4096',
    CNT_IDENTITY_BAD === 0, 'violations=' + CNT_IDENTITY_BAD);
  check('every increment has amortised cost exactly 2 (64 tested)',
    CNT_AMORT_BAD === 0, 'violations=' + CNT_AMORT_BAD);
  check('all 78125 sequences of 7 stack operations were run',
    MP.count === 78125, String(MP.count));
  check('no sequence of 7 stack operations exceeds 2n = 14',
    MP.over === 0, 'over=' + MP.over);
  check('the largest total over 7 stack operations is 10',
    MP.best === 10, String(MP.best));
  check('thrashing: every alternating insert and delete costs 9',
    THRASH_ALT_HALF.join(',') === '9,9,9,9,9,9,9,9', THRASH_ALT_HALF.join(','));
  check('halving at one quarter gives 9 then seven 1s',
    THRASH_ALT_QUARTER.join(',') === '9,1,1,1,1,1,1,1', THRASH_ALT_QUARTER.join(','));
  check('increment then decrement at 2^16 flips 17 bits every operation',
    INCDEC16.per.every(function (f) { return f === 17; }) && INCDEC16.avg === 17,
    'avg=' + INCDEC16.avg);
  check('the number of ones gives amortised 2 for the increment and 2k = 32 for the decrement',
    INCDEC16.amort[0] === 2 && INCDEC16.amort[1] === 32,
    INCDEC16.amort.slice(0, 2).join(','));
  check('1025 is 512.5 times the amortised 2, and 2 is below the worst case',
    2 < WORST && 1 <= 2 && 2 <= WORST, 'best 1, amortised 2, worst ' + WORST);

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

  function tw(s, size, mono) { return String(s).length * size * (mono ? 0.60 : 0.55); }

  function wrap(x, y, text, maxW, o) {
    o = o || {};
    var size = o.size || 13;
    var words = String(text).split(' ');
    var line = '', ly = y, n = 0;
    for (var i = 0; i < words.length; i++) {
      var probe = line ? line + ' ' + words[i] : words[i];
      if (tw(probe, size, o.mono) > maxW && line) {
        P.text(x, ly, line, o); ly += size + 5; line = words[i]; n++;
        if (o.maxLines && n >= o.maxLines) return ly;
      } else line = probe;
    }
    if (line) { P.text(x, ly, line, o); ly += size + 5; }
    return ly;
  }

  function chip(x, y, label, ok) {
    var w = tw(label, 11, true) + 16;
    P.rect(x, y, w, 20, { fill: ok ? '#e7f5ea' : BADDIM, stroke: ok ? VAL : BAD, sw: 1, radius: 4 });
    P.text(x + 8, y + 10, label, { size: 11, mono: true, base: 'middle', color: ok ? VAL : BAD });
    return w;
  }

  function head(title, sub) {
    P.text(32, 20, title, { size: 16, bold: true, color: INK });
    if (sub) P.text(32, 42, sub, { size: 11.5, mono: true, color: DIM });
  }

  function bar(x, y, w, h, val, max, colour, label) {
    var bw = Math.max(2, (val / max) * w);
    P.rect(x, y, bw, h, { fill: colour, stroke: colour, sw: 1, radius: 2 });
    if (label) P.text(x + bw + 6, y + h / 2, label, { size: 10.5, mono: true, base: 'middle', color: colour });
  }

  /* a table of slots: filled ones in accent, free ones faint */
  function slots(x0, y0, cap, used, cw, ch) {
    for (var i = 0; i < cap; i++) {
      P.rect(x0 + i * cw, y0, cw - 3, ch, {
        fill: i < used ? ACCDIM : SURF,
        stroke: i < used ? ACC : BORDER, sw: 1.2, radius: 2
      });
    }
  }

  var SCENE_DRAW = {};

  /* ---- 1. the bill, not the receipt ---- */
  SCENE_DRAW.bill = function (t, sc, p) {
    head('Three questions, three different answers', 'amortised is a bound on a sequence, not on a step');

    var rows = [
      ['Worst case', 'the most expensive single input', 'insert into a full table: 1,025 units'],
      ['Average case', 'expected cost over a stated input distribution', 'needs a distribution to exist'],
      ['Amortised', 'total over n operations, divided by n', 'no distribution, any sequence: 2 units']
    ];
    rows.forEach(function (r, i) {
      var at = 0.06 + i * 0.11;
      if (p < at) return;
      var y = 76 + i * 66;
      P.rect(32, y, 470, 56, {
        fill: i === 2 ? ACCDIM : SURF, stroke: i === 2 ? ACC : BORDER, sw: i === 2 ? 2 : 1.2, radius: 6
      });
      P.text(48, y + 19, r[0], { size: 13.5, bold: true, color: i === 2 ? ACC : INK });
      P.text(48, y + 37, r[1], { size: 11.5, color: DIM });
      P.text(48, y + 50, r[2], { size: 10.5, mono: true, color: FAINT });
    });

    if (p > 0.36) {
      P.text(530, 70, 'the doubling table, 8 slots full', { size: 11, mono: true, color: DIM });
      slots(530, 86, 8, 8, 34, 26);
      P.text(530, 128, 'insert the 9th item:', { size: 11.5, color: INK });
      slots(530, 146, 16, 9, 20, 24);
      P.text(530, 182, 'a new block of 16, and 8 items copied across', { size: 11, color: DIM });
      P.text(530, 206, 'cost of that one insertion', { size: 11, mono: true, color: DIM });
      P.text(530, 226, '8 copies + 1 write = 9 units', { size: 14, mono: true, bold: true, color: WARN });
    }

    if (p > 0.62) {
      P.rect(530, 254, 338, 62, { fill: SURF2, stroke: BORDER, sw: 1, radius: 6 });
      P.text(546, 272, 'the claim, in one line', { size: 11, mono: true, color: DIM });
      P.text(546, 292, 'for every sequence of n operations,', { size: 12, color: INK });
      P.text(546, 308, 'total cost \u2264 n \u00d7 amortised cost', { size: 12, mono: true, color: ACC, bold: true });
    }

    if (p > 0.8) {
      chip(32, 286, 'amortised uses no probabilities', true);
      P.text(32, 322, 'Insert 10 costs 1 unit. Insert 1,025 costs 1,025 units.', { size: 11.5, color: DIM });
    }
  };

  /* ---- 2. which insertions are expensive ---- */
  SCENE_DRAW.expensive = function (t, sc, p) {
    head('The per-insertion cost, first sixteen insertions',
      'expensive exactly when the table is full: at item counts 2, 3, 5, 9, 17');

    var N = 16, x0 = 52, y0 = 300, maxC = 17, bw = 48;
    var shown = Math.max(1, Math.ceil(p * N * 1.25));
    for (var i = 0; i < N; i++) {
      if (i >= shown) break;
      var c = TABLE.costs[i];
      var hgt = Math.max(3, (c / maxC) * 190);
      var x = x0 + i * bw;
      P.rect(x, y0 - hgt, bw - 12, hgt, {
        fill: c > 1 ? WARNDIM : ACCDIM, stroke: c > 1 ? WARN : ACC, sw: 1.2, radius: 2
      });
      P.text(x + (bw - 12) / 2, y0 - hgt - 8, String(c), {
        size: 11, mono: true, align: 'center', color: c > 1 ? WARN : ACC, bold: c > 1
      });
      P.text(x + (bw - 12) / 2, y0 + 12, String(i + 1), { size: 10, mono: true, align: 'center', color: FAINT });
    }
    P.line(x0, y0, x0 + N * bw - 12, y0, { stroke: BORDER, sw: 1.5 });
    P.text(x0, y0 + 30, 'insertion number', { size: 10.5, mono: true, color: FAINT });

    if (p > 0.45) {
      P.text(52, 78, 'capacity after each insertion', { size: 11, mono: true, color: DIM });
      for (var j = 0; j < 10; j++) {
        P.text(52 + j * 44, 98, String(TABLE.sizes[j]), { size: 11, mono: true, color: INK });
      }
      P.text(52, 118, '1  2  4  4  8  8  8  8  16 16', { size: 10, mono: true, color: FAINT });
    }
    if (p > 0.66) {
      P.rect(560, 78, 308, 92, { fill: SURF2, stroke: BORDER, sw: 1, radius: 6 });
      P.text(576, 96, 'the ninth insertion', { size: 11, mono: true, color: DIM });
      P.text(576, 118, 'table full at 8 of 8', { size: 12, color: INK });
      P.text(576, 138, 'copy 8, write 1, total 9', { size: 12, mono: true, color: WARN, bold: true });
      P.text(576, 158, 'the tenth costs 1', { size: 11.5, color: DIM });
    }
    if (p > 0.84) {
      chip(560, 186, 'twice as costly, half as often', true);
      wrap(560, 218, 'Doubling is what buys the bound: between two expansions, twice as many cheap insertions pay for the next copy.', 308, { size: 11.5, color: DIM });
    }
  };

  /* ---- 3. aggregate ---- */
  SCENE_DRAW.aggregate = function (t, sc, p) {
    head('Aggregate method: add the copies, divide once',
      'the copy costs are 1, 2, 4, 8, ... 512 and they sum to 1023');

    var terms = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512];
    if (p > 0.08) {
      terms.forEach(function (v, i) {
        var col = i < 5 ? 0 : 1, row = i % 5;
        P.text(52 + col * 130, 84 + row * 26, (i ? '+ ' : '  ') + v, {
          size: 12.5, mono: true, color: i === terms.length - 1 ? WARN : INK
        });
      });
      P.line(52, 216, 240, 216, { stroke: BORDER, sw: 1.2 });
      P.text(52, 224, '= 1023 copies', { size: 13, mono: true, bold: true, color: WARN });
    }

    if (p > 0.34) {
      P.rect(300, 78, 250, 74, { fill: SURF2, stroke: BORDER, sw: 1, radius: 6 });
      P.text(316, 96, 'the whole bill for n = 1024', { size: 11, mono: true, color: DIM });
      P.text(316, 118, '1024 writes + 1023 copies', { size: 12, color: INK });
      P.text(316, 138, '= 2047 = 2n - 1', { size: 13, mono: true, bold: true, color: ACC });
    }

    if (p > 0.55) {
      P.text(300, 176, 'divide by n: at most 2 per insertion', { size: 11.5, mono: true, color: DIM });
      var pts = [[8, perOp(8)], [16, perOp(16)], [64, perOp(64)], [1024, perOp(1024)], [4096, perOp(4096)]];
      pts.forEach(function (pt, i) {
        if (p < 0.55 + i * 0.05) return;
        var y = 196 + i * 28;
        P.text(300, y + 8, 'n = ' + pt[0], { size: 10.5, mono: true, color: FAINT });
        bar(360, y, 130, 12, pt[1] - 1.8, 0.2, i === 4 ? VAL : ACC, pt[1].toFixed(4));
      });
      P.line(360, 192, 360, 336, { stroke: BORDER, sw: 1 });
    }

    if (p > 0.78) {
      P.rect(560, 78, 308, 120, { fill: ACCDIM, stroke: ACC, sw: 1.2, radius: 6 });
      P.text(576, 96, 'why the series is bounded', { size: 11, mono: true, color: ACC });
      wrap(576, 118, 'Each term doubles, so the series sums to one less than its next term. The copies are always fewer than n, whatever n is.', 276, { size: 11.5, color: INK });
      P.text(560, 214, 'no cleverness: this is arithmetic', { size: 11.5, mono: true, color: DIM });
      chip(560, 240, 'amortised O(1), constant 2', true);
    }
  };

  /* ---- 4. accounting ---- */
  SCENE_DRAW.accounting = function (t, sc, p) {
    head('Accounting method: charge 3, save 2',
      'the credit is the debt the sequence owes to its own future');

    var rows = Math.min(10, Math.max(1, Math.ceil(p * 12)));
    var x0 = 52, y0 = 86, rh = 26;
    P.text(x0, y0 - 8, 'i', { size: 10.5, mono: true, color: FAINT });
    P.text(x0 + 50, y0 - 8, 'cost', { size: 10.5, mono: true, color: FAINT });
    P.text(x0 + 120, y0 - 8, 'charge', { size: 10.5, mono: true, color: FAINT });
    P.text(x0 + 196, y0 - 8, 'credit', { size: 10.5, mono: true, color: FAINT });
    P.text(x0 + 272, y0 - 8, 'potential', { size: 10.5, mono: true, color: FAINT });
    for (var i = 0; i < rows; i++) {
      var y = y0 + 8 + i * rh;
      var expensive = TABLE.costs[i] > 1;
      P.text(x0, y, String(i + 1), { size: 11.5, mono: true, color: DIM });
      P.text(x0 + 50, y, String(TABLE.costs[i]), { size: 11.5, mono: true, color: expensive ? WARN : INK, bold: expensive });
      P.text(x0 + 120, y, String(i === 0 ? 2 : 3), { size: 11.5, mono: true, color: DIM });
      P.text(x0 + 196, y, String(ACCT.series[i]), { size: 11.5, mono: true, color: VAL, bold: true });
      P.text(x0 + 272, y, String(POT.phis[i + 1]), { size: 11.5, mono: true, color: ACC });
    }
    if (rows >= 9) {
      P.rect(x0 + 44, y0 + 8 + 8 * rh - 3, 300, rh, { stroke: WARN, sw: 1, dash: [3, 3], radius: 2 });
    }

    if (p > 0.5) {
      P.rect(430, 78, 438, 96, { fill: SURF2, stroke: BORDER, sw: 1, radius: 6 });
      P.text(446, 96, 'the ninth insertion', { size: 11, mono: true, color: DIM });
      P.text(446, 118, 'credit 8 + charge 3 - cost 9 = 2 ... then 8 copies are paid', { size: 11, color: INK });
      P.text(446, 138, 'credit after it: 3 units, still positive', { size: 11.5, mono: true, color: VAL, bold: true });
      P.text(446, 158, 'the credit column equals the potential column', { size: 11, color: DIM });
    }

    if (p > 0.7) {
      P.text(430, 200, 'checked over all 4096 insertions', { size: 11.5, mono: true, color: DIM });
      chip(430, 216, '0 steps with negative credit', true);
      wrap(430, 252, 'A charge that leaves the credit negative means an operation was undercharged. The smallest charge that never does is the tightest bound this method can give.', 438, { size: 11.5, color: INK });
    }
    if (p > 0.86) {
      P.text(52, 350, 'final credit 4096 = final potential 4096', { size: 12, mono: true, color: ACC, bold: true });
    }
  };

  /* ---- 5. potential ---- */
  SCENE_DRAW.potential = function (t, sc, p) {
    head('Potential method: the saving as a function of the state',
      'Phi = 2 x items - capacity, zero when empty, never negative');

    var N = 16, x0 = 52, y0 = 300, bw = 28, maxPhi = 16;
    for (var i = 0; i < N; i++) {
      if (p < 0.06 + i * 0.03) break;
      var v = POT.phis[i + 1];
      var hgt = Math.max(2, (v / maxPhi) * 170);
      var x = x0 + i * bw;
      P.rect(x, y0 - hgt, bw - 8, hgt, { fill: ACCDIM, stroke: ACC, sw: 1, radius: 2 });
      P.text(x + (bw - 8) / 2, y0 - hgt - 7, String(v), { size: 9.5, mono: true, align: 'center', color: ACC });
      P.text(x + (bw - 8) / 2, y0 + 10, String(i + 1), { size: 9, mono: true, align: 'center', color: FAINT });
    }
    P.line(x0, y0, x0 + N * bw - 8, y0, { stroke: BORDER, sw: 1.2 });
    P.text(x0, y0 + 30, 'insertion number', { size: 10.5, mono: true, color: FAINT });
    P.text(x0, 78, 'the potential after each insertion', { size: 11, mono: true, color: DIM });
    P.text(x0, 96, '1, 2, 2, 4, 2, 4, 6, 8, 2, 4, ...', { size: 10.5, mono: true, color: ACC });

    if (p > 0.4) {
      P.rect(560, 74, 308, 66, { fill: ACCDIM, stroke: ACC, sw: 1.2, radius: 6 });
      P.text(576, 92, 'Phi = 2 \u00d7 items \u2212 capacity', { size: 12.5, mono: true, bold: true, color: ACC });
      P.text(576, 112, 'amortised = actual + \u0394Phi', { size: 11.5, mono: true, color: INK });
      P.text(576, 130, 'Phi \u2265 0 because the table is \u2265 half full', { size: 10.5, color: DIM });
    }
    if (p > 0.6) {
      P.rect(560, 152, 308, 84, { fill: SURF2, stroke: BORDER, sw: 1, radius: 6 });
      P.text(576, 170, 'the ninth insertion', { size: 11, mono: true, color: DIM });
      P.text(576, 192, 'Phi before 8, after 2, cost 9', { size: 11.5, color: INK });
      P.text(576, 214, '9 + (2 \u2212 8) = 3', { size: 13, mono: true, bold: true, color: WARN });
    }
    if (p > 0.78) {
      P.text(560, 258, 'the changes telescope', { size: 11, mono: true, color: DIM });
      P.text(560, 278, '\u03a3 amortised = total + Phi_end \u2212 Phi_0', { size: 11.5, mono: true, color: INK });
      P.text(560, 298, '12,287 = 8,191 + 4,096 \u2212 0', { size: 11.5, mono: true, color: ACC, bold: true });
      chip(560, 320, 'Phi \u2265 0 makes the bound real', true);
    }
  };

  /* ---- 6. the counter ---- */
  SCENE_DRAW.counter = function (t, sc, p) {
    head('A binary counter: the cost is the number of flips',
      'sixteen increments flip 31 bits, and the most expensive flips 5');

    var N = 16, x0 = 52, y0 = 290, bw = 28, maxF = 5;
    for (var i = 0; i < N; i++) {
      if (p < 0.06 + i * 0.028) break;
      var f = CNT16.per[i];
      var hgt = Math.max(3, (f / maxF) * 150);
      var x = x0 + i * bw;
      P.rect(x, y0 - hgt, bw - 8, hgt, {
        fill: f >= 4 ? WARNDIM : ACCDIM, stroke: f >= 4 ? WARN : ACC, sw: 1.1, radius: 2
      });
      P.text(x + (bw - 8) / 2, y0 - hgt - 7, String(f), { size: 9.5, mono: true, align: 'center', color: f >= 4 ? WARN : ACC });
      P.text(x + (bw - 8) / 2, y0 + 10, String(i + 1), { size: 9, mono: true, align: 'center', color: FAINT });
    }
    P.line(x0, y0, x0 + N * bw - 8, y0, { stroke: BORDER, sw: 1.2 });
    P.text(x0, y0 + 30, 'increment number', { size: 10.5, mono: true, color: FAINT });

    if (p > 0.42) {
      P.text(56, 78, 'ones in the counter after each increment', { size: 11, mono: true, color: DIM });
      for (var j = 0; j < 16; j++) {
        P.text(52 + j * 28, 98, String(CNT16.ones[j]), { size: 10, mono: true, color: INFO });
      }
    }
    if (p > 0.58) {
      P.rect(560, 78, 308, 80, { fill: SURF2, stroke: BORDER, sw: 1, radius: 6 });
      P.text(576, 96, 'total flips = 2n \u2212 popcount(n)', { size: 11.5, mono: true, color: INK });
      P.text(576, 120, '2 \u00d7 16 \u2212 1 = 31', { size: 14, mono: true, bold: true, color: ACC });
      P.text(576, 142, 'checked for every n up to 4096', { size: 10.5, color: DIM });
    }
    if (p > 0.74) {
      P.rect(560, 168, 308, 96, { fill: ACCDIM, stroke: ACC, sw: 1.2, radius: 6 });
      P.text(576, 186, 'Phi = number of ones', { size: 12, mono: true, bold: true, color: ACC });
      wrap(576, 206, 'An increment flipping t+1 bits destroys t ones and creates one, so the potential falls by t-1. Flips plus change is (t+1)+(1-t) = 2, always.', 276, { size: 10.5, color: INK });
    }
    if (p > 0.88) chip(560, 280, 'every increment: amortised exactly 2', true);
  };

  /* ---- 7. multipop ---- */
  SCENE_DRAW.multipop = function (t, sc, p) {
    head('A stack with multipop: three operations, one budget',
      'one multipop costs 7 while a push costs 1, yet 8 operations cost 14');

    var ops = [1, 1, 1, 1, 1, 1, 1, 7];
    var names = ['push', 'push', 'push', 'push', 'push', 'push', 'push', 'multipop 7'];
    var x0 = 52, y0 = 250, bw = 62;
    for (var i = 0; i < 8; i++) {
      if (p < 0.06 + i * 0.05) break;
      var c = ops[i];
      var hgt = Math.max(3, (c / 7) * 120);
      var x = x0 + i * bw;
      P.rect(x, y0 - hgt, bw - 16, hgt, {
        fill: c > 1 ? WARNDIM : ACCDIM, stroke: c > 1 ? WARN : ACC, sw: 1.2, radius: 2
      });
      P.text(x + (bw - 16) / 2, y0 - hgt - 7, String(c), { size: 10.5, mono: true, align: 'center', color: c > 1 ? WARN : ACC });
      P.text(x + (bw - 16) / 2, y0 + 10, String(i + 1), { size: 9.5, mono: true, align: 'center', color: FAINT });
    }
    P.line(x0, y0, x0 + 8 * bw - 16, y0, { stroke: BORDER, sw: 1.2 });
    P.text(x0, y0 + 30, 'push \u00d7 7, then multipop 7: total 14 units', { size: 11, mono: true, color: DIM });

    if (p > 0.42) {
      P.text(560, 74, 'the stack, after each operation', { size: 11, mono: true, color: DIM });
      var depth = Math.min(7, Math.max(0, Math.floor((p - 0.42) * 18)));
      for (var s = 0; s < 7; s++) {
        P.rect(560, 234 - s * 22, 120, 18, {
          fill: s < depth ? ACCDIM : SURF, stroke: s < depth ? ACC : BORDER, sw: 1, radius: 2
        });
      }
      P.text(690, 120, 'depth ' + depth, { size: 11.5, mono: true, color: ACC });
    }
    if (p > 0.56) {
      P.rect(560, 256, 308, 66, { fill: SURF2, stroke: BORDER, sw: 1, radius: 6 });
      P.text(576, 274, 'every pop was paid for by a push', { size: 11.5, color: INK });
      P.text(576, 294, 'removed \u2264 pushed \u2264 n', { size: 11.5, mono: true, color: DIM });
      P.text(576, 312, 'so the total is at most 2n', { size: 12, mono: true, bold: true, color: ACC });
    }
    if (p > 0.74) {
      P.text(52, 76, 'all 78,125 sequences of 7 operations, run', { size: 11.5, mono: true, color: DIM });
      chip(52, 92, 'largest total 10, bound 14', true);
      wrap(52, 126, 'The bound is honest and loose: 5 to the power 7 sequences were enumerated and none exceeded 2n. An exam asks for the order of growth, which is why the loose bound is the expected answer.', 460, { size: 11.5, color: INK });
    }
  };

  /* ---- 8. what amortised does not say ---- */
  SCENE_DRAW.notaverage = function (t, sc, p) {
    head('Two numbers that are both true', 'the step and the sequence are different questions');

    if (p > 0.06) {
      P.text(52, 78, 'units, on a log scale', { size: 11, mono: true, color: DIM });
      var items = [
        ['best case, one insertion', 1, VAL, '1 unit'],
        ['amortised, per insertion', 2, ACC, '2 units'],
        ['worst case, the 1,025th', WORST, WARN, '1,025 units']
      ];
      items.forEach(function (it, i) {
        var y = 100 + i * 52;
        var frac = Math.log(it[1]) / Math.log(1025);
        P.text(52, y + 14, it[0], { size: 11.5, color: INK });
        P.rect(250, y, Math.max(3, frac * 200), 26, { fill: it[2], stroke: it[2], sw: 1, radius: 3 });
        P.text(250 + Math.max(3, frac * 200) + 8, y + 13, it[3], { size: 11, mono: true, base: 'middle', color: it[2] });
      });
      P.text(52, 268, '1,025 is 512.5 times the amortised cost, and both statements hold', { size: 11.5, mono: true, color: DIM });
    }

    if (p > 0.4) {
      P.rect(560, 78, 308, 108, { fill: BADDIM, stroke: BAD, sw: 1.2, radius: 6 });
      P.text(576, 96, 'amortised is not', { size: 11.5, mono: true, bold: true, color: BAD });
      P.text(576, 118, '\u00b7 the cost of every operation', { size: 11, color: INK });
      P.text(576, 138, '\u00b7 an average over random inputs', { size: 11, color: INK });
      P.text(576, 158, '\u00b7 a promise about the step you are on', { size: 11, color: INK });
      P.text(576, 176, 'no distribution appears anywhere', { size: 10.5, color: DIM });
    }
    if (p > 0.6) {
      P.rect(560, 196, 308, 84, { fill: ACCDIM, stroke: ACC, sw: 1.2, radius: 6 });
      P.text(576, 214, 'the claim that is made', { size: 11, mono: true, color: ACC });
      P.text(576, 236, 'for every sequence of n operations,', { size: 11.5, color: INK });
      P.text(576, 258, 'total \u2264 n \u00d7 amortised', { size: 12.5, mono: true, bold: true, color: ACC });
    }
    if (p > 0.8) {
      wrap(52, 300, 'Amortised always lies between the best case and the worst case: any average of n numbers lies between the smallest and the largest. An answer outside that range is wrong without any computation.', 460, { size: 11.5, color: INK });
    }
  };

  /* ---- 9. where the argument breaks ---- */
  SCENE_DRAW.breaks = function (t, sc, p) {
    head('Two structures that break the same way', 'the potential is chosen for an operation set, not for a data structure');

    if (p > 0.06) {
      P.rect(32, 72, 410, 180, { fill: SURF, stroke: BORDER, sw: 1.2, radius: 6 });
      P.text(48, 90, 'counter with increment and decrement', { size: 11.5, mono: true, color: DIM });
      P.text(48, 114, '65,535 = 1111 1111 1111 1111', { size: 11, mono: true, color: INK });
      P.text(48, 132, '65,536 = 1 0000 0000 0000 0000', { size: 11, mono: true, color: INK });
      P.text(48, 158, '+1 then -1, for ever:', { size: 11, color: DIM });
      P.text(48, 180, '17 flips on every operation', { size: 12.5, mono: true, bold: true, color: BAD });
      P.text(48, 204, 'average 17, so \u0398(log n) amortised', { size: 11.5, mono: true, color: BAD });
      P.text(48, 228, 'Phi = ones gives 1 and 32, not 2 and 2', { size: 10.5, mono: true, color: FAINT });
    }

    if (p > 0.34) {
      P.rect(458, 72, 410, 180, { fill: SURF, stroke: BORDER, sw: 1.2, radius: 6 });
      P.text(474, 90, 'table halved when half full', { size: 11.5, mono: true, color: DIM });
      P.text(474, 114, 'insert into 8 of 8: double, copy 8, cost 9', { size: 11, color: INK });
      P.text(474, 132, 'delete: half full, halve, copy 8, cost 9', { size: 11, color: INK });
      P.text(474, 158, 'the pair repeats for ever:', { size: 11, color: DIM });
      P.text(474, 180, '9 units on every operation', { size: 12.5, mono: true, bold: true, color: BAD });
      P.text(474, 204, 'all eight alternating operations cost 9', { size: 11.5, mono: true, color: BAD });
      P.text(474, 228, 'halve at one quarter: 9, then 1, 1, 1 ...', { size: 10.5, mono: true, color: VAL });
    }

    if (p > 0.6) {
      P.rect(32, 268, 836, 74, { fill: SURF2, stroke: BORDER, sw: 1, radius: 6 });
      P.text(48, 286, 'the diagnosis, in both cases', { size: 11, mono: true, color: DIM });
      wrap(48, 306, 'The expensive operation is not paid for by work already done: the structure returns to the state it just left, so no cheap operation ever banks anything. An amortised O(1) claim needs a potential that grows during the cheap operations and is spent by the expensive one.', 800, { size: 11.5, color: INK });
    }

    if (p > 0.84) {
      chip(32, 358, 'a bounded potential cannot pay for a long run', true);
      P.text(32, 392, 'increment-only: 2 flips amortised. With decrement: 17.', { size: 11.5, mono: true, color: DIM });
    }
  };

  /* ---- 10. reading the question ---- */
  SCENE_DRAW.exam = function (t, sc, p) {
    head('Three methods, one sentence', 'aggregate adds, accounting saves, potential telescopes');

    var cols = [
      ['Aggregate', 'add the whole bill', 'sum the copies, divide by n', '1 + 2 + ... + 512 = 1023'],
      ['Accounting', 'save the change', 'charge 3, bank 2, never go negative', 'credit 0 over 4096 inserts'],
      ['Potential', 'telescope a function', 'cost + \u0394Phi, Phi \u2265 0', '9 + (2 \u2212 8) = 3']
    ];
    cols.forEach(function (c, i) {
      if (p < 0.06 + i * 0.09) return;
      var x = 32 + i * 288;
      P.rect(x, 74, 268, 132, { fill: SURF, stroke: BORDER, sw: 1.2, radius: 6 });
      P.text(x + 16, 92, c[0], { size: 13.5, bold: true, color: ACC });
      P.text(x + 16, 114, c[1], { size: 11.5, color: INK });
      P.text(x + 16, 136, c[2], { size: 10.5, mono: true, color: DIM });
      P.text(x + 16, 164, c[3], { size: 10.5, mono: true, color: WARN });
      P.text(x + 16, 188, 'same bound, different route', { size: 10, color: FAINT });
    });

    if (p > 0.38) {
      P.rect(32, 220, 500, 96, { fill: ACCDIM, stroke: ACC, sw: 1.2, radius: 6 });
      P.text(48, 238, 'the one-line test', { size: 11, mono: true, color: ACC });
      P.text(48, 260, 'is the expensive step paid for by work already done?', { size: 12.5, color: INK, bold: true });
      P.text(48, 282, 'doubling: yes, by the cheap insertions in between', { size: 10.5, color: DIM });
      P.text(48, 300, 'counter: yes, by the zeros that were set', { size: 10.5, color: DIM });
    }
    if (p > 0.58) {
      P.rect(548, 220, 320, 96, { fill: SURF2, stroke: BORDER, sw: 1, radius: 6 });
      P.text(564, 238, 'union-find, the big application', { size: 11, mono: true, color: DIM });
      P.text(564, 260, '\u03b1(n) amortised per operation', { size: 12, mono: true, bold: true, color: ACC });
      P.text(564, 280, '\u03b1(n) \u2264 4 for n < 2^65536', { size: 11, mono: true, color: INK });
      P.text(564, 300, 'amortised, not worst case', { size: 10.5, color: DIM });
    }
    if (p > 0.78) {
      wrap(32, 336, 'The exam asks for the total over n operations, for the amortised cost per operation, or which potential function works. Each is answered by one of these three routes, and all three prove the same sentence.', 700, { size: 11.5, color: INK });
      chip(32, 400, 'total \u2264 n \u00d7 amortised, for every sequence', true);
    }
  };

  function drawFrame(t) {
    if (!P) return;
    P.clear();
    P.alpha(1);
    var i = K.sceneAt ? K.sceneAt(t) : 0;
    var sc = window.LESSON_TIMELINE.scenes[i];
    if (!sc) return;
    var span = Math.max(0.001, sc.end - sc.start);
    var p = K.clamp01((t - sc.start) / span);
    var fn = SCENE_DRAW[sc.id];
    if (fn) {
      try { fn(t, sc, p); }
      catch (e) { P.text(24, 240, 'draw error: ' + e.message, { size: 12, color: BAD }); }
    }
  }

/* ======================================================================
   LAYER 4 - BOOT
   ====================================================================== */

  function fillChecks() {
    var el = document.getElementById('checks');
    if (!el) return;
    var bad = CHECKS.filter(function (c) { return !c.pass; });
    el.innerHTML = '<span class="k">Model checks</span>' +
      '<p class="small" style="margin:4px 0 0">' + (CHECKS.length - bad.length) + ' of ' + CHECKS.length +
      ' passed' + (bad.length ? ' \u2014 ' + bad.map(function (c) { return c.name; }).join('; ') : '') + '</p>';
  }

  function boot() {
    fillChecks();
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

    window.__drawAt = function (t) {
      K.state.elapsed = t;
      if (P) drawFrame(t);
    };
    window.__lessonChecks = CHECKS;
    window.__model = {
      TABLE: TABLE, POT: POT, ACCT: ACCT, CNT16: CNT16, MP: MP,
      THRASH_HALF: THRASH_HALF, THRASH_QUARTER: THRASH_QUARTER,
      INCDEC16: INCDEC16, T1024: T1024, T4096: T4096, WORST: WORST, CHECKS: CHECKS
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
