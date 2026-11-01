# Deterministic Push-down Automata and DCFLs: One Move per Configuration — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/deterministic-pda-and-dcfl/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Two machines, one rule

*0:00 – 0:30 · objective: See determinism as a property of one cell of the transition table, and read the verdicts the test gives on four tables.*

**0:00–0:07** — A deterministic push-down automaton is not a different kind of machine. It is the same machine with one restriction on its table.

> Caption: A deterministic push-down automaton is a push-down automaton with an empty choice.

Exam-trap caption mode adds: *Do not read "deterministic" as "decides everything". A DPDA still fails to halt on some inputs and still accepts only context-free languages.*

**0:07–0:15** — Condition one is about a single cell of the table: for one state, one symbol and one stack top, at most one instruction may apply.

> Caption: Condition one: one instruction per state, symbol and stack top.

Exam-trap caption mode adds: *Two instructions on different stack tops are not a violation. The choice is only a choice when the machine cannot tell the two cells apart.*

**0:15–0:22** — Condition two stops the machine from choosing between reading a symbol and reading nothing on the same cell. An epsilon-instruction is allowed; a competing one is not.

> Caption: Condition two: if epsilon applies, no symbol may apply to the same cell.

Exam-trap caption mode adds: *Epsilon-instructions are not forbidden. Only an epsilon-instruction that competes with a symbol-instruction on the same cell is.*

**0:22–0:30** — The test is a count, not an opinion. The a^n b^n machine scores nothing. The palindrome machine scores three when its guess is an epsilon-move, two when it is a symbol-move, and the extra branch costs one.

> Caption: Four tables, three verdicts: 0, 3, 2 and 1 violations.

Exam-trap caption mode adds: *A machine that accepts the right language can still fail the test. Determinism is a property of the table, not of the language.*

## Scene 2. The test, run on a real table

*0:30 – 1:00 · objective: Run the test cell by cell over the five instructions of the a^n b^n machine, and see why an epsilon-instruction is allowed and a competing one is not.*

**0:30–0:37** — Five instructions: push on a, push on a again, start popping on b, keep popping on b, and accept when the marker is back on top.

> Caption: Five instructions carry the whole machine.

Exam-trap caption mode adds: *The push string AZ is not the string "AZ" pushed as characters. It is two stack symbols, with A on top of Z.*

**0:37–0:45** — The table is three states by three symbols by two stack symbols: eighteen cells. Five hold an instruction, and thirteen are empty.

> Caption: Eighteen cells are examined; five of them hold an instruction.

Exam-trap caption mode adds: *The cell count multiplies by the stack alphabet. A machine with a bigger stack alphabet has more cells, not more instructions.*

**0:45–0:52** — The last instruction reads nothing. It is still deterministic, because the cell below it, q1 on b with the marker on top, is empty.

> Caption: The epsilon-instruction at (q1, Z) is legal, because nothing else lives there.

Exam-trap caption mode adds: *A machine with an epsilon-instruction is not automatically non-deterministic. Check the cell before deciding.*

**0:52–1:00** — Add one branch that always dies. The language does not change at all, and the machine stops being a DPDA.

> Caption: One extra branch costs the title: the language is the same, the class is not.

Exam-trap caption mode adds: *This is the cleanest counterexample to "if a language is a DCFL then every machine for it is deterministic". That sentence is false.*

## Scene 3. One run, configuration by configuration

*1:00 – 1:30 · objective: Follow aaabbb through seven configurations to acceptance, watch aabbb stop with one symbol unread, and compare one path with the 13 configurations a guess needs.*

**1:00–1:07** — Follow aaabbb. Three a-s push, three b-s pop, and one instruction at the end reads nothing and accepts.

> Caption: aaabbb takes seven steps: three pushes, three pops and one acceptance.

Exam-trap caption mode adds: *The stack is printed with the top on the left. Reading it right to left gives the bottom first, which is how it is usually drawn.*

**1:07–1:15** — aabbb stops with one b still unread, because the marker is on top and nothing says what to do with a b there.

> Caption: aabbb stops at position four: no instruction at (q1, b, Z).

