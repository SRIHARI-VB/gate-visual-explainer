/* ==========================================================================
   recurrence-relations — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs — never edited by hand.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'what',
      n: 1,
      title: 'A rule that looks backwards',
      start: 0, end: 30,
      objective: 'Separate the two halves of every recurrence — the base cases that are given outright and the rule that produces the next term — and see why neither half alone determines a sequence.'
    },
    {
      id: 'setup',
      n: 2,
      title: 'Building a recurrence from a constraint',
      start: 30, end: 60,
      objective: 'Turn a counting condition on strings into a recurrence by conditioning on the last symbol, and check the resulting rule against the first few values.'
    },
    {
      id: 'unroll',
      n: 3,
      title: 'Unrolling and telescoping',
      start: 60, end: 90,
      objective: 'Solve a first-order recurrence by writing it out step by step until the base case, cancelling the matching terms, and summing what is left.'
    },
    {
      id: 'char',
      n: 4,
      title: 'The characteristic equation',
      start: 90, end: 120,
      objective: 'Solve a second-order linear homogeneous recurrence with constant coefficients from the roots of its characteristic equation, and see that a root whose coefficient is zero contributes nothing.'
    },
    {
      id: 'repeat',
      n: 5,
      title: 'Repeated roots: why an n appears',
      start: 120, end: 150,
      objective: 'Explain the extra factor of n in the repeated-root case as the second independent solution a double root demands, not as a memorised exception.'
    },
    {
      id: 'change',
      n: 6,
      title: 'Change of variable: dividing out the exponential',
      start: 150, end: 180,
      objective: 'Divide a recurrence by the exponential that appears in its forcing term, reducing it to a plain first-order recurrence, and see why three sample values do not justify a guess.'
    },
    {
      id: 'tree',
      n: 7,
      title: 'Divide and conquer: the recursion tree',
      start: 180, end: 210,
      objective: 'Draw a divide-and-conquer recurrence as a tree whose level sums reveal the total, and state what the picture assumes before it counts as an argument.'
    },
    {
      id: 'master',
      n: 8,
      title: 'The master theorem and its gap',
      start: 210, end: 240,
      objective: 'Apply the three master-theorem cases by comparing the forcing term with the watershed n to the log base b of a, and recognise the values that fall between cases.'
    },
    {
      id: 'growth',
      n: 9,
      title: 'The growth ladder and what GATE asks',
      start: 240, end: 270,
      objective: 'Place the standard closed forms on one growth ladder, and separate a tight bound from an upper bound when the options are written with Theta and with big O.'
    },
    {
      id: 'procedure',
      n: 10,
      title: 'The decision procedure and four traps',
      start: 270, end: 300,
      objective: 'Route any recurrence to the right method in a fixed order, name the four errors that cost marks, and finish by verifying the closed form against the base cases.'
    }
  ],

  events: [
    /* ---------------- scene 1: what ---------------- */
    {
      id: 'wh-1', start: 0, end: 7, scene: 'what',
      caption: 'A recurrence relation does not hand you the term. It tells you how to reach it from the terms just before it.',
      detail: 'A sequence can be given in two ways: by a formula in n that you evaluate directly, or by a rule that produces each term from earlier ones. A recurrence relation is the second kind. The word relation is literal — the rule relates a term to its predecessors, and the work is to turn that relation into a formula in n.',
      keyword: 'reach it from the terms just before it',
      trap: null,
      narration: 'A recurrence relation does not hand you the term. It tells you how to reach it from the terms just before it.'
    },
    {
      id: 'wh-2', start: 7, end: 15, scene: 'what',
      caption: 'Every recurrence has two halves: base cases that are given outright, and a rule that moves one step forward.',
      detail: 'The base cases are the terms you are told. The rule is the step. The base cases are not a formality: without them the rule describes infinitely many different sequences, one for every possible starting value.',
      keyword: 'base cases',
      trap: 'Forgetting the base cases is the first way to lose marks. A rule alone never fixes the constant that the closed form will contain.',
      narration: 'Every recurrence has two halves: base cases that are given outright, and a rule that moves one step forward.'
    },
    {
      id: 'wh-3', start: 15, end: 22, scene: 'what',
      caption: 'Read the notation in words: a sub n is the term at position n, and a sub n minus one is the term immediately before it.',
      detail: 'The subscript is an index, not an exponent. a sub n minus one means the term one position earlier, so the rule a sub n equals a sub n minus one plus three says each term is three more than the one before it. The order of the recurrence is the largest gap the rule reaches back — one position here, two for the Fibonacci rule.',
      keyword: 'a sub n minus one',
      trap: null,
      narration: 'Read the notation in words: a sub n is the term at position n, and a sub n minus one is the term immediately before it.'
    },
    {
      id: 'wh-4', start: 22, end: 30, scene: 'what',
      caption: 'Two recurrences can share a rule and differ only in their base cases — and then they are different sequences.',
      detail: 'Take the rule a sub n equals two a sub n minus one. With a sub zero equal to one the sequence is one, two, four, eight. With a sub zero equal to three it is three, six, twelve, twenty-four. Same rule, different sequence. The closed forms differ by the constant the base case supplies.',
      keyword: 'different sequences',
      trap: null,
      narration: 'Two recurrences can share a rule and differ only in their base cases — and then they are different sequences.'
    },

    /* ---------------- scene 2: setup ---------------- */
    {
      id: 'se-1', start: 30, end: 37, scene: 'setup',
      caption: 'Count the n-bit strings with no two consecutive ones. Do not look at the whole string; look at its last bit.',
      detail: 'This is GATE CSE 2016 Set 1 Question 2. The question asks for a recurrence, not a number, so the work is to split the objects into cases that are disjoint and that shrink the problem.',
      keyword: 'last bit',
      trap: null,
      narration: 'Count the n-bit strings with no two consecutive ones. Do not look at the whole string; look at its last bit.'
    },
    {
      id: 'se-2', start: 37, end: 45, scene: 'setup',
      caption: 'If the last bit is zero, the first n minus one bits may be any valid string. That contributes a sub n minus one.',
      detail: 'Appending a zero to a string that already avoids two consecutive ones cannot create the forbidden pattern, because the new last bit is zero. So every valid string of length n minus one gives exactly one valid string of length n ending in zero, and every such string arises this way.',
      keyword: 'a sub n minus one',
      trap: null,
      narration: 'If the last bit is zero, the first n minus one bits may be any valid string. That contributes a sub n minus one.'
    },
    {
      id: 'se-3', start: 45, end: 52, scene: 'setup',
      caption: 'If the last bit is one, the bit before it must be zero. The first n minus two bits are then free, giving a sub n minus two.',
      detail: 'The condition forces the ending zero one. Removing those two bits leaves a valid string of length n minus two, and every valid string of length n minus two can be extended by zero one. The two cases cannot both hold, so the sum rule applies with no correction.',
      keyword: 'a sub n minus two',
      trap: null,
      narration: 'If the last bit is one, the bit before it must be zero. The first n minus two bits are then free, giving a sub n minus two.'
    },
    {
      id: 'se-4', start: 52, end: 60, scene: 'setup',
      caption: 'So a sub n equals a sub n minus one plus a sub n minus two, with a sub one equal to two and a sub two equal to three.',
      detail: 'The values are two strings of length one and three of length two. The sequence then runs two, three, five, eight, thirteen — the Fibonacci numbers shifted. The same method solves the companion question about strings that do contain two consecutive ones, but there the count of strings that avoid the pattern has to be subtracted from two to the n.',
      keyword: 'a sub n minus one plus a sub n minus two',
      trap: 'A recurrence with the right rule and wrong base cases is a different sequence. Always evaluate the first two values by hand and check that the rule reproduces them.',
      narration: 'So a sub n equals a sub n minus one plus a sub n minus two, with a sub one equal to two and a sub two equal to three.'
    },

    /* ---------------- scene 3: unroll ---------------- */
    {
      id: 'un-1', start: 60, end: 68, scene: 'unroll',
      caption: 'Here the rule is a sub n equals a sub n minus one plus six n squared plus two n, with a sub one equal to eight.',
      detail: 'This is GATE CSE 2016 Set 1 Question 27. The recurrence is first order and linear but not homogeneous: each step adds a polynomial in n. There is no characteristic equation to solve, because the coefficient of a sub n minus one is one and the added term depends on n.',
      keyword: 'six n squared plus two n',
      trap: null,
      narration: 'Here the rule is a sub n equals a sub n minus one plus six n squared plus two n, with a sub one equal to eight.'
    },
    {
      id: 'un-2', start: 68, end: 76, scene: 'unroll',
      caption: 'Write the rule out for every step and add the equations. The a terms cancel in pairs, leaving a sum.',
      detail: 'Each line uses the previous line, so adding them telescopes: a sub n appears once on the left and once on the right of the next line. What survives is the base value a sub one plus the sum of every added term from two up to n. This is why a first-order recurrence is a sum in disguise.',
      keyword: 'cancel in pairs',
      trap: null,
      narration: 'Write the rule out for every step and add the equations. The a terms cancel in pairs, leaving a sum.'
    },
    {
      id: 'un-3', start: 76, end: 83, scene: 'unroll',
      caption: 'The two sums are known: the sum of squares and the sum of first powers. Together they give a sub 99 equal to one million nine hundred eighty thousand.',
      detail: 'The sum of k squared from one to n is n times n plus one times two n plus one, over six. The sum of k from one to n is n times n plus one over two. With n equal to ninety-nine and the base of eight restored, the total is one million nine hundred eighty thousand exactly.',
      keyword: 'one million nine hundred eighty thousand',
      trap: null,
      narration: 'The two sums are known: the sum of squares and the sum of first powers. Together they give a sub 99 equal to one million nine hundred eighty thousand.'
    },
    {
      id: 'un-4', start: 83, end: 90, scene: 'unroll',
      caption: 'Written as K times ten to the fourth, the value is 198 times ten to the fourth, so K is 198.',
      detail: 'The answer key for that paper gives 198. Note the shape of the closed form: two n times n plus one squared, minus eight, plus the base eight — the constant cancels here, which is a coincidence of the numbers and not a rule.',
      keyword: 'K is 198',
      trap: 'The sum must run from the first index where the rule applies. Starting the sum at one instead of two adds a spurious six plus two and shifts the answer.',
      narration: 'Written as K times ten to the fourth, the value is 198 times ten to the fourth, so K is 198.'
    },

    /* ---------------- scene 4: char ---------------- */
    {
      id: 'ch-1', start: 90, end: 98, scene: 'char',
      caption: 'For a linear homogeneous recurrence with constant coefficients, try a solution of the form r to the n.',
      detail: 'Linear means no term is squared and no two terms are multiplied. Homogeneous means there is no added term free of a. Constant coefficients means the multipliers do not depend on n. Under those three conditions, substituting r to the n turns the recurrence into a polynomial equation in r.',
      keyword: 'r to the n',
      trap: null,
      narration: 'For a linear homogeneous recurrence with constant coefficients, try a solution of the form r to the n.'
    },
    {
      id: 'ch-2', start: 98, end: 106, scene: 'char',
      caption: 'The example is T of n equals five T of n minus one minus six T of n minus two, which becomes r squared minus five r plus six equals zero.',
      detail: 'Dividing the substituted equation by r to the n minus two leaves a quadratic whose roots are two and three. This is GATE CSE 2024 Set 2 Question 15, with T of zero equal to one and T of one equal to two.',
      keyword: 'r squared minus five r plus six',
      trap: null,
      narration: 'The example is T of n equals five T of n minus one minus six T of n minus two, which becomes r squared minus five r plus six equals zero.'
    },
    {
      id: 'ch-3', start: 106, end: 113, scene: 'char',
      caption: 'Two distinct roots give two independent solutions, so the general answer is A times two to the n plus B times three to the n.',
      detail: 'Any combination of solutions of a homogeneous linear recurrence is again a solution, so the general solution is the sum of the two. The two base cases supply two equations, which determine A and B uniquely when the roots are distinct.',
      keyword: 'A times two to the n plus B times three to the n',
      trap: null,
      narration: 'Two distinct roots give two independent solutions, so the general answer is A times two to the n plus B times three to the n.'
    },
    {
      id: 'ch-4', start: 113, end: 120, scene: 'char',
      caption: 'Solving gives B equal to zero, so the term is exactly two to the n. The larger root contributes nothing.',
      detail: 'The official key for that question is Theta of two to the n, not Theta of three to the n. A great many candidates chose three to the n because three is the larger root. The roots decide the possible shapes; the initial conditions decide which shapes are actually present, and a shape with coefficient zero is absent.',
      keyword: 'contributes nothing',
      trap: 'Never report the largest root as the answer without solving for its coefficient. The coefficient can vanish, and then the growth is set by a smaller root.',
      narration: 'Solving gives B equal to zero, so the term is exactly two to the n. The larger root contributes nothing.'
    },

    /* ---------------- scene 5: repeat ---------------- */
    {
      id: 'rp-1', start: 120, end: 128, scene: 'repeat',
      caption: 'Now let the two roots coincide. T of n equals four T of n minus one minus four T of n minus two has the single root two, twice.',
      detail: 'The characteristic equation is r squared minus four r plus four, which is r minus two squared. Both roots are two. If we wrote the general solution as A times two to the n plus B times two to the n, that would collapse to a single constant times two to the n.',
      keyword: 'the single root two',
      trap: null,
      narration: 'Now let the two roots coincide. T of n equals four T of n minus one minus four T of n minus two has the single root two, twice.'
    },
    {
      id: 'rp-2', start: 128, end: 136, scene: 'repeat',
      caption: 'One root gives one free constant, but two base cases need two. The repair is to multiply the second copy by n.',
      detail: 'A second-order recurrence needs two independent solutions. A double root supplies only one shape, so a second shape must be found. Multiplying the repeated shape by n produces a genuinely different sequence, and substituting it back shows it satisfies the recurrence.',
      keyword: 'multiply the second copy by n',
      trap: null,
      narration: 'One root gives one free constant, but two base cases need two. The repair is to multiply the second copy by n.'
    },
    {
      id: 'rp-3', start: 136, end: 143, scene: 'repeat',
      caption: 'With a repeated root the solution is A plus B n, all multiplied by r to the n. Here that is one plus n, times two to the n.',
      detail: 'With T of zero equal to one and T of one equal to four, the constants are A equal to one and B equal to one. The values run one, four, twelve, thirty-two, eighty — each term roughly twice the last, multiplied by a slowly growing factor of n.',
      keyword: 'A plus B n',
      trap: null,
      narration: 'With a repeated root the solution is A plus B n, all multiplied by r to the n. Here that is one plus n, times two to the n.'
    },
    {
      id: 'rp-4', start: 143, end: 150, scene: 'repeat',
      caption: 'The extra n is not decoration. It is the second independent solution that a repeated root forces you to supply.',
      detail: 'The same pattern continues for higher multiplicity: a root repeated m times contributes a polynomial in n of degree m minus one, times r to the n. The degree of that polynomial is always one less than the multiplicity, which is why a single root needs no n at all.',
      keyword: 'second independent solution',
      trap: 'Writing only A times r to the n for a double root leaves the answer one constant short, and the two base cases cannot both be satisfied.',
      narration: 'The extra n is not decoration. It is the second independent solution that a repeated root forces you to supply.'
    },

    /* ---------------- scene 6: change ---------------- */
    {
      id: 'cv-1', start: 150, end: 158, scene: 'change',
      caption: 'T of n equals two T of n minus one plus n times two to the n, with T of zero equal to one. The forcing shares the base two.',
      detail: 'This is GATE CSE 2025 Set 1. The recursion multiplies by two and the forcing also carries two to the n, so the two effects reinforce each other instead of competing. Guessing the shape by eye is unreliable here, which is exactly what the question tests.',
      keyword: 'shares the base two',
      trap: null,
      narration: 'T of n equals two T of n minus one plus n times two to the n, with T of zero equal to one. The forcing shares the base two.'
    },
    {
      id: 'cv-2', start: 158, end: 166, scene: 'change',
      caption: 'Divide the whole equation by two to the n. Then S of n equals S of n minus one plus n, a plain first-order recurrence.',
      detail: 'The substitution S of n equals T of n over two to the n is legitimate because the division is exact and applied to both sides. The exponential disappears from the recursion and the leftover forcing is the polynomial n, which unrolls immediately.',
      keyword: 'Divide the whole equation by two to the n',
      trap: 'Dividing by n times two to the n instead of two to the n breaks the substitution: S of n minus one would then have a different denominator and the step would not cancel.',
      narration: 'Divide the whole equation by two to the n. Then S of n equals S of n minus one plus n, a plain first-order recurrence.'
    },
    {
      id: 'cv-3', start: 166, end: 173, scene: 'change',
      caption: 'Unrolling gives S of n as one plus the sum of one to n, which is quadratic. So T of n is Theta of n squared times two to the n.',
      detail: 'The sum of one to n is n times n plus one over two, so T of n equals two to the n times one plus n times n plus one over two. The official key is option A, Theta of n squared two to the n, and the closed form agrees for every n tested.',
      keyword: 'n squared times two to the n',
      trap: null,
      narration: 'Unrolling gives S of n as one plus the sum of one to n, which is quadratic. So T of n is Theta of n squared times two to the n.'
    },
    {
      id: 'cv-4', start: 173, end: 180, scene: 'change',
      caption: 'Three sample values are not evidence. At n equal to three the true value is fifty-six, while four to the n would give sixty-four.',
      detail: 'The values one, four, sixteen look like powers of four for the first three terms, and many candidates stopped there. The fourth value, fifty-six, is already far below sixty-four, and the ratio to four to the n falls without bound. A guess from small values must be confirmed by unrolling or by induction.',
      keyword: 'not evidence',
      trap: 'Checking two or three values and pattern-matching is the single most common way to get a recurrence question wrong. Two sequences can agree on their first four terms and diverge forever.',
      narration: 'Three sample values are not evidence. At n equal to three the true value is fifty-six, while four to the n would give sixty-four.'
    },

    /* ---------------- scene 7: tree ---------------- */
    {
      id: 'tr-1', start: 180, end: 188, scene: 'tree',
      caption: 'Draw T of n equals two T of n over two plus n as a tree: each node costs n, and has two children of half the size.',
      detail: 'The root is the whole problem. Its two children are the subproblems, each of size n over two, and the cost written at the root is the work done at that level to split and combine. The leaves are the base cases, where the recursion stops.',
      keyword: 'two children of half the size',
      trap: null,
      narration: 'Draw T of n equals two T of n over two plus n as a tree: each node costs n, and has two children of half the size.'
    },
    {
      id: 'tr-2', start: 188, end: 196, scene: 'tree',
      caption: 'Every level adds up to n, because halving the size doubles the number of nodes. The level cost is constant.',
      detail: 'Level k holds two to the k nodes, each of size n over two to the k, so each contributes that much work and the total is n. This is the geometric-balance picture: when the per-level cost is constant, the total is that constant times the number of levels.',
      keyword: 'Every level adds up to n',
      trap: null,
      narration: 'Every level adds up to n, because halving the size doubles the number of nodes. The level cost is constant.'
    },
    {
      id: 'tr-3', start: 196, end: 203, scene: 'tree',
      caption: 'Halving reaches size one after log base two of n levels, so the total is n times log n, plus the work at the leaves.',
      detail: 'For this recurrence the leaves cost one each and there are n of them, so the exact value is n times log base two of n plus n. The Theta class is n log n; the extra n is the leaf term and does not change the class.',
      keyword: 'n times log n',
      trap: null,
      narration: 'Halving reaches size one after log base two of n levels, so the total is n times log n, plus the work at the leaves.'
    },
    {
      id: 'tr-4', start: 203, end: 210, scene: 'tree',
      caption: 'The tree is a proof sketch, not a proof. It assumes the level cost really is constant and the sizes really do halve exactly.',
      detail: 'Real n is rarely a power of two, so the sizes are floors and ceilings and the levels are only approximately equal. The tree tells you what to guess; the guess is then established by substitution or by induction. Drawing the picture and stopping there is not an argument.',
      keyword: 'proof sketch',
      trap: 'A diagram is not a derivation. State the assumption the picture makes — equal level cost — before you use the total.',
      narration: 'The tree is a proof sketch, not a proof. It assumes the level cost really is constant and the sizes really do halve exactly.'
    },

    /* ---------------- scene 8: master ---------------- */
    {
      id: 'ms-1', start: 210, end: 218, scene: 'master',
      caption: 'For T of n equals a T of n over b plus f of n, compare f of n with the watershed n to the log base b of a.',
      detail: 'The master theorem applies to divide-and-conquer recurrences with a at least one subproblem, b greater than one, and an asymptotically positive forcing term. The watershed is the number of leaves, n to the log base b of a. The three cases are decided by comparing the forcing with that watershed.',
      keyword: 'watershed',
      trap: 'The theorem needs b greater than one. A recurrence like T of n equals two T of n minus one is not divide and conquer, and the theorem says nothing about it.',
      narration: 'For T of n equals a T of n over b plus f of n, compare f of n with the watershed n to the log base b of a.'
    },
    {
      id: 'ms-2', start: 218, end: 226, scene: 'master',
      caption: 'Forcing smaller than the watershed: the leaves dominate. Equal: multiply by log n. Larger and regular: the top dominates.',
      detail: 'Case one is T of n equals Theta of n to the log base b of a. Case two is Theta of the watershed times log n. Case three is Theta of f of n, provided f satisfies a regularity condition. The three cases are exhaustive only when the forcing differs from the watershed by a polynomial factor.',
      keyword: 'the leaves dominate',
      trap: null,
      narration: 'Forcing smaller than the watershed: the leaves dominate. Equal: multiply by log n. Larger and regular: the top dominates.'
    },
    {
      id: 'ms-3', start: 226, end: 233, scene: 'master',
      caption: 'T of n equals two T of n over two plus n log n sits between the first two cases. The plain theorem is silent.',
      detail: 'Here the watershed is n to the log base two of two, which is n, and the forcing is n log n. That is larger than the watershed but only by a factor of log n, not by any power of n. Case three needs a polynomial gap, so neither case applies and the theorem cannot be invoked.',
      keyword: 'the plain theorem is silent',
      trap: 'Quoting case three whenever the forcing looks bigger is wrong. Without a polynomial gap, the master theorem gives no answer at all.',
      narration: 'T of n equals two T of n over two plus n log n sits between the first two cases. The plain theorem is silent.'
    },
    {
      id: 'ms-4', start: 233, end: 240, scene: 'master',
      caption: 'The extended form handles it: the answer is n times log n squared, over two. Never force a case that does not fit.',
      detail: 'The gap case is solved by the same tree: each of the log n levels now costs n times the level index, and summing one to log n gives log n times log n plus one over two. The class is Theta of n log squared n. That is strictly more than n log n and strictly less than n to the one plus epsilon for any positive epsilon.',
      keyword: 'n times log n squared',
      trap: null,
      narration: 'The extended form handles it: the answer is n times log n squared, over two. Never force a case that does not fit.'
    },

    /* ---------------- scene 9: growth ---------------- */
    {
      id: 'gr-1', start: 240, end: 248, scene: 'growth',
      caption: 'Order the standard answers: log n, then n, then n log n, then n squared, then two to the n, then n factorial.',
      detail: 'Almost every GATE option set is a subset of this ladder. Reading the recurrence tells you which rung you are on: a subtraction in the argument gives a polynomial, a division with equal level cost gives n log n, and a multiplication by a constant greater than one gives an exponential.',
      keyword: 'log n, then n',
      trap: null,
      narration: 'Order the standard answers: log n, then n, then n log n, then n squared, then two to the n, then n factorial.'
    },
    {
      id: 'gr-2', start: 248, end: 256, scene: 'growth',
      caption: 'T of n equals T of n minus one plus one is linear. T of n equals two T of n minus one plus one is exponential.',
      detail: 'The difference is one coefficient. A coefficient of one at the recursive term keeps the sequence polynomial; a coefficient greater than one multiplies the work at every level and produces exponential growth. This single contrast explains why merge sort is n log n while the naive Fibonacci recursion is exponential.',
      keyword: 'one coefficient',
      trap: null,
      narration: 'T of n equals T of n minus one plus one is linear. T of n equals two T of n minus one plus one is exponential.'
    },
    {
      id: 'gr-3', start: 256, end: 263, scene: 'growth',
      caption: 'Base cases change the constant, and sometimes the whole answer: two T of n minus one plus n is n times two to the n.',
      detail: 'For homogeneous recurrences the base cases only fix the constants, so the Theta class is unaffected. For non-homogeneous ones the forcing accumulates along the recursion and the base case can matter more. Either way, the base case must be consistent with the closed form you claim.',
      keyword: 'change the constant',
      trap: null,
      narration: 'Base cases change the constant, and sometimes the whole answer: two T of n minus one plus n is n times two to the n.'
    },
    {
      id: 'gr-4', start: 263, end: 270, scene: 'growth',
      caption: 'A bound is not an equality. Theta is tight, big O is only an upper bound, and GATE usually asks for the tight one.',
      detail: 'Two to the n is big O of three to the n, but it is not Theta of three to the n, because the ratio does not stay bounded below. When the options mix O and Theta, the Theta option is the stronger statement and the one the key expects, unless the question explicitly asks for an upper bound.',
      keyword: 'Theta is tight',
      trap: 'Choosing big O when a Theta option exists and is true gives away the mark: the O statement is weaker, so it is true but not the answer being sought.',
      narration: 'A bound is not an equality. Theta is tight, big O is only an upper bound, and GATE usually asks for the tight one.'
    },

    /* ---------------- scene 10: procedure ---------------- */
    {
      id: 'pr-1', start: 270, end: 278, scene: 'procedure',
      caption: 'Checklist: is it first order, linear with constant coefficients, or divide and conquer? Each answer picks the method.',
      detail: 'First order with a polynomial forcing: unroll and sum. Linear with constant coefficients: write the characteristic equation. Divide and conquer: compare the forcing with the watershed. Anything else, such as a division inside the argument with an unusual forcing, needs a substitution first.',
      keyword: 'Checklist',
      trap: null,
      narration: 'Checklist: is it first order, linear with constant coefficients, or divide and conquer? Each answer picks the method.'
    },
    {
      id: 'pr-2', start: 278, end: 285, scene: 'procedure',
      caption: 'Trap one: assuming the largest root dominates. Trap two: forgetting the n when a root repeats.',
      detail: 'Both traps come from skipping the algebra. Solve for the coefficients and see which are nonzero; count the multiplicity and add the polynomial factor. The roots alone never answer the question.',
      keyword: 'largest root',
      trap: null,
      narration: 'Trap one: assuming the largest root dominates. Trap two: forgetting the n when a root repeats.'
    },
    {
      id: 'pr-3', start: 285, end: 293, scene: 'procedure',
      caption: 'Trap three: applying the master theorem inside its gap. Trap four: guessing the answer from three small values.',
      detail: 'The gap is any forcing between the watershed and the watershed times a polynomial factor; there the theorem is silent and the tree or substitution must be used. And a guess from small values is a hypothesis, not a result — confirm it by unrolling or by induction.',
      keyword: 'inside its gap',
      trap: null,
      narration: 'Trap three: applying the master theorem inside its gap. Trap four: guessing the answer from three small values.'
    },
    {
      id: 'pr-4', start: 293, end: 300, scene: 'procedure',
      caption: 'Then verify: substitute the closed form back into the recurrence, and check it reproduces both base cases.',
      detail: 'Substitution is fast and catches almost every error. If the closed form satisfies the recurrence for general n and matches the base cases, then by induction it is the sequence. That is the only step that turns a plausible answer into a correct one.',
      keyword: 'verify',
      trap: 'An answer that matches a remembered formula is not verified. The remembered formula is for a different recurrence more often than candidates expect.',
      narration: 'Then verify: substitute the closed form back into the recurrence, and check it reproduces both base cases.'
    }
  ]
};
