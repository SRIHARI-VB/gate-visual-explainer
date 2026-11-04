/* ==========================================================================
   linear-bounded-automata — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   captions.vtt, captions.srt and transcript.md are derived from this file by
   tools/gen-captions.mjs — never edited by hand.

   Every number quoted in a caption is computed by the model in lesson.js, and
   the model checks assert that the figure a caption states is the figure the
   computation produced.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'gap',
      n: 1,
      title: 'The rung with no name',
      start: 0, end: 30,
      objective: 'Place the context-sensitive class in the six-rung hierarchy, between context-free and recursive, and name the automaton that owns it.'
    },
    {
      id: 'def',
      n: 2,
      title: 'One tape, one head, no new cells',
      start: 30, end: 60,
      objective: 'State the linear bounded automaton as a seven-tuple with two endmarkers, and see why a string of n letters leaves exactly n + 2 usable cells.'
    },
    {
      id: 'trace',
      n: 3,
      title: 'Three blocks, three marks: aabbcc in 29 moves',
      start: 60, end: 90,
      objective: 'Watch one deterministic linear bounded automaton decide a to the n b to the n c to the n, and see that every write stays inside the input plus the markers.'
    },
    {
      id: 'bound',
      n: 4,
      title: 'Finite because the space is fixed',
      start: 90, end: 120,
      objective: 'Count the configurations: states times head positions times tape contents. The count is enormous and it is finite, which is the whole decidability argument.'
    },
    {
      id: 'decide',
      n: 5,
      title: 'A run that never ends still decides',
      start: 120, end: 150,
      objective: 'Separate the machine from its decider: a second machine simulates the first for the configuration bound and rejects if acceptance has not happened.'
    },
    {
      id: 'graph',
      n: 6,
      title: 'The graph is small, the bound is huge',
      start: 150, end: 180,
      objective: 'Read acceptance as reachability in the configuration graph, and compare the reachable counts with the counting bound for deterministic and nondeterministic machines.'
    },
    {
      id: 'gram',
      n: 7,
      title: 'The same class from the grammar side',
      start: 180, end: 210,
      objective: 'Generate the same language with a four-rule non-contracting grammar, and check the generated set against an independent membership test.'
    },
    {
      id: 'closure',
      n: 8,
      title: 'Closed under almost everything',
      start: 210, end: 240,
      objective: 'List the six operations that preserve the class, the one that does not, and the open problem that decides nothing at all.'
    },
    {
      id: 'table',
      n: 9,
      title: 'A decidable membership, an undecidable emptiness',
      start: 240, end: 270,
      objective: 'Separate the questions that are decidable about this class from the questions that are not, and contrast them with the context-free row.'
    },
    {
      id: 'exam',
      n: 10,
      title: 'Four question shapes, one open problem',
      start: 270, end: 300,
      objective: 'Reduce every exam question on this class to one of four shapes, and name the one question nobody can answer.'
    }
  ],

  events: [
    /* ---------------- scene 1: the gap ---------------- */
    { id: 'e1', scene: 'gap', start: 0, end: 6,
      caption: 'Six classes stand in one line: regular, deterministic context-free, context-free, context-sensitive, recursive, recursively enumerable.',
      detail: 'The line is strict at every step, which means each class is properly inside the next one. The symbols between the names are subset signs, and the line under a subset sign means proper: the larger class has a language the smaller one does not.',
      narration: 'Six classes stand in one line: regular, deterministic context-free, context-free, context-sensitive, recursive, recursively enumerable.',
      keyword: 'six classes' },

    { id: 'e2', scene: 'gap', start: 6, end: 12,
      caption: 'Three lessons already stopped at context-free. Between context-free and recursive sits one rung, and it has an automaton of its own.',
      detail: 'The regular languages, the deterministic context-free languages and the context-free languages each have a lesson in this repository. The context-sensitive class does not, and it is the only rung between the context-free class and the recursive class.',
      narration: 'Three lessons already stopped at context-free. Between context-free and recursive sits one rung, and it has an automaton of its own.',
      keyword: 'one rung' },

    { id: 'e3', scene: 'gap', start: 12, end: 18,
      caption: 'The automaton is a Turing machine that may not use more tape than the input occupies. It is called a linear bounded automaton.',
      detail: 'A Turing machine has an unbounded tape. Restrict the head to the cells that hold the input plus one marker at each end, and the machine becomes linear bounded. The restriction sounds cosmetic and changes the class of languages completely.',
      narration: 'The automaton is a Turing machine that may not use more tape than the input occupies. It is called a linear bounded automaton.',
      keyword: 'linear bounded automaton' },

    { id: 'e4', scene: 'gap', start: 18, end: 24,
      caption: 'Its languages are exactly the context-sensitive ones, proved by Kuroda in 1964, and every one of them is decidable.',
      detail: 'Kuroda showed that the languages accepted by nondeterministic linear bounded automata are precisely the context-sensitive languages. Landweber had shown in 1963 that the deterministic ones give context-sensitive languages too. Every language in the class is decidable, which is what places the class below recursive rather than beside it.',
      narration: 'Its languages are exactly the context-sensitive ones, proved by Kuroda in 1964, and every one of them is decidable.',
      keyword: 'exactly the context-sensitive ones' },

    { id: 'e5', scene: 'gap', start: 24, end: 30,
      caption: 'This page computes the automaton, the bound that makes it decide, the grammar that matches it, and the decision table that surprises people.',
      detail: 'Four things are computed here and nothing is quoted: a working automaton for a to the n b to the n c to the n, the configuration count for six input lengths, a grammar derivation compared against an independent membership test, and the reachable-configuration counts for a deterministic and a nondeterministic machine.',
      narration: 'This page computes the automaton, the bound that makes it decide, the grammar that matches it, and the decision table that surprises people.',
      keyword: 'computed' },

    /* ---------------- scene 2: definition ---------------- */
    { id: 'e6', scene: 'def', start: 30, end: 36,
      caption: 'A linear bounded automaton is a seven-tuple: states, input alphabet, tape alphabet, transition function, start state, accept state, reject state.',
      detail: 'Seven parts, and the names matter because questions ask about them. The states are the finite control. The input alphabet is the letters of the strings. The tape alphabet is larger: it holds the input letters, the working symbols the machine writes, and the two endmarkers.',
      narration: 'A linear bounded automaton is a seven-tuple: states, input alphabet, tape alphabet, transition function, start state, accept state, reject state.',
      keyword: 'seven-tuple' },

    { id: 'e7', scene: 'def', start: 36, end: 42,
      caption: 'Two symbols of the tape alphabet are endmarkers. No transition may print over them, and no transition may move past them.',
      detail: 'These are the two conditions that make the machine bounded. The left endmarker is written before the first input letter and the right endmarker after the last one. A transition that tried to write over a marker, or to step outside it, is simply not in the transition table.',
      narration: 'Two symbols of the tape alphabet are endmarkers. No transition may print over them, and no transition may move past them.',
      keyword: 'endmarkers' },

    { id: 'e8', scene: 'def', start: 42, end: 48,
      caption: 'So on a string of n letters the tape is exactly n + 2 cells: the input, and one marker at each end. Nothing else exists.',
      detail: 'The tape is finite, and its size is fixed by the input before the machine starts. That single fact is what every result on this page rests on. A Turing machine can always ask for one more cell; a linear bounded automaton cannot.',
      narration: 'So on a string of n letters the tape is exactly n plus 2 cells: the input, and one marker at each end. Nothing else exists.',
      keyword: 'n + 2 cells' },

    { id: 'e9', scene: 'def', start: 48, end: 54,
      caption: 'The machine on this page uses 7 states and 8 tape symbols: a, b, c, three working marks X, Y, Z, and the two endmarkers.',
      detail: 'Seven states, eight tape symbols, and 3 usable letters in the input alphabet. Every count on the page is computed from those three numbers, so a reader who changes them can recompute the whole table.',
      narration: 'The machine on this page uses 7 states and 8 tape symbols: a, b, c, three working marks X, Y, Z, and the two endmarkers.',
      keyword: '7 states and 8 tape symbols' },

    { id: 'e10', scene: 'def', start: 54, end: 60,
      caption: 'Its language is a to the n, b to the n, c to the n: the standard first language that no push-down automaton can accept.',
      detail: 'Three blocks that must all be the same length need three counts held at once. A push-down automaton has one stack, so it cannot. A linear bounded automaton has the whole input in front of it and can cross it as often as it likes, which is why the class is strictly larger.',
      narration: 'Its language is a to the n, b to the n, c to the n: the standard first language that no push-down automaton can accept.',
      keyword: 'a to the n, b to the n, c to the n' },

    /* ---------------- scene 3: the trace ---------------- */
    { id: 'e11', scene: 'trace', start: 60, end: 66,
      caption: 'The machine crosses the tape three times per round. First it marks one a with X and walks right to the first b.',
      detail: 'State q0 skips the X marks already written and turns the first unmarked a into X. State q1 then travels right over the remaining a letters and over the Y marks, and stops on the first unmarked b.',
      narration: 'The machine crosses the tape three times per round. First it marks one a with X and walks right to the first b.',
      keyword: 'marks one a with X' },

    { id: 'e12', scene: 'trace', start: 66, end: 72,
      caption: 'Then it marks that b with Y, walks right to the first c, marks it with Z, and walks all the way back to the left marker.',
      detail: 'State q2 does the second leg and the third. State q3 travels left over everything until it meets the left endmarker, then steps right into q0 and the next round begins. One state is spent purely on travelling back.',
      narration: 'Then it marks that b with Y, walks right to the first c, marks it with Z, and walks all the way back to the left marker.',
      keyword: 'walks all the way back' },

    { id: 'e13', scene: 'trace', start: 72, end: 78,
      caption: 'Two rounds on aabbcc turn the tape into X X Y Y Z Z. The third round finds no a, and only checks that nothing is left unmarked.',
      detail: 'The check is the last state: from the left marker it walks right over the X block, the Y block and the Z block, and accepts only if the right endmarker follows the last Z. If any a, b or c is still unmarked, the walk meets it and rejects.',
      narration: 'Two rounds on aabbcc turn the tape into X X Y Y Z Z. The third round finds no a, and only checks that nothing is left unmarked.',
      keyword: 'nothing is left unmarked' },

    { id: 'e14', scene: 'trace', start: 78, end: 84,
      caption: 'It accepts in 29 moves. On abc it takes 10; on aaabbbccc, 58; on aaaabbbbcccc, 97.',
      detail: 'The move counts are computed by the simulator, not estimated: 10, 29, 58, 97, 146 and 205 for n equal to 1 to 6. Each round costs about 3n moves and there are n rounds, so the total is close to 6n squared, which is the quadratic growth of a crossing machine.',
      narration: 'It accepts in 29 moves. On abc it takes 10; on aaabbbccc, 58; on aaaabbbbcccc, 97.',
      keyword: '29 moves' },

    { id: 'e15', scene: 'trace', start: 84, end: 90,
      caption: 'The head never left the eight cells it started with. Every write was inside the input plus the two markers.',
      detail: 'Eight cells for a six-letter word: six letters and two markers. The simulator checks the head position after every single move, so the claim that the head never leaves is verified rather than asserted.',
      narration: 'The head never left the eight cells it started with. Every write was inside the input plus the two markers.',
      keyword: 'never left' },

    /* ---------------- scene 4: the bound ---------------- */
    { id: 'e16', scene: 'bound', start: 90, end: 96,
      caption: 'A configuration is the state, the tape contents and the head position. Nothing else about the machine can change.',
      detail: 'The transition table is fixed, the tape length is fixed, and the alphabet is finite. So the whole future of the machine is determined by those three pieces of information, which is why a repeated configuration means the machine is in a loop.',
      narration: 'A configuration is the state, the tape contents and the head position. Nothing else about the machine can change.',
      keyword: 'configuration' },

    { id: 'e17', scene: 'bound', start: 96, end: 102,
      caption: 'The count is states times head positions times tape contents: 7 times m + 2, times 8 to the power m.',
      detail: 'Every factor is finite and the product is finite. The two end cells always hold the markers and can never be written over, so only the m middle cells vary, each over 8 symbols. That gives 8 to the power m tape contents, each paired with one of m + 2 head positions and one of 7 states.',
      narration: 'The count is states times head positions times tape contents: 7 times m plus 2, times 8 to the power m.',
      keyword: 'states times head positions times tape contents' },

    { id: 'e18', scene: 'bound', start: 102, end: 108,
      caption: 'An input of 1 letter gives 168 configurations. Four letters, 172,032. Six letters, 14,680,064, which is enormous and still finite.',
      detail: 'The numbers are computed, and the formula is checked by listing every configuration one by one at inputs of 1 and 2 letters: 168 and 1,792, both times exactly what the formula predicts. The growth is exponential in the input length, which is why the bound is never a practical algorithm.',
      narration: 'An input of 1 letter gives 168 configurations. Four letters, 172,032. Six letters, 14,680,064, which is enormous and still finite.',
      keyword: 'still finite' },

    { id: 'e19', scene: 'bound', start: 108, end: 114,
      caption: 'Finite is the whole point. A machine that can only pass through finitely many configurations either accepts, or repeats one and loops forever.',
      detail: 'There is no third option. If the run has not accepted after the whole configuration count plus one moves, two configurations on the run must be equal, and from then on the run repeats the same cycle for ever. So the bound is not a heuristic: it is an exact cut-off.',
      narration: 'Finite is the whole point. A machine that can only pass through finitely many configurations either accepts, or repeats one and loops forever.',
      keyword: 'either accepts, or repeats one' },

    { id: 'e20', scene: 'bound', start: 114, end: 120,
      caption: 'That sentence is the proof that every context-sensitive language is decidable, and it is why this rung sits below recursive.',
      detail: 'Given a linear bounded automaton and a string, simulate for the bound. If it accepts, answer yes; otherwise answer no. The procedure always halts, so the language is decidable. Nothing about the argument is special to this machine: it holds for every one of them.',
      narration: 'That sentence is the proof that every context-sensitive language is decidable, and it is why this rung sits below recursive.',
      keyword: 'every context-sensitive language is decidable' },

    /* ---------------- scene 5: the decider ---------------- */
    { id: 'e21', scene: 'decide', start: 120, end: 126,
      caption: 'Here is a machine that never stops: two states, and a head that walks right then left forever. It repeats its first configuration after 2 moves.',
      detail: 'The two states do nothing but move. From the left cell the machine steps right and changes state; from the right cell it steps left and changes back. The simulator detects the repeat after 2 moves, which is the smallest possible loop on a tape with markers.',
      narration: 'Here is a machine that never stops: two states, and a head that walks right then left forever. It repeats its first configuration after 2 moves.',
      keyword: 'never stops' },

    { id: 'e22', scene: 'decide', start: 126, end: 132,
      caption: 'Simulating it tells you nothing, because the simulation never ends. Counting does.',
      detail: 'A simulator that just follows the moves will follow them for ever. The same machine is still answerable, because the count of configurations gives a cut-off that does not depend on the machine cooperating.',
      narration: 'Simulating it tells you nothing, because the simulation never ends. Counting does.',
      keyword: 'Counting does' },

    { id: 'e23', scene: 'decide', start: 132, end: 138,
      caption: 'Run it for at most 7 times m + 2, times 8 to the power m moves: 168 on a one-letter input. If it has not accepted by then, it never will.',
      detail: 'That is the same count as the previous scene, used as a budget instead of a total. The budget is checked in the model: the cycling machine is run for all 168 moves of the one-letter input and never reaches an accepting configuration.',
      narration: 'Run it for at most 7 times m plus 2, times 8 to the power m moves: 168 on a one-letter input. If it has not accepted by then, it never will.',
      keyword: 'at most' },

    { id: 'e24', scene: 'decide', start: 138, end: 144,
      caption: 'That bound is the decider. It is a different machine that watches the first one, and it always halts with an answer.',
      detail: 'The decider is an ordinary Turing machine with a counter: it copies the input, runs the linear bounded machine on it, counts the moves, and rejects when the counter runs out. The decider needs more than linear space, which is why it is a separate machine and not the same one.',
      narration: 'That bound is the decider. It is a different machine that watches the first one, and it always halts with an answer.',
      keyword: 'the decider' },

    { id: 'e25', scene: 'decide', start: 144, end: 150,
      caption: 'So acceptance for this automaton is decidable. The trap is to conclude that everything about it is.',
      detail: 'Acceptance and membership are decidable. Emptiness, equivalence and finiteness are not, and scene 9 tabulates which is which. The mistake of carrying one decidable question across to the others is the most expensive error in this topic.',
      narration: 'So acceptance for this automaton is decidable. The trap is to conclude that everything about it is.',
      trap: 'decidable membership does not imply decidable emptiness',
      keyword: 'The trap' },

    /* ---------------- scene 6: the graph ---------------- */
    { id: 'e26', scene: 'graph', start: 150, end: 156,
      caption: 'Draw a dot for every configuration and an arrow for every move. Acceptance is reachability of an accepting dot.',
      detail: 'This is the same object the counting bound describes, drawn as a graph. The question does this word reach an accepting configuration becomes: is an accepting dot reachable from the start dot. For a finite graph that question is always answerable.',
      narration: 'Draw a dot for every configuration and an arrow for every move. Acceptance is reachability of an accepting dot.',
      keyword: 'reachability' },

    { id: 'e27', scene: 'graph', start: 156, end: 162,
      caption: 'This machine is deterministic, so its dots form one path: 11 configurations at n = 1, 30 at n = 2, 59 at n = 3, 98 at n = 4.',
      detail: 'Each count is one more than the move count, because a deterministic run never revisits a configuration and the path lists every configuration once, including the start. The search that produced these numbers is a breadth-first walk of the configuration graph.',
      narration: 'This machine is deterministic, so its dots form one path: 11 configurations at n equal to 1, 30 at n equal to 2, 59 at n equal to 3, 98 at n equal to 4.',
      keyword: 'one path' },

    { id: 'e28', scene: 'graph', start: 162, end: 168,
      caption: 'A nondeterministic one branches. A machine that may write a or b over each a reaches 5, 11, 23 and 47 configurations for 1 to 4 letters.',
      detail: 'The branching machine has one state and no working marks: at each a it may leave the letter or overwrite it with b, then move right. Every choice creates a different tape, and every tape is a different configuration.',
      narration: 'A nondeterministic one branches. A machine that may write a or b over each a reaches 5, 11, 23 and 47 configurations for 1 to 4 letters.',
      keyword: 'branches' },

    { id: 'e29', scene: 'graph', start: 168, end: 174,
      caption: 'Those counts are 3 times 2 to the k, minus 1: 2 to the k + 1 minus 1 running configurations, plus 2 to the k accepting ones.',
      detail: 'The running configurations are the tapes reachable after 0 to k letters, which are 1, 2, 4 and so on, summing to 2 to the k plus 1 minus 1. The accepting configurations come from the 2 to the k distinct tapes that reach the right marker. The formula is checked against the computed counts.',
      narration: 'Those counts are 3 times 2 to the k, minus 1: 2 to the k plus 1 minus 1 running configurations, plus 2 to the k accepting ones.',
      keyword: '3 times 2 to the k' },

    { id: 'e30', scene: 'graph', start: 174, end: 180,
      caption: 'Small or large, the set is finite, and that is all the decidability argument needs.',
      detail: 'The reachable set is at most the whole set, and the whole set is at most 7 times n plus 2 times 8 to the power n plus 2. Whether the machine branches or not changes the number, never the finiteness.',
      narration: 'Small or large, the set is finite, and that is all the decidability argument needs.',
      keyword: 'finite' },

    /* ---------------- scene 7: the grammar ---------------- */
    { id: 'e31', scene: 'gram', start: 180, end: 186,
      caption: 'The grammar side is shorter. Four rules: S goes to abc, S goes to a S B c, c B goes to B c, b B goes to b b.',
      detail: 'Two rules grow the string and two rules sort it. The rule c B goes to B c is the one a context-free grammar cannot express, because it has two symbols on the left. It carries each B leftwards past the c letters so the blocks can separate.',
      narration: 'The grammar side is shorter. Four rules: S goes to abc, S goes to a S B c, c B goes to B c, b B goes to b b.',
      keyword: 'Four rules' },

    { id: 'e32', scene: 'gram', start: 186, end: 192,
      caption: 'No rule makes a string shorter, so no sentential form is ever longer than the word it will become. That is a non-contracting grammar.',
      detail: 'The two growing rules add letters and the two sorting rules keep the length. Since nothing contracts, a derivation of a word of length m only ever contains forms of length at most m, which bounds the search and is exactly what a linear bounded automaton needs.',
      narration: 'No rule makes a string shorter, so no sentential form is ever longer than the word it will become. That is a non-contracting grammar.',
      keyword: 'non-contracting' },

    { id: 'e33', scene: 'gram', start: 192, end: 198,
      caption: 'Searching every sentential form up to length 9 finds 17 forms and exactly 3 terminal strings: abc, aabbcc, aaabbbccc.',
      detail: 'The search is exhaustive over every rule applied at every position of every form reached. Seventeen forms is the whole space, and only three of them contain no nonterminal. The four rules are enough to generate every word of the language up to that length.',
      narration: 'Searching every sentential form up to length 9 finds 17 forms and exactly 3 terminal strings: abc, aabbcc, aaabbbccc.',
      keyword: '17 forms' },

    { id: 'e34', scene: 'gram', start: 198, end: 204,
      caption: 'That set equals the language restricted to length 9, computed independently by a membership test on all 29,523 strings.',
      detail: 'The two computations share no code: one derives from the grammar, the other tests each string directly for three equal blocks. All 29,523 strings of length 1 to 9 over three letters are tested, and the two sets agree exactly.',
      narration: 'That set equals the language restricted to length 9, computed independently by a membership test on all 29,523 strings.',
      keyword: '29,523 strings' },

    { id: 'e35', scene: 'gram', start: 204, end: 210,
      caption: 'Non-contracting grammars generate exactly the context-sensitive languages. The automaton and the grammar name the same class.',
      detail: 'A context-sensitive rule keeps the left side no longer than the right, so every context-sensitive grammar is non-contracting, and every non-contracting grammar can be rewritten into the context-sensitive form. Kuroda closed the other half by showing the automata accept exactly these languages.',
      narration: 'Non-contracting grammars generate exactly the context-sensitive languages. The automaton and the grammar name the same class.',
      keyword: 'the same class' },

    /* ---------------- scene 8: closure ---------------- */
    { id: 'e36', scene: 'closure', start: 210, end: 216,
      caption: 'Union, intersection, complement, concatenation, Kleene star, reversal: the class is closed under all six.',
      detail: 'Each closure has a construction. Union and concatenation add a new start symbol, star adds a loop, reversal reverses every rule, intersection uses a product of two machines, and complement is the deep one.',
      narration: 'Union, intersection, complement, concatenation, Kleene star, reversal: the class is closed under all six.',
      keyword: 'all six' },

    { id: 'e37', scene: 'closure', start: 216, end: 222,
      caption: 'Complement is the surprise. Context-free languages are not closed under complement; context-sensitive ones are.',
      detail: 'For context-free languages, intersection fails and complement fails with it, by De Morgan. For context-sensitive languages both hold, and the complement result is not a small construction: it took twenty-four years and a prize-winning theorem.',
      narration: 'Complement is the surprise. Context-free languages are not closed under complement; context-sensitive ones are.',
      trap: 'complement closure is not inherited from the class below',
      keyword: 'Complement is the surprise' },

    { id: 'e38', scene: 'closure', start: 222, end: 228,
      caption: 'That is the second LBA problem, open from 1964 and settled in 1988 by Immerman and Szelepcsényi: nondeterministic space is closed under complement.',
      detail: 'Kuroda posed two problems with his machine. The second asked whether the class is closed under complement, and the Immerman and Szelepcsényi theorem answered yes for every space class from logarithmic upwards. Their proof counts, rather than constructs, the configurations that cannot reach acceptance.',
      narration: 'That is the second LBA problem, open from 1964 and settled in 1988 by Immerman and Szelepcsényi: nondeterministic space is closed under complement.',
      keyword: 'Immerman and Szelepcsényi' },

    { id: 'e39', scene: 'closure', start: 228, end: 234,
      caption: 'Homomorphism is the exception. A homomorphism that erases letters can shrink a word, so it can leave the class; the ones that never erase stay inside.',
      detail: 'Map every letter to the empty string and a non-empty language collapses to a single word, which is regular and still in the class. The failure needs a language where erasing one letter destroys the three-block structure; the standard statement is that the class is closed under epsilon-free homomorphism and inverse homomorphism, and not under homomorphism in general.',
      narration: 'Homomorphism is the exception. A homomorphism that erases letters can shrink a word, so it can leave the class; the ones that never erase stay inside.',
      keyword: 'Homomorphism is the exception' },

    { id: 'e40', scene: 'closure', start: 234, end: 240,
      caption: 'And determinism is still open: nobody knows whether deterministic linear bounded automata accept fewer languages.',
      detail: 'This is the first LBA problem, and it is the only famous collapse question in this hierarchy that is still unresolved. Savitch gives only that the nondeterministic class sits inside quadratic deterministic space, which does not settle linear space.',
      narration: 'And determinism is still open: nobody knows whether deterministic linear bounded automata accept fewer languages.',
      keyword: 'still open' },

    /* ---------------- scene 9: the table ---------------- */
    { id: 'e41', scene: 'table', start: 240, end: 246,
      caption: 'Membership is decidable, but not cheaply: it is complete for polynomial space, so no polynomial-time algorithm is known.',
      detail: 'Deciding whether a word belongs to a given context-sensitive language can be done by the configuration search, which needs space proportional to the number of configurations. The word problem for context-sensitive grammars is complete for polynomial space, and the first known PSPACE-complete problem was the word problem for deterministic context-sensitive grammars. Completeness does not weaken the decidability: the search always ends.',
      narration: 'Membership is decidable, but not cheaply: it is complete for polynomial space, so no polynomial-time algorithm is known.',
      keyword: 'complete for polynomial space' },

    { id: 'e42', scene: 'table', start: 246, end: 252,
      caption: 'Emptiness is not decidable at all. Given a context-sensitive grammar, no algorithm decides whether its language is empty.',
      detail: 'This goes back to Bar-Hillel, Perles and Shamir in 1961. The reduction builds, from a machine and an input, a grammar whose language is empty exactly when the machine halts. Membership being decidable says nothing about it, because membership fixes the language and asks about one word.',
      narration: 'Emptiness is not decidable at all. Given a context-sensitive grammar, no algorithm decides whether its language is empty.',
      trap: 'decidable membership, undecidable emptiness: keep the two questions apart',
      keyword: 'not decidable at all' },

    { id: 'e43', scene: 'table', start: 252, end: 258,
      caption: 'Equivalence, finiteness and universality fail the same way. Complement closure does not rescue any of them.',
      detail: 'Because the class is closed under complement, emptiness and universality are equally hard, so closure under complement makes the two questions equivalent rather than decidable. Equivalence and finiteness are undecidable as well.',
      narration: 'Equivalence, finiteness and universality fail the same way. Complement closure does not rescue any of them.',
      keyword: 'fail the same way' },

    { id: 'e44', scene: 'table', start: 258, end: 264,
      caption: 'Compare the rung below: context-free emptiness is decidable, and equivalence is not. The surprises sit in different places.',
      detail: 'For context-free grammars emptiness is a reachability question on the grammar and is decidable, membership is cubic by the CYK algorithm, and equivalence is undecidable. For context-sensitive grammars emptiness is undecidable and membership is complete for polynomial space. The two rows do not move together.',
      narration: 'Compare the rung below: context-free emptiness is decidable, and equivalence is not. The surprises sit in different places.',
      keyword: 'different places' },

    { id: 'e45', scene: 'table', start: 264, end: 270,
      caption: 'Keep the two questions apart. Is this word in the language is decidable; is this language empty is not.',
      detail: 'A question in this topic is a pair: one object, one question. Fix the grammar and ask about a word, and the answer is computable. Quantify over words, and the answer is not. Writing the pair down before answering prevents almost every error on this row.',
      narration: 'Keep the two questions apart. Is this word in the language is decidable; is this language empty is not.',
      keyword: 'two questions' },

    /* ---------------- scene 10: the exam ---------------- */
    { id: 'e46', scene: 'exam', start: 270, end: 276,
      caption: 'Shape one: place a language in the hierarchy. Count the independent equalities: three need linear space, two need a stack, one needs nothing.',
      detail: 'Three blocks that must match need a tape that can be crossed. Two equalities can be held by one stack, which gives a context-free language. One count, or none, is regular. The test answers the classification questions before any pumping argument is written.',
      narration: 'Shape one: place a language in the hierarchy. Count the independent equalities: three need linear space, two need a stack, one needs nothing.',
      keyword: 'independent equalities' },

    { id: 'e47', scene: 'exam', start: 276, end: 282,
      caption: 'Shape two: is the statement true? Every context-sensitive language is recursive; there is a recursive language that is not context-sensitive. Both are true.',
      detail: 'The first follows from the configuration bound, which scene 4 proved. The second follows by diagonalisation: list the grammars, take the words each one rejects, and the resulting decidable language differs from every context-sensitive language at its own index. GATE CSE 1991 asked a version of this question about finite languages, where the strongest true statement is that the language is regular.',
      narration: 'Shape two: is the statement true? Every context-sensitive language is recursive; there is a recursive language that is not context-sensitive. Both are true.',
      keyword: 'Both are true' },

    { id: 'e48', scene: 'exam', start: 282, end: 288,
      caption: 'Shape three: which automaton accepts this class? The linear bounded automaton, with a tape of exactly the input plus two markers.',
      detail: 'The distractor is the Turing machine, which accepts the larger class of recursively enumerable languages, and the push-down automaton, which accepts the smaller context-free class. The one distinguishing feature to quote is the bounded tape.',
      narration: 'Shape three: which automaton accepts this class? The linear bounded automaton, with a tape of exactly the input plus two markers.',
      keyword: 'linear bounded automaton' },

    { id: 'e49', scene: 'exam', start: 288, end: 294,
      caption: 'Shape four: decidable or not? Membership yes, emptiness no. Say which question is being asked before answering.',
      detail: 'Most wrong answers on this shape come from answering a different question from the one printed. Read the object and the question as a pair, then look the pair up in the table of scene 9.',
      narration: 'Shape four: decidable or not? Membership yes, emptiness no. Say which question is being asked before answering.',
      keyword: 'Membership yes, emptiness no' },

    { id: 'e50', scene: 'exam', start: 294, end: 300,
      caption: 'One line to carry: the tape is bounded, so the configurations are finite, so membership is decidable. Nothing else follows.',
      detail: 'Every result on this page is that sentence or its converse. Bounded tape gives finitely many configurations; finitely many configurations give a decidable membership; and the questions that quantify over the whole language stay undecidable, because a finite search over configurations answers a question about one word and never about all of them.',
      narration: 'One line to carry: the tape is bounded, so the configurations are finite, so membership is decidable. Nothing else follows.',
      keyword: 'Nothing else follows' }
  ]
};
