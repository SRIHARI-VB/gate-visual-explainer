# Post's Correspondence Problem: Dominoes, the Prefix Invariant, and the Reduction that Makes Ambiguity Undecidable — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/post-correspondence-problem/index.html`
- Total duration: 6:12 (372 seconds), 12 scenes, 64 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. An instance is a handful of dominoes

*0:00 – 0:30 · objective: State what one PCP instance is, and what a match is, without any notation.*

**0:00–0:06** — A domino carries a string on top and a string on the bottom.

> Caption: A domino has a string on top and a string on the bottom. That is all an instance is made of.

Exam-trap caption mode adds: *The two strings of a domino are independent. Nothing forces them to have the same length, or the same first letter.*

**0:06–0:12** — You may reuse any domino any number of times.

> Caption: You are given a finite set of dominoes, and you may use each one as many times as you like.

Exam-trap caption mode adds: *Reuse is allowed. A search that forbids reuse is solving a different, easier problem.*

**0:12–0:18** — A match is an ordering where the two rows read the same string.

> Caption: A match is an ordering of dominoes whose top strings, read in order, equal its bottom strings, read in order.

Exam-trap caption mode adds: *The same index sequence is used on both rows. A 'match' that picks one order for the top and another for the bottom is not a match.*

**0:18–0:24** — The question is existence, for every instance.

> Caption: The problem is not to find a match. It is to decide, for an arbitrary instance, whether one exists.

Exam-trap caption mode adds: *This distinction decides half the questions on the topic. Checking a candidate is trivial; deciding whether one exists is not.*

**0:24–0:30** — Post posed it in 1946 and proved it unsolvable.

> Caption: Emil Post posed exactly this in 1946, and called it the correspondence decision problem.

Exam-trap caption mode adds: *PCP is not a toy. It is used to prove that grammar ambiguity, CFL intersection emptiness and CFG equivalence are undecidable.*

## Scene 2. One instance, one match, built a domino at a time

*0:30 – 1:00 · objective: Assemble a real match and see the two strings agree only at the end.*

**0:30–0:36** — Four dominoes over two letters.

> Caption: Here is one instance: a over ab, b over aa, aa over a, ab over b.

Exam-trap caption mode adds: *No domino has equal top and bottom, so a length-one match is already impossible. That is the first thing to check, and it is cheap.*

**0:36–0:42** — The rows may disagree while you are still building.

> Caption: Place domino one: top reads a, bottom reads ab. The bottom is one letter ahead.

Exam-trap caption mode adds: *A partial match is not required to be equal. Requiring equality at every step would reject every real match.*

**0:42–0:48** — Each domino appends to both rows.

> Caption: Add domino two: top ab, bottom abaa. Add domino three: top abaa, bottom abaaa.

Exam-trap caption mode adds: *The gap can change sign in other instances. Here it does not, which is why one branch survives.*

**0:48–0:54** — Both rows read the same six letters.

> Caption: Add domino three again, and the two rows both read abaaaa.

Exam-trap caption mode adds: *The index sequence 1, 2, 3, 3 repeats domino three. A search that disallowed repetition would miss this match entirely.*

**0:54–1:00** — One match, four dominoes, one of them twice.

> Caption: Nothing was needed beyond the four dominoes: the match is the ordering 1, 2, 3, 3.

Exam-trap caption mode adds: *A match is an ordering, not a subset. Two different orderings of the same dominoes are two different matches.*

## Scene 3. The overhang: the only pruning a search has

*1:00 – 1:32 · objective: State and use the invariant that at every partial match one string is a prefix of the other.*

**1:00–1:06** — At every step, one row is a prefix of the other.

> Caption: At every step of a match, one row is a prefix of the other. That is the invariant.

Exam-trap caption mode adds: *The invariant is necessary, never sufficient. Satisfying it at every step does not guarantee a match exists.*

**1:06–1:12** — The unmatched tail is the overhang.

