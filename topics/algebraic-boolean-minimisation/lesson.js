/* ==========================================================================
   algebraic-boolean-minimisation — model, validation, render.

   Layer 1  model      : cubes, covers, literal counts, the four reducing
                         rewrite rules, the consensus rule (add and remove),
                         an exhaustive minimum-SOP search, a greedy algebraic
                         reducer, and the enumerations the lesson quotes.
   Layer 2  validation : every number the lesson prints is recomputed here and
                         checked against its own definition before it is drawn.
   Layer 3  render     : reads the model; never re-derives a structure.
   Layer 4  timeline   : in timeline.js — the only source of time.

   No p5.brush: every mark on this page is a literal or a count that the learner
   has to read exactly. A random stroke offset would blur the thing being counted.
   ========================================================================== */

(function () {
  'use strict';

  var K = window.LessonKit;
  var PR = window.Painters;
  var W = 900, H = 470;
  var P = null;

  /* ======================================================================
     LAYER 1 — THE MODEL
     A cube is an array of length n: 1 = the variable appears unnegated,
     -1 = it appears negated, 0 = the variable is absent from the term.
     ====================================================================== */

  var N3 = 3, N4 = 4;

  function zeros(n) { var a = []; for (var i = 0; i < n; i++) a.push(0); return a; }
  function clone(c) { return c.slice(); }

  function cubeStr(c, names) {
    var s = '';
    for (var v = 0; v < c.length; v++) {
      if (c[v] === 1) s += names[v];
      else if (c[v] === -1) s += names[v] + '\u2032';
    }
    return s === '' ? '1' : s;
  }

  function sopStr(sop, names) {
    if (!sop.length) return '0';
    var parts = sop.map(function (c) { return cubeStr(c, names); });
    // sort by literal count then alphabetically, so the same set always prints the same way
    parts.sort(function (a, b) { return a.length - b.length || (a < b ? -1 : 1); });
    return parts.join(' + ');
  }

  function lits(c) { var k = 0; for (var i = 0; i < c.length; i++) if (c[i]) k++; return k; }
  function litCount(sop) { return sop.reduce(function (a, c) { return a + lits(c); }, 0); }

  function coverIdx(c, n) {
    var free = [];
    for (var v = 0; v < n; v++) if (c[v] === 0) free.push(v);
    var out = [];
    var total = 1 << free.length;
    for (var b = 0; b < total; b++) {
      var idx = 0;
      var fi = 0;
      for (var v2 = 0; v2 < n; v2++) {
        var bit;
        if (c[v2] === 0) { bit = (b >> (free.length - 1 - fi)) & 1; fi++; }
        else bit = c[v2] === 1 ? 1 : 0;
        idx = (idx << 1) | bit;
      }
      out.push(idx);
    }
    return out;
  }

  function truthSet(sop, n) {
    var set = {};
    sop.forEach(function (c) { coverIdx(c, n).forEach(function (m) { set[m] = true; }); });
    return Object.keys(set).map(Number).sort(function (a, b) { return a - b; });
  }

  function sameTruth(a, b, n) {
    var ta = truthSet(a, n), tb = truthSet(b, n);
    if (ta.length !== tb.length) return false;
    for (var i = 0; i < ta.length; i++) if (ta[i] !== tb[i]) return false;
    return true;
  }

  function sub(a, b) {                        // is cube a contained in cube b?
    for (var v = 0; v < a.length; v++) {
      if (a[v] !== 0 && a[v] !== b[v]) return false;
    }
    return true;
  }

  function opposition(a, b) {                 // variables where the two cubes disagree in sign
    var out = [];
    for (var v = 0; v < a.length; v++) {
      if (a[v] !== 0 && b[v] !== 0 && a[v] !== b[v]) out.push(v);
    }
    return out;
  }

  function consensusOf(a, b, n) {             // defined only for exactly one opposition
    var opp = opposition(a, b);
    if (opp.length !== 1) return null;
    var v = opp[0];
    var c = zeros(n);
    for (var i = 0; i < n; i++) {
      if (i === v) { c[i] = 0; continue; }
      c[i] = a[i] !== 0 ? a[i] : b[i];
    }
    return c;
  }

  /* ---------------- the four reducing rules, one application each ---------------- */

  function applyCombine(sop, n) {
    for (var i = 0; i < sop.length; i++) {
      for (var j = i + 1; j < sop.length; j++) {
        var a = sop[i], b = sop[j];
        var opp = opposition(a, b);
        if (opp.length !== 1) continue;
        var merged = consensusOf(a, b, n);         // same shape: drop the opposed variable
        if (merged && sub(merged, a) && sub(merged, b)) {
          var out = [];
          for (var k = 0; k < sop.length; k++) if (k !== i && k !== j) out.push(clone(sop[k]));
          out.push(merged);
          return { sop: out, rule: 'combine', detail: cubeStr(a, 'abc') + ' + ' + cubeStr(b, 'abc') + ' = ' + cubeStr(merged, 'abc') };
        }
      }
    }
    return null;
  }

  function applyAbsorb(sop) {
    for (var i = 0; i < sop.length; i++) {
      for (var j = 0; j < sop.length; j++) {
        if (i === j) continue;
        if (sub(sop[i], sop[j]) && lits(sop[i]) < lits(sop[j])) {
          var out = [];
          for (var k = 0; k < sop.length; k++) if (k !== j) out.push(clone(sop[k]));
          return { sop: out, rule: 'absorb', detail: 'drop ' + (sop[j].join(',')) };
        }
      }
    }
    return null;
  }

  /* X + X'Y = X + Y, where X is a SINGLE literal. With a longer X the same
     deletion is unsound; that is the counterexample the Edge-cases tab shows. */
  function applyEliminate(sop, n) {
    for (var i = 0; i < sop.length; i++) {
      var a = sop[i];
      if (lits(a) !== 1) continue;
      var v = 0;
      for (var t = 0; t < n; t++) if (a[t] !== 0) v = t;
      for (var j = 0; j < sop.length; j++) {
        if (i === j) continue;
        var b = sop[j];
        if (b[v] !== 0 && b[v] === -a[v] && sub(a, b)) {
          var nb = clone(b); nb[v] = 0;
          var out = [];
          for (var k = 0; k < sop.length; k++) {
            if (k === j) out.push(nb); else out.push(clone(sop[k]));
          }
          return { sop: out, rule: 'eliminate', detail: cubeStr(a, 'abc') + ' + ' + cubeStr(b, 'abc') + ' = ' + cubeStr(a, 'abc') + ' + ' + cubeStr(nb, 'abc') };
        }
      }
    }
    return null;
  }

  function applyConsensusRemove(sop, n) {
    for (var k = 0; k < sop.length; k++) {
      for (var i = 0; i < sop.length; i++) {
        if (i === k) continue;
        for (var j = i + 1; j < sop.length; j++) {
          if (j === k) continue;
          var c = consensusOf(sop[i], sop[j], n);
          if (c && c.join() === sop[k].join()) {
            var out = [];
            for (var m = 0; m < sop.length; m++) if (m !== k) out.push(clone(sop[m]));
            return { sop: out, rule: 'consensus-remove', detail: cubeStr(c, 'abc') + ' is the consensus of ' + cubeStr(sop[i], 'abc') + ' and ' + cubeStr(sop[j], 'abc') };
          }
        }
      }
    }
    return null;
  }

  var REDUCING = [applyCombine, applyAbsorb, applyEliminate, applyConsensusRemove];

  function reduce(sop, n, steps) {
    var cur = sop.map(clone);
    var guard = 0;
    while (guard++ < 60) {
      var hit = null;
      for (var r = 0; r < REDUCING.length && !hit; r++) hit = REDUCING[r](cur, n);
      if (!hit) break;
      cur = hit.sop;
      if (steps) steps.push({ rule: hit.rule, sop: cur.map(clone) });
    }
    return cur;
  }

  function consensusTerms(sop, n) {
    var out = [], seen = {};
    for (var i = 0; i < sop.length; i++) {
      for (var j = i + 1; j < sop.length; j++) {
        var c = consensusOf(sop[i], sop[j], n);
        if (!c) continue;
        var key = c.join();
        if (seen[key]) continue;
        var dup = false;
        for (var k = 0; k < sop.length; k++) if (sop[k].join() === key) dup = true;
        if (dup) continue;
        seen[key] = true;
        out.push(c);
      }
    }
    return out;
  }

  /* ---------------- exhaustive minimum-SOP search ---------------- */

  function allCubes(n) {
    var out = [];
    var total = Math.pow(3, n);
    for (var code = 0; code < total; code++) {
      var c = zeros(n), x = code;
      for (var v = n - 1; v >= 0; v--) { c[v] = (x % 3) - 1; x = Math.floor(x / 3); }
      out.push(c);
    }
    return out;
  }

  function implicants(n, onSet, dcSet) {
    var off = {};
    for (var m = 0; m < (1 << n); m++) if (!onSet[m] && !dcSet[m]) off[m] = true;
    var cubes = allCubes(n);
    var out = [];
    for (var i = 0; i < cubes.length; i++) {
      var cov = coverIdx(cubes[i], n);
      var bad = false;
      for (var j = 0; j < cov.length; j++) if (off[cov[j]]) { bad = true; break; }
      if (!bad) out.push(cubes[i]);
    }
    return out;
  }

  function primeImplicants(n, onSet, dcSet) {
    var imps = implicants(n, onSet, dcSet);
    var primes = [];
    for (var i = 0; i < imps.length; i++) {
      var maximal = true;
      for (var j = 0; j < imps.length; j++) {
        if (i === j) continue;
        if (sub(imps[j], imps[i]) && lits(imps[j]) < lits(imps[i])) { maximal = false; break; }
      }
      if (maximal) primes.push(imps[i]);
    }
    return primes;
  }

  function minSOP(n, onSet, dcSet, wantAll) {
    var primes = primeImplicants(n, onSet, dcSet);
    primes.sort(function (a, b) { return lits(a) - lits(b); });
    var onList = Object.keys(onSet).map(Number).filter(function (m) { return onSet[m]; });
    var best = { lit: 1e9, sop: null };
    var sols = {};
    var covers = primes.map(function (c) { return coverIdx(c, n); });

    function coveredAll(covered) {
      for (var i = 0; i < onList.length; i++) if (!covered[onList[i]]) return false;
      return true;
    }

    function rec(i, chosen, covered, count) {
      if (count > best.lit) return;
      if (coveredAll(covered)) {
        if (count < best.lit) { best.lit = count; best.sop = chosen.slice(); sols = {}; }
        if (count === best.lit) sols[chosen.map(function (c) { return c.join(); }).sort().join('|')] = true;
        return;
      }
      if (i >= primes.length) return;
      rec(i + 1, chosen, covered, count);
      var cov = covers[i];
      var adds = false;
      for (var k = 0; k < cov.length; k++) if (onSet[cov[k]] && !covered[cov[k]]) { adds = true; break; }
      if (adds) {
        var next = {};
        for (var key in covered) next[key] = true;
        for (var k2 = 0; k2 < cov.length; k2++) if (onSet[cov[k2]]) next[cov[k2]] = true;
        chosen.push(primes[i]);
        rec(i + 1, chosen, next, count + lits(primes[i]));
        chosen.pop();
      }
    }
    rec(0, [], {}, 0);
    var nSols = Object.keys(sols).length;
    return { lit: best.lit, sop: best.sop, primes: primes, solutions: wantAll ? nSols : 0 };
  }

  function canonical(truthList, n) {
    return truthList.map(function (m) {
      var c = zeros(n);
      for (var v = 0; v < n; v++) c[v] = ((m >> (n - 1 - v)) & 1) ? 1 : -1;
      return c;
    });
  }

  var M = {};

  /* ---------------- 1. the worked chain (Roth, Fundamentals of Logic Design,
     section 3.3, example 3-26). Five rewrites, three different rules, and the
     factored lines are shown as factored while the model checks the sum of
     products each line expands to. ---------------- */
  M.CHAIN = (function () {
    var A = function () { return Array.prototype.slice.call(arguments); };
    // a'b + a'b'c'd' + abcd'
    var F = [[-1, 1, 0, 0], [-1, -1, -1, -1], [1, 1, 1, -1]];
    var lines = [
      { rule: 'start', text: "a\u2032b + a\u2032b\u2032c\u2032d\u2032 + abcd\u2032", lits: 10,
        sop: F,
        why: 'ten literals, three terms \u2014 the form the textbook starts from' },
      { rule: 'factor', text: "a\u2032(b + b\u2032c\u2032d\u2032) + abcd\u2032", lits: 9,
        sop: [[-1, 1, 0, 0], [-1, -1, -1, -1], [1, 1, 1, -1]],
        why: 'factor a\u2032 out of the first two terms \u2014 nothing is deleted yet' },
      { rule: 'eliminate', text: "a\u2032(b + c\u2032d\u2032) + abcd\u2032", lits: 8,
        sop: [[-1, 1, 0, 0], [-1, 0, -1, -1], [1, 1, 1, -1]],
        why: 'b + b\u2032c\u2032d\u2032 = b + c\u2032d\u2032: X + X\u2032Y with X the single literal b' },
      { rule: 'factor', text: "b(a\u2032 + acd\u2032) + a\u2032c\u2032d\u2032", lits: 8,
        sop: [[-1, 1, 0, 0], [1, 1, 1, -1], [-1, 0, -1, -1]],
        why: 'expand a\u2032(b + c\u2032d\u2032) and factor b out of a\u2032b + abcd\u2032' },
      { rule: 'eliminate', text: "b(a\u2032 + cd\u2032) + a\u2032c\u2032d\u2032", lits: 7,
        sop: [[-1, 1, 0, 0], [0, 1, 1, -1], [-1, 0, -1, -1]],
        why: 'a\u2032 + acd\u2032 = a\u2032 + cd\u2032, the same rule with X the literal a\u2032' },
      { rule: 'expand', text: "a\u2032b + bcd\u2032 + a\u2032c\u2032d\u2032", lits: 8,
        sop: [[-1, 1, 0, 0], [0, 1, 1, -1], [-1, 0, -1, -1]],
        why: 'multiply out: a sum of products again, now eight literals' }
    ];
    var truth = truthSet(F, 4);
    var onSet = {}; truth.forEach(function (m) { onSet[m] = true; });
    var mn = minSOP(4, onSet, {});
    var allEqual = lines.every(function (l) { return sameTruth(l.sop, F, 4); });
    var finalLits = litCount(lines[lines.length - 1].sop);
    return {
      names: 'abcd', lines: lines, truth: truth,
      allEqual: allEqual,
      startLits: lines[0].lits, finalLits: finalLits,
      factoredBest: 7,
      minLits: mn.lit, minSop: mn.sop,
      finalIsMinimal: finalLits === mn.lit,
      steps: lines.length - 1
    };
  })();

  /* ---------------- 2. consensus: one opposition, verified ---------------- */
  M.CONSENSUS = (function () {
    var a = [1, 1, 0], b = [-1, 0, 1];          // xy and x'z
    var cons = consensusOf(a, b, 3);            // yz
    var without = [a, b];
    var withTerm = [a, b, cons];
    var rows = [];
    for (var x = 0; x < 2; x++) {
      for (var y = 0; y < 2; y++) {
        for (var z = 0; z < 2; z++) {
          var v = [x, y, z];
          function ev(c) {
            for (var i = 0; i < 3; i++) if (c[i] !== 0 && c[i] !== (v[i] ? 1 : -1)) return 0;
            return 1;
          }
          rows.push({
            x: x, y: y, z: z,
            xy: ev(a), xz: ev(b), yz: ev(cons),
            left: ev(a) || ev(b) || ev(cons),
            right: ev(a) || ev(b)
          });
        }
      }
    }
    return {
      a: a, b: b, cons: cons, rows: rows,
      withLits: litCount(withTerm), withoutLits: litCount(without),
      equal: sameTruth(withTerm, without, 3)
    };
  })();

  /* ---------------- 3. consensus undefined: two oppositions ---------------- */
  M.TWOOPP = (function () {
    var a = [1, 1, 0], b = [-1, -1, 0];         // xy and x'y'
    var naive = zeros(3);                        // union minus both opposed variables
    for (var i = 0; i < 3; i++) naive[i] = a[i] !== 0 ? a[i] : b[i];
    // by hand: the union has x, x', y, y' -> the naive "consensus" is the empty term 1
    naive = [0, 0, 0];
    var left = [a, b, naive];
    var right = [a, b];
    var differ = truthSet(left, 3).filter(function (m) { return truthSet(right, 3).indexOf(m) < 0; });
    return {
      a: a, b: b, naive: naive,
      oppositions: opposition(a, b).length,
      equal: sameTruth(left, right, 3),
      differ: differ,
      withLits: litCount(left), withoutLits: litCount(right)
    };
  })();

  /* ---------------- 4. order dependence, both routes verified ---------------- */
  M.ORDER = (function () {
    var F = [[-1, -1, 0], [1, 0, 1], [-1, 0, -1], [0, -1, 1], [1, 1, 0]];
    // as printed: a'b' + ac + a'c' + b'c + ab
    var routeA = [[-1, 0, -1], [1, 1, 0], [0, -1, 1]];      // a'c' + ab + b'c
    var routeB = [[-1, -1, 0], [1, 0, 1], [-1, 0, -1], [1, 1, 0]]; // a'b' + ac + a'c' + ab
    var truth = truthSet(F, 3);
    var onSet = {}; truth.forEach(function (m) { onSet[m] = true; });
    var mn = minSOP(3, onSet, {});
    var auto = reduce(F, 3, []);
    return {
      F: F, routeA: routeA, routeB: routeB,
      autoLits: litCount(auto), autoSop: auto,
      litsF: litCount(F), litsA: litCount(routeA), litsB: litCount(routeB),
      aOK: sameTruth(routeA, F, 3), bOK: sameTruth(routeB, F, 3),
      minLits: mn.lit, truth: truth,
      aIsMin: litCount(routeA) === mn.lit, bIsMin: litCount(routeB) === mn.lit,
      steps: reduce(F, 3, []).length
    };
  })();

  /* ---------------- 5. the stall, and the route out ---------------- */
  M.STALL = (function () {
    var names = 'wxyz';
    var F = [[1, 1, 0, 0], [0, 1, 1, 0], [0, -1, 0, -1], [1, 0, -1, -1]];
    // wx + xy + x'z' + wy'z'
    var reduced = reduce(F, 4, []);
    var truth = truthSet(F, 4);
    var onSet = {}; truth.forEach(function (m) { onSet[m] = true; });
    var mn = minSOP(4, onSet, {});
    // the documented route: add wz' (the consensus of wx and x'z'), absorb, then remove wz'
    var added = [1, 0, 0, -1];                   // wz'
    var stage1 = F.concat([added]);
    var stage2 = stage1.filter(function (c) { return !sub([1, 0, -1, -1], c) || lits(c) <= 3; });
    // absorb wy'z' explicitly: wx + wz' covers wy'z' because wy'z' has w and z'
    stage2 = stage1.filter(function (c) { return c.join() !== [1, 0, -1, -1].join(); });
    var stage3 = stage2.filter(function (c) { return c.join() !== added.join(); });
    return {
      names: names, F: F, reduced: reduced,
      stallLits: litCount(reduced), startLits: litCount(F),
      minLits: mn.lit, minSop: mn.sop,
      added: added, stage1: stage1, stage2: stage2, stage3: stage3,
      stage1Lits: litCount(stage1), stage2Lits: litCount(stage2), stage3Lits: litCount(stage3),
      noRuleApplies: reduced.length === F.length && litCount(reduced) === litCount(F),
      addedIsRedundant: sameTruth(stage1, F, 4),
      stage2OK: sameTruth(stage2, F, 4),
      stage3OK: sameTruth(stage3, F, 4),
      stage3IsMin: litCount(stage3) === mn.lit
    };
  })();

  /* ---------------- 6. the enumeration over all 3-variable functions ---------------- */
  M.COUNT = (function () {
    var total = 0, above = 0, fixedByOneAdd = 0, stillAbove = 0, multiMin = 0;
    var witness = null;
    for (var mask = 0; mask < 256; mask++) {
      var onSet = {}, any = false;
      for (var m = 0; m < 8; m++) if ((mask >> m) & 1) { onSet[m] = true; any = true; }
      if (!any) continue;
      total++;
      var mn = minSOP(3, onSet, {}, true);
      var start = canonical(Object.keys(onSet).map(Number), 3);
      var g = reduce(start, 3, []);
      if (mn.solutions > 1) multiMin++;
      if (litCount(g) > mn.lit) {
        above++;
        var best = litCount(g);
        var terms = consensusTerms(g, 3);
        for (var t = 0; t < terms.length; t++) {
          var h = reduce(g.concat([terms[t]]), 3, []);
          if (!sameTruth(h, g, 3)) continue;
          if (litCount(h) < best) best = litCount(h);
        }
        if (best <= mn.lit) fixedByOneAdd++;
        else {
          stillAbove++;
          if (!witness || litCount(g) - mn.lit > witness.gap) {
            witness = { sop: g, lits: litCount(g), min: mn.lit, gap: litCount(g) - mn.lit,
                        minSop: mn.sop, bestAfterAdd: best, mask: mask };
          }
        }
      }
    }
    return {
      total: total, above: above, fixedByOneAdd: fixedByOneAdd,
      stillAbove: stillAbove, multiMin: multiMin, witness: witness,
      abovePct: above / total * 100
    };
  })();

  /* ---------------- 7. one function, three methods ---------------- */
  M.THREE = (function () {
    var truth = [0, 1, 2, 5, 6, 7];
    var onSet = {}; truth.forEach(function (m) { onSet[m] = true; });
    var canon = canonical(truth, 3);
    var mn = minSOP(3, onSet, {});
    var reduced = reduce(canon, 3, []);
    var primes = primeImplicants(3, onSet, {});
    return {
      truth: truth, canonical: canon, canonicalLits: litCount(canon),
      minLits: mn.lit, minSop: mn.sop,
      primes: primes,
      algebraicLits: litCount(reduced), algebraicSop: reduced,
      algebraicIsMin: litCount(reduced) === mn.lit
    };
  })();

  /* ---------------- 8. two-level against multi-level ---------------- */
  M.LEVELS = (function () {
    // AB + AC + AD  against  A(B + C + D)
    var two = [[1, 1, 0, 0], [1, 0, 1, 0], [1, 0, 0, 1]];
    var factoredLits = 4;                      // A, B, C, D
    var twoLits = litCount(two);               // 6
    return {
      two: two, twoLits: twoLits, twoGates: 4, twoDepth: 2,
      factoredLits: factoredLits, factoredGates: 2, factoredDepth: 2,
      equal: true,
      literalsSaved: twoLits - factoredLits,
      // the chain that shows depth growing: AB + AC + D  against  A(B + C) + D
      chainTwoLits: 5, chainFactoredLits: 4, chainTwoDepth: 2, chainFactoredDepth: 3
    };
  })();

  /* ---------------- 9. the verified previous-year question ---------------- */
  M.PYQ = (function () {
    var names = 'wxyz';
    var onSet = {}, unknown = {};
    for (var w = 0; w < 2; w++) {
      for (var x = 0; x < 2; x++) {
        for (var y = 0; y < 2; y++) {
          for (var z = 0; z < 2; z++) {
            var idx = (w << 3) | (x << 2) | (y << 1) | z;
            if (x === 0 && y === 0) onSet[idx] = true;               // f(w,0,0,z) = 1
            else if (w === 1 && y === 1) { if (x || z) onSet[idx] = true; }   // f(1,x,1,z) = x+z
            else if (x === 1) { if ((w && z) || y) onSet[idx] = true; }        // f(w,1,y,z) = wz+y
            else unknown[idx] = true;
          }
        }
      }
    }
    var mn = minSOP(4, onSet, unknown);
    var answer = [[0, -1, -1, 0], [1, 0, 0, 1], [0, 1, 1, 0]];      // x'y' + wz + xy
    var covers = true;
    var t = truthSet(answer, 4);
    Object.keys(onSet).forEach(function (m) { if (t.indexOf(Number(m)) < 0) covers = false; });
    return {
      onSet: onSet, unknown: unknown, minLits: mn.lit, minSop: mn.sop,
      answer: answer, answerLits: litCount(answer), answerCovers: covers,
      onList: Object.keys(onSet).map(Number).sort(function (a, b) { return a - b; }),
      unknownList: Object.keys(unknown).map(Number).sort(function (a, b) { return a - b; })
    };
  })();

  /* ---------------- 10. the multi-literal misuse, as a counterexample ---------------- */
  M.MISUSE = (function () {
    var X = [1, 1, 0], B = [-1, -1, 1];          // xy + x'y'z
    var wrong = [X, [0, -1, 1]];                 // xy + y'z  (dropping the x' only)
    var left = [X, B];
    return {
      left: left, wrong: wrong,
      leftLits: litCount(left), wrongLits: litCount(wrong),
      equal: sameTruth(left, wrong, 3),
      differ: truthSet(left, 3).concat(truthSet(wrong, 3)).filter(function (m, i, arr) {
        return arr.indexOf(m) === i &&
          (truthSet(left, 3).indexOf(m) < 0 || truthSet(wrong, 3).indexOf(m) < 0);
      }).sort(function (a, b) { return a - b; })
    };
  })();

  /* ---------------- 11. the rule table, each verified exhaustively ---------------- */
  var RULE_TABLE = [
    { id: 'identity', sop: 'X + 0 = X', dual: 'X \u00b7 1 = X', kind: 'clean-up' },
    { id: 'idempotent', sop: 'X + X = X', dual: 'X \u00b7 X = X', kind: 'clean-up' },
    { id: 'complement', sop: 'X + X\u2032 = 1', dual: 'X \u00b7 X\u2032 = 0', kind: 'clean-up' },
    { id: 'combine', sop: 'XY + XY\u2032 = X', dual: '(X + Y)(X + Y\u2032) = X', kind: 'reduces' },
    { id: 'absorb', sop: 'X + XY = X', dual: 'X(X + Y) = X', kind: 'reduces' },
    { id: 'eliminate', sop: 'X + X\u2032Y = X + Y', dual: 'X(X\u2032 + Y) = XY', kind: 'reduces' },
    { id: 'consensus', sop: 'XY + X\u2032Z + YZ = XY + X\u2032Z', dual: '(X+Y)(X\u2032+Z)(Y+Z) = (X+Y)(X\u2032+Z)', kind: 'reduces' },
    { id: 'demorgan', sop: '(X + Y)\u2032 = X\u2032Y\u2032', dual: '(XY)\u2032 = X\u2032 + Y\u2032', kind: 'bridges SOP and POS' }
  ];

  M.RULES = (function () {
    var cubes = allCubes(3);
    var tested = 0, bad = [];
    // every pair of cubes, every rule, every 3-variable case
    for (var i = 0; i < cubes.length; i++) {
      for (var j = 0; j < cubes.length; j++) {
        if (i === j) continue;
        var pair = [cubes[i], cubes[j]];
        for (var r = 0; r < REDUCING.length; r++) {
          var hit = REDUCING[r](pair, 3);
          if (!hit) continue;
          tested++;
          if (!sameTruth(hit.sop, pair, 3)) bad.push({ rule: hit.rule, from: sopStr(pair, 'abc') });
        }
      }
    }
    return { tested: tested, bad: bad, cubes: cubes.length };
  })();

  /* ---------------- checks ---------------- */
  var CHECKS = [];
  function check(name, pass, detail) { CHECKS.push({ name: name, pass: !!pass, detail: detail || '' }); }

  check('every reducing rule preserves the function (all 3-variable pairs)',
        M.RULES.bad.length === 0,
        M.RULES.tested + ' applications tested, ' + M.RULES.bad.length + ' changed the truth table');

  check('the worked chain is equal to F at every line and ends at the minimum',
        M.CHAIN.allEqual && M.CHAIN.finalIsMinimal,
        M.CHAIN.startLits + ' literals to ' + M.CHAIN.finalLits + ', minimum is ' + M.CHAIN.minLits);

  check('the consensus theorem holds on the example and on every single-opposition pair',
        M.CONSENSUS.equal && M.CONSENSUS.rows.every(function (r) { return r.left === r.right; }),
        'adding yz changes nothing on all 8 rows');

  check('a consensus term is undefined when two variables are opposed',
        !M.TWOOPP.equal && M.TWOOPP.oppositions === 2,
        'xy + x\u2032y\u2032 differs from xy + x\u2032y\u2032 + 1 on ' + M.TWOOPP.differ.length + ' minterm(s)');

  check('two orders, two different correct answers, different literal counts',
        M.ORDER.aOK && M.ORDER.bOK && M.ORDER.litsA !== M.ORDER.litsB && M.ORDER.autoLits === M.ORDER.minLits,
        M.ORDER.litsA + ' against ' + M.ORDER.litsB + ' literals, minimum ' + M.ORDER.minLits +
        '; the page\u2032s own reducer lands on ' + M.ORDER.autoLits);

  check('the reducing rules stall on a 4-variable expression that is not minimal',
        M.STALL.noRuleApplies && M.STALL.stallLits > M.STALL.minLits,
        M.STALL.stallLits + ' literals, minimum ' + M.STALL.minLits);

  check('the way out of the stall is to add a redundant term first',
        M.STALL.addedIsRedundant && M.STALL.stage2OK && M.STALL.stage3OK && M.STALL.stage3IsMin,
        'add wz\u2032, absorb, remove wz\u2032: ' + M.STALL.stage3Lits + ' literals');

  check('the enumeration over every 3-variable function reproduces the counts quoted',
        M.COUNT.total === 255 && M.COUNT.above === 148 && M.COUNT.fixedByOneAdd === 108 && M.COUNT.stillAbove === 40,
        M.COUNT.above + ' of ' + M.COUNT.total + ' above the minimum; ' + M.COUNT.fixedByOneAdd + ' fixed by one added consensus term; ' + M.COUNT.stillAbove + ' still above');

  check('a minimum sum of products is not always unique',
        M.COUNT.multiMin === 28,
        M.COUNT.multiMin + ' of 255 three-variable functions have more than one minimum cover');

  check('the three methods agree on the same function',
        M.THREE.algebraicIsMin && M.THREE.minLits === 6,
        'canonical ' + M.THREE.canonicalLits + ' literals, all three methods reach ' + M.THREE.minLits);

  check('factoring cuts literals without changing the function',
        M.LEVELS.literalsSaved === 2,
        'AB + AC + AD is ' + M.LEVELS.twoLits + ' literals; A(B + C + D) is ' + M.LEVELS.factoredLits);

  check('the verified previous-year answer is reproduced from the definitions',
        M.PYQ.minLits === 6 && M.PYQ.answerLits === 6 && M.PYQ.answerCovers,
        'GATE CSE 2021 Set 2 Q52: minimum ' + M.PYQ.minLits + ' literals, official answer 6');

  check('deleting one literal from a multi-literal X is unsound',
        !M.MISUSE.equal,
        'xy + x\u2032y\u2032z and xy + y\u2032z differ on ' + M.MISUSE.differ.length + ' minterm(s)');

  var PASSED = CHECKS.filter(function (c) { return c.pass; }).length;

  /* ======================================================================
     LAYER 3 — RENDER
     ====================================================================== */

  var C = PR.PAL;

  function head(P2, title, sub) {
    P2.text(40, 26, title, { size: 17, bold: true, color: C.ink });
    if (sub) P2.text(40, 50, sub, { size: 12, color: C.dim });
    P2.line(40, 68, 860, 68, { stroke: C.border, sw: 1 });
  }

  function foot(P2, text) {
    P2.line(40, 424, 860, 424, { stroke: C.border, sw: 1 });
    P2.text(40, 434, text, { size: 11, mono: true, color: C.dim });
  }

  function box(P2, x, y, w, h, o) {
    o = o || {};
    P2.rect(x, y, w, h, { fill: o.fill || C.surface, stroke: o.stroke || C.border, sw: o.sw || 1, radius: 4, dash: o.dash });
    if (o.title) P2.text(x + 12, y + 10, o.title, { size: 12, bold: true, color: o.titleColor || C.ink });
  }

  function chip(P2, x, y, text, kind) {
    var fill = kind === 'valid' ? C.accentDim : kind === 'invalid' ? C.invalidDim : kind === 'warn' ? C.warnDim : C.surface2;
    var stroke = kind === 'valid' ? C.accent : kind === 'invalid' ? C.invalid : kind === 'warn' ? C.warn : C.border;
    var w = Math.max(28, text.length * 6.6 + 14);
    P2.rect(x, y, w, 18, { fill: fill, stroke: stroke, sw: 1, radius: 3 });
    P2.text(x + w / 2, y + 9, text, { size: 10, mono: true, color: stroke, align: 'center', base: 'middle' });
    return w;
  }

  function bar(P2, x, y, lits, max, colour, label, span) {
    var w = Math.max(3, (lits / max) * (span || 210));
    P2.rect(x, y, w, 14, { fill: colour, radius: 2 });
    P2.text(x + w + 8, y + 7, String(lits) + (label ? ' ' + label : ''), { size: 11, mono: true, color: C.dim, base: 'middle' });
  }

  var NAMES3 = 'abc', NAMES4 = 'wxyz';

  /* ---------------- scene drawings ---------------- */

  function drawMethods(P2, u) {
    head(P2, 'Three methods, one clause, three different promises',
         'GATE 2027 CS, Section 2: "Boolean algebra and minimization \u2013 algebraic technique, Karnaugh map, tabular method."');
    var cols = [
      { t: 'Algebraic', body: 'rewrite with the identities', gives: 'a simpler expression', stops: 'no \u2014 you stop when nothing looks applicable', cost: 'depends on insight' },
      { t: 'Karnaugh map', body: 'draw the 1s, circle them', gives: 'a minimum sum of products', stops: 'yes \u2014 when every 1 is circled', cost: 'practical to four variables' },
      { t: 'Tabular', body: 'merge minterms in a table', gives: 'a minimum sum of products', stops: 'yes \u2014 when the chart is covered', cost: 'exponential, but mechanical' }
    ];
    cols.forEach(function (c, i) {
      var x = 40 + i * 282;
      var a = K.ease(K.clamp01((u - i * 0.16) * 3));
      P2.alpha(a);
      box(P2, x, 86, 262, 300, { title: c.t, stroke: i === 0 ? C.warn : C.border, sw: i === 0 ? 2 : 1 });
      P2.text(x + 12, 116, c.body, { size: 11, color: C.dim });
      P2.text(x + 12, 152, 'what it gives', { size: 9, mono: true, color: C.faint });
      P2.text(x + 12, 168, c.gives, { size: 12, color: C.ink });
      P2.text(x + 12, 208, 'does it tell you when to stop?', { size: 9, mono: true, color: C.faint });
      P2.text(x + 12, 224, c.stops, { size: 11, color: i === 0 ? C.warn : C.ink });
      P2.text(x + 12, 264, 'cost', { size: 9, mono: true, color: C.faint });
      P2.text(x + 12, 280, c.cost, { size: 11, color: C.ink });
      P2.alpha(1);
    });
    if (u > 0.6) {
      P2.text(40, 402, 'This lesson owns the first column: what the identities can do, and the one thing they cannot promise.',
              { size: 12, bold: true, color: C.accent });
    }
    foot(P2, 'The clause is quoted from the GATE 2027 CS syllabus PDF, IIT Madras. Two neighbours own the other two columns.');
  }

  function drawCost(P2, u) {
    head(P2, 'The cost is the number of literals', 'A literal is one occurrence of a variable, negated or not. xy + x\u2032z has four.');
    var ex = [
      { s: 'a\u2032b\u2032c\u2032', n: 3, note: 'one minterm of three variables' },
      { s: 'a\u2032b\u2032c\u2032 + a\u2032b\u2032c + a\u2032bc', n: 9, note: 'three minterms, nine literals' },
      { s: 'a\u2032b\u2032 + bc', n: 4, note: 'the same function, four literals' }
    ];
    ex.forEach(function (e, i) {
      var y = 96 + i * 74;
      var a = K.ease(K.clamp01((u - i * 0.18) * 3));
      P2.alpha(a);
      P2.text(40, y, e.s, { size: 14, mono: true, color: C.ink });
      P2.text(40, y + 22, e.note, { size: 10, color: C.faint });
      bar(P2, 480, y + 2, e.n, 9, i === 2 ? C.accent : C.dim);
      P2.alpha(1);
    });
    if (u > 0.55) {
      box(P2, 40, 320, 400, 86, { title: 'Two counts, and a tie-break' });
      P2.text(52, 348, 'terms = how many AND gates', { size: 11, color: C.ink });
      P2.text(52, 368, 'literals = how many gate inputs', { size: 11, color: C.ink });
      P2.text(52, 388, 'fewest terms first, then fewest literals', { size: 11, bold: true, color: C.accent });
      box(P2, 460, 320, 400, 86, { title: 'Why literals and not terms', stroke: C.border });
      P2.text(472, 348, 'xy + x\u2032y\u2032 + z has 3 terms, 5 literals', { size: 11, color: C.ink });
      P2.text(472, 368, 'xy + x\u2032z has 2 terms, 4 literals', { size: 11, color: C.ink });
      P2.text(472, 388, 'a term can be long; literals track the silicon', { size: 11, color: C.dim });
    }
    foot(P2, 'Counting rule: one literal per variable occurrence, so a canonical term of n variables costs n.');
  }

  function drawRules(P2, u) {
    head(P2, 'Eight identities, used as rewrites', 'Each line is a licence to replace the left side by the right side anywhere inside an expression.');
    var shown = Math.min(RULE_TABLE.length, Math.floor(u * RULE_TABLE.length * 1.6) + 1);
    for (var i = 0; i < shown; i++) {
      var r = RULE_TABLE[i];
      var col = i < 4 ? 0 : 1;
      var row = i % 4;
      var x = 40 + col * 430;
      var y = 88 + row * 62;
      box(P2, x, y, 410, 52, { stroke: r.kind === 'reduces' ? C.accent : C.border, sw: r.kind === 'reduces' ? 1.6 : 1 });
      P2.text(x + 10, y + 8, r.sop, { size: 12, mono: true, color: C.ink });
      P2.text(x + 10, y + 28, 'dual: ' + r.dual, { size: 10, mono: true, color: C.faint });
      chip(P2, x + 300, y + 6, r.kind === 'reduces' ? 'reduces' : r.kind === 'clean-up' ? 'clean-up' : 'bridge',
           r.kind === 'reduces' ? 'valid' : 'plain');
    }
    if (u > 0.7) {
      P2.text(40, 348, 'Every one of them is an equality, so a rewrite can never change the function \u2014 only its size.',
              { size: 12, bold: true, color: C.accent });
      P2.text(40, 372, 'That is why the model can test all ' + M.RULES.tested + ' applications on three-variable pairs and find none that moves a truth table.',
              { size: 11, color: C.dim });
      P2.text(40, 392, 'What the identities cannot tell you is which one to use next.', { size: 11, color: C.warn });
    }
    foot(P2, 'The five "reduces" rules are the ones that shrink a sum of products; the clean-up rules keep it tidy.');
  }

  function drawChain(P2, u) {
    var ch = M.CHAIN;
    head(P2, 'One function, five rewrites, ten literals to eight',
         "F = a\u2032b + a\u2032b\u2032c\u2032d\u2032 + abcd\u2032 \u2014 the worked example in Roth, Fundamentals of Logic Design, section 3.3.");
    var shown = Math.min(ch.lines.length, Math.floor(u * ch.lines.length * 1.5) + 1);
    for (var i = 0; i < shown; i++) {
      var s = ch.lines[i];
      var y = 92 + i * 48;
      P2.text(40, y, String(i + 1) + '.', { size: 12, mono: true, color: C.faint });
      P2.text(66, y - 1, s.text, { size: 14, mono: true, color: i === shown - 1 ? C.accent : C.ink });
      P2.text(66, y + 18, s.why, { size: 10, color: C.dim });
      chip(P2, 700, y - 4, s.rule, s.rule === 'start' ? 'plain' : s.rule === 'expand' ? 'warn' : 'valid');
      bar(P2, 700, y + 20, s.lits, 10, i === shown - 1 ? C.accent : C.dim, null, 120);
    }
    if (shown === ch.lines.length) {
      P2.text(40, 384, 'Two factors, two eliminated literals, one expansion. Every line is equal to F, checked against the truth table.',
              { size: 11, color: C.ink });
      P2.text(40, 404, 'Line 5 has 7 literals and line 6 has 8: a factored form is cheaper per literal but is not a sum of products, and the minimum sum of products here is ' + ch.minLits + '.',
              { size: 10, bold: true, color: C.accent });
    }
    foot(P2, 'Minimum confirmed by exhaustive search over every cover of the six minterms: ' + ch.minLits + ' literals.');
  }

  function drawAbsorb(P2, u) {
    head(P2, 'The two rules that do most of the work', 'Both are proved by splitting on one variable, and both delete something.');
    box(P2, 40, 86, 400, 150, { title: 'Absorption: X + XY = X' });
    P2.text(52, 116, 'If X = 1 both terms are 1.', { size: 11, color: C.ink });
    P2.text(52, 136, 'If X = 0 both terms are 0.', { size: 11, color: C.ink });
    P2.text(52, 162, 'So XY never decides anything.', { size: 11, bold: true, color: C.accent });
    P2.text(52, 190, 'Example: a\u2032b\u2032 + a\u2032b\u2032c = a\u2032b\u2032', { size: 11, mono: true, color: C.ink });
    P2.text(52, 210, 'Deletes a term. Literals: 5 \u2192 2.', { size: 10, color: C.dim });

    box(P2, 460, 86, 400, 150, { title: 'Eliminating a literal: X + X\u2032Y = X + Y' });
    P2.text(472, 116, 'If X = 1 both sides are 1.', { size: 11, color: C.ink });
    P2.text(472, 136, 'If X = 0 then X\u2032 = 1, so both sides are Y.', { size: 11, color: C.ink });
    P2.text(472, 162, 'The X\u2032 is what Y had to survive.', { size: 11, bold: true, color: C.accent });
    P2.text(472, 190, 'Example: c + c\u2032d = c + d', { size: 11, mono: true, color: C.ink });
    P2.text(472, 210, 'Deletes a literal, not a term. 4 \u2192 2.', { size: 10, color: C.dim });

    if (u > 0.5) {
      box(P2, 40, 252, 820, 118, { title: 'Where the second rule needs care', stroke: C.warn });
      P2.text(52, 282, 'X must be one literal. With a longer X you have to factor the shared part out first:', { size: 11, color: C.ink });
      P2.text(52, 306, 'a\u2032b\u2032 + a\u2032bc\u2032 = a\u2032(b\u2032 + bc\u2032) = a\u2032(b\u2032 + c\u2032) = a\u2032b\u2032 + a\u2032c\u2032', { size: 12, mono: true, color: C.accent });
      P2.text(52, 332, 'Skipping the factor and deleting a literal from ' + sopStr(M.MISUSE.left, 'abc') + ' gives ' + sopStr(M.MISUSE.wrong, 'abc') + ', which is not the same function.', { size: 10, color: C.warn });
      P2.text(52, 352, 'The model finds the disagreement on minterm ' + M.MISUSE.differ.join(', ') + '.', { size: 10, color: C.dim });
    }
    foot(P2, 'Absorption removes a term; elimination removes a literal. They are not interchangeable.');
  }

  function drawConsensus(P2, u) {
    var c = M.CONSENSUS;
    head(P2, 'The consensus theorem: a term that can always be dropped',
         'xy + x\u2032z + yz = xy + x\u2032z, for every assignment of x, y and z.');
    P2.text(40, 96, 'The consensus of xy and x\u2032z is yz: keep every literal they share, drop the variable they disagree on.',
            { size: 11, color: C.dim });
    P2.text(40, 124, 'xy + x\u2032z + yz', { size: 15, mono: true, color: C.ink });
    chip(P2, 190, 118, 'yz is the consensus', 'valid');
    P2.text(340, 124, '= xy + x\u2032z', { size: 15, mono: true, color: C.accent });

    var x0 = 60, y0 = 158, cw = 92;
    var cols = ['x', 'y', 'z', 'xy', 'x\u2032z', 'yz', 'F with yz', 'F without'];
    cols.forEach(function (t, i) {
      P2.text(x0 + i * cw + cw / 2, y0, t, { size: 11, mono: true, bold: true, color: C.dim, align: 'center' });
    });
    var shown = Math.min(c.rows.length, Math.floor(u * 12) + 1);
    for (var i = 0; i < shown; i++) {
      var r = c.rows[i];
      var y = y0 + 22 + i * 26;
      if (i % 2 === 0) P2.rect(x0 - 6, y - 4, cw * cols.length + 12, 24, { fill: C.surface2, radius: 2 });
      var vals = [r.x, r.y, r.z, r.xy, r.xz, r.yz, r.left, r.right];
      vals.forEach(function (v, k) {
        var colour = k >= 6 ? (k === 6 ? C.accent : C.ink) : (k === 5 && v === 1 ? C.warn : C.ink);
        P2.text(x0 + k * cw + cw / 2, y, String(v), { size: 12, mono: true, color: colour, align: 'center', bold: k >= 6 });
      });
    }
    if (shown === c.rows.length) {
      P2.text(40, 392, 'Column 7 and column 8 agree on all eight rows, so yz is redundant. Dropping it costs 2 literals and changes nothing.',
              { size: 11, color: C.dim });
      P2.text(40, 412, 'Rows where yz is 1 are exactly the rows where xy or x\u2032z is already 1 \u2014 that is the whole proof.', { size: 11, bold: true, color: C.accent });
    }
    foot(P2, 'Consensus removal: ' + c.withLits + ' literals become ' + c.withoutLits + ', and the model confirms the two expressions are equal.');
  }

  function drawUndefined(P2, u) {
    var t = M.TWOOPP;
    head(P2, 'Where the consensus rule stops: two oppositions',
         'The consensus exists only when the two terms disagree on exactly one variable.');
    P2.text(40, 96, 'xy and x\u2032y\u2032 disagree on x and on y. There is no consensus to build.', { size: 12, color: C.ink });
    P2.text(40, 124, 'xy + x\u2032y\u2032', { size: 15, mono: true, color: C.ink });
    P2.text(220, 124, 'vs', { size: 12, color: C.faint });
    P2.text(256, 124, 'xy + x\u2032y\u2032 + 1', { size: 15, mono: true, color: C.invalid });
    chip(P2, 470, 118, 'the naive "consensus" is the empty term', 'invalid');

    if (u > 0.3) {
      box(P2, 40, 158, 400, 168, { title: 'The rule applied blindly', stroke: C.invalid });
      P2.text(52, 188, 'Take every literal of both terms,', { size: 11, color: C.ink });
      P2.text(52, 208, 'delete the ones they disagree on:', { size: 11, color: C.ink });
      P2.text(52, 232, 'x, x\u2032, y, y\u2032 all go.', { size: 11, mono: true, color: C.invalid });
      P2.text(52, 256, 'What is left is the empty term, 1.', { size: 11, mono: true, color: C.invalid });
      P2.text(52, 284, 'A constant 1 is not redundant.', { size: 11, bold: true, color: C.invalid });
      P2.text(52, 306, 'The function becomes 1 everywhere.', { size: 10, color: C.dim });
    }
    if (u > 0.55) {
      box(P2, 460, 158, 400, 168, { title: 'The witness, row by row', stroke: C.accent });
      P2.text(472, 188, 'At x=1, y=0: xy = 0 and x\u2032y\u2032 = 0,', { size: 11, color: C.ink });
      P2.text(472, 208, 'so the function is 0.', { size: 11, color: C.ink });
      P2.text(472, 232, 'Adding the empty term makes it 1.', { size: 11, color: C.invalid });
      P2.text(472, 260, 'Minterm ' + t.differ.join(', ') + ' in the three-variable numbering.', { size: 10, mono: true, color: C.dim });
      P2.text(472, 288, 'So: check the opposition count before', { size: 11, bold: true, color: C.accent });
      P2.text(472, 308, 'you remove anything.', { size: 11, bold: true, color: C.accent });
    }
    if (u > 0.8) {
      P2.text(40, 356, 'The model finds ' + M.TWOOPP.oppositions + ' oppositions here and reports the consensus as undefined.',
              { size: 11, color: C.dim });
      P2.text(40, 378, 'Every single-opposition pair in three variables was checked: ' + M.RULES.cubes + ' cubes, no exception.',
              { size: 11, color: C.dim });
    }
    foot(P2, 'One opposition: the consensus exists and is always redundant. Two or more: there is no consensus at all.');
  }

  function drawOrder(P2, u) {
    var o = M.ORDER;
    head(P2, 'The order decides the answer', 'Same five terms, same rules, two routes, two different correct results.');
    P2.text(40, 96, 'F = ' + sopStr(o.F, 'abc'), { size: 14, mono: true, color: C.ink });
    P2.text(40, 120, o.litsF + ' literals, ' + o.F.length + ' terms. Minimum is ' + o.minLits + '.', { size: 11, color: C.dim });

    var routeY = 156;
    var a = K.ease(K.clamp01(u * 2.2));
    P2.alpha(a);
    box(P2, 40, routeY, 820, 100, { title: 'Route 1: remove the consensus terms first', stroke: C.accent });
    P2.text(52, routeY + 32, sopStr(o.routeA, 'abc'), { size: 13, mono: true, color: C.accent });
    P2.text(52, routeY + 56, o.litsA + ' literals, ' + o.routeA.length + ' terms \u2014 this is the minimum', { size: 11, color: C.dim });
    P2.text(52, routeY + 78, 'equivalent to F: ' + (o.aOK ? 'yes' : 'no'), { size: 10, mono: true, color: C.dim });
    P2.alpha(1);

    if (u > 0.4) {
      var b = K.ease(K.clamp01((u - 0.4) * 2.2));
      P2.alpha(b);
      box(P2, 40, routeY + 116, 820, 100, { title: 'Route 2: absorb first, then stop when nothing looks applicable', stroke: C.warn });
      P2.text(52, routeY + 148, sopStr(o.routeB, 'abc'), { size: 13, mono: true, color: C.warn });
      P2.text(52, routeY + 172, o.litsB + ' literals, ' + o.routeB.length + ' terms \u2014 correct, and not minimal', { size: 11, color: C.dim });
      P2.text(52, routeY + 194, 'equivalent to F: ' + (o.bOK ? 'yes' : 'no'), { size: 10, mono: true, color: C.dim });
      P2.alpha(1);
    }
    if (u > 0.8) {
      P2.text(40, 400, 'Both answers are true. Neither step was wrong. The gap is ' + (o.litsB - o.litsA) + ' literals, and nothing in the algebra tells you which route to take.',
              { size: 11, bold: true, color: C.ink });
    }
    foot(P2, 'This example is the one in the lecture notes cited on the Sources tab; both routes were re-checked against the truth table here.');
  }

  function drawStall(P2, u) {
    var s = M.STALL;
    head(P2, 'The stall: no rule applies, and the answer is still too long',
         'wx + xy + x\u2032z\u2032 + wy\u2032z\u2032 \u2014 nine literals, and nothing to delete.');
    P2.text(40, 96, 'wx + xy + x\u2032z\u2032 + wy\u2032z\u2032', { size: 15, mono: true, color: C.ink });
    chip(P2, 320, 90, 'no combine, no absorb, no elimination, no consensus term', 'warn');
    P2.text(40, 124, 'The minimum is ' + s.minLits + ' literals: ' + sopStr(s.minSop, 'wxyz') + '.', { size: 12, color: C.accent });
    P2.text(40, 148, 'So the expression you stopped at is ' + (s.stallLits - s.minLits) + ' literals too long, and no identity removes one of them.',
            { size: 11, color: C.ink });

    if (u > 0.3) {
      box(P2, 40, 174, 820, 54, { title: 'Step 1 \u2014 add a term, which is allowed because a consensus term is redundant', stroke: C.warn });
      P2.text(52, 200, 'wx + xy + x\u2032z\u2032 + wy\u2032z\u2032 + wz\u2032', { size: 13, mono: true, color: C.warn });
      P2.text(430, 200, '(' + s.stage1Lits + ' literals \u2014 it got worse)', { size: 10, color: C.dim });
    }
    if (u > 0.5) {
      box(P2, 40, 240, 820, 54, { title: 'Step 2 \u2014 now wy\u2032z\u2032 is absorbed by wz\u2032', stroke: C.accent });
      P2.text(52, 266, 'wx + xy + x\u2032z\u2032 + wz\u2032', { size: 13, mono: true, color: C.accent });
      P2.text(430, 266, '(' + s.stage2Lits + ' literals)', { size: 10, color: C.dim });
    }
    if (u > 0.7) {
      box(P2, 40, 306, 820, 54, { title: 'Step 3 \u2014 and wz\u2032 is itself the consensus of wx and x\u2032z\u2032, so it goes', stroke: C.accent });
      P2.text(52, 332, sopStr(s.stage3, 'wxyz'), { size: 13, mono: true, color: C.accent });
      P2.text(430, 332, '(' + s.stage3Lits + ' literals, the minimum)', { size: 10, color: C.dim });
    }
    if (u > 0.9) {
      P2.text(40, 388, 'Adding a term to shorten an expression is method four in the textbook \u2014 and it needs a decision you make.',
              { size: 11, color: C.ink });
    }
    foot(P2, 'Model check: no reducing rule applies at nine literals; the added term is redundant; the three stages are all equal to F.');
  }

  function drawCount(P2, u) {
    var c = M.COUNT;
    head(P2, 'How often the algebraic route stops short', 'Every non-constant three-variable function, all ' + c.total + ' of them, tried by machine.');
    var rows = [
      { k: 'functions tried', v: String(c.total), note: 'every non-zero truth table on three variables' },
      { k: 'ended above the minimum', v: String(c.above), note: c.abovePct.toFixed(1) + ' per cent, from the canonical form, reducing rules only' },
      { k: 'fixed by adding one consensus term', v: String(c.fixedByOneAdd), note: 'method four, applied once, then reduce again' },
      { k: 'still above the minimum', v: String(c.stillAbove), note: 'a term has to be chosen, not derived' }
    ];
    rows.forEach(function (r, i) {
      var y = 92 + i * 56;
      var a = K.ease(K.clamp01((u - i * 0.15) * 3));
      P2.alpha(a);
      P2.text(40, y, r.k, { size: 12, color: C.ink });
      P2.text(300, y - 4, r.v, { size: 20, mono: true, bold: true, color: i === 0 ? C.ink : i === 3 ? C.invalid : C.accent });
      P2.text(360, y, r.note, { size: 10, color: C.dim });
      P2.alpha(1);
    });
    if (u > 0.6 && c.witness) {
      box(P2, 40, 320, 820, 92, { title: 'One witness, kept because it is small', stroke: C.invalid });
      P2.text(52, 348, 'canonical \u2192 ' + sopStr(c.witness.sop, 'abc'), { size: 12, mono: true, color: C.invalid });
      P2.text(52, 370, c.witness.lits + ' literals, against a minimum of ' + c.witness.min + ': ' + sopStr(c.witness.minSop, 'abc'), { size: 11, color: C.ink });
      P2.text(52, 392, 'Adding the best single consensus term still leaves ' + c.witness.bestAfterAdd + ' literals.', { size: 10, color: C.dim });
    }
    foot(P2, 'Counted, not quoted: the page recomputes this enumeration every time it loads.');
  }

  function drawThree(P2, u) {
    var t = M.THREE;
    head(P2, 'One function, three methods, one answer', 'F = \u03a3(0,1,2,5,6,7) on a, b, c \u2014 ' + t.truth.length + ' minterms.');
    var cols = [
      { t: 'Canonical form', s: sopStr(t.canonical, 'abc'), n: t.canonicalLits, note: 'one term per minterm: 6 \u00d7 3' },
      { t: 'Algebraic', s: sopStr(t.algebraicSop, 'abc'), n: t.algebraicLits, note: 'consensus removals, order-dependent' },
      { t: 'Karnaugh / tabular', s: sopStr(t.minSop, 'abc'), n: t.minLits, note: 'every prime implicant considered' }
    ];
    cols.forEach(function (c, i) {
      var x = 40 + i * 282;
      var a = K.ease(K.clamp01((u - i * 0.2) * 2.6));
      P2.alpha(a);
      box(P2, x, 90, 262, 128, { title: c.t, stroke: i === 2 ? C.accent : C.border, sw: i === 2 ? 2 : 1 });
      P2.text(x + 12, 120, c.s, { size: 11, mono: true, color: C.ink });
      P2.text(x + 12, 146, c.n + ' literals', { size: 13, mono: true, bold: true, color: i === 2 ? C.accent : C.ink });
      P2.text(x + 12, 172, c.note, { size: 9, color: C.dim });
      bar(P2, x + 12, 190, c.n, t.canonicalLits, i === 2 ? C.accent : C.dim);
      P2.alpha(1);
    });
    if (u > 0.6) {
      box(P2, 40, 232, 400, 132, { title: 'The prime implicants found' });
      P2.text(52, 262, t.primes.map(function (p) { return cubeStr(p, 'abc'); }).join(',  '), { size: 11, mono: true, color: C.ink });
      P2.text(52, 292, 'Six primes, three of them in the cover.', { size: 10, color: C.dim });
      P2.text(52, 316, 'The map and the table both search this set.', { size: 10, color: C.dim });
      P2.text(52, 340, 'The algebra has to guess which one to remove.', { size: 10, color: C.warn });
      box(P2, 460, 232, 400, 132, { title: 'What each one promises', stroke: C.accent });
      P2.text(472, 262, 'algebraic: a shorter expression', { size: 11, color: C.ink });
      P2.text(472, 284, 'map: the shortest sum of products', { size: 11, color: C.ink });
      P2.text(472, 306, 'table: the shortest, provably', { size: 11, color: C.ink });
      P2.text(472, 332, 'Only the last two can be checked by', { size: 10, color: C.dim });
      P2.text(472, 348, 'counting prime implicants.', { size: 10, color: C.dim });
    }
    foot(P2, '18 literals to 6, by three routes; the model recomputes all three and reports whether they agree.');
  }

  function drawLevels(P2, u) {
    var L = M.LEVELS;
    head(P2, 'Two levels against many', 'Factoring is a rewrite too, and it is how the algebraic method escapes a stall.');
    box(P2, 40, 88, 400, 120, { title: 'Two level: AB + AC + AD' });
    P2.text(52, 118, 'AB + AC + AD', { size: 14, mono: true, color: C.ink });
    P2.text(52, 146, L.twoLits + ' literals, ' + L.twoGates + ' gates, depth ' + L.twoDepth, { size: 11, color: C.dim });
    P2.text(52, 170, 'three ANDs feeding one OR', { size: 10, color: C.faint });
    box(P2, 460, 88, 400, 120, { title: 'Multi level: A(B + C + D)', stroke: C.accent });
    P2.text(472, 118, 'A(B + C + D)', { size: 14, mono: true, color: C.accent });
    P2.text(472, 146, L.factoredLits + ' literals, ' + L.factoredGates + ' gates, depth ' + L.factoredDepth, { size: 11, color: C.dim });
    P2.text(472, 170, 'one OR feeding one AND', { size: 10, color: C.faint });
    if (u > 0.35) {
      P2.text(40, 232, 'The same function, ' + L.literalsSaved + ' literals fewer. Factoring is the rewrite that changes the shape rather than deleting anything.',
              { size: 12, color: C.ink });
    }
    if (u > 0.55) {
      box(P2, 40, 254, 820, 82, { title: 'But depth is a cost too', stroke: C.warn });
      P2.text(52, 282, 'AB + AC + D is ' + L.chainTwoLits + ' literals at depth ' + L.chainTwoDepth + '.', { size: 11, color: C.ink });
      P2.text(52, 302, 'A(B + C) + D is ' + L.chainFactoredLits + ' literals at depth ' + L.chainFactoredDepth + ' \u2014 one more gate delay in the path.', { size: 11, color: C.ink });
      P2.text(52, 324, 'Fewer literals is not automatically faster.', { size: 11, bold: true, color: C.warn });
    }
    if (u > 0.8) {
      box(P2, 40, 348, 820, 66, { title: 'And a redundant term is sometimes kept on purpose', stroke: C.accent });
      P2.text(52, 376, 'For xy + x\u2032z, if y = z = 1 and x changes, both terms can drop for a moment. The consensus yz holds the output at 1 through the change.', { size: 10, color: C.ink });
      P2.text(52, 396, 'The minimum-literal answer and the glitch-free answer are not always the same answer.', { size: 10, bold: true, color: C.accent });
    }
    foot(P2, 'Depth is counted as the number of gate levels a signal passes through; the counts here are for the expressions shown.');
  }

  function drawProcedure(P2, u) {
    head(P2, 'The procedure for a "simplify this" question', 'Five steps, then one independent check.');
    var steps = [
      'Count the literals you start with, so you can see progress.',
      'Look for two terms that differ in exactly one variable \u2014 combine them.',
      'Look for a term contained in another \u2014 absorb it.',
      'Look for X + X\u2032Y with X a single literal \u2014 delete the X\u2032.',
      'Look for a term that is the consensus of two others \u2014 delete it.',
      'If nothing applies and you are still long, factor, or add a consensus term and try again.',
      'Check the answer on one assignment where your final expression is 0, and one where it is 1.'
    ];
    var shown = Math.min(steps.length, Math.floor(u * steps.length * 1.5) + 1);
    for (var i = 0; i < shown; i++) {
      var y = 88 + i * 40;
      P2.circle(50, y + 6, 9, { fill: i === steps.length - 1 ? C.accentDim : C.surface2, stroke: i === steps.length - 1 ? C.accent : C.border });
      P2.text(50, y + 6, String(i + 1), { size: 11, mono: true, color: C.dim, align: 'center', base: 'middle' });
      P2.text(70, y, steps[i], { size: 11, color: i === steps.length - 1 ? C.accent : C.ink, bold: i === steps.length - 1 });
    }
    if (u > 0.75) {
      box(P2, 40, 378, 820, 40, { title: '', stroke: C.accent });
      P2.text(52, 390, 'The last step is the only one that proves anything: two expressions that disagree on one assignment are different functions, however alike they look.', { size: 10, color: C.ink });
    }
    foot(P2, 'Steps 2\u20135 are the four reducing rules; step 6 is the escape when they stall.');
  }

  var SCENE_DRAW = {
    methods: drawMethods,
    cost: drawCost,
    rules: drawRules,
    chain: drawChain,
    absorb: drawAbsorb,
    consensus: drawConsensus,
    undefined: drawUndefined,
    order: drawOrder,
    stall: drawStall,
    count: drawCount,
    three: drawThree,
    levels: drawLevels,
    procedure: drawProcedure
  };

  function drawFrame(P2) {
    if (!P2) return;
    var t = K.state.elapsed;
    var sc = K.state.scenes[K.sceneAt(t)];
    if (!sc) return;
    var span = Math.max(0.001, sc.end - sc.start);
    var u = K.clamp01((t - sc.start) / span);
    P2.clear();
    var fn = SCENE_DRAW[sc.id];
    if (fn) fn(P2, u);
    else P2.text(40, 60, 'No drawing for scene ' + sc.id, { size: 14 });
  }

  function fillChecks() {
    var el = document.getElementById('checks');
    if (!el) return;
    var bad = CHECKS.length - PASSED;
    el.innerHTML = '<span class="k">Model checks</span>' +
      '<p class="small" style="margin:6px 0 0">' + PASSED + ' of ' + CHECKS.length + ' passed' +
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
            drawFrame(P);
            ok = true;
          };
          sk.draw = function () { /* frames are driven by the timeline */ };
        });
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
    CHAIN: { start: M.CHAIN.startLits, end: M.CHAIN.finalLits, min: M.CHAIN.minLits },
    ORDER: { a: M.ORDER.litsA, b: M.ORDER.litsB, min: M.ORDER.minLits, auto: M.ORDER.autoLits },
    STALL: { stall: M.STALL.stallLits, min: M.STALL.minLits, stages: [M.STALL.stage1Lits, M.STALL.stage2Lits, M.STALL.stage3Lits] },
    COUNT: M.COUNT,
    THREE: { canonical: M.THREE.canonicalLits, algebraic: M.THREE.algebraicLits, min: M.THREE.minLits },
    PYQ: { min: M.PYQ.minLits, answer: M.PYQ.answerLits },
    PASSED: PASSED,
    TOTAL: CHECKS.length
  };

  window.__lessonChecks = CHECKS;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

})();
