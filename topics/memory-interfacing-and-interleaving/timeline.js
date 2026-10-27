/* ==========================================================================
   memory-interfacing-and-interleaving - THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs - never edited by hand.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'chips',
      n: 1,
      title: 'Why one chip is never enough',
      start: 0, end: 30,
      objective: 'Read a memory chip as a rectangle of words by bits, and see that covering a bigger rectangle needs two independent divisions, not one.'
    },
    {
      id: 'bits',
      n: 2,
      title: 'The address is a bit budget',
      start: 30, end: 60,
      objective: 'Split the address into the bits a chip needs and the bits left over, and check that the leftovers can name every row.'
    },
    {
      id: 'wiring',
      n: 3,
      title: 'What is broadcast and what is decoded',
      start: 60, end: 90,
      objective: 'Name which address lines reach every chip and which reach the decoder, and see that the decoded lines need not be the top ones.'
    },
    {
      id: 'cs',
      n: 4,
      title: 'Chip select is a condition on address bits',
      start: 90, end: 120,
      objective: 'Turn a chip-select condition into an address range, and see that the range size comes from the undecoded bits rather than the chip.'
    },
    {
      id: 'decoder',
      n: 5,
      title: 'Decoder arithmetic',
      start: 120, end: 150,
      objective: 'Build the decoder a design needs out of smaller ones, and count them by the tree rather than by the chips.'
    },
    {
      id: 'interleave',
      n: 6,
      title: 'Interleaving: many banks, one bus',
      start: 150, end: 180,
      objective: 'Map an address to a bank under low-order and high-order interleaving, and say which one turns a sequential stream into parallel work.'
    },
    {
      id: 'overlap',
      n: 7,
      title: 'The overlap condition',
      start: 180, end: 210,
      objective: 'Check m times the bus cycle against the bank cycle before using the overlap formula, and simulate what happens when the check fails.'
    },
    {
      id: 'bandwidth',
      n: 8,
      title: 'Bandwidth, and what the bus carries',
      start: 210, end: 240,
      objective: 'Compute sustained bandwidth as word width over the steady interval, and read the GATE 2014 store-throughput question off the same model.'
    },
    {
      id: 'gate2006',
      n: 9,
      title: 'A real block fetch: 24 banks',
      start: 240, end: 270,
      objective: 'Work the 2006 bank-latency question end to end, and state honestly where published solutions disagree.'
    },
    {
      id: 'recipe',
      n: 10,
      title: 'The recipe and the traps',
      start: 270, end: 300,
      objective: 'Leave with four steps that turn any interfacing or interleaving question into arithmetic, and five traps to refuse.'
    }
  ],

  events: [

    /* ---------------- scene 1: chips ---------------- */
    {
      id: 'ch-1', start: 0, end: 7.5, scene: 'chips',
      caption: 'A memory chip is a rectangle: a number of words, each a fixed number of bits wide. It is written words times bits.',
      detail: 'A 1K by 8 chip holds 1024 words and each word is 8 bits, so it holds 8192 bits. Both numbers matter and they mean different things: the first is depth, how many different addresses the chip can hold, and the second is width, how much data arrives on one access.',
      keyword: 'words times bits',
      trap: 'A chip described as 8K by 4 does not hold 8192 bytes. It holds 8192 words of 4 bits, which is 4096 bytes. The second number is bits per word, not bytes.',
      narration: 'A memory chip is a rectangle: a number of words, each a fixed number of bits wide.'
    },
    {
      id: 'ch-2', start: 7.5, end: 15, scene: 'chips',
      caption: 'The memory the design needs is a bigger rectangle: N words of B bits. Covering it takes two separate divisions.',
      detail: 'The target is stated the same way, as total words and bits per word. Comparing two rectangles gives two ratios. The ratio of the widths says how many chips must sit side by side to make one word wide enough. The ratio of the depths says how many such rows are needed.',
      keyword: 'two separate divisions',
      trap: 'Dividing the two bit capacities and stopping there gives the chip count but tells you nothing about the wiring, which is what the next questions ask.',
      narration: 'The memory the design needs is a bigger rectangle: N words of B bits.'
    },
    {
      id: 'ch-3', start: 15, end: 22.5, scene: 'chips',
      caption: 'Width first: chips across equals capital B over small b. Depth second: rows equals capital N over small W. Total is the product.',
      detail: 'The two divisions are independent, so you may do them in either order but you must do both. Chips across is how many chips share one address to produce a full word. Rows is how many groups of that width exist. Their product is the chip count.',
      keyword: 'the product of two divisions',
      trap: 'Rounding one division up and then multiplying can overstate the array when a chip is wider than the word needed. Check the units of each ratio before multiplying.',
      narration: 'Width first: chips across. Depth second: rows. Total is the product.'
    },
    {
      id: 'ch-4', start: 22.5, end: 30, scene: 'chips',
      caption: 'Sixteen K words of sixteen bits from one K words of eight bits: two chips across, sixteen rows, thirty-two chips.',
      detail: 'This is the GATE 2013 array. Two 1K by 8 chips side by side give 1K words of 16 bits. Sixteen of those rows give 16K words. The chip count is 32, and the array is 16 rows by 2 columns, which is the fact the decoder question then uses.',
      keyword: '2 across, 16 rows, 32 chips',
      trap: 'Reading the array as 2 rows of 16 chips gives the same chip count and the wrong decoder. Rows are the depth direction, and the row decoder is what the question asks about.',
      narration: 'Sixteen K words of sixteen bits from one K words of eight bits: two across, sixteen rows, thirty-two chips.'
    },

    /* ---------------- scene 2: bits ---------------- */
    {
      id: 'bi-1', start: 30, end: 37.5, scene: 'bits',
      caption: 'The total number of address bits is the base-two logarithm of the total number of words in the finished memory.',
      detail: 'Sixteen K words needs 14 address bits, because 2 to the 14 is 16384. This is a property of the finished memory, not of any chip: the processor presents one address of this width and the array must make sense of all of it.',
      keyword: 'log base two of the word count',
      trap: 'Using the total number of bytes instead of words gives an address one or more bits too wide whenever a word is several bytes. Divide by the word size first.',
      narration: 'The total number of address bits is the base-two logarithm of the total number of words.'
    },
    {
      id: 'bi-2', start: 37.5, end: 45, scene: 'bits',
      caption: 'Each chip consumes the logarithm of its own word count. Whatever is left over has to choose a row.',
      detail: 'A 1K by 8 chip needs 10 address bits to name one of its 1024 words. Fourteen minus ten leaves four. Those four bits cannot go to a chip, because no chip has room for them, so they go to the decoder that picks which row is listening.',
      keyword: 'the leftover bits choose a row',
      trap: 'Sending all 14 bits to every chip is not merely wasteful, it is impossible: the chip has 10 address pins. The split is forced by the hardware.',
      narration: 'Each chip consumes the logarithm of its own word count. Whatever is left over has to choose a row.'
    },
    {
      id: 'bi-3', start: 45, end: 52.5, scene: 'bits',
      caption: 'Four leftover bits drive a four-to-sixteen decoder: fourteen minus ten is four, and two to the four is sixteen rows.',
      detail: 'The decoder has as many outputs as there are rows and as many inputs as there are leftover bits, so its size is completely determined by the two logarithms. Nothing about the design is a choice here.',
      keyword: 'four-to-sixteen decoder',
      trap: 'A decoder with more outputs than rows leaves some outputs unconnected, which is fine, but one with fewer cannot reach every row and the design silently loses capacity.',
      narration: 'Four leftover bits drive a four-to-sixteen decoder.'
    },
    {
      id: 'bi-4', start: 52.5, end: 60, scene: 'bits',
      caption: 'Check the split against itself: two to the leftover bits must equal the number of rows, and the two bit counts must add to the total.',
      detail: 'Two checks catch almost every slip. First, the per-chip bits plus the leftover bits must equal the total address width. Second, two raised to the leftover bits must equal the number of rows you computed by dividing depths. If either fails, the array and the address are describing different memories.',
      keyword: 'two checks',
      trap: 'A design can have a perfectly consistent bit split and still be wrong, if the two divisions in step one were swapped. Check the row count against the depth ratio, not against the decoder.',
      narration: 'Check the split against itself: two to the leftover bits must equal the number of rows.'
    },

    /* ---------------- scene 3: wiring ---------------- */
    {
      id: 'wi-1', start: 60, end: 67.5, scene: 'wiring',
      caption: 'Inside one row every chip receives the same low-order address bits, because they all serve the same word at once.',
      detail: 'The two chips in a row hold different halves of the same 16-bit word. They must therefore agree on which word is being asked for, which means the word address is broadcast to both in parallel. This is why a row is a unit: one address, several chips.',
      keyword: 'broadcast within a row',
      trap: 'Thinking each chip decodes the address for itself. Only one row is selected at a time; the chips inside it are all selected together and share the address.',
      narration: 'Inside one row every chip receives the same low-order address bits.'
    },
    {
      id: 'wi-2', start: 67.5, end: 75, scene: 'wiring',
      caption: 'The leftover bits go to the decoder, whose outputs are the chip-select pins: exactly one row is enabled per address.',
      detail: 'The decoder turns the high bits into a one-hot signal on the chip-select pins. A chip whose select is inactive ignores its address pins entirely and puts its data outputs in a high-impedance state, so the selected row alone drives the bus.',
      keyword: 'one row enabled per address',
      trap: 'Two rows enabled at once means two chips driving the same data lines, which is a bus conflict, not a wider word. Chip select is exclusive by construction.',
      narration: 'The leftover bits go to the decoder, whose outputs are the chip-select pins.'
    },
    {
      id: 'wi-3', start: 75, end: 82.5, scene: 'wiring',
      caption: 'The decoded bits need not be the top ones. GATE 2023 sent IA4 and IA3 to the decoder and kept the rest for the chips.',
      detail: 'Nothing in the hardware requires the row-select bits to be contiguous or to sit at the top of the address. In that question the two lines feeding the two-to-four decoder are bits 4 and 3, while bits 11 down to 5 and 2 down to 0 feed the address port of every block.',
      keyword: 'the decoded bits need not be the top ones',
      trap: 'Assuming a decoder always takes the most significant bits produces the option with offsets 0, 1024, 2048, 3072. That option is in the paper and it is wrong.',
      narration: 'The decoded bits need not be the top ones.'
    },
    {
      id: 'wi-4', start: 82.5, end: 90, scene: 'wiring',
      caption: 'So the four blocks start at zero, eight, sixteen and twenty-four, and each owns eight bytes out of every thirty-two.',
      detail: 'Because bits 4 and 3 select the block, block k owns exactly the addresses whose bits 4 and 3 spell k. Those addresses come in runs of eight bytes, one run in every thirty-two. The blocks are one kilobyte each and they are interleaved at eight-byte granularity, not laid end to end.',
      keyword: 'eight bytes out of every thirty-two',
      trap: 'The blocks hold one kilobyte each, but a block is not a contiguous kilobyte. Reading "four 1 KB blocks" as four contiguous regions gives the offsets 0, 1024, 2048, 3072.',
      narration: 'So the four blocks start at zero, eight, sixteen and twenty-four.'
    },

    /* ---------------- scene 4: chip select ---------------- */
    {
      id: 'cs-1', start: 90, end: 97.5, scene: 'cs',
      caption: 'A chip-select pin is a logic condition on address bits: an AND gate whose inputs are bits or their complements.',
      detail: 'The pin goes active only when every input to the gate is one. A bit wired straight in demands a one; a bit wired through an inverter demands a zero. Bits not wired to the gate at all are free to be anything, and that freedom is exactly the size of the region the chip answers to.',
      keyword: 'an AND of bits and their complements',
      trap: 'Treating chip select as a simple address comparison. It is a conjunction, so each constrained bit cuts the region in half, and the order of the bits does not matter to the gate.',
      narration: 'A chip-select pin is a logic condition on address bits.'
    },
    {
      id: 'cs-2', start: 97.5, end: 105, scene: 'cs',
      caption: 'Fix k bits out of n and two to the n minus k addresses remain. That count is the size of the range.',
      detail: 'Every constrained bit halves the number of addresses that satisfy the condition. With sixteen address lines and five of them fixed, eleven are free, and two to the eleven is 2048. The range is a contiguous block only if the constrained bits are the high ones, which is the usual but not the required case.',
      keyword: 'two to the free bits',
      trap: 'Reporting the range size from the chip capacity. The chip may be smaller than the region it is selected for, and the region is what the address lines define.',
      narration: 'Fix k bits out of n and two to the n minus k addresses remain.'
    },
    {
      id: 'cs-3', start: 105, end: 112.5, scene: 'cs',
      caption: 'GATE 2019: A15, A14 and A11 must be one; A13 and A12 must be zero. That is C800 up to CFFF.',
      detail: 'Writing the five conditions into a sixteen-bit address gives 1100 1000 0000 0000 as the smallest member, which is C800 in hexadecimal. Setting every free bit to one gives 1100 1111 1111 1111, which is CFFF. The span is 2048 addresses.',
      keyword: 'C800 to CFFF',
      trap: 'Reading the free bits as a suffix and writing C800 to C8FF. The free bits are eleven in number, so the top of the range moves in the eleventh bit, not the eighth.',
      narration: 'GATE 2019: A15, A14 and A11 must be one; A13 and A12 must be zero. That is C800 up to CFFF.'
    },
    {
      id: 'cs-4', start: 112.5, end: 120, scene: 'cs',
      caption: 'The size of a chip-select region is set by the bits that were not decoded, not by the size of the chip behind it.',
      detail: 'This is why an interfacing question can ask for a range without telling you the chip at all. Conversely, if the question gives the chip capacity and the range is larger, the design is decoding too few bits and the same data appears at several addresses, which is called address aliasing.',
      keyword: 'size from the undecoded bits',
      trap: 'Aliasing is silent. A design that decodes too few bits works in simulation and breaks when a program relies on two addresses being distinct.',
      narration: 'The size of a chip-select region is set by the bits that were not decoded.'
    },

    /* ---------------- scene 5: decoder ---------------- */
    {
      id: 'de-1', start: 120, end: 127.5, scene: 'decoder',
      caption: 'The decoder a design needs is usually not the decoder in the parts bin, so it is built from smaller ones.',
      detail: 'A four-to-sixteen decoder has sixteen outputs and four inputs. If the parts bin holds only two-to-four decoders with an enable input, the big decoder is assembled as a tree, and the enable input is what makes the tree possible.',
      keyword: 'built from smaller ones',
      trap: 'Forgetting that the small decoder must have an enable input. Without one, the outputs of several decoders would fight and the tree cannot be built at all.',
      narration: 'The decoder a design needs is usually not the decoder in the parts bin.'
    },
    {
      id: 'de-2', start: 127.5, end: 135, scene: 'decoder',
      caption: 'One two-to-four decoder takes the top two bits and enables four more, each of which takes the bottom two bits.',
      detail: 'The first decoder produces four enable signals. Each of those enables exactly one of four second-level decoders, and each second-level decoder produces four of the sixteen final outputs. Four inputs in total, sixteen outputs in total, and the two bits are split between the levels.',
      keyword: 'one decoder enables four',
      trap: 'Wiring the four decoders in parallel without the enable stage. Four decoders fed the same two bits produce four identical sets of outputs, not sixteen distinct ones.',
      narration: 'One two-to-four decoder takes the top two bits and enables four more.'
    },
    {
      id: 'de-3', start: 135, end: 142.5, scene: 'decoder',
      caption: 'The count is the sum of the tree: one plus four is five two-to-four decoders.',
      detail: 'Each level of the tree contributes as many decoders as there are enable signals reaching it. A level-zero root, four level-one decoders, and sixteen outputs. The sum one plus four equals five, which is the GATE 2013 answer.',
      keyword: 'one plus four is five',
      trap: 'Answering four, the number of decoders that produce the final outputs, and forgetting the one that drives their enables. Answering six by counting the sixteen outputs as decoders.',
      narration: 'The count is the sum of the tree: one plus four is five.'
    },
    {
      id: 'de-4', start: 142.5, end: 150, scene: 'decoder',
      caption: 'Two traps live here: counting chips where the question counts rows, and forgetting that only the row count sets the decoder.',
      detail: 'The row decoder selects one row of the array, so its output count is the number of rows, which is the depth ratio. The width ratio never enters the decoder. In the 2013 array there are thirty-two chips but only sixteen rows, and sixteen is the number that matters.',
      keyword: 'rows, not chips',
      trap: 'Dividing the total chip count by the small decoder size. Thirty-two chips divided by four gives eight, which is wrong; sixteen rows divided by four gives four, which is right.',
      narration: 'Two traps live here: counting chips where the question counts rows, and forgetting that only the row count sets the decoder.'
    },

    /* ---------------- scene 6: interleave ---------------- */
    {
      id: 'in-1', start: 150, end: 157.5, scene: 'interleave',
      caption: 'Interleaving splits memory into m banks. Each bank is busy for a whole cycle after it accepts a request.',
      detail: 'A single bank can accept a new request only once its previous cycle has finished, so its throughput is one word per cycle time. Splitting the same memory into m independent banks gives m units that can each be busy at the same time, provided the requests go to different banks.',
      keyword: 'm independent banks',
      trap: 'Calling the banks faster. They are exactly as slow as before. What changes is that several of them are slow at the same time.',
      narration: 'Interleaving splits memory into m banks. Each bank is busy for a whole cycle after it accepts a request.'
    },
    {
      id: 'in-2', start: 157.5, end: 165, scene: 'interleave',
      caption: 'Low-order interleaving takes the bank from the low bits: bank equals address mod m, so consecutive words go to different banks.',
      detail: 'The bank number is the remainder of the address on division by m, which in binary is simply the low bits of the address. The rest of the address names the word inside that bank. Consecutive addresses then differ only in the bank field, which is precisely what a sequential scan needs.',
      keyword: 'bank equals address mod m',
      trap: 'Assuming low-order interleaving means the bank number is the first word of the bank. It is the low bits of every address, so a bank holds every m-th word, not a contiguous run.',
      narration: 'Low-order interleaving takes the bank from the low bits: bank equals address mod m.'
    },
    {
      id: 'in-3', start: 165, end: 172.5, scene: 'interleave',
      caption: 'High-order interleaving takes the bank from the high bits, so consecutive words stay inside one bank until it runs out.',
      detail: 'The top bits name the bank and the remaining bits name the word inside it. Consecutive addresses share the same bank for as long as the word field lasts, which is half the memory when there are two banks. This is also called block interleaving, because each bank holds one contiguous block of the address space.',
      keyword: 'bank from the high bits',
      trap: 'Believing high-order interleaving is simply worse. It suits programs whose working set is local, because a whole block sits in one bank and never contends with another. It is worse only for a sequential stream.',
      narration: 'High-order interleaving takes the bank from the high bits.'
    },
    {
      id: 'in-4', start: 172.5, end: 180, scene: 'interleave',
      caption: 'Only low-order interleaving turns a sequential stream into parallel work, and that is the entire point of the design.',
      detail: 'A cache block fetch, an array walk and an instruction stream are all sequential. Under low-order interleaving each consecutive word is in a different bank, so the requests queue up in different banks and their slow cycles overlap. Under high-order interleaving they all wait on one bank.',
      keyword: 'the whole point',
      trap: 'Interleaving does not help a program that keeps hitting one bank. Bank conflicts on a strided access pattern can make the interleaved system no faster than a single bank.',
      narration: 'Only low-order interleaving turns a sequential stream into parallel work.'
    },

    /* ---------------- scene 7: overlap ---------------- */
    {
      id: 'ov-1', start: 180, end: 187.5, scene: 'overlap',
      caption: 'With m banks the bus can start a new word every bus cycle, provided a bank is free when its turn comes.',
      detail: 'The bus is the shared resource, so the earliest a second request can start is one bus cycle after the first, even if the banks are idle. The bank cycle sets a second, slower rhythm that the bus must respect whenever it comes back to the same bank.',
      keyword: 'a new word every bus cycle',
      trap: 'Assuming the bus can issue faster than it physically can. The bus cycle is a floor on the interval, and no amount of banks removes it.',
      narration: 'With m banks the bus can start a new word every bus cycle, provided a bank is free.'
    },
    {
      id: 'ov-2', start: 187.5, end: 195, scene: 'overlap',
      caption: 'A bank is free again after its cycle time, and the bus comes back to it after m bus cycles. Compare the two.',
      detail: 'Under low-order interleaving with m banks, bank b is used by words b, b plus m, b plus 2m and so on. The gap between two uses of the same bank is therefore m bus cycles. The bank needs its full cycle time before it can accept the second of those requests.',
      keyword: 'm bus cycles against one cycle time',
      trap: 'Comparing the bank cycle with one bus cycle instead of m of them. That mistake always concludes the banks cannot keep up, which is false for enough banks.',
      narration: 'A bank is free again after its cycle time, and the bus comes back to it after m bus cycles.'
    },
    {
      id: 'ov-3', start: 195, end: 202.5, scene: 'overlap',
      caption: 'So the clean formula holds exactly when m times the bus cycle is at least the bank cycle. Otherwise the pipeline stalls.',
      detail: 'When the condition holds, the first word costs the full bank cycle and each further word costs one bus cycle, so n words cost the cycle time plus n minus one bus cycles. When it fails, the bus arrives at a bank that is still busy and waits, and the formula understates the time.',
      keyword: 'the condition m times bus at least cycle',
      trap: 'Using the formula because it is the one in the notes. State the condition first; several questions are written specifically to break it.',
      narration: 'So the clean formula holds exactly when m times the bus cycle is at least the bank cycle.'
    },
    {
      id: 'ov-4', start: 202.5, end: 210, scene: 'overlap',
      caption: 'Two banks, forty nanoseconds each, ten nanosecond bus: eight words take a hundred and seventy, not a hundred and ten.',
      detail: 'With two banks the bus returns to each bank after twenty nanoseconds, but the bank is busy for forty. Every word after the second waits. Simulating the schedule gives a hundred and seventy nanoseconds for eight words, while the formula claims a hundred and ten. The condition fails because twenty is less than forty.',
      keyword: 'a hundred and seventy, not a hundred and ten',
      trap: 'This is the counterexample that keeps the formula honest. If a solution is smaller than a schedule you can draw, the solution is wrong.',
      narration: 'Two banks, forty nanoseconds each, ten nanosecond bus: eight words take a hundred and seventy, not a hundred and ten.'
    },

    /* ---------------- scene 8: bandwidth ---------------- */
    {
      id: 'bw-1', start: 210, end: 217.5, scene: 'bandwidth',
      caption: 'Bandwidth is the word width divided by the steady interval between words, and the interval is the larger of the bus cycle and the cycle time over m.',
      detail: 'Once the pipeline is running, words emerge at a fixed rhythm. If the bus is the limit the rhythm is one bus cycle; if the banks are the limit it is the bank cycle divided by the number of banks. The larger of the two is the true interval, and bandwidth is one word over it.',
      keyword: 'the larger of the two',
      trap: 'Reporting the peak bandwidth as if it were sustained. Peak assumes back-to-back requests to different banks with no gaps, which a real program does not supply.',
      narration: 'Bandwidth is the word width divided by the steady interval between words.'
    },
    {
      id: 'bw-2', start: 217.5, end: 225, scene: 'bandwidth',
      caption: 'Interleaving multiplies bandwidth by m only until the bus saturates, and after that more banks buy nothing.',
      detail: 'The bandwidth curve rises with the number of banks while the banks are the bottleneck, then flattens at one word per bus cycle. The knee is exactly the point where m bus cycles equals the bank cycle. Beyond the knee the extra banks cost money and change nothing.',
      keyword: 'up to the knee, then flat',
      trap: 'A question asking for the number of banks needed for a given bandwidth has an answer at the knee, not beyond it. Adding banks past the knee is not a design improvement.',
      narration: 'Interleaving multiplies bandwidth by m only until the bus saturates.'
    },
    {
      id: 'bw-3', start: 225, end: 232.5, scene: 'bandwidth',
      caption: 'GATE 2014: eight modules busy for six hundred nanoseconds behind a hundred nanosecond bus. The bus is the limit, so ten thousand stores in a millisecond.',
      detail: 'Eight times one hundred is eight hundred, which is more than six hundred, so the overlap condition holds and no store ever waits for a module. The bus is occupied for one hundred nanoseconds per store, so a millisecond holds ten thousand bus slots and therefore ten thousand stores can be started.',
      keyword: 'ten thousand stores',
      trap: 'Dividing the millisecond by six hundred, the module cycle, gives 1666. The module cycle limits how many stores finish, not how many start, and the question asks for starts.',
      narration: 'Eight modules busy for six hundred nanoseconds behind a hundred nanosecond bus: ten thousand stores in a millisecond.'
    },
    {
      id: 'bw-4', start: 232.5, end: 240, scene: 'bandwidth',
      caption: 'With five modules instead of eight the answer would be eight thousand three hundred and thirty, because the bus would stall.',
      detail: 'Five modules give five hundred nanoseconds of cover, which is less than six hundred, so the bus must wait a hundred nanoseconds after every fifth store. Five stores then complete per six hundred nanoseconds, giving eight thousand three hundred and thirty in a millisecond. The same arithmetic with a different bank count gives a different answer, which is why the condition comes first.',
      keyword: 'eight thousand three hundred and thirty',
      trap: 'The number of stores initiated is not the number completed. Completions lag by the module cycle, and the two counts differ by a handful near the end of the window.',
      narration: 'With five modules instead of eight the answer would be eight thousand three hundred and thirty.'
    },

    /* ---------------- scene 9: 2006 ---------------- */
    {
      id: 'g6-1', start: 240, end: 247.5, scene: 'gate2006',
      caption: 'GATE 2006: twenty-four banks, each two bytes wide, so one parallel access delivers forty-eight bytes.',
      detail: 'The banks are accessed together, so one round of parallel bank access moves the number of banks times the width of one bank. With twenty-four banks of two bytes that is forty-eight bytes per round. Consecutive two-byte chunks are mapped to consecutive banks, which is low-order interleaving at two-byte granularity.',
      keyword: 'forty-eight bytes per round',
      trap: 'Multiplying by the block size instead of the bank width. The block size is what you want; the bank width is what one bank gives.',
      narration: 'GATE 2006: twenty-four banks, each two bytes wide, so one parallel access delivers forty-eight bytes.'
    },
    {
      id: 'g6-2', start: 247.5, end: 255, scene: 'gate2006',
      caption: 'A sixty-four byte cache block needs two rounds, and ninety-six bytes travel to deliver sixty-four.',
      detail: 'One round is forty-eight bytes, which is short of sixty-four, so a second round is unavoidable and it moves another forty-eight. Sixteen of those bytes are useful and thirty-two are wasted. This waste is a real cost of fetching a block through a bank array whose natural transfer is not a divisor of the block.',
      keyword: 'two rounds, ninety-six bytes moved',
      trap: 'Rounding sixty-four over forty-eight up to two is right, but then charging only the useful bytes to the time. The time is two full rounds.',
      narration: 'A sixty-four byte cache block needs two rounds, and ninety-six bytes travel to deliver sixty-four.'
    },
    {
      id: 'g6-3', start: 255, end: 262.5, scene: 'gate2006',
      caption: 'Each round costs the bank latency of eighty nanoseconds plus twelve for decoding the bank numbers, so ninety-two.',
      detail: 'The decoding is given as k over two nanoseconds, which is twelve for twenty-four banks, and the access is given as eighty. The question states that each round requires its own decoding, so the round costs ninety-two and two rounds cost a hundred and eighty-four.',
      keyword: 'ninety-two per round',
      trap: 'Decoding once for both rounds. The question says each iteration requires decoding, and the decoder is addressing different banks in the second round.',
      narration: 'Each round costs the bank latency of eighty nanoseconds plus twelve for decoding, so ninety-two.'
    },
    {
      id: 'g6-4', start: 262.5, end: 270, scene: 'gate2006',
      caption: 'The answer most keys give is a hundred and eighty-four nanoseconds. Some published solutions say a hundred and seventy-two, and the lesson says so.',
      detail: 'The disagreement is about whether the second round can be decoded while the first round is still fetching, which depends on whether the bank addresses are latched in a buffer. With latching, the decoding overlaps and the total is eighty plus two times eighty, which is a hundred and seventy-two. Without latching it is two times ninety-two. The official key takes a hundred and eighty-four.',
      keyword: 'a hundred and eighty-four, with a documented dissent',
      trap: 'Choosing a hundred and seventy-two because it is smaller. In an exam, match the model the question describes; the question says each iteration requires decoding.',
      narration: 'The answer most keys give is a hundred and eighty-four nanoseconds. Some published solutions say a hundred and seventy-two.'
    },

    /* ---------------- scene 10: recipe ---------------- */
    {
      id: 'rc-1', start: 270, end: 277.5, scene: 'recipe',
      caption: 'Step one: divide twice. Bits for the width, words for the depth. Never one division for both.',
      detail: 'Chips across is target bits over chip bits. Rows is target words over chip words. The chip count is their product, and the row count is the only number the decoder cares about.',
      keyword: 'divide twice',
      trap: 'A single division of capacities gives the right chip count and the wrong array shape, and every following part of the question uses the shape.',
      narration: 'Step one: divide twice. Bits for the width, words for the depth.'
    },
    {
      id: 'rc-2', start: 277.5, end: 285, scene: 'recipe',
      caption: 'Step two: address bits are log of the words, the chip takes log of its words, and the rest go to the decoder.',
      detail: 'Then check both sums: per-chip plus select equals total, and two to the select equals the rows. For a chip-select range, the free bits give the size and the fixed bits give the base.',
      keyword: 'the rest go to the decoder',
      trap: 'Reporting the range size as the chip capacity. The range comes from the free bits and the chip may be smaller or larger.',
      narration: 'Step two: address bits are log of the words, the chip takes log of its words, and the rest go to the decoder.'
    },
    {
      id: 'rc-3', start: 285, end: 292.5, scene: 'recipe',
      caption: 'Step three: for interleaving, write the bank schedule, then check m times the bus cycle against the bank cycle.',
      detail: 'The schedule is the truth and the formula is a shortcut that needs a licence. Draw the banks as rows and time along the columns, place each word in bank i mod m, and read off the finish time of the last word. If the check passes, the formula will agree.',
      keyword: 'check before you use the formula',
      trap: 'Memorising the formula without the condition. Questions with two or three banks exist precisely to punish that.',
      narration: 'Step three: for interleaving, write the bank schedule, then check the condition.'
    },
    {
      id: 'rc-4', start: 292.5, end: 300, scene: 'recipe',
      caption: 'Step four: convert units once, at the end, and keep the five traps in mind.',
      detail: 'The traps: bits against bytes, one division instead of two, chips instead of rows, the range size taken from the chip, and the overlap formula used without its condition. Each one has a wrong option waiting for it in some paper.',
      keyword: 'convert once, at the end',
      trap: 'Converting nanoseconds to milliseconds in the middle of a calculation and then again at the end, which shifts the answer by three orders of magnitude.',
      narration: 'Step four: convert units once, at the end, and keep the five traps in mind.'
    }
  ]
};
