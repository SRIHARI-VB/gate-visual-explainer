# Greedy Algorithms — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/greedy-algorithms/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. What "greedy" promises, and what it does not

*0:00 – 0:30 · objective: Separate the three claims that get confused: greedy makes a locally best choice, it never takes that choice back, and it is correct only when a proof says so.*

**0:00–0:07** — A greedy algorithm builds a solution one piece at a time, and at each step takes the piece that looks best right now.

> Caption: A greedy algorithm builds a solution one piece at a time, and at each step takes the piece that looks best right now.

Exam-trap caption mode adds: *The rule is fixed in advance, not chosen to suit the input. A procedure that tries one rule and then another has stopped being a single greedy algorithm and needs a proof that covers both.*

**0:07–0:15** — The second half of the promise: the choice is never taken back. No backtracking, no trying the alternative.

> Caption: The second half of the promise: the choice is never taken back. No backtracking, no trying the alternative.

Exam-trap caption mode adds: *"Greedy" is not a synonym for "fast" and not a synonym for "optimal". It names a shape of algorithm. Whether that shape is correct is a separate question with a separate proof.*

**0:15–0:22** — Two properties are needed for a correct greedy algorithm: optimal substructure, and the greedy-choice property.

> Caption: Two properties are needed for a correct greedy algorithm: optimal substructure, and the greedy-choice property.

Exam-trap caption mode adds: *Optimal substructure alone does not license a greedy algorithm. Knapsack has optimal substructure and still defeats greedy, which is the whole of scene 7.*

**0:22–0:30** — So the exam question is never, is this greedy. It is, is this greedy choice provably safe, and on which instances.

> Caption: So the exam question is never "is this greedy?" It is "is this greedy choice provably safe, and on which instances?"

Exam-trap caption mode adds: *An answer that says "greedy works because it is optimal" is circular. The marks are for the exchange step, or for the one-line counterexample that kills the claim.*

## Scene 2. Greed is not always right: the coin counterexample

*0:30 – 1:00 · objective: Watch largest-coin-first fail on the coin set 1, 3, 4 for the amount 6, and name the property that is missing.*

**0:30–0:37** — Making change: pay 6 units using as few coins as possible from the set 1, 3 and 4.

> Caption: Making change: pay 6 units using as few coins as possible from the set 1, 3 and 4.

Exam-trap caption mode adds: *Do not confuse "fewest coins" with "largest coins". The largest-coin rule is one candidate criterion, and scene 2 exists to show it is the wrong one here.*

**0:37–0:45** — Greedy takes the largest coin that fits: 4, leaving 2. Then 1, then 1. Three coins.

> Caption: Greedy takes the largest coin that fits: 4, leaving 2. Then 1, then 1. Three coins.

Exam-trap caption mode adds: *The trace is not an error in the algorithm. Largest-coin-first is exactly this. The error is believing that this rule is optimal for every coin set.*

**0:45–0:52** — Two coins of 3 also pay 6. The optimum is 2, so this greedy rule is not optimal on this set.

> Caption: Two coins of 3 also pay 6. The optimum is 2, so this greedy rule is not optimal on this set.

Exam-trap caption mode adds: *One counterexample is enough to refute a claimed greedy algorithm. No number of instances where it happens to work can establish that it always works.*

**0:52–1:00** — With coins 1, 2 and 5 the same rule is optimal, and with 1, 3 and 4 it is not. Correctness is a property of the pair: rule and instance family.

> Caption: With coins 1, 2 and 5 the same rule is optimal, and with 1, 3 and 4 it is not. Correctness is a property of the pair: rule and instance family.

Exam-trap caption mode adds: *"Greedy fails for coin change" is too strong a conclusion. It fails for some sets and succeeds for others. The exam-safe statement is that greedy has no general guarantee here, so DP is the safe method.*

## Scene 3. Activity selection: sorting by finish time

*1:00 – 1:30 · objective: Run the earliest-finish rule on eleven intervals, see which are kept and which are rejected, and count the result.*

**1:00–1:07** — Eleven activities, each an interval from a start time to a finish time. One room. Choose as many non-overlapping activities as possible.

> Caption: Eleven activities, each an interval from a start time to a finish time. One room. Choose as many non-overlapping activities as possible.

Exam-trap caption mode adds: *Maximising the number of activities is not the same as maximising the time the room is busy. A schedule of many short activities can cover less time than one long activity.*

**1:07–1:15** — Sort by finish time. That is the only preparation the algorithm needs.

> Caption: Sort by finish time. That is the only preparation the algorithm needs.

Exam-trap caption mode adds: *The sort key is finish time, not start time and not duration. Sorting by start time gives the earliest-start rule of scene 4, which is refuted there.*

