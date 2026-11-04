# Loop Optimisation: Strength Reduction, Loop-Invariant Code Motion, Induction Variables and Unrolling — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/loop-optimisation-strength-reduction-and-code-motion/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. One loop, four rewrites

*0:00 – 0:30 · objective: See why the loop is where optimisation is spent, read the five-instruction loop the whole lesson rewrites, and name the four transformations.*

**0:00–0:07** — A program spends nearly all its time in a few loops, so the optimiser spends nearly all its effort there.

> Caption: A program spends nearly all its time in a few loops, so the optimiser spends nearly all its effort there.

**0:07–0:15** — Here is the loop this page rewrites: an index scaled by four, an array read, a running sum, a counter and a test.

> Caption: Here is the loop this page rewrites: an index scaled by four, an array read, a running sum, a counter and a test.

**0:15–0:22** — Four rewrites act on it: strength reduction, loop-invariant code motion, induction variable elimination and unrolling.

> Caption: Four rewrites act on it: strength reduction, loop-invariant code motion, induction variable elimination and unrolling.

**0:22–0:30** — The ledger for n iterations starts at two n multiplies and three n adds — five arithmetic operations per iteration.

> Caption: The ledger for n iterations starts at 2n multiplies and 3n adds — five arithmetic operations per iteration.

## Scene 2. Strength reduction: the index multiply becomes an add

*0:30 – 1:00 · objective: Replace t1 = 4 * i by a running t1 = t1 + 4 initialised before the loop, check the eight values are identical, and count the index multiplies n to 0.*

**0:30–0:37** — t1 equals four times i is a multiply whose right operand never changes. That is what makes it a candidate.

> Caption: t1 = 4 * i is a multiply whose right operand never changes. That is what makes it a candidate.

**0:37–0:45** — Set t1 to zero before the loop and replace the multiply by t1 equals t1 plus four. The eight values are identical.

> Caption: Set t1 = 0 before the loop and replace the multiply by t1 = t1 + 4. The eight values are identical.

**0:45–0:52** — The index multiplies fall from n to zero, and the adds rise from three n to four n. The arithmetic total does not move.

> Caption: The index multiplies fall from n to 0, and the adds rise from 3n to 4n. The arithmetic total does not move.

Exam-trap caption mode adds: *Strength reduction reduces the cost of an operation, not the number of instructions. A question that asks for the instruction count will not see a saving.*

**0:52–1:00** — The rule: an induction variable is one that steps by a constant, and its affine use can always be replaced by a running total.

> Caption: The rule: an induction variable is one that steps by a constant, and its affine use can always be replaced by a running total.

## Scene 3. Where strength reduction is allowed to be applied

*1:00 – 1:30 · objective: State the two conditions — an invariant multiplier and a constant stride — break the second with a loop that doubles i, and see why x * 2 to x << 1 is not a safe rewrite in C.*

**1:00–1:07** — Two conditions licence the rewrite: the multiplier must be loop-invariant, and the stride of the induction variable must be constant.

> Caption: Two conditions licence the rewrite: the multiplier must be loop-invariant, and the stride of the induction variable must be constant.

**1:07–1:15** — Break the stride: if the body doubles i, the running add gives zero, four, eight, twelve, sixteen where the multiply gives zero, four, eight, sixteen, thirty-two.

> Caption: Break the stride: if the body doubles i, the running add gives 0, 4, 8, 12, 16 where the multiply gives 0, 4, 8, 16, 32.

**1:15–1:22** — A multiplier that is not a power of two still works: multiplying by seven becomes adding seven.

> Caption: A multiplier that is not a power of two still works: multiplying by seven becomes adding seven.

**1:22–1:30** — But x times two to x shifted left by one is not a legal rewrite in C when x can be negative: shifting a negative value is undefined.

> Caption: But x * 2 to x << 1 is not a legal rewrite in C when x can be negative: shifting a negative value is undefined.

Exam-trap caption mode adds: *The arithmetic agreeing is not the standard permitting it. On signed values the shift needs a non-negativity proof; on unsigned values it is fine.*

## Scene 4. Loop-invariant code motion: move the work to the preheader

