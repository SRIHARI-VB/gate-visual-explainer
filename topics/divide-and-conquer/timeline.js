/* ==========================================================================
   divide-and-conquer — THE timeline.
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
      id: 'ask',
      n: 1,
      title: 'What Section 5 asks for',
      start: 0, end: 30,
      objective: 'See that divide-and-conquer is a named design technique with three steps, and that two numbers — how many parts, and how much smaller each part is — decide the recurrence.'
    },
    {
      id: 'split',
      n: 2,
      title: 'Merge sort: the recursion tree of eight elements',
      start: 30, end: 60,
      objective: 'Count the levels, the leaves and the merges of a divide-and-conquer sort, and see that each level does one n of work.'
    },
    {
      id: 'merge',
      n: 3,
      title: 'What one merge costs',
      start: 60, end: 90,
      objective: 'Bound a merge between min(m,n) and m+n-1 comparisons, and get the exact worst case for eight elements by enumeration and by the closed form.'
    },
    {
      id: 'recur',
      n: 4,
      title: 'From the tree to the recurrence',
      start: 90, end: 120,
      objective: 'Read T(n) = aT(n/b) + f(n) off the tree: log_b n levels, n^(log_b a) leaves, and the work at each level.'
    },
    {
      id: 'cases',
      n: 5,
      title: 'The three cases, computed',
      start: 120, end: 150,
      objective: 'Choose between leaves, levels and root by comparing f(n) with n^(log_b a), and check each case against an exact count at n = 256.'
    },
    {
      id: 'quick',
      n: 6,
      title: 'Quicksort: the same shape, a different split',
      start: 150, end: 180,
      objective: 'Count quicksort comparisons exactly: n-1 per partition, n(n-1)/2 worst, and 2(n+1)H_n - 4n average, confirmed by enumerating every ordering.'
    },
    {
      id: 'decrease',
      n: 7,
      title: 'Decrease and conquer',
      start: 180, end: 210,
      objective: 'Separate one subproblem from many: binary search takes floor(lg n) + 1 comparisons, and that is why it is log n and not n log n.'
    },
    {
      id: 'karat',
      n: 8,
      title: 'Karatsuba: fewer subproblems, a smaller exponent',
      start: 210, end: 240,
      objective: 'See 3^k scalar products replace 4^k, and the exponent fall from 2 to log2 3 = 1.585, with the crossover computed rather than assumed.'
    },
    {
      id: 'pyq',
      n: 9,
      title: 'Four past papers, reproduced',
      start: 240, end: 270,
      objective: 'Reproduce the answers to GATE CSE 2019 Q25, 2015 Set 1, 2014 Set 2 and 2021 Set 2 from this page\'s own computations.'
    },
    {
      id: 'proc',
      n: 10,
      title: 'The procedure and the five traps',
      start: 270, end: 300,
      objective: 'Fix the order of decisions — write the recurrence, count levels and leaves, compare with n^(log_b a), check the split, check the base case.'
    }
  ],

  events: [
    /* ---------- scene 1: ask ---------- */
    {
      id: 'a-1', scene: 'ask', start: 0, end: 8,
      caption: 'Section 5 of the GATE 2027 syllabus names divide-and-conquer as one of three design techniques.',
      detail: 'The sentence is: "Algorithm design techniques: greedy, dynamic programming and divide-and-conquer." It sits in Section 5, Algorithms, beside "Searching, sorting, hashing" and "Asymptotic worst case time and space complexity". The syllabus names the technique, not any particular algorithm, so the lesson teaches the technique and uses merge sort, quicksort, binary search, Karatsuba and the maximum-subarray problem as its instances.',
      narration: 'Section five names three design techniques: greedy, dynamic programming and divide and conquer. The technique is the topic, not the sort.',
      keyword: 'divide-and-conquer',
      trap: 'The syllabus names the technique, not the algorithms. Merge sort is an example of it, not the item itself.'
    },
    {
      id: 'a-2', scene: 'ask', start: 8, end: 15,
      caption: 'Three steps: divide the problem, conquer each part recursively, combine the answers.',
      detail: 'Divide: split one problem of size n into a subproblems of size n/b each. Conquer: solve each subproblem by the same procedure, until the pieces are small enough to answer directly. Combine: turn the a answers into one answer for the original problem, at some cost f(n).',
      narration: 'Three steps: divide the problem, conquer each part by the same method, combine the answers.',
      keyword: 'Three steps',
      trap: 'A method that keeps only one part — binary search, quickselect — is decrease and conquer, not divide and conquer.'
    },
    {
      id: 'a-3', scene: 'ask', start: 15, end: 22,
      caption: 'Two numbers decide the shape: a, how many parts, and b, how much smaller each part is.',
      detail: 'For merge sort a = 2 and b = 2: two halves, each half the size. For Karatsuba multiplication a = 3 and b = 2: three half-size products. For binary search a = 1 and b = 2. Everything else about the running time follows from these two numbers plus the combine cost.',
      narration: 'Two numbers decide the shape: a, how many parts, and b, how much smaller each part is.',
      keyword: 'how many parts',
      trap: 'A split into one part of size n-1 is a = 1, b = 1: that is quicksort\'s worst case, and it is not logarithmic.'
    },
    {
      id: 'a-4', scene: 'ask', start: 22, end: 30,
      caption: 'Add the combine cost f(n) and the three numbers give the recurrence; the recurrence gives the time.',
      detail: 'T(n) = aT(n/b) + f(n) with a base case for small n. The rest of this lesson is one idea applied four times: draw the recursion tree, count the leaves and the work per level, and see which of the two dominates. Every count on this canvas is produced by the page\'s model and printed under it.',
      narration: 'Add the combine cost and you have the recurrence. The recurrence, not the code, is what the exam asks about.',
      keyword: 'recurrence',
      trap: 'Writing the recurrence from the code is the step people skip, and it is the step every question depends on.'
    },

    /* ---------- scene 2: split ---------- */
    {
      id: 'b-1', scene: 'split', start: 30, end: 38,
      caption: 'Eight elements, split into two halves of four, then two, then one.',
      detail: 'Merge sort divides the array in half by position, not by value, so the split is always balanced: 8 becomes 4 and 4, each 4 becomes 2 and 2, each 2 becomes 1 and 1. Because the split does not look at the values, the shape of the tree is the same for every input of size 8 — only the merge costs differ.',
      narration: 'Eight elements, split into halves of four, then two, then one. The split is by position, so the shape never changes.',
      keyword: 'split into two halves',
      trap: 'The tree is balanced because the split is by position. Quicksort splits by value, and there the tree is not balanced.'
    },
    {
      id: 'b-2', scene: 'split', start: 38, end: 45,
      caption: 'Three levels of splitting, and eight one-element lists at the bottom.',
      detail: 'The model builds the tree and counts it: 1 node at level 0, 2 at level 1, 4 at level 2, 8 at level 3. The leaves are the base cases — a one-element list is already sorted — so there are 8 of them, and the number of levels below the root is log2 8 = 3.',
      narration: 'Three levels of splitting, and eight one-element lists at the bottom. The leaves are the base cases.',
      keyword: 'eight one-element lists',
      trap: 'Counting nodes instead of levels is the usual slip: the levels are log_b n, the nodes are about twice that.'
    },
    {
      id: 'b-3', scene: 'split', start: 45, end: 52,
      caption: 'Coming back up, seven merges: four of size two, two of size four, one of size eight.',
      detail: 'Every internal node is one merge, so the number of merges is the number of internal nodes: 4 + 2 + 1 = 7, which is n - 1 for n = 8. Each merge joins two already sorted lists, which is what makes the combine step cheap enough to matter.',
      narration: 'Coming back up, seven merges: four of size two, two of size four, one of size eight.',
      keyword: 'seven merges',
      trap: 'n - 1 merges, not n: the leaves are sorted for free, and each merge removes one list.'
    },
    {
      id: 'b-4', scene: 'split', start: 52, end: 60,
      caption: 'Each level does at most one n of work, and there are three levels: 24 units, which is n log n.',
      detail: 'At every level the total length of the lists being merged is exactly n = 8, so the work per level is bounded by a constant times n, and the level count is log2 n. For n = 8 that is 3 x 8 = 24, and the model prints 24 from the tree itself. This is why merge sort is n log n in every case, not only on average.',
      narration: 'Each level does one n of work, and there are three levels: twenty-four. That is n log n.',
      keyword: 'n log n',
      trap: 'n log n comes from levels times work per level. It is not a formula to memorise separately from the tree.'
    },

    /* ---------- scene 3: merge ---------- */
    {
      id: 'c-1', scene: 'merge', start: 60, end: 68,
      caption: 'Merging two sorted lists of sizes m and n costs between min(m,n) and m+n-1 comparisons.',
      detail: 'The lower bound happens when one list is exhausted first and every element of the shorter list was compared once; the upper bound happens when the last element to be placed is the largest of all, so every element but one was compared. GATE CSE 1995 asked for exactly this bound, and the answer is the range, not a single number.',
      narration: 'Merging two sorted lists costs between the smaller size and one less than the total.',
      keyword: 'min(m,n)',
      trap: 'A merge is not always m+n comparisons: the last element needs no comparison, and one list may run out early.'
    },
    {
      id: 'c-2', scene: 'merge', start: 68, end: 76,
      caption: 'Both bounds are exact: enumerate every interleaving and the extremes are reached.',
      detail: 'The model enumerates every way two sorted lists can interleave, for every pair of sizes up to 4, and records the smallest and largest comparison counts. On 2 against 3 the range is 2 to 4; on 4 against 4 it is 4 to 7. Both ends match min(m,n) and m+n-1 in all sixteen pairs, so the bound is tight and not merely safe.',
      narration: 'Both bounds are exact. Enumerate every interleaving and you reach both ends.',
      keyword: 'Both bounds are exact',
      trap: 'A bound being safe does not make it tight. This one is tight, and the enumeration is what shows it.'
    },
    {
      id: 'c-3', scene: 'merge', start: 76, end: 84,
      caption: 'For eight elements the worst case is seventeen comparisons, and the best is twelve.',
      detail: 'The model sorts all 40,320 orderings of eight elements by merge sort and counts comparisons: the maximum is 17, the minimum 12, and the average 15.73. The worst case is not n log n = 24 — that is the count of level work, and a merge usually finishes before it has compared every pair.',
      narration: 'For eight elements the worst case is seventeen comparisons and the best is twelve, over all forty thousand orderings.',
      keyword: 'seventeen',
      trap: 'n log n counts units of work, not comparisons. Quoting 24 as a comparison count is the standard error here.'
    },
    {
      id: 'c-4', scene: 'merge', start: 84, end: 90,
      caption: 'The closed form n·ceil(lg n) - 2^ceil(lg n) + 1 gives 17, and the enumeration agrees for every n from 1 to 8.',
      detail: 'For a power of two this is n log2 n - n + 1, which for n = 8 is 24 - 8 + 1 = 17. The model checks the formula against the enumerated maximum for n = 1 through 8 and gets 0, 1, 3, 5, 8, 11, 14, 17 both ways. That agreement is what licenses quoting the formula on a paper.',
      narration: 'The closed form gives seventeen, and the enumeration agrees for every size from one to eight.',
      keyword: 'n log n - n + 1',
      trap: 'The formula is for the worst case only. The average is lower, and the best case is about half of it.'
    },

    /* ---------- scene 4: recur ---------- */
    {
      id: 'd-1', scene: 'recur', start: 90, end: 98,
      caption: 'One recurrence for the whole family: T(n) = a·T(n/b) + f(n).',
      detail: 'a is the number of subproblems, b is the factor by which the size shrinks, and f(n) is everything that is not a recursive call — the dividing and the combining. Merge sort: T(n) = 2T(n/2) + n. Karatsuba: T(n) = 3T(n/2) + n. Binary search: T(n) = T(n/2) + 1. Quicksort\'s worst case: T(n) = T(n-1) + n.',
      narration: 'One recurrence covers the family: a subproblems, each of size n over b, plus the cost of dividing and combining.',
      keyword: 'T(n) = a·T(n/b) + f(n)',
      trap: 'f(n) is the whole of the non-recursive work. Leaving out the partition cost makes quicksort look logarithmic.'
    },
    {
      id: 'd-2', scene: 'recur', start: 98, end: 106,
      caption: 'The tree has log_b n levels and a^(log_b n) leaves, and that leaf count equals n^(log_b a).',
      detail: 'Level k has a^k nodes, each of size n/b^k, so the level count follows from n/b^k = 1, which gives k = log_b n. The leaf count is a^(log_b n), and the identity a^(log_b n) = n^(log_b a) is the single most useful line in this topic: the number of leaves is a power of n, and the exponent is log_b a.',
      narration: 'The tree has log base b of n levels and a to the log base b of n leaves, which is n to the log base b of a.',
      keyword: 'n^(log_b a)',
      trap: 'a^(log_b n) and n^(log_b a) are the same number, but only the second tells you the exponent in n.'
    },
    {
      id: 'd-3', scene: 'recur', start: 106, end: 114,
      caption: 'Three quantities: the leaves, the work per level, and the height. Whichever dominates sets the answer.',
      detail: 'The leaves total Theta(n^(log_b a)). Each level of internal work totals about f(n) shrunk by the same factor the size shrinks, so the level sums are either growing, constant, or shrinking as you go down. The height is log_b n. Comparing the leaf total with the level total is the whole of the master theorem.',
      narration: 'Three quantities: the leaves, the work per level, and the height. Whichever dominates decides the answer.',
      keyword: 'Whichever dominates',
      trap: 'Do not add the three. One of them dominates and the others are absorbed by the Theta.'
    },
    {
      id: 'd-4', scene: 'recur', start: 114, end: 120,
      caption: 'For merge sort a = 2, b = 2, f(n) = n: height log2 n, leaves n, work n per level.',
      detail: 'Leaves and level work are both Theta(n), so neither dominates: every level costs the same and there are log2 n of them, giving n log2 n. The model computes T(n) = 2T(n/2) + n exactly and gets n log2 n + n — 2304 at n = 256 — which is Theta(n log n) with the lower-order term visible.',
      narration: 'For merge sort the leaves and the level work are both n, so every level counts and the answer is n log n.',
      keyword: 'n log2 n + n',
      trap: 'The exact solution carries a +n. The asymptotic answer hides it, and GATE sometimes asks for the exact value.'
    },

    /* ---------- scene 5: cases ---------- */
    {
      id: 'e-1', scene: 'cases', start: 120, end: 128,
      caption: 'Case one: the leaves dominate, when f(n) is smaller than n^(log_b a).',
      detail: 'If the combining is cheap relative to the number of leaves, the bottom of the tree costs more than everything above it, and T(n) = Theta(n^(log_b a)). Example: T(n) = 2T(n/2) + 1 gives 2n - 1, which is Theta(n), and 8T(n/2) + n^2 gives Theta(n^3).',
      narration: 'Case one: the leaves dominate, when the combine cost is smaller than n to the log base b of a.',
      keyword: 'the leaves dominate',
      trap: 'Case one is not "small f". It is f smaller than n^(log_b a) by a polynomial factor, which is a statement about exponents.'
    },
    {
      id: 'e-2', scene: 'cases', start: 128, end: 136,
      caption: 'Case two: every level costs the same, when f(n) is exactly n^(log_b a); the answer gains a factor of log n.',
      detail: 'The level sums are all equal, so the total is that level cost times the number of levels: Theta(n^(log_b a) log n). Merge sort is the canonical instance: 2T(n/2) + n gives n log n. T(n) = 4T(n/2) + n^2 also lands here, giving n^2 log n.',
      narration: 'Case two: every level costs the same, and the answer gains one factor of log n.',
      keyword: 'gains a factor of log n',
      trap: 'This is the case where the extra log appears. In the other two cases there is no extra log.'
    },
    {
      id: 'e-3', scene: 'cases', start: 136, end: 144,
      caption: 'Case three: the root dominates, when f(n) is bigger; the answer is f(n).',
      detail: 'If combining is expensive enough — larger than n^(log_b a) by a polynomial factor, with the regularity condition satisfied — then the top level costs more than all the levels below it together, and T(n) = Theta(f(n)). Example: T(n) = 2T(n/2) + n^2 gives 2n^2 - n, which is Theta(n^2).',
      narration: 'Case three: the root dominates, and the answer is the combine cost itself.',
      keyword: 'the root dominates',
      trap: 'Case three needs the regularity condition a·f(n/b) <= c·f(n) for some c < 1. It holds for polynomials and fails for some wild functions.'
    },
    {
      id: 'e-4', scene: 'cases', start: 144, end: 150,
      caption: 'Checked at n = 256: 2304, 130816 and 33488896, each matched to its closed form.',
      detail: 'The model evaluates each recurrence by direct recursion at n = 256 and compares with the closed form. 2T(n/2) + n gives 2304, which is n log2 n + n exactly. 4T(n/2) + n gives 130816, which is 2n^2 - n exactly — the same number as 2T(n/2) + n^2, and the same Theta(n^2), which is why the case is decided by n^(log_b a) and not by f alone. 8T(n/2) + n^2 gives 33488896, just under 2n^3.',
      narration: 'At n equals 256: twenty-three hundred and four, one hundred thirty thousand, and thirty-three million. Each matches its closed form.',
      keyword: '130816',
      trap: 'Two different recurrences giving the same number is a warning: 4T(n/2)+n and 2T(n/2)+n^2 are both n^2, by different cases.'
    },

    /* ---------- scene 6: quick ---------- */
    {
      id: 'f-1', scene: 'quick', start: 150, end: 158,
      caption: 'Quicksort divides around a pivot: n-1 comparisons to partition, then two independent subproblems.',
      detail: 'The partition compares every other element with the pivot exactly once, so it costs n-1 comparisons and no movement of data beyond the swap. The pivot then sits in its final position, and the two sides are sorted independently: T(n) = T(k) + T(n-1-k) + (n-1), where k is how many elements ended up left of the pivot.',
      narration: 'Quicksort divides around a pivot: n minus one comparisons, then two independent subproblems.',
      keyword: 'n-1 comparisons',
      trap: 'The pivot is not compared with itself, and it is not compared again in either subproblem.'
    },
    {
      id: 'f-2', scene: 'quick', start: 158, end: 166,
      caption: 'Sorted input with the first element as pivot gives the worst case: 28 comparisons for eight elements.',
      detail: 'If the pivot is always the smallest, one side is empty and the other has n-1 elements, so the comparisons sum to (n-1) + (n-2) + ... + 1 = n(n-1)/2. For n = 8 that is 28, and the model confirms 28 on sorted input and 28 on reverse-sorted input. The same array sorted by merge sort needs at most 17.',
      narration: 'Sorted input with the first element as pivot gives the worst case: twenty-eight comparisons for eight elements.',
      keyword: '28 comparisons',
      trap: 'Reverse-sorted input is equally bad. "Already sorted" is not a safe input for a first-element pivot.'
    },
    {
      id: 'f-3', scene: 'quick', start: 166, end: 174,
      caption: 'The average is 2(n+1)H_n - 4n: 16.92 for eight elements, which is what the enumeration gives.',
      detail: 'The model sorts all 40,320 orderings of eight elements by quicksort and averages the comparison counts: 16.9214. The closed form 2(n+1)H_n - 4n, with H_n the n-th harmonic number, gives 16.9214 too. The average is Theta(n log n) even though the worst case is Theta(n^2), which is why the average is not a guarantee.',
      narration: 'The average is two n plus one times the harmonic number minus four n: sixteen point nine two, matching the enumeration.',
      keyword: '16.92',
      trap: 'An average over all inputs says nothing about the input you are given. Sorted data is not average data.'
    },
    {
      id: 'f-4', scene: 'quick', start: 174, end: 180,
      caption: 'Best 13, average 16.92, worst 28 — best and average are both n log n, the worst is not.',
      detail: 'The best case is a perfectly balanced split every time, which gives the same n log n as merge sort. The enumeration finds 13 for the best ordering of eight elements, close to the n log2 n - n + 1 = 17 of merge sort\'s worst case, because a balanced quicksort does less combining than a merge.',
      narration: 'Best thirteen, average sixteen point nine two, worst twenty-eight. Only the worst case is quadratic.',
      keyword: 'only the worst case',
      trap: 'A balanced split needs a good pivot. Choosing the median of three, or at random, is what makes the good case likely.'
    },

    /* ---------- scene 7: decrease ---------- */
    {
      id: 'g-1', scene: 'decrease', start: 180, end: 188,
      caption: 'Decrease and conquer keeps one subproblem: binary search halves the range and discards the rest.',
      detail: 'Compare the middle element, then recurse into exactly one half: T(n) = T(n/2) + 1. The other half is not solved and not needed, which is the difference from divide and conquer, where every part must be solved because every part contributes to the answer.',
      narration: 'Decrease and conquer keeps one subproblem. Binary search halves the range and discards the other half.',
      keyword: 'one subproblem',
      trap: 'Binary search is not divide and conquer. It is one recursive call, and its tree is a path, not a tree.'
    },
    {
      id: 'g-2', scene: 'decrease', start: 188, end: 196,
      caption: 'The worst case is floor(lg n) + 1 comparisons: 4 for every n from 8 to 15.',
      detail: 'The model runs binary search on every array size up to 64, for every target, and records the maximum comparison count. It equals floor(log2 n) + 1 everywhere: 4 for n = 8 through 15, 5 for 16 through 31, 6 for 32 through 64. GATE CSE 2021 Set 2 asks for the worst-case number of arithmetic operations of recursive binary search, and each level does a constant amount of arithmetic, so the answer is Theta(log n).',
      narration: 'The worst case is floor of log n plus one: four comparisons for any size from eight to fifteen.',
      keyword: 'floor(lg n) + 1',
      trap: 'Ceiling and floor differ at powers of two. Count the levels and you cannot get it wrong.'
    },
    {
      id: 'g-3', scene: 'decrease', start: 196, end: 204,
      caption: 'Divide keeps a subproblems; decrease keeps one. That is the gap between n log n and log n.',
      detail: 'With a = 1 the leaf count is n^0 = 1: the tree has a single leaf, so the answer is the cost along one path, which is f(n) times the height. With a = 2 the leaf count is n, and every leaf must be paid for. The two families are separated by that one number, not by the word "recursive".',
      narration: 'Divide keeps a subproblems, decrease keeps one. That one number is the gap between n log n and log n.',
      keyword: 'a subproblems',
      trap: 'A recursive program is not automatically divide and conquer. Count the recursive calls in the body.'
    },
    {
      id: 'g-4', scene: 'decrease', start: 204, end: 210,
      caption: 'Quickselect is decrease and conquer with a partition: expected linear, worst quadratic.',
      detail: 'Finding the k-th smallest element partitions once, then recurses into the one side that contains position k. The expected cost is Theta(n) because the sizes shrink geometrically on average; the worst case is Theta(n^2) for the same reason quicksort\'s is. Median-of-medians removes the quadratic case at the price of a larger constant.',
      narration: 'Quickselect is decrease and conquer with a partition: linear on average, quadratic in the worst case.',
      keyword: 'expected linear',
      trap: 'Expected linear is not linear. The worst case still exists, and a question that says "worst case" wants n^2.'
    },

    /* ---------- scene 8: karat ---------- */
    {
      id: 'h-1', scene: 'karat', start: 210, end: 218,
      caption: 'Multiplying two n-digit numbers: the schoolbook method does four half-size products.',
      detail: 'Split each number into high and low halves. Then xy = x1y1·B^n + (x1y0 + x0y1)·B^(n/2) + x0y0, which needs four products of half-size numbers: T(n) = 4T(n/2) + O(n), so T(n) = Theta(n^2) — the same as the method you learned at school, only written recursively.',
      narration: 'Schoolbook multiplication does four half-size products, so the recurrence is four T of n over two plus n.',
      keyword: 'four half-size products',
      trap: 'Splitting alone does not help. Four subproblems of half the size is still n squared.'
    },
    {
      id: 'h-2', scene: 'karat', start: 218, end: 226,
      caption: 'Karatsuba does three, by adding before multiplying: 3^k products instead of 4^k.',
      detail: 'The middle term x1y0 + x0y1 is computed as (x1+x0)(y1+y0) - x1y1 - x0y0, which reuses the two products already computed. So T(n) = 3T(n/2) + O(n), and at depth k there are 3^k leaf products against 4^k. The model counts both exactly: 3, 9, 27, 81, 243 against 4, 16, 64, 256, 1024.',
      narration: 'Karatsuba does three products by adding first: three to the k against four to the k.',
      keyword: 'three products',
      trap: 'The saving is in multiplications only. Karatsuba does more additions, which is why it is not faster at every size.'
    },
    {
      id: 'h-3', scene: 'karat', start: 226, end: 234,
      caption: 'The exponent falls from 2 to log2 3 = 1.585, and 3^k is exactly n^(log2 3).',
      detail: 'With a = 3 and b = 2, the leaf count is n^(log2 3) = n^1.585, and the combine cost is linear, so case one applies and T(n) = Theta(n^1.585). The model checks the identity at n = 256: 3^8 = 6561 and 256^1.585 = 6561, the same number by two routes.',
      narration: 'The exponent falls from two to one point five eight five, and three to the k is exactly n to that power.',
      keyword: 'n^1.585',
      trap: 'log2 3 is about 1.585, not 1.5. Rounding the exponent changes the predicted work substantially.'
    },
    {
      id: 'h-4', scene: 'karat', start: 234, end: 240,
      caption: 'Counting one unit per multiplication and per addition, Karatsuba wins from n = 4 and loses at n = 2.',
      detail: 'Under that cost model the totals are 9 against 8 at n = 2 — schoolbook wins — and 39 against 48 at n = 4, 141 against 256 at n = 8, 44391 against 589824 at n = 256. The crossover depends on the model, so the honest claim is the asymptotic one: Theta(n^1.585) beats Theta(n^2) eventually, and where "eventually" starts is a constant-factor question.',
      narration: 'Under one unit per operation Karatsuba wins from n equals four and loses at n equals two. The crossover is a constant-factor question.',
      keyword: 'crossover',
      trap: 'An asymptotic improvement is not a promise at small n. The constant decides, and it must be computed, not assumed.'
    },

    /* ---------- scene 9: pyq ---------- */
    {
      id: 'i-1', scene: 'pyq', start: 240, end: 248,
      caption: 'GATE CSE 2019 Q25: the maximum of S(i,j) over fourteen numbers, with divide and conquer allowed. The answer is 29.',
      detail: 'The array is -5, -10, 6, 3, -1, -2, 13, 4, -9, -1, 4, 12, -3, 0, and S(i,j) is the sum from index i to index j inclusive. The maximum is 29, from indices 2 to 11: 6 + 3 - 1 - 2 + 13 + 4 - 9 - 1 + 4 + 12. The question is a numerical-answer item, so the answer is the number, not an option letter.',
      narration: 'Twenty nineteen, question twenty-five: the maximum subarray sum of fourteen numbers is twenty-nine.',
      keyword: '29',
      trap: 'S(i,j) is a contiguous sum. Summing the positive values gives 42, which is the subsequence reading, and it is wrong.'
    },
    {
      id: 'i-2', scene: 'pyq', start: 248, end: 256,
      caption: 'The page\'s own divide-and-conquer code returns 29, and brute force over all 105 pairs agrees.',
      detail: 'The model runs the standard three-way maximum-subarray recursion — best on the left, best on the right, best crossing the midpoint — and gets 29. It also runs a brute force over all 105 contiguous ranges and gets 29, and it compares the two on 200 random arrays with no disagreement. That is what makes the answer a computation rather than a recollection.',
      narration: 'The divide-and-conquer code returns twenty-nine, and brute force over all one hundred and five pairs agrees.',
      keyword: 'brute force agrees',
      trap: 'The crossing case is the part people forget. Best-left plus best-right is not the crossing sum.'
    },
    {
      id: 'i-3', scene: 'pyq', start: 256, end: 264,
      caption: 'GATE CSE 2015 Set 1: the worst-case recurrence for quicksort is T(n) = T(n-1) + O(n), option B.',
      detail: 'The partition is linear, and the worst case puts everything on one side, so there is one subproblem of size n-1 and no second subproblem. T(n) = T(n-1) + O(n) solves to O(n^2). The balanced alternative T(n) = 2T(n/2) + O(n) is the best case, and it is the option that tempts. The model\'s count for eight elements, 28 on sorted input, is n(n-1)/2 and matches.',
      narration: 'Twenty fifteen set one: the worst case is T of n minus one plus O of n, option B, and it solves to n squared.',
      keyword: 'T(n-1) + O(n)',
      trap: 'Two recursive calls of half size is the best case. Reading "quicksort" and writing the merge-sort recurrence is the classic error.'
    },
    {
      id: 'i-4', scene: 'pyq', start: 264, end: 270,
      caption: 'GATE CSE 2014 Set 2: T(2^k) = 3T(2^(k-1)) + 1 gives (3^(k+1) - 1)/2, which is Theta(3^k) = Theta(n^(log2 3)).',
      detail: 'Substituting repeatedly gives T = 1 + 3 + 9 + ... + 3^k = (3^(k+1) - 1)/2, and since n = 2^k, that is Theta(3^k) = Theta(n^1.585). The model evaluates the recurrence and the closed form for k = 0 to 8 and they agree: 1, 4, 13, 40, 121, 364, 1093. GATE CSE 2021 Set 2 asks the same shape of question about recursive binary search, where each level does constant arithmetic, so the answer is Theta(log n).',
      narration: 'Twenty fourteen: the recurrence sums a geometric series to three to the k plus one minus one over two, which is n to the one point five eight five.',
      keyword: '(3^(k+1) - 1)/2',
      trap: 'The recurrence is not in n. Substitute n = 2^k first, solve in k, then convert back, or the exponent comes out wrong.'
    },

    /* ---------- scene 10: proc ---------- */
    {
      id: 'j-1', scene: 'proc', start: 270, end: 276,
      caption: 'Step one: name a, b and f(n), and write the recurrence before solving anything.',
      detail: 'Count the recursive calls in the body for a. Read how the input size changes for b. Everything that is not a call — the partition, the merge, the combine — is f(n). Writing the recurrence first is what stops the merge-sort recurrence being written for quicksort.',
      narration: 'Step one: name a, b and f of n, and write the recurrence before solving anything.',
      keyword: 'write the recurrence',
      trap: 'Solving a recurrence you did not derive is how a plausible-looking wrong answer appears.'
    },
    {
      id: 'j-2', scene: 'proc', start: 276, end: 282,
      caption: 'Step two: count the levels and the leaves, not the calls you can see in the code.',
      detail: 'The levels are log_b n and the leaves are n^(log_b a). For merge sort that is 3 levels and 8 leaves at n = 8, not the 15 nodes of the whole tree. Counting visible calls is how a tree of 15 nodes becomes a wrong answer about levels.',
      narration: 'Step two: count the levels and the leaves, not the calls you can see in the code.',
      keyword: 'levels and the leaves',
      trap: 'Nodes and levels are different counts. Two to the level count is the node count.'
    },
    {
      id: 'j-3', scene: 'proc', start: 282, end: 288,
      caption: 'Step three: compare f(n) with n^(log_b a) to pick the case.',
      detail: 'Equal gives case two and one extra factor of log n. f smaller gives case one and the leaf total. f larger gives case three and f itself, provided the regularity condition holds. The comparison is between exponents, not between the functions as written.',
      narration: 'Step three: compare f of n with n to the log base b of a to pick the case.',
      keyword: 'pick the case',
      trap: 'Case two needs exact equality up to a constant, not merely the same order of magnitude at one value of n.'
    },
    {
      id: 'j-4', scene: 'proc', start: 288, end: 294,
      caption: 'Step four: if the split can be unbalanced, the balanced recurrence is not the answer.',
      detail: 'Quicksort with a first-element pivot has a balanced recurrence only on average input. The worst case is T(n-1) + O(n), which is quadratic. The same caution applies to any "divide into two halves" claim that assumes the halves are equal in size or in cost.',
      narration: 'Step four: if the split can be unbalanced, the balanced recurrence is not the answer.',
      keyword: 'unbalanced',
      trap: 'A recurrence describes the worst case only if you write the worst split into it.'
    },
    {
      id: 'j-5', scene: 'proc', start: 294, end: 300,
      caption: 'Step five: check the base case and the exact count. An asymptotic answer hides the constant.',
      detail: 'The model\'s exact values — 17 comparisons at n = 8, 2304 at n = 256, 6561 products at k = 8 — are the kind of number a numerical-answer question wants. The asymptotic class is the kind a multiple-choice question wants. Read which one is being asked before answering.',
      narration: 'Step five: check the base case and the exact count. An asymptotic answer hides the constant.',
      keyword: 'the exact count',
      trap: 'Theta(n log n) does not tell you 17. A NAT question asking for comparisons needs the exact count.'
    }
  ]
};
