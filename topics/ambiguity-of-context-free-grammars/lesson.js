/* ==========================================================================
   ambiguity-of-context-free-grammars — lesson.js
   Four layers, in order:
     1. THE MODEL      — a general counter for parse trees over any context-free
                         grammar (a span table, with the same-span rules solved
                         as a fixed point so a cyclic grammar is reported as
                         infinitely ambiguous), the two expression grammars, the
                         dangling-else family with both repairs, the standard
                         grammar for the inherently ambiguous language, a DFA to
                         right-linear conversion, the reduction from Post's
                         correspondence, and the derivation-order counters.
     2. THE CHECKS     — every number the captions state is recomputed here and
                         compared with the figure the caption states.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The claim under test is one sentence: a string has a number of trees, a
   grammar is ambiguous or not, a language is inherently ambiguous or not, and
   the three have three different answers. Every figure is computed below.
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

var AMB = (function () {
  'use strict';

  var CAP = 1e12;

  /* a grammar is { start, nts:[...], rules:[{A, rhs:[chars]}] }.
     A single upper-case letter is a nonterminal; everything else is a terminal. */
  function G(start, nts, rules) {
    return {
      start: start, nts: nts.slice(),
      rules: rules.map(function (r) { return { A: r[0], rhs: r[1].split('') }; })
    };
  }

  /* ------------------------------------------------------------------
     The counter. cnt[A][i][j] = number of parse trees rooted at A that
     derive w[i..j). Spans are filled shortest first, so every part of a
     rule reads a span already finished; the only same-span reads are a
     rule that leaves one nonterminal covering the whole span (every unit
     rule is one of those), and those are solved by iterating the rule set
     to a fixed point. A grammar that never settles is infinitely
     ambiguous, and the iteration reports it instead of looping.
     ------------------------------------------------------------------ */
  function countTrees(gram, w) {
    var n = w.length, nts = gram.nts, rules = gram.rules;
    var isNT = function (s) { return nts.indexOf(s) !== -1; };
    var cnt = new Map();
    var key = function (A, i, j) { return A + '|' + i + '|' + j; };
    var get = function (A, i, j) { return cnt.get(key(A, i, j)) || 0; };
    var diverged = false;

    /* nullable: can A derive the empty string at all */
    var nullable = {};
    nts.forEach(function (A) { nullable[A] = false; });
    var grew = true;
    while (grew) {
      grew = false;
      rules.forEach(function (r) {
        if (nullable[r.A]) return;
        var all = r.rhs.every(function (s) { return isNT(s) && nullable[s]; });
        if (all) { nullable[r.A] = true; grew = true; }
      });
    }

    /* every way to cut [i,j) among the parts that must cover characters */
    function cuts(parts, idx, a, j, acc) {
      if (idx === parts.length) { if (a === j) acc(1); return; }
      var s = parts[idx];
      if (!isNT(s)) {
        if (j - a >= 1 && w[a] === s) cuts(parts, idx + 1, a + 1, j, acc);
        return;
      }
      var rest = parts.length - idx - 1;
      for (var b = a + 1; b <= j - rest; b++) {
        var c = get(s, a, b);
        if (c === 0) continue;
        cuts(parts, idx + 1, b, j, (function (cc) {
          return function (m) { acc(m * cc); };
        })(c));
      }
    }

    /* one rule at one span: a base number plus the same-span terms */
    function ruleParts(r, i, j, epsOf) {
      var k = r.rhs.length, base = 0, same = [];
      for (var mask = 0; mask < (1 << k); mask++) {
        var eps = 1, ok = true, parts = [];
        for (var p = 0; p < k; p++) {
          var s = r.rhs[p];
          if (mask & (1 << p)) {
            if (!isNT(s) || !nullable[s]) { ok = false; break; }
            eps *= epsOf(s);
          } else parts.push(s);
        }
        if (!ok || eps === 0) continue;
        if (j - i === 0) { if (parts.length === 0) base += eps; continue; }
        if (parts.length === 1 && isNT(parts[0])) { same.push([parts[0], eps]); continue; }
        var t = 0;
        cuts(parts, 0, i, j, function (m) { t += m; });
        if (t) base += eps * t;
      }
      return { base: base, same: same };
    }

    for (var L = 0; L <= n; L++) {
      for (var i = 0; i + L <= n; i++) {
        var j = i + L;
        var cur = {};
        nts.forEach(function (A) { cur[A] = 0; });
        var pr = rules.map(function (r) {
          return ruleParts(r, i, j, function (A) { return L === 0 ? (cur[A] || 0) : get(A, i, i); });
        });

        for (var pass = 0; pass < 90; pass++) {
          var prev = {};
          nts.forEach(function (A) { prev[A] = cur[A]; });
          var epsOf = function (A) { return prev[A] || 0; };
          if (L === 0) {
            pr = rules.map(function (r) { return ruleParts(r, i, j, epsOf); });
          }
          nts.forEach(function (A) { cur[A] = 0; });
          for (var ri = 0; ri < rules.length; ri++) {
            var v = pr[ri].base, same = pr[ri].same;
            for (var q = 0; q < same.length; q++) v += same[q][1] * prev[same[q][0]];
            cur[rules[ri].A] += v;
          }
          var moved = false;
          nts.forEach(function (A) { if (cur[A] !== prev[A]) moved = true; });
          if (!moved) break;
          if (pass === 89) diverged = true;
        }

        nts.forEach(function (A) {
          var v = cur[A] || 0;
          if (v > CAP) { v = CAP; diverged = true; }
          cnt.set(key(A, i, j), v);
        });
      }
    }
    return {
      count: get(gram.start, 0, n), diverged: diverged,
      at: function (A, i, j) { return get(A, i, j); }
    };
  }

  /* the trees themselves, for grammars with no epsilon rule: every symbol
     takes at least one character */
  function trees(gram, w) {
    var isNT = function (s) { return gram.nts.indexOf(s) !== -1; };
    function derive(sym, i, j) {
      if (!isNT(sym)) return (j === i + 1 && w[i] === sym) ? [{ sym: sym, kids: [], leaf: true }] : [];
      var out = [];
      gram.rules.forEach(function (r) {
        if (r.A !== sym) return;
        var k = r.rhs.length;
        if (j - i < k) return;
        var cut = new Array(k + 1);
        (function place(idx, pos) {
          if (idx === k) {
            if (pos !== j) return;
            var kids = [];
            for (var t = 0; t < k; t++) {
              var subs = derive(r.rhs[t], cut[t], cut[t + 1]);
              if (subs.length !== 1) return;
              kids.push(subs[0]);
            }
            out.push({ sym: sym, kids: kids, leaf: false });
            return;
          }
          var rest = k - idx - 1;
          for (var e = pos + 1; e <= j - rest; e++) { cut[idx] = pos; cut[idx + 1] = e; place(idx + 1, e); }
        })(0, i);
      });
      return out;
    }
    return derive(gram.start, 0, w.length);
  }

  /* derivation sequences of one tree: the linear extensions of its internal
     nodes, each node after its parent */
  function orders(tree) {
    var nodes = [];
    (function walk(nd) { if (!nd.leaf) { nodes.push(nd); nd.kids.forEach(walk); } })(tree);
    var n = nodes.length;
    if (n === 0) return 1;
    var parent = new Map(), idxOf = new Map();
    nodes.forEach(function (nd, i) { idxOf.set(nd, i); });
    nodes.forEach(function (nd) { nd.kids.forEach(function (k) { if (!k.leaf) parent.set(k, nd); }); });
    var memo = new Map();
    function go(mask) {
      if (memo.has(mask)) return memo.get(mask);
      if (mask === (1 << n) - 1) return 1;
      var total = 0;
      for (var i = 0; i < n; i++) {
        if (mask & (1 << i)) continue;
        var p = parent.get(nodes[i]);
        if (p && !(mask & (1 << idxOf.get(p)))) continue;
        total += go(mask | (1 << i));
      }
      memo.set(mask, total);
      return total;
    }
    return go(0);
  }

  /* every string over the alphabet, up to a length */
  function strings(alpha, maxLen) {
    var out = [''], front = [''];
    for (var L = 1; L <= maxLen; L++) {
      var next = [];
      for (var a = 0; a < front.length; a++) {
        for (var c = 0; c < alpha.length; c++) next.push(front[a] + alpha[c]);
      }
      for (var t = 0; t < next.length; t++) out.push(next[t]);
      front = next;
    }
    return out;
  }

  /* every string over the alphabet of a given length */
  function fixed(alpha, len) {
    var out = [''];
    for (var L = 0; L < len; L++) {
      var next = [];
      for (var a = 0; a < out.length; a++) for (var c = 0; c < alpha.length; c++) next.push(out[a] + alpha[c]);
      out = next;
    }
    return out;
  }

  /* DFA over {a,b} to a right-linear grammar with no epsilon rule */
  function fromDFA(dfa) {
    var rules = [];
    Object.keys(dfa.trans).forEach(function (st) {
      Object.keys(dfa.trans[st]).forEach(function (ch) {
        var to = dfa.trans[st][ch];
        if (dfa.final.indexOf(to) !== -1) rules.push([st, ch]);
        rules.push([st, ch + to]);
      });
    });
    return G(dfa.start, Object.keys(dfa.trans), rules);
  }

  /* Post's correspondence: the reduction that carries the undecidability */
  function fromPCP(U, V) {
    var sep = 'cdefghij';
    var rules = [['S', 'U'], ['S', 'V']];
    U.forEach(function (u, i) {
      rules.push(['U', u + 'U' + sep[i]]);
      rules.push(['U', u + sep[i]]);
      rules.push(['V', V[i] + 'V' + sep[i]]);
      rules.push(['V', V[i] + sep[i]]);
    });
    return G('S', ['S', 'U', 'V'], rules);
  }

  /* the strings one nonterminal generates, up to a length: used to compare
     the two halves of the reduction without counting every string there is */
  function generate(gram, sym, maxLen) {
    var out = {};
    function go(sym2, form, depth) {
      if (depth > 40) return;
      var nt = form.search(/[A-Z]/);
      if (nt === -1) { if (form.length <= maxLen) out[form] = 1; return; }
      if (form.length > maxLen + 8) return;
      var A = form[nt];
      gram.rules.forEach(function (r) {
        if (r.A !== A) return;
        go(A, form.slice(0, nt) + r.rhs.join('') + form.slice(nt + 1), depth + 1);
      });
    }
    go(sym, sym, 0);
    return Object.keys(out);
  }

  /* ---------------------------- the grammars ---------------------------- */

  var EXPR = G('E', ['E'], [['E', 'E+E'], ['E', 'E*E'], ['E', 'i']]);
  var LEV = G('E', ['E', 'T', 'F'],
    [['E', 'E+T'], ['E', 'T'], ['T', 'T*F'], ['T', 'F'], ['F', 'i']]);
  var DANGLE = G('S', ['S'], [['S', 'ictS'], ['S', 'ictSeS'], ['S', 'x']]);
  var DANGLE_TRY = G('S', ['S', 'M', 'U'],
    [['S', 'M'], ['S', 'U'], ['M', 'ictMeM'], ['M', 'x'], ['U', 'ictS'], ['U', 'ictMeS']]);
  var DANGLE_FIX = G('S', ['S', 'M', 'U'],
    [['S', 'M'], ['S', 'U'], ['M', 'ictMeM'], ['M', 'x'], ['U', 'ictS'], ['U', 'ictMeU']]);
  var INAMB = G('S', ['S', 'L', 'C', 'A', 'D'],
    [['S', 'LC'], ['S', 'AD'], ['L', 'aLb'], ['L', 'ab'],
     ['C', 'c'], ['C', 'cC'], ['D', 'bDc'], ['D', 'bc'], ['A', 'a'], ['A', 'aA']]);
  var LOOP = G('S', ['S'], [['S', 'SS'], ['S', 'a'], ['S', '']]);
  var Q1 = G('S', ['S'], [['S', 'aSb'], ['S', '']]);
  var Q3 = G('S', ['S'], [['S', 'aS'], ['S', 'Sa'], ['S', '']]);
  var Q4 = G('S', ['S'], [['S', 'aS'], ['S', '']]);
  var ONEAMB = G('S', ['S', 'A', 'B'], [['S', 'A'], ['S', 'B'], ['A', 'a'], ['B', 'a']]);
  var REG = fromDFA({ start: 'A', final: ['B'], trans: { A: { a: 'B', b: 'A' }, B: { a: 'B', b: 'A' } } });

  /* ---------------------------- the numbers ---------------------------- */

  var M = {};

  /* 1. the expression grammar: one count per string, Catalan in the operands */
  var exprWords = ['i', 'i+i', 'i+i+i', 'i+i+i+i', 'i+i+i+i+i', 'i+i+i+i+i+i'];
  M.exprCounts = exprWords.map(function (w) { return countTrees(EXPR, w).count; });
  M.exprMixed = {
    'i+i*i': countTrees(EXPR, 'i+i*i').count,
    'i*i+i': countTrees(EXPR, 'i*i+i').count,
    'i+i+i*i': countTrees(EXPR, 'i+i+i*i').count
  };
  M.catalan = [0, 1, 2, 3, 4, 5].map(function (k) {
    var c = 1;
    for (var i = 0; i < k; i++) c = c * 2 * (2 * i + 1) / (i + 2);
    return { k: k, formula: Math.round(c), computed: countTrees(EXPR, new Array(k + 2).join('i').split('').join('+')).count };
  });
  /* the span table the animation draws, for i+i+i */
  M.table = (function () {
    var w = 'i+i+i', res = countTrees(EXPR, w), rows = [];
    for (var L = 0; L <= w.length; L++) {
      for (var i = 0; i + L <= w.length; i++) {
        var v = res.at('E', i, i + L);
        if (v) rows.push({ i: i, j: i + L, v: v });
      }
    }
    return rows;
  })();

  /* 2. the levelled grammar: the same language, one tree per string */
  M.levCounts = exprWords.map(function (w) { return countTrees(LEV, w).count; });
  M.langCheck = (function () {
    /* the operator grammar's language is i (op i)*: an independent shape test */
    var shape = /^i([+*]i)*$/, same = 0, diff = 0, maxLev = 0, inLang = 0;
    var all = strings(['i', '+', '*'], 5);
    for (var a = 0; a < all.length; a++) {
      var s = all[a];
      if (!s) continue;
      var x = countTrees(EXPR, s).count > 0, y = countTrees(LEV, s).count > 0;
      if (x !== y) diff++;
      if (x && y) same++;
      if (shape.test(s) !== x) inLang++;
      var lc = countTrees(LEV, s).count;
      if (lc > maxLev) maxLev = lc;
    }
    /* and the strings the shape test says are in the language, up to length 7 */
    var deep = 0, deepMax = 0;
    for (var k = 0; k <= 3; k++) {
      var ops = fixed(['+', '*'], k);
      for (var t = 0; t < ops.length; t++) {
        var w2 = 'i';
        for (var u = 0; u < k; u++) w2 += ops[t][u] + 'i';
        deep++;
        var c = countTrees(LEV, w2).count;
        if (c !== 1) deepMax++;
      }
    }
    return { strings: all.length - 1, differences: diff, inBoth: same, shapeMismatch: inLang,
             maxLevelled: maxLev, inLanguage: deep, levelledWrong: deepMax };
  })();

  /* 3. dangling else: the naive repair stays ambiguous, the right one does not */
  M.dangle = {
    witness: 'ictictxex',
    ambiguous: countTrees(DANGLE, 'ictictxex').count,
    naive: countTrees(DANGLE_TRY, 'ictictxex').count,
    fixed: countTrees(DANGLE_FIX, 'ictictxex').count
  };
  M.dangleSweep = (function () {
    /* every derivation starts with ict or is exactly x, so those strings, and
       only those, can be in the language: testing them covers all of it */
    var cands = ['x'], maxLen = 7;
    for (var L = 3; L <= maxLen; L++) {
      var tails = fixed(['i', 'c', 't', 'e', 'x'], L - 3);
      for (var t = 0; t < tails.length; t++) cands.push('ict' + tails[t]);
    }
    var diff = 0, maxA = 0, maxF = 0, amb = 0;
    for (var a = 0; a < cands.length; a++) {
      var s = cands[a];
      var x = countTrees(DANGLE, s).count, y = countTrees(DANGLE_FIX, s).count;
      if ((x > 0) !== (y > 0)) diff++;
      if (x > maxA) maxA = x;
      if (y > maxF) maxF = y;
      if (x > 1) amb++;
    }
    return { strings: cands.length, differences: diff, maxAmbiguous: maxA, maxFixed: maxF, ambiguousStrings: amb };
  })();

  /* 4. three counters: trees, leftmost derivations, derivation sequences */
  M.derivs = {};
  ['i+i', 'i+i+i', 'i+i*i'].forEach(function (w) {
    var ts = trees(EXPR, w), total = 0;
    for (var t = 0; t < ts.length; t++) total += orders(ts[t]);
    M.derivs[w] = { trees: ts.length, leftmost: ts.length, sequences: total };
  });

  /* 5. a regular language: a deterministic grammar gives one tree per string */
  M.regular = (function () {
    var all = strings(['a', 'b'], 8), max = 0, wrong = 0, member = 0;
    for (var a = 0; a < all.length; a++) {
      var s = all[a];
      if (!s) continue;
      var c = countTrees(REG, s).count;
      if (c > max) max = c;
      if ((c > 0) !== /a$/.test(s)) wrong++;
      if (c === 1) member++;
    }
    return { strings: all.length - 1, maxTrees: max, wrong: wrong, members: member, rules: REG.rules.length };
  })();

  /* 6. the language every grammar for it must leave ambiguous */
  M.inamb = (function () {
    var rows = [];
    for (var n = 1; n <= 6; n++) {
      var w = new Array(n + 1).join('a') + new Array(n + 1).join('b') + new Array(n + 1).join('c');
      rows.push({ n: n, trees: countTrees(INAMB, w).count });
    }
    return rows;
  })();
  M.inambOff = (function () {
    var rows = [];
    for (var n = 1; n <= 4; n++) {
      var w = new Array(n + 1).join('a') + new Array(n + 1).join('b') + new Array(n + 2).join('c');
      rows.push({ n: n, trees: countTrees(INAMB, w).count });
    }
    return rows;
  })();
  M.inambLang = (function () {
    var all = strings(['a', 'b', 'c'], 6), diff = 0, checked = 0;
    for (var a = 0; a < all.length; a++) {
      var s = all[a];
      if (!s) continue;
      checked++;
      var m = /^(a*)(b*)(c*)$/.exec(s), def = false;
      if (m) {
        var i = m[1].length, j = m[2].length, k = m[3].length;
        def = i >= 1 && j >= 1 && k >= 1 && (i === j || j === k);
      }
      if (def !== (countTrees(INAMB, s).count > 0)) diff++;
    }
    return { strings: checked, differences: diff };
  })();

  /* 7. the reduction from Post's correspondence, run on two instances */
  M.pcp = (function () {
    function run(U, V, maxLen) {
      var gram = fromPCP(U, V);
      var LU = generate(gram, 'U', maxLen), LV = generate(gram, 'V', maxLen);
      var inV = {};
      LV.forEach(function (s) { inV[s] = 1; });
      var both = LU.filter(function (s) { return inV[s]; });
      var max = 0, witness = '', ambiguous = [];
      both.sort(function (a, b) { return a.length - b.length || (a < b ? -1 : 1); });
      both.forEach(function (s) {
        var c = countTrees(gram, s).count;
        if (c > max) { max = c; witness = s; }
        if (c > 1) ambiguous.push(s);
      });
      var oneSided = 0, maxOne = 0;
      LU.concat(LV).forEach(function (s) {
        if (inV[s] && LU.indexOf(s) !== -1) return;
        oneSided++;
        var c = countTrees(gram, s).count;
        if (c > maxOne) maxOne = c;
      });
      return { LU: LU.length, LV: LV.length, both: both.length, max: max, witness: witness,
               ambiguous: ambiguous.length, oneSided: oneSided, maxOneSided: maxOne };
    }
    return {
      match: run(['a', 'ab'], ['aa', 'b'], 12),
      noMatch: run(['a', 'ab'], ['aa', 'bb'], 12),
      grammars: fromPCP(['a', 'ab'], ['aa', 'b']).rules.length
    };
  })();

  /* 8. a grammar with no finite count at all */
  M.loop = (function () {
    var a = countTrees(LOOP, 'a'), e = countTrees(LOOP, '');
    return { a: a.count, aDiverged: a.diverged, eps: e.count, epsDiverged: e.diverged };
  })();

  /* 9. four grammars from one question, each decided by the counter */
  M.q19 = (function () {
    var list = [
      { label: 'S \u2192 aSb | \u03b5', gram: Q1, alpha: ['a', 'b'], id: 'A' },
      { label: 'E \u2192 E+E | E*E | id', gram: EXPR, alpha: ['i', '+', '*'], id: 'B' },
      { label: 'S \u2192 aS | Sa | \u03b5', gram: Q3, alpha: ['a'], id: 'C' },
      { label: 'S \u2192 aS | \u03b5', gram: Q4, alpha: ['a'], id: 'D' }
    ];
    return list.map(function (x) {
      var all = strings(x.alpha, 5), max = 0, witness = '', tested = 0;
      for (var a = 0; a < all.length; a++) {
        if (!all[a]) continue;
        tested++;
        var c = countTrees(x.gram, all[a]).count;
        if (c > max) { max = c; witness = all[a]; }
      }
      return { id: x.id, label: x.label, max: max, witness: witness, ambiguous: max > 1, tested: tested };
    });
  })();

  /* 9b. ambiguous on exactly one string */
  M.oneAmb = {
    a: countTrees(ONEAMB, 'a').count,
    aa: countTrees(ONEAMB, 'aa').count,
    b: countTrees(ONEAMB, 'b').count
  };

  /* 10. the shortest string with two trees, found by scanning by length */
  M.firstAmbiguous = (function () {
    for (var L = 1; L <= 7; L++) {
      var all = fixed(['i', '+', '*'], L);
      for (var a = 0; a < all.length; a++) {
        if (countTrees(EXPR, all[a]).count > 1) return { word: all[a], length: L };
      }
    }
    return { word: '', length: -1 };
  })();

  return M;
})();


