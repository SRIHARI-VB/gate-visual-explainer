# Sorting Algorithms — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/sorting-algorithms/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A sort makes two promises, not one

*0:00 – 0:30 · objective: See that sorted output is not enough: the output must also be a rearrangement of the input, and a third promise called stability is often asked for as well.*

**0:00–0:07** — A sorting algorithm takes a list and returns a list. It promises two things, and the second is the one people forget.

> Caption: A sorting algorithm takes a list and returns a list. It promises two things, and the second is the one people forget.

Exam-trap caption mode adds: *A program that prints the keys in order without keeping the duplicates has not sorted. Losing an element is a failure even when the printout looks right.*

**0:07–0:15** — First promise: every neighbouring pair is in order. Second promise: the output is a rearrangement of the input, nothing added and nothing lost.

> Caption: First promise: every neighbouring pair is in order. Second promise: the output is a rearrangement of the input, nothing added and nothing lost.

Exam-trap caption mode adds: *An exam option that says "the array is sorted" is weaker than "the array is a sorted permutation of the input". Both promises are usually meant.*

**0:15–0:22** — A third promise is asked for by name: stability. Equal keys must keep the order they arrived in.

> Caption: A third promise is asked for by name: stability. Equal keys must keep the order they arrived in.

Exam-trap caption mode adds: *Stability is only observable when there are duplicate keys. On a list of distinct keys every sort is trivially stable, so a question about stability must involve ties.*

**0:22–0:30** — So every question in this topic is one of: how many comparisons, how much time, how much extra memory, is it stable, and is it in place.

> Caption: So every question in this topic is one of: how many comparisons, how much time, how much extra memory, is it stable, and is it in place.

Exam-trap caption mode adds: *A comparison count is not a running time. Insertion sort makes n minus one comparisons on a sorted input but still moves elements; the counts and the times agree in order of growth, not in value.*

## Scene 2. Selection, insertion, bubble: the quadratic family

*0:30 – 1:00 · objective: Count comparisons for the three simple sorts and see that only insertion sort changes its count when the input is already ordered.*

**0:30–0:37** — Selection sort scans the unsorted tail for the smallest key and swaps it to the front. It always scans the whole tail.

> Caption: Selection sort scans the unsorted tail for the smallest key and swaps it to the front. It always scans the whole tail.

Exam-trap caption mode adds: *Selection sort is the answer to "fewest swaps", at most n minus one, and never the answer to "fewest comparisons". Those are two different questions about the same algorithm.*

**0:37–0:45** — Insertion sort takes the next key and slides it left until it is bigger than its left neighbour. On a sorted input it stops at once.

> Caption: Insertion sort takes the next key and slides it left until it is bigger than its left neighbour. On a sorted input it stops at once.

Exam-trap caption mode adds: *This is exactly why GATE 2021 Set 1 asked which algorithm uses the fewest comparisons on an already sorted array. The answer is insertion sort, with n minus one.*

**0:45–0:52** — Bubble sort swaps neighbours. With an early exit it also becomes linear on a sorted input; without one it does the full quadratic count.

> Caption: Bubble sort swaps neighbours. With an early exit it also becomes linear on a sorted input; without one it does the full quadratic count.

Exam-trap caption mode adds: *GATE 2016 Set 2 asked whether bubble sort is quadratic on an ascending input and the key said yes. That is the version without the early exit. State the variant you assume.*

**0:52–1:00** — At n equals eight: selection twenty eight comparisons whatever the input, insertion seven on sorted and twenty eight on reversed.

> Caption: At n equals eight: selection twenty eight comparisons whatever the input, insertion seven on sorted and twenty eight on reversed.

Exam-trap caption mode adds: *Insertion sort is quadratic in the worst case and linear in the best. Quoting one without saying which case is the standard lost mark in this family.*

## Scene 3. Why no comparison sort can beat n log n

*1:00 – 1:30 · objective: Read a sorting algorithm as a path down a binary decision tree, count the leaves it needs, and turn that count into a lower bound.*

**1:00–1:07** — Any algorithm that learns about the keys only by comparing them is a walk down a binary tree. Each comparison is one fork.

> Caption: Any algorithm that learns about the keys only by comparing them is a walk down a binary tree. Each comparison is one fork.

Exam-trap caption mode adds: *The tree is not the recursion tree. A recursion tree counts the work done by divide and conquer; a decision tree counts the comparisons an algorithm must make before it can know the answer.*

**1:07–1:15** — A correct algorithm must reach a different leaf for every possible input order, so it needs at least n factorial leaves.

> Caption: A correct algorithm must reach a different leaf for every possible input order, so it needs at least n factorial leaves.

