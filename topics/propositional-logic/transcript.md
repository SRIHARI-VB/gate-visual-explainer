# Propositional Logic — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/propositional-logic/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 47 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A proposition is true or false

*0:00 – 0:22 · objective: Sort sentences into propositions and non-propositions, and see why an open sentence is not one.*

**0:00–0:05** — A proposition is a statement that is either true or false. Never both, and never neither.

> Caption: A proposition is a statement that is either true or false.

Exam-trap caption mode adds: *Questions, commands and exclamations are not propositions. They have no truth value to be right or wrong about.*

**0:05–0:11** — Seven is prime is a proposition, and its value is true.

> Caption: Seven is prime: a proposition, and it is true.

**0:11–0:16** — Two plus two equals five is also a proposition. Its value is false.

> Caption: Two plus two equals five: also a proposition, and false.

Exam-trap caption mode adds: *A false statement is not a non-proposition. The common error is to throw out sentences that are false.*

**0:16–0:22** — A command has no truth value. And x plus one equals three stays open until x is fixed. Fixing x is the job of predicate logic.

> Caption: Close the door, and x plus one equals three: not propositions yet.

Exam-trap caption mode adds: *x plus one equals three is the standard trap. It becomes true or false only once x is fixed, so as written it is not a proposition.*

## Scene 2. Negation, and, or

*0:22 – 0:58 · objective: Build the truth table of NOT, AND and OR column by column from the meanings of the words.*

**0:22–0:27** — Negation flips the truth value. It is written as a hook, and read as not P.

> Caption: NOT P flips the value: true becomes false, false becomes true.

Exam-trap caption mode adds: *Double negation cancels: NOT NOT P has the same column as P, in every row.*

**0:27–0:32** — P and Q is true in exactly one of the four rows, the row where both are true.

> Caption: P AND Q is true in exactly one row: both true.

**0:32–0:38** — P or Q is true in three rows. At least one of them is true, and that includes both.

> Caption: P OR Q is true in three rows: at least one of them is true.

Exam-trap caption mode adds: *Everyday English sometimes means exclusive or. In logic the V symbol is always inclusive unless the question says otherwise.*

**0:38–0:44** — Four rows, because two variables give two squared, which is four, combinations.

> Caption: Four rows, because two variables give two to the power two combinations.

Exam-trap caption mode adds: *The row order is a convention, not part of the meaning. Any order is correct as long as every combination appears once.*

**0:44–0:50** — Read the table by columns. Each column holds the value of one formula in all four rows.

> Caption: Read a table by columns, not by rows: each column is one formula.

**0:50–0:58** — These three columns are the vocabulary the rest of the lesson reuses.

> Caption: These three columns are the whole vocabulary you will reuse all lesson.

## Scene 3. Implication: one false row out of four

*0:58 – 1:36 · objective: Read P implies Q, justify the two vacuous rows, and derive P implies Q is NOT P or Q.*

**0:58–1:04** — P implies Q reads, if P then Q. P is the hypothesis and Q is the conclusion.

> Caption: P implies Q: if P then Q. P is the hypothesis, Q the conclusion.

Exam-trap caption mode adds: *The arrow is not symmetric. Swapping the ends gives a different formula, which scene four makes precise.*

**1:04–1:10** — Only one of the four rows is false, the row where P is true and Q is false.

> Caption: Only one row is false: P true and Q false.

Exam-trap caption mode adds: *Three of the four rows are true. A student who remembers only the false row will get the vacuous rows wrong.*

**1:10–1:18** — Think of it as a promise. I break it only if you score above ninety and get no cycle. Below ninety, I promised nothing, so I broke nothing.

> Caption: A promise: if you score above ninety, I will gift you a cycle.

Exam-trap caption mode adds: *The two rows where P is false are true because no promise was made, not because something good happened.*

**1:18–1:24** — When the hypothesis is false, the implication counts as true. That is called vacuous truth.

> Caption: When the hypothesis is false, the implication is true. This is vacuous truth.

Exam-trap caption mode adds: *If two plus two equals five, then I am the king of India is a true implication, because the hypothesis is false. That feels wrong and is right.*

**1:24–1:30** — P implies Q has exactly the same column as not P or Q. Four rows, four agreements.

> Caption: P implies Q has exactly the column of NOT P or Q.

Exam-trap caption mode adds: *This equivalence is the standard way to remove an arrow. Do it only in the direction written, and never drop the NOT.*

**1:30–1:36** — P only if Q, Q if P, P is sufficient for Q, Q is necessary for P. All four mean the same arrow.

> Caption: Four English phrasings that all mean P implies Q.

