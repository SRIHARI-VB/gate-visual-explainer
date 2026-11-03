# Canonical Lr1 Items And Lalr Merging — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/canonical-lr1-items-and-lalr-merging/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. SLR reduces on a grammar-wide answer

*0:00 – 0:30 · objective: See that FOLLOW(A) is a property of the grammar rather than of the state, and find the state where that costs a conflict.*

**0:00–0:07** — SLR writes a reduce into every column of FOLLOW of the production head.

> Caption: SLR writes a reduce into every column of FOLLOW of the production head.

Exam-trap caption mode adds: *Reading FOLLOW(A) as if it were a property of the state. It is a property of the grammar.*

**0:07–0:15** — So two states that finish the same production get the same reduce row.

> Caption: So two states that finish the same production get the same reduce row.

Exam-trap caption mode adds: *Assuming a wider lookahead set is safer. A wider set puts more actions into cells that may already hold a shift.*

**0:15–0:22** — On the assignment grammar, the state after reading L breaks it.

> Caption: On S -> L = R | R, L -> * R | id, R -> L the state after L breaks it.

Exam-trap caption mode adds: *Thinking the two items must be about the same thing. They are about the same prefix and different futures.*

**0:22–0:30** — One cell, a shift and a reduce. SLR conflicts here and LALR does not.

> Caption: One cell, a shift and a reduce: SLR conflicts, and LALR does not.

Exam-trap caption mode adds: *Calling the grammar ambiguous. It is unambiguous; only the coarse lookahead is wrong.*

## Scene 2. The item grows a second field

*0:30 – 1:00 · objective: Read an LR(1) item as a production with a dot plus one terminal, and say exactly what that terminal records.*

**0:30–0:37** — An LR(1) item is a production with a dot, plus one terminal.

> Caption: An LR(1) item is a production with a dot, plus one terminal.

Exam-trap caption mode adds: *Reading the terminal as part of the right-hand side. It is not a symbol of the production.*

**0:37–0:45** — The lookahead says which terminal may follow the whole right-hand side.

> Caption: The lookahead says which terminal may follow the whole right-hand side.

Exam-trap caption mode adds: *Confusing the lookahead with the next symbol on the stack. It is the next input terminal, after the reduction.*

**0:45–0:52** — Erase the lookahead and what is left is the core.

> Caption: Erase the lookahead and what is left is the core.

Exam-trap caption mode adds: *Thinking two items with the same core are the same item. They are distinct until they are merged.*

**0:52–1:00** — State I3 holds six items over three cores; state I0 holds six over four.

> Caption: State I3 of S -> C C holds 6 items over 3 cores; I0 holds 6 over 4.

Exam-trap caption mode adds: *Counting items when the question asks for states. Merging is by core.*

## Scene 3. Closure carries the lookahead forward

*1:00 – 1:30 · objective: Apply the closure rule with FIRST(beta a) on the grammar S -> C C, and see six items where LR(0) has three.*

**1:00–1:07** — Closure adds the productions of B, and gives each one a lookahead from FIRST of beta a.

> Caption: Closure: for A -> alpha . B beta with lookahead a, add B productions.

Exam-trap caption mode adds: *Giving the new items the same lookahead a. The lookahead is FIRST of what comes after B, and only falls back to a when that can vanish.*

**1:07–1:15** — On S to C C, the first C is followed by C, so its lookahead is FIRST of C.

> Caption: On S -> C C the kernel gives S -> . C C with lookahead $, so FIRST(C $) = {c, d}.

Exam-trap caption mode adds: *Writing the end marker into every closure item. It belongs to the item whose beta is empty.*

**1:15–1:22** — Six items where LR(0) has three: each C production appears once per possible lookahead.

> Caption: The same kernel produces six items, where the LR(0) closure produces three.

Exam-trap caption mode adds: *Thinking the extra items are redundant. They differ in exactly the field the reduce rule reads.*

**1:22–1:30** — In state I2 the second C is followed by the end marker, so the lookahead is $ alone.

> Caption: In state I2 the second C is followed by the end marker, so there the lookahead is $.

Exam-trap caption mode adds: *Assuming a nonterminal always has the same lookahead. It has whatever this state allows.*

## Scene 4. GOTO, and ten states instead of seven

*1:30 – 2:00 · objective: Build the canonical collection for S -> C C and find the three pairs of states that differ only in lookahead.*

**1:30–1:37** — GOTO moves the dot over one symbol and closes again.

> Caption: GOTO moves the dot over one symbol and closes again.

