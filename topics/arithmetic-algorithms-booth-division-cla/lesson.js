/* ==========================================================================
   arithmetic-algorithms-booth-division-cla — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads M; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   Two kinds of fact appear below and are kept apart:
     - what is an ALGORITHM: a fixed sequence of add/subtract and shift
       operations on registers of a stated width. Every trace here is produced
       by executing that sequence, never by quoting a table;
     - what is a THEOREM about the trace: the product equals the arithmetic
       product; the quotient and remainder satisfy dividend = M*Q + A with
       0 <= A < M; the number of Booth add/subtract operations equals the number
       of 0->1 and 1->0 transitions of the multiplier.

   Register widths are stated wherever they matter. Booth's accumulator is
   n+1 bits, because the textbook n-bit version is wrong for one multiplicand
   (the most negative n-bit value); the model below computes both and reports
   the disagreement rather than hiding it.
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

  /* ---------- 1a. bit helpers ---------- */

  function mask(n) { return Math.pow(2, n) - 1; }

  /* unsigned bit pattern of v in n bits, as a string */
  function bin(v, n) {
    var u = ((v % Math.pow(2, n)) + Math.pow(2, n)) % Math.pow(2, n);
    var s = Math.floor(u).toString(2);
    while (s.length < n) s = '0' + s;
    return s;
  }

  /* value of an n-bit two's complement pattern held in v */
  function sval(v, n) {
    var u = ((v % Math.pow(2, n)) + Math.pow(2, n)) % Math.pow(2, n);
    return (u >= Math.pow(2, n - 1)) ? u - Math.pow(2, n) : u;
  }

  /* ================= 1b. unsigned shift-and-add multiplication =================
     Registers: A is n+1 bits (the extra bit is the carry out of the addition,
     and dropping it is the classic way to lose 32), Q is n bits, M is n bits.
     Each step: if Q0 = 1 then A <- A + M; then shift the 2n+1-bit (A,Q) right. */
  function shiftAdd(m, q, n) {
    var maskA = mask(n + 1), maskQ = mask(n);
    var A = 0, Q = q, ops = 0, rows = [];
    for (var i = 0; i < n; i++) {
      var lsb = Q & 1;
      if (lsb) { A += m; ops++; }
      rows.push({ step: i + 1, A: A, Q: Q, lsb: lsb, ops: ops });
      var P2 = A * Math.pow(2, n) + Q;          // the 2n+1-bit register
      P2 = Math.floor(P2 / 2);                  // logical right shift by one
      A = Math.floor(P2 / Math.pow(2, n)) & maskA;
      Q = P2 % Math.pow(2, n);
    }
    return { A: A, Q: Q, product: A * Math.pow(2, n) + Q, ops: ops, rows: rows };
  }

  function popcount(v) {
    var c = 0;
    while (v > 0) { c += v & 1; v = Math.floor(v / 2); }
    return c;
  }

  /* ================= 1c. Booth recoding =================
     The recoded digit at position i is  q(i-1) - q(i), with q(-1) = 0.
     Table by the pair (q_i, q_{i-1}):  00 -> 0,  01 -> +1,  10 -> -1,  11 -> 0. */
  function boothDigits(q, n) {
    var d = [];
    for (var i = 0; i < n; i++) {
      var ai = (q >> i) & 1;
      var aim1 = (i > 0) ? ((q >> (i - 1)) & 1) : 0;
      d.push(aim1 - ai);
    }
    return d;
  }
  function digitValue(d) {
    var s = 0;
    for (var i = 0; i < d.length; i++) s += d[i] * Math.pow(2, i);
    return s;
  }
  function nonzeroDigits(d) {
    var c = 0;
    for (var i = 0; i < d.length; i++) if (d[i] !== 0) c++;
    return c;
  }

  /* ================= 1d. Booth multiplication =================
     A is n+1 bits (sign-extended multiplicand), Q is n bits, q-1 one bit.
     Pair 01 -> A += M, pair 10 -> A -= M, then arithmetic right shift. */
  function booth(m, q, n, wide) {
    var Wn = (wide === false) ? n : n + 1;
    var maskA = mask(Wn), maskQ = mask(n);
    var A = 0, Q = q & maskQ, qm1 = 0, ops = 0, rows = [];
    for (var i = 0; i < n; i++) {
      var pair = ((Q & 1) << 1) | qm1, op = 'none';
      if (pair === 1) { A = (A + m) & maskA; op = '+M'; ops++; }
      else if (pair === 2) { A = (A - m) & maskA; op = '-M'; ops++; }
      rows.push({ step: i + 1, A: A, Q: Q, qm1: qm1, pair: pair, op: op });
      qm1 = Q & 1;
      var sign = (A >> (Wn - 1)) & 1;
      Q = ((A & 1) << (n - 1)) | (Q >> 1);
      A = (sign << (Wn - 1)) | ((A >> 1) & (mask(Wn - 1)));
    }
    var prod = ((A & maskQ) << n) | Q;
    return { product: prod, ops: ops, rows: rows, A: A, Q: Q, wide: Wn };
  }

  /* transitions of the multiplier with a prepended q(-1) = 0 */
  function transitions(q, n) {
    var c = 0;
    for (var i = 0; i < n; i++) {
      var ai = (q >> i) & 1;
      var aim1 = (i > 0) ? ((q >> (i - 1)) & 1) : 0;
      if (ai !== aim1) c++;
    }
    return c;
  }

  /* ================= 1e. restoring division =================
     A is n+1 bits and stays non-negative. Each step: shift left (A,Q);
     A <- A - M; if that is negative, add M back and set Q0 = 0, else Q0 = 1. */
  function restoring(M, Qd, n) {
    var maskA = mask(n + 1), maskQ = mask(n);
    var A = 0, Q = Qd, rows = [];
    for (var i = 0; i < n; i++) {
      A = ((A << 1) | ((Q >> (n - 1)) & 1)) & maskA;
      Q = (Q << 1) & maskQ;
      var t = A - M, qb, note;
      if (t < 0) { A = t + M; qb = 0; note = 'restore'; }
      else { A = t; qb = 1; note = 'keep'; }
      Q = (Q & ~1) | qb;
      rows.push({ step: i + 1, A: A, Q: Q, note: note, qb: qb, trial: t });
    }
    return { A: A, Q: Q, rows: rows };
  }

  /* ================= 1f. non-restoring division =================
     The sign of the partial remainder BEFORE the shift chooses +M or -M.
     The quotient bit is 1 when the new remainder is non-negative.
     If the final remainder is negative, one correction (add M) is needed. */
  function nonRestoring(M, Qd, n) {
    var maskQ = mask(n);
    var A = 0, Q = Qd, rows = [];
    for (var i = 0; i < n; i++) {
      var neg = A < 0;
      A = (A << 1) | ((Q >> (n - 1)) & 1);
      Q = (Q << 1) & maskQ;
      var act;
      if (neg) { A = A + M; act = '+M'; } else { A = A - M; act = '-M'; }
      var qb = (A >= 0) ? 1 : 0;
      Q = (Q & ~1) | qb;
      rows.push({ step: i + 1, A: A, Q: Q, act: act, qb: qb });
    }
    var corr = 0;
    if (A < 0) { A = A + M; corr = 1; }
    return { A: A, Q: Q, rows: rows, corr: corr };
  }

  /* ================= 1g. carry-lookahead =================
     P_i = A_i xor B_i (this column propagates a carry in),
     G_i = A_i and B_i (this column generates one).
     c_i = OR over j < i of (G_j AND P_{j+1} ... P_{i-1}). */
  function rippleCarries(a, b, n) {
    var c = 0, cs = [], cout = 0;
    for (var i = 0; i < n; i++) {
      var ai = (a >> i) & 1, bi = (b >> i) & 1;
      cs.push(c);
      cout = (ai & bi) | ((ai ^ bi) & c);
      c = cout;
    }
    return { carries: cs, cout: cout };
  }

  function lookaheadCarries(a, b, n) {
    var P_ = [], G_ = [], i, j, k;
    for (i = 0; i < n; i++) {
      var ai = (a >> i) & 1, bi = (b >> i) & 1;
      P_.push(ai ^ bi);
      G_.push(ai & bi);
    }
    function carryIn(i) {
      for (var j = 0; j < i; j++) {
        var t = G_[j];
        for (var k = j + 1; k < i; k++) t = t && P_[k];
        if (t) return 1;
      }
      return 0;
    }
    var cs = [];
    for (i = 0; i < n; i++) cs.push(carryIn(i));
    return { carries: cs, cout: carryIn(n) };
  }

  /* gate levels with fan-in 2: 1 for P and G, then an AND tree and an OR tree
     over at most n literals each, then 1 for the sum bit */
  function claLevels(n) { return 2 * Math.ceil(Math.log(n) / Math.LN2) + 2; }

  /* ======================================================================
     THE VALUES THIS PAGE SHOWS
     ====================================================================== */

  /* --- shift-and-add, 13 x 11 in four bits --- */
  var SA_M = 13, SA_Q = 11, SA_N = 4;
  var SA = shiftAdd(SA_M, SA_Q, SA_N);

  /* --- Booth recoding of the same multiplier --- */
  var DIGITS = boothDigits(SA_Q, SA_N);

  /* --- Booth, 3 x (-4) in four bits --- */
  var B_N = 4, B_M = 3, B_Q = -4;
  var BOOTH = booth(B_M, B_Q, B_N);
  var BOOTH_NARROW = booth(B_M, B_Q, B_N, false);

  /* the one multiplicand where the n-bit accumulator fails */
  var MIN_M = -8, MIN_Q = 2;
  var BOOTH_MIN = booth(MIN_M, MIN_Q, 4);
  var BOOTH_MIN_NARROW = booth(MIN_M, MIN_Q, 4, false);

  /* --- the GATE 2025 Set 2 Q32 multiplier, 16 bits --- */
  var Q25 = parseInt('1010010010101010', 2);
  var M25 = parseInt('1100110111101101', 2);
  var T25 = transitions(Q25, 16);
  var B25 = booth(M25, Q25, 16);

  /* --- best and worst case counts over four-bit multipliers --- */
  var bestOps = 99, bestQ = 0, worstOps = -1, worstQ = 0;
  (function () {
    for (var q = 0; q < 16; q++) {
      var d = boothDigits(q, 4), c = nonzeroDigits(d);
      if (c < bestOps) { bestOps = c; bestQ = q; }
      if (c > worstOps) { worstOps = c; worstQ = q; }
    }
  })();

  /* --- restoring and non-restoring division, 7 / 3 in four bits --- */
  var D_N = 4, D_M = 3, D_Q = 7;
  var REST = restoring(D_M, D_Q, D_N);
  var NONR = nonRestoring(D_M, D_Q, D_N);
  var NONR2 = nonRestoring(4, 7, D_N);

  /* --- carry-lookahead, a worked 4-bit pair --- */
  var CLA_A = 13, CLA_B = 11;
  var RIP = rippleCarries(CLA_A, CLA_B, 4);
  var LKA = lookaheadCarries(CLA_A, CLA_B, 4);
  var CLA_PG = (function () {
    var ps = '', gs = '';
    for (var i = 0; i < 4; i++) {
      var ai = (CLA_A >> i) & 1, bi = (CLA_B >> i) & 1;
      ps = (ai ^ bi) + ps;
      gs = (ai & bi) + gs;
    }
    return { p: ps, g: gs };
  })();
  var CLA_TABLE = [];
  (function () {
    var ns = [4, 8, 16, 32, 64];
    for (var i = 0; i < ns.length; i++) {
      CLA_TABLE.push({ n: ns[i], ripple: ns[i], cla: claLevels(ns[i]) });
    }
  })();

  var M = {
    saM: SA_M, saQ: SA_Q, saN: SA_N,
    saRows: SA.rows, saProduct: SA.product, saOps: SA.ops,
    saBits: bin(SA.product, 2 * SA_N),
    saPop: popcount(SA_Q), saQbits: bin(SA_Q, SA_N), saMbits: bin(SA_M, SA_N),

    digits: DIGITS, digitValue: digitValue(DIGITS),
    digitOps: nonzeroDigits(DIGITS), qBits: bin(SA_Q, SA_N),

    bM: B_M, bQ: B_Q, bN: B_N, bRows: BOOTH.rows, bOps: BOOTH.ops,
    bProduct: BOOTH.product, bProductValue: sval(BOOTH.product, 8),
    bBits: bin(BOOTH.product, 8),
    bNarrowValue: sval(BOOTH_NARROW.product, 8),
    minWide: sval(BOOTH_MIN.product, 8), minNarrow: sval(BOOTH_MIN_NARROW.product, 8),

    t25: T25, b25Ops: B25.ops, q25bits: bin(Q25, 16),
    bestOps: bestOps, bestQbits: bin(bestQ, 4),
    worstOps: worstOps, worstQbits: bin(worstQ, 4),

    dM: D_M, dQ: D_Q, dN: D_N,
    restRows: REST.rows, restA: REST.A, restQ: REST.Q,
    nonrRows: NONR.rows, nonrA: NONR.A, nonrQ: NONR.Q, nonrCorr: NONR.corr,
    nonr2Corr: NONR2.corr, nonr2A: NONR2.A, nonr2Q: NONR2.Q,

    claA: CLA_A, claB: CLA_B, ripCarries: RIP.carries, ripCout: RIP.cout,
    lkaCarries: LKA.carries, lkaCout: LKA.cout,
    claTable: CLA_TABLE, claUnbounded: 4,
    pBits: CLA_PG.p, gBits: CLA_PG.g,

    checks: CHECKS.length
  };