Exam-trap caption mode adds: *P if Q is the converse, not the same claim. One word moves the arrow to the other end.*

## Scene 4. Converse, inverse, contrapositive

*1:36 – 2:10 · objective: Identify which rearrangement of an implication is equivalent to it, by comparing columns.*

**1:36–1:41** — The converse swaps the ends. Q implies P. It is a different formula.

> Caption: Converse: swap the ends, Q implies P.

Exam-trap caption mode adds: *Proving the converse does not prove the original. This is the single most common reasoning error in the whole subject.*

**1:41–1:47** — The inverse negates both ends and keeps the arrow direction. Not P implies not Q.

> Caption: Inverse: negate both ends, NOT P implies NOT Q.

Exam-trap caption mode adds: *Inverse is not the same word as contrapositive. They look alike and behave differently.*

**1:47–1:54** — The contrapositive swaps the ends and negates both. Not Q implies not P.

> Caption: Contrapositive: swap the ends and negate both, NOT Q implies NOT P.

Exam-trap caption mode adds: *Missing either change gives a formula that is not equivalent. Both changes are needed.*

**1:54–2:01** — The contrapositive matches the original in all four rows, so the two are equivalent.

> Caption: The contrapositive matches the original in all four rows.

**2:01–2:10** — The converse and the inverse each differ from the original in two rows, both false when P is false and Q is true.

> Caption: The converse and the inverse each differ from the original in two rows.

Exam-trap caption mode adds: *A single counterexample row is enough to disprove equivalence. Two rows disagree here, and the row P false, Q true is the memorable one.*

## Scene 5. Exclusive or, biconditional, precedence

*2:10 – 2:40 · objective: Fix the meaning of XOR and IFF, then parse a formula using the precedence order.*

**2:10–2:15** — Exclusive or is true when exactly one is true. It is false when both are true.

> Caption: Exclusive or is true when exactly one of the two is true.

Exam-trap caption mode adds: *XOR and OR differ in the both-true row only. That one row is what a question is testing.*

**2:15–2:20** — The biconditional is true when the two sides agree, and false when they differ.

> Caption: The biconditional P if and only if Q is true when the two agree.

Exam-trap caption mode adds: *The biconditional is not the conjunction of two implications written out; it is equivalent to it, which is a claim you verify, not a definition.*

**2:20–2:26** — The biconditional is the negation of exclusive or, in every row.

> Caption: So the biconditional is the negation of exclusive or, in every row.

**2:26–2:33** — Precedence runs from not, to and, to or, to implication, to biconditional.

> Caption: Precedence: NOT binds tightest, then AND, then OR, then implies, then iff.

Exam-trap caption mode adds: *AND and OR do not have equal precedence. Reading left to right without the order is the standard way to get a parsing question wrong.*

**2:33–2:40** — Implication groups to the right. P implies Q implies R is P implies, Q implies R.

> Caption: Implication is right associative: P implies Q implies R means P implies, Q implies R.

Exam-trap caption mode adds: *Most operators in mathematics associate to the left. The arrow is the exception that question setters exploit.*

## Scene 6. Tautology, contradiction, contingency

*2:40 – 3:06 · objective: Classify a formula by reading the whole final column of its truth table.*

**2:40–2:46** — A tautology is true in every row. P or not P is the model case.

> Caption: A tautology is true in every row. P or NOT P is the model.

**2:46–2:51** — A contradiction is false in every row. P and not P is the model case.

> Caption: A contradiction is false in every row. P and NOT P is the model.

Exam-trap caption mode adds: *The negation of a tautology is a contradiction, and the negation of a contradiction is a tautology. Neither is a contingency.*

**2:51–2:57** — Everything else is a contingency. True in some rows and false in others.

> Caption: Anything else is a contingency: true in some rows, false in others.

Exam-trap caption mode adds: *Most formulas you meet are contingencies. Do not assume a formula is a tautology because every row you checked happened to be true.*

**2:57–3:06** — The procedure is mechanical. Write every row, then read the final column.

> Caption: The decision procedure: write every row, then read the last column.

Exam-trap caption mode adds: *One true row never proves a tautology. Every row must be true, and for three variables that is eight rows, not four.*

## Scene 7. Logical equivalence, and De Morgan

*3:06 – 3:36 · objective: Test equivalence by column matching, and verify both De Morgan laws across all eight rows.*

**3:06–3:12** — Two formulas are logically equivalent when their columns are identical in every row.

> Caption: Two formulas are logically equivalent when their columns are identical.

Exam-trap caption mode adds: *A single row where the values agree proves nothing. Equivalence needs the whole column.*

**3:12–3:19** — De Morgan, first law. Not, P and Q, is not P, or not Q. The connective flips.

