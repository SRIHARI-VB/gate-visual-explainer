/* ==========================================================================
   data-interpretation-charts-tables-and-plots — lesson.js
   Four layers, in order:
     1. THE MODEL   — every number this lesson shows, computed here.
     2. THE CHECKS  — each computed value re-verified against a definition.
     3. RENDER      — reads the model; never re-derives it.
     4. BOOT        — p5.js first, the browser's own canvas as the fallback.

   The model holds one small data set — four departments, three years — and
   derives every quantity the lesson quotes from it: totals, shares, pie
   angles, growth rates, percentage points, the two averages, the estimate
   and its band, the truncated-axis ratio and the stacked segment. Nothing is
   typed in twice, so a caption and the canvas cannot disagree.
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
  var SURF = PAL.surface, SURF2 = PAL.surface2, BORDER = PAL.border;
  var ACCDIM = PAL.accentDim || '#d6efeb';
  var WARNDIM = PAL.warnDim || '#fbeed3';
  var INVALIDDIM = PAL.invalidDim || '#fbe4e2';

/* ======================================================================
   LAYER 1 — THE MODEL
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}

var YEARS = [2023, 2024, 2025];
var DEPTS = ['CSE', 'ECE', 'ME', 'CE'];

/* intake, in students. Columns are the years 2023, 2024, 2025. */
var DATA = {
  CSE: [240, 300, 360],
  ECE: [180, 190, 200],
  ME:  [150, 140, 130],
  CE:  [ 90,  70,  60]
};

function sum(a) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return s; }

var TOTALS = YEARS.map(function (_, y) {
  return DEPTS.reduce(function (acc, d) { return acc + DATA[d][y]; }, 0);
});
var GRAND = sum(TOTALS);

/* share of a department in a year: the part over THAT year's total */
function share(dept, y) { return DATA[dept][y] / TOTALS[y]; }

/* a share of s (as a fraction) is 3.6 * s degrees of a pie */
function angle(dept, y) { return share(dept, y) * 360; }

/* growth from the first year to the last, on the first year as base */
function growth(dept) {
  var a = DATA[dept][0], b = DATA[dept][2];
  return (b - a) / a;
}

var SHARES_2025 = DEPTS.map(function (d) { return share(d, 2); });
var SHARES_2023 = DEPTS.map(function (d) { return share(d, 0); });
var ANGLES_2025 = DEPTS.map(function (d) { return angle(d, 2); });
var GROWTH = DEPTS.map(growth);
var CHANGE = DEPTS.map(function (d) { return DATA[d][2] - DATA[d][0]; });

var PP_CSE = (share('CSE', 2) - share('CSE', 0)) * 100;      // percentage points
var REL_CSE = (share('CSE', 2) - share('CSE', 0)) / share('CSE', 0);  // per cent of old share
var WRONG_DEN = DATA.CSE[2] / GRAND;                          // the trap

var MEAN_SIMPLE = sum(GROWTH) / GROWTH.length;
var TOTAL_GROWTH = (TOTALS[2] - TOTALS[0]) / TOTALS[0];
var WEIGHTED = (function () {
  var num = 0, den = 0;
  for (var i = 0; i < DEPTS.length; i++) {
    var base = DATA[DEPTS[i]][0];
    num += GROWTH[i] * base;
    den += base;
  }
  return num / den;
})();

var MORE = (DATA.CSE[2] - DATA.ECE[2]) / DATA.ECE[2];   // CSE against ECE
var LESS = (DATA.CSE[2] - DATA.ECE[2]) / DATA.CSE[2];   // ECE against CSE
var RATIO = DATA.CSE[2] / DATA.ECE[2];

var EST_PART = DATA.ECE[1], EST_TOTAL = TOTALS[1];
var EST_EXACT = EST_PART / EST_TOTAL;      // 0.271428...
var EST_PCT = EST_EXACT * 100;             // 27.142857...
var EST_USED = 27;                          // the answer a candidate would key
var EST_ERR_PTS = EST_PCT - EST_USED;      // in percentage points
var EST_ERR_STUDENTS = EST_PART - (EST_USED / 100) * EST_TOTAL;

var ZERO_HEIGHTS = [DATA.CSE[2], DATA.CE[2]];
var ZERO_RATIO = ZERO_HEIGHTS[0] / ZERO_HEIGHTS[1];
var TRUNC_START = 50;
var TRUNC_HEIGHTS = [DATA.CSE[2] - TRUNC_START, DATA.CE[2] - TRUNC_START];
var TRUNC_RATIO = TRUNC_HEIGHTS[0] / TRUNC_HEIGHTS[1];

var STACK_ME_2023 = share('ME', 0);
var STACK_ME_2025 = share('ME', 2);
var STACK_SEG_CHANGE = (DATA.ME[2] - DATA.ME[0]) / DATA.ME[0];
var STACK_SHARE_PTS = (STACK_ME_2025 - STACK_ME_2023) * 100;
var STACK_SHARE_REL = (STACK_ME_2025 - STACK_ME_2023) / STACK_ME_2023;

/* ---------- the checks ---------- */

chk('row totals are the sum of their four parts',
  TOTALS[0] === 660 && TOTALS[1] === 700 && TOTALS[2] === 750,
  TOTALS.join(', '));

chk('the grand total is the sum of the three year totals',
  GRAND === TOTALS[0] + TOTALS[1] + TOTALS[2], GRAND);

chk('every part is at most its year total',
  DEPTS.every(function (d) { return YEARS.every(function (_, y) { return DATA[d][y] <= TOTALS[y]; }); }));

chk('the four shares of 2025 sum to 1',
  Math.abs(sum(SHARES_2025) - 1) < 1e-12, sum(SHARES_2025).toFixed(12));

chk('the four shares of 2023 sum to 1',
  Math.abs(sum(SHARES_2023) - 1) < 1e-12, sum(SHARES_2023).toFixed(12));

chk('the four pie angles of 2025 sum to 360 degrees',
  Math.abs(sum(ANGLES_2025) - 360) < 1e-9, sum(ANGLES_2025).toFixed(9));

chk('a pie angle is 360 times the share (CSE: 0.48 -> 172.8)',
  Math.abs(ANGLES_2025[0] - 172.8) < 1e-9, ANGLES_2025[0]);

