/* ==========================================================================
   comparator-code-converter-bcd-adder — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The drawing code reads V. It does no comparison arithmetic of its own: every
   figure on the canvas was computed once here and checked against the rule it
   is supposed to satisfy — the ripple comparator against numeric comparison on
   every pair up to six bits, the Gray code against its one-bit-change property
   and its own inverse, and the BCD adder against decimal addition on all 200
   valid inputs.
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

var V = {};

/* ---------- 1. one-bit comparator ----------
   Three outputs, one per relation. Written from the definition first, then
   checked against the gate expressions. */
V.oneBit = [];
[[0, 0], [0, 1], [1, 0], [1, 1]].forEach(function (p) {
  var a = p[0], b = p[1];
  V.oneBit.push({
    a: a, b: b,
    g: a > b ? 1 : 0, e: a === b ? 1 : 0, l: a < b ? 1 : 0,
    gExpr: a & (1 - b),
    eExpr: 1 ^ (a ^ b),
    lExpr: (1 - a) & b
  });
});

/* ---------- 2. the ripple comparator ----------
   The state passed from one bit position to the next is the triple
   (greater, equal, less) about the bits already seen. Start tied: (0,1,0). */
function rippleTrace(a, b, n) {
  var g = 0, e = 1, l = 0;
  var steps = [{ i: null, g: g, e: e, l: l, ai: null, bi: null, why: 'tie in' }];
  for (var i = n - 1; i >= 0; i--) {
    var ai = (a >> i) & 1, bi = (b >> i) & 1;
    var ng = g | (e & (ai > bi ? 1 : 0));
    var nl = l | (e & (ai < bi ? 1 : 0));
    var ne = e & (ai === bi ? 1 : 0);
    var why;
    if (!e) why = 'already decided';
    else if (ai > bi) why = 'this bit decides greater';
    else if (ai < bi) why = 'this bit decides less';
    else why = 'still tied';
    g = ng; e = ne; l = nl;
    steps.push({ i: i, g: g, e: e, l: l, ai: ai, bi: bi, why: why });
  }
  return steps;
}

function ripple(a, b, n) {
  var g = 0, e = 1, l = 0;
  for (var i = n - 1; i >= 0; i--) {
    var ai = (a >> i) & 1, bi = (b >> i) & 1;
    var ng = g | (e & (ai > bi ? 1 : 0));
    var nl = l | (e & (ai < bi ? 1 : 0));
    var ne = e & (ai === bi ? 1 : 0);
    g = ng; e = ne; l = nl;
  }
  return [g, e, l];
}

V.trace = rippleTrace(0b1011, 0b1001, 4);
V.traceA = '1011'; V.traceB = '1001';

/* every pair, for n = 1 to 6, against the numeric relation */
V.rippleFailures = 0;
V.ripplePairs = 0;
for (var n1 = 1; n1 <= 6; n1++) {
  var N1 = 1 << n1;
  for (var a1 = 0; a1 < N1; a1++) {
    for (var b1 = 0; b1 < N1; b1++) {
      V.ripplePairs++;
      var r1 = ripple(a1, b1, n1);
      var exp1 = a1 > b1 ? [1, 0, 0] : (a1 === b1 ? [0, 1, 0] : [0, 0, 1]);
      if (r1[0] !== exp1[0] || r1[1] !== exp1[1] || r1[2] !== exp1[2]) V.rippleFailures++;
    }
  }
}

/* ---------- 3. counting the three outcomes ----------
   Of the 4^n ordered pairs, exactly 2^n tie, and the rest split evenly. */
function countFor(n, enumerate) {
  var N = Math.pow(2, n);
  var eqF = N, gtF = (N * N - N) / 2;
  if (!enumerate) {
    return { n: n, N: N, pairs: N * N, eq: eqF, gt: gtF, lt: gtF, eqF: eqF, gtF: gtF, enumerated: false };
  }
  var eq = 0, gt = 0;
  for (var a = 0; a < N; a++) {
    for (var b = 0; b < N; b++) {
      if (a === b) eq++; else if (a > b) gt++;
    }
  }
  return { n: n, N: N, pairs: N * N, eq: eq, gt: gt, lt: gt, eqF: eqF, gtF: gtF, enumerated: true };
}
/* enumerated where the count is small enough to enumerate; the sixteen-bit row is
   the formula alone, because 4^16 pairs is not something a browser should loop over. */
V.counts = [2, 4, 8].map(function (n) { return countFor(n, true); })
  .concat([countFor(16, false)]);
V.countAt = function (n) {
  for (var i = 0; i < V.counts.length; i++) if (V.counts[i].n === n) return V.counts[i];
  return null;
};

/* ---------- 4. binary to Gray, and back ----------
   Gray(n) = n XOR (n >> 1). The inverse is a prefix XOR. */
function b2g(x) { return x ^ (x >> 1); }
function g2b(g, n) {
  var b = 0;
  for (var i = n - 1; i >= 0; i--) {
    var bit = (g >> i) & 1;
    var prev = i + 1 < n ? (b >> (i + 1)) & 1 : 0;
    b |= (bit ^ prev) << i;
  }
  return b;
}
V.b2g = b2g; V.g2b = g2b;

V.grayTable = [];
for (var gi = 0; gi < 16; gi++) {
  V.grayTable.push({
    n: gi,
    bin: formatBits(gi, 4),
    gray: formatBits(b2g(gi), 4),
    flip: gi === 0 ? null : (b2g(gi) ^ b2g(gi - 1))
  });
}

/* the four-bit example the lesson shows twice */
V.grayEx = { bin: '1011', gray: formatBits(b2g(0b1011), 4), back: formatBits(g2b(0b1110, 4), 4) };

/* ---------- 5. the properties of a Gray code ---------- */
V.grayProps = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function (n) {
  var N = Math.pow(2, n);
  var seen = {};
  var bij = true, adj = true, wrap = true;
  for (var x = 0; x < N; x++) {
    var g = b2g(x);
    if (seen[g]) bij = false;
    seen[g] = 1;
    if (x < N - 1 && popcount(b2g(x) ^ b2g(x + 1)) !== 1) adj = false;
  }
  if (popcount(b2g(N - 1) ^ b2g(0)) !== 1) wrap = false;
  return { n: n, N: N, bij: bij, adj: adj, wrap: wrap };
});

