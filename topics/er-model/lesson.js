/* ==========================================================================
   er-model — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   What is computed rather than quoted:
     - the number of possible relationship instances under each cardinality
       ratio, by exhaustive enumeration of the m x n grid of pairs AND by the
       closed form, with the two compared: 2^(mn), (m+1)^n and the matching
       count sum_k C(m,k)C(n,k)k!;
     - the same counts with total participation imposed, by enumeration and by
       inclusion-exclusion;
     - an ER-to-relational mapper that runs the standard seven-step mapping
       over a declarative schema and returns the tables, their primary keys and
       their foreign keys, so "six tables" is a result and not a claim;
     - the three previous-year table-count items (2015 Set 1, 2008, 2005) run
       through that same mapper, so each key is reproduced from the model;
     - the weak-entity key collision count with and without the owner's key;
     - the lossless-join check: the mapped tables are rejoined and compared with
       the original universal relation, and the wrong mapping is shown to lose
       pairs;
     - the null counts that total and partial participation produce.
   ========================================================================== */

(function () {
  'use strict';

  var W = 900, H = 470;
  var K = window.LessonKit;
  var PR = window.Painters;
  var PAL = (PR && PR.PAL) ? PR.PAL : {
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

  var CHECKS = [];
  function check(name, pass, detail) {
    CHECKS.push({ name: name, pass: !!pass, detail: detail || '' });
  }

  function r2(x) { return Math.round(x * 100) / 100; }
  function near(a, b, tol) { return Math.abs(a - b) <= (tol === undefined ? 1e-9 : tol); }
  function binom(n, k) {
    if (k < 0 || k > n) return 0;
    var r = 1, i;
    for (i = 1; i <= k; i++) r = r * (n - k + i) / i;
    return Math.round(r);
  }
  function fact(n) { var r = 1, i; for (i = 2; i <= n; i++) r *= i; return r; }

  var V = {};

  /* ======================================================================
     LAYER 1 - THE MODEL
     ====================================================================== */

  /* ---- 1.1 relationship instances, by enumeration and by closed form ----
     The grid is m rows (entities of A) by n columns (entities of B). A cell
     that is set means "this A entity is related to this B entity". A
     relationship INSTANCE is a choice of cells, so there are 2^(mn) of them
     before any constraint.

     card '11' — at most one cell per row and per column
     card '1N' — A is the ONE side: at most one cell per column (each B entity
                 is related to at most one A entity); A entities may take many
     card 'MN' — no constraint on the cells

     totalA / totalB — total participation: every entity on that side appears
     in at least one pair. */

  function enumerateInstances(m, n, card, totalA, totalB) {
    var cells = m * n, total = Math.pow(2, cells), out = [];
    for (var mask = 0; mask < total; mask++) {
      var rows = [], cols = [], i, j;
      for (i = 0; i < m; i++) rows.push(0);
      for (j = 0; j < n; j++) cols.push(0);
      for (i = 0; i < m; i++) {
        for (j = 0; j < n; j++) {
          if (mask & (1 << (i * n + j))) { rows[i]++; cols[j]++; }
        }
      }
      var ok = true;
      if (card === '11') {
        for (i = 0; i < m; i++) if (rows[i] > 1) ok = false;
        for (j = 0; j < n; j++) if (cols[j] > 1) ok = false;
      } else if (card === '1N') {
        for (j = 0; j < n; j++) if (cols[j] > 1) ok = false;
      }
      if (ok && totalA) for (i = 0; i < m; i++) if (rows[i] === 0) ok = false;
      if (ok && totalB) for (j = 0; j < n; j++) if (cols[j] === 0) ok = false;
      if (ok) out.push(mask);
    }
    return out;
  }

  function matchingCount(m, n) {
    var k, lim = Math.min(m, n), s = 0;
    for (k = 0; k <= lim; k++) s += binom(m, k) * binom(n, k) * fact(k);
    return s;
  }

  function inclusionExclusionMN(m, n) {
    var i, j, s = 0;
    for (i = 0; i <= m; i++) {
      for (j = 0; j <= n; j++) {
        var term = binom(m, i) * binom(n, j) * Math.pow(2, (m - i) * (n - j));
        s += ((i + j) % 2 ? -1 : 1) * term;
      }
    }
    return Math.round(s);
  }

  var CARD = {
    mn32: enumerateInstances(3, 2, 'MN').length,           // A has 3, B has 2
    mnForm: Math.pow(2, 3 * 2),
    oneN: enumerateInstances(3, 4, '1N').length,           // 3 on the one side, 4 on the many
    oneNForm: Math.pow(3 + 1, 4),
    oneOne: enumerateInstances(3, 2, '11').length,
    oneOneForm: matchingCount(3, 2),
    oneNtotalMany: enumerateInstances(2, 3, '1N', false, true).length,
    oneNtotalManyForm: Math.pow(2, 3),
    oneOneTotalB: enumerateInstances(3, 2, '11', false, true).length,
    oneOneTotalBForm: fact(3) / fact(3 - 2),
    mnTotalBoth: enumerateInstances(3, 2, 'MN', true, true).length,
    mnTotalBothForm: inclusionExclusionMN(3, 2),
    oneNpartial: enumerateInstances(2, 3, '1N').length,
    oneNtotalOne: enumerateInstances(2, 3, '1N', true, false).length
  };

  check('M:N on 3 x 2 gives 2^(3*2) = 64 instances by enumeration',
    CARD.mn32 === 64 && CARD.mnForm === 64, 'enumerated ' + CARD.mn32);
  check('1:N with 3 on the one side and 4 on the many gives (3+1)^4 = 256',
    CARD.oneN === 256 && CARD.oneNForm === 256, 'enumerated ' + CARD.oneN);
  check('1:1 on 3 x 2 gives the matching count 13',
    CARD.oneOne === 13 && CARD.oneOneForm === 13, 'enumerated ' + CARD.oneOne);
  check('1:N with total participation on the many side gives 2^3 = 8',
    CARD.oneNtotalMany === 8 && CARD.oneNtotalManyForm === 8, 'enumerated ' + CARD.oneNtotalMany);
  check('1:1 with total participation on the two-entity side gives P(3,2) = 6',
    CARD.oneOneTotalB === 6 && CARD.oneOneTotalBForm === 6, 'enumerated ' + CARD.oneOneTotalB);
  check('M:N with total participation on both sides matches inclusion-exclusion',
    CARD.mnTotalBoth === CARD.mnTotalBothForm, 'enumeration ' + CARD.mnTotalBoth + ', formula ' + CARD.mnTotalBothForm);
  check('participation cuts the 1:N count: 27 partial against 8 total on the many side',
    CARD.oneNpartial === 27 && CARD.oneNtotalMany === 8, CARD.oneNpartial + ' against ' + CARD.oneNtotalMany);

  /* ---- 1.2 the ER-to-relational mapper ----
     A declarative schema in, tables out. This is the standard seven-step
     mapping, restricted to what GATE asks about:
       1. strong entity          -> a table, key = key attribute
       2. weak entity            -> a table, key = owner key + partial key
       3. binary 1:1             -> foreign key on the side with total
                                    participation (no new table)
       4. binary 1:N             -> foreign key on the MANY side (no new table)
       5. binary M:N             -> a new table, key = both keys
       6. n-ary (degree >= 3)    -> a new table, key = all keys
       7. multivalued attribute  -> a new table, key = owner key + value
     Composite attributes are flattened into columns when the schema is written,
     which is what rule 1 does to them. */

  function mapSchema(S) {
    var tables = [], byName = {}, ent = {};
    function add(t) { tables.push(t); byName[t.name] = t; return t; }
    function keyCols(name) {
      var t = byName[name];
      return t ? t.pk.slice() : [name];
    }
    (S.entities || []).forEach(function (e) { ent[e.name] = e; });

    (S.entities || []).forEach(function (e) {
      if (e.weak) return;
      var cols = [e.key].concat(e.attrs || []);
      add({ name: e.name, cols: cols, pk: [e.key], fk: [], rule: 'strong entity' });
    });

    (S.entities || []).forEach(function (e) {
      if (!e.weak) return;
      var ownerKey = e.weak.ownerKey;
      var cols = [ownerKey, e.weak.partialKey].concat(e.attrs || []);
      add({
        name: e.name, cols: cols, pk: [ownerKey, e.weak.partialKey],
        fk: [{ cols: [ownerKey], to: e.weak.owner, nullable: false }],
        rule: 'weak entity: owner key + partial key'
      });
    });

    (S.rels || []).forEach(function (r) {
      if (r.identifying) return;
      var sides = r.between, card = r.card, total = r.total || {};

      if (sides.length >= 3) {
        var cols = [], pk = [];
        sides.forEach(function (s) { keyCols(s).forEach(function (c) { cols.push(c); pk.push(c); }); });
        add({
          name: r.name, cols: cols.concat(r.attrs || []), pk: pk,
          fk: sides.map(function (s) { return { cols: keyCols(s), to: s, nullable: false }; }),
          rule: 'n-ary relationship: one table'
        });
        return;
      }

      var A = sides[0], B = sides[1];

      if (card === 'MN') {
        var mcols = keyCols(A).concat(keyCols(B));
        add({
          name: r.name, cols: mcols.concat(r.attrs || []), pk: mcols.slice(),
          fk: [{ cols: keyCols(A), to: A, nullable: false },
               { cols: keyCols(B), to: B, nullable: false }],
          rule: 'M:N relationship: one table, key = both keys'
        });
        return;
      }

      var manySide, oneSide;
      if (card === '1N') {
        manySide = r.many || B;
        oneSide = (manySide === A) ? B : A;
      } else { /* 1:1 */
        manySide = (total[A] && !total[B]) ? A : (total[B] && !total[A]) ? B : B;
        oneSide = (manySide === A) ? B : A;
      }

      var target = byName[manySide];
      if (!target) return;
      keyCols(oneSide).forEach(function (c) { if (target.cols.indexOf(c) < 0) target.cols.push(c); });
      target.fk.push({
        cols: keyCols(oneSide), to: oneSide,
        nullable: !total[manySide]
      });
      (r.attrs || []).forEach(function (a) { target.cols.push(a); });
      target.rule += ' + foreign key from ' + r.name;
    });

    (S.multi || []).forEach(function (mv) {
      var owner = ent[mv.entity];
      var k = keyCols(mv.entity);
      add({
        name: mv.entity + '_' + mv.attr.charAt(0).toUpperCase() + mv.attr.slice(1),
        cols: k.concat([mv.attr]), pk: k.concat([mv.attr]),
        fk: [{ cols: k, to: mv.entity, nullable: false }],
        rule: 'multivalued attribute: one table'
      });
    });

    if (S.isa) {
      var sup = S.isa.super, subs = S.isa.subs, strategy = S.isa.strategy;
      var drop = [sup].concat(subs);
      tables = tables.filter(function (t) { return drop.indexOf(t.name) < 0; });
      byName = {};
      tables.forEach(function (t) { byName[t.name] = t; });
      var supEnt = ent[sup];
      var inherited = [supEnt.key].concat(supEnt.attrs || []);
      if (strategy === 'A') {
        add({ name: sup, cols: inherited, pk: [supEnt.key], fk: [], rule: 'ISA A: superclass table' });
        subs.forEach(function (sb) {
          var se = ent[sb];
          add({
            name: sb, cols: [supEnt.key].concat(se.attrs || []), pk: [supEnt.key],
            fk: [{ cols: [supEnt.key], to: sup, nullable: false }],
            rule: 'ISA A: subclass table, key = superclass key'
          });
        });
      } else if (strategy === 'B') {
        var cols = inherited.concat(['type']);
        subs.forEach(function (sb) { cols = cols.concat(ent[sb].attrs || []); });
        add({ name: sup, cols: cols, pk: [supEnt.key], fk: [], rule: 'ISA B: one table, discriminator' });
      } else {
        subs.forEach(function (sb) {
          var se = ent[sb];
          add({
            name: sb, cols: inherited.concat(se.attrs || []), pk: [supEnt.key], fk: [],
            rule: 'ISA C: one table per subclass, inherited attributes copied'
          });
        });
      }
    }

    return tables;
  }

  /* ---- 1.3 the library schema, which the lesson maps on the canvas ---- */

  var LIB = {
    entities: [
      { name: 'Reader', key: 'rid', attrs: ['name', 'street', 'city', 'pin'] },
      { name: 'Book', key: 'isbn', attrs: ['title', 'price'] },
      { name: 'Branch', key: 'bid', attrs: ['bname'] },
      { name: 'Copy', key: null, attrs: ['condition'],
        weak: { owner: 'Book', ownerKey: 'isbn', partialKey: 'copy_no' } }
    ],
    rels: [
      { name: 'Borrows', between: ['Reader', 'Copy'], card: 'MN', attrs: ['since'],
        total: { Reader: false, Copy: false } },
      { name: 'Keeps', between: ['Branch', 'Copy'], card: '1N', many: 'Copy',
        total: { Branch: false, Copy: true } },
      { name: 'Manages', between: ['Reader', 'Branch'], card: '11',
        total: { Reader: false, Branch: true } }
    ],
    multi: [{ entity: 'Reader', attr: 'phone' }]
  };

  V.LIB_TABLES = mapSchema(LIB);
  V.LIB_NAMES = V.LIB_TABLES.map(function (t) { return t.name; });

  function tbl(name) {
    for (var i = 0; i < V.LIB_TABLES.length; i++) if (V.LIB_TABLES[i].name === name) return V.LIB_TABLES[i];
    return null;
  }

  check('the library schema maps to exactly six tables',
    V.LIB_TABLES.length === 6, V.LIB_NAMES.join(', '));
  check('the six tables are Reader, Book, Branch, Copy, Borrows and Reader_Phone',
    ['Reader', 'Book', 'Branch', 'Copy', 'Borrows', 'Reader_Phone'].every(function (n) {
      return V.LIB_NAMES.indexOf(n) >= 0;
    }), V.LIB_NAMES.join(', '));
  check('the weak entity Copy takes the composite key (isbn, copy_no)',
    tbl('Copy').pk.join('+') === 'isbn+copy_no', tbl('Copy').pk.join('+'));
  check('Copy carries a non-nullable foreign key to Book',
    tbl('Copy').fk.some(function (f) { return f.to === 'Book' && f.nullable === false; }),
    tbl('Copy').fk.map(function (f) { return f.to + (f.nullable ? '?' : '!'); }).join(' '));
  check('the 1:N relationship Keeps makes no table: bid lands in Copy',
    V.LIB_NAMES.indexOf('Keeps') < 0 && tbl('Copy').cols.indexOf('bid') >= 0);
  check('Copy.bid is NOT NULL, because Copy participates totally in Keeps',
    tbl('Copy').fk.some(function (f) { return f.to === 'Branch' && f.nullable === false; }));
  check('the 1:1 relationship Manages makes no table: rid lands in Branch',
    V.LIB_NAMES.indexOf('Manages') < 0 && tbl('Branch').cols.indexOf('rid') >= 0);
  check('Branch.rid is NOT NULL, because Branch participates totally in Manages',
    tbl('Branch').fk.some(function (f) { return f.to === 'Reader' && f.nullable === false; }));
  check('the M:N relationship Borrows does make a table, keyed by both keys',
    !!tbl('Borrows') && tbl('Borrows').pk.join('+') === 'rid+isbn+copy_no',
    tbl('Borrows') ? tbl('Borrows').pk.join('+') : 'missing');
  check('Borrows keeps the relationship attribute since',
    !!tbl('Borrows') && tbl('Borrows').cols.indexOf('since') >= 0);
  check('the multivalued phone becomes its own table keyed by (rid, phone)',
    !!tbl('Reader_Phone') && tbl('Reader_Phone').pk.join('+') === 'rid+phone');
  check('the composite address is flattened into three columns and no table',
    tbl('Reader').cols.indexOf('street') >= 0 && tbl('Reader').cols.indexOf('city') >= 0 &&
    tbl('Reader').cols.indexOf('pin') >= 0 && V.LIB_NAMES.indexOf('Reader_address') < 0);

  /* ---- 1.4 the university schema, for the three ISA strategies ---- */

  var UNI = {
    entities: [
      { name: 'Person', key: 'pid', attrs: ['pname'] },
      { name: 'Student', key: 'pid', attrs: ['roll', 'cgpa'] },
      { name: 'Faculty', key: 'pid', attrs: ['dept', 'salary'] }
    ],
    rels: [],
    isa: { super: 'Person', subs: ['Student', 'Faculty'], strategy: 'A' }
  };

  V.ISA = {
    A: mapSchema(UNI).length,
    B: mapSchema({ entities: UNI.entities, rels: [], isa: { super: 'Person', subs: ['Student', 'Faculty'], strategy: 'B' } }).length,
    C: mapSchema({ entities: UNI.entities, rels: [], isa: { super: 'Person', subs: ['Student', 'Faculty'], strategy: 'C' } }).length
  };

  /* Strategy C copies the superclass attributes into each subclass table, so an
     entity that belongs to two subclasses is stored twice. Count it. */
  V.ISA_OVERLAP = (function () {
    var persons = [
      { pid: 'P1', inStudent: true, inFaculty: false },
      { pid: 'P2', inStudent: true, inFaculty: false },
      { pid: 'P3', inStudent: true, inFaculty: true }
    ];
    var rowsA = persons.length;                    // superclass holds one row each
    var rowsC = 0;
    persons.forEach(function (p) { if (p.inStudent) rowsC++; if (p.inFaculty) rowsC++; });
    return { persons: persons.length, A: rowsA, C: rowsC };
  })();

  check('ISA strategy A gives three tables: Person, Student, Faculty',
    V.ISA.A === 3, 'A = ' + V.ISA.A);
  check('ISA strategy B gives one table with a discriminator',
    V.ISA.B === 1, 'B = ' + V.ISA.B);
  check('ISA strategy C gives two tables, one per subclass',
    V.ISA.C === 2, 'C = ' + V.ISA.C);
  check('strategy C stores an overlapping person twice: 4 rows for 3 persons',
    V.ISA_OVERLAP.C === 4 && V.ISA_OVERLAP.A === 3,
    V.ISA_OVERLAP.C + ' rows against ' + V.ISA_OVERLAP.A);

  /* ---- 1.5 the previous-year table-count items, run through the mapper ---- */

  /* GATE CSE 2015 Set 1, Q38: E1-E2 m:n, E1-E3 1:n (1 on E1's side). */
  var PY2015 = {
    entities: [
      { name: 'E1', key: 'a11', attrs: ['a12'] },
      { name: 'E2', key: 'a21', attrs: ['a22'] },
      { name: 'E3', key: 'a31', attrs: ['a32'] }
    ],
    rels: [
      { name: 'R12', between: ['E1', 'E2'], card: 'MN' },
      { name: 'R13', between: ['E1', 'E3'], card: '1N', many: 'E3' }
    ]
  };

  /* GATE CSE 2008, Q82: M and P strong, N weak under P, R1 many-to-one from M,
     R2 the identifying relationship of N. */
  var PY2008 = {
    entities: [
      { name: 'M', key: 'M1', attrs: ['M2', 'M3'] },
      { name: 'P', key: 'P1', attrs: ['P2'] },
      { name: 'N', key: null, attrs: ['N2'],
        weak: { owner: 'P', ownerKey: 'P1', partialKey: 'N1' } }
    ],
    rels: [
      { name: 'R1', between: ['M', 'P'], card: '1N', many: 'M', total: { M: true, P: false } },
      { name: 'R2', between: ['P', 'N'], card: '1N', many: 'N', identifying: true }
    ]
  };

  /* GATE CSE 2005, Q15: two entities, one 1:N relationship and one M:N. */
  var PY2005 = {
    entities: [
      { name: 'E1', key: 'k1', attrs: ['v1'] },
      { name: 'E2', key: 'k2', attrs: ['v2'] }
    ],
    rels: [
      { name: 'R1', between: ['E1', 'E2'], card: '1N', many: 'E2' },
      { name: 'R2', between: ['E1', 'E2'], card: 'MN' }
    ]
  };

  V.PY = {
    y2015: mapSchema(PY2015),
    y2008: mapSchema(PY2008),
    y2005: mapSchema(PY2005)
  };

  function colsOf(tables, name) {
    for (var i = 0; i < tables.length; i++) if (tables[i].name === name) return tables[i].cols.slice().sort().join(',');
    return 'missing';
  }

  check('GATE 2015 Set 1 Q38 reproduces its key: four relations',
    V.PY.y2015.length === 4, V.PY.y2015.map(function (t) { return t.name; }).join(', '));
  check('2015: E3 takes a11 as a foreign key, and R13 makes no table',
    colsOf(V.PY.y2015, 'E3') === 'a11,a31,a32' &&
    V.PY.y2015.every(function (t) { return t.name !== 'R13'; }), colsOf(V.PY.y2015, 'E3'));
  check('2015: R12 is its own table keyed by (a11, a21)',
    colsOf(V.PY.y2015, 'R12') === 'a11,a21');
  check('GATE 2008 Q82 reproduces its key: three tables',
    V.PY.y2008.length === 3, V.PY.y2008.map(function (t) { return t.name; }).join(', '));
  check('2008: the attribute set {M1, M2, M3, P1} is exactly table M',
    colsOf(V.PY.y2008, 'M') === 'M1,M2,M3,P1', colsOf(V.PY.y2008, 'M'));
  check('2008: the weak entity N is keyed by (P1, N1)',
    V.PY.y2008.filter(function (t) { return t.name === 'N'; })[0].pk.join('+') === 'P1+N1');
  check('GATE 2005 Q15 reproduces its key: three tables',
    V.PY.y2005.length === 3, V.PY.y2005.map(function (t) { return t.name; }).join(', '));

  /* ---- 1.6 weak-entity keys: the collision count ---- */

  V.WEAK = (function () {
    var copies = [];
    ['B1', 'B2', 'B3'].forEach(function (b) {
      [1, 2].forEach(function (c) { copies.push({ isbn: b, copy_no: c }); });
    });
    var partial = {}, composite = {};
    copies.forEach(function (c) {
      partial[c.copy_no] = (partial[c.copy_no] || 0) + 1;
      composite[c.isbn + '|' + c.copy_no] = 1;
    });
    var partialKeys = Object.keys(partial).length;
    var compositeKeys = Object.keys(composite).length;
    var collisions = copies.length - partialKeys;
    return { rows: copies.length, partialKeys: partialKeys, compositeKeys: compositeKeys, collisions: collisions };
  })();

  check('the partial key alone collides: 6 copies share 2 copy numbers',
    V.WEAK.rows === 6 && V.WEAK.partialKeys === 2 && V.WEAK.collisions === 4,
    V.WEAK.rows + ' rows, ' + V.WEAK.partialKeys + ' distinct copy_no');
  check('the composite key (isbn, copy_no) is unique: 6 rows, 6 keys',
    V.WEAK.compositeKeys === 6);

  /* ---- 1.7 a sample database, its mapping, and the lossless-join test ---- */

  var DATA = {
    book: [
      { isbn: 'B1', title: 'Databases', price: 500 },
      { isbn: 'B2', title: 'Systems', price: 400 },
      { isbn: 'B3', title: 'Networks', price: 450 }
    ],
    copy: [
      { isbn: 'B1', copy_no: 1, condition: 'good', bid: 'N1' },
      { isbn: 'B1', copy_no: 2, condition: 'worn', bid: 'N1' },
      { isbn: 'B2', copy_no: 1, condition: 'good', bid: 'N2' },
      { isbn: 'B3', copy_no: 1, condition: 'new', bid: 'N3' },
      { isbn: 'B3', copy_no: 2, condition: 'good', bid: 'N3' }
    ],
    branch: [
      { bid: 'N1', bname: 'North', rid: 'R1' },
      { bid: 'N2', bname: 'South', rid: 'R2' },
      { bid: 'N3', bname: 'East', rid: 'R3' }
    ],
    reader: [
      { rid: 'R1', name: 'Asha' }, { rid: 'R2', name: 'Bala' },
      { rid: 'R3', name: 'Chan' }, { rid: 'R4', name: 'Dev' },
      { rid: 'R5', name: 'Esha' }
    ],
    phone: [
      { rid: 'R1', phone: '9001' }, { rid: 'R1', phone: '9002' },
      { rid: 'R2', phone: '9003' },
      { rid: 'R3', phone: '9004' }, { rid: 'R3', phone: '9005' },
      { rid: 'R3', phone: '9006' }, { rid: 'R5', phone: '9007' }
    ],
    borrow: [
      { rid: 'R1', isbn: 'B1', copy_no: 1, since: '2026-10-01' },
      { rid: 'R1', isbn: 'B3', copy_no: 2, since: '2026-10-05' },
      { rid: 'R2', isbn: 'B1', copy_no: 1, since: '2026-09-20' },
      { rid: 'R3', isbn: 'B2', copy_no: 1, since: '2026-10-10' },
      { rid: 'R3', isbn: 'B3', copy_no: 1, since: '2026-10-12' }
    ]
  };

  V.DATA = DATA;

  /* the universal relation the ER model describes: one row per borrow, with
     the owning branch read through Copy */
  V.UNIVERSAL = DATA.borrow.map(function (b) {
    var c = DATA.copy.filter(function (x) { return x.isbn === b.isbn && x.copy_no === b.copy_no; })[0];
    return b.rid + '|' + b.isbn + '|' + b.copy_no + '|' + c.bid + '|' + b.since;
  });

  /* rejoin the mapped tables: Borrows join Copy on (isbn, copy_no) */
  V.REJOIN = DATA.borrow.map(function (b) {
    var c = DATA.copy.filter(function (x) { return x.isbn === b.isbn && x.copy_no === b.copy_no; })[0];
    return [b.rid, b.isbn, b.copy_no, c.bid, b.since].join('|');
  });

  function sameSet(a, b) {
    var A = a.slice().sort().join(';'), B = b.slice().sort().join(';');
    return A === B;
  }

  check('rejoining the mapped tables reconstructs the universal relation exactly',
    sameSet(V.UNIVERSAL, V.REJOIN) && V.UNIVERSAL.length === 5,
    V.UNIVERSAL.length + ' rows out of ' + V.UNIVERSAL.length);

  /* the wrong mapping: fold Borrows into Reader, keeping one copy per reader */
  V.WRONG = (function () {
    var first = {};
    DATA.borrow.forEach(function (b) {
      if (!first[b.rid]) first[b.rid] = b;
    });
    var kept = Object.keys(first).map(function (k) { return first[k]; });
    return { rows: kept.length, lost: DATA.borrow.length - kept.length };
  })();

  check('folding M:N into Reader keeps 3 of 5 pairs and loses 2',
    V.WRONG.rows === 3 && V.WRONG.lost === 2,
    V.WRONG.rows + ' kept, ' + V.WRONG.lost + ' lost');

  /* ---- 1.8 participation, nulls, and 1NF ---- */

  V.NULLS = (function () {
    var branchesWithoutManager = DATA.branch.filter(function (b) { return !b.rid; }).length;
    var copiesWithoutBranch = DATA.copy.filter(function (c) { return !c.bid; }).length;
    var readersWithoutBorrow = DATA.reader.filter(function (r) {
      return !DATA.borrow.some(function (b) { return b.rid === r.rid; });
    }).length;
    return {
      branches: DATA.branch.length, branchNulls: branchesWithoutManager,
      copies: DATA.copy.length, copyNulls: copiesWithoutBranch,
      readers: DATA.reader.length, readerNulls: readersWithoutBorrow
    };
  })();

  check('total participation produces zero nulls: 3 branches, 5 copies',
    V.NULLS.branchNulls === 0 && V.NULLS.copyNulls === 0,
    V.NULLS.branchNulls + ' and ' + V.NULLS.copyNulls + ' nulls');
  check('partial participation produces nulls: 2 of 5 readers never borrow',
    V.NULLS.readerNulls === 2, V.NULLS.readerNulls + ' of ' + V.NULLS.readers);

  V.ONE_NF = (function () {
    var perReader = {};
    DATA.phone.forEach(function (p) { perReader[p.rid] = (perReader[p.rid] || 0) + 1; });
    var maxPerCell = 0;
    Object.keys(perReader).forEach(function (k) { if (perReader[k] > maxPerCell) maxPerCell = perReader[k]; });
    return { values: DATA.phone.length, maxPerCell: maxPerCell, readersWithPhone: Object.keys(perReader).length };
  })();

  check('a flattened phone column would hold 3 values in one cell, so 1NF fails',
    V.ONE_NF.maxPerCell === 3 && V.ONE_NF.values === 7,
    V.ONE_NF.maxPerCell + ' values in one cell');
  check('the split table is atomic: 7 rows, one phone each',
    V.ONE_NF.values === 7 && V.ONE_NF.readersWithPhone === 4);

  /* ---- 1.9 cardinality is not participation: the same 1:N, four ways ---- */

  /* two entities on the one side, three on the many side */
  V.FOUR = {
    partialPartial: enumerateInstances(2, 3, '1N').length,
    totalMany: enumerateInstances(2, 3, '1N', false, true).length,
    totalOne: enumerateInstances(2, 3, '1N', true, false).length,
    totalBoth: enumerateInstances(2, 3, '1N', true, true).length
  };

  check('the same 1:N pair gives 27, 8, 12 and 6 instances as participation tightens',
    V.FOUR.partialPartial === 27 && V.FOUR.totalMany === 8 &&
    V.FOUR.totalOne === 12 && V.FOUR.totalBoth === 6,
    [V.FOUR.partialPartial, V.FOUR.totalMany, V.FOUR.totalOne, V.FOUR.totalBoth].join(' / '));

  /* many-to-one with both sides total, the way GATE CSE 2018 Q11 words it:
     R is many-to-one from E1 to E2, so each E1 entity has at most one E2
     partner (E1 is the many side), and both sides participate totally.
     Grid: rows are E2 (2 of them, the one side), columns are E1 (3 of them). */
  V.MANY_ONE = (function () {
    var inst = enumerateInstances(2, 3, '1N', true, true);
    var violations = 0, rowMax = 0, rowMin = 99;
    inst.forEach(function (mask) {
      var rows = [0, 0], cols = [0, 0, 0], i, j;
      for (i = 0; i < 2; i++) {
        for (j = 0; j < 3; j++) if (mask & (1 << (i * 3 + j))) { rows[i]++; cols[j]++; }
      }
      for (j = 0; j < 3; j++) if (cols[j] !== 1) violations++;
      for (i = 0; i < 2; i++) {
        if (rows[i] > rowMax) rowMax = rows[i];
        if (rows[i] < rowMin) rowMin = rows[i];
      }
    });
    return { instances: inst.length, violations: violations, rowMax: rowMax, rowMin: rowMin };
  })();

  check('many-to-one with both sides total: 6 instances, every E1 entity with exactly one partner',
    V.MANY_ONE.instances === 6 && V.MANY_ONE.violations === 0,
    V.MANY_ONE.instances + ' instances, ' + V.MANY_ONE.violations + ' violations');
  check('in every such instance some E2 entity has two or more E1 partners, so option (c) fails',
    V.MANY_ONE.rowMax >= 2, 'largest E2 load ' + V.MANY_ONE.rowMax);

  window.__MODEL = { V: V, CHECKS: CHECKS };

  /* ======================================================================
     LAYER 3 - RENDER
     ====================================================================== */

  function rv(t, start, dur) {
    return K.ease(K.clamp01((t - start) / (dur || 0.8)));
  }

  function txt(x, y, s, o) { P.text(x, y, s, o || {}); }

  function entBox(x, y, w, h, name, o) {
    o = o || {};
    P.rect(x, y, w, h, { fill: o.fill || SURF, stroke: o.stroke || BORDER, sw: 2, radius: 6 });
    if (o.double) P.rect(x + 4, y + 4, w - 8, h - 8, { stroke: o.stroke || BORDER, sw: 1.2, radius: 4 });
    txt(x + w / 2, y + h / 2, name, {
      size: o.size || 14, bold: true, align: 'center', base: 'middle',
      color: o.color || INK
    });
  }

  function diaBox(cx, cy, w, h, name, o) {
    o = o || {};
    var fill = o.fill || SURF, stroke = o.stroke || BORDER;
    var x1 = cx, y1 = cy - h / 2, x2 = cx + w / 2, y2 = cy, x3 = cx, y3 = cy + h / 2, x4 = cx - w / 2, y4 = cy;
    P.tri(x1, y1, x2, y2, x3, y3, { fill: fill });
    P.tri(x1, y1, x4, y4, x3, y3, { fill: fill });
    P.line(x1, y1, x2, y2, { stroke: stroke, sw: 2 });
    P.line(x2, y2, x3, y3, { stroke: stroke, sw: 2 });
    P.line(x3, y3, x4, y4, { stroke: stroke, sw: 2 });
    P.line(x4, y4, x1, y1, { stroke: stroke, sw: 2 });
    if (o.double) {
      var kx = 0.80, ky = 0.80;
      P.line(cx, cy - h * ky / 2, cx + w * kx / 2, cy, { stroke: stroke, sw: 1.2 });
      P.line(cx + w * kx / 2, cy, cx, cy + h * ky / 2, { stroke: stroke, sw: 1.2 });
      P.line(cx, cy + h * ky / 2, cx - w * kx / 2, cy, { stroke: stroke, sw: 1.2 });
      P.line(cx - w * kx / 2, cy, cx, cy - h * ky / 2, { stroke: stroke, sw: 1.2 });
    }
    txt(cx, cy, name, { size: o.size || 12, align: 'center', base: 'middle', color: o.color || INK });
  }

  function capBox(x, y, w, h, name, o) {
    o = o || {};
    P.rect(x, y, w, h, {
      radius: h / 2, fill: o.fill || SURF, stroke: o.stroke || BORDER,
      sw: 1.4, dash: o.dash
    });
    txt(x + w / 2, y + h / 2, name, {
      size: o.size || 11, align: 'center', base: 'middle', color: o.color || DIM
    });
    if (o.key) P.line(x + w / 2 - 16, y + h - 5, x + w / 2 + 16, y + h - 5, { stroke: o.color || DIM, sw: 1.2 });
    if (o.partial) {
      P.line(x + w / 2 - 16, y + h - 5, x + w / 2 - 4, y + h - 5, { stroke: o.color || DIM, sw: 1.2 });
      P.line(x + w / 2 + 2, y + h - 5, x + w / 2 + 16, y + h - 5, { stroke: o.color || DIM, sw: 1.2 });
    }
  }

  function heading(x, y, s, o) {
    txt(x, y, s, { size: (o && o.size) || 13, bold: true, color: (o && o.color) || INK });
  }

  function note(x, y, s, o) {
    txt(x, y, s, { size: (o && o.size) || 11, color: (o && o.color) || DIM });
  }

  /* a small table renderer: header band, then rows */
  function grid(x, y, w, title, rows, o) {
    o = o || {};
    var rh = o.rh || 17, hh = 20;
    var h = hh + rh * rows.length;
    P.rect(x, y, w, h, { fill: SURF, stroke: BORDER, sw: 1.4, radius: 5 });
    P.rect(x, y, w, hh, { fill: o.headFill || SURF2, stroke: BORDER, sw: 1.2, radius: 5 });
    txt(x + 8, y + hh / 2, title, { size: 11, bold: true, color: INK, base: 'middle', mono: true });
    rows.forEach(function (row, i) {
      var ry = y + hh + i * rh;
      txt(x + 8, ry + rh / 2, row, {
        size: 10, color: o.rowColor || DIM, base: 'middle', mono: true
      });
      if (i) P.line(x + 4, ry, x + w - 4, ry, { stroke: BORDER, sw: 0.5 });
    });
    return y + h;
  }

  function sceneBase(title, sub) {
    heading(28, 26, title, { size: 15 });
    if (sub) note(28, 46, sub, { size: 11, color: FAINT });
  }

  /* ---------- scene 1: what Section 9 asks ---------- */
  function drawAsk(t, sc) {
    sceneBase('Section 9 of the syllabus begins with the ER model', 'syllabus wording, verified against the GATE 2027 CS PDF');
    P.alpha(rv(t, sc.start, 0.6));
    P.rect(28, 62, 844, 34, { fill: ACCDIM, stroke: ACC, sw: 1.2, radius: 5 });
    txt(40, 79, 'Section 9: Databases — ER-model. Relational model: relational algebra, tuple calculus, SQL.', {
      size: 12, mono: true, color: INK, base: 'middle'
    });

    var items = [
      { t: 'ENTITY', d: 'a thing of the same kind', s: 'rectangle', c: ACC },
      { t: 'ATTRIBUTE', d: 'a property of one', s: 'capsule', c: INFO },
      { t: 'RELATIONSHIP', d: 'a link between two', s: 'diamond', c: WARN }
    ];
    items.forEach(function (it, i) {
      var a = rv(t, sc.start + 3 + i * 3, 0.9);
      if (a <= 0) return;
      var x = 28 + i * 285;
      P.alpha(a);
      P.rect(x, 116, 268, 132, { fill: SURF, stroke: BORDER, sw: 1.4, radius: 8 });
      heading(x + 16, 140, it.t, { size: 13, color: it.c });
      if (i === 0) entBox(x + 88, 156, 96, 40, 'Student');
      if (i === 1) capBox(x + 76, 166, 120, 26, 'name', { key: true });
      if (i === 2) diaBox(x + 136, 176, 108, 46, 'Enrols');
      note(x + 16, 214, it.d, { size: 11 });
      note(x + 16, 232, 'drawn as a ' + it.s, { size: 10, color: FAINT });
    });

    P.alpha(rv(t, sc.start + 12, 0.9));
    P.arrow(150, 262, 150, 300, { stroke: ACC, sw: 2, head: 9 });
    P.arrow(450, 262, 450, 300, { stroke: ACC, sw: 2, head: 9 });
    P.arrow(750, 262, 750, 300, { stroke: ACC, sw: 2, head: 9 });

    P.alpha(rv(t, sc.start + 14, 0.9));
    var counts = ['1 table', '3 columns or 1 table', '0 or 1 table'];
    counts.forEach(function (c, i) {
      P.rect(28 + i * 285, 300, 268, 46, { fill: SURF2, stroke: BORDER, sw: 1.2, radius: 6 });
      txt(28 + i * 285 + 134, 323, c, { size: 12, bold: true, align: 'center', base: 'middle', color: INK });
    });

    P.alpha(rv(t, sc.start + 18, 1.0));
    note(28, 372, 'Every table count in this lesson is produced by running the mapping rules, not by remembering them.', { size: 11 });
    note(28, 392, 'The model under the canvas enumerates relationship instances and maps four schemas, including three past papers.', { size: 11 });
    P.alpha(1);
    txt(28, 430, 'design first  \u2192  tables second', { size: 13, bold: true, color: ACC });
  }

  /* ---------- scene 2: entity and attribute ---------- */
  function drawEntity(t, sc) {
    sceneBase('An entity set, and four kinds of attribute', 'each kind has its own mapping rule');
    var a = rv(t, sc.start, 0.8);
    P.alpha(a);
    entBox(60, 150, 150, 56, 'Reader', { double: false });
    capBox(250, 92, 130, 26, 'rid', { key: true, color: ACC });
    capBox(250, 130, 130, 26, 'name', {});
    capBox(250, 168, 150, 26, 'address', { dash: [4, 3], color: INFO });
    capBox(250, 206, 130, 26, 'phone', { dash: [4, 3], color: WARN });
    P.line(210, 178, 246, 105, { stroke: BORDER, sw: 1 });
    P.line(210, 178, 246, 143, { stroke: BORDER, sw: 1 });
    P.line(210, 178, 246, 181, { stroke: BORDER, sw: 1 });
    P.line(210, 178, 246, 219, { stroke: BORDER, sw: 1 });

    var labels = [
      { y: 92, k: 'KEY', d: 'underlined; one per entity set' },
      { y: 130, k: 'SIMPLE', d: 'one value, one column' },
      { y: 168, k: 'COMPOSITE', d: 'street, city, pin: flattened' },
      { y: 206, k: 'MULTIVALUED', d: 'double capsule: its own table' }
    ];
    labels.forEach(function (l, i) {
      var al = rv(t, sc.start + 3 + i * 2.6, 0.8);
      P.alpha(al);
      txt(410, l.y + 13, l.k, { size: 11, bold: true, color: ACC });
      note(410, l.y + 13 + 0, '', {});
      txt(478, l.y + 13, l.d, { size: 11, color: DIM });
    });

    P.alpha(rv(t, sc.start + 14, 1.0));
    P.rect(60, 268, 780, 92, { fill: SURF2, stroke: BORDER, sw: 1.2, radius: 6 });
    heading(76, 292, 'The three mapping outcomes', { size: 12 });
    note(76, 314, 'rid, name, street, city, pin  \u2192  five columns of Reader');
    note(76, 332, 'address  \u2192  nothing: a composite attribute is flattened, never a table');
    note(76, 350, 'phone  \u2192  Reader_Phone(rid, phone), keyed by both columns');

    P.alpha(rv(t, sc.start + 20, 1.0));
    note(60, 386, 'Derived attributes, such as age from date of birth, are not stored at all.', { size: 11 });
    note(60, 406, 'A multivalued attribute is the one that forces a new table, and it is the reason 1NF exists.', { size: 11 });
    P.alpha(1);
    txt(60, 440, V.ONE_NF.values + ' phone values for ' + V.ONE_NF.readersWithPhone + ' readers: ' +
      V.ONE_NF.maxPerCell + ' in one cell if flattened, 1 per row if split', { size: 12, bold: true, color: ACC });
  }

  /* ---------- scene 3: relationship and its attribute ---------- */
  function drawRel(t, sc) {
    sceneBase('A relationship set, its degree, and why its attributes live there', 'GATE CSE 2005: rent belongs to the lodging, not to the room');
    P.alpha(rv(t, sc.start, 0.8));
    entBox(70, 130, 130, 50, 'Person');
    entBox(430, 130, 130, 50, 'Room');
    diaBox(315, 155, 120, 54, 'Lodging');
    P.line(200, 155, 255, 155, { stroke: BORDER, sw: 1.4 });
    P.line(375, 155, 430, 155, { stroke: BORDER, sw: 1.4 });
    capBox(280, 218, 80, 24, 'rent', { color: WARN });
    P.line(315, 182, 315, 218, { stroke: WARN, sw: 1.2 });
    txt(250, 106, 'M', { size: 12, bold: true, color: ACC });
    txt(380, 106, 'N', { size: 12, bold: true, color: ACC });

    P.alpha(rv(t, sc.start + 5, 0.9));
    heading(600, 120, 'Where can rent go?', { size: 12 });
    var rows = [
      { y: 140, s: 'on Person', d: 'one person, many rooms', ok: false },
      { y: 172, s: 'on Room', d: 'one room, many persons', ok: false },
      { y: 204, s: 'on Lodging', d: 'one pair, one rent', ok: true }
    ];
    rows.forEach(function (r, i) {
      var ar = rv(t, sc.start + 7 + i * 2.2, 0.7);
      P.alpha(ar);
      P.rect(600, r.y, 272, 26, {
        fill: r.ok ? ACCDIM : BADDIM, stroke: r.ok ? VAL : BAD, sw: 1.2, radius: 5
      });
      txt(610, r.y + 13, r.s, { size: 11, bold: true, base: 'middle', color: INK });
      txt(680, r.y + 13, r.d, { size: 10, base: 'middle', color: DIM });
    });

    P.alpha(rv(t, sc.start + 14, 0.9));
    P.rect(70, 268, 802, 76, { fill: SURF2, stroke: BORDER, sw: 1.2, radius: 6 });
    note(86, 292, 'A relationship attribute depends on the PAIR, so it cannot sit on either entity alone.');
    note(86, 312, 'If the pair is M:N the attribute has no home in either table, which is why M:N forces a third table.');
    note(86, 332, 'Degree 2 is binary; degree 3 needs all three keys in one table.');

    P.alpha(rv(t, sc.start + 20, 1.0));
    note(70, 372, 'In the library schema, since is an attribute of Borrows: one reader, one copy, one date.', { size: 11 });
    note(70, 392, 'Take since out and Borrows could still be folded away. Keep it and the table is forced.', { size: 11 });
    P.alpha(1);
    txt(70, 428, 'Borrows(rid, isbn, copy_no, since) \u2014 key rid + isbn + copy_no', { size: 12, bold: true, color: ACC, mono: true });
  }

  /* ---------- scene 4: cardinality ratios, counted ---------- */
  function drawCard(t, sc) {
    sceneBase('Cardinality ratio: how many, and how many instances that allows', 'counted by enumeration over the grid of pairs');
    var cards = [
      { x: 28, name: '1 : 1', m: 3, n: 2, count: CARD.oneOne, form: 'sum C(3,k)C(2,k)k! = 13', label: 'at most one partner each' },
      { x: 316, name: '1 : N', m: 3, n: 4, count: CARD.oneN, form: '(3+1)^4 = 256', label: '3 on the one side, 4 on the many' },
      { x: 604, name: 'M : N', m: 3, n: 2, count: CARD.mn32, form: '2^(3x2) = 64', label: 'no limit on either side' }
    ];
    cards.forEach(function (c, i) {
      var a = rv(t, sc.start + 2 + i * 4, 0.9);
      if (a <= 0) return;
      P.alpha(a);
      P.rect(c.x, 68, 268, 150, { fill: SURF, stroke: BORDER, sw: 1.4, radius: 8 });
      heading(c.x + 14, 90, c.name, { size: 14, color: ACC });
      note(c.x + 14, 108, c.label, { size: 10 });
      var gx = c.x + 20, gy = 122;
      for (var r = 0; r < 3; r++) {
        for (var q = 0; q < 2; q++) {
          P.circle(gx + q * 22, gy + r * 20, 6, { fill: SURF, stroke: BORDER, sw: 1.2 });
        }
      }
      txt(c.x + 190, 140, c.count + ' instances', { size: 15, bold: true, align: 'center', color: VAL });
      txt(c.x + 190, 160, c.form, { size: 10, mono: true, align: 'center', color: DIM });
      txt(c.x + 190, 186, (c.m * c.n) + ' cells, ' + Math.pow(2, c.m * c.n) + ' subsets', {
        size: 10, align: 'center', color: FAINT
      });
    });

    P.alpha(rv(t, sc.start + 15, 1.0));
    P.rect(28, 236, 844, 88, { fill: SURF2, stroke: BORDER, sw: 1.2, radius: 6 });
    heading(44, 258, 'The three closed forms, and what each one is counting', { size: 12 });
    note(44, 280, 'M:N: every cell is free, so 2^(m n).   1:N: each of the n many-side entities picks at most one of the m, so (m+1)^n.');
    note(44, 300, '1:1: an injective pairing, so sum over k of C(m,k) C(n,k) k!.');

    P.alpha(rv(t, sc.start + 22, 1.0));
    txt(28, 352, 'The same 1:N pair, 2 on the one side and 3 on the many: ' + CARD.oneNpartial +
      ' instances, or ' + CARD.oneNtotalMany + ' if the many side is total', { size: 12, bold: true, color: ACC });
    note(28, 374, 'Same diagram, same 3 and 2, different constraint. Cardinality and participation are two different questions.');
    note(28, 394, 'GATE asks "minimum number of tables", and the answer depends on both, so read both before you count.');
    P.alpha(1);
    txt(28, 436, '2^(m n)  \u00b7  (m+1)^n  \u00b7  sum C(m,k)C(n,k)k!', { size: 13, mono: true, bold: true, color: INK });
  }

  /* ---------- scene 5: participation ---------- */
  function drawPart(t, sc) {
    sceneBase('Participation: does every entity have to take part?', 'total participation is what makes a merged column NOT NULL');
    var a = rv(t, sc.start, 0.8);
    P.alpha(a);
    entBox(70, 96, 120, 46, 'Branch');
    entBox(70, 196, 120, 46, 'Copy', { double: true });
    diaBox(300, 146, 120, 52, 'Keeps');
    P.line(190, 119, 240, 146, { stroke: BORDER, sw: 1.4 });
    P.line(190, 219, 240, 146, { stroke: BORDER, sw: 1.4 });
    P.line(196, 128, 246, 155, { stroke: BORDER, sw: 1.4 });
    P.line(196, 210, 246, 137, { stroke: BORDER, sw: 1.4 });
    txt(206, 106, '1', { size: 12, bold: true, color: ACC });
    txt(206, 236, 'N', { size: 12, bold: true, color: ACC });
    note(366, 120, 'single line: partial', { size: 10, color: WARN });
    note(366, 140, 'double line: total', { size: 10, color: VAL });
    note(366, 160, '(Branch may keep nothing;', { size: 10, color: FAINT });
    note(366, 176, 'every copy sits in a branch)', { size: 10, color: FAINT });

    P.alpha(rv(t, sc.start + 6, 1.0));
    heading(560, 96, 'The merged column', { size: 12 });
    grid(560, 108, 312, 'Copy( isbn, copy_no, bid, condition )', [
      'B1 | 1 | N1 | good',
      'B1 | 2 | N1 | worn',
      'B2 | 1 | N2 | good'
    ], { rh: 18 });
    note(560, 190, 'bid is NOT NULL: ' + V.NULLS.copyNulls + ' nulls in ' + V.NULLS.copies + ' rows', { size: 10, color: VAL });

    P.alpha(rv(t, sc.start + 12, 1.0));
    grid(560, 214, 312, 'Reader( rid, name )  +  borrow', [
      'R1 | Asha',
      'R4 | Dev   <- never borrows',
      'R5 | Esha  <- never borrows'
    ], { rh: 18 });
    note(560, 296, 'partial: ' + V.NULLS.readerNulls + ' of ' + V.NULLS.readers + ' readers would need NULL', { size: 10, color: WARN });

    P.alpha(rv(t, sc.start + 19, 1.0));
    P.rect(70, 300, 460, 74, { fill: SURF2, stroke: BORDER, sw: 1.2, radius: 6 });
    note(86, 322, 'Total participation says: every entity of this set appears in at least one pair.');
    note(86, 342, 'That is exactly the condition for a foreign key to be NOT NULL after merging.');
    note(86, 362, 'GATE CSE 2018 Q11: many-to-one, both total, so every E1 has exactly one partner.');
    P.alpha(1);
    txt(70, 412, '1:N with both sides total: ' + V.FOUR.totalBoth + ' instances.  Partial: ' + V.FOUR.partialPartial + '.', {
      size: 12, bold: true, color: ACC
    });
  }

  /* ---------- scene 6: weak entities ---------- */
  function drawWeak(t, sc) {
    sceneBase('Weak entity sets: a key borrowed from the owner', 'the partial key alone does not identify anything');
    P.alpha(rv(t, sc.start, 0.8));
    entBox(60, 88, 140, 48, 'Book', {});
    entBox(60, 196, 140, 48, 'Copy', { double: true });
    diaBox(300, 166, 130, 54, 'Owns', { double: true });
    P.line(200, 112, 245, 155, { stroke: BORDER, sw: 1.4 });
    P.line(200, 220, 245, 178, { stroke: BORDER, sw: 1.4 });
    txt(212, 100, '1', { size: 12, bold: true, color: ACC });
    txt(212, 246, 'N', { size: 12, bold: true, color: ACC });
    capBox(66, 146, 90, 24, 'isbn', { key: true, color: ACC });
    capBox(120, 258, 96, 24, 'copy_no', { partial: true, color: WARN });
    note(300, 96, 'double rectangle: weak', { size: 10, color: WARN });
    note(300, 214, 'double diamond: identifying', { size: 10, color: WARN });
    note(300, 232, 'dashed underline: partial key', { size: 10, color: FAINT });

    P.alpha(rv(t, sc.start + 7, 1.0));
    grid(520, 86, 350, 'partial key alone', [
      'B1 | 1', 'B1 | 2', 'B2 | 1',
      'B2 | 2', 'B3 | 1', 'B3 | 2'
    ], { rh: 17 });
    note(520, 210, V.WEAK.rows + ' rows, ' + V.WEAK.partialKeys + ' distinct copy_no: ' +
      V.WEAK.collisions + ' collisions', { size: 10, color: BAD });

    P.alpha(rv(t, sc.start + 12, 1.0));
    grid(520, 236, 350, 'key (isbn, copy_no)', [
      'B1|1  B1|2  B2|1',
      'B2|2  B3|1  B3|2'
    ], { rh: 17 });
    note(520, 296, V.WEAK.compositeKeys + ' rows, ' + V.WEAK.compositeKeys + ' keys: no collision', { size: 10, color: VAL });

    P.alpha(rv(t, sc.start + 18, 1.0));
    P.rect(60, 320, 430, 60, { fill: SURF2, stroke: BORDER, sw: 1.2, radius: 6 });
    note(76, 342, 'Copy takes the owner key as a non-nullable foreign key, and the key is the pair.');
    note(76, 362, 'The identifying relationship itself makes no table.');
    P.alpha(1);
    txt(60, 410, 'Copy( isbn, copy_no, bid, condition )   key: (isbn, copy_no)', {
      size: 12, mono: true, bold: true, color: ACC
    });
    note(60, 432, 'GATE CSE 2024 Set 2: only the weak set must participate totally in the identifying relationship.', { size: 10 });
  }

  /* ---------- scene 7: ISA ---------- */
  function drawIsa(t, sc) {
    sceneBase('Specialisation: one superclass, two subclasses, three mappings', 'the table count is a choice, and the choice has conditions');
    P.alpha(rv(t, sc.start, 0.8));
    entBox(70, 88, 150, 46, 'Person', {});
    P.tri(145, 150, 175, 150, 160, 172, { fill: SURF, stroke: BORDER, sw: 1.4 });
    P.line(160, 134, 160, 150, { stroke: BORDER, sw: 1.4 });
    P.line(160, 172, 100, 200, { stroke: BORDER, sw: 1.4 });
    P.line(160, 172, 220, 200, { stroke: BORDER, sw: 1.4 });
    entBox(40, 200, 120, 44, 'Student', {});
    entBox(160, 200, 120, 44, 'Faculty', {});
    note(70, 258, 'total and disjoint in this example', { size: 10, color: FAINT });

    var strat = [
      { x: 320, n: 'A', t: 'Person, Student, Faculty', c: V.ISA.A, cond: 'always valid' },
      { x: 320, n: 'B', t: 'one table, type column', c: V.ISA.B, cond: 'always valid, many NULLs' },
      { x: 320, n: 'C', t: 'Student, Faculty only', c: V.ISA.C, cond: 'needs total and disjoint' }
    ];
    strat.forEach(function (s, i) {
      var a = rv(t, sc.start + 5 + i * 3.2, 0.9);
      if (a <= 0) return;
      P.alpha(a);
      P.rect(s.x, 88 + i * 62, 560, 52, { fill: SURF, stroke: BORDER, sw: 1.3, radius: 6 });
      txt(s.x + 18, 114 + i * 62, 'Strategy ' + s.n, { size: 12, bold: true, color: ACC, base: 'middle' });
      txt(s.x + 108, 106 + i * 62, s.t, { size: 11, color: INK });
      txt(s.x + 108, 124 + i * 62, s.cond, { size: 10, color: DIM });
      txt(s.x + 520, 114 + i * 62, s.c + (s.c === 1 ? ' table' : ' tables'), {
        size: 13, bold: true, align: 'right', base: 'middle', color: VAL
      });
    });

    P.alpha(rv(t, sc.start + 16, 1.0));
    P.rect(320, 286, 560, 66, { fill: BADDIM, stroke: BAD, sw: 1.2, radius: 6 });
    note(336, 308, 'Strategy C is not safe when subclasses overlap:');
    note(336, 328, V.ISA_OVERLAP.persons + ' persons, one in both subclasses: ' +
      V.ISA_OVERLAP.C + ' rows against ' + V.ISA_OVERLAP.A + '.');

    P.alpha(rv(t, sc.start + 21, 1.0));
    note(70, 300, 'Generalisation is the same diagram', { size: 11 });
    note(70, 318, 'read bottom-up.', { size: 11 });
    note(70, 344, 'Aggregation treats a relationship', { size: 11 });
    note(70, 362, 'as an entity, so it can itself', { size: 11 });
    note(70, 380, 'take part in a relationship.', { size: 11 });
    P.alpha(1);
    txt(320, 400, 'GATE counts tables, so it always tells you which reading it wants.', { size: 12, bold: true, color: ACC });
  }

  /* ---------- scene 8: the mapping, run ---------- */
  function drawMap(t, sc) {
    sceneBase('The seven-step mapping, run on the library schema', 'six tables, computed by the model under the canvas');
    var steps = [
      '1  strong entity -> table, key underlined',
      '2  weak entity -> owner key + partial key',
      '3  1:1 -> foreign key on the total side',
      '4  1:N -> foreign key on the many side',
      '5  M:N -> its own table, both keys',
      '6  n-ary -> its own table, all keys',
      '7  multivalued -> its own table'
    ];
    steps.forEach(function (s, i) {
      var a = rv(t, sc.start + 1 + i * 1.6, 0.7);
      if (a <= 0) return;
      P.alpha(a);
      txt(28, 78 + i * 24, s, { size: 11, mono: true, color: i === 6 ? WARN : DIM });
    });

    P.alpha(rv(t, sc.start + 10, 1.0));
    var tabs = [
      { n: 'Reader', c: 'rid, name, street, city, pin', k: 'rid', x: 400, y: 70 },
      { n: 'Book', c: 'isbn, title, price', k: 'isbn', x: 400, y: 128 },
      { n: 'Branch', c: 'bid, bname, rid', k: 'bid', x: 400, y: 186 },
      { n: 'Copy', c: 'isbn, copy_no, condition, bid', k: 'isbn+copy_no', x: 400, y: 244 },
      { n: 'Borrows', c: 'rid, isbn, copy_no, since', k: 'all three', x: 400, y: 302 },
      { n: 'Reader_Phone', c: 'rid, phone', k: 'rid+phone', x: 400, y: 360 }
    ];
    tabs.forEach(function (b, i) {
      var a = rv(t, sc.start + 11 + i * 1.8, 0.8);
      if (a <= 0) return;
      P.alpha(a);
      P.rect(b.x, b.y, 470, 50, { fill: SURF, stroke: BORDER, sw: 1.3, radius: 6 });
      txt(b.x + 14, b.y + 18, b.n, { size: 12, bold: true, color: ACC });
      txt(b.x + 14, b.y + 36, b.c, { size: 10, mono: true, color: DIM });
      txt(b.x + 456, b.y + 25, 'key ' + b.k, { size: 9, mono: true, align: 'right', base: 'middle', color: FAINT });
    });

    P.alpha(rv(t, sc.start + 24, 1.0));
    P.rect(28, 250, 344, 86, { fill: ACCDIM, stroke: ACC, sw: 1.2, radius: 6 });
    note(44, 272, 'Keeps (1:N) and Manages (1:1) make no table:');
    note(44, 292, 'their keys land inside Copy and Branch.');
    note(44, 316, 'Six tables from four entities, three', { size: 10 });
    note(44, 332, 'relationships and one multivalued attribute.', { size: 10 });
    P.alpha(1);
    txt(28, 398, 'Rejoin: all ' + V.UNIVERSAL.length + ' rows recovered.', { size: 11, color: VAL });
    txt(28, 418, 'Folding keeps ' + V.WRONG.rows + ', loses ' + V.WRONG.lost + '.', { size: 11, color: BAD });
  }

  /* ---------- scene 9: past-paper table counts ---------- */
  function drawCount(t, sc) {
    sceneBase('"Minimum number of tables" is a computation, not a memory test', 'three past items, run through the same mapper');
    var items = [
      { y: 66, tag: 'GATE CSE 2015 Set 1, Q38', spec: 'E1-E2 m:n, E1-E3 1:n', n: V.PY.y2015.length,
        rows: V.PY.y2015.map(function (x) { return x.name + '(' + x.cols.join(',') + ')'; }) },
      { y: 186, tag: 'GATE CSE 2008, Q82', spec: 'M, P strong; N weak under P; R1 many-to-one from M', n: V.PY.y2008.length,
        rows: V.PY.y2008.map(function (x) { return x.name + '(' + x.cols.join(',') + ')'; }) },
      { y: 306, tag: 'GATE CSE 2005, Q15', spec: 'one 1:N and one M:N between the same two entities', n: V.PY.y2005.length,
        rows: V.PY.y2005.map(function (x) { return x.name + '(' + x.cols.join(',') + ')'; }) }
    ];
    items.forEach(function (it, i) {
      var a = rv(t, sc.start + 2 + i * 6, 0.9);
      if (a <= 0) return;
      P.alpha(a);
      P.rect(28, it.y, 844, 106, { fill: SURF, stroke: BORDER, sw: 1.3, radius: 7 });
      txt(44, it.y + 20, it.tag, { size: 11, bold: true, color: ACC });
      txt(44, it.y + 38, it.spec, { size: 10, color: DIM });
      txt(846, it.y + 24, it.n + ' tables', { size: 16, bold: true, align: 'right', color: VAL });
      it.rows.forEach(function (r, j) {
        txt(44, it.y + 58 + j * 14, r, { size: 9, mono: true, color: FAINT });
      });
    });

    P.alpha(rv(t, sc.start + 22, 1.0));
    txt(28, 430, 'Each key is reproduced by the model, not copied: 4, 3 and 3.', { size: 12, bold: true, color: INK });
  }

  /* ---------- scene 10: the procedure ---------- */
  function drawProc(t, sc) {
    sceneBase('The procedure, and the five places it goes wrong', 'run these in order on every ER question');
    var steps = [
      { n: '1', h: 'Read the participation', d: 'single line partial, double line total' },
      { n: '2', h: 'Read the cardinality', d: '1:1, 1:N, M:N, and which side is which' },
      { n: '3', h: 'Look for a weak entity', d: 'double rectangle, partial key, owner' },
      { n: '4', h: 'Look for multivalued and ISA', d: 'each forces or changes a table' },
      { n: '5', h: 'Count, then justify each table', d: 'entity, weak, M:N, multivalued' }
    ];
    steps.forEach(function (s, i) {
      var a = rv(t, sc.start + 1 + i * 4, 0.8);
      if (a <= 0) return;
      P.alpha(a);
      P.circle(56, 88 + i * 56, 15, { fill: ACCDIM, stroke: ACC, sw: 1.4 });
      txt(56, 88 + i * 56, s.n, { size: 13, bold: true, align: 'center', base: 'middle', color: ACC });
      txt(84, 82 + i * 56, s.h, { size: 12, bold: true, color: INK });
      txt(84, 100 + i * 56, s.d, { size: 10, color: DIM });
    });

    P.alpha(rv(t, sc.start + 16, 1.0));
    P.rect(360, 66, 512, 176, { fill: BADDIM, stroke: BAD, sw: 1.2, radius: 6 });
    heading(378, 90, 'Five traps', { size: 12, color: BAD });
    var traps = [
      'counting the identifying relationship as a table',
      'putting the foreign key on the one side of a 1:N',
      'merging a M:N relationship into an entity',
      'calling a multivalued attribute a column',
      'assuming an ISA mapping without its conditions'
    ];
    traps.forEach(function (s, i) {
      var at = rv(t, sc.start + 18 + i * 1.8, 0.7);
      if (at <= 0) return;
      P.alpha(at);
      txt(378, 116 + i * 24, '\u2014 ' + s, { size: 11, color: INK });
    });

    P.alpha(rv(t, sc.start + 25, 1.0));
    note(360, 268, 'The model checks each of these: it maps every schema twice, once right and once wrong,');
    note(360, 288, 'and prints the row counts that the wrong mapping loses.');
    P.alpha(1);
    txt(360, 326, 'Minimum tables = strong entities + weak entities', { size: 11, mono: true, color: ACC });
    txt(360, 344, '                 + M:N relationships + multivalued attributes', { size: 11, mono: true, color: ACC });
    txt(360, 372, '6 = 3 + 1 + 1 + 1   for the library schema', { size: 12, mono: true, bold: true, color: INK });
    note(360, 398, 'Adjust only for the ISA strategy and for n-ary relationships.');
    txt(360, 428, 'Participation never changes the count. It changes nullability.', { size: 11, bold: true, color: WARN });
  }

  /* ---------- dispatch ---------- */

  var SCENE_DRAW = {
    ask: drawAsk,
    entity: drawEntity,
    rel: drawRel,
    card: drawCard,
    part: drawPart,
    weak: drawWeak,
    isa: drawIsa,
    map: drawMap,
    count: drawCount,
    proc: drawProc
  };

  function drawFrame(painter) {
    P = painter;
    if (!P) return;
    P.alpha(1);
    P.clear();
    var st = K.state, tl = window.LESSON_TIMELINE;
    if (!tl) return;
    var t = st.elapsed, scenes = tl.scenes, i = 0;
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

  window.__lessonChecks = CHECKS;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
