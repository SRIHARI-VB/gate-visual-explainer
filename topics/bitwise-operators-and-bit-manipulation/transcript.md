# Bitwise Operators and Bit Manipulation in C: Masks, Fields, Shifts and the Four Cases With No Answer — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/bitwise-operators-and-bit-manipulation/index.html`
- Total duration: 5:36 (336 seconds), 12 scenes, 48 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Eight columns, no carries

*0:00 – 0:28 · objective: see that a bitwise operator works column by column, and that its result is a number, not a truth value*

**0:00–0:07** — Here are two bytes, one above the other, written most significant bit first. A bitwise operator works straight down the columns: bit seven with bit seven, bit six with bit six, and so on to bit zero. Eight independent answers, no carrying between them.

> Caption: Two bytes, one above the other. A bitwise operator works straight down the columns, like eight tiny sums done at once.

**0:07–0:14** — Bitwise AND keeps a one in a column only when both bytes hold a one there. Down the eight columns of these two bytes it keeps four ones, and the result is the number fifty-two.

> Caption: AND keeps a one only where both columns hold a one. Here that leaves one column out of three.

**0:14–0:21** — OR keeps a one where either byte holds one, giving one hundred and ninety. XOR keeps a one where the two disagree, giving one hundred and thirty-eight. Same eight columns, three different rules, and the shape of the answer is still a byte.

> Caption: OR keeps a one where either holds one. XOR keeps a one where they disagree. Three tables, same eight columns.

**0:21–0:28** — This is the difference that costs marks. Logical and-and gives either zero or one, and it stops early. Bitwise and gives a number with bits in it: six and three is two, not one. If a question prints the result, the number is the answer.

> Caption: This is why & is not &&. Logical and gives 0 or 1; bitwise and gives a number with bits in it.

Exam-trap caption mode adds: *A question that asks for the printed value of an expression containing a single & wants a number, not a truth value.*

## Scene 2. Three tables, one rule per column

*0:28 – 0:56 · objective: read &, | and ^ as per-bit truth tables, and see why the columns never talk to each other*

**0:28–0:35** — Write AND as a two-input table and it has four rows. The output is one only in the last row, where both inputs are one. That table is applied to every column independently, which is the whole definition.

> Caption: AND as a table: four rows, one output. Zero wins everywhere except the single row where both inputs are one.

**0:35–0:42** — OR is one unless both inputs are zero. XOR is one exactly when the two inputs differ, which makes it the operator that detects disagreement, and the one that computes parity.

> Caption: OR is one unless both are zero. XOR is one when the inputs differ, which is why it is the parity operator.

**0:42–0:49** — There are sixteen possible binary Boolean functions of two inputs, and only three of them are operators in C: and, or and exclusive or, plus the unary complement. Everything else in the topic is built from those four.

> Caption: Sixteen binary Boolean functions exist. C gives you three as operators, and one unary: the complement.

**0:49–0:56** — Because the columns never interact, every Boolean law holds bit for bit. De Morgan is the one that gets used: the complement of a conjunction is the disjunction of the complements, column by column.

> Caption: Because the columns are independent, the Boolean laws hold bitwise: De Morgan works on every bit at once.

## Scene 3. Masks: set, clear, toggle, test

*0:56 – 1:24 · objective: build the mask 1<<k and use it in the four operations that change or read one bit*

**0:56–1:03** — A mask is a number with exactly one one in it. Take one and shift it left by k positions, and the one lands on bit k. That single number is all you need to read or change that bit and leave the other seven alone.

> Caption: A mask is a number with exactly one one in it. Shift one left by k and you have a mask for bit k.

**1:03–1:10** — Four operations, one mask. OR sets the bit, because a one in the mask forces a one. AND with the complement of the mask clears it, because a zero there forces a zero. XOR toggles it, because exclusive or with one flips. And AND with the mask reads it, leaving either the mask itself or zero.

> Caption: OR sets the bit. AND with the complement clears it. XOR toggles it. AND with the mask reads it.

Exam-trap caption mode adds: *Clearing a bit needs x & ~m. Writing x & m keeps only that bit, which is a different program.*

**1:10–1:17** — Take the byte one eight two. Bit three is zero, so setting it adds eight and clearing it changes nothing. Bit two is one, so clearing it subtracts four and setting it changes nothing. Toggling either one twice returns the original byte.

> Caption: On 182 the mask for bit three is absent and the mask for bit two is present. Watch the same number change and come back.

**1:17–1:24** — To test a bit, shift it down to position zero and mask it with one, or mask it in place and compare with zero. Both give a zero or a one and neither disturbs the byte, because a test that changes the value is not a test.

> Caption: The test is (x >> k) & 1, or equivalently x & mask compared with zero. Both are one operation more than they look.

## Scene 4. A field: shift, then mask

