# Comparison Lower Bound Decision Trees — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/comparison-lower-bound-decision-trees/index.html`
- Total duration: 5:30 (330 seconds), 11 scenes, 44 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. One floor under every comparison sort

*0:00 – 0:30 · objective: see that three different sorting algorithms at n = 8 spend 17, 28 and 28 comparisons while one number, 16, sits underneath all of them*

**0:00–0:07** — Take eight distinct items and count how many comparisons each algorithm makes. Merge sort spends at most seventeen. Insertion sort and selection sort each spend twenty eight when the input is against them.

> Caption: Sort eight items and count the comparisons: merge sort spends 17, insertion sort 28 in the worst case, selection sort 28.

**0:07–0:15** — Under all three numbers sits sixteen. That is not because the three algorithms share code or share an idea. It is a statement about the problem: no comparison based method can do better, whatever it is written like.

> Caption: Sixteen sits under all three. Not because the algorithms share code, but because the problem itself forbids fewer.

Exam-trap caption mode adds: *A question that asks for the minimum number of comparisons is asking about the problem, not about the algorithm you happen to know.*

**0:15–0:22** — The quantity that matters is not the number of items but the number of possible input orders. Eight items can arrive in eight factorial orders, which is forty thousand three hundred and twenty.

> Caption: The count that matters is orders, not items: eight items have 8! = 40,320 possible input orders.

**0:22–0:30** — Each comparison answers one question with two possible answers. So each comparison can at most double the number of input orders an algorithm has managed to tell apart. Doubling from one, sixteen comparisons distinguish sixty five thousand five hundred and thirty six orders, and fifteen distinguish only thirty two thousand seven hundred and sixty eight, which is fewer than we need.

> Caption: Each comparison answers one yes-or-no question, so it can at most double the number of orders an algorithm has told apart.

## Scene 2. A comparison is a fork in the road

*0:30 – 1:00 · objective: turn an algorithm into a decision tree: one comparison per internal node, two exits, one run per root-to-leaf path*

**0:30–0:37** — Here is the whole idea. Draw the algorithm as a tree. Every internal node is one comparison of two items. The two arrows leaving it are the two possible answers: the first item is smaller, or the second is.

> Caption: Draw the algorithm as a tree. Each internal node is one comparison; the two arrows out of it are the two possible answers.

**0:37–0:45** — Follow one path from the top to a leaf and you have run the algorithm once. Those are the comparisons it made, in that order, on one particular input.

> Caption: Follow one path from the root to a leaf and you have run the algorithm once: those comparisons, in that order, on one input.

**0:45–0:52** — For three items the whole tree is six leaves and a height of three. Each leaf prints one sorted order, and no two different input orders finish at the same leaf, because then the algorithm could not tell them apart.

> Caption: For three items the whole tree has five comparison nodes and six leaves. Every leaf prints one sorted order, and no leaf is reached by two inputs.

**0:52–1:00** — So the algorithm is a binary tree, its leaves are the orders it can tell apart, and its worst case number of comparisons is exactly the height of the tree. Now the question becomes a question about trees.

> Caption: So the tree is a binary tree, its leaves are the orders it can distinguish, and the worst case is its height.

## Scene 3. Every leaf is one input order

*1:00 – 1:30 · objective: see that a correct algorithm needs a separate leaf for each of the n! orders, and that the n = 3 tree uses 6 of its 8 slots*

**1:00–1:07** — A correct algorithm must be able to output any of the possible orders, because any of them can be the sorted answer. So it needs at least as many leaves as there are orders: one leaf for each.

> Caption: A correct algorithm must be able to output any of the n! orders. So it needs at least n! leaves, one per order.

**1:07–1:15** — For three items that is six leaves. A tree of height three has eight slots at its bottom level, so two slots go unused. Slack is allowed; shortage is not.

> Caption: For three items that is six leaves. The tree of height three has eight slots at the bottom, so two slots go unused.

