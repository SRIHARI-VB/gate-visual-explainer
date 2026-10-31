/* ==========================================================================
   floating-point-arithmetic — THE timeline.
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
      id: 'pipeline', n: 1,
      title: 'Arithmetic is four steps, and representation is none of them',
      start: 0, end: 30,
      objective: 'Separate representing a number from operating on it, name the four steps of every floating-point operation, and fix the toy format the page computes in.'
    },
    {
      id: 'align', n: 2,
      title: 'Alignment: the smaller operand is shifted, and its low bits fall off',
      start: 30, end: 60,
      objective: 'Watch an exponent difference become a shift, see a small addend disappear entirely, and count the bits that were discarded.'
    },
    {
      id: 'round', n: 3,
      title: 'Rounding: nearest, ties to even, and the four other modes',
      start: 60, end: 90,
      objective: 'Round three values into a four-bit significand, see the tie, and read the five IEEE modes as five different answers to one question.'
    },
    {
      id: 'guard', n: 4,
      title: 'Guard, round and sticky: why subtraction needs extra bits',
      start: 90, end: 120,
      objective: 'Reproduce the classic guard-digit failure, 2 minus 1.75 in three bits, and see the error fall from 100 per cent to zero when one extra bit is kept.'
    },
    {
      id: 'tenth', n: 5,
      title: '0.1 + 0.2: two doubles, one exact sum, and a one-bit residue',
      start: 120, end: 150,
      objective: 'Decode 0.1 and 0.2 in double precision, add them, and account for the 0.30000000000000004 to the last bit.'
    },
    {
      id: 'cancel', n: 6,
      title: 'Catastrophic cancellation: subtraction that eats the digits',
      start: 150, end: 180,
      objective: 'Show a difference that becomes zero in single precision, and a quadratic formula whose small root is wrong by a quarter until it is rearranged.'
    },
    {
      id: 'order', n: 7,
      title: 'Order matters: two groupings, two answers',
      start: 180, end: 210,
      objective: 'Work the three-digit example GATE asked in 2004, then reproduce non-associativity in double precision and repair a long sum with compensation.'
    },
    {
      id: 'multiply', n: 8,
      title: 'Multiplication and division: exponents add, and nothing aligns',
      start: 210, end: 240,
      objective: 'Multiply two singles by adding exponent fields and subtracting the bias, see the single rounding, and watch overflow and underflow at the ends of the range.'
    },
    {
      id: 'precision', n: 9,
      title: 'What the width buys: seven digits, sixteen digits, and the integers that survive',
      start: 240, end: 270,
      objective: 'Convert a significand width into decimal digits, find the largest integer a float holds exactly, and decode the register values GATE gave in 2025 and 2026.'
    },
    {
      id: 'procedure', n: 10,
      title: 'The four-step procedure, and the traps that decide the mark',
      start: 270, end: 300,
      objective: 'Reduce the topic to one procedure and four traps, and say what a question about floating-point arithmetic is really asking.'
    }
  ],

  events: [

    /* ---------- scene 1: pipeline ---------- */
    { id: 's1-1', scene: 'pipeline', start: 0, end: 7.5,
      caption: 'The last lesson turned bits into numbers. This one operates on them: align, add, normalise, round.',
      detail: 'Representation answers "what value is this bit pattern". Arithmetic answers "what bit pattern is the sum". The two are separate skills, and GATE tests them separately: a decode question gives you the bits, an arithmetic question gives you two numbers and asks for the result to the last bit.',
      narration: 'The last lesson turned bits into numbers. This one operates on them. Align, add, normalise, round.',
      keyword: 'align, add, normalise, round' },

    { id: 's1-2', scene: 'pipeline', start: 7.5, end: 15,
      caption: 'A format is a promise about spacing: with four significand bits, numbers near one are one-eighth apart.',
      detail: 'Four significand bits means one bit before the point and three after it, so consecutive values in the binade from one to two are 2 to the minus three, which is 0.125, apart. That gap is the unit in the last place, and it doubles every time the exponent rises by one. Every error in this lesson is some number of those gaps.',
      narration: 'A format is a promise about spacing. With four significand bits, numbers near one are one eighth apart.',
      keyword: 'one-eighth apart' },

    { id: 's1-3', scene: 'pipeline', start: 15, end: 22.5,
      caption: 'The page computes in a toy format: four significand bits, exponents from minus three to three.',
      detail: 'A toy format is used so that every bit is visible. It is a real floating-point system with the same four steps as IEEE single and double; only the widths differ. Nothing computed in it is an approximation of the IEEE answer, it is the exact answer in a smaller format, which is why the same phenomenon appears at every width.',
      narration: 'The page computes in a toy format. Four significand bits, exponents from minus three to three.',
      keyword: 'toy format' },

    { id: 's1-4', scene: 'pipeline', start: 22.5, end: 30,
      caption: 'IEEE promises one rounding per operation, applied to the exact result. That promise is the whole design.',
      detail: 'The standard says every operation is performed as if it first produced an intermediate result correct to infinite precision, and then rounded that result to the destination format. One operation, one rounding. The difficulty is that the hardware cannot afford infinite precision, so it keeps a few extra bits and rounds once — and the next scene shows what happens when it keeps too few.',
      narration: 'I triple E promises one rounding per operation, applied to the exact result. That promise is the whole design.',
      keyword: 'one rounding per operation' },

    /* ---------- scene 2: align ---------- */
    { id: 's2-1', scene: 'align', start: 30, end: 37.5,
      caption: 'To add two numbers you must first put them on the same exponent: shift the smaller one right.',
      detail: 'Binary addition needs the points in the same column, exactly as decimal addition does. So the operand with the smaller exponent is shifted right until the exponents match, and each shift divides its significand by two. The shift is where information leaves the machine.',
      narration: 'To add two numbers you must first put them on the same exponent. Shift the smaller one right.',
      keyword: 'shift the smaller one right' },

    { id: 's2-2', scene: 'align', start: 37.5, end: 45,
      caption: 'One plus one-sixteenth in four bits: the difference is four, so four bits are shifted out.',
      detail: 'The exponents are zero and minus four, so the addend is shifted right by four places. The significand has four bits, so all four of its bits are shifted past the end and nothing of it remains. The exact sum is 1.0625, which is not representable in four bits: the two nearest values are 1.000 and 1.125, and the true sum is exactly halfway between them.',
      narration: 'One plus one sixteenth in four bits. The difference is four, so four bits are shifted out.',
      keyword: 'four bits are shifted out' },

    { id: 's2-3', scene: 'align', start: 45, end: 52.5,
      caption: 'The result is one, not 1.0625: the addend was absorbed, and rounding put the sum back on one.',
      detail: 'This is not a bug and it is not a rounding rule being broken. The exact sum 1.0625 lies at a tie between 1.000 and 1.125, and ties go to the even last digit, which is 1.000. The addend vanished because the format has no room for it, not because the hardware chose to ignore it.',
      narration: 'The result is one, not one point zero six two five. The addend was absorbed, and rounding put the sum back on one.',
      keyword: 'absorbed',
      trap: 'The absorbed addend is not "the hardware rounding 0.0625 down". 0.0625 is exactly halfway between 1.000 and 1.125; the tie rule, not the size of the addend, decided the answer. Change the format to five bits and the same addend survives.' },

    { id: 's2-4', scene: 'align', start: 52.5, end: 60,
      caption: 'One plus one-eighth is 1.125 exactly: the same shape of question, a different exponent gap.',
      detail: 'The exponent difference is now three instead of four, so exactly one bit of the addend lands on the last significand position and the sum is exact. Nothing was rounded. Two sums that look equally innocent differ because of the gap between the exponents, which is why the procedure starts by subtracting exponents rather than by adding significands.',
      narration: 'One plus one eighth is one point one two five exactly. The same shape of question, a different exponent gap.',
      keyword: 'exactly' },

    /* ---------- scene 3: round ---------- */
    { id: 's3-1', scene: 'round', start: 60, end: 67.5,
      caption: 'Rounding asks one question: which of the two neighbours is nearer?',
      detail: 'The exact result falls between two representable numbers. Round to nearest picks the nearer one. That is the whole rule, and it is why the gap between neighbours — the unit in the last place — is the natural unit for every error bound in this topic.',
      narration: 'Rounding asks one question. Which of the two neighbours is nearer?',
      keyword: 'which of the two neighbours' },

    { id: 's3-2', scene: 'round', start: 67.5, end: 75,
      caption: '1.0625 is a tie, and ties go to the even last digit, so it becomes 1.000 and not 1.125.',
      detail: 'Exactly halfway, the standard breaks the tie by choosing the neighbour whose last significand bit is zero. 1.000 ends in zero and 1.125 ends in one, so 1.000 wins. The rule is not arbitrary: over many ties it rounds up and down equally often, so the errors cancel instead of accumulating in one direction.',
      narration: 'One point zero six two five is a tie, and ties go to the even last digit, so it becomes one point zero zero zero.',
      keyword: 'ties go to the even last digit',
      trap: 'Half-up, the rule most people carry over from school arithmetic, is not the default in IEEE binary. Under half-up the tie would go to 1.125. Only decimal formats require ties-away-from-zero, and even there it is not the recommended default.' },

    { id: 's3-3', scene: 'round', start: 75, end: 82.5,
      caption: 'Above the halfway point it goes up: 1.09375 becomes 1.125. Below it, down: 1.03125 becomes 1.000.',
      detail: 'The two cases are the same rule applied to values that are not ties. 1.09375 is 1.00011 in binary, which is past the half; 1.03125 is 1.00001, which is short of it. Notice that the answer is decided by the bits after the last stored one, and nothing else.',
      narration: 'Above the halfway point it goes up. One point zero nine three seven five becomes one point one two five. Below it, down.',
      keyword: 'above the halfway point' },

    { id: 's3-4', scene: 'round', start: 82.5, end: 90,
      caption: 'Five modes, one question: nearest ties to even, nearest ties away, toward zero, toward plus infinity, toward minus infinity.',
      detail: 'The first is the required default; the second is required only for decimal; the three directed modes are for interval arithmetic and for proving bounds. A question that says "with rounding" without naming a mode means nearest ties to even, because that is the default the standard requires. A question that says "truncation" means toward zero, and that is a different answer whenever the value is negative.',
      narration: 'Five modes, one question. Nearest ties to even, nearest ties away, toward zero, toward plus infinity, toward minus infinity.',
      keyword: 'five modes' },

    /* ---------- scene 4: guard ---------- */
    { id: 's4-1', scene: 'guard', start: 90, end: 97.5,
      caption: 'Two minus 1.75 in three significand bits: align, and the last bit of 1.75 falls off the end.',
      detail: 'Both numbers are exact in the format: 2 is 1.00 times two to the one, and 1.75 is 1.11 times two to the zero. Aligning puts 1.75 at 0.111 times two to the one, which needs one more fraction bit than the three-bit format has, so its final one is dropped before the subtraction begins.',
      narration: 'Two minus one point seven five in three significand bits. Align, and the last bit of one point seven five falls off the end.',
      keyword: 'falls off the end' },

    { id: 's4-2', scene: 'guard', start: 97.5, end: 105,
      caption: 'Without a guard bit the answer is 0.5. The true answer is 0.25, so the error is one hundred per cent.',
      detail: 'Dropping that one changed the subtrahend from 1.75 to 1.5, and 2 minus 1.5 is 0.5. Subtraction of nearly equal numbers is the case that punishes a narrow alignment, because the leading bits cancel and the surviving bits are the ones that were nearly lost. This is the example every computer-arithmetic course uses, and it is why the hardware keeps extra positions.',
      narration: 'Without a guard bit the answer is nought point five. The true answer is nought point two five, so the error is one hundred per cent.',
      keyword: 'one hundred per cent',
      trap: 'The failure is in the alignment, before the subtraction, and it survives any rounding rule you apply afterwards. Changing the rounding mode does not fix it; adding a bit does.' },

    { id: 's4-3', scene: 'guard', start: 105, end: 112.5,
      caption: 'One guard bit is enough: with it the answer is 0.25 exactly, and the error is zero.',
      detail: 'The guard bit carries the dropped one through the subtraction, so the difference comes out exact. Hardware in practice keeps three positions beyond the significand — guard, round and sticky — which is what makes the one-rounding promise affordable rather than merely aspirational.',
      narration: 'One guard bit is enough. With it the answer is nought point two five exactly, and the error is zero.',
      keyword: 'exactly' },

    { id: 's4-4', scene: 'guard', start: 112.5, end: 120,
      caption: 'The sticky bit is the memory of everything shifted out: one if any of it was non-zero.',
      detail: 'The guard bit holds the first dropped bit and the round bit the second; the sticky bit is a single bit that records whether anything beyond those two was non-zero. Without it, two sums that differ far below the round position would round identically, and the hardware could not deliver a correctly rounded result.',
      narration: 'The sticky bit is the memory of everything shifted out. One if any of it was non zero.',
      keyword: 'sticky bit' },

    /* ---------- scene 5: tenth ---------- */
    { id: 's5-1', scene: 'tenth', start: 120, end: 127.5,
      caption: 'One tenth in binary is a repeating fraction, so the stored double is not one tenth.',
      detail: 'The decimal 0.1 is one over ten, and ten has a factor of five, which is not a power of two, so its binary expansion never terminates. The double nearest to 0.1 is 0.1000000000000000055511151231257827. Every later surprise in this scene is that residue being carried along.',
      narration: 'One tenth in binary is a repeating fraction, so the stored double is not one tenth.',
      keyword: 'repeating fraction' },

    { id: 's5-2', scene: 'tenth', start: 127.5, end: 135,
      caption: 'The two stored doubles add to a value one unit in the last place above the double nearest 0.3.',
      detail: 'Adding the two nearest doubles to 0.1 and 0.2 gives a value slightly above 0.3: 0.3000000000000000444089209850062616. The nearest double to 0.3 is 0.2999999999999999888977697537484346. The two differ by one step of the 53-bit grid, and the sum rounds to the upper of the two, which is why the printed answer has a four on the end.',
      narration: 'The two stored doubles add to a value one unit in the last place above the double nearest nought point three.',
      keyword: 'one unit in the last place' },

    { id: 's5-3', scene: 'tenth', start: 135, end: 142.5,
      caption: 'The residue is exactly two to the minus fifty-four: one bit, not a rounding accident.',
      detail: 'The difference between the computed sum and the stored 0.3 is 5.551115123125783 times ten to the minus seventeen, which is 2 to the minus 54. It is a single unit in the last place of the sum, because the sum landed one grid point above 0.3. Nothing unpredictable happened; the arithmetic did exactly what the standard requires.',
      narration: 'The residue is exactly two to the minus fifty four. One bit, not a rounding accident.',
      keyword: 'two to the minus fifty-four' },

    { id: 's5-4', scene: 'tenth', start: 142.5, end: 150,
      caption: 'In single precision the same three numbers are stored with only 24 bits, and the printed digits change.',
      detail: 'Single precision stores 0.1 as 0x3DCCCCCD and 0.3 as 0x3ECCCCCD, and the sum is 0.30000001192092896 when printed as a double. The phenomenon is identical at both widths; only the size of the residue changes, from about 5.6 times ten to the minus seventeen to about 1.2 times ten to the minus eight.',
      narration: 'In single precision the same three numbers are stored with only twenty four bits, and the printed digits change.',
      keyword: 'only 24 bits' },

    /* ---------- scene 6: cancel ---------- */
    { id: 's6-1', scene: 'cancel', start: 150, end: 157.5,
      caption: 'Ten to the eight plus one, in single precision, is ten to the eight: the one has nowhere to go.',
      detail: 'In single precision the spacing near ten to the eight is eight, because the exponent is 26 and the significand has 24 bits, so the gap is two to the 26 minus 23, which is eight. One is an eighth of a gap, so the sum rounds back to where it started. The information was destroyed on the way in, before any subtraction.',
      narration: 'Ten to the eight plus one, in single precision, is ten to the eight. The one has nowhere to go.',
      keyword: 'nowhere to go' },

    { id: 's6-2', scene: 'cancel', start: 157.5, end: 165,
      caption: 'Subtracting ten to the eight then gives zero, although the true answer is one.',
      detail: 'Each of the two operations was correctly rounded, and the composition is wrong by the whole of the answer. This is the definition of catastrophic cancellation: the operands agree in their leading digits, the subtraction removes them, and what remains is amplified error rather than signal.',
      narration: 'Subtracting ten to the eight then gives zero, although the true answer is one.',
      keyword: 'catastrophic cancellation' },

    { id: 's6-3', scene: 'cancel', start: 165, end: 172.5,
      caption: 'The quadratic formula has the same disease: the small root of x squared plus ten to the eight x plus one.',
      detail: 'The two roots are about minus ten to the eight and minus ten to the minus eight. The textbook formula computes the small root as minus b plus the square root of the discriminant, all over two, and that numerator is a difference of two nearly equal numbers of size ten to the eight. In double precision the spacing at ten to the eight is 1.49 times ten to the minus eight, so the numerator has almost no significant digits left.',
      narration: 'The quadratic formula has the same disease. The small root of x squared plus ten to the eight x plus one.',
      keyword: 'the same disease' },

    { id: 's6-4', scene: 'cancel', start: 172.5, end: 180,
      caption: 'The naive formula gives minus 7.45 times ten to the minus nine; the rearranged form gives the true minus ten to the minus eight.',
      detail: 'The stable form computes the large root first, where no cancellation occurs, and then gets the small root from the product of the roots, c over the large root. The error in the naive answer is about twenty-five per cent, and it is not a bug in the hardware: it is a formula that subtracts nearly equal numbers, rewritten so that it does not.',
      narration: 'The naive formula gives minus seven point four five times ten to the minus nine. The rearranged form gives the true minus ten to the minus eight.',
      keyword: 'twenty-five per cent' },

    /* ---------- scene 7: order ---------- */
    { id: 's7-1', scene: 'order', start: 180, end: 187.5,
      caption: 'GATE 2004 asked this exact question in three-digit decimal arithmetic: two groupings, two answers.',
      detail: 'The paper gives the two expressions (113 + -111) + 7.51 and 113 + (-111 + 7.51), to be evaluated in three-digit floating-point arithmetic with rounding. It is the cleanest statement of the topic ever put on a GATE paper, because decimal digits make the alignment visible without binary conversions.',
      narration: 'GATE two thousand and four asked this exact question in three digit decimal arithmetic. Two groupings, two answers.',
      keyword: 'two groupings, two answers' },

    { id: 's7-2', scene: 'order', start: 187.5, end: 195,
      caption: 'Left grouping: 113 minus 111 is 2, and 2 plus 7.51 is 9.51. Nothing was lost.',
      detail: 'The first subtraction is exact in three digits because the result, 2.00, is far from both operands and the operands agree only in their leading digits, which is the benign case. The addition that follows has an exponent gap of zero, so it is exact too. The answer is 9.51.',
      narration: 'Left grouping. One hundred and thirteen minus one hundred and eleven is two, and two plus seven point five one is nine point five one.',
      keyword: '9.51' },

    { id: 's7-3', scene: 'order', start: 195, end: 202.5,
      caption: 'Right grouping: minus 111 plus 7.51 needs three digits to hold 103, so 7.51 is first cut to 8.00.',
      detail: 'The exponent gap is two, so the smaller operand must be squeezed into the three digits available at the larger exponent: 0.0751 times ten squared becomes 0.08 times ten squared. The sum is minus 103.0, and 113 minus 103 is 10.0. The same three numbers, a different order, a different last digit.',
      narration: 'Right grouping. Minus one hundred and eleven plus seven point five one needs three digits to hold one hundred and three, so seven point five one is first cut to eight.',
      keyword: 'cut to 8.00',
      trap: 'The answer is 9.51 and 10.0, in that order, which is option A on the paper. Both groupings are correctly rounded at every step; the difference comes from where the alignment happened, not from an arithmetic slip.' },

    { id: 's7-4', scene: 'order', start: 202.5, end: 210,
      caption: 'In double precision the same non-associativity survives: 0.6000000000000001 against 0.6.',
      detail: 'Adding 0.1 and 0.2 first and then 0.3 gives 0.6000000000000001; adding 0.2 and 0.3 first gives exactly the double nearest 0.6. Summing one tenth a million times without compensation leaves an error of 1.33 times ten to the minus six, and the same sum with one compensation term, Kahan summation, is exact. Addition is commutative here and not associative, and only the second fact costs marks.',
      narration: 'In double precision the same non associativity survives. Nought point six zero zero zero zero zero zero zero zero zero zero zero one against nought point six.',
      keyword: 'not associative' },

    /* ---------- scene 8: multiply ---------- */
    { id: 's8-1', scene: 'multiply', start: 210, end: 217.5,
      caption: 'Multiplication has no alignment step: multiply the significands and add the exponent fields.',
      detail: 'There is nothing to align, because the product of two significands in the range from one to two lies between one and four, and a single normalisation shift puts it back. The stored exponents add, and the bias is subtracted once because it was counted twice.',
      narration: 'Multiplication has no alignment step. Multiply the significands and add the exponent fields.',
      keyword: 'no alignment step' },

    { id: 's8-2', scene: 'multiply', start: 217.5, end: 225,
      caption: 'Minus sixteen times 0.86009145: exponent fields 131 and 126 add to 257, minus 127 is 130, and the product is minus 13.761463.',
      detail: 'The two hex values are 0xC1800000 and 0x3F5C2EF4. Their exponent fields are 131 and 126, so the product field is 131 plus 126 minus 127, which is 130, or 0x82. The significands multiply to about 1.72, and the product re-encodes as 0xC15C2EF4. GATE CSE 2023 Q45 asked exactly this operation on exactly these two registers.',
      narration: 'Minus sixteen times nought point eight six zero zero nine one four five. Exponent fields one hundred and thirty one and one hundred and twenty six add to two hundred and fifty seven, minus one hundred and twenty seven is one hundred and thirty.',
      keyword: 'minus 127' },

    { id: 's8-3', scene: 'multiply', start: 225, end: 232.5,
      caption: 'Division subtracts the fields and adds the bias back; the significands divide and are rounded once.',
      detail: 'The mirror image of multiplication, with the bias handled the other way. One rounding at the end, as everywhere in the standard. What changes between the two operations is only how the exponent arithmetic is arranged, which is why a question about either one is really a question about the bias.',
      narration: 'Division subtracts the fields and adds the bias back. The significands divide and are rounded once.',
      keyword: 'adds the bias back' },

    { id: 's8-4', scene: 'multiply', start: 232.5, end: 240,
      caption: 'At the ends of the range the answer is infinity or zero: ten to the thirty-eight times ten overflows a single.',
      detail: 'The largest finite single is about 3.4 times ten to the thirty-eight, and multiplying it by ten gives positive infinity under round to nearest, with no trap by default. In the other direction, ten to the minus thirty-eight divided by ten to the eight underflows to zero, because the result is below the smallest denormal. Neither is an error condition a program sees unless it asks.',
      narration: 'At the ends of the range the answer is infinity or zero. Ten to the thirty eight times ten overflows a single.',
      keyword: 'infinity or zero' },

    /* ---------- scene 9: precision ---------- */
    { id: 's9-1', scene: 'precision', start: 240, end: 247.5,
      caption: 'Twenty-four significand bits is about seven decimal digits; fifty-three bits is about sixteen.',
      detail: 'The conversion is the logarithm to base ten of two to the p, which is p times 0.30103. For p equal to 24 that is 7.22 digits, and for p equal to 53 it is 15.95. The rule of thumb — seven and sixteen — comes from that multiplication, not from a guess about how many digits look nice.',
      narration: 'Twenty four significand bits is about seven decimal digits. Fifty three bits is about sixteen.',
      keyword: 'seven and sixteen' },

    { id: 's9-2', scene: 'precision', start: 247.5, end: 255,
      caption: 'Every integer up to two to the twenty-four is exact in a float, and 16777217 is not one of them.',
      detail: 'Two to the twenty-four is 16777216. Beyond it the spacing reaches one, so the next integer cannot be represented and rounds to its neighbour: in single precision 16777217 stores as 16777216. In double the same boundary is two to the fifty-three, 9007199254740992, which is why a 64-bit integer identifier can lose its last digit when it travels as a JSON number.',
      narration: 'Every integer up to two to the twenty four is exact in a float, and sixteen million seven hundred and seventy seven thousand two hundred and seventeen is not one of them.',
      keyword: '16777217 is not one of them' },

    { id: 's9-3', scene: 'precision', start: 255, end: 262.5,
      caption: 'GATE 2025 Set 2 gave three registers: minus 9, 6 and 12. GATE 2026 Set 1 gave a sum.',
      detail: 'The 2025 registers decode to minus 9, 6 and 12, so every relation among them can be settled by hand once the decoding is right. The 2026 Set 1 question gives X as 0x35C00000, which is 1.5 times two to the minus 20, and Y as 0x34A00000, which is 1.25 times two to the minus 22; the sum is 1.8125 times two to the minus 20, and re-encodes as 0x35E80000.',
      narration: 'GATE twenty twenty five set two gave three registers. Minus nine, six and twelve. GATE twenty twenty six set one gave a sum.',
      keyword: '0x35E80000' },

    { id: 's9-4', scene: 'precision', start: 262.5, end: 270,
      caption: 'Equality between floats is a question about bits, so compare with a tolerance and say what the tolerance is.',
      detail: 'Two computations that should give the same real number usually give neighbouring doubles. Testing equality asks whether the bits match, which is almost never what the program means. A tolerance compares magnitudes, and the choice between an absolute and a relative tolerance is the same question as the choice between a fixed-point and a floating-point format.',
      narration: 'Equality between floats is a question about bits, so compare with a tolerance and say what the tolerance is.',
      keyword: 'a question about bits' },

    /* ---------- scene 10: procedure ---------- */
    { id: 's10-1', scene: 'procedure', start: 270, end: 277.5,
      caption: 'Step one: write both operands with their exponent and significand, and subtract the exponents.',
      detail: 'The exponent difference decides everything that follows: it is the number of positions the smaller significand will be shifted, and therefore the number of bits that can be lost. Doing this first turns a vague worry about precision into a count.',
      narration: 'Step one. Write both operands with their exponent and significand, and subtract the exponents.',
      keyword: 'subtract the exponents' },

    { id: 's10-2', scene: 'procedure', start: 277.5, end: 285,
      caption: 'Step two: shift, add, and keep a guard and a sticky bit; step three: normalise and round once.',
      detail: 'The guard bit protects the subtraction case, the sticky bit records what fell off, and the single rounding at the end is what the standard promises. A step that rounds twice is the commonest way for a hand calculation to disagree with the machine.',
      narration: 'Step two. Shift, add, and keep a guard and a sticky bit. Step three. Normalise and round once.',
      keyword: 'round once' },

    { id: 's10-3', scene: 'procedure', start: 285, end: 292.5,
      caption: 'Step four: re-encode and check the regime — normal, denormal, infinity, not-a-number.',
      detail: 'An exponent field of all ones is infinity or not-a-number, an all-zero field is the denormal regime, and an exponent that leaves the range is overflow or underflow. Most of the marks lost on these questions are lost here, after the arithmetic was right.',
      narration: 'Step four. Re-encode and check the regime. Normal, denormal, infinity, not a number.',
      keyword: 'check the regime' },

    { id: 's10-4', scene: 'procedure', start: 292.5, end: 300,
      caption: 'The four traps: bias 127 not 128, the hidden one, one rounding per operation, and the sign of the exponent.',
      detail: 'The bias is two to the k minus one minus one, which is 127 and 1023. The leading one is not stored and must be put back when decoding. Rounding happens per operation, never once at the end of a chain. And the sign bit belongs to the number, not to the exponent, so a negative number can have a positive exponent.',
      narration: 'The four traps. Bias one hundred and twenty seven not one hundred and twenty eight. The hidden one. One rounding per operation. And the sign of the exponent.',
      keyword: 'the four traps',
      trap: 'A fifth trap hides inside the fourth: an exponent field of 255 with a non-zero fraction is not a number, not infinity. Any question that offers "the largest number" usually has that option waiting.' }
  ]
};
