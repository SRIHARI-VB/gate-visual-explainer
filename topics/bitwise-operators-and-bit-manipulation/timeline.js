/* ==========================================================================
   bitwise-operators-and-bit-manipulation - THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs - never edited by hand.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 336,

  scenes: [
    { id: 'cols',   n: 1,  title: 'Eight columns, no carries',              objective: 'see that a bitwise operator works column by column, and that its result is a number, not a truth value', start: 0,   end: 28  },
    { id: 'tables', n: 2,  title: 'Three tables, one rule per column',       objective: 'read &, | and ^ as per-bit truth tables, and see why the columns never talk to each other', start: 28,  end: 56  },
    { id: 'mask',   n: 3,  title: 'Masks: set, clear, toggle, test',         objective: 'build the mask 1<<k and use it in the four operations that change or read one bit', start: 56,  end: 84  },
    { id: 'field',  n: 4,  title: 'A field: shift, then mask',               objective: 'extract a run of bits with two operations, in the only order that works', start: 84,  end: 112 },
    { id: 'twos',   n: 5,  title: 'Negative numbers, and what ~ really is',  objective: 'read the two\u2019s complement pattern, derive ~x = -x-1, and see sign extension', start: 112, end: 140 },
    { id: 'shift',  n: 6,  title: 'Shifts: the count, and the three traps',  objective: 'state the four rules for << and >>, the three cases the standard leaves undefined, and the one it leaves implementation-defined', start: 140, end: 168 },
    { id: 'trick1', n: 7,  title: 'x & (x-1): the lowest set bit goes',      objective: 'clear the lowest set bit in one operation, and use it as a power-of-two test with its one false positive', start: 168, end: 196 },
    { id: 'trick2', n: 8,  title: 'x & -x, and counting the ones',           objective: 'isolate the lowest set bit, and count set bits in exactly popcount steps', start: 196, end: 224 },
    { id: 'prec',   n: 9,  title: 'The precedence trap in one line',         objective: 'parse x & 1 == 0 the way the compiler does, and see the test become always false', start: 224, end: 252 },
    { id: 'swap',   n: 10, title: 'XOR swap, and the aliasing that eats it', objective: 'trace the three-XOR swap and see it destroy the value when both names are the same object', start: 252, end: 280 },
    { id: 'gate',   n: 11, title: 'Two previous-year items, recomputed',     objective: 'settle GATE 2022 Q44 and GATE 2017 Set 1 Q55 from the bit patterns rather than from a key', start: 280, end: 308 },
    { id: 'proc',   n: 12, title: 'The procedure, in five steps',            objective: 'consolidate width, mask, order, sign and check into a procedure that answers any question in the topic', start: 308, end: 336 }
  ],

  events: [
    /* ---- 1. eight columns -------------------------------------------------- */
    { id: 'c1', scene: 'cols', start: 0, end: 7,
      caption: 'Two bytes, one above the other. A bitwise operator works straight down the columns, like eight tiny sums done at once.',
      narration: 'Here are two bytes, one above the other, written most significant bit first. A bitwise operator works straight down the columns: bit seven with bit seven, bit six with bit six, and so on to bit zero. Eight independent answers, no carrying between them.',
      detail: 'The leftmost cell is bit seven, worth one hundred and twenty-eight; the rightmost is bit zero, worth one. Reading left to right is the only convention used in this lesson.',
      keyword: 'straight down the columns' },

    { id: 'c2', scene: 'cols', start: 7, end: 14,
      caption: 'AND keeps a one only where both columns hold a one. Here that leaves one column out of three.',
      narration: 'Bitwise AND keeps a one in a column only when both bytes hold a one there. Down the eight columns of these two bytes it keeps four ones, and the result is the number fifty-two.',
      detail: '0xB6 is 182 and 0x3C is 60; 182 & 60 is 52. Every column is decided on its own, which is why the operation is called bitwise rather than arithmetic.',
      keyword: 'only where both columns hold a one' },

    { id: 'c3', scene: 'cols', start: 14, end: 21,
      caption: 'OR keeps a one where either holds one. XOR keeps a one where they disagree. Three tables, same eight columns.',
      narration: 'OR keeps a one where either byte holds one, giving one hundred and ninety. XOR keeps a one where the two disagree, giving one hundred and thirty-eight. Same eight columns, three different rules, and the shape of the answer is still a byte.',
      detail: '182 | 60 is 190, and 182 ^ 60 is 138. The three results have the same width as the inputs, because no column can produce a carry.',
      keyword: 'where they disagree' },

    { id: 'c4', scene: 'cols', start: 21, end: 28,
      caption: 'This is why & is not &&. Logical and gives 0 or 1; bitwise and gives a number with bits in it.',
      narration: 'This is the difference that costs marks. Logical and-and gives either zero or one, and it stops early. Bitwise and gives a number with bits in it: six and three is two, not one. If a question prints the result, the number is the answer.',
      detail: '6 & 3 is 2 because 110 and 011 share a one only in the twos column. 6 && 3 is 1 because both are non-zero. The two operators share a keyboard symbol and nothing else.',
      keyword: 'six and three is two',
      trap: 'A question that asks for the printed value of an expression containing a single & wants a number, not a truth value.' },

    /* ---- 2. three tables --------------------------------------------------- */
    { id: 't1', scene: 'tables', start: 28, end: 35,
      caption: 'AND as a table: four rows, one output. Zero wins everywhere except the single row where both inputs are one.',
      narration: 'Write AND as a two-input table and it has four rows. The output is one only in the last row, where both inputs are one. That table is applied to every column independently, which is the whole definition.',
      detail: 'The table is the Boolean AND of Digital Logic, applied eight times in parallel. Nothing about the byte as a whole enters the definition.',
      keyword: 'four rows, one output' },

    { id: 't2', scene: 'tables', start: 35, end: 42,
      caption: 'OR is one unless both are zero. XOR is one when the inputs differ, which is why it is the parity operator.',
      narration: 'OR is one unless both inputs are zero. XOR is one exactly when the two inputs differ, which makes it the operator that detects disagreement, and the one that computes parity.',
      detail: 'XOR is also addition without carry, and it is its own inverse: applying the same XOR twice returns the original value. Scene ten uses that fact for a swap.',
      keyword: 'the operator that detects disagreement' },

    { id: 't3', scene: 'tables', start: 42, end: 49,
      caption: 'Sixteen binary Boolean functions exist. C gives you three as operators, and one unary: the complement.',
      narration: 'There are sixteen possible binary Boolean functions of two inputs, and only three of them are operators in C: and, or and exclusive or, plus the unary complement. Everything else in the topic is built from those four.',
      detail: 'The count is sixteen because each of the four rows of the table can be filled two ways. The page confirms the three tables bit by bit on all sixty-five thousand five hundred and thirty-six pairs of bytes.',
      keyword: 'sixteen possible binary Boolean functions' },

    { id: 't4', scene: 'tables', start: 49, end: 56,
      caption: 'Because the columns are independent, the Boolean laws hold bitwise: De Morgan works on every bit at once.',
      narration: 'Because the columns never interact, every Boolean law holds bit for bit. De Morgan is the one that gets used: the complement of a conjunction is the disjunction of the complements, column by column.',
      detail: 'The page checks both De Morgan laws on all sixty-five thousand five hundred and thirty-six pairs of bytes, with no disagreement. It is the same law as in the logic lesson, applied eight times in parallel.',
      keyword: 'De Morgan works on every bit at once' },

    /* ---- 3. masks ---------------------------------------------------------- */
    { id: 'm1', scene: 'mask', start: 56, end: 63,
      caption: 'A mask is a number with exactly one one in it. Shift one left by k and you have a mask for bit k.',
      narration: 'A mask is a number with exactly one one in it. Take one and shift it left by k positions, and the one lands on bit k. That single number is all you need to read or change that bit and leave the other seven alone.',
      detail: 'For k equal to three the mask is eight, written 00001000. Shifting one left by k is the same as multiplying by two to the power k, which is why the mask for bit k has value two to the k.',
      keyword: 'exactly one one in it' },

    { id: 'm2', scene: 'mask', start: 63, end: 70,
      caption: 'OR sets the bit. AND with the complement clears it. XOR toggles it. AND with the mask reads it.',
      narration: 'Four operations, one mask. OR sets the bit, because a one in the mask forces a one. AND with the complement of the mask clears it, because a zero there forces a zero. XOR toggles it, because exclusive or with one flips. And AND with the mask reads it, leaving either the mask itself or zero.',
      detail: 'The complement is the part people forget: clearing needs the mask inverted, not the mask. Writing x & m instead of x & ~m clears everything except bit k, which is the opposite of the intent.',
      keyword: 'OR sets, AND clears, XOR toggles',
      trap: 'Clearing a bit needs x & ~m. Writing x & m keeps only that bit, which is a different program.' },

    { id: 'm3', scene: 'mask', start: 70, end: 77,
      caption: 'On 182 the mask for bit three is absent and the mask for bit two is present. Watch the same number change and come back.',
      narration: 'Take the byte one eight two. Bit three is zero, so setting it adds eight and clearing it changes nothing. Bit two is one, so clearing it subtracts four and setting it changes nothing. Toggling either one twice returns the original byte.',
      detail: '182 is 10110110. Setting bit three gives 190, which is 10111110. Clearing bit two gives 178, which is 10110010. Every result is checked against the definition of the bit in the page\u2019s own model.',
      keyword: 'the same number change and come back' },

    { id: 'm4', scene: 'mask', start: 77, end: 84,
      caption: 'The test is (x >> k) & 1, or equivalently x & mask compared with zero. Both are one operation more than they look.',
      narration: 'To test a bit, shift it down to position zero and mask it with one, or mask it in place and compare with zero. Both give a zero or a one and neither disturbs the byte, because a test that changes the value is not a test.',
      detail: 'x & m is either zero or m, so a test written as x & m is true when the bit is set, but its value is a number. That is the trap of scene one returning: compare with zero explicitly if the value matters.',
      keyword: 'the test is one operation more than it looks' },

    /* ---- 4. fields --------------------------------------------------------- */
    { id: 'f1', scene: 'field', start: 84, end: 91,
      caption: 'A field is a run of bits in the middle of a number. To read bits five down to two, shift right by two first.',
      narration: 'A field is a run of bits in the middle of a number: the middle four bits, or the exponent field of a floating-point word. To read the run that starts at bit two and is four bits wide, shift the number right by two, so the run begins at position zero.',
      detail: 'Shifting right by two is floor division by four, which is why the shift is the same operation as dropping the low bits. The high bits above the field are still there and are about to be removed.',
      keyword: 'shift right by two first' },

    { id: 'f2', scene: 'field', start: 91, end: 98,
      caption: 'Then mask with four ones. Shift first, mask second, and the field is a number you can compare.',
      narration: 'Then mask with four ones, which is fifteen. What is left is exactly the field, sitting at position zero, with nothing above it. Shift first and mask second, and the field is a plain number.',
      detail: '182 shifted right by two is 45; 45 masked with fifteen is 13, which is 1101, the four bits that were in positions five to two. The page checks this round trip for every byte, every start and every width.',
      keyword: 'mask with four ones' },

    { id: 'f3', scene: 'field', start: 98, end: 105,
      caption: 'Mask first and the field is already gone: the shift then throws away the bits you kept. The order is not a style choice.',
      narration: 'Do it the other way round and the answer changes. Mask first with fifteen and you keep the low four bits, which are not the field. Shift afterwards and you throw away what you kept. The order is part of the algorithm, not a matter of taste.',
      detail: '182 masked with fifteen is six; six shifted right by two is one. The correct field is thirteen. One is not a rounding error, it is a different question being answered.',
      keyword: 'the field is already gone',
      trap: 'Extraction is shift-then-mask. Insertion is mask-then-shift-then-OR. Reversing either gives a plausible-looking wrong number.' },

    { id: 'f4', scene: 'field', start: 105, end: 112,
      caption: 'A mask of w ones is (1 << w) - 1, and w equal to the width is the shift that has no answer.',
      narration: 'A mask of w ones is one shifted left by w, minus one. That formula has one fatal input: w equal to the width of the type. For a thirty-two bit int, shifting one left by thirty-two is undefined, so the mask of thirty-two ones cannot be written that way.',
      detail: 'For an unsigned type the safe full mask is ~0u, which is all ones by definition. The next scene lists the shift rules that make the w-equals-width case undefined rather than zero.',
      keyword: 'the shift that has no answer' },

    /* ---- 5. two's complement ----------------------------------------------- */
    { id: 'w1', scene: 'twos', start: 112, end: 119,
      caption: 'Five is 00000101. Complement every bit and you get 11111010, which is not a number you would guess.',
      narration: 'Take five, written in eight bits. Complement every bit and you get one one one one one zero one zero. As an unsigned byte that is two hundred and fifty, and as a signed byte it is negative six.',
      detail: 'The complement is the NOT operator, and it is the only unary bitwise operator in C. It flips every bit of the promoted operand, including the sign bit, which is what makes its value negative.',
      keyword: 'not a number you would guess' },

    { id: 'w2', scene: 'twos', start: 119, end: 126,
      caption: 'The rule is ~x = -x - 1, for every signed value. Complement is not negation, and the two differ by one.',
      narration: 'The identity is that the complement of x is minus x minus one, and it holds for every signed value. So the complement of five is minus six, not minus five. Complement and negation differ by exactly one, and confusing them is a reliable way to lose a mark.',
      detail: 'The page checks the identity on all two hundred and fifty-six signed byte values. It is a consequence of two\u2019s complement: flipping every bit changes the sum of the place values by one less than the modulus.',
      keyword: 'minus x minus one',
      trap: '~x is -x-1, never -x. For x = 0 the complement is -1, and the all-ones pattern is what -1 looks like.' },

    { id: 'w3', scene: 'twos', start: 126, end: 133,
      caption: 'A negative operand works too: its pattern is used, and the sign bit is all ones. So mask after, not before.',
      narration: 'A negative operand is no obstacle, as long as you remember that its bit pattern is full of leading ones. Complement of six and fifteen gives ten, because the leading ones survive until the mask removes them. Masking is what makes a negative operand behave.',
      detail: 'In two\u2019s complement, which the standard mandates from C23 and which every mainstream compiler has used for decades, a negative value is a sign bit followed by the complement-plus-one pattern.',
      keyword: 'its pattern is full of leading ones' },

    { id: 'w4', scene: 'twos', start: 133, end: 140,
      caption: 'Widening a negative value copies the sign bit all the way up. Widening an unsigned one fills with zeros instead.',
      narration: 'When a signed byte is widened to an int, the sign bit is copied into every new bit, so minus eight stays minus eight. When an unsigned byte is widened, the new bits are zeros, so two hundred and forty-eight stays two hundred and forty-eight. Same eight bits, two different numbers.',
      detail: 'The pattern 11111000 is minus eight as a signed char and two hundred and forty-eight as an unsigned char. Promotion to int keeps the type, so the number it denotes depends on the type it was read as, not on the bits.',
      keyword: 'copies the sign bit all the way up' },

    /* ---- 6. shifts --------------------------------------------------------- */
    { id: 's1', scene: 'shift', start: 140, end: 147,
      caption: 'Shifting left by k multiplies by two to the k. Shifting right divides, dropping the remainder.',
      narration: 'Shifting left by k multiplies by two to the k, and vacated bits on the right are filled with zeros. Shifting right by k divides by two to the k and drops the remainder, and for an unsigned operand the vacated bits on the left are zeros too.',
      detail: 'One shifted left by three is eight. 182 shifted right by two is 45, which is the integer part of 182 divided by 4. The page checks the division identity for every byte and every legal count.',
      keyword: 'multiplies by two to the k' },

    { id: 's2', scene: 'shift', start: 147, end: 154,
      caption: 'The count must be at least zero and less than the width. A count equal to the width is undefined, not zero.',
      narration: 'The count has a legal range: at least zero, and strictly less than the width of the promoted left operand. Eight legal counts for a byte, thirty-two for an int. A count equal to the width is undefined behaviour, not zero, and a negative count is undefined as well.',
      detail: 'That is the standard\u2019s rule for the shift operators. On common hardware the count is taken modulo the width, so shifting a thirty-two bit int by thirty-two quietly produces the unshifted value, which is how the bug survives testing.',
      keyword: 'undefined, not zero',
      trap: 'Shift by exactly the width is undefined behaviour. It often looks like it works, because the processor takes the count modulo the width.' },

    { id: 's3', scene: 'shift', start: 154, end: 161,
      caption: 'Shifting a negative value left is undefined, and so is shifting a positive one into the sign bit. Use unsigned.',
      narration: 'Two more cases have no defined answer. Shifting a negative value left is undefined, and shifting a signed positive value so far left that the result does not fit is undefined too. One shifted left by thirty-one on a thirty-two bit int is the second case.',
      detail: 'The fix is the same in both: do bit work in an unsigned type, where the result is defined as the value reduced modulo one more than the maximum. The page shows the unsigned form of the sign-bit mask.',
      keyword: 'no defined answer' },

    { id: 's4', scene: 'shift', start: 161, end: 168,
      caption: 'Right shifting a negative value is implementation-defined: arithmetic gives minus four, logical gives one hundred and twenty-four.',
      narration: 'Right shifting a negative value is the case the standard hands to the implementation. Most compilers copy the sign bit, which is an arithmetic shift and turns minus eight into minus four. A logical shift would fill with zeros and turn the same pattern into one hundred and twenty-four.',
      detail: 'All one hundred and twenty-eight negative byte patterns differ between the two conventions, so no portable program can depend on either. Note also that arithmetic shift floors: minus seven shifted right by one is minus four, not minus three.',
      keyword: 'implementation-defined',
      trap: 'For negative values, >> is not division: arithmetic shift floors, so -7 >> 1 is -4 while -7 / 2 is -3.' },

    /* ---- 7. the lowest set bit --------------------------------------------- */
    { id: 'k1', scene: 'trick1', start: 168, end: 175,
      caption: 'Subtract one from a number and every bit below its lowest set bit flips to one; that bit itself becomes zero.',
      narration: 'Here is what subtracting one does to a bit pattern. The lowest set bit becomes zero, and every bit below it, which were all zeros, become ones. Nothing at or above that position changes.',
      detail: 'The reason is that subtracting one borrows from the first place that has something to lend, which is exactly the lowest set bit. The bits below it have nothing, so they all borrow and end up as ones.',
      keyword: 'every bit below its lowest set bit flips' },

    { id: 'k2', scene: 'trick1', start: 175, end: 182,
      caption: 'So x & (x-1) deletes exactly that bit and keeps everything above it. Repeat and the number drains one one at a time.',
      narration: 'Now and the two together. Every bit below the lowest set bit is zero in the original, so the ones introduced by subtracting do not survive. The lowest set bit itself is zero in the subtrahend, so it goes. Everything above is unchanged. The result is the original with exactly one one removed.',
      detail: 'One eight two becomes one eight zero, then one seven six, then one six zero, then one two eight, then zero: five steps for five ones. The page checks on all bytes that the popcount falls by exactly one each time.',
      keyword: 'deletes exactly that bit' },

    { id: 'k3', scene: 'trick1', start: 182, end: 189,
      caption: 'That gives a power-of-two test in one line: a positive x is a power of two exactly when x & (x-1) is zero.',
      narration: 'That gives the power-of-two test in one line. A positive number is a power of two exactly when it has a single one, and it has a single one exactly when removing the lowest one leaves nothing. The page checks the equivalence over every byte.',
      detail: 'The test is used to size hash tables, to find the next power of two, and to check alignment. It is worth knowing that it is an equivalence only on the positive numbers.',
      keyword: 'a power-of-two test in one line' },

    { id: 'k4', scene: 'trick1', start: 189, end: 196,
      caption: 'One value passes the test and is not a power of two: zero. So the test is written x && !(x & (x-1)).',
      narration: 'There is exactly one exception, and it is zero. Zero anded with minus one is zero, so zero passes the test, and zero is not a power of two. Every published version of this test therefore adds a guard: x is non-zero and the and is zero.',
      detail: 'The page reports the exception list as a computed result rather than an assertion: scanning all two hundred and fifty-six bytes finds exactly one false positive, and it is zero.',
      keyword: 'One value passes the test and is not a power of two',
      trap: 'x & (x-1) == 0 alone accepts zero. The guarded form is x != 0 && (x & (x-1)) == 0.' },

    /* ---- 8. isolate, count ------------------------------------------------- */
    { id: 'i1', scene: 'trick2', start: 196, end: 203,
      caption: 'Negating a pattern means complementing it and adding one. Do that to 182 and you get 74, whose low bits are the ones you want.',
      narration: 'Negation of a bit pattern is complement plus one. Do that to one eight two and you get the pattern for minus one eight two, which is seventy-four. Now and the two patterns together.',
      detail: 'The negation is computed in the model as the two\u2019s complement of the byte, so the pattern is exact rather than a decimal approximation. The result of the and is a single one, and it sits at the lowest set bit of the original.',
      keyword: 'complement plus one' },

    { id: 'i2', scene: 'trick2', start: 203, end: 210,
      caption: 'x & -x keeps only the lowest set bit: here two. Everything above it cancels, because the negation has zeros there.',
      narration: 'The and keeps only the lowest set bit, which here is two. Above that position the negation has zeros, so nothing survives; below it both patterns have zeros. One operation isolates the bit that subtraction would have found in a loop.',
      detail: 'The page checks the identity against the position of the lowest set bit for every non-zero byte. For zero the expression gives zero, which is the only value for which the identity has nothing to say.',
      keyword: 'keeps only the lowest set bit' },

    { id: 'i3', scene: 'trick2', start: 210, end: 217,
      caption: 'Counting is the same trick in a loop: clear the lowest one each time, and the loop runs once per one.',
      narration: 'Counting the ones is the same trick in a loop. Clear the lowest one, count one, and repeat until the number is zero. The loop runs exactly as many times as there are ones, which is the whole point: a naive shift loop always runs the full width.',
      detail: 'For one eight two that is five iterations against eight for the shift loop. The page checks on all bytes that the iteration count equals the popcount, with no exceptions.',
      keyword: 'once per one' },

    { id: 'i4', scene: 'trick2', start: 217, end: 224,
      caption: 'Parity is the same information folded down: three XORs reduce a byte to one bit, which is the odd-or-even answer.',
      narration: 'Parity is the same information folded down. Exclusive or the byte with itself shifted by four, then by two, then by one, and the lowest bit holds the parity: one when the count of ones is odd. Three operations, no table.',
      detail: 'The page checks the fold against the popcount parity for every byte. The same fold is what a checksum does over a longer word, one level at a time.',
      keyword: 'folded down' },

    /* ---- 9. precedence ----------------------------------------------------- */
    { id: 'p1', scene: 'prec', start: 224, end: 231,
      caption: 'In C the comparison operators bind tighter than the bitwise ones. So == is applied before &.',
      narration: 'Here is the ladder that decides the question. Equality binds tighter than bitwise and, which binds tighter than exclusive or, which binds tighter than or. Assignment is at the bottom. So in an expression with both, the comparison happens first.',
      detail: 'This ordering is unusual among languages and is a direct inheritance from the early C precedence table, kept for compatibility. C++ kept it too, and both languages advise parentheses instead of memory.',
      keyword: 'the comparison operators bind tighter' },

    { id: 'p2', scene: 'prec', start: 231, end: 238,
      caption: 'So x & 1 == 0 means x & (1 == 0). One equals zero is false, which is zero, and anything anded with zero is zero.',
      narration: 'So the test as usually typed, x and one equals zero, is parsed as x anded with the result of one equals zero. One equals zero is false, which is zero. Anything anded with zero is zero. The test is therefore always false, whatever x is.',
      detail: 'The page checks the parsed form on all two hundred and fifty-six bytes and finds the result is zero in every case. That is a test that can never pass, compiled without a warning by default.',
      keyword: 'always false, whatever x is',
      trap: 'x & 1 == 0 is always false. The intended test is (x & 1) == 0, which is true for all 128 even bytes.' },

    { id: 'p3', scene: 'prec', start: 238, end: 245,
      caption: 'For x equal to five the intended test answers one and the written test answers zero. The two disagree on every even number.',
      narration: 'For x equal to five the intended test answers one, because five is odd. The written test answers zero. The page counts the disagreements: the two forms differ on one hundred and twenty-eight of the two hundred and fifty-six bytes, which is exactly the even ones.',
      detail: 'That count is the diagnostic: a test that is wrong on half its inputs still looks plausible in a single run, which is why the bug reaches production.',
      keyword: 'differ on one hundred and twenty-eight' },

    { id: 'p4', scene: 'prec', start: 245, end: 252,
      caption: 'The repair is parentheses, not a different operator. Put them round the bit work and the ladder stops mattering.',
      narration: 'The repair is parentheses around the bit work, and then the ladder stops mattering. The same advice covers the other two members of this family: test a field with parentheses, and never write a shift inside a comparison without them.',
      detail: 'Two more members of the family, both worth a line: count += v & 1 groups as count += (v & 1), because the compound assignment binds loosest; and a << b + c shifts by b plus c, because addition binds tighter than a shift.',
      keyword: 'parentheses, not a different operator' },

    /* ---- 10. XOR swap ------------------------------------------------------ */
    { id: 'x1', scene: 'swap', start: 252, end: 259,
      caption: 'XOR is its own inverse. That is enough to exchange two values with no third variable.',
      narration: 'Exclusive or is its own inverse: applying the same value twice returns the original. That single fact is enough to exchange two variables without a third one, using three XORs.',
      detail: 'The three steps are: replace the first with the exclusive or of both, replace the second with the exclusive or of the new first and itself, and replace the first again. Each step is checked against the arithmetic in the model.',
      keyword: 'its own inverse' },

    { id: 'x2', scene: 'swap', start: 259, end: 266,
      caption: 'Five and nine: after three XORs the first holds nine and the second holds five. The values have exchanged places.',
      narration: 'Take five and nine. The first step leaves twelve in the first variable. The second leaves five in the second. The third leaves nine in the first. The values have exchanged places and no temporary was needed.',
      detail: 'Every intermediate is a byte pattern in the model, so the trace can be read down the table. The page checks the exchange on all sixty-five thousand two hundred and eighty pairs of distinct bytes.',
      keyword: 'the values have exchanged places' },

    { id: 'x3', scene: 'swap', start: 266, end: 273,
      caption: 'But if both names refer to the same object, the first XOR zeroes it, and the other two keep it zero. The value is gone.',
      narration: 'Now the failure. If both names refer to the same object, the first step exclusive-ors the object with itself, which is zero. The next two steps keep it zero. The value is destroyed, and it is destroyed silently.',
      detail: 'The page models aliasing as one object rather than two equal ones, and the object ends at zero in all two hundred and fifty-six cases: the one that started at zero simply stays there. The swap has no safe aliasing case.',
      keyword: 'the value is gone',
      trap: 'Any XOR swap must be guarded with if (a != b), or replaced with a temporary. With a temporary there is no aliasing case at all.' },

    { id: 'x4', scene: 'swap', start: 273, end: 280,
      caption: 'A compiler already swaps through a register. The trick is worth knowing for the reading, not for the writing.',
      narration: 'In practice a compiler swaps two variables through a register, and the temporary version compiles to the same code or better. The XOR swap is worth knowing because questions are asked about it, and because the aliasing failure is the same failure that appears whenever two names can reach one object.',
      detail: 'The general lesson is broader than the trick: an operation that reads and writes the same object twice is only correct when the two names are known to be different, which is the same assumption that the copying and aliasing rules of C refuse to make for you.',
      keyword: 'worth knowing for the reading' },

    /* ---- 11. two items ----------------------------------------------------- */
    { id: 'g1', scene: 'gate', start: 280, end: 287,
      caption: 'GATE 2022, Question 44: two characters, three bitwise operators, printed with the character conversion.',
      narration: 'GATE twenty twenty-two, question forty-four, prints three values with the character conversion. Two characters are loaded into signed chars, and three expressions apply and, or and exclusive or, each followed by an arithmetic operation on the character code.',
      detail: 'The question supplies the ASCII table for the letters and for the three punctuation marks, so nothing has to be remembered. The page recomputes every step from the bit patterns.',
      keyword: 'three bitwise operators' },

    { id: 'g2', scene: 'gate', start: 287, end: 294,
      caption: 'Eighty and one twenty give eighty; plus forty-two is one twenty-two, the letter z. The other two follow the same way.',
      narration: 'The and of the two character codes is eighty, and adding forty-two gives one hundred and twenty-two, which is the letter z. The or is one hundred and twenty, minus forty-five gives seventy-five, the letter K. The exclusive or is forty, plus forty-three gives eighty-three, the letter S. The printed answer is z, K, S.',
      detail: 'The key is option A. Note the shape of the trap: option B is the three decimal values, and option C is the three punctuation marks, so a candidate who ignores the character conversion or the bit work lands on a listed wrong answer.',
      keyword: 'the printed answer is z, K, S' },

    { id: 'g3', scene: 'gate', start: 294, end: 301,
      caption: 'GATE 2017 Set 1, Question 55: a loop that adds the low bit and shifts. That is a count of ones, one bit at a time.',
      narration: 'GATE twenty seventeen, set one, question fifty-five, has a function that adds the low bit of its argument to a counter and then shifts the argument right. That is the naive count of ones: add the lowest bit, drop it, repeat until nothing is left.',
      detail: 'The shift is on a non-negative int, so it is the defined case. The low bit is read with and-one, which is the mask of scene three used as a test. Two of this lesson\u2019s ideas in four lines of code.',
      keyword: 'a count of ones' },

    { id: 'g4', scene: 'gate', start: 301, end: 308,
      caption: 'The counter is static, so it accumulates. The calls return 2, 3, 5, 6, 7 and the total printed is 23.',
      narration: 'The counter is a static variable, so it is not reset between calls: each call returns the running total of ones seen so far. The five calls return two, three, five, six and seven, and those are added into the accumulator in the caller, so the printed value is twenty-three.',
      detail: 'The static accumulator is the part of the question that is not about bits, and the bit part is the part candidates get wrong: reading v and one as a truth value instead of the lowest bit. The page reproduces the trace and the total.',
      keyword: 'the total printed is 23',
      trap: 'The static counter is the trap here, not the bit work. The bit work contributes the counts 2, 1, 2, 1, 1.' },

    /* ---- 12. the procedure ------------------------------------------------- */
    { id: 'r1', scene: 'proc', start: 308, end: 315,
      caption: 'Step one: name the width and the signedness. Every mask and every shift count depends on both.',
      narration: 'Step one of the procedure: name the width and the signedness before writing anything. Every mask depends on the width, every legal shift count depends on the width, and whether a right shift is defined depends on the signedness.',
      detail: 'The width of a char is eight bits on every platform this lesson targets, but the width of an int is not fixed by the standard. The page says so where it uses a width, and the model uses eight bits for the drawing and thirty-two for the standard examples.',
      keyword: 'name the width and the signedness' },

    { id: 'r2', scene: 'proc', start: 315, end: 322,
      caption: 'Step two: write masks as 1u << k or (1u << w) - 1, in an unsigned type. Never shift by the width.',
      narration: 'Step two: write masks in an unsigned type, as one shifted left by k, or as one shifted left by w and then minus one. Never shift by the width, and never leave a mask in a signed type where the top bit is a sign.',
      detail: 'The unsigned form is what makes the shift defined: for an unsigned operand the result is the value reduced modulo one more than the maximum, which is exactly the bit pattern you asked for.',
      keyword: 'in an unsigned type' },

    { id: 'r3', scene: 'proc', start: 322, end: 329,
      caption: 'Step three: fields are shift-then-mask, counting is x & (x-1), a bit test is (x >> k) & 1 with parentheses.',
      narration: 'Step three: choose the shape. A field is shift then mask. A count of ones is the clearing trick in a loop, or the parity fold if one bit is enough. A bit test is a shift and an and, with the parentheses that keep the comparison out of the bit work.',
      detail: 'These three shapes cover almost every bit question that has been asked: extract, count, test. Insertion is the fourth, and it is a mask, a shift and an or, in that order.',
      keyword: 'shift then mask' },

    { id: 'r4', scene: 'proc', start: 329, end: 336,
      caption: 'Step four: check the sign and the count. Step five: verify on a byte by hand. If it is undefined, say so and stop.',
      narration: 'Steps four and five: check the sign of every operand and the size of every shift count, then verify the answer on a single byte by hand. And when a question asks what a program prints and the operation is undefined or implementation-defined, the correct answer is to say so, not to guess a number.',
      detail: 'That last point is a real scoring rule, not a caution: a question that offers a definite value for undefined behaviour is testing whether you know it has none. The Edge cases tab lists the five forms this lesson covers.',
      keyword: 'say so, not to guess a number' }
  ]
};
