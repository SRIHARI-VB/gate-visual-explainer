# Ambiguity Of Context Free Grammars — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/ambiguity-of-context-free-grammars/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 50 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. One string, two trees, two questions

*0:00 – 0:30 · objective: Separate two questions that share a word: is this grammar ambiguous, and could any grammar for these strings be unambiguous.*

**0:00–0:06** — A grammar says how to build strings. Nothing in it promises to build each string in one way only.

> Caption: A grammar says how to build strings. Nothing in it promises to build each string in one way only.

**0:06–0:12** — The expression grammar E goes to E plus E, or E times E, or the operand i, builds i plus i times i in two ways.

> Caption: The expression grammar E goes to E plus E, or E times E, or the operand i, builds i plus i times i in two ways.

**0:12–0:18** — The two ways are i plus i, all times i, and i plus, i times i. Different trees, different arithmetic.

> Caption: The two ways are i plus i, all times i, and i plus, i times i. Different trees, different arithmetic.

**0:18–0:24** — That is ambiguity of a grammar: one string, two parse trees. It is a property of the rules you were handed.

> Caption: That is ambiguity of a grammar: one string, two parse trees. It is a property of the rules you were handed.

Exam-trap caption mode adds: *Two trees for one string proves the grammar ambiguous. It proves nothing about the language, which may well have another grammar with one tree per string.*

**0:24–0:30** — The second question is about the language: is there any grammar for these strings with one tree each?

> Caption: The second question is about the language: is there any grammar for these strings with one tree each?

## Scene 2. A tree, not a derivation order

*0:30 – 1:00 · objective: State ambiguity as two distinct parse trees for one string, and show why two derivation orders are not two trees.*

**0:30–0:36** — A parse tree has the start symbol at the root, one node per rule used, and the string along the bottom.

> Caption: A parse tree has the start symbol at the root, one node per rule used, and the string along the bottom.

**0:36–0:42** — A grammar is ambiguous when some string in its language has two different parse trees.

> Caption: A grammar is ambiguous when some string in its language has two different parse trees.

Exam-trap caption mode adds: *The word is any, not every. One string with two trees settles it; most strings of an ambiguous grammar may still have exactly one tree.*

**0:42–0:48** — Equivalently, two different leftmost derivations: always expand the leftmost nonterminal next.

> Caption: Equivalently, two different leftmost derivations: always expand the leftmost nonterminal next.

**0:48–0:54** — Not two different derivations. Expanding the right branch first is the same tree written in another order.

> Caption: Not two different derivations. Expanding the right branch first is the same tree written in another order.

**0:54–1:00** — So ambiguity is about the tree, never about the order in which the steps are written down.

> Caption: So ambiguity is about the tree, never about the order in which the steps are written down.

Exam-trap caption mode adds: *If an option says the grammar is ambiguous because a string has two derivations, check which kind. Only leftmost derivations, or trees, decide it.*

## Scene 3. The counter: one number per piece of the string

*1:00 – 1:30 · objective: Fill the span table for i+i+i, read the count of trees off the whole-string cell, and see why this settles one string in cubic time.*

**1:00–1:06** — Deciding one string is mechanical. Fill one cell for each piece of the string, shortest pieces first.

> Caption: Deciding one string is mechanical. Fill one cell for each piece of the string, shortest pieces first.

**1:06–1:12** — The cell for a piece counts the trees that build it from E. A piece that is one letter holds 1.

> Caption: The cell for a piece counts the trees that build it from E. A piece that is one letter holds 1.

**1:12–1:18** — For i plus i plus i the six pieces hold 1, 1, 1, 1, 1 and then 2 for the whole string.

> Caption: For i plus i plus i the six pieces hold 1, 1, 1, 1, 1 and then 2 for the whole string.

**1:18–1:24** — Two is the answer: the string has two trees, so this grammar is ambiguous. Nothing was guessed.

> Caption: Two is the answer: the string has two trees, so this grammar is ambiguous. Nothing was guessed.

**1:24–1:30** — The work is cubic in the length, so a machine settles one string quickly and a person should not try by hand.

> Caption: The work is cubic in the length, so a machine settles one string quickly and a person should not try by hand.

## Scene 4. i+i*i, and the Catalan count

*1:30 – 2:00 · objective: Draw the two trees of i+i*i, and read the tree counts 1, 1, 2, 5, 14, 42 as the Catalan numbers over the operands.*

**1:30–1:36** — Count the operands and the answer is a Catalan number: 1, 1, 2, 5, 14, 42 for one operand to six.

> Caption: Count the operands and the answer is a Catalan number: 1, 1, 2, 5, 14, 42 for one operand to six.

**1:36–1:42** — Two operands cannot be ambiguous here; three are enough. The shortest witness is i plus i plus i.

