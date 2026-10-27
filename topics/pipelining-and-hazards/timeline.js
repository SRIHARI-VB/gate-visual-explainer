/* ==========================================================================
   pipelining-and-hazards - THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs - never edited by hand.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'latency',
      n: 1,
      title: 'Two clocks: latency and throughput',
      start: 0, end: 30,
      objective: 'Separate the time one instruction takes from the rate at which instructions finish, and see why k stages finish n instructions in k + n - 1 cycles rather than k times n.'
    },
    {
      id: 'beat',
      n: 2,
      title: 'The clock beat is the slowest stage',
      start: 30, end: 60,
      objective: 'Read a pipeline clock period off its stage delays as the maximum plus the latch delay, and see why the slowest stage sets the beat for everyone.'
    },
    {
      id: 'speedup',
      n: 3,
      title: 'The speedup ceiling, and what finite n does to it',
      start: 60, end: 90,
      objective: 'Compute speedup for a finite instruction count and see it approach but never reach k, using the GATE 2023 and 2025 Set 2 numbers.'
    },
    {
      id: 'structural',
      n: 4,
      title: 'Structural hazards: two instructions, one resource',
      start: 90, end: 120,
      objective: 'Recognise a structural hazard as two instructions wanting the same hardware in the same cycle, and count its cost from a multi-cycle EX table.'
    },
    {
      id: 'raw',
      n: 5,
      title: 'Data hazards: the true dependence',
      start: 120, end: 150,
      objective: 'Read a read-after-write dependence off an instruction sequence and off a cycle diagram, and see the cycle in which the wrong value would be read.'
    },
    {
      id: 'forward',
      n: 6,
      title: 'Forwarding: what it fixes, and the one stall it cannot',
      start: 150, end: 180,
      objective: 'Trace forwarding paths from EX/MEM and MEM/WB back to EX, and see why a load followed immediately by its use still costs exactly one stall.'
    },
    {
      id: 'warwaw',
      n: 7,
      title: 'WAR, WAW and register renaming',
      start: 180, end: 210,
      objective: 'Distinguish the anti-dependence and the output dependence from the true dependence, and say what register renaming removes and what it cannot.'
    },
    {
      id: 'control',
      n: 8,
      title: 'Control hazards: the branch penalty',
      start: 210, end: 240,
      objective: 'Compute the branch penalty from the stage in which the branch resolves, and fold a branch predictor into the same arithmetic.'
    },
    {
      id: 'cpi',
      n: 9,
      title: 'Effective CPI: one formula behind every speedup question',
      start: 240, end: 270,
      objective: 'Assemble CPI = 1 + sum of (fraction x stalls) and use it to reproduce four previous-year speedups, including the 2024 Set 2 and 2020 answers.'
    },
    {
      id: 'recipe',
      n: 10,
      title: 'The decision procedure, and the five traps',
      start: 270, end: 300,
      objective: 'Fix an order of operations that answers any pipelining numerical, name the traps that break it, and separate the quantities that are easy to confuse.'
    }
  ],

  events: [

    /* ---------------- scene 1: latency and throughput ---------------- */
    {
      id: 'lt-1', start: 0, end: 7.5, scene: 'latency',
      caption: 'One instruction still takes k cycles. What the pipeline changes is how often one finishes.',
      detail: 'A pipeline does not shorten any single instruction. It overlaps different stages of different instructions, so the gap between two completions shrinks from k cycles to 1 cycle. Latency stays k; throughput becomes one per cycle.',
      keyword: 'how often one finishes',
      trap: 'The commonest error on this topic is to say "a k-stage pipeline makes each instruction k times faster". No single instruction is faster at all. Only the rate improves.',
      narration: 'One instruction still takes k cycles. What the pipeline changes is how often one finishes.'
    },
    {
      id: 'lt-2', start: 7.5, end: 15, scene: 'latency',
      caption: 'Fill the pipe once, then one instruction leaves every cycle: k plus n minus 1 cycles for n instructions.',
      detail: 'The first instruction needs k cycles to walk all k stages. Each of the remaining n minus 1 instructions adds exactly one cycle, because it finishes one stage behind its predecessor. So the total is k + (n - 1), written k + n - 1.',
      keyword: 'k plus n minus 1',
      trap: 'k times n is wrong, and k + n is off by one. Count the first instruction\'s k cycles, then add one cycle for each of the other n - 1.',
      narration: 'Fill the pipe once, then one instruction leaves every cycle: k plus n minus 1 cycles for n instructions.'
    },
    {
      id: 'lt-3', start: 15, end: 22.5, scene: 'latency',
      caption: 'The diagonal is the pipeline: each row is one instruction, each column one cycle, and every stage busy every cycle after the fill.',
      detail: 'In the cycle diagram an instruction is a horizontal run of cells and a stage is a diagonal. After cycle k every stage holds a different instruction, which is exactly what "full" means. The empty triangles at the start and end are the fill and drain, and they are the whole reason the answer is not k times n.',
      keyword: 'the diagonal is the pipeline',
      trap: 'Reading the diagram by rows hides the overlap; reading it by columns shows it. When a question gives a cycle diagram, count columns, not cells.',
      narration: 'The diagonal is the pipeline: each row is one instruction, each column one cycle, and every stage busy every cycle after the fill.'
    },
    {
      id: 'lt-4', start: 22.5, end: 30, scene: 'latency',
      caption: 'The 2023 paper: stages of 10, 20 and 14 nanoseconds, 100 instructions. The beat is 20, and 3 plus 99 is 102 cycles.',
      detail: 'GATE CSE 2023 asks for the total time of 100 instructions on a 3-stage pipeline with stage delays 10, 20 and 14 ns and no hazards. The clock period is the largest delay, 20 ns. The cycle count is 3 + 100 - 1 = 102. So the answer is 102 times 20 = 2040 ns.',
      keyword: '102 cycles',
      trap: 'Do not add the three delays. Only the largest one becomes the clock period; the other two are idle waiting, and that idleness is the pipeline\'s cost, not its time.',
      narration: 'The 2023 paper: stages of 10, 20 and 14 nanoseconds, 100 instructions. The beat is 20, and 3 plus 99 is 102 cycles.'
    },

    /* ---------------- scene 2: the clock beat ---------------- */
    {
      id: 'bt-1', start: 30, end: 37.5, scene: 'beat',
      caption: 'Every stage shares one clock, so every stage must finish inside the slowest stage\'s time.',
      detail: 'A pipeline is synchronous: one clock drives all the stage registers. A stage that needs 20 ns forces the clock period to be at least 20 ns, even if another stage needs only 10. The fast stage simply idles for half its slot.',
      keyword: 'every stage shares one clock',
      trap: 'Adding stages does not automatically speed a pipeline up. Splitting a fast stage makes the pipeline longer without shortening the beat, so the answer can get worse.',
      narration: 'Every stage shares one clock, so every stage must finish inside the slowest stage\'s time.'
    },
    {
      id: 'bt-2', start: 37.5, end: 45, scene: 'beat',
      caption: 'Between two stages there is a latch, and its delay is added to the beat: period equals the largest delay plus the latch.',
      detail: 'The pipeline register that holds a stage\'s output until the next clock edge is not free. Its propagation and setup delay adds to the path. So the clock period is the maximum stage delay plus the latch delay, and the number of latch delays in the path is one, not k, because stages run in parallel.',
      keyword: 'largest delay plus the latch',
      trap: 'Do not multiply the latch delay by the number of stages. Only one latch sits between the start and the end of any single stage-to-stage path.',
      narration: 'Between two stages there is a latch, and its delay is added to the beat: period equals the largest delay plus the latch.'
    },
    {
      id: 'bt-3', start: 45, end: 52.5, scene: 'beat',
      caption: 'The 2021 Set 1 paper: delays 150, 120, 150, 160, 140 with 5 ns registers. Beat 165, and 104 cycles give 17160.',
      detail: 'GATE CSE 2021 Set 1 asks for the time of 100 independent instructions on a five-stage pipeline with stage delays 150, 120, 150, 160 and 140 ns and 5 ns registers. The largest delay is 160, so the period is 165 ns. The cycle count is 5 + 100 - 1 = 104. The total is 104 times 165 = 17160 ns.',
      keyword: '17160',
      trap: 'The 150 appears twice and the 140 is not the maximum. Sort or scan the whole list before choosing the beat.',
      narration: 'The 2021 Set 1 paper: delays 150, 120, 150, 160, 140 with 5 ns registers. Beat 165, and 104 cycles give 17160.'
    },
    {
      id: 'bt-4', start: 52.5, end: 60, scene: 'beat',
      caption: 'The 2025 Set 2 paper: the same recipe in microseconds. Beat 260, 1004 cycles, 261040 nanoseconds, 261.04 microseconds.',
      detail: 'GATE CSE 2025 Set 2 gives five stage delays 180, 250, 150, 170 and 250 ns with a 10 ns latch, and asks for 1000 instructions in microseconds. The period is 250 + 10 = 260 ns. The cycle count is 5 + 1000 - 1 = 1004. The product is 261040 ns, which is 261.04 microseconds.',
      keyword: '261.04 microseconds',
      trap: 'The unit change is where marks are lost. Nanoseconds to microseconds is a division by 1000, and the paper asks for two decimal places, so carry the division to the end rather than rounding the period.',
      narration: 'The 2025 Set 2 paper: the same recipe in microseconds. Beat 260, 1004 cycles, 261040 nanoseconds, 261.04 microseconds.'
    },

    /* ---------------- scene 3: the speedup ceiling ---------------- */
    {
      id: 'sp-1', start: 60, end: 67.5, scene: 'speedup',
      caption: 'Speedup is the old time over the new time, and for an ideal pipeline it is k times n over k plus n minus 1.',
      detail: 'A non-pipelined machine spends k times the stage delay on every instruction. The pipelined machine spends one period per cycle and needs k + n - 1 cycles. Their ratio is kn over (k + n - 1), which for large n tends to k.',
      keyword: 'old time over the new time',
      trap: 'Speedup is never defined as "number of stages". It is a ratio of two times, and the number of stages is only its ceiling.',
      narration: 'Speedup is the old time over the new time, and for an ideal pipeline it is k times n over k plus n minus 1.'
    },
    {
      id: 'sp-2', start: 67.5, end: 75, scene: 'speedup',
      caption: 'Six stages, 25 per cent of instructions stalling two cycles: the average is 1.5 cycles, and 6 over 1.5 is 4.',
      detail: 'GATE CSE 2014 Set 1 asks for the speedup of a perfectly balanced 6-stage pipeline when 25 per cent of instructions incur 2 stall cycles. The average stall per instruction is 0.25 times 2 = 0.5, so the average cost is 1.5 cycles instead of 1. Non-pipelined cost is 6 cycles. Speedup is 6 / 1.5 = 4.',
      keyword: '6 over 1.5 is 4',
      trap: 'The stall fraction is per instruction, not per stalled instruction. Multiplying 2 by 0.25 gives the average over all instructions, which is what divides into the base of 1.',
      narration: 'Six stages, 25 per cent of instructions stalling two cycles: the average is 1.5 cycles, and 6 over 1.5 is 4.'
    },
    {
      id: 'sp-3', start: 75, end: 82.5, scene: 'speedup',
      caption: 'Two ways to make the beat smaller: split the slowest stage, or accept a slower clock. The 2016 Set 1 paper does the first.',
      detail: 'GATE CSE 2016 Set 1 has a 4-stage pipeline with delays 800, 500, 400 and 300 ps, and replaces the 800 ps stage with two stages of 600 and 350 ps. The beat falls from 800 to 600, so throughput rises by 800/600 minus 1, which is 33.33 per cent. Note the pipeline became 5 stages but the question asks for throughput, not cycle count.',
      keyword: '800/600 minus 1',
      trap: 'Throughput change is a ratio of periods, so it does not depend on n at all. A question that asks for a throughput percentage wants no instruction count.',
      narration: 'Two ways to make the beat smaller: split the slowest stage, or accept a slower clock. The 2016 Set 1 paper does the first.'
    },
    {
      id: 'sp-4', start: 82.5, end: 90, scene: 'speedup',
      caption: 'When the clock gets slower, the stage count is not the whole story: multiply cycles by period before dividing.',
      detail: 'Pipelining usually forces a lower clock, because of the latch delay and the register file access. Then the speedup is (CPI_non x T_non) / (CPI_pipe x T_pipe), and the frequency ratio enters explicitly. Ignoring it is the single largest source of wrong answers in this topic.',
      keyword: 'multiply cycles by period before dividing',
      trap: 'A pipeline that halves the cycle count but halves the clock frequency has gained nothing. Always carry both factors.',
      narration: 'When the clock gets slower, the stage count is not the whole story: multiply cycles by period before dividing.'
    },

    /* ---------------- scene 4: structural hazards ---------------- */
    {
      id: 'st-1', start: 90, end: 97.5, scene: 'structural',
      caption: 'A structural hazard is two instructions wanting the same hardware in the same cycle.',
      detail: 'The classic case is a single memory used for both instruction fetch and data access: a load in MEM collides with the next instruction in IF. The other classic case is a functional unit that is not fully pipelined, so an instruction occupies it for several cycles and blocks the one behind.',
      keyword: 'same hardware in the same cycle',
      trap: 'A structural hazard is about resources, not values. No register is being read wrongly; two stages simply cannot both use one unit.',
      narration: 'A structural hazard is two instructions wanting the same hardware in the same cycle.'
    },
    {
      id: 'st-2', start: 97.5, end: 105, scene: 'structural',
      caption: 'Two standard repairs: duplicate the resource, or stall. Separate instruction and data caches are the duplication.',
      detail: 'A split instruction and data cache removes the memory collision entirely, at the cost of silicon. Where duplication is too expensive the pipeline stalls the later instruction, which costs cycles. Both repairs are correct; only one is free, and none is free in area.',
      keyword: 'duplicate the resource, or stall',
      trap: 'Stalling is not a hazard. The hazard is the collision; the stall is the repair. A question that asks for the number of stall cycles wants the repair\'s cost.',
      narration: 'Two standard repairs: duplicate the resource, or stall. Separate instruction and data caches are the duplication.'
    },
    {
      id: 'st-3', start: 105, end: 112.5, scene: 'structural',
      caption: 'A multi-cycle EX unit blocks the stage behind it for one extra cycle per extra cycle it occupies.',
      detail: 'If EX needs t nanoseconds and the clock period is 1 ns, it occupies the ceiling of t cycles. The first of those cycles is the one the pipeline already allows, so the extra cycles are the ceiling of t minus 1. Every instruction of that type pays them, and they add up across the program.',
      keyword: 'ceiling of t minus 1',
      trap: 'The subtraction of 1 is the whole question. Using the ceiling alone overcounts by one per instruction, which is exactly the size of a plausible wrong option.',
      narration: 'A multi-cycle EX unit blocks the stage behind it for one extra cycle per extra cycle it occupies.'
    },
    {
      id: 'st-4', start: 112.5, end: 120, scene: 'structural',
      caption: 'The 2026 Set 1 paper sums those extras over the instruction mix: 15, 10, 10, 10, 5, 30, 15, which is 95.',
      detail: 'GATE CSE 2026 Set 1 gives seven instruction types with EX times 1.8, 1.5, 2.5, 1.7, 1.7, 2.8 and 3.2 ns and counts 15, 10, 5, 10, 5, 15 and 5 in a 100-instruction program, with a 1 ns clock. The extra cycles are 1, 1, 2, 1, 1, 2 and 3, so the stall totals are 15, 10, 10, 10, 5, 30 and 15, which sum to 95.',
      keyword: '95',
      trap: 'The remaining 35 instructions take under 1 ns each, so they contribute nothing. Adding a stall for them is the second commonest error here.',
      narration: 'The 2026 Set 1 paper sums those extras over the instruction mix: 15, 10, 10, 10, 5, 30, 15, which is 95.'
    },

    /* ---------------- scene 5: RAW ---------------- */
    {
      id: 'raw-1', start: 120, end: 127.5, scene: 'raw',
      caption: 'A data hazard is a dependence between instructions that the overlap turns into a wrong answer.',
      detail: 'Without overlap, instruction 2 would read the register after instruction 1 had written it. With overlap, instruction 2 reaches its read stage before instruction 1 reaches its write stage, so it reads the old value. The dependence was always there; the pipeline is what makes it dangerous.',
      keyword: 'the overlap turns it into a wrong answer',
      trap: 'The dependence is a property of the program, not of the pipeline. The hazard is the dependence plus the schedule. Remove the overlap and the hazard vanishes while the dependence remains.',
      narration: 'A data hazard is a dependence between instructions that the overlap turns into a wrong answer.'
    },
    {
      id: 'raw-2', start: 127.5, end: 135, scene: 'raw',
      caption: 'Read after write is the true dependence, and it is the only one that exists in a simple in-order five-stage pipeline.',
      detail: 'Write the producer first, read the consumer second, and the reader needs the writer\'s value: that is read-after-write, also called a true dependence, also called RAW. In a five-stage in-order pipeline with one write per cycle, the other two orders cannot actually occur, so RAW is the only data hazard you will meet there.',
      keyword: 'read after write is the true dependence',
      trap: 'Do not say "data hazard means RAW". In an out-of-order machine WAR and WAW are real hazards. The claim is narrower: in a simple in-order five-stage pipeline, only RAW bites.',
      narration: 'Read after write is the true dependence, and it is the only one that exists in a simple in-order five-stage pipeline.'
    },
    {
      id: 'raw-3', start: 135, end: 142.5, scene: 'raw',
      caption: 'The 2026 Set 1 paper asks which order causes a data hazard. Read-after-write, and nothing else.',
      detail: 'GATE CSE 2026 Set 1 offers read-after-read, read-after-write, write-after-read and write-after-write and asks which can cause a data hazard in a pipelined processor. Read-after-read cannot, because two reads never change anything. Write-after-write and write-after-read are ordering constraints, not value dependencies: the reader or writer does not need the other\'s data.',
      keyword: 'read-after-write, and nothing else',
      trap: 'Read-after-read is the tempting distractor because it sounds symmetric with read-after-write. It is safe: both instructions only read.',
      narration: 'The 2026 Set 1 paper asks which order causes a data hazard. Read-after-write, and nothing else.'
    },
    {
      id: 'raw-4', start: 142.5, end: 150, scene: 'raw',
      caption: 'Count the gap in cycles: the consumer must reach its read stage at least one cycle after the producer reaches its write stage.',
      detail: 'In a five-stage pipeline with register read in ID, the producer writes in WB at cycle start plus 4 and the consumer reads in ID at its start plus 1. Equal start cycles give a gap of 3, so the consumer must be delayed until the gap is at least 0, which is 2 stall cycles. Move the read into EX and the gap becomes 2, so one stall suffices.',
      keyword: 'count the gap in cycles',
      trap: 'The number of stalls depends on which stage reads the registers. A question that says "register read is performed in the EX stage" has changed the arithmetic, not the concept.',
      narration: 'Count the gap in cycles: the consumer must reach its read stage at least one cycle after the producer reaches its write stage.'
    },

    /* ---------------- scene 6: forwarding ---------------- */
    {
      id: 'fw-1', start: 150, end: 157.5, scene: 'forward',
      caption: 'Forwarding is a wire: take the result from the end of EX or from the end of MEM and hand it straight to the next EX.',
      detail: 'The value already exists inside the pipeline long before it is written back. A forwarding path from the EX/MEM register to the EX input, and another from the MEM/WB register to the same input, lets the consumer read the fresh value without waiting for the register file.',
      keyword: 'forwarding is a wire',
      trap: 'Forwarding is not renaming and it is not speculation. It changes where a value is read from, not which instruction runs or when.',
      narration: 'Forwarding is a wire: take the result from the end of EX or from the end of MEM and hand it straight to the next EX.'
    },
    {
      id: 'fw-2', start: 157.5, end: 165, scene: 'forward',
      caption: 'With forwarding, an arithmetic producer to consumer gap needs zero stalls, because EX output and EX input are one cycle apart.',
      detail: 'Producer in EX at cycle c produces its result at the end of c. The consumer is in EX at c+1 and needs the value at the start of c+1. The wire closes the gap exactly, so no stall is needed. That is why a chain of dependent arithmetic instructions runs at one per cycle.',
      keyword: 'needs zero stalls',
      trap: 'Forwarding does not make dependent instructions free of dependence. It makes them free of stalls. The ordering is still enforced; only the waiting disappears.',
      narration: 'With forwarding, an arithmetic producer to consumer gap needs zero stalls, because EX output and EX input are one cycle apart.'
    },
    {
      id: 'fw-3', start: 165, end: 172.5, scene: 'forward',
      caption: 'A load is the exception: its value appears only at the end of MEM, so the very next instruction needs one cycle of waiting.',
      detail: 'A load produces its data in MEM, one stage later than an arithmetic instruction. A consumer in EX one cycle later needs the value before the load has it. No wire can supply a value that does not exist yet, so the pipeline stalls exactly one cycle. This is the load-use delay, and it survives every forwarding network.',
      keyword: 'exactly one stall',
      trap: '"Forwarding removes all data-hazard stalls" is false, and it is offered as an option in GATE CSE 2024 Set 1. The load-use case is the standard counterexample.',
      narration: 'A load is the exception: its value appears only at the end of MEM, so the very next instruction needs one cycle of waiting.'
    },
    {
      id: 'fw-4', start: 172.5, end: 180, scene: 'forward',
      caption: 'The 2021 Set 2 paper prices it: 30 cycles without forwarding against 16 with, so the speedup of forwarding is 1.875.',
      detail: 'GATE CSE 2021 Set 2 runs eight alternating ADD and MUL instructions, each depending on the one before, with MUL taking two cycles in EX. Without forwarding the sequence takes 30 cycles; with forwarding it takes 16. The ratio the paper defines is 30 / 16 = 1.875.',
      keyword: '1.875',
      trap: 'The question defines speedup the other way round from the usual convention, as without-over-with. Read the definition the paper gives rather than the one you expect.',
      narration: 'The 2021 Set 2 paper prices it: 30 cycles without forwarding against 16 with, so the speedup of forwarding is 1.875.'
    },

    /* ---------------- scene 7: WAR and WAW ---------------- */
    {
      id: 'ww-1', start: 180, end: 187.5, scene: 'warwaw',
      caption: 'Write after read is an anti-dependence: the writer must not overwrite before the reader has read.',
      detail: 'Instruction 1 reads R3 and instruction 2 writes R3. The values are not related, but the order matters. If the write happens first, the read gets the wrong value. The dependence is on the name R3, not on any data.',
      keyword: 'anti-dependence',
      trap: 'WAR is not a true dependence. Neither instruction needs the other\'s value, so no forwarding wire can help; only the order has to be preserved.',
      narration: 'Write after read is an anti-dependence: the writer must not overwrite before the reader has read.'
    },
    {
      id: 'ww-2', start: 187.5, end: 195, scene: 'warwaw',
      caption: 'Write after write is an output dependence: two writes to one name, and the final value must be the later one.',
      detail: 'Instructions 1 and 3 both write R3. Whatever the intermediate value was, the architectural state after both must be instruction 3\'s result. Again the constraint is on the name, and again no data flows between them.',
      keyword: 'output dependence',
      trap: 'WAW is not "double write, therefore hazard" in every machine. In a strictly in-order five-stage pipeline writes happen in order, so WAW cannot invert and causes no stall.',
      narration: 'Write after write is an output dependence: two writes to one name, and the final value must be the later one.'
    },
    {
      id: 'ww-3', start: 195, end: 202.5, scene: 'warwaw',
      caption: 'Register renaming gives each write a fresh physical register, which dissolves WAR and WAW but never RAW.',
      detail: 'If instruction 3 writes physical register 41 rather than architectural R3, no one can be confused about which value is which, and the two constraints disappear. The reader of R3 still needs instruction 1\'s value, so RAW survives: it is about data, and renaming does not move data.',
      keyword: 'dissolves WAR and WAW but never RAW',
      trap: 'Renaming is offered in GATE CSE 2012 as the answer to "to handle certain kinds of hazards". Certain kinds, not all kinds. RAW is the exception and it is the one that matters most.',
      narration: 'Register renaming gives each write a fresh physical register, which dissolves WAR and WAW but never RAW.'
    },
    {
      id: 'ww-4', start: 202.5, end: 210, scene: 'warwaw',
      caption: 'The 2024 Set 2 paper offers four labels and only one is right: RAW on R3 between I1 and I2.',
      detail: 'GATE CSE 2024 Set 2 gives DIV R3, R1, R2 then SUB R5, R3, R4 then ADD R3, R5, R6 then MUL R7, R3, R8. Tag every access to R3: I1 writes it, I2 reads it, I3 writes it, I4 reads it. So I1 to I2 is RAW and true. I1 to I3 is write after write, not write after read, because I1 never reads R3. I2 to I3 is write after read, not read after write. I3 to I4 is read after write, not write after write, because I4 only reads R3.',
      keyword: 'only one label is right',
      trap: 'Two of the four options name a real dependence but give it the wrong name. The repair is to tag each access as a read or a write first, then read the pair off the tags; never pattern-match on which instruction comes first.',
      narration: 'The 2024 Set 2 paper offers four labels and only one is right: RAW on R3 between I1 and I2.'
    },

    /* ---------------- scene 8: control hazards ---------------- */
    {
      id: 'ch-1', start: 210, end: 217.5, scene: 'control',
      caption: 'A branch decides which instruction to fetch, and the fetch happens before the decision is known.',
      detail: 'The pipeline fetches the next sequential instruction while the branch is still being decoded. If the branch is taken, that fetch was wrong and its work must be discarded. This is a control hazard, and unlike a data hazard it cannot be forwarded away, because the missing thing is not a value but an address.',
      keyword: 'the fetch happens before the decision is known',
      trap: 'A control hazard is not a data hazard with a branch. Nothing is being read too early; the wrong instruction is being run.',
      narration: 'A branch decides which instruction to fetch, and the fetch happens before the decision is known.'
    },
    {
      id: 'ch-2', start: 217.5, end: 225, scene: 'control',
      caption: 'The penalty is the number of stages between fetch and resolution: resolve in stage m and you waste m minus 1 cycles.',
      detail: 'If the branch resolves at the end of stage m, then stages 2 through m were filled with instructions from the wrong path, which is m minus 1 instructions, one cycle each. Resolve in EX at stage 3 and the penalty is 2. Resolve in MEM at stage 4 and it is 3. Delaying resolution always costs more.',
      keyword: 'waste m minus 1 cycles',
      trap: 'The penalty counts wasted cycles, not the stage number. Resolving in stage 3 costs 2, not 3, and the difference is one mark.',
      narration: 'The penalty is the number of stages between fetch and resolution: resolve in stage m and you waste m minus 1 cycles.'
    },
    {
      id: 'ch-3', start: 225, end: 232.5, scene: 'control',
      caption: 'A predictor turns the penalty into a probability: an 80 per cent accurate predictor leaves 20 per cent of the penalty.',
      detail: 'A correct prediction costs nothing and a wrong one costs the full penalty, so the expected cost per branch is the miss rate times the penalty. Fold that into the average over all instructions and you have the CPI. This is exactly the arithmetic of the 2022 paper.',
      keyword: 'miss rate times the penalty',
      trap: 'Accuracy is not the same as saving. An 80 per cent predictor removes 80 per cent of the stall cost, not 80 per cent of the branches.',
      narration: 'A predictor turns the penalty into a probability: an 80 per cent accurate predictor leaves 20 per cent of the penalty.'
    },
    {
      id: 'ch-4', start: 232.5, end: 240, scene: 'control',
      caption: 'The 2022 paper: 1.6 cycles before, 1.12 after, so 1.43. The 2014 Set 3 paper: a longer pipe costs more per branch.',
      detail: 'GATE CSE 2022 has 30 per cent branches stalling 2 cycles each, so CPI is 1.6; with an 80 per cent accurate predictor the stall is 0.3 times 0.2 times 2 = 0.12, so CPI is 1.12, and the speedup is 1.43. GATE CSE 2014 Set 3 splits a 5-stage pipeline into 8 stages and moves resolution from stage 3 to stage 6, so the penalty rises from 2 to 5 and the extra depth is partly cancelled.',
      keyword: '1.6 before, 1.12 after',
      trap: 'A deeper pipeline has a smaller beat and a larger branch penalty. Both effects are real, and a question that mentions only one of them is asking you to supply the other.',
      narration: 'The 2022 paper: 1.6 cycles before, 1.12 after, so 1.43. The 2014 Set 3 paper: a longer pipe costs more per branch.'
    },

    /* ---------------- scene 9: effective CPI ---------------- */
    {
      id: 'cp-1', start: 240, end: 247.5, scene: 'cpi',
      caption: 'One formula covers every speedup question: CPI is 1 plus the sum over hazard types of fraction times stalls.',
      detail: 'The base of 1 is the ideal pipelined throughput of one instruction per cycle. Each hazard type contributes its own fraction of instructions multiplied by the stalls each of those costs. Sum the contributions and you have the average cycles per instruction.',
      keyword: '1 plus the sum of fraction times stalls',
      trap: 'Fractions are of all instructions, not of the affected subset. A stall that hits 5 per cent of the 30 per cent that are memory instructions contributes 0.30 times 0.05, not 0.05.',
      narration: 'One formula covers every speedup question: CPI is 1 plus the sum over hazard types of fraction times stalls.'
    },
    {
      id: 'cp-2', start: 247.5, end: 255, scene: 'cpi',
      caption: 'The 2024 Set 2 paper: 1 plus 0.4 plus 0.6 is 2 cycles against 6, so the speedup is 3.',
      detail: 'GATE CSE 2024 Set 2 has a non-pipelined unit at 2 GHz needing 6 cycles per instruction, and a 5-stage pipeline at the same 2 GHz where 20 per cent of instructions stall 2 cycles for data and 20 per cent stall 3 for control. CPI is 1 + 0.4 + 0.6 = 2, the clock is unchanged, so the speedup is 6 / 2 = 3.',
      keyword: '6 over 2 is 3',
      trap: 'Because the clock is the same in both designs, the frequency cancels. If the paper had changed the frequency, the same CPI would give a different speedup.',
      narration: 'The 2024 Set 2 paper: 1 plus 0.4 plus 0.6 is 2 cycles against 6, so the speedup is 3.'
    },
    {
      id: 'cp-3', start: 255, end: 262.5, scene: 'cpi',
      caption: 'The 2020 paper: 1.85 cycles at 2 GHz against 5 cycles at 2.5 GHz. Multiply by the periods and get 2.16.',
      detail: 'GATE CSE 2020 gives a non-pipelined processor at 2.5 GHz taking 5 cycles, and a 5-stage pipeline at 2 GHz where 5 per cent of the 30 per cent memory instructions stall 50 cycles and 50 per cent of the 10 per cent branch instructions stall 2. CPI is 1 + 0.75 + 0.10 = 1.85. Times are 2 ns and 0.925 ns, so the speedup is 2.1622.',
      keyword: '2.16',
      trap: 'The clock changed, so the CPI ratio is not the speedup. 5 / 1.85 would be 2.70, which is the classic wrong option on this question.',
      narration: 'The 2020 paper: 1.85 cycles at 2 GHz against 5 cycles at 2.5 GHz. Multiply by the periods and get 2.16.'
    },
    {
      id: 'cp-4', start: 262.5, end: 270, scene: 'cpi',
      caption: 'The 2026 Set 2 paper: 3.125 nanoseconds against 1.333, so 2.34. And the 2017 Set 1 paper needs the cycle count, not the CPI.',
      detail: 'GATE CSE 2026 Set 2 has a non-pipelined 1.6 GHz unit needing 5 cycles, and a pipeline at 1.2 GHz where 30 per cent of instructions stall 2. The times are 3.125 ns and 1.3333 ns, so the speedup is 2.3437. GATE CSE 2017 Set 1 asks for 20 independent instructions, so the k + n - 1 count applies and the answer is 528 / 350 = 1.5086.',
      keyword: '2.34 and 1.51',
      trap: 'A small instruction count means the fill and drain dominate, so the CPI shortcut is invalid there. Use k + n - 1 when n is given and small; use CPI when the program is described statistically.',
      narration: 'The 2026 Set 2 paper: 3.125 nanoseconds against 1.333, so 2.34. And the 2017 Set 1 paper needs the cycle count, not the CPI.'
    },

    /* ---------------- scene 10: the decision procedure ---------------- */
    {
      id: 'rc-1', start: 270, end: 277.5, scene: 'recipe',
      caption: 'Five steps: find the beat, count the cycles, add the stalls, convert units, then divide.',
      detail: 'The beat is the maximum stage delay plus one latch delay. The cycle count is k + n - 1 when n is given, or n times the effective CPI when the program is statistical. Stalls come from each hazard at its own fraction. Convert every unit before dividing. Then speedup is old time over new time.',
      keyword: 'beat, cycles, stalls, units, divide',
      trap: 'Doing the steps out of order is what produces a plausible wrong number. In particular, converting units after dividing loses the trailing decimals the NAT format requires.',
      narration: 'Five steps: find the beat, count the cycles, add the stalls, convert units, then divide.'
    },
    {
      id: 'rc-2', start: 277.5, end: 285, scene: 'recipe',
      caption: 'Three quantities get confused: latency, throughput and speedup. Only one of them is bounded by k.',
      detail: 'Latency is the time one instruction takes, and pipelining does not change it. Throughput is completions per unit time, and pipelining improves it. Speedup is a ratio of two execution times, and its ideal value is k for a long program. Only speedup is bounded by the stage count.',
      keyword: 'only speedup is bounded by k',
      trap: 'A perfectly balanced pipeline does not make one instruction k times faster. If an option says so, it is wrong however natural it sounds.',
      narration: 'Three quantities get confused: latency, throughput and speedup. Only one of them is bounded by k.'
    },
    {
      id: 'rc-3', start: 285, end: 292.5, scene: 'recipe',
      caption: 'Two more traps: forwarding does not remove the load-use stall, and renaming does not remove RAW.',
      detail: 'Both are statements that are almost true, which is why they are offered as options. Forwarding removes every arithmetic-to-arithmetic stall and leaves exactly one cycle after a load. Renaming removes the anti-dependence and the output dependence and leaves the true dependence untouched.',
      keyword: 'load-use and RAW survive',
      trap: 'The word "all" in a claim about hazard removal is usually the error. Forwarding removes all stalls except one class; renaming removes all name-based hazards and no data-based ones.',
      narration: 'Two more traps: forwarding does not remove the load-use stall, and renaming does not remove RAW.'
    },
    {
      id: 'rc-4', start: 292.5, end: 300, scene: 'recipe',
      caption: 'And the fifth trap: a stall costs a cycle, not a stage. Every count in this lesson is in cycles.',
      detail: 'The units of every answer in this topic are cycles, nanoseconds or a ratio. A stall of two means two clock periods of idleness, not two stages removed. Mixing a stage count with a stall count is the last of the five, and it is the one that survives longest.',
      keyword: 'a stall costs a cycle, not a stage',
      trap: 'If an answer is a whole number of cycles and the options are in nanoseconds, you have stopped one step early. Multiply by the period.',
      narration: 'And the fifth trap: a stall costs a cycle, not a stage. Every count in this lesson is in cycles.'
    }
  ]
};
