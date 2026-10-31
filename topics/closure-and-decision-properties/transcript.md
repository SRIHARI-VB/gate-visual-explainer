# Closure And Decision Properties — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/closure-and-decision-properties/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Two questions about a class of languages

*0:00 – 0:30 · objective: See the two separate questions the syllabus asks about regular and context-free languages — which operations keep a language inside its class, and which questions an algorithm can answer — and why they are different questions.*

**0:00–0:07** — Two questions: what survives combination, and what can be answered.

> Caption: A class of languages is judged by what it survives and what it answers.

**0:07–0:15** — Closure is about operations. Decidability is about questions.

> Caption: Closure is about operations. Decidability is about questions.

**0:15–0:22** — Failing proves outside. Passing proves nothing.

> Caption: The pumping lemma is the tool that proves a language is outside a class.

Exam-trap caption mode adds: *A language that passes the pumping lemma is not thereby regular. The lemma is necessary, never sufficient.*

**0:22–0:30** — The third clause names this page directly. Class A.

> Caption: Syllabus position: Section 6 names this clause in its own words.

## Scene 2. The regular pumping lemma as a game

*0:30 – 1:00 · objective: State the lemma with its three conditions, see why it must be true for any finite automaton, and watch a^n b^n lose the game at every p tried.*

**0:30–0:37** — Long word, repeated state, so a loop. Repeat the loop.

> Caption: A long enough word in a regular language contains a loop, and the loop can be repeated.

**0:37–0:45** — Non-empty y, short prefix, every pump inside the language.

> Caption: Three conditions: |y| at least 1, |xy| at most p, and every pump stays inside.

**0:45–0:52** — Eight witnesses, every legal split, none survives.

> Caption: a^n b^n loses at every p from 1 to 8: the only legal y sits among the a's.

**0:52–1:00** — One sentence covers every p. That is the proof.

> Caption: The witness has to be chosen, not searched: a^p b^p is the whole proof.

Exam-trap caption mode adds: *Proving non-regularity needs one witness per p, given symbolically. Checking a few values of p proves nothing.*

## Scene 3. The pumping length is a number with a direction

*1:00 – 1:30 · objective: Separate the lemma's constant p from the language it belongs to: any p at least as large as the smallest one works, and a proposed p can be too small. Meet the 2019 question.*

**1:00–1:07** — Some p exists. The lemma does not say which.

> Caption: The lemma says some p exists. It never says which p.

**1:07–1:15** — Larger p is weaker. The smallest one is the property.

> Caption: If p works then every larger p works, so the useful number is the smallest one.

**1:15–1:22** — Twenty-four failures at one, none from two upward.

> Caption: At p = 1 this page's test language loses 24 of its 132 members; from p = 2 it loses none.

**1:22–1:30** — A p that fails is a p that was too small.

> Caption: A wrong pumping length is not a counterexample to the lemma.

Exam-trap caption mode adds: *Answering "no pumping length exists" because one small p failed is the standard mistake on this question.*

## Scene 4. Necessary, never sufficient

*1:30 – 2:00 · objective: Meet a language that satisfies the lemma from p = 2 upward and is still not regular, and see why passing the test can never be a proof of regularity.*

**1:30–1:37** — It passes from two upward. It is still not regular.

> Caption: This page's worked language passes the lemma from p = 2 and is still not regular.

**1:37–1:45** — Intersect with a regular language. The result fails, so the original was not regular.

> Caption: The intersection with a b* c* is a b^j c^j, which fails the lemma outright.

**1:45–1:52** — Longer than every word: nothing to test, nothing to prove.

> Caption: Every finite language is regular, and for it the lemma is vacuous.

**1:52–2:00** — Two sound routes. Passing the lemma is not one of them.

> Caption: To prove a language regular, build a machine. To prove it irregular, fail the lemma or use closure.

Exam-trap caption mode adds: *A language that passes the pumping lemma is not thereby regular. Use Myhill-Nerode or a closure argument instead.*

## Scene 5. The same game with five pieces

*2:00 – 2:30 · objective: State the CFL lemma, count its legal splits, and watch a^n b^n c^n lose at every n — the language that two context-free languages produce when intersected.*

**2:00–2:07** — Five pieces. Two of them pump together.

> Caption: The CFL lemma splits a word into five pieces: u v w x y.

**2:07–2:15** — Short window. Not both empty. Both pump together.

> Caption: The conditions: |vwx| at most n, and v and x not both empty.

**2:15–2:22** — At most two blocks. At most two counts change.

> Caption: a^n b^n c^n loses: the window can cover at most two of the three blocks.

**2:22–2:30** — Two context-free languages, one intersection, outside the class.

> Caption: a^n b^n c^n is the intersection of two context-free languages, which is the next scene.

