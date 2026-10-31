/* ==========================================================================
   best-average-worst-and-amortised-analysis — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The model enumerates every input of a small problem (all 8! orderings of
   eight keys through first-element quicksort, all 6! through insertion sort),
   simulates the dynamic table, the MULTIPOP stack, the binary counter and the
   two-stack queue, and evaluates the accounting and potential charges. The
   drawing code reads those results and performs no arithmetic of its own.
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
  var INVALIDDIM = PAL.invalidDim || '#fbe4e2';

/* ======================================================================
   LAYER 1 - THE MODEL
   Every number this lesson shows is computed here, from the definitions.
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}

function harm(n) { var h = 0; for (var i = 1; i <= n; i++) h += 1 / i; return h; }
function fact(n) { var f = 1; for (var i = 2; i <= n; i++) f *= i; return f; }
function pow2(k) { return Math.pow(2, k); }

/* ---------- all orderings of n distinct keys ---------- */

function allOrderings(n) {
  var a = [], out = [], i;
  for (i = 0; i < n; i++) a.push(i);
  (function rec(k) {
    if (k === n) { out.push(a.slice()); return; }
    for (var j = k; j < n; j++) {
      var t = a[k]; a[k] = a[j]; a[j] = t;
      rec(k + 1);
      t = a[k]; a[k] = a[j]; a[j] = t;
    }
  })(0);
  return out;
}

/* ---------- quicksort with the first element as pivot, counting comparisons ----------
   Every element of the segment other than the pivot is compared with the pivot
   exactly once, so a segment of length m contributes m - 1 comparisons. */

function qsCount(a, lo, hi) {
  if (hi - lo + 1 <= 1) return 0;
  var p = a[lo], i = lo + 1, c = 0, k;
  for (k = lo + 1; k <= hi; k++) {
    c++;
    if (a[k] < p) { var t = a[i]; a[i] = a[k]; a[k] = t; i++; }
  }
  var t2 = a[lo]; a[lo] = a[i - 1]; a[i - 1] = t2;
  return c + qsCount(a, lo, i - 2) + qsCount(a, i, hi);
}

function qsDepth(a, lo, hi) {
  if (hi - lo + 1 <= 1) return 1;
  var p = a[lo], i = lo + 1, k;
  for (k = lo + 1; k <= hi; k++) {
    if (a[k] < p) { var t = a[i]; a[i] = a[k]; a[k] = t; i++; }
  }
  var t2 = a[lo]; a[lo] = a[i - 1]; a[i - 1] = t2;
  return 1 + Math.max(qsDepth(a, lo, i - 2), qsDepth(a, i, hi));
}

/* ---------- insertion sort, counting comparisons ---------- */

function insCount(a) {
  var c = 0;
  for (var i = 1; i < a.length; i++) {
    var x = a[i], j = i - 1;
    while (j >= 0) { c++; if (a[j] > x) { a[j + 1] = a[j]; j--; } else break; }
    a[j + 1] = x;
  }
  return c;
}

/* ---------- the quicksort distribution at n = 8 ---------- */

var QS_N = 8;
var QS_ORD = allOrderings(QS_N);
var QS_COUNTS = [], qsSum = 0, qi;
for (qi = 0; qi < QS_ORD.length; qi++) {
  var cc = qsCount(QS_ORD[qi].slice(), 0, QS_N - 1);
  QS_COUNTS.push(cc); qsSum += cc;
}
var QS_BEST = Math.min.apply(null, QS_COUNTS);
var QS_WORST = Math.max.apply(null, QS_COUNTS);
var QS_MEAN = qsSum / QS_COUNTS.length;
var QS_FORMULA = 2 * (QS_N + 1) * harm(QS_N) - 4 * QS_N;

/* the histogram, one bin per integer count */
var QS_HIST = [];
for (var hb = QS_BEST; hb <= QS_WORST; hb++) {
  var cnt = 0;
  for (qi = 0; qi < QS_COUNTS.length; qi++) if (QS_COUNTS[qi] === hb) cnt++;
  QS_HIST.push({ value: hb, count: cnt });
}
var QS_HIST_MAX = 0;
for (qi = 0; qi < QS_HIST.length; qi++) if (QS_HIST[qi].count > QS_HIST_MAX) QS_HIST_MAX = QS_HIST[qi].count;

/* the median of the distribution: the smallest count whose cumulative reaches half */
var QS_MEDIAN = QS_BEST, cum = 0, half = QS_COUNTS.length / 2;
for (qi = 0; qi < QS_HIST.length; qi++) {
  cum += QS_HIST[qi].count;
  if (cum >= half) { QS_MEDIAN = QS_HIST[qi].value; break; }
}
var QS_MIDRANGE = (QS_BEST + QS_WORST) / 2;

/* the sorted input is the expensive one, and the page checks it is the maximum */
var QS_SORTED_COST = (function () {
  var a = [], i;
  for (i = 0; i < QS_N; i++) a.push(i);
  return qsCount(a, 0, QS_N - 1);
})();

/* ---------- insertion sort: the three cases, and the average checked by brute force ---------- */

function insBest(n) { return n - 1; }
function insWorst(n) { return n * (n - 1) / 2; }
function insAverage(n) { return n * (n - 1) / 4 + n - harm(n); }

var INS_N = 6;
var INS_ORD = allOrderings(INS_N);
var insSum = 0, ii;
for (ii = 0; ii < INS_ORD.length; ii++) insSum += insCount(INS_ORD[ii].slice());
var INS_BRUTE_MEAN = insSum / INS_ORD.length;
var INS_FORMULA = insAverage(INS_N);

/* ---------- the three cases of insertion sort across n ---------- */

var INS_CURVE = [];
for (var n1 = 2; n1 <= 40; n1++) {
  INS_CURVE.push({ n: n1, best: insBest(n1), avg: insAverage(n1), worst: insWorst(n1) });
}
var INS_CURVE_MAX = insWorst(40);

/* A(n) against W(n) for quicksort: the ratio that decides O, Omega and Theta */
var AW_RATIO = [];
var awNs = [8, 16, 64, 1024, 1048576];
for (var ai = 0; ai < awNs.length; ai++) {
  var an = awNs[ai];
  var A = 2 * (an + 1) * harm(an) - 4 * an, Wn = an * (an - 1) / 2;
  AW_RATIO.push({ n: an, avg: A, worst: Wn, ratio: A / Wn });
}
var AW_LAST = AW_RATIO[AW_RATIO.length - 1].ratio;

/* ---------- linear search: the average as a function of the distribution ---------- */

var LIN_N = 10;
function linBest() { return 1; }
function linWorst(n) { return n; }
function linAverage(n, p) { return p * ((n + 1) / 2) + (1 - p) * n; }
var LIN_CASES = [
  { p: 1, label: 'p = 1' },
  { p: 0.5, label: 'p = 0.5' },
  { p: 0.2, label: 'p = 0.2' }
];
for (var li = 0; li < LIN_CASES.length; li++) {
  LIN_CASES[li].value = linAverage(LIN_N, LIN_CASES[li].p);
}

