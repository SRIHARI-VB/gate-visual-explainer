# Linear Bounded Automata and the Context-Sensitive Class: the Bounded Tape, the Configuration Count and the Decidability It Buys — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/linear-bounded-automata/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 50 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. The rung with no name

*0:00 – 0:30 · objective: Place the context-sensitive class in the six-rung hierarchy, between context-free and recursive, and name the automaton that owns it.*

**0:00–0:06** — Six classes stand in one line: regular, deterministic context-free, context-free, context-sensitive, recursive, recursively enumerable.

> Caption: Six classes stand in one line: regular, deterministic context-free, context-free, context-sensitive, recursive, recursively enumerable.

**0:06–0:12** — Three lessons already stopped at context-free. Between context-free and recursive sits one rung, and it has an automaton of its own.

> Caption: Three lessons already stopped at context-free. Between context-free and recursive sits one rung, and it has an automaton of its own.

**0:12–0:18** — The automaton is a Turing machine that may not use more tape than the input occupies. It is called a linear bounded automaton.

> Caption: The automaton is a Turing machine that may not use more tape than the input occupies. It is called a linear bounded automaton.

**0:18–0:24** — Its languages are exactly the context-sensitive ones, proved by Kuroda in 1964, and every one of them is decidable.

> Caption: Its languages are exactly the context-sensitive ones, proved by Kuroda in 1964, and every one of them is decidable.

**0:24–0:30** — This page computes the automaton, the bound that makes it decide, the grammar that matches it, and the decision table that surprises people.

> Caption: This page computes the automaton, the bound that makes it decide, the grammar that matches it, and the decision table that surprises people.

## Scene 2. One tape, one head, no new cells

*0:30 – 1:00 · objective: State the linear bounded automaton as a seven-tuple with two endmarkers, and see why a string of n letters leaves exactly n + 2 usable cells.*

**0:30–0:36** — A linear bounded automaton is a seven-tuple: states, input alphabet, tape alphabet, transition function, start state, accept state, reject state.

> Caption: A linear bounded automaton is a seven-tuple: states, input alphabet, tape alphabet, transition function, start state, accept state, reject state.

**0:36–0:42** — Two symbols of the tape alphabet are endmarkers. No transition may print over them, and no transition may move past them.

> Caption: Two symbols of the tape alphabet are endmarkers. No transition may print over them, and no transition may move past them.

**0:42–0:48** — So on a string of n letters the tape is exactly n plus 2 cells: the input, and one marker at each end. Nothing else exists.

> Caption: So on a string of n letters the tape is exactly n + 2 cells: the input, and one marker at each end. Nothing else exists.

**0:48–0:54** — The machine on this page uses 7 states and 8 tape symbols: a, b, c, three working marks X, Y, Z, and the two endmarkers.

> Caption: The machine on this page uses 7 states and 8 tape symbols: a, b, c, three working marks X, Y, Z, and the two endmarkers.

**0:54–1:00** — Its language is a to the n, b to the n, c to the n: the standard first language that no push-down automaton can accept.

> Caption: Its language is a to the n, b to the n, c to the n: the standard first language that no push-down automaton can accept.

## Scene 3. Three blocks, three marks: aabbcc in 29 moves

*1:00 – 1:30 · objective: Watch one deterministic linear bounded automaton decide a to the n b to the n c to the n, and see that every write stays inside the input plus the markers.*

**1:00–1:06** — The machine crosses the tape three times per round. First it marks one a with X and walks right to the first b.

> Caption: The machine crosses the tape three times per round. First it marks one a with X and walks right to the first b.

**1:06–1:12** — Then it marks that b with Y, walks right to the first c, marks it with Z, and walks all the way back to the left marker.

> Caption: Then it marks that b with Y, walks right to the first c, marks it with Z, and walks all the way back to the left marker.

**1:12–1:18** — Two rounds on aabbcc turn the tape into X X Y Y Z Z. The third round finds no a, and only checks that nothing is left unmarked.

> Caption: Two rounds on aabbcc turn the tape into X X Y Y Z Z. The third round finds no a, and only checks that nothing is left unmarked.

**1:18–1:24** — It accepts in 29 moves. On abc it takes 10; on aaabbbccc, 58; on aaaabbbbcccc, 97.

> Caption: It accepts in 29 moves. On abc it takes 10; on aaabbbccc, 58; on aaaabbbbcccc, 97.

**1:24–1:30** — The head never left the eight cells it started with. Every write was inside the input plus the two markers.

> Caption: The head never left the eight cells it started with. Every write was inside the input plus the two markers.

## Scene 4. Finite because the space is fixed

*1:30 – 2:00 · objective: Count the configurations: states times head positions times tape contents. The count is enormous and it is finite, which is the whole decidability argument.*

**1:30–1:36** — A configuration is the state, the tape contents and the head position. Nothing else about the machine can change.

