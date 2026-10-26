# Number Representation And Arithmetic — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/number-representation-and-arithmetic/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A fixed point is a scale, and the scale is the whole story

*0:00 – 0:30 · objective: Read an n-bit fixed-point number with f fraction bits as a sum of weights, and state its range and its step from n and f alone.*

**0:00–0:07** — A fixed-point number keeps the binary point in one place. n bits with f of them after the point leave n minus f before it.

> Caption: A fixed-point number keeps the binary point in one place: n bits with f of them after the point leave i = n − f before it.

Exam-trap caption mode adds: *Nothing in the bits tells you where the point is. If a question gives you a bit string without a scale, it is asking for the integer reading.*

**0:07–0:15** — Each position carries a weight. With eight bits and three fraction bits the weights run from sixteen down to one eighth.

> Caption: Each position carries a weight. With 8 bits and 3 fraction bits the weights run from 2⁴ = 16 down to 2⁻³ = 0.125.

**0:15–0:23** — So the largest value is 31.875 and the smallest step is 0.125. That step is the resolution.

> Caption: So the largest value is 2⁵ − 2⁻³ = 31.875 and the smallest step is 2⁻³ = 0.125. The step is the resolution.

**0:23–0:30** — The range is zero to two to the i minus two to the minus f, not two to the i, because the largest pattern stops one step short.

> Caption: The range is 0 to 2ⁱ − 2⁻ᶠ, not 0 to 2ⁱ, because the largest pattern is all ones and stops one step short.

Exam-trap caption mode adds: *The upper bound is a value the format cannot hold. Writing 2^i as the maximum is the most common wrong option in this question.*

## Scene 2. Three ways to write a negative, and two of them have two zeros

*0:30 – 1:00 · objective: Encode a negative number in sign-magnitude, ones' complement and two's complement, and count the distinct integers each one reaches.*

**0:30–0:37** — Sign-magnitude spends the leftmost bit on the sign and keeps the rest as the magnitude. Minus five in four bits is one one zero one.

> Caption: Sign-magnitude spends the leftmost bit on the sign and keeps the other n − 1 bits as the magnitude: −5 in four bits is 1101.

**0:37–0:45** — One's complement stores the negation as the bitwise complement. Two's complement complements and then adds one.

> Caption: One's complement stores the negation as the bitwise complement. Two's complement complements and then adds one.

**0:45–0:52** — Two of the three have two patterns for zero: zero zero zero zero and one zero zero zero in sign-magnitude, zero zero zero zero and one one one one in one's complement.

> Caption: Two of the three have two bit patterns for zero: 0000 and 1000 in sign-magnitude, 0000 and 1111 in one's complement.

**0:52–1:00** — So n bits give two to the n distinct integers in two's complement and only one fewer in the other two. GATE 2016 Set 2 asks for the difference, and it is one.

> Caption: So n bits give 2ⁿ distinct integers in two’s complement and only 2ⁿ − 1 in the other two. GATE 2016 Set 2 asks for the difference: 1.

Exam-trap caption mode adds: *The answer 1 is independent of n. If you compute it for n = 16 and get 1, you are right, but be ready to say why it cannot depend on the width.*

## Scene 3. Two's complement as a wheel: negation is a mirror

*1:00 – 1:30 · objective: Justify the range -2^(n-1) to 2^(n-1)-1 from the wheel, see why one pattern is its own negation, and use sign extension correctly.*

**1:00–1:08** — All sixteen four-bit patterns sit on a wheel in counting order. The two's complement value is the unsigned value minus sixteen once the top bit is set.

> Caption: All sixteen four-bit patterns sit on a wheel in counting order. Two’s complement value is the unsigned value minus 16 once the top bit is set.

**1:08–1:16** — Negation is a mirror: flip every bit and add one. Zero one zero one is five, so one zero one one is minus five, and doing it twice returns zero one zero one.

> Caption: Negation is a mirror: flip every bit and add one. 0101 is 5, so 1011 is −5 — and doing it twice returns 0101.

**1:16–1:24** — One pattern is its own negation: one zero zero zero is minus eight, and negating it gives one zero zero zero again. That is why the range is lopsided.

> Caption: One pattern is its own negation: 1000 is −8, and negating it gives 1000 again. That is why the range is lopsided.