/* ---------- the dynamic table that doubles ---------- */

function tableDoubling(n) {
  var size = 0, num = 0, total = 0, maxCost = 0, costs = [];
  for (var i = 1; i <= n; i++) {
    var c = 1;
    if (num === size) { var ns = size === 0 ? 1 : 2 * size; c += num; size = ns; }
    num++; total += c; costs.push(c);
    if (c > maxCost) maxCost = c;
  }
  return { total: total, costs: costs, maxCost: maxCost, size: size };
}

var DOUB_N = 1024;
var DOUB = tableDoubling(DOUB_N);
var DOUB_AMORTISED = DOUB.total / DOUB_N;

/* the potential method on the same sequence */
var POT_MIN_PHI = Infinity, POT_MAX_CHARGE = 0;
(function () {
  var size = 0, num = 0, phi = 0, phi0 = 0;
  phi0 = 2 * 0 - 0;
  for (var i = 1; i <= DOUB_N; i++) {
    var c = 1;
    if (num === size) { var ns = size === 0 ? 1 : 2 * size; c += num; size = ns; }
    num++;
    var nphi = 2 * num - size;
    var charge = c + nphi - phi;
    if (nphi < POT_MIN_PHI) POT_MIN_PHI = nphi;
    if (charge > POT_MAX_CHARGE) POT_MAX_CHARGE = charge;
    phi = nphi;
  }
})();
var POT_PHI0 = 0;

/* the accounting method: charge three, and watch the bank */
var BANK_MIN = 0;
(function () {
  var size = 0, num = 0, bank = 0;
  for (var i = 1; i <= DOUB_N; i++) {
    var c = 1;
    if (num === size) { var ns = size === 0 ? 1 : 2 * size; c += num; size = ns; }
    num++;
    bank += 3 - c;
    if (bank < BANK_MIN) BANK_MIN = bank;
  }
})();

/* growth by a fixed ten cells instead of doubling */
function tableIncrement(n, step) {
  var size = 0, num = 0, total = 0;
  for (var i = 1; i <= n; i++) {
    var c = 1;
    if (num === size) { c += num; size = size === 0 ? step : size + step; }
    num++; total += c;
  }
  return total;
}
var INC_POINTS = [];
var incNs = [100, 200, 400, 800];
for (var ip = 0; ip < incNs.length; ip++) {
  var inn = incNs[ip], tot = tableIncrement(inn, 10);
  INC_POINTS.push({ n: inn, total: tot, perOp: tot / inn });
}
var INC_LAST_PEROP = INC_POINTS[INC_POINTS.length - 1].perOp;

/* ---------- the stack with MULTIPOP ---------- */

var MULTI = (function () {
  var st = [], total = 0, maxOp = 0, ops = 0, pushes = 0, i, k;
  function push() { st.push(1); total++; ops++; pushes++; }
  function multipop() {
    k = st.length; total += k; ops++;
    if (k > maxOp) maxOp = k;
    st = [];
  }
  for (i = 0; i < 50; i++) push();
  multipop();
  for (i = 0; i < 50; i++) push();
  multipop();
  return { ops: ops, total: total, maxOp: maxOp, pushes: pushes };
})();
var MULTI_AMORTISED = MULTI.total / MULTI.ops;

/* ---------- the binary counter ---------- */

var COUNTER = (function () {
  var n = 1024, flips = 0;
  for (var i = 1; i <= n; i++) {
    var j = i, c = 0;
    while (j % 2 === 0) { c++; j /= 2; }
    flips += c + 1;
  }
  return { n: n, flips: flips };
})();

/* ---------- the queue built from two stacks ---------- */

var QUEUE = (function () {
  var n = 100, s1 = [], s2 = [], total = 0, maxDeq = 0, i;
  for (i = 0; i < n; i++) { s1.push(i); total++; }
  for (i = 0; i < n; i++) {
    if (!s2.length) { while (s1.length) { s2.push(s1.pop()); total++; } }
    var before = s2.length;
    s2.pop(); total++;
    if (before > maxDeq) maxDeq = before;
  }
  return { total: total, n: n, ops: 2 * n, perOp: total / (2 * n), maxDeq: maxDeq };
})();

/* ---------- recursion depth of quicksort at n = 8 ---------- */

var DEPTH = (function () {
  var a = [], i;
  for (i = 0; i < 8; i++) a.push(i);
  var sortedDepth = qsDepth(a.slice(), 0, 7);
  /* a perfectly balanced sequence of pivots: the middle element is chosen each time */
  function balanced(lo, hi) {
    if (hi - lo + 1 <= 1) return 1;
    var mid = Math.floor((lo + hi) / 2);
    return 1 + Math.max(balanced(lo, mid - 1), balanced(mid + 1, hi));
  }
  return { n: 8, sorted: sortedDepth, balanced: balanced(0, 7) };
})();

/* ---------- the chance that random pivots produce the worst case ---------- */

var PROB = [];
var probNs = [8, 16, 32];
for (var pn = 0; pn < probNs.length; pn++) {
  var nn = probNs[pn];
  PROB.push({ n: nn, p: pow2(nn - 1) / fact(nn) });
}

/* ======================================================================
   LAYER 2 - THE CHECKS
   Every claim the page makes about a number is re-verified here, before
   anything is drawn. A failed check is reported on screen, not hidden.
   ====================================================================== */

chk('the enumeration visits all 40,320 orderings of eight keys',
    QS_ORD.length === 40320 && fact(QS_N) === 40320, QS_ORD.length);
chk('the histogram accounts for every ordering',
    QS_HIST.reduce(function (s, b) { return s + b.count; }, 0) === QS_ORD.length,
    QS_HIST.length + ' bins');
chk('the cheapest ordering costs 13 comparisons and the dearest 28',
    QS_BEST === 13 && QS_WORST === 28, QS_BEST + ' / ' + QS_WORST);
chk('the dearest ordering is the sorted input, costing n(n-1)/2',
    QS_SORTED_COST === QS_WORST && QS_WORST === QS_N * (QS_N - 1) / 2, QS_SORTED_COST);
chk('the mean over all orderings is 2(n+1)H(n) - 4n to four places',
    Math.abs(QS_MEAN - QS_FORMULA) < 1e-9 && Math.abs(QS_MEAN - 16.9214) < 5e-5,
    QS_MEAN.toFixed(4) + ' against ' + QS_FORMULA.toFixed(4));
chk('the mean lies between the best and the worst',
    QS_MEAN > QS_BEST && QS_MEAN < QS_WORST, QS_BEST + ' < ' + QS_MEAN.toFixed(2) + ' < ' + QS_WORST);
chk('the median is 16 and differs from the mean, and the midrange is 20.5',
    QS_MEDIAN === 16 && QS_MIDRANGE === 20.5 && Math.abs(QS_MEDIAN - QS_MEAN) > 0.5,
    'median ' + QS_MEDIAN + ', mean ' + QS_MEAN.toFixed(2) + ', midrange ' + QS_MIDRANGE);
