/* ==========================================================================
   arithmetic-algorithms-booth-division-cla — THE timeline.
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
      id: 'why',
      n: 1,
      title: 'Three machines, one adder',
      start: 0, end: 30,
      objective: 'See why representation is not enough: multiplying, dividing and adding fast are algorithms over registers, and each is judged by how many operations it takes.'
    },
    {
      id: 'shiftadd',
      n: 2,
      title: 'Shift-and-add multiplication',
      start: 30, end: 60,
      objective: 'Run 13 x 11 in four bits through the classic shift-and-add loop and see that the additions equal the 1s in the multiplier, and that A needs n+1 bits.'
    },
    {
      id: 'boothidea',
      n: 3,
      title: 'A run of 1s is a difference',
      start: 60, end: 90,
      objective: 'Derive the Booth recoding table from 0111 = 1000 - 0001, recode a real multiplier, and check that the digits sum to its signed value.'
    },
    {
      id: 'boothtrace',
      n: 4,
      title: 'Booth in registers',
      start: 90, end: 120,
      objective: 'Execute Booth on 3 x (-4) step by step: the pair, the operation, the arithmetic right shift, and the product in eight bits.'
    },
    {
      id: 'boothcount',
      n: 5,
      title: 'Counting the operations',
      start: 120, end: 150,
      objective: 'Count add/subtract operations from the bit transitions of the multiplier, reproduce GATE 2025 Set 2 Q32, and state the best and worst cases.'
    },
    {
      id: 'restoring',
      n: 6,
      title: 'Restoring division',
      start: 150, end: 180,
      objective: 'Run 7 / 3 through restoring division and see the trial subtraction, the restore, and the quotient bit set from the sign.'
    },
    {
      id: 'nonrestoring',
      n: 7,
      title: 'Non-restoring division',
      start: 180, end: 210,
      objective: 'Run the same division without restoring: keep the negative remainder, choose the next operation from its sign, and apply the one final correction.'
    },
    {
      id: 'cla',
      n: 8,
      title: 'Carry-lookahead addition',
      start: 210, end: 240,
      objective: 'Replace the waiting carry by computed generate and propagate terms, verify the result against ripple carry, and count the gate levels for fan-in 2 and for unbounded fan-in.'
    },
    {
      id: 'traps',
      n: 9,
      title: 'The three traps',
      start: 240, end: 270,
      objective: 'Name the three bookkeeping errors that produce a plausible wrong answer: the missing q-1 bit, the skipped correction, and the claim that a lookahead adder is constant time.'
    },
    {
      id: 'procedure',
      n: 10,
      title: 'Which machine is being asked about',
      start: 270, end: 300,
      objective: 'Turn the lesson into a decision procedure: read the wording, fix the width and the fan-in, then compute the count.'
    }
  ],

  events: [

    /* ---------------- scene 1: three machines ---------------- */
    {
      id: 'wh-1', start: 0, end: 7.5, scene: 'why',
      visualAction: 'three-boxes',
      caption: 'A four-bit adder cannot multiply, cannot divide, and cannot add sixty-four bits in one step.',
      narration: 'The last lesson gave us bit patterns. This one asks what the machine does with them. A four-bit adder cannot multiply, cannot divide, and cannot add sixty-four bits in one step. Each of those needs an algorithm.',
      keyword: 'an algorithm',
      detail: 'The syllabus clause is Section 2, "Number representation and arithmetic (fixed and floating point)". Representation is the previous lesson; arithmetic is this one.',
      trap: 'A question that says "arithmetic" may be asking about representation or about an algorithm. Check which one before computing.'
    },
    {
      id: 'wh-2', start: 7.5, end: 15, scene: 'why',
      visualAction: 'multiplier-box',
      caption: 'A multiplier has only add and shift. Thirteen times eleven in four bits: three additions, four shifts.',
      narration: 'The multiplier is given an adder and a shifter, nothing else. Thirteen times eleven in four bits costs three additions and four shifts, and the page will run that loop in a moment.',
      keyword: 'add and shift',
      detail: 'Registers: M = 1101 (13), Q = 1011 (11), A = 00000 (five bits). Four iterations, one addition in each iteration where Q0 = 1.'
    },
    {
      id: 'wh-3', start: 15, end: 22.5, scene: 'why',
      visualAction: 'divider-box',
      caption: 'A divider has only subtract and shift: seven divided by three is two remainder one.',
      narration: 'The divider subtracts and shifts. Seven divided by three is two remainder one, and the two published algorithms differ only in what they do when the trial subtraction goes negative.',
      keyword: 'two remainder one'
    },
    {
      id: 'wh-4', start: 22.5, end: 30, scene: 'why',
      visualAction: 'adder-box',
      caption: 'And the adder itself is an algorithm: the ripple waits n levels, the lookahead waits two log two n plus two.',
      narration: 'Even the adder is a choice. A ripple adder waits one level per bit. A lookahead adder computes every carry from bits that are already available, and that is where the logarithm comes from.',
      keyword: 'two log two n plus two',
      detail: 'The comparison assumes two-input gates. With unbounded fan-in the lookahead adder is four levels, which is constant.'
    },

    /* ---------------- scene 2: shift and add ---------------- */
    {
      id: 'sa-1', start: 30, end: 37.5, scene: 'shiftadd',
      visualAction: 'registers',
      caption: 'Two registers: A holds the running sum, Q holds the multiplier, and the pair shifts right together.',
      narration: 'Two registers hold the work. A holds the running sum and Q holds the multiplier. After each step the pair shifts right together, so the multiplier is consumed from the bottom.',
      keyword: 'shifts right together',
      detail: 'A is five bits for a four-bit multiply. The extra bit is the carry out of A + M, and it is the bit that a four-bit A loses.'
    },
    {
      id: 'sa-2', start: 37.5, end: 45, scene: 'shiftadd',
      visualAction: 'step-1',
      caption: 'Step one: Q zero is one, so add M into A, giving 01101, then shift.',
      narration: 'Step one. The low bit of Q is one, so add M into A. Zero plus thirteen is thirteen, which is 01101 in five bits. Then shift the whole register right.',
      keyword: 'add M into A',
      detail: 'The addition at step two is 00110 + 01101 = 10011, which needs the fifth bit. That is the whole reason A is n+1 bits.'
    },
    {
      id: 'sa-3', start: 45, end: 52.5, scene: 'shiftadd',
      visualAction: 'all-steps',
      caption: 'Four steps later the product is 10001111, which is 143.',
      narration: 'Four steps later the product sits across A and Q as 10001111. That is one hundred and forty-three, and thirteen times eleven is one hundred and forty-three.',
      keyword: '10001111',
      detail: 'The model checks all 256 four-bit pairs and none disagrees.'
    },
    {
      id: 'sa-4', start: 52.5, end: 60, scene: 'shiftadd',
      visualAction: 'count',
      caption: 'The number of additions is the number of ones in the multiplier: three here, never more than n.',
      narration: 'The count of additions is the count of ones in the multiplier, which is three here. That is the cost, and it is why Booth exists: three additions for a multiplier that is almost all ones is wasteful.',
      keyword: 'the count of ones',
      trap: 'A four-bit A drops the carry at step two and the product reads 111 instead of 143: a plausible answer from a width slip.'
    },

    /* ---------------- scene 3: recoding ---------------- */
    {
      id: 'bi-1', start: 60, end: 67.5, scene: 'boothidea',
      visualAction: 'run-of-ones',
      caption: 'A block of ones is a difference: 0111 is 1000 minus 0001, so it costs one subtraction and one addition.',
      narration: 'Here is the observation Booth built on. A block of ones is a difference. 0111 is 1000 minus 0001. So a long run of ones can be replaced by one subtraction at its low end and one addition at its high end.',
      keyword: 'one subtraction and one addition',
      detail: 'The same idea as multiplying by 99 as 100 - 1. Booth was looking for speed when shifting was cheaper than adding; that it also handles signed numbers is a bonus.'
    },
    {
      id: 'bi-2', start: 67.5, end: 75, scene: 'boothidea',
      visualAction: 'pair-table',
      caption: 'So look at two bits at a time: 01 adds M, 10 subtracts M, 00 and 11 do nothing.',
      narration: 'So the algorithm looks at two bits at a time. The pair 01 means a run of ones ends here, so add M. The pair 10 means a run starts here, so subtract M. The pairs 00 and 11 are inside a run and cost nothing.',
      keyword: '01 adds M, 10 subtracts M',
      trap: 'The pair is written (current bit, bit to the right). Writing it the other way round swaps add and subtract and every trace afterwards is wrong.'
    },
    {
      id: 'bi-3', start: 75, end: 82.5, scene: 'boothidea',
      visualAction: 'recode',
      caption: 'Recoding 1011 from the low end gives minus one, zero, plus one, minus one.',
      narration: 'Recode the multiplier 1011 from the low end. The digits come out as minus one, zero, plus one, minus one. Three of the four digits are non-zero, so this multiplier costs three operations.',
      keyword: 'minus one, zero, plus one, minus one',
      detail: 'The digit at position i is q(i-1) - q(i), with q(-1) = 0. Reading the pair as (q_i, q_i-1) is what makes the table agree with the arithmetic.'
    },
    {
      id: 'bi-4', start: 82.5, end: 90, scene: 'boothidea',
      visualAction: 'digit-sum',
      caption: 'Weighted by one, two, four and eight, those digits sum to minus five, which is the signed value of 1011.',
      narration: 'Weight the digits by one, two, four and eight. The sum is minus five, and minus five is exactly the value of 1011 read as a four-bit two\'s complement number, even though shift-and-add reads the same pattern as eleven. The recoding is arithmetic, not a trick.',
      keyword: 'minus five',
      detail: 'This identity holds for every bit pattern at every width the page checks: the digits always sum to the signed value of the multiplier.'
    },

    /* ---------------- scene 4: the Booth trace ---------------- */
    {
      id: 'bt-1', start: 90, end: 97.5, scene: 'boothtrace',
      visualAction: 'setup',
      caption: 'Three times minus four, in four bits: A is five bits, Q is 1100, and q minus one starts at zero.',
      narration: 'Now run it. Three times minus four in four bits. A is five bits, Q holds the multiplier 1100, and there is one extra bit, q minus one, which starts at zero.',
      keyword: 'q minus one',
      detail: 'The accumulator is n+1 bits so that the most negative multiplicand still works; the textbook n-bit version fails on exactly one input, shown in the Edge cases tab.'
    },
    {
      id: 'bt-2', start: 97.5, end: 105, scene: 'boothtrace',
      visualAction: 'steps-1-2',
      caption: 'Steps one and two see the pair 00 twice: nothing is added, only the shift.',
      narration: 'Step one sees the pair zero zero, and step two sees zero zero again. Nothing is added. The register just shifts right twice, and because the shift is arithmetic, the sign is copied rather than filled with zeros.',
      keyword: 'nothing is added'
    },
    {
      id: 'bt-3', start: 105, end: 112.5, scene: 'boothtrace',
      visualAction: 'step-3',
      caption: 'Step three sees 10, the start of a run, so subtract M: A becomes 11101.',
      narration: 'Step three sees one zero. That is the start of a run of ones in the multiplier, so subtract M from A. A becomes 11101, which is minus three in five bits.',
      keyword: 'subtract M',
      trap: 'Subtracting when the pair is 01 reverses the table. The check on this page recomputes every product, so the reversal would show up as 256 failures, not as a subtle error.'
    },
    {
      id: 'bt-4', start: 112.5, end: 120, scene: 'boothtrace',
      visualAction: 'product',
      caption: 'Four steps and one subtraction give 11110100, which is minus twelve.',
      narration: 'One more step, the pair one one, no operation. The product is 11110100, which is minus twelve, and three times minus four is minus twelve. Four steps, one subtraction, because the multiplier was a single run of ones.',
      keyword: 'minus twelve'
    },

    /* ---------------- scene 5: counting ---------------- */
    {
      id: 'bc-1', start: 120, end: 127.5, scene: 'boothcount',
      visualAction: 'bits',
      caption: 'Here is the multiplier from GATE CSE 2025 Set 2, question 32: sixteen bits, written low bit first.',
      narration: 'Now the question that decides the marks. This is the sixteen-bit multiplier from GATE CSE 2025 Set 2, question 32, written with the least significant bit on the left so the scan order matches the algorithm.',
      keyword: 'GATE CSE 2025 Set 2',
      detail: 'M is 1100110111101101 and Q is 1010010010101010 in that paper. Only Q matters for the count.'
    },
    {
      id: 'bc-2', start: 127.5, end: 135, scene: 'boothcount',
      visualAction: 'transitions',
      caption: 'Each change between neighbouring bits is one add or one subtract: thirteen changes.',
      narration: 'At step k the algorithm inspects the pair made of bit k and bit k minus one, with bit minus one equal to zero. So an add or a subtract happens exactly where two neighbouring bits differ, and there are thirteen such changes.',
      keyword: 'thirteen changes',
      trap: 'Forgetting the prepended zero loses the comparison of q zero against zero and gives twelve. That is the trap the question is built on.'
    },
    {
      id: 'bc-3', start: 135, end: 142.5, scene: 'boothcount',
      visualAction: 'answer',
      caption: 'Thirteen is the answer, and the multiplicand never enters the count.',
      narration: 'So the answer is thirteen, and notice that the multiplicand, all sixteen bits of it, never entered the count. Only the multiplier decides how many operations Booth performs.',
      keyword: 'thirteen',
      detail: 'The page runs the full Booth trace on those numbers and gets the same thirteen, so the shortcut and the algorithm agree here.'
    },
    {
      id: 'bc-4', start: 142.5, end: 150, scene: 'boothcount',
      visualAction: 'extremes',
      caption: 'Best case no operation at all, worst case four for a four-bit 0101: worse than plain shift-and-add.',
      narration: 'The extremes are worth knowing. A multiplier of all zeros costs nothing, a single run costs one operation, and the alternating pattern 0101 costs four in four bits, which is more than the two additions plain shift-and-add would need. Booth is a trade, not a free speed-up.',
      keyword: 'a trade'
    },

    /* ---------------- scene 6: restoring ---------------- */
    {
      id: 'rs-1', start: 150, end: 157.5, scene: 'restoring',
      visualAction: 'setup',
      caption: 'Division, restoring version: M is 0011, the dividend seven sits in Q, and A starts at zero.',
      narration: 'Now division. The restoring version keeps the divisor three in M, the dividend seven in Q, and the running remainder in A, which starts at zero.',
      keyword: 'restoring version',
      detail: 'A is n+1 bits here too, because the trial subtraction can be negative and has to be stored before it is undone.'
    },
    {
      id: 'rs-2', start: 157.5, end: 165, scene: 'restoring',
      visualAction: 'shift-subtract',
      caption: 'Each step shifts left and tries A minus M. If the result is negative, add M back and set the quotient bit to zero.',
      narration: 'Each step shifts the register left and tries A minus M. If the trial is negative, add M back so A is where it was, and set the quotient bit to zero. If the trial is non-negative, keep it and set the bit to one.',
      keyword: 'add M back',
      trap: 'Setting the quotient bit from the trial before the restore gives the complement of the quotient, which looks like a small arithmetic slip and is not.'
    },
    {
      id: 'rs-3', start: 165, end: 172.5, scene: 'restoring',
      visualAction: 'result',
      caption: 'After four steps Q holds 0010 and A holds 0001: quotient two, remainder one.',
      narration: 'After four steps the quotient two sits in Q and the remainder one sits in A. Three times two plus one is seven, which is the definition the whole algorithm has to satisfy.',
      keyword: 'quotient two, remainder one'
    },
    {
      id: 'rs-4', start: 172.5, end: 180, scene: 'restoring',
      visualAction: 'cost',
      caption: 'Three of the four steps had to restore, so half the work was undoing the algorithm\'s own subtractions.',
      narration: 'Three of these four steps had to restore. Half the work in a restoring divider is undoing its own subtractions, and that is the waste the next algorithm removes.',
      keyword: 'three of the four'
    },

    /* ---------------- scene 7: non-restoring ---------------- */
    {
      id: 'nr-1', start: 180, end: 187.5, scene: 'nonrestoring',
      visualAction: 'setup',
      caption: 'The non-restoring divider never undoes anything: it looks at the sign of A and adds M instead of subtracting.',
      narration: 'The non-restoring divider never undoes anything. Before each shift it looks at the sign of the partial remainder: if it is negative it will add M, and if it is non-negative it will subtract M.',
      keyword: 'never undoes anything'
    },
    {
      id: 'nr-2', start: 187.5, end: 195, scene: 'nonrestoring',
      visualAction: 'steps',
      caption: 'The remainder is allowed to go negative and stay negative for several steps.',
      narration: 'So the partial remainder is allowed to be negative, and to stay negative for several steps. That is not a bug: the next operation corrects it by adding rather than subtracting, which is exactly the restore folded into the next step.',
      keyword: 'allowed to be negative',
      detail: 'The invariant is that the remainder always lies between minus M and M. That bound is what keeps n+1 bits enough.'
    },
    {
      id: 'nr-3', start: 195, end: 202.5, scene: 'nonrestoring',
      visualAction: 'correction',
      caption: 'Here A ends at minus two, so one correction adds M once, after the loop, and the remainder becomes one.',
      narration: 'Here A ends at minus two. One correction, after the loop and never inside it, adds M once. The remainder becomes one and the quotient stays two.',
      keyword: 'one correction',
      trap: 'Skipping the correction leaves remainder minus two, which still satisfies M times Q plus A equals seven, so a careless check will not catch it.'
    },
    {
      id: 'nr-4', start: 202.5, end: 210, scene: 'nonrestoring',
      visualAction: 'conditional',
      caption: 'Seven divided by four ends non-negative and needs no correction: the step is conditional, not automatic.',
      narration: 'The correction is conditional. Seven divided by four ends with a non-negative remainder and needs nothing. Two algorithms, one answer, and one fewer operation in the middle.',
      keyword: 'conditional'
    },

    /* ---------------- scene 8: carry-lookahead ---------------- */
    {
      id: 'cl-1', start: 210, end: 217.5, scene: 'cla',
      visualAction: 'ripple',
      caption: 'A ripple adder waits: each carry is computed from the carry before it, so n bits take n levels.',
      narration: 'The last machine is the adder itself. A ripple adder computes each carry from the carry before it, so an n-bit addition takes n gate levels, and each level waits for the one before.',
      keyword: 'n levels'
    },
    {
      id: 'cl-2', start: 217.5, end: 225, scene: 'cla',
      visualAction: 'lookahead',
      caption: 'Lookahead computes every carry from generate and propagate bits that are already available.',
      narration: 'Lookahead replaces the wait. Every column produces a generate bit and a propagate bit, and both are available immediately. A carry is then a sum of products of those bits, so all the carries can start at the same time.',
      keyword: 'generate and propagate',
      detail: 'G equals A and B; P equals A xor B. A carry crosses a column exactly when that column propagates.'
    },
    {
      id: 'cl-3', start: 225, end: 232.5, scene: 'cla',
      visualAction: 'verify',
      caption: 'On thirteen plus eleven the computed carries match ripple carry exactly, and the carry out is one.',
      narration: 'On thirteen plus eleven the computed carries match the ripple carries exactly, and the carry out is one, so the sum is twenty-four. The page checks this on all 256 four-bit pairs and on 600 eight-bit pairs.',
      keyword: 'match ripple carry exactly'
    },
    {
      id: 'cl-4', start: 232.5, end: 240, scene: 'cla',
      visualAction: 'levels',
      caption: 'With two-input gates the depth is two log two n plus two levels, which is theta of log n: the 2016 question.',
      narration: 'Now the cost. With two-input gates, the largest carry needs an and tree and an or tree over at most n literals, so the depth is two log two n plus two. That is theta of log n, which is the answer to GATE CSE 2016 Set 1, question 33. With unbounded fan-in it would be four levels, constant.',
      keyword: 'theta of log n',
      trap: 'The claim that a lookahead adder is constant time is only true with unbounded fan-in. Bounded fan-in turns the logarithm back on.'
    },

    /* ---------------- scene 9: traps ---------------- */
    {
      id: 'tr-1', start: 240, end: 247.5, scene: 'traps',
      visualAction: 'trap-1',
      caption: 'Trap one: forgetting the prepended q minus one bit, and answering twelve instead of thirteen.',
      narration: 'Three bookkeeping errors decide most of the marks here. The first is forgetting the prepended q minus one. Drop it and the comparison of the low bit against zero disappears, and the count is twelve.',
      keyword: 'twelve instead of thirteen'
    },
    {
      id: 'tr-2', start: 247.5, end: 255, scene: 'traps',
      visualAction: 'trap-2',
      caption: 'Trap two: skipping the correction step in non-restoring division.',
      narration: 'The second is skipping the correction in non-restoring division. The quotient is right, the identity still holds with a negative remainder, and only the range condition gives the error away.',
      keyword: 'the correction step',
      detail: 'The condition is zero less than or equal to A, and A less than M. A remainder of minus two satisfies the identity and fails the range.'
    },
    {
      id: 'tr-3', start: 255, end: 262.5, scene: 'traps',
      visualAction: 'trap-3',
      caption: 'Trap three: calling a lookahead adder constant time when the gates have bounded fan-in.',
      narration: 'The third is calling a lookahead adder constant time. That is true only when the gates have unbounded fan-in. With two-input gates, sixteen bits take ten levels, not one.',
      keyword: 'constant time',
      trap: 'Read the fan-in before you answer any delay question. The same adder is theta of one or theta of log n depending on one phrase.'
    },
    {
      id: 'tr-4', start: 262.5, end: 270, scene: 'traps',
      visualAction: 'summary',
      caption: 'None of the three is arithmetic; each is a rule about the algorithm\'s own bookkeeping.',
      narration: 'None of the three is an arithmetic mistake. Each is a rule about the algorithm itself. That is why they are worth memorising as rules and not as worked examples.',
      keyword: 'bookkeeping'
    },

    /* ---------------- scene 10: procedure ---------------- */
    {
      id: 'pr-1', start: 270, end: 277.5, scene: 'procedure',
      visualAction: 'step-1',
      caption: 'If the question asks for a number of additions with a multiplier, count the transitions of Q.',
      narration: 'So here is the procedure. If the question asks for the number of additions or subtractions with a multiplier, count the transitions of Q with a zero prepended, and do not trace the registers at all.',
      keyword: 'count the transitions'
    },
    {
      id: 'pr-2', start: 277.5, end: 285, scene: 'procedure',
      visualAction: 'step-2',
      caption: 'If it gives you a register trace, the pairs tell you the operation: add on 01, subtract on 10.',
      narration: 'If it gives you a register trace, read the pair: add on zero one, subtract on one zero, and check that the shift is arithmetic. A logical shift is the giveaway in a wrong option.',
      keyword: 'add on 01, subtract on 10'
    },
    {
      id: 'pr-3', start: 285, end: 292.5, scene: 'procedure',
      visualAction: 'step-3',
      caption: 'For division, check both conditions at the end: the identity, and the range of the remainder.',
      narration: 'For division, check both conditions at the end. The identity dividend equals M times Q plus A catches most errors, and the range zero to M catches the rest, including a skipped correction.',
      keyword: 'the identity, and the range'
    },
    {
      id: 'pr-4', start: 292.5, end: 300, scene: 'procedure',
      visualAction: 'step-4',
      caption: 'For a delay question, fix the gate fan-in first: two log base k of n plus two levels.',
      narration: 'For a delay question, fix the fan-in first. The depth is two log base k of n plus two for fan-in k, which is theta of log n for any fixed k and constant only when the fan-in grows with n.',
      keyword: 'two log base k of n plus two'
    }
  ]
};