**1:15–1:22** — For four items the requirement is twenty four leaves, and a tree of height four offers only sixteen slots. So height four is impossible before a single line of any algorithm is written.

> Caption: For four items it is 24 leaves against 16 slots at height four, so height four is already impossible before any algorithm is written.

**1:22–1:30** — This is why the argument is called information theoretic. It counts outcomes and never looks inside the algorithm, so it applies to algorithms nobody has invented yet.

> Caption: This is why the argument is called information theoretic: it counts outcomes, and never looks inside the algorithm.

## Scene 4. Leaves cap the height

*1:30 – 2:00 · objective: derive h >= ceil(log2 n!) from the fact that a binary tree of height h has at most 2 to the h leaves*

**1:30–1:37** — A binary tree of height h has at most two to the h leaves. One node at the top, at most two below it, at most four below those, doubling at every level.

> Caption: A binary tree of height h has at most 2 to the h leaves: one at the root, doubling at every level down.

**1:37–1:45** — Now put the two facts together. The tree needs at least n factorial leaves, and a tree of height h can hold at most two to the h. So two to the h is at least n factorial.

> Caption: Combine the two facts: n! leaves are needed, and 2 to the h is all a height h tree can hold. So 2 to the h is at least n!.

**1:45–1:52** — Take logarithms base two of both sides, and remember that a height is a whole number. The height is at least the ceiling of log base two of n factorial. That is the lower bound, and it is exact arithmetic, not an approximation.

> Caption: Take logs and round up: the height is at least the ceiling of log base two of n factorial. That is the lower bound.

**1:52–2:00** — For five items, the requirement is one hundred and twenty leaves. Two to the six is sixty four, which is short. Two to the seven is one hundred and twenty eight, which covers it. So seven comparisons are necessary, and six are not enough.

> Caption: For five items: 2 to the 6 is 64, still short of 120, and 2 to the 7 is 128, so seven comparisons are necessary.

## Scene 5. The exact table, n = 1 to 12

*2:00 – 2:30 · objective: read the computed table of n!, the smallest power of two that covers it, and the ceiling that follows*

**2:00–2:07** — Here is the table, computed on this page rather than quoted. The last column is the answer to the exam question: the smallest height that can hold n factorial leaves.

> Caption: Here is the computed table. The fourth column is the answer to the exam question: the least height that can hold n! leaves.

**2:07–2:15** — Three items give three comparisons, four give five, five give seven, eight give sixteen, and twelve give twenty nine. Those five values are worth remembering, because they are the ones that turn up.

> Caption: n = 3 gives 3, n = 4 gives 5, n = 5 gives 7, n = 8 gives 16, and n = 12 gives 29. Those five are worth memorising.

**2:15–2:22** — One item is already sorted and needs no comparison. Two items need one, because one comparison decides their order. The formula has to give both of those, and it does.

> Caption: n = 1 needs no comparison, and n = 2 needs one. The formula has to give those too, which it does.

**2:22–2:30** — The distance between n factorial and the next power of two is slack. It is the room the algorithm does not have to use, and it is why the answer is a ceiling rather than an exact logarithm.

> Caption: The gap between n! and the power of two above it is the slack. It is why the answer is a ceiling and never a round number.

## Scene 6. Why the ceiling, and why not base three

*2:30 – 3:00 · objective: see why rounding down is impossible, and why the third outcome of a comparison cannot be used for distinct keys*

**2:30–2:37** — Rounding down is not a small error, it is an impossibility. For five items six comparisons hold only sixty four orders, and there are one hundred and twenty. Forty of them would be indistinguishable.

> Caption: Rounding down is not a rounding error, it is an impossibility: for five items, six comparisons hold only 64 of the 120 orders.

Exam-trap caption mode adds: *Writing floor(log2 n!) instead of the ceiling is the most common single mark lost on this topic.*