chk('CSE growth 240 -> 360 is exactly 50 per cent',
  Math.abs(GROWTH[0] - 0.5) < 1e-12, (GROWTH[0] * 100).toFixed(6));

chk('ME growth 150 -> 130 is a fall of 13.33 per cent',
  GROWTH[2] < 0 && Math.abs(GROWTH[2] + 20 / 150) < 1e-12, (GROWTH[2] * 100).toFixed(4));

chk('CE growth 90 -> 60 is a fall of 33.33 per cent',
  GROWTH[3] < 0 && Math.abs(GROWTH[3] + 30 / 90) < 1e-12, (GROWTH[3] * 100).toFixed(4));

chk('the changes in students sum to the change in the total',
  sum(CHANGE) === TOTALS[2] - TOTALS[0], sum(CHANGE) + ' = ' + (TOTALS[2] - TOTALS[0]));

chk('a total can rise while three of four parts fall',
  TOTALS[2] > TOTALS[0] && GROWTH[1] > 0 && GROWTH[2] < 0 && GROWTH[3] < 0,
  'total ' + TOTALS[0] + ' -> ' + TOTALS[2]);

chk('percentage points differ from per cent of the old share',
  Math.abs(PP_CSE - 11.636363636) < 1e-6 && Math.abs(REL_CSE - 0.32) < 1e-12 && Math.abs(PP_CSE / 100 - REL_CSE) > 0.1,
  PP_CSE.toFixed(4) + ' points against ' + (REL_CSE * 100).toFixed(2) + ' per cent');

chk('48.00 minus 36.36 is 11.64 points',
  Math.abs(PP_CSE - 11.6363636) < 1e-6, PP_CSE.toFixed(4));

chk('"80 per cent more" and "44.44 per cent less" are both true and unequal',
  Math.abs(MORE - 0.8) < 1e-12 && Math.abs(LESS - 4 / 9) < 1e-12 && Math.abs(MORE - LESS) > 0.3,
  (MORE * 100).toFixed(2) + ' against ' + (LESS * 100).toFixed(2));

chk('the two comparisons multiply back to the two values',
  Math.abs(DATA.ECE[2] * (1 + MORE) - DATA.CSE[2]) < 1e-9 &&
  Math.abs(DATA.CSE[2] * (1 - LESS) - DATA.ECE[2]) < 1e-9,
  '200 * 1.8 = 360 and 360 * 0.5556 = 200');

chk('the ratio 360 / 200 is 1.8 either way round',
  Math.abs(RATIO - 1.8) < 1e-12 && Math.abs(1 / RATIO - 200 / 360) < 1e-12, RATIO);

chk('the plain average of the four rates is not the growth of the total',
  Math.abs(MEAN_SIMPLE - 0.0361111) < 1e-6 && Math.abs(MEAN_SIMPLE - TOTAL_GROWTH) > 0.09,
  (MEAN_SIMPLE * 100).toFixed(2) + ' against ' + (TOTAL_GROWTH * 100).toFixed(2));

chk('the weighted average of the four rates equals the growth of the total',
  Math.abs(WEIGHTED - TOTAL_GROWTH) < 1e-12,
  (WEIGHTED * 100).toFixed(6));

/* the numerator in students is 90; in per-cent units it is 9,000, because each
   rate is multiplied by 100. The check states both, so neither form can drift. */
chk('the weighted numerator is 90 students, that is 9,000 in per-cent units',
  Math.abs(sum(GROWTH.map(function (g, i) { return g * DATA[DEPTS[i]][0]; })) - 90) < 1e-9 &&
  Math.abs(sum(GROWTH.map(function (g, i) { return g * 100 * DATA[DEPTS[i]][0]; })) - 9000) < 1e-6,
  sum(GROWTH.map(function (g, i) { return g * DATA[DEPTS[i]][0]; })).toFixed(6) + ' students');

chk('the wrong denominator gives 17.06 per cent, not 48.0',
  Math.abs(WRONG_DEN * 100 - 17.0616) < 1e-3 && Math.abs(WRONG_DEN - SHARES_2025[0]) > 0.3,
  (WRONG_DEN * 100).toFixed(4));

chk('190 over 700 is 27.14 per cent, and 27 per cent is one student low',
  Math.abs(EST_PCT - 27.1428571) < 1e-6 && Math.abs(EST_ERR_STUDENTS - 1) < 1e-9,
  EST_PCT.toFixed(4) + ' per cent, ' + EST_ERR_STUDENTS.toFixed(2) + ' students');

chk('the truncated axis changes the visual ratio from 6 to 31',
  Math.abs(ZERO_RATIO - 6) < 1e-12 && Math.abs(TRUNC_RATIO - 31) < 1e-12,
  ZERO_RATIO + ' against ' + TRUNC_RATIO);

chk('ME falls 13.33 per cent in height but 23.73 per cent in share',
  Math.abs(STACK_SEG_CHANGE + 0.13333333) < 1e-7 && Math.abs(STACK_SHARE_REL + 0.23733333) < 1e-6 &&
  Math.abs(STACK_SEG_CHANGE) < Math.abs(STACK_SHARE_REL),
  (STACK_SEG_CHANGE * 100).toFixed(2) + ' against ' + (STACK_SHARE_REL * 100).toFixed(2));

chk('a share is unchanged when part and total are scaled together',
  Math.abs((720 / 1500) - share('CSE', 2)) < 1e-12, '0.48 either way');

/* ======================================================================
   LAYER 3 — RENDER
   Reads the model. Never re-derives a value.
   ====================================================================== */

var COLS = [PAL.accent, PAL.info, PAL.warn, PAL.valid];

function n2(x) { return x.toFixed(2); }
function pct(x, d) { return (x * 100).toFixed(d === undefined ? 2 : d) + '%'; }

function sceneOf(t) {
  var sc = (K && K.state && K.state.scenes) ? K.state.scenes : [];
  for (var i = sc.length - 1; i >= 0; i--) if (t >= sc[i].start - 1e-6) return sc[i];
  return sc.length ? sc[0] : { start: 0, end: 30 };
}

