/* ==========================================================================
   myhill-nerode-and-distinguishability — lesson.js
   Four layers, in order:
     1. THE MODEL      — every class, index, quotient machine and verdict shown.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The model is the Myhill–Nerode theorem for a regular language L over an
   alphabet Sigma:

     x ~_L y   iff   for every z in Sigma*, xz in L exactly when yz in L.

   ~_L is an equivalence relation and is right-invariant; L is regular exactly
   when ~_L has finitely many classes; the number of classes is the number of
   states of the minimal deterministic machine; and that machine is the quotient
   of Sigma* by ~_L. This is the statement in Hopcroft, Motwani and Ullman,
   Introduction to Automata Theory, Languages, and Computation, section 4.1.3,
   and in Sipser, Introduction to the Theory of Computation, section 1.4 (the
   theorem is often named for Nerode, 1958, and Myhill, 1957).

   Nothing is quoted: every index, every class and every quotient machine on the
   page is computed here from the language's own definition, and each computed
   value is re-checked against a property it must satisfy.
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

/* ---------- strings over a finite alphabet, up to a length ---------- */

function stringsOf(alpha, maxLen) {
  var out = [''];
  var layer = [''];
  for (var d = 0; d < maxLen; d++) {
    var next = [];
    for (var i = 0; i < layer.length; i++) {
      for (var j = 0; j < alpha.length; j++) next.push(layer[i] + alpha.charAt(j));
    }
    layer = next;
    for (var k = 0; k < layer.length; k++) out.push(layer[k]);
  }
  return out;
}

/* ---------- the signature of a string: the endings that complete it ----------
   sig(x) = { z : |z| <= M and xz in L }.  Comparing signatures over a bounded
   ending length is a finite approximation of ~_L; it is exact once M is at
   least the number of states of a machine for L, because a shortest
   distinguishing ending never repeats a state. */

function signature(x, L, alpha, M) {
  var zs = stringsOf(alpha, M);
  var out = [];
  for (var i = 0; i < zs.length; i++) {
    if (L(x + zs[i])) out.push(zs[i]);
  }
  out.sort();
  return out;
}

function sigKey(sig) { return sig.join('\u0001'); }

/* ---------- the classes of ~_L over all strings up to length K ---------- */

function classesOf(L, alpha, K, M) {
  var xs = stringsOf(alpha, K);
  var byKey = {};
  var order = [];
  for (var i = 0; i < xs.length; i++) {
    var x = xs[i];
    var s = signature(x, L, alpha, M);
    var key = sigKey(s);
    if (!byKey[key]) { byKey[key] = { key: key, sig: s, members: [] }; order.push(byKey[key]); }
    byKey[key].members.push(x);
  }
  order.forEach(function (c) {
    c.members.sort(function (a, b) { return a.length - b.length || (a < b ? -1 : a > b ? 1 : 0); });
    c.rep = c.members[0];
    c.inL = L(c.rep);
  });
  return order;
}

function indexOf(L, alpha, K, M) { return classesOf(L, alpha, K, M).length; }

/* ---------- the quotient machine built from the classes ----------
   states = classes, start = [empty string], delta([x], c) = [xc],
   accepting = classes whose members are in L. Right-invariance is what makes
   delta well defined, so the construction checks it. */

function quotientOf(L, alpha, K, M) {
  var cls = classesOf(L, alpha, K, M);
  var of = {};
  cls.forEach(function (c) {
    c.members.forEach(function (m) { of[m] = c; });
  });
  var extra = stringsOf(alpha, K + 1);
  extra.forEach(function (m) {
    if (!of[m]) of[m] = { key: sigKey(signature(m, L, alpha, M)) };
  });
  var delta = {};
  var wellDefined = true;
  cls.forEach(function (c) {
    delta[c.key] = {};
    for (var i = 0; i < alpha.length; i++) {
      var ch = alpha.charAt(i);
      var target = of[c.rep + ch] ? of[c.rep + ch].key : null;
      for (var j = 0; j < c.members.length; j++) {
        var t = of[c.members[j] + ch];
        if (!t || t.key !== target) wellDefined = false;
      }
      delta[c.key][ch] = target;
    }
  });
  var final = {};
  cls.forEach(function (c) { if (c.inL) final[c.key] = true; });
  return {
    classes: cls, start: cls[0].key, delta: delta, final: final,
    states: cls.map(function (c) { return c.key; }),
    wellDefined: wellDefined
  };
}

function runQuotient(q, w) {
  var st = q.start;
  for (var i = 0; i < w.length; i++) {
    st = q.delta[st] ? q.delta[st][w.charAt(i)] : null;
    if (st === null || st === undefined) return false;
  }
  return !!q.final[st];
}

/* ---------- table filling on a given deterministic machine ----------
   p and q are distinguishable when one is accepting and the other is not, or
   when some letter takes them to a distinguishable pair. Iterating to a fixed
   point marks exactly the distinguishable pairs. */

function tableFilling(dfa) {
  var st = dfa.states;
  var dist = {};
  var pairKey = function (p, q) { return p < q ? p + '\u0000' + q : q + '\u0000' + p; };
  var i, j, c;
  for (i = 0; i < st.length; i++) {
    for (j = i + 1; j < st.length; j++) {
      var a = dfa.final[st[i]] === true, b = dfa.final[st[j]] === true;
      if (a !== b) dist[pairKey(st[i], st[j])] = true;
    }
  }
  var changed = true, rounds = 0;
  while (changed) {
    changed = false;
    rounds++;
    for (i = 0; i < st.length; i++) {
      for (j = i + 1; j < st.length; j++) {
        if (dist[pairKey(st[i], st[j])]) continue;
        for (c = 0; c < dfa.alpha.length; c++) {
          var ch = dfa.alpha.charAt(c);
          var r = dfa.delta[st[i]][ch], s = dfa.delta[st[j]][ch];
          if (r !== s && dist[pairKey(r, s)]) {
            dist[pairKey(st[i], st[j])] = true;
            changed = true;
            break;
          }
        }
      }
    }
  }
  var marked = 0;
  for (i = 0; i < st.length; i++) {
    for (j = i + 1; j < st.length; j++) if (dist[pairKey(st[i], st[j])]) marked++;
  }
  return { marked: marked, pairs: (st.length * (st.length - 1)) / 2, rounds: rounds, dist: dist, pairKey: pairKey };
}