> Caption: A configuration is the state, the tape contents and the head position. Nothing else about the machine can change.

**1:36–1:42** — The count is states times head positions times tape contents: 7 times m plus 2, times 8 to the power m.

> Caption: The count is states times head positions times tape contents: 7 times m + 2, times 8 to the power m.

**1:42–1:48** — An input of 1 letter gives 168 configurations. Four letters, 172,032. Six letters, 14,680,064, which is enormous and still finite.

> Caption: An input of 1 letter gives 168 configurations. Four letters, 172,032. Six letters, 14,680,064, which is enormous and still finite.

**1:48–1:54** — Finite is the whole point. A machine that can only pass through finitely many configurations either accepts, or repeats one and loops forever.

> Caption: Finite is the whole point. A machine that can only pass through finitely many configurations either accepts, or repeats one and loops forever.

**1:54–2:00** — That sentence is the proof that every context-sensitive language is decidable, and it is why this rung sits below recursive.

> Caption: That sentence is the proof that every context-sensitive language is decidable, and it is why this rung sits below recursive.

## Scene 5. A run that never ends still decides

*2:00 – 2:30 · objective: Separate the machine from its decider: a second machine simulates the first for the configuration bound and rejects if acceptance has not happened.*

**2:00–2:06** — Here is a machine that never stops: two states, and a head that walks right then left forever. It repeats its first configuration after 2 moves.

> Caption: Here is a machine that never stops: two states, and a head that walks right then left forever. It repeats its first configuration after 2 moves.

**2:06–2:12** — Simulating it tells you nothing, because the simulation never ends. Counting does.

> Caption: Simulating it tells you nothing, because the simulation never ends. Counting does.

**2:12–2:18** — Run it for at most 7 times m plus 2, times 8 to the power m moves: 168 on a one-letter input. If it has not accepted by then, it never will.

> Caption: Run it for at most 7 times m + 2, times 8 to the power m moves: 168 on a one-letter input. If it has not accepted by then, it never will.

**2:18–2:24** — That bound is the decider. It is a different machine that watches the first one, and it always halts with an answer.

> Caption: That bound is the decider. It is a different machine that watches the first one, and it always halts with an answer.

**2:24–2:30** — So acceptance for this automaton is decidable. The trap is to conclude that everything about it is.

> Caption: So acceptance for this automaton is decidable. The trap is to conclude that everything about it is.

Exam-trap caption mode adds: *decidable membership does not imply decidable emptiness*

## Scene 6. The graph is small, the bound is huge

*2:30 – 3:00 · objective: Read acceptance as reachability in the configuration graph, and compare the reachable counts with the counting bound for deterministic and nondeterministic machines.*

**2:30–2:36** — Draw a dot for every configuration and an arrow for every move. Acceptance is reachability of an accepting dot.

> Caption: Draw a dot for every configuration and an arrow for every move. Acceptance is reachability of an accepting dot.

**2:36–2:42** — This machine is deterministic, so its dots form one path: 11 configurations at n equal to 1, 30 at n equal to 2, 59 at n equal to 3, 98 at n equal to 4.

> Caption: This machine is deterministic, so its dots form one path: 11 configurations at n = 1, 30 at n = 2, 59 at n = 3, 98 at n = 4.

**2:42–2:48** — A nondeterministic one branches. A machine that may write a or b over each a reaches 5, 11, 23 and 47 configurations for 1 to 4 letters.

> Caption: A nondeterministic one branches. A machine that may write a or b over each a reaches 5, 11, 23 and 47 configurations for 1 to 4 letters.

**2:48–2:54** — Those counts are 3 times 2 to the k, minus 1: 2 to the k plus 1 minus 1 running configurations, plus 2 to the k accepting ones.

> Caption: Those counts are 3 times 2 to the k, minus 1: 2 to the k + 1 minus 1 running configurations, plus 2 to the k accepting ones.

**2:54–3:00** — Small or large, the set is finite, and that is all the decidability argument needs.

> Caption: Small or large, the set is finite, and that is all the decidability argument needs.

## Scene 7. The same class from the grammar side

*3:00 – 3:30 · objective: Generate the same language with a four-rule non-contracting grammar, and check the generated set against an independent membership test.*

**3:00–3:06** — The grammar side is shorter. Four rules: S goes to abc, S goes to a S B c, c B goes to B c, b B goes to b b.

> Caption: The grammar side is shorter. Four rules: S goes to abc, S goes to a S B c, c B goes to B c, b B goes to b b.

**3:06–3:12** — No rule makes a string shorter, so no sentential form is ever longer than the word it will become. That is a non-contracting grammar.

> Caption: No rule makes a string shorter, so no sentential form is ever longer than the word it will become. That is a non-contracting grammar.

**3:12–3:18** — Searching every sentential form up to length 9 finds 17 forms and exactly 3 terminal strings: abc, aabbcc, aaabbbccc.

