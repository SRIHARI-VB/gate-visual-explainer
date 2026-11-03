# ROM, PLA and PAL: the two-level array, the dots that program it, and the arithmetic of choosing a device — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/rom-pla-and-pal-programmable-logic/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Two planes, three devices

*0:00 – 0:30 · objective: Read every programmable device as an AND plane followed by an OR plane, and name which plane each of ROM, PLA and PAL lets you program.*

**0:00–0:07** — Start with one picture that covers the whole topic. Any sum of products is an AND plane and then an OR plane. The AND plane builds the product terms, one per row. The OR plane adds up the rows that belong to each output.

> Caption: Every two-level circuit is an AND plane followed by an OR plane: the products first, then their sum.

Exam-trap caption mode adds: *Two-level does not mean two gates. It means the expression has depth two: a layer of ANDs and one OR after them.*

**0:07–0:15** — The three devices are not three subjects. They are three answers to one question: which of these two planes can you program, and which one was wired before the chip reached you.

> Caption: The three devices answer one question differently: which of the two planes may you program?

Exam-trap caption mode adds: *A device with a fixed plane is not unprogrammable. It still has one programmable plane; the fixed one is simply not your decision.*

**0:15–0:22** — A ROM fixes the AND plane as a full decoder and lets you fill the OR plane. A PLA lets you program both. A PAL programs the AND plane and fixes the OR plane, each output getting its own private group of terms.

> Caption: ROM: fixed decoder, programmable OR. PLA: both programmable. PAL: programmable AND, fixed OR.

Exam-trap caption mode adds: *PAL is not a small PLA. The fixed OR plane is the defining feature, and it is what forbids sharing a product term between outputs.*

**0:22–0:30** — Everything numeric in this lesson comes from that sentence. A ROM is m times two to the n bits. A PLA is two n k links in the AND plane plus k m in the OR plane. Hold those two formulas and the rest is arithmetic.

> Caption: That one sentence produces every size formula: m times 2 to the n bits for a ROM, 2nk plus km links for a PLA.

Exam-trap caption mode adds: *The ROM exponent is the input count, not the output count. Swapping n and m is the most common slip in a ROM size question.*

## Scene 2. A ROM is a stored truth table

*0:30 – 1:00 · objective: See the fixed decoder produce every minterm and the OR plane store one bit per output, so that no minimisation is needed.*

**0:30–0:37** — Here is a four-input ROM. The decoder has sixteen output lines, one per minterm, and it raises exactly one of them for each input word. Every minterm exists as a wire before you say what the function is.

> Caption: A four-input ROM has a sixteen-line decoder: one line per minterm, all sixteen generated whether you want them or not.

Exam-trap caption mode adds: *A decoder is not a demultiplexer in this context. It is a minterm generator: its job is to name one address, not to route data.*

**0:37–0:45** — Program it. The function is one at addresses zero, two, five, seven, eight, ten, thirteen and fifteen. The stored column then reads one, zero, one, zero and so on: eight ones out of sixteen. That column is the function.

> Caption: For f = sum of m(0,2,5,7,8,10,13,15) the stored column holds eight ones and eight zeros: that is the whole function.

Exam-trap caption mode adds: *The stored bit is not the minterm number. It is the value of the function at that minterm, which is 1 only for the minterms in the sum.*

**0:45–0:52** — The address is not a label, it is the input word. Five is zero one zero one, so A is zero, B is one, C is zero and D is one. The bit stored at address five is the answer for that assignment.

> Caption: Read the address as the input word: address 5 is A B-prime C D, and the bit stored there is the value of f on that input.

Exam-trap caption mode adds: *The most significant bit is the first variable only if you say so. A question that numbers minterms differently is asking about a different column.*

**0:52–1:00** — Which gives the ROM its character. It needs no minimisation, it has no product terms to count, and its size is decided before anyone knows which function it will hold. Any function of four variables fits in the same sixteen bits.

> Caption: So a ROM needs no minimisation and has no product terms to count: its size is fixed before you know the function.

