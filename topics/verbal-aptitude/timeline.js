/* ==========================================================================
   verbal-aptitude — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs — never edited by hand.

   Every number quoted in a caption is computed by the model in lesson.js and
   printed on the canvas; the two agree because both read the same computation.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'ask',
      n: 1,
      title: 'What Section 1 asks',
      start: 0, end: 30,
      objective: 'Name the four kinds of decision that Section 1 of the General Aptitude syllabus asks for, and see that every question in it is one of the four.'
    },
    {
      id: 'agree',
      n: 2,
      title: 'Agreement: the head noun decides',
      start: 30, end: 60,
      objective: 'Decide a verb from the head of its subject rather than from the nearest noun, and see the two rules disagree on one sentence.'
    },
    {
      id: 'article',
      n: 3,
      title: 'Articles: a sound, not a letter',
      start: 60, end: 90,
      objective: 'Choose a or an from the first sound of the next word, and score a letter-based rule on the three words of the 2025 item.'
    },
    {
      id: 'prep',
      n: 4,
      title: 'Prepositions of time: length, point, deadline',
      start: 90, end: 120,
      objective: 'Type a time expression, then choose the preposition that accepts that type, and eliminate three of the four option pairs.'
    },
    {
      id: 'idiom',
      n: 5,
      title: 'Idioms: four blanks, four fixed particles',
      start: 120, end: 150,
      objective: 'Treat each idiom as a fixed phrase with one legal particle, and count violations for all four option tuples.'
    },
    {
      id: 'vocab',
      n: 6,
      title: 'Vocabulary: a ladder, or a clue in the sentence',
      start: 150, end: 180,
      objective: 'Answer an intensity analogy by ranking both ladders, and a word-in-context question by the polarity of the clue.'
    },
    {
      id: 'rc',
      n: 7,
      title: 'Comprehension: what the passage entails',
      start: 180, end: 210,
      objective: 'Write the premises, then strike every option that adds a universal the passage never uses.'
    },
    {
      id: 'seq1',
      n: 8,
      title: 'Sequencing: a paragraph is a graph',
      start: 210, end: 240,
      objective: 'Turn three backward references into three edges, try all twenty-four orders, and find the one that survives.'
    },
    {
      id: 'seq2',
      n: 9,
      title: 'Sequencing with determiners and connectors',
      start: 240, end: 270,
      objective: 'Solve the 2024 para-jumble by its demonstratives and its concluding connector, and score the four printed options.'
    },
    {
      id: 'proc',
      n: 10,
      title: 'The five-step procedure',
      start: 270, end: 300,
      objective: 'Reduce the whole section to five steps that work on every shape it uses.'
    }
  ],

  events: [
    /* ---------------- scene 1: ask ---------------- */
    {
      id: 'a1', scene: 'ask', start: 0, end: 7.5,
      caption: 'Section 1 names four verbal skills: grammar, vocabulary in context, comprehension, sequencing.',
      detail: 'Section 1 of the GATE 2027 General Aptitude syllabus: basic English grammar (tenses, articles, adjectives, prepositions, conjunctions, verb-noun agreement, other parts of speech); basic vocabulary (words, idioms and phrases in context); reading and comprehension; narrative sequencing. Four clauses, four kinds of decision.',
      narration: 'Section one of General Aptitude names four verbal skills.',
      keyword: 'four verbal skills',
      trap: 'The four clauses are not four topics to memorise; they are four kinds of decision.'
    },
    {
      id: 'a2', scene: 'ask', start: 7.5, end: 15,
      caption: 'Grammar asks one feature at a time: a sound, a number, a kind of time expression, a fixed particle.',
      detail: 'An article depends on the first sound of the next word. Agreement depends on the number of the head noun. A preposition of time depends on whether the expression is a length, a point or a deadline. An idiom depends on one fixed particle.',
      narration: 'Grammar questions test one feature at a time.',
      keyword: 'one feature',
      trap: 'The commonest wrong answer is the right answer to a neighbouring feature.'
    },
    {
      id: 'a3', scene: 'ask', start: 15, end: 22.5,
      caption: 'Vocabulary asks for a word where it stands: the sentence, not the dictionary, supplies the meaning.',
      detail: 'A word in context is defined by its sentence, usually through a because-clause or a contrast. A scale question is different: the answer is decided by direction, not by meaning.',
      narration: 'Vocabulary questions ask for a word where it stands.',
      keyword: 'where it stands',
      trap: 'A synonym from the dictionary can be the wrong answer when the sentence names a direction.'
    },
    {
      id: 'a4', scene: 'ask', start: 22.5, end: 30,
      caption: 'Comprehension asks what is entailed; sequencing asks what order the sentences must take.',
      detail: 'Entailment means true in every situation the passage allows. Sequencing means a topological order of the sentences under their backward references. Ten questions and fifteen marks in every paper, so both are worth a procedure.',
      narration: 'Comprehension asks what is entailed, sequencing asks what order is forced.',
      keyword: 'entailed',
      trap: 'Reading the options before the passage is how the true-but-unstated option wins.'
    },

    /* ---------------- scene 2: agree ---------------- */
    {
      id: 'b1', scene: 'agree', start: 30, end: 37.5,
      caption: 'Agreement is decided by the head of the subject, not by the noun nearest the verb.',
      detail: 'The subject is the noun phrase the verb is about. Its head is the noun the phrase cannot lose. Agreement is a match in number between that head and the verb.',
      narration: 'Agreement is decided by the head of the subject.',
      keyword: 'head',
      trap: 'The nearest noun is the distractor, and it is what most candidates match.'
    },
    {
      id: 'b2', scene: 'agree', start: 37.5, end: 45,
      caption: 'In "the list of items", the head is "list", singular; "of items" is a modifier and changes nothing.',
      detail: 'A prepositional phrase inside a subject modifies the noun before it. Deleting it leaves "the list is on the desk", which is the sentence the verb agrees with.',
      narration: 'The head is list, singular; of items is a modifier.',
      keyword: 'modifier',
      trap: 'Deleting the phrase is the whole test, and it takes two seconds.'
    },
    {
      id: 'b3', scene: 'agree', start: 45, end: 52.5,
      caption: 'So the verb is "is". Matching the nearest noun writes "are" — the attraction error.',
      detail: 'The model computes both verdicts on the same sentence: the head-noun rule returns is, the nearest-noun rule returns are. They differ on exactly this configuration, which is why one sentence is enough to refute the second rule.',
      narration: 'The verb is is; the nearest noun would give are.',
      keyword: 'attraction',
      trap: 'Two rules that agree almost everywhere disagree here, and that is the whole question.'
    },
    {
      id: 'b4', scene: 'agree', start: 52.5, end: 60,
      caption: '"A number of applicants have applied", but "the number of applicants has risen".',
      detail: 'In "a number of" the phrase is a determiner meaning many, so the head is applicants, plural. In "the number of" the head is number, singular. Two phrases that look alike take opposite verbs.',
      narration: 'A number of applicants have applied; the number of applicants has risen.',
      keyword: 'a number of',
      trap: 'Learn the pair together, because each one is the other one\'s counterexample.'
    },

    /* ---------------- scene 3: article ---------------- */
    {
      id: 'c1', scene: 'article', start: 60, end: 67.5,
      caption: 'An article is chosen by the first sound of the next word, not by its first letter.',
      detail: 'A and an are the two indefinite articles. The choice depends on whether the next word begins with a vowel sound or a consonant sound. Spelling is a poor guide in both directions.',
      narration: 'An article is chosen by sound, not by letter.',
      keyword: 'first sound',
      trap: 'The letter rule is right often enough to be trusted, and wrong on the words examiners choose.'
    },
    {
      id: 'c2', scene: 'article', start: 67.5, end: 75,
      caption: '"University" begins with the consonant sound /j/, so it takes "a university".',
      detail: 'The word is spelled with a vowel letter and pronounced with a consonant sound. The same is true of European and one-off. A letter rule writes an university, which no speaker says.',
      narration: 'University begins with the sound y, so it takes a.',
      keyword: '/j/',
      trap: 'Vowel letter is not vowel sound; that is the first of the two traps.'
    },
    {
      id: 'c3', scene: 'article', start: 75, end: 82.5,
      caption: '"Honorable" begins with a vowel sound because the h is silent, so it takes "an".',
      detail: 'The same fact explains an hour, an heir and an MP, where the letter M is pronounced em. The consonant letter is not pronounced, so it does not count.',
      narration: 'Honorable has a silent h, so it takes an.',
      keyword: 'silent h',
      trap: 'Consonant letter is not consonant sound; that is the second trap.'
    },
    {
      id: 'c4', scene: 'article', start: 82.5, end: 90,
      caption: 'On the three words of the 2025 item, the letter rule scores one of three; the sound rule scores three.',
      detail: 'The model runs both rules over younger brother, university and honorable man. The letter rule returns a, an, a — right on the first, wrong on the other two. The sound rule returns a, a, an, which is the published key.',
      narration: 'The letter rule gets one of three; the sound rule gets all three.',
      keyword: 'one of three',
      trap: 'Two of the three words in this item are chosen precisely because spelling misleads.'
    },

    /* ---------------- scene 4: prep ---------------- */
    {
      id: 'd1', scene: 'prep', start: 90, end: 97.5,
      caption: 'Prepositions of time take three kinds of expression: a length, a point, a deadline.',
      detail: 'A length answers how long; a point answers from when; a deadline answers by when. Each preposition accepts one of the three types, and a mismatch is a grammar error however natural it sounds.',
      narration: 'Prepositions of time take three kinds of expression.',
      keyword: 'three kinds',
      trap: 'The error sounds wrong only after you name the type; before that it sounds fine.'
    },
    {
      id: 'd2', scene: 'prep', start: 97.5, end: 105,
      caption: '"For" takes a length, "since" takes a starting point, "within" takes a deadline.',
      detail: 'For three weeks, for six months. Since 2019, since Monday, since the merger. Within six months, within an hour. The preposition is a type signature, and the expression must match it.',
      narration: 'For a length, since a point, within a deadline.',
      keyword: 'type signature',
      trap: 'Within is the one candidates forget, and it is the only one that states a deadline.'
    },
    {
      id: 'd3', scene: 'prep', start: 105, end: 112.5,
      caption: '"For the last three weeks" is right; "since the last three weeks" is not: three weeks is a length.',
      detail: 'The model types the phrase "the last three weeks" as a length of twenty-one days and tests each preposition against that type. For accepts it; since does not; within does not.',
      narration: 'Three weeks is a length, so it takes for, not since.',
      keyword: 'length',
      trap: 'Two published solutions disagree about "in the last three weeks", so eliminate on the first blank.'
    },
    {
      id: 'd4', scene: 'prep', start: 112.5, end: 120,
      caption: 'The paper\'s pair is "within six months" and "for the last three weeks".',
      detail: 'The first blank is a deadline, so within. The second blank is a length, so for. Of the four option pairs, three fail on the first blank alone, which is the published key for GATE CSE 2020 GA Question 1.',
      narration: 'Within six months and for the last three weeks is the keyed pair.',
      keyword: 'within, for',
      trap: '"For six months" is perfect English and means a duration, so it cannot state a deadline.'
    },

    /* ---------------- scene 5: idiom ---------------- */
    {
      id: 'e1', scene: 'idiom', start: 120, end: 127.5,
      caption: 'An idiom\'s particle is part of the word: change it and the meaning changes or vanishes.',
      detail: 'An idiom is a fixed group of words whose meaning is not the sum of its parts. A phrasal verb is a verb plus a particle, and the particle is what selects the sense.',
      narration: 'An idiom\'s particle is part of the word.',
      keyword: 'particle',
      trap: 'Grammaticality is not the test here; fixedness is.'
    },
    {
      id: 'e2', scene: 'idiom', start: 127.5, end: 135,
      caption: 'Head down: stay out of trouble. Head out: leave. A head for: a talent. A cool head on your shoulders: composure.',
      detail: 'Four idioms share the word head and take four different particles. The sentence about Steve uses all four, so the question is a conjunction of four independent tests.',
      narration: 'Four idioms share the word head and take four particles.',
      keyword: 'four idioms',
      trap: 'One sentence, four idioms: a single wrong particle loses the mark.'
    },
    {
      id: 'e3', scene: 'idiom', start: 135, end: 142.5,
      caption: 'Four blanks, four fixed particles: down, out, for, on.',
      detail: 'The model holds a table of four idioms, each with its one legal particle, and the answer tuple is read off that table rather than chosen.',
      narration: 'Down, out, for, on.',
      keyword: 'down, out, for, on',
      trap: 'Reading the tuple off a table is faster than testing each blank separately.'
    },
    {
      id: 'e4', scene: 'idiom', start: 142.5, end: 150,
      caption: 'Of the paper\'s four tuples, three break at least two idioms; one breaks none.',
      detail: 'The model counts violations for each printed tuple: three, two, zero and three. Exactly one tuple has no violation, which is the published key for GATE CSE 2024 Set 1 GA Question 6.',
      narration: 'Three tuples break at least two idioms; one breaks none.',
      keyword: 'violations',
      trap: 'A tuple that is grammatical everywhere is not thereby idiomatic.'
    },

    /* ---------------- scene 6: vocab ---------------- */
    {
      id: 'f1', scene: 'vocab', start: 150, end: 157.5,
      caption: 'Vocabulary comes in two shapes: a ladder of intensity, and a word defined by its own sentence.',
      detail: 'A ladder question gives two rungs and asks for the third, so the relation is direction. A context question gives a sentence whose because-clause or contrast defines the word, so the relation is polarity.',
      narration: 'Vocabulary comes in two shapes: a ladder and a clue.',
      keyword: 'two shapes',
      trap: 'Both shapes reward naming the relation before reading the options.'
    },
    {
      id: 'f2', scene: 'vocab', start: 157.5, end: 165,
      caption: 'Dry, arid, parched rises in intensity, so diet, fast, starve must rise the same way.',
      detail: 'The model ranks both ladders and checks that the ranks strictly increase. Starve is the unique maximum among the options, which is why it is the keyed answer for GATE CSE 2024 Set 1 GA Question 1.',
      narration: 'Starve is the top of the second ladder.',
      keyword: 'starve',
      trap: 'Feast completes the ladder and reverses it, which is why it is offered.'
    },
    {
      id: 'f3', scene: 'vocab', start: 165, end: 172.5,
      caption: '"Sacrificed long-term stability to accommodate short-term gains" defines myopic as shortsighted.',
      detail: 'The because-clause is a definition, not a comment. The word here is the figurative sense — lacking foresight — and not the medical sense of being nearsighted.',
      narration: 'The because-clause defines myopic as shortsighted.',
      keyword: 'shortsighted',
      trap: 'The figurative sense is the one exam papers use, and the literal sense is the one that misleads.'
    },
    {
      id: 'f4', scene: 'vocab', start: 172.5, end: 180,
      caption: 'Three of the four options point the other way: visionary, progressive, innovative all describe foresight.',
      detail: 'The model records the polarity of each option against the clue and finds exactly one match. The published key for GATE CSE 2025 Set 1 GA Question 2 is shortsighted.',
      narration: 'Three options have the opposite polarity to the clue.',
      keyword: 'polarity',
      trap: 'All three distractors are complimentary words, and compliments read as safe answers.'
    },

    /* ---------------- scene 7: rc ---------------- */
    {
      id: 'g1', scene: 'rc', start: 180, end: 187.5,
      caption: 'A comprehension question is an entailment question: which option follows from the passage alone?',
      detail: 'Entailment means true in every situation the passage allows. Truth in the world is irrelevant, and an option that is sensible but unstated is wrong.',
      narration: 'Comprehension is an entailment question.',
      keyword: 'entailment',
      trap: 'Plausibility is the trap: the most sensible option is often the least entailed.'
    },
    {
      id: 'g2', scene: 'rc', start: 187.5, end: 195,
      caption: 'Three premises: most workers are ill, lack of exercise is one leading cause, cycling will be rewarded.',
      detail: 'The Zombieland passage gives exactly three statements of fact. Everything else in the passage is connective tissue, and nothing in it licenses a universal claim.',
      narration: 'Three premises, and no universal claim among them.',
      keyword: 'three premises',
      trap: 'One of the leading causes is not the only cause, and the wording matters.'
    },
    {
      id: 'g3', scene: 'rc', start: 195, end: 202.5,
      caption: 'Only one option follows: the government must believe cycling is exercise.',
      detail: 'The measure is aimed at the cause the passage names, so the government must take cycling to be exercise. That is the published key for GATE CSE 2023 GA Question 6.',
      narration: 'Only one option follows from those three premises.',
      keyword: 'follows',
      trap: 'The answer is an unstated belief, which feels weaker than the confident distractors.'
    },
    {
      id: 'g4', scene: 'rc', start: 202.5, end: 210,
      caption: 'Three of the four options use an absolute word the passage never uses: all, only, mandatory.',
      detail: 'The model scans the premises for absolute vocabulary and finds none, then scans the options and finds it in three. An option stronger than its premises is not entailed.',
      narration: 'Three options add an absolute word the passage lacks.',
      keyword: 'absolute word',
      trap: 'All, only, must, never, first: each one makes an option stronger than almost any passage.'
    },

    /* ---------------- scene 8: seq1 ---------------- */
    {
      id: 'h1', scene: 'seq1', start: 210, end: 217.5,
      caption: 'A jumbled paragraph is a graph: every sentence that points backwards must follow what it points to.',
      detail: 'Pronouns, demonstratives, definite articles, connectors and time words all create an obligation to come after another sentence. Write each obligation as a directed edge.',
      narration: 'A jumbled paragraph is a graph.',
      keyword: 'graph',
      trap: 'Reading for style gives an order you cannot defend; reading for edges gives one you can.'
    },
    {
      id: 'h2', scene: 'seq1', start: 217.5, end: 225,
      caption: 'Mina\'s four sentences chain three times: bags before panting, stairs before terrace, man before he.',
      detail: 'Sentence three gives the heavy bags that explain the panting in sentence two. Sentence two climbs the stairs before sentence one reaches the terrace. Sentence one introduces the man that sentence four calls he.',
      narration: 'Three edges, and the fourth sentence hangs off the first.',
      keyword: 'three edges',
      trap: 'Sentence one reads like an opener and cannot be one: once on the terrace presupposes the climb.'
    },
    {
      id: 'h3', scene: 'seq1', start: 225, end: 232.5,
      caption: 'Of the twenty-four orders, exactly one satisfies all three links: (iii), (ii), (i), (iv).',
      detail: 'The model enumerates all twenty-four permutations and filters by the three edges. Exactly one survives, and it is the published key for GATE CSE 2023 GA Question 8.',
      narration: 'One of twenty-four orders survives.',
      keyword: 'twenty-four',
      trap: 'Four options and twenty-four orders means the options are a check, not a method.'
    },
    {
      id: 'h4', scene: 'seq1', start: 232.5, end: 240,
      caption: 'That is the fourth option. Each other option breaks at least one of the three links.',
      detail: 'The model also scores the three printed distractors by the number of links they break, so the elimination is counted rather than asserted.',
      narration: 'Each other option breaks at least one link.',
      keyword: 'breaks a link',
      trap: 'An option can look natural and still violate the article rule or the pronoun rule.'
    },

    /* ---------------- scene 9: seq2 ---------------- */
    {
      id: 'i1', scene: 'seq2', start: 240, end: 247.5,
      caption: 'The second shape hides its links in determiners and connectors rather than pronouns.',
      detail: 'This event, this edifice and thus are all backward references. A demonstrative needs a noun phrase to point at, and a concluding connector needs a conclusion to close.',
      narration: 'The links can be determiners and connectors, not only pronouns.',
      keyword: 'determiners',
      trap: 'A connector at the start of an option is the fastest elimination available.'
    },
    {
      id: 'i2', scene: 'seq2', start: 247.5, end: 255,
      caption: '"This fortuitous geological event" must follow the collision; "this massive edifice" the risen rocks.',
      detail: 'The collision is named only in the sentence about the Antarctic and Eurasian plates. The edifice can only be the rock that rose four kilometres. Thus can only conclude.',
      narration: 'This event follows the collision; this edifice follows the risen rock.',
      keyword: 'this edifice',
      trap: 'Two of the four options put the risen rock before the collision that raised it.'
    },
    {
      id: 'i3', scene: 'seq2', start: 255, end: 262.5,
      caption: 'S, P, R, Q is the only printed option that keeps all three links.',
      detail: 'The model scores the four printed options by violated links: two, one, zero and one. The one with zero is the published key for GATE CSE 2024 Set 2 GA Question 6.',
      narration: 'One of the four printed options keeps every link.',
      keyword: 'keeps every link',
      trap: 'Checking options against edges is faster than checking edges against options.'
    },
    {
      id: 'i4', scene: 'seq2', start: 262.5, end: 270,
      caption: 'Two of the four options begin with "Thus", which can only conclude.',
      detail: 'A sentence beginning with thus, however or therefore cannot open a paragraph, because the word needs what it is drawing from. That single fact removes half the option set here.',
      narration: 'Two options begin with thus and can be struck at once.',
      keyword: 'thus',
      trap: 'However, therefore, thus, also, then: none of these can open a paragraph.'
    },

    /* ---------------- scene 10: proc ---------------- */
    {
      id: 'j1', scene: 'proc', start: 270, end: 277.5,
      caption: 'The section reduces to five steps that work on every shape it uses.',
      detail: 'One procedure, applied to grammar, vocabulary, comprehension and sequencing: find what governs the answer, read once without the options, test each option, strike additions, and check the result.',
      narration: 'One procedure covers every shape in this section.',
      keyword: 'five steps',
      trap: 'A procedure beats a word list, because the marks are in the two-mark items.'
    },
    {
      id: 'j2', scene: 'proc', start: 277.5, end: 285,
      caption: 'Step one: name what governs the blank — the head noun, the next sound, the time type, the idiom.',
      detail: 'Every grammar blank has exactly one governing word or feature. Naming it takes a second and converts a judgement into a check.',
      narration: 'Name what governs the blank.',
      keyword: 'governs',
      trap: 'Skipping this step is what makes the nearest noun look like the subject.'
    },
    {
      id: 'j3', scene: 'proc', start: 285, end: 292.5,
      caption: 'Step two: read the passage once without the options, and write its premises in one line each.',
      detail: 'For comprehension and sequencing, the options are a check on your own reading. Reading them first anchors you on somebody else\'s sentence order.',
      narration: 'Read once without the options.',
      keyword: 'without the options',
      trap: 'Options are written to be attractive; that is their job.'
    },
    {
      id: 'j4', scene: 'proc', start: 292.5, end: 300,
      caption: 'Steps three to five: test each option, strike any addition, and check the answer against the passage.',
      detail: 'An option that adds all, only, must or a cause is struck. A sequence option that breaks an edge is struck. What remains is checked once against the passage or the paragraph, and then written down.',
      narration: 'Test each option, strike additions, check once.',
      keyword: 'strike additions',
      trap: 'An answer you cannot point to a line for is a guess, however confident it feels.'
    }
  ]
};