**2:37–2:45** — A comparison has three outcomes when the items may be equal: smaller, larger, equal. But for distinct items the third can never happen, so a correct algorithm cannot rely on it, and the tree stays binary.

> Caption: A comparison of two distinct items has three outcomes, but only two of them can happen, so the tree stays binary.

**2:45–2:52** — That is why the base is two and not three. Using log base three would suggest about four and a third comparisons for five items, which is far below the seven that are actually needed.

> Caption: That is why the base is two and not three. Using log base three would give about 4.36 for five items, which is far too optimistic.

Exam-trap caption mode adds: *An option with log base 3 is always wrong for comparison sorting of distinct keys.*

**2:52–3:00** — One more reason the answer is a whole number. A height counts comparisons, and an algorithm cannot make half a comparison, so between two whole heights only the larger is usable.

> Caption: One more reason the count is a whole number: a height counts comparisons, and half a comparison does not exist.

## Scene 7. From an exact integer to Theta of n log n

*3:00 – 3:30 · objective: apply Stirling to log2(n!) and read off the leading term n log2 n minus 1.4427 n, hence Theta(n log n)*

**3:00–3:07** — For large n, Stirling replaces the factorial by an expression. In base two, log of n factorial is about n log n, minus one point four four two seven n, plus half of log n, plus a term that vanishes.

> Caption: For large n, Stirling replaces n! by an expression: log base two of n! is about n log n minus 1.4427 n plus a half log n.

**3:07–3:15** — The leading term is n log base two n, and everything else is smaller. So the lower bound is theta of n log n: it grows exactly like n log n, up to a constant factor.

> Caption: The leading term is n log base two n. The rest is lower order, so the bound is Theta of n log n, not merely Omega.

**3:15–3:22** — Merge sort needs n times the ceiling of log n, minus the next power of two above n, plus one. At eight items that is seventeen, against a floor of sixteen. The two agree up to a constant, which is exactly what theta claims.

> Caption: Merge sort needs n ceiling of log n, minus the next power of two, plus one: 17 at n = 8, against a floor of 16.

**3:22–3:30** — That is the whole asymptotic story. A floor of n log n, an algorithm that meets it, and a constant factor that no asymptotic question will ever ask about.

> Caption: That is the whole asymptotic story: a floor of n log n, an algorithm that meets it, and a constant that never matters.

## Scene 8. The bound is achieved, until n = 12

*3:30 – 4:00 · objective: compare the bound with the proven minimum for each n and see the first failure, then the irregular ones after it*

**3:30–3:37** — The bound is a floor and not a promise. Up to eleven items an algorithm reaches it exactly: three, five, seven, ten, thirteen, sixteen, nineteen, twenty two and twenty six comparisons.

> Caption: The bound is a floor, not a promise. Up to n = 11 an algorithm reaches it exactly: 3, 5, 7, 10, 13, 16, 19, 22, 26.

**3:37–3:45** — At twelve items the ceiling is twenty nine, and the proven minimum is thirty. The counting says twenty nine must be possible, and it is not. One comparison of slack that the argument cannot see.

> Caption: At n = 12 the ceiling is 29 and the proven minimum is 30. One comparison of slack the counting cannot see.

Exam-trap caption mode adds: *If a question asks for the minimum comparisons for n = 12, the correct answer is 30, not 29. The bound is not the answer there.*

**3:45–3:52** — The gap is not monotone. It is one from twelve to nineteen, then zero at twenty and twenty one, then one again at twenty two. That irregularity is why nobody has a formula for the exact minimum.

> Caption: The gap is not monotone: it is one from 12 to 19, then zero at 20 and 21, then one again at 22.

**3:52–4:00** — So for the exam, use the ceiling to state the bound, and only claim that number is achievable when the paper asks for it and the value is one of the settled ones.

> Caption: For the exam: use the ceiling for the bound, and only claim a minimum where the paper says it is achievable.

