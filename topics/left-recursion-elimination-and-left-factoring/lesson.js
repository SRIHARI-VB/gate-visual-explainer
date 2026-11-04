/* ==========================================================================
   left-recursion-elimination-and-left-factoring — lesson.js
   Four layers, in order:
     1. THE MODEL      — every grammar, count and verdict the lesson shows.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The model is the classical grammar-transformation pair: the ordered
   algorithm of Aho, Lam, Sethi and Ullman, Compilers: Principles, Techniques
   and Tools, 2nd edition, Algorithm 4.19 (eliminate left recursion, input a
   grammar with no cycles and no epsilon-productions) and the left-factoring
   rewrite of section 4.3.3. Left recursion is detected with the left-corner
   relation, which is what catches indirect and hidden recursion; the LL(1)
   verdict is the two-entry cell of the predictive table, built from FIRST and
   FOLLOW. Language preservation is checked by exhaustive enumeration: every
   string over a stated alphabet up to a stated length is tested for
   membership by dynamic programming, before and after each transformation.
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

/* ==========================================================================
   left-recursion-elimination-and-left-factoring — the model (LAYER 1)
   Every grammar, count and verdict the lesson shows is computed here.
   Nothing is quoted: the two previous-year answers on the page are checked
   against what this code derives, not copied from a solution key.
   ========================================================================== */

/* ---------- grammar as an ordered map: A -> list of right sides ----------
   A right side is an array of symbols. A nonterminal is a single upper-case
   letter, optionally primed: A, A', A'', S, E, T, M, U. A terminal is any
   other single character. The empty array is the empty string. */

function G_(entries) {
  var g = {};
  entries.forEach(function (e) { g[e[0]] = e[1].map(function (r) { return r.slice(); }); });
  return g;
}

function isNT(g, x) { return Object.prototype.hasOwnProperty.call(g, x); }

function cloneG(g) {
  var out = {};
  Object.keys(g).forEach(function (k) {
    out[k] = g[k].map(function (r) { return r.slice(); });
  });
  return out;
}

function fmtRHS(r) { return r.length ? r.join(' ') : '\u03b5'; }

function fmtProd(a, r) { return a + ' \u2192 ' + fmtRHS(r); }

function fmtG(g, start) {
  return Object.keys(g).map(function (k) {
    var tag = (k === start) ? ' ' : '';
    return k + tag + ' \u2192 ' + g[k].map(fmtRHS).join(' | ');
  }).join('\n');
}

function prodCount(g) {
  return Object.keys(g).reduce(function (n, k) { return n + g[k].length; }, 0);
}

/* ---------- nullable, FIRST, FOLLOW ---------- */

function nullableSet(g) {
  var N = {};
  var changed = true;
  while (changed) {
    changed = false;
    Object.keys(g).forEach(function (A) {
      if (N[A]) return;
      for (var p = 0; p < g[A].length; p++) {
        var r = g[A][p], all = true;
        for (var i = 0; i < r.length; i++) {
          if (isNT(g, r[i]) && N[r[i]]) continue;
          all = false; break;
        }
        if (all) { N[A] = true; changed = true; return; }
      }
    });
  }
  return N;
}

function firstSets(g) {
  var N = nullableSet(g);
  var F = {};
  Object.keys(g).forEach(function (A) { F[A] = {}; });
  function addF(A, x) {
    if (F[A][x]) return false;
    F[A][x] = true; return true;
  }
  var changed = true;
  while (changed) {
    changed = false;
    Object.keys(g).forEach(function (A) {
      g[A].forEach(function (r) {
        for (var i = 0; i < r.length; i++) {
          var x = r[i];
          if (!isNT(g, x)) { if (addF(A, x)) changed = true; break; }
          Object.keys(F[x]).forEach(function (t) { if (addF(A, t)) changed = true; });
          if (!N[x]) break;
        }
      });
    });
  }
  return { first: F, nullable: N };
}

function firstOfSeq(g, F, N, seq) {
  var out = {}, nul = true;
  for (var i = 0; i < seq.length; i++) {
    var x = seq[i];
    if (!isNT(g, x)) { out[x] = true; nul = false; break; }
    Object.keys(F[x]).forEach(function (t) { out[t] = true; });
    if (!N[x]) { nul = false; break; }
  }
  return { set: out, nullable: nul };
}

function followSets(g, start) {
  var FF = firstSets(g), F = FF.first, N = FF.nullable;
  var FO = {};
  Object.keys(g).forEach(function (A) { FO[A] = {}; });
  FO[start]['$'] = true;
  var changed = true;
  while (changed) {
    changed = false;
    Object.keys(g).forEach(function (A) {
      g[A].forEach(function (r) {
        for (var i = 0; i < r.length; i++) {
          var x = r[i];
          if (!isNT(g, x)) continue;
          var rest = firstOfSeq(g, F, N, r.slice(i + 1));
          Object.keys(rest.set).forEach(function (t) {
            if (!FO[x][t]) { FO[x][t] = true; changed = true; }
          });
          if (rest.nullable) {
            Object.keys(FO[A]).forEach(function (t) {
              if (!FO[x][t]) { FO[x][t] = true; changed = true; }
            });
          }
        }
      });
    });
  }
  return { follow: FO, first: F, nullable: N };
}

/* ---------- left recursion: immediate, indirect and hidden ---------- */

/* the left-corner relation: A reaches B if A => B gamma for some gamma.
   A nullable prefix lets the reach jump over it, which is how hidden left
   recursion is caught: A -> B A a with B nullable gives A => A a. */
function leftCorners(g) {
  var N = nullableSet(g);
  var lc = {};
  Object.keys(g).forEach(function (A) { lc[A] = {}; });
  Object.keys(g).forEach(function (A) {
    g[A].forEach(function (r) {
      for (var i = 0; i < r.length; i++) {
        var x = r[i];
        if (isNT(g, x)) {
          lc[A][x] = true;
          if (!N[x]) break;
        } else break;
      }
    });
  });
  var changed = true;
  while (changed) {
    changed = false;
    Object.keys(lc).forEach(function (A) {
      Object.keys(lc[A]).forEach(function (B) {
        Object.keys(lc[B] || {}).forEach(function (C) {
          if (!lc[A][C]) { lc[A][C] = true; changed = true; }
        });
      });
    });
  }
  return lc;
}

function leftRecursiveNTs(g) {
  var lc = leftCorners(g);
  return Object.keys(g).filter(function (A) { return !!lc[A][A]; });
}

function immediateLeftRecursive(g) {
  return Object.keys(g).filter(function (A) {
    return g[A].some(function (r) { return r.length && r[0] === A; });
  });
}

/* hidden: A -> X1..Xk with X1 != A, some non-empty nullable prefix, then A */
function hiddenLeftRecursive(g) {
  var N = nullableSet(g);
  return Object.keys(g).filter(function (A) {
    return g[A].some(function (r) {
      if (!r.length || r[0] === A) return false;
      for (var i = 0; i < r.length - 1; i++) {
        if (!isNT(g, r[i]) || !N[r[i]]) return false;
        if (r[i + 1] === A) return true;
      }
      return false;
    });
  });
}

/* ---------- elimination of immediate left recursion ---------- */

function freshName(g, base) {
  var name = base + "'";
  while (isNT(g, name)) name = name + "'";
  return name;
}

function eliminateImmediate(g, A) {
  var recs = [], others = [];
  g[A].forEach(function (r) {
    if (r.length && r[0] === A) recs.push(r.slice(1));
    else others.push(r.slice());
  });
  if (!recs.length) return { g: g, fresh: null, changed: false };
  var g2 = cloneG(g);
  var B = freshName(g2, A);
  /* no base alternative means the nonterminal derived nothing; the rewrite
     keeps that: A gets no production at all. */
  g2[A] = others.map(function (b) { return b.concat([B]); });
  g2[B] = recs.map(function (a) { return a.concat([B]); });
  g2[B].push([]);
  return { g: g2, fresh: B, changed: true, recs: recs, others: others };
}

/* the ordered algorithm: for i, substitute every A_j (j < i) into A_i, then
   remove the immediate recursion in A_i. */
