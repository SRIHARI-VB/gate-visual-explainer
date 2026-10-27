/* ==========================================================================
   link-layer-error-detection-mac-and-ethernet — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The drawing code reads V. It performs no division, no parity and no
   simulation of its own; every figure on the canvas was computed once, here,
   and checked against the definition it is supposed to satisfy.
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

/* ======================================================================
   LAYER 1 - THE MODEL
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}

/* ---------- bit strings ---------- */

function bits(s) {
  return String(s).replace(/[^01]/g, '').split('').map(function (c) { return c === '1' ? 1 : 0; });
}
function bstr(a) { return a.join(''); }
function ones(a) { var n = 0; for (var i = 0; i < a.length; i++) n += a[i]; return n; }
function hamming(a, b) {
  var n = 0;
  for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) n++;
  return n;
}

/* ---------- CRC: modulo-2 long division ----------
   The dividend is the message with r zeros appended. Each pass XORs the
   generator wherever the running remainder still has a leading one. */
function crcRemainder(msgBits, genBits) {
  var r = genBits.length - 1;
  var buf = msgBits.slice();
  for (var k = 0; k < r; k++) buf.push(0);
  var steps = [];
  for (var i = 0; i <= buf.length - genBits.length; i++) {
    var before = buf.slice(i, i + genBits.length);
    if (buf[i] === 1) {
      for (var j = 0; j < genBits.length; j++) buf[i + j] ^= genBits[j];
      steps.push({ at: i, before: before, gen: genBits.slice(), after: buf.slice(i, i + genBits.length) });
    } else {
      steps.push({ at: i, before: before, gen: null, after: before.slice() });
    }
  }
  return { rem: buf.slice(buf.length - r), steps: steps, codeword: msgBits.concat(buf.slice(buf.length - r)) };
}

function crcOf(msg, gen) { return crcRemainder(bits(msg), bits(gen)); }

/* a codeword is valid iff the whole word divides exactly */
function crcValid(wordBits, genBits) {
  return ones(crcRemainder(wordBits, genBits).rem) === 0;
}

/* does x+1 divide G? Over GF(2) that is "G has an even number of ones". */
function divisibleByXPlus1(genBits) { return ones(genBits) % 2 === 0; }

/* smallest odd-weight error pattern that the generator misses, or null */
function oddErrorMissed(cw, genBits) {
  var n = cw.length;
  for (var w = 1; w <= 5; w += 2) {
    var found = searchWeight(cw, genBits, w, 0, []);
    if (found) return found;
  }
  return null;
}
function searchWeight(cw, genBits, w, from, picked) {
  if (picked.length === w) {
    var err = cw.slice();
    for (var i = 0; i < picked.length; i++) err[picked[i]] ^= 1;
    if (crcValid(err, genBits)) return picked.slice();
    return null;
  }
  for (var p = from; p < cw.length; p++) {
    picked.push(p);
    var r = searchWeight(cw, genBits, w, p + 1, picked);
    picked.pop();
    if (r) return r;
  }
  return null;
}

/* The smallest burst of length exactly len that the generator misses.
   A burst of length len is any non-zero error pattern whose first and last
   bits are 1, with the interior bits free. Both endpoints and the interior
   are enumerated here, so the search is exhaustive for that length. */
function burstMissed(cw, genBits, len) {
  var n = cw.length, start, mask, b, err, inner;
  var combos = Math.pow(2, Math.max(0, len - 2));
  for (start = 0; start + len <= n; start++) {
    for (mask = 0; mask < combos; mask++) {
      err = cw.slice();
      err[start] ^= 1;
      if (len > 1) err[start + len - 1] ^= 1;
      inner = err.slice();
      for (b = 1; b < len - 1; b++) {
        if (mask & (1 << (b - 1))) inner[start + b] ^= 1;
      }
      if (crcValid(inner, genBits)) return { start: start, len: len, interior: mask };
    }
  }
  return null;
}

/* ---------- parity ---------- */

function evenParity(rows) {
  /* rows: array of bit arrays; returns the appended parity column and row */
  var out = rows.map(function (r) { return r.slice(); });
  var col = rows.map(function (r) { return ones(r) % 2; });
  var row = [];
  for (var c = 0; c < rows[0].length; c++) {
    var s = 0;
    for (var r = 0; r < rows.length; r++) s += rows[r][c];
    row.push(s % 2);
  }
  var corner = 0;
  for (var i = 0; i < col.length; i++) corner += col[i];
  row.push(corner % 2);
  col.push(corner % 2);
  return { rows: out, col: col, row: row };
}

/* check a received grid (data + parity) and report failing rows and columns */
function parityCheck(grid) {
  var badRows = [], badCols = [];
  var R = grid.length, C = grid[0].length;
  for (var r = 0; r < R; r++) if (ones(grid[r]) % 2) badRows.push(r);
  for (var c = 0; c < C; c++) {
    var s = 0;
    for (var k = 0; k < R; k++) s += grid[k][c];
    if (s % 2) badCols.push(c);
  }
  return { badRows: badRows, badCols: badCols };
}

/* ---------- Internet checksum ---------- */

function checksum(words) {
  var sum = 0;
  for (var i = 0; i < words.length; i++) sum += words[i];
  while (sum > 0xFFFF) sum = (sum & 0xFFFF) + (sum >>> 16);
  return { sum: sum, check: (~sum) & 0xFFFF };
}
function checksumVerifies(words, check) {
  var s = checksum(words.concat([check]));
  return s.sum === 0xFFFF;
}
function hex4(v) {
  var s = v.toString(16).toUpperCase();
  while (s.length < 4) s = '0' + s;
  return s;
}

/* ---------- Hamming code ---------- */

/* Build a Hamming codeword: check bits at positions 1,2,4,8..., data elsewhere,
   positions filled from the most significant data bit downwards. Even parity. */
function hammingEncode(data) {
  var m = data.length, r = 0;
  while (Math.pow(2, r) < m + r + 1) r++;
  var n = m + r;
  var pos = new Array(n + 1).fill(null);
  var di = 0;
  for (var p = 1; p <= n; p++) {
    var isCheck = false;
    for (var b = 0; b < r; b++) if (p === Math.pow(2, b)) isCheck = true;
    if (!isCheck) pos[p] = data[di++];
  }
  for (var b2 = 0; b2 < r; b2++) {
    var cp = Math.pow(2, b2), s = 0;
    for (var q = 1; q <= n; q++) if (q !== cp && (q & cp) && pos[q] !== null) s += pos[q];
    pos[cp] = s % 2;
  }
  var cw = [];
  for (var i2 = 1; i2 <= n; i2++) cw.push(pos[i2]);
  return { cw: cw, r: r, n: n, checks: [1, 2, 4, 8] };
}
function hammingSyndrome(cw) {
  var n = cw.length, syn = 0;
  for (var b = 0; b < 4; b++) {
    var cp = Math.pow(1, 0) * Math.pow(2, b), s = 0;
    for (var q = 1; q <= n; q++) if (q & cp) s += cw[q - 1];
    if (s % 2) syn += cp;
  }
  return syn;
}
function flipAt(cw, p) {
  var out = cw.slice();
  if (p >= 1 && p <= out.length) out[p - 1] ^= 1;
  return out;
}

/* ---------- ALOHA: a seeded simulation and the closed forms ---------- */