> Caption: The unmatched tail is called the overhang, and its length is the difference of the two row lengths.

Exam-trap caption mode adds: *The overhang is a string, not a count. Two branches with the same overhang length can behave completely differently.*

**1:12–1:18** — Appending never repairs a letter already written.

> Caption: A branch survives only if the new overhang stays compatible. This is the only pruning there is.

Exam-trap caption mode adds: *This is why the search is a tree and not a finite graph: there is no way to merge branches, because the overhang string is unbounded.*

**1:18–1:24** — b, then aa, then a, then nothing.

> Caption: On this match the overhang is b, then aa, then a, then nothing.

Exam-trap caption mode adds: *An overhang that shrinks to nothing is a match. An overhang that returns to a value already seen is not automatically a cycle, because the strings may differ.*

**1:24–1:32** — All four prefixes satisfy the invariant.

> Caption: Every prefix of the model's match was checked, and all four satisfy the invariant.

Exam-trap caption mode adds: *The invariant is what makes the search a search. Without it the tree has no pruning at all and the arithmetic in the next scene is wrong.*

## Scene 4. The search, and what it costs

*1:32 – 2:04 · objective: Count the work of a pruned search against an unpruned enumeration, and see why the match is minimal.*

**1:32–1:38** — Breadth first, so the first match is the shortest.

> Caption: A search grows level by level: every sequence of one domino, then two, then three.

Exam-trap caption mode adds: *Depth-first search can wander down an infinite branch and never return, even when a match exists three levels away.*

**1:38–1:44** — Four, sixteen and sixty-four, so eighty-four.

> Caption: Unpruned, the first three levels hold 4, 16 and 64 sequences: 84 in all.

Exam-trap caption mode adds: *The count grows as four to the k. A bound of twenty dominoes is already a trillion sequences.*

**1:44–1:50** — Twelve nodes against eighty-four sequences.

> Caption: With the prefix test the same three levels hold 2, 2 and 4 survivors, and twelve nodes are examined in total.

Exam-trap caption mode adds: *Pruning changes the constant, never the fact that the tree is infinite. It is not an algorithm for deciding the problem.*

**1:50–1:56** — No match exists below level four.

> Caption: The match sits at level four, and the model confirms no match exists at levels one, two or three.

Exam-trap caption mode adds: *'Breadth-first found it at level four' and 'nothing matches below four' are two different claims. Only the second is a proof of minimality.*

**1:56–2:04** — A search that halts on success is only half a decider.

> Caption: This run terminated because a match exists. When none exists, the same run never stops.

Exam-trap caption mode adds: *A program that answers yes correctly and loops otherwise is not a decider. Writing one is not a proof that the problem is decidable.*

## Scene 5. The instance where the search never ends

*2:04 – 2:38 · objective: Watch an overhang grow without bound, and see why no finite run can report 'no match'.*

**2:04–2:10** — An instance with no match.

> Caption: Here is an instance with no match: a over ab, b over bb, ba over b.

Exam-trap caption mode adds: *The phrase 'the model found no match' is an observation about a bound. It is not a proof that no match exists.*

**2:10–2:16** — The gap grows by one letter per domino.

> Caption: Every surviving branch has the bottom longer than the top, by one more letter at each level.

Exam-trap caption mode adds: *A growing overhang is evidence, not proof. The undecidability theorem is what rules out any cleverer search.*

**2:16–2:22** — The frontier never empties.

> Caption: Two branches survive at every depth after the first, forever. The frontier never empties.

Exam-trap caption mode adds: *'The frontier is nonempty' means 'not finished yet'. It does not mean 'a match is coming'.*

**2:22–2:28** — A bounded search can prove yes, never no.

> Caption: So a bounded search can prove a yes and can never prove a no.

Exam-trap caption mode adds: *This asymmetry is the same one that separates recursively enumerable from recursive, and GATE asks it in that language too.*

**2:28–2:32** — One cheap no: the first letters disagree everywhere.