Exam-trap caption mode adds: *A stuck run rejects. It does not accept and it does not raise an error, and this is exactly what the complement argument in scene six turns on.*

**1:15–1:22** — Acceptance is the input being exhausted and the state being final. The stack is not in the definition; the machine is built so that it does not have to be.

> Caption: Acceptance is two clauses: input exhausted, state final.

Exam-trap caption mode adds: *Do not add a stack condition to the definition and then quote the definition. Either build the machine correctly or state the extra clause as part of the machine.*

**1:22–1:30** — For an input of the same length, the palindrome machine needs thirteen configurations held at once, against five steps for one path.

> Caption: The same length costs 13 configurations when a middle has to be guessed.

Exam-trap caption mode adds: *The comparison is at equal input length, not at equal machine size. Comparing a small machine with a large one proves nothing.*

## Scene 4. One path, no copies, linear time

*1:30 – 2:00 · objective: Read the measured table 3, 5, 7, 9, 11, 13 as steps = 2n + 1, and see why the deterministic class is the one a parser can afford.*

**1:30–1:37** — Six runs, measured: three steps, five, seven, nine, eleven, thirteen. That is two n plus one.

> Caption: The measured steps are 3, 5, 7, 9, 11, 13 for n from one to six.

Exam-trap caption mode adds: *The formula is a consequence of this machine. A different DPDA for the same language may take a different number of steps, and the class is defined by the existence of some linear machine.*

**1:37–1:45** — The stack peaks at n plus one, because the bottom marker is there all the way through. The machine uses one stack cell per symbol of the first half.

> Caption: The peak stack height is n + 1, because the marker is always there.

Exam-trap caption mode adds: *Stack height is not input length. The machine reads n symbols of the first half and n of the second, and the height tracks only the first half.*

**1:45–1:52** — Nothing is copied. Each input symbol is read once, and each stack symbol is pushed once and popped once, so the whole run is linear.

> Caption: One pass, no copies: each symbol is read once and each stack symbol is touched twice.

Exam-trap caption mode adds: *Linear here means linear in the input length for a fixed machine. The constant depends on the machine, and the machine depends on the language.*

**1:52–2:00** — For a general context-free language the best known method costs about n to the two point three eight. That gap is why parser generators ask for a deterministic grammar.

> Caption: A general context-free language has no such guarantee.

Exam-trap caption mode adds: *The exponent 2.38 is the best known bound, not a lower bound. Nothing here says a general CFL cannot be parsed faster.*

## Scene 5. Final state and empty stack are not the same

*2:00 – 2:30 · objective: State the prefix-free condition exactly and check it on two languages, one that passes and one that fails with a one-letter witness.*

**2:00–2:07** — There are two ways to say when a machine accepts. Either it ends in a final state, or it empties its stack.

> Caption: Two criteria: end in a final state, or empty the stack.

Exam-trap caption mode adds: *Both criteria require the whole input to be read. A machine that empties its stack halfway through has accepted nothing.*

**2:07–2:15** — For a non-deterministic push-down automaton the two criteria give exactly the same languages. That is a theorem you have probably used.

> Caption: For a non-deterministic machine the two criteria define the same family.

Exam-trap caption mode adds: *The theorem is about the non-deterministic machine. Carrying it over without checking is the single most common error in this topic.*

**2:15–2:22** — For a deterministic machine the two criteria differ, and the exact statement is that empty-stack acceptance is possible exactly for the prefix-free members of the class.

> Caption: For a deterministic machine they differ, and the exact statement names the gap.

Exam-trap caption mode adds: *Prefix-free is a property of the language, not of the machine. Two machines for the same language are prefix-free together or not at all.*

**2:22–2:30** — The language a to the n b to the n is prefix-free. The language a-star b-star is not, because a is a prefix of aa.

> Caption: a^n b^n passes the test; a*b* fails it, with a inside aa.

Exam-trap caption mode adds: *A DPDA cannot tell the end of the input from the middle of a longer word, which is why the condition is about prefixes and not about difficulty.*

## Scene 6. Closed under complement, but not by swapping states

