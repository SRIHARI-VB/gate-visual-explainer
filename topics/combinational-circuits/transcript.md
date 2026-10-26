# Combinational Circuits — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/combinational-circuits/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. What makes a circuit combinational

*0:00 – 0:30 · objective: State the defining promise - outputs depend only on the inputs present now - and show that it makes the truth table a complete description of the circuit.*

**0:00–0:07** — A combinational circuit has no memory. Its outputs are a function of the inputs present right now, and of nothing else.

> Caption: A combinational circuit has no memory. Its outputs are a function of the inputs present right now, and of nothing else.

Exam-trap caption mode adds: *A circuit that holds a value between inputs - a latch, a flip-flop, a counter - is sequential, not combinational. Reading a stored value as if it were an input is the first mistake in the topic.*

**0:07–0:15** — Because there is no memory, the truth table is the circuit. Every output entry is fixed in advance and the table describes the behaviour completely.

> Caption: Because there is no memory, the truth table is the circuit. Every output entry is fixed in advance and the table describes the behaviour completely.

Exam-trap caption mode adds: *The table is complete only for combinational circuits. For a sequential circuit you would need one table per state, and the plain truth table would be a lie.*

**0:15–0:22** — To read a network, label every wire with an expression and work from the inputs toward the output. The output label is the function.

> Caption: To read a network, label every wire with an expression and work from the inputs toward the output. The output label is the function.

Exam-trap caption mode adds: *Do not skip the intermediate labels when the network is deep. Guessing the final expression from the picture is where the marks are lost, not in the algebra.*

**0:22–0:30** — The contrast is a sequential circuit: its output depends on the past as well, so its description carries states rather than rows.

> Caption: The contrast is a sequential circuit: its output depends on the past as well, so its description carries states rather than rows.

Exam-trap caption mode adds: *Combinational and sequential are not about size or speed. A very large circuit with no stored state is combinational; a single cross-coupled NOR pair is sequential.*

## Scene 2. Half adder and full adder, built from what is already proved

*0:30 – 1:00 · objective: Derive the half adder, derive the full adder, and see the full adder assembled from two half adders and one OR gate with the eight-row table checked.*

**0:30–0:37** — Adding two one-bit numbers gives a sum and a carry. That is the half adder: sum is exclusive-OR, carry is AND.

> Caption: Adding two one-bit numbers gives a sum and a carry. That is the half adder: sum is exclusive-OR, carry is AND.

Exam-trap caption mode adds: *A half adder is not a small full adder. It has no carry input at all, so it can only ever handle the least significant column.*

**0:37–0:45** — Adding three bits - two operands and a carry in - is the full adder. Sum is one when an odd number of inputs is one; carry out when at least two are one.

> Caption: Adding three bits - two operands and a carry in - is the full adder. Sum is one when an odd number of inputs is one; carry out when at least two are one.

Exam-trap caption mode adds: *The carry out is not the majority of two bits; it is the majority of all three. Writing A AND B alone drops the case where a carry in plus one operand carries out.*

**0:45–0:52** — Two half adders and one OR gate make a full adder: the first adds the operands, the second adds that sum to the carry in, and the two carries are OR-ed.

> Caption: Two half adders and one OR gate make a full adder: the first adds the operands, the second adds that sum to the carry in, and the two carries are OR-ed.

Exam-trap caption mode adds: *The two intermediate carries are mutually exclusive, and that is why OR is safe. Reusing this circuit for a different purpose without checking that property is how wrong designs get built.*

**0:52–1:00** — The check that matters: the assembled circuit agrees with the eight-row table on all eight inputs. That is a proof for a two-output circuit.

> Caption: The check that matters: the assembled circuit agrees with the eight-row table on all eight inputs. That is a proof for a two-output circuit.

Exam-trap caption mode adds: *For a bigger circuit exhaustive checking stops being practical, and an argument replaces it. Do not claim a proof from a handful of test rows.*

## Scene 3. The ripple-carry adder and where its delay comes from

