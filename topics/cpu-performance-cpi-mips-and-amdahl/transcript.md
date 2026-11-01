# CPU performance: the equation, CPI, MIPS and Amdahl's law — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/cpu-performance-cpi-mips-and-amdahl/index.html`
- Total duration: 6:12 (372 seconds), 12 scenes, 55 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. One equation, three dials

*0:00 – 0:30 · objective: State the CPU performance equation and name what sets each of its three factors.*

**0:00–0:07** — Three numbers multiplied together. That product is the whole of performance.

> Caption: Every program's running time is the product of three numbers: instructions, cycles per instruction, and the clock period.

**0:07–0:15** — The instruction count is set by software and by the instruction set.

> Caption: Instruction count comes from the program, the compiler and the instruction set.

**0:15–0:22** — Cycles per instruction, averaged over the mix that actually runs.

> Caption: CPI is the average number of clock cycles one instruction takes.

**0:22–0:30** — Multiply the three, and you are left with seconds.

> Caption: The clock period is the time of one cycle, so 2 GHz means 0.5 nanoseconds. Multiply the three and you have seconds.

## Scene 2. The clock: period and rate are reciprocals

*0:30 – 0:58 · objective: Convert between clock rate and clock period, and see why the conversion is where unit errors enter.*

**0:30–0:37** — Two billion ticks a second, half a nanosecond each.

> Caption: A 2 GHz clock ticks two billion times a second, so one cycle lasts half a nanosecond.

**0:37–0:44** — Divide a thousand by the rate in megahertz, and you have nanoseconds.

> Caption: Rate and period are reciprocals: the period in nanoseconds is 1000 divided by the rate in megahertz.

**0:44–0:51** — If the other two numbers stay put. They rarely do.

> Caption: So doubling the rate halves the period, and that alone halves the time, if the other two numbers stay put.

**0:51–0:58** — The three dials are not independent, and every technique trades one against another.

> Caption: That condition is the whole difficulty of the subject: the three dials are not independent.

## Scene 3. Average CPI from an instruction mix

*0:58 – 1:33 · objective: Compute the weighted-average CPI from class frequencies, and see why the plain average is wrong.*

**0:58–1:05** — An add and a floating-point multiply do not cost the same.

> Caption: Instructions are not equal: an ALU add may take one cycle and a floating-point multiply five.

**1:05–1:12** — Weight each class by how often it actually runs.

> Caption: Weight each class by its share of the executed instructions: 50% at 1 cycle, 25% at 2, 15% at 3, 10% at 5.

**1:12–1:19** — One point nine five cycles per instruction, from the weighted sum.

> Caption: The weighted sum is 0.5 + 0.5 + 0.45 + 0.5 = 1.95 cycles per instruction.

**1:19–1:26** — The plain average of the four is wrong, because the four are not equally frequent.

> Caption: That is the only correct average. Averaging the four CPIs to 2.75 ignores how often each class runs.

Exam-trap caption mode adds: *Averaging the class CPIs without their frequencies is the standard trap. CPI is always a weighted average over the executed mix.*

**1:26–1:33** — One point nine five million cycles, and three quarters of a millisecond.

> Caption: One million instructions at 1.95 cycles each is 1.95 million cycles, and at 2 GHz that is 0.975 milliseconds.

## Scene 4. Two machines, same program

*1:33 – 2:06 · objective: Compare two machines by execution time, and see a faster clock lose.*

**1:33–1:39** — Machine A: two gigahertz, one point nine five cycles per instruction.

> Caption: Machine A runs at 2 GHz with the CPI of 1.95 just computed: 0.975 milliseconds.

**1:39–1:46** — Machine B has the faster clock, but pays in instructions and cycles.

> Caption: Machine B has a faster clock, 3 GHz, but its compiler emits 30% more instructions and its CPI is 2.4.

**1:46–1:52** — One point zero four milliseconds. The faster clock finished later.

> Caption: Machine B needs 1.04 milliseconds, so the faster clock lost: 50% more frequency, 6.7% longer run.

Exam-trap caption mode adds: *A question that gives only clock rates cannot be answered. Ask for the instruction count and the CPI, or say the comparison is not determined.*

**1:52–1:59** — Compute the product, or do not answer.

> Caption: So 'which is faster' is never answered by the clock rate. Compute the product, or do not answer.

**1:59–2:06** — Every number here is recomputed, not remembered.

> Caption: Both machines are checked in code: the cycle counts, the times, the ratio, and the direction of the conclusion.

## Scene 5. MIPS, and three ways it misleads

*2:06 – 2:42 · objective: Compute MIPS from the equation, then name the three conditions under which it can compare machines.*

