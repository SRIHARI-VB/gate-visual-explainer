# Dynamic Programming — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/dynamic-programming/index.html`
- Total duration: 5:30 (330 seconds), 11 scenes, 44 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. The same subproblem, computed again and again

*0:00 – 0:30 · objective: Count the calls a plain recursive Fibonacci makes for n = 6 and see that 25 calls reach only 7 distinct subproblems.*

**0:00–0:07** — Here is fib of six written the way the definition reads: fib of n is fib of n minus one plus fib of n minus two.

> Caption: Here is fib(6) written the way the definition reads: fib of n is fib of n minus one plus fib of n minus two.

Exam-trap caption mode adds: *A recurrence is a definition, not an algorithm. Turning it into code is a separate decision, and that decision is what this lesson is about.*

**0:07–0:15** — Evaluate it literally and the tree branches twice at every node. For n equal to six that is 25 calls.

> Caption: Evaluate it literally and the tree branches twice at every node. For n equal to six that is 25 calls.

Exam-trap caption mode adds: *The count grows like the Fibonacci numbers themselves, so it is exponential. Nothing about the loop-free, one-line definition hints at that.*

**0:15–0:22** — But there are only seven different questions in that tree: fib of zero up to fib of six. Everything else is a repeat.

> Caption: But there are only 7 different questions in that tree: fib of 0 up to fib of 6. Everything else is a repeat.

Exam-trap caption mode adds: *This is overlapping subproblems, and it is the property that separates DP from divide and conquer. Merge sort has no overlap: its halves are disjoint, which is why it needs no table.*

**0:22–0:30** — So the waste is not the recursion. The waste is forgetting. Keep the answers and the same definition costs seven steps.

> Caption: So the waste is not the recursion. The waste is forgetting. Keep the answers and the same definition costs seven steps.

Exam-trap caption mode adds: *Do not conclude that recursion is bad. The fix keeps the recursion and adds memory; it does not replace the definition.*

## Scene 2. Write the answer down: 7 states, 7 computations

*0:30 – 1:00 · objective: Watch a cache turn the same recursion into one computation per state, and name the two ways to arrange that cache: memoisation and tabulation.*

**0:30–0:37** — Memoisation: before computing a state, look in the table. If the answer is there, return it; otherwise compute once and store it.

> Caption: Memoisation: before computing a state, look in the table. If the answer is there, return it; otherwise compute once and store it.

Exam-trap caption mode adds: *The table must be indexed by everything the answer depends on. For fib that is one number; for knapsack it is the item index and the remaining capacity, which is why knapsack needs a 2-D table.*

**0:37–0:45** — Each of the seven states is computed exactly once, so the running time becomes the number of states times the work per state.

> Caption: Each of the seven states is computed exactly once, so the running time becomes the number of states times the work per state.

Exam-trap caption mode adds: *The improvement is not "less recursion". It is a bound on how many times each state is solved. Quote the bound, not the feeling.*

**0:45–0:52** — Tabulation is the same table filled the other way round: start at the base cases and fill forward until the answer appears.

> Caption: Tabulation is the same table filled the other way round: start at the base cases and fill forward until the answer appears.

Exam-trap caption mode adds: *Both routes must give the same table. If they disagree, one of them has the wrong base case or the wrong order, and the disagreement is a bug, not a nuance.*

**0:52–1:00** — Same recurrence, same table, two spellings. What makes it dynamic programming is the table, not the recursion.

> Caption: Same recurrence, same table, two spellings. What makes it dynamic programming is the table, not the recursion.

Exam-trap caption mode adds: *A memoised function and a filled table are equally DP. An answer that says "this is DP because it recurses" is wrong, and so is one that says "this is not DP because there is no recursion".*

## Scene 3. Five questions that turn a problem into a DP

*1:00 – 1:30 · objective: Fix the state, the choice, the transition, the base case and the fill order - the five things every DP answer needs.*

**1:00–1:07** — Question one: what is a state? It is the exact set of numbers that, together, pin down one subproblem.