/* which of the four events inside the scene we are in, and how far through it */
function seg(t) {
  var sc = sceneOf(t);
  var span = Math.max(1e-6, sc.end - sc.start);
  var p = (t - sc.start) / span;
  var i = Math.floor(p * 4);
  if (i > 3) i = 3;
  if (i < 0) i = 0;
  return { i: i, f: Math.min(1, Math.max(0, p * 4 - i)) };
}

function head(title, sub) {
  P.text(24, 18, title, { size: 19, bold: true, color: INK });
  if (sub) P.text(24, 44, sub, { size: 12, color: DIM });
}

/* a small labelled panel */
function panel(x, y, w, h, label, opts) {
  opts = opts || {};
  P.rect(x, y, w, h, { fill: opts.fill || SURF2, stroke: opts.stroke || BORDER, radius: 8, sw: 1 });
  if (label) P.text(x + 10, y + 8, label, { size: 10, mono: true, color: opts.labelColor || DIM });
}

/* ---------- the shared table ---------- */

function drawTable(x, y, o) {
  o = o || {};
  var cw = o.cw || 74, ch = o.ch || 26;
  var showTotals = o.totals !== false;
  var hiYear = o.hiYear === undefined ? -1 : o.hiYear;
  var hiDept = o.hiDept === undefined ? -1 : o.hiDept;
  var labelW = o.labelW || 66;

  /* header row */
  P.text(x, y - 18, o.caption || 'intake, in students', { size: 10, mono: true, color: FAINT });
  for (var yy = 0; yy < YEARS.length; yy++) {
    var hx = x + labelW + yy * cw;
    if (yy === hiYear) P.rect(hx - 4, y - 4, cw - 2, (DEPTS.length + 2) * ch + 4,
      { fill: ACCDIM, radius: 4 });
    P.text(hx + cw / 2 - 4, y, String(YEARS[yy]), { size: 11, mono: true, color: DIM, align: 'center' });
  }
  if (showTotals) {
    P.text(x + labelW + YEARS.length * cw + cw / 2 - 4, y, 'total', { size: 11, mono: true, color: DIM, align: 'center' });
  }

  /* department rows */
  for (var d = 0; d < DEPTS.length; d++) {
    var ry = y + (d + 1) * ch;
    var hi = (d === hiDept);
    if (hi) P.rect(x, ry - 6, labelW + YEARS.length * cw + (showTotals ? cw : 0), ch - 2,
      { fill: WARNDIM, radius: 4 });
    P.text(x + 4, ry, DEPTS[d], { size: 12, bold: true, color: hi ? WARN : INK });
    for (var y2 = 0; y2 < YEARS.length; y2++) {
      P.text(x + labelW + y2 * cw + cw / 2 - 4, ry, String(DATA[DEPTS[d]][y2]),
        { size: 12, mono: true, align: 'center', color: (y2 === hiYear) ? INK : DIM });
    }
    if (showTotals) {
      P.text(x + labelW + YEARS.length * cw + cw / 2 - 4, ry, String(sum(DATA[DEPTS[d]])),
        { size: 12, mono: true, align: 'center', color: FAINT });
    }
  }

  /* the total row */
  var ty = y + (DEPTS.length + 1) * ch;
  P.line(x, ty - 8, x + labelW + YEARS.length * cw + (showTotals ? cw : 0), ty - 8, { stroke: BORDER, sw: 1 });
  P.text(x + 4, ty, 'total', { size: 12, bold: true, color: ACC });
  for (var y3 = 0; y3 < YEARS.length; y3++) {
    P.text(x + labelW + y3 * cw + cw / 2 - 4, ty, String(TOTALS[y3]),
      { size: 12, bold: true, mono: true, align: 'center', color: ACC });
  }
  if (showTotals) {
    P.text(x + labelW + YEARS.length * cw + cw / 2 - 4, ty, String(GRAND),
      { size: 12, bold: true, mono: true, align: 'center', color: FAINT });
  }
  return ty + ch;
}

/* ---------- scene 1: the chain ---------- */

function drawChain(t) {
  var s = seg(t);
  head('Read, locate, compute, check', 'one table, twelve numbers, and four kinds of question');

  var steps = [
    ['1  read', 'axes, units, what a cell counts'],
    ['2  locate', 'the two cells, and any total not printed'],
    ['3  compute', 'one ratio, in words before numbers'],
    ['4  check', 'share, rate, comparison or average?']
  ];
  for (var i = 0; i < 4; i++) {
    var on = s.i >= (i === 0 ? 0 : i === 1 ? 0 : i === 2 ? 1 : 2) || s.i >= i;
    var bx = 24 + i * 218, by = 62;
    P.rect(bx, by, 204, 52, {
      fill: (s.i >= i) ? ACCDIM : SURF2,
      stroke: (s.i >= i) ? ACC : BORDER, radius: 8
    });
    P.text(bx + 10, by + 8, steps[i][0], { size: 13, bold: true, mono: true, color: (s.i >= i) ? ACC : FAINT });
    P.text(bx + 10, by + 28, steps[i][1], { size: 10.5, color: (s.i >= i) ? INK : FAINT });
    if (i < 3) P.arrow(bx + 204, by + 26, bx + 216, by + 26, { stroke: (s.i > i) ? ACC : BORDER, sw: 1.5, head: 6 });
  }

  drawTable(60, 168, { hiYear: -1, totals: s.i >= 1 });

  if (s.i >= 3) {
    P.rect(470, 168, 400, 150, { fill: WARNDIM, stroke: WARN, radius: 8 });
    P.text(484, 180, 'the four answers this table can give', { size: 11, mono: true, color: WARN });
    var rows = [
      ['share', '48.0% of 2025 was CSE'],
      ['rate', 'CSE grew 50.00% in three years'],
      ['comparison', 'CSE is 80.00% more than ECE'],
      ['average', 'the whole grew 13.64%']
    ];
    for (var r = 0; r < rows.length; r++) {
      P.text(484, 204 + r * 26, rows[r][0], { size: 11.5, bold: true, color: INK });
      P.text(566, 204 + r * 26, rows[r][1], { size: 11.5, mono: true, color: DIM });
    }
  } else {
    P.text(470, 200, 'totals are not printed: 660, 700, 750', { size: 12, color: DIM });
    P.text(470, 224, 'build them before dividing by one', { size: 12, color: DIM });
  }
}

