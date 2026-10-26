# ALU and Control Unit Design: Datapath, Hardwired and Microprogrammed Control — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/alu-and-control-unit-design/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A datapath does the work, the control unit decides it

*0:00 – 0:30 · objective: Split a processor into the two parts the syllabus names: the datapath, which holds and combines values, and the control unit, which decides what happens in each step.*

**0:00–0:07** — A processor is two things: a datapath that holds and combines values, and a control unit that says what to do this step.

> Caption: A processor is two things: a datapath that holds and combines values, and a control unit that says what to do this step.

Exam-trap caption mode adds: *A diagram question often draws both and labels only one. Read what each arrow carries before answering: a data arrow belongs to the datapath, a control arrow to the control unit.*

**0:07–0:15** — The datapath is registers, an ALU and buses. A register may read onto the bus or write from it, and one bus carries one value per step.

> Caption: The datapath is registers, an ALU and buses. A register may read onto the bus or write from it, and one bus carries one value per step.

Exam-trap caption mode adds: *The bus is not a register. It holds nothing between steps; a value that must survive to the next step has to be latched into a register first.*

**0:15–0:22** — The ALU has no idea which operation it is performing. Function-select lines pick one of its functions, and the control unit drives them.

> Caption: The ALU has no idea which operation it is performing. Function-select lines pick one of its functions, and the control unit drives them.

Exam-trap caption mode adds: *It is tempting to say the ALU decodes the instruction. It does not. Decoding is the control unit’s work; the ALU only obeys the select lines it is given.*

**0:22–0:30** — Every instruction becomes a list of micro-operations, one per control step. The control unit’s job is to emit the right signals in the right step.

> Caption: Every instruction becomes a list of micro-operations, one per control step. The control unit’s job is to emit the right signals in the right step.

Exam-trap caption mode adds: *A micro-operation is not an instruction and not a microinstruction. A micro-operation is an action, a microinstruction is the word that requests one or more actions, and an instruction is a chain of microinstructions.*

## Scene 2. The ALU: one bit slice, repeated n times

*0:30 – 1:00 · objective: Build one bit of an ALU out of an AND gate, an OR gate, a full adder and a multiplexer, and count the function-select lines that choose between them.*

**0:30–0:37** — One bit of an ALU takes two bits and a carry in, and produces a result bit and a carry out.

> Caption: One bit of an ALU takes two bits and a carry in, and produces a result bit and a carry out.

Exam-trap caption mode adds: *A slice has one carry in and one carry out, not two of each. The borrow of a subtraction is the carry of an addition, because subtraction is done as addition.*

**0:37–0:45** — Inside the slice the AND gate, the OR gate and a full adder all compute at once, and a multiplexer chooses which answer leaves.

> Caption: Inside the slice the AND gate, the OR gate and a full adder all compute at once, and a multiplexer chooses which answer leaves.

Exam-trap caption mode adds: *Adding a function to an ALU costs one more input to the multiplexer, not one more pass through the circuit. The delay of the ALU barely changes when functions are added; its width does.*

**0:45–0:52** — The function-select lines are the multiplexer’s address. Four functions need two select bits, and eight functions need three.

> Caption: The function-select lines are the multiplexer’s address. Four functions need two select bits, and eight functions need three.

Exam-trap caption mode adds: *The count is of functions, not of operands. An ALU with 8 functions and two 16-bit inputs still needs 3 select lines; the operand width changes the datapath, never the select count.*

**0:52–1:00** — In general k functions need the ceiling of log base two of k select lines, so an ALU with two lines and three functions wastes one code.

> Caption: In general k functions need the ceiling of log base two of k select lines, so an ALU with two lines and three functions wastes one code.

Exam-trap caption mode adds: *Do not round down. Five functions do not fit in two lines even though 2^2 is close to 5; five needs three lines, and the eighth code is the one left over.*

## Scene 3. Subtraction is addition, and overflow is not carry

*1:00 – 1:30 · objective: See that subtraction costs one invert line rather than a subtractor, and separate the carry flag from the signed overflow flag with a pair of counterexamples.*

**1:00–1:07** — There is no subtractor. Subtraction is A plus the complement of B plus one, and a single invert line makes the switch.

> Caption: There is no subtractor. Subtraction is A plus the complement of B plus one, and a single invert line makes the switch.

Exam-trap caption mode adds: *The plus one is not optional and it is not the carry-out. Dropping it gives the one’s complement difference, which is off by one for every non-zero B.*

**1:07–1:15** — The adder’s carry out becomes the carry flag, the top bit of the result becomes the sign flag, and an all-zero result sets the zero flag.

> Caption: The adder’s carry out becomes the carry flag, the top bit of the result becomes the sign flag, and an all-zero result sets the zero flag.

