# Memory Interfacing and Interleaving — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/memory-interfacing-and-interleaving/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Why one chip is never enough

*0:00 – 0:30 · objective: Read a memory chip as a rectangle of words by bits, and see that covering a bigger rectangle needs two independent divisions, not one.*

**0:00–0:07** — A memory chip is a rectangle: a number of words, each a fixed number of bits wide.

> Caption: A memory chip is a rectangle: a number of words, each a fixed number of bits wide. It is written words times bits.

Exam-trap caption mode adds: *A chip described as 8K by 4 does not hold 8192 bytes. It holds 8192 words of 4 bits, which is 4096 bytes. The second number is bits per word, not bytes.*

**0:07–0:15** — The memory the design needs is a bigger rectangle: N words of B bits.

> Caption: The memory the design needs is a bigger rectangle: N words of B bits. Covering it takes two separate divisions.

Exam-trap caption mode adds: *Dividing the two bit capacities and stopping there gives the chip count but tells you nothing about the wiring, which is what the next questions ask.*

**0:15–0:22** — Width first: chips across. Depth second: rows. Total is the product.

> Caption: Width first: chips across equals capital B over small b. Depth second: rows equals capital N over small W. Total is the product.

Exam-trap caption mode adds: *Rounding one division up and then multiplying can overstate the array when a chip is wider than the word needed. Check the units of each ratio before multiplying.*

**0:22–0:30** — Sixteen K words of sixteen bits from one K words of eight bits: two across, sixteen rows, thirty-two chips.

> Caption: Sixteen K words of sixteen bits from one K words of eight bits: two chips across, sixteen rows, thirty-two chips.

Exam-trap caption mode adds: *Reading the array as 2 rows of 16 chips gives the same chip count and the wrong decoder. Rows are the depth direction, and the row decoder is what the question asks about.*

## Scene 2. The address is a bit budget

*0:30 – 1:00 · objective: Split the address into the bits a chip needs and the bits left over, and check that the leftovers can name every row.*

**0:30–0:37** — The total number of address bits is the base-two logarithm of the total number of words.

> Caption: The total number of address bits is the base-two logarithm of the total number of words in the finished memory.

Exam-trap caption mode adds: *Using the total number of bytes instead of words gives an address one or more bits too wide whenever a word is several bytes. Divide by the word size first.*

**0:37–0:45** — Each chip consumes the logarithm of its own word count. Whatever is left over has to choose a row.

> Caption: Each chip consumes the logarithm of its own word count. Whatever is left over has to choose a row.

Exam-trap caption mode adds: *Sending all 14 bits to every chip is not merely wasteful, it is impossible: the chip has 10 address pins. The split is forced by the hardware.*

**0:45–0:52** — Four leftover bits drive a four-to-sixteen decoder.

> Caption: Four leftover bits drive a four-to-sixteen decoder: fourteen minus ten is four, and two to the four is sixteen rows.

Exam-trap caption mode adds: *A decoder with more outputs than rows leaves some outputs unconnected, which is fine, but one with fewer cannot reach every row and the design silently loses capacity.*

**0:52–1:00** — Check the split against itself: two to the leftover bits must equal the number of rows.

> Caption: Check the split against itself: two to the leftover bits must equal the number of rows, and the two bit counts must add to the total.

Exam-trap caption mode adds: *A design can have a perfectly consistent bit split and still be wrong, if the two divisions in step one were swapped. Check the row count against the depth ratio, not against the decoder.*

## Scene 3. What is broadcast and what is decoded

*1:00 – 1:30 · objective: Name which address lines reach every chip and which reach the decoder, and see that the decoded lines need not be the top ones.*

**1:00–1:07** — Inside one row every chip receives the same low-order address bits.

> Caption: Inside one row every chip receives the same low-order address bits, because they all serve the same word at once.

Exam-trap caption mode adds: *Thinking each chip decodes the address for itself. Only one row is selected at a time; the chips inside it are all selected together and share the address.*

**1:07–1:15** — The leftover bits go to the decoder, whose outputs are the chip-select pins.

> Caption: The leftover bits go to the decoder, whose outputs are the chip-select pins: exactly one row is enabled per address.

