/* ==========================================================================
   combinational-circuits - THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs - never edited by hand.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'memoryless',
      n: 1,
      title: 'What makes a circuit combinational',
      start: 0, end: 30,
      objective: 'State the defining promise - outputs depend only on the inputs present now - and show that it makes the truth table a complete description of the circuit.'
    },
    {
      id: 'adder',
      n: 2,
      title: 'Half adder and full adder, built from what is already proved',
      start: 30, end: 60,
      objective: 'Derive the half adder, derive the full adder, and see the full adder assembled from two half adders and one OR gate with the eight-row table checked.'
    },
    {
      id: 'ripple',
      n: 3,
      title: 'The ripple-carry adder and where its delay comes from',
      start: 60, end: 90,
      objective: 'Chain full adders, watch one carry walk up the chain, and read the worst-case delay of 2n gate levels off the model - including the single input that forces the longest walk.'
    },
    {
      id: 'cla',
      n: 4,
      title: 'Carry look-ahead: turning a ripple into a formula',
      start: 90, end: 120,
      objective: 'Introduce generate and propagate, unroll the carry recurrence, and show why the depth is a constant with wide gates but grows as the logarithm of n with two-input gates.'
    },
    {
      id: 'subtract',
      n: 5,
      title: 'One adder that also subtracts',
      start: 120, end: 150,
      objective: 'Build the half subtractor, then make the adder subtract by complementing and adding one, and separate carry out from overflow.'
    },
    {
      id: 'mux',
      n: 6,
      title: 'The multiplexer: a switch that computes',
      start: 150, end: 180,
      objective: 'Read the 4-to-1 multiplexer equation, build it from three 2-to-1 switches, and see how the select-line order decides which minterm each data input owns.'
    },
    {
      id: 'muxfn',
      n: 7,
      title: 'Implementing a function with a multiplexer',
      start: 180, end: 210,
      objective: 'Implement a three-variable function on an 8-to-1 multiplexer, then on a 4-to-1 by moving a variable onto the data lines, and count the switches needed.'
    },
    {
      id: 'decoder',
      n: 8,
      title: 'The decoder: all minterms at once',
      start: 210, end: 240,
      objective: 'See the n-to-2^n decoder light exactly one line, wire it to an OR gate to build any sum of products, and count the decoders a bigger decoder needs.'
    },
    {
      id: 'hazard',
      n: 9,
      title: 'When a circuit contradicts its own truth table',
      start: 240, end: 270,
      objective: 'Watch a static-1 hazard appear on A-prime-B plus AC as A falls, trace it level by level, and remove it with the consensus term the map already shows.'
    },
    {
      id: 'table',
      n: 10,
      title: 'One table to hold: block, cost, and the five traps',
      start: 270, end: 300,
      objective: 'Hold the four building blocks against their inputs, outputs, delay and the one mistake each invites.'
    }
  ],

  events: [

    /* ---------------- scene 1: what combinational means ---------------- */
    {
      id: 'mem-1', start: 0, end: 7.5, scene: 'memoryless',
      caption: 'A combinational circuit has no memory. Its outputs are a function of the inputs present right now, and of nothing else.',
      detail: 'The same input vector always produces the same output vector, whenever it arrives and whatever arrived before it. That is the whole promise, and every other property in this lesson follows from it.',
      keyword: 'no memory',
      trap: 'A circuit that holds a value between inputs - a latch, a flip-flop, a counter - is sequential, not combinational. Reading a stored value as if it were an input is the first mistake in the topic.',
      narration: 'A combinational circuit has no memory. Its outputs are a function of the inputs present right now, and of nothing else.'
    },
    {
      id: 'mem-2', start: 7.5, end: 15, scene: 'memoryless',
      caption: 'Because there is no memory, the truth table is the circuit. Every output entry is fixed in advance and the table describes the behaviour completely.',
      detail: 'For n inputs the table has 2 to the power n rows. A circuit and its truth table are two descriptions of one function, which is why minimisation of a function and design of a circuit are the same activity.',
      keyword: 'the truth table is the circuit',
      trap: 'The table is complete only for combinational circuits. For a sequential circuit you would need one table per state, and the plain truth table would be a lie.',
      narration: 'Because there is no memory, the truth table is the circuit. Every output entry is fixed in advance and the table describes the behaviour completely.'
    },
    {
      id: 'mem-3', start: 15, end: 22.5, scene: 'memoryless',
      caption: 'To read a network, label every wire with an expression and work from the inputs toward the output. The output label is the function.',
      detail: 'A gate is a small function, and the wire leaving it carries that function of whatever feeds it. Substituting along the wires gives the output expression without any guessing. This is the whole method for circuit-reading questions.',
      keyword: 'label every wire',
      trap: 'Do not skip the intermediate labels when the network is deep. Guessing the final expression from the picture is where the marks are lost, not in the algebra.',
      narration: 'To read a network, label every wire with an expression and work from the inputs toward the output. The output label is the function.'
    },
    {
      id: 'mem-4', start: 22.5, end: 30, scene: 'memoryless',
      caption: 'The contrast is a sequential circuit: its output depends on the past as well, so its description carries states rather than rows.',
      detail: 'A sequential circuit keeps a state, and the next state is a function of the current state and the inputs. That is exactly one extra ingredient, and it changes the analysis from a table into a machine.',
      keyword: 'carries states rather than rows',
      trap: 'Combinational and sequential are not about size or speed. A very large circuit with no stored state is combinational; a single cross-coupled NOR pair is sequential.',
      narration: 'The contrast is a sequential circuit: its output depends on the past as well, so its description carries states rather than rows.'
    },

    /* ---------------- scene 2: adders ---------------- */
    {
      id: 'add-1', start: 30, end: 37.5, scene: 'adder',
      caption: 'Adding two one-bit numbers gives a sum and a carry. That is the half adder: sum is exclusive-OR, carry is AND.',
      detail: 'Four rows. Sum is one exactly when the two bits differ, which is exclusive-OR. Carry is one exactly when both bits are one, which is AND. There is no carry input, which is what makes it a half adder.',
      keyword: 'sum is exclusive-OR, carry is AND',
      trap: 'A half adder is not a small full adder. It has no carry input at all, so it can only ever handle the least significant column.',
      narration: 'Adding two one-bit numbers gives a sum and a carry. That is the half adder: sum is exclusive-OR, carry is AND.'
    },
    {
      id: 'add-2', start: 37.5, end: 45, scene: 'adder',
      caption: 'Adding three bits - two operands and a carry in - is the full adder. Sum is one when an odd number of inputs is one; carry out when at least two are one.',
      detail: 'Eight rows. The sum column holds four ones, at the rows with one or three ones among the inputs. The carry column holds four ones, at the rows with two or three. Both statements are descriptions of the same table, and both are worth knowing.',
      keyword: 'odd number of inputs is one',
      trap: 'The carry out is not the majority of two bits; it is the majority of all three. Writing A AND B alone drops the case where a carry in plus one operand carries out.',
      narration: 'Adding three bits - two operands and a carry in - is the full adder. Sum is one when an odd number of inputs is one; carry out when at least two are one.'
    },
    {
      id: 'add-3', start: 45, end: 52.5, scene: 'adder',
      caption: 'Two half adders and one OR gate make a full adder: the first adds the operands, the second adds that sum to the carry in, and the two carries are OR-ed.',
      detail: 'Write s1 = A xor B and c1 = A and B, then s = s1 xor Cin and c2 = s1 and Cin, and finally Cout = c1 or c2. The two carries can never both be one, so OR and exclusive-OR give the same answer here.',
      keyword: 'the two carries are OR-ed',
      trap: 'The two intermediate carries are mutually exclusive, and that is why OR is safe. Reusing this circuit for a different purpose without checking that property is how wrong designs get built.',
      narration: 'Two half adders and one OR gate make a full adder: the first adds the operands, the second adds that sum to the carry in, and the two carries are OR-ed.'
    },
    {
      id: 'add-4', start: 52.5, end: 60, scene: 'adder',
      caption: 'The check that matters: the assembled circuit agrees with the eight-row table on all eight inputs. That is a proof for a two-output circuit.',
      detail: 'There are only eight input vectors, so comparing every row is exhaustive, not a sample. The page runs this comparison and reports it, which is why the number in the check panel is eight and not a promise.',
      keyword: 'agrees on all eight inputs',
      trap: 'For a bigger circuit exhaustive checking stops being practical, and an argument replaces it. Do not claim a proof from a handful of test rows.',
      narration: 'The check that matters: the assembled circuit agrees with the eight-row table on all eight inputs. That is a proof for a two-output circuit.'
    },

    /* ---------------- scene 3: ripple carry ---------------- */
    {
      id: 'rip-1', start: 60, end: 67.5, scene: 'ripple',
      caption: 'A four-bit adder is four full adders in a row. The carry out of one column is the carry in of the next, and that is the whole design.',
      detail: 'Column i adds a-i, b-i and the carry arriving from column i minus one. The first carry in is the external one, and the last carry out is the fifth bit of the sum.',
      keyword: 'four full adders in a row',
      trap: 'The adder produces n plus one result bits. Dropping the last carry out silently turns an addition into an addition modulo 2 to the n.',
      narration: 'A four-bit adder is four full adders in a row. The carry out of one column is the carry in of the next, and that is the whole design.'
    },
    {
      id: 'rip-2', start: 67.5, end: 75, scene: 'ripple',
      caption: 'Inside one column the carry passes through two gate levels: an AND, then the OR. So a carry that walks the whole chain costs two levels per column.',
      detail: 'That gives 2n gate levels for the final carry out and 2n plus one for the last sum bit, under the standard two-level carry logic. The numbers come from the gate model stated on this page, not from a stopwatch.',
      keyword: 'two gate levels',
      trap: 'Quoting a delay without the gate model is meaningless. A different implementation of the same adder has a different number, so the model is part of the answer.',
      narration: 'Inside one column the carry passes through two gate levels: an AND, then the OR. So a carry that walks the whole chain costs two levels per column.'
    },
    {
      id: 'rip-3', start: 75, end: 82.5, scene: 'ripple',
      caption: 'Five plus three: the carry is generated in column zero, propagates through columns one and two, and dies at column three. Four bits, one carry, answer eight.',
      detail: 'Five is 0101 and three is 0011. Column zero adds one and one, producing a carry. Columns one and two pass it along because exactly one operand bit is set. Column three has both bits zero, so the carry stops and the sum settles.',
      keyword: 'dies at column three',
      trap: 'The carry does not have to reach the top. A carry that stops early is the common case, which is exactly why the next scene asks about the worst case instead.',
      narration: 'Five plus three: the carry is generated in column zero, propagates through columns one and two, and dies at column three. Four bits, one carry, answer eight.'
    },
    {
      id: 'rip-4', start: 82.5, end: 90, scene: 'ripple',
      caption: 'In an eight-bit adder with A equal to one, exactly one value of B makes the carry walk every stage: B equal to minus one, all ones.',
      detail: 'For each B the carry chain has a length, and the 256 values of B split into chains of length zero through eight with counts 128, 64, 32, 16, 8, 4, 2, 1 and 1. Only B equal to minus one reaches eight stages, which is GATE CSE 2016 Set 2 Question 7.',
      keyword: 'B equal to minus one',
      trap: 'In real hardware the settling time depends on the critical path, not on the data. This question uses the data-dependent model on purpose, and the answer only makes sense inside that model.',
      narration: 'In an eight-bit adder with A equal to one, exactly one value of B makes the carry walk every stage: B equal to minus one, all ones.'
    },

    /* ---------------- scene 4: carry look-ahead ---------------- */
    {
      id: 'cla-1', start: 90, end: 97.5, scene: 'cla',
      caption: 'Two facts decide a column. Generate: both bits are one, so this column makes a carry whatever arrives. Propagate: exactly one bit is one, so this column passes an arriving carry along.',
      detail: 'g equals a AND b, and p equals a exclusive-OR b. With those two bits the carry out of the column is g OR (p AND carry in) - the same recurrence as before, now written in named parts.',
      keyword: 'Generate and propagate',
      trap: 'Some texts define p as a OR b, which is also valid for the recurrence. Mixing the two definitions inside one derivation produces a wrong formula, so fix the definition before using it.',
      narration: 'Two facts decide a column. Generate: both bits are one, so this column makes a carry whatever arrives. Propagate: exactly one bit is one, so this column passes an arriving carry along.'
    },
    {
      id: 'cla-2', start: 97.5, end: 105, scene: 'cla',
      caption: 'Now substitute the recurrence into itself. The carry into column four is written directly in terms of the inputs, with no dependence on the carries below it.',
      detail: 'Substituting four times gives c-four as g-three, or p-three g-two, or p-three p-two g-one, or p-three p-two p-one g-zero, or p-three p-two p-one p-zero c-zero. Every term is available as soon as the operands are.',
      keyword: 'substitute the recurrence into itself',
      trap: 'The unrolled formula is longer, not shorter. It is bought with gates, and the trade is only worth making when the delay matters - which is the reason it exists.',
      narration: 'Now substitute the recurrence into itself. The carry into column four is written directly in terms of the inputs, with no dependence on the carries below it.'
    },
    {
      id: 'cla-3', start: 105, end: 112.5, scene: 'cla',
      caption: 'With gates wide enough, every carry is two levels deep, so the depth is a constant. That is the ideal, and it is not what a real gate library gives you.',
      detail: 'The unrolled expression is a sum of products: one AND per term and one OR. A gate with five inputs makes it two levels. If gates are limited, the depth becomes a function of n instead.',
      keyword: 'the depth is a constant',
      trap: 'Constant depth with unbounded fan-in is a statement about an idealised gate. The exam question that follows is asked precisely because the ideal is not available.',
      narration: 'With gates wide enough, every carry is two levels deep, so the depth is a constant. That is the ideal, and it is not what a real gate library gives you.'
    },
    {
      id: 'cla-4', start: 112.5, end: 120, scene: 'cla',
      caption: 'Restrict every gate to two inputs and the deepest term needs the logarithm of n plus one levels. That logarithm is the answer to the GATE 2016 question.',
      detail: 'Building a five-input AND from two-input ANDs takes three levels; a sixty-five input AND takes seven. So the addition time is theta of log n, not a constant, which is GATE CSE 2016 Set 1 Question 43. Grouping the bits in blocks gives the same logarithm to a different base.',
      keyword: 'the logarithm of n plus one',
      trap: 'The answer is not theta of n. The ripple was linear; look-ahead is logarithmic even in the worst gate library, and that difference is the point of the block.',
      narration: 'Restrict every gate to two inputs and the deepest term needs the logarithm of n plus one levels. That logarithm is the answer to the GATE 2016 question.'
    },

    /* ---------------- scene 5: subtraction ---------------- */
    {
      id: 'sub-1', start: 120, end: 127.5, scene: 'subtract',
      caption: 'Subtracting one bit from one bit gives a difference and a borrow: difference is exclusive-OR, borrow is NOT of the first bit AND the second.',
      detail: 'Four rows. The difference is one when the bits differ, the same rule as the sum. The borrow is one only when you subtract a one from a zero, which is X-bar AND Y. That is the half subtractor.',
      keyword: 'borrow is NOT of the first bit AND the second',
      trap: 'The borrow is not symmetric. Swapping the operands changes the borrow and leaves the difference alone, so an asymmetric gate is expected, not a mistake.',
      narration: 'Subtracting one bit from one bit gives a difference and a borrow: difference is exclusive-OR, borrow is NOT of the first bit AND the second.'
    },
    {
      id: 'sub-2', start: 127.5, end: 135, scene: 'subtract',
      caption: 'You do not need a subtractor. Complement the second operand and add one, and the adder does the work: A plus NOT B plus one.',
      detail: 'One control line M drives an exclusive-OR on every bit of B and also feeds the first carry in. With M at zero the XORs pass B through and the carry in is zero, so it adds. With M at one the XORs invert B and the carry in is one, so it subtracts.',
      keyword: 'Complement the second operand and add one',
      trap: 'The same line must do both jobs. Inverting B without adding one subtracts an extra one, and the answer is off by one - the classic single-mark error in this topic.',
      narration: 'You do not need a subtractor. Complement the second operand and add one, and the adder does the work: A plus NOT B plus one.'
    },
    {
      id: 'sub-3', start: 135, end: 142.5, scene: 'subtract',
      caption: 'The result is correct modulo sixteen for every pair of four-bit inputs, in both modes. The page checks all 512 combinations.',
      detail: 'Modulo arithmetic is what makes one adder enough: subtraction is addition of a negative number, and the two-complement encoding is designed so that this needs no special case. The carry out simply means something different in the two modes.',
      keyword: 'correct modulo sixteen',
      trap: 'Correct modulo sixteen is not the same as correct as a signed number. The result wraps, and only the overflow flag tells you that it wrapped.',
      narration: 'The result is correct modulo sixteen for every pair of four-bit inputs, in both modes. The page checks all 512 combinations.'
    },
    {
      id: 'sub-4', start: 142.5, end: 150, scene: 'subtract',
      caption: 'Overflow is not the carry out. It is the carry into the sign column exclusive-OR the carry out of it, and the two can disagree.',
      detail: 'The check runs all 256 pairs and compares the flag against the true signed overflow condition; they agree on every pair. A carry out of the top column is normal when subtracting a negative number and is not an error.',
      keyword: 'Overflow is not the carry out',
      trap: 'This is the most-repeated trap in the number-representation topic and it reappears here. Reporting the carry out as overflow loses the mark even when the sum bits are right.',
      narration: 'Overflow is not the carry out. It is the carry into the sign column exclusive-OR the carry out of it, and the two can disagree.'
    },

    /* ---------------- scene 6: multiplexer ---------------- */
    {
      id: 'mux-1', start: 150, end: 157.5, scene: 'mux',
      caption: 'A multiplexer has two to the power n data inputs, n select lines and one output. The select lines choose which data input is delivered.',
      detail: 'The 4-to-1 equation is S1-bar S0-bar I0, or S1-bar S0 I1, or S1 S0-bar I2, or S1 S0 I3. Four terms, one per select pattern, and each term enables exactly one data input.',
      keyword: 'n select lines and one output',
      trap: 'The number of select lines is the base-two logarithm of the number of data inputs, not the number of data inputs. A 8-to-1 multiplexer has three select lines, not eight.',
      narration: 'A multiplexer has two to the power n data inputs, n select lines and one output. The select lines choose which data input is delivered.'
    },
    {
      id: 'mux-2', start: 157.5, end: 165, scene: 'mux',
      caption: 'Three 2-to-1 switches build one 4-to-1 multiplexer: two switches choose within each pair, and the third chooses between the pairs.',
      detail: 'The low select line drives the first two switches in parallel and the high select line drives the third. The pattern repeats, so an 2 to the n-to-1 multiplexer needs 2 to the n minus one switches - three for 4-to-1 and seven for 8-to-1.',
      keyword: 'Three 2-to-1 switches',
      trap: 'The count is 2 to the n minus one switches, not 2 to the n. The last switch replaces two, which is where the minus one comes from.',
      narration: 'Three 2-to-1 switches build one 4-to-1 multiplexer: two switches choose within each pair, and the third chooses between the pairs.'
    },
    {
      id: 'mux-3', start: 165, end: 172.5, scene: 'mux',
      caption: 'Reading a multiplexer circuit is one substitution: the select lines are the variables, so each data input owns one minterm of the select variables.',
      detail: 'The 2014 Set 1 question gives a 4-to-1 multiplexer whose data inputs are zero, one, R and R-bar, with selects P and Q. Substituting gives P-bar Q plus Q R-bar plus P Q-bar R, which is the minimal sum of products of that function.',
      keyword: 'each data input owns one minterm',
      trap: 'The order of the select lines matters. Swapping which select line is high-order permutes the data inputs, and the answer changes. The question states the order; use the stated one.',
      narration: 'Reading a multiplexer circuit is one substitution: the select lines are the variables, so each data input owns one minterm of the select variables.'
    },
    {
      id: 'mux-4', start: 172.5, end: 180, scene: 'mux',
      caption: 'Because the data inputs are constants or variables, a multiplexer is a lookup table: it can hold any function of its select lines.',
      detail: 'An 8-to-1 multiplexer has eight data inputs, one per row of a three-variable table, so it realises any three-variable function by wiring the table into it. That universality is why it is the standard building block in design questions.',
      keyword: 'a multiplexer is a lookup table',
      trap: 'Universal for three variables means exactly that. Four-variable functions do not all fit, and the 2023 question uses a tree of multiplexers precisely to get more select lines.',
      narration: 'Because the data inputs are constants or variables, a multiplexer is a lookup table: it can hold any function of its select lines.'
    },

    /* ---------------- scene 7: functions on a multiplexer ---------------- */
    {
      id: 'mf-1', start: 180, end: 187.5, scene: 'muxfn',
      caption: 'The straightforward method: put the three variables on the select lines and the eight table entries on the eight data inputs.',
      detail: 'Row k of the table drives data input k. Nothing is minimised and nothing is simplified, so this method cannot go wrong as long as the select order is right. It is the method to use under time pressure.',
      keyword: 'the eight table entries on the eight data inputs',
      trap: 'The select order decides which table row is which input. Writing the table with the wrong bit order gives a valid circuit for a different function.',
      narration: 'The straightforward method: put the three variables on the select lines and the eight table entries on the eight data inputs.'
    },
    {
      id: 'mf-2', start: 187.5, end: 195, scene: 'muxfn',
      caption: 'The cheaper method: two variables on the selects and the third on the data lines, so each data input is zero, one, the variable, or its complement.',
      detail: 'With P and Q on the selects, data input zero is the value of the function on the pair zero zero, written as a function of R. For this function those four entries are zero, one, R and R-bar, so a 4-to-1 multiplexer does the job of an 8-to-1.',
      keyword: 'each data input is zero, one, the variable, or its complement',
      trap: 'Only four possibilities exist for a data input, so a 4-to-1 multiplexer handles any three-variable function. But you must read the function on each pair as a function of the remaining variable, not as a single bit.',
      narration: 'The cheaper method: two variables on the selects and the third on the data lines, so each data input is zero, one, the variable, or its complement.'
    },
    {
      id: 'mf-3', start: 195, end: 202.5, scene: 'muxfn',
      caption: 'The smallest case: one select line, two data inputs. To realise T plus R, tie R to one data input, logic one to the other, and T to the select.',
      detail: 'The multiplexer computes select-bar times X plus select times Y. Setting select to T, X to R and Y to one gives T-bar R plus T, which simplifies to T plus R by absorption. That is GATE CSE 2004 Question 60.',
      keyword: 'tie logic one to the other',
      trap: 'More than one wiring works, because absorption has more than one form. Under exam conditions eliminate the options rather than searching for the unique answer.',
      narration: 'The smallest case: one select line, two data inputs. To realise T plus R, tie R to one data input, logic one to the other, and T to the select.'
    },
    {
      id: 'mf-4', start: 202.5, end: 210, scene: 'muxfn',
      caption: 'Count the switches before you draw: a 2 to the n-to-1 multiplexer needs 2 to the n minus one 2-to-1 switches, and a tree of them gives more select lines.',
      detail: 'Two 4-to-1 multiplexers and one 2-to-1 multiplexer make an 8-to-1, which is the shape of the 2023 question. The high select line drives the final switch, so it is the most significant select bit of the resulting 8-to-1.',
      keyword: 'Count the switches before you draw',
      trap: 'The high select line of the tree is the most significant bit. Treating it as the least significant reverses the data-input order and gives the wrong bit string.',
      narration: 'Count the switches before you draw: a 2 to the n-to-1 multiplexer needs 2 to the n minus one 2-to-1 switches, and a tree of them gives more select lines.'
    },

    /* ---------------- scene 8: decoder ---------------- */
    {
      id: 'dec-1', start: 210, end: 217.5, scene: 'decoder',
      caption: 'A decoder takes n inputs and drives exactly one of 2 to the power n outputs high. It is a minterm generator: output k is high exactly when the input spells k.',
      detail: 'Eight outputs for three inputs, and exactly one is high at a time. That is a stronger statement than each output being a minterm - it says the outputs are mutually exclusive as well as exhaustive.',
      keyword: 'a minterm generator',
      trap: 'A decoder is not an encoder reversed in the counting sense. The encoder maps a one-hot input to a binary code and needs a priority rule when several inputs are high.',
      narration: 'A decoder takes n inputs and drives exactly one of 2 to the power n outputs high. It is a minterm generator: output k is high exactly when the input spells k.'
    },
    {
      id: 'dec-2', start: 217.5, end: 225, scene: 'decoder',
      caption: 'Because the outputs are the minterms, one OR gate over the chosen lines builds any sum of products. Decoder plus OR is a general function generator.',
      detail: 'For the function that is one on minterms one, three, five and six, wire those four decoder outputs into one OR gate. Nothing is minimised and the circuit is automatically correct, which is why it is the standard answer to "implement using a decoder".',
      keyword: 'one OR gate over the chosen lines',
      trap: 'An active-low decoder output needs a NAND instead of an OR, by De Morgan. Wiring an OR to active-low outputs computes the complement of the intended function.',
      narration: 'Because the outputs are the minterms, one OR gate over the chosen lines builds any sum of products. Decoder plus OR is a general function generator.'
    },
    {
      id: 'dec-3', start: 225, end: 232.5, scene: 'decoder',
      caption: 'An enable input turns a decoder into a selector: with the enable held low every output stays low, so the block is silent until it is chosen.',
      detail: 'That is the property that makes large decoders buildable. The high-order inputs pick which small decoder speaks, and only one of them is enabled at a time, so the one-hot promise survives the construction.',
      keyword: 'An enable input turns a decoder into a selector',
      trap: 'Without an enable there is no way to combine two small decoders without extra gates. The exam questions that forbid other gates are relying on the enable.',
      narration: 'An enable input turns a decoder into a selector: with the enable held low every output stays low, so the block is silent until it is chosen.'
    },
    {
      id: 'dec-4', start: 232.5, end: 240, scene: 'decoder',
      caption: 'So a 6-to-64 decoder needs nine 3-to-8 decoders: eight for the low bits and one to choose among them. That is GATE CSE 2007 Question 8.',
      detail: 'Sixty-four outputs divide into eight blocks of eight, and eight blocks need one 3-to-8 decoder to choose the block. The page simulates the cascade and confirms that exactly one of the sixty-four lines is high for every input.',
      keyword: 'nine 3-to-8 decoders',
      trap: 'The answer is nine, not eight, and not sixty-four divided by eight rounded up. The choosing decoder is the term people forget.',
      narration: 'So a 6-to-64 decoder needs nine 3-to-8 decoders: eight for the low bits and one to choose among them. That is GATE CSE 2007 Question 8.'
    },

    /* ---------------- scene 9: hazards ---------------- */
    {
      id: 'haz-1', start: 240, end: 247.5, scene: 'hazard',
      caption: 'A truth table describes the settled circuit. While the inputs change, a network with two paths that rejoin can show a value the table never contains.',
      detail: 'Each gate adds a small delay, and different paths have different lengths. For a moment the output sees one path already switched and the other not yet, and that moment is the hazard.',
      keyword: 'two paths that rejoin',
      trap: 'A hazard is not a bug in the algebra. The expression is correct; the timing of its implementation is not. That is why the fix is a new term rather than a new formula.',
      narration: 'A truth table describes the settled circuit. While the inputs change, a network with two paths that rejoin can show a value the table never contains.'
    },
    {
      id: 'haz-2', start: 247.5, end: 255, scene: 'hazard',
      caption: 'Take F equal to A-bar B plus A C, with B and C both one. Then F is one for both values of A, so the output must not move at all.',
      detail: 'With B and C at one, the expression is A-bar plus A, which is one. The two terms are implemented by separate AND gates whose outputs are OR-ed, so the two paths have different lengths even though the function is constant.',
      keyword: 'the output must not move at all',
      trap: 'A function that is constant along an input change is exactly where a static hazard lives. Where the function must change, a glitch is invisible and harmless.',
      narration: 'Take F equal to A-bar B plus A C, with B and C both one. Then F is one for both values of A, so the output must not move at all.'
    },
    {
      id: 'haz-3', start: 255, end: 262.5, scene: 'hazard',
      caption: 'Now let A fall. The term A C turns off before the term A-bar B turns on, and for one gate level the OR gate sees two zeros: a dip to zero.',
      detail: 'The page simulates the four gates one level at a time and prints the output of every level. Without the repair the trace is one, one, one, zero, one - a single-level pulse that no row of the truth table contains.',
      keyword: 'for one gate level the OR gate sees two zeros',
      trap: 'This is a static-1 hazard, not a dynamic one. A dynamic hazard produces several transitions where one was expected; here the output is supposed to stay at one and it briefly does not.',
      narration: 'Now let A fall. The term A C turns off before the term A-bar B turns on, and for one gate level the OR gate sees two zeros: a dip to zero.'
    },
    {
      id: 'haz-4', start: 262.5, end: 270, scene: 'hazard',
      caption: 'The repair is the consensus term B C. It is redundant in the algebra, it holds one steady while A moves, and it is exactly the pair of adjacent ones the map already shows.',
      detail: 'Two ones in adjacent cells that are covered by different terms are the signature of a static-1 hazard; covering that pair with one extra term removes it. The consensus theorem guarantees the extra term changes no row of the table.',
      keyword: 'the consensus term B C',
      trap: 'Adding a term that is not a consensus of two terms changes the function. The repair is specific: only the term covering the adjacent pair is safe.',
      narration: 'The repair is the consensus term B C. It is redundant in the algebra, it holds one steady while A moves, and it is exactly the pair of adjacent ones the map already shows.'
    },

    /* ---------------- scene 10: the table ---------------- */
    {
      id: 'tab-1', start: 270, end: 277.5, scene: 'table',
      caption: 'Four blocks, four jobs: the adder adds, the subtractor borrows, the multiplexer selects, the decoder enumerates. Each is a function of its inputs and nothing more.',
      detail: 'A full adder is two outputs of three inputs. A 4-to-1 multiplexer is one output of two selects and four data inputs. A 3-to-8 decoder is eight outputs of three inputs. Naming the shape is half of every design question.',
      keyword: 'the multiplexer selects, the decoder enumerates',
      trap: 'Do not answer a design question with the block you remember rather than the block the question forces. "Implement using only 2-to-1 multiplexers" rules out the decoder.',
      narration: 'Four blocks, four jobs: the adder adds, the subtractor borrows, the multiplexer selects, the decoder enumerates. Each is a function of its inputs and nothing more.'
    },
    {
      id: 'tab-2', start: 277.5, end: 285, scene: 'table',
      caption: 'Costs: two gate levels per column for the ripple, logarithmic depth for look-ahead with two-input gates, one level for a multiplexer output, and one decoder per eight outputs.',
      detail: 'The ripple is linear in n and the look-ahead is logarithmic, and that contrast is the reason the carry block exists at all. The multiplexer and decoder are shallow but wide, so their cost is counted in gates rather than in depth.',
      keyword: 'two gate levels per column',
      trap: 'A delay quoted without the gate model, or a gate count quoted without the fan-in limit, is not an answer. State the model first.',
      narration: 'Costs: two gate levels per column for the ripple, logarithmic depth for look-ahead with two-input gates, one level for a multiplexer output, and one decoder per eight outputs.'
    },
    {
      id: 'tab-3', start: 285, end: 292.5, scene: 'table',
      caption: 'Five traps: the select order, the forgotten choosing decoder, the delay model, the missing adjacency check, and carry mistaken for overflow.',
      detail: 'Each one is a single mark lost on a question whose concept was known. The select order and the choosing decoder are counting errors; the delay model is a modelling error; the last two are definition errors.',
      keyword: 'Five traps',
      trap: 'All five are cheap to avoid: write the select order down, count the choosing block, state the gate model, check the map for adjacent ones, and compare the carry into and out of the sign column.',
      narration: 'Five traps: the select order, the forgotten choosing decoder, the delay model, the missing adjacency check, and carry mistaken for overflow.'
    },
    {
      id: 'tab-4', start: 292.5, end: 300, scene: 'table',
      caption: 'The rule to carry out: every combinational question is answered by naming the function, then the block, then the cost - in that order.',
      detail: 'Name the function from the table or the network. Choose the block that realises it within the stated restrictions. Then compute the cost under the stated model. An answer that skips the first step is a guess that sometimes looks right.',
      keyword: 'naming the function, then the block, then the cost',
      trap: 'Skipping the first step is what produces a circuit that is fast, small and computes the wrong function - the most expensive kind of wrong answer.',
      narration: 'The rule to carry out: every combinational question is answered by naming the function, then the block, then the cost - in that order.'
    }
  ]
};