Exam-trap caption mode adds: *A question that asks for the smallest n-bit two’s complement integer wants −2^(n−1), not −(2^(n−1) − 1). The latter is the sign-magnitude answer.*

**1:24–1:30** — Widening a word copies the sign bit leftwards. Minus twenty-eight in sixteen bits is all ones then one one one zero zero one zero zero.

> Caption: Widening a word copies the sign bit leftwards. −28 in sixteen bits is 1111 1111 1110 0100, not 0000 0000 1110 0100.

Exam-trap caption mode adds: *The wrong option in the 2019 question, 0000 0000 1110 0100, is the eight-bit answer zero-padded. Sign extension is the fix.*

## Scene 4. One adder does addition and subtraction

*1:30 – 2:00 · objective: Add and subtract in two's complement with the same circuit, discarding the final carry, and negate a bit pattern in one pass.*

**1:30–1:38** — The adder does not know about signs. It adds bit patterns column by column and throws away the carry out of the top column.

> Caption: The adder does not know about signs. It adds bit patterns column by column and throws away the carry out of the top column.

**1:38–1:46** — Subtraction is addition of the negation: A minus B is A plus the complement of B plus one. One adder and a row of inverters do both jobs.

> Caption: Subtraction is addition of the negation: A − B is computed as A plus the complement of B plus one, so one adder and a row of inverters do both jobs.

Exam-trap caption mode adds: *Subtracting the most negative value raises a spurious overflow, because its negation cannot be formed in n bits. It is the one exception, and the page finds it by search rather than by assumption.*

**1:46–1:54** — Worked: the sixteen-bit pattern all ones then one one one one zero one zero one. Invert, add one, and the magnitude is eleven, so the value is minus eleven.

> Caption: Worked: 1111 1111 1111 0101 in sixteen bits. Invert to 0000 0000 0000 1010, add one to get 1011 = 11, so the value is −11.

**1:54–2:00** — The one-pass shortcut: copy the bits up to and including the rightmost one, then invert everything to its left.

> Caption: The one-pass shortcut: copy the bits up to and including the rightmost 1, then invert everything to its left. Same answer, one sweep.

## Scene 5. Carry and overflow are different questions

*2:00 – 2:30 · objective: Separate the carry flag from the overflow flag, use carry-in against carry-out of the sign column, and read which one a question is asking about.*

**2:00–2:08** — Two flags leave the top of the adder and they answer different questions. The carry out is a fifth bit, and it matters only when the operands are unsigned.

> Caption: Two flags leave the top of the adder and they answer different questions. The carry out is a fifth bit; it matters only when the operands are unsigned.

**2:08–2:16** — Overflow is about the sign. It happens when two operands of the same sign produce a result of the other sign, and never when the signs differ.

> Caption: Overflow is about the sign. It happens when two operands of the same sign produce a result of the other sign, and never when the signs differ.

**2:16–2:24** — The mechanical test: carry into the sign column exclusive-or carry out of it. Carry out alone is not overflow, because adding two negatives always carries out.

> Caption: The mechanical test: carry into the sign column exclusive-or carry out of it. Carry out alone is not overflow — adding two negatives always carries out.

Exam-trap caption mode adds: *Two negatives that carry out are not overflowing. Check the sign of the result before you blame the carry.*

**2:24–2:30** — And overflow can happen with no carry at all: zero one one one plus zero zero zero one gives one zero zero zero, that is seven plus one giving minus eight.

> Caption: And overflow can happen with no carry at all: 0111 + 0001 = 1000 is +7 + 1 = −8. Read what the bits mean before choosing a flag.

Exam-trap caption mode adds: *Sign-magnitude overflow is a magnitude question, not a sign question. The rule for two’s complement does not transfer.*

## Scene 6. From scientific notation to a floating-point field

*2:30 – 3:00 · objective: Normalise a binary number, see why the leading one is not stored, and see what the exponent bias does besides removing a sign bit.*

**2:30–2:38** — A floating-point number is scientific notation in base two: a sign, a significand with one digit before the point, and an exponent.

> Caption: A floating-point number is scientific notation in base two: a sign, a significand with one digit before the point, and an exponent.

**2:38–2:46** — Normalising shifts until exactly one one sits before the point. That one is then always there, so IEEE 754 does not store it.

