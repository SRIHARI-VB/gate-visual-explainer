# Chomsky Hierarchy — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/chomsky-hierarchy/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Four grammar types, five language classes

*0:00 – 0:30 · objective: Hold the whole hierarchy in one picture: four rule shapes, and the five classes they give once the recursive languages are inserted.*

**0:00–0:07** — Five classes stacked in one column. Each one is a proper subset of the class above it.

> Caption: Five classes, stacked. Each is a proper subset of the one above it.

Exam-trap caption mode adds: *A chain of inclusions is not a chain of equalities. Four of the five links are strict and each strictness needs its own witness.*

**0:07–0:15** — From type three down to type zero, the only thing that changes is the shape a rule is allowed to have.

> Caption: Type 3 to Type 0: what changes is only the shape a rule is allowed to have.

Exam-trap caption mode adds: *The four types are a restriction on rules, not a restriction on alphabets. Every type uses the same terminals and nonterminals.*

**0:15–0:22** — Recursive is not one of the four numbered types. It was inserted later, between type one and type zero.

> Caption: REC is not one of Chomsky's four types. It sits between Type 1 and Type 0.

Exam-trap caption mode adds: *A question that says "the Chomsky hierarchy has four levels" and a question that counts five classes are both right, about different objects.*

**0:22–0:30** — Read it upwards and a bigger class is simply a machine with more memory.

> Caption: Read the chain upwards: a bigger class is a machine with more memory.

Exam-trap caption mode adds: *Bigger class does not mean harder language. Every regular language is also context-sensitive, and every context-sensitive language is decidable.*

## Scene 2. The automaton each rule buys you

*0:30 – 1:00 · objective: Translate each grammar restriction into a memory restriction, so the class can be named by the machine rather than by the look of the strings.*

**0:30–0:37** — Type three buys a finite automaton. A fixed number of states, and no memory beyond them.

> Caption: Type 3 buys a finite automaton: a fixed number of states and no memory.

Exam-trap caption mode adds: *A DFA with a million states is still a DFA. "Finite" is a promise about the machine, not a small number.*

**0:37–0:45** — Type two buys a stack. One comparison can be remembered, and only one.

> Caption: Type 2 buys a stack: one comparison can be remembered, and only one.

Exam-trap caption mode adds: *Two stacks are not a context-free machine. A two-stack automaton is as powerful as a Turing machine.*

**0:45–0:52** — Type one buys a tape no longer than the input, and that ceiling is what makes the class decidable.

> Caption: Type 1 buys a tape no longer than the input. That ceiling is what makes it decidable.

Exam-trap caption mode adds: *Bounded tape does not mean bounded time. Membership in a context-sensitive language is decidable but PSPACE-complete.*

**0:52–1:00** — Type zero buys an unbounded tape, and with it the halting problem.

> Caption: Type 0 buys an unbounded tape, and with it the halting problem.

Exam-trap caption mode adds: *An unbounded tape does not make every language recognisable. Most languages have no machine at all, as the counting argument later shows.*

## Scene 3. REG is smaller than CFL: the pumping search

*1:00 – 1:30 · objective: Run the regular pumping lemma as an exhaustive search over every allowed split and report the survivor count at p = 1 to 8.*

**1:00–1:07** — The regular pumping lemma run as a search. Take the string a to the p, b to the p, and try every split the lemma allows.

> Caption: The regular pumping lemma, run as a search rather than recited as a proof.

Exam-trap caption mode adds: *The lemma promises a split exists. To use it as a proof of non-regularity you must show every allowed split fails.*

**1:07–1:15** — One split at p equals one, thirty-six at p equals eight. In every case the pumped block sits inside the a run and breaks the balance.

> Caption: At p = 1 there is 1 split, at p = 8 there are 36. Every split pumps a's into b's.

Exam-trap caption mode adds: *A common slip is choosing a split by hand and declaring the language non-regular. The lemma quantifies over all splits, so one counterexample split proves nothing.*

**1:15–1:22** — Survivors, zero, at every pumping length from one to eight.

> Caption: Survivors: zero, at every pumping length from 1 to 8.

Exam-trap caption mode adds: *Surviving the pumping lemma proves nothing. There are non-regular languages that satisfy it, so the lemma is necessary and not sufficient.*

**1:22–1:30** — So a to the n, b to the n is context-free and not regular. One strict link, proved by search.

> Caption: So a^n b^n is in CFL and not in REG: one strict link, proved by search.

Exam-trap caption mode adds: *Not regular does not mean not context-free. The next scene is exactly the language that is context-free and not regular, one rung up.*

## Scene 4. CFL is smaller than CSL: a grammar with no shrinking rule

*1:30 – 2:00 · objective: Build a seven-rule monotonic grammar for a^n b^n c^n, check that no rule shrinks, and let a bounded search confirm exactly which terminal strings it writes.*

**1:30–1:37** — Seven rules, and not one of them shrinks the string it rewrites.

> Caption: Seven rules, and not one of them shrinks its sentential form.

