/* ==========================================================================
   chomsky-normal-form-and-grammar-simplification — lesson.js
   Four layers, in order:
     1. THE MODEL      — context-free grammars, the four simplification passes,
                         the Chomsky conversion, general membership by span
                         dynamic programming, and the counts the normal form
                         makes available. Every figure is computed, none quoted.
     2. THE CHECKS     — every number the captions state is recomputed here and
                         compared with the figure the caption states.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The claim under test is one sentence: converting a context-free grammar to
   Chomsky normal form preserves its language (minus the empty string) and buys
   a fixed derivation length, exactly 2n minus 1 steps for a string of n
   letters. Everything else on this page is that sentence applied.
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
   A grammar is {V, T, S, P}: V the nonterminals, T the terminals, S the start
   symbol, P a map from a nonterminal to a list of right-hand sides, each
   right-hand side a list of symbols. The empty right-hand side is [].
   ====================================================================== */

  function clone(g) {
    var P2 = {}, k;
    for (k in g.P) if (Object.prototype.hasOwnProperty.call(g.P, k)) {
      P2[k] = g.P[k].map(function (r) { return r.slice(); });
    }
    return { V: g.V.slice(), T: g.T.slice(), S: g.S, P: P2 };
  }
  function isNT(g, x) { return g.V.indexOf(x) >= 0; }
  function sameRule(a, b) {
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }
  function addRule(g, A, r) {
    if (!g.P[A]) g.P[A] = [];
    for (var i = 0; i < g.P[A].length; i++) if (sameRule(g.P[A][i], r)) return false;
    g.P[A].push(r.slice());
    return true;
  }
  function ruleCount(g) {
    var n = 0, k;
    for (k in g.P) if (Object.prototype.hasOwnProperty.call(g.P, k)) n += g.P[k].length;
    return n;
  }
  function ruleText(r) { return r.length ? r.join(' ') : '\u03b5'; }
  function grammarText(g) {
    return g.V.filter(function (A) { return g.P[A] && g.P[A].length; })
      .map(function (A) {
        return A + ' \u2192 ' + g.P[A].map(ruleText).join(' | ');
      });
  }

  /* ---- pass 1: useless symbols ---- */
  function productiveSet(g) {
    var prod = {}, changed = true;
    while (changed) {
      changed = false;
      for (var A in g.P) {
        if (!Object.prototype.hasOwnProperty.call(g.P, A) || prod[A]) continue;
        var rules = g.P[A];
        for (var i = 0; i < rules.length; i++) {
          var ok = true;
          for (var j = 0; j < rules[i].length; j++) {
            var x = rules[i][j];
            if (isNT(g, x) && !prod[x]) { ok = false; break; }
          }
          if (ok) { prod[A] = true; changed = true; break; }
        }
      }
    }
    return prod;
  }
  function reachableSet(g) {
    var seen = {}, stack = [g.S];
    seen[g.S] = true;
    while (stack.length) {
      var A = stack.pop(), rules = g.P[A] || [];
      for (var i = 0; i < rules.length; i++) {
        for (var j = 0; j < rules[i].length; j++) {
          var x = rules[i][j];
          if (isNT(g, x) && !seen[x]) { seen[x] = true; stack.push(x); }
        }
      }
    }
    return seen;
  }
  function removeUseless(g) {
    var prod = productiveSet(g), reach = reachableSet(g);
    var out = { V: [], T: g.T.slice(), S: g.S, P: {} };
    g.V.forEach(function (A) {
      if (!prod[A] || !reach[A]) return;
      var rules = g.P[A] || [], keep = [];
      rules.forEach(function (r) {
        var ok = true;
        r.forEach(function (x) { if (isNT(g, x) && (!prod[x] || !reach[x])) ok = false; });
        if (ok) keep.push(r);
      });
      if (keep.length) { out.V.push(A); out.P[A] = keep; }
    });
    return out;
  }

  /* ---- pass 2: the empty production ---- */
  function nullableSet(g) {
    var nul = {}, changed = true;
    while (changed) {
      changed = false;
      for (var A in g.P) {
        if (!Object.prototype.hasOwnProperty.call(g.P, A) || nul[A]) continue;
        var rules = g.P[A];
        for (var i = 0; i < rules.length; i++) {
          var ok = true;
          for (var j = 0; j < rules[i].length; j++) {
            var x = rules[i][j];
            if (!isNT(g, x) || !nul[x]) { ok = false; break; }
          }
          if (ok) { nul[A] = true; changed = true; break; }
        }
      }
    }
    return nul;
  }
  function removeEps(g, freshName) {
    var nul = nullableSet(g);
    var epsInLang = !!nul[g.S];
    var out = { V: g.V.slice(), T: g.T.slice(), S: g.S, P: {} };
    for (var A in g.P) {
      if (!Object.prototype.hasOwnProperty.call(g.P, A)) continue;
      var rules = g.P[A];
      for (var i = 0; i < rules.length; i++) {
        var r = rules[i];
        var idx = [];
        for (var j = 0; j < r.length; j++) if (isNT(g, r[j]) && nul[r[j]]) idx.push(j);
        var total = 1 << idx.length;
        for (var mask = 0; mask < total; mask++) {
          var keep = [], drop = {};
          for (var b = 0; b < idx.length; b++) if (mask & (1 << b)) drop[idx[b]] = true;
          for (var q = 0; q < r.length; q++) if (!drop[q]) keep.push(r[q]);
          if (!keep.length) continue;
          addRule(out, A, keep);
        }
      }
    }
    if (epsInLang) {
      var S0 = freshName || 'S0', nm = S0, c = 0;
      while (out.V.indexOf(nm) >= 0) { c++; nm = S0 + c; }
      out.V.unshift(nm);
      out.P[nm] = [[out.S], []];
      out.S = nm;
    }
    return { g: out, nullable: nul, epsInLang: epsInLang };
  }

  /* ---- pass 3: unit productions ---- */
  function unitPairs(g) {
    var pairs = {}, key = function (a, b) { return a + '\u0001' + b; }, list = [];
    g.V.forEach(function (A) { pairs[key(A, A)] = true; list.push([A, A]); });
    var changed = true;
    while (changed) {
      changed = false;
      for (var A in g.P) {
        if (!Object.prototype.hasOwnProperty.call(g.P, A)) continue;
        g.P[A].forEach(function (r) {
          if (r.length !== 1 || !isNT(g, r[0])) return;
          var B = r[0];
          list.forEach(function (pr) {
            if (pr[0] !== B) return;
            if (!pairs[key(A, pr[1])]) {
              pairs[key(A, pr[1])] = true;
              list.push([A, pr[1]]);
              changed = true;
            }
          });
        });
      }
    }
    return list;
  }
  function removeUnits(g) {
    var pairs = unitPairs(g);
    var out = { V: g.V.slice(), T: g.T.slice(), S: g.S, P: {} };
    g.V.forEach(function (A) {
      pairs.forEach(function (pr) {
        if (pr[0] !== A) return;
        (g.P[pr[1]] || []).forEach(function (r) {
          if (r.length === 1 && isNT(g, r[0])) return;
          addRule(out, A, r);
        });
      });
    });
    return { g: out, pairs: pairs };
  }

  /* ---- pass 4: Chomsky normal form ---- */
  function toCNF(g, prefix) {
    prefix = prefix || 'X';
    var V = g.V.slice(), out = { V: V, T: g.T.slice(), S: g.S, P: {} };
    var counter = 0, termNT = {}, memo = {};
    function fresh() {
      while (true) {
        counter++;
        var nm = prefix + counter;
        if (V.indexOf(nm) < 0) { V.push(nm); return nm; }
      }
    }
    var work = {};
    for (var A in g.P) {
      if (!Object.prototype.hasOwnProperty.call(g.P, A)) continue;
      work[A] = g.P[A].map(function (r) { return r.slice(); });
    }
    /* 4a: every terminal that shares a right-hand side gets its own nonterminal */
    for (A in work) {
      work[A].forEach(function (r) {
        if (r.length < 2) return;
        for (var i = 0; i < r.length; i++) {
          if (isNT(g, r[i])) continue;
          var t = r[i];
          if (!termNT[t]) { termNT[t] = fresh(); addRule(out, termNT[t], [t]); }
          r[i] = termNT[t];
        }
      });
    }
    /* 4b: split every right-hand side longer than two, reusing helper symbols */
    for (A in work) {
      work[A].forEach(function (r) {
        if (r.length <= 2) { addRule(out, A, r); return; }
        var rest = r.slice(), cur = A;
        while (rest.length > 2) {
          var pairKey = rest[0] + '\u0001' + rest[1];
          var helper;
          if (memo[pairKey]) { helper = memo[pairKey]; }
          else { helper = fresh(); memo[pairKey] = helper; addRule(out, helper, [rest[0], rest[1]]); }
          addRule(out, cur, [rest[0], helper]);
          cur = helper;
          rest = rest.slice(1);
        }
        addRule(out, cur, rest);
      });
    }
    return { g: out, termNT: termNT, memo: memo };
  }

  function isCNF(g) {
    var bad = [];
    for (var A in g.P) {
      if (!Object.prototype.hasOwnProperty.call(g.P, A)) continue;
      g.P[A].forEach(function (r) {
        if (r.length === 2 && isNT(g, r[0]) && isNT(g, r[1])) return;
        if (r.length === 1 && !isNT(g, r[0])) return;
        if (r.length === 0 && A === g.S) return;
        bad.push(A + ' \u2192 ' + ruleText(r));
      });
    }
    return { ok: bad.length === 0, bad: bad };
  }
  function hasUnitRules(g) {
    var bad = [];
    for (var A in g.P) {
      if (!Object.prototype.hasOwnProperty.call(g.P, A)) continue;
      g.P[A].forEach(function (r) { if (r.length === 1 && isNT(g, r[0])) bad.push(A + ' \u2192 ' + r[0]); });
    }
    return bad;
  }
  function hasEpsRules(g) {
    var bad = [];
    for (var A in g.P) {
      if (!Object.prototype.hasOwnProperty.call(g.P, A)) continue;
      g.P[A].forEach(function (r) { if (r.length === 0) bad.push(A); });
    }
    return bad;
  }

  /* ---- membership: span dynamic programming over arbitrary right-hand sides ----
     chart[i][j] holds every nonterminal that derives w[i..j). A nullable symbol
     may match the empty span. Each cell is iterated to a fixpoint, because a
     production can be matched using a symbol that lives in the same cell. */
  function cfgMembers(g, w) {
    var n = w.length, nul = nullableSet(g);
    if (n === 0) return !!nul[g.S];
    var chart = [], i, j, L;
    for (i = 0; i <= n; i++) { chart.push([]); for (j = 0; j <= n; j++) chart[i].push({}); }
    for (i = 0; i <= n; i++) for (var A in nul) if (Object.prototype.hasOwnProperty.call(nul, A)) chart[i][i][A] = true;

    function unitClose(cell) {
      var changed = true;
      while (changed) {
        changed = false;
        for (var B in g.P) {
          if (!Object.prototype.hasOwnProperty.call(g.P, B) || cell[B]) continue;
          var rules = g.P[B];
          for (var r = 0; r < rules.length; r++) {
            if (rules[r].length === 1 && isNT(g, rules[r][0]) && cell[rules[r][0]]) { cell[B] = true; changed = true; break; }
          }
        }
      }
    }
    for (i = 0; i < n; i++) {
      for (var B1 in g.P) {
        if (!Object.prototype.hasOwnProperty.call(g.P, B1)) continue;
        g.P[B1].forEach(function (r) {
          if (r.length === 1 && !isNT(g, r[0]) && r[0] === w[i]) chart[i][i + 1][B1] = true;
        });
      }
      unitClose(chart[i][i + 1]);
    }
    for (i = 0; i <= n; i++) unitClose(chart[i][i]);

    for (L = 1; L <= n; L++) {
      for (i = 0; i + L <= n; i++) {
        j = i + L;
        var cell = chart[i][j], again = true;
        while (again) {
          again = false;
          var before = Object.keys(cell).length;
          for (var A2 in g.P) {
            if (!Object.prototype.hasOwnProperty.call(g.P, A2)) continue;
            var rules2 = g.P[A2];
            for (var t = 0; t < rules2.length; t++) {
              var r2 = rules2[t];
              if (r2.length < 2) continue;
              var cur = {}; cur[i] = true;
              for (var s = 0; s < r2.length; s++) {
                var x = r2[s], nxt = {};
                for (var kk in cur) {
                  if (!cur[kk]) continue;
                  var k = Number(kk);
                  if (isNT(g, x)) {
                    if (nul[x]) nxt[k] = true;
                    for (var e = k + 1; e <= j; e++) if (chart[k][e][x]) nxt[e] = true;
                  } else if (k < j && w[k] === x) nxt[k + 1] = true;
                }
                cur = nxt;
                if (!Object.keys(cur).length) break;
              }
              if (cur[j]) cell[A2] = true;
            }
          }
          unitClose(cell);
          if (Object.keys(cell).length !== before) again = true;
        }
      }
    }
    return !!chart[0][n][g.S];
  }

  function allStrings(T, maxLen) {
    var out = [], cur = [''];
    for (var L = 1; L <= maxLen; L++) {
      var next = [];
      cur.forEach(function (s) { T.forEach(function (t) { next.push(s + t); }); });
      cur = next;
      out = out.concat(cur);
    }
    return out;
  }
  function language(g, maxLen) {
    return allStrings(g.T, maxLen).filter(function (w) { return cfgMembers(g, w); });
  }
  function sameSet(a, b) {
    if (a.length !== b.length) return false;
    var s = {}; a.forEach(function (x) { s[x] = true; });
    return b.every(function (x) { return s[x]; });
  }

  /* ---- the counts the normal form buys ---- */
  function stepsCNF(n) { return 2 * n - 1; }
  function internalCNF(n) { return 2 * n - 1; }
  function totalCNF(n) { return 3 * n - 1; }
  function stepsGNF(n) { return n; }
  function totalGNF(n) { return 2 * n; }
  function cellsFor(n) { return n * (n + 1) / 2; }
  function splitChecks(n) { return n * (n - 1) * (n + 1) / 6; }
  function lengthBound(k) { return Math.pow(2, k - 1); }

  /* ---- CYK table of the converted grammar, kept for the drawing ---- */
  function cykTable(g, w) {
    var n = w.length, cells = [], i, j, L;
    var table = {};
    function key(a, b) { return a + ':' + b; }
    for (i = 0; i < n; i++) {
      var cell = {};
      for (var A in g.P) {
        if (!Object.prototype.hasOwnProperty.call(g.P, A)) continue;
        g.P[A].forEach(function (r) { if (r.length === 1 && r[0] === w[i]) cell[A] = true; });
      }
      table[key(i, i + 1)] = cell;
    }
    for (L = 2; L <= n; L++) {
      for (i = 0; i + L <= n; i++) {
        j = i + L;
        var c = {};
        for (var A2 in g.P) {
          if (!Object.prototype.hasOwnProperty.call(g.P, A2)) continue;
          g.P[A2].forEach(function (r) {
            if (r.length !== 2) return;
            for (var k = i + 1; k < j; k++) {
              if ((table[key(i, k)] || {})[r[0]] && (table[key(k, j)] || {})[r[1]]) c[A2] = true;
            }
          });
        }
        table[key(i, j)] = c;
      }
    }
    for (L = 1; L <= n; L++) for (i = 0; i + L <= n; i++) {
      cells.push({ i: i, j: i + L, len: L, syms: Object.keys(table[key(i, i + L)] || {}) });
    }
    return { cells: cells, table: table, accepts: !!(table[key(0, n)] || {})[g.S] };
  }

  /* ======================================================================
     THE GRAMMARS
     ====================================================================== */

  /* the grammar taught on this page: one unproductive symbol (X), one
     unreachable symbol (Y), one empty rule, and one unit rule after pass 2 */
  var GT0 = {
    V: ['S', 'A', 'B', 'X', 'Y'], T: ['a', 'b'], S: 'S', P: {
      S: [['A', 'B'], ['a', 'b'], ['X']],
      A: [['a', 'A'], []],
      B: [['b', 'B'], ['b']],
      X: [['X', 'c']],
      Y: [['a']]
    }
  };
  /* the standard textbook example (Hopcroft, Motwani, Ullman) */
  var GH0 = {
    V: ['S', 'A', 'B'], T: ['a', 'b'], S: 'S', P: {
      S: [['A', 'S', 'A'], ['a', 'B']],
      A: [['B'], ['S']],
      B: [['b'], []]
    }
  };
  /* the order counterexample: every symbol is useful, and pass 2 kills three */
  var GO0 = {
    V: ['S', 'A', 'B', 'C', 'D'], T: ['a'], S: 'S', P: {
      S: [['A', 'B']], A: [['a']], B: [['C']], C: [['D']], D: [[]]
    }
  };
  /* a grammar whose language contains the empty string */
  var GE0 = {
    V: ['S', 'A'], T: ['a'], S: 'S', P: {
      S: [['a', 'S'], []], A: [['a']]
    }
  };
  /* the chain grammar that reaches the 2^(k-1) bound exactly */
  function chainGrammar(k) {
    var V = ['S'], P = {}, i;
    for (i = 1; i < k; i++) V.push('N' + i);
    P.S = [['N1', 'N1']];
    for (i = 1; i < k - 1; i++) P['N' + i] = [['N' + (i + 1), 'N' + (i + 1)]];
    P['N' + (k - 1)] = [['a']];
    return { V: V, T: ['a'], S: 'S', P: P };
  }

  /* ---- run the pipeline on the teaching grammar, keeping every stage ---- */
  var S0 = clone(GT0);
  var S1 = removeUseless(S0);
  var epsOut = removeEps(S1);
  var S2 = epsOut.g;
  var unitOut = removeUnits(S2);
  var S3 = unitOut.g;
  var cnfOut = toCNF(S3);
  var S4 = cnfOut.g;

  var PROD0 = productiveSet(GT0), REACH0 = reachableSet(GT0);
  var NULLABLE = epsOut.nullable;
  var EPS_IN_LANG_T = epsOut.epsInLang;
  var UNIT_PAIRS = unitOut.pairs;
  var NONTRIVIAL_PAIRS = UNIT_PAIRS.filter(function (p) { return p[0] !== p[1]; });
  var CNF_CHECK = isCNF(S4);

  var LANG_GT = language(GT0, 6);
  var LANG_CNF = language(S4, 6);
  var ALL_STRINGS = allStrings(['a', 'b'], 6).length;

  /* stage-by-stage language preservation on both grammars */
  function stageLanguages(g0) {
    var a = removeUseless(g0), b = removeEps(a).g, c = removeUnits(b).g, d = toCNF(c).g;
    var base = language(g0, 6).filter(function (w) { return w.length > 0; });
    return [a, b, c, d].map(function (g) { return sameSet(language(g, 6), base); });
  }
  var STAGE_OK_T = stageLanguages(GT0);
  var STAGE_OK_H = stageLanguages(GH0);

  /* textbook grammar */
  var GH1 = removeUseless(GH0), GH2 = removeEps(GH1).g, GH3 = removeUnits(GH2).g, GH4 = toCNF(GH3).g;
  var LANG_GH = language(GH0, 6), LANG_GH4 = language(GH4, 6);

  /* the order counterexample, both ways */
  var ORD_USELESS_FIRST = removeUseless(GO0);
  var ORD_AFTER_EPS = removeEps(ORD_USELESS_FIRST).g;
  var ORD_PROD_AFTER_EPS = productiveSet(ORD_AFTER_EPS);
  var ORD_SECOND_USELESS = removeUseless(ORD_AFTER_EPS);
  var ORD_STD_EPS = removeEps(GO0).g;
  var ORD_STD_UNITS = removeUnits(ORD_STD_EPS).g;
  var ORD_STD_USELESS = removeUseless(ORD_STD_UNITS);

  /* the empty-string grammar */
  var GE_EPS = removeEps(GE0);
  var GE_CNF = toCNF(removeUnits(GE_EPS.g).g).g;

  /* the chain witnesses for the 2^(k-1) bound */
  var CHAIN = [2, 3, 4, 5].map(function (k) {
    var g = chainGrammar(k);
    var L = language(g, Math.pow(2, k - 1) + 2);
    var longest = 0;
    L.forEach(function (w) { if (w.length > longest) longest = w.length; });
    return { k: k, longest: longest, bound: lengthBound(k) };
  });

  /* the CYK table of the converted grammar for a four-letter string */
  var CYK = cykTable(S4, 'aabb');
  var CYK_REJECT = ['ba', 'aa', 'bba'].map(function (w) {
    return { w: w, accepts: cykTable(S4, w).accepts };
  });

  /* the derivation lengths of every string in the converted grammar */
  var STEP_TABLE = LANG_CNF.map(function (w) { return { n: w.length, steps: stepsCNF(w.length) }; });

  /* the GATE 2024 Set 1 numbers */
  var G24 = { n: 90, variables: 10, steps: stepsCNF(90), internal: internalCNF(90), total: totalCNF(90) };
  var CELLS90 = cellsFor(90), CHECKS90 = splitChecks(90);

  /* ======================================================================
     LAYER 2 - THE CHECKS
     ====================================================================== */

  var CHECKS = [];
  function check(name, pass, detail) { CHECKS.push({ name: name, pass: !!pass, detail: detail || '' }); }

  check('productive set of the teaching grammar is S, A, B, Y',
    ['S', 'A', 'B', 'Y'].every(function (x) { return PROD0[x]; }) && !PROD0.X,
    'computed: ' + Object.keys(PROD0).join(', '));
  check('reachable set of the teaching grammar is S, A, B, X',
    ['S', 'A', 'B', 'X'].every(function (x) { return REACH0[x]; }) && !REACH0.Y,
    'computed: ' + Object.keys(REACH0).join(', '));
  check('useful set has three members', S1.V.length === 3 && S1.V.join(',') === 'S,A,B', S1.V.join(','));
  check('after pass 1 the grammar has six rules', ruleCount(S1) === 6, 'computed ' + ruleCount(S1));
  check('nullable set of the teaching grammar is exactly A',
    Object.keys(NULLABLE).length === 1 && NULLABLE.A, Object.keys(NULLABLE).join(','));
  check('the teaching grammar does not generate the empty string', EPS_IN_LANG_T === false, String(EPS_IN_LANG_T));
  check('after pass 2 the grammar has seven rules', ruleCount(S2) === 7, 'computed ' + ruleCount(S2));
  check('pass 2 gives S three rules', S2.P.S.length === 3, S2.P.S.map(ruleText).join(' | '));
  check('pass 2 creates the unit rule S gives B',
    S2.P.S.some(function (r) { return r.length === 1 && r[0] === 'B'; }), grammarText(S2).join(' ; '));
  check('the unit pairs are four, one of them non-trivial',
    UNIT_PAIRS.length === 4 && NONTRIVIAL_PAIRS.length === 1, JSON.stringify(NONTRIVIAL_PAIRS));
  check('after pass 3 the grammar has eight rules', ruleCount(S3) === 8, 'computed ' + ruleCount(S3));
  check('after pass 3 S has four rules', S3.P.S.length === 4, S3.P.S.map(ruleText).join(' | '));
  check('no unit production survives pass 3', hasUnitRules(S3).length === 0, hasUnitRules(S3).join('; '));
  check('no empty production survives pass 2', hasEpsRules(S2).length === 0, hasEpsRules(S2).join('; '));
  check('the converted grammar is in Chomsky normal form', CNF_CHECK.ok, CNF_CHECK.bad.join('; '));
  check('the converted grammar has five nonterminals', S4.V.length === 5, S4.V.join(','));
  check('the converted grammar has ten rules', ruleCount(S4) === 10, 'computed ' + ruleCount(S4));
  check('terminal isolation introduces two helpers, X1 for a and X2 for b',
    cnfOut.termNT.a === 'X1' && cnfOut.termNT.b === 'X2' && Object.keys(cnfOut.termNT).length === 2,
    JSON.stringify(cnfOut.termNT));
  check('the teaching grammar never needs a binarisation helper',
    Object.keys(cnfOut.memo).length === 0, JSON.stringify(cnfOut.memo));
  check('converted grammar accepts the same 21 strings up to length six',
    sameSet(LANG_GT, LANG_CNF) && LANG_CNF.length === 21,
    LANG_CNF.length + ' against ' + LANG_GT.length);
  check('every pass preserves the language on the teaching grammar',
    STAGE_OK_T.every(Boolean), JSON.stringify(STAGE_OK_T));
  check('every pass preserves the language on the textbook grammar',
    STAGE_OK_H.every(Boolean), JSON.stringify(STAGE_OK_H));
  check('both grammars accept exactly 21 of the 126 strings of length one to six',
    LANG_GT.length === 21 && ALL_STRINGS === 126, ALL_STRINGS + ' tested');
  check('the textbook grammar converts to five nonterminals and fifteen rules',
    GH4.V.length === 5 && ruleCount(GH4) === 15, GH4.V.length + ' variables, ' + ruleCount(GH4) + ' rules');
  check('the textbook grammar accepts the same 120 strings after conversion',
    sameSet(LANG_GH, LANG_GH4) && LANG_GH.length === 120, LANG_GH4.length + ' against ' + LANG_GH.length);
  check('the textbook grammar generates no empty string', cfgMembers(GH0, '') === false, '');
  check('every derivation in normal form has 2n-1 steps',
    STEP_TABLE.every(function (row) { return row.steps === 2 * row.n - 1; }), JSON.stringify(STEP_TABLE.slice(0, 4)));
  check('internal nodes are 2n-1 and total nodes 3n-1 for n equal to 90',
    G24.internal === 179 && G24.total === 269, G24.internal + ', ' + G24.total);
  check('the GATE CSE 2024 Set 1 answer is 179 steps for a string of length 90',
    G24.steps === 179, String(G24.steps));
  check('Greibach normal form takes n steps and 2n nodes',
    stepsGNF(90) === 90 && totalGNF(90) === 180, stepsGNF(90) + ', ' + totalGNF(90));
  check('the length bound 2^(k-1) is reached exactly by the chain grammars',
    CHAIN.every(function (c) { return c.longest === c.bound; }), JSON.stringify(CHAIN));
  check('ten nonterminals bound a shortest string by 512 letters', lengthBound(10) === 512, '');
  check('the membership table has n(n+1)/2 cells: 10 for four letters, 21 for six, 4095 for ninety',
    cellsFor(4) === 10 && cellsFor(6) === 21 && CELLS90 === 4095, String(CELLS90));
  check('the table of the converted grammar accepts aabb and rejects ba, aa and bba',
    CYK.accepts && CYK_REJECT.every(function (r) { return !r.accepts; }), JSON.stringify(CYK_REJECT));
  check('the split checks for a 90-letter string number 121,485',
    CHECKS90 === 121485, String(CHECKS90));
  check('useless-first removes nothing from the order counterexample',
    ORD_USELESS_FIRST.V.length === 5, ORD_USELESS_FIRST.V.join(','));
  check('after pass 2 the order counterexample has only S and A productive',
    Object.keys(ORD_PROD_AFTER_EPS).sort().join(',') === 'A,S', Object.keys(ORD_PROD_AFTER_EPS).join(','));
  check('the standard order leaves two rules, S gives a and A gives a',
    ruleCount(ORD_STD_USELESS) === 2 && ORD_STD_USELESS.P.S.length === 1 &&
    ORD_STD_USELESS.P.S[0].length === 1 && ORD_STD_USELESS.P.S[0][0] === 'a' && !!ORD_STD_USELESS.P.A,
    grammarText(ORD_STD_USELESS).join(' ; '));
  check('the wrong order leaves a unit production the unit pass has already passed',
    hasUnitRules(ORD_SECOND_USELESS).length > 0 &&
    sameSet(language(ORD_SECOND_USELESS, 4), language(ORD_STD_USELESS, 4)),
    grammarText(ORD_SECOND_USELESS).join(' ; '));
  check('a grammar containing the empty string keeps one empty rule under a new start symbol',
    GE_EPS.epsInLang === true && GE_EPS.g.S !== 'S' && GE_EPS.g.P[GE_EPS.g.S].length === 2,
    grammarText(GE_EPS.g).join(' ; '));
  check('the empty-string grammar keeps its language through the conversion',
    sameSet(language(GE_CNF, 5), language(GE0, 5)) && cfgMembers(GE_CNF, ''),
    language(GE_CNF, 5).length + ' strings');

  /* ======================================================================
     LAYER 3 - RENDER
     ====================================================================== */

  function head(title, sub) {
    P.text(32, 18, title, { size: 15, bold: true, color: INK });
    if (sub) P.text(32, 38, sub, { size: 10.5, mono: true, color: FAINT });
    P.line(32, 50, 868, 50, { stroke: BORDER, sw: 1 });
  }
  function card(x, y, w, h, o) {
    o = o || {};
    P.rect(x, y, w, h, { fill: o.fill || SURF, stroke: o.stroke || BORDER, sw: o.sw || 1, radius: 6 });
  }
  function chip(x, y, text, good) {
    var w = text.length * 6.6 + 18;
    P.rect(x, y, w, 20, { fill: good ? ACCDIM : WARNDIM, stroke: good ? ACC : WARN, sw: 1, radius: 10 });
    P.text(x + 9, y + 10, text, { size: 10.5, base: 'middle', color: good ? ACC : WARN, bold: true });
  }
  function label(x, y, t) { P.text(x, y, t, { size: 10, mono: true, color: FAINT }); }
  function ruleLine(x, y, t, col, size) {
    P.text(x, y, t, { size: size || 11.5, mono: true, color: col || INK });
  }

  var SCENE_DRAW = {};

  /* ---- 1. why a fixed shape ---- */
  SCENE_DRAW.shape = function (t, sc, p) {
    head('Why a fixed shape', 'a grammar may write any right-hand side; a normal form allows two');

    card(32, 66, 402, 216, { fill: SURF2, stroke: BORDER });
    label(48, 82, 'the teaching grammar, as written');
    var rules = ['S \u2192 A B', 'S \u2192 a b', 'A \u2192 a A', 'A \u2192 \u03b5', 'B \u2192 b B', 'B \u2192 b'];
    for (var i = 0; i < 6; i++) {
      if (p < 0.05 + i * 0.055) continue;
      ruleLine(56, 104 + i * 26, rules[i], i === 1 || i === 3 ? WARN : INK, 12);
    }
    if (p > 0.42) {
      P.text(56, 268, 'right-hand sides of length 2, 2, 2, 0, 2, 1', { size: 10, color: DIM });
    }

    if (p > 0.5) {
      P.arrow(444, 168, 486, 168, { stroke: ACC, sw: 2, head: 9 });
      P.text(465, 156, 'restrict', { size: 9.5, align: 'center', color: ACC });
    }

    if (p > 0.56) {
      card(496, 66, 372, 96, { fill: SURF, stroke: ACC, sw: 1.4 });
      P.text(512, 86, 'Chomsky normal form', { size: 11.5, bold: true, color: ACC });
      ruleLine(512, 108, 'A \u2192 B C', INK, 12);
      ruleLine(512, 130, 'A \u2192 a', INK, 12);
      P.text(600, 108, 'two nonterminals', { size: 10, color: DIM });
      P.text(600, 130, 'one terminal', { size: 10, color: DIM });
    }
    if (p > 0.7) {
      card(496, 176, 372, 106, { fill: SURF, stroke: INFO, sw: 1.4 });
      P.text(512, 196, 'Greibach normal form', { size: 11.5, bold: true, color: INFO });
      ruleLine(512, 218, 'A \u2192 a A1 A2 \u2026', INK, 12);
      P.text(512, 242, 'a terminal first, then any number of nonterminals', { size: 10, color: DIM });
      P.text(512, 262, 'so every step consumes exactly one letter', { size: 10, color: DIM });
    }
    if (p > 0.86) {
      chip(32, 300, 'the restriction is what makes derivations countable', true);
      P.text(32, 340, 'the same language, a fixed shape for every rule', { size: 11.5, color: INK });
      P.text(32, 362, 'four passes, each preserving the language, give the shape', { size: 11.5, color: INK });
      P.text(32, 384, 'nothing about the language changes: this is a rewrite of the grammar', { size: 11.5, color: DIM });
    }
  };

  /* ---- 2. the two shapes ---- */
  SCENE_DRAW.definitions = function (t, sc, p) {
    head('The two shapes, and what each one buys', 'every symbol glossed before any algorithm');

    if (p > 0.03) {
      card(32, 64, 402, 168, { fill: SURF, stroke: ACC, sw: 1.5 });
      P.text(48, 82, 'Chomsky normal form', { size: 12, bold: true, color: ACC });
      ruleLine(48, 106, 'A \u2192 B C', INK, 13);
      ruleLine(48, 128, 'A \u2192 a', INK, 13);
      P.text(48, 152, 'A, B, C are nonterminals, a is one terminal', { size: 10, color: DIM });
      P.text(48, 172, 'nothing else is allowed', { size: 10, color: DIM });
      P.text(48, 196, 'exception: S \u2192 \u03b5, only when \u03b5 is in L', { size: 10, color: WARN });
      P.text(48, 216, 'the symbol \u03b5 means the empty string', { size: 10, color: FAINT });
    }
    if (p > 0.22) {
      card(452, 64, 416, 168, { fill: SURF, stroke: INFO, sw: 1.5 });
      P.text(468, 82, 'Greibach normal form', { size: 12, bold: true, color: INFO });
      ruleLine(468, 106, 'A \u2192 a A1 A2 \u2026 Ak', INK, 13);
      P.text(468, 130, 'a terminal, then zero or more nonterminals', { size: 10, color: DIM });
      P.text(468, 152, 'k may be zero, so A \u2192 a is allowed', { size: 10, color: DIM });
      P.text(468, 176, 'every step consumes one input letter', { size: 10, color: VAL });
      P.text(468, 196, 'so a string of n letters takes n steps', { size: 10, color: VAL });
      P.text(468, 216, 'the tree is not binary: a node may have k+1 children', { size: 10, color: FAINT });
    }
    if (p > 0.5) {
      card(32, 248, 836, 96, { fill: SURF2, stroke: BORDER });
      P.text(48, 268, 'what the binary shape buys', { size: 11.5, bold: true, color: INK });
      P.text(48, 290, 'every internal node has two nonterminal children, or one terminal child', { size: 10.5, color: INK });
      P.text(48, 310, 'delete the terminal leaves and a full binary tree remains: n leaves, n \u2212 1 internal nodes', { size: 10.5, color: INK });
      P.text(48, 330, 'that single fact gives the step count 2n \u2212 1, the node count 3n \u2212 1, and the pumping lemma', { size: 10.5, color: ACC });
    }
    if (p > 0.72) {
      card(32, 356, 836, 92, { fill: BADDIM, stroke: BAD, sw: 1.2 });
      P.text(48, 376, 'what a normal form is not', { size: 11.5, bold: true, color: BAD });
      P.text(48, 398, 'it is a property of a grammar, never of a language: one language has many grammars', { size: 10.5, color: INK });
      P.text(48, 418, 'it does not remove ambiguity, and it does not make a language regular', { size: 10.5, color: INK });
      P.text(48, 438, 'it does not decide anything by itself: it makes the counting and the table possible', { size: 10.5, color: INK });
    }
  };

  /* ---- 3. useless symbols ---- */
  SCENE_DRAW.useless = function (t, sc, p) {
    head('Useless symbols: productive and reachable', 'the teaching grammar was built to fail both tests once');

    var cols = [70, 250, 420, 600];
    label(70, 70, 'symbol');
    label(250, 70, 'productive?');
    label(420, 70, 'reachable?');
    label(600, 70, 'kept?');
    var rows = [
      ['S', true, true, true, 'start symbol: both tests pass'],
      ['A', true, true, true, 'A \u2192 a A | \u03b5: reaches terminals'],
      ['B', true, true, true, 'B \u2192 b B | b: reaches terminals'],
      ['X', false, true, false, 'X \u2192 X c only: no derivation ends in terminals'],
      ['Y', true, false, false, 'Y \u2192 a, but no rule ever mentions Y']
    ];
    for (var i = 0; i < rows.length; i++) {
      if (p < 0.06 + i * 0.09) continue;
      var y = 84 + i * 34;
      var bad = !rows[i][3];
      card(60, y, 640, 28, { fill: bad ? BADDIM : SURF, stroke: bad ? BAD : BORDER, sw: bad ? 1.3 : 1 });
      ruleLine(cols[0], y + 18, rows[i][0], INK, 12);
      P.text(cols[1], y + 18, rows[i][1] ? 'yes' : 'no', { size: 11, color: rows[i][1] ? VAL : BAD, bold: !rows[i][1] });
      P.text(cols[2], y + 18, rows[i][2] ? 'yes' : 'no', { size: 11, color: rows[i][2] ? VAL : BAD, bold: !rows[i][2] });
      P.text(cols[3], y + 18, rows[i][3] ? 'keep' : 'delete', { size: 11, color: rows[i][3] ? VAL : BAD, bold: true });
    }
    if (p > 0.55) {
      P.text(716, 96, 'one symbol fails', { size: 10, color: DIM });
      P.text(716, 114, 'each test:', { size: 10, color: DIM });
      P.text(716, 132, 'X is reachable', { size: 10, color: BAD });
      P.text(716, 150, 'but barren;', { size: 10, color: BAD });
      P.text(716, 168, 'Y is fertile', { size: 10, color: BAD });
      P.text(716, 186, 'but unreachable', { size: 10, color: BAD });
    }
    if (p > 0.68) {
      P.text(60, 274, 'the useful set is the intersection: S, A, B', { size: 11.5, bold: true, color: INK });
      ruleLine(60, 300, 'S \u2192 A B | a b', INK, 12);
      ruleLine(60, 322, 'A \u2192 a A | \u03b5', INK, 12);
      ruleLine(60, 344, 'B \u2192 b B | b', INK, 12);
      P.text(320, 300, 'five nonterminals and nine rules', { size: 10.5, color: DIM });
      P.text(320, 322, 'become three nonterminals and six rules', { size: 10.5, color: ACC });
      P.text(320, 344, 'and no string changes membership', { size: 10.5, color: DIM });
    }
    if (p > 0.88) chip(60, 372, 'a symbol that can never contribute a terminal contributes nothing', true);
  };

  /* ---- 4. epsilon ---- */
  SCENE_DRAW.epsilon = function (t, sc, p) {
    head('Removing the empty production', 'nullable symbols, their copies, and the one empty rule that stays');

    card(32, 64, 268, 150, { fill: SURF, stroke: BORDER });
    label(48, 82, 'the rules');
    ruleLine(48, 106, 'S \u2192 A B', INK);
    ruleLine(48, 128, 'A \u2192 a A', INK);
    ruleLine(48, 150, 'A \u2192 \u03b5', WARN);
    ruleLine(48, 172, 'B \u2192 b B | b', INK);
    if (p > 0.12) P.text(48, 198, 'nullable = { A }', { size: 11.5, mono: true, bold: true, color: WARN });

    if (p > 0.26) {
      card(316, 64, 268, 150, { fill: SURF, stroke: ACC, sw: 1.3 });
      label(332, 82, 'the copies, per nullable position');
      ruleLine(332, 106, 'S \u2192 A B', INK);
      ruleLine(332, 128, 'S \u2192 B', ACC);
      ruleLine(332, 150, 'A \u2192 a A', INK);
      ruleLine(332, 172, 'A \u2192 a', ACC);
      P.text(332, 198, 'then every empty rule is deleted', { size: 10, color: DIM });
    }
    if (p > 0.44) {
      card(600, 64, 268, 150, { fill: SURF2, stroke: BORDER });
      label(616, 82, 'why the copies are needed');
      P.text(616, 106, 'any derivation that used', { size: 10.5, color: INK });
      P.text(616, 124, 'A \u21d2 \u03b5 can be rewritten', { size: 10.5, color: INK });
      P.text(616, 142, 'to avoid it, by taking', { size: 10.5, color: INK });
      P.text(616, 160, 'the copy that omits A', { size: 10.5, color: INK });
      P.text(616, 186, 'so the language is unchanged', { size: 10.5, color: VAL });
    }
    if (p > 0.6) {
      P.text(32, 240, 'when the empty string is in the language, one empty rule must survive', { size: 11.5, bold: true, color: INK });
      ruleLine(48, 266, 'S0 \u2192 S | \u03b5', ACC, 12);
      ruleLine(48, 288, 'S \u2192 a S | a', INK, 12);
      P.text(320, 266, 'a new start symbol S0 takes the empty rule', { size: 10.5, color: DIM });
      P.text(320, 288, 'the old start symbol keeps its other rules', { size: 10.5, color: DIM });
      P.text(320, 310, 'on the grammar S \u2192 a S | \u03b5 the conversion keeps exactly one empty rule', { size: 10.5, color: INK });
    }
    if (p > 0.8) {
      card(32, 330, 836, 108, { fill: WARNDIM, stroke: WARN, sw: 1.3 });
      P.text(48, 350, 'the trap, and the previous-year question behind it', { size: 11.5, bold: true, color: WARN });
      P.text(48, 372, 'GATE CSE 2008 asked whether all empty productions can be removed from any grammar by suitable transformations.', { size: 10.5, color: INK });
      P.text(48, 392, 'The statement is false, and this is the reason: if the empty string is in the language, removing its last rule changes the language.', { size: 10.5, color: INK });
      P.text(48, 412, 'The pass also creates a unit production here: S \u2192 B did not exist before, and the next pass exists to remove it.', { size: 10.5, color: ACC });
    }
  };

  /* ---- 5. unit productions ---- */
  SCENE_DRAW.units = function (t, sc, p) {
    head('Removing the unit production', 'a rule with one nonterminal and nothing else adds a step and no letter');

    card(32, 64, 300, 176, { fill: SURF, stroke: BORDER });
    label(48, 82, 'unit pairs after pass 2');
    var pairs = ['(S, S)', '(A, A)', '(B, B)', '(S, B)'];
    for (var i = 0; i < 4; i++) {
      if (p < 0.05 + i * 0.06) continue;
      ruleLine(48, 108 + i * 26, pairs[i], i === 3 ? ACC : DIM, 12);
    }
    if (p > 0.3) {
      P.text(48, 226, 'three trivial, one real: S \u21d2 B', { size: 10.5, color: ACC, bold: true });
    }
    if (p > 0.4) {
      card(348, 64, 240, 176, { fill: SURF2, stroke: BORDER });
      label(364, 82, 'B\u2019s non-unit rules');
      ruleLine(364, 108, 'B \u2192 b B', INK);
      ruleLine(364, 130, 'B \u2192 b', INK);
      P.text(364, 158, 'copied to S, because', { size: 10, color: DIM });
      P.text(364, 176, 'S \u21d2 B by units only', { size: 10, color: DIM });
      P.text(364, 204, 'then all unit rules go', { size: 10.5, color: ACC });
    }
    if (p > 0.58) {
      card(604, 64, 264, 176, { fill: SURF, stroke: ACC, sw: 1.3 });
      label(620, 82, 'after pass 3');
      ruleLine(620, 106, 'S \u2192 A B | a b', INK, 11);
      ruleLine(620, 126, 'S \u2192 b B | b', ACC, 11);
      ruleLine(620, 150, 'A \u2192 a A | a', INK, 11);
      ruleLine(620, 170, 'B \u2192 b B | b', INK, 11);
      P.text(620, 200, 'four rules for S, eight in all', { size: 10, color: DIM });
      P.text(620, 220, 'no rule has a lone nonterminal', { size: 10, color: VAL });
    }
    if (p > 0.74) {
      P.text(32, 264, 'why a leftover unit rule breaks the counting', { size: 11.5, bold: true, color: INK });
      P.text(32, 288, 'the step count of scene nine assumes every step is either two nonterminals or one terminal.', { size: 10.5, color: INK });
      P.text(32, 308, 'a unit step produces neither, so one leftover rule makes the arithmetic wrong for that grammar.', { size: 10.5, color: INK });
      P.text(32, 328, 'the count is not approximate: it is exact, and it needs the shape.', { size: 10.5, color: ACC });
    }
    if (p > 0.88) chip(32, 360, 'unit removal is a closure, then a copy, then a delete', true);
  };

  /* ---- 6. the order ---- */
  SCENE_DRAW.order = function (t, sc, p) {
    head('Why the order is not free', 'the empty pass can leave a symbol that produces nothing');

    card(32, 64, 836, 92, { fill: SURF2, stroke: BORDER });
    label(48, 82, 'a five-symbol grammar where everything is useful at the start');
    ruleLine(48, 106, 'S \u2192 A B        A \u2192 a        B \u2192 C        C \u2192 D        D \u2192 \u03b5', INK, 11.5);
    if (p > 0.1) {
      P.text(48, 134, 'productive: S, A, B, C, D        reachable: S, A, B, C, D        language: { a }', { size: 10.5, color: VAL });
    }
    if (p > 0.24) {
      P.text(32, 184, 'delete the empty rule first', { size: 11.5, bold: true, color: INK });
      ruleLine(48, 208, 'S \u2192 A B | A        A \u2192 a        B \u2192 C        C \u2192 D', INK, 11.5);
      P.text(48, 230, 'D has no rule left, so D is unproductive; then C, then B', { size: 10.5, color: BAD });
    }
    if (p > 0.4) {
      P.text(32, 262, 'productive after that pass: S and A only', { size: 11, color: BAD, bold: true });
      P.text(32, 284, 'so the useless-symbol pass has to run after the other two, never before', { size: 11, color: INK });
    }
    if (p > 0.56) {
      var bx = 32;
      var steps = ['\u03b5 pass', 'unit pass', 'useless pass', 'normal form'];
      for (var i = 0; i < 4; i++) {
        var x = bx + i * 212;
        card(x, 306, 188, 40, { fill: i === 2 ? ACCDIM : SURF, stroke: i === 2 ? ACC : BORDER, sw: 1.2 });
        P.text(x + 94, 326, steps[i], { size: 11, align: 'center', base: 'middle', color: i === 2 ? ACC : INK, bold: true });
        if (i < 3) P.arrow(x + 190, 326, x + 208, 326, { stroke: DIM, sw: 1.4, head: 7 });
      }
    }
    if (p > 0.72) {
      P.text(32, 368, 'run the useless pass twice and you get S \u2192 a with A removed as unreachable', { size: 10.5, color: INK });
      P.text(32, 388, 'the same grammar by a longer route: that is the sign of an order bug, not of a wrong answer', { size: 10.5, color: DIM });
    }
    if (p > 0.88) chip(32, 404, 'each pass can create work for the next one', true);
  };

  /* ---- 7. binarise ---- */
  SCENE_DRAW.binarise = function (t, sc, p) {
    head('Two terminals cannot share a rule', 'isolate every terminal, then split every long right-hand side');

    card(32, 64, 250, 150, { fill: BADDIM, stroke: BAD, sw: 1.3 });
    label(48, 82, 'still illegal');
    ruleLine(48, 108, 'S \u2192 a b', BAD);
    P.text(48, 128, 'a terminal beside a terminal', { size: 10, color: DIM });
    ruleLine(48, 154, 'S \u2192 A B C', BAD);
    P.text(48, 174, 'three symbols in a row', { size: 10, color: DIM });
    P.text(48, 198, 'each becomes legal by a helper', { size: 10, color: INK });

    if (p > 0.22) {
      card(298, 64, 250, 150, { fill: SURF, stroke: ACC, sw: 1.3 });
      label(314, 82, 'helpers: one per terminal');
      ruleLine(314, 108, 'X1 \u2192 a', ACC);
      ruleLine(314, 130, 'X2 \u2192 b', ACC);
      P.text(314, 158, 'shared by every rule', { size: 10, color: DIM });
      P.text(314, 176, 'that mentions that terminal', { size: 10, color: DIM });
      P.text(314, 200, 'two helpers, not one per rule', { size: 10, color: VAL });
    }
    if (p > 0.42) {
      card(564, 64, 304, 150, { fill: SURF, stroke: BORDER });
      label(580, 82, 'after isolation');
      ruleLine(580, 108, 'S \u2192 X1 X2', INK);
      ruleLine(580, 130, 'S \u2192 X2 B', INK);
      ruleLine(580, 152, 'S \u2192 A B', INK);
      ruleLine(580, 174, 'A \u2192 X1 A', INK);
      ruleLine(580, 196, 'B \u2192 X2 B', INK);
    }
    if (p > 0.6) {
      P.text(32, 240, 'a long right-hand side becomes a chain, and a side of k symbols needs k \u2212 2 new nonterminals', { size: 11.5, bold: true, color: INK });
      ruleLine(48, 266, 'S \u2192 A B C D', INK, 12);
      P.arrow(180, 262, 214, 262, { stroke: ACC, sw: 1.6, head: 8 });
      ruleLine(226, 266, 'S \u2192 A X3        X3 \u2192 B X4        X4 \u2192 C D', ACC, 12);
      P.text(48, 290, 'k = 4 symbols, so 2 new nonterminals: X3 and X4', { size: 10.5, color: DIM });
    }
    if (p > 0.78) {
      P.text(32, 326, 'isolate first, split second', { size: 11.5, bold: true, color: INK });
      P.text(32, 348, 'split first and a terminal later moves into another rule, so the helper count no longer matches the rule', { size: 10.5, color: INK });
      P.text(32, 368, 'the teaching grammar needs two helpers and no splitting: its longest side after isolation is two', { size: 10.5, color: ACC });
    }
    if (p > 0.9) chip(32, 392, 'the count of helpers is only defined once the order is fixed', true);
  };

  /* ---- 8. the pipeline ---- */
  SCENE_DRAW.pipeline = function (t, sc, p) {
    head('The whole pipeline on one grammar', 'four passes, counted, and checked against the original');

    var rows = [
      ['as written', '5', '9', 'one barren symbol X, one unreachable Y'],
      ['useless removed', '3', '6', 'X and Y gone'],
      ['empty removed', '3', '7', 'copies added more than the deletion removed'],
      ['units removed', '3', '8', 'S receives B\u2019s two rules'],
      ['normal form', '5', '10', 'two helpers, X1 for a and X2 for b']
    ];
    var cols = [60, 268, 344, 430];
    label(cols[0], 70, 'stage');
    label(cols[1], 70, 'nonterminals');
    label(cols[2], 70, 'rules');
    label(cols[3], 70, 'what changed');
    for (var i = 0; i < rows.length; i++) {
      if (p < 0.05 + i * 0.09) continue;
      var y = 84 + i * 30;
      var last = i === rows.length - 1;
      card(50, y, 812, 26, { fill: last ? ACCDIM : SURF, stroke: last ? ACC : BORDER, sw: last ? 1.3 : 1 });
      P.text(cols[0], y + 17, rows[i][0], { size: 10.5, color: last ? ACC : INK, bold: last });
      P.text(cols[1], y + 17, rows[i][1], { size: 10.5, mono: true, color: last ? ACC : DIM });
      P.text(cols[2], y + 17, rows[i][2], { size: 10.5, mono: true, color: last ? ACC : DIM });
      P.text(cols[3], y + 17, rows[i][3], { size: 10, color: DIM });
    }
    if (p > 0.58) {
      card(32, 244, 470, 136, { fill: SURF, stroke: ACC, sw: 1.3 });
      label(48, 262, 'the converted grammar, ten rules');
      ruleLine(48, 286, 'S \u2192 A B | X1 X2 | X2 B | b', INK, 11);
      ruleLine(48, 306, 'A \u2192 X1 A | a', INK, 11);
      ruleLine(48, 326, 'B \u2192 X2 B | b', INK, 11);
      ruleLine(48, 346, 'X1 \u2192 a        X2 \u2192 b', INK, 11);
      P.text(48, 368, 'every rule: two nonterminals, or one terminal', { size: 10, color: VAL });
    }
    if (p > 0.74) {
      card(518, 244, 350, 136, { fill: SURF2, stroke: BORDER });
      label(534, 262, 'the check that matters');
      P.text(534, 286, '126 strings of length 1 to 6 over a, b', { size: 10.5, color: INK });
      P.text(534, 306, 'original grammar accepts 21', { size: 10.5, color: INK });
      P.text(534, 326, 'converted grammar accepts the same 21', { size: 10.5, color: VAL });
      P.text(534, 350, 'evidence on a prefix; the proof is that', { size: 10, color: DIM });
      P.text(534, 368, 'each pass preserves the language', { size: 10, color: DIM });
    }
    if (p > 0.9) {
      P.text(32, 400, 'the textbook grammar of Hopcroft, Motwani and Ullman gives five nonterminals and sixteen rules, and the same 120 strings', { size: 10, color: DIM });
      chip(32, 420, 'five passes counted, one language preserved', true);
    }
  };

  /* ---- 9. the arithmetic ---- */
  SCENE_DRAW.arithmetic = function (t, sc, p) {
    head('What the shape buys: 2n \u2212 1', 'the count that every question about normal forms turns on');

    card(32, 64, 260, 116, { fill: SURF, stroke: ACC, sw: 1.4 });
    label(48, 82, 'steps, for a string of n letters');
    P.text(48, 108, 'n \u2212 1  binary steps', { size: 11.5, mono: true, color: INK });
    P.text(48, 130, 'n      terminal steps', { size: 11.5, mono: true, color: INK });
    P.text(48, 160, '2n \u2212 1  in total', { size: 13, mono: true, bold: true, color: ACC });

    if (p > 0.16) {
      card(308, 64, 260, 116, { fill: SURF, stroke: BORDER });
      label(324, 82, 'nodes in the parse tree');
      P.text(324, 108, '2n \u2212 1  internal', { size: 11.5, mono: true, color: INK });
      P.text(324, 130, '3n \u2212 1  in total', { size: 11.5, mono: true, color: INK });
      P.text(324, 160, 'n = 90 gives 179 and 269', { size: 11, mono: true, color: VAL });
    }
    if (p > 0.32) {
      card(584, 64, 284, 116, { fill: SURF2, stroke: BORDER });
      label(600, 82, 'for comparison, Greibach');
      P.text(600, 108, 'n      steps', { size: 11.5, mono: true, color: INK });
      P.text(600, 130, '2n     nodes in total', { size: 11.5, mono: true, color: INK });
      P.text(600, 160, 'n = 90 gives 90 and 180', { size: 11, mono: true, color: INFO });
    }
    if (p > 0.46) {
      card(32, 196, 470, 126, { fill: SURF, stroke: BORDER });
      label(48, 214, 'the tree for n = 4: 7 internal nodes, 11 nodes in all');
      /* a small full binary tree: 4 leaves */
      var cx = 140;
      var lv = [[cx, 236], [cx - 60, 262], [cx + 60, 262], [cx - 90, 288], [cx - 30, 288], [cx + 30, 288], [cx + 90, 288]];
      var edges = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]];
      edges.forEach(function (e) {
        P.line(lv[e[0]][0], lv[e[0]][1], lv[e[1]][0], lv[e[1]][1], { stroke: DIM, sw: 1.3 });
      });
      lv.forEach(function (pt, i) {
        P.circle(pt[0], pt[1], 9, { fill: SURF, stroke: ACC, sw: 1.4 });
        P.text(pt[0], pt[1], i === 0 ? 'S' : (i < 3 ? 'A' : 'a'), { size: 9, align: 'center', base: 'middle', color: INK });
      });
      P.text(272, 250, 'every step is one rule: a node', { size: 10, color: DIM });
      P.text(272, 270, 'with two children, or a node', { size: 10, color: DIM });
      P.text(272, 290, 'with one terminal child', { size: 10, color: DIM });
      P.text(272, 312, 'nothing else can happen', { size: 10, color: ACC });
    }
    if (p > 0.62) {
      card(518, 196, 350, 126, { fill: SURF, stroke: INFO, sw: 1.3 });
      label(534, 214, 'the bound from k nonterminals');
      P.text(534, 238, 'a shortest string has length \u2264 2^(k\u22121)', { size: 11, mono: true, color: INK });
      P.text(534, 262, 'k = 2, 3, 4, 5 \u2192 2, 4, 8, 16', { size: 10.5, mono: true, color: VAL });
      P.text(534, 284, 'chain grammars reach it exactly', { size: 10, color: DIM });
      P.text(534, 304, 'k = 10 \u2192 512 letters', { size: 10.5, mono: true, color: INFO });
    }
    if (p > 0.8) {
      card(32, 336, 836, 100, { fill: ACCDIM, stroke: ACC, sw: 1.4 });
      P.text(48, 356, 'GATE CSE 2024 Set 1: ten variables, a string of 90 letters, how many steps?', { size: 11.5, bold: true, color: INK });
      P.text(48, 378, '2 \u00d7 90 \u2212 1 = 179.   The ten variables are a distractor: they bound the length of some string, not the length of this derivation.', { size: 10.5, color: INK });
      P.text(48, 400, 'The tree has 179 internal nodes and 269 nodes in total. In Greibach form the same string would take 90 steps.', { size: 10.5, color: INK });
      chip(48, 412, 'published key: 179', true);
    }
  };

  /* ---- 10. membership and the exam ---- */
  SCENE_DRAW.exam = function (t, sc, p) {
    head('Membership, and how GATE asks it', 'the triangular table the normal form makes possible');

    if (p > 0.04) {
      label(48, 74, 'the table for a a b b, of the converted grammar');
      var cellW = 52, cellH = 30, x0 = 56, y0 = 92;
      var w = 'aabb', i, j;
      for (i = 0; i < 4; i++) {
        P.text(x0 - 12, y0 + i * cellH + 20, w[i], { size: 11, mono: true, align: 'right', color: FAINT });
      }
      CYK.cells.forEach(function (c) {
        var row = c.j - c.i - 1;
        var x = x0 + c.i * cellW;
        var y = y0 + (3 - row) * cellH;
        var has = c.syms.length > 0;
        P.rect(x, y, cellW - 4, cellH - 4, {
          fill: has ? SURF2 : SURF, stroke: has ? BORDER : FAINT, sw: 1, radius: 4
        });
        P.text(x + 8, y + 9, c.syms.join(' '), { size: 9.5, mono: true, color: INK });
      });
      if (p > 0.3) {
        P.text(300, 104, 'each cell asks: which nonterminals', { size: 10.5, color: INK });
        P.text(300, 124, 'derive exactly this piece?', { size: 10.5, color: INK });
        P.text(300, 150, 'the whole string is accepted when S', { size: 10.5, color: INK });
        P.text(300, 170, 'appears in the top cell', { size: 10.5, color: INK });
        P.text(300, 196, 'aabb is accepted: S is there', { size: 10.5, color: VAL, bold: true });
        P.text(300, 216, 'ba, aa and bba are rejected', { size: 10.5, color: BAD });
      }
    }
    if (p > 0.5) {
      card(32, 246, 410, 116, { fill: SURF, stroke: BORDER });
      label(48, 264, 'the cost of the table');
      P.text(48, 288, 'cells: n(n+1)/2 \u2014 10 for four letters, 4095 for ninety', { size: 10.5, color: INK });
      P.text(48, 310, 'each cell tries every split point: order n cubed', { size: 10.5, color: INK });
      P.text(48, 332, 'for n = 90 that is 121,485 split checks', { size: 10.5, mono: true, color: ACC });
      P.text(48, 352, 'cubic, not exponential: that is what the shape buys', { size: 10, color: DIM });
    }
    if (p > 0.66) {
      card(458, 246, 410, 116, { fill: SURF2, stroke: BORDER });
      label(474, 264, 'four question shapes in previous papers');
      P.text(474, 288, '1  the step count, given the shape and the length', { size: 10.5, color: INK });
      P.text(474, 308, '2  is this grammar in normal form?', { size: 10.5, color: INK });
      P.text(474, 328, '3  which of these four grammars is in normal form?', { size: 10.5, color: INK });
      P.text(474, 348, '4  a consequence, such as removing every empty rule', { size: 10.5, color: INK });
    }
    if (p > 0.84) {
      P.text(32, 384, 'GATE CSE 1994 asked the derivation length directly; GATE CSE 2024 Set 1 asked it with a 90-letter string; GATE CSE 2008 asked the consequence.', { size: 10, color: DIM });
      chip(32, 400, 'two lines: read the shape, apply the count', true);
    }
  };

  function drawFrame(t) {
    if (!P) return;
    P.clear();
    P.alpha(1);
    var i = K.sceneAt ? K.sceneAt(t) : 0;
    var sc = window.LESSON_TIMELINE.scenes[i];
    if (!sc) return;
    var span = Math.max(0.001, sc.end - sc.start);
    var p = K.clamp01((t - sc.start) / span);
    var fn = SCENE_DRAW[sc.id];
    if (fn) {
      try { fn(t, sc, p); }
      catch (e) { P.text(24, 240, 'draw error: ' + e.message, { size: 12, color: BAD }); }
    }
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

    window.__drawAt = function (t) {
      K.state.elapsed = t;
      if (P) drawFrame(t);
    };
    window.__lessonChecks = CHECKS;
    window.__model = {
      GT0: GT0, S1: S1, S2: S2, S3: S3, S4: S4,
      productive: Object.keys(PROD0), reachable: Object.keys(REACH0),
      nullable: Object.keys(NULLABLE), epsInLang: EPS_IN_LANG_T,
      unitPairs: UNIT_PAIRS, nontrivial: NONTRIVIAL_PAIRS,
      counts: {
        rules0: ruleCount(GT0), rules1: ruleCount(S1), rules2: ruleCount(S2),
        rules3: ruleCount(S3), rules4: ruleCount(S4), V4: S4.V.length
      },
      termNT: cnfOut.termNT, binariseMemo: cnfOut.memo,
      lang: { original: LANG_GT.length, converted: LANG_CNF.length, tested: ALL_STRINGS, same: sameSet(LANG_GT, LANG_CNF) },
      stages: { teaching: STAGE_OK_T, textbook: STAGE_OK_H },
      textbook: { V: GH4.V.length, rules: ruleCount(GH4), strings: LANG_GH.length, same: sameSet(LANG_GH, LANG_GH4) },
      order: {
        uselessFirstV: ORD_USELESS_FIRST.V.length,
        productiveAfterEps: Object.keys(ORD_PROD_AFTER_EPS),
        standard: grammarText(ORD_STD_USELESS),
        secondPass: grammarText(ORD_SECOND_USELESS)
      },
      epsGrammar: { start: GE_EPS.g.S, text: grammarText(GE_EPS.g), keepsEps: cfgMembers(GE_CNF, '') },
      chain: CHAIN, bound10: lengthBound(10),
      gate24: G24, cells90: CELLS90, split90: CHECKS90,
      cyk: { accepts: CYK.accepts, rejects: CYK_REJECT, cells: CYK.cells },
      CHECKS: CHECKS
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