chk('insertion sort averaged over all 720 orderings of six keys matches n(n-1)/4 + n - H(n)',
    INS_ORD.length === 720 && Math.abs(INS_BRUTE_MEAN - INS_FORMULA) < 1e-9,
    INS_BRUTE_MEAN + ' against ' + INS_FORMULA);
chk('insertion sort is cheapest on sorted input and dearest on reversed input',
    (function () {
      var s = [], r = [], i;
      for (i = 0; i < 12; i++) { s.push(i); r.push(11 - i); }
      return insCount(s) === insBest(12) && insCount(r) === insWorst(12);
    })(), insBest(12) + ' / ' + insWorst(12));
chk('the average of insertion sort lies between its best and its worst for every n in 2..40',
    INS_CURVE.every(function (c) { return c.best <= c.avg && c.avg <= c.worst; }), INS_CURVE.length + ' sizes');
chk('A(n) is O(W(n)) with constant one: the average never exceeds the worst',
    AW_RATIO.every(function (r) { return r.avg <= r.worst; }), 'checked at ' + AW_RATIO.length + ' sizes');
chk('A(n) is not Omega(W(n)) for quicksort: the ratio falls to 0.00005 by n = 2^20',
    AW_LAST < 1e-4 && AW_RATIO[0].ratio > 0.5, AW_LAST.toExponential(2));
chk('linear search at n = 10 averages 5.5, 7.75 and 9.1 under the three distributions',
    Math.abs(LIN_CASES[0].value - 5.5) < 1e-9 &&
    Math.abs(LIN_CASES[1].value - 7.75) < 1e-9 &&
    Math.abs(LIN_CASES[2].value - 9.1) < 1e-9,
    LIN_CASES.map(function (c) { return c.value; }).join(' / '));
chk('each linear-search average lies between 1 and n, whatever p is',
    LIN_CASES.every(function (c) { return c.value >= linBest() && c.value <= linWorst(LIN_N); }),
    'n = ' + LIN_N);
chk('the first ten doubling costs are 1,2,3,1,5,1,1,1,9,1',
    DOUB.costs.slice(0, 10).join(',') === '1,2,3,1,5,1,1,1,9,1', DOUB.costs.slice(0, 10).join(','));
chk('1,024 insertions cost 2,047 = 2n - 1, so the amortised cost is 2 - 1/n',
    DOUB.total === 2047 && Math.abs(DOUB_AMORTISED - (2 - 1 / DOUB_N)) < 1e-12,
    DOUB.total + ' / ' + DOUB_AMORTISED.toFixed(4));
chk('the dearest single insertion costs 513, which is Theta of n',
    DOUB.maxCost === 513, DOUB.maxCost);
chk('the total for n insertions is at most 3n at every size tested',
    [16, 100, 1024, 4096].every(function (n) { return tableDoubling(n).total <= 3 * n; }), '4 sizes');
chk('the bank balance never goes negative when three is charged',
    BANK_MIN === 0, 'minimum balance ' + BANK_MIN);
chk('the potential 2*items - size is never negative, starts at 0, and charges at most 3',
    POT_MIN_PHI >= 0 && POT_PHI0 === 0 && POT_MAX_CHARGE === 3,
    'min phi ' + POT_MIN_PHI + ', max charge ' + POT_MAX_CHARGE);
chk('growing by a fixed ten makes the cost per operation rise: 10.5 at n = 200 against 40.5 at n = 800',
    Math.abs(INC_POINTS[1].perOp - 10.5) < 1e-9 && Math.abs(INC_LAST_PEROP - 40.5) < 1e-9,
    INC_POINTS.map(function (p) { return p.perOp; }).join(' / '));
chk('the MULTIPOP sequence costs 200 units for 102 operations, while one operation costs 50',
    MULTI.total === 200 && MULTI.ops === 102 && MULTI.maxOp === 50,
    MULTI.total + ' over ' + MULTI.ops + ' operations');
chk('every push is popped at most once, so the total never exceeds 2n',
    MULTI.total === 2 * MULTI.pushes, MULTI.pushes + ' pushes');
chk('the binary counter flips 2,047 bits for 1,024 increments, under 2n',
    COUNTER.flips === 2047 && COUNTER.flips < 2 * COUNTER.n, COUNTER.flips);
chk('the two-stack queue costs 300 for 200 operations, 1.5 each, with one dequeue costing 100',
    QUEUE.total === 300 && Math.abs(QUEUE.perOp - 1.5) < 1e-12 && QUEUE.maxDeq === 100,
    QUEUE.total + ', dearest ' + QUEUE.maxDeq);
chk('quicksort recurses 8 deep on eight sorted keys and 4 deep when the splits balance',
    DEPTH.sorted === 8 && DEPTH.balanced === 4 && DEPTH.balanced === Math.log2(8) + 1,
    DEPTH.sorted + ' against ' + DEPTH.balanced);
chk('the chance of the worst case under random pivots falls: 0.00317 at n = 8, 1.6e-9 at n = 16',
    Math.abs(PROB[0].p - 0.0031746) < 1e-6 && Math.abs(PROB[1].p - 1.5661e-9) < 1e-13 &&
    PROB[0].p > PROB[1].p && PROB[1].p > PROB[2].p,
    PROB.map(function (q) { return q.p.toExponential(2); }).join(' / '));

/* ======================================================================
   LAYER 3 - RENDER
   Reads the model. Performs no arithmetic of its own.
   ====================================================================== */

function prog(t) { return K && K.sceneProgress ? K.sceneProgress(t) : 1; }

function head(t1, t2) {
  P.alpha(1);
  P.text(30, 14, t1, { size: 16, bold: true, color: INK });
  if (t2) P.text(30, 36, t2, { size: 12.5, color: DIM });
}

function panel(x, y, w, h, o) {
  o = o || {};
  P.rect(x, y, w, h, { fill: o.fill || SURF, stroke: o.stroke || BORDER, sw: o.sw || 1.2, radius: 6 });
}

function label(x, y, s, o) {
  o = o || {};
  P.text(x, y, s, { size: o.size || 12, color: o.color || DIM, bold: !!o.bold, mono: !!o.mono, align: o.align || 'left' });
}

function tbl(x, y, cols, rows, o) {
  o = o || {};
  var rh = o.rh || 19, total = 0, i, j;
  for (i = 0; i < cols.length; i++) total += cols[i].w;
  P.rect(x, y, total, rh * (rows.length + 1), { fill: o.fill || SURF, stroke: o.stroke || BORDER, sw: 1 });
  P.rect(x, y, total, rh, { fill: o.headFill || SURF2, stroke: o.stroke || BORDER, sw: 1 });
  var cx = x;
  for (i = 0; i < cols.length; i++) {
    label(cx + 6, y + 5, cols[i].name, { size: o.size || 11.5, bold: true, color: INK });
    cx += cols[i].w;
    if (i < cols.length - 1) P.line(cx, y, cx, y + rh * (rows.length + 1), { stroke: o.stroke || BORDER, sw: 0.8 });
  }
  for (j = 0; j < rows.length; j++) {
    var ry = y + rh * (j + 1);
    if (o.rowFill && o.rowFill[j]) P.rect(x, ry, total, rh, { fill: o.rowFill[j] });
    cx = x;
    for (i = 0; i < cols.length; i++) {
      label(cx + 6, ry + 5, String(rows[j][i] === undefined ? '' : rows[j][i]),
        { size: o.size || 11.5, color: (o.rowColor && o.rowColor[j]) || INK, mono: !!o.mono });
      cx += cols[i].w;
    }
    P.line(x, ry, x + total, ry, { stroke: o.stroke || BORDER, sw: 0.6 });
  }
}

