# Best Average Worst And Amortised Analysis — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/best-average-worst-and-amortised-analysis/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Three functions, not three estimates

*0:00 – 0:30 · objective: Separate best, average and worst into three functions of n, see them drawn from one algorithm, and settle the one relation between the average and the worst that always holds.*

**0:00–0:07** — Three questions about one algorithm. What is the cheapest run, the typical run, and the dearest run?

> Caption: Three questions about one algorithm: what is the cheapest run, the typical run, and the dearest run?

**0:07–0:15** — Insertion sort on n keys. Best is n minus one comparisons. Average is n times n minus one over four, plus n minus H of n. Worst is n times n minus one over two.

> Caption: Insertion sort on n keys: best n minus one, average n times n minus one over four plus n minus H of n, worst n times n minus one over two.

**0:15–0:22** — The average always lies between the best and the worst, whatever the distribution is. That much is free.

> Caption: The average always lies between the best and the worst, whatever the distribution is. That much is free.

**0:22–0:30** — GATE twenty twelve asked which relation always holds between the average and the worst. The answer was: the average is big O of the worst.

> Caption: GATE 2012 asked which relation always holds between the average and the worst. The answer was: the average is O of the worst.

## Scene 2. The worst case is an adversary, and it needs two bounds

*0:30 – 1:00 · objective: Read the worst case as the answer to a game against an adversary who sees the algorithm, and see why "worst case is Theta of n" is an upper and a lower bound at once.*

**0:30–0:37** — Linear search over ten slots. One comparison if the key is first, ten if it is last, ten if it is absent.

> Caption: Linear search over ten slots: one comparison if the key is first, ten if it is last, ten if it is absent.

**0:37–0:45** — The worst case is a game. An adversary picks the input after reading your algorithm.

> Caption: The worst case is a game: an adversary picks the input after reading your algorithm.

**0:45–0:52** — Saying the worst case is Theta of n is two claims. Never more than c times n, and sometimes at least c prime times n.

> Caption: Saying the worst case is Theta of n is two claims: never more than c times n, and sometimes at least c prime times n.

**0:52–1:00** — GATE twenty twenty four set one asked this of a single pass sortedness check, and the answer was both O of N and Omega of N.

> Caption: GATE 2024 Set 1 asked this of a single-pass sortedness check, and the answer was both O of N and Omega of N.

Exam-trap caption mode adds: *An early exit does not lower the worst case. The input where nothing triggers the exit is still an input of size N, and the worst case is a maximum over all of them.*

## Scene 3. An average is a weighted average, so it needs weights

*1:00 – 1:30 · objective: Compute the average cost of linear search as a function of the probability that the key is present, and watch the average move while the best and the worst stay put.*

**1:00–1:07** — An average is a weighted average over inputs, so it is not a number until the weights are named.

> Caption: An average is a weighted average over inputs, so it is not a number until the weights are named.

**1:07–1:15** — Key present with probability p at a uniform position. The average is p times n plus one over two, plus one minus p times n.

> Caption: Key present with probability p at a uniform position: the average is p times n plus one over two, plus one minus p times n.

**1:15–1:22** — At ten slots. P equal to one gives five point five. P equal to a half gives seven point seven five. P equal to zero point two gives nine point one.

> Caption: At ten slots: p equal to one gives 5.5, p equal to a half gives 7.75, and p equal to 0.2 gives 9.1.

**1:22–1:30** — The best and the worst never moved. Only the distribution moved, and it carried the average most of the way to the worst.

> Caption: The best and the worst never moved. Only the distribution moved, and it carried the average most of the way to the worst.

## Scene 4. All 40,320 orderings of eight keys: 13, 16.92 and 28

*1:30 – 2:00 · objective: Enumerate every input of a quicksort, plot the comparison count of each, and read the three cases off one distribution — then check the closed form against the enumeration.*

**1:30–1:37** — Run first element quicksort on all forty thousand three hundred and twenty orderings of eight keys, and count the comparisons of each run.

> Caption: Run first-element quicksort on all 40,320 orderings of eight keys and count the comparisons of each run.