function popcount(x) { var c = 0; while (x) { c += x & 1; x >>= 1; } return c; }
function formatBits(x, n) {
  var s = '';
  for (var i = n - 1; i >= 0; i--) s += (x >> i) & 1;
  return s;
}
V.formatBits = formatBits;

/* ---------- 6. Gray code is the K-map axis ---------- */
V.kmapAxis = ['00', '01', '11', '10'];
V.kmapAxisIsGray = V.kmapAxis.every(function (lab, i) { return lab === formatBits(b2g(i), 2); });
V.kmapAdjacentAllOneBit = true;
for (var ka = 0; ka < 4; ka++) {
  var kb = (ka + 1) % 4;
  if (popcount(parseInt(V.kmapAxis[ka], 2) ^ parseInt(V.kmapAxis[kb], 2)) !== 1) V.kmapAdjacentAllOneBit = false;
}

/* ---------- 7. excess-3 ---------- */
V.xs3 = [];
for (var d = 0; d <= 9; d++) {
  V.xs3.push({
    d: d,
    bcd: formatBits(d, 4),
    ex: formatBits(d + 3, 4),
    complement: formatBits(((~(d + 3)) & 0xF), 4),
    nineMinus: formatBits(9 - d + 3, 4),
    selfComp: ((~(d + 3)) & 0xF) === (9 - d + 3)
  });
}

/* ---------- 8. the BCD adder ----------
   Two BCD digits plus a carry in: the binary sum runs 0 to 19. Anything above
   9 is not a decimal digit, so six is added to skip the six invalid codes. */
function corrOf(s) {
  var s3 = (s >> 3) & 1, s2 = (s >> 2) & 1, s1 = (s >> 1) & 1;
  return (s3 && s2) || (s3 && s1) ? 1 : 0;
}
V.corrOf = corrOf;

V.bcdCases = [];
V.bcdTrigFailures = 0;
V.bcdValueFailures = 0;
for (var bd1 = 0; bd1 <= 9; bd1++) {
  for (var bd2 = 0; bd2 <= 9; bd2++) {
    for (var bc = 0; bc <= 1; bc++) {
      var raw = bd1 + bd2 + bc;
      var low = raw & 0xF;
      var cout = raw >> 4;
      var k = (cout || corrOf(low)) ? 1 : 0;
      var corrected = low + 6 * k;
      var digit = corrected & 0xF;
      var carryOut = (corrected >> 4) || cout ? 1 : 0;
      var total = bd1 + bd2 + bc;
      var wantK = raw > 9 ? 1 : 0;
      if (k !== wantK) V.bcdTrigFailures++;
      if (digit !== total % 10 || carryOut !== Math.floor(total / 10)) V.bcdValueFailures++;
      V.bcdCases.push({
        d1: bd1, d2: bd2, cin: bc, raw: raw, low: low, cout: cout,
        k: k, digit: digit, carryOut: carryOut, total: total
      });
    }
  }
}

/* the correction condition against "greater than nine", on all sixteen nibbles */
V.corrTable = [];
for (var cs = 0; cs < 16; cs++) {
  V.corrTable.push({
    s: cs, bits: formatBits(cs, 4),
    corr: corrOf(cs), over9: cs > 9 ? 1 : 0,
    s3s2: ((cs >> 3) & 1) && ((cs >> 2) & 1) ? 1 : 0,
    s3s1: ((cs >> 3) & 1) && ((cs >> 1) & 1) ? 1 : 0
  });
}

/* the nibbles that actually occur, which is all sixteen */
var seenLow = {};
V.bcdCases.forEach(function (c) { seenLow[c.low] = 1; });
V.lowNibblesReachable = Object.keys(seenLow).length;
V.allNibblesReachable = V.lowNibblesReachable === 16;

/* the six that the correction rescues */
V.rescue = [];
for (var rs = 10; rs <= 15; rs++) {
  V.rescue.push({ s: rs, bits: formatBits(rs, 4), plus6: (rs + 6) & 0xF, carry: (rs + 6) >> 4, digit: rs - 10 });
}

/* the truth-table size the naive method would need */
V.blowup = [2, 4, 6, 8].map(function (n) {
  return { n: n, rows: Math.pow(4, n), text: Math.pow(4, n).toLocaleString('en-IN') };
});

/* ---------- 9. gate counts for equality ---------- */
V.eqGates = [4, 8, 16].map(function (n) {
  return { n: n, xnors: n, ands: n - 1, total: 2 * n - 1 };
});

/* ======================================================================
   LAYER 2 - THE CHECKS
   ====================================================================== */

/* 1. the one-bit comparator, against its gate expressions */
chk('1-bit comparator: G = a AND NOT b, E = a XNOR b, L = NOT a AND b, on all four rows',
  V.oneBit.every(function (r) { return r.g === r.gExpr && r.e === r.eExpr && r.l === r.lExpr; }),
  V.oneBit.map(function (r) { return r.a + '' + r.b + ':' + r.g + r.e + r.l; }).join(' '));

chk('1-bit comparator: exactly one of the three outputs is 1 in every row',
  V.oneBit.every(function (r) { return r.g + r.e + r.l === 1; }));

/* 2. the ripple against the definition of the relation */
chk('the ripple comparator agrees with numeric comparison on all ' + V.ripplePairs + ' pairs up to six bits',
  V.rippleFailures === 0, V.rippleFailures + ' failures');

/* 3. counting */
chk('of the 4^n pairs, 2^n tie and the rest split evenly between greater and less',
  V.counts.every(function (c) { return c.eq === c.eqF && c.gt === c.gtF && c.gt === c.lt; }),
  V.counts.map(function (c) { return 'n' + c.n + ': ' + c.eq + '/' + c.gt; }).join(' '));

