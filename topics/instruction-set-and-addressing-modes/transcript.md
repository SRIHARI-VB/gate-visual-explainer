# Instruction Set and Addressing Modes — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/instruction-set-and-addressing-modes/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 60 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. What the instruction set architecture is, and what it is not

*0:00 – 0:30 · objective: Separate the programmer-visible contract (operations, registers, formats, addressing modes) from the implementation (cache size, clock frequency, cache levels), and use that separation to answer an MSQ.*

**0:00–0:05** — The instruction set architecture is the part of a processor that a compiler is allowed to see, and nothing else is in it.

> Caption: The instruction set architecture is the part of a processor that a compiler is allowed to see.

**0:05–0:10** — Four things are visible from outside: the operations the machine offers, the registers a program may name, the format of an instruction word, and the addressing modes that turn a field into an address.

> Caption: Four things are visible: the operations, the registers, the instruction formats and the addressing modes.

**0:10–0:15** — Three things are not visible from outside, and they are exactly the ones people wrongly include: the size of the cache, the clock frequency, and how many levels of cache there are.

> Caption: Three things are not visible, and they are the ones people wrongly include: cache size, clock frequency, cache levels.

Exam-trap caption mode adds: *A datasheet lists cache size and clock speed, so they feel architectural. They are implementation: they change performance, never meaning.*

**0:15–0:20** — GATE 2025 Set 2, Question 28 asked which of four things is part of the instruction set architecture. The options were cache size, clock frequency, number of cache levels and total number of registers. Only the register count is.

> Caption: GATE 2025 Set 2 asked exactly this, and only the register count was the correct option.

**0:20–0:25** — Two processors with the same instruction set can differ in every implementation detail. Same instructions, different caches, different clocks, different pipeline depths.

> Caption: Two processors with the same instruction set can differ in every implementation detail.

**0:25–0:30** — So when a question says architecture, read the contract and not the hardware. Anything a program cannot observe is outside the instruction set.

> Caption: So when a question says architecture, read the contract, not the hardware.

## Scene 2. The instruction word is a bit budget

*0:30 – 1:00 · objective: Derive opcode, register and immediate widths from the number of instructions and registers, and check that the fields spend exactly the word length.*

**0:30–0:35** — Every instruction is a fixed number of bits, and the fields must spend them exactly. One bit too many and the format does not fit; one too few and some instruction cannot be encoded.

> Caption: Every instruction is a fixed number of bits, and the fields must spend them exactly.

**0:35–0:40** — A field that names one of n registers costs the ceiling of log base two of n bits. An opcode field that names one of k instructions costs the ceiling of log base two of k bits.

> Caption: A register field costs log base two of the number of registers; an opcode costs log base two of the number of instructions.

Exam-trap caption mode adds: *Rounding down. Forty-five instructions is not five bits; five bits name only thirty-two instructions.*

**0:40–0:45** — GATE 2014 Set 1, Question 9: a 32-bit architecture with one-word instructions, 64 registers each 32 bits wide, 45 instructions, each with an immediate operand in addition to two register operands.

> Caption: GATE 2014 Set 1: a 32-bit word, 64 registers, 45 instructions, two register operands.

**0:45–0:50** — The opcode needs six bits, the two register fields need six bits each, so twelve, and thirty-two minus eighteen leaves fourteen bits for the immediate operand.

> Caption: Six bits for the opcode, twelve for the two registers, so fourteen bits are left for the immediate.

**0:50–0:55** — An unsigned field of fourteen bits holds values from zero to two to the fourteen minus one, which is 16383. The largest value is one less than the number of patterns.

> Caption: An unsigned 14-bit immediate reaches 16383, not 16384, because counting starts at zero.

Exam-trap caption mode adds: *Answering 16384. The number of patterns is one more than the largest value representable.*

**0:55–1:00** — GATE 2025 Set 1, Question 37 changed the numbers: 64 general purpose registers and 50 distinct instruction types in a 32-bit instruction with one register operand. Six bits for the opcode, six for the register, twenty left for the immediate.