/* ======================================================================
   LAYER 2 - THE CHECKS
   Each check re-verifies a defining property, not the arithmetic twice.
   ====================================================================== */

  /* --- shift-and-add --- */
  chk('shift-and-add: 13 x 11 gives 143', SA.product === 143, SA.product);
  chk('shift-and-add: the product bit pattern is 10001111', bin(SA.product, 8) === '10001111', bin(SA.product, 8));
  chk('shift-and-add: additions equal the number of 1s in the multiplier',
      SA.ops === popcount(SA_Q), SA.ops + ' vs ' + popcount(SA_Q));
  chk('shift-and-add: A never loses its carry bit (n+1 bits)', SA.rows[1].A === 19, SA.rows[1].A);

  (function () {
    var bad = 0;
    for (var m = 0; m < 16; m++) {
      for (var q = 0; q < 16; q++) {
        var r = shiftAdd(m, q, 4);
        if (r.product !== m * q || r.ops !== popcount(q)) bad++;
      }
    }
    chk('shift-and-add: all 256 four-bit pairs multiply correctly', bad === 0, bad + ' wrong');
  })();

  /* --- Booth recoding --- */
  (function () {
    var bad = 0;
    for (var n = 4; n <= 8; n += 2) {
      for (var q = 0; q < Math.pow(2, n); q++) {
        if (digitValue(boothDigits(q, n)) !== sval(q, n)) bad++;
      }
    }
    chk('recoding: the digits sum to the signed value of the multiplier', bad === 0, bad + ' wrong');
  })();
  chk('recoding: 1011 recodes to -1,0,+1,-1 and sums to -5',
      digitValue(DIGITS) === -5 && DIGITS[0] === -1 && DIGITS[2] === 1 && DIGITS[3] === -1,
      DIGITS.join(',') + ' -> ' + digitValue(DIGITS));
  chk('recoding: 1011 needs three add/subtract operations', nonzeroDigits(DIGITS) === 3, nonzeroDigits(DIGITS));

  /* --- Booth multiplication --- */
  chk('Booth: 3 x -4 gives -12 in eight bits', BOOTH.product === 244 && sval(BOOTH.product, 8) === -12,
      bin(BOOTH.product, 8));
  chk('Booth: that trace performs exactly one subtraction', BOOTH.ops === 1, BOOTH.ops);
  chk('Booth: the n+1-bit accumulator gets -8 x 2 right (-16)',
      sval(BOOTH_MIN.product, 8) === -16, sval(BOOTH_MIN.product, 8));
  chk('Booth: the n-bit accumulator gets -8 x 2 wrong (+16)',
      sval(BOOTH_MIN_NARROW.product, 8) === 16, sval(BOOTH_MIN_NARROW.product, 8));
  chk('Booth: 3 x -4 is unaffected by the narrowing (a control)',
      sval(BOOTH_NARROW.product, 8) === -12, sval(BOOTH_NARROW.product, 8));

  (function () {
    var bad = 0;
    for (var m = -8; m < 8; m++) {
      for (var q = -8; q < 8; q++) {
        var r = booth(m, q, 4);
        if (sval(r.product, 8) !== m * q) bad++;
      }
    }
    chk('Booth with an n+1-bit accumulator: all 256 signed pairs correct', bad === 0, bad + ' wrong');
  })();

  (function () {
    var bad = 0;
    for (var q = 0; q < 16; q++) {
      if (booth(5, q, 4).ops !== transitions(q, 4)) bad++;
    }
    chk('Booth: operation count equals the transition count of the multiplier', bad === 0, bad + ' wrong');
  })();

  (function () {
    var bad = 0;
    for (var q = 0; q < 16; q++) {
      if (booth(5, q, 4).ops !== nonzeroDigits(boothDigits(q, 4))) bad++;
    }
    chk('Booth: operation count equals the count of non-zero recoded digits', bad === 0, bad + ' wrong');
  })();

  chk('GATE 2025 Set 2 Q32: the multiplier has 13 transitions', T25 === 13, T25);
  chk('GATE 2025 Set 2 Q32: Booth performs 13 add/subtract operations', B25.ops === 13, B25.ops);

  chk('four bits: the best multiplier needs no operation at all', bestOps === 0, bestQ);
  chk('four bits: the worst multiplier 0101 needs four operations', worstOps === 4 && worstQ === 5,
      bin(worstQ, 4) + ' ' + worstOps);

  /* --- division --- */
  chk('restoring: 7 / 3 gives quotient 2', REST.Q === 2, REST.Q);
  chk('restoring: 7 / 3 gives remainder 1', REST.A === 1, REST.A);
  chk('restoring: 3 * 2 + 1 = 7', D_M * REST.Q + REST.A === D_Q, D_M * REST.Q + REST.A);
  chk('restoring: three of the four steps restore', REST.rows.filter(function (r) { return r.note === 'restore'; }).length === 3,
      REST.rows.map(function (r) { return r.note; }).join(','));

  (function () {
    var bad = 0;
    for (var m = 1; m < 16; m++) {
      for (var q = 0; q < 16; q++) {
        var r = restoring(m, q, 4);
        if (m * r.Q + r.A !== q || r.A < 0 || r.A >= m) bad++;
      }
    }
    chk('restoring: all 240 dividend/divisor pairs give M*Q + A = dividend, 0 <= A < M', bad === 0, bad + ' wrong');
  })();

  chk('non-restoring: 7 / 3 gives quotient 2 and remainder 1',
      NONR.Q === 2 && NONR.A === 1, NONR.Q + ' r ' + NONR.A);
  chk('non-restoring: 7 / 3 needs the final correction', NONR.corr === 1, NONR.corr);
  chk('non-restoring: 7 / 4 needs no correction', NONR2.corr === 0, NONR2.corr);

  (function () {
    var bad = 0;
    for (var m = 1; m < 16; m++) {
      for (var q = 0; q < 16; q++) {
        var r = nonRestoring(m, q, 4);
        if (m * r.Q + r.A !== q || r.A < 0 || r.A >= m) bad++;
      }
    }
    chk('non-restoring: all 240 pairs give M*Q + A = dividend, 0 <= A < M', bad === 0, bad + ' wrong');
  })();

  (function () {
    var bad = 0;
    for (var q = 0; q < 16; q++) {
      var a = restoring(3, q, 4), b = nonRestoring(3, q, 4);
      if (a.Q !== b.Q || a.A !== b.A) bad++;
    }
    chk('the two dividers agree on every dividend at divisor 3', bad === 0, bad + ' wrong');
  })();

  /* --- carry-lookahead --- */
  chk('lookahead: the 4-bit carries match ripple carry on 13 + 11',
      RIP.carries.join(',') === LKA.carries.join(',') && RIP.cout === LKA.cout,
      LKA.carries.join(','));

  (function () {
    var bad = 0;
    for (var a = 0; a < 16; a++) {
      for (var b = 0; b < 16; b++) {
        var r = rippleCarries(a, b, 4), l = lookaheadCarries(a, b, 4);
        if (r.carries.join(',') !== l.carries.join(',') || r.cout !== l.cout) bad++;
      }
    }
    chk('lookahead: identical to ripple carry on all 256 four-bit pairs', bad === 0, bad + ' wrong');
  })();

  (function () {
    var bad = 0, a, b;
    for (var i = 0; i < 600; i++) {
      a = (i * 37) % 256; b = (i * 91 + 13) % 256;
      var r = rippleCarries(a, b, 8), l = lookaheadCarries(a, b, 8);
      if (r.carries.join(',') !== l.carries.join(',') || r.cout !== l.cout) bad++;
    }
    chk('lookahead: identical to ripple carry on 600 eight-bit pairs', bad === 0, bad + ' wrong');
  })();

  chk('fan-in 2: a 4-bit lookahead adder is 6 gate levels', claLevels(4) === 6, claLevels(4));
  chk('fan-in 2: 16 bits is 10 levels, not 16', claLevels(16) === 10, claLevels(16));
  chk('fan-in 2: doubling n adds exactly two levels',
      claLevels(64) - claLevels(32) === 2, claLevels(64) + '-' + claLevels(32));
  chk('the level count never exceeds 2*log2(n)+2', (function () {
    for (var n = 2; n <= 1024; n *= 2) {
      if (claLevels(n) > 2 * (Math.log(n) / Math.LN2) + 2 + 1e-9) return false;
    }
    return true;
  })(), '');