chk('at four bits the greater count is 120 and the equal count is 16',
  V.countAt(4).gt === 120 && V.countAt(4).eq === 16,
  V.countAt(4).eq + '/' + V.countAt(4).gt);

/* 4. Gray code */
chk('Gray code is a bijection on every width from one to ten bits',
  V.grayProps.every(function (p) { return p.bij; }));
chk('consecutive Gray codes differ in exactly one bit, at every width from one to ten',
  V.grayProps.every(function (p) { return p.adj; }));
chk('the last and first Gray codes also differ in exactly one bit, so the list closes into a cycle',
  V.grayProps.every(function (p) { return p.wrap; }));
chk('the inverse recovers the original number for every four-bit word',
  (function () {
    for (var x = 0; x < 16; x++) if (g2b(b2g(x), 4) !== x) return false;
    return true;
  })());
chk('binary 1011 is Gray 1110 and Gray 1110 is binary 1011',
  V.grayEx.gray === '1110' && V.grayEx.back === '1011', V.grayEx.gray + ' / ' + V.grayEx.back);

/* 5. the K-map link */
chk('the K-map axis order 00 01 11 10 is exactly the two-bit Gray sequence', V.kmapAxisIsGray);
chk('every adjacent pair of K-map axis labels differs in exactly one bit, wrapping included',
  V.kmapAdjacentAllOneBit);

/* 6. excess-3 */
chk('excess-3 is self-complementing: inverting the code gives the code for the nines complement',
  V.xs3.every(function (r) { return r.selfComp; }));
chk('excess-3 has no all-zero and no all-one codeword',
  V.xs3.every(function (r) { return r.ex !== '0000' && r.ex !== '1111'; }));

/* 7. the BCD adder */
chk('the correction fires exactly when the binary sum exceeds nine, on all 200 inputs',
  V.bcdTrigFailures === 0, V.bcdTrigFailures + ' wrong triggers');
chk('the corrected output equals the decimal sum and carry on all 200 inputs',
  V.bcdValueFailures === 0, V.bcdValueFailures + ' wrong results');
chk('the expression C-out + S3 S2 + S3 S1 equals "greater than nine" on all sixteen nibbles',
  V.corrTable.every(function (r) { return r.corr === r.over9; }));
chk('the low nibble takes every value from 0 to 15, so 10 to 15 are reachable and not don\'t-cares',
  V.allNibblesReachable, V.lowNibblesReachable + ' of 16');
chk('adding six maps each of 10 to 15 onto 0 to 5 and produces a carry out',
  V.rescue.every(function (r) { return r.plus6 === r.digit && r.carry === 1; }));

/* 8. the naive table size */
chk('a naive table for eight input bits would need 65536 rows', V.blowup[3].rows === 65536);

/* 9. equality gate counts */
chk('equality of two n-bit words costs n XNOR plus n-1 AND, so 15 gates at eight bits',
  V.eqGates.every(function (g) { return g.total === 2 * g.n - 1; }) && V.eqGates[1].total === 15);

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

function txt(x, y, s, o) { P.text(x, y, s, o || {}); }

function card(x, y, w, h, o) {
  o = o || {};
  P.rect(x, y, w, h, { fill: o.fill || SURF2, stroke: o.stroke || BORDER, sw: 1.2, radius: 8 });
}

function chip(x, y, label, colour) {
  P.rect(x, y, Math.max(28, label.length * 7 + 12), 18, { fill: colour, radius: 9 });
  txt(x + 6, y + 9, label, { size: 10.5, base: 'middle', color: SURF, bold: true });
  return Math.max(28, label.length * 7 + 12) + 6;
}

function bitCells(x, y, str, cw, o) {
  o = o || {};
  var ch = o.ch || 30;
  for (var i = 0; i < str.length; i++) {
    var on = str.charAt(i) === '1';
    P.rect(x + i * cw, y, cw - 4, ch, {
      fill: on ? (o.onFill || ACCDIM) : (o.offFill || SURF),
      stroke: o.stroke || BORDER, sw: 1.1, radius: 4
    });
    txt(x + i * cw + (cw - 4) / 2, y + ch / 2, str.charAt(i), {
      size: o.size || 14, mono: true, align: 'center', base: 'middle',
      color: on ? INK : DIM, bold: true
    });
  }
  return str.length * cw;
}

function heading(t) {
  txt(28, 26, t, { size: 16, bold: true, color: INK });
  P.line(28, 42, W - 28, 42, { stroke: BORDER, sw: 1 });
}

function note(x, y, s, o) {
  o = o || {};
  txt(x, y, s, { size: o.size || 12, color: o.color || DIM });
}

/* progress within a scene, 0 to 1 */
function prog(t, sc) {
  if (!sc) return 1;
  var p = (t - sc.start) / Math.max(0.001, sc.end - sc.start);
  return p < 0 ? 0 : p > 1 ? 1 : p;
}

var SCENE_DRAW = {};