Exam-trap caption mode adds: *The sign flag is the top bit of the result, so it is only meaningful if the numbers are being read as signed. For an unsigned comparison the same bit is just the high bit of the magnitude.*

**1:15–1:22** — Overflow is not the carry out. For signed numbers it is the carry into the top bit, exclusive-or the carry out of it.

> Caption: Overflow is not the carry out. For signed numbers it is the carry into the top bit, exclusive-or the carry out of it.

Exam-trap caption mode adds: *This is the single most examined fact in the topic. Writing "overflow means carry out is one" loses the mark in both directions, as the next cue shows with two numbers.*

**1:22–1:30** — So 127 plus 1 in eight bits overflows with no carry out, and 255 plus 1 carries out with no overflow. The page checks all 65536 pairs.

> Caption: So 127 plus 1 in eight bits overflows with no carry out, and 255 plus 1 carries out with no overflow. The page checks all 65536 pairs.

Exam-trap caption mode adds: *Every pair of these two numbers is worth memorising, because a multiple-select question can offer "carry implies overflow" and "overflow implies carry" and both are false.*

## Scene 4. Why the carry chain is the ALU’s worst case

*1:30 – 2:00 · objective: Read the delay of a ripple-carry ALU as n times one slice, and see carry look-ahead turn that depth into a logarithm.*

**1:30–1:37** — Chain n one-bit adders and the carry must ripple through all n. The top bit cannot finish until the carry reaches it.

> Caption: Chain n one-bit adders and the carry must ripple through all n. The top bit cannot finish until the carry reaches it.

Exam-trap caption mode adds: *The delay is set by the worst-case carry path, not by the average. On most inputs the carry dies early; the delay quoted is for the input that keeps it alive all the way.*

**1:37–1:45** — So a ripple-carry ALU takes time proportional to n. Doubling the width doubles the delay, and the gate count doubles with it.

> Caption: So a ripple-carry ALU takes time proportional to n. Doubling the width doubles the delay, and the gate count doubles with it.

Exam-trap caption mode adds: *Doubling the width does not double the time of every circuit in the processor. A multiplexer’s delay grows only logarithmically in its number of inputs, which is why the ALU’s multiplexer is not the problem.*

**1:45–1:52** — Carry look-ahead computes every carry from generate and propagate signals in a tree, so its depth grows like log n instead of n.

> Caption: Carry look-ahead computes every carry from generate and propagate signals in a tree, so its depth grows like log n instead of n.

Exam-trap caption mode adds: *Look-ahead does not make the adder faster in gate count; it usually costs more gates. It buys depth, and depth is what the clock period depends on.*

**1:52–2:00** — That is why a question about an ALU asks for its delay, not its gate count, and why the adder sits on the critical path.

> Caption: That is why a question about an ALU asks for its delay, not its gate count, and why the adder sits on the critical path.

Exam-trap caption mode adds: *A shorter clock does not mean a faster program if the instruction needs more steps. Steps times period is the time, and both halves of that product are choices.*

## Scene 5. One bus means one transfer per step

*2:00 – 2:30 · objective: Follow the five micro-operations of R0 <- R1 + R2 on the single-bus datapath of the GATE 2020 question, and see why they cannot be reordered.*

**2:00–2:07** — The GATE 2020 datapath is a single bus: every register hangs off it, and only one may drive it in a step.

> Caption: The GATE 2020 datapath is a single bus: every register hangs off it, and only one may drive it in a step.

Exam-trap caption mode adds: *Two transfers in one step is not "faster", it is a bus conflict. Any option that puts two sources on the bus in the same step is wrong regardless of what it computes.*

**2:07–2:15** — So R0 <- R1 + R2 cannot be one step. The ALU takes one operand from the bus and the other from TEMP1, a latched input.

> Caption: So R0 <- R1 + R2 cannot be one step. The ALU takes one operand from the bus and the other from TEMP1, a latched input.

Exam-trap caption mode adds: *Students assume both ALU inputs come off the bus, and then wonder why a step is needed at all. In a single-bus design at most one operand can arrive that way.*

**2:15–2:22** — So R1 goes to TEMP1 first, then R2 is put on the bus and the sum is latched into TEMP2, then TEMP2 is written into R0.

> Caption: So R1 goes to TEMP1 first, then R2 is put on the bus and the sum is latched into TEMP2, then TEMP2 is written into R0.

Exam-trap caption mode adds: *TEMP2 exists because the ALU output cannot go straight to R0 in the same step that R2 is on the bus: the result is not ready until the end of the step, and the bus has already been used.*

**2:22–2:30** — And the instruction must be fetched before any of it: PC to MAR, a memory read, then MDR to IR. Five steps, in that order.

