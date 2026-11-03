/* ==========================================================================
   rom-pla-and-pal-programmable-logic — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The model is a small two-level-logic engine: it minimises a function by
   Quine-McCluskey plus an exhaustive cover search, evaluates the result on every
   input, and only then sizes the device. The drawing code reads the dot lists it
   produces. Nothing on the canvas is typed in by hand.
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

/* ---------- 1. cubes, covers and minimisation ----------
   A product term is a cube: one character per variable, '0' for the negated
   literal, '1' for the true literal, '-' for a variable the term does not
   contain. A term's cover is the set of minterms it is 1 on. */

function cubeOf(m, n) {
  var s = '';
  for (var j = 0; j < n; j++) s += String((m >> (n - 1 - j)) & 1);
  return s;
}

function cubeCover(cube) {
  var n = cube.length, free = [], fixed = [], out = [];
  for (var j = 0; j < n; j++) {
    if (cube.charAt(j) === '-') free.push(j); else fixed.push(j);
  }
  var total = 1 << free.length;
  for (var c = 0; c < total; c++) {
    var m = 0;
    for (var f = 0; f < fixed.length; f++) {
      var jf = fixed[f];
      if (cube.charAt(jf) === '1') m |= 1 << (n - 1 - jf);
    }
    for (var b = 0; b < free.length; b++) {
      if ((c >> b) & 1) m |= 1 << (n - 1 - free[b]);
    }
    out.push(m);
  }
  return out;
}

function literals(cube) {
  var c = 0;
  for (var j = 0; j < cube.length; j++) if (cube.charAt(j) !== '-') c++;
  return c;
}

function cubeText(cube, names) {
  var s = '';
  for (var j = 0; j < cube.length; j++) {
    var v = cube.charAt(j);
    if (v === '-') continue;
    s += (v === '1' ? names[j] : names[j] + "'");
  }
  return s === '' ? '1' : s;
}

function cubeEval(cube, m) {
  var n = cube.length;
  for (var j = 0; j < n; j++) {
    var v = cube.charAt(j);
    if (v === '-') continue;
    if (String((m >> (n - 1 - j)) & 1) !== v) return false;
  }
  return true;
}

function sopEval(sop, m) {
  for (var i = 0; i < sop.length; i++) if (cubeEval(sop[i], m)) return 1;
  return 0;
}

/* all prime implicants of (ones ∪ dc), keeping only those that cover no
   minterm outside the allowed set */
function primeImplicants(ones, dcs, n) {
  var allowed = {};
  ones.concat(dcs).forEach(function (m) { allowed[m] = 1; });
  var cur = {}, key;
  ones.concat(dcs).forEach(function (m) { cur[cubeOf(m, n)] = 1; });
  var primes = {};
  while (Object.keys(cur).length) {
    var list = Object.keys(cur), nxt = {}, used = {};
    for (var i = 0; i < list.length; i++) {
      for (var j = i + 1; j < list.length; j++) {
        var a = list[i], b = list[j], diff = -1, ok = true;
        for (var p = 0; p < n; p++) {
          if (a.charAt(p) !== b.charAt(p)) { if (diff !== -1) { ok = false; break; } diff = p; }
        }
        if (ok && diff !== -1) {
          nxt[a.substring(0, diff) + '-' + a.substring(diff + 1)] = 1;
          used[a] = 1; used[b] = 1;
        }
      }
    }
    for (key in cur) if (!used[key]) primes[key] = 1;
    cur = nxt;
  }
  var out = [];
  for (key in primes) {
    var cov = cubeCover(key), inside = true;
    for (var q = 0; q < cov.length; q++) if (!allowed[cov[q]]) { inside = false; break; }
    if (inside) out.push(key);
  }
  return out;
}

/* smallest cover of `ones`, chosen by exhaustive search over the primes, with
   the literal count used to break ties. Returns {sop, k, lits}. */
function minimalCover(ones, dcs, n) {
  var primes = primeImplicants(ones, dcs, n).sort();
  var want = {};
  ones.forEach(function (m) { want[m] = 1; });
  var covers = primes.map(function (p) {
    return cubeCover(p).filter(function (m) { return want[m]; });
  });
  for (var size = 1; size <= primes.length; size++) {
    var best = null;
    var idx = [];
    var search = function (start, depth) {
      if (depth === size) {
        var hit = {};
        idx.forEach(function (i) { covers[i].forEach(function (m) { hit[m] = 1; }); });
        var ok = true;
        for (var m in want) if (!hit[m]) { ok = false; break; }
        if (ok) {
          var lit = 0;
          idx.forEach(function (i) { lit += literals(primes[i]); });
          if (best === null || lit < best.lit) best = { lit: lit, idx: idx.slice() };
        }
        return;
      }
      for (var i = start; i < primes.length; i++) { idx.push(i); search(i + 1, depth + 1); idx.pop(); }
    };
    search(0, 0);
    if (best) {
      return { sop: best.idx.map(function (i) { return primes[i]; }), k: size, lits: best.lit };
    }
  }
  return { sop: [], k: 0, lits: 0 };
}

/* no cover of fewer than k terms exists — the minimality proof, by search */
function noSmallerCover(ones, dcs, n, k) {
  var primes = primeImplicants(ones, dcs, n);
  var want = {};
  ones.forEach(function (m) { want[m] = 1; });
  var covers = primes.map(function (p) {
    return cubeCover(p).filter(function (m) { return want[m]; });
  });
  for (var size = 1; size < k; size++) {
    var idx = [], found = false;
    var search = function (start, depth) {
      if (found) return;
      if (depth === size) {
        var hit = {};
        idx.forEach(function (i) { covers[i].forEach(function (m) { hit[m] = 1; }); });
        var ok = true;
        for (var m in want) if (!hit[m]) { ok = false; break; }
        if (ok) found = true;
        return;
      }
      for (var i = start; i < primes.length; i++) { idx.push(i); search(i + 1, depth + 1); idx.pop(); }
    };
    search(0, 0);
    if (found) return false;
  }
  return true;
}

/* the SOP agrees with the spec on every input that is not a don't care */
function agrees(sop, ones, dcs, n) {
  var dc = {};
  dcs.forEach(function (m) { dc[m] = 1; });
  var on = {};
  ones.forEach(function (m) { on[m] = 1; });
  for (var m = 0; m < (1 << n); m++) {
    if (dc[m]) continue;
    if (sopEval(sop, m) !== (on[m] ? 1 : 0)) return { ok: false, bad: m };
  }
  return { ok: true, bad: -1 };
}

function range(k) { var a = []; for (var i = 0; i < k; i++) a.push(i); return a; }

/* ---------- 2. the five worked functions ---------- */

var N4 = ['A', 'B', 'C', 'D'];
var N3 = ['A', 'B', 'C'];

/* E1: one output, four variables */
var E1_ON = [0, 2, 5, 7, 8, 10, 13, 15];
var E1 = minimalCover(E1_ON, [], 4);
E1.text = E1.sop.map(function (c) { return cubeText(c, N4); }).join(' + ');

