/* ==========================================================================
   mapping-reductions-and-rices-theorem — lesson.js
   Four layers, in order:
     1. THE MODEL      — a tape-machine simulator with a step cap, five machines
                         as transition tables, a padded copy of one of them, and
                         two wrapper constructions that build a new machine from
                         an old one plus a frozen string. Seven instances are run
                         through both reductions, fifteen strings are swept for
                         the empty-language counterexample, and two machines are
                         compared string by string.
     2. THE CHECKS     — every number the captions state is recomputed here and
                         compared with the figure the caption states.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The claim under test is one sentence: the direction of the arrow is the
   argument, and difficulty travels forwards along it and never backwards.
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
   Everything numeric on this page is computed here, at load, and checked.
   ====================================================================== */

var RED = (function () {
  'use strict';

  var CAP = 400;

  /* ---- machines -----------------------------------------------------
     A base machine is a finite table: start state, accepting states,
     rejecting states, and a transition per (state, symbol). Symbols are
     '0', '1' and '_' for blank; a move is 'L', 'R' or 'S' for stay.
     A wrapper machine is not a table: it is a description that runs an
     inner machine on a frozen string and then does one of three things
     with the outcome. That is a legal machine description, just a
     higher-level one, and running it is well defined.
     ------------------------------------------------------------------ */
  function base(name, start, acc, rej, trans, extra) {
    var states = [start].concat(extra || []);
    Object.keys(trans).forEach(function (k) {
      var q = k.split(',')[0];
      if (states.indexOf(q) < 0) states.push(q);
      var t = trans[k].split(',');
      if (states.indexOf(t[0]) < 0) states.push(t[0]);
    });
    acc.forEach(function (q) { if (states.indexOf(q) < 0) states.push(q); });
    rej.forEach(function (q) { if (states.indexOf(q) < 0) states.push(q); });
    return { name: name, kind: 'base', states: states, start: start,
             acc: acc, rej: rej, trans: trans };
  }

  function wrap(name, inner, input, onAccept, onReject) {
    return { name: name, kind: 'wrap', inner: inner, input: input,
             onAccept: onAccept, onReject: onReject, states: [name] };
  }

  function run(m, input, cap) {
    cap = cap || CAP;
    if (m.kind === 'wrap') {
      var r = run(m.inner, m.input, cap);
      if (r.status === 'accept') {
        return m.onAccept === 'accept'
          ? { status: 'accept', steps: r.steps + 1 }
          : { status: 'timeout', steps: cap };
      }
      if (r.status === 'reject') {
        if (m.onReject === 'accept') return { status: 'accept', steps: r.steps + 1 };
        if (m.onReject === 'reject') return { status: 'reject', steps: r.steps + 1 };
        return { status: 'timeout', steps: cap };
      }
      return { status: 'timeout', steps: cap };
    }
    var tape = input.split('');
    if (!tape.length) tape = ['_'];
    var head = 0, q = m.start, steps = 0;
    while (steps < cap) {
      if (m.acc.indexOf(q) >= 0) return { status: 'accept', steps: steps };
      if (m.rej.indexOf(q) >= 0) return { status: 'reject', steps: steps };
      var sym = tape[head] === undefined ? '_' : tape[head];
      var t = m.trans[q + ',' + sym];
      if (!t) return { status: 'reject', steps: steps };
      var p = t.split(',');
      q = p[0]; tape[head] = p[1];
      head += (p[2] === 'R' ? 1 : p[2] === 'L' ? -1 : 0);
      if (head < 0) { tape.unshift('_'); head = 0; }
      steps++;
    }
    return { status: 'timeout', steps: cap };
  }

  /* ---- the five machines -------------------------------------------- */

  /* E: accepts strings over {0,1} that end in 1. Four states. */
  var E = base('E', 'q0', ['qa'], ['qr'], {
    'q0,0': 'q0,0,R', 'q0,1': 'q1,1,R',
    'q1,0': 'q0,0,R', 'q1,1': 'q1,1,R',
    'q0,_': 'qr,_,S', 'q1,_': 'qa,_,S'
  });

  /* V: accepts strings with an even number of zeros. The start state is not
     an accepting state: a machine that accepts at once accepts everything. */
  var V = base('V', 'e0', ['qa'], ['qr'], {
    'e0,0': 'e1,0,R', 'e1,0': 'e0,0,R',
    'e0,1': 'e0,1,R', 'e1,1': 'e1,1,R',
    'e0,_': 'qa,_,S', 'e1,_': 'qr,_,S'
  });

  /* A: accepts strings that are all ones, including the empty string. */
  var A1 = base('A', 'a0', ['qa'], ['ar'], {
    'a0,1': 'a0,1,R', 'a0,0': 'ar,0,S', 'a0,_': 'qa,_,S'
  });

  /* R: halts at once and rejects everything. */
  var R = base('R', 'r0', [], ['r0'], {
    'r0,0': 'r0,0,S', 'r0,1': 'r0,1,S', 'r0,_': 'r0,_,S'
  });

  /* L: never halts, on anything. */
  var L = base('L', 'l0', [], [], {
    'l0,0': 'l0,0,R', 'l0,1': 'l0,1,R', 'l0,_': 'l0,_,R'
  });

  /* P: E with three unreachable states bolted on. Same language. */
  var PAD = base('P', 'q0', ['qa'], ['qr'], JSON.parse(JSON.stringify(E.trans)),
                 ['dead1', 'dead2', 'dead3']);

  /* ---- the two reductions ------------------------------------------- */

  /* A_TM <=m HALT: M' ignores its input, runs M on w, accepts on accept,
     and loops forever on reject. It halts on w exactly when M accepts w. */
  function toHALT(m, w) { return wrap('MH', m, w, 'accept', 'loop'); }

  /* HALT <=m A_TM: M'' runs M on w and accepts on either outcome, so it
     accepts w exactly when M halts on w. */
  function toATM(m, w) { return wrap('MA', m, w, 'accept', 'accept'); }

  /* ---- the instance sample ------------------------------------------ */

  var INSTANCES = [
    { m: E,  w: '1',   label: 'E on 1' },
    { m: E,  w: '0',   label: 'E on 0' },
    { m: V,  w: '10',  label: 'V on 10' },
    { m: V,  w: '100', label: 'V on 100' },
    { m: A1, w: '11',  label: 'A on 11' },
    { m: R,  w: '0',   label: 'R on 0' },
    { m: L,  w: '1',   label: 'L on 1' }
  ];

  function inATM(m, w) { return run(m, w).status === 'accept'; }
  function inHALT(m, w) { return run(m, w).status !== 'timeout'; }

  var ROWS = INSTANCES.map(function (it) {
    var inner = run(it.m, it.w);
    var wH = toHALT(it.m, it.w);
    var wA = toATM(it.m, it.w);
    return {
      label: it.label,
      machine: it.m.name,
      w: it.w,
      innerStatus: inner.status,
      inATM: inner.status === 'accept',
      inHALT: inner.status !== 'timeout',
      imageHalt: run(wH, it.w).status !== 'timeout',
      imageAccept: run(wA, it.w).status === 'accept',
      okHALT: (inner.status === 'accept') === (run(wH, it.w).status !== 'timeout'),
      okATM: (inner.status !== 'timeout') === (run(wA, it.w).status === 'accept')
    };
  });

  var COUNT_HALT = ROWS.filter(function (r) { return r.okHALT; }).length;
  var COUNT_ATM = ROWS.filter(function (r) { return r.okATM; }).length;
  var COUNT_TIMEOUT = ROWS.filter(function (r) { return r.innerStatus === 'timeout'; }).length;
  var COUNT_HALTS_ONLY = ROWS.filter(function (r) { return r.inHALT && !r.inATM; }).length;

  /* ---- the string sample: everything over {0,1} up to length 3 ------- */
  var SAMPLE = (function () {
    var out = [''];
    for (var n = 1; n <= 3; n++) {
      var prev = out.filter(function (x) { return x.length === n - 1; });
      prev.forEach(function (p) { out.push(p + '0'); out.push(p + '1'); });
    }
    return out;
  })();

  /* ---- the empty language reduces to A_TM --------------------------- */
  /* f(w) = <R, 0> for every w. R rejects at once, so the image is never
     in A_TM, and no string is in the empty language. A constant function
     is computable, so this is a legal mapping reduction. */
  function fEmpty(w) { return { m: R, w: '0' }; }
  var EMPTY_VIOLATIONS = SAMPLE.filter(function (w) {
    return false !== inATM(fEmpty(w).m, fEmpty(w).w);
  }).length;
  var EMPTY_IMAGES_IN = SAMPLE.filter(function (w) {
    var f = fEmpty(w); return inATM(f.m, f.w);
  }).length;

  /* ---- Rice: two descriptions, one language ------------------------- */
  function accepted(m) {
    return SAMPLE.filter(function (w) { return inATM(m, w); });
  }
  var LANG_E = accepted(E);
  var LANG_P = accepted(PAD);
  var SAME_LANG = JSON.stringify(LANG_E) === JSON.stringify(LANG_P);
  var STATES_E = E.states.length;
  var STATES_P = PAD.states.length;

  /* ---- order properties -------------------------------------------- */
  var REFLEXIVE = SAMPLE.every(function (w) {
    return inATM(E, w) === inATM(E, w);
  });

  /* X = L(E). X <=m A_TM by w -> <E,w>. A_TM <=m HALT by toHALT.
     Composed: w -> <MH(E,w), w>. Checked on every sampled string. */
  var TRANSITIVE = SAMPLE.every(function (w) {
    var inX = inATM(E, w);
    var mid = { m: E, w: w };
    var inImage = inHALT(toHALT(mid.m, mid.w), mid.w);
    return inX === inImage;
  });

  return {
    CAP: CAP,
    run: run, toHALT: toHALT, toATM: toATM,
    machines: { E: E, V: V, A1: A1, R: R, L: L, PAD: PAD },
    rows: ROWS,
    instances: INSTANCES.length,
    countHalt: COUNT_HALT,
    countATM: COUNT_ATM,
    countTimeout: COUNT_TIMEOUT,
    countHaltsOnly: COUNT_HALTS_ONLY,
    sample: SAMPLE,
    sampleSize: SAMPLE.length,
    emptyViolations: EMPTY_VIOLATIONS,
    emptyImagesIn: EMPTY_IMAGES_IN,
    langE: LANG_E, langP: LANG_P, sameLang: SAME_LANG,
    statesE: STATES_E, statesP: STATES_P,
    reflexive: REFLEXIVE, transitive: TRANSITIVE
  };
})();