/* ---- scene 1: a specification, not a table ---- */
SCENE_DRAW.spec = function (t, sc) {
  var p = prog(t, sc);
  heading('Three problems, one shape: a specification that is too big to tabulate');
  note(28, 66, 'Compare two words. Re-spell a word in another code. Add two decimal digits with a four-bit adder.');

  card(28, 88, 400, 250);
  txt(44, 110, 'The naive design method', { size: 13, bold: true });
  note(44, 132, 'Input word in, output word out: that is a truth table.');
  var y = 156;
  V.blowup.forEach(function (b, i) {
    var shown = p > 0.15 + i * 0.12;
    if (!shown) return;
    note(44, y, b.n + ' input bits', { size: 11.5 });
    var w = Math.max(6, Math.log10(b.rows) * 22);
    P.rect(140, y - 9, w, 13, { fill: i === 3 ? BADDIM : ACCDIM, stroke: i === 3 ? BAD : ACC, sw: 1, radius: 3 });
    txt(148 + w, y - 2, b.text + ' rows', { size: 11, mono: true, color: i === 3 ? BAD : DIM });
    y += 26;
  });
  note(44, 282, 'Two eight-bit words need 65536 rows.');
  note(44, 302, 'Every one of the three problems below is solved by finding a small', { size: 11.5 });
  note(44, 318, 'quantity that summarises the bits already seen, and passing it up.', { size: 11.5 });

  card(448, 88, 424, 250, { fill: SURF });
  txt(464, 110, 'The same trick three times', { size: 13, bold: true });
  var items = [
    ['Comparator', 'the triple (greater, equal, less) about the higher bits', ACC],
    ['Gray code', 'the running prefix XOR of the higher bits', INFO],
    ['BCD adder', 'the correction flag carried out of the low nibble', VAL]
  ];
  items.forEach(function (it, i) {
    if (p < 0.35 + i * 0.15) return;
    var yy = 128 + i * 58;
    P.rect(464, yy, 392, 50, { fill: SURF2, stroke: BORDER, sw: 1, radius: 6 });
    txt(478, yy + 18, it[0], { size: 12.5, bold: true, color: it[2] });
    txt(478, yy + 36, it[1], { size: 11, color: DIM });
  });
  note(464, 330, 'This is the same move as the carry in a carry-look-ahead adder.', { size: 11, color: ACC });

  txt(28, 400, 'Every figure on this page is computed by the model and re-checked; the count is under the canvas.',
    { size: 11.5, color: FAINT });
};

/* ---- scene 2: the one-bit comparator ---- */
SCENE_DRAW.onebit = function (t, sc) {
  var p = prog(t, sc);
  heading('One bit at a time: three outputs, and only one of them is ever 1');
  note(28, 66, 'G means a is greater than b. E means they are equal. L means a is less than b.');

  var x0 = 28, y0 = 96, cw = 96, rh = 34;
  card(x0, y0, 470, 226, { fill: SURF });
  var cols = ['a', 'b', 'G', 'E', 'L'];
  cols.forEach(function (c, i) {
    txt(x0 + 40 + i * cw, y0 + 26, c, { size: 12.5, bold: true, mono: true, align: 'center', color: DIM });
  });
  P.line(x0 + 12, y0 + 38, x0 + 458, y0 + 38, { stroke: BORDER, sw: 1 });
  V.oneBit.forEach(function (r, i) {
    if (p < 0.1 + i * 0.12) return;
    var yy = y0 + 52 + i * rh;
    var vals = [r.a, r.b, r.g, r.e, r.l];
    vals.forEach(function (v, j) {
      var on = v === 1;
      var col = j < 2 ? (on ? ACC : DIM) : (on ? (j === 3 ? INFO : VAL) : FAINT);
      txt(x0 + 40 + j * cw, yy + 14, String(v), {
        size: 14, mono: true, align: 'center', bold: on && j >= 2, color: col
      });
    });
    if (p > 0.55) {
      P.rect(x0 + 12, yy + 2, 444, rh - 8, { stroke: BORDER, sw: 0.8, radius: 4 });
    }
  });
  note(x0 + 14, y0 + 198, 'The three columns G, E and L hold exactly one 1 in every row.');
  note(x0 + 14, y0 + 214, 'Never two, never none — so the triple is a safe answer.', { size: 11, color: FAINT });

  card(516, 96, 356, 226, { fill: SURF2 });
  txt(532, 118, 'Each output is one gate', { size: 13, bold: true });
  var gates = [
    ['G = a AND NOT b', 'true only on row 10', ACC],
    ['E = a XNOR b', 'an XOR with a bubble: equality', INFO],
    ['L = NOT a AND b', 'true only on row 01', VAL]
  ];
  gates.forEach(function (g, i) {
    if (p < 0.3 + i * 0.15) return;
    var yy = 146 + i * 56;
    txt(532, yy, g[0], { size: 12.5, mono: true, bold: true, color: g[2] });
    txt(532, yy + 18, g[1], { size: 11, color: DIM });
  });
  note(532, 300, 'G and L are single rows. E is the widest of the three,', { size: 11 });
  note(532, 314, 'and it is the one passed forward when the bits tie.', { size: 11, color: ACC });
};

/* ---- scene 3: the ripple ---- */
SCENE_DRAW.ripple = function (t, sc) {
  var p = prog(t, sc);
  heading('The triple is the carry: pass it left, and let the higher bits decide first');
  note(28, 66, 'Comparing 1011 with 1001, most significant bit first. The state starts tied.');

  var x0 = 28, y0 = 96, rh = 30, cw = 74;
  card(x0, y0, 560, 236, { fill: SURF });
  var heads = ['bit', 'a', 'b', 'G', 'E', 'L', 'what happened'];
  var hx = [x0 + 18, x0 + 74, x0 + 148, x0 + 222, x0 + 288, x0 + 354, x0 + 420];
  heads.forEach(function (h, i) {
    txt(hx[i], y0 + 24, h, { size: 11.5, bold: true, mono: i < 6, color: DIM });
  });
  P.line(x0 + 12, y0 + 34, x0 + 548, y0 + 34, { stroke: BORDER, sw: 1 });

  var steps = V.trace;
  var shownCount = Math.floor(p * steps.length * 1.15);
  for (var i = 0; i < steps.length; i++) {
    if (i > shownCount) break;
    var s = steps[i];
    var yy = y0 + 50 + i * rh;
    var lab = s.i === null ? 'tie in' : 'b' + s.i;
    txt(hx[0], yy + 12, lab, { size: 11.5, mono: true, color: DIM });
    txt(hx[1], yy + 12, s.ai === null ? '-' : String(s.ai), { size: 12, mono: true, align: 'center', color: INK });
    txt(hx[2], yy + 12, s.bi === null ? '-' : String(s.bi), { size: 12, mono: true, align: 'center', color: INK });
    [s.g, s.e, s.l].forEach(function (v, j) {
      var on = v === 1;
      txt(hx[3 + j], yy + 12, String(v), {
        size: 12, mono: true, align: 'center', bold: on,
        color: on ? (j === 1 ? INFO : VAL) : FAINT
      });
    });
    txt(hx[6], yy + 12, s.why, { size: 10.5, color: s.why === 'already decided' ? FAINT : ACC });
  }

  card(604, 96, 268, 236, { fill: SURF2 });
  txt(620, 118, 'One step of the ripple', { size: 12.5, bold: true });
  txt(620, 146, 'G_out = G_in OR (E_in AND a>b)', { size: 11, mono: true, color: ACC });
  txt(620, 166, 'L_out = L_in OR (E_in AND a<b)', { size: 11, mono: true, color: ACC });
  txt(620, 186, 'E_out = E_in AND (a=b)', { size: 11, mono: true, color: ACC });
  note(620, 212, 'Read the first line in words: the higher', { size: 10.5 });
  note(620, 226, 'bits decide unless they were all tied, and', { size: 10.5 });
  note(620, 240, 'only then does this bit get a say.', { size: 10.5 });
  if (p > 0.7) {
    txt(620, 274, 'bit 1 decides: a=1, b=0', { size: 11, bold: true, color: VAL });
    txt(620, 292, 'bit 0 is never consulted', { size: 11, color: DIM });
  }
  note(28, 352, 'The ripple is checked against numeric comparison on ' + V.ripplePairs +
    ' pairs up to six bits: ' + (V.rippleFailures === 0 ? 'no disagreement.' : V.rippleFailures + ' disagreements.'),
    { size: 11.5, color: V.rippleFailures === 0 ? VAL : BAD });
};