Exam-trap caption mode adds: *Minimising before storing a function in a ROM saves nothing at all. Every address has a stored bit whether that bit is one or zero.*

## Scene 3. ROM arithmetic: m times two to the n

*1:00 – 1:30 · objective: Size any ROM from its input and output counts, and read the exponent as the reason the device doubles per input.*

**1:00–1:07** — Now the arithmetic. Size is m times two to the n bits. Four inputs and one output: sixteen addresses, one bit each, sixteen bits in all. That is two bytes.

> Caption: Size is m times 2 to the n bits: four inputs and one output is 16 words of one bit, which is 16 bits.

Exam-trap caption mode adds: *Bits, not words. A sixteen-word ROM of one-bit words is sixteen bits; sixteen words of eight-bit words would be 128 bits.*

**1:07–1:15** — Eight inputs and four outputs. Two to the eight is two hundred fifty-six addresses, four bits at each, so one thousand and twenty-four bits, or a hundred and twenty-eight bytes.

> Caption: Eight inputs and four outputs is 256 words of four bits: 1024 bits, which is 128 bytes.

Exam-trap caption mode adds: *Four outputs do not give four ROMs. They give four bits per address in one device, which is why the multiplication is by m and not by a power.*

**1:15–1:22** — Twelve inputs and eight outputs. Four thousand and ninety-six addresses, eight bits each: thirty-two thousand seven hundred and sixty-eight bits, which is four thousand and ninety-six bytes, because a byte is one address here.

> Caption: Twelve inputs and eight outputs is 4096 words of eight bits: 32,768 bits, or 4096 bytes.

Exam-trap caption mode adds: *A 4K by 8 ROM is 4096 bytes, not 4096 bits. Read the word size before dividing by eight.*

**1:22–1:30** — Notice where the input count sits: in the exponent. One more input doubles the device. Four more multiply it by sixteen. The output count is a plain multiplier, so width is cheap and depth is not.

> Caption: The input count sits in the exponent, so one more input doubles the device and four more multiply it by sixteen.

Exam-trap caption mode adds: *Doubling the outputs doubles the bits; doubling the inputs squares the words. Those are very different growth rates.*

## Scene 4. Why a ROM wastes, and what the PLA changes

*1:30 – 2:00 · objective: Show that ROM size ignores the function, then introduce the PLA, whose product-line count k is a design choice.*

**1:30–1:37** — Now the waste. This function minimises to two product terms, four literals. The ROM does not care. It still has sixteen rows and sixteen stored bits, because its size was fixed by the four inputs.

> Caption: f needs two product terms, yet its ROM still has sixteen rows: the device is sized by the inputs, not by the answer.

Exam-trap caption mode adds: *A small minimised expression does not mean a small ROM. The ROM pays for the input space, not for the expression.*

**1:37–1:45** — A function needing sixteen terms occupies exactly the same sixteen bits. Same device, different contents. That is what it means to call a ROM a lookup table: you are not saving gates, you are writing an answer.

> Caption: A function needing sixteen terms occupies exactly the same sixteen bits, and minimising before storing saves nothing.

Exam-trap caption mode adds: *So a question that asks how much ROM a minimised function needs is not asking you to minimise. Minimisation is irrelevant to ROM size.*

**1:45–1:52** — What you buy for that waste is freedom. A four-variable function is sixteen independent answers, so there are sixty-five thousand five hundred and thirty-six of them, and this one device stores any of them unchanged.

> Caption: What the ROM buys is freedom: all 65,536 functions of four variables fit the same 16-bit device.

Exam-trap caption mode adds: *The count of functions is two to the two-to-the-n, not two to the n. Sixteen answers, each free, is two to the sixteen.*

**1:52–2:00** — So the PLA changes one thing. It replaces the fixed decoder with k programmable AND gates, and k is a number the designer chooses. Now the device is sized by the function, not by the input space.

> Caption: The PLA keeps both planes and makes the product-line count k a design choice, far below 2 to the n.