> Caption: Question one: what is a state? It is the exact set of numbers that, together, pin down one subproblem.

Exam-trap caption mode adds: *A state that is too small loses information and gives wrong answers; a state that is too large wastes time. GATE questions on complexity almost always hinge on how many states there are.*

**1:07–1:15** — Question two: what choices does the state allow? Knapsack allows take or skip. LCS allows dropping a character from either side.

> Caption: Question two: what choices does the state allow? Knapsack allows take or skip. LCS allows drop a character from either side.

Exam-trap caption mode adds: *If a state seems to allow infinitely many choices, the state is probably wrong - add the last decision to the state and the choices become finite.*

**1:15–1:22** — Question three: write the transition, and question four: write the base case. Those two lines are the whole recurrence.

> Caption: Question three: write the transition, and question four: write the base case. Those two lines are the whole recurrence.

Exam-trap caption mode adds: *A missing base case is the most common cause of an infinite recursion or a table full of zeros. Write the base case before the transition.*

**1:22–1:30** — Question five: in what order may the table be filled? Every state must be filled after the states it reads.

> Caption: Question five: in what order may the table be filled? Every state must be filled after the states it reads.

Exam-trap caption mode adds: *Row-major and column-major are both valid only when the dependencies allow it. Do not assume; check which cells the recurrence reads.*

## Scene 4. 0/1 knapsack: one row per item, one column per capacity

*1:30 – 2:00 · objective: Fill a 5-by-8 table by hand and see the two-way choice written as one max, ending at 9 where the ratio rule gave 8.*

**1:30–1:37** — Four items, capacity seven. The state is items considered and capacity left, so the table has five rows and eight columns.

> Caption: Four items, capacity 7. The state is (items considered, capacity left), so the table has five rows and eight columns.

Exam-trap caption mode adds: *The row index means "the first i items", not "item i". Getting that off by one shifts the whole table and changes the answer.*

**1:37–1:45** — For each cell there are two candidates: the row above, which skips the item, and the item value plus the cell one row up and one item weight left.

> Caption: For each cell there are two candidates: the row above, which skips the item, and the item value plus the cell one row up and one item-weight left.

Exam-trap caption mode adds: *The take-branch reads the row above, never the current row. Reading the current row is what turns 0/1 knapsack into unbounded knapsack, and scene ten shows the damage.*

**1:45–1:52** — Filling row by row, the bottom right corner reads nine, reached by taking I2 and I3, weights three and four.

> Caption: Filling row by row, the bottom-right corner reads 9, reached by taking I2 and I3, weights 3 and 4.

Exam-trap caption mode adds: *The corner is the answer only for the full capacity and all items. Reading a middle cell is a common slip, and it answers a different question.*

**1:52–2:00** — Value per weight would have taken I4 and I1 for eight. The table finds nine because it compares combinations, not ratios.

> Caption: Value per weight would have taken I4 and I1 for 8. The table finds 9 because it compares combinations, not ratios.

Exam-trap caption mode adds: *DP is not automatically better. The table costs n times capacity cells, which is pseudo-polynomial: with capacity 10 to the 9 it is hopeless, while the ratio rule stays fast and merely wrong.*

## Scene 5. Longest common subsequence: a table of prefixes, and a path back

*2:00 – 2:30 · objective: Fill the LCS table for AGGTAB and GXTXAYB, get 4, and walk the arrows back to read the actual subsequence.*

**2:00–2:07** — LCS of AGGTAB and GXTXAYB. The state is how many characters of each string are still in play.

> Caption: LCS of AGGTAB and GXTXAYB. State: how many characters of each string are still in play.

Exam-trap caption mode adds: *Longest common subsequence and longest common substring are different problems. Substring must be contiguous; subsequence need not be, and only substring needs a running maximum over all cells.*

**2:07–2:15** — When the two current characters match, add one to the diagonal. When they differ, take the better of dropping one character from either side.