> Caption: Two operands cannot be ambiguous here; three are enough. The shortest witness is i plus i plus i.

**1:42–1:48** — With a multiplication in the string the two trees also disagree about the value: eight against six when i is 2.

> Caption: With a multiplication in the string the two trees also disagree about the value: eight against six when i is 2.

**1:48–1:54** — The count belongs to the rules, not to the strings. Another grammar for the same strings counts differently.

> Caption: The count belongs to the rules, not to the strings. Another grammar for the same strings counts differently.

**1:54–2:00** — Six operands already give 42 trees, so the growth is fast and a hand count stops being a proof.

> Caption: Six operands already give 42 trees, so the growth is fast and a hand count stops being a proof.

## Scene 5. Same language, one tree each

*2:00 – 2:30 · objective: Split one nonterminal into three levels, watch every count fall to 1, and check that no string changed sides.*

**2:00–2:06** — The repair splits one nonterminal into three levels: E for plus, T for times, F for an operand.

> Caption: The repair splits one nonterminal into three levels: E for plus, T for times, F for an operand.

**2:06–2:12** — E goes to E plus T or T, T goes to T times F or F, F goes to id. Each string now has one tree.

> Caption: E goes to E plus T or T, T goes to T times F or F, F goes to id. Each string now has one tree.

**2:12–2:18** — Computed: the six counts fall from 1, 1, 2, 5, 14, 42 to 1, 1, 1, 1, 1, 1.

> Caption: Computed: the six counts fall from 1, 1, 2, 5, 14, 42 to 1, 1, 1, 1, 1, 1.

**2:18–2:24** — The language did not change: 363 strings tested, none changed sides, and no levelled count went above 1.

> Caption: The language did not change: 363 strings tested, none changed sides, and no levelled count went above 1.

**2:24–2:30** — Precedence and associativity are decisions the grammar makes. Leaving them out is what created the ambiguity.

> Caption: Precedence and associativity are decisions the grammar makes. Leaving them out is what created the ambiguity.

Exam-trap caption mode adds: *A left-recursive grammar is not ambiguous by itself, and a grammar with both left and right recursion is not automatically ambiguous either. Count trees; do not use the shape of the rules as a test.*

## Scene 6. The dangling else: a repair that does not repair

*2:30 – 3:00 · objective: See the same failure in a language, and see that the obvious matched/unmatched repair stays ambiguous while the correct one does not.*

**2:30–2:36** — The dangling else is the same failure in a language: if c then if c then x else x.

> Caption: The dangling else is the same failure in a language: if c then if c then x else x.

**2:36–2:42** — The else can belong to the inner if or to the outer one. Both trees are legal, so the grammar is ambiguous.

> Caption: The else can belong to the inner if or to the outer one. Both trees are legal, so the grammar is ambiguous.

**2:42–2:48** — The textbook repair splits statements into matched and unmatched, so an else always closes the nearest if.

> Caption: The textbook repair splits statements into matched and unmatched, so an else always closes the nearest if.

**2:48–2:54** — A repair that lets the else branch be any statement stays ambiguous: computed, the same string still has 2 trees.

> Caption: A repair that lets the else branch be any statement stays ambiguous: computed, the same string still has 2 trees.

Exam-trap caption mode adds: *A grammar that "looks unambiguous" is not evidence. The difference between the two repairs here is one symbol, and it changes the count from 2 to 1.*

**2:54–3:00** — The version whose else branch is unmatched gives 1, and 782 tested strings agree on the language.

> Caption: The version whose else branch is unmatched gives 1, and 782 tested strings agree on the language.

## Scene 7. Three counters, not one

*3:00 – 3:30 · objective: Keep trees, leftmost derivations and derivation sequences apart, with the three numbers for i+i and i+i+i.*

**3:00–3:06** — Three different numbers hide behind the word derivation. Keep them apart and the definition stops wobbling.

> Caption: Three different numbers hide behind the word derivation. Keep them apart and the definition stops wobbling.

**3:06–3:12** — For i plus i: one tree, one leftmost derivation, and two derivation sequences.

> Caption: For i plus i: one tree, one leftmost derivation, and two derivation sequences.

**3:12–3:18** — For i plus i plus i: two trees, two leftmost derivations, and sixteen sequences.

> Caption: For i plus i plus i: two trees, two leftmost derivations, and sixteen sequences.

**3:18–3:24** — So two derivations is a test only if you mean leftmost, or if you count trees. Otherwise it overcounts.

> Caption: So "two derivations" is a test only if you mean leftmost, or if you count trees. Otherwise it overcounts.

Exam-trap caption mode adds: *Sixteen against two: an option that says "the string has many derivations, so the grammar is ambiguous" is false for a grammar that is unambiguous.*