> Caption: And the instruction must be fetched before any of it: PC to MAR, a memory read, then MDR to IR. Five steps, in that order.

Exam-trap caption mode adds: *The tempting wrong answer puts the execute steps in numeric order, 1 before 2, which uses TEMP1 before it has been filled. The dependency, not the numbering, fixes the order.*

## Scene 6. From micro-operations to clock cycles

*2:30 – 3:00 · objective: Turn a list of micro-operations into a number of control steps, and a number of steps into an execution time.*

**2:30–2:37** — One control step is one clock. An instruction’s time is its number of steps multiplied by the clock period.

> Caption: One control step is one clock. An instruction’s time is its number of steps multiplied by the clock period.

Exam-trap caption mode adds: *A clock period shorter than the longest path in a step does not make the machine faster; it makes the machine wrong. The period is a lower bound set by the slowest path.*

**2:37–2:45** — On a single bus, an add of two register operands costs three execute steps. On a three-bus datapath the same add costs one.

> Caption: On a single bus, an add of two register operands costs three execute steps. On a three-bus datapath the same add costs one.

Exam-trap caption mode adds: *The saving is in steps, not in the clock period. A three-bus datapath usually has a longer clock because the ALU and the buses have to settle, so compare total time, not step count.*

**2:45–2:52** — Extra temporary registers are not free: each latch that must be filled in its own step adds a step, and a step adds a clock.

> Caption: Extra temporary registers are not free: each latch that must be filled in its own step adds a step, and a step adds a clock.

Exam-trap caption mode adds: *Adding registers can never reduce the step count in a single-bus design unless it also reduces the number of transfers. The bus, not the register file, is the constraint.*

**2:52–3:00** — That is the trade in one line: buses and temporaries are hardware, and steps are time.

> Caption: That is the trade in one line: buses and temporaries are hardware, and steps are time.

Exam-trap caption mode adds: *The phrase "minimum number of clock cycles" is asking about steps. The phrase "minimum clock period" is asking about delay. Mixing them up is the most common slip in this topic.*

## Scene 7. Hardwired control: a circuit that knows the step

*3:00 – 3:30 · objective: See a hardwired control unit as an instruction decoder, a step counter and a block of gates, and say what that buys and what it costs.*

**3:00–3:07** — Hardwired control is a combinational circuit whose inputs are the opcode bits, the step counter and the condition flags.

> Caption: Hardwired control is a combinational circuit whose inputs are the opcode bits, the step counter and the condition flags.

Exam-trap caption mode adds: *The step counter is not a program counter. The program counter addresses instructions in main memory; the step counter numbers the control steps inside one instruction.*

**3:07–3:15** — An instruction decoder turns the opcode into one active line, and a step counter counts the steps t0, t1, t2 and so on.

> Caption: An instruction decoder turns the opcode into one active line, and a step counter counts the steps t0, t1, t2 and so on.

Exam-trap caption mode adds: *The decoder needs one line per instruction, not one bit per instruction. The difference between a one-hot line and a binary code is exactly what the decoder is for.*

**3:15–3:22** — Each control signal is a boolean function of those inputs, so the control unit is a truth table built out of gates.

> Caption: Each control signal is a boolean function of those inputs, so the control unit is a truth table built out of gates.

Exam-trap caption mode adds: *This is the same minimisation as the Digital Logic lesson, applied to a different truth table. Nothing new is needed here except the realisation that the inputs are instruction, step and flags.*

**3:22–3:30** — Fast, because the signal appears after a gate delay. Inflexible, because a new instruction means rewiring the table.

> Caption: Fast, because the signal appears after a gate delay. Inflexible, because a new instruction means rewiring the table.

Exam-trap caption mode adds: *Hardwired is not "always faster" in every sense. It is faster per control signal, but a complex instruction set in hardwired control can be so large and irregular that a microprogrammed unit is both smaller and easier to verify.*

## Scene 8. Microprogrammed control: a program in a memory

*3:30 – 4:00 · objective: Replace the gate table with a control memory, and read a microinstruction as control signals plus a next address plus a condition select.*

**3:30–3:37** — A microprogrammed unit replaces the gate table with a memory. Each word of that memory is a microinstruction.

> Caption: A microprogrammed unit replaces the gate table with a memory. Each word of that memory is a microinstruction.

Exam-trap caption mode adds: *The control memory is not main memory. It is inside the control unit, it is read-only in normal operation, and its words are control signals rather than data.*

**3:37–3:45** — A microinstruction holds the control signals for one step, plus a next-address field, plus a condition select.

> Caption: A microinstruction holds the control signals for one step, plus a next-address field, plus a condition select.