**1:37–1:45** — The cheapest ordering costs thirteen comparisons, the dearest twenty eight, and the mean over all orderings is sixteen point nine two.

> Caption: The cheapest ordering costs 13 comparisons, the dearest 28, and the mean over all orderings is 16.92.

**1:45–1:52** — The closed form, two times n plus one times H of n minus four n, gives sixteen point nine two one four. The same number the enumeration produced.

> Caption: The closed form two times n plus one times H of n, minus four n, gives 16.9214 — the same number the enumeration produced.

**1:52–2:00** — The mean is not the middle. The median is sixteen and the midpoint of the range is twenty point five, but only the mean is the average case.

> Caption: The mean is not the middle. The median is 16 and the midpoint of the range is 20.5, but only the mean is the average case.

Exam-trap caption mode adds: *The average case is an average over inputs, not over the algorithm's own random choices. A random pivot makes a different quantity, the expected cost, and the two are computed differently.*

## Scene 5. Amortised analysis is about a sequence, and no probability enters

*2:00 – 2:30 · objective: Contrast a single expensive operation with the cost of the whole sequence, using a stack with MULTIPOP, and name the aggregate method.*

**2:00–2:07** — Amortised analysis asks a different question. What does a whole sequence of operations cost?

> Caption: Amortised analysis asks a different question: what does a whole sequence of operations cost?

**2:07–2:15** — A stack with MULTIPOP. One call can pop every item, so a single operation costs Theta of n.

> Caption: A stack with MULTIPOP: one call can pop every item, so a single operation costs Theta of n.

**2:15–2:22** — But each item is pushed once and popped once, so one hundred and two operations cost two hundred units in total.

> Caption: But each item is pushed once and popped once, so 102 operations cost 200 units in total.

**2:22–2:30** — No probability was used. The aggregate method bounds the total, then divides by the number of operations.

> Caption: No probability was used. The aggregate method bounds the total, then divides by the number of operations.

Exam-trap caption mode adds: *Amortised is not average. Nothing in the argument is random, and the bound holds for every sequence, including the one an adversary designed to be expensive.*

## Scene 6. Doubling a table: one insertion costs 513, and 1,024 cost 2,047

*2:30 – 3:00 · objective: Trace the cost of growing a table by doubling, find the amortised cost of an insertion, and see why a fixed increment destroys the bound.*

**2:30–2:37** — A table that doubles when full. The first ten insertions cost one, two, three, one, five, one, one, one, nine and one.

> Caption: A table that doubles when full: the first ten insertions cost 1, 2, 3, 1, 5, 1, 1, 1, 9 and 1.

**2:37–2:45** — The five hundred and thirteenth insertion copies five hundred and twelve items, so one operation is Theta of n while the amortised cost is under two.

> Caption: The 513th insertion copies 512 items, so one operation is Theta of n while the amortised cost is under two.

**2:45–2:52** — One thousand and twenty four insertions cost two thousand and forty seven units in total, so the amortised cost per insertion is just under two.

> Caption: 1,024 insertions cost 2,047 units in total, so the amortised cost per insertion is just under 2.

**2:52–3:00** — Growth must be geometric. Growing by a fixed ten instead makes the cost per insertion rise without bound.

> Caption: Growth must be geometric. Growing by a fixed ten instead makes the cost per insertion rise without bound.

## Scene 7. Two ways to prove it: the bank balance and the potential

*3:00 – 3:30 · objective: Run the accounting method and the potential method on the same table, see both produce a charge of at most three, and state the condition a potential must satisfy.*

**3:00–3:07** — Accounting method. Charge every insertion three units and keep the surplus in a bank.

> Caption: Accounting method: charge every insertion three units and keep the surplus in a bank.

**3:07–3:15** — The balance never goes negative, and the sum of the charges is an upper bound on the sum of the true costs.

> Caption: The balance never goes negative, and the sum of the charges is an upper bound on the sum of the true costs.

**3:15–3:22** — Potential method. Define a potential that is zero at the start and never negative, then charge the cost plus the change in potential.