## Scene 6. Closure: seven operations, all of them kept

*2:30 – 3:00 · objective: Run union, intersection, difference, complement, concatenation, star and reversal on two automata, count the states each construction needs, and confirm all seven against their definitions.*

**2:30–2:37** — Three states each. Every operation runs on these.

> Caption: Two automata: a's divisible by 3, and contains the substring ab.

**2:37–2:45** — One product, three answers, seven states, five after minimising.

> Caption: Union, intersection and difference are one product: 7 states, minimal 5.

**2:45–2:52** — Flip the accepting set. Only after making the machine total.

> Caption: Complement is 3 states: flip the accepting set, after adding a sink if needed.

Exam-trap caption mode adds: *Complementing an NFA by flipping its accepting states gives the complement of nothing. Determinise first.*

**2:52–3:00** — Seven constructions, 255 strings each, seven agreements.

> Caption: Concatenation 7 states, star 3, reversal 4 — and all seven agree with their definitions.

## Scene 7. Closure: what context-free languages lose

*3:00 – 3:30 · objective: Confirm union, concatenation and star by generating grammar, then watch intersection and complement fail — with the witness that fails and the one-line argument that settles complement.*

**3:00–3:07** — One new start symbol each. All three kept.

> Caption: Union, concatenation and star are kept: one new start symbol is enough.

**3:07–3:15** — Two members, one intersection, outside the class.

> Caption: Intersection is lost: a^n b^n c^m and a^m b^n c^n meet at a^n b^n c^n.

**3:15–3:22** — If complement were kept, intersection would be. It is not.

> Caption: Complement is lost by one line: closure under complement plus union would give intersection.

**3:22–3:30** — Minus a regular language: kept. Minus a context-free one: not.

> Caption: Difference with a regular language is kept, even though difference is not.

Exam-trap caption mode adds: *L1 minus R is context-free. L1 minus L2 is not necessarily context-free. The second operand decides it.*

## Scene 8. The one asymmetric tool: CFL intersect regular

*3:30 – 4:00 · objective: Build the product grammar, count its nonterminals and productions, verify it against its definition, and see why this construction is the standard way to prove a language context-free.*

**3:30–3:37** — With itself, no. With a regular language, yes.

> Caption: A context-free language intersected with a regular one is context-free. That asymmetry is the tool.

**3:37–3:45** — Five nonterminals: one grammar symbol times four state pairs.

> Caption: Each nonterminal becomes a family [A,p,q]: the strings A makes that carry p to q.

**3:45–3:52** — Nineteen productions, 127 strings, no disagreement.

> Caption: The example: equal counts of a and b, restricted to even length. 19 productions.

**3:52–4:00** — A grammar comes out, so the class is decided.

> Caption: The result is a grammar, so it is context-free by construction, not by inspection.

Exam-trap caption mode adds: *Do not answer "not necessarily context-free" when one side is regular. The construction settles it in one direction only.*

## Scene 9. Which questions an algorithm can answer

*4:00 – 4:30 · objective: Read the six decision questions across the two classes, name the procedure for each decidable one, and identify the three that separate regular from context-free.*

**4:00–4:07** — Six questions, six procedures, all of them terminate.

> Caption: For a regular language, all six questions have algorithms.

**4:07–4:15** — Productive nonterminals for emptiness. Self-embedding for finiteness.

> Caption: For a grammar, emptiness and finiteness still have algorithms, on the grammar itself.

**4:15–4:22** — Parse it. Cubic time. Still an algorithm.

> Caption: Membership is decidable too: CYK or Earley, in time cubic in the length.

**4:22–4:30** — Three questions, no algorithm. Ambiguity is one of them.

> Caption: Universality, equivalence and ambiguity are the three that fail for grammars.

Exam-trap caption mode adds: *Membership being decidable does not make equivalence decidable. Equivalence quantifies over every string, and that is what fails.*

## Scene 10. How the question is asked

*4:30 – 5:00 · objective: Apply the two checks — which class is the language in, and does the claim say "always" or "this instance" — to the five verified previous-year questions that sit on this clause.*

**4:30–4:37** — Always means every instance. One counterexample ends the option.

> Caption: First check: which class is each language in, and is the word "always" doing work?

**4:37–4:45** — Regular on the other side changes the answer completely.

> Caption: Second check: is the operation against a regular language, or against the same class?

**4:45–4:52** — Five questions, two checks, applied once each.

> Caption: Five verified questions sit on this clause, and each turns on one of these two checks.

**4:52–5:00** — Two checks first. Then the arithmetic, if any is left.

> Caption: Do the two checks before the arithmetic, and most wrong options remove themselves.

Exam-trap caption mode adds: *Starting with the arithmetic is how the plausible wrong option gets chosen on both of these questions.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
