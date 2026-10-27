/* ==========================================================================
   instruction-set-and-addressing-modes - THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs - never edited by hand.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'isa',
      n: 1,
      title: 'What the instruction set architecture is, and what it is not',
      start: 0, end: 30,
      objective: 'Separate the programmer-visible contract (operations, registers, formats, addressing modes) from the implementation (cache size, clock frequency, cache levels), and use that separation to answer an MSQ.'
    },
    {
      id: 'budget',
      n: 2,
      title: 'The instruction word is a bit budget',
      start: 30, end: 60,
      objective: 'Derive opcode, register and immediate widths from the number of instructions and registers, and check that the fields spend exactly the word length.'
    },
    {
      id: 'expanding',
      n: 3,
      title: 'Expanding opcodes and the prefix rule',
      start: 60, end: 90,
      objective: 'Build a variable-length opcode with the escape trick, verify that no code is a prefix of another, and count the instructions each format buys.'
    },
    {
      id: 'addresses',
      n: 4,
      title: 'How many addresses one instruction names',
      start: 90, end: 120,
      objective: 'Evaluate one expression on a 3-, 2-, 1- and 0-address machine, and see that fewer addresses per instruction means shorter instructions and a longer program.'
    },
    {
      id: 'modes',
      n: 5,
      title: 'Eight ways to name an operand',
      start: 120, end: 150,
      objective: 'Compute the effective address of every common mode from one fixed machine state, and see which of them touch memory at all.'
    },
    {
      id: 'cost',
      n: 6,
      title: 'What each mode costs in memory accesses',
      start: 150, end: 180,
      objective: 'Count operand fetches per mode, add the instruction fetch when the question asks for the whole instruction, and account for a multi-word instruction.'
    },
    {
      id: 'why',
      n: 7,
      title: 'Why each mode exists: one construct each',
      start: 180, end: 210,
      objective: 'Map constant, pointer, array element and record field onto immediate, indirect, base-with-index and base-with-displacement, and separate the two that look alike.'
    },
    {
      id: 'relocate',
      n: 8,
      title: 'PC-relative offsets and relocatable code',
      start: 210, end: 240,
      objective: 'Compute a signed branch offset from the next instruction, verify it reproduces the target, and say which modes survive a program being moved.'
    },
    {
      id: 'loadstore',
      n: 9,
      title: 'Load-store machines and the RISC contract',
      start: 240, end: 270,
      objective: 'Write Z = X + Y on a load-store machine, reject the sequences that put a memory operand inside the add, and name the three RISC characteristics.'
    },
    {
      id: 'recipe',
      n: 10,
      title: 'The procedure, and five traps',
      start: 270, end: 300,
      objective: 'Carry one five-step procedure from a question to an answer, with the five errors that cost marks marked beside each step.'
    }
  ],

  events: [

    /* ---------------- scene 1: the ISA ---------------- */
    {
      id: 'isa-1', start: 0, end: 5, scene: 'isa',
      caption: 'The instruction set architecture is the part of a processor that a compiler is allowed to see.',
      narration: 'The instruction set architecture is the part of a processor that a compiler is allowed to see, and nothing else is in it.',
      detail: 'The instruction set architecture, usually shortened to ISA, is the contract between software and hardware. A compiler may rely on every clause of it and on no other fact about the chip.',
      keyword: 'compiler'
    },
    {
      id: 'isa-2', start: 5, end: 10, scene: 'isa',
      caption: 'Four things are visible: the operations, the registers, the instruction formats and the addressing modes.',
      narration: 'Four things are visible from outside: the operations the machine offers, the registers a program may name, the format of an instruction word, and the addressing modes that turn a field into an address.',
      detail: 'Also visible: the data types and their sizes, the width of an address, whether memory is byte addressable, and the byte order. All of those change what a correct program looks like.',
      keyword: 'addressing modes'
    },
    {
      id: 'isa-3', start: 10, end: 15, scene: 'isa',
      caption: 'Three things are not visible, and they are the ones people wrongly include: cache size, clock frequency, cache levels.',
      narration: 'Three things are not visible from outside, and they are exactly the ones people wrongly include: the size of the cache, the clock frequency, and how many levels of cache there are.',
      detail: 'Two chips can implement the same ISA with completely different cache hierarchies and different clock speeds. A program compiled for one runs unchanged on the other, which is the whole point of the contract.',
      keyword: 'not visible',
      trap: 'A datasheet lists cache size and clock speed, so they feel architectural. They are implementation: they change performance, never meaning.'
    },
    {
      id: 'isa-4', start: 15, end: 20, scene: 'isa',
      caption: 'GATE 2025 Set 2 asked exactly this, and only the register count was the correct option.',
      narration: 'GATE 2025 Set 2, Question 28 asked which of four things is part of the instruction set architecture. The options were cache size, clock frequency, number of cache levels and total number of registers. Only the register count is.',
      detail: 'The question was an MSQ carrying one mark. Three of the four options are microarchitecture, so the answer is a single option: the total number of registers.',
      keyword: 'register count'
    },
    {
      id: 'isa-5', start: 20, end: 25, scene: 'isa',
      caption: 'Two processors with the same instruction set can differ in every implementation detail.',
      narration: 'Two processors with the same instruction set can differ in every implementation detail. Same instructions, different caches, different clocks, different pipeline depths.',
      detail: 'This is why the same compiled binary runs on both. The instruction encodings are identical; only the speed differs.',
      keyword: 'same instruction set'
    },
    {
      id: 'isa-6', start: 25, end: 30, scene: 'isa',
      caption: 'So when a question says architecture, read the contract, not the hardware.',
      narration: 'So when a question says architecture, read the contract and not the hardware. Anything a program cannot observe is outside the instruction set.',
      detail: 'A useful test: could a compiler emit an instruction that depends on this fact? If not, the fact is implementation, not architecture.',
      keyword: 'contract'
    },

    /* ---------------- scene 2: the bit budget ---------------- */
    {
      id: 'bud-1', start: 30, end: 35, scene: 'budget',
      caption: 'Every instruction is a fixed number of bits, and the fields must spend them exactly.',
      narration: 'Every instruction is a fixed number of bits, and the fields must spend them exactly. One bit too many and the format does not fit; one too few and some instruction cannot be encoded.',
      detail: 'On a fixed-length machine every instruction occupies the same number of bytes. That is what makes instruction fetch and decode simple, and it is why the widths have to be planned rather than discovered.',
      keyword: 'spend them exactly'
    },
    {
      id: 'bud-2', start: 35, end: 40, scene: 'budget',
      caption: 'A register field costs log base two of the number of registers; an opcode costs log base two of the number of instructions.',
      narration: 'A field that names one of n registers costs the ceiling of log base two of n bits. An opcode field that names one of k instructions costs the ceiling of log base two of k bits.',
      detail: 'Ceiling, because the count is rarely a power of two. Forty-five instructions need six bits, since five bits give only thirty-two codes and six give sixty-four.',
      keyword: 'log base two',
      trap: 'Rounding down. Forty-five instructions is not five bits; five bits name only thirty-two instructions.'
    },
    {
      id: 'bud-3', start: 40, end: 45, scene: 'budget',
      caption: 'GATE 2014 Set 1: a 32-bit word, 64 registers, 45 instructions, two register operands.',
      narration: 'GATE 2014 Set 1, Question 9: a 32-bit architecture with one-word instructions, 64 registers each 32 bits wide, 45 instructions, each with an immediate operand in addition to two register operands.',
      detail: 'The register width, 32 bits, is a red herring. Only the number of registers matters for the encoding, because a field names a register rather than holding one.',
      keyword: '45 instructions'
    },
    {
      id: 'bud-4', start: 45, end: 50, scene: 'budget',
      caption: 'Six bits for the opcode, twelve for the two registers, so fourteen bits are left for the immediate.',
      narration: 'The opcode needs six bits, the two register fields need six bits each, so twelve, and thirty-two minus eighteen leaves fourteen bits for the immediate operand.',
      detail: '6 + 6 + 6 + 14 = 32. The four widths tile the word with nothing left over, which is the check that the format is well formed.',
      keyword: 'fourteen bits'
    },
    {
      id: 'bud-5', start: 50, end: 55, scene: 'budget',
      caption: 'An unsigned 14-bit immediate reaches 16383, not 16384, because counting starts at zero.',
      narration: 'An unsigned field of fourteen bits holds values from zero to two to the fourteen minus one, which is 16383. The largest value is one less than the number of patterns.',
      detail: 'Two to the fourteen is 16384 patterns, numbered 0 to 16383. A signed field of the same width would reach only 8191 in the positive direction.',
      keyword: '16383',
      trap: 'Answering 16384. The number of patterns is one more than the largest value representable.'
    },
    {
      id: 'bud-6', start: 55, end: 60, scene: 'budget',
      caption: 'GATE 2025 Set 1 gave 64 registers and 50 instruction types with one register operand: 20 bits remain.',
      narration: 'GATE 2025 Set 1, Question 37 changed the numbers: 64 general purpose registers and 50 distinct instruction types in a 32-bit instruction with one register operand. Six bits for the opcode, six for the register, twenty left for the immediate.',
      detail: 'Note the instruction given in the paper, ADD R1, #25. The hash means the 25 is an immediate, which tells you that only one register is encoded.',
      keyword: '20 bits'
    },

    /* ---------------- scene 3: expanding opcodes ---------------- */
    {
      id: 'exp-1', start: 60, end: 65, scene: 'expanding',
      caption: 'A fixed opcode field wastes space, because most instructions need fewer operands than the widest one.',
      narration: 'A fixed opcode field wastes space. The widest instruction decides the opcode width, and every narrower instruction then carries operand bits it does not need.',
      detail: 'A three-register add needs twelve register bits. A branch needs none. With one fixed opcode field, both pay for the same opcode width and the branch wastes twelve bits.',
      keyword: 'wastes space'
    },
    {
      id: 'exp-2', start: 65, end: 70, scene: 'expanding',
      caption: 'The escape trick: one opcode value means read the next four bits as another opcode.',
      narration: 'The escape trick fixes that. One opcode value is reserved to mean: the real opcode continues in the next field. Everything after the escape belongs to a narrower format.',
      detail: 'This is how a variable-length opcode is built. The first field is the primary opcode; a reserved all-ones value hands over to a secondary field, and that field may hand over again.',
      keyword: 'escape'
    },
    {
      id: 'exp-3', start: 70, end: 75, scene: 'expanding',
      caption: 'Fifteen codes give three-register instructions, one escape gives fifteen two-register ones, and again for one register.',
      narration: 'Fifteen of the sixteen four-bit codes are three-register instructions. The sixteenth escapes to a second four-bit field, where fifteen codes are two-register instructions and one escapes again to one-register instructions.',
      detail: 'Sixteen bits total. Format A spends four on the opcode and twelve on three registers. Format B spends eight on the opcode and eight on two registers. Format C spends twelve on the opcode and four on one register.',
      keyword: 'Fifteen'
    },
    {
      id: 'exp-4', start: 75, end: 80, scene: 'expanding',
      caption: 'The codes must be prefix-free: no code may be the beginning of another, or the decoder cannot tell them apart.',
      narration: 'The codes must be prefix-free. If one opcode is a prefix of another, the decoder cannot decide where the opcode ends, and the same bit string means two different instructions.',
      detail: 'Prefix-free is the same requirement that makes a Huffman code decodable. The escape is what buys it: a shorter code can never be the start of a longer one, because the shorter code does not begin with the escape.',
      keyword: 'prefix-free',
      trap: 'Assigning codes by hand without the escape and then claiming both counts. Without prefix-freeness the encodings overlap and the count is fiction.'
    },
    {
      id: 'exp-5', start: 80, end: 85, scene: 'expanding',
      caption: 'Fifteen sixteenths plus fifteen two-hundred-fifty-sixths plus fifteen four-thousand-ninety-sixths is just under one.',
      narration: 'The three formats use fifteen sixteenths, plus fifteen two hundred fifty-sixths, plus fifteen four thousand ninety-sixths of the encoding space. That sums to just under one, so the scheme is legal and one prefix is left unused.',
      detail: 'This is the Kraft check. A prefix-free code over a b-bit space must satisfy the sum of two to the minus the code length, over all codes, being at most one. Here it is 0.99976, so the design fits.',
      keyword: 'just under one'
    },
    {
      id: 'exp-6', start: 85, end: 90, scene: 'expanding',
      caption: 'GATE 2020 made it two formats: eight six-bit I-type opcodes taken, and all sixteen four-bit R-type opcodes free.',
      narration: 'GATE 2020, Question 44 used two formats. An I-type instruction spends six bits on the opcode, six on a register and four on an immediate. An R-type spends four on the opcode and twelve on two registers. Eight I-type opcodes are used, so how many R-type opcodes are possible? Sixteen.',
      detail: 'The I-type and R-type opcode fields are different lengths, so they are different encoding spaces. The eight I-type codes do not consume any four-bit R-type code. The answer is two to the four, which is sixteen.',
      keyword: 'sixteen',
      trap: 'Subtracting the eight I-type opcodes from the R-type total. The two fields are different widths, so the spaces do not overlap.'
    },

    /* ---------------- scene 4: addresses per instruction ---------------- */
    {
      id: 'adr-1', start: 90, end: 95, scene: 'addresses',
      caption: 'The same expression costs a different number of instructions on each machine.',
      narration: 'Take one expression, A plus B, times C plus D, and evaluate it on four machines that differ only in how many operands an instruction may name.',
      detail: 'The expression has two additions and one multiplication, so three operations. The number of instructions is decided by how much bookkeeping each format forces, not by the number of operations.',
      keyword: 'same expression'
    },
    {
      id: 'adr-2', start: 95, end: 100, scene: 'addresses',
      caption: 'Three-address: three instructions, one per operation, every operand a register.',
      narration: 'A three-address machine needs three instructions. Add A and B into R1, add C and D into R2, multiply R1 and R2 into R3. Each instruction names two sources and a destination.',
      detail: 'Three-address instructions are long, because three register fields must be encoded. They also produce the shortest program, which is why compilers like the format even when the encoding is expensive.',
      keyword: 'three instructions'
    },
    {
      id: 'adr-3', start: 100, end: 105, scene: 'addresses',
      caption: 'Two-address: five, because the destination is also a source and needs a copy first.',
      narration: 'A two-address machine needs five. Copy A into R1, add B to R1, copy C into R2, add D to R2, multiply R1 by R2. The two copies exist because one of the two operands is destroyed by the operation.',
      detail: 'Five rather than four, because the second addition would otherwise overwrite a value still needed. Two-address formats save encoding space and pay for it in move instructions.',
      keyword: 'five'
    },
    {
      id: 'adr-4', start: 105, end: 110, scene: 'addresses',
      caption: 'One-address, the accumulator machine: seven, because every value must pass through one register.',
      narration: 'A one-address machine, the accumulator machine, needs seven. Load A, add B, store the partial sum, load C, add D, multiply by the partial sum, store the answer.',
      detail: 'One register is both a source and the destination of every arithmetic instruction, so intermediate values have to be parked in memory. The instruction count grows because the register file does not.',
      keyword: 'seven'
    },
    {
      id: 'adr-5', start: 110, end: 115, scene: 'addresses',
      caption: 'Zero-address, the stack machine: eight, because each operand is pushed and each result popped.',
      narration: 'A zero-address machine, the stack machine, needs eight. Push A, push B, add, push C, push D, add, multiply, pop the answer. Every operand is pushed and every result appears on top of the stack.',
      detail: 'The instructions are tiny, often a single byte, because they name no operands at all. The program is longest and each instruction shortest, which is the trade the format makes.',
      keyword: 'eight'
    },
    {
      id: 'adr-6', start: 115, end: 120, scene: 'addresses',
      caption: 'Fewer addresses per instruction means shorter instructions and more of them.',
      narration: 'The pattern is exact: fewer addresses per instruction means shorter instructions and more of them. GATE 2015 Set 1 asked which fields a three-address format may name, and the answer is a memory operand or a register, never an implied accumulator.',
      detail: 'An implied accumulator is the defining feature of a one-address machine. A three-address format names its operands explicitly, so there is nothing implied to name.',
      keyword: 'shorter instructions',
      trap: 'Assuming the shortest program is the fastest. It has the fewest instructions and the longest ones; total bytes and total cycles are separate questions.'
    },

    /* ---------------- scene 5: the modes ---------------- */
    {
      id: 'mod-1', start: 120, end: 125, scene: 'modes',
      caption: 'An addressing mode is a recipe that turns bits in the instruction into one address.',
      narration: 'An addressing mode is a recipe that turns the bits in the instruction into one address. That address is called the effective address, and the operand is what lives there.',
      detail: 'The bits in the instruction are only a hint. The mode says how to combine that hint with registers, the program counter or memory contents to produce the address actually used.',
      keyword: 'effective address'
    },
    {
      id: 'mod-2', start: 125, end: 130, scene: 'modes',
      caption: 'Immediate puts the value in the instruction; register puts it in a register. Neither touches memory.',
      narration: 'Immediate addressing puts the value itself inside the instruction. Register addressing puts the value in a register named by the instruction. Neither of them reads memory for the operand.',
      detail: 'These are the two cheapest modes, and the two that cannot express an address computed at run time. Immediate is fixed at assembly time; register is fixed at run time but limited to what the register file holds.',
      keyword: 'Neither touches memory'
    },
    {
      id: 'mod-3', start: 130, end: 135, scene: 'modes',
      caption: 'Direct puts the address in the instruction; indirect puts the address of the address there.',
      narration: 'Direct, also called absolute, puts the operand address in the instruction. Indirect puts the address of that address in the instruction, so the machine must read memory twice.',
      detail: 'Indirect is what a pointer variable compiles to. Direct cannot express a pointer, because the target is fixed when the program is assembled.',
      keyword: 'indirect',
      trap: 'Calling memory indirect one memory access. It is two: one to fetch the pointer, one to fetch the operand.'
    },
    {
      id: 'mod-4', start: 135, end: 140, scene: 'modes',
      caption: 'Displacement adds a constant to a base register; indexed adds an index register, scaled by element size.',
      narration: 'Displacement mode adds a small constant held in the instruction to a base register. Indexed mode adds an index register instead, and on a byte-addressable machine the index is scaled by the size of one element.',
      detail: 'The two are the same arithmetic with different roles. In displacement the constant is the field that varies and the register is fixed; in indexed the register is the field that varies and the constant is the element size.',
      keyword: 'scaled'
    },
    {
      id: 'mod-5', start: 140, end: 145, scene: 'modes',
      caption: 'PC-relative adds the offset to the program counter, which is what makes a branch position-independent.',
      narration: 'PC-relative mode adds the offset to the program counter. Because both the offset and the counter move together when the program is relocated, the computed address is unaffected.',
      detail: 'Branch instructions almost always use this mode. The offset is signed, so the same field expresses a forward jump and a backward jump.',
      keyword: 'PC-relative'
    },
    {
      id: 'mod-6', start: 145, end: 150, scene: 'modes',
      caption: 'Autoincrement uses the register, then advances it by the size of the item, not by one.',
      narration: 'Autoincrement uses the register as the address and then advances it. The advance is by the size of the item accessed, so a four-byte word advances the register by four, not by one.',
      detail: 'Autoincrement and autodecrement exist to walk an array with no separate add instruction. The size-dependence is the whole point: advancing by one would land in the middle of an element.',
      keyword: 'by four, not by one',
      trap: 'GATE 2008 Question 33 tested exactly this: the increment depends on the data size, and that is the only one of the three statements that is true.'
    },

    /* ---------------- scene 6: the cost ---------------- */
    {
      id: 'cst-1', start: 150, end: 155, scene: 'cost',
      caption: 'Count the memory accesses, and count the instruction fetch too.',
      narration: 'When a question asks for memory accesses, count them, and decide first whether the instruction fetch is included. Many wrong answers differ from the right one by exactly one.',
      detail: 'A fetch is a memory read like any other. Some papers say during the execution cycle, which excludes the fetch. Others say for the whole instruction, which includes it.',
      keyword: 'instruction fetch',
      trap: 'The phrase in the execution cycle excludes the fetch. The phrase to fetch and execute the instruction includes it.'
    },
    {
      id: 'cst-2', start: 155, end: 160, scene: 'cost',
      caption: 'Immediate and register cost nothing beyond the fetch; direct and register indirect cost one read.',
      narration: 'Immediate and register modes cost nothing beyond the instruction fetch. Direct and register indirect cost one further read, because the operand lives in memory.',
      detail: 'Register indirect differs from direct only in where the address came from: a register instead of the instruction word. The cost is identical.',
      keyword: 'one read'
    },
    {
      id: 'cst-3', start: 160, end: 165, scene: 'cost',
      caption: 'Memory indirect costs two, because the pointer must itself be fetched.',
      narration: 'Memory indirect costs two reads. The first read fetches the pointer from memory; the second read fetches the operand that the pointer names.',
      detail: 'This is the single most common counting error on the topic. A pointer stored in memory is not free; reading it is one memory access on its own.',
      keyword: 'two'
    },
    {
      id: 'cst-4', start: 165, end: 170, scene: 'cost',
      caption: 'A two-word instruction costs two fetches, and its address field sits in the second word.',
      narration: 'A multi-word instruction costs one fetch per word. A two-word instruction is fetched in two reads, and the address field that would otherwise be part of the first word is fetched separately.',
      detail: 'This is why old machines with long addresses had such expensive indirect modes: the address itself took a fetch before the pointer could even be read.',
      keyword: 'two fetches'
    },
    {
      id: 'cst-5', start: 170, end: 175, scene: 'cost',
      caption: 'Indexed costs one read plus an addition; the addition is time, not a memory access.',
      narration: 'Indexed addressing costs one read, plus an addition to form the effective address. The addition costs time inside the processor but it is not a memory access, and papers are usually asking about accesses.',
      detail: 'Keep the two currencies apart: memory accesses and clock cycles. A mode can be cheap in one and expensive in the other.',
      keyword: 'not a memory access'
    },
    {
      id: 'cst-6', start: 175, end: 180, scene: 'cost',
      caption: 'So the same instruction can be charged four or five, depending on which question is asked.',
      narration: 'The same instruction can be charged four memory cycles or five, depending on which question is asked. Read the phrase, not the mode.',
      detail: 'A three-word instruction with one indexed operand and one indirect operand, storing back to memory, comes to one fetch for the opcode word, two for the address words, one read for the indexed operand, two for the indirect operand, and one write for the result.',
      keyword: 'four or five'
    },

    /* ---------------- scene 7: why each mode exists ---------------- */
    {
      id: 'why-1', start: 180, end: 185, scene: 'why',
      caption: 'Each mode is in the instruction set because one construct of a high-level language needs it.',
      narration: 'No addressing mode exists for decoration. Each one is there because some construct of a high-level language cannot be compiled without it.',
      detail: 'This is the most reliable way to answer a matching question: do not memorise the list, derive each pair from what the construct needs at run time.',
      keyword: 'one construct'
    },
    {
      id: 'why-2', start: 185, end: 190, scene: 'why',
      caption: 'Immediate exists for constants; indirect exists for pointers, which are addresses held in memory.',
      narration: 'Immediate addressing exists for constants, whose value is known before the program runs. Indirect addressing exists for pointers, because a pointer is an address held in memory and must be read before it can be followed.',
      detail: 'A pointer variable is a memory location whose contents are an address. Reaching the pointee therefore needs one read for the pointer and one for the target, which is precisely memory indirect.',
      keyword: 'pointers'
    },
    {
      id: 'why-3', start: 190, end: 195, scene: 'why',
      caption: 'Base with index exists for array elements; base with displacement exists for a field of a record.',
      narration: 'Base with index exists for array elements, because the element number varies at run time and must be multiplied by the element size. Base with displacement exists for a field of a record, because the field offset is fixed when the program is compiled.',
      detail: 'Both compute base plus an offset. The difference is which part varies: in an array it is the index, in a record it is the field. That is exactly the difference between the two modes.',
      keyword: 'array elements'
    },
    {
      id: 'why-4', start: 195, end: 200, scene: 'why',
      caption: 'GATE 2026 Set 1 asked for this matching, and the record field was base with displacement.',
      narration: 'GATE 2026 Set 1, Question 14 asked for this matching. Immediate to constant, indirect to pointer, base with index to an element of an array, base with displacement to an element of a record.',
      detail: 'The distractors swapped the two base modes and swapped indirect with base with offset. Both swaps are available to anyone who has memorised the names without the reasons.',
      keyword: 'base with displacement'
    },
    {
      id: 'why-5', start: 200, end: 205, scene: 'why',
      caption: 'GATE 2017 Set 1 put a struct in a register and asked for one field.',
      narration: 'GATE 2017 Set 1, Question 11 put the base address of a struct in register R1 and asked how to reach the field grade. The answer is index mode with a sixteen-bit offset, which is base with displacement.',
      detail: 'The struct began with an array of one hundred integers, so the field grade sits 400 bytes past the base, and the offset must be wide enough to hold 400. That is why the option quotes a sixteen-bit offset rather than a small immediate.',
      keyword: 'sixteen-bit offset',
      trap: 'Post-increment and pre-decrement walk an array; they do not select a fixed field. Register direct would give the base, not the field.'
    },
    {
      id: 'why-6', start: 205, end: 210, scene: 'why',
      caption: 'The distinction is the scaling: an array multiplies the index by the element size, a record does not.',
      narration: 'The distinction to keep is the scaling. In an array the index is multiplied by the element size, because consecutive elements are one element apart. In a record the offset is already in bytes and is added unchanged.',
      detail: 'This is where byte addressing bites. If the memory is byte addressable and one integer is four bytes, then element three of an array at 2000 is at 2012, not at 2003.',
      keyword: 'scaling'
    },

    /* ---------------- scene 8: relocation ---------------- */
    {
      id: 'rel-1', start: 210, end: 215, scene: 'relocate',
      caption: 'A branch stores a distance, not an address, and the distance is measured from the next instruction.',
      narration: 'A branch instruction stores a distance rather than an address. The distance is measured from the address of the next instruction, because by the time the branch executes the program counter has already advanced past it.',
      detail: 'This convention is almost universal and it is the source of most branch-offset errors. If you measure from the branch itself you will be off by one instruction length.',
      keyword: 'next instruction',
      trap: 'Measuring from the branch instruction rather than from the following one. That single mistake changes the answer by the instruction length.'
    },
    {
      id: 'rel-2', start: 215, end: 220, scene: 'relocate',
      caption: 'GATE 2017 Set 1: four-byte instructions, the branch is the fourth, the target is the first.',
      narration: 'GATE 2017 Set 1, Question 49 described a RISC machine with four-byte instructions. The branch is the fourth instruction in the sequence and its target is the first.',
      detail: 'Four instructions of four bytes each occupy sixteen bytes. The first instruction is at some address i, and the branch is at i plus twelve.',
      keyword: 'four-byte instructions'
    },
    {
      id: 'rel-3', start: 220, end: 225, scene: 'relocate',
      caption: 'The next instruction is sixteen bytes past the target, so the offset is minus sixteen.',
      narration: 'The next instruction after the branch is at i plus sixteen. The target is at i. The offset is the target minus the next instruction, which is minus sixteen bytes.',
      detail: 'Check it forwards: i plus sixteen plus minus sixteen is i, which is the target. A correct offset always reproduces the target when added to the next instruction address.',
      keyword: 'minus sixteen'
    },
    {
      id: 'rel-4', start: 225, end: 230, scene: 'relocate',
      caption: 'Write it as a signed number: half the field range is spent on backwards jumps.',
      narration: 'The offset must be signed, because branches go backwards as often as forwards. A field of n bits in two\u2019s complement therefore reaches minus two to the n minus one up to plus two to the n minus one minus one.',
      detail: 'An eight-bit offset reaches minus 128 to plus 127 bytes. That asymmetry is not a defect; it is what two\u2019s complement costs, and it is why a branch far away needs a longer offset field or an indirect jump.',
      keyword: 'signed',
      trap: 'Writing the offset as an unsigned magnitude. Then a backward branch is indistinguishable from a very large forward one.'
    },
    {
      id: 'rel-5', start: 230, end: 235, scene: 'relocate',
      caption: 'Absolute addresses break when the program moves; a base register or a PC offset survives.',
      narration: 'An absolute address is correct only at the address the program was assembled for. Move the program and every absolute address is wrong. A base register or a program counter offset moves with the program, so it survives.',
      detail: 'With a base register the code is unchanged but the register must be reloaded. With a PC-relative offset nothing at all changes, which is why position-independent code is written that way.',
      keyword: 'survives'
    },
    {
      id: 'rel-6', start: 235, end: 240, scene: 'relocate',
      caption: 'GATE 1998 and GATE 2004 both asked which modes relocate; base and relative do, absolute does not.',
      narration: 'GATE 1998, Question 19 asked which mode permits relocation without any change whatsoever in the code, and the answer is PC-relative. GATE 2004 asked which modes are suitable for relocation at run time, and the answer is base addressing and relative addressing.',
      detail: 'The two papers word the requirement differently, and the difference matters. Without any change at all, only PC-relative qualifies, because a base register has to be reloaded.',
      keyword: 'base and relative'
    },

    /* ---------------- scene 9: load-store ---------------- */
    {
      id: 'ls-1', start: 240, end: 245, scene: 'loadstore',
      caption: 'In a load-store machine, only load and store touch memory.',
      narration: 'In a load-store machine, only two instructions may touch memory: load, which copies memory into a register, and store, which copies a register into memory. Every other instruction works on registers alone.',
      detail: 'The alternative is a register-memory machine, where an arithmetic instruction may take one operand from memory. That is the CISC style, and it is what makes the two architectures answer differently.',
      keyword: 'only load and store'
    },
    {
      id: 'ls-2', start: 245, end: 250, scene: 'loadstore',
      caption: 'GATE 2026 Set 1 asked for Z equals X plus Y: two loads, an add and a store.',
      narration: 'GATE 2026 Set 1, Question 15 gave a load-store machine whose first operand is always the destination, and asked which sequence computes Z equals X plus Y with all three in memory.',
      detail: 'The answer is four instructions: load X into R0, load Y into R1, add R0 and R1 into R2, store R2 into Z. Every one of them obeys the first-operand-is-destination rule.',
      keyword: 'two loads'
    },
    {
      id: 'ls-3', start: 250, end: 255, scene: 'loadstore',
      caption: 'The tempting wrong answers put one memory operand inside the add.',
      narration: 'The tempting wrong answers put one memory operand inside the add. That is legal on a register-memory machine and illegal here, which is exactly what the question is testing.',
      detail: 'Two of the three distractors load one operand first and then still use memory in the add. They look nearly right, which is why the question is a one-mark question with a high error rate.',
      keyword: 'memory operand',
      trap: 'Reading load-store as a hint about efficiency rather than a hard rule about which instructions may name memory.'
    },
    {
      id: 'ls-4', start: 255, end: 260, scene: 'loadstore',
      caption: 'RISC means register-to-register arithmetic, a fixed instruction length and a hardwired control unit.',
      narration: 'RISC is a package of choices, not a single one: arithmetic only between registers, a fixed instruction length so every instruction can be fetched in one cycle, and a hardwired control unit instead of a microprogrammed one.',
      detail: 'The fixed length is what makes decoding fast. The hardwired control is what the fixed length makes possible, since a regular encoding can be decoded by a shallow gate network.',
      keyword: 'fixed instruction length'
    },
    {
      id: 'ls-5', start: 260, end: 265, scene: 'loadstore',
      caption: 'GATE 2018 asked which of those three are RISC characteristics, and all three are.',
      narration: 'GATE 2018, Question 5 listed exactly those three and asked which are used in the design of a RISC processor. All three are.',
      detail: 'A common wrong answer keeps the hardwired control out, on the theory that microprogramming is more modern. It is the opposite: microprogramming belongs to the CISC tradition of complex, variable-length instructions.',
      keyword: 'all three'
    },
    {
      id: 'ls-6', start: 265, end: 270, scene: 'loadstore',
      caption: 'CISC does the opposite, at the cost of a harder decoder.',
      narration: 'CISC does the opposite: variable instruction lengths, memory operands inside arithmetic instructions, and usually a microprogrammed control unit. The program is shorter and the decoder is harder.',
      detail: 'Neither is strictly better. RISC spends instruction bits to keep decoding shallow; CISC spends decode complexity to keep programs dense. Both are inside the same syllabus clause.',
      keyword: 'CISC'
    },

    /* ---------------- scene 10: the recipe ---------------- */
    {
      id: 'rec-1', start: 270, end: 275, scene: 'recipe',
      caption: 'Step one: write the format as a sum of field widths and set it equal to the word length.',
      narration: 'Step one for any encoding question: write the format as a sum of field widths and set that sum equal to the word length. That one equation usually gives the unknown.',
      detail: 'Write every field, including the ones you were not asked about. The register fields and the addressing-mode field are exactly what the question expects you to notice.',
      keyword: 'sum of field widths'
    },
    {
      id: 'rec-2', start: 275, end: 280, scene: 'recipe',
      caption: 'Step two: use the ceiling of log base two for every field, and never round down.',
      narration: 'Step two: every field that names one of n things costs the ceiling of log base two of n. Never round down, and never assume the count is a power of two.',
      detail: 'Then check the value, not just the width. An unsigned field of b bits reaches two to the b minus one; a signed one reaches two to the b minus one minus one.',
      keyword: 'ceiling'
    },
    {
      id: 'rec-3', start: 280, end: 285, scene: 'recipe',
      caption: 'Step three: for a mode question, compute the effective address from the given state, then read once.',
      narration: 'Step three for a mode question: compute the effective address from the state the question gave you, and only then read memory. Write down each intermediate address so a miscount is visible.',
      detail: 'Decide before you start whether the fetch is included. Then count reads and writes separately, and remember that indirect is two reads and that scaling applies to the index.',
      keyword: 'compute the effective address'
    },
    {
      id: 'rec-4', start: 285, end: 290, scene: 'recipe',
      caption: 'Step four: for a branch, subtract the next instruction address, and keep the sign.',
      narration: 'Step four for a branch: subtract the address of the next instruction from the target, and keep the sign. Then check it forward: next plus offset must equal target.',
      detail: 'If the answer comes out positive for a backward branch, you subtracted in the wrong order. The check costs five seconds and catches the whole family of errors.',
      keyword: 'keep the sign'
    },
    {
      id: 'rec-5', start: 290, end: 295, scene: 'recipe',
      caption: 'The five traps: the fetch, the scaling, indirect as one read, an unsigned offset, the cache.',
      narration: 'Five traps account for most lost marks: forgetting the instruction fetch, forgetting to scale an index by the element size, charging memory indirect as one read, writing a branch offset unsigned, and calling the cache part of the architecture.',
      detail: 'Each of the five has appeared in a real paper, and four of them appear in more than one. They are cheap to check and expensive to miss.',
      keyword: 'five traps',
      trap: 'All five at once: an unsigned branch offset into a scaled index through a memory-indirect operand, with the fetch forgotten.'
    },
    {
      id: 'rec-6', start: 295, end: 300, scene: 'recipe',
      caption: 'Every one of those five has cost marks in a real paper.',
      narration: 'Every one of those five has cost marks in a real paper. Practise the checks until they run without being asked for.',
      detail: 'The practice tab holds twelve questions: three multiple choice, three multiple select and six numerical, with the reasoning and the wrong-option analysis for each.',
      keyword: 'cost marks'
    }
  ]
};
