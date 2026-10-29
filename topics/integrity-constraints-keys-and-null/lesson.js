/* ==========================================================================
   integrity-constraints-keys-and-null — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The SQL semantics modelled here are the ones the sources on the Sources tab
   state: a CHECK is satisfied when its expression is TRUE or UNKNOWN; a UNIQUE
   constraint treats two nulls as distinct by default; a composite foreign key
   under MATCH SIMPLE passes when any of its columns is null. The cascade and
   referential-action engine below is a fixpoint over rows, and both previous
   year questions are answered by running it, not by asserting an answer.
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

/* ======================================================================
   LAYER 1 - THE MODEL
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}

/* SQL NULL is represented by the JavaScript value null. No other value is
   allowed to mean "missing", so a bug cannot hide behind undefined. */
function isNull(v) { return v === null; }

/* ---------- the relation the key ladder is read on ---------- */

var R_COLS = ['A', 'B', 'C'];
var R_ROWS = [
  { A: 1, B: 'x', C: 'p' },
  { A: 2, B: 'x', C: 'q' },
  { A: 3, B: 'y', C: 'p' }
];

function subsets(arr) {
  var out = [];
  var n = arr.length;
  for (var mask = 1; mask < (1 << n); mask++) {
    var s = [];
    for (var i = 0; i < n; i++) if (mask & (1 << i)) s.push(arr[i]);
    out.push(s);
  }
  return out;
}

function projection(rows, cols) {
  return rows.map(function (r) {
    return cols.map(function (c) { return r[c]; }).join('\u0001');
  });
}

function isSuperkey(rows, cols) {
  var p = projection(rows, cols);
  var seen = {};
  for (var i = 0; i < p.length; i++) {
    if (seen[p[i]]) return false;
    seen[p[i]] = true;
  }
  return true;
}

var ALL_SUBSETS = subsets(R_COLS);
var SUPERKEYS = ALL_SUBSETS.filter(function (s) { return isSuperkey(R_ROWS, s); });
var CANDIDATE_KEYS = SUPERKEYS.filter(function (s) {
  /* minimal: no proper subset is a superkey */
  return !subsets(s).some(function (sub) { return sub.length < s.length && isSuperkey(R_ROWS, sub); });
});
var NON_SUPERKEYS = ALL_SUBSETS.filter(function (s) { return !isSuperkey(R_ROWS, s); });

/* ---------- single-column constraint semantics ---------- */

var EXISTING = [1, null];          /* the rows already in the table */
var DOMAIN = [null, 1, 2];         /* the candidate values a write may carry */

function acceptNotNull(v) { return !isNull(v); }

/* UNIQUE, default null treatment: two nulls are not equal, so a null never
   collides with anything. */
function acceptUniqueDistinct(v) {
  return !EXISTING.some(function (e) { return !isNull(e) && !isNull(v) && e === v; });
}

/* UNIQUE NULLS NOT DISTINCT: nulls do collide. */
function acceptUniqueNotDistinct(v) {
  return !EXISTING.some(function (e) { return e === v; });
}

/* PRIMARY KEY = UNIQUE (nulls not distinct) AND NOT NULL */
function acceptPrimaryKey(v) { return acceptNotNull(v) && acceptUniqueNotDistinct(v); }

/* three-valued evaluation of a > k, as text so the drawing can print it */
function evalGt(v, k) {
  if (isNull(v)) return 'UNKNOWN';
  return v > k ? 'TRUE' : 'FALSE';
}

/* a CHECK accepts anything that is not FALSE */
function acceptCheck(v, k) { return evalGt(v, k) !== 'FALSE'; }

function countAccepted(fn) {
  return DOMAIN.filter(fn).length;
}

var ACC = {
  notNull: countAccepted(acceptNotNull),
  unique: countAccepted(acceptUniqueDistinct),
  uniqueNotDistinct: countAccepted(acceptUniqueNotDistinct),
  primaryKey: countAccepted(acceptPrimaryKey),
  checkGt5: countAccepted(function (v) { return acceptCheck(v, 5); }),
  checkNotGt5: countAccepted(function (v) { return acceptCheck(v, 5) === false ? false : evalGt(v, 5) !== 'TRUE'; })
};
/* checkNotGt5 above is the accept-count of CHECK (NOT (a > 5)); written out
   explicitly so the three-valued negation is visible. */
ACC.checkNotGt5 = DOMAIN.filter(function (v) {
  var t = evalGt(v, 5);
  var negated = t === 'UNKNOWN' ? 'UNKNOWN' : (t === 'TRUE' ? 'FALSE' : 'TRUE');
  return negated !== 'FALSE';
}).length;

var CHECK_ROWS = DOMAIN.map(function (v) {
  return { v: v, gt: evalGt(v, 5), gtVerdict: acceptCheck(v, 5) ? 'accept' : 'reject',
           notGt: evalGt(v, 5) === 'UNKNOWN' ? 'UNKNOWN' : (evalGt(v, 5) === 'TRUE' ? 'FALSE' : 'TRUE'),
           notGtVerdict: (evalGt(v, 5) === 'TRUE' ? false : true) ? 'accept' : 'reject' };
});

/* both checks together: the rows that survive both */
var BOTH_CHECKS = DOMAIN.filter(function (v) {
  return acceptCheck(v, 5) && (function () {
    var t = evalGt(v, 5);
    var neg = t === 'UNKNOWN' ? 'UNKNOWN' : (t === 'TRUE' ? 'FALSE' : 'TRUE');
    return neg !== 'FALSE';
  })();
});

/* ---------- foreign keys and the three match types ---------- */

var PARENT_COLS = ['x', 'y'];
var PARENT_ROWS = [[1, 1]];

function pairKey(p) { return p[0] + '\u0001' + p[1]; }
var PARENT_KEYS = {};
PARENT_ROWS.forEach(function (p) { PARENT_KEYS[pairKey(p)] = true; });

function matchSimple(c) {
  if (isNull(c[0]) || isNull(c[1])) return true;
  return !!PARENT_KEYS[pairKey(c)];
}
function matchFull(c) {
  if (isNull(c[0]) && isNull(c[1])) return true;
  if (isNull(c[0]) || isNull(c[1])) return false;
  return !!PARENT_KEYS[pairKey(c)];
}
/* MATCH PARTIAL, as the SQL standard defines it: all null passes; otherwise a
   row of the referenced table must match every non-null referencing column. */
function matchPartial(c) {
  if (isNull(c[0]) && isNull(c[1])) return true;
  return PARENT_ROWS.some(function (p) {
    for (var i = 0; i < 2; i++) {
      if (!isNull(c[i]) && c[i] !== p[i]) return false;
    }
    return true;
  });
}

var FK_CANDIDATES = [];
DOMAIN.forEach(function (a) {
  DOMAIN.forEach(function (b) { FK_CANDIDATES.push([a, b]); });
});

function countMatch(fn) { return FK_CANDIDATES.filter(fn).length; }

