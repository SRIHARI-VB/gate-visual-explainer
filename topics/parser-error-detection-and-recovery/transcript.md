# Error Detection and Recovery in Parsers: the Blank Cell, Panic Mode, Phrase-Level Repair and Error Productions — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/parser-error-detection-and-recovery/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. The parser finds out at a blank cell

*0:00 – 0:30 · objective: Say exactly where an error is discovered — an ACTION table entry that does not exist — and that the GOTO table can never discover one.*

**0:00–0:07** — An LR parser looks up one cell: the state on top of the stack, and the token on the input.

> Caption: An LR parser looks up one cell: the state on top of the stack, and the token on the input.

Exam-trap caption mode adds: *Thinking the parser checks the input against the grammar. It checks a table entry that was built from the grammar.*

**0:07–0:15** — A blank cell is the error. The GOTO table is never asked about a token.

> Caption: A blank cell is the error. The GOTO table is never asked about a token, so it cannot signal one.

Exam-trap caption mode adds: *Writing "error in the GOTO table" in an answer. The goto table has no terminal columns at all.*

**0:15–0:22** — On id plus close-bracket id, the SLR parser stops at the third token, in state 7.

> Caption: On id + ) id the SLR parser stops at the third token, the ")", in state 7, with stack 0 3 7.

Exam-trap caption mode adds: *Assuming the error is at the end of the input. It is at the first token for which the state has no entry.*

**0:22–0:30** — Three reductions came first, and none of them was wrong.

> Caption: Three reductions came first — F -> id, T -> F, E -> T — and none of them was wrong.

Exam-trap caption mode adds: *Reading "several reductions before the error" as "the parser went wrong earlier". The reductions were right.*

## Scene 2. A prefix is viable, or it is the error

*0:30 – 1:00 · objective: Define a viable prefix, see that every parse configuration has one on the stack, and see the error as the first token that destroys it.*

**0:30–0:37** — A prefix is viable when some valid sentence of the grammar begins with exactly that string.

> Caption: A prefix is viable when some valid sentence of the grammar begins with exactly that string.

Exam-trap caption mode adds: *Confusing a viable prefix with a prefix of some sentence in the language. The sentential forms may still contain nonterminals.*

**0:37–0:45** — Every configuration of a correct parse has a viable prefix on its stack. Forty-eight checked, forty-eight viable.

> Caption: Every configuration of a correct parse has a viable prefix on its stack: 48 checked, 48 viable.

Exam-trap caption mode adds: *Believing the stack contains a set of viable prefixes. It contains one string of symbols, and that string is one viable prefix.*

**0:45–0:52** — At an error the stack is still viable, and the stack plus the token is not.

> Caption: At an error the stack is still viable, and the stack plus the token is not.

Exam-trap caption mode adds: *Saying the parser "guessed wrong". It guessed nothing; it asked the table and got no answer.*

**0:52–1:00** — Across seven hundred and seventy-seven erroneous strings, the stack was viable every time and stack plus token was not.

> Caption: Across 777 erroneous strings, all 777 times the stack was viable and stack plus token was not.

Exam-trap caption mode adds: *Assuming this guarantees a good message. Early detection is not the same as a useful diagnosis.*

## Scene 3. A reduction is not an error signal

*1:00 – 1:30 · objective: Separate "reduced before the error" from "reduced wrongly", and count the difference between SLR and canonical LR(1) on the same inputs.*

**1:00–1:07** — A reduction is not an error signal. The parser reduces only when its table says so.

> Caption: A reduction is not an error signal. The parser reduces only when its table says so.

Exam-trap caption mode adds: *Quoting "a canonical LR(1) parser makes no reduction before announcing an error" as if it were true in general. The page measures 218 such reductions.*

**1:07–1:15** — SLR reduces on every terminal that can follow the head anywhere in the grammar.

> Caption: SLR writes reduces into every column of FOLLOW, which is grammar-wide, so it reduces on lookaheads it has not earned.

Exam-trap caption mode adds: *Thinking a wider lookahead set is safer. It is exactly what costs the extra work.*

**1:15–1:22** — Before giving up, SLR took three hundred and forty-four reductions and canonical LR(1) took two hundred and eighteen.

> Caption: Before giving up on the 777 erroneous strings, SLR took 344 reductions and canonical LR(1) took 218.

Exam-trap caption mode adds: *Concluding that canonical LR(1) detects errors earlier. It detects them at the same token, with less work.*

**1:22–1:30** — On open-bracket id, SLR reduces three times before the error. Canonical LR(1) reduces none.