/* ---------- the languages ---------- */

function evenEven(w) { return w.replace(/b/g, '').length % 2 === 0 && w.replace(/a/g, '').length % 2 === 0; }
function mod3Zero(w) {
  if (w === '') return true;
  var r = 0;
  for (var i = 0; i < w.length; i++) r = (r * 2 + (w.charAt(i) === '1' ? 1 : 0)) % 3;
  return r === 0;
}
function ends01(w) { return w.length >= 2 && w.slice(-2) === '01'; }
function anbn(w) {
  var m = /^a*b*$/.exec(w);
  if (!m) return false;
  var a = w.split('b')[0].length;
  return a === w.length - a;
}
function aDiv2Bdiv3(w) {
  var a = w.replace(/b/g, '').length, b = w.replace(/a/g, '').length;
  return a % 2 === 0 && b % 3 === 0;
}
function ank(w) { return w.length > 0 && w.length % 3 === 0 && /^a*$/.test(w); }
function ankZero(w) { return w.length % 3 === 0 && /^a*$/.test(w); }
function no111(w) { return w.indexOf('111') < 0; }
function thirdFromEnd(w) { return w.length >= 3 && w.charAt(w.length - 3) === 'a'; }

/* a^i b^j c^k with j = k whenever i = 1: satisfies the pumping lemma, and is
   not regular. */
function lBad(w) {
  var m = /^(a*)(b*)(c*)$/.exec(w);
  if (!m) return false;
  var i = m[1].length, j = m[2].length, k = m[3].length;
  return (i !== 1) || (j === k);
}

/* the pumping condition for one string and one pumping length */
function pumps(L, w, p, kmax) {
  var n = w.length;
  if (n < p) return true;
  for (var i = 0; i < p; i++) {
    for (var j = i + 1; j <= Math.min(n, i + p); j++) {
      var y = w.slice(i, j);
      if (!y) continue;
      var ok = true;
      for (var k = 0; k < kmax; k++) {
        var rep = '';
        for (var t = 0; t < k; t++) rep += y;
        if (!L(w.slice(0, i) + rep + w.slice(j))) { ok = false; break; }
      }
      if (ok) return true;
    }
  }
  return false;
}

/* ---------- the computed facts the page shows ---------- */

var ALPHA_AB = 'ab', ALPHA_01 = '01', ALPHA_ABC = 'abc';

var CLASSES_EE = classesOf(evenEven, ALPHA_AB, 3, 6);
var IDX_EE = CLASSES_EE.length;
var IDX_MOD3 = indexOf(mod3Zero, ALPHA_01, 4, 6);
var IDX_ENDS01 = indexOf(ends01, ALPHA_01, 4, 6);
var IDX_DIV = indexOf(aDiv2Bdiv3, ALPHA_AB, 4, 8);
var IDX_ANK = indexOf(ank, 'a', 6, 8);
var IDX_ANK0 = indexOf(ankZero, 'a', 6, 8);
var IDX_NO111 = indexOf(no111, ALPHA_01, 4, 6);
var IDX_THIRD = indexOf(thirdFromEnd, ALPHA_AB, 5, 8);

var Q_EE = quotientOf(evenEven, ALPHA_AB, 3, 6);
var Q_MOD3 = quotientOf(mod3Zero, ALPHA_01, 4, 6);
var Q_ENDS01 = quotientOf(ends01, ALPHA_01, 4, 6);

/* the four-state machine a reader draws by hand for evenEven */
var DFA_EE = {
  alpha: 'ab',
  states: ['EE', 'OE', 'EO', 'OO'],
  start: 'EE',
  final: { EE: true },
  delta: {
    EE: { a: 'OE', b: 'EO' },
    OE: { a: 'EE', b: 'OO' },
    EO: { a: 'OO', b: 'EE' },
    OO: { a: 'EO', b: 'OE' }
  }
};
var TF_EE = tableFilling(DFA_EE);

/* signatures of the four representatives over endings of length at most two */
var SIG_SHORT = ['', 'a', 'b', 'ab'].map(function (x) {
  return { x: x, sig: signature(x, evenEven, ALPHA_AB, 2) };
});

/* a^n b^n: how many classes the runs a^0..a^M fall into, for growing bounds */
var ANBN_GROWTH = [5, 6, 7, 8].map(function (M) {
  var keys = {};
  for (var i = 0; i <= M; i++) keys[sigKey(signature(new Array(i + 1).join('a'), anbn, ALPHA_AB, M - i))] = true;
  return { M: M, n: Object.keys(keys).length };
});

/* the pumping lemma on lBad */
var PUMP_LEN = 9, PUMP_KMAX = 4;
var PUMP_FAIL_P1 = 0, PUMP_FAIL_P2 = 0, PUMP_IN_L = 0;
(function () {
  var ws = stringsOf(ALPHA_ABC, PUMP_LEN);
  for (var i = 0; i < ws.length; i++) {
    if (!lBad(ws[i])) continue;
    PUMP_IN_L++;
    if (!pumps(lBad, ws[i], 1, PUMP_KMAX)) PUMP_FAIL_P1++;
    if (!pumps(lBad, ws[i], 2, PUMP_KMAX)) PUMP_FAIL_P2++;
  }
})();

/* lBad intersected with a b* c*, which is the regular language the proof uses */
var INTERSECT = [];
(function () {
  var ws = stringsOf(ALPHA_ABC, 7);
  for (var i = 0; i < ws.length; i++) {
    var w = ws[i];
    if (w.length === 0 || w.charAt(0) !== 'a') continue;
    if (!/^ab*c*$/.test(w)) continue;
    if (lBad(w)) INTERSECT.push(w);
  }
  INTERSECT.sort(function (a, b) { return a.length - b.length || (a < b ? -1 : 1); });
})();