/* ======================================================================
   LAYER 2 - THE CHECKS
   Every figure a caption states is asserted here against the model.
   ====================================================================== */

var CHECKS = [];
function check(name, pass, detail) { CHECKS.push({ name: name, pass: !!pass, detail: detail || '' }); }

(function runChecks() {
  var M = RED.machines;

  /* --- the machines behave as their comments claim --- */
  check('E accepts 1', RED.run(M.E, '1').status === 'accept', 'ends in 1');
  check('E rejects 0', RED.run(M.E, '0').status === 'reject', 'ends in 0');
  check('E rejects the empty string', RED.run(M.E, '').status === 'reject', 'empty is not ending in 1');
  check('V accepts 100', RED.run(M.V, '100').status === 'accept', 'two zeros, even');
  check('V rejects 10', RED.run(M.V, '10').status === 'reject', 'one zero, odd');
  check('A accepts 11', RED.run(M.A1, '11').status === 'accept', 'all ones');
  check('R rejects at once', RED.run(M.R, '0').status === 'reject' && RED.run(M.R, '0').steps === 0, 'no moves');
  check('L never halts', RED.run(M.L, '1').status === 'timeout', 'cap reached');
  check('E has four states', RED.statesE === 4, String(RED.statesE));
  check('P has seven states', RED.statesP === 7, String(RED.statesP));
  check('P and E share one language on the sample', RED.sameLang, RED.langE.join(' '));

  /* --- the two reductions --- */
  check('seven instances', RED.instances === 7, String(RED.instances));
  check('A_TM to HALT: correspondence on every instance',
        RED.countHalt === RED.instances, RED.countHalt + '/' + RED.instances);
  check('HALT to A_TM: correspondence on every instance',
        RED.countATM === RED.instances, RED.countATM + '/' + RED.instances);
  check('exactly one instance times out', RED.countTimeout === 1, String(RED.countTimeout));
  check('three instances are in HALT and not in A_TM',
        RED.countHaltsOnly === 3, String(RED.countHaltsOnly));
  check('the wrapper of E on 1 halts', RED.run(RED.toHALT(M.E, '1'), '1').status === 'accept', 'inner accepts');
  check('the wrapper of E on 0 loops', RED.run(RED.toHALT(M.E, '0'), '0').status === 'timeout', 'reject becomes divergence');
  check('the wrapper of R on 0 loops', RED.run(RED.toHALT(M.R, '0'), '0').status === 'timeout', 'reject becomes divergence');
  check('the wrapper of L on 1 never halts', RED.run(RED.toHALT(M.L, '1'), '1').status === 'timeout', 'timeout passes through');

  /* --- the empty-language counterexample --- */
  check('fifteen sampled strings', RED.sampleSize === 15, String(RED.sampleSize));
  check('empty language to A_TM: no disagreement',
        RED.emptyViolations === 0, String(RED.emptyViolations));
  check('no image of the constant function is in A_TM',
        RED.emptyImagesIn === 0, String(RED.emptyImagesIn));

  /* --- order properties --- */
  check('at most is reflexive on the sample', RED.reflexive, 'identity function');
  check('at most is transitive on the sample', RED.transitive, 'composed wrapper');

  /* --- the language sample itself --- */
  check('the sample holds seven strings accepted by E', RED.langE.length === 7, String(RED.langE.length));
  check('the sample holds the same seven for P', RED.langP.length === 7, String(RED.langP.length));
  check('the sample contains the empty string exactly once',
        RED.sample.filter(function (s) { return s === ''; }).length === 1, 'one empty string');
})();