var FK_COUNTS = {
  simple: countMatch(matchSimple),
  full: countMatch(matchFull),
  partial: countMatch(matchPartial),
  total: FK_CANDIDATES.length
};

var FK_TABLE = FK_CANDIDATES.map(function (c) {
  return { c: c, simple: matchSimple(c), full: matchFull(c), partial: matchPartial(c) };
});

/* single-column foreign key, for the "can this write orphan a row" grid */
function fkHoldsSingle(parentVals, childVals) {
  return childVals.every(function (v) {
    if (isNull(v)) return true;
    return parentVals.indexOf(v) !== -1;
  });
}

/* ---------- a referential-action engine ----------
   tables: { name: { cols, rows:[{id, vals}], pk:[...], fks:[{cols, ref, refCols, onDelete}] } }
   Returns every deletion and update performed, grouped into rounds, so the
   animation can show one round at a time. */

function cloneTables(spec) {
  var t = {};
  Object.keys(spec).forEach(function (name) {
    var s = spec[name];
    t[name] = {
      name: name, cols: s.cols, pk: s.pk, fks: s.fks || [],
      rows: s.rows.map(function (r, i) {
        var vals = {};
        s.cols.forEach(function (c, j) { vals[c] = r[j]; });
        return { id: name + '#' + i, vals: vals, alive: true };
      })
    };
  });
  return t;
}

function keyOf(row, cols) { return cols.map(function (c) { return String(row.vals[c]); }).join('\u0001'); }

function rowMatches(row, cols, tuple) {
  for (var i = 0; i < cols.length; i++) {
    var v = row.vals[cols[i]];
    if (isNull(v)) return false;                 /* a null never matches a key */
    if (String(v) !== String(tuple[i])) return false;
  }
  return true;
}

function runDelete(spec, tableName, keyTuple) {
  var T = cloneTables(spec);
  var rounds = [];
  var deleted = [];
  var updated = [];
  var violations = [];

  /* the first deletion is the statement itself */
  var target = T[tableName].rows.filter(function (r) {
    return r.alive && rowMatches(r, T[tableName].pk, keyTuple);
  })[0];
  if (!target) return { tables: T, rounds: rounds, deleted: deleted, updated: updated, violations: ['no such row'] };

  var pending = [{ table: tableName, tuple: keyTuple, row: target }];

  while (pending.length) {
    var round = { n: rounds.length + 1, deleted: [], updated: [], fired: [] };
    var next = [];
    pending.forEach(function (ev) {
      var child = ev.row;
      if (child.alive) {
        child.alive = false;
        var d = { table: ev.table, vals: ev.row.vals, tuple: ev.tuple };
        round.deleted.push(d);
        deleted.push(d);
      }
      /* every foreign key that points at this table */
      Object.keys(T).forEach(function (name) {
        T[name].fks.forEach(function (fk) {
          if (fk.ref !== ev.table) return;
          T[name].rows.forEach(function (r) {
            if (!r.alive) return;
            if (!rowMatches(r, fk.cols, ev.tuple)) return;
            if (fk.onDelete === 'cascade') {
              if (r.alive) {
                var kt = fk.refCols.map(function (c) { return r.vals[c]; });
                next.push({ table: name, tuple: kt, row: r });
                round.fired.push({ fk: fk, table: name, action: 'cascade', vals: r.vals });
              }
            } else if (fk.onDelete === 'set null') {
              var before = fk.cols.map(function (c) { return r.vals[c]; });
              fk.cols.forEach(function (c) { r.vals[c] = null; });
              round.updated.push({ table: name, vals: r.vals, before: before, after: fk.cols.map(function (c) { return r.vals[c]; }) });
              updated.push(round.updated[round.updated.length - 1]);
              round.fired.push({ fk: fk, table: name, action: 'set null', vals: r.vals });
            } else if (fk.onDelete === 'set default') {
              fk.cols.forEach(function (c) { r.vals[c] = fk.defaults ? fk.defaults[c] : null; });
              round.updated.push({ table: name, vals: r.vals, before: [], after: fk.cols.map(function (c) { return r.vals[c]; }) });
              round.fired.push({ fk: fk, table: name, action: 'set default', vals: r.vals });
            } else {
              violations.push({ fk: fk, table: name, vals: r.vals });
              round.fired.push({ fk: fk, table: name, action: fk.onDelete || 'no action', vals: r.vals });
            }
          });
        });
      });
    });
    if (round.deleted.length || round.updated.length || round.fired.length) rounds.push(round);
    pending = next;
    if (rounds.length > 50) break;                 /* a cycle guard, never reached here */
  }

  return { tables: T, rounds: rounds, deleted: deleted, updated: updated, violations: violations };
}

/* GATE CSE 2005, Q76 in the catalogue used: one table, A key, C a foreign key
   to A with ON DELETE CASCADE. */
var SPEC_2005 = {
  T: {
    cols: ['A', 'C'],
    pk: ['A'],
    rows: [[2, 4], [3, 4], [4, 3], [5, 2], [7, 2], [9, 5], [6, 4]],
    fks: [{ cols: ['C'], ref: 'T', refCols: ['A'], onDelete: 'cascade' }]
  }
};
var RUN_2005 = runDelete(SPEC_2005, 'T', [2, 4]);
var DEL_2005 = RUN_2005.deleted.filter(function (d) { return !(d.vals.A === 2 && d.vals.C === 4); });
var DEL_2005_SET = DEL_2005.map(function (d) { return '(' + d.vals.A + ',' + d.vals.C + ')'; });

/* GATE CSE 2017 Set 2 Q19: T1.P key, T1.Q -> T2.R cascade;
   T2.R key, T2.S -> T1.P on delete set null. */
var SPEC_2017 = {
  T1: {
    cols: ['P', 'Q'],
    pk: ['P'],
    rows: [[2, 2], [3, 8], [7, 3], [5, 8], [6, 9], [8, 5], [9, 8]],
    fks: [{ cols: ['Q'], ref: 'T2', refCols: ['R'], onDelete: 'cascade' }]
  },
  T2: {
    cols: ['R', 'S'],
    pk: ['R'],
    rows: [[2, 2], [8, 3], [3, 2], [9, 7], [5, 7], [7, 2]],
    fks: [{ cols: ['S'], ref: 'T1', refCols: ['P'], onDelete: 'set null' }]
  }
};
var RUN_2017 = runDelete(SPEC_2017, 'T1', [3, 8]);
var DEL_2017_T1 = RUN_2017.deleted.filter(function (d) {
  return d.table === 'T1' && !(d.vals.P === 3 && d.vals.Q === 8);
});

