# Floating Point Arithmetic — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/floating-point-arithmetic/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Arithmetic is four steps, and representation is none of them

*0:00 – 0:30 · objective: Separate representing a number from operating on it, name the four steps of every floating-point operation, and fix the toy format the page computes in.*

**0:00–0:07** — The last lesson turned bits into numbers. This one operates on them. Align, add, normalise, round.

> Caption: The last lesson turned bits into numbers. This one operates on them: align, add, normalise, round.

**0:07–0:15** — A format is a promise about spacing. With four significand bits, numbers near one are one eighth apart.

> Caption: A format is a promise about spacing: with four significand bits, numbers near one are one-eighth apart.

**0:15–0:22** — The page computes in a toy format. Four significand bits, exponents from minus three to three.

> Caption: The page computes in a toy format: four significand bits, exponents from minus three to three.

**0:22–0:30** — I triple E promises one rounding per operation, applied to the exact result. That promise is the whole design.

> Caption: IEEE promises one rounding per operation, applied to the exact result. That promise is the whole design.

## Scene 2. Alignment: the smaller operand is shifted, and its low bits fall off

*0:30 – 1:00 · objective: Watch an exponent difference become a shift, see a small addend disappear entirely, and count the bits that were discarded.*

**0:30–0:37** — To add two numbers you must first put them on the same exponent. Shift the smaller one right.

> Caption: To add two numbers you must first put them on the same exponent: shift the smaller one right.

**0:37–0:45** — One plus one sixteenth in four bits. The difference is four, so four bits are shifted out.

> Caption: One plus one-sixteenth in four bits: the difference is four, so four bits are shifted out.

**0:45–0:52** — The result is one, not one point zero six two five. The addend was absorbed, and rounding put the sum back on one.

> Caption: The result is one, not 1.0625: the addend was absorbed, and rounding put the sum back on one.

Exam-trap caption mode adds: *The absorbed addend is not "the hardware rounding 0.0625 down". 0.0625 is exactly halfway between 1.000 and 1.125; the tie rule, not the size of the addend, decided the answer. Change the format to five bits and the same addend survives.*

**0:52–1:00** — One plus one eighth is one point one two five exactly. The same shape of question, a different exponent gap.

> Caption: One plus one-eighth is 1.125 exactly: the same shape of question, a different exponent gap.

## Scene 3. Rounding: nearest, ties to even, and the four other modes

*1:00 – 1:30 · objective: Round three values into a four-bit significand, see the tie, and read the five IEEE modes as five different answers to one question.*

**1:00–1:07** — Rounding asks one question. Which of the two neighbours is nearer?

> Caption: Rounding asks one question: which of the two neighbours is nearer?

**1:07–1:15** — One point zero six two five is a tie, and ties go to the even last digit, so it becomes one point zero zero zero.

> Caption: 1.0625 is a tie, and ties go to the even last digit, so it becomes 1.000 and not 1.125.

Exam-trap caption mode adds: *Half-up, the rule most people carry over from school arithmetic, is not the default in IEEE binary. Under half-up the tie would go to 1.125. Only decimal formats require ties-away-from-zero, and even there it is not the recommended default.*

**1:15–1:22** — Above the halfway point it goes up. One point zero nine three seven five becomes one point one two five. Below it, down.

> Caption: Above the halfway point it goes up: 1.09375 becomes 1.125. Below it, down: 1.03125 becomes 1.000.

**1:22–1:30** — Five modes, one question. Nearest ties to even, nearest ties away, toward zero, toward plus infinity, toward minus infinity.

> Caption: Five modes, one question: nearest ties to even, nearest ties away, toward zero, toward plus infinity, toward minus infinity.

## Scene 4. Guard, round and sticky: why subtraction needs extra bits

*1:30 – 2:00 · objective: Reproduce the classic guard-digit failure, 2 minus 1.75 in three bits, and see the error fall from 100 per cent to zero when one extra bit is kept.*

**1:30–1:37** — Two minus one point seven five in three significand bits. Align, and the last bit of one point seven five falls off the end.