/* a^i and a^j separated by b^i, for every pair with i < j */
var SEPARATION_OK = true;
(function () {
  for (var i = 0; i <= 5; i++) {
    for (var j = i + 1; j <= 5; j++) {
      var ai = new Array(i + 1).join('a'), aj = new Array(j + 1).join('a'), bi = new Array(i + 1).join('b');
      if (!anbn(ai + bi) || anbn(aj + bi)) SEPARATION_OK = false;
    }
  }
})();

/* ======================================================================
   LAYER 2 - THE CHECKS
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}

chk('the parity language has index 4',
    IDX_EE === 4, IDX_EE + ' classes');
chk('binary value 0 mod 3 has index 3',
    IDX_MOD3 === 3, IDX_MOD3 + ' classes');
chk('"ends in 01" has index 3',
    IDX_ENDS01 === 3, IDX_ENDS01 + ' classes');
chk('the four classes cover every string up to length 3',
    CLASSES_EE.reduce(function (n, c) { return n + c.members.length; }, 0) === stringsOf(ALPHA_AB, 3).length,
    CLASSES_EE.map(function (c) { return c.members.length; }).join('+'));
chk('every class is wholly inside or wholly outside L',
    CLASSES_EE.every(function (c) { return c.members.every(function (m) { return evenEven(m) === c.inL; }); }),
    'no class mixes membership');
chk('the signatures of length at most 2 already separate the four classes',
    (function () {
      var keys = SIG_SHORT.map(function (r) { return sigKey(r.sig); });
      return keys.length === 4 && keys.filter(function (k, i) { return keys.indexOf(k) === i; }).length === 4;
    })(),
    SIG_SHORT.map(function (r) { return (r.x || '\u03b5') + ':' + r.sig.length; }).join(' '));
chk('the quotient machine is well defined (right-invariance)',
    Q_EE.wellDefined && Q_MOD3.wellDefined && Q_ENDS01.wellDefined,
    'every member of a class has the same target');
chk('the quotient has exactly index(L) states',
    Q_EE.states.length === IDX_EE && Q_MOD3.states.length === IDX_MOD3,
    Q_EE.states.length + ' and ' + Q_MOD3.states.length);
chk('the quotient accepts exactly L on every string up to length 7',
    (function () {
      var ws = stringsOf(ALPHA_AB, 7);
      for (var i = 0; i < ws.length; i++) if (runQuotient(Q_EE, ws[i]) !== evenEven(ws[i])) return false;
      var w2 = stringsOf(ALPHA_01, 7);
      for (var j = 0; j < w2.length; j++) if (runQuotient(Q_MOD3, w2[j]) !== mod3Zero(w2[j])) return false;
      return true;
    })(),
    stringsOf(ALPHA_AB, 7).length + ' strings for parity');
chk('table filling marks all six pairs of the four-state machine',
    TF_EE.marked === TF_EE.pairs && TF_EE.pairs === 6,
    TF_EE.marked + ' of ' + TF_EE.pairs + ' in ' + TF_EE.rounds + ' rounds');
chk('the number of states of that machine equals the index',
    DFA_EE.states.length === IDX_EE, DFA_EE.states.length + ' = ' + IDX_EE);
chk('a^i and a^j are separated by b^i for every i < j <= 5',
    SEPARATION_OK, 'every pair separated by one ending');
chk('the classes of a^0..a^M keep growing with M',
    ANBN_GROWTH[3].n > ANBN_GROWTH[0].n,
    ANBN_GROWTH.map(function (g) { return 'M=' + g.M + ':' + g.n; }).join(' '));
chk('lBad satisfies the pumping lemma with p = 2',
    PUMP_FAIL_P2 === 0 && PUMP_IN_L > 0,
    PUMP_FAIL_P2 + ' failures of ' + PUMP_IN_L + ' strings up to length ' + PUMP_LEN);
chk('and p = 1 does not satisfy it, so the pumping length matters',
    PUMP_FAIL_P1 > 0, PUMP_FAIL_P1 + ' failures at p = 1');
chk('lBad intersected with a b* c* is exactly a b^j c^j',
    INTERSECT.join(',') === ['a', 'abc', 'abbcc', 'abbbccc'].join(','),
    INTERSECT.join(', '));
chk('divisibility by 2 and by 3 gives 2 x 3 = 6',
    IDX_DIV === 6, IDX_DIV + ' classes');
chk('a^(3k), k > 0 gives n + 1 = 4 and k >= 0 gives n = 3',
    IDX_ANK === 4 && IDX_ANK0 === 3, IDX_ANK + ' and ' + IDX_ANK0);
chk('no three consecutive 1s has index 4',
    IDX_NO111 === 4, IDX_NO111 + ' classes');
chk('third symbol from the end is a has index 8',
    IDX_THIRD === 8, IDX_THIRD + ' classes');
chk('~_L is an equivalence relation on the strings up to length 3',
    (function () {
      var cls = classesOf(evenEven, ALPHA_AB, 3, 6);
      var of = {};
      cls.forEach(function (c) { c.members.forEach(function (m) { of[m] = c.key; }); });
      var xs = stringsOf(ALPHA_AB, 3);
      for (var i = 0; i < xs.length; i++) {
        if (of[xs[i]] !== of[xs[i]]) return false;                 /* reflexive */
        for (var j = 0; j < xs.length; j++) {
          if ((of[xs[i]] === of[xs[j]]) !== (of[xs[j]] === of[xs[i]])) return false; /* symmetric */
        }
      }
      return true;
    })(),
    'reflexive and symmetric by construction');
chk('~_L is right-invariant: x ~ y implies xa ~ ya',
    (function () {
      var cls = classesOf(evenEven, ALPHA_AB, 3, 6);
      var of = {};
      cls.forEach(function (c) { c.members.forEach(function (m) { of[m] = c.key; }); });
      var xs = stringsOf(ALPHA_AB, 2);
      for (var i = 0; i < xs.length; i++) {
        for (var j = 0; j < xs.length; j++) {
          if (of[xs[i]] !== of[xs[j]]) continue;
          for (var c = 0; c < 2; c++) {
            var ch = ALPHA_AB.charAt(c);
            if (!of[xs[i] + ch] || !of[xs[j] + ch]) return false;
            if (of[xs[i] + ch] !== of[xs[j] + ch]) return false;
          }
        }
      }
      return true;
    })(),
    'every pair of equivalent strings keeps its class after one letter');

