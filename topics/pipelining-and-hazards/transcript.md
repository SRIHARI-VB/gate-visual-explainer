# Pipelining and Hazards — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/pipelining-and-hazards/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Two clocks: latency and throughput

*0:00 – 0:30 · objective: Separate the time one instruction takes from the rate at which instructions finish, and see why k stages finish n instructions in k + n - 1 cycles rather than k times n.*

**0:00–0:07** — One instruction still takes k cycles. What the pipeline changes is how often one finishes.

> Caption: One instruction still takes k cycles. What the pipeline changes is how often one finishes.

Exam-trap caption mode adds: *The commonest error on this topic is to say "a k-stage pipeline makes each instruction k times faster". No single instruction is faster at all. Only the rate improves.*

**0:07–0:15** — Fill the pipe once, then one instruction leaves every cycle: k plus n minus 1 cycles for n instructions.

> Caption: Fill the pipe once, then one instruction leaves every cycle: k plus n minus 1 cycles for n instructions.

Exam-trap caption mode adds: *k times n is wrong, and k + n is off by one. Count the first instruction's k cycles, then add one cycle for each of the other n - 1.*

**0:15–0:22** — The diagonal is the pipeline: each row is one instruction, each column one cycle, and every stage busy every cycle after the fill.

> Caption: The diagonal is the pipeline: each row is one instruction, each column one cycle, and every stage busy every cycle after the fill.

Exam-trap caption mode adds: *Reading the diagram by rows hides the overlap; reading it by columns shows it. When a question gives a cycle diagram, count columns, not cells.*

**0:22–0:30** — The 2023 paper: stages of 10, 20 and 14 nanoseconds, 100 instructions. The beat is 20, and 3 plus 99 is 102 cycles.

> Caption: The 2023 paper: stages of 10, 20 and 14 nanoseconds, 100 instructions. The beat is 20, and 3 plus 99 is 102 cycles.

Exam-trap caption mode adds: *Do not add the three delays. Only the largest one becomes the clock period; the other two are idle waiting, and that idleness is the pipeline's cost, not its time.*

## Scene 2. The clock beat is the slowest stage

*0:30 – 1:00 · objective: Read a pipeline clock period off its stage delays as the maximum plus the latch delay, and see why the slowest stage sets the beat for everyone.*

**0:30–0:37** — Every stage shares one clock, so every stage must finish inside the slowest stage's time.

> Caption: Every stage shares one clock, so every stage must finish inside the slowest stage's time.

Exam-trap caption mode adds: *Adding stages does not automatically speed a pipeline up. Splitting a fast stage makes the pipeline longer without shortening the beat, so the answer can get worse.*

**0:37–0:45** — Between two stages there is a latch, and its delay is added to the beat: period equals the largest delay plus the latch.

> Caption: Between two stages there is a latch, and its delay is added to the beat: period equals the largest delay plus the latch.

Exam-trap caption mode adds: *Do not multiply the latch delay by the number of stages. Only one latch sits between the start and the end of any single stage-to-stage path.*

**0:45–0:52** — The 2021 Set 1 paper: delays 150, 120, 150, 160, 140 with 5 ns registers. Beat 165, and 104 cycles give 17160.

> Caption: The 2021 Set 1 paper: delays 150, 120, 150, 160, 140 with 5 ns registers. Beat 165, and 104 cycles give 17160.

Exam-trap caption mode adds: *The 150 appears twice and the 140 is not the maximum. Sort or scan the whole list before choosing the beat.*

**0:52–1:00** — The 2025 Set 2 paper: the same recipe in microseconds. Beat 260, 1004 cycles, 261040 nanoseconds, 261.04 microseconds.

> Caption: The 2025 Set 2 paper: the same recipe in microseconds. Beat 260, 1004 cycles, 261040 nanoseconds, 261.04 microseconds.

Exam-trap caption mode adds: *The unit change is where marks are lost. Nanoseconds to microseconds is a division by 1000, and the paper asks for two decimal places, so carry the division to the end rather than rounding the period.*

## Scene 3. The speedup ceiling, and what finite n does to it

*1:00 – 1:30 · objective: Compute speedup for a finite instruction count and see it approach but never reach k, using the GATE 2023 and 2025 Set 2 numbers.*

**1:00–1:07** — Speedup is the old time over the new time, and for an ideal pipeline it is k times n over k plus n minus 1.

> Caption: Speedup is the old time over the new time, and for an ideal pipeline it is k times n over k plus n minus 1.

Exam-trap caption mode adds: *Speedup is never defined as "number of stages". It is a ratio of two times, and the number of stages is only its ceiling.*

**1:07–1:15** — Six stages, 25 per cent of instructions stalling two cycles: the average is 1.5 cycles, and 6 over 1.5 is 4.

