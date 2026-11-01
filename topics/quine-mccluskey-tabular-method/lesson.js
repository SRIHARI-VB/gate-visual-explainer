/* ==========================================================================
   quine-mccluskey-tabular-method — lesson.js
   Four layers, in order:
     1. THE MODEL   — every number this lesson shows, computed here.
     2. THE CHECKS  — each computed value re-verified against a definition.
     3. RENDER      — reads the model; never re-derives it.
     4. BOOT        — p5.js first, the browser's own canvas as the fallback.

   The model is the tabular method itself, written twice on purpose:
     - qm()       performs the combining passes, exactly as a student would,
                  with ticks and rounds;
     - maximal()  ignores the table entirely and enumerates all 3^n cubes,
                  keeping the implicants that no larger implicant contains.
   The two are independent, and check 2 asserts that they agree. That is the
   whole reason to trust either of them: a table that agrees with the
   definition on an exhaustively enumerated domain is a proof for that domain,
   not an illustration.

   The covering half is written twice as well: petrick() expands the chart into
   a product of sums and absorbs it, while minCovers() enumerates every subset
   of rows. Check 12 asserts that the two report the same minimal covers.
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
  var SURF = PAL.surface, SURF2 = PAL.surface2, BORDER = PAL.border;
  var ACCDIM = PAL.accentDim || '#d6efeb';
  var WARNDIM = PAL.warnDim || '#fbeed3';
  var BADDIM = PAL.invalidDim || '#fbe4e2';

/* ======================================================================
   LAYER 1 - THE MODEL
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}

/* ---------- 1a. cubes ---------- */

/* A cube is a string over {0,1,-}: '0--0' over w,x,y,z. A minterm is an int. */

function bitOf(m, n, i) {            // i = 0 is the most significant position
  return (m >> (n - 1 - i)) & 1;
}

function covers(cube, m, n) {
  for (var i = 0; i < n; i++) {
    var c = cube.charAt(i);
    if (c === '-') continue;
    if ((c === '1' ? 1 : 0) !== bitOf(m, n, i)) return false;
  }
  return true;
}

function mintermsOf(cube, n) {
  var out = [];
  for (var m = 0; m < (1 << n); m++) if (covers(cube, m, n)) out.push(m);
  return out;
}

function dashCount(cube) {
  var k = 0;
  for (var i = 0; i < cube.length; i++) if (cube.charAt(i) === '-') k++;
  return k;
}

function literals(cube) { return cube.length - dashCount(cube); }

function onesCount(cube) {
  var k = 0;
  for (var i = 0; i < cube.length; i++) if (cube.charAt(i) === '1') k++;
  return k;
}

function bin(m, n) {
  var s = '';
  for (var i = 0; i < n; i++) s += bitOf(m, n, i) ? '1' : '0';
  return s;
}

function allCubes(n) {
  var out = [''];
  for (var i = 0; i < n; i++) {
    var next = [];
    for (var j = 0; j < out.length; j++) {
      next.push(out[j] + '0'); next.push(out[j] + '1'); next.push(out[j] + '-');
    }
    out = next;
  }
  return out;
}

/* the literal name of a cube, for display: '0--0' over wxyz -> w'y' */
function cubeName(cube, vars) {
  var parts = [];
  for (var i = 0; i < cube.length; i++) {
    var c = cube.charAt(i);
    if (c === '-') continue;
    parts.push(vars.charAt(i) + (c === '1' ? '' : '\u2032'));
  }
  return parts.length ? parts.join('') : '1';
}

/* ---------- 1b. the two independent routes to the prime implicants ---------- */

/* route 1: the table. group by ones, combine neighbours, tick both parents. */
function qm(n, on, dc) {
  var seen = {};
  var cur = [];
  on.concat(dc).forEach(function (m) {
    var s = bin(m, n);
    if (!seen[s]) { seen[s] = 1; cur.push(s); }
  });
  var rounds = [];
  var primes = [];
  var guard = 0;
  while (cur.length && guard++ < 40) {
    cur.sort();
    var used = {}, next = {}, merges = [];
    for (var i = 0; i < cur.length; i++) {
      for (var j = i + 1; j < cur.length; j++) {
        var a = cur[i], b = cur[j], diff = -1, bad = false;
        for (var k = 0; k < n; k++) {
          if (a.charAt(k) !== b.charAt(k)) { if (diff >= 0) { bad = true; break; } diff = k; }
        }
        if (bad || diff < 0) continue;
        var merged = a.substring(0, diff) + '-' + a.substring(diff + 1);
        merges.push({ a: a, b: b, to: merged, at: diff });
        used[a] = 1; used[b] = 1; next[merged] = 1;
      }
    }
    var survivors = cur.filter(function (t) { return !used[t]; });
    rounds.push({ terms: cur.slice(), merges: merges, survivors: survivors });
    survivors.forEach(function (t) { if (primes.indexOf(t) < 0) primes.push(t); });
    cur = Object.keys(next).sort();
  }
  primes.sort();
  return { primes: primes, rounds: rounds };
}

/* route 2: the definition. enumerate every cube, keep the maximal implicants. */
function allImplicants(n, on, dc) {
  var ok = {};
  on.concat(dc).forEach(function (m) { ok[m] = 1; });
  var out = [];
  allCubes(n).forEach(function (c) {
    var good = true;
    for (var m = 0; m < (1 << n); m++) {
      if (covers(c, m, n) && !ok[m]) { good = false; break; }
    }
    if (good) out.push(c);
  });
  return out;
}

function maximal(n, on, dc) {
  var imps = allImplicants(n, on, dc);
  var sets = imps.map(function (c) { return mintermsOf(c, n).join(','); });
  var out = [];
  for (var i = 0; i < imps.length; i++) {
    var contained = false;
    for (var j = 0; j < imps.length; j++) {
      if (i === j) continue;
      if (sets[j] !== sets[i] && mintermsOf(imps[i], n).every(function (m) {
        return covers(imps[j], m, n);
      })) { contained = true; break; }
    }
    if (!contained) out.push(imps[i]);
  }
  return out.sort();
}

/* ---------- 1c. the chart ---------- */

function chartOf(n, primes, on) {
  var cols = on.slice().sort(function (a, b) { return a - b; });
  var rows = primes.map(function (c) {
    return { cube: c, cols: cols.filter(function (m) { return covers(c, m, n); }) };
  });
  return { n: n, primes: primes.slice(), cols: cols, rows: rows };
}

function owners(chart, m) {
  return chart.primes.filter(function (c) { return covers(c, m, chart.n); });
}

function essentialsOf(chart) {
  var out = [];
  chart.cols.forEach(function (m) {
    var o = owners(chart, m);
    if (o.length === 1 && out.indexOf(o[0]) < 0) out.push(o[0]);
  });
  return out;
}

/* row dominance: drop a row whose covered set is a proper subset of another's.
   column dominance: drop a column crossed wherever another column is crossed. */
function reduceByDominance(chart) {
  var rows = chart.rows.map(function (r) { return { cube: r.cube, cols: r.cols.slice() }; });
  var cols = chart.cols.slice();
  var changed = true, guard = 0;
  while (changed && guard++ < 40) {
    changed = false;
    /* rows: keep the larger cover */
    for (var i = 0; i < rows.length && !changed; i++) {
      for (var j = 0; j < rows.length; j++) {
        if (i === j) continue;
        var a = rows[i].cols, b = rows[j].cols;
        var subset = a.every(function (m) { return b.indexOf(m) >= 0; });
        if (subset && a.length < b.length) { rows.splice(i, 1); changed = true; break; }
        if (subset && a.length === b.length && j < i) { rows.splice(i, 1); changed = true; break; }
      }
    }
    if (changed) continue;
    /* columns: keep the harder constraint */
    for (var p = 0; p < cols.length && !changed; p++) {
      for (var q = 0; q < cols.length; q++) {
        if (p === q) continue;
        var cp = rows.filter(function (r) { return r.cols.indexOf(cols[p]) >= 0; });
        var cq = rows.filter(function (r) { return r.cols.indexOf(cols[q]) >= 0; });
        var cpInCq = cp.every(function (r) { return r.cols.indexOf(cols[q]) >= 0; });
        if (cpInCq && cp.length < cq.length) { cols.splice(p, 1); changed = true; break; }
      }
    }
  }
  return { rows: rows, cols: cols };
}

