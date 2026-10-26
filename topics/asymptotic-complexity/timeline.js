/* ==========================================================================
   asymptotic-complexity - THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs - never edited by hand.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'cost',
      n: 1,
      title: 'Cost is a function, not a number',
      start: 0, end: 30,
      objective: 'See why a running time is a function of the input size, why the constants lose and the growth wins, and what "n" is counting.'
    },
    {
      id: 'bigo',
      n: 2,
      title: 'Big-O is a bound with two witnesses',
      start: 30, end: 60,
      objective: 'Read the definition as a game against an adversary: one constant c and one starting point n0 that work for every larger n.'
    },
    {
      id: 'omega',
      n: 3,
      title: 'Omega from below, Theta from both sides',
      start: 60, end: 90,
      objective: 'State the lower bound, show that Theta is exactly O and Omega together, and see why a tight bound is the one worth reporting.'
    },
    {
      id: 'little',
      n: 4,
      title: 'Little-o is strict, and the ratio decides',
      start: 90, end: 120,
      objective: 'Separate O from o with one pair, then use the limit of the ratio as the single test that sorts every comparison into three outcomes.'
    },
    {
      id: 'ladder',
      n: 5,
      title: 'The growth ladder',
      start: 120, end: 150,
      objective: 'Place the nine standard functions in one order, see that a logarithm base is only a constant, and see that log(n!) is Theta(n log n).'
    },
    {
      id: 'incomparable',
      n: 6,
      title: 'Not every pair can be compared',
      start: 150, end: 180,
      objective: 'Meet a function that is neither O nor Omega of n, and stop believing that asymptotic order is a total order.'
    },
    {
      id: 'cases',
      n: 7,
      title: 'Best, average and worst are three functions',
      start: 180, end: 210,
      objective: 'Count the three cases of linear search, see that the average needs a distribution, and see why the syllabus names the worst case.'
    },
    {
      id: 'tree',
      n: 8,
      title: 'A recurrence, counted level by level',
      start: 210, end: 240,
      objective: 'Turn a divide-and-conquer algorithm into a recursion tree, add the level costs, and read off the three cases of the master theorem.'
    },
    {
      id: 'space',
      n: 9,
      title: 'Space is the same argument on another quantity',
      start: 240, end: 270,
      objective: 'Separate total space from auxiliary space, count a call stack as depth rather than as calls, and see which algorithms are in place.'
    },
    {
      id: 'decide',
      n: 10,
      title: 'The decision procedure',
      start: 270, end: 300,
      objective: 'Fix the four questions that answer a complexity question in order, and know which trap each question defuses.'
    }
  ],

  events: [
    /* ---------------- scene 1: cost ---------------- */
    {
      id: 'cost-1', start: 0, end: 7.5, scene: 'cost',
      caption: 'A running time is not a number of seconds. It is a function of n, the size of the input.',
      detail: 'Two machines differ by a constant factor and two compilers differ by another. What survives both changes is how the work grows as the input grows, so that is what the notation records.',
      keyword: 'a function of n',
      trap: 'A timing in seconds measures your laptop, not the algorithm. Nothing in the notation is a stopwatch.',
      narration: 'A running time is not a number of seconds. It is a function of the input size n.'
    },
    {
      id: 'cost-2', start: 7.5, end: 15, scene: 'cost',
      caption: 'Here are two algorithms on the same problem: one does about 5n steps, the other about n squared.',
      detail: 'The step count ignores which statement, which compiler and which processor. It counts the dominant operation, and it treats each execution of that operation as one unit of work.',
      keyword: '5n steps against n squared',
      trap: 'The count is of a named basic operation, so two different counts for the same program can both be right. Say what you counted.',
      narration: 'Two algorithms on the same problem: one does about 5n steps, the other about n squared.'
    },
    {
      id: 'cost-3', start: 15, end: 22.5, scene: 'cost',
      caption: 'Below n = 5 the quadratic is the cheaper one. Above n = 5 it is never cheaper again.',
      detail: 'At n = 4 the quadratic costs 16 and the linear one costs 20, so a constant really does win on small inputs. At n = 5 they meet, and from n = 6 the quadratic is ahead for ever and the gap keeps widening.',
      keyword: 'never cheaper again',
      trap: 'A crossover point is not an asymptote. The claim is about all large n, not about the n your test data happened to use.',
      narration: 'Below n equals five the quadratic is cheaper. Above five it is never cheaper again.'
    },
    {
      id: 'cost-4', start: 22.5, end: 30, scene: 'cost',
      caption: 'So the question is never "which is faster" but "which grows slower", and that question has a precise answer.',
      detail: 'This is why the syllabus says asymptotic worst case time and space complexity: the object being compared is a growth rate, and the comparison must be a statement about all sufficiently large inputs.',
      keyword: 'which grows slower',
      trap: 'Asymptotics throws away exactly the information a real deployment needs. Both statements can be true: the quadratic is the right choice for your four items.',
      narration: 'The question is never which is faster, but which grows slower. That question has a precise answer.'
    },

    /* ---------------- scene 2: big-o ---------------- */
    {
      id: 'bigo-1', start: 30, end: 37.5, scene: 'bigo',
      caption: 'Write f(n) for the work your algorithm does. f is O of g when g is eventually an upper bound up to a constant.',
      detail: 'The definition quantifies over a constant c and a starting point n0. Both are yours to choose, and both are allowed to be large. What is not allowed is to change them as n grows.',
      keyword: 'eventually an upper bound up to a constant',
      trap: 'O is not "about". It is a one-sided inequality that must hold from some point onward, with a fixed constant.',
      narration: 'Write f of n for the work your algorithm does. f is O of g when g is eventually an upper bound up to a constant.'
    },
    {
      id: 'bigo-2', start: 37.5, end: 45, scene: 'bigo',
      caption: 'Formally: there is a c greater than zero and an n0 such that for every n at least n0, f(n) is at most c times g(n).',
      detail: 'Read it as a game. The adversary picks n as large as it likes; you must have already fixed c and n0 so that the inequality holds for every one of those n. If no such pair exists, f is not O of g.',
      keyword: 'for every n at least n0',
      trap: 'The "for every n at least n0" is the part that is dropped by mistake. Checking f(n) is at most c g(n) at one large n proves nothing.',
      narration: 'There is a c greater than zero and an n zero such that for every n at least n zero, f of n is at most c times g of n.'
    },
    {
      id: 'bigo-3', start: 45, end: 52.5, scene: 'bigo',
      caption: 'Take f(n) = 3n squared + 5n + 2 and g(n) = n squared. The witness is c = 4, n0 = 6.',
      detail: 'The inequality 3n squared + 5n + 2 is at most 4n squared is the same as n squared - 5n - 2 being at least zero, which first holds at n = 6. The two curves cross once, and after the crossing the bound is never violated.',
      keyword: 'c = 4, n0 = 6',
      trap: 'The witness does not have to be tight or pretty. Any c and n0 that work are a complete proof, and the question never asks for the smallest one.',
      narration: 'With f of n equal to three n squared plus five n plus two, and g of n equal to n squared, the witness is c equals four and n zero equals six.'
    },
    {
      id: 'bigo-4', start: 52.5, end: 60, scene: 'bigo',
      caption: 'The shaded tail is the whole claim: from n0 onward, f never rises above the dashed ceiling.',
      detail: 'Everything to the left of n0 is irrelevant to the definition, which is why constants can be swallowed: they only ever affect small n or shift the ceiling by a factor. Everything to the right is the claim.',
      keyword: 'the shaded tail is the whole claim',
      trap: 'A curve that dips below the ceiling and then rises through it again is not O of that ceiling, however long it stayed under. Crossing back is fatal.',
      narration: 'The shaded tail is the whole claim: from n zero onward, f never rises above the dashed ceiling.'
    },

    /* ---------------- scene 3: omega and theta ---------------- */
    {
      id: 'omega-1', start: 60, end: 67.5, scene: 'omega',
      caption: 'Turn the inequality around and you have Omega: g is eventually a lower bound on f, again up to a constant.',
      detail: 'f is Omega of g exactly when g is O of f. A lower bound is what you need to say an algorithm cannot be made faster, which is a much stronger statement than an upper bound.',
      keyword: 'a lower bound on f',
      trap: 'An upper bound does not exclude a faster algorithm and a lower bound does not exhibit one. Confusing the two is the commonest error in complexity questions.',
      narration: 'Turn the inequality around and you have Omega: g is eventually a lower bound on f, again up to a constant.'
    },
    {
      id: 'omega-2', start: 67.5, end: 75, scene: 'omega',
      caption: 'Theta needs both: f is Theta of g when f is O of g and f is Omega of g.',
      detail: 'That is a sandwich. There are constants c1, c2 and a point n0 with c1 g(n) at most f(n) at most c2 g(n) for every n at least n0. The two bounds differ only by a constant, so they pin the growth rate.',
      keyword: 'Theta needs both',
      trap: 'Theta is not "approximately equal for the n I tested". It is two inequalities with fixed constants, and one of them can fail while the other holds.',
      narration: 'Theta needs both: f is Theta of g when f is O of g and f is Omega of g.'
    },
    {
      id: 'omega-3', start: 75, end: 82.5, scene: 'omega',
      caption: 'So 3n squared + 5n + 2 is Theta of n squared, and also O of n cubed, but it is not Theta of n cubed.',
      detail: 'O is a promise that can be loose. n squared is O of n cubed, and it is not Omega of n cubed, so the pair fails Theta. A tight answer is a Theta answer; a loose one is still true and still scores.',
      keyword: 'O is a promise that can be loose',
      trap: 'Because O is loose, "f is O of n squared" and "f is Theta of n squared" can both be true. An option is not wrong for being loose unless the question asks for the tight bound.',
      narration: 'Three n squared plus five n plus two is Theta of n squared, and also O of n cubed, but it is not Theta of n cubed.'
    },
    {
      id: 'omega-4', start: 82.5, end: 90, scene: 'omega',
      caption: 'Write Theta when you can, and say which quantity you are bounding: time, space, or the number of a named operation.',
      detail: 'The three quantities have separate answers for the same algorithm, and a question that says space is not asking about time. The class of the answer is the same vocabulary applied to a different count.',
      keyword: 'which quantity you are bounding',
      trap: 'Merge sort is Theta(n log n) time and Theta(n) auxiliary space. Quoting the first when the second was asked is a lost mark, not a subtle error.',
      narration: 'Write Theta when you can, and say which quantity you are bounding: time, space, or the number of a named operation.'
    },

    /* ---------------- scene 4: little-o and the ratio ---------------- */
    {
      id: 'little-1', start: 90, end: 97.5, scene: 'little',
      caption: 'Big-O allows a constant factor to be as large as you like. Little-o forbids equality in the limit.',
      detail: 'f is o of g when f is O of g but not Omega of g, which is the same as saying the ratio f over g tends to zero. The bound is then not merely true, it is slack.',
      keyword: 'Little-o forbids equality',
      trap: 'n is O of n and n is not o of n, because the ratio is one, not zero. A question that says little-o is asking about strictness.',
      narration: 'Big-O allows a constant factor to be as large as you like. Little-o forbids equality in the limit.'
    },
    {
      id: 'little-2', start: 97.5, end: 105, scene: 'little',
      caption: 'Take the limit of f(n) over g(n) as n grows. Zero means little-o; a finite positive number means Theta; infinity means little-omega.',
      detail: 'The three outcomes are exhaustive for positive functions with a limit. The test is the fastest way through a comparison question, and it is what the logarithm trick in the next scene is for.',
      keyword: 'the limit of f over g',
      trap: 'The test needs the limit to exist. When the ratio oscillates the limit may not exist at all, and then the definitions, not the test, decide.',
      narration: 'Take the limit of f of n over g of n. Zero means little-o, a finite positive number means Theta, and infinity means little-omega.'
    },
    {
      id: 'little-3', start: 105, end: 112.5, scene: 'little',
      caption: 'The limit is often easiest to read after taking logarithms of both functions, because a product becomes a sum.',
      detail: 'Comparing n to the power log n with n to the power root n is hopeless by eye, but their logarithms are log n squared and root n times log n, and those are easy to order. This is the standard move on GATE function-ordering questions.',
      keyword: 'taking logarithms of both functions',
      trap: 'Taking a logarithm preserves order but destroys the constant factor, so it answers an ordering question and never a question about the exact value.',
      narration: 'The limit is often easiest to read after taking logarithms of both functions, because a product becomes a sum.'
    },
    {
      id: 'little-4', start: 112.5, end: 120, scene: 'little',
      caption: 'And a sample of values is not a proof: n log n over n to the power 1.01 is still rising at n equal to 10 to the 12.',
      detail: 'The ratio log n over n to the 0.01 turns over only once log n exceeds 100, which happens past n equal to 10 to the 43. Any table of values a paper can print would show it still climbing, yet it does tend to zero, so n log n is O of n to the 1.01.',
      keyword: 'a sample of values is not a proof',
      trap: 'Plotting two functions and declaring a winner is the most reliable way to be wrong on a growth question. Prove it, or use the log trick.',
      narration: 'A sample of values is not a proof: n log n over n to the 1.01 is still rising at n equal to ten to the twelve.'
    },

    /* ---------------- scene 5: the ladder ---------------- */
    {
      id: 'ladder-1', start: 120, end: 127.5, scene: 'ladder',
      caption: 'Nine functions cover almost every answer GATE asks for, and they have one fixed order.',
      detail: 'Log log n, log n, root n, n, n log n, n squared, n cubed, 2 to the n, and n factorial. Each is little-o of the next, so the order is strict, and any question that lists functions is asking you to place them on this ladder.',
      keyword: 'one fixed order',
      trap: 'The ladder is about growth, not about value. At n = 2, n squared is 4 and n log n is 2, so a small test case can rank them the other way round.',
      narration: 'Nine functions cover almost every answer GATE asks for, and they have one fixed order.'
    },
    {
      id: 'ladder-2', start: 127.5, end: 135, scene: 'ladder',
      caption: 'Polynomials are ordered by degree, and any power of n loses to any exponential, whatever the constant.',
      detail: 'n to the 10 is O of 2 to the n, and the witness is real: from about n = 59 onward the exponential is ahead for ever. That is why an exponential algorithm is a different category of problem, not a slower polynomial one.',
      keyword: 'any power of n loses to any exponential',
      trap: 'A large exponent looks exponential and is not. n to the 100 is still a polynomial, and it beats 2 to the n for every n you could ever run.',
      narration: 'Polynomials are ordered by degree, and any power of n loses to any exponential, whatever the constant.'
    },
    {
      id: 'ladder-3', start: 135, end: 142.5, scene: 'ladder',
      caption: 'Two things look like they should matter and do not: the base of a logarithm, and a constant multiplier.',
      detail: 'Log base 2 of n is log base 10 of n divided by log base 10 of 2, a factor of about 3.32, so the base is absorbed. Multiplying a function by 100 is absorbed in the same way. What is not absorbed is a factor that grows, such as n, or a logarithm.',
      keyword: 'the base of a logarithm, and a constant multiplier',
      trap: 'Log squared n is not log n. A logarithm is absorbed, a power of a logarithm is not: log n squared is little-o of root n but it is not Theta of log n.',
      narration: 'Two things look like they should matter and do not: the base of a logarithm, and a constant multiplier.'
    },
    {
      id: 'ladder-4', start: 142.5, end: 150, scene: 'ladder',
      caption: 'Log of n factorial sits between half n log n and n log n, so sorting by comparison is Theta(n log n).',
      detail: 'n factorial is at most n to the n, which gives the upper bound. Stirling sharpens it to n log n minus 1.44 n plus a log term, so log of n factorial is n log n up to a lower-order term. That is the information-theoretic floor for sorting by comparisons.',
      keyword: 'sorting by comparison is Theta(n log n)',
      trap: 'n factorial is not 2 to the n. Factorial is bigger than every exponential, which is why a brute-force permutation search is worse than an exponential subset search.',
      narration: 'Log of n factorial sits between half n log n and n log n, so sorting by comparison is Theta of n log n.'
    },

    /* ---------------- scene 6: incomparable ---------------- */
    {
      id: 'incomp-1', start: 150, end: 157.5, scene: 'incomparable',
      caption: 'Here is a function that is neither O nor Omega of n: g(n) is n to the power 1 plus sine of n.',
      detail: 'The exponent is not a constant. Sine of n swings between -1 and 1, so the exponent swings between 0 and 2, and g swings between 1 and n squared as n increases. It is a perfectly ordinary function of n.',
      keyword: '1 plus sine of n',
      trap: 'The exponent is not fixed, so none of the polynomial rules apply. Reading it as n squared, or as n, is the mistake the question is built on.',
      narration: 'Here is a function that is neither O nor Omega of n: g of n is n to the power one plus sine of n.'
    },
    {
      id: 'incomp-2', start: 157.5, end: 165, scene: 'incomparable',
      caption: 'Take the ratio n over g(n). It equals n to the power minus sine of n, which swings both above and below 1.',
      detail: 'When sine of n is close to 1 the ratio is close to 1 over n, which goes to zero. When sine of n is close to -1 the ratio is close to n, which grows without bound. Both happen for arbitrarily large n, because the multiples of 2 pi are spread evenly around the circle.',
      keyword: 'swings both above and below 1',
      trap: 'A ratio that visits both zero and infinity has no limit, so the limit test does not apply. Fall back on the definitions.',
      narration: 'Take the ratio n over g of n. It equals n to the power minus sine of n, which swings both above and below one.'
    },
    {
      id: 'incomp-3', start: 165, end: 172.5, scene: 'incomparable',
      caption: 'So neither n is O of g, nor g is O of n. Two functions need not be comparable at all.',
      detail: 'This is the GATE CSE 2015 Set 3 question, in which both statements fail. It is also the reason a question cannot be answered by ranking the functions on the ladder when one of them is not on the ladder.',
      keyword: 'need not be comparable',
      trap: 'Asymptotic order is a partial order on functions, not a total order. Any statement of the form "one of these must be O of the other" is false in general.',
      narration: 'So neither n is O of g, nor g is O of n. Two functions need not be comparable at all.'
    },
    {
      id: 'incomp-4', start: 172.5, end: 180, scene: 'incomparable',
      caption: 'The same lesson in a friendlier form: f(n squared) is not always Theta of f(n) squared.',
      detail: 'For a polynomial it is. For an exponential it is not: with f(n) = 2 to the n, f(n squared) is 2 to the n squared, while f(n) squared is 2 to the 2n, and the first is far larger. That is the GATE CSE 2022 question, and the polynomial hypothesis is the whole answer.',
      keyword: 'not always Theta of f(n) squared',
      trap: 'The hypothesis in the option is load-bearing. An option that is true for polynomials and false for exponentials is false as stated for all positive functions.',
      narration: 'The same lesson in a friendlier form: f of n squared is not always Theta of f of n squared.'
    },

    /* ---------------- scene 7: best, average, worst ---------------- */
    {
      id: 'cases-1', start: 180, end: 187.5, scene: 'cases',
      caption: 'Linear search looks at the cells one at a time until it finds the key. The count depends on where the key is.',
      detail: 'The algorithm is fixed and the input size is fixed. What varies is the input itself, and each input gives a different number of comparisons. So "the" running time is not one function.',
      keyword: 'depends on where the key is',
      trap: 'Best, average and worst are three different functions of n, not three estimates of one number.',
      narration: 'Linear search looks at the cells one at a time until it finds the key. The count depends on where the key is.'
    },
    {
      id: 'cases-2', start: 187.5, end: 195, scene: 'cases',
      caption: 'Best case: the key is first, so one comparison. Worst case: the key is last, so n comparisons.',
      detail: 'The best case is almost never the interesting one, because it describes an input you cannot rely on. The worst case is the one that can be guaranteed, which is why the syllabus asks for worst case complexity.',
      keyword: 'one comparison against n comparisons',
      trap: 'A best-case bound is not a bound on the algorithm. Saying "linear search is O of 1" because the key might be first is true only of that input.',
      narration: 'Best case: the key is first, so one comparison. Worst case: the key is last, so n comparisons.'
    },
    {
      id: 'cases-3', start: 195, end: 202.5, scene: 'cases',
      caption: 'Average case needs a distribution. Assume the key is equally likely to be in any position, and the average is (n + 1) over 2.',
      detail: 'The sum of the positions is n(n+1)/2, and dividing by n gives (n+1)/2. Without the assumption there is no average: a different distribution gives a different answer, and an adversary can always choose a bad one.',
      keyword: 'average case needs a distribution',
      trap: 'An average case quoted without its distribution is not a claim at all. GATE questions state the distribution or ask only for the worst case.',
      narration: 'Average case needs a distribution. Assume the key is equally likely to be in any position, and the average is n plus one over two.'
    },
    {
      id: 'cases-4', start: 202.5, end: 210, scene: 'cases',
      caption: 'Whatever the distribution, the average lies between the best and the worst. That is the one free fact.',
      detail: 'It is a weighted average of the per-input costs, so it cannot leave the interval they span. The check in this lesson verifies it for two hundred random cost vectors, and it is the reason a question can never have an average above its worst case.',
      keyword: 'the average lies between',
      trap: 'All three are Theta of n here, so the distinction does not change the class. It changes the class when the best and worst differ in order, as in quicksort.',
      narration: 'Whatever the distribution, the average lies between the best and the worst. That is the one free fact.'
    },

    /* ---------------- scene 8: the recursion tree ---------------- */
    {
      id: 'tree-1', start: 210, end: 217.5, scene: 'tree',
      caption: 'A divide-and-conquer algorithm splits the input and pays for the split. That is a recurrence: T(n) = 2T(n/2) + n.',
      detail: 'Two subproblems of half the size, plus n work to divide and combine. Merge sort is exactly this. The recurrence is a cost model, and solving it means finding its growth rate.',
      keyword: 'T(n) = 2T(n/2) + n',
      trap: 'The n term is the work at this level, not the work of the whole algorithm. Dropping it, or counting it once instead of per level, gives the wrong answer.',
      narration: 'A divide-and-conquer algorithm splits the input and pays for the split. That is a recurrence: T of n equals two T of n over two plus n.'
    },
    {
      id: 'tree-2', start: 217.5, end: 225, scene: 'tree',
      caption: 'Draw the calls as a tree. Level zero costs n, level one has two nodes costing n over 2 each, so it also costs n.',
      detail: 'Every level adds up to the same total, because halving the size and doubling the count cancel. This is the equal case, and it is why the answer carries a logarithm: the number of levels is what is left to count.',
      keyword: 'every level adds up to the same total',
      trap: 'The number of nodes doubles per level and the work per node halves, so neither alone gives the level cost. Multiply them.',
      narration: 'Draw the calls as a tree. Level zero costs n, level one has two nodes costing n over two each, so it also costs n.'
    },
    {
      id: 'tree-3', start: 225, end: 232.5, scene: 'tree',
      caption: 'There are log base 2 of n plus one levels, each costing n, so the total is n log n. That is the whole solution, with no theorem needed.',
      detail: 'For n equal to 8 there are four levels of cost 8 each, giving 32, which is 8 times log base 2 of 8 plus 1. The tree method is exact here because every level costs the same; the leaf level is counted too, and it is what turns the sum into n log n plus n.',
      keyword: 'the total is n log n',
      trap: 'Counting levels as log n is right only for a halving split. A split into thirds gives log base 3, which differs by a constant and is still Theta of log n.',
      narration: 'There are log base two of n plus one levels, each costing n, so the total is n log n.'
    },
    {
      id: 'tree-4', start: 232.5, end: 240, scene: 'tree',
      caption: 'The three cases compare the root cost with the leaf count. Whichever is bigger wins; when they tie, the logarithm appears.',
      detail: 'With a subproblems of size n over b, the leaves number a to the power log base b of n, which is n to the power log base b of a. If the root term n to the k is bigger, the answer is n to the k. If the leaves are bigger, the answer is the leaf count. If they tie, multiply by log n.',
      keyword: 'whichever is bigger wins',
      trap: 'The theorem has a gap: when the root term is neither polynomially smaller nor polynomially larger, all three cases fail. T(n) = 2T(n/2) + n/log n is in the gap and is Theta(n log log n).',
      narration: 'The three cases compare the root cost with the leaf count. Whichever is bigger wins; when they tie, the logarithm appears.'
    },

    /* ---------------- scene 9: space ---------------- */
    {
      id: 'space-1', start: 240, end: 247.5, scene: 'space',
      caption: 'Space complexity counts memory cells as a function of n, and the input usually does not count.',
      detail: 'Total space includes the input; auxiliary space is what the algorithm adds on top. The syllabus means auxiliary unless it says otherwise, because the input has to be there either way.',
      keyword: 'the input usually does not count',
      trap: 'An algorithm that copies the input has Theta(n) auxiliary space even though its total space is also Theta(n). Saying "in place" about it is wrong.',
      narration: 'Space complexity counts memory cells as a function of n, and the input usually does not count.'
    },
    {
      id: 'space-2', start: 247.5, end: 255, scene: 'space',
      caption: 'A recursive algorithm pays for its stack. Merge sort runs to depth log n, so its stack is log n frames, not n.',
      detail: 'The number of calls is 2n - 1, but they are not all live at once. The stack holds one frame per level of the tree, so what matters is the depth. That is why the stack is log n while the temporary array is n.',
      keyword: 'one frame per level, not one per call',
      trap: 'Counting all the calls as stack frames overestimates the stack by a factor of n. Depth is the measure.',
      narration: 'A recursive algorithm pays for its stack. Merge sort runs to depth log n, so its stack is log n frames, not n.'
    },
    {
      id: 'space-3', start: 255, end: 262.5, scene: 'space',
      caption: 'Merge sort needs an n-cell temporary array, so its auxiliary space is n. Heapsort needs a constant number of cells.',
      detail: 'Both are Theta(n log n) in time and they differ only in space, which is exactly the kind of pair a question offers as options. Heapsort rearranges inside the array it was given, so its auxiliary space is constant.',
      keyword: 'differ only in space',
      trap: 'In place does not mean no memory at all. Heapsort uses a few index variables, which is Theta(1) and still counts as in place.',
      narration: 'Merge sort needs an n-cell temporary array, so its auxiliary space is n. Heapsort needs a constant number of cells.'
    },
    {
      id: 'space-4', start: 262.5, end: 270, scene: 'space',
      caption: 'So a space answer has three parts: what is counted, whether the input is included, and the depth rather than the call count.',
      detail: 'Say all three when you answer, because a question that specifies none of them is deciding which convention it wants by the options it offers. Reading the options tells you which convention is in force.',
      keyword: 'what is counted',
      trap: 'The same algorithm can be Theta(n) or Theta(1) in auxiliary space depending on whether the output array counts. State your convention.',
      narration: 'A space answer has three parts: what is counted, whether the input is included, and the depth rather than the call count.'
    },

    /* ---------------- scene 10: the decision procedure ---------------- */
    {
      id: 'decide-1', start: 270, end: 277.5, scene: 'decide',
      caption: 'Four questions answer almost every complexity item. First: is the question about a bound from above, from below, or both?',
      detail: 'Big-O, Omega and Theta are three different claims and an option can be true under one and false under another. Reading which symbol is in the option is the first move, before any algebra.',
      keyword: 'from above, from below, or both',
      trap: 'A true loose bound is a true option. Do not reject "O of n cubed" for n squared just because a tighter bound exists, unless the question asks for tight.',
      narration: 'Four questions answer almost every complexity item. First: is the question about a bound from above, from below, or both?'
    },
    {
      id: 'decide-2', start: 277.5, end: 285, scene: 'decide',
      caption: 'Second: is every exponent constant? If not, the polynomial rules and the ladder do not apply.',
      detail: 'An exponent like 1 plus sine of n, or a base that varies with n, takes the function off the ladder. Then only the definitions and the ratio can decide, and often the answer is that neither bound holds.',
      keyword: 'is every exponent constant',
      trap: 'This is the single most common reason a confident ordering answer is wrong: one of the functions was never on the ladder.',
      narration: 'Second: is every exponent constant? If not, the polynomial rules and the ladder do not apply.'
    },
    {
      id: 'decide-3', start: 285, end: 292.5, scene: 'decide',
      caption: 'Third: which quantity, time or space, and whose? The algorithm, the input size, or the depth of the recursion.',
      detail: 'A question that says space wants a memory count, and a question about a recursive algorithm wants the depth for its stack. Naming the quantity before counting prevents the commonest mismatch.',
      keyword: 'which quantity, and whose',
      trap: 'Worst-case time and worst-case space are separate answers. So are the time of one operation and the time of n of them.',
      narration: 'Third: which quantity, time or space, and whose? The algorithm, the input size, or the depth of the recursion.'
    },
    {
      id: 'decide-4', start: 292.5, end: 300, scene: 'decide',
      caption: 'Fourth: does the question name an assumption? A distribution, a sorted array, a heap. The answer changes when it does.',
      detail: 'An average case without a distribution, or a bound that assumed a balanced tree, is conditional. Re-read the stem for the condition before choosing, and if the condition is missing, the safe answer is the worst case.',
      keyword: 'does the question name an assumption',
      trap: 'Options often differ only in which assumption they rely on. The right answer is the one whose assumption the stem actually gives.',
      narration: 'Fourth: does the question name an assumption? A distribution, a sorted array, a heap. The answer changes when it does.'
    }
  ]
};