> Caption: Six stages, 25 per cent of instructions stalling two cycles: the average is 1.5 cycles, and 6 over 1.5 is 4.

Exam-trap caption mode adds: *The stall fraction is per instruction, not per stalled instruction. Multiplying 2 by 0.25 gives the average over all instructions, which is what divides into the base of 1.*

**1:15–1:22** — Two ways to make the beat smaller: split the slowest stage, or accept a slower clock. The 2016 Set 1 paper does the first.

> Caption: Two ways to make the beat smaller: split the slowest stage, or accept a slower clock. The 2016 Set 1 paper does the first.

Exam-trap caption mode adds: *Throughput change is a ratio of periods, so it does not depend on n at all. A question that asks for a throughput percentage wants no instruction count.*

**1:22–1:30** — When the clock gets slower, the stage count is not the whole story: multiply cycles by period before dividing.

> Caption: When the clock gets slower, the stage count is not the whole story: multiply cycles by period before dividing.

Exam-trap caption mode adds: *A pipeline that halves the cycle count but halves the clock frequency has gained nothing. Always carry both factors.*

## Scene 4. Structural hazards: two instructions, one resource

*1:30 – 2:00 · objective: Recognise a structural hazard as two instructions wanting the same hardware in the same cycle, and count its cost from a multi-cycle EX table.*

**1:30–1:37** — A structural hazard is two instructions wanting the same hardware in the same cycle.

> Caption: A structural hazard is two instructions wanting the same hardware in the same cycle.

Exam-trap caption mode adds: *A structural hazard is about resources, not values. No register is being read wrongly; two stages simply cannot both use one unit.*

**1:37–1:45** — Two standard repairs: duplicate the resource, or stall. Separate instruction and data caches are the duplication.

> Caption: Two standard repairs: duplicate the resource, or stall. Separate instruction and data caches are the duplication.

Exam-trap caption mode adds: *Stalling is not a hazard. The hazard is the collision; the stall is the repair. A question that asks for the number of stall cycles wants the repair's cost.*

**1:45–1:52** — A multi-cycle EX unit blocks the stage behind it for one extra cycle per extra cycle it occupies.

> Caption: A multi-cycle EX unit blocks the stage behind it for one extra cycle per extra cycle it occupies.

Exam-trap caption mode adds: *The subtraction of 1 is the whole question. Using the ceiling alone overcounts by one per instruction, which is exactly the size of a plausible wrong option.*

**1:52–2:00** — The 2026 Set 1 paper sums those extras over the instruction mix: 15, 10, 10, 10, 5, 30, 15, which is 95.

> Caption: The 2026 Set 1 paper sums those extras over the instruction mix: 15, 10, 10, 10, 5, 30, 15, which is 95.

Exam-trap caption mode adds: *The remaining 35 instructions take under 1 ns each, so they contribute nothing. Adding a stall for them is the second commonest error here.*

## Scene 5. Data hazards: the true dependence

*2:00 – 2:30 · objective: Read a read-after-write dependence off an instruction sequence and off a cycle diagram, and see the cycle in which the wrong value would be read.*

**2:00–2:07** — A data hazard is a dependence between instructions that the overlap turns into a wrong answer.

> Caption: A data hazard is a dependence between instructions that the overlap turns into a wrong answer.

Exam-trap caption mode adds: *The dependence is a property of the program, not of the pipeline. The hazard is the dependence plus the schedule. Remove the overlap and the hazard vanishes while the dependence remains.*

**2:07–2:15** — Read after write is the true dependence, and it is the only one that exists in a simple in-order five-stage pipeline.

> Caption: Read after write is the true dependence, and it is the only one that exists in a simple in-order five-stage pipeline.

Exam-trap caption mode adds: *Do not say "data hazard means RAW". In an out-of-order machine WAR and WAW are real hazards. The claim is narrower: in a simple in-order five-stage pipeline, only RAW bites.*

**2:15–2:22** — The 2026 Set 1 paper asks which order causes a data hazard. Read-after-write, and nothing else.

> Caption: The 2026 Set 1 paper asks which order causes a data hazard. Read-after-write, and nothing else.

Exam-trap caption mode adds: *Read-after-read is the tempting distractor because it sounds symmetric with read-after-write. It is safe: both instructions only read.*

**2:22–2:30** — Count the gap in cycles: the consumer must reach its read stage at least one cycle after the producer reaches its write stage.

> Caption: Count the gap in cycles: the consumer must reach its read stage at least one cycle after the producer reaches its write stage.

Exam-trap caption mode adds: *The number of stalls depends on which stage reads the registers. A question that says "register read is performed in the EX stage" has changed the arithmetic, not the concept.*

