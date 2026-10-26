/* ==========================================================================
   binary-search-and-variants - THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs - never edited by hand.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'halving',
      n: 1,
      title: 'Halving the problem: 16 cells, 4 probes',
      start: 0, end: 30,
      objective: 'See the one move binary search makes - compare with the middle, then throw away half - and count the probes it costs on 16 cells.'
    },
    {
      id: 'invariant',
      n: 2,
      title: 'The invariant: the answer never leaves [lo, hi]',
      start: 30, end: 60,
      objective: 'Name the single sentence that makes the loop correct, and see how each of the three comparison outcomes moves a boundary without breaking it.'
    },
    {
      id: 'trace',
      n: 3,
      title: 'A full trace, including the miss',
      start: 60, end: 90,
      objective: 'Run the loop to the end on two targets, one present and one absent, and see exactly which comparison ends each run.'
    },
    {
      id: 'counts',
      n: 4,
      title: 'How many comparisons: floor(log2 n) + 1',
      start: 90, end: 120,
      objective: 'Derive the worst-case count from the recurrence F(n) = F(floor(n/2)) + 1, read the table, and separate best, worst and average.'
    },
    {
      id: 'loops',
      n: 5,
      title: 'Two loop shapes, two mid formulas, one infinite loop',
      start: 120, end: 150,
      objective: 'Match the loop condition to the boundary update, and see the two classic code faults - the stuck pointer and the overflowing sum - as concrete states.'
    },
    {
      id: 'bounds',
      n: 6,
      title: 'lower_bound and upper_bound: the duplicates problem',
      start: 150, end: 180,
      objective: 'Search a sorted array with repeats and answer "first occurrence" and "insertion point", which is the shape GATE 2014 Set 3 used.'
    },
    {
      id: 'rotated',
      n: 7,
      title: 'A rotated sorted array still gives up in log n',
      start: 180, end: 210,
      objective: 'Decide which half is sorted by comparing one endpoint with the middle, and keep the log n bound on a rotated array.'
    },
    {
      id: 'peak',
      n: 8,
      title: 'Bitonic arrays: find the peak, then two searches',
      start: 210, end: 240,
      objective: 'Split the problem into a peak search and two monotone searches, add the costs rather than multiply them, and reach Theta(log n).'
    },
    {
      id: 'predicate',
      n: 9,
      title: 'Binary search on the answer, not on the array',
      start: 240, end: 270,
      objective: 'Recognise a monotone yes/no predicate, and use binary search on the value range when no array is sorted at all.'
    },
    {
      id: 'lowerbound',
      n: 10,
      title: 'Why log n is a wall, and the decision procedure',
      start: 270, end: 300,
      objective: 'Count the outcomes to get the decision-tree lower bound, then run the five-question checklist that answers any binary-search item.'
    }
  ],

  events: [
    /* ---------------- scene 1: halving ---------------- */
    {
      id: 'halving-1', start: 0, end: 7.5, scene: 'halving',
      caption: 'Sixteen sorted cells, one target. Linear search would touch up to sixteen of them.',
      detail: 'The array holds 3, 7, 11, 14, 19, 23, 27, 31, 35, 39, 43, 47, 51, 55, 59, 63 in ascending order. A linear scan starts at the left end and compares cell by cell, so a target near the right end costs sixteen comparisons.',
      keyword: 'up to sixteen',
      trap: 'Sorted order is the licence for everything in this lesson. On an unsorted array binary search is not slower - it is simply wrong.',
      narration: 'Sixteen sorted cells and one target. A linear scan would compare up to sixteen of them, one at a time.'
    },
    {
      id: 'halving-2', start: 7.5, end: 15, scene: 'halving',
      caption: 'Probe the middle. One comparison tells you which half the target must be in.',
      detail: 'The middle of indices 0 to 15 is index 7, holding 31. Comparing 43 with 31 gives one fact with two consequences: 43 is larger, so it cannot be at index 7 or anywhere left of it, because everything left of 31 is smaller than 31.',
      keyword: 'one comparison tells you which half',
      trap: 'The comparison is against the middle element, not against the middle index. A question that asks how many comparisons is asking about element comparisons.',
      narration: 'Probe the middle cell, which holds thirty-one. Forty-three is larger, so it cannot be in the left half.'
    },
    {
      id: 'halving-3', start: 15, end: 22.5, scene: 'halving',
      caption: 'Eight cells left. Halve again: 47 is too big, so the answer is in 35 to 43.',
      detail: 'The live region is now indices 8 to 15. Its middle is index 11, holding 47. Since 43 is smaller than 47, the right half of the live region is discarded as well, leaving indices 8 to 10.',
      keyword: 'halve again',
      trap: 'Sixteen cells do not need four halvings to reach one cell - they need four probes, because the last probe compares the single remaining cell.',
      narration: 'Eight cells left. Probe again: forty-seven is too big, so the answer lies between thirty-five and forty-three.'
    },
    {
      id: 'halving-4', start: 22.5, end: 30, scene: 'halving',
      caption: 'Four probes on 16 cells. Doubling the array costs one more probe, never twice as many.',
      detail: 'The count for 16 cells is 4, and 16 is 2 to the power 4. For 32 cells the count is 5. That is the whole content of the phrase logarithmic time: the cost grows with the number of times you can halve, not with the number of cells.',
      keyword: 'one more probe',
      trap: 'A common misreading is that binary search is O(log n) so it is always faster. For n = 8 and a target at the first cell, linear search wins with one comparison against four.',
      narration: 'Four probes on sixteen cells. Double the array and you pay one more probe, not twice as many.'
    },

    /* ---------------- scene 2: invariant ---------------- */
    {
      id: 'invariant-1', start: 30, end: 37.5, scene: 'invariant',
      caption: 'Three indices, one sentence: if the target is in the array at all, it sits inside [lo, hi].',
      detail: 'The invariant is a statement that is true before the loop starts, stays true after every iteration, and is strong enough at the end to give the answer. Everything outside lo to hi has already been proved not to hold the target.',
      keyword: 'inside [lo, hi]',
      trap: 'The invariant is about the target, not about the answer index. If the target is absent, the invariant is true but says nothing useful - which is why absence needs its own exit.',
      narration: 'Three indices and one sentence. If the target is in the array at all, it lies between lo and hi.'
    },
    {
      id: 'invariant-2', start: 37.5, end: 45, scene: 'invariant',
      caption: 'Equal: stop. Smaller than the middle: the answer is left. Larger: the answer is right.',
      detail: 'A three-way comparison is one element comparison with three outcomes. The equal outcome terminates; the other two each discard the middle cell and one whole side, which is what keeps the invariant true.',
      keyword: 'three-way comparison',
      trap: 'Writing two comparisons instead of three - testing only for equality and then for less-than - can double the comparison count. The count a question asks about is usually element comparisons.',
      narration: 'Equal and you stop. Smaller than the middle and the answer is to the left. Larger and it is to the right.'
    },
    {
      id: 'invariant-3', start: 45, end: 52.5, scene: 'invariant',
      caption: 'The middle cell is excluded from both new ranges, because it has just been tested.',
      detail: 'lo becomes mid + 1 and hi becomes mid - 1, never mid. Including mid again would leave a range that can fail to shrink, which is the fault shown in scene 5.',
      keyword: 'excluded from both new ranges',
      trap: 'lo = mid and hi = mid are correct in the other loop shape, where the range is a half-open insertion window. Copying an update from one shape into the other is the single commonest binary-search bug.',
      narration: 'The middle cell is dropped from both new ranges, because it has just been compared.'
    },
    {
      id: 'invariant-4', start: 52.5, end: 60, scene: 'invariant',
      caption: 'When lo passes hi the range is empty, the invariant is still true, and the answer is "absent".',
      detail: 'An empty range cannot contain the target, so the loop exits with a proof of absence rather than a guess. This is why the exit condition and the invariant must be read together: the loop ends either at equality or at emptiness.',
      keyword: 'the answer is absent',
      trap: 'A program that returns the last probed index after the loop instead of -1 reports a false hit. Check the exit value, not only the loop body.',
      narration: 'When lo passes hi the range is empty. The invariant still holds, and the honest answer is that the target is absent.'
    },

    /* ---------------- scene 3: trace ---------------- */
    {
      id: 'trace-1', start: 60, end: 67.5, scene: 'trace',
      caption: 'Trace one: find 27 in sixteen cells. The table records lo, hi, mid and the verdict of each probe.',
      detail: 'Indices 0 to 15 hold 3, 7, 11, 14, 19, 23, 27, 31, 35, 39, 43, 47, 51, 55, 59, 63. Each row of the table is one element comparison, so the number of rows is the comparison count.',
      keyword: 'the table records lo, hi, mid',
      trap: 'A trace table is a proof only when every row is justified. In an exam, one wrong row usually means a wrong count, and the count is what is marked.',
      narration: 'Trace one: find twenty-seven. The table records lo, hi, mid and the verdict of each probe.'
    },
    {
      id: 'trace-2', start: 67.5, end: 75, scene: 'trace',
      caption: 'Probe 31, then 14, then 23, then 27: four comparisons, and the fourth is the hit.',
      detail: 'Index 7 holds 31 and 27 is smaller, so hi becomes 6. Index 3 holds 14 and 27 is larger, so lo becomes 4. Index 5 holds 23 and 27 is larger, so lo becomes 6. Index 6 holds 27 and the search stops.',
      keyword: 'four comparisons',
      trap: 'The count includes the successful comparison. Students who count only the discarded probes answer three.',
      narration: 'Probe thirty-one, then fourteen, then twenty-three, then twenty-seven. Four comparisons, and the fourth is the hit.'
    },
    {
      id: 'trace-3', start: 75, end: 82.5, scene: 'trace',
      caption: 'Trace two: find 25, which is not there. The loop empties the range in four probes.',
      detail: 'The same four probes narrow the range to a single cell, index 6 holding 27. The comparison says 25 is smaller, so hi becomes 5 and lo is already 6. The range is empty and the answer is -1.',
      keyword: 'which is not there',
      trap: 'A miss costs at most the same as the worst hit, ceil(log2(n+1)) comparisons. It never costs more, which is why an unsuccessful search does not change the complexity.',
      narration: 'Trace two: find twenty-five, which is not present. Four probes empty the range and the answer is minus one.'
    },
    {
      id: 'trace-4', start: 82.5, end: 90, scene: 'trace',
      caption: 'Both runs used the same number of probes. Success and failure are not different costs here.',
      detail: 'The number of comparisons is bounded by the height of the comparison tree, and every root-to-leaf path in that tree has a similar length. This is what makes binary search predictable, unlike quicksort.',
      keyword: 'not different costs',
      trap: 'Do not assume a hit is cheaper than a miss. The bound is on both, and it is the same bound.',
      narration: 'Both runs used the same number of probes. Here, success and failure cost the same.'
    },

    /* ---------------- scene 4: counts ---------------- */
    {
      id: 'counts-1', start: 90, end: 97.5, scene: 'counts',
      caption: 'One comparison, then the same problem on half the cells: F(n) = F(floor(n/2)) + 1.',
      detail: 'The recurrence is the honest description of the code. One probe removes the middle cell, and the larger of the two remaining pieces has floor(n/2) cells, because floor((n-1)/2) and floor(n/2) differ by at most one and the larger is floor(n/2).',
      keyword: 'on half the cells',
      trap: 'F(n) = 2F(n/2) + 1 describes an algorithm that searches both halves. Binary search searches one, so the coefficient is 1, not 2.',
      narration: 'One comparison, then the same problem on half the cells. That is the recurrence, with a coefficient of one.'
    },
    {
      id: 'counts-2', start: 97.5, end: 105, scene: 'counts',
      caption: 'Unrolling gives floor(log2 n) + 1, and the table confirms it for n = 1 to 16.',
      detail: 'Each unrolling step adds one and halves the argument, and the argument reaches 0 after floor(log2 n) halvings. The closed form matches an exhaustive count of every target on every array up to nine cells.',
      keyword: 'floor(log2 n) + 1',
      trap: 'The +1 is the last probe. Answers that omit it are off by one at every power of two, which is exactly where examiners put the numbers.',
      narration: 'Unrolling gives floor of log base two of n, plus one. The table confirms it from one cell to sixteen.'
    },
    {
      id: 'counts-3', start: 105, end: 112.5, scene: 'counts',
      caption: 'floor(log2 n) + 1 and ceil(log2(n+1)) agree for every n, so both answer forms are safe.',
      detail: 'The two expressions are equal for every positive integer n, checked up to one million. One comes from the recurrence, the other from counting the levels of a comparison tree; they meet because the tree is nearly complete.',
      keyword: 'agree for every n',
      trap: 'ceil(log2 n) is a different number: for n = 8 it gives 3 while the true worst case is 4. If a question quotes that form, it is counting probes to reduce to one cell, not comparisons.',
      narration: 'The floor form and the ceiling form agree for every n, so either is safe as an answer.'
    },
    {
      id: 'counts-4', start: 112.5, end: 120, scene: 'counts',
      caption: 'Best case is one probe. Average depends on which targets you assume, so state the assumption.',
      detail: 'For a uniform target over 15 cells the average is 3.27 comparisons, and over 31 cells it is 4.16. The average is close to the worst case, unlike linear search where the average is half the worst case.',
      keyword: 'depends on which targets you assume',
      trap: 'An average case with no stated distribution is not a well-defined number. In a GATE option list, the worst case is the answer unless the stem names a distribution.',
      narration: 'The best case is one probe. The average depends on the targets you assume, so any average answer must state that assumption.'
    },

    /* ---------------- scene 5: loops ---------------- */
    {
      id: 'loops-1', start: 120, end: 127.5, scene: 'loops',
      caption: 'Shape one: lo <= hi, hi = mid - 1. Shape two: lo < hi, hi = mid. Both are correct.',
      detail: 'Shape one searches a closed range of candidate indices and exits when the range is empty. Shape two searches a half-open window of possible answers and exits with lo = hi pointing at the answer. Each shape has its own matching boundary updates.',
      keyword: 'both are correct',
      trap: 'The shapes are not interchangeable line by line. Mixing the condition of one with the updates of the other is what produces the bugs below.',
      narration: 'Shape one uses lo less than or equal to hi and sets hi to mid minus one. Shape two uses lo less than hi and sets hi to mid. Both are correct, with their own updates.'
    },
    {
      id: 'loops-2', start: 127.5, end: 135, scene: 'loops',
      caption: 'Bug one: lo = mid inside lo < hi. When hi = lo + 1 the middle is lo, and nothing moves.',
      detail: 'With mid = floor((lo+hi)/2) and hi = lo + 1, mid equals lo. If the code then sets lo = mid, lo is unchanged, hi is unchanged, and the loop repeats for ever. Setting lo = mid + 1 removes the state instead.',
      keyword: 'nothing moves',
      trap: 'This bug only shows up on an even-sized final window, so a test with an odd array size passes. Test n = 2.',
      narration: 'Bug one: setting lo to mid inside a lo less than hi loop. When hi is lo plus one, the middle is lo and nothing moves.'
    },
    {
      id: 'loops-3', start: 135, end: 142.5, scene: 'loops',
      caption: 'Bug two: (lo + hi) / 2 overflows. With 32-bit ints the sum turns negative above 2^31 - 1.',
      detail: 'At lo = 1,500,000,000 and hi = 1,600,000,000 the sum is 3,100,000,000, which wraps to -1,194,967,296 as a signed 32-bit integer. Halving it gives a negative index. lo + (hi - lo)/2 computes 1,550,000,000 correctly.',
      keyword: 'overflows',
      trap: 'This is a real reported defect, not a puzzle: the standard Java library binary search carried it for years. In an exam it appears as "what is wrong with this function".',
      narration: 'Bug two: adding lo and hi before halving. With thirty-two-bit integers the sum goes negative past two to the thirty-first, and the index is garbage.'
    },
    {
      id: 'loops-4', start: 142.5, end: 150, scene: 'loops',
      caption: 'Mid by floor or by ceiling: with lo < hi and hi = mid, use the floor. The ceiling can stall.',
      detail: 'With mid = ceil((lo+hi)/2) and hi = mid, the state lo = 0, hi = 1 gives mid = 1, so hi stays 1 and the loop stalls. The floor rounding is what makes the hi = mid update safe in the half-open shape.',
      keyword: 'the floor',
      trap: 'In the closed shape lo <= hi both roundings terminate, so the rounding question only matters in the half-open shape. Know which shape you are reading.',
      narration: 'Floor or ceiling for the middle? With lo less than hi and hi set to mid, the floor is what keeps the loop shrinking.'
    },

    /* ---------------- scene 6: bounds ---------------- */
    {
      id: 'bounds-1', start: 150, end: 157.5, scene: 'bounds',
      caption: 'With repeats, "found" is ambiguous. Three different questions hide behind one array.',
      detail: 'The array 4, 8, 8, 8, 12, 16 contains three copies of 8. Does the answer want any copy, the first copy, or the position where a new 8 would be inserted? Each is a different function and each needs a slightly different loop.',
      keyword: 'is ambiguous',
      trap: 'A question that says "binary search" and an array with duplicates is almost always asking about the first or last occurrence. Read the stem for "first", "last" or "count".',
      narration: 'With repeated values, the word found is ambiguous. There are three different questions hiding behind one array.'
    },
    {
      id: 'bounds-2', start: 157.5, end: 165, scene: 'bounds',
      caption: 'lower_bound: the first index whose value is not less than the target. The array need not contain it.',
      detail: 'The test is a[mid] < x, which sends lo to mid + 1 and hi to mid. The loop ends with lo = hi at the first index whose value is at least x, so it is also the insertion point. On 4, 8, 8, 8, 12, 16 with target 8 it returns index 1.',
      keyword: 'first index whose value is not less than',
      trap: 'lower_bound does not tell you whether the value is present. You must check arr[result] == target afterwards, and the result may be n, one past the end.',
      narration: 'Lower bound gives the first index whose value is not less than the target. It is also where the target would be inserted.'
    },
    {
      id: 'bounds-3', start: 165, end: 172.5, scene: 'bounds',
      caption: 'upper_bound: the first index whose value is greater. Its difference from lower_bound counts the copies.',
      detail: 'Changing the test to a[mid] <= x sends lo past every copy, so upper_bound of 8 in 4, 8, 8, 8, 12, 16 is index 4. The number of copies is 4 - 1 = 3, which answers "how many times does x occur" in two logarithmic searches.',
      keyword: 'the first index whose value is greater',
      trap: 'upper_bound minus lower_bound counts occurrences, not positions. A question asking for the last occurrence wants upper_bound minus one, and only after checking the count is non-zero.',
      narration: 'Upper bound gives the first index whose value is greater than the target. Subtracting gives the number of copies.'
    },
    {
      id: 'bounds-4', start: 172.5, end: 180, scene: 'bounds',
      caption: 'One loop can do both: shrink on the right when the value is big enough, on the left when it is small enough.',
      detail: 'The GATE 2014 Set 3 question showed a loop with two if statements, one setting hi = k - 1 when x <= listA[k] and one setting i = k + 1 when listA[k] <= x. Both conditions hold exactly when the value is equal, so the loop exits on a match or on an empty range.',
      keyword: 'one loop can do both',
      trap: 'Two independent if statements are not the same as an if-else chain. Here the overlap is deliberate: it is how the loop terminates on equality.',
      narration: 'A single loop can do both, shrinking from the right when the value is big enough and from the left when it is small enough.'
    },

    /* ---------------- scene 7: rotated ---------------- */
    {
      id: 'rotated-1', start: 180, end: 187.5, scene: 'rotated',
      caption: 'A rotated sorted array is two sorted runs. 43, 47, 51, 3, 7, 11, 14 is one example.',
      detail: 'Rotating a sorted array moves a prefix to the back. The result is not sorted, so a plain binary search can discard the half that holds the target. The structure that survives is that at least one of the two halves around the middle is sorted.',
      keyword: 'two sorted runs',
      trap: 'A rotated array is not "nearly sorted" in the sense that helps quicksort. The only property binary search can use is the sortedness of one half at each step.',
      narration: 'A rotated sorted array is two sorted runs joined end to end. Plain binary search would discard the half that holds the target.'
    },
    {
      id: 'rotated-2', start: 187.5, end: 195, scene: 'rotated',
      caption: 'Compare the left end with the middle. If the left end is smaller, the left half is the sorted one.',
      detail: 'In 43, 47, 51, 3, 7, 11, 14 the left end is 43 and the middle is 3. Since 43 is greater than 3, the rotation point lies inside the left half, so the right half is the sorted run.',
      keyword: 'the left half is the sorted one',
      trap: 'Use <= rather than < when the array may hold duplicates. With distinct values the two tests agree; with repeats the strict test can misclassify a sorted half.',
      narration: 'Compare the left end with the middle. If the left end is the smaller, the left half is the sorted run.'
    },
    {
      id: 'rotated-3', start: 195, end: 202.5, scene: 'rotated',
      caption: 'If the target lies inside the sorted run, go there. Otherwise go to the other half.',
      detail: 'Once the sorted run is identified, a single range test decides whether the target can be in it: for an ascending run from a to b, the test is a <= x < b. That test is a fact about a sorted range, so it is exact, not heuristic.',
      keyword: 'inside the sorted run',
      trap: 'The test must be written with the run boundaries of the sorted side. Applying the ascending test to the unsorted side silently gives wrong answers, not a wrong count.',
      narration: 'If the target lies inside the sorted run, go there. Otherwise go to the other half, which must contain it.'
    },
    {
      id: 'rotated-4', start: 202.5, end: 210, scene: 'rotated',
      caption: 'The bound is unchanged: one comparison plus one half. Rotation costs nothing asymptotically.',
      detail: 'Every iteration still discards about half of the live range, so the recurrence is the same and the worst case is still floor(log2 n) + 1 comparisons. An exhaustive check on every rotation of every array up to seven cells finds no wrong answer.',
      keyword: 'costs nothing asymptotically',
      trap: 'Rotation changes the constant, not the class. An option saying Theta(n) for a rotated array with distinct values is wrong.',
      narration: 'The bound is unchanged. Rotation costs a constant amount of extra reasoning, not extra asymptotic time.'
    },

    /* ---------------- scene 8: peak ---------------- */
    {
      id: 'peak-1', start: 210, end: 217.5, scene: 'peak',
      caption: 'A bitonic array rises to one peak and then falls. It is neither sorted nor rotated.',
      detail: 'The GATE 2025 Set 2 question defined a bitonic array as one where A[1..i] is non-decreasing and A[i+1..n] is non-increasing. The peak splits it into an ascending run and a descending run, and the peak itself is the maximum.',
      keyword: 'rises to one peak and then falls',
      trap: 'Bitonic and rotated are different shapes. A rotated array has one drop and is sorted on both sides of it; a bitonic array has one rise and one fall.',
      narration: 'A bitonic array rises to a single peak and then falls. It is neither sorted nor a rotation of a sorted array.'
    },
    {
      id: 'peak-2', start: 217.5, end: 225, scene: 'peak',
      caption: 'Find the peak by comparing the middle with its right neighbour: bigger means go right.',
      detail: 'If A[mid] < A[mid+1] the array is still rising at mid, so the peak is to the right. Otherwise the peak is at mid or to the left. Each probe removes half the candidates, so the peak is found in ceil(log2 n) comparisons.',
      keyword: 'comparing the middle with its right neighbour',
      trap: 'This needs two array accesses per probe, so a question counting array accesses gives a different number from one counting comparisons. Read which is asked.',
      narration: 'Find the peak by comparing the middle with its right neighbour. If the middle is smaller, the array is still rising, so the peak is to the right.'
    },
    {
      id: 'peak-3', start: 225, end: 232.5, scene: 'peak',
      caption: 'Then search the ascending run normally, and the descending run with the comparison reversed.',
      detail: 'Two monotone runs, two binary searches. The descending run can be searched by reversing the inequality, or by mirroring the index. Either way the cost is one more logarithmic term.',
      keyword: 'with the comparison reversed',
      trap: 'Searching both runs is not required: as soon as the ascending search hits, you stop. The worst case pays for both, and that is what the bound counts.',
      narration: 'Then search the ascending run normally, and the descending run with the comparison reversed.'
    },
    {
      id: 'peak-4', start: 232.5, end: 240, scene: 'peak',
      caption: 'Three logarithmic stages added, not multiplied: Theta(log n). The official key is log n.',
      detail: 'Peak search plus two searches is 3 ceil(log2 n) comparisons, which is Theta(log n). It is also optimal, because any comparison-based search among n distinct values needs Omega(log n) comparisons. The GATE 2025 Set 2 answer is Theta(log n).',
      keyword: 'added, not multiplied',
      trap: 'Multiplying the stages gives Theta(log squared n), which is exactly the trap option in that paper. Sequential stages add; nested loops multiply.',
      narration: 'Three logarithmic stages, added rather than multiplied, give theta of log n. That was the official answer.'
    },

    /* ---------------- scene 9: predicate ---------------- */
    {
      id: 'predicate-1', start: 240, end: 247.5, scene: 'predicate',
      caption: 'Sometimes nothing is sorted. What you have instead is a yes/no question that flips once.',
      detail: 'A predicate is monotone when, once it becomes true, it stays true for every larger input. Examples: is x squared at least 1000, does a capacity of x ship all parcels, is the number of pages at most k. The flip point is the answer.',
      keyword: 'flips once',
      trap: 'Binary search on the answer needs monotonicity, not sortedness. If the predicate can flip back, the search returns a boundary that is not the answer.',
      narration: 'Sometimes nothing is sorted. What you have instead is a yes or no question whose answer flips once and never flips back.'
    },
    {
      id: 'predicate-2', start: 247.5, end: 255, scene: 'predicate',
      caption: 'Search the range of possible answers, not the data. Same loop, different meaning of the middle.',
      detail: 'Here lo and hi are values, not indices. The middle is a candidate answer, the predicate is evaluated on it, and the update keeps the first true value. For "smallest x with x squared at least 1000" over 0 to 100 the loop returns 32.',
      keyword: 'range of possible answers',
      trap: 'The search range must be large enough to contain the answer. A range that excludes it returns the range end, silently, with no error.',
      narration: 'You search the range of possible answers rather than the data. The same loop runs, but the middle is a candidate answer, not an index.'
    },
    {
      id: 'predicate-3', start: 255, end: 262.5, scene: 'predicate',
      caption: 'Write the predicate, prove it monotone, then the loop is the same ten lines as before.',
      detail: 'The work in this pattern is entirely in the formulation: choosing a numeric answer, writing a test that is monotone in that number, and bounding the range. Once those three exist, the search is mechanical and costs ceil(log2 of the range) predicate calls.',
      keyword: 'prove it monotone',
      trap: 'A predicate that is true, false, true across the range has no single boundary, and the loop will return whichever boundary it happens to hit. Prove monotonicity before trusting the answer.',
      narration: 'Write the predicate, prove it monotone, and then the loop is the same ten lines as before.'
    },
    {
      id: 'predicate-4', start: 262.5, end: 270, scene: 'predicate',
      caption: 'The cost is the log of the range, not of the data: log of the largest possible answer.',
      detail: 'Searching an answer up to 10 to the 18 takes about 60 predicate calls, independent of how much data the predicate reads. Each call may cost more, so the total is (calls) times (cost per call), and the two must be multiplied only when the predicate scans the input.',
      keyword: 'log of the range',
      trap: 'If each predicate call scans n items, the total is n log(range), not log(range). The inner cost is a separate factor and a favourite second mark in GATE.',
      narration: 'The cost is the logarithm of the range of answers, not of the data. Each call has its own cost, and that is a separate factor.'
    },

    /* ---------------- scene 10: lower bound ---------------- */
    {
      id: 'lowerbound-1', start: 270, end: 277.5, scene: 'lowerbound',
      caption: 'Any comparison search is a tree. Each probe is a node, each outcome an edge, each answer a leaf.',
      detail: 'The tree has one internal node per comparison and one leaf per distinguishable outcome. To answer correctly the algorithm needs at least n leaves for a successful search, plus one for each gap if absence must also be reported.',
      keyword: 'is a tree',
      trap: 'The tree argument bounds comparisons only. An algorithm that uses hashing or direct addressing is not a comparison search and is not bound by it.',
      narration: 'Any search that works by comparing is a tree. Each probe is a node, each outcome an edge, and each possible answer a leaf.'
    },
    {
      id: 'lowerbound-2', start: 277.5, end: 285, scene: 'lowerbound',
      caption: 'A tree of height h has at most 2^h - 1 internal nodes, so n <= 2^h - 1 and h >= ceil(log2(n+1)).',
      detail: 'Solving the inequality for h gives the lower bound. Binary search meets it exactly, because its comparison tree is as balanced as n allows. That is why floor(log2 n) + 1 equals ceil(log2(n+1)) and why no comparison search can do better.',
      keyword: 'at most 2^h - 1 internal nodes',
      trap: 'A lower bound is not an algorithm. Meeting it proves optimality in the comparison model, and says nothing about a different model such as hashing, which reaches constant expected time.',
      narration: 'A tree of height h holds at most two to the h minus one internal nodes, so n is at most that, and h is at least log base two of n plus one.'
    },
    {
      id: 'lowerbound-3', start: 285, end: 292.5, scene: 'lowerbound',
      caption: 'Ternary search pays two comparisons per level to cut to a third. It is slower, not faster.',
      detail: 'Two comparisons reduce the range by a factor of three, so the cost is 2 log base 3 of n, which is about 1.26 log base 2 of n. Measured worst cases confirm the ratio: 22 comparisons against 17 at n = 100,000. The asymptotic class is the same, and the constant is worse.',
      keyword: 'slower, not faster',
      trap: 'More comparisons per step does not buy a better class. Any fixed k-way search is Theta(log n) with a worse constant; that is why binary is the standard.',
      narration: 'Ternary search spends two comparisons to cut the range to a third. It is slower than binary, not faster, and the class is the same.'
    },
    {
      id: 'lowerbound-4', start: 292.5, end: 300, scene: 'lowerbound',
      caption: 'Five questions settle any item: sorted? which count? which shape? present or absent? which assumption?',
      detail: 'Ask in order: is the input sorted or is a predicate monotone; is the question counting comparisons, iterations, array accesses or time; is the loop the closed shape or the half-open shape; is the target guaranteed present; and does the stem name a distribution. Answering these five before choosing an option removes almost every error in this topic.',
      keyword: 'five questions',
      trap: 'The commonest lost mark is a count that includes or excludes the final comparison without saying so. Write the count with its convention attached.',
      narration: 'Five questions settle any item: is it sorted, which count is asked, which loop shape, present or absent, and which assumption.'
    }
  ]
};