*1:00 – 1:30 · objective: Chain full adders, watch one carry walk up the chain, and read the worst-case delay of 2n gate levels off the model - including the single input that forces the longest walk.*

**1:00–1:07** — A four-bit adder is four full adders in a row. The carry out of one column is the carry in of the next, and that is the whole design.

> Caption: A four-bit adder is four full adders in a row. The carry out of one column is the carry in of the next, and that is the whole design.

Exam-trap caption mode adds: *The adder produces n plus one result bits. Dropping the last carry out silently turns an addition into an addition modulo 2 to the n.*

**1:07–1:15** — Inside one column the carry passes through two gate levels: an AND, then the OR. So a carry that walks the whole chain costs two levels per column.

> Caption: Inside one column the carry passes through two gate levels: an AND, then the OR. So a carry that walks the whole chain costs two levels per column.

Exam-trap caption mode adds: *Quoting a delay without the gate model is meaningless. A different implementation of the same adder has a different number, so the model is part of the answer.*

**1:15–1:22** — Five plus three: the carry is generated in column zero, propagates through columns one and two, and dies at column three. Four bits, one carry, answer eight.

> Caption: Five plus three: the carry is generated in column zero, propagates through columns one and two, and dies at column three. Four bits, one carry, answer eight.

Exam-trap caption mode adds: *The carry does not have to reach the top. A carry that stops early is the common case, which is exactly why the next scene asks about the worst case instead.*

**1:22–1:30** — In an eight-bit adder with A equal to one, exactly one value of B makes the carry walk every stage: B equal to minus one, all ones.

> Caption: In an eight-bit adder with A equal to one, exactly one value of B makes the carry walk every stage: B equal to minus one, all ones.

Exam-trap caption mode adds: *In real hardware the settling time depends on the critical path, not on the data. This question uses the data-dependent model on purpose, and the answer only makes sense inside that model.*

## Scene 4. Carry look-ahead: turning a ripple into a formula

*1:30 – 2:00 · objective: Introduce generate and propagate, unroll the carry recurrence, and show why the depth is a constant with wide gates but grows as the logarithm of n with two-input gates.*

**1:30–1:37** — Two facts decide a column. Generate: both bits are one, so this column makes a carry whatever arrives. Propagate: exactly one bit is one, so this column passes an arriving carry along.

> Caption: Two facts decide a column. Generate: both bits are one, so this column makes a carry whatever arrives. Propagate: exactly one bit is one, so this column passes an arriving carry along.

Exam-trap caption mode adds: *Some texts define p as a OR b, which is also valid for the recurrence. Mixing the two definitions inside one derivation produces a wrong formula, so fix the definition before using it.*

**1:37–1:45** — Now substitute the recurrence into itself. The carry into column four is written directly in terms of the inputs, with no dependence on the carries below it.

> Caption: Now substitute the recurrence into itself. The carry into column four is written directly in terms of the inputs, with no dependence on the carries below it.

Exam-trap caption mode adds: *The unrolled formula is longer, not shorter. It is bought with gates, and the trade is only worth making when the delay matters - which is the reason it exists.*

**1:45–1:52** — With gates wide enough, every carry is two levels deep, so the depth is a constant. That is the ideal, and it is not what a real gate library gives you.

> Caption: With gates wide enough, every carry is two levels deep, so the depth is a constant. That is the ideal, and it is not what a real gate library gives you.

Exam-trap caption mode adds: *Constant depth with unbounded fan-in is a statement about an idealised gate. The exam question that follows is asked precisely because the ideal is not available.*

**1:52–2:00** — Restrict every gate to two inputs and the deepest term needs the logarithm of n plus one levels. That logarithm is the answer to the GATE 2016 question.

> Caption: Restrict every gate to two inputs and the deepest term needs the logarithm of n plus one levels. That logarithm is the answer to the GATE 2016 question.

Exam-trap caption mode adds: *The answer is not theta of n. The ripple was linear; look-ahead is logarithmic even in the worst gate library, and that difference is the point of the block.*

