# Arithmetic Algorithms Booth Division Cla — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/arithmetic-algorithms-booth-division-cla/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Three machines, one adder

*0:00 – 0:30 · objective: See why representation is not enough: multiplying, dividing and adding fast are algorithms over registers, and each is judged by how many operations it takes.*

**0:00–0:07** — The last lesson gave us bit patterns. This one asks what the machine does with them. A four-bit adder cannot multiply, cannot divide, and cannot add sixty-four bits in one step. Each of those needs an algorithm.

> Caption: A four-bit adder cannot multiply, cannot divide, and cannot add sixty-four bits in one step.

Exam-trap caption mode adds: *A question that says "arithmetic" may be asking about representation or about an algorithm. Check which one before computing.*

**0:07–0:15** — The multiplier is given an adder and a shifter, nothing else. Thirteen times eleven in four bits costs three additions and four shifts, and the page will run that loop in a moment.

> Caption: A multiplier has only add and shift. Thirteen times eleven in four bits: three additions, four shifts.

**0:15–0:22** — The divider subtracts and shifts. Seven divided by three is two remainder one, and the two published algorithms differ only in what they do when the trial subtraction goes negative.

> Caption: A divider has only subtract and shift: seven divided by three is two remainder one.

**0:22–0:30** — Even the adder is a choice. A ripple adder waits one level per bit. A lookahead adder computes every carry from bits that are already available, and that is where the logarithm comes from.

> Caption: And the adder itself is an algorithm: the ripple waits n levels, the lookahead waits two log two n plus two.

## Scene 2. Shift-and-add multiplication

*0:30 – 1:00 · objective: Run 13 x 11 in four bits through the classic shift-and-add loop and see that the additions equal the 1s in the multiplier, and that A needs n+1 bits.*

**0:30–0:37** — Two registers hold the work. A holds the running sum and Q holds the multiplier. After each step the pair shifts right together, so the multiplier is consumed from the bottom.

> Caption: Two registers: A holds the running sum, Q holds the multiplier, and the pair shifts right together.

**0:37–0:45** — Step one. The low bit of Q is one, so add M into A. Zero plus thirteen is thirteen, which is 01101 in five bits. Then shift the whole register right.

> Caption: Step one: Q zero is one, so add M into A, giving 01101, then shift.

**0:45–0:52** — Four steps later the product sits across A and Q as 10001111. That is one hundred and forty-three, and thirteen times eleven is one hundred and forty-three.

> Caption: Four steps later the product is 10001111, which is 143.

**0:52–1:00** — The count of additions is the count of ones in the multiplier, which is three here. That is the cost, and it is why Booth exists: three additions for a multiplier that is almost all ones is wasteful.

> Caption: The number of additions is the number of ones in the multiplier: three here, never more than n.

Exam-trap caption mode adds: *A four-bit A drops the carry at step two and the product reads 111 instead of 143: a plausible answer from a width slip.*

## Scene 3. A run of 1s is a difference

*1:00 – 1:30 · objective: Derive the Booth recoding table from 0111 = 1000 - 0001, recode a real multiplier, and check that the digits sum to its signed value.*

**1:00–1:07** — Here is the observation Booth built on. A block of ones is a difference. 0111 is 1000 minus 0001. So a long run of ones can be replaced by one subtraction at its low end and one addition at its high end.

> Caption: A block of ones is a difference: 0111 is 1000 minus 0001, so it costs one subtraction and one addition.

**1:07–1:15** — So the algorithm looks at two bits at a time. The pair 01 means a run of ones ends here, so add M. The pair 10 means a run starts here, so subtract M. The pairs 00 and 11 are inside a run and cost nothing.

> Caption: So look at two bits at a time: 01 adds M, 10 subtracts M, 00 and 11 do nothing.

Exam-trap caption mode adds: *The pair is written (current bit, bit to the right). Writing it the other way round swaps add and subtract and every trace afterwards is wrong.*

**1:15–1:22** — Recode the multiplier 1011 from the low end. The digits come out as minus one, zero, plus one, minus one. Three of the four digits are non-zero, so this multiplier costs three operations.

> Caption: Recoding 1011 from the low end gives minus one, zero, plus one, minus one.

**1:22–1:30** — Weight the digits by one, two, four and eight. The sum is minus five, and minus five is exactly the value of 1011 read as a four-bit two's complement number, even though shift-and-add reads the same pattern as eleven. The recoding is arithmetic, not a trick.

> Caption: Weighted by one, two, four and eight, those digits sum to minus five, which is the signed value of 1011.

## Scene 4. Booth in registers

*1:30 – 2:00 · objective: Execute Booth on 3 x (-4) step by step: the pair, the operation, the arithmetic right shift, and the product in eight bits.*

**1:30–1:37** — Now run it. Three times minus four in four bits. A is five bits, Q holds the multiplier 1100, and there is one extra bit, q minus one, which starts at zero.