**1:15–1:22** — Take the first activity, then walk right and keep an activity exactly when its start is at or after the last finish taken.

> Caption: Take the first activity, then walk right and keep an activity exactly when its start is at or after the last finish taken.

Exam-trap caption mode adds: *The comparison is against the last activity taken, not against all activities taken. Keeping the running finish time is what makes the scan linear instead of quadratic.*

**1:22–1:30** — The greedy answer is a1, a4, a8, a11: four activities. An exhaustive search over all subsets confirms that four is the maximum.

> Caption: The greedy answer is a1, a4, a8, a11: four activities. An exhaustive search over all subsets confirms that four is the maximum.

Exam-trap caption mode adds: *Matching the optimum on one instance proves nothing in general. Scene 5 supplies the proof; this scene only supplies the check.*

## Scene 4. Why earliest finish, and not the two rules that look right

*1:30 – 2:00 · objective: Refute shortest-first and earliest-start-first with two small instances, and see that the correct criterion is a claim that needs proof.*

**1:30–1:37** — Three criteria look reasonable: shortest activity first, earliest start first, earliest finish first. Only the third is safe.

> Caption: Three criteria look reasonable: shortest activity first, earliest start first, earliest finish first. Only the third is safe.

Exam-trap caption mode adds: *A criterion that gives the right answer on the textbook instance is not thereby correct. Both wrong rules below agree with the right one on many inputs.*

**1:37–1:45** — Shortest first fails. The short activity blocks the two long ones, so greedy returns one activity where two are possible.

> Caption: Shortest first fails: with the long activities 0 to 5 and 5 to 10 plus a short one from 4 to 6, greedy takes the short one and stops at one activity.

Exam-trap caption mode adds: *This is the standard trap in the topic: a locally small choice can be globally expensive, because the cost of a choice is the space it occupies, not its length.*

**1:45–1:52** — Earliest start fails on the eleven-activity instance itself: activity a3 starts at zero and runs to six, and that single choice leaves only three activities where four are possible.

> Caption: Earliest start fails on the eleven-activity instance itself: activity a3 starts at 0 and runs to 6, and that single choice leaves only three activities where four are possible.

Exam-trap caption mode adds: *This refutation uses the very instance scene 3 used, so the two scenes cannot both be satisfied by the earliest-start rule. That is the point of showing them on one picture.*

**1:52–2:00** — Earliest finish is safe because finishing early cannot reduce what remains. That sentence is the intuition; the next scene turns it into an argument.

> Caption: Earliest finish is safe because finishing early cannot reduce what remains. That sentence is the intuition; scene 5 turns it into an argument.

Exam-trap caption mode adds: *An intuition is not a proof. The exam wants the exchange step, and the intuition alone earns nothing on a proof-based question.*

## Scene 5. The exchange argument, drawn

*2:00 – 2:30 · objective: See the proof shape: take any optimal solution, find the first place it differs from greedy, swap that one choice, and show nothing breaks.*

**2:00–2:07** — An exchange argument compares the greedy solution with an arbitrary optimal one, and swaps one choice at a time until they agree.

> Caption: An exchange argument compares the greedy solution with an arbitrary optimal one, and swaps one choice at a time until they agree.

Exam-trap caption mode adds: *The argument must start from an arbitrary optimal solution, not from the greedy one. Starting from greedy and arguing it is optimal is assuming the conclusion.*

**2:07–2:15** — Let the optimal solution be S star, and let g be the activity greedy takes first. If g is already in S star, there is nothing to do.

> Caption: Let the optimal solution be S star, and let g be the activity greedy takes first. If g is already in S star, there is nothing to do.

Exam-trap caption mode adds: *A proof that only handles the easy case is not a proof. The exam mark lives in the case where the two solutions differ.*

**2:15–2:22** — If not, let s be the first activity of S star. Greedy chose g because g finishes no later than s. Replace s by g.

> Caption: If not, let s be the first activity of S star. Greedy chose g because g finishes no later than s. Replace s by g.

Exam-trap caption mode adds: *Both facts are needed: same size, and still feasible. Same size alone would allow an overlapping set, and feasible alone would allow a smaller one.*

**2:22–2:30** — Now an optimal solution agrees with greedy on the first choice, so the remaining problem is the same shape and smaller. Induct on the number of activities.

> Caption: Now an optimal solution agrees with greedy on the first choice, so the remaining problem is the same shape and smaller. Induct on the number of activities.

Exam-trap caption mode adds: *The induction needs the subproblem to be an instance of the same problem, which it is here. For a problem where it is not, the greedy proof needs a different tool, and that gap is exactly where greedy claims usually break.*

## Scene 6. Fractional knapsack: greed on a ratio