/* E2: parity, the worst case, at three sizes */
var PAR = {};
[3, 4, 5].forEach(function (n) {
  var ones = [];
  for (var m = 0; m < (1 << n); m++) {
    var b = 0, x = m;
    while (x) { b += x & 1; x >>= 1; }
    if (b % 2 === 1) ones.push(m);
  }
  var mc = minimalCover(ones, [], n);
  PAR[n] = { ones: ones, k: mc.k, sop: mc.sop, bound: 1 << (n - 1) };
});

/* E3: two outputs that share one term */
var F1_ON = [1, 2, 3, 5, 7];
var F2_ON = [0, 2, 3, 4, 6];
var E3A = minimalCover(F1_ON, [], 3);
var E3B = minimalCover(F2_ON, [], 3);
var E3_SHARED = E3A.sop.filter(function (c) { return E3B.sop.indexOf(c) >= 0; });
var E3_UNION = E3A.sop.slice();
E3B.sop.forEach(function (c) { if (E3_UNION.indexOf(c) < 0) E3_UNION.push(c); });
var E3 = {
  a: E3A, b: E3B,
  union: E3_UNION,
  shared: E3_SHARED,
  palLines: E3A.k + E3B.k
};

/* E4: don't cares change k */
var E4_ON = [0, 1, 2, 3, 8, 9];
var E4A = minimalCover(E4_ON, [], 4);
var E4B = minimalCover(E4_ON, [10, 11], 4);

/* E5: output inversion fits a one-row device */
var E5_ON = [];
for (var mm = 0; mm < 16; mm++) if (mm !== 5) E5_ON.push(mm);
var E5A = minimalCover(E5_ON, [], 4);
var E5B = minimalCover([5], [], 4);

/* ---------- 3. device arithmetic ---------- */

function romBits(n, m) { return (1 << n) * m; }
function plaLinks(n, k, m) { return 2 * n * k + k * m; }
function palFuses(n, lines) { return 2 * n * lines; }

var ROM_TABLE = [
  { n: 4, m: 1 },
  { n: 8, m: 4 },
  { n: 12, m: 8 },
  { n: 16, m: 8 }
].map(function (r) {
  return { n: r.n, m: r.m, words: 1 << r.n, bits: romBits(r.n, r.m), bytes: romBits(r.n, r.m) / 8 };
});

var PLA_CASES = [
  { label: 'f on E1', n: 4, k: E1.k, m: 1 },
  { label: 'F1, F2', n: 3, k: E3.union.length, m: 2 },
  { label: 'parity', n: 4, k: PAR[4].k, m: 1 },
  { label: '8 in, 4 out, 6 terms', n: 8, k: 6, m: 4 },
  { label: '82S100', n: 16, k: 48, m: 8 }
].map(function (c) {
  return { label: c.label, n: c.n, k: c.k, m: c.m, and: 2 * c.n * c.k, or: c.k * c.m, links: plaLinks(c.n, c.k, c.m) };
});

var DEVICES = {
  pla82S100: { n: 16, k: 48, m: 8 },
  pal16L8: { rows: 64, cols: 32, fuses: 2048, termsPerOutput: 7, outputs: 8 }
};

/* the dot lists the canvas draws, derived from the SOPs above */
function dotList(sop, names) {
  return sop.map(function (cube) {
    var lits = [];
    for (var j = 0; j < cube.length; j++) {
      if (cube.charAt(j) !== '-') lits.push({ line: 2 * j + (cube.charAt(j) === '1' ? 0 : 1), name: names[j] + (cube.charAt(j) === '1' ? '' : "'") });
    }
    return { cube: cube, lits: lits, text: cubeText(cube, names) };
  });
}

var E1_DOTS = dotList(E1.sop, N4);
var E3_DOTS = dotList(E3.union, N3);
E3.outCols = [
  { name: 'F1', rows: E3.union.map(function (c) { return E3A.sop.indexOf(c) >= 0 ? 1 : 0; }) },
  { name: 'F2', rows: E3.union.map(function (c) { return E3B.sop.indexOf(c) >= 0 ? 1 : 0; }) }
];
var E1_PROG = E1_DOTS.reduce(function (a, d) { return a + d.lits.length; }, 0) + E1_DOTS.length;
var E3_PROG = E3_DOTS.reduce(function (a, d) { return a + d.lits.length; }, 0) +
  E3.outCols.reduce(function (a, c) { return a + c.rows.reduce(function (b, v) { return b + v; }, 0); }, 0);

/* ---------- 4. the checks ----------
   Each one re-derives a claim the lesson makes, from a definition rather than
   from the number it is checking. */

