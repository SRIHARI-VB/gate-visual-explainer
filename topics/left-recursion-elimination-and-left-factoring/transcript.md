# Eliminating Left Recursion and Left Factoring: the Three Routes, the Ordered Algorithm and the Fixed Point — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/left-recursion-elimination-and-left-factoring/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Two ways a top-down parser fails before it starts

*0:00 – 0:30 · objective: See that a left-recursive rule expands without ever consuming a character, and that a shared prefix leaves two rows of the table applicable to one lookahead.*

**0:00–0:07** — The rule for E begins with E. So expanding E expands E again, and the sentential form grows while the input pointer does not move.

> Caption: E → E + T | T. Expanding E never consumes a character: E ⇒ E + T ⇒ E + T + T ⇒ …

Exam-trap caption mode adds: *The failure is not slow parsing. The parser never reaches the input at all, so it does not terminate.*

**0:07–0:15** — The stack grows by one plus T at every step, and the input pointer stays where it started. Nothing is ever popped, so no token is ever consumed.

> Caption: The stack grows by one + T at every step and the input pointer stays at position 1.

Exam-trap caption mode adds: *A grammar with a left-recursive rule can still describe a perfectly finite language. The infinite behaviour is in the parser, not in the language.*

**0:15–0:22** — The second failure is a shared prefix. Both alternatives of S begin with if, so the cell for S and if holds two productions and the parser cannot choose.

> Caption: The second failure is a shared prefix: S → if E then S | if E then S else S.

Exam-trap caption mode adds: *Two alternatives that begin with the same terminal always collide in a one-token table, however different their tails are.*

**0:22–0:30** — Two transformations answer these two failures: eliminating left recursion, and left factoring. Neither belongs to the LL(1) construction. Both run before it.

> Caption: Two transformations answer these two failures. Neither belongs to the LL(1) construction; both run before it.

Exam-trap caption mode adds: *Neither transformation is part of the table construction, so a question that says "the LL(1) table of this grammar" is asking about the grammar as given.*

## Scene 2. The direct rewrite: repeat on the right instead of the left

*0:30 – 1:00 · objective: Turn A -> A alpha | beta into A -> beta A-prime, A-prime -> alpha A-prime | epsilon, and read the helper as "zero or more repetitions".*

**0:30–0:37** — A goes to A alpha or beta means: a beta, then any number of alpha. The helper rule alpha A prime or epsilon is that same sentence written as a grammar.

> Caption: A → Aα | β says: a β, then any number of α. The helper A′ → αA′ | ε is that same sentence written as a grammar.

**0:37–0:45** — A goes to beta A prime generates beta once. Then A prime repeats alpha zero or more times, and the only way to stop is the empty production.

> Caption: A → βA′ generates β once; then A′ repeats α zero or more times.

**0:45–0:52** — E goes to E plus T or T becomes E goes to T E prime, and E prime goes to plus T E prime or epsilon. A term, then any number of plus term.

> Caption: E → E + T | T becomes E → T E′, E′ → + T E′ | ε.

**0:52–1:00** — The recursion now sits on the right of the rule. Expanding E puts a terminal on top of the stack first, so every expansion consumes a token before it recurses.

> Caption: The recursion now sits on the right of the rule, so every expansion consumes a token before it recurses.

Exam-trap caption mode adds: *The rewrite does not make the grammar LL(1) by itself. It removes one of the two obstacles; the table is still to be built.*

## Scene 3. Counting the rules: n + m + 1

*1:00 – 1:30 · objective: Predict the size of the rewritten grammar before writing it: m recursive alternatives and n base alternatives become n + m + 1 productions.*

**1:00–1:07** — Count first. With m recursive alternatives and n base alternatives you get n plus m plus one productions: one per base, one per recursive alternative, and one for the empty production.

> Caption: Count first: m recursive alternatives and n base alternatives become n + m + 1 productions.

**1:07–1:15** — E has one recursive and one base alternative, so three rules for E. Adding the rule for T, the grammar goes from three productions to four.

> Caption: E has one recursive and one base alternative: 1 + 1 + 1 = 3 rules for E. With T the grammar goes from three to four.

**1:15–1:22** — Four alternatives become five. Two for S, which are c S prime and d S prime, and three for S prime: a S prime, b S prime, and epsilon.

> Caption: S → Sa | Sb | c | d becomes five: two for S, three for S′.

**1:22–1:30** — So a question that asks for the number of rules is answered by the count, before the grammar is written out. And the count is the fastest check on a hand-written answer.

> Caption: So a question that asks for the number of rules is answered by the count, before the grammar is written out.

Exam-trap caption mode adds: *Only the rewritten nonterminals change count. Counting every production in the grammar and applying n + m + 1 to the total is a common slip.*

## Scene 4. The epsilon is the base case, not decoration

*1:30 – 2:00 · objective: Delete the empty production from the helper and watch the language empty out, which is why the epsilon can never be dropped as a simplification.*

