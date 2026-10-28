# Analytical Aptitude — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/analytical-aptitude/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 41 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. What an analytical question actually asks

*0:00 – 0:30 · objective: Separate the two questions the syllabus names — what must be true, and what is merely a pattern — and see that each has a written test.*

**0:00–0:07** — An analytical question hands you a set of statements and asks what they force. The statements are the premises. The thing asked is the conclusion. And there are only two questions you can be asked about that pair.

> Caption: An analytical question hands you statements and asks what they force.

Exam-trap caption mode adds: *The premises are not a story to be interpreted. Only what they force counts.*

**0:07–0:15** — Question one is deduction. Does the conclusion hold in every case the premises allow? The answer is yes or no, and a no is proved by producing one case where the premises hold and the conclusion fails. That case is called a countermodel.

> Caption: Question one: does the conclusion hold in every case the premises allow?

Exam-trap caption mode adds: *A conclusion that holds in the cases you tried is not yet deducted. The cases you did not try are the question.*

**0:15–0:22** — Question two is induction. Does a pattern in the cases you have seen carry to the cases you have not? Induction generalises from instances. It is not truth-preserving, one counterexample ends it, and it is not the mathematical induction of the Discrete Mathematics paper.

> Caption: Question two: does a pattern in the cases seen carry to the cases unseen?

Exam-trap caption mode adds: *Mathematical induction is a deduction. The word is the same; the operation is not.*

**0:22–0:30** — Both questions are settled in writing, on a page. The rest of this lesson is five written tests: a region count, a truth table, a case count, a difference table, and a relation table. Each one is short enough to do in the exam.

> Caption: Both questions are settled in writing, on a page, without a picture in your head.

Exam-trap caption mode adds: *Reading the options first invites you to match a shape rather than to test a claim.*

## Scene 2. Deduction is a count over every model

*0:30 – 1:00 · objective: Turn a syllogism into an enumeration over the seven regions of three sets, and decide a conclusion by asking whether it holds in every model that satisfies the premises.*

**0:30–0:37** — Three sets cut the universe into seven regions. Every element sits in exactly one of them. A model is a choice of which regions contain at least one element. That is all a model is.

> Caption: Three sets cut the universe into seven regions, and a model is a choice of which are occupied.

Exam-trap caption mode adds: *Two sets give three regions plus the outside; three sets give seven. Count them before you draw.*

**0:37–0:45** — A premise is a rule that deletes models. All A are B forbids any occupied region inside A and outside B. No B is C forbids any occupied region inside both B and C. Of the one hundred and twenty seven non-empty choices, fifteen survive.

> Caption: A premise is a rule that deletes models, and the surviving count is computed here.

Exam-trap caption mode adds: *The empty model is excluded, because a GATE syllogism assumes the classes it names are not empty unless it says so.*

**0:45–0:52** — A conclusion is valid exactly when it survives every one of the fifteen models. No A is C survives all fifteen, so it is valid. Some A is C fails, because a model exists where A sits inside B and C sits outside B.

> Caption: A conclusion is valid exactly when it survives every model the premises allowed.

Exam-trap caption mode adds: *Valid does not mean true. It means true in every model the premises allow.*

**0:52–1:00** — The same two premises license some conclusions and not others. No A is C and No C is A are valid. Four others are not, and for each the page prints a model that breaks it. The verdict is a count, not an opinion.

> Caption: The same two premises license six conclusions; the count decides which.

Exam-trap caption mode adds: *The order of the two sets in a negative conclusion does not matter; in an affirmative one it does.*

## Scene 3. One model is enough to refute

*1:00 – 1:30 · objective: Refute a conclusion by exhibiting a single countermodel, and see how the option set — not the logic alone — makes a GATE answer unique.*

**1:00–1:07** — To refute a conclusion you do not argue. You build one case where the premises hold and the conclusion fails. A refutation is an object, not an argument. Once you have it, the work is over.

> Caption: To refute, do not argue — build one case in which the premises hold and the conclusion fails.

Exam-trap caption mode adds: *A countermodel must satisfy every premise. A case that breaks a premise proves nothing.*

**1:07–1:15** — Here is a real one. GATE 2022, question four. Four statements about students being inquisitive, with at least one student in the class, and four options, each naming a pair of statements.

> Caption: GATE CSE 2022 Q4: four statements, and the pair that cannot both be true.

