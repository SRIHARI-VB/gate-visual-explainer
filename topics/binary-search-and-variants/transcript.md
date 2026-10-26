# Binary Search And Variants — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/binary-search-and-variants/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Halving the problem: 16 cells, 4 probes

*0:00 – 0:30 · objective: See the one move binary search makes - compare with the middle, then throw away half - and count the probes it costs on 16 cells.*

**0:00–0:07** — Sixteen sorted cells and one target. A linear scan would compare up to sixteen of them, one at a time.

> Caption: Sixteen sorted cells, one target. Linear search would touch up to sixteen of them.

Exam-trap caption mode adds: *Sorted order is the licence for everything in this lesson. On an unsorted array binary search is not slower - it is simply wrong.*

**0:07–0:15** — Probe the middle cell, which holds thirty-one. Forty-three is larger, so it cannot be in the left half.

> Caption: Probe the middle. One comparison tells you which half the target must be in.

Exam-trap caption mode adds: *The comparison is against the middle element, not against the middle index. A question that asks how many comparisons is asking about element comparisons.*

**0:15–0:22** — Eight cells left. Probe again: forty-seven is too big, so the answer lies between thirty-five and forty-three.

> Caption: Eight cells left. Halve again: 47 is too big, so the answer is in 35 to 43.

Exam-trap caption mode adds: *Sixteen cells do not need four halvings to reach one cell - they need four probes, because the last probe compares the single remaining cell.*

**0:22–0:30** — Four probes on sixteen cells. Double the array and you pay one more probe, not twice as many.

> Caption: Four probes on 16 cells. Doubling the array costs one more probe, never twice as many.

Exam-trap caption mode adds: *A common misreading is that binary search is O(log n) so it is always faster. For n = 8 and a target at the first cell, linear search wins with one comparison against four.*

## Scene 2. The invariant: the answer never leaves [lo, hi]

*0:30 – 1:00 · objective: Name the single sentence that makes the loop correct, and see how each of the three comparison outcomes moves a boundary without breaking it.*

**0:30–0:37** — Three indices and one sentence. If the target is in the array at all, it lies between lo and hi.

> Caption: Three indices, one sentence: if the target is in the array at all, it sits inside [lo, hi].

Exam-trap caption mode adds: *The invariant is about the target, not about the answer index. If the target is absent, the invariant is true but says nothing useful - which is why absence needs its own exit.*

**0:37–0:45** — Equal and you stop. Smaller than the middle and the answer is to the left. Larger and it is to the right.

> Caption: Equal: stop. Smaller than the middle: the answer is left. Larger: the answer is right.

Exam-trap caption mode adds: *Writing two comparisons instead of three - testing only for equality and then for less-than - can double the comparison count. The count a question asks about is usually element comparisons.*

**0:45–0:52** — The middle cell is dropped from both new ranges, because it has just been compared.

> Caption: The middle cell is excluded from both new ranges, because it has just been tested.

Exam-trap caption mode adds: *lo = mid and hi = mid are correct in the other loop shape, where the range is a half-open insertion window. Copying an update from one shape into the other is the single commonest binary-search bug.*

**0:52–1:00** — When lo passes hi the range is empty. The invariant still holds, and the honest answer is that the target is absent.

> Caption: When lo passes hi the range is empty, the invariant is still true, and the answer is "absent".

Exam-trap caption mode adds: *A program that returns the last probed index after the loop instead of -1 reports a false hit. Check the exit value, not only the loop body.*

## Scene 3. A full trace, including the miss

*1:00 – 1:30 · objective: Run the loop to the end on two targets, one present and one absent, and see exactly which comparison ends each run.*

**1:00–1:07** — Trace one: find twenty-seven. The table records lo, hi, mid and the verdict of each probe.

> Caption: Trace one: find 27 in sixteen cells. The table records lo, hi, mid and the verdict of each probe.

Exam-trap caption mode adds: *A trace table is a proof only when every row is justified. In an exam, one wrong row usually means a wrong count, and the count is what is marked.*

**1:07–1:15** — Probe thirty-one, then fourteen, then twenty-three, then twenty-seven. Four comparisons, and the fourth is the hit.

> Caption: Probe 31, then 14, then 23, then 27: four comparisons, and the fourth is the hit.