/* ---------- 1d. the covering half, written twice ---------- */

function absorb(terms) {
  var keep = [];
  for (var i = 0; i < terms.length; i++) {
    var s = terms[i], dominated = false;
    for (var j = 0; j < terms.length; j++) {
      if (i === j) continue;
      var o = terms[j];
      if (o.length > s.length) continue;
      var sub = o.every(function (x) { return s.indexOf(x) >= 0; });
      if (sub && (o.length < s.length || j < i)) { dominated = true; break; }
    }
    if (!dominated) keep.push(s);
  }
  return keep;
}

function petrick(chart) {
  var sums = chart.cols.map(function (m) {
    var out = [];
    chart.primes.forEach(function (c, i) { if (covers(c, m, chart.n)) out.push(i); });
    return out;
  }).filter(function (s) { return s.length; });

  var terms = [[]];
  sums.forEach(function (sum) {
    var next = [];
    terms.forEach(function (t) {
      sum.forEach(function (i) {
        var u = t.indexOf(i) >= 0 ? t.slice() : t.concat([i]).sort(function (a, b) { return a - b; });
        next.push(u);
      });
    });
    terms = absorb(next);
  });

  var lit = function (t) {
    var k = 0;
    t.forEach(function (i) { k += literals(chart.primes[i]); });
    return k;
  };
  var minSize = Infinity;
  terms.forEach(function (t) { if (t.length < minSize) minSize = t.length; });
  var bySize = terms.filter(function (t) { return t.length === minSize; });
  var minLit = Infinity;
  bySize.forEach(function (t) { if (lit(t) < minLit) minLit = lit(t); });
  var minima = bySize.filter(function (t) { return lit(t) === minLit; });

  return { sums: sums, products: terms, minima: minima, minSize: minSize, minLit: minLit, lit: lit };
}

function minCovers(n, primes, on) {
  var best = null, out = [];
  for (var r = 1; r <= primes.length; r++) {
    var idx = [];
    (function walk(start, picked) {
      if (picked.length === r) {
        var cover = true;
        for (var c = 0; c < on.length; c++) {
          var hit = false;
          for (var p = 0; p < picked.length; p++) if (covers(primes[picked[p]], on[c], n)) { hit = true; break; }
          if (!hit) { cover = false; break; }
        }
        if (cover) out.push(picked.slice());
        return;
      }
      for (var i = start; i < primes.length; i++) { picked.push(i); walk(i + 1, picked); picked.pop(); }
    })(0, []);
    if (out.length) { best = r; break; }
  }
  if (!best) return { size: 0, covers: [] };
  var lit = function (t) {
    var k = 0; t.forEach(function (i) { k += literals(primes[i]); }); return k;
  };
  var minLit = Math.min.apply(null, out.map(lit));
  return { size: best, covers: out.filter(function (t) { return lit(t) === minLit; }) };
}

/* does an SOP of cubes accept this minterm? */
function evalSOP(cubes, m, n) {
  for (var i = 0; i < cubes.length; i++) if (covers(cubes[i], m, n)) return 1;
  return 0;
}

function sopMatches(cubes, n, on, dc) {
  var ok = {};
  on.concat(dc).forEach(function (m) { ok[m] = 1; });
  for (var m = 0; m < (1 << n); m++) {
    var want = ok[m] ? 1 : 0;
    if (evalSOP(cubes, m, n) !== want) return false;
  }
  return true;
}

/* ---------- 1e. the functions this lesson works ---------- */

var VARS4 = 'wxyz';
var VARS3 = 'ABC';

var F2015 = { n: 4, vars: VARS4, on: [0, 2, 4, 5, 6, 10], dc: [], label: 'GATE CSE 2015 Set 3, Q43' };
var F2018 = { n: 4, vars: VARS4, on: [0, 2, 5, 7, 9, 11], dc: [3, 8, 10, 12, 14], label: 'GATE CSE 2018, Q49' };
var FCYC  = { n: 3, vars: VARS3, on: [0, 1, 2, 5, 6, 7], dc: [], label: 'cyclic, \u03a3m(0,1,2,5,6,7)' };

function solve(f) {
  var t = qm(f.n, f.on, f.dc);
  var chart = chartOf(f.n, t.primes, f.on);
  var ess = essentialsOf(chart);
  var pk = petrick(chart);
  var mc = minCovers(f.n, t.primes, f.on);
  return {
    f: f, primes: t.primes, rounds: t.rounds, chart: chart,
    essentials: ess, petrick: pk, brute: mc,
    reduced: reduceByDominance(chart),
    maxImplicants: maximal(f.n, f.on, f.dc)
  };
}

var S2015 = solve(F2015);
var S2018 = solve(F2018);
var SCYC  = solve(FCYC);

/* the empty and full functions, as boundary cases */
var S_EMPTY = qm(4, [], []);
var S_FULL  = qm(4, [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15], []);
var S_ONE   = qm(4, [5], []);

/* the worst case over all four-variable functions with eight minterms */
var WORST = (function () {
  var best = { count: 0, on: null };
  var pool = [];
  for (var m = 0; m < 16; m++) pool.push(m);
  (function comb(start, picked) {
    if (picked.length === 8) {
      var p = qm(4, picked, []);
      if (p.primes.length > best.count) best = { count: p.primes.length, on: picked.slice() };
      return;
    }
    for (var i = start; i < 16; i++) { picked.push(i); comb(i + 1, picked); picked.pop(); }
  })(0, []);
  return best;
})();

/* ---------- 1f. the model object ---------- */

var M = {
  W: W, H: H,
  F2015: F2015, F2018: F2018, FCYC: FCYC,
  S2015: S2015, S2018: S2018, SCYC: SCYC,
  S_EMPTY: S_EMPTY, S_FULL: S_FULL, S_ONE: S_ONE,
  WORST: WORST,
  VARS4: VARS4, VARS3: VARS3,
  helpers: {
    covers: covers, mintermsOf: mintermsOf, bin: bin, cubeName: cubeName,
    literals: literals, dashCount: dashCount, onesCount: onesCount,
    qm: qm, maximal: maximal, chartOf: chartOf, essentialsOf: essentialsOf,
    petrick: petrick, minCovers: minCovers, evalSOP: evalSOP, sopMatches: sopMatches,
    reduceByDominance: reduceByDominance
  }
};

/* ======================================================================
   LAYER 2 - THE CHECKS
   ====================================================================== */

/* 1. the table agrees with the definition, exhaustively, on all three functions */
chk('QM output equals the maximal implicants (2015)',
    S2015.primes.join('|') === S2015.maxImplicants.join('|'),
    S2015.primes.join(' ') + ' vs ' + S2015.maxImplicants.join(' '));
chk('QM output equals the maximal implicants (2018)',
    S2018.primes.join('|') === S2018.maxImplicants.join('|'));
chk('QM output equals the maximal implicants (cyclic)',
    SCYC.primes.join('|') === SCYC.maxImplicants.join('|'));

/* 2. the two published keys */
chk('GATE 2015 S3 Q43: three prime implicants (key 3)',
    S2015.primes.length === 3, 'got ' + S2015.primes.length);
chk('GATE 2018 Q49: three essential prime implicants (key 3)',
    S2018.essentials.length === 3, 'got ' + S2018.essentials.length);

/* 3. the round structure quoted in the captions */
chk('2015 table: 6 + 2 + 0 merges over three rounds',
    S2015.rounds.length === 3 &&
    S2015.rounds.map(function (r) { return r.merges.length; }).join(',') === '6,2,0',
    S2015.rounds.map(function (r) { return r.merges.length; }).join(','));

