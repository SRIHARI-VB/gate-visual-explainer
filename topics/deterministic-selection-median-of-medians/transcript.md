# Deterministic Selection Median Of Medians — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/deterministic-selection-median-of-medians/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. One rank, not the whole order

*0:00 – 0:30 · objective: State the selection problem, see that sorting answers every rank when only one is asked for, and name the two algorithms this lesson compares.*

**0:00–0:07** — Selection asks for one rank, not the whole order: given n keys, return the k-th smallest.

> Caption: Selection asks for one rank, not the whole order: given n keys, return the k-th smallest.

**0:07–0:15** — Sorting first answers every rank at once, and the bill is Theta of n log n comparisons.

> Caption: Sorting first answers every rank at once, and the bill is Theta of n log n comparisons.

**0:15–0:22** — Quickselect partitions around a pivot and recurses into one side only: about three n comparisons on average.

> Caption: Quickselect partitions around a pivot and recurses into one side only: about three n comparisons on average.

**0:22–0:30** — Its worst case is quadratic. This lesson builds the pivot that removes that worst case.

> Caption: Its worst case is quadratic. This lesson builds the pivot that removes that worst case.

## Scene 2. Why linear is the right target

*0:30 – 1:00 · objective: Prove that n - 1 comparisons are necessary and sufficient for the minimum, so linear time is optimal for selection and the sorting lower bound does not apply.*

**0:30–0:37** — For the minimum, n minus one comparisons are necessary: every key except one must lose a comparison.

> Caption: For the minimum, n minus one comparisons are necessary: every key except one must lose a comparison.

**0:37–0:45** — n minus one comparisons also suffice, so linear time is optimal for selection.

> Caption: n minus one comparisons also suffice, so linear time is optimal for selection.

**0:45–0:52** — The adversary answers each comparison to keep two candidates alive, so n minus two comparisons cannot decide.

> Caption: The adversary answers each comparison to keep two candidates alive, so n minus two comparisons cannot decide.

**0:52–1:00** — The sorting lower bound of n log n is a bound on sorting, not on selection.

> Caption: The sorting lower bound of n log n is a bound on sorting, not on selection.

Exam-trap caption mode adds: *The n log n lower bound belongs to sorting. Selection can never need more than n - 1 comparisons for the minimum.*

## Scene 3. Quickselect: keep one side

*1:00 – 1:30 · objective: Partition around a pivot, recurse into the side that contains rank k, and count the comparisons on average.*

**1:00–1:07** — Quickselect: partition around a pivot, then recurse into the side that holds rank k.

> Caption: Quickselect: partition around a pivot, then recurse into the side that holds rank k.

**1:07–1:15** — One level costs n minus one comparisons and throws the other side away completely.

> Caption: One level costs n minus one comparisons and throws the other side away completely.

**1:15–1:22** — A pivot near the middle halves the problem: n plus n over 2 plus n over 4 is at most 2n.

> Caption: A pivot near the middle halves the problem: n plus n over 2 plus n over 4 is at most 2n.

**1:22–1:30** — Randomised over 20 seeded runs at n = 1024: three point two five n comparisons on average, four point six one n at worst.

> Caption: Randomised over 20 seeded runs at n = 1024: 3.25n comparisons on average, 4.61n at worst.

Exam-trap caption mode adds: *Expected linear time is not worst-case linear time. A question that says worst case is not answered by the average.*

## Scene 4. The quadratic worst case

*1:30 – 2:00 · objective: Run quickselect on sorted input with the first element as pivot, see n(n-1)/2 comparisons, and understand that no randomisation promise covers an adversarial input.*

**1:30–1:37** — Sorted input, pivot equal to the first element, and k equal to n: each partition peels off one key.

> Caption: Sorted input, pivot equal to the first element, and k equal to n: each partition peels off one key.

**1:37–1:45** — The costs are n minus 1, then n minus 2, and so on: n times n minus one over two comparisons. At n = 64 that is two thousand and sixteen.

> Caption: The costs are n minus 1, then n minus 2, and so on: n(n-1)/2 comparisons. At n = 64 that is 2,016.

**1:45–1:52** — Asking for the middle is no better on this input: one thousand five hundred and twenty comparisons at n = 64 against the two thousand and sixteen bound.

> Caption: Asking for the middle is no better on this input: 1,520 comparisons at n = 64 against the 2,016 bound.

**1:52–2:00** — Nothing in this input is random, so no average-case promise applies. A deterministic pivot is needed.

> Caption: Nothing in this input is random, so no average-case promise applies. A deterministic pivot is needed.

## Scene 5. Step 1: groups of five

*2:00 – 2:30 · objective: Cut 25 keys into five groups, find each group median in at most 7 comparisons, and collect the five medians.*

**2:00–2:07** — Median of medians, step one: cut the 25 keys into five groups of five, in input order.

> Caption: Median of medians, step one: cut the 25 keys into five groups of five, in input order.

**2:07–2:15** — Sorting each group of five costs at most seven comparisons, a constant, so all the groups cost O(n).

> Caption: Sorting each group of five costs at most 7 comparisons, a constant, so all the groups cost O(n).

**2:15–2:22** — The group medians of this array are seventeen, twenty-nine, nineteen, twenty-one and twenty-seven.

> Caption: The group medians of this array are 17, 29, 19, 21 and 27.

**2:22–2:30** — Step two: select the median of those five medians, using the same algorithm recursively.

> Caption: Step two: select the median of those five medians, using the same algorithm recursively.

## Scene 6. Step 2: the median of the medians

*2:30 – 3:00 · objective: Select the median of the five medians by the same algorithm, then partition the whole array around it.*