**1:30–1:37** — Delete the empty production from the helper and ask what E generates now. The helper is left with one rule, which always leaves another E prime behind.

> Caption: Delete the ε from E′ → + T E′ | ε and ask what E generates now.

Exam-trap caption mode adds: *Deleting an ε-production looks like a simplification. In a helper created by this rewrite it deletes the base case of a repetition.*

**1:37–1:45** — Every derivation has to end with E prime going to epsilon. With no epsilon there is no ending, so nothing at all is generated.

> Caption: Every derivation has to end with E′ ⇒ ε. With no ε there is no ending, so nothing is generated at all.

**1:45–1:52** — The enumeration agrees. Four strings up to length seven before the deletion, and none after: a, a plus a, and the two longer ones are all gone.

> Caption: The enumeration agrees: four strings up to length seven before the deletion, none after.

**1:52–2:00** — Epsilon is the base case of the repetition. It is the one production students delete when they tidy up, and the language empties out.

> Caption: ε is the base case of the repetition. It is the one production students delete when they tidy up.

Exam-trap caption mode adds: *A rewritten grammar usually has more ε-productions than the original. That is expected, not a sign of a mistake.*

## Scene 5. Same language, different tree: a minus b minus c

*2:00 – 2:30 · objective: See the rewrite change left association into right association, and compute the two different values that follow.*

**2:00–2:07** — The left-recursive grammar parses a minus b minus c as a minus b, then minus c. The left recursion is what puts the first operator on the left.

> Caption: E → E − T | T parses a − b − c as (a − b) − c. The left recursion is what puts the operator on the left.

**2:07–2:15** — After the rewrite the tree leans the other way: a minus, then the whole of b minus c. The same three symbols, a different shape.

> Caption: After the rewrite, E → T E′, E′ → − T E′ | ε, the tree leans right: a − (b − c).

**2:15–2:22** — With a equal to ten, b to three and c to two, the left tree gives five and the right tree gives nine. Same string, same language, different answer.

> Caption: With a = 10, b = 3 and c = 2 the left tree gives 5 and the right tree gives 9.

Exam-trap caption mode adds: *For + and × the two trees agree, which is exactly why the trap survives practice. It shows up on − and ÷.*

**2:22–2:30** — Same language, different tree. In a syntax-directed question the tree is what is being marked, so the rewrite changes the answer even though it does not change the language.

> Caption: Same language, different tree. In a syntax-directed question the tree is what is being marked.

Exam-trap caption mode adds: *Saying "the language is unchanged, so the value is unchanged" is the single most expensive slip on this topic.*

## Scene 6. Indirect recursion hides one step further away

*2:30 – 3:00 · objective: Detect left recursion that no single rule shows, using the left-corner relation rather than a scan of each rule's first symbol.*

**2:30–2:37** — Here are two rules. No right side of S begins with S, so a scan of first symbols reports only A as left recursive.

> Caption: S → Aa | b and A → Ac | Sd | ε. No rule of S begins with S.

Exam-trap caption mode adds: *The one-step test finds immediate left recursion only. Indirect left recursion passes it.*

**2:37–2:45** — But S expands to A a, and A expands to S d, so S reaches S with d a appended. The recursion is real, one step longer than the test looks.

> Caption: But S ⇒ Aa ⇒ Sda. The recursion is real, one step longer than the test looks.

**2:45–2:52** — The left-corner relation finds it. S reaches A, A reaches S, so S reaches itself. That is the definition of left recursion.

> Caption: The left-corner relation finds it: S reaches A, A reaches S, so S reaches itself.

**2:52–3:00** — Both S and A are left recursive, and the one-step test finds only A. That is why the transformation has to be run in an order rather than rule by rule.

> Caption: Both S and A are left recursive; the one-step test finds only A.

Exam-trap caption mode adds: *Rewriting only the nonterminal the scan reported leaves the grammar left recursive through the other one.*

## Scene 7. GATE CSE 1998 Q6b: substitute first, then eliminate

*3:00 – 3:30 · objective: Run the ordered algorithm on S -> Aa | b, A -> Ac | Sd | epsilon and obtain the seven-rule answer the paper asks for.*

**3:00–3:07** — GATE CSE 1998 question six b asks for an equivalent grammar with no left recursion and the minimum number of production rules.

> Caption: GATE CSE 1998 Q6b asks for an equivalent grammar with no left recursion and the fewest rules.

Exam-trap caption mode adds: *"Equivalent" rules out the easy answers. Dropping a rule removes the recursion and changes the language.*

**3:07–3:15** — Order the nonterminals S then A. Substitute the right sides of S into A wherever a rule of A begins with S. That one rule becomes A goes to A a d and A goes to b d.

> Caption: Order the nonterminals S then A. Substitute S's right sides into A wherever a rule of A begins with S.

**3:15–3:22** — Now A begins with itself, so the direct rule applies. Two recursive alternatives, c and a d, and two base alternatives, b d and epsilon.

