# Two-Level Cache Arithmetic: AMAT as a Weighted Average, Local vs Global Miss Rate, and CPI Stalls — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/two-level-cache-amat-and-cpi/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Three levels, three outcomes

*0:00 – 0:30 · objective: Read one memory access as a partition into three mutually exclusive outcomes — L1 hit, L1 miss and L2 hit, both miss — and attach a probability and a cost to each.*

**0:00–0:07** — A two-level cache answers every access in exactly one of three ways.

> Caption: A two-level cache answers every access in exactly one of three ways.

**0:07–0:15** — Case one is an L1 hit: probability 0.90, cost 1 cycle, and nothing below is touched.

> Caption: Case one is an L1 hit: probability 0.90, cost 1 cycle, and nothing below is touched.

**0:15–0:22** — Case two is an L1 miss and an L2 hit: 0.10 times 0.75 is 0.075 of all accesses, costing 1 plus 8 cycles.

> Caption: Case two is an L1 miss and an L2 hit: 0.10 times 0.75 is 0.075 of all accesses, costing 1 plus 8 cycles.

**0:22–0:30** — Case three is a miss in both: 0.10 times 0.25 is 0.025, costing 1 plus 8 plus 100 cycles.

> Caption: Case three is a miss in both: 0.10 times 0.25 is 0.025, costing 1 plus 8 plus 100 cycles.

## Scene 2. AMAT is a weighted average that factors

*0:30 – 1:00 · objective: Compute the average from the three outcomes, then regroup the same sum into T1 + m1 T2 + m1 m2 T3, and see that the m2-only form is a different, wrong number.*

**0:30–0:37** — The average is the weighted sum of the three costs: 4.3 cycles per access.

> Caption: The average is the weighted sum of the three costs: 4.3 cycles per access.

**0:37–0:45** — Regrouping the same sum gives T1 plus m1 T2 plus m1 m2 T3, which is still 4.3.

> Caption: Regrouping the same sum gives T1 plus m1 T2 plus m1 m2 T3, which is still 4.3.

**0:45–0:52** — The factored form is an identity, not a shortcut: it is the same sum regrouped.

> Caption: The factored form is an identity, not a shortcut: it is the same sum regrouped.

**0:52–1:00** — The common wrong form uses m2 alone in the last term: 26.8 cycles instead of 4.3.

> Caption: The common wrong form uses m2 alone in the last term: 26.8 cycles instead of 4.3.

Exam-trap caption mode adds: *If an option is several times the size of the others, check whether a local miss rate was used where the product belongs.*

## Scene 3. Which time does the question give you?

*1:00 – 1:30 · objective: Distinguish a level's own access time from a time that already includes the levels above it, and use the right of the two readings on the GATE CSE 2025 Set 1 numbers.*

**1:00–1:07** — A question may print each level's own access time, or a time that already includes the levels above.

> Caption: A question may print each level's own access time, or a time that already includes the levels above.

**1:07–1:15** — GATE CSE 2025 Set 1 prints 10, 20 and 200 nanoseconds, each already including the miss penalty of the levels above.

> Caption: GATE CSE 2025 Set 1 prints 10, 20 and 200 nanoseconds, each already including the miss penalty of the levels above.

**1:15–1:22** — Weighting those three path costs gives 11.85 nanoseconds, which is inside the official key.

> Caption: Weighting those three path costs gives 11.85 nanoseconds, which is inside the official key.

**1:22–1:30** — Adding 20 and 200 as if they were extra penalties gives 12.5, the value the key rejects.

> Caption: Adding 20 and 200 as if they were extra penalties gives 12.5, the value the key rejects.

Exam-trap caption mode adds: *Inclusive times must be differenced before they are weighted; own times must be added along the path.*

## Scene 4. Local and global miss rate

*1:30 – 2:00 · objective: Divide by the right denominator: a local miss rate divides by the accesses that reached that level, a global one by all L1 accesses, and the two differ by the factor m1.*