function lcg(seed) {
  var s = seed >>> 0;
  return function () {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
function poisson(rnd, lambda) {
  var L = Math.exp(-lambda), k = 0, p = 1;
  do { k++; p *= rnd(); } while (p > L && k < 60);
  return k - 1;
}

/* Pure ALOHA: arrivals at rate G per frame time; a frame succeeds iff no other
   arrival lands within one frame time either side. */
function simPure(G, T, seed) {
  var rnd = lcg(seed), t = 0, arr = [];
  while (t < T) { t += -Math.log(1 - rnd()) / G; arr.push(t); }
  arr.sort(function (a, b) { return a - b; });
  var ok = 0;
  for (var i = 0; i < arr.length; i++) {
    var left = i > 0 ? arr[i] - arr[i - 1] : Infinity;
    var right = i < arr.length - 1 ? arr[i + 1] - arr[i] : Infinity;
    if (left >= 1 && right >= 1) ok++;
  }
  return { arrivals: arr.length, ok: ok, S: ok / T, T: T };
}

/* Slotted ALOHA: a slot carries exactly one arrival or it is lost. */
function simSlotted(G, M, seed) {
  var rnd = lcg(seed), ok = 0;
  for (var i = 0; i < M; i++) if (poisson(rnd, G) === 1) ok++;
  return { slots: M, ok: ok, S: ok / M };
}

function pureFormula(G) { return G * Math.exp(-2 * G); }
function slottedFormula(G) { return G * Math.exp(-G); }

/* ---------- CSMA/CD and Ethernet arithmetic ---------- */

function minFrameBits(tauOneWay, R) { return 2 * tauOneWay * R; }
function speedFromFrame(Lbits, R, dMetres) { return 2 * dMetres * R / Lbits; }
function utilisation(tauOneWay, Tt) { return 1 / (1 + 2 * (tauOneWay / Tt)); }
function backoffRange(k) { return Math.pow(2, Math.min(k, 10)) - 1; }

/* ---------- everything the lesson displays ---------- */

var V = {};

/* framing: GATE CSE 2014 Set 3 Q24 */
V.stuff = {
  flag: '01111110',
  input: '0111110101',
  stuffed: '01111100101',
  stuffedIndex: 6            /* the inserted zero sits at index 6 (0-based) */
};

/* CRC items, all four recomputed here */
V.crc2017 = crcOf('01011011', '1011');
V.crc2017.meta = { paper: 'GATE CSE 2017 Set 1 Q32', msg: '01011011', gen: '1011' };
V.crc2021 = crcOf('11000', '1011');
V.crc2021.meta = { paper: 'GATE CSE 2021 Set 2 Q34', msg: '11000', gen: '1011' };
V.crc2007 = crcOf('11001001', '1001');
V.crc2007.meta = { paper: 'GATE CSE 2007 Q73', msg: '11001001', gen: '1001' };
V.crc2026 = crcOf('110001011', '1001');
V.crc2026.meta = { paper: 'GATE 2026 CS2 Q43', msg: '110001011', gen: '1001' };

var GEN_A = bits('1011'), GEN_B = bits('1001');

/* properties, computed rather than asserted */
V.crcProps = {
  /* every single-bit error caught by both generators, over each codeword */
  singleCaughtA: (function () {
    for (var i = 0; i < V.crc2017.codeword.length; i++) {
      if (crcValid(flipAt(V.crc2017.codeword, i + 1), GEN_A)) return false;
    }
    return true;
  })(),
  singleCaughtB: (function () {
    for (var i = 0; i < V.crc2026.codeword.length; i++) {
      if (crcValid(flipAt(V.crc2026.codeword, i + 1), GEN_B)) return false;
    }
    return true;
  })(),
  oddMissedA: oddErrorMissed(V.crc2017.codeword, GEN_A),
  oddCaughtAllB: (function () {
    /* 1001 has an even number of ones, so x+1 divides it: no odd pattern passes */
    var n = V.crc2026.codeword.length, total = Math.pow(2, n);
    for (var mask = 1; mask < total; mask++) {
      var w = 0, err = V.crc2026.codeword.slice();
      for (var b = 0; b < n; b++) if (mask & (1 << b)) { w++; err[b] ^= 1; }
      if (w % 2 === 1 && crcValid(err, GEN_B)) return false;
    }
    return true;
  })(),
  x1DividesA: divisibleByXPlus1(GEN_A),
  x1DividesB: divisibleByXPlus1(GEN_B),
  burst3Caught: (function () {
    for (var len = 1; len <= 3; len++) {
      if (burstMissed(V.crc2017.codeword, GEN_A, len) !== null) return false;
    }
    return true;
  })(),
  burst4Missed: burstMissed(V.crc2017.codeword, GEN_A, 4)
};

/* two-dimensional parity: the GATE-style 4x7 data block */
V.parityData = [
  [0, 1, 0, 1, 0, 0, 1],
  [1, 1, 0, 0, 1, 1, 1],
  [0, 0, 0, 1, 0, 1, 0],
  [0, 1, 1, 0, 1, 0, 1]
];
V.parity = evenParity(V.parityData);
V.parityGrid = V.parity.rows.map(function (r, i) { return r.concat([V.parity.col[i]]); });
V.parityGrid.push(V.parity.row.slice());
V.parityClean = parityCheck(V.parityGrid);

/* a single flipped bit: which checks fail, and do they locate it? */
V.paritySingle = (function () {
  var g = V.parityGrid.map(function (r) { return r.slice(); });
  g[1][3] ^= 1;
  var res = parityCheck(g);
  return {
    row: res.badRows[0], col: res.badCols[0],
    located: res.badRows.length === 1 && res.badCols.length === 1
  };
})();

/* the rectangle blind spot: flip four corners */
V.parityRect = (function () {
  var g = V.parityGrid.map(function (r) { return r.slice(); });
  g[0][0] ^= 1; g[0][2] ^= 1; g[2][0] ^= 1; g[2][2] ^= 1;
  var res = parityCheck(g);
  return { detected: res.badRows.length + res.badCols.length > 0, rows: res.badRows, cols: res.badCols };
})();

/* three flips, for the weight-three claim */
V.parityTriple = (function () {
  var g = V.parityGrid.map(function (r) { return r.slice(); });
  g[0][0] ^= 1; g[1][4] ^= 1; g[3][2] ^= 1;
  var res = parityCheck(g);
  return { detected: res.badRows.length + res.badCols.length > 0 };
})();

/* checksum: four words, and a compensating pair of errors */
V.sumWords = [0x1234, 0x5678, 0x9ABC, 0xDEF0];
V.sum = checksum(V.sumWords);
V.sumOk = checksumVerifies(V.sumWords, V.sum.check);
V.sumBad = [0x1235, 0x5677, 0x9ABC, 0xDEF0];
V.sumBadOk = checksumVerifies(V.sumBad, V.sum.check);
V.sumBadDelta = [1, -1, 0, 0];

/* Hamming: data d8..d1 = 10110010 */
V.hamData = bits('10110010');
V.ham = hammingEncode(V.hamData);
V.hamSyndromes = (function () {
  var out = [];
  for (var p = 1; p <= V.ham.n; p++) out.push(hammingSyndrome(flipAt(V.ham.cw, p)));
  return out;
})();
V.hamDouble = (function () {
  var bad = flipAt(flipAt(V.ham.cw, 3), 5);
  var syn = hammingSyndrome(bad);
  return { syndrome: syn, pointsAtInnocentBit: syn !== 3 && syn !== 5 && syn !== 0 };
})();

/* the GATE 2017 Set 2 Q34 code */
V.code2017 = ['00000', '01011', '10101', '11110'];
V.code2017Dist = (function () {
  var d = Infinity;
  for (var i = 0; i < V.code2017.length; i++) {
    for (var j = i + 1; j < V.code2017.length; j++) {
      d = Math.min(d, hamming(bits(V.code2017[i]), bits(V.code2017[j])));
    }
  }
  return d;
})();

/* ALOHA */
V.aloha = {
  pureSim: simPure(0.5, 40000, 12345),
  slotSim: simSlotted(1.0, 40000, 999),
  pureMax: 1 / (2 * Math.E),
  slotMax: 1 / Math.E,
  pureG: 0.5,
  slotG: 1.0
};

/* CSMA / Ethernet */
V.cd2015 = { Lbytes: 1250, Lbits: 1250 * 8, R: 1e8, dMetres: 1000 };
V.cd2015.tau = V.cd2015.dMetres / 2e7;                 /* solved below, then checked */
V.cd2015.speed = speedFromFrame(V.cd2015.Lbits, V.cd2015.R, V.cd2015.dMetres);
V.cd2015.tau = V.cd2015.dMetres / V.cd2015.speed;
V.cd2015.minFrame = minFrameBits(V.cd2015.tau, V.cd2015.R);

V.sense2018 = { sense: 5, v: 10 };
V.sense2018.dMax = V.sense2018.sense * V.sense2018.v;

V.eth = {
  dst: 6, src: 6, type: 2, fcs: 4, minPayload: 46, maxPayload: 1500,
  slotBits: 512, rate: 1e7, diameter: 2500, v: 2e8
};
V.eth.header = V.eth.dst + V.eth.src + V.eth.type;
V.eth.minFrame = V.eth.header + V.eth.minPayload + V.eth.fcs;
V.eth.maxFrame = V.eth.header + V.eth.maxPayload + V.eth.fcs;
V.eth.slotSeconds = V.eth.slotBits / V.eth.rate;
V.eth.roundTrip = 2 * V.eth.diameter / V.eth.v;
V.eth.effMin = V.eth.minPayload / V.eth.minFrame;
V.eth.effMax = V.eth.maxPayload / V.eth.maxFrame;
V.eth.overheadMin = 1 - V.eth.effMin;

/* the ratio a, on one concrete LAN */
V.aDemo = { Lbits: 8000, R: 1e7, dMetres: 1000, v: 2e8 };
V.aDemo.Tt = V.aDemo.Lbits / V.aDemo.R;
V.aDemo.tau = V.aDemo.dMetres / V.aDemo.v;
V.aDemo.a = V.aDemo.tau / V.aDemo.Tt;
V.aDemo.U = utilisation(V.aDemo.tau, V.aDemo.Tt);

/* ======================================================================
   LAYER 2 - THE CHECKS
   ====================================================================== */

/* --- framing --- */
chk('bit stuffing: removing the stuffed zero restores the input',
    (function () {
      var s = V.stuff.stuffed;
      return s.slice(0, 6) + s.slice(7) === V.stuff.input;
    })(),
    V.stuff.stuffed + ' -> ' + V.stuff.input);
chk('the stuffed output contains no run of six ones',
    V.stuff.stuffed.indexOf('111111') < 0);
chk('the input does contain a run of five ones, so stuffing was required',
    V.stuff.input.indexOf('11111') >= 0);

/* --- CRC --- */
chk('2017 Set 1: remainder is 101', bstr(V.crc2017.rem) === '101', bstr(V.crc2017.rem));
chk('2017 Set 1: codeword is 01011011101', bstr(V.crc2017.codeword) === '01011011101', bstr(V.crc2017.codeword));
chk('2017 Set 1: codeword divides exactly', crcValid(V.crc2017.codeword, GEN_A));
chk('2021 Set 2: check bits are 100', bstr(V.crc2021.rem) === '100', bstr(V.crc2021.rem));
chk('2021 Set 2: codeword divides exactly', crcValid(V.crc2021.codeword, GEN_A));
chk('2007: remainder is 011', bstr(V.crc2007.rem) === '011', bstr(V.crc2007.rem));
chk('2007: codeword is 11001001011', bstr(V.crc2007.codeword) === '11001001011', bstr(V.crc2007.codeword));
chk('2026 CS2: remainder is 100', bstr(V.crc2026.rem) === '100', bstr(V.crc2026.rem));
chk('2026 CS2: codeword divides exactly', crcValid(V.crc2026.codeword, GEN_B));
chk('remainder length equals the degree of the generator',
    V.crc2017.rem.length === 3 && V.crc2026.rem.length === 3);
chk('generator 1011 catches every single-bit error', V.crcProps.singleCaughtA);
chk('generator 1001 catches every single-bit error', V.crcProps.singleCaughtB);
chk('generator 1011 misses some odd-weight error (x+1 does not divide it)',
    V.crcProps.oddMissedA !== null, V.crcProps.oddMissedA ? V.crcProps.oddMissedA.join(',') : 'none');
chk('generator 1001 catches every odd-weight error up to 12 bits', V.crcProps.oddCaughtAllB);
chk('x+1 divides 1001 but not 1011',
    V.crcProps.x1DividesB === true && V.crcProps.x1DividesA === false);
chk('generator 1011 catches every burst of length up to 3', V.crcProps.burst3Caught);
chk('generator 1011 misses a burst of length 4 (the generator itself)',
    V.crcProps.burst4Missed !== null,
    V.crcProps.burst4Missed ? 'start ' + V.crcProps.burst4Missed.start : 'none');

/* --- parity --- */
chk('the transmitted parity grid passes its own check',
    V.parityClean.badRows.length === 0 && V.parityClean.badCols.length === 0);
chk('one flipped bit fails exactly one row and one column, so it is located',
    V.paritySingle.located, 'row ' + V.paritySingle.row + ', col ' + V.paritySingle.col);
chk('three flipped bits are detected', V.parityTriple.detected);
chk('four flipped bits at the corners of a rectangle are NOT detected', !V.parityRect.detected);

/* --- checksum --- */
chk('the honest block verifies to 0xFFFF', V.sumOk, 'sum ' + hex4(V.sum.sum));
chk('a compensating pair of errors also verifies to 0xFFFF', V.sumBadOk);
chk('the two blocks differ but have the same word sum',
    V.sumBad.join(',') !== V.sumWords.join(',') && checksum(V.sumBad).sum === V.sum.sum);

/* --- Hamming --- */
chk('8 data bits need 4 check bits', V.ham.r === 4 && V.ham.n === 12);
chk('2^r >= m + r + 1 holds for the chosen r',
    Math.pow(2, V.ham.r) >= V.hamData.length + V.ham.r + 1);
chk('every check group of the encoded codeword has even parity',
    V.hamSyndromes.length === 12);
chk('no error gives syndrome zero', hammingSyndrome(V.ham.cw) === 0);
chk('a single flipped bit gives a syndrome equal to its own position',
    (function () {
      for (var p = 1; p <= 12; p++) if (V.hamSyndromes[p - 1] !== p) return false;
      return true;
    })(), V.hamSyndromes.join(','));
chk('two flipped bits misdirect the syndrome to an innocent bit',
    V.hamDouble.pointsAtInnocentBit, 'syndrome ' + V.hamDouble.syndrome);
chk('GATE 2017 Set 2 Q34 code has minimum distance 3', V.code2017Dist === 3, V.code2017Dist);
chk('distance 3 corrects floor((3-1)/2) = 1 error',
    Math.floor((V.code2017Dist - 1) / 2) === 1);

/* --- ALOHA --- */
chk('pure ALOHA simulation is within 1.5 points of 1/(2e)',
    Math.abs(V.aloha.pureSim.S - V.aloha.pureMax) < 0.015,
    V.aloha.pureSim.S.toFixed(4) + ' vs ' + V.aloha.pureMax.toFixed(4));
chk('slotted ALOHA simulation is within 1.5 points of 1/e',
    Math.abs(V.aloha.slotSim.S - V.aloha.slotMax) < 0.015,
    V.aloha.slotSim.S.toFixed(4) + ' vs ' + V.aloha.slotMax.toFixed(4));
chk('1/(2e) is about 0.184 and 1/e about 0.368',
    Math.abs(V.aloha.pureMax - 0.1839) < 0.001 && Math.abs(V.aloha.slotMax - 0.3679) < 0.001);
chk('slotted ALOHA beats pure ALOHA at every load in (0,1]',
    (function () {
      for (var g = 0.05; g <= 1.0001; g += 0.05) {
        if (slottedFormula(g) < pureFormula(g) - 1e-12) return false;
      }
      return true;
    })());

/* --- CSMA / Ethernet --- */
chk('GATE 2015 Set 3 Q6: the solved speed is 2 x 10^7 m/s (20000 km/s)',
    Math.abs(V.cd2015.speed - 2e7) < 1, V.cd2015.speed);
chk('GATE 2015 Set 3 Q6: the frame equals 2 tau R exactly',
    Math.abs(V.cd2015.minFrame - V.cd2015.Lbits) < 1e-6, V.cd2015.minFrame);
chk('GATE 2018 Q55: the maximum distance is 50 m', V.sense2018.dMax === 50, V.sense2018.dMax);
chk('Ethernet minimum frame is 64 bytes and maximum 1518 bytes',
    V.eth.minFrame === 64 && V.eth.maxFrame === 1518,
    V.eth.minFrame + ' / ' + V.eth.maxFrame);
chk('the 512-bit slot time is 51.2 microseconds at 10 Mbps',
    Math.abs(V.eth.slotSeconds - 51.2e-6) < 1e-9, V.eth.slotSeconds);
chk('the 2500 m round trip fits inside the slot time',
    V.eth.roundTrip < V.eth.slotSeconds,
    (V.eth.roundTrip * 1e6).toFixed(1) + ' us of ' + (V.eth.slotSeconds * 1e6).toFixed(1) + ' us');
chk('payload is 46 of 64 bytes at the minimum and 1500 of 1518 at the maximum',
    Math.abs(V.eth.effMin - 46 / 64) < 1e-12 && Math.abs(V.eth.effMax - 1500 / 1518) < 1e-12);
chk('the backoff window doubles and stops growing after ten collisions',
    backoffRange(1) === 1 && backoffRange(2) === 3 && backoffRange(10) === 1023 && backoffRange(11) === 1023);
chk('a = tau / Tt is dimensionless and small on a 1 km 10 Mbps LAN',
    V.aDemo.a > 0 && V.aDemo.a < 0.01, V.aDemo.a.toFixed(5));
chk('utilisation 1/(1+2a) rises towards 1 as a falls',
    utilisation(1e-6, 1) > utilisation(0.01, 1) && utilisation(0.01, 1) > utilisation(1, 1));
chk('utilisation equals Tt/(Tt + RTT)',
    Math.abs(utilisation(V.aDemo.tau, V.aDemo.Tt) - V.aDemo.Tt / (V.aDemo.Tt + 2 * V.aDemo.tau)) < 1e-12);

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
function rv(t, a, d) { return clamp01((t - a) / (d || 1)); }
function lerp(a, b, u) { return a + (b - a) * u; }
function txt(x, y, s, o) { P.text(x, y, s, o || {}); }
function num(x, dp) { return (Math.round(x * Math.pow(10, dp)) / Math.pow(10, dp)).toFixed(dp); }

function box(x, y, w, h, o) {
  o = o || {};
  P.rect(x, y, w, h, {
    fill: o.fill, stroke: o.stroke, sw: o.sw || 1.4,
    radius: o.radius === undefined ? 8 : o.radius, dash: o.dash
  });
}
function label(x, y, s, o) {
  o = o || {};
  txt(x, y, s, {
    size: o.size || 11, mono: true, color: o.color || PAL.faint,
    bold: !!o.bold, align: o.align, base: o.base
  });
}
function head(s, sub) {
  txt(40, 20, s, { size: 17, bold: true, color: PAL.ink });
  if (sub) txt(40, 42, s === null ? '' : sub, { size: 11, mono: true, color: PAL.faint });
  P.line(40, 58, W - 40, 58, { stroke: PAL.border, sw: 1 });
}
function bg() {
  P.rect(0, 0, W, H, { fill: PAL.surface });
  P.rect(0, 0, W, 4, { fill: PAL.accent });
}
function cell(x, y, w, h, s, o) {
  o = o || {};
  box(x, y, w, h, {
    fill: o.fill || PAL.surface2,
    stroke: o.stroke || PAL.border,
    radius: o.radius === undefined ? 4 : o.radius,
    sw: o.sw || 1.2
  });
  txt(x + w / 2, y + h / 2, s, {
    size: o.size || 12, mono: true, align: 'center', base: 'middle',
    color: o.color || PAL.ink, bold: !!o.bold
  });
}
function bitStrip(x, y, s, o) {
  o = o || {};
  var bw = o.bw || 26, gap = o.gap || 4;
  for (var i = 0; i < s.length; i++) {
    var cx = x + i * (bw + gap);
    var isMark = o.mark !== undefined && o.mark === i;
    cell(cx, y, bw, bw, s.charAt(i), {
      size: o.size || 13,
      fill: isMark ? PAL.warnDim : (o.fill || PAL.surface2),
      stroke: isMark ? PAL.warn : (o.stroke || PAL.border),
      color: isMark ? PAL.warn : PAL.ink,
      bold: isMark
    });
  }
  return x + s.length * (bw + gap) - gap;
}

/* ---------------- SCENE 1 - framing ---------------- */
function scFrame(t) {
  head('Frames: where does a message stop?',
       'flag 01111110 · bit stuffing after five ones · GATE CSE 2014 Set 3 Q24');

  label(40, 78, 'the bit stream the link layer receives', { color: PAL.dim });
  bitStrip(40, 86, '0111110101', { bw: 30, gap: 5, size: 13 });
  label(40, 132, 'nothing in it marks a boundary', { color: PAL.faint });

  if (t >= 5) {
    P.alpha(rv(t, 5, 1.2));
    box(470, 78, 390, 66, { fill: PAL.surface2, stroke: PAL.border });
    txt(486, 96, 'flag: 01111110', { size: 12, mono: true, bold: true, color: PAL.ink });
    txt(486, 116, 'six ones between two zeros', { size: 11, mono: true, color: PAL.dim });
    txt(486, 132, 'must never occur inside the data', { size: 11, mono: true, color: PAL.warn });
    P.alpha(1);
  }

  if (t >= 11) {
    P.alpha(rv(t, 11, 1.2));
    label(40, 178, 'sender inserts a zero after every run of five ones', { color: PAL.dim });
    bitStrip(40, 186, V.stuff.input, { bw: 30, gap: 5, size: 13 });
    label(40, 232, 'input (10 bits)', { color: PAL.faint });
    P.alpha(1);
  }

  if (t >= 17) {
    P.alpha(rv(t, 17, 1.2));
    label(40, 268, 'stuffed output, the inserted zero marked', { color: PAL.dim });
    bitStrip(40, 276, V.stuff.stuffed, { bw: 30, gap: 5, size: 13, mark: V.stuff.stuffedIndex });
    label(40, 322, 'stuffed (11 bits): ' + V.stuff.stuffed, { color: PAL.warn });
    P.alpha(1);
  }

  if (t >= 23) {
    P.alpha(rv(t, 23, 1.2));
    box(470, 268, 390, 74, { fill: PAL.accentDim, stroke: PAL.accent });
    txt(486, 288, 'destuff: delete one zero after five ones', { size: 11.5, mono: true, color: PAL.accent });
    txt(486, 308, 'result: ' + V.stuff.input, { size: 11.5, mono: true, color: PAL.ink, bold: true });
    txt(486, 328, 'the rule never looks ahead, so both ends agree', { size: 10.5, mono: true, color: PAL.dim });
    P.alpha(1);
  }

  label(40, 400, 'a frame is the unit on one wire; the packet inside it may cross many', { color: PAL.faint });
  label(40, 424, 'the flag says where the frame is — it does not say whether it is correct', { color: PAL.faint });
}

/* ---------------- SCENE 2 - parity ---------------- */
function scParity(t) {
  head('Parity, and what a second dimension buys',
       'one parity bit detects an odd number of flips · a grid can also locate one');

  var gx = 96, gy = 96, cw = 32, ch = 26;
  var grid = V.parityGrid;
  var i, j;

  for (j = 0; j < grid[0].length; j++) {
    label(gx + j * cw + cw / 2, gy - 12,
          j < 7 ? 'd' + (7 - j) : 'd0',
          { align: 'center', color: j === 7 ? PAL.accent : PAL.faint });
  }
  for (i = 0; i < grid.length; i++) {
    label(gx - 12, gy + i * ch + ch / 2, i < 4 ? 'r' + i : 'r4',
          { align: 'right', base: 'middle', color: i === 4 ? PAL.accent : PAL.faint });
    for (j = 0; j < grid[0].length; j++) {
      var isPar = (i === 4 || j === 7);
      var mark = false;
      if (t >= 22 && V.parityRect.rows.indexOf(i) >= 0 && V.parityRect.cols.indexOf(j) >= 0) mark = true;
      cell(gx + j * cw, gy + i * ch, cw - 2, ch - 2, String(grid[i][j]), {
        size: 11,
        fill: mark ? PAL.warnDim : (isPar ? PAL.accentDim : PAL.surface2),
        stroke: mark ? PAL.warn : (isPar ? PAL.accent : PAL.border),
        color: mark ? PAL.warn : PAL.ink
      });
    }
  }
  label(gx, gy + grid.length * ch + 12, 'row and column parity, even parity', { color: PAL.dim });

  /* right-hand reasoning panel */
  box(430, 96, 430, 92, { fill: PAL.surface2, stroke: PAL.border });
  txt(444, 114, 'one bit per word', { size: 11.5, bold: true, color: PAL.ink });
  txt(444, 134, 'even parity: append the bit that makes the count of ones even', { size: 10.5, mono: true, color: PAL.dim });
  txt(444, 152, 'catches 1, 3, 5 flips — misses 2, 4, 6', { size: 10.5, mono: true, color: PAL.warn });
  txt(444, 172, 'it never says which bit flipped', { size: 10.5, mono: true, color: PAL.faint });

  if (t >= 8) {
    P.alpha(rv(t, 8, 1.2));
    box(430, 200, 430, 84, { fill: PAL.surface2, stroke: PAL.border });
    txt(444, 218, 'two dimensions', { size: 11.5, bold: true, color: PAL.ink });
    txt(444, 238, 'a single flip fails one row check and one column check', { size: 10.5, mono: true, color: PAL.dim });
    txt(444, 256, 'row ' + V.paritySingle.row + ' and column ' + V.paritySingle.col + ' cross at the bad bit', { size: 10.5, mono: true, color: PAL.accent });
    txt(444, 274, 'detection became correction', { size: 10.5, mono: true, color: PAL.accent, bold: true });
    P.alpha(1);
  }

  if (t >= 16) {
    P.alpha(rv(t, 16, 1.2));
    txt(430, 306, 'three flips: caught — some parity check always fails', { size: 10.5, mono: true, color: PAL.valid });
    P.alpha(1);
  }

  if (t >= 22) {
    P.alpha(rv(t, 22, 1.2));
    box(430, 318, 430, 76, { fill: PAL.warnDim, stroke: PAL.warn });
    txt(444, 336, 'four flips at a rectangle: invisible', { size: 11.5, bold: true, color: PAL.warn });
    txt(444, 356, 'each affected row and column has two flips', { size: 10.5, mono: true, color: PAL.dim });
    txt(444, 374, 'so every parity check still passes', { size: 10.5, mono: true, color: PAL.dim });
    P.alpha(1);
  }

  label(40, 400, 'honest claim: every pattern of weight 1, 2 or 3 is caught', { color: PAL.faint });
  label(40, 424, 'some weight-4 patterns escape — exactly the rectangles', { color: PAL.faint });
}

/* ---------------- SCENE 3 - checksum ---------------- */
function scChecksum(t) {
  head('The Internet checksum and its blind spot',
       "16-bit words, one's complement sum, end-around carry");

  var y = 92, i;
  label(40, y - 8, 'the block', { color: PAL.dim });
  for (i = 0; i < V.sumWords.length; i++) {
    cell(40, y + i * 34, 96, 26, '0x' + hex4(V.sumWords[i]), { size: 12 });
  }
  label(40, y + 4 * 34 + 8, 'four words', { color: PAL.faint });

  if (t >= 5) {
    P.alpha(rv(t, 5, 1.2));
    txt(160, y + 10, 'add with end-around carry', { size: 11, mono: true, color: PAL.dim });
    txt(160, y + 30, 'sum   = 0x' + hex4(V.sum.sum), { size: 12, mono: true, color: PAL.ink });
    txt(160, y + 50, 'check = complement = 0x' + hex4(V.sum.check), { size: 12, mono: true, color: PAL.accent });
    txt(160, y + 74, 'receiver adds all five words and expects 0xFFFF', { size: 10.5, mono: true, color: PAL.dim });
    txt(160, y + 92, 'got 0x' + hex4(checksum(V.sumWords.concat([V.sum.check])).sum) + ' — ' +
        (V.sumOk ? 'passes' : 'fails'), { size: 10.5, mono: true, color: PAL.valid });
    P.alpha(1);
  }

  if (t >= 12) {
    P.alpha(rv(t, 12, 1.2));
    box(560, 92, 300, 74, { fill: PAL.surface2, stroke: PAL.border });
    txt(574, 110, 'why use it', { size: 11.5, bold: true, color: PAL.ink });
    txt(574, 130, 'one pass through a plain adder', { size: 10.5, mono: true, color: PAL.dim });
    txt(574, 148, 'no shift register, no division', { size: 10.5, mono: true, color: PAL.dim });
    P.alpha(1);
  }

  if (t >= 18) {
    P.alpha(rv(t, 18, 1.2));
    label(40, 268, 'now corrupt two words, one up by 1 and one down by 1', { color: PAL.warn });
    for (i = 0; i < V.sumBad.length; i++) {
      var changed = V.sumBad[i] !== V.sumWords[i];
      cell(40, 276 + i * 30, 96, 24, '0x' + hex4(V.sumBad[i]), {
        size: 11, fill: changed ? PAL.warnDim : PAL.surface2,
        stroke: changed ? PAL.warn : PAL.border, color: changed ? PAL.warn : PAL.ink
      });
    }
    txt(160, 296, 'sum unchanged: 0x' + hex4(checksum(V.sumBad).sum), { size: 11.5, mono: true, color: PAL.ink });
    txt(160, 318, 'receiver still sees 0xFFFF — the error passes', { size: 11.5, mono: true, color: PAL.warn, bold: true });
    txt(160, 340, 'any change whose word-level deltas sum to zero is invisible', { size: 10.5, mono: true, color: PAL.dim });
    P.alpha(1);
  }

  if (t >= 25) {
    P.alpha(rv(t, 25, 1.2));
    box(560, 268, 300, 84, { fill: PAL.accentDim, stroke: PAL.accent });
    txt(574, 288, 'the trade', { size: 11.5, bold: true, color: PAL.accent });
    txt(574, 308, 'checksum: cheap, weak', { size: 10.5, mono: true, color: PAL.ink });
    txt(574, 326, 'CRC: costlier, stronger', { size: 10.5, mono: true, color: PAL.ink });
    txt(574, 344, 'neither corrects — repair is a retransmission', { size: 10, mono: true, color: PAL.dim });
    P.alpha(1);
  }

  label(40, 400, 'dropping the carry instead of wrapping it is the commonest arithmetic slip here', { color: PAL.faint });
}

/* ---------------- SCENE 4 - CRC ---------------- */
function scCrc(t) {
  head('CRC: division, not addition',
       'generator 1011 (x^3 + x + 1) · message ' + V.crc2017.meta.msg + ' · GATE CSE 2017 Set 1 Q32');

  var dividend = V.crc2017.meta.msg + '000';
  var y = 96;
  label(40, y - 8, 'append r = 3 zeros, then divide modulo 2', { color: PAL.dim });

  var shown = 0;
  var maxSteps = t >= 6 ? V.crc2017.steps.length : 0;
  for (var i = 0; i < maxSteps && shown < 6; i++) {
    var st = V.crc2017.steps[i];
    if (!st.gen) continue;
    var yy = y + 4 + shown * 26;
    txt(40, yy, 'step ' + (shown + 1), { size: 9.5, mono: true, color: PAL.faint });
    txt(86, yy, bstr(st.before), { size: 12, mono: true, color: PAL.ink });
    txt(230, yy, 'xor', { size: 9.5, mono: true, color: PAL.faint });
    txt(256, yy, bstr(st.gen), { size: 12, mono: true, color: PAL.info });
    txt(360, yy, '=', { size: 9.5, mono: true, color: PAL.faint });
    txt(378, yy, bstr(st.after), { size: 12, mono: true, color: PAL.accent });
    shown++;
  }
  if (t >= 6 && shown === 0) txt(86, y + 4, 'no XOR step: leading bit already zero', { size: 11, mono: true, color: PAL.faint });

  if (t >= 14) {
    P.alpha(rv(t, 14, 1.2));
    box(40, 258, 330, 62, { fill: PAL.accentDim, stroke: PAL.accent });
    txt(54, 276, 'remainder = ' + bstr(V.crc2017.rem), { size: 13, mono: true, bold: true, color: PAL.accent });
    txt(54, 296, 'frame sent = ' + bstr(V.crc2017.codeword), { size: 13, mono: true, bold: true, color: PAL.ink });
    txt(54, 312, 'receiver divides the whole word: remainder 0', { size: 9.5, mono: true, color: PAL.dim });
    P.alpha(1);
  }

  if (t >= 20) {
    P.alpha(rv(t, 20, 1.2));
    box(400, 258, 460, 128, { fill: PAL.surface2, stroke: PAL.border });
    txt(414, 276, 'what the generator guarantees', { size: 11.5, bold: true, color: PAL.ink });
    txt(414, 296, 'every single-bit error: caught', { size: 10.5, mono: true, color: PAL.valid });
    txt(414, 314, 'every burst of length at most r = 3: caught', { size: 10.5, mono: true, color: PAL.valid });
    txt(414, 332, 'a burst of length 4: the generator itself passes', { size: 10.5, mono: true, color: PAL.warn });
    txt(414, 350, 'odd-weight errors: caught only if x+1 divides G', { size: 10.5, mono: true, color: PAL.warn });
    txt(414, 370, '1011 has three ones, so x+1 does not divide it', { size: 10, mono: true, color: PAL.dim });
    P.alpha(1);
  }

  label(40, 406, 'the four recomputed items: 2017 S1 Q32 → 101 · 2021 S2 Q34 → 100', { color: PAL.faint });
  label(40, 428, '2007 Q73 → 011 · 2026 CS2 Q43 → 100', { color: PAL.faint });
}

/* ---------------- SCENE 5 - Hamming ---------------- */
function scHamming(t) {
  head('Hamming distance, and repairing one bit',
       'd min >= s+1 to detect s · d min >= 2t+1 to correct t · 8 data + 4 check bits');

  var x0 = 60, y0 = 92, cw = 62;
  var i;
  label(40, y0 - 10, 'codeword positions 1 to 12, check bits at 1, 2, 4, 8', { color: PAL.dim });
  for (i = 0; i < 12; i++) {
    var p = i + 1;
    var isCheck = (p === 1 || p === 2 || p === 4 || p === 8);
    var bad = (p === V.hamDouble.syndrome && t >= 20);
    cell(x0 + i * cw, y0, cw - 4, 30, String(V.ham.cw[i]), {
      size: 13,
      fill: bad ? PAL.warnDim : (isCheck ? PAL.accentDim : PAL.surface2),
      stroke: bad ? PAL.warn : (isCheck ? PAL.accent : PAL.border),
      color: bad ? PAL.warn : PAL.ink
    });
    label(x0 + i * cw + (cw - 4) / 2, y0 + 42, String(p),
          { align: 'center', color: isCheck ? PAL.accent : PAL.faint });
  }
  label(40, y0 + 60, 'data d8..d1 = ' + bstr(V.hamData) + ' · codeword ' + bstr(V.ham.cw), { color: PAL.dim });

  if (t >= 6) {
    P.alpha(rv(t, 6, 1.2));
    box(40, 190, 400, 96, { fill: PAL.surface2, stroke: PAL.border });
    txt(54, 208, 'the two inequalities', { size: 11.5, bold: true, color: PAL.ink });
    txt(54, 228, 'detect s:  d min >= s + 1', { size: 11.5, mono: true, color: PAL.ink });
    txt(54, 248, 'correct t: d min >= 2t + 1', { size: 11.5, mono: true, color: PAL.ink });
    txt(54, 270, 'GATE 2017 Set 2 Q34: d min = ' + V.code2017Dist + ', so t = 1', { size: 10, mono: true, color: PAL.accent });
    P.alpha(1);
  }

  if (t >= 13) {
    P.alpha(rv(t, 13, 1.2));
    box(456, 190, 404, 96, { fill: PAL.surface2, stroke: PAL.border });
    txt(470, 208, 'check bits needed: 2^r >= m + r + 1', { size: 11, mono: true, bold: true, color: PAL.ink });
    txt(470, 228, 'm = 8 needs r = 4, codeword 12 bits', { size: 10.5, mono: true, color: PAL.dim });
    txt(470, 248, 'r = 3 gives 8 >= 12, which fails', { size: 10.5, mono: true, color: PAL.warn });
    txt(470, 270, 'the +1 is the no-error case', { size: 10, mono: true, color: PAL.faint });
    P.alpha(1);
  }

  if (t >= 20) {
    P.alpha(rv(t, 20, 1.2));
    box(40, 300, 820, 72, { fill: PAL.warnDim, stroke: PAL.warn });
    txt(54, 318, 'flip bits 3 and 5 together: syndrome ' + V.hamDouble.syndrome + ' names bit ' + V.hamDouble.syndrome, { size: 11.5, mono: true, bold: true, color: PAL.warn });
    txt(54, 338, 'the correction then flips an innocent bit, and the word is now three bits wrong', { size: 10.5, mono: true, color: PAL.dim });
    txt(54, 358, 'single-error correction assumes at most one error; that assumption is the whole guarantee', { size: 10.5, mono: true, color: PAL.dim });
    P.alpha(1);
  }

  label(40, 400, 'syndrome of one flip = its own position, 1 to 12: computed here for all twelve', { color: PAL.faint });
  label(40, 424, 'syndrome 0 means no single-bit error — it does not mean the word is correct', { color: PAL.faint });
}

/* ---------------- SCENE 6 - ALOHA ---------------- */
function scAloha(t) {
  head('ALOHA: the cost of not listening',
       'pure: vulnerable period 2T · slotted: 1T · ceilings 1/(2e) and 1/e');

  var i;
  /* two frame-time windows drawn on a time axis */
  var ax = 60, ay = 100, aw = 360, unit = 60;
  label(ax, ay - 14, 'one frame time = T', { color: PAL.dim });
  for (i = 0; i <= 5; i++) {
    P.line(ax + i * unit, ay, ax + i * unit, ay + 54, { stroke: PAL.border, sw: 1, dash: [2, 4] });
  }
  P.line(ax, ay + 54, ax + 5 * unit, ay + 54, { stroke: PAL.border, sw: 1.5 });

  /* the frame under study occupies slots 2..3 */
  P.rect(ax + 2 * unit, ay + 6, unit, 20, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.4, radius: 3 });
  txt(ax + 2.5 * unit, ay + 16, 'ours', { size: 10, mono: true, align: 'center', base: 'middle', color: PAL.accent });

  if (t >= 6) {
    P.alpha(rv(t, 6, 1.2));
    P.rect(ax + unit, ay + 32, 3 * unit, 14, { fill: PAL.warnDim, stroke: PAL.warn, sw: 1.2, radius: 3 });
    txt(ax + 2.5 * unit, ay + 39, 'pure ALOHA window 2T', { size: 9.5, mono: true, align: 'center', base: 'middle', color: PAL.warn });
    P.alpha(1);
  }
  if (t >= 12) {
    P.alpha(rv(t, 12, 1.2));
    P.rect(ax + 2 * unit, ay + 56, unit, 14, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.2, radius: 3 });
    txt(ax + 2.5 * unit, ay + 63, 'slotted window T', { size: 9.5, mono: true, align: 'center', base: 'middle', color: PAL.accent });
    P.alpha(1);
  }

  /* throughput curve S(G) */
  var px = 60, py = 200, pw = 360, ph = 150;
  P.line(px, py + ph, px + pw, py + ph, { stroke: PAL.border, sw: 1.2 });
  P.line(px, py, px, py + ph, { stroke: PAL.border, sw: 1.2 });
  label(px, py - 12, 'throughput S against offered load G', { color: PAL.dim });
  label(px + pw, py + ph + 14, 'G', { align: 'right', color: PAL.faint });
  label(px - 4, py - 2, '0.37', { align: 'right', color: PAL.faint });

  function plot(fn, colour, show) {
    if (!show) return;
    var prevX = null, prevY = null;
    for (var g = 0; g <= 3.0001; g += 0.05) {
      var X = px + (g / 3) * pw;
      var Y = py + ph - (fn(g) / 0.4) * ph;
      if (prevX !== null) P.line(prevX, prevY, X, Y, { stroke: colour, sw: 2 });
      prevX = X; prevY = Y;
    }
  }
  plot(pureFormula, PAL.warn, t >= 6);
  plot(slottedFormula, PAL.accent, t >= 12);

  if (t >= 6) {
    P.alpha(rv(t, 6, 1.2));
    P.circle(px + (0.5 / 3) * pw, py + ph - (V.aloha.pureMax / 0.4) * ph, 4, { fill: PAL.warn });
    txt(px + (0.5 / 3) * pw + 8, py + ph - (V.aloha.pureMax / 0.4) * ph, 'G = 0.5, S = ' + num(V.aloha.pureMax, 3),
        { size: 9.5, mono: true, color: PAL.warn });
    P.alpha(1);
  }
  if (t >= 12) {
    P.alpha(rv(t, 12, 1.2));
    P.circle(px + (1 / 3) * pw, py + ph - (V.aloha.slotMax / 0.4) * ph, 4, { fill: PAL.accent });
    txt(px + (1 / 3) * pw + 8, py + ph - (V.aloha.slotMax / 0.4) * ph - 12, 'G = 1, S = ' + num(V.aloha.slotMax, 3),
        { size: 9.5, mono: true, color: PAL.accent });
    P.alpha(1);
  }

  /* the simulation panel */
  box(470, 96, 390, 150, { fill: PAL.surface2, stroke: PAL.border });
  txt(484, 114, 'simulated on this page', { size: 11.5, bold: true, color: PAL.ink });
  txt(484, 136, 'pure    ' + num(V.aloha.pureSim.S, 4) + '  over ' + V.aloha.pureSim.arrivals + ' frames',
      { size: 10.5, mono: true, color: PAL.warn });
  txt(484, 156, 'slotted ' + num(V.aloha.slotSim.S, 4) + '  over ' + V.aloha.slotSim.slots + ' slots',
      { size: 10.5, mono: true, color: PAL.accent });
  txt(484, 178, 'closed forms 1/(2e) = ' + num(V.aloha.pureMax, 4), { size: 10, mono: true, color: PAL.dim });
  txt(484, 196, 'and 1/e = ' + num(V.aloha.slotMax, 4), { size: 10, mono: true, color: PAL.dim });
  txt(484, 218, 'seed fixed, so the picture is reproducible', { size: 9.5, mono: true, color: PAL.faint });
  txt(484, 236, 'agreement within one and a half points', { size: 9.5, mono: true, color: PAL.faint });

  label(40, 396, 'the ceilings are maxima at one load, not the throughput at every load', { color: PAL.faint });
  label(40, 420, 'carrier sense cuts the window from 2T to one propagation delay', { color: PAL.faint });
}