## Scene 5. One adder that also subtracts

*2:00 – 2:30 · objective: Build the half subtractor, then make the adder subtract by complementing and adding one, and separate carry out from overflow.*

**2:00–2:07** — Subtracting one bit from one bit gives a difference and a borrow: difference is exclusive-OR, borrow is NOT of the first bit AND the second.

> Caption: Subtracting one bit from one bit gives a difference and a borrow: difference is exclusive-OR, borrow is NOT of the first bit AND the second.

Exam-trap caption mode adds: *The borrow is not symmetric. Swapping the operands changes the borrow and leaves the difference alone, so an asymmetric gate is expected, not a mistake.*

**2:07–2:15** — You do not need a subtractor. Complement the second operand and add one, and the adder does the work: A plus NOT B plus one.

> Caption: You do not need a subtractor. Complement the second operand and add one, and the adder does the work: A plus NOT B plus one.

Exam-trap caption mode adds: *The same line must do both jobs. Inverting B without adding one subtracts an extra one, and the answer is off by one - the classic single-mark error in this topic.*

**2:15–2:22** — The result is correct modulo sixteen for every pair of four-bit inputs, in both modes. The page checks all 512 combinations.

> Caption: The result is correct modulo sixteen for every pair of four-bit inputs, in both modes. The page checks all 512 combinations.

Exam-trap caption mode adds: *Correct modulo sixteen is not the same as correct as a signed number. The result wraps, and only the overflow flag tells you that it wrapped.*

**2:22–2:30** — Overflow is not the carry out. It is the carry into the sign column exclusive-OR the carry out of it, and the two can disagree.

> Caption: Overflow is not the carry out. It is the carry into the sign column exclusive-OR the carry out of it, and the two can disagree.

Exam-trap caption mode adds: *This is the most-repeated trap in the number-representation topic and it reappears here. Reporting the carry out as overflow loses the mark even when the sum bits are right.*

## Scene 6. The multiplexer: a switch that computes

*2:30 – 3:00 · objective: Read the 4-to-1 multiplexer equation, build it from three 2-to-1 switches, and see how the select-line order decides which minterm each data input owns.*

**2:30–2:37** — A multiplexer has two to the power n data inputs, n select lines and one output. The select lines choose which data input is delivered.

> Caption: A multiplexer has two to the power n data inputs, n select lines and one output. The select lines choose which data input is delivered.

Exam-trap caption mode adds: *The number of select lines is the base-two logarithm of the number of data inputs, not the number of data inputs. A 8-to-1 multiplexer has three select lines, not eight.*

**2:37–2:45** — Three 2-to-1 switches build one 4-to-1 multiplexer: two switches choose within each pair, and the third chooses between the pairs.

> Caption: Three 2-to-1 switches build one 4-to-1 multiplexer: two switches choose within each pair, and the third chooses between the pairs.

Exam-trap caption mode adds: *The count is 2 to the n minus one switches, not 2 to the n. The last switch replaces two, which is where the minus one comes from.*

**2:45–2:52** — Reading a multiplexer circuit is one substitution: the select lines are the variables, so each data input owns one minterm of the select variables.

> Caption: Reading a multiplexer circuit is one substitution: the select lines are the variables, so each data input owns one minterm of the select variables.

Exam-trap caption mode adds: *The order of the select lines matters. Swapping which select line is high-order permutes the data inputs, and the answer changes. The question states the order; use the stated one.*

**2:52–3:00** — Because the data inputs are constants or variables, a multiplexer is a lookup table: it can hold any function of its select lines.

> Caption: Because the data inputs are constants or variables, a multiplexer is a lookup table: it can hold any function of its select lines.

Exam-trap caption mode adds: *Universal for three variables means exactly that. Four-variable functions do not all fit, and the 2023 question uses a tree of multiplexers precisely to get more select lines.*

## Scene 7. Implementing a function with a multiplexer