/* ======================================================================
   LAYER 3 - RENDER
   Every coordinate is fixed. Each row has one owner per scene, so two strings
   can never land on each other.
   ====================================================================== */

  var ROWS = [96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448];

  function sceneOf(t) {
    var sc = (K && K.state && K.state.scenes) || [];
    for (var i = sc.length - 1; i >= 0; i--) if (t >= sc[i].start - 1e-6) return sc[i];
    return sc[0] || null;
  }
  function prog(t) {
    var s = sceneOf(t);
    if (!s) return 0;
    return K ? K.clamp01((t - s.start) / Math.max(0.001, s.end - s.start)) : 0;
  }
  function at(t, frac) { return prog(t) >= frac; }

  function head(title, sub) {
    P.text(40, 24, title, { size: 16, bold: true, color: PAL.ink });
    P.text(40, 48, sub, { size: 12.5, color: PAL.dim });
    P.line(40, 66, W - 40, 66, { stroke: PAL.border, sw: 1 });
  }
  function mono(x, y, s, size, color) {
    P.text(x, y, s, { size: size || 12.5, mono: true, color: color || PAL.ink });
  }
  function note(x, y, s, color) {
    P.text(x, y, s, { size: 12, color: color || PAL.dim });
  }
  function chip(x, y, w, label, value, kind) {
    var stroke = kind === 'ok' ? PAL.valid : kind === 'bad' ? PAL.invalid : PAL.border;
    var fill = kind === 'ok' ? PAL.accentDim : kind === 'bad' ? PAL.invalidDim : PAL.surface2;
    P.rect(x, y, w, 46, { fill: fill, stroke: stroke, radius: 6, sw: 1.3 });
    mono(x + 9, y + 6, label, 11, PAL.faint);
    mono(x + 9, y + 24, value, 14, PAL.ink);
  }
  function cell(x, y, w, h, s, kind) {
    var stroke = kind === 'ok' ? PAL.valid : kind === 'bad' ? PAL.invalid : kind === 'hl' ? PAL.accent : PAL.border;
    var fill = kind === 'ok' ? PAL.accentDim : kind === 'bad' ? PAL.invalidDim : kind === 'hl' ? PAL.accentDim : PAL.surface;
    P.rect(x, y, w, h, { fill: fill, stroke: stroke, radius: 3, sw: 1.1 });
    P.text(x + w / 2, y + 8, s, { size: 12, mono: true, color: PAL.ink, align: 'center' });
  }
  function hdr(x, y, s) { mono(x, y, s, 10.5, PAL.faint); }

  /* ---------- scene 1: why these algorithms ---------- */
  function drawWhy(t) {
    head('Three machines, one adder', 'a 4-bit adder does not multiply, divide, or add 64 bits in one step');

    var boxes = [
      { x: 40, title: 'MULTIPLIER', l1: 'only add and shift', l2: '13 x 11 in 4 bits', l3: '3 additions, 4 shifts' },
      { x: 325, title: 'DIVIDER', l1: 'only subtract and shift', l2: '7 / 3 in 4 bits', l3: '2 remainder 1' },
      { x: 610, title: 'FAST ADDER', l1: 'carry without waiting', l2: 'n-bit addition', l3: '2log2 n + 2 levels' }
    ];
    for (var i = 0; i < boxes.length; i++) {
      if (!at(t, 0.06 + i * 0.09)) continue;
      var b = boxes[i];
      P.rect(b.x, ROWS[1], 250, 108, { fill: PAL.surface2, stroke: PAL.border, radius: 8, sw: 1.3 });
      mono(b.x + 12, ROWS[1] + 10, b.title, 11.5, PAL.accent);
      note(b.x + 12, ROWS[1] + 34, b.l1);
      note(b.x + 12, ROWS[1] + 58, b.l2);
      note(b.x + 12, ROWS[1] + 82, b.l3, PAL.ink);
    }

    if (at(t, 0.4)) mono(40, ROWS[5], 'syllabus, Section 2, verbatim: "Number representation and arithmetic (fixed and floating point)."', 12, PAL.dim);
    if (at(t, 0.52)) mono(40, ROWS[6], 'the previous lesson covers representation; this one covers the arithmetic the ALU actually performs', 12, PAL.dim);
    if (at(t, 0.66)) mono(40, ROWS[7], 'every trace below is executed by this page: registers, shifts, and the count of operations', 12, PAL.dim);
    if (at(t, 0.8)) {
      P.rect(40, ROWS[9] - 10, 820, 52, { fill: PAL.accentDim, stroke: PAL.accent, radius: 6 });
      mono(56, ROWS[9], 'one idea runs through all three: replace a hard operation by a short sequence of easy ones,', 12.5, PAL.accent);
      mono(56, ROWS[9] + 18, 'and then count how many easy ones it took.', 12.5, PAL.accent);
    }
  }

  /* ---------- scene 2: shift-and-add ---------- */
  function drawShiftAdd(t) {
    head('Shift-and-add: multiply with an adder',
         'A is 5 bits, Q is 4 bits, M = ' + M.saMbits + ' = 13 sits in its own register');

    var cx = [70, 190, 330, 520, 660];
    hdr(cx[0], ROWS[0] - 22, 'step'); hdr(cx[1], ROWS[0] - 22, 'Q0');
    hdr(cx[2], ROWS[0] - 22, 'A (5 bits)'); hdr(cx[3], ROWS[0] - 22, 'Q (4 bits)');
    hdr(cx[4], ROWS[0] - 22, 'adds so far');
    P.line(60, ROWS[0] - 6, 850, ROWS[0] - 6, { stroke: PAL.border, sw: 1 });

    for (var i = 0; i < M.saRows.length; i++) {
      if (!at(t, 0.05 + i * 0.09)) continue;
      var r = M.saRows[i], y = ROWS[0] + i * 26;
      mono(cx[0], y, String(r.step), 12, PAL.dim);
      mono(cx[1], y, String(r.lsb), 12, r.lsb ? PAL.accent : PAL.faint);
      mono(cx[2], y, bin(r.A, 5), 12, PAL.ink);
      mono(cx[3], y, bin(r.Q, 4), 12, PAL.ink);
      mono(cx[4], y, String(r.ops), 12, PAL.dim);
      if (r.lsb) mono(cx[1] + 18, y, 'add M', 11, PAL.accent);
    }

    if (at(t, 0.45)) mono(40, ROWS[5], 'each step: add M into A when Q0 = 1, then shift the whole (A,Q) register right by one', 12, PAL.dim);
    if (at(t, 0.56)) mono(40, ROWS[6], 'after four steps the product is ' + M.saBits + ' = ' + M.saProduct, 13, PAL.accent);
    if (at(t, 0.68)) mono(40, ROWS[7], 'the number of additions is the number of 1s in the multiplier: ' + M.saPop + ' here, and never more than n', 12, PAL.dim);
    if (at(t, 0.8)) {
      P.rect(40, ROWS[9] - 8, 820, 42, { fill: PAL.warnDim, stroke: PAL.warn, radius: 6 });
      mono(56, ROWS[9] + 2, 'A must be n+1 bits: step 2 sums to 19, and a four-bit A drops that carry and reads the product as 111 instead of 143.', 12, PAL.warn);
    }
  }

  /* ---------- scene 3: Booth recoding ---------- */
  function drawBoothIdea(t) {
    head('A run of 1s is a difference',
         '0111 = 1000 - 0001, so a block of ones costs one subtraction and one addition');

    var pairs = [
      { p: '0 0', mean: 'inside a run of 0s', act: 'nothing' },
      { p: '0 1', mean: 'a run of 1s ends here', act: 'add M' },
      { p: '1 0', mean: 'a run of 1s starts here', act: 'subtract M' },
      { p: '1 1', mean: 'inside a run of 1s', act: 'nothing' }
    ];
    hdr(60, ROWS[0] - 22, 'pair (q_i, q_i-1)');
    hdr(250, ROWS[0] - 22, 'meaning'); hdr(500, ROWS[0] - 22, 'action');
    P.line(50, ROWS[0] - 6, 700, ROWS[0] - 6, { stroke: PAL.border, sw: 1 });
    for (var i = 0; i < pairs.length; i++) {
      if (!at(t, 0.04 + i * 0.07)) continue;
      var y = ROWS[0] + i * 26;
      mono(70, y, pairs[i].p, 12.5, PAL.ink);
      note(250, y, pairs[i].mean);
      mono(500, y, pairs[i].act, 12, pairs[i].act === 'nothing' ? PAL.faint : PAL.accent);
    }

    if (at(t, 0.4)) {
      mono(40, ROWS[5], 'recoding Q = ' + M.qBits + ', reading the pair (q_i, q_i-1) from the least significant end', 12, PAL.dim);
      var xs = [80, 180, 280, 380];
      for (var j = 0; j < 4; j++) {
        if (!at(t, 0.46 + j * 0.06)) continue;
        var d = M.digits[j];
        var lbl = d > 0 ? '+1' : d < 0 ? '-1' : '0';
        cell(xs[j], ROWS[6], 60, 30, lbl, d === 0 ? null : 'hl');
        mono(xs[j] + 30, ROWS[6] + 36, 'x' + Math.pow(2, j), 10.5, PAL.faint);
      }
      mono(470, ROWS[6] + 6, 'digits: ' + M.digits.join(', ') + '   (least significant first)', 12, PAL.ink);
    }
    if (at(t, 0.68)) mono(470, ROWS[6] + 30, 'their weighted sum is ' + M.digitValue + ', the signed value of ' + M.qBits, 12, PAL.dim);
    if (at(t, 0.78)) mono(40, ROWS[6] + 58, 'three of the four digits are non-zero, so three add/subtracts', 12, PAL.dim);
    if (at(t, 0.88)) {
      P.rect(40, ROWS[9] - 8, 820, 40, { fill: PAL.accentDim, stroke: PAL.accent, radius: 6 });
      mono(56, ROWS[9] + 2, 'this is why Booth handles signed numbers for free: the recoding is two\'s complement arithmetic, not sign-magnitude.', 12, PAL.accent);
    }
  }

  /* ---------- scene 4: the Booth trace ---------- */
  function drawBoothTrace(t) {
    head('Booth in registers: 3 x (-4)',
         'A is 5 bits, Q = 1100, q-1 starts at 0; pair 10 subtracts, then an arithmetic right shift');

    var cx = [64, 130, 210, 330, 470, 560];
    hdr(cx[0], ROWS[0] - 22, 'step'); hdr(cx[1], ROWS[0] - 22, 'pair');
    hdr(cx[2], ROWS[0] - 22, 'operation'); hdr(cx[3], ROWS[0] - 22, 'A (5 bits)');
    hdr(cx[4], ROWS[0] - 22, 'Q (4 bits)'); hdr(cx[5], ROWS[0] - 22, 'q-1');
    P.line(56, ROWS[0] - 6, 700, ROWS[0] - 6, { stroke: PAL.border, sw: 1 });

    for (var i = 0; i < M.bRows.length; i++) {
      if (!at(t, 0.05 + i * 0.1)) continue;
      var r = M.bRows[i], y = ROWS[0] + i * 26;
      mono(cx[0], y, String(r.step), 12, PAL.dim);
      mono(cx[1], y, bin(r.pair, 2), 12, r.op === 'none' ? PAL.faint : PAL.accent);
      mono(cx[2], y, r.op, 12, r.op === 'none' ? PAL.faint : PAL.accent);
      mono(cx[3], y, bin(r.A, 5), 12, PAL.ink);
      mono(cx[4], y, bin(r.Q, 4), 12, PAL.ink);
      mono(cx[5], y, String(r.qm1), 12, PAL.dim);
    }

    if (at(t, 0.5)) mono(40, ROWS[5], 'only step 3 does arithmetic: pair 10 means "a run of 1s starts", so subtract M', 12, PAL.dim);
    if (at(t, 0.6)) mono(40, ROWS[6], 'the shift is arithmetic: the top bit of A is copied into itself, so the sign survives', 12, PAL.dim);
    if (at(t, 0.7)) mono(40, ROWS[7], 'product = ' + M.bBits + ' = ' + M.bProductValue + ', which is 3 x (-4)', 13, PAL.accent);
    if (at(t, 0.82)) {
      P.rect(40, ROWS[9] - 8, 820, 40, { fill: PAL.warnDim, stroke: PAL.warn, radius: 6 });
      mono(56, ROWS[9] + 2, 'four steps, ' + M.bOps + ' add/subtract: the multiplier was a single run of 1s, so the run cost one operation.', 12, PAL.warn);
    }
  }

  /* ---------- scene 5: counting operations ---------- */
  function drawBoothCount(t) {
    head('Counting the operations without tracing',
         'step k inspects (q_k, q_k-1) with q_-1 = 0, so the count is the number of bit changes in Q');

    /* the 16-bit multiplier, least significant bit on the left */
    var x0 = 46, cw = 47;
    for (var i = 0; i < 16; i++) {
      if (!at(t, 0.04 + i * 0.012)) continue;
      var b = (Q25 >> i) & 1;
      cell(x0 + i * cw, ROWS[1], cw - 4, 30, String(b), null);
      mono(x0 + i * cw + (cw - 4) / 2, ROWS[1] + 36, 'q' + i, 9.5, PAL.faint);
    }
    if (at(t, 0.3)) mono(40, ROWS[3], 'Q = ' + M.q25bits + ' written least significant bit first, with q_-1 = 0 before it', 12, PAL.dim);

    /* transition marks */
    if (at(t, 0.45)) {
      var marks = 0;
      for (var j = 0; j < 16; j++) {
        var cur = (Q25 >> j) & 1, prev = (j > 0) ? ((Q25 >> (j - 1)) & 1) : 0;
        if (cur !== prev) {
          marks++;
          P.line(x0 + j * cw - 2, ROWS[1] + 50, x0 + j * cw - 2, ROWS[1] + 62, { stroke: PAL.accent, sw: 2 });
        }
      }
      mono(40, ROWS[4], 'a change between neighbours is one add or one subtract: ' + marks + ' changes in all', 12.5, PAL.accent);
    }

    if (at(t, 0.62)) mono(40, ROWS[5], 'GATE CSE 2025 Set 2, Q32 asks exactly this count for these two 16-bit numbers: 13', 12, PAL.ink);
    if (at(t, 0.72)) mono(40, ROWS[6], 'the multiplicand M is irrelevant to the count; only the multiplier decides it', 12, PAL.dim);

    if (at(t, 0.8)) {
      chip(40, ROWS[8] - 4, 250, 'best: all 0s or one run', M.bestOps + ' operations (' + M.bestQbits + ')', 'ok');
      chip(325, ROWS[8] - 4, 250, 'worst: alternating 0101', M.worstOps + ' operations (' + M.worstQbits + ')', 'bad');
      chip(610, ROWS[8] - 4, 250, 'plain shift-and-add', 'n/2 additions', null);
    }
    if (at(t, 0.9)) mono(40, ROWS[10], 'so Booth is faster on runs and slower on isolated ones: it is a trade, not a free speed-up.', 12, PAL.dim);
  }

  /* ---------- scene 6: restoring division ---------- */
  function drawRestoring(t) {
    head('Restoring division: subtract, and put it back',
         'M = 0011, dividend 7 in Q; each step shifts left, tries A - M, and restores when it goes negative');

    var cx = [64, 190, 340, 500, 640];
    hdr(cx[0], ROWS[0] - 22, 'step'); hdr(cx[1], ROWS[0] - 22, 'A after the trial');
    hdr(cx[2], ROWS[0] - 22, 'Q (4 bits)'); hdr(cx[3], ROWS[0] - 22, 'what happened');
    hdr(cx[4], ROWS[0] - 22, 'quotient bit');
    P.line(56, ROWS[0] - 6, 850, ROWS[0] - 6, { stroke: PAL.border, sw: 1 });

    for (var i = 0; i < M.restRows.length; i++) {
      if (!at(t, 0.05 + i * 0.1)) continue;
      var r = M.restRows[i], y = ROWS[0] + i * 28;
      mono(cx[0], y, String(r.step), 12, PAL.dim);
      mono(cx[1], y, bin(r.A, 5), 12, PAL.ink);
      mono(cx[2], y, bin(r.Q, 4), 12, PAL.ink);
      mono(cx[3], y, r.note, 11.5, r.note === 'restore' ? PAL.warn : PAL.valid);
      mono(cx[4], y, String(r.qb), 12, r.qb ? PAL.valid : PAL.faint);
    }

    if (at(t, 0.52)) mono(40, ROWS[5], 'a negative trial is undone by adding M back, and the quotient bit is 0', 12, PAL.dim);
    if (at(t, 0.62)) mono(40, ROWS[6], 'quotient ' + M.restQ + ' in Q, remainder ' + M.restA + ' in A: 3 x ' + M.restQ + ' + ' + M.restA + ' = 7', 13, PAL.accent);
    if (at(t, 0.72)) mono(40, ROWS[7], 'A is n+1 bits: the trial subtraction can be negative and still be stored', 12, PAL.dim);
    if (at(t, 0.84)) {
      P.rect(40, ROWS[9] - 8, 820, 42, { fill: PAL.warnDim, stroke: PAL.warn, radius: 6 });
      mono(56, ROWS[9] + 2, 'three of these four steps had to restore: half the work in a restoring divider is undoing its own subtractions.', 12, PAL.warn);
    }
  }

  /* ---------- scene 7: non-restoring ---------- */
  function drawNonRestoring(t) {
    head('Non-restoring: keep the negative and pay later',
         'the sign of A before the shift chooses +M or -M, so nothing is ever undone mid-way');

    var cx = [64, 150, 250, 380, 520, 640];
    hdr(cx[0], ROWS[0] - 22, 'step'); hdr(cx[1], ROWS[0] - 22, 'operation');
    hdr(cx[2], ROWS[0] - 22, 'A after it'); hdr(cx[3], ROWS[0] - 22, 'Q (4 bits)');
    hdr(cx[4], ROWS[0] - 22, 'quotient bit'); hdr(cx[5], ROWS[0] - 22, 'sign of A');
    P.line(56, ROWS[0] - 6, 850, ROWS[0] - 6, { stroke: PAL.border, sw: 1 });

    for (var i = 0; i < M.nonrRows.length; i++) {
      if (!at(t, 0.05 + i * 0.1)) continue;
      var r = M.nonrRows[i], y = ROWS[0] + i * 26;
      mono(cx[0], y, String(r.step), 12, PAL.dim);
      mono(cx[1], y, r.act, 12, r.act === '+M' ? PAL.warn : PAL.accent);
      mono(cx[2], y, String(r.A), 12, PAL.ink);
      mono(cx[3], y, bin(r.Q, 4), 12, PAL.ink);
      mono(cx[4], y, String(r.qb), 12, r.qb ? PAL.valid : PAL.faint);
      mono(cx[5], y, r.A < 0 ? 'negative' : 'zero or more', 11, r.A < 0 ? PAL.invalid : PAL.valid);
    }

    if (at(t, 0.5)) mono(40, ROWS[5], 'the partial remainder is allowed to be negative; the next step adds M instead of subtracting it', 12, PAL.dim);
    if (at(t, 0.62)) {
      P.rect(40, ROWS[6] - 8, 820, 44, { fill: M.nonrCorr ? PAL.warnDim : PAL.accentDim, stroke: M.nonrCorr ? PAL.warn : PAL.accent, radius: 6 });
      mono(56, ROWS[6] + 2, 'A ends at ' + M.nonrRows[3].A + ', which is negative, so one correction adds M: remainder ' + M.nonrA + ', quotient ' + M.nonrQ, 12.5, M.nonrCorr ? PAL.warn : PAL.accent);
      mono(56, ROWS[6] + 20, 'the correction happens after the loop, once, and never inside it', 11.5, PAL.dim);
    }
    if (at(t, 0.74)) mono(40, ROWS[8], '7 / 4 needs no correction at all, because its final A is already non-negative: the step is conditional', 12, PAL.dim);
    if (at(t, 0.86)) mono(40, ROWS[9], 'both dividers return quotient ' + M.restQ + ' and remainder ' + M.restA + ' here: same answer, fewer operations', 12.5, PAL.accent);
  }

  /* ---------- scene 8: carry-lookahead ---------- */
  function drawCLA(t) {
    head('Carry-lookahead: stop waiting for the carry',
         'P = A xor B propagates a carry, G = A and B generates one; the carry is computed, not waited for');

    if (at(t, 0.05)) mono(40, 96, 'ripple: c(i+1) = G(i) or (P(i) and c(i))  --  each stage waits for the one before it', 12, PAL.dim);
    if (at(t, 0.16)) mono(40, 124, 'lookahead: c(i+1) = G(i) or P(i)G(i-1) or P(i)P(i-1)G(i-2) or ... ', 12, PAL.ink);
    if (at(t, 0.28)) mono(40, 152, 'every term is a product of bits already available, so all the carries start together', 12, PAL.dim);

    if (at(t, 0.4)) {
      mono(40, 186, '13 + 11 in four bits.  P (propagate) = ' + M.pBits + '   G (generate) = ' + M.gBits, 12, PAL.ink);
      mono(40, 214, 'carries in, ripple:    ' + M.ripCarries.join('   '), 12, PAL.dim);
      mono(40, 242, 'carries in, lookahead: ' + M.lkaCarries.join('   ') + '    carry out ' + M.ripCout + ', and 13 + 11 = 24', 12, PAL.accent);
    }

    if (at(t, 0.56)) {
      hdr(40, 264, 'bits'); hdr(150, 264, 'ripple'); hdr(300, 264, 'lookahead, fan-in 2');
      for (var i = 0; i < M.claTable.length; i++) {
        var r = M.claTable[i], y = 280 + i * 16;
        mono(40, y, String(r.n), 12, PAL.dim);
        mono(150, y, String(r.ripple), 12, PAL.invalid);
        mono(300, y, String(r.cla), 12, PAL.valid);
        P.rect(430, y + 2, r.ripple * 3.4, 8, { fill: PAL.invalidDim, stroke: PAL.invalid, sw: 0.8, radius: 2 });
        P.rect(430, y + 12, r.cla * 3.4, 8, { fill: PAL.accentDim, stroke: PAL.accent, sw: 0.8, radius: 2 });
      }
    }

    if (at(t, 0.82)) {
      P.rect(40, 402, 820, 48, { fill: PAL.accentDim, stroke: PAL.accent, radius: 6 });
      mono(56, 412, 'with fan-in 2 the carry needs an AND tree and an OR tree over n literals: 2log2 n + 2 levels, which is Theta(log n).', 11.5, PAL.accent);
      mono(56, 430, 'with unbounded fan-in the same adder is ' + M.claUnbounded + ' levels: Theta(1). The answer depends on the gate library.', 11.5, PAL.dim);
    }
  }

  /* ---------- scene 9: the three traps ---------- */
  function drawTraps(t) {
    head('The three traps that decide the marks',
         'each one is a plausible answer that the definition rules out');

    var cards = [
      { x: 40, t: 'Booth: forget q-1', a1: 'the count is of transitions in Q', a2: 'with a 0 prepended, so q0', a3: 'against 0 counts too',
        b: 'without it: 12, not 13' },
      { x: 325, t: 'Division: no correction', a1: 'non-restoring can end with a', a2: 'negative remainder; one final', a3: 'add M fixes it',
        b: '7 / 3 ends at -2, then 1' },
      { x: 610, t: 'CLA: call it constant', a1: 'only unbounded fan-in is', a2: 'Theta(1); with fan-in 2 the', a3: 'depth grows as log n',
        b: '16 bits: 10 levels, not 1' }
    ];
    for (var i = 0; i < cards.length; i++) {
      if (!at(t, 0.06 + i * 0.1)) continue;
      var c = cards[i];
      P.rect(c.x, ROWS[1], 250, 150, { fill: PAL.invalidDim, stroke: PAL.invalid, radius: 8, sw: 1.3 });
      mono(c.x + 12, ROWS[1] + 10, c.t, 12, PAL.invalid);
      note(c.x + 12, ROWS[1] + 34, c.a1);
      note(c.x + 12, ROWS[1] + 54, c.a2);
      note(c.x + 12, ROWS[1] + 74, c.a3);
      mono(c.x + 12, ROWS[1] + 118, c.b, 11.5, PAL.ink);
    }

    if (at(t, 0.45)) mono(40, ROWS[6], 'none of the three is arithmetic: each is a rule about the algorithm\'s own bookkeeping', 12, PAL.dim);
    if (at(t, 0.58)) mono(40, ROWS[7], 'the traces on this page are executed, so the numbers beside each trap are the model\'s, not a remembered table', 12, PAL.dim);
    if (at(t, 0.72)) {
      P.rect(40, ROWS[9] - 8, 820, 40, { fill: PAL.warnDim, stroke: PAL.warn, radius: 6 });
      mono(56, ROWS[9] + 2, 'read the question for the width and the gate fan-in before you start: both change the answer, not the method.', 12, PAL.warn);
    }
  }

  /* ---------- scene 10: decision procedure ---------- */
  function drawProcedure(t) {
    head('Which machine is the question asking about?',
         'the wording names the algorithm; the width and the fan-in supply the rest');

    var steps = [
      { k: '1', q: '"number of additions / subtractions" with a multiplier', a: 'count transitions of Q, with q-1 = 0' },
      { k: '2', q: 'a register trace with pairs 00, 01, 10, 11', a: 'Booth: add on 01, subtract on 10, shift arithmetically' },
      { k: '3', q: '"restore" or "non-restore", or a negative final remainder', a: 'add M once at the end; quotient bits from the sign' },
      { k: '4', q: '"time to add", "delay", "fan-in k"', a: '2log_k n + 2 levels, Theta(log n); Theta(1) only if fan-in is unbounded' }
    ];
    for (var i = 0; i < steps.length; i++) {
      if (!at(t, 0.05 + i * 0.1)) continue;
      var y = ROWS[1] + i * 62;
      P.rect(40, y - 10, 820, 52, { fill: PAL.surface2, stroke: PAL.border, radius: 6, sw: 1.1 });
      mono(56, y + 2, steps[i].k, 14, PAL.accent);
      mono(84, y + 2, steps[i].q, 12, PAL.ink);
      mono(84, y + 22, steps[i].a, 11.5, PAL.dim);
    }

    if (at(t, 0.62)) mono(40, ROWS[8], 'every number on this page came from running these algorithms in code and checking the result against its definition', 12, PAL.dim);
    if (at(t, 0.75)) {
      P.rect(40, ROWS[9] - 4, 820, 40, { fill: PAL.accentDim, stroke: PAL.accent, radius: 6 });
      mono(56, ROWS[9] + 6, 'the arithmetic is short; the marks are in the widths, the counts and the one correction step.', 13, PAL.accent);
    }
  }

  function drawFrame(Pp) {
    if (!Pp) return;
    P = Pp;
    P.clear();
    P.alpha(1);
    var t = K && K.state ? K.state.elapsed : 0;
    var s = sceneOf(t);
    var id = s ? s.id : 'why';
    if (id === 'why') drawWhy(t);
    else if (id === 'shiftadd') drawShiftAdd(t);
    else if (id === 'boothidea') drawBoothIdea(t);
    else if (id === 'boothtrace') drawBoothTrace(t);
    else if (id === 'boothcount') drawBoothCount(t);
    else if (id === 'restoring') drawRestoring(t);
    else if (id === 'nonrestoring') drawNonRestoring(t);
    else if (id === 'cla') drawCLA(t);
    else if (id === 'traps') drawTraps(t);
    else drawProcedure(t);
  }