/* ---------- scene 2: share ---------- */

function drawShare(t) {
  var s = seg(t);
  head('A share is a part over its own total', '2025, CSE, against the 2025 intake');

  drawTable(30, 150, { hiYear: s.i >= 0 ? 2 : -1, hiDept: 0, totals: true, cw: 70 });

  var x = 430;
  P.rect(x, 96, 440, 74, { fill: ACCDIM, stroke: ACC, radius: 8 });
  P.text(x + 14, 108, 'share of CSE in 2025', { size: 11, mono: true, color: ACC });
  P.text(x + 14, 128, '360 / 750 = 0.48', { size: 22, bold: true, mono: true, color: INK });
  P.text(x + 300, 138, '48.0%', { size: 26, bold: true, mono: true, color: ACC });

  /* the four shares as one 100 per cent bar */
  var by = 196, bw = 440, bh = 34;
  P.text(x, by - 18, 'the four shares of 2025', { size: 10, mono: true, color: FAINT });
  var acc = 0;
  for (var i = 0; i < DEPTS.length; i++) {
    var w = SHARES_2025[i] * bw;
    P.rect(x + acc, by, w, bh, { fill: COLS[i], radius: i === 0 || i === 3 ? 3 : 0 });
    if (w > 40) P.text(x + acc + w / 2, by + 10, DEPTS[i], { size: 11, bold: true, color: '#ffffff', align: 'center' });
    if (w > 40) P.text(x + acc + w / 2, by + 24, pct(SHARES_2025[i], 1), { size: 9.5, mono: true, color: '#ffffff', align: 'center' });
    acc += w;
  }
  P.text(x, by + bh + 10, '48.0 + 26.67 + 17.33 + 8.00 = 100.00', { size: 11.5, mono: true, color: VAL });

  if (s.i >= 1) {
    P.rect(x, 282, 440, 60, { fill: INVALIDDIM, stroke: BAD, radius: 8 });
    P.text(x + 14, 292, 'the wrong denominator: the whole table', { size: 11, mono: true, color: BAD });
    P.text(x + 14, 312, '360 / 2,110 = ' + pct(WRONG_DEN, 2), { size: 17, bold: true, mono: true, color: BAD });
    P.text(x + 230, 318, 'answers "of all three years"', { size: 11, color: DIM });
  }

  if (s.i >= 2) {
    P.text(30, 400, 'a share is silent about size: 8.00% of 750 is 60 students, 8.00% of 50 is 4 students', { size: 12, color: INK });
    P.text(30, 422, 'so "which is larger" is never answered by a share alone', { size: 12, color: DIM });
  }
}

/* ---------- scene 3: pie ---------- */

function drawPie(t) {
  var s = seg(t);
  head('A pie is a share turned into an angle', '2025 shares, as slices of 360 degrees');

  var cx = 230, cy = 268, r = 118;
  var sweep = s.i === 0 ? Math.max(0.05, s.f) : 1;
  var start = -Math.PI / 2, acc = 0;
  for (var i = 0; i < DEPTS.length; i++) {
    var a0 = start + acc;
    var full = (ANGLES_2025[i] / 360) * Math.PI * 2;
    var a1 = a0 + full * Math.min(1, sweep * 1.35 - i * 0.1 > 0 ? (sweep * 1.35 - i * 0.1) : 0.0001);
    if (a1 > a0 + 0.0001) {
      var stepsN = 24, prev = null;
      for (var k = 0; k <= stepsN; k++) {
        var a = a0 + (a1 - a0) * (k / stepsN);
        var px = cx + r * Math.cos(a), py = cy + r * Math.sin(a);
        if (prev) P.tri(cx, cy, prev[0], prev[1], px, py, { fill: COLS[i] });
        prev = [px, py];
      }
    }
    acc += full;
  }
  P.circle(cx, cy, r, { stroke: BORDER, sw: 1.5 });

  /* labels on the right */
  var lx = 430;
  P.text(lx, 118, 'share', { size: 10, mono: true, color: FAINT });
  P.text(lx + 90, 118, 'x 360', { size: 10, mono: true, color: FAINT });
  P.text(lx + 200, 118, 'angle', { size: 10, mono: true, color: FAINT });
  for (var j = 0; j < DEPTS.length; j++) {
    var yy = 140 + j * 30;
    P.rect(lx, yy + 3, 12, 12, { fill: COLS[j], radius: 2 });
    P.text(lx + 20, yy, DEPTS[j], { size: 12, bold: true, color: INK });
    P.text(lx + 90, yy, pct(SHARES_2025[j], 2), { size: 12, mono: true, color: DIM });
    P.text(lx + 200, yy, ANGLES_2025[j].toFixed(1) + '\u00b0', { size: 12, mono: true, color: INK });
  }
  P.line(lx, 262, lx + 300, 262, { stroke: BORDER, sw: 1 });
  P.text(lx, 272, 'sum', { size: 11, mono: true, color: ACC });
  P.text(lx + 200, 272, sum(ANGLES_2025).toFixed(1) + '\u00b0', { size: 12, bold: true, mono: true, color: ACC });

  if (s.i >= 1) {
    P.text(lx, 306, '172.8 + 96.0 + 62.4 + 28.8 = 360.0', { size: 12, mono: true, color: VAL });
    P.text(lx, 326, 'three angles given, the fourth is the remainder', { size: 11, color: DIM });
  }
  if (s.i >= 2) {
    P.rect(lx, 348, 440, 44, { fill: WARNDIM, stroke: WARN, radius: 8 });
    P.text(lx + 12, 356, 'two pies, same shares, totals 750 and 1,500', { size: 11, mono: true, color: WARN });
    P.text(lx + 12, 374, 'draw identically; every amount has doubled', { size: 11, color: INK });
  }
  if (s.i >= 3) {
    P.text(lx, 410, 'amount = share x printed total: 0.48 x 750 = 360', { size: 12, mono: true, color: ACC });
  }
}

/* ---------- scene 4: rate ---------- */