Exam-trap caption mode adds: *Two rows enabled at once means two chips driving the same data lines, which is a bus conflict, not a wider word. Chip select is exclusive by construction.*

**1:15–1:22** — The decoded bits need not be the top ones.

> Caption: The decoded bits need not be the top ones. GATE 2023 sent IA4 and IA3 to the decoder and kept the rest for the chips.

Exam-trap caption mode adds: *Assuming a decoder always takes the most significant bits produces the option with offsets 0, 1024, 2048, 3072. That option is in the paper and it is wrong.*

**1:22–1:30** — So the four blocks start at zero, eight, sixteen and twenty-four.

> Caption: So the four blocks start at zero, eight, sixteen and twenty-four, and each owns eight bytes out of every thirty-two.

Exam-trap caption mode adds: *The blocks hold one kilobyte each, but a block is not a contiguous kilobyte. Reading "four 1 KB blocks" as four contiguous regions gives the offsets 0, 1024, 2048, 3072.*

## Scene 4. Chip select is a condition on address bits

*1:30 – 2:00 · objective: Turn a chip-select condition into an address range, and see that the range size comes from the undecoded bits rather than the chip.*

**1:30–1:37** — A chip-select pin is a logic condition on address bits.

> Caption: A chip-select pin is a logic condition on address bits: an AND gate whose inputs are bits or their complements.

Exam-trap caption mode adds: *Treating chip select as a simple address comparison. It is a conjunction, so each constrained bit cuts the region in half, and the order of the bits does not matter to the gate.*

**1:37–1:45** — Fix k bits out of n and two to the n minus k addresses remain.

> Caption: Fix k bits out of n and two to the n minus k addresses remain. That count is the size of the range.

Exam-trap caption mode adds: *Reporting the range size from the chip capacity. The chip may be smaller than the region it is selected for, and the region is what the address lines define.*

**1:45–1:52** — GATE 2019: A15, A14 and A11 must be one; A13 and A12 must be zero. That is C800 up to CFFF.

> Caption: GATE 2019: A15, A14 and A11 must be one; A13 and A12 must be zero. That is C800 up to CFFF.

Exam-trap caption mode adds: *Reading the free bits as a suffix and writing C800 to C8FF. The free bits are eleven in number, so the top of the range moves in the eleventh bit, not the eighth.*

**1:52–2:00** — The size of a chip-select region is set by the bits that were not decoded.

> Caption: The size of a chip-select region is set by the bits that were not decoded, not by the size of the chip behind it.

Exam-trap caption mode adds: *Aliasing is silent. A design that decodes too few bits works in simulation and breaks when a program relies on two addresses being distinct.*

## Scene 5. Decoder arithmetic

*2:00 – 2:30 · objective: Build the decoder a design needs out of smaller ones, and count them by the tree rather than by the chips.*

**2:00–2:07** — The decoder a design needs is usually not the decoder in the parts bin.

> Caption: The decoder a design needs is usually not the decoder in the parts bin, so it is built from smaller ones.

Exam-trap caption mode adds: *Forgetting that the small decoder must have an enable input. Without one, the outputs of several decoders would fight and the tree cannot be built at all.*

**2:07–2:15** — One two-to-four decoder takes the top two bits and enables four more.

> Caption: One two-to-four decoder takes the top two bits and enables four more, each of which takes the bottom two bits.

Exam-trap caption mode adds: *Wiring the four decoders in parallel without the enable stage. Four decoders fed the same two bits produce four identical sets of outputs, not sixteen distinct ones.*

**2:15–2:22** — The count is the sum of the tree: one plus four is five.

> Caption: The count is the sum of the tree: one plus four is five two-to-four decoders.

Exam-trap caption mode adds: *Answering four, the number of decoders that produce the final outputs, and forgetting the one that drives their enables. Answering six by counting the sixteen outputs as decoders.*

**2:22–2:30** — Two traps live here: counting chips where the question counts rows, and forgetting that only the row count sets the decoder.

> Caption: Two traps live here: counting chips where the question counts rows, and forgetting that only the row count sets the decoder.

Exam-trap caption mode adds: *Dividing the total chip count by the small decoder size. Thirty-two chips divided by four gives eight, which is wrong; sixteen rows divided by four gives four, which is right.*

