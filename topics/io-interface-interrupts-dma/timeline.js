/* ==========================================================================
   io-interface-interrupts-dma - THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs - never edited by hand.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'interface',
      n: 1,
      title: 'A device is not a memory',
      start: 0, end: 30,
      objective: 'Read an I/O interface as three registers sitting on the bus, and see that every I/O question is a question about who reads and writes them.'
    },
    {
      id: 'mapping',
      n: 2,
      title: 'Two ways to name a register',
      start: 30, end: 60,
      objective: 'Tell memory-mapped from isolated I/O, and say what each one costs in address space and in instructions.'
    },
    {
      id: 'polling',
      n: 3,
      title: 'Programmed I/O: the CPU does both jobs',
      start: 60, end: 90,
      objective: 'See that polling makes the CPU the copier and the checker, so its cost is the whole transfer time rather than an overhead.'
    },
    {
      id: 'events',
      n: 4,
      title: 'Interrupt-driven I/O: a fixed order',
      start: 90, end: 120,
      objective: 'Place the five interrupt events in their forced order, and say why the save must come before the jump.'
    },
    {
      id: 'priority',
      n: 5,
      title: 'Who asked, and who goes first',
      start: 120, end: 150,
      objective: 'Separate two different jobs — naming the source and ranking the sources — and match vectored, non-vectored, daisy chain and polling to the right one.'
    },
    {
      id: 'dma',
      n: 6,
      title: 'DMA: a second bus master',
      start: 150, end: 180,
      objective: 'Read the DMA controller as three registers plus a handshake, and see why bus mastership is exclusive rather than shared.'
    },
    {
      id: 'modes',
      n: 7,
      title: 'Burst, cycle stealing, transparent',
      start: 180, end: 210,
      objective: 'Draw the three DMA modes as three Gantt charts and read throughput and CPU disruption off the same picture.'
    },
    {
      id: 'overhead',
      n: 8,
      title: 'The arithmetic of CPU time',
      start: 210, end: 240,
      objective: 'Compute the fraction of CPU time an I/O method costs, and the speedup one method has over another, from four numbers.'
    },
    {
      id: 'count',
      n: 9,
      title: 'The count register decides how many times',
      start: 240, end: 270,
      objective: 'Turn a register width into a maximum chunk, and a file size into a number of bus acquisitions, using a ceiling rather than a division.'
    },
    {
      id: 'recipe',
      n: 10,
      title: 'The recipe and the traps',
      start: 270, end: 300,
      objective: 'Leave with four steps that turn any interrupt or DMA question into arithmetic, and five traps to refuse.'
    }
  ],

  events: [

    /* ---------------- scene 1: the interface ---------------- */
    {
      id: 'if-1', start: 0, end: 7.5, scene: 'interface',
      caption: 'A disk or a keyboard is not a memory. It cannot be asked for the contents of an address.',
      detail: 'A memory cell is passive: give it an address and it returns the word stored there, at any moment, as often as you like. A device is active and slow: it holds one item, it may not be ready, and reading it changes what it will do next. So the CPU cannot talk to a device the way it talks to memory.',
      keyword: 'a device is not a memory',
      trap: 'Treating an I/O port as if it were a memory cell with a value sitting in it. A port is often a window onto a moving part, so two reads of the same port can give two different answers.',
      narration: 'A disk or a keyboard is not a memory. It cannot be asked for the contents of an address.'
    },
    {
      id: 'if-2', start: 7.5, end: 15, scene: 'interface',
      caption: 'So the device gets a translator: the interface, or controller. It presents three registers to the bus.',
      detail: 'The interface is the hardware that stands between the device and the system bus. It has a data register that holds the item being moved, a status register that says whether the device is ready, busy or has failed, and a control register that the CPU writes to start, stop or configure the device. Some texts call the status and control registers one register viewed two ways.',
      keyword: 'three registers on the bus',
      trap: 'Assuming the data register is where the device keeps its data. For a disk it holds one sector buffer, not the disk; for a keyboard it holds one character and is then empty again.',
      narration: 'So the device gets a translator: the interface, or controller. It presents three registers to the bus.'
    },
    {
      id: 'if-3', start: 15, end: 22.5, scene: 'interface',
      caption: 'Every I/O method in the syllabus is an answer to one question: who reads and writes these three registers?',
      detail: 'If the CPU reads and writes the data register itself, once per word, that is programmed I/O or interrupt-driven I/O, depending on whether the CPU decides when to look. If a separate controller reads and writes the data register, that is DMA. The status and control registers are always the CPU\'s business at the start and the end. This single question organises the whole topic.',
      keyword: 'who does the copying',
      trap: 'Thinking DMA removes the interface. It does not: the interface is still there, and the DMA controller drives the data register in the CPU\'s place.',
      narration: 'Every I/O method in the syllabus answers one question: who reads and writes these three registers?'
    },
    {
      id: 'if-4', start: 22.5, end: 30, scene: 'interface',
      caption: 'One word in, one word out: a keyboard gives a byte per keystroke, a disk gives a block. The interface absorbs that mismatch.',
      detail: 'The device side and the bus side rarely agree on width or on timing. A keyboard produces one byte when a human presses a key, seconds apart. A disk produces a whole sector at once, thousands of times a second. The interface buffers, so the bus sees a clean handshake: a ready line, an acknowledge line, and a register that is either full or empty.',
      keyword: 'the interface absorbs the mismatch',
      trap: 'Assuming the bus width equals the device width. A 32-bit bus can talk to an 8-bit device; the interface splits the word. Widths are a design choice, not a law.',
      narration: 'One word in, one word out. The interface absorbs the mismatch between the device and the bus.'
    },

    /* ---------------- scene 2: memory-mapped against isolated ---------------- */
    {
      id: 'mp-1', start: 30, end: 37.5, scene: 'mapping',
      caption: 'There are two ways to name a register: put it in the memory address space, or give it a space of its own.',
      detail: 'Memory-mapped I/O places the device registers at addresses inside the ordinary memory map. The CPU then reaches them with the load and store instructions it already has. Isolated I/O, also called port-mapped or I/O-mapped I/O, gives the devices a separate numbered space and adds special instructions, conventionally IN and OUT, that name a port rather than a memory address.',
      keyword: 'one space or two',
      trap: 'Calling memory-mapped I/O "shared memory". The registers are at memory addresses, but they are not memory, and the device may change them without the CPU writing anything.',
      narration: 'There are two ways to name a register: put it in the memory address space, or give it a space of its own.'
    },
    {
      id: 'mp-2', start: 37.5, end: 45, scene: 'mapping',
      caption: 'Memory-mapped costs addresses. In a 16-bit space of 65536 addresses, 256 port addresses leave 65280 for memory.',
      detail: 'This is the whole cost, and it is arithmetic: the addresses given to the device are addresses the memory can no longer use. With a 16-bit address bus there are 65536 byte addresses in total. Allocating 256 of them to device registers leaves 65280 addresses of real memory. Isolated I/O spends nothing from that budget, because its ports are counted in a different space.',
      keyword: 'the address budget',
      trap: 'Subtracting the ports from a memory size given in kilobytes rather than in addresses. Count addresses, not bytes, unless the machine is byte addressable and every address is one byte.',
      narration: 'Memory-mapped costs addresses. In a 16-bit space of 65536 addresses, 256 port addresses leave 65280 for memory.'
    },
    {
      id: 'mp-3', start: 45, end: 52.5, scene: 'mapping',
      caption: 'Isolated costs instructions and one extra control line, not addresses.',
      detail: 'Because ports are not addresses, the CPU needs a way to say which space it means. A control line, usually written M over I-O-bar, is asserted for memory cycles and deasserted for port cycles. The instruction set gains IN and OUT. In exchange, the whole memory space stays available and a stray pointer cannot silently drive a device.',
      keyword: 'one extra control line',
      trap: 'Saying isolated I/O has no addressing. It does: a port number is decoded exactly like an address, by a decoder that asserts one device select. What is missing is the shared space, not the decoding.',
      narration: 'Isolated costs instructions and one extra control line, not addresses.'
    },
    {
      id: 'mp-4', start: 52.5, end: 60, scene: 'mapping',
      caption: 'Memory-mapped lets any instruction touch a device; isolated keeps devices out of the memory space. Both are used in real machines.',
      detail: 'Memory-mapped is convenient for the programmer, because every addressing mode now applies to a device register and no new instruction is needed. It is dangerous for the same reason: a bad pointer becomes an unintended device command. Isolated is safer and keeps the address space whole, but needs its own instructions and its own decode path. Neither is more modern than the other; both appear in current processors.',
      keyword: 'convenience against safety',
      trap: 'Answering "memory-mapped" to a question that asks which one gives the larger memory space. Isolated does, by construction.',
      narration: 'Memory-mapped lets any instruction touch a device; isolated keeps devices out of the memory space.'
    },

    /* ---------------- scene 3: programmed I/O ---------------- */
    {
      id: 'po-1', start: 60, end: 67.5, scene: 'polling',
      caption: 'Programmed I/O, or polling: the CPU reads the status register in a loop until it says ready.',
      detail: 'The CPU writes a command to the control register, then repeatedly reads the status register asking "ready yet?". When the answer becomes yes it reads or writes the data register once, and starts again. The loop is written in software, so the CPU is executing instructions the entire time, including the ones that only ask a question.',
      keyword: 'a loop that asks a question',
      trap: 'Believing polling wastes only the waiting time. It also wastes the asking time, and the asking time is what the CPU spends even when the device is fast.',
      narration: 'Programmed I/O, or polling: the CPU reads the status register in a loop until it says ready.'
    },
    {
      id: 'po-2', start: 67.5, end: 75, scene: 'polling',
      caption: 'The cost of one byte is the whole time that byte took, because the CPU was busy the whole time.',
      detail: 'This is the fact that separates programmed I/O from everything after it. For a device delivering one byte every T seconds, the CPU is occupied for T seconds per byte: some of it asking, some of it copying. Its utilisation of the CPU is 100 per cent, not a fraction. Any question that asks how much CPU time polling costs for a transfer is asking for the transfer time itself.',
      keyword: 'the whole transfer time',
      trap: 'Computing a per-byte overhead for polling and multiplying. Polling has no separate overhead: the overhead is the interval, because the CPU never leaves the loop.',
      narration: 'The cost of one byte is the whole time that byte took, because the CPU was busy the whole time.'
    },
    {
      id: 'po-3', start: 75, end: 82.5, scene: 'polling',
      caption: 'A keyboard polled every 10 ms at 100 microseconds a poll: 100 polls a second cost 10 ms a second.',
      detail: 'The arithmetic is a rate times a cost. Polling every 10 milliseconds means one thousand milliseconds divided by ten, which is 100 polls per second. At 100 microseconds each, that is 10000 microseconds, which is 10 milliseconds, which is 0.01 of a second. Add the 200 microseconds spent processing the one keystroke that arrived, and the fraction is 0.0102.',
      keyword: '100 polls a second',
      trap: 'Forgetting that the poll happens whether or not a key was pressed. The 100 polls are driven by the clock, not by the keystrokes, so a quiet keyboard costs the same.',
      narration: 'A keyboard polled every ten milliseconds at a hundred microseconds a poll costs ten milliseconds a second.'
    },
    {
      id: 'po-4', start: 82.5, end: 90, scene: 'polling',
      caption: 'Polling is cheap in hardware and expensive in CPU. That trade is the whole reason interrupts exist.',
      detail: 'A polled system needs no interrupt line, no vector table, no priority logic and no context save. It is a handful of instructions and it never surprises the programmer. What it costs is the CPU\'s attention at a fixed rate that has nothing to do with how often the device is actually ready. If the device is busy one per cent of the time, polling still costs one hundred per cent of the polls.',
      keyword: 'cheap hardware, expensive CPU',
      trap: 'Reading "polling is simple" as "polling is efficient". Simplicity of mechanism and economy of CPU time are different axes, and polling wins only the first.',
      narration: 'Polling is cheap in hardware and expensive in CPU. That trade is the whole reason interrupts exist.'
    },

    /* ---------------- scene 4: interrupt-driven I/O ---------------- */
    {
      id: 'ev-1', start: 90, end: 97.5, scene: 'events',
      caption: 'Interrupt-driven I/O turns the loop inside out: the CPU works on something else, and the device raises a line when it is ready.',
      detail: 'The CPU issues the command and returns to whatever it was doing. When the interface has a word ready it asserts the interrupt request line. The CPU notices at an instruction boundary, saves where it was, and jumps to a routine that moves the word. The saving and jumping is the overhead; the copying is the same as before.',
      keyword: 'the device raises a line',
      trap: 'Thinking an interrupt transfers the data. It does not. The interrupt announces that data is available; the interrupt service routine still reads or writes the data register itself.',
      narration: 'Interrupt-driven I/O turns the loop inside out: the CPU works on something else, and the device raises a line.'
    },
    {
      id: 'ev-2', start: 97.5, end: 105, scene: 'events',
      caption: 'The order is forced. First finish the current instruction, because an interrupt is honoured only at a boundary.',
      detail: 'A processor cannot abandon an instruction half-done: the registers would be left in a state no program could resume from. So the request is latched and checked at the end of the instruction. This is why interrupt latency is measured in whole instructions, and why a long instruction delays every interrupt behind it.',
      keyword: 'an instruction boundary',
      trap: 'Assuming an interrupt pre-empts an instruction in the middle. On the processors this syllabus describes it does not; the current instruction completes first.',
      narration: 'The order is forced. First finish the current instruction, because an interrupt is honoured only at a boundary.'
    },
    {
      id: 'ev-3', start: 105, end: 112.5, scene: 'events',
      caption: 'Then push the process status, because the program counter is part of it. Save before you jump.',
      detail: 'The status word and the return address are pushed on the control stack. The return address is the program counter of the next instruction of the interrupted program, so it must be written down before the program counter is overwritten. This is the step that the 2018 question tests: load the new program counter first and the old value is gone.',
      keyword: 'save before you jump',
      trap: 'Swapping the save and the load. It looks harmless in a diagram and destroys the return address in a real machine.',
      narration: 'Then push the process status, because the program counter is part of it. Save before you jump.'
    },
    {
      id: 'ev-4', start: 112.5, end: 120, scene: 'events',
      caption: 'Then load the new program counter from the vector, run the routine, and pop the status to resume.',
      detail: 'The full order is: finish the instruction, push the status, load the new program counter, execute the service routine, pop the status. Five events, one legal sequence. Everything else in the topic — vectored against non-vectored, daisy chain against polling — is about how the third step obtains its new program counter value.',
      keyword: 'five events, one sequence',
      trap: 'Putting the pop before the routine finishes. The restore is the last thing the routine does, which is why it is usually the return-from-interrupt instruction.',
      narration: 'Then load the new program counter from the vector, run the routine, and pop the status to resume.'
    },

    /* ---------------- scene 5: priority and identification ---------------- */
    {
      id: 'pr-1', start: 120, end: 127.5, scene: 'priority',
      caption: 'Two different jobs get confused here: naming the source, and ranking the sources.',
      detail: 'Naming answers "which device asked?", so the CPU can run the right routine. Ranking answers "which of two simultaneous requests is served first?". A machine needs both, and they can be built in hardware or in software. Most wrong answers in this topic come from answering one question with the mechanism that belongs to the other.',
      keyword: 'naming against ranking',
      trap: 'Using "daisy chain" as an answer to a question about identifying the source. Daisy chain ranks; identification in a daisy chain comes from where the acknowledge pulse stops.',
      narration: 'Two different jobs get confused here: naming the source, and ranking the sources.'
    },
    {
      id: 'pr-2', start: 127.5, end: 135, scene: 'priority',
      caption: 'Vectored: the device supplies the address itself. Non-vectored: every device shares one address, and software must ask around.',
      detail: 'In a vectored interrupt the interface places a vector — an identifier or a direct address — on the bus during the acknowledge cycle, so the CPU loads the program counter from it and enters the right routine at once. In a non-vectored scheme all interrupts branch to one fixed address, and the handler there must discover which device asked, usually by reading status registers in turn.',
      keyword: 'the device supplies the address',
      trap: 'The classic trap: saying a vectored interrupt still needs polling to identify the source. It does not; the vector is the identification.',
      narration: 'Vectored: the device supplies the address itself. Non-vectored: every device shares one address.'
    },
    {
      id: 'pr-3', start: 135, end: 142.5, scene: 'priority',
      caption: 'Daisy chain is hardware ranking: the acknowledge signal passes device to device and stops at the first one asking.',
      detail: 'The devices are wired in a serial chain on the interrupt acknowledge line. The CPU asserts the acknowledge, and each device either takes it — if it is the one requesting — or passes it on. Position in the chain is priority, and the identification is implicit in where the pulse stopped. No software polling is involved, which is exactly what the 2026 question checks.',
      keyword: 'the pulse stops at the first asker',
      trap: 'Calling daisy chaining a polling scheme because devices are visited in order. It is a hardware grant chain; no instruction runs while it is resolving.',
      narration: 'Daisy chain is hardware ranking: the acknowledge passes device to device and stops at the first one asking.'
    },
    {
      id: 'pr-4', start: 142.5, end: 150, scene: 'priority',
      caption: 'Maskable interrupts can be switched off by software. A non-maskable interrupt cannot, and it is reserved for emergencies.',
      detail: 'A maskable interrupt can be disabled by clearing a bit in the interrupt-enable register, so the CPU can finish a critical section without being disturbed. A non-maskable interrupt ignores that bit and is wired to failures that must not wait: a power failure, a memory parity error, an overheating processor. A temperature sensor is the standard example, and a mouse is the standard counterexample.',
      keyword: 'maskable against non-maskable',
      trap: 'Assuming a non-maskable interrupt has higher priority than everything else in a ranking. It is unmaskable, which is a statement about being disabled, not about the order among the requests that are enabled.',
      narration: 'Maskable interrupts can be switched off by software. A non-maskable interrupt cannot, and it is reserved for emergencies.'
    },

    /* ---------------- scene 6: DMA ---------------- */
    {
      id: 'dm-1', start: 150, end: 157.5, scene: 'dma',
      caption: 'DMA hands the copying to a controller with three registers: address, count, and control.',
      detail: 'The address register holds the memory address to read or write next. The count register holds how many words remain. The control register holds the direction and the mode. The CPU programs all three, starts the device, and is then free. Each word transferred increments the address and decrements the count, which is the whole loop, implemented in hardware.',
      keyword: 'address, count, control',
      trap: 'Thinking the DMA controller knows where the file ends. It knows only the count it was given, which is why a wrong count writes past the buffer.',
      narration: 'DMA hands the copying to a controller with three registers: address, count and control.'
    },
    {
      id: 'dm-2', start: 157.5, end: 165, scene: 'dma',
      caption: 'The handshake is two wires: the controller requests the bus, and the CPU grants it.',
      detail: 'The controller asserts a bus request, usually called HOLD or BR. The CPU finishes the bus cycle it is in, then asserts the grant, HOLD-acknowledge or BG, and floats its own bus drivers so the two never drive the same lines. When the grant is withdrawn the CPU resumes. Every DMA transfer therefore begins with a latency of at least one bus cycle.',
      keyword: 'request and grant',
      trap: 'Ignoring the handshake in a timing calculation and assuming the controller has the bus the instant it asks. The request-to-grant delay is real and is part of the transfer time.',
      narration: 'The handshake is two wires: the controller requests the bus, and the CPU grants it.'
    },
    {
      id: 'dm-3', start: 165, end: 172.5, scene: 'dma',
      caption: 'Only one bus master at a time. The CPU and the controller are never both driving the bus.',
      detail: 'This is a statement about the bus, not about activity. Both may be working: the CPU can execute instructions that never touch the bus while the controller moves words. But at any instant exactly one of them owns the address and data lines. The 2020 question turns on precisely this distinction, and offers "both can be bus masters at the same time" as a false statement.',
      keyword: 'one master at any instant',
      trap: 'Reading "DMA lets the CPU and the controller work in parallel" as "they share the bus". They overlap in time, never on the wires.',
      narration: 'Only one bus master at a time. The CPU and the controller are never both driving the bus.'
    },
    {
      id: 'dm-4', start: 172.5, end: 180, scene: 'dma',
      caption: 'The CPU pays at two moments only: the setup before, and the completion interrupt after.',
      detail: 'Programming the three registers costs a fixed number of cycles, and the completion interrupt costs another fixed number. Between those two moments the CPU owes the transfer nothing except the bus cycles the controller steals. This is why DMA is the answer whenever the question asks for the highest throughput on a bulk transfer, and why its advantage grows with the block size.',
      keyword: 'setup and completion',
      trap: 'Assuming DMA costs the CPU nothing. It costs the setup, the completion interrupt, and every bus cycle the controller takes. For a very small block those three together can exceed what polling would have cost.',
      narration: 'The CPU pays at two moments only: the setup before, and the completion interrupt after.'
    },

    /* ---------------- scene 7: the three modes ---------------- */
    {
      id: 'md-1', start: 180, end: 187.5, scene: 'modes',
      caption: 'Burst mode: the controller takes the bus once and keeps it for the whole block.',
      detail: 'The request is granted, and the controller holds the bus until every word of the block has moved. Throughput is the highest of the three, because the handshake is paid once. The cost is that the CPU cannot use the bus for the entire block, so a burst long enough to matter delays any interrupt-driven work behind it.',
      keyword: 'the bus for the whole block',
      trap: 'Using burst mode for a device that produces words slowly. Holding the bus between words that are not ready yet blocks the CPU for no benefit at all.',
      narration: 'Burst mode: the controller takes the bus once and keeps it for the whole block.'
    },
    {
      id: 'md-2', start: 187.5, end: 195, scene: 'modes',
      caption: 'Cycle stealing: one word per grant, then the bus goes back. The CPU loses one cycle at a time.',
      detail: 'The controller requests, is granted, moves exactly one unit, and releases. It then requests again. The CPU therefore loses one bus cycle per word, spread out, instead of a long block. Throughput is lower than burst because the handshake repeats, but the CPU is never locked out for long. Almost every GATE question about DMA bandwidth is about this mode.',
      keyword: 'one word per grant',
      trap: 'Multiplying the stolen-cycle time by the word count and calling that the transfer time. In cycle stealing the elapsed time is set by how fast the device supplies words, not by the CPU.',
      narration: 'Cycle stealing: one word per grant, then the bus goes back. The CPU loses one cycle at a time.'
    },
    {
      id: 'md-3', start: 195, end: 202.5, scene: 'modes',
      caption: 'Transparent mode: the controller waits for cycles the CPU is not using, so the CPU never stops.',
      detail: 'The controller watches the bus and moves a word only in a cycle the CPU has left idle, typically an internal operation that needs no memory access. Nothing the CPU does is delayed. The cost is that the controller needs logic to recognise an idle cycle, and the transfer takes the longest of the three modes in wall-clock time.',
      keyword: 'only idle cycles',
      trap: 'Assuming transparent mode is fastest because the CPU is undisturbed. It is the slowest to finish the block; it is the cheapest in CPU time.',
      narration: 'Transparent mode: the controller waits for cycles the CPU is not using, so the CPU never stops.'
    },
    {
      id: 'md-4', start: 202.5, end: 210, scene: 'modes',
      caption: 'One picture answers all three: how long the bus is held, and how much of that time the CPU loses.',
      detail: 'Read the three Gantt charts on one axis. Burst gives the shortest block time and the largest single disruption. Cycle stealing gives a longer block time and many small disruptions, one bus cycle each. Transparent gives the longest block time and no disruption. Throughput and CPU cost are two readings of the same schedule, which is why they never both improve at once.',
      keyword: 'two readings, one schedule',
      trap: 'Asking which mode is best. There is no best; the question is always which cost matters for this device, and the answer changes with the block size and the deadline.',
      narration: 'One picture answers all three: how long the bus is held, and how much of that time the CPU loses.'
    },

    /* ---------------- scene 8: the arithmetic ---------------- */
    {
      id: 'ov-1', start: 210, end: 217.5, scene: 'overhead',
      caption: 'Cycle stealing gives one formula: throughput is clock rate, times the fraction of cycles stolen, times the bits per stolen cycle.',
      detail: 'A processor at f cycles per second that gives a fraction p of its cycles to DMA, and moves w bits in each of those cycles, delivers f times p times w bits per second. The 2021 question uses 2 MHz, 0.5 per cent and 8 bits, giving 80000 bits per second. The 2024 question uses 4 MHz, 1 per cent and 8 bytes, which is 64 bits, giving 2560000 bits per second.',
      keyword: 'rate times fraction times width',
      trap: 'Leaving the answer in bytes when the question asks for bits, or reading the Indian grouping 25,60,000 as 256 thousand. Both are offered as wrong options on the real paper.',
      narration: 'Cycle stealing gives one formula: throughput is clock rate, times the fraction of cycles stolen, times the bits per stolen cycle.'
    },
    {
      id: 'ov-2', start: 217.5, end: 225, scene: 'overhead',
      caption: 'For interrupts, the fraction of CPU time is the cost per interrupt divided by the interval between interrupts.',
      detail: 'If a device raises one interrupt every T seconds and each interrupt costs the CPU c seconds, the fraction of CPU time consumed is c divided by T. Equivalently it is the interrupt rate multiplied by the cost. This holds only while c is smaller than T. When c exceeds T the CPU cannot keep up, the queue of unserved events grows, and data is lost: this is the condition that makes the formula a model rather than a truth.',
      keyword: 'cost over interval',
      trap: 'Using the formula when the cost exceeds the interval. It then returns a fraction above one, which is not a fraction but a symptom.',
      narration: 'For interrupts, the fraction of CPU time is the cost per interrupt divided by the interval between interrupts.'
    },
    {
      id: 'ov-3', start: 225, end: 232.5, scene: 'overhead',
      caption: 'Interrupt against programmed: 10 KB a second, 4 microseconds of overhead, so 100 microseconds of waiting against 4.',
      detail: 'Programmed I/O occupies the CPU for the whole time one byte takes. At 10 kilobytes a second one byte takes 100 microseconds if a kilobyte is taken as a thousand bytes, and 97.66 if it is taken as 1024. Interrupt-driven I/O costs the stated 4 microseconds of overhead per byte, because the transfer itself is negligible. The gain is the ratio, 25 or 24.4, and the option set makes 25 the answer under either reading.',
      keyword: 'the whole interval against the overhead',
      trap: 'Taking the ratio of the rates instead of the ratio of the times, or dividing by the interval rather than by the overhead. The gain is programmed time divided by interrupt time.',
      narration: 'Interrupt against programmed: ten kilobytes a second, four microseconds of overhead, so a hundred microseconds against four.'
    },
    {
      id: 'ov-4', start: 232.5, end: 240, scene: 'overhead',
      caption: 'Cycle stealing on a disk: a 4-byte word every 152.6 nanoseconds against a 40-nanosecond memory cycle.',
      detail: 'One track holds 512 sectors of 1 kilobyte, and the disk turns 50 times a second, so it delivers 25600 kilobytes a second. Four bytes therefore arrive every 152.6 nanoseconds. Each transfer steals one 40-nanosecond memory cycle, so the fraction of memory cycles lost is 40 over 152.6, which is 26.2 per cent. Published keys give 25, from counting the transfer as 4 whole memory cycles and taking one in four; the lesson states both.',
      keyword: '40 over 152.6',
      trap: 'Using the number of surfaces as a multiplier. Only one head reads at a time, so 16 surfaces do not multiply the transfer rate.',
      narration: 'Cycle stealing on a disk: a four-byte word every 152.6 nanoseconds against a 40-nanosecond memory cycle.'
    },

    /* ---------------- scene 9: the count register ---------------- */
    {
      id: 'ct-1', start: 240, end: 247.5, scene: 'count',
      caption: 'A register of n bits counts to 2 to the n. A 16-bit count register therefore covers 65536 bytes in one transfer.',
      detail: 'The count register is decremented once per unit transferred, and it can hold any value from zero up to its maximum. Sixteen bits hold 65536 distinct values, so one DMA operation can move at most 65536 bytes when memory is byte addressable. That is 64 kilobytes, and it is a hardware ceiling, not a software choice.',
      keyword: '2 to the 16 is 65536',
      trap: 'Using 65535 as the maximum because the counter stops at zero. The register holds 65536 distinct values, and the transfer that starts at the maximum moves 65536 units.',
      narration: 'A register of n bits counts to two to the n. A 16-bit count register therefore covers 65536 bytes in one transfer.'
    },
    {
      id: 'ct-2', start: 247.5, end: 255, scene: 'count',
      caption: '29154 kilobytes against 64 kilobytes is 455.5, so the transfer needs 456 bus acquisitions, not 455.',
      detail: 'The number of times the controller must take the bus is the file size divided by the largest chunk, rounded up. 29154 kilobytes is 29853696 bytes; divided by 65536 that is 455.53. Four hundred and fifty-five transfers move 29818880 bytes and leave 34816 behind, so a 456th acquisition is needed for the remainder. Rounding down loses data, which is why the ceiling is not a technicality.',
      keyword: 'always round up',
      trap: 'Rounding to nearest. 455.53 rounds to 456 only by luck; a file of 64 kilobytes and one byte would need 2 transfers while the nearest integer is 1.',
      narration: '29154 kilobytes against 64 kilobytes is 455.5, so the transfer needs 456 bus acquisitions, not 455.'
    },
    {
      id: 'ct-3', start: 255, end: 262.5, scene: 'count',
      caption: 'A software copy loop costs a few instructions per byte. Count them, then count the DMA path, then divide.',
      detail: 'The 2011 question gives a five-statement loop: load, store, increment, decrement, branch. Load and store take two cycles each, the other three take one, so one byte costs seven cycles, and 500 bytes cost 3500, plus two cycles of initialisation. The DMA path costs 20 cycles of setup plus two cycles per byte, which is 1020. The speedup is 3502 over 1020, which is 3.4.',
      keyword: 'count both paths',
      trap: 'Forgetting the two initialisation instructions of the software loop, or forgetting the 20 cycles of DMA setup. Both are small and both are in the question for a reason.',
      narration: 'A software copy loop costs a few instructions per byte. Count them, then count the DMA path, then divide.'
    },
    {
      id: 'ct-4', start: 262.5, end: 270, scene: 'count',
      caption: 'Both of these are just bookkeeping. The reasoning is in the count, and the answer is one division.',
      detail: 'Notice that nothing in these two questions needed a new idea. The 2016 question is a ceiling of a ratio. The 2011 question is a sum of instruction costs on each side, then a ratio. Every numerical question in this topic is a count of something — cycles, bytes, acquisitions, microseconds — followed by one division. Get the count right and the arithmetic cannot mislead you.',
      keyword: 'count, then divide',
      trap: 'Reaching for a formula before deciding what is being counted. Written out, the count usually shows which of the four formulas applies, and sometimes shows that none does.',
      narration: 'Both of these are just bookkeeping. The reasoning is in the count, and the answer is one division.'
    },

    /* ---------------- scene 10: the recipe ---------------- */
    {
      id: 'rc-1', start: 270, end: 277.5, scene: 'recipe',
      caption: 'Step one: name the registers. Step two: name who copies. Everything else follows.',
      detail: 'Before any arithmetic, decide whether the question is about the interface, about who moves the data, or about the schedule of a transfer. Naming the registers — data, status, control — fixes what the question calls a port, a register and a buffer. Naming the copier — CPU or controller — selects the method. Naming the schedule — burst, stealing, transparent — selects the timing model.',
      keyword: 'registers, copier, schedule',
      trap: 'Starting from the numbers. A question that mentions a 4 MHz clock may still be about identification rather than throughput, and the numbers are decoration.',
      narration: 'Step one: name the registers. Step two: name who copies. Everything else follows.'
    },
    {
      id: 'rc-2', start: 277.5, end: 285, scene: 'recipe',
      caption: 'Step three: write down the count in the units the question uses. Step four: divide once, and check the units.',
      detail: 'Counts are in cycles, bytes, words, acquisitions or microseconds. Write the unit next to every number as you go, because most lost marks in this topic are unit slips: bits against bytes, milliseconds against microseconds, kilobytes as 1000 against 1024. Then perform exactly one division or one ceiling, and read the unit off the question rather than off your working.',
      keyword: 'units on every number',
      trap: 'Carrying two conventions for a kilobyte in the same calculation. Choose one, state it, and check whether the options can tell the difference.',
      narration: 'Step three: write down the count in the units the question uses. Step four: divide once, and check the units.'
    },
    {
      id: 'rc-3', start: 285, end: 292.5, scene: 'recipe',
      caption: 'The five traps: identification against ranking, save before jump, one bus master, rounding down, and a fraction above one.',
      detail: 'First, vectored and daisy chain answer different questions. Second, the status is saved before the program counter is loaded. Third, the CPU and the controller are never simultaneous bus masters. Fourth, a count of transfers is a ceiling. Fifth, a CPU fraction above one means the model has broken, not that the CPU is overworked by a measurable amount.',
      keyword: 'the five traps',
      trap: 'Memorising the five as a list without the reason for each. Each one exists because a specific previous-year question was built on it.',
      narration: 'The five traps: identification against ranking, save before jump, one bus master, rounding down, and a fraction above one.'
    },
    {
      id: 'rc-4', start: 292.5, end: 300, scene: 'recipe',
      caption: 'One topic, one question: who reads and writes the three registers, and how often.',
      detail: 'Programmed I/O has the CPU do both jobs every time. Interrupt-driven I/O has the CPU do both jobs only when called. DMA has the controller do the copying while the CPU pays at the two ends. Every definition, every mode and every numerical question in this lesson is that sentence, read at a different scale.',
      keyword: 'who, and how often',
      trap: 'Treating the three methods as three eras of history. They coexist in one machine: a keyboard may be interrupt-driven, a disk DMA, and a legacy port polled.',
      narration: 'One topic, one question: who reads and writes the three registers, and how often.'
    }
  ]
};