Exam-trap caption mode adds: *The count includes the successful comparison. Students who count only the discarded probes answer three.*

**1:15–1:22** — Trace two: find twenty-five, which is not present. Four probes empty the range and the answer is minus one.

> Caption: Trace two: find 25, which is not there. The loop empties the range in four probes.

Exam-trap caption mode adds: *A miss costs at most the same as the worst hit, ceil(log2(n+1)) comparisons. It never costs more, which is why an unsuccessful search does not change the complexity.*

**1:22–1:30** — Both runs used the same number of probes. Here, success and failure cost the same.

> Caption: Both runs used the same number of probes. Success and failure are not different costs here.

Exam-trap caption mode adds: *Do not assume a hit is cheaper than a miss. The bound is on both, and it is the same bound.*

## Scene 4. How many comparisons: floor(log2 n) + 1

*1:30 – 2:00 · objective: Derive the worst-case count from the recurrence F(n) = F(floor(n/2)) + 1, read the table, and separate best, worst and average.*

**1:30–1:37** — One comparison, then the same problem on half the cells. That is the recurrence, with a coefficient of one.

> Caption: One comparison, then the same problem on half the cells: F(n) = F(floor(n/2)) + 1.

Exam-trap caption mode adds: *F(n) = 2F(n/2) + 1 describes an algorithm that searches both halves. Binary search searches one, so the coefficient is 1, not 2.*

**1:37–1:45** — Unrolling gives floor of log base two of n, plus one. The table confirms it from one cell to sixteen.

> Caption: Unrolling gives floor(log2 n) + 1, and the table confirms it for n = 1 to 16.

Exam-trap caption mode adds: *The +1 is the last probe. Answers that omit it are off by one at every power of two, which is exactly where examiners put the numbers.*

**1:45–1:52** — The floor form and the ceiling form agree for every n, so either is safe as an answer.

> Caption: floor(log2 n) + 1 and ceil(log2(n+1)) agree for every n, so both answer forms are safe.

Exam-trap caption mode adds: *ceil(log2 n) is a different number: for n = 8 it gives 3 while the true worst case is 4. If a question quotes that form, it is counting probes to reduce to one cell, not comparisons.*

**1:52–2:00** — The best case is one probe. The average depends on the targets you assume, so any average answer must state that assumption.

> Caption: Best case is one probe. Average depends on which targets you assume, so state the assumption.

Exam-trap caption mode adds: *An average case with no stated distribution is not a well-defined number. In a GATE option list, the worst case is the answer unless the stem names a distribution.*

## Scene 5. Two loop shapes, two mid formulas, one infinite loop

*2:00 – 2:30 · objective: Match the loop condition to the boundary update, and see the two classic code faults - the stuck pointer and the overflowing sum - as concrete states.*

**2:00–2:07** — Shape one uses lo less than or equal to hi and sets hi to mid minus one. Shape two uses lo less than hi and sets hi to mid. Both are correct, with their own updates.

> Caption: Shape one: lo <= hi, hi = mid - 1. Shape two: lo < hi, hi = mid. Both are correct.

Exam-trap caption mode adds: *The shapes are not interchangeable line by line. Mixing the condition of one with the updates of the other is what produces the bugs below.*

**2:07–2:15** — Bug one: setting lo to mid inside a lo less than hi loop. When hi is lo plus one, the middle is lo and nothing moves.

> Caption: Bug one: lo = mid inside lo < hi. When hi = lo + 1 the middle is lo, and nothing moves.

Exam-trap caption mode adds: *This bug only shows up on an even-sized final window, so a test with an odd array size passes. Test n = 2.*

**2:15–2:22** — Bug two: adding lo and hi before halving. With thirty-two-bit integers the sum goes negative past two to the thirty-first, and the index is garbage.

> Caption: Bug two: (lo + hi) / 2 overflows. With 32-bit ints the sum turns negative above 2^31 - 1.

Exam-trap caption mode adds: *This is a real reported defect, not a puzzle: the standard Java library binary search carried it for years. In an exam it appears as "what is wrong with this function".*

**2:22–2:30** — Floor or ceiling for the middle? With lo less than hi and hi set to mid, the floor is what keeps the loop shrinking.

> Caption: Mid by floor or by ceiling: with lo < hi and hi = mid, use the floor. The ceiling can stall.