*3:00 – 3:30 · objective: Implement a three-variable function on an 8-to-1 multiplexer, then on a 4-to-1 by moving a variable onto the data lines, and count the switches needed.*

**3:00–3:07** — The straightforward method: put the three variables on the select lines and the eight table entries on the eight data inputs.

> Caption: The straightforward method: put the three variables on the select lines and the eight table entries on the eight data inputs.

Exam-trap caption mode adds: *The select order decides which table row is which input. Writing the table with the wrong bit order gives a valid circuit for a different function.*

**3:07–3:15** — The cheaper method: two variables on the selects and the third on the data lines, so each data input is zero, one, the variable, or its complement.

> Caption: The cheaper method: two variables on the selects and the third on the data lines, so each data input is zero, one, the variable, or its complement.

Exam-trap caption mode adds: *Only four possibilities exist for a data input, so a 4-to-1 multiplexer handles any three-variable function. But you must read the function on each pair as a function of the remaining variable, not as a single bit.*

**3:15–3:22** — The smallest case: one select line, two data inputs. To realise T plus R, tie R to one data input, logic one to the other, and T to the select.

> Caption: The smallest case: one select line, two data inputs. To realise T plus R, tie R to one data input, logic one to the other, and T to the select.

Exam-trap caption mode adds: *More than one wiring works, because absorption has more than one form. Under exam conditions eliminate the options rather than searching for the unique answer.*

**3:22–3:30** — Count the switches before you draw: a 2 to the n-to-1 multiplexer needs 2 to the n minus one 2-to-1 switches, and a tree of them gives more select lines.

> Caption: Count the switches before you draw: a 2 to the n-to-1 multiplexer needs 2 to the n minus one 2-to-1 switches, and a tree of them gives more select lines.

Exam-trap caption mode adds: *The high select line of the tree is the most significant bit. Treating it as the least significant reverses the data-input order and gives the wrong bit string.*

## Scene 8. The decoder: all minterms at once

*3:30 – 4:00 · objective: See the n-to-2^n decoder light exactly one line, wire it to an OR gate to build any sum of products, and count the decoders a bigger decoder needs.*

**3:30–3:37** — A decoder takes n inputs and drives exactly one of 2 to the power n outputs high. It is a minterm generator: output k is high exactly when the input spells k.

> Caption: A decoder takes n inputs and drives exactly one of 2 to the power n outputs high. It is a minterm generator: output k is high exactly when the input spells k.

Exam-trap caption mode adds: *A decoder is not an encoder reversed in the counting sense. The encoder maps a one-hot input to a binary code and needs a priority rule when several inputs are high.*

**3:37–3:45** — Because the outputs are the minterms, one OR gate over the chosen lines builds any sum of products. Decoder plus OR is a general function generator.

> Caption: Because the outputs are the minterms, one OR gate over the chosen lines builds any sum of products. Decoder plus OR is a general function generator.

Exam-trap caption mode adds: *An active-low decoder output needs a NAND instead of an OR, by De Morgan. Wiring an OR to active-low outputs computes the complement of the intended function.*

**3:45–3:52** — An enable input turns a decoder into a selector: with the enable held low every output stays low, so the block is silent until it is chosen.

> Caption: An enable input turns a decoder into a selector: with the enable held low every output stays low, so the block is silent until it is chosen.

Exam-trap caption mode adds: *Without an enable there is no way to combine two small decoders without extra gates. The exam questions that forbid other gates are relying on the enable.*

**3:52–4:00** — So a 6-to-64 decoder needs nine 3-to-8 decoders: eight for the low bits and one to choose among them. That is GATE CSE 2007 Question 8.

> Caption: So a 6-to-64 decoder needs nine 3-to-8 decoders: eight for the low bits and one to choose among them. That is GATE CSE 2007 Question 8.

Exam-trap caption mode adds: *The answer is nine, not eight, and not sixty-four divided by eight rounded up. The choosing decoder is the term people forget.*

## Scene 9. When a circuit contradicts its own truth table