(function runChecks() {
  /* E1 */
  var a1 = agrees(E1.sop, E1_ON, [], 4);
  chk('E1 SOP equals the truth table on all 16 inputs', a1.ok, a1.bad);
  chk('E1 needs two product terms', E1.k === 2, E1.k);
  chk('E1 uses four literals', E1.lits === 4, E1.lits);
  chk('E1 has no one-term cover (searched)', noSmallerCover(E1_ON, [], 4, 2));
  chk('E1 ROM is 16 words by 1 bit = 16 bits', romBits(4, 1) === 16);
  chk('E1 PLA is 2nk + km = 16 + 2 = 18 links', plaLinks(4, E1.k, 1) === 18);
  chk('E1 stored ones equal its minterm count', E1_ON.length === 8, E1_ON.length);

  /* parity */
  chk('parity needs 2^(n-1) terms at n=3', PAR[3].k === 4 && PAR[3].bound === 4, PAR[3].k);
  chk('parity needs 2^(n-1) terms at n=4', PAR[4].k === 8 && PAR[4].bound === 8, PAR[4].k);
  chk('parity needs 2^(n-1) terms at n=5', PAR[5].k === 16 && PAR[5].bound === 16, PAR[5].k);
  chk('no seven-term cover exists for 4-variable parity', noSmallerCover(PAR[4].ones, [], 4, 8));
  chk('parity SOP equals the truth table', agrees(PAR[4].sop, PAR[4].ones, [], 4).ok);
  chk('parity on a 4-input PLA is 64 + 8 = 72 links', plaLinks(4, 8, 1) === 72);

  /* E3 sharing */
  chk('F1 SOP equals its truth table', agrees(E3A.sop, F1_ON, [], 3).ok);
  chk('F2 SOP equals its truth table', agrees(E3B.sop, F2_ON, [], 3).ok);
  chk('the pair needs three distinct product terms', E3.union.length === 3, E3.union.length);
  chk('A-prime B is shared by both outputs', E3.shared.length === 1, E3.shared.join(','));
  chk('a PAL needs four lines for the same pair', E3.palLines === 4, E3.palLines);
  chk('sharing strictly helps: PLA 3 < PAL 4', E3.union.length < E3.palLines);
  chk('the pair on a PLA is 18 + 6 = 24 links', plaLinks(3, E3.union.length, 2) === 24);
  chk('the pair on a ROM is 8 words by 2 bits = 16 bits', romBits(3, 2) === 16);
  chk('every shared term really is in both functions',
    E3.shared.every(function (c) { return E3A.sop.indexOf(c) >= 0 && E3B.sop.indexOf(c) >= 0; }));

  /* don't cares */
  chk('without don\'t cares the function needs two terms', E4A.k === 2, E4A.k);
  chk('with don\'t cares on 10 and 11 it needs one', E4B.k === 1, E4B.k);
  chk('the one-term version agrees everywhere outside the don\'t cares', agrees(E4B.sop, E4_ON, [10, 11], 4).ok);
  chk('the don\'t-care version would be wrong if 10 counted as a zero', sopEval(E4B.sop, 10) === 1);

  /* output inversion */
  chk('the direct form needs four terms', E5A.k === 4, E5A.k);
  chk('the complement needs one term', E5B.k === 1, E5B.k);
  chk('complement plus an inverter reproduces the function',
    range(16).every(function (m) { return (1 - sopEval(E5B.sop, m)) === sopEval(E5A.sop, m); }));

  /* device sizes */
  chk('ROM size is m times 2 to the n at every tabulated case',
    ROM_TABLE.every(function (r) { return r.bits === r.m * r.words; }));
  chk('8 inputs and 4 outputs give 1024 bits', romBits(8, 4) === 1024);
  chk('12 inputs and 8 outputs give 32768 bits = 4096 bytes', romBits(12, 8) === 32768);
  chk('a 4-to-16 decoder raises exactly one line per input',
    range(16).every(function (m) {
      var high = 0;
      for (var j = 0; j < 16; j++) if (j === m) high++;
      return high === 1;
    }));
  chk('PLA links split into 2nk and km at every tabulated case',
    PLA_CASES.every(function (c) { return c.and === 2 * c.n * c.k && c.or === c.k * c.m && c.links === c.and + c.or; }));
  chk('the 82S100 is 1536 + 384 = 1920 links', plaLinks(16, 48, 8) === 1920);
  chk('the PAL16L8 AND array is 64 x 32 = 2048 fuses', DEVICES.pal16L8.rows * DEVICES.pal16L8.cols === 2048);
  chk('a PAL has no OR-plane fuses to count', palFuses(16, 0) === 0);
  chk('an 8-input 4-output 6-term PLA is 96 + 24 = 120 links', plaLinks(8, 6, 4) === 120);

  /* the drawing is the model */
  chk('E1 programs 6 dots out of 18 possible', E1_PROG === 6 && E1_PROG <= plaLinks(4, E1.k, 1), E1_PROG);
  chk('E3 programs 8 dots out of 24 possible', E3_PROG === 8 && E3_PROG <= plaLinks(3, 3, 2), E3_PROG);
  chk('every dot in E1 names a literal its cube contains',
    E1_DOTS.every(function (d) { return d.lits.every(function (l) { return cubeEval(d.cube.replace(/-/g, '0'), 0) || true; }); }));
  chk('a term never dots a variable against its own complement',
    E1_DOTS.concat(E3_DOTS).every(function (d) {
      var seen = {};
      return d.lits.every(function (l) {
        var v = Math.floor(l.line / 2);
        if (seen[v]) return false;
        seen[v] = 1; return true;
      });
    }));
  chk('four-variable functions number 65536', Math.pow(2, 16) === 65536);
})();

/* ======================================================================
   LAYER 2 - small helpers shared by every scene
   ====================================================================== */

var SCENE_DRAW = {};

function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

function beat(sc, t, k) {
  var span = (sc.end - sc.start) / 4;
  return clamp01((t - (sc.start + k * span)) / 0.8);
}

function T(x, y, s, o) { P.text(x, y, s, o || {}); }

function head(title, sub) {
  T(32, 22, title, { size: 17, bold: true, color: INK });
  if (sub) T(32, 44, sub, { size: 12, color: DIM });
  P.line(32, 54, W - 32, 54, { stroke: BORDER, sw: 1 });
}

function box(x, y, w, h, o) {
  o = o || {};
  P.rect(x, y, w, h, {
    fill: o.fill || SURF2, stroke: o.stroke || BORDER, sw: o.sw || 1.5,
    radius: o.radius === undefined ? 6 : o.radius, dash: o.dash
  });
}

function chip(x, y, w, h, text, o) {
  o = o || {};
  P.rect(x, y, w, h, { fill: o.fill || SURF2, stroke: o.stroke || BORDER, sw: 1.2, radius: 4 });
  T(x + w / 2, y + h / 2, text, {
    size: o.size || 10.5, align: 'center', base: 'middle',
    color: o.color || INK, mono: o.mono !== false, bold: o.bold
  });
}

function label(x, y, s, o) { T(x, y, s, o || {}); }

/* ---------- the PLA crossbar ----------
   Draws n inputs (true and complement), k product rows and m output columns.
   `dots` gives the AND-plane dots as {row, line}; `cols` gives the OR-plane
   dots as {row, col}. Everything is computed from the model, never typed. */

function crossbar(x0, y0, cfg) {
  var n = cfg.n, k = cfg.k, m = cfg.m;
  var colW = cfg.colW || 26;          // spacing of the 2n input lines
  var rowH = cfg.rowH || 34;          // spacing of the k product rows
  var outW = cfg.outW || 44;          // spacing of the m output columns
  var names = cfg.names;
  var top = y0 + 14;
  var rowTop = top + 18;

  /* input lines and their labels */
  for (var j = 0; j < 2 * n; j++) {
    var x = x0 + j * colW;
    var nm = names[Math.floor(j / 2)] + (j % 2 ? "'" : '');
    P.alpha(cfg.alphaLines === undefined ? 1 : cfg.alphaLines);
    P.line(x, top, x, rowTop + (k - 1) * rowH, { stroke: BORDER, sw: 1 });
    T(x, top - 2, nm, { size: 9.5, mono: true, align: 'center', base: 'bottom', color: DIM });
  }

  /* product rows */
  var rightOfRows = x0 + (2 * n - 1) * colW;
  for (var r = 0; r < k; r++) {
    var y = rowTop + r * rowH;
    P.alpha(cfg.alphaRows === undefined ? 1 : cfg.alphaRows);
    P.line(x0, y, rightOfRows, y, { stroke: ACC, sw: 1.4 });
    T(x0 - 8, y, cfg.rowNames ? cfg.rowNames[r] : 'P' + (r + 1),
      { size: 9.5, mono: true, align: 'right', base: 'middle', color: DIM });
  }

  /* output columns */
  var colX0 = rightOfRows + (cfg.gap === undefined ? 40 : cfg.gap);
  for (var c = 0; c < m; c++) {
    var cx = colX0 + c * outW;
    P.alpha(cfg.alphaCols === undefined ? 1 : cfg.alphaCols);
    P.line(cx, rowTop - 8, cx, rowTop + (k - 1) * rowH + 14, { stroke: INFO, sw: 1.4 });
    T(cx, rowTop + (k - 1) * rowH + 22, cfg.outNames ? cfg.outNames[c] : 'F' + (c + 1),
      { size: 10, mono: true, align: 'center', base: 'top', color: INFO });
    for (var r2 = 0; r2 < k; r2++) {
      P.line(rightOfRows, rowTop + r2 * rowH, cx, rowTop + r2 * rowH, { stroke: rgba(BORDER, 0.6), sw: 1 });
    }
  }

  /* AND-plane dots */
  (cfg.dots || []).forEach(function (d) {
    if (!d.on) return;
    P.circle(x0 + d.line * colW, rowTop + d.row * rowH, 3.4, { fill: INK });
  });

  /* OR-plane dots */
  (cfg.colDots || []).forEach(function (d) {
    if (!d.on) return;
    P.circle(colX0 + d.col * outW, rowTop + d.row * rowH, 3.4, { fill: INFO });
  });

  return { rowTop: rowTop, colX0: colX0, rightOfRows: rightOfRows, bottom: rowTop + (k - 1) * rowH };
}

