# Recurrence Relations — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/recurrence-relations/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A rule that looks backwards

*0:00 – 0:30 · objective: Separate the two halves of every recurrence — the base cases that are given outright and the rule that produces the next term — and see why neither half alone determines a sequence.*

**0:00–0:07** — A recurrence relation does not hand you the term. It tells you how to reach it from the terms just before it.

> Caption: A recurrence relation does not hand you the term. It tells you how to reach it from the terms just before it.

**0:07–0:15** — Every recurrence has two halves: base cases that are given outright, and a rule that moves one step forward.

> Caption: Every recurrence has two halves: base cases that are given outright, and a rule that moves one step forward.

Exam-trap caption mode adds: *Forgetting the base cases is the first way to lose marks. A rule alone never fixes the constant that the closed form will contain.*

**0:15–0:22** — Read the notation in words: a sub n is the term at position n, and a sub n minus one is the term immediately before it.

> Caption: Read the notation in words: a sub n is the term at position n, and a sub n minus one is the term immediately before it.

**0:22–0:30** — Two recurrences can share a rule and differ only in their base cases — and then they are different sequences.

> Caption: Two recurrences can share a rule and differ only in their base cases — and then they are different sequences.

## Scene 2. Building a recurrence from a constraint

*0:30 – 1:00 · objective: Turn a counting condition on strings into a recurrence by conditioning on the last symbol, and check the resulting rule against the first few values.*

**0:30–0:37** — Count the n-bit strings with no two consecutive ones. Do not look at the whole string; look at its last bit.

> Caption: Count the n-bit strings with no two consecutive ones. Do not look at the whole string; look at its last bit.

**0:37–0:45** — If the last bit is zero, the first n minus one bits may be any valid string. That contributes a sub n minus one.

> Caption: If the last bit is zero, the first n minus one bits may be any valid string. That contributes a sub n minus one.

**0:45–0:52** — If the last bit is one, the bit before it must be zero. The first n minus two bits are then free, giving a sub n minus two.

> Caption: If the last bit is one, the bit before it must be zero. The first n minus two bits are then free, giving a sub n minus two.

**0:52–1:00** — So a sub n equals a sub n minus one plus a sub n minus two, with a sub one equal to two and a sub two equal to three.

> Caption: So a sub n equals a sub n minus one plus a sub n minus two, with a sub one equal to two and a sub two equal to three.

Exam-trap caption mode adds: *A recurrence with the right rule and wrong base cases is a different sequence. Always evaluate the first two values by hand and check that the rule reproduces them.*

## Scene 3. Unrolling and telescoping

*1:00 – 1:30 · objective: Solve a first-order recurrence by writing it out step by step until the base case, cancelling the matching terms, and summing what is left.*

**1:00–1:08** — Here the rule is a sub n equals a sub n minus one plus six n squared plus two n, with a sub one equal to eight.

> Caption: Here the rule is a sub n equals a sub n minus one plus six n squared plus two n, with a sub one equal to eight.

**1:08–1:16** — Write the rule out for every step and add the equations. The a terms cancel in pairs, leaving a sum.

> Caption: Write the rule out for every step and add the equations. The a terms cancel in pairs, leaving a sum.

**1:16–1:23** — The two sums are known: the sum of squares and the sum of first powers. Together they give a sub 99 equal to one million nine hundred eighty thousand.

> Caption: The two sums are known: the sum of squares and the sum of first powers. Together they give a sub 99 equal to one million nine hundred eighty thousand.

**1:23–1:30** — Written as K times ten to the fourth, the value is 198 times ten to the fourth, so K is 198.

> Caption: Written as K times ten to the fourth, the value is 198 times ten to the fourth, so K is 198.

Exam-trap caption mode adds: *The sum must run from the first index where the rule applies. Starting the sum at one instead of two adds a spurious six plus two and shifts the answer.*

## Scene 4. The characteristic equation

*1:30 – 2:00 · objective: Solve a second-order linear homogeneous recurrence with constant coefficients from the roots of its characteristic equation, and see that a root whose coefficient is zero contributes nothing.*

**1:30–1:38** — For a linear homogeneous recurrence with constant coefficients, try a solution of the form r to the n.

> Caption: For a linear homogeneous recurrence with constant coefficients, try a solution of the form r to the n.

**1:38–1:46** — The example is T of n equals five T of n minus one minus six T of n minus two, which becomes r squared minus five r plus six equals zero.

