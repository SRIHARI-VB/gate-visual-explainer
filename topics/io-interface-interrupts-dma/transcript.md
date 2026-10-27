# I/O Interface, Interrupts and DMA — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/io-interface-interrupts-dma/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A device is not a memory

*0:00 – 0:30 · objective: Read an I/O interface as three registers sitting on the bus, and see that every I/O question is a question about who reads and writes them.*

**0:00–0:07** — A disk or a keyboard is not a memory. It cannot be asked for the contents of an address.

> Caption: A disk or a keyboard is not a memory. It cannot be asked for the contents of an address.

Exam-trap caption mode adds: *Treating an I/O port as if it were a memory cell with a value sitting in it. A port is often a window onto a moving part, so two reads of the same port can give two different answers.*

**0:07–0:15** — So the device gets a translator: the interface, or controller. It presents three registers to the bus.

> Caption: So the device gets a translator: the interface, or controller. It presents three registers to the bus.

Exam-trap caption mode adds: *Assuming the data register is where the device keeps its data. For a disk it holds one sector buffer, not the disk; for a keyboard it holds one character and is then empty again.*

**0:15–0:22** — Every I/O method in the syllabus answers one question: who reads and writes these three registers?

> Caption: Every I/O method in the syllabus is an answer to one question: who reads and writes these three registers?

Exam-trap caption mode adds: *Thinking DMA removes the interface. It does not: the interface is still there, and the DMA controller drives the data register in the CPU's place.*

**0:22–0:30** — One word in, one word out. The interface absorbs the mismatch between the device and the bus.

> Caption: One word in, one word out: a keyboard gives a byte per keystroke, a disk gives a block. The interface absorbs that mismatch.

Exam-trap caption mode adds: *Assuming the bus width equals the device width. A 32-bit bus can talk to an 8-bit device; the interface splits the word. Widths are a design choice, not a law.*

## Scene 2. Two ways to name a register

*0:30 – 1:00 · objective: Tell memory-mapped from isolated I/O, and say what each one costs in address space and in instructions.*

**0:30–0:37** — There are two ways to name a register: put it in the memory address space, or give it a space of its own.

> Caption: There are two ways to name a register: put it in the memory address space, or give it a space of its own.

Exam-trap caption mode adds: *Calling memory-mapped I/O "shared memory". The registers are at memory addresses, but they are not memory, and the device may change them without the CPU writing anything.*

**0:37–0:45** — Memory-mapped costs addresses. In a 16-bit space of 65536 addresses, 256 port addresses leave 65280 for memory.

> Caption: Memory-mapped costs addresses. In a 16-bit space of 65536 addresses, 256 port addresses leave 65280 for memory.

Exam-trap caption mode adds: *Subtracting the ports from a memory size given in kilobytes rather than in addresses. Count addresses, not bytes, unless the machine is byte addressable and every address is one byte.*

**0:45–0:52** — Isolated costs instructions and one extra control line, not addresses.

> Caption: Isolated costs instructions and one extra control line, not addresses.

Exam-trap caption mode adds: *Saying isolated I/O has no addressing. It does: a port number is decoded exactly like an address, by a decoder that asserts one device select. What is missing is the shared space, not the decoding.*

**0:52–1:00** — Memory-mapped lets any instruction touch a device; isolated keeps devices out of the memory space.

> Caption: Memory-mapped lets any instruction touch a device; isolated keeps devices out of the memory space. Both are used in real machines.

Exam-trap caption mode adds: *Answering "memory-mapped" to a question that asks which one gives the larger memory space. Isolated does, by construction.*

## Scene 3. Programmed I/O: the CPU does both jobs

*1:00 – 1:30 · objective: See that polling makes the CPU the copier and the checker, so its cost is the whole transfer time rather than an overhead.*

**1:00–1:07** — Programmed I/O, or polling: the CPU reads the status register in a loop until it says ready.

> Caption: Programmed I/O, or polling: the CPU reads the status register in a loop until it says ready.

Exam-trap caption mode adds: *Believing polling wastes only the waiting time. It also wastes the asking time, and the asking time is what the CPU spends even when the device is fast.*

**1:07–1:15** — The cost of one byte is the whole time that byte took, because the CPU was busy the whole time.

> Caption: The cost of one byte is the whole time that byte took, because the CPU was busy the whole time.