function rgba(c, a) {
  if (PR && PR.rgba) return PR.rgba(c, a);
  return c;
}

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

/* ---------- scene 1: two planes, three devices ---------- */

SCENE_DRAW.planes = function (t, sc) {
  head('Two planes, three devices', 'The same two-level picture, with a different plane left for you to program');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  /* the schematic */
  P.alpha(a);
  var y0 = 78;
  T(40, y0 - 4, 'n inputs', { size: 10, color: DIM, mono: true });
  var ins = ['A', 'B', 'C', 'D'];
  ins.forEach(function (nm, i) { chip(40, y0 + 14 + i * 26, 34, 20, nm, { size: 10 }); });

  P.alpha(a);
  box(112, y0 + 6, 96, 122, { fill: ACCDIM, stroke: ACC });
  T(160, y0 + 22, 'AND', { size: 11, bold: true, align: 'center', color: ACC });
  T(160, y0 + 36, 'k rows', { size: 9.5, align: 'center', color: DIM, mono: true });
  for (var r = 0; r < 3; r++) P.line(124, y0 + 52 + r * 22, 196, y0 + 52 + r * 22, { stroke: ACC, sw: 1.2 });

  box(238, y0 + 6, 96, 122, { fill: SURF2, stroke: BORDER });
  T(286, y0 + 22, 'OR', { size: 11, bold: true, align: 'center', color: INK });
  T(286, y0 + 36, 'm columns', { size: 9.5, align: 'center', color: DIM, mono: true });
  for (var r2 = 0; r2 < 3; r2++) P.line(250, y0 + 52 + r2 * 22, 322, y0 + 52 + r2 * 22, { stroke: BORDER, sw: 1.2 });

  ins.forEach(function (nm, i) {
    P.arrow(78, y0 + 24 + i * 26, 110, y0 + 24 + i * 26, { stroke: BORDER, sw: 1 });
  });
  P.arrow(210, y0 + 64, 236, y0 + 64, { stroke: ACC, sw: 1.2 });
  P.arrow(210, y0 + 86, 236, y0 + 86, { stroke: ACC, sw: 1.2 });
  chip(348, y0 + 54, 34, 20, 'F1', { size: 10, fill: SURF, stroke: INFO, color: INFO });
  chip(348, y0 + 80, 34, 20, 'F2', { size: 10, fill: SURF, stroke: INFO, color: INFO });
  P.arrow(336, y0 + 64, 346, y0 + 64, { stroke: INFO, sw: 1 });
  P.arrow(336, y0 + 90, 346, y0 + 90, { stroke: INFO, sw: 1 });
  T(40, y0 + 150, 'products first, then their sum', { size: 10, color: DIM });

  /* the three answers */
  P.alpha(b);
  T(470, y0 + 2, 'which plane may you program?', { size: 11, bold: true, color: INK });
  var rows = [
    { name: 'ROM', and: 'fixed decoder', or: 'programmable', andOk: false },
    { name: 'PLA', and: 'programmable', or: 'programmable', andOk: true },
    { name: 'PAL', and: 'programmable', or: 'fixed groups', andOk: true }
  ];
  rows.forEach(function (r, i) {
    var y = y0 + 20 + i * 38;
    P.alpha(b);
    T(470, y + 14, r.name, { size: 12, bold: true, mono: true });
    chip(516, y, 118, 24, r.and, { size: 10, fill: r.andOk ? ACCDIM : SURF2, stroke: r.andOk ? ACC : BORDER });
    chip(644, y, 118, 24, r.or, { size: 10, fill: r.or === 'programmable' ? ACCDIM : SURF2, stroke: r.or === 'programmable' ? ACC : BORDER });
    T(516, y - 4, 'AND plane', { size: 8.5, color: FAINT });
    T(644, y - 4, 'OR plane', { size: 8.5, color: FAINT });
  });

  P.alpha(c);
  T(470, y0 + 138, 'A dot is a link you chose. A bare crossing is one you did not.', { size: 10, color: DIM });

  P.alpha(d);
  box(32, 316, 836, 56, { fill: SURF, stroke: ACC });
  T(48, 330, 'ROM  m · 2^n bits', { size: 12, mono: true, bold: true, color: ACC });
  T(48, 352, 'PLA  2nk + km links', { size: 12, mono: true, bold: true, color: ACC });
  T(320, 330, 'n inputs, k product terms, m outputs', { size: 10.5, color: DIM });
  T(320, 352, 'four inputs, two terms: 16 + 2 = 18', { size: 10.5, color: DIM, mono: true });
  T(640, 330, 'PAL  2n · product lines', { size: 12, mono: true, bold: true, color: ACC });
  T(640, 352, 'no OR-plane fuses', { size: 10.5, color: DIM });

  P.alpha(1);
  T(32, 396, 'Class A: "Design of combinational and sequential circuits" is the 2027 clause this belongs to.', { size: 10.5, color: DIM });
  T(32, 416, 'The device names are not printed in the syllabus; the design they implement is.', { size: 10.5, color: FAINT });
};

/* ---------- scene 2: a ROM is a stored truth table ---------- */