/* ======================================================================
   LAYER 3 - RENDER
   Reads the model; never re-derives a number.
   ====================================================================== */

  function T(x, y, txt, size, col, bold, mono, align) {
    P.text(x, y, txt, { size: size || 10.5, color: col || INK, bold: !!bold,
                        mono: !!mono, align: align || 'left' });
  }

  function panel(x, y, w, h, title, kind) {
    P.rect(x, y, w, h, { fill: SURF, stroke: BORDER, radius: 8, sw: 1 });
    if (title) {
      var col = kind === 'bad' ? BAD : kind === 'good' ? VAL : kind === 'warn' ? WARN : DIM;
      T(x + 14, y + 13, title, 10, col, true);
      return y + 38;
    }
    return y + 16;
  }

  function chip(x, y, txt, kind) {
    var size = 10, pad = 9;
    var w = txt.length * size * 0.56 + pad * 2;
    var col = kind === 'bad' ? BAD : kind === 'good' ? VAL : kind === 'warn' ? WARN : INFO;
    var fill = kind === 'bad' ? BADDIM : kind === 'good' ? ACCDIM
             : kind === 'warn' ? WARNDIM : SURF2;
    P.rect(x, y, w, 20, { fill: fill, stroke: col, radius: 10, sw: 1 });
    T(x + pad, y + 5, txt, size, col);
    return w;
  }

  function hdr(title, sub) {
    T(46, 26, title, 15, INK, true);
    T(46, 50, sub, 10.5, DIM);
  }

  function box(x, y, w, h, title, sub, kind) {
    var col = kind === 'bad' ? BAD : kind === 'good' ? VAL : kind === 'warn' ? WARN : ACC;
    var fill = kind === 'bad' ? BADDIM : kind === 'good' ? ACCDIM
             : kind === 'warn' ? WARNDIM : SURF2;
    P.rect(x, y, w, h, { fill: fill, stroke: col, radius: 7, sw: 1.3 });
    T(x + w / 2, y + 9, title, 11.5, col, true, true, 'center');
    if (sub) T(x + w / 2, y + 27, sub, 9.5, DIM, false, false, 'center');
  }

  /* a growable bar: 0 at t0, 1 at t0+dur */
  function grow(t, t0, dur) {
    var p = (t - t0) / Math.max(0.001, dur);
    return K.ease(p < 0 ? 0 : p > 1 ? 1 : p);
  }

  var SCENE_DRAW = {};

  /* ---------------- 1. gap ---------------- */
  SCENE_DRAW.gap = function (t, sc, p) {
    hdr('Two problems, one arrow',
        'A reduction rewrites an instance. It never compares the problems directly.');

    var y = panel(46, 70, 808, 96, 'The arrow, and what it says');
    T(64, y + 4, 'A', 13, INK, true, true);
    T(84, y + 4, '\u2264', 13, ACC, true, true);
    T(102, y + 4, 'B', 13, INK, true, true);
    T(150, y + 4, 'means: a solver for B gives you a solver for A, so A is no harder than B.', 10.5, DIM);
    T(64, y + 26, 'The arrow always points at the problem you assume solved.', 10.5, WARN);

    /* two problem boxes with the arrow between, drawn as it grows */
    var g = grow(t, sc.start + 2, 8);
    box(80, 210, 210, 74, 'A_TM', 'does M accept w ?', 'warn');
    box(610, 210, 210, 74, 'HALT', 'does M stop on w ?', 'good');
    if (g > 0.02) {
      P.arrow(310, 247, 310 + 280 * g, 247, { stroke: ACC, sw: 2.2, head: 11 });
      T(310 + 140 * g, 224, 'f', 12, ACC, true, true, 'center');
    }
    if (g > 0.7) {
      T(450, 264, 'a computable translation of instances', 9.5, DIM, false, false, 'center');
    }

    /* the instance rewrite, one card each side */
    var g2 = grow(t, sc.start + 14, 7);
    if (g2 > 0.02) {
      P.rect(80, 316, 210, 62, { fill: SURF2, stroke: BORDER, radius: 6, sw: 1 });
      T(92, 328, 'instance of A_TM', 9, DIM, true);
      T(92, 346, '\u27e8 M , w \u27e9', 13, INK, true, true);
      T(92, 366, 'a machine and a string', 9, FAINT);
    }
    if (g2 > 0.5) {
      P.rect(610, 316, 210, 62, { fill: SURF2, stroke: BORDER, radius: 6, sw: 1 });
      T(622, 328, 'instance of HALT', 9, DIM, true);
      T(622, 346, '\u27e8 M\u2032 , w \u27e9', 13, INK, true, true);
      T(622, 366, 'a rebuilt machine, same string', 9, FAINT);
      P.arrow(300, 347, 596, 347, { stroke: BORDER, sw: 1.4, head: 9, dash: [5, 4] });
      T(448, 330, 'f rewrites it', 9, DIM, false, false, 'center');
    }

    if (g2 > 0.9) {
      T(46, 402, 'Read \u2264 aloud as "no harder than". Reading it as "smaller" is the first of the six misconceptions.', 10, DIM);
      T(46, 422, 'Difficulty travels forwards along the arrow, never backwards.', 10.5, WARN, true);
    }
  };

  /* ---------------- 2. def ---------------- */
  SCENE_DRAW.def = function (t, sc, p) {
    hdr('The definition, and its two obligations',
        'A \u2264m B when a computable, total f satisfies: w \u2208 A exactly when f(w) \u2208 B.');

    var y = panel(46, 70, 808, 84, 'The definition, written out');
    T(64, y + 2, 'f : \u03a3* \u2192 \u03a3*  is computable  \u21d4  one machine, halts on every input, leaves f(w) on the tape', 11, INK, false, true);
    T(64, y + 22, 'A \u2264m B  \u21d4  \u2203 f computable : \u2200 w  ( w \u2208 A  \u21d4  f(w) \u2208 B )', 11.5, ACC, true, true);

    var g1 = grow(t, sc.start + 3, 8);
    if (g1 > 0.02) {
      var y1 = panel(46, 176, 392, 128, 'Obligation 1 — totality', 'warn');
      T(62, y1, 'To decide A: compute f(w), then run the decider for B.', 10, INK);
      T(62, y1 + 20, 'Two halting computations compose into one.', 10, DIM);
      T(62, y1 + 44, 'If f may run forever, the composite may run', 10, WARN);
      T(62, y1 + 58, 'forever — and that is not a decider.', 10, WARN);
    }
    var g2 = grow(t, sc.start + 10, 8);
    if (g2 > 0.02) {
      var y2 = panel(462, 176, 392, 128, 'Obligation 2 — both directions', 'warn');
      T(478, y2, 'Yes must stay yes, and no must stay no.', 10, INK);
      T(478, y2 + 20, 'A one-way implication lets a no instance of A', 10, DIM);
      T(478, y2 + 34, 'land inside B, and the solver for B then', 10, DIM);
      T(478, y2 + 48, 'answers yes for a no instance.', 10, DIM);
    }

    var g3 = grow(t, sc.start + 20, 8);
    if (g3 > 0.02) {
      T(46, 322, 'The pipeline the laws are made of', 10, DIM, true);
      box(60, 340, 190, 58, 'w', 'a string', null);
      box(330, 340, 190, 58, 'f', 'computable, total', null);
      box(600, 340, 190, 58, 'decider for B', 'answers yes or no', 'good');
      P.arrow(252, 369, 322, 369, { stroke: ACC, sw: 1.8, head: 9 });
      P.arrow(522, 369, 592, 369, { stroke: ACC, sw: 1.8, head: 9 });
      T(46, 418, 'This pipeline is the whole proof of both propagation laws. There is nothing else in them.', 10.5, INK);
      T(46, 438, 'Nothing is assumed about A. Everything is assumed about B.', 10, DIM);
    }
  };

  /* ---------------- 3. props ---------------- */
  SCENE_DRAW.props = function (t, sc, p) {
    hdr('Two laws, and the direction they travel',
        'Same hypothesis, opposite conclusions. The asymmetry is the topic.');

    var g = grow(t, sc.start + 2, 7);
    if (g > 0.02) {
      var y = panel(46, 70, 808, 70, 'The one hypothesis');
      T(64, y + 2, 'A \u2264m B', 12, ACC, true, true);
      T(120, y + 2, 'via a computable total f, with w \u2208 A \u21d4 f(w) \u2208 B for every w.', 10.5, DIM);
    }

    var g1 = grow(t, sc.start + 8, 7);
    if (g1 > 0.02) {
      var y1 = panel(46, 156, 392, 108, 'Law 1 — good news travels backwards', 'good');
      T(62, y1, 'If A \u2264m B and B is decidable,', 10.5, INK);
      T(62, y1 + 16, 'then A is decidable.', 11, VAL, true);
      T(62, y1 + 40, 'The conclusion is about the LEFT end.', 9.5, DIM);
      T(62, y1 + 58, 'A good property of the right end flows left.', 9.5, DIM);
    }
    var g2 = grow(t, sc.start + 15, 7);
    if (g2 > 0.02) {
      var y2 = panel(462, 156, 392, 108, 'Law 2 — bad news travels forwards', 'bad');
      T(478, y2, 'If A \u2264m B and A is undecidable,', 10.5, INK);
      T(478, y2 + 16, 'then B is undecidable.', 11, BAD, true);
      T(478, y2 + 40, 'The conclusion is about the RIGHT end.', 9.5, DIM);
      T(478, y2 + 58, 'A bad property of the left end flows right.', 9.5, DIM);
    }

    var g3 = grow(t, sc.start + 23, 7);
    if (g3 > 0.02) {
      var y3 = panel(46, 280, 808, 84, 'What the arrow never says', 'bad');
      T(62, y3, 'From  A \u2264m B  and  B undecidable  —  NOTHING follows about A.', 11.5, BAD, true);
      T(62, y3 + 22, 'The next scene exhibits a decidable A with A \u2264m A_TM, computed on fifteen strings.', 10, DIM);
    }

    if (grow(t, sc.start + 27, 3) > 0.5) {
      T(46, 386, 'Recognisability travels backwards; non-recognisability forwards; the complement reduces by the same f.', 10, INK);
      T(46, 406, 'Four laws, one picture, two exits.', 10.5, ACC, true);
    }
  };

  /* ---------------- 4. wrong ---------------- */
  SCENE_DRAW.wrong = function (t, sc, p) {
    hdr('The wrong direction, run on fifteen strings',
        'Claim under test: if L \u2264m A_TM then L is undecidable.');

    var g = grow(t, sc.start + 2, 6);
    if (g > 0.02) {
      var y = panel(46, 70, 808, 62, 'The claim, and the counterexample');
      T(64, y + 2, 'Take L = \u2205 and f(w) = \u27e8R, 0\u27e9 for every w, where R halts at once and rejects.', 10.5, INK);
      T(64, y + 20, 'A constant function is computable, so f is legal. R never accepts, so the image is never in A_TM.', 10, DIM);
    }

    /* the fifteen strings, in a grid, with the verdict on each */
    var g2 = grow(t, sc.start + 10, 12);
    if (g2 > 0.02) {
      T(46, 152, 'All fifteen strings over {0,1} of length at most 3', 10, DIM, true);
      var shown = Math.round(RED.sampleSize * Math.min(1, g2 * 1.15));
      for (var i = 0; i < RED.sampleSize; i++) {
        var col = i % 5, row = Math.floor(i / 5);
        var x = 46 + col * 92, yy = 176 + row * 46;
        var live = i < shown;
        var w = RED.sample[i];
        var lbl = w === '' ? '\u03b5' : w;
        P.rect(x, yy, 80, 34, {
          fill: live ? SURF2 : SURF,
          stroke: live ? BORDER : SURF2,
          radius: 5, sw: 1
        });
        if (live) {
          T(x + 40, yy + 5, lbl, 11, INK, true, true, 'center');
          T(x + 40, yy + 21, 'no \u00b7 no', 8.5, FAINT, false, false, 'center');
        }
      }
      T(46, 322, 'left column: is w in \u2205 ?   right column: is f(w) in A_TM ?', 9.5, DIM);
    }

    var g3 = grow(t, sc.start + 22, 6);
    if (g3 > 0.02) {
      var y3 = panel(512, 152, 342, 128, 'The sweep', 'good');
      T(528, y3, 'strings tested', 10, DIM);
      T(700, y3, String(RED.sampleSize), 12, INK, true, true, 'right');
      T(528, y3 + 22, 'disagreements with the iff', 10, DIM);
      T(700, y3 + 22, String(RED.emptyViolations), 12, VAL, true, true, 'right');
      T(528, y3 + 44, 'images landing in A_TM', 10, DIM);
      T(700, y3 + 44, String(RED.emptyImagesIn), 12, INK, true, true, 'right');
      T(528, y3 + 68, 'So \u2205 \u2264m A_TM, and \u2205 is decidable.', 10, VAL, true);
    }

    if (grow(t, sc.start + 26, 4) > 0.4) {
      T(46, 366, 'A hard right end constrains nothing on the left. The claim is false, and this is its smallest counterexample.', 10.5, WARN, true);
      T(46, 392, 'To prove L undecidable, the undecidable problem must sit on the LEFT of the arrow.', 10.5, INK);
      T(46, 412, 'That single sentence is worth most of the marks in this topic.', 10, DIM);
    }
  };

  /* ---------------- 5. build ---------------- */
  SCENE_DRAW.build = function (t, sc, p) {
    hdr('Building the wrapper machine',
        'Given \u27e8M, w\u27e9, output \u27e8M\u2032, w\u27e9 where M\u2032 ignores its input and runs M on w.');

    var g1 = grow(t, sc.start + 2, 6);
    if (g1 > 0.02) {
      var y = panel(46, 70, 808, 58, 'The three parts of M\u2032');
      T(64, y + 2, 'A finite program: it never runs anything unbounded, so the reduction itself always terminates.', 10, DIM);
    }

    var parts = [
      { t: 'write w', s: 'a frozen string', k: null },
      { t: 'simulate M on w', s: 'a finite simulation', k: null },
      { t: 'accept', s: 'if the run accepted', k: 'good' },
      { t: 'loop forever', s: 'if the run rejected', k: 'bad' }
    ];
    var g2 = grow(t, sc.start + 6, 12);
    for (var i = 0; i < parts.length; i++) {
      var on = g2 > i / parts.length;
      if (!on) continue;
      var x = 60 + (i % 2) * 410, yy = 160 + Math.floor(i / 2) * 84;
      box(x, yy, 380, 64, parts[i].t, parts[i].s, parts[i].k);
    }
    if (g2 > 0.5) {
      P.arrow(250, 192, 250, 236, { stroke: BORDER, sw: 1.4, head: 8 });
      P.arrow(660, 192, 660, 236, { stroke: BORDER, sw: 1.4, head: 8 });
      T(430, 200, 'the two exits of the simulation', 9, DIM, false, false, 'center');
    }

    var g3 = grow(t, sc.start + 20, 8);
    if (g3 > 0.02) {
      var y3 = panel(46, 344, 808, 96, 'Why the loop is the construction, not a defect', 'warn');
      T(64, y3, 'Acceptance and halting differ on exactly one case: a machine that halts and rejects.', 10.5, INK);
      T(64, y3 + 20, 'Acceptance says no there. Halting says yes there.', 10.5, DIM);
      T(64, y3 + 44, 'The wrapper deletes that case from the image by turning a rejection into a divergence,', 10.5, WARN);
      T(64, y3 + 58, 'so on the image the two questions coincide. That is the whole reduction.', 10.5, WARN, true);
    }
  };

  /* ---------------- 6. run ---------------- */
  SCENE_DRAW.run = function (t, sc, p) {
    hdr('The wrapper, run on seven instances',
        'The simulation actually runs, with a cap of ' + RED.CAP + ' steps per run.');

    var g = grow(t, sc.start + 2, 14);
    var shown = Math.max(1, Math.round(RED.rows.length * Math.min(1, g * 1.2)));

    /* column headings */
    T(60, 84, 'instance of A_TM', 9, DIM, true);
    T(220, 84, 'M on w', 9, DIM, true);
    T(320, 84, 'in A_TM', 9, DIM, true);
    T(420, 84, 'M\u2032 on w', 9, DIM, true);
    T(520, 84, 'in HALT', 9, DIM, true);
    T(630, 84, 'correspondence', 9, DIM, true);
    P.line(46, 100, 854, 100, { stroke: BORDER, sw: 1 });

    for (var i = 0; i < shown; i++) {
      var r = RED.rows[i];
      var y = 108 + i * 34;
      if (i % 2 === 0) P.rect(46, y - 4, 808, 32, { fill: SURF2, stroke: null, radius: 4 });
      T(60, y + 4, r.label, 10.5, INK, false, true);
      T(220, y + 4, r.innerStatus, 10, r.innerStatus === 'accept' ? VAL
                     : r.innerStatus === 'reject' ? BAD : WARN, false, true);
      T(320, y + 4, r.inATM ? 'yes' : 'no', 10.5, r.inATM ? VAL : BAD, true, true);
      T(420, y + 4, r.imageHalt ? 'halts' : 'runs', 10, r.imageHalt ? VAL : WARN, false, true);
      T(520, y + 4, r.inHALT ? 'yes' : 'no', 10.5, r.inHALT ? VAL : BAD, true, true);
      T(630, y + 4, r.okHALT ? 'holds' : 'BROKEN', 10, r.okHALT ? VAL : BAD, true, true);
    }

    if (grow(t, sc.start + 20, 5) > 0.3) {
      chip(46, 372, 'A_TM \u2192 HALT: ' + RED.countHalt + ' of ' + RED.instances, 'good');
      chip(250, 372, 'HALT \u2192 A_TM: ' + RED.countATM + ' of ' + RED.instances, 'good');
      chip(454, 372, 'timed out: ' + RED.countTimeout, 'warn');
      T(46, 404, 'Three rows halt and do not accept: E on 0, V on 10, R on 0. Those are in HALT and not in A_TM.', 10, INK);
      T(46, 424, 'The wrapper turns exactly those rows into non-halting runs, and on the images the two problems agree.', 10, DIM);
    }
  };

  /* ---------------- 7. equiv ---------------- */
  SCENE_DRAW.equiv = function (t, sc, p) {
    hdr('Both directions, so the same difficulty',
        'A_TM \u2264m HALT and HALT \u2264m A_TM, so the two are equivalent under the order.');

    var g = grow(t, sc.start + 2, 8);
    if (g > 0.02) {
      box(80, 96, 200, 66, 'A_TM', 'acceptance', 'warn');
      box(620, 96, 200, 66, 'HALT', 'halting', 'good');
      P.arrow(290, 118, 290 + 310 * g, 118, { stroke: ACC, sw: 2, head: 10 });
      T(445, 100, 'M\u2032 : reject \u2192 loop', 9, ACC, false, true, 'center');
      if (g > 0.6) {
        P.arrow(610, 140, 610 - 310 * (g - 0.6) / 0.4, 140, { stroke: INFO, sw: 2, head: 10 });
        T(445, 148, 'M\u2033 : halt either way \u2192 accept', 9, INFO, false, true, 'center');
      }
    }

    var g2 = grow(t, sc.start + 12, 8);
    if (g2 > 0.02) {
      var y = panel(46, 186, 392, 92, 'Equivalence', 'good');
      T(62, y, 'A \u2264m B and B \u2264m A', 10.5, INK, true, true);
      T(62, y + 20, 'Each is decidable exactly when the other is.', 10, DIM);
      T(62, y + 40, 'Not equality: the two languages differ on', 9.5, FAINT);
      T(62, y + 54, 'the three halts-and-rejects rows.', 9.5, FAINT);
    }
    var g3 = grow(t, sc.start + 18, 8);
    if (g3 > 0.02) {
      var y2 = panel(462, 186, 392, 92, 'Order properties', null);
      T(478, y2, 'reflexive: the identity function', 10, INK);
      T(478, y2 + 16, 'transitive: compose two computable f', 10, INK);
      T(478, y2 + 36, 'checked on ' + RED.sampleSize + ' strings: identity '
        + (RED.reflexive ? 'holds' : 'fails') + ', composition '
        + (RED.transitive ? 'holds' : 'fails'), 9.5, VAL);
    }

    if (grow(t, sc.start + 24, 5) > 0.3) {
      T(46, 300, 'Transitivity is what lets a proof chain', 10, DIM, true);
      box(60, 320, 200, 56, 'X = L(E)', 'a decidable sample', null);
      box(360, 320, 200, 56, 'A_TM', 'acceptance', 'warn');
      box(660, 320, 190, 56, 'HALT', 'halting', 'good');
      P.arrow(262, 348, 352, 348, { stroke: ACC, sw: 1.6, head: 8 });
      P.arrow(562, 348, 652, 348, { stroke: ACC, sw: 1.6, head: 8 });
      T(46, 400, 'One composed function gives X \u2264m HALT. Checked on all ' + RED.sampleSize + ' sampled strings: '
        + (RED.transitive ? RED.sampleSize + ' of ' + RED.sampleSize : 'fails') + '.', 10.5, INK);
      T(46, 422, 'This is how a library of undecidable problems is built: one root reduction, then chains.', 10, DIM);
    }
  };

  /* ---------------- 8. rice ---------------- */
  SCENE_DRAW.rice = function (t, sc, p) {
    hdr('Rice: two machines, one language',
        'A property of the description splits two machines that share a language.');

    var g = grow(t, sc.start + 2, 8);
    if (g > 0.02) {
      var y1 = panel(46, 70, 392, 150, 'Machine E — ' + RED.statesE + ' states', 'good');
      T(62, y1, 'states: q0 q1 qa qr', 10, INK, false, true);
      T(62, y1 + 20, 'accepts: strings ending in 1', 10, DIM);
      T(62, y1 + 44, 'on the ' + RED.sampleSize + ' sampled strings, accepts ' + RED.langE.length + ':', 9.5, DIM);
      T(62, y1 + 60, RED.langE.map(function (s) { return s === '' ? '\u03b5' : s; }).join('  '), 10, VAL, false, true);
      T(62, y1 + 84, 'property "at most 5 states": TRUE', 10, VAL, true);
    }
    var g2 = grow(t, sc.start + 8, 8);
    if (g2 > 0.02) {
      var y2 = panel(462, 70, 392, 150, 'Machine P — ' + RED.statesP + ' states', 'warn');
      T(478, y2, 'E plus dead1 dead2 dead3, unreachable', 10, INK, false, true);
      T(478, y2 + 20, 'accepts: exactly the same strings', 10, DIM);
      T(478, y2 + 44, 'on the same ' + RED.sampleSize + ' strings, accepts ' + RED.langP.length + ':', 9.5, DIM);
      T(478, y2 + 60, RED.langP.map(function (s) { return s === '' ? '\u03b5' : s; }).join('  '), 10, VAL, false, true);
      T(478, y2 + 84, 'property "at most 5 states": FALSE', 10, BAD, true);
    }

    if (grow(t, sc.start + 16, 6) > 0.3) {
      T(46, 238, 'The languages agree on every string tested: ' + (RED.sameLang ? 'identical sets' : 'DIFFERENT') + '.', 10.5, INK, true);
      T(46, 258, 'The state count does not. So the count is not a property of the language — and neither is anything else read off the description.', 10, DIM);
    }

    if (grow(t, sc.start + 22, 7) > 0.3) {
      var y3 = panel(46, 282, 808, 118, 'Rice\u2019s theorem', 'bad');
      T(64, y3, 'Every non-trivial property of the language L(M) is undecidable.', 12, BAD, true);
      T(64, y3 + 24, 'Non-trivial: some language has the property and some language does not. That is the only hypothesis.', 10, INK);
      T(64, y3 + 44, 'Proof shape: one machine M1 with L(M1) in P and one M2 with L(M2) not in P, then a reduction from A_TM.', 9.5, DIM);
      T(64, y3 + 62, 'The proof is uniform in P, which is why one theorem settles an unlimited family of questions.', 9.5, DIM);
    }

    if (grow(t, sc.start + 27, 3) > 0.4) {
      T(46, 416, 'The two trivial properties — true of all, true of none — are decidable, and they are the theorem\u2019s only exclusion.', 10, WARN);
    }
  };

  /* ---------------- 9. ricetrap ---------------- */
  SCENE_DRAW.ricetrap = function (t, sc, p) {
    hdr('Where Rice stops',
        'Sort the property first: semantic or syntactic, trivial or non-trivial.');

    var items = [
      { txt: 'L(M) = \u2205', tag: 'semantic', k: 'bad', why: 'undecidable, and not recognisable' },
      { txt: 'L(M) \u2260 \u2205', tag: 'semantic', k: 'bad', why: 'undecidable, still recognisable' },
      { txt: 'L(M) is regular', tag: 'semantic', k: 'bad', why: 'undecidable (Rice)' },
      { txt: 'M has \u2265 21 states', tag: 'syntactic', k: 'good', why: 'decidable: count the encoding' },
      { txt: 'reaches q in 100 steps', tag: 'bounded', k: 'good', why: 'decidable: simulate 100 steps' },
      { txt: 'reaches q ever', tag: 'unbounded', k: 'bad', why: 'undecidable, recognisable' },
      { txt: 'L(M) is recognisable', tag: 'trivial', k: 'good', why: 'decidable: true of all' },
      { txt: 'L(M) is not recognisable', tag: 'trivial', k: 'good', why: 'decidable: true of none' }
    ];

    var g = grow(t, sc.start + 2, 16);
    var shown = Math.max(1, Math.round(items.length * Math.min(1, g * 1.2)));
    for (var i = 0; i < shown; i++) {
      var it = items[i];
      var x = 46 + (i % 2) * 414, y = 78 + Math.floor(i / 2) * 82;
      var good = it.k === 'good';
      P.rect(x, y, 394, 72, {
        fill: good ? SURF : BADDIM, stroke: good ? VAL : BAD, radius: 7, sw: 1.2
      });
      T(x + 14, y + 12, it.txt, 11, INK, true, true);
      T(x + 14, y + 34, it.tag, 9, good ? VAL : BAD, true);
      T(x + 14, y + 50, it.why, 9.5, DIM);
      T(x + 372, y + 12, good ? 'decidable' : 'undecidable', 9.5, good ? VAL : BAD, true, false, 'right');
    }

    if (grow(t, sc.start + 22, 6) > 0.3) {
      T(46, 404, 'Rice gives undecidable, never unrecognisable. Undecidable and unrecognisable are two verdicts, and a question can ask for either.', 10, WARN, true);
      T(46, 426, 'The two escapes from Rice: read the description, or bound the number of steps.', 10, INK);
    }
  };

  /* ---------------- 10. table ---------------- */
  SCENE_DRAW.table = function (t, sc, p) {
    hdr('Which tool for which question',
        'Four exam shapes, and the tool that settles each.');

    var rows = [
      { a: 'property of L(M)', b: 'Rice, after two checks', k: 'bad' },
      { a: 'two machines compared', b: 'Rice on the pair, non-trivial', k: 'bad' },
      { a: 'L \u2264m A_TM — what follows?', b: 'nothing; use \u2205', k: 'warn' },
      { a: 'several languages to sort', b: 'semantic / syntactic, item by item', k: null },
      { a: 'bounded steps on every string', b: 'decidable: the head sees a prefix', k: 'good' }
    ];

    var g = grow(t, sc.start + 2, 16);
    var shown = Math.max(1, Math.round(rows.length * Math.min(1, g * 1.3)));
    for (var i = 0; i < shown; i++) {
      var r = rows[i];
      var y = 82 + i * 62;
      var col = r.k === 'bad' ? BAD : r.k === 'good' ? VAL : r.k === 'warn' ? WARN : INFO;
      var fill = r.k === 'bad' ? BADDIM : r.k === 'good' ? ACCDIM : r.k === 'warn' ? WARNDIM : SURF2;
      P.rect(46, y, 808, 52, { fill: SURF, stroke: BORDER, radius: 6, sw: 1 });
      P.rect(46, y, 6, 52, { fill: col, stroke: null, radius: 3 });
      T(66, y + 10, r.a, 11, INK, true);
      T(66, y + 30, r.b, 10, DIM);
    }

    if (grow(t, sc.start + 22, 6) > 0.3) {
      chip(46, 396, 'the direction of the arrow is the argument', 'warn');
      chip(400, 396, 'everything else is decoration', null);
      T(46, 428, 'Name the source problem, name the target problem, build the function, check the iff. Four lines, and the direction is decided before the first line.', 10, INK);
    }
  };

  /* ---------------- frame ---------------- */

  function drawFrame(t) {
    if (!P) return;
    P.clear();
    var scenes = window.LESSON_TIMELINE.scenes;
    var i = K.sceneAt(t);
    var sc = scenes[i];
    if (!sc) return;
    var p = K.sceneProgress(t);
    var fn = SCENE_DRAW[sc.id];
    if (fn) fn(t, sc, p);

    /* a thin progress rule under every frame */
    P.rect(0, H - 5, W * K.clamp01((t - sc.start) / Math.max(0.001, sc.end - sc.start)), 5,
           { fill: ACC, stroke: null });
  }

  /* ======================================================================
     LAYER 4 - BOOT
     ====================================================================== */

  function paintChecks() {
    var el = document.getElementById('checks');
    if (!el) return;
    var pass = CHECKS.filter(function (c) { return c.pass; }).length;
    var bad = CHECKS.length - pass;
    el.innerHTML = '<span class="k">Model checks</span>' + pass + ' of ' + CHECKS.length +
      ' pass' + (bad ? ' \u00b7 ' + bad + ' FAILED' : ' \u00b7 all computed at load');
  }

  function boot() {
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

    paintChecks();

    window.__drawAt = function (t) {
      K.state.elapsed = t;
      if (P) drawFrame(t);
    };
    window.__lessonChecks = CHECKS;
    window.__model = {
      RED: RED,
      checks: CHECKS.length,
      sample: RED.sampleSize,
      correspondence: RED.countHalt + '/' + RED.instances
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