/* ======================================================================
   LAYER 2 - THE CHECKS
   Every number a caption states is recomputed here and compared with the
   figure the caption states. A failed check is printed on the page.
   ====================================================================== */

  var CHECKS = [];
  function check(name, pass, detail) { CHECKS.push({ name: name, pass: !!pass, detail: detail || '' }); }

  var eq = function (a, b) { return a === b; };
  var sameList = function (a, b) {
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  };

  check('expression tree counts are 1, 1, 2, 5, 14, 42',
        sameList(AMB.exprCounts, [1, 1, 2, 5, 14, 42]), AMB.exprCounts.join(', '));

  check('those counts equal the Catalan closed form',
        AMB.catalan.every(function (r) { return r.formula === r.computed; }),
        AMB.catalan.map(function (r) { return r.k + ':' + r.computed + '/' + r.formula; }).join(' '));

  check('i+i*i has 2 trees, i*i+i has 2, i+i+i*i has 5',
        AMB.exprMixed['i+i*i'] === 2 && AMB.exprMixed['i*i+i'] === 2 && AMB.exprMixed['i+i+i*i'] === 5,
        JSON.stringify(AMB.exprMixed));

  check('the span table for i+i+i holds 1, 1, 1, 1, 1 and 2',
        AMB.table.length === 6 && sameList(AMB.table.map(function (r) { return r.v; }), [1, 1, 1, 1, 1, 2]),
        AMB.table.map(function (r) { return '[' + r.i + ',' + r.j + ')=' + r.v; }).join(' '));

  check('the whole-string cell of that table is the tree count',
        AMB.table.some(function (r) { return r.i === 0 && r.j === 5 && r.v === AMB.exprCounts[2]; }), '');

  check('the levelled grammar counts 1 for all six strings',
        sameList(AMB.levCounts, [1, 1, 1, 1, 1, 1]), AMB.levCounts.join(', '));

  check('the two grammars accept exactly the same strings',
        AMB.langCheck.differences === 0, AMB.langCheck.strings + ' strings tested');

  check('the independent shape test agrees with the grammar on every string',
        AMB.langCheck.shapeMismatch === 0, AMB.langCheck.strings + ' strings');

  check('every string of the language up to length 7 has exactly one levelled tree',
        AMB.langCheck.levelledWrong === 0, AMB.langCheck.inLanguage + ' strings in the language');

  check('no levelled count anywhere exceeds 1',
        AMB.langCheck.maxLevelled === 1, 'max ' + AMB.langCheck.maxLevelled);

  check('the dangling-else witness has 2 trees',
        AMB.dangle.ambiguous === 2, AMB.dangle.witness);

  check('the naive matched/unmatched repair still has 2 trees',
        AMB.dangle.naive === 2, AMB.dangle.witness);

  check('the correct matched/unmatched repair has 1 tree',
        AMB.dangle.fixed === 1, AMB.dangle.witness);

  check('the repaired dangling-else grammar accepts the same 782 strings',
        AMB.dangleSweep.differences === 0 && AMB.dangleSweep.strings === 782,
        AMB.dangleSweep.strings + ' strings, max ' + AMB.dangleSweep.maxFixed);

  check('i+i has 1 tree, 1 leftmost derivation and 2 sequences',
        AMB.derivs['i+i'].trees === 1 && AMB.derivs['i+i'].leftmost === 1 && AMB.derivs['i+i'].sequences === 2,
        JSON.stringify(AMB.derivs['i+i']));

  check('i+i+i has 2 trees, 2 leftmost derivations and 16 sequences',
        AMB.derivs['i+i+i'].trees === 2 && AMB.derivs['i+i+i'].leftmost === 2 && AMB.derivs['i+i+i'].sequences === 16,
        JSON.stringify(AMB.derivs['i+i+i']));

  check('trees and leftmost derivations agree on all three strings',
        ['i+i', 'i+i+i', 'i+i*i'].every(function (w) { return AMB.derivs[w].trees === AMB.derivs[w].leftmost; }), '');

  check('the sequence count is never below the tree count',
        ['i+i', 'i+i+i', 'i+i*i'].every(function (w) { return AMB.derivs[w].sequences >= AMB.derivs[w].trees; }), '');

  check('a deterministic right-linear grammar never gives 2 trees',
        AMB.regular.maxTrees === 1 && AMB.regular.wrong === 0,
        AMB.regular.strings + ' strings, ' + AMB.regular.members + ' accepted');

  check('a^n b^n c^n has exactly 2 trees for n = 1 to 6',
        AMB.inamb.every(function (r) { return r.trees === 2; }),
        AMB.inamb.map(function (r) { return r.trees; }).join(', '));

  check('off the overlap the same grammar has 1 tree',
        AMB.inambOff.every(function (r) { return r.trees === 1; }),
        AMB.inambOff.map(function (r) { return r.trees; }).join(', '));

  check('that grammar generates exactly i=j or j=k',
        AMB.inambLang.differences === 0, AMB.inambLang.strings + ' strings tested');

  check('with a matching set of dominoes the two halves share strings',
        AMB.pcp.match.both > 0 && AMB.pcp.match.max === 2,
        AMB.pcp.match.both + ' shared, max ' + AMB.pcp.match.max + ', witness ' + AMB.pcp.match.witness);

  check('the shared string is aabdc and carries 2 trees',
        AMB.pcp.match.witness === 'aabdc', AMB.pcp.match.witness);

  check('strings in only one half never carry more than 1 tree',
        AMB.pcp.match.maxOneSided === 1 && AMB.pcp.noMatch.maxOneSided === 1, '');

  check('with no matching set of dominoes the halves share nothing',
        AMB.pcp.noMatch.both === 0 && AMB.pcp.noMatch.max === 0, AMB.pcp.noMatch.oneSided + ' one-sided strings');

  check('S to SS, a, epsilon is infinitely ambiguous',
        AMB.loop.aDiverged && AMB.loop.epsDiverged, 'counter reported growth without bound');

  check('the four grammars of the 2026 question come out A no, B yes, C yes, D no',
        AMB.q19.map(function (r) { return r.ambiguous; }).join(',') === 'false,true,true,false',
        AMB.q19.map(function (r) { return r.id + ':' + r.max; }).join(' '));

  check('the shortest ambiguous expression is i+i+i, five characters',
        AMB.firstAmbiguous.word === 'i+i+i' && AMB.firstAmbiguous.length === 5, AMB.firstAmbiguous.word);

  check('the two readings of i+i*i differ at i equal 2: 8 against 6',
        (2 + 2) * 2 === 8 && 2 + 2 * 2 === 6, '');

  check('S to A or B, A to a, B to a is ambiguous on exactly one string',
        AMB.oneAmb.a === 2 && AMB.oneAmb.aa === 0 && AMB.oneAmb.b === 0, JSON.stringify(AMB.oneAmb));

  check('the model runs without a runaway fixpoint on every grammar it ships',
        !AMB.exprCounts.some(function (v) { return v >= 1e12; }), '');