> Caption: When the two current characters match, add one to the diagonal. When they differ, take the better of dropping one character from either side.

Exam-trap caption mode adds: *On a mismatch the cell is a max of two neighbours, so a table entry never counts how many optimal subsequences exist. GATE 2014 asked for that count and it needs a separate count table.*

**2:15–2:22** — The corner holds four. That is the length, and the length is all the table stores.

> Caption: The corner holds 4. That is the length, and the length is all the table stores.

Exam-trap caption mode adds: *A length question and a reconstruction question are different questions. The table answers the first in constant time and the second only by walking back through it.*

**2:22–2:30** — Walk back along the matches and the arrows, and the letters spell GTAB. Same table, one extra pass.

> Caption: Walk back along the matches and the arrows, and the letters spell GTAB. Same table, one extra pass.

Exam-trap caption mode adds: *Ties in the table mean several longest subsequences exist and the walk picks one of them. A question asking for the number of such subsequences is not answered by this walk.*

## Scene 6. Fill order is not free: subproblems by increasing size

*2:30 – 3:00 · objective: See why a 2-D table can be filled row-major while an interval table must be filled by length, which is exactly what GATE 2009 asked.*

**2:30–2:37** — A fill order is legal only if every cell is written after the cells it reads. For knapsack and LCS that is any order that goes up and left.

> Caption: A fill order is legal only if every cell is written after the cells it reads. For knapsack and LCS that is any order that goes up and left.

Exam-trap caption mode adds: *The dependency is the up, left and diagonal neighbours, not "any smaller index". An option that says every cell with a smaller row must be computed first is stronger than the truth and therefore false.*

**2:37–2:45** — Interval problems break that. A cell for the interval i to j reads intervals shorter than itself, which are neither above nor left.

> Caption: Interval problems break that. A cell for the interval i to j reads intervals shorter than itself, which are neither above nor left.

Exam-trap caption mode adds: *Filling an interval table row by row reads cells that are still zero, and the answer comes out silently wrong rather than crashing. Silent wrongness is why the fill order is examinable.*

**2:45–2:52** — The fix is to loop over length first, then over the starting index. Length two, then three, then four.

> Caption: The fix is to loop over length first, then over the starting index. Length two, then three, then four.

Exam-trap caption mode adds: *Length-one intervals have cost zero and are the base case. Forgetting to initialise that diagonal leaves every longer interval reading a value that was never written.*

**2:52–3:00** — So the general rule: draw the dependency arrows for one cell, and order the loops so the arrows always point backwards.

> Caption: So the general rule: draw the dependency arrows for one cell, and order the loops so the arrows always point backwards.

Exam-trap caption mode adds: *If the dependency graph has a cycle, no fill order exists and the formulation is wrong. A DP needs a DAG of states, not just a recurrence.*

## Scene 7. Matrix chain: 26000 multiplications, and where the split is

*3:00 – 3:30 · objective: Run the interval recurrence on four matrices, get 26000 at the top-right corner, and recover the split that achieves it.*

**3:00–3:07** — Four matrices with dimensions forty by twenty, twenty by thirty, thirty by ten and ten by thirty. The order changes the cost, not the result.

> Caption: Four matrices with dimensions 40 by 20, 20 by 30, 30 by 10 and 10 by 30. The order of multiplication changes the cost, not the result.

Exam-trap caption mode adds: *The result matrix is the same in every order, so a question about the answer is trivial. Every question here is about the number of scalar multiplications.*

**3:07–3:15** — The state is the interval of matrices from i to j, and the choice is where to split that interval.

> Caption: The state is the interval of matrices from i to j, and the choice is where to split that interval.

Exam-trap caption mode adds: *The split ranges from i to j minus 1, never up to j. Including j would create an empty right part and, in code, an out-of-range dimension.*

**3:15–3:22** — Filling by length, the top right cell ends at 26000, and the page checks that against every possible parenthesisation.

> Caption: Filling by length, the top-right cell ends at 26000, and the page checks that against every possible parenthesisation.