*1:30 – 2:00 · objective: Hoist the invariant t3 = b * c into the preheader, count the multiplies 2n to n + 1, and state the two conditions that license the move.*

**1:30–1:37** — Now the second rewrite. t3 equals b times c sits in the body and produces the same value on every iteration.

> Caption: Now the second rewrite. t3 = b * c sits in the body and produces the same value on every iteration.

**1:37–1:45** — Move it to the preheader, the block that runs once before the loop. The multiplies fall from two n to n plus one.

> Caption: Move it to the preheader, the block that runs once before the loop. The multiplies fall from 2n to n + 1.

**1:45–1:52** — Two conditions: every operand must be invariant, and the moved definition must reach every exit of the loop.

> Caption: Two conditions: every operand must be invariant, and the moved definition must reach every exit of the loop.

**1:52–2:00** — The saving is real but bounded: one multiply saved per iteration, and nothing else in the loop changes.

> Caption: The saving is real but bounded: one multiply saved per iteration, and nothing else in the loop changes.

## Scene 5. Two ways loop-invariant code motion breaks a program

*2:00 – 2:30 · objective: Break invariance with an operand written in the loop (55 becomes 5) and break a zero-trip loop with a faulting expression (0 divisions becomes 1 division by zero).*

**2:00–2:07** — First failure: an operand that the loop writes. Here the loop does x equals x plus one, so x times x is not invariant.

> Caption: First failure: an operand that the loop writes. Here the loop does x = x + 1, so x * x is not invariant.

**2:07–2:15** — Second failure: a loop that runs zero times. Hoisting one hundred divided by y out of it executes a division that the original never executed.

> Caption: Second failure: a loop that runs zero times. Hoisting 100 / y out of it executes a division that the original never executed.

Exam-trap caption mode adds: *Zero-trip loops are the standard counterexample to code motion. Any expression that can fault, trap or call must be guarded before it is hoisted.*

**2:15–2:22** — The repair is a guard: hoist only if the loop is known to run at least once, or move the value into an if that tests the trip count.

> Caption: The repair is a guard: hoist only if the loop is known to run at least once, or move the value into an if that tests the trip count.

**2:22–2:30** — And a third cost, not a failure: the hoisted value stays live across the whole loop, so it may occupy a register for n iterations.

> Caption: And a third cost, not a failure: the hoisted value stays live across the whole loop, so it may occupy a register for n iterations.

## Scene 6. Induction variable elimination: remove i from the loop

*2:30 – 3:00 · objective: Rewrite the test as t1 < limit, watch i become dead, count the adds 4n to 3n and the loop-carried variables three to two, then find the overflow that the rewrite can introduce.*

**2:30–2:37** — After strength reduction, i is used for exactly two things: stepping t1, and the test i less than n.

> Caption: After strength reduction, i is used for exactly two things: stepping t1, and the test i < n.

**2:37–2:45** — Rewrite the test as t1 less than limit with limit equal to four n in the preheader. Then i has no uses, and the increment is deleted.

> Caption: Rewrite the test as t1 < limit with limit = 4 * n in the preheader. Then i has no uses, and the increment is deleted.

**2:45–2:52** — The deleted increment is not dead code elimination done first: the rewrite is what makes i dead, and then the deletion is trivial.

> Caption: The deleted increment is not dead code elimination done first: the rewrite is what makes i dead, and then the deletion is trivial.

Exam-trap caption mode adds: *Naming the optimisations in order is the usual mistake. Induction variable elimination rewrites the test, and only then does the counter become dead.*

**2:52–3:00** — The boundary: four times n can overflow where i less than n could not, so the rewrite is not free at the edge of the machine word.

> Caption: The boundary: 4 * n can overflow where i < n could not, so the rewrite is not free at the edge of the machine word.

## Scene 7. Unrolling by four: fewer tests, same work

*3:00 – 3:30 · objective: Replicate the body four times and see the tests fall from n to n/4 for n = 8 and to 4 for n = 10, with the body work unchanged and a remainder loop needed.*

**3:00–3:07** — The fourth rewrite does not remove work. It removes tests: replicate the body four times and test once.

> Caption: The fourth rewrite does not remove work. It removes tests: replicate the body four times and test once.

**3:07–3:15** — For n equal to eight the tests fall from eight to two. For n equal to ten they fall from ten to four.