/* 4. every merge is a genuine containment of its two parents */
var mergeOK = true;
[S2015, S2018, SCYC].forEach(function (s) {
  s.rounds.forEach(function (r) {
    r.merges.forEach(function (mg) {
      var kid = mintermsOf(mg.to, s.f.n);
      [mg.a, mg.b].forEach(function (par) {
        mintermsOf(par, s.f.n).forEach(function (m) { if (kid.indexOf(m) < 0) mergeOK = false; });
      });
    });
  });
});
chk('every merge contains both parents', mergeOK);

/* 5. a cube of k dashes covers exactly 2^k minterms */
var powOK = true;
for (var n2 = 2; n2 <= 4; n2++) {
  allCubes(n2).forEach(function (c) {
    if (mintermsOf(c, n2).length !== Math.pow(2, dashCount(c))) powOK = false;
  });
}
chk('a cube with k dashes covers 2^k minterms', powOK);

/* 6. the unticked count equals the prime count */
chk('2015: unticked survivors number 3, matching the prime count',
    S2015.rounds.reduce(function (a, r) { return a + r.survivors.length; }, 0) === S2015.primes.length);

/* 7. essentials are read from single-cross columns, and on 2015 all rows are essential */
chk('2015: all three primes are essential', S2015.essentials.length === 3);
chk('2015: the essentials alone cover all six minterms',
    S2015.chart.cols.every(function (m) {
      return S2015.essentials.some(function (c) { return covers(c, m, 4); });
    }));

/* 8. the 2015 cover costs eight literals and reproduces the function */
chk('2015: minimal cover has 8 literals and covers the function exactly',
    S2015.brute.covers.length === 1 &&
    S2015.brute.covers[0].reduce(function (a, i) { return a + literals(S2015.primes[i]); }, 0) === 8 &&
    sopMatches(S2015.brute.covers[0].map(function (i) { return S2015.primes[i]; }), 4, F2015.on, F2015.dc));

/* 9. the 2018 essentials all rest on a required minterm, never on a don't-care */
var essOnMinterms = S2018.essentials.map(function (c) {
  return S2018.chart.cols.filter(function (m) { return owners(S2018.chart, m).length === 1 && covers(c, m, 4); })[0];
});
chk('2018: each essential is forced by a required minterm, not a don\'t-care',
    essOnMinterms.length === 3 && essOnMinterms.every(function (m) { return m !== undefined; }),
    essOnMinterms.join(','));

/* 10. the 2018 chart has a row that covers no required minterm */
chk('2018: exactly one prime covers only don\'t-cares (an empty row)',
    S2018.chart.rows.filter(function (r) { return r.cols.length === 0; }).length === 1,
    S2018.chart.rows.filter(function (r) { return r.cols.length === 0; }).map(function (r) { return r.cube; }).join(''));

/* 11. the don't-cares really are load-bearing: without them the primes differ */
chk('2018: dropping the don\'t-cares changes the prime set',
    qm(4, F2018.on, []).primes.join('|') !== S2018.primes.join('|'),
    qm(4, F2018.on, []).primes.length + ' primes without them');

/* 12. Petrick and brute force agree on all three functions */
chk('Petrick and exhaustive search report the same minimal covers (all three)',
    [S2015, S2018, SCYC].every(function (s) {
      var a = s.petrick.minima.map(function (t) { return t.slice().sort().join(','); }).sort().join('|');
      var b = s.brute.covers.map(function (t) { return t.slice().sort().join(','); }).sort().join('|');
      return a === b;
    }));

/* 13. the cyclic chart: six primes, no essential, every column exactly two crosses */
chk('cyclic: six primes and zero essentials',
    SCYC.primes.length === 6 && SCYC.essentials.length === 0,
    SCYC.primes.length + ' primes, ' + SCYC.essentials.length + ' essential');
chk('cyclic: every column holds exactly two crosses',
    SCYC.chart.cols.every(function (m) { return owners(SCYC.chart, m).length === 2; }));
chk('cyclic: every prime covers exactly two minterms',
    SCYC.chart.rows.every(function (r) { return r.cols.length === 2; }));

/* 14. the cyclic chart is irreducible, and no two-row cover exists */
chk('cyclic: dominance removes nothing',
    SCYC.reduced.rows.length === 6 && SCYC.reduced.cols.length === 6,
    SCYC.reduced.rows.length + ' rows, ' + SCYC.reduced.cols.length + ' cols');
chk('cyclic: no cover of two rows exists, so the minimum is 3',
    SCYC.brute.size === 3 && SCYC.brute.covers.length === 2,
    SCYC.brute.size + ' rows, ' + SCYC.brute.covers.length + ' minima');

/* 15. the Petrick expansion of the cyclic chart, quoted in the captions */
chk('cyclic: six sums expand to five products, two of three terms',
    SCYC.petrick.sums.length === 6 && SCYC.petrick.products.length === 5 &&
    SCYC.petrick.products.filter(function (t) { return t.length === 3; }).length === 2,
    SCYC.petrick.products.map(function (t) { return t.length; }).join(','));

/* 16. both cyclic minima cost six literals and reproduce the function */
chk('cyclic: both minima cost 6 literals and evaluate correctly',
    SCYC.petrick.minima.length === 2 &&
    SCYC.petrick.minima.every(function (t) {
      return t.reduce(function (a, i) { return a + literals(SCYC.primes[i]); }, 0) === 6 &&
             sopMatches(t.map(function (i) { return SCYC.primes[i]; }), 3, FCYC.on, FCYC.dc);
    }));

/* 17. the absorption rule is sound: the expanded product is true exactly when a
       cover exists. Evaluated over all 64 assignments of the six decision variables. */
chk('cyclic: Petrick\'s expanded sum equals the product of sums on all 64 assignments', (function () {
  var primes = SCYC.primes, cols = SCYC.chart.cols, n = 3;
  for (var mask = 0; mask < (1 << primes.length); mask++) {
    var chosen = [];
    for (var i = 0; i < primes.length; i++) if (mask & (1 << i)) chosen.push(primes[i]);
    var covered = cols.every(function (m) { return chosen.some(function (c) { return covers(c, m, n); }); });
    /* is this selection one of the absorbed products (as a superset)? */
    var inExpansion = SCYC.petrick.products.some(function (t) {
      return t.every(function (i) { return chosen.indexOf(primes[i]) >= 0; });
    });
    if (covered !== inExpansion) return false;
  }
  return true;
})());

/* 18. dominance never removes a row that a minimum cover needed */
chk('dominance preserves the minimum cover on 2018 and cyclic', [S2018, SCYC].every(function (s) {
  var keep = s.reduced.rows.map(function (r) { return r.cube; });
  return s.brute.covers.every(function (t) {
    return t.every(function (i) { return keep.indexOf(s.primes[i]) >= 0; });
  });
}));

/* 19. boundary cases */
chk('empty ON-set has no prime implicants', S_EMPTY.primes.length === 0);
chk('full ON-set has exactly one prime, the all-dash cube',
    S_FULL.primes.length === 1 && S_FULL.primes[0] === '----');
chk('a single minterm is its own prime, with no dashes',
    S_ONE.primes.length === 1 && S_ONE.primes[0] === '0101' && dashCount(S_ONE.primes[0]) === 0);

/* 20. the worst case quoted in the last scene */
chk('the worst four-variable function on eight minterms has 8 primes',
    WORST.count === 8, 'found ' + WORST.count + ' on ' + (WORST.on || []).join(','));

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
function rv(local, a, b) { return clamp01((local - a) / (b - a)); }
function ease(x) { return K && K.ease ? K.ease(x) : x; }

function txt(x, y, s, o) { P.text(x, y, s, o || {}); }

function title(s, sub) {
  txt(24, 16, s, { size: 13, bold: true, color: INK });
  if (sub) txt(24, 32, sub, { size: 10, color: FAINT });
  P.line(24, 46, W - 24, 46, { stroke: BORDER, sw: 1 });
}

function card(x, y, w, h, o) {
  o = o || {};
  P.rect(x, y, w, h, { fill: o.fill || SURF2, stroke: o.stroke || BORDER, sw: 1, radius: 6 });
}