*2:30 – 3:00 · objective: See the true statement, the one-line proof that is wrong, and the 22 strings of length at most four that expose it.*

**2:30–2:37** — The complement of a deterministic context-free language is deterministic context-free. That is the one closure property that separates this class from the context-free languages.

> Caption: The complement of a DCFL is a DCFL. That much is true.

Exam-trap caption mode adds: *Closed under complement does not mean closed under union. With De Morgan, closure under union plus complement would give closure under intersection, which fails.*

**2:37–2:45** — The proof everyone writes down is to change every final state to non-final and back. It gives a deterministic machine. It does not give the complement.

> Caption: The one-line proof is to swap the final states, and it is wrong.

Exam-trap caption mode adds: *This proof is correct for a DFA, where every run reads the whole input. The step that fails here is exactly the one that needs every run to consume its input.*

**2:45–2:52** — Run the swap on all thirty-one strings of length at most four. Twenty-two answers are wrong, and they are exactly the strings whose run stopped early.

> Caption: Enumerated: 22 of the 31 strings of length at most four come out wrong.

Exam-trap caption mode adds: *The number is a property of this machine and this universe of strings, not a constant of the theory. The identity of the wrong strings is what matters.*

**2:52–3:00** — The repair is to put the machine into a normal form first, so that every run reads its whole input. Then the swap is correct.

> Caption: The repair is a normal form: a machine that always consumes its input.

Exam-trap caption mode adds: *A theorem proved with a construction still needs the construction. Quoting the result without the normal form is how the wrong proof gets repeated.*

## Scene 7. What is closed and what is not

*3:00 – 3:30 · objective: Hold two columns in view: the seven operations DCFL preserves, the six it does not, and the one decidability consequence.*

**3:00–3:07** — Seven operations preserve deterministic context-free languages: complement, intersection with a regular set, inverse homomorphism, right quotient with a regular set, and the three prefix operations.

> Caption: Seven operations preserve the class.

Exam-trap caption mode adds: *Effective closure means a construction exists. For complement the construction is not the swap, which is the whole point of the previous scene.*

**3:07–3:15** — Six operations do not: union, intersection, concatenation, Kleene star, morphism and mirror image.

> Caption: Six do not: union, intersection, concatenation, star, morphism, mirror image.

Exam-trap caption mode adds: *Do not confuse "not closed" with "never in the class". The union of two DCFLs is often a DCFL; the claim is that it is not always one.*

**3:15–3:22** — Compare the context-free column. It is closed under union and not under complement, which is close to the reverse of this one.

> Caption: The CFL column is close to the opposite: union yes, complement no.

Exam-trap caption mode adds: *A language can be in both classes, so both columns can be true of it. The columns describe operations on the families, not properties of one language.*

**3:22–3:30** — Because the complement can be built, asking whether a deterministic machine accepts every string becomes decidable. For a context-free grammar that question has no algorithm.

> Caption: One decidability consequence: "is L everything?" becomes decidable.

Exam-trap caption mode adds: *Decidable for the machine, not for the language in the abstract. Equivalence of two deterministic machines was open for decades and is decidable, but the proof is deep.*

## Scene 8. DCFL is strictly inside CFL

*3:30 – 4:00 · objective: Two witnesses with two different reasons, and the 64-string table in which the two witness languages intersect in the diagonal alone.*

**3:30–3:37** — The first witness is the complement of a to the n b to the n c to the n. It is context-free, because it is a union of three context-free pieces.

> Caption: Witness one: the complement of a^n b^n c^n is context-free and not deterministic.

Exam-trap caption mode adds: *The complement of a non-context-free language can be context-free. That is not a contradiction; it is why the pumping lemma cannot be used on complements.*

**3:37–3:45** — If that complement were deterministic, its complement would be deterministic too, and so context-free. But the diagonal is not context-free. So the complement is not deterministic.

> Caption: If it were deterministic, its complement would be too, and that is not context-free.

Exam-trap caption mode adds: *This argument uses the complement closure proved two scenes ago. Using it while believing the swap proof would make the argument circular.*

**3:45–3:52** — The second witness is the set of even palindromes. It has an unambiguous grammar, and it is still not deterministic, because the middle has to be guessed.

