# Fixed Point Arithmetic — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/fixed-point-arithmetic/index.html`
- Total duration: 5:40 (340 seconds), 12 scenes, 57 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A fixed point is an integer plus a promise

*0:00 – 0:26 · objective: undefined*

**0:00–0:07** — A fixed-point number is an ordinary integer with the binary point nailed to one place.

> Caption: A fixed-point number is an ordinary integer with the binary point nailed to one place.

Exam-trap caption mode adds: *The point is not stored anywhere. Two programs can read the same register under two different scales.*

**0:07–0:14** — Take eight bits and put four of them after the point. The stored integer is divided by sixteen to give the value.

> Caption: Eight bits with four after the point: divide the stored integer by sixteen to get the value.

**0:14–0:20** — The two hundred and fifty six patterns become two hundred and fifty six values, spaced exactly one sixteenth apart, from minus eight up to seven point nine three seven five.

> Caption: The 256 patterns become 256 values, spaced exactly one sixteenth apart, from minus 8 to 7.9375.

Exam-trap caption mode adds: *The step is 2^-f = 1/16, not 1/8. Four fraction bits give sixteen steps per unit, not eight.*

**0:20–0:26** — The adder is an integer adder. The scale is a promise the programmer keeps, and every operation has to keep it too.

> Caption: The hardware did not change. The scale is a promise the programmer keeps.

## Scene 2. Reading the bits: weights, and a sign that weighs

*0:26 – 0:58 · objective: undefined*

**0:26–0:33** — Read the bits with weights: eight, four, two, one, then a half, a quarter, an eighth and a sixteenth.

> Caption: Read the bits with weights: 8, 4, 2, 1, then a half, a quarter, an eighth and a sixteenth.

**0:33–0:40** — The pattern zero one one zero point one zero zero zero sums to six and a half: four, plus two, plus one half.

> Caption: 0110.1000 sums to 6.5: four, plus two, plus one half.

**0:40–0:47** — The leftmost bit weighs minus eight, not plus eight, so the pattern one followed by seven zeros is exactly minus eight.

> Caption: The leftmost bit weighs minus eight, so 1000.0000 is exactly minus 8.

Exam-trap caption mode adds: *The top bit is worth -2^(i-1), not +2^(i-1). Reading it as positive turns -8 into +8.*

**0:47–0:52** — All eight bits set is minus one sixteenth, the value closest to zero from below.

> Caption: All ones is minus one sixteenth: the value closest to zero from below.

**0:52–0:58** — The negative half holds one hundred and twenty eight patterns and the non-negative half one hundred and twenty seven, so plus eight does not exist.

> Caption: The negative half holds 128 patterns and the non-negative half 127, so plus 8 does not exist.

Exam-trap caption mode adds: *Saying the range is "symmetric" is wrong by one step, and that one step is what makes the smallest negative value representable and the largest positive one not.*

## Scene 3. Width is fixed: resolution against range

*0:58 – 1:26 · objective: undefined*

**0:58–1:04** — The width is fixed at eight bits, so every fraction bit you add is an integer bit you give up.

> Caption: Width is fixed, so every fraction bit you add is an integer bit you give up.

**1:04–1:10** — In Q2.6, six fraction bits give a step of one sixty fourth, but the window is only minus two to one point nine eight.

> Caption: Q2.6: six fraction bits give a step of 1/64, but the window is only minus 2 to 1.98.

**1:10–1:16** — In Q6.2, the step is one quarter and the window runs from minus thirty two to thirty one point seven five. Same eight bits, sixteen times coarser.

> Caption: Q6.2: a step of 1/4, and a window of minus 32 to 31.75. Same eight bits, sixteen times coarser.

**1:16–1:22** — Resolution and range trade one for one in bits: i plus f equals n, always.

> Caption: Resolution and range trade one for one in bits: i plus f equals n, always.

**1:22–1:26** — So the choice of f is a design decision, made from the largest magnitude the signal will ever reach and the smallest step it must resolve.

> Caption: So the choice of f is a design decision, not a detail.

## Scene 4. Addition: align the points, and the scale stays

*1:26 – 1:58 · objective: undefined*

**1:26–1:32** — Addition needs both binary points in the same column, so both operands must carry the same f.

> Caption: Addition needs both points in the same column, so both operands must carry the same f.

Exam-trap caption mode adds: *Adding a Q4.4 value to a Q2.6 value without aligning gives a number in no consistent scale at all.*

**1:32–1:38** — Six and a half plus five and a quarter: align the points, then add the stored integers, one hundred and four plus eighty four is one hundred and eighty eight.

> Caption: 6.5 plus 5.25: align the points, then add the stored integers, 104 plus 84 is 188.

**1:38–1:44** — One hundred and eighty eight is eleven point seven five with the point still four bits from the right. The scale never changes under addition.

> Caption: 188 is 11.75 with the point still four bits from the right: the scale never changes under addition.

**1:44–1:50** — But eleven point seven five is outside the window from minus eight to seven point nine three seven five, so eight bits cannot hold it. The sum needs one more integer bit.