function chip(x, y, s, o) {
  o = o || {};
  var size = o.size || 10;
  var w = s.length * size * 0.55 + 14;
  P.rect(x, y, w, size + 10, { fill: o.fill || ACCDIM, stroke: o.stroke || ACC, sw: 1, radius: 9 });
  txt(x + w / 2, y + 5, s, { size: size, color: o.color || ACC, align: 'center', mono: !!o.mono });
  return w;
}

function lines(x, y, arr, o) {
  o = o || {};
  var size = o.size || 10.5, lh = o.lh || 15;
  arr.forEach(function (s, i) { txt(x, y + i * lh, s, { size: size, color: o.color || DIM, mono: o.mono, bold: o.bold }); });
  return y + arr.length * lh;
}

/* a small grid of cells: rows = [{label, cells:[{s, mark, tone}]}], cols = header */
function grid(x, y, colW, rowH, header, rows, o) {
  o = o || {};
  var nC = header.length;
  /* header */
  for (var c = 0; c < nC; c++) {
    txt(x + colW * c + colW / 2, y + 4, header[c],
        { size: 9.5, mono: true, color: FAINT, align: 'center' });
  }
  var top = y + 18;
  rows.forEach(function (r, ri) {
    var ry = top + ri * rowH;
    P.rect(x, ry, colW * nC, rowH, { stroke: BORDER, sw: 1, fill: r.fill || (ri % 2 ? SURF : SURF2) });
    r.cells.forEach(function (cell, ci) {
      if (cell === null) return;
      var cx = x + colW * ci + colW / 2;
      txt(cx, ry + rowH / 2 - 5, String(cell), {
        size: 10.5, mono: true, align: 'center',
        color: (r.tone === 'warn' ? WARN : r.tone === 'valid' ? VAL : r.tone === 'bad' ? BAD : INK),
        bold: !!r.bold
      });
    });
  });
  return top + rows.length * rowH;
}

/* ---------- scene draws ---------- */

function sceneWhy(local) {
  title('Why a picture stops at four variables',
        'the same search, written down instead of drawn');

  var rows = [
    { n: 2, cells: 4, note: 'one square' },
    { n: 3, cells: 8, note: 'fine' },
    { n: 4, cells: 16, note: 'exam case' },
    { n: 5, cells: 32, note: 'two maps' },
    { n: 6, cells: 64, note: '3-D needed' }
  ];
  txt(24, 62, 'cells a map needs', { size: 10, color: FAINT, mono: true });
  rows.forEach(function (r, i) {
    var y = 84 + i * 30;
    var show = rv(local, i * 1.2, i * 1.2 + 1.5);
    if (show <= 0) return;
    txt(24, y + 2, 'n = ' + r.n, { size: 11, mono: true, color: INK, bold: true });
    var w = r.cells * 4.0 * show;
    P.rect(80, y, w, 16, { fill: r.n >= 5 ? WARNDIM : ACCDIM, stroke: r.n >= 5 ? WARN : ACC, sw: 1, radius: 3 });
    txt(80 + w + 8, y + 3, r.cells + ' cells', { size: 10, mono: true, color: DIM });
    txt(396, y + 3, r.note, { size: 9, color: r.n >= 5 ? WARN : FAINT });
  });

  if (local > 6) {
    var x = 470;
    card(x, 62, 400, 116, { fill: SURF, stroke: BORDER });
    txt(x + 14, 72, 'what the map really does', { size: 10.5, bold: true, color: INK });
    lines(x + 14, 92, [
      'It puts two cells that differ in one bit next to',
      'each other, then asks you to see the biggest block.',
      'The block IS a merge. Nothing else is happening.'
    ], { size: 10.5, lh: 15 });
  }
  if (local > 12) {
    var x2 = 470;
    card(x2, 190, 400, 130, { fill: SURF, stroke: BORDER });
    txt(x2 + 14, 200, 'so remove the picture', { size: 10.5, bold: true, color: INK });
    lines(x2 + 14, 220, [
      'Quine 1952, extended by McCluskey 1956:',
      'list the terms as strings, compare them by bit,',
      'and record each merge as a dash. No adjacency',
      'to see, so no size limit to hit.'
    ], { size: 10.5, lh: 15 });
  }
  if (local > 20) {
    txt(24, 340, 'GATE 2027 Section 2 names all three methods:', { size: 10.5, color: INK, bold: true });
    txt(24, 358, 'Boolean algebra and minimization \u2014 algebraic technique, Karnaugh map, tabular method.',
        { size: 10.5, color: DIM, mono: false });
    chip(24, 378, 'algebraic', { fill: SURF2, stroke: BORDER, color: DIM });
    chip(104, 378, 'Karnaugh map', { fill: SURF2, stroke: BORDER, color: DIM });
    chip(210, 378, 'tabular method \u2014 this lesson', { fill: ACCDIM, stroke: ACC, color: ACC });
  }
  if (local > 25) {
    txt(24, 420, 'Because every step is a string comparison, it is also the method a program can run \u2014 and the one that can certify minimality.',
        { size: 10.5, color: INK });
  }
}

function sceneTheorem(local) {
  title('The combining theorem, and what the dash means',
        'one identity, applied until nothing applies');

  card(24, 58, 852, 58, { fill: ACCDIM, stroke: ACC });
  txt(44, 72, 'x\u00b7y  +  x\u00b7y\u2032  =  x\u00b7(y + y\u2032)  =  x\u00b71  =  x',
      { size: 17, mono: true, color: INK, bold: true });
  txt(44, 96, 'two product terms that differ in one variable sum to the term with that variable removed',
      { size: 10.5, color: DIM });

  if (local > 6) {
    txt(24, 132, 'as the table writes it', { size: 10, color: FAINT, mono: true });
    var a = '0010', b = '0110';
    txt(60, 152, a, { size: 14, mono: true, color: INK });
    txt(60, 172, b, { size: 14, mono: true, color: INK });
    txt(130, 152, 'w\u2032x\u2032yz\u2032', { size: 11, mono: true, color: DIM });
    txt(130, 172, 'w\u2032xyz\u2032', { size: 11, mono: true, color: DIM });
    txt(230, 158, 'differ in position 2 only', { size: 10, color: WARN });
    P.arrow(70, 186, 70, 202, { stroke: ACC, sw: 1.5, head: 7 });
    txt(88, 188, 'merge: dash that position', { size: 10, color: ACC });
    txt(60, 210, '0-10', { size: 15, mono: true, color: ACC, bold: true });
    txt(130, 212, 'w\u2032yz\u2032', { size: 11, mono: true, color: ACC });
    txt(230, 212, 'covers 2 and 6, and nothing else', { size: 10, color: DIM });
  }

  if (local > 13) {
    card(470, 132, 406, 150, { fill: SURF, stroke: BORDER });
    txt(484, 142, 'why only neighbouring groups compare', { size: 10.5, bold: true, color: INK });
    lines(484, 162, [
      'Flipping one bit changes the number of ones',
      'by exactly one. So two combinable terms sit in',
      'groups whose one-counts differ by 1 \u2014 and two',
      'terms inside one group never combine, because',
      'they agree on their count.',
      '',
      'That is the whole reason for the sort: it turns',
      'm\u00b2 comparisons into a scan of adjacent groups.'
    ], { size: 10.5, lh: 14.5 });
  }

  if (local > 20) {
    txt(24, 250, 'groups of 0101 0110 1010 0010 0100 0000 by one-count', { size: 10, color: FAINT, mono: true });
    var gs = [{ k: 0, t: ['0000'] }, { k: 1, t: ['0010', '0100'] }, { k: 2, t: ['0101', '0110', '1010'] }];
    gs.forEach(function (g, i) {
      var y = 272 + i * 34;
      var w = chip(24, y, 'ones ' + g.k, { fill: SURF2, stroke: BORDER, color: DIM, size: 9.5 });
      g.t.forEach(function (t, j) {
        txt(24 + w + 12 + j * 62, y + 3, t, { size: 11.5, mono: true, color: INK });
      });
      if (i < gs.length - 1) {
        P.arrow(40, y + 22, 40, y + 32, { stroke: ACC, sw: 1.2, head: 5 });
      }
    });
    txt(260, 276, '\u2190 compare these pairs only', { size: 10, color: ACC });
  }

  if (local > 25) {
    txt(24, 392, 'In later rounds the terms already carry dashes, and two dashed terms combine only when',
        { size: 10.5, color: INK });
    txt(24, 410, 'their dashes are in the same positions and exactly one remaining position differs.',
        { size: 10.5, color: INK });
    txt(24, 432, '-110 with 011- differ in three places: no identity applies, and merging them would invent a minterm the function does not have.',
        { size: 10, color: WARN });
  }
}