> Caption: GATE 2025 Set 1 gave 64 registers and 50 instruction types with one register operand: 20 bits remain.

## Scene 3. Expanding opcodes and the prefix rule

*1:00 – 1:30 · objective: Build a variable-length opcode with the escape trick, verify that no code is a prefix of another, and count the instructions each format buys.*

**1:00–1:05** — A fixed opcode field wastes space. The widest instruction decides the opcode width, and every narrower instruction then carries operand bits it does not need.

> Caption: A fixed opcode field wastes space, because most instructions need fewer operands than the widest one.

**1:05–1:10** — The escape trick fixes that. One opcode value is reserved to mean: the real opcode continues in the next field. Everything after the escape belongs to a narrower format.

> Caption: The escape trick: one opcode value means read the next four bits as another opcode.

**1:10–1:15** — Fifteen of the sixteen four-bit codes are three-register instructions. The sixteenth escapes to a second four-bit field, where fifteen codes are two-register instructions and one escapes again to one-register instructions.

> Caption: Fifteen codes give three-register instructions, one escape gives fifteen two-register ones, and again for one register.

**1:15–1:20** — The codes must be prefix-free. If one opcode is a prefix of another, the decoder cannot decide where the opcode ends, and the same bit string means two different instructions.

> Caption: The codes must be prefix-free: no code may be the beginning of another, or the decoder cannot tell them apart.

Exam-trap caption mode adds: *Assigning codes by hand without the escape and then claiming both counts. Without prefix-freeness the encodings overlap and the count is fiction.*

**1:20–1:25** — The three formats use fifteen sixteenths, plus fifteen two hundred fifty-sixths, plus fifteen four thousand ninety-sixths of the encoding space. That sums to just under one, so the scheme is legal and one prefix is left unused.

> Caption: Fifteen sixteenths plus fifteen two-hundred-fifty-sixths plus fifteen four-thousand-ninety-sixths is just under one.

**1:25–1:30** — GATE 2020, Question 44 used two formats. An I-type instruction spends six bits on the opcode, six on a register and four on an immediate. An R-type spends four on the opcode and twelve on two registers. Eight I-type opcodes are used, so how many R-type opcodes are possible? Sixteen.

> Caption: GATE 2020 made it two formats: eight six-bit I-type opcodes taken, and all sixteen four-bit R-type opcodes free.

Exam-trap caption mode adds: *Subtracting the eight I-type opcodes from the R-type total. The two fields are different widths, so the spaces do not overlap.*

## Scene 4. How many addresses one instruction names

*1:30 – 2:00 · objective: Evaluate one expression on a 3-, 2-, 1- and 0-address machine, and see that fewer addresses per instruction means shorter instructions and a longer program.*

**1:30–1:35** — Take one expression, A plus B, times C plus D, and evaluate it on four machines that differ only in how many operands an instruction may name.

> Caption: The same expression costs a different number of instructions on each machine.

**1:35–1:40** — A three-address machine needs three instructions. Add A and B into R1, add C and D into R2, multiply R1 and R2 into R3. Each instruction names two sources and a destination.

> Caption: Three-address: three instructions, one per operation, every operand a register.

**1:40–1:45** — A two-address machine needs five. Copy A into R1, add B to R1, copy C into R2, add D to R2, multiply R1 by R2. The two copies exist because one of the two operands is destroyed by the operation.

> Caption: Two-address: five, because the destination is also a source and needs a copy first.

**1:45–1:50** — A one-address machine, the accumulator machine, needs seven. Load A, add B, store the partial sum, load C, add D, multiply by the partial sum, store the answer.

> Caption: One-address, the accumulator machine: seven, because every value must pass through one register.

**1:50–1:55** — A zero-address machine, the stack machine, needs eight. Push A, push B, add, push C, push D, add, multiply, pop the answer. Every operand is pushed and every result appears on top of the stack.