**3:24–3:30** — A grammar with many derivation orders and one tree per string is unambiguous, and Knuth says so about his own.

> Caption: A grammar with many derivation orders and one tree per string is unambiguous, and Knuth says so about his own.

## Scene 8. A grammar can be repaired; a language may not be

*3:30 – 4:00 · objective: Count the two trees of a to the n b to the n c to the n in the standard grammar for the inherently ambiguous language, and name the theorem.*

**3:30–3:36** — Now the harder question: is the language itself ambiguous, whatever grammar anybody writes for it?

> Caption: Now the harder question: is the language itself ambiguous, whatever grammar anybody writes for it?

**3:36–3:42** — Take strings a to the i, b to the j, c to the k with i equal to j, or j equal to k. Two families, one language.

> Caption: Take strings a to the i, b to the j, c to the k with i equal to j, or j equal to k. Two families, one language.

**3:42–3:48** — The overlap strings a to the n b to the n c to the n belong to both families, so they get 2 trees.

> Caption: The overlap strings a to the n b to the n c to the n belong to both families, so they get 2 trees.

**3:48–3:54** — So this grammar is ambiguous on infinitely many strings and on nothing else. That is still ambiguity.

> Caption: So this grammar is ambiguous on infinitely many strings and on nothing else. That is still ambiguity.

**3:54–4:00** — Ginsburg and Ullian proved in 1966 that no grammar for this language escapes it. That is inherent ambiguity.

> Caption: Ginsburg and Ullian proved in 1966 that no grammar for this language escapes it. That is inherent ambiguity.

Exam-trap caption mode adds: *Showing one grammar for a language is ambiguous proves nothing about the language. Inherent ambiguity needs the theorem, or a proof by Ogden's lemma.*

## Scene 9. Why no program can decide it

*4:00 – 4:30 · objective: Build the grammar from a set of dominoes, and see that a match produces exactly the string with two trees while no match never does.*

**4:00–4:06** — Why can no program decide ambiguity? Because a decider would also decide Post's correspondence problem.

> Caption: Why can no program decide ambiguity? Because a decider would also decide Post's correspondence problem.

**4:06–4:12** — From the dominoes build one grammar: S goes to U or to V, and U spells the top row while V spells the bottom.

> Caption: From the dominoes build one grammar: S goes to U or to V, and U spells the top row while V spells the bottom.

**4:12–4:18** — A matching sequence makes one string that both halves generate, so that string has exactly 2 trees.

> Caption: A matching sequence makes one string that both halves generate, so that string has exactly 2 trees.

**4:18–4:24** — Computed: with a match, 2 strings sit in both halves and carry 2 trees each; with no match, 0 and never more than 1.

> Caption: Computed: with a match, 2 strings sit in both halves and carry 2 trees each; with no match, 0 and never more than 1.

**4:24–4:30** — So a decider for ambiguity would answer the domino question, which is undecidable. Cantor, Floyd, Chomsky and Schützenberger, 1962 to 1963.

> Caption: So a decider for ambiguity would answer the domino question, which is undecidable. Cantor, Floyd, Chomsky and Schützenberger, 1962 to 1963.

Exam-trap caption mode adds: *Undecidable does not mean no instance can be decided. One grammar and one string are always decidable; what fails is one algorithm for all grammars.*

## Scene 10. What is decidable, and the four question shapes

*4:30 – 5:00 · objective: Sort the four decision problems, name the infinitely ambiguous grammar, and reduce every exam question to one of four shapes.*

**4:30–4:36** — So: ambiguity of a string is decidable, ambiguity of a grammar is not, inherent ambiguity of a language is not.

> Caption: So: ambiguity of a string is decidable, ambiguity of a grammar is not, inherent ambiguity of a language is not.

**4:36–4:42** — A regular grammar is decidable and always repairable: 510 strings tested, never more than 1 tree.

> Caption: A regular grammar is decidable and always repairable: 510 strings tested, never more than 1 tree.

**4:42–4:48** — A grammar can even be infinitely ambiguous: S to S S, or a, or epsilon gives the empty string infinitely many trees.

> Caption: A grammar can even be infinitely ambiguous: S to S S, or a, or epsilon gives the empty string infinitely many trees.

**4:48–4:54** — Four exam shapes: which grammar is ambiguous, how many trees, is the language inherently ambiguous, what is decidable.

> Caption: Four exam shapes: which grammar is ambiguous, how many trees, is the language inherently ambiguous, what is decidable.

**4:54–5:00** — The line to carry: name the object first, string, grammar, or language, and the answer follows.

> Caption: The line to carry: name the object first — string, grammar, or language — and the answer follows.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