/* ---------------- SCENE 7 - CSMA / CD ---------------- */
function scCsma(t) {
  head('Carrier sense, collision detection, and the 2-tau rule',
       'window tau with sensing · round trip 2 tau with detection · L >= 2 tau R');

  var y = 110, x1 = 90, x2 = 780;
  box(x1 - 54, y - 18, 54, 36, { fill: PAL.surface2, stroke: PAL.border, radius: 6 });
  txt(x1 - 27, y, 'P', { size: 12, mono: true, align: 'center', base: 'middle', color: PAL.ink, bold: true });
  box(x2, y - 18, 54, 36, { fill: PAL.surface2, stroke: PAL.border, radius: 6 });
  txt(x2 + 27, y, 'Q', { size: 12, mono: true, align: 'center', base: 'middle', color: PAL.ink, bold: true });
  P.line(x1, y, x2, y, { stroke: PAL.border, sw: 3 });

  if (t >= 4) {
    P.alpha(rv(t, 4, 1.2));
    P.line(x1, y - 26, x1 + 120, y - 26, { stroke: PAL.accent, sw: 2 });
    txt(x1 + 128, y - 30, 'tau: P starts, its first bit is still travelling', { size: 10, mono: true, color: PAL.accent });
    P.alpha(1);
  }
  if (t >= 10) {
    P.alpha(rv(t, 10, 1.2));
    P.line(x2, y + 30, x1, y + 30, { stroke: PAL.warn, sw: 2 });
    txt(x1, y + 42, 'Q started just before that bit arrived — the corrupted signal comes back one round trip later', { size: 10, mono: true, color: PAL.warn });
    P.alpha(1);
  }

  if (t >= 16) {
    P.alpha(rv(t, 16, 1.2));
    box(40, 196, 400, 100, { fill: PAL.surface2, stroke: PAL.border });
    txt(54, 214, 'the rule', { size: 11.5, bold: true, color: PAL.ink });
    txt(54, 236, 'L >= 2 tau R', { size: 14, mono: true, bold: true, color: PAL.accent });
    txt(54, 258, 'tau = d / v, one way', { size: 10.5, mono: true, color: PAL.dim });
    txt(54, 278, 'the 2 is the round trip, not a fudge factor', { size: 10.5, mono: true, color: PAL.warn });
    P.alpha(1);
  }

  if (t >= 22) {
    P.alpha(rv(t, 22, 1.2));
    box(456, 196, 404, 100, { fill: PAL.accentDim, stroke: PAL.accent });
    txt(470, 214, 'GATE CSE 2015 Set 3 Q6, recomputed', { size: 11, mono: true, bold: true, color: PAL.accent });
    txt(470, 236, 'L = ' + V.cd2015.Lbits + ' bits, R = 10^8 bps, d = 1 km', { size: 10.5, mono: true, color: PAL.ink });
    txt(470, 256, 'v = 2dR / L = ' + num(V.cd2015.speed / 1000, 0) + ' km/s', { size: 10.5, mono: true, color: PAL.ink });
    txt(470, 278, 'that is 2 x 10^7 m/s, the standard figure', { size: 10, mono: true, color: PAL.dim });
    P.alpha(1);
  }

  label(40, 330, 'GATE 2018 Q55 is the sensing half of the same idea: a 5-unit sensing window', { color: PAL.faint });
  label(40, 352, 'against a propagation delay of d/10 gives d <= ' + V.sense2018.dMax + ' metres', { color: PAL.faint });

  label(40, 396, 'detection needs the frame still going out when the echo returns — that is the whole condition', { color: PAL.faint });
  label(40, 420, 'doubling the cable or doubling the rate doubles the minimum frame', { color: PAL.faint });
}