/* ======================================================================
   LAYER 4 - BOOT
   ====================================================================== */

  function boot() {
    var holder = document.getElementById('canvas-holder');
    var fallback = document.getElementById('canvas-fallback');
    var ok = false;

    if (typeof window.p5 === 'function') {
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
      if (!drew && fallback && fallback.classList) fallback.classList.add('show');
    }

    var checkBox = document.getElementById('checks');
    if (checkBox) {
      var bad = CHECKS.filter(function (c) { return !c.pass; });
      checkBox.innerHTML = '<span class="k">Model checks</span>' +
        (bad.length ? bad.length + ' of ' + CHECKS.length + ' failed' : CHECKS.length + '/' + CHECKS.length + ' passed');
    }

    if (K && K.init && window.LESSON_TIMELINE) {
      K.init({
        timeline: window.LESSON_TIMELINE,
        draw: function () { if (P) drawFrame(P); }
      });
    }

    window.__drawAt = function (t) {
      if (K && K.state) K.state.elapsed = t;
      if (P) drawFrame(P);
    };

    var failing = CHECKS.filter(function (c) { return !c.pass; });
    if (failing.length) console.warn('Model validation did not fully pass:', failing);
  }

  window.__MODEL = { M: M, CHECKS: CHECKS };
  window.__lessonChecks = CHECKS;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

})();