## Scene 6. Forwarding: what it fixes, and the one stall it cannot

*2:30 – 3:00 · objective: Trace forwarding paths from EX/MEM and MEM/WB back to EX, and see why a load followed immediately by its use still costs exactly one stall.*

**2:30–2:37** — Forwarding is a wire: take the result from the end of EX or from the end of MEM and hand it straight to the next EX.

> Caption: Forwarding is a wire: take the result from the end of EX or from the end of MEM and hand it straight to the next EX.

Exam-trap caption mode adds: *Forwarding is not renaming and it is not speculation. It changes where a value is read from, not which instruction runs or when.*

**2:37–2:45** — With forwarding, an arithmetic producer to consumer gap needs zero stalls, because EX output and EX input are one cycle apart.

> Caption: With forwarding, an arithmetic producer to consumer gap needs zero stalls, because EX output and EX input are one cycle apart.

Exam-trap caption mode adds: *Forwarding does not make dependent instructions free of dependence. It makes them free of stalls. The ordering is still enforced; only the waiting disappears.*

**2:45–2:52** — A load is the exception: its value appears only at the end of MEM, so the very next instruction needs one cycle of waiting.

> Caption: A load is the exception: its value appears only at the end of MEM, so the very next instruction needs one cycle of waiting.

Exam-trap caption mode adds: *"Forwarding removes all data-hazard stalls" is false, and it is offered as an option in GATE CSE 2024 Set 1. The load-use case is the standard counterexample.*

**2:52–3:00** — The 2021 Set 2 paper prices it: 30 cycles without forwarding against 16 with, so the speedup of forwarding is 1.875.

> Caption: The 2021 Set 2 paper prices it: 30 cycles without forwarding against 16 with, so the speedup of forwarding is 1.875.

Exam-trap caption mode adds: *The question defines speedup the other way round from the usual convention, as without-over-with. Read the definition the paper gives rather than the one you expect.*

## Scene 7. WAR, WAW and register renaming

*3:00 – 3:30 · objective: Distinguish the anti-dependence and the output dependence from the true dependence, and say what register renaming removes and what it cannot.*

**3:00–3:07** — Write after read is an anti-dependence: the writer must not overwrite before the reader has read.

> Caption: Write after read is an anti-dependence: the writer must not overwrite before the reader has read.

Exam-trap caption mode adds: *WAR is not a true dependence. Neither instruction needs the other's value, so no forwarding wire can help; only the order has to be preserved.*

**3:07–3:15** — Write after write is an output dependence: two writes to one name, and the final value must be the later one.

> Caption: Write after write is an output dependence: two writes to one name, and the final value must be the later one.

Exam-trap caption mode adds: *WAW is not "double write, therefore hazard" in every machine. In a strictly in-order five-stage pipeline writes happen in order, so WAW cannot invert and causes no stall.*

**3:15–3:22** — Register renaming gives each write a fresh physical register, which dissolves WAR and WAW but never RAW.

> Caption: Register renaming gives each write a fresh physical register, which dissolves WAR and WAW but never RAW.

Exam-trap caption mode adds: *Renaming is offered in GATE CSE 2012 as the answer to "to handle certain kinds of hazards". Certain kinds, not all kinds. RAW is the exception and it is the one that matters most.*

**3:22–3:30** — The 2024 Set 2 paper offers four labels and only one is right: RAW on R3 between I1 and I2.

> Caption: The 2024 Set 2 paper offers four labels and only one is right: RAW on R3 between I1 and I2.

Exam-trap caption mode adds: *Two of the four options name a real dependence but give it the wrong name. The repair is to tag each access as a read or a write first, then read the pair off the tags; never pattern-match on which instruction comes first.*

## Scene 8. Control hazards: the branch penalty

*3:30 – 4:00 · objective: Compute the branch penalty from the stage in which the branch resolves, and fold a branch predictor into the same arithmetic.*

**3:30–3:37** — A branch decides which instruction to fetch, and the fetch happens before the decision is known.

> Caption: A branch decides which instruction to fetch, and the fetch happens before the decision is known.

Exam-trap caption mode adds: *A control hazard is not a data hazard with a branch. Nothing is being read too early; the wrong instruction is being run.*

**3:37–3:45** — The penalty is the number of stages between fetch and resolution: resolve in stage m and you waste m minus 1 cycles.

> Caption: The penalty is the number of stages between fetch and resolution: resolve in stage m and you waste m minus 1 cycles.

Exam-trap caption mode adds: *The penalty counts wasted cycles, not the stage number. Resolving in stage 3 costs 2, not 3, and the difference is one mark.*

**3:45–3:52** — A predictor turns the penalty into a probability: an 80 per cent accurate predictor leaves 20 per cent of the penalty.