/* the instance left after the 2017 delete, for the "is it still valid" check */
function fkSatisfied(T) {
  var bad = [];
  Object.keys(T).forEach(function (name) {
    var t = T[name];
    t.fks.forEach(function (fk) {
      var parent = T[fk.ref];
      var keys = {};
      parent.rows.filter(function (r) { return r.alive; }).forEach(function (r) {
        keys[keyOf(r, fk.refCols)] = true;
      });
      t.rows.filter(function (r) { return r.alive; }).forEach(function (r) {
        var vals = fk.cols.map(function (c) { return r.vals[c]; });
        if (vals.some(isNull)) return;              /* MATCH SIMPLE */
        if (!keys[vals.map(String).join('\u0001')]) bad.push({ table: name, vals: r.vals });
      });
    });
  });
  return bad;
}

/* ---------- which writes can orphan a row, by enumeration ---------- */

var OP_STATES = (function () {
  var parentSubsets = [[], [1], [2], [1, 2]];
  var childSubsets = [[]];
  [[null], [1], [2]].forEach(function (a) { childSubsets.push(a); });
  [[null, 1], [null, 2], [1, 2]].forEach(function (a) { childSubsets.push(a); });
  var states = [];
  parentSubsets.forEach(function (p) {
    childSubsets.forEach(function (c) { states.push({ parent: p.slice(), child: c.slice() }); });
  });
  return states;
})();

var OP_COUNTS = { insertParent: 0, insertChild: 0, deleteParent: 0, deleteChild: 0 };
var OP_VALID_STATES = 0;
var OP_EXAMINED = 0;

OP_STATES.forEach(function (st) {
  if (!fkHoldsSingle(st.parent, st.child)) return;   /* start from a legal instance */
  OP_VALID_STATES++;
  [1, 2].forEach(function (v) {
    OP_EXAMINED++;
    if (!fkHoldsSingle(st.parent.concat([v]), st.child)) OP_COUNTS.insertParent++;
  });
  [null, 1, 2].forEach(function (v) {
    OP_EXAMINED++;
    if (!fkHoldsSingle(st.parent, st.child.concat([v]))) OP_COUNTS.insertChild++;
  });
  st.parent.forEach(function (v) {
    OP_EXAMINED++;
    var rest = st.parent.filter(function (w) { return w !== v; });
    if (!fkHoldsSingle(rest, st.child)) OP_COUNTS.deleteParent++;
  });
  st.child.forEach(function (v) {
    OP_EXAMINED++;
    var rest = st.child.filter(function (w, i) { return st.child.indexOf(v) !== i; });
    if (!fkHoldsSingle(st.parent, rest)) OP_COUNTS.deleteChild++;
  });
});

/* ---------- collected for the drawing layer ---------- */

var V = {
  rCols: R_COLS, rRows: R_ROWS,
  superkeys: SUPERKEYS, candidateKeys: CANDIDATE_KEYS, nonSuperkeys: NON_SUPERKEYS,
  existing: EXISTING, domain: DOMAIN, acc: ACC,
  checkRows: CHECK_ROWS, bothChecks: BOTH_CHECKS,
  fkCounts: FK_COUNTS, fkTable: FK_TABLE, parentRows: PARENT_ROWS,
  run2005: RUN_2005, del2005: DEL_2005, del2005Set: DEL_2005_SET,
  run2017: RUN_2017, del2017T1: DEL_2017_T1,
  opCounts: OP_COUNTS, opValidStates: OP_VALID_STATES, opExamined: OP_EXAMINED
};

/* ======================================================================
   LAYER 2 - THE CHECKS
   ====================================================================== */

/* 1. every superkey really is unique, and every non-superkey really is not */
(function () {
  var bad = [];
  SUPERKEYS.forEach(function (s) { if (!isSuperkey(R_ROWS, s)) bad.push(s.join('')); });
  NON_SUPERKEYS.forEach(function (s) { if (isSuperkey(R_ROWS, s)) bad.push('!' + s.join('')); });
  chk('superkeys: ' + SUPERKEYS.length + ' unique sets, ' + NON_SUPERKEYS.length + ' not', bad.length === 0, bad.join(','));
})();

/* 2. candidate keys are superkeys and minimal */
(function () {
  var bad = [];
  CANDIDATE_KEYS.forEach(function (k) {
    if (!isSuperkey(R_ROWS, k)) bad.push('not unique: ' + k.join(''));
    subsets(k).forEach(function (sub) {
      if (sub.length < k.length && isSuperkey(R_ROWS, sub)) bad.push('not minimal: ' + k.join(''));
    });
  });
  chk('candidate keys: ' + CANDIDATE_KEYS.length + ' minimal superkeys', bad.length === 0, bad.join(','));
})();

/* 3. every superkey contains at least one candidate key */
(function () {
  var bad = SUPERKEYS.filter(function (s) {
    return !CANDIDATE_KEYS.some(function (k) { return k.every(function (c) { return s.indexOf(c) !== -1; }); });
  });
  chk('every superkey contains a candidate key', bad.length === 0, bad.map(function (s) { return s.join(''); }).join(','));
})();

/* 4. PRIMARY KEY never accepts more than UNIQUE, and never more than NOT NULL */
chk('PRIMARY KEY (' + ACC.primaryKey + ') <= UNIQUE (' + ACC.unique + ')',
    ACC.primaryKey <= ACC.unique, ACC.primaryKey + ' vs ' + ACC.unique);
chk('PRIMARY KEY (' + ACC.primaryKey + ') <= NOT NULL (' + ACC.notNull + ')',
    ACC.primaryKey <= ACC.notNull, ACC.primaryKey + ' vs ' + ACC.notNull);

/* 5. UNIQUE accepts a null that a NOT NULL would refuse: the two differ */
chk('UNIQUE accepts the NULL that NOT NULL refuses', acceptUniqueDistinct(null) && !acceptNotNull(null), 'null candidate');
chk('UNIQUE accepts a second NULL over an existing NULL',
    (function () {
      /* the collision test a UNIQUE constraint runs: equality, not "is missing" */
      function collides(a, b) { return !isNull(a) && !isNull(b) && a === b; }
      return !collides(null, null) && collides(1, 1);
    })(), 'null vs null does not collide, 1 vs 1 does');
chk('UNIQUE NULLS NOT DISTINCT would refuse it', !acceptUniqueNotDistinct(null), 'null collides');

/* 6. the three-valued table: each CHECK accepts exactly the non-FALSE rows */
(function () {
  var bad = CHECK_ROWS.filter(function (r) {
    var shouldAccept = r.gt !== 'FALSE';
    return (r.gtVerdict === 'accept') !== shouldAccept;
  });
  chk('CHECK accepts TRUE and UNKNOWN, refuses FALSE', bad.length === 0, bad.length + ' mismatches');
})();

/* 7. the opposite CHECK also accepts the NULL row, so the pair does not exclude it */
chk('CHECK (a>5) and CHECK (NOT (a>5)) both accept NULL',
    BOTH_CHECKS.length === 1 && isNull(BOTH_CHECKS[0]), 'survivors: ' + BOTH_CHECKS.length);