**2:06–2:12** — Millions of instructions per second, or the clock rate over CPI in millions.

> Caption: MIPS is millions of instructions per second: the instruction count divided by the time, in millions.

**2:12–2:18** — B wins on MIPS and loses on time.

> Caption: Machine A reads 1026 MIPS and machine B reads 1250 MIPS. B wins on MIPS and loses on time.

Exam-trap caption mode adds: *If a question offers a higher MIPS as evidence of a faster machine, the evidence is inadmissible unless the program, the ISA and the compiler are identical.*

**2:18–2:24** — MIPS counts instructions, not work.

> Caption: First failure: MIPS ignores what an instruction does. Powerful instructions mean fewer of them per second and a shorter run.

**2:24–2:30** — One machine, two programs, two MIPS numbers.

> Caption: Second failure: MIPS varies between programs on the same machine, because CPI varies with the mix.

**2:30–2:36** — Valid only for the same program, the same ISA, the same compiler.

> Caption: Third failure: MIPS can move opposite to performance, which is exactly what A and B did.

**2:36–2:42** — A rate averages harmonically. The plain mean overstates it.

> Caption: Averaging MIPS across programs needs the harmonic mean, not the arithmetic mean, because a rate is being averaged.

## Scene 6. Speedup, and the percentage trap

*2:42 – 3:10 · objective: Define speedup as a ratio of times and convert correctly between 'faster by' and 'less time'.*

**2:42–2:49** — Old time over new time. A ratio of times.

> Caption: Speedup is the old time divided by the new time: a ratio of times, never a ratio of frequencies.

**2:49–2:56** — Twenty percent faster is sixteen point seven percent less time.

> Caption: A machine that runs 20% faster has speedup 1.2, so its time is 0.833 of the old, a 16.7% reduction and not 20%.

Exam-trap caption mode adds: *'20% faster' and '20% less time' are different claims. Decide which one the question made before computing.*

**2:56–3:03** — A time cut by a fifth is a speedup of one and a quarter.

> Caption: A time cut by 20% is a speedup of 1.25, because one divided by 0.8 is 1.25.

**3:03–3:10** — Write down which one you were given, before any arithmetic.

> Caption: Write down which of the two the question gave you before doing any arithmetic.

## Scene 7. Amdahl's law: the part you did not improve

*3:10 – 3:45 · objective: Derive the Amdahl speedup from a two-part time decomposition, and read its ceiling.*

**3:10–3:17** — Sixty percent of the time is improvable, and it becomes four times faster.

> Caption: Suppose 60% of the time is spent in the part you can speed up, and you make that part four times faster.

**3:17–3:24** — Point five five of the old time, so one point eight one eight times faster.

> Caption: The other 40% is untouched. The new time is 0.4 + 0.6/4 = 0.55 of the old, so the speedup is 1.818.

**3:24–3:31** — However good the improvement, one over zero point four is the ceiling: two and a half.

> Caption: Push the improved part to infinity and the speedup stops at 1/0.4 = 2.5. That is the ceiling.

Exam-trap caption mode adds: *The ceiling depends only on the unimproved fraction. A question that asks for the maximum possible speedup is asking for 1/(1-p) and nothing else.*

**3:31–3:38** — One over the unimproved fraction plus the improved fraction over its speedup.

> Caption: The formula is one over ((1 - p) + p/s): the unimproved fraction plus the improved fraction divided by its speedup.

**3:38–3:45** — The fraction is a fraction of time. Not of code.

> Caption: p is the fraction of time, not of code and not of instructions.

Exam-trap caption mode adds: *A part that is 30% of the instructions can be 60% of the time. Convert with CPI before applying the law.*

## Scene 8. Amdahl backwards: what speedup do I need?

*3:45 – 4:15 · objective: Solve Amdahl's law for the local speedup, and decide feasibility before doing the algebra.*

**3:45–3:52** — Target two, ninety percent improvable. Solve for the local speedup.

> Caption: Questions often give the target overall speedup and ask for the local one. With 90% of the time improvable and a target of 2, solve 2 = 1/(0.1 + 0.9/s).

**3:52–4:00** — More than twice as fast, not twice.

> Caption: That gives s = 2.25: the improved part must be more than twice as fast, not twice.

**4:00–4:07** — A target above the ceiling has no solution. Say so.

> Caption: And if the target exceeds 1/(1-p), no speedup achieves it. With p = 0.6 the ceiling is 2.5, so a target of 3 is impossible.

Exam-trap caption mode adds: *An impossible target is a legitimate question with a legitimate answer: no finite speedup achieves it. Do not force an algebraic solution into existence.*

