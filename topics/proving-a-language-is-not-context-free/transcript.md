# Proving a Language Is Not Context-Free: the Pumping Lemma as a Game, Ogden’s Lemma and the Closure Route — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/proving-a-language-is-not-context-free/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. What the lemma is for

*0:00 – 0:30 · objective: Place the lemma as a one-way test: it can prove a language is outside the context-free class, and it can never prove one is inside it.*

**0:00–0:07** — The pumping lemma is a one-way test: it can prove a language is not context-free, and it can never prove one is.

> Caption: The pumping lemma is a one-way test: it can prove a language is not context-free, and it can never prove one is.

**0:07–0:15** — Every context-free language has a number p: every string of length p or more splits into five parts.

> Caption: Every context-free language has a number p: every string of length p or more splits into five parts.

**0:15–0:22** — The two middle parts may be repeated together: v to the i, x, y to the i is still in the language for every i.

> Caption: The two middle parts may be repeated together: v to the i, x, y to the i is still in the language for every i.

**0:22–0:30** — The GATE 2027 syllabus names it directly in Section 6: regular and context-free languages, pumping lemma.

> Caption: The GATE 2027 syllabus names it directly in Section 6: regular and context-free languages, pumping lemma.

## Scene 2. Where the five parts come from

*0:30 – 1:00 · objective: Derive the five-part split from a parse tree: a long string has a tall tree, a tall tree repeats a nonterminal on one path, and the repeated pair cuts the string into u, v, x, y, z.*

**0:30–0:37** — A long string has a tall parse tree, and a tree taller than the number of nonterminals repeats one on a path.

> Caption: A long string has a tall parse tree, and a tree taller than the number of nonterminals repeats one on a path.

**0:37–0:45** — The repeated pair cuts the string into five pieces: the lower copy of the nonterminal derives v x y.

> Caption: The repeated pair cuts the string into five pieces: the lower copy of the nonterminal derives v x y.

**0:45–0:52** — Copying the upper subtree in place of the lower one repeats v and y together, so every i is still derivable.

> Caption: Copying the upper subtree in place of the lower one repeats v and y together, so every i is still derivable.

**0:52–1:00** — The pumping length is the grammar’s own number: p = 2 to the k for a grammar in Chomsky normal form with k nonterminals.

> Caption: The pumping length is the grammar’s own number: p = 2 to the k for a grammar in Chomsky normal form with k nonterminals.

## Scene 3. The two conditions, and the direction

*1:00 – 1:30 · objective: State both conditions exactly — vxy has at most p letters, v and y are not both empty — and read the quantifier order as a game with three moves.*

**1:00–1:07** — Condition one: the window v x y is short, at most p letters. Condition two: v and y are not both empty.

> Caption: Condition one: the window v x y is short, at most p letters. Condition two: v and y are not both empty.

**1:07–1:15** — The short window is what makes the lemma bite: a split may only disturb a bounded piece of the string.

> Caption: The short window is what makes the lemma bite: a split may only disturb a bounded piece of the string.

**1:15–1:22** — The quantifier order is the whole lemma: there exists p, for every long enough w, there exists a split, for every i.

> Caption: The quantifier order is the whole lemma: there exists p, for every long enough w, there exists a split, for every i.

**1:22–1:30** — Read it as a game: you pick w, the adversary picks the split, you pick i, and you win if some i leaves the language.

> Caption: Read it as a game: you pick w, the adversary picks the split, you pick i, and you win if some i leaves the language.

## Scene 4. Playing the game on aⁿbⁿcⁿ

*1:30 – 2:00 · objective: Run the case analysis that proves aⁿbⁿcⁿ is not context-free, and see why the short condition on vxy is what makes the two cases exhaustive.*

**1:30–1:37** — Take w as p a’s, then p b’s, then p c’s. Its length is 3p, so the lemma applies to it.

> Caption: Take w as p a’s, then p b’s, then p c’s. Its length is 3p, so the lemma applies to it.

**1:37–1:45** — The window has at most p letters and the middle block has exactly p b’s, so it cannot touch all three blocks.