function drawRate(t) {
  var s = seg(t);
  head('A rate of change needs a base, and a sign', '2023 against 2025, each on its own base');

  P.rect(24, 76, 300, 46, { fill: SURF2, stroke: BORDER, radius: 8 });
  P.text(38, 86, 'growth = (new - old) / old', { size: 15, bold: true, mono: true, color: INK });
  P.text(38, 106, 'the base is the OLD value', { size: 10.5, color: DIM });

  /* two columns of numbers */
  P.text(40, 142, '2023', { size: 11, mono: true, color: FAINT });
  P.text(150, 142, '2025', { size: 11, mono: true, color: FAINT });
  P.text(260, 142, 'change', { size: 11, mono: true, color: FAINT });

  var shown = s.i === 0 ? 0 : s.i === 1 ? 2 : 4;
  for (var i = 0; i < DEPTS.length; i++) {
    var y = 166 + i * 34;
    var vis = i < shown;
    P.text(40, y, DEPTS[i], { size: 12, bold: true, color: vis ? INK : FAINT });
    P.text(104, y, String(DATA[DEPTS[i]][0]), { size: 12, mono: true, color: vis ? DIM : FAINT });
    P.text(150, y, String(DATA[DEPTS[i]][2]), { size: 12, mono: true, color: vis ? DIM : FAINT });
    if (vis) {
      var g = GROWTH[i];
      var txt = (g >= 0 ? '+' : '-') + Math.abs(g * 100).toFixed(2) + '%';
      P.text(260, y, txt, { size: 13, bold: true, mono: true, color: g >= 0 ? VAL : BAD });
      P.text(370, y, 'on ' + DATA[DEPTS[i]][0], { size: 10, mono: true, color: FAINT });
    }
  }

  if (s.i >= 2) {
    P.rect(40, 310, 400, 50, { fill: INVALIDDIM, stroke: BAD, radius: 8 });
    P.text(52, 320, 'ME 150 to 130 is minus 13.33%, not 13.33%', { size: 12, mono: true, color: BAD });
    P.text(52, 340, 'a fall of 20 from 150 can never be reported as a rise', { size: 11, color: INK });
  }

  if (s.i >= 3) {
    P.rect(470, 120, 400, 240, { fill: ACCDIM, stroke: ACC, radius: 8 });
    P.text(484, 132, 'the parts sum to the total change', { size: 11, mono: true, color: ACC });
    P.text(484, 158, '+120  +20  -20  -30  =  +90', { size: 17, bold: true, mono: true, color: INK });
    P.text(484, 190, '660 + 90 = 750', { size: 13, mono: true, color: DIM });
    P.text(484, 218, 'total growth = 90 / 660 = ' + pct(TOTAL_GROWTH, 2), { size: 13, mono: true, color: ACC });
    P.text(484, 250, 'the total rose while three of', { size: 11.5, color: INK });
    P.text(484, 268, 'its four parts fell', { size: 11.5, color: INK });
    P.text(484, 300, 'CSE gained 120 of the 90', { size: 11, color: DIM });
    P.text(484, 318, 'the other three lost 30 between them', { size: 11, color: DIM });
  }
}

/* ---------- scene 5: points ---------- */

function drawPoints(t) {
  var s = seg(t);
  head('Percentage points are not per cent', "CSE's share of its own year, 2023 against 2025");

  var x0 = 60, w = 520, y1 = 150, y2 = 240;
  /* two share bars, on a 0..60 per cent scale */
  var scale = w / 0.6;
  P.text(x0, y1 - 26, 'share in 2023: 240 / 660', { size: 11, mono: true, color: DIM });
  P.rect(x0, y1, SHARES_2023[0] * scale, 30, { fill: ACCDIM, stroke: ACC, radius: 4 });
  P.text(x0 + SHARES_2023[0] * scale + 10, y1 + 7, pct(SHARES_2023[0], 2), { size: 13, bold: true, mono: true, color: ACC });

  P.text(x0, y2 - 26, 'share in 2025: 360 / 750', { size: 11, mono: true, color: DIM });
  P.rect(x0, y2, SHARES_2025[0] * scale, 30, { fill: ACCDIM, stroke: ACC, radius: 4 });
  P.text(x0 + SHARES_2025[0] * scale + 10, y2 + 7, pct(SHARES_2025[0], 2), { size: 13, bold: true, mono: true, color: ACC });

  /* the difference bracket */
  P.line(x0 + SHARES_2023[0] * scale, y1 + 44, x0 + SHARES_2023[0] * scale, y2 - 14, { stroke: FAINT, dash: [3, 3] });
  P.line(x0 + SHARES_2025[0] * scale, y1 + 44, x0 + SHARES_2025[0] * scale, y2 - 14, { stroke: FAINT, dash: [3, 3] });

  if (s.i >= 1) {
    P.rect(620, 130, 250, 74, { fill: WARNDIM, stroke: WARN, radius: 8 });
    P.text(632, 140, 'subtract the percentages', { size: 10.5, mono: true, color: WARN });
    P.text(632, 160, PP_CSE.toFixed(2) + ' points', { size: 20, bold: true, mono: true, color: INK });
    P.text(632, 186, '48.00 - 36.36 = 11.64', { size: 10.5, mono: true, color: DIM });
  }

  if (s.i >= 2) {
    P.rect(620, 218, 250, 74, { fill: ACCDIM, stroke: ACC, radius: 8 });
    P.text(632, 228, 'divide by the old share', { size: 10.5, mono: true, color: ACC });
    P.text(632, 248, pct(REL_CSE, 1), { size: 20, bold: true, mono: true, color: INK });
    P.text(632, 274, '11.64 / 36.36 = 0.3200', { size: 10.5, mono: true, color: DIM });
  }

  if (s.i >= 3) {
    P.line(60, 320, 640, 320, { stroke: BORDER, sw: 1 });
    P.text(60, 330, 'points subtract, per cent divides', { size: 13, bold: true, color: INK });
    P.text(60, 354, '"by how many percentage points" -> ' + PP_CSE.toFixed(2), { size: 12, mono: true, color: DIM });
    P.text(60, 376, '"by what per cent"               -> ' + pct(REL_CSE, 1), { size: 12, mono: true, color: DIM });
    P.text(60, 404, 'the same movement, two true answers, a factor of ' + (REL_CSE * 100 / PP_CSE).toFixed(2), { size: 11.5, color: FAINT });
  }
}

/* ---------- scene 6: the flip ---------- */