> Caption: Searching every sentential form up to length 9 finds 17 forms and exactly 3 terminal strings: abc, aabbcc, aaabbbccc.

**3:18–3:24** — That set equals the language restricted to length 9, computed independently by a membership test on all 29,523 strings.

> Caption: That set equals the language restricted to length 9, computed independently by a membership test on all 29,523 strings.

**3:24–3:30** — Non-contracting grammars generate exactly the context-sensitive languages. The automaton and the grammar name the same class.

> Caption: Non-contracting grammars generate exactly the context-sensitive languages. The automaton and the grammar name the same class.

## Scene 8. Closed under almost everything

*3:30 – 4:00 · objective: List the six operations that preserve the class, the one that does not, and the open problem that decides nothing at all.*

**3:30–3:36** — Union, intersection, complement, concatenation, Kleene star, reversal: the class is closed under all six.

> Caption: Union, intersection, complement, concatenation, Kleene star, reversal: the class is closed under all six.

**3:36–3:42** — Complement is the surprise. Context-free languages are not closed under complement; context-sensitive ones are.

> Caption: Complement is the surprise. Context-free languages are not closed under complement; context-sensitive ones are.

Exam-trap caption mode adds: *complement closure is not inherited from the class below*

**3:42–3:48** — That is the second LBA problem, open from 1964 and settled in 1988 by Immerman and Szelepcsényi: nondeterministic space is closed under complement.

> Caption: That is the second LBA problem, open from 1964 and settled in 1988 by Immerman and Szelepcsényi: nondeterministic space is closed under complement.

**3:48–3:54** — Homomorphism is the exception. A homomorphism that erases letters can shrink a word, so it can leave the class; the ones that never erase stay inside.

> Caption: Homomorphism is the exception. A homomorphism that erases letters can shrink a word, so it can leave the class; the ones that never erase stay inside.

**3:54–4:00** — And determinism is still open: nobody knows whether deterministic linear bounded automata accept fewer languages.

> Caption: And determinism is still open: nobody knows whether deterministic linear bounded automata accept fewer languages.

## Scene 9. A decidable membership, an undecidable emptiness

*4:00 – 4:30 · objective: Separate the questions that are decidable about this class from the questions that are not, and contrast them with the context-free row.*

**4:00–4:06** — Membership is decidable, but not cheaply: it is complete for polynomial space, so no polynomial-time algorithm is known.

> Caption: Membership is decidable, but not cheaply: it is complete for polynomial space, so no polynomial-time algorithm is known.

**4:06–4:12** — Emptiness is not decidable at all. Given a context-sensitive grammar, no algorithm decides whether its language is empty.

> Caption: Emptiness is not decidable at all. Given a context-sensitive grammar, no algorithm decides whether its language is empty.

Exam-trap caption mode adds: *decidable membership, undecidable emptiness: keep the two questions apart*

**4:12–4:18** — Equivalence, finiteness and universality fail the same way. Complement closure does not rescue any of them.

> Caption: Equivalence, finiteness and universality fail the same way. Complement closure does not rescue any of them.

**4:18–4:24** — Compare the rung below: context-free emptiness is decidable, and equivalence is not. The surprises sit in different places.

> Caption: Compare the rung below: context-free emptiness is decidable, and equivalence is not. The surprises sit in different places.

**4:24–4:30** — Keep the two questions apart. Is this word in the language is decidable; is this language empty is not.

> Caption: Keep the two questions apart. Is this word in the language is decidable; is this language empty is not.

## Scene 10. Four question shapes, one open problem

*4:30 – 5:00 · objective: Reduce every exam question on this class to one of four shapes, and name the one question nobody can answer.*

**4:30–4:36** — Shape one: place a language in the hierarchy. Count the independent equalities: three need linear space, two need a stack, one needs nothing.

> Caption: Shape one: place a language in the hierarchy. Count the independent equalities: three need linear space, two need a stack, one needs nothing.

**4:36–4:42** — Shape two: is the statement true? Every context-sensitive language is recursive; there is a recursive language that is not context-sensitive. Both are true.

> Caption: Shape two: is the statement true? Every context-sensitive language is recursive; there is a recursive language that is not context-sensitive. Both are true.

**4:42–4:48** — Shape three: which automaton accepts this class? The linear bounded automaton, with a tape of exactly the input plus two markers.

> Caption: Shape three: which automaton accepts this class? The linear bounded automaton, with a tape of exactly the input plus two markers.

**4:48–4:54** — Shape four: decidable or not? Membership yes, emptiness no. Say which question is being asked before answering.

> Caption: Shape four: decidable or not? Membership yes, emptiness no. Say which question is being asked before answering.

**4:54–5:00** — One line to carry: the tape is bounded, so the configurations are finite, so membership is decidable. Nothing else follows.

> Caption: One line to carry: the tape is bounded, so the configurations are finite, so membership is decidable. Nothing else follows.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