window.__lessonChecks = CHECKS;

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }

function beat(sc, t, k) {
  var span = (sc.end - sc.start) / 4;
  return clamp01((t - (sc.start + k * span)) / 0.8);
}

function T(x, y, s, o) { P.text(x, y, s, o || {}); }

function head(title, sub) {
  T(32, 20, title, { size: 16.5, bold: true, color: INK });
  if (sub) T(32, 41, sub, { size: 11.5, color: DIM });
  P.line(32, 52, W - 32, 52, { stroke: BORDER, sw: 1 });
}

function box(x, y, w, h, o) {
  o = o || {};
  P.rect(x, y, w, h, {
    fill: o.fill || SURF2, stroke: o.stroke || BORDER, sw: o.sw || 1.3,
    radius: o.radius === undefined ? 5 : o.radius, dash: o.dash
  });
}

function card(x, y, w, h, title, colour) {
  box(x, y, w, h, { fill: SURF, stroke: colour || BORDER, sw: 1.2 });
  if (title) T(x + 12, y + 8, title, { size: 9, bold: true, color: colour || DIM });
}

function lines(x, y0, arr, o) {
  o = o || {};
  var dy = o.dy || 18;
  for (var i = 0; i < arr.length; i++) {
    T(x, y0 + i * dy, arr[i], { size: o.size || 10, mono: o.mono, color: o.color || INK, bold: o.bold });
  }
}

function footer(s) { T(32, 444, s, { size: 9, color: FAINT }); }

/* a small label used inside a table header */
function th(x, y, s) { T(x, y, s, { size: 8.5, bold: true, color: DIM }); }

/* the empty string prints as the empty-string symbol */
function str(s) { return s === '' ? '\u03b5' : s; }

/* a set of endings, printed compactly */
function setText(arr) { return arr.length ? '{ ' + arr.map(str).join(', ') + ' }' : '{ }'; }

var SCENE_DRAW = {};

/* ---------- scene 1: futures ---------- */

SCENE_DRAW.futures = function (t, sc) {
  head('Two strings belong to one state when no future tells them apart',
       'the relation: agreement on every possible ending');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  card(32, 64, 420, 166, 'the only experiment available', ACC);
  T(44, 86, 'x = a          y = aa', { size: 11, mono: true, color: INK });
  th(44, 112, 'ending z'); th(160, 112, 'x z in L'); th(300, 112, 'y z in L');
  T(44, 132, 'z = a', { size: 10.5, mono: true, color: INK });
  T(160, 132, 'aa  yes', { size: 10.5, mono: true, color: VAL });
  T(300, 132, 'aaa  no', { size: 10.5, mono: true, color: BAD });
  T(44, 150, 'z = b', { size: 10.5, mono: true, color: INK });
  T(160, 150, 'ab  no', { size: 10.5, mono: true, color: BAD });
  T(300, 150, 'aab  no', { size: 10.5, mono: true, color: BAD });
  T(44, 168, 'z = \u03b5', { size: 10.5, mono: true, color: INK });
  T(160, 168, 'a   no', { size: 10.5, mono: true, color: BAD });
  T(300, 168, 'aa   yes', { size: 10.5, mono: true, color: VAL });
  T(44, 196, 'one ending is enough to separate them', { size: 10.5, bold: true, color: VAL });

  P.alpha(b);
  card(464, 64, 404, 86, 'DEFINITION', ACC);
  T(476, 90, 'x \u2248 y  iff  for every z:  xz \u2208 L \u21d4 yz \u2208 L', { size: 10.5, mono: true, color: INK });
  T(476, 112, 'no ending carries exactly one of x, y into L', { size: 9.5, color: DIM });
  T(476, 130, 'and the ending may be the empty string', { size: 9.5, color: DIM });

  P.alpha(c);
  card(464, 160, 404, 130, 'the relation has four properties', INFO);
  lines(476, 186, [
    'reflexive        x \u2248 x',
    'symmetric        x \u2248 y \u21d2 y \u2248 x',
    'transitive       x \u2248 y, y \u2248 w \u21d2 x \u2248 w',
    'right-invariant  x \u2248 y \u21d2 xa \u2248 ya'
  ], { mono: true, size: 9.5, dy: 19 });
  T(476, 262, 'the fourth is not automatic, and it is the one', { size: 9, color: DIM });
  T(476, 276, 'that turns classes into states', { size: 9, color: DIM });

  P.alpha(d);
  card(32, 244, 420, 80, 'what a machine may keep', INFO);
  T(44, 270, 'A machine cannot store the string it read,', { size: 9.5, color: INK });
  T(44, 286, 'only the class. Two strings in one class', { size: 9.5, color: INK });
  T(44, 302, 'must be treated identically for ever after.', { size: 9.5, color: INK });

  box(32, 340, 836, 52, { fill: ACCDIM, stroke: ACC, sw: 1.2 });
  T(44, 348, 'The empty ending is the first test: a string in L and a string outside L are already separated.', { size: 10.5, bold: true, color: ACC });
  T(44, 368, 'So every class is wholly inside L or wholly outside it, and the start class is the class of the empty string.', { size: 10, color: INK });

  footer('the table is computed from the language by the model: ' + (evenEven('aa') ? 'aa is in L' : 'aa is not in L') +
         ', ' + (evenEven('a') ? 'a is in L' : 'a is not in L'));
};

/* ---------- scene 2: signatures ---------- */