## Scene 9. Where the bound does not apply

*4:00 – 4:30 · objective: see counting sort and radix sort make no comparisons at all, so no decision tree exists and the floor is not a floor for them*

**4:00–4:07** — The bound counts comparisons, and only comparisons. Counting sort compares nothing at all: it reads each key as an index into a tally and increments that slot.

> Caption: The bound counts comparisons. Counting sort compares nothing: it reads each key as an index and tallies it.

**4:07–4:15** — No comparisons means no decision tree, so the counting argument has nothing to count. The floor simply does not apply to a method that never looks at two items together.

> Caption: No comparisons means no decision tree, so the counting argument has nothing to count. The floor does not apply.

**4:15–4:22** — Radix sort makes no comparisons either. It sorts digit by digit from the least significant, so its cost depends on the number of digits rather than on the order of the input.

> Caption: Radix sort makes no comparisons either: it sorts digit by digit, so its cost depends on the number of digits.

**4:22–4:30** — So the floor is real, and conditional. It binds every method that learns about the input only by comparing two items, and it says nothing at all about methods that do something else.

> Caption: So the floor is real and conditional: it binds every method that learns only by comparing, and nothing else.

## Scene 10. The average case is bounded too

*4:30 – 5:00 · objective: see that any binary tree with L leaves has average depth at least log2 L, so the same counting bounds the average*

**4:30–4:37** — The same tree bounds the average case. If the leaves are equally likely, the average depth is at least log base two of the number of leaves, because the balanced tree is the one with the smallest average.

> Caption: The same tree bounds the average: with L leaves, the average depth is at least log base two of L.

**4:37–4:45** — A lopsided tree can have one very short path, but it pays with very long ones. The average is what forbids the trade, and it is why a bad pivot in quicksort hurts every input rather than a few.

> Caption: A lopsided tree pays for its shallow leaves with very deep ones. The average is what forbids that trade.

**4:45–4:52** — Substituting n factorial for the number of leaves gives an average floor of log base two of n factorial, which is the same n log n as the worst case, with a smaller constant.

> Caption: Substituting n! gives an average floor of log base two of n!, the same n log n as the worst case.

**4:52–5:00** — The best case, though, is not bounded at all. Insertion sort finishes an already sorted array in n minus one comparisons, which is far below the floor. The floor is about the worst case and about the average, never about the best.

> Caption: But the best case is not bounded: insertion sort finishes a sorted array in n minus 1 comparisons, well under the floor.

Exam-trap caption mode adds: *Reading the floor as "no algorithm can ever sort in fewer" is the trap. It is a worst-case and average-case statement.*

## Scene 11. The procedure, in five steps

*5:00 – 5:30 · objective: consolidate the model, the counting, the ceiling and the tightness into a procedure that answers any question in this topic*

**5:00–5:07** — Step one is to decide what is being counted. Comparisons in the worst case, comparisons on average, or the comparisons one named algorithm makes on one named input. The three have different answers.

> Caption: Step one: decide what is being counted. Comparisons in the worst case, in the average case, or on one input?

**5:07–5:15** — Step two is the arithmetic. Write two to the h is at least n factorial, then find the smallest power of two that covers n factorial. Doubling from one is the fastest way to do it by hand.

> Caption: Step two: write 2 to the h is at least n!, then find the smallest power of two that covers n factorial.

**5:15–5:22** — Step three is to say what the number is. A floor, or an achievable minimum. They agree up to eleven items and differ from twelve onward, so the wording of the question decides which one it wants.

> Caption: Step three: say whether the number is a floor or an achievable minimum. They differ from n = 12 onward.

**5:22–5:30** — Step four is to name the model: comparisons only, so a counting sort is outside the bound. Step five is to check the base is two and not three. Those five steps answer every question in this topic.

> Caption: Step four: name the model. Comparisons only, so a non-comparison sort is outside the bound. Step five: check the base is two.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