function chip(x, y, text, colour) {
  var w = Math.max(44, text.length * 6.6 + 14);
  P.rect(x, y, w, 19, { fill: colour + '22', stroke: colour, sw: 1, radius: 9 });
  P.text(x + w / 2, y + 4, text, { size: 11, bold: true, color: colour, align: 'center' });
  return w;
}

function bar(x, baseline, w, value, maxValue, maxHeight, colour) {
  var hgt = maxValue === 0 ? 0 : (value / maxValue) * maxHeight;
  if (hgt < 1) hgt = 1;
  P.rect(x, baseline - hgt, w, hgt, { fill: colour + 'cc', stroke: colour, sw: 1, radius: 2 });
}

/* ---------- scene 1: three functions ---------- */
function drawClaims(t) {
  var p = prog(t);
  head('Three functions, not three estimates',
       'Insertion sort drawn from its own definition: the three cases are three curves over the same n');

  var x0 = 96, x1 = 700, yTop = 78, yBase = 372;
  var maxV = INS_CURVE_MAX;
  function px(n) { return x0 + (n - 2) / (40 - 2) * (x1 - x0); }
  function py(v) { return yBase - (v / maxV) * (yBase - yTop); }

  /* axes and gridlines */
  P.line(x0, yTop, x0, yBase, { stroke: BORDER, sw: 1.2 });
  P.line(x0, yBase, x1 + 8, yBase, { stroke: BORDER, sw: 1.2 });
  var ticks = [0, 200, 400, 600, 800];
  for (var i = 0; i < ticks.length; i++) {
    var gy = py(ticks[i]);
    P.line(x0 - 5, gy, x1, gy, { stroke: BORDER, sw: 0.6, dash: [3, 5] });
    label(x0 - 10, gy - 6, String(ticks[i]), { size: 10.5, align: 'right' });
  }
  label(x0 - 10, yBase + 6, '0', { size: 10.5, align: 'right' });
  label(x0, yBase + 24, 'n = 2', { size: 11 });
  label(x1 - 6, yBase + 24, 'n = 40', { size: 11, align: 'right' });
  label(x0 + 4, yTop - 24, 'comparisons', { size: 11, color: DIM });

  var series = [
    { key: 'worst', colour: BAD, value: function (c) { return c.worst; } },
    { key: 'average', colour: WARN, value: function (c) { return c.avg; } },
    { key: 'best', colour: VAL, value: function (c) { return c.best; } }
  ];

  var reveal = Math.min(1, p / 0.75);
  var upto = Math.max(1, Math.floor(reveal * INS_CURVE.length));

  for (var s = 0; s < series.length; s++) {
    var prevX = null, prevY = null;
    for (var j = 0; j < upto; j++) {
      var c = INS_CURVE[j];
      var cx2 = px(c.n), cy2 = py(series[s].value(c));
      if (prevX !== null) P.line(prevX, prevY, cx2, cy2, { stroke: series[s].colour, sw: 2.2 });
      prevX = cx2; prevY = cy2;
    }
  }

  /* legend, in the empty upper-left region the curves leave free */
  var ly = 96;
  for (var g = 0; g < series.length; g++) {
    P.line(112, ly + 6, 140, ly + 6, { stroke: series[g].colour, sw: 2.6 });
    label(148, ly, series[g].key, { size: 11.5, color: INK });
    ly += 20;
  }

  /* the value each curve reaches at n = 40, written at the right edge */
  var endC = INS_CURVE[INS_CURVE.length - 1];
  var marks = [
    { v: endC.worst, txt: '780 at n = 40', colour: BAD },
    { v: endC.avg, txt: '429', colour: WARN },
    { v: endC.best, txt: '39', colour: VAL }
  ];
  for (var m = 0; m < marks.length; m++) {
    var my = py(marks[m].v);
    P.circle(px(40), my, 3.4, { fill: marks[m].colour });
    label(x1 + 18, my - 6, marks[m].txt, { size: 11, color: marks[m].colour, mono: true });
  }

  /* the relation that always holds, and the one that does not */
  panel(30, 398, 840, 54, { fill: ACCDIM, stroke: ACC });
  P.text(46, 408, 'Always true: average is O of worst, because every input costs at most the worst.', { size: 12.5, bold: true, color: INK });
  P.text(46, 428, 'Not always true: average is Omega of worst. Quicksort averages ' + AW_RATIO[0].avg.toFixed(1) +
         ' comparisons at n = 8 and its worst case is ' + AW_RATIO[0].worst + '.', { size: 11.5, color: DIM });
}

/* ---------- scene 2: the adversary ---------- */
function drawAdversary(t) {
  var p = prog(t);
  head('The worst case is an adversary, and it needs two bounds',
       'Ten slots, three inputs, one algorithm: the cost is the maximum over the inputs of size ten');

  var n = 10, bw = 74, gap = 6, x0 = 56, yb = 96, bh = 46;
  var sweep = Math.min(n, Math.ceil(p * 2.4 * n));
  for (var i = 0; i < n; i++) {
    var bx = x0 + i * (bw + gap);
    var hit = i < sweep;
    panel(bx, yb, bw, bh, { fill: hit ? ACCDIM : SURF, stroke: hit ? ACC : BORDER });
    P.text(bx + bw / 2, yb + 8, String(i + 1), { size: 12, mono: true, align: 'center', color: INK });
    P.text(bx + bw / 2, yb + 26, 'a' + (i + 1), { size: 10.5, mono: true, align: 'center', color: DIM });
  }
  label(x0, yb - 18, 'slots, left to right', { size: 11 });

  /* the three inputs and their counts, as a table */
  var rows = [
    ['key is at slot 1', '1', 'best case'],
    ['key is at slot 10', '10', 'one comparison per slot'],
    ['key is absent', '10', 'the adversary\'s choice']
  ];
  var rowFill = [null, null, INVALIDDIM];
  var rowCol = [INK, INK, BAD];
  tbl(56, 176, [{ name: 'input of size 10', w: 300 }, { name: 'comparisons', w: 130 }, { name: 'what it shows', w: 300 }],
      rows, { rh: 24, rowFill: rowFill, rowColor: rowCol });

  panel(56, 292, 788, 62, { fill: SURF2, stroke: BORDER });
  P.text(70, 302, 'Upper half: never more than 10 comparisons, because the loop runs at most 10 times.', { size: 12, color: INK });
  P.text(70, 324, 'Lower half: some input forces all 10 — the absent key — so the worst case is also at least 10.', { size: 12, color: INK });

  panel(56, 366, 788, 84, { fill: ACCDIM, stroke: ACC });
  P.text(70, 376, 'Together those two halves say the worst case is Theta of n. One half alone says only O of n.', { size: 12.5, bold: true, color: INK });
  P.text(70, 398, 'GATE CSE 2024 Set 1 Q17 asked this of a single-pass sortedness check: the answer was both O(N)', { size: 11.5, color: DIM });
  P.text(70, 418, 'and Omega(N), because an already-sorted input never triggers the early exit.', { size: 11.5, color: DIM });
}