function eliminateAll(g0, order) {
  var g = cloneG(g0);
  var steps = [];
  order.forEach(function (A, i) {
    var substituted = [];
    for (var j = 0; j < i; j++) {
      var B = order[j];
      if (!isNT(g, B)) continue;
      var next = [];
      g[A].forEach(function (r) {
        if (r.length && r[0] === B) {
          substituted.push(fmtProd(A, r) + '  with  ' + B + ' \u2192 ' + g[B].map(fmtRHS).join(' | '));
          g[B].forEach(function (d) { next.push(d.concat(r.slice(1))); });
        } else next.push(r);
      });
      g[A] = next;
    }
    var res = eliminateImmediate(g, A);
    g = res.g;
    steps.push({
      nt: A,
      substituted: substituted,
      fresh: res.fresh,
      recs: (res.recs || []).map(fmtRHS),
      others: (res.others || []).map(fmtRHS)
    });
  });
  return { g: g, steps: steps };
}

/* ---------- left factoring, repeated to a fixed point ---------- */

function commonPrefix(a, b) {
  var n = 0;
  while (n < a.length && n < b.length && a[n] === b[n]) n++;
  return n;
}

function leftFactorOnce(g) {
  var keys = Object.keys(g);
  for (var k = 0; k < keys.length; k++) {
    var A = keys[k];
    var prods = g[A];
    for (var i = 0; i < prods.length; i++) {
      for (var j = i + 1; j < prods.length; j++) {
        var n = commonPrefix(prods[i], prods[j]);
        if (n === 0) continue;
        var prefix = prods[i].slice(0, n);
        var group = [];
        var rest = [];
        prods.forEach(function (r) {
          if (r.length >= n && commonPrefix(r, prefix) === n) group.push(r.slice(n));
          else rest.push(r.slice());
        });
        if (group.length < 2) continue;
        var g2 = cloneG(g);
        var B = freshName(g2, A);
        g2[A] = rest.concat([prefix.concat([B])]);
        g2[B] = group;
        return { g: g2, changed: true, nt: A, prefix: prefix, fresh: B, group: group, rest: rest };
      }
    }
  }
  return { g: g, changed: false };
}

function leftFactorAll(g0) {
  var g = cloneG(g0), steps = [];
  for (var guard = 0; guard < 20; guard++) {
    var res = leftFactorOnce(g);
    if (!res.changed) break;
    g = res.g;
    steps.push(res);
  }
  return { g: g, steps: steps };
}

/* ---------- membership by bounded dynamic programming ---------- */

function derives(g, start, s) {
  var n = s.length;
  var N = nullableSet(g);
  var T = {};
  function key(i, j) { return i + ':' + j; }
  function add(i, j, A) {
    var k = key(i, j);
    if (!T[k]) T[k] = {};
    if (T[k][A]) return false;
    T[k][A] = true; return true;
  }
  for (var i = 0; i <= n; i++) {
    Object.keys(N).forEach(function (A) { if (N[A]) add(i, i, A); });
  }
  var changed = true, guard = 0;
  while (changed && guard++ < 200) {
    changed = false;
    Object.keys(g).forEach(function (A) {
      g[A].forEach(function (r) {
        for (var i = 0; i <= n; i++) {
          (function match(pos, symIdx) {
            if (symIdx === r.length) { if (add(i, pos, A)) changed = true; return; }
            var x = r[symIdx];
            if (!isNT(g, x)) {
              if (pos < n && s[pos] === x) match(pos + 1, symIdx + 1);
              return;
            }
            for (var j = pos; j <= n; j++) {
              var k = key(pos, j);
              if (T[k] && T[k][x]) match(j, symIdx + 1);
            }
          })(i, 0);
        }
      });
    });
  }
  var kk = key(0, n);
  return !!(T[kk] && T[kk][start]);
}

function allStrings(alpha, maxLen) {
  var out = [''];
  var layer = [''];
  for (var len = 1; len <= maxLen; len++) {
    var next = [];
    layer.forEach(function (w) { alpha.forEach(function (c) { next.push(w + c); }); });
    out = out.concat(next);
    layer = next;
  }
  return out;
}

function languageOf(g, start, alpha, maxLen) {
  return allStrings(alpha, maxLen).filter(function (w) { return derives(g, start, w); });
}

/* ---------- the LL(1) table ---------- */

function ll1Table(g, start) {
  var FF = followSets(g, start);
  var F = FF.first, FO = FF.follow, N = FF.nullable;
  var cells = {};
  Object.keys(g).forEach(function (A) {
    g[A].forEach(function (r) {
      var fs = firstOfSeq(g, F, N, r);
      var targets = Object.keys(fs.set);
      if (fs.nullable) targets = targets.concat(Object.keys(FO[A]));
      targets.forEach(function (t) {
        var k = A + ',' + t;
        if (!cells[k]) cells[k] = [];
        var p = fmtProd(A, r);
        if (cells[k].indexOf(p) < 0) cells[k].push(p);
      });
    });
  });
  var conflicts = Object.keys(cells).filter(function (k) { return cells[k].length > 1; });
  return {
    cells: cells,
    conflicts: conflicts.map(function (k) {
      return { nt: k.split(',')[0], terminal: k.split(',')[1], prods: cells[k] };
    }),
    first: F, follow: FO, nullable: N
  };
}

/* ---------- the six grammars the lesson teaches with ---------- */

var G_PLUS = G_([            /* left-recursive addition */
  ['E', [['E', '+', 'T'], ['T']]],
  ['T', [['a']]]
]);
var G_PLUS_FIXED = eliminateImmediate(G_PLUS, 'E').g;

var G_MINUS = G_([           /* subtraction, for the associativity trap */
  ['E', [['E', '-', 'T'], ['T']]],
  ['T', [['a']]]
]);
var G_MINUS_FIXED = eliminateImmediate(G_MINUS, 'E').g;

var G_SA = G_([              /* GATE CSE 1998 Q6b */
  ['S', [['A', 'a'], ['b']]],
  ['A', [['A', 'c'], ['S', 'd'], []]]
]);

var G_FACTOR = G_([          /* left factoring, two passes */
  ['A', [['a', 'b', 'c'], ['a', 'b', 'd'], ['a', 'e']]]
]);

var G_ELSE = G_([            /* dangling else */
  ['S', [['i', 'E', 't', 'S'], ['i', 'E', 't', 'S', 'e', 'S'], ['a']]],
  ['E', [['b']]]
]);

var G_HIDDEN = G_([          /* hidden left recursion */
  ['A', [['B', 'A', 'a'], ['c']]],
  ['B', [[], ['b']]]
]);

var G_AMBIG = G_([           /* GATE CSE 2003 Q16: no left recursion, no
                                common prefix, still not LL(1) */
  ['S', [['A'], ['B']]],
  ['A', [['a']]],
  ['B', [['a']]]
]);

var G_LL1_OK = G_([          /* a grammar that is LL(1), for contrast */
  ['S', [['a', 'A'], ['b', 'B']]],
  ['A', [['c']]],
  ['B', [['d']]]
]);

/* ==========================================================================
   the computations the page reports
   ========================================================================== */

var SA_ORDER = ['S', 'A'];
var SA_RUN = eliminateAll(G_SA, SA_ORDER);
var SA_FIXED = SA_RUN.g;

/* the answer the 1998 key prints, written out, so the page can compare */
var SA_KEY = G_([
  ['S', [['A', 'a'], ['b']]],
  ['A', [['b', 'd', "A'"], ["A'"]]],
  ["A'", [['c', "A'"], ['a', 'd', "A'"], []]]
]);

var FACTOR_RUN = leftFactorAll(G_FACTOR);
var FACTOR_FIXED = FACTOR_RUN.g;

var ELSE_FACTOR_RUN = leftFactorAll(G_ELSE);
var ELSE_FIXED = ELSE_FACTOR_RUN.g;

var HIDDEN_FIXED = eliminateImmediate(G_HIDDEN, 'A').g;

/* what does fix the hidden case: substitute B's right sides into A first,
   which turns the hidden recursion into an immediate one. */
var HIDDEN_SUBST = cloneG(G_HIDDEN);
(function () {
  var out = [];
  HIDDEN_SUBST.A.forEach(function (r) {
    if (r.length && r[0] === 'B') {
      HIDDEN_SUBST.B.forEach(function (d) { out.push(d.concat(r.slice(1))); });
    } else out.push(r);
  });
  HIDDEN_SUBST.A = out;
})();
var HIDDEN_SUBST_FIXED = eliminateImmediate(HIDDEN_SUBST, 'A').g;