Exam-trap caption mode adds: *k is not the number of minterms. It is the number of distinct product terms the whole set of outputs needs, counted once across all of them.*

## Scene 5. The PLA: three numbers, two planes

*2:00 – 2:30 · objective: Build the PLA crossbar from n, k and m, and derive the link count 2nk + km from the crossing lines.*

**2:00–2:07** — A PLA is three numbers: n inputs, k product terms, m outputs. Written n by k by m. Three by four by two means three inputs, four product rows and two outputs.

> Caption: A PLA is described by three numbers: n inputs, k product terms and m outputs.

Exam-trap caption mode adds: *The middle number is product terms, not outputs. A 3 by 4 by 2 device has four rows, and each row is one AND gate.*

**2:07–2:15** — Each input arrives twice, true and complemented, so four inputs give eight vertical lines. Those lines cross k horizontal product rows, and that grid is the AND plane. A dot at a crossing puts that literal into that term.

> Caption: Each input enters both true and complemented, so 2n vertical lines cross k product rows: that is the AND plane.

Exam-trap caption mode adds: *The complement lines are not extra inputs. They are the same variables, so a term can contain A or A-prime but never both.*

**2:15–2:22** — The product rows then run into the OR plane, where they cross m output columns. A dot there means that term is summed into that output. And because this plane is programmable, one row can feed several outputs at once.

> Caption: The k product rows then cross m output columns: that is the OR plane, and it is programmable too.

Exam-trap caption mode adds: *A missing dot in the OR plane is not a zero output. An output with no dots at all is a constant zero, and an output dotted to every row is the sum of everything.*

**2:22–2:30** — Count the crossings and you have the device. Two n k links in the AND plane, k m in the OR plane, eighteen in all for four inputs, two rows and one output. Linear in each number, with nothing exponential anywhere.

> Caption: So the device has 2nk plus km programmable links: for n=4, k=2, m=1 that is 16 plus 2, which is 18.

Exam-trap caption mode adds: *The link count is the number of possible crossings, not the number you program. A programmed PLA uses only some of them.*

## Scene 6. Programming: a dot is a literal

*2:30 – 3:00 · objective: Turn a minimised sum of products into the dot pattern of an AND plane and an OR plane, and count the programmed dots.*

**2:30–2:37** — With a PLA you minimise first, because the AND plane forms only what you name. This function is B-prime D-prime plus B D: two terms, four literals, eight minterms covered, and nothing else.

> Caption: Minimise first: f = B-prime D-prime plus B D, two terms and four literals, not the sixteen minterms.

Exam-trap caption mode adds: *A non-minimal expression still works if k is large enough. It is not wrong, it is just larger, and a question about k cares about the minimum.*

**2:37–2:45** — Now program it. Row one puts dots on B-prime and D-prime. Row two puts dots on B and D. Every other crossing stays bare, and a bare crossing simply means that variable is not in the term.

> Caption: Row one dots the B-prime and D-prime lines; row two dots B and D. A crossing without a dot is an absent variable.

Exam-trap caption mode adds: *Dots on both A and A-prime in one row would make the term always zero. A correct programming never dots a variable against its own complement.*

**2:45–2:52** — In the OR plane, both rows dot the one output column, because the function is the sum of both terms. Two dots here, and the expression is complete.

> Caption: In the OR plane both rows dot the single output column, because f is the sum of the two products.

Exam-trap caption mode adds: *An OR is a dot in a column, not a second row. Adding a row adds a product term; adding a dot adds that term to an output.*

**2:52–3:00** — Four dots in the AND plane, two in the OR plane, six out of eighteen possible. And the picture is the formula: read the dots on a row and you have a product term, read the dots in a column and you have the sum.

> Caption: Six dots are programmed out of eighteen possible, and reading the dots reads the expression.

Exam-trap caption mode adds: *The blank crossings are not wasted logic. They are the reason a PLA can be reused for a different function without changing the chip.*

## Scene 7. Sharing: why the OR plane is programmable

*3:00 – 3:30 · objective: Count the product lines a pair of outputs needs on a PLA against the same pair on a PAL, where a term cannot be shared.*

