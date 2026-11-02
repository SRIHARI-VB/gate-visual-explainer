/* ==========================================================================
   comparison-lower-bound-decision-trees - THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs - never edited by hand.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 330,

  scenes: [
    { id: 'wall',   n: 1,  title: 'One floor under every comparison sort', objective: 'see that three different sorting algorithms at n = 8 spend 17, 28 and 28 comparisons while one number, 16, sits underneath all of them', start: 0,   end: 30  },
    { id: 'model',  n: 2,  title: 'A comparison is a fork in the road', objective: 'turn an algorithm into a decision tree: one comparison per internal node, two exits, one run per root-to-leaf path', start: 30,  end: 60  },
    { id: 'leaves', n: 3,  title: 'Every leaf is one input order', objective: 'see that a correct algorithm needs a separate leaf for each of the n! orders, and that the n = 3 tree uses 6 of its 8 slots', start: 60,  end: 90  },
    { id: 'height', n: 4,  title: 'Leaves cap the height', objective: 'derive h >= ceil(log2 n!) from the fact that a binary tree of height h has at most 2 to the h leaves', start: 90,  end: 120 },
    { id: 'table',  n: 5,  title: 'The exact table, n = 1 to 12', objective: 'read the computed table of n!, the smallest power of two that covers it, and the ceiling that follows', start: 120, end: 150 },
    { id: 'why',    n: 6,  title: 'Why the ceiling, and why not base three', objective: 'see why rounding down is impossible, and why the third outcome of a comparison cannot be used for distinct keys', start: 150, end: 180 },
    { id: 'stirling', n: 7, title: 'From an exact integer to Theta of n log n', objective: 'apply Stirling to log2(n!) and read off the leading term n log2 n minus 1.4427 n, hence Theta(n log n)', start: 180, end: 210 },
    { id: 'tight',  n: 8,  title: 'The bound is achieved, until n = 12', objective: 'compare the bound with the proven minimum for each n and see the first failure, then the irregular ones after it', start: 210, end: 240 },
    { id: 'escape', n: 9,  title: 'Where the bound does not apply', objective: 'see counting sort and radix sort make no comparisons at all, so no decision tree exists and the floor is not a floor for them', start: 240, end: 270 },
    { id: 'avg',    n: 10, title: 'The average case is bounded too', objective: 'see that any binary tree with L leaves has average depth at least log2 L, so the same counting bounds the average', start: 270, end: 300 },
    { id: 'proc',   n: 11, title: 'The procedure, in five steps', objective: 'consolidate the model, the counting, the ceiling and the tightness into a procedure that answers any question in this topic', start: 300, end: 330 }
  ],

  events: [
    /* ---- 1. the wall -------------------------------------------------------- */
    { id: 'w1', scene: 'wall', start: 0, end: 7.5,
      caption: 'Sort eight items and count the comparisons: merge sort spends 17, insertion sort 28 in the worst case, selection sort 28.',
      narration: 'Take eight distinct items and count how many comparisons each algorithm makes. Merge sort spends at most seventeen. Insertion sort and selection sort each spend twenty eight when the input is against them.',
      detail: 'These are worst-case counts for n = 8, computed on this page by running each algorithm on every one of the 40,320 orders. They are algorithm counts, not estimates.',
      keyword: 'count the comparisons' },

    { id: 'w2', scene: 'wall', start: 7.5, end: 15,
      caption: 'Sixteen sits under all three. Not because the algorithms share code, but because the problem itself forbids fewer.',
      narration: 'Under all three numbers sits sixteen. That is not because the three algorithms share code or share an idea. It is a statement about the problem: no comparison based method can do better, whatever it is written like.',
      detail: 'A lower bound is a claim about every algorithm that solves the problem, not about one of them. That is what makes it stronger, and what makes it harder to prove.',
      keyword: 'the problem itself forbids fewer',
      trap: 'A question that asks for the minimum number of comparisons is asking about the problem, not about the algorithm you happen to know.' },

    { id: 'w3', scene: 'wall', start: 15, end: 22.5,
      caption: 'The count that matters is orders, not items: eight items have 8! = 40,320 possible input orders.',
      narration: 'The quantity that matters is not the number of items but the number of possible input orders. Eight items can arrive in eight factorial orders, which is forty thousand three hundred and twenty.',
      detail: 'n! is read as n factorial: the product 1 times 2 times 3 up to n. It counts the orderings of n distinct things, and it grows faster than any power of two.',
      keyword: '8! = 40,320 possible input orders' },

    { id: 'w4', scene: 'wall', start: 22.5, end: 30,
      caption: 'Each comparison answers one yes-or-no question, so it can at most double the number of orders an algorithm has told apart.',
      narration: 'Each comparison answers one question with two possible answers. So each comparison can at most double the number of input orders an algorithm has managed to tell apart. Doubling from one, sixteen comparisons distinguish sixty five thousand five hundred and thirty six orders, and fifteen distinguish only thirty two thousand seven hundred and sixty eight, which is fewer than we need.',
      detail: 'That doubling argument is the whole proof, and the next three scenes make it precise by drawing the algorithm as a tree.',
      keyword: 'double the number of orders' },

    /* ---- 2. the decision tree model ---------------------------------------- */
    { id: 'm1', scene: 'model', start: 30, end: 37.5,
      caption: 'Draw the algorithm as a tree. Each internal node is one comparison; the two arrows out of it are the two possible answers.',
      narration: 'Here is the whole idea. Draw the algorithm as a tree. Every internal node is one comparison of two items. The two arrows leaving it are the two possible answers: the first item is smaller, or the second is.',
      detail: 'The tree is a picture of the algorithm, not of the input. Every comparison based algorithm has one, whatever language it is written in.',
      keyword: 'Each internal node is one comparison' },

    { id: 'm2', scene: 'model', start: 37.5, end: 45,
      caption: 'Follow one path from the root to a leaf and you have run the algorithm once: those comparisons, in that order, on one input.',
      narration: 'Follow one path from the top to a leaf and you have run the algorithm once. Those are the comparisons it made, in that order, on one particular input.',
      detail: 'The highlighted path on the drawing is one run. Its length, counted in comparisons, is the number of comparisons that run cost.',
      keyword: 'you have run the algorithm once' },

    { id: 'm3', scene: 'model', start: 45, end: 52.5,
      caption: 'For three items the whole tree has five comparison nodes and six leaves. Every leaf prints one sorted order, and no leaf is reached by two inputs.',
      narration: 'For three items the whole tree is six leaves and a height of three. Each leaf prints one sorted order, and no two different input orders finish at the same leaf, because then the algorithm could not tell them apart.',
      detail: 'A correct algorithm may have several leaves printing the same sorted list only if those inputs are genuinely indistinguishable, which for distinct items never happens.',
      keyword: 'six leaves' },

    { id: 'm4', scene: 'model', start: 52.5, end: 60,
      caption: 'So the tree is a binary tree, its leaves are the orders it can distinguish, and the worst case is its height.',
      narration: 'So the algorithm is a binary tree, its leaves are the orders it can tell apart, and its worst case number of comparisons is exactly the height of the tree. Now the question becomes a question about trees.',
      detail: 'This translation is the step to remember: worst case comparisons of an algorithm equals height of its decision tree. Everything after this is counting on binary trees.',
      keyword: 'the worst case is its height' },

    /* ---- 3. leaves are permutations ---------------------------------------- */
    { id: 'l1', scene: 'leaves', start: 60, end: 67.5,
      caption: 'A correct algorithm must be able to output any of the n! orders. So it needs at least n! leaves, one per order.',
      narration: 'A correct algorithm must be able to output any of the possible orders, because any of them can be the sorted answer. So it needs at least as many leaves as there are orders: one leaf for each.',
      detail: 'For distinct items the sorted answer identifies the input order completely, so the leaves must be at least n! in number. That is the counting step.',
      keyword: 'at least n! leaves' },

    { id: 'l2', scene: 'leaves', start: 67.5, end: 75,
      caption: 'For three items that is six leaves. The tree of height three has eight slots at the bottom, so two slots go unused.',
      narration: 'For three items that is six leaves. A tree of height three has eight slots at its bottom level, so two slots go unused. Slack is allowed; shortage is not.',
      detail: 'Six is not a power of two, so no tree can be exactly full. The unused slots are why the bound is a ceiling rather than an exact count.',
      keyword: 'two slots go unused' },

    { id: 'l3', scene: 'leaves', start: 75, end: 82.5,
      caption: 'For four items it is 24 leaves against 16 slots at height four, so height four is already impossible before any algorithm is written.',
      narration: 'For four items the requirement is twenty four leaves, and a tree of height four offers only sixteen slots. So height four is impossible before a single line of any algorithm is written.',
      detail: 'Sixteen is 2 to the 4, twenty four is 4 factorial. The comparison 16 < 24 is the entire refutation, and it is checked on the page.',
      keyword: 'height four is already impossible' },

    { id: 'l4', scene: 'leaves', start: 82.5, end: 90,
      caption: 'This is why the argument is called information theoretic: it counts outcomes, and never looks inside the algorithm.',
      narration: 'This is why the argument is called information theoretic. It counts outcomes and never looks inside the algorithm, so it applies to algorithms nobody has invented yet.',
      detail: 'The price is that it can only ever be a lower bound: counting outcomes says what is necessary, not what is achievable.',
      keyword: 'information theoretic' },

    /* ---- 4. leaves cap the height ------------------------------------------ */
    { id: 'h1', scene: 'height', start: 90, end: 97.5,
      caption: 'A binary tree of height h has at most 2 to the h leaves: one at the root, doubling at every level down.',
      narration: 'A binary tree of height h has at most two to the h leaves. One node at the top, at most two below it, at most four below those, doubling at every level.',
      detail: 'This is checked on the page by enumerating every shape of binary tree up to height five and counting the leaves at the widest level.',
      keyword: 'at most 2 to the h leaves' },

    { id: 'h2', scene: 'height', start: 97.5, end: 105,
      caption: 'Combine the two facts: n! leaves are needed, and 2 to the h is all a height h tree can hold. So 2 to the h is at least n!.',
      narration: 'Now put the two facts together. The tree needs at least n factorial leaves, and a tree of height h can hold at most two to the h. So two to the h is at least n factorial.',
      detail: 'Both halves are necessary. The leaf count comes from correctness; the doubling comes from the tree being binary. Neither alone gives a bound.',
      keyword: '2 to the h is at least n!' },

    { id: 'h3', scene: 'height', start: 105, end: 112.5,
      caption: 'Take logs and round up: the height is at least the ceiling of log base two of n factorial. That is the lower bound.',
      narration: 'Take logarithms base two of both sides, and remember that a height is a whole number. The height is at least the ceiling of log base two of n factorial. That is the lower bound, and it is exact arithmetic, not an approximation.',
      detail: 'Ceiling means round up to the next whole number. Since a height of 6.9 comparisons is not available, seven is the smallest usable answer.',
      keyword: 'the ceiling of log base two of n factorial' },

    { id: 'h4', scene: 'height', start: 112.5, end: 120,
      caption: 'For five items: 2 to the 6 is 64, still short of 120, and 2 to the 7 is 128, so seven comparisons are necessary.',
      narration: 'For five items, the requirement is one hundred and twenty leaves. Two to the six is sixty four, which is short. Two to the seven is one hundred and twenty eight, which covers it. So seven comparisons are necessary, and six are not enough.',
      detail: 'This is the 1991 paper item, and it is the arithmetic to be able to do in your head: find the smallest power of two at least as large as n factorial.',
      keyword: 'seven comparisons are necessary' },

    /* ---- 5. the table ------------------------------------------------------ */
    { id: 't1', scene: 'table', start: 120, end: 127.5,
      caption: 'Here is the computed table. The fourth column is the answer to the exam question: the least height that can hold n! leaves.',
      narration: 'Here is the table, computed on this page rather than quoted. The last column is the answer to the exam question: the smallest height that can hold n factorial leaves.',
      detail: 'Every entry is computed with whole-number arithmetic, so no rounding error can creep in. The ceiling is found by searching for the smallest h with two to the h at least n factorial.',
      keyword: 'the computed table' },

    { id: 't2', scene: 'table', start: 127.5, end: 135,
      caption: 'n = 3 gives 3, n = 4 gives 5, n = 5 gives 7, n = 8 gives 16, and n = 12 gives 29. Those five are worth memorising.',
      narration: 'Three items give three comparisons, four give five, five give seven, eight give sixteen, and twelve give twenty nine. Those five values are worth remembering, because they are the ones that turn up.',
      detail: 'Note how fast the numbers grow: doubling the items adds about two comparisons per item, not one. That is the shape of n log n.',
      keyword: 'n = 8 gives 16' },

    { id: 't3', scene: 'table', start: 135, end: 142.5,
      caption: 'n = 1 needs no comparison, and n = 2 needs one. The formula has to give those too, which it does.',
      narration: 'One item is already sorted and needs no comparison. Two items need one, because one comparison decides their order. The formula has to give both of those, and it does.',
      detail: 'A bound that failed at n = 1 would be suspect. These are the two cases an examiner can check by hand, so they belong in the table.',
      keyword: 'n = 1 needs no comparison' },

    { id: 't4', scene: 'table', start: 142.5, end: 150,
      caption: 'The gap between n! and the power of two above it is the slack. It is why the answer is a ceiling and never a round number.',
      narration: 'The distance between n factorial and the next power of two is slack. It is the room the algorithm does not have to use, and it is why the answer is a ceiling rather than an exact logarithm.',
      detail: 'At n = 5 the logarithm is 6.9, so the ceiling is 7 and the slack is 128 minus 120, which is eight unused slots.',
      keyword: 'the slack' },

    /* ---- 6. why the ceiling ------------------------------------------------ */
    { id: 'y1', scene: 'why', start: 150, end: 157.5,
      caption: 'Rounding down is not a rounding error, it is an impossibility: for five items, six comparisons hold only 64 of the 120 orders.',
      narration: 'Rounding down is not a small error, it is an impossibility. For five items six comparisons hold only sixty four orders, and there are one hundred and twenty. Forty of them would be indistinguishable.',
      detail: 'If two different orders end at the same leaf, the algorithm prints one answer for both, so one of them comes out wrong. That is the definition of incorrect.',
      keyword: 'Rounding down is not a rounding error',
      trap: 'Writing floor(log2 n!) instead of the ceiling is the most common single mark lost on this topic.' },

    { id: 'y2', scene: 'why', start: 157.5, end: 165,
      caption: 'A comparison of two distinct items has three outcomes, but only two of them can happen, so the tree stays binary.',
      narration: 'A comparison has three outcomes when the items may be equal: smaller, larger, equal. But for distinct items the third can never happen, so a correct algorithm cannot rely on it, and the tree stays binary.',
      detail: 'If the algorithm branches on equality anyway, that branch is never taken on a distinct input, so it adds no leaves and cannot reduce the height.',
      keyword: 'only two of them can happen' },

    { id: 'y3', scene: 'why', start: 165, end: 172.5,
      caption: 'That is why the base is two and not three. Using log base three would give about 4.36 for five items, which is far too optimistic.',
      narration: 'That is why the base is two and not three. Using log base three would suggest about four and a third comparisons for five items, which is far below the seven that are actually needed.',
      detail: 'The base three bound is true only for problems whose tests really have three outcomes, such as three-way comparisons against a fixed value.',
      keyword: 'the base is two and not three',
      trap: 'An option with log base 3 is always wrong for comparison sorting of distinct keys.' },

    { id: 'y4', scene: 'why', start: 172.5, end: 180,
      caption: 'One more reason the count is a whole number: a height counts comparisons, and half a comparison does not exist.',
      narration: 'One more reason the answer is a whole number. A height counts comparisons, and an algorithm cannot make half a comparison, so between two whole heights only the larger is usable.',
      detail: 'This is the same reason a binary search on 1000 items takes ten probes and not nine point nine seven.',
      keyword: 'half a comparison does not exist' },

    /* ---- 7. stirling ------------------------------------------------------- */
    { id: 's1', scene: 'stirling', start: 180, end: 187.5,
      caption: 'For large n, Stirling replaces n! by an expression: log base two of n! is about n log n minus 1.4427 n plus a half log n.',
      narration: 'For large n, Stirling replaces the factorial by an expression. In base two, log of n factorial is about n log n, minus one point four four two seven n, plus half of log n, plus a term that vanishes.',
      detail: 'The constant 1.4427 is one over the natural logarithm of two: it converts the natural logarithm of Stirling into base two.',
      keyword: 'Stirling replaces n!' },

    { id: 's2', scene: 'stirling', start: 187.5, end: 195,
      caption: 'The leading term is n log base two n. The rest is lower order, so the bound is Theta of n log n, not merely Omega.',
      narration: 'The leading term is n log base two n, and everything else is smaller. So the lower bound is theta of n log n: it grows exactly like n log n, up to a constant factor.',
      detail: 'Omega says at least this fast. Theta says exactly this fast, and needs an algorithm matching it, which merge sort supplies.',
      keyword: 'Theta of n log n' },

    { id: 's3', scene: 'stirling', start: 195, end: 202.5,
      caption: 'Merge sort needs n ceiling of log n, minus the next power of two, plus one: 17 at n = 8, against a floor of 16.',
      narration: 'Merge sort needs n times the ceiling of log n, minus the next power of two above n, plus one. At eight items that is seventeen, against a floor of sixteen. The two agree up to a constant, which is exactly what theta claims.',
      detail: 'The page checks that closed form against a simulated merge sort on every order up to eight items, so the formula is not taken on trust.',
      keyword: 'against a floor of 16' },

    { id: 's4', scene: 'stirling', start: 202.5, end: 210,
      caption: 'That is the whole asymptotic story: a floor of n log n, an algorithm that meets it, and a constant that never matters.',
      narration: 'That is the whole asymptotic story. A floor of n log n, an algorithm that meets it, and a constant factor that no asymptotic question will ever ask about.',
      detail: 'The next scene is about the exact integers, where the constant and the slack are the whole question.',
      keyword: 'the whole asymptotic story' },

    /* ---- 8. tightness ------------------------------------------------------ */
    { id: 'g1', scene: 'tight', start: 210, end: 217.5,
      caption: 'The bound is a floor, not a promise. Up to n = 11 an algorithm reaches it exactly: 3, 5, 7, 10, 13, 16, 19, 22, 26.',
      narration: 'The bound is a floor and not a promise. Up to eleven items an algorithm reaches it exactly: three, five, seven, ten, thirteen, sixteen, nineteen, twenty two and twenty six comparisons.',
      detail: 'The algorithm is merge insertion, also called Ford and Johnson: pair the items, sort the winners, then insert the losers in a fixed order by binary search.',
      keyword: 'reaches it exactly' },

    { id: 'g2', scene: 'tight', start: 217.5, end: 225,
      caption: 'At n = 12 the ceiling is 29 and the proven minimum is 30. One comparison of slack the counting cannot see.',
      narration: 'At twelve items the ceiling is twenty nine, and the proven minimum is thirty. The counting says twenty nine must be possible, and it is not. One comparison of slack that the argument cannot see.',
      detail: 'The minimum for twelve was settled by exhaustive search by Wells in 1965 and later confirmed; it is recorded in the integer sequence OEIS A036604.',
      keyword: 'the proven minimum is 30',
      trap: 'If a question asks for the minimum comparisons for n = 12, the correct answer is 30, not 29. The bound is not the answer there.' },

    { id: 'g3', scene: 'tight', start: 225, end: 232.5,
      caption: 'The gap is not monotone: it is one from 12 to 19, then zero at 20 and 21, then one again at 22.',
      narration: 'The gap is not monotone. It is one from twelve to nineteen, then zero at twenty and twenty one, then one again at twenty two. That irregularity is why nobody has a formula for the exact minimum.',
      detail: 'Each exact value past twelve took a serious search: 13 and 14 in 2002 and 2004, 16 to 18 in 2024. This is a research problem, not a textbook formula.',
      keyword: 'The gap is not monotone' },

    { id: 'g4', scene: 'tight', start: 232.5, end: 240,
      caption: 'For the exam: use the ceiling for the bound, and only claim a minimum where the paper says it is achievable.',
      narration: 'So for the exam, use the ceiling to state the bound, and only claim that number is achievable when the paper asks for it and the value is one of the settled ones.',
      detail: 'Every value quoted here is recomputed on the page from whole-number arithmetic, and the recorded minima are checked against the bound rather than copied into a drawing.',
      keyword: 'use the ceiling for the bound' },

    /* ---- 9. the escape route ----------------------------------------------- */
    { id: 'e1', scene: 'escape', start: 240, end: 247.5,
      caption: 'The bound counts comparisons. Counting sort compares nothing: it reads each key as an index and tallies it.',
      narration: 'The bound counts comparisons, and only comparisons. Counting sort compares nothing at all: it reads each key as an index into a tally and increments that slot.',
      detail: 'With keys in a known range of size k, counting sort takes time proportional to n plus k, and makes exactly zero comparisons. Both facts are checked on the page.',
      keyword: 'compares nothing' },

    { id: 'e2', scene: 'escape', start: 247.5, end: 255,
      caption: 'No comparisons means no decision tree, so the counting argument has nothing to count. The floor does not apply.',
      narration: 'No comparisons means no decision tree, so the counting argument has nothing to count. The floor simply does not apply to a method that never looks at two items together.',
      detail: 'This is not a loophole. Counting sort buys its speed with an assumption the comparison model does not make: the keys are small integers, and their range is known in advance.',
      keyword: 'no decision tree' },

    { id: 'e3', scene: 'escape', start: 255, end: 262.5,
      caption: 'Radix sort makes no comparisons either: it sorts digit by digit, so its cost depends on the number of digits.',
      narration: 'Radix sort makes no comparisons either. It sorts digit by digit from the least significant, so its cost depends on the number of digits rather than on the order of the input.',
      detail: 'Its cost is proportional to the digits times n plus the base, which is linear only while the key range stays polynomial in n.',
      keyword: 'sorts digit by digit' },

    { id: 'e4', scene: 'escape', start: 262.5, end: 270,
      caption: 'So the floor is real and conditional: it binds every method that learns only by comparing, and nothing else.',
      narration: 'So the floor is real, and conditional. It binds every method that learns about the input only by comparing two items, and it says nothing at all about methods that do something else.',
      detail: 'Every comparison based lower bound in the syllabus has this shape: a model, a counting argument inside it, and an algorithm that meets it.',
      keyword: 'real and conditional' },

    /* ---- 10. the average case ---------------------------------------------- */
    { id: 'a1', scene: 'avg', start: 270, end: 277.5,
      caption: 'The same tree bounds the average: with L leaves, the average depth is at least log base two of L.',
      narration: 'The same tree bounds the average case. If the leaves are equally likely, the average depth is at least log base two of the number of leaves, because the balanced tree is the one with the smallest average.',
      detail: 'For 24 leaves that is at least 4.585, so no comparison sort averages four and a half comparisons on four items.',
      keyword: 'average depth is at least log base two of L' },

    { id: 'a2', scene: 'avg', start: 277.5, end: 285,
      caption: 'A lopsided tree pays for its shallow leaves with very deep ones. The average is what forbids that trade.',
      narration: 'A lopsided tree can have one very short path, but it pays with very long ones. The average is what forbids the trade, and it is why a bad pivot in quicksort hurts every input rather than a few.',
      detail: 'The page builds one balanced and one skewed tree and computes both averages, so the inequality is a measurement and not a slogan.',
      keyword: 'A lopsided tree pays' },

    { id: 'a3', scene: 'avg', start: 285, end: 292.5,
      caption: 'Substituting n! gives an average floor of log base two of n!, the same n log n as the worst case.',
      narration: 'Substituting n factorial for the number of leaves gives an average floor of log base two of n factorial, which is the same n log n as the worst case, with a smaller constant.',
      detail: 'So the difference between average and worst case for comparison sorting is a constant, not an order. Quicksort and merge sort both sit at n log n on average.',
      keyword: 'the same n log n' },

    { id: 'a4', scene: 'avg', start: 292.5, end: 300,
      caption: 'But the best case is not bounded: insertion sort finishes a sorted array in n minus 1 comparisons, well under the floor.',
      narration: 'The best case, though, is not bounded at all. Insertion sort finishes an already sorted array in n minus one comparisons, which is far below the floor. The floor is about the worst case and about the average, never about the best.',
      detail: 'At eight items the best case is seven comparisons and the floor is sixteen. A lower bound on the worst case cannot be used as a lower bound on the best case.',
      keyword: 'the best case is not bounded',
      trap: 'Reading the floor as "no algorithm can ever sort in fewer" is the trap. It is a worst-case and average-case statement.' },

    /* ---- 11. procedure ----------------------------------------------------- */
    { id: 'p1', scene: 'proc', start: 300, end: 307.5,
      caption: 'Step one: decide what is being counted. Comparisons in the worst case, in the average case, or on one input?',
      narration: 'Step one is to decide what is being counted. Comparisons in the worst case, comparisons on average, or the comparisons one named algorithm makes on one named input. The three have different answers.',
      detail: 'The floor answers the first two. A named algorithm on a named input is a different exercise: run it and count.',
      keyword: 'decide what is being counted' },

    { id: 'p2', scene: 'proc', start: 307.5, end: 315,
      caption: 'Step two: write 2 to the h is at least n!, then find the smallest power of two that covers n factorial.',
      narration: 'Step two is the arithmetic. Write two to the h is at least n factorial, then find the smallest power of two that covers n factorial. Doubling from one is the fastest way to do it by hand.',
      detail: 'For n = 5, doubling gives 1, 2, 4, 8, 16, 32, 64, 128: seven doublings, so seven comparisons.',
      keyword: 'smallest power of two' },

    { id: 'p3', scene: 'proc', start: 315, end: 322.5,
      caption: 'Step three: say whether the number is a floor or an achievable minimum. They differ from n = 12 onward.',
      narration: 'Step three is to say what the number is. A floor, or an achievable minimum. They agree up to eleven items and differ from twelve onward, so the wording of the question decides which one it wants.',
      detail: 'If the question asks for the minimum and gives a small n, both readings usually give the same answer. At twelve they do not, and that is the one case worth remembering.',
      keyword: 'a floor or an achievable minimum' },

    { id: 'p4', scene: 'proc', start: 322.5, end: 330,
      caption: 'Step four: name the model. Comparisons only, so a non-comparison sort is outside the bound. Step five: check the base is two.',
      narration: 'Step four is to name the model: comparisons only, so a counting sort is outside the bound. Step five is to check the base is two and not three. Those five steps answer every question in this topic.',
      detail: 'The three errors that cost marks are rounding down, using base three, and quoting the floor as an achievable minimum. Each has its own scene and its own refutation on the Misconceptions tab.',
      keyword: 'name the model' }
  ]
};