Exam-trap caption mode adds: *A Type 1 grammar is defined by non-shrinking rules, not by the phrase "context-sensitive". A shrinking grammar can generate a non-context-sensitive language.*

**1:37–1:45** — The derivation sorts the Bs and Cs, then converts them one at a time.

> Caption: The derivation sorts the B's and C's, then converts them one at a time.

Exam-trap caption mode adds: *The rule CB to BC is length-preserving, so it is legal here. In a context-free grammar it would be illegal, because the left side has two symbols.*

**1:45–1:52** — A bounded search finds exactly three terminal strings up to length eleven: abc, aabbcc and aaabbbccc.

> Caption: A bounded search finds exactly three terminal strings up to length 11.

Exam-trap caption mode adds: *A bounded search is evidence about short strings, not a proof about all n. The proof is the induction on n that the rule pattern makes available.*

**1:52–2:00** — So a to the n, b to the n, c to the n is context-sensitive and not context-free.

> Caption: So a^n b^n c^n is context-sensitive and not context-free.

Exam-trap caption mode adds: *a^n b^n c^n is context-sensitive, and every context-sensitive language is decidable. Non-context-free does not mean undecidable.*

## Scene 5. CSL is smaller than REC: the linear tape has a ceiling

*2:00 – 2:30 · objective: Place CSL inside the space hierarchy and produce a decidable language that is not context-sensitive, without hand-waving.*

**2:00–2:07** — The context-sensitive languages are exactly the languages a machine can accept using n cells. Savitch puts that inside n squared space.

> Caption: CSL is NSPACE(n). Savitch puts it inside SPACE(n^2).

Exam-trap caption mode adds: *NSPACE(n) equals CSL, and it is not known to equal SPACE(n). Deterministic and nondeterministic linear space are different classes here.*

**2:07–2:15** — The space hierarchy theorem says n squared space is a proper subset of n cubed space.

> Caption: The space hierarchy theorem says SPACE(n^2) is a proper subset of SPACE(n^3).

Exam-trap caption mode adds: *The hierarchy theorem needs a space-constructible bound. It does not license "more space is always strictly more powerful" for arbitrary functions.*

**2:15–2:22** — Take a language in n cubed space that is not in n squared space. It is decidable, and it is not context-sensitive.

> Caption: Take a language in SPACE(n^3) but not SPACE(n^2): decidable, and not context-sensitive.

Exam-trap caption mode adds: *The witness is not a famous named language. Strictness of this link is normally proved by hierarchy and diagonalisation rather than by a single slogan.*

**2:22–2:30** — The diagonal language needs two counters and a linear tape holds them. A language needing exponentially more space cannot fit at all.

> Caption: a^n b^n c^n needs two counters, and a linear tape holds them. A 2^n-cell language cannot fit.

Exam-trap caption mode adds: *Do not read "context-sensitive" as "sensitive to context". The name comes from the rule shape alpha A beta, not from a semantic idea.*

## Scene 6. REC is smaller than RE: the one operation that is missing

*2:30 – 3:00 · objective: Use Post's theorem to explain why complement is the single operation that separates the top two rungs.*

**2:30–2:37** — RE is the class with a machine that says yes. On a string outside the language it may say nothing at all.

> Caption: RE is the class with a machine that says yes. It may say nothing else.

Exam-trap caption mode adds: *A recogniser that loops on a non-member has not rejected it. Rejection needs a halt, and RE does not promise one.*

**2:37–2:45** — Recursive is the class with a machine that always halts, so complement never leaves the class.

> Caption: REC is the class with a machine that always halts, and it is closed under complement.

Exam-trap caption mode adds: *Closed under complement is a property of REC, not of RE. This single cell of the closure table is the entire gap between the top two rungs.*

**2:45–2:52** — Post says a set is recursive exactly when it and its complement are both recursively enumerable.

> Caption: Post: a set is recursive exactly when it and its complement are both r.e.

Exam-trap caption mode adds: *The two recognisers must be run in parallel, not one after the other. Sequentially, the first may loop forever while the second would have answered.*

**2:52–3:00** — The halting set is recursively enumerable and not recursive, and its complement is in neither class.

> Caption: The halting set is in RE and not in REC, and its complement is in neither.

Exam-trap caption mode adds: *"Not in RE" is stronger than "not recursive". The complement of halting is not merely undecidable, it is unrecognisable.*

## Scene 7. The closure table, five classes by seven operations

*3:00 – 3:30 · objective: Read the closure table as two facts rather than three failures, and derive the intersection failure from the complement failure.*

**3:00–3:07** — Every class here is closed under union, concatenation, star, reversal, and intersection with a regular set.

> Caption: Every class here is closed under union, concatenation, star, reversal and with a regular set.

Exam-trap caption mode adds: *Closed under union and closed under intersection are independent facts. Five of these seven operations hold everywhere; intersection does not.*

**3:07–3:15** — Three cells fail. Context-free twice, and recursively enumerable once.

> Caption: Three cells fail: CFL twice and RE once.

Exam-trap caption mode adds: *Counting failures as three suggests three separate reasons. There are two, and the next beat separates them.*