> Caption: A → Ac | Aad | bd | ε now begins with itself, so the direct rule applies.

Exam-trap caption mode adds: *An empty β is still a base alternative. It becomes A → A′, not nothing.*

**3:22–3:30** — The answer is seven rules: two for S, two for A, three for A prime. The model checks it against the published answer and against the original language, seventeen strings up to length five.

> Caption: The answer: S → Aa | b; A → bdA′ | A′; A′ → cA′ | adA′ | ε. Seven rules, and the language is unchanged.

Exam-trap caption mode adds: *Writing S → Aa | b | … with A's rules folded into S is a different grammar; the minimum count assumes only A is rewritten.*

## Scene 8. The recursion a one-step test misses

*3:30 – 4:00 · objective: Meet A -> B A a with B nullable, see why the direct rule does nothing to it, and remove it by substituting the nullable nonterminal first.*

**3:30–3:37** — Here A goes to B A a or c, and B goes to epsilon or b. No rule of A begins with A, so the one-step test says there is no left recursion.

> Caption: A → BAa | c with B → ε | b. No rule of A begins with A, so the one-step test says no.

**3:37–3:45** — But B derives epsilon, so A goes to A a. The recursion hides behind a nullable symbol, and the left-corner relation jumps over it.

> Caption: But B derives ε, so A ⇒ BAa ⇒ Aa. The recursion hides behind a nullable symbol.

Exam-trap caption mode adds: *This is the case that makes "no left recursion" a property of the relation, not of the shape of the rules.*

**3:45–3:52** — Substitute the right sides of B into A. The rule becomes A goes to A a, b A a, or c, and now the recursion is immediate.

> Caption: Substitute B's right sides into A: A → Aa | bAa | c. Now the recursion is immediate.

**3:52–4:00** — Then the direct rule applies, and no nonterminal is left recursive afterwards. Expose the recursion first, then remove it.

> Caption: Then the direct rule applies: A → bAaA′ | cA′, A′ → aA′ | ε.

Exam-trap caption mode adds: *Running the direct rule first does nothing here, and the grammar still loops in a predictive parser.*

## Scene 9. Left factoring: one prefix, one helper, two passes

*4:00 – 4:30 · objective: Factor a shared prefix, and see that one pass can leave another shared prefix behind, so factoring repeats to a fixed point.*

**4:00–4:07** — Three alternatives all begin with a. The first character decides nothing, so the cell for A and a holds three productions.

> Caption: A → abc | abd | ae. The first character decides nothing: all three alternatives begin with a.

Exam-trap caption mode adds: *A shared prefix is not a left recursion, and the direct rule does not touch it.*

**4:07–4:15** — Factor the longest common prefix. A goes to a b A prime, A prime goes to c or d, and the third alternative a e is kept as it is.

> Caption: Factor the longest common prefix: A → abA′, A′ → c | d, and keep A → ae.

**4:15–4:22** — One pass is not enough. A still has a e and a b A prime, which both begin with a, so factor again.

> Caption: One pass is not enough: A still has ae and abA′, which both begin with a. Factor again.

Exam-trap caption mode adds: *Factoring one prefix and stopping is the usual half-finished answer. The test is "no two alternatives share a prefix", not "I factored once".*

**4:22–4:30** — Two passes turn three productions into five, and the factored grammar has no conflict in its table. The primes record the order the passes ran, not the nesting.

> Caption: Two passes turn three productions into five: A → aA″, A″ → e | bA′, A′ → c | d.

## Scene 10. What the two transformations buy, and what they do not

*4:30 – 5:00 · objective: Show a factored grammar that still conflicts, and a grammar with neither defect that still conflicts, so both transformations are necessary and neither is sufficient.*

**4:30–4:37** — Factor the dangling else and the shared prefix is gone. Every alternative now begins differently, and there is no left recursion.

> Caption: Factor the dangling else: S → iEtSS′ | a, S′ → eS | ε. The shared prefix is gone.

**4:37–4:45** — But the table still has two entries for S prime and e: the e S rule and the empty rule. So the grammar is still not LL(1) after factoring.

> Caption: The table still has two entries in M[S′, e]: S′ → eS and S′ → ε. So it is still not LL(1).

Exam-trap caption mode adds: *Factoring removes the prefix conflict and cannot remove an ambiguity. The dangling else is ambiguous before and after.*

**4:45–4:52** — GATE CSE 2003 question sixteen asks whether removing left recursion and factoring suffices for an arbitrary grammar. The answer is no.

> Caption: GATE CSE 2003 Q16: does removing left recursion and factoring suffice for an arbitrary CFG? No.

**4:52–5:00** — Here is a grammar with neither defect that still conflicts on a, so both transformations are necessary and not sufficient. Build the table and let it decide.

> Caption: S → A | B, A → a, B → a has neither defect and still conflicts on a. Necessary, not sufficient.

Exam-trap caption mode adds: *Reading "no left recursion and no common prefix" as "LL(1)" is the mistake the 2003 question is testing.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