Exam-trap caption mode adds: *In the closed shape lo <= hi both roundings terminate, so the rounding question only matters in the half-open shape. Know which shape you are reading.*

## Scene 6. lower_bound and upper_bound: the duplicates problem

*2:30 – 3:00 · objective: Search a sorted array with repeats and answer "first occurrence" and "insertion point", which is the shape GATE 2014 Set 3 used.*

**2:30–2:37** — With repeated values, the word found is ambiguous. There are three different questions hiding behind one array.

> Caption: With repeats, "found" is ambiguous. Three different questions hide behind one array.

Exam-trap caption mode adds: *A question that says "binary search" and an array with duplicates is almost always asking about the first or last occurrence. Read the stem for "first", "last" or "count".*

**2:37–2:45** — Lower bound gives the first index whose value is not less than the target. It is also where the target would be inserted.

> Caption: lower_bound: the first index whose value is not less than the target. The array need not contain it.

Exam-trap caption mode adds: *lower_bound does not tell you whether the value is present. You must check arr[result] == target afterwards, and the result may be n, one past the end.*

**2:45–2:52** — Upper bound gives the first index whose value is greater than the target. Subtracting gives the number of copies.

> Caption: upper_bound: the first index whose value is greater. Its difference from lower_bound counts the copies.

Exam-trap caption mode adds: *upper_bound minus lower_bound counts occurrences, not positions. A question asking for the last occurrence wants upper_bound minus one, and only after checking the count is non-zero.*

**2:52–3:00** — A single loop can do both, shrinking from the right when the value is big enough and from the left when it is small enough.

> Caption: One loop can do both: shrink on the right when the value is big enough, on the left when it is small enough.

Exam-trap caption mode adds: *Two independent if statements are not the same as an if-else chain. Here the overlap is deliberate: it is how the loop terminates on equality.*

## Scene 7. A rotated sorted array still gives up in log n

*3:00 – 3:30 · objective: Decide which half is sorted by comparing one endpoint with the middle, and keep the log n bound on a rotated array.*

**3:00–3:07** — A rotated sorted array is two sorted runs joined end to end. Plain binary search would discard the half that holds the target.

> Caption: A rotated sorted array is two sorted runs. 43, 47, 51, 3, 7, 11, 14 is one example.

Exam-trap caption mode adds: *A rotated array is not "nearly sorted" in the sense that helps quicksort. The only property binary search can use is the sortedness of one half at each step.*

**3:07–3:15** — Compare the left end with the middle. If the left end is the smaller, the left half is the sorted run.

> Caption: Compare the left end with the middle. If the left end is smaller, the left half is the sorted one.

Exam-trap caption mode adds: *Use <= rather than < when the array may hold duplicates. With distinct values the two tests agree; with repeats the strict test can misclassify a sorted half.*

**3:15–3:22** — If the target lies inside the sorted run, go there. Otherwise go to the other half, which must contain it.

> Caption: If the target lies inside the sorted run, go there. Otherwise go to the other half.

Exam-trap caption mode adds: *The test must be written with the run boundaries of the sorted side. Applying the ascending test to the unsorted side silently gives wrong answers, not a wrong count.*

**3:22–3:30** — The bound is unchanged. Rotation costs a constant amount of extra reasoning, not extra asymptotic time.

> Caption: The bound is unchanged: one comparison plus one half. Rotation costs nothing asymptotically.

Exam-trap caption mode adds: *Rotation changes the constant, not the class. An option saying Theta(n) for a rotated array with distinct values is wrong.*

## Scene 8. Bitonic arrays: find the peak, then two searches

*3:30 – 4:00 · objective: Split the problem into a peak search and two monotone searches, add the costs rather than multiply them, and reach Theta(log n).*

**3:30–3:37** — A bitonic array rises to a single peak and then falls. It is neither sorted nor a rotation of a sorted array.

> Caption: A bitonic array rises to one peak and then falls. It is neither sorted nor rotated.

Exam-trap caption mode adds: *Bitonic and rotated are different shapes. A rotated array has one drop and is sorted on both sides of it; a bitonic array has one rise and one fall.*

**3:37–3:45** — Find the peak by comparing the middle with its right neighbour. If the middle is smaller, the array is still rising, so the peak is to the right.

> Caption: Find the peak by comparing the middle with its right neighbour: bigger means go right.