Exam-trap caption mode adds: *Read the phrase at least one student. Without it, two of these statements change meaning.*

**1:15–1:22** — A class is all inquisitive, or mixed, or none. Statement one is true only in the first world, statement three only in the third. Pairing them up, exactly one of the four offered pairs has no world in common. That is the answer.

> Caption: Three worlds exhaust the possibilities, and only one offered pair is impossible.

Exam-trap caption mode adds: *Statements one and four cannot both hold either — but that pair is not offered. The options bound the answer.*

**1:22–1:30** — The answer is A, statements one and three. All are inquisitive and nobody is inquisitive cannot both hold while there is a student. The other three pairs each have a world of their own, so they can hold together.

> Caption: Answer A: statements one and three cannot be true at the same time.

Exam-trap caption mode adds: *Three and four do hold together: if nobody is inquisitive, then some are not, given a non-empty class.*

## Scene 4. Conditionals: two valid forms and two famous invalid ones

*1:30 – 2:00 · objective: Test the four standard argument forms on the four rows of a truth table and name which two are licensed by implication and which two are not.*

**1:30–1:37** — An implication is false in exactly one of its four rows: the row where P is true and Q is false. That single false row is the reason two of the four standard argument forms work and two do not.

> Caption: An implication is false in exactly one of its four rows.

Exam-trap caption mode adds: *Do not read an implication as a cause. It forbids one combination and permits three.*

**1:37–1:45** — Modus ponens: P, and P implies Q. Only one row has both premises true, and in it Q is true. Modus tollens: not Q, and P implies Q. Again one row, and in it P is false. Both are valid.

> Caption: Modus ponens and modus tollens each hold in the one row where their premises are true.

Exam-trap caption mode adds: *Both valid forms use the premise exactly as stated. Rewriting it is where errors enter.*

**1:45–1:52** — Affirming the consequent: Q, and P implies Q. Two rows satisfy both. In one of them P is false, so the conclusion P fails. Denying the antecedent is the mirror image, and it fails the same way.

> Caption: Affirming the consequent and denying the antecedent each leave two rows, and one breaks the conclusion.

Exam-trap caption mode adds: *The two invalid forms are the ones examiners use. If the argument confirms the consequent, it is not valid.*

**1:52–2:00** — Valid, valid, invalid, invalid. A form is valid when every row that satisfies the premises also satisfies the conclusion. That is the test, and it needs no intuition about the words at all.

> Caption: So: valid, valid, invalid, invalid — and the count of premise rows is the test.

Exam-trap caption mode adds: *A single row where the premises hold and the conclusion fails is enough to condemn the form.*

## Scene 5. Induction: forty out of forty is not a proof

*2:00 – 2:30 · objective: Watch a pattern hold for forty consecutive cases and fail at the forty-first, and state precisely what an inductive conclusion does and does not carry.*

**2:00–2:07** — Take n squared plus n plus 41. Put n equal to zero: forty one, prime. n equal to one: forty three. Every value from zero up to thirty nine is prime. Forty cases, forty primes, no exception.

> Caption: The polynomial n squared plus n plus 41 gives a prime for every n from zero to thirty-nine.

Exam-trap caption mode adds: *Forty is a lot. It is still not all.*

**2:07–2:15** — Now put n equal to forty. Sixteen hundred plus forty plus forty one is one thousand six hundred and eighty one. And that is forty one times forty one. The pattern dies at the forty first case.

> Caption: At n equal to forty it gives 1681, which is 41 squared.

Exam-trap caption mode adds: *A single failure ends an inductive conclusion. It does not weaken it; it ends it.*

**2:15–2:22** — So what may you say after forty cases? That it holds in the forty you checked, and that no counterexample is known. What you may not say is that it holds. The gap is not a matter of degree.

> Caption: An inductive conclusion is a hypothesis with a count attached, never a theorem.

Exam-trap caption mode adds: *Do not answer a GATE induction question with the pattern alone if an option states a counterexample.*

**2:22–2:30** — And note this. Mathematical induction is the opposite thing. From a base case and a step it proves the statement for all n. That is a deduction and a theorem. The syllabus word here means pattern guessing, not that.

> Caption: Mathematical induction is the opposite thing: a proof, and a deduction.

Exam-trap caption mode adds: *Two different things share the word. A GATE question on series or analogy means the first.*

## Scene 6. Numerical relations: differences and their limit