function scenePass1(local) {
  var s = S2015;
  title('Round one: GATE CSE 2015 Set 3, Q43',
        'f(w,x,y,z) = \u03a3m(0,2,4,5,6,10)  \u2014  six minterms, no don\u2019t-cares');

  if (local > 1) {
    chip(24, 58, 'answer required: the number of prime implicants', { fill: SURF2, stroke: BORDER, color: DIM });
  }

  var groups = [
    { k: 0, terms: ['0000'] },
    { k: 1, terms: ['0010', '0100'] },
    { k: 2, terms: ['0101', '0110', '1010'] }
  ];
  if (local > 3) {
    txt(24, 84, 'column 1: terms, grouped by one-count', { size: 10, color: FAINT, mono: true });
    groups.forEach(function (g, i) {
      var y = 104 + i * 44;
      var w = chip(24, y, 'ones ' + g.k, { fill: SURF2, stroke: BORDER, color: DIM, size: 9.5 });
      g.terms.forEach(function (t, j) {
        var cx = 24 + w + 14 + j * 74;
        P.rect(cx, y - 2, 64, 22, { fill: SURF, stroke: BORDER, sw: 1, radius: 4 });
        txt(cx + 32, y + 4, t, { size: 11.5, mono: true, align: 'center', color: INK });
        var mt = mintermsOf(t, 4)[0];
        txt(cx + 32, y + 24, 'm' + mt, { size: 9, mono: true, align: 'center', color: FAINT });
      });
    });
  }

  if (local > 9) {
    var x = 400;
    txt(x, 84, 'column 2: merges found this round', { size: 10, color: FAINT, mono: true });
    var merges = s.rounds[0].merges;
    merges.forEach(function (mg, i) {
      var y = 104 + i * 27;
      var show = rv(local, 9 + i * 0.6, 10.2 + i * 0.6);
      if (show <= 0) return;
      txt(x, y, mg.a, { size: 10.5, mono: true, color: DIM });
      txt(x + 46, y, '+', { size: 10.5, mono: true, color: FAINT });
      txt(x + 58, y, mg.b, { size: 10.5, mono: true, color: DIM });
      txt(x + 108, y, '\u2192', { size: 10.5, mono: true, color: FAINT });
      txt(x + 126, y, mg.to, { size: 10.5, mono: true, color: ACC, bold: true });
      txt(x + 186, y, 'position ' + (mg.at + 1), { size: 9.5, mono: true, color: FAINT });
    });
  }

  if (local > 17) {
    var x2 = 640;
    card(x2, 100, 236, 106, { fill: SURF, stroke: BORDER });
    txt(x2 + 12, 110, 'round one, counted', { size: 10.5, bold: true, color: INK });
    lines(x2 + 12, 130, [
      '6 terms in, 6 merges out',
      '0 terms unticked',
      '6 new terms, one dash each'
    ], { size: 10.5, lh: 16 });
  }

  if (local > 22) {
    txt(24, 262, 'a tick means: this term is contained in the larger term the merge produced, so it cannot be prime.',
        { size: 10.5, color: INK });
    txt(24, 282, 'Every parent here is ticked, which is why nothing survives the first round.', { size: 10.5, color: WARN });
    txt(24, 314, 'the six children, in order:', { size: 10, color: FAINT, mono: true });
    var kids = s.rounds[0].merges.map(function (m) { return m.to; });
    kids.forEach(function (t, i) {
      var cx = 24 + i * 96;
      P.rect(cx, 332, 88, 24, { fill: ACCDIM, stroke: ACC, sw: 1, radius: 4 });
      txt(cx + 44, 338, t, { size: 11.5, mono: true, align: 'center', color: ACC, bold: true });
    });
    txt(24, 372, 'Two pairs produced the same child? No \u2014 six merges gave six distinct terms here, but a child reached twice is written once.',
        { size: 10, color: DIM });
  }
}

function sceneRounds(local) {
  var s = S2015;
  title('Rounds two and three: until nothing combines',
        'the fixed point is what makes the table exact');

  var r2 = s.rounds[1], r3 = s.rounds[2];

  if (local > 1) {
    txt(24, 62, 'round 2 \u2014 six dashed terms in', { size: 10, color: FAINT, mono: true });
    r2.merges.forEach(function (mg, i) {
      var y = 84 + i * 26;
      txt(24, y, mg.a + ' + ' + mg.b, { size: 10.5, mono: true, color: DIM });
      txt(150, y, '\u2192 ' + mg.to, { size: 10.5, mono: true, color: ACC, bold: true });
      var dashAt = [];
      for (var k = 0; k < mg.a.length; k++) if (mg.a.charAt(k) === '-') dashAt.push(k + 1);
      txt(216, y, 'dashes align at ' + dashAt.join(','),
          { size: 9.5, mono: true, color: FAINT });
    });
    txt(24, 148, 'survivors: ' + r2.survivors.join('   '), { size: 11, mono: true, color: VAL, bold: true });
    txt(24, 166, 'neither can grow: the cells that would extend them are zeroes of f',
        { size: 10, color: DIM });
  }

  if (local > 8) {
    txt(24, 200, 'round 3 \u2014 the confirmation round', { size: 10, color: FAINT, mono: true });
    txt(24, 222, 'one term in, no pair combines', { size: 10.5, color: INK });
    txt(24, 246, 'survivors: ' + r3.survivors.join('   ') + '  \u2014 the fixed point is reached',
        { size: 11, mono: true, color: VAL, bold: true });
    txt(24, 264, '0--0 covers minterms 0, 2, 4 and 6: all four are in the function',
        { size: 10, color: DIM });
    txt(24, 282, 'a round that finds nothing is not wasted work \u2014 it is the proof that no term can still grow',
        { size: 9.5, color: FAINT });
  }

  if (local > 14) {
    var x = 470;
    card(x, 62, 406, 150, { fill: SURF, stroke: BORDER });
    txt(x + 14, 72, 'the work, counted', { size: 10.5, bold: true, color: INK });
    var rows = [
      ['round 1', '6 terms', '6 merges', '0 unticked'],
      ['round 2', '6 terms', '2 merges', '2 unticked'],
      ['round 3', '1 term', '0 merges', '1 unticked']
    ];
    rows.forEach(function (r, i) {
      var y = 96 + i * 22;
      txt(x + 14, y, r[0], { size: 10.5, mono: true, color: DIM });
      txt(x + 90, y, r[1], { size: 10.5, mono: true, color: DIM });
      txt(x + 176, y, r[2], { size: 10.5, mono: true, color: DIM });
      txt(x + 262, y, r[3], { size: 10.5, mono: true, color: r[3] === '0 unticked' ? FAINT : VAL, bold: r[3] !== '0 unticked' });
    });
    P.line(x + 14, 162, x + 392, 162, { stroke: BORDER, sw: 1 });
    txt(x + 14, 172, 'total', { size: 10.5, mono: true, color: INK, bold: true });
    txt(x + 176, 172, '8 merges', { size: 10.5, mono: true, color: INK, bold: true });
    txt(x + 262, 172, '3 unticked = 3 primes', { size: 10.5, mono: true, color: VAL, bold: true });
  }

  if (local > 20) {
    txt(24, 300, 'The answer to the paper is 3, and the published key is 3.', { size: 11, color: INK, bold: true });
    txt(24, 320, 'This page computes the count twice \u2014 once from the table, once from the definition \u2014 and both give three.',
        { size: 10.5, color: DIM });
  }

  if (local > 24) {
    txt(24, 352, 'the three prime implicants, with what each covers', { size: 10, color: FAINT, mono: true });
    s.primes.forEach(function (c, i) {
      var y = 372 + i * 26;
      txt(24, y, c, { size: 12, mono: true, color: ACC, bold: true });
      txt(96, y + 2, cubeName(c, VARS4), { size: 10.5, mono: true, color: INK });
      txt(190, y + 2, 'covers ' + mintermsOf(c, 4).join(', '), { size: 10, color: DIM });
      txt(360, y + 2, mintermsOf(c, 4).length + ' minterms', { size: 9.5, color: FAINT });
    });
    txt(24, 452, 'the sizes overlap (m2 and m4 are covered twice), which is allowed: a cover may cover a minterm more than once, and may never leave one out.',
        { size: 9.5, color: FAINT });
  }
}