/* 8. the match types nest: FULL is the strictest, SIMPLE the loosest */
(function () {
  var bad = FK_CANDIDATES.filter(function (c) {
    if (matchFull(c) && !matchSimple(c)) return true;      /* full implies simple */
    if (matchPartial(c) && !matchSimple(c)) return true;   /* partial implies simple */
    return false;
  });
  chk('MATCH FULL and MATCH PARTIAL are both subsets of MATCH SIMPLE', bad.length === 0, bad.length + ' counterexamples');
})();

/* 9. each count is reproduced by direct enumeration, not by formula */
chk('MATCH counts on ' + FK_COUNTS.total + ' candidates: simple ' + FK_COUNTS.simple +
    ', full ' + FK_COUNTS.full + ', partial ' + FK_COUNTS.partial,
    FK_COUNTS.simple === 6 && FK_COUNTS.full === 2 && FK_COUNTS.partial === 4,
    [FK_COUNTS.simple, FK_COUNTS.full, FK_COUNTS.partial].join(','));

/* 10. the 2005 closure is exactly three tuples, and each was reached by a key */
chk('GATE CSE 2005: additional deletions = ' + DEL_2005.length + ' ' + DEL_2005_SET.join(' '),
    DEL_2005.length === 3, DEL_2005_SET.join(' '));

/* 11. the instance left by the 2005 delete still satisfies the foreign key */
(function () {
  var bad = fkSatisfied(RUN_2005.tables);
  chk('2005: the surviving instance satisfies C -> A', bad.length === 0, bad.length + ' orphans');
})();

/* 12. no row deleted in the 2005 run was reached twice */
(function () {
  var ids = RUN_2005.deleted.map(function (d) { return d.vals.A; });
  var uniq = ids.filter(function (v, i) { return ids.indexOf(v) === i; });
  chk('2005: every deleted row appears once (' + ids.length + ' deletions)', ids.length === uniq.length, ids.join(','));
})();

/* 13. the 2005 closure needs three rounds: nothing more is reachable */
chk('2005: closure took ' + RUN_2005.rounds.length + ' rounds', RUN_2005.rounds.length === 3,
    RUN_2005.rounds.map(function (r) { return r.deleted.length + 'd/' + r.updated.length + 'u'; }).join(' '));

/* 14. the 2017 delete deletes no further T1 row */
chk('GATE CSE 2017 Set 2: additional T1 deletions = ' + DEL_2017_T1.length, DEL_2017_T1.length === 0,
    DEL_2017_T1.length + ' rows');

/* 15. the 2017 delete updates exactly one T2 row, to a null */
(function () {
  var ups = RUN_2017.updated;
  var ok = ups.length === 1 && isNull(ups[0].after[0]) && ups[0].vals.R === 8;
  chk('2017: one T2 row is set to NULL, (8,3) -> (8,NULL)', ok, ups.length + ' update(s)');
})();

/* 16. the instance left by the 2017 delete still satisfies both foreign keys */
(function () {
  var bad = fkSatisfied(RUN_2017.tables);
  chk('2017: the surviving instance satisfies both foreign keys', bad.length === 0, bad.length + ' orphans');
})();

/* 17. the delete that started the 2017 run is the only T1 deletion */
chk('2017: exactly one T1 row is deleted, the one named',
    RUN_2017.deleted.filter(function (d) { return d.table === 'T1'; }).length === 1, '');

/* 18. the operation grid, by enumeration over ' + OP_VALID_STATES + ' legal instances */
chk('insert into parent never orphans (' + OP_COUNTS.insertParent + ' of ' + OP_EXAMINED + ')',
    OP_COUNTS.insertParent === 0, OP_COUNTS.insertParent + '');
chk('delete from child never orphans (' + OP_COUNTS.deleteChild + ')', OP_COUNTS.deleteChild === 0,
    OP_COUNTS.deleteChild + '');
chk('insert into child can orphan (' + OP_COUNTS.insertChild + ')', OP_COUNTS.insertChild > 0,
    OP_COUNTS.insertChild + '');
chk('delete from parent can orphan (' + OP_COUNTS.deleteParent + ')', OP_COUNTS.deleteParent > 0,
    OP_COUNTS.deleteParent + '');

/* 19. the safe operations are safe for a reason: they never remove a parent key
   and never add a child value. Checked structurally on one witness each. */
chk('a parent insert cannot orphan: it adds a key only',
    fkHoldsSingle([1, 2], [1]) && fkHoldsSingle([1, 2, 2], [1]), 'witness');
chk('a child delete cannot orphan: it removes a reference only',
    fkHoldsSingle([1], [1]) && fkHoldsSingle([1], []), 'witness');

/* 20. the 2004 algebra identity, on the 2005 instance before any delete */
(function () {
  var parentKeys = SPEC_2005.T.rows.map(function (r) { return r[0]; });
  var childKeys = SPEC_2005.T.rows.map(function (r) { return r[1]; });
  var diff = childKeys.filter(function (v) { return parentKeys.indexOf(v) === -1; });
  chk('referential integrity <=> child keys minus parent keys is empty (' + diff.length + ' left)',
      diff.length === 0, diff.join(','));
})();

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

var COL = {
  ok: { fill: PAL.accentDim, stroke: PAL.accent },
  bad: { fill: PAL.invalidDim, stroke: PAL.invalid },
  warn: { fill: PAL.warnDim, stroke: PAL.warn },
  flat: { fill: PAL.surface2, stroke: PAL.border },
  info: { fill: '#e7eef7', stroke: PAL.info }
};

function head(n, title) {
  P.text(34, 16, n + '  ' + title, { size: 12, mono: true, color: PAL.dim });
  P.line(34, 36, W - 34, 36, { stroke: PAL.border, sw: 1 });
}

function note(x, y, lines, opts) {
  opts = opts || {};
  lines.forEach(function (s, i) {
    P.text(x, y + i * (opts.lh || 18), s, {
      size: opts.size || 12, color: opts.color || PAL.dim, mono: !!opts.mono
    });
  });
}

function label(x, y, s, opts) {
  opts = opts || {};
  P.text(x, y, s, { size: opts.size || 10, mono: true, color: opts.color || PAL.faint });
}

function cellText(x, y, w, h, s, opts) {
  opts = opts || {};
  P.text(x + w / 2, y + h / 2, s, {
    size: opts.size || 12, mono: opts.mono !== false, align: 'center', base: 'middle',
    color: opts.color || PAL.ink
  });
}

