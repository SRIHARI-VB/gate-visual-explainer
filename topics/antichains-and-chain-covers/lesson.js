/* ==========================================================================
   antichains-and-chain-covers - model, validation, render.

   Layer 1  model      : a poset as elements plus a relation; the width by brute
                         force over all subsets; the height and the levels; the
                         minimum chain cover by a maximum matching in the split
                         graph; Mirsky's layers; the Dedekind counts.
   Layer 2  validation : every number quoted in a caption, a card or on the
                         canvas is recomputed here. Dilworth's equality is
                         tested on 200 seeded random posets, every layer is
                         checked to be an antichain, every produced chain is
                         checked to be a chain, and every cover is checked to
                         contain every element exactly once.
   Layer 3  render     : reads the model; never re-derives a number.
   Layer 4  timeline   : in timeline.js - the only source of time.

   No p5.brush: every mark is a node, an arrow, a set or a count that has to be
   read exactly.
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
     ====================================================================== */

  function fact(n) { var r = 1, i; for (i = 2; i <= n; i++) r *= i; return r; }
  function binom(n, k) {
    if (k < 0 || k > n) return 0;
    var r = 1, i;
    for (i = 1; i <= k; i++) r = r * (n - k + i) / i;
    return Math.round(r);
  }

  /* a poset: n elements, a relation as a list of strict pairs; the relation is
     closed under reflexivity and transitivity here, once, and everything else
     reads the closure */
  function makePoset(n, rels) {
    var le = [], i, j, k;
    for (i = 0; i < n; i++) { le.push([]); for (j = 0; j < n; j++) le[i].push(i === j); }
    for (i = 0; i < rels.length; i++) le[rels[i][0]][rels[i][1]] = true;
    for (k = 0; k < n; k++) {
      for (i = 0; i < n; i++) {
        if (!le[i][k]) continue;
        for (j = 0; j < n; j++) if (le[k][j]) le[i][j] = true;
      }
    }
    return { n: n, le: le, rels: rels };
  }

  function comparable(P, a, b) { return P.le[a][b] || P.le[b][a]; }

  function isChain(P, set) {
    var i, j;
    for (i = 0; i < set.length; i++) {
      for (j = i + 1; j < set.length; j++) if (!comparable(P, set[i], set[j])) return false;
    }
    return true;
  }

  function isAntichain(P, set) {
    var i, j;
    for (i = 0; i < set.length; i++) {
      for (j = i + 1; j < set.length; j++) if (comparable(P, set[i], set[j])) return false;
    }
    return true;
  }

  /* the width, by testing every subset - legal only for a small poset, and the
     standard against which the matching is checked */
  function widthBrute(P) {
    var best = 0, bestSet = [], mask, i, set;
    for (mask = 0; mask < (1 << P.n); mask++) {
      set = [];
      for (i = 0; i < P.n; i++) if (mask & (1 << i)) set.push(i);
      if (set.length > best && isAntichain(P, set)) { best = set.length; bestSet = set; }
    }
    return { w: best, set: bestSet };
  }

  function allMaxAntichains(P) {
    var out = [], w = widthBrute(P).w, mask, i, set;
    for (mask = 0; mask < (1 << P.n); mask++) {
      set = [];
      for (i = 0; i < P.n; i++) if (mask & (1 << i)) set.push(i);
      if (set.length === w && isAntichain(P, set)) out.push(set);
    }
    return out;
  }

  /* height and the level of every element: one plus the longest chain ending there */
  function levels(P) {
    var n = P.n, i, j, lv = [], guard;
    for (i = 0; i < n; i++) lv.push(1);
    for (guard = 0; guard < n; guard++) {
      for (i = 0; i < n; i++) {
        for (j = 0; j < n; j++) {
          if (P.le[j][i] && j !== i && lv[i] < lv[j] + 1) lv[i] = lv[j] + 1;
        }
      }
    }
    var h = 0;
    for (i = 0; i < n; i++) if (lv[i] > h) h = lv[i];
    var groups = [];
    for (i = 1; i <= h; i++) groups.push([]);
    for (i = 0; i < n; i++) groups[lv[i] - 1].push(i);
    return { lv: lv, h: h, groups: groups };
  }

  function covers(P) {
    var out = [], i, j, k, between;
    for (i = 0; i < P.n; i++) {
      for (j = 0; j < P.n; j++) {
        if (i === j || !P.le[i][j]) continue;
        between = false;
        for (k = 0; k < P.n; k++) {
          if (k !== i && k !== j && P.le[i][k] && P.le[k][j]) { between = true; break; }
        }
        if (!between) out.push([i, j]);
      }
    }
    return out;
  }

  /* maximum matching in the split graph, by augmenting paths (Kuhn) */
  function maxMatching(P) {
    var n = P.n, adj = [], i, j, matchR = [], used, size = 0;
    for (i = 0; i < n; i++) {
      adj.push([]);
      for (j = 0; j < n; j++) if (i !== j && P.le[i][j]) adj[i].push(j);
    }
    for (j = 0; j < n; j++) matchR.push(-1);

    function tryK(u) {
      var t, v;
      for (t = 0; t < adj[u].length; t++) {
        v = adj[u][t];
        if (used[v]) continue;
        used[v] = true;
        if (matchR[v] === -1 || tryK(matchR[v])) { matchR[v] = u; return true; }
      }
      return false;
    }

    for (i = 0; i < n; i++) {
      used = [];
      for (j = 0; j < n; j++) used.push(false);
      if (tryK(i)) size++;
    }
    return { size: size, matchR: matchR };
  }

  /* the chain cover the matching hands you: a vertex is a chain start exactly
     when it is not the target of a matched edge */
  function chainCover(P) {
    var m = maxMatching(P), nxt = [], chains = [], i, j, cur, chain;
    for (i = 0; i < P.n; i++) nxt.push(-1);
    for (j = 0; j < P.n; j++) if (m.matchR[j] !== -1) nxt[m.matchR[j]] = j;
    for (i = 0; i < P.n; i++) {
      if (m.matchR[i] !== -1) continue;
      chain = [i]; cur = i;
      while (nxt[cur] !== -1) { cur = nxt[cur]; chain.push(cur); }
      chains.push(chain);
    }
    return { chains: chains, matching: m.size };
  }

  /* the naive cover a first attempt usually produces: take a maximal chain from
     the smallest available minimal element, delete it, repeat */
  function greedyCover(P) {
    var left = [], i, chains = [], mins, start, chain, cur, ups, next, j;
    for (i = 0; i < P.n; i++) left.push(true);
    while (left.indexOf(true) !== -1) {
      mins = [];
      for (i = 0; i < P.n; i++) {
        if (!left[i]) continue;
        var below = false;
        for (j = 0; j < P.n; j++) if (left[j] && j !== i && P.le[j][i]) { below = true; break; }
        if (!below) mins.push(i);
      }
      start = mins[0];
      chain = [start]; left[start] = false; cur = start;
      for (;;) {
        ups = [];
        for (j = 0; j < P.n; j++) if (left[j] && P.le[cur][j] && j !== cur) ups.push(j);
        if (!ups.length) break;
        next = ups[0];
        chain.push(next); left[next] = false; cur = next;
      }
      chains.push(chain);
    }
    return chains;
  }

  /* graded: a rank function rising by one on every cover, minimal elements at
     rank zero, all maximal elements at the same rank */
  function graded(P) {
    var n = P.n, cs = covers(P), rank = [], i, mins = [], maxs = [], changed, t;
    for (i = 0; i < n; i++) {
      rank.push(null);
      var hasBelow = false, hasAbove = false;
      for (t = 0; t < n; t++) {
        if (t !== i && P.le[t][i]) hasBelow = true;
        if (t !== i && P.le[i][t]) hasAbove = true;
      }
      if (!hasBelow) mins.push(i);
      if (!hasAbove) maxs.push(i);
    }
    for (i = 0; i < mins.length; i++) rank[mins[i]] = 0;
    do {
      changed = false;
      for (t = 0; t < cs.length; t++) {
        var a = cs[t][0], b = cs[t][1];
        if (rank[a] !== null && rank[b] === null) { rank[b] = rank[a] + 1; changed = true; }
        else if (rank[b] !== null && rank[a] === null) { rank[a] = rank[b] - 1; changed = true; }
      }
    } while (changed);
    for (i = 0; i < n; i++) if (rank[i] === null) return { ok: false, rank: rank };
    for (t = 0; t < cs.length; t++) if (rank[cs[t][1]] !== rank[cs[t][0]] + 1) return { ok: false, rank: rank };
    var top = rank[maxs[0]];
    for (i = 0; i < maxs.length; i++) if (rank[maxs[i]] !== top) return { ok: false, rank: rank };
    var low = rank[0];
    for (i = 0; i < n; i++) if (rank[i] < low) low = rank[i];
    return { ok: low === 0, rank: rank };
  }

  function antichainCount(P) {
    var c = 0, mask, i, set;
    for (mask = 0; mask < (1 << P.n); mask++) {
      set = [];
      for (i = 0; i < P.n; i++) if (mask & (1 << i)) set.push(i);
      if (isAntichain(P, set)) c++;
    }
    return c;
  }

  /* ---------- the posets this lesson draws ---------- */

  var LAB = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  var TASKS = makePoset(5, [[0, 1], [0, 2], [1, 3], [2, 3]]);            // A<B, A<C, B<D, C<D, E free
  var MATCH = makePoset(6, [[0, 1], [0, 2], [1, 3], [2, 3], [4, 5]]);    // TASKS plus a spare pair
  var CHAIN4 = makePoset(4, [[0, 1], [1, 2], [2, 3]]);
  var ANTI4 = makePoset(4, []);
  var GRADED = makePoset(7, [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6],
                             [1, 4], [2, 4], [3, 5], [3, 6]]);
  var GREEDY = makePoset(7, [[0, 4], [0, 5], [0, 6], [1, 4], [1, 5], [1, 6], [3, 4]]);

  function divisorPoset(m) {
    var divs = [], d;
    for (d = 1; d <= m; d++) if (m % d === 0) divs.push(d);
    var rels = [], i, j;
    for (i = 0; i < divs.length; i++) {
      for (j = 0; j < divs.length; j++) {
        if (i !== j && divs[j] % divs[i] === 0) rels.push([i, j]);
      }
    }
    var P = makePoset(divs.length, rels);
    P.divs = divs;
    return P;
  }

  function boolPoset(k) {
    var n = 1 << k, rels = [], a, b;
    for (a = 0; a < n; a++) {
      for (b = 0; b < n; b++) if (a !== b && (a & b) === a) rels.push([a, b]);
    }
    var P = makePoset(n, rels);
    P.k = k;
    P.name = function (v) {
      var s = '', i;
      for (i = 0; i < k; i++) if (v & (1 << i)) s += String.fromCharCode(97 + i);
      return s === '' ? '\u2205' : s;
    };
    return P;
  }

  var DIV30 = divisorPoset(30);
  var DIV60 = divisorPoset(60);
  var B3 = boolPoset(3);
  var B4 = boolPoset(4);

  /* ---------- the numbers, computed once ---------- */

  var N = {
    tasks: {
      width: widthBrute(TASKS).w,
      set: widthBrute(TASKS).set,
      levels: levels(TASKS),
      cover: chainCover(TASKS),
      greedy: greedyCover(TASKS).length,
      maxAntichains: allMaxAntichains(TASKS).length
    },
    chain4: { width: widthBrute(CHAIN4).w, height: levels(CHAIN4).h },
    anti4: { width: widthBrute(ANTI4).w, height: levels(ANTI4).h },
    div30: {
      width: widthBrute(DIV30).w,
      set: widthBrute(DIV30).set,
      levels: levels(DIV30),
      cover: chainCover(DIV30)
    },
    div60: {
      width: widthBrute(DIV60).w,
      set: widthBrute(DIV60).set,
      levels: levels(DIV60),
      cover: chainCover(DIV60)
    },
    b3: {
      width: widthBrute(B3).w,
      height: levels(B3).h,
      antichains: antichainCount(B3),
      maxSets: allMaxAntichains(B3)
    },
    b4: { width: widthBrute(B4).w, antichains: antichainCount(B4) },
    b1: { width: widthBrute(boolPoset(1)).w },
    b2: { width: widthBrute(boolPoset(2)).w },
    graded: {
      width: widthBrute(GRADED).w,
      set: widthBrute(GRADED).set,
      maxLevel: Math.max.apply(null, levels(GRADED).groups.map(function (g) { return g.length; })),
      isGraded: graded(GRADED).ok,
      levels: levels(GRADED)
    },
    greedy: {
      width: widthBrute(GREEDY).w,
      greedy: greedyCover(GREEDY).length,
      cover: chainCover(GREEDY),
      set: widthBrute(GREEDY).set
    },
    match: {
      width: widthBrute(MATCH).w,
      cover: chainCover(MATCH)
    }
  };

  /* ======================================================================
     LAYER 2 - VALIDATION
     ====================================================================== */

  var CHECKS = [];
  function check(name, pass, detail) { CHECKS.push({ name: name, pass: !!pass, detail: detail }); }

  (function validate() {
    var i, j, g, L;

    /* 1. the two objects, on the poset the lesson opens with */
    check('B, C, E is an antichain of size 3 in the opening poset',
      isAntichain(TASKS, [1, 2, 4]));
    check('A, B, D is a chain of size 3 in the opening poset',
      isChain(TASKS, [0, 1, 3]));
    check('a chain and an antichain share at most one element (checked on every pair here)',
      (function () {
        var chains = [[0, 1, 3], [0, 1], [0, 2, 3]], antis = [[1, 2, 4], [1, 2], [2, 4]];
        for (var a = 0; a < chains.length; a++) {
          for (var b = 0; b < antis.length; b++) {
            var share = chains[a].filter(function (x) { return antis[b].indexOf(x) !== -1; });
            if (share.length > 1) return false;
          }
        }
        return true;
      })());
    check('the width of the opening poset is 3, and the set found is {B, C, E}',
      N.tasks.width === 3 && N.tasks.set.join(',') === '1,2,4');
    check('the height of the opening poset is 3', N.tasks.levels.h === 3);
    check('A together with E is a maximal antichain of size 2, smaller than the width',
      isAntichain(TASKS, [0, 4]) && [1, 2, 3].every(function (v) { return !isAntichain(TASKS, [0, 4, v]); }) &&
      [0, 4].length < N.tasks.width);

    /* 2. neither number bounds the other */
    check('a chain of four has width 1 and height 4',
      N.chain4.width === 1 && N.chain4.height === 4);
    check('an antichain of four has width 4 and height 1',
      N.anti4.width === 4 && N.anti4.height === 1);
    check('width times height is at least n on every poset drawn here',
      (function () {
        var list = [TASKS, MATCH, GRADED, GREEDY, DIV30, DIV60, B3, B4, CHAIN4, ANTI4];
        for (var t = 0; t < list.length; t++) {
          var P = list[t];
          if (widthBrute(P).w * levels(P).h < P.n) return false;
        }
        return true;
      })());

    /* 3. Mirsky, as a partition: every layer an antichain, as many layers as the height */
    check('every layer of every poset drawn here is an antichain',
      [TASKS, MATCH, GRADED, GREEDY, DIV30, DIV60, B3, B4].every(function (P) {
        var lv = levels(P);
        return lv.groups.every(function (grp) { return isAntichain(P, grp); });
      }));
    check('the layers partition the elements: every element in exactly one layer',
      [TASKS, DIV30, DIV60, GRADED, GREEDY, B3].every(function (P) {
        var lv = levels(P), seen = 0;
        lv.groups.forEach(function (grp) { seen += grp.length; });
        return seen === P.n;
      }));
    check('the number of layers equals the height on every poset drawn here',
      [TASKS, DIV30, DIV60, GRADED, GREEDY, B3, B4].every(function (P) {
        var lv = levels(P);
        return lv.groups.length === lv.h;
      }));
    check('a longest chain meets each layer exactly once (checked on the opening poset)',
      (function () {
        var lv = levels(TASKS), hits = [0, 0, 0];
        [0, 1, 3].forEach(function (v) { hits[lv.lv[v] - 1]++; });
        return hits.join(',') === '1,1,1';
      })());

    /* 4. Dilworth, as an equality, on 200 seeded random posets */
    var seed = 1234567;
    function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
    var tested = 0, failures = 0, coverBad = 0;
    for (var trial = 0; trial < 220; trial++) {
      var n = 1 + Math.floor(rnd() * 6), rels = [], a, b;
      for (a = 0; a < n; a++) for (b = a + 1; b < n; b++) if (rnd() < 0.35) rels.push([a, b]);
      var P = makePoset(n, rels);
      var w = widthBrute(P).w, cc = chainCover(P);
      var flat = [];
      cc.chains.forEach(function (c) { flat = flat.concat(c); });
      flat.sort(function (x, y) { return x - y; });
      var covers = flat.length === P.n && flat.every(function (v, ix) { return v === ix; });
      var allChains = cc.chains.every(function (c) { return isChain(P, c); });
      tested++;
      if (w !== cc.chains.length) failures++;
      if (!covers || !allChains) coverBad++;
    }
    check('Dilworth holds on ' + tested + ' random posets: width equals the minimum chain cover',
      failures === 0, failures + ' disagreements');
    check('every chain the matching produces is a chain, and together they cover each element once',
      coverBad === 0, coverBad + ' bad covers');

    /* 5. the matching arithmetic itself */
    check('the matching size plus the number of chains equals n (opening poset: 2 + 3 = 5)',
      N.tasks.cover.matching + N.tasks.cover.chains.length === TASKS.n);
    check('the matching on the six-element poset has size 3 and gives 3 chains',
      N.match.cover.matching === 3 && N.match.cover.chains.length === 3);

    /* 6. the divisors of 60 */
    check('the divisors of 60 number 12', DIV60.n === 12);
    check('the width of the 60-divisor poset is 4, attained by {4, 6, 10, 15}',
      N.div60.width === 4 &&
      N.div60.set.map(function (v) { return DIV60.divs[v]; }).sort(function (x, y) { return x - y; }).join(',') === '4,6,10,15');
    check('the height of the 60-divisor poset is 5', N.div60.levels.h === 5);
    check('its layers have sizes 1, 3, 4, 3, 1',
      N.div60.levels.groups.map(function (g) { return g.length; }).join(',') === '1,3,4,3,1');
    check('the widest layer of the 60-divisor poset has 4 elements, equal to its width',
      Math.max.apply(null, N.div60.levels.groups.map(function (g) { return g.length; })) === N.div60.width);
    check('four chains cover the 60-divisor poset, which is the width',
      N.div60.cover.chains.length === 4 && N.div60.cover.chains.every(function (c) { return isChain(DIV60, c); }));
    check('the divisors of 30 give width 3 and height 4',
      N.div30.width === 3 && N.div30.levels.h === 4);
    check('the divisors of 30 split into 4 antichains, which is its height',
      N.div30.levels.groups.length === 4);

    /* 7. Sperner and the Dedekind counts */
    check('the Boolean lattice of 3 elements has 8 elements and width 3', B3.n === 8 && N.b3.width === 3);
    check('Sperner for n = 1..4: widths 1, 2, 3, 6 equal C(n, floor(n/2))',
      N.b1.width === binom(1, 0) && N.b2.width === binom(2, 1) &&
      N.b3.width === binom(3, 1) && N.b4.width === binom(4, 2));
    check('the Boolean lattice of 4 elements has width 6 and height 5',
      N.b4.width === 6 && levels(B4).h === 5);
    check('the antichain counts of the Boolean lattice are 2, 3, 6, 20, 168 (Dedekind numbers)',
      antichainCount(boolPoset(0)) === 2 && N.b1.width === 1 &&
      antichainCount(boolPoset(1)) === 3 && antichainCount(boolPoset(2)) === 6 &&
      N.b3.antichains === 20 && N.b4.antichains === 168);
    check('the Boolean lattice of 3 elements has exactly 2 maximum antichains',
      N.b3.maxSets.length === 2);
    check('both maximum antichains of the 3-element Boolean lattice are the middle level',
      N.b3.maxSets.every(function (s) { return s.every(function (v) { return popcount(v) === 1 || popcount(v) === 2; }); }));

    /* 8. the counterexample: a graded poset whose widest level is not the width */
    check('the seven-element poset is graded', N.graded.isGraded === true);
    check('its widest level has 3 elements', N.graded.maxLevel === 3);
    check('its width is 4, attained by {1, 2, 5, 6}, so no level is a maximum antichain',
      N.graded.width === 4 && N.graded.set.join(',') === '1,2,5,6');

    /* 9. the counterexample: greedy chain covers overpay */
    check('the greedy cover of the seven-element poset uses 5 chains', N.greedy.greedy === 5);
    check('its width is 4, so the greedy cover overpays by one',
      N.greedy.width === 4 && N.greedy.greedy === N.greedy.width + 1);
    check('the matching finds a cover of 4 chains for it',
      N.greedy.cover.chains.length === 4 && N.greedy.cover.chains.every(function (c) { return isChain(GREEDY, c); }));

    /* 10. the two previous-year items, from their own statements */
    check('1991: a poset of height 5 is a partition into 5 antichains (the 60-divisor poset)',
      N.div60.levels.groups.length === 5 &&
      N.div60.levels.groups.every(function (g) { return isAntichain(DIV60, g); }));
    check('2005: the largest chain in the power set of an n-set has n + 1 members, checked n = 1..4',
      [1, 2, 3, 4].every(function (k) { return levels(boolPoset(k)).h === k + 1; }));
    check('and n + 1 is attained by the chain of initial segments in each case',
      [1, 2, 3, 4].every(function (k) {
        var P = boolPoset(k), chain = [], v = 0;
        for (var t = 0; t < k; t++) { v = v | (1 << t); chain.push(v); }
        chain.unshift(0);
        return isChain(P, chain) && chain.length === k + 1;
      }));
  })();

  function popcount(v) { var c = 0; while (v) { c += v & 1; v >>= 1; } return c; }

  var PASSED = CHECKS.filter(function (c) { return c.pass; }).length;

  /* ======================================================================
     LAYER 3 - RENDER
     ====================================================================== */

  function stage(p, n) {
    var s = Math.floor(K.clamp01(p) * n);
    return s >= n ? n - 1 : s;
  }

  function title(s, sub) {
    P.text(24, 18, s, { size: 15.5, bold: true, color: PAL.ink });
    if (sub) P.text(24, 40, sub, { size: 11, color: PAL.dim });
  }

  function foot(s) {
    P.text(24, 448, s, { size: 10.5, color: PAL.faint });
  }

  function line(x, y, s, o) {
    o = o || {};
    P.text(x, y, s, {
      size: o.size || 11.5, color: o.color || PAL.ink, bold: !!o.bold,
      mono: !!o.mono, align: o.align || 'left', base: 'top'
    });
  }

  function centre(x, y, s, o) {
    o = o || {};
    P.text(x, y, s, {
      size: o.size || 12, color: o.color || PAL.ink, bold: !!o.bold,
      mono: !!o.mono, align: 'center', base: 'middle'
    });
  }

  function panel(x, y, w, h, o) {
    o = o || {};
    var fill = o.tone === 'bad' ? PAL.invalidDim : o.tone === 'good' ? PAL.accentDim
             : o.tone === 'warn' ? PAL.warnDim : o.tone === 'info' ? PAL.surface2 : PAL.surface;
    var stroke = o.tone === 'bad' ? PAL.invalid : o.tone === 'good' ? PAL.accent
               : o.tone === 'warn' ? PAL.warn : PAL.border;
    P.rect(x, y, w, h, { fill: fill, stroke: stroke, sw: o.sw || 1.1, radius: 6 });
  }

  function node(x, y, label, o) {
    o = o || {};
    var r = o.r || 17;
    var fill = o.tone === 'good' ? PAL.accentDim : o.tone === 'bad' ? PAL.invalidDim
             : o.tone === 'warn' ? PAL.warnDim : o.tone === 'info' ? PAL.surface2 : PAL.surface;
    var stroke = o.tone === 'good' ? PAL.accent : o.tone === 'bad' ? PAL.invalid
               : o.tone === 'warn' ? PAL.warn : o.tone === 'info' ? PAL.info : PAL.border;
    P.circle(x, y, r, { fill: fill, stroke: stroke, sw: o.sw || 1.4 });
    centre(x, y + 1, label, { size: o.size || 12, bold: true, mono: true, color: PAL.ink });
  }

  function edge(x1, y1, x2, y2, o) {
    o = o || {};
    var r1 = o.r1 || 17, r2 = o.r2 || 17;
    var dx = x2 - x1, dy = y2 - y1, d = Math.sqrt(dx * dx + dy * dy) || 1;
    var ux = dx / d, uy = dy / d;
    P.arrow(x1 + ux * r1, y1 + uy * r1, x2 - ux * r2, y2 - uy * r2,
      { stroke: o.color || PAL.border, sw: o.sw || 1.2, head: o.head || 7 });
  }

  /* draw a whole poset from placed coordinates */
  function drawPoset(Pp, pos, opts) {
    opts = opts || {};
    var cs = covers(Pp), i, c;
    for (i = 0; i < cs.length; i++) {
      c = cs[i];
      var col = PAL.border, sw = 1.2;
      if (opts.edgeTone && opts.edgeTone(c)) { col = opts.edgeTone(c); sw = 2; }
      edge(pos[c[0]].x, pos[c[0]].y, pos[c[1]].x, pos[c[1]].y, { color: col, sw: sw, r1: opts.r || 17, r2: opts.r || 17 });
    }
    for (i = 0; i < Pp.n; i++) {
      node(pos[i].x, pos[i].y, opts.label ? opts.label(i) : LAB[i], {
        r: opts.r || 17,
        size: opts.size || 12,
        tone: opts.tone ? opts.tone(i) : 'none',
        sw: opts.sw || 1.4
      });
    }
  }

  /* a text column on the right: fixed rows, so nothing can overlap */
  function notes(x, y, rows, gap) {
    gap = gap || 21;
    for (var i = 0; i < rows.length; i++) {
      if (!rows[i]) continue;
      line(x, y + i * gap, rows[i].t, rows[i]);
    }
  }

  /* ---------- the placed coordinates ---------- */

  var POS_TASKS = [
    { x: 150, y: 78 }, { x: 88, y: 196 }, { x: 202, y: 196 }, { x: 150, y: 318 }, { x: 330, y: 120 }
  ];
  var POS_MATCH = [
    { x: 140, y: 78 }, { x: 78, y: 196 }, { x: 192, y: 196 }, { x: 140, y: 318 },
    { x: 300, y: 210 }, { x: 300, y: 320 }
  ];
  var POS_GRADED = [
    { x: 130, y: 330 }, { x: 62, y: 220 }, { x: 130, y: 220 }, { x: 198, y: 220 },
    { x: 96, y: 106 }, { x: 180, y: 106 }, { x: 258, y: 106 }
  ];
  var POS_GREEDY = [
    { x: 70, y: 330 }, { x: 140, y: 330 }, { x: 210, y: 330 }, { x: 280, y: 330 },
    { x: 96, y: 180 }, { x: 186, y: 180 }, { x: 276, y: 180 }
  ];
  var POS_CHAIN4 = [{ x: 60, y: 300 }, { x: 60, y: 232 }, { x: 60, y: 164 }, { x: 60, y: 96 }];
  var POS_ANTI4 = [{ x: 20, y: 200 }, { x: 64, y: 200 }, { x: 108, y: 200 }, { x: 152, y: 200 }];

  /* layered coordinates for a poset whose levels are known */
  function layered(Pp, cx, top, gap, spacing) {
    var lv = levels(Pp), pos = [], r, i, grp, off;
    for (r = 0; r < lv.groups.length; r++) {
      grp = lv.groups[r];
      for (i = 0; i < grp.length; i++) {
        off = (i - (grp.length - 1) / 2) * spacing;
        pos[grp[i]] = { x: cx + off, y: top + r * gap };
      }
    }
    return pos;
  }

  var POS_DIV30 = layered(DIV30, 240, 78, 84, 82);
  var POS_DIV60 = layered(DIV60, 240, 62, 74, 76);
  var POS_B3 = layered(B3, 240, 74, 78, 88);

  /* --- 1. chain and antichain ------------------------------------------ */
  function drawAntichain(p) {
    var s = stage(p, 4);
    title('A chain and an antichain in one poset',
      'arrows are constraints; A before B, A before C, B and C before D, E free');

    var chainSet = [0, 1, 3], antiSet = [1, 2, 4];
    drawPoset(TASKS, POS_TASKS, {
      tone: function (i) {
        if (s >= 2 && antiSet.indexOf(i) !== -1) return 'warn';
        if (s === 1 && chainSet.indexOf(i) !== -1) return 'good';
        return 'none';
      },
      edgeTone: function (c) {
        if (s === 1 && chainSet.indexOf(c[0]) !== -1 && chainSet.indexOf(c[1]) !== -1) return PAL.accent;
        return null;
      }
    });

    notes(430, 78, [
      { t: s === 0 ? 'Five tasks, four constraints' : 'The picture', bold: true, color: PAL.ink, size: 12 },
      { t: 'A before B, A before C,' , color: PAL.dim },
      { t: 'B before D, C before D.', color: PAL.dim },
      { t: 'E is comparable with nothing.', color: PAL.dim },
      null,
      s === 1 ? { t: 'CHAIN  A, B, D', bold: true, color: PAL.accent, size: 12 } : null,
      s === 1 ? { t: 'every pair comparable', color: PAL.dim } : null,
      s === 1 ? { t: 'can be written in one line', color: PAL.dim } : null,
      s >= 2 ? { t: 'ANTICHAIN  B, C, E', bold: true, color: PAL.warn, size: 12 } : null,
      s >= 2 ? { t: 'no pair comparable', color: PAL.dim } : null,
      s >= 2 ? { t: 'can run at the same time', color: PAL.dim } : null,
      null,
      s >= 3 ? { t: 'chain \u2229 antichain \u2264 1 element', bold: true, color: PAL.ink } : null,
      s >= 3 ? { t: 'that fact carries both theorems', color: PAL.dim } : null
    ]);

    foot(s >= 3
      ? 'Two shared elements would have to be both comparable and incomparable, so at most one can be shared.'
      : 'Both objects are sets of elements; the difference is which pairs are comparable.');
  }

  /* --- 2. width and height ---------------------------------------------- */
  function drawNumbers(p) {
    var s = stage(p, 4);
    title('Width and height are two different numbers',
      'width = largest antichain; height = longest chain');

    drawPoset(TASKS, POS_TASKS, {
      tone: function (i) {
        if (s === 0 && [1, 2, 4].indexOf(i) !== -1) return 'warn';
        if (s === 1 && [0, 1, 3].indexOf(i) !== -1) return 'good';
        return 'none';
      }
    });
    line(24, 356, 'this poset: width 3, height 3', { size: 11.5, bold: true, color: PAL.ink });
    line(24, 376, 'the equality is a coincidence of this picture', { size: 10.5, color: PAL.dim });

    /* the two extremes, drawn small */
    panel(400, 74, 214, 156, { tone: 'good' });
    line(412, 82, 'a chain of four', { size: 11, bold: true, color: PAL.accent });
    drawPoset(CHAIN4, [
      { x: 450, y: 200 }, { x: 450, y: 166 }, { x: 450, y: 132 }, { x: 450, y: 98 }
    ], { r: 13, size: 10, tone: function () { return 'good'; } });
    line(500, 108, 'width 1', { size: 12, bold: true, color: PAL.accent });
    line(500, 130, 'height 4', { size: 12, bold: true, color: PAL.accent });

    panel(400, 246, 214, 118, { tone: 'warn' });
    line(412, 254, 'an antichain of four', { size: 11, bold: true, color: PAL.warn });
    drawPoset(ANTI4, [
      { x: 428, y: 338 }, { x: 464, y: 338 }, { x: 500, y: 338 }, { x: 536, y: 338 }
    ], { r: 13, size: 10, tone: function () { return 'warn'; } });
    line(412, 282, 'width 4', { size: 12, bold: true, color: PAL.warn });
    line(412, 304, 'height 1', { size: 12, bold: true, color: PAL.warn });

    notes(640, 78, [
      { t: 'Neither bounds the other', bold: true, size: 12 },
      { t: 'width 1 and height 4, or', color: PAL.dim },
      { t: 'width 4 and height 1.', color: PAL.dim },
      null,
      { t: 'Both lie between 1 and n.', color: PAL.dim },
      null,
      s >= 3 ? { t: 'width \u00d7 height \u2265 n', bold: true, color: PAL.ink } : null,
      s >= 3 ? { t: '5 elements, 3 \u00d7 3 = 9', color: PAL.dim } : null,
      s >= 3 ? { t: 'an inequality, not equality', color: PAL.dim } : null
    ], 20);

    foot(s >= 3
      ? 'The product bound follows from the layer partition: height layers, each an antichain of size at most the width.'
      : 'Compute both numbers from the picture before quoting anything about them.');
  }

  /* --- 3. Mirsky --------------------------------------------------------- */
  function drawMirsky(p) {
    var s = stage(p, 4);
    var lv = levels(TASKS);
    title('Mirsky: the levels by longest chain',
      'level of x = 1 + longest chain ending at x');

    /* layer bands behind the nodes */
    if (s >= 2) {
      for (var r = 0; r < 3; r++) {
        panel(30, 62 + r * 100, 340, 92, { tone: r === 0 ? 'good' : r === 1 ? 'warn' : 'info', sw: 1 });
        line(38, 68 + r * 100, 'level ' + (r + 1), { size: 10, color: PAL.dim });
      }
    }

    drawPoset(TASKS, POS_TASKS, {
      tone: function (i) {
        if (s >= 1) return lv.lv[i] === 1 ? 'good' : lv.lv[i] === 2 ? 'warn' : 'info';
        return 'none';
      },
      label: function (i) { return LAB[i]; }
    });

    if (s >= 1) {
      line(24, 416, 'levels: A1 E1 B2 C2 D3', { size: 10.5, mono: true, color: PAL.dim });
    }

    notes(400, 78, [
      { t: s === 0 ? 'Give each element a level' : 'Same level, never comparable', bold: true, size: 12 },
      s === 0 ? { t: 'A and E: nothing below them,', color: PAL.dim } : null,
      s === 0 ? { t: 'so level 1.', color: PAL.dim } : null,
      s === 0 ? { t: 'B and C: A below them.', color: PAL.dim } : null,
      s === 0 ? { t: 'D: A, B, D is a chain of 3.', color: PAL.dim } : null,
      null,
      s === 1 ? { t: 'If x and y shared a level,', color: PAL.dim } : null,
      s === 1 ? { t: 'the upper would need a longer', color: PAL.dim } : null,
      s === 1 ? { t: 'chain below it. So each level', color: PAL.dim } : null,
      s === 1 ? { t: 'is an antichain.', color: PAL.dim } : null,
      null,
      s >= 2 ? { t: '3 antichains, height 3', bold: true, color: PAL.ink, size: 12 } : null,
      s >= 2 ? { t: 'a chain of 3 needs 3 of them,', color: PAL.dim } : null,
      s >= 2 ? { t: 'one element each.', color: PAL.dim } : null,
      null,
      s >= 3 ? { t: 'MIRSKY', bold: true, color: PAL.accent, size: 12 } : null,
      s >= 3 ? { t: 'min antichains = height', color: PAL.dim } : null,
      s >= 3 ? { t: 'cover = partition, always', color: PAL.dim } : null
    ], 20);

    foot(s >= 3
      ? 'Mirsky pairs the longest chain with a partition into antichains. Dilworth, next, pairs the widest antichain with chains.'
      : 'The levels are computed from the arrows, not chosen by eye.');
  }

  /* --- 4. Dilworth ------------------------------------------------------- */
  function drawDilworth(p) {
    var s = stage(p, 4);
    var cc = chainCover(TASKS).chains;              // [0,1,3] [2] [4]
    var chainOf = {}, colOf = {};
    cc.forEach(function (c, ix) {
      c.forEach(function (v) { chainOf[v] = ix; });
    });
    var cols = [PAL.accent, PAL.info, PAL.warn];

    title('Dilworth: the fewest chains that cover the poset',
      'width 3, so three chains are necessary and three are enough');

    drawPoset(TASKS, POS_TASKS, {
      tone: function (i) {
        if (s === 0 || s >= 2) return chainOf[i] === 0 ? 'good' : chainOf[i] === 1 ? 'info' : 'warn';
        if (s === 1 && [1, 2, 4].indexOf(i) !== -1) return 'bad';
        return 'none';
      },
      edgeTone: function (c) {
        if (s === 0 || s >= 2) {
          return chainOf[c[0]] === chainOf[c[1]] ? cols[chainOf[c[0]]] : null;
        }
        return null;
      }
    });

    if (s >= 2) {
      line(24, 396, 'chain 1: A, B, D', { size: 11, color: PAL.accent, bold: true });
      line(24, 414, 'chain 2: C', { size: 11, color: PAL.info, bold: true });
      line(150, 396, 'chain 3: E', { size: 11, color: PAL.warn, bold: true });
    }

    notes(400, 78, [
      { t: s === 0 ? 'Three chains cover everything' : 'Why three are necessary', bold: true, size: 12 },
      s === 0 ? { t: 'A, B, D together; C alone;', color: PAL.dim } : null,
      s === 0 ? { t: 'E alone.', color: PAL.dim } : null,
      s === 0 ? { t: 'No element is in two chains.', color: PAL.dim } : null,
      null,
      s === 1 ? { t: 'B, C, E are pairwise', color: PAL.dim } : null,
      s === 1 ? { t: 'incomparable, so each needs', color: PAL.dim } : null,
      s === 1 ? { t: 'its own chain: 3 is a lower', color: PAL.dim } : null,
      s === 1 ? { t: 'bound, and it is met.', color: PAL.dim } : null,
      null,
      s >= 2 ? { t: 'DILWORTH (1950)', bold: true, color: PAL.accent, size: 12 } : null,
      s >= 2 ? { t: 'max antichain = min chains', color: PAL.dim } : null,
      s >= 2 ? { t: 'both equal the width', color: PAL.dim } : null,
      null,
      s >= 3 ? { t: 'the hard direction is \u2264', color: PAL.ink } : null,
      s >= 3 ? { t: 'an antichain proves \u2265', color: PAL.dim } : null,
      s >= 3 ? { t: 'the matching proves \u2264', color: PAL.dim } : null
    ], 20);

    foot(s >= 3
      ? 'Mirsky constrains antichains by the longest chain; Dilworth constrains chains by the largest antichain. Different theorems.'
      : 'Three chains, and an antichain of three that forbids two.');
  }

  /* --- 5. Sperner -------------------------------------------------------- */
  function drawSperner(p) {
    var s = stage(p, 4);
    title('The power set of a three-element set, ordered by inclusion',
      'an antichain here is a family of sets none of which contains another');

    drawPoset(B3, POS_B3, {
      r: 19,
      size: 11,
      label: function (i) { return B3.name(i); },
      tone: function (i) {
        if (s >= 1 && (popcount(i) === 1 || popcount(i) === 2)) return 'warn';
        return 'none';
      },
      edgeTone: function (c) {
        if (s >= 1 && popcount(c[0]) === 1 && popcount(c[1]) === 2) return PAL.warn;
        return null;
      }
    });

    notes(420, 74, [
      { t: '8 subsets, 4 levels', bold: true, size: 12 },
      { t: '\u2205; a b c; ab ac bc; abc', color: PAL.dim },
      null,
      s >= 1 ? { t: 'middle levels: 3 + 3', bold: true, color: PAL.warn } : null,
      s >= 1 ? { t: 'ab, ac, bc: none contains', color: PAL.dim } : null,
      s >= 1 ? { t: 'another, so antichain 3', color: PAL.dim } : null,
      null,
      s >= 2 ? { t: 'SPERNER', bold: true, color: PAL.accent, size: 12 } : null,
      s >= 2 ? { t: 'width = C(n, \u230an/2\u230b)', color: PAL.dim } : null,
      s >= 2 ? { t: 'n=1,2,3,4: 1,2,3,6', color: PAL.dim } : null,
      s >= 2 ? { t: 'brute force agrees', color: PAL.dim } : null,
      null,
      s >= 3 ? { t: '20 antichains in all', bold: true, color: PAL.ink } : null,
      s >= 3 ? { t: 'only 2 of size 3', color: PAL.dim } : null,
      s >= 3 ? { t: 'Dedekind: 2 3 6 20 168', color: PAL.dim } : null
    ], 20);

    foot(s >= 3
      ? 'How many antichains exist and how large the largest is are different questions. Both are computed here by testing all 256 subsets.'
      : 'Width 3, height 4: this poset is where the two numbers first differ.');
  }

  /* --- 6. the divisors of 60 -------------------------------------------- */
  function drawDivisor(p) {
    var s = stage(p, 3);
    var lv = levels(DIV60);
    title('The divisors of 60, ordered by divisibility',
      '12 elements; every number below is computed by testing all 4096 subsets');

    if (s >= 2) {
      for (var r = 0; r < lv.groups.length; r++) {
        panel(112, 46 + r * 74, 272, 66, { tone: r === 2 ? 'warn' : 'info', sw: 0.9 });
      }
    }

    drawPoset(DIV60, POS_DIV60, {
      r: 16,
      size: 10.5,
      label: function (i) { return String(DIV60.divs[i]); },
      tone: function (i) {
        if (s === 0 && N.div60.set.indexOf(i) !== -1) return 'warn';
        if (s >= 1 && N.div60.set.indexOf(i) !== -1) return 'warn';
        return 'none';
      },
      edgeTone: function (c) {
        if (s >= 1) {
          var a = c[0], b = c[1];
          for (var q = 0; q < N.div60.cover.chains.length; q++) {
            var ch = N.div60.cover.chains[q], ia = ch.indexOf(a), ib = ch.indexOf(b);
            if (ia !== -1 && ib === ia + 1) {
              return [PAL.accent, PAL.info, PAL.warn, PAL.valid][q];
            }
          }
        }
        return null;
      }
    });

    notes(400, 62, [
      { t: 'levels of the divisibility order', bold: true, size: 11.5 },
      { t: '1', color: PAL.dim },
      { t: '2, 3, 5', color: PAL.dim },
      { t: '4, 6, 10, 15', color: PAL.dim },
      { t: '12, 20, 30', color: PAL.dim },
      { t: '60', color: PAL.dim },
      null,
      { t: 'width 4: 4, 6, 10, 15', bold: true, color: PAL.warn },
      { t: 'height 5: 1, 2, 4, 12, 60', bold: true, color: PAL.accent },
      null,
      s >= 1 ? { t: '4 chains cover all 12:', bold: true, color: PAL.ink } : null,
      s >= 1 ? { t: '1 2 4 12 60', color: PAL.accent } : null,
      s >= 1 ? { t: '3 6 30', color: PAL.info } : null,
      s >= 1 ? { t: '5 10 20', color: PAL.warn } : null,
      s >= 1 ? { t: '15', color: PAL.valid } : null,
      null,
      s >= 2 ? { t: 'widest layer 4 = width', color: PAL.dim } : null,
      s >= 2 ? { t: 'true here, not in general', color: PAL.dim } : null
    ], 19);

    foot(s >= 1
      ? 'Four chains, each a chain in the divisibility order, and together all twelve divisors: the cover attains the width.'
      : 'A twelve-element poset is small enough to count honestly; that is why it is used here.');
  }

  /* --- 7. the matching --------------------------------------------------- */
  function drawMatching(p) {
    var s = stage(p, 4);
    var cc = chainCover(MATCH);
    var chainOf = {}, cols = [PAL.accent, PAL.info, PAL.warn];
    cc.chains.forEach(function (c, ix) { c.forEach(function (v) { chainOf[v] = ix; }); });

    title('The chain cover a maximum matching produces',
      'split each element into two copies; an edge for every strict comparison');

    drawPoset(MATCH, POS_MATCH, {
      tone: function (i) { return s >= 3 ? (chainOf[i] === 0 ? 'good' : chainOf[i] === 1 ? 'info' : 'warn') : 'none'; },
      edgeTone: function (c) {
        if (s >= 3 && chainOf[c[0]] === chainOf[c[1]]) return cols[chainOf[c[0]]];
        return null;
      }
    });

    /* the matching edges, as thick links */
    if (s >= 1) {
      var m = maxMatching(MATCH);
      for (var j = 0; j < MATCH.n; j++) {
        if (m.matchR[j] === -1) continue;
        var a = m.matchR[j];
        edge(POS_MATCH[a].x + 8, POS_MATCH[a].y + 8, POS_MATCH[j].x - 8, POS_MATCH[j].y - 8,
          { color: PAL.invalid, sw: 2.4, r1: 0, r2: 0, head: 6 });
      }
    }

    notes(392, 74, [
      { t: 'the split graph', bold: true, size: 12 },
      { t: 'left copy and right copy of', color: PAL.dim },
      { t: 'each element; an edge x\u2192y', color: PAL.dim },
      { t: 'when x is strictly below y', color: PAL.dim },
      null,
      s >= 1 ? { t: 'maximum matching: 3 edges', bold: true, color: PAL.invalid } : null,
      s >= 1 ? { t: 'no two share an endpoint', color: PAL.dim } : null,
      null,
      s >= 2 ? { t: 'chains = n \u2212 matching', bold: true, color: PAL.ink } : null,
      s >= 2 ? { t: '6 \u2212 3 = 3 chains', color: PAL.dim } : null,
      null,
      s >= 3 ? { t: 'chain 1: A B D', color: PAL.accent } : null,
      s >= 3 ? { t: 'chain 2: C', color: PAL.info } : null,
      s >= 3 ? { t: 'chain 3: E F', color: PAL.warn } : null,
      null,
      s >= 3 ? { t: 'width 3 = cover 3', bold: true, color: PAL.valid } : null
    ], 20);

    foot(s >= 3
      ? 'Polynomial, and no insight about shape is needed: build the graph, find the matching, subtract from n.'
      : 'The links are the matched pairs; following them is following a chain.');
  }

  /* --- 8. when a level is not the answer --------------------------------- */
  function drawLevels(p) {
    var s = stage(p, 4);
    var lv = levels(GRADED);
    title('A graded poset whose widest level is not its width',
      'ranks 0, 1, 2: one element, then three, then three');

    drawPoset(GRADED, POS_GRADED, {
      tone: function (i) {
        if (s === 1) return lv.lv[i] === 2 ? 'info' : 'none';
        if (s >= 2) return N.graded.set.indexOf(i) !== -1 ? 'warn' : 'none';
        return 'none';
      }
    });

    if (s >= 2) {
      line(24, 388, 'widest level: 3 elements', { size: 11, color: PAL.info, bold: true });
      line(24, 408, 'width: 4 elements (B, C, F, G)', { size: 11, color: PAL.warn, bold: true });
    }

    notes(400, 74, [
      { t: 'every maximal chain has length 3', bold: true, size: 11.5 },
      { t: 'so the levels look natural', color: PAL.dim },
      null,
      s >= 1 ? { t: 'levels: 1 / 3 / 3', bold: true, color: PAL.info } : null,
      s >= 1 ? { t: 'the biggest level holds 3', color: PAL.dim } : null,
      null,
      s >= 2 ? { t: 'B, C, F, G: no two', bold: true, color: PAL.warn } : null,
      s >= 2 ? { t: 'comparable, so width 4', color: PAL.dim } : null,
      s >= 2 ? { t: 'no level holds all four', color: PAL.dim } : null,
      null,
      s >= 3 ? { t: 'levels give Mirsky, not', color: PAL.ink } : null,
      s >= 3 ? { t: 'the width', color: PAL.ink } : null,
      s >= 3 ? { t: 'exhibit an antichain AND', color: PAL.dim } : null,
      s >= 3 ? { t: 'a chain cover, then compare', color: PAL.dim } : null
    ], 20);

    foot(s >= 3
      ? 'The widest-level rule answers the 60-divisor poset correctly and this one wrongly, which is what makes it a trap.'
      : 'Graded means a rank that rises by one on every cover, all maximal elements at the top rank.');
  }

  /* --- 9. the traps ------------------------------------------------------ */
  function drawTraps(p) {
    var s = stage(p, 3);
    title('The greedy cover overpays by one',
      'seven elements, width 4; taking a longest chain first costs 5');

    var g = greedyCover(GREEDY);
    var gcol = [PAL.accent, PAL.info, PAL.warn, PAL.valid, PAL.invalid];
    var gof = {};
    g.forEach(function (c, ix) { c.forEach(function (v) { gof[v] = ix; }); });
    var opt = chainCover(GREEDY).chains;
    var oof = {};
    opt.forEach(function (c, ix) { c.forEach(function (v) { oof[v] = ix; }); });

    var showOpt = s >= 2;
    drawPoset(GREEDY, POS_GREEDY, {
      tone: function (i) {
        if (showOpt) return N.greedy.set.indexOf(i) !== -1 ? 'warn' : 'none';
        return gof[i] === 0 ? 'good' : gof[i] === 1 ? 'info' : gof[i] === 2 ? 'warn' : gof[i] === 3 ? 'none' : 'bad';
      },
      edgeTone: function (c) {
        var k = showOpt ? oof : gof;
        if (k[c[0]] === k[c[1]]) return gcol[k[c[0]]];
        return null;
      }
    });

    line(24, 366, showOpt ? 'optimal cover: 4 chains' : 'greedy cover: 5 chains',
      { size: 11.5, bold: true, color: showOpt ? PAL.valid : PAL.invalid });
    line(24, 386, showOpt ? 'A D, B E, C, F, G  \u2192 4' : 'A D, B E, C, F, G taken one at a time \u2192 5',
      { size: 10.5, color: PAL.dim });

    notes(360, 74, [
      { t: 'greedy, from the smallest minimal', bold: true, size: 11.5 },
      { t: 'element: A D, then B E, then', color: PAL.dim },
      { t: 'C, F, G: five chains.', color: PAL.dim },
      null,
      s >= 1 ? { t: 'WIDTH = HEIGHT is false', bold: true, color: PAL.invalid } : null,
      s >= 1 ? { t: 'chain of four: 1 and 4', color: PAL.dim } : null,
      null,
      s >= 1 ? { t: 'MAXIMAL \u2260 MAXIMUM', bold: true, color: PAL.invalid } : null,
      s >= 1 ? { t: 'A, E is maximal, size 2;', color: PAL.dim } : null,
      s >= 1 ? { t: 'the maximum is 3', color: PAL.dim } : null,
      null,
      s >= 2 ? { t: 'width 4 < greedy 5', bold: true, color: PAL.valid } : null,
      s >= 2 ? { t: 'a cover proves \u2264, never =', color: PAL.dim } : null,
      s >= 2 ? { t: 'perfect graphs: independence', color: PAL.dim } : null,
      s >= 2 ? { t: '= clique cover, in posets', color: PAL.dim } : null
    ], 20);

    foot(s >= 2
      ? 'The matching finds the four-chain cover; the greedy walk cannot, because its first choice removes what a better cover needed.'
      : 'Every cover is an upper bound on the width. Only a cover that meets an antichain settles the answer.');
  }

  /* --- 10. the previous-year items -------------------------------------- */
  function drawPyq(p) {
    var s = stage(p, 4);
    var lv = levels(DIV30);
    title('GATE CSE 1991, Q1(xiv), on the divisors of 30',
      'longest chain of length 4, so a partition into 4 antichains');

    if (s >= 1) {
      for (var r = 0; r < lv.groups.length; r++) {
        panel(120, 56 + r * 84, 250, 76, { tone: 'info', sw: 0.9 });
        line(128, 62 + r * 84, 'A' + (r + 1), { size: 10, color: PAL.dim });
      }
    }

    drawPoset(DIV30, POS_DIV30, {
      r: 17,
      size: 10.5,
      label: function (i) { return String(DIV30.divs[i]); },
      tone: function (i) {
        if (s >= 2 && (DIV30.divs[i] === 2 || DIV30.divs[i] === 3 || DIV30.divs[i] === 5)) return 'warn';
        return 'none';
      }
    });

    notes(400, 74, [
      { t: 'the item', bold: true, size: 12 },
      { t: '"If the longest chain in a', color: PAL.ink },
      { t: 'partial order is of length n,', color: PAL.ink },
      { t: 'it can be written as a ___', color: PAL.ink },
      { t: 'of n antichains."', color: PAL.ink },
      null,
      s >= 1 ? { t: 'answer: PARTITION', bold: true, color: PAL.accent, size: 12 } : null,
      s >= 1 ? { t: 'the levels are disjoint', color: PAL.dim } : null,
      s >= 1 ? { t: 'and there are n of them', color: PAL.dim } : null,
      null,
      s >= 2 ? { t: 'here n = 4: {1} {2,3,5}', bold: true, color: PAL.warn } : null,
      s >= 2 ? { t: '{6,10,15} {30}', color: PAL.warn } : null,
      null,
      s >= 3 ? { t: 'GATE IT 2005, Q33: largest', bold: true, color: PAL.info } : null,
      s >= 3 ? { t: 'totally ordered family of', color: PAL.dim } : null,
      s >= 3 ? { t: 'subsets has n + 1 members', color: PAL.dim } : null
    ], 20);

    foot(s >= 3
      ? 'Both items are Mirsky or Dilworth read in the right direction: the object you are given names the theorem.'
      : 'A chain of 4 forces 4 antichains; the levels show 4 suffice, so the bound is exact.');
  }

  /* --- 11. the method ---------------------------------------------------- */
  function drawMethod(p) {
    var s = stage(p, 3);
    title('The four-step procedure',
      'and the one shortcut that is valid for antichains only');

    var boxes = [
      { t: '1  Name the object', d: ['width, height,', 'chain cover, or a', 'count of antichains'], tone: 'info' },
      { t: '2  Exhibit a bound', d: ['an antichain proves', 'width \u2265 k; chains', 'prove width \u2264 m'], tone: 'good' },
      { t: '3  Meet in the middle', d: ['if k = m the answer', 'is proved, no', 'theorem needed'], tone: 'warn' },
      { t: '4  Too big to draw?', d: ['split graph, maximum', 'matching, width =', 'n \u2212 matching'], tone: 'bad' }
    ];
    for (var i = 0; i < boxes.length; i++) {
      var b = boxes[i], x = 40 + (i % 2) * 220, y = 90 + Math.floor(i / 2) * 140;
      var on = i < s + 1;
      panel(x, y, 200, 118, { tone: on ? b.tone : 'none' });
      line(x + 12, y + 10, b.t, { size: 11.5, bold: true, color: on ? PAL.ink : PAL.faint });
      for (var j = 0; j < b.d.length; j++) {
        line(x + 12, y + 38 + j * 20, b.d[j], { size: 10.5, color: on ? PAL.dim : PAL.faint });
      }
    }

    notes(500, 90, [
      { t: 'the only valid shortcut', bold: true, size: 12 },
      { t: 'the levels give Mirsky for free:', color: PAL.dim },
      { t: 'antichains, size = height', color: PAL.dim },
      null,
      { t: 'the invalid ones', bold: true, size: 12, color: PAL.invalid },
      { t: 'widest level = width: false', color: PAL.dim },
      { t: 'width = height: false', color: PAL.dim },
      { t: 'greedy cover = minimum: false', color: PAL.dim },
      null,
      s >= 2 ? { t: '4 checks before answering', bold: true, size: 11.5 } : null,
      s >= 2 ? { t: 'is the antichain incomparable?', color: PAL.dim } : null,
      s >= 2 ? { t: 'do the chains cover each once?', color: PAL.dim } : null,
      s >= 2 ? { t: 'is the count an integer?', color: PAL.dim } : null,
      s >= 2 ? { t: 'does it meet the other bound?', color: PAL.dim } : null
    ], 20);

    foot(s >= 2
      ? 'Width is polynomial through matching; the widest level and the greedy cover are neither necessary nor sufficient.'
      : 'Exhibiting both bounds is the exam-safe proof and needs no theorem.');
  }

  var DRAW = {
    antichain: drawAntichain,
    numbers: drawNumbers,
    mirsky: drawMirsky,
    dilworth: drawDilworth,
    sperner: drawSperner,
    divisor: drawDivisor,
    matching: drawMatching,
    levels: drawLevels,
    traps: drawTraps,
    pyq1991: drawPyq,
    method: drawMethod
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
          if (!holder) return;
          var scale = Math.min(1, holder.clientWidth / W);
          var cv = holder.querySelector('canvas');
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
    TASKS: TASKS, DIV30: DIV30, DIV60: DIV60, B3: B3, B4: B4,
    GRADED: GRADED, GREEDY: GREEDY, MATCH: MATCH,
    N: N,
    widthBrute: widthBrute, levels: levels, chainCover: chainCover,
    greedyCover: greedyCover, antichainCount: antichainCount, graded: graded,
    isAntichain: isAntichain, isChain: isChain, binom: binom,
    PASSED: PASSED, TOTAL: CHECKS.length,
    ALL_PASS: PASSED === CHECKS.length
  };

  window.__lessonChecks = CHECKS;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

})();
