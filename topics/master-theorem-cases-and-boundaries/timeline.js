/* ==========================================================================
   master-theorem-cases-and-boundaries - THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs - never edited by hand.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 356,

  scenes: [
    { id: 'shape',     n: 1,  title: 'A recurrence is a recipe; the theorem is a closed form', objective: 'name the three ingredients a, b and f in T(n) = a T(n/b) + f(n), and say what the theorem is asked to decide', start: 0,   end: 32  },
    { id: 'watershed', n: 2,  title: 'The watershed: what the leaves of the tree cost', objective: 'derive n^(log_b a) as the number of leaves, and see why every case is a comparison with it', start: 32,  end: 62  },
    { id: 'case1',     n: 3,  title: 'Case 1: the leaves pay the bill', objective: 'read the level weights of 4T(n/2) + n, see them double downward, and sum them to 2n^2 - n', start: 62,  end: 96  },
    { id: 'case2',     n: 4,  title: 'Case 2: every level costs the same', objective: 'read the level weights of 4T(n/2) + n^2, see them constant, and multiply one level by the number of levels', start: 96,  end: 130 },
    { id: 'case3',     n: 5,  title: 'Case 3: the root pays the bill', objective: 'read the level weights of 4T(n/2) + n^3, see them halve downward, and bound the whole sum by twice the root', start: 130, end: 164 },
    { id: 'decision',  n: 6,  title: 'One picture, three regimes', objective: 'place the watershed curve and three f curves on one axis, and state the decision rule with its polynomial gap', start: 164, end: 192 },
    { id: 'regularity',n: 7,  title: 'The regularity condition, and why polynomials never fail it', objective: 'state case 3\'s second hypothesis, compute a f(n/b) / f(n) = a/b^p for f(n) = n^p, and see it is the same condition as the polynomial gap', start: 192, end: 226 },
    { id: 'gap',       n: 8,  title: 'The gap: n / log n is smaller, but not polynomially smaller', objective: 'see that no epsilon makes n^epsilon / log n bounded, unroll to the harmonic weights, and land on n(1 + H_k)', start: 226, end: 262 },
    { id: 'extended',  n: 9,  title: 'Extended case 2: when f carries a log factor', objective: 'apply f = n^(log_b a) log^k n giving n^(log_b a) log^(k+1) n, and check the constant at k = 0, 1, 2', start: 262, end: 292 },
    { id: 'limits',    n: 10, title: 'Three shapes the theorem refuses', objective: 'recognise subtract-and-conquer, a domain transform, and a non-polynomial gap, and know to unroll instead', start: 292, end: 324 },
    { id: 'gate',      n: 11, title: 'Previous-year items, recomputed', objective: 'answer three verified CSE items from the classification rather than from memory, then state the four-step procedure', start: 324, end: 356 }
  ],

  events: [
    /* ---- 1. the shape of the theorem ------------------------------------ */
    { id: 'h1', scene: 'shape', start: 0, end: 8,
      caption: 'Three ingredients: how many pieces a problem splits into, how much smaller each piece is, and what the splitting costs.',
      narration: 'Three ingredients. How many pieces the problem splits into. How much smaller each piece is. And what it costs to split and recombine. Every recurrence this lesson solves is those three numbers written down.',
      detail: 'A divide-and-conquer algorithm hands out a copies of a problem of size n over b, then spends f(n) on the dividing and the recombining. The three quantities are usually read straight off the algorithm, before any algebra.',
      keyword: 'Three ingredients' },

    { id: 'h2', scene: 'shape', start: 8, end: 16,
      caption: 'Written T(n) = a T(n/b) + f(n): a pieces, each of size n/b, plus f(n) for the divide and the recombine.',
      narration: 'Written down, that is T of n equals a times T of n over b, plus f of n. a is the number of pieces and is at least one. b is the shrink factor and is greater than one. f of n is the work done at this level, outside the recursive calls.',
      detail: 'The notation T(n/b) hides floors and ceilings. They never change the answer for the recurrences the syllabus uses, and the theorem is stated with them in the textbook; this page works on exact powers so the arithmetic is exact.',
      keyword: 'a times T of n over b' },

    { id: 'h3', scene: 'shape', start: 16, end: 24,
      caption: 'The theorem answers one question: which part of the work dominates, the top, the levels, or the leaves.',
      narration: 'The theorem answers exactly one question. Of the three parts of the recursion tree, which one carries the work: the root, the middle levels, or the leaves at the bottom? Everything else in the theorem is the bookkeeping of that answer.',
      detail: 'The tree has three regions, and each case names one of them as the bill payer. That is why there are three cases and not two: the root can dominate, the levels can tie, or the leaves can dominate.',
      keyword: 'which part of the work dominates' },

    { id: 'h4', scene: 'shape', start: 24, end: 32,
      caption: 'It is not a formula to memorise. It is a comparison between two quantities, and the comparison is the whole method.',
      narration: 'So this is not a formula to memorise. It is a comparison between two quantities, and the comparison is the method. Get the comparison right and the answer follows without any table.',
      detail: 'The two quantities are f(n), the work at the top, and the number of leaves n to the log base b of a. The rest of the lesson is what happens when one is bigger than the other, when they are equal, and when neither is.',
      keyword: 'a comparison between two quantities',
      trap: 'The theorem applies only to a T(n/b) + f(n) with a and b constant. A recurrence that subtracts instead of divides, or whose coefficient grows with n, is not a near miss; it is a different problem, and scene 10 shows three of them.' },

    /* ---- 2. the watershed ------------------------------------------------- */
    { id: 'w1', scene: 'watershed', start: 32, end: 40,
      caption: 'At depth i the tree has a^i subproblems, each of size n / b^i. That is the whole structure.',
      narration: 'At depth i the tree has a to the i subproblems, and each of them is of size n over b to the i. That is the entire structure of the tree: nothing else varies with depth.',
      detail: 'Depth is counted from zero at the root. The root has one subproblem of size n; depth one has a of size n over b; depth two has a squared of size n over b squared. Both the count and the size are powers, which is why the sum can be written down.',
      keyword: 'a to the i subproblems' },

    { id: 'w2', scene: 'watershed', start: 40, end: 48,
      caption: 'Subproblems stop when the size reaches 1. Halving 1024 ten times takes 10 levels: k = log base b of n.',
      narration: 'The recursion stops when a subproblem has size one, which happens after k levels, where k is log base b of n. At n equal to one thousand and twenty-four with b equal to two, k is ten.',
      detail: 'The tree is not infinite: its height is k plus one levels, counting the leaves as a level. That finite height is what makes the log appear in case 2 and the harmonic sum appear in the gap.',
      keyword: 'k = log base b of n' },

    { id: 'w3', scene: 'watershed', start: 48, end: 56,
      caption: 'So the leaves number a^k = a^(log_b n) = n^(log_b a). At a = 4, b = 2 that is n squared: 1048576 leaves.',
      narration: 'So the number of leaves is a to the k, which is a to the log base b of n, which is n to the log base b of a. With a equal to four and b equal to two, that exponent is two, so the leaves number n squared, which at n equal to one thousand and twenty-four is one million, forty-eight thousand, five hundred and seventy-six.',
      detail: 'The identity a^(log_b n) = n^(log_b a) is the only algebra the theorem needs. Both sides are the same number written two ways, and the page checks that a^k and n^(log_b a) agree for every n from b to b^12 on four different a and b.',
      keyword: 'n to the log base b of a' },

    { id: 'w4', scene: 'watershed', start: 56, end: 62,
      caption: 'Call it the watershed. Every case of the theorem is a comparison between f(n) and this number.',
      narration: 'Call that number the watershed. Every case of the theorem is a comparison between f of n and this quantity, and nothing else.',
      detail: 'The name matters: the watershed is a function of n, not a number. At n equal to 1024 with a = 4 and b = 2 it is 1048576; at n equal to 1024 with a = 2 and b = 2 it is only 1024.',
      keyword: 'the watershed' },

    /* ---- 3. case 1 -------------------------------------------------------- */
    { id: 'c1a', scene: 'case1', start: 62, end: 70,
      caption: 'Take a = 4, b = 2, f(n) = n. Each level down multiplies the work by a/b, which is 2.',
      narration: 'Take a equal to four, b equal to two, and f of n equal to n. Level i costs four to the i times n over two to the i, which is n times two to the i. Each level down multiplies the work by two.',
      detail: 'The level weight is a^i f(n / b^i). With f linear and a = b^2, the exponent of n in the weight rises by one per level: level i costs n times 2^i. The ratio from one level to the next is a / b = 2 here, and in general a / b^p when f(n) = n^p.',
      keyword: 'multiplies the work by two' },

    { id: 'c1b', scene: 'case1', start: 70, end: 78,
      caption: 'At n = 1024 the levels cost 1024, 2048, 4096, and so on up to 1048576 at the leaves.',
      narration: 'At n equal to one thousand and twenty-four the eleven levels cost one thousand and twenty-four, two thousand and forty-eight, four thousand and ninety-six, and so on, doubling each time, up to one million and forty-eight thousand at the leaves.',
      detail: 'Eleven levels, because the root is level zero and the leaves are level ten. The weights are n times 2 to the i for i from zero to ten, and every one of them is computed from the recurrence, not typed in.',
      keyword: 'doubling each time' },

    { id: 'c1c', scene: 'case1', start: 78, end: 86,
      caption: 'The last level alone is n squared, larger than everything above it. The sum is 2n squared minus n: 2096128.',
      narration: 'The last level alone is n squared, which is bigger than the sum of every level above it. So the total is twice the leaves, roughly: exactly two n squared minus n, which at n equal to one thousand and twenty-four is two million, ninety-six thousand, one hundred and twenty-eight.',
      detail: 'A geometric series with ratio 2 has sum equal to twice its largest term, minus the smallest. The page computes the level weights, checks the ratio is 2 at every step, and checks the sum equals 2n^2 - n exactly for n from 16 to 4096.',
      keyword: '2n squared minus n' },

    { id: 'c1d', scene: 'case1', start: 86, end: 96,
      caption: 'So T is Theta of n squared, which is Theta of n^(log_b a). The leaves pay the bill: case 1.',
      narration: 'So T of n is Theta of n squared, and n squared is n to the log base b of a. The leaves pay the bill. That is case 1: f is polynomially smaller than the watershed, so the watershed is the answer.',
      detail: 'f(n) = n and the watershed is n^2. The gap is a factor of n, which is a polynomial gap, so case 1 applies. The answer does not mention f at all: it is the watershed, exactly.',
      keyword: 'The leaves pay the bill',
      trap: 'Case 1 is not "f is smaller". It is "f is smaller by a polynomial factor". A factor of log n is not a polynomial factor, and scene 8 shows what happens then.' },

    /* ---- 4. case 2 -------------------------------------------------------- */
    { id: 'c2a', scene: 'case2', start: 96, end: 104,
      caption: 'Same a and b, but f(n) = n squared. Level i costs 4^i times n squared over 4^i: the 4s cancel.',
      narration: 'Same a and b, but now f of n is n squared. Level i costs four to the i times n squared over four to the i, and the fours cancel exactly. Every level costs the same.',
      detail: 'The cancellation happens exactly when f is the watershed: f(n / b^i) = n^p / b^(pi) and a^i = b^(pi) when p = log_b a. That is why this case is the balanced one, and why it is the only case that produces a log.',
      keyword: 'the fours cancel' },

    { id: 'c2b', scene: 'case2', start: 104, end: 112,
      caption: 'Eleven levels, each costing 1048576. No level dominates, so the count is one level times the number of levels.',
      narration: 'Eleven levels, each of them costing one million, forty-eight thousand, five hundred and seventy-six. No level dominates any other, so the total is one level times the number of levels.',
      detail: 'The number of levels is k + 1, not k: the leaves are a level and they cost the same as the root here. The page counts the levels and checks that every weight equals n squared.',
      keyword: 'one level times the number of levels' },

    { id: 'c2c', scene: 'case2', start: 112, end: 120,
      caption: 'The sum is n squared times (k + 1) = 11534336. T is Theta of n squared log n: the log is the height of the tree.',
      narration: 'The sum is n squared times k plus one, which at these numbers is eleven million, five hundred and thirty-four thousand, three hundred and thirty-six. So T is Theta of n squared log n. The extra log is the height of the tree and nothing else.',
      detail: 'The page checks T = n^2 (k + 1) exactly, and checks the ratio T / (n^2 log2 n) converges to 1 as k grows: it is 1.19 at k = 6 and 1.05 at k = 16 on the same recurrence.',
      keyword: 'the height of the tree' },

    { id: 'c2d', scene: 'case2', start: 120, end: 130,
      caption: 'Case 2: f equals the watershed. The answer is the watershed times a log, and the constant in front is 1.',
      narration: 'That is case 2: f of n is Theta of the watershed. The answer is the watershed times a log, and the constant in front of it is exactly one, which is why the textbook can state it as an equality.',
      detail: 'The exact solution here is n^2 (k + 1), so T / (n^2 log2 n) = (k+1)/k, which tends to 1 from above. A question that asks for the class does not need the constant, but a question that asks for a count does.',
      keyword: 'Case 2',
      trap: 'The log in case 2 does not come from a sorting step or from a binary search inside the algorithm. It comes from the number of levels, and it appears only when the levels tie.' },

    /* ---- 5. case 3 -------------------------------------------------------- */
    { id: 'c3a', scene: 'case3', start: 130, end: 138,
      caption: 'Same a and b once more, f(n) = n cubed. Level i costs 4^i times n cubed over 8^i: the work halves each level.',
      narration: 'Same a and b once more, and now f of n is n cubed. Level i costs four to the i times n cubed over eight to the i, which is n cubed over two to the i. The work halves with every level down.',
      detail: 'The ratio between consecutive levels is a / b^p with p equal to 3, which is 4 over 8, a half. Any ratio below one makes the series converge, and that is the whole content of case 3.',
      keyword: 'the work halves' },

    { id: 'c3b', scene: 'case3', start: 138, end: 146,
      caption: 'The root costs 1073741824. Everything below it adds up to less than the root again.',
      narration: 'The root alone costs one billion, seventy-three million, seven hundred and forty-one thousand, eight hundred and twenty-four. Everything below it adds up to less than the root again, because the series halves.',
      detail: 'A geometric series with ratio one half is at most twice its first term. So the total is between the root and twice the root: the answer is the root, up to a constant that the question never asks for.',
      keyword: 'less than the root again' },

    { id: 'c3c', scene: 'case3', start: 146, end: 154,
      caption: 'The exact sum is 2146435072, just under 2n cubed. T is Theta of n cubed, which is Theta of f(n).',
      narration: 'The exact sum is two billion, one hundred and forty-six million, four hundred and thirty-five thousand and seventy-two, just under twice n cubed. So T is Theta of n cubed, which is Theta of f of n.',
      detail: 'The page computes the weights, checks the ratio is one half at every step, and checks the sum lies between n^3 and 2 n^3 for every n it tries. It also checks the closed form n^3 (2 - 2^-(k-1)) + n^2.',
      keyword: 'Theta of f of n' },

    { id: 'c3d', scene: 'case3', start: 154, end: 164,
      caption: 'Case 3: the root pays the bill. This is the one case that carries a second condition, and scene 7 is that condition.',
      narration: 'That is case 3: the root pays the bill, and the answer is f of n. This is the only one of the three cases that carries a second condition, and the next two scenes are about that condition and about what happens when it fails.',
      detail: 'Case 3 needs f to be polynomially larger than the watershed and, in addition, a f(n/b) at most c f(n) for some fixed c below one. The second requirement is the regularity condition.',
      keyword: 'the one case that carries a second condition' },

    /* ---- 6. the decision picture ------------------------------------------ */
    { id: 'd1', scene: 'decision', start: 164, end: 172,
      caption: 'One picture: the watershed n^(log_b a) against f(n), both drawn on log-log axes so a power is a straight line.',
      narration: 'Here is the whole theorem in one picture. The watershed n to the log base b of a, drawn against f of n, on axes that are logarithmic in both directions, so that every power of n appears as a straight line and its exponent is its slope.',
      detail: 'With a = 4 and b = 2 the watershed is n squared, a line of slope 2. f equal to n is slope 1, f equal to n squared is slope 2, f equal to n cubed is slope 3. The three cases are the three positions of a line against the watershed line.',
      keyword: 'log-log axes' },

    { id: 'd2', scene: 'decision', start: 172, end: 180,
      caption: 'Below: the leaves win. Equal: the levels tie and a log appears. Above: the root wins.',
      narration: 'A line below the watershed means f grows more slowly than the leaves can multiply, so the leaves win and the answer is the watershed. A line on it means the levels tie, and the tie contributes one log. A line above it means the root wins and the answer is f.',
      detail: 'The three answers are the watershed, the watershed times a log, and f. Nothing else is possible, which is why the theorem has exactly three cases and no fourth.',
      keyword: 'the levels tie' },

    { id: 'd3', scene: 'decision', start: 180, end: 186,
      caption: 'Below and above mean by a polynomial factor: f is at most the watershed over n^epsilon, for one fixed epsilon above zero.',
      narration: 'Below and above do not mean merely smaller or larger. They mean by a polynomial factor: f of n is at most the watershed divided by n to the epsilon, for one fixed epsilon above zero. The gap has to grow without bound.',
      detail: 'The epsilon is a witness, not a parameter to choose cleverly. If some positive epsilon works, case 1 applies; if no positive epsilon works, case 1 does not apply, however close f looks to the watershed.',
      keyword: 'by a polynomial factor' },

    { id: 'd4', scene: 'decision', start: 186, end: 192,
      caption: 'The page classifies every (a, b, p) on a 72-entry grid and checks each answer numerically. All 72 agree.',
      narration: 'The page does not take this on trust. It takes seventy-two combinations of a, b and p, classifies each one by the rule, and then checks the answer numerically by unrolling. All seventy-two agree with the rule.',
      detail: 'The grid is a = 2, 3, 4, 8; b = 2, 3, 4; p = 0, 0.5, 1, 1.5, 2, 3, with f(n) = n^p. For each entry the page computes T by unrolling to sixteen levels and checks that T divided by the predicted closed form stays inside a factor of three.',
      keyword: 'seventy-two combinations' },

    /* ---- 7. the regularity condition -------------------------------------- */
    { id: 'r1', scene: 'regularity', start: 192, end: 200,
      caption: 'Case 3 has a second hypothesis: a times f(n/b) is at most c times f(n), for some c below 1 and every large n.',
      narration: 'Case 3 has a second hypothesis, and the textbook states it in the same breath as the first. There must be a constant c strictly below one such that a times f of n over b is at most c times f of n, for every sufficiently large n.',
      detail: 'The condition says that one level down costs strictly less than the level above, by a fraction that does not shrink to zero. Without it, the geometric bound that case 3 relies on does not go through.',
      keyword: 'a constant c strictly below one' },

    { id: 'r2', scene: 'regularity', start: 200, end: 208,
      caption: 'In words: each level down costs less than the one above, by a fixed fraction. That is what makes the series converge.',
      narration: 'In words: each level down costs less than the level above by a fixed fraction, so the series of levels converges and the root dominates. With c equal to a half, the whole tree costs at most twice the root.',
      detail: 'The bound is a geometric series: f(n) plus c f(n) plus c squared f(n) and so on, which is f(n) over one minus c. For c equal to a half that is twice f(n), which is exactly the bound the previous scene computed.',
      keyword: 'by a fixed fraction' },

    { id: 'r3', scene: 'regularity', start: 208, end: 216,
      caption: 'For f(n) = n^p the ratio is exactly a / b^p. So c below 1 is the same statement as p above log_b a.',
      narration: 'Now the useful part. When f of n is n to the p, the ratio a times f of n over b, divided by f of n, is exactly a over b to the p, with no n in it. So a c below one exists exactly when a over b to the p is below one, which is exactly when p is above log base b of a.',
      detail: 'The page computes the ratio and the closed form a/b^p for several a, b and p and they agree to twelve decimal places: a = 2, b = 2, p = 2 gives 0.5; a = 4, b = 2, p = 3 gives 0.5; a = 3, b = 3, p = 2 gives one third.',
      keyword: 'exactly a over b to the p' },

    { id: 'r4', scene: 'regularity', start: 216, end: 226,
      caption: 'So for a polynomial f the condition is not extra work: it is case 3 own polynomial gap. At a = 8, b = 2, p = 3 the ratio is exactly 1, the boundary.',
      narration: 'So for a polynomial f the regularity condition is not extra work at all. It is the same statement as the polynomial gap, which is why papers never test it separately. At a equal to eight, b equal to two and p equal to three the ratio is exactly one: that is the boundary, and it is case 2, not case 3.',
      detail: 'For a non-polynomial f the condition is genuinely separate and must be checked. The page computes one such f, n squared times two plus or minus one according to the parity of the level, and finds the ratio reaching one and a half, so no c below one exists; the theorem then does not apply, although the answer happens still to be Theta of f.',
      keyword: 'the same statement as the polynomial gap',
      trap: 'A theorem whose hypothesis fails does not say the conclusion is false. It says the theorem is silent. Showing that the conclusion still holds in such a case requires a separate argument, not a citation.' },

    /* ---- 8. the gap -------------------------------------------------------- */
    { id: 'g1', scene: 'gap', start: 226, end: 234,
      caption: 'Now the case the theorem cannot answer: f(n) = n / log n, with a = 2, b = 2. The watershed is n.',
      narration: 'Now the case the theorem cannot answer. Take a equal to two, b equal to two, so the watershed is n, and take f of n equal to n divided by log base two of n.',
      detail: 'This f is smaller than the watershed for every n above one, so it looks like case 1 at a glance. The question is whether it is smaller by a polynomial factor, and that is the only question case 1 asks.',
      keyword: 'the case the theorem cannot answer' },

    { id: 'g2', scene: 'gap', start: 234, end: 242,
      caption: 'Case 1 would need n / log n at most n over n^epsilon, that is n^epsilon over log n bounded. It is not bounded.',
      narration: 'Case 1 would need n over log n to be at most n over n to the epsilon, which is the same as n to the epsilon over log n being bounded. That quantity is not bounded; it grows without limit.',
      detail: 'At n equal to two to the fortieth, n to the 0.5 over log base two of n is about twenty-six thousand, and with epsilon equal to one it is about twenty-seven billion. Raising epsilon makes it worse, not better.',
      keyword: 'not bounded' },

    { id: 'g3', scene: 'gap', start: 242, end: 250,
      caption: 'So no epsilon works, and case 1 does not apply. Neither does case 2 or 3: f is not equal to n, and it is not polynomially larger.',
      narration: 'So no positive epsilon makes the gap polynomial, and case 1 does not apply. Case 2 does not apply because f is not equal to the watershed, and case 3 does not apply because f is smaller than it. The theorem is silent.',
      detail: 'This is the gap between cases 1 and 2. It is a real gap, not a gap in the student understanding: the theorem genuinely does not cover f between the watershed over a polynomial and the watershed itself.',
      keyword: 'The theorem is silent',
      trap: 'The most common error in this topic is answering Theta of n for n / log n by quoting case 1. Case 1 needs the polynomial gap, and a log factor is not one.' },

    { id: 'g4', scene: 'gap', start: 250, end: 262,
      caption: 'Unrolling gives level weights n/k, n/(k-1), and so on up to n/1: a harmonic sum. T = n(1 + H_k), which is Theta of n log log n.',
      narration: 'So unroll instead. Level i weighs two to the i times n over two to the i, divided by k minus i, which is n over k minus i. The weights are n over ten, n over nine, and so on up to n over one: a harmonic series. Its sum is n times one plus the k-th harmonic number, which is Theta of n log log n.',
      detail: 'The page computes T = n (1 + H_k) exactly and checks it against the unrolled sum for k from four to twenty. The harmonic number H_k is between ln k and ln k plus one, so T is between n ln k and n (1 + ln k), and ln k is ln log base 2 of n.',
      keyword: 'Theta of n log log n' },

    /* ---- 9. extended case 2 ------------------------------------------------ */
    { id: 'x1', scene: 'extended', start: 262, end: 270,
      caption: 'One more boundary, on the other side: f(n) = n log n with a = 2, b = 2. f is neither equal to n nor polynomially larger.',
      narration: 'One more boundary, this time on the other side of case 2. Take a equal to two, b equal to two, and f of n equal to n times log base two of n. It is not equal to the watershed, because of the log, and it is not polynomially larger, because the log is not a power.',
      detail: 'So the three-case statement refuses this one too, for the same reason as the gap: the factor is a log, not a power. The fix is an extension of case 2 rather than a new case.',
      keyword: 'neither equal to n nor polynomially larger' },

    { id: 'x2', scene: 'extended', start: 270, end: 278,
      caption: 'Extended case 2: if f is the watershed times log^k n, the answer is the watershed times log^(k+1) n. One extra log.',
      narration: 'The extension of case 2 says: if f of n is the watershed times log to the k of n, for any k at least zero, then T is the watershed times log to the k plus one of n. Each power of log in f costs exactly one more power in the answer.',
      detail: 'With k equal to zero this is the ordinary case 2, so the extension contains the original. That is why it is worth learning as one statement instead of two: the plain case is the k equal to zero entry of a family.',
      keyword: 'log to the k plus one' },

    { id: 'x3', scene: 'extended', start: 278, end: 286,
      caption: 'Here T = n(1 + k(k+1)/2) exactly. Divided by n k squared it is 0.578 at k = 8, falling to 0.5: Theta of n log squared n.',
      narration: 'For this recurrence the exact solution is n times one plus k times k plus one over two. Divided by n k squared it is 0.578 at k equal to eight, 0.549 at k equal to twelve, and it tends to one half. So T is Theta of n log squared n, and the constant is a half.',
      detail: 'The page checks the exact form n(1 + k(k+1)/2) against the unrolled sum for k from four to twenty, and checks that T over n k squared decreases towards 0.5 rather than merely staying bounded.',
      keyword: 'Theta of n log squared n' },

    { id: 'x4', scene: 'extended', start: 286, end: 292,
      caption: 'Checked for k = 0, 1 and 2: f equal to n, n log n, n log squared n give n log n, n log squared n, n log cubed n.',
      narration: 'The rule is checked for three values of k. With f equal to n the answer is n log n. With f equal to n log n the answer is n log squared n. With f equal to n log squared n the answer is n log cubed n. Three rungs of one ladder.',
      detail: 'For each rung the page divides T by the predicted closed form and reports the ratio over sixteen levels; each ratio converges rather than drifting, which is what distinguishes a correct class from a plausible one.',
      keyword: 'Three rungs of one ladder' },

    /* ---- 10. shapes the theorem refuses ------------------------------------ */
    { id: 'l1', scene: 'limits', start: 292, end: 300,
      caption: 'The theorem applies to a T(n/b) + f(n) and to nothing else. Three shapes it refuses, and each needs its own method.',
      narration: 'The theorem applies to a times T of n over b plus f of n, and to nothing else. Here are three shapes it refuses, and each one needs its own method rather than a formula.',
      detail: 'Refusing is not the same as being hard. Each of the three can be solved exactly by unrolling or by substitution, and the papers ask them precisely to see whether the candidate reaches for a formula that does not apply.',
      keyword: 'Three shapes it refuses' },

    { id: 'l2', scene: 'limits', start: 300, end: 308,
      caption: 'Subtract and conquer: T(n) = 2T(n-1) + n 2^n. The size falls by one, not by a factor, so b does not exist.',
      narration: 'First, subtract and conquer: T of n equals two T of n minus one, plus n times two to the n. The size falls by one rather than by a factor, so there is no b, and the theorem has nothing to say. Unrolling gives about a half n squared two to the n, which the page computes exactly at n equal to forty.',
      detail: 'The unrolled sum here is a sum over n levels rather than log n levels, which is why the answer gains a factor n rather than a log. The exact solution satisfies T / (n^2 2^n) tending to a half: 0.56 at n = 10 and 0.513 at n = 40.',
      keyword: 'there is no b' },

    { id: 'l3', scene: 'limits', start: 308, end: 316,
      caption: 'A domain transform: T(n) = root n times T(root n) + n. The coefficient is not a constant, so a does not exist.',
      narration: 'Second, a domain transform: T of n equals the square root of n times T of the square root of n, plus n. The coefficient in front of the recursive call is not a constant, so there is no a either. Substituting n equal to two to the two to the m turns it into a sum that adds one per step, and the answer is n log log n.',
      detail: 'The substitution is the standard trick for a recurrence whose argument is transformed: write n as two to the two to the m, define U of m as T of that, and the recurrence becomes U(m) = U(m-1) + 1 times the same outer factor. The page computes T over n log log n and reports it settling near one.',
      keyword: 'there is no a either' },

    { id: 'l4', scene: 'limits', start: 316, end: 324,
      caption: 'And a non-polynomial gap: f between the watershed over n^epsilon and the watershed. Unroll, or substitute a guess and prove it.',
      narration: 'And third, the gap: an f that sits between the watershed divided by any power of n and the watershed itself. There the theorem is silent, and the method is to unroll the tree, as scene 8 did, or to guess the answer and prove it by substitution.',
      detail: 'The two methods are not interchangeable in cost. Unrolling gives the exact sum when the level weights form a series you recognise; substitution is needed when they do not, and it requires the guess to come from somewhere.',
      keyword: 'the method is to unroll the tree' },

    /* ---- 11. previous-year items ------------------------------------------- */
    { id: 'q1', scene: 'gate', start: 324, end: 332,
      caption: 'GATE CSE 2014, Set 2: T(n) = 2T(n/2) + log n. The watershed is n, and a log is polynomially below any power: case 1.',
      narration: 'GATE CSE 2014, Set 2 asks for the solution of T of n equals two T of n over two, plus log n. The watershed is n. A logarithm is below n to the 0.5, which is a polynomial gap, so case 1 applies and the answer is Theta of n. The exact solution is three n minus log n minus two, which the page computes.',
      detail: 'The temptation is to see the log and reach for the extended case 2. That case needs f to be the watershed times a power of log, and here f is a log while the watershed is n: f is not merely off by a log factor, it is polynomially smaller. The wording comes from past-paper archives; the count is recomputed here.',
      keyword: 'Theta of n' },

    { id: 'q2', scene: 'gate', start: 332, end: 340,
      caption: 'GATE CSE 2024, Set 1: T(n) = root n T(root n) + n. Not the theorem shape: substituting n = 2^(2^m) gives n log log n.',
      narration: 'GATE CSE 2024, Set 1 asks about T of n equals root n times T of root n, plus n. The coefficient is not constant, so this is the second refused shape. Substituting gives n log log n, and the page computes T over n log log n at n equal to two to the 512 and reports it near one point one nine.',
      detail: 'The options offered are n log log n, n log n, n squared log n and n squared log log n. Only the first survives the substitution, and the computed ratio rules out the others: T over n log n falls towards zero, so n log n is an overestimate that is not tight.',
      keyword: 'n log log n' },

    { id: 'q3', scene: 'gate', start: 340, end: 348,
      caption: 'GATE CSE 2025, Set 1: T(n) = 2T(n-1) + n 2^n. Subtract and conquer: unrolling gives a half n squared 2^n.',
      narration: 'GATE CSE 2025, Set 1 asks about T of n equals two T of n minus one, plus n times two to the n, with T of zero equal to one. This is the first refused shape. Unrolling gives about a half n squared two to the n, computed exactly at n equal to forty, and the answer is Theta of n squared two to the n.',
      detail: 'The four options are n squared 2^n, n 2^n, log squared n times 2^n and 4^n. The ratio T over n squared 2^n is 0.56 at n equal to ten and 0.513 at n equal to forty, so the first is right and the other three are each off by a polynomial factor.',
      keyword: 'a half n squared 2^n' },

    { id: 'q4', scene: 'gate', start: 348, end: 356,
      caption: 'Four steps: identify a, b and f; compute the watershed; place f; then check the case own condition before writing the answer.',
      narration: 'Four steps answer any question of this family. Identify a, b and f. Compute the watershed n to the log base b of a. Decide whether f is below, on, or above it, and by how much. Then check the condition that the chosen case carries, and only then write the answer.',
      detail: 'The fourth step is where marks are lost: case 1 and case 3 both need the gap to be polynomial, and case 3 also needs the regularity condition. For a polynomial f the two conditions coincide, which the page derives and checks; for anything else they must be checked separately.',
      keyword: 'Four steps' }
  ]
};