/* ---------- scene 3: the distribution ---------- */
function drawDistribution(t) {
  var p = prog(t);
  head('An average is a weighted average, so it needs weights',
       'One algorithm, three distributions: the average moves, the best and the worst do not');

  var x0 = 110, x1 = 800, yl = 168;
  function px(v) { return x0 + (v - 1) / (LIN_N - 1) * (x1 - x0); }

  P.line(x0, yl, x1, yl, { stroke: BORDER, sw: 1.6 });
  for (var v = 1; v <= LIN_N; v++) {
    P.line(px(v), yl - 5, px(v), yl + 5, { stroke: BORDER, sw: 1.2 });
    label(px(v), yl + 12, String(v), { size: 10.5, align: 'center' });
  }
  label(x0, yl + 30, 'position of the key', { size: 11 });

  /* best and worst, pinned */
  P.circle(px(1), yl, 5.5, { fill: VAL, stroke: VAL });
  label(px(1), yl + 48, 'best = 1', { size: 11.5, color: VAL, bold: true });
  P.circle(px(LIN_N), yl, 5.5, { fill: BAD, stroke: BAD });
  label(px(LIN_N) - 60, yl + 48, 'worst = 10', { size: 11.5, color: BAD, bold: true });

  /* the three averages, each at its own height so the labels cannot collide */
  var heights = [yl - 34, yl - 62, yl - 90];
  var cols = [ACC, INFO, WARN];
  for (var i = 0; i < LIN_CASES.length; i++) {
    var cse = LIN_CASES[i];
    var ax = px(cse.value), ay = heights[i];
    P.line(ax, ay, ax, yl - 6, { stroke: cols[i], sw: 1.2, dash: [4, 4] });
    P.circle(ax, ay, 5, { fill: cols[i], stroke: cols[i] });
    label(ax, ay - 20, cse.label + ' gives ' + cse.value.toFixed(2).replace(/\.00$/, '') + ' comparisons',
          { size: 11.5, color: cols[i], bold: true, align: 'center' });
  }

  var rows = [];
  for (var r = 0; r < LIN_CASES.length; r++) {
    rows.push([LIN_CASES[r].label, LIN_CASES[r].value.toFixed(2),
               'p(n+1)/2 + (1-p)n = ' + LIN_CASES[r].value.toFixed(2)]);
  }
  tbl(56, 254, [{ name: 'probability the key is present', w: 250 }, { name: 'average', w: 110 }, { name: 'the formula, at n = 10', w: 420 }],
      rows, { rh: 24, mono: false });

  panel(56, 372, 788, 78, { fill: WARN === PAL.warn ? WARNDIM : SURF2, stroke: WARN });
  P.text(70, 382, 'The best is 1 and the worst is 10 in all three rows. Only the distribution changed.', { size: 12.5, bold: true, color: INK });
  P.text(70, 404, 'So an average quoted without its distribution is not a claim. GATE states the distribution, or asks', { size: 11.5, color: DIM });
  P.text(70, 424, 'only for the worst case, which needs none.', { size: 11.5, color: DIM });
}

/* ---------- scene 4: the histogram ---------- */
function drawHistogram(t) {
  var p = prog(t);
  head('All 40,320 orderings of eight keys: 13, 16.92 and 28',
       'First-element quicksort, every input of size 8 enumerated: one distribution, three cases');

  var x0 = 84, x1 = 852, yBase = 316, maxH = 176;
  var nb = QS_HIST.length;
  var step = (x1 - x0) / nb;
  var bw = step - 6;
  var reveal = Math.min(1, p / 0.7);
  var upto = Math.max(1, Math.ceil(reveal * nb));

  P.line(x0 - 8, yBase, x1 + 6, yBase, { stroke: BORDER, sw: 1.4 });
  for (var i = 0; i < nb; i++) {
    var b = QS_HIST[i];
    var bx = x0 + i * step + 3;
    if (i < upto) {
      var isWorst = b.value === QS_WORST, isBest = b.value === QS_BEST;
      var col = isWorst ? BAD : (isBest ? VAL : ACC);
      bar(bx, yBase, bw, b.count, QS_HIST_MAX, maxH, col);
    }
    label(bx + bw / 2, yBase + 8, String(b.value), { size: 10, align: 'center', mono: true });
  }
  label(x0 - 8, yBase + 26, 'comparisons used by one ordering', { size: 11 });
  label(x1 - 40, yBase + 26, 'count of orderings', { size: 11, align: 'right' });

  function xOfValue(v) { return x0 + (v - QS_BEST) * step + 3 + bw / 2; }

  /* best */
  P.line(xOfValue(QS_BEST), yBase - 8, xOfValue(QS_BEST), yBase - maxH - 12, { stroke: VAL, sw: 1.2, dash: [4, 4] });
  label(xOfValue(QS_BEST) - 4, yBase - maxH - 34, 'best: 13', { size: 11.5, bold: true, color: VAL });

  /* mean */
  P.line(xOfValue(QS_MEAN), yBase - 8, xOfValue(QS_MEAN), yBase - maxH - 46, { stroke: WARN, sw: 1.6, dash: [5, 4] });
  label(xOfValue(QS_MEAN) - 44, yBase - maxH - 68, 'mean: 16.92', { size: 11.5, bold: true, color: WARN });

  /* worst */
  P.line(xOfValue(QS_WORST), yBase - 8, xOfValue(QS_WORST), yBase - maxH - 12, { stroke: BAD, sw: 1.2, dash: [4, 4] });
  label(xOfValue(QS_WORST) - 62, yBase - maxH - 34, 'worst: 28', { size: 11.5, bold: true, color: BAD });

  var rows = [
    ['the three cases', 'best ' + QS_BEST + '   average ' + QS_MEAN.toFixed(2) + '   worst ' + QS_WORST],
    ['closed form', '2(n+1)H(n) - 4n = ' + QS_FORMULA.toFixed(4) + ' at n = 8, the same number'],
    ['mean is not the middle', 'median ' + QS_MEDIAN + ', midrange ' + QS_MIDRANGE.toFixed(1) + ', mean ' + QS_MEAN.toFixed(2)]
  ];
  tbl(56, 350, [{ name: 'reading the distribution', w: 200 }, { name: 'value', w: 604 }], rows, { rh: 22 });
}