*2:30 – 3:00 · objective: Fill a knapsack by value per unit weight, take a fraction of the last item, and see why divisibility is what makes the exchange step work.*

**2:30–2:37** — Fractional knapsack: a bag of capacity 50, and three items whose fractions may be taken.

> Caption: Fractional knapsack: a bag of capacity 50, and three items whose fractions may be taken.

Exam-trap caption mode adds: *The word "fractional" is the entire licence for greedy here. Nothing else about the problem changes in scene 7, and greedy stops being optimal.*

**2:37–2:45** — The greedy criterion is value per unit weight: 6, 5 and 4. Sort descending, then fill.

> Caption: The greedy criterion is value per unit weight: 6, 5 and 4. Sort descending, then fill.

Exam-trap caption mode adds: *Sorting by total value instead gives the order I3, I2, I1 and is not optimal. The ratio, not the value and not the weight, is the criterion.*

**2:45–2:52** — Take I1 whole for 60 and 10 units of weight, I2 whole for 100 and 20 more. Capacity used is 30, so 20 remain.

> Caption: Take I1 whole for 60 and 10 units of weight, I2 whole for 100 and 20 more. Capacity used is 30, so 20 remain.

Exam-trap caption mode adds: *The order of the two whole items is forced by the sort, so there is nothing to optimise in this step. All the freedom lives in the last item.*

**2:52–3:00** — I3 does not fit whole, so take two thirds of it for 80. Total 240, and the exchange argument works because a fraction can always be trimmed.

> Caption: I3 does not fit whole, so take two thirds of it for 80. Total 240, and the exchange argument works because a fraction can always be trimmed.

Exam-trap caption mode adds: *At most one item is ever taken partially, and it is the last one reached. A solution with two partial items is not what this greedy produces.*

## Scene 7. The same instance, one word changed, greed loses

*3:00 – 3:30 · objective: Run the identical ratio rule on 0/1 knapsack and get 160 where the optimum is 220, then say exactly which step of the proof fails.*

**3:00–3:07** — Same bag, same capacity, same three items. One word changes: each item is taken whole or not at all.

> Caption: Same bag, same capacity, same three items. One word changes: each item is taken whole or not at all.

Exam-trap caption mode adds: *Students often remember "knapsack is DP". The correct statement is narrower: the 0/1 version needs DP, the fractional version does not.*

**3:07–3:15** — Ratio order is still I1 then I2 then I3. Greedy takes I1 and I2 for 160, and I3 no longer fits.

> Caption: Ratio order is still I1 then I2 then I3. Greedy takes I1 and I2 for 160, and I3 no longer fits.

Exam-trap caption mode adds: *The idle 20 units are the visible symptom. In the fractional version the same 20 units were filled, which is why the two versions part company here.*

**3:15–3:22** — I2 and I3 together weigh exactly 50 and are worth 220. Greedy is off by 60.

> Caption: I2 and I3 together weigh exactly 50 and are worth 220. Greedy is off by 60.

Exam-trap caption mode adds: *Do not describe this as greedy being "slightly suboptimal". Greedy can be arbitrarily far from optimal on 0/1 knapsack, and no small tweak to the ratio rule fixes it in general.*

**3:22–3:30** — The exchange step fails because a whole item cannot be trimmed to fill the gap. Divisibility was load-bearing.

> Caption: The exchange step fails because a whole item cannot be trimmed to fill the gap. Divisibility was load-bearing.

Exam-trap caption mode adds: *Optimal substructure still holds for 0/1 knapsack, so the failure is not structural. It is the greedy-choice property that fails, and naming the right one of the two properties is worth marks.*

## Scene 8. Huffman coding: merge the two lightest

*3:30 – 4:00 · objective: Build a Huffman tree by repeatedly merging the two smallest weights, and read the cost off the merges rather than off the leaves.*

**3:30–3:37** — Huffman coding: give frequent symbols short codes, and keep the code prefix-free so decoding is unambiguous.

> Caption: Huffman coding: give frequent symbols short codes, and keep the code prefix-free so decoding is unambiguous.

Exam-trap caption mode adds: *The objective is total bits, which equals frequency times depth summed. Minimising the average code length and minimising the total bits are the same objective, scaled.*

**3:37–3:45** — Start with one leaf per symbol. Repeatedly merge the two lightest nodes into a parent whose weight is their sum.

> Caption: Start with one leaf per symbol. Repeatedly merge the two lightest nodes into a parent whose weight is their sum.

Exam-trap caption mode adds: *After each merge the new parent goes back into the pool and can be merged again. Forgetting to reinsert the parent is the most common hand-execution error.*

**3:45–3:52** — Each merge adds one internal node. The total cost equals the sum of all internal node weights, so you can add the merges and never draw the tree.