> Caption: Zero-address, the stack machine: eight, because each operand is pushed and each result popped.

**1:55–2:00** — The pattern is exact: fewer addresses per instruction means shorter instructions and more of them. GATE 2015 Set 1 asked which fields a three-address format may name, and the answer is a memory operand or a register, never an implied accumulator.

> Caption: Fewer addresses per instruction means shorter instructions and more of them.

Exam-trap caption mode adds: *Assuming the shortest program is the fastest. It has the fewest instructions and the longest ones; total bytes and total cycles are separate questions.*

## Scene 5. Eight ways to name an operand

*2:00 – 2:30 · objective: Compute the effective address of every common mode from one fixed machine state, and see which of them touch memory at all.*

**2:00–2:05** — An addressing mode is a recipe that turns the bits in the instruction into one address. That address is called the effective address, and the operand is what lives there.

> Caption: An addressing mode is a recipe that turns bits in the instruction into one address.

**2:05–2:10** — Immediate addressing puts the value itself inside the instruction. Register addressing puts the value in a register named by the instruction. Neither of them reads memory for the operand.

> Caption: Immediate puts the value in the instruction; register puts it in a register. Neither touches memory.

**2:10–2:15** — Direct, also called absolute, puts the operand address in the instruction. Indirect puts the address of that address in the instruction, so the machine must read memory twice.

> Caption: Direct puts the address in the instruction; indirect puts the address of the address there.

Exam-trap caption mode adds: *Calling memory indirect one memory access. It is two: one to fetch the pointer, one to fetch the operand.*

**2:15–2:20** — Displacement mode adds a small constant held in the instruction to a base register. Indexed mode adds an index register instead, and on a byte-addressable machine the index is scaled by the size of one element.

> Caption: Displacement adds a constant to a base register; indexed adds an index register, scaled by element size.

**2:20–2:25** — PC-relative mode adds the offset to the program counter. Because both the offset and the counter move together when the program is relocated, the computed address is unaffected.

> Caption: PC-relative adds the offset to the program counter, which is what makes a branch position-independent.

**2:25–2:30** — Autoincrement uses the register as the address and then advances it. The advance is by the size of the item accessed, so a four-byte word advances the register by four, not by one.

> Caption: Autoincrement uses the register, then advances it by the size of the item, not by one.

Exam-trap caption mode adds: *GATE 2008 Question 33 tested exactly this: the increment depends on the data size, and that is the only one of the three statements that is true.*

## Scene 6. What each mode costs in memory accesses

*2:30 – 3:00 · objective: Count operand fetches per mode, add the instruction fetch when the question asks for the whole instruction, and account for a multi-word instruction.*

**2:30–2:35** — When a question asks for memory accesses, count them, and decide first whether the instruction fetch is included. Many wrong answers differ from the right one by exactly one.

> Caption: Count the memory accesses, and count the instruction fetch too.

Exam-trap caption mode adds: *The phrase in the execution cycle excludes the fetch. The phrase to fetch and execute the instruction includes it.*

**2:35–2:40** — Immediate and register modes cost nothing beyond the instruction fetch. Direct and register indirect cost one further read, because the operand lives in memory.

> Caption: Immediate and register cost nothing beyond the fetch; direct and register indirect cost one read.

**2:40–2:45** — Memory indirect costs two reads. The first read fetches the pointer from memory; the second read fetches the operand that the pointer names.

> Caption: Memory indirect costs two, because the pointer must itself be fetched.

**2:45–2:50** — A multi-word instruction costs one fetch per word. A two-word instruction is fetched in two reads, and the address field that would otherwise be part of the first word is fetched separately.

> Caption: A two-word instruction costs two fetches, and its address field sits in the second word.

**2:50–2:55** — Indexed addressing costs one read, plus an addition to form the effective address. The addition costs time inside the processor but it is not a memory access, and papers are usually asking about accesses.