**1:30–1:37** — A local miss rate divides by the accesses that reached that level; a global one divides by all L1 accesses.

> Caption: A local miss rate divides by the accesses that reached that level; a global one divides by all L1 accesses.

**1:37–1:45** — GATE CSE 2017 Set 1: 1.4 memory accesses per instruction, so 1,400 accesses per 1,000 instructions.

> Caption: GATE CSE 2017 Set 1: 1.4 memory accesses per instruction, so 1,400 accesses per 1,000 instructions.

**1:45–1:52** — L1 misses 10 per cent of 1,400, which is 140; L2 misses 7 of those 140, so its local miss rate is 0.05.

> Caption: L1 misses 10 per cent of 1,400, which is 140; L2 misses 7 of those 140, so its local miss rate is 0.05.

**1:52–2:00** — Its global miss rate is 0.05 times 0.10, which is 0.005: one access in 200.

> Caption: Its global miss rate is 0.05 times 0.10, which is 0.005: one access in 200.

Exam-trap caption mode adds: *A "misses per 1000 instructions" figure is a count; dividing it by the instruction count gives neither rate.*

## Scene 5. Solving backwards for the miss rate

*2:00 – 2:30 · objective: Treat the identity as an equation when the average is given, solve the quadratic that results, and reject the root that is not a rate.*

**2:00–2:07** — When the average is given and the miss rate is not, the identity becomes an equation to solve.

> Caption: When the average is given and the miss rate is not, the identity becomes an equation to solve.

**2:07–2:15** — GATE CSE 2017 Set 2: L1 access 1 cycle, L2 access 8, main memory penalty 18, and L1 misses twice as often as L2.

> Caption: GATE CSE 2017 Set 2: L1 access 1 cycle, L2 access 8, main memory penalty 18, and L1 misses twice as often as L2.

**2:15–2:22** — That is 9x squared plus 8x minus 1 equals 0, whose roots are one ninth and minus one.

> Caption: That is 9x squared plus 8x minus 1 equals 0, whose roots are one ninth and minus one.

**2:22–2:30** — A rate cannot be negative, so the L1 miss rate is 0.111 and the L2 miss rate is 0.056.

> Caption: A rate cannot be negative, so the L1 miss rate is 0.111 and the L2 miss rate is 0.056.

Exam-trap caption mode adds: *Every quadratic in a cache question has a negative root; it is never the answer.*

## Scene 6. Hierarchical and simultaneous access

*2:30 – 3:00 · objective: Separate the two hardware conventions: levels tried in turn add their times along the path, levels searched together are charged the whole hit time; the same data gives 13.0 and 12.8.*

**2:30–2:37** — Hierarchical access means the levels are tried in turn, so the times add along the path.

> Caption: Hierarchical access means the levels are tried in turn, so the times add along the path.

**2:37–2:45** — GATE CSE 2016: 1 plus 0.2 times 10 plus 0.2 times 0.1 times 500 is 13.0 nanoseconds.

> Caption: GATE CSE 2016: 1 plus 0.2 times 10 plus 0.2 times 0.1 times 500 is 13.0 nanoseconds.

**2:45–2:52** — Simultaneous access searches the levels together, so a hit in L1 costs only the L1 time.

> Caption: Simultaneous access searches the levels together, so a hit in L1 costs only the L1 time.

**2:52–3:00** — So the same data gives 13.0 or 12.8 depending on one sentence in the question.

> Caption: So the same data gives 13.0 or 12.8 depending on one sentence in the question.

Exam-trap caption mode adds: *The pair 13.0 and 12.8 in one option list is a signal that the convention is the question.*

## Scene 7. From AMAT to CPI

*3:00 – 3:30 · objective: Convert a per-access cost into a per-instruction cost: stall cycles per instruction is accesses per instruction times the extra cost of one access, and the extra cost needs the base CPI assumption stated.*

**3:00–3:07** — A processor is measured in cycles per instruction, so a per-access cost has to be converted.