/* --- language checks, by exhaustive enumeration up to a stated length --- */
var LEN_PLUS = 7, ALPHA_PLUS = ['a', '+'];
var L_PLUS = languageOf(G_PLUS, 'E', ALPHA_PLUS, LEN_PLUS);
var L_PLUS_FIX = languageOf(G_PLUS_FIXED, 'E', ALPHA_PLUS, LEN_PLUS);

var LEN_SA = 5, ALPHA_SA = ['a', 'b', 'c', 'd'];
var L_SA = languageOf(G_SA, 'S', ALPHA_SA, LEN_SA);
var L_SA_FIX = languageOf(SA_FIXED, 'S', ALPHA_SA, LEN_SA);
var L_SA_KEY = languageOf(SA_KEY, 'S', ALPHA_SA, LEN_SA);

var LEN_FACTOR = 3, ALPHA_FACTOR = ['a', 'b', 'c', 'd', 'e'];
var L_FACTOR = languageOf(G_FACTOR, 'A', ALPHA_FACTOR, LEN_FACTOR);
var L_FACTOR_FIX = languageOf(FACTOR_FIXED, 'A', ALPHA_FACTOR, LEN_FACTOR);

/* --- the epsilon that is not optional: A' without its empty production --- */
var G_PLUS_NO_EPS = cloneG(G_PLUS_FIXED);
G_PLUS_NO_EPS["E'"] = G_PLUS_NO_EPS["E'"].filter(function (r) { return r.length > 0; });
var L_PLUS_NO_EPS = languageOf(G_PLUS_NO_EPS, 'E', ALPHA_PLUS, LEN_PLUS);
var EPS_LOST = L_PLUS_FIX.filter(function (w) { return L_PLUS_NO_EPS.indexOf(w) < 0; });

/* --- associativity: the two trees of a - b - c --- */
function evalLeft(a, b, c) { return (a - b) - c; }
function evalRight(a, b, c) { return a - (b - c); }
var AS_VALS = { a: 10, b: 3, c: 2 };
var AS_LEFT = evalLeft(AS_VALS.a, AS_VALS.b, AS_VALS.c);
var AS_RIGHT = evalRight(AS_VALS.a, AS_VALS.b, AS_VALS.c);

/* --- LL(1) verdicts --- */
var T_PLUS_FIXED = ll1Table(G_PLUS_FIXED, 'E');
var T_ELSE_FIXED = ll1Table(ELSE_FIXED, 'S');
var T_ELSE_RAW = ll1Table(G_ELSE, 'S');
var T_AMBIG = ll1Table(G_AMBIG, 'S');
var T_OK = ll1Table(G_LL1_OK, 'S');
var T_SA = ll1Table(G_SA, 'S');
var T_SA_FIXED = ll1Table(SA_FIXED, 'S');
var T_FACTOR_RAW = ll1Table(G_FACTOR, 'A');
var T_FACTOR_FIXED = ll1Table(FACTOR_FIXED, 'A');

/* --- left recursion verdicts --- */
var LR_PLUS = leftRecursiveNTs(G_PLUS);
var LR_SA = leftRecursiveNTs(G_SA);
var LR_SA_FIXED = leftRecursiveNTs(SA_FIXED);
var LR_HIDDEN = leftRecursiveNTs(G_HIDDEN);
var LR_HIDDEN_IMMEDIATE = immediateLeftRecursive(G_HIDDEN);
var HIDDEN_NTS = hiddenLeftRecursive(G_HIDDEN);
var LR_ELSE_RAW = leftRecursiveNTs(G_ELSE);
var LR_FACTOR_RAW = leftRecursiveNTs(G_FACTOR);

/* ==========================================================================
   the checks
   ========================================================================== */

var CHECKS = [];
function chk(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}

chk('the direct rule preserves the language',
    L_PLUS.join('|') === L_PLUS_FIX.join('|'),
    L_PLUS.length + ' strings up to length ' + LEN_PLUS);
chk('the direct rule removes the left recursion',
    LR_PLUS.indexOf('E') >= 0 && LR_SA_FIXED.length === 0,
    'E was recursive; after the rewrite no nonterminal is');
chk('the direct rule adds exactly one production',
    prodCount(G_PLUS_FIXED) === prodCount(G_PLUS) + 1,
    prodCount(G_PLUS) + ' \u2192 ' + prodCount(G_PLUS_FIXED));
chk('dropping the empty production empties the language',
    EPS_LOST.length === L_PLUS.length && L_PLUS.length > 0,
    L_PLUS.length + ' of ' + L_PLUS.length + ' strings lost');
chk('left and right trees give different values',
    AS_LEFT !== AS_RIGHT,
    AS_LEFT + ' against ' + AS_RIGHT);
chk('the ordered algorithm reproduces the 1998 answer',
    fmtG(SA_FIXED, 'S') === fmtG(SA_KEY, 'S'),
    prodCount(SA_FIXED) + ' productions');
chk('the 1998 rewrite preserves the language',
    L_SA.join('|') === L_SA_FIX.join('|') && L_SA.join('|') === L_SA_KEY.join('|'),
    L_SA.length + ' strings up to length ' + LEN_SA);
chk('the 1998 rewrite removes every left recursion',
    LR_SA.length === 2 && LR_SA_FIXED.length === 0,
    'S and A were both recursive');
chk('the one-step test misses the hidden recursion',
    LR_HIDDEN.indexOf('A') >= 0 && LR_HIDDEN_IMMEDIATE.indexOf('A') < 0,
    'immediate test finds ' + LR_HIDDEN_IMMEDIATE.length);
chk('the left-corner closure catches the hidden case',
    HIDDEN_NTS.indexOf('A') >= 0,
    'A -> B A a with B nullable');
chk('substituting the nullable nonterminal exposes the hidden recursion',
    immediateLeftRecursive(HIDDEN_SUBST).indexOf('A') >= 0 &&
    leftRecursiveNTs(HIDDEN_SUBST_FIXED).length === 0,
    'A -> A a | b A a | c, then the direct rule applies');
chk('left factoring preserves the language',
    L_FACTOR.join('|') === L_FACTOR_FIX.join('|'),
    L_FACTOR.length + ' strings up to length ' + LEN_FACTOR);
chk('left factoring needs two passes here',
    FACTOR_RUN.steps.length === 2 && prodCount(FACTOR_FIXED) === 5,
    prodCount(G_FACTOR) + ' \u2192 ' + prodCount(FACTOR_FIXED));
chk('the unfactored grammar is not LL(1)',
    T_FACTOR_RAW.conflicts.length > 0,
    T_FACTOR_RAW.conflicts.length + ' conflict cell(s)');
chk('the factored grammar is LL(1)',
    T_FACTOR_FIXED.conflicts.length === 0,
    'no conflict in the table');
chk('the dangling else stays outside LL(1) after factoring',
    T_ELSE_RAW.conflicts.length > 0 && T_ELSE_FIXED.conflicts.length > 0,
    T_ELSE_FIXED.conflicts.length + ' conflict cell(s) after factoring');
chk('the 2003 witness has neither defect and is still not LL(1)',
    LR_AMBIG_OK() && T_AMBIG.conflicts.length > 0,
    T_AMBIG.conflicts.length + ' conflict cell(s)');
function LR_AMBIG_OK() {
  return leftRecursiveNTs(G_AMBIG).length === 0 && leftFactorOnce(G_AMBIG).changed === false;
}
chk('the contrast grammar is LL(1)',
    T_OK.conflicts.length === 0 && prodCount(G_LL1_OK) === 4,
    'four productions, no conflict');
chk('the rewritten addition grammar is LL(1)',
    T_PLUS_FIXED.conflicts.length === 0,
    'the rewrite is what makes it LL(1)');