## Scene 6. Interleaving: many banks, one bus

*2:30 – 3:00 · objective: Map an address to a bank under low-order and high-order interleaving, and say which one turns a sequential stream into parallel work.*

**2:30–2:37** — Interleaving splits memory into m banks. Each bank is busy for a whole cycle after it accepts a request.

> Caption: Interleaving splits memory into m banks. Each bank is busy for a whole cycle after it accepts a request.

Exam-trap caption mode adds: *Calling the banks faster. They are exactly as slow as before. What changes is that several of them are slow at the same time.*

**2:37–2:45** — Low-order interleaving takes the bank from the low bits: bank equals address mod m.

> Caption: Low-order interleaving takes the bank from the low bits: bank equals address mod m, so consecutive words go to different banks.

Exam-trap caption mode adds: *Assuming low-order interleaving means the bank number is the first word of the bank. It is the low bits of every address, so a bank holds every m-th word, not a contiguous run.*

**2:45–2:52** — High-order interleaving takes the bank from the high bits.

> Caption: High-order interleaving takes the bank from the high bits, so consecutive words stay inside one bank until it runs out.

Exam-trap caption mode adds: *Believing high-order interleaving is simply worse. It suits programs whose working set is local, because a whole block sits in one bank and never contends with another. It is worse only for a sequential stream.*

**2:52–3:00** — Only low-order interleaving turns a sequential stream into parallel work.

> Caption: Only low-order interleaving turns a sequential stream into parallel work, and that is the entire point of the design.

Exam-trap caption mode adds: *Interleaving does not help a program that keeps hitting one bank. Bank conflicts on a strided access pattern can make the interleaved system no faster than a single bank.*

## Scene 7. The overlap condition

*3:00 – 3:30 · objective: Check m times the bus cycle against the bank cycle before using the overlap formula, and simulate what happens when the check fails.*

**3:00–3:07** — With m banks the bus can start a new word every bus cycle, provided a bank is free.

> Caption: With m banks the bus can start a new word every bus cycle, provided a bank is free when its turn comes.

Exam-trap caption mode adds: *Assuming the bus can issue faster than it physically can. The bus cycle is a floor on the interval, and no amount of banks removes it.*

**3:07–3:15** — A bank is free again after its cycle time, and the bus comes back to it after m bus cycles.

> Caption: A bank is free again after its cycle time, and the bus comes back to it after m bus cycles. Compare the two.

Exam-trap caption mode adds: *Comparing the bank cycle with one bus cycle instead of m of them. That mistake always concludes the banks cannot keep up, which is false for enough banks.*

**3:15–3:22** — So the clean formula holds exactly when m times the bus cycle is at least the bank cycle.

> Caption: So the clean formula holds exactly when m times the bus cycle is at least the bank cycle. Otherwise the pipeline stalls.

Exam-trap caption mode adds: *Using the formula because it is the one in the notes. State the condition first; several questions are written specifically to break it.*

**3:22–3:30** — Two banks, forty nanoseconds each, ten nanosecond bus: eight words take a hundred and seventy, not a hundred and ten.

> Caption: Two banks, forty nanoseconds each, ten nanosecond bus: eight words take a hundred and seventy, not a hundred and ten.

Exam-trap caption mode adds: *This is the counterexample that keeps the formula honest. If a solution is smaller than a schedule you can draw, the solution is wrong.*

## Scene 8. Bandwidth, and what the bus carries

*3:30 – 4:00 · objective: Compute sustained bandwidth as word width over the steady interval, and read the GATE 2014 store-throughput question off the same model.*

**3:30–3:37** — Bandwidth is the word width divided by the steady interval between words.

> Caption: Bandwidth is the word width divided by the steady interval between words, and the interval is the larger of the bus cycle and the cycle time over m.

Exam-trap caption mode adds: *Reporting the peak bandwidth as if it were sustained. Peak assumes back-to-back requests to different banks with no gaps, which a real program does not supply.*

**3:37–3:45** — Interleaving multiplies bandwidth by m only until the bus saturates.

> Caption: Interleaving multiplies bandwidth by m only until the bus saturates, and after that more banks buy nothing.