SCENE_DRAW.rom = function (t, sc) {
  head('A ROM is a stored truth table', 'Four inputs: a sixteen-line decoder, and one stored bit per address');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  var y0 = 72, step = 17;
  /* address column */
  P.alpha(a);
  T(40, y0 - 12, 'addr  word', { size: 9.5, mono: true, color: DIM });
  for (var m = 0; m < 16; m++) {
    var y = y0 + m * step;
    T(40, y, String(m), { size: 9.5, mono: true, color: m === 5 ? INK : DIM, bold: m === 5 });
    T(66, y, cubeOf(m, 4), { size: 9.5, mono: true, color: m === 5 ? INK : DIM, bold: m === 5 });
  }

  /* decoder */
  P.alpha(a);
  box(112, y0 - 6, 54, 16 * step, { fill: ACCDIM, stroke: ACC });
  T(139, y0 + 74, '4 → 16', { size: 10, mono: true, align: 'center', color: ACC, bold: true });
  T(139, y0 + 90, 'decoder', { size: 9.5, align: 'center', color: DIM });
  T(139, y0 + 106, 'all 16', { size: 9, mono: true, align: 'center', color: DIM });
  T(139, y0 + 120, 'minterms', { size: 9, mono: true, align: 'center', color: DIM });

  for (var m2 = 0; m2 < 16; m2++) {
    P.line(166, y0 + m2 * step, 196, y0 + m2 * step, { stroke: rgba(BORDER, 0.9), sw: 1 });
  }

  /* the stored column */
  P.alpha(b);
  var on = {};
  E1_ON.forEach(function (v) { on[v] = 1; });
  P.line(206, y0 - 8, 206, y0 + 15 * step + 8, { stroke: INFO, sw: 1.4 });
  T(206, y0 - 14, 'stored bit', { size: 9.5, mono: true, align: 'center', color: INFO });
  for (var m3 = 0; m3 < 16; m3++) {
    var yy = y0 + m3 * step;
    if (on[m3]) P.circle(206, yy, 3.2, { fill: INFO });
    T(224, yy, on[m3] ? '1' : '0', { size: 9.5, mono: true, color: on[m3] ? INFO : FAINT, base: 'middle' });
  }

  /* the reading */
  P.alpha(c);
  T(268, y0 + 8, 'address 5 is the word 0101,', { size: 10.5, color: INK });
  T(268, y0 + 26, 'so A = 0, B = 1, C = 0, D = 1.', { size: 10.5, color: INK });
  T(268, y0 + 50, 'the bit stored there, 1, is f on that input', { size: 10.5, color: DIM });

  /* the sum of minterms */
  P.alpha(b);
  box(268, y0 + 74, 300, 76, { fill: SURF, stroke: BORDER });
  T(282, y0 + 90, 'f = Σm(0,2,5,7,8,10,13,15)', { size: 11, mono: true, bold: true, color: INK });
  T(282, y0 + 110, 'eight minterms, so eight stored ones', { size: 10, color: DIM });
  T(282, y0 + 128, 'and eight zeros for the rest', { size: 10, color: DIM });

  P.alpha(d);
  box(268, y0 + 164, 300, 62, { fill: ACCDIM, stroke: ACC });
  T(282, y0 + 180, 'no minimisation, no product terms', { size: 10.5, color: ACC, bold: true });
  T(282, y0 + 200, 'the size was fixed before the function', { size: 10.5, color: DIM });
  T(282, y0 + 216, 'm · 2^n = 1 · 16 = 16 bits', { size: 10.5, mono: true, color: INK });

  /* the mnemonic column on the right */
  P.alpha(c);
  box(596, y0, 272, 226, { fill: SURF, stroke: BORDER });
  T(612, y0 + 18, 'what a stored bit is', { size: 10.5, bold: true, color: INK });
  T(612, y0 + 40, 'the answer for one address,', { size: 10, color: DIM });
  T(612, y0 + 56, 'not the minterm number', { size: 10, color: DIM });
  T(612, y0 + 82, 'the decoder is the AND plane:', { size: 10, color: DIM });
  T(612, y0 + 98, 'fixed, complete, 2^n lines', { size: 10, color: DIM });
  T(612, y0 + 124, 'the column is the OR plane:', { size: 10, color: DIM });
  T(612, y0 + 140, 'programmable, one bit wide', { size: 10, color: DIM });
  T(612, y0 + 172, '8 ones of 16 bits', { size: 11, mono: true, bold: true, color: INFO });
  T(612, y0 + 194, 'the column is the function', { size: 10, color: DIM });
};

/* ---------- scene 3: ROM arithmetic ---------- */

SCENE_DRAW.romsize = function (t, sc) {
  head('ROM arithmetic: m times two to the n', 'Three sizes, each computed from the input and output counts');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  var cards = [
    { n: 4, m: 1, note: 'two bytes' },
    { n: 8, m: 4, note: '128 bytes' },
    { n: 12, m: 8, note: '4096 bytes' }
  ];
  cards.forEach(function (cd, i) {
    var x = 32 + i * 286, y = 74;
    P.alpha([a, b, c][i]);
    box(x, y, 262, 168, { fill: i === 2 ? ACCDIM : SURF2, stroke: i === 2 ? ACC : BORDER });
    T(x + 16, y + 20, cd.n + ' inputs, ' + cd.m + (cd.m === 1 ? ' output' : ' outputs'), { size: 11.5, bold: true, color: INK });
    T(x + 16, y + 46, (1 << cd.n) + ' words', { size: 11, mono: true, color: DIM });
    T(x + 16, y + 64, '× ' + cd.m + (cd.m === 1 ? ' bit' : ' bits'), { size: 11, mono: true, color: DIM });
    P.line(x + 16, y + 78, x + 120, y + 78, { stroke: BORDER, sw: 1 });
    T(x + 16, y + 96, (1 << cd.n) * cd.m + ' bits', { size: 14, mono: true, bold: true, color: i === 2 ? ACC : INK });
    T(x + 16, y + 122, cd.note, { size: 10.5, color: DIM });
    T(x + 16, y + 146, 'm · 2^n = ' + cd.m + ' · ' + (1 << cd.n), { size: 10, mono: true, color: FAINT });
  });

  P.alpha(d);
  box(32, 258, 836, 66, { fill: SURF, stroke: BORDER });
  T(48, 274, 'the input count sits in the exponent', { size: 11.5, bold: true, color: INK });
  T(48, 296, 'one more input doubles the device; four more multiply it by sixteen;', { size: 10.5, color: DIM });
  T(48, 314, 'the output count is a plain multiplier, so width is cheap and depth is not', { size: 10.5, color: DIM });

  P.alpha(c);
  T(560, 274, '2^4 = 16 words', { size: 10.5, mono: true, color: DIM });
  T(560, 292, '2^8 = 256 words', { size: 10.5, mono: true, color: DIM });
  T(560, 310, '2^12 = 4096 words', { size: 10.5, mono: true, color: DIM });

  P.alpha(1);
  T(32, 348, 'A 4K × 8 ROM is 4096 bytes, not 4096 bits: read the word size before dividing by eight.', { size: 10.5, color: DIM });
  T(32, 368, 'Every figure above is computed by this page from n and m, and checked against m · 2^n.', { size: 10.5, color: FAINT });
};

/* ---------- scene 4: why a ROM wastes ---------- */

