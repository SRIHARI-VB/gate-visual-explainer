/* ==========================================================================
   analytical-aptitude — THE timeline.
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
      title: 'What an analytical question actually asks',
      start: 0, end: 30,
      objective: 'Separate the two questions the syllabus names — what must be true, and what is merely a pattern — and see that each has a written test.'
    },
    {
      id: 'syllogism',
      n: 2,
      title: 'Deduction is a count over every model',
      start: 30, end: 60,
      objective: 'Turn a syllogism into an enumeration over the seven regions of three sets, and decide a conclusion by asking whether it holds in every model that satisfies the premises.'
    },
    {
      id: 'countermodel',
      n: 3,
      title: 'One model is enough to refute',
      start: 60, end: 90,
      objective: 'Refute a conclusion by exhibiting a single countermodel, and see how the option set — not the logic alone — makes a GATE answer unique.'
    },
    {
      id: 'conditional',
      n: 4,
      title: 'Conditionals: two valid forms and two famous invalid ones',
      start: 90, end: 120,
      objective: 'Test the four standard argument forms on the four rows of a truth table and name which two are licensed by implication and which two are not.'
    },
    {
      id: 'induction',
      n: 5,
      title: 'Induction: forty out of forty is not a proof',
      start: 120, end: 150,
      objective: 'Watch a pattern hold for forty consecutive cases and fail at the forty-first, and state precisely what an inductive conclusion does and does not carry.'
    },
    {
      id: 'series',
      n: 6,
      title: 'Numerical relations: differences and their limit',
      start: 150, end: 180,
      objective: 'Read a finite difference table to name the relation behind a sequence, then see why the next term is a convention rather than a deduction.'
    },
    {
      id: 'analogy',
      n: 7,
      title: 'Analogy: name the relation before you apply it',
      start: 180, end: 210,
      objective: 'Turn an analogy into a relation, count how many simple relations fit the given pair, and use the options to break the tie.'
    },
    {
      id: 'rank',
      n: 8,
      title: 'Counting in a line: positions, overlap, between',
      start: 210, end: 240,
      objective: 'Settle three arrangement counts with three one-line formulas, each derived rather than memorised.'
    },
    {
      id: 'grid',
      n: 9,
      title: 'Constraint reasoning on a grid',
      start: 240, end: 270,
      objective: 'Treat a grid of neighbour counts as a system of constraints, solve it by enumeration, and check that the clue set determines the answer uniquely.'
    },
    {
      id: 'procedure',
      n: 10,
      title: 'The five-step procedure',
      start: 270, end: 300,
      objective: 'Collect the five moves that settle an analytical question, in the order they should be tried.'
    }
  ],

  events: [
    /* ---------------- scene 1: ask ---------------- */
    {
      id: 'as-1', scene: 'ask', start: 0, end: 7.5,
      caption: 'An analytical question hands you statements and asks what they force.',
      detail: 'The statements are the premises. The thing asked is the conclusion. Everything in this section is one of two questions about the pair: does the conclusion follow in every case the premises allow, or does it follow only in the cases somebody has already looked at?',
      narration: 'An analytical question hands you a set of statements and asks what they force. The statements are the premises. The thing asked is the conclusion. And there are only two questions you can be asked about that pair.',
      keyword: 'what they force',
      trap: 'The premises are not a story to be interpreted. Only what they force counts.'
    },
    {
      id: 'as-2', scene: 'ask', start: 7.5, end: 15,
      caption: 'Question one: does the conclusion hold in every case the premises allow?',
      detail: 'This is deduction. The answer is yes or no, and a no is proved by producing one case in which the premises hold and the conclusion fails. That case is called a countermodel, and it is the whole of the work.',
      narration: 'Question one is deduction. Does the conclusion hold in every case the premises allow? The answer is yes or no, and a no is proved by producing one case where the premises hold and the conclusion fails. That case is called a countermodel.',
      keyword: 'every case',
      trap: 'A conclusion that holds in the cases you tried is not yet deducted. The cases you did not try are the question.'
    },
    {
      id: 'as-3', scene: 'ask', start: 15, end: 22.5,
      caption: 'Question two: does a pattern in the cases seen carry to the cases unseen?',
      detail: 'This is induction. It generalises from observed instances. It is not truth-preserving: the conclusion can be false while every premise is true, and one counterexample ends it. It is still what the syllabus means by induction — not the mathematical induction of the Discrete Mathematics paper.',
      narration: 'Question two is induction. Does a pattern in the cases you have seen carry to the cases you have not? Induction generalises from instances. It is not truth-preserving, one counterexample ends it, and it is not the mathematical induction of the Discrete Mathematics paper.',
      keyword: 'cases unseen',
      trap: 'Mathematical induction is a deduction. The word is the same; the operation is not.'
    },
    {
      id: 'as-4', scene: 'ask', start: 22.5, end: 30,
      caption: 'Both questions are settled in writing, on a page, without a picture in your head.',
      detail: 'The rest of the lesson is five written tests: a region count for syllogisms, a truth table for conditionals, a case count for induction, a difference table for a sequence, and a relation table for an analogy. Each is short enough to do in the exam.',
      narration: 'Both questions are settled in writing, on a page. The rest of this lesson is five written tests: a region count, a truth table, a case count, a difference table, and a relation table. Each one is short enough to do in the exam.',
      keyword: 'in writing',
      trap: 'Reading the options first invites you to match a shape rather than to test a claim.'
    },

    /* ---------------- scene 2: syllogism ---------------- */
    {
      id: 'sy-1', scene: 'syllogism', start: 30, end: 37.5,
      caption: 'Three sets cut the universe into seven regions, and a model is a choice of which are occupied.',
      detail: 'With sets A, B and C, every element sits in exactly one of seven places: outside all three, in exactly one, in exactly two, or in all three. A model of the premises is any choice of which of those seven places contain at least one element.',
      narration: 'Three sets cut the universe into seven regions. Every element sits in exactly one of them. A model is a choice of which regions contain at least one element. That is all a model is.',
      keyword: 'seven regions',
      trap: 'Two sets give three regions plus the outside; three sets give seven. Count them before you draw.'
    },
    {
      id: 'sy-2', scene: 'syllogism', start: 37.5, end: 45,
      caption: 'A premise is a rule that deletes models, and the surviving count is computed here.',
      detail: 'All A are B forbids every occupied region that is inside A and outside B. No B is C forbids every occupied region inside both B and C. Of the 127 non-empty choices of regions, fifteen survive both rules. That number is printed on the canvas, not quoted.',
      narration: 'A premise is a rule that deletes models. All A are B forbids any occupied region inside A and outside B. No B is C forbids any occupied region inside both B and C. Of the one hundred and twenty seven non-empty choices, fifteen survive.',
      keyword: 'fifteen survive',
      trap: 'The empty model is excluded, because a GATE syllogism assumes the classes it names are not empty unless it says so.'
    },
    {
      id: 'sy-3', scene: 'syllogism', start: 45, end: 52.5,
      caption: 'A conclusion is valid exactly when it survives every model the premises allowed.',
      detail: 'No A is C holds in all fifteen surviving models, so it is valid. Some A is C fails, because a model exists in which A is a part of B, C sits outside B, and nothing is in both A and C. All A are C also fails.',
      narration: 'A conclusion is valid exactly when it survives every one of the fifteen models. No A is C survives all fifteen, so it is valid. Some A is C fails, because a model exists where A sits inside B and C sits outside B.',
      keyword: 'every model',
      trap: 'Valid does not mean true. It means true in every model the premises allow.'
    },
    {
      id: 'sy-4', scene: 'syllogism', start: 52.5, end: 60,
      caption: 'The same two premises license six conclusions; the count decides which.',
      detail: 'Under All A are B and No B is C: No A is C and No C is A are valid; Some A is C, All A are C, Some C is not A and Some B is A are not. The canvas shows the verdict and a witness model for each failure.',
      narration: 'The same two premises license some conclusions and not others. No A is C and No C is A are valid. Four others are not, and for each the page prints a model that breaks it. The verdict is a count, not an opinion.',
      keyword: 'a count, not an opinion',
      trap: 'The order of the two sets in a negative conclusion does not matter; in an affirmative one it does.'
    },

    /* ---------------- scene 3: countermodel ---------------- */
    {
      id: 'cm-1', scene: 'countermodel', start: 60, end: 67.5,
      caption: 'To refute, do not argue — build one case in which the premises hold and the conclusion fails.',
      detail: 'A refutation is an object, not an argument. You exhibit a model. Once you have it, no amount of plausible reading of the question can rescue the conclusion, and the work is over.',
      narration: 'To refute a conclusion you do not argue. You build one case where the premises hold and the conclusion fails. A refutation is an object, not an argument. Once you have it, the work is over.',
      keyword: 'build one case',
      trap: 'A countermodel must satisfy every premise. A case that breaks a premise proves nothing.'
    },
    {
      id: 'cm-2', scene: 'countermodel', start: 67.5, end: 75,
      caption: 'GATE CSE 2022 Q4: four statements, and the pair that cannot both be true.',
      detail: 'The four statements are All students are inquisitive, Some students are inquisitive, No student is inquisitive, Some students are not inquisitive, with at least one student in the class. The four options offer four of the six possible pairs.',
      narration: 'Here is a real one. GATE 2022, question four. Four statements about students being inquisitive, with at least one student in the class, and four options, each naming a pair of statements.',
      keyword: 'four statements',
      trap: 'Read the phrase at least one student. Without it, two of these statements change meaning.'
    },
    {
      id: 'cm-3', scene: 'countermodel', start: 75, end: 82.5,
      caption: 'Three worlds exhaust the possibilities, and only one offered pair is impossible.',
      detail: 'A class is either all inquisitive, or mixed, or none. Statement one is true only in the first world, statement three only in the third, statement four in the second and third, statement two in the first and second. Pairing them up, exactly one of the four offered pairs has no world in common.',
      narration: 'A class is all inquisitive, or mixed, or none. Statement one is true only in the first world, statement three only in the third. Pairing them up, exactly one of the four offered pairs has no world in common. That is the answer.',
      keyword: 'one offered pair',
      trap: 'Statements one and four cannot both hold either — but that pair is not offered. The options bound the answer.'
    },
    {
      id: 'cm-4', scene: 'countermodel', start: 82.5, end: 90,
      caption: 'Answer A: statements one and three cannot be true at the same time.',
      detail: 'All are inquisitive and no one is inquisitive contradict each other as soon as the class is non-empty. The other three offered pairs each have a world: one and two in the all-world, two and four in the mixed world, three and four in the none-world.',
      narration: 'The answer is A, statements one and three. All are inquisitive and nobody is inquisitive cannot both hold while there is a student. The other three pairs each have a world of their own, so they can hold together.',
      keyword: 'answer A',
      trap: 'Three and four do hold together: if nobody is inquisitive, then some are not, given a non-empty class.'
    },

    /* ---------------- scene 4: conditional ---------------- */
    {
      id: 'co-1', scene: 'conditional', start: 90, end: 97.5,
      caption: 'An implication is false in exactly one of its four rows.',
      detail: 'P implies Q is the statement that P does not happen without Q. It is false only when P is true and Q is false. That single false row is the whole reason two of the four standard argument forms work and two do not.',
      narration: 'An implication is false in exactly one of its four rows: the row where P is true and Q is false. That single false row is the reason two of the four standard argument forms work and two do not.',
      keyword: 'exactly one row',
      trap: 'Do not read an implication as a cause. It forbids one combination and permits three.'
    },
    {
      id: 'co-2', scene: 'conditional', start: 97.5, end: 105,
      caption: 'Modus ponens and modus tollens each hold in the one row where their premises are true.',
      detail: 'P and P implies Q leave only the row where both P and Q are true, so Q follows. Not Q and P implies Q leave only the row where P is false and Q is false, so not P follows. One row each, and the conclusion is that row.',
      narration: 'Modus ponens: P, and P implies Q. Only one row has both premises true, and in it Q is true. Modus tollens: not Q, and P implies Q. Again one row, and in it P is false. Both are valid.',
      keyword: 'one row each',
      trap: 'Both valid forms use the premise exactly as stated. Rewriting it is where errors enter.'
    },
    {
      id: 'co-3', scene: 'conditional', start: 105, end: 112.5,
      caption: 'Affirming the consequent and denying the antecedent each leave two rows, and one breaks the conclusion.',
      detail: 'Q and P implies Q hold together in two rows: P true with Q true, and P false with Q true. In the second, P is false, so the conclusion P fails. Denying the antecedent is the mirror case, with two rows and a failing conclusion in one.',
      narration: 'Affirming the consequent: Q, and P implies Q. Two rows satisfy both. In one of them P is false, so the conclusion P fails. Denying the antecedent is the mirror image, and it fails the same way.',
      keyword: 'two rows',
      trap: 'The two invalid forms are the ones examiners use. If the argument confirms the consequent, it is not valid.'
    },
    {
      id: 'co-4', scene: 'conditional', start: 112.5, end: 120,
      caption: 'So: valid, valid, invalid, invalid — and the count of premise rows is the test.',
      detail: 'A form is valid when the number of rows satisfying every premise equals the number in which the conclusion also holds. That is the test, and it needs no intuition about the words. The propositional-logic lesson derives the same result from tautologies.',
      narration: 'Valid, valid, invalid, invalid. A form is valid when every row that satisfies the premises also satisfies the conclusion. That is the test, and it needs no intuition about the words at all.',
      keyword: 'valid, valid, invalid, invalid',
      trap: 'A single row where the premises hold and the conclusion fails is enough to condemn the form.'
    },

    /* ---------------- scene 5: induction ---------------- */
    {
      id: 'in-1', scene: 'induction', start: 120, end: 127.5,
      caption: 'The polynomial n squared plus n plus 41 gives a prime for every n from zero to thirty-nine.',
      detail: 'Euler noticed it. Substitute n equal to zero and you get 41, which is prime. n equal to one gives 43. Every value from n equal to zero up to n equal to thirty-nine is prime. Forty cases, forty primes, no exception.',
      narration: 'Take n squared plus n plus 41. Put n equal to zero: forty one, prime. n equal to one: forty three. Every value from zero up to thirty nine is prime. Forty cases, forty primes, no exception.',
      keyword: 'forty primes',
      trap: 'Forty is a lot. It is still not all.'
    },
    {
      id: 'in-2', scene: 'induction', start: 127.5, end: 135,
      caption: 'At n equal to forty it gives 1681, which is 41 squared.',
      detail: 'Substituting n equal to forty gives 1600 plus 40 plus 41, which is 1681. And 1681 is 41 times 41. The pattern that survived forty consecutive cases dies at the forty-first, and the number that kills it is the constant term of the polynomial, squared.',
      narration: 'Now put n equal to forty. Sixteen hundred plus forty plus forty one is one thousand six hundred and eighty one. And that is forty one times forty one. The pattern dies at the forty first case.',
      keyword: '1681 is 41 squared',
      trap: 'A single failure ends an inductive conclusion. It does not weaken it; it ends it.'
    },
    {
      id: 'in-3', scene: 'induction', start: 135, end: 142.5,
      caption: 'An inductive conclusion is a hypothesis with a count attached, never a theorem.',
      detail: 'What you may say after forty cases is that the claim holds in the forty cases you checked, and that no counterexample is known. What you may not say is that it holds. The gap is not a matter of degree: one case closes it in the wrong direction.',
      narration: 'So what may you say after forty cases? That it holds in the forty you checked, and that no counterexample is known. What you may not say is that it holds. The gap is not a matter of degree.',
      keyword: 'a hypothesis with a count',
      trap: 'Do not answer a GATE induction question with the pattern alone if an option states a counterexample.'
    },
    {
      id: 'in-4', scene: 'induction', start: 142.5, end: 150,
      caption: 'Mathematical induction is the opposite thing: a proof, and a deduction.',
      detail: 'Mathematical induction proves a statement for all natural numbers from a base case and a step. It is deductively valid: if the base holds and the step holds, the conclusion is a theorem, not a hypothesis. The syllabus word induction means the first thing; the Discrete Mathematics lesson teaches the second.',
      narration: 'And note this. Mathematical induction is the opposite thing. From a base case and a step it proves the statement for all n. That is a deduction and a theorem. The syllabus word here means pattern guessing, not that.',
      keyword: 'the opposite thing',
      trap: 'Two different things share the word. A GATE question on series or analogy means the first.'
    },

    /* ---------------- scene 6: series ---------------- */
    {
      id: 'se-1', scene: 'series', start: 150, end: 157.5,
      caption: 'Write the differences of the differences; a constant row names the relation.',
      detail: 'Take the sequence six, nine, fourteen, x, thirty, forty-one from GATE CSE 2024 Set 2. If x is twenty-one the first differences are three, five, seven, nine, eleven and the second differences are all two. A constant second difference means a quadratic.',
      narration: 'Here is a sequence from a recent paper: six, nine, fourteen, then an unknown, then thirty, forty-one. Write the first differences. If the unknown is twenty one they are three, five, seven, nine, eleven. The second differences are all two, and a constant second difference means a quadratic.',
      keyword: 'second differences are all two',
      trap: 'One constant row is the signal. Two sequences can share a first row and differ later.'
    },
    {
      id: 'se-2', scene: 'series', start: 157.5, end: 165,
      caption: 'A constant second difference of two means n squared plus five, and the missing term is 21.',
      detail: 'A quadratic with second difference two has leading coefficient one, so the sequence is n squared plus a constant. Matching the first term gives n squared plus five. At n equal to one that is six, at n equal to six it is forty-one, and at n equal to four it is twenty-one, which is the value the paper accepts.',
      narration: 'A constant second difference of two means the sequence is n squared plus something. Matching the first term gives n squared plus five. So the fourth term is sixteen plus five, twenty one, and the seventh would be fifty four.',
      keyword: 'n squared plus five',
      trap: 'Check the formula against every given term, not only the first. One match is not a fit.'
    },
    {
      id: 'se-3', scene: 'series', start: 165, end: 172.5,
      caption: 'But six terms never determine the next term: add a polynomial that vanishes on all six.',
      detail: 'Multiply out n minus one through n minus six. That product is zero at every one of the six given positions, so adding any multiple of it leaves all six terms unchanged. With a multiple of one, the seventh term is seven hundred and seventy-four instead of fifty-four.',
      narration: 'But six terms do not determine the seventh. Take the product of n minus one through n minus six. It is zero at all six given positions, so adding it changes nothing you can see, and the seventh term becomes seven hundred and seventy four.',
      keyword: 'never determine',
      trap: 'So a series question is answerable only because the options restrict the family. Read them.'
    },
    {
      id: 'se-4', scene: 'series', start: 172.5, end: 180,
      caption: 'Read a series as induction, not deduction: the simplest relation that fits, chosen by the options.',
      detail: 'The honest statement is that n squared plus five is the simplest relation consistent with the six terms, and the options tell you which family is intended. That is an inductive move, and it is the right one here, provided you know it is one.',
      narration: 'So read a series as induction, not deduction. The simplest relation that fits, chosen by the options, is the intended answer. That is an inductive move, and it is the right one, as long as you know that is what it is.',
      keyword: 'induction, not deduction',
      trap: 'A series question that offers no options and demands a unique answer is not well posed.'
    },

    /* ---------------- scene 7: analogy ---------------- */
    {
      id: 'an-1', scene: 'analogy', start: 180, end: 187.5,
      caption: 'An analogy is a relation, stated once and applied once.',
      detail: 'The form is A is to B as C is to D. The work is to name the relation that takes A to B, in words, and then apply the same words to C. Naming it is what makes the step checkable; skipping the naming is what makes analogies feel like guessing.',
      narration: 'An analogy says A is to B as C is to D. The work is to name the relation that takes A to B, in words, and then apply the same words to C. Naming it is what makes the step checkable.',
      keyword: 'name the relation',
      trap: 'The relation must be stated in words you could apply to a third pair. Otherwise it is not a relation.'
    },
    {
      id: 'an-2', scene: 'analogy', start: 187.5, end: 195,
      caption: 'Eight to sixty-four is squaring; eight to five hundred and twelve is cubing. Both fit.',
      detail: 'With the pair eight and a blank, two of the simplest relations both fit the left-hand number, and they give different answers: twenty-five and one hundred and twenty-five for a left-hand five. A bare analogy is therefore ambiguous, and the options exist to remove the ambiguity.',
      narration: 'Eight to sixty four is squaring. Eight to five hundred and twelve is cubing. Both relations fit the left-hand number, and for a five they give twenty five and one hundred and twenty five. A bare analogy is ambiguous.',
      keyword: 'both fit',
      trap: 'If two relations fit, the answer is whichever one the options contain — not whichever you thought of first.'
    },
    {
      id: 'an-3', scene: 'analogy', start: 195, end: 202.5,
      caption: 'Letter analogies use position arithmetic: A and Z sum to 27, so B and Y do too.',
      detail: 'Number the alphabet from one. A is one and Z is twenty-six, and their positions sum to twenty-seven. B is two and Y is twenty-five, again twenty-seven. The relation is the mirror of the alphabet, and it is a sum, so it can be applied to any letter.',
      narration: 'Letter analogies use position arithmetic. A is one and Z is twenty six, and they sum to twenty seven. B and Y also sum to twenty seven. The relation is the mirror of the alphabet, written as a sum, so it applies to any letter.',
      keyword: 'sum to 27',
      trap: 'Off-by-one is the standard error: A is one, not zero, and Z is twenty-six, not twenty-five.'
    },
    {
      id: 'an-4', scene: 'analogy', start: 202.5, end: 210,
      caption: 'C mirrors to X, because 27 minus 3 is 24, and the twenty-fourth letter is X.',
      detail: 'Apply the relation: twenty-seven minus three is twenty-four, and the twenty-fourth letter is X. The check is that applying the relation twice returns the original letter, which it does for every letter, because twenty-seven minus twenty-seven minus three is three.',
      narration: 'So C mirrors to X: twenty seven minus three is twenty four, and the twenty fourth letter is X. The check is that applying the relation twice returns you to where you started, which it does for every letter.',
      keyword: 'twenty-fourth letter is X',
      trap: 'Always run the relation backwards once. A relation that does not invert was probably the wrong one.'
    },

    /* ---------------- scene 8: rank ---------------- */
    {
      id: 'ra-1', scene: 'rank', start: 210, end: 217.5,
      caption: 'In a line, the total is the position from the front plus the position from the back, minus one.',
      detail: 'A person who is twelfth from the front and ninth from the back is counted twice, once in each count, and nobody else is. So the line holds twelve plus nine minus one, which is twenty. The subtraction of one is the person themselves.',
      narration: 'In a line, the total is the position from the front plus the position from the back, minus one. Twelfth from the front and ninth from the back gives twenty. The one you subtract is the person you counted twice.',
      keyword: 'minus one',
      trap: 'The formula gives the total only when both counts refer to the same person. Otherwise it is meaningless.'
    },
    {
      id: 'ra-2', scene: 'rank', start: 217.5, end: 225,
      caption: 'The number strictly between two positions is the difference minus one.',
      detail: 'Fifth from the left and ninth from the left leaves three people between them, because the gap is four and it excludes both ends. Every counting error in this family is either a forgotten minus one or a minus one applied where it does not belong.',
      narration: 'The number strictly between two positions is the difference minus one. Fifth and ninth from the left leave three people between them. Every error in this family is a minus one either forgotten or applied where it does not belong.',
      keyword: 'difference minus one',
      trap: 'Between excludes both ends; from the front to a position includes it.'
    },
    {
      id: 'ra-3', scene: 'rank', start: 225, end: 232.5,
      caption: 'Two overlapping groups: the union is each count added, minus the overlap.',
      detail: 'In a class of sixty, thirty-five like tea, thirty like coffee and twenty like both. The union is thirty-five plus thirty minus twenty, which is forty-five. Fifteen like neither, because sixty minus forty-five is fifteen. The overlap is subtracted once, which is exactly once too many.',
      narration: 'Two overlapping groups: the union is the two counts added, minus the overlap. Thirty five and thirty with twenty in both give forty five. So fifteen of the sixty like neither. The overlap was counted twice, so it is subtracted once.',
      keyword: 'minus the overlap',
      trap: 'Three groups need the overlaps added back. Two groups never do.'
    },
    {
      id: 'ra-4', scene: 'rank', start: 232.5, end: 240,
      caption: 'GATE CSE 2022 Q7: a proportion inference is a count, not a comparison of percentages.',
      detail: 'Boys were sixty-five per cent of those who appeared and girls were sixty per cent of those who qualified. Boys therefore took forty per cent of the qualified places against sixty for girls, so fewer boys qualified. Comparing the two percentages directly would be comparing a share of one total with a share of another.',
      narration: 'A real one. Boys were sixty five per cent of those who appeared, girls sixty per cent of those who qualified. So boys took forty per cent of the qualified places against sixty. Fewer boys qualified. The two percentages are shares of different totals.',
      keyword: 'shares of different totals',
      trap: 'A percentage of the appeared and a percentage of the qualified cannot be compared without a common base.'
    },

    /* ---------------- scene 9: grid ---------------- */
    {
      id: 'gr-1', scene: 'grid', start: 240, end: 247.5,
      caption: 'A grid of neighbour counts is a system of constraints, not a picture puzzle.',
      detail: 'Each numbered cell states how many of its eight neighbours are free. Each crossed cell states that it is not free. Read that way, the grid is a set of equations over a small number of unknowns, and the unknowns can be enumerated.',
      narration: 'A grid of neighbour counts is a system of constraints, not a picture puzzle. Each number says how many of its eight neighbours are free. Each cross says that cell is not free. That is a set of equations, and the unknowns are few enough to enumerate.',
      keyword: 'a system of constraints',
      trap: 'Count eight neighbours, including diagonals, or the count will not reproduce.'
    },
    {
      id: 'gr-2', scene: 'grid', start: 247.5, end: 255,
      caption: 'Here the first three rows are given and the last row has no crosses at all.',
      detail: 'Four crosses are placed in the first three rows. Every other cell in those rows shows the number of its free neighbours, computed by this page. The last row is stated to contain no crosses, which leaves sixteen candidate rows.',
      narration: 'Here the first three rows are given, with four crosses placed in them. Every other cell shows its count of free neighbours, computed here. The last row is stated to have no crosses, which leaves sixteen candidate rows.',
      keyword: 'sixteen candidate rows',
      trap: 'Sixteen is small enough to enumerate by hand. Do that rather than guessing a pattern.'
    },
    {
      id: 'gr-3', scene: 'grid', start: 255, end: 262.5,
      caption: 'Only one of the sixteen candidate rows reproduces the counts in row three.',
      detail: 'The enumeration keeps the candidate rows whose implied counts in row three match the numbers printed there. Exactly one survives, the empty row. The clue set is therefore sufficient, and that fact is checked here rather than assumed.',
      narration: 'Only one of the sixteen candidate rows reproduces the counts printed in row three. The empty row. So the clues are sufficient, and that is checked here rather than assumed.',
      keyword: 'exactly one survives',
      trap: 'A clue set that leaves two candidates makes the question unanswerable. Check before answering.'
    },
    {
      id: 'gr-4', scene: 'grid', start: 262.5, end: 270,
      caption: 'With the last row fixed, its four counts are 3, 5, 4 and 2, and they sum to 14.',
      detail: 'The last row has no crosses, so each of its cells counts the free cells among its neighbours in rows three and four. The four counts are three, five, four and two, and their sum is fourteen. The page computes all four and the sum; nothing is read off a key.',
      narration: 'With the last row fixed, its four counts are three, five, four and two. They sum to fourteen. All five numbers are computed by this page. Nothing here is read off an answer key.',
      keyword: 'sum to 14',
      trap: 'The corners have fewer neighbours. A corner counts three, not eight.'
    },

    /* ---------------- scene 10: procedure ---------------- */
    {
      id: 'pr-1', scene: 'procedure', start: 270, end: 276,
      caption: 'Step one: decide whether the question says must or probably.',
      detail: 'The wording decides the tool. Does the conclusion follow, which of these is necessarily true, and cannot be true simultaneously are deduction. Which comes next, and what is the relation, are induction. Naming the family first prevents most wasted minutes.',
      narration: 'Step one: decide whether the question says must or probably. Follows, necessarily, cannot be true — that is deduction. Comes next, what is the relation — that is induction. Name the family first.',
      keyword: 'must or probably',
      trap: 'An induction question phrased with the word must is a trap. Look for the option that states a counterexample.'
    },
    {
      id: 'pr-2', scene: 'procedure', start: 276, end: 282,
      caption: 'Step two: for deduction, build the models and count, or build one countermodel.',
      detail: 'For a syllogism, write the seven regions, delete the models each premise forbids, and check the conclusion against every survivor. For a conditional, write the four rows. For a refutation, one surviving model with the conclusion false is the whole proof.',
      narration: 'Step two: for deduction, build the models and count, or build one countermodel. Seven regions for a syllogism, four rows for a conditional. One model with the conclusion false is a complete refutation.',
      keyword: 'count, or one countermodel',
      trap: 'Never refute with a case that breaks a premise. It refutes nothing.'
    },
    {
      id: 'pr-3', scene: 'procedure', start: 282, end: 288,
      caption: 'Step three: for induction, name the relation in words and test it on every given term.',
      detail: 'A difference table names a polynomial relation; a position table names a letter relation. Then check the named relation against every given term, not the first two. If two relations fit, the options decide, and you should say so to yourself before choosing.',
      narration: 'Step three: for induction, name the relation in words and test it on every given term. A difference table for numbers, a position table for letters. If two relations fit, the options decide.',
      keyword: 'test it on every term',
      trap: 'A relation fitted to two terms is a coincidence. Fit all of them or say it is a hypothesis.'
    },
    {
      id: 'pr-4', scene: 'procedure', start: 288, end: 294,
      caption: 'Step four: for counting, write the formula and check it on a small case.',
      detail: 'Total equals front plus back minus one. Between equals difference minus one. Union equals the two counts minus the overlap. Each is one line, and each can be checked on a line of four or five objects in a few seconds.',
      narration: 'Step four: for counting, write the formula and check it on a small case. Total, between, union. Each is one line, and each can be checked on five objects in a few seconds.',
      keyword: 'check it on a small case',
      trap: 'A formula checked on a small case is a formula you will not misapply under time pressure.'
    },
    {
      id: 'pr-5', scene: 'procedure', start: 294, end: 300,
      caption: 'Step five: count the solutions, not just one. Uniqueness is part of the answer.',
      detail: 'After you have one arrangement or one completion, ask whether the clues force it. If two survive, the question is asking which of them an option contains, or the question is unanswerable as posed. The grid scene checks this by enumeration, and so should you.',
      narration: 'Step five: count the solutions, not just one. After you find an arrangement, ask whether the clues force it. If two survive, the question is asking which one an option contains. Uniqueness is part of the answer.',
      keyword: 'uniqueness is part of the answer',
      trap: 'One valid arrangement is not the same as the only arrangement. Say which one you have.'
    }
  ]
};