/* ---- scene 4: counting, and cascading ---- */
SCENE_DRAW.count = function (t, sc) {
  var p = prog(t, sc);
  heading('Count the outcomes, then stack two comparators to compare wider words');
  note(28, 66, 'A four-bit comparator is asked to count, not to compare: how many input pairs give each answer?');

  var x0 = 28, y0 = 96;
  card(x0, y0, 430, 200, { fill: SURF });
  txt(x0 + 16, y0 + 22, 'Out of 4^n ordered pairs', { size: 12.5, bold: true });
  var rows = V.counts.slice(0, 3);
  var bx = x0 + 16, by = y0 + 46, bw = 396;
  rows.forEach(function (c, i) {
    if (p < 0.15 + i * 0.15) return;
    var yy = by + i * 46;
    txt(bx, yy + 10, 'n = ' + c.n, { size: 11.5, mono: true, bold: true, color: DIM });
    var wx = bw * c.eq / c.pairs, wy = bw * c.gt / c.pairs;
    P.rect(bx + 44, yy, wx, 15, { fill: ACCDIM, stroke: ACC, sw: 1, radius: 2 });
    txt(bx + 48 + wx, yy + 8, 'equal ' + c.eq, { size: 10, mono: true, color: ACC, base: 'middle' });
    P.rect(bx + 44, yy + 18, wy, 11, { fill: WARNDIM, stroke: WARN, sw: 1, radius: 2 });
    txt(bx + 48 + wy, yy + 24, 'greater ' + c.gt + '  (less is the same)', { size: 10, mono: true, color: WARN, base: 'middle' });
  });
  note(x0 + 16, y0 + 180, 'equal = 2^n, greater = less = (4^n - 2^n)/2.');
  note(x0 + 16, y0 + 196, 'At four bits: 16, 120, 120.', { size: 11, color: FAINT });

  card(474, y0, 398, 200, { fill: SURF2 });
  txt(490, y0 + 22, 'Comparing eight bits from two four-bit parts', { size: 12.5, bold: true });
  var cy = y0 + 52;
  P.rect(490, cy, 120, 46, { fill: SURF, stroke: ACC, sw: 1.3, radius: 6 });
  txt(550, cy + 18, 'low nibble', { size: 11, align: 'center', color: DIM });
  txt(550, cy + 34, 'comparator', { size: 11, align: 'center', color: ACC, bold: true });
  P.rect(490, cy + 76, 120, 46, { fill: SURF, stroke: ACC, sw: 1.3, radius: 6 });
  txt(550, cy + 94, 'high nibble', { size: 11, align: 'center', color: DIM });
  txt(550, cy + 110, 'comparator', { size: 11, align: 'center', color: ACC, bold: true });
  if (p > 0.4) {
    P.arrow(550, cy + 76, 550, cy + 48, { stroke: ACC, sw: 1.4 });
    txt(560, cy + 62, 'G, E, L', { size: 10, mono: true, color: ACC });
  }
  if (p > 0.6) {
    txt(626, cy + 92, 'the low stage feeds the', { size: 10.5, color: DIM });
    txt(626, cy + 106, 'high stage, not the other', { size: 10.5, color: DIM });
    txt(626, cy + 120, 'way round', { size: 10.5, color: DIM });
  }
  note(490, y0 + 186, 'The bottom stage must start tied: tie-in = G 0, E 1, L 0.', { color: WARN });
  note(28, 320, 'A tie-in of anything other than (0, 1, 0) makes the wider comparator answer a question nobody asked.',
    { size: 11.5, color: WARN });
};