Exam-trap caption mode adds: *This argument needs the keys to be distinct. With duplicates there are fewer distinct orders, and a comparison sort can finish sooner on that particular input.*

**1:15–1:22** — A binary tree with L leaves has height at least log base two of L. So the number of comparisons is at least log base two of n factorial.

> Caption: A binary tree with L leaves has height at least log base two of L. So the number of comparisons is at least log base two of n factorial.

Exam-trap caption mode adds: *A lower bound on comparisons is not a lower bound on time. A sort that does not compare keys, like counting sort, is not covered by this argument at all.*

**1:22–1:30** — And log of n factorial grows like n log n. So every comparison sort needs about n log n comparisons, and that is the wall.

> Caption: And log of n factorial grows like n log n. So every comparison sort needs about n log n comparisons, and that is the wall.

Exam-trap caption mode adds: *Merge sort and heapsort both reach this bound, so neither is asymptotically better than the other in comparisons. Their differences are in space and stability, not in the exponent.*

## Scene 4. Merge sort: split, solve, merge

*1:30 – 2:00 · objective: Follow one merge step by step, count n minus one merges, and see why the cost is n log n on every input rather than only sometimes.*

**1:30–1:37** — Merge sort splits the list in half, sorts each half the same way, and merges the two sorted halves.

> Caption: Merge sort splits the list in half, sorts each half the same way, and merges the two sorted halves.

Exam-trap caption mode adds: *The split is at the middle index, so it is balanced whatever the values are. That is the whole reason merge sort cannot be pushed into a bad case by an unlucky input.*

**1:37–1:45** — A merge walks two pointers and takes the smaller front key each time. Two sorted lists of total size n cost at most n minus one comparisons.

> Caption: A merge walks two pointers and takes the smaller front key each time. Two sorted lists of total size n cost at most n minus one comparisons.

Exam-trap caption mode adds: *When the two fronts are equal, the choice decides stability. Taking from the left list keeps equal keys in their original order; taking from the right list breaks it.*

**1:45–1:52** — Splitting n keys takes n minus one merges in total, and the tree has log base two of n plus one levels, so the cost is n log n.

> Caption: Splitting n keys takes n minus one merges in total, and the tree has log base two of n plus one levels, so the cost is n log n.

Exam-trap caption mode adds: *n minus one is the count of merge operations, not the count of comparisons. Each merge costs up to its own size minus one, and the sizes shrink as you go down the tree.*

**1:52–2:00** — That cost is the same for every input, which makes merge sort the safe answer. It pays for that safety with a second array.

> Caption: That cost is the same for every input, which makes merge sort the safe answer. It pays for that safety with a second array.

Exam-trap caption mode adds: *Merge sort is Theta of n log n in the best case too. It cannot be made linear on a sorted input, which is exactly why it is not the answer to the GATE 2021 question.*

## Scene 5. Quicksort: the pivot decides everything

*2:00 – 2:30 · objective: Trace one partition, see a sorted input drive the pivot rule to the quadratic worst case, and compute the chance a random pivot lands badly.*

**2:00–2:07** — Quicksort picks a pivot, moves every smaller key to its left and every larger key to its right, then recurses on both sides.

> Caption: Quicksort picks a pivot, moves every smaller key to its left and every larger key to its right, then recurses on both sides.

Exam-trap caption mode adds: *After one partition the pivot is final but the two sides are not sorted. A question that shows the array after one round expects the pivot in place and everything else merely split.*

**2:07–2:15** — With the last element as pivot and a sorted input, the pivot is always the largest. One side is empty every time, and the cost is quadratic.

> Caption: With the last element as pivot and a sorted input, the pivot is always the largest. One side is empty every time, and the cost is quadratic.

Exam-trap caption mode adds: *This is the single most examined fact in the topic. A sorted input is the best case for insertion sort and the worst case for this pivot rule. Same input, opposite verdicts.*

**2:15–2:22** — A middle-element pivot does not save you. On the organ-pipe input it costs exactly n squared over four comparisons.

> Caption: A middle-element pivot does not save you. On the organ-pipe input it costs exactly n squared over four comparisons.

Exam-trap caption mode adds: *Choosing a middle position is not choosing a middle value. Only a random pivot or a median-finding pivot removes the quadratic worst case, and a random one removes it only in expectation.*

**2:22–2:30** — With twenty five keys and a uniformly random pivot, the chance of the worst possible slot is two in twenty five, which is zero point zero eight.

> Caption: With twenty five keys and a uniformly random pivot, the chance of the worst possible slot is two in twenty five, which is zero point zero eight.

Exam-trap caption mode adds: *The probability is over the pivot choice, not over the input. A random pivot makes every input equally likely to be cheap, but no single run is guaranteed to be fast.*