Exam-trap caption mode adds: *A question asking for the number of banks needed for a given bandwidth has an answer at the knee, not beyond it. Adding banks past the knee is not a design improvement.*

**3:45–3:52** — Eight modules busy for six hundred nanoseconds behind a hundred nanosecond bus: ten thousand stores in a millisecond.

> Caption: GATE 2014: eight modules busy for six hundred nanoseconds behind a hundred nanosecond bus. The bus is the limit, so ten thousand stores in a millisecond.

Exam-trap caption mode adds: *Dividing the millisecond by six hundred, the module cycle, gives 1666. The module cycle limits how many stores finish, not how many start, and the question asks for starts.*

**3:52–4:00** — With five modules instead of eight the answer would be eight thousand three hundred and thirty.

> Caption: With five modules instead of eight the answer would be eight thousand three hundred and thirty, because the bus would stall.

Exam-trap caption mode adds: *The number of stores initiated is not the number completed. Completions lag by the module cycle, and the two counts differ by a handful near the end of the window.*

## Scene 9. A real block fetch: 24 banks

*4:00 – 4:30 · objective: Work the 2006 bank-latency question end to end, and state honestly where published solutions disagree.*

**4:00–4:07** — GATE 2006: twenty-four banks, each two bytes wide, so one parallel access delivers forty-eight bytes.

> Caption: GATE 2006: twenty-four banks, each two bytes wide, so one parallel access delivers forty-eight bytes.

Exam-trap caption mode adds: *Multiplying by the block size instead of the bank width. The block size is what you want; the bank width is what one bank gives.*

**4:07–4:15** — A sixty-four byte cache block needs two rounds, and ninety-six bytes travel to deliver sixty-four.

> Caption: A sixty-four byte cache block needs two rounds, and ninety-six bytes travel to deliver sixty-four.

Exam-trap caption mode adds: *Rounding sixty-four over forty-eight up to two is right, but then charging only the useful bytes to the time. The time is two full rounds.*

**4:15–4:22** — Each round costs the bank latency of eighty nanoseconds plus twelve for decoding, so ninety-two.

> Caption: Each round costs the bank latency of eighty nanoseconds plus twelve for decoding the bank numbers, so ninety-two.

Exam-trap caption mode adds: *Decoding once for both rounds. The question says each iteration requires decoding, and the decoder is addressing different banks in the second round.*

**4:22–4:30** — The answer most keys give is a hundred and eighty-four nanoseconds. Some published solutions say a hundred and seventy-two.

> Caption: The answer most keys give is a hundred and eighty-four nanoseconds. Some published solutions say a hundred and seventy-two, and the lesson says so.

Exam-trap caption mode adds: *Choosing a hundred and seventy-two because it is smaller. In an exam, match the model the question describes; the question says each iteration requires decoding.*

## Scene 10. The recipe and the traps

*4:30 – 5:00 · objective: Leave with four steps that turn any interfacing or interleaving question into arithmetic, and five traps to refuse.*

**4:30–4:37** — Step one: divide twice. Bits for the width, words for the depth.

> Caption: Step one: divide twice. Bits for the width, words for the depth. Never one division for both.

Exam-trap caption mode adds: *A single division of capacities gives the right chip count and the wrong array shape, and every following part of the question uses the shape.*

**4:37–4:45** — Step two: address bits are log of the words, the chip takes log of its words, and the rest go to the decoder.

> Caption: Step two: address bits are log of the words, the chip takes log of its words, and the rest go to the decoder.

Exam-trap caption mode adds: *Reporting the range size as the chip capacity. The range comes from the free bits and the chip may be smaller or larger.*

**4:45–4:52** — Step three: for interleaving, write the bank schedule, then check the condition.

> Caption: Step three: for interleaving, write the bank schedule, then check m times the bus cycle against the bank cycle.

Exam-trap caption mode adds: *Memorising the formula without the condition. Questions with two or three banks exist precisely to punish that.*

**4:52–5:00** — Step four: convert units once, at the end, and keep the five traps in mind.

> Caption: Step four: convert units once, at the end, and keep the five traps in mind.

Exam-trap caption mode adds: *Converting nanoseconds to milliseconds in the middle of a calculation and then again at the end, which shifts the answer by three orders of magnitude.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