Exam-trap caption mode adds: *Computing a per-byte overhead for polling and multiplying. Polling has no separate overhead: the overhead is the interval, because the CPU never leaves the loop.*

**1:15–1:22** — A keyboard polled every ten milliseconds at a hundred microseconds a poll costs ten milliseconds a second.

> Caption: A keyboard polled every 10 ms at 100 microseconds a poll: 100 polls a second cost 10 ms a second.

Exam-trap caption mode adds: *Forgetting that the poll happens whether or not a key was pressed. The 100 polls are driven by the clock, not by the keystrokes, so a quiet keyboard costs the same.*

**1:22–1:30** — Polling is cheap in hardware and expensive in CPU. That trade is the whole reason interrupts exist.

> Caption: Polling is cheap in hardware and expensive in CPU. That trade is the whole reason interrupts exist.

Exam-trap caption mode adds: *Reading "polling is simple" as "polling is efficient". Simplicity of mechanism and economy of CPU time are different axes, and polling wins only the first.*

## Scene 4. Interrupt-driven I/O: a fixed order

*1:30 – 2:00 · objective: Place the five interrupt events in their forced order, and say why the save must come before the jump.*

**1:30–1:37** — Interrupt-driven I/O turns the loop inside out: the CPU works on something else, and the device raises a line.

> Caption: Interrupt-driven I/O turns the loop inside out: the CPU works on something else, and the device raises a line when it is ready.

Exam-trap caption mode adds: *Thinking an interrupt transfers the data. It does not. The interrupt announces that data is available; the interrupt service routine still reads or writes the data register itself.*

**1:37–1:45** — The order is forced. First finish the current instruction, because an interrupt is honoured only at a boundary.

> Caption: The order is forced. First finish the current instruction, because an interrupt is honoured only at a boundary.

Exam-trap caption mode adds: *Assuming an interrupt pre-empts an instruction in the middle. On the processors this syllabus describes it does not; the current instruction completes first.*

**1:45–1:52** — Then push the process status, because the program counter is part of it. Save before you jump.

> Caption: Then push the process status, because the program counter is part of it. Save before you jump.

Exam-trap caption mode adds: *Swapping the save and the load. It looks harmless in a diagram and destroys the return address in a real machine.*

**1:52–2:00** — Then load the new program counter from the vector, run the routine, and pop the status to resume.

> Caption: Then load the new program counter from the vector, run the routine, and pop the status to resume.

Exam-trap caption mode adds: *Putting the pop before the routine finishes. The restore is the last thing the routine does, which is why it is usually the return-from-interrupt instruction.*

## Scene 5. Who asked, and who goes first

*2:00 – 2:30 · objective: Separate two different jobs — naming the source and ranking the sources — and match vectored, non-vectored, daisy chain and polling to the right one.*

**2:00–2:07** — Two different jobs get confused here: naming the source, and ranking the sources.

> Caption: Two different jobs get confused here: naming the source, and ranking the sources.

Exam-trap caption mode adds: *Using "daisy chain" as an answer to a question about identifying the source. Daisy chain ranks; identification in a daisy chain comes from where the acknowledge pulse stops.*

**2:07–2:15** — Vectored: the device supplies the address itself. Non-vectored: every device shares one address.

> Caption: Vectored: the device supplies the address itself. Non-vectored: every device shares one address, and software must ask around.

Exam-trap caption mode adds: *The classic trap: saying a vectored interrupt still needs polling to identify the source. It does not; the vector is the identification.*

**2:15–2:22** — Daisy chain is hardware ranking: the acknowledge passes device to device and stops at the first one asking.

> Caption: Daisy chain is hardware ranking: the acknowledge signal passes device to device and stops at the first one asking.

Exam-trap caption mode adds: *Calling daisy chaining a polling scheme because devices are visited in order. It is a hardware grant chain; no instruction runs while it is resolving.*

**2:22–2:30** — Maskable interrupts can be switched off by software. A non-maskable interrupt cannot, and it is reserved for emergencies.

> Caption: Maskable interrupts can be switched off by software. A non-maskable interrupt cannot, and it is reserved for emergencies.

Exam-trap caption mode adds: *Assuming a non-maskable interrupt has higher priority than everything else in a ranking. It is unmaskable, which is a statement about being disabled, not about the order among the requests that are enabled.*