## Scene 6. Heapsort: n log n worst case, no second array

*2:30 – 3:00 · objective: See a heap built in linear time, then emptied from the top, giving a guaranteed n log n sort that needs no auxiliary array.*

**2:30–2:37** — Heapsort starts by arranging the keys into a max heap: a complete binary tree where every parent is at least its children.

> Caption: Heapsort starts by arranging the keys into a max heap: a complete binary tree where every parent is at least its children.

Exam-trap caption mode adds: *A heap orders parents against children and says nothing about left against right. So a heap is not a search tree, and its in-order traversal is not sorted.*

**2:37–2:45** — The largest key is then at the root. Swap it to the end, shrink the heap by one, and sift the new root down.

> Caption: The largest key is then at the root. Swap it to the end, shrink the heap by one, and sift the new root down.

Exam-trap caption mode adds: *The sorted region grows from the right, so the array is complete only at the very end. A question that shows the array mid-way through heapsort shows a heap prefix followed by a sorted suffix.*

**2:45–2:52** — Build is linear, then n extractions of log n each. So heapsort is n log n in the worst case, and in every case.

> Caption: Build is linear, then n extractions of log n each. So heapsort is n log n in the worst case, and in every case.

Exam-trap caption mode adds: *Heapsort is not adaptive. A sorted input costs it the same as a random one, so it never wins the "fewest comparisons on a sorted array" question and never loses to quicksort on a bad input either.*

**2:52–3:00** — Everything happens inside the array, so heapsort needs no second array. But equal keys get rearranged, so it is not stable.

> Caption: Everything happens inside the array, so heapsort needs no second array. But equal keys get rearranged, so it is not stable.

Exam-trap caption mode adds: *In place does not mean free. The recursion in quicksort uses a stack, which is memory too, and heapsort uses a handful of index variables. Zero extra memory is not achievable for any sort that must move keys.*

## Scene 7. Counting and radix sort escape the bound

*3:00 – 3:30 · objective: See why the n log n lower bound does not apply to an algorithm that never compares two keys, and what it pays instead.*

**3:00–3:07** — The n log n wall has a condition: the algorithm learns about keys only by comparing them. Counting sort never compares two keys.

> Caption: The n log n wall has a condition: the algorithm learns about keys only by comparing them. Counting sort never compares two keys.

Exam-trap caption mode adds: *This is not a counterexample to the lower bound, it is outside its scope. The bound says no comparison sort beats n log n. It says nothing about an algorithm that does not compare.*

**3:07–3:15** — Counting sort counts occurrences, turns the counts into running totals, then places each key from the right. That costs n plus k.

> Caption: Counting sort counts occurrences, turns the counts into running totals, then places each key from the right. That costs n plus k.

Exam-trap caption mode adds: *k is not free. If the keys range over a billion values the counter table is a billion cells, so counting sort is linear in n only when the range is comparable to n. That is the assumption behind every counting-sort answer.*

**3:15–3:22** — Radix sort repeats a stable digit sort, least significant digit first. Each pass must be stable or the earlier passes are destroyed.

> Caption: Radix sort repeats a stable digit sort, least significant digit first. Each pass must be stable or the earlier passes are destroyed.

Exam-trap caption mode adds: *The base is the radix, so a question that says "radix sort with ten buckets" has three passes for three digit numbers, not thirty. Reading the radix as two is the usual slip.*

**3:22–3:30** — So the honest statement is: comparison sorts need n log n, and non-comparison sorts trade that for a range or a digit count.

> Caption: So the honest statement is: comparison sorts need n log n, and non-comparison sorts trade that for a range or a digit count.

Exam-trap caption mode adds: *On two hundred keys in a range of a hundred, counting sort does fewer operations than the comparison bound allows. That is not a violation, it is a different model of cost.*

## Scene 8. Stability and in-place: the two hidden questions

*3:30 – 4:00 · objective: Watch two equal keys change order under one algorithm and keep it under another, and separate "no extra array" from "no extra memory at all".*

**3:30–3:37** — Here are six records with three distinct keys. Watch what happens to the two records whose key is two.

> Caption: Here are six records with three distinct keys. Watch what happens to the two records whose key is two.

Exam-trap caption mode adds: *Stability is invisible in the sorted keys. You cannot check it by looking at the output keys, only at the records that carry them.*

**3:37–3:45** — Insertion sort and merge sort leave them in order. Selection sort and heapsort swap them, because both move a key a long way in one step.

> Caption: Insertion sort and merge sort leave them in order. Selection sort and heapsort swap them, because both move a key a long way in one step.