> Caption: A predictor turns the penalty into a probability: an 80 per cent accurate predictor leaves 20 per cent of the penalty.

Exam-trap caption mode adds: *Accuracy is not the same as saving. An 80 per cent predictor removes 80 per cent of the stall cost, not 80 per cent of the branches.*

**3:52–4:00** — The 2022 paper: 1.6 cycles before, 1.12 after, so 1.43. The 2014 Set 3 paper: a longer pipe costs more per branch.

> Caption: The 2022 paper: 1.6 cycles before, 1.12 after, so 1.43. The 2014 Set 3 paper: a longer pipe costs more per branch.

Exam-trap caption mode adds: *A deeper pipeline has a smaller beat and a larger branch penalty. Both effects are real, and a question that mentions only one of them is asking you to supply the other.*

## Scene 9. Effective CPI: one formula behind every speedup question

*4:00 – 4:30 · objective: Assemble CPI = 1 + sum of (fraction x stalls) and use it to reproduce four previous-year speedups, including the 2024 Set 2 and 2020 answers.*

**4:00–4:07** — One formula covers every speedup question: CPI is 1 plus the sum over hazard types of fraction times stalls.

> Caption: One formula covers every speedup question: CPI is 1 plus the sum over hazard types of fraction times stalls.

Exam-trap caption mode adds: *Fractions are of all instructions, not of the affected subset. A stall that hits 5 per cent of the 30 per cent that are memory instructions contributes 0.30 times 0.05, not 0.05.*

**4:07–4:15** — The 2024 Set 2 paper: 1 plus 0.4 plus 0.6 is 2 cycles against 6, so the speedup is 3.

> Caption: The 2024 Set 2 paper: 1 plus 0.4 plus 0.6 is 2 cycles against 6, so the speedup is 3.

Exam-trap caption mode adds: *Because the clock is the same in both designs, the frequency cancels. If the paper had changed the frequency, the same CPI would give a different speedup.*

**4:15–4:22** — The 2020 paper: 1.85 cycles at 2 GHz against 5 cycles at 2.5 GHz. Multiply by the periods and get 2.16.

> Caption: The 2020 paper: 1.85 cycles at 2 GHz against 5 cycles at 2.5 GHz. Multiply by the periods and get 2.16.

Exam-trap caption mode adds: *The clock changed, so the CPI ratio is not the speedup. 5 / 1.85 would be 2.70, which is the classic wrong option on this question.*

**4:22–4:30** — The 2026 Set 2 paper: 3.125 nanoseconds against 1.333, so 2.34. And the 2017 Set 1 paper needs the cycle count, not the CPI.

> Caption: The 2026 Set 2 paper: 3.125 nanoseconds against 1.333, so 2.34. And the 2017 Set 1 paper needs the cycle count, not the CPI.

Exam-trap caption mode adds: *A small instruction count means the fill and drain dominate, so the CPI shortcut is invalid there. Use k + n - 1 when n is given and small; use CPI when the program is described statistically.*

## Scene 10. The decision procedure, and the five traps

*4:30 – 5:00 · objective: Fix an order of operations that answers any pipelining numerical, name the traps that break it, and separate the quantities that are easy to confuse.*

**4:30–4:37** — Five steps: find the beat, count the cycles, add the stalls, convert units, then divide.

> Caption: Five steps: find the beat, count the cycles, add the stalls, convert units, then divide.

Exam-trap caption mode adds: *Doing the steps out of order is what produces a plausible wrong number. In particular, converting units after dividing loses the trailing decimals the NAT format requires.*

**4:37–4:45** — Three quantities get confused: latency, throughput and speedup. Only one of them is bounded by k.

> Caption: Three quantities get confused: latency, throughput and speedup. Only one of them is bounded by k.

Exam-trap caption mode adds: *A perfectly balanced pipeline does not make one instruction k times faster. If an option says so, it is wrong however natural it sounds.*

**4:45–4:52** — Two more traps: forwarding does not remove the load-use stall, and renaming does not remove RAW.

> Caption: Two more traps: forwarding does not remove the load-use stall, and renaming does not remove RAW.

Exam-trap caption mode adds: *The word "all" in a claim about hazard removal is usually the error. Forwarding removes all stalls except one class; renaming removes all name-based hazards and no data-based ones.*

**4:52–5:00** — And the fifth trap: a stall costs a cycle, not a stage. Every count in this lesson is in cycles.

> Caption: And the fifth trap: a stall costs a cycle, not a stage. Every count in this lesson is in cycles.

Exam-trap caption mode adds: *If an answer is a whole number of cycles and the options are in nanoseconds, you have stopped one step early. Multiply by the period.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