*1:24 – 1:52 · objective: extract a run of bits with two operations, in the only order that works*

**1:24–1:31** — A field is a run of bits in the middle of a number: the middle four bits, or the exponent field of a floating-point word. To read the run that starts at bit two and is four bits wide, shift the number right by two, so the run begins at position zero.

> Caption: A field is a run of bits in the middle of a number. To read bits five down to two, shift right by two first.

**1:31–1:38** — Then mask with four ones, which is fifteen. What is left is exactly the field, sitting at position zero, with nothing above it. Shift first and mask second, and the field is a plain number.

> Caption: Then mask with four ones. Shift first, mask second, and the field is a number you can compare.

**1:38–1:45** — Do it the other way round and the answer changes. Mask first with fifteen and you keep the low four bits, which are not the field. Shift afterwards and you throw away what you kept. The order is part of the algorithm, not a matter of taste.

> Caption: Mask first and the field is already gone: the shift then throws away the bits you kept. The order is not a style choice.

Exam-trap caption mode adds: *Extraction is shift-then-mask. Insertion is mask-then-shift-then-OR. Reversing either gives a plausible-looking wrong number.*

**1:45–1:52** — A mask of w ones is one shifted left by w, minus one. That formula has one fatal input: w equal to the width of the type. For a thirty-two bit int, shifting one left by thirty-two is undefined, so the mask of thirty-two ones cannot be written that way.

> Caption: A mask of w ones is (1 << w) - 1, and w equal to the width is the shift that has no answer.

## Scene 5. Negative numbers, and what ~ really is

*1:52 – 2:20 · objective: read the two’s complement pattern, derive ~x = -x-1, and see sign extension*

**1:52–1:59** — Take five, written in eight bits. Complement every bit and you get one one one one one zero one zero. As an unsigned byte that is two hundred and fifty, and as a signed byte it is negative six.

> Caption: Five is 00000101. Complement every bit and you get 11111010, which is not a number you would guess.

**1:59–2:06** — The identity is that the complement of x is minus x minus one, and it holds for every signed value. So the complement of five is minus six, not minus five. Complement and negation differ by exactly one, and confusing them is a reliable way to lose a mark.

> Caption: The rule is ~x = -x - 1, for every signed value. Complement is not negation, and the two differ by one.

Exam-trap caption mode adds: *~x is -x-1, never -x. For x = 0 the complement is -1, and the all-ones pattern is what -1 looks like.*

**2:06–2:13** — A negative operand is no obstacle, as long as you remember that its bit pattern is full of leading ones. Complement of six and fifteen gives ten, because the leading ones survive until the mask removes them. Masking is what makes a negative operand behave.

> Caption: A negative operand works too: its pattern is used, and the sign bit is all ones. So mask after, not before.

**2:13–2:20** — When a signed byte is widened to an int, the sign bit is copied into every new bit, so minus eight stays minus eight. When an unsigned byte is widened, the new bits are zeros, so two hundred and forty-eight stays two hundred and forty-eight. Same eight bits, two different numbers.

> Caption: Widening a negative value copies the sign bit all the way up. Widening an unsigned one fills with zeros instead.

## Scene 6. Shifts: the count, and the three traps

*2:20 – 2:48 · objective: state the four rules for << and >>, the three cases the standard leaves undefined, and the one it leaves implementation-defined*

**2:20–2:27** — Shifting left by k multiplies by two to the k, and vacated bits on the right are filled with zeros. Shifting right by k divides by two to the k and drops the remainder, and for an unsigned operand the vacated bits on the left are zeros too.

> Caption: Shifting left by k multiplies by two to the k. Shifting right divides, dropping the remainder.

**2:27–2:34** — The count has a legal range: at least zero, and strictly less than the width of the promoted left operand. Eight legal counts for a byte, thirty-two for an int. A count equal to the width is undefined behaviour, not zero, and a negative count is undefined as well.

> Caption: The count must be at least zero and less than the width. A count equal to the width is undefined, not zero.

Exam-trap caption mode adds: *Shift by exactly the width is undefined behaviour. It often looks like it works, because the processor takes the count modulo the width.*

**2:34–2:41** — Two more cases have no defined answer. Shifting a negative value left is undefined, and shifting a signed positive value so far left that the result does not fit is undefined too. One shifted left by thirty-one on a thirty-two bit int is the second case.

> Caption: Shifting a negative value left is undefined, and so is shifting a positive one into the sign bit. Use unsigned.

**2:41–2:48** — Right shifting a negative value is the case the standard hands to the implementation. Most compilers copy the sign bit, which is an arithmetic shift and turns minus eight into minus four. A logical shift would fill with zeros and turn the same pattern into one hundred and twenty-four.