> Caption: Each merge adds one internal node. The total cost equals the sum of all internal node weights, so you can add the merges and never draw the tree.

Exam-trap caption mode adds: *This identity is a derivation, not a convention, and it is the fastest way to answer a cost question. It fails if you add the leaf weights instead of the merge weights.*

**3:52–4:00** — On frequencies 1, 2, 2, 2, 3 the merges cost 3, 4, 6 and 10, so the encoded message is 23 bits. Greedy, and optimal.

> Caption: On frequencies 1, 2, 2, 2, 3 the merges cost 3, 4, 6 and 10, so the encoded message is 23 bits. Greedy, and optimal.

Exam-trap caption mode adds: *Different valid Huffman trees can exist for the same frequencies when weights tie, and they all have the same cost. A question that asks for the code may have several right answers; one that asks for the length does not.*

## Scene 9. The decision procedure: five questions

*4:00 – 4:30 · objective: Use a fixed five-question order to decide whether a new problem is greedy, dynamic programming, or greedy but only approximately optimal.*

**4:00–4:07** — Question one: is there an exchange argument, or only a counterexample? Try to break the rule on a small instance first.

> Caption: Question one: is there an exchange argument, or only a counterexample? Try to break the rule on a small instance first.

Exam-trap caption mode adds: *Failing to find a counterexample is not evidence of correctness. It only means you have not found one yet, which is why the proof step cannot be skipped.*

**4:07–4:15** — Question two: are the choices indivisible? If they are, suspect that greedy fails and that DP is needed.

> Caption: Question two: are the choices indivisible? If they are, suspect that greedy fails and that DP is needed.

Exam-trap caption mode adds: *Indivisibility is a warning, not a verdict. Kruskal chooses whole edges and is still optimal, because spanning trees have the matroid structure that restores the exchange property.*

**4:15–4:22** — Question three: does the problem have overlapping subproblems? If yes and there is no proof, DP is the safe route.

> Caption: Question three: does the problem have overlapping subproblems? If yes and there is no proof, DP is the safe route.

Exam-trap caption mode adds: *Greedy and DP share optimal substructure, so "it has optimal substructure" never decides between them. Overlap plus the absence of a greedy proof is what decides.*

**4:22–4:30** — Questions four and five: what exactly does the rule sort on, and what is the resulting running time? Name the criterion out loud before computing anything.

> Caption: Questions four and five: what exactly does the rule sort on, and what is the resulting running time? Name the criterion out loud before computing anything.

Exam-trap caption mode adds: *Vague criteria lose marks and produce wrong traces. "Pick the best one" is not a criterion; "pick the one with the smallest finish time among those compatible with the last chosen" is.*

## Scene 10. One table to hold: problem, criterion, cost, proof

*4:30 – 5:00 · objective: Hold six greedy problems against their greedy criterion, their running time and the shape of their correctness proof.*

**4:30–4:37** — Six greedy problems, six criteria: earliest finish, value per weight, two lightest, lightest edge, nearest unfinalised vertex, highest profit first.

> Caption: Six greedy problems, six criteria: earliest finish, value per weight, two lightest, lightest edge, nearest unfinalised vertex, highest profit first.

Exam-trap caption mode adds: *The criteria are not interchangeable. Applying the value-per-weight rule to activity selection, or the earliest-finish rule to knapsack, produces a wrong algorithm that still looks greedy.*

**4:37–4:45** — Costs: n log n for the three sorting-based ones, E log E for Kruskal, and n squared for the simple slot scan in job sequencing.

> Caption: Costs: n log n for the three sorting-based ones, E log E for Kruskal, and n squared for the simple slot scan in job sequencing.

Exam-trap caption mode adds: *Kruskal is E log E, not V log V, and Dijkstra with a binary heap is E log V. Quoting a running time without saying which data structure produced it is an incomplete answer.*

**4:45–4:52** — Proofs: every one of them is an exchange argument, and each one names the fact that makes the swap safe.

> Caption: Proofs: every one of them is an exchange argument, and each one names the fact that makes the swap safe.

Exam-trap caption mode adds: *A proof that says "by induction" without the swap step is incomplete. The swap is the content; the induction is only the bookkeeping.*

**4:52–5:00** — The rule to carry out of this lesson: greedy is a claim about a criterion, not a technique you apply and hope.

> Caption: The rule to carry out of this lesson: greedy is a claim about a criterion, not a technique you apply and hope.

Exam-trap caption mode adds: *The most expensive mistake in this topic is answering "greedy" to a question that asked for the correct technique on 0/1 knapsack. The second is forgetting that fractional knapsack is greedy and 0/1 is not.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
