/* ==========================================================================
   cpu-performance-cpi-mips-and-amdahl — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   captions.vtt, captions.srt and transcript.md are derived from this file by
   tools/gen-captions.mjs — never edited by hand.

   Every number quoted in a caption is produced by the model in lesson.js, which
   computes the CPI, the two machines, the MIPS figures, the Amdahl curve, the
   stall arithmetic and the pipeline limit from the definitions, and re-checks
   each one against an independent route before anything is drawn.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 372,

  scenes: [
    {
      id: "equation", n: 1,
      title: "One equation, three dials",
      start: 0, end: 30,
      objective: "State the CPU performance equation and name what sets each of its three factors."
    },
    {
      id: "clock", n: 2,
      title: "The clock: period and rate are reciprocals",
      start: 30, end: 58,
      objective: "Convert between clock rate and clock period, and see why the conversion is where unit errors enter."
    },
    {
      id: "mix", n: 3,
      title: "Average CPI from an instruction mix",
      start: 58, end: 93,
      objective: "Compute the weighted-average CPI from class frequencies, and see why the plain average is wrong."
    },
    {
      id: "machines", n: 4,
      title: "Two machines, same program",
      start: 93, end: 126,
      objective: "Compare two machines by execution time, and see a faster clock lose."
    },
    {
      id: "mips", n: 5,
      title: "MIPS, and three ways it misleads",
      start: 126, end: 162,
      objective: "Compute MIPS from the equation, then name the three conditions under which it can compare machines."
    },
    {
      id: "speedup", n: 6,
      title: "Speedup, and the percentage trap",
      start: 162, end: 190,
      objective: "Define speedup as a ratio of times and convert correctly between 'faster by' and 'less time'."
    },
    {
      id: "amdahl", n: 7,
      title: "Amdahl's law: the part you did not improve",
      start: 190, end: 225,
      objective: "Derive the Amdahl speedup from a two-part time decomposition, and read its ceiling."
    },
    {
      id: "reverse", n: 8,
      title: "Amdahl backwards: what speedup do I need?",
      start: 225, end: 255,
      objective: "Solve Amdahl's law for the local speedup, and decide feasibility before doing the algebra."
    },
    {
      id: "stalls", n: 9,
      title: "Where the cycles go: stall cycles",
      start: 255, end: 288,
      objective: "Split CPI into ideal cycles plus stall cycles, and use the cache miss rate to compute the stalls."
    },
    {
      id: "pipeline", n: 10,
      title: "The pipeline is the same equation with a smaller CPI",
      start: 288, end: 316,
      objective: "Read pipeline speedup as a CPI argument, and see a clock-rate gain cancelled by a CPI loss."
    },
    {
      id: "procedure", n: 11,
      title: "The procedure, and the four numbers that get confused",
      start: 316, end: 346,
      objective: "Fix a four-step procedure for any performance question, and separate the four numbers that get confused."
    },
    {
      id: "summary", n: 12,
      title: "One equation, four consequences",
      start: 346, end: 372,
      objective: "Consolidate the equation, the speedup ratio, the Amdahl ceiling and the status of MIPS."
    },
  ],

  events: [
    {
      id: "e1", scene: "equation", start: 0, end: 7.5,
      caption: "Every program's running time is the product of three numbers: instructions, cycles per instruction, and the clock period.",
      detail: "CPU time = instruction count x CPI x clock cycle time. Patterson and Hennessy state it as CPU time = instruction count x clock cycles per instruction x clock cycle time; it is the equation every other performance formula in this subject is built from.",
      narration: "Three numbers multiplied together. That product is the whole of performance.",
      keyword: "three numbers"
    },
    {
      id: "e2", scene: "equation", start: 7.5, end: 15,
      caption: "Instruction count comes from the program, the compiler and the instruction set.",
      detail: "A compiler that unrolls loops changes the count. A richer instruction set lowers it. The count is fixed before any hardware decision is made, which is why it is the factor the architect usually cannot move.",
      narration: "The instruction count is set by software and by the instruction set.",
      keyword: "instruction count"
    },
    {
      id: "e3", scene: "equation", start: 15, end: 22.5,
      caption: "CPI is the average number of clock cycles one instruction takes.",
      detail: "CPI stands for clock cycles per instruction. It is an average over the mix of instructions the program actually executes, and it is the number the microarchitecture moves: datapath, pipeline, cache, branch prediction.",
      narration: "Cycles per instruction, averaged over the mix that actually runs.",
      keyword: "average number of clock cycles"
    },
    {
      id: "e4", scene: "equation", start: 22.5, end: 30,
      caption: "The clock period is the time of one cycle, so 2 GHz means 0.5 nanoseconds. Multiply the three and you have seconds.",
      detail: "Units: instruction count is a count, CPI is cycles per instruction, clock cycle time is seconds per cycle. The product is seconds. Dimensional analysis alone catches most unit errors in this topic.",
      narration: "Multiply the three, and you are left with seconds.",
      keyword: "Multiply the three"
    },
    {
      id: "e5", scene: "clock", start: 30, end: 37,
      caption: "A 2 GHz clock ticks two billion times a second, so one cycle lasts half a nanosecond.",
      detail: "1 GHz is 10^9 cycles per second, so the period is 10^-9 s = 1 ns. At 2 GHz the period is 0.5 ns. The period is what the equation wants; the rate is what a datasheet quotes.",
      narration: "Two billion ticks a second, half a nanosecond each.",
      keyword: "half a nanosecond"
    },
    {
      id: "e6", scene: "clock", start: 37, end: 44,
      caption: "Rate and period are reciprocals: the period in nanoseconds is 1000 divided by the rate in megahertz.",
      detail: "1 MHz gives 1000 ns. 100 MHz gives 10 ns. 1 GHz gives 1 ns. 3 GHz gives 0.333 ns. This single line replaces every conversion table.",
      narration: "Divide a thousand by the rate in megahertz, and you have nanoseconds.",
      keyword: "reciprocals"
    },
    {
      id: "e7", scene: "clock", start: 44, end: 51,
      caption: "So doubling the rate halves the period, and that alone halves the time, if the other two numbers stay put.",
      detail: "In practice they do not stay put. A deeper pipeline raises the frequency and also raises the CPI. A faster clock often needs more cycles for a memory access, because memory did not speed up with it.",
      narration: "If the other two numbers stay put. They rarely do.",
      keyword: "if the other two numbers stay put"
    },
    {
      id: "e8", scene: "clock", start: 51, end: 58,
      caption: "That condition is the whole difficulty of the subject: the three dials are not independent.",
      detail: "Every architectural technique in the syllabus is an argument about which dial it turns and what it costs on the other two. Cache lowers CPI and raises the clock period. Pipelining lowers CPI or raises frequency. A compiler changes instruction count and CPI together.",
      narration: "The three dials are not independent, and every technique trades one against another.",
      keyword: "not independent"
    },
    {
      id: "e9", scene: "mix", start: 58, end: 65,
      caption: "Instructions are not equal: an ALU add may take one cycle and a floating-point multiply five.",
      detail: "CPI is not a property of the machine alone. It is a property of the machine applied to a mix of instruction classes. The mix comes from the program.",
      narration: "An add and a floating-point multiply do not cost the same.",
      keyword: "not equal"
    },
    {
      id: "e10", scene: "mix", start: 65, end: 72,
      caption: "Weight each class by its share of the executed instructions: 50% at 1 cycle, 25% at 2, 15% at 3, 10% at 5.",
      detail: "The weights are fractions of the dynamic instruction count, so they must sum to 1. If a question gives counts rather than percentages, divide each count by the total first.",
      narration: "Weight each class by how often it actually runs.",
      keyword: "share of the executed instructions"
    },
    {
      id: "e11", scene: "mix", start: 72, end: 79,
      caption: "The weighted sum is 0.5 + 0.5 + 0.45 + 0.5 = 1.95 cycles per instruction.",
      detail: "0.50 x 1 = 0.50. 0.25 x 2 = 0.50. 0.15 x 3 = 0.45. 0.10 x 5 = 0.50. The total is 1.95. The equivalent route is total cycles divided by total instructions, which gives the same 1.95 and is checked here in code.",
      narration: "One point nine five cycles per instruction, from the weighted sum.",
      keyword: "1.95"
    },
    {
      id: "e12", scene: "mix", start: 79, end: 86,
      caption: "That is the only correct average. Averaging the four CPIs to 2.75 ignores how often each class runs.",
      detail: "The unweighted mean of 1, 2, 3 and 5 is 2.75, and it is wrong here because the classes are not equally frequent. The weighted mean is what the equation uses.",
      narration: "The plain average of the four is wrong, because the four are not equally frequent.",
      keyword: "only correct average",
      trap: "Averaging the class CPIs without their frequencies is the standard trap. CPI is always a weighted average over the executed mix."
    },
    {
      id: "e13", scene: "mix", start: 86, end: 93,
      caption: "One million instructions at 1.95 cycles each is 1.95 million cycles, and at 2 GHz that is 0.975 milliseconds.",
      detail: "1,000,000 x 1.95 = 1,950,000 cycles. Divided by 2 x 10^9 cycles per second, that is 9.75 x 10^-4 s, which is 0.975 ms. Both the cycle count and the time are recomputed in code from the mix.",
      narration: "One point nine five million cycles, and three quarters of a millisecond.",
      keyword: "0.975 milliseconds"
    },
    {
      id: "e14", scene: "machines", start: 93, end: 99.6,
      caption: "Machine A runs at 2 GHz with the CPI of 1.95 just computed: 0.975 milliseconds.",
      detail: "Same program, same instruction set, one million instructions. Nothing about A is assumed except the clock and the CPI.",
      narration: "Machine A: two gigahertz, one point nine five cycles per instruction.",
      keyword: "Machine A"
    },
    {
      id: "e15", scene: "machines", start: 99.6, end: 106.2,
      caption: "Machine B has a faster clock, 3 GHz, but its compiler emits 30% more instructions and its CPI is 2.4.",
      detail: "This is not a contrived case. A simpler instruction set raises the count and lowers the CPI; a more complex one does the reverse. The two machines are different points on the same trade-off.",
      narration: "Machine B has the faster clock, but pays in instructions and cycles.",
      keyword: "30% more instructions"
    },
    {
      id: "e16", scene: "machines", start: 106.2, end: 112.8,
      caption: "Machine B needs 1.04 milliseconds, so the faster clock lost: 50% more frequency, 6.7% longer run.",
      detail: "1,300,000 x 2.4 / 3 x 10^9 = 1.04 x 10^-3 s. Against 0.975 ms that is 6.7% more time, so A is the faster machine by a factor of 1.067.",
      narration: "One point zero four milliseconds. The faster clock finished later.",
      keyword: "the faster clock lost",
      trap: "A question that gives only clock rates cannot be answered. Ask for the instruction count and the CPI, or say the comparison is not determined."
    },
    {
      id: "e17", scene: "machines", start: 112.8, end: 119.4,
      caption: "So 'which is faster' is never answered by the clock rate. Compute the product, or do not answer.",
      detail: "Two of the three factors are enough to reverse a conclusion drawn from the third. This is the single most examined point in the topic, and it is a computation, not a judgement.",
      narration: "Compute the product, or do not answer.",
      keyword: "never answered by the clock rate"
    },
    {
      id: "e18", scene: "machines", start: 119.4, end: 126,
      caption: "Both machines are checked in code: the cycle counts, the times, the ratio, and the direction of the conclusion.",
      detail: "The lesson's model recomputes every number on this page from the definitions, including the claim that the faster clock is the slower machine. Nothing is compared against a stored answer.",
      narration: "Every number here is recomputed, not remembered.",
      keyword: "recomputed"
    },
    {
      id: "e19", scene: "mips", start: 126, end: 132,
      caption: "MIPS is millions of instructions per second: the instruction count divided by the time, in millions.",
      detail: "Equivalently, MIPS = clock rate / (CPI x 10^6). The two forms agree because time = count x CPI / rate. Both are computed in code and compared.",
      narration: "Millions of instructions per second, or the clock rate over CPI in millions.",
      keyword: "MIPS"
    },
    {
      id: "e20", scene: "mips", start: 132, end: 138,
      caption: "Machine A reads 1026 MIPS and machine B reads 1250 MIPS. B wins on MIPS and loses on time.",
      detail: "2 x 10^9 / (1.95 x 10^6) = 1025.6. 3 x 10^9 / (2.4 x 10^6) = 1250. The machine with the higher MIPS took 6.7% longer. The metric moved opposite to performance.",
      narration: "B wins on MIPS and loses on time.",
      keyword: "wins on MIPS and loses on time",
      trap: "If a question offers a higher MIPS as evidence of a faster machine, the evidence is inadmissible unless the program, the ISA and the compiler are identical."
    },
    {
      id: "e21", scene: "mips", start: 138, end: 144,
      caption: "First failure: MIPS ignores what an instruction does. Powerful instructions mean fewer of them per second and a shorter run.",
      detail: "A machine that folds two operations into one instruction lowers the count and often raises the CPI, so its MIPS falls while its time falls too. MIPS counts instructions, not work.",
      narration: "MIPS counts instructions, not work.",
      keyword: "ignores what an instruction does"
    },
    {
      id: "e22", scene: "mips", start: 144, end: 150,
      caption: "Second failure: MIPS varies between programs on the same machine, because CPI varies with the mix.",
      detail: "The same 2 GHz CPU with a CPI of 1.5 reads 1333 MIPS; with a floating-point-heavy mix at CPI 4 it reads 500. One machine, one clock, two answers.",
      narration: "One machine, two programs, two MIPS numbers.",
      keyword: "varies between programs"
    },
    {
      id: "e23", scene: "mips", start: 150, end: 156,
      caption: "Third failure: MIPS can move opposite to performance, which is exactly what A and B did.",
      detail: "So MIPS is valid only when the same program runs on the same instruction set through the same compiler. Then the instruction counts match and the metric compares like with like.",
      narration: "Valid only for the same program, the same ISA, the same compiler.",
      keyword: "move opposite to performance"
    },
    {
      id: "e24", scene: "mips", start: 156, end: 162,
      caption: "Averaging MIPS across programs needs the harmonic mean, not the arithmetic mean, because a rate is being averaged.",
      detail: "Rates average harmonically. For 1333 and 500 the arithmetic mean is 917 and the harmonic mean is 727, and only the harmonic mean equals total instructions over total time when the two programs execute equal counts. This is checked in code.",
      narration: "A rate averages harmonically. The plain mean overstates it.",
      keyword: "harmonic mean"
    },
    {
      id: "e25", scene: "speedup", start: 162, end: 169,
      caption: "Speedup is the old time divided by the new time: a ratio of times, never a ratio of frequencies.",
      detail: "Performance is the reciprocal of execution time, so a ratio of performances equals the inverse ratio of times. That identity is what makes speedup well defined.",
      narration: "Old time over new time. A ratio of times.",
      keyword: "ratio of times"
    },
    {
      id: "e26", scene: "speedup", start: 169, end: 176,
      caption: "A machine that runs 20% faster has speedup 1.2, so its time is 0.833 of the old, a 16.7% reduction and not 20%.",
      detail: "1 / 1.2 = 0.8333. The time falls by one sixth, not by one fifth. The two percentages differ because one is applied to speed and the other to time.",
      narration: "Twenty percent faster is sixteen point seven percent less time.",
      keyword: "0.833 of the old",
      trap: "'20% faster' and '20% less time' are different claims. Decide which one the question made before computing."
    },
    {
      id: "e27", scene: "speedup", start: 176, end: 183,
      caption: "A time cut by 20% is a speedup of 1.25, because one divided by 0.8 is 1.25.",
      detail: "These two conversions are inverses of each other: 1/1.2 = 0.833 and 1/0.8 = 1.25. Mixing them is the most common arithmetic error in speedup questions.",
      narration: "A time cut by a fifth is a speedup of one and a quarter.",
      keyword: "1.25"
    },
    {
      id: "e28", scene: "speedup", start: 183, end: 190,
      caption: "Write down which of the two the question gave you before doing any arithmetic.",
      detail: "Both forms appear in papers, and the words are similar. One line of notation at the top of the answer prevents the error entirely.",
      narration: "Write down which one you were given, before any arithmetic.",
      keyword: "before doing any arithmetic"
    },
    {
      id: "e29", scene: "amdahl", start: 190, end: 197,
      caption: "Suppose 60% of the time is spent in the part you can speed up, and you make that part four times faster.",
      detail: "p = 0.6 is the fraction of execution time in the enhanced part, and s = 4 is how much faster that part becomes. Amdahl presented the argument in 1967, at the AFIPS Spring Joint Computer Conference.",
      narration: "Sixty percent of the time is improvable, and it becomes four times faster.",
      keyword: "60% of the time"
    },
    {
      id: "e30", scene: "amdahl", start: 197, end: 204,
      caption: "The other 40% is untouched. The new time is 0.4 + 0.6/4 = 0.55 of the old, so the speedup is 1.818.",
      detail: "1 / 0.55 = 1.8181... The improved part shrank from 0.6 to 0.15; the untouched 0.4 did not move, and it is now most of the run.",
      narration: "Point five five of the old time, so one point eight one eight times faster.",
      keyword: "0.55"
    },
    {
      id: "e31", scene: "amdahl", start: 204, end: 211,
      caption: "Push the improved part to infinity and the speedup stops at 1/0.4 = 2.5. That is the ceiling.",
      detail: "As s grows without bound the term p/s vanishes and the speedup tends to 1/(1-p). No engineering removes the ceiling; only reducing the unimproved fraction does.",
      narration: "However good the improvement, one over zero point four is the ceiling: two and a half.",
      keyword: "1/0.4 = 2.5",
      trap: "The ceiling depends only on the unimproved fraction. A question that asks for the maximum possible speedup is asking for 1/(1-p) and nothing else."
    },
    {
      id: "e32", scene: "amdahl", start: 211, end: 218,
      caption: "The formula is one over ((1 - p) + p/s): the unimproved fraction plus the improved fraction divided by its speedup.",
      detail: "This is the same formula Patterson and Hennessy list as Amdahl's law, with the enhanced fraction written p and the enhancement's speedup written s. It generalises to any number of enhancements by summing p_i / s_i.",
      narration: "One over the unimproved fraction plus the improved fraction over its speedup.",
      keyword: "one over ((1 - p) + p/s)"
    },
    {
      id: "e33", scene: "amdahl", start: 218, end: 225,
      caption: "p is the fraction of time, not of code and not of instructions.",
      detail: "A loop that is 30% of the instructions can be 60% of the time if each iteration is slow. Amdahl's law is a statement about time, so the fraction must be measured in time. Converting an instruction fraction into a time fraction requires the CPIs.",
      narration: "The fraction is a fraction of time. Not of code.",
      keyword: "fraction of time",
      trap: "A part that is 30% of the instructions can be 60% of the time. Convert with CPI before applying the law."
    },
    {
      id: "e34", scene: "reverse", start: 225, end: 232.5,
      caption: "Questions often give the target overall speedup and ask for the local one. With 90% of the time improvable and a target of 2, solve 2 = 1/(0.1 + 0.9/s).",
      detail: "Rearranging: 0.1 + 0.9/s = 0.5, so 0.9/s = 0.4, so s = 2.25. The solution is computed in code and substituted back to recover the target exactly.",
      narration: "Target two, ninety percent improvable. Solve for the local speedup.",
      keyword: "solve for s"
    },
    {
      id: "e35", scene: "reverse", start: 232.5, end: 240,
      caption: "That gives s = 2.25: the improved part must be more than twice as fast, not twice.",
      detail: "A local speedup of exactly 2 gives an overall 1/(0.1 + 0.45) = 1.818, which misses the target. Small targets demand local improvements larger than the target itself.",
      narration: "More than twice as fast, not twice.",
      keyword: "2.25"
    },
    {
      id: "e36", scene: "reverse", start: 240, end: 247.5,
      caption: "And if the target exceeds 1/(1-p), no speedup achieves it. With p = 0.6 the ceiling is 2.5, so a target of 3 is impossible.",
      detail: "Check feasibility first: compare the target with the ceiling. Here 3 > 2.5, so the equation has no positive solution, and the correct answer is that the target cannot be met by improving that part at all.",
      narration: "A target above the ceiling has no solution. Say so.",
      keyword: "no speedup achieves it",
      trap: "An impossible target is a legitimate question with a legitimate answer: no finite speedup achieves it. Do not force an algebraic solution into existence."
    },
    {
      id: "e37", scene: "reverse", start: 247.5, end: 255,
      caption: "Check feasibility first, then solve. That order saves the algebra and catches the impossible question.",
      detail: "The ceiling is one division. Doing it first turns a failed rearrangement into a one-line correct answer.",
      narration: "Feasibility first. Then the algebra.",
      keyword: "feasibility first"
    },
    {
      id: "e38", scene: "stalls", start: 255, end: 261.6,
      caption: "A real CPI is the ideal CPI plus the cycles lost waiting. Memory stalls per instruction are the miss rate times the miss penalty in cycles.",
      detail: "Stall cycles per instruction = miss rate x miss penalty, where the penalty is counted in clock cycles, not seconds. This is the bridge between the cache lesson and this equation.",
      narration: "Ideal cycles, plus the cycles lost waiting.",
      keyword: "cycles lost waiting"
    },
    {
      id: "e39", scene: "stalls", start: 261.6, end: 268.2,
      caption: "Base CPI 1.2, miss rate 3%, penalty 60 cycles: 1.8 stall cycles per instruction, so the CPI is 3.0.",
      detail: "0.03 x 60 = 1.8. Adding the base 1.2 gives 3.0, so the memory system is responsible for 60% of the CPI. That ratio is what a cache question is usually asking you to find.",
      narration: "One point eight stall cycles, on top of one point two ideal. CPI three.",
      keyword: "1.8 stall cycles"
    },
    {
      id: "e40", scene: "stalls", start: 268.2, end: 274.8,
      caption: "A perfect cache would give CPI 1.2, and the time would fall from 1.5 to 0.6 milliseconds, a speedup of 2.5.",
      detail: "One million instructions at CPI 3 and 2 GHz is 1.5 ms; at CPI 1.2 it is 0.6 ms. The ratio is exactly the ratio of the CPIs, which is why the cache's contribution is measured in CPI.",
      narration: "One and a half milliseconds becomes zero point six. Two and a half times.",
      keyword: "speedup of 2.5"
    },
    {
      id: "e41", scene: "stalls", start: 274.8, end: 281.4,
      caption: "Turned around: to reach CPI 2.0 the miss rate must fall to 1.33%. That is the arithmetic a cache question is really asking.",
      detail: "1.2 + m x 60 = 2.0 gives m = 0.8/60 = 0.01333. Substituting back recovers 2.0 exactly. Solving for a miss rate is the commonest form of this question.",
      narration: "To reach CPI two, the miss rate must fall to one and a third percent.",
      keyword: "1.33%"
    },
    {
      id: "e42", scene: "stalls", start: 281.4, end: 288,
      caption: "This is the same equation as before with one number replaced. Nothing new is introduced, only measured.",
      detail: "The three dials stay the same. A cache does not change the clock or the instruction count; it changes the average cycles per instruction, and it does so through the miss rate.",
      narration: "Same equation. One number replaced.",
      keyword: "one number replaced"
    },
    {
      id: "e43", scene: "pipeline", start: 288, end: 295,
      caption: "A k-stage pipeline has an ideal speedup of k, because it issues one instruction per cycle instead of one per k cycles.",
      detail: "In the ideal case with no stalls the cycle count for n instructions falls from n x k to about n, so the speedup is k. The pipeline lesson in this repository derives the exact count as k + n - 1.",
      narration: "Ideal speedup is the number of stages.",
      keyword: "ideal speedup of k"
    },
    {
      id: "e44", scene: "pipeline", start: 295, end: 302,
      caption: "Stalls raise the CPI: five stages with 0.2 stall cycles per instruction give CPI 1.2 and a speedup near 5/1.2 = 4.17.",
      detail: "The exact figure for a long run is k / (1 + stalls per instruction). For 1000 instructions the exact count gives 4.15, so the limit is close but not equal; both are computed here.",
      narration: "Five over one point two: about four point one seven.",
      keyword: "5/1.2 = 4.17"
    },
    {
      id: "e45", scene: "pipeline", start: 302, end: 309,
      caption: "Doubling the clock rate while doubling the CPI leaves the time unchanged: speedup 1, for twice the frequency.",
      detail: "Time = count x CPI / rate. Doubling both CPI and rate multiplies the time by 2/2 = 1. Deeper pipelines buy frequency exactly this way, and the stalls they add are the price.",
      narration: "Twice the frequency and twice the cycles: no gain at all.",
      keyword: "speedup 1",
      trap: "A question that offers a doubled clock rate and a doubled CPI has a definite answer: no speedup. Do not report a gain from the frequency alone."
    },
    {
      id: "e46", scene: "pipeline", start: 309, end: 316,
      caption: "So the three dials trade against each other: deeper pipelining buys frequency and spends CPI.",
      detail: "This is the same trade-off that made machine B slower than machine A, seen from the hardware side instead of the compiler side.",
      narration: "Deeper pipelining buys frequency and spends CPI.",
      keyword: "trade against each other"
    },
    {
      id: "e47", scene: "procedure", start: 316, end: 322,
      caption: "Step one: write the three quantities the question gives, with units. Frequency is not time, so convert it.",
      detail: "Clock rate in Hz is cycles per second; the equation wants seconds per cycle. Converting at the start costs one line and prevents the commonest error in the topic.",
      narration: "Write the three quantities with units, and convert the frequency first.",
      keyword: "with units"
    },
    {
      id: "e48", scene: "procedure", start: 322, end: 328,
      caption: "Step two: if the question gives a mix, weight the CPIs. If it gives total cycles, divide by the instruction count.",
      detail: "Both routes give the same average CPI, and doing the second one as a check catches a wrong weight or a missing class.",
      narration: "Weight the mix, or divide total cycles by the count. Then check the other way.",
      keyword: "weight the CPIs"
    },
    {
      id: "e49", scene: "procedure", start: 328, end: 334,
      caption: "Step three: multiply, and keep the powers of ten straight. A nanosecond is 10^-9 seconds and a millisecond is 10^-3.",
      detail: "Performance answers span nine orders of magnitude, so a slipped exponent looks plausible. Carrying the exponent explicitly, rather than decimal points, is what keeps it right.",
      narration: "Keep the powers of ten explicit.",
      keyword: "powers of ten"
    },
    {
      id: "e50", scene: "procedure", start: 334, end: 340,
      caption: "Step four: answer the number that was asked for. Execution time, CPI, MIPS and speedup are four different answers.",
      detail: "A correct computation reported as the wrong quantity scores zero. Re-read the question's last line before writing the answer.",
      narration: "Answer the number that was asked for, not the one you computed.",
      keyword: "the number that was asked for",
      trap: "Unit and quantity slips lose more marks in this topic than conceptual errors. Write the units at every step and re-read what was asked."
    },
    {
      id: "e51", scene: "procedure", start: 340, end: 346,
      caption: "Check the answer against the bounds: a speedup cannot exceed the ceiling, and a CPI cannot be below one for a scalar pipeline.",
      detail: "Two cheap sanity checks. If a computed speedup exceeds 1/(1-p), an arithmetic slip has occurred. If a CPI comes out below 1 for an unpipelined machine, a cycle was miscounted.",
      narration: "Two bounds catch most arithmetic slips.",
      keyword: "bounds"
    },
    {
      id: "e52", scene: "summary", start: 346, end: 352.5,
      caption: "One equation, three dials: instructions, cycles per instruction, clock period.",
      detail: "Everything in this lesson is a rearrangement of that product, and every technique in the architecture syllabus is an argument about which dial it moves.",
      narration: "One equation, three dials.",
      keyword: "three dials"
    },
    {
      id: "e53", scene: "summary", start: 352.5, end: 359,
      caption: "Speedup is a ratio of times. Amdahl caps it at one over the unimproved fraction.",
      detail: "Both statements are arithmetic, and both are checked in this lesson's model against direct time computations rather than against remembered answers.",
      narration: "Speedup is a ratio of times, capped by the unimproved fraction.",
      keyword: "ratio of times"
    },
    {
      id: "e54", scene: "summary", start: 359, end: 365.5,
      caption: "MIPS is not a measure of speed. It measures instruction throughput under fixed program, ISA and compiler.",
      detail: "Used outside those conditions it can rank machines backwards, which this lesson demonstrates with two machines and a 6.7% inversion.",
      narration: "MIPS is throughput, not speed.",
      keyword: "not a measure of speed"
    },
    {
      id: "e55", scene: "summary", start: 365.5, end: 372,
      caption: "Everything else in the subject, cache and pipeline and compiler, is an argument about which dial it moves.",
      detail: "That is why this lesson sits under the memory-hierarchy and pipelining lessons rather than beside them: it is the arithmetic they are written in.",
      narration: "Every other topic is an argument about which dial it moves.",
      keyword: "which dial it moves"
    },
  ]
};