> Caption: But 11.75 is outside minus 8 to 7.9375, so eight bits cannot hold it: the sum needs one more integer bit.

**1:50–1:58** — Adding k values needs i plus log base two of k integer bits. For two values that is five, for four it is six, for eight seven and for sixteen eight.

> Caption: Adding k values needs i plus log base two of k integer bits: computed here for 2, 4, 8 and 16.

## Scene 5. When the sum will not fit: wrap or clamp

*1:58 – 2:26 · objective: undefined*

**1:58–2:04** — Kept in eight bits, one hundred and eighty eight is the pattern one zero one one point one one zero zero, which decodes to minus four and a quarter.

> Caption: Kept in eight bits, 188 is the pattern 1011.1100, which decodes to minus 4.25.

**2:04–2:10** — The value did not get smaller. The top bit was read as a sign. That is wraparound, and it is not saturation.

> Caption: The value did not get smaller; the top bit was read as a sign. That is wraparound, not saturation.

Exam-trap caption mode adds: *A wrapped sum can change sign. Two positives adding to a negative is the signature, and it is exactly the overflow condition.*

**2:10–2:16** — One quarter of all sixty five thousand five hundred and thirty six pairs overflow: sixteen thousand three hundred and eighty four of them, and each of those wraps.

> Caption: One quarter of all 65,536 pairs overflow: 16,384 of them, and each of those wraps.

**2:16–2:21** — The exact check compares the sum against the window before storing it, never the sign of the result alone.

> Caption: The exact check compares the sum against the window before storing, never the sign of the result alone.

**2:21–2:26** — Saturation clamps the result to seven point nine three seven five instead of wrapping. It is a choice, and both choices are in use.

> Caption: Saturation clamps to 7.9375 instead of wrapping. It is a choice, and both are in use.

## Scene 6. Multiplication: the fraction bits add

*2:26 – 2:58 · objective: undefined*

**2:26–2:32** — Multiplication is where the binary point moves: the fraction bits add.

> Caption: Multiplication is where the binary point moves: the fraction bits add.

**2:32–2:38** — Q4.4 times Q4.4 gives Q8.8: a sixteen bit product whose point sits eight bits from the right.

> Caption: Q4.4 times Q4.4 gives Q8.8: a sixteen-bit product whose point sits eight bits from the right.

**2:38–2:44** — One point one eight seven five is nineteen sixteenths. Nineteen times nineteen is three hundred and sixty one, and three hundred and sixty one over two hundred and fifty six is one point four one zero one five six two five, exactly.

> Caption: 1.1875 is 19 sixteenths; 19 times 19 is 361, and 361 over 256 is 1.41015625 exactly.

**2:44–2:50** — To store it back in Q4.4 you shift right by four, and that drops four bits you cannot keep.

> Caption: To store it back in Q4.4 you shift right by four, which drops four bits you cannot keep.

**2:50–2:58** — Truncating gives twenty two sixteenths, one point three seven five. Rounding first gives twenty three sixteenths, one point four three seven five. Both miss the exact answer by less than one step.

> Caption: Truncating gives 22 sixteenths, 1.375. Rounding first gives 23 sixteenths, 1.4375. Both miss by under one step.

## Scene 7. Discarding bits: truncate, or round

*2:58 – 3:28 · objective: undefined*

**2:58–3:04** — Dropping bits with a right shift is a floor: it always moves toward minus infinity.

> Caption: Dropping bits with a right shift is a floor: it always moves toward minus infinity.

**3:04–3:10** — Over all sixty five thousand five hundred and thirty six products, truncation loses thirteen five hundred and twelfth of a step on average: a bias that always points down.

> Caption: Over all 65,536 products, truncation loses 13/512 of a step on average: a bias that always points down.

Exam-trap caption mode adds: *A biased rounding error does not cancel in a sum. A hundred truncations drift by a hundred times the bias.*

**3:10–3:16** — Adding half a step before the shift changes the mean error to plus one two hundred and fifty sixth, and the worst error to one thirty second, which is half a step.

> Caption: Adding half a step before the shift changes the mean error to plus 1/256, and the worst to 1/32.

**3:16–3:22** — Truncation was exact for twelve thousand two hundred and eighty eight products, but exactness is not the point. The bias is.

> Caption: Truncation was exact for 12,288 products, but exactness is not the point: the bias is.

**3:22–3:28** — In a loop that feeds its own output back, that bias accumulates into a visible offset.

> Caption: In a loop that feeds its own output back, that bias accumulates into a visible offset.

## Scene 8. A right shift floors; division truncates

*3:28 – 3:56 · objective: undefined*

**3:28–3:34** — There is a second trap. An arithmetic right shift floors, while integer division truncates toward zero.

> Caption: There is a second trap: an arithmetic right shift floors, while integer division truncates toward zero.

**3:34–3:40** — Minus nine sixteenths is minus nought point five six two five. Halving it by shift gives minus five sixteenths, minus nought point three one two five.

> Caption: Minus 9 sixteenths is minus 0.5625. Halving it by shift gives minus 5 sixteenths, minus 0.3125.