/* ---------- what the page exports for the checker ---------- */
window.__MODEL = {
  CHECKS: CHECKS,
  PLUS: { before: G_PLUS, after: G_PLUS_FIXED, lang: L_PLUS, langFix: L_PLUS_FIX,
          len: LEN_PLUS, alpha: ALPHA_PLUS, lost: EPS_LOST, noEps: G_PLUS_NO_EPS },
  MINUS: { left: AS_LEFT, right: AS_RIGHT, vals: AS_VALS },
  SA: { before: G_SA, after: SA_FIXED, key: SA_KEY, steps: SA_RUN.steps,
        lang: L_SA, langFix: L_SA_FIX, len: LEN_SA, alpha: ALPHA_SA,
        lrBefore: LR_SA, lrAfter: LR_SA_FIXED },
  HIDDEN: { g: G_HIDDEN, fixed: HIDDEN_FIXED, lr: LR_HIDDEN,
            immediate: LR_HIDDEN_IMMEDIATE, hiddenNts: HIDDEN_NTS,
            subst: HIDDEN_SUBST, substFixed: HIDDEN_SUBST_FIXED },
  FACTOR: { before: G_FACTOR, after: FACTOR_FIXED, steps: FACTOR_RUN.steps,
            lang: L_FACTOR, langFix: L_FACTOR_FIX, len: LEN_FACTOR },
  ELSE: { before: G_ELSE, after: ELSE_FIXED, tBefore: T_ELSE_RAW, tAfter: T_ELSE_FIXED },
  AMBIG: { g: G_AMBIG, table: T_AMBIG },
  OK: { g: G_LL1_OK, table: T_OK },
  TABLES: { plus: T_PLUS_FIXED, sa: T_SA, saFixed: T_SA_FIXED,
            factorRaw: T_FACTOR_RAW, factorFixed: T_FACTOR_FIXED },
  HELPERS: { fmtG: fmtG, prodCount: prodCount, fmtRHS: fmtRHS, derives: derives,
             languageOf: languageOf, ll1Table: ll1Table, leftRecursiveNTs: leftRecursiveNTs,
             leftFactorAll: leftFactorAll, eliminateAll: eliminateAll,
             eliminateImmediate: eliminateImmediate, G_: G_ }
};
window.__lessonChecks = CHECKS;


/* ======================================================================
   LAYER 2 - RENDER HELPERS
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
function footer(s) { T(32, 444, s, { size: 9, color: FAINT }); }

/* a grammar rule with an optional highlighted prefix chip */
function ruleRow(x, y, lhs, prefix, tail, colour, dim) {
  var w = 240;
  box(x, y, w, 24, { fill: dim || SURF, stroke: colour || BORDER, sw: 1.1, radius: 4 });
  T(x + 8, y + 6, lhs, { size: 10.5, mono: true, color: INK });
  var cx = x + 8 + lhs.length * 6.4;
  if (prefix) {
    box(cx, y + 4, prefix.length * 6.4 + 8, 16, { fill: ACCDIM, stroke: ACC, sw: 1, radius: 3 });
    T(cx + 4, y + 6, prefix, { size: 10.5, mono: true, bold: true, color: ACC });
    T(cx + prefix.length * 6.4 + 14, y + 6, tail, { size: 10.5, mono: true, color: INK });
  } else {
    T(cx, y + 6, tail, { size: 10.5, mono: true, color: INK });
  }
  return w;
}

/* a small labelled box that holds one string of grammar symbols */
function symBox(x, y, text, colour, fill, wid) {
  var w = wid || Math.max(54, text.length * 6.6 + 18);
  box(x, y, w, 24, { fill: fill || SURF, stroke: colour || BORDER, sw: 1.2, radius: 4 });
  T(x + w / 2, y + 6, text, { size: 10.5, mono: true, align: 'center', color: INK });
  return w;
}

function tag(x, y, text, colour, fill) {
  var w = String(text).length * 5.6 + 14;
  box(x, y, w, 16, { fill: fill || SURF2, stroke: colour, sw: 1, radius: 3 });
  T(x + 7, y + 3, text, { size: 9, mono: true, color: colour });
  return w;
}

var SCENE_DRAW = {};

/* ---------- scene 1: the two failures ---------- */

SCENE_DRAW.loops = function (t, sc) {
  head('Two ways a top-down parser fails before it starts',
       'a loop on the left, and a shared prefix');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  /* left: the loop */
  P.alpha(a);
  T(32, 64, 'expanding E from  E \u2192 E + T | T', { size: 10.5, bold: true, color: DIM });
  var forms = ['E', 'E + T', 'E + T + T', 'E + T + T + T'];
  forms.forEach(function (f, i) {
    var y = 82 + i * 33;
    symBox(32, y, f, i === 0 ? BORDER : BAD, i === 0 ? SURF : BADDIM, 168);
    if (i < 3) P.arrow(116, y + 24, 116, y + 33, { stroke: DIM, sw: 1, head: 5 });
  });
  T(32, 216, '\u2026 the form grows, the input pointer does not move', { size: 9.5, color: BAD });

  P.alpha(b);
  box(32, 238, 168, 30, { fill: BADDIM, stroke: BAD, sw: 1.3 });
  T(42, 246, 'tokens consumed: 0', { size: 10.5, mono: true, bold: true, color: BAD });

  /* right: the shared prefix */
  P.alpha(c);
  T(228, 64, 'the second failure: a shared prefix', { size: 10.5, bold: true, color: DIM });
  ruleRow(228, 82, 'S \u2192 ', 'if', 'E then S', BORDER);
  ruleRow(228, 112, 'S \u2192 ', 'if', 'E then S else S', BORDER);
  T(228, 142, 'both right sides begin with the same terminal', { size: 9.5, color: DIM });

  box(228, 162, 300, 62, { fill: WARNDIM, stroke: WARN, sw: 1.3 });
  T(238, 169, 'M[S, if]', { size: 10.5, mono: true, bold: true, color: WARN });
  T(238, 186, 'S \u2192 if E then S', { size: 10, mono: true, color: INK });
  T(238, 202, 'S \u2192 if E then S else S', { size: 10, mono: true, color: INK });
  T(452, 169, 'two', { size: 9.5, color: WARN, align: 'right' });
  T(452, 181, 'entries', { size: 9.5, color: WARN, align: 'right' });

  /* the two cures */
  P.alpha(d);
  box(548, 82, 320, 100, { fill: SURF, stroke: BORDER, sw: 1.2 });
  T(558, 90, 'the two transformations', { size: 10.5, bold: true, color: ACC });
  T(558, 108, '1  eliminate left recursion', { size: 10.5, color: INK });
  T(566, 124, 'removes the loop', { size: 9.5, color: DIM });
  T(558, 144, '2  left factoring', { size: 10.5, color: INK });
  T(566, 160, 'removes the shared prefix', { size: 9.5, color: DIM });

  P.alpha(d);
  box(32, 282, 836, 44, { fill: ACCDIM, stroke: ACC, sw: 1.2 });
  T(44, 290, 'Neither transformation is part of the LL(1) construction. Both run first, and the table is built from what they produce.', { size: 10.5, color: INK });
  T(44, 308, 'So "the LL(1) table of this grammar" always means the table of the grammar as written, not of a tidied version.', { size: 10, color: ACC });

  T(32, 344, 'the loop is in the parser, not in the language: E \u2192 E + T | T describes the same finite strings after the rewrite', { size: 9.5, color: DIM });

  footer('model: left-corner closure reports ' + (LR_PLUS.length ? LR_PLUS.join(', ') : 'none') +
         ' left recursive in the addition grammar, and ' + T_ELSE_RAW.conflicts.length + ' conflict cell in the raw else grammar');
};

/* ---------- scene 2: the direct rewrite ---------- */