> Caption: The window has at most p letters and the middle block has exactly p b’s, so it cannot touch all three blocks.

**1:45–1:52** — Case one: the window sits inside one block, so pumping changes one count and the three counts no longer agree.

> Caption: Case one: the window sits inside one block, so pumping changes one count and the three counts no longer agree.

**1:52–2:00** — Case two: the window straddles two blocks, so two counts move and the third stays, which is again a contradiction.

> Caption: Case two: the window straddles two blocks, so two counts move and the third stays, which is again a contradiction.

## Scene 5. The search, and what it can prove

*2:00 – 2:30 · objective: Run the lemma as an exhaustive search over a stated family of strings, and see exactly what a refutation at one value of p does and does not establish.*

**2:00–2:07** — Run the lemma as a search: fix p, then try every allowed split of every string in a stated family.

> Caption: Run the lemma as a search: fix p, then try every allowed split of every string in a stated family.

**2:07–2:15** — On aⁿbⁿcⁿ the search refutes p = 1 through 6, each time finding a string with no surviving split.

> Caption: On aⁿbⁿcⁿ the search refutes p = 1 through 6, each time finding a string with no surviving split.

**2:15–2:22** — The witnesses are computed, not chosen: abc refutes p = 1, 2 and 3, and aabbcc refutes p = 4, 5 and 6.

> Caption: The witnesses are computed, not chosen: abc refutes p = 1, 2 and 3, and aabbcc refutes p = 4, 5 and 6.

**2:22–2:30** — A refutation at one p is not a proof: the lemma needs some p to work, so a finite search can never finish the job.

> Caption: A refutation at one p is not a proof: the lemma needs some p to work, so a finite search can never finish the job.

Exam-trap caption mode adds: *Refuting one pumping length never proves a language is not context-free. Only an argument that covers every p does.*

## Scene 6. Why a small p proves nothing

*2:30 – 3:00 · objective: A context-free language can fail the lemma at p = 1 and pass it from p = 2 upwards, so a single failed pumping length is never a counterexample.*

**2:30–2:37** — aⁿbⁿ is context-free, and the search refutes it at p = 1: the two-letter string ab has no surviving split.

> Caption: aⁿbⁿ is context-free, and the search refutes it at p = 1: the two-letter string ab has no surviving split.

**2:37–2:45** — At p = 2 it survives, and at every p up to 6: take one a as v and one b as y, and both counts move together.

> Caption: At p = 2 it survives, and at every p up to 6: take one a as v and one b as y, and both counts move together.

**2:45–2:52** — So a failed pumping length is not a counterexample to the lemma. It says only that p was too small.

> Caption: So a failed pumping length is not a counterexample to the lemma. It says only that p was too small.

Exam-trap caption mode adds: *A language that fails the lemma at one p has not been shown to be non-context-free. The lemma quantifies over existence of p.*

**2:52–3:00** — The lemma is necessary and never sufficient, and the next two scenes are the two ways that bites.

> Caption: The lemma is necessary and never sufficient, and the next two scenes are the two ways that bites.

## Scene 7. Ogden's lemma

*3:00 – 3:30 · objective: Mark letters before the split. The pump must touch a marked letter and vxy may carry at most p marked ones, which shortens the case analysis from six cases to two.*

**3:00–3:07** — Ogden’s lemma lets you mark letters first: the pump must touch a marked letter and the window may carry at most p marked ones.

> Caption: Ogden’s lemma lets you mark letters first: the pump must touch a marked letter and the window may carry at most p marked ones.

**3:07–3:15** — Marking turns a weak condition into a strong one: you decide where the adversary is allowed to pump.

> Caption: Marking turns a weak condition into a strong one: you decide where the adversary is allowed to pump.

**3:15–3:22** — On aⁿbⁿcⁿ, marking the a’s cuts the cases: the search tries 2, 13, 44, 110, 230 and 427 splits at p = 1 to 6.

> Caption: On aⁿbⁿcⁿ, marking the a’s cuts the cases: the search tries 2, 13, 44, 110, 230 and 427 splits at p = 1 to 6.

