/* ==========================================================================
   dynamic-programming - THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs - never edited by hand.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 330,

  scenes: [
    {
      id: 'fib',
      n: 1,
      title: 'The same subproblem, computed again and again',
      start: 0, end: 30,
      objective: 'Count the calls a plain recursive Fibonacci makes for n = 6 and see that 25 calls reach only 7 distinct subproblems.'
    },
    {
      id: 'memo',
      n: 2,
      title: 'Write the answer down: 7 states, 7 computations',
      start: 30, end: 60,
      objective: 'Watch a cache turn the same recursion into one computation per state, and name the two ways to arrange that cache: memoisation and tabulation.'
    },
    {
      id: 'recipe',
      n: 3,
      title: 'Five questions that turn a problem into a DP',
      start: 60, end: 90,
      objective: 'Fix the state, the choice, the transition, the base case and the fill order - the five things every DP answer needs.'
    },
    {
      id: 'knapsack',
      n: 4,
      title: '0/1 knapsack: one row per item, one column per capacity',
      start: 90, end: 120,
      objective: 'Fill a 5-by-8 table by hand and see the two-way choice written as one max, ending at 9 where the ratio rule gave 8.'
    },
    {
      id: 'lcs',
      n: 5,
      title: 'Longest common subsequence: a table of prefixes, and a path back',
      start: 120, end: 150,
      objective: 'Fill the LCS table for AGGTAB and GXTXAYB, get 4, and walk the arrows back to read the actual subsequence.'
    },
    {
      id: 'order',
      n: 6,
      title: 'Fill order is not free: subproblems by increasing size',
      start: 150, end: 180,
      objective: 'See why a 2-D table can be filled row-major while an interval table must be filled by length, which is exactly what GATE 2009 asked.'
    },
    {
      id: 'mchain',
      n: 7,
      title: 'Matrix chain: 26000 multiplications, and where the split is',
      start: 180, end: 210,
      objective: 'Run the interval recurrence on four matrices, get 26000 at the top-right corner, and recover the split that achieves it.'
    },
    {
      id: 'lis',
      n: 8,
      title: 'Longest increasing subsequence: a DP over suffixes',
      start: 210, end: 240,
      objective: 'Compute L[i], the longest increasing subsequence starting at i, and see the paradigm that GATE 2011 was testing.'
    },
    {
      id: 'paths',
      n: 9,
      title: 'DP on graphs: Floyd-Warshall over intermediate vertices',
      start: 240, end: 270,
      objective: 'Watch one vertex at a time become an allowed intermediate, and see the 0-to-3 distance drop from 8 to 5.'
    },
    {
      id: 'space',
      n: 10,
      title: 'Cost and space: states times transitions, and the one-row trick',
      start: 270, end: 300,
      objective: 'Count the work as states times transitions, then watch an ascending capacity loop reuse one item three times and produce the wrong answer.'
    },
    {
      id: 'decide',
      n: 11,
      title: 'Greedy, divide-and-conquer or DP? The test that decides',
      start: 300, end: 330,
      objective: 'Use two properties to place a new problem in the right paradigm, and hold six classic problems against their state and their cost.'
    }
  ],

  events: [

    /* ---------------- scene 1: overlapping subproblems ---------------- */
    {
      id: 'fib-1', start: 0, end: 7.5, scene: 'fib',
      caption: 'Here is fib(6) written the way the definition reads: fib of n is fib of n minus one plus fib of n minus two.',
      detail: 'The definition is a recurrence. It says the answer for six depends on the answer for five and the answer for four, and those depend on smaller ones in turn, until n reaches zero or one.',
      keyword: 'fib of n is fib of n minus one plus fib of n minus two',
      trap: 'A recurrence is a definition, not an algorithm. Turning it into code is a separate decision, and that decision is what this lesson is about.',
      narration: 'Here is fib of six written the way the definition reads: fib of n is fib of n minus one plus fib of n minus two.'
    },
    {
      id: 'fib-2', start: 7.5, end: 15, scene: 'fib',
      caption: 'Evaluate it literally and the tree branches twice at every node. For n equal to six that is 25 calls.',
      detail: 'Each call spawns two more until it reaches the base cases. The page counts the calls by actually running the recursion, and for n equal to six the count is 25.',
      keyword: '25 calls',
      trap: 'The count grows like the Fibonacci numbers themselves, so it is exponential. Nothing about the loop-free, one-line definition hints at that.',
      narration: 'Evaluate it literally and the tree branches twice at every node. For n equal to six that is 25 calls.'
    },
    {
      id: 'fib-3', start: 15, end: 22.5, scene: 'fib',
      caption: 'But there are only 7 different questions in that tree: fib of 0 up to fib of 6. Everything else is a repeat.',
      detail: 'fib of 3 is computed three times, fib of 2 five times. The tree is wide because it recomputes answers it already had. Seven distinct subproblems, twenty-five calls.',
      keyword: 'only 7 different questions',
      trap: 'This is overlapping subproblems, and it is the property that separates DP from divide and conquer. Merge sort has no overlap: its halves are disjoint, which is why it needs no table.',
      narration: 'But there are only seven different questions in that tree: fib of zero up to fib of six. Everything else is a repeat.'
    },
    {
      id: 'fib-4', start: 22.5, end: 30, scene: 'fib',
      caption: 'So the waste is not the recursion. The waste is forgetting. Keep the answers and the same definition costs seven steps.',
      detail: 'Twenty-five calls against seven states. The ratio gets worse as n grows, and it is the only reason dynamic programming exists as a separate technique.',
      keyword: 'The waste is forgetting',
      trap: 'Do not conclude that recursion is bad. The fix keeps the recursion and adds memory; it does not replace the definition.',
      narration: 'So the waste is not the recursion. The waste is forgetting. Keep the answers and the same definition costs seven steps.'
    },

    /* ---------------- scene 2: memoisation and tabulation ---------------- */
    {
      id: 'memo-1', start: 30, end: 37.5, scene: 'memo',
      caption: 'Memoisation: before computing a state, look in the table. If the answer is there, return it; otherwise compute once and store it.',
      detail: 'The recursion keeps its shape. The only addition is a lookup at the top and a store at the bottom, so the second visit to any state costs one array read instead of a subtree.',
      keyword: 'look in the table',
      trap: 'The table must be indexed by everything the answer depends on. For fib that is one number; for knapsack it is the item index and the remaining capacity, which is why knapsack needs a 2-D table.',
      narration: 'Memoisation: before computing a state, look in the table. If the answer is there, return it; otherwise compute once and store it.'
    },
    {
      id: 'memo-2', start: 37.5, end: 45, scene: 'memo',
      caption: 'Each of the seven states is computed exactly once, so the running time becomes the number of states times the work per state.',
      detail: 'For fib that is seven states at constant work, which is linear in n. This sentence is the whole cost model of dynamic programming, and it is what makes the technique worth the table.',
      keyword: 'states times the work per state',
      trap: 'The improvement is not "less recursion". It is a bound on how many times each state is solved. Quote the bound, not the feeling.',
      narration: 'Each of the seven states is computed exactly once, so the running time becomes the number of states times the work per state.'
    },
    {
      id: 'memo-3', start: 45, end: 52.5, scene: 'memo',
      caption: 'Tabulation is the same table filled the other way round: start at the base cases and fill forward until the answer appears.',
      detail: 'No recursion, no call stack, and the fill order is explicit. The price is that you must know a valid order in advance, which is exactly what a fill-order question in the exam tests.',
      keyword: 'fill forward until the answer appears',
      trap: 'Both routes must give the same table. If they disagree, one of them has the wrong base case or the wrong order, and the disagreement is a bug, not a nuance.',
      narration: 'Tabulation is the same table filled the other way round: start at the base cases and fill forward until the answer appears.'
    },
    {
      id: 'memo-4', start: 52.5, end: 60, scene: 'memo',
      caption: 'Same recurrence, same table, two spellings. What makes it dynamic programming is the table, not the recursion.',
      detail: 'This is the first misconception of the topic: DP is not "recursion plus a cache". It is solving each state once and reusing the answer, and either spelling does that.',
      keyword: 'the table, not the recursion',
      trap: 'A memoised function and a filled table are equally DP. An answer that says "this is DP because it recurses" is wrong, and so is one that says "this is not DP because there is no recursion".',
      narration: 'Same recurrence, same table, two spellings. What makes it dynamic programming is the table, not the recursion.'
    },

    /* ---------------- scene 3: the five questions ---------------- */
    {
      id: 'recipe-1', start: 60, end: 67.5, scene: 'recipe',
      caption: 'Question one: what is a state? It is the exact set of numbers that, together, pin down one subproblem.',
      detail: 'For knapsack it is the pair (item index, remaining capacity). For LCS it is the pair (prefix length of A, prefix length of B). The state must be complete: two different subproblems must never share a state.',
      keyword: 'what is a state',
      trap: 'A state that is too small loses information and gives wrong answers; a state that is too large wastes time. GATE questions on complexity almost always hinge on how many states there are.',
      narration: 'Question one: what is a state? It is the exact set of numbers that, together, pin down one subproblem.'
    },
    {
      id: 'recipe-2', start: 67.5, end: 75, scene: 'recipe',
      caption: 'Question two: what choices does the state allow? Knapsack allows take or skip. LCS allows drop a character from either side.',
      detail: 'The choices become the branches of the transition, and their number is the per-state work. Two choices means two candidate values and one max; four choices means four.',
      keyword: 'what choices does the state allow',
      trap: 'If a state seems to allow infinitely many choices, the state is probably wrong - add the last decision to the state and the choices become finite.',
      narration: 'Question two: what choices does the state allow? Knapsack allows take or skip. LCS allows dropping a character from either side.'
    },
    {
      id: 'recipe-3', start: 75, end: 82.5, scene: 'recipe',
      caption: 'Question three: write the transition, and question four: write the base case. Those two lines are the whole recurrence.',
      detail: 'The transition says what a bigger state equals in terms of smaller ones. The base case is where the recursion stops: an empty prefix, a capacity of zero, a single matrix.',
      keyword: 'the transition and the base case',
      trap: 'A missing base case is the most common cause of an infinite recursion or a table full of zeros. Write the base case before the transition.',
      narration: 'Question three: write the transition, and question four: write the base case. Those two lines are the whole recurrence.'
    },
    {
      id: 'recipe-4', start: 82.5, end: 90, scene: 'recipe',
      caption: 'Question five: in what order may the table be filled? Every state must be filled after the states it reads.',
      detail: 'Knapsack reads the row above and further left in the same row, so row by row works. Interval DP reads shorter intervals, so length by length is the only safe order.',
      keyword: 'filled after the states it reads',
      trap: 'Row-major and column-major are both valid only when the dependencies allow it. Do not assume; check which cells the recurrence reads.',
      narration: 'Question five: in what order may the table be filled? Every state must be filled after the states it reads.'
    },

    /* ---------------- scene 4: 0/1 knapsack ---------------- */
    {
      id: 'knapsack-1', start: 90, end: 97.5, scene: 'knapsack',
      caption: 'Four items, capacity 7. The state is (items considered, capacity left), so the table has five rows and eight columns.',
      detail: 'Items are I1 weight 1 value 1, I2 weight 3 value 4, I3 weight 4 value 5, I4 weight 5 value 7. Row zero is "no items", where every capacity is worth zero.',
      keyword: 'five rows and eight columns',
      trap: 'The row index means "the first i items", not "item i". Getting that off by one shifts the whole table and changes the answer.',
      narration: 'Four items, capacity seven. The state is items considered and capacity left, so the table has five rows and eight columns.'
    },
    {
      id: 'knapsack-2', start: 97.5, end: 105, scene: 'knapsack',
      caption: 'For each cell there are two candidates: the row above, which skips the item, and the item value plus the cell one row up and one item-weight left.',
      detail: 'The second candidate only exists when the item fits. Written out, the cell is the larger of skipping and taking. That max is the whole recurrence.',
      keyword: 'skipping and taking',
      trap: 'The take-branch reads the row above, never the current row. Reading the current row is what turns 0/1 knapsack into unbounded knapsack, and scene ten shows the damage.',
      narration: 'For each cell there are two candidates: the row above, which skips the item, and the item value plus the cell one row up and one item weight left.'
    },
    {
      id: 'knapsack-3', start: 105, end: 112.5, scene: 'knapsack',
      caption: 'Filling row by row, the bottom-right corner reads 9, reached by taking I2 and I3, weights 3 and 4.',
      detail: 'The page fills the table and checks the corner against an exhaustive search over all sixteen subsets of the four items. Both give 9, and the pair I2 with I3 attains it.',
      keyword: 'the corner reads 9',
      trap: 'The corner is the answer only for the full capacity and all items. Reading a middle cell is a common slip, and it answers a different question.',
      narration: 'Filling row by row, the bottom right corner reads nine, reached by taking I2 and I3, weights three and four.'
    },
    {
      id: 'knapsack-4', start: 112.5, end: 120, scene: 'knapsack',
      caption: 'Value per weight would have taken I4 and I1 for 8. The table finds 9 because it compares combinations, not ratios.',
      detail: 'This is the same instance-level lesson as in the greedy lesson, now with the mechanism visible. DP pays for correctness with a table and a bound of n times W cells.',
      keyword: 'compares combinations, not ratios',
      trap: 'DP is not automatically better. The table costs n times capacity cells, which is pseudo-polynomial: with capacity 10 to the 9 it is hopeless, while the ratio rule stays fast and merely wrong.',
      narration: 'Value per weight would have taken I4 and I1 for eight. The table finds nine because it compares combinations, not ratios.'
    },

    /* ---------------- scene 5: LCS ---------------- */
    {
      id: 'lcs-1', start: 120, end: 127.5, scene: 'lcs',
      caption: 'LCS of AGGTAB and GXTXAYB. State: how many characters of each string are still in play.',
      detail: 'Prefix pairs are the natural state because a subsequence of a prefix is a prefix problem again. Seven rows and eight columns, counting the empty prefix row and column.',
      keyword: 'how many characters of each string are still in play',
      trap: 'Longest common subsequence and longest common substring are different problems. Substring must be contiguous; subsequence need not be, and only substring needs a running maximum over all cells.',
      narration: 'LCS of AGGTAB and GXTXAYB. The state is how many characters of each string are still in play.'
    },
    {
      id: 'lcs-2', start: 127.5, end: 135, scene: 'lcs',
      caption: 'When the two current characters match, add one to the diagonal. When they differ, take the better of dropping one character from either side.',
      detail: 'The diagonal cell is the answer for the two shorter prefixes, and a match extends it by exactly one character. A mismatch cannot use both characters, so one of them must go.',
      keyword: 'add one to the diagonal',
      trap: 'On a mismatch the cell is a max of two neighbours, so a table entry never counts how many optimal subsequences exist. GATE 2014 asked for that count and it needs a separate count table.',
      narration: 'When the two current characters match, add one to the diagonal. When they differ, take the better of dropping one character from either side.'
    },
    {
      id: 'lcs-3', start: 135, end: 142.5, scene: 'lcs',
      caption: 'The corner holds 4. That is the length, and the length is all the table stores.',
      detail: 'The page checks 4 against an exhaustive search over all subsequences of the shorter string. Both routes agree on 4.',
      keyword: 'the length, and only the length',
      trap: 'A length question and a reconstruction question are different questions. The table answers the first in constant time and the second only by walking back through it.',
      narration: 'The corner holds four. That is the length, and the length is all the table stores.'
    },
    {
      id: 'lcs-4', start: 142.5, end: 150, scene: 'lcs',
      caption: 'Walk back along the matches and the arrows, and the letters spell GTAB. Same table, one extra pass.',
      detail: 'Start at the corner, follow the diagonal on a match while collecting the character, and otherwise move to the larger neighbour. The walk costs at most m plus n steps.',
      keyword: 'the letters spell GTAB',
      trap: 'Ties in the table mean several longest subsequences exist and the walk picks one of them. A question asking for the number of such subsequences is not answered by this walk.',
      narration: 'Walk back along the matches and the arrows, and the letters spell GTAB. Same table, one extra pass.'
    },

    /* ---------------- scene 6: fill order ---------------- */
    {
      id: 'order-1', start: 150, end: 157.5, scene: 'order',
      caption: 'A fill order is legal only if every cell is written after the cells it reads. For knapsack and LCS that is any order that goes up and left.',
      detail: 'Row-major and column-major both satisfy it, because each cell reads the cell above, the cell to the left and the diagonal. This is what GATE 2009 was testing about the LCS table.',
      keyword: 'written after the cells it reads',
      trap: 'The dependency is the up, left and diagonal neighbours, not "any smaller index". An option that says every cell with a smaller row must be computed first is stronger than the truth and therefore false.',
      narration: 'A fill order is legal only if every cell is written after the cells it reads. For knapsack and LCS that is any order that goes up and left.'
    },
    {
      id: 'order-2', start: 157.5, end: 165, scene: 'order',
      caption: 'Interval problems break that. A cell for the interval i to j reads intervals shorter than itself, which are neither above nor left.',
      detail: 'The subproblem is a contiguous range, so the size of the subproblem is j minus i plus one. Shorter intervals live on a diagonal further from the main one, so no row-major sweep fills them first.',
      keyword: 'reads intervals shorter than itself',
      trap: 'Filling an interval table row by row reads cells that are still zero, and the answer comes out silently wrong rather than crashing. Silent wrongness is why the fill order is examinable.',
      narration: 'Interval problems break that. A cell for the interval i to j reads intervals shorter than itself, which are neither above nor left.'
    },
    {
      id: 'order-3', start: 165, end: 172.5, scene: 'order',
      caption: 'The fix is to loop over length first, then over the starting index. Length two, then three, then four.',
      detail: 'Every interval of length L is built from intervals of length at most L minus one, so the sweep by length is exactly the topological order of the dependency graph.',
      keyword: 'loop over length first',
      trap: 'Length-one intervals have cost zero and are the base case. Forgetting to initialise that diagonal leaves every longer interval reading a value that was never written.',
      narration: 'The fix is to loop over length first, then over the starting index. Length two, then three, then four.'
    },
    {
      id: 'order-4', start: 172.5, end: 180, scene: 'order',
      caption: 'So the general rule: draw the dependency arrows for one cell, and order the loops so the arrows always point backwards.',
      detail: 'This is a topological sort in disguise. Any problem where the state graph is a DAG can be solved by a DP in a topological order of that graph.',
      keyword: 'the arrows always point backwards',
      trap: 'If the dependency graph has a cycle, no fill order exists and the formulation is wrong. A DP needs a DAG of states, not just a recurrence.',
      narration: 'So the general rule: draw the dependency arrows for one cell, and order the loops so the arrows always point backwards.'
    },

    /* ---------------- scene 7: matrix chain ---------------- */
    {
      id: 'mchain-1', start: 180, end: 187.5, scene: 'mchain',
      caption: 'Four matrices with dimensions 40 by 20, 20 by 30, 30 by 10 and 10 by 30. The order of multiplication changes the cost, not the result.',
      detail: 'The cost of multiplying a p by q matrix by a q by r matrix is p times q times r scalar multiplications. Parenthesisation chooses which multiplications happen when, and the total varies enormously.',
      keyword: 'changes the cost, not the result',
      trap: 'The result matrix is the same in every order, so a question about the answer is trivial. Every question here is about the number of scalar multiplications.',
      narration: 'Four matrices with dimensions forty by twenty, twenty by thirty, thirty by ten and ten by thirty. The order changes the cost, not the result.'
    },
    {
      id: 'mchain-2', start: 187.5, end: 195, scene: 'mchain',
      caption: 'The state is the interval of matrices from i to j, and the choice is where to split that interval.',
      detail: 'Splitting at k means solving the left part and the right part, then multiplying the two results at cost p of i minus one times p of k times p of j. Take the best k.',
      keyword: 'where to split that interval',
      trap: 'The split ranges from i to j minus 1, never up to j. Including j would create an empty right part and, in code, an out-of-range dimension.',
      narration: 'The state is the interval of matrices from i to j, and the choice is where to split that interval.'
    },
    {
      id: 'mchain-3', start: 195, end: 202.5, scene: 'mchain',
      caption: 'Filling by length, the top-right cell ends at 26000, and the page checks that against every possible parenthesisation.',
      detail: 'There are only five ways to parenthesise four matrices, so the page enumerates all of them and confirms that 26000 is the minimum. The DP result is not taken on trust.',
      keyword: 'the top-right cell ends at 26000',
      trap: 'The table stores costs, not dimensions. Reading a cell gives a number of multiplications; the dimensions come from the input array, indexed by i minus one, k and j.',
      narration: 'Filling by length, the top right cell ends at 26000, and the page checks that against every possible parenthesisation.'
    },
    {
      id: 'mchain-4', start: 202.5, end: 210, scene: 'mchain',
      caption: 'A second table records the split, so the parenthesisation can be printed. Cost table plus choice table is the standard DP pattern.',
      detail: 'The best split here is after the third matrix, which groups the product as the first three against the last one. Storing the argmax costs one extra table and turns a number into a plan.',
      keyword: 'cost table plus choice table',
      trap: 'Reconstructing without the choice table is possible but needs the cost table to be re-scanned, which is easy to get wrong. Store the choice.',
      narration: 'A second table records the split, so the parenthesisation can be printed. Cost table plus choice table is the standard DP pattern.'
    },

    /* ---------------- scene 8: LIS ---------------- */
    {
      id: 'lis-1', start: 210, end: 217.5, scene: 'lis',
      caption: 'Longest increasing subsequence of 3, 2, 6, 4, 5, 1. State: the index where the subsequence starts.',
      detail: 'Define L of i as the length of the longest increasing subsequence beginning at index i. Then L of i is one plus the best L of j over all later j whose value is larger.',
      keyword: 'the index where the subsequence starts',
      trap: 'This is a subsequence, so indices need not be adjacent. The recurrence looks at every later index, not only i plus one.',
      narration: 'Longest increasing subsequence of three, two, six, four, five, one. The state is the index where the subsequence starts.'
    },
    {
      id: 'lis-2', start: 217.5, end: 225, scene: 'lis',
      caption: 'Filling from the right gives 3, 3, 1, 2, 1, 1, so the answer is 3 and one witness is 2, 4, 5.',
      detail: 'The page computes the array and confirms 3 against an exhaustive check over all subsequences. The witness 2, 4, 5 is increasing and appears in order in the array.',
      keyword: 'the answer is 3',
      trap: 'The maximum of L is the answer, not L of index zero. Starting from a large first element can hide a longer sequence that begins later.',
      narration: 'Filling from the right gives three, three, one, two, one, one, so the answer is three, and one witness is two, four, five.'
    },
    {
      id: 'lis-3', start: 225, end: 232.5, scene: 'lis',
      caption: 'This is a genuine DP: n states, n work per state, n squared in total. GATE 2011 asked which paradigm such an algorithm uses.',
      detail: 'In that question the recurrence linked i only to i plus one, which makes the code linear. The paper keyed the answer as dynamic programming, because the subproblem answers are stored and reused.',
      keyword: 'GATE 2011 asked which paradigm',
      trap: 'Community discussion notes that the printed recurrence tracks a contiguous increasing run rather than a subsequence, so the question tests paradigm recognition, not the definition of a subsequence.',
      narration: 'This is a genuine DP: n states, n work per state, n squared in total. GATE 2011 asked which paradigm such an algorithm uses.'
    },
    {
      id: 'lis-4', start: 232.5, end: 240, scene: 'lis',
      caption: 'The same shape solves the longest decreasing, the longest bitonic and the longest alternating versions: change the comparison, keep the table.',
      detail: 'Bitonic needs one pass left to right and one right to left, then a maximum over the sums. The structure is unchanged because the state is still an index and the choice is still "which later index do I attach to".',
      keyword: 'change the comparison, keep the table',
      trap: 'A binary search improvement to n log n exists for LIS length, but it does not give the witness or the count. Do not carry the faster bound into a question that asks for the subsequence.',
      narration: 'The same shape solves the longest decreasing, the longest bitonic and the longest alternating versions: change the comparison, keep the table.'
    },

    /* ---------------- scene 9: Floyd-Warshall ---------------- */
    {
      id: 'paths-1', start: 240, end: 247.5, scene: 'paths',
      caption: 'Floyd-Warshall asks: what is the shortest path from i to j using only vertices from the first k as intermediates?',
      detail: 'The state is the triple (i, j, k), and the table is filled for k equal to zero up to n. Each k either forbids vertex k as an intermediate or allows it.',
      keyword: 'using only vertices from the first k',
      trap: 'The k loop must be the outermost loop. Swapping it inside produces a table that is not the answer, which is a classic exam distractor.',
      narration: 'Floyd-Warshall asks: what is the shortest path from i to j using only vertices from the first k as intermediates?'
    },
    {
      id: 'paths-2', start: 247.5, end: 255, scene: 'paths',
      caption: 'Allowing vertex 1 first, then 2, then 3. Each step either keeps the old distance or routes through the new vertex.',
      detail: 'The transition is the smaller of the current distance and the distance i to k plus the distance k to j. That is one min per cell per k, so n cubed in total.',
      keyword: 'keeps the old distance or routes through the new vertex',
      trap: 'This is the same relaxation that Bellman-Ford performs, only organised by intermediate vertex instead of by edge count. Recognising the shape is what turns a hard-looking question into a table question.',
      narration: 'Allowing vertex one first, then two, then three. Each step either keeps the old distance or routes through the new vertex.'
    },
    {
      id: 'paths-3', start: 255, end: 262.5, scene: 'paths',
      caption: 'On this graph the distance from 0 to 3 is 8 directly, and allowing vertex 2 drops it to 5 through 1 and 2.',
      detail: 'The page checks the final table against Dijkstra run from every source, and against the triangle inequality. Both agree, so the table is not just plausible, it is correct.',
      keyword: 'drops it to 5',
      trap: 'Floyd-Warshall is DP, not greedy. GATE 2016 Set 2 asked exactly this, and the tempting wrong answer is greedy because Dijkstra is greedy and the two are taught together.',
      narration: 'On this graph the distance from zero to three is eight directly, and allowing vertex two drops it to five through one and two.'
    },
    {
      id: 'paths-4', start: 262.5, end: 270, scene: 'paths',
      caption: 'The same trick gives the longest path in a DAG, if you relax in topological order instead of by vertex number.',
      detail: 'A DAG has no cycles, so its states form a DAG and a topological order is a legal fill order. That single sentence covers most graph DPs, including the quality-score question from GATE 2021.',
      keyword: 'relax in topological order',
      trap: 'Longest path is NP-hard in a general graph. The DP works only because a DAG has no cycles, and the acyclicity is a hypothesis you must check, not a detail.',
      narration: 'The same trick gives the longest path in a DAG, if you relax in topological order instead of by vertex number.'
    },

    /* ---------------- scene 10: cost and space ---------------- */
    {
      id: 'space-1', start: 270, end: 277.5, scene: 'space',
      caption: 'Cost is states times work per state. Knapsack has n plus one times W plus one states and two choices each.',
      detail: 'So the running time is O of n times W, which is called pseudo-polynomial: polynomial in the numeric value of W, not in its bit length. That distinction is why knapsack is still NP-hard in the input size.',
      keyword: 'states times work per state',
      trap: 'Writing O of n log W or O of n times W as if W were a constant loses the marks. Say what the state is before quoting the bound.',
      narration: 'Cost is states times work per state. Knapsack has n plus one times W plus one states and two choices each.'
    },
    {
      id: 'space-2', start: 277.5, end: 285, scene: 'space',
      caption: 'Since a row reads only the row above it, one row of the table is enough. Space drops from n times W to W.',
      detail: 'Two items, weights 2 and 5, values 3 and 6, capacity 6. The 0/1 optimum is 6, taking the heavier item alone. A single array can hold that if it is updated in the right direction.',
      keyword: 'one row of the table is enough',
      trap: 'Overwriting in place is safe only when the read happens before the write. That is a property of the loop direction, not of the array.',
      narration: 'Since a row reads only the row above it, one row of the table is enough. Space drops from n times W to W.'
    },
    {
      id: 'space-3', start: 285, end: 292.5, scene: 'space',
      caption: 'Loop capacity upwards and the item is reused: the array reports 9, which takes the weight-2 item three times.',
      detail: 'An ascending loop reads the cell it has just written in this same item pass, so the item is effectively taken again. The page computes both directions and compares them with the true 0/1 optimum of 6.',
      keyword: 'the item is reused',
      trap: 'This is not a rounding artefact. Ascending capacity is the correct loop for unbounded knapsack and the wrong loop for 0/1, and the two problems differ by one loop direction.',
      narration: 'Loop capacity upwards and the item is reused: the array reports nine, which takes the weight two item three times.'
    },
    {
      id: 'space-4', start: 292.5, end: 300, scene: 'space',
      caption: 'Descending capacity reads only cells from the previous item, so it matches the full table exactly.',
      detail: 'The page checks that the descending one-row result equals the two-row answer, and that the ascending one equals the unbounded optimum. Two checks, one loop direction, and the misconception is settled by computation.',
      keyword: 'descending capacity reads only cells from the previous item',
      trap: 'Space can also be saved in LCS by keeping two rows, and in interval DP by keeping a diagonal. The direction that is safe differs per problem, so derive it each time.',
      narration: 'Descending capacity reads only cells from the previous item, so it matches the full table exactly.'
    },

    /* ---------------- scene 11: which paradigm ---------------- */
    {
      id: 'decide-1', start: 300, end: 307.5, scene: 'decide',
      caption: 'Two questions decide the paradigm. Does an optimal solution contain optimal solutions to subproblems, and do those subproblems repeat?',
      detail: 'Optimal substructure with no repetition is divide and conquer. Optimal substructure with repetition is dynamic programming. No optimal substructure at all means neither, and you are looking at a different problem class.',
      keyword: 'do those subproblems repeat',
      trap: 'Greedy is not one of the two questions. Greedy is what you get when the choice at each state can be made locally and proved safe, which is an extra property on top.',
      narration: 'Two questions decide the paradigm. Does an optimal solution contain optimal solutions to subproblems, and do those subproblems repeat?'
    },
    {
      id: 'decide-2', start: 307.5, end: 315, scene: 'decide',
      caption: 'Greedy needs a third property: some optimal solution agrees with the locally best choice. Without a proof of that, greedy is a guess.',
      detail: 'So the practical order is: try a greedy rule and look for a counterexample; if one exists and the subproblems overlap, use DP. If they do not overlap, use divide and conquer.',
      keyword: 'greedy is a guess',
      trap: 'DP can solve any problem greedy solves, but its state may be exponential. The reason to prefer greedy is cost, not correctness.',
      narration: 'Greedy needs a third property: some optimal solution agrees with the locally best choice. Without a proof of that, greedy is a guess.'
    },
    {
      id: 'decide-3', start: 315, end: 322.5, scene: 'decide',
      caption: 'Six problems, six states: capacity and item, two prefix lengths, an interval, an index, two vertices plus an intermediate, a sum.',
      detail: 'Knapsack, LCS, matrix chain, LIS, Floyd-Warshall and subset sum. In every case the state names exactly what the subproblem is allowed to depend on, and the table is indexed by it.',
      keyword: 'six states',
      trap: 'The state is the examinable part. Get the state right and the recurrence usually writes itself; get it wrong and no amount of table-filling saves the answer.',
      narration: 'Six problems, six states: capacity and item, two prefix lengths, an interval, an index, two vertices plus an intermediate, a sum.'
    },
    {
      id: 'decide-4', start: 322.5, end: 330, scene: 'decide',
      caption: 'Carry this out of the lesson: name the state, write the transition and the base case, then say which order fills the table.',
      detail: 'Four sentences answer almost every DP question in the paper. The animation has shown each of them being executed, so they are procedures rather than slogans.',
      keyword: 'name the state, write the transition and the base case',
      trap: 'The most expensive mistake in this topic is quoting a complexity without the state, and the second is filling a table in an order the recurrence does not permit.',
      narration: 'Carry this out of the lesson: name the state, write the transition and the base case, then say which order fills the table.'
    }
  ]
};