SCENE_DRAW.direct = function (t, sc) {
  head('The direct rewrite: repeat on the right instead of the left',
       'A \u2192 A\u03b1 | \u03b2 becomes A \u2192 \u03b2A\u2032 with A\u2032 \u2192 \u03b1A\u2032 | \u03b5');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  box(32, 64, 400, 78, { fill: SURF, stroke: BORDER, sw: 1.2 });
  T(44, 71, 'before', { size: 9.5, bold: true, color: DIM });
  T(44, 90, 'A \u2192 A \u03b1  |  \u03b2', { size: 13, mono: true, color: BAD });
  T(44, 112, '\u03b2, then any number of \u03b1 \u2014 written with the loop on the left', { size: 9.5, color: DIM });

  box(452, 64, 416, 78, { fill: SURF, stroke: BORDER, sw: 1.2 });
  T(464, 71, 'after', { size: 9.5, bold: true, color: DIM });
  T(464, 90, 'A \u2192 \u03b2 A\u2032        A\u2032 \u2192 \u03b1 A\u2032 | \u03b5', { size: 12.5, mono: true, color: VAL });
  T(464, 112, 'the same words, with the repetition moved to the right', { size: 9.5, color: DIM });

  P.alpha(b);
  T(32, 158, 'the derivation, read left to right', { size: 10, bold: true, color: DIM });
  var chain = ['E', 'T E\u2032', 'T + T E\u2032', 'T + T + T E\u2032', 'T + T + T'];
  var x = 32;
  chain.forEach(function (s, i) {
    var w = symBox(x, 174, s, i === 0 ? BORDER : (i === chain.length - 1 ? VAL : ACC), SURF, Math.max(56, s.length * 6.8 + 16));
    x += w;
    if (i < chain.length - 1) {
      P.arrow(x + 4, 186, x + 22, 186, { stroke: DIM, sw: 1, head: 5 });
      x += 30;
    }
  });
  T(32, 206, 'A \u2192 \u03b2A\u2032 writes \u03b2 once; A\u2032 repeats \u03b1, and only \u03b5 can stop it', { size: 9.5, color: DIM });

  P.alpha(c);
  box(32, 226, 836, 84, { fill: SURF, stroke: BORDER, sw: 1.2 });
  T(44, 233, 'the instance this lesson uses', { size: 9.5, bold: true, color: DIM });
  T(44, 252, 'E \u2192 E + T | T', { size: 12, mono: true, color: BAD });
  P.arrow(200, 258, 236, 258, { stroke: DIM, sw: 1.2, head: 6 });
  T(250, 252, 'E \u2192 T E\u2032        E\u2032 \u2192 + T E\u2032 | \u03b5', { size: 12, mono: true, color: VAL });
  T(44, 276, '\u03b1 is + T, \u03b2 is T. Three productions become four, because one helper was created.', { size: 9.5, color: DIM });
  T(44, 294, 'The language is unchanged: ' + L_PLUS.length + ' strings up to length ' + LEN_PLUS + ', counted both ways.', { size: 9.5, color: ACC });

  P.alpha(d);
  box(32, 322, 836, 46, { fill: ACCDIM, stroke: ACC, sw: 1.2 });
  T(44, 330, 'Every expansion now puts a terminal on top of the stack first: T produces a, a matches the lookahead and is popped.', { size: 10.5, color: INK });
  T(44, 348, 'Progress is forced, so the loop is gone. That is the whole mechanism.', { size: 10, bold: true, color: ACC });

  T(32, 384, 'the rewrite removes one obstacle only: the table is still to be built, and it may still conflict', { size: 9.5, color: WARN });

  footer('model: left recursion in E before = ' + (LR_PLUS.indexOf('E') >= 0) + ', after = ' + (LR_SA_FIXED.length === 0 ? 'none anywhere' : 'somewhere'));
};

/* ---------- scene 3: the count ---------- */

SCENE_DRAW.count = function (t, sc) {
  head('Counting the rules: n + m + 1',
       'predict the size of the rewritten grammar before writing it');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  box(32, 64, 420, 60, { fill: ACCDIM, stroke: ACC, sw: 1.3 });
  T(44, 72, 'm recursive and n base alternatives', { size: 9.5, bold: true, color: ACC });
  T(44, 92, 'n + m + 1   productions', { size: 15, mono: true, bold: true, color: INK });
  T(44, 112, 'one per base, one per recursive alternative, one for \u03b5', { size: 9.5, color: DIM });

  P.alpha(b);
  /* the table */
  var X = 470, Y = 64;
  T(X, Y, 'the count, applied', { size: 10, bold: true, color: DIM });
  var cols = [X, X + 150, X + 210, X + 290];
  var heads = ['rewritten', 'm', 'n', 'n + m + 1'];
  heads.forEach(function (h, i) { T(cols[i] + 8, Y + 20, h, { size: 9.5, mono: true, bold: true, color: DIM }); });
  var rows = [['E', '1', '1', '3'], ['S', '2', '2', '5']];
  rows.forEach(function (r, ri) {
    var y = Y + 38 + ri * 26;
    box(X, y, 398, 24, { fill: ri ? SURF : SURF2, stroke: BORDER, sw: 1 });
    r.forEach(function (v, i) {
      T(cols[i] + 8, y + 6, v, { size: 10, mono: i > 0, color: i === 3 ? ACC : INK, bold: i === 3 });
    });
  });

  P.alpha(c);
  box(32, 138, 420, 78, { fill: SURF, stroke: BORDER, sw: 1.2 });
  T(44, 145, 'worked: the addition grammar', { size: 9.5, bold: true, color: DIM });
  T(44, 164, 'E \u2192 E + T | T           3 productions with T \u2192 a', { size: 10.5, mono: true, color: INK });
  T(44, 184, 'E \u2192 T E\u2032, E\u2032 \u2192 + T E\u2032 | \u03b5  4 productions', { size: 10.5, mono: true, color: VAL });
  T(44, 204, '1 + 1 + 1 = 3 rules for E, and T keeps its one \u2014 the S row counts S \u2192 Sa | Sb | c | d', { size: 9, color: DIM });

  P.alpha(c);
  box(470, 138, 398, 78, { fill: SURF, stroke: BORDER, sw: 1.2 });
  T(482, 145, 'four alternatives become five', { size: 9.5, bold: true, color: DIM });
  T(482, 164, 'S \u2192 Sa | Sb | c | d', { size: 10.5, mono: true, color: INK });
  T(482, 184, 'S \u2192 cS\u2032 | dS\u2032     S\u2032 \u2192 aS\u2032 | bS\u2032 | \u03b5', { size: 10.5, mono: true, color: VAL });
  T(482, 204, 'two for S, three for S\u2032', { size: 9.5, color: DIM });

  P.alpha(d);
  box(32, 232, 836, 46, { fill: ACCDIM, stroke: ACC, sw: 1.2 });
  T(44, 240, 'A question that asks for the number of rules is answered by the count, before the grammar is written out.', { size: 10.5, color: INK });
  T(44, 258, 'The count is also the fastest check on a hand-written answer: a mismatch means a production was dropped or duplicated.', { size: 10, color: ACC });

  T(32, 294, 'only the nonterminals that were rewritten change size \u2014 S \u2192 Aa | b is untouched by the rewrite of A', { size: 9.5, color: WARN });
  T(32, 316, 'and the helper itself has m + 1 rules: one per \u03b1, plus the \u03b5', { size: 9.5, color: DIM });

  footer('model: ' + prodCount(G_PLUS) + ' \u2192 ' + prodCount(G_PLUS_FIXED) + ' for the addition grammar, ' + prodCount(G_SA) + ' \u2192 ' + prodCount(SA_FIXED) + ' for the 1998 grammar');
};

/* ---------- scene 4: the epsilon ---------- */

SCENE_DRAW.epsilon = function (t, sc) {
  head('The epsilon is the base case, not decoration',
       'delete E\u2032 \u2192 \u03b5 and the language empties out');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  box(32, 64, 400, 74, { fill: SURF, stroke: BORDER, sw: 1.2 });
  T(44, 71, 'with the empty production', { size: 9.5, bold: true, color: VAL });
  T(44, 90, 'E \u2192 T E\u2032      E\u2032 \u2192 + T E\u2032 | \u03b5', { size: 11.5, mono: true, color: INK });
  T(44, 112, 'a derivation may stop by taking \u03b5', { size: 9.5, color: DIM });

  box(452, 64, 416, 74, { fill: SURF, stroke: BAD, sw: 1.2 });
  T(464, 71, 'with the empty production deleted', { size: 9.5, bold: true, color: BAD });
  T(464, 90, 'E \u2192 T E\u2032      E\u2032 \u2192 + T E\u2032', { size: 11.5, mono: true, color: INK });
  T(464, 112, 'every rewriting of E\u2032 leaves another E\u2032 behind', { size: 9.5, color: DIM });

  P.alpha(b);
  T(32, 158, 'the derivation has no ending', { size: 10, bold: true, color: DIM });
  var forms = ['E', 'T E\u2032', 'T + T E\u2032', 'T + T + T E\u2032', '\u2026 E\u2032 forever'];
  var x = 32;
  forms.forEach(function (s, i) {
    var w = symBox(x, 174, s, i === forms.length - 1 ? BAD : BORDER, i === forms.length - 1 ? BADDIM : SURF, Math.max(56, s.length * 6.6 + 16));
    x += w;
    if (i < forms.length - 1) { P.arrow(x + 4, 186, x + 20, 186, { stroke: DIM, sw: 1, head: 5 }); x += 28; }
  });
  T(32, 206, 'a derivation is finite, so it must reach a form with no nonterminal \u2014 and only \u03b5 removes E\u2032', { size: 9.5, color: DIM });

  P.alpha(c);
  box(32, 226, 400, 96, { fill: SURF, stroke: VAL, sw: 1.2 });
  T(44, 233, 'the model, with \u03b5: ' + L_PLUS.length + ' strings up to length ' + LEN_PLUS, { size: 9.5, bold: true, color: VAL });
  L_PLUS.forEach(function (w, i) {
    T(44, 252 + i * 16, w, { size: 10.5, mono: true, color: INK });
  });

  box(452, 226, 416, 96, { fill: SURF, stroke: BAD, sw: 1.2 });
  T(464, 233, 'the model, without \u03b5: ' + L_PLUS_NO_EPS.length + ' strings', { size: 9.5, bold: true, color: BAD });
  T(464, 258, 'nothing at all', { size: 13, mono: true, bold: true, color: BAD });
  T(464, 284, 'all ' + L_PLUS.length + ' strings are lost, a included', { size: 9.5, color: DIM });
  T(464, 302, 'so the \u03b5 is not a tidy-up target', { size: 9.5, color: DIM });

  P.alpha(d);
  box(32, 338, 836, 42, { fill: WARNDIM, stroke: WARN, sw: 1.2 });
  T(44, 346, '\u03b5 is the base case of a repetition. A rewritten grammar usually has more \u03b5-productions than the original: that is expected, not a mistake.', { size: 10.5, color: INK });
  T(44, 364, 'Keep the \u03b5, and keep the helper reachable from the nonterminal it was created for.', { size: 10, bold: true, color: WARN });

  footer('model: ' + L_PLUS.length + ' strings with \u03b5, ' + L_PLUS_NO_EPS.length + ' without, by enumeration over {' +
         ALPHA_PLUS.join(', ') + '} up to length ' + LEN_PLUS);
};