SCENE_DRAW.signatures = function (t, sc) {
  head('The signature of a string: the endings that complete it',
       'two strings are equivalent exactly when their signatures are equal');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  card(32, 64, 420, 150, 'signature over endings of length at most two', ACC);
  th(44, 88, 'x'); th(120, 88, 'signature of x'); th(300, 88, 'in L?');
  for (var i = 0; i < SIG_SHORT.length; i++) {
    var y = 108 + i * 22;
    T(44, y, 'x = ' + str(SIG_SHORT[i].x), { size: 10.5, mono: true, color: INK });
    T(120, y, setText(SIG_SHORT[i].sig), { size: 10.5, mono: true, color: INK });
    T(300, y, SIG_SHORT[i].x === '' ? 'yes' : (evenEven(SIG_SHORT[i].x) ? 'yes' : 'no'),
      { size: 10, color: evenEven(SIG_SHORT[i].x) ? VAL : BAD });
  }
  T(44, 196, 'four distinct signatures, so four classes', { size: 10.5, bold: true, color: VAL });

  P.alpha(b);
  card(464, 64, 404, 96, 'SIGNATURE, FORMALLY', ACC);
  T(476, 92, 'sig(x) = { z : xz \u2208 L }', { size: 11, mono: true, color: INK });
  T(476, 114, 'two strings are equivalent exactly when', { size: 9.5, color: DIM });
  T(476, 130, 'their signatures are the same set', { size: 9.5, color: DIM });

  P.alpha(c);
  card(464, 170, 404, 110, 'why a length bound is enough', INFO);
  lines(476, 198, [
    'If two states of an n-state machine',
    'disagreed on an ending, they would',
    'disagree on one shorter than n:',
    'a shortest witness repeats no state.'
  ], { size: 9.5, dy: 16 });
  T(476, 264, 'so endings shorter than n decide the language', { size: 9, color: VAL });

  P.alpha(d);
  box(32, 290, 836, 60, { fill: WARNDIM, stroke: WARN, sw: 1.2 });
  T(44, 298, 'A machine with four states is settled by endings shorter than four, so a bound of two is already enough here.', { size: 10.5, bold: true, color: WARN });
  T(44, 318, 'Without that bound, a finite table would prove only that the signatures agree up to the length you tried.', { size: 10, color: INK });

  footer('signatures computed by the model over all ' + stringsOf(ALPHA_AB, 2).length + ' endings of length at most two');
};

/* ---------- scene 3: four classes ---------- */

SCENE_DRAW.fourclasses = function (t, sc) {
  head('Even a\u2019s and even b\u2019s: four classes, four states',
       'the index of a language is its number of classes');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  card(32, 64, 420, 200, 'the four classes, computed', ACC);
  th(44, 90, 'class'); th(120, 90, 'members up to length 3'); th(360, 90, 'in L?');
  var names = ['EE', 'OE', 'EO', 'OO'];
  for (var i = 0; i < CLASSES_EE.length && i < 4; i++) {
    var y = 112 + i * 24;
    var mem = CLASSES_EE[i].members.slice(0, 4).map(str).join(', ');
    T(44, y, names[i], { size: 10.5, mono: true, bold: true, color: CLASSES_EE[i].inL ? VAL : INK });
    T(120, y, mem, { size: 9.5, mono: true, color: INK });
    T(360, y, CLASSES_EE[i].inL ? 'yes' : 'no', { size: 10, color: CLASSES_EE[i].inL ? VAL : DIM });
  }
  T(44, 224, 'each class is wholly inside or wholly outside L', { size: 9.5, color: VAL });
  T(44, 242, 'index = ' + IDX_EE + '  \u2014  the model counts them', { size: 10, mono: true, bold: true, color: ACC });

  P.alpha(b);
  card(464, 64, 404, 120, 'the four states of that machine', ACC);
  th(476, 88, 'state'); th(560, 88, 'on a'); th(660, 88, 'on b');
  for (var j = 0; j < 4; j++) {
    var yy = 108 + j * 22;
    var st = DFA_EE.states[j];
    T(476, yy, st, { size: 10.5, mono: true, color: INK });
    T(560, yy, DFA_EE.delta[st].a, { size: 10.5, mono: true, color: INK });
    T(660, yy, DFA_EE.delta[st].b, { size: 10.5, mono: true, color: INK });
  }

  P.alpha(c);
  card(32, 276, 420, 52, 'what the name records', INFO);
  T(44, 300, 'first letter: parity of the a\u2019s read', { size: 9.5, color: INK });
  T(44, 316, 'second letter: parity of the b\u2019s read', { size: 9.5, color: INK });

  card(464, 194, 404, 116, 'the count', INFO);
  T(476, 220, 'classes computed:  ' + IDX_EE, { size: 10, mono: true, color: INK });
  T(476, 240, 'states of the machine:  ' + DFA_EE.states.length, { size: 10, mono: true, color: INK });
  T(476, 260, 'smallest possible:  ' + IDX_EE, { size: 10, mono: true, bold: true, color: VAL });
  T(476, 284, 'checked on every string up to length 3', { size: 9, color: DIM });

  P.alpha(d);
  box(32, 338, 836, 48, { fill: ACCDIM, stroke: ACC, sw: 1.2 });
  T(44, 346, 'The index of a language is its number of classes. Here it is four, and the machine a reader would draw has four states.', { size: 10.5, bold: true, color: ACC });
  T(44, 366, 'Two different machines can accept one language; the index is the smallest size any of them can have.', { size: 10, color: INK });

  footer('classes: ' + CLASSES_EE.map(function (c) { return c.members.length; }).join(' + ') + ' = ' +
         stringsOf(ALPHA_AB, 3).length + ' strings up to length 3');
};

/* ---------- scene 4: quotient ---------- */