Exam-trap caption mode adds: *This needs two array accesses per probe, so a question counting array accesses gives a different number from one counting comparisons. Read which is asked.*

**3:45–3:52** — Then search the ascending run normally, and the descending run with the comparison reversed.

> Caption: Then search the ascending run normally, and the descending run with the comparison reversed.

Exam-trap caption mode adds: *Searching both runs is not required: as soon as the ascending search hits, you stop. The worst case pays for both, and that is what the bound counts.*

**3:52–4:00** — Three logarithmic stages, added rather than multiplied, give theta of log n. That was the official answer.

> Caption: Three logarithmic stages added, not multiplied: Theta(log n). The official key is log n.

Exam-trap caption mode adds: *Multiplying the stages gives Theta(log squared n), which is exactly the trap option in that paper. Sequential stages add; nested loops multiply.*

## Scene 9. Binary search on the answer, not on the array

*4:00 – 4:30 · objective: Recognise a monotone yes/no predicate, and use binary search on the value range when no array is sorted at all.*

**4:00–4:07** — Sometimes nothing is sorted. What you have instead is a yes or no question whose answer flips once and never flips back.

> Caption: Sometimes nothing is sorted. What you have instead is a yes/no question that flips once.

Exam-trap caption mode adds: *Binary search on the answer needs monotonicity, not sortedness. If the predicate can flip back, the search returns a boundary that is not the answer.*

**4:07–4:15** — You search the range of possible answers rather than the data. The same loop runs, but the middle is a candidate answer, not an index.

> Caption: Search the range of possible answers, not the data. Same loop, different meaning of the middle.

Exam-trap caption mode adds: *The search range must be large enough to contain the answer. A range that excludes it returns the range end, silently, with no error.*

**4:15–4:22** — Write the predicate, prove it monotone, and then the loop is the same ten lines as before.

> Caption: Write the predicate, prove it monotone, then the loop is the same ten lines as before.

Exam-trap caption mode adds: *A predicate that is true, false, true across the range has no single boundary, and the loop will return whichever boundary it happens to hit. Prove monotonicity before trusting the answer.*

**4:22–4:30** — The cost is the logarithm of the range of answers, not of the data. Each call has its own cost, and that is a separate factor.

> Caption: The cost is the log of the range, not of the data: log of the largest possible answer.

Exam-trap caption mode adds: *If each predicate call scans n items, the total is n log(range), not log(range). The inner cost is a separate factor and a favourite second mark in GATE.*

## Scene 10. Why log n is a wall, and the decision procedure

*4:30 – 5:00 · objective: Count the outcomes to get the decision-tree lower bound, then run the five-question checklist that answers any binary-search item.*

**4:30–4:37** — Any search that works by comparing is a tree. Each probe is a node, each outcome an edge, and each possible answer a leaf.

> Caption: Any comparison search is a tree. Each probe is a node, each outcome an edge, each answer a leaf.

Exam-trap caption mode adds: *The tree argument bounds comparisons only. An algorithm that uses hashing or direct addressing is not a comparison search and is not bound by it.*

**4:37–4:45** — A tree of height h holds at most two to the h minus one internal nodes, so n is at most that, and h is at least log base two of n plus one.

> Caption: A tree of height h has at most 2^h - 1 internal nodes, so n <= 2^h - 1 and h >= ceil(log2(n+1)).

Exam-trap caption mode adds: *A lower bound is not an algorithm. Meeting it proves optimality in the comparison model, and says nothing about a different model such as hashing, which reaches constant expected time.*

**4:45–4:52** — Ternary search spends two comparisons to cut the range to a third. It is slower than binary, not faster, and the class is the same.

> Caption: Ternary search pays two comparisons per level to cut to a third. It is slower, not faster.

Exam-trap caption mode adds: *More comparisons per step does not buy a better class. Any fixed k-way search is Theta(log n) with a worse constant; that is why binary is the standard.*

**4:52–5:00** — Five questions settle any item: is it sorted, which count is asked, which loop shape, present or absent, and which assumption.

> Caption: Five questions settle any item: sorted? which count? which shape? present or absent? which assumption?

Exam-trap caption mode adds: *The commonest lost mark is a count that includes or excludes the final comparison without saying so. Write the count with its convention attached.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