**3:22–3:30** — Same language, same conclusion, fewer cases: a split that touches a b or a c is killed by the marking at once.

> Caption: Same language, same conclusion, fewer cases: a split that touches a b or a c is killed by the marking at once.

## Scene 8. A language that passes and is still not context-free

*3:30 – 4:00 · objective: Show that surviving the lemma proves nothing: one language survives every tested p, fails Ogden’s lemma at every p, and is not context-free by a closure argument.*

**3:30–3:37** — Take the strings a to the i, b to the j, c to the k, d to the l where i is 0 or j equals k equals l.

> Caption: Take the strings a to the i, b to the j, c to the k, d to the l where i is 0 or j equals k equals l.

**3:37–3:45** — The plain lemma survives at every p from 1 to 6, over 228 tested strings: when there is no a, pump any b.

> Caption: The plain lemma survives at every p from 1 to 6, over 228 tested strings: when there is no a, pump any b.

**3:45–3:52** — Ogden’s lemma refutes it at every p: marking the b’s forces the pump into a block whose count must stay equal.

> Caption: Ogden’s lemma refutes it at every p: marking the b’s forces the pump into a block whose count must stay equal.

**3:52–4:00** — And it is not context-free: intersecting it with a-plus b-star c-star d-star leaves three equal counts, which fail at every p.

> Caption: And it is not context-free: intersecting it with a-plus b-star c-star d-star leaves three equal counts, which fail at every p.

Exam-trap caption mode adds: *Surviving the pumping lemma is not evidence of being context-free. This language survives at every tested p and is not context-free.*

## Scene 9. The closure route

*4:00 – 4:30 · objective: Most exam questions fall to closure rather than to the lemma: intersect with a regular set, apply a homomorphism, and the counting constraint becomes visible.*

**4:00–4:07** — Most exam questions fall to closure instead of the lemma: intersect with a regular set, or apply a homomorphism.

> Caption: Most exam questions fall to closure instead of the lemma: intersect with a regular set, or apply a homomorphism.

**4:07–4:15** — GATE CSE 2019 asked which of four languages is not context-free. Computed: w aⁿ w-reverse bⁿ is refuted at every p.

> Caption: GATE CSE 2019 asked which of four languages is not context-free. Computed: w aⁿ w-reverse bⁿ is refuted at every p.

**4:15–4:22** — Its neighbours survive: w w-reverse and w aⁿ bⁿ w-reverse from p = 2, and aⁿ b to the i with i in n, 3n, 5n at p = 6.

> Caption: Its neighbours survive: w w-reverse and w aⁿ bⁿ w-reverse from p = 2, and aⁿ b to the i with i in n, 3n, 5n at p = 6.

**4:22–4:30** — GATE CSE 2016 Set 2 paired aⁿbᵐcⁿ⁺ᵐ, which survives from p = 2, with aⁿbⁿc²ⁿ, which is refuted at every p.

> Caption: GATE CSE 2016 Set 2 paired aⁿbᵐcⁿ⁺ᵐ, which survives from p = 2, with aⁿbⁿc²ⁿ, which is refuted at every p.

## Scene 10. How GATE asks it

*4:30 – 5:00 · objective: Name the four question shapes, the counting test that answers most of them, and the two direction traps that decide the rest.*

**4:30–4:37** — Four shapes: which of these is not context-free; is this grammar’s pumping length valid; what does the split force; which statement is false.

> Caption: Four shapes: which of these is not context-free; is this grammar’s pumping length valid; what does the split force; which statement is false.

**4:37–4:45** — The procedure: count the independent equalities. One stack tracks one, so two at once across three blocks is the usual answer.

> Caption: The procedure: count the independent equalities. One stack tracks one, so two at once across three blocks is the usual answer.

**4:45–4:52** — Then check the direction twice: surviving the lemma proves nothing, and a failed small p proves nothing either.

> Caption: Then check the direction twice: surviving the lemma proves nothing, and a failed small p proves nothing either.

**4:52–5:00** — One line to carry: the lemma kills languages, never saves them.

> Caption: One line to carry: the lemma kills languages, never saves them.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
