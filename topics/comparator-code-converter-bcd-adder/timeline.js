/* ==========================================================================
   comparator-code-converter-bcd-adder — THE timeline.
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
      id: 'spec',
      n: 1,
      title: 'A specification too big to tabulate',
      start: 0, end: 30,
      objective: 'See why three design problems cannot be solved by writing the truth table, and name the small state each one passes forward instead.'
    },
    {
      id: 'onebit',
      n: 2,
      title: 'The one-bit comparator: three outputs, one 1',
      start: 30, end: 60,
      objective: 'Read the four-row table and see that greater, equal and less are mutually exclusive and together exhaustive.'
    },
    {
      id: 'ripple',
      n: 3,
      title: 'The triple is the carry',
      start: 60, end: 90,
      objective: 'Walk 1011 against 1001 from the most significant bit down, and see the higher bits decide while the lower bits stay unconsulted.'
    },
    {
      id: 'count',
      n: 4,
      title: 'Counting the outcomes, and stacking comparators',
      start: 90, end: 120,
      objective: 'Derive 2 to the n and the half-and-half split, then cascade two four-bit comparators with a correct tie input.'
    },
    {
      id: 'codes',
      n: 5,
      title: 'A code is a spelling',
      start: 120, end: 150,
      objective: 'Read BCD, excess-3 and Gray as three spellings of one digit, and see what self-complementing means.'
    },
    {
      id: 'gray',
      n: 6,
      title: 'Binary to Gray: one exclusive-or per bit',
      start: 150, end: 180,
      objective: 'Convert 1011 to Gray by hand, and see the one-bit-change property hold down the whole list and across the wrap.'
    },
    {
      id: 'kmap',
      n: 7,
      title: 'Why the map works',
      start: 180, end: 210,
      objective: 'Recognise the Karnaugh map axis order as a Gray code, and connect one-bit-difference to touching cells.'
    },
    {
      id: 'bcd',
      n: 8,
      title: 'The adder that stops being decimal at ten',
      start: 210, end: 240,
      objective: 'See the 0 to 19 range, mark the band that is not a digit, and apply the add-six repair to 7 + 5.'
    },
    {
      id: 'why6',
      n: 9,
      title: 'Why six, and why that condition',
      start: 240, end: 270,
      objective: 'Justify six as sixteen minus ten, and read the correction expression as an exact cover of the six invalid words.'
    },
    {
      id: 'proc',
      n: 10,
      title: 'One procedure, five traps',
      start: 270, end: 300,
      objective: 'Run a four-line procedure on any question in this family and name the five traps by sight.'
    }
  ],

  events: [

    /* ---------------- scene 1: spec ---------------- */
    {
      id: 'sp-1', scene: 'spec', start: 0, end: 8,
      caption: 'Three design problems: compare two words, re-spell a word, and add two decimal digits with a four-bit adder.',
      detail: 'All three sit inside the GATE 2027 clause "Design of combinational and sequential circuits". None of them is an adder, a multiplexer or a decoder, which is why they are easy to leave out of a revision plan.',
      narration: 'Three problems that look unrelated. Compare two binary words. Write the same number in a different code. Add two decimal digits using a four-bit adder. They share one shape, and that shape is the whole lesson.',
      keyword: 'three problems, one shape',
      trap: 'Treating these as three separate facts to memorise. They are one method applied three times, and the method is what the exam tests.'
    },
    {
      id: 'sp-2', scene: 'spec', start: 8, end: 16,
      caption: 'The naive method is a truth table, and it explodes: two bits need 16 rows, eight bits need 65536.',
      detail: 'With n input bits there are 2 to the n input words, so a specification that maps an input word to an output word has 2 to the n rows. For a comparator that is 4 to the n, because both words are inputs.',
      narration: 'The obvious way to design any combinational circuit is to write its truth table. Two input bits give sixteen rows. Eight input bits give sixty-five thousand five hundred and thirty-six. A table that size is not a design.',
      keyword: 'the table explodes',
      trap: 'Assuming a big table is acceptable because software could generate it. The exam asks for a gate network, and the point of the structure is to avoid the table.'
    },
    {
      id: 'sp-3', scene: 'spec', start: 16, end: 23,
      caption: 'Each problem is solved by one small quantity that summarises the bits already seen.',
      detail: 'The comparator passes the triple (greater, equal, less) about the higher bits. The Gray encoder passes a running exclusive-or. The BCD adder passes a correction flag. Each is a state of a few bits, not a table of many rows.',
      narration: 'The escape is the same every time. Find a small quantity that summarises everything the bits so far have already told you, and pass it forward one position at a time. Three bits for the comparator, one bit for the Gray code, one flag for the adder.',
      keyword: 'summarise, then pass forward',
      trap: 'Calling the state a "carry" in a loose sense and then assuming it behaves like an arithmetic carry. It plays the same role, but the update rule is different in each case.'
    },
    {
      id: 'sp-4', scene: 'spec', start: 23, end: 30,
      caption: 'This is the carry-look-ahead idea wearing three different hats.',
      detail: 'A carry-look-ahead adder also replaces a table by a small per-position rule that composes. Recognising the pattern is what lets one worked example cover three question types.',
      narration: 'If that sounds familiar, it should. A carry-look-ahead adder does exactly this: it replaces the table by a rule per position that composes upward. Same idea, three hats.',
      keyword: 'the same move as the carry',
      trap: 'Reading this as an analogy only. The composition is exact: the ripple comparator is literally a carry chain over a three-value alphabet.'
    },

    /* ---------------- scene 2: onebit ---------------- */
    {
      id: 'ob-1', scene: 'onebit', start: 30, end: 38,
      caption: 'One bit against one bit has four rows and three outputs: greater, equal, less.',
      detail: 'The three outputs are not one three-valued signal. They are three separate wires, and a circuit reading them must see exactly one of them high.',
      narration: 'Start at the smallest size. One bit against one bit. There are four possible pairs, and three questions you can ask about each: is the first greater, are they equal, is the first less.',
      keyword: 'four rows, three outputs',
      trap: 'Thinking of the comparator as producing a single output that somehow encodes three values. On the wire it is three signals, and the design must guarantee one and only one is high.'
    },
    {
      id: 'ob-2', scene: 'onebit', start: 38, end: 46,
      caption: 'Greater is a AND NOT b; equal is a XNOR b; less is NOT a AND b.',
      detail: 'Each output is a single two-input gate. Greater and less are each true on exactly one row, so they are single products. Equal is true on two rows, which is why it is the widest of the three.',
      narration: 'Each of the three is one gate. Greater is a and not b. Equal is a exclusive-nor b, which is an exclusive-or with a bubble. Less is not a and b. Two of them are single rows of the table.',
      keyword: 'one gate each',
      trap: 'Writing equal as a XOR b and then inverting the whole expression somewhere else. The bubble belongs on the gate, and a missing inversion turns the comparator inside out.'
    },
    {
      id: 'ob-3', scene: 'onebit', start: 46, end: 53,
      caption: 'The G, E and L columns hold exactly one 1 in every row — never two, never none.',
      detail: 'This is mutual exclusion plus exhaustiveness. It is what makes the three outputs a safe answer, and it is the first thing to check when a question asks whether a proposed circuit is a valid comparator.',
      narration: 'Look down the three columns. Every row has exactly one 1. Never two, never none. That is not a coincidence, it is the definition: of any two numbers, exactly one of the three relations holds.',
      keyword: 'exactly one is 1',
      trap: 'A circuit with two outputs high looks plausible on three of the four rows, so checking only three rows is enough to miss it.'
    },
    {
      id: 'ob-4', scene: 'onebit', start: 53, end: 60,
      caption: 'Equal is the output that gets passed forward, because it is the only one that says "not decided yet".',
      detail: 'If a higher bit pair already decided greater or less, no lower bit can change the answer. Only a tie leaves the question open, so equality is the signal that travels.',
      narration: 'One of these three matters more than the others. Equal is the only one that means the question is still open. If a higher bit already decided, no lower bit can overturn it.',
      keyword: 'equality travels',
      trap: 'Passing greater or less forward as well, then OR-ing them at the top and wondering why a decided high bit can be overridden.'
    },

    /* ---------------- scene 3: ripple ---------------- */
    {
      id: 'rp-1', scene: 'ripple', start: 60, end: 68,
      caption: 'Comparing 1011 with 1001 starts tied, at the most significant bit.',
      detail: 'The incoming state is greater 0, equal 1, less 0 — the statement "the bits above this position are all tied". Any other starting state silently answers a different question.',
      narration: 'Now two four-bit numbers. 1011 against 1001. We begin above the most significant bit, where nothing has been compared yet, so the state is tied: greater zero, equal one, less zero.',
      keyword: 'start tied',
      trap: 'Starting from the least significant bit because addition starts there. Comparison is not addition: the most significant bit carries the most weight.'
    },
    {
      id: 'rp-2', scene: 'ripple', start: 68, end: 76,
      caption: 'Bit 3 is 1 against 1, so the state stays tied and the question falls through to bit 2.',
      detail: 'When the two bits are equal, equality stays high and greater and less are unchanged. The rule is written E out = E in AND (a equals b).',
      narration: 'Bit three: one against one. Equal, so nothing is decided and the tie passes down. Bit two: zero against zero. Still tied, still nothing decided.',
      keyword: 'a tie falls through',
      trap: 'Concluding equality of the whole word from a single tied bit. A tie at one position says nothing about the positions below it.'
    },
    {
      id: 'rp-3', scene: 'ripple', start: 76, end: 84,
      caption: 'Bit 1 is 1 against 0, so greater goes high and bit 0 is never consulted.',
      detail: 'The update is G out = G in OR (E in AND a greater than b). Once E in has fallen to zero, later positions cannot change G, which is exactly the statement that a lower bit cannot overturn a higher one.',
      narration: 'Bit one: one against zero. Now the answer is decided, greater. And because the state is no longer tied, bit zero has no say at all, even though it is also different.',
      keyword: 'the first difference decides',
      trap: 'Continuing to update the state after it is decided. The OR keeps it correct, but a hand trace that keeps comparing lower bits often reports the wrong reason.'
    },
    {
      id: 'rp-4', scene: 'ripple', start: 84, end: 90,
      caption: 'Checked against numeric comparison on every pair up to six bits: the ripple and the relation never disagree.',
      detail: 'The model builds all 4 to the n pairs for n from one to six, compares the ripple output with the numeric relation, and counts disagreements. The count is zero, and the number of pairs tested is printed on the canvas.',
      narration: 'That rule is not just plausible. The page builds every pair up to six bits, runs the ripple on each, and compares the answer with ordinary numeric comparison. No disagreements.',
      keyword: 'verified on every pair',
      trap: 'Believing a rule because it works on the example you chose. The example here is one of thousands, and the check is what earns the claim.'
    },

    /* ---------------- scene 4: count ---------------- */
    {
      id: 'ct-1', scene: 'count', start: 90, end: 98,
      caption: 'Of the 4 to the n ordered pairs, exactly 2 to the n tie.',
      detail: 'For each of the 2 to the n values of the first word there is exactly one second word equal to it, so the ties number 2 to the n. At four bits that is 16.',
      narration: 'Now count instead of compare. With n bits each there are four to the n ordered pairs. How many are ties? Exactly two to the n, one partner for each value.',
      keyword: 'ties are 2 to the n',
      trap: 'Counting ties as 2 to the n minus something. There is no double counting here, because the pairs are ordered.'
    },
    {
      id: 'ct-2', scene: 'count', start: 98, end: 106,
      caption: 'The rest split evenly, so greater is (4 to the n minus 2 to the n) over 2 — 120 at four bits.',
      detail: 'Every ordered pair with a greater than b has a mirror pair with the words swapped and b greater than a. The mirror is a bijection and it fixes nothing outside the ties, so the two counts are equal.',
      narration: 'Everything that is not a tie is either greater or less, and swapping the two words turns one into the other. So they split evenly. At four bits: sixteen ties, one hundred and twenty greater, one hundred and twenty less.',
      keyword: 'the rest split evenly',
      trap: 'Forgetting that the pairs are ordered and answering with half the total for the ties as well. The tie count is the one that does not halve.'
    },
    {
      id: 'ct-3', scene: 'count', start: 106, end: 114,
      caption: 'Two four-bit comparators compare eight bits, and the low stage feeds the high stage.',
      detail: 'The low nibble comparator produces a triple, and that triple becomes the tie input of the high nibble comparator. Information flows upward, from less significant to more significant.',
      narration: 'A four-bit comparator compares four bits. To compare eight, stack two: the low nibble stage reports on the low four bits, and hands its three flags up to the high nibble stage.',
      keyword: 'low stage feeds high',
      trap: 'Wiring it the other way, high into low. That makes the low nibble override the high one, which is the opposite of how numbers work.'
    },
    {
      id: 'ct-4', scene: 'count', start: 114, end: 120,
      caption: 'The bottom stage must start tied: greater 0, equal 1, less 0.',
      detail: 'A cascade input of anything else injects a decision about bits that do not exist. On an eight-bit comparison built from two four-bit parts, a wrong tie input changes the answer on some pairs.',
      narration: 'One detail decides marks. The bottom stage has nothing below it, so it must be told that the bits below are tied: zero, one, zero. Anything else injects an opinion about bits that are not there.',
      keyword: 'tie in is 0, 1, 0',
      trap: 'Leaving the cascade inputs unconnected and hoping the unused inputs default to zero. A default of all zeros means equal is low, so the whole comparator reports a decided answer.'
    },

    /* ---------------- scene 5: codes ---------------- */
    {
      id: 'cd-1', scene: 'codes', start: 120, end: 128,
      caption: 'A code is a spelling: the same digit, written in a different four-bit word.',
      detail: 'Binary is the spelling arithmetic wants. BCD, excess-3 and Gray are spellings other parts of a system want. Converting between them changes no value, only the word.',
      narration: 'Now the second problem. A code is a spelling of a number. Binary is one spelling. BCD, excess-3 and Gray are others. Converting between them does not change the number, only the word that carries it.',
      keyword: 'a code is a spelling',
      trap: 'Treating a code conversion as arithmetic. The value is unchanged, so a converter is a wiring pattern, not an adder, unless the code itself is an offset.'
    },
    {
      id: 'cd-2', scene: 'codes', start: 128, end: 136,
      caption: 'BCD writes each decimal digit in four bits, so ten of the sixteen words have a meaning.',
      detail: 'The six words 1010 to 1111 are not digits. That is the whole reason the BCD adder later needs a correction: a four-bit adder can produce words that BCD cannot read.',
      narration: 'BCD writes one decimal digit per four bits. Zero to nine use ten of the sixteen words. The other six mean nothing, and remembering that is what makes the BCD adder make sense later.',
      keyword: 'ten of sixteen',
      trap: 'Assuming the six unused words are don\'t-cares in every BCD circuit. They are unreachable at the input of a converter but reachable at the output of an adder.'
    },
    {
      id: 'cd-3', scene: 'codes', start: 136, end: 143,
      caption: 'Excess-3 adds three, and inverting its bits gives the code for the nines complement.',
      detail: 'The code for digit d is the binary of d plus 3. Inverting all four bits gives 15 minus (d plus 3), which is 12 minus d, and that is (9 minus d) plus 3. So inversion implements the nines complement with no borrow.',
      narration: 'Excess-3 adds three to the digit before writing it. That offset buys a property: invert all four bits and you get the code for nine minus the digit. Subtraction becomes addition with no borrow.',
      keyword: 'inverting gives 9 minus d',
      trap: 'Saying excess-3 is self-complementing without saying which complement. It is the nines complement, not the tens complement and not the ones complement.'
    },
    {
      id: 'cd-4', scene: 'codes', start: 143, end: 150,
      caption: 'Every row of the table confirms it: the inverted code equals the code for 9 minus the digit.',
      detail: 'The model computes both sides for all ten digits and compares them. The check passes on every row, and no excess-3 word is all zeros or all ones, which is the second useful property.',
      narration: 'The table shows it on every row: invert the excess-3 word and you land on the excess-3 word for nine minus the digit. That is checked for all ten digits, not asserted.',
      keyword: 'checked on all ten digits',
      trap: 'Generalising the property to any offset. Only the offset of three makes the four-bit code self-complementing in this sense.'
    },

    /* ---------------- scene 6: gray ---------------- */
    {
      id: 'gr-1', scene: 'gray', start: 150, end: 158,
      caption: 'Binary to Gray: the top bit is copied, and every lower Gray bit is that binary bit exclusive-or the one above.',
      detail: 'Equivalently Gray of n is n exclusive-or n shifted right by one. The top bit has nothing above it, so its exclusive-or is with zero and it passes through unchanged.',
      narration: 'Gray code is the code where neighbours differ in one bit. To build it: copy the top bit, then exclusive-or each binary bit with the bit above it. One gate per bit, no arithmetic.',
      keyword: 'one exclusive-or per bit',
      trap: 'Using the decode rule to encode. Encoding pairs each bit with the one above; decoding pairs each bit with the already-decoded bit above, which is a different and longer chain.'
    },
    {
      id: 'gr-2', scene: 'gray', start: 158, end: 166,
      caption: '1011 becomes 1110: g3 is 1, g2 is 1 xor 0, g1 is 0 xor 1, g0 is 1 xor 1.',
      detail: 'The three exclusive-ors are 1, 1 and 0, so the Gray word is 1110. Decoding it back gives 1011, which the page checks for all sixteen four-bit words.',
      narration: 'Run it on 1011. The top bit stays one. One exclusive-or zero is one. Zero exclusive-or one is one. One exclusive-or one is zero. So the Gray code is one one one zero.',
      keyword: '1011 becomes 1110',
      trap: 'Reading the answer in the wrong direction. Written most significant bit first, 1110 is not the same word as 0111, and option lists exploit that.'
    },
    {
      id: 'gr-3', scene: 'gray', start: 166, end: 174,
      caption: 'Down the whole list, each row differs from the one before it in exactly one bit.',
      detail: 'The property is checked at every width from one to ten bits, by comparing each consecutive pair. The number of differing bits is always one.',
      narration: 'Now the property that gives the code its name. Every row differs from the row above in exactly one bit. That is what a rotary encoder needs: a reading can be one step stale but never wildly wrong.',
      keyword: 'neighbours differ in one bit',
      trap: 'Believing one bit changes because the values are close. Consecutive values in ordinary binary often change several bits at once, which is precisely the problem Gray code solves.'
    },
    {
      id: 'gr-4', scene: 'gray', start: 174, end: 180,
      caption: 'The last word and the first also differ in one bit, so the sixteen words form a cycle.',
      detail: 'Fifteen is 1000 in Gray and zero is 0000, which differ in one bit. The wrap is what lets the sequence be laid round a dial, and it is the same wrap that makes the map edges adjacent.',
      narration: 'One more thing that is easy to miss. The last word and the first also differ in one bit. So the sixteen words close into a ring, not just a list. That ring is exactly what a dial needs.',
      keyword: 'the list closes into a cycle',
      trap: 'Checking only the fifteen consecutive pairs and declaring the property verified. The sixteenth pair, the wrap, is the one a question usually targets.'
    },

    /* ---------------- scene 7: kmap ---------------- */
    {
      id: 'km-1', scene: 'kmap', start: 180, end: 188,
      caption: 'The Karnaugh map axis is labelled 00, 01, 11, 10 — not 00, 01, 10, 11.',
      detail: 'Those four labels are the two-bit Gray sequence in order. Counting order would put 01 next to 10, and those two labels differ in two bits, which is the one thing a map must not do.',
      narration: 'Here is where the code earns its place in the syllabus. The Karnaugh map is labelled zero zero, zero one, one one, one zero. That is the Gray sequence, not counting order.',
      keyword: 'the axis is a Gray code',
      trap: 'Writing the axis in counting order and then grouping cells as though they were adjacent. The groups you form will merge cells that differ in two bits.'
    },
    {
      id: 'km-2', scene: 'kmap', start: 188, end: 196,
      caption: 'Two labels differing in one bit sit next to each other, so their cells can merge.',
      detail: 'Merging two cells removes the bit that differs, keeping the literals that agree. That is why a block of two costs one literal and a block of four costs two.',
      narration: 'Two labels that differ in one bit are placed side by side. Their cells merge, and the bit that differs drops out of the product term. That is the entire mechanism of minimisation by map.',
      keyword: 'one differing bit drops out',
      trap: 'Grouping cells that touch only at a corner without checking the labels. Touching is necessary, but the labels are what justify the merge.'
    },
    {
      id: 'km-3', scene: 'kmap', start: 196, end: 204,
      caption: 'A block of four keeps two literals instead of four, because two bits are free to differ.',
      detail: 'Four cells in a rectangle differ in exactly two input bits, so those two literals disappear. The same arithmetic explains a block of eight keeping one literal.',
      narration: 'A block of four spans two free bits, so two literals vanish. The rule that a block of two to the k cells keeps n minus k literals is just this counting, done once.',
      keyword: 'block of 2 to the k keeps n minus k',
      trap: 'Believing a bigger block is always better. Fewest terms comes first, then fewest literals, and those two goals can disagree.'
    },
    {
      id: 'km-4', scene: 'kmap', start: 204, end: 210,
      caption: 'Checked: the four axis labels are the Gray sequence and every adjacent pair differs in one bit, wrap included.',
      detail: 'The model compares the axis order with the computed Gray sequence and tests each adjacent pair, including the last against the first. Both checks pass.',
      narration: 'This is checkable rather than memorable. The page compares the axis order with the computed Gray sequence, and tests every adjacent pair including the wrap. Both hold.',
      keyword: 'verified, not memorised',
      trap: 'Confusing the map\'s adjacency with the arithmetic neighbours of the values. In the map, adjacency is about bits, not about numeric closeness.'
    },

    /* ---------------- scene 8: bcd ---------------- */
    {
      id: 'bc-1', scene: 'bcd', start: 210, end: 218,
      caption: 'Two BCD digits plus a carry in give a binary sum anywhere from 0 to 19.',
      detail: 'Nine plus nine plus one is nineteen. So the four-bit adder produces a carry out and a low nibble, and the low nibble can be any value from 0 to 15 across those 200 inputs.',
      narration: 'Third problem. Two BCD digits and a carry in, added by an ordinary four-bit adder. The true sum runs from zero to nineteen, so there is a carry out and a low nibble left over.',
      keyword: '0 to 19',
      trap: 'Assuming the adder output is already a BCD digit. It is a binary number, and above nine it is not a digit at all.'
    },
    {
      id: 'bc-2', scene: 'bcd', start: 218, end: 226,
      caption: 'Ten to nineteen are not one decimal digit, so the answer needs a carry and a corrected nibble.',
      detail: 'The low nibble is the sum modulo sixteen and the carry is the sum divided by sixteen. Both have to be reinterpreted in base ten, which is exactly where the two bases disagree.',
      narration: 'Ten to nineteen cannot be one digit. So above nine the answer must become a carry plus a corrected digit. The adder counted in sixteens; decimal counts in tens. That mismatch is the whole problem.',
      keyword: 'base sixteen against base ten',
      trap: 'Correcting only when the carry out is high. Sums from ten to fifteen have no carry out and still need the correction, which is the most common error in this question.'
    },
    {
      id: 'bc-3', scene: 'bcd', start: 226, end: 234,
      caption: 'The repair is to add six whenever the binary sum exceeds nine.',
      detail: 'Six is sixteen minus ten. Adding it pushes the nibble past fifteen exactly when it was ten or more, which produces the carry and leaves a nibble that is the decimal digit.',
      narration: 'The repair is one line: if the sum is greater than nine, add six to the low nibble. Seven plus five is twelve. Add six and you get eighteen: carry one, nibble two. Twelve as a decimal answer.',
      keyword: 'add six when over nine',
      trap: 'Adding six to the whole result instead of to the low nibble. The six is a nibble-level correction, and adding it anywhere else changes the carry.'
    },
    {
      id: 'bc-4', scene: 'bcd', start: 234, end: 240,
      caption: 'All 200 inputs are checked against decimal addition: no disagreements.',
      detail: 'The model enumerates every pair of digits and both carry-in values, applies the correction rule, and compares the resulting digit and carry with the decimal sum. Every case agrees.',
      narration: 'This is checked, not assumed. Two hundred inputs: every pair of digits with both carry values. The corrected digit and carry match decimal addition in every single case.',
      keyword: '200 inputs, no disagreement',
      trap: 'Spot-checking two or three cases and calling it verified. The failures in this family cluster at nine plus nine and at sums just above nine.'
    },

    /* ---------------- scene 9: why6 ---------------- */
    {
      id: 'w6-1', scene: 'why6', start: 240, end: 248,
      caption: 'Six is sixteen minus ten, so adding it wraps the nibble by one decimal place.',
      detail: 'Ten plus six is sixteen, which is zero with a carry. So for any sum s from ten to fifteen, s plus six equals s minus ten plus sixteen: the digit is s minus ten and the carry is one.',
      narration: 'Why six? Because sixteen minus ten is six. Adding six to a nibble of ten or more pushes it past fifteen, which produces the carry, and what remains is the digit.',
      keyword: 'sixteen minus ten',
      trap: 'Believing any constant would do. The constant is forced: it must be sixteen minus ten, because the adder counts in sixteens and the answer counts in tens.'
    },
    {
      id: 'w6-2', scene: 'why6', start: 248, end: 256,
      caption: 'Each of the six rescued words lands on 0 to 5 and raises the carry.',
      detail: 'The model tabulates ten through fifteen, adds six to each, and shows the resulting nibble and carry. The nibbles are 0 to 5 and every carry is one.',
      narration: 'Six rows, one per invalid nibble. Ten becomes zero with a carry. Eleven becomes one. Down to fifteen, which becomes five with a carry. Six words rescued, six digits produced.',
      keyword: 'six words, six digits',
      trap: 'Expecting the corrected nibble to be the original digit. It is the digit after the tens have been carried away, so it is always five or less here.'
    },
    {
      id: 'w6-3', scene: 'why6', start: 256, end: 263,
      caption: 'The correction condition is C-out, or S3 S2, or S3 S1.',
      detail: 'S3 S2 covers 1100 to 1111 and S3 S1 covers 1010, 1011, 1110 and 1111. Together they cover exactly 1010 to 1111, and the carry out covers everything above fifteen.',
      narration: 'The condition has three terms. The carry out handles sixteen and above. S3 S2 covers twelve to fifteen. S3 S1 covers ten, eleven, fourteen and fifteen. Together, exactly ten and above.',
      keyword: 'three terms, one meaning',
      trap: 'Dropping one of the two product terms because it looks redundant. Each term covers cells the other misses, so dropping either breaks the condition.'
    },
    {
      id: 'w6-4', scene: 'why6', start: 263, end: 270,
      caption: 'Ten to fifteen really do arrive, so this is not a don\'t-care problem — the condition must be right on all sixteen words.',
      detail: 'The model confirms that the low nibble takes every value from 0 to 15 across the 200 inputs. Since every word is reachable, the correction logic must be exact rather than merely convenient.',
      narration: 'And one warning. Those six words are not don\'t-cares. They genuinely appear at the adder output, so the condition has to be correct on all sixteen nibbles, not merely on the ones you happen to try.',
      keyword: 'reachable, not don\'t-care',
      trap: 'Reusing a don\'t-care minimisation from a BCD-to-seven-segment decoder. There the invalid words are unreachable inputs; here they are reachable outputs.'
    },

    /* ---------------- scene 10: proc ---------------- */
    {
      id: 'pr-1', scene: 'proc', start: 270, end: 278,
      caption: 'Name the input word and the output word before writing any gate.',
      detail: 'A comparator has two input words and three output flags. A converter has one input word and one output word. A BCD adder has two digits and a carry in, and two outputs: a digit and a carry out.',
      narration: 'One procedure covers all three. First, name what goes in and what comes out. Two words and three flags. One word and one word. Two digits plus a carry, and a digit plus a carry.',
      keyword: 'name the words',
      trap: 'Starting from the circuit you remember instead of the specification. The remembered circuit answers a slightly different question.'
    },
    {
      id: 'pr-2', scene: 'proc', start: 278, end: 286,
      caption: 'Find the small quantity that summarises the lower bits, then write one rule per position.',
      detail: 'The triple for the comparator, the running exclusive-or for the Gray encoder, the correction flag for the BCD adder. Then the per-position rule, checked on every input the model can enumerate.',
      narration: 'Second, find the small state. The triple for the comparator. The running exclusive-or for the code. The correction flag for the adder. Third, write the rule for one position and check it on everything you can enumerate.',
      keyword: 'find the state',
      trap: 'Trying to write a single expression for the whole word. The per-position rule plus the state is shorter and far less error-prone.'
    },
    {
      id: 'pr-3', scene: 'proc', start: 286, end: 293,
      caption: 'Trap one: comparing from the least significant bit. Trap two: a cascade input that is not a tie.',
      detail: 'Both traps come from borrowing the habits of addition. Comparison reads most significant first, and a cascade must be told that the bits below are tied, which is greater 0, equal 1, less 0.',
      narration: 'Now the traps. Comparing from the low end, which is the habit addition gives you. And feeding a cascaded stage anything other than a tie, which quietly answers a question about bits that do not exist.',
      keyword: 'high end first, tie in',
      trap: 'Both traps produce answers that appear among the options, so a careless check does not catch them.'
    },
    {
      id: 'pr-4', scene: 'proc', start: 293, end: 300,
      caption: 'Trap three: using the decode chain to encode. Traps four and five: treating 10 to 15 as don\'t-cares, and forgetting the corrected carry.',
      detail: 'Encoding pairs each bit with the one above; decoding pairs each bit with the already-decoded bit above. In BCD, the six invalid words are reachable at an adder output, and the correction always raises the carry.',
      narration: 'Three more. Using the decode chain to encode, which is a different and longer chain. Treating ten to fifteen as don\'t-cares, when they arrive. And forgetting that the corrected sum raises the carry.',
      keyword: 'the last three traps',
      trap: 'Answering with the intermediate nibble instead of the digit-and-carry pair the question asked for.'
    }
  ]
};