> Caption: There is one cheap no: if every top begins with a and every bottom with b, no match can start.

Exam-trap caption mode adds: *A sufficient condition for no match is not a decision procedure. It settles some instances and says nothing about the rest.*

**2:32–2:38** — Special cases decide; the general problem does not.

> Caption: Special cases are decidable. The general problem is not, and that is a theorem, not an observation.

Exam-trap caption mode adds: *Never present a failed search as a proof of undecidability. The proof is the reduction in the next two scenes.*

## Scene 6. Fixing the first domino: MPCP and its padding

*2:38 – 3:12 · objective: Define MPCP and convert it to PCP by padding, so that the first domino is forced.*

**2:38–2:44** — MPCP forces the match to start with domino one.

> Caption: MPCP is the same problem with one extra rule: the match must start with the first domino.

Exam-trap caption mode adds: *MPCP is not easier in the sense that matters: it is undecidable too, and it reduces to PCP, not the other way round.*

**2:44–2:50** — The match is one then three, both rows aaa.

> Caption: This MPCP instance has the match 1, 3: a over aa, then aa over a, both rows reading aaa.

Exam-trap caption mode adds: *In MPCP the first domino is not optional. A match that happens to start elsewhere is not a match for the MPCP instance.*

**2:50–2:56** — Interleave a star through every string.

> Caption: To turn it into a PCP instance, interleave a new symbol between every pair of letters.

Exam-trap caption mode adds: *The padding must go on opposite sides of the two rows. Padding both rows the same way leaves the first-domino requirement unenforced.*

**2:56–3:02** — Only domino one can start a match.

> Caption: The first domino is padded on both sides, so it is the only one whose two rows start with the same symbol.

Exam-trap caption mode adds: *Check this claim on the actual instance. If two dominoes could start, the padding has been done wrong.*

**3:02–3:08** — One domino closes the match.

> Caption: One extra domino adds the missing star at the end, and the match is complete.

Exam-trap caption mode adds: *Without the closing domino the padded instance has no match even when the MPCP instance does. The construction is only correct as a whole.*

**3:08–3:12** — Strip the stars and the MPCP match is back.

> Caption: The padded match is 1, 4, 5 and reads star a star a star a star at on both rows.

Exam-trap caption mode adds: *The correspondence is an if-and-only-if. A construction that maps matches one way only does not prove undecidability.*

## Scene 7. The reduction: a match is an accepting history

*3:12 – 3:48 · objective: See the seven kinds of domino that make a match equivalent to a halting computation, and state the theorem.*

**3:12–3:18** — Dominoes are built out of the machine's transition table.

> Caption: The reduction starts from a Turing machine and its input, and builds dominoes out of the machine's own rules.

Exam-trap caption mode adds: *The reduction goes from the halting problem to PCP. It does not go from PCP to the halting problem, and the direction is what carries undecidability backwards.*

**3:18–3:24** — Start, copy, move.

> Caption: One domino starts the history, one copies a tape symbol, and one pair per transition moves the head.

Exam-trap caption mode adds: *The copy dominoes are what let the tape grow. Without them the match could only ever reproduce a fixed-length configuration.*

**3:24–3:30** — The accepting state finishes the match.

> Caption: Two more kinds of domino let the accepting state eat the rest of the tape and finish.

Exam-trap caption mode adds: *If the machine loops, no match exists. That is the whole content of the reduction: a match exists exactly when the machine accepts.*

**3:30–3:36** — A match is an accepting history, written twice.

> Caption: So a match is exactly an accepting computation history, written twice.

Exam-trap caption mode adds: *The top and bottom rows are not two different histories. They are the same history read at a one-step offset, which is why a domino appends to both.*

**3:36–3:42** — A decider for PCP would decide halting.

> Caption: If PCP were decidable, the halting problem would be, and it is not. So PCP is undecidable.

Exam-trap caption mode adds: *The argument is a contradiction, not a construction. Nothing here computes an answer for a particular instance.*