/* ---------- scene 5: the tree ---------- */

SCENE_DRAW.tree = function (t, sc) {
  head('Same language, different tree: a \u2212 b \u2212 c',
       'the rewrite preserves the strings and changes the shape');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  function node(x, y, s, colour, fill) {
    box(x - 22, y, 44, 22, { fill: fill || SURF, stroke: colour || BORDER, sw: 1.2, radius: 4 });
    T(x, y + 5, s, { size: 11, mono: true, align: 'center', color: INK });
  }

  /* left tree */
  P.alpha(a);
  T(32, 64, 'E \u2192 E \u2212 T | T', { size: 10.5, mono: true, bold: true, color: BAD });
  T(32, 80, 'left recursion, left association', { size: 9.5, color: DIM });
  node(120, 96, '\u2212', BAD);
  node(66, 150, '\u2212', BORDER); node(174, 150, 'c', BORDER);
  node(40, 204, 'a', BORDER); node(92, 204, 'b', BORDER);
  P.line(120, 118, 66, 150, { stroke: DIM, sw: 1 }); P.line(120, 118, 174, 150, { stroke: DIM, sw: 1 });
  P.line(66, 172, 40, 204, { stroke: DIM, sw: 1 }); P.line(66, 172, 92, 204, { stroke: DIM, sw: 1 });
  T(120, 132, 'first', { size: 8.5, color: FAINT, align: 'center' });
  box(28, 238, 186, 30, { fill: BADDIM, stroke: BAD, sw: 1.2 });
  T(38, 246, '(10 \u2212 3) \u2212 2  =  ' + AS_LEFT, { size: 11.5, mono: true, bold: true, color: BAD });

  /* right tree */
  P.alpha(b);
  T(360, 64, 'E \u2192 T E\u2032,  E\u2032 \u2192 \u2212 T E\u2032 | \u03b5', { size: 10.5, mono: true, bold: true, color: VAL });
  T(360, 80, 'no left recursion, right association', { size: 9.5, color: DIM });
  node(480, 96, '\u2212', VAL);
  node(426, 150, 'a', BORDER); node(534, 150, '\u2212', BORDER);
  node(508, 204, 'b', BORDER); node(560, 204, 'c', BORDER);
  P.line(480, 118, 426, 150, { stroke: DIM, sw: 1 }); P.line(480, 118, 534, 150, { stroke: DIM, sw: 1 });
  P.line(534, 172, 508, 204, { stroke: DIM, sw: 1 }); P.line(534, 172, 560, 204, { stroke: DIM, sw: 1 });
  box(388, 238, 186, 30, { fill: SURF, stroke: VAL, sw: 1.2 });
  T(398, 246, '10 \u2212 (3 \u2212 2)  =  ' + AS_RIGHT, { size: 11.5, mono: true, bold: true, color: VAL });

  P.alpha(c);
  box(32, 284, 836, 46, { fill: SURF2, stroke: BORDER, sw: 1.2 });
  T(44, 292, 'The two grammars generate the same strings. Neither says which tree to use, and the trees give ' + AS_LEFT + ' and ' + AS_RIGHT + '.', { size: 10.5, color: INK });
  T(44, 310, 'For + and \u00d7 the two trees agree, which is why the trap survives practice. It bites on \u2212 and \u00f7.', { size: 10, color: DIM });

  P.alpha(d);
  box(32, 342, 836, 38, { fill: ACCDIM, stroke: ACC, sw: 1.2 });
  T(44, 350, 'In a syntax-directed question the tree is what is being marked, so "the language is unchanged, so the value is unchanged" is wrong.', { size: 10.5, bold: true, color: ACC });

  footer('model: ' + AS_LEFT + ' against ' + AS_RIGHT + ' with a = ' + AS_VALS.a + ', b = ' + AS_VALS.b + ', c = ' + AS_VALS.c);
};

/* ---------- scene 6: indirect recursion ---------- */

SCENE_DRAW.indirect = function (t, sc) {
  head('Indirect recursion hides one step further away',
       'no single rule shows it, so the test cannot be a scan of first symbols');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  T(32, 64, 'the grammar', { size: 10, bold: true, color: DIM });
  ruleRow(32, 80, 'S \u2192 ', null, 'A a  |  b', BORDER);
  ruleRow(32, 110, 'A \u2192 ', null, 'A c  |  S d  |  \u03b5', BORDER);
  T(32, 142, 'first symbols: S sees A, b \u2014 A sees A, S, and nothing', { size: 9.5, color: DIM });
  T(32, 158, 'so a scan for "a rule beginning with its own left side" reports A only', { size: 9.5, color: WARN });

  P.alpha(b);
  T(320, 64, 'the derivation that shows it', { size: 10, bold: true, color: DIM });
  var chain = ['S', 'A a', 'S d a', 'A a d a', 'S d a d a'];
  var x = 320;
  chain.forEach(function (s, i) {
    var w = symBox(x, 80, s, i % 2 === 0 ? BAD : BORDER, i % 2 === 0 ? BADDIM : SURF, Math.max(52, s.length * 6.6 + 16));
    x += w;
    if (i < chain.length - 1) { P.arrow(x + 3, 92, x + 17, 92, { stroke: DIM, sw: 1, head: 5 }); x += 24; }
  });
  T(320, 112, 'S \u21d2 A a \u21d2 S d a : S reaches itself, one step longer than the scan looks', { size: 9.5, color: BAD });

  P.alpha(c);
  /* the left-corner graph */
  T(32, 190, 'the left-corner relation, closed', { size: 10, bold: true, color: DIM });
  P.circle(110, 246, 24, { fill: SURF, stroke: ACC, sw: 1.5 });
  T(110, 240, 'S', { size: 13, mono: true, bold: true, align: 'center', color: ACC });
  P.circle(250, 246, 24, { fill: SURF, stroke: ACC, sw: 1.5 });
  T(250, 240, 'A', { size: 13, mono: true, bold: true, align: 'center', color: ACC });
  P.arrow(136, 238, 222, 238, { stroke: BAD, sw: 1.4, head: 7 });
  P.arrow(222, 256, 136, 256, { stroke: BAD, sw: 1.4, head: 7 });
  T(179, 222, 'S \u21d2 A \u2026', { size: 9, color: BAD, align: 'center' });
  T(179, 264, 'A \u21d2 S \u2026', { size: 9, color: BAD, align: 'center' });
  T(32, 290, 'S reaches A, A reaches S, so S reaches S: left recursive', { size: 9.5, color: INK });

  P.alpha(d);
  box(330, 190, 538, 92, { fill: SURF, stroke: BORDER, sw: 1.2 });
  T(342, 197, 'the verdicts, computed', { size: 9.5, bold: true, color: DIM });
  T(342, 216, 'left recursive nonterminals:  ' + LR_SA.join(', '), { size: 10.5, mono: true, color: BAD });
  T(342, 236, 'immediate only (a first-symbol scan):  A', { size: 10.5, mono: true, color: WARN });
  T(342, 258, 'S is recursive through A, so rewriting A alone leaves the loop', { size: 9.5, color: INK });

  box(32, 302, 836, 40, { fill: ACCDIM, stroke: ACC, sw: 1.2 });
  T(44, 310, 'Detection is a reachability computation on the left-corner relation, not a scan of first symbols.', { size: 10.5, color: INK });
  T(44, 328, 'That is why the elimination runs in an order: substitute the earlier nonterminals first, then remove what is immediate.', { size: 10, color: ACC });

  footer('model: left recursion detected in ' + LR_SA.join(' and ') + '; the one-step scan finds only immediate cases');
};