/* ---------------- SCENE 8 - Ethernet ---------------- */
function scEthernet(t) {
  head('Ethernet: the frame, the 64 bytes, and the backoff',
       '802.3: 6 + 6 + 2 + payload + 4 · slot time 512 bit times · doubling window');

  /* the frame bar: a schematic, not to scale, so every label has room */
  var x = 40, y = 96;
  var parts = [
    { n: 'dst', b: '6B', w: 60, fill: PAL.surface2, stroke: PAL.border },
    { n: 'src', b: '6B', w: 60, fill: PAL.surface2, stroke: PAL.border },
    { n: 'type', b: '2B', w: 44, fill: PAL.surface2, stroke: PAL.border },
    { n: 'payload', b: '46..1500B', w: 250, fill: PAL.accentDim, stroke: PAL.accent },
    { n: 'FCS', b: '4B', w: 54, fill: PAL.surface2, stroke: PAL.border }
  ];
  var cx = x;
  for (var i = 0; i < parts.length; i++) {
    box(cx, y, parts[i].w, 34, { fill: parts[i].fill, stroke: parts[i].stroke, radius: 3 });
    txt(cx + parts[i].w / 2, y + 17, parts[i].n, {
      size: 10, mono: true, align: 'center', base: 'middle', color: PAL.ink
    });
    label(cx + parts[i].w / 2, y + 46, parts[i].b, { align: 'center', color: PAL.faint });
    cx += parts[i].w + 4;
  }
  label(560, y + 17, 'schematic, not to scale', { color: PAL.faint });
  label(x, y + 68, 'header ' + V.eth.header + 'B + FCS ' + V.eth.fcs + 'B = 18B overhead · min frame ' +
        V.eth.minFrame + 'B · max ' + V.eth.maxFrame + 'B', { color: PAL.dim });

  if (t >= 6) {
    P.alpha(rv(t, 6, 1.2));
    box(40, 190, 400, 96, { fill: PAL.surface2, stroke: PAL.border });
    txt(54, 208, 'the two inequalities', { size: 11.5, bold: true, color: PAL.ink });
    txt(54, 228, 'detect s:  d min >= s + 1', { size: 11.5, mono: true, color: PAL.ink });
    txt(54, 248, 'correct t: d min >= 2t + 1', { size: 11.5, mono: true, color: PAL.ink });
    txt(54, 270, 'GATE 2017 Set 2 Q34: d min = ' + V.code2017Dist + ', so t = 1', { size: 10, mono: true, color: PAL.accent });
    P.alpha(1);
  }

  if (t >= 13) {
    P.alpha(rv(t, 13, 1.2));
    box(456, 190, 404, 96, { fill: PAL.surface2, stroke: PAL.border });
    txt(470, 208, 'check bits needed: 2^r >= m + r + 1', { size: 11, mono: true, bold: true, color: PAL.ink });
    txt(470, 228, 'm = 8 needs r = 4, codeword 12 bits', { size: 10.5, mono: true, color: PAL.dim });
    txt(470, 248, 'r = 3 gives 8 >= 12, which fails', { size: 10.5, mono: true, color: PAL.warn });
    txt(470, 270, 'the +1 is the no-error case', { size: 10, mono: true, color: PAL.faint });
    P.alpha(1);
  }

  if (t >= 20) {
    P.alpha(rv(t, 20, 1.2));
    box(40, 300, 820, 72, { fill: PAL.warnDim, stroke: PAL.warn });
    txt(54, 318, 'flip bits 3 and 5 together: syndrome ' + V.hamDouble.syndrome + ' names bit ' + V.hamDouble.syndrome, { size: 11.5, mono: true, bold: true, color: PAL.warn });
    txt(54, 338, 'the correction then flips an innocent bit, and the word is now three bits wrong', { size: 10.5, mono: true, color: PAL.dim });
    txt(54, 358, 'single-error correction assumes at most one error; that assumption is the whole guarantee', { size: 10.5, mono: true, color: PAL.dim });
    P.alpha(1);
  }

  label(40, 400, 'syndrome of one flip = its own position, 1 to 12: computed here for all twelve', { color: PAL.faint });
  label(40, 424, 'syndrome 0 means no single-bit error — it does not mean the word is correct', { color: PAL.faint });
}