**3:42–3:48** — Two letters are needed for the theorem.

> Caption: The theorem needs at least two letters. With one letter the problem is decidable, and the next scenes show both sides.

Exam-trap caption mode adds: *State the hypothesis with the theorem. 'PCP is undecidable' without 'over an alphabet of at least two letters' is a false statement.*

## Scene 8. Consequence: grammar ambiguity is undecidable

*3:48 – 4:22 · objective: Build the grammar L_U union L_V and see a PCP match become two derivations of one word.*

**3:48–3:54** — Two languages, one from the tops and one from the bottoms.

> Caption: Give each domino its own marker letter, and build two languages, one from the tops and one from the bottoms.

Exam-trap caption mode adds: *The markers are what record the index sequence. Without them a word could not be traced back to the dominoes that produced it.*

**3:54–4:00** — One production per domino, and the language is context-free.

> Caption: Each language is context-free: one nonterminal, one production per domino.

Exam-trap caption mode adds: *The union of two context-free languages is context-free. Closure under union is one of the few operations that costs nothing here.*

**4:00–4:06** — The markers force the same index sequence.

> Caption: A word in both languages has two derivations, and the markers force the same index sequence in both.

Exam-trap caption mode adds: *This is why the construction needs distinct markers. With one shared marker the index sequences could differ and the argument collapses.*

**4:06–4:12** — One word, two derivations.

> Caption: On this instance the match 1, 2, 3, 3 gives one word with two derivations.

Exam-trap caption mode adds: *The word is ambiguous as a word of the union. A word that lies in only one of the two languages has exactly one derivation, however it looks.*

**4:12–4:18** — A non-match gives two different words.

> Caption: A sequence that is not a match gives two different words, so it produces no ambiguity.

Exam-trap caption mode adds: *Ambiguity of a grammar is a property of the grammar, not of a word. The reduction builds a grammar that is ambiguous exactly when the instance has a match.*

**4:18–4:22** — Deciding ambiguity would decide PCP.

> Caption: So deciding ambiguity would decide PCP. Ambiguity of a context-free grammar is undecidable.

Exam-trap caption mode adds: *For a particular grammar you can often answer. Undecidability is about one algorithm covering every input, not about every input being hard.*

## Scene 9. Consequences: intersection, equivalence, and where the line is

*4:22 – 4:52 · objective: Separate the undecidable questions about context-free grammars from the decidable ones about regular languages.*

**4:22–4:28** — Two more questions fall the same way.

> Caption: The same construction settles two more questions about context-free grammars.

Exam-trap caption mode adds: *These are questions about grammars given as input. A single pair of grammars may be settled by hand; the general question has no algorithm.*

**4:28–4:34** — Intersection emptiness is undecidable.

> Caption: Intersection emptiness is undecidable for two context-free languages.

Exam-trap caption mode adds: *Do not confuse this with non-closure. Non-closure says the intersection may not be context-free; it does not say emptiness cannot be decided.*

**4:34–4:40** — Regular languages keep every one of these decisions.

> Caption: But intersection with a regular language is decidable, and so is everything about regular languages.

Exam-trap caption mode adds: *The line is the class, not the operation. The same question flips from decidable to undecidable when a regular language becomes context-free.*

**4:40–4:46** — Equivalence: decidable for regular, undecidable for context-free.

> Caption: Equivalence of two context-free grammars is undecidable; equivalence of two regular expressions is decidable.

Exam-trap caption mode adds: *This pair is asked directly. Answer by class first, then by question.*

**4:46–4:52** — One reduction, three answers.

> Caption: Every one of these results is a PCP reduction wearing different clothes.

Exam-trap caption mode adds: *If a question asks why a CFL problem is undecidable, the acceptable answer names a reduction. A search that failed is not an answer.*

## Scene 10. The boundary: one letter makes it decidable

*4:52 – 5:24 · objective: Run the three-line decider for a one-letter alphabet and see exactly which condition it turns on.*

**4:52–4:58** — One letter, and everything is a length.