/* ---------- scene 7: the 1998 question ---------- */

SCENE_DRAW.ordered = function (t, sc) {
  head('GATE CSE 1998 Q6b: substitute first, then eliminate',
       'an equivalent grammar, no left recursion, the fewest rules');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  box(32, 62, 400, 66, { fill: SURF2, stroke: BORDER, sw: 1.2 });
  T(44, 69, 'the paper', { size: 9.5, bold: true, color: DIM });
  T(44, 88, 'S \u2192 A a  |  b', { size: 11, mono: true, color: INK });
  T(44, 108, 'A \u2192 A c  |  S d  |  \u03b5', { size: 11, mono: true, color: INK });

  P.alpha(b);
  box(32, 138, 400, 74, { fill: SURF, stroke: ACC, sw: 1.2 });
  T(44, 145, 'step 1  order the nonterminals: S, then A', { size: 9.5, bold: true, color: ACC });
  T(44, 164, 'step 2  substitute S\u2019s right sides into A', { size: 9.5, bold: true, color: ACC });
  T(44, 184, 'A \u2192 A c | A a d | b d | \u03b5', { size: 11, mono: true, color: INK });
  T(44, 202, 'only A \u2192 S d began with S', { size: 9, color: DIM });

  P.alpha(c);
  box(32, 222, 400, 60, { fill: SURF, stroke: ACC, sw: 1.2 });
  T(44, 229, 'step 3  now it is immediate: m = 2, n = 2', { size: 9.5, bold: true, color: ACC });
  T(44, 248, '\u03b1 = c, a d        \u03b2 = b d, \u03b5', { size: 10.5, mono: true, color: INK });
  T(44, 268, 'an empty \u03b2 is still a base alternative: it becomes A \u2192 A\u2032', { size: 9, color: WARN });

  P.alpha(d);
  box(452, 62, 416, 220, { fill: SURF, stroke: VAL, sw: 1.4 });
  T(464, 69, 'step 4  the answer', { size: 9.5, bold: true, color: VAL });
  T(464, 90, 'S  \u2192 A a | b', { size: 12, mono: true, color: INK });
  T(464, 114, 'A  \u2192 b d A\u2032 | A\u2032', { size: 12, mono: true, color: INK });
  T(464, 138, 'A\u2032 \u2192 c A\u2032 | a d A\u2032 | \u03b5', { size: 12, mono: true, color: INK });
  P.line(464, 158, 856, 158, { stroke: BORDER, sw: 1 });
  T(464, 166, prodCount(SA_FIXED) + ' productions, from ' + prodCount(G_SA), { size: 10.5, mono: true, bold: true, color: VAL });
  T(464, 186, 'compared rule for rule with the published answer', { size: 9.5, color: DIM });
  T(464, 202, 'match: ' + (fmtG(SA_FIXED, 'S') === fmtG(SA_KEY, 'S')), { size: 9.5, mono: true, color: DIM });
  T(464, 222, 'language: ' + L_SA.length + ' strings up to length ' + LEN_SA, { size: 9.5, color: DIM });
  T(464, 240, 'the same ' + L_SA.length + ' before, after, and in the key', { size: 9.5, color: DIM });
  T(464, 262, 'left recursion left: ' + (LR_SA_FIXED.length === 0 ? 'none' : LR_SA_FIXED.join(', ')), { size: 9.5, mono: true, bold: true, color: VAL });

  box(32, 296, 836, 42, { fill: ACCDIM, stroke: ACC, sw: 1.2 });
  T(44, 304, 'The word that does the work is "equivalent". Dropping A \u2192 \u03b5 removes the recursion and changes the language.', { size: 10.5, color: INK });
  T(44, 322, 'Seven is the minimum: two rules of S are untouched, A needs 2 + 2 + 1 = 5, and no rule can be merged.', { size: 10, color: ACC });

  footer('this question is GATE CSE 1998 Q6b; the answer above is derived by the model and then compared with the published one');
};

/* ---------- scene 8: hidden recursion ---------- */

SCENE_DRAW.hidden = function (t, sc) {
  head('The recursion a one-step test misses',
       'A \u2192 B A a with B nullable');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  T(32, 64, 'the grammar', { size: 10, bold: true, color: DIM });
  ruleRow(32, 80, 'A \u2192 ', null, 'B A a  |  c', BORDER);
  ruleRow(32, 110, 'B \u2192 ', null, '\u03b5  |  b', BORDER);

  P.alpha(b);
  T(320, 64, 'but B can vanish', { size: 10, bold: true, color: DIM });
  var chain = ['A', 'B A a', 'A a', 'B A a a', 'A a a'];
  var x = 320;
  chain.forEach(function (s, i) {
    var w = symBox(x, 80, s, i % 2 === 1 ? BORDER : BAD, i % 2 === 1 ? SURF : BADDIM, Math.max(50, s.length * 6.6 + 16));
    x += w;
    if (i < chain.length - 1) { P.arrow(x + 3, 92, x + 17, 92, { stroke: DIM, sw: 1, head: 5 }); x += 24; }
  });
  T(320, 112, 'A \u21d2 B A a \u21d2 A a : the recursion hides behind a nullable symbol', { size: 9.5, color: BAD });
  T(32, 126, 'no right side of A begins with A, so a one-step scan reports nothing', { size: 9.5, color: WARN });

  P.alpha(c);
  box(32, 136, 400, 96, { fill: SURF, stroke: BORDER, sw: 1.2 });
  T(44, 143, 'what the direct rule does here: nothing', { size: 9.5, bold: true, color: DIM });
  T(44, 164, 'A \u2192 B A a | c', { size: 11, mono: true, color: INK });
  T(44, 186, 'immediate test: ' + (LR_HIDDEN_IMMEDIATE.length ? LR_HIDDEN_IMMEDIATE.join(', ') : 'finds no nonterminal'), { size: 9.5, mono: true, color: BAD });
  T(44, 206, 'left-corner closure: ' + (LR_HIDDEN.length ? LR_HIDDEN.join(', ') : 'none') + ' is left recursive', { size: 9.5, mono: true, color: WARN });
  T(44, 222, 'the closure jumps over the nullable B, the scan does not', { size: 9, color: DIM });

  P.alpha(d);
  box(452, 136, 416, 96, { fill: SURF, stroke: VAL, sw: 1.2 });
  T(464, 143, 'substitute B first, then the direct rule applies', { size: 9.5, bold: true, color: VAL });
  T(464, 162, 'A \u2192 A a | b A a | c', { size: 11, mono: true, color: INK });
  T(464, 178, 'now immediate, so the direct rule applies', { size: 9, color: DIM });
  T(464, 198, 'A \u2192 b A a A\u2032 | c A\u2032', { size: 11, mono: true, color: VAL });
  T(464, 218, 'A\u2032 \u2192 a A\u2032 | \u03b5', { size: 11, mono: true, color: VAL });

  box(32, 244, 836, 44, { fill: SURF2, stroke: BORDER, sw: 1.2 });
  T(44, 252, 'The order is the lesson: expose the recursion by substituting the nullable nonterminal, then remove what is immediate.', { size: 10.5, color: INK });
  T(44, 270, 'A left-corner closure that jumps over nullable prefixes is what tells you the grammar is still left recursive.', { size: 10, color: DIM });

  box(32, 300, 836, 38, { fill: WARNDIM, stroke: WARN, sw: 1.2 });
  T(44, 308, 'Running the direct rule first does nothing here, and the rewritten grammar still loops in a predictive parser.', { size: 10.5, bold: true, color: WARN });

  footer('model: immediate scan finds ' + LR_HIDDEN_IMMEDIATE.length + ', closure finds ' + LR_HIDDEN.length +
         '; after substituting B the closure is empty: ' + (leftRecursiveNTs(HIDDEN_SUBST_FIXED).length === 0));
};