> Caption: Indexed costs one read plus an addition; the addition is time, not a memory access.

**2:55–3:00** — The same instruction can be charged four memory cycles or five, depending on which question is asked. Read the phrase, not the mode.

> Caption: So the same instruction can be charged four or five, depending on which question is asked.

## Scene 7. Why each mode exists: one construct each

*3:00 – 3:30 · objective: Map constant, pointer, array element and record field onto immediate, indirect, base-with-index and base-with-displacement, and separate the two that look alike.*

**3:00–3:05** — No addressing mode exists for decoration. Each one is there because some construct of a high-level language cannot be compiled without it.

> Caption: Each mode is in the instruction set because one construct of a high-level language needs it.

**3:05–3:10** — Immediate addressing exists for constants, whose value is known before the program runs. Indirect addressing exists for pointers, because a pointer is an address held in memory and must be read before it can be followed.

> Caption: Immediate exists for constants; indirect exists for pointers, which are addresses held in memory.

**3:10–3:15** — Base with index exists for array elements, because the element number varies at run time and must be multiplied by the element size. Base with displacement exists for a field of a record, because the field offset is fixed when the program is compiled.

> Caption: Base with index exists for array elements; base with displacement exists for a field of a record.

**3:15–3:20** — GATE 2026 Set 1, Question 14 asked for this matching. Immediate to constant, indirect to pointer, base with index to an element of an array, base with displacement to an element of a record.

> Caption: GATE 2026 Set 1 asked for this matching, and the record field was base with displacement.

**3:20–3:25** — GATE 2017 Set 1, Question 11 put the base address of a struct in register R1 and asked how to reach the field grade. The answer is index mode with a sixteen-bit offset, which is base with displacement.

> Caption: GATE 2017 Set 1 put a struct in a register and asked for one field.

Exam-trap caption mode adds: *Post-increment and pre-decrement walk an array; they do not select a fixed field. Register direct would give the base, not the field.*

**3:25–3:30** — The distinction to keep is the scaling. In an array the index is multiplied by the element size, because consecutive elements are one element apart. In a record the offset is already in bytes and is added unchanged.

> Caption: The distinction is the scaling: an array multiplies the index by the element size, a record does not.

## Scene 8. PC-relative offsets and relocatable code

*3:30 – 4:00 · objective: Compute a signed branch offset from the next instruction, verify it reproduces the target, and say which modes survive a program being moved.*

**3:30–3:35** — A branch instruction stores a distance rather than an address. The distance is measured from the address of the next instruction, because by the time the branch executes the program counter has already advanced past it.

> Caption: A branch stores a distance, not an address, and the distance is measured from the next instruction.

Exam-trap caption mode adds: *Measuring from the branch instruction rather than from the following one. That single mistake changes the answer by the instruction length.*

**3:35–3:40** — GATE 2017 Set 1, Question 49 described a RISC machine with four-byte instructions. The branch is the fourth instruction in the sequence and its target is the first.

> Caption: GATE 2017 Set 1: four-byte instructions, the branch is the fourth, the target is the first.

**3:40–3:45** — The next instruction after the branch is at i plus sixteen. The target is at i. The offset is the target minus the next instruction, which is minus sixteen bytes.

> Caption: The next instruction is sixteen bytes past the target, so the offset is minus sixteen.

**3:45–3:50** — The offset must be signed, because branches go backwards as often as forwards. A field of n bits in two’s complement therefore reaches minus two to the n minus one up to plus two to the n minus one minus one.

> Caption: Write it as a signed number: half the field range is spent on backwards jumps.

Exam-trap caption mode adds: *Writing the offset as an unsigned magnitude. Then a backward branch is indistinguishable from a very large forward one.*

**3:50–3:55** — An absolute address is correct only at the address the program was assembled for. Move the program and every absolute address is wrong. A base register or a program counter offset moves with the program, so it survives.