**3:40–3:46** — Truncating division gives minus four sixteenths, minus nought point two five. The two answers differ by exactly one step.

> Caption: Truncating division gives minus 4 sixteenths, minus 0.25. The two answers differ by exactly one step.

Exam-trap caption mode adds: *Writing x / 2 and x >> 1 interchangeably is correct only while x is non-negative. A rescale loop that goes negative drifts by one step per halving.*

**3:46–3:51** — That happens for sixty four of the two hundred and fifty six patterns, so a sign blind rescale is wrong on a quarter of the negatives.

> Caption: That happens for 64 of the 256 patterns, so a sign-blind rescale is wrong on a quarter of the negatives.

**3:51–3:56** — Choose one rule, state it in the code, and check it on a negative value before trusting the loop.

> Caption: Choose one rule, state it, and check it on a negative value before trusting the loop.

## Scene 9. Accumulation: drift, and the extra bits

*3:56 – 4:26 · objective: undefined*

**3:56–4:02** — Nought point one has no exact eight bit binary fraction. It stores as twenty six over two hundred and fifty six, which is nought point one zero one five six two five.

> Caption: 0.1 has no exact eight-bit binary fraction: it stores as 26/256, which is 0.1015625.

**4:02–4:08** — Adding it ten times gives two hundred and sixty over two hundred and fifty six, that is one point zero one five six two five instead of one: a one point five six two five per cent drift.

> Caption: Adding it ten times gives 260/256, that is 1.015625 instead of 1: a 1.5625 per cent drift.

Exam-trap caption mode adds: *Fixed-point error in a sum grows linearly with the number of terms. Doubling the loop doubles the drift.*

**4:08–4:14** — The drift is the encoding error times the number of additions, so it grows with the loop and never averages away.

> Caption: The drift is the encoding error times the number of additions, so it grows with the loop.

**4:14–4:20** — Sizing the accumulator from the count is the fix: k additions need i plus log base two of k integer bits.

> Caption: Sizing the accumulator from the count is the fix: k additions need i plus log base two of k integer bits.

**4:20–4:26** — Q1.15 shows the same economics at sixteen bits: a range from minus one to nought point nine nine nine nine seven, and a step of two to the minus fifteen.

> Caption: Q1.15 shows the same economics at sixteen bits: range minus 1 to 0.99997, step 2 to the minus 15.

## Scene 10. Fixed against floating: absolute against relative

*4:26 – 4:54 · objective: undefined*

**4:26–4:32** — Fixed point spends its bits on one grid: the step is the same everywhere in the range.

> Caption: Fixed point spends its bits on one grid: the step is the same everywhere.

**4:32–4:38** — Floating point spends them on a ratio: near zero the steps are tiny, and far out they are huge.

> Caption: Floating point spends them on a ratio: near zero the steps are tiny, far out they are huge.

**4:38–4:44** — So fixed point has constant absolute error and floating point has constant relative error.

> Caption: So fixed point has constant absolute error and floating point has constant relative error.

**4:44–4:49** — At the smallest positive value, half a step is fifty per cent of it; at four it is under one per cent.

> Caption: At the smallest positive value, half a step is 50 per cent of it; at 4 it is under 1 per cent.

Exam-trap caption mode adds: *Quoting a fixed-point format’s "precision" as a percentage without saying at what magnitude is meaningless.*

**4:49–4:54** — That single sentence decides which of the two representations a design should use.

> Caption: That single sentence decides which of the two representations a design should use.

## Scene 11. The five-step procedure for any word-width question

*4:54 – 5:20 · objective: undefined*

**4:54–5:00** — Every word width question on this topic follows the same five steps.

> Caption: Every word-width question on this topic follows the same five steps.

**5:00–5:06** — Name n, f and i. Write the window and the step. Then apply the operation’s own rule.

> Caption: Name n, f and i; write the window and the step; then apply the operation’s own rule.

**5:06–5:12** — Addition keeps f and costs an integer bit. Multiplication adds the fraction bits and doubles the width.

> Caption: Addition keeps f and costs an integer bit; multiplication adds f and doubles n.

**5:12–5:16** — Round before you shift, and saturate at the boundary rather than wrap.

> Caption: Round before you shift, and saturate at the boundary rather than wrap.

**5:16–5:20** — Five steps, every time, with the numbers written down.

> Caption: Five steps, every time, with the numbers written down.

## Scene 12. One screen to hold

*5:20 – 5:40 · objective: undefined*

**5:20–5:26** — Hold five sentences. The point is fixed. The step is two to the minus f. And i plus f is n.

> Caption: Hold five sentences: the point is fixed, the step is 2^-f, and i plus f is n.

**5:26–5:32** — Add with equal f. Multiply and the f’s add. A right shift means floor.

> Caption: Add with equal f; multiply and the f’s add; a right shift means floor.

**5:32–5:40** — Round before discarding, saturate at the edge, and size the accumulator from the count.

> Caption: Round before discarding, saturate at the edge, and size the accumulator from the count.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