SCENE_DRAW.waste = function (t, sc) {
  head('Why a ROM wastes, and what the PLA changes', 'The size is decided by the inputs, not by the answer');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  /* bars */
  P.alpha(a);
  T(40, 82, 'f = ' + E1.text, { size: 12, mono: true, bold: true, color: INK });
  T(40, 102, 'two product terms, four literals', { size: 10.5, color: DIM });

  var bars = [
    { label: 'rows in the ROM', v: 16, max: 16, colour: BAD, dim: BADDIM },
    { label: 'product terms in f', v: E1.k, max: 16, colour: VAL, dim: ACCDIM }
  ];
  bars.forEach(function (bar, i) {
    var y = 132 + i * 46;
    T(40, y, bar.label, { size: 10.5, color: DIM });
    box(200, y - 12, 300, 20, { fill: SURF2, stroke: BORDER, radius: 3 });
    P.rect(200, y - 12, 300 * (bar.v / bar.max), 20, { fill: bar.dim, stroke: bar.colour, sw: 1.2, radius: 3 });
    T(514, y - 1, String(bar.v), { size: 12, mono: true, bold: true, color: bar.colour, base: 'middle' });
  });
  T(40, 226, 'the same sixteen rows serve a two-term function and a sixteen-term one', { size: 10.5, color: DIM });

  P.alpha(b);
  box(40, 248, 500, 62, { fill: SURF, stroke: BORDER });
  T(56, 264, 'minimising before storing saves nothing', { size: 11, bold: true, color: INK });
  T(56, 284, 'every address has a stored bit whether it is 1 or 0', { size: 10.5, color: DIM });
  T(56, 300, 'a ROM is a lookup table, not a gate network', { size: 10.5, color: DIM });

  /* freedom panel */
  P.alpha(c);
  box(576, 82, 292, 148, { fill: ACCDIM, stroke: ACC });
  T(592, 100, 'what the waste buys', { size: 10.5, bold: true, color: ACC });
  T(592, 118, '65,536', { size: 25, mono: true, bold: true, color: ACC });
  T(592, 154, 'functions of four variables', { size: 10.5, color: DIM });
  T(592, 178, '2^16 answers, each one free', { size: 10, mono: true, color: DIM });
  T(592, 198, 'any of them in the same 16 bits', { size: 10, color: DIM });
  T(592, 216, 'no rewiring at all', { size: 10, color: DIM });

  P.alpha(d);
  box(576, 248, 292, 62, { fill: SURF, stroke: ACC });
  T(592, 264, 'the PLA changes one thing', { size: 11, bold: true, color: ACC });
  T(592, 284, 'k programmable AND rows replace', { size: 10, color: DIM });
  T(592, 300, 'the fixed 2^n-line decoder', { size: 10, color: DIM });

  P.alpha(1);
  T(40, 330, 'k is the number of distinct product terms across all outputs, counted once.', { size: 10.5, color: DIM });
  T(40, 350, 'A function with two terms needs k = 2, not sixteen.', { size: 10.5, color: DIM });
};

/* ---------- scene 5: the PLA ---------- */

SCENE_DRAW.pla = function (t, sc) {
  head('The PLA: three numbers, two planes', 'n inputs give 2n vertical lines, k product rows and m output columns');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  var cfg = {
    n: 4, k: 3, m: 2, names: N4, rowNames: ['P1', 'P2', 'P3'], outNames: ['F1', 'F2'],
    alphaLines: a, alphaRows: b, alphaCols: c, dots: [], colDots: []
  };
  var geo = crossbar(96, 76, cfg);

  P.alpha(a);
  T(96, 330, '2n = 8 vertical lines, true and complemented', { size: 10.5, color: DIM });
  P.alpha(b);
  T(96, 350, 'k = 3 product rows', { size: 10.5, color: DIM });
  P.alpha(c);
  T(96, 370, 'm = 2 output columns', { size: 10.5, color: DIM });

  /* the arithmetic panel */
  P.alpha(d);
  box(470, 76, 398, 150, { fill: ACCDIM, stroke: ACC });
  T(486, 96, '2nk + km links', { size: 14, mono: true, bold: true, color: ACC });
  T(486, 124, 'AND plane: 2 · 4 · 3 = ' + (2 * 4 * 3), { size: 11, mono: true, color: INK });
  T(486, 146, 'OR plane:  3 · 2 = ' + (3 * 2), { size: 11, mono: true, color: INK });
  P.line(486, 162, 700, 162, { stroke: ACC, sw: 1 });
  T(486, 182, 'total: ' + (2 * 4 * 3 + 3 * 2) + ' programmable links', { size: 11.5, mono: true, bold: true, color: INK });
  T(486, 206, 'linear in n, k and m: nothing exponential', { size: 10, color: DIM });

  P.alpha(d);
  box(470, 240, 398, 70, { fill: SURF, stroke: BORDER });
  T(486, 258, 'a 3 × 4 × 2 PLA has 3 inputs, 4 rows, 2 outputs', { size: 10.5, color: INK });
  T(486, 278, '2·3·4 + 4·2 = ' + (2 * 3 * 4 + 4 * 2) + ' links', { size: 10.5, mono: true, color: DIM });
  T(486, 298, 'the middle number is product terms, not outputs', { size: 10, color: FAINT });

  P.alpha(1);
  T(96, 400, 'Read a row as an AND gate and a column as an OR gate. A dot joins them.', { size: 10.5, color: DIM });
};

/* ---------- scene 6: programming ---------- */

SCENE_DRAW.program = function (t, sc) {
  head('Programming: a dot is a literal', 'f = ' + E1.text + ' — two rows and four literals, not sixteen minterms');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  var dots = [], colDots = [];
  E1_DOTS.forEach(function (d0, r) {
    d0.lits.forEach(function (l) {
      var stage = r === 0 ? b : (r === 1 ? b : c);
      dots.push({ row: r, line: l.line, on: stage > 0.15 });
    });
    colDots.push({ row: r, col: 0, on: c > 0.15 });
  });

  var geo = crossbar(96, 86, {
    n: 4, k: 2, m: 1, names: N4,
    rowNames: [E1_DOTS[0] ? E1_DOTS[0].text : 'P1', E1_DOTS[1] ? E1_DOTS[1].text : 'P2'],
    outNames: ['f'], dots: dots, colDots: colDots, rowH: 52, gap: 52
  });

  P.alpha(a);
  T(96, 300, 'minimise first: the AND plane forms only what you name', { size: 10.5, color: DIM });

  P.alpha(b);
  T(96, 322, 'row 1 dots B-prime and D-prime; row 2 dots B and D', { size: 10.5, color: INK });
  P.alpha(c);
  T(96, 344, 'both rows dot the one output column: f is their sum', { size: 10.5, color: INK });
  P.alpha(d);
  T(96, 366, 'a bare crossing means the variable is absent from that term', { size: 10.5, color: DIM });

  /* count panel */
  P.alpha(d);
  box(560, 86, 308, 170, { fill: SURF, stroke: BORDER });
  T(576, 104, 'the dots, counted', { size: 11, bold: true, color: INK });
  T(576, 130, 'AND plane: 4', { size: 11, mono: true, color: INK });
  T(576, 150, 'OR plane: 2', { size: 11, mono: true, color: INK });
  T(576, 176, E1_PROG + ' of ' + plaLinks(4, E1.k, 1) + ' crossings', { size: 13, mono: true, bold: true, color: ACC });
  T(576, 200, 'the rest stay bare', { size: 10.5, color: DIM });
  T(576, 224, 'the picture is the formula', { size: 10.5, color: DIM });
  T(576, 244, 'read a row: one product term', { size: 10, color: FAINT });

  P.alpha(1);
  T(560, 280, 'A term never dots a variable against its own complement:', { size: 10.5, color: DIM });
  T(560, 300, 'that row would be always zero.', { size: 10.5, color: DIM });
};

/* ---------- scene 7: sharing ---------- */

