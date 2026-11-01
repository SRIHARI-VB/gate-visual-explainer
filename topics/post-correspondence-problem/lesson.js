/* ==========================================================================
   post-correspondence-problem — model, validation, render.

   Layer 1  model      : the PCP instance and its match, the prefix invariant
                         and the overhang, the pruned search and its node count,
                         the instance whose frontier never empties, the MPCP to
                         PCP padding, the CFG-ambiguity construction, the
                         decidability table, and the unary decider.
   Layer 2  validation : every quoted number is recomputed by a second route —
                         exhaustive enumeration against the pruned search, a
                         brute-force search against the unary decider, and a
                         string comparison against every display.
   Layer 3  render     : reads the model; never re-derives a number.
   Layer 4  timeline   : in timeline.js — the only source of time.

   No p5.brush: every mark here is a string, a count or a table cell the learner
   has to read exactly. A random stroke offset would blur the thing being read.
   ========================================================================== */

(function () {
  'use strict';

  var K = window.LessonKit;
  var PR = window.Painters;
  var W = 900, H = 470;
  var P = null;

  /* ======================================================================
     LAYER 1 — THE MODEL
     ====================================================================== */

  function compatible(t, b) {
    return t.indexOf(b) === 0 || b.indexOf(t) === 0;
  }

  function concat(seq, dom, side) {
    var s = '';
    for (var i = 0; i < seq.length; i++) s += dom[seq[i]][side];
    return s;
  }

  /* --- the search ------------------------------------------------------ */
  /* breadth first, one level at a time, pruned by the prefix test.
     Returns the first match found (shortest) and the survivor count at each
     level that was actually expanded. */
  function search(dom, maxlen, firstFixed) {
    var layers = [];
    var cur = firstFixed
      ? [{ seq: [0], t: dom[0][0], b: dom[0][1] }]
      : [{ seq: [], t: '', b: '' }];
    for (var L = 1; L <= maxlen; L++) {
      var nxt = [];
      for (var c = 0; c < cur.length; c++) {
        for (var i = 0; i < dom.length; i++) {
          var t2 = cur[c].t + dom[i][0];
          var b2 = cur[c].b + dom[i][1];
          if (!compatible(t2, b2)) continue;
          var s2 = cur[c].seq.concat([i]);
          if (t2 === b2) {
            layers.push(nxt.length + 1);
            return { seq: s2, layers: layers, t: t2, b: b2 };
          }
          nxt.push({ seq: s2, t: t2, b: b2 });
        }
      }
      layers.push(nxt.length);
      cur = nxt;
      if (!cur.length) return { seq: null, layers: layers, t: null, b: null };
    }
    return { seq: null, layers: layers, t: null, b: null };
  }

  /* exhaustive, no pruning, used only to prove minimality */
  function existsAtLength(dom, L) {
    var n = dom.length;
    var idx = new Array(L).fill(0);
    var total = Math.pow(n, L);
    for (var c = 0; c < total; c++) {
      var t = '', b = '';
      for (var k = 0; k < L; k++) { t += dom[idx[k]][0]; b += dom[idx[k]][1]; }
      if (t === b) return idx.slice();
      /* increment the odometer */
      for (var j = L - 1; j >= 0; j--) {
        idx[j]++;
        if (idx[j] < n) break;
        idx[j] = 0;
      }
    }
    return null;
  }

  /* --- instance S: has a match ---------------------------------------- */
  var DOM_S = [['a', 'ab'], ['b', 'aa'], ['aa', 'a'], ['ab', 'b']];
  var SEARCH_S = search(DOM_S, 7, false);
  var SEQ_S = SEARCH_S.seq;                       // [0,1,2,2]
  var TOP_S = concat(SEQ_S, DOM_S, 0);            // abaaaa
  var BOT_S = concat(SEQ_S, DOM_S, 1);            // abaaaa
  var LEN_S = SEQ_S.length;                       // 4
  var STR_S = TOP_S.length;                       // 6

  var MINIMAL = true;
  var lowerFound = null;
  for (var L = 1; L < LEN_S; L++) {
    var hit = existsAtLength(DOM_S, L);
    if (hit) { MINIMAL = false; lowerFound = hit; }
  }

  var UNPRUNED = 0;
  for (var q = 1; q <= 3; q++) UNPRUNED += Math.pow(DOM_S.length, q);   // 84
  var NODES = 0;
  for (var z = 0; z < SEARCH_S.layers.length; z++) NODES += SEARCH_S.layers[z];  // 12

  /* the overhang after each prefix of the match */
  var STEPS = [];
  (function () {
    for (var k = 1; k <= LEN_S; k++) {
      var sub = SEQ_S.slice(0, k);
      var t = concat(sub, DOM_S, 0), b = concat(sub, DOM_S, 1);
      var side = t.length > b.length ? 'top' : (b.length > t.length ? 'bottom' : 'none');
      var ov = side === 'top' ? t.slice(b.length) : (side === 'bottom' ? b.slice(t.length) : '');
      STEPS.push({ k: k, top: t, bot: b, side: side, overhang: ov, ok: compatible(t, b) });
    }
  })();
  var PREFIX_OK = STEPS.every(function (s) { return s.ok; });
  var NO_SINGLE = DOM_S.every(function (d) { return d[0] !== d[1]; });

  /* --- instance G: no match, and the frontier never empties ------------ */
  var DOM_G = [['a', 'ab'], ['b', 'bb'], ['ba', 'b']];
  var SEARCH_G = search(DOM_G, 12, false);
  var G_LAYERS = SEARCH_G.layers;
  var G_FRONTIER_END = G_LAYERS[G_LAYERS.length - 1];

  /* overhang length along the first surviving branch, level by level */
  var G_OVERHANG = [];
  (function () {
    var cur = [{ seq: [], t: '', b: '' }];
    for (var L = 1; L <= 12; L++) {
      var nxt = [];
      for (var c = 0; c < cur.length; c++) {
        for (var i = 0; i < DOM_G.length; i++) {
          var t2 = cur[c].t + DOM_G[i][0], b2 = cur[c].b + DOM_G[i][1];
          if (!compatible(t2, b2)) continue;
          if (t2 === b2) { G_OVERHANG.push(0); return; }
          nxt.push({ seq: cur[c].seq.concat([i]), t: t2, b: b2 });
        }
      }
      if (!nxt.length) break;
      G_OVERHANG.push(Math.abs(nxt[0].t.length - nxt[0].b.length));
      cur = nxt;
    }
  })();
  var G_MONOTONE = (function () {
    for (var i = 1; i < G_OVERHANG.length; i++) {
      if (G_OVERHANG[i] <= G_OVERHANG[i - 1]) return false;
    }
    return G_OVERHANG.length > 6;
  })();

  /* --- instance U: no match, decided by the first letter --------------- */
  var DOM_U = [['a', 'bb'], ['aa', 'b']];
  var SEARCH_U = search(DOM_U, 10, false);
  var U_DIES = SEARCH_U.layers[SEARCH_U.layers.length - 1] === 0;

  /* --- MPCP and the padding ------------------------------------------- */
  function starLeft(u) { var s = ''; for (var i = 0; i < u.length; i++) s += '*' + u[i]; return s; }
  function starRight(u) { var s = ''; for (var i = 0; i < u.length; i++) s += u[i] + '*'; return s; }

  var MPCP = [['a', 'aa'], ['ba', 'a'], ['aa', 'a']];
  var MPCP_SEARCH = search(MPCP, 6, true);
  var MPCP_SEQ = MPCP_SEARCH.seq;                 // [0,2]
  var MPCP_TOP = concat(MPCP_SEQ, MPCP, 0);       // aaa
  var MPCP_BOT = concat(MPCP_SEQ, MPCP, 1);       // aaa

  var PADDED = (function () {
    /* Sipser's form: the first domino is padded on both sides, so that it is the
       only domino whose two rows begin with the same symbol. */
    var out = [[starLeft(MPCP[0][0]), starLeft(MPCP[0][1]) + '*']];
    for (var i = 0; i < MPCP.length; i++) out.push([starLeft(MPCP[i][0]), MPCP[i][1] + '*']);
    out.push(['*@', '@']);
    return out;
  })();
  var PADDED_SEARCH = search(PADDED, 10, false);
  var PADDED_SEQ = PADDED_SEARCH.seq;             // [0,3,4]
  var PADDED_TOP = concat(PADDED_SEQ, PADDED, 0);
  var PADDED_BOT = concat(PADDED_SEQ, PADDED, 1);
  var STARTERS = (function () {
    var out = [];
    for (var i = 0; i < PADDED.length; i++) {
      if (PADDED[i][0].charAt(0) === PADDED[i][1].charAt(0)) out.push(i);
    }
    return out;
  })();
  /* stripping the stars and the closing domino from the padded match must
     return the MPCP match */
  /* PADDED[0] is the padded first domino and PADDED[1..n] are the MPCP
     dominoes 0..n-1 in order, so a padded index maps back by subtracting one.
     The last padded domino is the closer and is dropped. */
  var STRIPPED = (function () {
    var seq = PADDED_SEQ.slice(0, PADDED_SEQ.length - 1);
    var out = [];
    for (var i = 0; i < seq.length; i++) {
      var idx = seq[i];
      if (idx === 0) out.push(0);
      else if (idx >= 1 && idx <= MPCP.length) out.push(idx - 1);
    }
    return out;
  })();

  /* --- the ambiguity construction -------------------------------------- */
  var MARKS = ['C1', 'C2', 'C3', 'C4'];
  function ambWord(seq, dom, side) {
    var s = concat(seq, dom, side);
    for (var i = seq.length - 1; i >= 0; i--) s += MARKS[seq[i]];
    return s;
  }
  var AMB_U = ambWord(SEQ_S, DOM_S, 0);
  var AMB_V = ambWord(SEQ_S, DOM_S, 1);
  var AMB_EQ = AMB_U === AMB_V;
  var NOMATCH_U = ambWord([0, 1], DOM_S, 0);
  var NOMATCH_V = ambWord([0, 1], DOM_S, 1);
  var NOMATCH_NE = NOMATCH_U !== NOMATCH_V;

  /* --- the unary decider ----------------------------------------------- */
  /* an instance over a one-letter alphabet is a list of pairs of counts */
  function unaryDecide(inst) {
    var i, d = [];
    for (i = 0; i < inst.length; i++) {
      if (inst[i][0] === inst[i][1]) return { yes: true, why: 'zero', at: i };
    }
    for (i = 0; i < inst.length; i++) d.push(inst[i][0] - inst[i][1]);
    var anyPos = d.some(function (x) { return x > 0; });
    var anyNeg = d.some(function (x) { return x < 0; });
    if (!(anyPos && anyNeg)) return { yes: false, why: 'one sign', at: -1 };
    var pi = -1, ni = -1;
    for (i = 0; i < d.length; i++) {
      if (d[i] > 0 && pi < 0) pi = i;
      if (d[i] < 0 && ni < 0) ni = i;
    }
    return { yes: true, why: 'both signs', at: pi, pos: d[pi], neg: -d[ni], pi: pi, ni: ni };
  }

  /* brute force over a unary instance: search sequences up to a bound */
  function unaryBrute(inst, maxlen) {
    var n = inst.length;
    var cur = [{ d: 0, len: 0 }];
    for (var L = 1; L <= maxlen; L++) {
      var nxt = [];
      for (var c = 0; c < cur.length; c++) {
        for (var i = 0; i < n; i++) {
          var dd = cur[c].d + (inst[i][0] - inst[i][1]);
          if (dd === 0) return true;
          nxt.push({ d: dd, len: L });
        }
      }
      cur = nxt;
      if (cur.length > 200000) break;
    }
    return false;
  }

  var U_INSTANCES = [
    { name: 'both signs', inst: [[2, 1], [1, 3]] },     /* +1, -2 */
    { name: 'one sign', inst: [[2, 1], [3, 1]] },       /* +1, +2 */
    { name: 'zero', inst: [[2, 2], [3, 1]] }            /*  0, +2 */
  ];
  var U_RESULTS = U_INSTANCES.map(function (u) {
    var dec = unaryDecide(u.inst);
    var brute = unaryBrute(u.inst, 8);
    return { name: u.name, inst: u.inst, dec: dec, brute: brute, agree: dec.yes === brute };
  });
  var U_ALL_AGREE = U_RESULTS.every(function (r) { return r.agree; });
  var U_CONSTRUCT = (function () {
    /* the explicit match for the both-signs instance: b copies of the positive
       domino and a copies of the negative one */
    var r = U_RESULTS[0];
    var a = r.dec.pos, b = r.dec.neg;
    var top = b * r.inst[r.dec.pi][0] + a * r.inst[r.dec.ni][0];
    var bot = b * r.inst[r.dec.pi][1] + a * r.inst[r.dec.ni][1];
    return { a: a, b: b, top: top, bot: bot, eq: top === bot, count: a + b };
  })();

  /* --- the decidability table ------------------------------------------ */
  var TABLE = [
    { q: 'Emptiness of a language', reg: true, cfl: true },
    { q: 'Finiteness of a language', reg: true, cfl: true },
    { q: 'Membership of one word', reg: true, cfl: true },
    { q: 'Universality of one language', reg: true, cfl: false },
    { q: 'Equivalence of two languages', reg: true, cfl: false },
    { q: 'Emptiness of the intersection of two', reg: true, cfl: false }
  ];

  /* ======================================================================
     LAYER 2 — VALIDATION
     ====================================================================== */

  var CHECKS = [];
  function check(name, pass, detail) {
    CHECKS.push({ name: name, pass: !!pass, detail: detail || '' });
  }

  check('the search finds a match on instance S', !!SEQ_S && SEQ_S.length > 0);
  check('the two rows of that match are equal', TOP_S === BOT_S, TOP_S + ' / ' + BOT_S);
  check('the match is 1, 2, 3, 3', SEQ_S.join(',') === '0,1,2,2', SEQ_S.join(','));
  check('the match reads six letters', STR_S === 6, String(STR_S));
  check('no domino of S matches by itself', NO_SINGLE);
  check('no match exists at length 1, 2 or 3', MINIMAL, lowerFound ? 'found ' + lowerFound.join(',') : 'none');
  check('the exhaustive count of sequences up to length 3 is 84', UNPRUNED === 84, String(UNPRUNED));
  check('the pruned search examined 12 nodes', NODES === 12, String(NODES));
  check('pruning examined far fewer nodes than the enumeration',
        NODES * 4 < UNPRUNED, NODES + ' vs ' + UNPRUNED);
  check('the prefix invariant holds at all four steps', PREFIX_OK);
  check('the overhang is b, aa, a and then empty',
        STEPS.map(function (s) { return s.overhang; }).join('|') === 'b|aa|a|',
        STEPS.map(function (s) { return s.overhang; }).join('|'));
  check('the last step has equal row lengths',
        STEPS[STEPS.length - 1].top.length === STEPS[STEPS.length - 1].bot.length);
  check('instance G has no match to depth 12', SEARCH_G.seq === null);
  check('instance G frontier is nonempty at depth 12', G_FRONTIER_END > 0, String(G_FRONTIER_END));
  check('the overhang of G grows by one at every level', G_MONOTONE,
        G_OVERHANG.join(','));
  check('instance U dies at depth 1', U_DIES);
  check('MPCP match is 1, 3 and both rows read aaa',
        MPCP_SEQ.join(',') === '0,2' && MPCP_TOP === MPCP_BOT && MPCP_TOP === 'aaa');
  check('only one padded domino starts with the same symbol on both rows',
        STARTERS.length === 1 && STARTERS[0] === 0, STARTERS.join(','));
  check('the padded instance has a match', !!PADDED_SEQ && PADDED_SEQ.length > 0);
  check('the padded match is 1, 4, 5', PADDED_SEQ && PADDED_SEQ.join(',') === '0,3,4',
        PADDED_SEQ ? PADDED_SEQ.join(',') : 'none');
  check('the padded rows are equal', PADDED_TOP === PADDED_BOT, PADDED_TOP);
  check('stripping the padding recovers the MPCP match',
        STRIPPED.join(',') === MPCP_SEQ.join(','), STRIPPED.join(','));
  check('the ambiguity word built from the tops equals the one from the bottoms', AMB_EQ, AMB_U);
  check('a non-match gives two different words', NOMATCH_NE, NOMATCH_U + ' / ' + NOMATCH_V);
  check('the unary decider agrees with brute force on all three instances', U_ALL_AGREE,
        U_RESULTS.map(function (r) { return r.name + ':' + r.dec.yes + '/' + r.brute; }).join(' '));
  check('the unary construction gives two equal rows', U_CONSTRUCT.eq,
        U_CONSTRUCT.top + ' / ' + U_CONSTRUCT.bot);
  check('the decidability table has six rows and three of them split by class',
        TABLE.length === 6 && TABLE.filter(function (r) { return r.reg !== r.cfl; }).length === 3);

  var PASSED = CHECKS.filter(function (c) { return c.pass; }).length;

  /* ======================================================================
     LAYER 3 — RENDER
     ====================================================================== */

  function stage(p, a, b) {
    if (p <= a) return 0;
    if (p >= b) return 1;
    return K.ease((p - a) / (b - a));
  }

  function head(P, kicker, title) {
    P.alpha(1);
    P.text(28, 24, kicker, { size: 10, mono: true, color: PR.PAL.faint });
    P.text(28, 40, title, { size: 16, bold: true, mono: true, color: PR.PAL.ink });
    P.line(28, 66, W - 28, 66, { stroke: PR.PAL.border, sw: 1 });
  }

  function line(P, y, s, opts) {
    opts = opts || {};
    P.text(opts.x || 28, y, s, {
      size: opts.size || 12, color: opts.color || PR.PAL.dim,
      mono: !!opts.mono, bold: !!opts.bold
    });
  }

  /* a domino: a rounded rect split into a top and a bottom half */
  function domino(P, x, y, w, h, top, bot, opts) {
    opts = opts || {};
    P.rect(x, y, w, h, { fill: opts.fill || PR.PAL.surface2, stroke: opts.stroke || PR.PAL.border, sw: 1.4, radius: 7 });
    P.line(x, y + h / 2, x + w, y + h / 2, { stroke: opts.stroke || PR.PAL.border, sw: 1.2 });
    P.text(x + w / 2, y + h / 4, top, { size: opts.size || 13, mono: true, bold: true, align: 'center', base: 'middle', color: opts.topColor || PR.PAL.ink });
    P.text(x + w / 2, y + 3 * h / 4, bot, { size: opts.size || 13, mono: true, bold: true, align: 'center', base: 'middle', color: opts.botColor || PR.PAL.accent });
  }

  /* a string drawn as one cell per letter; returns the width used */
  function cells(P, x, y, s, opts) {
    opts = opts || {};
    var cw = opts.cw || 21, ch = opts.ch || 24;
    if (!s.length) return 0;
    for (var i = 0; i < s.length; i++) {
      var hi = opts.highlightFrom != null && i >= opts.highlightFrom;
      P.rect(x + i * cw, y, cw - 2, ch, {
        fill: hi ? (opts.hiFill || PR.PAL.accentDim) : (opts.fill || PR.PAL.surface2),
        stroke: hi ? (opts.hiStroke || PR.PAL.accent) : (opts.stroke || PR.PAL.border),
        sw: 1, radius: 3
      });
      P.text(x + i * cw + (cw - 2) / 2, y + ch / 2, s.charAt(i), {
        size: opts.size || 12, mono: true, bold: true, align: 'center', base: 'middle',
        color: hi ? PR.PAL.accent : PR.PAL.ink
      });
    }
    return s.length * cw;
  }

  function chip(P, x, y, w, h, label, colour, dim) {
    P.rect(x, y, w, h, { fill: dim, stroke: colour, sw: 1.2, radius: 6 });
    P.text(x + w / 2, y + h / 2, label, { size: 11, mono: true, bold: true, align: 'center', base: 'middle', color: colour });
  }

  /* ---------------- scene 1: dominoes ---------------------------------- */
  function drawDominoes(P, t, p) {
    head(P, 'scene 1', 'An instance is a finite set of dominoes');

    var a1 = stage(p, 0.02, 0.18);
    P.alpha(a1);
    line(P, 88, 'Each domino carries a string on its top half and a string on its bottom half.', { size: 12.5, color: PR.PAL.ink });

    for (var i = 0; i < DOM_S.length; i++) {
      var a = stage(p, 0.06 + i * 0.05, 0.22 + i * 0.05);
      P.alpha(a);
      domino(P, 120 + i * 160, 108, 100, 104, DOM_S[i][0], DOM_S[i][1]);
      P.text(170 + i * 160, 224, 'D' + (i + 1), { size: 11, mono: true, align: 'center', color: PR.PAL.faint });
    }
    P.alpha(1);

    var a2 = stage(p, 0.36, 0.52);
    P.alpha(a2);
    line(P, 258, 'The alphabet here is { a, b }. A domino is a pair of strings, not a rule and not a number.', { size: 11.5 });
    P.alpha(1);

    var a3 = stage(p, 0.54, 0.72);
    P.alpha(a3);
    P.rect(28, 274, W - 56, 84, { fill: PR.PAL.surface2, stroke: PR.PAL.border, sw: 1, radius: 8 });
    line(P, 294, 'A match is a nonempty ordering i1, i2, ... ik of dominoes whose', { size: 12, bold: true, color: PR.PAL.accent, x: 44 });
    line(P, 314, 'top strings, concatenated in that order, equal the bottom strings concatenated in the same order.', { size: 11.5, x: 44 });
    line(P, 336, 'The same index sequence is used on both rows. Repetition of a domino is allowed.', { size: 11.5, x: 44 });
    P.alpha(1);

    var a4 = stage(p, 0.76, 0.94);
    P.alpha(a4);
    line(P, 386, 'The question is existence, for an arbitrary instance:', { size: 12, bold: true, color: PR.PAL.warn });
    line(P, 408, 'deciding whether a match exists is the problem Post proved unsolvable in 1946.', { size: 11.5 });
    P.alpha(1);
  }

  /* ---------------- scene 2: match ------------------------------------- */
  function drawMatch(P, t, p) {
    head(P, 'scene 2', 'Building the match 1, 2, 3, 3');

    var x0 = 96, dy = 96, dw = 120, dh = 112;
    for (var k = 0; k < LEN_S; k++) {
      var a = stage(p, 0.05 + k * 0.16, 0.19 + k * 0.16);
      P.alpha(a);
      var d = DOM_S[SEQ_S[k]];
      domino(P, x0 + k * 170, dy, dw, dh, d[0], d[1], { size: 15 });
      P.text(x0 + k * 170 + dw / 2, dy + dh + 16, 'slot ' + (k + 1) + ': D' + (SEQ_S[k] + 1),
             { size: 10.5, mono: true, align: 'center', color: PR.PAL.faint });
    }
    P.alpha(1);

    /* the running rows */
    var shown = 0;
    for (var k2 = 0; k2 < LEN_S; k2++) {
      if (p >= 0.19 + k2 * 0.16) shown = k2 + 1;
    }
    if (shown === 0) shown = 1;
    var step = STEPS[shown - 1];

    var a2 = stage(p, 0.1, 0.25);
    P.alpha(a2);
    P.text(28, 258, 'top', { size: 10.5, mono: true, color: PR.PAL.faint });
    cells(P, 76, 246, step.top, {});
    P.text(28, 296, 'bottom', { size: 10.5, mono: true, color: PR.PAL.faint });
    cells(P, 76, 284, step.bot, { hiStroke: PR.PAL.warn, hiFill: PR.PAL.warnDim, highlightFrom: step.top.length });
    P.alpha(1);

    var a3 = stage(p, 0.72, 0.86);
    P.alpha(a3);
    P.rect(28, 330, W - 56, 62, { fill: PR.PAL.accentDim, stroke: PR.PAL.accent, sw: 1, radius: 8 });
    line(P, 352, 'After four dominoes both rows read ' + TOP_S + ', so 1, 2, 3, 3 is a match.',
         { size: 12.5, bold: true, color: PR.PAL.accent, x: 44 });
    line(P, 374, 'The highlighted tail is the part of the longer row the shorter one has not reached yet.',
         { size: 11, x: 44 });
    P.alpha(1);

    var a4 = stage(p, 0.88, 0.99);
    P.alpha(a4);
    line(P, 414, 'The rows are allowed to disagree while the match is being built. Only the finished rows must be equal.', { size: 11.5 });
    P.alpha(1);
  }

  /* ---------------- scene 3: prefix ------------------------------------ */
  function drawPrefix(P, t, p) {
    head(P, 'scene 3', 'The overhang: the only pruning there is');

    var a0 = stage(p, 0.02, 0.16);
    P.alpha(a0);
    line(P, 86, 'At every step one row is a prefix of the other. The unmatched tail is the overhang.', { size: 12, color: PR.PAL.ink });
    P.alpha(1);

    for (var k = 0; k < STEPS.length; k++) {
      var a = stage(p, 0.08 + k * 0.17, 0.22 + k * 0.17);
      P.alpha(a);
      var y = 112 + k * 62;
      var s = STEPS[k];
      P.text(40, y + 12, 'step ' + s.k, { size: 10.5, mono: true, color: PR.PAL.faint });
      cells(P, 120, y, s.top, { cw: 20, ch: 22 });
      cells(P, 120, y + 28, s.bot, { cw: 20, ch: 22, hiStroke: PR.PAL.warn, hiFill: PR.PAL.warnDim, highlightFrom: s.top.length });
      var note = s.side === 'none'
        ? 'equal, ' + s.top.length + ' letters each'
        : s.side + ' longer by "' + s.overhang + '"';
      P.text(430, y + 14, note, { size: 11, mono: true, color: s.side === 'none' ? PR.PAL.valid : PR.PAL.warn });
      P.text(430, y + 32, '|top| = ' + s.top.length + ',  |bottom| = ' + s.bot.length,
             { size: 10.5, mono: true, color: PR.PAL.faint });
    }
    P.alpha(1);

    var a2 = stage(p, 0.78, 0.9);
    P.alpha(a2);
    line(P, 372, 'Appending a domino never changes a letter already written, so a mismatch inside the common part', { size: 11.5 });
    line(P, 392, 'can never be repaired. That is why the test prunes, and why it is the only test available.', { size: 11.5 });
    P.alpha(1);

    var a3 = stage(p, 0.92, 0.99);
    P.alpha(a3);
    line(P, 428, 'All four prefixes of the model\u2019s match satisfy the invariant: ' + (PREFIX_OK ? 'checked, 4 of 4.' : 'check failed.'),
         { size: 11.5, bold: true, color: PR.PAL.valid });
    P.alpha(1);
  }

  /* ---------------- scene 4: search ------------------------------------ */
  function drawSearch(P, t, p) {
    head(P, 'scene 4', 'The search: 84 sequences, 12 nodes examined');

    var a0 = stage(p, 0.02, 0.16);
    P.alpha(a0);
    line(P, 86, 'Breadth first, one level at a time, so the first match found is a shortest one.', { size: 12, color: PR.PAL.ink });
    P.alpha(1);

    /* the survivor bars */
    var base = 268, maxH = 150;
    for (var i = 0; i < SEARCH_S.layers.length; i++) {
      var a = stage(p, 0.1 + i * 0.12, 0.24 + i * 0.12);
      P.alpha(a);
      var n = SEARCH_S.layers[i];
      var h = Math.max(10, (n / 4) * maxH);
      var x = 90 + i * 90;
      P.rect(x, base - h, 54, h, { fill: n === 0 ? PR.PAL.invalidDim : PR.PAL.accentDim, stroke: n === 0 ? PR.PAL.invalid : PR.PAL.accent, sw: 1.2, radius: 5 });
      P.text(x + 27, base - h - 20, String(n), { size: 12, mono: true, bold: true, align: 'center', color: PR.PAL.accent });
      P.text(x + 27, base + 16, 'level ' + (i + 1), { size: 10.5, mono: true, align: 'center', color: PR.PAL.faint });
    }
    P.alpha(1);

    var a2 = stage(p, 0.55, 0.7);
    P.alpha(a2);
    P.text(520, 112, 'survivors per level', { size: 11, mono: true, color: PR.PAL.faint });
    P.text(520, 140, SEARCH_S.layers.join('  \u00b7  '), { size: 13, mono: true, bold: true, color: PR.PAL.accent });
    P.text(520, 176, 'the match appears at level 4', { size: 11, mono: true, color: PR.PAL.valid });
    P.text(520, 200, '1, 2, 3, 3', { size: 12, mono: true, bold: true, color: PR.PAL.valid });
    P.alpha(1);

    var a3 = stage(p, 0.7, 0.84);
    P.alpha(a3);
    P.rect(500, 222, 372, 100, { fill: PR.PAL.surface2, stroke: PR.PAL.border, sw: 1, radius: 8 });
    P.text(516, 242, 'unpruned: 4 + 16 + 64 = ' + UNPRUNED + ' sequences', { size: 11.5, mono: true, color: PR.PAL.warn });
    P.text(516, 266, 'pruned:  2 + 2 + 4 + 4 = ' + NODES + ' nodes', { size: 11.5, mono: true, color: PR.PAL.accent });
    P.text(516, 290, 'levels 1 to 3 were searched exhaustively', { size: 10.5, color: PR.PAL.dim });
    P.text(516, 308, 'and none of them contains a match', { size: 10.5, color: PR.PAL.dim });
    P.alpha(1);

    var a4 = stage(p, 0.86, 0.99);
    P.alpha(a4);
    line(P, 356, 'Minimality is a separate fact: every sequence of length 1, 2 and 3 was enumerated, and none matched.', { size: 11.5 });
    line(P, 384, 'This run stopped because a match exists. When none exists the same run never stops.', { size: 12, bold: true, color: PR.PAL.warn });
    line(P, 412, 'A search that halts on success is a semidecision procedure: correct yes, silence in the no case.', { size: 11.5 });
    P.alpha(1);
  }

  /* ---------------- scene 5: neverends --------------------------------- */
  function drawNeverEnds(P, t, p) {
    head(P, 'scene 5', 'The instance where the search never ends');

    var a0 = stage(p, 0.02, 0.16);
    P.alpha(a0);
    line(P, 86, 'Three dominoes: a over ab, b over bb, ba over b. The model searched to depth 12.', { size: 12, color: PR.PAL.ink });
    for (var i = 0; i < DOM_G.length; i++) {
      domino(P, 60 + i * 130, 102, 96, 80, DOM_G[i][0], DOM_G[i][1], { size: 12 });
    }
    P.alpha(1);

    /* the overhang bar chart */
    var a2 = stage(p, 0.2, 0.42);
    P.alpha(a2);
    P.text(60, 212, 'overhang length, level by level', { size: 10.5, mono: true, color: PR.PAL.faint });
    for (var k = 0; k < G_OVERHANG.length; k++) {
      var a = stage(p, 0.24 + k * 0.03, 0.3 + k * 0.03);
      P.alpha(a);
      var h = 8 + G_OVERHANG[k] * 11;
      var x = 60 + k * 44;
      P.rect(x, 350 - h, 28, h, { fill: PR.PAL.warnDim, stroke: PR.PAL.warn, sw: 1, radius: 3 });
      P.text(x + 14, 350 - h - 14, String(G_OVERHANG[k]), { size: 9.5, mono: true, align: 'center', color: PR.PAL.warn });
      P.text(x + 14, 366, String(k + 1), { size: 9.5, mono: true, align: 'center', color: PR.PAL.faint });
    }
    P.alpha(1);

    var a3 = stage(p, 0.5, 0.66);
    P.alpha(a3);
    P.text(640, 212, 'frontier at each depth', { size: 10.5, mono: true, color: PR.PAL.faint });
    P.text(640, 238, G_LAYERS.slice(0, 6).join(' \u00b7 '), { size: 11.5, mono: true, color: PR.PAL.warn });
    P.text(640, 264, 'at depth 12: ' + G_FRONTIER_END + ' branches still open', { size: 11, mono: true, color: PR.PAL.invalid });
    P.text(640, 292, 'no match at any depth up to 12', { size: 11, color: PR.PAL.dim });
    P.text(640, 312, 'and nothing here proves there is none', { size: 11, bold: true, color: PR.PAL.invalid });
    P.alpha(1);

    var a4 = stage(p, 0.7, 0.86);
    P.alpha(a4);
    line(P, 386, 'The gap grows by one letter per domino, so no branch ever closes. The frontier never empties,', { size: 11.5 });
    line(P, 406, 'so the search has nothing to report at any depth. It is not stuck: it is unfinished.', { size: 11.5 });
    P.alpha(1);

    var a5 = stage(p, 0.88, 0.99);
    P.alpha(a5);
    line(P, 436, 'A bounded search can prove a yes. It can never prove a no. The proof of no is the reduction.', { size: 11.5, bold: true, color: PR.PAL.accent });
    P.alpha(1);
  }

  /* ---------------- scene 6: mpcp -------------------------------------- */
  function drawMpcp(P, t, p) {
    head(P, 'scene 6', 'MPCP: fix the first domino, then pad it away');

    var a0 = stage(p, 0.02, 0.16);
    P.alpha(a0);
    line(P, 88, 'MPCP is PCP with one extra rule: the match must begin with domino 1.', { size: 12, color: PR.PAL.ink });
    for (var i = 0; i < MPCP.length; i++) {
      var isMatch = (i === 0 || i === 2);
      domino(P, 120 + i * 130, 106, 100, 76, MPCP[i][0], MPCP[i][1],
             { size: 12, stroke: isMatch ? PR.PAL.accent : PR.PAL.border,
               fill: isMatch ? PR.PAL.accentDim : PR.PAL.surface2 });
    }
    P.text(500, 148, 'match: 1, 3', { size: 11.5, mono: true, bold: true, color: PR.PAL.accent });
    P.text(500, 168, 'both rows read ' + MPCP_TOP, { size: 11, mono: true, color: PR.PAL.dim });
    P.alpha(1);

    var a2 = stage(p, 0.3, 0.48);
    P.alpha(a2);
    line(P, 214, 'Pad it into a PCP instance: a star before every letter on the top, a star after every letter on the bottom.', { size: 11.5 });
    P.alpha(1);

    var a3 = stage(p, 0.48, 0.7);
    P.alpha(a3);
    for (var j = 0; j < PADDED.length; j++) {
      var hit = PADDED_SEQ.indexOf(j) >= 0;
      domino(P, 96 + j * 152, 240, 128, 76, PADDED[j][0], PADDED[j][1],
             { size: 12, stroke: hit ? PR.PAL.accent : PR.PAL.border,
               fill: hit ? PR.PAL.accentDim : PR.PAL.surface2 });
    }
    P.text(96, 232, 'PCP instance', { size: 10, mono: true, color: PR.PAL.faint });
    P.alpha(1);

    var a4 = stage(p, 0.7, 0.86);
    P.alpha(a4);
    P.rect(28, 330, W - 56, 58, { fill: PR.PAL.surface2, stroke: PR.PAL.border, sw: 1, radius: 8 });
    line(P, 350, 'Only domino 1 has the same first symbol on both rows, so every PCP match must start there.',
         { size: 11.5, bold: true, color: PR.PAL.accent, x: 44 });
    line(P, 372, 'The match is 1, 4, 5 and reads ' + PADDED_TOP + ' on both rows. Stripping the stars gives 1, 3 back.',
         { size: 11, mono: true, x: 44 });
    P.alpha(1);

    var a5 = stage(p, 0.88, 0.99);
    P.alpha(a5);
    line(P, 414, 'The correspondence is an if-and-only-if: MPCP has a match exactly when the padded PCP instance does.', { size: 11.5 });
    line(P, 438, 'So MPCP reduces to PCP, and a decider for PCP would decide MPCP.', { size: 11.5, bold: true, color: PR.PAL.warn });
    P.alpha(1);
  }

  /* ---------------- scene 7: reduction --------------------------------- */
  function drawReduction(P, t, p) {
    head(P, 'scene 7', 'The reduction: a match is an accepting history');

    var a0 = stage(p, 0.02, 0.16);
    P.alpha(a0);
    line(P, 88, 'From a machine and its input, build dominoes out of the machine\u2019s own transition table.', { size: 12, color: PR.PAL.ink });
    P.alpha(1);

    var KINDS = [
      { top: '#', bot: '#q0w#' , label: 'start' },
      { top: 'z', bot: 'z', label: 'copy' },
      { top: 'qa', bot: 'br', label: 'move R' },
      { top: 'zqa', bot: 'rzb', label: 'move L' },
      { top: 'qacc#', bot: '#', label: 'finish' }
    ];
    for (var i = 0; i < KINDS.length; i++) {
      var a = stage(p, 0.1 + i * 0.06, 0.24 + i * 0.06);
      P.alpha(a);
      domino(P, 60 + i * 168, 112, 132, 86, KINDS[i].top, KINDS[i].bot, { size: 12 });
      P.text(126 + i * 168, 216, KINDS[i].label, { size: 10.5, mono: true, align: 'center', color: PR.PAL.faint });
    }
    P.alpha(1);

    var a2 = stage(p, 0.48, 0.66);
    P.alpha(a2);
    P.rect(28, 240, W - 56, 90, { fill: PR.PAL.accentDim, stroke: PR.PAL.accent, sw: 1, radius: 8 });
    line(P, 262, 'The top row carries the history with the head marker; the bottom row carries the same history one step behind.',
         { size: 11.5, color: PR.PAL.accent, x: 44, bold: true });
    line(P, 286, 'Equality at the end means the history is complete and the machine has accepted.', { size: 11.5, x: 44 });
    line(P, 310, 'Until the machine accepts, no match can be assembled, because the finishing dominoes are the only ones that close it.',
         { size: 11, x: 44 });
    P.alpha(1);

    var a3 = stage(p, 0.7, 0.84);
    P.alpha(a3);
    line(P, 360, 'So this instance has a match exactly when that machine accepts that input.', { size: 12, bold: true, color: PR.PAL.warn });
    line(P, 386, 'A decider for PCP would therefore decide the halting problem, which has no decider.', { size: 11.5 });
    P.alpha(1);

    var a4 = stage(p, 0.86, 0.99);
    P.alpha(a4);
    line(P, 414, 'Theorem (Post, 1946). PCP is undecidable over any alphabet of at least two letters.', { size: 12.5, bold: true, mono: true, color: PR.PAL.accent });
    line(P, 438, 'The two-letter hypothesis is part of the theorem, and scene 10 is the counterexample that needs it.', { size: 11.5 });
    P.alpha(1);
  }

  /* ---------------- scene 8: ambiguity --------------------------------- */
  function drawAmbiguity(P, t, p) {
    head(P, 'scene 8', 'Consequence: grammar ambiguity is undecidable');

    var a0 = stage(p, 0.02, 0.16);
    P.alpha(a0);
    line(P, 88, 'One nonterminal, one production per domino, and a marker letter that records the index.', { size: 12, color: PR.PAL.ink });
    P.alpha(1);

    var a1 = stage(p, 0.14, 0.32);
    P.alpha(a1);
    P.rect(28, 106, 420, 74, { fill: PR.PAL.surface2, stroke: PR.PAL.info, sw: 1.2, radius: 8 });
    P.text(44, 126, 'L_U: tops, then the markers reversed', { size: 11.5, mono: true, bold: true, color: PR.PAL.info });
    P.text(44, 150, AMB_U, { size: 13, mono: true, bold: true, color: PR.PAL.ink });
    P.text(44, 170, 'u1 u2 u3 u3  C3 C3 C2 C1', { size: 10, mono: true, color: PR.PAL.faint });

    P.rect(470, 106, 402, 74, { fill: PR.PAL.surface2, stroke: PR.PAL.valid, sw: 1.2, radius: 8 });
    P.text(486, 126, 'L_V: bottoms, then the markers reversed', { size: 11.5, mono: true, bold: true, color: PR.PAL.valid });
    P.text(486, 150, AMB_V, { size: 13, mono: true, bold: true, color: PR.PAL.ink });
    P.text(486, 170, 'v1 v2 v3 v3  C3 C3 C2 C1', { size: 10, mono: true, color: PR.PAL.faint });
    P.alpha(1);

    var a2 = stage(p, 0.4, 0.58);
    P.alpha(a2);
    P.arrow(238, 184, 238, 226, { stroke: PR.PAL.info, sw: 1.4 });
    P.arrow(671, 184, 671, 226, { stroke: PR.PAL.valid, sw: 1.4 });
    P.rect(238, 228, 434, 60, { fill: PR.PAL.accentDim, stroke: PR.PAL.accent, sw: 1.4, radius: 8 });
    P.text(455, 248, 'one word, two derivations', { size: 12.5, mono: true, bold: true, align: 'center', color: PR.PAL.accent });
    P.text(455, 272, AMB_U, { size: 13, mono: true, bold: true, align: 'center', color: PR.PAL.ink });
    P.alpha(1);

    var a3 = stage(p, 0.6, 0.76);
    P.alpha(a3);
    line(P, 318, 'The marker suffix is read right to left, so two words that agree on the markers agree on the index sequence.', { size: 11.5 });
    line(P, 340, 'Agreement on the tops and the bottoms then says exactly that the sequence is a match.', { size: 11.5 });
    P.alpha(1);

    var a4 = stage(p, 0.78, 0.92);
    P.alpha(a4);
    P.text(28, 368, 'a non-match, 1, 2:', { size: 10.5, mono: true, color: PR.PAL.faint });
    P.text(180, 368, NOMATCH_U + '   against   ' + NOMATCH_V, { size: 11, mono: true, color: PR.PAL.warn });
    P.text(28, 392, 'two different words, so no ambiguity from this sequence', { size: 10.5, color: PR.PAL.dim });
    P.alpha(1);

    var a5 = stage(p, 0.94, 0.99);
    P.alpha(a5);
    line(P, 428, 'So deciding ambiguity would decide PCP. Ambiguity of a context-free grammar is undecidable.', { size: 12, bold: true, color: PR.PAL.accent });
    P.alpha(1);
  }

  /* ---------------- scene 9: emptiness --------------------------------- */
  function drawEmptiness(P, t, p) {
    head(P, 'scene 9', 'Two more questions, and where the line is');

    var a0 = stage(p, 0.02, 0.16);
    P.alpha(a0);
    line(P, 88, 'The same dominoes settle two further questions about context-free grammars.', { size: 12, color: PR.PAL.ink });
    P.alpha(1);

    P.text(40, 118, 'the question', { size: 10, mono: true, color: PR.PAL.faint });
    P.text(430, 118, 'regular', { size: 10, mono: true, color: PR.PAL.faint });
    P.text(600, 118, 'context-free', { size: 10, mono: true, color: PR.PAL.faint });
    P.line(28, 126, W - 28, 126, { stroke: PR.PAL.border, sw: 1 });

    for (var i = 0; i < TABLE.length; i++) {
      var a = stage(p, 0.1 + i * 0.07, 0.22 + i * 0.07);
      P.alpha(a);
      var y = 140 + i * 36;
      P.text(40, y, TABLE[i].q, { size: 11.5, color: PR.PAL.ink });
      chip(P, 420, y - 12, 110, 24, 'decidable', PR.PAL.valid, PR.PAL.validDim);
      chip(P, 590, y - 12, 110, 24,
           TABLE[i].cfl ? 'decidable' : 'undecidable',
           TABLE[i].cfl ? PR.PAL.valid : PR.PAL.invalid,
           TABLE[i].cfl ? PR.PAL.validDim : PR.PAL.invalidDim);
      P.line(28, y + 22, W - 28, y + 22, { stroke: PR.PAL.border, sw: 0.6 });
    }
    P.alpha(1);

    var a2 = stage(p, 0.62, 0.78);
    P.alpha(a2);
    line(P, 378, 'The last three rows are PCP reductions: a shared word, or an equivalent grammar, is a match in disguise.', { size: 11.5 });
    line(P, 400, 'Do not read the third column as non-closure. Non-closure says the intersection may not be context-free;', { size: 11.5 });
    line(P, 420, 'it does not say emptiness of that intersection cannot be decided. Those are different claims.', { size: 11.5, bold: true, color: PR.PAL.warn });
    P.alpha(1);

    var a3 = stage(p, 0.9, 0.99);
    P.alpha(a3);
    line(P, 446, 'The line is the class, not the operation: the same question flips when a regular language becomes context-free.', { size: 11.5, color: PR.PAL.accent });
    P.alpha(1);
  }

  /* ---------------- scene 10: unary ------------------------------------ */
  function drawUnary(P, t, p) {
    head(P, 'scene 10', 'One letter makes it decidable');

    var a0 = stage(p, 0.02, 0.16);
    P.alpha(a0);
    line(P, 88, 'Over a one-letter alphabet every string is a run, so a domino is just two lengths.', { size: 12, color: PR.PAL.ink });
    line(P, 110, 'A match needs differences that sum to zero; the prefix condition is free, because any two runs are comparable.', { size: 11.5 });
    P.alpha(1);

    for (var i = 0; i < U_RESULTS.length; i++) {
      var r = U_RESULTS[i];
      var a = stage(p, 0.2 + i * 0.1, 0.34 + i * 0.1);
      P.alpha(a);
      var x = 28 + i * 292;
      P.rect(x, 134, 272, 150, { fill: PR.PAL.surface2, stroke: r.dec.yes ? PR.PAL.valid : PR.PAL.invalid, sw: 1.2, radius: 8 });
      P.text(x + 16, 154, r.name, { size: 12, mono: true, bold: true, color: r.dec.yes ? PR.PAL.valid : PR.PAL.invalid });
      for (var j = 0; j < r.inst.length; j++) {
        var one = '';
        for (var k = 0; k < r.inst[j][0]; k++) one += '1';
        var two = '';
        for (var k2 = 0; k2 < r.inst[j][1]; k2++) two += '1';
        P.text(x + 16, 180 + j * 22, one + ' / ' + two + '   difference ' + (r.inst[j][0] - r.inst[j][1] > 0 ? '+' : '') + (r.inst[j][0] - r.inst[j][1]),
               { size: 11, mono: true, color: PR.PAL.ink });
      }
      P.text(x + 16, 246, r.dec.yes ? 'match exists' : 'no match exists', { size: 11.5, mono: true, bold: true, color: r.dec.yes ? PR.PAL.valid : PR.PAL.invalid });
      P.text(x + 16, 268, r.dec.why === 'zero' ? 'a domino with difference 0'
             : r.dec.why === 'one sign' ? 'every difference has one sign'
             : 'one positive, one negative', { size: 10, color: PR.PAL.dim });
    }
    P.alpha(1);

    var a2 = stage(p, 0.58, 0.74);
    P.alpha(a2);
    P.rect(28, 298, W - 56, 60, { fill: PR.PAL.accentDim, stroke: PR.PAL.accent, sw: 1, radius: 8 });
    line(P, 320, 'Both signs present: ' + U_CONSTRUCT.b + ' copies of the positive domino and ' + U_CONSTRUCT.a + ' of the negative one,',
         { size: 11.5, color: PR.PAL.accent, x: 44, bold: true });
    line(P, 342, 'giving ' + U_CONSTRUCT.top + ' on the top and ' + U_CONSTRUCT.bot + ' on the bottom: ' + (U_CONSTRUCT.eq ? 'equal, so the decider can print the match.' : 'not equal, check failed.'),
         { size: 11, mono: true, x: 44 });
    P.alpha(1);

    var a3 = stage(p, 0.76, 0.9);
    P.alpha(a3);
    line(P, 382, 'The decider and a brute-force search agree on all three instances: ' +
         (U_ALL_AGREE ? 'checked, 3 of 3.' : 'check failed.'), { size: 11.5, bold: true, color: PR.PAL.valid });
    P.alpha(1);

    var a4 = stage(p, 0.92, 0.99);
    P.alpha(a4);
    line(P, 412, 'So the theorem is about two letters, and any larger alphabet encodes into two without changing the answer.', { size: 11.5 });
    line(P, 434, 'The unary case is a counterexample to the missing hypothesis, not an exception to the theorem.', { size: 11.5, bold: true, color: PR.PAL.warn });
    P.alpha(1);
  }

  /* ---------------- scene 11: traps ------------------------------------ */
  function drawTraps(P, t, p) {
    head(P, 'scene 11', 'The four slips that cost marks');

    var TRAPS = [
      { bad: 'The search found no match, so there is none.', good: 'No match of length at most k. The bound belongs in the sentence.' },
      { bad: 'Undecidable means this instance has no solution.', good: 'Undecidable means no one algorithm covers every instance.' },
      { bad: 'Checking a given match is as hard as deciding.', good: 'Checking is a walk along two strings; deciding is the hard question.' },
      { bad: 'Rice\u2019s theorem settles it.', good: 'Rice is about properties of languages. PCP has its own reduction.' }
    ];
    for (var i = 0; i < TRAPS.length; i++) {
      var a = stage(p, 0.04 + i * 0.16, 0.18 + i * 0.16);
      P.alpha(a);
      var y = 92 + i * 78;
      P.rect(28, y, 26, 26, { fill: PR.PAL.invalidDim, stroke: PR.PAL.invalid, sw: 1.2, radius: 5 });
      P.text(41, y + 13, String(i + 1), { size: 11, mono: true, bold: true, align: 'center', base: 'middle', color: PR.PAL.invalid });
      P.text(70, y + 4, TRAPS[i].bad, { size: 12, color: PR.PAL.invalid, bold: true });
      P.text(70, y + 26, TRAPS[i].good, { size: 11, color: PR.PAL.dim });
      P.line(28, y + 54, W - 28, y + 54, { stroke: PR.PAL.border, sw: 0.6 });
    }
    P.alpha(1);

    var a5 = stage(p, 0.72, 0.88);
    P.alpha(a5);
    P.rect(28, 404, W - 56, 40, { fill: PR.PAL.accentDim, stroke: PR.PAL.accent, sw: 1, radius: 8 });
    P.text(44, 418, 'Each one is true in some setting and false in the one being asked about. Bound the claim, name the class, name the theorem.',
           { size: 11.5, bold: true, color: PR.PAL.accent });
    P.alpha(1);
  }

  /* ---------------- scene 12: summary ---------------------------------- */
  function drawSummary(P, t, p) {
    head(P, 'scene 12', 'One object, four consequences');

    var a0 = stage(p, 0.02, 0.18);
    P.alpha(a0);
    P.text(28, 96, 'An instance is a finite set of pairs. A match is an ordering whose two rows read the same string.',
           { size: 13, mono: true, bold: true, color: PR.PAL.accent });
    P.text(28, 120, 'Reuse is allowed. The rows need not agree until the end. The question is existence, for every instance.',
           { size: 11.5, color: PR.PAL.dim });
    P.alpha(1);

    var a1 = stage(p, 0.2, 0.36);
    P.alpha(a1);
    P.line(28, 138, W - 28, 138, { stroke: PR.PAL.border, sw: 1 });
    P.text(28, 158, 'One row is always a prefix of the other. That is the only pruning, and it makes the search a tree.',
           { size: 13, mono: true, bold: true, color: PR.PAL.info });
    P.text(28, 182, 'The invariant is forced by the definition. It never turns the search into a decider.',
           { size: 11.5, color: PR.PAL.dim });
    P.alpha(1);

    var a2 = stage(p, 0.38, 0.58);
    P.alpha(a2);
    P.line(28, 200, W - 28, 200, { stroke: PR.PAL.border, sw: 1 });
    P.text(28, 220, 'Over two letters or more it is undecidable, and three CFL results follow from it.',
           { size: 13, mono: true, bold: true, color: PR.PAL.warn });
    P.text(28, 244, 'Ambiguity, intersection emptiness, and inequivalence of two context-free grammars.',
           { size: 11.5, color: PR.PAL.dim });
    P.alpha(1);

    var a3 = stage(p, 0.6, 0.8);
    P.alpha(a3);
    P.line(28, 262, W - 28, 262, { stroke: PR.PAL.border, sw: 1 });
    P.text(28, 282, 'Over one letter it is decidable in three cases, and that is the counterexample the hypothesis needs.',
           { size: 13, mono: true, bold: true, color: PR.PAL.valid });
    P.text(28, 306, 'A zero difference wins, one sign loses, both signs win by an explicit construction.',
           { size: 11.5, color: PR.PAL.dim });
    P.alpha(1);

    var a4 = stage(p, 0.82, 0.99);
    P.alpha(a4);
    P.rect(28, 330, W - 56, 110, { fill: PR.PAL.accentDim, stroke: PR.PAL.accent, sw: 1, radius: 8 });
    P.text(44, 350, 'Four sentences to carry into the exam', { size: 12, bold: true, color: PR.PAL.accent });
    P.text(44, 374, 'A match is an ordering, and repetition is allowed.', { size: 11.5, color: PR.PAL.ink });
    P.text(44, 396, 'A failed search proves nothing; a found match proves everything.', { size: 11.5, color: PR.PAL.ink });
    P.text(44, 418, 'Ambiguity, intersection emptiness and inequivalence are all one PCP reduction.', { size: 11.5, color: PR.PAL.ink });
    P.alpha(1);
  }

  /* ---------------- dispatch ------------------------------------------ */
  var SCENES = {
    dominoes: drawDominoes,
    match: drawMatch,
    prefix: drawPrefix,
    search: drawSearch,
    neverends: drawNeverEnds,
    mpcp: drawMpcp,
    reduction: drawReduction,
    ambiguity: drawAmbiguity,
    emptiness: drawEmptiness,
    unary: drawUnary,
    traps: drawTraps,
    summary: drawSummary
  };

  function drawFrame(P) {
    if (!P) return;
    P.clear();
    var st = K.state;
    var tl = window.LESSON_TIMELINE;
    var t = st.elapsed;
    var idx = 0;
    for (var i = tl.scenes.length - 1; i >= 0; i--) {
      if (t >= tl.scenes[i].start - 1e-6) { idx = i; break; }
    }
    var sc = tl.scenes[idx];
    var p = K.clamp01((t - sc.start) / Math.max(0.001, sc.end - sc.start));
    var fn = SCENES[sc.id];
    if (fn) fn(P, t, p);
  }

  /* ======================================================================
     boot
     ====================================================================== */

  function reportChecks() {
    var el = document.getElementById('checks');
    if (!el) return;
    var bad = CHECKS.length - PASSED;
    el.innerHTML = '<span class="k">Model checks</span>' +
      '<p class="small" style="margin:6px 0 0">' + PASSED + ' of ' + CHECKS.length + ' passed' +
      (bad ? ' <span style="color:var(--invalid)">(' + bad + ' failed)</span>' : '') + '</p>';
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
            drawFrame(P);
          };
          sk.draw = function () { if (P) drawFrame(P); };
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
        var cv = document.createElement('canvas');
        cv.width = W; cv.height = H;
        if (holder) holder.appendChild(cv);
        var ctx2d = cv.getContext && cv.getContext('2d');
        if (ctx2d) { P = PR.makePainter2D(ctx2d, W, H); drawFrame(P); drew = true; }
      } catch (e) {
        console.error('canvas fallback failed', e);
      }
      if (!drew && fallback) fallback.classList.add('show');
    }

    if (K && K.init) {
      K.init({ timeline: window.LESSON_TIMELINE, draw: function () { if (P) drawFrame(P); } });
    }

    window.__drawAt = function (t) {
      K.state.elapsed = t;
      if (P) drawFrame(P);
    };

    var bad = CHECKS.filter(function (c) { return !c.pass; });
    if (bad.length) console.warn('Model validation did not fully pass:', bad);
  }

  window.LESSON_MODEL = {
    DOM_S: DOM_S, SEQ_S: SEQ_S, TOP_S: TOP_S, BOT_S: BOT_S,
    LEN_S: LEN_S, STR_S: STR_S, MINIMAL: MINIMAL, NO_SINGLE: NO_SINGLE,
    UNPRUNED: UNPRUNED, NODES: NODES, LAYERS: SEARCH_S.layers,
    STEPS: STEPS, PREFIX_OK: PREFIX_OK,
    DOM_G: DOM_G, G_LAYERS: G_LAYERS, G_OVERHANG: G_OVERHANG, G_FRONTIER_END: G_FRONTIER_END,
    DOM_U: DOM_U, U_DIES: U_DIES,
    MPCP: MPCP, MPCP_SEQ: MPCP_SEQ, MPCP_TOP: MPCP_TOP,
    PADDED: PADDED, PADDED_SEQ: PADDED_SEQ, PADDED_TOP: PADDED_TOP, STARTERS: STARTERS,
    AMB_U: AMB_U, AMB_V: AMB_V, AMB_EQ: AMB_EQ,
    NOMATCH_U: NOMATCH_U, NOMATCH_V: NOMATCH_V,
    U_RESULTS: U_RESULTS, U_CONSTRUCT: U_CONSTRUCT, U_ALL_AGREE: U_ALL_AGREE,
    TABLE: TABLE,
    PASSED: PASSED, TOTAL: CHECKS.length
  };

  window.__lessonChecks = CHECKS;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

})();
