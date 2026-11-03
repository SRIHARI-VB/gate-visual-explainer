/* ==========================================================================
   rom-pla-and-pal-programmable-logic — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs — never edited by hand.

   Every number quoted in a caption is computed by the model in lesson.js and
   printed on the canvas; the two agree because both read the same computation.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'planes',
      n: 1,
      title: 'Two planes, three devices',
      start: 0, end: 30,
      objective: 'Read every programmable device as an AND plane followed by an OR plane, and name which plane each of ROM, PLA and PAL lets you program.'
    },
    {
      id: 'rom',
      n: 2,
      title: 'A ROM is a stored truth table',
      start: 30, end: 60,
      objective: 'See the fixed decoder produce every minterm and the OR plane store one bit per output, so that no minimisation is needed.'
    },
    {
      id: 'romsize',
      n: 3,
      title: 'ROM arithmetic: m times two to the n',
      start: 60, end: 90,
      objective: 'Size any ROM from its input and output counts, and read the exponent as the reason the device doubles per input.'
    },
    {
      id: 'waste',
      n: 4,
      title: 'Why a ROM wastes, and what the PLA changes',
      start: 90, end: 120,
      objective: 'Show that ROM size ignores the function, then introduce the PLA, whose product-line count k is a design choice.'
    },
    {
      id: 'pla',
      n: 5,
      title: 'The PLA: three numbers, two planes',
      start: 120, end: 150,
      objective: 'Build the PLA crossbar from n, k and m, and derive the link count 2nk + km from the crossing lines.'
    },
    {
      id: 'program',
      n: 6,
      title: 'Programming: a dot is a literal',
      start: 150, end: 180,
      objective: 'Turn a minimised sum of products into the dot pattern of an AND plane and an OR plane, and count the programmed dots.'
    },
    {
      id: 'sharing',
      n: 7,
      title: 'Sharing: why the OR plane is programmable',
      start: 180, end: 210,
      objective: 'Count the product lines a pair of outputs needs on a PLA against the same pair on a PAL, where a term cannot be shared.'
    },
    {
      id: 'arithmetic',
      n: 8,
      title: 'The arithmetic of choosing a device',
      start: 210, end: 240,
      objective: 'Apply the three size formulas to one specification, and check two real devices against them.'
    },
    {
      id: 'limits',
      n: 9,
      title: 'Where the PLA stops, and the two escapes',
      start: 240, end: 270,
      objective: 'Show that parity needs 2 to the n minus 1 terms, then use don\'t cares and output inversion to fit a smaller device.'
    },
    {
      id: 'procedure',
      n: 10,
      title: 'Choose, count, program',
      start: 270, end: 300,
      objective: 'Run the four-step procedure over the whole topic, and separate the three erasable-memory variants from the array question.'
    }
  ],

  events: [

    /* ---------------- scene 1: two planes ---------------- */
    {
      id: 'pl-1', scene: 'planes', start: 0, end: 7.5,
      caption: 'Every two-level circuit is an AND plane followed by an OR plane: the products first, then their sum.',
      detail: 'A sum of products has exactly this shape. The AND plane builds the product terms, one per horizontal row. The OR plane adds the rows that belong to each output. Every device in this lesson is this picture with some of the links left for you to choose.',
      narration: 'Start with one picture that covers the whole topic. Any sum of products is an AND plane and then an OR plane. The AND plane builds the product terms, one per row. The OR plane adds up the rows that belong to each output.',
      keyword: 'AND then OR',
      trap: 'Two-level does not mean two gates. It means the expression has depth two: a layer of ANDs and one OR after them.'
    },
    {
      id: 'pl-2', scene: 'planes', start: 7.5, end: 15,
      caption: 'The three devices answer one question differently: which of the two planes may you program?',
      detail: 'Programmable means the connection at a crossing is yours to make or leave out. A fixed plane is wired at manufacture. ROM, PLA and PAL are the three possible answers to which plane is yours, and nothing else about them differs in structure.',
      narration: 'The three devices are not three subjects. They are three answers to one question: which of these two planes can you program, and which one was wired before the chip reached you.',
      keyword: 'which plane is yours',
      trap: 'A device with a fixed plane is not unprogrammable. It still has one programmable plane; the fixed one is simply not your decision.'
    },
    {
      id: 'pl-3', scene: 'planes', start: 15, end: 22.5,
      caption: 'ROM: fixed decoder, programmable OR. PLA: both programmable. PAL: programmable AND, fixed OR.',
      detail: 'In a ROM the AND plane is a complete decoder, so it generates all 2 to the n minterms. In a PLA both planes are programmable. In a PAL the AND plane is programmable but each output OR gate is permanently wired to its own private group of product lines, typically seven or eight of them.',
      narration: 'A ROM fixes the AND plane as a full decoder and lets you fill the OR plane. A PLA lets you program both. A PAL programs the AND plane and fixes the OR plane, each output getting its own private group of terms.',
      keyword: 'ROM, PLA, PAL',
      trap: 'PAL is not a small PLA. The fixed OR plane is the defining feature, and it is what forbids sharing a product term between outputs.'
    },
    {
      id: 'pl-4', scene: 'planes', start: 22.5, end: 30,
      caption: 'That one sentence produces every size formula: m times 2 to the n bits for a ROM, 2nk plus km links for a PLA.',
      detail: 'A ROM stores one bit per output per address, and there are 2 to the n addresses, so its size is m times 2 to the n bits. A PLA has 2n vertical input lines crossing k product rows, and those k rows crossing m output columns, so it has 2nk plus km programmable links.',
      narration: 'Everything numeric in this lesson comes from that sentence. A ROM is m times two to the n bits. A PLA is two n k links in the AND plane plus k m in the OR plane. Hold those two formulas and the rest is arithmetic.',
      keyword: 'm·2^n and 2nk + km',
      trap: 'The ROM exponent is the input count, not the output count. Swapping n and m is the most common slip in a ROM size question.'
    },

    /* ---------------- scene 2: the ROM ---------------- */
    {
      id: 'rm-1', scene: 'rom', start: 30, end: 37.5,
      caption: 'A four-input ROM has a sixteen-line decoder: one line per minterm, all sixteen generated whether you want them or not.',
      detail: 'The decoder asserts exactly one of its sixteen outputs for each of the sixteen input words. That is why the ROM needs no minimisation: every minterm already exists as a wire, and storing the function is only a matter of which wires reach the output column.',
      narration: 'Here is a four-input ROM. The decoder has sixteen output lines, one per minterm, and it raises exactly one of them for each input word. Every minterm exists as a wire before you say what the function is.',
      keyword: 'sixteen lines, one high',
      trap: 'A decoder is not a demultiplexer in this context. It is a minterm generator: its job is to name one address, not to route data.'
    },
    {
      id: 'rm-2', scene: 'rom', start: 37.5, end: 45,
      caption: 'For f = sum of m(0,2,5,7,8,10,13,15) the stored column holds eight ones and eight zeros: that is the whole function.',
      detail: 'The stored array is one bit per address. Address 0 stores 1, address 1 stores 0, address 2 stores 1, and so on. The eight minterms listed in the sum are exactly the addresses whose stored bit is 1.',
      narration: 'Program it. The function is one at addresses zero, two, five, seven, eight, ten, thirteen and fifteen. The stored column then reads one, zero, one, zero and so on: eight ones out of sixteen. That column is the function.',
      keyword: 'eight ones, eight zeros',
      trap: 'The stored bit is not the minterm number. It is the value of the function at that minterm, which is 1 only for the minterms in the sum.'
    },
    {
      id: 'rm-3', scene: 'rom', start: 45, end: 52.5,
      caption: 'Read the address as the input word: address 5 is A B-prime C D, and the bit stored there is the value of f on that input.',
      detail: 'Address 5 written in four bits is 0101, which reads A equals 0, B equals 1, C equals 0, D equals 1. So the address is the input assignment itself, and the stored bit is the answer for that assignment.',
      narration: 'The address is not a label, it is the input word. Five is zero one zero one, so A is zero, B is one, C is zero and D is one. The bit stored at address five is the answer for that assignment.',
      keyword: 'the address is the input',
      trap: 'The most significant bit is the first variable only if you say so. A question that numbers minterms differently is asking about a different column.'
    },
    {
      id: 'rm-4', scene: 'rom', start: 52.5, end: 60,
      caption: 'So a ROM needs no minimisation and has no product terms to count: its size is fixed before you know the function.',
      detail: 'A function needing two product terms and one needing sixteen both occupy sixteen rows, because the decoder is the same sixteen lines either way. That is the ROM trade: any function of the inputs, at a size that ignores which function it is.',
      narration: 'Which gives the ROM its character. It needs no minimisation, it has no product terms to count, and its size is decided before anyone knows which function it will hold. Any function of four variables fits in the same sixteen bits.',
      keyword: 'size ignores the function',
      trap: 'Minimising before storing a function in a ROM saves nothing at all. Every address has a stored bit whether that bit is one or zero.'
    },

    /* ---------------- scene 3: ROM arithmetic ---------------- */
    {
      id: 'rs-1', scene: 'romsize', start: 60, end: 67.5,
      caption: 'Size is m times 2 to the n bits: four inputs and one output is 16 words of one bit, which is 16 bits.',
      detail: 'The formula multiplies the number of addresses, 2 to the n, by the number of bits stored at each address, m. Four inputs give sixteen addresses; one output gives one bit per address; sixteen times one is sixteen bits.',
      narration: 'Now the arithmetic. Size is m times two to the n bits. Four inputs and one output: sixteen addresses, one bit each, sixteen bits in all. That is two bytes.',
      keyword: '16 bits',
      trap: 'Bits, not words. A sixteen-word ROM of one-bit words is sixteen bits; sixteen words of eight-bit words would be 128 bits.'
    },
    {
      id: 'rs-2', scene: 'romsize', start: 67.5, end: 75,
      caption: 'Eight inputs and four outputs is 256 words of four bits: 1024 bits, which is 128 bytes.',
      detail: 'Two to the eighth is 256 addresses, and four outputs need four bits at each address. 256 times 4 is 1024 bits, and dividing by eight gives 128 bytes.',
      narration: 'Eight inputs and four outputs. Two to the eight is two hundred fifty-six addresses, four bits at each, so one thousand and twenty-four bits, or a hundred and twenty-eight bytes.',
      keyword: '1024 bits',
      trap: 'Four outputs do not give four ROMs. They give four bits per address in one device, which is why the multiplication is by m and not by a power.'
    },
    {
      id: 'rs-3', scene: 'romsize', start: 75, end: 82.5,
      caption: 'Twelve inputs and eight outputs is 4096 words of eight bits: 32,768 bits, or 4096 bytes.',
      detail: 'Two to the twelfth is 4096 addresses, and eight outputs need eight bits at each address, so 32,768 bits. Eight bits is one byte per address, so the byte count equals the address count, 4096 bytes.',
      narration: 'Twelve inputs and eight outputs. Four thousand and ninety-six addresses, eight bits each: thirty-two thousand seven hundred and sixty-eight bits, which is four thousand and ninety-six bytes, because a byte is one address here.',
      keyword: '32,768 bits',
      trap: 'A 4K by 8 ROM is 4096 bytes, not 4096 bits. Read the word size before dividing by eight.'
    },
    {
      id: 'rs-4', scene: 'romsize', start: 82.5, end: 90,
      caption: 'The input count sits in the exponent, so one more input doubles the device and four more multiply it by sixteen.',
      detail: 'Each extra input doubles the number of addresses, and the number of addresses is the row count. The output count, by contrast, multiplies the size linearly. That asymmetry is why a wide ROM is cheap and a deep one is not.',
      narration: 'Notice where the input count sits: in the exponent. One more input doubles the device. Four more multiply it by sixteen. The output count is a plain multiplier, so width is cheap and depth is not.',
      keyword: 'the exponent doubles it',
      trap: 'Doubling the outputs doubles the bits; doubling the inputs squares the words. Those are very different growth rates.'
    },

    /* ---------------- scene 4: the waste ---------------- */
    {
      id: 'wa-1', scene: 'waste', start: 90, end: 97.5,
      caption: 'f needs two product terms, yet its ROM still has sixteen rows: the device is sized by the inputs, not by the answer.',
      detail: 'The minimised function is B-prime D-prime plus B D, two terms and four literals. The ROM does not know that. It still generates all sixteen minterms and stores sixteen bits, eight of which are ones.',
      narration: 'Now the waste. This function minimises to two product terms, four literals. The ROM does not care. It still has sixteen rows and sixteen stored bits, because its size was fixed by the four inputs.',
      keyword: 'sixteen rows for two terms',
      trap: 'A small minimised expression does not mean a small ROM. The ROM pays for the input space, not for the expression.'
    },
    {
      id: 'wa-2', scene: 'waste', start: 97.5, end: 105,
      caption: 'A function needing sixteen terms occupies exactly the same sixteen bits, and minimising before storing saves nothing.',
      detail: 'Both functions are four-variable, one-output functions, so both are sixteen bits. The stored contents differ and nothing else does. This is the sense in which a ROM is a lookup table rather than a gate network.',
      narration: 'A function needing sixteen terms occupies exactly the same sixteen bits. Same device, different contents. That is what it means to call a ROM a lookup table: you are not saving gates, you are writing an answer.',
      keyword: 'same size, different contents',
      trap: 'So a question that asks how much ROM a minimised function needs is not asking you to minimise. Minimisation is irrelevant to ROM size.'
    },
    {
      id: 'wa-3', scene: 'waste', start: 105, end: 112.5,
      caption: 'What the ROM buys is freedom: all 65,536 functions of four variables fit the same 16-bit device.',
      detail: 'A four-variable function is defined by sixteen independent output values, so there are 2 to the 16, which is 65,536 functions. The ROM can store any one of them without a change of wiring, because every minterm is already available.',
      narration: 'What you buy for that waste is freedom. A four-variable function is sixteen independent answers, so there are sixty-five thousand five hundred and thirty-six of them, and this one device stores any of them unchanged.',
      keyword: '65,536 functions',
      trap: 'The count of functions is two to the two-to-the-n, not two to the n. Sixteen answers, each free, is two to the sixteen.'
    },
    {
      id: 'wa-4', scene: 'waste', start: 112.5, end: 120,
      caption: 'The PLA keeps both planes and makes the product-line count k a design choice, far below 2 to the n.',
      detail: 'A PLA replaces the fixed decoder by a group of AND gates, k of them, each programmable to form any product term of the inputs. Because k is chosen to suit the function rather than handed to you by the input count, the size becomes linear in the numbers you actually need.',
      narration: 'So the PLA changes one thing. It replaces the fixed decoder with k programmable AND gates, and k is a number the designer chooses. Now the device is sized by the function, not by the input space.',
      keyword: 'k is a choice',
      trap: 'k is not the number of minterms. It is the number of distinct product terms the whole set of outputs needs, counted once across all of them.'
    },

    /* ---------------- scene 5: the PLA ---------------- */
    {
      id: 'pa-1', scene: 'pla', start: 120, end: 127.5,
      caption: 'A PLA is described by three numbers: n inputs, k product terms and m outputs.',
      detail: 'Written n by k by m, or n times k times m. A 3 by 4 by 2 PLA has three inputs, four product terms and two outputs. Every device question in this topic begins by reading those three numbers off the specification.',
      narration: 'A PLA is three numbers: n inputs, k product terms, m outputs. Written n by k by m. Three by four by two means three inputs, four product rows and two outputs.',
      keyword: 'n, k, m',
      trap: 'The middle number is product terms, not outputs. A 3 by 4 by 2 device has four rows, and each row is one AND gate.'
    },
    {
      id: 'pa-2', scene: 'pla', start: 127.5, end: 135,
      caption: 'Each input enters both true and complemented, so 2n vertical lines cross k product rows: that is the AND plane.',
      detail: 'Every input buffer produces the variable and its complement, which is why there are twice as many vertical lines as inputs. A dot where a vertical line crosses a product row puts that literal into that term.',
      narration: 'Each input arrives twice, true and complemented, so four inputs give eight vertical lines. Those lines cross k horizontal product rows, and that grid is the AND plane. A dot at a crossing puts that literal into that term.',
      keyword: '2n vertical lines',
      trap: 'The complement lines are not extra inputs. They are the same variables, so a term can contain A or A-prime but never both.'
    },
    {
      id: 'pa-3', scene: 'pla', start: 135, end: 142.5,
      caption: 'The k product rows then cross m output columns: that is the OR plane, and it is programmable too.',
      detail: 'In the OR plane a dot where product row p crosses output column j means p is one of the terms summed into output j. Because this plane is programmable, one row may feed several outputs, which is the property a PAL does not have.',
      narration: 'The product rows then run into the OR plane, where they cross m output columns. A dot there means that term is summed into that output. And because this plane is programmable, one row can feed several outputs at once.',
      keyword: 'rows into columns',
      trap: 'A missing dot in the OR plane is not a zero output. An output with no dots at all is a constant zero, and an output dotted to every row is the sum of everything.'
    },
    {
      id: 'pa-4', scene: 'pla', start: 142.5, end: 150,
      caption: 'So the device has 2nk plus km programmable links: for n=4, k=2, m=1 that is 16 plus 2, which is 18.',
      detail: 'The AND plane contributes 2n crossings on each of k rows, so 2nk links. The OR plane contributes m crossings on each of k rows, so km links. Adding them gives 2nk plus km, which is linear in every one of n, k and m.',
      narration: 'Count the crossings and you have the device. Two n k links in the AND plane, k m in the OR plane, eighteen in all for four inputs, two rows and one output. Linear in each number, with nothing exponential anywhere.',
      keyword: '18 links',
      trap: 'The link count is the number of possible crossings, not the number you program. A programmed PLA uses only some of them.'
    },

    /* ---------------- scene 6: programming ---------------- */
    {
      id: 'pr-1', scene: 'program', start: 150, end: 157.5,
      caption: 'Minimise first: f = B-prime D-prime plus B D, two terms and four literals, not the sixteen minterms.',
      detail: 'The PLA forms only the product terms you name, so minimisation is now worth doing. B-prime D-prime covers minterms 0, 2, 8 and 10; B D covers 5, 7, 13 and 15. Together they are exactly the eight minterms of the function and nothing else.',
      narration: 'With a PLA you minimise first, because the AND plane forms only what you name. This function is B-prime D-prime plus B D: two terms, four literals, eight minterms covered, and nothing else.',
      keyword: 'two terms, not sixteen',
      trap: 'A non-minimal expression still works if k is large enough. It is not wrong, it is just larger, and a question about k cares about the minimum.'
    },
    {
      id: 'pr-2', scene: 'program', start: 157.5, end: 165,
      caption: 'Row one dots the B-prime and D-prime lines; row two dots B and D. A crossing without a dot is an absent variable.',
      detail: 'Dots are placed only at the literals the term contains. Row one has two dots, on B-prime and on D-prime. Row two has two dots, on B and on D. The variables A and C have no dots in either row, which is exactly what it means for them to be absent from both terms.',
      narration: 'Now program it. Row one puts dots on B-prime and D-prime. Row two puts dots on B and D. Every other crossing stays bare, and a bare crossing simply means that variable is not in the term.',
      keyword: 'a dot is a literal',
      trap: 'Dots on both A and A-prime in one row would make the term always zero. A correct programming never dots a variable against its own complement.'
    },
    {
      id: 'pr-3', scene: 'program', start: 165, end: 172.5,
      caption: 'In the OR plane both rows dot the single output column, because f is the sum of the two products.',
      detail: 'The output column is one vertical line at the right. Two dots on it, one on each product row, say that f is the sum of both terms. A single row dotted to two output columns would say the same term belongs to two functions.',
      narration: 'In the OR plane, both rows dot the one output column, because the function is the sum of both terms. Two dots here, and the expression is complete.',
      keyword: 'sum is a second dot',
      trap: 'An OR is a dot in a column, not a second row. Adding a row adds a product term; adding a dot adds that term to an output.'
    },
    {
      id: 'pr-4', scene: 'program', start: 172.5, end: 180,
      caption: 'Six dots are programmed out of eighteen possible, and reading the dots reads the expression.',
      detail: 'Four dots in the AND plane, two in the OR plane, six in all against eighteen possible crossings. The device is the same size whatever you program into it; only the dot pattern changes, which is why the picture is worth reading rather than memorising.',
      narration: 'Four dots in the AND plane, two in the OR plane, six out of eighteen possible. And the picture is the formula: read the dots on a row and you have a product term, read the dots in a column and you have the sum.',
      keyword: '6 of 18 dots',
      trap: 'The blank crossings are not wasted logic. They are the reason a PLA can be reused for a different function without changing the chip.'
    },

    /* ---------------- scene 7: sharing ---------------- */
    {
      id: 'sh-1', scene: 'sharing', start: 180, end: 187.5,
      caption: 'Two outputs: F1 = C + A-prime B and F2 = C-prime + A-prime B. Three distinct product terms serve both.',
      detail: 'F1 covers minterms 1, 2, 3, 5 and 7. F2 covers 0, 2, 3, 4 and 6. Minimised, F1 is C plus A-prime B and F2 is C-prime plus A-prime B, so the term A-prime B is needed by both and the pair needs only three distinct rows.',
      narration: 'Two outputs. F1 is C plus A-prime B. F2 is C-prime plus A-prime B. Count the distinct terms across both, not per output: C, C-prime and A-prime B, which is three rows for the pair.',
      keyword: 'three rows, two outputs',
      trap: 'Counting each output separately gives four and overstates the device. The count is across the whole PLA, term by term, once.'
    },
    {
      id: 'sh-2', scene: 'sharing', start: 187.5, end: 195,
      caption: 'The PLA forms A-prime B once and dots it into both output columns, so it needs three product lines, not four.',
      detail: 'One row, two dots in the OR plane: that is a shared term. The device is a 3 by 3 by 2 PLA, with 2 times 3 times 3 equals 18 AND-plane links and 3 times 2 equals 6 OR-plane links, 24 in all.',
      narration: 'The PLA builds A-prime B once, on one row, and dots it into both output columns. Three product lines instead of four. Eighteen AND-plane links plus six in the OR plane, twenty-four in all.',
      keyword: 'one row, two dots',
      trap: 'A shared term must be identical in both functions. A-prime B and A B are different terms and cannot be shared even if they look similar.'
    },
    {
      id: 'sh-3', scene: 'sharing', start: 195, end: 202.5,
      caption: 'A PAL has a fixed OR plane, so a term belongs to one output: A-prime B must be built twice, giving four lines.',
      detail: 'In a PAL each output OR gate is permanently wired to its own group of product lines, typically seven or eight. A term needed by two outputs therefore occupies one line in each group, so the pair needs two plus two, four lines.',
      narration: 'The same pair on a PAL. The OR plane is fixed, each output owns its own group of rows, so A-prime B has to be built twice, once in each group. Four product lines where the PLA needed three.',
      keyword: 'four lines on a PAL',
      trap: 'This is not a bug in the PAL. Fixed OR wiring is what makes it faster and cheaper, and losing sharing is the price.'
    },
    {
      id: 'sh-4', scene: 'sharing', start: 202.5, end: 210,
      caption: 'The whole difference in one number: 3 product lines on a PLA against 4 on a PAL for the same pair.',
      detail: 'The PLA pays for a second programmable plane and gets sharing in return. The PAL pays one programmable plane and duplicates shared terms. A design that fits a PLA in k terms may need more than k on a PAL, which is why a fitting report can disagree with a hand count.',
      narration: 'So the difference is one number: three lines against four. That is what the programmable OR plane buys. It is also why a design that fits a PLA in k terms may not fit the same PAL.',
      keyword: '3 against 4',
      trap: 'Do not assume a PAL needs exactly twice the terms. It needs the sum of the per-output counts, which is four here and can be much worse elsewhere.'
    },

    /* ---------------- scene 8: the arithmetic ---------------- */
    {
      id: 'ar-1', scene: 'arithmetic', start: 210, end: 217.5,
      caption: 'Three formulas cover the questions: m times 2 to the n bits for a ROM, 2nk plus km links for a PLA, 2n times the terms for a PAL.',
      detail: 'A ROM is sized by its input and output counts. A PLA is sized by its input count, its product-term count and its output count. A PAL has a programmable AND plane only, so its fuse count is 2n times the total number of product lines it uses, with no OR-plane fuses at all.',
      narration: 'Three formulas and the whole topic is arithmetic. ROM: m times two to the n bits. PLA: two n k plus k m links. PAL: two n times its product lines, and no OR-plane fuses because that plane is fixed.',
      keyword: 'three formulas',
      trap: 'A PAL fuse count that includes an OR plane is wrong by construction. The fixed plane has no fuses to count.'
    },
    {
      id: 'ar-2', scene: 'arithmetic', start: 217.5, end: 225,
      caption: 'Eight inputs, four outputs, six product terms: 1024 ROM bits against 96 plus 24, which is 120 PLA links.',
      detail: 'Two to the eighth is 256 addresses, times four bits, is 1024 bits for the ROM. For the PLA, 2 times 8 times 6 is 96 AND-plane links and 6 times 4 is 24 OR-plane links, 120 in all. Same specification, two very different devices.',
      narration: 'One specification, both devices. Eight inputs, four outputs, six product terms. The ROM is one thousand and twenty-four bits. The PLA is ninety-six plus twenty-four, a hundred and twenty links.',
      keyword: '1024 bits against 120 links',
      trap: 'Bits and links are different units. Comparing them directly is meaningless; comparing the growth rate, or the cost per unit, is not.'
    },
    {
      id: 'ar-3', scene: 'arithmetic', start: 225, end: 232.5,
      caption: 'A real 16 by 48 by 8 PLA has 1536 AND-plane links and 384 OR-plane links: 1920 in all.',
      detail: 'The Signetics 82S100 had 16 inputs, 48 product terms and 8 outputs, which gives 2 times 16 times 48 equals 1536 fuses in the AND array and 48 times 8 equals 384 in the OR array. The same function space on a ROM would be 524,288 bits.',
      narration: 'A real device, the 82S100: sixteen inputs, forty-eight product terms, eight outputs. Fifteen hundred and thirty-six links in the AND plane, three hundred and eighty-four in the OR plane, nineteen hundred and twenty in all. The same function space on a ROM is half a million bits.',
      keyword: '1920 links',
      trap: 'The 1920 is a count of possible crossings. Programming the device leaves most of them unconnected; that does not change its size.'
    },
    {
      id: 'ar-4', scene: 'arithmetic', start: 232.5, end: 240,
      caption: 'The PAL16L8 has 64 rows crossing 32 columns, 2048 fuses in the AND array, and seven terms per output.',
      detail: 'Sixteen inputs give 32 columns, true and complement. Sixty-four rows give 64 times 32 equals 2048 fuses. Eight outputs each have a private group of eight rows, seven of which feed the fixed OR gate and the eighth enabling the output buffer.',
      narration: 'And a real PAL, the 16L8. Sixteen inputs, so thirty-two columns. Sixty-four rows, so two thousand and forty-eight fuses in the AND array. Eight outputs, seven product terms each, and no OR-plane fuses at all.',
      keyword: '2048 fuses',
      trap: 'Seven terms per output is a hard ceiling, so a function needing eight terms on one output cannot be done on a single 16L8 output.'
    },

    /* ---------------- scene 9: limits ---------------- */
    {
      id: 'li-1', scene: 'limits', start: 240, end: 247.5,
      caption: 'Parity of four variables is the worst case: 2 to the n minus 1, so eight product terms, and no seven-term cover exists.',
      detail: 'Parity is 1 when an odd number of inputs are 1, and no two of its minterms are adjacent, so no two can be merged. The minimal sum of products therefore has one term per minterm, eight of them for four variables. An exhaustive search over every smaller cover confirms that seven will not do.',
      narration: 'Parity is the worst case for two-level logic. No two of its minterms are adjacent, so nothing merges, and four variables need eight terms. The page searched every cover of seven and found none.',
      keyword: '8 terms, 2^(n-1)',
      trap: 'Parity is not "hard to minimise because it is complicated". It is hard because its ones are pairwise non-adjacent, which is a structural fact.'
    },
    {
      id: 'li-2', scene: 'limits', start: 247.5, end: 255,
      caption: 'A device with k equal to three cannot hold it, however cleverly you program it: k is a hard limit on the rows.',
      detail: 'The number of product rows is a physical property of the chip. No programming can create a ninth row, so a function whose minimum is eight terms needs a device with at least eight. On a four-input, one-output PLA that is 2 times 4 times 8 plus 8 times 1, which is 72 links.',
      narration: 'So a device with three rows cannot hold parity, however you program it. k is physical. Eight terms need eight rows, and on this device that is sixty-four links in the AND plane plus eight in the OR plane.',
      keyword: 'k is a hard limit',
      trap: 'A non-minimal expression never rescues a device that is too small. More terms is exactly what the device cannot accept.'
    },
    {
      id: 'li-3', scene: 'limits', start: 255, end: 262.5,
      caption: 'Don\'t cares lower k: minterms 0,1,2,3,8,9 need two terms, but with 10 and 11 as don\'t cares one term covers all six.',
      detail: 'Without don\'t cares the minimum is B-prime C-prime plus A-prime B-prime, two terms. Treating minterms 10 and 11 as don\'t cares lets the single term B-prime cover all six required ones, so the same function fits a one-row device.',
      narration: 'Don\'t cares are the first escape. Six required minterms normally need two terms. Add two don\'t cares and the single term B-prime covers all six, so a one-row device will do.',
      keyword: '2 terms become 1',
      trap: 'A don\'t care is a promise that the input never occurs. If it can occur, treating it as a don\'t care is a wrong answer, not a smaller one.'
    },
    {
      id: 'li-4', scene: 'limits', start: 262.5, end: 270,
      caption: 'Output inversion is the second escape: a function needing four terms becomes one term plus an inverter.',
      detail: 'The function that is 1 everywhere except at minterm 5 needs four terms, A plus B-prime plus C plus D-prime. Its complement is the single minterm A-prime B C-prime D. Program that one term and invert the output, and the device needs one row plus a one-bit inverter.',
      narration: 'The second escape is to program the complement. A function that is zero at just one minterm needs four terms directly, but its complement is that one minterm. One row, plus an inverter at the output.',
      keyword: '4 terms become 1',
      trap: 'Inversion needs a programmable output inverter. A PLA without one cannot take this route, and the answer stays four terms.'
    },

    /* ---------------- scene 10: procedure ---------------- */
    {
      id: 'pc-1', scene: 'procedure', start: 270, end: 277.5,
      caption: 'Four steps: fix n, k and m; minimise; count links or bits; check that the count fits the device.',
      detail: 'Read the three numbers from the specification. Minimise the functions jointly, counting each distinct product term once. Apply the formula for the device asked about. Compare the count with the device size, and say which one fails if it does not fit.',
      narration: 'One procedure covers every question. Fix n, k and m from the specification. Minimise across all outputs, counting each term once. Apply the formula. Then check the count against the device and say what fails if it does not fit.',
      keyword: 'fix, minimise, count, check',
      trap: 'Step two is where most marks go: minimising each output separately overstates k and gives a device that looks too small.'
    },
    {
      id: 'pc-2', scene: 'procedure', start: 277.5, end: 285,
      caption: 'PROM is programmed once, EPROM is erased with ultraviolet light, EEPROM and flash electrically: the AND plane is fixed in all of them.',
      detail: 'The three names describe how the stored array is written and erased, not how the logic is arranged. A PROM has fuses burnt once. An EPROM uses a floating gate cleared by ultraviolet light through a quartz window. An EEPROM, and its descendant flash, clears the gate electrically.',
      narration: 'One distinction that is asked as a fact, not as arithmetic. PROM, EPROM and EEPROM differ only in how the array is written and erased: fuses once, ultraviolet light, or electrically. All three keep the fixed decoder.',
      keyword: 'same array, three erasures',
      trap: 'EPROM is not a PLA with erasable fuses. Its AND plane is still a full decoder, so its size still follows m times two to the n.'
    },
    {
      id: 'pc-3', scene: 'procedure', start: 285, end: 292.5,
      caption: 'Every number here was computed and checked: 16 bits, 18 links, 24 links against 4 PAL lines, 8 parity terms, 1920 links.',
      detail: 'The page runs its own model on load: it minimises each function, evaluates it on every input, searches for a smaller cover, and recounts every device size. The count of passing checks is printed under the canvas, so a reader can see that the numbers were computed rather than copied.',
      narration: 'Every number on this page was computed here and checked against a definition: sixteen bits, eighteen links, twenty-four against four, eight parity terms, nineteen hundred and twenty. The check count is printed under the canvas.',
      keyword: 'computed, then checked',
      trap: 'A diagram is not a proof. The dots show the formula; the exhaustive evaluation is what shows the formula is the function.'
    },
    {
      id: 'pc-4', scene: 'procedure', start: 292.5, end: 300,
      caption: 'One sentence to carry: the ROM stores the answer, the PLA stores the terms, and the PAL stores the terms without sharing them.',
      detail: 'That sentence decides every question in the topic. A ROM question asks for bits and gives inputs and outputs. A PLA question asks for links or for the function a dot pattern implements, and gives three numbers. A PAL question asks about terms per output and about sharing.',
      narration: 'One sentence to carry into the exam. The ROM stores the answer, the PLA stores the terms, and the PAL stores the terms without sharing them. Each one tells you which formula the question wants.',
      keyword: 'answer, terms, unshared terms',
      trap: 'Reading the dot pattern is the same skill in all three devices. Only the size formula changes with the device.'
    }
  ]
};
