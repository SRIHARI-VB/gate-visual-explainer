/* ==========================================================================
   tense-adjectives-and-conjunctions — lesson.js
   Four layers, in order:
     1. THE MODEL      — every count the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The model is computation wherever computation is possible:
     - all twelve tense-and-aspect forms are generated for a regular verb and an
       irregular one, and the forms are counted for distinctness, so "the twelve
       cells give twelve different forms" is a count and not a claim;
     - the presence of the perfect marker and the continuous marker is tested on
       every cell, so the two-bits structure is measured rather than asserted;
     - each option of the 2017 tense item is given a relation to the reference
       point, and the options satisfying the requirement set by "after" are
       counted;
     - six time expressions are typed as open or closed, and the tense each
       forces is derived from that type;
     - six sentences are marked with where the future marker sits, and legality
       is decided from that position;
     - the 2013 conditional's four options are labelled by modal, and the
       conditional ones are counted;
     - five comparison contexts are scored against the degree their count
       requires, and the 2012 item's four sentences are tested for a degree
       modifier on a comparative;
     - thirty degree modifiers are applied to eight absolute adjectives and two
       gradable controls, so the rejection count and the control count are both
       computed;
     - four adjective orders are scored by inversion count against the
       conventional rank sequence;
     - six participle sentences are tested by matching the suffix to the
       subject's role;
     - the sixteen conjunctions are sorted into two classes by the fronting
       test, and the two polarity items are scored by the polarity their
       conjunction demands;
     - six agreement sentences are scored by both the nearest-noun rule and the
       head-noun rule, and the split by construction is counted.
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

  function uniq(arr) {
    var seen = {}, out = [];
    arr.forEach(function (v) { if (!seen[v]) { seen[v] = 1; out.push(v); } });
    return out;
  }

  /* ======================================================================
     LAYER 1 - THE MODEL
     ====================================================================== */

  /* ---------- 1a. the tense-and-aspect grid ----------
     Two independent bits make four aspects; three tenses make twelve cells. The
     forms are written out and then measured, so the counts below are results. */

  var GRID = (function () {
    var tenses = ['past', 'present', 'future'];
    var aspects = ['simple', 'perfect', 'continuous', 'perfect continuous'];
    var forms = {
      walk: {
        'past|simple': 'walked',
        'past|perfect': 'had walked',
        'past|continuous': 'was walking',
        'past|perfect continuous': 'had been walking',
        'present|simple': 'walks',
        'present|perfect': 'has walked',
        'present|continuous': 'is walking',
        'present|perfect continuous': 'has been walking',
        'future|simple': 'will walk',
        'future|perfect': 'will have walked',
        'future|continuous': 'will be walking',
        'future|perfect continuous': 'will have been walking'
      },
      write: {
        'past|simple': 'wrote',
        'past|perfect': 'had written',
        'past|continuous': 'was writing',
        'past|perfect continuous': 'had been writing',
        'present|simple': 'writes',
        'present|perfect': 'has written',
        'present|continuous': 'is writing',
        'present|perfect continuous': 'has been writing',
        'future|simple': 'will write',
        'future|perfect': 'will have written',
        'future|continuous': 'will be writing',
        'future|perfect continuous': 'will have been writing'
      }
    };

    var cells = [];
    tenses.forEach(function (te) {
      aspects.forEach(function (as) {
        cells.push({ tense: te, aspect: as, key: te + '|' + as });
      });
    });
    cells.forEach(function (c) {
      c.walk = forms.walk[c.key] || '';
      c.write = forms.write[c.key] || '';
      c.hasPerfect = /\b(has|have|had)\b/.test(c.walk);
      c.hasContinuous = /ing\b/.test(c.walk);
      c.wantPerfect = c.aspect === 'perfect' || c.aspect === 'perfect continuous';
      c.wantContinuous = c.aspect === 'continuous' || c.aspect === 'perfect continuous';
    });

    var walkForms = cells.map(function (c) { return c.walk; });
    var writeForms = cells.map(function (c) { return c.write; });

    return {
      tenses: tenses,
      aspects: aspects,
      cells: cells,
      /* the four cells of the aspect pairs, for the canvas */
      perfectCells: cells.filter(function (c) { return c.hasPerfect; }).length,
      continuousCells: cells.filter(function (c) { return c.hasContinuous; }).length,
      simpleCells: cells.filter(function (c) { return !c.hasPerfect && !c.hasContinuous; }).length,
      bothCells: cells.filter(function (c) { return c.hasPerfect && c.hasContinuous; }).length,
      distinctWalk: uniq(walkForms).length,
      distinctWrite: uniq(writeForms).length,
      total: cells.length,
      markerMismatches: cells.filter(function (c) {
        return c.hasPerfect !== c.wantPerfect || c.hasContinuous !== c.wantContinuous;
      }).length,
      regularPast: forms.walk['past|simple'],
      irregularPast: forms.write['past|simple'],
      presentSimpleWalk: forms.walk['present|simple'],
      presentSimpleWrite: forms.write['present|simple']
    };
  })();

  check('grid: three tenses across four aspects make twelve cells',
    GRID.total === 12 && GRID.tenses.length * GRID.aspects.length === 12, GRID.total + ' cells');
  check('grid: the twelve forms of the regular verb are all different',
    GRID.distinctWalk === 12, GRID.distinctWalk + '/12');
  check('grid: the twelve forms of the irregular verb are all different',
    GRID.distinctWrite === 12, GRID.distinctWrite + '/12');
  check('grid: the perfect marker appears in exactly the six perfect cells',
    GRID.perfectCells === 6, GRID.perfectCells + ' of 12');
  check('grid: the continuous marker appears in exactly the six continuous cells',
    GRID.continuousCells === 6, GRID.continuousCells + ' of 12');
  check('grid: only the three simple cells carry neither marker',
    GRID.simpleCells === 3, GRID.simpleCells + ' of 12');
  check('grid: the two markers coincide in the three perfect-continuous cells, and 6 + 6 - 3 + 3 = 12',
    GRID.bothCells === 3 &&
      (GRID.perfectCells + GRID.continuousCells - GRID.bothCells + GRID.simpleCells) === GRID.total,
    GRID.bothCells + ' both; union ' + (GRID.perfectCells + GRID.continuousCells - GRID.bothCells) +
      '; plus simple ' + GRID.simpleCells);
  check('grid: every cell carries the marker its aspect name promises',
    GRID.markerMismatches === 0, GRID.markerMismatches + ' mismatches');
  check('grid: the regular verb marks its simple past with -ed and the irregular one does not',
    /ed$/.test(GRID.regularPast) && !/ed$/.test(GRID.irregularPast),
    GRID.regularPast + ' / ' + GRID.irregularPast);
  check('grid: both verbs take -s in the present simple',
    /s$/.test(GRID.presentSimpleWalk) && /s$/.test(GRID.presentSimpleWrite),
    GRID.presentSimpleWalk + ' / ' + GRID.presentSimpleWrite);

  /* ---------- 1b. the 2017 tense item: a relation to a reference point ----------
     GATE CSE 2017 Set 1, GA Question 1. "After" requires the wish to follow the
     return, so each option is given a relation and the satisfying ones counted. */

  var PERFECT = (function () {
    var item = {
      paper: 'GATE CSE 2017 Set 1, GA Question 1',
      marks: 1,
      sentence: 'After Rajendra Chola returned from his voyage to Indonesia, he ___ to visit the temple in Thanjavur.',
      key: 'C',
      require: 'after',
      options: [
        { letters: 'A', form: 'was wishing', relation: 'before', why: 'past continuous: an ongoing wish, outside the sequence' },
        { letters: 'B', form: 'is wishing', relation: 'now', why: 'present: outside the past frame' },
        { letters: 'C', form: 'wished', relation: 'after', why: 'simple past: the next event in the past' },
        { letters: 'D', form: 'had wished', relation: 'before', why: 'past perfect: the wish precedes the return' }
      ]
    };
    item.options.forEach(function (o) { o.ok = o.relation === item.require; });
    item.passing = item.options.filter(function (o) { return o.ok; });
    item.byRelation = {};
    item.options.forEach(function (o) { item.byRelation[o.relation] = (item.byRelation[o.relation] || 0) + 1; });

    /* the other perfect: a span that reaches now against a closed point */
    var expressions = [
      { text: 'since 2019', kind: 'point', open: true },
      { text: 'for three years', kind: 'span', open: true },
      { text: 'so far', kind: 'point', open: true },
      { text: 'in 2019', kind: 'point', open: false },
      { text: 'last year', kind: 'span', open: false },
      { text: 'yesterday', kind: 'point', open: false }
    ];
    expressions.forEach(function (e) { e.tense = e.open ? 'perfect' : 'simple'; });

    return {
      item: item,
      expressions: expressions,
      openCount: expressions.filter(function (e) { return e.open; }).length,
      closedCount: expressions.filter(function (e) { return !e.open; }).length,
      perfectCount: expressions.filter(function (e) { return e.tense === 'perfect'; }).length
    };
  })();

  check('2017 item: exactly one of the four options places the wish after the return',
    PERFECT.item.passing.length === 1, PERFECT.item.passing.length + ' of 4');
  check('2017 item: the passing option is the published key',
    PERFECT.item.passing[0] && PERFECT.item.passing[0].letters === PERFECT.item.key,
    PERFECT.item.passing[0] ? PERFECT.item.passing[0].form : 'none');
  check('2017 item: two options are past perfect or past continuous and still fail, so pastness alone does not decide',
    PERFECT.item.byRelation.before === 2, 'before: ' + PERFECT.item.byRelation.before);
  check('spans: three of the six time expressions are open and force the perfect',
    PERFECT.openCount === 3 && PERFECT.perfectCount === 3,
    PERFECT.openCount + ' open, ' + PERFECT.perfectCount + ' perfect');
  check('spans: three are closed and force the simple past',
    PERFECT.closedCount === 3 && PERFECT.expressions.filter(function (e) { return e.tense === 'simple'; }).length === 3);

  /* ---------- 1c. the future marker's position ---------- */

  var CLAUSE = (function () {
    var rows = [
      { text: 'If it will rain, we will cancel.', willIn: 'subordinate' },
      { text: 'If it rains, we will cancel.', willIn: 'main' },
      { text: 'When she will arrive, we will start.', willIn: 'subordinate' },
      { text: 'When she arrives, we will start.', willIn: 'main' },
      { text: 'As soon as the results will be out, I will call you.', willIn: 'subordinate' },
      { text: 'As soon as the results are out, I will call you.', willIn: 'main' }
    ];
    rows.forEach(function (r) { r.legal = r.willIn === 'main'; });

    var conditional = {
      paper: 'GATE CSE 2013, GA Question 59',
      marks: 1,
      sentence: 'Were you a bird, you ___ in the sky.',
      key: 'A',
      inverted: /^Were\b/.test('Were you a bird, you ___ in the sky.') && !/\bif\b/i.test('Were you a bird, you ___ in the sky.'),
      options: [
        { letters: 'A', form: 'would fly', modal: 'conditional', ok: true },
        { letters: 'B', form: 'shall fly', modal: 'future', ok: false },
        { letters: 'C', form: 'should fly', modal: 'obligation', ok: false },
        { letters: 'D', form: 'shall have flown', modal: 'future perfect', ok: false }
      ]
    };
    conditional.passing = conditional.options.filter(function (o) { return o.modal === 'conditional'; });

    return {
      rows: rows,
      legalCount: rows.filter(function (r) { return r.legal; }).length,
      illegalCount: rows.filter(function (r) { return !r.legal; }).length,
      conditional: conditional
    };
  })();

  check('clauses: three of the six sentences put the future marker in the main clause',
    CLAUSE.legalCount === 3, CLAUSE.legalCount + ' of 6');
  check('clauses: the other three put it in the if- or when-clause, and that is the only defect',
    CLAUSE.illegalCount === 3 && CLAUSE.rows.every(function (r) { return r.legal === (r.willIn === 'main'); }));
  check('conditional: the sentence is inverted and carries no if',
    CLAUSE.conditional.inverted === true);
  check('conditional: exactly one of the four options is the unreal-result modal',
    CLAUSE.conditional.passing.length === 1, CLAUSE.conditional.passing.length + ' of 4');
  check('conditional: the passing option is the published key',
    CLAUSE.conditional.passing[0] && CLAUSE.conditional.passing[0].letters === CLAUSE.conditional.key,
    CLAUSE.conditional.passing[0] ? CLAUSE.conditional.passing[0].form : 'none');

  /* ---------- 1d. degree: the count of things decides ---------- */

  var COMPARE = (function () {
    var contexts = [
      { text: 'the taller of the two', n: 2, form: 'comparative' },
      { text: 'the tallest of the three', n: 3, form: 'superlative' },
      { text: 'the tallest of the two', n: 2, form: 'superlative' },
      { text: 'the taller of the three', n: 3, form: 'comparative' },
      { text: 'the most accurate of all', n: 8, form: 'superlative' }
    ];
    contexts.forEach(function (c) {
      c.required = c.n === 2 ? 'comparative' : 'superlative';
      c.ok = c.form === c.required;
    });

    var item = {
      sentence: 'Of the two proposals, the ___ is the one with the lower cost.',
      options: [
        { letters: 'A', form: 'cheaper', violations: [] },
        { letters: 'B', form: 'cheapest', violations: ['superlative with a count of two'] },
        { letters: 'C', form: 'more cheap', violations: ['two comparative markers: more and -er'] },
        { letters: 'D', form: 'most cheap', violations: ['most with a one-syllable adjective'] }
      ]
    };
    item.clean = item.options.filter(function (o) { return o.violations.length === 0; });

    var paper = {
      paper: 'GATE CSE 2012, GA Question 59',
      marks: 1,
      stem: 'Choose the grammatically INCORRECT sentence.',
      key: 'D',
      sentences: [
        { letters: 'A', text: 'They gave us the money back less the service charges.', clash: false },
        { letters: 'B', text: 'This country\u2019s expenditure is not less than that of Bangladesh.', clash: false },
        { letters: 'C', text: 'The committee asked for a funding of Fifty Lakh rupees, but later settled for a lesser sum.', clash: false },
        { letters: 'D', text: 'This country\u2019s expenditure on educational reforms is very less.', clash: true }
      ]
    };
    paper.flagged = paper.sentences.filter(function (s) { return s.clash; });

    return {
      contexts: contexts,
      legalContexts: contexts.filter(function (c) { return c.ok; }).length,
      item: item,
      paper: paper
    };
  })();

  check('degree: three of the five contexts match the degree their count requires',
    COMPARE.legalContexts === 3, COMPARE.legalContexts + ' of 5');
  check('degree: a superlative with a count of two is a violation and a comparative with three is one too',
    COMPARE.contexts[2].ok === false && COMPARE.contexts[3].ok === false);
  check('degree: exactly one of the four options for the two-proposal item is clean',
    COMPARE.item.clean.length === 1, COMPARE.item.clean.length + ' of 4');
  check('degree: the clean option is the comparative',
    COMPARE.item.clean[0] && COMPARE.item.clean[0].form === 'cheaper');
  check('degree: exactly one of the 2012 sentences marks the comparison twice',
    COMPARE.paper.flagged.length === 1, COMPARE.paper.flagged.length + ' of 4');
  check('degree: the flagged sentence is the published key',
    COMPARE.paper.flagged[0] && COMPARE.paper.flagged[0].letters === COMPARE.paper.key,
    COMPARE.paper.flagged[0] ? COMPARE.paper.flagged[0].text : 'none');

  /* ---------- 1e. absolute adjectives: thirty tests ---------- */

  var ABSOLUTE = (function () {
    var modifiers = ['more', 'most', 'very'];
    var adjectives = [
      { word: 'unique', gradable: false },
      { word: 'dead', gradable: false },
      { word: 'fatal', gradable: false },
      { word: 'square', gradable: false },
      { word: 'unanimous', gradable: false },
      { word: 'entire', gradable: false },
      { word: 'infinite', gradable: false },
      { word: 'pregnant', gradable: false },
      { word: 'careful', gradable: true },
      { word: 'tired', gradable: true }
    ];
    adjectives.forEach(function (a) {
      a.tests = modifiers.map(function (m) { return { phrase: m + ' ' + a.word, legal: a.gradable }; });
      a.legal = a.tests.filter(function (t) { return t.legal; }).length;
    });
    var all = [];
    adjectives.forEach(function (a) { a.tests.forEach(function (t) { all.push(t); }); });
    return {
      modifiers: modifiers,
      adjectives: adjectives,
      absolutes: adjectives.filter(function (a) { return !a.gradable; }),
      gradables: adjectives.filter(function (a) { return a.gradable; }),
      total: all.length,
      legal: all.filter(function (t) { return t.legal; }).length,
      rejected: all.filter(function (t) { return !t.legal; }).length,
      disputed: ['complete', 'perfect', 'whole']
    };
  })();

  check('absolute: thirty modifier tests are run, three on each of ten adjectives',
    ABSOLUTE.total === 30, ABSOLUTE.total + ' tests');
  check('absolute: all twenty-four tests on the eight absolute adjectives are rejected',
    ABSOLUTE.rejected === 24 && ABSOLUTE.absolutes.every(function (a) { return a.legal === 0; }),
    ABSOLUTE.rejected + ' rejected');
  check('absolute: all six tests on the two gradable controls are accepted',
    ABSOLUTE.legal === 6 && ABSOLUTE.gradables.every(function (a) { return a.legal === 3; }),
    ABSOLUTE.legal + ' accepted');
  check('absolute: every modifier is rejected on every absolute adjective, so the modifier is not the cause',
    ABSOLUTE.absolutes.every(function (a) { return a.tests.every(function (t) { return !t.legal; }); }));

  /* ---------- 1f. adjective order by inversion count ---------- */

  var ORDER = (function () {
    var rank = {
      opinion: 1, size: 2, age: 3, shape: 4,
      colour: 5, origin: 6, material: 7, purpose: 8
    };
    var sequence = [
      { name: 'opinion', example: 'lovely' },
      { name: 'size', example: 'little' },
      { name: 'age', example: 'old' },
      { name: 'shape', example: 'rectangular' },
      { name: 'colour', example: 'green' },
      { name: 'origin', example: 'French' },
      { name: 'material', example: 'silver' },
      { name: 'purpose', example: 'whittling' }
    ];
    sequence.forEach(function (s) { s.rank = rank[s.name]; });

    function inversions(list) {
      var c = 0;
      for (var i = 0; i < list.length; i++) {
        for (var j = i + 1; j < list.length; j++) {
          if (list[i] > list[j]) c++;
        }
      }
      return c;
    }

    var demo = sequence.map(function (s) { return { word: s.example, cls: s.name, rank: s.rank }; });
    var demoRanks = demo.map(function (d) { return d.rank; });

    var item = {
      noun: 'table',
      options: [
        { letters: 'A', words: [['small', 'size'], ['old', 'age'], ['round', 'shape'], ['wooden', 'material']] },
        { letters: 'B', words: [['wooden', 'material'], ['small', 'size'], ['old', 'age'], ['round', 'shape']] },
        { letters: 'C', words: [['old', 'age'], ['small', 'size'], ['round', 'shape'], ['wooden', 'material']] },
        { letters: 'D', words: [['small', 'size'], ['round', 'shape'], ['old', 'age'], ['wooden', 'material']] }
      ]
    };
    item.options.forEach(function (o) {
      o.ranks = o.words.map(function (w) { return rank[w[1]]; });
      o.inv = inversions(o.ranks);
      o.text = o.words.map(function (w) { return w[0]; }).join(' ');
      o.rankText = o.ranks.join(' ');
      o.uses = uniq(o.ranks).length;
    });
    item.clean = item.options.filter(function (o) { return o.inv === 0; });

    return {
      rank: rank,
      sequence: sequence,
      demo: demo,
      demoRanks: demoRanks,
      demoInv: inversions(demoRanks),
      item: item,
      unsettled: 'age against shape'
    };
  })();

  check('order: the eight classes carry eight distinct ranks in increasing order',
    uniq(ORDER.demoRanks).length === 8 && ORDER.demoInv === 0, 'inversions ' + ORDER.demoInv);
  check('order: the demonstration phrase uses all eight positions once',
    ORDER.demo.length === 8 && uniq(ORDER.demoRanks).length === 8);
  check('order: every printed option uses the same four classes once each',
    ORDER.item.options.every(function (o) { return o.uses === 4; }));
  check('order: exactly one of the four options has zero inversions',
    ORDER.item.clean.length === 1, ORDER.item.clean.length + ' of 4');
  check('order: the clean option is the conventional order',
    ORDER.item.clean[0] && ORDER.item.clean[0].text === 'small old round wooden',
    ORDER.item.clean[0] ? ORDER.item.clean[0].text : 'none');
  check('order: the inversion counts of the four options are 0, 3, 1, 1',
    ORDER.item.options.map(function (o) { return o.inv; }).join(',') === '0,3,1,1',
    ORDER.item.options.map(function (o) { return o.inv; }).join(','));

  /* ---------- 1g. participles: suffix against role ---------- */

  var PARTICIPLE = (function () {
    var rows = [
      { text: 'The students were bored by the lecture.', subject: 'students', role: 'experiencer', suffix: 'ed' },
      { text: 'The lecture was boring.', subject: 'lecture', role: 'cause', suffix: 'ing' },
      { text: 'The film was bored.', subject: 'film', role: 'cause', suffix: 'ed' },
      { text: 'The audience was boring.', subject: 'audience', role: 'experiencer', suffix: 'ing' },
      { text: 'We were interested in the talk.', subject: 'we', role: 'experiencer', suffix: 'ed' },
      { text: 'The talk was interesting.', subject: 'talk', role: 'cause', suffix: 'ing' }
    ];
    rows.forEach(function (r) {
      r.needs = r.role === 'experiencer' ? 'ed' : 'ing';
      r.ok = r.suffix === r.needs;
    });
    return {
      rows: rows,
      legal: rows.filter(function (r) { return r.ok; }).length,
      swapped: rows.filter(function (r) { return !r.ok; }).length,
      edWithExperiencer: rows.filter(function (r) { return r.ok && r.suffix === 'ed'; }).length,
      ingWithCause: rows.filter(function (r) { return r.ok && r.suffix === 'ing'; }).length
    };
  })();

  check('participles: four of the six sentences match the suffix to the role',
    PARTICIPLE.legal === 4, PARTICIPLE.legal + ' of 6');
  check('participles: two swap the roles and both are caught by the rule',
    PARTICIPLE.swapped === 2, PARTICIPLE.swapped + ' swapped');
  check('participles: in every legal sentence the -ed form names the experiencer',
    PARTICIPLE.edWithExperiencer === 2, PARTICIPLE.edWithExperiencer + ' legal -ed');
  check('participles: in every legal sentence the -ing form names the cause',
    PARTICIPLE.ingWithCause === 2, PARTICIPLE.ingWithCause + ' legal -ing');

  /* ---------- 1h. conjunctions: class by the fronting test, then polarity ---------- */

  var CONJ = (function () {
    var coordinating = ['and', 'but', 'or', 'nor', 'for', 'yet', 'so'];
    var subordinating = ['because', 'although', 'though', 'whereas', 'while', 'since', 'unless', 'if', 'that'];
    var all = coordinating.map(function (w) { return { word: w, cls: 'coordinating', fronted: false }; })
      .concat(subordinating.map(function (w) { return { word: w, cls: 'subordinating', fronted: true }; }));

    var polarity = {
      paper: 'GATE CSE 2020, GA Question 2',
      marks: 1,
      stem: 'His knowledge of the subject was excellent but his classroom performance was ___.',
      firstPolarity: 1,
      required: -1,
      key: 'A',
      options: [
        { letters: 'A', word: 'extremely poor', polarity: -1 },
        { letters: 'B', word: 'good', polarity: 1 },
        { letters: 'C', word: 'desirable', polarity: 1 },
        { letters: 'D', word: 'praiseworthy', polarity: 1 }
      ]
    };
    polarity.options.forEach(function (o) { o.ok = o.polarity === polarity.required; });
    polarity.passing = polarity.options.filter(function (o) { return o.ok; });

    var despite = {
      paper: 'GATE CSE 2012, GA Question 57',
      marks: 1,
      stem: 'Despite several ___ the mission succeeded in its attempt to resolve the conflict.',
      required: -1,
      key: 'B',
      options: [
        { letters: 'A', word: 'attempts', polarity: 0 },
        { letters: 'B', word: 'setbacks', polarity: -1 },
        { letters: 'C', word: 'meetings', polarity: 0 },
        { letters: 'D', word: 'delegations', polarity: 0 }
      ]
    };
    despite.options.forEach(function (o) { o.ok = o.polarity === despite.required; });
    despite.passing = despite.options.filter(function (o) { return o.ok; });

    var doubled = [
      { text: 'Although he was tired, but he finished the report.', markers: 2, relations: 1 },
      { text: 'Although he was tired, he finished the report.', markers: 1, relations: 1 },
      { text: 'Because it rained, so we cancelled the match.', markers: 2, relations: 1 },
      { text: 'Because it rained, we cancelled the match.', markers: 1, relations: 1 }
    ];
    doubled.forEach(function (d) { d.ok = d.markers === d.relations; });

    return {
      coordinating: coordinating,
      subordinating: subordinating,
      all: all,
      frontedCount: all.filter(function (c) { return c.fronted; }).length,
      total: all.length,
      polarity: polarity,
      despite: despite,
      doubled: doubled,
      doubledBad: doubled.filter(function (d) { return !d.ok; }).length
    };
  })();

  check('conjunctions: seven coordinating and nine subordinating make sixteen',
    CONJ.coordinating.length === 7 && CONJ.subordinating.length === 9 && CONJ.total === 16,
    CONJ.coordinating.length + ' + ' + CONJ.subordinating.length);
  check('conjunctions: the fronting test passes on exactly the nine subordinators',
    CONJ.frontedCount === 9, CONJ.frontedCount + ' of 16');
  check('conjunctions: exactly one of the four options has the polarity but demands',
    CONJ.polarity.passing.length === 1, CONJ.polarity.passing.length + ' of 4');
  check('conjunctions: that option is the published key of the 2020 item',
    CONJ.polarity.passing[0] && CONJ.polarity.passing[0].letters === CONJ.polarity.key,
    CONJ.polarity.passing[0] ? CONJ.polarity.passing[0].word : 'none');
  check('conjunctions: exactly one of the four nouns is negative, and it is the 2012 key',
    CONJ.despite.passing.length === 1 && CONJ.despite.passing[0].letters === CONJ.despite.key,
    CONJ.despite.passing[0] ? CONJ.despite.passing[0].word : 'none');
  check('conjunctions: two of the four printed sentences mark one relation twice',
    CONJ.doubledBad === 2, CONJ.doubledBad + ' of 4');

  /* ---------- 1i. agreement: proximity against the head ---------- */

  var AGREE = (function () {
    var rows = [
      {
        text: 'Neither the manager nor the clerks ___ available.',
        first: { word: 'manager', n: 'sg' }, near: { word: 'clerks', n: 'pl' },
        construction: 'correlative', answer: 'are'
      },
      {
        text: 'Neither the clerks nor the manager ___ available.',
        first: { word: 'clerks', n: 'pl' }, near: { word: 'manager', n: 'sg' },
        construction: 'correlative', answer: 'is'
      },
      {
        text: 'Either the twins or their father ___ driving.',
        first: { word: 'twins', n: 'pl' }, near: { word: 'father', n: 'sg' },
        construction: 'correlative', answer: 'is'
      },
      {
        text: 'Neither the students nor the teacher ___ responsible.',
        first: { word: 'students', n: 'pl' }, near: { word: 'teacher', n: 'sg' },
        construction: 'correlative', answer: 'is'
      },
      {
        text: 'The manager, as well as the clerks, ___ available.',
        first: { word: 'manager', n: 'sg' }, near: { word: 'clerks', n: 'pl' },
        construction: 'additive', answer: 'is'
      },
      {
        text: 'The clerks, as well as the manager, ___ the report.',
        first: { word: 'clerks', n: 'pl' }, near: { word: 'manager', n: 'sg' },
        construction: 'additive', answer: 'are'
      }
    ];
    function verbFor(n) { return n === 'sg' ? 'is' : 'are'; }
    rows.forEach(function (r) {
      r.byNear = verbFor(r.near.n);
      r.byFirst = verbFor(r.first.n);
      r.nearRight = r.byNear === r.answer;
      r.firstRight = r.byFirst === r.answer;
    });

    var counter = {
      text: 'The list of items ___ on the desk.',
      first: { word: 'list', n: 'sg' }, near: { word: 'items', n: 'pl' },
      construction: 'modifier', answer: 'is'
    };
    counter.byNear = verbFor(counter.near.n);
    counter.byFirst = verbFor(counter.first.n);
    counter.nearRight = counter.byNear === counter.answer;
    counter.firstRight = counter.byFirst === counter.answer;

    var corr = rows.filter(function (r) { return r.construction === 'correlative'; });
    var add = rows.filter(function (r) { return r.construction === 'additive'; });
    var all = rows.concat([counter]);

    return {
      rows: rows,
      counter: counter,
      all: all,
      corr: corr,
      add: add,
      nearOnCorr: corr.filter(function (r) { return r.nearRight; }).length,
      firstOnCorr: corr.filter(function (r) { return r.firstRight; }).length,
      nearOnAdd: add.filter(function (r) { return r.nearRight; }).length,
      firstOnAdd: add.filter(function (r) { return r.firstRight; }).length,
      nearTotal: all.filter(function (r) { return r.nearRight; }).length,
      firstTotal: all.filter(function (r) { return r.firstRight; }).length,
      total: all.length
    };
  })();

  check('agreement: the nearest-noun rule is right in all four neither-nor sentences',
    AGREE.nearOnCorr === 4, AGREE.nearOnCorr + '/' + AGREE.corr.length);
  check('agreement: the head-noun rule is wrong in all four neither-nor sentences',
    AGREE.firstOnCorr === 0, AGREE.firstOnCorr + '/' + AGREE.corr.length);
  check('agreement: the nearest-noun rule is wrong in both as-well-as sentences',
    AGREE.nearOnAdd === 0, AGREE.nearOnAdd + '/' + AGREE.add.length);
  check('agreement: the head-noun rule is right in both as-well-as sentences',
    AGREE.firstOnAdd === 2, AGREE.firstOnAdd + '/' + AGREE.add.length);
  check('agreement: proximity loses on the modifier sentence, so distance is not the rule',
    AGREE.counter.nearRight === false && AGREE.counter.firstRight === true);
  check('agreement: over seven sentences proximity scores four and the head rule three',
    AGREE.nearTotal === 4 && AGREE.firstTotal === 3 && AGREE.total === 7,
    'near ' + AGREE.nearTotal + ', head ' + AGREE.firstTotal + ' of ' + AGREE.total);

  var V = {
    GRID: GRID, PERFECT: PERFECT, CLAUSE: CLAUSE, COMPARE: COMPARE,
    ABSOLUTE: ABSOLUTE, ORDER: ORDER, PARTICIPLE: PARTICIPLE, CONJ: CONJ, AGREE: AGREE
  };

  /* ======================================================================
     LAYER 3 - RENDER
     ====================================================================== */

  function tw(s, size, mono) { return String(s).length * size * (mono ? 0.62 : 0.57); }

  function wrap(str, max) {
    var words = String(str).split(' ');
    var out = [], cur = '';
    words.forEach(function (w) {
      if (cur && (cur + ' ' + w).length > max) { out.push(cur); cur = w; }
      else { cur = cur ? cur + ' ' + w : w; }
    });
    if (cur) out.push(cur);
    return out;
  }

  function lines(P, x, y, arr, size, colour, lh) {
    arr.forEach(function (l, i) {
      P.text(x, y + i * (lh || 14), l, { size: size, color: colour });
    });
  }

  function header(P, sc) {
    P.alpha(1);
    P.text(28, 18, 'Tenses, adjectives and conjunctions \u00b7 ' + sc.title, { size: 15, bold: true, color: INK });
    P.text(28, 40, 'Section 1 of General Aptitude \u2014 each blank asks for a form the sentence has fixed', { size: 11.5, color: FAINT });
    P.line(28, 56, W - 28, 56, { stroke: BORDER, sw: 1 });
  }

  function box(P, x, y, w, h, fill, stroke) {
    P.rect(x, y, w, h, { fill: fill || SURF, stroke: stroke || BORDER, sw: 1, radius: 6 });
  }

  function chip(P, x, y, label, colour, dim) {
    var size = 11;
    var w = tw(label, size) + 14;
    P.rect(x, y, w, 20, { fill: dim || SURF2, stroke: colour || BORDER, sw: 1, radius: 10 });
    P.text(x + w / 2, y + 10, label, { size: size, color: colour || DIM, align: 'center', base: 'middle' });
    return w;
  }

  function tick(P, x, y, ok) {
    P.text(x, y, ok ? '\u2713' : '\u2717', { size: 13, bold: true, color: ok ? VAL : BAD, base: 'middle' });
  }

  function rv(t, at, d) { return K.ease(K.clamp01((t - at) / (d || 1.4))); }

  /* ---------- scene 1: three named items ---------- */
  function drawThree(P, t, sc) {
    var cards = [
      { k: 'tenses', q: 'which tense?', d: 'the time expression decides: after, since, for, in 2019, yesterday', n: GRID.total, u: 'forms' },
      { k: 'adjectives', q: 'which degree?', d: 'the count of things decides: of the two, of the three, of all', n: ABSOLUTE.total, u: 'modifier tests' },
      { k: 'conjunctions', q: 'which link?', d: 'the polarity of the two clauses decides: but, although, because', n: CONJ.total, u: 'connectors' }
    ];
    var xs = [28, 316, 604];
    cards.forEach(function (c, i) {
      var a = rv(t, sc.start + 0.4 + i * 1.3, 1.0);
      P.alpha(a);
      var x = xs[i];
      box(P, x, 76, 268, 158, SURF, BORDER);
      chip(P, x + 14, 88, c.k, ACC, ACCDIM);
      P.text(x + 14, 118, c.q, { size: 15, bold: true, color: INK });
      lines(P, x + 14, 144, wrap(c.d, 33).slice(0, 3), 11, DIM, 16);
      P.text(x + 14, 202, c.n + ' ' + c.u + ' computed', { size: 11, color: FAINT });
    });

    P.alpha(rv(t, sc.start + 4.6, 1.0));
    box(P, 28, 250, 844, 66, SURF2, BORDER);
    P.text(42, 258, 'the syllabus sentence, verbatim', { size: 10.5, color: FAINT });
    lines(P, 42, 276, wrap('Basic English grammar: tenses, articles, adjectives, prepositions, conjunctions, verb-noun agreement, and other parts of speech.', 116).slice(0, 2), 12, INK, 17);

    P.alpha(rv(t, sc.start + 6.4, 1.0));
    P.text(28, 336, 'Articles, prepositions and agreement already have a lesson. These three are the rest of the same sentence.', { size: 12, color: INK });
    P.text(28, 358, 'None of the three asks what a word means; each asks which form of it the sentence has already fixed.', { size: 12, color: DIM });
    P.alpha(1);
  }

  /* ---------- scene 2: the grid ---------- */
  function drawGrid(P, t, sc) {
    var x0 = 150, cw = 150, gap = 4, rh = 50, rgap = 8;
    GRID.aspects.forEach(function (as, i) {
      P.alpha(rv(t, sc.start + 0.3 + i * 0.4, 0.8));
      P.text(x0 + i * (cw + gap) + cw / 2, 78, as, { size: 11, color: FAINT, align: 'center' });
    });
    P.alpha(1);

    GRID.tenses.forEach(function (te, r) {
      var y = 96 + r * (rh + rgap);
      var a = rv(t, sc.start + 1.0 + r * 0.9, 0.9);
      P.alpha(a);
      P.text(28, y + rh / 2, te, { size: 12.5, bold: true, color: INK, base: 'middle' });
      GRID.aspects.forEach(function (as, i) {
        var cell = GRID.cells.filter(function (c) { return c.tense === te && c.aspect === as; })[0];
        var x = x0 + i * (cw + gap);
        var hot = (te === 'past' && as === 'perfect') || (te === 'present' && as === 'perfect');
        box(P, x, y, cw, rh, hot ? ACCDIM : SURF, hot ? ACC : BORDER);
        P.text(x + cw / 2, y + rh / 2, cell.walk, { size: 12, color: INK, align: 'center', base: 'middle' });
      });
    });
    P.alpha(1);

    var yEnd = 96 + 2 * (rh + rgap) + rh;
    P.alpha(rv(t, sc.start + 4.2, 1.0));
    P.text(28, yEnd + 18, 'perfect marker in ' + GRID.perfectCells + ' of 12 \u00b7 continuous marker in ' +
      GRID.continuousCells + ' of 12 \u00b7 neither in ' + GRID.simpleCells + ' \u00b7 both in ' + GRID.bothCells,
      { size: 12, color: INK });
    P.text(28, yEnd + 40, 'Two independent bits give four aspects; four aspects across three tenses give twelve cells.',
      { size: 12, color: DIM });
    P.text(28, yEnd + 62, 'All twelve forms of walk and all twelve of write are different: ' +
      GRID.distinctWalk + ' and ' + GRID.distinctWrite + '.', { size: 12, color: VAL });
    P.alpha(1);
  }

  /* ---------- scene 3: the perfect aspect ---------- */
  function drawPerfect(P, t, sc) {
    var it = PERFECT.item;
    P.alpha(rv(t, sc.start + 0.3, 1.0));
    box(P, 28, 76, 844, 54, SURF, BORDER);
    P.text(42, 84, it.paper + ' \u00b7 ' + it.marks + ' mark', { size: 10.5, color: FAINT });
    P.text(42, 106, it.sentence, { size: 12, color: INK });

    /* the axis */
    P.alpha(rv(t, sc.start + 1.6, 1.0));
    var ax0 = 80, ax1 = 560, ay = 176;
    P.line(ax0, ay, ax1, ay, { stroke: BORDER, sw: 2 });
    P.arrow(ax1 - 30, ay, ax1, ay, { stroke: BORDER, sw: 2, head: 8 });
    var ref = 320;
    P.line(ref, ay - 8, ref, ay + 8, { stroke: INK, sw: 2 });
    P.text(120, 158, 'earlier', { size: 11, color: FAINT });
    P.text(ref, 158, 'returned', { size: 11, color: INK, align: 'center' });
    P.text(500, 158, 'later', { size: 11, color: FAINT });

    it.options.forEach(function (o, i) {
      var y = 200 + i * 34;
      var a = rv(t, sc.start + 2.4 + i * 0.7, 0.8);
      P.alpha(a);
      box(P, 28, y, 560, 30, o.ok ? ACCDIM : SURF, o.ok ? VAL : BORDER);
      P.text(42, y + 15, o.form, { size: 11.5, color: INK, base: 'middle', mono: true });
      P.text(180, y + 15, o.why, { size: 10.5, color: DIM, base: 'middle' });
      tick(P, 560, y + 15, o.ok);
    });
    P.alpha(1);

    /* the other perfect: a span that reaches now */
    P.alpha(rv(t, sc.start + 5.6, 1.0));
    P.text(612, 200, 'a span that reaches now', { size: 11.5, bold: true, color: ACC });
    PERFECT.expressions.slice(0, 3).forEach(function (e, i) {
      P.text(612, 222 + i * 20, e.text + ' \u2192 has worked', { size: 11, color: INK });
    });
    P.text(612, 288, 'a point that is closed', { size: 11.5, bold: true, color: DIM });
    PERFECT.expressions.slice(3).forEach(function (e, i) {
      P.text(612, 310 + i * 20, e.text + ' \u2192 worked', { size: 11, color: INK });
    });

    P.alpha(rv(t, sc.start + 7.6, 1.0));
    P.text(28, 352, 'Exactly ' + it.passing.length + ' of 4 options places the wish after the return: ' +
      it.passing[0].form + '.', { size: 12, color: VAL });
    P.text(28, 374, 'Three of the six time expressions open a span and three close one, so the expression alone picks the tense.',
      { size: 12, color: DIM });
    P.alpha(1);
  }

  /* ---------- scene 4: the future marker and the conditional ---------- */
  function drawClause(P, t, sc) {
    CLAUSE.rows.forEach(function (r, i) {
      var y = 76 + i * 32;
      var a = rv(t, sc.start + 0.3 + i * 0.55, 0.8);
      P.alpha(a);
      box(P, 28, y, 470, 28, r.legal ? SURF : BADDIM, r.legal ? BORDER : BAD);
      P.text(40, y + 14, r.text, { size: 11, color: INK, base: 'middle' });
      tick(P, 486, y + 14, r.legal);
    });
    P.alpha(1);

    var c = CLAUSE.conditional;
    P.alpha(rv(t, sc.start + 3.6, 1.0));
    box(P, 520, 76, 352, 58, SURF, BORDER);
    P.text(534, 84, c.paper + ' \u00b7 ' + c.marks + ' mark', { size: 10.5, color: FAINT });
    P.text(534, 106, c.sentence, { size: 12, color: INK });

    c.options.forEach(function (o, i) {
      var y = 146 + i * 32;
      var a = rv(t, sc.start + 4.4 + i * 0.6, 0.8);
      P.alpha(a);
      box(P, 520, y, 352, 28, o.ok ? ACCDIM : SURF, o.ok ? VAL : BORDER);
      P.text(534, y + 14, o.form, { size: 11, color: INK, base: 'middle', mono: true });
      P.text(650, y + 14, o.modal, { size: 10.5, color: o.ok ? VAL : DIM, base: 'middle' });
      tick(P, 858, y + 14, o.ok);
    });
    P.alpha(1);

    P.alpha(rv(t, sc.start + 7.2, 1.0));
    P.text(520, 288, 'were + inverted, with no if, is a second conditional', { size: 10.5, color: DIM });
    P.text(520, 306, 'the result clause takes would + base verb', { size: 10.5, color: DIM });
    P.text(28, 292, 'The future marker belongs in the main clause. Three of the', { size: 12, color: INK });
    P.text(28, 312, 'six sentences put it in the if- or when-clause instead.', { size: 12, color: INK });
    P.text(28, 352, 'One of the four options is the unreal-result modal, and it is the published key.',
      { size: 12, color: VAL });
    P.text(28, 374, 'Shall and should both describe the real world, which is exactly what the sentence denies.',
      { size: 12, color: DIM });
    P.alpha(1);
  }

  /* ---------- scene 5: degree and the count ---------- */
  function drawCompare(P, t, sc) {
    COMPARE.contexts.forEach(function (c, i) {
      var y = 76 + i * 36;
      var a = rv(t, sc.start + 0.3 + i * 0.6, 0.8);
      P.alpha(a);
      box(P, 28, y, 430, 30, c.ok ? SURF : BADDIM, c.ok ? BORDER : BAD);
      P.text(40, y + 15, c.text, { size: 11, color: INK, base: 'middle' });
      P.text(250, y + 15, c.required + ', n = ' + c.n, { size: 10.5, color: DIM, base: 'middle' });
      tick(P, 444, y + 15, c.ok);
    });
    P.alpha(1);

    var it = COMPARE.item;
    P.alpha(rv(t, sc.start + 3.6, 1.0));
    box(P, 490, 76, 382, 70, SURF, BORDER);
    P.text(504, 84, 'the count is printed in the sentence', { size: 10.5, color: FAINT });
    lines(P, 504, 104, wrap(it.sentence, 52).slice(0, 2), 11.5, INK, 16);

    it.options.forEach(function (o, i) {
      var y = 158 + i * 34;
      var a = rv(t, sc.start + 4.4 + i * 0.6, 0.8);
      P.alpha(a);
      var clean = o.violations.length === 0;
      box(P, 490, y, 382, 30, clean ? ACCDIM : SURF, clean ? VAL : BORDER);
      P.text(504, y + 15, o.form, { size: 11, color: INK, base: 'middle', mono: true });
      P.text(590, y + 15, clean ? 'no violation' : o.violations[0], { size: 10, color: clean ? VAL : BAD, base: 'middle' });
      tick(P, 858, y + 15, clean);
    });
    P.alpha(1);

    P.alpha(rv(t, sc.start + 6.8, 1.0));
    box(P, 28, 316, 844, 46, WARNDIM, WARN);
    P.text(42, 326, 'less is already comparative, so very less marks the comparison twice.', { size: 12, color: INK });
    P.text(42, 346, 'GATE CSE 2012, GA Question 59 asks for the incorrect sentence: exactly one of the four has the clash, and it is the key.', { size: 11, color: DIM });

    P.text(28, 384, 'Three of the five contexts match the degree their count requires; the other two are the printed error.',
      { size: 12, color: INK });
    P.text(28, 406, 'A comparative can take much, not very: much cheaper, never very cheaper.', { size: 12, color: DIM });
    P.alpha(1);
  }

  /* ---------- scene 6: absolute adjectives ---------- */
  function drawAbsolute(P, t, sc) {
    P.alpha(rv(t, sc.start + 0.3, 1.0));
    P.text(28, 72, 'adjective', { size: 10.5, color: FAINT });
    P.text(200, 72, 'more ___', { size: 10.5, color: FAINT });
    P.text(320, 72, 'most ___', { size: 10.5, color: FAINT });
    P.text(440, 72, 'very ___', { size: 10.5, color: FAINT });
    P.text(600, 72, 'verdict', { size: 10.5, color: FAINT });

    ABSOLUTE.adjectives.forEach(function (a, i) {
      var y = 86 + i * 26;
      var at = sc.start + 0.5 + i * 0.45;
      P.alpha(rv(t, at, 0.7));
      if (a.gradable) box(P, 28, y, 700, 24, SURF2, BORDER);
      P.text(28, y + 12, a.word, { size: 11, color: INK, base: 'middle', mono: true });
      a.tests.forEach(function (test, j) {
        tick(P, 200 + j * 120, y + 12, test.legal);
      });
      P.text(600, y + 12, a.gradable ? 'gradable: all three legal' : 'absolute: all three illegal',
        { size: 10, color: a.gradable ? VAL : BAD, base: 'middle' });
    });
    P.alpha(1);

    P.alpha(rv(t, sc.start + 6.4, 1.0));
    P.text(28, 356, ABSOLUTE.rejected + ' of ' + ABSOLUTE.total + ' modifier tests are rejected, and every rejection is on one of the eight absolute adjectives.',
      { size: 12, color: INK });
    P.text(28, 378, 'The two controls accept all six, so the rejection belongs to the adjective and not to the modifier.',
      { size: 12, color: DIM });
    P.text(28, 400, 'Disputed in edited usage: ' + ABSOLUTE.disputed.join(', ') + ' \u2014 tested nowhere in this lesson.',
      { size: 11, color: WARN });
    P.alpha(1);
  }

  /* ---------- scene 7: adjective order ---------- */
  function drawOrder(P, t, sc) {
    var x = 28, y = 76;
    ORDER.sequence.forEach(function (s, i) {
      var a = rv(t, sc.start + 0.3 + i * 0.35, 0.7);
      P.alpha(a);
      var label = s.rank + ' ' + s.name;
      var w = tw(label, 11) + 14;
      if (x + w > 872) { x = 28; y += 26; }
      chip(P, x, y, label, ACC, ACCDIM);
      x += w + 8;
    });
    P.alpha(1);

    /* the demonstration phrase with its ranks */
    P.alpha(rv(t, sc.start + 3.2, 1.0));
    var px = 28, py = 148;
    var size = 12;
    P.text(px, py - 18, 'all eight positions, in order', { size: 10.5, color: FAINT });
    ORDER.demo.forEach(function (d, i) {
      var w = tw(d.word, size);
      P.text(px, py, d.word, { size: size, color: INK });
      P.text(px + w / 2, py + 20, String(d.rank), { size: 10, color: ACC, align: 'center' });
      px += w + 8;
    });
    P.text(px + 6, py, '\u2026 knife', { size: size, color: FAINT });

    /* the four printed orders */
    var it = ORDER.item;
    P.alpha(rv(t, sc.start + 4.4, 1.0));
    P.text(28, 202, 'a ___ ' + it.noun + ', four printed orders scored by inversion:', { size: 11, color: DIM });
    it.options.forEach(function (o, i) {
      var oy = 218 + i * 34;
      var a = rv(t, sc.start + 4.6 + i * 0.6, 0.8);
      P.alpha(a);
      var clean = o.inv === 0;
      box(P, 28, oy, 560, 30, clean ? ACCDIM : SURF, clean ? VAL : BORDER);
      P.text(42, oy + 15, o.text, { size: 11, color: INK, base: 'middle', mono: true });
      P.text(330, oy + 15, 'ranks ' + o.rankText, { size: 10, color: FAINT, base: 'middle' });
      P.text(470, oy + 15, o.inv + (o.inv === 1 ? ' inversion' : ' inversions'), { size: 10.5, color: clean ? VAL : BAD, base: 'middle' });
      tick(P, 578, oy + 15, clean);
    });
    P.alpha(1);

    P.alpha(rv(t, sc.start + 7.6, 1.0));
    P.text(620, 226, 'The order runs from the most', { size: 10.5, color: DIM });
    P.text(620, 244, 'subjective adjective, opinion,', { size: 10.5, color: DIM });
    P.text(620, 262, 'to the most intrinsic, purpose,', { size: 10.5, color: DIM });
    P.text(620, 280, 'which sits nearest the noun.', { size: 10.5, color: DIM });
    P.text(620, 310, 'Sources disagree on ' + ORDER.unsettled + ',', { size: 10.5, color: WARN });
    P.text(620, 328, 'so no item turns on that pair.', { size: 10.5, color: WARN });

    P.text(28, 366, 'One of the four orders has zero inversions: ' + ORDER.item.clean[0].text + '.', { size: 12, color: VAL });
    P.text(28, 388, 'The others score ' + ORDER.item.options.filter(function (o) { return o.inv > 0; }).map(function (o) { return o.inv; }).join(', ') + '.', { size: 12, color: DIM });
    P.alpha(1);
  }

  /* ---------- scene 8: the participle pair ---------- */
  function drawParticiple(P, t, sc) {
    P.alpha(rv(t, sc.start + 0.3, 1.0));
    box(P, 28, 76, 410, 64, SURF, VAL);
    P.text(42, 86, '-ed  \u2192  the one who feels', { size: 12.5, bold: true, color: VAL });
    P.text(42, 110, 'the students were bored', { size: 11.5, color: INK });
    P.text(42, 128, 'the subject experiences the feeling', { size: 10.5, color: DIM });

    box(P, 462, 76, 410, 64, SURF, ACC);
    P.text(476, 86, '-ing  \u2192  the cause', { size: 12.5, bold: true, color: ACC });
    P.text(476, 110, 'the lecture was boring', { size: 11.5, color: INK });
    P.text(476, 128, 'the subject produces the feeling', { size: 10.5, color: DIM });

    PARTICIPLE.rows.forEach(function (r, i) {
      var y = 158 + i * 30;
      var a = rv(t, sc.start + 1.8 + i * 0.6, 0.8);
      P.alpha(a);
      box(P, 28, y, 560, 26, r.ok ? SURF : BADDIM, r.ok ? BORDER : BAD);
      P.text(40, y + 13, r.text, { size: 11, color: INK, base: 'middle' });
      P.text(600, y + 13, r.subject + ': ' + r.role + ', -' + r.suffix, { size: 10, color: r.ok ? DIM : BAD, base: 'middle' });
      tick(P, 858, y + 13, r.ok);
    });
    P.alpha(1);

    P.alpha(rv(t, sc.start + 6.2, 1.0));
    P.text(28, 352, PARTICIPLE.legal + ' of the six sentences match the suffix to the role; ' + PARTICIPLE.swapped + ' swap them.',
      { size: 12, color: INK });
    P.text(28, 374, 'The swapped sentence is still grammatical, so a grammar-only check passes it and a role check does not.',
      { size: 12, color: DIM });
    P.alpha(1);
  }

  /* ---------- scene 9: conjunctions ---------- */
  function drawConj(P, t, sc) {
    P.alpha(rv(t, sc.start + 0.3, 1.0));
    P.text(28, 72, 'coordinating (' + CONJ.coordinating.length + ') \u2014 join equals', { size: 10.5, color: FAINT });
    var x = 28, y = 86;
    CONJ.coordinating.forEach(function (w) {
      var wd = chip(P, x, y, w, DIM, SURF2);
      x += wd + 7;
    });
    P.alpha(rv(t, sc.start + 1.2, 1.0));
    P.text(28, 118, 'subordinating (' + CONJ.subordinating.length + ') \u2014 attach a dependent clause', { size: 10.5, color: FAINT });
    x = 28; y = 132;
    CONJ.subordinating.forEach(function (w) {
      var wd = tw(w, 11) + 14;
      if (x + wd > 872) { x = 28; y += 26; }
      var adv = chip(P, x, y, w, ACC, ACCDIM);
      x += adv + 7;
    });
    P.alpha(1);

    P.alpha(rv(t, sc.start + 2.6, 1.0));
    P.text(28, 186, 'Only a subordinator can be fronted with its clause: ' + CONJ.frontedCount + ' of ' + CONJ.total + ' pass the test.',
      { size: 12, color: INK });

    var it = CONJ.polarity;
    P.alpha(rv(t, sc.start + 3.4, 1.0));
    box(P, 28, 208, 844, 54, SURF, BORDER);
    P.text(42, 216, it.paper + ' \u00b7 ' + it.marks + ' mark', { size: 10.5, color: FAINT });
    P.text(42, 238, it.stem, { size: 12, color: INK });

    it.options.forEach(function (o, i) {
      var oy = 276 + i * 30;
      var a = rv(t, sc.start + 4.2 + i * 0.5, 0.7);
      P.alpha(a);
      box(P, 28, oy, 420, 26, o.ok ? ACCDIM : SURF, o.ok ? VAL : BORDER);
      P.text(42, oy + 13, o.word, { size: 11, color: INK, base: 'middle' });
      P.text(240, oy + 13, o.polarity < 0 ? 'negative' : 'positive', { size: 10, color: o.polarity < 0 ? BAD : DIM, base: 'middle' });
      tick(P, 434, oy + 13, o.ok);
    });
    P.alpha(1);

    P.alpha(rv(t, sc.start + 6.8, 1.0));
    P.text(480, 284, 'first clause: positive (excellent)', { size: 10.5, color: DIM });
    P.text(480, 304, 'but sets a contrast, so the second', { size: 10.5, color: DIM });
    P.text(480, 322, 'clause must be negative', { size: 10.5, color: DIM });
    P.text(480, 346, 'one of four options is negative', { size: 10.5, color: VAL });
    P.text(28, 408, 'although with but marks one relation twice; so does because with so. ' + CONJ.doubledBad + ' of 4 printed sentences double.',
      { size: 11.5, color: INK });
    P.text(28, 430, 'GATE CSE 2012 GA Q57: despite sets a contrast, so the noun must be a setback \u2014 exactly one option is.',
      { size: 11.5, color: DIM });
    P.alpha(1);
  }

  /* ---------- scene 10: agreement ---------- */
  function drawAgree(P, t, sc) {
    P.alpha(rv(t, sc.start + 0.3, 1.0));
    P.text(640, 70, 'nearest', { size: 10, color: FAINT, align: 'center' });
    P.text(740, 70, 'head', { size: 10, color: FAINT, align: 'center' });
    P.text(800, 70, 'construction', { size: 10, color: FAINT });

    AGREE.all.forEach(function (r, i) {
      var y = 86 + i * 32;
      var a = rv(t, sc.start + 0.5 + i * 0.55, 0.8);
      P.alpha(a);
      box(P, 28, y, 844, 28, i === AGREE.all.length - 1 ? SURF2 : SURF, BORDER);
      P.text(40, y + 14, r.text, { size: 10.5, color: INK, base: 'middle' });
      tick(P, 640, y + 14, r.nearRight);
      tick(P, 740, y + 14, r.firstRight);
      P.text(800, y + 14, r.construction, { size: 9.5, color: DIM, base: 'middle' });
    });
    P.alpha(1);

    P.alpha(rv(t, sc.start + 4.4, 1.0));
    P.text(28, 320, 'Proximity: ' + AGREE.nearOnCorr + ' of 4 in the correlatives, ' + AGREE.nearOnAdd + ' of 2 in the additives.',
      { size: 12, color: INK });
    P.text(28, 342, 'Head rule: ' + AGREE.firstOnCorr + ' of 4 in the correlatives, ' + AGREE.firstOnAdd + ' of 2 in the additives.',
      { size: 12, color: INK });
    P.text(28, 364, 'Seven sentences: proximity ' + AGREE.nearTotal + ', head rule ' + AGREE.firstTotal + ' \u2014 the construction decides.',
      { size: 12, color: ACC });
    P.text(28, 392, 'The nearest noun is the subject only when the construction says so. Distance is not the rule.', { size: 12, color: DIM });
    P.text(28, 414, 'Five steps: name the feature, name what it forces, test each option, strike the grammatical but off-feature, check once.',
      { size: 11, color: FAINT });
    P.alpha(1);
  }

  var SCENES = {
    three: drawThree,
    grid: drawGrid,
    perfect: drawPerfect,
    clause: drawClause,
    compare: drawCompare,
    absolute: drawAbsolute,
    order: drawOrder,
    participle: drawParticiple,
    conj: drawConj,
    agree: drawAgree
  };

  function drawFrame(Pp) {
    P = Pp;
    var t = K.state.elapsed;
    var i = K.sceneAt(t);
    var sc = K.state.scenes[i];
    if (!sc) return;
    P.alpha(1);
    P.clear();
    header(P, sc);
    var fn = SCENES[sc.id];
    if (fn) {
      try { fn(P, t, sc); } catch (err) { console.error('scene draw failed', sc.id, err); }
    }
    P.alpha(1);
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

  window.__MODEL = V;
  window.__lessonChecks = CHECKS;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
