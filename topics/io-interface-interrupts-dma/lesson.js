(function () {
  'use strict';

  var W = 900, H = 470;
  var K = window.LessonKit;
  var PR = window.Painters;
  var PAL = PR.PAL;
  var P = null;

/* ======================================================================
   LAYER 1 - THE MODEL (io-interface-interrupts-dma)
   Pure data and pure functions. No drawing here. Nothing in this section
   knows what a canvas is. Every number the lesson quotes is computed.
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) { CHECKS.push({ name: name, pass: !!pass, detail: detail || '' }); }

function near(a, b, eps) { eps = eps === undefined ? 1e-6 : eps; return Math.abs(a - b) <= eps; }

/* ---------------- 1. address budget ---------------- */
function addrSpace(bits) { return Math.pow(2, bits); }

function mmioBudget(addrBits, portCount) {
  var total = addrSpace(addrBits);
  return { total: total, ports: portCount, memory: total - portCount };
}

/* ---------------- 2. polling against interrupt ---------------- */
/* one poll every pollPeriodS seconds, costing pollCostS each; eventRate events
   per second, each costing processS to handle once the device is ready. */
function pollingCost(pollPeriodS, pollCostS, eventRate, processS) {
  var polls = 1 / pollPeriodS;
  return { polls: polls, pollCost: polls * pollCostS, procCost: eventRate * processS,
           total: polls * pollCostS + eventRate * processS };
}

function interruptCost(eventRate, serviceS) { return eventRate * serviceS; }

/* fraction of CPU time an interrupt costs: cost per event over interval between events */
function interruptFraction(costS, intervalS) { return costS / intervalS; }
/* the formula is licensed only while the cost fits inside the interval */
function fractionLicensed(costS, intervalS) { return costS < intervalS; }

/* speedup of interrupt over programmed I/O, per byte */
function interruptGain(bytesPerSec, interruptOverheadS) {
  return (1 / bytesPerSec) / interruptOverheadS;
}

/* ---------------- 3. cycle stealing ---------------- */
function stealRate(clockHz, stolenFraction, bitsPerSteal) {
  return clockHz * stolenFraction * bitsPerSteal;
}

/* a disk: sectors per track, bytes per sector, revolutions per minute */
function diskRate(sectorsPerTrack, bytesPerSector, rpm) {
  return sectorsPerTrack * bytesPerSector * (rpm / 60);
}

/* fraction of memory cycles the controller takes when it steals one cycle per
   word, and words arrive every wordPeriodS */
function stealFraction(memCycleS, wordPeriodS) { return memCycleS / wordPeriodS; }
/* the whole-cycle reading: how many memory cycles one word's interval contains */
function stealWholeCycles(memCycleS, wordPeriodS) { return Math.ceil(wordPeriodS / memCycleS); }

/* ---------------- 4. the count register ---------------- */
function chunkTransfers(countBits, totalBytes) {
  var max = Math.pow(2, countBits);
  var full = Math.floor(totalBytes / max);
  return { max: max, full: full, covered: full * max,
           rem: totalBytes - full * max,
           n: Math.ceil(totalBytes / max),
           exact: totalBytes / max };
}

/* ---------------- 5. instruction counts ---------------- */
/* the 2011 loop: two initialisation statements, then per byte load(2) store(2)
   increment(1) decrement(1) branch(1) */
function loopCycles(bytes) { return 2 + bytes * 7; }
function dmaCycles(bytes, setup, perByte) { return setup + bytes * perByte; }

/* ---------------- 6. the interrupt event order ---------------- */
var EVENTS = [
  { k: 'Q', label: 'finish the current instruction' },
  { k: 'P', label: 'push the process status' },
  { k: 'T', label: 'load the new program counter' },
  { k: 'R', label: 'execute the service routine' },
  { k: 'S', label: 'pop the process status' }
];
function eventOrderOk(seq) {
  var idx = {}, i;
  for (i = 0; i < EVENTS.length; i++) idx[EVENTS[i].k] = i;
  for (i = 1; i < seq.length; i++) if (idx[seq[i]] <= idx[seq[i - 1]]) return false;
  return seq.length === EVENTS.length;
}

/* ---------------- 7. the running cases ---------------- */
var MMIO = mmioBudget(16, 256);
var POLL2023 = pollingCost(0.010, 100e-6, 1, 200e-6);
var INT2023 = interruptCost(1, 1e-3);
var DISK_RATE = diskRate(512, 1024, 3000);
var WORD_PERIOD = 4 / DISK_RATE;              /* seconds between 4-byte words */
var MEM_CYCLE = 40e-9;
var CHUNK2016 = chunkTransfers(16, 29154 * 1024);
var LOOP2011 = loopCycles(500);
var DMA2011 = dmaCycles(500, 20, 2);

/* ---------------- 8. the checks ---------------- */
function buildChecks() {
  CHECKS.length = 0;

  /* address budget */
  chk('16 address bits give 65536 addresses', MMIO.total === 65536, MMIO.total);
  chk('256 port addresses leave 65280 for memory', MMIO.memory === 65280, MMIO.memory);
  chk('isolated I/O leaves the memory space whole',
      mmioBudget(16, 256).memory + 256 === 65536, '65536');
  chk('the memory-mapped budget is a subtraction, not a division',
      MMIO.total - MMIO.memory === MMIO.ports, MMIO.ports);

  /* polling, GATE 2023 Q34 */
  chk('a poll every 10 ms is 100 polls a second', near(POLL2023.polls, 100), POLL2023.polls);
  chk('100 polls at 100 us cost 10 ms a second', near(POLL2023.pollCost, 0.010), POLL2023.pollCost);
  chk('one keystroke adds 200 us', near(POLL2023.procCost, 0.0002), POLL2023.procCost);
  chk('T1 is 0.0102 s', near(POLL2023.total, 0.0102), POLL2023.total);
  chk('T2 is 0.001 s', near(INT2023, 0.001), INT2023);
  chk('T1 over T2 is 10.2', near(POLL2023.total / INT2023, 10.2, 1e-9),
      (POLL2023.total / INT2023).toFixed(1));
  chk('the poll count is set by the clock, not by the keystrokes',
      near(pollingCost(0.010, 100e-6, 0, 0).polls, 100), '100 polls even with no events');

  /* interrupt against programmed, GATE 2005 Q69 */
  chk('10 KB/s at 1000 B/KB is 100 us a byte', near(1 / (10 * 1000) * 1e6, 100), '100');
  chk('10 KB/s at 1024 B/KB is 97.66 us a byte',
      near(1 / (10 * 1024) * 1e6, 97.65625, 1e-6), '97.65625');
  chk('the gain at 1000 B/KB is exactly 25', near(interruptGain(10 * 1000, 4e-6), 25, 1e-9),
      interruptGain(10 * 1000, 4e-6).toFixed(4));
  chk('the gain at 1024 B/KB is 24.41 and still selects 25',
      near(interruptGain(10 * 1024, 4e-6), 24.4140625, 1e-6),
      interruptGain(10 * 1024, 4e-6).toFixed(4));

  /* disk cycle stealing, GATE 2005 Q70 */
  chk('one track holds 512 KB', 512 * 1024 === 524288, 512 * 1024);
  chk('3000 rpm is 50 revolutions a second', near(3000 / 60, 50), 50);
  chk('the disk delivers 26214400 B/s', near(DISK_RATE, 26214400), DISK_RATE);
  chk('a 4-byte word arrives every 152.588 ns',
      near(WORD_PERIOD * 1e9, 152.587890625, 1e-6), (WORD_PERIOD * 1e9).toFixed(3));
  chk('the exact fraction stolen is 26.2 per cent',
      near(stealFraction(MEM_CYCLE, WORD_PERIOD) * 100, 26.2144, 1e-3),
      (stealFraction(MEM_CYCLE, WORD_PERIOD) * 100).toFixed(3));
  chk('one word interval contains 4 whole memory cycles',
      stealWholeCycles(MEM_CYCLE, WORD_PERIOD) === 4, stealWholeCycles(MEM_CYCLE, WORD_PERIOD));
  chk('the whole-cycle reading gives 25 per cent',
      near(100 / stealWholeCycles(MEM_CYCLE, WORD_PERIOD), 25), 25);
  chk('the surfaces do not multiply the rate',
      diskRate(512, 1024, 3000) === diskRate(512, 1024, 3000), 'one head at a time');

  /* cycle-stealing throughput, GATE 2021 Set 2 and 2024 Set 2 */
  chk('2 MHz at 0.5 per cent of 8-bit cycles is 80000 bits/s',
      near(stealRate(2e6, 0.005, 8), 80000), stealRate(2e6, 0.005, 8));
  chk('4 MHz at 1 per cent of 8-byte cycles is 2560000 bits/s',
      near(stealRate(4e6, 0.01, 64), 2560000), stealRate(4e6, 0.01, 64));
  chk('the same clock and fraction, twice the width, twice the rate',
      near(stealRate(4e6, 0.01, 128), 2 * stealRate(4e6, 0.01, 64)), 'linear in width');

  /* the count register, GATE 2016 Set 1 Q31 */
  chk('a 16-bit count register covers 65536 bytes', CHUNK2016.max === 65536, CHUNK2016.max);
  chk('29154 KB is 29853696 bytes', 29154 * 1024 === 29853696, 29154 * 1024);
  chk('the exact ratio is 455.53125', near(CHUNK2016.exact, 455.53125), CHUNK2016.exact);
  chk('455 full transfers cover 29818880 bytes', CHUNK2016.covered === 29818880, CHUNK2016.covered);
  chk('34816 bytes are left over', CHUNK2016.rem === 34816, CHUNK2016.rem);
  chk('the answer is 456 acquisitions, not 455', CHUNK2016.n === 456, CHUNK2016.n);
  chk('455 transfers would lose the remainder', CHUNK2016.covered < 29154 * 1024,
      'covered ' + CHUNK2016.covered + ' of ' + (29154 * 1024));
  chk('a file one byte over a chunk needs two transfers',
      chunkTransfers(16, 65537).n === 2, chunkTransfers(16, 65537).n);

  /* the 2011 speedup */
  chk('the software loop costs 3502 cycles', LOOP2011 === 3502, LOOP2011);
  chk('the DMA path costs 1020 cycles', DMA2011 === 1020, DMA2011);
  chk('the speedup rounds to 3.4, which is the option offered',
      (LOOP2011 / DMA2011).toFixed(1) === '3.4', (LOOP2011 / DMA2011).toFixed(4));
  chk('the loop without its two setup instructions would be 3500',
      LOOP2011 - 2 === 3500, 3500);

  /* the interrupt event order */
  chk('Q P T R S is the one legal order', eventOrderOk(['Q', 'P', 'T', 'R', 'S']), 'QPTRS');
  chk('loading the PC before saving the status is illegal',
      !eventOrderOk(['Q', 'T', 'P', 'R', 'S']), 'QTPRS');
  chk('popping before the routine runs is illegal',
      !eventOrderOk(['Q', 'P', 'S', 'T', 'R']), 'QPSTR');

  /* the interrupt fraction and its licence */
  chk('4 us of cost in a 100 us interval is a fraction 0.04',
      near(interruptFraction(4e-6, 100e-6), 0.04), 0.04);
  chk('the fraction formula is licensed at 4 us in 100 us',
      fractionLicensed(4e-6, 100e-6), 'licensed');
  chk('at 200 us of cost in a 100 us interval the fraction exceeds one',
      interruptFraction(200e-6, 100e-6) > 1, interruptFraction(200e-6, 100e-6));
  chk('and there the formula is not licensed',
      !fractionLicensed(200e-6, 100e-6), 'not licensed');

  /* the 2001 disk, both parts */
  chk('20 surfaces of 1000 tracks of 16 KB is 320000 KB',
      20 * 1000 * 16 === 320000, 320000);
  chk('16 KB a track at 50 revolutions a second is 800000 B/s',
      near(16 * 1000 * 50, 800000), 800000);
  chk('one byte therefore takes 1.25 us', near(1 / 800000 * 1e6, 1.25), 1.25);
  chk('interrupt-driven costs 28.57 per cent of the CPU',
      near((0.1 + 0.4) / (0.1 + 0.4 + 1.25) * 100, 28.5714, 1e-3), '28.57');
  chk('cycle-stealing costs 8 per cent of the CPU',
      near(0.1 / 1.25 * 100, 8), '8');
}

/* ======================================================================
   LAYER 2 - SMALL FORMATTERS
   ====================================================================== */

function pct(x, d) { return (x * 100).toFixed(d === undefined ? 2 : d) + ' %'; }
function grp(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
function us(x) { return (x * 1e6).toFixed(x * 1e6 < 10 ? 2 : 0) + ' us'; }

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
function rev(t, start, dur) {
  if (t <= start) return 0;
  if (t >= start + dur) return 1;
  return (t - start) / dur;
}
function ease(v) { return v * v * (3 - 2 * v); }

function box(P, x, y, w, h, o) {
  o = o || {};
  P.rect(x, y, w, h, { fill: o.fill || PAL.surface, stroke: o.stroke || PAL.border,
    sw: o.sw || 1.4, radius: o.radius === undefined ? 4 : o.radius, dash: o.dash });
}
function labelIn(P, x, y, w, h, line1, line2, o) {
  o = o || {};
  P.text(x + w / 2, y + (line2 ? h / 2 - 7 : h / 2), line1,
         { size: o.size || 11, mono: o.mono !== false, color: o.color || PAL.ink,
           align: 'center', base: 'middle', bold: o.bold });
  if (line2) {
    P.text(x + w / 2, y + h / 2 + 7, line2,
           { size: o.size2 || 9, color: o.color2 || PAL.dim, align: 'center', base: 'middle' });
  }
}
function takeaway(P, t, at, line1, line2) {
  var a = ease(rev(t, at, 1.2));
  P.alpha(a);
  P.rect(24, 392, 852, 56, { fill: PAL.surface2, stroke: PAL.border, radius: 5 });
  P.text(40, 406, line1, { size: 12, bold: true, color: PAL.ink });
  P.text(40, 424, line2, { size: 10, color: PAL.dim });
  P.alpha(1);
}

/* ======================================================================
   LAYER 4 - THE SCENES
   Each scene reads from the validated model and draws it. Nothing here
   re-derives a number that Layer 1 already checked.
   ====================================================================== */

var SCENES = {};

/* ---------- scene 1: the interface ---------- */
SCENES.interface = function (P, t) {
  head(P, 'scene 1 - the interface', 'A device is not a memory: it needs a translator');

  /* CPU */
  P.alpha(ease(rev(t, 0.2, 0.9)));
  box(P, 30, 96, 110, 64, { stroke: PAL.ink, fill: PAL.surface2 });
  labelIn(P, 30, 96, 110, 64, 'CPU', 'bus master', { size: 14, bold: true, size2: 9 });
  P.alpha(1);

  /* device */
  P.alpha(ease(rev(t, 1.6, 0.9)));
  box(P, 690, 96, 170, 64, { stroke: PAL.ink, fill: PAL.surface2 });
  labelIn(P, 690, 96, 170, 64, 'device', 'disk, keyboard, sensor', { size: 14, bold: true, size2: 9 });
  P.alpha(1);

  /* the interface and its three registers */
  P.alpha(ease(rev(t, 3.0, 1.0)));
  note(P, 300, 68, 'the interface, or controller', PAL.accent, 10);
  box(P, 300, 78, 300, 100, { stroke: PAL.accent, fill: PAL.accentDim, sw: 1.8 });
  P.alpha(1);

  var regs = [
    { x: 316, n: 'DATA', d: 'the item' },
    { x: 406, n: 'STATUS', d: 'ready?' },
    { x: 496, n: 'CONTROL', d: 'start, stop' }
  ];
  for (var i = 0; i < regs.length; i++) {
    var a = ease(rev(t, 3.6 + i * 0.5, 0.7));
    P.alpha(a);
    box(P, regs[i].x, 96, 88, 46, { stroke: PAL.accent, fill: PAL.surface, radius: 3 });
    labelIn(P, regs[i].x, 96, 88, 46, regs[i].n, regs[i].d, { size: 10, bold: true, size2: 9 });
    P.alpha(1);
  }

  /* the bus, drawn as the two hops it is */
  var b = ease(rev(t, 6.0, 1.0));
  P.alpha(b);
  P.arrow(146, 128, 292, 128, { stroke: PAL.info, sw: 1.6 });
  P.arrow(606, 128, 684, 128, { stroke: PAL.info, sw: 1.6 });
  note(P, 146, 112, 'system bus', PAL.info, 9);
  P.alpha(1);

  /* the one question */
  P.alpha(ease(rev(t, 8.5, 1.0)));
  P.text(30, 202, 'Every I/O method in the syllabus answers one question:', { size: 12, bold: true, color: PAL.ink });
  P.text(30, 222, 'who reads and writes these three registers?', { size: 12, color: PAL.accent });
  P.alpha(1);

  var rows = [
    { y: 258, who: 'the CPU, every time', what: 'programmed I/O  (polling)', c: PAL.invalid },
    { y: 296, who: 'the CPU, only when told', what: 'interrupt-driven I/O', c: PAL.warn },
    { y: 334, who: 'the controller', what: 'DMA', c: PAL.valid }
  ];
  for (var r = 0; r < rows.length; r++) {
    var ar = ease(rev(t, 10.5 + r * 1.6, 0.8));
    P.alpha(ar);
    box(P, 30, rows[r].y, 190, 28, { stroke: rows[r].c, fill: PAL.surface, radius: 3 });
    P.text(40, rows[r].y + 9, rows[r].who, { size: 10, color: PAL.ink });
    P.arrow(228, rows[r].y + 14, 256, rows[r].y + 14, { stroke: rows[r].c, sw: 1.4 });
    P.text(266, rows[r].y + 9, rows[r].what, { size: 11, mono: true, color: rows[r].c });
    P.alpha(1);
  }

  takeaway(P, t, 18,
    'An interface is three registers on the bus.',
    'The method is the answer to who drives the data register: the CPU always, the CPU on demand, or a controller.');
};

/* ---------- scene 2: memory-mapped against isolated ---------- */
SCENES.mapping = function (P, t) {
  head(P, 'scene 2 - naming a register', 'One address space, or two');

  /* panel A */
  P.alpha(ease(rev(t, 0.3, 0.9)));
  box(P, 30, 74, 410, 200, { stroke: PAL.border, fill: PAL.surface, radius: 6 });
  P.text(46, 86, 'memory-mapped I/O', { size: 13, bold: true, color: PAL.accent });
  P.text(46, 106, 'the registers sit at addresses in the memory map', { size: 10, color: PAL.dim });

  /* the address bar */
  box(P, 60, 126, 54, 128, { stroke: PAL.border, fill: PAL.surface2, radius: 2 });
  P.rect(60, 126, 54, 10, { fill: PAL.invalid });
  P.text(122, 124, '256 addresses taken by ports', { size: 9, color: PAL.invalid });
  P.text(122, 138, '(strip exaggerated: 0.4 per cent)', { size: 9, color: PAL.faint });
  P.text(122, 160, '65280 addresses left', { size: 10, color: PAL.valid });
  P.text(122, 176, 'for memory', { size: 10, color: PAL.valid });
  mono(P, 60, 264, '0 ... 65535', PAL.faint, 9);
  P.text(46, 232, 'load and store reach a device', { size: 10, color: PAL.ink });
  P.text(46, 248, 'no new instruction needed', { size: 10, color: PAL.dim });
  P.alpha(1);

  /* panel B */
  P.alpha(ease(rev(t, 3.4, 0.9)));
  box(P, 460, 74, 410, 200, { stroke: PAL.border, fill: PAL.surface, radius: 6 });
  P.text(476, 86, 'isolated I/O  (port-mapped)', { size: 13, bold: true, color: PAL.accent });
  P.text(476, 106, 'the ports get a numbered space of their own', { size: 10, color: PAL.dim });

  box(P, 490, 126, 54, 128, { stroke: PAL.border, fill: PAL.surface2, radius: 2 });
  P.text(556, 132, 'all 65536 addresses', { size: 10, color: PAL.valid });
  P.text(556, 146, 'still memory', { size: 10, color: PAL.valid });
  box(P, 490, 274, 54, 0, {});
  box(P, 660, 126, 54, 26, { stroke: PAL.warn, fill: PAL.warnDim, radius: 2 });
  P.text(722, 130, '256 ports', { size: 10, color: PAL.warn });
  P.text(722, 144, 'a separate space', { size: 9, color: PAL.faint });
  P.arrow(576, 139, 654, 139, { stroke: PAL.warn, sw: 1.3, dash: [3, 3] });
  mono(P, 660, 172, 'M / IO', PAL.warn, 10);
  P.text(660, 188, 'one control line says which space', { size: 9, color: PAL.dim });
  P.text(476, 232, 'IN and OUT name a port, not an address', { size: 10, color: PAL.ink });
  P.alpha(1);

  /* the arithmetic */
  var a = ease(rev(t, 7.5, 1.0));
  P.alpha(a);
  mono(P, 30, 292, 'memory-mapped :  65536 - 256 = 65280 addresses of memory', PAL.invalid, 11);
  mono(P, 30, 314, 'isolated      :  65536 addresses of memory, 256 ports besides', PAL.valid, 11);
  P.alpha(1);

  var c = ease(rev(t, 12, 1.0));
  P.alpha(c);
  P.text(30, 344, 'Memory-mapped spends addresses. Isolated spends instructions and one control line.', { size: 11, color: PAL.ink });
  P.alpha(1);

  takeaway(P, t, 18,
    'Two names for the same register, at two different prices.',
    'Memory-mapped buys convenience with address space; isolated buys address space with instructions and a decode line.');
};

/* ---------- scene 3: programmed I/O ---------- */
SCENES.polling = function (P, t) {
  head(P, 'scene 3 - programmed I/O', 'The CPU is both the copier and the checker');

  /* the loop */
  var steps = [
    { y: 92, s: 'write the control register', k: 'start' },
    { y: 148, s: 'read the status register', k: 'ask' },
    { y: 204, s: 'ready?', k: 'test' },
    { y: 260, s: 'read or write the data', k: 'move' }
  ];
  for (var i = 0; i < steps.length; i++) {
    var a = ease(rev(t, 0.4 + i * 1.0, 0.8));
    P.alpha(a);
    box(P, 56, steps[i].y, 176, 34, {
      stroke: steps[i].k === 'test' ? PAL.warn : PAL.border,
      fill: steps[i].k === 'test' ? PAL.warnDim : PAL.surface2, radius: 4 });
    P.text(66, steps[i].y + 11, steps[i].s, { size: 10, color: PAL.ink });
    P.alpha(1);
  }
  var b = ease(rev(t, 4.6, 1.0));
  P.alpha(b);
  P.arrow(144, 126, 144, 144, { stroke: PAL.border, sw: 1.4 });
  P.arrow(144, 182, 144, 200, { stroke: PAL.border, sw: 1.4 });
  P.arrow(144, 238, 144, 256, { stroke: PAL.border, sw: 1.4 });
  P.arrow(232, 221, 232, 165, { stroke: PAL.invalid, sw: 1.4, dash: [4, 3] });
  P.arrow(40, 277, 40, 148, { stroke: PAL.ink, sw: 1.4 });
  P.text(246, 186, 'not ready', { size: 9, color: PAL.invalid });
  P.text(246, 200, 'ask again', { size: 9, color: PAL.invalid });
  P.text(20, 210, 'again', { size: 9, color: PAL.ink });
  P.alpha(1);

  /* the numbers */
  var c = ease(rev(t, 6.5, 1.0));
  P.alpha(c);
  mono(P, 420, 96, 'poll every 10 ms  ->  100 polls a second', PAL.info, 11);
  mono(P, 420, 118, '100 polls x 100 us  =  10 ms', PAL.info, 11);
  mono(P, 420, 140, '1 keystroke x 200 us =  0.2 ms', PAL.info, 11);
  mono(P, 420, 166, 'T1 = 10.2 ms', PAL.accent, 12);
  mono(P, 420, 192, 'interrupt: T2 = 1 ms', PAL.warn, 11);
  mono(P, 420, 214, 'T1 / T2 = 10.2', PAL.ink, 12);
  P.alpha(1);

  /* two occupancy bars */
  var d = ease(rev(t, 11.5, 1.0));
  P.alpha(d);
  note(P, 420, 244, 'programmed I/O: the CPU is busy for the whole interval', PAL.dim, 9);
  P.rect(420, 258, 440, 22, { fill: PAL.invalidDim, stroke: PAL.invalid, radius: 3 });
  P.text(432, 265, 'occupied 100 per cent of the interval', { size: 10, color: PAL.invalid });
  note(P, 420, 296, 'interrupt-driven: the CPU pays only the service time', PAL.dim, 9);
  P.rect(420, 310, 440, 22, { fill: PAL.surface2, stroke: PAL.border, radius: 3 });
  P.rect(420, 310, 44, 22, { fill: PAL.warnDim, stroke: PAL.warn, radius: 3 });
  P.text(472, 317, '1 of every 10.2 units', { size: 10, color: PAL.dim });
  P.alpha(1);

  takeaway(P, t, 18,
    'Polling has no separate overhead, because the CPU never leaves the loop.',
    'Its cost per byte is the whole interval that byte took. Interrupts exist to replace that interval with a service time.');
};

/* ---------- scene 4: the interrupt event order ---------- */
SCENES.events = function (P, t) {
  head(P, 'scene 4 - interrupt-driven I/O', 'Five events, one legal order');

  var bw = 156, gap = 16, x0 = 28, y = 104;
  var caps = [
    { n: '1', s: 'finish the', s2: 'instruction', k: 'Q' },
    { n: '2', s: 'push the', s2: 'process status', k: 'P' },
    { n: '3', s: 'load the new', s2: 'program counter', k: 'T' },
    { n: '4', s: 'run the service', s2: 'routine', k: 'R' },
    { n: '5', s: 'pop the', s2: 'process status', k: 'S' }
  ];
  for (var i = 0; i < caps.length; i++) {
    var x = x0 + i * (bw + gap);
    var a = ease(rev(t, 0.4 + i * 1.1, 0.8));
    P.alpha(a);
    box(P, x, y, bw, 62, { stroke: PAL.accent, fill: PAL.accentDim, radius: 5 });
    P.text(x + 10, y + 8, caps[i].k, { size: 13, mono: true, bold: true, color: PAL.accent });
    P.text(x + 34, y + 12, caps[i].s, { size: 10, color: PAL.ink });
    P.text(x + 34, y + 26, caps[i].s2, { size: 10, color: PAL.ink });
    P.text(x + 10, y + 44, caps[i].n, { size: 9, mono: true, color: PAL.dim });
    P.alpha(1);
    if (i < caps.length - 1) {
      var b = ease(rev(t, 0.9 + i * 1.1, 0.6));
      P.alpha(b);
      P.arrow(x + bw + 1, y + 31, x + bw + gap - 2, y + 31, { stroke: PAL.ink, sw: 1.4 });
      P.alpha(1);
    }
  }

  var c = ease(rev(t, 6.5, 1.0));
  P.alpha(c);
  mono(P, 28, 190, 'order:  Q  P  T  R  S', PAL.ink, 13);
  P.text(28, 214, 'An interrupt is honoured only at an instruction boundary, so Q comes first.', { size: 10, color: PAL.dim });
  P.text(28, 232, 'The program counter is part of the status, so it must be written down before it is overwritten.', { size: 10, color: PAL.dim });
  P.alpha(1);

  var d = ease(rev(t, 10.5, 1.0));
  P.alpha(d);
  box(P, 28, 250, 844, 44, { stroke: PAL.invalid, fill: PAL.invalidDim, radius: 4 });
  mono(P, 40, 262, 'Q  T  P  R  S   is offered on the 2018 paper, and is wrong', PAL.invalid, 11);
  P.text(40, 280, 'Loading the new program counter first destroys the return address. Save before you jump.', { size: 10, color: PAL.invalid });
  P.alpha(1);

  var e = ease(rev(t, 14, 1.0));
  P.alpha(e);
  P.text(28, 314, 'Step 3 is where vectored and non-vectored interrupts differ: the new value comes from a vector,', { size: 10, color: PAL.ink });
  P.text(28, 332, 'and the question is who supplies it. Steps 1, 2, 4 and 5 are identical in both schemes.', { size: 10, color: PAL.ink });
  P.alpha(1);

  takeaway(P, t, 18,
    'The order is forced by one fact: the return address lives in the program counter.',
    'Finish, save, load, run, restore. Only the third step varies between machines.');
};

/* ---------- scene 5: naming against ranking ---------- */
SCENES.priority = function (P, t) {
  head(P, 'scene 5 - interrupts', 'Naming the source is not ranking the sources');

  /* left column */
  var a = ease(rev(t, 0.4, 0.9));
  P.alpha(a);
  P.text(30, 74, 'NAMING: which device asked?', { size: 12, bold: true, color: PAL.info });
  P.alpha(1);

  var left = [
    { y: 92, t1: 'vectored', t2: 'the device puts its vector on the bus', c: PAL.valid },
    { y: 142, t1: 'non-vectored', t2: 'one shared address, then software asks around', c: PAL.invalid }
  ];
  for (var i = 0; i < left.length; i++) {
    var b = ease(rev(t, 1.4 + i * 1.2, 0.8));
    P.alpha(b);
    box(P, 30, left[i].y, 400, 40, { stroke: left[i].c, fill: PAL.surface, radius: 4 });
    P.text(42, left[i].y + 8, left[i].t1, { size: 11, mono: true, bold: true, color: left[i].c });
    P.text(42, left[i].y + 24, left[i].t2, { size: 9, color: PAL.dim });
    P.alpha(1);
  }

  /* right column */
  var c = ease(rev(t, 4.0, 0.9));
  P.alpha(c);
  P.text(470, 74, 'RANKING: which of two at once?', { size: 12, bold: true, color: PAL.warn });
  P.alpha(1);

  var right = [
    { y: 92, t1: 'daisy chain', t2: 'a hardware grant pulse walks the chain and stops', c: PAL.valid },
    { y: 142, t1: 'software polling', t2: 'the handler reads status registers in priority order', c: PAL.valid }
  ];
  for (var j = 0; j < right.length; j++) {
    var d = ease(rev(t, 5.0 + j * 1.2, 0.8));
    P.alpha(d);
    box(P, 470, right[j].y, 400, 40, { stroke: right[j].c, fill: PAL.surface, radius: 4 });
    P.text(482, right[j].y + 8, right[j].t1, { size: 11, mono: true, bold: true, color: right[j].c });
    P.text(482, right[j].y + 24, right[j].t2, { size: 9, color: PAL.dim });
    P.alpha(1);
  }

  /* daisy chain as a picture */
  var e = ease(rev(t, 8.0, 1.0));
  P.alpha(e);
  box(P, 30, 200, 60, 26, { stroke: PAL.ink, fill: PAL.surface2, radius: 3 });
  P.text(46, 208, 'CPU', { size: 10, bold: true, color: PAL.ink });
  var dx = [110, 190, 270, 350];
  for (var k = 0; k < dx.length; k++) {
    box(P, dx[k], 200, 62, 26, {
      stroke: k < 2 ? PAL.valid : PAL.border,
      fill: k < 2 ? PAL.validDim : PAL.surface2, radius: 3 });
    P.text(dx[k] + 14, 208, 'dev ' + (k + 1), { size: 9, color: PAL.ink });
    P.arrow(dx[k] - 16, 213, dx[k] - 2, 213, { stroke: PAL.border, sw: 1.2 });
  }
  P.text(30, 234, 'the acknowledge stops at the first device asking: position is priority', { size: 9, color: PAL.dim });
  P.alpha(1);

  /* the third axis: maskable */
  var f = ease(rev(t, 12, 1.0));
  P.alpha(f);
  box(P, 470, 200, 400, 74, { stroke: PAL.border, fill: PAL.surface2, radius: 4 });
  P.text(482, 210, 'a third, independent axis', { size: 10, bold: true, color: PAL.ink });
  P.text(482, 228, 'maskable: software can disable it for a critical section', { size: 9, color: PAL.dim });
  P.text(482, 244, 'non-maskable: cannot be disabled — power failure, parity,', { size: 9, color: PAL.dim });
  P.text(482, 260, 'over-temperature. A mouse is maskable; a heat sensor is not.', { size: 9, color: PAL.dim });
  P.alpha(1);

  var g = ease(rev(t, 15, 1.0));
  P.alpha(g);
  mono(P, 30, 278, '2020 Q3 : daisy chain true, vectored needs polling FALSE  ->  I and III', PAL.info, 10);
  mono(P, 30, 298, '2026 S2 : S1 true, S2 false  ->  the chain does not poll in software', PAL.info, 10);
  P.alpha(1);

  takeaway(P, t, 18,
    'Vectored answers naming; daisy chain answers ranking.',
    'That is why "a vectored interrupt still needs polling" and "a daisy chain polls the devices" are both false.');
};

/* ---------- scene 6: DMA ---------- */
SCENES.dma = function (P, t) {
  head(P, 'scene 6 - direct memory access', 'A second bus master, with three registers');

  var a = ease(rev(t, 0.3, 0.9));
  P.alpha(a);
  box(P, 30, 96, 130, 70, { stroke: PAL.ink, fill: PAL.surface2 });
  labelIn(P, 30, 96, 130, 70, 'CPU', 'bus master', { size: 13, bold: true, size2: 9 });
  P.alpha(1);

  var b = ease(rev(t, 1.4, 0.9));
  P.alpha(b);
  box(P, 720, 96, 150, 70, { stroke: PAL.ink, fill: PAL.surface2 });
  labelIn(P, 720, 96, 150, 70, 'memory', 'words', { size: 13, bold: true, size2: 9 });
  P.alpha(1);

  var c = ease(rev(t, 2.6, 1.0));
  P.alpha(c);
  note(P, 300, 66, 'the DMA controller', PAL.accent, 10);
  box(P, 300, 76, 250, 150, { stroke: PAL.accent, fill: PAL.accentDim, sw: 1.8 });
  var regs = [
    { y: 92, n: 'ADDRESS', d: 'where in memory, next' },
    { y: 128, n: 'COUNT', d: 'how many words left' },
    { y: 164, n: 'CONTROL', d: 'direction and mode' }
  ];
  for (var i = 0; i < regs.length; i++) {
    var ai = ease(rev(t, 3.2 + i * 0.6, 0.7));
    P.alpha(ai);
    box(P, 318, regs[i].y, 214, 30, { stroke: PAL.accent, fill: PAL.surface, radius: 3 });
    P.text(328, regs[i].y + 5, regs[i].n, { size: 10, mono: true, bold: true, color: PAL.accent });
    P.text(328, regs[i].y + 18, regs[i].d, { size: 9, color: PAL.dim });
    P.alpha(1);
  }
  P.alpha(1);

  var d = ease(rev(t, 6.0, 0.9));
  P.alpha(d);
  box(P, 300, 280, 250, 54, { stroke: PAL.ink, fill: PAL.surface2 });
  labelIn(P, 300, 280, 250, 54, 'device', 'one word at a time', { size: 12, bold: true, size2: 9 });
  P.arrow(425, 278, 425, 230, { stroke: PAL.info, sw: 1.5 });
  note(P, 434, 254, 'word ready', PAL.info, 9);
  P.alpha(1);

  var e = ease(rev(t, 7.5, 0.9));
  P.alpha(e);
  P.arrow(164, 120, 296, 120, { stroke: PAL.warn, sw: 1.6 });
  P.arrow(296, 146, 164, 146, { stroke: PAL.warn, sw: 1.6 });
  mono(P, 178, 108, 'BR', PAL.warn, 10);
  mono(P, 178, 152, 'BG', PAL.warn, 10);
  P.arrow(554, 131, 716, 131, { stroke: PAL.info, sw: 1.6 });
  P.arrow(716, 152, 554, 152, { stroke: PAL.info, sw: 1.6 });
  P.alpha(1);

  var f = ease(rev(t, 10, 1.0));
  P.alpha(f);
  P.text(610, 200, 'one bus master at any', { size: 10, bold: true, color: PAL.ink });
  P.text(610, 216, 'instant. Never two.', { size: 10, bold: true, color: PAL.invalid });
  P.text(610, 238, 'The CPU can still execute', { size: 9, color: PAL.dim });
  P.text(610, 252, 'instructions that never', { size: 9, color: PAL.dim });
  P.text(610, 266, 'touch the bus.', { size: 9, color: PAL.dim });
  P.alpha(1);

  var g = ease(rev(t, 13, 1.0));
  P.alpha(g);
  mono(P, 30, 200, 'CPU cost = setup', PAL.invalid, 11);
  mono(P, 30, 220, '         + completion interrupt', PAL.invalid, 11);
  mono(P, 30, 240, '         + every stolen bus cycle', PAL.invalid, 11);
  P.alpha(1);

  takeaway(P, t, 18,
    'The controller owns the copying; the CPU owns the two ends.',
    'Overlap in time is not sharing of the bus. Only one of them drives the address and data lines at any instant.');
};

/* ---------- scene 7: the three modes ---------- */
SCENES.modes = function (P, t) {
  head(P, 'scene 7 - DMA modes', 'How long the bus is held, and who waits');

  var x0 = 180, x1 = 872, span = x1 - x0;

  /* legend */
  var lg = ease(rev(t, 0.3, 0.8));
  P.alpha(lg);
  P.rect(x0, 62, 16, 10, { fill: PAL.accentDim, stroke: PAL.accent, radius: 2 });
  P.text(x0 + 22, 62, 'DMA owns the bus', { size: 9, color: PAL.dim });
  P.rect(x0 + 170, 62, 16, 10, { fill: PAL.surface2, stroke: PAL.border, radius: 2 });
  P.text(x0 + 192, 62, 'CPU has it', { size: 9, color: PAL.dim });
  P.alpha(1);

  var rows = [
    { y: 84, name: 'burst', sub: 'one grant' },
    { y: 158, name: 'cycle stealing', sub: 'one word a grant' },
    { y: 232, name: 'transparent', sub: 'idle cycles only' }
  ];
  for (var r = 0; r < rows.length; r++) {
    var a = ease(rev(t, 1.0 + r * 2.2, 0.8));
    P.alpha(a);
    P.text(30, rows[r].y + 4, rows[r].name, { size: 11, bold: true, color: PAL.ink });
    P.text(30, rows[r].y + 20, rows[r].sub, { size: 9, color: PAL.dim });
    box(P, x0, rows[r].y, span, 34, { stroke: PAL.border, fill: PAL.surface2, radius: 3 });
    P.alpha(1);
  }

  /* burst: one long bar */
  var b = ease(rev(t, 1.6, 1.2));
  P.alpha(b);
  P.rect(x0 + 2, 86, span - 4, 30, { fill: PAL.accentDim, stroke: PAL.accent, radius: 3 });
  P.text(x0 + 12, 94, 'granted once, held to the end of the block', { size: 10, color: PAL.accent });
  P.alpha(1);

  /* cycle stealing: ten short bars */
  var c = ease(rev(t, 3.8, 1.4));
  P.alpha(c);
  var slots = 10, sw = span / slots;
  for (var i = 0; i < slots; i++) {
    P.rect(x0 + i * sw + 2, 160, 22, 30, { fill: PAL.accentDim, stroke: PAL.accent, radius: 2 });
  }
  P.text(x0 + 2, 196, 'one word, then release; the handshake repeats every time', { size: 9, color: PAL.dim });
  P.alpha(1);

  /* transparent: only idle slots */
  var d = ease(rev(t, 6.0, 1.4));
  P.alpha(d);
  var idle = [0.10, 0.22, 0.35, 0.47, 0.60, 0.72, 0.85];
  for (var j = 0; j < idle.length; j++) {
    P.rect(x0 + idle[j] * span, 234, 16, 30, { fill: PAL.accentDim, stroke: PAL.accent, radius: 2 });
  }
  P.text(x0 + 2, 270, 'a word moves only in a cycle the CPU left idle, so nothing is delayed', { size: 9, color: PAL.dim });
  P.alpha(1);

  /* the two readings */
  var e = ease(rev(t, 9.5, 1.0));
  P.alpha(e);
  P.text(30, 296, 'block time', { size: 10, bold: true, color: PAL.info });
  P.text(30, 312, 'shortest / middle / longest', { size: 9, color: PAL.dim });
  P.text(330, 296, 'CPU disruption', { size: 10, bold: true, color: PAL.warn });
  P.text(330, 312, 'whole block / one cycle each / none', { size: 9, color: PAL.dim });
  P.text(700, 296, 'throughput', { size: 10, bold: true, color: PAL.valid });
  P.text(700, 312, 'highest / lower / lowest', { size: 9, color: PAL.dim });
  P.alpha(1);

  takeaway(P, t, 18,
    'Three modes are three schedules, not three generations of hardware.',
    'Throughput and CPU cost are two readings of one Gantt chart, so they never both improve at once.');
};

/* ---------- scene 8: the arithmetic ---------- */
SCENES.overhead = function (P, t) {
  head(P, 'scene 8 - the arithmetic', 'Four formulas, and the case where each one breaks');

  var cards = [
    { x: 30, y: 74, w: 410, h: 128, title: 'cycle-stealing throughput', f: 'rate = f x p x w',
      l1: '2 MHz, 0.5 per cent, 8 bits  =  80000 b/s',
      l2: '4 MHz, 1 per cent, 64 bits   =  2560000 b/s', at: 0.4 },
    { x: 460, y: 74, w: 410, h: 128, title: 'interrupt fraction of CPU time', f: 'frac = c / T',
      l1: 'c = 4 us, T = 100 us  ->  0.04',
      l2: 'licensed only while c < T', at: 2.2 },
    { x: 30, y: 216, w: 410, h: 128, title: 'interrupt against programmed', f: 'gain = interval / overhead',
      l1: '100 us against 4 us  ->  25',
      l2: '24.4 if a KB is 1024 bytes', at: 4.6 },
    { x: 460, y: 216, w: 410, h: 128, title: 'disk cycle stealing', f: 'stolen = mem cycle / word period',
      l1: '40 ns over 152.6 ns  =  26.2 per cent',
      l2: 'keys give 25: 4 cycles, 1 stolen', at: 6.8 }
  ];
  for (var i = 0; i < cards.length; i++) {
    var cd = cards[i];
    var a = ease(rev(t, cd.at, 0.9));
    P.alpha(a);
    box(P, cd.x, cd.y, cd.w, cd.h, { stroke: PAL.border, fill: PAL.surface, radius: 6 });
    P.text(cd.x + 14, cd.y + 10, cd.title, { size: 11, bold: true, color: PAL.ink });
    mono(P, cd.x + 14, cd.y + 32, cd.f, PAL.accent, 11);
    P.text(cd.x + 14, cd.y + 56, cd.l1, { size: 10, color: PAL.info });
    P.text(cd.x + 14, cd.y + 74, cd.l2, { size: 9, color: PAL.dim });
    P.alpha(1);
  }

  var b = ease(rev(t, 10, 1.0));
  P.alpha(b);
  P.text(30, 356, 'The disk figure is a genuine disagreement: 26.2 per cent exactly, 25 by counting whole memory cycles.', { size: 10, color: PAL.warn });
  P.alpha(1);

  takeaway(P, t, 18,
    'Every numerical question here is one division of two counts.',
    'Write the unit beside each number, and check the licence: a fraction above one means the model has failed, not the CPU.');
};

/* ---------- scene 9: the count register ---------- */
SCENES.count = function (P, t) {
  head(P, 'scene 9 - the count register', 'How many times must the controller take the bus?');

  /* panel A: the register */
  var a = ease(rev(t, 0.4, 1.0));
  P.alpha(a);
  P.text(30, 74, 'a 16-bit count register', { size: 11, bold: true, color: PAL.ink });
  for (var i = 0; i < 16; i++) {
    box(P, 30 + i * 16, 92, 15, 26, { stroke: PAL.accent, fill: PAL.accentDim, radius: 1 });
  }
  mono(P, 30, 132, '2^16 = 65536 values', PAL.accent, 11);
  P.text(30, 152, 'so one transfer moves at most', { size: 9, color: PAL.dim });
  P.text(30, 168, '65536 bytes, which is 64 KB.', { size: 10, color: PAL.ink });
  P.text(30, 190, 'A ceiling of the hardware,', { size: 9, color: PAL.dim });
  P.text(30, 206, 'not a choice of software.', { size: 9, color: PAL.dim });
  P.alpha(1);

  /* panel B: the chunking */
  var b = ease(rev(t, 3.4, 1.0));
  P.alpha(b);
  P.text(330, 74, '29154 KB against 64 KB', { size: 11, bold: true, color: PAL.ink });
  box(P, 330, 94, 200, 24, { stroke: PAL.valid, fill: PAL.validDim, radius: 3 });
  P.text(338, 101, '455 transfers of 64 KB', { size: 9, color: PAL.valid });
  box(P, 330, 128, 106, 24, { stroke: PAL.invalid, fill: PAL.invalidDim, radius: 3 });
  P.text(338, 135, '1 of 34816 B', { size: 9, color: PAL.invalid });
  mono(P, 330, 172, '29853696 / 65536 = 455.53', PAL.info, 10);
  mono(P, 330, 192, '455 x 65536 = 29818880', PAL.info, 10);
  mono(P, 330, 212, 'left over: 34816 bytes', PAL.info, 10);
  P.text(330, 236, '455.53 rounds up: 456 acquisitions.', { size: 10, bold: true, color: PAL.accent });
  P.alpha(1);

  /* panel C: the speedup */
  var c = ease(rev(t, 6.6, 1.0));
  P.alpha(c);
  P.text(630, 74, 'the 2011 speedup', { size: 11, bold: true, color: PAL.ink });
  P.text(630, 96, 'software loop', { size: 9, color: PAL.dim });
  mono(P, 870, 96, '3502', PAL.ink, 10, 'right');
  P.rect(630, 110, 240, 20, { fill: PAL.invalidDim, stroke: PAL.invalid, radius: 3 });
  P.text(638, 116, '2 + 500 x 7 cycles', { size: 9, color: PAL.invalid });
  P.text(630, 146, 'DMA path', { size: 9, color: PAL.dim });
  mono(P, 870, 146, '1020', PAL.ink, 10, 'right');
  P.rect(630, 160, 70, 20, { fill: PAL.validDim, stroke: PAL.valid, radius: 3 });
  P.text(638, 166, '20 + 500 x 2', { size: 9, color: PAL.valid });
  mono(P, 630, 204, '3502 / 1020 = 3.43', PAL.accent, 12);
  P.text(630, 226, 'which is option 3.4', { size: 9, color: PAL.dim });
  P.alpha(1);

  var d = ease(rev(t, 11, 1.0));
  P.alpha(d);
  P.text(330, 274, 'Both questions are bookkeeping. Count in the unit the question uses,', { size: 10, color: PAL.ink });
  P.text(330, 292, 'then divide once.', { size: 10, color: PAL.ink });
  P.alpha(1);

  takeaway(P, t, 18,
    'A register width becomes a maximum chunk; a file size becomes a ceiling.',
    'Rounding down loses the remainder, so a count of transfers is never rounded to nearest.');
};

/* ---------- scene 10: the recipe ---------- */
SCENES.recipe = function (P, t) {
  head(P, 'scene 10 - the recipe', 'Four steps, five traps');

  var steps = [
    'name the registers: data, status, control',
    'name who copies: CPU or controller',
    'write the count, in the units asked',
    'divide once, then read the unit off the question'
  ];
  var a = ease(rev(t, 0.3, 0.8));
  P.alpha(a);
  P.text(30, 70, 'THE FOUR STEPS', { size: 10, mono: true, bold: true, color: PAL.accent });
  P.alpha(1);
  for (var i = 0; i < steps.length; i++) {
    var b = ease(rev(t, 0.8 + i * 1.0, 0.7));
    P.alpha(b);
    box(P, 30, 88 + i * 42, 400, 32, { stroke: PAL.accent, fill: PAL.accentDim, radius: 4 });
    mono(P, 42, 98 + i * 42, String(i + 1), PAL.accent, 11);
    P.text(62, 98 + i * 42, steps[i], { size: 10, color: PAL.ink });
    P.alpha(1);
  }

  var traps = [
    'vectored answers naming, daisy chain answers ranking',
    'save the status before loading the program counter',
    'the CPU and the controller are never both bus masters',
    'a count of transfers is a ceiling, never a rounding',
    'a CPU fraction above one means the model broke'
  ];
  var c = ease(rev(t, 4.8, 0.8));
  P.alpha(c);
  P.text(470, 70, 'THE FIVE TRAPS', { size: 10, mono: true, bold: true, color: PAL.invalid });
  P.alpha(1);
  for (var j = 0; j < traps.length; j++) {
    var d = ease(rev(t, 5.2 + j * 0.9, 0.7));
    P.alpha(d);
    P.circle(478, 96 + j * 34, 4, { fill: PAL.invalid });
    P.text(492, 90 + j * 34, traps[j], { size: 10, color: PAL.ink });
    P.alpha(1);
  }

  var e = ease(rev(t, 11, 1.0));
  P.alpha(e);
  box(P, 30, 272, 840, 72, { stroke: PAL.info, fill: PAL.surface2, radius: 5 });
  P.text(44, 284, 'One topic, one question.', { size: 12, bold: true, color: PAL.ink });
  P.text(44, 306, 'Programmed I/O: the CPU does both jobs every time.  Interrupt-driven: the CPU does both jobs only when called.', { size: 10, color: PAL.dim });
  P.text(44, 324, 'DMA: the controller does the copying, and the CPU pays at the setup and at the completion interrupt.', { size: 10, color: PAL.dim });
  P.alpha(1);

  takeaway(P, t, 16,
    'Who reads and writes the three registers, and how often.',
    'Every definition, every mode and every numerical question in this lesson is that sentence, read at a different scale.');
};

/* ======================================================================
   LAYER 5 - THE FRAME
   ====================================================================== */

function drawFrame(painter) {
  if (!painter) return;
  P = painter;
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
  var pass = CHECKS.filter(function (c) { return c.pass; }).length;
  var bad = CHECKS.length - pass;
  el.innerHTML = '<span class="k">Model checks</span>' +
    '<p class="small" style="margin:6px 0 0">' + pass + ' of ' + CHECKS.length + ' passed' +
    (bad ? ' — <strong>' + bad + ' failed</strong>' : '') + '</p>';
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
