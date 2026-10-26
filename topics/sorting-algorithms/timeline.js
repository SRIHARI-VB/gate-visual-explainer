/* ==========================================================================
   sorting-algorithms - THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs - never edited by hand.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'promise',
      n: 1,
      title: 'A sort makes two promises, not one',
      start: 0, end: 30,
      objective: 'See that sorted output is not enough: the output must also be a rearrangement of the input, and a third promise called stability is often asked for as well.'
    },
    {
      id: 'quadratic',
      n: 2,
      title: 'Selection, insertion, bubble: the quadratic family',
      start: 30, end: 60,
      objective: 'Count comparisons for the three simple sorts and see that only insertion sort changes its count when the input is already ordered.'
    },
    {
      id: 'bound',
      n: 3,
      title: 'Why no comparison sort can beat n log n',
      start: 60, end: 90,
      objective: 'Read a sorting algorithm as a path down a binary decision tree, count the leaves it needs, and turn that count into a lower bound.'
    },
    {
      id: 'merge',
      n: 4,
      title: 'Merge sort: split, solve, merge',
      start: 90, end: 120,
      objective: 'Follow one merge step by step, count n minus one merges, and see why the cost is n log n on every input rather than only sometimes.'
    },
    {
      id: 'quick',
      n: 5,
      title: 'Quicksort: the pivot decides everything',
      start: 120, end: 150,
      objective: 'Trace one partition, see a sorted input drive the pivot rule to the quadratic worst case, and compute the chance a random pivot lands badly.'
    },
    {
      id: 'heap',
      n: 6,
      title: 'Heapsort: n log n worst case, no second array',
      start: 150, end: 180,
      objective: 'See a heap built in linear time, then emptied from the top, giving a guaranteed n log n sort that needs no auxiliary array.'
    },
    {
      id: 'linear',
      n: 7,
      title: 'Counting and radix sort escape the bound',
      start: 180, end: 210,
      objective: 'See why the n log n lower bound does not apply to an algorithm that never compares two keys, and what it pays instead.'
    },
    {
      id: 'stable',
      n: 8,
      title: 'Stability and in-place: the two hidden questions',
      start: 210, end: 240,
      objective: 'Watch two equal keys change order under one algorithm and keep it under another, and separate "no extra array" from "no extra memory at all".'
    },
    {
      id: 'decide',
      n: 9,
      title: 'The decision procedure',
      start: 240, end: 270,
      objective: 'Ask four questions in a fixed order so that a sorting question about comparisons, time, space or stability cannot be answered with the wrong table row.'
    },
    {
      id: 'table',
      n: 10,
      title: 'The master table',
      start: 270, end: 300,
      objective: 'Hold one table in mind: seven algorithms against best, average, worst, space, stability and in-place, with the three facts that decide most questions.'
    }
  ],

  events: [

    /* ---------------- scene 1: the two promises ---------------- */
    {
      id: 'promise-1', start: 0, end: 7.5, scene: 'promise',
      caption: 'A sorting algorithm takes a list and returns a list. It promises two things, and the second is the one people forget.',
      detail: 'The input is a sequence of keys with an order relation on them. The output is another sequence of the same keys. "Ascending" is a statement about neighbouring pairs in the output.',
      keyword: 'It promises two things',
      trap: 'A program that prints the keys in order without keeping the duplicates has not sorted. Losing an element is a failure even when the printout looks right.',
      narration: 'A sorting algorithm takes a list and returns a list. It promises two things, and the second is the one people forget.'
    },
    {
      id: 'promise-2', start: 7.5, end: 15, scene: 'promise',
      caption: 'First promise: every neighbouring pair is in order. Second promise: the output is a rearrangement of the input, nothing added and nothing lost.',
      detail: 'The second promise is checked by comparing the two lists as multisets: sort both and compare element by element. A sort that satisfies only the first promise can be built by printing 1, 2, 3 and stopping.',
      keyword: 'a rearrangement of the input',
      trap: 'An exam option that says "the array is sorted" is weaker than "the array is a sorted permutation of the input". Both promises are usually meant.',
      narration: 'First promise: every neighbouring pair is in order. Second promise: the output is a rearrangement of the input, nothing added and nothing lost.'
    },
    {
      id: 'promise-3', start: 15, end: 22.5, scene: 'promise',
      caption: 'A third promise is asked for by name: stability. Equal keys must keep the order they arrived in.',
      detail: 'Keys are rarely the whole record. If you sort a list of students by marks, two students with the same marks are tied; a stable sort leaves them in their original relative order, an unstable one may swap them.',
      keyword: 'Equal keys must keep the order they arrived in',
      trap: 'Stability is only observable when there are duplicate keys. On a list of distinct keys every sort is trivially stable, so a question about stability must involve ties.',
      narration: 'A third promise is asked for by name: stability. Equal keys must keep the order they arrived in.'
    },
    {
      id: 'promise-4', start: 22.5, end: 30, scene: 'promise',
      caption: 'So every question in this topic is one of: how many comparisons, how much time, how much extra memory, is it stable, and is it in place.',
      detail: 'These five are different questions about the same algorithm, and the answers are different numbers. Naming which one is being asked is the first move in every GATE sorting question.',
      keyword: 'how many comparisons, how much time',
      trap: 'A comparison count is not a running time. Insertion sort makes n minus one comparisons on a sorted input but still moves elements; the counts and the times agree in order of growth, not in value.',
      narration: 'So every question in this topic is one of: how many comparisons, how much time, how much extra memory, is it stable, and is it in place.'
    },

    /* ---------------- scene 2: the quadratic family ---------------- */
    {
      id: 'quadratic-1', start: 30, end: 37.5, scene: 'quadratic',
      caption: 'Selection sort scans the unsorted tail for the smallest key and swaps it to the front. It always scans the whole tail.',
      detail: 'Pass one scans n minus one keys, pass two scans n minus two, and so on. The total is n times n minus one over two comparisons, and it does not depend on how the input was arranged.',
      keyword: 'It always scans the whole tail',
      trap: 'Selection sort is the answer to "fewest swaps", at most n minus one, and never the answer to "fewest comparisons". Those are two different questions about the same algorithm.',
      narration: 'Selection sort scans the unsorted tail for the smallest key and swaps it to the front. It always scans the whole tail.'
    },
    {
      id: 'quadratic-2', start: 37.5, end: 45, scene: 'quadratic',
      caption: 'Insertion sort takes the next key and slides it left until it is bigger than its left neighbour. On a sorted input it stops at once.',
      detail: 'Each new key costs one comparison if it is already in place, and up to i comparisons if it has to travel all the way to the front. The count therefore depends on the input, which is what adaptive means.',
      keyword: 'On a sorted input it stops at once',
      trap: 'This is exactly why GATE 2021 Set 1 asked which algorithm uses the fewest comparisons on an already sorted array. The answer is insertion sort, with n minus one.',
      narration: 'Insertion sort takes the next key and slides it left until it is bigger than its left neighbour. On a sorted input it stops at once.'
    },
    {
      id: 'quadratic-3', start: 45, end: 52.5, scene: 'quadratic',
      caption: 'Bubble sort swaps neighbours. With an early exit it also becomes linear on a sorted input; without one it does the full quadratic count.',
      detail: 'The early exit is a flag set whenever a swap happens. If a whole pass makes no swap the list is already ordered and the loop stops. Remove the flag and the loop always runs to the end.',
      keyword: 'With an early exit it also becomes linear',
      trap: 'GATE 2016 Set 2 asked whether bubble sort is quadratic on an ascending input and the key said yes. That is the version without the early exit. State the variant you assume.',
      narration: 'Bubble sort swaps neighbours. With an early exit it also becomes linear on a sorted input; without one it does the full quadratic count.'
    },
    {
      id: 'quadratic-4', start: 52.5, end: 60, scene: 'quadratic',
      caption: 'At n equals eight: selection twenty eight comparisons whatever the input, insertion seven on sorted and twenty eight on reversed.',
      detail: 'Both numbers come from the same formula, n times n minus one over two, which is 28 for n equal to eight. Insertion sort only reaches it when every key has to travel the whole way, which is the reverse-sorted input.',
      keyword: 'seven on sorted and twenty eight on reversed',
      trap: 'Insertion sort is quadratic in the worst case and linear in the best. Quoting one without saying which case is the standard lost mark in this family.',
      narration: 'At n equals eight: selection twenty eight comparisons whatever the input, insertion seven on sorted and twenty eight on reversed.'
    },

    /* ---------------- scene 3: the lower bound ---------------- */
    {
      id: 'bound-1', start: 60, end: 67.5, scene: 'bound',
      caption: 'Any algorithm that learns about the keys only by comparing them is a walk down a binary tree. Each comparison is one fork.',
      detail: 'The tree is called the decision tree of the algorithm. Its shape depends on the algorithm, but not on the input: the algorithm asks its questions in the same order until the answers steer it. A leaf is reached when the algorithm stops and prints.',
      keyword: 'a walk down a binary tree',
      trap: 'The tree is not the recursion tree. A recursion tree counts the work done by divide and conquer; a decision tree counts the comparisons an algorithm must make before it can know the answer.',
      narration: 'Any algorithm that learns about the keys only by comparing them is a walk down a binary tree. Each comparison is one fork.'
    },
    {
      id: 'bound-2', start: 67.5, end: 75, scene: 'bound',
      caption: 'A correct algorithm must reach a different leaf for every possible input order, so it needs at least n factorial leaves.',
      detail: 'If two different input orders ended at the same leaf the algorithm would print the same output for both, and one of them would be wrong. So the number of leaves is at least the number of distinct orders of n keys, which is n factorial.',
      keyword: 'at least n factorial leaves',
      trap: 'This argument needs the keys to be distinct. With duplicates there are fewer distinct orders, and a comparison sort can finish sooner on that particular input.',
      narration: 'A correct algorithm must reach a different leaf for every possible input order, so it needs at least n factorial leaves.'
    },
    {
      id: 'bound-3', start: 75, end: 82.5, scene: 'bound',
      caption: 'A binary tree with L leaves has height at least log base two of L. So the number of comparisons is at least log base two of n factorial.',
      detail: 'For n equal to eight, eight factorial is forty thousand three hundred and twenty. Two to the fifteenth is thirty two thousand seven hundred and sixty eight, which is too small, so at least sixteen comparisons are needed.',
      keyword: 'at least log base two of n factorial',
      trap: 'A lower bound on comparisons is not a lower bound on time. A sort that does not compare keys, like counting sort, is not covered by this argument at all.',
      narration: 'A binary tree with L leaves has height at least log base two of L. So the number of comparisons is at least log base two of n factorial.'
    },
    {
      id: 'bound-4', start: 82.5, end: 90, scene: 'bound',
      caption: 'And log of n factorial grows like n log n. So every comparison sort needs about n log n comparisons, and that is the wall.',
      detail: 'The page checks the two sides of this: log of n factorial lies between half n log n and n log n for every n up to three thousand, and the ratio of log of n factorial to n log n climbs towards one. The bound is tight, not loose.',
      keyword: 'grows like n log n',
      trap: 'Merge sort and heapsort both reach this bound, so neither is asymptotically better than the other in comparisons. Their differences are in space and stability, not in the exponent.',
      narration: 'And log of n factorial grows like n log n. So every comparison sort needs about n log n comparisons, and that is the wall.'
    },

    /* ---------------- scene 4: merge sort ---------------- */
    {
      id: 'merge-1', start: 90, end: 97.5, scene: 'merge',
      caption: 'Merge sort splits the list in half, sorts each half the same way, and merges the two sorted halves.',
      detail: 'The base case is a list of zero or one key, which is already sorted. Everything above it is split, two recursive calls, and one merge. The recursion tree is balanced because the split is by position, not by value.',
      keyword: 'splits the list in half',
      trap: 'The split is at the middle index, so it is balanced whatever the values are. That is the whole reason merge sort cannot be pushed into a bad case by an unlucky input.',
      narration: 'Merge sort splits the list in half, sorts each half the same way, and merges the two sorted halves.'
    },
    {
      id: 'merge-2', start: 97.5, end: 105, scene: 'merge',
      caption: 'A merge walks two pointers and takes the smaller front key each time. Two sorted lists of total size n cost at most n minus one comparisons.',
      detail: 'Every comparison consumes one key into the output. The loop stops when one side runs out, so the last key needs no comparison at all, which is where the minus one comes from.',
      keyword: 'at most n minus one comparisons',
      trap: 'When the two fronts are equal, the choice decides stability. Taking from the left list keeps equal keys in their original order; taking from the right list breaks it.',
      narration: 'A merge walks two pointers and takes the smaller front key each time. Two sorted lists of total size n cost at most n minus one comparisons.'
    },
    {
      id: 'merge-3', start: 105, end: 112.5, scene: 'merge',
      caption: 'Splitting n keys takes n minus one merges in total, and the tree has log base two of n plus one levels, so the cost is n log n.',
      detail: 'The page counts this on every power of two up to one thousand and twenty four: the number of merge operations is exactly n minus one, and the comparison count stays inside the band between half n log n and n log n.',
      keyword: 'n minus one merges',
      trap: 'n minus one is the count of merge operations, not the count of comparisons. Each merge costs up to its own size minus one, and the sizes shrink as you go down the tree.',
      narration: 'Splitting n keys takes n minus one merges in total, and the tree has log base two of n plus one levels, so the cost is n log n.'
    },
    {
      id: 'merge-4', start: 112.5, end: 120, scene: 'merge',
      caption: 'That cost is the same for every input, which makes merge sort the safe answer. It pays for that safety with a second array.',
      detail: 'The top level merge holds both halves and the output at once, which is two n cells. Heapsort does the same job with no second array, which is why the space question separates them.',
      keyword: 'the same for every input',
      trap: 'Merge sort is Theta of n log n in the best case too. It cannot be made linear on a sorted input, which is exactly why it is not the answer to the GATE 2021 question.',
      narration: 'That cost is the same for every input, which makes merge sort the safe answer. It pays for that safety with a second array.'
    },

    /* ---------------- scene 5: quicksort ---------------- */
    {
      id: 'quick-1', start: 120, end: 127.5, scene: 'quick',
      caption: 'Quicksort picks a pivot, moves every smaller key to its left and every larger key to its right, then recurses on both sides.',
      detail: 'The pivot ends up in its final position after one partition, so it never moves again. This is the one structural difference from merge sort: the work happens before the recursion, not after it.',
      keyword: 'picks a pivot',
      trap: 'After one partition the pivot is final but the two sides are not sorted. A question that shows the array after one round expects the pivot in place and everything else merely split.',
      narration: 'Quicksort picks a pivot, moves every smaller key to its left and every larger key to its right, then recurses on both sides.'
    },
    {
      id: 'quick-2', start: 127.5, end: 135, scene: 'quick',
      caption: 'With the last element as pivot and a sorted input, the pivot is always the largest. One side is empty every time, and the cost is quadratic.',
      detail: 'Each partition compares the pivot against all the others and moves nothing to the right. The page checks this exactly: n times n minus one over two comparisons, for every n from two to fifty, on an already sorted input.',
      keyword: 'the pivot is always the largest',
      trap: 'This is the single most examined fact in the topic. A sorted input is the best case for insertion sort and the worst case for this pivot rule. Same input, opposite verdicts.',
      narration: 'With the last element as pivot and a sorted input, the pivot is always the largest. One side is empty every time, and the cost is quadratic.'
    },
    {
      id: 'quick-3', start: 135, end: 142.5, scene: 'quick',
      caption: 'A middle-element pivot does not save you. On the organ-pipe input it costs exactly n squared over four comparisons.',
      detail: 'The organ-pipe input rises to the middle and falls back. No fixed position rule can avoid an adversarial input, because the adversary knows the rule. The page checks that n squared over four is the exact cost at five sizes, and that the ratio to n log n keeps climbing.',
      keyword: 'does not save you',
      trap: 'Choosing a middle position is not choosing a middle value. Only a random pivot or a median-finding pivot removes the quadratic worst case, and a random one removes it only in expectation.',
      narration: 'A middle-element pivot does not save you. On the organ-pipe input it costs exactly n squared over four comparisons.'
    },
    {
      id: 'quick-4', start: 142.5, end: 150, scene: 'quick',
      caption: 'With twenty five keys and a uniformly random pivot, the chance of the worst possible slot is two in twenty five, which is zero point zero eight.',
      detail: 'Only the smallest and the largest of the remaining keys produce a completely one-sided split, so two of the twenty five ranks are bad. That is the GATE 2019 numerical question, and it is why randomisation works: the bad cases exist but are rare.',
      keyword: 'two in twenty five',
      trap: 'The probability is over the pivot choice, not over the input. A random pivot makes every input equally likely to be cheap, but no single run is guaranteed to be fast.',
      narration: 'With twenty five keys and a uniformly random pivot, the chance of the worst possible slot is two in twenty five, which is zero point zero eight.'
    },

    /* ---------------- scene 6: heapsort ---------------- */
    {
      id: 'heap-1', start: 150, end: 157.5, scene: 'heap',
      caption: 'Heapsort starts by arranging the keys into a max heap: a complete binary tree where every parent is at least its children.',
      detail: 'A complete tree fills level by level, so it can live in the array itself with no pointers: the children of index i are two i plus one and two i plus two. The build runs from the last internal node backwards and costs linear time in total.',
      keyword: 'every parent is at least its children',
      trap: 'A heap orders parents against children and says nothing about left against right. So a heap is not a search tree, and its in-order traversal is not sorted.',
      narration: 'Heapsort starts by arranging the keys into a max heap: a complete binary tree where every parent is at least its children.'
    },
    {
      id: 'heap-2', start: 157.5, end: 165, scene: 'heap',
      caption: 'The largest key is then at the root. Swap it to the end, shrink the heap by one, and sift the new root down.',
      detail: 'Sifting down walks one path from the root to a leaf, comparing against the larger child at each step, so it costs at most the height of the heap. After n extractions the array is sorted ascending, with the largest key placed last first.',
      keyword: 'Swap it to the end',
      trap: 'The sorted region grows from the right, so the array is complete only at the very end. A question that shows the array mid-way through heapsort shows a heap prefix followed by a sorted suffix.',
      narration: 'The largest key is then at the root. Swap it to the end, shrink the heap by one, and sift the new root down.'
    },
    {
      id: 'heap-3', start: 165, end: 172.5, scene: 'heap',
      caption: 'Build is linear, then n extractions of log n each. So heapsort is n log n in the worst case, and in every case.',
      detail: 'The page measures the comparison count at every power of two up to one thousand and twenty four and finds it between half n log n and four n log n plus four n, which pins it to Theta of n log n.',
      keyword: 'in the worst case, and in every case',
      trap: 'Heapsort is not adaptive. A sorted input costs it the same as a random one, so it never wins the "fewest comparisons on a sorted array" question and never loses to quicksort on a bad input either.',
      narration: 'Build is linear, then n extractions of log n each. So heapsort is n log n in the worst case, and in every case.'
    },
    {
      id: 'heap-4', start: 172.5, end: 180, scene: 'heap',
      caption: 'Everything happens inside the array, so heapsort needs no second array. But equal keys get rearranged, so it is not stable.',
      detail: 'The page checks both claims by running the algorithm rather than by asserting them: heapsort leaves the caller own array sorted, and a tagged test with duplicate keys shows the tags of equal keys out of order afterwards.',
      keyword: 'no second array',
      trap: 'In place does not mean free. The recursion in quicksort uses a stack, which is memory too, and heapsort uses a handful of index variables. Zero extra memory is not achievable for any sort that must move keys.',
      narration: 'Everything happens inside the array, so heapsort needs no second array. But equal keys get rearranged, so it is not stable.'
    },

    /* ---------------- scene 7: linear sorts ---------------- */
    {
      id: 'linear-1', start: 180, end: 187.5, scene: 'linear',
      caption: 'The n log n wall has a condition: the algorithm learns about keys only by comparing them. Counting sort never compares two keys.',
      detail: 'Counting sort reads each key as an index into a table of counters. It knows that four is less than five because of where they sit in the table, not because it asked. So the decision-tree argument does not describe it.',
      keyword: 'never compares two keys',
      trap: 'This is not a counterexample to the lower bound, it is outside its scope. The bound says no comparison sort beats n log n. It says nothing about an algorithm that does not compare.',
      narration: 'The n log n wall has a condition: the algorithm learns about keys only by comparing them. Counting sort never compares two keys.'
    },
    {
      id: 'linear-2', start: 187.5, end: 195, scene: 'linear',
      caption: 'Counting sort counts occurrences, turns the counts into running totals, then places each key from the right. That costs n plus k.',
      detail: 'Here k is the number of possible key values, the size of the range. Placing from the right, not the left, is what makes counting sort stable, because a later equal key is placed after an earlier one.',
      keyword: 'n plus k',
      trap: 'k is not free. If the keys range over a billion values the counter table is a billion cells, so counting sort is linear in n only when the range is comparable to n. That is the assumption behind every counting-sort answer.',
      narration: 'Counting sort counts occurrences, turns the counts into running totals, then places each key from the right. That costs n plus k.'
    },
    {
      id: 'linear-3', start: 195, end: 202.5, scene: 'linear',
      caption: 'Radix sort repeats a stable digit sort, least significant digit first. Each pass must be stable or the earlier passes are destroyed.',
      detail: 'Eight keys with three digits need three passes, and each pass costs n plus the radix. The total is d times n plus b, where d is the number of digits and b the base. The page counts three passes for the largest key eight hundred and two in base ten.',
      keyword: 'least significant digit first',
      trap: 'The base is the radix, so a question that says "radix sort with ten buckets" has three passes for three digit numbers, not thirty. Reading the radix as two is the usual slip.',
      narration: 'Radix sort repeats a stable digit sort, least significant digit first. Each pass must be stable or the earlier passes are destroyed.'
    },
    {
      id: 'linear-4', start: 202.5, end: 210, scene: 'linear',
      caption: 'So the honest statement is: comparison sorts need n log n, and non-comparison sorts trade that for a range or a digit count.',
      detail: 'Both statements are true at once. The lower bound is about a class of algorithms, not about the problem of sorting. A GATE option that says "sorting cannot be done faster than n log n" is false as written.',
      keyword: 'trade that for a range or a digit count',
      trap: 'On two hundred keys in a range of a hundred, counting sort does fewer operations than the comparison bound allows. That is not a violation, it is a different model of cost.',
      narration: 'So the honest statement is: comparison sorts need n log n, and non-comparison sorts trade that for a range or a digit count.'
    },

    /* ---------------- scene 8: stability and in place ---------------- */
    {
      id: 'stable-1', start: 210, end: 217.5, scene: 'stable',
      caption: 'Here are six records with three distinct keys. Watch what happens to the two records whose key is two.',
      detail: 'Each record carries a tag, its original position. The key is what the sort looks at; the tag is what we watch. A stable sort keeps the tags of equal keys increasing.',
      keyword: 'Watch what happens',
      trap: 'Stability is invisible in the sorted keys. You cannot check it by looking at the output keys, only at the records that carry them.',
      narration: 'Here are six records with three distinct keys. Watch what happens to the two records whose key is two.'
    },
    {
      id: 'stable-2', start: 217.5, end: 225, scene: 'stable',
      caption: 'Insertion sort and merge sort leave them in order. Selection sort and heapsort swap them, because both move a key a long way in one step.',
      detail: 'The page measures this on twelve tagged keys rather than asserting it. Insertion, merge, counting and radix keep the tags increasing; selection, quicksort with the last pivot and heapsort do not.',
      keyword: 'leave them in order',
      trap: 'Quicksort can be made stable, but the standard Lomuto partition is not, because it swaps a key past others without regard to equality. The textbook version is what a GATE question means.',
      narration: 'Insertion sort and merge sort leave them in order. Selection sort and heapsort swap them, because both move a key a long way in one step.'
    },
    {
      id: 'stable-3', start: 225, end: 232.5, scene: 'stable',
      caption: 'Stability matters when you sort twice: sort by name, then by marks, and the stable second sort keeps names alphabetical inside equal marks.',
      detail: 'This is why radix sort requires a stable digit sort, and why a database may insist on a stable sort. Two passes of an unstable sort destroy the information the first pass established.',
      keyword: 'sort by name, then by marks',
      trap: 'Sorting by marks and then by name gives a different answer from sorting by name and then by marks. The order of the passes is part of the specification, not a detail.',
      narration: 'Stability matters when you sort twice: sort by name, then by marks, and the stable second sort keeps names alphabetical inside equal marks.'
    },
    {
      id: 'stable-4', start: 232.5, end: 240, scene: 'stable',
      caption: 'In place is a separate promise: no array proportional to n. Merge sort needs n extra cells, heapsort needs none, quicksort needs a stack of log n.',
      detail: 'The page measures this too. The top level merge of thirty two keys holds sixty four auxiliary cells; heapsort sorts the caller own array and allocates nothing.',
      keyword: 'In place is a separate promise',
      trap: 'Quicksort is often called in place and its recursion still uses a stack. Say which memory you mean: the auxiliary array, or all of it including the stack.',
      narration: 'In place is a separate promise: no array proportional to n. Merge sort needs n extra cells, heapsort needs none, quicksort needs a stack of log n.'
    },

    /* ---------------- scene 9: the decision procedure ---------------- */
    {
      id: 'decide-1', start: 240, end: 247.5, scene: 'decide',
      caption: 'Question one: what is being counted? Comparisons, running time, extra memory, swaps, or stability are five different answers.',
      detail: 'A question that says comparisons is asking for the count of key comparisons, which is a function of the algorithm and the input. A question that says time is asking for the order of growth, which may be the same number or not.',
      keyword: 'what is being counted',
      trap: 'Selection sort wins on swaps and loses on comparisons. Insertion sort wins on comparisons for a sorted input and loses on moves. Never answer the wrong one of the two.',
      narration: 'Question one: what is being counted? Comparisons, running time, extra memory, swaps, or stability are five different answers.'
    },
    {
      id: 'decide-2', start: 247.5, end: 255, scene: 'decide',
      caption: 'Question two: which input? Sorted, reverse sorted, all equal, or arbitrary. The best case of one algorithm is the worst case of another.',
      detail: 'A sorted input of thirty two keys costs insertion sort thirty one comparisons and quicksort four hundred and ninety six. The same input, two answers, both correct for their algorithm.',
      keyword: 'which input',
      trap: 'If the question says "arbitrary input" it wants the worst case, because a bound that must hold for every input must hold for the worst one. If it names an input, use that input.',
      narration: 'Question two: which input? Sorted, reverse sorted, all equal, or arbitrary. The best case of one algorithm is the worst case of another.'
    },
    {
      id: 'decide-3', start: 255, end: 262.5, scene: 'decide',
      caption: 'Question three: which implementation? Bubble sort with and without an early exit gives two different answers on a sorted input.',
      detail: 'The same is true of quicksort, where the pivot rule decides everything, and of merge sort, where the comparison in the merge decides stability. The variant is part of the question even when it is not written.',
      keyword: 'which implementation',
      trap: 'GATE 2016 Set 2 keyed bubble sort as quadratic on an ascending input. That is the no-early-exit version. If you assume the other one you will disagree with the key, so state the assumption in your working.',
      narration: 'Question three: which implementation? Bubble sort with and without an early exit gives two different answers on a sorted input.'
    },
    {
      id: 'decide-4', start: 262.5, end: 270, scene: 'decide',
      caption: 'Question four: is it a comparison sort? If yes the n log n wall applies, and if no it does not. Then look up the row.',
      detail: 'The four questions are asked in this order because each one narrows the table. After them the answer is a single cell of the master table in the next scene, and no algebra is left to do.',
      keyword: 'is it a comparison sort',
      trap: 'The wall applies to the class of algorithms, not to the problem. An option saying sorting is Omega of n log n is false unless it says comparison sorting.',
      narration: 'Question four: is it a comparison sort? If yes the n log n wall applies, and if no it does not. Then look up the row.'
    },

    /* ---------------- scene 10: the master table ---------------- */
    {
      id: 'table-1', start: 270, end: 277.5, scene: 'table',
      caption: 'Seven algorithms, six columns. Best, average, worst, auxiliary space, stable, in place.',
      detail: 'Every cell in this table is either a count the page performed or an order of growth the page measured. The best and average columns are the ones questions quote least and the ones that decide the most answers.',
      keyword: 'Seven algorithms, six columns',
      trap: 'Quicksort average is n log n and its worst is n squared. Both are true. An option is only wrong if the case it names is wrong, so read the case before rejecting the row.',
      narration: 'Seven algorithms, six columns. Best, average, worst, auxiliary space, stable, in place.'
    },
    {
      id: 'table-2', start: 277.5, end: 285, scene: 'table',
      caption: 'Three facts decide most questions: merge sort is the safe one, insertion sort is the adaptive one, and heapsort is the in-place guaranteed one.',
      detail: 'Safe means the same cost on every input. Adaptive means it exploits existing order. Guaranteed and in place means worst case n log n with no second array, at the cost of stability and of being slow on nearly sorted data.',
      keyword: 'the safe one, the adaptive one, the in-place guaranteed one',
      trap: 'There is no algorithm that is best on all six columns. Every question is a trade-off, and the trade-off is the answer.',
      narration: 'Three facts decide most questions: merge sort is the safe one, insertion sort is the adaptive one, and heapsort is the in-place guaranteed one.'
    },
    {
      id: 'table-3', start: 285, end: 292.5, scene: 'table',
      caption: 'The wall is the one number to remember: log base two of n factorial, which is n log n, and it holds for every algorithm that compares.',
      detail: 'Everything else in the topic is a consequence: merge sort and heapsort reach the wall, quicksort reaches it only on average, the simple sorts miss it, and the non-comparison sorts step outside its scope.',
      keyword: 'log base two of n factorial',
      trap: 'The wall is about comparisons, so it is a lower bound on comparisons and not on time. A non-comparison sort is faster in time and still correct.',
      narration: 'The wall is the one number to remember: log base two of n factorial, which is n log n, and it holds for every algorithm that compares.'
    },
    {
      id: 'table-4', start: 292.5, end: 300, scene: 'table',
      caption: 'Next: hashing, the third word in this syllabus line, where the same trade-offs appear as load factor and probe count.',
      detail: 'Hashing is a separate lesson because it is a separate set of questions: hash functions, collision resolution by chaining and open addressing, load factor, expected probes and clustering. It is the third word of "searching, sorting, hashing" and it is not covered here.',
      keyword: 'Next: hashing',
      trap: 'Hashing is not a sorting method and has no n log n bound. Do not carry the wall across to it.',
      narration: 'Next: hashing, the third word in this syllabus line, where the same trade-offs appear as load factor and probe count.'
    }
  ]
};