> Caption: Normalising shifts until exactly one 1 sits before the point. That 1 is then always there, so IEEE 754 does not store it.

Exam-trap caption mode adds: *Writing 0.1F as the significand instead of 1.F is the single most common encoding error in this topic. Only the bits after the point are stored.*

**2:46–2:54** — The exponent is stored with a bias added: e plus one hundred and twenty-seven in single precision. So minus three is stored as one hundred and twenty-four.

> Caption: The exponent is stored with a bias added: e + 127 in single precision, e + 1023 in double. So −3 is stored as 124, and 3 as 130.

Exam-trap caption mode adds: *The bias is 127, not 128, and 1023, not 1024. It is 2^(k−1) − 1 for a k-bit exponent field.*

**2:54–3:00** — The bias also makes the bit pattern order agree with the numeric order, so two positive floats can be compared as integers.

> Caption: The bias also makes the bit pattern order agree with the numeric order, so two positive floats can be compared as integers.

Exam-trap caption mode adds: *For negative numbers the order reverses, because the sign bit is the top bit. Only same-sign comparisons are a plain integer comparison.*

## Scene 7. The 32 bits of a single, decoded and encoded

*3:00 – 3:30 · objective: Decode S, E, F into a decimal value and encode a decimal value back into 32 bits, on two questions taken from past papers.*

**3:00–3:08** — Single precision is thirty-two bits: one sign, eight exponent, twenty-three fraction. Double is sixty-four bits: one, eleven, fifty-two.

> Caption: Single precision is 32 bits: 1 sign, 8 exponent, 23 fraction. Double is 64 bits: 1, 11, 52. Biases 127 and 1023.

**3:08–3:16** — Decode: sign one, exponent field one zero zero zero zero zero zero one, fraction one one one one. The exponent is two, the significand is one point nine three seven five, so the value is minus seven point seven five.

> Caption: Decode S=1, E=10000001, F=1111 then zeros. E is 129, so the exponent is 2; the significand is 1.1111 = 1.9375; the value is −7.75.

Exam-trap caption mode adds: *Reading F as a decimal fraction, or forgetting to subtract the bias, are the two ways to lose this one. E = 129 is the stored field, not the exponent.*

**3:16–3:24** — Encode minus fourteen point two five: binary one one one zero point zero one, normalised one point one one zero zero one times two cubed. Exponent field one hundred and thirty, and the result is C one six four zero zero zero zero.

> Caption: Encode −14.25: binary 1110.01, normalised 1.11001 × 2³, exponent field 130, fraction 11001 then zeros, sign 1 — giving 0xC1640000.

Exam-trap caption mode adds: *The sign of the exponent follows the direction the point moved, not the sign of the number. −14.25 has a positive exponent and a negative sign bit.*

**3:24–3:30** — Both questions are the same four steps: sign, exponent field, significand, multiply. Learn the four steps, not the two answers.

> Caption: Both questions are the same four steps: sign, exponent field, significand, multiply. Learn the four steps, not the two answers.

## Scene 8. The whole IEEE number line: denormals, zero, infinity, NaN

*3:30 – 4:00 · objective: Read the four exponent regimes, name the extremes of single precision, and say what E = 0 and E = 255 mean.*

**3:30–3:38** — The exponent field splits the line into four regimes. An exponent field from one to two hundred and fifty-four is a normal number. Zero is the denormal regime, and two hundred and fifty-five is infinity or not-a-number.

> Caption: The exponent field splits the line into four regimes. E from 1 to 254 is a normal number; E = 0 is the denormal regime; E = 255 is infinity or NaN.

**3:38–3:46** — With a zero exponent field the hidden bit becomes zero, so the significand is zero point F at a fixed exponent of minus one hundred and twenty-six. That fills the gap next to zero, down to two to the minus one hundred and forty-nine.

> Caption: With E = 0 the hidden bit becomes 0, so the significand is 0.F at a fixed exponent of −126. That fills the gap next to zero with evenly spaced numbers down to 2⁻¹⁴⁹.

Exam-trap caption mode adds: *With E = 0 the formula changes. Applying 1.F × 2^(0−127) to a denormal gives a wrong answer; it is 0.F × 2^−126.*

**3:46–3:54** — An exponent field of two hundred and fifty-five with a zero fraction is infinity, and with a non-zero fraction it is not-a-number. Zero has a sign bit, but plus zero and minus zero compare equal.