/* a table: cols = [{k, w, label}], rows = array of arrays of {s, ok?} */
function drawTable(x, y, cols, rows, opts) {
  opts = opts || {};
  var rowH = opts.rowH || 26, headH = opts.headH || 24;
  var total = cols.reduce(function (a, c) { return a + c.w; }, 0);
  P.rect(x, y, total, headH, { fill: PAL.surface2, stroke: PAL.border, sw: 1.2 });
  var cx = x;
  cols.forEach(function (c) {
    cellText(cx, y, c.w, headH, c.label, { size: 10, color: PAL.dim });
    cx += c.w;
  });
  rows.forEach(function (r, i) {
    var ry = y + headH + i * rowH;
    P.rect(x, ry, total, rowH, { fill: opts.rowFill && opts.rowFill(i, r) ? PAL.invalidDim : PAL.surface,
                                 stroke: PAL.border, sw: 1 });
    var cxx = x;
    r.forEach(function (c, j) {
      var w = cols[j].w;
      if (c && c.mark) {
        P.rect(cxx + 6, ry + 5, w - 12, rowH - 10, { fill: c.mark === 'ok' ? COL.ok.fill : COL.bad.fill,
                                                      stroke: c.mark === 'ok' ? COL.ok.stroke : COL.bad.stroke, sw: 1.2, radius: 3 });
        cellText(cxx, ry, w, rowH, c.s, { size: 11, color: c.mark === 'ok' ? PAL.valid : PAL.invalid });
      } else {
        cellText(cxx, ry, w, rowH, c && c.s !== undefined ? c.s : String(c), { size: 11, color: (c && c.color) || PAL.ink });
      }
      cxx += w;
    });
  });
  /* column rules */
  var px = x;
  cols.forEach(function (c) { px += c.w; P.line(px, y, px, y + headH + rows.length * rowH, { stroke: PAL.border, sw: 1 }); });
  P.rect(x, y, total, headH + rows.length * rowH, { stroke: PAL.border, sw: 1.2 });
  return y + headH + rows.length * rowH;
}

function verdict(v) { return v ? { s: 'accept', mark: 'ok' } : { s: 'reject', mark: 'bad' }; }

function on(p, frac) { return p >= frac - 1e-9; }

function nullText(v) { return isNull(v) ? 'NULL' : String(v); }

/* ---------- the ten scenes ---------- */