function drawFlip(t) {
  var s = seg(t);
  head('"More than" and "less than" use different bases', '2025: CSE 360 and ECE 200, the same pair read both ways');

  var bx = 90, base = 400, scale = 340 / 360;
  P.text(40, 100, 'CSE', { size: 12, bold: true, color: INK });
  P.rect(bx, 88, DATA.CSE[2] * scale, 34, { fill: ACCDIM, stroke: ACC, radius: 4 });
  P.text(bx + DATA.CSE[2] * scale + 10, 96, '360', { size: 13, bold: true, mono: true, color: ACC });

  P.text(40, 156, 'ECE', { size: 12, bold: true, color: INK });
  P.rect(bx, 144, DATA.ECE[2] * scale, 34, { fill: SURF2, stroke: BORDER, radius: 4 });
  P.text(bx + DATA.ECE[2] * scale + 10, 152, '200', { size: 13, bold: true, mono: true, color: DIM });

  /* the 160 that separates them */
  P.line(bx + DATA.ECE[2] * scale, 190, bx + DATA.CSE[2] * scale, 190, { stroke: WARN, sw: 1.5 });
  P.text(bx + DATA.ECE[2] * scale + 6, 196, 'the difference is 160', { size: 10.5, mono: true, color: WARN });

  if (s.i >= 0) {
    P.rect(560, 84, 310, 70, { fill: ACCDIM, stroke: ACC, radius: 8 });
    P.text(572, 94, 'CSE more than ECE, base 200', { size: 10.5, mono: true, color: ACC });
    P.text(572, 114, '160 / 200 = ' + pct(MORE, 0) + ' more', { size: 18, bold: true, mono: true, color: INK });
  }
  if (s.i >= 1) {
    P.rect(560, 170, 310, 70, { fill: WARNDIM, stroke: WARN, radius: 8 });
    P.text(572, 180, 'ECE less than CSE, base 360', { size: 10.5, mono: true, color: WARN });
    P.text(572, 200, '160 / 360 = ' + pct(LESS, 2) + ' less', { size: 18, bold: true, mono: true, color: INK });
  }
  if (s.i >= 2) {
    P.text(40, 250, 'check by going back', { size: 11, mono: true, color: FAINT });
    P.text(40, 272, '200 x (1 + 0.80)   = 360', { size: 12.5, mono: true, color: VAL });
    P.text(40, 294, '360 x (1 - 0.4444) = 200', { size: 12.5, mono: true, color: VAL });
    P.text(40, 322, 'the ratio is 360 / 200 = ' + RATIO.toFixed(1) + ', the same both ways', { size: 12, mono: true, color: DIM });
  }
  if (s.i >= 3) {
    P.line(40, 352, 870, 352, { stroke: BORDER, sw: 1 });
    P.text(40, 362, 'the base is the word after "than"', { size: 13, bold: true, color: INK });
    P.text(40, 386, '"more than ECE" divides by 200   "less than CSE" divides by 360', { size: 11.5, mono: true, color: DIM });
    P.text(40, 408, '"what per cent of ECE is CSE" is a third question: 360 / 200 = ' + pct(RATIO, 0), { size: 11.5, mono: true, color: FAINT });
  }
}

/* ---------- scene 7: averaging ---------- */

function drawAverage(t) {
  var s = seg(t);
  head('Averaging percentages is not averaging', 'four growth rates on four different bases');

  /* the four rates as chips */
  for (var i = 0; i < DEPTS.length; i++) {
    var cx = 40 + i * 150;
    P.rect(cx, 92, 136, 62, { fill: SURF2, stroke: BORDER, radius: 8 });
    P.text(cx + 10, 100, DEPTS[i], { size: 11, bold: true, color: INK });
    P.text(cx + 10, 118, (GROWTH[i] >= 0 ? '+' : '-') + Math.abs(GROWTH[i] * 100).toFixed(2) + '%',
      { size: 17, bold: true, mono: true, color: GROWTH[i] >= 0 ? VAL : BAD });
    P.text(cx + 10, 140, 'base ' + DATA[DEPTS[i]][0], { size: 9.5, mono: true, color: FAINT });
  }

  if (s.i >= 0) {
    P.rect(40, 176, 400, 66, { fill: INVALIDDIM, stroke: BAD, radius: 8 });
    P.text(52, 186, 'plain average: add and divide by four', { size: 10.5, mono: true, color: BAD });
    P.text(52, 206, '14.44 / 4 = ' + pct(MEAN_SIMPLE, 2), { size: 19, bold: true, mono: true, color: BAD });
    P.text(52, 230, 'correct arithmetic, wrong question', { size: 10.5, color: DIM });
  }
  if (s.i >= 1) {
    P.rect(470, 176, 400, 66, { fill: ACCDIM, stroke: ACC, radius: 8 });
    P.text(482, 186, 'the data set itself: 660 to 750', { size: 10.5, mono: true, color: ACC });
    P.text(482, 206, '90 / 660 = ' + pct(TOTAL_GROWTH, 2), { size: 19, bold: true, mono: true, color: ACC });
    P.text(482, 230, 'this is the growth of the whole', { size: 10.5, color: DIM });
  }
  if (s.i >= 2) {
    P.text(40, 266, 'weight each rate by the base it was computed on', { size: 11.5, color: INK });
    P.text(40, 290, '240x50 + 180x11.11 - 150x13.33 - 90x33.33', { size: 11.5, mono: true, color: DIM });
    P.text(40, 312, '= 12,000 + 2,000 - 2,000 - 3,000 = 9,000', { size: 11.5, mono: true, color: DIM });
    P.text(40, 336, '9,000 / 660 = ' + pct(WEIGHTED, 2) + '  = the growth of the totals', { size: 12.5, bold: true, mono: true, color: VAL });
  }
  if (s.i >= 3) {
    P.line(40, 366, 870, 366, { stroke: BORDER, sw: 1 });
    P.text(40, 376, 'a plain average of rates is right only when every base is equal', { size: 12.5, bold: true, color: INK });
    P.text(40, 400, 'safe: weight by the base, or divide the two totals once', { size: 11.5, color: DIM });
    P.text(40, 422, 'unsafe: add the rates and divide by how many there are', { size: 11.5, color: BAD });
  }
}