> Caption: For n equal to eight the tests fall from 8 to 2. For n equal to ten they fall from 10 to 4.

**3:15–3:22** — A remainder loop is not optional: without it the last n mod four iterations are silently dropped.

> Caption: A remainder loop is not optional: without it the last n mod 4 iterations are silently dropped.

**3:22–3:30** — The trade is body size against test count, and past a point the larger body costs more in the instruction cache than it saves.

> Caption: The trade is body size against test count, and past a point the larger body costs more in the instruction cache than it saves.

## Scene 8. The ledger: what each rewrite actually saved

*3:30 – 4:00 · objective: Hold the four versions side by side: 5n, 4n + 1, 4n + 1 and 3n + 2 arithmetic operations, and see that strength reduction and code motion reach the same total by different routes.*

**3:30–3:37** — Four versions, one ledger. Arithmetic operations for n iterations: five n, then four n plus one, four n plus one, and three n plus two.

> Caption: Four versions, one ledger. Arithmetic operations for n iterations: 5n, then 4n + 1, 4n + 1, and 3n + 2.

**3:37–3:45** — Versions one and two reach the same total by different routes: one removes a multiply, the other turns it into an add.

> Caption: Versions one and two reach the same total by different routes: one removes a multiply, the other turns it into an add.

Exam-trap caption mode adds: *If a question asks for the number of multiplications, strength reduction looks like a large win. If it asks for the number of operations, it is worth nothing.*

**3:45–3:52** — Only the third rewrite removes an operation outright: the increment disappears with i, saving exactly n adds.

> Caption: Only the third rewrite removes an operation outright: the increment disappears with i, saving exactly n adds.

**3:52–4:00** — The loads and the tests never move: no rewrite here removes an array access or a branch except unrolling.

> Caption: The loads and the tests never move: no rewrite here removes an array access or a branch except unrolling.

## Scene 9. Reading the two question shapes

*4:00 – 4:30 · objective: Work the GATE 2006 classification item by searching for a definition inside the loop, and the GATE 2021 count item as 303 additions and 2 dereferences.*

**4:00–4:07** — Shape one, from GATE two thousand six: a loop is printed and four optimisations are named, and one of them has no scope.

> Caption: Shape one, from GATE CSE 2006: a loop is printed and four optimisations are named, and one of them has no scope.

**4:07–4:15** — There is invariance, there is a repeated subexpression, there is a multiply to reduce, and there is no dead code — so the false option is dead code elimination.

> Caption: There is invariance, there is a repeated subexpression, there is a multiply to reduce, and there is no dead code — so the false option is dead code elimination.

**4:15–4:22** — Shape two, from GATE CSE twenty twenty-one, Set two: count the additions and the dereferences after common subexpression elimination.

> Caption: Shape two, from GATE CSE 2021 Set 2: count the additions and the dereferences after common subexpression elimination.

**4:22–4:30** — Both shapes reward the same habit: count what is inside the loop, and check separately what moved outside it.

> Caption: Both shapes reward the same habit: count what is inside the loop, and check separately what moved outside it.

## Scene 10. The procedure and the five traps

*4:30 – 5:00 · objective: Reduce the page to one four-step procedure — find the invariant, find the induction variable, check what the rewrite can make dead, check what it makes unsafe — and name the five traps.*

**4:30–4:37** — Step one: find the invariants. Step two: find the induction variables and their strides.

> Caption: Step one: find the invariants. Step two: find the induction variables and their strides.

**4:37–4:45** — Step three: ask what the rewrite makes dead. Step four: ask what it makes unsafe.

> Caption: Step three: ask what the rewrite makes dead. Step four: ask what it makes unsafe.

**4:45–4:52** — The five traps: instruction count against cost, zero-trip loops, naming the optimisations in the wrong order, overflow, and signed shifts.

> Caption: The five traps: instruction count against cost, zero-trip loops, naming the optimisations in the wrong order, overflow, and signed shifts.

**4:52–5:00** — None of this is in the syllabus as a heading. It is what the word local, in local optimisation, is measured against.

> Caption: None of this is in the syllabus as a heading. It is what the word local, in local optimisation, is measured against.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