**3:00–3:07** — Two outputs. F1 is C plus A-prime B. F2 is C-prime plus A-prime B. Count the distinct terms across both, not per output: C, C-prime and A-prime B, which is three rows for the pair.

> Caption: Two outputs: F1 = C + A-prime B and F2 = C-prime + A-prime B. Three distinct product terms serve both.

Exam-trap caption mode adds: *Counting each output separately gives four and overstates the device. The count is across the whole PLA, term by term, once.*

**3:07–3:15** — The PLA builds A-prime B once, on one row, and dots it into both output columns. Three product lines instead of four. Eighteen AND-plane links plus six in the OR plane, twenty-four in all.

> Caption: The PLA forms A-prime B once and dots it into both output columns, so it needs three product lines, not four.

Exam-trap caption mode adds: *A shared term must be identical in both functions. A-prime B and A B are different terms and cannot be shared even if they look similar.*

**3:15–3:22** — The same pair on a PAL. The OR plane is fixed, each output owns its own group of rows, so A-prime B has to be built twice, once in each group. Four product lines where the PLA needed three.

> Caption: A PAL has a fixed OR plane, so a term belongs to one output: A-prime B must be built twice, giving four lines.

Exam-trap caption mode adds: *This is not a bug in the PAL. Fixed OR wiring is what makes it faster and cheaper, and losing sharing is the price.*

**3:22–3:30** — So the difference is one number: three lines against four. That is what the programmable OR plane buys. It is also why a design that fits a PLA in k terms may not fit the same PAL.

> Caption: The whole difference in one number: 3 product lines on a PLA against 4 on a PAL for the same pair.

Exam-trap caption mode adds: *Do not assume a PAL needs exactly twice the terms. It needs the sum of the per-output counts, which is four here and can be much worse elsewhere.*

## Scene 8. The arithmetic of choosing a device

*3:30 – 4:00 · objective: Apply the three size formulas to one specification, and check two real devices against them.*

**3:30–3:37** — Three formulas and the whole topic is arithmetic. ROM: m times two to the n bits. PLA: two n k plus k m links. PAL: two n times its product lines, and no OR-plane fuses because that plane is fixed.

> Caption: Three formulas cover the questions: m times 2 to the n bits for a ROM, 2nk plus km links for a PLA, 2n times the terms for a PAL.

Exam-trap caption mode adds: *A PAL fuse count that includes an OR plane is wrong by construction. The fixed plane has no fuses to count.*

**3:37–3:45** — One specification, both devices. Eight inputs, four outputs, six product terms. The ROM is one thousand and twenty-four bits. The PLA is ninety-six plus twenty-four, a hundred and twenty links.

> Caption: Eight inputs, four outputs, six product terms: 1024 ROM bits against 96 plus 24, which is 120 PLA links.

Exam-trap caption mode adds: *Bits and links are different units. Comparing them directly is meaningless; comparing the growth rate, or the cost per unit, is not.*

**3:45–3:52** — A real device, the 82S100: sixteen inputs, forty-eight product terms, eight outputs. Fifteen hundred and thirty-six links in the AND plane, three hundred and eighty-four in the OR plane, nineteen hundred and twenty in all. The same function space on a ROM is half a million bits.

> Caption: A real 16 by 48 by 8 PLA has 1536 AND-plane links and 384 OR-plane links: 1920 in all.

Exam-trap caption mode adds: *The 1920 is a count of possible crossings. Programming the device leaves most of them unconnected; that does not change its size.*

**3:52–4:00** — And a real PAL, the 16L8. Sixteen inputs, so thirty-two columns. Sixty-four rows, so two thousand and forty-eight fuses in the AND array. Eight outputs, seven product terms each, and no OR-plane fuses at all.

> Caption: The PAL16L8 has 64 rows crossing 32 columns, 2048 fuses in the AND array, and seven terms per output.

Exam-trap caption mode adds: *Seven terms per output is a hard ceiling, so a function needing eight terms on one output cannot be done on a single 16L8 output.*