function scenePrime(local) {
  var s = S2015;
  title('Prime means unticked, and nothing more',
        'checked against the definition, not against the table');

  if (local > 0.5) {
    card(24, 58, 420, 96, { fill: ACCDIM, stroke: ACC });
    txt(38, 68, 'definition', { size: 10, mono: true, color: ACC, bold: true });
    lines(38, 86, [
      'An implicant of f is a product term that covers no',
      'minterm outside f.',
      'It is PRIME when no larger implicant contains it.',
      'Containment is a set relation on covered minterms.'
    ], { size: 10.5, lh: 15 });
  }

  if (local > 5) {
    card(470, 58, 406, 96, { fill: SURF, stroke: BORDER });
    txt(484, 68, 'why the tick is the definition applied', { size: 10.5, bold: true, color: INK });
    lines(484, 88, [
      'A ticked term is contained in the child its merge',
      'produced, so it cannot be prime.',
      'An unticked term has no containing implicant,',
      'so it is. The tick is not a note; it is the test.'
    ], { size: 10.5, lh: 15 });
  }

  if (local > 10) {
    txt(24, 172, 'the table says', { size: 10, color: FAINT, mono: true });
    s.primes.forEach(function (c, i) {
      var x = 24 + i * 150;
      P.rect(x, 188, 136, 44, { fill: SURF, stroke: ACC, sw: 1, radius: 5 });
      txt(x + 68, 196, c, { size: 13, mono: true, align: 'center', color: ACC, bold: true });
      txt(x + 68, 214, cubeName(c, VARS4), { size: 10, mono: true, align: 'center', color: INK });
    });
    txt(486, 196, 'unticked in every round,', { size: 10, color: DIM });
    txt(486, 212, 'so three primes.', { size: 10, color: DIM });
  }

  if (local > 15) {
    txt(24, 250, 'the definition says', { size: 10, color: FAINT, mono: true });
    lines(24, 268, [
      'enumerate all 3\u2074 = 81 cubes over w,x,y,z',
      'keep those that cover no minterm outside f   \u2192  the implicants',
      'keep those no other implicant contains       \u2192  the maximal ones'
    ], { size: 10.5, lh: 16, mono: false });
    txt(24, 320, s.maxImplicants.join('    '), { size: 12, mono: true, color: VAL, bold: true });
    txt(240, 322, '\u2014 the same three', { size: 10.5, color: VAL });
  }

  if (local > 21) {
    card(24, 348, 852, 66, { fill: WARNDIM, stroke: WARN });
    txt(38, 358, 'prime is not the same as needed', { size: 11, bold: true, color: WARN });
    lines(38, 376, [
      'Being prime is a property of the term alone. Being needed is a property of the term against the rest of the chart.',
      'The 2018 function later in this lesson has a prime implicant that covers only don\u2019t-cares: prime, maximal, and in no cover at all.'
    ], { size: 10.5, lh: 16, color: INK });
  }
  if (local > 26) {
    txt(24, 432, '81 is 3 to the fourth: each position is 0, 1 or dash. On four variables the check is exhaustive, so agreement here is a proof for this function.',
        { size: 9.5, color: FAINT });
  }
}

function drawChart(local, chart, vars, opts) {
  opts = opts || {};
  var x0 = opts.x || 24, y0 = opts.y || 76;
  var labelW = opts.labelW || 74, colW = opts.colW || 52, rowH = opts.rowH || 24;
  var cols = chart.cols;
  var reveal = opts.reveal === undefined ? 99 : opts.reveal;

  /* column headers */
  cols.forEach(function (m, ci) {
    txt(x0 + labelW + colW * ci + colW / 2, y0 - 14, 'm' + m, { size: 9.5, mono: true, color: FAINT, align: 'center' });
  });
  txt(x0 + labelW / 2, y0 - 14, 'prime', { size: 9.5, mono: true, color: FAINT, align: 'center' });

  chart.rows.forEach(function (r, ri) {
    var ry = y0 + ri * rowH;
    var isEss = opts.essentials && opts.essentials.indexOf(r.cube) >= 0;
    var empty = r.cols.length === 0;
    P.rect(x0, ry, labelW + colW * cols.length, rowH, {
      fill: empty ? BADDIM : (isEss ? ACCDIM : (ri % 2 ? SURF : SURF2)),
      stroke: BORDER, sw: 1
    });
    txt(x0 + 6, ry + 7, r.cube, { size: 10, mono: true, color: empty ? BAD : INK, bold: true });
    cols.forEach(function (m, ci) {
      var cx = x0 + labelW + colW * ci + colW / 2;
      var has = r.cols.indexOf(m) >= 0;
      if (has && local > reveal) {
        txt(cx, ry + 5, '\u00d7', { size: 13, mono: true, align: 'center', color: isEss ? ACC : DIM, bold: true });
      }
    });
    /* single-cross ring */
    if (opts.ring && local > reveal + 2) {
      cols.forEach(function (m, ci) {
        if (!covers(r.cube, m, chart.n)) return;
        if (owners(chart, m).length !== 1) return;
        var cx = x0 + labelW + colW * ci + colW / 2;
        P.circle(cx, ry + rowH / 2, 9, { stroke: ACC, sw: 1.5 });
      });
    }
  });
  return y0 + chart.rows.length * rowH;
}

function sceneChart(local) {
  var s = S2015;
  title('The prime implicant chart, and the essential row',
        'finding the primes is half the problem; choosing among them is the other half');

  if (local > 0.5) {
    txt(24, 56, 'rows = the three primes.  columns = the six minterms of f.  a cross means the row covers the column.',
        { size: 10, color: FAINT });
    drawChart(local, s.chart, VARS4, { x: 24, y: 88, colW: 56, labelW: 78, rowH: 26, reveal: 2, ring: true, essentials: s.essentials });
  }

  if (local > 8) {
    var x = 500;
    card(x, 84, 376, 104, { fill: SURF, stroke: BORDER });
    txt(x + 12, 94, 'reading a column', { size: 10.5, bold: true, color: INK });
    lines(x + 12, 114, [
      'One cross in a column: that minterm has exactly',
      'one prime able to cover it, so the prime is forced.',
      'It is essential, and it is in every cover.',
      '',
      'Here m0, m5 and m10 each hold one cross.'
    ], { size: 10.5, lh: 15 });
  }

  if (local > 14) {
    txt(24, 210, 'essentials: ' + s.essentials.join('   '), { size: 11, mono: true, color: VAL, bold: true });
    txt(24, 230, 'delete their rows and every column they cover \u2014 and no column is left over, so nothing remains to choose.',
        { size: 10.5, color: INK });
    var cov = s.brute.covers[0].map(function (i) { return s.primes[i]; });
    txt(24, 254, 'cover: ' + cov.map(function (c) { return cubeName(c, VARS4); }).join('  +  '),
        { size: 11.5, mono: true, color: ACC, bold: true });
    txt(24, 274, 'literals: 2 + 3 + 3 = 8', { size: 11, mono: true, color: INK });
  }

  if (local > 20) {
    card(24, 300, 852, 96, { fill: SURF, stroke: BORDER });
    txt(38, 310, 'two bookkeeping rules that shrink a chart without any search', { size: 10.5, bold: true, color: INK });
    lines(38, 330, [
      'Row dominance: if row A covers everything row B covers, and more, delete B \u2014 A is never worse.',
      'Column dominance: if column j is crossed wherever column k is crossed, column j is the easier',
      'constraint. Covering k covers j, so delete j and keep k. Deleting k would silently lose solutions.'
    ], { size: 10.5, lh: 16 });
  }
  if (local > 25) {
    txt(24, 412, 'Applied alternately these rules often unravel a chart completely. They are exact: they never remove a row a minimum cover needed.',
        { size: 10, color: DIM });
    txt(24, 432, 'On the cyclic chart in two scenes\u2019 time, both rules fail \u2014 and that failure is the thing to recognise.',
        { size: 10, color: WARN });
  }
}