**3:15–3:22** — Two of those failures are one fact. Without a complement you cannot build an intersection.

> Caption: Two of the failures are one fact: no complement means no intersection.

Exam-trap caption mode adds: *This derivation is one-directional. Non-closure under intersection implies non-closure under complement here only because CFL is closed under union.*

**3:22–3:30** — The third failure is Post: take complement away from RE and what remains is recursive.

> Caption: The third is Post: RE without complement is REC.

Exam-trap caption mode adds: *CSL being closed under complement is a deep theorem, not a definition. It was proved in 1988 and is worth knowing as a fact rather than deriving.*

## Scene 8. Two context-free languages whose intersection is not

*3:30 – 4:00 · objective: Enumerate L1 and L2 over a small universe, count the intersection, and see that it is exactly the diagonal language scene 3 already broke.*

**3:30–3:37** — The first language pairs the a count with the b count, the second pairs b with c, and each one is context-free.

> Caption: L1 pairs equal a's with b's. L2 pairs equal b's with c's. Both are context-free.

Exam-trap caption mode adds: *Two context-free grammars do not compose. There is no rule that intersects two CFGs into a CFG, which is exactly the point.*

**3:37–3:45** — Over the small universe there are a hundred and twenty-five strings, twenty-five in each language, and forty-five in their union.

> Caption: On i, j, k from 0 to 4: 125 strings, 25 in L1, 25 in L2, 45 in the union.

Exam-trap caption mode adds: *The union of two context-free languages is always context-free. Union is the operation that never fails, which is why it cannot be used to build a counterexample.*

**3:45–3:52** — The intersection has five strings, and they are exactly the diagonal language.

> Caption: The intersection has 5 strings, and they are exactly a^n b^n c^n.

Exam-trap caption mode adds: *A finite check on small strings does not prove the general intersection. The general claim needs the argument that i equals j and j equals k forces i equals k.*

**3:52–4:00** — The pumping search from earlier in this lesson already broke that language, so context-free languages are not closed under intersection.

> Caption: Scene 3 already broke that language with the context-free pumping lemma.

Exam-trap caption mode adds: *One counterexample proves non-closure. No number of examples could ever prove closure, which is why closure claims need a construction instead.*

## Scene 9. What you can decide, class by class

*4:00 – 4:30 · objective: Separate recognising a language from deciding it, and notice that decidability does not fall as the class grows.*

**4:00–4:07** — Regular languages answer all five questions, and so do recursive languages.

> Caption: Regular languages answer all five questions. So do recursive languages.

Exam-trap caption mode adds: *Equivalence of regular languages is decidable by product construction, not by enumerating strings. The enumeration never terminates on unequal languages.*

**4:07–4:15** — Context-free and context-sensitive languages answer three of the five.

> Caption: Context-free and context-sensitive languages answer three of the five.

Exam-trap caption mode adds: *Equivalence is decidable for deterministic push-down automata, a result from 1997. Do not carry that to nondeterministic context-free grammars.*

**4:15–4:22** — Decidability does not fall as the class grows. Recursive decides more than context-sensitive does.

> Caption: Decidability does not fall as the class grows: REC decides more than CSL.

Exam-trap caption mode adds: *Do not assume a bigger class decides fewer questions. The recursive class is bigger than CSL and decides strictly more.*

**4:22–4:30** — For recursively enumerable languages only membership is semi-decidable. Everything else is lost.

> Caption: For r.e. languages only membership is semi-decidable. Everything else is lost.

Exam-trap caption mode adds: *Semi-decidable is not decidable. A yes answer is a proof of membership; silence is never a proof of non-membership.*

## Scene 10. Placing an unfamiliar language on the ladder

*4:30 – 5:00 · objective: Turn the whole lesson into four ordered questions and three traps.*

**4:30–4:37** — Ask four questions in order: is there a DFA, a CFG, a monotonic grammar, an always halting machine.

> Caption: Four questions in order: DFA, CFG, monotonic grammar, always-halting machine.

Exam-trap caption mode adds: *The questions are nested, not exclusive. A language with a DFA also has a CFG, so the answer is the smallest class that works.*

**4:37–4:45** — Then ask the two questions that separate the rungs you cannot see: is the complement describable, and does the language need more than linear space.

> Caption: Then ask the two questions that separate the rungs you cannot see.

Exam-trap caption mode adds: *The complement question only works in one direction. A language whose complement is not r.e. is outside RE, not merely outside REC.*

**4:45–4:52** — The first trap: not regular does not mean context-free.

> Caption: Trap one: not regular does not mean context-free.

Exam-trap caption mode adds: *The three most common wrong answers in this topic are: assuming one stack is enough for any count, assuming undecidable means unrecognisable, and assuming closure under union implies closure under intersection.*

**4:52–5:00** — Name the class by the machine that recognises it, never by the look of the strings.

> Caption: Name the class by the machine, never by the look of the strings.

Exam-trap caption mode adds: *A bounded count is regular. The set of strings of a's and b's with at most a hundred a's is regular, and looks exactly like the non-regular one.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