> Caption: Now the counterexample to the theorem's hypothesis: an alphabet with one letter.

Exam-trap caption mode adds: *This is the counterexample that makes the hypothesis load-bearing. Without it the theorem would be false, not merely imprecise.*

**4:58–5:04** — Only the differences matter.

> Caption: Each domino has a difference: top length minus bottom length. A match needs differences that sum to zero.

Exam-trap caption mode adds: *This simplification is special to one letter. With two letters, two different strings of the same length are not comparable, and the prefix test is real work.*

**5:04–5:10** — Zero wins; one sign loses.

> Caption: Three cases decide it. A zero difference wins at once; all differences the same sign loses at once.

Exam-trap caption mode adds: *The zero case is easy to miss, and it is the case the second example on this page turns on.*

**5:10–5:16** — Copies of each cancel exactly.

> Caption: Otherwise one domino is positive and one is negative, and a fixed number of copies of each cancels exactly.

Exam-trap caption mode adds: *The construction needs both signs present. With one sign present the sum never returns to zero, whatever the multiplicities.*

**5:16–5:20** — The decider agrees with brute force.

> Caption: The model runs this decider on three instances and agrees with a brute-force search on all three.

Exam-trap caption mode adds: *Agreement on three instances is a check of the implementation, not a proof of the decider. The proof is the three-case argument above.*

**5:20–5:24** — Two letters are enough to be hard.

> Caption: So the undecidability theorem is about two letters, and the encoding into two letters is why that is enough.

Exam-trap caption mode adds: *Do not state the result as 'PCP is undecidable' without the alphabet. The unary case is a counterexample, not an exception to be ignored.*

## Scene 11. The four slips that cost marks

*5:24 – 5:52 · objective: Separate 'undecidable' from 'no solution', 'not found' from 'not there', and PCP from Rice.*

**5:24–5:30** — Finding nothing proves nothing.

> Caption: First slip: 'the search found no match, so there is none'.

Exam-trap caption mode adds: *Write the bound into the sentence. 'No match of length at most k' is a true statement; 'no match' is not.*

**5:30–5:36** — Undecidable is about algorithms, not instances.

> Caption: Second slip: 'undecidable' taken to mean 'this instance has no solution'.

Exam-trap caption mode adds: *A decidable problem can have hard instances, and an undecidable problem can have easy ones. The words are about the general question.*

**5:36–5:42** — Checking is easy; deciding is not.

> Caption: Third slip: confusing checking a given match with deciding whether one exists.

Exam-trap caption mode adds: *If a question hands you a sequence and asks whether it is a match, that question is trivial. Read which question is being asked.*

**5:42–5:46** — Rice is about properties of languages.

> Caption: Fourth slip: reaching for Rice's theorem, which is about properties of languages, not about dominoes.

Exam-trap caption mode adds: *Both are undecidability results. Naming the wrong one costs the marks even when the verdict is right.*

**5:46–5:52** — Bound the claim and name the theorem.

> Caption: Every one of the four is a sentence that is true in one setting and false in the one being asked about.

Exam-trap caption mode adds: *Precision here is not pedantry: the exam is testing exactly this distinction.*

## Scene 12. One object, four consequences

*5:52 – 6:12 · objective: Consolidate the definition, the invariant, the theorem and the one alphabet where it fails.*

**5:52–5:57** — Pairs, an ordering, two equal rows.

> Caption: An instance is a finite set of pairs. A match is an ordering whose two rows read the same string.

**5:57–6:03** — One prefix of the other, always.

> Caption: One row is always a prefix of the other. That is the only pruning, and it makes the search a tree.

**6:03–6:06** — Undecidable over two letters, and three consequences.

> Caption: Over two letters or more the problem is undecidable, and every CFL decision result follows from it.

**6:06–6:12** — One letter decides, and that is the counterexample.

> Caption: Over one letter it is decidable in three cases, and that is the counterexample the hypothesis needs.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