> Caption: Three times minus four, in four bits: A is five bits, Q is 1100, and q minus one starts at zero.

**1:37–1:45** — Step one sees the pair zero zero, and step two sees zero zero again. Nothing is added. The register just shifts right twice, and because the shift is arithmetic, the sign is copied rather than filled with zeros.

> Caption: Steps one and two see the pair 00 twice: nothing is added, only the shift.

**1:45–1:52** — Step three sees one zero. That is the start of a run of ones in the multiplier, so subtract M from A. A becomes 11101, which is minus three in five bits.

> Caption: Step three sees 10, the start of a run, so subtract M: A becomes 11101.

Exam-trap caption mode adds: *Subtracting when the pair is 01 reverses the table. The check on this page recomputes every product, so the reversal would show up as 256 failures, not as a subtle error.*

**1:52–2:00** — One more step, the pair one one, no operation. The product is 11110100, which is minus twelve, and three times minus four is minus twelve. Four steps, one subtraction, because the multiplier was a single run of ones.

> Caption: Four steps and one subtraction give 11110100, which is minus twelve.

## Scene 5. Counting the operations

*2:00 – 2:30 · objective: Count add/subtract operations from the bit transitions of the multiplier, reproduce GATE 2025 Set 2 Q32, and state the best and worst cases.*

**2:00–2:07** — Now the question that decides the marks. This is the sixteen-bit multiplier from GATE CSE 2025 Set 2, question 32, written with the least significant bit on the left so the scan order matches the algorithm.

> Caption: Here is the multiplier from GATE CSE 2025 Set 2, question 32: sixteen bits, written low bit first.

**2:07–2:15** — At step k the algorithm inspects the pair made of bit k and bit k minus one, with bit minus one equal to zero. So an add or a subtract happens exactly where two neighbouring bits differ, and there are thirteen such changes.

> Caption: Each change between neighbouring bits is one add or one subtract: thirteen changes.

Exam-trap caption mode adds: *Forgetting the prepended zero loses the comparison of q zero against zero and gives twelve. That is the trap the question is built on.*

**2:15–2:22** — So the answer is thirteen, and notice that the multiplicand, all sixteen bits of it, never entered the count. Only the multiplier decides how many operations Booth performs.

> Caption: Thirteen is the answer, and the multiplicand never enters the count.

**2:22–2:30** — The extremes are worth knowing. A multiplier of all zeros costs nothing, a single run costs one operation, and the alternating pattern 0101 costs four in four bits, which is more than the two additions plain shift-and-add would need. Booth is a trade, not a free speed-up.

> Caption: Best case no operation at all, worst case four for a four-bit 0101: worse than plain shift-and-add.

## Scene 6. Restoring division

*2:30 – 3:00 · objective: Run 7 / 3 through restoring division and see the trial subtraction, the restore, and the quotient bit set from the sign.*

**2:30–2:37** — Now division. The restoring version keeps the divisor three in M, the dividend seven in Q, and the running remainder in A, which starts at zero.

> Caption: Division, restoring version: M is 0011, the dividend seven sits in Q, and A starts at zero.

**2:37–2:45** — Each step shifts the register left and tries A minus M. If the trial is negative, add M back so A is where it was, and set the quotient bit to zero. If the trial is non-negative, keep it and set the bit to one.

> Caption: Each step shifts left and tries A minus M. If the result is negative, add M back and set the quotient bit to zero.

Exam-trap caption mode adds: *Setting the quotient bit from the trial before the restore gives the complement of the quotient, which looks like a small arithmetic slip and is not.*

**2:45–2:52** — After four steps the quotient two sits in Q and the remainder one sits in A. Three times two plus one is seven, which is the definition the whole algorithm has to satisfy.

> Caption: After four steps Q holds 0010 and A holds 0001: quotient two, remainder one.

**2:52–3:00** — Three of these four steps had to restore. Half the work in a restoring divider is undoing its own subtractions, and that is the waste the next algorithm removes.

> Caption: Three of the four steps had to restore, so half the work was undoing the algorithm's own subtractions.

## Scene 7. Non-restoring division

*3:00 – 3:30 · objective: Run the same division without restoring: keep the negative remainder, choose the next operation from its sign, and apply the one final correction.*

**3:00–3:07** — The non-restoring divider never undoes anything. Before each shift it looks at the sign of the partial remainder: if it is negative it will add M, and if it is non-negative it will subtract M.

> Caption: The non-restoring divider never undoes anything: it looks at the sign of A and adds M instead of subtracting.

**3:07–3:15** — So the partial remainder is allowed to be negative, and to stay negative for several steps. That is not a bug: the next operation corrects it by adding rather than subtracting, which is exactly the restore folded into the next step.

> Caption: The remainder is allowed to go negative and stay negative for several steps.