/* ---------- scene 9: left factoring ---------- */

SCENE_DRAW.factor = function (t, sc) {
  head('Left factoring: one prefix, one helper, two passes',
       'A \u2192 a b c | a b d | a e');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  T(32, 64, 'three alternatives, one first character', { size: 10, bold: true, color: DIM });
  ruleRow(32, 80, 'A \u2192 ', 'a', 'b c', BORDER);
  ruleRow(32, 110, 'A \u2192 ', 'a', 'b d', BORDER);
  ruleRow(32, 140, 'A \u2192 ', 'a', 'e', BORDER);
  T(32, 172, 'FIRST of each right side is {a}, so M[A, a] holds three productions', { size: 9.5, color: WARN });

  P.alpha(b);
  box(300, 64, 268, 108, { fill: SURF, stroke: ACC, sw: 1.2 });
  T(312, 71, 'pass 1  factor the longest common prefix', { size: 9.5, bold: true, color: ACC });
  T(312, 92, 'A \u2192 a b A\u2032', { size: 11, mono: true, color: INK });
  T(312, 112, 'A \u2192 a e', { size: 11, mono: true, color: INK });
  T(312, 134, 'A\u2032 \u2192 c | d', { size: 11, mono: true, color: INK });
  T(312, 156, 'a b is shared; a e is not', { size: 9, color: DIM });

  P.alpha(c);
  box(300, 182, 268, 90, { fill: SURF, stroke: ACC, sw: 1.2 });
  T(312, 189, 'pass 2  A still shares a', { size: 9.5, bold: true, color: ACC });
  T(312, 210, 'A \u2192 a A\u2033', { size: 11, mono: true, color: INK });
  T(312, 230, 'A\u2033 \u2192 e | b A\u2032', { size: 11, mono: true, color: INK });
  T(312, 250, 'A\u2032 \u2192 c | d', { size: 11, mono: true, color: INK });
  T(312, 264, 'the primes record the pass order', { size: 8.5, color: DIM });

  P.alpha(d);
  box(600, 64, 268, 208, { fill: SURF, stroke: VAL, sw: 1.3 });
  T(612, 71, 'the model\u2019s verdicts', { size: 9.5, bold: true, color: VAL });
  T(612, 92, 'passes needed: ' + FACTOR_RUN.steps.length, { size: 10, mono: true, color: INK });
  T(612, 112, 'productions: ' + prodCount(G_FACTOR) + ' \u2192 ' + prodCount(FACTOR_FIXED), { size: 10, mono: true, color: INK });
  T(612, 132, 'strings before: ' + L_FACTOR.length, { size: 10, mono: true, color: INK });
  T(612, 152, 'strings after:  ' + L_FACTOR_FIX.length, { size: 10, mono: true, color: INK });
  T(612, 172, 'language equal: ' + (L_FACTOR.join('|') === L_FACTOR_FIX.join('|')), { size: 10, mono: true, color: INK });
  T(612, 194, 'conflicts before: ' + T_FACTOR_RAW.conflicts.length, { size: 10, mono: true, color: BAD });
  T(612, 214, 'conflicts after:  ' + T_FACTOR_FIXED.conflicts.length, { size: 10, mono: true, color: VAL });
  T(612, 236, 'the factored grammar is LL(1)', { size: 9.5, bold: true, color: VAL });
  T(612, 254, 'renamed for reading: A \u2192 a X,', { size: 8.5, color: DIM });
  T(612, 266, 'X \u2192 e | b Y,  Y \u2192 c | d', { size: 8.5, mono: true, color: DIM });

  box(32, 286, 836, 44, { fill: SURF2, stroke: BORDER, sw: 1.2 });
  T(44, 294, 'The language is unchanged: ' + L_FACTOR.join(', ') + ' before and after, grouped differently.', { size: 10.5, color: INK });
  T(44, 312, 'Factoring moves a prefix out of the alternatives and leaves the rest as alternatives of a helper.', { size: 10, color: DIM });

  box(32, 342, 836, 38, { fill: WARNDIM, stroke: WARN, sw: 1.2 });
  T(44, 350, 'Stopping after one pass is the usual half-finished answer. The test is "no two alternatives share a prefix", not "I factored once".', { size: 10.5, bold: true, color: WARN });

  footer('model: ' + FACTOR_RUN.steps.length + ' passes, ' + prodCount(G_FACTOR) + ' \u2192 ' + prodCount(FACTOR_FIXED) +
         ' productions, ' + T_FACTOR_RAW.conflicts.length + ' conflict cell before and ' + T_FACTOR_FIXED.conflicts.length + ' after');
};

/* ---------- scene 10: the limits ---------- */

SCENE_DRAW.limits = function (t, sc) {
  head('What the two transformations buy, and what they do not',
       'necessary conditions, and neither one is sufficient');

  var a = beat(sc, t, 0), b = beat(sc, t, 1), c = beat(sc, t, 2), d = beat(sc, t, 3);

  P.alpha(a);
  T(32, 64, 'the dangling else, factored', { size: 10, bold: true, color: DIM });
  T(32, 82, 'S \u2192 i E t S S\u2032  |  a', { size: 11, mono: true, color: INK });
  T(32, 102, 'S\u2032 \u2192 e S  |  \u03b5', { size: 11, mono: true, color: INK });
  T(32, 124, 'no shared prefix left, no left recursion', { size: 9.5, color: VAL });

  P.alpha(b);
  box(32, 142, 400, 74, { fill: WARNDIM, stroke: WARN, sw: 1.3 });
  T(44, 149, 'and the table still conflicts', { size: 9.5, bold: true, color: WARN });
  T(44, 168, 'M[S\u2032, e]', { size: 11, mono: true, bold: true, color: WARN });
  T(44, 188, 'S\u2032 \u2192 e S        and        S\u2032 \u2192 \u03b5', { size: 10.5, mono: true, color: INK });
  T(44, 206, 'FIRST(e S) = {e} and e is in FOLLOW(S\u2032)', { size: 9, color: DIM });

  P.alpha(c);
  box(452, 64, 416, 100, { fill: SURF2, stroke: BORDER, sw: 1.2 });
  T(464, 71, 'GATE CSE 2003 Q16', { size: 9.5, bold: true, color: DIM });
  T(464, 90, 'Which suffices to convert an arbitrary CFG', { size: 10, color: INK });
  T(464, 106, 'to an LL(1) grammar?', { size: 10, color: INK });
  T(464, 126, 'removing left recursion alone / factoring alone /', { size: 9.5, color: DIM });
  T(464, 140, 'both / none of the above', { size: 9.5, color: DIM });
  T(464, 156, 'answer: none of the above', { size: 10.5, bold: true, color: BAD });

  P.alpha(d);
  box(452, 176, 416, 100, { fill: SURF, stroke: BAD, sw: 1.3 });
  T(464, 183, 'the witness for that answer', { size: 9.5, bold: true, color: BAD });
  T(464, 202, 'S \u2192 A | B      A \u2192 a      B \u2192 a', { size: 11, mono: true, color: INK });
  T(464, 222, 'no left recursion, no shared prefix', { size: 9.5, color: VAL });
  T(464, 240, 'M[S, a] holds S \u2192 A and S \u2192 B', { size: 10, mono: true, color: BAD });
  T(464, 260, 'conflict cells: ' + T_AMBIG.conflicts.length + ', so not LL(1)', { size: 9.5, color: BAD });

  box(32, 236, 400, 62, { fill: SURF, stroke: VAL, sw: 1.2 });
  T(44, 243, 'for contrast: a grammar that is LL(1)', { size: 9.5, bold: true, color: VAL });
  T(44, 262, 'S \u2192 a A | b B    A \u2192 c    B \u2192 d', { size: 10, mono: true, color: INK });
  T(44, 282, 'conflict cells: ' + T_OK.conflicts.length + '  \u2014  the table decides', { size: 9.5, color: VAL });

  box(32, 306, 836, 44, { fill: ACCDIM, stroke: ACC, sw: 1.2 });
  T(44, 314, 'Both transformations are necessary conditions for LL(1). Neither is sufficient, and together they are still not sufficient.', { size: 10.5, bold: true, color: ACC });
  T(44, 332, 'So the procedure ends with the table: build M, count the cells with two entries, and report what it says.', { size: 10, color: INK });

  footer('GATE CSE 2003 Q16 is the paper question; both conflict counts are computed from the grammars on this page');
};

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

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