## Scene 6. DMA: a second bus master

*2:30 – 3:00 · objective: Read the DMA controller as three registers plus a handshake, and see why bus mastership is exclusive rather than shared.*

**2:30–2:37** — DMA hands the copying to a controller with three registers: address, count and control.

> Caption: DMA hands the copying to a controller with three registers: address, count, and control.

Exam-trap caption mode adds: *Thinking the DMA controller knows where the file ends. It knows only the count it was given, which is why a wrong count writes past the buffer.*

**2:37–2:45** — The handshake is two wires: the controller requests the bus, and the CPU grants it.

> Caption: The handshake is two wires: the controller requests the bus, and the CPU grants it.

Exam-trap caption mode adds: *Ignoring the handshake in a timing calculation and assuming the controller has the bus the instant it asks. The request-to-grant delay is real and is part of the transfer time.*

**2:45–2:52** — Only one bus master at a time. The CPU and the controller are never both driving the bus.

> Caption: Only one bus master at a time. The CPU and the controller are never both driving the bus.

Exam-trap caption mode adds: *Reading "DMA lets the CPU and the controller work in parallel" as "they share the bus". They overlap in time, never on the wires.*

**2:52–3:00** — The CPU pays at two moments only: the setup before, and the completion interrupt after.

> Caption: The CPU pays at two moments only: the setup before, and the completion interrupt after.

Exam-trap caption mode adds: *Assuming DMA costs the CPU nothing. It costs the setup, the completion interrupt, and every bus cycle the controller takes. For a very small block those three together can exceed what polling would have cost.*

## Scene 7. Burst, cycle stealing, transparent

*3:00 – 3:30 · objective: Draw the three DMA modes as three Gantt charts and read throughput and CPU disruption off the same picture.*

**3:00–3:07** — Burst mode: the controller takes the bus once and keeps it for the whole block.

> Caption: Burst mode: the controller takes the bus once and keeps it for the whole block.

Exam-trap caption mode adds: *Using burst mode for a device that produces words slowly. Holding the bus between words that are not ready yet blocks the CPU for no benefit at all.*

**3:07–3:15** — Cycle stealing: one word per grant, then the bus goes back. The CPU loses one cycle at a time.

> Caption: Cycle stealing: one word per grant, then the bus goes back. The CPU loses one cycle at a time.

Exam-trap caption mode adds: *Multiplying the stolen-cycle time by the word count and calling that the transfer time. In cycle stealing the elapsed time is set by how fast the device supplies words, not by the CPU.*

**3:15–3:22** — Transparent mode: the controller waits for cycles the CPU is not using, so the CPU never stops.

> Caption: Transparent mode: the controller waits for cycles the CPU is not using, so the CPU never stops.

Exam-trap caption mode adds: *Assuming transparent mode is fastest because the CPU is undisturbed. It is the slowest to finish the block; it is the cheapest in CPU time.*

**3:22–3:30** — One picture answers all three: how long the bus is held, and how much of that time the CPU loses.

> Caption: One picture answers all three: how long the bus is held, and how much of that time the CPU loses.

Exam-trap caption mode adds: *Asking which mode is best. There is no best; the question is always which cost matters for this device, and the answer changes with the block size and the deadline.*

## Scene 8. The arithmetic of CPU time

*3:30 – 4:00 · objective: Compute the fraction of CPU time an I/O method costs, and the speedup one method has over another, from four numbers.*

**3:30–3:37** — Cycle stealing gives one formula: throughput is clock rate, times the fraction of cycles stolen, times the bits per stolen cycle.

> Caption: Cycle stealing gives one formula: throughput is clock rate, times the fraction of cycles stolen, times the bits per stolen cycle.

Exam-trap caption mode adds: *Leaving the answer in bytes when the question asks for bits, or reading the Indian grouping 25,60,000 as 256 thousand. Both are offered as wrong options on the real paper.*

**3:37–3:45** — For interrupts, the fraction of CPU time is the cost per interrupt divided by the interval between interrupts.

> Caption: For interrupts, the fraction of CPU time is the cost per interrupt divided by the interval between interrupts.

Exam-trap caption mode adds: *Using the formula when the cost exceeds the interval. It then returns a fraction above one, which is not a fraction but a symptom.*