/* ---- scene 5: three codes for one digit ---- */
SCENE_DRAW.codes = function (t, sc) {
  var p = prog(t, sc);
  heading('A code is a spelling: the same digit, written three ways');
  note(28, 66, 'BCD writes the digit in binary. Excess-3 writes digit plus three. Gray writes it so neighbours differ by one bit.');

  var x0 = 28, y0 = 92, rh = 20;
  card(x0, y0, 430, 280, { fill: SURF });
  var heads = ['digit', 'BCD', 'excess-3', 'inverted', 'gives 9-d'];
  var hx = [x0 + 20, x0 + 90, x0 + 190, x0 + 290, x0 + 380];
  heads.forEach(function (h, i) {
    txt(hx[i], y0 + 20, h, { size: 10.5, bold: true, color: DIM });
  });
  P.line(x0 + 12, y0 + 30, x0 + 418, y0 + 30, { stroke: BORDER, sw: 1 });
  V.xs3.forEach(function (r, i) {
    if (p < 0.08 + i * 0.06) return;
    var yy = y0 + 42 + i * rh;
    txt(hx[0], yy, String(r.d), { size: 11, mono: true, align: 'center', color: INK });
    txt(hx[1], yy, r.bcd, { size: 11, mono: true, align: 'center', color: DIM });
    txt(hx[2], yy, r.ex, { size: 11, mono: true, align: 'center', color: ACC, bold: true });
    txt(hx[3], yy, r.complement, { size: 11, mono: true, align: 'center', color: INFO });
    txt(hx[4], yy, r.nineMinus, { size: 11, mono: true, align: 'center', color: VAL });
  });
  note(x0 + 16, y0 + 258, 'The last two columns are always equal: that is what self-complementing means.', { size: 11 });

  card(474, y0, 398, 280, { fill: SURF2 });
  txt(490, y0 + 22, 'Why a code, and not just the number', { size: 12.5, bold: true });
  note(490, y0 + 50, 'Binary is for arithmetic. A code is for a device.', { size: 11 });
  var bullets = [
    ['BCD', 'one decimal digit per four bits, so no division by ten', ACC],
    ['excess-3', 'inverting the bits gives the nines complement', INFO],
    ['Gray', 'neighbours differ in one bit, so a sensor cannot glitch', VAL]
  ];
  bullets.forEach(function (b, i) {
    if (p < 0.35 + i * 0.16) return;
    var yy = y0 + 76 + i * 62;
    P.rect(490, yy, 366, 52, { fill: SURF, stroke: BORDER, sw: 1, radius: 6 });
    txt(504, yy + 18, b[0], { size: 11.5, bold: true, color: b[2] });
    txt(504, yy + 34, b[1], { size: 10.5, color: DIM });
  });
  note(28, 392, 'BCD uses ten of the sixteen four-bit words; the other six have no digit to mean.', { size: 11.5, color: FAINT });
};

/* ---- scene 6: binary to Gray ---- */
SCENE_DRAW.gray = function (t, sc) {
  var p = prog(t, sc);
  heading('Gray code: one exclusive-or per bit, and neighbours differ by one bit');
  note(28, 66, 'g3 = b3, and every lower Gray bit is that binary bit exclusive-or the one above it.');

  var x0 = 28, y0 = 92;
  card(x0, y0, 420, 130, { fill: SURF });
  txt(x0 + 16, y0 + 22, 'The conversion on 1011', { size: 12.5, bold: true });
  bitCells(x0 + 16, y0 + 38, '1011', 34, { ch: 26, size: 12 });
  txt(x0 + 152, y0 + 56, 'binary', { size: 10.5, color: DIM, base: 'middle' });
  if (p > 0.25) {
    bitCells(x0 + 16, y0 + 82, V.grayEx.gray, 34, { ch: 26, size: 12, onFill: ACCDIM });
    txt(x0 + 152, y0 + 100, 'Gray', { size: 10.5, color: ACC, base: 'middle', bold: true });
  }
  if (p > 0.45) {
    note(x0 + 16, y0 + 124, 'g3 = 1, g2 = 1 xor 0 = 1, g1 = 0 xor 1 = 1, g0 = 1 xor 1 = 0', { size: 10.5, mono: true, color: DIM });
  }

  var tx = 470, ty = y0;
  card(tx, ty, 402, 262, { fill: SURF });
  txt(tx + 14, ty + 22, 'The four-bit sequence', { size: 12.5, bold: true });
  var cols = 4, cw = 92, chh = 26;
  for (var i = 0; i < 16; i++) {
    if (p < 0.3 + i * 0.025) break;
    var r = V.grayTable[i];
    var cx = tx + 14 + (i % cols) * cw;
    var cy = ty + 40 + Math.floor(i / cols) * chh;
    txt(cx, cy + 8, r.n + ':', { size: 9.5, mono: true, color: FAINT, base: 'middle' });
    txt(cx + 20, cy + 8, r.gray, { size: 11, mono: true, color: INK, base: 'middle' });
    if (r.flip && popcount(r.flip) === 1) {
      txt(cx + 66, cy + 8, '1 bit', { size: 8.5, color: VAL, base: 'middle' });
    }
  }
  if (p > 0.8) {
    note(tx + 14, ty + 186, 'Each row differs from the one before it in exactly one bit.', { size: 11, color: VAL });
    note(tx + 14, ty + 204, 'The last row differs from the first in exactly one bit too,', { size: 11, color: VAL });
    note(tx + 14, ty + 220, 'so the sixteen words form a cycle, not just a list.', { size: 11, color: VAL });
  }
  note(tx + 14, ty + 244, 'Checked at every width from one to ten bits.', { size: 10.5, color: FAINT });

  note(28, 372, 'Binary to Gray is one exclusive-or per bit; Gray back to binary is a running prefix exclusive-or,',
    { size: 11.5 });
  note(28, 390, 'which is why decoding costs one gate more per bit than encoding in a naive chain.', { size: 11.5 });
};

