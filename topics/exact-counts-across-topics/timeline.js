/* ==========================================================================
   exact-counts-across-topics — THE timeline.
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
      id: 'units',
      n: 1,
      title: 'Four units, one procedure',
      start: 0, end: 30,
      objective: 'See that "how many comparisons" and "how much work" are different questions about the same algorithm, and that every exact count on the paper is built by the same four steps.'
    },
    {
      id: 'merge',
      n: 2,
      title: 'Merge sort: work counted by level, comparisons counted exactly',
      start: 30, end: 60,
      objective: 'Count merge sort two ways at n = 8 — 24 units of level work and 17 comparisons in the worst case — and check the closed form against every ordering.'
    },
    {
      id: 'quick',
      n: 3,
      title: 'Quicksort: n - 1 comparisons per partition',
      start: 60, end: 90,
      objective: 'Derive n(n-1)/2 as the worst case from the number of element pairs, and count the two GATE CSE 2014 Set 1 inputs exactly: 10 against 7.'
    },
    {
      id: 'bsearch',
      n: 4,
      title: 'Binary search: one comparison per level',
      start: 90, end: 120,
      objective: 'Read floor(lg n) + 1 off the halving, verify it against every size and every target up to 64, and settle the counting convention of GATE CSE 2007 Q15.'
    },
    {
      id: 'hash',
      n: 5,
      title: 'Hashing: probes, and the load factor that multiplies them',
      start: 120, end: 150,
      objective: 'Count probes in a real chained table (1.4 successful, 2.43 unsuccessful), then see why the estimate 1/(1-alpha) is a statement about random hash functions rather than about one table.'
    },
    {
      id: 'cache',
      n: 6,
      title: 'Cache: block transfers for one access sequence',
      start: 150, end: 180,
      objective: 'Count misses for the same sixteen accesses in row-major and column-major order — 4 against 16 — and turn the count into an average memory access time.'
    },
    {
      id: 'dp',
      n: 7,
      title: 'Dynamic programming: count the cells before you fill them',
      start: 180, end: 210,
      objective: 'Count subproblems and split points for matrix-chain multiplication (10 and 20 at n = 5) and table cells for LCS (30 at 4 by 5), from the table shape rather than from memory.'
    },
    {
      id: 'karatsuba',
      n: 8,
      title: 'Karatsuba: count multiplications, not steps',
      start: 210, end: 240,
      objective: 'Count 3^k against 4^k scalar products, and see that the exponent log base 2 of 3 = 1.585 is a count of leaves in a tree, not a rate.'
    },
    {
      id: 'one-n',
      n: 9,
      title: 'One n, four units: 1024',
      start: 240, end: 270,
      objective: 'Put the four counts side by side at the same n, so that 11, 9217, 256 and 59049 are each seen to be correct for its own question and wrong for the others.'
    },
    {
      id: 'procedure',
      n: 10,
      title: 'The procedure, and the five traps',
      start: 270, end: 300,
      objective: 'Fix the four-step counting procedure and the five ways an exact count goes wrong, with the counterexample that exposes each one.'
    }
  ],

  events: [
    /* ---------------- 1. units ---------------- */
    {
      id: 'units-1', scene: 'units', start: 0, end: 7.5,
      caption: 'Section 5 of the syllabus asks for "asymptotic worst case time and space complexity" — and the paper then asks for an integer.',
      detail: 'The syllabus names the asymptotic class. A question almost always asks for the exact number of operations on a stated input, so the class is the beginning of the work, not the end of it.',
      keyword: 'exact number',
      trap: 'A correct Big-O tells you nothing about the integer on the answer sheet. n log n does not say 17.',
      narration: 'Section five asks for asymptotic worst case complexity. The paper then asks for an integer. Those are two different questions.',
      visualAction: 'show-four-unit-tiles'
    },
    {
      id: 'units-2', scene: 'units', start: 7.5, end: 15,
      caption: 'Four units cover every count the syllabus asks for: a comparison, a probe, a block transfer, a multiplication.',
      detail: 'A comparison is one test of two keys. A probe is one slot examined in a hash table. A block transfer is one block moved between memory and cache. A multiplication is one scalar product. Each structure counts its own unit.',
      keyword: 'comparison, probe, block transfer, multiplication',
      trap: 'Swapping the unit is the commonest error: reporting merge sort work as comparisons, or comparisons as work.',
      narration: 'Four units cover the syllabus: a comparison, a probe, a block transfer, and a multiplication. Each structure counts its own.',
      visualAction: 'name-units'
    },
    {
      id: 'units-3', scene: 'units', start: 15, end: 22.5,
      caption: 'Merge sort on eight elements does 24 units of work and at most 17 comparisons. Both are right; they answer different questions.',
      detail: 'Work counts every element placed at every level: 8 elements times 3 levels is 24. A comparison is one test inside one merge, and a merge usually finishes before testing every pair, so the worst case is 17.',
      keyword: '24 units of work and at most 17 comparisons',
      trap: 'The 24 is not a comparison count and the 17 is not a work count. Writing 24 when the question says comparisons is a lost mark.',
      narration: 'Merge sort on eight elements does twenty-four units of work and at most seventeen comparisons. Both are right, and they answer different questions.',
      visualAction: 'compare-24-and-17'
    },
    {
      id: 'units-4', scene: 'units', start: 22.5, end: 30,
      caption: 'The procedure: name the unit, count the units per level, sum with the structure\'s identity, then check by a second route.',
      detail: 'Step 1: what is one operation here. Step 2: how many operations does one level, one partition, one call cost. Step 3: multiply by the number of levels or phases, using the structure\'s own identity. Step 4: reach the same integer a second way — a closed form, or an enumeration — because one route can be wrong and two rarely agree by accident.',
      keyword: 'check by a second route',
      trap: 'Skipping step 4 is how a plausible formula survives. The page runs step 4 for every number it shows.',
      narration: 'The procedure has four steps: name the unit, count the units per level, sum with the structure identity, and check by a second route.',
      visualAction: 'show-four-steps'
    },

    /* ---------------- 2. merge ---------------- */
    {
      id: 'merge-1', scene: 'merge', start: 30, end: 37.5,
      caption: 'Merge sort on eight elements: three levels below the root, eight leaves, seven merges.',
      detail: 'Divide 8 into 4 and 4, each 4 into 2 and 2, each 2 into 1 and 1. The tree has three levels below the root, so eight leaves and seven internal merges. The model builds this tree rather than quoting it.',
      keyword: 'three levels below the root',
      trap: 'Counting the root as a level gives four and shifts every later number.',
      narration: 'Merge sort on eight elements has three levels below the root, eight leaves, and seven merges.',
      visualAction: 'draw-recursion-tree'
    },
    {
      id: 'merge-2', scene: 'merge', start: 37.5, end: 45,
      caption: 'Work: every level moves all eight elements once, so the total is 8 times 3 = 24 units.',
      detail: 'At every level the lists being merged have total length 8. Three levels at 8 units each gives 24. That is the quantity n log n counts, and it is a count of element placements.',
      keyword: '8 times 3 = 24 units',
      trap: 'The level count is a work count. Reading it as a comparison count is the error the next beat fixes.',
      narration: 'Every level moves all eight elements once, so the total is eight times three, twenty-four units of work.',
      visualAction: 'sum-level-work'
    },
    {
      id: 'merge-3', scene: 'merge', start: 45, end: 52.5,
      caption: 'Comparisons: 12 best, 17 worst, 15.73 on average, over all 40,320 orderings of eight elements.',
      detail: 'The model sorts every one of the 40,320 orderings of eight elements and counts the comparisons. The worst case is 17, not 24, because once one list of a merge is exhausted the rest are copied with no comparison at all.',
      keyword: '12 best, 17 worst',
      trap: 'A merge costs at most m + n - 1 comparisons, not m + n. The minus one is the copy that needs no test.',
      narration: 'Comparisons are twelve at best, seventeen at worst, and fifteen point seven three on average, over all forty thousand three hundred and twenty orderings.',
      visualAction: 'enumerate-comparisons'
    },
    {
      id: 'merge-4', scene: 'merge', start: 52.5, end: 60,
      caption: 'The closed form n times ceil(lg n) minus 2 to the ceil(lg n) plus 1 gives 17 at n = 8, and matches the enumeration at every n from 1 to 8.',
      detail: 'At n = 8: 8 times 3 is 24, minus 8 is 16, plus 1 is 17. The model checks the formula against the enumerated worst case for n = 1 through 8 and gets 0, 1, 3, 5, 8, 11, 14, 17 both ways.',
      keyword: 'n times ceil(lg n) minus 2 to the ceil(lg n) plus 1',
      trap: 'The formula is for a power-of-two-friendly split and for this exact merge sort. Another split rule gives another constant.',
      narration: 'The closed form, n times ceil of log base two n, minus two to that power, plus one, gives seventeen at n equals eight, and matches the enumeration at every size from one to eight.',
      visualAction: 'check-closed-form'
    },

    /* ---------------- 3. quick ---------------- */
    {
      id: 'quick-1', scene: 'quick', start: 60, end: 67.5,
      caption: 'A partition compares the pivot with every other element in its range: exactly n - 1 comparisons for n elements.',
      detail: 'One pass over the range, one comparison per element other than the pivot. Nothing else in a partition compares keys, so the count is exact and not a bound.',
      keyword: 'exactly n - 1 comparisons',
      trap: 'Comparing the pivot with itself, or with elements outside the range, inflates the count by one per partition.',
      narration: 'A partition compares the pivot with every other element in its range, so exactly n minus one comparisons.',
      visualAction: 'count-one-partition'
    },
    {
      id: 'quick-2', scene: 'quick', start: 67.5, end: 75,
      caption: 'Worst case: every partition splits off one element, so the counts are 7 + 6 + 5 + 4 + 3 + 2 + 1 = 28 at n = 8.',
      detail: 'An unbalanced split makes one side empty each time, so the ranges shrink by one per partition and the total is the sum of the first n - 1 integers, which is n(n-1)/2 = 28 at n = 8. The model reaches 28 on sorted and on reverse-sorted input.',
      keyword: '28',
      trap: '28 is the worst case for this pivot rule. A median-of-three pivot can beat it on sorted input.',
      narration: 'In the worst case every partition splits off one element, so the counts are seven, six, five, four, three, two, one, which is twenty-eight at n equals eight.',
      visualAction: 'unbalanced-partitions'
    },
    {
      id: 'quick-3', scene: 'quick', start: 75, end: 82.5,
      caption: 'Average: 16.92 at n = 8, matching 2(n+1)H(n) - 4n. Best case: 13.',
      detail: 'The harmonic-number formula 2(n+1)H(n) - 4n gives 16.92 at n = 8, and the model matches it against the average over all 40,320 orderings to two decimals. The best case, a perfectly balanced split, gives 13.',
      keyword: '16.92',
      trap: 'The average case is not the balanced case. A random pivot averages 16.92, while the ideal split gives 13.',
      narration: 'The average is sixteen point nine two at n equals eight, matching two times n plus one times the n-th harmonic number minus four n. The best case is thirteen.',
      visualAction: 'average-vs-best'
    },
    {
      id: 'quick-4', scene: 'quick', start: 82.5, end: 90,
      caption: 'GATE CSE 2014 Set 1 asked for two inputs: {1,2,3,4,5} takes 10 comparisons and {4,1,5,3,2} takes 6, so t1 > t2.',
      detail: 'On the sorted input each partition peels one element: 4 + 3 + 2 + 1 = 10. On the second input the first partition takes 4 and the left side of three elements takes 2, after which both sides are single elements: 4 + 2 = 6. The page computes both with the same partition function it uses for the animation.',
      keyword: '10 and 6',
      trap: 'Counting only the first partition gives 4 for both and makes the answers look equal. The recursion is where the difference lives: it adds 6 to the first input and 2 to the second.',
      narration: 'GATE CSE two thousand fourteen set one asked for two inputs. The sorted one takes ten comparisons and the second takes six, so t one is greater than t two.',
      visualAction: 'replay-2014-inputs'
    },

    /* ---------------- 4. bsearch ---------------- */
    {
      id: 'bs-1', scene: 'bsearch', start: 90, end: 97.5,
      caption: 'Binary search makes one comparison per level, and the range halves each time, so there are floor(lg n) + 1 levels.',
      detail: 'Each comparison either finds the key or halves the remaining range. Halving n until the range is empty takes floor(log base 2 n) + 1 steps, which is also the number of comparisons.',
      keyword: 'floor(lg n) + 1',
      trap: 'ceil(lg n) + 1 is the count including the exit test in some loop forms; the two differ exactly at powers of two.',
      narration: 'Binary search makes one comparison per level, and the range halves each time, so there are floor of log base two n, plus one, levels.',
      visualAction: 'halve-the-range'
    },
    {
      id: 'bs-2', scene: 'bsearch', start: 97.5, end: 105,
      caption: 'Checked against every size and every target up to 64: the worst case is always floor(lg n) + 1, and an unsuccessful search costs the same.',
      detail: 'The model runs binary search on every array size from 1 to 64 and every target, successful and unsuccessful, and records the maximum comparisons. The staircase is floor(lg n) + 1 with no exceptions in that range.',
      keyword: 'floor(lg n) + 1 with no exceptions',
      trap: 'A search that fails is not cheaper. It walks to an empty range, which is the same number of levels.',
      narration: 'Checked against every size and every target up to sixty-four, the worst case is always floor of log base two n plus one, and an unsuccessful search costs the same.',
      visualAction: 'staircase-check'
    },
    {
      id: 'bs-3', scene: 'bsearch', start: 105, end: 112.5,
      caption: 'At n = 1024 that is 11 comparisons: ten halvings reach one element, and the eleventh is the test on it.',
      detail: '1024 halves to 512, 256, 128, 64, 32, 16, 8, 4, 2, 1 — ten halvings — and the single remaining element still needs one test. 10 + 1 = 11, and floor(lg 1024) + 1 = 11.',
      keyword: '11 comparisons',
      trap: 'Saying 10 because 2 to the 10 is 1024 drops the last test. lg n counts halvings, not tests.',
      narration: 'At n equals one thousand and twenty-four that is eleven comparisons: ten halvings reach one element, and the eleventh is the test on it.',
      visualAction: 'count-to-1024'
    },
    {
      id: 'bs-4', scene: 'bsearch', start: 112.5, end: 120,
      caption: 'GATE CSE 2007 Q15 counts a doubling loop: floor(lg n) + 1 is the answer, because the exit test is not a comparison made while the loop runs.',
      detail: 'The loop j = 1; while (j <= n) j = j * 2 makes one comparison for each value 1, 2, 4, ... up to the largest power of two not exceeding n. That is floor(lg n) + 1, which the model confirms for every n from 1 to 64. At n = 15 the count is 4, which is why ceil(lg n) + 1 = 5 is wrong.',
      keyword: 'floor(lg n) + 1',
      trap: 'This is a counting-convention question, not an asymptotics question. Read what the paper says is counted before choosing a formula.',
      narration: 'GATE CSE two thousand seven question fifteen counts a doubling loop. Floor of log base two n plus one is the answer, because the exit test is not a comparison made while the loop runs.',
      visualAction: 'replay-2007-loop'
    },

    /* ---------------- 5. hash ---------------- */
    {
      id: 'hash-1', scene: 'hash', start: 120, end: 127.5,
      caption: 'Ten keys in seven chained slots: the load factor alpha is 10/7 = 1.43.',
      detail: 'Separate chaining keeps a list per slot, so alpha can exceed one. Here seven slots hold ten keys, and the slot for a key is the key modulo seven.',
      keyword: 'alpha is 10/7',
      trap: 'Open addressing cannot reach alpha above one, so a chain example and a probing example are not interchangeable.',
      narration: 'Ten keys in seven chained slots give a load factor of ten over seven, one point four three.',
      visualAction: 'draw-chained-table'
    },
    {
      id: 'hash-2', scene: 'hash', start: 127.5, end: 135,
      caption: 'Successful search: 14 probes over 10 keys, an average of 1.4. Unsuccessful: 17 probes over 7 home slots, an average of 2.43.',
      detail: 'A key found at position p of its chain costs p probes, and the ten keys cost 1+2+1+1+1+1+2+1+2+2 = 14. An unsuccessful search walks the whole chain and then sees the null, costing one more than the chain length: 3+3+1+2+3+3+2 = 17 over seven slots.',
      keyword: '1.4 and 2.43',
      trap: 'The unsuccessful count is one more than the chain length, because the terminating null still has to be read.',
      narration: 'Successful search costs fourteen probes over ten keys, an average of one point four. Unsuccessful costs seventeen probes over seven home slots, an average of two point four three.',
      visualAction: 'count-probes'
    },
    {
      id: 'hash-3', scene: 'hash', start: 135, end: 142.5,
      caption: 'The estimates 1 + alpha/2 and alpha are averages over random hash functions, not predictions for one table.',
      detail: 'Uniform hashing assumes every probe sequence is equally likely. Under that assumption a successful search costs about 1 + alpha/2 = 1.71 and an unsuccessful one about alpha = 1.43. This particular table does better on the first and worse on the second, and both are consistent with the estimates.',
      keyword: 'averages over random hash functions',
      trap: 'Using alpha as an exact answer for a stated table is the error. A stated table is counted by simulation.',
      narration: 'The estimates one plus alpha over two and alpha are averages over random hash functions, not predictions for one table.',
      visualAction: 'formula-vs-table'
    },
    {
      id: 'hash-4', scene: 'hash', start: 142.5, end: 150,
      caption: 'For open addressing the estimate is 1/(1 - alpha), which is 2 at alpha = 0.5 and 10 at alpha = 0.9. GATE DS&AI 2024 Q11 asked exactly this.',
      detail: 'An insertion probes until it finds an empty slot, which is the same walk as an unsuccessful search, so the two share the estimate 1/(1 - alpha). The GATE DS&AI 2024 item gives that formula and asks for the insertion cost; the answer is the same formula.',
      keyword: '1/(1 - alpha)',
      trap: 'The successful-search figure is smaller than the insertion figure. Using it for an insertion understates the cost.',
      narration: 'For open addressing the estimate is one over one minus alpha, which is two at alpha equals nought point five and ten at nought point nine. GATE DS and AI two thousand twenty-four question eleven asked exactly this.',
      visualAction: 'open-addressing-curve'
    },

    /* ---------------- 6. cache ---------------- */
    {
      id: 'cache-1', scene: 'cache', start: 150, end: 157.5,
      caption: 'Sixteen words in a four-by-four array, block size four words, a two-block cache. One block transfer per miss.',
      detail: 'A block holds four words, which is exactly one row of the array. The cache holds two blocks, so only two rows can be resident at once. A miss costs one block transfer; a hit costs none.',
      keyword: 'one block transfer per miss',
      trap: 'A block transfer moves a whole block. Counting transfers per word instead of per block multiplies the answer by four.',
      narration: 'Sixteen words in a four by four array, block size four words, a two-block cache. One block transfer per miss.',
      visualAction: 'draw-array-and-cache'
    },
    {
      id: 'cache-2', scene: 'cache', start: 157.5, end: 165,
      caption: 'Row-major order: 4 misses and 12 hits, because each block is used four times before it is evicted.',
      detail: 'The accesses walk words 0 to 15 in order. Words 0 to 3 are one block, so the first access misses and the next three hit; the same for the three remaining blocks. 4 transfers for 16 accesses.',
      keyword: '4 misses and 12 hits',
      trap: 'The first access to each block always misses. Sixteen accesses to four blocks cannot cost fewer than four transfers.',
      narration: 'Row-major order gives four misses and twelve hits, because each block is used four times before it is evicted.',
      visualAction: 'walk-row-major'
    },
    {
      id: 'cache-3', scene: 'cache', start: 165, end: 172.5,
      caption: 'Column-major order: 16 misses and no hits. Every consecutive access wants a different row, and the cache holds two.',
      detail: 'The accesses are 0, 4, 8, 12, then 1, 5, 9, 13, and so on. Consecutive accesses are in different blocks, so after two blocks are loaded the next access evicts one. Sixteen accesses, sixteen transfers.',
      keyword: '16 misses and no hits',
      trap: 'The same array and the same cache give four times the traffic. Traversal order is part of the count.',
      narration: 'Column-major order gives sixteen misses and no hits. Every consecutive access wants a different row, and the cache holds two.',
      visualAction: 'walk-column-major'
    },
    {
      id: 'cache-4', scene: 'cache', start: 172.5, end: 180,
      caption: 'Turn the count into a time: with a one-cycle hit and a 40-cycle miss penalty, average access time is 11 cycles row-major and 41 column-major.',
      detail: 'Average memory access time is hit time plus miss rate times miss penalty. Row-major: 1 + 0.25 times 40 = 11. Column-major: 1 + 1.0 times 40 = 41. The same formula the memory-hierarchy lesson uses, fed with this lesson\'s counts.',
      keyword: '11 and 41 cycles',
      trap: 'Multiplying the miss penalty by the number of misses rather than by the miss rate gives 160 and 640. The formula wants a rate.',
      narration: 'Turn the count into a time: with a one-cycle hit and a forty-cycle miss penalty, average access time is eleven cycles row-major and forty-one column-major.',
      visualAction: 'compute-amat'
    },

    /* ---------------- 7. dp ---------------- */
    {
      id: 'dp-1', scene: 'dp', start: 180, end: 187.5,
      caption: 'Matrix-chain multiplication on five matrices: the subproblems are the contiguous ranges, and there are 5 times 4 / 2 = 10 of them.',
      detail: 'A subproblem is a chain i..j with i at most j. Choosing two of the five boundaries gives 10 intervals of length at least two, plus the 5 single matrices whose cost is zero. The table is a triangle, so the count is the number of pairs.',
      keyword: '5 times 4 / 2 = 10',
      trap: 'The count is pairs of boundaries, not n squared. A square table would over-count by the diagonal and by one half.',
      narration: 'Matrix-chain multiplication on five matrices has ten subproblems: the contiguous ranges, counted as five times four over two.',
      visualAction: 'draw-triangle-table'
    },
    {
      id: 'dp-2', scene: 'dp', start: 187.5, end: 195,
      caption: 'Filling it costs one split test per possible break: 4 + 6 + 6 + 4 = 20 split points, which is n(n squared - 1)/6.',
      detail: 'A chain of length L has n - L + 1 positions and L - 1 break points, so the total is the sum over L of (n - L + 1)(L - 1). At n = 5 that is 4 + 6 + 6 + 4 = 20, matching n(n squared - 1)/6 = 20, and the model checks both at every n from 2 to 10.',
      keyword: '20 split points',
      trap: 'The number of cells is quadratic and the number of transitions is cubic. The paper usually asks for one of them, not both.',
      narration: 'Filling it costs one split test per possible break, twenty split points, which is n times n squared minus one over six.',
      visualAction: 'count-splits'
    },
    {
      id: 'dp-3', scene: 'dp', start: 195, end: 202.5,
      caption: 'A different shape, a different count: LCS on strings of length 4 and 5 fills (4+1)(5+1) = 30 cells.',
      detail: 'The LCS table has one row per prefix of the first string and one column per prefix of the second, including the empty prefix. 5 rows times 6 columns is 30 cells, and each cell reads three neighbours, so the transition count is 3 times 30.',
      keyword: '30 cells',
      trap: 'Dropping the empty row and column gives 20. The base row and column are what make the recurrence total.',
      narration: 'A different shape, a different count: LCS on strings of length four and five fills thirty cells, five rows by six columns.',
      visualAction: 'draw-lcs-grid'
    },
    {
      id: 'dp-4', scene: 'dp', start: 202.5, end: 210,
      caption: 'The rule: cells are counted from the table\'s shape, transitions from what each cell reads. Neither is a complexity class.',
      detail: 'Both counts are exact and both are asked. A quadratic cell count with a constant read per cell gives quadratic work, which is why the two numbers usually move together — but a cell that reads many neighbours breaks that link.',
      keyword: 'from the table\'s shape',
      trap: 'Writing n cubed for matrix chain because the algorithm is cubic, when the question asks for the number of subproblems, which is quadratic.',
      narration: 'The rule: cells are counted from the shape of the table, transitions from what each cell reads. Neither is a complexity class.',
      visualAction: 'cells-vs-transitions'
    },

    /* ---------------- 8. karatsuba ---------------- */
    {
      id: 'kar-1', scene: 'karatsuba', start: 210, end: 217.5,
      caption: 'Schoolbook multiplication of two n-digit numbers makes four half-size products, so at depth k there are 4 to the k scalar products.',
      detail: 'Writing each number as a high half and a low half, the product needs high-high, high-low, low-high and low-low. Four recursive calls per level, so the count at depth k is 4 to the k.',
      keyword: '4 to the k',
      trap: 'The four calls are the multiplication count. The additions are a different unit and are usually ignored by the question.',
      narration: 'Schoolbook multiplication makes four half-size products, so at depth k there are four to the k scalar products.',
      visualAction: 'schoolbook-tree'
    },
    {
      id: 'kar-2', scene: 'karatsuba', start: 217.5, end: 225,
      caption: 'Karatsuba reuses two products to get the middle term, so there are only 3 to the k: 243 against 1024 at k = 5.',
      detail: 'The middle term is (x1+x0)(y1+y0) - x1y1 - x0y0, which needs one new product instead of two. Three calls per level gives 3 to the k: 3 to the 5 is 243 and 4 to the 5 is 1024.',
      keyword: '243 against 1024',
      trap: 'Karatsuba is not free: it adds more additions. The win is in multiplications only, and on real machines that is not always the binding cost.',
      narration: 'Karatsuba reuses two products to get the middle term, so there are only three to the k: two hundred and forty-three against one thousand and twenty-four at k equals five.',
      visualAction: 'karatsuba-tree'
    },
    {
      id: 'kar-3', scene: 'karatsuba', start: 225, end: 232.5,
      caption: 'The exponent is log base 2 of 3 = 1.585, and the model checks the identity 3 to the k equals n to the 1.585 at n = 1024.',
      detail: 'The leaves of the recursion are 3 to the k with n = 2 to the k, so the leaf count as a function of n is n to the power log base 2 of 3. At n = 1024, k = 10, 3 to the 10 = 59049, and 1024 to the 1.585 rounds to the same number.',
      keyword: 'log base 2 of 3 = 1.585',
      trap: '1.585 is an exponent, not a rate. Writing 1.585 n is meaningless; the count is n to that power.',
      narration: 'The exponent is log base two of three, one point five eight five, and the model checks that three to the k equals n to the one point five eight five at n equals one thousand and twenty-four.',
      visualAction: 'exponent-check'
    },
    {
      id: 'kar-4', scene: 'karatsuba', start: 232.5, end: 240,
      caption: 'At n = 1024 the two counts are 59049 and 1048576 — a factor of about 18, from one changed call.',
      detail: '3 to the 10 is 59049 and 4 to the 10 is 1048576. The ratio is about 17.8, and it grows without bound, which is what an exponent difference of 0.415 means in the long run.',
      keyword: 'a factor of about 18',
      trap: 'The ratio is not constant. It grows with n, so a small test case understates the gain.',
      narration: 'At n equals one thousand and twenty-four the two counts are fifty-nine thousand and forty-nine, and one million forty-eight thousand five hundred and seventy-six: a factor of about eighteen, from one changed call.',
      visualAction: 'compare-final-counts'
    },

    /* ---------------- 9. one n ---------------- */
    {
      id: 'one-1', scene: 'one-n', start: 240, end: 247.5,
      caption: 'One size, 1024 elements, and four questions. Binary search: 11 comparisons.',
      detail: 'floor(lg 1024) + 1 = 11. That is the whole cost of finding one key in a sorted array of 1024.',
      keyword: '11 comparisons',
      trap: 'Eleven is not a small version of the sort counts. It is a different operation on the same data.',
      narration: 'One size, one thousand and twenty-four elements, and four questions. Binary search: eleven comparisons.',
      visualAction: 'tile-binary-search'
    },
    {
      id: 'one-2', scene: 'one-n', start: 247.5, end: 255,
      caption: 'Merge sort: 10240 units of work, and at most 9217 comparisons in the worst case.',
      detail: '1024 times 10 levels is 10240 units. The worst-case comparison formula gives 1024 times 10, minus 1024, plus 1, which is 9217. The two numbers differ by 1023, exactly the number of merges.',
      keyword: '10240 and 9217',
      trap: 'The gap between work and comparisons grows with n. At n = 8 it was 7; at n = 1024 it is 1023.',
      narration: 'Merge sort: ten thousand two hundred and forty units of work, and at most nine thousand two hundred and seventeen comparisons in the worst case.',
      visualAction: 'tile-merge'
    },
    {
      id: 'one-3', scene: 'one-n', start: 255, end: 262.5,
      caption: 'Quicksort worst case: 1024 times 1023 / 2 = 523776 comparisons. Cache: 1024 words in 256 blocks is 256 transfers.',
      detail: 'The worst case is the number of pairs, which is 523776. A sequential scan of 1024 words in blocks of four touches 256 distinct blocks, so 256 transfers if nothing is cached beforehand.',
      keyword: '523776 and 256',
      trap: 'The cache number depends on block size and traversal order; 256 is for a sequential scan with block size four.',
      narration: 'Quicksort worst case: five hundred and twenty-three thousand seven hundred and seventy-six comparisons. The cache: two hundred and fifty-six block transfers.',
      visualAction: 'tile-quick-and-cache'
    },
    {
      id: 'one-4', scene: 'one-n', start: 262.5, end: 270,
      caption: 'Karatsuba: 59049 multiplications, against 1048576 for the schoolbook method. Four correct answers, one n.',
      detail: 'Each of the four numbers is right for its own unit and its own operation, and each would be wrong for the other three. That is the whole lesson: the unit is part of the question.',
      keyword: 'one n',
      trap: 'Any of these four numbers looks plausible on the answer sheet. Only the unit in the question tells you which one is wanted.',
      narration: 'Karatsuba: fifty-nine thousand and forty-nine multiplications, against one million forty-eight thousand five hundred and seventy-six. Four correct answers, one n.',
      visualAction: 'four-tiles-summary'
    },

    /* ---------------- 10. procedure ---------------- */
    {
      id: 'proc-1', scene: 'procedure', start: 270, end: 277.5,
      caption: 'Step 1 and 2: name the unit, then count the units in one level, one partition, one call.',
      detail: 'A merge has one comparison per element taken from a list. A partition has one per element other than the pivot. A binary search step has one per halving. A cache miss is one transfer.',
      keyword: 'name the unit',
      trap: 'Starting from a formula you remember is how the unit gets chosen for you by accident.',
      narration: 'Step one and two: name the unit, then count the units in one level, one partition, one call.',
      visualAction: 'step-one-two'
    },
    {
      id: 'proc-2', scene: 'procedure', start: 277.5, end: 285,
      caption: 'Step 3 and 4: multiply by the structure\'s own identity, then reach the same integer a second way.',
      detail: 'The identities are the ones this page used: n - 1 per partition, floor(lg n) + 1 levels, n(n-1)/2 pairs, the chain length plus the null. The second route is a closed form, an enumeration, or a simulation.',
      keyword: 'a second way',
      trap: 'Two routes that share an assumption are one route. Enumerate a different quantity, or use a different formula.',
      narration: 'Step three and four: multiply by the structure identity, then reach the same integer a second way.',
      visualAction: 'step-three-four'
    },
    {
      id: 'proc-3', scene: 'procedure', start: 285, end: 292.5,
      caption: 'The five traps: work for comparisons, the root counted as a level, lg n without its plus one, a rate used as a count, a table\'s average used as its answer.',
      detail: 'Each trap has a counterexample on the Edge cases tab: 24 against 17, four levels against three, 10 against 11 at n = 1024, 160 against 11 for the cache, and 1.43 against 2.43 for the stated hash table.',
      keyword: 'the five traps',
      trap: 'All five produce an answer that is one line of arithmetic away from correct, which is why they are worth a mark.',
      narration: 'The five traps: work for comparisons, the root counted as a level, log n without its plus one, a rate used as a count, and a table average used as its answer.',
      visualAction: 'list-five-traps'
    },
    {
      id: 'proc-4', scene: 'procedure', start: 292.5, end: 300,
      caption: 'Nothing here replaces the asymptotic class. The class tells you what grows; the count tells you what the paper is asking for.',
      detail: 'A GATE question usually states an input and wants an integer. The class is what makes the integer predictable across sizes; the count is what goes on the answer sheet. Keep both, and keep them apart.',
      keyword: 'what grows, and what is asked',
      trap: 'Answering a count question with a complexity class, or a complexity question with a number, is the same error in two directions.',
      narration: 'Nothing here replaces the asymptotic class. The class tells you what grows; the count tells you what the paper is asking for.',
      visualAction: 'close'
    }
  ]
};