**3:45–3:52** — Interrupt against programmed: ten kilobytes a second, four microseconds of overhead, so a hundred microseconds against four.

> Caption: Interrupt against programmed: 10 KB a second, 4 microseconds of overhead, so 100 microseconds of waiting against 4.

Exam-trap caption mode adds: *Taking the ratio of the rates instead of the ratio of the times, or dividing by the interval rather than by the overhead. The gain is programmed time divided by interrupt time.*

**3:52–4:00** — Cycle stealing on a disk: a four-byte word every 152.6 nanoseconds against a 40-nanosecond memory cycle.

> Caption: Cycle stealing on a disk: a 4-byte word every 152.6 nanoseconds against a 40-nanosecond memory cycle.

Exam-trap caption mode adds: *Using the number of surfaces as a multiplier. Only one head reads at a time, so 16 surfaces do not multiply the transfer rate.*

## Scene 9. The count register decides how many times

*4:00 – 4:30 · objective: Turn a register width into a maximum chunk, and a file size into a number of bus acquisitions, using a ceiling rather than a division.*

**4:00–4:07** — A register of n bits counts to two to the n. A 16-bit count register therefore covers 65536 bytes in one transfer.

> Caption: A register of n bits counts to 2 to the n. A 16-bit count register therefore covers 65536 bytes in one transfer.

Exam-trap caption mode adds: *Using 65535 as the maximum because the counter stops at zero. The register holds 65536 distinct values, and the transfer that starts at the maximum moves 65536 units.*

**4:07–4:15** — 29154 kilobytes against 64 kilobytes is 455.5, so the transfer needs 456 bus acquisitions, not 455.

> Caption: 29154 kilobytes against 64 kilobytes is 455.5, so the transfer needs 456 bus acquisitions, not 455.

Exam-trap caption mode adds: *Rounding to nearest. 455.53 rounds to 456 only by luck; a file of 64 kilobytes and one byte would need 2 transfers while the nearest integer is 1.*

**4:15–4:22** — A software copy loop costs a few instructions per byte. Count them, then count the DMA path, then divide.

> Caption: A software copy loop costs a few instructions per byte. Count them, then count the DMA path, then divide.

Exam-trap caption mode adds: *Forgetting the two initialisation instructions of the software loop, or forgetting the 20 cycles of DMA setup. Both are small and both are in the question for a reason.*

**4:22–4:30** — Both of these are just bookkeeping. The reasoning is in the count, and the answer is one division.

> Caption: Both of these are just bookkeeping. The reasoning is in the count, and the answer is one division.

Exam-trap caption mode adds: *Reaching for a formula before deciding what is being counted. Written out, the count usually shows which of the four formulas applies, and sometimes shows that none does.*

## Scene 10. The recipe and the traps

*4:30 – 5:00 · objective: Leave with four steps that turn any interrupt or DMA question into arithmetic, and five traps to refuse.*

**4:30–4:37** — Step one: name the registers. Step two: name who copies. Everything else follows.

> Caption: Step one: name the registers. Step two: name who copies. Everything else follows.

Exam-trap caption mode adds: *Starting from the numbers. A question that mentions a 4 MHz clock may still be about identification rather than throughput, and the numbers are decoration.*

**4:37–4:45** — Step three: write down the count in the units the question uses. Step four: divide once, and check the units.

> Caption: Step three: write down the count in the units the question uses. Step four: divide once, and check the units.

Exam-trap caption mode adds: *Carrying two conventions for a kilobyte in the same calculation. Choose one, state it, and check whether the options can tell the difference.*

**4:45–4:52** — The five traps: identification against ranking, save before jump, one bus master, rounding down, and a fraction above one.

> Caption: The five traps: identification against ranking, save before jump, one bus master, rounding down, and a fraction above one.

Exam-trap caption mode adds: *Memorising the five as a list without the reason for each. Each one exists because a specific previous-year question was built on it.*

**4:52–5:00** — One topic, one question: who reads and writes the three registers, and how often.

> Caption: One topic, one question: who reads and writes the three registers, and how often.

Exam-trap caption mode adds: *Treating the three methods as three eras of history. They coexist in one machine: a keyboard may be interrupt-driven, a disk DMA, and a legacy port polled.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