> Caption: The example is T of n equals five T of n minus one minus six T of n minus two, which becomes r squared minus five r plus six equals zero.

**1:46–1:53** — Two distinct roots give two independent solutions, so the general answer is A times two to the n plus B times three to the n.

> Caption: Two distinct roots give two independent solutions, so the general answer is A times two to the n plus B times three to the n.

**1:53–2:00** — Solving gives B equal to zero, so the term is exactly two to the n. The larger root contributes nothing.

> Caption: Solving gives B equal to zero, so the term is exactly two to the n. The larger root contributes nothing.

Exam-trap caption mode adds: *Never report the largest root as the answer without solving for its coefficient. The coefficient can vanish, and then the growth is set by a smaller root.*

## Scene 5. Repeated roots: why an n appears

*2:00 – 2:30 · objective: Explain the extra factor of n in the repeated-root case as the second independent solution a double root demands, not as a memorised exception.*

**2:00–2:08** — Now let the two roots coincide. T of n equals four T of n minus one minus four T of n minus two has the single root two, twice.

> Caption: Now let the two roots coincide. T of n equals four T of n minus one minus four T of n minus two has the single root two, twice.

**2:08–2:16** — One root gives one free constant, but two base cases need two. The repair is to multiply the second copy by n.

> Caption: One root gives one free constant, but two base cases need two. The repair is to multiply the second copy by n.

**2:16–2:23** — With a repeated root the solution is A plus B n, all multiplied by r to the n. Here that is one plus n, times two to the n.

> Caption: With a repeated root the solution is A plus B n, all multiplied by r to the n. Here that is one plus n, times two to the n.

**2:23–2:30** — The extra n is not decoration. It is the second independent solution that a repeated root forces you to supply.

> Caption: The extra n is not decoration. It is the second independent solution that a repeated root forces you to supply.

Exam-trap caption mode adds: *Writing only A times r to the n for a double root leaves the answer one constant short, and the two base cases cannot both be satisfied.*

## Scene 6. Change of variable: dividing out the exponential

*2:30 – 3:00 · objective: Divide a recurrence by the exponential that appears in its forcing term, reducing it to a plain first-order recurrence, and see why three sample values do not justify a guess.*

**2:30–2:38** — T of n equals two T of n minus one plus n times two to the n, with T of zero equal to one. The forcing shares the base two.

> Caption: T of n equals two T of n minus one plus n times two to the n, with T of zero equal to one. The forcing shares the base two.

**2:38–2:46** — Divide the whole equation by two to the n. Then S of n equals S of n minus one plus n, a plain first-order recurrence.

> Caption: Divide the whole equation by two to the n. Then S of n equals S of n minus one plus n, a plain first-order recurrence.

Exam-trap caption mode adds: *Dividing by n times two to the n instead of two to the n breaks the substitution: S of n minus one would then have a different denominator and the step would not cancel.*

**2:46–2:53** — Unrolling gives S of n as one plus the sum of one to n, which is quadratic. So T of n is Theta of n squared times two to the n.

> Caption: Unrolling gives S of n as one plus the sum of one to n, which is quadratic. So T of n is Theta of n squared times two to the n.

**2:53–3:00** — Three sample values are not evidence. At n equal to three the true value is fifty-six, while four to the n would give sixty-four.

> Caption: Three sample values are not evidence. At n equal to three the true value is fifty-six, while four to the n would give sixty-four.

Exam-trap caption mode adds: *Checking two or three values and pattern-matching is the single most common way to get a recurrence question wrong. Two sequences can agree on their first four terms and diverge forever.*

## Scene 7. Divide and conquer: the recursion tree

*3:00 – 3:30 · objective: Draw a divide-and-conquer recurrence as a tree whose level sums reveal the total, and state what the picture assumes before it counts as an argument.*

**3:00–3:08** — Draw T of n equals two T of n over two plus n as a tree: each node costs n, and has two children of half the size.

> Caption: Draw T of n equals two T of n over two plus n as a tree: each node costs n, and has two children of half the size.

**3:08–3:16** — Every level adds up to n, because halving the size doubles the number of nodes. The level cost is constant.

> Caption: Every level adds up to n, because halving the size doubles the number of nodes. The level cost is constant.

**3:16–3:23** — Halving reaches size one after log base two of n levels, so the total is n times log n, plus the work at the leaves.