Exam-trap caption mode adds: *Quicksort can be made stable, but the standard Lomuto partition is not, because it swaps a key past others without regard to equality. The textbook version is what a GATE question means.*

**3:45–3:52** — Stability matters when you sort twice: sort by name, then by marks, and the stable second sort keeps names alphabetical inside equal marks.

> Caption: Stability matters when you sort twice: sort by name, then by marks, and the stable second sort keeps names alphabetical inside equal marks.

Exam-trap caption mode adds: *Sorting by marks and then by name gives a different answer from sorting by name and then by marks. The order of the passes is part of the specification, not a detail.*

**3:52–4:00** — In place is a separate promise: no array proportional to n. Merge sort needs n extra cells, heapsort needs none, quicksort needs a stack of log n.

> Caption: In place is a separate promise: no array proportional to n. Merge sort needs n extra cells, heapsort needs none, quicksort needs a stack of log n.

Exam-trap caption mode adds: *Quicksort is often called in place and its recursion still uses a stack. Say which memory you mean: the auxiliary array, or all of it including the stack.*

## Scene 9. The decision procedure

*4:00 – 4:30 · objective: Ask four questions in a fixed order so that a sorting question about comparisons, time, space or stability cannot be answered with the wrong table row.*

**4:00–4:07** — Question one: what is being counted? Comparisons, running time, extra memory, swaps, or stability are five different answers.

> Caption: Question one: what is being counted? Comparisons, running time, extra memory, swaps, or stability are five different answers.

Exam-trap caption mode adds: *Selection sort wins on swaps and loses on comparisons. Insertion sort wins on comparisons for a sorted input and loses on moves. Never answer the wrong one of the two.*

**4:07–4:15** — Question two: which input? Sorted, reverse sorted, all equal, or arbitrary. The best case of one algorithm is the worst case of another.

> Caption: Question two: which input? Sorted, reverse sorted, all equal, or arbitrary. The best case of one algorithm is the worst case of another.

Exam-trap caption mode adds: *If the question says "arbitrary input" it wants the worst case, because a bound that must hold for every input must hold for the worst one. If it names an input, use that input.*

**4:15–4:22** — Question three: which implementation? Bubble sort with and without an early exit gives two different answers on a sorted input.

> Caption: Question three: which implementation? Bubble sort with and without an early exit gives two different answers on a sorted input.

Exam-trap caption mode adds: *GATE 2016 Set 2 keyed bubble sort as quadratic on an ascending input. That is the no-early-exit version. If you assume the other one you will disagree with the key, so state the assumption in your working.*

**4:22–4:30** — Question four: is it a comparison sort? If yes the n log n wall applies, and if no it does not. Then look up the row.

> Caption: Question four: is it a comparison sort? If yes the n log n wall applies, and if no it does not. Then look up the row.

Exam-trap caption mode adds: *The wall applies to the class of algorithms, not to the problem. An option saying sorting is Omega of n log n is false unless it says comparison sorting.*

## Scene 10. The master table

*4:30 – 5:00 · objective: Hold one table in mind: seven algorithms against best, average, worst, space, stability and in-place, with the three facts that decide most questions.*

**4:30–4:37** — Seven algorithms, six columns. Best, average, worst, auxiliary space, stable, in place.

> Caption: Seven algorithms, six columns. Best, average, worst, auxiliary space, stable, in place.

Exam-trap caption mode adds: *Quicksort average is n log n and its worst is n squared. Both are true. An option is only wrong if the case it names is wrong, so read the case before rejecting the row.*

**4:37–4:45** — Three facts decide most questions: merge sort is the safe one, insertion sort is the adaptive one, and heapsort is the in-place guaranteed one.

> Caption: Three facts decide most questions: merge sort is the safe one, insertion sort is the adaptive one, and heapsort is the in-place guaranteed one.

Exam-trap caption mode adds: *There is no algorithm that is best on all six columns. Every question is a trade-off, and the trade-off is the answer.*

**4:45–4:52** — The wall is the one number to remember: log base two of n factorial, which is n log n, and it holds for every algorithm that compares.

> Caption: The wall is the one number to remember: log base two of n factorial, which is n log n, and it holds for every algorithm that compares.

Exam-trap caption mode adds: *The wall is about comparisons, so it is a lower bound on comparisons and not on time. A non-comparison sort is faster in time and still correct.*

**4:52–5:00** — Next: hashing, the third word in this syllabus line, where the same trade-offs appear as load factor and probe count.

> Caption: Next: hashing, the third word in this syllabus line, where the same trade-offs appear as load factor and probe count.

Exam-trap caption mode adds: *Hashing is not a sorting method and has no n log n bound. Do not carry the wall across to it.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
