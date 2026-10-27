(function () {
  'use strict';

  var W = 900, H = 470;
  var K = window.LessonKit;
  var PR = window.Painters;
  var PAL = PR.PAL;
  var P = null;

/* ======================================================================
   LAYER 1 - THE MODEL (memory-interfacing-and-interleaving)
   Pure data and pure functions. No drawing here. Nothing in this section
   knows what a canvas is. Every number the lesson quotes is computed.
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) { CHECKS.push({ name: name, pass: !!pass, detail: detail || '' }); }

function approx(a, b, eps) { eps = eps === undefined ? 1e-9 : eps; return Math.abs(a - b) <= eps; }

/* exact log base 2 for powers of two; NaN otherwise, which is itself a check */
function lg2(x) {
  if (!(x >= 1)) return NaN;
  var n = 0, v = 1;
  while (v < x) { v *= 2; n++; }
  return v === x ? n : NaN;
}

/* ---------------- 1. chip organisation ---------------- */
function build(totalWords, totalBits, chipWords, chipBits) {
  var across = totalBits / chipBits;
  var rows = totalWords / chipWords;
  var addrBits = lg2(totalWords), chipAddrBits = lg2(chipWords);
  return {
    across: across, rows: rows, chips: across * rows,
    addrBits: addrBits, chipAddrBits: chipAddrBits,
    selectBits: addrBits - chipAddrBits,
    perChip: chipWords * chipBits
  };
}

/* ---------------- 2. chip select ---------------- */
function csRange(addrBits, cond) {
  var lo = 0, hi = 0, free = 0, b, i, c;
  for (b = 0; b < addrBits; b++) {
    c = null;
    for (i = 0; i < cond.length; i++) if (cond[i].bit === b) c = cond[i];
    if (c) { if (c.val) { lo += Math.pow(2, b); hi += Math.pow(2, b); } }
    else { hi += Math.pow(2, b); free++; }
  }
  return { lo: lo, hi: hi, size: Math.pow(2, free), freeBits: free };
}
function csEnumerate(addrBits, cond) {
  var n = Math.pow(2, addrBits), on = [], a, i, ok;
  for (a = 0; a < n; a++) {
    ok = true;
    for (i = 0; i < cond.length; i++) {
      if (((a >> cond[i].bit) & 1) !== cond[i].val) { ok = false; break; }
    }
    if (ok) on.push(a);
  }
  return on;
}

/* ---------------- 3. the 2023 four-block wiring ---------------- */
function blocks2023() {
  var out = [], k, a, sel, addrs;
  for (k = 0; k < 4; k++) {
    addrs = [];
    for (a = 0; a < 4096; a++) {
      sel = ((a >> 4) & 1) * 2 + ((a >> 3) & 1);
      if (sel === k) addrs.push(a);
    }
    out.push({ k: k, count: addrs.length, min: addrs[0], max: addrs[addrs.length - 1], addrs: addrs });
  }
  return out;
}

/* ---------------- 4. decoder tree ---------------- */
function smallDecoders(smallIn, smallOut, bigOut) {
  var total = 0, p = 1, levels = 0;
  while (p * smallOut <= bigOut) { total += p; p *= smallOut; levels++; }
  return { levels: levels, total: total, outs: p };
}

/* ---------------- 5. interleaving map ---------------- */
function bankOf(addr, addrBits, m, order) {
  var bankBits = lg2(m);
  if (order === 'low') return { bank: addr % m, word: Math.floor(addr / m) };
  var per = Math.pow(2, addrBits - bankBits);
  return { bank: Math.floor(addr / per), word: addr % per };
}

/* ---------------- 6. interleaved timing ---------------- */
function interleaveSim(n, m, tc, tbus) {
  var free = [], start = [], finish = [], i, b, s;
  for (b = 0; b < m; b++) free.push(0);
  for (i = 0; i < n; i++) {
    b = i % m;
    s = Math.max(i * tbus, free[b]);
    start.push(s); free[b] = s + tc; finish.push(free[b]);
  }
  return {
    start: start, finish: finish,
    total: Math.max.apply(null, finish),
    steadyInterval: (n > m ? (finish[n - 1] - finish[n - 1 - m]) / m : NaN)
  };
}
function formulaTime(n, m, tc, tbus) { return tc + (n - 1) * tbus; }
function overlapOK(m, tc, tbus) { return m * tbus >= tc; }
function bandwidth(m, tc, tbus, w) { return w / Math.max(tbus, tc / m); }

/* ---------------- 7. DRAM refresh ---------------- */
function refreshOverhead(rows, tRef, period) { return rows * tRef / period; }

/* ---------------- the worked cases the lesson draws ---------------- */
var CASE13 = build(16384, 16, 1024, 8);
var CASE17 = build(32768, 32, 128, 8);
var CASE15 = build(262144, 8, 32768, 1);
var COND19 = [{ bit: 15, val: 1 }, { bit: 14, val: 1 }, { bit: 13, val: 0 },
              { bit: 12, val: 0 }, { bit: 11, val: 1 }];
var RANGE19 = csRange(16, COND19);
var BLOCKS23 = blocks2023();
var DEC13 = smallDecoders(2, 4, 16);
var SIM4 = interleaveSim(8, 4, 40, 10);
var SIM2 = interleaveSim(8, 2, 40, 10);
var SIM14 = interleaveSim(10000, 8, 600, 100);
var SIM5 = interleaveSim(10000, 5, 600, 100);

/* ======================================================================
   LAYER 2 - THE CHECKS
   ====================================================================== */

function buildChecks() {

  /* 16K x 16 out of 1K x 8  (GATE 2013) */
  chk('16K x 16 from 1K x 8: 2 chips across, 16 rows, 32 chips',
      CASE13.across === 2 && CASE13.rows === 16 && CASE13.chips === 32,
      'across ' + CASE13.across + ', rows ' + CASE13.rows + ', total ' + CASE13.chips);
  chk('16K x 16 needs a 4-to-16 row decoder',
      CASE13.selectBits === 4 && CASE13.chipAddrBits === 10 && CASE13.addrBits === 14,
      'total ' + CASE13.addrBits + ', chip ' + CASE13.chipAddrBits + ', select ' + CASE13.selectBits);
  chk('the bit split adds up: 10 + 4 = 14',
      CASE13.chipAddrBits + CASE13.selectBits === CASE13.addrBits, 'sum ' + (CASE13.chipAddrBits + CASE13.selectBits));
  chk('2 raised to the select bits equals the row count',
      Math.pow(2, CASE13.selectBits) === CASE13.rows, '2^' + CASE13.selectBits + ' = ' + Math.pow(2, CASE13.selectBits));
  chk('4-to-16 built from 2-to-4 decoders costs 5',
      DEC13.total === 5 && DEC13.levels === 2 && DEC13.outs === 16,
      'levels ' + DEC13.levels + ', total ' + DEC13.total + ', outputs ' + DEC13.outs);

  /* chip counts from the archive */
  chk('32K x 32 from 128 x 8: 1024 chips', CASE17.chips === 1024,
      'across ' + CASE17.across + ', rows ' + CASE17.rows);
  chk('256 KB from 32K x 1: 64 chips', CASE15.chips === 64,
      'across ' + CASE15.across + ', rows ' + CASE15.rows);

  /* chip-select: GATE 2019 */
  chk('2019 chip select spans C800 to CFFF',
      RANGE19.lo === 0xC800 && RANGE19.hi === 0xCFFF,
      'lo ' + RANGE19.lo.toString(16).toUpperCase() + ', hi ' + RANGE19.hi.toString(16).toUpperCase());
  var e19 = csEnumerate(16, COND19);
  chk('2019 range holds exactly 2048 addresses', e19.length === 2048, 'counted ' + e19.length);
  chk('the enumeration agrees with the bit formula',
      e19[0] === RANGE19.lo && e19[e19.length - 1] === RANGE19.hi,
      'first ' + e19[0].toString(16) + ', last ' + e19[e19.length - 1].toString(16));
  chk('five fixed bits leave eleven free', RANGE19.freeBits === 11, 'free bits ' + RANGE19.freeBits);

  /* the 2023 four-block wiring */
  chk('2023: each 1 KB block owns 1024 addresses',
      BLOCKS23.every(function (x) { return x.count === 1024; }),
      BLOCKS23.map(function (x) { return x.count; }).join(','));
  chk('2023: starting addresses are 0, 8, 16, 24',
      BLOCKS23.map(function (x) { return x.min; }).join(',') === '0,8,16,24',
      BLOCKS23.map(function (x) { return x.min; }).join(','));
  var all23 = {}, distinct = 0;
  BLOCKS23.forEach(function (x) {
    x.addrs.forEach(function (a) { if (!all23[a]) { all23[a] = 1; distinct++; } });
  });
  chk('2023: the four blocks partition the whole 4 KB exactly once', distinct === 4096, 'distinct addresses ' + distinct);
  chk('2023: block k owns 8 bytes out of every 32, so the wiring is 4-way interleaved',
      BLOCKS23[1].addrs.slice(0, 4).join(',') === '8,9,10,11' && BLOCKS23[0].addrs[8] === 32,
      'block 1 opens ' + BLOCKS23[1].addrs.slice(0, 4).join(',') + '; block 0 second run opens ' + BLOCKS23[0].addrs[8]);

  /* interleaving map: GATE 1991 */
  var loSeq = [0, 1, 2, 3].map(function (a) { return bankOf(a, 6, 4, 'low').bank; });
  var hiSeq = [0, 1, 2, 3].map(function (a) { return bankOf(a, 6, 4, 'high').bank; });
  chk('low-order: consecutive words land in consecutive banks', loSeq.join(',') === '0,1,2,3', loSeq.join(','));
  chk('high-order: consecutive words stay in one bank', hiSeq.join(',') === '0,0,0,0', hiSeq.join(','));
  var seen = {}, dup = false, a2, p2, key;
  for (a2 = 0; a2 < 64; a2++) {
    p2 = bankOf(a2, 6, 4, 'low'); key = p2.bank + ':' + p2.word;
    if (seen[key]) dup = true; seen[key] = 1;
  }
  chk('low-order mapping is a bijection onto the 4 x 16 grid',
      !dup && Object.keys(seen).length === 64, 'pairs ' + Object.keys(seen).length);

  /* the overlap condition */
  chk('4 banks, 40 ns cycle, 10 ns bus: 8 words in 110 ns',
      SIM4.total === 110 && SIM4.total === formulaTime(8, 4, 40, 10), 'simulated ' + SIM4.total);
  chk('the overlap condition holds for 4 banks at 10 ns', overlapOK(4, 40, 10) === true, '4 x 10 = 40 >= 40');
  chk('2 banks break the formula: 170 ns simulated against 110 ns claimed',
      SIM2.total === 170 && formulaTime(8, 2, 40, 10) === 110,
      'simulated ' + SIM2.total + ', formula ' + formulaTime(8, 2, 40, 10));
  chk('the overlap condition fails for 2 banks at 10 ns', overlapOK(2, 40, 10) === false, '2 x 10 = 20 < 40');
  chk('steady interval is max(bus cycle, cycle over banks)',
      approx(SIM2.steadyInterval, 20) && approx(SIM4.steadyInterval, 10),
      'two banks ' + SIM2.steadyInterval + ' ns, four banks ' + SIM4.steadyInterval + ' ns');
  chk('bandwidth agrees with the simulated steady state',
      approx(bandwidth(2, 40, 10, 4), 0.2) && approx(bandwidth(4, 40, 10, 4), 0.4),
      'two banks ' + bandwidth(2, 40, 10, 4) + ', four banks ' + bandwidth(4, 40, 10, 4) + ' bytes per ns');

  /* GATE 2014 Set 2 */
  chk('2014 Set 2: 8 modules of 600 ns hide a 100 ns bus', overlapOK(8, 600, 100) === true, '8 x 100 = 800 >= 600');
  chk('2014 Set 2: 10000 stores initiated in 1 ms', 1e6 / 100 === 10000, '1e6 / 100 = ' + (1e6 / 100));
  chk('2014 Set 2: the simulation never stalls on a module', SIM14.start[9999] === 999900, 'last start ' + SIM14.start[9999] + ' ns');
  chk('2014 Set 2 with only 5 modules the answer falls to 8330', Math.floor(1e6 / 600) * 5 === 8330,
      'five per 600 ns gives ' + (Math.floor(1e6 / 600) * 5));
  chk('2014 Set 2: 5 modules do stall, the first wait is at the sixth store',
      SIM5.start[5] > 500, 'store 6 starts at ' + SIM5.start[5] + ' ns');

  /* GATE 2006 */
  var perIter = 24 * 2;
  chk('2006: 24 banks of 2 bytes deliver 48 bytes per round', perIter === 48, 'bytes per round ' + perIter);
  chk('2006: a 64-byte block needs 2 rounds', Math.ceil(64 / 48) === 2, 'rounds ' + Math.ceil(64 / 48));
  chk('2006: 96 bytes travel to deliver 64', 2 * 48 === 96, 'moved ' + (2 * 48));
  chk('2006: 2 x (12 + 80) = 184 ns', 2 * (12 + 80) === 184, 'total ' + (2 * (12 + 80)));
  chk('2006: the alternative reading 12 + 2 x 80 gives 172 ns', 12 + 2 * 80 === 172, 'total ' + (12 + 2 * 80));

  /* refresh */
  chk('refresh: 2^13 rows at 60 ns in 4 ms leaves 87.7 per cent for access',
      approx((1 - refreshOverhead(8192, 60, 4e6)) * 100, 87.712, 0.01),
      'overhead ' + (refreshOverhead(8192, 60, 4e6) * 100).toFixed(3) + ' per cent');
}

/* ======================================================================
   LAYER 3 - DRAWING HELPERS
   ====================================================================== */

function bg(P) {
  P.rect(0, 0, W, H, { fill: '#ffffff' });
  P.rect(0, 0, W, 52, { fill: PAL.surface2 });
  P.line(0, 52, W, 52, { stroke: PAL.border });
}
function head(P, kicker, title) {
  P.text(24, 12, kicker.toUpperCase(), { size: 10, mono: true, color: PAL.accent });
  P.text(24, 26, title, { size: 16, bold: true, color: PAL.ink });
}
function note(P, x, y, s, colour, size) {
  P.text(x, y, s, { size: size || 10, color: colour || PAL.dim });
}
function mono(P, x, y, s, colour, size, align) {
  P.text(x, y, s, { size: size || 11, mono: true, color: colour || PAL.ink, align: align || 'left' });
}
function rule(P, x, y, w) { P.line(x, y, x + w, y, { stroke: PAL.border, sw: 1 }); }

/* a small reveal helper: 0 before the start, 1 after the end */
function rev(t, start, dur) {
  if (t <= start) return 0;
  if (t >= start + dur) return 1;
  return (t - start) / dur;
}
function ease(v) { return v * v * (3 - 2 * v); }

function box(P, x, y, w, h, o) {
  o = o || {};
  P.rect(x, y, w, h, { fill: o.fill || PAL.surface, stroke: o.stroke || PAL.border, sw: o.sw || 1.4, radius: o.radius === undefined ? 4 : o.radius, dash: o.dash });
}
function labelIn(P, x, y, w, h, line1, line2, o) {
  o = o || {};
  P.text(x + w / 2, y + (line2 ? h / 2 - 7 : h / 2), line1,
         { size: o.size || 11, mono: o.mono !== false, color: o.color || PAL.ink, align: 'center', base: 'middle', bold: o.bold });
  if (line2) {
    P.text(x + w / 2, y + h / 2 + 7, line2,
           { size: o.size2 || 9, color: o.color2 || PAL.dim, align: 'center', base: 'middle' });
  }
}

/* ======================================================================
   LAYER 4 - THE SCENES
   Each scene reads from the validated model and draws it. Nothing here
   re-derives a number that Layer 1 already checked.
   ====================================================================== */

var SCENES = {};

/* ---------- scene 1: chips ---------- */
SCENES.chips = function (P, t) {
  head(P, 'scene 1 - the rectangle', 'One chip is a rectangle; the memory is a bigger one');

  /* the single chip */
  var a = ease(rev(t, 0.2, 1.2));
  P.alpha(a);
  box(P, 40, 92, 168, 132, { stroke: PAL.accent, sw: 1.8, fill: PAL.accentDim, radius: 6 });
  labelIn(P, 40, 92, 168, 132, '1K x 8', '1024 words, each 8 bits', { size: 17, bold: true, color: PAL.ink, size2: 10 });
  note(P, 40, 240, 'one chip = W words x b bits', PAL.dim, 10);
  P.alpha(1);

  /* the two divisions */
  var b = ease(rev(t, 3.0, 1.4));
  P.alpha(b);
  mono(P, 40, 272, 'across  =  B / b  =  16 / 8  =  ' + CASE13.across, PAL.info, 12);
  mono(P, 40, 296, 'rows    =  N / W  =  16384 / 1024  =  ' + CASE13.rows, PAL.info, 12);
  mono(P, 40, 320, 'chips   =  across x rows  =  ' + CASE13.chips, PAL.accent, 12);
  P.alpha(1);

  /* the array, built row by row */
  var x0 = 470, y0 = 84, cw = 76, chh = 15, gapy = 2.2, gapx = 4;
  var show = rev(t, 1.4, 6.0);
  var rowsShown = Math.max(1, Math.round(show * CASE13.rows));
  for (var r = 0; r < rowsShown; r++) {
    for (var c = 0; c < CASE13.across; c++) {
      var xx = x0 + c * (cw + gapx), yy = y0 + r * (chh + gapy);
      box(P, xx, yy, cw, chh, {
        fill: r === rowsShown - 1 ? PAL.accentDim : PAL.surface2,
        stroke: r === rowsShown - 1 ? PAL.accent : PAL.border,
        radius: 2
      });
    }
  }
  note(P, x0, 72, '16 rows, 2 chips wide', PAL.dim, 10);
  mono(P, x0 + 2 * (cw + gapx) + 14, 100, 'row 0', PAL.faint, 9);
  mono(P, x0 + 2 * (cw + gapx) + 14, 84 + 15 * (chh + gapy) + 8, 'row 15', PAL.faint, 9);

  /* the takeaway line */
  var c2 = ease(rev(t, 8.0, 1.5));
  P.alpha(c2);
  P.rect(24, 392, 852, 56, { fill: PAL.surface2, stroke: PAL.border, radius: 5 });
  P.text(40, 406, 'Width and depth are independent divisions.', { size: 12, bold: true, color: PAL.ink });
  P.text(40, 424, 'Two chips side by side make one 16-bit word; sixteen such rows make 16K words. Neither number is the other.', { size: 10, color: PAL.dim });
  P.alpha(1);
};

/* ---------- scene 2: the bit budget ---------- */
SCENES.bits = function (P, t) {
  head(P, 'scene 2 - the address split', 'Fourteen bits in, four to the decoder, ten to every chip');

  var x0 = 60, y0 = 92, cw = 26, chh = 34;
  var n = CASE13.addrBits;

  /* the bit cells */
  for (var i = 0; i < n; i++) {
    var a = ease(rev(t, 0.2 + i * 0.12, 0.5));
    P.alpha(a);
    var isSel = i < CASE13.selectBits;
    box(P, x0 + i * cw, y0, cw - 2, chh, {
      fill: isSel ? PAL.warnDim : PAL.accentDim,
      stroke: isSel ? PAL.warn : PAL.accent,
      radius: 3
    });
    P.text(x0 + i * cw + (cw - 2) / 2, y0 + chh / 2, String(n - 1 - i),
           { size: 10, mono: true, align: 'center', base: 'middle', color: PAL.ink });
    P.alpha(1);
  }

  var b = ease(rev(t, 2.2, 1.0));
  P.alpha(b);
  mono(P, x0, 78, 'A13-A10 to decoder', PAL.warn, 10);
  mono(P, x0 + CASE13.selectBits * cw + 20, 78, 'A9-A0 to every chip', PAL.accent, 10);
  P.alpha(1);

  /* the decoder */
  var c = ease(rev(t, 3.4, 1.2));
  P.alpha(c);
  box(P, x0, 176, 104, 66, { stroke: PAL.warn, fill: PAL.warnDim, radius: 5 });
  labelIn(P, x0, 176, 104, 66, '4 -> 16', 'row decoder', { size: 14, bold: true, color: PAL.ink, size2: 9 });
  P.arrow(x0 + 26, 132, x0 + 40, 172, { stroke: PAL.warn, sw: 1.4 });
  P.alpha(1);

  /* the check lines */
  var d = ease(rev(t, 4.6, 1.2));
  P.alpha(d);
  mono(P, 250, 190, 'total address bits   = log2(16384) = ' + CASE13.addrBits, PAL.ink, 11);
  mono(P, 250, 214, 'bits each chip takes = log2(1024)  = ' + CASE13.chipAddrBits, PAL.ink, 11);
  mono(P, 250, 238, 'select bits left     = ' + CASE13.addrBits + ' - ' + CASE13.chipAddrBits + '   = ' + CASE13.selectBits, PAL.warn, 11);
  P.alpha(1);

  var e = ease(rev(t, 6.2, 1.2));
  P.alpha(e);
  P.rect(250, 262, 610, 64, { fill: PAL.validDim, stroke: PAL.valid, radius: 5 });
  P.text(266, 278, 'Check one: 10 + 4 = 14, the whole address is accounted for.', { size: 11, color: PAL.ink });
  P.text(266, 300, 'Check two: 2 to the 4 is 16, and there are exactly 16 rows. The decoder reaches every one.', { size: 11, color: PAL.ink });
  P.alpha(1);

  var f = ease(rev(t, 7.4, 1.2));
  P.alpha(f);
  note(P, 250, 348, 'The split is forced by the hardware: a 1K x 8 chip has ten address pins and no more.', PAL.dim, 10);
  P.alpha(1);
};

/* ---------- scene 3: wiring ---------- */
SCENES.wiring = function (P, t) {
  head(P, 'scene 3 - wiring', 'Bits 4 and 3 pick the block; the rest reach every block');

  var bx = [70, 260, 450, 640], bw = 168, by = 84, bh = 62;

  for (var i = 0; i < 4; i++) {
    var a = ease(rev(t, 0.2 + i * 0.5, 0.7));
    P.alpha(a);
    box(P, bx[i], by, bw, bh, { stroke: PAL.border, fill: PAL.surface2, radius: 5 });
    labelIn(P, bx[i], by, bw, bh, 'block X' + (i + 1), '1 KB, Addr[9:0]', { size: 12, bold: true, size2: 9 });
    P.text(bx[i] + bw - 8, by + bh + 12, 'CS', { size: 9, mono: true, align: 'right', color: PAL.warn });
    P.alpha(1);
  }

  /* the decoder */
  var b = ease(rev(t, 2.4, 1.0));
  P.alpha(b);
  box(P, 370, 186, 128, 54, { stroke: PAL.warn, fill: PAL.warnDim, radius: 5 });
  labelIn(P, 370, 186, 128, 54, '2 -> 4', 'A1 = IA4, A0 = IA3', { size: 13, bold: true, size2: 9 });
  for (var j = 0; j < 4; j++) {
    P.line(bx[j] + bw - 30, by + bh + 4, bx[j] + bw - 30, 186, { stroke: PAL.warn, sw: 1.1, dash: [3, 3] });
  }
  P.alpha(1);

  /* the byte strip: 32 bytes, 8 per block, repeating */
  var c = ease(rev(t, 4.0, 1.6));
  P.alpha(c);
  note(P, 70, 262, 'the first 32 bytes of the 4 KB space, one cell per byte', PAL.dim, 10);
  var sx = 70, sy = 272, scw = 22;
  var cols = [PAL.accentDim, PAL.warnDim, PAL.validDim, PAL.surface2];
  var edges = [PAL.accent, PAL.warn, PAL.valid, PAL.border];
  for (var k = 0; k < 32; k++) {
    var owner = Math.floor((k % 32) / 8);
    var on = k < Math.round(c * 32);
    box(P, sx + k * scw, sy, scw - 1.5, 30, {
      fill: on ? cols[owner] : '#ffffff',
      stroke: on ? edges[owner] : PAL.border,
      radius: 2
    });
    if (on && k % 8 === 0) {
      P.text(sx + k * scw + (scw - 1.5) / 2 + 7, sy + 15, 'X' + (owner + 1),
             { size: 8, mono: true, align: 'center', base: 'middle', color: PAL.ink });
    }
  }
  for (var q = 0; q < 8; q++) {
    mono(P, sx + q * 4 * scw + 2, sy + 42, String(q * 4), PAL.faint, 9);
  }
  P.alpha(1);

  var d = ease(rev(t, 5.8, 1.4));
  P.alpha(d);
  P.rect(70, 330, 800, 58, { fill: PAL.surface2, stroke: PAL.border, radius: 5 });
  P.text(86, 346, 'Starting addresses 0, 8, 16, 24  -  and each block returns every 32 bytes.', { size: 12, bold: true, color: PAL.ink });
  P.text(86, 366, 'The blocks are 1 KB each, but no block is a contiguous 1 KB. The wiring is a four-way interleave at eight-byte granularity.', { size: 10, color: PAL.dim });
  P.alpha(1);

  var e = ease(rev(t, 7.2, 1.2));
  P.alpha(e);
  note(P, 70, 406, 'Nothing forces the decoder onto the top bits. Reading "four 1 KB blocks" as four contiguous regions is the trap this question sets.', PAL.warn, 10);
  P.alpha(1);
};

/* ---------- scene 4: chip select ---------- */
SCENES.cs = function (P, t) {
  head(P, 'scene 4 - chip select', 'Five fixed bits, eleven free, one window of 2048 bytes');

  var bits = 16, cw = 34, x0 = 66, y0 = 88;
  var cond = {};
  COND19.forEach(function (c) { cond[c.bit] = c.val; });

  for (var i = 0; i < bits; i++) {
    var b = bits - 1 - i;
    var a = ease(rev(t, 0.2 + i * 0.1, 0.4));
    P.alpha(a);
    var fixed = cond[b] !== undefined;
    box(P, x0 + i * cw, y0, cw - 3, 38, {
      fill: fixed ? (cond[b] ? PAL.accentDim : PAL.invalidDim) : '#ffffff',
      stroke: fixed ? (cond[b] ? PAL.accent : PAL.invalid) : PAL.border,
      radius: 3,
      dash: fixed ? null : [3, 3]
    });
    P.text(x0 + i * cw + (cw - 3) / 2, y0 + 12, 'A' + b,
           { size: 9, mono: true, align: 'center', base: 'middle', color: PAL.dim });
    P.text(x0 + i * cw + (cw - 3) / 2, y0 + 27, fixed ? String(cond[b]) : '-',
           { size: 12, mono: true, bold: true, align: 'center', base: 'middle', color: fixed ? (cond[b] ? PAL.accent : PAL.invalid) : PAL.faint });
    P.alpha(1);
  }
  var c = ease(rev(t, 2.2, 1.0));
  P.alpha(c);
  note(P, x0, 74, 'green: must be 1     red: must be 0     dashed: free', PAL.dim, 10);
  P.alpha(1);

  var d = ease(rev(t, 3.2, 1.2));
  P.alpha(d);
  mono(P, 66, 158, 'free bits  = 16 - 5 = ' + RANGE19.freeBits, PAL.ink, 12);
  mono(P, 66, 180, 'range size = 2 ^ 11 = ' + RANGE19.size + ' bytes', PAL.accent, 12);
  mono(P, 380, 158, 'lowest  = 1100 1000 0000 0000 = ' + RANGE19.lo.toString(16).toUpperCase(), PAL.ink, 12);
  mono(P, 380, 180, 'highest = 1100 1111 1111 1111 = ' + RANGE19.hi.toString(16).toUpperCase(), PAL.ink, 12);
  P.alpha(1);

  /* the number line */
  var e = ease(rev(t, 5.0, 1.6));
  P.alpha(e);
  var lx = 66, lw = 768, ly = 246;
  P.rect(lx, ly, lw, 26, { fill: PAL.surface2, stroke: PAL.border, radius: 3 });
  var u0 = RANGE19.lo / 65536, u1 = (RANGE19.hi + 1) / 65536;
  P.rect(lx + u0 * lw, ly, (u1 - u0) * lw, 26, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.6, radius: 3 });
  mono(P, lx + u0 * lw + (u1 - u0) * lw / 2, ly + 13, 'C800 - CFFF',
        PAL.ink, 10, 'center');
  mono(P, lx, ly + 40, '0000', PAL.faint, 9);
  mono(P, lx + lw, ly + 40, 'FFFF', PAL.faint, 9, 'right');
  note(P, lx, ly + 58, 'the whole 64 KB address space, with the enabled window drawn to scale', PAL.dim, 10);
  P.alpha(1);

  var f = ease(rev(t, 6.8, 1.4));
  P.alpha(f);
  P.rect(66, 340, 800, 60, { fill: PAL.warnDim, stroke: PAL.warn, radius: 5 });
  P.text(82, 356, 'The window is 2048 bytes because eleven bits are free - not because of any chip.', { size: 12, bold: true, color: PAL.ink });
  P.text(82, 376, 'If the chip behind it were 256 bytes, the same data would answer at eight different addresses. That is address aliasing.', { size: 10, color: PAL.dim });
  P.alpha(1);
};

/* ---------- scene 5: decoder arithmetic ---------- */
SCENES.decoder = function (P, t) {
  head(P, 'scene 5 - decoder arithmetic', 'One 2-to-4 enables four more: five parts, sixteen outputs');

  var a = ease(rev(t, 0.2, 1.0));
  P.alpha(a);
  box(P, 400, 80, 110, 46, { stroke: PAL.warn, fill: PAL.warnDim, radius: 5 });
  labelIn(P, 400, 80, 110, 46, '2 -> 4', 'top 2 bits', { size: 13, bold: true, size2: 9 });
  P.alpha(1);

  for (var i = 0; i < 4; i++) {
    var b = ease(rev(t, 1.2 + i * 0.45, 0.7));
    P.alpha(b);
    var x = 80 + i * 200, y = 178;
    box(P, x, y, 150, 50, { stroke: PAL.accent, fill: PAL.accentDim, radius: 5 });
    labelIn(P, x, y, 150, 50, '2 -> 4', 'enabled by Q' + i, { size: 12, bold: true, size2: 9 });
    P.line(455, 126, x + 75, 174, { stroke: PAL.border, sw: 1.2, dash: [3, 3] });
    P.alpha(1);

    /* four outputs per second-level decoder */
    for (var j = 0; j < 4; j++) {
      var c = ease(rev(t, 3.2 + i * 0.3 + j * 0.08, 0.4));
      P.alpha(c);
      var ox = x + 12 + j * 34;
      P.line(ox, y + 50, ox, y + 74, { stroke: PAL.accent, sw: 1.1 });
      P.circle(ox, y + 78, 3.2, { fill: PAL.accent });
      P.text(ox, y + 92, String(i * 4 + j), { size: 8, mono: true, align: 'center', color: PAL.faint });
      P.alpha(1);
    }
  }

  var d = ease(rev(t, 5.4, 1.2));
  P.alpha(d);
  P.rect(80, 306, 620, 44, { fill: PAL.validDim, stroke: PAL.valid, radius: 5 });
  mono(P, 96, 320, 'count = 1 (root)  +  4 (one per enable)  =  5 two-to-four decoders', PAL.ink, 12);
  mono(P, 96, 338, 'outputs = 4 x 4 = 16        input bits used = 2 + 2 = 4', PAL.dim, 10);
  P.alpha(1);

  var e = ease(rev(t, 6.8, 1.4));
  P.alpha(e);
  P.rect(80, 366, 800, 62, { fill: PAL.warnDim, stroke: PAL.warn, radius: 5 });
  P.text(96, 382, 'Two traps: answering 4 (the leaf decoders only), and counting 32 chips instead of 16 rows.', { size: 11, bold: true, color: PAL.ink });
  P.text(96, 402, 'A 4-to-16 row decoder needs 16 outputs; the array has 16 rows. The 32 chips are 16 rows of 2, and the width never enters the decoder.', { size: 10, color: PAL.dim });
  P.alpha(1);
};

/* ---------- scene 6: interleaving ---------- */
SCENES.interleave = function (P, t) {
  head(P, 'scene 6 - interleaving', 'Low-order spreads consecutive words; high-order keeps them together');

  var cw = 74, chh = 34, top = 108;
  var grids = [{ x: 92, order: 'low', cap: 'low-order:  bank = address mod 4' },
               { x: 512, order: 'high', cap: 'high-order:  bank = the top two bits' }];

  var showN = Math.round(ease(rev(t, 0.4, 5.4)) * 16);

  grids.forEach(function (g) {
    for (var b = 0; b < 4; b++) {
      var y = top + b * (chh + 8);
      box(P, g.x - 42, y, 36, chh, { fill: PAL.surface2, stroke: PAL.border, radius: 3 });
      P.text(g.x - 24, y + chh / 2, 'B' + b, { size: 10, mono: true, align: 'center', base: 'middle', color: PAL.dim });
      for (var w = 0; w < 4; w++) {
        box(P, g.x + w * (cw + 6), y, cw, chh, { fill: '#ffffff', stroke: PAL.border, radius: 3 });
      }
    }
  });

  /* place addresses in order */
  for (var addr = 0; addr < showN; addr++) {
    grids.forEach(function (g) {
      var p = bankOf(addr, 4, 4, g.order);
      var x = g.x + p.word * (cw + 6);
      var y = top + p.bank * (chh + 8);
      var fresh = (addr === showN - 1);
      box(P, x, y, cw, chh, {
        fill: fresh ? PAL.accent : PAL.accentDim,
        stroke: fresh ? PAL.accent : PAL.border,
        radius: 3, sw: fresh ? 2 : 1.2
      });
      P.text(x + cw / 2, y + chh / 2, String(addr),
             { size: 11, mono: true, align: 'center', base: 'middle', color: fresh ? '#ffffff' : PAL.ink });
    });
  }

  var a = ease(rev(t, 1.0, 1.0));
  P.alpha(a);
  mono(P, 92, 78, 'four banks, sixteen words', PAL.dim, 10);
  P.alpha(1);

  var b = ease(rev(t, 3.0, 1.0));
  P.alpha(b);
  mono(P, 92, 288, grids[0].cap, PAL.accent, 11);
  mono(P, 512, 288, grids[1].cap, PAL.info, 11);
  P.alpha(1);

  var c = ease(rev(t, 5.6, 1.2));
  P.alpha(c);
  P.rect(92, 314, 800, 62, { fill: PAL.validDim, stroke: PAL.valid, radius: 5 });
  P.text(108, 330, 'Under low-order, addresses 0 1 2 3 fill four different banks - a sequential scan becomes four parallel cycles.', { size: 11, bold: true, color: PAL.ink });
  P.text(108, 350, 'Under high-order, addresses 0 1 2 3 all wait on bank 0. The second bank is not idle for lack of work; the work is not there.', { size: 10, color: PAL.dim });
  P.alpha(1);

  var d = ease(rev(t, 7.0, 1.2));
  P.alpha(d);
  note(P, 92, 396, 'Both maps are bijections onto the same sixteen cells. The difference is only which address goes where.', PAL.dim, 10);
  P.alpha(1);
};

/* ---------- scene 7: the overlap condition ---------- */
function gantt(P, x0, y0, sim, m, tc, tbus, title, scale, colour, noteText) {
  var rows = m, rh = 20, gap = 4, wmax = 8;
  P.text(x0, y0 - 14, title, { size: 11, bold: true, color: PAL.ink });
  for (var b = 0; b < rows; b++) {
    var y = y0 + b * (rh + gap);
    P.rect(x0, y, 30, rh, { fill: PAL.surface2, stroke: PAL.border, radius: 2 });
    P.text(x0 + 15, y + rh / 2, 'B' + b, { size: 9, mono: true, align: 'center', base: 'middle', color: PAL.dim });
  }
  for (var i = 0; i < wmax; i++) {
    var b2 = i % m;
    var y2 = y0 + b2 * (rh + gap);
    var sx = x0 + 34 + sim.start[i] * scale;
    var ww = tc * scale;
    P.rect(sx, y2, ww, rh, { fill: colour, stroke: colour === PAL.warnDim ? PAL.warn : PAL.accent, radius: 2, sw: 1.1 });
    P.text(sx + ww / 2, y2 + rh / 2, String(i), { size: 9, mono: true, align: 'center', base: 'middle', color: PAL.ink });
  }
  /* the stall marker */
  var endY = y0 + rows * (rh + gap) + 2;
  P.line(x0 + 34, endY, x0 + 34 + sim.total * scale, endY, { stroke: PAL.border });
  P.text(x0 + 34 + sim.total * scale, endY + 4, 'last word done at ' + sim.total + ' ns',
         { size: 9, mono: true, color: colour === PAL.warnDim ? PAL.warn : PAL.accent });
  if (noteText) P.text(x0, endY + 18, noteText, { size: 9, color: PAL.dim });
}

SCENES.overlap = function (P, t) {
  head(P, 'scene 7 - the overlap condition', 'Eight words, 40 ns banks, 10 ns bus: four banks finish in 110, two in 170');

  var scale = 3.6;
  var a = ease(rev(t, 0.4, 1.0));
  P.alpha(a);
  gantt(P, 60, 96, SIM4, 4, 40, 10, 'four banks:  4 x 10 = 40 >= 40, the condition holds',
        scale, PAL.accentDim, 'each bank is free again exactly when the bus returns to it');
  P.alpha(1);

  var b = ease(rev(t, 3.4, 1.0));
  P.alpha(b);
  gantt(P, 60, 246, SIM2, 2, 40, 10, 'two banks:  2 x 10 = 20 < 40, the condition fails',
        scale, PAL.warnDim, 'the bus arrives at a bank that is still busy, so every word after the second waits');
  P.alpha(1);

  var c = ease(rev(t, 6.2, 1.4));
  P.alpha(c);
  P.rect(560, 96, 316, 148, { fill: PAL.surface2, stroke: PAL.border, radius: 5 });
  mono(P, 576, 114, 'formula:  t_c + (n-1) t_bus', PAL.ink, 11);
  mono(P, 576, 134, '       = 40 + 7 x 10 = ' + formulaTime(8, 4, 40, 10) + ' ns', PAL.dim, 10);
  mono(P, 576, 162, 'simulated, 4 banks = ' + SIM4.total + ' ns', PAL.valid, 11);
  mono(P, 576, 182, 'simulated, 2 banks = ' + SIM2.total + ' ns', PAL.invalid, 11);
  P.text(576, 208, 'the formula is a licensed shortcut:', { size: 9, color: PAL.dim });
  P.text(576, 222, 'state the licence before using it', { size: 9, color: PAL.warn });
  P.alpha(1);

  var d = ease(rev(t, 7.8, 1.2));
  P.alpha(d);
  note(P, 60, 430, 'Two banks are not slower per bank. They are simply too few to cover one bank cycle with bus cycles.', PAL.dim, 10);
  P.alpha(1);
};

/* ---------- scene 8: bandwidth ---------- */
SCENES.bandwidth = function (P, t) {
  head(P, 'scene 8 - bandwidth', 'Bandwidth rises with banks until the bus is the bottleneck');

  var base = 372, top = 130, bwMax = 0.4;
  var a = ease(rev(t, 0.3, 1.0));
  P.alpha(a);
  P.line(76, base, 76, top - 10, { stroke: PAL.border });
  P.line(76, base, 470, base, { stroke: PAL.border });
  P.text(76, top - 22, 'bytes per ns', { size: 9, color: PAL.dim });
  P.alpha(1);

  for (var m = 1; m <= 8; m++) {
    var v = bandwidth(m, 40, 10, 4);
    var h = (v / bwMax) * (base - top);
    var x = 92 + (m - 1) * 46;
    var g = ease(rev(t, 0.6 + m * 0.28, 0.6));
    P.alpha(g);
    P.rect(x, base - h * g, 32, h * g, {
      fill: m <= 4 ? PAL.accentDim : PAL.surface2,
      stroke: m <= 4 ? PAL.accent : PAL.border,
      radius: 2
    });
    P.text(x + 16, base + 8, String(m), { size: 10, mono: true, align: 'center', color: PAL.dim });
    if (g > 0.9) {
      P.text(x + 16, base - h - 6, v.toFixed(2), { size: 8, mono: true, align: 'center', color: PAL.faint });
    }
    P.alpha(1);
  }
  var b = ease(rev(t, 3.2, 1.0));
  P.alpha(b);
  P.text(250, base + 26, 'number of banks', { size: 9, color: PAL.dim });
  P.line(92 + 3 * 46 + 34, top - 6, 92 + 3 * 46 + 34, base, { stroke: PAL.warn, sw: 1.2, dash: [4, 4] });
  P.text(92 + 3 * 46 + 42, 110, 'the knee: 4 x 10 = 40', { size: 9, color: PAL.warn });
  P.alpha(1);

  var c = ease(rev(t, 4.4, 1.2));
  P.alpha(c);
  mono(P, 76, 96, 'interval = max(t_bus, t_c / m)     bandwidth = word width / interval', PAL.ink, 11);
  P.alpha(1);

  var d = ease(rev(t, 5.4, 1.4));
  P.alpha(d);
  P.rect(510, 130, 366, 118, { fill: PAL.surface2, stroke: PAL.border, radius: 5 });
  P.text(526, 146, 'GATE 2014 Set 2, the same model', { size: 11, bold: true, color: PAL.ink });
  mono(P, 526, 168, '8 modules x 100 ns = 800 >= 600', PAL.valid, 10);
  mono(P, 526, 188, 'so the bus never waits: 1 ms / 100 ns', PAL.dim, 10);
  mono(P, 526, 208, '= ' + (1e6 / 100) + ' stores initiated', PAL.accent, 11);
  mono(P, 526, 230, 'with 5 modules: ' + (Math.floor(1e6 / 600) * 5) + ' instead', PAL.invalid, 10);
  P.alpha(1);

  var e = ease(rev(t, 7.0, 1.4));
  P.alpha(e);
  P.rect(76, 400, 800, 46, { fill: PAL.warnDim, stroke: PAL.warn, radius: 5 });
  P.text(92, 414, 'Initiated is not completed, and past the knee more banks buy nothing.', { size: 11, bold: true, color: PAL.ink });
  P.text(92, 432, 'The first store completes at 600 ns; the last initiated one has not finished when the millisecond ends.', { size: 10, color: PAL.dim });
  P.alpha(1);
};

/* ---------- scene 9: the 2006 block fetch ---------- */
SCENES.gate2006 = function (P, t) {
  head(P, 'scene 9 - a real block fetch', '24 banks of 2 bytes: 48 bytes a round, two rounds, 184 ns');

  var a = ease(rev(t, 0.3, 1.4));
  P.alpha(a);
  for (var i = 0; i < 24; i++) {
    var x = 60 + i * 26;
    box(P, x, 86, 22, 34, { fill: PAL.accentDim, stroke: PAL.accent, radius: 2 });
    P.text(x + 11, 103, String(i), { size: 7, mono: true, align: 'center', base: 'middle', color: PAL.dim });
  }
  mono(P, 60, 74, '24 banks, each 2 bytes wide', PAL.dim, 10);
  mono(P, 60, 136, 'one parallel round = 24 x 2 = ' + (24 * 2) + ' bytes', PAL.ink, 11);
  P.alpha(1);

  /* the block: 64 cells */
  var b = ease(rev(t, 1.8, 1.6));
  P.alpha(b);
  mono(P, 60, 168, 'the 64-byte cache block, one cell per byte', PAL.dim, 10);
  var shown = Math.round(b * 64);
  for (var k = 0; k < 64; k++) {
    var cx = 60 + k * 12.4;
    var round1 = k < 48;
    var on = k < shown;
    box(P, cx, 178, 11.4, 26, {
      fill: !on ? '#ffffff' : (round1 ? PAL.accentDim : PAL.warnDim),
      stroke: !on ? PAL.border : (round1 ? PAL.accent : PAL.warn),
      radius: 1.5
    });
  }
  P.alpha(1);

  var c = ease(rev(t, 3.4, 1.0));
  P.alpha(c);
  mono(P, 60, 222, 'round 1 delivers bytes 0-47', PAL.accent, 10);
  mono(P, 660, 222, 'round 2 delivers 48-95', PAL.warn, 10);
  note(P, 60, 240, 'only bytes 0-63 are wanted; the other 32 are transferred and thrown away', PAL.dim, 10);
  P.alpha(1);

  /* the timing bars */
  var d = ease(rev(t, 4.6, 1.4));
  P.alpha(d);
  var ty = 278, s = 4.0;
  P.rect(120, ty, 12 * s, 34, { fill: PAL.surface2, stroke: PAL.border, radius: 2 });
  P.text(126, ty + 17, 'dec', { size: 8, mono: true, base: 'middle', color: PAL.dim });
  P.rect(120 + 12 * s, ty, 80 * s, 34, { fill: PAL.accentDim, stroke: PAL.accent, radius: 2 });
  P.text(120 + 12 * s + 40 * s, ty + 17, 'bank access 80 ns', { size: 10, mono: true, align: 'center', base: 'middle', color: PAL.ink });
  P.text(120, ty - 8, 'round 1: 12 + 80 = 92 ns', { size: 10, bold: true, color: PAL.ink });

  var ty2 = 340;
  P.rect(120, ty2, 12 * s, 34, { fill: PAL.surface2, stroke: PAL.border, radius: 2 });
  P.text(126, ty2 + 17, 'dec', { size: 8, mono: true, base: 'middle', color: PAL.dim });
  P.rect(120 + 12 * s, ty2, 80 * s, 34, { fill: PAL.warnDim, stroke: PAL.warn, radius: 2 });
  P.text(120 + 12 * s + 40 * s, ty2 + 17, 'bank access 80 ns', { size: 10, mono: true, align: 'center', base: 'middle', color: PAL.ink });
  P.text(120, ty2 - 8, 'round 2: 12 + 80 = 92 ns', { size: 10, bold: true, color: PAL.ink });
  P.alpha(1);

  var e = ease(rev(t, 6.2, 1.4));
  P.alpha(e);
  P.rect(600, 278, 274, 96, { fill: PAL.surface2, stroke: PAL.border, radius: 5 });
  mono(P, 616, 296, '92 + 92 = ' + (2 * 92) + ' ns', PAL.accent, 14);
  P.text(616, 320, 'the answer most keys give', { size: 9, color: PAL.dim });
  mono(P, 616, 344, '12 + 2 x 80 = ' + (12 + 2 * 80) + ' ns', PAL.invalid, 11);
  P.text(616, 362, 'published dissent: overlapped decode', { size: 9, color: PAL.dim });
  P.alpha(1);

  var f = ease(rev(t, 7.6, 1.2));
  P.alpha(f);
  note(P, 60, 420, 'The question says each iteration requires decoding, so the two 92s stand. Both readings are in the sources; the lesson names them.', PAL.dim, 10);
  P.alpha(1);
};

/* ---------- scene 10: recipe ---------- */
SCENES.recipe = function (P, t) {
  head(P, 'scene 10 - the recipe', 'Four steps, five traps, no memorised formulas');

  var steps = [
    ['1', 'Divide twice', 'across = B/b, rows = N/W, chips = the product'],
    ['2', 'Spend the address', 'log words total, log chip words, the rest to the decoder'],
    ['3', 'Schedule the banks', 'bank = i mod m, then check m x t_bus >= t_c'],
    ['4', 'Convert once', 'one unit change, at the end, never twice']
  ];
  for (var i = 0; i < steps.length; i++) {
    var a = ease(rev(t, 0.3 + i * 0.9, 0.7));
    P.alpha(a);
    var y = 84 + i * 62;
    P.circle(48, y + 20, 15, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.5 });
    P.text(48, y + 20, steps[i][0], { size: 13, mono: true, bold: true, align: 'center', base: 'middle', color: PAL.accent });
    P.text(76, y + 12, steps[i][1], { size: 12, bold: true, color: PAL.ink });
    P.text(76, y + 30, steps[i][2], { size: 10, color: PAL.dim });
    P.alpha(1);
  }

  var b = ease(rev(t, 4.2, 1.2));
  P.alpha(b);
  mono(P, 430, 84, 'the five traps', PAL.warn, 11);
  var traps = ['bits read as bytes', 'one division for both axes', 'chips counted where rows are asked',
               'range size taken from the chip', 'the formula used without its condition'];
  for (var j = 0; j < traps.length; j++) {
    var c = ease(rev(t, 4.6 + j * 0.42, 0.5));
    P.alpha(c);
    var ty = 108 + j * 32;
    P.rect(430, ty, 442, 26, { fill: PAL.warnDim, stroke: PAL.warn, radius: 3 });
    P.text(442, ty + 13, (j + 1) + '.  ' + traps[j], { size: 10, color: PAL.ink, base: 'middle' });
    P.alpha(1);
  }
  P.alpha(1);

  var d = ease(rev(t, 7.2, 1.2));
  P.alpha(d);
  P.rect(24, 386, 852, 60, { fill: PAL.validDim, stroke: PAL.valid, radius: 5 });
  P.text(40, 402, 'Interfacing is arithmetic on rectangles; interleaving is arithmetic on a schedule.', { size: 12, bold: true, color: PAL.ink });
  P.text(40, 422, 'Both are decided before a single gate is drawn, and both are checked by counting, not by looking at the picture.', { size: 10, color: PAL.dim });
  P.alpha(1);
};

/* ======================================================================
   LAYER 5 - FRAME
   ====================================================================== */

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

  K.onResize(function () { if (P) drawFrame(P); });

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