/* ---- scene 7: Gray is the K-map axis ---- */
SCENE_DRAW.kmap = function (t, sc) {
  var p = prog(t, sc);
  heading('Why the map works: its axis order is a Gray code');
  note(28, 66, 'The columns and rows of a Karnaugh map are labelled 00, 01, 11, 10 — the two-bit Gray sequence.');

  var x0 = 60, y0 = 120, cell = 58;
  card(28, 96, 420, 268, { fill: SURF });
  V.kmapAxis.forEach(function (lab, i) {
    txt(x0 + i * cell + cell / 2, y0 - 16, lab, { size: 12, mono: true, align: 'center', color: ACC, bold: true });
    txt(x0 - 30, y0 + i * cell + cell / 2, lab, { size: 12, mono: true, align: 'center', color: ACC, bold: true });
  });
  for (var r = 0; r < 4; r++) {
    for (var c = 0; c < 4; c++) {
      var lit = (r < 2 && c < 2) || (r === 3 && c === 3);
      P.rect(x0 + c * cell, y0 + r * cell, cell - 3, cell - 3, {
        fill: lit ? ACCDIM : SURF2, stroke: BORDER, sw: 1, radius: 3
      });
    }
  }
  if (p > 0.35) {
    txt(x0 - 30, y0 + cell + cell / 2, '01', { size: 12, mono: true, align: 'center', color: ACC, bold: true });
    txt(x0 + cell + cell / 2, y0 - 16, '01', { size: 12, mono: true, align: 'center', color: ACC, bold: true });
    txt(x0 + 2 * cell + cell / 2, y0 - 16, '11', { size: 12, mono: true, align: 'center', color: ACC, bold: true });
    note(x0, y0 + 4 * cell + 16, 'Two labels that differ in one bit sit next to each other, so their cells merge.', { size: 11, color: VAL });
  }
  if (p > 0.6) {
    P.rect(x0 - 4, y0 - 4, 2 * cell + 2, 2 * cell + 2, { stroke: VAL, sw: 2.2, radius: 6 });
    note(x0, y0 + 4 * cell + 34, 'This block of four keeps two literals instead of four.', { size: 11, color: VAL });
  }

  card(470, 96, 402, 268, { fill: SURF2 });
  txt(486, 118, 'The link in one line', { size: 12.5, bold: true });
  note(486, 146, 'A block of two cells merges when the cells differ in one', { size: 11 });
  note(486, 160, 'input bit. The map is laid out so that the cells which', { size: 11 });
  note(486, 174, 'differ in one bit are the cells which touch.', { size: 11 });
  note(486, 200, 'The axis order that achieves this is a Gray code,', { size: 11, color: ACC, bold: true });
  note(486, 214, 'which is why counting order 00 01 10 11 would break', { size: 11, color: ACC });
  note(486, 228, 'the map: 01 and 10 are neighbours in value but not', { size: 11, color: ACC });
  note(486, 242, 'in the code, and they would sit apart.', { size: 11, color: ACC });
  if (p > 0.7) {
    txt(486, 274, 'Checked: all four axis labels are the Gray sequence,', { size: 10.5, color: VAL });
    txt(486, 288, 'and every adjacent pair differs in exactly one bit.', { size: 10.5, color: VAL });
  }
  txt(28, 418, 'The K-map itself is taught in the Boolean Algebra and Minimisation lesson; this page supplies the code that makes it work.',
    { size: 11, color: FAINT });
};

/* ---- scene 8: the BCD adder ---- */
SCENE_DRAW.bcd = function (t, sc) {
  var p = prog(t, sc);
  heading('Adding decimal digits: the four-bit adder stops being a decimal adder at ten');
  note(28, 66, 'Two BCD digits and a carry in give a binary sum from 0 to 19. Ten to nineteen are not two digits yet.');

  var x0 = 28, y0 = 96;
  card(x0, y0, 560, 150, { fill: SURF });
  txt(x0 + 16, y0 + 22, 'The range a four-bit adder actually produces', { size: 12.5, bold: true });
  var bx = x0 + 16, bw = 26, by = y0 + 44;
  for (var i = 0; i < 20; i++) {
    var bad = i > 9;
    P.rect(bx + i * (bw + 2), by, bw, 34, {
      fill: bad ? BADDIM : ACCDIM, stroke: bad ? BAD : ACC, sw: 1, radius: 3
    });
    txt(bx + i * (bw + 2) + bw / 2, by + 17, String(i), {
      size: 10, mono: true, align: 'center', base: 'middle', color: bad ? BAD : INK
    });
  }
  txt(bx, by + 54, 'valid single digit', { size: 10.5, color: ACC });
  txt(bx + 10 * (bw + 2), by + 54, 'not a digit: needs a carry', { size: 10.5, color: BAD });
  if (p > 0.3) {
    note(x0 + 16, y0 + 124, 'Ten to fifteen also collide with the six unused words,', { size: 11, color: WARN });
    note(x0 + 16, y0 + 138, 'so the output would be read as a different digit.', { size: 11, color: WARN });
  }

  card(604, y0, 268, 150, { fill: SURF2 });
  txt(620, y0 + 22, 'The repair', { size: 12.5, bold: true });
  note(620, y0 + 46, 'If the sum exceeds nine, add six.', { size: 11.5, color: ACC, bold: true });
  note(620, y0 + 66, 'Six is sixteen minus ten: adding it', { size: 10.5 });
  note(620, y0 + 80, 'skips the six invalid words and', { size: 10.5 });
  note(620, y0 + 94, 'carries out of the nibble.', { size: 10.5 });
  if (p > 0.55) {
    txt(620, y0 + 124, 'C-out + S3 S2 + S3 S1', { size: 12, mono: true, bold: true, color: VAL });
  }

  var ty = 268;
  card(28, ty, 844, 130, { fill: SURF });
  txt(44, ty + 20, 'A worked case: 7 + 5 + 0', { size: 12.5, bold: true });
  var ex = V.bcdCases.filter(function (c) { return c.d1 === 7 && c.d2 === 5 && c.cin === 0; })[0];
  if (p > 0.4 && ex) {
    txt(44, ty + 46, 'binary sum', { size: 10.5, color: DIM });
    bitCells(140, ty + 34, V.formatBits(ex.raw, 5), 30, { ch: 24, size: 11 });
    txt(320, ty + 46, '= ' + ex.raw, { size: 11, mono: true, color: INK });
    txt(380, ty + 46, 'low nibble ' + V.formatBits(ex.low, 4) + ' = ' + ex.low, { size: 10.5, mono: true, color: BAD });
    txt(44, ty + 82, 'add six', { size: 10.5, color: DIM });
    txt(140, ty + 82, '+ 0110 gives ' + V.formatBits((ex.low + 6) & 0xF, 4) + ' and a carry out', { size: 11, mono: true, color: VAL });
    txt(44, ty + 106, 'result', { size: 10.5, color: DIM });
    txt(140, ty + 106, 'carry ' + ex.carryOut + ', digit ' + ex.digit + '  —  which is ' + ex.total + ' as a decimal answer',
      { size: 11.5, mono: true, color: VAL, bold: true });
  }
  note(28, 414, 'All 200 inputs are checked against decimal addition: ' +
    (V.bcdValueFailures === 0 ? 'no disagreements.' : V.bcdValueFailures + ' disagreements.'),
    { size: 11.5, color: V.bcdValueFailures === 0 ? VAL : BAD });
};