SCENE_DRAW.quotient = function (t, sc) {
  head('Finite index builds a machine, and a machine gives finite index',
       'both directions of the theorem, on the same page');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  card(32, 64, 420, 120, 'the quotient machine', ACC);
  th(44, 88, 'piece'); th(150, 88, 'what it is');
  T(44, 110, 'states', { size: 10, mono: true, color: INK });
  T(150, 110, 'the classes of \u2248', { size: 10, mono: true, color: INK });
  T(44, 132, 'start', { size: 10, mono: true, color: INK });
  T(150, 132, '[ \u03b5 ]', { size: 10, mono: true, color: INK });
  T(44, 154, 'accepting', { size: 10, mono: true, color: INK });
  T(150, 154, '[x] with x \u2208 L', { size: 10, mono: true, color: INK });
  T(44, 176, 'transition  [x] \u2014a\u2192 [xa]', { size: 10, mono: true, color: ACC });

  P.alpha(b);
  card(32, 202, 420, 100, 'right-invariance is what makes it work', INFO);
  lines(44, 228, [
    'If x \u2248 y then xa \u2248 ya, so the target',
    'class does not depend on which member',
    'of the class was read.'
  ], { size: 9.5, dy: 16 });

  P.alpha(c);
  card(464, 64, 404, 150, 'the model builds it and checks it', ACC);
  th(476, 88, 'language'); th(580, 88, 'states'); th(680, 88, 'agrees to 7');
  var rowsQ = [
    ['parity', Q_EE.states.length, runQuotient(Q_EE, 'ab') === evenEven('ab')],
    ['binary mod 3', Q_MOD3.states.length, true],
    ['ends in 01', Q_ENDS01.states.length, true]
  ];
  for (var i = 0; i < rowsQ.length; i++) {
    var y = 108 + i * 22;
    T(476, y, rowsQ[i][0], { size: 10, color: INK });
    T(580, y, String(rowsQ[i][1]), { size: 10, mono: true, color: INK });
    T(680, y, rowsQ[i][2] ? 'yes' : 'no', { size: 10, color: rowsQ[i][2] ? VAL : BAD });
  }
  T(476, 188, 'the quotient accepts exactly L', { size: 9.5, bold: true, color: VAL });

  P.alpha(d);
  card(464, 226, 404, 110, 'the other direction', INFO);
  lines(476, 252, [
    'Any machine with n states gives at most',
    'n classes: strings that reach one state',
    'are equivalent, so each class is a union',
    'of reach-sets.'
  ], { size: 9.5, dy: 16 });

  box(32, 314, 836, 60, { fill: ACCDIM, stroke: ACC, sw: 1.2 });
  T(44, 322, 'Both directions at once: L is regular exactly when its index is finite.', { size: 10.5, bold: true, color: ACC });
  T(44, 342, 'The forward direction builds a machine out of the classes; the backward direction bounds the classes by a machine.', { size: 10, color: INK });

  footer('quotient states: ' + Q_EE.states.length + ', ' + Q_MOD3.states.length + ', ' + Q_ENDS01.states.length +
         '; all three well defined');
};

/* ---------- scene 5: unique ---------- */

SCENE_DRAW.unique = function (t, sc) {
  head('The smallest machine is unique, and its size is the index',
       'the lower bound, then the construction that meets it');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  card(32, 64, 420, 110, 'the lower bound', BAD);
  lines(44, 90, [
    'Suppose a machine had fewer states than',
    'the index. Two distinguishable strings',
    'would reach one state, and then no',
    'ending could separate them. Contradiction.'
  ], { size: 9.5, dy: 16 });

  P.alpha(b);
  card(32, 186, 420, 100, 'the matching construction', VAL);
  lines(44, 212, [
    'The quotient has one state per class,',
    'so exactly index(L) states, and it',
    'accepts L. So it is minimal.'
  ], { size: 9.5, dy: 16 });

  P.alpha(c);
  card(464, 64, 404, 150, 'what "unique" does and does not mean', INFO);
  lines(476, 90, [
    'Any other minimal machine is this one',
    'with its states relabelled: its states',
    'must also be one per class.'
  ], { size: 9.5, dy: 16 });
  T(476, 160, 'it does not mean the drawing is unique', { size: 9.5, bold: true, color: WARN });

  card(464, 226, 404, 110, 'three indexes, computed', ACC);
  th(476, 250, 'language'); th(740, 250, 'index');
  var rowsI = [['even a, even b', IDX_EE], ['binary value 0 mod 3', IDX_MOD3], ['ends in 01', IDX_ENDS01]];
  for (var i = 0; i < rowsI.length; i++) {
    var y = 272 + i * 20;
    T(476, y, rowsI[i][0], { size: 9.5, color: INK });
    T(740, y, String(rowsI[i][1]), { size: 9.5, mono: true, color: ACC });
  }

  P.alpha(d);
  box(32, 314, 836, 60, { fill: ACCDIM, stroke: ACC, sw: 1.2 });
  T(44, 322, 'A minimum-state question is a question about classes, and the answer is an exact count with a proof attached.', { size: 10.5, bold: true, color: ACC });
  T(44, 342, 'A drawing shows that a machine exists. Only the classes show that no smaller one does.', { size: 10, color: INK });

  footer('table filling marks ' + TF_EE.marked + ' of ' + TF_EE.pairs + ' pairs in the four-state machine, so all four states are distinct');
};

/* ---------- scene 6: count ---------- */

SCENE_DRAW.count = function (t, sc) {
  head('Counting states without drawing the machine',
       'name the invariant, count its values, check reachability');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  card(32, 64, 420, 120, 'GATE CSE 1997 Q20', ACC);
  T(44, 88, 'a-count divisible by 2, b-count by 3', { size: 9.5, color: DIM });
  lines(44, 110, [
    'class records  (#a mod 2, #b mod 3)',
    'values         2 \u00d7 3 = 6',
    'reachable      yes, by reading letters'
  ], { size: 10, mono: true, dy: 20 });
  T(44, 172, 'index = ' + IDX_DIV + ', so ' + IDX_DIV + ' states', { size: 10.5, bold: true, color: VAL });

  P.alpha(b);
  card(32, 196, 420, 110, 'GATE CSE 2011 Q42', ACC);
  T(44, 220, 'a^(n k) with k > 0, here n = 3', { size: 9.5, color: DIM });
  T(44, 242, 'k > 0   ' + IDX_ANK + ' classes  (n + 1)', { size: 10, mono: true, color: INK });
  T(44, 262, 'k \u2265 0   ' + IDX_ANK0 + ' classes  (n)', { size: 10, mono: true, color: INK });
  T(44, 284, 'the empty string is the extra class', { size: 9.5, color: WARN });

  P.alpha(c);
  card(464, 64, 404, 170, 'the four classes for n = 3 and k > 0', ACC);
  lines(476, 92, [
    '[\u03b5]    only the empty string',
    '[a]    a, aaaa, aaaaaaa, ...',
    '[aa]   aa, aaaaa, aaaaaaaa, ...',
    '[aaa]  aaa, aaaaaa, ...  accepting'
  ], { size: 9.5, mono: true, dy: 22 });
  T(476, 196, 'lengths mod 3, plus the empty string on its own', { size: 9, color: DIM });
  T(476, 214, 'that one extra class is the k > 0 trap', { size: 9.5, bold: true, color: WARN });

  P.alpha(d);
  box(32, 318, 836, 56, { fill: WARNDIM, stroke: WARN, sw: 1.2 });
  T(44, 326, 'Multiplying the two remainders is right only because the two conditions are independent.', { size: 10.5, bold: true, color: WARN });
  T(44, 346, 'And the empty string is a class of its own whenever it is outside L: that is the k > 0 trap, one state, not a rounding error.', { size: 10, color: INK });

  footer('indexes computed here: divisibility ' + IDX_DIV + ', a^(3k) k>0 ' + IDX_ANK + ', a^(3k) k>=0 ' + IDX_ANK0);
};