Exam-trap caption mode adds: *Forgetting the closure after the move. GOTO without closure is not a state.*

**1:37–1:45** — Ten states for canonical LR(1), seven for LR(0), on the same grammar.

> Caption: On S -> C C the collection has 10 states; LR(0) has 7 on the same grammar.

Exam-trap caption mode adds: *Believing canonical LR(1) sees more of the grammar. It sees the same grammar with a finer partition.*

**1:45–1:52** — Three pairs of states hold the same items and differ only in lookahead.

> Caption: I3 and I6 hold the same items and differ only in lookahead.

Exam-trap caption mode adds: *Treating the pairs as an accident of this grammar. Every LR(0) state is a core, and cores can repeat.*

**1:52–2:00** — The ten-state table accepts exactly the language, on all 63 strings of length at most five.

> Caption: The table built from these ten states accepts exactly the language of the grammar.

Exam-trap caption mode adds: *Checking a table on one sentence. One accepted string says nothing about the rejected ones.*

## Scene 5. The reduce rule is local

*2:00 – 2:30 · objective: Place a reduce only in the lookahead column, and see the LR(1) row as a subset of the SLR row.*

**2:00–2:07** — A completed item writes a reduce in its lookahead column, and nowhere else.

> Caption: A completed item writes a reduce in its lookahead column, and nowhere else.

Exam-trap caption mode adds: *Writing the reduce into every column of FOLLOW out of habit. That is the SLR rule, not this one.*

**2:07–2:15** — So the LR(1) reduce row is always a subset of the SLR row.

> Caption: So the LR(1) reduce row is always a subset of the SLR row.

Exam-trap caption mode adds: *Believing the two rules can disagree in either direction. The local set is never wider.*

**2:15–2:22** — Of the twenty-seven completed items here, exactly one is strictly narrower than FOLLOW.

> Caption: Of the 27 completed items here, exactly one has a lookahead set strictly inside FOLLOW.

Exam-trap caption mode adds: *Concluding that the local rule is a small improvement. It is small and it is decisive, because that is where conflicts live.*

**2:22–2:30** — The extra terminal is the whole conflict, and the state cannot be followed by it.

> Caption: The extra terminal is the whole conflict: the state cannot be followed by it.

Exam-trap caption mode adds: *Reading the conflict as a sign of ambiguity. It is a sign that the lookahead set was too coarse.*

## Scene 6. LALR: merge the states that share a core

*2:30 – 3:00 · objective: Merge by core, union the lookaheads, and see why the LALR state count is always the LR(0) count.*

**2:30–2:37** — LALR merges states with equal cores and unions their lookaheads.

> Caption: LALR merges states with equal cores and unions their lookaheads.

Exam-trap caption mode adds: *Unioning lookaheads across different items. Only the same production-and-dot pairs are merged.*

**2:37–2:45** — Three merges take ten states down to seven.

> Caption: On S -> C C three merges take 10 states down to 7.

Exam-trap caption mode adds: *Expecting the merged count to be a compromise. It is exactly the LR(0) count.*

**2:45–2:52** — Here the union is exactly FOLLOW of C, so no cell gains a second action.

> Caption: Here the union is exactly FOLLOW of C, so no cell gains a second action.

Exam-trap caption mode adds: *Assuming every merge is free. The next scene is a grammar where it is not.*

**2:52–3:00** — The LALR count is the LR(0) count, always, because every core is one state.

> Caption: The LALR count is the LR(0) count, always: every core is one state.

Exam-trap caption mode adds: *The commonest wrong option on this topic: that LALR has more states than SLR.*

## Scene 7. The merge that costs a language

*3:00 – 3:30 · objective: Watch two disjoint lookahead sets become one conflicting cell, and count the strings the merged parser loses.*

**3:00–3:07** — This grammar generates four strings, and the canonical table for it is clean.

> Caption: This grammar generates four strings: acd, bcd, ace and bce.

Exam-trap caption mode adds: *Judging a grammar by its size. Six productions are enough to separate the two classes.*

**3:07–3:15** — After ac the state says B on e and A on d; after bc the two are swapped.

> Caption: After ac the state says B on e and A on d; after bc the two are swapped.

Exam-trap caption mode adds: *Seeing two states with the same items and assuming they are the same state. The lookahead is the difference.*

**3:15–3:22** — Merged, both lookaheads become d and e, so each of them calls two reductions.

> Caption: Merged, both lookaheads become d and e, so d and e each call two reductions.

