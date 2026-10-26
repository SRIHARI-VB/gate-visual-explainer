/* ==========================================================================
   number-representation-and-arithmetic — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs — never edited by hand.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'fixedpoint',
      n: 1,
      title: 'A fixed point is a scale, and the scale is the whole story',
      start: 0, end: 30,
      objective: 'Read an n-bit fixed-point number with f fraction bits as a sum of weights, and state its range and its step from n and f alone.'
    },
    {
      id: 'encodings',
      n: 2,
      title: 'Three ways to write a negative, and two of them have two zeros',
      start: 30, end: 60,
      objective: 'Encode a negative number in sign-magnitude, ones\' complement and two\'s complement, and count the distinct integers each one reaches.'
    },
    {
      id: 'twoswheel',
      n: 3,
      title: "Two's complement as a wheel: negation is a mirror",
      start: 60, end: 90,
      objective: 'Justify the range -2^(n-1) to 2^(n-1)-1 from the wheel, see why one pattern is its own negation, and use sign extension correctly.'
    },
    {
      id: 'addition',
      n: 4,
      title: 'One adder does addition and subtraction',
      start: 90, end: 120,
      objective: 'Add and subtract in two\'s complement with the same circuit, discarding the final carry, and negate a bit pattern in one pass.'
    },
    {
      id: 'flags',
      n: 5,
      title: 'Carry and overflow are different questions',
      start: 120, end: 150,
      objective: 'Separate the carry flag from the overflow flag, use carry-in against carry-out of the sign column, and read which one a question is asking about.'
    },
    {
      id: 'scientific',
      n: 6,
      title: 'From scientific notation to a floating-point field',
      start: 150, end: 180,
      objective: 'Normalise a binary number, see why the leading one is not stored, and see what the exponent bias does besides removing a sign bit.'
    },
    {
      id: 'ieee',
      n: 7,
      title: 'The 32 bits of a single, decoded and encoded',
      start: 180, end: 210,
      objective: 'Decode S, E, F into a decimal value and encode a decimal value back into 32 bits, on two questions taken from past papers.'
    },
    {
      id: 'numberline',
      n: 8,
      title: 'The whole IEEE number line: denormals, zero, infinity, NaN',
      start: 210, end: 240,
      objective: 'Read the four exponent regimes, name the extremes of single precision, and say what E = 0 and E = 255 mean.'
    },
    {
      id: 'precision',
      n: 9,
      title: '24 bits of precision, and what it costs',
      start: 240, end: 270,
      objective: 'Separate precision from range, compute an ulp, explain inexact decimals and absorbed additions, and know the rounding rule.'
    },
    {
      id: 'procedure',
      n: 10,
      title: 'The procedure and the four traps',
      start: 270, end: 300,
      objective: 'Run a fixed decode-or-encode procedure under time pressure, and recognise the four errors that cost marks in this topic.'
    }
  ],

  events: [
    /* ---------------- scene 1: fixed point ---------------- */
    {
      id: 'fp-1', start: 0, end: 7, scene: 'fixedpoint',
      caption: 'A fixed-point number keeps the binary point in one place: n bits with f of them after the point leave i = n − f before it.',
      detail: 'Fixed point is the simplest representation of a real number: a field of bits with an agreed scale. The scale is a convention, not part of the bits, so the same 10110110 is 182 as an unsigned integer, 11.375 as an 8-bit fixed-point number with 3 fraction bits, and −74 as an 8-bit two\'s complement integer. The question must tell you which reading it wants.',
      keyword: 'the binary point in one place',
      trap: 'Nothing in the bits tells you where the point is. If a question gives you a bit string without a scale, it is asking for the integer reading.',
      narration: 'A fixed-point number keeps the binary point in one place. n bits with f of them after the point leave n minus f before it.'
    },
    {
      id: 'fp-2', start: 7, end: 15, scene: 'fixedpoint',
      caption: 'Each position carries a weight. With 8 bits and 3 fraction bits the weights run from 2⁴ = 16 down to 2⁻³ = 0.125.',
      detail: 'The value is the sum of the weights where a one sits. Reading 10110.110: 16 + 4 + 2 + 0.5 + 0.25 = 22.75. The integer part uses the ordinary unsigned weights 2^(i−1) down to 2^0, and the fraction uses 2^(−1) down to 2^(−f). No new arithmetic is needed — only a new set of weights.',
      keyword: 'Each position carries a weight',
      trap: null,
      narration: 'Each position carries a weight. With eight bits and three fraction bits the weights run from sixteen down to one eighth.'
    },
    {
      id: 'fp-3', start: 15, end: 23, scene: 'fixedpoint',
      caption: 'So the largest value is 2⁵ − 2⁻³ = 31.875 and the smallest step is 2⁻³ = 0.125. The step is the resolution.',
      detail: 'Two numbers closer together than the step cannot be told apart, however carefully you read the bits. Adding fraction bits makes the step smaller and the largest value smaller at the same time: for a fixed total width n, more precision means less range. That trade is the reason floating point exists, and it is the subject of scene six.',
      keyword: 'the smallest step',
      trap: null,
      narration: 'So the largest value is 31.875 and the smallest step is 0.125. That step is the resolution.'
    },
    {
      id: 'fp-4', start: 23, end: 30, scene: 'fixedpoint',
      caption: 'The range is 0 to 2ⁱ − 2⁻ᶠ, not 0 to 2ⁱ, because the largest pattern is all ones and stops one step short.',
      detail: 'GATE CSE 2017 Set 1, Q7 asks for exactly this range for an n-bit unsigned fixed-point number with f fraction bits, writing i = n − f. The answer is 0 to 2^i − 2^−f. The tempting wrong answer, 2^i, is the bound of the integer part alone; it is not attainable, because the fraction bits would all have to be ones and the point cannot be reached.',
      keyword: 'stops one step short',
      trap: 'The upper bound is a value the format cannot hold. Writing 2^i as the maximum is the most common wrong option in this question.',
      narration: 'The range is zero to two to the i minus two to the minus f, not two to the i, because the largest pattern stops one step short.'
    },

    /* ---------------- scene 2: the three encodings ---------------- */
    {
      id: 'en-1', start: 30, end: 37, scene: 'encodings',
      caption: 'Sign-magnitude spends the leftmost bit on the sign and keeps the other n − 1 bits as the magnitude: −5 in four bits is 1101.',
      detail: 'The sign bit is 0 for positive and 1 for negative, and the remaining bits are the ordinary unsigned magnitude. Reading it back is two separate steps: take the sign, then read the magnitude. Addition cannot be done directly in this form, because the adder would have to compare magnitudes and decide the sign first.',
      keyword: 'spends the leftmost bit on the sign',
      trap: null,
      narration: 'Sign-magnitude spends the leftmost bit on the sign and keeps the rest as the magnitude. Minus five in four bits is one one zero one.'
    },
    {
      id: 'en-2', start: 37, end: 45, scene: 'encodings',
      caption: "One's complement stores the negation as the bitwise complement. Two's complement complements and then adds one.",
      detail: 'So in four bits, +5 is 0101, −5 is 1010 in ones\' complement and 1011 in two\'s complement. The extra one in two\'s complement is what removes the second zero, and it is also what lets one adder handle both signs: adding the complement of B to A gives A − B without any sign logic.',
      keyword: 'complements and then adds one',
      trap: null,
      narration: "One's complement stores the negation as the bitwise complement. Two's complement complements and then adds one."
    },
    {
      id: 'en-3', start: 45, end: 52, scene: 'encodings',
      caption: "Two of the three have two bit patterns for zero: 0000 and 1000 in sign-magnitude, 0000 and 1111 in one's complement.",
      detail: 'Two\'s complement has only 0000, because complementing 0000 and adding one gives 0000 again. A duplicated zero wastes a pattern, and it also makes comparison awkward: a machine would have to test for both patterns before deciding that a value is zero.',
      keyword: 'two bit patterns for zero',
      trap: null,
      narration: "Two of the three have two patterns for zero: zero zero zero zero and one zero zero zero in sign-magnitude, zero zero zero zero and one one one one in one's complement."
    },
    {
      id: 'en-4', start: 52, end: 60, scene: 'encodings',
      caption: 'So n bits give 2ⁿ distinct integers in two’s complement and only 2ⁿ − 1 in the other two. GATE 2016 Set 2 asks for the difference: 1.',
      detail: 'The wasted pattern costs exactly one value, so X − Y = 2^n − (2^n − 1) = 1, for every width. Sign-magnitude and ones\' complement also both lose the value −2^(n−1): their most negative number is −(2^(n−1) − 1). That is the second half of the same fact.',
      keyword: '2ⁿ − 1 in the other two',
      trap: 'The answer 1 is independent of n. If you compute it for n = 16 and get 1, you are right, but be ready to say why it cannot depend on the width.',
      narration: 'So n bits give two to the n distinct integers in two\'s complement and only one fewer in the other two. GATE 2016 Set 2 asks for the difference, and it is one.'
    },

    /* ---------------- scene 3: the wheel ---------------- */
    {
      id: 'tw-1', start: 60, end: 68, scene: 'twoswheel',
      caption: 'All sixteen four-bit patterns sit on a wheel in counting order. Two’s complement value is the unsigned value minus 16 once the top bit is set.',
      detail: 'That single rule replaces the table: read the pattern as unsigned, and subtract 2^n if the top bit is 1. Equivalently, the top bit carries weight −2^(n−1) instead of +2^(n−1), and every other bit keeps its ordinary weight. Both readings give the same answer on all 2^n patterns, which is what the page checks exhaustively.',
      keyword: 'the unsigned value minus 16',
      trap: null,
      narration: 'All sixteen four-bit patterns sit on a wheel in counting order. The two\'s complement value is the unsigned value minus sixteen once the top bit is set.'
    },
    {
      id: 'tw-2', start: 68, end: 76, scene: 'twoswheel',
      caption: 'Negation is a mirror: flip every bit and add one. 0101 is 5, so 1011 is −5 — and doing it twice returns 0101.',
      detail: 'The mirror has a geometric meaning on the wheel: negating a pattern reflects it through the point opposite zero, so the arithmetic on the wheel is arithmetic modulo 2^n. This is why addition needs no sign logic: the pattern arithmetic is already correct, and only the flag logic has to know about signs.',
      keyword: 'flip every bit and add one',
      trap: null,
      narration: 'Negation is a mirror: flip every bit and add one. Zero one zero one is five, so one zero one one is minus five, and doing it twice returns zero one zero one.'
    },
    {
      id: 'tw-3', start: 76, end: 84, scene: 'twoswheel',
      caption: 'One pattern is its own negation: 1000 is −8, and negating it gives 1000 again. That is why the range is lopsided.',
      detail: 'With 2^n patterns and a single zero, an even number of values cannot split evenly between positive and negative. So the negatives take one more: −2^(n−1) up to 2^(n−1) − 1. For eight bits that is −128 to 127, and GATE CSE 2013 Q4 asks for the smallest of these, which is −128.',
      keyword: 'its own negation',
      trap: 'A question that asks for the smallest n-bit two’s complement integer wants −2^(n−1), not −(2^(n−1) − 1). The latter is the sign-magnitude answer.',
      narration: 'One pattern is its own negation: one zero zero zero is minus eight, and negating it gives one zero zero zero again. That is why the range is lopsided.'
    },
    {
      id: 'tw-4', start: 84, end: 90, scene: 'twoswheel',
      caption: 'Widening a word copies the sign bit leftwards. −28 in sixteen bits is 1111 1111 1110 0100, not 0000 0000 1110 0100.',
      detail: 'Sign extension keeps the value, and it is checked here for every pattern from width two to width eight, extended all the way to sixteen. Zero padding is only correct for unsigned numbers. GATE CSE 2019 Q4 is this exact conversion: +28 is 0000 0000 0001 1100, complement to 1111 1111 1110 0011, add one to reach 1111 1111 1110 0100.',
      keyword: 'copies the sign bit leftwards',
      trap: 'The wrong option in the 2019 question, 0000 0000 1110 0100, is the eight-bit answer zero-padded. Sign extension is the fix.',
      narration: 'Widening a word copies the sign bit leftwards. Minus twenty-eight in sixteen bits is all ones then one one one zero zero one zero zero.'
    },

    /* ---------------- scene 4: addition and subtraction ---------------- */
    {
      id: 'ad-1', start: 90, end: 98, scene: 'addition',
      caption: 'The adder does not know about signs. It adds bit patterns column by column and throws away the carry out of the top column.',
      detail: 'For unsigned numbers that carry out is the overflow indication and must be kept. For signed numbers it is discarded, because the arithmetic is modulo 2^n and the discarded carry is exactly the 2^n that the modulo removes. The same wire is therefore useful in one reading and meaningless in the other.',
      keyword: 'throws away the carry',
      trap: null,
      narration: 'The adder does not know about signs. It adds bit patterns column by column and throws away the carry out of the top column.'
    },
    {
      id: 'ad-2', start: 98, end: 106, scene: 'addition',
      caption: 'Subtraction is addition of the negation: A − B is computed as A plus the complement of B plus one, so one adder and a row of inverters do both jobs.',
      detail: 'The inverters are switched by the subtract control line, and the same line feeds the carry-in, which supplies the plus one. That is why a two\'s complement machine needs no separate subtractor. The page checks this identity over every pair of four-bit values: the pattern arithmetic is exact whenever the mathematical result is representable.',
      keyword: 'addition of the negation',
      trap: 'Subtracting the most negative value raises a spurious overflow, because its negation cannot be formed in n bits. It is the one exception, and the page finds it by search rather than by assumption.',
      narration: 'Subtraction is addition of the negation: A minus B is A plus the complement of B plus one. One adder and a row of inverters do both jobs.'
    },
    {
      id: 'ad-3', start: 106, end: 114, scene: 'addition',
      caption: 'Worked: 1111 1111 1111 0101 in sixteen bits. Invert to 0000 0000 0000 1010, add one to get 1011 = 11, so the value is −11.',
      detail: 'This is GATE CSE 2016 Set 1, Q7, a one-mark numerical question. The negative sign is not a separate step to remember: because the top bit was 1, the magnitude you recover by complementing is the magnitude of a negative number. Reading the same bits as unsigned would give 65525, which is the answer to a different question.',
      keyword: 'so the value is −11',
      trap: null,
      narration: 'Worked: the sixteen-bit pattern all ones then one one one one zero one zero one. Invert, add one, and the magnitude is eleven, so the value is minus eleven.'
    },
    {
      id: 'ad-4', start: 114, end: 120, scene: 'addition',
      caption: 'The one-pass shortcut: copy the bits up to and including the rightmost 1, then invert everything to its left. Same answer, one sweep.',
      detail: 'Both methods are the same statement, since the trailing zeros become ones and then carry back to zeros. The shortcut is worth having under time pressure: for 1111 1111 1111 0101 the rightmost one is the last bit, so nothing is copied, everything to its left inverts, and the magnitude 1011 appears immediately.',
      keyword: 'the rightmost 1',
      trap: null,
      narration: 'The one-pass shortcut: copy the bits up to and including the rightmost one, then invert everything to its left.'
    },

    /* ---------------- scene 5: carry and overflow ---------------- */
    {
      id: 'fl-1', start: 120, end: 128, scene: 'flags',
      caption: 'Two flags leave the top of the adder and they answer different questions. The carry out is a fifth bit; it matters only when the operands are unsigned.',
      detail: 'An n-bit adder produces n sum bits and one carry bit. For unsigned numbers the carry is the 2^n column of a genuine sum, so it is information: 200 + 100 in eight bits gives 44 with a carry, and the carry says the true sum was 300. For signed numbers the same event is routine and is discarded.',
      keyword: 'they answer different questions',
      trap: null,
      narration: 'Two flags leave the top of the adder and they answer different questions. The carry out is a fifth bit, and it matters only when the operands are unsigned.'
    },
    {
      id: 'fl-2', start: 128, end: 136, scene: 'flags',
      caption: 'Overflow is about the sign. It happens when two operands of the same sign produce a result of the other sign, and never when the signs differ.',
      detail: 'If the signs differ, the true sum lies between the two operands, so it cannot leave the range. If they agree, the true sum is at least as large in magnitude as either one, and it can leave. That is the whole proof, and it is why adding a positive to a negative can never overflow, however large the operands.',
      keyword: 'about the sign',
      trap: null,
      narration: 'Overflow is about the sign. It happens when two operands of the same sign produce a result of the other sign, and never when the signs differ.'
    },
    {
      id: 'fl-3', start: 136, end: 144, scene: 'flags',
      caption: 'The mechanical test: carry into the sign column exclusive-or carry out of it. Carry out alone is not overflow — adding two negatives always carries out.',
      detail: 'In GATE CSE 2017 Set 1, Q9 the carries are named C7 down to C0, and overflow is C7 exclusive-or C6: the carry into the sign position against the carry out of it. Adding −5 and −3 in four bits carries out of the top column and yet is perfectly representable, which is the cleanest counterexample to the confusion.',
      keyword: 'exclusive-or',
      trap: 'Two negatives that carry out are not overflowing. Check the sign of the result before you blame the carry.',
      narration: 'The mechanical test: carry into the sign column exclusive-or carry out of it. Carry out alone is not overflow, because adding two negatives always carries out.'
    },
    {
      id: 'fl-4', start: 144, end: 150, scene: 'flags',
      caption: 'And overflow can happen with no carry at all: 0111 + 0001 = 1000 is +7 + 1 = −8. Read what the bits mean before choosing a flag.',
      detail: 'Here the carry out is 0 and the answer is wrong for signed arithmetic. The 2026 and 2024 papers both ask overflow questions in this form, in two\'s complement and in sign-magnitude, and in sign-magnitude the test is different again: overflow happens when the magnitude field cannot hold the result. The representation is part of the question.',
      keyword: 'no carry at all',
      trap: 'Sign-magnitude overflow is a magnitude question, not a sign question. The rule for two’s complement does not transfer.',
      narration: 'And overflow can happen with no carry at all: zero one one one plus zero zero zero one gives one zero zero zero, that is seven plus one giving minus eight.'
    },

    /* ---------------- scene 6: scientific to floating ---------------- */
    {
      id: 'sc-1', start: 150, end: 158, scene: 'scientific',
      caption: 'A floating-point number is scientific notation in base two: a sign, a significand with one digit before the point, and an exponent.',
      detail: 'The point is no longer fixed, so the format can cover an enormous range with a fixed number of bits: the exponent moves the point, and the significand says how precisely the position is known. That is the trade the fixed-point scene set up — floating point buys range at the cost of a gap that changes with magnitude.',
      keyword: 'scientific notation in base two',
      trap: null,
      narration: 'A floating-point number is scientific notation in base two: a sign, a significand with one digit before the point, and an exponent.'
    },
    {
      id: 'sc-2', start: 158, end: 166, scene: 'scientific',
      caption: 'Normalising shifts until exactly one 1 sits before the point. That 1 is then always there, so IEEE 754 does not store it.',
      detail: 'Dropping the leading one is why 23 stored fraction bits give 24 bits of precision: the significand is 1.F, with the 1 implied. The cost is that the format cannot represent a significand of zero with a normal exponent, which is why zero and the denormals need a special exponent value — the subject of scene eight.',
      keyword: 'does not store it',
      trap: 'Writing 0.1F as the significand instead of 1.F is the single most common encoding error in this topic. Only the bits after the point are stored.',
      narration: 'Normalising shifts until exactly one one sits before the point. That one is then always there, so IEEE 754 does not store it.'
    },
    {
      id: 'sc-3', start: 166, end: 174, scene: 'scientific',
      caption: 'The exponent is stored with a bias added: e + 127 in single precision, e + 1023 in double. So −3 is stored as 124, and 3 as 130.',
      detail: 'The stored field is an unsigned integer from 0 to 255, and the true exponent is that field minus the bias. Single precision therefore covers exponents −126 to +127 in the normal range, and the field values 0 and 255 are reserved. Double precision uses 11 bits and bias 1023, covering −1022 to +1023.',
      keyword: 'with a bias added',
      trap: 'The bias is 127, not 128, and 1023, not 1024. It is 2^(k−1) − 1 for a k-bit exponent field.',
      narration: 'The exponent is stored with a bias added: e plus one hundred and twenty-seven in single precision. So minus three is stored as one hundred and twenty-four.'
    },
    {
      id: 'sc-4', start: 174, end: 180, scene: 'scientific',
      caption: 'The bias also makes the bit pattern order agree with the numeric order, so two positive floats can be compared as integers.',
      detail: 'A two\'s complement exponent would put every negative exponent above every positive one when read as unsigned. A bias shifts the whole exponent range up so that the unsigned reading increases with the value. This is why hardware can sort floats with an integer comparator, and why a question that asks which of several hex constants is largest can be answered without decoding any of them.',
      keyword: 'compared as integers',
      trap: 'For negative numbers the order reverses, because the sign bit is the top bit. Only same-sign comparisons are a plain integer comparison.',
      narration: 'The bias also makes the bit pattern order agree with the numeric order, so two positive floats can be compared as integers.'
    },

    /* ---------------- scene 7: IEEE single ---------------- */
    {
      id: 'ie-1', start: 180, end: 188, scene: 'ieee',
      caption: 'Single precision is 32 bits: 1 sign, 8 exponent, 23 fraction. Double is 64 bits: 1, 11, 52. Biases 127 and 1023.',
      detail: 'The value of a normal single is (−1)^S × 1.F × 2^(E−127), where 1.F means the binary number one point F. Every decode in this lesson is that one formula, and every encode is its inverse. The field widths are fixed by IEEE 754-1985 and unchanged in IEEE 754-2019.',
      keyword: '1 sign, 8 exponent, 23 fraction',
      trap: null,
      narration: 'Single precision is thirty-two bits: one sign, eight exponent, twenty-three fraction. Double is sixty-four bits: one, eleven, fifty-two.'
    },
    {
      id: 'ie-2', start: 188, end: 196, scene: 'ieee',
      caption: 'Decode S=1, E=10000001, F=1111 then zeros. E is 129, so the exponent is 2; the significand is 1.1111 = 1.9375; the value is −7.75.',
      detail: 'This is GATE CSE 2021 Set 1, Q24, and the answer key gives −7.75. Three steps carry all the marks: E as a decimal, E minus the bias, and the significand as a sum of halves. Note that 1.1111 is not 1.1111 in decimal — it is 1 + 1/2 + 1/4 + 1/8 + 1/16.',
      keyword: 'the value is −7.75',
      trap: 'Reading F as a decimal fraction, or forgetting to subtract the bias, are the two ways to lose this one. E = 129 is the stored field, not the exponent.',
      narration: 'Decode: sign one, exponent field one zero zero zero zero zero zero one, fraction one one one one. The exponent is two, the significand is one point nine three seven five, so the value is minus seven point seven five.'
    },
    {
      id: 'ie-3', start: 196, end: 204, scene: 'ieee',
      caption: 'Encode −14.25: binary 1110.01, normalised 1.11001 × 2³, exponent field 130, fraction 11001 then zeros, sign 1 — giving 0xC1640000.',
      detail: 'This is GATE CSE 2014 Set 2, Q45, whose key is C1640000H. The exponent is +3 because the point moved three places left, and the stored field is 3 + 127 = 130 = 10000010. Grouping the 32 bits into four-bit nibbles gives C, 1, 6, 4, 0, 0, 0, 0.',
      keyword: '0xC1640000',
      trap: 'The sign of the exponent follows the direction the point moved, not the sign of the number. −14.25 has a positive exponent and a negative sign bit.',
      narration: 'Encode minus fourteen point two five: binary one one one zero point zero one, normalised one point one one zero zero one times two cubed. Exponent field one hundred and thirty, and the result is C one six four zero zero zero zero.'
    },
    {
      id: 'ie-4', start: 204, end: 210, scene: 'ieee',
      caption: 'Both questions are the same four steps: sign, exponent field, significand, multiply. Learn the four steps, not the two answers.',
      detail: 'Decoding and encoding are inverses, and both are mechanical. What varies between questions is the presentation: a bit string, three named fields, or a hexadecimal constant. Converting a hex constant to bits is a fixed four-bits-per-digit expansion, and nothing else changes.',
      keyword: 'the same four steps',
      trap: null,
      narration: 'Both questions are the same four steps: sign, exponent field, significand, multiply. Learn the four steps, not the two answers.'
    },

    /* ---------------- scene 8: the number line ---------------- */
    {
      id: 'nl-1', start: 210, end: 218, scene: 'numberline',
      caption: 'The exponent field splits the line into four regimes. E from 1 to 254 is a normal number; E = 0 is the denormal regime; E = 255 is infinity or NaN.',
      detail: 'The reserved values are what make the format total: every one of the 2^32 patterns has a defined meaning, and none is unused. Two of the 256 exponent values are reserved, leaving 254 for ordinary magnitudes, and the two end values each carry two meanings separated by the fraction field.',
      keyword: 'four regimes',
      trap: null,
      narration: 'The exponent field splits the line into four regimes. An exponent field from one to two hundred and fifty-four is a normal number. Zero is the denormal regime, and two hundred and fifty-five is infinity or not-a-number.'
    },
    {
      id: 'nl-2', start: 218, end: 226, scene: 'numberline',
      caption: 'With E = 0 the hidden bit becomes 0, so the significand is 0.F at a fixed exponent of −126. That fills the gap next to zero with evenly spaced numbers down to 2⁻¹⁴⁹.',
      detail: 'Denormals trade precision for range near zero: as the leading zeros of the fraction increase, fewer significant bits remain, so accuracy degrades smoothly instead of collapsing to zero. This is also why the smallest normalized positive number is 2^−126 and not 2^−127, which GATE CSE 2021 Set 2, Q4 asks directly: the answer has E = 00000001 and F = all zeros.',
      keyword: 'the hidden bit becomes 0',
      trap: 'With E = 0 the formula changes. Applying 1.F × 2^(0−127) to a denormal gives a wrong answer; it is 0.F × 2^−126.',
      narration: 'With a zero exponent field the hidden bit becomes zero, so the significand is zero point F at a fixed exponent of minus one hundred and twenty-six. That fills the gap next to zero, down to two to the minus one hundred and forty-nine.'
    },
    {
      id: 'nl-3', start: 226, end: 234, scene: 'numberline',
      caption: 'E = 255 with a zero fraction is infinity; with a non-zero fraction it is NaN. Zero has a sign bit, but +0 and −0 compare equal.',
      detail: 'Infinity is the result of an overflow in the exponent or of dividing by zero, and it propagates: anything finite added to it stays infinite. NaN is the result of an undefined operation such as 0/0 or infinity minus infinity, and it is deliberately not equal to itself, which is the standard test for one. Both zeros have all-zero bits apart from the sign, and both decode to zero.',
      keyword: 'infinity or NaN',
      trap: '0xFFFFFFFF is NaN, not a large negative number, because its exponent field is 255. Check the exponent field before you name any special value.',
      narration: 'An exponent field of two hundred and fifty-five with a zero fraction is infinity, and with a non-zero fraction it is not-a-number. Zero has a sign bit, but plus zero and minus zero compare equal.'
    },
    {
      id: 'nl-4', start: 234, end: 240, scene: 'numberline',
      caption: 'The extremes of single precision: largest finite (2 − 2⁻²³) × 2¹²⁷ ≈ 3.4 × 10³⁸, smallest normal 2⁻¹²⁶, smallest denormal 2⁻¹⁴⁹.',
      detail: 'Every one of these is computed on the page from the field definitions rather than quoted, and each is checked against the bits that produce it: 0x7F7FFFFF for the largest finite, 0x00800000 for the smallest normal, 0x00000001 for the smallest denormal. A useful sanity number is that single precision covers about 38 decades, where double covers about 308.',
      keyword: 'largest finite',
      trap: 'The largest finite value is not 2^128: the significand cannot reach 2, so it stops at 2 − 2^−23.',
      narration: 'The extremes of single precision: the largest finite is about three point four times ten to the thirty-eight, the smallest normal is two to the minus one hundred and twenty-six, and the smallest denormal is two to the minus one hundred and forty-nine.'
    },

    /* ---------------- scene 9: precision ---------------- */
    {
      id: 'pr-1', start: 240, end: 248, scene: 'precision',
      caption: 'Precision is not range. The significand holds 24 bits, so between 1 and 2 the gap is 2⁻²³ — and the gap doubles at every power of two.',
      detail: 'That gap is called an ulp, a unit in the last place. Floating point is evenly spaced within each binade and jumps at every power of two, which is why a sum of many small numbers can drift depending on the order of addition. Double precision has a 53-bit significand, so its gap at 1 is 2^−52.',
      keyword: 'the gap doubles',
      trap: null,
      narration: 'Precision is not range. The significand holds twenty-four bits, so between one and two the gap is two to the minus twenty-three, and the gap doubles at every power of two.'
    },
    {
      id: 'pr-2', start: 248, end: 256, scene: 'precision',
      caption: 'Most decimal fractions are not exactly representable. One tenth in single precision is 13421773 / 2²⁷ = 0.10000000149.',
      detail: 'A binary fraction with f bits represents only multiples of 2^−f, so a decimal such as 1/10, whose denominator has a factor of 5, can never be exact. In double precision the stored value is 3602879701896397 / 2^55, still not one tenth. The error is about 1.5 × 10^−9 in single precision, which is why accumulating a million such terms drifts visibly.',
      keyword: 'not exactly representable',
      trap: 'The error is in the stored value, not in the printing. No amount of formatting recovers one tenth from a float.',
      narration: 'Most decimal fractions are not exactly representable. One tenth in single precision is thirteen million four hundred and twenty-one thousand seven hundred and seventy-three over two to the twenty-seven.'
    },
    {
      id: 'pr-3', start: 256, end: 264, scene: 'precision',
      caption: 'Adding a small number to a large one aligns the exponents first, and the shifted-out bits are lost: 2²⁴ + 1 is exactly 2²⁴ in single precision.',
      detail: 'The alignment shifts the smaller operand right until the exponents match, and once the shift is longer than the 24-bit significand, everything that was significant falls off the end. At 2^24 the gap is 2, so an addend of 1 is exactly half an ulp and the tie goes to the even neighbour, which is 2^24 itself. This is the mechanism behind GATE\'s floating-point addition questions, where a small operand vanishes.',
      keyword: 'the shifted-out bits are lost',
      trap: 'The result is not an error in the adder. It is the correct rounding of an exact sum to the nearest representable value.',
      narration: 'Adding a small number to a large one aligns the exponents first, and the shifted-out bits are lost. In single precision, two to the twenty-four plus one is exactly two to the twenty-four.'
    },
    {
      id: 'pr-4', start: 264, end: 270, scene: 'precision',
      caption: 'Rounding is to nearest with ties to even. So never test two floats for equality, and never assume the order of a sum does not matter.',
      detail: 'Ties-to-even removes the statistical bias that always rounding up would introduce, and it makes the rounding of a value independent of its sign. The practical consequences for the exam are narrow but real: a question that asks whether two computed floats are equal is testing the representation, not the arithmetic, and a question about summing many values is testing the alignment loss.',
      keyword: 'ties to even',
      trap: null,
      narration: 'Rounding is to nearest with ties to even. So never test two floats for equality, and never assume that the order of a sum does not matter.'
    },

    /* ---------------- scene 10: procedure and traps ---------------- */
    {
      id: 'pc-1', start: 270, end: 278, scene: 'procedure',
      caption: 'The procedure: name the format, name the width, find the sign, then decode or encode by weights. Four steps, in that order, every time.',
      detail: 'Naming the format first is what prevents the commonest wasted effort: applying the integer rule to a floating-point pattern, or the single-precision bias to a double. The width determines the bias, the number of fraction bits and the position of the sign, so it is worth writing down before any arithmetic.',
      keyword: 'four steps',
      trap: null,
      narration: 'The procedure: name the format, name the width, find the sign, then decode or encode by weights. Four steps, in that order, every time.'
    },
    {
      id: 'pc-2', start: 278, end: 285, scene: 'procedure',
      caption: 'For a decode, write the four fields before computing anything: sign bit, exponent field, unbiased exponent, significand. Most marks are lost in the second.',
      detail: 'Writing them in a column makes the arithmetic short and checkable, and it makes a slip visible: if the unbiased exponent looks like 129, the bias was not subtracted. The same column works for an encode in reverse, and it is the reason the two worked questions in scene seven are only four lines long each.',
      keyword: 'write the four fields',
      trap: null,
      narration: 'For a decode, write the four fields before computing anything: sign bit, exponent field, unbiased exponent, significand. Most marks are lost in the second.'
    },
    {
      id: 'pc-3', start: 285, end: 293, scene: 'procedure',
      caption: 'Trap one: the bias, so E = 129 means exponent 2. Trap two: the hidden bit, so 1.F for normals but 0.F when E = 0.',
      detail: 'These two account for most of the wrong answers in this topic, and both are checks rather than ideas: after computing the exponent, ask whether it is in the normal range; after writing the significand, ask whether the exponent field was zero. Both questions take a second and catch the error before it reaches the answer line.',
      keyword: 'the hidden bit',
      trap: 'A denormal is not a normal with a small exponent. Its hidden bit is zero, so the whole formula changes.',
      narration: 'Trap one: the bias, so an exponent field of one hundred and twenty-nine means exponent two. Trap two: the hidden bit, which is one for normals and zero when the exponent field is zero.'
    },
    {
      id: 'pc-4', start: 293, end: 300, scene: 'procedure',
      caption: 'Trap three: carry is not overflow. Trap four: a large hex constant is not automatically special — only E = 255 is.',
      detail: 'Both traps come from the same habit, which is to answer a question about meaning with a question about bits. The carry flag is about unsigned arithmetic, the overflow flag about signed; a special value is about the exponent field, not the magnitude. Deciding what the bits mean is the first step of the procedure, and skipping it is what these two traps punish.',
      keyword: 'carry is not overflow',
      trap: '0x7F800000 is infinity and 0x7F7FFFFF is the largest finite number. One bit apart, completely different answers.',
      narration: 'Trap three: carry is not overflow. Trap four: a large hexadecimal constant is not automatically special, because only an exponent field of two hundred and fifty-five is.'
    }
  ]
};
