/* ==========================================================================
   verbal-aptitude — lesson.js
   Four layers, in order:
     1. THE MODEL      — every count the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The model is computation wherever computation is possible:
     - each agreement sentence has its head noun and its nearest noun found by
       rule, and the two candidate verbs are compared, so "is" is a result and
       the attraction error is a counted failure rather than a warning;
     - the article rule is run twice, once on first letters and once on first
       sounds, and the two scores are compared on the three words of the 2025
       item;
     - every time expression is typed (length, point, deadline) and each of the
       four printed preposition pairs is tested against those types;
     - the four idiom tuples are scored by counting violations against a table
       of fixed particles;
     - both vocabulary ladders are ranked and checked to be strictly
       increasing, and each option's polarity is compared with the clue's;
     - the comprehension premises are scanned for absolute words, and so are
       the four options, so "three of four add a universal" is a count;
     - both jumbled paragraphs are solved by enumerating all 4! = 24 orders and
       filtering by the reference edges, and the surviving order is compared
       with the printed options.
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

  function near(a, b, tol) { return Math.abs(a - b) <= (tol === undefined ? 1e-9 : tol); }

  /* ======================================================================
     LAYER 1 - THE MODEL
     ====================================================================== */

  /* ---------- 1a. agreement: the head noun against the nearest noun ----------
     Each sentence carries a subject whose head is known, the noun nearest the
     verb, and the number of each. The verb is derived from a number, never
     typed, so the two rules are the same function applied to two nouns. */

  function verbFor(number, kind) {
    if (kind === 'have') return number === 'sg' ? 'has' : 'have';
    return number === 'sg' ? 'is' : 'are';
  }

  var AGREE = (function () {
    var rows = [
      {
        text: 'The list of items ___ on the desk.',
        head: { word: 'list', number: 'sg' },
        nearest: { word: 'items', number: 'pl' },
        kind: 'be',
        answer: 'is'
      },
      {
        text: 'The boxes of paper ___ heavy.',
        head: { word: 'boxes', number: 'pl' },
        nearest: { word: 'paper', number: 'sg' },
        kind: 'be',
        answer: 'are'
      },
      {
        text: 'The number of applicants ___ risen.',
        head: { word: 'number', number: 'sg' },
        nearest: { word: 'applicants', number: 'pl' },
        kind: 'have',
        answer: 'has'
      },
      {
        text: 'Each of the two proposals ___ merit.',
        head: { word: 'Each', number: 'sg' },
        nearest: { word: 'proposals', number: 'pl' },
        kind: 'have',
        answer: 'has'
      }
    ];
    rows.forEach(function (r) {
      r.byHead = verbFor(r.head.number, r.kind);
      r.byNearest = verbFor(r.nearest.number, r.kind);
      r.headRight = r.byHead === r.answer;
      r.nearestRight = r.byNearest === r.answer;
      r.rulesDisagree = r.byHead !== r.byNearest;
    });
    return {
      rows: rows,
      headScore: rows.filter(function (r) { return r.headRight; }).length,
      nearestScore: rows.filter(function (r) { return r.nearestRight; }).length,
      disagreements: rows.filter(function (r) { return r.rulesDisagree; }).length,
      /* the determiner pair the lesson contrasts */
      pair: [
        { text: 'A number of applicants ___ applied.', head: 'applicants (plural, because "a number of" means many)', verb: 'have' },
        { text: 'The number of applicants ___ risen.', head: 'number (singular, "of applicants" modifies it)', verb: 'has' }
      ]
    };
  })();

  check('agreement: the head-noun rule gives the right verb in all four sentences',
    AGREE.headScore === 4, AGREE.headScore + '/4');
  check('agreement: the nearest-noun rule fails in all four sentences',
    AGREE.nearestScore === 0, AGREE.nearestScore + '/4');
  check('agreement: the two rules disagree in all four, which is why one example refutes the second',
    AGREE.disagreements === 4, AGREE.disagreements + '/4');
  check('agreement: "a number of" is plural and "the number of" is singular',
    AGREE.pair[0].verb === 'have' && AGREE.pair[1].verb === 'has');

  /* ---------- 1b. articles: sound rule against letter rule ----------
     GATE CSE 2025 Set 1, GA Question 1. Three words, each with the first sound
     and the first letter classified separately, so the two rules can be scored. */

  var ARTICLES = (function () {
    var words = [
      { word: 'younger brother', vowelSound: false, vowelLetter: false },
      { word: 'university', vowelSound: false, vowelLetter: true },
      { word: 'honorable man', vowelSound: true, vowelLetter: false }
    ];
    words.forEach(function (w) {
      w.bySound = w.vowelSound ? 'an' : 'a';
      w.byLetter = w.vowelLetter ? 'an' : 'a';
    });
    var key = ['a', 'a', 'an'];
    var soundSeq = words.map(function (w) { return w.bySound; });
    var letterSeq = words.map(function (w) { return w.byLetter; });
    return {
      words: words,
      key: key,
      soundSeq: soundSeq,
      letterSeq: letterSeq,
      soundScore: soundSeq.filter(function (a, i) { return a === key[i]; }).length,
      letterScore: letterSeq.filter(function (a, i) { return a === key[i]; }).length
    };
  })();

  check('articles: the sound rule reproduces the published key a; a; an',
    ARTICLES.soundSeq.join(';') === ARTICLES.key.join(';'), ARTICLES.soundSeq.join(';'));
  check('articles: the letter rule scores one of three',
    ARTICLES.letterScore === 1, ARTICLES.letterScore + '/3 -> ' + ARTICLES.letterSeq.join(';'));
  check('articles: the sound rule scores three of three',
    ARTICLES.soundScore === 3, ARTICLES.soundScore + '/3');

  /* ---------- 1c. prepositions of time: a typing rule ----------
     GATE CSE 2020, GA Question 1. Each expression has a type; each preposition
     accepts one or two types; a blank is legal only when the types match. */

  var PREP = (function () {
    var accepts = {
      for: ['length'],
      since: ['point'],
      within: ['deadline'],
      during: ['span'],
      in: ['length', 'point']
    };
    var blank1 = { type: 'deadline', text: 'six months (by when)' };
    var blank2 = { type: 'length', text: 'the last three weeks (how long)' };
    var options = [
      { letters: 'A', pair: ['during', 'for'] },
      { letters: 'B', pair: ['for', 'since'] },
      { letters: 'C', pair: ['for', 'in'] },
      { letters: 'D', pair: ['within', 'for'] }
    ];
    options.forEach(function (o) {
      o.ok1 = (accepts[o.pair[0]] || []).indexOf(blank1.type) >= 0;
      o.ok2 = (accepts[o.pair[1]] || []).indexOf(blank2.type) >= 0;
      o.ok = o.ok1 && o.ok2;
      o.fails = (o.ok1 ? 0 : 1) + (o.ok2 ? 0 : 1);
    });
    return {
      accepts: accepts,
      blank1: blank1,
      blank2: blank2,
      options: options,
      passing: options.filter(function (o) { return o.ok; }),
      spanWeeks: 3
    };
  })();

  check('prepositions: exactly one of the four printed pairs satisfies both blanks',
    PREP.passing.length === 1, PREP.passing.length + ' passing');
  check('prepositions: the passing pair is within, for',
    PREP.passing.length === 1 && PREP.passing[0].pair.join(',') === 'within,for');
  check('prepositions: since rejects a length, and for rejects a deadline',
    PREP.accepts.since.indexOf('length') < 0 && PREP.accepts.for.indexOf('deadline') < 0);
  check('prepositions: three of the four pairs fail on the first blank alone',
    PREP.options.filter(function (o) { return !o.ok1; }).length === 3);

  /* ---------- 1d. idioms: fixed particles, counted violations ----------
     GATE CSE 2024 Set 1, GA Question 6. Four idioms share the word head; each
     has one legal particle; each printed tuple is scored by violations. */

  var IDIOMS = (function () {
    var table = [
      { idiom: 'keep one\u2019s head ___', particle: 'down', meaning: 'stay out of trouble' },
      { idiom: 'head ___ to bat', particle: 'out', meaning: 'leave for the field' },
      { idiom: 'a head ___ batting', particle: 'for', meaning: 'a talent for it' },
      { idiom: 'a cool head ___ one\u2019s shoulders', particle: 'on', meaning: 'composure' }
    ];
    var tuples = [
      { letters: 'A', words: ['down', 'down', 'on', 'for'] },
      { letters: 'B', words: ['on', 'down', 'for', 'on'] },
      { letters: 'C', words: ['down', 'out', 'for', 'on'] },
      { letters: 'D', words: ['on', 'out', 'on', 'for'] }
    ];
    tuples.forEach(function (tp) {
      tp.violations = tp.words.reduce(function (n, w, i) {
        return n + (w === table[i].particle ? 0 : 1);
      }, 0);
    });
    return {
      table: table,
      tuples: tuples,
      answer: table.map(function (t) { return t.particle; }),
      clean: tuples.filter(function (tp) { return tp.violations === 0; })
    };
  })();

  check('idioms: exactly one printed tuple has no violation',
    IDIOMS.clean.length === 1, IDIOMS.clean.length + ' clean');
  check('idioms: the clean tuple is down, out, for, on',
    IDIOMS.clean.length === 1 && IDIOMS.clean[0].words.join(',') === 'down,out,for,on');
  check('idioms: the four violation counts are 3, 2, 0, 3',
    IDIOMS.tuples.map(function (t) { return t.violations; }).join(',') === '3,2,0,3');
  check('idioms: every distractor breaks at least two idioms',
    IDIOMS.tuples.filter(function (t) { return t.violations > 0 && t.violations < 2; }).length === 0);

  /* ---------- 1e. vocabulary: a ladder and a clue ----------
     GATE CSE 2024 Set 1, GA Q1 (intensity scale) and 2025 Set 1, GA Q2 (a word
     defined by its own because-clause). */

  var VOCAB = (function () {
    var moisture = { name: 'lack of moisture', words: ['dry', 'arid', 'parched'], ranks: [1, 2, 3] };
    var food = { name: 'lack of food', words: ['diet', 'fast', 'starve'], ranks: [1, 2, 3] };
    function increasing(l) {
      for (var i = 1; i < l.ranks.length; i++) { if (!(l.ranks[i] > l.ranks[i - 1])) return false; }
      return true;
    }
    var options = [
      { word: 'starve', rank: 3 },
      { word: 'feast', rank: -1 },
      { word: 'eat', rank: 0 },
      { word: 'cook', rank: 0 }
    ];
    var maxRank = Math.max.apply(null, options.map(function (o) { return o.rank; }));
    var tops = options.filter(function (o) { return o.rank === maxRank; });
    options.forEach(function (o) { o.isMax = o.rank === maxRank; o.reverses = o.rank < 0; });

    var clue = 'sacrificed long-term stability to accommodate short-term gains';
    var cluePolarity = -1;                     /* short-term focus */
    var clueOptions = [
      { word: 'visionary', polarity: 1 },
      { word: 'shortsighted', polarity: -1 },
      { word: 'progressive', polarity: 1 },
      { word: 'innovative', polarity: 1 }
    ];
    clueOptions.forEach(function (o) { o.matches = o.polarity === cluePolarity; });
    return {
      moisture: moisture,
      food: food,
      moistureIncreasing: increasing(moisture),
      foodIncreasing: increasing(food),
      options: options,
      tops: tops,
      clue: clue,
      cluePolarity: cluePolarity,
      clueOptions: clueOptions,
      matching: clueOptions.filter(function (o) { return o.matches; })
    };
  })();

  check('vocabulary: both ladders are strictly increasing',
    VOCAB.moistureIncreasing && VOCAB.foodIncreasing);
  check('vocabulary: starve is the unique maximum among the options',
    VOCAB.tops.length === 1 && VOCAB.tops[0].word === 'starve');
  check('vocabulary: feast sits at the opposite end of the ladder',
    VOCAB.options.filter(function (o) { return o.word === 'feast'; })[0].reverses === true);
  check('vocabulary: exactly one option has the polarity of the clue',
    VOCAB.matching.length === 1 && VOCAB.matching[0].word === 'shortsighted');

  /* ---------- 1f. comprehension: the absolute-word test ----------
     GATE CSE 2023, GA Question 6. The premises are scanned for absolute
     vocabulary; the options are scanned for the same words. An option that adds
     one is not entailed, because nothing in the premises licenses it. */

  var ABSOLUTE = ['all', 'only', 'must', 'every', 'everyone', 'everybody', 'always',
                  'never', 'first', 'mandatory', 'none', 'entire', 'any'];

  function absoluteWordsIn(text) {
    var low = String(text).toLowerCase();
    return ABSOLUTE.filter(function (w) {
      var re = new RegExp('(^|[^a-z])' + w + '([^a-z]|$)');
      return re.test(low);
    });
  }

  var RC = (function () {
    var premises = [
      { text: 'More than 75 per cent of the working population is suffering from serious health issues.',
        short: 'Over 75 per cent of the working population is seriously ill.' },
      { text: 'A complete lack of physical exercise among the working population is one of the leading causes.',
        short: 'Lack of exercise is one of the leading causes.' },
      { text: 'The government has decided to provide monetary incentives to those who ride bicycles to work.',
        short: 'The government will pay those who cycle to work.' }
    ];
    var options = [
      { letters: 'A', text: 'Everyone in the working population will now ride a bicycle to work.',
        short: 'Everyone will now ride a bicycle to work.', entailed: false },
      { letters: 'B', text: 'Riding a bicycle will ensure that all workers are free of health issues.',
        short: 'All workers will be free of health issues.', entailed: false },
      { letters: 'C', text: 'The health experts asked the government to make cycling mandatory.',
        short: 'The experts asked for cycling to be mandatory.', entailed: false },
      { letters: 'D', text: 'The government believes that riding a bicycle is a form of physical exercise.',
        short: 'The government believes cycling is exercise.', entailed: true }
    ];
    options.forEach(function (o) { o.abs = absoluteWordsIn(o.text); });
    var premiseAbs = premises.map(function (p) { return absoluteWordsIn(p.text); });
    return {
      premises: premises,
      premiseAbs: premiseAbs,
      premiseAbsCount: premiseAbs.reduce(function (n, a) { return n + a.length; }, 0),
      options: options,
      clean: options.filter(function (o) { return o.abs.length === 0; }),
      optionAbsCount: options.reduce(function (n, o) { return n + o.abs.length; }, 0),
      entailedCount: options.filter(function (o) { return o.entailed; }).length
    };
  })();

  check('comprehension: no premise contains an absolute word',
    RC.premiseAbsCount === 0, RC.premiseAbsCount + ' found');
  check('comprehension: exactly one option contains no absolute word',
    RC.clean.length === 1, RC.clean.length + ' clean');
  check('comprehension: the clean option is the one the published key marks',
    RC.clean.length === 1 && RC.clean[0].letters === 'D');
  check('comprehension: three of the four options carry an absolute word',
    RC.options.filter(function (o) { return o.abs.length > 0; }).length === 3);
  check('comprehension: exactly one option is entailed',
    RC.entailedCount === 1);

  /* ---------- 1g. sequencing: 24 orders, filtered by reference edges ----------
     GATE CSE 2023 GA Q8 and GATE CSE 2024 Set 2 GA Q6. The edges come from
     reading the sentences; the enumeration then proves that only one order is
     consistent with those edges, and the printed options are scored against
     the same edges. */

  function permutations(list) {
    if (list.length <= 1) return [list.slice()];
    var out = [];
    list.forEach(function (x, i) {
      var rest = list.slice(0, i).concat(list.slice(i + 1));
      permutations(rest).forEach(function (p) { out.push([x].concat(p)); });
    });
    return out;
  }

  function seqModel(sentences, edges, options) {
    var ids = sentences.map(function (s) { return s.id; });
    var all = permutations(ids);
    var valid = all.filter(function (order) {
      return edges.every(function (e) { return order.indexOf(e.from) < order.indexOf(e.to); });
    });
    function violations(order) {
      return edges.reduce(function (n, e) {
        return n + (order.indexOf(e.from) < order.indexOf(e.to) ? 0 : 1);
      }, 0);
    }
    options.forEach(function (o) { o.violations = violations(o.order); });
    return {
      sentences: sentences,
      edges: edges,
      ordersTried: all.length,
      valid: valid,
      validCount: valid.length,
      options: options,
      cleanOptions: options.filter(function (o) { return o.violations === 0; }),
      answerOrder: valid.length === 1 ? valid[0] : null
    };
  }

  var SEQ1 = seqModel(
    [
      { id: 'iii', text: 'Mina\u2019s bags are heavy from the market.' },
      { id: 'ii', text: 'She pants after climbing the stairs.' },
      { id: 'i', text: 'On the terrace she notices the man.' },
      { id: 'iv', text: 'He leans on the parapet, watching.' }
    ],
    [
      { from: 'iii', to: 'ii', why: 'bags \u2192 panting' },
      { from: 'ii', to: 'i', why: 'stairs \u2192 terrace' },
      { from: 'i', to: 'iv', why: '"the man" \u2192 "he"' }
    ],
    [
      { letters: 'A', order: ['i', 'ii', 'iv', 'iii'] },
      { letters: 'B', order: ['ii', 'iii', 'i', 'iv'] },
      { letters: 'C', order: ['iv', 'ii', 'i', 'iii'] },
      { letters: 'D', order: ['iii', 'ii', 'i', 'iv'] }
    ]
  );

  var SEQ2 = seqModel(
    [
      { id: 'S', text: 'A chunk of the Antarctic Plate collided with the Eurasian Plate.' },
      { id: 'P', text: 'This event lifted the rocks 4 km across the contact zone.' },
      { id: 'R', text: 'The cooling of this edifice absorbed atmospheric carbon dioxide.' },
      { id: 'Q', text: 'Thus the Himalayas are read as an active event.' }
    ],
    [
      { from: 'S', to: 'P', why: '"this event"' },
      { from: 'P', to: 'R', why: '"this edifice"' },
      { from: 'R', to: 'Q', why: '"Thus" concludes' }
    ],
    [
      { letters: 'A', order: ['Q', 'P', 'S', 'R'] },
      { letters: 'B', order: ['Q', 'S', 'P', 'R'] },
      { letters: 'C', order: ['S', 'P', 'R', 'Q'] },
      { letters: 'D', order: ['S', 'R', 'P', 'Q'] }
    ]
  );

  check('sequencing: the first paragraph has 24 orders and exactly one survives',
    SEQ1.ordersTried === 24 && SEQ1.validCount === 1, SEQ1.validCount + ' of ' + SEQ1.ordersTried);
  check('sequencing: the surviving order is iii, ii, i, iv',
    SEQ1.answerOrder && SEQ1.answerOrder.join(',') === 'iii,ii,i,iv');
  check('sequencing: exactly one printed option for the first paragraph is clean',
    SEQ1.cleanOptions.length === 1 && SEQ1.cleanOptions[0].letters === 'D');
  check('sequencing: every other option for the first paragraph breaks at least one edge',
    SEQ1.options.filter(function (o) { return o.violations === 0; }).length === 1);
  check('sequencing: the second paragraph has 24 orders and exactly one survives',
    SEQ2.ordersTried === 24 && SEQ2.validCount === 1, SEQ2.validCount + ' of ' + SEQ2.ordersTried);
  check('sequencing: the surviving order is S, P, R, Q',
    SEQ2.answerOrder && SEQ2.answerOrder.join(',') === 'S,P,R,Q');
  check('sequencing: exactly one printed option for the second paragraph is clean',
    SEQ2.cleanOptions.length === 1 && SEQ2.cleanOptions[0].letters === 'C');
  check('sequencing: two printed options begin with the concluding connector',
    SEQ2.options.filter(function (o) { return o.order[0] === 'Q'; }).length === 2);
  check('sequencing: the option scores are 2, 1, 0, 1',
    SEQ2.options.map(function (o) { return o.violations; }).join(',') === '2,1,0,1');

  /* ---------- 1h. the section's arithmetic ---------- */
  var SECTION = { questions: 10, marks: 15, paper: 100 };
  check('section: ten General Aptitude questions carry fifteen of a hundred marks',
    SECTION.questions === 10 && SECTION.marks === 15 && SECTION.paper === 100);

  var V = {
    AGREE: AGREE, ARTICLES: ARTICLES, PREP: PREP, IDIOMS: IDIOMS, VOCAB: VOCAB,
    RC: RC, SEQ1: SEQ1, SEQ2: SEQ2, SECTION: SECTION
  };

  /* ======================================================================
     LAYER 3 - RENDER
     ====================================================================== */

  function tw(s, size, mono) { return String(s).length * size * (mono ? 0.62 : 0.57); }

  function wrap(str, max) {
    var words = String(str).split(' ');
    var lines = [], cur = '';
    words.forEach(function (w) {
      if (cur && (cur + ' ' + w).length > max) { lines.push(cur); cur = w; }
      else { cur = cur ? cur + ' ' + w : w; }
    });
    if (cur) lines.push(cur);
    return lines;
  }

  function lines(P, x, y, arr, size, colour, lh) {
    arr.forEach(function (l, i) {
      P.text(x, y + i * (lh || 14), l, { size: size, color: colour });
    });
  }

  function header(P, sc) {
    P.alpha(1);
    P.text(28, 18, 'Verbal aptitude \u00b7 ' + sc.title, { size: 15, bold: true, color: INK });
    P.text(28, 40, 'Section 1 of General Aptitude \u2014 one decision per question', { size: 11.5, color: FAINT });
    P.line(28, 56, W - 28, 56, { stroke: BORDER, sw: 1 });
  }

  function box(P, x, y, w, h, fill, stroke) {
    P.rect(x, y, w, h, { fill: fill || SURF, stroke: stroke || BORDER, sw: 1, radius: 6 });
  }

  function chip(P, x, y, label, colour, dim) {
    var size = 11.5;
    var w = tw(label, size) + 14;
    P.rect(x, y, w, 20, { fill: dim || SURF2, stroke: colour || BORDER, sw: 1, radius: 10 });
    P.text(x + w / 2, y + 10, label, { size: size, color: colour || DIM, align: 'center', base: 'middle' });
    return w;
  }

  function tick(P, x, y, ok) {
    P.text(x, y, ok ? '\u2713' : '\u2717', { size: 14, bold: true, color: ok ? VAL : BAD, base: 'middle' });
  }

  function rv(t, at, d) { return K.ease(K.clamp01((t - at) / (d || 1.4))); }

  /* ---------- scene 1: the four decisions ---------- */
  function drawAsk(P, t, sc) {
    var cards = [
      { k: 'Feature', t: 'Grammar', d: 'One feature per blank: a sound, a number, a time type, a particle.' },
      { k: 'Substitution', t: 'Vocabulary', d: 'Put the word back in the sentence and ask what the sentence now says.' },
      { k: 'Entailment', t: 'Comprehension', d: 'Which option follows from the passage alone, with nothing added?' },
      { k: 'Order', t: 'Sequencing', d: 'Every backward reference is an edge; a valid order respects them all.' }
    ];
    var xs = [28, 466], ys = [72, 212];
    cards.forEach(function (c, i) {
      var a = rv(t, sc.start + 0.4 + i * 1.1, 1.0);
      P.alpha(a);
      var x = xs[i % 2], y = ys[Math.floor(i / 2)];
      box(P, x, y, 406, 126, SURF, BORDER);
      chip(P, x + 14, y + 12, c.k, ACC, ACCDIM);
      P.text(x + 14, y + 42, c.t, { size: 17, bold: true, color: INK });
      lines(P, x + 14, y + 70, wrap(c.d, 50).slice(0, 2), 12, DIM, 18);
    });
    P.alpha(rv(t, sc.start + 5.2, 1.2));
    P.text(28, 356, 'Ten questions, fifteen marks, in every GATE paper \u2014 five of one mark and five of two.',
      { size: 12.5, color: INK });
    P.text(28, 378, 'The two-mark items are comprehension and sequencing, so they carry twice the vocabulary items.',
      { size: 12.5, color: DIM });
    P.alpha(1);
  }

  /* ---------- scene 2: agreement ---------- */
  function drawAgree(P, t, sc) {
    var r = AGREE.rows[0];
    var toks = ['The', 'list', 'of', 'items', '___', 'on', 'the', 'desk.'];
    var size = 15, x = 32, y = 76, gap = 6;
    var blanks = [];
    toks.forEach(function (s, i) {
      var w = tw(s, size) + 16;
      var isHead = i === 1, isNearest = i === 3;
      var a = rv(t, sc.start + 0.3 + i * 0.35, 0.9);
      P.alpha(a);
      box(P, x, y, w, 32, isHead ? ACCDIM : (isNearest ? WARNDIM : SURF),
        isHead ? ACC : (isNearest ? WARN : BORDER));
      if (i !== 4) {
        P.text(x + w / 2, y + 16, s, { size: size, color: INK, align: 'center', base: 'middle', bold: isHead });
      }
      blanks.push({ x: x, w: w });
      x += w + gap;
    });
    /* the blank now holds the head-rule answer */
    var bl = blanks[4];
    P.alpha(rv(t, sc.start + 3.4, 1.0));
    P.text(bl.x + bl.w / 2, y + 16, r.byHead, { size: 15, bold: true, color: VAL, align: 'center', base: 'middle' });

    /* the modifier bracket under "of items" */
    P.alpha(rv(t, sc.start + 4.2, 1.0));
    var x0 = blanks[2].x, x1 = blanks[3].x + blanks[3].w;
    P.line(x0, y + 44, x1, y + 44, { stroke: WARN, sw: 1.5 });
    P.line(x0, y + 44, x0, y + 38, { stroke: WARN, sw: 1.5 });
    P.line(x1, y + 44, x1, y + 38, { stroke: WARN, sw: 1.5 });
    P.text((x0 + x1) / 2, y + 48, 'modifier \u2014 delete it', { size: 11, color: WARN, align: 'center' });

    /* the two rules */
    P.alpha(rv(t, sc.start + 5.4, 1.0));
    box(P, 28, 150, 412, 82, SURF, VAL);
    P.text(42, 162, 'head-noun rule', { size: 12.5, bold: true, color: VAL });
    P.text(42, 184, 'head = "list", singular \u2192 ' + r.byHead, { size: 13.5, color: INK });
    P.text(42, 206, 'agrees with the subject', { size: 11.5, color: DIM });
    tick(P, 404, 190, true);

    box(P, 460, 150, 412, 82, SURF, BAD);
    P.text(474, 162, 'nearest-noun rule', { size: 12.5, bold: true, color: BAD });
    P.text(474, 184, 'nearest = "items", plural \u2192 ' + r.byNearest, { size: 13.5, color: INK });
    P.text(474, 206, 'the attraction error', { size: 11.5, color: DIM });
    tick(P, 836, 190, false);

    /* the determiner pair */
    P.alpha(rv(t, sc.start + 7.0, 1.0));
    box(P, 28, 248, 412, 84, SURF, BORDER);
    P.text(42, 260, AGREE.pair[0].text.replace('___', AGREE.pair[0].verb), { size: 12.5, bold: true, color: INK });
    P.text(42, 284, '"a number of" = many, so the head is', { size: 11.5, color: DIM });
    P.text(42, 302, 'plural: applicants \u2192 have', { size: 11.5, color: VAL });

    box(P, 460, 248, 412, 84, SURF, BORDER);
    P.text(474, 260, AGREE.pair[1].text.replace('___', AGREE.pair[1].verb), { size: 12.5, bold: true, color: INK });
    P.text(474, 284, '"the number of": the head is "number",', { size: 11.5, color: DIM });
    P.text(474, 302, 'singular \u2192 has', { size: 11.5, color: VAL });

    P.alpha(rv(t, sc.start + 8.4, 1.0));
    P.text(28, 358, 'On these four sentences the head-noun rule scores ' + AGREE.headScore +
      ' of 4 and the nearest-noun rule scores ' + AGREE.nearestScore + ' of 4.',
      { size: 12.5, color: INK });
    P.text(28, 380, 'The two rules disagree on all four \u2014 which is why one example is enough to refute the second.',
      { size: 12, color: DIM });
    P.alpha(1);
  }

  /* ---------- scene 3: articles ---------- */
  function drawArticle(P, t, sc) {
    var ys = [76, 168, 260];
    ARTICLES.words.forEach(function (w, i) {
      var a = rv(t, sc.start + 0.5 + i * 2.0, 1.1);
      P.alpha(a);
      var y = ys[i];
      box(P, 28, y, 844, 76, SURF, BORDER);
      P.text(44, y + 20, w.word, { size: 17, bold: true, color: INK });
      P.text(44, y + 46, w.vowelSound ? 'first sound: a vowel sound' : 'first sound: a consonant sound',
        { size: 11.5, color: DIM });
      P.text(44, y + 62, w.vowelLetter ? 'first letter: a vowel letter' : 'first letter: a consonant letter',
        { size: 11.5, color: FAINT });

      var cw = chip(P, 420, y + 20, 'sound \u2192 ' + w.bySound, VAL, ACCDIM);
      chip(P, 420 + cw + 12, y + 20, 'letter \u2192 ' + w.byLetter, BAD, BADDIM);

      P.text(700, y + 24, 'the article is "' + w.bySound + '"', { size: 12.5, color: INK });
      tick(P, 700, y + 50, w.bySound === w.byLetter);
      P.text(718, y + 50, w.bySound === w.byLetter ? 'both rules agree here' : 'only the sound rule is right',
        { size: 11.5, color: w.bySound === w.byLetter ? DIM : BAD, base: 'middle' });
    });
    P.alpha(rv(t, sc.start + 6.6, 1.0));
    P.text(28, 362, 'Sound rule: ' + ARTICLES.soundScore + ' of 3 \u2014 a, a, an, which is the published key.',
      { size: 12.5, color: VAL });
    P.text(28, 384, 'Letter rule: ' + ARTICLES.letterScore + ' of 3 \u2014 a, an, a. It is wrong on the two words chosen to mislead.',
      { size: 12.5, color: BAD });
    P.alpha(1);
  }

  /* ---------- scene 4: prepositions ---------- */
  function drawPrep(P, t, sc) {
    P.alpha(rv(t, sc.start + 0.4, 1.0));
    var x0 = 80, x1 = 856, y = 128;
    P.line(x0, y, x1, y, { stroke: BORDER, sw: 2 });
    P.arrow(x0, y, x1, y, { stroke: BORDER, sw: 2, head: 8 });
    P.text(x0 - 6, y - 14, 'past', { size: 11, color: FAINT });
    P.text(x1 - 24, y - 14, 'future', { size: 11, color: FAINT });

    var m1 = 300, m2 = 600, m3 = 800;
    [m1, m2, m3].forEach(function (mx) {
      P.line(mx, y - 8, mx, y + 8, { stroke: INK, sw: 2 });
    });
    P.text(m1, y - 26, '3 weeks ago', { size: 11.5, color: DIM, align: 'center' });
    P.text(m2, y - 26, 'now', { size: 11.5, color: DIM, align: 'center' });
    P.text(m3, y - 26, '+6 months', { size: 11.5, color: DIM, align: 'center' });

    /* the span brace */
    P.alpha(rv(t, sc.start + 2.2, 1.0));
    P.line(m1, y + 26, m2, y + 26, { stroke: ACC, sw: 2 });
    P.line(m1, y + 26, m1, y + 18, { stroke: ACC, sw: 2 });
    P.line(m2, y + 26, m2, y + 18, { stroke: ACC, sw: 2 });
    P.text((m1 + m2) / 2, y + 32, 'for \u2014 a length', { size: 12, color: ACC, align: 'center' });

    /* the deadline arrow */
    P.alpha(rv(t, sc.start + 3.4, 1.0));
    P.arrow(m2, y + 54, m3, y + 54, { stroke: WARN, sw: 2, head: 8 });
    P.text((m2 + m3) / 2, y + 60, 'within \u2014 a deadline', { size: 12, color: WARN, align: 'center' });

    /* the point */
    P.alpha(rv(t, sc.start + 4.4, 1.0));
    P.circle(m2, y, 5, { fill: INK });
    P.text(m2, y + 78, 'since \u2014 a point', { size: 12, color: INK, align: 'center' });

    /* the four option pairs */
    var rows = PREP.options;
    P.alpha(rv(t, sc.start + 5.4, 1.0));
    P.text(28, 258, 'The four printed pairs, tested against the two blanks:', { size: 12, color: DIM });
    rows.forEach(function (o, i) {
      var ry = 272 + i * 34;
      var a = rv(t, sc.start + 5.6 + i * 0.9, 0.9);
      P.alpha(a);
      box(P, 28, ry, 844, 30, o.ok ? ACCDIM : SURF, o.ok ? VAL : BORDER);
      P.text(42, ry + 15, o.letters + '   ' + o.pair.join(', '), { size: 12.5, color: INK, base: 'middle', mono: true });
      tick(P, 330, ry + 15, o.ok1);
      P.text(346, ry + 15, 'first blank ' + (o.ok1 ? 'legal' : 'illegal'), { size: 11.5, color: o.ok1 ? VAL : BAD, base: 'middle' });
      tick(P, 540, ry + 15, o.ok2);
      P.text(556, ry + 15, 'second blank ' + (o.ok2 ? 'legal' : 'illegal'), { size: 11.5, color: o.ok2 ? VAL : BAD, base: 'middle' });
      P.text(812, ry + 15, o.ok ? 'key' : o.fails + ' fail', { size: 12, bold: o.ok, color: o.ok ? VAL : BAD, base: 'middle' });
    });
    P.alpha(1);
  }

  /* ---------- scene 5: idioms ---------- */
  function drawIdiom(P, t, sc) {
    IDIOMS.table.forEach(function (row, i) {
      var y = 76 + i * 62;
      var a = rv(t, sc.start + 0.4 + i * 1.4, 1.0);
      P.alpha(a);
      box(P, 28, y, 512, 54, SURF, BORDER);
      P.text(42, y + 18, row.idiom, { size: 13.5, color: INK });
      P.text(42, y + 40, row.meaning, { size: 11, color: DIM });
      chip(P, 430, y + 16, row.particle, ACC, ACCDIM);
    });

    P.alpha(rv(t, sc.start + 4.6, 1.0));
    P.text(568, 92, 'printed tuple', { size: 11.5, color: FAINT });
    P.text(700, 92, 'violations', { size: 11.5, color: FAINT });
    IDIOMS.tuples.forEach(function (tp, i) {
      var y = 104 + i * 40;
      var a = rv(t, sc.start + 4.8 + i * 0.8, 0.9);
      P.alpha(a);
      box(P, 568, y, 304, 32, tp.violations === 0 ? ACCDIM : SURF, tp.violations === 0 ? VAL : BORDER);
      P.text(582, y + 16, tp.letters + '  ' + tp.words.join(', '), { size: 11.5, color: INK, base: 'middle', mono: true });
      P.text(800, y + 16, String(tp.violations), { size: 13, bold: true, color: tp.violations === 0 ? VAL : BAD, base: 'middle' });
    });

    P.alpha(rv(t, sc.start + 7.6, 1.0));
    P.text(568, 286, 'One tuple of four has no violation,', { size: 12, color: INK });
    P.text(568, 306, 'which is the published key.', { size: 12, color: DIM });
    P.text(568, 336, 'The others break two or three idioms', { size: 12, color: BAD });
    P.text(568, 356, 'while staying grammatical.', { size: 12, color: DIM });

    P.alpha(rv(t, sc.start + 8.4, 1.0));
    P.text(28, 366, 'An idiom is fixed: the particle is part of the word, not a free choice.', { size: 12.5, color: INK });
    P.text(28, 388, 'So four blanks are four independent tests, and one wrong particle loses the mark.', { size: 12, color: DIM });
    P.alpha(1);
  }

  /* ---------- scene 6: vocabulary ---------- */
  function drawVocab(P, t, sc) {
    P.alpha(rv(t, sc.start + 0.4, 1.0));
    P.text(28, 76, 'ladder 1 \u2014 ' + VOCAB.moisture.name, { size: 11.5, color: FAINT });
    P.text(28, 152, 'ladder 2 \u2014 ' + VOCAB.food.name, { size: 11.5, color: FAINT });

    function ladder(words, y, at) {
      var x = 28;
      words.forEach(function (w, i) {
        var a = rv(t, at + i * 0.7, 0.8);
        P.alpha(a);
        var size = 14;
        var wd = tw(w, size) + 24;
        box(P, x, y, wd, 34, i === words.length - 1 ? ACCDIM : SURF, i === words.length - 1 ? ACC : BORDER);
        P.text(x + wd / 2, y + 17, w, { size: size, color: INK, align: 'center', base: 'middle' });
        if (i < words.length - 1) {
          P.arrow(x + wd + 6, y + 17, x + wd + 44, y + 17, { stroke: DIM, sw: 1.5, head: 7 });
        }
        x += wd + 52;
      });
      P.alpha(1);
    }
    ladder(VOCAB.moisture.words, 94, sc.start + 0.8);
    ladder(VOCAB.food.words, 170, sc.start + 2.4);

    /* the options for the blank */
    P.alpha(rv(t, sc.start + 4.2, 1.0));
    P.text(28, 230, 'the four options, placed on ladder 2:', { size: 11.5, color: FAINT });
    VOCAB.options.forEach(function (o, i) {
      var y = 244 + i * 30;
      var a = rv(t, sc.start + 4.4 + i * 0.6, 0.8);
      P.alpha(a);
      P.text(36, y + 10, o.word, { size: 12.5, color: INK, base: 'middle', mono: true });
      var label = o.isMax ? 'top of the ladder' : (o.reverses ? 'opposite end' : 'no intensity at all');
      P.text(150, y + 10, label, { size: 11.5, color: o.isMax ? VAL : (o.reverses ? BAD : FAINT), base: 'middle' });
      tick(P, 320, y + 10, o.isMax);
    });

    /* the context clue */
    P.alpha(rv(t, sc.start + 5.4, 1.0));
    box(P, 470, 76, 402, 120, SURF, BORDER);
    P.text(486, 92, 'the sentence defines the word', { size: 11.5, color: FAINT });
    P.text(486, 116, 'The decision was myopic because', { size: 12.5, color: INK });
    P.text(486, 136, 'it sacrificed long-term stability', { size: 12.5, color: INK });
    P.text(486, 156, 'to accommodate short-term gains.', { size: 12.5, color: INK });
    P.line(486, 172, 700, 172, { stroke: ACC, sw: 1.5 });
    P.text(486, 176, 'clue: short-term focus', { size: 11, color: ACC });

    P.alpha(rv(t, sc.start + 6.4, 1.0));
    VOCAB.clueOptions.forEach(function (o, i) {
      var y = 208 + i * 30;
      var a = rv(t, sc.start + 6.6 + i * 0.6, 0.8);
      P.alpha(a);
      P.text(486, y + 10, o.word, { size: 12.5, color: INK, base: 'middle' });
      P.text(636, y + 10, o.polarity > 0 ? 'describes foresight' : 'describes short-term focus',
        { size: 11, color: DIM, base: 'middle' });
      tick(P, 838, y + 10, o.matches);
    });

    P.alpha(rv(t, sc.start + 8.2, 1.0));
    P.text(28, 366, 'Both ladders are strictly increasing, and "starve" is the unique maximum among the options.',
      { size: 12.5, color: INK });
    P.text(28, 388, 'Exactly one of the four context options has the polarity of the clue.',
      { size: 12.5, color: INK });
    P.alpha(1);
  }

  /* ---------- scene 7: comprehension ---------- */
  function drawRC(P, t, sc) {
    RC.premises.forEach(function (p, i) {
      var y = 76 + i * 62;
      var a = rv(t, sc.start + 0.4 + i * 1.3, 1.0);
      P.alpha(a);
      box(P, 28, y, 392, 58, SURF, BORDER);
      chip(P, 40, y + 8, 'P' + (i + 1), INFO, SURF2);
      lines(P, 40, y + 30, wrap(p.short, 44).slice(0, 2), 10.5, INK, 14);
    });

    P.alpha(rv(t, sc.start + 4.6, 1.0));
    P.arrow(224, 262, 224, 288, { stroke: VAL, sw: 2, head: 8 });
    box(P, 28, 292, 392, 66, ACCDIM, VAL);
    P.text(42, 304, 'the only entailed conclusion', { size: 11.5, color: VAL });
    P.text(42, 322, 'The government believes that', { size: 12, color: INK });
    P.text(42, 340, 'cycling is physical exercise.', { size: 12, color: INK });

    RC.options.forEach(function (o, i) {
      var y = 76 + i * 76;
      var a = rv(t, sc.start + 5.4 + i * 1.1, 0.9);
      P.alpha(a);
      box(P, 452, y, 420, 66, o.entailed ? ACCDIM : SURF, o.entailed ? VAL : BORDER);
      P.text(464, y + 10, o.letters + (o.entailed ? '  entailed' : '  adds ' + (o.abs.length ? '"' + o.abs[0] + '"' : 'a cause')),
        { size: 11, color: o.entailed ? VAL : BAD });
      lines(P, 464, y + 30, wrap(o.short, 46).slice(0, 3), 10.5, INK, 14);
    });

    P.alpha(rv(t, sc.start + 9.2, 1.0));
    P.text(28, 380, 'Absolute words in the three premises: ' + RC.premiseAbsCount +
      ' \u00b7 in the four options: ' + RC.optionAbsCount + '.', { size: 12.5, color: INK });
    P.text(28, 402, 'An option stronger than its premises is not entailed, however sensible it sounds.',
      { size: 12, color: DIM });
    P.alpha(1);
  }

  /* ---------- scenes 8 and 9: sequencing ---------- */
  function drawSeq(P, t, sc, model, note) {
    var n = model.sentences.length;
    var x0 = 28, wid = 200, gapx = 14;
    var y = 96, h = 96;
    var pos = [];
    model.sentences.forEach(function (s, i) {
      var a = rv(t, sc.start + 0.4 + i * 1.0, 0.9);
      P.alpha(a);
      var x = x0 + i * (wid + gapx);
      pos.push(x);
      box(P, x, y, wid, h, SURF, BORDER);
      chip(P, x + 10, y + 8, s.id, ACC, ACCDIM);
      lines(P, x + 10, y + 40, wrap(s.text, 29).slice(0, 3), 10.5, INK, 14);
    });

    /* the edges, drawn between adjacent nodes in the surviving order */
    model.edges.forEach(function (e, i) {
      var a = rv(t, sc.start + 4.2 + i * 0.9, 0.9);
      P.alpha(a);
      var from = model.sentences.map(function (s) { return s.id; }).indexOf(e.from);
      var to = model.sentences.map(function (s) { return s.id; }).indexOf(e.to);
      var xa = pos[from] + wid / 2, xb = pos[to] + wid / 2;
      P.arrow(xa, y + h + 4, xb, y + h + 26, { stroke: ACC, sw: 1.8, head: 7 });
      P.text((xa + xb) / 2, y + h + 30, e.why, { size: 10, color: ACC, align: 'center' });
    });

    /* the count */
    P.alpha(rv(t, sc.start + 7.0, 1.0));
    box(P, 28, 244, 420, 64, SURF2, BORDER);
    P.text(42, 258, model.ordersTried + ' orders tried \u00b7 ' + model.validCount + ' survives',
      { size: 13, bold: true, color: INK });
    P.text(42, 282, 'order: ' + (model.answerOrder ? model.answerOrder.join(' \u2192 ') : 'more than one'),
      { size: 12, color: VAL, mono: true });

    /* the printed options */
    P.text(28, 322, 'the four printed options, scored by broken links:', { size: 11.5, color: FAINT });
    model.options.forEach(function (o, i) {
      var y2 = 334 + i * 30;
      var a = rv(t, sc.start + 7.4 + i * 0.6, 0.8);
      P.alpha(a);
      box(P, 28, y2, 420, 26, o.violations === 0 ? ACCDIM : SURF, o.violations === 0 ? VAL : BORDER);
      P.text(40, y2 + 13, o.letters + '   ' + o.order.join(' '), { size: 11.5, color: INK, base: 'middle', mono: true });
      P.text(400, y2 + 13, o.violations === 0 ? 'clean' : o.violations + ' broken',
        { size: 11.5, color: o.violations === 0 ? VAL : BAD, base: 'middle' });
    });

    P.alpha(rv(t, sc.start + 8.6, 1.0));
    P.text(470, 258, note[0], { size: 12, color: INK });
    P.text(470, 280, note[1], { size: 12, color: DIM });
    P.text(470, 302, note[2], { size: 12, color: DIM });
    P.text(470, 330, 'Edges come from reading.', { size: 11.5, color: FAINT });
    P.text(470, 348, 'The count is what makes the answer', { size: 11.5, color: FAINT });
    P.text(470, 366, 'checkable rather than a feeling.', { size: 11.5, color: FAINT });
    P.text(470, 398, 'Sentences are shortened for the canvas.', { size: 10, color: FAINT });
    P.text(470, 412, 'The full text is on the Examples tab.', { size: 10, color: FAINT });
    P.alpha(1);
  }

  function drawSeq1(P, t, sc) {
    drawSeq(P, t, sc, SEQ1, [
      'The opener is the sentence with no',
      'backward reference: (iii), the market.',
      'Every other sentence points back.'
    ]);
  }

  function drawSeq2(P, t, sc) {
    drawSeq(P, t, sc, SEQ2, [
      'The links here are a demonstrative',
      'and a connector, not a pronoun.',
      'Two options open with "Thus".'
    ]);
  }

  /* ---------- scene 10: the procedure ---------- */
  function drawProc(P, t, sc) {
    var steps = [
      { n: '1', t: 'Name what governs', d: 'the head noun, the next sound, the time type, the idiom' },
      { n: '2', t: 'Read once, no options', d: 'write the premises, or the sentences, in one line each' },
      { n: '3', t: 'Test each option', d: 'substitute it and ask what the sentence now says' },
      { n: '4', t: 'Strike additions', d: 'all, only, must, a cause the passage never states' },
      { n: '5', t: 'Check once', d: 'point to the line, or to the edge, that decides it' }
    ];
    steps.forEach(function (s, i) {
      var a = rv(t, sc.start + 0.4 + i * 1.4, 1.0);
      P.alpha(a);
      var col = i % 3, row = Math.floor(i / 3);
      var x = 28 + col * 288, y = 84 + row * 122;
      box(P, x, y, 268, 104, i === 4 ? ACCDIM : SURF, i === 4 ? ACC : BORDER);
      chip(P, x + 12, y + 10, 'step ' + s.n, ACC, ACCDIM);
      P.text(x + 12, y + 42, s.t, { size: 13.5, bold: true, color: INK });
      lines(P, x + 12, y + 64, wrap(s.d, 32).slice(0, 3), 10.5, DIM, 14);
    });
    P.alpha(rv(t, sc.start + 7.6, 1.0));
    P.text(28, 348, 'One procedure for four question shapes: ' + SECTION.questions +
      ' questions and ' + SECTION.marks + ' marks in every paper.', { size: 12.5, color: INK });
    P.text(28, 370, 'The two-mark items are comprehension and sequencing, so learn their procedures first.',
      { size: 12, color: DIM });
    P.alpha(1);
  }

  var SCENES = {
    ask: drawAsk,
    agree: drawAgree,
    article: drawArticle,
    prep: drawPrep,
    idiom: drawIdiom,
    vocab: drawVocab,
    rc: drawRC,
    seq1: drawSeq1,
    seq2: drawSeq2,
    proc: drawProc
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