/* ---------------- SCENE 6 - ALOHA ---------------- */
function scAloha(t) {
  head('ALOHA: the cost of not listening',
       'pure: vulnerable period 2T · slotted: 1T · ceilings 1/(2e) and 1/e');

  var i;
  /* two frame-time windows drawn on a time axis */
  var ax = 60, ay = 100, aw = 360, unit = 60;
  label(ax, ay - 14, 'one frame time = T', { color: PAL.dim });
  for (i = 0; i <= 5; i++) {
    P.line(ax + i * unit, ay, ax + i * unit, ay + 54, { stroke: PAL.border, sw: 1, dash: [2, 4] });
  }
  P.line(ax, ay + 54, ax + 5 * unit, ay + 54, { stroke: PAL.border, sw: 1.5 });

  /* the frame under study occupies slots 2..3 */
  P.rect(ax + 2 * unit, ay + 6, unit, 20, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.4, radius: 3 });
  txt(ax + 2.5 * unit, ay + 16, 'ours', { size: 10, mono: true, align: 'center', base: 'middle', color: PAL.accent });

  if (t >= 6) {
    P.alpha(rv(t, 6, 1.2));
    P.rect(ax + unit, ay + 32, 3 * unit, 14, { fill: PAL.warnDim, stroke: PAL.warn, sw: 1.2, radius: 3 });
    txt(ax + 2.5 * unit, ay + 39, 'pure ALOHA window 2T', { size: 9.5, mono: true, align: 'center', base: 'middle', color: PAL.warn });
    P.alpha(1);
  }
  if (t >= 12) {
    P.alpha(rv(t, 12, 1.2));
    P.rect(ax + 2 * unit, ay + 56, unit, 14, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.2, radius: 3 });
    txt(ax + 2.5 * unit, ay + 63, 'slotted window T', { size: 9.5, mono: true, align: 'center', base: 'middle', color: PAL.accent });
    P.alpha(1);
  }

  /* throughput curve S(G) */
  var px = 60, py = 200, pw = 360, ph = 150;
  P.line(px, py + ph, px + pw, py + ph, { stroke: PAL.border, sw: 1.2 });
  P.line(px, py, px, py + ph, { stroke: PAL.border, sw: 1.2 });
  label(px, py - 12, 'throughput S against offered load G', { color: PAL.dim });
  label(px + pw, py + ph + 14, 'G', { align: 'right', color: PAL.faint });
  label(px - 4, py - 2, '0.37', { align: 'right', color: PAL.faint });

  function plot(fn, colour, show) {
    if (!show) return;
    var prevX = null, prevY = null;
    for (var g = 0; g <= 3.0001; g += 0.05) {
      var X = px + (g / 3) * pw;
      var Y = py + ph - (fn(g) / 0.4) * ph;
      if (prevX !== null) P.line(prevX, prevY, X, Y, { stroke: colour, sw: 2 });
      prevX = X; prevY = Y;
    }
  }
  plot(pureFormula, PAL.warn, t >= 6);
  plot(slottedFormula, PAL.accent, t >= 12);

  if (t >= 6) {
    P.alpha(rv(t, 6, 1.2));
    P.circle(px + (0.5 / 3) * pw, py + ph - (V.aloha.pureMax / 0.4) * ph, 4, { fill: PAL.warn });
    txt(px + (0.5 / 3) * pw + 8, py + ph - (V.aloha.pureMax / 0.4) * ph, 'G = 0.5, S = ' + num(V.aloha.pureMax, 3),
        { size: 9.5, mono: true, color: PAL.warn });
    P.alpha(1);
  }
  if (t >= 12) {
    P.alpha(rv(t, 12, 1.2));
    P.circle(px + (1 / 3) * pw, py + ph - (V.aloha.slotMax / 0.4) * ph, 4, { fill: PAL.accent });
    txt(px + (1 / 3) * pw + 8, py + ph - (V.aloha.slotMax / 0.4) * ph - 12, 'G = 1, S = ' + num(V.aloha.slotMax, 3),
        { size: 9.5, mono: true, color: PAL.accent });
    P.alpha(1);
  }

  /* the simulation panel */
  box(470, 96, 390, 150, { fill: PAL.surface2, stroke: PAL.border });
  txt(484, 114, 'simulated on this page', { size: 11.5, bold: true, color: PAL.ink });
  txt(484, 136, 'pure    ' + num(V.aloha.pureSim.S, 4) + '  over ' + V.aloha.pureSim.arrivals + ' frames',
      { size: 10.5, mono: true, color: PAL.warn });
  txt(484, 156, 'slotted ' + num(V.aloha.slotSim.S, 4) + '  over ' + V.aloha.slotSim.slots + ' slots',
      { size: 10.5, mono: true, color: PAL.accent });
  txt(484, 178, 'closed forms 1/(2e) = ' + num(V.aloha.pureMax, 4), { size: 10, mono: true, color: PAL.dim });
  txt(484, 196, 'and 1/e = ' + num(V.aloha.slotMax, 4), { size: 10, mono: true, color: PAL.dim });
  txt(484, 218, 'seed fixed, so the picture is reproducible', { size: 9.5, mono: true, color: PAL.faint });
  txt(484, 236, 'agreement within one and a half points', { size: 9.5, mono: true, color: PAL.faint });

  label(40, 396, 'the ceilings are maxima at one load, not the throughput at every load', { color: PAL.faint });
  label(40, 420, 'carrier sense cuts the window from 2T to one propagation delay', { color: PAL.faint });
}