Exam-trap caption mode adds: *The next-address field is not optional in a branching microprogram, and the condition field is not part of the control signals. A question that omits one of them is asking you to notice that it is needed.*

**3:45–3:52** — A microprogram counter addresses control memory, and the next-address field decides what is fetched next. That is how branching works.

> Caption: A microprogram counter addresses control memory, and the next-address field decides what is fetched next. That is how branching works.

Exam-trap caption mode adds: *Branching here is at the microinstruction level, not the program level. A conditional branch instruction becomes a microinstruction that selects one of two next addresses based on a flag.*

**3:52–4:00** — So the fetch routine is one shared sequence of microinstructions, and each instruction is a chain of them.

> Caption: So the fetch routine is one shared sequence of microinstructions, and each instruction is a chain of them.

Exam-trap caption mode adds: *The number of microinstructions is not simply instructions times steps when routines are shared. It is the number of distinct words, which is why a fetch routine is counted once.*

## Scene 9. Horizontal and vertical: width against decoding

*4:00 – 4:30 · objective: Compute a microinstruction width and a control-memory size in both formats, including the ceil(log2(n+1)) rule that vertical encoding needs.*

**4:00–4:07** — Horizontal: one bit per control signal. A wide word, no decoding, and every signal can fire at once.

> Caption: Horizontal: one bit per control signal. A wide word, no decoding, and every signal can fire at once.

Exam-trap caption mode adds: *Horizontal is not "one bit per instruction". The bits are per control signal, and a processor with 125 control signals has a control field of 125 bits however many instructions it has.*

**4:07–4:15** — Vertical: the signals are encoded in fields. A group of n mutually exclusive signals needs the ceiling of log base two of n plus one bits, because one code must mean none.

> Caption: Vertical: the signals are encoded in fields. A group of n mutually exclusive signals needs the ceiling of log base two of n plus one bits, because one code must mean none.

Exam-trap caption mode adds: *Four mutually exclusive signals need three bits, not two, because the all-zero code has to mean "no signal". This single fact decides several previous-year options.*

**4:15–4:22** — The word width is the control bits plus the condition-select bits plus the next-address bits, and the control memory size is words times width.

> Caption: The word width is the control bits plus the condition-select bits plus the next-address bits, and the control memory size is words times width.

Exam-trap caption mode adds: *Control memory size is asked for in bits, in words, or in both. Read which one the options are in before computing; 26624 bits and 1024 words are the same memory.*

**4:22–4:30** — The 2004 paper: 26 equals 13 plus 10 plus 3, and two to the ten is 1024 words. The arithmetic is the question.

> Caption: The 2004 paper: 26 equals 13 plus 10 plus 3, and two to the ten is 1024 words. The arithmetic is the question.

Exam-trap caption mode adds: *The status count gives the select width, and the select width is what is left over to find the address width. Read which quantity is the unknown before starting; the 2004 question gives the width and asks for the fields.*

## Scene 10. Choosing between them, and the numbers to carry in

*4:30 – 5:00 · objective: Fix the speed order hardwired > horizontal > vertical, the trade each one makes, and the four quantities every arithmetic question in this topic asks for.*

**4:30–4:37** — Speed order: hardwired fastest, then horizontal, then vertical. The 1999 paper asked exactly this.

> Caption: Speed order: hardwired fastest, then horizontal, then vertical. The 1999 paper asked exactly this.

Exam-trap caption mode adds: *Vertical has the smallest word and the smallest control memory, and is the slowest. Width and speed run in opposite directions here, which is what makes the comparison a good multiple-select question.*

**4:37–4:45** — A microprogrammed unit pays a control-memory read on every step, and a vertical one pays a decoder on top of that.

> Caption: A microprogrammed unit pays a control-memory read on every step, and a vertical one pays a decoder on top of that.

Exam-trap caption mode adds: *The extra delay is per control step, so it multiplies. A microprogrammed machine is not "slightly slower"; it is slower by the control-read time on every step of every instruction.*

**4:45–4:52** — Choose hardwired for a small, fixed, fast instruction set, and microprogrammed for a large or changeable one.

> Caption: Choose hardwired for a small, fixed, fast instruction set, and microprogrammed for a large or changeable one.

Exam-trap caption mode adds: *Neither is "better". A multiple-select question can offer both "hardwired is faster" and "microprogrammed is easier to modify" and both are true, so read whether the question wants one answer or several.*

**4:52–5:00** — Four numbers decide the arithmetic questions: select lines, word width, control-memory words, and control steps.

> Caption: Four numbers decide the arithmetic questions: select lines, word width, control-memory words, and control steps.

Exam-trap caption mode adds: *The four are independent, so a question cannot be answered by pattern-matching a previous one. Identify which of the four is being asked for, then compute that one and nothing else.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