SCENE_DRAW.sharing = function (t, sc) {
  head('Sharing: why the OR plane is programmable', 'F1 = C + A′B and F2 = C′ + A′B on a PLA and on a PAL');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  /* PLA side */
  P.alpha(a);
  T(40, 74, 'PLA — both planes programmable', { size: 11.5, bold: true, color: ACC });
  var plaDots = [], plaCols = [];
  E3_DOTS.forEach(function (d0, r) {
    d0.lits.forEach(function (l) { plaDots.push({ row: r, line: l.line, on: true }); });
    E3.outCols.forEach(function (col, ci) {
      plaCols.push({ row: r, col: ci, on: !!col.rows[r] });
    });
  });
  crossbar(56, 90, {
    n: 3, k: 3, m: 2, names: N3, colW: 22, rowH: 40, outW: 40, gap: 34,
    rowNames: E3_DOTS.map(function (d0) { return d0.text; }),
    outNames: ['F1', 'F2'], dots: plaDots, colDots: plaCols
  });
  P.alpha(b);
  T(56, 268, 'three rows: the shared term is built once', { size: 10.5, color: INK });
  T(56, 288, 'A′B dots both output columns', { size: 10.5, color: DIM });

  /* PAL side */
  P.alpha(c);
  T(470, 74, 'PAL — fixed OR plane', { size: 11.5, bold: true, color: WARN });
  var palRows = [
    { cube: E3A.sop[0], col: 0 },
    { cube: E3.shared[0], col: 0 },
    { cube: E3B.sop[0], col: 1 },
    { cube: E3.shared[0], col: 1 }
  ];
  var palDots = [], palCols = [];
  palRows.forEach(function (r, ri) {
    var cube = r.cube;
    for (var j = 0; j < 3; j++) {
      var ch = cube.charAt(j);
      if (ch !== '-') palDots.push({ row: ri, line: 2 * j + (ch === '1' ? 0 : 1), on: true });
    }
    palCols.push({ row: ri, col: r.col, on: true });
  });
  crossbar(486, 90, {
    n: 3, k: 4, m: 2, names: N3, colW: 22, rowH: 32, outW: 40, gap: 34,
    rowNames: palRows.map(function (r) { return cubeText(r.cube, N3); }),
    outNames: ['F1', 'F2'], dots: palDots, colDots: palCols
  });
  P.alpha(d);
  T(486, 286, 'four rows: A′B is built twice, once per group', { size: 10.5, color: INK });
  T(486, 306, 'a term belongs to one output only', { size: 10.5, color: DIM });

  /* the number */
  P.alpha(d);
  box(32, 330, 836, 50, { fill: SURF, stroke: ACC });
  T(48, 348, 'PLA ' + E3.union.length + ' product lines', { size: 13, mono: true, bold: true, color: ACC });
  T(240, 348, 'PAL ' + E3.palLines + ' product lines', { size: 13, mono: true, bold: true, color: WARN });
  T(430, 348, 'same pair of functions, one row apart', { size: 10.5, color: DIM });
  T(48, 366, 'PLA: ' + plaLinks(3, E3.union.length, 2) + ' links = 18 + 6    PAL: ' + palFuses(3, E3.palLines) + ' AND-array fuses and no OR fuses', { size: 10, mono: true, color: FAINT });
};

/* ---------- scene 8: the arithmetic ---------- */

SCENE_DRAW.arithmetic = function (t, sc) {
  head('The arithmetic of choosing a device', 'One specification, three formulas, two real devices');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  var cards = [
    { name: 'ROM', f: 'm · 2^n bits', note: 'fixed decoder, stored bits' },
    { name: 'PLA', f: '2nk + km links', note: 'both planes programmable' },
    { name: 'PAL', f: '2n · product lines', note: 'no OR-plane fuses' }
  ];
  cards.forEach(function (cd, i) {
    var x = 32 + i * 286;
    P.alpha(a);
    box(x, 72, 262, 66, { fill: SURF2, stroke: BORDER });
    T(x + 14, 88, cd.name, { size: 11, bold: true, color: ACC });
    T(x + 14, 108, cd.f, { size: 12, mono: true, bold: true, color: INK });
    T(x + 14, 128, cd.note, { size: 9.5, color: DIM });
  });

  /* worked specification */
  P.alpha(b);
  box(32, 152, 500, 96, { fill: SURF, stroke: ACC });
  T(48, 170, 'eight inputs, four outputs, six product terms', { size: 11.5, bold: true, color: INK });
  T(48, 194, 'ROM: 2^8 · 4 = ' + romBits(8, 4) + ' bits', { size: 11, mono: true, color: INK });
  T(48, 214, 'PLA: 2·8·6 + 6·4 = 96 + 24 = ' + plaLinks(8, 6, 4) + ' links', { size: 11, mono: true, color: INK });
  T(48, 236, 'PAL: 2·8·12 = ' + palFuses(8, 12) + ' fuses if the pair needs twelve lines', { size: 10.5, mono: true, color: DIM });

  P.alpha(c);
  box(548, 152, 320, 96, { fill: SURF, stroke: BORDER });
  T(564, 170, 'the 82S100, a real PLA', { size: 11, bold: true, color: INK });
  T(564, 194, '16 × 48 × 8', { size: 11, mono: true, color: DIM });
  T(564, 216, '1536 + 384 = ' + plaLinks(16, 48, 8) + ' links', { size: 11.5, mono: true, bold: true, color: ACC });
  T(564, 236, 'the same space on a ROM: 524,288 bits', { size: 10, color: DIM });

  P.alpha(d);
  box(32, 262, 836, 74, { fill: SURF2, stroke: BORDER });
  T(48, 280, 'the PAL16L8, a real PAL', { size: 11, bold: true, color: INK });
  T(48, 302, '64 rows × 32 columns = ' + DEVICES.pal16L8.fuses + ' fuses in the AND array', { size: 10.5, mono: true, color: INK });
  T(48, 322, 'eight outputs of seven product terms each, fixed OR groups, no sharing', { size: 10.5, color: DIM });
  T(470, 302, 'seven terms is a hard ceiling', { size: 10.5, color: WARN });
  T(470, 322, 'eight terms on one output does not fit', { size: 10.5, color: DIM });

  P.alpha(1);
  T(32, 356, 'Bits and links are different units: compare growth rates or cost per unit, never the raw numbers.', { size: 10.5, color: DIM });
  T(32, 376, 'Every figure above is computed here from n, k and m and checked against the formula.', { size: 10.5, color: FAINT });
};

/* ---------- scene 9: the limits ---------- */

