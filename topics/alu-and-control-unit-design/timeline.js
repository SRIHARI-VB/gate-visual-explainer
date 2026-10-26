/* ==========================================================================
   alu-and-control-unit-design - THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs - never edited by hand.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'datapath',
      n: 1,
      title: 'A datapath does the work, the control unit decides it',
      start: 0, end: 30,
      objective: 'Split a processor into the two parts the syllabus names: the datapath, which holds and combines values, and the control unit, which decides what happens in each step.'
    },
    {
      id: 'slice',
      n: 2,
      title: 'The ALU: one bit slice, repeated n times',
      start: 30, end: 60,
      objective: 'Build one bit of an ALU out of an AND gate, an OR gate, a full adder and a multiplexer, and count the function-select lines that choose between them.'
    },
    {
      id: 'flags',
      n: 3,
      title: 'Subtraction is addition, and overflow is not carry',
      start: 60, end: 90,
      objective: 'See that subtraction costs one invert line rather than a subtractor, and separate the carry flag from the signed overflow flag with a pair of counterexamples.'
    },
    {
      id: 'delay',
      n: 4,
      title: 'Why the carry chain is the ALU\u2019s worst case',
      start: 90, end: 120,
      objective: 'Read the delay of a ripple-carry ALU as n times one slice, and see carry look-ahead turn that depth into a logarithm.'
    },
    {
      id: 'bus',
      n: 5,
      title: 'One bus means one transfer per step',
      start: 120, end: 150,
      objective: 'Follow the five micro-operations of R0 <- R1 + R2 on the single-bus datapath of the GATE 2020 question, and see why they cannot be reordered.'
    },
    {
      id: 'steps',
      n: 6,
      title: 'From micro-operations to clock cycles',
      start: 150, end: 180,
      objective: 'Turn a list of micro-operations into a number of control steps, and a number of steps into an execution time.'
    },
    {
      id: 'hardwired',
      n: 7,
      title: 'Hardwired control: a circuit that knows the step',
      start: 180, end: 210,
      objective: 'See a hardwired control unit as an instruction decoder, a step counter and a block of gates, and say what that buys and what it costs.'
    },
    {
      id: 'micro',
      n: 8,
      title: 'Microprogrammed control: a program in a memory',
      start: 210, end: 240,
      objective: 'Replace the gate table with a control memory, and read a microinstruction as control signals plus a next address plus a condition select.'
    },
    {
      id: 'formats',
      n: 9,
      title: 'Horizontal and vertical: width against decoding',
      start: 240, end: 270,
      objective: 'Compute a microinstruction width and a control-memory size in both formats, including the ceil(log2(n+1)) rule that vertical encoding needs.'
    },
    {
      id: 'compare',
      n: 10,
      title: 'Choosing between them, and the numbers to carry in',
      start: 270, end: 300,
      objective: 'Fix the speed order hardwired > horizontal > vertical, the trade each one makes, and the four quantities every arithmetic question in this topic asks for.'
    }
  ],

  events: [

    /* ---------------- scene 1: datapath and control ---------------- */
    {
      id: 'dp-1', start: 0, end: 7.5, scene: 'datapath',
      caption: 'A processor is two things: a datapath that holds and combines values, and a control unit that says what to do this step.',
      detail: 'The datapath is the hardware that can do arithmetic and move data: registers, an arithmetic and logic unit, and the buses that connect them. The control unit is the hardware that decides which of those capabilities is used right now. The syllabus names both, and every question in this topic is about one or the other, or about the line between them.',
      keyword: 'a datapath and a control unit',
      trap: 'A diagram question often draws both and labels only one. Read what each arrow carries before answering: a data arrow belongs to the datapath, a control arrow to the control unit.',
      narration: 'A processor is two things: a datapath that holds and combines values, and a control unit that says what to do this step.'
    },
    {
      id: 'dp-2', start: 7.5, end: 15, scene: 'datapath',
      caption: 'The datapath is registers, an ALU and buses. A register may read onto the bus or write from it, and one bus carries one value per step.',
      detail: 'The number of buses is the number of values that can travel in one step. A single-bus datapath moves one value per step, which is why an addition there takes three or more steps. A three-bus datapath moves two operands in and one result out in the same step, which is why the same addition takes one.',
      keyword: 'one bus carries one value per step',
      trap: 'The bus is not a register. It holds nothing between steps; a value that must survive to the next step has to be latched into a register first.',
      narration: 'The datapath is registers, an ALU and buses. A register may read onto the bus or write from it, and one bus carries one value per step.'
    },
    {
      id: 'dp-3', start: 15, end: 22.5, scene: 'datapath',
      caption: 'The ALU has no idea which operation it is performing. Function-select lines pick one of its functions, and the control unit drives them.',
      detail: 'An ALU is pure combinational logic: it computes AND, OR and the sum at the same time, and a multiplexer at its output chooses which answer leaves. The choice is a pattern of bits on the function-select input. Nothing inside the ALU remembers an instruction, and nothing inside it decides anything.',
      keyword: 'function-select lines pick one of its functions',
      trap: 'It is tempting to say the ALU decodes the instruction. It does not. Decoding is the control unit\u2019s work; the ALU only obeys the select lines it is given.',
      narration: 'The ALU has no idea which operation it is performing. Function-select lines pick one of its functions, and the control unit drives them.'
    },
    {
      id: 'dp-4', start: 22.5, end: 30, scene: 'datapath',
      caption: 'Every instruction becomes a list of micro-operations, one per control step. The control unit\u2019s job is to emit the right signals in the right step.',
      detail: 'A micro-operation is one elementary transfer or computation, such as "copy R1 into TEMP1". A control step is one clock in which a set of micro-operations runs together. The control unit turns the instruction and the step number into the control signals that make that step happen.',
      keyword: 'one per control step',
      trap: 'A micro-operation is not an instruction and not a microinstruction. A micro-operation is an action, a microinstruction is the word that requests one or more actions, and an instruction is a chain of microinstructions.',
      narration: 'Every instruction becomes a list of micro-operations, one per control step. The control unit\u2019s job is to emit the right signals in the right step.'
    },

    /* ---------------- scene 2: the ALU slice ---------------- */
    {
      id: 'sl-1', start: 30, end: 37.5, scene: 'slice',
      caption: 'One bit of an ALU takes two bits and a carry in, and produces a result bit and a carry out.',
      detail: 'That is the whole of a one-bit slice. Everything an n-bit ALU does is n copies of this slice wired side by side, with the carry out of each feeding the carry in of the next. That wiring is why the width of an ALU changes its delay and not just its size.',
      keyword: 'two bits and a carry in',
      trap: 'A slice has one carry in and one carry out, not two of each. The borrow of a subtraction is the carry of an addition, because subtraction is done as addition.',
      narration: 'One bit of an ALU takes two bits and a carry in, and produces a result bit and a carry out.'
    },
    {
      id: 'sl-2', start: 37.5, end: 45, scene: 'slice',
      caption: 'Inside the slice the AND gate, the OR gate and a full adder all compute at once, and a multiplexer chooses which answer leaves.',
      detail: 'This is the sentence that explains why an ALU is fast: the operations are not performed one after another, they are performed simultaneously and the answer is selected. The selection is the only thing that depends on which operation was asked for.',
      keyword: 'a multiplexer chooses which answer leaves',
      trap: 'Adding a function to an ALU costs one more input to the multiplexer, not one more pass through the circuit. The delay of the ALU barely changes when functions are added; its width does.',
      narration: 'Inside the slice the AND gate, the OR gate and a full adder all compute at once, and a multiplexer chooses which answer leaves.'
    },
    {
      id: 'sl-3', start: 45, end: 52.5, scene: 'slice',
      caption: 'The function-select lines are the multiplexer\u2019s address. Four functions need two select bits, and eight functions need three.',
      detail: 'With k select lines a multiplexer has 2^k inputs, so k lines can choose among at most 2^k functions. Turning that round: k functions need at least log base two of k select lines, rounded up. Two lines give four codes, three lines give eight.',
      keyword: 'Four functions need two select bits',
      trap: 'The count is of functions, not of operands. An ALU with 8 functions and two 16-bit inputs still needs 3 select lines; the operand width changes the datapath, never the select count.',
      narration: 'The function-select lines are the multiplexer\u2019s address. Four functions need two select bits, and eight functions need three.'
    },
    {
      id: 'sl-4', start: 52.5, end: 60, scene: 'slice',
      caption: 'In general k functions need the ceiling of log base two of k select lines, so an ALU with two lines and three functions wastes one code.',
      detail: 'The page checks this for every k from two to sixteen: the number of select lines is the smallest s with 2^s at least k, and one less than that is always too few. The waste is real but harmless: an unused code simply selects nothing useful, or is wired to a harmless function.',
      keyword: 'the ceiling of log base two of k',
      trap: 'Do not round down. Five functions do not fit in two lines even though 2^2 is close to 5; five needs three lines, and the eighth code is the one left over.',
      narration: 'In general k functions need the ceiling of log base two of k select lines, so an ALU with two lines and three functions wastes one code.'
    },

    /* ---------------- scene 3: subtraction and flags ---------------- */
    {
      id: 'fl-1', start: 60, end: 67.5, scene: 'flags',
      caption: 'There is no subtractor. Subtraction is A plus the complement of B plus one, and a single invert line makes the switch.',
      detail: 'In two\u2019s complement, the negative of B is the bitwise complement of B plus one. So A minus B is A plus not-B plus one, which is the same adder with the B input inverted and the carry-in set to one. The page checks this on all 65536 pairs of eight-bit values.',
      keyword: 'A plus the complement of B plus one',
      trap: 'The plus one is not optional and it is not the carry-out. Dropping it gives the one\u2019s complement difference, which is off by one for every non-zero B.',
      narration: 'There is no subtractor. Subtraction is A plus the complement of B plus one, and a single invert line makes the switch.'
    },
    {
      id: 'fl-2', start: 67.5, end: 75, scene: 'flags',
      caption: 'The adder\u2019s carry out becomes the carry flag, the top bit of the result becomes the sign flag, and an all-zero result sets the zero flag.',
      detail: 'The flags are just wires tapped off the adder: the final carry out is C, the most significant result bit is S, and the zero flag is the NOR of all result bits. None of them costs an extra step, which is why they are free to record on every operation.',
      keyword: 'an all-zero result sets the zero flag',
      trap: 'The sign flag is the top bit of the result, so it is only meaningful if the numbers are being read as signed. For an unsigned comparison the same bit is just the high bit of the magnitude.',
      narration: 'The adder\u2019s carry out becomes the carry flag, the top bit of the result becomes the sign flag, and an all-zero result sets the zero flag.'
    },
    {
      id: 'fl-3', start: 75, end: 82.5, scene: 'flags',
      caption: 'Overflow is not the carry out. For signed numbers it is the carry into the top bit, exclusive-or the carry out of it.',
      detail: 'A signed overflow means the true answer does not fit in the width. That can only happen when the carry entering the top bit differs from the carry leaving it: if both are one, the extra weight cancels; if both are zero, nothing was lost. So V equals the exclusive-or of those two carries.',
      keyword: 'exclusive-or the carry out of it',
      trap: 'This is the single most examined fact in the topic. Writing "overflow means carry out is one" loses the mark in both directions, as the next cue shows with two numbers.',
      narration: 'Overflow is not the carry out. For signed numbers it is the carry into the top bit, exclusive-or the carry out of it.'
    },
    {
      id: 'fl-4', start: 82.5, end: 90, scene: 'flags',
      caption: 'So 127 plus 1 in eight bits overflows with no carry out, and 255 plus 1 carries out with no overflow. The page checks all 65536 pairs.',
      detail: '127 plus 1 is 128, which as a signed eight-bit number is minus 128: overflow, and the carry out is zero. 255 plus 1 is 256, so the carry out is one and the stored result is zero, but read as signed that is minus one plus one, which is zero and perfectly representable: no overflow. The two flags answer two different questions about the same adder.',
      keyword: 'overflows with no carry out',
      trap: 'Every pair of these two numbers is worth memorising, because a multiple-select question can offer "carry implies overflow" and "overflow implies carry" and both are false.',
      narration: 'So 127 plus 1 in eight bits overflows with no carry out, and 255 plus 1 carries out with no overflow. The page checks all 65536 pairs.'
    },

    /* ---------------- scene 4: the carry chain ---------------- */
    {
      id: 'dl-1', start: 90, end: 97.5, scene: 'delay',
      caption: 'Chain n one-bit adders and the carry must ripple through all n. The top bit cannot finish until the carry reaches it.',
      detail: 'Each slice needs its carry in before it can produce its carry out, so the carry travels one slice per gate delay. The sum bits settle at different times, and the last one to settle is the most significant. That last settling time is the delay of the whole adder.',
      keyword: 'the carry must ripple through all n',
      trap: 'The delay is set by the worst-case carry path, not by the average. On most inputs the carry dies early; the delay quoted is for the input that keeps it alive all the way.',
      narration: 'Chain n one-bit adders and the carry must ripple through all n. The top bit cannot finish until the carry reaches it.'
    },
    {
      id: 'dl-2', start: 97.5, end: 105, scene: 'delay',
      caption: 'So a ripple-carry ALU takes time proportional to n. Doubling the width doubles the delay, and the gate count doubles with it.',
      detail: 'That proportionality is what questions exploit: a 32-bit ripple-carry adder takes about twice as long as a 16-bit one, and the ratio is exact if each slice is identical. The page models one delay unit per slice and reports the total for widths four through sixty-four.',
      keyword: 'time proportional to n',
      trap: 'Doubling the width does not double the time of every circuit in the processor. A multiplexer\u2019s delay grows only logarithmically in its number of inputs, which is why the ALU\u2019s multiplexer is not the problem.',
      narration: 'So a ripple-carry ALU takes time proportional to n. Doubling the width doubles the delay, and the gate count doubles with it.'
    },
    {
      id: 'dl-3', start: 105, end: 112.5, scene: 'delay',
      caption: 'Carry look-ahead computes every carry from generate and propagate signals in a tree, so its depth grows like log n instead of n.',
      detail: 'A slice generates a carry when both its input bits are one, and propagates one when at least one is one. Those two signals can be combined pairwise, then the pairs combined again, and after log base two of n rounds every carry is known. The page builds such a tree and checks its carries against the ripple adder on random inputs.',
      keyword: 'a tree, so its depth grows like log n',
      trap: 'Look-ahead does not make the adder faster in gate count; it usually costs more gates. It buys depth, and depth is what the clock period depends on.',
      narration: 'Carry look-ahead computes every carry from generate and propagate signals in a tree, so its depth grows like log n instead of n.'
    },
    {
      id: 'dl-4', start: 112.5, end: 120, scene: 'delay',
      caption: 'That is why a question about an ALU asks for its delay, not its gate count, and why the adder sits on the critical path.',
      detail: 'A datapath step is as long as its slowest path, and for an arithmetic step that path runs through the adder. Shortening the carry chain is therefore the way to shorten the clock, which is the whole reason look-ahead adders exist.',
      keyword: 'the adder sits on the critical path',
      trap: 'A shorter clock does not mean a faster program if the instruction needs more steps. Steps times period is the time, and both halves of that product are choices.',
      narration: 'That is why a question about an ALU asks for its delay, not its gate count, and why the adder sits on the critical path.'
    },

    /* ---------------- scene 5: the single bus ---------------- */
    {
      id: 'bs-1', start: 120, end: 127.5, scene: 'bus',
      caption: 'The GATE 2020 datapath is a single bus: every register hangs off it, and only one may drive it in a step.',
      detail: 'One bus means one value in flight. A step may read one register onto the bus and write that value into one register, and no more. Two registers driving the bus at once would short their outputs together, which is why the design forbids it rather than merely discouraging it.',
      keyword: 'only one may drive it in a step',
      trap: 'Two transfers in one step is not "faster", it is a bus conflict. Any option that puts two sources on the bus in the same step is wrong regardless of what it computes.',
      narration: 'The GATE 2020 datapath is a single bus: every register hangs off it, and only one may drive it in a step.'
    },
    {
      id: 'bs-2', start: 127.5, end: 135, scene: 'bus',
      caption: 'So R0 <- R1 + R2 cannot be one step. The ALU takes one operand from the bus and the other from TEMP1, a latched input.',
      detail: 'Look at where the ALU\u2019s two inputs come from in the diagram. One is the bus itself, combinationally; the other is the register TEMP1. That asymmetry is what forces the order: whatever must reach TEMP1 has to be moved there in an earlier step.',
      keyword: 'the other from TEMP1',
      trap: 'Students assume both ALU inputs come off the bus, and then wonder why a step is needed at all. In a single-bus design at most one operand can arrive that way.',
      narration: 'So R0 <- R1 + R2 cannot be one step. The ALU takes one operand from the bus and the other from TEMP1, a latched input.'
    },
    {
      id: 'bs-3', start: 135, end: 142.5, scene: 'bus',
      caption: 'So R1 goes to TEMP1 first, then R2 is put on the bus and the sum is latched into TEMP2, then TEMP2 is written into R0.',
      detail: 'Three execute steps. The first fills the latched input, the second performs the addition and parks the result in the ALU output latch, the third moves the result to its destination. Each step has exactly one bus source, which is the constraint the whole question is testing.',
      keyword: 'then TEMP2 is written into R0',
      trap: 'TEMP2 exists because the ALU output cannot go straight to R0 in the same step that R2 is on the bus: the result is not ready until the end of the step, and the bus has already been used.',
      narration: 'So R1 goes to TEMP1 first, then R2 is put on the bus and the sum is latched into TEMP2, then TEMP2 is written into R0.'
    },
    {
      id: 'bs-4', start: 142.5, end: 150, scene: 'bus',
      caption: 'And the instruction must be fetched before any of it: PC to MAR, a memory read, then MDR to IR. Five steps, in that order.',
      detail: 'The fetch is two steps because a memory read takes two: the address must be in MAR before the memory can be read, and the data arrives in MDR only afterwards. So the order is PC to MAR, then MDR to IR, then the three execute steps: 3, 5, 2, 1, 4 in the numbering of the 2020 question.',
      keyword: 'Five steps, in that order',
      trap: 'The tempting wrong answer puts the execute steps in numeric order, 1 before 2, which uses TEMP1 before it has been filled. The dependency, not the numbering, fixes the order.',
      narration: 'And the instruction must be fetched before any of it: PC to MAR, a memory read, then MDR to IR. Five steps, in that order.'
    },

    /* ---------------- scene 6: steps to time ---------------- */
    {
      id: 'st-1', start: 150, end: 157.5, scene: 'steps',
      caption: 'One control step is one clock. An instruction\u2019s time is its number of steps multiplied by the clock period.',
      detail: 'The control unit advances one step per clock, so the step count and the clock period together decide the time. Reducing either one makes the instruction faster, and the two are independent: you can widen the datapath, or you can shorten the clock, or both.',
      keyword: 'its number of steps multiplied by the clock period',
      trap: 'A clock period shorter than the longest path in a step does not make the machine faster; it makes the machine wrong. The period is a lower bound set by the slowest path.',
      narration: 'One control step is one clock. An instruction\u2019s time is its number of steps multiplied by the clock period.'
    },
    {
      id: 'st-2', start: 157.5, end: 165, scene: 'steps',
      caption: 'On a single bus, an add of two register operands costs three execute steps. On a three-bus datapath the same add costs one.',
      detail: 'With three buses both operands arrive together and the result leaves in the same step, so the whole addition is one step. That is why register-to-register machines with three-bus datapaths need so few control steps, and why they need more wires.',
      keyword: 'the same add costs one',
      trap: 'The saving is in steps, not in the clock period. A three-bus datapath usually has a longer clock because the ALU and the buses have to settle, so compare total time, not step count.',
      narration: 'On a single bus, an add of two register operands costs three execute steps. On a three-bus datapath the same add costs one.'
    },
    {
      id: 'st-3', start: 165, end: 172.5, scene: 'steps',
      caption: 'Extra temporary registers are not free: each latch that must be filled in its own step adds a step, and a step adds a clock.',
      detail: 'TEMP1 and TEMP2 exist to break the single-bus bottleneck, and each of them costs one step per use. The page counts this for the 2020 datapath: three execute steps because two latches have to be filled in sequence, against one step if the buses allowed both operands and the result to move at once.',
      keyword: 'each latch adds a step',
      trap: 'Adding registers can never reduce the step count in a single-bus design unless it also reduces the number of transfers. The bus, not the register file, is the constraint.',
      narration: 'Extra temporary registers are not free: each latch that must be filled in its own step adds a step, and a step adds a clock.'
    },
    {
      id: 'st-4', start: 172.5, end: 180, scene: 'steps',
      caption: 'That is the trade in one line: buses and temporaries are hardware, and steps are time.',
      detail: 'The datapath designer chooses how many values can move at once, and pays in wires and in the clock period. The control designer chooses how many steps each instruction takes, and pays in the instruction\u2019s latency. Neither choice is free, and a question about "faster" is really a question about which of the two you are allowed to change.',
      keyword: 'buses and temporaries are hardware',
      trap: 'The phrase "minimum number of clock cycles" is asking about steps. The phrase "minimum clock period" is asking about delay. Mixing them up is the most common slip in this topic.',
      narration: 'That is the trade in one line: buses and temporaries are hardware, and steps are time.'
    },

    /* ---------------- scene 7: hardwired control ---------------- */
    {
      id: 'hw-1', start: 180, end: 187.5, scene: 'hardwired',
      caption: 'Hardwired control is a combinational circuit whose inputs are the opcode bits, the step counter and the condition flags.',
      detail: 'Nothing in a hardwired unit is stored. The control signals are the outputs of gates, and those gates see the current instruction and the current step at all times. That is the whole design, and it is why the answer appears after one gate delay rather than after a memory access.',
      keyword: 'the opcode bits, the step counter and the condition flags',
      trap: 'The step counter is not a program counter. The program counter addresses instructions in main memory; the step counter numbers the control steps inside one instruction.',
      narration: 'Hardwired control is a combinational circuit whose inputs are the opcode bits, the step counter and the condition flags.'
    },
    {
      id: 'hw-2', start: 187.5, end: 195, scene: 'hardwired',
      caption: 'An instruction decoder turns the opcode into one active line, and a step counter counts the steps t0, t1, t2 and so on.',
      detail: 'With m opcode bits the decoder has 2^m outputs, one per instruction code, of which exactly one is active. With s steps in the longest instruction the step counter needs log base two of s bits, or a ring of s flip-flops. The two together give one active pair: this instruction, this step.',
      keyword: 'one active line',
      trap: 'The decoder needs one line per instruction, not one bit per instruction. The difference between a one-hot line and a binary code is exactly what the decoder is for.',
      narration: 'An instruction decoder turns the opcode into one active line, and a step counter counts the steps t0, t1, t2 and so on.'
    },
    {
      id: 'hw-3', start: 195, end: 202.5, scene: 'hardwired',
      caption: 'Each control signal is a boolean function of those inputs, so the control unit is a truth table built out of gates.',
      detail: 'For each control signal you write down the (instruction, step) pairs in which it must be one, minimise that function, and build it. The result is a two-level or multi-level network whose size grows roughly with the number of instructions times the number of steps.',
      keyword: 'a truth table built out of gates',
      trap: 'This is the same minimisation as the Digital Logic lesson, applied to a different truth table. Nothing new is needed here except the realisation that the inputs are instruction, step and flags.',
      narration: 'Each control signal is a boolean function of those inputs, so the control unit is a truth table built out of gates.'
    },
    {
      id: 'hw-4', start: 202.5, end: 210, scene: 'hardwired',
      caption: 'Fast, because the signal appears after a gate delay. Inflexible, because a new instruction means rewiring the table.',
      detail: 'A hardwired unit is the right choice for a small, fixed, fast instruction set, which is why RISC designs favour it. Change one instruction and the gate network must be redesigned, re-verified and refabricated, which is the price of that speed.',
      keyword: 'a new instruction means rewiring the table',
      trap: 'Hardwired is not "always faster" in every sense. It is faster per control signal, but a complex instruction set in hardwired control can be so large and irregular that a microprogrammed unit is both smaller and easier to verify.',
      narration: 'Fast, because the signal appears after a gate delay. Inflexible, because a new instruction means rewiring the table.'
    },

    /* ---------------- scene 8: microprogrammed control ---------------- */
    {
      id: 'mp-1', start: 210, end: 217.5, scene: 'micro',
      caption: 'A microprogrammed unit replaces the gate table with a memory. Each word of that memory is a microinstruction.',
      detail: 'The control memory, also called the control store, holds the control signals for every step of every instruction. Executing an instruction means reading a sequence of these words, one per step, exactly as a CPU reads a program.',
      keyword: 'replaces the gate table with a memory',
      trap: 'The control memory is not main memory. It is inside the control unit, it is read-only in normal operation, and its words are control signals rather than data.',
      narration: 'A microprogrammed unit replaces the gate table with a memory. Each word of that memory is a microinstruction.'
    },
    {
      id: 'mp-2', start: 217.5, end: 225, scene: 'micro',
      caption: 'A microinstruction holds the control signals for one step, plus a next-address field, plus a condition select.',
      detail: 'Those three fields are the standard shape. The control field says what to do now, the next-address field says where to go next, and the condition-select field says which status bit decides between a branch and the following word. The page uses exactly this shape when it computes widths.',
      keyword: 'a next-address field, plus a condition select',
      trap: 'The next-address field is not optional in a branching microprogram, and the condition field is not part of the control signals. A question that omits one of them is asking you to notice that it is needed.',
      narration: 'A microinstruction holds the control signals for one step, plus a next-address field, plus a condition select.'
    },
    {
      id: 'mp-3', start: 225, end: 232.5, scene: 'micro',
      caption: 'A microprogram counter addresses control memory, and the next-address field decides what is fetched next. That is how branching works.',
      detail: 'Without a next-address field the microprogram counter would simply increment, and every instruction would be a straight line. With it, one word can jump to a shared routine, or choose between two addresses on a flag, which is what makes conditional execution possible.',
      keyword: 'the next-address field decides what is fetched next',
      trap: 'Branching here is at the microinstruction level, not the program level. A conditional branch instruction becomes a microinstruction that selects one of two next addresses based on a flag.',
      narration: 'A microprogram counter addresses control memory, and the next-address field decides what is fetched next. That is how branching works.'
    },
    {
      id: 'mp-4', start: 232.5, end: 240, scene: 'micro',
      caption: 'So the fetch routine is one shared sequence of microinstructions, and each instruction is a chain of them.',
      detail: 'Sharing is the point of the design: the three or four microinstructions that fetch an instruction are written once and jumped to by every instruction\u2019s microcode. That is why control memory can be much smaller than instructions times steps would suggest.',
      keyword: 'one shared sequence of microinstructions',
      trap: 'The number of microinstructions is not simply instructions times steps when routines are shared. It is the number of distinct words, which is why a fetch routine is counted once.',
      narration: 'So the fetch routine is one shared sequence of microinstructions, and each instruction is a chain of them.'
    },

    /* ---------------- scene 9: horizontal and vertical ---------------- */
    {
      id: 'fm-1', start: 240, end: 247.5, scene: 'formats',
      caption: 'Horizontal: one bit per control signal. A wide word, no decoding, and every signal can fire at once.',
      detail: 'With S control signals the control field is S bits, and each bit drives its own line directly. Nothing needs to be decoded, so the signals appear as soon as the word is read, and any combination of signals can be expressed in one word.',
      keyword: 'one bit per control signal',
      trap: 'Horizontal is not "one bit per instruction". The bits are per control signal, and a processor with 125 control signals has a control field of 125 bits however many instructions it has.',
      narration: 'Horizontal: one bit per control signal. A wide word, no decoding, and every signal can fire at once.'
    },
    {
      id: 'fm-2', start: 247.5, end: 255, scene: 'formats',
      caption: 'Vertical: the signals are encoded in fields. A group of n mutually exclusive signals needs the ceiling of log base two of n plus one bits, because one code must mean none.',
      detail: 'If a field selects at most one of n signals, then the field must also be able to select no signal at all, which gives n plus one meanings. So the field width is the ceiling of log base two of n plus one. For a power of two n this is one more bit than the naive logarithm, and that extra bit is the classic trap.',
      keyword: 'one code must mean none',
      trap: 'Four mutually exclusive signals need three bits, not two, because the all-zero code has to mean "no signal". This single fact decides several previous-year options.',
      narration: 'Vertical: the signals are encoded in fields. A group of n mutually exclusive signals needs the ceiling of log base two of n plus one bits, because one code must mean none.'
    },
    {
      id: 'fm-3', start: 255, end: 262.5, scene: 'formats',
      caption: 'The word width is the control bits plus the condition-select bits plus the next-address bits, and the control memory size is words times width.',
      detail: 'Three additions give the width, and one multiplication gives the size in bits. Every arithmetic question in this topic is some arrangement of those four quantities, which is why the page checks them against the published answers rather than asserting them.',
      keyword: 'words times width',
      trap: 'Control memory size is asked for in bits, in words, or in both. Read which one the options are in before computing; 26624 bits and 1024 words are the same memory.',
      narration: 'The word width is the control bits plus the condition-select bits plus the next-address bits, and the control memory size is words times width.'
    },
    {
      id: 'fm-4', start: 262.5, end: 270, scene: 'formats',
      caption: 'The 2004 paper: 26 equals 13 plus 10 plus 3, and two to the ten is 1024 words. The arithmetic is the question.',
      detail: 'Thirteen bits of micro-operation field, eight status bits so three bits of multiplexer select, and the remaining ten bits of next address, which address 1024 words of control memory. The page recomputes all three numbers from the stated fields and checks them against the keyed answer.',
      keyword: 'The arithmetic is the question',
      trap: 'The status count gives the select width, and the select width is what is left over to find the address width. Read which quantity is the unknown before starting; the 2004 question gives the width and asks for the fields.',
      narration: 'The 2004 paper: 26 equals 13 plus 10 plus 3, and two to the ten is 1024 words. The arithmetic is the question.'
    },

    /* ---------------- scene 10: comparing them ---------------- */
    {
      id: 'cm-1', start: 270, end: 277.5, scene: 'compare',
      caption: 'Speed order: hardwired fastest, then horizontal, then vertical. The 1999 paper asked exactly this.',
      detail: 'Hardwired signals come from gates, so they appear after one gate delay. Horizontal signals come from a memory read, which is slower than a gate but needs no decoding. Vertical signals come from a memory read plus a decoder, so they are slowest of the three.',
      keyword: 'hardwired fastest, then horizontal, then vertical',
      trap: 'Vertical has the smallest word and the smallest control memory, and is the slowest. Width and speed run in opposite directions here, which is what makes the comparison a good multiple-select question.',
      narration: 'Speed order: hardwired fastest, then horizontal, then vertical. The 1999 paper asked exactly this.'
    },
    {
      id: 'cm-2', start: 277.5, end: 285, scene: 'compare',
      caption: 'A microprogrammed unit pays a control-memory read on every step, and a vertical one pays a decoder on top of that.',
      detail: 'That is the accounting, and it is a structural argument rather than a measurement: the read is in the path from the microprogram counter to the control lines, and the decoder is in the path from the encoded field to the same lines. Adding a stage adds delay.',
      keyword: 'pays a decoder on top of that',
      trap: 'The extra delay is per control step, so it multiplies. A microprogrammed machine is not "slightly slower"; it is slower by the control-read time on every step of every instruction.',
      narration: 'A microprogrammed unit pays a control-memory read on every step, and a vertical one pays a decoder on top of that.'
    },
    {
      id: 'cm-3', start: 285, end: 292.5, scene: 'compare',
      caption: 'Choose hardwired for a small, fixed, fast instruction set, and microprogrammed for a large or changeable one.',
      detail: 'This is a design trade, not a fact about correctness. A hardwired unit is faster and smaller for a regular instruction set; a microprogrammed unit is easier to change, easier to verify instruction by instruction, and can express irregular instructions that would need a large and ugly gate network.',
      keyword: 'for a large or changeable one',
      trap: 'Neither is "better". A multiple-select question can offer both "hardwired is faster" and "microprogrammed is easier to modify" and both are true, so read whether the question wants one answer or several.',
      narration: 'Choose hardwired for a small, fixed, fast instruction set, and microprogrammed for a large or changeable one.'
    },
    {
      id: 'cm-4', start: 292.5, end: 300, scene: 'compare',
      caption: 'Four numbers decide the arithmetic questions: select lines, word width, control-memory words, and control steps.',
      detail: 'Select lines from the number of ALU functions, word width from the fields, control-memory words from the address field, and control steps from the micro-operation sequence on the given datapath. Every previous-year question in this topic is one of those four, asked in a different costume.',
      keyword: 'select lines, word width, control-memory words, and control steps',
      trap: 'The four are independent, so a question cannot be answered by pattern-matching a previous one. Identify which of the four is being asked for, then compute that one and nothing else.',
      narration: 'Four numbers decide the arithmetic questions: select lines, word width, control-memory words, and control steps.'
    }
  ]
};