> Caption: Absolute addresses break when the program moves; a base register or a PC offset survives.

**3:55–4:00** — GATE 1998, Question 19 asked which mode permits relocation without any change whatsoever in the code, and the answer is PC-relative. GATE 2004 asked which modes are suitable for relocation at run time, and the answer is base addressing and relative addressing.

> Caption: GATE 1998 and GATE 2004 both asked which modes relocate; base and relative do, absolute does not.

## Scene 9. Load-store machines and the RISC contract

*4:00 – 4:30 · objective: Write Z = X + Y on a load-store machine, reject the sequences that put a memory operand inside the add, and name the three RISC characteristics.*

**4:00–4:05** — In a load-store machine, only two instructions may touch memory: load, which copies memory into a register, and store, which copies a register into memory. Every other instruction works on registers alone.

> Caption: In a load-store machine, only load and store touch memory.

**4:05–4:10** — GATE 2026 Set 1, Question 15 gave a load-store machine whose first operand is always the destination, and asked which sequence computes Z equals X plus Y with all three in memory.

> Caption: GATE 2026 Set 1 asked for Z equals X plus Y: two loads, an add and a store.

**4:10–4:15** — The tempting wrong answers put one memory operand inside the add. That is legal on a register-memory machine and illegal here, which is exactly what the question is testing.

> Caption: The tempting wrong answers put one memory operand inside the add.

Exam-trap caption mode adds: *Reading load-store as a hint about efficiency rather than a hard rule about which instructions may name memory.*

**4:15–4:20** — RISC is a package of choices, not a single one: arithmetic only between registers, a fixed instruction length so every instruction can be fetched in one cycle, and a hardwired control unit instead of a microprogrammed one.

> Caption: RISC means register-to-register arithmetic, a fixed instruction length and a hardwired control unit.

**4:20–4:25** — GATE 2018, Question 5 listed exactly those three and asked which are used in the design of a RISC processor. All three are.

> Caption: GATE 2018 asked which of those three are RISC characteristics, and all three are.

**4:25–4:30** — CISC does the opposite: variable instruction lengths, memory operands inside arithmetic instructions, and usually a microprogrammed control unit. The program is shorter and the decoder is harder.

> Caption: CISC does the opposite, at the cost of a harder decoder.

## Scene 10. The procedure, and five traps

*4:30 – 5:00 · objective: Carry one five-step procedure from a question to an answer, with the five errors that cost marks marked beside each step.*

**4:30–4:35** — Step one for any encoding question: write the format as a sum of field widths and set that sum equal to the word length. That one equation usually gives the unknown.

> Caption: Step one: write the format as a sum of field widths and set it equal to the word length.

**4:35–4:40** — Step two: every field that names one of n things costs the ceiling of log base two of n. Never round down, and never assume the count is a power of two.

> Caption: Step two: use the ceiling of log base two for every field, and never round down.

**4:40–4:45** — Step three for a mode question: compute the effective address from the state the question gave you, and only then read memory. Write down each intermediate address so a miscount is visible.

> Caption: Step three: for a mode question, compute the effective address from the given state, then read once.

**4:45–4:50** — Step four for a branch: subtract the address of the next instruction from the target, and keep the sign. Then check it forward: next plus offset must equal target.

> Caption: Step four: for a branch, subtract the next instruction address, and keep the sign.

**4:50–4:55** — Five traps account for most lost marks: forgetting the instruction fetch, forgetting to scale an index by the element size, charging memory indirect as one read, writing a branch offset unsigned, and calling the cache part of the architecture.

> Caption: The five traps: the fetch, the scaling, indirect as one read, an unsigned offset, the cache.

Exam-trap caption mode adds: *All five at once: an unsigned branch offset into a scaled index through a memory-indirect operand, with the fetch forgotten.*

**4:55–5:00** — Every one of those five has cost marks in a real paper. Practise the checks until they run without being asked for.

> Caption: Every one of those five has cost marks in a real paper.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