/* ---- scene 9: why six ---- */
SCENE_DRAW.why6 = function (t, sc) {
  var p = prog(t, sc);
  heading('Why six works, and why the correction condition is exactly "greater than nine"');
  note(28, 66, 'Sixteen minus ten is six, so adding six is the same as wrapping round by one decimal place.');

  var x0 = 28, y0 = 96;
  card(x0, y0, 430, 250, { fill: SURF });
  txt(x0 + 16, y0 + 22, 'The six rescued words', { size: 12.5, bold: true });
  var heads = ['sum', 'bits', '+6', 'carry', 'digit'];
  var hx = [x0 + 20, x0 + 90, x0 + 190, x0 + 268, x0 + 350];
  heads.forEach(function (h, i) { txt(hx[i], y0 + 46, h, { size: 10.5, bold: true, color: DIM }); });
  P.line(x0 + 12, y0 + 56, x0 + 418, y0 + 56, { stroke: BORDER, sw: 1 });
  V.rescue.forEach(function (r, i) {
    if (p < 0.12 + i * 0.1) return;
    var yy = y0 + 70 + i * 26;
    txt(hx[0], yy, String(r.s), { size: 11, mono: true, align: 'center', color: BAD, bold: true });
    txt(hx[1], yy, r.bits, { size: 11, mono: true, align: 'center', color: BAD });
    txt(hx[2], yy, V.formatBits(r.plus6, 4), { size: 11, mono: true, align: 'center', color: VAL, bold: true });
    txt(hx[3], yy, String(r.carry), { size: 11, mono: true, align: 'center', color: INFO });
    txt(hx[4], yy, String(r.digit), { size: 11, mono: true, align: 'center', color: VAL, bold: true });
  });
  note(x0 + 16, y0 + 232, 'Each of the six lands on 0 to 5 and raises the carry — which is the tens digit.', { size: 11 });

  card(474, y0, 398, 250, { fill: SURF2 });
  txt(490, y0 + 22, 'The condition, term by term', { size: 12.5, bold: true });
  var terms = [
    ['C-out', 'the sum already reached sixteen or more', ACC],
    ['S3 S2', 'the nibble is 1100, 1101, 1110 or 1111', INFO],
    ['S3 S1', 'the nibble is 1010, 1011, 1110 or 1111', WARN]
  ];
  terms.forEach(function (tm, i) {
    if (p < 0.35 + i * 0.14) return;
    var yy = y0 + 50 + i * 46;
    txt(490, yy, tm[0], { size: 12, mono: true, bold: true, color: tm[2] });
    txt(490, yy + 16, tm[1], { size: 10.5, color: DIM });
  });
  if (p > 0.78) {
    P.rect(486, y0 + 190, 374, 42, { fill: SURF, stroke: VAL, sw: 1.2, radius: 6 });
    txt(498, y0 + 206, 'Together they cover exactly 1010 to 1111.', { size: 11, color: VAL });
    txt(498, y0 + 222, 'So the gate output equals "sum > 9" — checked on all 16 nibbles.', { size: 10.5, color: VAL });
  }
  note(28, 372, 'The other two nibbles are not don\'t-cares. Ten to fifteen really arrive, which is why this condition', { size: 11.5 });
  note(28, 390, 'must be right on all sixteen words rather than merely convenient.', { size: 11.5, color: WARN });
};

/* ---- scene 10: procedure and traps ---- */
SCENE_DRAW.proc = function (t, sc) {
  var p = prog(t, sc);
  heading('One procedure for all three problems, and the five traps that break it');
  note(28, 66, 'Written down once, it answers a comparator, a code conversion or a BCD adder question.');

  var steps = [
    ['1', 'Name the input word and the output word.', 'Comparator: two words in, three flags out.'],
    ['2', 'Find the quantity that summarises the lower bits.', 'The (G, E, L) triple; the prefix XOR; the correction flag.'],
    ['3', 'Write the per-position rule, then check it on every input.', 'The ripple is checked on all pairs up to six bits.'],
    ['4', 'Read the question: a count, a code, a gate count or a flag.', 'Each has its own sanity check.']
  ];
  var x0 = 28, y0 = 92;
  steps.forEach(function (s, i) {
    if (p < 0.1 + i * 0.12) return;
    var yy = y0 + i * 56;
    card(x0, yy, 540, 48, { fill: SURF });
    P.circle(x0 + 26, yy + 24, 13, { fill: ACCDIM, stroke: ACC, sw: 1.2 });
    txt(x0 + 26, yy + 24, s[0], { size: 12, mono: true, align: 'center', base: 'middle', color: ACC, bold: true });
    txt(x0 + 50, yy + 20, s[1], { size: 12, color: INK, bold: true });
    txt(x0 + 50, yy + 36, s[2], { size: 10.5, color: DIM });
  });

  var traps = [
    'Comparing the least significant bit first.',
    'Feeding a cascaded stage anything but a tie.',
    'Using the Gray decode chain to encode.',
    'Treating 10 to 15 in BCD as don\'t-cares.',
    'Forgetting the carry the correction raises.'
  ];
  card(586, y0, 286, 240, { fill: WARNDIM, stroke: WARN, sw: 1.2 });
  txt(602, y0 + 22, 'The five traps', { size: 12.5, bold: true, color: WARN });
  traps.forEach(function (tr, i) {
    if (p < 0.5 + i * 0.08) return;
    txt(602, y0 + 48 + i * 34, '· ' + tr, { size: 10.5, color: INK });
  });
  note(28, 342, 'None of the three problems is solved by a bigger truth table. Each is solved by one small state', { size: 11.5 });
  note(28, 360, 'passed from position to position — which is the carry idea, wearing three different hats.', { size: 11.5, color: ACC });
};

/* the frame */
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

  fillChecks();

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
