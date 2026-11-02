/* ==========================================================================
   flip-flop-conversion - model, validation, render.

   Layer 1  model      : the four characteristic tables, the four excitation
                         tables derived by search, the twelve conversions
                         derived by exact minimisation, the gate count under a
                         stated convention, the naive-wiring failure, and the
                         two previous-year computations.
   Layer 2  validation : every quoted number is recomputed here by a second
                         route - the derived equation is re-simulated against
                         the target on every row of its domain.
   Layer 3  render     : reads the model; never re-derives a number.
   Layer 4  timeline   : in timeline.js - the only source of time.

   No p5.brush: every mark is a table cell, a gate box or a number the learner
   has to read exactly. A random stroke offset would blur the thing being read.
   ========================================================================== */

(function () {
  'use strict';

  var K = window.LessonKit;
  var PR = window.Painters;
  var W = 900, H = 470;
  var P = null;
  var PAL = (PR && PR.PAL) || {
    ink: '#0f1720', dim: '#566573', faint: '#7d8b98', surface: '#ffffff',
    surface2: '#eef2f4', border: '#c8d2d8', accent: '#0f766e', accentDim: '#d6efeb',
    valid: '#15803d', invalid: '#b3261e', invalidDim: '#fbe4e2',
    warn: '#9a5406', warnDim: '#fbeed3', info: '#1d4e89'
  };

  /* ======================================================================
     LAYER 1 - THE MODEL
     Four types. SR and JK take two inputs; D and T take one. next() is the
     characteristic table: the next state for an input combination and Q.
     ====================================================================== */

  var TYPES = ['SR', 'JK', 'D', 'T'];
  var INPUTS = { SR: ['S', 'R'], JK: ['J', 'K'], D: ['D'], T: ['T'] };

  function next(type, inp, Q) {
    var a = inp[0], b = inp[1];
    if (type === 'SR') {
      if (a === 1 && b === 1) return null;          /* the one forbidden row */
      if (a === 1) return 1;
      if (b === 1) return 0;
      return Q;
    }
    if (type === 'JK') {
      if (a === 1 && b === 1) return Q ? 0 : 1;
      if (a === 1) return 1;
      if (b === 1) return 0;
      return Q;
    }
    if (type === 'D') return a;
    return a ? (Q ? 0 : 1) : Q;                     /* T */
  }

  function combos(type) {
    var n = INPUTS[type].length, out = [], m, v, i;
    for (m = 0; m < (1 << n); m++) {
      v = [];
      for (i = 0; i < n; i++) v.push((m >> (n - 1 - i)) & 1);
      out.push(v);
    }
    return out;
  }

  /* --- excitation table, derived by search over every input combination --- */
  function excite(type) {
    var rows = [], Q, Pp;
    for (Q = 0; Q <= 1; Q++) {
      for (Pp = 0; Pp <= 1; Pp++) {
        rows.push({
          from: Q, to: Pp,
          inputs: combos(type).filter(function (inp) { return next(type, inp, Q) === Pp; })
        });
      }
    }
    return rows;
  }

  var EXCITE = {};
  TYPES.forEach(function (t) { EXCITE[t] = excite(t); });

  /* --- exact two-level minimisation over at most three variables --- */
  function combine(a, b) {
    var diff = -1, i;
    for (i = 0; i < a.length; i++) {
      if (a[i] === 2 && b[i] === 2) continue;
      if (a[i] === 2 || b[i] === 2) return null;
      if (a[i] !== b[i]) { if (diff !== -1) return null; diff = i; }
    }
    if (diff === -1) return null;
    var c = a.slice(); c[diff] = 2; return c;
  }
  function covers(term, m) {
    for (var i = 0; i < term.length; i++) {
      if (term[i] !== 2 && term[i] !== m[i]) return false;
    }
    return true;
  }
  function bitsOf(v, nv) {
    var t = [], i;
    for (i = nv - 1; i >= 0; i--) t.push((v >> i) & 1);
    return t;
  }
  function primeImplicants(ones, dcs, nv) {
    var cur = ones.concat(dcs).map(function (v) { return bitsOf(v, nv); });
    var seen = {}, all = [];
    while (cur.length) {
      var used = cur.map(function () { return false; });
      var nxt = [], nextSeen = {}, i, j, k, c;
      for (i = 0; i < cur.length; i++) {
        for (j = i + 1; j < cur.length; j++) {
          c = combine(cur[i], cur[j]);
          if (c) {
            used[i] = true; used[j] = true;
            k = c.join('');
            if (!nextSeen[k]) { nextSeen[k] = 1; nxt.push(c); }
          }
        }
      }
      for (i = 0; i < cur.length; i++) {
        if (!used[i]) {
          k = cur[i].join('');
          if (!seen[k]) { seen[k] = 1; all.push(cur[i]); }
        }
      }
      cur = nxt;
    }
    return all;
  }
  function minSOP(ones, dcs, nv) {
    if (!ones.length) return { terms: [], literals: 0 };
    var P = primeImplicants(ones, dcs, nv);
    var n = P.length, best = null, mask, t, q;
    for (mask = 1; mask < (1 << n); mask++) {
      var ok = true, cnt = 0, lits = 0, oi;
      for (oi = 0; oi < ones.length; oi++) {
        var m = bitsOf(ones[oi], nv), hit = false;
        for (t = 0; t < n; t++) if (mask & (1 << t)) if (covers(P[t], m)) { hit = true; break; }
        if (!hit) { ok = false; break; }
      }
      if (!ok) continue;
      for (t = 0; t < n; t++) if (mask & (1 << t)) {
        cnt++;
        for (q = 0; q < nv; q++) if (P[t][q] !== 2) lits++;
      }
      if (!best || cnt < best.cnt || (cnt === best.cnt && lits < best.lits)) {
        best = { cnt: cnt, lits: lits, terms: P.filter(function (_, i) { return mask & (1 << i); }) };
      }
    }
    best.terms = best.terms.filter(function (tm) {
      return ones.some(function (o) { return covers(tm, bitsOf(o, nv)); });
    });
    var l2 = 0;
    best.terms.forEach(function (tm) { tm.forEach(function (v) { if (v !== 2) l2++; }); });
    return { terms: best.terms, literals: l2 };
  }

  /* --- one conversion: build host so that it behaves as target --- */
  function convert(host, target) {
    var tv = INPUTS[target], tvn = tv.length;
    var hv = INPUTS[host], hvn = hv.length;
    var nv = tvn + 1;                                   /* target inputs, then Q */
    var allT = combos(target);
    var kept = allT.filter(function (inp) { return next(target, inp, 0) !== null; });
    var dropped = allT.filter(function (inp) { return next(target, inp, 0) === null; });

    var rows = [];
    kept.forEach(function (inp) {
      for (var Q = 0; Q <= 1; Q++) rows.push({ inp: inp, Q: Q, P: next(target, inp, Q) });
    });

    /* the host input value required by each row; 'X' where the host is free */
    var hostVals = [];
    for (var h = 0; h < hvn; h++) {
      hostVals.push(rows.map(function (r) {
        var hits = combos(host).filter(function (hinp) { return next(host, hinp, r.Q) === r.P; });
        var vals = hits.map(function (hinp) { return hinp[h]; });
        if (!vals.length) return 'NONE';
        var same = true;
        vals.forEach(function (v) { if (v !== vals[0]) same = false; });
        return same ? vals[0] : 'X';
      }));
    }

    var eqs = [];
    for (var h2 = 0; h2 < hvn; h2++) {
      var ones = [], dcs = [], dead = false;
      /* a row the target itself forbids can never be exercised: a don't-care */
      dropped.forEach(function (inp) {
        for (var Qd = 0; Qd <= 1; Qd++) {
          var md = 0;
          inp.forEach(function (v) { md = (md << 1) | v; });
          dcs.push((md << 1) | Qd);
        }
      });
      rows.forEach(function (r, i) {
        var m = 0;
        r.inp.forEach(function (v) { m = (m << 1) | v; });
        m = (m << 1) | r.Q;
        var v = hostVals[h2][i];
        if (v === 'NONE') dead = true;
        else if (v === 'X') dcs.push(m);
        else if (v === 1) ones.push(m);
      });
      var sop = minSOP(ones, dcs, nv);
      eqs.push({ varName: hv[h2], terms: sop.terms, literals: sop.literals, impossible: dead });
    }

    /* gate count: two-input AND, OR and NOT. Q and Q' are taken from the
       flip-flop's own outputs; a complement of the target's own input costs
       one NOT. The same convention is applied to all twelve conversions. */
    var compNeeded = {}, ands = 0, ors = 0;
    eqs.forEach(function (e) {
      e.terms.forEach(function (t) {
        var k = 0, i;
        for (i = 0; i < tvn; i++) {
          if (t[i] === 0) { compNeeded[tv[i]] = 1; k++; }
          else if (t[i] === 1) k++;
        }
        if (t[tvn] !== 2) k++;                       /* Q or Q' is a literal too */
        if (k > 0) ands += (k - 1);
      });
      if (e.terms.length > 1) ors += (e.terms.length - 1);
    });
    var nots = Object.keys(compNeeded).length;

    /* --- verification: simulate the host on every row of the domain --- */
    var bad = [], checked = 0;
    kept.forEach(function (inp) {
      for (var Q = 0; Q <= 1; Q++) {
        var hostIn = eqs.map(function (e) {
          var val = 0;
          e.terms.forEach(function (t) {
            var prod = 1, i;
            for (i = 0; i < tvn; i++) {
              if (t[i] === 0) prod = prod && (inp[i] === 0);
              else if (t[i] === 1) prod = prod && (inp[i] === 1);
            }
            if (t[tvn] === 0) prod = prod && (Q === 0);
            else if (t[tvn] === 1) prod = prod && (Q === 1);
            if (prod) val = 1;
          });
          return val;
        });
        checked++;
        if (next(host, hostIn, Q) !== next(target, inp, Q)) {
          bad.push({ inp: inp, Q: Q });
        }
      }
    });

    /* a conversion into an SR host must never drive S = R = 1 */
    var forbiddenDriven = 0;
    if (host === 'SR') {
      kept.forEach(function (inp) {
        for (var Q = 0; Q <= 1; Q++) {
          var s = evalEq(eqs[0], inp, Q), r = evalEq(eqs[1], inp, Q);
          if (s === 1 && r === 1) forbiddenDriven++;
        }
      });
    }

    return {
      host: host, target: target, eqs: eqs, checked: checked,
      rowsInDomain: checked, domainDropped: dropped.length * 2,
      ands: ands, ors: ors, nots: nots, gates: ands + ors + nots,
      failures: bad, forbiddenDriven: forbiddenDriven,
      usesQ: eqs.some(function (e) {
        return e.terms.some(function (t) { return t[nv - 1] !== 2; });
      }),
      names: tv, nv: nv
    };
  }

  function evalEq(e, inp, Q) {
    var val = 0;
    e.terms.forEach(function (t) {
      var prod = true, i;
      for (i = 0; i < inp.length; i++) {
        if (t[i] === 0) prod = prod && (inp[i] === 0);
        else if (t[i] === 1) prod = prod && (inp[i] === 1);
      }
      if (t[inp.length] === 0) prod = prod && (Q === 0);
      else if (t[inp.length] === 1) prod = prod && (Q === 1);
      if (prod) val = 1;
    });
    return val;
  }

  /* --- the twelve conversions --- */
  var CONV = {}, LIST = [];
  TYPES.forEach(function (h) {
    CONV[h] = {};
    TYPES.forEach(function (t) {
      if (h === t) return;
      var c = convert(h, t);
      CONV[h][t] = c;
      LIST.push(c);
    });
  });

  function hostTotal(h) {
    return TYPES.reduce(function (a, t) { return h === t ? a : a + CONV[h][t].gates; }, 0);
  }
  var HOST_TOTALS = {};
  TYPES.forEach(function (h) { HOST_TOTALS[h] = hostTotal(h); });

  var TOTAL_GATES = LIST.reduce(function (a, c) { return a + c.gates; }, 0);
  var TOTAL_ROWS = LIST.reduce(function (a, c) { return a + c.checked; }, 0);
  var ZERO_GATE = LIST.filter(function (c) { return c.gates === 0; })
                      .map(function (c) { return c.host + '->' + c.target; });
  var ONE_EQ = LIST.filter(function (c) { return c.eqs.length === 1; }).length;
  var USES_Q = LIST.filter(function (c) { return c.usesQ; }).length;
  var MAX_GATE = LIST.reduce(function (a, c) { return Math.max(a, c.gates); }, 0);
  var ALL_PASS = LIST.every(function (c) { return c.failures.length === 0 && c.forbiddenDriven === 0; });

  /* --- the naive SR -> JK wiring, S = J, R = K, simulated --- */
  var NAIVE = (function () {
    var bad = [], rows = 0;
    for (var J = 0; J <= 1; J++) {
      for (var Kk = 0; Kk <= 1; Kk++) {
        for (var Q = 0; Q <= 1; Q++) {
          rows++;
          if (next('SR', [J, Kk], Q) !== next('JK', [J, Kk], Q)) bad.push({ J: J, K: Kk, Q: Q });
        }
      }
    }
    return { rows: rows, bad: bad, good: rows - bad.length };
  })();

  /* --- GATE CSE 2017 Set 2: a 2-bit saturating up counter on T flip-flops --- */
  var SAT = (function () {
    var ns = { '00': '01', '01': '10', '10': '11', '11': '11' };
    var rows = [], onesT1 = [], onesT0 = [];
    ['00', '01', '10', '11'].forEach(function (k, idx) {
      var q1 = +k[0], q0 = +k[1], n = ns[k];
      var t1 = q1 ^ (+n[0]), t0 = q0 ^ (+n[1]);
      rows.push({ q1: q1, q0: q0, n1: +n[0], n0: +n[1], t1: t1, t0: t0, m: idx });
      if (t1) onesT1.push(idx);
      if (t0) onesT0.push(idx);
    });
    var m1 = minSOP(onesT1, [], 2), m0 = minSOP(onesT0, [], 2);
    return { rows: rows, t1: m1, t0: m0 };
  })();

  /* --- GATE CSE 2015 Set 1: a D flip-flop wired to a JK flip-flop --- */
  var SEQ15 = (function () {
    var A = 1, B = 0, seq = [B], i;
    for (i = 0; i < 11; i++) {
      var nA = B;                          /* D input is the JK output */
      var nB = next('JK', [A, A], B);       /* J = K = A */
      A = nA; B = nB;
      seq.push(B);
    }
    var period = 0, k;
    for (k = 1; k <= 5; k++) {
      var okp = true, j;
      for (j = 1; j + k < seq.length; j++) if (seq[j] !== seq[j + k]) okp = false;
      if (okp) { period = k; break; }
    }
    return { seq: seq, period: period, distinct: (function () {
      var s = {}, n = 0;
      seq.forEach(function (v) { if (!s[v]) { s[v] = 1; n++; } });
      return n;
    })() };
  })();

  /* ======================================================================
     LAYER 2 - VALIDATION
     Each check names what it compares and by which second route.
     ====================================================================== */

  var CHECKS = [];
  function chk(name, pass, detail) { CHECKS.push({ name: name, pass: !!pass, detail: detail || '' }); }

  /* every type has four excitation rows, one per transition */
  TYPES.forEach(function (t) {
    chk('excitation table of ' + t + ' has four transitions',
        EXCITE[t].length === 4 && EXCITE[t].every(function (r) { return r.inputs.length > 0; }),
        EXCITE[t].map(function (r) { return r.from + '>' + r.to + ':' + r.inputs.length; }).join(' '));
  });
  chk('SR excitation leaves exactly one input for 0>1',
      EXCITE.SR[1].inputs.length === 1 && EXCITE.SR[1].inputs[0][0] === 1);
  chk('D excitation is single-valued on all four rows',
      EXCITE.D.every(function (r) { return r.inputs.length === 1; }));
  chk('T excitation is single-valued on all four rows',
      EXCITE.T.every(function (r) { return r.inputs.length === 1; }));
  chk('JK excitation leaves a free input on all four of its transitions',
      EXCITE.JK.filter(function (r) { return r.inputs.length === 2; }).length === 4);
  chk('SR excitation has a free input on exactly two rows',
      EXCITE.SR.filter(function (r) { return r.inputs.length === 2; }).length === 2);

  /* each conversion re-simulates the host against the target */
  LIST.forEach(function (c) {
    chk('conversion ' + c.host + ' to ' + c.target + ' reproduces the target on every row',
        c.failures.length === 0,
        c.checked + ' rows, ' + c.failures.length + ' wrong');
  });
  chk('no conversion into an SR host ever drives S = R = 1',
      LIST.filter(function (c) { return c.host === 'SR'; })
          .every(function (c) { return c.forbiddenDriven === 0; }));
  chk('every conversion needs at least one equation',
      LIST.every(function (c) { return c.eqs.length >= 1; }));
  chk('equation count equals the host input count',
      LIST.every(function (c) { return c.eqs.length === INPUTS[c.host].length; }));

  /* row counts of the domain */
  chk('conversions into SR verify on six rows', LIST.filter(function (c) { return c.target === 'SR'; })
      .every(function (c) { return c.checked === 6; }));
  chk('conversions into JK verify on eight rows', LIST.filter(function (c) { return c.target === 'JK'; })
      .every(function (c) { return c.checked === 8; }));
  chk('conversions into D or T verify on four rows',
      LIST.filter(function (c) { return c.target === 'D' || c.target === 'T'; })
          .every(function (c) { return c.checked === 4; }));
  chk('total rows verified is sixty-six', TOTAL_ROWS === 66, String(TOTAL_ROWS));

  /* the computed totals */
  chk('total gate count is twenty-seven', TOTAL_GATES === 27, String(TOTAL_GATES));
  chk('exactly two conversions are free', ZERO_GATE.length === 2, ZERO_GATE.join(' '));
  chk('the free conversions are JK to SR and JK to T',
      ZERO_GATE.indexOf('JK->SR') >= 0 && ZERO_GATE.indexOf('JK->T') >= 0);
  chk('six conversions need one equation', ONE_EQ === 6, String(ONE_EQ));
  chk('eight conversions use Q on the input path', USES_Q === 8, String(USES_Q));
  chk('host totals run JK 1, SR 5, T 10, D 11',
      HOST_TOTALS.JK === 1 && HOST_TOTALS.SR === 5 && HOST_TOTALS.T === 10 && HOST_TOTALS.D === 11,
      JSON.stringify(HOST_TOTALS));
  chk('SR to JK costs two gates', CONV.SR.JK.gates === 2, String(CONV.SR.JK.gates));
  chk('SR to D costs one gate', CONV.SR.D.gates === 1, String(CONV.SR.D.gates));
  chk('JK to D costs one gate', CONV.JK.D.gates === 1, String(CONV.JK.D.gates));
  chk('D to JK costs four gates', CONV.D.JK.gates === 4, String(CONV.D.JK.gates));
  chk('T to JK costs three gates', CONV.T.JK.gates === 3, String(CONV.T.JK.gates));
  chk('D to T and T to D cost the same', CONV.D.T.gates === CONV.T.D.gates,
      CONV.D.T.gates + ' vs ' + CONV.T.D.gates);
  chk('only the D and T pair is symmetric',
      LIST.filter(function (c) { return c.host < c.target; })
          .filter(function (c) { return CONV[c.host][c.target].gates === CONV[c.target][c.host].gates; })
          .length === 1);
  chk('the largest single conversion is four gates', MAX_GATE === 4, String(MAX_GATE));
  chk('the gate count equals AND plus OR plus NOT for every conversion',
      LIST.every(function (c) { return c.gates === c.ands + c.ors + c.nots; }));
  chk('every conversion with two equations has at least one term in each',
      LIST.every(function (c) { return c.eqs.every(function (e) { return e.terms.length >= 1; }); }));

  /* the naive wiring */
  chk('the naive S=J, R=K wiring fails on exactly two rows', NAIVE.bad.length === 2,
      NAIVE.bad.length + ' of ' + NAIVE.rows);
  chk('both naive failures are the J=K=1 rows',
      NAIVE.bad.every(function (b) { return b.J === 1 && b.K === 1; }));

  /* the two previous-year computations */
  chk('the 2017 saturating counter gives T1 on one row only', SAT.t1.terms.length === 1);
  chk('T1 is Q1-bar and Q0',
      SAT.rows.every(function (r) { return r.t1 === ((1 - r.q1) & r.q0); }));
  chk('T0 is Q1-bar or Q0-bar',
      SAT.rows.every(function (r) { return r.t0 === (((1 - r.q1) | (1 - r.q0)) ? 1 : 0); }));
  chk('the 2015 sequence settles into a period of three', SEQ15.period === 3, String(SEQ15.period));
  chk('the 2015 sequence begins zero, one, one',
      SEQ15.seq.slice(0, 4).join('') === '0110', SEQ15.seq.join(''));

  var PASSED = CHECKS.filter(function (c) { return c.pass; }).length;

  /* ======================================================================
     LAYER 3 - RENDER
     ====================================================================== */

  function stage(p, n) {
    var s = Math.floor(K.clamp01(p) * n);
    return s >= n ? n - 1 : s;
  }

  function box(x, y, w, h, label, sub, tone) {
    var fill = tone === 'bad' ? PAL.invalidDim : tone === 'good' ? PAL.accentDim
             : tone === 'warn' ? PAL.warnDim : PAL.surface2;
    var stroke = tone === 'bad' ? PAL.invalid : tone === 'good' ? PAL.accent
             : tone === 'warn' ? PAL.warn : PAL.border;
    P.rect(x, y, w, h, { fill: fill, stroke: stroke, sw: 1.2, radius: 7 });
    if (label) P.text(x + w / 2, y + h / 2 - (sub ? 9 : 0), label, { size: 13, bold: true, align: 'center', base: 'middle', color: PAL.ink });
    if (sub) P.text(x + w / 2, y + h / 2 + 9, sub, { size: 11, align: 'center', base: 'middle', color: PAL.dim });
  }

  /* a grid of cells; data[y][x] is {v, tone} */
  function grid(x, y, cw, ch, cols, rows, head, data) {
    var i, j;
    if (head) {
      for (j = 0; j < head.length; j++) {
        P.text(x + j * cw + cw / 2, y - 8, head[j], { size: 10.5, mono: true, align: 'center', base: 'bottom', color: PAL.dim });
      }
    }
    for (i = 0; i < rows; i++) {
      for (j = 0; j < cols; j++) {
        var cell = (data[i] && data[i][j]) || { v: '' };
        var tone = cell.tone;
        var fill = tone === 'bad' ? PAL.invalidDim : tone === 'good' ? PAL.accentDim
                 : tone === 'warn' ? PAL.warnDim : PAL.surface;
        P.rect(x + j * cw, y + i * ch, cw, ch, {
          fill: fill, stroke: PAL.border, sw: 0.9
        });
        P.text(x + j * cw + cw / 2, y + i * ch + ch / 2, cell.v, {
          size: cell.size || 12, mono: true, align: 'center', base: 'middle',
          color: tone === 'bad' ? PAL.invalid : tone === 'warn' ? PAL.warn
               : tone === 'good' ? PAL.accent : PAL.ink, bold: !!cell.bold
        });
      }
    }
  }

  function title(s, sub) {
    P.text(28, 22, s, { size: 16, bold: true, color: PAL.ink });
    if (sub) P.text(28, 44, sub, { size: 11.5, color: PAL.dim });
  }

  function foot(s, y) {
    P.text(28, y || 440, s, { size: 11, color: PAL.faint });
  }

  /* --- 1. why --------------------------------------------------------- */
  function drawWhy(p) {
    var s = stage(p, 4);
    title('A conversion is an equation problem', 'given the behaviour you want and the device you have');

    box(60, 92, 250, 96, 'TARGET', 'the behaviour wanted', s >= 0 ? 'good' : null);
    P.text(185, 172, 'T = 0 : hold    T = 1 : toggle', { size: 11, mono: true, align: 'center', color: PAL.dim });

    box(590, 92, 250, 96, 'HOST', 'the device in the box', s >= 1 ? null : null);
    P.text(715, 172, 'J, K inputs    Q, not-Q outputs', { size: 11, mono: true, align: 'center', color: PAL.dim });

    if (s >= 1) {
      P.arrow(330, 140, 570, 140, { stroke: PAL.accent, sw: 2, head: 11 });
      P.text(450, 122, 'input logic', { size: 12, bold: true, align: 'center', color: PAL.accent });
      P.text(450, 156, 'one Boolean equation per host input', { size: 10.5, align: 'center', color: PAL.dim });
    }

    if (s >= 2) {
      var x0 = 60, y0 = 236;
      TYPES.forEach(function (h, i) {
        box(x0 + i * 148, y0, 132, 42, h, 'host', null);
      });
      P.text(28, 292, 'four hosts, three targets each, so twelve conversions', { size: 12, color: PAL.ink });
      P.text(28, 312, 'the four diagonal cells are a wire, not a conversion', { size: 11, color: PAL.dim });
    }

    if (s >= 3) {
      P.rect(60, 348, 780, 62, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1, radius: 7 });
      P.text(78, 364, 'Every conversion on this page is derived by minimisation and then simulated on every row of its domain.', { size: 12, color: PAL.ink });
      P.text(78, 386, '12 conversions, ' + TOTAL_ROWS + ' rows verified, ' + PASSED + ' of ' + CHECKS.length + ' model checks pass.', { size: 12, bold: true, color: PAL.accent });
    }
    foot('the storage element never changes; only the logic in front of its inputs does');
  }

  /* --- 2. four -------------------------------------------------------- */
  function drawFour(p) {
    var s = stage(p, 4);
    title('Four types, one question', 'hold, set, reset, or toggle');

    var pos = [[60, 96], [480, 96], [60, 250], [480, 250]];
    TYPES.forEach(function (t, i) {
      if (i > s) return;
      var x = pos[i][0], y = pos[i][1];
      var head = INPUTS[t].concat(['Q+']);
      var rows = combos(t).map(function (inp) {
        var n = next(t, inp, 0);
        var cell = inp.map(function (v) { return { v: String(v) }; });
        cell.push({ v: n === null ? 'X' : String(n), tone: n === null ? 'bad' : null, bold: true });
        return cell;
      });
      /* two columns of Q: show Q=0 and Q=1 side by side */
      var data = [];
      combos(t).forEach(function (inp) {
        var a = inp.map(function (v) { return { v: String(v) }; });
        var n0 = next(t, inp, 0), n1 = next(t, inp, 1);
        a.push({ v: n0 === null ? 'X' : String(n0), tone: n0 === null ? 'bad' : null, bold: true });
        a.push({ v: n1 === null ? 'X' : String(n1), tone: n1 === null ? 'bad' : null, bold: true });
        data.push(a);
      });
      P.text(x, y - 26, t + (INPUTS[t].length === 1 ? ' — one input' : ' — two inputs'), { size: 13, bold: true, color: PAL.ink });
      var cw = 54;
      grid(x, y + 8, cw, 26, head.length + 1, data.length,
           INPUTS[t].concat(['Q=0', 'Q=1']), data);
    });

    if (s >= 3) {
      P.rect(60, 400, 780, 34, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 6 });
      P.text(76, 414, 'The red X cells are SR at S = R = 1, which has no next state. One-input types need two rows; two-input types need four.', { size: 11.5, color: PAL.ink });
    }
    foot('every table here is computed from the characteristic equation, not copied');
  }

  /* --- 3. excite ------------------------------------------------------ */
  function drawExcite(p) {
    var s = stage(p, 4);
    title('The excitation table is the characteristic table read backwards', 'design fixes the transition and asks for the input');

    var rows = EXCITE.JK;
    var data = rows.map(function (r) {
      var jk = [];
      /* the J and K values for this transition, X where free */
      var js = [], ks = [];
      r.inputs.forEach(function (i) { js.push(i[0]); ks.push(i[1]); });
      function one(vals) {
        var same = vals.every(function (v) { return v === vals[0]; });
        return same ? String(vals[0]) : 'X';
      }
      return [
        { v: r.from + ' -> ' + r.to, mono: true, bold: true },
        { v: one(js), tone: one(js) === 'X' ? 'warn' : null, bold: true },
        { v: one(ks), tone: one(ks) === 'X' ? 'warn' : null, bold: true }
      ];
    });
    P.text(60, 92, 'JK as host', { size: 13, bold: true, color: PAL.ink });
    grid(60, 128, 96, 30, 3, 4, ['transition', 'J', 'K'], data);

    var drows = EXCITE.D.map(function (r) {
      return [
        { v: r.from + ' -> ' + r.to, mono: true, bold: true },
        { v: String(r.inputs[0][0]), bold: true }
      ];
    });
    P.text(430, 92, 'D as host', { size: 13, bold: true, color: PAL.ink });
    grid(430, 128, 96, 30, 2, 4, ['transition', 'D'], drows);

    var trows = EXCITE.T.map(function (r) {
      return [
        { v: r.from + ' -> ' + r.to, mono: true, bold: true },
        { v: String(r.inputs[0][0]), bold: true }
      ];
    });
    P.text(660, 92, 'T as host', { size: 13, bold: true, color: PAL.ink });
    grid(660, 128, 96, 30, 2, 4, ['transition', 'T'], trows);

    if (s >= 2) {
      P.text(60, 284, 'X means the host does not care: any value produces the transition.', { size: 12, color: PAL.ink });
      P.text(60, 304, 'JK leaves one free on all four transitions, SR on two, D and T on none.', { size: 12, color: PAL.dim });
    }
    if (s >= 3) {
      P.rect(60, 330, 780, 62, { fill: PAL.warnDim, stroke: PAL.warn, sw: 1, radius: 7 });
      P.text(78, 346, 'The free entries are the currency of this topic.', { size: 12, bold: true, color: PAL.ink });
      P.text(78, 368, 'A host that can choose its input absorbs part of the target for nothing; a host with no free entries must have every bit computed.', { size: 11.5, color: PAL.dim });
    }
    if (s >= 1) {
      P.text(60, 412, 'D and T are single-valued: one input per transition, so a conversion into them is one equation.', { size: 11.5, color: PAL.ink });
    }
    foot('all four excitation tables are derived here by searching every input combination');
  }

  /* --- 4. procedure --------------------------------------------------- */
  function drawProcedure(p) {
    var s = stage(p, 4);
    title('Four steps, and one rule about the variables', 'the same four steps produce all twelve answers');

    var steps = [
      ['1', 'Write the target\'s characteristic table', 'delete any row the target forbids'],
      ['2', 'Read the host\'s excitation table', 'row by row: which host input gives this transition'],
      ['3', 'Minimise each host input', 'over the target\'s inputs and Q'],
      ['4', 'Simulate every row', 'the host must now behave as the target']
    ];
    steps.forEach(function (st, i) {
      var y = 92 + i * 74;
      var on = i === s;
      box(60, y, 780, 60, null, null, on ? 'good' : null);
      P.text(84, y + 30, st[0], { size: 20, bold: true, base: 'middle', color: on ? PAL.accent : PAL.faint });
      P.text(126, y + 18, st[1], { size: 13, bold: true, color: PAL.ink });
      P.text(126, y + 38, st[2], { size: 11, color: PAL.dim });
      if (on) P.text(818, y + 30, 'now', { size: 10, align: 'right', base: 'middle', color: PAL.accent });
    });

    if (s >= 2) {
      P.rect(60, 396, 780, 44, { fill: PAL.invalidDim, stroke: PAL.invalid, sw: 1, radius: 7 });
      P.text(78, 412, 'The map variables are the target\'s inputs and Q. Never the host\'s inputs.', { size: 12, bold: true, color: PAL.invalid });
      P.text(78, 430, 'The host inputs are what you are solving for; writing them as variables solves the wrong direction.', { size: 10.5, color: PAL.dim });
    }
    foot('the minimisation on this page is exact: prime implicants enumerated, smallest cover chosen');
  }

  /* --- 5. free -------------------------------------------------------- */
  function drawFree(p) {
    var s = stage(p, 4);
    title('Two conversions need no gates at all', 'both of them use JK as the host');

    box(60, 96, 200, 76, 'JK', 'J = T, K = T', s >= 0 ? 'good' : null);
    P.text(160, 190, 'T = 0 gives hold, T = 1 gives toggle', { size: 10.5, align: 'center', color: PAL.dim });
    P.text(160, 210, 'JK to T : ' + CONV.JK.T.gates + ' gates', { size: 12, bold: true, align: 'center', color: PAL.accent });

    box(340, 96, 200, 76, 'JK', 'J = S, K = R', s >= 1 ? 'good' : null);
    P.text(440, 190, 'S = R = 1 stays forbidden', { size: 10.5, align: 'center', color: PAL.dim });
    P.text(440, 210, 'JK to SR : ' + CONV.JK.SR.gates + ' gates', { size: 12, bold: true, align: 'center', color: PAL.accent });

    if (s >= 2) {
      P.text(620, 108, 'the reverse directions', { size: 12, bold: true, color: PAL.ink });
      var rowsRev = [
        ['T to JK', CONV.T.JK.gates + ' gates'],
        ['SR to JK', CONV.SR.JK.gates + ' gates'],
        ['D to JK', CONV.D.JK.gates + ' gates']
      ];
      rowsRev.forEach(function (r, i) {
        P.text(620, 134 + i * 24, r[0], { size: 11.5, mono: true, color: PAL.dim });
        P.text(800, 134 + i * 24, r[1], { size: 11.5, mono: true, align: 'right', color: PAL.invalid });
      });
    }
    if (s >= 3) {
      P.rect(60, 250, 780, 90, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1, radius: 7 });
      P.text(78, 268, 'Why JK is free both times', { size: 12.5, bold: true, color: PAL.ink });
      P.text(78, 290, 'JK already contains a hold row (J = K = 0) and a toggle row (J = K = 1).', { size: 11.5, color: PAL.ink });
      P.text(78, 310, 'T asks for exactly those two actions, and SR asks for exactly set and reset, which JK has as J = 1 and K = 1 alone.', { size: 11.5, color: PAL.ink });
      P.text(78, 330, 'No logic is needed to expose an action the host already has.', { size: 11, color: PAL.dim });
    }
    if (s >= 1) {
      P.text(60, 366, 'The conversion into SR is only required on the valid domain, S = R = 0 excluded.', { size: 11.5, color: PAL.ink });
    }
    foot('two of the twelve are free; the other ten are not');
  }

  /* --- 6. sr2jk ------------------------------------------------------- */
  function drawSr2jk(p) {
    var s = stage(p, 4);
    title('SR to JK: the toggle has to be built', 'the naive wiring is the JK-to-SR answer read backwards, and it fails');

    /* the eight rows of the target, with the required S and R */
    var rows = [];
    var data = [];
    [[0, 0], [0, 1], [1, 0], [1, 1]].forEach(function (inp) {
      for (var Q = 0; Q <= 1; Q++) {
        var want = next('JK', inp, Q);
        var sFixed = (inp[0] === 1 && Q === 0) ? 1 : 0;
        var rFixed = (inp[1] === 1 && Q === 1) ? 1 : 0;
        var naiveBad = (inp[0] === 1 && inp[1] === 1);
        data.push([
          { v: inp[0] + ' ' + inp[1], mono: true },
          { v: String(Q), mono: true },
          { v: String(want), mono: true, bold: true },
          { v: String(sFixed), mono: true, tone: 'good' },
          { v: String(rFixed), mono: true, tone: 'good' },
          { v: inp[0] + ' / ' + inp[1], mono: true, tone: naiveBad ? 'bad' : null, size: 11 }
        ]);
      }
    });
    P.text(60, 90, 'target JK, all eight rows', { size: 12, bold: true, color: PAL.ink });
    grid(60, 126, 56, 24, 6, 8, ['J K', 'Q', 'Q+', 'S', 'R', 'naive'], data);

    if (s >= 0) {
      P.text(470, 108, 'S = J Q\'', { size: 15, mono: true, bold: true, color: PAL.accent });
      P.text(470, 134, 'R = K Q', { size: 15, mono: true, bold: true, color: PAL.accent });
      P.text(470, 164, 'two AND gates, no inverter', { size: 11, color: PAL.dim });
      P.text(470, 184, 'cost: ' + CONV.SR.JK.gates + ' gates', { size: 11.5, bold: true, color: PAL.ink });
    }

    if (s >= 1) {
      P.text(470, 216, 'the idea', { size: 12, bold: true, color: PAL.ink });
      P.text(470, 238, 'at Q = 0 the only way to flip is to set,', { size: 11, color: PAL.dim });
      P.text(470, 256, 'so the set input is enabled.', { size: 11, color: PAL.dim });
      P.text(470, 278, 'at Q = 1 the only way to flip is to reset,', { size: 11, color: PAL.dim });
      P.text(470, 296, 'so the reset input is enabled.', { size: 11, color: PAL.dim });
    }

    if (s >= 2) {
      P.rect(470, 316, 370, 52, { fill: PAL.invalidDim, stroke: PAL.invalid, sw: 1, radius: 7 });
      P.text(486, 332, 'the naive column: S = J, R = K', { size: 11.5, bold: true, color: PAL.invalid });
      P.text(486, 352, 'wrong on ' + NAIVE.bad.length + ' of ' + NAIVE.rows + ' rows, both J = K = 1', { size: 11, color: PAL.dim });
    }

    if (s >= 3) {
      P.rect(60, 330, 380, 52, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1, radius: 7 });
      P.text(76, 346, 'S and R are never both 1', { size: 11.5, bold: true, color: PAL.ink });
      P.text(76, 366, 'checked on all eight rows: ' + CONV.SR.JK.forbiddenDriven + ' violations', { size: 11, color: PAL.dim });
    }
    foot('S is J and not-Q, R is K and Q: the present state steers the toggle');
  }

  /* --- 7. d2jk -------------------------------------------------------- */
  function drawD2jk(p) {
    var s = stage(p, 4);
    title('From a one-input host: the equation carries the whole target', 'D names the next state directly, so D is the target\'s own next-state expression');

    var cases = [
      ['D to SR', 'D = S + R\'Q', CONV.D.SR],
      ['D to JK', 'D = JQ\' + K\'Q', CONV.D.JK],
      ['D to T', 'D = T\'Q + TQ\'', CONV.D.T]
    ];
    cases.forEach(function (c, i) {
      if (i > s) return;
      var y = 96 + i * 96;
      box(60, y, 780, 78, null, null, null);
      P.text(80, y + 26, c[0], { size: 13, bold: true, color: PAL.ink });
      P.text(80, y + 54, c[1], { size: 15, mono: true, bold: true, color: PAL.accent });
      var cv = c[2];
      P.text(560, y + 26, cv.gates + ' gates', { size: 12, bold: true, color: PAL.ink });
      P.text(560, y + 48, cv.ands + ' AND, ' + cv.ors + ' OR, ' + cv.nots + ' NOT', { size: 11, color: PAL.dim });
      P.text(560, y + 66, cv.eqs[0].literals + ' literals in ' + cv.eqs[0].terms.length + ' term' + (cv.eqs[0].terms.length === 1 ? '' : 's'), { size: 10.5, color: PAL.faint });
      P.text(300, y + 26, 'one equation', { size: 10.5, color: PAL.dim });
    });

    if (s >= 3) {
      P.rect(60, 388, 780, 52, { fill: PAL.warnDim, stroke: PAL.warn, sw: 1, radius: 7 });
      P.text(78, 404, 'A one-input host is the most expensive host', { size: 12, bold: true, color: PAL.ink });
      P.text(78, 424, 'D as host costs ' + HOST_TOTALS.D + ' gates across its three conversions; JK as host costs ' + HOST_TOTALS.JK + '.', { size: 11.5, color: PAL.dim });
    }
    foot('the D to JK equation is the JK characteristic equation itself, which is why it looks familiar');
  }

  /* --- 8. xor --------------------------------------------------------- */
  function drawXor(p) {
    var s = stage(p, 4);
    title('D and T: the one pair that costs the same both ways', 'exclusive-or is symmetric in its two arguments');

    box(60, 96, 250, 60, 'D as host, T as target', null, s >= 0 ? 'good' : null);
    P.text(185, 176, 'D = T xor Q', { size: 15, mono: true, bold: true, align: 'center', color: PAL.accent });
    P.text(185, 198, CONV.D.T.gates + ' gates in AND-OR-NOT', { size: 11, align: 'center', color: PAL.dim });

    box(340, 96, 250, 60, 'T as host, D as target', null, s >= 0 ? 'good' : null);
    P.text(465, 176, 'T = D xor Q', { size: 15, mono: true, bold: true, align: 'center', color: PAL.accent });
    P.text(465, 198, CONV.T.D.gates + ' gates in AND-OR-NOT', { size: 11, align: 'center', color: PAL.dim });

    P.text(640, 118, 'as one XOR gate', { size: 11.5, bold: true, color: PAL.ink });
    P.text(640, 140, 'each direction: 1', { size: 11, mono: true, color: PAL.dim });
    P.text(640, 160, 'as AND-OR-NOT: ' + CONV.D.T.gates + ' and ' + CONV.T.D.gates, { size: 11, mono: true, color: PAL.dim });

    if (s >= 2) {
      P.text(60, 226, 'the three asymmetric pairs', { size: 12.5, bold: true, color: PAL.ink });
      var pairs = [['SR', 'JK'], ['SR', 'D'], ['JK', 'D']];
      var data = pairs.map(function (pr) {
        var a = CONV[pr[0]][pr[1]], b = CONV[pr[1]][pr[0]];
        return [
          { v: pr[0] + ' -> ' + pr[1], mono: true },
          { v: String(a.gates), mono: true, tone: a.gates === 0 ? 'good' : null, bold: true },
          { v: pr[1] + ' -> ' + pr[0], mono: true },
          { v: String(b.gates), mono: true, tone: 'bad', bold: true },
          { v: String(b.gates - a.gates), mono: true, color: PAL.dim }
        ];
      });
      grid(60, 268, 150, 26, 5, 3, ['one way', 'gates', 'the other way', 'gates', 'gap'], data);
    }

    if (s >= 3) {
      P.rect(60, 364, 780, 56, { fill: PAL.invalidDim, stroke: PAL.invalid, sw: 1, radius: 7 });
      P.text(78, 380, 'The direction of the question changes the circuit', { size: 12, bold: true, color: PAL.invalid });
      P.text(78, 402, 'Find the words "using" and "into": "a T flip-flop using a JK flip-flop" is JK to T, which is free. The reverse is not.', { size: 11, color: PAL.dim });
    }
    foot('a gate count is only meaningful against the gate set it was counted in');
  }

  /* --- 9. table ------------------------------------------------------- */
  function drawTable(p) {
    var s = stage(p, 4);
    title('All twelve conversions', 'rows are the host, columns are the target');

    var cw = 112, ch = 40, x0 = 150, y0 = 100;
    TYPES.forEach(function (t, j) {
      P.text(x0 + j * cw + cw / 2, y0 - 10, t, { size: 13, bold: true, align: 'center', base: 'bottom', color: PAL.ink });
    });
    TYPES.forEach(function (h, i) {
      P.text(x0 - 16, y0 + i * ch + ch / 2, h, { size: 13, bold: true, align: 'right', base: 'middle', color: PAL.ink });
      TYPES.forEach(function (t, j) {
        var cx = x0 + j * cw, cy = y0 + i * ch;
        if (h === t) {
          P.rect(cx, cy, cw, ch, { fill: PAL.surface2, stroke: PAL.border, sw: 0.9 });
          P.text(cx + cw / 2, cy + ch / 2, 'a wire', { size: 10.5, align: 'center', base: 'middle', color: PAL.faint });
          return;
        }
        var c = CONV[h][t];
        var tone = c.gates === 0 ? 'good' : c.gates >= 4 ? 'bad' : c.gates === 3 ? 'warn' : null;
        P.rect(cx, cy, cw, ch, {
          fill: tone === 'good' ? PAL.accentDim : tone === 'bad' ? PAL.invalidDim
              : tone === 'warn' ? PAL.warnDim : PAL.surface,
          stroke: PAL.border, sw: 0.9
        });
        P.text(cx + cw / 2, cy + 14, c.gates + ' gate' + (c.gates === 1 ? '' : 's'), {
          size: 12, bold: true, align: 'center', base: 'middle',
          color: tone === 'good' ? PAL.accent : tone === 'bad' ? PAL.invalid : tone === 'warn' ? PAL.warn : PAL.ink
        });
        P.text(cx + cw / 2, cy + 30, c.eqs.length + ' eq' + (c.usesQ ? ' + Q' : ''), {
          size: 9.5, align: 'center', base: 'middle', color: PAL.dim
        });
      });
    });

    if (s >= 1) {
      P.text(616, 112, 'one equation', { size: 11.5, bold: true, color: PAL.ink });
      P.text(616, 130, 'host D or T', { size: 10.5, color: PAL.dim });
      P.text(616, 156, 'two equations', { size: 11.5, bold: true, color: PAL.ink });
      P.text(616, 174, 'host SR or JK', { size: 10.5, color: PAL.dim });
      P.text(616, 200, ONE_EQ + ' of 12 need one', { size: 10.5, mono: true, color: PAL.dim });
      P.text(616, 220, USES_Q + ' of 12 use Q', { size: 10.5, mono: true, color: PAL.dim });
      P.text(616, 240, 'free entries: JK 4, SR 2', { size: 10.5, mono: true, color: PAL.dim });
    }

    if (s >= 3) {
      var ty = 296;
      P.text(60, ty, 'cost of each host, over its three conversions', { size: 12, bold: true, color: PAL.ink });
      TYPES.forEach(function (h, i) {
        var x = 60 + i * 200;
        P.text(x, ty + 26, h, { size: 12, bold: true, color: PAL.ink });
        P.text(x + 46, ty + 26, String(HOST_TOTALS[h]), { size: 16, bold: true, color: h === 'JK' ? PAL.accent : h === 'D' ? PAL.invalid : PAL.ink });
        P.rect(x, ty + 36, 168, 8, { fill: PAL.surface2, stroke: null });
        P.rect(x, ty + 36, Math.max(3, 168 * HOST_TOTALS[h] / 11), 8, {
          fill: h === 'JK' ? PAL.accent : h === 'D' ? PAL.invalid : PAL.border, stroke: null
        });
      });
      P.text(60, ty + 66, 'total across all twelve: ' + TOTAL_GATES + ' gates', { size: 12, bold: true, color: PAL.accent });
    }
    foot('gate counts are two-input AND, OR and NOT, with Q and not-Q taken from the flip-flop');
  }

  /* --- 10. verify ----------------------------------------------------- */
  function drawVerify(p) {
    var s = stage(p, 4);
    title('Verification, and the wiring that fails two rows', 'a conversion is correct when it agrees on the target\'s domain');

    /* the domain sizes */
    var dom = [['SR', 6], ['JK', 8], ['D', 4], ['T', 4]];
    P.text(60, 88, 'rows a conversion must match', { size: 12, bold: true, color: PAL.ink });
    var data = dom.map(function (d) {
      return [
        { v: 'into ' + d[0], mono: true },
        { v: String(d[1]), mono: true, bold: true, tone: 'good' }
      ];
    });
    grid(60, 124, 90, 26, 2, 4, ['target', 'rows'], data);
    if (s >= 1) {
      P.text(60, 240, 'SR excludes S = R = 1, so', { size: 10.5, color: PAL.dim });
      P.text(60, 258, 'six rows, not eight.', { size: 10.5, color: PAL.dim });
      P.text(60, 286, 'total rows checked: ' + TOTAL_ROWS, { size: 11.5, bold: true, color: PAL.accent });
      P.text(60, 306, 'conversions passing: ' + LIST.filter(function (c) { return c.failures.length === 0; }).length + ' of ' + LIST.length, { size: 11, color: PAL.ink });
    }

    /* the naive failure */
    P.text(400, 88, 'SR as host, wired S = J and R = K', { size: 12, bold: true, color: PAL.ink });
    var nd = [];
    for (var J = 0; J <= 1; J++) {
      for (var Kk = 0; Kk <= 1; Kk++) {
        for (var Q = 0; Q <= 1; Q++) {
          var want = next('JK', [J, Kk], Q);
          var got = next('SR', [J, Kk], Q);
          var bad = (got !== want);
          nd.push([
            { v: J + ' ' + Kk, mono: true },
            { v: String(Q), mono: true },
            { v: String(want), mono: true },
            { v: got === null ? 'none' : String(got), mono: true, tone: bad ? 'bad' : 'good', bold: true },
            { v: bad ? 'fails' : 'ok', size: 10.5, tone: bad ? 'bad' : 'good' }
          ]);
        }
      }
    }
    grid(400, 124, 60, 24, 5, 8, ['J K', 'Q', 'want', 'got', ''], nd);

    if (s >= 2) {
      P.text(400, 336, 'the two failures are the two toggle rows', { size: 11.5, bold: true, color: PAL.invalid });
      P.text(400, 356, 'on them the wiring asks the SR host for S = R = 1', { size: 11, color: PAL.dim });
      P.text(400, 374, 'and the SR host has no next state to give', { size: 11, color: PAL.dim });
    }

    if (s >= 3) {
      P.rect(60, 392, 780, 44, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1, radius: 7 });
      P.text(78, 408, 'All twelve conversions agree with their target on every row of its domain.', { size: 12, bold: true, color: PAL.ink });
      P.text(78, 426, PASSED + ' of ' + CHECKS.length + ' model checks pass, re-run on every page load.', { size: 10.5, color: PAL.dim });
    }
    foot('verification is the step that catches a minimisation slip; it costs eight comparisons per conversion');
  }

  /* --- 11. gate ------------------------------------------------------- */
  function drawGate(p) {
    var s = stage(p, 4);
    title('How GATE asks it', 'four shapes, one first move');

    if (s >= 0) {
      P.text(60, 92, 'GATE CSE 2015 Set 1: a D flip-flop and a JK flip-flop wired to each other', { size: 11.5, bold: true, color: PAL.ink });
      var seq = SEQ15.seq.slice(0, 11);
      seq.forEach(function (b, i) {
        var x = 60 + i * 44;
        P.rect(x, 108, 40, 34, { fill: b ? PAL.accentDim : PAL.surface, stroke: PAL.border, sw: 1 });
        P.text(x + 20, 125, String(b), { size: 14, mono: true, bold: true, align: 'center', base: 'middle', color: b ? PAL.accent : PAL.ink });
      });
      P.text(60, 160, 'the output settles into a cycle of ' + SEQ15.period + ': 0 1 1 repeating', { size: 11.5, color: PAL.dim });
    }

    if (s >= 2) {
      P.text(60, 192, 'GATE CSE 2017 Set 2: a 2-bit saturating up counter on T flip-flops', { size: 11.5, bold: true, color: PAL.ink });
      var rows = SAT.rows.map(function (r) {
        return [
          { v: r.q1 + ' ' + r.q0, mono: true },
          { v: r.n1 + ' ' + r.n0, mono: true },
          { v: String(r.t1), mono: true, bold: true, tone: r.t1 ? 'good' : null },
          { v: String(r.t0), mono: true, bold: true, tone: r.t0 ? 'good' : null }
        ];
      });
      grid(60, 226, 80, 24, 4, 4, ['Q1 Q0', 'next', 'T1', 'T0'], rows);
      P.text(420, 232, 'T1 = Q1\'Q0', { size: 14, mono: true, bold: true, color: PAL.accent });
      P.text(420, 256, 'T0 = Q1\' + Q0\'', { size: 14, mono: true, bold: true, color: PAL.accent });
      P.text(420, 284, 'each T is the exclusive-or of', { size: 10.5, color: PAL.dim });
      P.text(420, 302, 'the present and next bit', { size: 10.5, color: PAL.dim });
    }

    if (s >= 3) {
      P.rect(60, 344, 780, 56, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 7 });
      P.text(78, 360, 'The first move in every shape: write the target\'s table, then read the host backwards.', { size: 12, bold: true, color: PAL.ink });
      P.text(78, 382, 'The other shapes are: count the gates for a stated conversion, and find what is wrong with a given wiring.', { size: 11, color: PAL.dim });
    }
    foot('both sequences above are computed here from the flip-flop definitions, not quoted');
  }

  /* --- 12. hold ------------------------------------------------------- */
  function drawHold(p) {
    var s = stage(p, 4);
    title('One screen to hold', null);
    var lines = [
      ['A conversion is an equation problem.', PAL.ink],
      ['The target fixes the transition; the host supplies the input.', PAL.dim],
      ['The excitation table is the characteristic table read backwards.', PAL.dim],
      ['Free entries are the currency: JK four, SR two, D and T none.', PAL.accent],
      ['Derive, minimise, then simulate every row.', PAL.accent]
    ];
    lines.forEach(function (l, i) {
      if (i > s + 1) return;
      var y = 100 + i * 44;
      P.circle(72, y + 7, 4.5, { fill: l[1] });
      P.text(92, y, l[0], { size: 14, color: l[1] });
    });
    if (s >= 2) {
      P.rect(60, 352, 780, 54, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1, radius: 7 });
      P.text(78, 368, '12 conversions, ' + TOTAL_GATES + ' gates in total, ' + TOTAL_ROWS + ' rows verified, ' + ZERO_GATE.length + ' conversions free.', { size: 12, bold: true, color: PAL.ink });
      P.text(78, 390, 'Host totals: JK ' + HOST_TOTALS.JK + ', SR ' + HOST_TOTALS.SR + ', T ' + HOST_TOTALS.T + ', D ' + HOST_TOTALS.D + '.  Model checks: ' + PASSED + ' of ' + CHECKS.length + '.', { size: 11, color: PAL.dim });
    }
    foot('every figure on this page is recomputed on load and re-checked by a second route');
  }

  var DRAW = {
    why: drawWhy, four: drawFour, excite: drawExcite, procedure: drawProcedure,
    free: drawFree, sr2jk: drawSr2jk, d2jk: drawD2jk, xor: drawXor,
    table: drawTable, verify: drawVerify, gate: drawGate, hold: drawHold
  };

  function drawFrame(t) {
    if (!P) return;
    P.clear();
    P.alpha(1);
    var i = K.sceneAt(t);
    var sc = K.state.scenes[i];
    if (!sc) return;
    var fn = DRAW[sc.id];
    if (fn) fn(K.sceneProgress(t));
  }

  /* ======================================================================
     BOOT
     ====================================================================== */

  function reportChecks() {
    var el = document.getElementById('checks');
    if (!el) return;
    var bad = CHECKS.filter(function (c) { return !c.pass; });
    el.innerHTML = '<span class="k">Model checks</span>' +
      '<p class="small" style="margin:6px 0 0">' + PASSED + ' of ' + CHECKS.length + ' passed' +
      (bad.length ? ' <span style="color:var(--invalid)">(' + bad.length + ' failed)</span>' : '') + '</p>';
  }

  function boot() {
    var holder = document.getElementById('canvas-holder');
    var fallback = document.getElementById('canvas-fallback');
    reportChecks();

    var ok = false;
    try {
      if (window.p5) {
        new window.p5(function (sk) {
          sk.setup = function () {
            var c = sk.createCanvas(W, H);
            c.parent(holder);
            sk.pixelDensity(Math.min(2, window.devicePixelRatio || 1));
            sk.noLoop();
            P = PR.makePainterP5(sk, W, H);
            drawFrame(K.state.elapsed);
          };
          sk.draw = function () { if (P) drawFrame(K.state.elapsed); };
        });
        K.onResize(function () {
          var wrap = holder;
          if (!wrap) return;
          var scale = Math.min(1, wrap.clientWidth / W);
          var cv = wrap.querySelector('canvas');
          if (cv) { cv.style.width = (W * scale) + 'px'; cv.style.height = (H * scale) + 'px'; }
        });
        ok = true;
      }
    } catch (e) {
      console.error('p5 failed', e);
      ok = false;
    }

    if (!ok) {
      var drew = false;
      try {
        var cv2 = document.createElement('canvas');
        cv2.width = W; cv2.height = H;
        if (holder) holder.appendChild(cv2);
        var ctx2d = cv2.getContext && cv2.getContext('2d');
        if (ctx2d) { P = PR.makePainter2D(ctx2d, W, H); drawFrame(0); drew = true; }
      } catch (e) {
        console.error('canvas fallback failed', e);
      }
      if (!drew && fallback) fallback.classList.add('show');
    }

    if (K && K.init) {
      K.init({ timeline: window.LESSON_TIMELINE, draw: function () { if (P) drawFrame(K.state.elapsed); } });
    }

    window.__drawAt = function (t) {
      K.state.elapsed = t;
      if (P) drawFrame(t);
    };

    var bad = CHECKS.filter(function (c) { return !c.pass; });
    if (bad.length) console.warn('Model validation did not fully pass:', bad);
  }

  window.LESSON_MODEL = {
    TYPES: TYPES, INPUTS: INPUTS, EXCITE: EXCITE, CONV: CONV,
    HOST_TOTALS: HOST_TOTALS, TOTAL_GATES: TOTAL_GATES, TOTAL_ROWS: TOTAL_ROWS,
    ZERO_GATE: ZERO_GATE, ONE_EQ: ONE_EQ, USES_Q: USES_Q, MAX_GATE: MAX_GATE,
    NAIVE: NAIVE, SAT: SAT, SEQ15: SEQ15, ALL_PASS: ALL_PASS,
    PASSED: PASSED, TOTAL: CHECKS.length
  };

  window.__lessonChecks = CHECKS;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

})();