**3:15–3:22** — Here A ends at minus two. One correction, after the loop and never inside it, adds M once. The remainder becomes one and the quotient stays two.

> Caption: Here A ends at minus two, so one correction adds M once, after the loop, and the remainder becomes one.

Exam-trap caption mode adds: *Skipping the correction leaves remainder minus two, which still satisfies M times Q plus A equals seven, so a careless check will not catch it.*

**3:22–3:30** — The correction is conditional. Seven divided by four ends with a non-negative remainder and needs nothing. Two algorithms, one answer, and one fewer operation in the middle.

> Caption: Seven divided by four ends non-negative and needs no correction: the step is conditional, not automatic.

## Scene 8. Carry-lookahead addition

*3:30 – 4:00 · objective: Replace the waiting carry by computed generate and propagate terms, verify the result against ripple carry, and count the gate levels for fan-in 2 and for unbounded fan-in.*

**3:30–3:37** — The last machine is the adder itself. A ripple adder computes each carry from the carry before it, so an n-bit addition takes n gate levels, and each level waits for the one before.

> Caption: A ripple adder waits: each carry is computed from the carry before it, so n bits take n levels.

**3:37–3:45** — Lookahead replaces the wait. Every column produces a generate bit and a propagate bit, and both are available immediately. A carry is then a sum of products of those bits, so all the carries can start at the same time.

> Caption: Lookahead computes every carry from generate and propagate bits that are already available.

**3:45–3:52** — On thirteen plus eleven the computed carries match the ripple carries exactly, and the carry out is one, so the sum is twenty-four. The page checks this on all 256 four-bit pairs and on 600 eight-bit pairs.

> Caption: On thirteen plus eleven the computed carries match ripple carry exactly, and the carry out is one.

**3:52–4:00** — Now the cost. With two-input gates, the largest carry needs an and tree and an or tree over at most n literals, so the depth is two log two n plus two. That is theta of log n, which is the answer to GATE CSE 2016 Set 1, question 33. With unbounded fan-in it would be four levels, constant.

> Caption: With two-input gates the depth is two log two n plus two levels, which is theta of log n: the 2016 question.

Exam-trap caption mode adds: *The claim that a lookahead adder is constant time is only true with unbounded fan-in. Bounded fan-in turns the logarithm back on.*

## Scene 9. The three traps

*4:00 – 4:30 · objective: Name the three bookkeeping errors that produce a plausible wrong answer: the missing q-1 bit, the skipped correction, and the claim that a lookahead adder is constant time.*

**4:00–4:07** — Three bookkeeping errors decide most of the marks here. The first is forgetting the prepended q minus one. Drop it and the comparison of the low bit against zero disappears, and the count is twelve.

> Caption: Trap one: forgetting the prepended q minus one bit, and answering twelve instead of thirteen.

**4:07–4:15** — The second is skipping the correction in non-restoring division. The quotient is right, the identity still holds with a negative remainder, and only the range condition gives the error away.

> Caption: Trap two: skipping the correction step in non-restoring division.

**4:15–4:22** — The third is calling a lookahead adder constant time. That is true only when the gates have unbounded fan-in. With two-input gates, sixteen bits take ten levels, not one.

> Caption: Trap three: calling a lookahead adder constant time when the gates have bounded fan-in.

Exam-trap caption mode adds: *Read the fan-in before you answer any delay question. The same adder is theta of one or theta of log n depending on one phrase.*

**4:22–4:30** — None of the three is an arithmetic mistake. Each is a rule about the algorithm itself. That is why they are worth memorising as rules and not as worked examples.

> Caption: None of the three is arithmetic; each is a rule about the algorithm's own bookkeeping.

## Scene 10. Which machine is being asked about

*4:30 – 5:00 · objective: Turn the lesson into a decision procedure: read the wording, fix the width and the fan-in, then compute the count.*

**4:30–4:37** — So here is the procedure. If the question asks for the number of additions or subtractions with a multiplier, count the transitions of Q with a zero prepended, and do not trace the registers at all.

> Caption: If the question asks for a number of additions with a multiplier, count the transitions of Q.

**4:37–4:45** — If it gives you a register trace, read the pair: add on zero one, subtract on one zero, and check that the shift is arithmetic. A logical shift is the giveaway in a wrong option.

> Caption: If it gives you a register trace, the pairs tell you the operation: add on 01, subtract on 10.

**4:45–4:52** — For division, check both conditions at the end. The identity dividend equals M times Q plus A catches most errors, and the range zero to M catches the rest, including a skipped correction.

> Caption: For division, check both conditions at the end: the identity, and the range of the remainder.

**4:52–5:00** — For a delay question, fix the fan-in first. The depth is two log base k of n plus two for fan-in k, which is theta of log n for any fixed k and constant only when the fan-in grows with n.

> Caption: For a delay question, fix the gate fan-in first: two log base k of n plus two levels.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