## Scene 9. Where the PLA stops, and the two escapes

*4:00 – 4:30 · objective: Show that parity needs 2 to the n minus 1 terms, then use don't cares and output inversion to fit a smaller device.*

**4:00–4:07** — Parity is the worst case for two-level logic. No two of its minterms are adjacent, so nothing merges, and four variables need eight terms. The page searched every cover of seven and found none.

> Caption: Parity of four variables is the worst case: 2 to the n minus 1, so eight product terms, and no seven-term cover exists.

Exam-trap caption mode adds: *Parity is not "hard to minimise because it is complicated". It is hard because its ones are pairwise non-adjacent, which is a structural fact.*

**4:07–4:15** — So a device with three rows cannot hold parity, however you program it. k is physical. Eight terms need eight rows, and on this device that is sixty-four links in the AND plane plus eight in the OR plane.

> Caption: A device with k equal to three cannot hold it, however cleverly you program it: k is a hard limit on the rows.

Exam-trap caption mode adds: *A non-minimal expression never rescues a device that is too small. More terms is exactly what the device cannot accept.*

**4:15–4:22** — Don't cares are the first escape. Six required minterms normally need two terms. Add two don't cares and the single term B-prime covers all six, so a one-row device will do.

> Caption: Don't cares lower k: minterms 0,1,2,3,8,9 need two terms, but with 10 and 11 as don't cares one term covers all six.

Exam-trap caption mode adds: *A don't care is a promise that the input never occurs. If it can occur, treating it as a don't care is a wrong answer, not a smaller one.*

**4:22–4:30** — The second escape is to program the complement. A function that is zero at just one minterm needs four terms directly, but its complement is that one minterm. One row, plus an inverter at the output.

> Caption: Output inversion is the second escape: a function needing four terms becomes one term plus an inverter.

Exam-trap caption mode adds: *Inversion needs a programmable output inverter. A PLA without one cannot take this route, and the answer stays four terms.*

## Scene 10. Choose, count, program

*4:30 – 5:00 · objective: Run the four-step procedure over the whole topic, and separate the three erasable-memory variants from the array question.*

**4:30–4:37** — One procedure covers every question. Fix n, k and m from the specification. Minimise across all outputs, counting each term once. Apply the formula. Then check the count against the device and say what fails if it does not fit.

> Caption: Four steps: fix n, k and m; minimise; count links or bits; check that the count fits the device.

Exam-trap caption mode adds: *Step two is where most marks go: minimising each output separately overstates k and gives a device that looks too small.*

**4:37–4:45** — One distinction that is asked as a fact, not as arithmetic. PROM, EPROM and EEPROM differ only in how the array is written and erased: fuses once, ultraviolet light, or electrically. All three keep the fixed decoder.

> Caption: PROM is programmed once, EPROM is erased with ultraviolet light, EEPROM and flash electrically: the AND plane is fixed in all of them.

Exam-trap caption mode adds: *EPROM is not a PLA with erasable fuses. Its AND plane is still a full decoder, so its size still follows m times two to the n.*

**4:45–4:52** — Every number on this page was computed here and checked against a definition: sixteen bits, eighteen links, twenty-four against four, eight parity terms, nineteen hundred and twenty. The check count is printed under the canvas.

> Caption: Every number here was computed and checked: 16 bits, 18 links, 24 links against 4 PAL lines, 8 parity terms, 1920 links.

Exam-trap caption mode adds: *A diagram is not a proof. The dots show the formula; the exhaustive evaluation is what shows the formula is the function.*

**4:52–5:00** — One sentence to carry into the exam. The ROM stores the answer, the PLA stores the terms, and the PAL stores the terms without sharing them. Each one tells you which formula the question wants.

> Caption: One sentence to carry: the ROM stores the answer, the PLA stores the terms, and the PAL stores the terms without sharing them.

Exam-trap caption mode adds: *Reading the dot pattern is the same skill in all three devices. Only the size formula changes with the device.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