> Caption: Right shifting a negative value is implementation-defined: arithmetic gives minus four, logical gives one hundred and twenty-four.

Exam-trap caption mode adds: *For negative values, >> is not division: arithmetic shift floors, so -7 >> 1 is -4 while -7 / 2 is -3.*

## Scene 7. x & (x-1): the lowest set bit goes

*2:48 – 3:16 · objective: clear the lowest set bit in one operation, and use it as a power-of-two test with its one false positive*

**2:48–2:55** — Here is what subtracting one does to a bit pattern. The lowest set bit becomes zero, and every bit below it, which were all zeros, become ones. Nothing at or above that position changes.

> Caption: Subtract one from a number and every bit below its lowest set bit flips to one; that bit itself becomes zero.

**2:55–3:02** — Now and the two together. Every bit below the lowest set bit is zero in the original, so the ones introduced by subtracting do not survive. The lowest set bit itself is zero in the subtrahend, so it goes. Everything above is unchanged. The result is the original with exactly one one removed.

> Caption: So x & (x-1) deletes exactly that bit and keeps everything above it. Repeat and the number drains one one at a time.

**3:02–3:09** — That gives the power-of-two test in one line. A positive number is a power of two exactly when it has a single one, and it has a single one exactly when removing the lowest one leaves nothing. The page checks the equivalence over every byte.

> Caption: That gives a power-of-two test in one line: a positive x is a power of two exactly when x & (x-1) is zero.

**3:09–3:16** — There is exactly one exception, and it is zero. Zero anded with minus one is zero, so zero passes the test, and zero is not a power of two. Every published version of this test therefore adds a guard: x is non-zero and the and is zero.

> Caption: One value passes the test and is not a power of two: zero. So the test is written x && !(x & (x-1)).

Exam-trap caption mode adds: *x & (x-1) == 0 alone accepts zero. The guarded form is x != 0 && (x & (x-1)) == 0.*

## Scene 8. x & -x, and counting the ones

*3:16 – 3:44 · objective: isolate the lowest set bit, and count set bits in exactly popcount steps*

**3:16–3:23** — Negation of a bit pattern is complement plus one. Do that to one eight two and you get the pattern for minus one eight two, which is seventy-four. Now and the two patterns together.

> Caption: Negating a pattern means complementing it and adding one. Do that to 182 and you get 74, whose low bits are the ones you want.

**3:23–3:30** — The and keeps only the lowest set bit, which here is two. Above that position the negation has zeros, so nothing survives; below it both patterns have zeros. One operation isolates the bit that subtraction would have found in a loop.

> Caption: x & -x keeps only the lowest set bit: here two. Everything above it cancels, because the negation has zeros there.

**3:30–3:37** — Counting the ones is the same trick in a loop. Clear the lowest one, count one, and repeat until the number is zero. The loop runs exactly as many times as there are ones, which is the whole point: a naive shift loop always runs the full width.

> Caption: Counting is the same trick in a loop: clear the lowest one each time, and the loop runs once per one.

**3:37–3:44** — Parity is the same information folded down. Exclusive or the byte with itself shifted by four, then by two, then by one, and the lowest bit holds the parity: one when the count of ones is odd. Three operations, no table.

> Caption: Parity is the same information folded down: three XORs reduce a byte to one bit, which is the odd-or-even answer.

## Scene 9. The precedence trap in one line

*3:44 – 4:12 · objective: parse x & 1 == 0 the way the compiler does, and see the test become always false*

**3:44–3:51** — Here is the ladder that decides the question. Equality binds tighter than bitwise and, which binds tighter than exclusive or, which binds tighter than or. Assignment is at the bottom. So in an expression with both, the comparison happens first.

> Caption: In C the comparison operators bind tighter than the bitwise ones. So == is applied before &.

**3:51–3:58** — So the test as usually typed, x and one equals zero, is parsed as x anded with the result of one equals zero. One equals zero is false, which is zero. Anything anded with zero is zero. The test is therefore always false, whatever x is.

> Caption: So x & 1 == 0 means x & (1 == 0). One equals zero is false, which is zero, and anything anded with zero is zero.

Exam-trap caption mode adds: *x & 1 == 0 is always false. The intended test is (x & 1) == 0, which is true for all 128 even bytes.*

**3:58–4:05** — For x equal to five the intended test answers one, because five is odd. The written test answers zero. The page counts the disagreements: the two forms differ on one hundred and twenty-eight of the two hundred and fifty-six bytes, which is exactly the even ones.

> Caption: For x equal to five the intended test answers one and the written test answers zero. The two disagree on every even number.

**4:05–4:12** — The repair is parentheses around the bit work, and then the ladder stops mattering. The same advice covers the other two members of this family: test a field with parentheses, and never write a shift inside a comparison without them.

> Caption: The repair is parentheses, not a different operator. Put them round the bit work and the ladder stops mattering.