/* ---------- scene 5: the sequence ---------- */
function drawSequence(t) {
  var p = prog(t);
  head('Amortised analysis is about a sequence, and no probability enters',
       'A stack with MULTIPOP: one operation costs 50, and 102 operations cost 200');

  var x0 = 64, yBase = 300, maxH = 168;
  var ops = MULTI.ops;
  var bwid = 5.0;
  var maxCost = MULTI.maxOp;

  /* rebuild the per-operation cost list from the same rule the model used */
  var costs = [];
  for (var i = 0; i < 50; i++) costs.push(1);
  costs.push(50);
  for (var j = 0; j < 50; j++) costs.push(1);
  costs.push(50);

  P.line(x0 - 6, yBase, x0 + ops * bwid + 6, yBase, { stroke: BORDER, sw: 1.2 });
  var reveal = Math.min(1, p / 0.8);
  var upto = Math.max(1, Math.ceil(reveal * costs.length));
  for (var k = 0; k < costs.length; k++) {
    if (k >= upto) break;
    var tall = costs[k] > 1;
    bar(x0 + k * bwid, yBase, bwid - 1.2, costs[k], maxCost, maxH, tall ? BAD : ACC);
  }
  label(x0, yBase + 10, 'operation 1', { size: 10.5 });
  label(x0 + ops * bwid - 4, yBase + 10, 'operation 102', { size: 10.5, align: 'right' });
  label(x0, yBase - maxH - 26, 'cost of one operation', { size: 11 });

  /* the two spikes, labelled */
  var spike1 = x0 + 50 * bwid + 2;
  P.line(spike1, yBase - maxH - 6, spike1, yBase - maxH - 20, { stroke: BAD, sw: 1.2 });
  label(spike1 - 6, yBase - maxH - 40, 'MULTIPOP 50', { size: 11, color: BAD, bold: true });

  /* the three statistics, stacked on the right */
  var stats = [
    { k: 'dearest single operation', v: String(MULTI.maxOp), note: 'Theta of n', colour: BAD },
    { k: 'all ' + MULTI.ops + ' operations', v: String(MULTI.total), note: '2n, not n^2', colour: INK },
    { k: 'amortised per operation', v: MULTI_AMORTISED.toFixed(2), note: 'O of 1', colour: VAL }
  ];
  for (var s = 0; s < stats.length; s++) {
    var sy = 86 + s * 68;
    panel(586, sy, 258, 56, { fill: SURF, stroke: stats[s].colour });
    label(600, sy + 8, stats[s].k, { size: 11, color: DIM });
    P.text(600, sy + 24, stats[s].v, { size: 17, bold: true, mono: true, color: stats[s].colour });
    label(700, sy + 30, stats[s].note, { size: 11, color: stats[s].colour });
  }

  panel(56, 336, 788, 108, { fill: ACCDIM, stroke: ACC });
  P.text(70, 346, 'The aggregate argument, in one sentence:', { size: 12.5, bold: true, color: INK });
  P.text(70, 368, 'each item is pushed once and popped once, so the pops over any sequence are at most the pushes,', { size: 12, color: INK });
  P.text(70, 388, 'and n operations cost at most 2n. Divide the total by n and every operation is O of 1 amortised.', { size: 12, color: INK });
  P.text(70, 412, 'Nothing here is random. The bound holds for every sequence, including the one built to be expensive.', { size: 11.5, color: DIM });
}

/* ---------- scene 6: doubling ---------- */
function drawDoubling(t) {
  var p = prog(t);
  head('Doubling a table: one insertion costs 513, and 1,024 cost 2,047',
       'The costs are wildly uneven, which is exactly what an amortised bound is for');

  /* left: the first sixteen costs */
  var x0 = 64, yBase = 288, maxH = 168;
  var show = 16;
  var costs = DOUB.costs.slice(0, show);
  var maxCost = Math.max.apply(null, costs);
  var stepw = 26;
  P.line(x0 - 6, yBase, x0 + show * stepw + 6, yBase, { stroke: BORDER, sw: 1.2 });
  var reveal = Math.min(1, p / 0.6);
  var upto = Math.max(1, Math.ceil(reveal * show));
  for (var i = 0; i < show; i++) {
    if (i >= upto) break;
    var tall = costs[i] > 1;
    bar(x0 + i * stepw, yBase, stepw - 6, costs[i], maxCost, maxH, tall ? BAD : ACC);
    label(x0 + i * stepw + (stepw - 6) / 2, yBase - ((costs[i] / maxCost) * maxH) - 15,
          String(costs[i]), { size: 10, align: 'center', mono: true, color: tall ? BAD : DIM });
  }
  label(x0, yBase + 10, 'insertion 1', { size: 10.5 });
  label(x0 + show * stepw - 6, yBase + 10, 'insertion 16', { size: 10.5, align: 'right' });
  label(x0, yBase - maxH - 26, 'cost of one insertion', { size: 11 });

  /* right: cost per operation against n, doubling against +10 */
  var rx0 = 520, rx1 = 852, ry0 = 96, ry1 = 250;
  var maxPer = 45;
  function rxp(n) { return rx0 + (Math.log(n) - Math.log(100)) / (Math.log(800) - Math.log(100)) * (rx1 - rx0); }
  function ryp(v) { return ry1 - (v / maxPer) * (ry1 - ry0); }
  P.line(rx0, ry0 - 6, rx0, ry1, { stroke: BORDER, sw: 1 });
  P.line(rx0, ry1, rx1, ry1, { stroke: BORDER, sw: 1 });
  label(rx0, ry1 + 10, 'n = 100', { size: 10 });
  label(rx1, ry1 + 10, 'n = 800', { size: 10, align: 'right' });

  /* doubling: flat at 2 */
  P.line(rx0, ryp(2), rx1, ryp(2), { stroke: VAL, sw: 2.4 });
  label(rx1 - 4, ryp(2) - 18, 'doubling: 2 per insertion', { size: 11, color: VAL, bold: true, align: 'right' });

  /* +10: a rising line through the computed points */
  var prevX = null, prevY = null;
  for (var q = 0; q < INC_POINTS.length; q++) {
    var pt = INC_POINTS[q];
    var qx = rxp(pt.n), qy = ryp(pt.perOp);
    if (prevX !== null) P.line(prevX, prevY, qx, qy, { stroke: BAD, sw: 2.4 });
    P.circle(qx, qy, 3.2, { fill: BAD });
    label(qx - 2, qy - 16, pt.perOp.toFixed(1), { size: 10, mono: true, color: BAD, align: 'center' });
    prevX = qx; prevY = qy;
  }
  label(rx0 + 8, ry0 - 20, 'cost per insertion against n', { size: 11 });

  panel(56, 316, 788, 124, { fill: SURF2, stroke: BORDER });
  P.text(70, 326, 'Doubling: 1,024 insertions cost ' + DOUB.total + ', which is 2n - 1, so the amortised cost is ' +
         DOUB_AMORTISED.toFixed(3) + '.', { size: 12.5, bold: true, color: INK });
  P.text(70, 348, 'The dearest single insertion copies ' + (DOUB.maxCost - 1) + ' items and costs ' + DOUB.maxCost +
         ', so no per-operation bound of O of 1 holds.', { size: 11.5, color: DIM });
  P.text(70, 370, 'Growing by a fixed ten instead: the cost per insertion is 5.5 at n = 100, 10.5 at 200, 20.5 at 400', { size: 11.5, color: INK });
  P.text(70, 390, 'and 40.5 at 800 — it grows with n, so the amortised cost is Theta of n, not O of 1.', { size: 11.5, color: INK });
  P.text(70, 414, 'The multiplier is what buys the constant bound, not the copying.', { size: 11.5, color: DIM });
}

