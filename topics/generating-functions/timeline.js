/* ==========================================================================
   generating-functions — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs — never edited by hand.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'coat',
      n: 1,
      title: 'A sequence wearing a coat of powers of x',
      start: 0, end: 30,
      objective: 'Define the ordinary generating function of a sequence, see that the coefficient is the only thing that carries information, and separate the formal object from a function that has to converge.'
    },
    {
      id: 'atoms',
      n: 2,
      title: 'Five atoms that cover the paper',
      start: 30, end: 60,
      objective: 'Learn the five closed forms — all ones, repeated ones, the even filter, the shift and the derivative — and read each one back as the sequence it produces.'
    },
    {
      id: 'product',
      n: 3,
      title: 'From a condition to a product',
      start: 60, end: 90,
      objective: 'Turn a counting condition into a product of series, and confirm the 2016 coefficient question twice: once by listing triples, once by extracting a coefficient.'
    },
    {
      id: 'denominator',
      n: 4,
      title: 'The denominator carries the recurrence',
      start: 90, end: 120,
      objective: 'Expand a rational generating function to get Fibonacci, then read the recurrence straight off the denominator by multiplying through and matching coefficients.'
    },
    {
      id: 'closed',
      n: 5,
      title: 'Two previous-year closed forms',
      start: 120, end: 150,
      objective: 'Produce the closed form of an arithmetic sequence and of a rational function with a triple denominator, using only the atom table, and check both against the sequence.'
    },
    {
      id: 'parity',
      n: 6,
      title: 'Parity, and the substitution x squared',
      start: 150, end: 180,
      objective: 'Split a sequence into its even and odd halves, build each half by substituting x squared, and reconcile the result with the shape the options are written in.'
    },
    {
      id: 'solve',
      n: 7,
      title: 'Solving a recurrence with a generating function',
      start: 180, end: 210,
      objective: 'Run the machine backwards: multiply the recurrence by x to the n, sum, solve for G, cancel the numerator factor, and recover the closed form.'
    },
    {
      id: 'catalan',
      n: 8,
      title: 'Catalan numbers: the root you must not take',
      start: 210, end: 240,
      objective: 'Solve a quadratic equation for a generating function, and use the constant term to reject the branch that has a pole at zero.'
    },
    {
      id: 'egf',
      n: 9,
      title: 'When order matters: exponential generating functions',
      start: 240, end: 270,
      objective: 'Distinguish counting without order from counting with order, and see why the labelled count divides each term by n factorial.'
    },
    {
      id: 'procedure',
      n: 10,
      title: 'The procedure and four traps',
      start: 270, end: 300,
      objective: 'Fix the four-step procedure, name the four errors that cost marks, and finish with the expansion check that catches them.'
    }
  ],

  events: [
    /* ---------------- scene 1: coat ---------------- */
    {
      id: 'co-1', start: 0, end: 7, scene: 'coat',
      caption: 'A generating function turns a whole sequence into one object: a series whose coefficients are the terms.',
      detail: 'A sequence is an infinite list of numbers. A generating function is that same list written as an infinite sum, where the term at position n is attached to x to the power n. Nothing is added up numerically; the sum is only a way of holding the whole list in one expression, so that the operations of algebra — adding, multiplying, differentiating — act on the list.',
      keyword: 'one object',
      trap: null,
      narration: 'A generating function turns a whole sequence into one object: a series whose coefficients are the terms.'
    },
    {
      id: 'co-2', start: 7, end: 15, scene: 'coat',
      caption: 'Write the terms on powers of x: the term at position zero on x to the zero, the next on x to the one, and so on forever.',
      detail: 'If the sequence is a zero, a one, a two, a three and so on, its generating function is a zero plus a one times x plus a two times x squared, continuing without end. The power of x is the position, so the position is stored in the exponent and the value is stored in the coefficient. That is the whole encoding.',
      keyword: 'the position is stored in the exponent',
      trap: null,
      narration: 'Write the terms on powers of x: the term at position zero on x to the zero, the next on x to the one, and so on forever.'
    },
    {
      id: 'co-3', start: 15, end: 22, scene: 'coat',
      caption: 'x is a placeholder, not a number. Nothing is ever evaluated, so nothing has to converge.',
      detail: 'This is the point that separates the topic from calculus. The series is called a formal power series: the symbol x is a marker that keeps the positions apart. Because no value is substituted, questions of convergence do not arise, and identities hold for every sequence, however fast it grows. The factorial sequence has a perfectly good generating function; it simply is not a rational one.',
      keyword: 'placeholder, not a number',
      trap: 'Substituting a number for x — in particular x equal to one — is meaningless here. One over one minus x has no value at one, and a series that diverges as a function is still a valid formal object.',
      narration: 'x is a placeholder, not a number. Nothing is ever evaluated, so nothing has to converge.'
    },
    {
      id: 'co-4', start: 22, end: 30, scene: 'coat',
      caption: 'Reading a coefficient back is the whole art: the coefficient of x to the n in G of x is a sub n.',
      detail: 'The notation is square brackets: the coefficient of x to the n in G of x equals a sub n. Every question in this topic ends with one of those extractions — find the coefficient of x to the twelfth, find a three minus a zero, find the term in closed form. The algebra in the middle exists only to make the extraction easy.',
      keyword: 'the coefficient of x to the n',
      trap: null,
      narration: 'Reading a coefficient back is the whole art: the coefficient of x to the n in G of x is a sub n.'
    },

    /* ---------------- scene 2: atoms ---------------- */
    {
      id: 'at-1', start: 30, end: 37, scene: 'atoms',
      caption: 'Five closed forms cover nearly every question. One over one minus x is the sequence of all ones.',
      detail: 'One over one minus x expands as one plus x plus x squared plus x cubed and onward, so its coefficient at every position is one. This is the geometric series read as a formal object: no value of x is substituted, so no restriction on x is needed. It is the atom for "any number of the same thing".',
      keyword: 'the sequence of all ones',
      trap: null,
      narration: 'Five closed forms cover nearly every question. One over one minus x is the sequence of all ones.'
    },
    {
      id: 'at-2', start: 37, end: 45, scene: 'atoms',
      caption: 'Divide by one minus x once more and the coefficients become 1, 2, 3, 4: choosing with repetition.',
      detail: 'One over one minus x squared, meaning the whole thing raised to the power two, has coefficient n plus one at position n. More generally, one over one minus x to the power k has coefficient n plus k minus one choose k minus one, equivalently n plus k minus one choose n. That binomial is the stars-and-bars count of choosing k items with repetition allowed.',
      keyword: 'choosing with repetition',
      trap: 'The exponent of the denominator is not the binomial index. With one over one minus x cubed the coefficient of x to the n is n plus two choose two, not n choose three.',
      narration: 'Divide by one minus x once more and the coefficients become 1, 2, 3, 4: choosing with repetition.'
    },
    {
      id: 'at-3', start: 45, end: 52, scene: 'atoms',
      caption: 'One over one minus x squared puts a one only on the even powers; replacing x by x squared filters by parity.',
      detail: 'Substituting x squared into an atom keeps only the terms whose exponent is even, and doubles nothing else. This single move answers every question whose sequence is defined differently at odd and even positions, including the 2022 paper. The odd positions are obtained by taking the full series, subtracting the even one, or by multiplying the odd atom by x.',
      keyword: 'only on the even powers',
      trap: null,
      narration: 'One over one minus x squared puts a one only on the even powers; replacing x by x squared filters by parity.'
    },
    {
      id: 'at-4', start: 52, end: 60, scene: 'atoms',
      caption: 'Multiplying by x shifts the sequence one place right, and differentiating multiplies the term at position n by n.',
      detail: 'Two operations do most of the remaining work. Multiplying by x to the k moves every coefficient k places later and fills the first k places with zeros. Differentiating one over one minus x gives one over one minus x squared, whose coefficient is n plus one; multiplying that by x gives the sequence n, and one more differentiation step gives n squared. That is how polynomial coefficients in the sequence are produced.',
      keyword: 'shifts the sequence one place right',
      trap: 'A shift changes the answer, not just the display. The coefficient of x to the n in x times G is the coefficient of x to the n minus one in G, so a forgotten shift is off by the amount you shifted.',
      narration: 'Multiplying by x shifts the sequence one place right, and differentiating multiplies the term at position n by n.'
    },

    /* ---------------- scene 3: product ---------------- */
    {
      id: 'pr-1', start: 60, end: 68, scene: 'product',
      caption: 'GATE 2016 Set 1 Question 26 asks for the coefficient of x to the twelfth in a cube of a series that starts at x cubed.',
      detail: 'The question is: the coefficient of x to the twelfth in the cube of the series x cubed plus x to the fourth plus x to the fifth and onward. It is a numerical-answer question worth two marks. The cube is a product of three identical factors, so each factor independently chooses one of its terms, and the exponents of the three chosen terms add.',
      keyword: 'a cube of a series',
      trap: null,
      narration: 'GATE 2016 Set 1 Question 26 asks for the coefficient of x to the twelfth in a cube of a series that starts at x cubed.'
    },
    {
      id: 'pr-2', start: 68, end: 76, scene: 'product',
      caption: 'Each factor chooses a power of at least three, so the question is how many triples of numbers at least three add to twelve.',
      detail: 'This is the product rule of counting wearing algebraic clothes. Choosing a term from each factor is choosing one exponent per factor; the product of three chosen terms contributes x to the sum of the three exponents. So the coefficient of x to the twelfth counts the ordered triples of integers, each at least three, whose sum is twelve. Ordered, because the three factors are distinguishable.',
      keyword: 'how many triples',
      trap: null,
      narration: 'Each factor chooses a power of at least three, so the question is how many triples of numbers at least three add to twelve.'
    },
    {
      id: 'pr-3', start: 76, end: 83, scene: 'product',
      caption: 'There are ten triples: one with all three equal, six with a repeated three, and three with the six in a different place.',
      detail: 'Listing them is a complete argument because the list is exhaustive and the cases are disjoint. The page enumerates all of them in code rather than trusting the arithmetic: three, three, six and its three arrangements; three, four, five and its six arrangements; four, four, four. Three plus six plus one is ten.',
      keyword: 'ten triples',
      trap: null,
      narration: 'There are ten triples: one with all three equal, six with a repeated three, and three with the six in a different place.'
    },
    {
      id: 'pr-4', start: 83, end: 90, scene: 'product',
      caption: 'The series way is faster: take x cubed out of each factor, then read the coefficient of x cubed in one over one minus x, cubed.',
      detail: 'Each factor equals x cubed times one over one minus x. Three factors give x to the ninth times one over one minus x cubed. The coefficient of x to the twelfth is therefore the coefficient of x cubed in one over one minus x cubed, which is three plus three minus one choose two, that is five choose two, which is ten. The official answer is ten, and the two methods agree.',
      keyword: 'five choose two, which is ten',
      trap: null,
      narration: 'The series way is faster: take x cubed out of each factor, then read the coefficient of x cubed in one over one minus x, cubed.'
    },

    /* ---------------- scene 4: denominator ---------------- */
    {
      id: 'de-1', start: 90, end: 98, scene: 'denominator',
      caption: 'Take one over one minus x minus x squared and expand it. The coefficients come out 1, 1, 2, 3, 5, 8.',
      detail: 'Expanding is mechanical: the constant term is one, then each later coefficient is produced by the relation the denominator forces. The page computes this expansion by series division in code, in exact integers, and prints the first terms. They are the Fibonacci numbers starting from a zero equal to one.',
      keyword: '1, 1, 2, 3, 5, 8',
      trap: null,
      narration: 'Take one over one minus x minus x squared and expand it. The coefficients come out 1, 1, 2, 3, 5, 8.'
    },
    {
      id: 'de-2', start: 98, end: 106, scene: 'denominator',
      caption: 'That is the Fibonacci sequence, and the denominator is the recurrence written in a different alphabet.',
      detail: 'The denominator has three coefficients: one, minus one, minus one. Those are exactly the coefficients of the recurrence, in reverse order. A rational generating function is the same information as a linear recurrence with constant coefficients, stored differently. This is why the previous lesson on recurrence relations and this one answer the same questions.',
      keyword: 'the recurrence written in a different alphabet',
      trap: null,
      narration: 'That is the Fibonacci sequence, and the denominator is the recurrence written in a different alphabet.'
    },
    {
      id: 'de-3', start: 106, end: 113, scene: 'denominator',
      caption: 'Multiply both sides by the denominator, then match the coefficient of x to the n on the two sides.',
      detail: 'Starting from G times one minus x minus x squared equals one, the left side is a product of a series and a three-term polynomial. Its coefficient at position n is a sub n minus a sub n minus one minus a sub n minus two. The right side is the constant one, whose coefficients are one at position zero and zero everywhere else. Matching gives the recurrence and the two base cases at once.',
      keyword: 'match the coefficient',
      trap: null,
      narration: 'Multiply both sides by the denominator, then match the coefficient of x to the n on the two sides.'
    },
    {
      id: 'de-4', start: 113, end: 120, scene: 'denominator',
      caption: 'You get a sub n equals a sub n minus one plus a sub n minus two. Every rational generating function hides a recurrence this way.',
      detail: 'The direction works both ways, which is the practical point: given a closed form you can state its recurrence without solving anything, and given a recurrence you can build its closed form by series division or by partial fractions. The page checks the expansion against the iterated Fibonacci numbers term by term, so the identity is verified rather than asserted.',
      keyword: 'hides a recurrence',
      trap: null,
      narration: 'You get a sub n equals a sub n minus one plus a sub n minus two. Every rational generating function hides a recurrence this way.'
    },

    /* ---------------- scene 5: closed ---------------- */
    {
      id: 'cl-1', start: 120, end: 128, scene: 'closed',
      caption: 'GATE 2018 Question 1: the sequence two n plus three. Split it, because a sum of sequences is a sum of generating functions.',
      detail: 'The question asks which option is a closed form for the generating function of the sequence whose term is two n plus three, for every n from zero upward. The sequence is a sum of two simpler sequences, two n and the constant three. A generating function of a sum is the sum of the generating functions, term by term, because the coefficient of each power is the sum of the corresponding coefficients.',
      keyword: 'a sum of sequences is a sum of generating functions',
      trap: null,
      narration: 'GATE 2018 Question 1: the sequence two n plus three. Split it, because a sum of sequences is a sum of generating functions.'
    },
    {
      id: 'cl-2', start: 128, end: 136, scene: 'closed',
      caption: 'Three times all ones is three over one minus x, and two n is two x over one minus x squared. Together, three minus x over one minus x squared.',
      detail: 'The sequence n has generating function x over one minus x squared, so twice it is two x over one minus x squared. Putting the two pieces over the common denominator gives two x plus three times one minus x, all over one minus x squared, which is three minus x over one minus x squared. The official key for the paper is option D, exactly this expression.',
      keyword: 'three minus x over one minus x squared',
      trap: null,
      narration: 'Three times all ones is three over one minus x, and two n is two x over one minus x squared. Together, three minus x over one minus x squared.'
    },
    {
      id: 'cl-3', start: 136, end: 143, scene: 'closed',
      caption: 'GATE 2017 Set 2 Question 47: one plus z over one minus z cubed. Expand it and the coefficients are 1, 4, 9, 16.',
      detail: 'The question gives the ordinary generating function one plus z over one minus z cubed and asks for a three minus a zero. Expanding: one over one minus z cubed has coefficient k plus two choose two at position k, giving 1, 3, 6, 10. Multiplying by one plus z adds each coefficient to the next, giving 1, 4, 9, 16 — the squares. The page computes this expansion directly rather than relying on the pattern.',
      keyword: '1, 4, 9, 16',
      trap: null,
      narration: 'GATE 2017 Set 2 Question 47: one plus z over one minus z cubed. Expand it and the coefficients are 1, 4, 9, 16.'
    },
    {
      id: 'cl-4', start: 143, end: 150, scene: 'closed',
      caption: 'So a three minus a zero is sixteen minus one, which is fifteen. Both questions fall to one table of atoms.',
      detail: 'The published answer key gives fifteen for that question. Note what was not needed: no differential equation, no recurrence, no clever substitution. Two expansions from the atom table and one subtraction. The pattern of squares is a coincidence worth noticing but not worth relying on; the expansion is the argument.',
      keyword: 'fifteen',
      trap: 'Reading a three minus a zero as the coefficient of z cubed alone gives 16, which is not what was asked. Read the question, then extract twice.',
      narration: 'So a three minus a zero is sixteen minus one, which is fifteen. Both questions fall to one table of atoms.'
    },

    /* ---------------- scene 6: parity ---------------- */
    {
      id: 'pa-1', start: 150, end: 158, scene: 'parity',
      caption: 'GATE 2022 Question 26: the term is n plus one at odd positions and one at even positions. Split the sequence in two.',
      detail: 'The sequence runs one, two, one, four, one, six, one, eight and so on. Odd positions carry n plus one, even positions carry one. A generating function of a sum of two sequences is the sum, so the whole problem is the even half plus the odd half, each built on its own set of powers.',
      keyword: 'Split the sequence in two',
      trap: null,
      narration: 'GATE 2022 Question 26: the term is n plus one at odd positions and one at even positions. Split the sequence in two.'
    },
    {
      id: 'pa-2', start: 158, end: 166, scene: 'parity',
      caption: 'The even half is all ones on even powers: one over one minus x squared. The odd half is two, four, six, eight on odd powers.',
      detail: 'The even half is the all-ones atom with x replaced by x squared. The odd half is twice the sequence one, two, three, four sitting on odd powers, which is two x over one minus x squared squared — the derivative atom with x squared substituted and one factor of x restored to make the exponents odd.',
      keyword: 'one over one minus x squared',
      trap: null,
      narration: 'The even half is all ones on even powers: one over one minus x squared. The odd half is two, four, six, eight on odd powers.'
    },
    {
      id: 'pa-3', start: 166, end: 173, scene: 'parity',
      caption: 'The options use one over one minus x, so rewrite the even half as one over one minus x minus x over one minus x squared.',
      detail: 'Every option in the paper is written with one over one minus x as a final term, so an answer in the shape one over one minus x squared will not match any option even though it is correct. The identity one over one minus x squared equals one over one minus x minus x over one minus x squared is checked by putting the right side over the common denominator. Rewriting is not decoration; it is what makes the answer recognisable.',
      keyword: 'rewrite the even half',
      trap: 'Stopping at a correct but differently shaped answer and concluding that no option fits is a real failure mode. The paper printed four options; one of them is your answer in disguise.',
      narration: 'The options use one over one minus x, so rewrite the even half as one over one minus x minus x over one minus x squared.'
    },
    {
      id: 'pa-4', start: 173, end: 180, scene: 'parity',
      caption: 'That gives x plus x cubed over one minus x squared squared, plus one over one minus x: option A.',
      detail: 'Combining two x over one minus x squared squared with minus x over one minus x squared gives x plus x cubed over one minus x squared squared. The official key for the paper is option A. The page also expands the other three options and shows each one failing at a small value of n — the second option at n equal to one, the third at n equal to one, the fourth at n equal to three.',
      keyword: 'option A',
      trap: null,
      narration: 'That gives x plus x cubed over one minus x squared squared, plus one over one minus x: option A.'
    },

    /* ---------------- scene 7: solve ---------------- */
    {
      id: 'so-1', start: 180, end: 188, scene: 'solve',
      caption: 'Now run it backwards. Take a sub n equals five a sub n minus one minus six a sub n minus two, with the first two terms one and two.',
      detail: 'This is the recurrence from GATE CSE 2024 Set 2 Question 15, which the recurrence lesson solves with a characteristic equation. Here it is solved by generating functions instead, so the two methods can be compared on the same example. The answer there was two to the n, and the coefficient of three to the n turned out to be zero.',
      keyword: 'run it backwards',
      trap: null,
      narration: 'Now run it backwards. Take a sub n equals five a sub n minus one minus six a sub n minus two, with the first two terms one and two.'
    },
    {
      id: 'so-2', start: 188, end: 196, scene: 'solve',
      caption: 'Multiply by x to the n and add over every n from two upward. Each shifted sum is the original series times a power of x.',
      detail: 'The sum of a sub n minus one times x to the n, over n from two upward, equals x times the sum of a sub j times x to the j over j from one upward, which is x times G minus a zero. The two-step shift similarly gives x squared times G. This bookkeeping is the only place errors happen, and it is why the two base cases appear explicitly on the right.',
      keyword: 'Multiply by x to the n',
      trap: null,
      narration: 'Multiply by x to the n and add over every n from two upward. Each shifted sum is the original series times a power of x.'
    },
    {
      id: 'so-3', start: 196, end: 203, scene: 'solve',
      caption: 'Collect: G times one minus five x plus six x squared equals one minus three x. The numerator factorises and cancels.',
      detail: 'One minus three x is one minus three x, and the denominator is one minus two x times one minus three x, because two and three multiply to six and add to five. The factor one minus three x appears on both sides, so it cancels. What is left is one over one minus two x.',
      keyword: 'the numerator factorises and cancels',
      trap: 'Do not cancel before checking that the factor is really present. Here it is; in general a numerator that does not factor against the denominator means the recurrence has a forcing term, and partial fractions must be used instead.',
      narration: 'Collect: G times one minus five x plus six x squared equals one minus three x. The numerator factorises and cancels.'
    },
    {
      id: 'so-4', start: 203, end: 210, scene: 'solve',
      caption: 'G is one over one minus two x, so the term is exactly two to the n — and the three-to-the-n part is gone.',
      detail: 'One over one minus two x has coefficient two to the n at every position. So the sequence is one, two, four, eight, sixteen, which matches the two base cases given. The cancellation is the algebraic reason the coefficient of three to the n is zero, the point that cost marks in 2024. The page expands the series and compares it with the iterated recurrence for the first twenty-five terms.',
      keyword: 'exactly two to the n',
      trap: null,
      narration: 'G is one over one minus two x, so the term is exactly two to the n — and the three-to-the-n part is gone.'
    },

    /* ---------------- scene 8: catalan ---------------- */
    {
      id: 'ca-1', start: 210, end: 218, scene: 'catalan',
      caption: 'Count the balanced bracketings of n pairs. Splitting at the outermost pair gives C of x equals one plus x times C of x squared.',
      detail: 'A balanced bracketing of n pairs is a first pair with a balanced sequence inside it and a balanced sequence after it, and the two sizes can be anything that adds to n minus one. Summing over those splits gives the functional equation: the generating function equals one for the empty case, plus x times the generating function squared. This is a self-referential equation, not a recurrence, and it is solved by algebra.',
      keyword: 'Splitting at the outermost pair',
      trap: null,
      narration: 'Count the balanced bracketings of n pairs. Splitting at the outermost pair gives C of x equals one plus x times C of x squared.'
    },
    {
      id: 'ca-2', start: 218, end: 226, scene: 'catalan',
      caption: 'That is a quadratic in C. Solving it gives C equals one plus or minus the square root of one minus four x, all over two x.',
      detail: 'Rearranged, the equation is x times C squared minus C plus one equals zero, a quadratic in the unknown C with coefficients that involve x. The quadratic formula applies exactly as it does for numbers. Two branches come out, differing only in one sign, and both satisfy the equation; only one of them is a generating function.',
      keyword: 'a quadratic in C',
      trap: null,
      narration: 'That is a quadratic in C. Solving it gives C equals one plus or minus the square root of one minus four x, all over two x.'
    },
    {
      id: 'ca-3', start: 226, end: 233, scene: 'catalan',
      caption: 'The plus sign gives one over x plus one plus two x: not a power series at all, because it blows up at zero.',
      detail: 'Expanding the square root and taking the plus branch leaves a term one over x. A generating function is a series in non-negative powers of x, so a term with x in the denominator cannot appear. The page computes both branches from the series expansion of the square root and shows the plus branch starting with a negative power. The rejection is by the definition, not by taste.',
      keyword: 'not a power series at all',
      trap: 'Choosing the branch that looks simpler, or the one whose first few coefficients seem right, is not a justification. The test is whether the expression is a series in non-negative powers of x.',
      narration: 'The plus sign gives one over x plus one plus two x: not a power series at all, because it blows up at zero.'
    },
    {
      id: 'ca-4', start: 233, end: 240, scene: 'catalan',
      caption: 'The minus sign gives 1, 1, 2, 5, 14, 42. The constant term decides the branch, because a zero must equal the first term.',
      detail: 'The Catalan numbers count balanced bracketings, and they also equal the central binomial coefficient divided by n plus one. The page checks both: it expands the minus branch and compares with that formula for the first twenty-five terms, and it verifies the functional equation coefficient by coefficient. The general rule this scene establishes is that a zero, the constant term, is a free piece of information in every branch decision.',
      keyword: '1, 1, 2, 5, 14, 42',
      trap: null,
      narration: 'The minus sign gives 1, 1, 2, 5, 14, 42. The constant term decides the branch, because a zero must equal the first term.'
    },

    /* ---------------- scene 9: egf ---------------- */
    {
      id: 'eg-1', start: 240, end: 248, scene: 'egf',
      caption: 'An ordinary generating function counts without regard to order: the powers of x simply add up sizes.',
      detail: 'In the ordinary form, multiplying two series adds exponents, which corresponds to putting two unordered selections side by side. That is why one over one minus x to the power k counts selections with repetition: the order of the chosen items is not recorded, only how many of each kind. Most GATE questions in this topic are of this kind.',
      keyword: 'without regard to order',
      trap: null,
      narration: 'An ordinary generating function counts without regard to order: the powers of x simply add up sizes.'
    },
    {
      id: 'eg-2', start: 248, end: 256, scene: 'egf',
      caption: 'When order matters the objects are labelled, and the right object divides each term by n factorial.',
      detail: 'The exponential generating function of a sequence is the sum of the term times x to the n over n factorial. The factorial divisor is exactly the over-count that labelling removes: arranging n distinct objects gives n factorial orders, so dividing by n factorial converts an arrangement count into an object count. Multiplying two exponential generating functions then interleaves labels correctly, which is why they are the tool for permutations, derangements and set partitions.',
      keyword: 'divides each term by n factorial',
      trap: null,
      narration: 'When order matters the objects are labelled, and the right object divides each term by n factorial.'
    },
    {
      id: 'eg-3', start: 256, end: 263, scene: 'egf',
      caption: 'The test is clean: n factorial has no useful ordinary generating function, but under the exponential form it is one over one minus x.',
      detail: 'The ordinary series of the factorial sequence has coefficients that grow faster than any geometric series, so it is not rational and has no closed form of the kind this lesson uses. Under the exponential form, each term is n factorial over n factorial, which is one, so the series is the all-ones series, one over one minus x. The same sequence, two alphabets, one of which is useless and one of which is trivial.',
      keyword: 'n factorial',
      trap: null,
      narration: 'The test is clean: n factorial has no useful ordinary generating function, but under the exponential form it is one over one minus x.'
    },
    {
      id: 'eg-4', start: 263, end: 270, scene: 'egf',
      caption: 'So the ordinary form answers how many ways to choose, the exponential form how many ways to arrange.',
      detail: 'A useful rule of thumb: if two selections that differ only in order are the same object, use the ordinary form; if they are different objects, use the exponential form. The published GATE questions on this topic have all used the ordinary form, so the exponential form is taught here for completeness and to prevent the confusion, not because it has been asked.',
      keyword: 'how many ways to choose',
      trap: null,
      narration: 'So the ordinary form answers how many ways to choose, the exponential form how many ways to arrange.'
    },

    /* ---------------- scene 10: procedure ---------------- */
    {
      id: 'pc-1', start: 270, end: 278, scene: 'procedure',
      caption: 'Procedure: name the atoms you have, combine them with the sum and product rules, then extract the coefficient you need.',
      detail: 'First decide whether the sequence is built by adding independent cases or by multiplying independent choices; that decides between summing series and multiplying them. Then match each piece against the atom table. Only then extract. Doing the extraction before the combination is what produces most wrong answers, because the coefficient of a product is not the product of the coefficients.',
      keyword: 'name the atoms',
      trap: null,
      narration: 'Procedure: name the atoms you have, combine them with the sum and product rules, then extract the coefficient you need.'
    },
    {
      id: 'pc-2', start: 278, end: 285, scene: 'procedure',
      caption: 'Trap one: forgetting the shift that x to the k puts on the answer. Trap two: writing n choose k where it should be n plus k minus one choose k.',
      detail: 'A shift of k moves every coefficient, so the coefficient of x to the n in x to the k times G is the coefficient of x to the n minus k in G. And the binomial in one over one minus x to the power k is n plus k minus one choose k minus one, not n choose k; the second is the coefficient in one plus x to the power n, a different object entirely.',
      keyword: 'forgetting the shift',
      trap: null,
      narration: 'Trap one: forgetting the shift that x to the k puts on the answer. Trap two: writing n choose k where it should be n plus k minus one choose k.'
    },
    {
      id: 'pc-3', start: 285, end: 293, scene: 'procedure',
      caption: 'Trap three: substituting x equal to one. Trap four: taking the wrong root, or forgetting that the constant term is a zero.',
      detail: 'Setting x equal to one asks for the sum of the whole sequence, which the formal series does not give you: one over one minus x is not a number at one. And in a quadratic or a branch decision, the constant term is the test — a zero must equal the first term of the sequence, and any branch that violates it is wrong regardless of how its later coefficients look.',
      keyword: 'substituting x equal to one',
      trap: null,
      narration: 'Trap three: substituting x equal to one. Trap four: taking the wrong root, or forgetting that the constant term is a zero.'
    },
    {
      id: 'pc-4', start: 293, end: 300, scene: 'procedure',
      caption: 'Then verify: expand the first four terms of your closed form and compare them with the sequence.',
      detail: 'Expanding is cheap and decisive. Take the closed form you produced, multiply out the first four coefficients by hand or by series division, and compare them with the terms you were given. If they agree, the remaining risk is small; if they disagree, the error is in the algebra you just did and you have found it before losing the mark. Every number in this lesson is checked this way in code.',
      keyword: 'expand the first four terms',
      trap: 'An answer that matches a remembered formula is not verified. The formula you remember is often for the shifted version of the sequence.',
      narration: 'Then verify: expand the first four terms of your closed form and compare them with the sequence.'
    }
  ]
};