> Caption: Two minus 1.75 in three significand bits: align, and the last bit of 1.75 falls off the end.

**1:37–1:45** — Without a guard bit the answer is nought point five. The true answer is nought point two five, so the error is one hundred per cent.

> Caption: Without a guard bit the answer is 0.5. The true answer is 0.25, so the error is one hundred per cent.

Exam-trap caption mode adds: *The failure is in the alignment, before the subtraction, and it survives any rounding rule you apply afterwards. Changing the rounding mode does not fix it; adding a bit does.*

**1:45–1:52** — One guard bit is enough. With it the answer is nought point two five exactly, and the error is zero.

> Caption: One guard bit is enough: with it the answer is 0.25 exactly, and the error is zero.

**1:52–2:00** — The sticky bit is the memory of everything shifted out. One if any of it was non zero.

> Caption: The sticky bit is the memory of everything shifted out: one if any of it was non-zero.

## Scene 5. 0.1 + 0.2: two doubles, one exact sum, and a one-bit residue

*2:00 – 2:30 · objective: Decode 0.1 and 0.2 in double precision, add them, and account for the 0.30000000000000004 to the last bit.*

**2:00–2:07** — One tenth in binary is a repeating fraction, so the stored double is not one tenth.

> Caption: One tenth in binary is a repeating fraction, so the stored double is not one tenth.

**2:07–2:15** — The two stored doubles add to a value one unit in the last place above the double nearest nought point three.

> Caption: The two stored doubles add to a value one unit in the last place above the double nearest 0.3.

**2:15–2:22** — The residue is exactly two to the minus fifty four. One bit, not a rounding accident.

> Caption: The residue is exactly two to the minus fifty-four: one bit, not a rounding accident.

**2:22–2:30** — In single precision the same three numbers are stored with only twenty four bits, and the printed digits change.

> Caption: In single precision the same three numbers are stored with only 24 bits, and the printed digits change.

## Scene 6. Catastrophic cancellation: subtraction that eats the digits

*2:30 – 3:00 · objective: Show a difference that becomes zero in single precision, and a quadratic formula whose small root is wrong by a quarter until it is rearranged.*

**2:30–2:37** — Ten to the eight plus one, in single precision, is ten to the eight. The one has nowhere to go.

> Caption: Ten to the eight plus one, in single precision, is ten to the eight: the one has nowhere to go.

**2:37–2:45** — Subtracting ten to the eight then gives zero, although the true answer is one.

> Caption: Subtracting ten to the eight then gives zero, although the true answer is one.

**2:45–2:52** — The quadratic formula has the same disease. The small root of x squared plus ten to the eight x plus one.

> Caption: The quadratic formula has the same disease: the small root of x squared plus ten to the eight x plus one.

**2:52–3:00** — The naive formula gives minus seven point four five times ten to the minus nine. The rearranged form gives the true minus ten to the minus eight.

> Caption: The naive formula gives minus 7.45 times ten to the minus nine; the rearranged form gives the true minus ten to the minus eight.

## Scene 7. Order matters: two groupings, two answers

*3:00 – 3:30 · objective: Work the three-digit example GATE asked in 2004, then reproduce non-associativity in double precision and repair a long sum with compensation.*

**3:00–3:07** — GATE two thousand and four asked this exact question in three digit decimal arithmetic. Two groupings, two answers.

> Caption: GATE 2004 asked this exact question in three-digit decimal arithmetic: two groupings, two answers.

**3:07–3:15** — Left grouping. One hundred and thirteen minus one hundred and eleven is two, and two plus seven point five one is nine point five one.

> Caption: Left grouping: 113 minus 111 is 2, and 2 plus 7.51 is 9.51. Nothing was lost.

**3:15–3:22** — Right grouping. Minus one hundred and eleven plus seven point five one needs three digits to hold one hundred and three, so seven point five one is first cut to eight.

> Caption: Right grouping: minus 111 plus 7.51 needs three digits to hold 103, so 7.51 is first cut to 8.00.