var SCENE_DRAW = {

  what: function (t, sc) {
    var p = (t - sc.start) / (sc.end - sc.start);
    head(1, 'a constraint is a predicate the engine re-checks');

    note(40, 52, [
      'CREATE TABLE enrol (',
      '  sid  int PRIMARY KEY,',
      '  cid  int REFERENCES course,',
      '  mark int CHECK (mark > 0) );'
    ], { mono: true, size: 12, lh: 17 });

    /* the write, the gate, the two outcomes */
    P.rect(40, 150, 150, 44, { fill: COL.flat.fill, stroke: COL.flat.stroke, sw: 1.2, radius: 3 });
    cellText(40, 150, 150, 44, 'INSERT / UPDATE / DELETE', { size: 10, color: PAL.dim });

    P.arrow(195, 172, 250, 172, { stroke: PAL.dim, sw: 1.4, head: 9 });

    P.rect(255, 138, 215, 68, { fill: COL.info.fill, stroke: COL.info.stroke, sw: 1.4, radius: 3 });
    cellText(255, 146, 215, 22, 'every declared constraint', { size: 11, color: PAL.ink });
    cellText(255, 170, 215, 22, 'is not FALSE', { size: 11, color: PAL.ink });

    P.arrow(475, 158, 530, 130, { stroke: PAL.valid, sw: 1.4, head: 9 });
    P.arrow(475, 188, 530, 214, { stroke: PAL.invalid, sw: 1.4, head: 9 });

    P.rect(535, 112, 130, 36, { fill: COL.ok.fill, stroke: COL.ok.stroke, sw: 1.2, radius: 3 });
    cellText(535, 112, 130, 36, 'statement applied', { size: 11, color: PAL.valid });
    P.rect(535, 196, 130, 36, { fill: COL.bad.fill, stroke: COL.bad.stroke, sw: 1.2, radius: 3 });
    cellText(535, 196, 130, 36, 'statement refused', { size: 11, color: PAL.invalid });

    if (on(p, 0.3)) {
      note(690, 112, ['nothing is', 'half-applied', 'a refused', 'statement', 'changes no row'], { size: 11, lh: 15, color: PAL.dim });
    }

    if (on(p, 0.55)) {
      var fam = [
        ['keys', 'PRIMARY KEY, UNIQUE'],
        ['references', 'FOREIGN KEY'],
        ['one row', 'NOT NULL, CHECK'],
        ['general', 'assertion, trigger']
      ];
      fam.forEach(function (f, i) {
        var x = 40 + i * 210;
        P.rect(x, 250, 190, 54, { fill: PAL.surface, stroke: PAL.border, sw: 1.2, radius: 3 });
        cellText(x, 258, 190, 20, f[0], { size: 11, color: PAL.ink });
        cellText(x, 280, 190, 18, f[1], { size: 10, color: PAL.dim });
      });
    }

    if (on(p, 0.8)) {
      note(40, 330, [
        'DEFAULT is not a constraint: it supplies a value and forbids nothing.',
        'The paper asks which write is refused, and which rows disappear as a result.'
      ], { size: 12, lh: 20 });
    }

    legendRow([
      ['ok', 'satisfied'],
      ['bad', 'violated'],
      ['info', 'the check'],
      ['flat', 'the write']
    ], 428);
  },

  keys: function (t, sc) {
    var p = (t - sc.start) / (sc.end - sc.start);
    head(2, 'superkey, candidate key, primary key');

    var rows = R_ROWS.map(function (r) { return [r.A, r.B, r.C]; });
    drawTable(50, 60, [{ w: 70, label: 'A' }, { w: 80, label: 'B' }, { w: 80, label: 'C' }], rows, { rowH: 28 });
    label(50, 178, 'three rows, three columns', { color: PAL.faint });

    note(50, 208, [
      'B alone: x, x, y  — repeats',
      'C alone: p, q, p  — repeats'
    ], { size: 11, lh: 18, color: PAL.dim });

    if (on(p, 0.25)) {
      P.rect(330, 60, 500, 62, { fill: COL.info.fill, stroke: COL.info.stroke, sw: 1.2, radius: 3 });
      cellText(330, 64, 500, 20, 'superkey — a set that never repeats (' + SUPERKEYS.length + ' of ' + ALL_SUBSETS.length + ' non-empty sets)',
               { size: 11, color: PAL.ink });
      cellText(330, 88, 500, 24, SUPERKEYS.map(function (s) { return '{' + s.join(',') + '}'; }).join('  '),
               { size: 10, color: PAL.dim });
    }

    if (on(p, 0.45)) {
      P.rect(330, 138, 500, 62, { fill: COL.ok.fill, stroke: COL.ok.stroke, sw: 1.2, radius: 3 });
      cellText(330, 142, 500, 20, 'candidate key — minimal (' + CANDIDATE_KEYS.length + ': {A} and {B,C})',
               { size: 11, color: PAL.valid });
      cellText(330, 166, 500, 24, 'drop one column from either and uniqueness is lost',
               { size: 10, color: PAL.dim });
    }

    if (on(p, 0.65)) {
      P.rect(330, 216, 500, 62, { fill: PAL.warnDim, stroke: PAL.warn, sw: 1.2, radius: 3 });
      cellText(330, 220, 500, 20, 'primary key — the one the schema declares (A)',
               { size: 11, color: PAL.warn });
      cellText(330, 244, 500, 24, 'the rest are alternate keys, held by UNIQUE (B, C)',
               { size: 10, color: PAL.dim });
    }

    if (on(p, 0.85)) {
      P.text(50, 300, 'PRIMARY KEY  =  UNIQUE  +  NOT NULL', { size: 16, mono: true, color: PAL.ink });
      note(50, 336, [
        'UNIQUE alone permits NULL, so it does not identify rows.',
        'One primary key per table, however many columns it spans.'
      ], { size: 12, lh: 20 });
    }

    legendRow([['info', 'superkey'], ['ok', 'candidate'], ['warn', 'primary']], 428);
  },

  nulls: function (t, sc) {
    var p = (t - sc.start) / (sc.end - sc.start);
    head(3, 'three constraints, one NULL, three verdicts');

    label(50, 48, 'existing rows: a = 1, a = NULL      candidates: NULL, 1, 2', { size: 11, color: PAL.dim });

    var rows = [
      [{ s: 'NOT NULL' }, verdict(acceptNotNull(null)), verdict(acceptNotNull(1)), verdict(acceptNotNull(2))],
      [{ s: 'UNIQUE' }, verdict(acceptUniqueDistinct(null)), verdict(acceptUniqueDistinct(1)), verdict(acceptUniqueDistinct(2))],
      [{ s: 'PRIMARY KEY' }, verdict(acceptPrimaryKey(null)), verdict(acceptPrimaryKey(1)), verdict(acceptPrimaryKey(2))]
    ];
    drawTable(50, 70, [
      { w: 190, label: 'constraint' }, { w: 150, label: 'NULL' },
      { w: 150, label: '1' }, { w: 150, label: '2' }
    ], rows, { rowH: 34, headH: 26 });

    if (on(p, 0.35)) {
      note(50, 220, [
        'accepted of 3:   NOT NULL ' + ACC.notNull + '   UNIQUE ' + ACC.unique + '   PRIMARY KEY ' + ACC.primaryKey,
        'UNIQUE takes the second NULL because two nulls are not equal.',
        'PRIMARY KEY refuses it because it carries NOT NULL as well as UNIQUE.'
      ], { size: 12, lh: 22 });
    }

    if (on(p, 0.6)) {
      P.rect(712, 70, 178, 96, { fill: COL.warn.fill, stroke: PAL.warn, sw: 1.2, radius: 3 });
      cellText(712, 78, 178, 20, 'NULL = NULL', { size: 12, color: PAL.warn });
      cellText(712, 100, 178, 20, 'is UNKNOWN,', { size: 11, color: PAL.ink });
      cellText(712, 122, 178, 20, 'not TRUE, so', { size: 10, color: PAL.dim });
      cellText(712, 142, 178, 20, 'nothing equals a null', { size: 10, color: PAL.dim });
    }

    if (on(p, 0.8)) {
      note(50, 316, [
        'Default: NULLS DISTINCT.  PostgreSQL 15 added UNIQUE NULLS NOT DISTINCT.',
        'The SQL standard leaves the choice to the implementation, so engines differ.',
        'With nulls not distinct, UNIQUE would accept ' + ACC.uniqueNotDistinct + ' of 3 here, not ' + ACC.unique + '.'
      ], { size: 11, lh: 20, color: PAL.dim });
    }

    legendRow([['ok', 'accepted'], ['bad', 'refused'], ['warn', 'the reason']], 428);
  },

  check: function (t, sc) {
    var p = (t - sc.start) / (sc.end - sc.start);
    head(4, 'CHECK passes on UNKNOWN');

    var rows = CHECK_ROWS.map(function (r) {
      return [
        { s: nullText(r.v) },
        { s: r.gt },
        { s: r.gtVerdict, mark: r.gtVerdict === 'accept' ? 'ok' : 'bad' }
      ];
    });
    drawTable(50, 60, [
      { w: 130, label: 'a' }, { w: 200, label: 'a > 5' }, { w: 150, label: 'CHECK (a > 5)' }
    ], rows, { rowH: 34 });

    if (on(p, 0.3)) {
      note(580, 60, [
        'a CHECK is satisfied',
        'when the expression',
        'is TRUE or UNKNOWN.',
        'Only FALSE refuses.'
      ], { size: 11, lh: 18, color: PAL.dim });
    }

    if (on(p, 0.5)) {
      note(50, 220, [
        'So CHECK (price > 0) accepts a NULL price: the comparison is UNKNOWN.',
        'NOT NULL is the constraint that forbids a missing value.'
      ], { size: 12, lh: 22 });
    }

    if (on(p, 0.7)) {
      var rows2 = CHECK_ROWS.map(function (r) {
        return [
          { s: nullText(r.v) },
          { s: r.notGt },
          { s: r.notGtVerdict, mark: r.notGtVerdict === 'accept' ? 'ok' : 'bad' }
        ];
      });
      drawTable(50, 290, [
        { w: 130, label: 'a' }, { w: 200, label: 'NOT (a > 5)' }, { w: 150, label: 'CHECK (NOT (a > 5))' }
      ], rows2, { rowH: 30 });
    }

    if (on(p, 0.88)) {
      note(580, 290, [
        'Both checks accept the',
        'NULL row: ' + BOTH_CHECKS.length + ' survivor.',
        'A contradiction is not',
        'excluded middle for',
        'UNKNOWN.'
      ], { size: 11, lh: 18, color: PAL.invalid });
    }

    legendRow([['ok', 'accepted'], ['bad', 'refused']], 428);
  },

  fk: function (t, sc) {
    var p = (t - sc.start) / (sc.end - sc.start);
    head(5, 'a foreign key and its match types');

    label(50, 48, 'parent holds (1,1); child candidates from {NULL, 1, 2} x {NULL, 1, 2}', { size: 11, color: PAL.dim });

    var rows = FK_TABLE.map(function (r) {
      return [
        { s: '(' + nullText(r.c[0]) + ', ' + nullText(r.c[1]) + ')' },
        { s: r.simple ? 'pass' : 'fail', mark: r.simple ? 'ok' : 'bad' },
        { s: r.full ? 'pass' : 'fail', mark: r.full ? 'ok' : 'bad' },
        { s: r.partial ? 'pass' : 'fail', mark: r.partial ? 'ok' : 'bad' }
      ];
    });

    drawTable(50, 70, [
      { w: 130, label: 'child' }, { w: 96, label: 'SIMPLE' },
      { w: 96, label: 'FULL' }, { w: 96, label: 'PARTIAL' }
    ], rows.slice(0, 5), { rowH: 26, headH: 26 });

    if (on(p, 0.4)) {
      drawTable(530, 70, [
        { w: 120, label: 'match type' }, { w: 110, label: 'accepts' }, { w: 130, label: 'rule' }
      ], [
        [{ s: 'SIMPLE' }, { s: String(FK_COUNTS.simple) }, { s: 'any null passes' }],
        [{ s: 'FULL' }, { s: String(FK_COUNTS.full) }, { s: 'all null or all' }],
        [{ s: 'PARTIAL' }, { s: String(FK_COUNTS.partial) }, { s: 'non-null match' }]
      ], { rowH: 26, headH: 26 });
      label(530, 186, 'out of ' + FK_COUNTS.total + ' candidates', { color: PAL.faint });
    }

    if (on(p, 0.65)) {
      note(50, 300, [
        'The target of a foreign key must be a PRIMARY KEY or a UNIQUE constraint.',
        'MATCH SIMPLE is the default; MATCH PARTIAL is in the standard, not in PostgreSQL.',
        'NOT NULL on the child columns is the only way to force a real reference.'
      ], { size: 12, lh: 21 });
    }

    legendRow([['ok', 'passes'], ['bad', 'refused']], 428);
  },

  actions: function (t, sc) {
    var p = (t - sc.start) / (sc.end - sc.start);
    head(6, 'five referential actions, and when they run');

    var rows = [
      [{ s: 'NO ACTION' }, { s: 'error if children remain' }, { s: 'may defer to COMMIT' }],
      [{ s: 'RESTRICT' }, { s: 'error, at once' }, { s: 'never deferred' }],
      [{ s: 'CASCADE' }, { s: 'children deleted' }, { s: 'with the statement' }],
      [{ s: 'SET NULL' }, { s: 'child key becomes NULL' }, { s: 'with the statement' }],
      [{ s: 'SET DEFAULT' }, { s: 'child key becomes default' }, { s: 'default must exist' }]
    ];
    drawTable(50, 60, [
      { w: 170, label: 'action' }, { w: 330, label: 'what happens to the child' }, { w: 300, label: 'timing' }
    ], rows, { rowH: 32, headH: 26 });

    if (on(p, 0.35)) {
      note(50, 270, [
        'NO ACTION and RESTRICT differ only in when they refuse: a deferred NO ACTION is',
        'checked at the end of the transaction, so a later statement may repair the reference.'
      ], { size: 11, lh: 20, color: PAL.dim });
    }

    if (on(p, 0.6)) {
      P.rect(50, 316, 790, 46, { fill: COL.info.fill, stroke: COL.info.stroke, sw: 1.2, radius: 3 });
      cellText(50, 320, 790, 20, 'DEFERRABLE applies to UNIQUE, PRIMARY KEY and FOREIGN KEY only',
               { size: 11, color: PAL.ink });
      cellText(50, 340, 790, 20, 'CHECK and NOT NULL are always immediate; a referential action still runs with the statement',
               { size: 10, color: PAL.dim });
    }

    if (on(p, 0.85)) {
      note(50, 380, [
        'SET DEFAULT can turn a delete into an error: the default value must itself be a key in the parent.'
      ], { size: 11, color: PAL.warn });
    }

    legendRow([['info', 'timing'], ['warn', 'the trap']], 428);
  },

  cascade05: function (t, sc) {
    var p = (t - sc.start) / (sc.end - sc.start);
    head(7, 'cascade closure: GATE CSE 2005');

    var gone = {};
    DEL_2005.forEach(function (d) { gone[d.vals.A] = true; });
    var rows = SPEC_2005.T.rows.map(function (r) {
      var isDeleted = r[0] === 2 || gone[r[0]];
      return [
        { s: String(r[0]) }, { s: String(r[1]) },
        { s: isDeleted ? 'deleted' : '', mark: isDeleted ? 'bad' : undefined }
      ];
    });
    drawTable(50, 60, [{ w: 80, label: 'A' }, { w: 80, label: 'C' }, { w: 130, label: 'after' }], rows, { rowH: 26 });

    if (on(p, 0.2)) {
      label(50, 292, 'A is the key; C references A with ON DELETE CASCADE; (2,4) is deleted', { size: 10, color: PAL.dim });
    }

    if (on(p, 0.35)) {
      note(400, 60, ['round 1: key 2 has gone', 'rows with C = 2: (5,2), (7,2)'], { size: 11, lh: 20 });
    }
    if (on(p, 0.55)) {
      note(400, 112, ['round 2: keys 5 and 7 have gone', 'rows with C = 5: (9,5)   with C = 7: none'], { size: 11, lh: 20 });
    }
    if (on(p, 0.75)) {
      note(400, 164, ['round 3: key 9 has gone', 'rows with C = 9: none — closure'], { size: 11, lh: 20 });
    }
    if (on(p, 0.88)) {
      P.rect(400, 230, 440, 56, { fill: COL.ok.fill, stroke: COL.ok.stroke, sw: 1.2, radius: 3 });
      cellText(400, 234, 440, 20, DEL_2005.length + ' additional tuples: ' + DEL_2005_SET.join(' '),
               { size: 12, color: PAL.valid });
      cellText(400, 258, 440, 20, 'option C  (option B stops after one round)', { size: 10, color: PAL.dim });
    }

    if (on(p, 0.95)) {
      note(400, 306, [
        'The 4s in the table are not keys: they are values of C,',
        'and a value of C is never the thing a delete removes.'
      ], { size: 11, lh: 18, color: PAL.dim });
    }

    legendRow([['bad', 'deleted'], ['ok', 'the answer']], 428);
  },

  setnull17: function (t, sc) {
    var p = (t - sc.start) / (sc.end - sc.start);
    head(8, 'SET NULL stops a cascade: GATE CSE 2017 Set 2');

    var t1rows = SPEC_2017.T1.rows.map(function (r) {
      var dead = r[0] === 3;
      return [{ s: String(r[0]) }, { s: String(r[1]) }, { s: dead ? 'deleted' : '', mark: dead ? 'bad' : undefined }];
    });
    label(50, 48, 'T1: P key, Q -> T2.R cascade', { size: 10, color: PAL.dim });
    drawTable(50, 64, [{ w: 70, label: 'P' }, { w: 70, label: 'Q' }, { w: 110, label: '' }], t1rows, { rowH: 24, headH: 22 });

    var t2rows = SPEC_2017.T2.rows.map(function (r) {
      var touched = r[0] === 8;
      return [
        { s: String(r[0]) },
        { s: touched && on(p, 0.4) ? 'NULL' : String(r[1]) },
        { s: touched ? 'updated' : '', mark: touched ? 'ok' : undefined }
      ];
    });
    label(360, 48, 'T2: R key, S -> T1.P set null', { size: 10, color: PAL.dim });
    drawTable(360, 64, [{ w: 70, label: 'R' }, { w: 70, label: 'S' }, { w: 110, label: '' }], t2rows, { rowH: 24, headH: 22 });

    if (on(p, 0.35)) {
      note(660, 64, ['delete (3,8)', 'from T1'], { size: 11, lh: 18, color: PAL.invalid });
    }
    if (on(p, 0.55)) {
      note(660, 118, ['(8,3) pointed at', 'P = 3, so S is', 'set to NULL'], { size: 11, lh: 18, color: PAL.valid });
    }
    if (on(p, 0.7)) {
      note(50, 280, [
        'No T2 row was deleted, so the cascade from T1.Q to T2.R never fires.',
        'A cascade fires on a deletion. SET NULL is an update, and the chain stops there.'
      ], { size: 12, lh: 21 });
    }
    if (on(p, 0.85)) {
      P.rect(50, 336, 700, 46, { fill: COL.ok.fill, stroke: COL.ok.stroke, sw: 1.2, radius: 3 });
      cellText(50, 340, 700, 20, 'additional rows deleted from T1: ' + DEL_2017_T1.length,
               { size: 12, color: PAL.valid });
      cellText(50, 360, 700, 20, 'the official key for the question', { size: 10, color: PAL.dim });
    }

    legendRow([['bad', 'deleted'], ['ok', 'updated, not deleted']], 428);
  },

  ops: function (t, sc) {
    var p = (t - sc.start) / (sc.end - sc.start);
    head(9, 'which writes can break a foreign key');

    var cells = [
      { x: 130, y: 70, t: 'INSERT into parent', v: OP_COUNTS.insertParent > 0, s: 'cannot orphan' },
      { x: 470, y: 70, t: 'INSERT into child', v: OP_COUNTS.insertChild > 0, s: 'can orphan' },
      { x: 130, y: 190, t: 'DELETE from parent', v: OP_COUNTS.deleteParent > 0, s: 'can orphan' },
      { x: 470, y: 190, t: 'DELETE from child', v: OP_COUNTS.deleteChild > 0, s: 'cannot orphan' }
    ];
    cells.forEach(function (c, i) {
      if (i === 0 || on(p, 0.25)) {
        P.rect(c.x, c.y, 300, 88, { fill: c.v ? COL.bad.fill : COL.ok.fill,
                                    stroke: c.v ? COL.bad.stroke : COL.ok.stroke, sw: 1.4, radius: 3 });
        cellText(c.x, c.y + 12, 300, 22, c.t, { size: 12, color: PAL.ink });
        cellText(c.x, c.y + 44, 300, 26, c.s, { size: 12, color: c.v ? PAL.invalid : PAL.valid });
      }
    });

    if (on(p, 0.5)) {
      note(130, 300, [
        'Enumeration over ' + OP_VALID_STATES + ' legal instances and ' + OP_EXAMINED + ' operations:',
        'parent insert orphans ' + OP_COUNTS.insertParent + ', child delete orphans ' + OP_COUNTS.deleteChild + '.'
      ], { size: 11, lh: 20, color: PAL.dim });
    }

    if (on(p, 0.72)) {
      note(470, 300, [
        'Updates split the same way:',
        'child key -> missing value, parent key -> new value.'
      ], { size: 11, lh: 20, color: PAL.dim });
    }

    if (on(p, 0.88)) {
      P.text(130, 372, '\u03A0C(r1) \u2212 \u03A0D(r2) is empty  (GATE CSE 2004 Q13)', { size: 13, mono: true, color: PAL.ink });
    }

    legendRow([['bad', 'can violate'], ['ok', 'cannot violate']], 428);
  },

  beyond: function (t, sc) {
    var p = (t - sc.start) / (sc.end - sc.start);
    head(10, 'constraints, functional dependencies and deferral');

    P.rect(50, 60, 380, 150, { fill: COL.ok.fill, stroke: COL.ok.stroke, sw: 1.2, radius: 3 });
    cellText(50, 68, 380, 22, 'enforced by a declaration', { size: 11, color: PAL.valid });
    note(70, 98, ['PRIMARY KEY, UNIQUE', 'NOT NULL, CHECK', 'FOREIGN KEY'], { size: 11, lh: 22, mono: true });

    P.rect(470, 60, 380, 150, { fill: COL.bad.fill, stroke: COL.bad.stroke, sw: 1.2, radius: 3 });
    cellText(470, 68, 380, 22, 'not enforced by a key', { size: 11, color: PAL.invalid });
    note(490, 98, ['a non-key functional dependency', 'a rule spanning several rows', '-> assertion or trigger'], { size: 11, lh: 22 });

    if (on(p, 0.35)) {
      note(50, 236, [
        'SQL knows the keys you declared. A dependency you can prove is not a constraint until',
        'you declare it, which is why a BCNF schema is not automatically a checked one.'
      ], { size: 11, lh: 20 });
    }

    if (on(p, 0.6)) {
      /* a deferral timeline */
      var y = 300;
      P.line(70, y, 830, y, { stroke: PAL.border, sw: 1.5 });
      [['BEGIN', 90], ['statement 1', 260], ['statement 2', 430], ['COMMIT', 640]].forEach(function (s) {
        P.circle(s[1], y, 6, { fill: PAL.surface, stroke: PAL.dim, sw: 1.4 });
        cellText(s[1] - 50, y + 14, 100, 18, s[0], { size: 10, color: PAL.dim });
      });
      P.circle(640, y, 11, { fill: PAL.warnDim, stroke: PAL.warn, sw: 1.6 });
      cellText(600, y + 40, 120, 18, 'deferred check here', { size: 10, color: PAL.warn });
    }

    if (on(p, 0.82)) {
      note(50, 372, [
        'Two tables that reference each other need the deferral; a CHECK cannot look at another row.',
        'Losslessness is a property of the join, not a constraint: a foreign key does not give it.'
      ], { size: 11, lh: 20, color: PAL.dim });
    }

    legendRow([['ok', 'declared'], ['bad', 'needs a trigger'], ['warn', 'deferred']], 428);
  }
};