function sceneDC(local) {
  var s = S2018;
  title('Don\u2019t-cares: in when you generate, out of the chart',
        'GATE CSE 2018, Q49 \u2014 F = \u03a3m(0,2,5,7,9,11) + d(3,8,10,12,14)');

  if (local > 0.5) {
    card(24, 56, 852, 34, { fill: ACCDIM, stroke: ACC });
    txt(38, 64, 'the placement rule:  a don\u2019t-care is INCLUDED when the terms are listed, and EXCLUDED from the chart.',
        { size: 11, color: INK, bold: true });
  }

  if (local > 4) {
    drawChart(local, s.chart, VARS4, {
      x: 24, y: 130, colW: 50, labelW: 72, rowH: 22,
      reveal: 6, ring: true, essentials: s.essentials
    });
  }

  if (local > 11) {
    var x = 400;
    card(x, 108, 476, 112, { fill: BADDIM, stroke: BAD });
    txt(x + 12, 118, 'the empty row', { size: 10.5, bold: true, color: BAD });
    lines(x + 12, 138, [
      '1--0 is w\u2032x\u2032y\u2032z\u2032\u2026 no: it is P\u00b7S\u2032, covering minterms 8, 10, 12 and 14.',
      'Every one of those is a don\u2019t-care, so its row holds',
      'no cross. It is genuinely prime and completely useless:',
      'no cover can ever select it, and adding it costs literals.'
    ], { size: 10.5, lh: 15 });
  }

  if (local > 17) {
    txt(24, 262, 'essential columns: m0 \u2192 -0-0,  m5 \u2192 01-1,  m9 \u2192 10--', { size: 11, mono: true, color: VAL, bold: true });
    txt(24, 282, 'three columns with a single cross, so three essential prime implicants \u2014 the published key.', { size: 10.5, color: INK });
    txt(24, 302, 'No don\u2019t-care could have forced anything: don\u2019t-cares are not columns, and a cover is never obliged to include one.',
        { size: 10.5, color: WARN });
  }

  if (local > 22) {
    txt(24, 334, 'the don\u2019t-cares are load-bearing, not decoration', { size: 10.5, bold: true, color: INK });
    var without = qm(4, F2018.on, []);
    txt(24, 354, 'with them:    ' + s.primes.length + ' prime implicants   ' + s.primes.join('  '),
        { size: 10.5, mono: true, color: VAL });
    txt(24, 374, 'without them: ' + without.primes.length + ' prime implicants   ' + without.primes.join('  '),
        { size: 10.5, mono: true, color: BAD });
    txt(24, 396, 'Same function, different table: a don\u2019t-care lets an implicant grow, so dropping it loses primes.',
        { size: 10, color: DIM });
  }
  if (local > 26) {
    var cov = s.brute.covers[0].map(function (i) { return s.primes[i]; });
    txt(24, 420, 'minimal cover: ' + cov.map(function (c) { return cubeName(c, VARS4); }).join('  +  ') + '   \u2014 7 literals',
        { size: 11, mono: true, color: ACC, bold: true });
  }
}

function sceneCyclic(local) {
  var s = SCYC;
  title('The cyclic chart: six rows, no essential',
        '\u03a3m(0,1,2,5,6,7) over A,B,C \u2014 the case that breaks the easy procedure');

  if (local > 0.5) {
    txt(24, 58, 'six primes, each covering exactly two minterms, because minterms 3 and 4 are zeroes and forbid every quad.',
        { size: 10, color: FAINT });
    drawChart(local, s.chart, VARS3, { x: 24, y: 96, colW: 54, labelW: 70, rowH: 24, reveal: 3, ring: false, essentials: [] });
  }

  if (local > 9) {
    var x = 430;
    card(x, 88, 446, 128, { fill: SURF, stroke: BORDER });
    txt(x + 12, 98, 'read the columns', { size: 10.5, bold: true, color: INK });
    lines(x + 12, 118, [
      'Every column holds exactly two crosses. No column',
      'holds one, so no prime is the unique cover of any',
      'minterm, so there is no essential prime implicant.',
      '',
      'Answering \u201cthe essentials\u201d here answers nothing \u2014',
      'there are none, and the answer set is empty.'
    ], { size: 10.5, lh: 15 });
  }

  if (local > 15) {
    txt(24, 262, 'the six primes and their literal names', { size: 10, color: FAINT, mono: true });
    s.chart.rows.forEach(function (r, i) {
      var x = 24 + (i % 3) * 288, y = 282 + Math.floor(i / 3) * 26;
      txt(x, y, r.cube, { size: 11, mono: true, color: ACC, bold: true });
      txt(x + 54, y + 1, cubeName(r.cube, VARS3), { size: 10.5, mono: true, color: INK });
      txt(x + 128, y + 1, 'covers ' + r.cols.join(','), { size: 9.5, color: DIM });
    });
  }

  if (local > 21) {
    card(24, 336, 852, 62, { fill: WARNDIM, stroke: WARN });
    txt(38, 346, 'dominance finds nothing either', { size: 10.5, bold: true, color: WARN });
    lines(38, 364, [
      'Every row covers two minterms and no row covers everything another covers; every column holds two crosses',
      'and no column is crossed wherever another is. The chart is irreducible \u2014 it is the cyclic core of the covering problem.'
    ], { size: 10.5, lh: 15, color: INK });
  }
  if (local > 26) {
    txt(24, 412, 'Two minimal covers exist and they tie at three primes and six literals. Neither is preferred by the algebra.',
        { size: 10.5, color: INK, bold: true });
    txt(24, 432, 'So the choice has to be made by an exact procedure, not by inspection \u2014 which is the next scene.',
        { size: 10, color: DIM });
  }
}