> Caption: On ( id, SLR reduces three times before the error; canonical LR(1) reduces none.

Exam-trap caption mode adds: *Assuming every SLR grammar shows this gap. Here the gap is three reductions; on some grammars it is zero.*

## Scene 4. Panic mode in an LR parser: pop, then discard

*1:30 – 2:00 · objective: Run the two-step rule — pop to a state with a GOTO on A, discard to a token that can follow A — and count the pops and discards on two inputs.*

**1:30–1:37** — Panic mode pops states until one has a GOTO on a nonterminal, then discards tokens until one can follow it.

> Caption: Panic mode: pop states until one has a GOTO on some nonterminal A, then discard tokens until one can follow A.

Exam-trap caption mode adds: *Popping past a nonterminal that has already been recognised. That deletes a construct the parser had finished.*

**1:37–1:45** — On id id the parser pops one state, discards one token, and carries on to acceptance.

> Caption: On id id the parser pops one state, discards one token, pushes GOTO(0, E) = 3 and carries on to acceptance.

Exam-trap caption mode adds: *Believing the discarded token was wrong. It was a second operand, and deleting it changed the program.*

**1:45–1:52** — On empty parentheses it pops nothing and discards nothing, and the missing expression is supplied by the recovery.

> Caption: On ( ) it pops nothing and discards nothing: GOTO(1, E) = 6 lets the empty parentheses stand for a missing expression.

Exam-trap caption mode adds: *Calling this a correction. It is a substitution: the parser pretends a phrase it never saw.*

**1:52–2:00** — Two numbers describe every recovery: states popped and tokens discarded.

> Caption: Two numbers describe every recovery: states popped, and tokens discarded.

Exam-trap caption mode adds: *Forgetting that a pushed GOTO state also adds one entry to the stack, which later reductions have to pop.*

## Scene 5. The rule as written can loop

*2:00 – 2:30 · objective: Watch panic mode repeat a configuration on id + ) id, add the progress guard, and see what the accepted string really is.*

**2:00–2:07** — On id plus close-bracket id the rule as written does not terminate.

> Caption: On id + ) id the rule as written does not terminate: it pushes T at state 10, reduces to E, and errors again.

Exam-trap caption mode adds: *Assuming the textbook rule is safe as written. It is safe when the synchronising token is ahead of the error, not when it is the error.*

**2:07–2:15** — The stack and the token come back to where they were, so the same recovery is chosen forever.

> Caption: The stack and the token come back to where they were, so the same recovery is chosen forever.

Exam-trap caption mode adds: *Blaming the implementation. The cycle is in the rule, and every real parser adds a guard to it.*

**2:15–2:22** — If the same stack and position recur, delete the token. One forced deletion breaks the cycle.

> Caption: The guard: if the same stack and position recur, delete the token. One forced deletion breaks the cycle.

Exam-trap caption mode adds: *Thinking the guard is an optimisation. Without it the parser hangs, which is worse than any message.*

**2:22–2:30** — It accepts a repaired string, not the program you wrote.

> Caption: The parser then accepts — but it accepts id + with the ")" and the operand deleted, not the program you wrote.

Exam-trap caption mode adds: *Reporting "parsed successfully" as if the program were valid. Acceptance after recovery means the repair parsed.*

## Scene 6. Panic mode in an LL parser: FOLLOW is the sync set

*2:30 – 3:00 · objective: Use FOLLOW(A) as the synchronising set, decide between popping A and discarding the token, and count both on two inputs.*

**2:30–2:37** — In an LL parser the synchronising set for a nonterminal is FOLLOW of that nonterminal.

> Caption: In an LL parser the synchronising set for a nonterminal A is FOLLOW(A).

Exam-trap caption mode adds: *Using FIRST(A) as the synchronising set. FIRST says how to restart A, not where to resume after it.*

**2:37–2:45** — If the token can follow A, pop A. If it cannot, discard the token.

> Caption: If the token is in FOLLOW(A), pop A and continue. If it is not, discard the token and try again.

Exam-trap caption mode adds: *Doing both at once. A pop that also discards hides one of the two errors.*

**2:45–2:52** — On b b c one token is discarded. On b b b there are three errors, two discards and one pop.

> Caption: On b b c: one error, one token discarded, and the parse finishes. On b b b: three errors, two discards, one pop.

Exam-trap caption mode adds: *Expecting one error per bad token. One bad token can produce several reports as the parser tries each nonterminal.*

**2:52–3:00** — FOLLOW belongs to the grammar, so the set can accept a token that cannot occur here.

> Caption: FOLLOW is a property of the grammar, so the set can accept a token that cannot occur at this point.

Exam-trap caption mode adds: *Reading FOLLOW as "the tokens allowed here". It is "the tokens allowed after this nonterminal somewhere".*

## Scene 7. Phrase-level recovery: ten one-token repairs

*3:00 – 3:30 · objective: Enumerate every single-token insertion, deletion and replacement at the error point, and find how many of them parse to the end.*

**3:00–3:07** — Phrase-level recovery changes the input instead of skipping it: insert, delete or replace one token.

> Caption: Phrase-level recovery changes the input instead of skipping it: insert, delete or replace one token.

Exam-trap caption mode adds: *Assuming the change is safe. The parser is editing your program on a guess.*

**3:07–3:15** — Five terminals give ten candidates: one deletion, five insertions and four replacements.

> Caption: For five terminals that is ten candidates at the error point: one deletion, five insertions, four replacements.

