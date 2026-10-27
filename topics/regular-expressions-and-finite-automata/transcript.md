# Regular Expressions And Finite Automata — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/regular-expressions-and-finite-automata/index.html`
- Total duration: 5:20 (320 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A language is a set of strings

*0:00 – 0:32 · objective: Read a language as a set of strings and a machine as a yes-or-no answer for each one, then name the five parts of a deterministic machine.*

**0:00–0:08** — A language is just a set of strings. A machine is a yes-or-no answer for every string.

> Caption: A language is just a set of strings. A machine is a yes-or-no answer for every string.

Exam-trap caption mode adds: *Believing a language must be infinite, or must come from a rule. The empty set is a language, and so is the single string 0101. A machine that says no to everything accepts the empty language, and that is a perfectly good machine.*

**0:08–0:16** — Five parts make a deterministic machine: states, alphabet, transition rule, start state, accepting states.

> Caption: Five parts make a deterministic machine: states, alphabet, transition rule, start state, accepting states.

Exam-trap caption mode adds: *Leaving an arrow out and calling the machine deterministic. A missing arrow is a gap, not a rejection. The usual repair is to add one dead state that loops to itself, which is exactly what the four-state machine for "does not contain 111" does.*

**0:16–0:24** — The state is the only memory the machine has. After a prefix it knows nothing else.

> Caption: The state is the only memory the machine has. After a prefix it knows nothing else.

Exam-trap caption mode adds: *Assuming the machine can compare two halves of a string. It cannot: by the time the second half arrives, the first half has been compressed into one state, and there are only finitely many states.*

**0:24–0:32** — So every question here reduces to one: how much must the machine remember, and in how few states?

> Caption: So every question in this topic reduces to one: how much must the machine remember, and in how few states?

Exam-trap caption mode adds: *Designing a machine by drawing arrows until it feels right. Start from the list of distinctions the language forces, and the arrows follow.*

## Scene 2. Five parts and one walk

*0:32 – 1:04 · objective: Run a deterministic machine on a concrete string, and see that the state after a prefix is the only memory the machine has.*

**0:32–0:40** — Delta takes a state and one symbol and gives exactly one state. Single-valued is what deterministic means.

> Caption: Delta takes a state and one symbol and gives exactly one state. Single-valued is what deterministic means.

Exam-trap caption mode adds: *Confusing deterministic with complete. A machine can be deterministic and still be missing an arrow, in which case the run simply dies. GATE papers usually assume a complete machine, so add the dead state explicitly rather than relying on the omission.*

**0:40–0:48** — The extended function folds a whole string one symbol at a time, starting from the start state.

> Caption: The extended function folds a whole string one symbol at a time, starting from the start state.

Exam-trap caption mode adds: *Reading the string right to left. Automata read left to right, and a language that looks regular one way may not be regular the other. Reversal is a separate theorem, not a convention.*

**0:48–0:56** — Reading 0011 through the four-state machine ends in the accepting state, so 0011 is in the language.

> Caption: Reading 0011 through the four-state machine ends in the accepting state, so 0011 is in the language.

Exam-trap caption mode adds: *Reading the four states as "how many 1s I have seen". They are lengths of a matched prefix, not counts. The same picture serves both only when the pattern happens to be a run of one symbol.*

**0:56–1:04** — Change one arrow and the language changes. The machine is the language, written out.

> Caption: Change one arrow and the language changes. The machine is the language, written out.

Exam-trap caption mode adds: *Treating "contains" and "ends with" as the same question. They cost the same number of states here, which is exactly why the difference is easy to miss and worth a question.*

## Scene 3. Nondeterminism is a set of live states

*1:04 – 1:36 · objective: Treat an NFA run as a set of states rather than one state, and fold in the epsilon-closure so that epsilon arrows cost nothing.*

**1:04–1:12** — A nondeterministic machine may have zero, one or many arrows for the same state and the same symbol.

> Caption: A nondeterministic machine may have zero, one or many arrows for the same state and the same symbol.

Exam-trap caption mode adds: *Thinking an NFA guesses and is therefore more powerful. It has exactly the same power: every NFA has an equivalent DFA. Nondeterminism buys shorter descriptions, not more languages.*

**1:12–1:20** — Run it and you do not have a state; you have a set of states that are all still possible.

> Caption: Run it and you do not have a state; you have a set of states that are all still possible.

Exam-trap caption mode adds: *Tracking only the "best" branch. There is no best branch: the machine accepts if any branch accepts, so discarding a branch can turn an accept into a reject.*

**1:20–1:28** — An epsilon arrow reads nothing and costs nothing. The epsilon-closure adds every state reachable by epsilon alone.

> Caption: An epsilon arrow reads nothing and costs nothing. The epsilon-closure adds every state reachable by epsilon alone.

Exam-trap caption mode adds: *Forgetting to close the start set. A machine whose start state has an epsilon arrow begins in the closure of the start state, not in the start state alone, and every later step must be closed too.*

**1:28–1:36** — The machine accepts if any one live state is accepting. One lucky guess is enough.

> Caption: The machine accepts if any one live state is accepting. One lucky guess is enough.

Exam-trap caption mode adds: *Requiring every branch to accept. That is the rule for the universal reading, which is a different machine. An NFA says yes if one path says yes.*

## Scene 4. One DFA state per set of NFA states

*1:36 – 2:08 · objective: Build the equivalent DFA by subset construction, count the reachable sets, and read the 2-to-the-n bound as an upper limit rather than a law.*

**1:36–1:44** — The subset construction makes one DFA state out of each reachable set of NFA states.

> Caption: The subset construction makes one DFA state out of each reachable set of NFA states.

Exam-trap caption mode adds: *Building all 2-to-the-n subsets. Only reachable sets become states, and in practice the reachable count is far smaller than the bound.*

**1:44–1:52** — This NFA has four states, so sixteen subsets exist, but only four are reachable.

> Caption: This NFA has four states, so sixteen subsets exist, but only four are reachable.

Exam-trap caption mode adds: *Reporting 2-to-the-n as the answer to "how many states does the DFA have". It is the worst case, and a question that asks for the actual number wants the reachable count.*

**1:52–2:00** — So an n-state NFA becomes a DFA of at most 2 to the n states. That is an upper bound.

> Caption: So an n-state NFA becomes a DFA of at most 2 to the n states. That is an upper bound.

Exam-trap caption mode adds: *Reading the bound as a lower bound and concluding k is at least n. That is false, and the next beat gives the counterexample.*

**2:00–2:08** — The bound is an upper limit, not a floor: a four-state NFA can have a one-state minimal DFA.

> Caption: The bound is an upper limit, not a floor: a four-state NFA can have a one-state minimal DFA.

Exam-trap caption mode adds: *Assuming a minimal DFA is never smaller than the NFA it came from. It usually is smaller, and it can be smaller by an unbounded factor.*

## Scene 5. Counting the states you cannot avoid

*2:08 – 2:40 · objective: Use distinguishability by suffix to justify a state count, and apply it to the three suffix patterns that dominate previous-year papers.*

**2:08–2:16** — Two strings are distinguishable if some suffix puts one in the language and the other out.

> Caption: Two strings are distinguishable if some suffix puts one in the language and the other out.

Exam-trap caption mode adds: *Proving a machine is minimal by failing to see a merge. A picture that looks irreducible is not a proof; either exhibit a distinguishing suffix for every pair, or run table filling.*

**2:16–2:24** — A DFA state is a class of strings no suffix can separate, so the count is forced, not chosen.

> Caption: A DFA state is a class of strings no suffix can separate, so the count is forced, not chosen.

Exam-trap caption mode adds: *Counting states by counting the conditions in the English sentence. Conditions can overlap or imply one another, and then the count is smaller than the sentence suggests.*

**2:24–2:32** — "Ends with 10" needs three states: nothing yet, a 1 seen, a 10 seen.

> Caption: "Ends with 10" needs three states: nothing yet, a 1 seen, a 10 seen.

Exam-trap caption mode adds: *Adding a fourth state for the empty string. The empty string behaves exactly like "last symbol is not 1", so it joins that class rather than needing its own.*

**2:32–2:40** — "Does not contain 111" needs four: run length 0, 1, 2, and one dead state.

> Caption: "Does not contain 111" needs four: run length 0, 1, 2, and one dead state.

Exam-trap caption mode adds: *Answering 3 by forgetting the dead state. Without it the machine is incomplete, and completing it adds exactly one more state.*

## Scene 6. Merging what no string can separate

*2:40 – 3:12 · objective: Run table filling on a seven-state machine, read the merge classes off the table, and check the quotient against the original by brute force.*

**2:40–2:48** — Write the last two symbols into the state and you get seven: empty, a, b, aa, ab, ba, bb.

> Caption: Write the last two symbols into the state and you get seven: empty, a, b, aa, ab, ba, bb.

Exam-trap caption mode adds: *Stopping at the first machine that works. A correct machine is not a minimal machine, and previous-year papers almost always ask for the minimum.*

**2:48–2:56** — Mark pairs that differ on acceptance, then propagate: if a pair leads to a marked pair, mark it.

> Caption: Mark pairs that differ on acceptance, then propagate: if a pair leads to a marked pair, mark it.

Exam-trap caption mode adds: *Merging states that are equivalent but unreachable, or forgetting to drop unreachable states first. Remove unreachable states before you fill the table, or the count will be too high.*

**2:56–3:04** — Three states collapse into one and two into another, so seven becomes four.

> Caption: Three states collapse into one and two into another, so seven becomes four.

Exam-trap caption mode adds: *Assuming the answer is seven because the obvious machine had seven states. The quotient machine is checked here against the original on every string up to length nine.*

**3:04–3:12** — GATE 2017 Set 1 asked exactly this: the smallest machine for (a+b)*b(a+b) has four states.

> Caption: GATE 2017 Set 1 asked exactly this: the smallest machine for (a+b)*b(a+b) has four states.

Exam-trap caption mode adds: *Reading the expression as "contains b". The last group (a+b) is exactly one symbol, which is what forces the second-to-last condition and the four states.*

## Scene 7. Counters multiply; the answer is the lcm

*3:12 – 3:44 · objective: Build a machine that counts one symbol modulo m, take the product with a count modulo n, and explain why the size is the least common multiple.*

**3:12–3:20** — To count the symbol a modulo 2 you need two states; modulo 3 you need three.

> Caption: To count the symbol a modulo 2 you need two states; modulo 3 you need three.

Exam-trap caption mode adds: *Building a chain of states for each occurrence instead of a cycle. A chain of n states accepts only up to n; a cycle of m states accepts every multiple of m, forever.*

**3:20–3:28** — To do both at once you need the pairs, so the size is the least common multiple, which is six.

> Caption: To do both at once you need the pairs, so the size is the least common multiple, which is six.

Exam-trap caption mode adds: *Multiplying without checking whether the two conditions interact. When one condition implies the other, the product collapses, and the answer is the smaller count.*

**3:28–3:36** — Divisible by 2 but not by 3 is the same six states with only two of them accepting.

> Caption: Divisible by 2 but not by 3 is the same six states with only two of them accepting.

Exam-trap caption mode adds: *Marking residue 0 as accepting. Zero is divisible by 2 and also by 3, so it is excluded by the "but not" clause. That single mark is the difference between the right answer and a wrong one.*

**3:36–3:44** — A product modulo 7 also needs six, because the six nonzero residues form a closed group.

> Caption: A product modulo 7 also needs six, because the six nonzero residues form a closed group.

Exam-trap caption mode adds: *Assuming the answer is 7 because the modulus is 7. The residue 0 is unreachable, because a product of nonzero residues is never divisible by 7. The modulus minus one is the count.*

## Scene 8. Regular expressions and the Thompson construction

*3:44 – 4:16 · objective: Read a regular expression as three operations, then build an epsilon-NFA from it by Thompson's rule and count the states that construction produces.*

**3:44–3:52** — A regular expression is built from three operations: union, concatenation and star.

> Caption: A regular expression is built from three operations: union, concatenation and star.

Exam-trap caption mode adds: *Treating plus as an optional character rather than a choice between whole expressions. The plus binds loosest, so a + bc means a or bc, never (a+b)c.*

**3:52–4:00** — Union branches, concatenation joins, star loops back. Every operation is a picture.

> Caption: Union branches, concatenation joins, star loops back. Every operation is a picture.

Exam-trap caption mode adds: *Drawing star as a loop on the fragment itself. Without the bypass arrow the expression would mean one or more, not zero or more, and the empty string would be lost.*

**4:00–4:08** — Thompson gives each operation its own two-state wrapper and joins the fragments with epsilon arrows.

> Caption: Thompson gives each operation its own two-state wrapper and joins the fragments with epsilon arrows.

Exam-trap caption mode adds: *Expecting the construction to give a small machine. Thompson's output is usually far from minimal, and the next step after building it is always minimisation.*

**4:08–4:16** — For (a|b)*abb the count is fourteen states, and the machine accepts exactly the strings ending abb.

> Caption: For (a|b)*abb the count is 2+2+2+2+6, which is 14 states, and the machine accepts exactly the strings ending abb.

Exam-trap caption mode adds: *Confusing the two directions. The construction takes an expression to a machine; recovering an expression from a machine is state elimination, a different procedure with a different cost.*

## Scene 9. From a picture to an expression, and what closure buys

*4:16 – 4:48 · objective: Recover a regular expression by state elimination, and use the product and complement constructions to decide membership of combined languages.*

**4:16–4:24** — State elimination deletes one state at a time and rewrites the arcs that survive.

> Caption: State elimination deletes one state at a time and rewrites the arcs that survive.

Exam-trap caption mode adds: *Deleting a state without adding the self-loop term. The loop on k is what makes the middle piece "any number of times", and dropping it silently loses repetitions.*

**4:24–4:32** — Delete the odd state of a two-state machine and the answer is (0 + 10*1)*.

> Caption: Delete the odd state of a two-state machine and the answer is (0 + 10*1)*.

Exam-trap caption mode adds: *Forgetting that the answer must be starred. The machine accepts the empty string because its start state accepts, and only the star produces the empty string here.*

**4:32–4:40** — Union and intersection come from running the two machines side by side and reading both answers.

> Caption: Union and intersection come from running the two machines side by side and reading both answers.

Exam-trap caption mode adds: *Trying to build the union by gluing the two start states with an epsilon arrow and calling it deterministic. That is a valid NFA, not a DFA, and its state count is not the product.*

**4:40–4:48** — Complement flips the accepting marks, so a k-state minimal machine gives a complement of at most k states.

> Caption: Complement flips the accepting marks, so a k-state minimal machine gives a complement of at most k states.

Exam-trap caption mode adds: *Complementing an NFA by flipping its accepting states. That gives a different language entirely. Complement only works directly on a deterministic, complete machine.*

## Scene 10. Why a finite machine cannot count

*4:48 – 5:20 · objective: Derive the pumping lemma from the pigeonhole principle, use it to refute a-to-the-n b-to-the-n, and leave with the four-step procedure and the traps.*

**4:48–4:56** — With p states, the p+1 prefixes of a long string must share a state. That is a pigeonhole.

> Caption: With p states, the p+1 prefixes of a long string must share a state. That is a pigeonhole.

Exam-trap caption mode adds: *Forgetting that y must be non-empty. If the two positions could coincide the argument would prove nothing, which is why the split is taken between distinct prefix lengths.*

**4:56–5:04** — Repeating y keeps the string in the language, because the machine returns to the same state.

> Caption: Repeating y keeps the string in the language, because the machine returns to the same state.

Exam-trap caption mode adds: *Using the lemma to prove a language regular. The lemma is necessary, not sufficient: some non-regular languages satisfy it. It can only ever refute.*

**5:04–5:12** — For a to the n b to the n, repeating y breaks the balance, so the language is not regular.

> Caption: For a to the n b to the n, repeating y breaks the balance, so the language is not regular.

Exam-trap caption mode adds: *Choosing a string that can be pumped. A proof that fails on one badly chosen string proves nothing; you must show that every legal split fails, as this one does.*

**5:12–5:20** — The recipe: assume a pumping length, choose a string, split it three ways, and name the contradiction.

> Caption: The recipe: assume a pumping length, choose a string, split it three ways, and name the contradiction.

Exam-trap caption mode adds: *Memorising the five traps without the reason for each. Every one of them is attached to a specific previous-year question, and the reason is what transfers to a new question.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
