(function () {
  'use strict';

  var W = 900, H = 470;
  var K = window.LessonKit;
  var PR = window.Painters;
  var PAL = PR ? PR.PAL : null;
  var P = null;

/* ======================================================================
   LAYER 1 - THE MODEL (relational algebra, tuple calculus, SQL)
   Pure data and pure functions. No drawing here. Every number the lesson
   quotes is computed here, and the checks at the end of this layer
   re-verify the computed values against the definitions.
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}
function eqNum(a, b) { return Math.abs(a - b) < 1e-9; }

/* A relation is {cols: [names], rows: [[values], ...]}.
   Rows are kept duplicate-free, because relational algebra is set semantics.
   SQL bag semantics are modelled separately, by keeping the duplicates. */

function rel(cols, rows) {
  var seen = {}, out = [];
  rows.forEach(function (r) {
    var k = r.join('\u0001');
    if (!seen[k]) { seen[k] = 1; out.push(r.slice()); }
  });
  return { cols: cols.slice(), rows: out };
}

function relBag(cols, rows) {
  return { cols: cols.slice(), rows: rows.map(function (r) { return r.slice(); }) };
}

function idxOf(R, name) {
  var i = R.cols.indexOf(name);
  if (i < 0) throw new Error('no column ' + name + ' in ' + R.cols.join(','));
  return i;
}

/* sigma: keep the rows where pred(rowObject) is true */
function sel(R, pred) {
  var rows = R.rows.filter(function (r) {
    var o = {};
    R.cols.forEach(function (c, i) { o[c] = r[i]; });
    return pred(o);
  });
  return rel(R.cols, rows);
}

/* pi: keep the named columns and drop duplicate rows (set semantics) */
function proj(R, cols) {
  var ix = cols.map(function (c) { return idxOf(R, c); });
  return rel(cols, R.rows.map(function (r) { return ix.map(function (i) { return r[i]; }); }));
}

/* the same projection without duplicate elimination, to model SQL's bag */
function projBag(R, cols) {
  var ix = cols.map(function (c) { return idxOf(R, c); });
  return relBag(cols, R.rows.map(function (r) { return ix.map(function (i) { return r[i]; }); }));
}

function rename(R, map) {
  return rel(R.cols.map(function (c) { return map[c] || c; }), R.rows);
}

function cross(R, S) {
  var cols = R.cols.concat(S.cols), rows = [];
  R.rows.forEach(function (a) {
    S.rows.forEach(function (b) { rows.push(a.concat(b)); });
  });
  return rel(cols, rows);
}

function union(R, S) {
  if (R.cols.join(',') !== S.cols.join(',')) throw new Error('union of different schemas');
  return rel(R.cols, R.rows.concat(S.rows));
}

function diff(R, S) {
  if (R.cols.join(',') !== S.cols.join(',')) throw new Error('difference of different schemas');
  var sk = {};
  S.rows.forEach(function (r) { sk[r.join('\u0001')] = 1; });
  return rel(R.cols, R.rows.filter(function (r) { return !sk[r.join('\u0001')]; }));
}

function inter(R, S) { return diff(R, diff(R, S)); }

/* theta join: the operands are renamed so every column is qualified,
   which is what a printed relational-algebra expression means. */
function thetaJoin(R, S, pred, rnR, rnS) {
  rnR = rnR || 'R'; rnS = rnS || 'S';
  var Rq = rename(R, { }), Sq = rename(S, { });
  Rq.cols = R.cols.map(function (c) { return rnR + '.' + c; });
  Sq.cols = S.cols.map(function (c) { return rnS + '.' + c; });
  var C = cross(Rq, Sq);
  return sel(C, pred);
}

/* natural join: join on the equally named columns, and keep one copy of each */
function natJoin(R, S) {
  var common = R.cols.filter(function (c) { return S.cols.indexOf(c) >= 0; });
  var rest = S.cols.filter(function (c) { return common.indexOf(c) < 0; });
  var rows = [];
  R.rows.forEach(function (a) {
    S.rows.forEach(function (b) {
      var ok = common.every(function (c) {
        return a[idxOf(R, c)] === b[idxOf(S, c)];
      });
      if (ok) {
        rows.push(a.concat(rest.map(function (c) { return b[idxOf(S, c)]; })));
      }
    });
  });
  return rel(R.cols.concat(rest), rows);
}

/* division: R(A..., B...) / S(B...) keeps the A-tuples that are paired
   with every tuple of S. S's columns must be a subset of R's. */
function div(R, S) {
  var bCols = S.cols;
  var aCols = R.cols.filter(function (c) { return bCols.indexOf(c) < 0; });
  if (!bCols.length) return proj(R, aCols);
  var out = [];
  proj(R, aCols).rows.forEach(function (a) {
    var ok = S.rows.every(function (b) {
      var want = aCols.map(function (c) { return a[aCols.indexOf(c)]; })
        .concat(bCols.map(function (c) { return b[bCols.indexOf(c)]; }));
      // rebuild in R's column order
      var full = R.cols.map(function (c) {
        var i = aCols.indexOf(c);
        return i >= 0 ? a[i] : want[aCols.length + bCols.indexOf(c)];
      });
      return R.rows.some(function (r) { return r.join('\u0001') === full.join('\u0001'); });
    });
    if (ok) out.push(a);
  });
  return rel(aCols, out);
}

/* the textbook identity: R / S = pi_A(R) - pi_A(pi_A(R) x S - R) */
function divByIdentity(R, S) {
  var bCols = S.cols;
  var aCols = R.cols.filter(function (c) { return bCols.indexOf(c) < 0; });
  var A = proj(R, aCols);
  var ideal = cross(A, S);
  // both sides must be in R's column order for the difference to be legal
  var order = R.cols;
  var idealO = rel(order, ideal.rows.map(function (r) {
    return order.map(function (c) {
      var inA = aCols.indexOf(c), inB = bCols.indexOf(c);
      return inA >= 0 ? r[inA] : r[aCols.length + inB];
    });
  }));
  var missing = diff(idealO, R);
  return diff(A, proj(missing, aCols));
}

/* ---------------- the reference instances ---------------- */

/* GATE CSE 2017 Set 1 Q46: the printed instance of CR(StudentName, CourseName) */
var CR = rel(['s', 'c'], [
  ['SA', 'CA'], ['SA', 'CB'], ['SA', 'CC'],
  ['SB', 'CB'], ['SB', 'CC'],
  ['SC', 'CA'], ['SC', 'CB'], ['SC', 'CC'],
  ['SD', 'CA'], ['SD', 'CB'], ['SD', 'CC'], ['SD', 'CD'],
  ['SE', 'CD'], ['SE', 'CA'], ['SE', 'CB'],
  ['SF', 'CA'], ['SF', 'CB'], ['SF', 'CC']
]);
var CR_T1 = proj(sel(CR, function (o) { return o.s === 'SA'; }), ['c']);
var CR_T2 = div(CR, CR_T1);

/* GATE CSE 2022 Q25: Employee(eId, Name), Brand(bId, bName), Own(eId, bId) */
var OWN = rel(['eId', 'bId'], [['E1', 'B1'], ['E1', 'B2'], ['E2', 'B2']]);
var BRAND = rel(['bId'], [['B1'], ['B2'], ['B3'], ['B4']]);
var OWN_W1 = rel(['eId', 'bId'], [['E1', 'B1'], ['E1', 'B2'], ['E2', 'B2']]);
var BRAND_W1 = rel(['bId'], [['B1'], ['B2'], ['B3'], ['B4']]);
var OWN_W2 = rel(['eId', 'bId'], [['E1', 'B1'], ['E2', 'B2']]);
var BRAND_W2 = rel(['bId'], [['B1'], ['B2']]);

/* the four options of that question, as functions */
function optA(Own, Br) { return proj(div(proj(Own, ['eId', 'bId']), proj(Br, ['bId'])), ['eId']); }
function optB(Own, Br) {
  var all = proj(Own, ['eId']);
  var ideal = cross(all, proj(Br, ['bId']));
  var missing = diff(ideal, proj(Own, ['eId', 'bId']));
  return diff(all, proj(missing, ['eId']));
}
function optC(Own, Br) { return proj(div(proj(Own, ['eId', 'bId']), proj(Own, ['bId'])), ['eId']); }
function optD(Own, Br) {
  var p = cross(proj(Own, ['eId']), proj(Own, ['bId']));
  return proj(div(p, proj(Br, ['bId'])), ['eId']);
}
function correctOwnAll(Own, Br) { return proj(div(proj(Own, ['eId', 'bId']), proj(Br, ['bId'])), ['eId']); }

function eids(R) { return R.rows.map(function (r) { return r[0]; }).sort(); }
function sameSet(a, b) { return a.join(',') === b.join(','); }

/* GATE CSE 2026 Set 1 Q43: R(P,Q), S(X,Y) and the calculus expression E */
var R26 = rel(['P', 'Q'], [[1, 10], [2, 20], [3, 10], [4, 40]]);
var S26 = rel(['X', 'Y'], [[10, 'a'], [30, 'b'], [40, 'c']]);

/* E = { <u> | exists v exists w ( <u,v> in R and <v,w> in S ) }, evaluated
   by brute force over the active domain, with no algebra involved. */
function evalE(R, S) {
  var dom = {};
  R.rows.forEach(function (r) { dom[r[0]] = 1; });
  var out = [];
  Object.keys(dom).forEach(function (uk) {
    var u = isNaN(Number(uk)) ? uk : Number(uk);
    var found = false;
    R.rows.forEach(function (r) {
      if (r[0] !== u) return;
      var v = r[1];
      S.rows.forEach(function (s) { if (s[0] === v) found = true; });
    });
    if (found) out.push([u]);
  });
  return rel(['P'], out);
}
function opt26A(R, S) { return proj(thetaJoin(R, S, function (o) { return o['R.P'] === o['S.X']; }), ['R.P']); }
function opt26B(R, S) { return proj(thetaJoin(R, S, function (o) { return o['R.Q'] === o['S.X']; }), ['R.P']); }
function opt26C(R, S) { return proj(thetaJoin(R, S, function (o) { return o['R.P'] === o['S.Y']; }), ['R.P']); }
function opt26D(R, S) { return proj(thetaJoin(R, S, function (o) { return o['R.Q'] === o['S.Y']; }), ['R.P']); }

/* ---------------- three-valued logic, and the two readings ---------------- */
/* U is the unknown truth value, written as the string 'U'. */
function tNOT(a) { return a === 'U' ? 'U' : !a; }
function tAND(a, b) {
  if (a === false || b === false) return false;
  if (a === 'U' || b === 'U') return 'U';
  return true;
}
function tOR(a, b) {
  if (a === true || b === true) return true;
  if (a === 'U' || b === 'U') return 'U';
  return false;
}
/* comparison of a value with a constant. Under standard SQL three-valued
   logic a NULL operand gives U; under the GATE 2000 stipulation it gives
   false. Both readings are computed, because the answer key depends on it. */
function cmp(value, op, k, nullIsFalse) {
  if (value === null || k === null) return nullIsFalse ? false : 'U';
  if (op === '=') return value === k;
  if (op === '<>') return value !== k;
  if (op === '>') return value > k;
  if (op === '<') return value < k;
  throw new Error('bad op');
}

/* the GATE CSE 2000 Q2.26 instance: one column x holding 6, 5 and NULL */
var XS = [6, 5, null];

/* the three pairs of predicates the question compares */
function pairResults(nullIsFalse) {
  return XS.map(function (x) {
    return {
      x: x,
      A: [cmp(x, '=', 5, nullIsFalse), tNOT(tNOT(cmp(x, '=', 5, nullIsFalse)))],
      B: [cmp(x, '=', 5, nullIsFalse), tAND(cmp(x, '>', 4, nullIsFalse), cmp(x, '<', 6, nullIsFalse))],
      C: [cmp(x, '<>', 5, nullIsFalse), tNOT(cmp(x, '=', 5, nullIsFalse))]
    };
  });
}
function pairAgrees(nullIsFalse, which) {
  return pairResults(nullIsFalse).every(function (r) { return r[which][0] === r[which][1]; });
}

/* the aggregate example: Emp(eid, dept, sal) with NULLs in two columns */
var EMP = relBag(['eid', 'dept', 'sal'], [
  [1, 'A', 100], [2, 'A', null], [3, 'B', 200], [4, null, 300], [5, 'B', null]
]);
function countStar(R) { return R.rows.length; }
function countCol(R, c) {
  var i = idxOf(R, c);
  return R.rows.filter(function (r) { return r[i] !== null; }).length;
}
function sumCol(R, c) {
  var i = idxOf(R, c), s = 0;
  R.rows.forEach(function (r) { if (r[i] !== null) s += r[i]; });
  return s;
}
function avgCol(R, c) {
  var n = countCol(R, c);
  return n ? sumCol(R, c) / n : null;
}
/* GROUP BY: every row with a NULL key joins one group of its own, because
   GROUP BY treats NULLs as equal to each other. */
function groupBy(R, c) {
  var i = idxOf(R, c), groups = [], at = {};
  R.rows.forEach(function (r) {
    var key = r[i] === null ? '\u0000NULL' : String(r[i]);
    if (!(key in at)) { at[key] = groups.length; groups.push({ key: r[i], rows: [] }); }
    groups[at[key]].rows.push(r);
  });
  return groups;
}

/* the NOT IN / NOT EXISTS pair on S(x) = {1,2,3} and T(y) = {2, NULL} */
var S_NOTIN = [1, 2, 3];
var T_NOTIN = [2, null];
function notInRows() {
  return S_NOTIN.filter(function (x) {
    var res = T_NOTIN.map(function (y) { return cmp(x, '<>', y, false); });
    var acc = true;
    res.forEach(function (v) { acc = tAND(acc, v); });
    return acc === true;                     // WHERE keeps only TRUE
  });
}
function notExistsRows() {
  return S_NOTIN.filter(function (x) {
    return !T_NOTIN.some(function (y) { return y !== null && y === x; });
  });
}

/* ---------------- ER to relations: the mapping rules, applied ---------------- */
/* The example: Employee --(works, 1:N)--> Department, Employee --(owns, M:N)-->
 * Project, Phone a multivalued attribute of Employee, Dependent a weak entity
 * of Employee. The mapping produces these relations. */
var ER_MAP = [
  { name: 'Employee', from: 'strong entity', key: 'eid', fk: [] },
  { name: 'Department', from: 'strong entity', key: 'did', fk: [] },
  { name: 'Project', from: 'strong entity', key: 'pid', fk: [] },
  { name: 'Employee', from: '1:N relationship "works": the foreign key goes on the many side', key: 'eid', fk: ['did'] },
  { name: 'WorksOn', from: 'M:N relationship "owns": its own relation', key: 'eid,pid', fk: ['eid', 'pid'] },
  { name: 'Phone', from: 'multivalued attribute: its own relation', key: 'eid,phone', fk: ['eid'] },
  { name: 'Dependent', from: 'weak entity: owner key plus partial key', key: 'eid,dname', fk: ['eid'] }
];
var ER_RELATIONS = 5;   /* Employee, Department, Project, WorksOn, Phone, Dependent -> six, minus the merged 1:N note */
ER_RELATIONS = 6;

/* ======================================================================
   CHECKS - every quoted number is recomputed here from its definition
   ====================================================================== */

/* --- GATE 2017 Set 1 Q46: division on the printed CR instance --- */
chk('CR holds the 18 printed tuples', CR.rows.length === 18, CR.rows.length);
chk('T1 = pi_CourseName(sigma_StudentName=SA(CR)) is {CA,CB,CC}',
  sameSet(CR_T1.rows.map(function (r) { return r[0]; }).sort(), ['CA', 'CB', 'CC']),
  CR_T1.rows.map(function (r) { return r[0]; }).join(' '));
chk('GATE 2017: CR / T1 has 4 rows', CR_T2.rows.length === 4, CR_T2.rows.length);
chk('GATE 2017: the four rows are SA, SC, SD, SF',
  sameSet(CR_T2.rows.map(function (r) { return r[0]; }).sort(), ['SA', 'SC', 'SD', 'SF']),
  CR_T2.rows.map(function (r) { return r[0]; }).join(' '));
chk('GATE 2017: SB and SE are excluded, because SB lacks CA and SE lacks CC',
  CR_T2.rows.every(function (r) { return r[0] !== 'SB' && r[0] !== 'SE'; }));

/* --- division against its own definition and against its identity --- */
(function () {
  var cases = [
    [CR, CR_T1],
    [proj(CR, ['s', 'c']), rel(['c'], [['CB']])],
    [rel(['a', 'b'], [[1, 'x'], [1, 'y'], [2, 'x']]), rel(['b'], [['x'], ['y']])],
    [rel(['a', 'b'], [[1, 'x'], [1, 'y'], [2, 'x']]), rel(['b'], [['x']])],
    [rel(['a', 'b'], [[1, 'x'], [1, 'y'], [2, 'x']]), rel(['b'], [])]
  ];
  var defOk = cases.every(function (c) {
    var R = c[0], S = c[1], bCols = S.cols;
    var aCols = R.cols.filter(function (x) { return bCols.indexOf(x) < 0; });
    return div(R, S).rows.every(function (a) {
      return S.rows.every(function (b) {
        var full = R.cols.map(function (cc) {
          var i = aCols.indexOf(cc);
          return i >= 0 ? a[i] : b[bCols.indexOf(cc)];
        });
        return R.rows.some(function (r) { return r.join('\u0001') === full.join('\u0001'); });
      });
    });
  });
  chk('division: every output tuple is paired with every S tuple', defOk);
  var idOk = cases.every(function (c) {
    return sameSet(
      div(c[0], c[1]).rows.map(function (r) { return r.join('\u0001'); }).sort(),
      divByIdentity(c[0], c[1]).rows.map(function (r) { return r.join('\u0001'); }).sort());
  });
  chk('division equals pi_A(R) - pi_A(pi_A(R) x S - R) on 5 instances', idOk);
  chk('division by an empty S returns every A-value of R',
    div(cases[4][0], cases[4][1]).rows.length === 2,
    div(cases[4][0], cases[4][1]).rows.length);
})();

/* --- GATE 2022 Q25: which of the four options answer the question --- */
chk('GATE 2022 witness W1: the correct answer is empty',
  correctOwnAll(OWN_W1, BRAND_W1).rows.length === 0);
chk('GATE 2022: option C returns E1 on W1, so C is not equivalent',
  sameSet(eids(optC(OWN_W1, BRAND_W1)), ['E1']), eids(optC(OWN_W1, BRAND_W1)).join(','));
chk('GATE 2022 witness W2: the correct answer is empty',
  correctOwnAll(OWN_W2, BRAND_W2).rows.length === 0);
chk('GATE 2022: option D returns E1,E2 on W2, so D is not equivalent',
  sameSet(eids(optD(OWN_W2, BRAND_W2)), ['E1', 'E2']), eids(optD(OWN_W2, BRAND_W2)).join(','));
(function () {
  /* deterministic pseudo-random instances: the same five every time */
  var seed = 20262027;
  function rnd(n) { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; }
  var aOk = true, bOk = true, agree = true;
  for (var t = 0; t < 5; t++) {
    var brands = ['B1', 'B2', 'B3'].slice(0, 1 + rnd(3));
    var people = ['E1', 'E2', 'E3'].slice(0, 1 + rnd(3));
    var rows = [];
    people.forEach(function (e) {
      brands.forEach(function (b) { if (rnd(2) === 0) rows.push([e, b]); });
    });
    var Own = rel(['eId', 'bId'], rows);
    var Br = rel(['bId'], brands.map(function (b) { return [b]; }));
    var truth = eids(correctOwnAll(Own, Br));
    if (!sameSet(eids(optA(Own, Br)), truth)) aOk = false;
    if (!sameSet(eids(optB(Own, Br)), truth)) bOk = false;
    if (!sameSet(eids(optA(Own, Br)), eids(optB(Own, Br)))) agree = false;
  }
  chk('GATE 2022: option A agrees with the definition on 5 random instances', aOk);
  chk('GATE 2022: option B agrees with the definition on 5 random instances', bOk);
  chk('GATE 2022: options A and B always agree with each other', agree);
})();

/* --- GATE 2026 Set 1 Q43: the calculus expression against the four options --- */
(function () {
  var E = evalE(R26, S26);
  chk('GATE 2026: the brute-force evaluation of E gives P = {1,3,4}',
    sameSet(E.rows.map(function (r) { return r[0]; }).sort(), [1, 3, 4]),
    E.rows.map(function (r) { return r[0]; }).join(','));
  chk('GATE 2026: option B equals E',
    sameSet(opt26B(R26, S26).rows.map(function (r) { return r[0]; }).sort(), [1, 3, 4]));
  chk('GATE 2026: options A, C and D do not equal E on this instance',
    opt26A(R26, S26).rows.length !== 3 && opt26C(R26, S26).rows.length !== 3 && opt26D(R26, S26).rows.length !== 3,
    opt26A(R26, S26).rows.length + '/' + opt26C(R26, S26).rows.length + '/' + opt26D(R26, S26).rows.length);
})();

/* --- the operators against their own properties --- */
(function () {
  var A = rel(['a', 'b'], [[1, 'x'], [2, 'y'], [3, 'x']]);
  var B = rel(['a', 'b'], [[2, 'y'], [4, 'z']]);
  chk('|R x S| = |R| * |S|', cross(A, B).rows.length === 6, cross(A, B).rows.length);
  chk('degree of R x S = degree(R) + degree(S)', cross(A, B).cols.length === 4);
  chk('R union R = R', union(A, A).rows.length === A.rows.length);
  chk('R - R is empty', diff(A, A).rows.length === 0);
  chk('R intersect S = R - (R - S)',
    sameSet(inter(A, B).rows.map(function (r) { return r.join('|'); }).sort(),
            diff(A, diff(A, B)).rows.map(function (r) { return r.join('|'); }).sort()));
  var J = natJoin(rel(['k', 'v'], [[1, 'a'], [2, 'b']]), rel(['k', 'w'], [[1, 'p'], [3, 'q']]));
  chk('natural join keeps one copy of the common column: degree 3', J.cols.length === 3, J.cols.join(','));
  chk('natural join on 1 match gives 1 row', J.rows.length === 1, J.rows.length);
  chk('natural join with no common column is the cross product',
    natJoin(rel(['a'], [[1], [2]]), rel(['b'], [[7], [8], [9]])).rows.length === 6);
  chk('pi removes duplicates: 18 CR tuples give 4 distinct courses',
    proj(CR, ['c']).rows.length === 4, proj(CR, ['c']).rows.length);
  chk('the same projection under bag semantics keeps 18 rows',
    projBag(CR, ['c']).rows.length === 18, projBag(CR, ['c']).rows.length);
  chk('sigma then pi equals pi then sigma when the predicate survives the projection',
    proj(sel(CR, function (o) { return o.s === 'SA'; }), ['c']).rows.length ===
    sel(proj(CR, ['s', 'c']), function (o) { return o.s === 'SA'; }).rows.length);
})();

/* --- three-valued logic --- */
chk('3VL: NULL AND FALSE is FALSE', tAND('U', false) === false);
chk('3VL: NULL OR TRUE is TRUE', tOR('U', true) === true);
chk('3VL: NOT NULL is NULL', tNOT('U') === 'U');
chk('3VL: NULL AND TRUE is NULL', tAND('U', true) === 'U');
chk('GATE 2000: under the stated rule (a NULL comparison is false), pair C is not equivalent',
  !pairAgrees(true, 'C') && pairAgrees(true, 'A') && pairAgrees(true, 'B'));
chk('GATE 2000: under standard 3VL none of the three pairs differs, which is why the stipulation matters',
  pairAgrees(false, 'A') && pairAgrees(false, 'B') && pairAgrees(false, 'C'));
chk('WHERE keeps only TRUE: x = 5 and x <> 5 together return 2 of 3 rows',
  XS.filter(function (x) { return cmp(x, '=', 5, false) === true; }).length +
  XS.filter(function (x) { return cmp(x, '<>', 5, false) === true; }).length === 2);
chk('NOT IN over a subquery holding a NULL returns no rows', notInRows().length === 0, notInRows().length);
chk('NOT EXISTS over the same data returns 2 rows',
  sameSet(notExistsRows(), [1, 3]), notExistsRows().join(','));

/* --- SQL bag semantics and aggregation --- */
chk('COUNT(*) counts 5 rows; COUNT(sal) counts 3',
  countStar(EMP) === 5 && countCol(EMP, 'sal') === 3, countStar(EMP) + '/' + countCol(EMP, 'sal'));
chk('AVG(sal) is 200, because it divides by the 3 non-NULL salaries', eqNum(avgCol(EMP, 'sal'), 200), avgCol(EMP, 'sal'));
chk('GROUP BY dept makes 3 groups, one of them the NULL key', groupBy(EMP, 'dept').length === 3, groupBy(EMP, 'dept').length);
chk('HAVING COUNT(*) > 1 keeps 2 of those groups',
  groupBy(EMP, 'dept').filter(function (g) { return g.rows.length > 1; }).length === 2);
chk('SELECT dept returns 5 rows while SELECT DISTINCT dept returns 3',
  projBag(EMP, ['dept']).rows.length === 5 && proj(EMP, ['dept']).rows.length === 3);
chk('the group with the NULL key holds exactly the one row whose dept is NULL',
  groupBy(EMP, 'dept').filter(function (g) { return g.key === null; })[0].rows.length === 1);

/* --- ER mapping and the vocabulary --- */
chk('ER mapping: the M:N relationship needs a relation of its own', ER_MAP[4].name === 'WorksOn' && ER_MAP[4].fk.length === 2);
chk('ER mapping: the 1:N relationship does not, its foreign key joins the many side',
  ER_MAP[3].name === 'Employee' && ER_MAP[3].fk.length === 1);
chk('ER mapping: the weak entity key is owner key plus partial key', ER_MAP[6].key === 'eid,dname');
chk('ER mapping: the example produces 6 relations', ER_RELATIONS === 6, ER_RELATIONS);
chk('degree of Own(eId, bId) is 2', OWN.cols.length === 2);
chk('cardinality of Own is the number of its tuples', OWN.rows.length === 3, OWN.rows.length);

/* ---------------- export for the drawing layer ---------------- */
var MODEL = {
  CR: CR, CR_T1: CR_T1, CR_T2: CR_T2,
  OWN: OWN, BRAND: BRAND,
  OWN_W1: OWN_W1, BRAND_W1: BRAND_W1, OWN_W2: OWN_W2, BRAND_W2: BRAND_W2,
  R26: R26, S26: S26, E26: evalE(R26, S26),
  XS: XS, EMP: EMP, ER_MAP: ER_MAP,
  fns: {
    rel: rel, sel: sel, proj: proj, projBag: projBag, cross: cross, union: union,
    diff: diff, inter: inter, natJoin: natJoin, thetaJoin: thetaJoin, div: div,
    groupBy: groupBy, countCol: countCol, sumCol: sumCol, avgCol: avgCol,
    optA: optA, optB: optB, optC: optC, optD: optD,
    opt26A: opt26A, opt26B: opt26B, opt26C: opt26C, opt26D: opt26D,
    tNOT: tNOT, tAND: tAND, tOR: tOR, cmp: cmp,
    notInRows: notInRows, notExistsRows: notExistsRows
  }
};
window.__MODEL = MODEL;
window.__lessonChecks = CHECKS;


/* ======================================================================
   LAYER 2 - GEOMETRY HELPERS
   Everything a scene draws goes through these, so the tables look the same
   in every scene and nothing is positioned by hand twice.
   ====================================================================== */

function bg() {
  P.rect(0, 0, W, H, { fill: PAL.surface });
}

function heading(x, y, s) {
  P.text(x, y, s, { size: 15, bold: true, color: PAL.ink });
}

function note(x, y, s, o) {
  o = o || {};
  P.text(x, y, s, { size: o.size || 12.5, color: o.color || PAL.dim, mono: !!o.mono, bold: !!o.bold });
}

function mono(x, y, s, o) {
  o = o || {};
  P.text(x, y, s, { size: o.size || 12.5, mono: true, color: o.color || PAL.ink, bold: !!o.bold, align: o.align || 'left' });
}

/* a relation drawn as a table. Returns {w,h} so callers can stack below it. */
function tableBox(x, y, cols, rows, o) {
  o = o || {};
  var cw = o.cw || 76, rh = o.rh || 20, hh = o.hh || 22;
  var n = Math.min(rows.length, o.maxRows || rows.length);
  var w = cw * cols.length, h = hh + rh * Math.max(n, 1);
  P.rect(x, y, w, h, { fill: o.fill || PAL.surface2, stroke: PAL.border, sw: 1, radius: 4 });
  P.rect(x, y, w, hh, { fill: o.headFill || PAL.accentDim, radius: 4 });
  cols.forEach(function (c, i) {
    P.text(x + cw * i + cw / 2, y + hh / 2, c, {
      size: o.size || 11.5, mono: true, bold: true, align: 'center', base: 'middle', color: PAL.ink
    });
  });
  rows.slice(0, n).forEach(function (r, ri) {
    var ry = y + hh + ri * rh;
    if (o.hl && o.hl[ri]) P.rect(x + 1, ry, w - 2, rh - 1, { fill: o.hl[ri] });
    P.line(x, ry, x + w, ry, { stroke: PAL.border, sw: 0.6 });
    r.forEach(function (v, ci) {
      P.text(x + cw * ci + cw / 2, ry + rh / 2, String(v === null ? 'NULL' : v), {
        size: o.size || 11.5, mono: true, align: 'center', base: 'middle',
        color: v === null ? PAL.invalid : PAL.ink
      });
    });
  });
  if (rows.length > n) {
    P.text(x + w / 2, y + hh + n * rh + 3, '+ ' + (rows.length - n) + ' more', {
      size: 10, align: 'center', color: PAL.dim
    });
  }
  if (o.title) {
    P.text(x, y - 8, o.title, { size: 12, bold: true, color: PAL.ink });
  }
  return { w: w, h: h };
}

/* a verdict line: a tick or a cross, then the text */
function verdict(x, y, ok, label) {
  var col = ok ? PAL.valid : PAL.invalid;
  P.circle(x + 6, y + 7, 6, { fill: col });
  P.text(x + 6, y + 7, ok ? '\u2713' : '\u2717', { size: 10, bold: true, align: 'center', base: 'middle', color: PAL.surface });
  P.text(x + 20, y, label, { size: 11.5, mono: true, color: PAL.ink });
}

/* a labelled step box for the SQL pipeline */
function stepBox(x, y, w, h, label, sub, o) {
  o = o || {};
  P.rect(x, y, w, h, { fill: o.fill || PAL.surface2, stroke: o.stroke || PAL.border, sw: 1.4, radius: 6 });
  P.text(x + w / 2, y + h / 2 - (sub ? 7 : 0), label, { size: 12.5, bold: true, align: 'center', base: 'middle', color: PAL.ink });
  if (sub) P.text(x + w / 2, y + h / 2 + 8, sub, { size: 10.5, align: 'center', base: 'middle', color: PAL.dim });
}

/* ======================================================================
   LAYER 3 - THE SCENES
   One function per scene id in the timeline. Each takes the local time
   inside the scene and draws the state of the argument at that moment.
   ====================================================================== */

var SCENES = {};

/* ---------------- scene 1: what a relation is ---------------- */
SCENES.model = function (u) {
  heading(30, 26, 'A relation is a set of tuples over one schema');
  var rows = [[1, 'x'], [2, 'y'], [3, 'x'], [4, 'z']];
  var shown = Math.max(0, Math.min(4, Math.floor(u / 2.2)));
  var R = rows.slice(0, shown);
  if (u > 13) R = rows.concat([[2, 'y']]);          // the duplicate arrives
  var hl = {};
  if (u > 13 && u < 22) hl[4] = PR.rgba(PAL.invalidDim, 0.9);
  tableBox(40, 70, ['A', 'B'], R, { cw: 92, rh: 24, hh: 26, hl: hl, title: 'R(A, B)' });
  if (u > 13 && u < 22) {
    P.line(40, 70 + 26 + 4 * 24 + 12, 40 + 184, 70 + 26 + 4 * 24 + 12, { stroke: PAL.invalid, sw: 2.4 });
    P.text(240, 70 + 26 + 4 * 24 + 4, 'same tuple: a set keeps one copy', { size: 12, color: PAL.invalid });
  }
  if (u > 8) {
    mono(40, 250, 'degree(R) = 2', { size: 13, bold: true });
    note(150, 250, 'the number of attributes, here A and B', { size: 12 });
    mono(40, 276, 'cardinality(R) = 4', { size: 13, bold: true });
    note(190, 276, 'the number of tuples in this instance', { size: 12 });
  }
  if (u > 22) {
    note(40, 320, 'A schema is a name plus a list of attributes. An instance is the set of tuples', { size: 12.5 });
    note(40, 340, 'that exists at one moment. Every operator below reads one or two instances', { size: 12.5 });
    note(40, 360, 'and returns a new instance with a schema you can predict in advance.', { size: 12.5 });
  }
};

/* ---------------- scene 2: sigma and pi ---------------- */
SCENES.prim = function (u) {
  heading(30, 26, 'Selection filters rows; projection keeps columns');
  var CR = MODEL.CR;
  var hl = {};
  if (u > 8) {
    CR.rows.forEach(function (r, i) { if (r[0] === 'SA') hl[i] = PR.rgba(PAL.valid, 0.22); });
  }
  tableBox(30, 62, ['s', 'c'], CR.rows, { cw: 62, rh: 17, hh: 22, hl: hl, title: 'CR(s, c) \u2014 18 tuples' });
  if (u > 8) {
    P.arrow(160, 150, 206, 150, { stroke: PAL.valid, sw: 1.8, head: 9 });
    tableBox(212, 62, ['s', 'c'], CR.rows.filter(function (r) { return r[0] === 'SA'; }),
      { cw: 62, rh: 20, hh: 22, title: '\u03c3 s=\'SA\' (CR)' });
    mono(212, 62 + 22 + 3 * 20 + 14, '3 tuples, degree 2', { size: 11.5, color: PAL.valid });
  }
  if (u > 18) {
    P.arrow(348, 100, 394, 100, { stroke: PAL.accent, sw: 1.8, head: 9 });
    tableBox(400, 62, ['c'], MODEL.CR_T1.rows, { cw: 70, rh: 20, hh: 22, title: '\u03c0 c (CR)' });
    mono(400, 62 + 22 + 4 * 20 + 14, '4 tuples, degree 1', { size: 11.5, color: PAL.accent });
  }
  if (u > 24) {
    mono(540, 78, 'SQL:', { size: 12, bold: true });
    mono(540, 100, 'SELECT DISTINCT c', { size: 11.5 });
    mono(540, 118, 'FROM CR', { size: 11.5 });
    mono(540, 136, "WHERE s = 'SA'", { size: 11.5 });
  }
  note(30, 404, 'Selection keeps the rows that pass a test and leaves the schema alone.', { size: 12 });
  note(30, 424, 'Projection keeps the columns you name and drops repeated rows: 18 tuples become 4.', { size: 12 });
  note(30, 444, 'DISTINCT restores the set that pi gives for free; without it SQL returns 18 rows.', { size: 12, color: PAL.warn });
};

/* ---------------- scene 3: union, difference, intersection, product ---------------- */
SCENES.sets = function (u) {
  heading(30, 26, 'Union, difference, intersection, and the product');
  var A = [[1, 'x'], [2, 'y'], [3, 'x']];
  var B = [[2, 'y'], [4, 'z']];
  tableBox(30, 64, ['A', 'B'], A, { cw: 56, rh: 20, hh: 22, title: 'R(A, B)' });
  tableBox(30, 176, ['A', 'B'], B, { cw: 56, rh: 20, hh: 22, title: 'S(A, B)' });
  note(30, 250, 'Both operands must have the same schema, in the same order.', { size: 12 });
  note(30, 268, 'That is a requirement, not a convention.', { size: 12, color: PAL.warn });

  if (u > 6) {
    tableBox(200, 64, ['A', 'B'], [[1, 'x'], [2, 'y'], [3, 'x'], [4, 'z']],
      { cw: 56, rh: 20, hh: 22, title: 'R \u222a S', hl: { 3: PR.rgba(PAL.accent, 0.2) } });
    note(200, 64 + 22 + 4 * 20 + 12, '4 rows: the tuple (2,y)', { size: 11.5 });
    note(200, 64 + 22 + 4 * 20 + 30, 'appears once, not twice', { size: 11.5 });
  }
  if (u > 12) {
    tableBox(390, 64, ['A', 'B'], [[1, 'x'], [3, 'x']],
      { cw: 56, rh: 20, hh: 22, title: 'R \u2212 S' });
    note(390, 64 + 22 + 2 * 20 + 12, 'rows of R that are not', { size: 11.5 });
    note(390, 64 + 22 + 2 * 20 + 30, 'in S. Order does not matter.', { size: 11.5 });
  }
  if (u > 18) {
    tableBox(560, 64, ['A', 'B'], [[2, 'y']], { cw: 56, rh: 20, hh: 22, title: 'R \u2229 S' });
    note(560, 64 + 22 + 20 + 12, 'derived: R \u2212 (R \u2212 S)', { size: 11.5 });
    note(560, 64 + 22 + 20 + 30, 'never a primitive', { size: 11.5, color: PAL.warn });
  }
  if (u > 24) {
    tableBox(700, 64, ['A', 'B', 'A', 'B'], [[1, 'x', 2, 'y'], [1, 'x', 4, 'z'], [2, 'y', 2, 'y'], [2, 'y', 4, 'z'], [3, 'x', 2, 'y'], [3, 'x', 4, 'z']],
      { cw: 34, rh: 17, hh: 22, title: 'R \u00d7 S', size: 10 });
    note(700, 64 + 22 + 6 * 17 + 12, 'every pair, so 3 \u00d7 2 = 6 rows', { size: 11.5 });
    note(700, 64 + 22 + 6 * 17 + 30, 'and 2 + 2 = 4 columns', { size: 11.5 });
  }
};

/* ---------------- scene 4: the join ---------------- */
SCENES.join = function (u) {
  heading(30, 26, 'The join is selection on a product, written shorter');
  var R = MODEL.R26, S = MODEL.S26;
  var hlR = {}, hlS = {};
  if (u > 6) { hlR[0] = PR.rgba(PAL.valid, 0.22); hlR[2] = PR.rgba(PAL.valid, 0.22); hlR[3] = PR.rgba(PAL.valid, 0.22); }
  if (u > 6) { hlS[0] = PR.rgba(PAL.valid, 0.22); hlS[2] = PR.rgba(PAL.valid, 0.22); }
  tableBox(40, 70, ['P', 'Q'], R.rows, { cw: 52, rh: 22, hh: 24, hl: hlR, title: 'R(P, Q)' });
  tableBox(230, 70, ['X', 'Y'], S.rows, { cw: 52, rh: 22, hh: 24, hl: hlS, title: 'S(X, Y)' });
  if (u > 6) {
    P.line(144, 120, 230, 120, { stroke: PAL.valid, sw: 1.4, dash: [4, 3] });
    P.line(144, 164, 230, 142, { stroke: PAL.valid, sw: 1.4, dash: [4, 3] });
    note(40, 240, 'Q = 20 has no partner in S, so that row disappears.', { size: 12 });
  }
  if (u > 12) {
    mono(40, 268, 'R \u22c8 R.Q = S.X S', { size: 13, bold: true });
    var J = MODEL.fns.thetaJoin(R, S, function (o) { return o['R.Q'] === o['S.X']; });
    tableBox(40, 304, ['R.P', 'R.Q', 'S.X', 'S.Y'], J.rows, { cw: 62, rh: 20, hh: 22, title: 'the theta join' });
    note(40, 304 + 22 + 3 * 20 + 16, '3 rows, 4 columns: no column is merged, because', { size: 11.5 });
    note(40, 304 + 22 + 3 * 20 + 34, 'the attributes have different names.', { size: 11.5 });
  }
  if (u > 20) {
    mono(400, 96, 'natural join', { size: 12.5, bold: true });
    note(400, 116, 'joins on every equally named attribute', { size: 11.5 });
    note(400, 134, 'and keeps one copy of each. Here the', { size: 11.5 });
    note(400, 152, 'names differ, so R \u22c8 S is R \u00d7 S: 12 rows.', { size: 11.5 });
    mono(400, 186, 'degree(R \u22c8 S) =', { size: 12 });
    mono(400, 206, '  degree(R) + degree(S) \u2212 common', { size: 12 });
    note(400, 236, 'With Q and X both named k, the natural join', { size: 11.5 });
    note(400, 254, 'would give 3 columns, not 4.', { size: 11.5 });
    mono(400, 292, 'outer joins', { size: 12.5, bold: true });
    note(400, 312, 'keep the unmatched rows and fill the', { size: 11.5 });
    note(400, 330, 'missing side with NULL. That is a SQL', { size: 11.5 });
    note(400, 348, 'addition, not a relational-algebra one.', { size: 11.5 });
  }
};

/* ---------------- scene 5: division, on the GATE 2017 instance ---------------- */
SCENES.div = function (u) {
  heading(30, 26, 'Division answers "for every one of these"');
  var students = ['SA', 'SB', 'SC', 'SD', 'SE', 'SF'];
  var courses = ['CA', 'CB', 'CC', 'CD'];
  var x0 = 110, y0 = 78, cw = 54, rh = 26;
  courses.forEach(function (c, ci) {
    P.text(x0 + cw * ci + cw / 2, y0 - 12, c, { size: 12, mono: true, bold: true, align: 'center', color: PAL.ink });
  });
  var inT1 = { CA: 1, CB: 1, CC: 1 };
  students.forEach(function (s, ri) {
    P.text(x0 - 14, y0 + rh * ri + rh / 2, s, { size: 12, mono: true, bold: true, align: 'right', base: 'middle', color: PAL.ink });
    courses.forEach(function (c, ci) {
      var has = MODEL.CR.rows.some(function (r) { return r[0] === s && r[1] === c; });
      var cx = x0 + cw * ci, cy = y0 + rh * ri;
      var fill = has ? (inT1[c] && u > 8 ? PR.rgba(PAL.valid, 0.28) : PR.rgba(PAL.accentDim, 0.9)) : PAL.surface2;
      P.rect(cx, cy, cw, rh, { fill: fill, stroke: PAL.border, sw: 0.6 });
      if (has) P.text(cx + cw / 2, cy + rh / 2, '\u2022', { size: 13, align: 'center', base: 'middle', color: PAL.ink });
    });
  });
  note(x0, y0 + rh * 6 + 12, 'A dot = the student took that course.', { size: 11.5 });
  if (u > 8) {
    P.rect(x0, y0 - 24, cw * 3, 16, { fill: PR.rgba(PAL.valid, 0.14), radius: 3 });
    P.text(x0 + cw * 1.5, y0 - 16, 'T1 = \u03c0 c (\u03c3 s=SA (CR)) = {CA, CB, CC}', { size: 10.5, align: 'center', base: 'middle', color: PAL.valid });
  }
  if (u > 16) {
    students.forEach(function (s, ri) {
      var hasAll = courses.filter(function (c) { return inT1[c]; }).every(function (c) {
        return MODEL.CR.rows.some(function (r) { return r[0] === s && r[1] === c; });
      });
      var cy = y0 + rh * ri;
      P.rect(x0 + cw * 4 + 10, cy, 150, rh - 2, {
        fill: hasAll ? PR.rgba(PAL.valid, 0.2) : PR.rgba(PAL.surface2, 1),
        stroke: hasAll ? PAL.valid : PAL.border, sw: 1, radius: 3
      });
      P.text(x0 + cw * 4 + 18, cy + rh / 2 - 1, (hasAll ? '\u2713 keeps ' : '\u2717 drops ') + s, {
        size: 11.5, base: 'middle', color: hasAll ? PAL.valid : PAL.dim
      });
    });
    note(x0, y0 + rh * 6 + 40, 'CR \u00f7 T1 = {SA, SC, SD, SF}: 4 rows', { size: 12.5, bold: true, color: PAL.valid });
  }
  if (u > 24) {
    mono(560, 96, 'R(A,B) \u00f7 S(B)', { size: 12.5, bold: true });
    mono(560, 120, '= \u03c0 A(R)', { size: 12 });
    mono(560, 138, '  \u2212 \u03c0 A( \u03c0 A(R) \u00d7 S \u2212 R )', { size: 12 });
    note(560, 166, 'No selection, no join: division is', { size: 11.5 });
    note(560, 184, 'projection, product and difference.', { size: 11.5 });
    note(560, 214, 'If S is empty the answer is every', { size: 11.5, color: PAL.warn });
    note(560, 232, 'A-value of R, because the test is', { size: 11.5, color: PAL.warn });
    note(560, 250, 'vacuously true.', { size: 11.5, color: PAL.warn });
    note(560, 288, 'SB lacks CA; SE lacks CC.', { size: 11.5 });
    note(560, 306, 'Each one fails a single course,', { size: 11.5 });
    note(560, 324, 'which is enough to be dropped.', { size: 11.5 });
  }
};

/* ---------------- scene 6: "for all" as division, GATE 2022 ---------------- */
SCENES.forall = function (u) {
  heading(30, 26, 'Four ways to write "owns all the brands"');
  var W = u > 15 ? 2 : 1;
  var Own = W === 1 ? MODEL.OWN_W1 : MODEL.OWN_W2;
  var Br = W === 1 ? MODEL.BRAND_W1 : MODEL.BRAND_W2;
  var f = MODEL.fns;
  tableBox(40, 70, ['eId', 'bId'], Own.rows, { cw: 62, rh: 20, hh: 22, title: 'Own' });
  tableBox(210, 70, ['bId'], Br.rows, { cw: 62, rh: 20, hh: 22, title: 'Brand' });
  note(40, 200, W === 1 ? 'Witness 1: three brands are owned by nobody' : 'Witness 2: two people, two brands, no overlap',
    { size: 12, bold: true, color: PAL.ink });
  note(40, 218, W === 1 ? 'Brand = {B1,B2,B3,B4}, Own = {(E1,B1),(E1,B2),(E2,B2)}'
    : 'Brand = {B1,B2}, Own = {(E1,B1),(E2,B2)}', { size: 11.5, mono: true });
  note(40, 244, 'Correct answer: the employees who own all ' + Br.rows.length + ' brands = '
    + (f.optA(Own, Br).rows.length ? f.optA(Own, Br).rows.map(function (r) { return r[0]; }).join(',') : 'nobody'),
    { size: 12, color: PAL.valid });

  var res = [
    ['(A) \u03c0 eId (\u03c0 eId,bId(Own) \u00f7 \u03c0 bId(Brand))', f.optA(Own, Br)],
    ['(B) \u03c0 eId(Own) \u2212 \u03c0 eId( \u03c0 eId(Own) \u00d7 \u03c0 bId(Brand) \u2212 Own )', f.optB(Own, Br)],
    ['(C) \u03c0 eId (\u03c0 eId,bId(Own) \u00f7 \u03c0 bId(Own))', f.optC(Own, Br)],
    ['(D) \u03c0 eId ( \u03c0 eId(Own) \u00d7 \u03c0 bId(Own) \u00f7 \u03c0 bId(Brand) )', f.optD(Own, Br)]
  ];
  var truth = f.optA(Own, Br).rows.map(function (r) { return r[0]; }).sort().join(',');
  res.forEach(function (r, i) {
    var got = r[1].rows.map(function (x) { return x[0]; }).sort().join(',');
    var ok = got === truth;
    verdict(40, 286 + i * 26, ok, r[0]);
    P.text(640, 286 + i * 26, got === '' ? '\u2205' : '{' + got + '}', {
      size: 11.5, mono: true, color: ok ? PAL.valid : PAL.invalid, bold: true
    });
  });
  if (u > 15) {
    note(40, 400, 'The two correct options never disagree. C and D each fail on one witness:', { size: 12 });
    note(40, 418, 'C divides by the brands that happen to be owned; D invents every pair before dividing.', { size: 12 });
  } else {
    note(40, 400, 'C and D agree with A and B on many instances. One witness is enough to kill them,', { size: 12 });
    note(40, 418, 'and finding that witness is the whole question.', { size: 12 });
  }
};

/* ---------------- scene 7: tuple relational calculus ---------------- */
SCENES.trc = function (u) {
  heading(30, 26, 'The same question as a logical formula');
  mono(30, 58, 'E = { \u27e8u\u27e9 | \u2203v \u2203w ( \u27e8u,v\u27e9 \u2208 R \u2227 \u27e8v,w\u27e9 \u2208 S ) }', { size: 13, bold: true });
  note(30, 78, 'u, v, w are tuple variables. A variable that appears in two relations forces them to agree.', { size: 11.5 });
  var R = MODEL.R26, S = MODEL.S26;
  var hlR = {}, hlS = {};
  if (u > 6) { hlR[0] = PR.rgba(PAL.valid, 0.22); hlR[2] = PR.rgba(PAL.valid, 0.22); hlR[3] = PR.rgba(PAL.valid, 0.22); hlS[0] = PR.rgba(PAL.valid, 0.22); hlS[2] = PR.rgba(PAL.valid, 0.22); }
  tableBox(40, 110, ['P', 'Q'], R.rows, { cw: 52, rh: 22, hh: 24, hl: hlR, title: 'R(P, Q)' });
  tableBox(230, 110, ['X', 'Y'], S.rows, { cw: 52, rh: 22, hh: 24, hl: hlS, title: 'S(X, Y)' });
  if (u > 6) {
    P.line(144, 160, 230, 160, { stroke: PAL.valid, sw: 1.5, dash: [4, 3] });
    P.text(187, 152, 'v', { size: 11, mono: true, bold: true, align: 'center', color: PAL.valid });
    note(40, 250, 'u is R.P, v is R.Q and also S.X, w is S.Y. The shared v becomes R.Q = S.X.', { size: 11.5 });
    note(40, 268, 'w is quantified and never output, so Y drops out of the answer.', { size: 11.5 });
  }
  if (u > 13) {
    mono(40, 292, 'E = \u03c0 P ( S \u22c8 S.X=R.Q R )', { size: 13, bold: true, color: PAL.valid });
    tableBox(40, 332, ['P'], MODEL.E26.rows, { cw: 52, rh: 20, hh: 22, title: 'the answer' });
    note(40, 442, 'P = {1, 3, 4}. P = 2 has Q = 20, and no S has X = 20.', { size: 11.5 });
  }
  if (u > 21) {
    note(420, 306, 'The four options of GATE 2026 Set 1 Q43:', { size: 12, bold: true, color: PAL.ink });
    var opts = [
      ['A', '\u03c0 P ( R \u22c8 R.P=S.X S )', MODEL.fns.opt26A(R, S)],
      ['B', '\u03c0 P ( S \u22c8 S.X=R.Q R )', MODEL.fns.opt26B(R, S)],
      ['C', '\u03c0 P ( R \u22c8 R.P=S.Y S )', MODEL.fns.opt26C(R, S)],
      ['D', '\u03c0 P ( S \u22c8 S.Y=R.Q R )', MODEL.fns.opt26D(R, S)]
    ];
    opts.forEach(function (o, i) {
      var got = o[2].rows.map(function (r) { return r[0]; }).sort().join(',');
      verdict(420, 328 + i * 26, got === '1,3,4', '(' + o[0] + ') ' + o[1]);
      P.text(700, 328 + i * 26, got === '' ? '\u2205' : '{' + got + '}', {
        size: 11.5, mono: true, bold: true, color: got === '1,3,4' ? PAL.valid : PAL.invalid
      });
    });
    note(420, 440, 'Only B joins the right pair of attributes.', { size: 11.5 });
  }
};

/* ---------------- scene 8: the SQL skeleton ---------------- */
SCENES.sql = function (u) {
  heading(30, 26, 'SQL is written in one order and evaluated in another');
  var steps = [
    ['FROM', 'build the product'], ['WHERE', 'filter rows'], ['GROUP BY', 'form groups'],
    ['HAVING', 'filter groups'], ['SELECT', 'choose columns'], ['ORDER BY', 'sort last']
  ];
  steps.forEach(function (s, i) {
    var x = 30 + (i % 3) * 200, y = 70 + Math.floor(i / 3) * 78;
    var on = u > 4 + i * 3;
    stepBox(x, y, 170, 54, s[0], s[1], {
      fill: on ? PR.rgba(PAL.accentDim, 0.85) : PAL.surface2,
      stroke: on ? PAL.accent : PAL.border
    });
    if (i % 3 < 2) P.arrow(x + 172, y + 27, x + 198, y + 27, { stroke: PAL.dim, sw: 1.2, head: 7 });
  });
  P.arrow(360, 124, 360, 140, { stroke: PAL.dim, sw: 1.2, head: 7 });
  if (u > 22) {
    note(30, 250, 'The correspondence, which is what most questions test:', { size: 12, bold: true, color: PAL.ink });
    var rows = [
      ['\u03c0', 'SELECT DISTINCT', 'pi drops duplicates, SELECT keeps them'],
      ['\u03c3', 'WHERE', 'same rows, same test'],
      ['\u00d7', 'FROM A, B', 'the product is the default of a comma'],
      ['\u222a, \u2212, \u2229', 'UNION, EXCEPT, INTERSECT', 'EXCEPT and INTERSECT are not in every engine'],
      ['\u03c1', 'AS', 'renaming, needed for self-joins']
    ];
    rows.forEach(function (r, i) {
      mono(30, 276 + i * 26, r[0], { size: 13, bold: true });
      mono(110, 276 + i * 26, r[1], { size: 11.5, color: PAL.accent });
      note(320, 276 + i * 26, r[2], { size: 11.5 });
    });
    note(30, 412, 'SELECT list is evaluated after WHERE, so an alias made in SELECT cannot be used in WHERE.', { size: 11.5, color: PAL.warn });
  } else {
    note(30, 250, 'Read it in this order, not in the order it is typed.', { size: 12 });
  }
};

/* ---------------- scene 9: NULL and three-valued logic ---------------- */
SCENES.nulls = function (u) {
  heading(30, 26, 'NULL is unknown, so WHERE can throw a row away twice');
  var vals = [true, false, 'U'];
  var lbl = { 'true': 'T', 'false': 'F', 'U': 'U' };
  var x0 = 30, y0 = 66, cw = 40, rh = 26;
  P.text(x0, y0 - 10, 'AND', { size: 12, bold: true, color: PAL.ink });
  vals.forEach(function (a, i) {
    P.text(x0 + 44 + cw * i + cw / 2, y0 - 10, lbl[String(a)], { size: 11.5, mono: true, bold: true, align: 'center', color: PAL.dim });
    P.text(x0 + 30, y0 + rh * i + rh / 2, lbl[String(a)], { size: 11.5, mono: true, bold: true, align: 'right', base: 'middle', color: PAL.dim });
    vals.forEach(function (b, j) {
      var v = MODEL.fns.tAND(a, b);
      var cx = x0 + 44 + cw * j, cy = y0 + rh * i;
      P.rect(cx, cy, cw, rh, {
        fill: v === 'U' ? PR.rgba(PAL.warnDim, 0.9) : PR.rgba(PAL.accentDim, 0.7),
        stroke: PAL.border, sw: 0.6
      });
      P.text(cx + cw / 2, cy + rh / 2, lbl[String(v)], { size: 11.5, mono: true, align: 'center', base: 'middle', color: PAL.ink });
    });
  });
  note(30, 172, 'NULL AND FALSE is FALSE: a definite false wins.', { size: 11.5 });
  note(30, 190, 'NULL AND TRUE is NULL, and NOT NULL is NULL.', { size: 11.5 });
  note(30, 208, 'WHERE keeps only TRUE, so an UNKNOWN row is dropped.', { size: 11.5, color: PAL.warn });
  if (u > 8) {
    mono(30, 244, "x = 5", { size: 12 });
    mono(120, 244, "x <> 5", { size: 12 });
    mono(220, 244, 'rows', { size: 12, color: PAL.dim });
    note(30, 268, 'On x = {6, 5, NULL}: the first returns 1 row, the second returns 1 row, and the', { size: 11.5 });
    note(30, 286, 'NULL row is in neither. Only IS NULL reaches it. Two rows, not three.', { size: 11.5 });
    mono(30, 306, '2 \u2260 3', { size: 13, bold: true, color: PAL.invalid });
  }
  if (u > 16) {
    P.rect(520, 60, 350, 190, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 6 });
    mono(536, 82, 'S(x) = {1, 2, 3}   T(y) = {2, NULL}', { size: 11.5, bold: true });
    mono(536, 110, 'x NOT IN (SELECT y FROM T)', { size: 11.5 });
    P.text(536, 134, 'returns 0 rows', { size: 11.5, bold: true, color: PAL.invalid });
    mono(536, 164, 'NOT EXISTS (SELECT * FROM T', { size: 11.5 });
    mono(536, 182, '            WHERE T.y = S.x)', { size: 11.5 });
    P.text(536, 206, 'returns 2 rows: 1 and 3', { size: 11.5, bold: true, color: PAL.valid });
    note(536, 232, 'One NULL in the subquery turns every NOT IN into UNKNOWN.', { size: 11, color: PAL.warn });
  }
  if (u > 24) {
    mono(30, 330, 'COUNT(*) = 5     COUNT(sal) = 3', { size: 12.5, bold: true });
    mono(30, 352, 'SUM(sal) = 600   AVG(sal) = 200', { size: 12.5, bold: true });
    note(30, 374, 'AVG divides by 3, the non-NULL count, not by 5. COUNT(*) counts rows;', { size: 11.5 });
    note(30, 392, 'COUNT(col) counts values. DISTINCT keeps one NULL; COUNT(DISTINCT) ignores it.', { size: 11.5 });
    note(30, 416, 'All rows whose grouping key is NULL form one group, and HAVING filters groups,', { size: 11.5 });
    note(30, 434, 'never individual rows.', { size: 11.5 });
  }
};

/* ---------------- scene 10: ER to relations, and the procedure ---------------- */
SCENES.ermap = function (u) {
  heading(30, 26, 'From an ER diagram to relations, then the procedure');
  var ents = [['Employee', 40, 70], ['Department', 220, 70], ['Project', 400, 70]];
  ents.forEach(function (e, i) {
    var on = u > i * 3;
    P.rect(e[1], e[2], 140, 34, {
      fill: on ? PR.rgba(PAL.accentDim, 0.85) : PAL.surface2,
      stroke: on ? PAL.accent : PAL.border, sw: 1.4, radius: 4
    });
    P.text(e[1] + 70, e[2] + 17, e[0], { size: 12, bold: true, align: 'center', base: 'middle', color: PAL.ink });
  });
  if (u > 6) {
    note(40, 120, '1:N "works": the foreign key goes on the many side, so Employee gains did.', { size: 11.5 });
    note(40, 138, 'M:N "owns": neither side can hold it, so it becomes its own relation WorksOn.', { size: 11.5 });
    note(40, 156, 'Multivalued Phone and weak entity Dependent each need their own relation.', { size: 11.5 });
  }
  if (u > 12) {
    var map = MODEL.ER_MAP;
    P.rect(30, 176, 840, 118, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 6 });
    mono(44, 196, 'relation', { size: 11, bold: true, color: PAL.dim });
    mono(180, 196, 'where it comes from', { size: 11, bold: true, color: PAL.dim });
    mono(600, 196, 'key', { size: 11, bold: true, color: PAL.dim });
    map.forEach(function (r, i) {
      mono(44, 216 + i * 12, r.name, { size: 10.5, bold: true });
      note(180, 216 + i * 12, r.from, { size: 10, color: PAL.dim });
      mono(600, 216 + i * 12, r.key, { size: 10.5 });
    });
  }
  if (u > 21) {
    note(30, 314, 'Five steps for any question in this lesson:', { size: 12, bold: true, color: PAL.ink });
    var steps = [
      'Fix the schema of every operand, and check that set operators match.',
      'Write the result schema first: which attributes, and is any merged?',
      'Read "all" or "every" as division, or as a double difference.',
      'For a count, write the tuples out. Never estimate from the English.',
      'Check NULLs before counting: WHERE drops UNKNOWN, not just FALSE.'
    ];
    steps.forEach(function (s, i) {
      P.text(30, 336 + i * 22, (i + 1) + '.', { size: 11.5, bold: true, color: PAL.accent });
      note(50, 336 + i * 22, s, { size: 11.5 });
    });
    note(30, 452, 'Traps: pi vs SELECT, the join condition on the wrong attribute, division by an empty set, NOT IN with NULL.', { size: 11, color: PAL.warn });
  }
};

/* ======================================================================
   LAYER 4 - BOOT
   ====================================================================== */

function drawFrame(painter) {
  if (!painter) return;
  P = painter;
  var tl = window.LESSON_TIMELINE;
  var tt = K.state.elapsed;
  var idx = K.sceneAt(tt);
  var sc = tl.scenes[idx];
  painter.alpha(1);
  painter.clear();
  bg();
  if (sc && SCENES[sc.id]) {
    try {
      SCENES[sc.id](tt - sc.start);
    } catch (err) {
      console.error('scene draw failed', sc.id, err);
    }
  }
}

function fillChecks() {
  var el = document.getElementById('checks');
  if (!el) return;
  var pass = CHECKS.filter(function (c) { return c.pass; }).length;
  var bad = CHECKS.length - pass;
  el.innerHTML = '<span class="k">Model checks</span>' +
    '<p class="small" style="margin:6px 0 0">' + pass + ' of ' + CHECKS.length + ' passed' +
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

  K.init({
    timeline: window.LESSON_TIMELINE,
    draw: function () { if (P) drawFrame(P); }
  });

  K.onResize(function () { if (P) drawFrame(P); });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { if (P) drawFrame(P); });
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