*4:00 – 4:30 · objective: Watch a static-1 hazard appear on A-prime-B plus AC as A falls, trace it level by level, and remove it with the consensus term the map already shows.*

**4:00–4:07** — A truth table describes the settled circuit. While the inputs change, a network with two paths that rejoin can show a value the table never contains.

> Caption: A truth table describes the settled circuit. While the inputs change, a network with two paths that rejoin can show a value the table never contains.

Exam-trap caption mode adds: *A hazard is not a bug in the algebra. The expression is correct; the timing of its implementation is not. That is why the fix is a new term rather than a new formula.*

**4:07–4:15** — Take F equal to A-bar B plus A C, with B and C both one. Then F is one for both values of A, so the output must not move at all.

> Caption: Take F equal to A-bar B plus A C, with B and C both one. Then F is one for both values of A, so the output must not move at all.

Exam-trap caption mode adds: *A function that is constant along an input change is exactly where a static hazard lives. Where the function must change, a glitch is invisible and harmless.*

**4:15–4:22** — Now let A fall. The term A C turns off before the term A-bar B turns on, and for one gate level the OR gate sees two zeros: a dip to zero.

> Caption: Now let A fall. The term A C turns off before the term A-bar B turns on, and for one gate level the OR gate sees two zeros: a dip to zero.

Exam-trap caption mode adds: *This is a static-1 hazard, not a dynamic one. A dynamic hazard produces several transitions where one was expected; here the output is supposed to stay at one and it briefly does not.*

**4:22–4:30** — The repair is the consensus term B C. It is redundant in the algebra, it holds one steady while A moves, and it is exactly the pair of adjacent ones the map already shows.

> Caption: The repair is the consensus term B C. It is redundant in the algebra, it holds one steady while A moves, and it is exactly the pair of adjacent ones the map already shows.

Exam-trap caption mode adds: *Adding a term that is not a consensus of two terms changes the function. The repair is specific: only the term covering the adjacent pair is safe.*

## Scene 10. One table to hold: block, cost, and the five traps

*4:30 – 5:00 · objective: Hold the four building blocks against their inputs, outputs, delay and the one mistake each invites.*

**4:30–4:37** — Four blocks, four jobs: the adder adds, the subtractor borrows, the multiplexer selects, the decoder enumerates. Each is a function of its inputs and nothing more.

> Caption: Four blocks, four jobs: the adder adds, the subtractor borrows, the multiplexer selects, the decoder enumerates. Each is a function of its inputs and nothing more.

Exam-trap caption mode adds: *Do not answer a design question with the block you remember rather than the block the question forces. "Implement using only 2-to-1 multiplexers" rules out the decoder.*

**4:37–4:45** — Costs: two gate levels per column for the ripple, logarithmic depth for look-ahead with two-input gates, one level for a multiplexer output, and one decoder per eight outputs.

> Caption: Costs: two gate levels per column for the ripple, logarithmic depth for look-ahead with two-input gates, one level for a multiplexer output, and one decoder per eight outputs.

Exam-trap caption mode adds: *A delay quoted without the gate model, or a gate count quoted without the fan-in limit, is not an answer. State the model first.*

**4:45–4:52** — Five traps: the select order, the forgotten choosing decoder, the delay model, the missing adjacency check, and carry mistaken for overflow.

> Caption: Five traps: the select order, the forgotten choosing decoder, the delay model, the missing adjacency check, and carry mistaken for overflow.

Exam-trap caption mode adds: *All five are cheap to avoid: write the select order down, count the choosing block, state the gate model, check the map for adjacent ones, and compare the carry into and out of the sign column.*

**4:52–5:00** — The rule to carry out: every combinational question is answered by naming the function, then the block, then the cost - in that order.

> Caption: The rule to carry out: every combinational question is answered by naming the function, then the block, then the cost - in that order.

Exam-trap caption mode adds: *Skipping the first step is what produces a circuit that is fast, small and computes the wrong function - the most expensive kind of wrong answer.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