*2:30 – 3:00 · objective: Read a finite difference table to name the relation behind a sequence, then see why the next term is a convention rather than a deduction.*

**2:30–2:37** — Here is a sequence from a recent paper: six, nine, fourteen, then an unknown, then thirty, forty-one. Write the first differences. If the unknown is twenty one they are three, five, seven, nine, eleven. The second differences are all two, and a constant second difference means a quadratic.

> Caption: Write the differences of the differences; a constant row names the relation.

Exam-trap caption mode adds: *One constant row is the signal. Two sequences can share a first row and differ later.*

**2:37–2:45** — A constant second difference of two means the sequence is n squared plus something. Matching the first term gives n squared plus five. So the fourth term is sixteen plus five, twenty one, and the seventh would be fifty four.

> Caption: A constant second difference of two means n squared plus five, and the missing term is 21.

Exam-trap caption mode adds: *Check the formula against every given term, not only the first. One match is not a fit.*

**2:45–2:52** — But six terms do not determine the seventh. Take the product of n minus one through n minus six. It is zero at all six given positions, so adding it changes nothing you can see, and the seventh term becomes seven hundred and seventy four.

> Caption: But six terms never determine the next term: add a polynomial that vanishes on all six.

Exam-trap caption mode adds: *So a series question is answerable only because the options restrict the family. Read them.*

**2:52–3:00** — So read a series as induction, not deduction. The simplest relation that fits, chosen by the options, is the intended answer. That is an inductive move, and it is the right one, as long as you know that is what it is.

> Caption: Read a series as induction, not deduction: the simplest relation that fits, chosen by the options.

Exam-trap caption mode adds: *A series question that offers no options and demands a unique answer is not well posed.*

## Scene 7. Analogy: name the relation before you apply it

*3:00 – 3:30 · objective: Turn an analogy into a relation, count how many simple relations fit the given pair, and use the options to break the tie.*

**3:00–3:07** — An analogy says A is to B as C is to D. The work is to name the relation that takes A to B, in words, and then apply the same words to C. Naming it is what makes the step checkable.

> Caption: An analogy is a relation, stated once and applied once.

Exam-trap caption mode adds: *The relation must be stated in words you could apply to a third pair. Otherwise it is not a relation.*

**3:07–3:15** — Eight to sixty four is squaring. Eight to five hundred and twelve is cubing. Both relations fit the left-hand number, and for a five they give twenty five and one hundred and twenty five. A bare analogy is ambiguous.

> Caption: Eight to sixty-four is squaring; eight to five hundred and twelve is cubing. Both fit.

Exam-trap caption mode adds: *If two relations fit, the answer is whichever one the options contain — not whichever you thought of first.*

**3:15–3:22** — Letter analogies use position arithmetic. A is one and Z is twenty six, and they sum to twenty seven. B and Y also sum to twenty seven. The relation is the mirror of the alphabet, written as a sum, so it applies to any letter.

> Caption: Letter analogies use position arithmetic: A and Z sum to 27, so B and Y do too.

Exam-trap caption mode adds: *Off-by-one is the standard error: A is one, not zero, and Z is twenty-six, not twenty-five.*

**3:22–3:30** — So C mirrors to X: twenty seven minus three is twenty four, and the twenty fourth letter is X. The check is that applying the relation twice returns you to where you started, which it does for every letter.

> Caption: C mirrors to X, because 27 minus 3 is 24, and the twenty-fourth letter is X.

Exam-trap caption mode adds: *Always run the relation backwards once. A relation that does not invert was probably the wrong one.*

## Scene 8. Counting in a line: positions, overlap, between

*3:30 – 4:00 · objective: Settle three arrangement counts with three one-line formulas, each derived rather than memorised.*

**3:30–3:37** — In a line, the total is the position from the front plus the position from the back, minus one. Twelfth from the front and ninth from the back gives twenty. The one you subtract is the person you counted twice.

> Caption: In a line, the total is the position from the front plus the position from the back, minus one.

Exam-trap caption mode adds: *The formula gives the total only when both counts refer to the same person. Otherwise it is meaningless.*

**3:37–3:45** — The number strictly between two positions is the difference minus one. Fifth and ninth from the left leave three people between them. Every error in this family is a minus one either forgotten or applied where it does not belong.

> Caption: The number strictly between two positions is the difference minus one.

Exam-trap caption mode adds: *Between excludes both ends; from the front to a position includes it.*