> Caption: Witness two: the even palindromes are unambiguous and still not deterministic.

Exam-trap caption mode adds: *Unambiguous does not imply deterministic. The classes sit strictly: DCFL is a proper subset of the unambiguous context-free languages, which is a proper subset of the context-free languages.*

**3:52–4:00** — Check the intersection over sixty-four strings. Sixteen, sixteen, and four in the middle, and the four are the diagonal. So the intersection is not context-free.

> Caption: In the 64-string table, the two witness languages meet in the diagonal alone.

Exam-trap caption mode adds: *A bounded check does not prove the identity for all exponents. It confirms the identity on a finite window; the proof is the two-line set argument.*

## Scene 9. The DPDA you already use: the LR parser

*4:00 – 4:30 · objective: Identify the shift-reduce parser with the DPDA item by item, and read a conflict as two instructions in one cell.*

**4:00–4:07** — The theorem that ties this to compilers: a context-free language is deterministic exactly when it has an LR(1) grammar.

> Caption: A language is deterministic exactly when it has an LR(1) grammar.

Exam-trap caption mode adds: *LR(1) is about the grammar, DCFL about the language. A deterministic language can have a non-LR grammar; the claim is that it has some LR grammar.*

**4:07–4:15** — Read aabb with the grammar S goes to a b or a S b. Four shifts and two reductions, and the stack ends as the single symbol S.

> Caption: The shift-reduce run of aabb is a DPDA run: four shifts, two reductions.

Exam-trap caption mode adds: *The parser stack is not the same object as the machine stack in the definition. It is the same idea, and the correspondence has to be stated item by item, which is what the next beat does.*

**4:15–4:22** — State with state, stack with stack, shift with read, reduce with pop and push. The table is the transition table.

> Caption: State, stack, shift, reduce: the correspondence is item by item.

Exam-trap caption mode adds: *Look-ahead is not in the DPDA definition. An LR(1) parser sees one symbol ahead, which is why the equivalence is stated for the language and not for the machine as written.*

**4:22–4:30** — A shift-reduce conflict is two instructions in one cell. That is the first condition failing, and it is what a parser generator is reporting.

> Caption: A shift-reduce conflict is two instructions in one cell.

Exam-trap caption mode adds: *A conflict in one grammar does not prove the language is not a DCFL. Another grammar for the same language may be deterministic, which is exactly the GATE 2020 question about a^n and a^n b^n.*

## Scene 10. The procedure, and the four traps

*4:30 – 5:00 · objective: Fix four questions to ask of any candidate language and name the four answers that look right and are wrong.*

**4:30–4:37** — First question: where is the boundary? A marker symbol, or a change of letter, or nothing at all.

> Caption: Ask where the boundary is: a marker, a change of symbol, or nothing.

Exam-trap caption mode adds: *A boundary you can see is necessary but not sufficient. Two counts still have to be compared with one stack.*

**4:37–4:45** — Second question: what has to be remembered? One counter fits on the stack. Two comparisons do not.

> Caption: Ask what must be remembered: one count fits the stack, two comparisons do not.

Exam-trap caption mode adds: *One counter is a sufficient shape, not a definition. Some deterministic languages need no counter at all, and some need the stack for structure rather than counting.*

**4:45–4:52** — Third question: is a guess needed? If two hypotheses have to stay alive until the end, the language is not deterministic.

> Caption: Ask whether a guess is needed: if two hypotheses stay alive to the end, it is not a DCFL.

Exam-trap caption mode adds: *A guess you can resolve later with one look-ahead is not the same as a guess that must stay alive. That distinction is the LR(1) versus LR(k) question.*

**4:52–5:00** — Four traps. The swap is not the proof. Empty-stack equivalence is for the non-deterministic machine. Unambiguous is weaker than deterministic. And every regular language is deterministic, because a finite automaton is a push-down automaton that ignores its stack.

> Caption: Four traps: the swap proof, the carried-over theorem, unambiguous, and regular.

Exam-trap caption mode adds: *The fourth trap costs the most marks: a regular language offered as a candidate for "not a DCFL" is always wrong.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