/* ---------- scene 8: estimate ---------- */

function drawEstimate(t) {
  var s = seg(t);
  head('Estimate, then state the band', 'ECE in 2024: 190 of 700');

  P.rect(40, 84, 380, 62, { fill: SURF2, stroke: BORDER, radius: 8 });
  P.text(52, 94, 'exact', { size: 10.5, mono: true, color: FAINT });
  P.text(52, 112, '190 / 700 = ' + pct(EST_EXACT, 4), { size: 18, bold: true, mono: true, color: INK });

  if (s.i >= 1) {
    P.rect(450, 84, 420, 62, { fill: ACCDIM, stroke: ACC, radius: 8 });
    P.text(462, 94, 'cancel the zero first', { size: 10.5, mono: true, color: ACC });
    P.text(462, 112, '19 / 70, and 70/4 = 17.5, so 19 is just above a quarter', { size: 12.5, mono: true, color: INK });
  }

  /* the number line 0.24 .. 0.30 */
  var lx = 60, lw = 780, ly = 200;
  var lo = 0.24, hi = 0.30;
  var px = function (v) { return lx + (v - lo) / (hi - lo) * lw; };
  P.line(lx, ly, lx + lw, ly, { stroke: BORDER, sw: 1.5 });
  for (var k = 0; k <= 6; k++) {
    var v = lo + k * 0.01;
    P.line(px(v), ly - 6, px(v), ly + 6, { stroke: BORDER, sw: 1 });
    P.text(px(v), ly + 12, (v * 100).toFixed(0) + '%', { size: 10, mono: true, color: FAINT, align: 'center' });
  }
  P.circle(px(0.25), ly, 5, { fill: SURF, stroke: FAINT, sw: 1.5 });
  P.text(px(0.25), ly - 30, 'a quarter', { size: 10, color: FAINT, align: 'center' });

  if (s.i >= 0) {
    P.circle(px(EST_EXACT), ly, 7, { fill: ACC, stroke: ACC });
    P.text(px(EST_EXACT), ly - 30, 'exact ' + pct(EST_EXACT, 2), { size: 11, bold: true, mono: true, color: ACC, align: 'center' });
  }
  if (s.i >= 2) {
    P.circle(px(0.27), ly, 6, { fill: WARN, stroke: WARN });
    P.text(px(0.27), ly + 32, 'keyed ' + EST_USED + '%', { size: 11, bold: true, mono: true, color: WARN, align: 'center' });
    P.rect(60, 262, 810, 58, { fill: WARNDIM, stroke: WARN, radius: 8 });
    P.text(74, 272, 'the band: ' + EST_ERR_PTS.toFixed(2) + ' points low, which is ' +
      Math.abs(EST_ERR_STUDENTS).toFixed(0) + ' student in ' + EST_TOTAL, { size: 12.5, mono: true, color: INK });
    P.text(74, 296, EST_USED + '% of 700 = 189, and the true count is 190, so the estimate is safe to key', { size: 11.5, color: DIM });
  }
  if (s.i >= 3) {
    P.text(60, 348, 'cancel zeros  ->  compare with one half and one quarter  ->  state the band', { size: 12, mono: true, color: INK });
    P.text(60, 374, 'do not round the inputs before deciding what the question asks', { size: 12, color: DIM });
    P.text(60, 404, 'an estimate with no band is a guess that happened to land', { size: 11.5, color: FAINT });
  }
}

/* ---------- scene 9: the displays ---------- */

function drawDisplay(t) {
  var s = seg(t);
  head('The same numbers, three displays', '2025: CSE 360 and CE 60');

  function miniBars(x, y, w, h, startAt, title, note) {
    P.rect(x, y, w, h, { fill: SURF2, stroke: BORDER, radius: 8 });
    P.text(x + 12, y + 8, title, { size: 10.5, mono: true, color: DIM });
    var plotTop = y + 34, plotBot = y + h - 40;
    var scale = (plotBot - plotTop) / (DATA.CSE[2] - startAt);
    P.line(x + 30, plotBot, x + w - 14, plotBot, { stroke: BORDER, sw: 1.2 });
    P.text(x + 6, plotTop - 4, String(DATA.CSE[2]), { size: 9, mono: true, color: FAINT });
    P.text(x + 6, plotBot - 4, String(startAt), { size: 9, mono: true, color: FAINT });
    for (var i = 0; i < 2; i++) {
      var val = i === 0 ? DATA.CSE[2] : DATA.CE[2];
      var bh = (val - startAt) * scale;
      var bx = x + 70 + i * 110;
      P.rect(bx, plotBot - bh, 62, bh, { fill: i === 0 ? ACC : INFO, radius: 3 });
      P.text(bx + 31, plotBot - bh - 18, String(val), { size: 10.5, mono: true, color: INK, align: 'center' });
      P.text(bx + 31, plotBot + 6, i === 0 ? 'CSE' : 'CE', { size: 10, mono: true, color: DIM, align: 'center' });
    }
    P.text(x + 12, y + h - 24, note, { size: 11, mono: true, color: INK });
  }

  miniBars(30, 90, 400, 190, 0, 'axis from 0', 'heights 360 and 60: ratio ' + ZERO_RATIO.toFixed(0) + ' to 1');
  if (s.i >= 1) {
    miniBars(470, 90, 400, 190, TRUNC_START, 'axis from 50',
      'heights 310 and 10: ratio ' + TRUNC_RATIO.toFixed(0) + ' to 1');
  }

  if (s.i >= 2) {
    /* the stacked bar for 2025 */
    var x = 60, y = 320, w = 420, h = 34;
    P.text(x, y - 18, 'stacked: ME is 130 of the 750', { size: 10.5, mono: true, color: FAINT });
    var acc = 0;
    for (var j = 0; j < DEPTS.length; j++) {
      var sw = SHARES_2025[j] * w;
      P.rect(x + acc, y, sw, h, { fill: COLS[j], radius: 2 });
      if (sw > 44) P.text(x + acc + sw / 2, y + 10, DEPTS[j], { size: 10, bold: true, color: '#ffffff', align: 'center' });
      acc += sw;
    }
    P.text(520, y - 4, 'ME segment: 150 -> 130', { size: 11.5, mono: true, color: INK });
    P.text(520, y + 16, 'height ' + pct(STACK_SEG_CHANGE, 2) + ', share ' + pct(STACK_SHARE_REL, 2), { size: 11.5, mono: true, color: BAD });
    P.text(520, y + 36, 'because the total grew underneath it', { size: 10.5, color: DIM });
  }
  if (s.i >= 3) {
    P.line(60, 392, 870, 392, { stroke: BORDER, sw: 1 });
    P.text(60, 400, 'read the axis before comparing bars; read the total before comparing segments', { size: 12, bold: true, color: INK });
    P.text(60, 424, 'a map is the same caution one step further: a shade is a band of values, never a point value', { size: 11, color: DIM });
  }
}