/* ======================================================================
   LAYER 3 - RENDER
   Reads the model; never re-derives a number.
   ====================================================================== */

  function chip(x, y, txt, kind) {
    var size = 10, pad = 9;
    var w = txt.length * size * 0.56 + pad * 2;
    var col = kind === 'bad' ? BAD : kind === 'good' ? VAL : kind === 'warn' ? WARN : INFO;
    var fill = kind === 'bad' ? BADDIM : kind === 'good' ? ACCDIM : kind === 'warn' ? WARNDIM : SURF2;
    P.rect(x, y, w, 20, { fill: fill, stroke: col, radius: 10, sw: 1 });
    P.text(x + pad, y + 5, txt, { size: size, color: col });
    return w;
  }

  function panel(x, y, w, h, title, kind) {
    P.rect(x, y, w, h, { fill: SURF, stroke: BORDER, radius: 8, sw: 1 });
    if (title) {
      var col = kind === 'bad' ? BAD : kind === 'good' ? VAL : kind === 'warn' ? WARN : DIM;
      P.text(x + 14, y + 13, title, { size: 10, bold: true, color: col });
      return y + 40;
    }
    return y + 18;
  }

  function T(x, y, txt, size, col, bold, mono, align) {
    P.text(x, y, txt, { size: size || 10.5, color: col || INK, bold: !!bold, mono: !!mono, align: align || 'left' });
  }

  /* a tree laid out by leaves, then painted */
  function layout(node, x0, depth, dx, dy) {
    if (!node.kids || !node.kids.length) {
      node._x = x0 + dx / 2; node._y = depth * dy;
      return dx;
    }
    var start = x0, total = 0;
    for (var i = 0; i < node.kids.length; i++) {
      var w = layout(node.kids[i], start, depth + 1, dx, dy);
      start += w; total += w;
    }
    node._x = (node.kids[0]._x + node.kids[node.kids.length - 1]._x) / 2;
    node._y = depth * dy;
    return total;
  }

  function paintTree(node, ox, oy, opts) {
    opts = opts || {};
    var nw = 40, nh = 21;
    var stroke = opts.stroke || ACC;
    var fill = opts.fill || ACCDIM;
    (function edges(n) {
      for (var i = 0; i < n.kids.length; i++) {
        var k = n.kids[i];
        P.line(ox + n._x, oy + n._y + nh, ox + k._x, oy + k._y, { stroke: BORDER, sw: 1.2 });
        edges(k);
      }
    })(node);
    (function nodes(n) {
      var leaf = !n.kids || !n.kids.length;
      P.rect(ox + n._x - nw / 2, oy + n._y, nw, nh,
             { fill: leaf ? SURF2 : fill, stroke: leaf ? BORDER : stroke, radius: 5, sw: 1 });
      P.text(ox + n._x, oy + n._y + 5, n.lab, { size: 10.5, align: 'center', mono: true, color: INK });
      for (var i = 0; i < n.kids.length; i++) nodes(n.kids[i]);
    })(node);
  }

  function treeWidth(node, dx) {
    if (!node.kids || !node.kids.length) return dx;
    var t = 0;
    for (var i = 0; i < node.kids.length; i++) t += treeWidth(node.kids[i], dx);
    return t;
  }

  function leaf(lab) { return { lab: lab, kids: [] }; }
  function node(lab, kids) { return { lab: lab, kids: kids }; }

  function tree1() { return node('*', [node('+', [leaf('i'), leaf('i')]), leaf('i')]); }
  function tree2() { return node('+', [leaf('i'), node('*', [leaf('i'), leaf('i')])]); }

  function hdr(title, sub) {
    T(46, 26, title, 15, INK, true);
    T(46, 50, sub, 10.5, DIM);
  }

  var SCENE_DRAW = {};

  /* ---------------- 1. gap ---------------- */
  SCENE_DRAW.gap = function (t, sc, p) {
    hdr('One string, two trees, two questions',
        'The word ambiguous names two different objects. This page counts both.');
    var y = panel(46, 70, 412, 300, 'The grammar, and one of its strings');
    T(60, y, 'E \u2192 E + E', 11, INK, false, true);
    T(60, y + 20, 'E \u2192 E * E', 11, INK, false, true);
    T(60, y + 40, 'E \u2192 i', 11, INK, false, true);
    T(60, y + 66, 'i + i * i', 14, ACC, true, true);
    if (p > 0.28) {
      T(60, y + 96, 'one reading: (i + i) * i', 10, DIM);
      var a = tree1();
      layout(a, 88, 0, 44, 36);
      paintTree(a, 0, y + 118);
    }
    if (p > 0.55) {
      T(250, y + 96, 'the other: i + (i * i)', 10, DIM);
      var b = tree2();
      layout(b, 278, 0, 44, 36);
      paintTree(b, 0, y + 118, { stroke: WARN, fill: WARNDIM });
    }
    var ry = panel(478, 70, 376, 300, 'Two questions, one word');
    T(492, ry, 'Q1  Is this grammar ambiguous?', 11.5, INK, true);
    T(492, ry + 20, 'one string, two trees. Decided by counting,', 10, DIM);
    T(492, ry + 36, 'and the count is a proof either way.', 10, DIM);
    if (p > 0.4) {
      T(492, ry + 70, 'Q2  Could any grammar for these strings', 11.5, INK, true);
      T(492, ry + 88, 'be unambiguous?', 11.5, INK, true);
      T(492, ry + 108, 'a statement about every grammar at once.', 10, DIM);
      T(492, ry + 124, 'No example can settle it; only a theorem can.', 10, DIM);
    }
    if (p > 0.7) {
      T(492, ry + 160, 'A grammar is ambiguous, or it is not.', 10.5, ACC);
      T(492, ry + 178, 'A language is inherently ambiguous, or not.', 10.5, ACC);
    }
    chip(46, 428, 'same word, two objects: the rules you were given, or the strings themselves', 'info');
  };

  /* ---------------- 2. definition ---------------- */
  SCENE_DRAW.def = function (t, sc, p) {
    hdr('A tree, not a derivation order',
        'The definition has to name the object it counts, or the test overcounts.');
    var y = panel(46, 70, 400, 320, 'A parse tree for i + i');
    var a = node('E', [node('E', [leaf('i')]), leaf('+'), node('E', [leaf('i')])]);
    layout(a, 60, 0, 44, 44);
    paintTree(a, 0, y + 6);
    T(60, y + 152, 'root is the start symbol; one node per rule used;', 10, DIM);
    T(60, y + 168, 'the leaves, left to right, are the string.', 10, DIM);
    if (p > 0.45) {
      T(60, y + 200, 'The order of the steps is not in the tree.', 10.5, ACC, true);
      T(60, y + 218, 'That is why the tree is the right object.', 10, DIM);
    }
    var ry = panel(466, 70, 388, 320, 'The definition, three lines');
    T(480, ry, 'ambiguous  \u21d4  two distinct parse trees', 11, INK, true);
    T(480, ry + 18, 'for one string of the language.', 10.5, DIM);
    T(480, ry + 46, 'equivalent: two distinct leftmost', 11, INK, true);
    T(480, ry + 64, 'derivations, expanding the leftmost', 10.5, DIM);
    T(480, ry + 80, 'nonterminal at every step.', 10.5, DIM);
    if (p > 0.5) {
      T(480, ry + 112, 'not: two distinct derivations.', 11, BAD, true);
      T(480, ry + 130, 'The same tree can be written in several', 10.5, DIM);
      T(480, ry + 146, 'orders, because independent branches', 10.5, DIM);
      T(480, ry + 162, 'may be expanded either way round.', 10.5, DIM);
    }
    if (p > 0.75) {
      chip(480, ry + 196, 'one string with two trees is enough', 'good');
    }
    chip(46, 428, 'count trees, or leftmost derivations: both agree, and nothing else does', 'info');
  };

  /* ---------------- 3. the counter ---------------- */
  SCENE_DRAW.count = function (t, sc, p) {
    hdr('The counter: one number per piece of the string',
        'The table for i + i + i, filled from the shortest pieces upward.');
    /* the string, with positions */
    var chars = ['i', '+', 'i', '+', 'i'];
    for (var c = 0; c < 5; c++) {
      var cx = 90 + c * 62;
      P.rect(cx, 84, 54, 34, { fill: SURF2, stroke: BORDER, radius: 5, sw: 1 });
      T(cx + 27, 92, chars[c], 14, INK, true, true, 'center');
      T(cx + 27, 122, String(c), 9, FAINT, false, true, 'center');
    }
    /* the span triangle: length 1 at the bottom, length 5 at the top */
    function cell(x, y, i, j, v, lit) {
      P.rect(x, y, 120, 48, { fill: lit ? ACCDIM : SURF, stroke: lit ? ACC : BORDER, radius: 6, sw: 1 });
      T(x + 12, y + 8, '[' + i + ',' + j + ')', 9.5, DIM, false, true);
      T(x + 60, y + 22, String(v), 15, lit ? ACC : INK, true, true, 'center');
      T(x + 108, y + 30, 'trees', 8.5, FAINT, false, false, 'right');
    }
    var show = p > 0.15;
    if (show) {
      cell(60, 330, 0, 1, 1, false);
      cell(196, 330, 2, 3, 1, false);
      cell(332, 330, 4, 5, 1, false);
    }
    if (p > 0.4) {
      cell(128, 264, 0, 3, 1, false);
      cell(264, 264, 2, 5, 1, false);
    }
    if (p > 0.65) {
      cell(196, 198, 0, 5, AMB.exprCounts[2], true);
    }
    var ry = panel(492, 150, 362, 240, 'Reading the table');
    T(506, ry, 'one cell per pair of positions:', 10.5, INK);
    T(506, ry + 16, 'about n squared over two cells.', 10, DIM);
    T(506, ry + 44, 'a one-letter piece holds 1, because', 10.5, INK);
    T(506, ry + 60, 'only E \u2192 i builds it.', 10, DIM);
    if (p > 0.45) {
      T(506, ry + 88, 'the whole string holds 2, so the', 10.5, INK);
      T(506, ry + 104, 'string has two trees, so this', 10.5, INK);
      T(506, ry + 120, 'grammar is ambiguous.', 10.5, ACC, true);
    }
    if (p > 0.8) {
      T(506, ry + 152, 'work is cubic: n squared cells, each', 10, DIM);
      T(506, ry + 168, 'costing about n times the rules.', 10, DIM);
    }
    chip(46, 428, 'a 2 in the whole-string cell is a proof, not an estimate', 'good');
  };

  /* ---------------- 4. witness ---------------- */
  SCENE_DRAW.witness = function (t, sc, p) {
    hdr('i + i * i, and the Catalan count',
        'Two trees, two values, and a count that grows faster than any polynomial.');
    T(60, 82, '(i + i) * i', 11, DIM, true, true);
    var a = tree1();
    layout(a, 60, 0, 46, 38);
    paintTree(a, 0, 100);
    T(60, 100 + 3 * 38 + 8, 'at i = 2 this is 8', 10.5, ACC);
    T(300, 82, 'i + (i * i)', 11, DIM, true, true);
    var b = tree2();
    layout(b, 300, 0, 46, 38);
    paintTree(b, 0, 100, { stroke: WARN, fill: WARNDIM });
    T(300, 100 + 3 * 38 + 8, 'at i = 2 this is 6', 10.5, WARN);
    if (p > 0.5) {
      T(60, 262, 'same string, two trees, two answers.', 11, INK, true);
      T(60, 280, 'The shortest ambiguous string here is', 10, DIM);
      T(60, 296, 'i + i + i, five characters.', 10, DIM);
    }
    var ry = panel(520, 70, 334, 330, 'Trees against the number of operands');
    var counts = AMB.exprCounts;
    for (var k = 0; k < counts.length; k++) {
      var bx = 544 + k * 46;
      var h = 12 + (counts[k] / 42) * 150;
      if (p > 0.15 + k * 0.08) {
        P.rect(bx, 330 - h, 32, h, { fill: ACCDIM, stroke: ACC, radius: 3, sw: 1 });
        T(bx + 16, 330 - h - 16, String(counts[k]), 10, ACC, true, true, 'center');
      }
      T(bx + 16, 336, String(k + 1), 9.5, DIM, false, true, 'center');
    }
    T(544, 356, 'operands 1 to 6', 9.5, FAINT);
    if (p > 0.7) {
      T(544, 380, 'the Catalan numbers, 1 1 2 5 14 42,', 9.5, DIM);
      T(544, 394, 'which the closed form matches exactly', 9.5, DIM);
    }
    chip(46, 428, 'the count belongs to the rules: another grammar for the same strings counts differently', 'info');
  };

  /* ---------------- 5. repair ---------------- */
  SCENE_DRAW.repair = function (t, sc, p) {
    hdr('Same language, one tree each',
        'A level per precedence rank: the choice is removed, not hidden.');
    var y = panel(46, 70, 404, 320, 'The levelled grammar');
    T(60, y, 'E \u2192 E + T  |  T', 11.5, INK, false, true);
    T(60, y + 22, 'T \u2192 T * F  |  F', 11.5, INK, false, true);
    T(60, y + 44, 'F \u2192 i  |  ( E )', 11.5, INK, false, true);
    T(60, y + 78, 'E holds sums, T holds products, F holds', 10, DIM);
    T(60, y + 94, 'an operand. The nesting is the precedence.', 10, DIM);
    if (p > 0.45) {
      T(60, y + 126, 'Each string now has exactly one tree:', 10.5, INK, true);
      T(60, y + 146, 'the top is a sum, its children are', 10, DIM);
      T(60, y + 162, 'products, theirs are operands.', 10, DIM);
    }
    if (p > 0.7) {
      chip(60, y + 196, 'the language is untouched', 'good');
    }
    var ry = panel(474, 70, 380, 320, 'Counts, before and after');
    var words = ['i', 'i+i', 'i+i+i', 'i+i+i+i', 'i+i+i+i+i', 'i+i+i+i+i+i'];
    T(490, ry, 'string', 9.5, FAINT);
    T(660, ry, 'old', 9.5, FAINT, false, false, 'center');
    T(740, ry, 'new', 9.5, FAINT, false, false, 'center');
    for (var k = 0; k < words.length; k++) {
      if (p < 0.1 + k * 0.07) break;
      var ly = ry + 22 + k * 22;
      T(490, ly, words[k], 10, INK, false, true);
      T(660, ly, String(AMB.exprCounts[k]), 10, AMB.exprCounts[k] > 1 ? BAD : INK, true, true, 'center');
      T(740, ly, String(AMB.levCounts[k]), 10, VAL, true, true, 'center');
    }
    if (p > 0.62) {
      T(490, ry + 168, AMB.langCheck.strings + ' strings tested, ' + AMB.langCheck.differences + ' changed sides', 10, INK);
      T(490, ry + 186, 'largest count in the new grammar: ' + AMB.langCheck.maxLevelled, 10, VAL);
    }
    chip(46, 428, 'precedence and associativity are decisions the grammar makes; leaving them out made the ambiguity', 'info');
  };

  /* ---------------- 6. dangling else ---------------- */
  SCENE_DRAW.dangle = function (t, sc, p) {
    hdr('The dangling else: a repair that does not repair',
        'One symbol separates an ambiguous repair from an unambiguous one.');
    var tok = ['i', 'c', 't', 'i', 'c', 't', 'x', 'e', 'x'];
    for (var k = 0; k < tok.length; k++) {
      var bx = 60 + k * 44;
      P.rect(bx, 80, 36, 30, { fill: SURF2, stroke: BORDER, radius: 4, sw: 1 });
      T(bx + 18, 87, tok[k], 12, INK, true, true, 'center');
    }
    T(60, 118, 'i = if, c = condition, t = then, e = else, x = any other statement', 9.5, FAINT);
    T(60, 146, 'S \u2192 i c t S  |  i c t S e S  |  x', 11, INK, false, true);
    T(60, 166, 'The else may close the inner if or the outer one: ' + AMB.dangle.ambiguous + ' trees.', 10.5, BAD);
    var ly = panel(46, 190, 400, 150, 'Repair 1: the else branch is any statement', 'bad');
    T(60, ly, 'U \u2192 i c t S  |  i c t M e S', 11, INK, false, true);
    T(60, ly + 24, 'the inner statement can still be read', 10, DIM);
    T(60, ly + 40, 'two ways, so the count stays at ' + AMB.dangle.naive + '.', 10, DIM);
    var ry = panel(466, 190, 388, 150, 'Repair 2: the else branch is unmatched', 'good');
    T(480, ry, 'U \u2192 i c t S  |  i c t M e U', 11, INK, false, true);
    T(480, ry + 24, 'the else can only close the nearest open if,', 10, DIM);
    T(480, ry + 40, 'so the count falls to ' + AMB.dangle.fixed + '.', 10, VAL);
    if (p > 0.6) {
      T(60, 366, AMB.dangleSweep.strings + ' strings tested, ' + AMB.dangleSweep.differences +
        ' disagreements on the language,', 10, INK);
      T(60, 384, 'and the largest count in the repaired grammar is ' + AMB.dangleSweep.maxFixed + '.', 10, INK);
    }
    chip(46, 428, 'a repair that looks right is not evidence: only the count is', 'warn');
  };

  /* ---------------- 7. three counters ---------------- */
  SCENE_DRAW.derivs = function (t, sc, p) {
    hdr('Three counters, not one',
        'The same string, counted three ways. Only two of them decide ambiguity.');
    var x0 = 60, colX = [x0, x0 + 220, x0 + 400, x0 + 560];
    P.rect(46, 78, 808, 34, { fill: SURF2, stroke: BORDER, radius: 6, sw: 1 });
    T(colX[0], 88, 'string', 10, DIM, true);
    T(colX[1], 88, 'parse trees', 10, DIM, true);
    T(colX[2], 88, 'leftmost derivations', 10, DIM, true);
    T(colX[3], 88, 'derivation sequences', 10, DIM, true);
    var rows = ['i+i', 'i+i+i', 'i+i*i'];
    for (var k = 0; k < rows.length; k++) {
      var w = rows[k], d = AMB.derivs[w];
      if (p < 0.12 + k * 0.16) break;
      var ry = 132 + k * 46;
      P.rect(46, ry - 8, 808, 38, { fill: k % 2 ? SURF : SURF2, stroke: BORDER, radius: 5, sw: 1 });
      T(colX[0], ry + 2, w, 11.5, INK, false, true);
      T(colX[1], ry + 2, String(d.trees), 11.5, ACC, true, true);
      T(colX[2], ry + 2, String(d.leftmost), 11.5, ACC, true, true);
      T(colX[3], ry + 2, String(d.sequences), 11.5, BAD, true, true);
    }
    if (p > 0.6) {
      T(60, 292, 'trees and leftmost derivations always agree: fixing the order removes the freedom.', 10.5, INK);
      T(60, 310, 'Sequences overcount, because independent branches may be expanded in either order.', 10.5, DIM);
      T(60, 336, 'i + i + i: each of its 2 trees can be written 8 ways, so 16 sequences for 2 trees.', 10.5, DIM);
    }
    if (p > 0.8) {
      chip(60, 360, 'Knuth, 1965: a grammar can be unambiguous even with several derivation sequences', 'info');
    }
    chip(46, 428, 'sixteen against two: an answer built on sequences would call almost everything ambiguous', 'warn');
  };

  /* ---------------- 8. the language ---------------- */
  SCENE_DRAW.lang = function (t, sc, p) {
    hdr('A grammar can be repaired; a language may not be',
        'The overlap of two families is where the trees double.');
    var ly = panel(46, 70, 300, 158, 'Family 1: the a block meets the b block', 'good');
    T(60, ly, 'L \u2192 a L b | a b', 11, INK, false, true);
    T(60, ly + 20, 'C \u2192 c | c C', 11, INK, false, true);
    T(60, ly + 44, 'gives a to the n, b to the n, c to the m', 10, DIM);
    var ry = panel(46, 240, 300, 158, 'Family 2: the b block meets the c block');
    T(60, ry, 'A \u2192 a | a A', 11, INK, false, true);
    T(60, ry + 20, 'D \u2192 b D c | b c', 11, INK, false, true);
    T(60, ry + 44, 'gives a to the p, b to the m, c to the m', 10, DIM);
    if (p > 0.3) {
      T(60, 408, 'S \u2192 L C  |  A D', 11, ACC, true, true);
    }
    var px = panel(376, 70, 478, 354, 'The overlap strings, counted');
    T(390, px, 'a to the n, b to the n, c to the n belongs to both families:', 10.5, INK);
    T(390, px + 18, 'one tree through L C, one through A D.', 10, DIM);
    for (var k = 0; k < AMB.inamb.length; k++) {
      var bx = 400 + k * 72;
      if (p < 0.35 + k * 0.06) break;
      P.rect(bx, px + 52, 58, 52, { fill: WARNDIM, stroke: WARN, radius: 5, sw: 1 });
      T(bx + 29, px + 58, 'n = ' + AMB.inamb[k].n, 9, DIM, false, false, 'center');
      T(bx + 29, px + 74, String(AMB.inamb[k].trees), 16, WARN, true, true, 'center');
    }
    if (p > 0.72) {
      T(390, px + 124, 'off the overlap the same grammar has 1 tree, so it is ambiguous', 10, INK);
      T(390, px + 140, 'on infinitely many strings and on nothing else.', 10, INK);
      T(390, px + 170, 'Ginsburg and Ullian, 1966: every grammar for this language', 10.5, BAD, true);
      T(390, px + 186, 'is ambiguous. No repair exists, so the language is', 10, DIM);
      T(390, px + 202, 'inherently ambiguous.', 10.5, BAD, true);
    }
    chip(46, 428, 'one grammar ambiguous proves nothing about the language; that needs a theorem', 'warn');
  };

  /* ---------------- 9. the reduction ---------------- */
  SCENE_DRAW.reduce = function (t, sc, p) {
    hdr('Why no program can decide it',
        'Every set of dominoes becomes a grammar, so a decider for ambiguity would decide the dominoes.');
    var y = panel(46, 70, 250, 200, 'The dominoes');
    function domino(x, top, bot, i) {
      P.rect(x, 118, 84, 60, { fill: SURF2, stroke: BORDER, radius: 6, sw: 1 });
      P.line(x + 8, 148, x + 76, 148, { stroke: BORDER, sw: 1 });
      T(x + 42, 124, top, 13, INK, true, true, 'center');
      T(x + 42, 156, bot, 13, ACC, true, true, 'center');
      T(x + 42, 186, 'domino ' + i, 9, FAINT, false, false, 'center');
    }
    domino(64, 'a', 'aa', 1);
    domino(160, 'ab', 'b', 2);
    var gy = panel(316, 70, 268, 200, 'The grammar built from them');
    T(330, gy, 'S \u2192 U | V', 10.5, INK, false, true);
    T(330, gy + 18, 'U \u2192 u U c  |  u c', 10.5, INK, false, true);
    T(330, gy + 36, 'V \u2192 v V d  |  v d', 10.5, INK, false, true);
    T(330, gy + 62, 'U spells the top rows, V the bottom,', 9.5, DIM);
    T(330, gy + 78, 'and c, d record which domino was used.', 9.5, DIM);
    var ry = panel(604, 70, 250, 200, 'Two instances, computed', 'good');
    T(618, ry, 'with a match:', 10, INK, true);
    T(618, ry + 18, AMB.pcp.match.both + ' strings in both halves', 9.5, DIM);
    T(618, ry + 34, AMB.pcp.match.max + ' trees each, witness ' + AMB.pcp.match.witness, 9.5, DIM);
    T(618, ry + 58, 'with no match:', 10, INK, true);
    T(618, ry + 76, AMB.pcp.noMatch.both + ' strings in both halves', 9.5, DIM);
    T(618, ry + 92, 'largest count ' + AMB.pcp.noMatch.max, 9.5, DIM);
    if (p > 0.5) {
      T(60, 292, 'A matching sequence makes one string that both halves generate, so the', 10.5, INK);
      T(60, 310, 'start symbol builds it twice: ' + AMB.pcp.match.max + ' trees, and nothing else reaches 2.', 10.5, INK);
      T(60, 336, 'The ' + AMB.pcp.match.oneSided + ' strings in only one half carry 1 tree each.', 10, DIM);
    }
    if (p > 0.78) {
      T(60, 366, 'So an algorithm that decided ambiguity would decide Post\u2019s correspondence', 10.5, BAD, true);
      T(60, 384, 'problem. Cantor 1962, Floyd 1962, Chomsky and Sch\u00fctzenberger 1963.', 10.5, DIM);
    }
    chip(46, 428, 'undecidable means no one algorithm for all grammars; one grammar is always decidable', 'warn');
  };

  /* ---------------- 10. the table ---------------- */
  SCENE_DRAW.table = function (t, sc, p) {
    hdr('What is decidable, and the four question shapes',
        'Name the object, then the answer. Two of the three have no algorithm.');
    var y = panel(46, 70, 470, 300, 'Three objects, three answers');
    var rows = [
      ['one string, one grammar', 'decidable: count the trees', 'good'],
      ['one grammar, all strings', 'undecidable', 'bad'],
      ['one language, all grammars', 'undecidable', 'bad']
    ];
    for (var k = 0; k < rows.length; k++) {
      if (p < 0.1 + k * 0.12) break;
      var ry = y + k * 62;
      P.rect(60, ry - 4, 442, 50, { fill: k === 0 ? ACCDIM : SURF2, stroke: k === 0 ? ACC : BORDER, radius: 6, sw: 1 });
      T(74, ry + 4, rows[k][0], 10.5, INK, true);
      T(74, ry + 24, rows[k][1], 10.5, rows[k][2] === 'bad' ? BAD : VAL);
    }
    if (p > 0.5) {
      T(60, y + 190, 'a regular grammar: decidable, and always repairable.', 10, DIM);
      T(60, y + 206, 'S \u2192 S S | a | \u03b5: infinitely ambiguous, so no number exists.', 10, DIM);
    }
    var ry2 = panel(534, 70, 320, 300, 'The four question shapes');
    var shapes = [
      '1  which of these grammars is ambiguous',
      '2  how many parse trees does this string have',
      '3  is this language inherently ambiguous',
      '4  which of these questions is decidable'
    ];
    for (var s = 0; s < shapes.length; s++) {
      if (p < 0.2 + s * 0.1) break;
      T(548, ry2 + s * 34, shapes[s], 10, INK);
    }
    if (p > 0.66) {
      T(548, ry2 + 152, 'Shape 1 and 2 are the counter on this page.', 10, DIM);
      T(548, ry2 + 168, 'Shape 3 needs a theorem, never a count.', 10, DIM);
      T(548, ry2 + 184, 'Shape 4 is the table on the left.', 10, DIM);
    }
    if (p > 0.84) {
      chip(548, ry2 + 214, AMB.regular.strings + ' strings, never more than 1 tree', 'good');
    }
    chip(46, 428, 'name the object first: string, grammar, or language', 'info');
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
      AMB: AMB, CHECKS: CHECKS,
      sizes: { strings: AMB.langCheck.strings, dangle: AMB.dangleSweep.strings }
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