Exam-trap caption mode adds: *Looking for a shift/reduce conflict. Merging cannot create one; this is reduce/reduce.*

**3:22–3:30** — Resolved to the earlier production, the merged parser keeps two of the four strings.

> Caption: Resolved in favour of the earlier production, the merged parser keeps 2 of the 4 strings.

Exam-trap caption mode adds: *Thinking the merged parser is merely less efficient. It rejects strings of the language.*

## Scene 8. What a merge can and cannot create

*3:30 – 4:00 · objective: Prove that merging preserves shift/reduce conflicts exactly, show that reduce/reduce is different, and find a conflict that no merge caused.*

**3:30–3:37** — A merge cannot create a shift/reduce conflict.

> Caption: A merge cannot create a shift/reduce conflict.

Exam-trap caption mode adds: *Assuming any merge can produce any conflict. The two kinds behave differently.*

**3:37–3:45** — A member that also holds the completed item was already in conflict, so the merge adds nothing.

> Caption: A member that also holds the completed item was already in conflict.

Exam-trap caption mode adds: *Forgetting that the shift side is core-determined while the reduce side is not.*

**3:45–3:52** — Reduce/reduce is different, because two members can complete different items.

> Caption: Reduce/reduce is different: two members can hold different completed items.

Exam-trap caption mode adds: *Treating reduce/reduce as the harmless kind. It is the only kind merging can create.*

**3:52–4:00** — S to A or B with both producing a conflicts in LR(1) itself, with no merges at all.

> Caption: S -> A | B with A -> a and B -> a conflicts in LR(1) itself: 5 states, no merges.

Exam-trap caption mode adds: *Blaming LALR for every reduce/reduce conflict. Some grammars are simply not LR(1).*

## Scene 9. The four rungs, counted

*4:00 – 4:30 · objective: Read the state counts and conflict kinds for six grammars off one table, and name a witness for each strict step of the ladder.*

**4:00–4:07** — Six grammars, four automata each, all built and counted on load.

> Caption: Six grammars, four automata each: the page builds and counts all of them.

Exam-trap caption mode adds: *Memorising a state count from a textbook. The question usually changes the grammar.*

**4:07–4:15** — SLR and LALR always tie, and canonical LR(1) never has fewer states.

> Caption: SLR and LALR always tie; canonical LR(1) never has fewer states.

Exam-trap caption mode adds: *Reading a larger state count as more parsing power in the wrong direction.*

**4:15–4:22** — The assignment grammar witnesses SLR below LALR: one conflict for SLR and none for LALR.

> Caption: GC is the witness for SLR below LALR: one shift/reduce for SLR, none for LALR.

Exam-trap caption mode adds: *Assuming a grammar that is not SLR must be LALR. It may be neither.*

**4:22–4:30** — GB witnesses LALR below LR(1), and two grammars fail at LR(1) itself.

> Caption: GB witnesses LALR below LR(1); GE and GF fail at LR(1) itself.

Exam-trap caption mode adds: *Believing every unambiguous grammar is LR(1). None of these four classes contains all of them.*

## Scene 10. The decision procedure, and the four traps

*4:30 – 5:00 · objective: Fix the five-step order that answers "is this grammar LALR(1)?", and the four slips that cost the mark.*

**4:30–4:37** — Five steps: the grammar, FIRST, the LR(0) automaton, the canonical items, and the merge.

> Caption: Five steps: grammar, FIRST, LR(0) automaton, canonical items, merge.

Exam-trap caption mode adds: *Merging before the canonical items exist. There is nothing to union yet.*

**4:37–4:45** — If the canonical table already conflicts, stop: the grammar is not LR(1).

> Caption: If the canonical table already conflicts, stop: the grammar is not LR(1).

Exam-trap caption mode adds: *Continuing to merge in the hope that the conflict disappears. The union only adds actions.*

**4:45–4:52** — On the GATE 2005 grammar, six SLR states, ten canonical and six LALR.

> Caption: GATE 2005: S -> ( S ) | a gives 6 SLR, 10 canonical and 6 LALR states.

Exam-trap caption mode adds: *Answering from a remembered pattern without checking that the grammar is the one in the question.*

**4:52–5:00** — Four traps: the counts tie, merging cannot create shift/reduce, LR(1) can conflict, and counts are not power.

> Caption: Four traps: counts tie, no new shift/reduce, LR(1) can conflict, counts are not power.

Exam-trap caption mode adds: *Choosing the option that sounds strongest rather than the one the table proves.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