Exam-trap caption mode adds: *The answer is 9.51 and 10.0, in that order, which is option A on the paper. Both groupings are correctly rounded at every step; the difference comes from where the alignment happened, not from an arithmetic slip.*

**3:22–3:30** — In double precision the same non associativity survives. Nought point six zero zero zero zero zero zero zero zero zero zero zero one against nought point six.

> Caption: In double precision the same non-associativity survives: 0.6000000000000001 against 0.6.

## Scene 8. Multiplication and division: exponents add, and nothing aligns

*3:30 – 4:00 · objective: Multiply two singles by adding exponent fields and subtracting the bias, see the single rounding, and watch overflow and underflow at the ends of the range.*

**3:30–3:37** — Multiplication has no alignment step. Multiply the significands and add the exponent fields.

> Caption: Multiplication has no alignment step: multiply the significands and add the exponent fields.

**3:37–3:45** — Minus sixteen times nought point eight six zero zero nine one four five. Exponent fields one hundred and thirty one and one hundred and twenty six add to two hundred and fifty seven, minus one hundred and twenty seven is one hundred and thirty.

> Caption: Minus sixteen times 0.86009145: exponent fields 131 and 126 add to 257, minus 127 is 130, and the product is minus 13.761463.

**3:45–3:52** — Division subtracts the fields and adds the bias back. The significands divide and are rounded once.

> Caption: Division subtracts the fields and adds the bias back; the significands divide and are rounded once.

**3:52–4:00** — At the ends of the range the answer is infinity or zero. Ten to the thirty eight times ten overflows a single.

> Caption: At the ends of the range the answer is infinity or zero: ten to the thirty-eight times ten overflows a single.

## Scene 9. What the width buys: seven digits, sixteen digits, and the integers that survive

*4:00 – 4:30 · objective: Convert a significand width into decimal digits, find the largest integer a float holds exactly, and decode the register values GATE gave in 2025 and 2026.*

**4:00–4:07** — Twenty four significand bits is about seven decimal digits. Fifty three bits is about sixteen.

> Caption: Twenty-four significand bits is about seven decimal digits; fifty-three bits is about sixteen.

**4:07–4:15** — Every integer up to two to the twenty four is exact in a float, and sixteen million seven hundred and seventy seven thousand two hundred and seventeen is not one of them.

> Caption: Every integer up to two to the twenty-four is exact in a float, and 16777217 is not one of them.

**4:15–4:22** — GATE twenty twenty five set two gave three registers. Minus nine, six and twelve. GATE twenty twenty six set one gave a sum.

> Caption: GATE 2025 Set 2 gave three registers: minus 9, 6 and 12. GATE 2026 Set 1 gave a sum.

**4:22–4:30** — Equality between floats is a question about bits, so compare with a tolerance and say what the tolerance is.

> Caption: Equality between floats is a question about bits, so compare with a tolerance and say what the tolerance is.

## Scene 10. The four-step procedure, and the traps that decide the mark

*4:30 – 5:00 · objective: Reduce the topic to one procedure and four traps, and say what a question about floating-point arithmetic is really asking.*

**4:30–4:37** — Step one. Write both operands with their exponent and significand, and subtract the exponents.

> Caption: Step one: write both operands with their exponent and significand, and subtract the exponents.

**4:37–4:45** — Step two. Shift, add, and keep a guard and a sticky bit. Step three. Normalise and round once.

> Caption: Step two: shift, add, and keep a guard and a sticky bit; step three: normalise and round once.

**4:45–4:52** — Step four. Re-encode and check the regime. Normal, denormal, infinity, not a number.

> Caption: Step four: re-encode and check the regime — normal, denormal, infinity, not-a-number.

**4:52–5:00** — The four traps. Bias one hundred and twenty seven not one hundred and twenty eight. The hidden one. One rounding per operation. And the sign of the exponent.

> Caption: The four traps: bias 127 not 128, the hidden one, one rounding per operation, and the sign of the exponent.

Exam-trap caption mode adds: *A fifth trap hides inside the fourth: an exponent field of 255 with a non-zero fraction is not a number, not infinity. Any question that offers "the largest number" usually has that option waiting.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