## Scene 10. XOR swap, and the aliasing that eats it

*4:12 – 4:40 · objective: trace the three-XOR swap and see it destroy the value when both names are the same object*

**4:12–4:19** — Exclusive or is its own inverse: applying the same value twice returns the original. That single fact is enough to exchange two variables without a third one, using three XORs.

> Caption: XOR is its own inverse. That is enough to exchange two values with no third variable.

**4:19–4:26** — Take five and nine. The first step leaves twelve in the first variable. The second leaves five in the second. The third leaves nine in the first. The values have exchanged places and no temporary was needed.

> Caption: Five and nine: after three XORs the first holds nine and the second holds five. The values have exchanged places.

**4:26–4:33** — Now the failure. If both names refer to the same object, the first step exclusive-ors the object with itself, which is zero. The next two steps keep it zero. The value is destroyed, and it is destroyed silently.

> Caption: But if both names refer to the same object, the first XOR zeroes it, and the other two keep it zero. The value is gone.

Exam-trap caption mode adds: *Any XOR swap must be guarded with if (a != b), or replaced with a temporary. With a temporary there is no aliasing case at all.*

**4:33–4:40** — In practice a compiler swaps two variables through a register, and the temporary version compiles to the same code or better. The XOR swap is worth knowing because questions are asked about it, and because the aliasing failure is the same failure that appears whenever two names can reach one object.

> Caption: A compiler already swaps through a register. The trick is worth knowing for the reading, not for the writing.

## Scene 11. Two previous-year items, recomputed

*4:40 – 5:08 · objective: settle GATE 2022 Q44 and GATE 2017 Set 1 Q55 from the bit patterns rather than from a key*

**4:40–4:47** — GATE twenty twenty-two, question forty-four, prints three values with the character conversion. Two characters are loaded into signed chars, and three expressions apply and, or and exclusive or, each followed by an arithmetic operation on the character code.

> Caption: GATE 2022, Question 44: two characters, three bitwise operators, printed with the character conversion.

**4:47–4:54** — The and of the two character codes is eighty, and adding forty-two gives one hundred and twenty-two, which is the letter z. The or is one hundred and twenty, minus forty-five gives seventy-five, the letter K. The exclusive or is forty, plus forty-three gives eighty-three, the letter S. The printed answer is z, K, S.

> Caption: Eighty and one twenty give eighty; plus forty-two is one twenty-two, the letter z. The other two follow the same way.

**4:54–5:01** — GATE twenty seventeen, set one, question fifty-five, has a function that adds the low bit of its argument to a counter and then shifts the argument right. That is the naive count of ones: add the lowest bit, drop it, repeat until nothing is left.

> Caption: GATE 2017 Set 1, Question 55: a loop that adds the low bit and shifts. That is a count of ones, one bit at a time.

**5:01–5:08** — The counter is a static variable, so it is not reset between calls: each call returns the running total of ones seen so far. The five calls return two, three, five, six and seven, and those are added into the accumulator in the caller, so the printed value is twenty-three.

> Caption: The counter is static, so it accumulates. The calls return 2, 3, 5, 6, 7 and the total printed is 23.

Exam-trap caption mode adds: *The static counter is the trap here, not the bit work. The bit work contributes the counts 2, 1, 2, 1, 1.*

## Scene 12. The procedure, in five steps

*5:08 – 5:36 · objective: consolidate width, mask, order, sign and check into a procedure that answers any question in the topic*

**5:08–5:15** — Step one of the procedure: name the width and the signedness before writing anything. Every mask depends on the width, every legal shift count depends on the width, and whether a right shift is defined depends on the signedness.

> Caption: Step one: name the width and the signedness. Every mask and every shift count depends on both.

**5:15–5:22** — Step two: write masks in an unsigned type, as one shifted left by k, or as one shifted left by w and then minus one. Never shift by the width, and never leave a mask in a signed type where the top bit is a sign.

> Caption: Step two: write masks as 1u << k or (1u << w) - 1, in an unsigned type. Never shift by the width.

**5:22–5:29** — Step three: choose the shape. A field is shift then mask. A count of ones is the clearing trick in a loop, or the parity fold if one bit is enough. A bit test is a shift and an and, with the parentheses that keep the comparison out of the bit work.

> Caption: Step three: fields are shift-then-mask, counting is x & (x-1), a bit test is (x >> k) & 1 with parentheses.

**5:29–5:36** — Steps four and five: check the sign of every operand and the size of every shift count, then verify the answer on a single byte by hand. And when a question asks what a program prints and the operation is undefined or implementation-defined, the correct answer is to say so, not to guess a number.

> Caption: Step four: check the sign and the count. Step five: verify on a byte by hand. If it is undefined, say so and stop.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