**2:30–2:37** — The recursive call is on five keys, so the pivot costs a fifth of the input, not the whole of it.

> Caption: The recursive call is on 5 keys, so the pivot costs a fifth of the input, not the whole of it.

**2:37–2:45** — Twenty-one is the median of the medians. Here it is also the median of all twenty-five, which is luck, not a promise.

> Caption: 21 is the median of the medians. Here it is also the median of all 25, which is luck, not a promise.

Exam-trap caption mode adds: *The median of medians is not the median. It is only guaranteed to lie between the 3n/10 and the 7n/10 positions.*

**2:45–2:52** — Step three: partition the whole array around twenty-one, exactly as quicksort would.

> Caption: Step three: partition the whole array around 21, exactly as quicksort would.

**2:52–3:00** — Twelve keys are smaller and twelve larger, so rank thirteen is the pivot itself and the search ends.

> Caption: Twelve keys are smaller and twelve larger, so rank 13 is the pivot itself and the search ends.

## Scene 7. Step 3: the counting lemma

*3:00 – 3:30 · objective: Count the keys that must lie on each side of the median of medians: at least 3n/10 - 6, so at most 7n/10 + 6 remain for the recursion.*

**3:00–3:07** — Why twenty-one must sit near the middle: at least half of the group medians are greater than or equal to it.

> Caption: Why 21 must sit near the middle: at least half of the group medians are greater than or equal to it.

**3:07–3:15** — Each of those groups then contributes at least three keys greater than or equal to its median.

> Caption: Each of those groups then contributes at least three keys greater than or equal to its median.

**3:15–3:22** — So at least three n over ten minus six keys lie on each side. Here the true counts are twelve and twelve.

> Caption: So at least 3n/10 minus 6 keys lie on each side. Here the true counts are 12 and 12.

**3:22–3:30** — The larger side holds at most seven n over ten plus six keys, so the recursion is at most seven tenths of the input.

> Caption: The larger side holds at most 7n/10 plus 6 keys, so the recursion is at most seven tenths of the input.

## Scene 8. The recurrence that gives linear time

*3:30 – 4:00 · objective: Write T(n) <= T(n/5) + T(7n/10) + O(n), see the level sums form a geometric series with ratio 9/10, and check the bound against measured comparison counts.*

**3:30–3:37** — T of n is at most T of n over five plus T of seven n over ten plus O of n: a fifth for the pivot, seven tenths to recurse.

> Caption: T(n) is at most T(n/5) plus T(7n/10) plus O(n): a fifth for the pivot, seven tenths to recurse.

**3:37–3:45** — A fifth plus seven tenths is nine tenths, so the level sums shrink geometrically: n, nine tenths of n, eighty-one hundredths of n.

> Caption: A fifth plus seven tenths is nine tenths, so the level sums shrink geometrically: n, 0.9n, 0.81n.

**3:45–3:52** — The geometric sum is at most ten n, so T of n is O of n: the first worst-case linear selection.

> Caption: The geometric sum is at most ten n, so T(n) is O(n): the first worst-case linear selection.

**3:52–4:00** — Measured comparisons: one hundred and three at n = 25, seven thousand one hundred and seven at n = 1,000 and twenty-nine thousand five hundred and five at n = 4,096.

> Caption: Measured comparisons: 103 at n = 25, 7,107 at n = 1,000 and 29,505 at n = 4,096.

## Scene 9. Why five, and not three

*4:00 – 4:30 · objective: Derive the general split guarantee 3(g+1)/(4g), see that g = 3 gives exactly 1 and no decay, and read the solved recurrences for g = 5 and g = 3.*

**4:00–4:07** — With groups of size g, each side is guaranteed at least g plus one, over four g, of the input.

> Caption: With groups of size g, each side is guaranteed at least (g+1)/(4g) of the input.

**4:07–4:15** — g equals five gives one fifth plus seven tenths, which is nine tenths. g equals seven gives six sevenths. Both shrink.

> Caption: g = 5 gives one fifth plus seven tenths, which is 0.9. g = 7 gives 6/7. Both shrink.

**4:15–4:22** — g equals three gives one third plus two thirds, exactly one, so the levels do not shrink: Theta of n log n.

> Caption: g = 3 gives one third plus two thirds, exactly 1, so the levels do not shrink: Theta of n log n.

Exam-trap caption mode adds: *Groups of three do not give a worse constant factor. They remove the geometric decay altogether.*

**4:22–4:30** — Solving both recurrences: T of n over n settles near eight and a half for groups of five, and keeps climbing for groups of three.

> Caption: Solving both recurrences: T(n)/n settles near 8.5 for groups of 5 and keeps climbing for groups of 3.

## Scene 10. How GATE asks it

*4:30 – 5:00 · objective: Read three previous-year questions on guaranteed pivots and selection, and extract the one idea they share.*

**4:30–4:37** — GATE 2019: the median of medians of n arrays of n keys costs Theta of n squared.

> Caption: GATE 2019: the median of medians of n arrays of n keys costs Theta of n squared.

**4:37–4:45** — GATE 2008: a pivot that leaves at least n over five on each side gives T of n at most T of n over five plus T of four n over five plus n.

> Caption: GATE 2008: a pivot that leaves at least n/5 on each side gives T(n) at most T(n/5) + T(4n/5) + n.

**4:45–4:52** — GATE 2006: if the median can be found in O of n, quicksort with the median as pivot is Theta of n log n.

> Caption: GATE 2006: if the median can be found in O(n), quicksort with the median as pivot is Theta of n log n.

**4:52–5:00** — Three questions, one idea: a guaranteed good pivot is what removes the quadratic case.

> Caption: Three questions, one idea: a guaranteed good pivot is what removes the quadratic case.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