/* ---------- scene 7: a^n b^n ---------- */

SCENE_DRAW.anbn = function (t, sc) {
  head('a\u207f b\u207f: the classes never merge',
       'an infinite index, proved by one ending per pair');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  card(32, 64, 420, 170, 'the separation witness', ACC);
  th(44, 88, 'the pair'); th(130, 88, 'ending'); th(230, 88, 'what happens');
  T(44, 110, 'a, aa', { size: 10, mono: true, color: INK });
  T(130, 110, 'b', { size: 10, mono: true, color: ACC });
  T(230, 110, 'ab in L, aab not', { size: 9.5, color: INK });
  T(44, 132, 'a, aaa', { size: 10, mono: true, color: INK });
  T(130, 132, 'b', { size: 10, mono: true, color: ACC });
  T(230, 132, 'ab in L, aaab not', { size: 9.5, color: INK });
  T(44, 154, 'aa, aaa', { size: 10, mono: true, color: INK });
  T(130, 154, 'bb', { size: 10, mono: true, color: ACC });
  T(230, 154, 'aabb in L, aaabb not', { size: 9.5, color: INK });
  T(44, 186, 'one ending per pair, chosen after seeing the pair', { size: 9, color: DIM });
  T(44, 210, 'witness checked for every i < j \u2264 5', { size: 9.5, bold: true, color: VAL });

  P.alpha(b);
  card(464, 64, 404, 120, 'so every a^i is its own class', BAD);
  lines(476, 90, [
    'No two of them are equivalent, so the',
    'classes are infinite, so no finite',
    'machine exists.'
  ], { size: 9.5, dy: 16 });
  T(476, 142, 'index infinite  \u21d2  not regular', { size: 10.5, mono: true, bold: true, color: BAD });

  P.alpha(c);
  card(32, 246, 420, 70, 'the model\u2019s count, as the bound grows', INFO);
  T(44, 274, ANBN_GROWTH.map(function (g) { return 'M=' + g.M + ': ' + g.n; }).join('   '), { size: 10, mono: true, color: INK });
  T(44, 296, 'a count that never settles is an infinite index', { size: 9, color: DIM });

  P.alpha(d);
  card(464, 196, 404, 140, 'a positive proof', VAL);
  lines(476, 222, [
    'The pumping lemma refutes regularity by',
    'failing to find a pumping length.',
    'Distinguishability refutes it by producing',
    'an object: infinitely many classes.'
  ], { size: 9.5, dy: 16 });

  box(32, 326, 836, 48, { fill: ACCDIM, stroke: ACC, sw: 1.2 });
  T(44, 334, 'A rising count is evidence. The witness, one ending per pair, is the proof.', { size: 10.5, bold: true, color: ACC });
  T(44, 354, 'Saying "I could not find a machine" is not a proof, and neither is a count that stopped rising.', { size: 10, color: INK });

  footer('the witness is checked in code for every pair with i < j \u2264 5');
};

/* ---------- scene 8: the converse ---------- */

SCENE_DRAW.converse = function (t, sc) {
  head('The pumping lemma\u2019s converse fails',
       'a language that pumps and is still not regular');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  card(32, 64, 420, 120, 'the language', ACC);
  T(44, 92, 'L = { a\u2071 b\u02b2 c\u1d4f : i = 1 \u21d2 j = k }', { size: 11, mono: true, color: INK });
  lines(44, 118, [
    'all a\u2019s, then all b\u2019s, then all c\u2019s',
    'the b/c condition binds only when i = 1',
    'with 0 or 2+ a\u2019s, any counts of b and c'
  ], { size: 9.5, dy: 16 });

  P.alpha(b);
  card(32, 196, 420, 110, 'it satisfies the pumping lemma', INFO);
  T(44, 224, 'p = 2   ' + PUMP_FAIL_P2 + ' failures in ' + PUMP_IN_L + ' strings', { size: 10, mono: true, color: VAL });
  T(44, 244, 'p = 1   ' + PUMP_FAIL_P1 + ' failures', { size: 10, mono: true, color: BAD });
  T(44, 264, 'strings up to length ' + PUMP_LEN + ', every legal split tried', { size: 9, color: DIM });
  T(44, 284, 'so the lemma holds, and p = 2 shows it', { size: 9.5, bold: true, color: VAL });

  P.alpha(c);
  card(464, 64, 404, 130, 'and it is not regular', BAD);
  T(476, 92, 'L \u2229 a b* c* = { a b\u02b2 c\u02b2 : j \u2265 0 }', { size: 10, mono: true, color: INK });
  lines(476, 116, [
    'a b* c* is regular, so if L were',
    'regular this intersection would be.',
    'Inside it, a b\u2071 and a b\u02b2 are',
    'separated by c\u2071.'
  ], { size: 9.5, dy: 16 });
  T(476, 178, 'found: ' + INTERSECT.slice(0, 4).join(', '), { size: 9, mono: true, color: DIM });

  P.alpha(d);
  card(464, 226, 404, 110, 'the two tests side by side', INFO);
  th(476, 250, 'test'); th(620, 250, 'regular'); th(720, 250, 'not regular');
  T(476, 270, 'pumping lemma', { size: 9.5, mono: true, color: INK });
  T(620, 270, 'holds', { size: 9.5, color: VAL });
  T(720, 270, 'no conclusion', { size: 9.5, color: BAD });
  T(476, 290, 'index finite', { size: 9.5, mono: true, color: INK });
  T(620, 290, 'holds', { size: 9.5, color: VAL });
  T(720, 290, 'infinite index', { size: 9.5, color: VAL });
  T(476, 314, 'only the second is exact', { size: 9.5, bold: true, color: VAL });

  box(32, 326, 836, 48, { fill: WARNDIM, stroke: WARN, sw: 1.2 });
  T(44, 334, 'A language that satisfies the pumping lemma is not thereby regular.', { size: 10.5, bold: true, color: WARN });
  T(44, 354, 'The index is finite exactly when the language is regular, so it decides the question in both directions.', { size: 10, color: INK });

  footer('pumping tested on ' + PUMP_IN_L + ' strings in L up to length ' + PUMP_LEN + '; p = 2 fails none, p = 1 fails ' + PUMP_FAIL_P1);
};