> Caption: Halving reaches size one after log base two of n levels, so the total is n times log n, plus the work at the leaves.

**3:23–3:30** — The tree is a proof sketch, not a proof. It assumes the level cost really is constant and the sizes really do halve exactly.

> Caption: The tree is a proof sketch, not a proof. It assumes the level cost really is constant and the sizes really do halve exactly.

Exam-trap caption mode adds: *A diagram is not a derivation. State the assumption the picture makes — equal level cost — before you use the total.*

## Scene 8. The master theorem and its gap

*3:30 – 4:00 · objective: Apply the three master-theorem cases by comparing the forcing term with the watershed n to the log base b of a, and recognise the values that fall between cases.*

**3:30–3:38** — For T of n equals a T of n over b plus f of n, compare f of n with the watershed n to the log base b of a.

> Caption: For T of n equals a T of n over b plus f of n, compare f of n with the watershed n to the log base b of a.

Exam-trap caption mode adds: *The theorem needs b greater than one. A recurrence like T of n equals two T of n minus one is not divide and conquer, and the theorem says nothing about it.*

**3:38–3:46** — Forcing smaller than the watershed: the leaves dominate. Equal: multiply by log n. Larger and regular: the top dominates.

> Caption: Forcing smaller than the watershed: the leaves dominate. Equal: multiply by log n. Larger and regular: the top dominates.

**3:46–3:53** — T of n equals two T of n over two plus n log n sits between the first two cases. The plain theorem is silent.

> Caption: T of n equals two T of n over two plus n log n sits between the first two cases. The plain theorem is silent.

Exam-trap caption mode adds: *Quoting case three whenever the forcing looks bigger is wrong. Without a polynomial gap, the master theorem gives no answer at all.*

**3:53–4:00** — The extended form handles it: the answer is n times log n squared, over two. Never force a case that does not fit.

> Caption: The extended form handles it: the answer is n times log n squared, over two. Never force a case that does not fit.

## Scene 9. The growth ladder and what GATE asks

*4:00 – 4:30 · objective: Place the standard closed forms on one growth ladder, and separate a tight bound from an upper bound when the options are written with Theta and with big O.*

**4:00–4:08** — Order the standard answers: log n, then n, then n log n, then n squared, then two to the n, then n factorial.

> Caption: Order the standard answers: log n, then n, then n log n, then n squared, then two to the n, then n factorial.

**4:08–4:16** — T of n equals T of n minus one plus one is linear. T of n equals two T of n minus one plus one is exponential.

> Caption: T of n equals T of n minus one plus one is linear. T of n equals two T of n minus one plus one is exponential.

**4:16–4:23** — Base cases change the constant, and sometimes the whole answer: two T of n minus one plus n is n times two to the n.

> Caption: Base cases change the constant, and sometimes the whole answer: two T of n minus one plus n is n times two to the n.

**4:23–4:30** — A bound is not an equality. Theta is tight, big O is only an upper bound, and GATE usually asks for the tight one.

> Caption: A bound is not an equality. Theta is tight, big O is only an upper bound, and GATE usually asks for the tight one.

Exam-trap caption mode adds: *Choosing big O when a Theta option exists and is true gives away the mark: the O statement is weaker, so it is true but not the answer being sought.*

## Scene 10. The decision procedure and four traps

*4:30 – 5:00 · objective: Route any recurrence to the right method in a fixed order, name the four errors that cost marks, and finish by verifying the closed form against the base cases.*

**4:30–4:38** — Checklist: is it first order, linear with constant coefficients, or divide and conquer? Each answer picks the method.

> Caption: Checklist: is it first order, linear with constant coefficients, or divide and conquer? Each answer picks the method.

**4:38–4:45** — Trap one: assuming the largest root dominates. Trap two: forgetting the n when a root repeats.

> Caption: Trap one: assuming the largest root dominates. Trap two: forgetting the n when a root repeats.

**4:45–4:53** — Trap three: applying the master theorem inside its gap. Trap four: guessing the answer from three small values.

> Caption: Trap three: applying the master theorem inside its gap. Trap four: guessing the answer from three small values.

**4:53–5:00** — Then verify: substitute the closed form back into the recurrence, and check it reproduces both base cases.

> Caption: Then verify: substitute the closed form back into the recurrence, and check it reproduces both base cases.

Exam-trap caption mode adds: *An answer that matches a remembered formula is not verified. The remembered formula is for a different recurrence more often than candidates expect.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