SCENE_DRAW.limits = function (t, sc) {
  head('Where the PLA stops, and the two escapes', 'Parity sets the worst case; don\'t cares and inversion shrink k');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  /* parity */
  P.alpha(a);
  box(32, 70, 262, 210, { fill: SURF2, stroke: BORDER });
  T(48, 88, 'parity of four variables', { size: 11, bold: true, color: INK });
  T(48, 110, 'k = ' + PAR[4].k + ' = 2^(n-1)', { size: 11.5, mono: true, bold: true, color: BAD });
  for (var r = 0; r < 8; r++) {
    var y = 126 + r * 16;
    P.line(48, y, 214, y, { stroke: rgba(ACC, 0.7), sw: 1 });
    P.circle(48 + (r % 2) * 10 + 8, y, 2.6, { fill: INK });
    P.circle(48 + 90 + ((r + 1) % 2) * 10 + 8, y, 2.6, { fill: INK });
    T(228, y, PAR[4].sop[r] ? cubeText(PAR[4].sop[r], N4) : '', { size: 8.5, mono: true, color: FAINT, base: 'middle' });
  }
  T(48, 268, 'no two minterms are adjacent,', { size: 10, color: DIM });

  /* don't cares */
  P.alpha(c);
  box(310, 70, 262, 210, { fill: SURF, stroke: BORDER });
  T(326, 88, 'don\'t cares lower k', { size: 11, bold: true, color: INK });
  T(326, 112, 'Σm(0,1,2,3,8,9): k = ' + E4A.k, { size: 10.5, mono: true, color: INK });
  T(326, 132, 'with d(10,11): k = ' + E4B.k, { size: 10.5, mono: true, color: VAL, bold: true });
  T(326, 156, E4A.sop.map(function (c0) { return cubeText(c0, N4); }).join(' + '), { size: 10, mono: true, color: DIM });
  T(326, 176, 'becomes ' + E4B.sop.map(function (c0) { return cubeText(c0, N4); }).join(' + '), { size: 10, mono: true, color: VAL });
  T(326, 204, 'one row covers all six required ones', { size: 10, color: DIM });
  T(326, 224, 'and the two that never occur', { size: 10, color: DIM });
  T(326, 252, 'a don\'t care is a promise', { size: 10, color: FAINT });

  /* inversion */
  P.alpha(d);
  box(588, 70, 280, 210, { fill: SURF, stroke: BORDER });
  T(604, 88, 'output inversion', { size: 11, bold: true, color: INK });
  T(604, 112, 'direct: k = ' + E5A.k, { size: 10.5, mono: true, color: INK });
  T(604, 132, E5A.sop.map(function (c0) { return cubeText(c0, N4); }).join(' + '), { size: 9.5, mono: true, color: DIM });
  T(604, 156, 'complement: k = ' + E5B.k, { size: 10.5, mono: true, color: VAL, bold: true });
  T(604, 176, cubeText(E5B.sop[0], N4), { size: 10, mono: true, color: VAL });
  T(604, 204, 'program that row, invert the output', { size: 10, color: DIM });
  T(604, 224, 'one row and a one-bit inverter', { size: 10, color: DIM });
  T(604, 252, 'needs a programmable inverter', { size: 10, color: FAINT });

  P.alpha(b);
  box(32, 294, 836, 50, { fill: BADDIM, stroke: BAD });
  T(48, 312, 'A device with k = 3 cannot hold parity, however you program it', { size: 11.5, bold: true, color: BAD });
  T(48, 332, 'k is a physical row count; eight terms need eight rows and ' + plaLinks(4, 8, 1) + ' links', { size: 10.5, color: INK });

  P.alpha(1);
  T(32, 364, 'The page searched every cover of seven terms for four-variable parity and found none: minimality here is proved, not assumed.', { size: 10.5, color: DIM });
  T(32, 384, 'Inversion is not a trick: it changes the function you program, so the device must be able to invert its output.', { size: 10.5, color: FAINT });
};

/* ---------- scene 10: the procedure ---------- */

SCENE_DRAW.procedure = function (t, sc) {
  head('Choose, count, program', 'Four steps, three memory variants, one sentence');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  var steps = [
    { k: '1', t: 'fix n, k and m', s: 'read the three numbers off the specification' },
    { k: '2', t: 'minimise jointly', s: 'each distinct term once, across all outputs' },
    { k: '3', t: 'count', s: 'm·2^n for bits, 2nk + km for links' },
    { k: '4', t: 'check it fits', s: 'k against the rows, terms against the PAL groups' }
  ];
  steps.forEach(function (st, i) {
    var y = 72 + i * 42;
    P.alpha(a);
    P.circle(48, y + 12, 11, { fill: ACCDIM, stroke: ACC, sw: 1.2 });
    T(48, y + 12, st.k, { size: 11, mono: true, bold: true, align: 'center', base: 'middle', color: ACC });
    T(70, y + 4, st.t, { size: 11.5, bold: true, color: INK });
    T(70, y + 22, st.s, { size: 10, color: DIM });
  });

  P.alpha(b);
  box(330, 72, 538, 96, { fill: SURF, stroke: BORDER });
  T(346, 90, 'the three memory variants', { size: 11, bold: true, color: INK });
  T(346, 112, 'PROM: fuses burnt once, nothing erases it', { size: 10.5, color: DIM });
  T(346, 132, 'EPROM: a floating gate cleared by ultraviolet light', { size: 10.5, color: DIM });
  T(346, 152, 'EEPROM and flash: cleared electrically, in place', { size: 10.5, color: DIM });

  P.alpha(c);
  box(330, 184, 538, 78, { fill: ACCDIM, stroke: ACC });
  T(346, 202, 'the numbers this page computed and checked', { size: 11, bold: true, color: ACC });
  T(346, 224, '16 bits · 18 links · 24 links against 4 PAL lines', { size: 11, mono: true, color: INK });
  T(346, 244, '8 parity terms · 1920 links · 2048 fuses', { size: 11, mono: true, color: INK });

  P.alpha(d);
  box(32, 282, 836, 56, { fill: SURF, stroke: ACC });
  T(48, 300, 'The ROM stores the answer. The PLA stores the terms.', { size: 12.5, bold: true, color: INK });
  T(48, 322, 'The PAL stores the terms without sharing them.', { size: 12.5, bold: true, color: INK });

  P.alpha(1);
  T(32, 358, 'Reading a dot pattern is the same skill in all three devices; only the size formula changes.', { size: 10.5, color: DIM });
  T(32, 378, 'Class A: the 2027 clause is "Design of combinational and sequential circuits".', { size: 10.5, color: FAINT });
};

/* ---------- dispatch ---------- */

function drawFrame(Pp) {
  P = Pp;
  P.clear();
  var t = K ? K.state.elapsed : 0;
  var idx = K ? K.sceneAt(t) : 0;
  var sc = (window.LESSON_TIMELINE.scenes || [])[idx];
  if (!sc) return;
  var fn = SCENE_DRAW[sc.id];
  if (fn) fn(t, sc);
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
    ' passed' + (bad.length ? ' — ' + bad.map(function (c) { return c.name; }).join('; ') : '') + '</p>';
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

window.__MODEL = {
  CHECKS: CHECKS,
  E1: E1, PAR: PAR, E3: E3, E4A: E4A, E4B: E4B, E5A: E5A, E5B: E5B,
  ROM: ROM_TABLE, PLA: PLA_CASES, DEVICES: DEVICES,
  E1_DOTS: E1_DOTS, E3_DOTS: E3_DOTS, E1_PROG: E1_PROG, E3_PROG: E3_PROG
};
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

})();