Exam-trap caption mode adds: *The table stores costs, not dimensions. Reading a cell gives a number of multiplications; the dimensions come from the input array, indexed by i minus one, k and j.*

**3:22–3:30** — A second table records the split, so the parenthesisation can be printed. Cost table plus choice table is the standard DP pattern.

> Caption: A second table records the split, so the parenthesisation can be printed. Cost table plus choice table is the standard DP pattern.

Exam-trap caption mode adds: *Reconstructing without the choice table is possible but needs the cost table to be re-scanned, which is easy to get wrong. Store the choice.*

## Scene 8. Longest increasing subsequence: a DP over suffixes

*3:30 – 4:00 · objective: Compute L[i], the longest increasing subsequence starting at i, and see the paradigm that GATE 2011 was testing.*

**3:30–3:37** — Longest increasing subsequence of three, two, six, four, five, one. The state is the index where the subsequence starts.

> Caption: Longest increasing subsequence of 3, 2, 6, 4, 5, 1. State: the index where the subsequence starts.

Exam-trap caption mode adds: *This is a subsequence, so indices need not be adjacent. The recurrence looks at every later index, not only i plus one.*

**3:37–3:45** — Filling from the right gives three, three, one, two, one, one, so the answer is three, and one witness is two, four, five.

> Caption: Filling from the right gives 3, 3, 1, 2, 1, 1, so the answer is 3 and one witness is 2, 4, 5.

Exam-trap caption mode adds: *The maximum of L is the answer, not L of index zero. Starting from a large first element can hide a longer sequence that begins later.*

**3:45–3:52** — This is a genuine DP: n states, n work per state, n squared in total. GATE 2011 asked which paradigm such an algorithm uses.

> Caption: This is a genuine DP: n states, n work per state, n squared in total. GATE 2011 asked which paradigm such an algorithm uses.

Exam-trap caption mode adds: *Community discussion notes that the printed recurrence tracks a contiguous increasing run rather than a subsequence, so the question tests paradigm recognition, not the definition of a subsequence.*

**3:52–4:00** — The same shape solves the longest decreasing, the longest bitonic and the longest alternating versions: change the comparison, keep the table.

> Caption: The same shape solves the longest decreasing, the longest bitonic and the longest alternating versions: change the comparison, keep the table.

Exam-trap caption mode adds: *A binary search improvement to n log n exists for LIS length, but it does not give the witness or the count. Do not carry the faster bound into a question that asks for the subsequence.*

## Scene 9. DP on graphs: Floyd-Warshall over intermediate vertices

*4:00 – 4:30 · objective: Watch one vertex at a time become an allowed intermediate, and see the 0-to-3 distance drop from 8 to 5.*

**4:00–4:07** — Floyd-Warshall asks: what is the shortest path from i to j using only vertices from the first k as intermediates?

> Caption: Floyd-Warshall asks: what is the shortest path from i to j using only vertices from the first k as intermediates?

Exam-trap caption mode adds: *The k loop must be the outermost loop. Swapping it inside produces a table that is not the answer, which is a classic exam distractor.*

**4:07–4:15** — Allowing vertex one first, then two, then three. Each step either keeps the old distance or routes through the new vertex.

> Caption: Allowing vertex 1 first, then 2, then 3. Each step either keeps the old distance or routes through the new vertex.

Exam-trap caption mode adds: *This is the same relaxation that Bellman-Ford performs, only organised by intermediate vertex instead of by edge count. Recognising the shape is what turns a hard-looking question into a table question.*

**4:15–4:22** — On this graph the distance from zero to three is eight directly, and allowing vertex two drops it to five through one and two.

> Caption: On this graph the distance from 0 to 3 is 8 directly, and allowing vertex 2 drops it to 5 through 1 and 2.

Exam-trap caption mode adds: *Floyd-Warshall is DP, not greedy. GATE 2016 Set 2 asked exactly this, and the tempting wrong answer is greedy because Dijkstra is greedy and the two are taught together.*