> Caption: De Morgan, first law: NOT of P and Q is NOT P or NOT Q.

Exam-trap caption mode adds: *The connective flips when the negation goes inside. NOT of P and Q is not NOT P and NOT Q.*

**3:19–3:26** — De Morgan, second law. Not, P or Q, is not P, and not Q. Again the connective flips.

> Caption: De Morgan, second law: NOT of P or Q is NOT P and NOT Q.

Exam-trap caption mode adds: *Both laws require the connective to flip. Negating without flipping gives a formula that disagrees in two rows.*

**3:26–3:36** — Distribution holds. With three variables that is eight rows, and the two columns agree in every one.

> Caption: Distribution works, and the two sides need all eight rows of three variables to prove it.

Exam-trap caption mode adds: *A formula with three variables has eight rows, not six. The count is two to the power of the number of variables, and the rows you skip are where the counterexample hides.*

## Scene 8. Valid arguments and the two famous errors

*3:36 – 4:12 · objective: Decide validity by a tautology test, then find the single row that kills affirming the consequent.*

**3:36–3:42** — An argument is valid when the premises cannot all be true while the conclusion is false.

> Caption: An argument is valid when the premises cannot all be true while the conclusion is false.

Exam-trap caption mode adds: *Valid is not the same word as true. Sound means valid with true premises, and that is a stronger requirement.*

**3:42–3:49** — Modus ponens. P implies Q, and P, therefore Q. The test formula is a tautology, so the argument is valid.

> Caption: Modus ponens: P implies Q, and P, therefore Q. Valid.

**3:49–3:56** — Modus tollens. P implies Q, and not Q, therefore not P. Also valid.

> Caption: Modus tollens: P implies Q, and NOT Q, therefore NOT P. Also valid.

Exam-trap caption mode adds: *Modus tollens is valid. Denying the antecedent, which looks similar, is not.*

**3:56–4:04** — Affirming the consequent. P implies Q, and Q, therefore P. The test formula is false in one row, so the form is invalid.

> Caption: Affirming the consequent: P implies Q, and Q, therefore P. Invalid.

Exam-trap caption mode adds: *The counterexample row is P false, Q true. It says the consequent can hold for a reason other than P, which is why Q does not give P back.*

**4:04–4:12** — Denying the antecedent fails at the same row. One counterexample is a complete disproof of a form.

> Caption: Denying the antecedent fails for the same row, and one counterexample settles it.

Exam-trap caption mode adds: *You do not need to check every row to refute a form. One row with true premises and a false conclusion is a complete disproof.*

## Scene 9. Satisfiable, and how many rows

*4:12 – 4:38 · objective: Place every formula in one of three classes and count truth tables exactly.*

**4:12–4:18** — Satisfiable means some row makes it true. Unsatisfiable means no row does.

> Caption: Satisfiable means some row makes it true. Unsatisfiable means no row does.

Exam-trap caption mode adds: *Satisfiable and valid are different questions. One true row makes a formula satisfiable; only all-true rows make it valid.*

**4:18–4:25** — With n variables there are two to the n rows. Three variables give eight.

> Caption: With n variables there are two to the n rows, so three variables give eight.

Exam-trap caption mode adds: *Three variables is eight rows, not six. Doubling, not adding, is what makes the table grow fast.*

**4:25–4:31** — There are sixteen truth tables on two variables, and two hundred and fifty six on three.

> Caption: There are sixteen different truth tables on two variables, and 256 on three.

Exam-trap caption mode adds: *The exponent is two to the n, not two times n. Two variables give sixteen tables, and three give two hundred and fifty six, not sixty four.*

**4:31–4:38** — That count is why questions ask how many functions exist rather than which one.

> Caption: That count is why questions ask how many functions or how many rows, not which one.

Exam-trap caption mode adds: *Do not answer the number of rows when the question asked for the number of functions. The second is an exponent of the first.*

## Scene 10. The rules worth carrying in

*4:38 – 5:00 · objective: Consolidate the five load-bearing rules and the three errors they prevent.*

**4:38–4:43** — Rule one. An implication is false in exactly one row.

> Caption: One: an implication is false in exactly one row.

**4:43–4:48** — Rule two. The contrapositive is equivalent. The converse and the inverse are not.

> Caption: Two: contrapositive is equivalent, converse and inverse are not.

**4:48–4:54** — Rule three. Remove an arrow by writing not P or Q.

> Caption: Three: remove an arrow by writing NOT P or Q.

**4:54–5:00** — Rule four. A form is invalid the moment one row breaks it. One counterexample is enough.

> Caption: Four: a form is invalid the moment one row breaks it.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
