/* ==========================================================================
   best-average-worst-and-amortised-analysis — THE timeline.
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
      id: 'claims', n: 1,
      title: 'Three functions, not three estimates',
      start: 0, end: 30,
      objective: 'Separate best, average and worst into three functions of n, see them drawn from one algorithm, and settle the one relation between the average and the worst that always holds.'
    },
    {
      id: 'adversary', n: 2,
      title: 'The worst case is an adversary, and it needs two bounds',
      start: 30, end: 60,
      objective: 'Read the worst case as the answer to a game against an adversary who sees the algorithm, and see why "worst case is Theta of n" is an upper and a lower bound at once.'
    },
    {
      id: 'distribution', n: 3,
      title: 'An average is a weighted average, so it needs weights',
      start: 60, end: 90,
      objective: 'Compute the average cost of linear search as a function of the probability that the key is present, and watch the average move while the best and the worst stay put.'
    },
    {
      id: 'histogram', n: 4,
      title: 'All 40,320 orderings of eight keys: 13, 16.92 and 28',
      start: 90, end: 120,
      objective: 'Enumerate every input of a quicksort, plot the comparison count of each, and read the three cases off one distribution — then check the closed form against the enumeration.'
    },
    {
      id: 'sequence', n: 5,
      title: 'Amortised analysis is about a sequence, and no probability enters',
      start: 120, end: 150,
      objective: 'Contrast a single expensive operation with the cost of the whole sequence, using a stack with MULTIPOP, and name the aggregate method.'
    },
    {
      id: 'doubling', n: 6,
      title: 'Doubling a table: one insertion costs 513, and 1,024 cost 2,047',
      start: 150, end: 180,
      objective: 'Trace the cost of growing a table by doubling, find the amortised cost of an insertion, and see why a fixed increment destroys the bound.'
    },
    {
      id: 'methods', n: 7,
      title: 'Two ways to prove it: the bank balance and the potential',
      start: 180, end: 210,
      objective: 'Run the accounting method and the potential method on the same table, see both produce a charge of at most three, and state the condition a potential must satisfy.'
    },
    {
      id: 'space', n: 8,
      title: 'Time and space are separate claims',
      start: 210, end: 240,
      objective: 'Cover the space half of "worst case time and space complexity": auxiliary space against recursion depth, and why an in-place sort still has a worst-case space cost.'
    },
    {
      id: 'randomised', n: 9,
      title: 'Expected is neither average nor amortised',
      start: 240, end: 270,
      objective: 'Place the three quantities side by side — worst case over inputs, average over a distribution, amortised over a sequence, expected over the algorithm\'s own coins — and see what randomisation does and does not remove.'
    },
    {
      id: 'procedure', n: 10,
      title: 'The procedure, and the four traps',
      start: 270, end: 300,
      objective: 'Reduce the topic to four questions asked in order, and name the four traps that decide the mark.'
    }
  ],

  events: [

    /* ---------- scene 1: claims ---------- */
    { id: 's1-1', scene: 'claims', start: 0, end: 7.5,
      caption: 'Three questions about one algorithm: what is the cheapest run, the typical run, and the dearest run?',
      detail: 'An algorithm is not a number. Ask "how long does insertion sort take" and the honest answer is a function of n and of which input you hand it. Best, average and worst are three functions answering three different questions, and a table of three numbers hides the n they were measured at.',
      narration: 'Three questions about one algorithm. What is the cheapest run, the typical run, and the dearest run?',
      keyword: 'cheapest, typical, dearest' },

    { id: 's1-2', scene: 'claims', start: 7.5, end: 15,
      caption: 'Insertion sort on n keys: best n minus one, average n times n minus one over four plus n minus H of n, worst n times n minus one over two.',
      detail: 'The best input is already sorted, so each key is compared once and never moves: n minus one comparisons. The worst input is reversed, so every key travels past every earlier key: n times n minus one over two. The average needs a distribution — over all orderings equally likely, the expected number of inversions is n times n minus one over four. Comparisons are one per inversion, plus one that ends each inner loop, except when the element has reached the front and the loop ends on the index: there are n minus one loops and H of n minus one of them end on the index. So the average is n(n-1)/4 + n - H(n). The page checks that formula by brute force over all 720 orderings of six keys, where it gives 11.05.',
      narration: 'Insertion sort on n keys. Best is n minus one comparisons. Average is n times n minus one over four, plus n minus H of n. Worst is n times n minus one over two.',
      keyword: 'n times n minus one over four, plus n minus H of n' },

    { id: 's1-3', scene: 'claims', start: 15, end: 22.5,
      caption: 'The average always lies between the best and the worst, whatever the distribution is. That much is free.',
      detail: 'Every input costs at least the cheapest input and at most the dearest one, so a weighted average of those costs also lies between them. That inequality holds with no assumption at all. What it does not give you is the value: the average can sit anywhere in the interval depending on the weights.',
      narration: 'The average always lies between the best and the worst, whatever the distribution is. That much is free.',
      keyword: 'between the best and the worst' },

    { id: 's1-4', scene: 'claims', start: 22.5, end: 30,
      caption: 'GATE 2012 asked which relation always holds between the average and the worst. The answer was: the average is O of the worst.',
      detail: 'Write W(n) for the worst case and A(n) for the average. Since every input costs at most W(n), the average of those costs is at most W(n), so A(n) is O of W(n) with constant one and n0 equal to one. The other three options fail: A is not Omega of W because quicksort averages n log n and its worst case is n squared; A is not Theta of W for the same reason; and A is not little-o of W because insertion sort has average and worst both quadratic, so they are the same order.',
      narration: 'GATE twenty twelve asked which relation always holds between the average and the worst. The answer was: the average is big O of the worst.',
      keyword: 'the average is O of the worst' },

    /* ---------- scene 2: adversary ---------- */
    { id: 's2-1', scene: 'adversary', start: 30, end: 37.5,
      caption: 'Linear search over ten slots: one comparison if the key is first, ten if it is last, ten if it is absent.',
      detail: 'The algorithm is fixed and the cost varies by a factor of ten across inputs of the same size. That is the whole reason three cases exist: size alone does not determine cost, so a complexity claim has to say which inputs it is talking about.',
      narration: 'Linear search over ten slots. One comparison if the key is first, ten if it is last, ten if it is absent.',
      keyword: 'one comparison if the key is first' },

    { id: 's2-2', scene: 'adversary', start: 37.5, end: 45,
      caption: 'The worst case is a game: an adversary picks the input after reading your algorithm.',
      detail: 'The worst-case cost is the maximum of the cost over all inputs of size n. Reading it as a game keeps the quantifiers straight: for every algorithm, there exists an input of size n on which the cost is at least that maximum. The adversary knows your code but not your coin flips, which is why randomisation changes the answer.',
      narration: 'The worst case is a game. An adversary picks the input after reading your algorithm.',
      keyword: 'an adversary picks the input' },

    { id: 's2-3', scene: 'adversary', start: 45, end: 52.5,
      caption: 'Saying the worst case is Theta of n is two claims: never more than c times n, and sometimes at least c prime times n.',
      detail: 'The upper half is what a loop count usually gives you: ten slots, at most ten comparisons. The lower half needs a witness input — here the absent key, which forces all ten — and it is the half that candidates forget. A bound with only the upper half is O, and O of n is also satisfied by a program that costs one comparison on every input.',
      narration: 'Saying the worst case is Theta of n is two claims. Never more than c times n, and sometimes at least c prime times n.',
      keyword: 'two claims' },

    { id: 's2-4', scene: 'adversary', start: 52.5, end: 60,
      caption: 'GATE 2024 Set 1 asked this of a single-pass sortedness check, and the answer was both O of N and Omega of N.',
      detail: 'The check stops at the first out-of-order pair, so many inputs are cheap. But an input that is entirely sorted never stops early, so the worst case performs all N minus one comparisons: an upper bound of O of N and a lower bound of Omega of N, which together say Theta of N. The distractor to avoid is "O of N but not Omega of N", which confuses the best case with the worst.',
      narration: 'GATE twenty twenty four set one asked this of a single pass sortedness check, and the answer was both O of N and Omega of N.',
      keyword: 'both O of N and Omega of N',
      trap: 'An early exit does not lower the worst case. The input where nothing triggers the exit is still an input of size N, and the worst case is a maximum over all of them.' },

    /* ---------- scene 3: distribution ---------- */
    { id: 's3-1', scene: 'distribution', start: 60, end: 67.5,
      caption: 'An average is a weighted average over inputs, so it is not a number until the weights are named.',
      detail: '"The average case of linear search is n over two" is an incomplete sentence. It is true when the key is present and equally likely to be in any of the n positions; with a different probability of presence the same algorithm has a different average. The average is a property of the algorithm together with an input distribution.',
      narration: 'An average is a weighted average over inputs, so it is not a number until the weights are named.',
      keyword: 'not a number until the weights are named' },

    { id: 's3-2', scene: 'distribution', start: 67.5, end: 75,
      caption: 'Key present with probability p at a uniform position: the average is p times n plus one over two, plus one minus p times n.',
      detail: 'With probability p the key is present, and then it is found at position i with probability one over n, costing i comparisons, so the conditional average is n plus one over two. With probability one minus p it is absent and costs all n. Adding the two weighted terms gives the average for that distribution.',
      narration: 'Key present with probability p at a uniform position. The average is p times n plus one over two, plus one minus p times n.',
      keyword: 'p times n plus one over two' },

    { id: 's3-3', scene: 'distribution', start: 75, end: 82.5,
      caption: 'At ten slots: p equal to one gives 5.5, p equal to a half gives 7.75, and p equal to 0.2 gives 9.1.',
      detail: 'Three distributions, one algorithm, three averages. A question that says "assume the key is equally likely to be anywhere" is naming the first distribution; a question that says nothing is asking you to notice that it has not been named.',
      narration: 'At ten slots. P equal to one gives five point five. P equal to a half gives seven point seven five. P equal to zero point two gives nine point one.',
      keyword: '5.5, 7.75 and 9.1' },

    { id: 's3-4', scene: 'distribution', start: 82.5, end: 90,
      caption: 'The best and the worst never moved. Only the distribution moved, and it carried the average most of the way to the worst.',
      detail: 'Best stays at one and worst stays at ten for every choice of p. The average is not a fact about the algorithm alone, and it is not a compromise between the two extremes: it is computed from the weights. This is why "average case" and "worst case" are not interchangeable even when both are asymptotically n.',
      narration: 'The best and the worst never moved. Only the distribution moved, and it carried the average most of the way to the worst.',
      keyword: 'only the distribution moved' },

    /* ---------- scene 4: histogram ---------- */
    { id: 's4-1', scene: 'histogram', start: 90, end: 97.5,
      caption: 'Run first-element quicksort on all 40,320 orderings of eight keys and count the comparisons of each run.',
      detail: 'Eight distinct keys have 8 factorial, which is 40,320 orderings. Each ordering is one input, so enumerating them all gives the exact cost of every input of size eight. This is a finite experiment, not a sample: the numbers below are the truth for size eight, and the closed forms are checked against them.',
      narration: 'Run first element quicksort on all forty thousand three hundred and twenty orderings of eight keys, and count the comparisons of each run.',
      keyword: '40,320 orderings' },

    { id: 's4-2', scene: 'histogram', start: 97.5, end: 105,
      caption: 'The cheapest ordering costs 13 comparisons, the dearest 28, and the mean over all orderings is 16.92.',
      detail: 'The three cases are now three readings of one distribution: the leftmost bar is the best case, the rightmost bar is the worst case, and the mean of the whole distribution is the average case. The worst case is reached by the sorted and reverse-sorted orderings, 128 of the 40,320, which is the familiar n times n minus one over two with n equal to eight.',
      narration: 'The cheapest ordering costs thirteen comparisons, the dearest twenty eight, and the mean over all orderings is sixteen point nine two.',
      keyword: '13, 28 and 16.92' },

    { id: 's4-3', scene: 'histogram', start: 105, end: 112.5,
      caption: 'The closed form two times n plus one times H of n, minus four n, gives 16.9214 — the same number the enumeration produced.',
      detail: 'H of n is the n-th harmonic number, the sum of one over k for k from one to n. For n equal to eight it is about 2.7179, and the formula gives 18 times 2.7179 minus 32, which is 16.9214. The enumeration and the closed form agreeing to four decimal places is the check that both are right; the page computes both and compares them rather than trusting either alone.',
      narration: 'The closed form, two times n plus one times H of n minus four n, gives sixteen point nine two one four. The same number the enumeration produced.',
      keyword: 'the same number' },

    { id: 's4-4', scene: 'histogram', start: 112.5, end: 120,
      caption: 'The mean is not the middle. The median is 16 and the midpoint of the range is 20.5, but only the mean is the average case.',
      detail: 'A mean, a median and a midrange are three different summaries of the same distribution, and the average case is the mean. The distribution is not symmetric — it has a long right tail of expensive orderings — which is exactly why the mean sits above the median. GATE has asked for the average case as a mean, never as a median, so the distinction is worth keeping straight.',
      narration: 'The mean is not the middle. The median is sixteen and the midpoint of the range is twenty point five, but only the mean is the average case.',
      keyword: 'the mean is not the middle',
      trap: 'The average case is an average over inputs, not over the algorithm\'s own random choices. A random pivot makes a different quantity, the expected cost, and the two are computed differently.' },

    /* ---------- scene 5: sequence ---------- */
    { id: 's5-1', scene: 'sequence', start: 120, end: 127.5,
      caption: 'Amortised analysis asks a different question: what does a whole sequence of operations cost?',
      detail: 'The three cases describe one run on one input. Amortised analysis describes a run of many operations on one data structure and asks what the total costs, divided by the number of operations. It exists because some operations are occasionally expensive and mostly cheap, and analysing each operation separately at its worst gives a bound that is far too pessimistic.',
      narration: 'Amortised analysis asks a different question. What does a whole sequence of operations cost?',
      keyword: 'a whole sequence of operations' },

    { id: 's5-2', scene: 'sequence', start: 127.5, end: 135,
      caption: 'A stack with MULTIPOP: one call can pop every item, so a single operation costs Theta of n.',
      detail: 'PUSH and POP cost one each. MULTIPOP of k pops k items, or all of them if the stack is shorter, so its cost is the smaller of k and the stack size. With n items on the stack one call costs n, and a naive worst-case-per-operation analysis then says n operations cost n squared.',
      narration: 'A stack with MULTIPOP. One call can pop every item, so a single operation costs Theta of n.',
      keyword: 'one call can pop every item' },

    { id: 's5-3', scene: 'sequence', start: 135, end: 142.5,
      caption: 'But each item is pushed once and popped once, so 102 operations cost 200 units in total.',
      detail: 'That is the aggregate argument, and it is one sentence long: the number of pops over the whole sequence is at most the number of pushes, so the total cost of any sequence of n operations is at most 2n. One hundred pushes and two MULTIPOPs that empty the stack cost 200 units, an amortised cost just under two per operation, while the dearest single operation still cost fifty.',
      narration: 'But each item is pushed once and popped once, so one hundred and two operations cost two hundred units in total.',
      keyword: '200 units in total' },

    { id: 's5-4', scene: 'sequence', start: 142.5, end: 150,
      caption: 'No probability was used. The aggregate method bounds the total, then divides by the number of operations.',
      detail: 'The aggregate method is the plainest of the three: find an upper bound T(n) on the total cost of any sequence of n operations, then report T(n) over n as the amortised cost. It gives one number for every operation in the sequence, which is its weakness; the accounting and potential methods can charge different operations different amounts.',
      narration: 'No probability was used. The aggregate method bounds the total, then divides by the number of operations.',
      keyword: 'no probability was used',
      trap: 'Amortised is not average. Nothing in the argument is random, and the bound holds for every sequence, including the one an adversary designed to be expensive.' },

    /* ---------- scene 6: doubling ---------- */
    { id: 's6-1', scene: 'doubling', start: 150, end: 157.5,
      caption: 'A table that doubles when full: the first ten insertions cost 1, 2, 3, 1, 5, 1, 1, 1, 9 and 1.',
      detail: 'An insertion that finds room costs one: the write itself. An insertion that finds the table full also copies everything already there, so its cost is one plus the current item count. The table grows 0, 1, 2, 4, 4, 8, 8, 8, 8, 16, which is why the expensive insertions are the second, third, fifth and ninth.',
      narration: 'A table that doubles when full. The first ten insertions cost one, two, three, one, five, one, one, one, nine and one.',
      keyword: '1, 2, 3, 1, 5, 1, 1, 1, 9, 1' },

    { id: 's6-2', scene: 'doubling', start: 157.5, end: 165,
      caption: 'The 513th insertion copies 512 items, so one operation is Theta of n while the amortised cost is under two.',
      detail: 'The expensive insertions are the ones where the previous count was a power of two, and their cost is that count plus one. So the maximum single cost over 1,024 insertions is 513, at the 513th. The distribution of costs is wildly uneven, which is exactly the situation amortised analysis was invented for.',
      narration: 'The five hundred and thirteenth insertion copies five hundred and twelve items, so one operation is Theta of n while the amortised cost is under two.',
      keyword: 'one operation is Theta of n' },

    { id: 's6-3', scene: 'doubling', start: 165, end: 172.5,
      caption: '1,024 insertions cost 2,047 units in total, so the amortised cost per insertion is just under 2.',
      detail: 'The total is n plus the sum of the copy costs, and the copy costs form a geometric series 1, 2, 4, 8 and so on up to 512, whose sum is 1,023. So the total is 1,024 plus 1,023, which is 2n minus 1. The textbook bound of 3n is safe but loose; the true amortised cost here is 2 minus one over n.',
      narration: 'One thousand and twenty four insertions cost two thousand and forty seven units in total, so the amortised cost per insertion is just under two.',
      keyword: '2n minus 1' },

    { id: 's6-4', scene: 'doubling', start: 172.5, end: 180,
      caption: 'Growth must be geometric. Growing by a fixed ten instead makes the cost per insertion rise without bound.',
      detail: 'If the table grows by ten cells each time, the copies are small but frequent: about one insertion in ten pays for the whole table, so the cost per insertion grows linearly with n. Measured: total over n operations divided by n is 5.5 at n equal to 100, 10.5 at 200, 20.5 at 400 and 40.5 at 800. Doubling keeps that ratio under 2 for every n. The multiplier, not the copying, is what buys the constant bound.',
      narration: 'Growth must be geometric. Growing by a fixed ten instead makes the cost per insertion rise without bound.',
      keyword: 'growth must be geometric' },

    /* ---------- scene 7: methods ---------- */
    { id: 's7-1', scene: 'methods', start: 180, end: 187.5,
      caption: 'Accounting method: charge every insertion three units and keep the surplus in a bank.',
      detail: 'The charge is fictitious. One unit pays for the insertion itself, and two go into a bank attached to the data structure. When a doubling happens, the bank pays for moving the items: each item that has been sitting there has one unit saved, and each item inserted since the last doubling has two.',
      narration: 'Accounting method. Charge every insertion three units and keep the surplus in a bank.',
      keyword: 'three units and keep the surplus' },

    { id: 's7-2', scene: 'methods', start: 187.5, end: 195,
      caption: 'The balance never goes negative, and the sum of the charges is an upper bound on the sum of the true costs.',
      detail: 'That inequality is the only thing the method needs to prove. If the bank is never negative, then the total charged is at least the total spent, for every prefix of the sequence. The page runs the sequence and reports the minimum balance, which is zero: the charge of three is exactly tight, and two would not do.',
      narration: 'The balance never goes negative, and the sum of the charges is an upper bound on the sum of the true costs.',
      keyword: 'never goes negative' },

    { id: 's7-3', scene: 'methods', start: 195, end: 202.5,
      caption: 'Potential method: define a potential that is zero at the start and never negative, then charge the cost plus the change in potential.',
      detail: 'The potential is the bank balance treated as a property of the whole structure rather than as credit on individual items. The amortised cost of operation i is its true cost c sub i plus the potential after minus the potential before. The total of those telescopes to the total true cost plus the final potential minus the initial one, which is at least the total true cost whenever the potential never drops below its starting value.',
      narration: 'Potential method. Define a potential that is zero at the start and never negative, then charge the cost plus the change in potential.',
      keyword: 'the cost plus the change in potential' },

    { id: 's7-4', scene: 'methods', start: 202.5, end: 210,
      caption: 'With potential two times items minus size, every insertion is charged at most three — the same answer by another route.',
      detail: 'Right after a doubling the potential is zero, because the item count is half the size. As the table fills, the potential rises to the item count, and that stored amount is exactly what the next doubling costs. The page evaluates the potential after every insertion, confirms it is never negative, and confirms the maximum amortised charge is three.',
      narration: 'With potential two times items minus size, every insertion is charged at most three. The same answer by another route.',
      keyword: 'at most three',
      trap: 'A potential that can go negative proves nothing. The telescoping argument needs the final potential to be at least the initial one, so a potential that dips below zero can hide an unbounded true cost.' },

    /* ---------- scene 8: space ---------- */
    { id: 's8-1', scene: 'space', start: 210, end: 217.5,
      caption: 'The syllabus says worst-case time and space. They are two answers, and GATE asks for them separately.',
      detail: 'Section 5 of the GATE 2027 CS syllabus reads "Asymptotic worst case time and space complexity". A question about space is not answered by the time bound and vice versa. Space means the extra memory beyond the input, unless the question says total memory, and the recursion stack counts.',
      narration: 'The syllabus says worst case time and space. They are two answers, and GATE asks for them separately.',
      keyword: 'two answers' },

    { id: 's8-2', scene: 'space', start: 217.5, end: 225,
      caption: 'Merge sort needs n extra cells and a stack of depth log n; quicksort needs no extra array but still has a stack.',
      detail: 'Merge sort allocates a temporary array of n cells to merge into, so its auxiliary space is n, and its recursion depth is log base two of n, which is 10 for n equal to 1,024. Quicksort partitions in place, so it allocates no array, but every recursive call holds a frame.',
      narration: 'Merge sort needs n extra cells and a stack of depth log n. Quicksort needs no extra array but still has a stack.',
      keyword: 'n extra cells' },

    { id: 's8-3', scene: 'space', start: 225, end: 232.5,
      caption: 'That stack is the space cost: depth 8 on eight sorted keys with a first-element pivot, and depth 4 when the splits balance.',
      detail: 'With the first element as pivot, a sorted input splits into zero and n minus one every time, so the recursion goes n deep and the stack holds n frames. A perfectly balanced split halves the problem each time, so the depth is log base two of n plus one, which is 4 for n equal to 8. The page measures both depths by running the algorithm rather than quoting them.',
      narration: 'That stack is the space cost. Depth eight on eight sorted keys with a first element pivot, and depth four when the splits balance.',
      keyword: 'depth 8 against depth 4' },

    { id: 's8-4', scene: 'space', start: 232.5, end: 240,
      caption: 'So quicksort is in place in the array sense and still Theta of n in the worst case in the stack sense.',
      detail: 'In place usually means O of log n extra space, or O of one for the array itself, and the two usages are worth separating in an answer. The safe sentence names the quantity: no auxiliary array, and a recursion stack of O of log n expected and O of n in the worst case. A heap sort is the algorithm with O of one auxiliary space and O of n log n time.',
      narration: 'So quicksort is in place in the array sense, and still Theta of n in the worst case in the stack sense.',
      keyword: 'in the stack sense' },

    /* ---------- scene 9: randomised ---------- */
    { id: 's9-1', scene: 'randomised', start: 240, end: 247.5,
      caption: 'Randomised quicksort chooses its pivot by coin, so no input can be built to force the bad split.',
      detail: 'Deterministic quicksort with a first-element pivot has an input that defeats it: the sorted array. Choosing the pivot uniformly at random removes that: for any fixed input, the coins decide the splits, so no input is reliably bad. The adversary can still pick the input, but it can no longer predict the pivots.',
      narration: 'Randomised quicksort chooses its pivot by coin, so no input can be built to force the bad split.',
      keyword: 'no input can be built' },

    { id: 's9-2', scene: 'randomised', start: 247.5, end: 255,
      caption: 'The worst case is still n squared, and GATE 2001 asked exactly that: O of n squared.',
      detail: 'Randomisation changes the probability of the bad case, not its existence. There is a run of coin flips that picks the smallest or largest remaining key every time, and on that run the cost is n squared. The expected cost is n log n, and the worst case over all coin sequences is still n squared — which is the answer the 2001 paper wanted.',
      narration: 'The worst case is still n squared, and GATE two thousand and one asked exactly that. O of n squared.',
      keyword: 'still n squared' },

    { id: 's9-3', scene: 'randomised', start: 255, end: 262.5,
      caption: 'Expected is a probability-weighted cost over the coins; amortised is a worst-case bound over a sequence.',
      detail: 'Four quantities, four questions. Worst case: the maximum over inputs, no probability. Average case: the mean over a stated input distribution. Expected: the mean over the algorithm\'s own random choices, for a fixed input. Amortised: the total over a sequence divided by its length, with no probability anywhere. Confusing any two of them is the commonest error in this topic.',
      narration: 'Expected is a probability weighted cost over the coins. Amortised is a worst case bound over a sequence.',
      keyword: 'four quantities, four questions' },

    { id: 's9-4', scene: 'randomised', start: 262.5, end: 270,
      caption: 'The chance of hitting the all-bad run falls fast: 0.0032 at eight keys and 1.6 times ten to the minus nine at sixteen.',
      detail: 'The probability that a random pivot sequence produces the worst case is two to the n minus one over n factorial. At eight keys that is 0.00317; at sixteen it is 1.57 times ten to the minus nine. That is why the expected cost is what gets quoted, and why quoting it as a guarantee is wrong: a guarantee is a worst-case statement.',
      narration: 'The chance of hitting the all bad run falls fast. Zero point zero zero three two at eight keys, and one point six times ten to the minus nine at sixteen.',
      keyword: '0.0032 at eight keys' },

    /* ---------- scene 10: procedure ---------- */
    { id: 's10-1', scene: 'procedure', start: 270, end: 277.5,
      caption: 'First name the quantity: worst case, average case, amortised over a sequence, or expected over coins.',
      detail: 'Every question in this topic is answered by one of those four, and the wording of the question names which. "Worst case" is a maximum over inputs. "Average" needs a distribution. "Amortised" needs a sequence. "Expected" needs a random source. Writing the quantity down before computing is most of the work.',
      narration: 'First name the quantity. Worst case, average case, amortised over a sequence, or expected over coins.',
      keyword: 'name the quantity' },

    { id: 's10-2', scene: 'procedure', start: 277.5, end: 285,
      caption: 'If average, demand the distribution; if amortised, name the sequence and check that growth is geometric.',
      detail: 'An average quoted without weights is not a claim. An amortised bound quoted without the sequence is not a claim either, and the geometric-growth condition is what makes a doubling table constant: a fixed increment gives a linear amortised cost, and a question that changes the increment is testing exactly that.',
      narration: 'If average, demand the distribution. If amortised, name the sequence and check that growth is geometric.',
      keyword: 'demand the distribution' },

    { id: 's10-3', scene: 'procedure', start: 285, end: 292.5,
      caption: 'Then check the bound: O is an upper bound, Omega a lower bound, and a worst case usually deserves Theta.',
      detail: 'A worst-case bound with only an upper half is an O, and O of n is satisfied by an algorithm that costs one comparison. If the question asks for the complexity of an algorithm, the intended answer is almost always a tight bound, which means both halves must be argued — the upper by counting the loop, the lower by exhibiting an input that forces it.',
      narration: 'Then check the bound. O is an upper bound, Omega a lower bound, and a worst case usually deserves Theta.',
      keyword: 'usually deserves Theta' },

    { id: 's10-4', scene: 'procedure', start: 292.5, end: 300,
      caption: 'The four traps: average is not amortised, O is not the worst case, one cheap operation proves nothing, and space is separate.',
      detail: 'Average is over inputs, amortised is over a sequence, expected is over coins. O of g is an upper bound and says nothing about tightness. A sequence whose every operation is cheap on average may still contain an operation that is expensive, so an amortised bound is not a per-operation guarantee. And the space answer is its own answer, with the recursion stack counted.',
      narration: 'The four traps. Average is not amortised. O is not the worst case. One cheap operation proves nothing. And space is separate.',
      keyword: 'the four traps',
      trap: 'A fifth trap hides in the wording: "the worst case is O of n squared" and "the worst case is Theta of n squared" are different claims, and only the second rules out a tighter bound.' }
  ]
};