Exam-trap caption mode adds: *Forgetting that inserting a terminal before the token is a different repair from replacing the token by it.*

**3:15–3:22** — Exactly one of the ten repairs parses to the end: delete the close bracket.

> Caption: On id + ) id exactly one of the ten repairs parses to the end: delete the ")".

Exam-trap caption mode adds: *Choosing by how far the parser got. Reaching further is not the same as accepting.*

**3:22–3:30** — The repair that reaches furthest still fails, so reach and acceptance are different tests.

> Caption: The repair that reaches furthest is replace ")" by "(", which still fails — so reach and acceptance are different tests.

Exam-trap caption mode adds: *Treating "furthest parse" as the standard rule. It is one heuristic, and this input defeats it.*

## Scene 8. Error productions and the error token

*3:30 – 4:00 · objective: Add error productions to the grammar, measure the states and the conflict they cost, and run the pop-shift-delete recovery.*

**3:30–3:37** — An error production puts the mistake in the grammar itself, using a terminal called error.

> Caption: An error production puts the mistake in the grammar: F -> ( error ) and E -> error.

Exam-trap caption mode adds: *Expecting the parser to detect the error from the error production. The production is used after detection, to recover.*

**3:37–3:45** — It costs three states and one new conflict, on the close bracket in state 7.

> Caption: That costs three states — 12 to 15 — and one new conflict: state 7 must choose between shifting ")" and reducing E -> error.

Exam-trap caption mode adds: *Assuming error productions are free. They change the automaton and can introduce conflicts that were not there.*

**3:45–3:52** — Pop until error can be shifted, shift it, then delete offending tokens while in error mode.

> Caption: Recovery with the error token: pop until error can be shifted, shift it, then delete offending tokens while in error mode.

Exam-trap caption mode adds: *Leaving error mode immediately. Without a shift count the parser reports every token of the bad statement separately.*

**3:52–4:00** — One report, two pops and two silent deletions. An error at the end of input cannot be repaired by deleting.

> Caption: On id + ) id that is one report, two pops and two silent deletions — and an error at the end of input cannot be repaired this way.

Exam-trap caption mode adds: *Forgetting the end-of-input case. Deletion-based recovery has nothing to delete when the missing token is the one after the last one.*

## Scene 9. What each strategy costs

*4:00 – 4:30 · objective: Read one table of four strategies on one string: messages, pops, discarded tokens, and what was finally accepted.*

**4:00–4:07** — Four strategies on one string: no recovery, panic mode, phrase-level repair, and error productions.

> Caption: Four strategies on one string: no recovery, panic mode, phrase-level repair, error productions.

Exam-trap caption mode adds: *Comparing strategies on different inputs. The comparison is only meaningful when the table and the string are fixed.*

**4:07–4:15** — No recovery reports once and stops. Panic mode reports four times and accepts a repaired string.

> Caption: No recovery reports once and stops; panic mode reports four times and accepts a repaired string.

Exam-trap caption mode adds: *Preferring the strategy with the fewest messages. Fewer messages can mean less of the program was examined.*

**4:15–4:22** — Phrase-level tries ten repairs and finds one. Error productions report once and delete two tokens silently.

> Caption: Phrase-level tries ten repairs and finds one; error productions report once and delete two tokens without a message.

Exam-trap caption mode adds: *Reading silence as success. The deleted tokens were never checked for further errors.*

**4:22–4:30** — Every strategy accepts something. None of them accepts the program you wrote.

> Caption: Every strategy accepts something. Only one of them accepts the program you wrote, and that is none of them.

Exam-trap caption mode adds: *Concluding that recovery makes the parser accept invalid programs. It makes the parser continue; the verdict is separate.*

## Scene 10. The five steps, and the four traps

*4:30 – 5:00 · objective: Fix the order in which the questions are answered, and the four statements that cost the mark.*

**4:30–4:37** — Five steps: find the blank cell, name the token, choose the recovery, guard against looping, and report.

> Caption: Five steps: find the blank cell, name the token, choose the recovery, guard against looping, and report.

Exam-trap caption mode adds: *Jumping to the recovery before naming the state and the token. Without them the message is useless.*

**4:37–4:45** — The four traps: a reduction is not an error, panic mode may not terminate, recovery is not acceptance, and the end of input cannot be deleted.

> Caption: The four traps: calling a reduction an error, trusting panic mode to terminate, reading recovery as acceptance, and forgetting end of input.

Exam-trap caption mode adds: *Memorising the traps without the numbers that expose them.*

**4:45–4:52** — The exam asks which action happens, in what order, and how many tokens move.

> Caption: The exam asks which action happens, in what order, and how many tokens move.

Exam-trap caption mode adds: *Answering from a remembered example rather than from the table in front of you.*

**4:52–5:00** — Keep the two counts, states popped and tokens discarded, and the rest follows.

> Caption: Keep the two counts — states popped, tokens discarded — and the rest follows.

Exam-trap caption mode adds: *Treating the strategies as four unrelated recipes. They differ only in which of the two counts they are allowed to change.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