> Caption: A processor is measured in cycles per instruction, so a per-access cost has to be converted.

**3:07–3:15** — Stall cycles per instruction is memory accesses per instruction times the extra cost of one access.

> Caption: Stall cycles per instruction is memory accesses per instruction times the extra cost of one access.

**3:15–3:22** — With 1.4 accesses per instruction, the stalls are 1.4 times 3.3, which is 4.62 cycles.

> Caption: With 1.4 accesses per instruction, the stalls are 1.4 times 3.3, which is 4.62 cycles.

**3:22–3:30** — Added to a base CPI of 1.0, the CPI is 5.62: one cycle of work became five and a half.

> Caption: Added to a base CPI of 1.0, the CPI is 5.62: one cycle of work became five and a half.

## Scene 8. Which level should you improve?

*3:30 – 4:00 · objective: Price two upgrades with the same arithmetic and see that halving the L1 miss rate buys more than halving the L2 local miss rate, because every L1 miss multiplies everything below it.*

**3:30–3:37** — Halving the L1 miss rate gives an average of 2.65 cycles and a CPI of 3.31, a speedup of 1.70.

> Caption: Halving the L1 miss rate gives an average of 2.65 cycles and a CPI of 3.31, a speedup of 1.70.

**3:37–3:45** — Halving the L2 local miss rate instead gives 3.05 cycles and a CPI of 3.87, a speedup of 1.45.

> Caption: Halving the L2 local miss rate instead gives 3.05 cycles and a CPI of 3.87, a speedup of 1.45.

**3:45–3:52** — The inner level wins because every L1 miss multiplies the cost of everything below it.

> Caption: The inner level wins because every L1 miss multiplies the cost of everything below it.

**3:52–4:00** — Neither change halves the time, because the base CPI stays; that is Amdahl's argument in one line.

> Caption: Neither change halves the time, because the base CPI stays; that is Amdahl's argument in one line.

## Scene 9. Four traps, each with its number

*4:00 – 4:30 · objective: Name the four substitutions that produce a wrong option on a two-level cache question, and give the counterexample that separates each from the right reading.*

**4:00–4:07** — Trap one: using m2 where the product m1 m2 belongs gives 26.8 instead of 4.3.

> Caption: Trap one: using m2 where the product m1 m2 belongs gives 26.8 instead of 4.3.

**4:07–4:15** — Trap two: adding a time that already includes the level above gives 12.5 instead of 11.85.

> Caption: Trap two: adding a time that already includes the level above gives 12.5 instead of 11.85.

**4:15–4:22** — Trap three: quoting a global miss rate as the local one changes the answer by the factor m1.

> Caption: Trap three: quoting a global miss rate as the local one changes the answer by the factor m1.

**4:22–4:30** — Trap four: treating the average access time as a per-instruction cost, which is wrong by the accesses-per-instruction factor.

> Caption: Trap four: treating the average access time as a per-instruction cost, which is wrong by the accesses-per-instruction factor.

Exam-trap caption mode adds: *Cycles per access and cycles per instruction differ by the accesses-per-instruction figure; label every line.*

## Scene 10. How GATE asks it

*4:30 – 5:00 · objective: Read four previous-year questions as one procedure: fix the partition, fix the convention, fix the unit, then weight.*

**4:30–4:37** — Every one of these questions is the same partition, with different numbers printed.

> Caption: Every one of these questions is the same partition, with different numbers printed.

**4:37–4:45** — First read which time is given: a level's own time, or a time that already contains the levels above.

> Caption: First read which time is given: a level's own time, or a time that already contains the levels above.

**4:45–4:52** — Second read the denominator of every rate, and whether the unit is cycles, nanoseconds, or per instruction.

> Caption: Second read the denominator of every rate, and whether the unit is cycles, nanoseconds, or per instruction.

**4:52–5:00** — Then write the three outcomes, weight them, and only afterwards look at the options.

> Caption: Then write the three outcomes, weight them, and only afterwards look at the options.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