/* ---------- scene 7: the two methods ---------- */
function drawMethods(t) {
  var p = prog(t);
  head('Two ways to prove it: the bank balance and the potential',
       'The same sequence, charged twice: three units per insertion by the bank, and c plus the change in potential');

  var rows = [];
  var size = 0, num = 0, phi = 0, bank = 0;
  var show = 8;
  for (var i = 1; i <= show; i++) {
    var c = 1;
    if (num === size) { var ns = size === 0 ? 1 : 2 * size; c += num; size = ns; }
    num++;
    var nphi = 2 * num - size;
    var charge = c + nphi - phi;
    bank += 3 - c;
    rows.push([String(i), String(size), String(num), String(c), '3', String(bank), String(nphi), String(charge)]);
    phi = nphi;
  }
  var reveal = Math.min(rows.length, Math.max(1, Math.ceil(prog(t) * 1.4 * rows.length)));
  var shown = rows.slice(0, reveal);

  tbl(40, 78, [
    { name: 'i', w: 52 }, { name: 'size', w: 58 }, { name: 'items', w: 60 },
    { name: 'c_i', w: 56 }, { name: 'charge', w: 70 }, { name: 'bank', w: 60 },
    { name: 'phi', w: 58 }, { name: 'c_hat', w: 66 }
  ], shown, { rh: 22, mono: true });

  panel(548, 78, 300, 74, { fill: ACCDIM, stroke: ACC });
  P.text(562, 88, 'Accounting', { size: 12.5, bold: true, color: INK });
  P.text(562, 108, 'charge 3, save 3 - c_i', { size: 11.5, mono: true, color: INK });
  P.text(562, 128, 'minimum balance ' + BANK_MIN, { size: 11.5, color: VAL, bold: true });

  panel(548, 164, 300, 74, { fill: SURF2, stroke: BORDER });
  P.text(562, 174, 'Potential', { size: 12.5, bold: true, color: INK });
  P.text(562, 194, 'phi = 2*items - size', { size: 11.5, mono: true, color: INK });
  P.text(562, 214, 'largest charge ' + POT_MAX_CHARGE + ', phi never below ' + POT_MIN_PHI, { size: 11.5, color: VAL, bold: true });

  panel(40, 274, 808, 60, { fill: SURF, stroke: BORDER });
  P.text(54, 284, 'Both methods must show one thing: the sum of the charges is at least the sum of the true costs.', { size: 12.5, bold: true, color: INK });
  P.text(54, 306, 'The bank shows it by never going negative. The potential shows it by never dropping below its start, 0.', { size: 11.5, color: DIM });

  panel(40, 348, 808, 92, { fill: ACCDIM, stroke: ACC });
  P.text(54, 358, 'Why the two agree: summing c_hat = c + phi_i - phi_(i-1) telescopes to the total true cost', { size: 12, color: INK });
  P.text(54, 380, 'plus the final potential minus the initial one, which is at least the total true cost when phi', { size: 12, color: INK });
  P.text(54, 402, 'never goes below zero. So every insertion is charged at most 3, and 1,024 insertions at most 3,072 —', { size: 12, color: INK });
  P.text(54, 422, 'the true total being 2,047.', { size: 12, color: INK });
}

/* ---------- scene 8: space ---------- */
function drawSpace(t) {
  var p = prog(t);
  head('Time and space are separate claims',
       'The syllabus says "worst case time and space complexity": two answers, and the stack is part of the second');

  var rows = [
    ['merge sort', 'n cells', 'log n', 'n log n'],
    ['quicksort, balanced', 'none', 'log n', 'n log n'],
    ['quicksort, sorted input', 'none', 'n', 'n^2'],
    ['heap sort', 'none', 'log n', 'n log n'],
    ['counting sort', 'n + k', 'none', 'n + k']
  ];
  var rowFill = [null, null, INVALIDDIM, null, null];
  var rowCol = [INK, INK, BAD, INK, INK];
  tbl(40, 78, [{ name: 'algorithm', w: 220 }, { name: 'auxiliary array', w: 170 },
               { name: 'recursion stack', w: 170 }, { name: 'time, worst case', w: 170 }],
      rows, { rh: 24, rowFill: rowFill, rowColor: rowCol });

  /* the depth ladder, measured by running the algorithm */
  var lx = 40, ly = 250;
  label(lx, ly - 20, 'recursion depth at n = 8, measured by running it', { size: 11.5, bold: true, color: INK });

  var depth1 = DEPTH.sorted, depth2 = DEPTH.balanced;
  for (var d = 0; d < depth1; d++) {
    var yy = ly + 8 + d * 15;
    P.rect(lx, yy, 14 + d * 10, 11, { fill: INVALIDDIM, stroke: BAD, sw: 1, radius: 2 });
  }
  label(lx + depth1 * 10 + 24, ly + 8 + (depth1 * 15) / 2 - 6,
        'sorted input, first-element pivot: ' + depth1 + ' frames', { size: 11.5, color: BAD, bold: true });

  for (var e = 0; e < depth2; e++) {
    var y2 = ly + 8 + e * 15;
    P.rect(470, y2, 14 + e * 10, 11, { fill: ACCDIM, stroke: ACC, sw: 1, radius: 2 });
  }
  label(470, ly - 2, 'balanced splits: ' + depth2 + ' frames', { size: 11.5, color: ACC, bold: true });

  panel(40, 388, 808, 62, { fill: WARN === PAL.warn ? WARNDIM : SURF2, stroke: WARN });
  P.text(54, 398, 'Quicksort is in place in the array sense and Theta of n in the stack sense on a sorted input.', { size: 12.5, bold: true, color: INK });
  P.text(54, 420, 'An answer that says "O of 1 space" without naming which space is the mark lost on this question.', { size: 11.5, color: DIM });
}