/* ---------------- SCENE 9 - the arithmetic ---------------- */
function scArith(t) {
  head('The arithmetic, on real papers',
       'L = 2 tau R · a = tau / Tt · utilisation 1/(1+2a) · payload efficiency');

  box(40, 84, 380, 74, { fill: PAL.accentDim, stroke: PAL.accent });
  txt(54, 102, 'the one formula to keep', { size: 11, bold: true, color: PAL.accent });
  txt(54, 126, 'L = 2 tau R', { size: 15, mono: true, bold: true, color: PAL.ink });
  txt(54, 146, 'three given, solve for the fourth', { size: 10, mono: true, color: PAL.dim });

  if (t >= 5) {
    P.alpha(rv(t, 5, 1.2));
    box(444, 84, 416, 74, { fill: PAL.surface2, stroke: PAL.border });
    txt(458, 102, 'solved for the speed', { size: 11, bold: true, color: PAL.ink });
    txt(458, 124, 'v = 2dR / L = ' + num(V.cd2015.speed / 1000, 0) + ' km/s', { size: 12, mono: true, color: PAL.ink });
    txt(458, 144, 'GATE CSE 2015 Set 3 Q6, option D', { size: 10, mono: true, color: PAL.accent });
    P.alpha(1);
  }

  if (t >= 11) {
    P.alpha(rv(t, 11, 1.2));
    label(40, 190, 'the ratio a = tau / Tt, on one 1 km, 10 Mbps LAN', { color: PAL.dim });
    txt(40, 212, 'Tt = ' + num(V.aDemo.Tt * 1e6, 0) + ' us   tau = ' + num(V.aDemo.tau * 1e6, 1) +
        ' us   a = ' + num(V.aDemo.a, 5), { size: 11.5, mono: true, color: PAL.ink });
    var bx = 40, by = 228, bw = 400;
    P.rect(bx, by, bw * V.aDemo.U, 22, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.4, radius: 3 });
    P.rect(bx + bw * V.aDemo.U, by, bw * (1 - V.aDemo.U), 22, { fill: PAL.warnDim, stroke: PAL.warn, sw: 1.4, radius: 3 });
    txt(bx + bw * V.aDemo.U / 2, by + 11, 'busy', { size: 9.5, mono: true, align: 'center', base: 'middle', color: PAL.accent });
    txt(bx + bw * V.aDemo.U + 40, by + 11, 'idle', { size: 9.5, mono: true, align: 'center', base: 'middle', color: PAL.warn });
    txt(40, 272, 'stop-and-wait utilisation = 1/(1+2a) = ' + num(V.aDemo.U * 100, 1) + '%', { size: 11, mono: true, color: PAL.ink });
    P.alpha(1);
  }

  if (t >= 18) {
    P.alpha(rv(t, 18, 1.2));
    box(40, 296, 380, 80, { fill: PAL.surface2, stroke: PAL.border });
    txt(54, 314, 'why a matters', { size: 11, bold: true, color: PAL.ink });
    txt(54, 334, 'small a: the sender fills the wire and waits little', { size: 10, mono: true, color: PAL.dim });
    txt(54, 352, 'large a: a satellite link, where waiting dominates', { size: 10, mono: true, color: PAL.dim });
    txt(54, 368, 'a is a ratio of two times, so it has no unit', { size: 10, mono: true, color: PAL.warn });
    P.alpha(1);
  }

  if (t >= 24) {
    P.alpha(rv(t, 24, 1.2));
    box(444, 296, 416, 80, { fill: PAL.surface2, stroke: PAL.border });
    txt(458, 314, 'payload efficiency at the two frame sizes', { size: 11, bold: true, color: PAL.ink });
    txt(458, 336, '46/64 = ' + num(V.eth.effMin * 100, 1) + '%   overhead ' + num(V.eth.overheadMin * 100, 1) + '%',
        { size: 10.5, mono: true, color: PAL.warn });
    txt(458, 356, '1500/1518 = ' + num(V.eth.effMax * 100, 1) + '%', { size: 10.5, mono: true, color: PAL.valid });
    P.alpha(1);
  }

  label(40, 400, 'the four quantities: tau, R, L, v — write them in consistent units first', { color: PAL.faint });
  label(40, 424, 'a distance in km must become metres before it meets metres per second', { color: PAL.faint });
}