function scenePetrick(local) {
  var s = SCYC;
  var pk = s.petrick;
  title('Petrick\u2019s method: one product, two answers',
        'the chart as an algebra problem about which rows to choose');

  if (local > 0.5) {
    txt(24, 58, 'one sum per column \u2014 the rows that cover it, or-ed together. The cover is valid when every sum is true.',
        { size: 10, color: FAINT });
    pk.sums.forEach(function (sum, i) {
      var y = 80 + i * 18;
      txt(24, y, 'm' + s.chart.cols[i], { size: 10, mono: true, color: FAINT });
      txt(60, y, '(' + sum.map(function (i2) { return 'P' + (i2 + 1); }).join(' + ') + ')',
          { size: 10.5, mono: true, color: INK });
    });
  }

  if (local > 6) {
    txt(660, 58, 'multiply, then absorb', { size: 10, color: FAINT });
    card(220, 78, 400, 96, { fill: ACCDIM, stroke: ACC });
    lines(234, 88, [
      'P = (P1+P2)(P1+P3)(P2+P4)',
      '    (P3+P5)(P4+P6)(P5+P6)',
      '',
      'absorb with  X + XY = X',
      'collapse with  XX = X'
    ], { size: 10.5, mono: true, lh: 16, color: INK });
  }

  if (local > 12) {
    var x = 640;
    card(x, 78, 236, 96, { fill: SURF, stroke: BORDER });
    txt(x + 12, 88, 'what survives', { size: 10.5, bold: true, color: INK });
    lines(x + 12, 108, [
      '64 products before absorption',
      '5 after it',
      '2 of them hold three primes',
      '3 of them hold four'
    ], { size: 10.5, lh: 16 });
  }

  if (local > 17) {
    txt(24, 190, 'the five products, by size', { size: 10, color: FAINT, mono: true });
    var sorted = pk.products.slice().sort(function (a, b) { return a.length - b.length; });
    sorted.forEach(function (t, i) {
      var y = 210 + i * 20;
      var isMin = t.length === pk.minSize;
      txt(24, y, isMin ? '\u25b8' : '\u00b7', { size: 11, mono: true, color: isMin ? VAL : FAINT });
      txt(44, y, '{' + t.map(function (i2) { return 'P' + (i2 + 1); }).join(', ') + '}',
          { size: 10.5, mono: true, color: isMin ? VAL : DIM, bold: isMin });
      txt(240, y, t.length + ' primes', { size: 9.5, mono: true, color: isMin ? VAL : FAINT });
      txt(310, y, pk.lit(t) + ' literals', { size: 9.5, mono: true, color: isMin ? VAL : FAINT });
    });
  }

  if (local > 23) {
    txt(470, 190, 'the two minima, spelled out', { size: 10, color: FAINT, mono: true });
    pk.minima.forEach(function (t, i) {
      var y = 210 + i * 46;
      P.rect(470, y - 6, 406, 40, { fill: ACCDIM, stroke: ACC, sw: 1, radius: 5 });
      txt(482, y, 'F = ' + t.map(function (i2) { return cubeName(s.primes[i2], VARS3); }).join('  +  '),
          { size: 11.5, mono: true, color: ACC, bold: true });
      txt(482, y + 18, 'primes ' + t.map(function (i2) { return s.primes[i2]; }).join(', ') + '   \u2014  6 literals',
          { size: 9.5, mono: true, color: DIM });
    });
    txt(470, 316, 'Both were evaluated on all 8 input combinations:',
        { size: 10.5, color: INK });
    txt(470, 334, 'each is 1 exactly on {0,1,2,5,6,7} and 0 on 3 and 4.',
        { size: 10.5, color: INK });
  }
  if (local > 27) {
    txt(24, 350, 'Petrick\u2019s expansion can produce up to 2^m products before absorption, where m is the number of uncovered columns.',
        { size: 10, color: DIM });
    txt(24, 370, 'That is why the method is applied to the reduced core rather than to the whole chart.',
        { size: 10, color: DIM });
    txt(24, 400, 'Both minima are equally good. Nothing in the algebra prefers one, so a question may ask how many there are.',
        { size: 10.5, color: WARN });
  }
}

function sceneCost(local) {
  title('The procedure, the cost, and the traps',
        'what to do, in order, and where exactness stops being affordable');

  var steps = [
    ['1', 'list minterms and don\u2019t-cares in binary, group by one-count'],
    ['2', 'combine adjacent groups, dash the differing bit, tick both parents'],
    ['3', 'repeat until no pair anywhere combines  \u2014 the fixed point'],
    ['4', 'collect every unticked entry  \u2014 that is the prime set'],
    ['5', 'chart: rows = primes, columns = minterms only, no don\u2019t-cares'],
    ['6', 'take essentials, then reduce by row and column dominance'],
    ['7', 'solve the cyclic core  \u2014 Petrick, or branch and bound']
  ];
  if (local > 0.5) {
    txt(24, 58, 'the order of work', { size: 10, color: FAINT, mono: true });
    steps.forEach(function (st, i) {
      var y = 78 + i * 26;
      var show = rv(local, 0.5 + i * 0.8, 1.4 + i * 0.8);
      if (show <= 0) return;
      P.circle(32, y + 5, 8, { fill: i === 2 || i === 6 ? ACCDIM : SURF2, stroke: i === 2 || i === 6 ? ACC : BORDER, sw: 1 });
      txt(32, y + 1, st[0], { size: 9.5, mono: true, align: 'center', color: i === 2 || i === 6 ? ACC : DIM, bold: true });
      txt(50, y, st[1], { size: 10.5, color: INK });
    });
  }

  if (local > 9) {
    var x = 470;
    card(x, 58, 406, 118, { fill: SURF, stroke: BORDER });
    txt(x + 12, 68, 'the cost, measured here', { size: 10.5, bold: true, color: INK });
    lines(x + 12, 88, [
      'Every 4-variable function with 8 minterms',
      'was searched (12,870 of them). The worst',
      'has 8 prime implicants: ' + (WORST.on || []).join(','),
      '',
      '8 rows, and the choices multiply from there.'
    ], { size: 10.5, lh: 15 });
  }

  if (local > 15) {
    txt(470, 196, 'so exact minimisation stops:', { size: 10.5, bold: true, color: INK });
    txt(470, 216, 'practical tools reduce the chart first, use Petrick only on the', { size: 10.5, color: DIM });
    txt(470, 234, 'cyclic core, and for large problems abandon exactness entirely.', { size: 10.5, color: DIM });
    txt(470, 252, 'Espresso, used since the 1980s, finds a near-minimal cover', { size: 10.5, color: DIM });
    txt(470, 270, 'without ever enumerating all the primes.', { size: 10.5, color: DIM });
  }

  if (local > 21) {
    card(24, 268, 852, 96, { fill: WARNDIM, stroke: WARN });
    txt(38, 278, 'the four traps', { size: 10.5, bold: true, color: WARN });
    lines(38, 296, [
      '1. Don\u2019t-cares in the chart. They are excluded from the columns, so a row covering only don\u2019t-cares is empty and never selected.',
      '2. Merging terms whose dashes sit in different columns. The result covers a minterm outside f, so it is not an implicant at all.',
      '3. Stopping the passes early. A prime never generated can never be chosen, and the minimum silently becomes wrong.',
      '4. Reporting one minimal cover on a cyclic chart. There may be several; the question may ask how many.'
    ], { size: 10.5, lh: 16, color: INK });
  }
  if (local > 26) {
    txt(24, 382, 'The table is the map with the picture removed, so it works where the picture cannot be drawn \u2014',
        { size: 10.5, color: INK, bold: true });
    txt(24, 400, 'and the price of that is a covering problem that has to be solved rather than seen.',
        { size: 10.5, color: INK, bold: true });
    txt(24, 428, 'That sentence answers the counting questions, explains why a cyclic chart has no essential, and tells you why an exact minimiser is expensive.',
        { size: 9.5, color: FAINT });
  }
}

var SCENES = {
  why: sceneWhy, theorem: sceneTheorem, pass1: scenePass1, rounds: sceneRounds,
  prime: scenePrime, chart: sceneChart, dc: sceneDC, cyclic: sceneCyclic,
  petrick: scenePetrick, cost: sceneCost
};

function drawFrame(Pp) {
  P = Pp;
  var tl = window.LESSON_TIMELINE;
  var t = K ? K.state.elapsed : 0;
  var sc = tl.scenes[0], local = 0;
  for (var i = tl.scenes.length - 1; i >= 0; i--) {
    if (t >= tl.scenes[i].start - 1e-6) { sc = tl.scenes[i]; break; }
  }
  local = t - sc.start;

  P.alpha(1);
  P.clear();
  P.rect(0, 0, W, H, { fill: SURF });

  var fn = SCENES[sc.id];
  if (fn) fn(local, sc);
}

/* ======================================================================
   LAYER 4 - BOOT
   ====================================================================== */

function boot() {
  var holder = document.getElementById('canvas-holder');
  var fallback = document.getElementById('canvas-fallback');

  /* the check panel under the canvas */
  var box = document.getElementById('checks');
  if (box) {
    var bad = CHECKS.filter(function (c) { return !c.pass; });
    box.innerHTML = '<span class="k">Model checks</span>' +
      (bad.length === 0
        ? CHECKS.length + ' of ' + CHECKS.length + ' passed'
        : bad.length + ' of ' + CHECKS.length + ' failed');
  }

  var ok = false;
  if (window.p5 && holder) {
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
      holder.appendChild(cv);
      var ctx2d = cv.getContext && cv.getContext('2d');
      if (ctx2d && PR) {
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

window.__MODEL = { M: M, CHECKS: CHECKS };
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

})();