> Caption: Potential method: define a potential that is zero at the start and never negative, then charge the cost plus the change in potential.

**3:22–3:30** — With potential two times items minus size, every insertion is charged at most three. The same answer by another route.

> Caption: With potential two times items minus size, every insertion is charged at most three — the same answer by another route.

Exam-trap caption mode adds: *A potential that can go negative proves nothing. The telescoping argument needs the final potential to be at least the initial one, so a potential that dips below zero can hide an unbounded true cost.*

## Scene 8. Time and space are separate claims

*3:30 – 4:00 · objective: Cover the space half of "worst case time and space complexity": auxiliary space against recursion depth, and why an in-place sort still has a worst-case space cost.*

**3:30–3:37** — The syllabus says worst case time and space. They are two answers, and GATE asks for them separately.

> Caption: The syllabus says worst-case time and space. They are two answers, and GATE asks for them separately.

**3:37–3:45** — Merge sort needs n extra cells and a stack of depth log n. Quicksort needs no extra array but still has a stack.

> Caption: Merge sort needs n extra cells and a stack of depth log n; quicksort needs no extra array but still has a stack.

**3:45–3:52** — That stack is the space cost. Depth eight on eight sorted keys with a first element pivot, and depth four when the splits balance.

> Caption: That stack is the space cost: depth 8 on eight sorted keys with a first-element pivot, and depth 4 when the splits balance.

**3:52–4:00** — So quicksort is in place in the array sense, and still Theta of n in the worst case in the stack sense.

> Caption: So quicksort is in place in the array sense and still Theta of n in the worst case in the stack sense.

## Scene 9. Expected is neither average nor amortised

*4:00 – 4:30 · objective: Place the three quantities side by side — worst case over inputs, average over a distribution, amortised over a sequence, expected over the algorithm's own coins — and see what randomisation does and does not remove.*

**4:00–4:07** — Randomised quicksort chooses its pivot by coin, so no input can be built to force the bad split.

> Caption: Randomised quicksort chooses its pivot by coin, so no input can be built to force the bad split.

**4:07–4:15** — The worst case is still n squared, and GATE two thousand and one asked exactly that. O of n squared.

> Caption: The worst case is still n squared, and GATE 2001 asked exactly that: O of n squared.

**4:15–4:22** — Expected is a probability weighted cost over the coins. Amortised is a worst case bound over a sequence.

> Caption: Expected is a probability-weighted cost over the coins; amortised is a worst-case bound over a sequence.

**4:22–4:30** — The chance of hitting the all bad run falls fast. Zero point zero zero three two at eight keys, and one point six times ten to the minus nine at sixteen.

> Caption: The chance of hitting the all-bad run falls fast: 0.0032 at eight keys and 1.6 times ten to the minus nine at sixteen.

## Scene 10. The procedure, and the four traps

*4:30 – 5:00 · objective: Reduce the topic to four questions asked in order, and name the four traps that decide the mark.*

**4:30–4:37** — First name the quantity. Worst case, average case, amortised over a sequence, or expected over coins.

> Caption: First name the quantity: worst case, average case, amortised over a sequence, or expected over coins.

**4:37–4:45** — If average, demand the distribution. If amortised, name the sequence and check that growth is geometric.

> Caption: If average, demand the distribution; if amortised, name the sequence and check that growth is geometric.

**4:45–4:52** — Then check the bound. O is an upper bound, Omega a lower bound, and a worst case usually deserves Theta.

> Caption: Then check the bound: O is an upper bound, Omega a lower bound, and a worst case usually deserves Theta.

**4:52–5:00** — The four traps. Average is not amortised. O is not the worst case. One cheap operation proves nothing. And space is separate.

> Caption: The four traps: average is not amortised, O is not the worst case, one cheap operation proves nothing, and space is separate.

Exam-trap caption mode adds: *A fifth trap hides in the wording: "the worst case is O of n squared" and "the worst case is Theta of n squared" are different claims, and only the second rules out a tighter bound.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