> Caption: E = 255 with a zero fraction is infinity; with a non-zero fraction it is NaN. Zero has a sign bit, but +0 and −0 compare equal.

Exam-trap caption mode adds: *0xFFFFFFFF is NaN, not a large negative number, because its exponent field is 255. Check the exponent field before you name any special value.*

**3:54–4:00** — The extremes of single precision: the largest finite is about three point four times ten to the thirty-eight, the smallest normal is two to the minus one hundred and twenty-six, and the smallest denormal is two to the minus one hundred and forty-nine.

> Caption: The extremes of single precision: largest finite (2 − 2⁻²³) × 2¹²⁷ ≈ 3.4 × 10³⁸, smallest normal 2⁻¹²⁶, smallest denormal 2⁻¹⁴⁹.

Exam-trap caption mode adds: *The largest finite value is not 2^128: the significand cannot reach 2, so it stops at 2 − 2^−23.*

## Scene 9. 24 bits of precision, and what it costs

*4:00 – 4:30 · objective: Separate precision from range, compute an ulp, explain inexact decimals and absorbed additions, and know the rounding rule.*

**4:00–4:08** — Precision is not range. The significand holds twenty-four bits, so between one and two the gap is two to the minus twenty-three, and the gap doubles at every power of two.

> Caption: Precision is not range. The significand holds 24 bits, so between 1 and 2 the gap is 2⁻²³ — and the gap doubles at every power of two.

**4:08–4:16** — Most decimal fractions are not exactly representable. One tenth in single precision is thirteen million four hundred and twenty-one thousand seven hundred and seventy-three over two to the twenty-seven.

> Caption: Most decimal fractions are not exactly representable. One tenth in single precision is 13421773 / 2²⁷ = 0.10000000149.

Exam-trap caption mode adds: *The error is in the stored value, not in the printing. No amount of formatting recovers one tenth from a float.*

**4:16–4:24** — Adding a small number to a large one aligns the exponents first, and the shifted-out bits are lost. In single precision, two to the twenty-four plus one is exactly two to the twenty-four.

> Caption: Adding a small number to a large one aligns the exponents first, and the shifted-out bits are lost: 2²⁴ + 1 is exactly 2²⁴ in single precision.

Exam-trap caption mode adds: *The result is not an error in the adder. It is the correct rounding of an exact sum to the nearest representable value.*

**4:24–4:30** — Rounding is to nearest with ties to even. So never test two floats for equality, and never assume that the order of a sum does not matter.

> Caption: Rounding is to nearest with ties to even. So never test two floats for equality, and never assume the order of a sum does not matter.

## Scene 10. The procedure and the four traps

*4:30 – 5:00 · objective: Run a fixed decode-or-encode procedure under time pressure, and recognise the four errors that cost marks in this topic.*

**4:30–4:38** — The procedure: name the format, name the width, find the sign, then decode or encode by weights. Four steps, in that order, every time.

> Caption: The procedure: name the format, name the width, find the sign, then decode or encode by weights. Four steps, in that order, every time.

**4:38–4:45** — For a decode, write the four fields before computing anything: sign bit, exponent field, unbiased exponent, significand. Most marks are lost in the second.

> Caption: For a decode, write the four fields before computing anything: sign bit, exponent field, unbiased exponent, significand. Most marks are lost in the second.

**4:45–4:53** — Trap one: the bias, so an exponent field of one hundred and twenty-nine means exponent two. Trap two: the hidden bit, which is one for normals and zero when the exponent field is zero.

> Caption: Trap one: the bias, so E = 129 means exponent 2. Trap two: the hidden bit, so 1.F for normals but 0.F when E = 0.

Exam-trap caption mode adds: *A denormal is not a normal with a small exponent. Its hidden bit is zero, so the whole formula changes.*

**4:53–5:00** — Trap three: carry is not overflow. Trap four: a large hexadecimal constant is not automatically special, because only an exponent field of two hundred and fifty-five is.

> Caption: Trap three: carry is not overflow. Trap four: a large hex constant is not automatically special — only E = 255 is.

Exam-trap caption mode adds: *0x7F800000 is infinity and 0x7F7FFFFF is the largest finite number. One bit apart, completely different answers.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