/* ---------- scene 10: the routine ---------- */

function drawRoutine(t) {
  var s = seg(t);
  head('The routine, and the four traps', 'three lines that produce an answer');

  var steps = [
    ['name', 'list the part, the base, the year, the unit'],
    ['write', 'the ratio in words, before any numbers'],
    ['substitute', 'insert two numbers, cancel, simplify']
  ];
  for (var i = 0; i < 3; i++) {
    var y = 78 + i * 44;
    P.rect(30, y, 430, 36, { fill: ACCDIM, stroke: ACC, radius: 6 });
    P.text(42, y + 10, (i + 1) + '. ' + steps[i][0], { size: 12, bold: true, mono: true, color: ACC });
    P.text(150, y + 11, steps[i][1], { size: 11, color: INK });
  }

  if (s.i >= 1) {
    P.rect(30, 220, 430, 76, { fill: INVALIDDIM, stroke: BAD, radius: 8 });
    P.text(42, 230, 'traps one and two', { size: 10.5, mono: true, color: BAD });
    P.text(42, 250, 'wrong denominator: 17.06% where 48.00% was wanted', { size: 11, mono: true, color: INK });
    P.text(42, 272, 'points read as per cent: 11.64 where 32.00% was wanted', { size: 11, mono: true, color: INK });
  }
  if (s.i >= 2) {
    P.rect(30, 310, 430, 76, { fill: WARNDIM, stroke: WARN, radius: 8 });
    P.text(42, 320, 'traps three and four', { size: 10.5, mono: true, color: WARN });
    P.text(42, 340, 'a plain average of rates: 3.61% where 13.64% was wanted', { size: 11, mono: true, color: INK });
    P.text(42, 362, 'a bar read without its axis: 31 to 1 where 6 to 1 was drawn', { size: 11, mono: true, color: INK });
  }
  if (s.i >= 3) {
    P.rect(490, 78, 380, 150, { fill: ACCDIM, stroke: ACC, radius: 8 });
    P.text(502, 88, 'the three free checks', { size: 10.5, mono: true, color: ACC });
    P.text(502, 112, 'shares of one total sum to 100', { size: 12, mono: true, color: INK });
    P.text(502, 136, 'pie angles sum to 360', { size: 12, mono: true, color: INK });
    P.text(502, 160, 'part changes sum to the total change', { size: 12, mono: true, color: INK });
    P.text(502, 190, 'each costs one addition', { size: 10.5, color: DIM });
    P.text(502, 212, 'and each tests a different step', { size: 10.5, color: DIM });

    P.text(490, 258, 'the table, once more', { size: 10.5, mono: true, color: FAINT });
    P.text(490, 280, '660 -> 700 -> 750, up ' + pct(TOTAL_GROWTH, 2), { size: 12.5, mono: true, color: INK });
    P.text(490, 302, 'CSE 240 -> 360, up 50.00%', { size: 12.5, mono: true, color: VAL });
    P.text(490, 324, 'ME 150 -> 130, down 13.33%', { size: 12.5, mono: true, color: BAD });
  }
}

var DRAW = {
  chain: drawChain,
  share: drawShare,
  pie: drawPie,
  rate: drawRate,
  points: drawPoints,
  flip: drawFlip,
  average: drawAverage,
  estimate: drawEstimate,
  display: drawDisplay,
  routine: drawRoutine
};

function sceneIdAt(t) {
  var sc = K.state.scenes;
  for (var i = sc.length - 1; i >= 0; i--) if (t >= sc[i].start - 1e-6) return sc[i].id;
  return sc.length ? sc[0].id : 'chain';
}

function drawFrame(P0) {
  P = P0;
  P.alpha(1);
  P.clear();
  P.rect(0, 0, W, H, { fill: SURF });
  var id = sceneIdAt(K.state.elapsed);
  var fn = DRAW[id] || drawChain;
  try { fn(K.state.elapsed); } catch (e) { console.error('scene ' + id, e); }
}

/* ======================================================================
   LAYER 4 — BOOT
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
          drawFrame(P);
          ok = true;
        };
        sk.draw = function () { /* frames are driven by the timeline */ };
      });
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
      if (holder) holder.appendChild(cv);
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
  YEARS: YEARS, DEPTS: DEPTS, DATA: DATA,
  TOTALS: TOTALS, GRAND: GRAND,
  SHARES_2025: SHARES_2025, SHARES_2023: SHARES_2023, ANGLES_2025: ANGLES_2025,
  GROWTH: GROWTH, CHANGE: CHANGE,
  PP_CSE: PP_CSE, REL_CSE: REL_CSE, WRONG_DEN: WRONG_DEN,
  MEAN_SIMPLE: MEAN_SIMPLE, TOTAL_GROWTH: TOTAL_GROWTH, WEIGHTED: WEIGHTED,
  MORE: MORE, LESS: LESS, RATIO: RATIO,
  EST_EXACT: EST_EXACT, EST_PCT: EST_PCT, EST_USED: EST_USED,
  EST_ERR_PTS: EST_ERR_PTS, EST_ERR_STUDENTS: EST_ERR_STUDENTS,
  ZERO_RATIO: ZERO_RATIO, TRUNC_RATIO: TRUNC_RATIO, TRUNC_HEIGHTS: TRUNC_HEIGHTS,
  STACK_ME_2023: STACK_ME_2023, STACK_ME_2025: STACK_ME_2025,
  STACK_SEG_CHANGE: STACK_SEG_CHANGE, STACK_SHARE_REL: STACK_SHARE_REL
};
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

})();