function legendRow(items, y) {
  var x = 40;
  items.forEach(function (it) {
    var c = COL[it[0]] || COL.flat;
    P.rect(x, y, 12, 12, { fill: c.fill, stroke: c.stroke, sw: 1.2, radius: 2 });
    P.text(x + 18, y, it[1], { size: 10, color: PAL.dim });
    x += 18 + it[1].length * 6 + 26;
  });
}

function drawFrame(P2) {
  P = P2;
  P.alpha(1);
  P.clear();
  P.rect(0, 0, W, H, { fill: PAL.surface });

  var t = (K && K.state) ? K.state.elapsed : 0;
  var scenes = (K && K.state && K.state.scenes && K.state.scenes.length)
    ? K.state.scenes
    : (window.LESSON_TIMELINE ? window.LESSON_TIMELINE.scenes : []);
  var i = 0;
  for (var k = scenes.length - 1; k >= 0; k--) {
    if (t >= scenes[k].start - 1e-6) { i = k; break; }
  }
  var sc = scenes[i];
  if (!sc) return;
  var fn = SCENE_DRAW[sc.id];
  if (!fn) return;
  try {
    fn(t, sc);
  } catch (err) {
    console.error('scene draw failed', sc.id, err);
  }
}

/* ======================================================================
   LAYER 4 - BOOT
   ====================================================================== */

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
  if (fallback) fallback.classList.remove('show');

  var ok = false;
  if (window.p5 && holder && PR) {
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

window.__MODEL = { V: V, CHECKS: CHECKS };
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

})();