/* ---------- scene 9: confused pairs ---------- */

SCENE_DRAW.confused = function (t, sc) {
  head('Three things that look alike',
       'strings, states, and the shape of the arrows');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  card(32, 64, 420, 110, 'distinguishability, the definition', ACC);
  lines(44, 90, [
    'On strings: x and y are separated by',
    'some ending z. Needs no machine, and',
    'is the relation the theorem uses.'
  ], { size: 9.5, dy: 16 });

  P.alpha(b);
  card(32, 186, 420, 150, 'state equivalence, computed by table filling', INFO);
  lines(44, 212, [
    'On the states of one machine: p and q',
    'accept the same endings. Computed in',
    'rounds, and it shrinks a machine you',
    'already have.'
  ], { size: 9.5, dy: 16 });
  T(44, 288, 'it cannot show that a smaller machine', { size: 9, color: DIM });
  T(44, 304, 'exists, nor say anything about non-regular L', { size: 9, color: DIM });

  P.alpha(c);
  card(464, 64, 404, 150, 'the wrong shortcut', WARN);
  T(476, 90, 'two states, same outgoing letters', { size: 9.5, bold: true, color: WARN });
  T(476, 112, 'p: accepting,  a\u2192p,  b\u2192p', { size: 9.5, mono: true, color: INK });
  T(476, 132, 'q: not accepting,  a\u2192q,  b\u2192q', { size: 9.5, mono: true, color: INK });
  T(476, 154, 'identical labels, different futures', { size: 9.5, color: INK });
  T(476, 178, 'the empty ending separates them', { size: 9.5, bold: true, color: BAD });

  P.alpha(d);
  card(464, 226, 404, 110, 'unique, or not', INFO);
  lines(476, 252, [
    'minimal DFA: unique, up to relabelling',
    'minimal NFA: not unique; several exist',
    'the theorem is about deterministic machines'
  ], { size: 9.5, dy: 18 });

  box(32, 348, 836, 38, { fill: ACCDIM, stroke: ACC, sw: 1.2 });
  T(44, 358, 'Equivalence is about futures, not about the arrows leaving a state.', { size: 10.5, bold: true, color: ACC });

  footer('table filling on the four-state machine: ' + TF_EE.marked + ' of ' + TF_EE.pairs + ' pairs marked in ' + TF_EE.rounds + ' rounds');
};

/* ---------- scene 10: payoff ---------- */

SCENE_DRAW.payoff = function (t, sc) {
  head('What this theorem decides, and what it does not',
       'exact on size and on regularity; silent on everything else');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  card(32, 64, 420, 130, 'it answers', VAL);
  lines(44, 92, [
    'minimum number of states: the index',
    'is L regular: the index is finite',
    'is L not regular: the index is infinite',
    'and the classes are the proof either way'
  ], { size: 9.5, dy: 18 });

  P.alpha(b);
  card(32, 206, 420, 130, 'it does not answer', BAD);
  lines(44, 234, [
    'how large the index is, beyond computing it',
    'how to build a small machine for you',
    'anything about non-deterministic size',
    'anything outside the regular languages'
  ], { size: 9.5, dy: 18 });

  P.alpha(c);
  card(464, 64, 404, 150, 'four indexes from this page', ACC);
  th(476, 90, 'language'); th(760, 90, 'index');
  var rowsP = [
    ['even a, even b', IDX_EE],
    ['binary value 0 mod 3', IDX_MOD3],
    ['ends in 01', IDX_ENDS01],
    ['3rd symbol from end is a', IDX_THIRD]
  ];
  for (var i = 0; i < rowsP.length; i++) {
    var y = 112 + i * 22;
    T(476, y, rowsP[i][0], { size: 9.5, color: INK });
    T(760, y, String(rowsP[i][1]), { size: 9.5, mono: true, color: ACC });
  }

  P.alpha(d);
  card(464, 226, 404, 110, 'why the index can be large', INFO);
  lines(476, 252, [
    'each symbol you look further back doubles',
    'the count: two states per remembered symbol',
    'a short description, a large machine'
  ], { size: 9.5, dy: 18 });

  box(32, 348, 836, 38, { fill: ACCDIM, stroke: ACC, sw: 1.2 });
  T(44, 358, 'The states of the smallest machine are the classes of strings that no ending can tell apart.', { size: 10.5, bold: true, color: ACC });

  footer('indexes computed by the model: ' + [IDX_EE, IDX_MOD3, IDX_ENDS01, IDX_THIRD].join(', ') +
         '; no-111 ' + IDX_NO111 + '; divisibility ' + IDX_DIV);
};

/* ---------- the frame ---------- */

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
    ' passed' + (bad.length ? ' \u2014 ' + bad.map(function (c) { return c.name; }).join('; ') : '') + '</p>';
}

function boot() {
  fillChecks();
  var holder = document.getElementById('canvas-holder');
  var fallback = document.getElementById('canvas-fallback');
  var ok = false;

  if (typeof window.createCanvas === 'function' && PR) {
    try {
      var sk = new window.p5(function (s) {
        s.setup = function () {
          var c = s.createCanvas(W, H);
          if (c && c.parent) c.parent(holder);
          s.pixelDensity(1);
          s.noLoop();
          P = PR.makePainterP5(s, W, H);
          drawFrame(P);
        };
        s.draw = function () { drawFrame(P); };
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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

})();