/* ---------- scene 9: randomised ---------- */
function drawRandomised(t) {
  var p = prog(t);
  head('Expected is neither average nor amortised',
       'Four quantities, four questions: over inputs, over a distribution, over a sequence, over coins');

  var cards = [
    { t: 'worst case', q: 'max over inputs', v: 'n^2', note: 'an input exists that forces it', c: BAD },
    { t: 'average case', q: 'mean over a distribution', v: 'needs weights', note: 'state the distribution', c: WARN },
    { t: 'expected', q: 'mean over the coins', v: 'n log n', note: 'for a fixed input', c: INFO },
    { t: 'amortised', q: 'total over a sequence', v: 'O of 1 each', note: 'no probability at all', c: VAL }
  ];
  for (var i = 0; i < cards.length; i++) {
    var cx = 30 + i * 212, cy = 76, cw = 200, ch = 108;
    panel(cx, cy, cw, ch, { fill: SURF, stroke: cards[i].c });
    P.text(cx + 12, cy + 10, cards[i].t, { size: 12.5, bold: true, color: cards[i].c });
    P.text(cx + 12, cy + 32, cards[i].q, { size: 11, color: DIM });
    P.text(cx + 12, cy + 54, cards[i].v, { size: 15, bold: true, mono: true, color: INK });
    P.text(cx + 12, cy + 80, cards[i].note, { size: 10.5, color: DIM });
  }

  panel(30, 198, 842, 76, { fill: SURF2, stroke: BORDER });
  P.text(44, 208, 'Randomised quicksort: the coins remove the adversarial input, not the worst case.', { size: 12.5, bold: true, color: INK });
  P.text(44, 230, 'GATE CSE 2001 Q1.14 asked for its worst case and the answer was O of n squared: some sequence of', { size: 11.5, color: INK });
  P.text(44, 250, 'coin flips picks the smallest remaining key every time, and that run costs n squared.', { size: 11.5, color: INK });

  var rows = [];
  for (var q = 0; q < PROB.length; q++) {
    rows.push([String(PROB[q].n), PROB[q].p.toExponential(3), '2^(n-1) / n!']);
  }
  tbl(30, 290, [{ name: 'keys n', w: 120 }, { name: 'chance the pivots are all bad', w: 260 }, { name: 'closed form', w: 180 }],
      rows, { rh: 22, mono: true });
  label(606, 296, 'The chance falls fast, which is why the', { size: 11, color: DIM });
  label(606, 316, 'expected cost is what gets quoted.', { size: 11, color: DIM });
  label(606, 336, 'It is still not a guarantee: a', { size: 11, color: DIM });
  label(606, 356, 'guarantee is a worst-case claim.', { size: 11, color: DIM });

  panel(30, 400, 842, 50, { fill: ACCDIM, stroke: ACC });
  P.text(44, 410, 'Expected cost assumes a random source. Amortised cost assumes nothing: it is a worst-case bound over', { size: 12, color: INK });
  P.text(44, 430, 'a sequence of operations. Confusing the two is the commonest error in this topic.', { size: 12, color: INK });
}

/* ---------- scene 10: the procedure ---------- */
function drawProcedure(t) {
  var p = prog(t);
  head('The procedure, and the four traps',
       'Four questions, asked in this order, decide every question in this topic');

  var steps = [
    'name the quantity',
    'name the input set',
    'name the bound',
    'check the trap'
  ];
  var notes = [
    'worst, average,\namortised, expected',
    'a distribution, a sequence,\nor a coin',
    'O, Omega or Theta —\nand say which',
    'average is not amortised;\nspace is separate'
  ];
  var bw = 190, gap = 18, x0 = 40, y0 = 78;
  for (var i = 0; i < steps.length; i++) {
    var x = x0 + i * (bw + gap);
    var on = p > 0.06 * (i + 1);
    panel(x, y0, bw, 92, { fill: on ? ACCDIM : SURF2, stroke: on ? ACC : BORDER });
    P.text(x + bw / 2, y0 + 10, String(i + 1), { size: 11, bold: true, align: 'center', color: on ? ACC : DIM });
    P.text(x + bw / 2, y0 + 28, steps[i], { size: 12.5, bold: true, align: 'center', color: INK });
    var lines = notes[i].split('\n');
    for (var l = 0; l < lines.length; l++) {
      P.text(x + bw / 2, y0 + 52 + l * 16, lines[l], { size: 10.5, align: 'center', color: DIM });
    }
    if (i < steps.length - 1) {
      P.arrow(x + bw + 2, y0 + 46, x + bw + gap - 3, y0 + 46, { stroke: ACC, sw: 1.4, head: 6 });
    }
  }

  var traps = [
    'average is not amortised: one is over inputs, the other over a sequence',
    'O is an upper bound, not the worst case: O of n is satisfied by a constant',
    'one cheap operation proves nothing about the dearest one',
    'space is its own answer, and the recursion stack counts'
  ];
  for (var k = 0; k < traps.length; k++) {
    var ty = 196 + k * 34;
    P.rect(40, ty, 12, 12, { fill: WARN, stroke: WARN, radius: 2 });
    P.text(62, ty - 1, traps[k], { size: 12, color: INK });
  }

  panel(40, 344, 820, 96, { fill: ACCDIM, stroke: ACC });
  P.text(54, 354, 'The four quantities, on one line, because the difference is the whole topic:', { size: 12, bold: true, color: INK });
  P.text(54, 378, 'worst case = max over inputs      average case = mean over a stated distribution', { size: 11.5, mono: true, color: INK });
  P.text(54, 400, 'expected = mean over the coins      amortised = total over a sequence, divided by its length', { size: 11.5, mono: true, color: INK });
  P.text(54, 424, 'Only the first two are about a single run. The last two are about many.', { size: 11.5, color: DIM });
}

/* ---------- scene table ---------- */

var DRAW = {
  claims: drawClaims,
  adversary: drawAdversary,
  distribution: drawDistribution,
  histogram: drawHistogram,
  sequence: drawSequence,
  doubling: drawDoubling,
  methods: drawMethods,
  space: drawSpace,
  randomised: drawRandomised,
  procedure: drawProcedure
};

function sceneIdAt(t) {
  var sc = window.LESSON_TIMELINE.scenes;
  for (var i = sc.length - 1; i >= 0; i--) if (t >= sc[i].start - 1e-6) return sc[i].id;
  return sc[0].id;
}

function drawFrame(P2) {
  P = P2;
  P.alpha(1);
  P.clear();
  P.rect(0, 0, W, H, { fill: SURF });
  var id = sceneIdAt(K.state.elapsed);
  var fn = DRAW[id] || drawClaims;
  try { fn(K.state.elapsed); } catch (e) { console.error('scene ' + id, e); }
}

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

/* the model, exposed for the headless check and for anyone reading the source */
window.LESSON_MODEL = {
  harm: harm, fact: fact,
  QS_BEST: QS_BEST, QS_WORST: QS_WORST, QS_MEAN: QS_MEAN, QS_FORMULA: QS_FORMULA,
  QS_MEDIAN: QS_MEDIAN, QS_MIDRANGE: QS_MIDRANGE, QS_HIST: QS_HIST, QS_SORTED_COST: QS_SORTED_COST,
  INS_BRUTE_MEAN: INS_BRUTE_MEAN, INS_FORMULA: INS_FORMULA, INS_CURVE: INS_CURVE,
  AW_RATIO: AW_RATIO,
  LIN_CASES: LIN_CASES, linAverage: linAverage,
  DOUB: DOUB, DOUB_AMORTISED: DOUB_AMORTISED, POT_MIN_PHI: POT_MIN_PHI, POT_MAX_CHARGE: POT_MAX_CHARGE,
  BANK_MIN: BANK_MIN, INC_POINTS: INC_POINTS,
  MULTI: MULTI, MULTI_AMORTISED: MULTI_AMORTISED, COUNTER: COUNTER, QUEUE: QUEUE,
  DEPTH: DEPTH, PROB: PROB
};
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

})();