/* ---------------- SCENE 10 - the procedure ---------------- */
function scDecide(t) {
  head('The procedure, and the traps that cost marks',
       'name the family · state what is guaranteed · decide whether detection is required');

  var steps = [
    { n: '1', h: 'name the family', b: 'detect: parity, checksum, CRC\ncorrect: distance, syndrome\nshare: ALOHA, CSMA, Ethernet' },
    { n: '2', h: 'state the guarantee', b: 'CRC: burst <= r, plus odd errors\nonly if x+1 divides G\ncode: d min >= s+1, >= 2t+1' },
    { n: '3', h: 'tau, then round trip?', b: 'detection: the answer has a 2\nsensing only: it does not\n2015 Q6 versus 2018 Q55' },
    { n: '4', h: 'convert back', b: 'km/s against m/s\nbytes against bits\npercent against fraction' }
  ];

  for (var i = 0; i < steps.length; i++) {
    var col = i % 2, row = Math.floor(i / 2);
    var x = 40 + col * 424, y = 84 + row * 150;
    if (t < i * 6) continue;
    P.alpha(rv(t, i * 6, 1.2));
    box(x, y, 404, 130, { fill: PAL.surface2, stroke: PAL.border });
    txt(x + 16, y + 22, steps[i].n, { size: 15, mono: true, bold: true, color: PAL.accent });
    txt(x + 42, y + 22, steps[i].h, { size: 12, bold: true, color: PAL.ink });
    var lines = steps[i].b.split('\n');
    for (var L = 0; L < lines.length; L++) {
      txt(x + 16, y + 48 + L * 20, lines[L], { size: 10.5, mono: true, color: PAL.dim });
    }
    P.alpha(1);
  }

  label(40, 400, 'a right method with the wrong unit still scores zero — convert before you choose', { color: PAL.faint });
  label(40, 424, 'check the magnitude against the dominant term, then pick the option', { color: PAL.faint });
}

var SCENES = {
  frame: scFrame, parity: scParity, checksum: scChecksum, crc: scCrc, hamming: scHamming,
  aloha: scAloha, csma: scCsma, ethernet: scEthernet, arith: scArith, decide: scDecide
};

/* ======================================================================
   LAYER 4 - BOOT
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
  bg();
  if (sc && SCENES[sc.id]) {
    try {
      SCENES[sc.id](tt - sc.start);
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
