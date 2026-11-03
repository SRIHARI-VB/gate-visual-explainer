/* ==========================================================================
   parser-error-detection-and-recovery — THE timeline.
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
      id: 'detect', n: 1,
      title: 'The parser finds out at a blank cell',
      start: 0, end: 30,
      objective: 'Say exactly where an error is discovered — an ACTION table entry that does not exist — and that the GOTO table can never discover one.'
    },
    {
      id: 'viable', n: 2,
      title: 'A prefix is viable, or it is the error',
      start: 30, end: 60,
      objective: 'Define a viable prefix, see that every parse configuration has one on the stack, and see the error as the first token that destroys it.'
    },
    {
      id: 'reductions', n: 3,
      title: 'A reduction is not an error signal',
      start: 60, end: 90,
      objective: 'Separate "reduced before the error" from "reduced wrongly", and count the difference between SLR and canonical LR(1) on the same inputs.'
    },
    {
      id: 'paniclr', n: 4,
      title: 'Panic mode in an LR parser: pop, then discard',
      start: 90, end: 120,
      objective: 'Run the two-step rule — pop to a state with a GOTO on A, discard to a token that can follow A — and count the pops and discards on two inputs.'
    },
    {
      id: 'loop', n: 5,
      title: 'The rule as written can loop',
      start: 120, end: 150,
      objective: 'Watch panic mode repeat a configuration on id + ) id, add the progress guard, and see what the accepted string really is.'
    },
    {
      id: 'panicll', n: 6,
      title: 'Panic mode in an LL parser: FOLLOW is the sync set',
      start: 150, end: 180,
      objective: 'Use FOLLOW(A) as the synchronising set, decide between popping A and discarding the token, and count both on two inputs.'
    },
    {
      id: 'phrase', n: 7,
      title: 'Phrase-level recovery: ten one-token repairs',
      start: 180, end: 210,
      objective: 'Enumerate every single-token insertion, deletion and replacement at the error point, and find how many of them parse to the end.'
    },
    {
      id: 'errprod', n: 8,
      title: 'Error productions and the error token',
      start: 210, end: 240,
      objective: 'Add error productions to the grammar, measure the states and the conflict they cost, and run the pop-shift-delete recovery.'
    },
    {
      id: 'compare', n: 9,
      title: 'What each strategy costs',
      start: 240, end: 270,
      objective: 'Read one table of four strategies on one string: messages, pops, discarded tokens, and what was finally accepted.'
    },
    {
      id: 'proc', n: 10,
      title: 'The five steps, and the four traps',
      start: 270, end: 300,
      objective: 'Fix the order in which the questions are answered, and the four statements that cost the mark.'
    }
  ],

  events: [
    /* ---------- scene 1 ---------- */
    {
      id: 'd-1', scene: 'detect', start: 0, end: 7.5,
      caption: 'An LR parser looks up one cell: the state on top of the stack, and the token on the input.',
      detail: 'The ACTION table is indexed by state and by terminal. Every step of the parse is one lookup, and the answer is a shift, a reduce, accept, or nothing at all.',
      narration: 'An LR parser looks up one cell: the state on top of the stack, and the token on the input.',
      keyword: 'one cell',
      trap: 'Thinking the parser checks the input against the grammar. It checks a table entry that was built from the grammar.'
    },
    {
      id: 'd-2', scene: 'detect', start: 7.5, end: 15,
      caption: 'A blank cell is the error. The GOTO table is never asked about a token, so it cannot signal one.',
      detail: 'GOTO is indexed by state and by nonterminal, and it is consulted only after a reduction has already been chosen. An error is therefore always an ACTION entry, never a GOTO entry.',
      narration: 'A blank cell is the error. The GOTO table is never asked about a token.',
      keyword: 'blank cell',
      trap: 'Writing "error in the GOTO table" in an answer. The goto table has no terminal columns at all.'
    },
    {
      id: 'd-3', scene: 'detect', start: 15, end: 22.5,
      caption: 'On id + ) id the SLR parser stops at the third token, the ")", in state 7, with stack 0 3 7.',
      detail: 'State 7 holds E -> E + . T and the items that expect an operand: F -> . ( E ), F -> . id. There is no column for ")" in that state, so the lookup returns nothing and the parse stops with two tokens consumed.',
      narration: 'On id plus close-bracket id, the SLR parser stops at the third token, in state 7.',
      keyword: 'state 7',
      trap: 'Assuming the error is at the end of the input. It is at the first token for which the state has no entry.'
    },
    {
      id: 'd-4', scene: 'detect', start: 22.5, end: 30,
      caption: 'Three reductions came first — F -> id, T -> F, E -> T — and none of them was wrong.',
      detail: 'A reduction is a decision the table licensed. On this input the first three were the correct ones for the prefix id + . The error is not that they happened; it is that nothing in state 7 accepts the next token.',
      narration: 'Three reductions came first, and none of them was wrong.',
      keyword: 'none of them was wrong',
      trap: 'Reading "several reductions before the error" as "the parser went wrong earlier". The reductions were right.'
    },

    /* ---------- scene 2 ---------- */
    {
      id: 'v-1', scene: 'viable', start: 30, end: 37.5,
      caption: 'A prefix is viable when some valid sentence of the grammar begins with exactly that string.',
      detail: 'Not "is a prefix of a sentence" in the loose sense: the string must be a prefix of a right sentential form, a string reachable from the start symbol by a rightmost derivation. The page enumerates 514 of them up to length nine.',
      narration: 'A prefix is viable when some valid sentence of the grammar begins with exactly that string.',
      keyword: 'viable',
      trap: 'Confusing a viable prefix with a prefix of some sentence in the language. The sentential forms may still contain nonterminals.'
    },
    {
      id: 'v-2', scene: 'viable', start: 37.5, end: 45,
      caption: 'Every configuration of a correct parse has a viable prefix on its stack: 48 checked, 48 viable.',
      detail: 'The stack holds grammar symbols, not states. Four valid inputs produce 48 configurations between them, and in every one the symbol string on the stack is a prefix of one of the 514 enumerated right sentential forms.',
      narration: 'Every configuration of a correct parse has a viable prefix on its stack. Forty-eight checked, forty-eight viable.',
      keyword: 'viable prefix on its stack',
      trap: 'Believing the stack contains a set of viable prefixes. It contains one string of symbols, and that string is one viable prefix.'
    },
    {
      id: 'v-3', scene: 'viable', start: 45, end: 52.5,
      caption: 'At an error the stack is still viable, and the stack plus the token is not.',
      detail: 'That is the sharp statement of the failure, and it is why the error is detected at the earliest possible token: the parser never shifts a symbol it has not been told to shift, so the stack cannot leave the viable-prefix set.',
      narration: 'At an error the stack is still viable, and the stack plus the token is not.',
      keyword: 'stack plus the token',
      trap: 'Saying the parser "guessed wrong". It guessed nothing; it asked the table and got no answer.'
    },
    {
      id: 'v-4', scene: 'viable', start: 52.5, end: 60,
      caption: 'Across 777 erroneous strings, all 777 times the stack was viable and stack plus token was not.',
      detail: 'The check runs every string of length at most four over the five terminals, keeps the 777 the grammar rejects, and confirms both halves of the statement at the configuration where each parse stopped.',
      narration: 'Across seven hundred and seventy-seven erroneous strings, the stack was viable every time and stack plus token was not.',
      keyword: '777',
      trap: 'Assuming this guarantees a good message. Early detection is not the same as a useful diagnosis.'
    },

    /* ---------- scene 3 ---------- */
    {
      id: 'r-1', scene: 'reductions', start: 60, end: 67.5,
      caption: 'A reduction is not an error signal. The parser reduces only when its table says so.',
      detail: 'The question is not whether reductions happened before the error, but whether the table was entitled to ask for them. A shift, by contrast, is never taken on a token the table rejected.',
      narration: 'A reduction is not an error signal. The parser reduces only when its table says so.',
      keyword: 'not an error signal',
      trap: 'Quoting "a canonical LR(1) parser makes no reduction before announcing an error" as if it were true in general. The page measures 218 such reductions.'
    },
    {
      id: 'r-2', scene: 'reductions', start: 67.5, end: 75,
      caption: 'SLR writes reduces into every column of FOLLOW, which is grammar-wide, so it reduces on lookaheads it has not earned.',
      detail: 'FOLLOW is computed once from the whole grammar. A state that completes E -> T reduces on every terminal that can follow E anywhere, including positions this state can never be followed by. Those extra reductions are legal steps towards a dead end.',
      narration: 'SLR reduces on every terminal that can follow the head anywhere in the grammar.',
      keyword: 'grammar-wide',
      trap: 'Thinking a wider lookahead set is safer. It is exactly what costs the extra work.'
    },
    {
      id: 'r-3', scene: 'reductions', start: 75, end: 82.5,
      caption: 'Before giving up on the 777 erroneous strings, SLR took 344 reductions and canonical LR(1) took 218.',
      detail: 'Both parsers reject exactly the same strings — they agree on all 780 — and both stop at the same token. The difference is entirely in how much work they do on the way to the same verdict.',
      narration: 'Before giving up, SLR took three hundred and forty-four reductions and canonical LR(1) took two hundred and eighteen.',
      keyword: '344 and 218',
      trap: 'Concluding that canonical LR(1) detects errors earlier. It detects them at the same token, with less work.'
    },
    {
      id: 'r-4', scene: 'reductions', start: 82.5, end: 90,
      caption: 'On ( id, SLR reduces three times before the error; canonical LR(1) reduces none.',
      detail: 'After the open bracket and the identifier, SLR reduces F -> id, T -> F and E -> T before it consults the table on the end marker and finds nothing. Canonical LR(1) has already recorded that the end marker cannot follow E inside an unclosed bracket, so its reduce rows are empty there.',
      narration: 'On open-bracket id, SLR reduces three times before the error. Canonical LR(1) reduces none.',
      keyword: 'reduces none',
      trap: 'Assuming every SLR grammar shows this gap. Here the gap is three reductions; on some grammars it is zero.'
    },

    /* ---------- scene 4 ---------- */
    {
      id: 'p-1', scene: 'paniclr', start: 90, end: 97.5,
      caption: 'Panic mode: pop states until one has a GOTO on some nonterminal A, then discard tokens until one can follow A.',
      detail: 'Two moves, both visible in the state stack. The pop throws away the partial phrase that could not be completed; the discard throws away input. Then GOTO(s, A) is pushed as if the phrase had been parsed, and the parse resumes.',
      narration: 'Panic mode pops states until one has a GOTO on a nonterminal, then discards tokens until one can follow it.',
      keyword: 'pop then discard',
      trap: 'Popping past a nonterminal that has already been recognised. That deletes a construct the parser had finished.'
    },
    {
      id: 'p-2', scene: 'paniclr', start: 97.5, end: 105,
      caption: 'On id id the parser pops one state, discards one token, pushes GOTO(0, E) = 3 and carries on to acceptance.',
      detail: 'The stack is 0 2 when the second id arrives. State 2 completes F -> id, and state 0 has a GOTO on E, so the recovery pops one state, skips the offending id, and pushes state 3. The remaining input is empty and the parse accepts.',
      narration: 'On id id the parser pops one state, discards one token, and carries on to acceptance.',
      keyword: 'pops one, discards one',
      trap: 'Believing the discarded token was wrong. It was a second operand, and deleting it changed the program.'
    },
    {
      id: 'p-3', scene: 'paniclr', start: 105, end: 112.5,
      caption: 'On ( ) it pops nothing and discards nothing: GOTO(1, E) = 6 lets the empty parentheses stand for a missing expression.',
      detail: 'State 1 is the state after the open bracket, and it has a GOTO on E. The recovery pushes state 6, the close bracket then shifts, and F -> ( E ) reduces. Nothing was deleted: the missing operand was supplied by the recovery itself.',
      narration: 'On empty parentheses it pops nothing and discards nothing, and the missing expression is supplied by the recovery.',
      keyword: 'supplied by the recovery',
      trap: 'Calling this a correction. It is a substitution: the parser pretends a phrase it never saw.'
    },
    {
      id: 'p-4', scene: 'paniclr', start: 112.5, end: 120,
      caption: 'Two numbers describe every recovery: states popped, and tokens discarded.',
      detail: 'Every run in this lesson is summarised the same way, because those two counts are what an exam question asks for and what a compiler log records. Both are counted from the trace, never estimated.',
      narration: 'Two numbers describe every recovery: states popped and tokens discarded.',
      keyword: 'states popped, tokens discarded',
      trap: 'Forgetting that a pushed GOTO state also adds one entry to the stack, which later reductions have to pop.'
    },

    /* ---------- scene 5 ---------- */
    {
      id: 'l-1', scene: 'loop', start: 120, end: 127.5,
      caption: 'On id + ) id the rule as written does not terminate: it pushes T at state 10, reduces to E, and errors again.',
      detail: 'The close bracket is in FOLLOW(T) and in FOLLOW(E), so the discard step finds a synchronising token immediately and discards nothing. The pushed state leads to a reduction back to E, and the next lookup fails in the same place.',
      narration: 'On id plus close-bracket id the rule as written does not terminate.',
      keyword: 'does not terminate',
      trap: 'Assuming the textbook rule is safe as written. It is safe when the synchronising token is ahead of the error, not when it is the error.'
    },
    {
      id: 'l-2', scene: 'loop', start: 127.5, end: 135,
      caption: 'The stack and the token come back to where they were, so the same recovery is chosen forever.',
      detail: 'The configuration after the second recovery is state 3 with the same token at the same position. Nothing has been consumed and nothing has been popped net, so the algorithm is in a cycle of length two.',
      narration: 'The stack and the token come back to where they were, so the same recovery is chosen forever.',
      keyword: 'cycle of length two',
      trap: 'Blaming the implementation. The cycle is in the rule, and every real parser adds a guard to it.'
    },
    {
      id: 'l-3', scene: 'loop', start: 135, end: 142.5,
      caption: 'The guard: if the same stack and position recur, delete the token. One forced deletion breaks the cycle.',
      detail: 'The page keeps the set of configurations at which a recovery has already been attempted. A repeat is proof that the last recovery made no progress, so the only move that can make progress is to consume one token. On this input that is the close bracket.',
      narration: 'If the same stack and position recur, delete the token. One forced deletion breaks the cycle.',
      keyword: 'forced deletion',
      trap: 'Thinking the guard is an optimisation. Without it the parser hangs, which is worse than any message.'
    },
    {
      id: 'l-4', scene: 'loop', start: 142.5, end: 150,
      caption: 'The parser then accepts — but it accepts id + with the ")" and the operand deleted, not the program you wrote.',
      detail: 'Four error reports, one forced deletion and one discard of the identifier leave the input empty after id +, and the parse accepts. The accepted string is a repair. Nothing in the parser says the original program was valid.',
      narration: 'It accepts a repaired string, not the program you wrote.',
      keyword: 'a repaired string',
      trap: 'Reporting "parsed successfully" as if the program were valid. Acceptance after recovery means the repair parsed.'
    },

    /* ---------- scene 6 ---------- */
    {
      id: 'q-1', scene: 'panicll', start: 150, end: 157.5,
      caption: 'In an LL parser the synchronising set for a nonterminal A is FOLLOW(A).',
      detail: 'The table entry M[A, a] is blank, so the parser knows only that A cannot start with a. If a can follow A, the cheapest explanation is that A should have been empty; if it cannot, the token itself is the intruder.',
      narration: 'In an LL parser the synchronising set for a nonterminal is FOLLOW of that nonterminal.',
      keyword: 'FOLLOW(A)',
      trap: 'Using FIRST(A) as the synchronising set. FIRST says how to restart A, not where to resume after it.'
    },
    {
      id: 'q-2', scene: 'panicll', start: 157.5, end: 165,
      caption: 'If the token is in FOLLOW(A), pop A and continue. If it is not, discard the token and try again.',
      detail: 'Popping A is a decision that A derives the empty string. Discarding is a decision that the token does not belong. Both are guesses, and the page counts them separately: pops and discards.',
      narration: 'If the token can follow A, pop A. If it cannot, discard the token.',
      keyword: 'pop or discard',
      trap: 'Doing both at once. A pop that also discards hides one of the two errors.'
    },
    {
      id: 'q-3', scene: 'panicll', start: 165, end: 172.5,
      caption: 'On b b c: one error, one token discarded, and the parse finishes. On b b b: three errors, two discards, one pop.',
      detail: 'The grammar is S -> A B C with A -> a | empty, B -> b | empty and C -> c, so FOLLOW(A) is {b, c} and FOLLOW(B) is {c}. In b b c the second b is an intruder; in b b b the parse needs one pop and two discards to finish.',
      narration: 'On b b c one token is discarded. On b b b there are three errors, two discards and one pop.',
      keyword: 'one pop, two discards',
      trap: 'Expecting one error per bad token. One bad token can produce several reports as the parser tries each nonterminal.'
    },
    {
      id: 'q-4', scene: 'panicll', start: 172.5, end: 180,
      caption: 'FOLLOW is a property of the grammar, so the set can accept a token that cannot occur at this point.',
      detail: 'This is the immediate error detection problem: a nullable nonterminal is predicted empty on any token in its FOLLOW, and FOLLOW is context-free, so the prediction can be right for the grammar and wrong for the position. The parser then has to undo work instead of stopping.',
      narration: 'FOLLOW belongs to the grammar, so the set can accept a token that cannot occur here.',
      keyword: 'cannot occur here',
      trap: 'Reading FOLLOW as "the tokens allowed here". It is "the tokens allowed after this nonterminal somewhere".'
    },

    /* ---------- scene 7 ---------- */
    {
      id: 'f-1', scene: 'phrase', start: 180, end: 187.5,
      caption: 'Phrase-level recovery changes the input instead of skipping it: insert, delete or replace one token.',
      detail: 'Instead of throwing tokens away until something fits, the parser asks which one-token change would let the parse continue, and applies the cheapest one it can justify.',
      narration: 'Phrase-level recovery changes the input instead of skipping it: insert, delete or replace one token.',
      keyword: 'insert, delete, replace',
      trap: 'Assuming the change is safe. The parser is editing your program on a guess.'
    },
    {
      id: 'f-2', scene: 'phrase', start: 187.5, end: 195,
      caption: 'For five terminals that is ten candidates at the error point: one deletion, five insertions, four replacements.',
      detail: 'One deletion of the offending token, one insertion for each of the five terminals, and one replacement for each terminal other than the token itself. With n terminals the count is 1 + n + (n - 1) = 2n.',
      narration: 'Five terminals give ten candidates: one deletion, five insertions and four replacements.',
      keyword: 'ten candidates',
      trap: 'Forgetting that inserting a terminal before the token is a different repair from replacing the token by it.'
    },
    {
      id: 'f-3', scene: 'phrase', start: 195, end: 202.5,
      caption: 'On id + ) id exactly one of the ten repairs parses to the end: delete the ")".',
      detail: 'Deleting the close bracket leaves id + id, which is a sentence of the grammar. Every other candidate either stops earlier or stops later without accepting, and the page records where each one stopped.',
      narration: 'Exactly one of the ten repairs parses to the end: delete the close bracket.',
      keyword: 'one of the ten',
      trap: 'Choosing by how far the parser got. Reaching further is not the same as accepting.'
    },
    {
      id: 'f-4', scene: 'phrase', start: 202.5, end: 210,
      caption: 'The repair that reaches furthest is replace ")" by "(", which still fails — so reach and acceptance are different tests.',
      detail: 'The replaced input id + ( id gets four tokens deep before stopping, deeper than the deletion that accepts. A rule that picks the furthest-reaching repair picks the wrong one here, which is why implementations combine a reach measure with a cost measure.',
      narration: 'The repair that reaches furthest still fails, so reach and acceptance are different tests.',
      keyword: 'reach is not acceptance',
      trap: 'Treating "furthest parse" as the standard rule. It is one heuristic, and this input defeats it.'
    },

    /* ---------- scene 8 ---------- */
    {
      id: 'e-1', scene: 'errprod', start: 210, end: 217.5,
      caption: 'An error production puts the mistake in the grammar: F -> ( error ) and E -> error.',
      detail: 'error is a terminal that never appears in a real program. A production containing it can only be used by the recovery procedure, which replaces the offending token with error and lets the ordinary parser carry on.',
      narration: 'An error production puts the mistake in the grammar itself, using a terminal called error.',
      keyword: 'error production',
      trap: 'Expecting the parser to detect the error from the error production. The production is used after detection, to recover.'
    },
    {
      id: 'e-2', scene: 'errprod', start: 217.5, end: 225,
      caption: 'That costs three states — 12 to 15 — and one new conflict: state 7 must choose between shifting ")" and reducing E -> error.',
      detail: 'The two productions add items wherever E and an open bracket are expected. State 7 is reached after reading ( error, and it holds both F -> ( error . ) and E -> error . , so the close bracket can either finish the phrase or reduce the error away.',
      narration: 'It costs three states and one new conflict, on the close bracket in state 7.',
      keyword: 'three states, one conflict',
      trap: 'Assuming error productions are free. They change the automaton and can introduce conflicts that were not there.'
    },
    {
      id: 'e-3', scene: 'errprod', start: 225, end: 232.5,
      caption: 'Recovery with the error token: pop until error can be shifted, shift it, then delete offending tokens while in error mode.',
      detail: 'That is the procedure a parser generator implements. Popping reaches a state that expects the nonterminal the error production belongs to; shifting error enters the production; deleting while in error mode suppresses the flood of messages one bad statement would otherwise cause.',
      narration: 'Pop until error can be shifted, shift it, then delete offending tokens while in error mode.',
      keyword: 'error mode',
      trap: 'Leaving error mode immediately. Without a shift count the parser reports every token of the bad statement separately.'
    },
    {
      id: 'e-4', scene: 'errprod', start: 232.5, end: 240,
      caption: 'On id + ) id that is one report, two pops and two silent deletions — and an error at the end of input cannot be repaired this way.',
      detail: 'After the two deletions the parse accepts. On ( id the error is at the end marker instead: there is no token left to delete, and the error productions offer no way to insert one, so recovery reports and stops.',
      narration: 'One report, two pops and two silent deletions. An error at the end of input cannot be repaired by deleting.',
      keyword: 'end of input',
      trap: 'Forgetting the end-of-input case. Deletion-based recovery has nothing to delete when the missing token is the one after the last one.'
    },

    /* ---------- scene 9 ---------- */
    {
      id: 'c-1', scene: 'compare', start: 240, end: 247.5,
      caption: 'Four strategies on one string: no recovery, panic mode, phrase-level repair, error productions.',
      detail: 'The same input id + ) id, the same table, four recovery procedures. The page runs all four and reports the same three quantities for each: error reports, states popped, tokens discarded or changed.',
      narration: 'Four strategies on one string: no recovery, panic mode, phrase-level repair, and error productions.',
      keyword: 'four strategies',
      trap: 'Comparing strategies on different inputs. The comparison is only meaningful when the table and the string are fixed.'
    },
    {
      id: 'c-2', scene: 'compare', start: 247.5, end: 255,
      caption: 'No recovery reports once and stops; panic mode reports four times and accepts a repaired string.',
      detail: 'Stopping is honest and useless for finding the second error. Panic mode keeps going, reports at every attempt, and accepts something that is not the original program.',
      narration: 'No recovery reports once and stops. Panic mode reports four times and accepts a repaired string.',
      keyword: 'reports four times',
      trap: 'Preferring the strategy with the fewest messages. Fewer messages can mean less of the program was examined.'
    },
    {
      id: 'c-3', scene: 'compare', start: 255, end: 262.5,
      caption: 'Phrase-level tries ten repairs and finds one; error productions report once and delete two tokens without a message.',
      detail: 'The error production is the quietest: one report, then silence while the bad phrase is deleted. The phrase-level repair is the most expensive: ten parses of candidate inputs for one error.',
      narration: 'Phrase-level tries ten repairs and finds one. Error productions report once and delete two tokens silently.',
      keyword: 'quietest',
      trap: 'Reading silence as success. The deleted tokens were never checked for further errors.'
    },
    {
      id: 'c-4', scene: 'compare', start: 262.5, end: 270,
      caption: 'Every strategy accepts something. Only one of them accepts the program you wrote, and that is none of them.',
      detail: 'Acceptance after recovery means the repaired input parsed. The original string is still rejected by the table, and no recovery procedure changes that.',
      narration: 'Every strategy accepts something. None of them accepts the program you wrote.',
      keyword: 'none of them',
      trap: 'Concluding that recovery makes the parser accept invalid programs. It makes the parser continue; the verdict is separate.'
    },

    /* ---------- scene 10 ---------- */
    {
      id: 'x-1', scene: 'proc', start: 270, end: 277.5,
      caption: 'Five steps: find the blank cell, name the token, choose the recovery, guard against looping, and report.',
      detail: 'The order matters because each step uses the previous one. The state and the token give the message; the recovery choice is a table or a policy; the guard is what makes the procedure terminate.',
      narration: 'Five steps: find the blank cell, name the token, choose the recovery, guard against looping, and report.',
      keyword: 'five steps',
      trap: 'Jumping to the recovery before naming the state and the token. Without them the message is useless.'
    },
    {
      id: 'x-2', scene: 'proc', start: 277.5, end: 285,
      caption: 'The four traps: calling a reduction an error, trusting panic mode to terminate, reading recovery as acceptance, and forgetting end of input.',
      detail: 'Each one is measured on this page. Reductions before an error: 218 for canonical LR(1). A panic recovery that repeats a configuration: id + ) id. An acceptance that is a repair: id + . An error that cannot be deleted away: the end marker.',
      narration: 'The four traps: a reduction is not an error, panic mode may not terminate, recovery is not acceptance, and the end of input cannot be deleted.',
      keyword: 'four traps',
      trap: 'Memorising the traps without the numbers that expose them.'
    },
    {
      id: 'x-3', scene: 'proc', start: 285, end: 292.5,
      caption: 'The exam asks which action happens, in what order, and how many tokens move.',
      detail: 'Three question shapes cover almost every item: identify the detection point, order the recovery steps, and count the pops and discards. All three are answerable from the table and the trace, without remembering a particular textbook example.',
      narration: 'The exam asks which action happens, in what order, and how many tokens move.',
      keyword: 'which action, in what order, how many',
      trap: 'Answering from a remembered example rather than from the table in front of you.'
    },
    {
      id: 'x-4', scene: 'proc', start: 292.5, end: 300,
      caption: 'Keep the two counts — states popped, tokens discarded — and the rest follows.',
      detail: 'Every strategy in this lesson is a rule for changing those two numbers. Panic mode changes them by popping and discarding, phrase-level by changing the input, error productions by shifting a terminal that is not in the program.',
      narration: 'Keep the two counts, states popped and tokens discarded, and the rest follows.',
      keyword: 'two counts',
      trap: 'Treating the strategies as four unrelated recipes. They differ only in which of the two counts they are allowed to change.'
    }
  ]
};