**3:45–3:52** — Two overlapping groups: the union is the two counts added, minus the overlap. Thirty five and thirty with twenty in both give forty five. So fifteen of the sixty like neither. The overlap was counted twice, so it is subtracted once.

> Caption: Two overlapping groups: the union is each count added, minus the overlap.

Exam-trap caption mode adds: *Three groups need the overlaps added back. Two groups never do.*

**3:52–4:00** — A real one. Boys were sixty five per cent of those who appeared, girls sixty per cent of those who qualified. So boys took forty per cent of the qualified places against sixty. Fewer boys qualified. The two percentages are shares of different totals.

> Caption: GATE CSE 2022 Q7: a proportion inference is a count, not a comparison of percentages.

Exam-trap caption mode adds: *A percentage of the appeared and a percentage of the qualified cannot be compared without a common base.*

## Scene 9. Constraint reasoning on a grid

*4:00 – 4:30 · objective: Treat a grid of neighbour counts as a system of constraints, solve it by enumeration, and check that the clue set determines the answer uniquely.*

**4:00–4:07** — A grid of neighbour counts is a system of constraints, not a picture puzzle. Each number says how many of its eight neighbours are free. Each cross says that cell is not free. That is a set of equations, and the unknowns are few enough to enumerate.

> Caption: A grid of neighbour counts is a system of constraints, not a picture puzzle.

Exam-trap caption mode adds: *Count eight neighbours, including diagonals, or the count will not reproduce.*

**4:07–4:15** — Here the first three rows are given, with four crosses placed in them. Every other cell shows its count of free neighbours, computed here. The last row is stated to have no crosses, which leaves sixteen candidate rows.

> Caption: Here the first three rows are given and the last row has no crosses at all.

Exam-trap caption mode adds: *Sixteen is small enough to enumerate by hand. Do that rather than guessing a pattern.*

**4:15–4:22** — Only one of the sixteen candidate rows reproduces the counts printed in row three. The empty row. So the clues are sufficient, and that is checked here rather than assumed.

> Caption: Only one of the sixteen candidate rows reproduces the counts in row three.

Exam-trap caption mode adds: *A clue set that leaves two candidates makes the question unanswerable. Check before answering.*

**4:22–4:30** — With the last row fixed, its four counts are three, five, four and two. They sum to fourteen. All five numbers are computed by this page. Nothing here is read off an answer key.

> Caption: With the last row fixed, its four counts are 3, 5, 4 and 2, and they sum to 14.

Exam-trap caption mode adds: *The corners have fewer neighbours. A corner counts three, not eight.*

## Scene 10. The five-step procedure

*4:30 – 5:00 · objective: Collect the five moves that settle an analytical question, in the order they should be tried.*

**4:30–4:36** — Step one: decide whether the question says must or probably. Follows, necessarily, cannot be true — that is deduction. Comes next, what is the relation — that is induction. Name the family first.

> Caption: Step one: decide whether the question says must or probably.

Exam-trap caption mode adds: *An induction question phrased with the word must is a trap. Look for the option that states a counterexample.*

**4:36–4:42** — Step two: for deduction, build the models and count, or build one countermodel. Seven regions for a syllogism, four rows for a conditional. One model with the conclusion false is a complete refutation.

> Caption: Step two: for deduction, build the models and count, or build one countermodel.

Exam-trap caption mode adds: *Never refute with a case that breaks a premise. It refutes nothing.*

**4:42–4:48** — Step three: for induction, name the relation in words and test it on every given term. A difference table for numbers, a position table for letters. If two relations fit, the options decide.

> Caption: Step three: for induction, name the relation in words and test it on every given term.

Exam-trap caption mode adds: *A relation fitted to two terms is a coincidence. Fit all of them or say it is a hypothesis.*

**4:48–4:54** — Step four: for counting, write the formula and check it on a small case. Total, between, union. Each is one line, and each can be checked on five objects in a few seconds.

> Caption: Step four: for counting, write the formula and check it on a small case.

Exam-trap caption mode adds: *A formula checked on a small case is a formula you will not misapply under time pressure.*

**4:54–5:00** — Step five: count the solutions, not just one. After you find an arrangement, ask whether the clues force it. If two survive, the question is asking which one an option contains. Uniqueness is part of the answer.

> Caption: Step five: count the solutions, not just one. Uniqueness is part of the answer.

Exam-trap caption mode adds: *One valid arrangement is not the same as the only arrangement. Say which one you have.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
