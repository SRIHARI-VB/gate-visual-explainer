/* ==========================================================================
   tense-adjectives-and-conjunctions — THE timeline.
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
      id: 'three',
      n: 1,
      title: 'Three named items, one question shape',
      start: 0, end: 30,
      objective: 'Name the three grammar items the syllabus lists that no earlier lesson covers — tenses, adjectives, conjunctions — and see that all three ask for a form the sentence has already fixed.'
    },
    {
      id: 'grid',
      n: 2,
      title: 'Tense and aspect: two dials, twelve forms',
      start: 30, end: 60,
      objective: 'Separate tense (when) from aspect (how), build all twelve forms of a regular and an irregular verb in code, and check that the twelve are distinct.'
    },
    {
      id: 'perfect',
      n: 3,
      title: 'The perfect aspect',
      start: 60, end: 90,
      objective: 'Read the perfect aspect as a relation to a reference point — a past before a past, or a span that reaches now — and use it to eliminate three of four options.'
    },
    {
      id: 'clause',
      n: 4,
      title: 'Tense inside a subordinate clause',
      start: 90, end: 120,
      objective: 'Keep the future marker in the main clause, and read an inverted second conditional as an unreal present that takes would.'
    },
    {
      id: 'compare',
      n: 5,
      title: 'Comparatives, superlatives, and the count',
      start: 120, end: 150,
      objective: 'Choose the degree of an adjective from the number of things compared, and recognise a comparison marked twice.'
    },
    {
      id: 'absolute',
      n: 6,
      title: 'Adjectives that do not grade',
      start: 150, end: 180,
      objective: 'Test thirty degree modifiers against eight absolute adjectives and two gradable controls, and see the rejection is a property of the adjective.'
    },
    {
      id: 'order',
      n: 7,
      title: 'Adjective order',
      start: 180, end: 210,
      objective: 'Place adjectives in the conventional order, count the inversions of each printed order, and see that exactly one order has none.'
    },
    {
      id: 'participle',
      n: 8,
      title: 'The -ed and -ing pair',
      start: 210, end: 240,
      objective: 'Decide between the -ed and -ing forms by asking who feels and what causes, and find the two sentences of six that swap the roles.'
    },
    {
      id: 'conj',
      n: 9,
      title: 'Conjunctions: class, doubling, polarity',
      start: 240, end: 270,
      objective: 'Separate coordinating from subordinating conjunctions by the fronting test, and use the polarity the conjunction sets to choose the word in the blank.'
    },
    {
      id: 'agree',
      n: 10,
      title: 'Agreement: where proximity wins',
      start: 270, end: 300,
      objective: 'See that the nearest-noun guess is right in every neither-nor sentence and wrong in every as-well-as sentence, so the construction decides and distance does not.'
    }
  ],

  events: [
    /* ---------------- scene 1: three ---------------- */
    {
      id: 'a1', scene: 'three', start: 0, end: 7.5,
      caption: 'Section 1 names tenses, adjectives and conjunctions — three items no earlier lesson here covers.',
      detail: 'The GATE 2027 General Aptitude syllabus for Section 1 reads: basic English grammar — tenses, articles, adjectives, prepositions, conjunctions, verb-noun agreement, and other parts of speech. Articles, prepositions and verb-noun agreement already have a lesson. Tenses, adjectives and conjunctions are the three that do not.',
      narration: 'Section one names three grammar items that no lesson here has covered yet.',
      keyword: 'tenses, adjectives and conjunctions',
      trap: 'A grammar blank is not a vote on which word sounds best.'
    },
    {
      id: 'a2', scene: 'three', start: 7.5, end: 15,
      caption: 'All three ask for a FORM the sentence has already fixed: which tense, which degree, which link.',
      detail: 'A tense question asks which of the twelve tense-and-aspect forms the sentence requires. An adjective question asks which degree — positive, comparative or superlative — or which order. A conjunction question asks which class of link, and which polarity the link demands of the other clause.',
      narration: 'Each of the three asks for a form, not a meaning.',
      keyword: 'form',
      trap: 'Guessing by meaning works on vocabulary questions; it fails on all three of these.'
    },
    {
      id: 'a3', scene: 'three', start: 15, end: 22.5,
      caption: 'The sentence prints the feature that decides the blank. Find the feature before the options.',
      detail: 'A time expression decides the tense: after, before, since, for, in 2019, yesterday. A count of things decides the degree: of the two, of the three, of all. The conjunction decides the polarity of what follows: but and although demand a contrast, because and so demand a consequence.',
      narration: 'The sentence prints the deciding feature.',
      keyword: 'deciding feature',
      trap: 'The most natural-sounding option is the trap in all three of these question shapes.'
    },
    {
      id: 'a4', scene: 'three', start: 22.5, end: 30,
      caption: 'Two of the items worked here are previous-year questions with published keys; every count is computed.',
      detail: 'GATE CSE 2017 Set 1 GA Question 1 (tense), GATE CSE 2013 GA Question 59 (conditional), GATE CSE 2012 GA Questions 57 and 59 (conjunction polarity, adjective degree) and GATE CSE 2020 GA Question 2 (conjunction polarity) each carry their paper and question number, and the key printed is the published one.',
      narration: 'Two of the worked items are previous-year questions with their published keys.',
      keyword: 'previous-year',
      trap: 'A question that merely resembles a past paper is not a previous-year question.'
    },

    /* ---------------- scene 2: grid ---------------- */
    {
      id: 'b1', scene: 'grid', start: 30, end: 37.5,
      caption: 'Tense says when. Aspect says how. Two dials, not one.',
      detail: 'Tense places the event: past, present or future. Aspect says how the event sits against that time: simple (a whole event), perfect (completed before a reference point), continuous (in progress), perfect continuous (in progress up to a reference point).',
      narration: 'Tense says when, and aspect says how.',
      keyword: 'two dials',
      trap: 'Treating tense as a single list of twelve names to memorise hides the structure.'
    },
    {
      id: 'b2', scene: 'grid', start: 37.5, end: 45,
      caption: 'The perfect is one bit: has, have or had. The continuous is another: the -ing form.',
      detail: 'The two bits are independent. Perfect alone gives has walked; continuous alone gives is walking; both together give has been walking; neither gives walks. Two independent bits make four aspects, and four aspects across three tenses make twelve cells.',
      narration: 'Perfect is one bit and continuous is another, so four aspects come from two bits.',
      keyword: 'two bits',
      trap: 'Perfect and continuous are not two points on one scale; they combine.'
    },
    {
      id: 'b3', scene: 'grid', start: 45, end: 52.5,
      caption: 'Twelve cells, twelve different forms — for a regular verb and for an irregular one.',
      detail: 'The page builds all twelve forms of walk and all twelve of write and checks that no two are the same string. A regular verb changes its simple past to -ed; an irregular one does not, and that is the only difference the grid shows.',
      narration: 'Twelve cells give twelve different forms, for a regular verb and an irregular one.',
      keyword: 'twelve different forms',
      trap: 'The irregular verb does not break the grid; it fills the same twelve cells.'
    },
    {
      id: 'b4', scene: 'grid', start: 52.5, end: 60,
      caption: 'So a form question is decodable: the form names both dials.',
      detail: 'Because the map from the pair (tense, aspect) to the form is one-to-one on these verbs, seeing the form tells you the tense and the aspect. That is why the blank can be decided from the sentence rather than from a feeling about which version sounds right.',
      narration: 'Because the twelve forms are all different, the form names both dials.',
      keyword: 'decodable',
      trap: 'A form that sounds unusual is not therefore wrong; check the cell it belongs to.'
    },

    /* ---------------- scene 3: perfect ---------------- */
    {
      id: 'c1', scene: 'perfect', start: 60, end: 67.5,
      caption: 'A previous-year tense item: after he returned, he ______ to visit the temple.',
      detail: 'GATE CSE 2017 Set 1, GA Question 1, one mark. After Rajendra Chola returned from his voyage to Indonesia, he ______ to visit the temple in Thanjavur. The options are was wishing, is wishing, wished and had wished.',
      narration: 'Here is a previous-year tense item from the 2017 paper.',
      keyword: 'after he returned',
      trap: 'The word after already fixes the order of the two events; the tense must agree with it.'
    },
    {
      id: 'c2', scene: 'perfect', start: 67.5, end: 75,
      caption: 'The past perfect puts an event before the reference point. Simple past puts it at or after.',
      detail: 'Had wished means the wish came before the return. Wished means the wish came after the return, which is what after demands. Was wishing describes an ongoing wish and is wishing is present, so neither sits inside the past frame the sentence has set.',
      narration: 'Past perfect puts the event before the reference point, and simple past puts it after.',
      keyword: 'before the reference point',
      trap: 'The past perfect sounds more careful, which is exactly why it is the wrong option here.'
    },
    {
      id: 'c3', scene: 'perfect', start: 75, end: 82.5,
      caption: 'Exactly one of the four options places the wish after the return. The published key is that one.',
      detail: 'The page assigns each option a relation to the reference point — before, now, or after — and counts how many satisfy the requirement set by after. The count is one, and it is wished, which is the published key.',
      narration: 'Exactly one option places the wish after the return, and that is the key.',
      keyword: 'exactly one',
      trap: 'Two options are past tense; only one of them is on the right side of the reference point.'
    },
    {
      id: 'c4', scene: 'perfect', start: 82.5, end: 90,
      caption: 'The other perfect: a span that reaches now. Since and for open it; in 2019 and last year close it.',
      detail: 'A span that continues to the present takes the present perfect: has worked since 2019, has worked for three years, has worked so far. A closed point takes the simple past: worked in 2019, worked last year, worked yesterday. The 2020 preposition item is the same rule seen from the other side: has been practising for the last three weeks.',
      narration: 'Since and for open a span that reaches now, and in 2019 closes it.',
      keyword: 'reaches now',
      trap: 'Since 2019 and in 2019 differ by one letter and force opposite tenses.'
    },

    /* ---------------- scene 4: clause ---------------- */
    {
      id: 'd1', scene: 'clause', start: 90, end: 97.5,
      caption: 'A future meaning does not take will inside an if-clause or a time clause.',
      detail: 'If it rains, we will cancel — not if it will rain. When she arrives, we will start — not when she will arrive. The future marker belongs to the main clause; the subordinate clause stays in the present even though it refers to the future.',
      narration: 'A future meaning does not take will inside an if-clause or a time clause.',
      keyword: 'inside an if-clause',
      trap: 'Will inside the if-clause feels logical and is the commonest error in the section.'
    },
    {
      id: 'd2', scene: 'clause', start: 97.5, end: 105,
      caption: 'Three of the six printed sentences break that rule, and the break is always in the same place.',
      detail: 'The page marks each sentence with where the future marker sits — the main clause or the subordinate clause — and counts the legal ones. Three place will in the main clause and are legal; three place it in the if- or when-clause and are not.',
      narration: 'Three of the six sentences break that rule, and always in the same place.',
      keyword: 'the same place',
      trap: 'Two sentences with will in them can differ by a single word and by legality.'
    },
    {
      id: 'd3', scene: 'clause', start: 105, end: 112.5,
      caption: 'Were you a bird, you ______ in the sky: an unreal present takes would, not shall.',
      detail: 'GATE CSE 2013, GA Question 59, one mark. The sentence drops if and inverts the verb, which makes it a second conditional: a past subjunctive condition and would plus a base verb in the result. The published key is would fly.',
      narration: 'An unreal present takes would, not shall.',
      keyword: 'would',
      trap: 'The inverted form hides the if, so the sentence looks like a statement rather than a condition.'
    },
    {
      id: 'd4', scene: 'clause', start: 112.5, end: 120,
      caption: 'One of the four options is would plus a base verb. That one is the key.',
      detail: 'The page labels each option by the modal it uses — conditional, future, obligation, future perfect — and counts how many are conditional. The count is one. Shall and should both describe the real world, which is what the sentence denies.',
      narration: 'One of the four options is would plus a base verb, and that is the key.',
      keyword: 'would plus a base verb',
      trap: 'Should means obligation, so it describes the real world the sentence has already ruled out.'
    },

    /* ---------------- scene 5: compare ---------------- */
    {
      id: 'e1', scene: 'compare', start: 120, end: 127.5,
      caption: 'Of the two takes the comparative; of the three takes the superlative.',
      detail: 'The degree of an adjective is decided by how many things are compared, and the sentence usually states the number. Two things take the comparative: the taller of the two. Three or more take the superlative: the tallest of the three, the most accurate of all.',
      narration: 'Of the two takes the comparative, and of the three takes the superlative.',
      keyword: 'how many things',
      trap: 'The count is printed in the sentence, so the degree is not a matter of taste.'
    },
    {
      id: 'e2', scene: 'compare', start: 127.5, end: 135,
      caption: 'Three of the five printed contexts are legal, and the page decides which by counting.',
      detail: 'Each context carries a number and a form. The rule assigns comparative to two and superlative to three or more, and the two are compared. Three match; the tallest of the two and the taller of the three do not.',
      narration: 'Three of the five contexts are legal, and the count decides which.',
      keyword: 'the count decides',
      trap: 'A superlative with two things is the commonest degree error in the papers.'
    },
    {
      id: 'e3', scene: 'compare', start: 135, end: 142.5,
      caption: 'Less is already comparative, so very less marks the comparison twice.',
      detail: 'A comparative already carries the comparison inside it, so it cannot also take more, most or very. More cheaper, most cheapest and very less are all marked twice. The intensifier that a comparative can take is much: much cheaper.',
      narration: 'Less is already comparative, so very less marks the comparison twice.',
      keyword: 'marked twice',
      trap: 'The error is invisible to the ear because very is grammatical with the positive form.'
    },
    {
      id: 'e4', scene: 'compare', start: 142.5, end: 150,
      caption: 'The 2012 paper asks for the incorrect sentence, and exactly one of the four has that clash.',
      detail: 'GATE CSE 2012, GA Question 59, one mark. The four sentences are tested for a degree modifier on a comparative, and exactly one fails: this country\u2019s expenditure on educational reforms is very less. The published key is that sentence.',
      narration: 'The 2012 paper asks for the incorrect sentence, and exactly one has that clash.',
      keyword: 'exactly one',
      trap: 'Three of the four sentences contain less or lesser, so the presence of the word does not decide.'
    },

    /* ---------------- scene 6: absolute ---------------- */
    {
      id: 'f1', scene: 'absolute', start: 150, end: 157.5,
      caption: 'Some adjectives do not come in degrees at all.',
      detail: 'A gradable adjective describes a quality that can be present in different amounts: careful, tired, tall. An absolute adjective names a state that either holds or does not: unique, dead, fatal, square, unanimous, entire, infinite, pregnant.',
      narration: 'Some adjectives do not come in degrees at all.',
      keyword: 'do not come in degrees',
      trap: 'The class is a property of the adjective, not a list of forbidden phrases to memorise.'
    },
    {
      id: 'f2', scene: 'absolute', start: 157.5, end: 165,
      caption: 'Nothing is more unique, most fatal or very dead: the modifier adds a comparison the word denies.',
      detail: 'If a thing is unique there is nothing to compare it with, so more unique contradicts the word. The same argument rules out very dead, extremely square and most unanimous. Each modifier assumes a scale the adjective has already closed.',
      narration: 'More unique and very dead add a scale the word has already closed.',
      keyword: 'a scale the word has closed',
      trap: 'More unique is common in speech, which is why it appears in distractors.'
    },
    {
      id: 'f3', scene: 'absolute', start: 165, end: 172.5,
      caption: 'Thirty modifiers are tried: twenty-four are rejected, all on the eight absolute adjectives.',
      detail: 'The page applies more, most and very to each of the eight absolute adjectives and to two gradable controls. All twenty-four tests on the absolutes are illegal and all six on the controls are legal, so the rejection belongs to the adjective rather than to the modifier.',
      narration: 'Twenty-four of thirty modifiers are rejected, all of them on the eight absolute adjectives.',
      keyword: 'twenty-four',
      trap: 'A rule that fails on careful as well would not be a rule about absolute adjectives.'
    },
    {
      id: 'f4', scene: 'absolute', start: 172.5, end: 180,
      caption: 'Complete and perfect are disputed in edited usage, so the papers avoid them.',
      detail: 'A more perfect Union is written into a founding document and more complete is common in edited prose, so the two words sit on the boundary rather than inside the class. A well-set question uses an adjective on which careful users agree, and this lesson tests only those.',
      narration: 'Complete and perfect are disputed in edited usage, so the papers avoid them.',
      keyword: 'disputed',
      trap: 'Calling more complete wrong is a defensible position, not a fact; say which usage you follow.'
    },

    /* ---------------- scene 7: order ---------------- */
    {
      id: 'g1', scene: 'order', start: 180, end: 187.5,
      caption: 'Adjectives come in a fixed order: opinion, size, age, shape, colour, origin, material, purpose.',
      detail: 'The conventional order places the most subjective adjective furthest from the noun and the most intrinsic one nearest it. A lovely little old rectangular green French silver whittling knife uses all eight positions in order.',
      narration: 'Adjectives come in a fixed order, from opinion at the far end to purpose nearest the noun.',
      keyword: 'a fixed order',
      trap: 'The order is a convention of usage, not a law of logic; the paper tests the clear cases only.'
    },
    {
      id: 'g2', scene: 'order', start: 187.5, end: 195,
      caption: 'A wrong order is a number of inversions, and a number can be counted.',
      detail: 'Give each adjective the rank of its class. A correct order is a strictly increasing sequence of ranks, and the number of pairs out of order is the inversion count. Zero inversions means the order is correct, and the count says how badly a wrong order is wrong.',
      narration: 'A wrong order is a number of inversions, and that number can be counted.',
      keyword: 'inversions',
      trap: 'Two wrong orders can sound equally wrong and have different inversion counts.'
    },
    {
      id: 'g3', scene: 'order', start: 195, end: 202.5,
      caption: 'Four printed orders of four adjectives: exactly one has no inversion at all.',
      detail: 'For a small old round wooden table the four options are scored by inversion count. Small old round wooden scores zero; wooden small old round scores three; old small round wooden and small round old wooden score one each.',
      narration: 'Four printed orders, and exactly one has no inversion at all.',
      keyword: 'no inversion',
      trap: 'An order that begins correctly can still break later, which is why the count beats the first impression.'
    },
    {
      id: 'g4', scene: 'order', start: 202.5, end: 210,
      caption: 'Published descriptions of the order disagree on age against shape, so no item turns on that pair.',
      detail: 'Some references place shape before age and others place age before shape; both are in current use and both appear in teaching material. An exam item that turned on that pair alone would be unfair, so this lesson teaches the order and marks the pair as unsettled.',
      narration: 'Published descriptions disagree on age against shape, so no item turns on that pair.',
      keyword: 'disagree',
      trap: 'Treating one published table as the only truth makes a fair question look ambiguous.'
    },

    /* ---------------- scene 8: participle ---------------- */
    {
      id: 'h1', scene: 'participle', start: 210, end: 217.5,
      caption: 'The -ed form names the one who feels; the -ing form names the cause.',
      detail: 'Bored and boring are both adjectives made from the same verb, and they point in opposite directions. The -ed form describes the experiencer: the person who is bored. The -ing form describes the thing that produces the feeling: the lecture that is boring.',
      narration: 'The -ed form names the one who feels, and the -ing form names the cause.',
      keyword: 'who feels and what causes',
      trap: 'Both forms are adjectives, so grammar alone cannot choose between them.'
    },
    {
      id: 'h2', scene: 'participle', start: 217.5, end: 225,
      caption: 'The students were bored; the lecture was boring. The same event, two roles.',
      detail: 'The sentence subject decides which form is legal. A subject that experiences the feeling takes the -ed form; a subject that produces it takes the -ing form. Swapping them produces a sentence that parses and means nothing.',
      narration: 'The students were bored and the lecture was boring: one event, two roles.',
      keyword: 'two roles',
      trap: 'The swapped sentence is grammatical, which is why it survives a grammar-only check.'
    },
    {
      id: 'h3', scene: 'participle', start: 225, end: 232.5,
      caption: 'Two of the six printed sentences swap the roles, and the page finds them by rule.',
      detail: 'Each sentence carries its subject and that subject\u2019s role. The page requires the -ed form for an experiencer and the -ing form for a cause, and counts the disagreements. Four agree; the film was bored and the audience was boring do not.',
      narration: 'Two of the six sentences swap the roles, and the page finds them by rule.',
      keyword: 'two of the six',
      trap: 'The error sounds like a vocabulary mistake and is a role mistake.'
    },
    {
      id: 'h4', scene: 'participle', start: 232.5, end: 240,
      caption: 'Ask who feels and what causes before you choose the ending.',
      detail: 'Name the subject, then name its role in the event. If the subject feels, take the -ed form; if the subject causes, take the -ing form. The procedure costs one question and decides the blank without a feeling for which word sounds better.',
      narration: 'Ask who feels and what causes before choosing the ending.',
      keyword: 'who feels',
      trap: 'Choosing by which form is more common in your own speech gets the pair backwards.'
    },

    /* ---------------- scene 9: conj ---------------- */
    {
      id: 'i1', scene: 'conj', start: 240, end: 247.5,
      caption: 'Seven coordinating conjunctions join equals. Nine subordinating ones attach a dependent clause.',
      detail: 'And, but, or, nor, for, yet and so join two clauses of equal standing. Because, although, though, whereas, while, since, unless, if and that attach a clause that cannot stand alone. Sixteen connectors in two classes, and the class decides what the sentence may do.',
      narration: 'Seven coordinating conjunctions join equals, and nine subordinating ones attach a dependent clause.',
      keyword: 'two classes',
      trap: 'The two classes look alike in a list and behave differently in a sentence.'
    },
    {
      id: 'i2', scene: 'conj', start: 247.5, end: 255,
      caption: 'Only a subordinating conjunction can be fronted with its clause and followed by a comma.',
      detail: 'Because it rained, we stayed in is a sentence. But it rained, we stayed in is not. The page applies the fronting test to all sixteen connectors: nine pass and seven fail, which reproduces the two classes without using their names.',
      narration: 'Only a subordinating conjunction can be fronted with its clause.',
      keyword: 'fronted',
      trap: 'A coordinator at the start of a sentence is a fragment, not a contrast.'
    },
    {
      id: 'i3', scene: 'conj', start: 255, end: 262.5,
      caption: 'One relation needs one marker: although with but marks the contrast twice.',
      detail: 'Although he was tired, but he finished the report carries two contrast markers for one contrast. Because it rained, so we cancelled the match does the same with cause. The page counts markers against relations, and the two doubled sentences are the only ones where the counts differ.',
      narration: 'One relation needs one marker, so although with but marks the contrast twice.',
      keyword: 'one marker',
      trap: 'The doubled version sounds emphatic and is the error the paper prints.'
    },
    {
      id: 'i4', scene: 'conj', start: 262.5, end: 270,
      caption: 'But sets a contrast, so the clause after it must be negative. One option of four is.',
      detail: 'GATE CSE 2020, GA Question 2, one mark. His knowledge of the subject was excellent, but his classroom performance was ______. The first clause is positive, the conjunction demands a contrast, and exactly one of the four options is negative: extremely poor. The published key is that option.',
      narration: 'But sets a contrast, so the clause after it must be negative, and one option of four is.',
      keyword: 'must be negative',
      trap: 'Good, desirable and praiseworthy are all correct English; none of them contrasts.'
    },

    /* ---------------- scene 10: agree ---------------- */
    {
      id: 'j1', scene: 'agree', start: 270, end: 277.5,
      caption: 'Neither nor takes the nearer subject. As well as takes the first subject and ignores the nearer one.',
      detail: 'In neither the manager nor the clerks, the verb follows clerks, the nearer noun. In the manager, as well as the clerks, the verb follows manager, the first noun, and the phrase introduced by as well as is set aside. Two constructions, two different nouns in charge.',
      narration: 'Neither nor takes the nearer subject, and as well as takes the first.',
      keyword: 'the nearer subject',
      trap: 'One construction rewards the nearest noun and the other punishes it.'
    },
    {
      id: 'j2', scene: 'agree', start: 277.5, end: 285,
      caption: 'Proximity is right in all four correlative sentences and wrong in both additive ones.',
      detail: 'The page runs both rules on six sentences. The nearest-noun rule scores four of four on the neither-nor sentences and zero of two on the as-well-as sentences. The head-noun rule does exactly the reverse, scoring zero of four and two of two.',
      narration: 'Proximity is right in all four correlative sentences and wrong in both additive ones.',
      keyword: 'four of four',
      trap: 'A rule that scores four of four on one construction looks universal until the other appears.'
    },
    {
      id: 'j3', scene: 'agree', start: 285, end: 292.5,
      caption: 'The nearest-noun guess that fails on the list of items is right here. The construction decides.',
      detail: 'The list of items is on the desk takes a singular verb, so proximity loses. Neither the manager nor the clerks are available takes a plural verb, so proximity wins. The distance to the nearest noun is the same in both sentences; what differs is the construction the nouns sit in.',
      narration: 'The same nearest-noun guess that fails on the list of items is right here.',
      keyword: 'the construction decides',
      trap: 'Learning the rule as always nearest or never nearest gets one of the two families wrong.'
    },
    {
      id: 'j4', scene: 'agree', start: 292.5, end: 300,
      caption: 'Five steps for all three items: name the feature, test the options, then check once.',
      detail: 'Find the feature the sentence prints — the time expression, the count of things, or the conjunction. Name what it forces. Test each option against that one requirement. Strike any option that is grammatical but off the feature. Check the survivor against the sentence once more.',
      narration: 'Five steps for all three items: name the feature, test the options, and check once.',
      keyword: 'five steps',
      trap: 'Testing options by whether they sound right skips the only step that decides the blank.'
    }
  ]
};