**4:07–4:15** — Feasibility first. Then the algebra.

> Caption: Check feasibility first, then solve. That order saves the algebra and catches the impossible question.

## Scene 9. Where the cycles go: stall cycles

*4:15 – 4:48 · objective: Split CPI into ideal cycles plus stall cycles, and use the cache miss rate to compute the stalls.*

**4:15–4:21** — Ideal cycles, plus the cycles lost waiting.

> Caption: A real CPI is the ideal CPI plus the cycles lost waiting. Memory stalls per instruction are the miss rate times the miss penalty in cycles.

**4:21–4:28** — One point eight stall cycles, on top of one point two ideal. CPI three.

> Caption: Base CPI 1.2, miss rate 3%, penalty 60 cycles: 1.8 stall cycles per instruction, so the CPI is 3.0.

**4:28–4:34** — One and a half milliseconds becomes zero point six. Two and a half times.

> Caption: A perfect cache would give CPI 1.2, and the time would fall from 1.5 to 0.6 milliseconds, a speedup of 2.5.

**4:34–4:41** — To reach CPI two, the miss rate must fall to one and a third percent.

> Caption: Turned around: to reach CPI 2.0 the miss rate must fall to 1.33%. That is the arithmetic a cache question is really asking.

**4:41–4:48** — Same equation. One number replaced.

> Caption: This is the same equation as before with one number replaced. Nothing new is introduced, only measured.

## Scene 10. The pipeline is the same equation with a smaller CPI

*4:48 – 5:16 · objective: Read pipeline speedup as a CPI argument, and see a clock-rate gain cancelled by a CPI loss.*

**4:48–4:55** — Ideal speedup is the number of stages.

> Caption: A k-stage pipeline has an ideal speedup of k, because it issues one instruction per cycle instead of one per k cycles.

**4:55–5:02** — Five over one point two: about four point one seven.

> Caption: Stalls raise the CPI: five stages with 0.2 stall cycles per instruction give CPI 1.2 and a speedup near 5/1.2 = 4.17.

**5:02–5:09** — Twice the frequency and twice the cycles: no gain at all.

> Caption: Doubling the clock rate while doubling the CPI leaves the time unchanged: speedup 1, for twice the frequency.

Exam-trap caption mode adds: *A question that offers a doubled clock rate and a doubled CPI has a definite answer: no speedup. Do not report a gain from the frequency alone.*

**5:09–5:16** — Deeper pipelining buys frequency and spends CPI.

> Caption: So the three dials trade against each other: deeper pipelining buys frequency and spends CPI.

## Scene 11. The procedure, and the four numbers that get confused

*5:16 – 5:46 · objective: Fix a four-step procedure for any performance question, and separate the four numbers that get confused.*

**5:16–5:22** — Write the three quantities with units, and convert the frequency first.

> Caption: Step one: write the three quantities the question gives, with units. Frequency is not time, so convert it.

**5:22–5:28** — Weight the mix, or divide total cycles by the count. Then check the other way.

> Caption: Step two: if the question gives a mix, weight the CPIs. If it gives total cycles, divide by the instruction count.

**5:28–5:34** — Keep the powers of ten explicit.

> Caption: Step three: multiply, and keep the powers of ten straight. A nanosecond is 10^-9 seconds and a millisecond is 10^-3.

**5:34–5:40** — Answer the number that was asked for, not the one you computed.

> Caption: Step four: answer the number that was asked for. Execution time, CPI, MIPS and speedup are four different answers.

Exam-trap caption mode adds: *Unit and quantity slips lose more marks in this topic than conceptual errors. Write the units at every step and re-read what was asked.*

**5:40–5:46** — Two bounds catch most arithmetic slips.

> Caption: Check the answer against the bounds: a speedup cannot exceed the ceiling, and a CPI cannot be below one for a scalar pipeline.

## Scene 12. One equation, four consequences

*5:46 – 6:12 · objective: Consolidate the equation, the speedup ratio, the Amdahl ceiling and the status of MIPS.*

**5:46–5:52** — One equation, three dials.

> Caption: One equation, three dials: instructions, cycles per instruction, clock period.

**5:52–5:59** — Speedup is a ratio of times, capped by the unimproved fraction.

> Caption: Speedup is a ratio of times. Amdahl caps it at one over the unimproved fraction.

**5:59–6:05** — MIPS is throughput, not speed.

> Caption: MIPS is not a measure of speed. It measures instruction throughput under fixed program, ISA and compiler.

**6:05–6:12** — Every other topic is an argument about which dial it moves.

> Caption: Everything else in the subject, cache and pipeline and compiler, is an argument about which dial it moves.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