**4:22–4:30** — The same trick gives the longest path in a DAG, if you relax in topological order instead of by vertex number.

> Caption: The same trick gives the longest path in a DAG, if you relax in topological order instead of by vertex number.

Exam-trap caption mode adds: *Longest path is NP-hard in a general graph. The DP works only because a DAG has no cycles, and the acyclicity is a hypothesis you must check, not a detail.*

## Scene 10. Cost and space: states times transitions, and the one-row trick

*4:30 – 5:00 · objective: Count the work as states times transitions, then watch an ascending capacity loop reuse one item three times and produce the wrong answer.*

**4:30–4:37** — Cost is states times work per state. Knapsack has n plus one times W plus one states and two choices each.

> Caption: Cost is states times work per state. Knapsack has n plus one times W plus one states and two choices each.

Exam-trap caption mode adds: *Writing O of n log W or O of n times W as if W were a constant loses the marks. Say what the state is before quoting the bound.*

**4:37–4:45** — Since a row reads only the row above it, one row of the table is enough. Space drops from n times W to W.

> Caption: Since a row reads only the row above it, one row of the table is enough. Space drops from n times W to W.

Exam-trap caption mode adds: *Overwriting in place is safe only when the read happens before the write. That is a property of the loop direction, not of the array.*

**4:45–4:52** — Loop capacity upwards and the item is reused: the array reports nine, which takes the weight two item three times.

> Caption: Loop capacity upwards and the item is reused: the array reports 9, which takes the weight-2 item three times.

Exam-trap caption mode adds: *This is not a rounding artefact. Ascending capacity is the correct loop for unbounded knapsack and the wrong loop for 0/1, and the two problems differ by one loop direction.*

**4:52–5:00** — Descending capacity reads only cells from the previous item, so it matches the full table exactly.

> Caption: Descending capacity reads only cells from the previous item, so it matches the full table exactly.

Exam-trap caption mode adds: *Space can also be saved in LCS by keeping two rows, and in interval DP by keeping a diagonal. The direction that is safe differs per problem, so derive it each time.*

## Scene 11. Greedy, divide-and-conquer or DP? The test that decides

*5:00 – 5:30 · objective: Use two properties to place a new problem in the right paradigm, and hold six classic problems against their state and their cost.*

**5:00–5:07** — Two questions decide the paradigm. Does an optimal solution contain optimal solutions to subproblems, and do those subproblems repeat?

> Caption: Two questions decide the paradigm. Does an optimal solution contain optimal solutions to subproblems, and do those subproblems repeat?

Exam-trap caption mode adds: *Greedy is not one of the two questions. Greedy is what you get when the choice at each state can be made locally and proved safe, which is an extra property on top.*

**5:07–5:15** — Greedy needs a third property: some optimal solution agrees with the locally best choice. Without a proof of that, greedy is a guess.

> Caption: Greedy needs a third property: some optimal solution agrees with the locally best choice. Without a proof of that, greedy is a guess.

Exam-trap caption mode adds: *DP can solve any problem greedy solves, but its state may be exponential. The reason to prefer greedy is cost, not correctness.*

**5:15–5:22** — Six problems, six states: capacity and item, two prefix lengths, an interval, an index, two vertices plus an intermediate, a sum.

> Caption: Six problems, six states: capacity and item, two prefix lengths, an interval, an index, two vertices plus an intermediate, a sum.

Exam-trap caption mode adds: *The state is the examinable part. Get the state right and the recurrence usually writes itself; get it wrong and no amount of table-filling saves the answer.*

**5:22–5:30** — Carry this out of the lesson: name the state, write the transition and the base case, then say which order fills the table.

> Caption: Carry this out of the lesson: name the state, write the transition and the base case, then say which order fills the table.

Exam-trap caption mode adds: *The most expensive mistake in this topic is quoting a complexity without the state, and the second is filling a table in an order the recurrence does not permit.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
