/* ==========================================================================
   optimal-binary-search-tree — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs — never edited by hand.

   Every number quoted in a caption is computed by the model in lesson.js and
   printed on the canvas; the two agree because both read the same computation.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'shape',
      n: 1,
      title: 'Same keys, two shapes, two costs',
      start: 0, end: 30,
      objective: 'See that the cost of searching is a weighted sum of depths, so the shape of the tree is a decision with a price attached.'
    },
    {
      id: 'cost',
      n: 2,
      title: 'What the cost actually counts',
      start: 30, end: 60,
      objective: 'Define the level of a key as the number of comparisons needed to reach it, and the cost of a tree as the weighted sum of those levels.'
    },
    {
      id: 'sub',
      n: 3,
      title: 'Push a subtree down, and everything in it costs one more',
      start: 60, end: 90,
      objective: 'Derive the key lemma: cost of a tree equals cost of both subtrees plus the total weight of the keys in it.'
    },
    {
      id: 'rec',
      n: 4,
      title: 'One choice per subproblem: who sits at the root',
      start: 90, end: 120,
      objective: 'State the recurrence, its two base cases, and read it as "choose a root, then pay the interval once".'
    },
    {
      id: 'table',
      n: 5,
      title: 'Fill by length, not by row',
      start: 120, end: 150,
      objective: 'See why the table is a triangle, why length-one cells are free, and why cell (1,4) cannot be filled before (1,1) through (3,4).'
    },
    {
      id: 'worked',
      n: 6,
      title: 'Four keys, weights 4, 2, 1, 3: the answer is 19',
      start: 150, end: 180,
      objective: 'Run the recurrence on one instance, read the four candidate roots at the top level, and confirm the winner by hand.'
    },
    {
      id: 'greedy',
      n: 7,
      title: 'The most probable key is not always the root',
      start: 180, end: 210,
      objective: 'Defeat the greedy rule with a counterexample that costs exactly one comparison more, and say why the greedy choice fails.'
    },
    {
      id: 'rebuild',
      n: 8,
      title: 'The second table remembers the tree',
      start: 210, end: 240,
      objective: 'Record the winning root in each cell, walk the tree out of the table, and recognise when more than one tree ties for optimal.'
    },
    {
      id: 'huffman',
      n: 9,
      title: 'This is not Huffman, and the difference is one constraint',
      start: 240, end: 270,
      objective: 'Separate the two problems: Huffman has no ordering constraint and its greedy works; the search tree keeps the keys in order and its greedy fails.'
    },
    {
      id: 'proc',
      n: 10,
      title: 'Five steps, four traps',
      start: 270, end: 300,
      objective: 'Run a fixed procedure on any question in this family, and name the costs, the counts and the traps by sight.'
    }
  ],

  events: [

    /* ---------------- scene 1: shape ---------------- */
    {
      id: 'sh-1', scene: 'shape', start: 0, end: 8,
      caption: 'Four keys, searched with different frequencies. The tree is not fixed: only the left-to-right order is.',
      detail: 'A binary search tree over the keys 10, 20, 30, 40 must keep them in that left-to-right order, but any of them may sit at the root. Fourteen different shapes are possible.',
      narration: 'Here are four keys, searched with four different frequencies. The order of the keys is fixed, left to right. Everything else about the tree is yours to choose.',
      keyword: 'order fixed, shape free',
      trap: 'Assuming there is one right tree because there is one sorted order. Order constrains the shape; it does not determine it.'
    },
    {
      id: 'sh-2', scene: 'shape', start: 8, end: 15,
      caption: 'Three legal trees on the same keys: a chain with 10 on top, one with 40 on top, one with 20 on top.',
      detail: 'All three are legal binary search trees on the same four keys, and all three keep the keys in left-to-right order. They differ only in which key was chosen as the root at each step.',
      narration: 'Three legal trees. A chain with ten on top. One with forty on top. One with twenty on top. All three are correct binary search trees, and they are not equally good.',
      keyword: 'three legal trees',
      trap: 'Believing that any shape is as good as any other because all of them search correctly. They are equally correct and unequally fast.'
    },
    {
      id: 'sh-3', scene: 'shape', start: 15, end: 23,
      caption: 'The weights are 4, 2, 1 and 3 searches out of every ten. Key 10 is asked for most often, key 30 least.',
      detail: 'Weights are search frequencies. They need not sum to any particular number, but the expected number of comparisons is the total cost divided by the total weight, so only the ratios matter.',
      narration: 'The numbers under the keys are how often each is searched for: four, two, one and three out of every ten. The common key should be cheap to reach. That is the whole idea.',
      keyword: 'frequent keys should be shallow',
      trap: 'Normalising the weights by hand before starting. The recurrence works on raw counts, and dividing by the total at the end is one step.'
    },
    {
      id: 'sh-4', scene: 'shape', start: 23, end: 30,
      caption: 'The three cost 23, 21 and 19 on these weights. Same keys, same order, four comparisons apart.',
      detail: 'The chain pays one comparison for key 10 and four for key 40. The tree with 40 on top pays one for 40 and four for 30. The tree with 20 on top pays one for 20 and three for 30. On weights 4, 2, 1, 3 the totals are 23, 21 and 19.',
      narration: 'Count the comparisons. Twenty-three for the chain, twenty-one for the tree with forty on top, nineteen for the tree with twenty on top. Same keys, same order, four comparisons apart. So the shape is worth choosing.',
      keyword: '23, 21 and 19',
      trap: 'Concluding that the shallowest tree is always best. Depth is a property of the shape alone; the cost also depends on which keys sit deep.'
    },

    /* ---------------- scene 2: cost ---------------- */
    {
      id: 'co-1', scene: 'cost', start: 30, end: 38,
      caption: 'The level of a key is how many keys you compare it against, counting itself. The root sits at level 1.',
      detail: 'A successful search for the root compares once. For its child, twice. So the number of comparisons equals the depth measured in nodes, which is one more than the number of edges from the root.',
      narration: 'One definition first. The level of a key is the number of comparisons a successful search makes. The root is level one, not level zero, because you must compare against the root to know you are done.',
      keyword: 'root is level one',
      trap: 'Using the edge-counting depth, which starts at zero, and then reporting a cost one comparison too small on every key.'
    },
    {
      id: 'co-2', scene: 'cost', start: 38, end: 45,
      caption: 'Cost of a tree = sum over keys of weight times level. On the chain: 4 times 1, 2 times 2, 1 times 3, 3 times 4 = 23.',
      detail: 'Cost(T) = sum of p_i times level_i. It is the total number of comparisons over all searches, so dividing by the total weight gives the expected number of comparisons per search.',
      narration: 'The cost of a tree is a sum: each key contributes its weight times its level. On the chain that is four times one, two times two, one times three and three times four, which is twenty-three.',
      keyword: 'weight times level',
      trap: 'Weighting by probability and then also dividing by the total, which double-counts the normalisation. Do one or the other.'
    },
    {
      id: 'co-3', scene: 'cost', start: 45, end: 52,
      caption: 'Divide by the total weight 10: the three trees average 2.3, 2.1 and 1.9 comparisons per search.',
      detail: 'The expected number of comparisons is the cost divided by the total weight. A cost below the total weight would mean an average below one comparison, which is impossible.',
      narration: 'Divide by ten and you get the average per search: two point three, two point one, and one point nine. Every average is at least one, because every key needs at least one comparison.',
      keyword: 'average = cost over weight',
      trap: 'Reporting the total cost when the question asks for the expected number of comparisons. The two differ by the total weight.'
    },
    {
      id: 'co-4', scene: 'cost', start: 52, end: 60,
      caption: 'The same cost function covers unsuccessful searches too, with one convention change.',
      detail: 'When unsuccessful searches are given weights q_j, each gap between keys is an external node whose level is where the search fails, and its weight is added at that level. GATE 2027 questions on this topic have given only successful weights; the external-node version is the textbook general case.',
      narration: 'One extension, named but not used in the rest of this lesson. If the question also gives weights for searches that fail, each gap between keys becomes an external node and is charged at the level where the search falls out of the tree.',
      keyword: 'external nodes: the general case',
      trap: 'Mixing the two conventions, charging a failing search at the level of the last key compared rather than at the level where the search exits.'
    },

    /* ---------------- scene 3: sub ---------------- */
    {
      id: 'su-1', scene: 'sub', start: 60, end: 68,
      caption: 'Fix the root. Everything smaller goes left, everything larger goes right, and each side is itself a search tree.',
      detail: 'If key r is at the root, the left subtree holds keys i to r-1 and the right subtree holds keys r+1 to j. No key can cross: the ordering forces the split.',
      narration: 'Now the step that makes this a dynamic program. Suppose you have decided who the root is. Then the keys below it are forced into two groups: the smaller ones on the left, the larger ones on the right. Each group is itself a search tree over a contiguous range.',
      keyword: 'the root splits the range',
      trap: 'Imagining you can interleave the two sides. You cannot: the ordering puts every smaller key left and every larger key right.'
    },
    {
      id: 'su-2', scene: 'sub', start: 68, end: 75,
      caption: 'A key one level deeper costs exactly its weight more. So moving a whole subtree down adds its total weight once.',
      detail: 'If every key of a subtree moves down one level, each contributes one extra weight times level, so the subtree cost rises by the sum of its weights. That sum is a property of the key range, not of the shape.',
      narration: 'Here is the accounting. Push a subtree down one level and every key in it needs one more comparison. So the subtree costs more by the sum of its weights — a number that depends only on which keys are in it, not on how they are arranged.',
      keyword: 'one more level, one more weight',
      trap: 'Adding the number of keys instead of the sum of their weights. Only with equal weights do the two coincide.'
    },
    {
      id: 'su-3', scene: 'sub', start: 75, end: 82,
      caption: 'So cost of tree = cost of left + cost of right + weight of the whole range.',
      detail: 'The root contributes its own weight once. Each subtree contributes its own internal cost plus one extra copy of its total weight. Collecting the weights of left, right and the root gives the weight of the whole interval.',
      narration: 'Put those two facts together. The cost of a tree is the cost of its left subtree, plus the cost of its right subtree, plus the total weight of the range, counted once. That last term is the price of having a root at all.',
      keyword: 'plus the range weight, once',
      trap: 'Omitting the range-weight term, which yields the impossible answer that a two-key tree costs less than the deeper of its two keys.'
    },
    {
      id: 'su-4', scene: 'sub', start: 82, end: 90,
      caption: 'That is optimal substructure: the best tree for a range uses the best trees for its two parts.',
      detail: 'If the left subtree were not optimal for its range, replacing it with a better one would lower the whole cost, because the range-weight term does not change. So an optimal tree is built from optimal subtrees.',
      narration: 'And the reason the DP is correct: if either subtree were not the best one for its range, swapping in a better one would make the whole tree cheaper, because the range-weight term does not change. So the best tree is made of the best subtrees.',
      keyword: 'best tree, best subtrees',
      trap: 'Quoting optimal substructure without checking that the shared term is independent of the choice. Here it is, and that is exactly why the argument works.'
    },

    /* ---------------- scene 4: rec ---------------- */
    {
      id: 're-1', scene: 'rec', start: 90, end: 98,
      caption: 'C of i and j is the cheapest cost for keys i to j. One cell, one range.',
      detail: 'C(i,j) is the minimum cost of any search tree over the contiguous key range i to j, counting levels from the root of that range as level 1. The empty range is defined to cost 0.',
      narration: 'Name the subproblems. C of i and j means the cheapest cost for the keys numbered i through j, counting levels from that range root. There are only n times n plus one over two such ranges, which is why the table is small.',
      keyword: 'one cell, one range',
      trap: 'Indexing the table by key value rather than by position. The ranges are contiguous in sorted position, and only position matters.'
    },
    {
      id: 're-2', scene: 'rec', start: 98, end: 105,
      caption: 'C of i and i is just the weight of key i: one key, one comparison.',
      detail: 'A range with one key has that key at the root, so it is compared once and the cost is its weight. This base case is what stops the recursion.',
      narration: 'The base case is the single key. One key, sitting at the root of its own little tree, costs its weight exactly. A range with no keys costs nothing at all.',
      keyword: 'single key, single weight',
      trap: 'Starting the table with zeros everywhere and forgetting that a one-key range costs its weight, not zero.'
    },
    {
      id: 're-3', scene: 'rec', start: 105, end: 112,
      caption: 'C of i and j = weight of the range + the smallest of C(i,r-1) + C(r+1,j) over every root r.',
      detail: 'For each candidate root r in the range, the cost is the range weight plus the two sub-range costs. The minimum over r is the answer for that cell. Empty sub-ranges contribute zero.',
      narration: 'Now the recurrence. Add the weight of the range. Then, for each possible root, add the costs of the two pieces beside it. Take the smallest of those sums. That is the cheapest tree for the range.',
      keyword: 'minimum over the root',
      trap: 'Minimising the sum of the two sub-costs without the range weight. Every root then scores zero and the answer collapses.'
    },
    {
      id: 're-4', scene: 'rec', start: 112, end: 120,
      caption: 'Every subproblem is solved once, and the answer is one cell: C of 1 and n.',
      detail: 'The recurrence refers only to strictly shorter ranges, so the subproblems form a partial order by length. Solving them in increasing length means each is available when needed, and the whole table is filled in one pass.',
      narration: 'Notice what the recurrence depends on: only shorter ranges. That is the whole reason the table works. Fill the short ones first and every cell you need is already there when you ask for it.',
      keyword: 'only shorter ranges',
      trap: 'Filling the table by row, so that cell (1,4) is asked for before (3,4) exists. Fill by length.'
    },

    /* ---------------- scene 5: table ---------------- */
    {
      id: 'ta-1', scene: 'table', start: 120, end: 128,
      caption: 'The table is a triangle: n times n plus one over two cells, which is 10 for four keys.',
      detail: 'Only ranges with i not greater than j are meaningful, so the upper triangle of the square table is used. For four keys that is 4 + 3 + 2 + 1 = 10 cells.',
      narration: 'The table is a triangle. A range is named by its two ends, and the left end never passes the right end. For four keys that is ten cells: four of length one, three of length two, two of length three, one of length four.',
      keyword: 'a triangle of ten cells',
      trap: 'Allocating and reading a full square, then treating the lower half as zeros that can be read as costs.'
    },
    {
      id: 'ta-2', scene: 'table', start: 128, end: 135,
      caption: 'The first diagonal is free: each cell is the weight of one key.',
      detail: 'Cells of the form C(i,i) are base cases and need no minimisation. They are the weights themselves: 4, 2, 1 and 3 in the worked instance.',
      narration: 'Start on the main diagonal. Each cell there is one key on its own, so the answer is that key weight: four, two, one, three. No work yet.',
      keyword: 'the diagonal is the weights',
      trap: 'Trying to apply the full recurrence on the diagonal, where the two sub-ranges are empty and the minimum is degenerate.'
    },
    {
      id: 'ta-3', scene: 'table', start: 135, end: 142,
      caption: 'Length two needs length one. Length three needs length two. Length four needs everything below it.',
      detail: 'C(1,4) reads C(1,1), C(3,4), C(1,2), C(4,4) and C(1,3), which are lengths one, two, two, one and three. So the fill order is by increasing length, and within a length any order works.',
      narration: 'Each cell reads shorter cells only. So the order is by length: all length one, then all length two, then three, then four. Within one length the cells do not depend on each other, so any order inside a diagonal is fine.',
      keyword: 'length by length',
      trap: 'Believing a row-major or column-major pass is correct. It happens to work for some small tables and fails in general.'
    },
    {
      id: 'ta-4', scene: 'table', start: 142, end: 150,
      caption: 'The work per cell is proportional to its length, so the total is a cubic in n.',
      detail: 'A cell of length L tries L roots. Summing over the triangle gives about n cubed over six candidate-root evaluations, so the naive algorithm is cubic in time and quadratic in space.',
      narration: 'The cost of filling a cell is proportional to how many roots it tries. Adding that up over the triangle gives a cubic. Cubic time, quadratic space, and for exam-sized tables that is fast enough.',
      keyword: 'cubic time, quadratic space',
      trap: 'Claiming the algorithm is quadratic. Only the space is quadratic; the time is cubic unless an extra monotonicity condition holds.'
    },

    /* ---------------- scene 6: worked ---------------- */
    {
      id: 'wo-1', scene: 'worked', start: 150, end: 158,
      caption: 'Keys 10, 20, 30, 40 with weights 4, 2, 1, 3. The diagonal is 4, 2, 1, 3.',
      detail: 'Four keys and four weights, so the table has ten cells. The weights are search counts, not probabilities, and total 10.',
      narration: 'One instance, worked all the way through. Keys ten, twenty, thirty, forty, with weights four, two, one and three. The diagonal of the table is just those four weights.',
      keyword: 'weights 4, 2, 1, 3',
      trap: 'Sorting the weights independently of the keys. The weights belong to positions, and the positions are already sorted by key.'
    },
    {
      id: 'wo-2', scene: 'worked', start: 158, end: 165,
      caption: 'Length two: range 1 to 2 costs 8, range 2 to 3 costs 4, range 3 to 4 costs 5.',
      detail: 'For range 1 to 2 the range weight is 6. Root 1 gives 2 plus 6, root 2 gives 4 plus 6, so the answer is 8 with root 1. For range 2 to 3 the weight is 3, roots give 4 and 5, so 4 with root 2. For range 3 to 4 the weight is 4, roots give 7 and 5, so 5 with root 4.',
      narration: 'Length two. Range one to two: the range weight is six, and the two roots score eight and ten, so eight. Range two to three: four and five, so four. Range three to four: seven and five, so five. Note the last one picks the heavier key as root, because the other side is heavier still.',
      keyword: '8, 4 and 5',
      trap: 'Adding the range weight twice, once per sub-range. It is added once per cell, not once per side.'
    },
    {
      id: 'wo-3', scene: 'worked', start: 165, end: 172,
      caption: 'Length three: 11 and 10. Length four: the four roots score 20, 19, 21, 21.',
      detail: 'Range 1 to 3 has weight 7 and scores 11, 12, 15 for roots 1, 2, 3. Range 2 to 4 has weight 6 and scores 11, 11, 10, so 10 with root 4. Range 1 to 4 has weight 10 and scores 20, 19, 21, 21.',
      narration: 'Length three: eleven for the first range, ten for the second. Now the last cell. The range weight is ten. Root one gives twenty, root two gives nineteen, root three gives twenty-one, root four gives twenty-one. Nineteen wins, and the root is key twenty.',
      keyword: 'nineteen, root 20',
      trap: 'Choosing root 1 because its own weight is the largest. It is the largest and it is not the winner.'
    },
    {
      id: 'wo-4', scene: 'worked', start: 172, end: 180,
      caption: 'Root 20, with 10 on the left and 40 on the right carrying 30. Levels 1, 2, 2, 3. Check: 19.',
      detail: 'Levels are 20 at 1, 10 at 2, 40 at 2, 30 at 3. The weighted sum is 4 times 2, plus 2 times 1, plus 1 times 3, plus 3 times 2, which is 8 plus 2 plus 3 plus 6, and that is 19. The average over ten searches is 1.9 comparisons.',
      narration: 'Read the tree out. Twenty at the root. Ten on the left. Forty on the right, with thirty hanging on its left. Levels one, two, two, three. Multiply and add: nineteen. Over ten searches that is an average of one point nine comparisons.',
      keyword: '19, and 1.9 on average',
      trap: 'Reading 30 as level two because it is drawn near 40. Its level is three: root, then 40, then 30.'
    },

    /* ---------------- scene 7: greedy ---------------- */
    {
      id: 'gr-1', scene: 'greedy', start: 180, end: 188,
      caption: 'The tempting rule: put the most probable key at the root, then repeat. On this instance it gives 20.',
      detail: 'The greedy rule chooses the maximum weight in the range as the root, then recurses on both sides. Here it picks key 10, then key 40, then key 20, giving levels 1, 3, 4, 2 and a total of 20.',
      narration: 'Here is the rule that looks obviously right. Put the most searched key at the root, then do the same on each side. On this instance it puts ten on top, then forty, then twenty. Count the cost: twenty.',
      keyword: 'greedy scores 20',
      trap: 'Checking the greedy rule only on instances where it happens to win, which is most of the small symmetric ones.'
    },
    {
      id: 'gr-2', scene: 'greedy', start: 188, end: 195,
      caption: 'The optimal tree scores 19. Greedy is one comparison worse, and that is enough to be wrong.',
      detail: 'Greedy puts weight 4 at level 1 and weight 3 at level 2, which looks efficient. The optimal tree puts weight 2 at level 1 and pushes weight 4 down to level 2, but it also lifts weight 3 from level 4 to level 3 and weight 1 from level 3 to level 3.',
      narration: 'The optimal tree scores nineteen. So greedy is one comparison worse. Why? Because making the heaviest key the root is cheap for that key and expensive for everyone below it, and greedy never looks below.',
      keyword: 'greedy loses by one',
      trap: 'Deciding greedy is "almost right" and acceptable. In an exam, one comparison is the difference between the right option and the wrong one.'
    },
    {
      id: 'gr-3', scene: 'greedy', start: 195, end: 202,
      caption: 'A second instance: weights 3, 3, 1, 1. Greedy gives 16, the optimum is 14 with root 20.',
      detail: 'With weights 3, 3, 1, 1 greedy picks key 10, then key 20, then key 30, producing a chain of levels 1, 2, 3, 4 and a cost of 3 plus 6 plus 3 plus 4, which is 16. Root 20 gives levels 2, 1, 2, 3 and a cost of 6 plus 3 plus 2 plus 3, which is 14.',
      narration: 'And it is not a one-off. Weights three, three, one, one. Greedy produces a chain costing sixteen. The right root is the second key, and it costs fourteen. The gap widens as the weights get more lopsided in the middle.',
      keyword: '14 against 16',
      trap: 'Believing the tie in weights makes the choice arbitrary. Here the tie is exactly why the choice matters: either of the two heavy keys can be root, and only one of them wins.'
    },
    {
      id: 'gr-4', scene: 'greedy', start: 202, end: 210,
      caption: 'The failure is structural: the root choice is paid for by every key below it, so it cannot be judged alone.',
      detail: 'A root at level 1 saves its own weight one comparison and costs every other key in the range one comparison. So the right question is not "which key is heaviest" but "which split leaves the two sides cheap", and that depends on the whole range.',
      narration: 'The reason is structural. Choosing a root saves that one key a comparison and charges every other key in the range one comparison. So the root is not a local decision at all: it is a decision about the whole range, which is precisely what the table computes.',
      keyword: 'the root is a whole-range decision',
      trap: 'Looking for a tie-breaking rule on the weights. No rule on the weights alone is correct; the answer depends on the intervals.'
    },

    /* ---------------- scene 8: rebuild ---------------- */
    {
      id: 'rb-1', scene: 'rebuild', start: 210, end: 218,
      caption: 'Keep a second table: R of i and j is the root that won that cell.',
      detail: 'The cost table answers "how much"; the root table answers "which tree". Each cell stores the index r that achieved the minimum, so the tree can be rebuilt without recomputing anything.',
      narration: 'The cost table tells you how much. To get the tree itself, keep a second table of the same shape, and in each cell write down which root won.',
      keyword: 'one extra table',
      trap: 'Recomputing the argmin at reconstruction time from the cost table. It works, but it costs the same cubic work twice, and ties can resolve differently.'
    },
    {
      id: 'rb-2', scene: 'rebuild', start: 218, end: 225,
      caption: 'R of 1 and 4 is 2, so 20 is the root. R of 1 and 1 is 1. R of 3 and 4 is 4.',
      detail: 'Starting from the whole range, read R(1,4) equals 2. That splits into the range 1 to 1, whose root is key 1, and the range 3 to 4, whose root is key 4. Then R(3,3) equals 3 gives the last key.',
      narration: 'Read the top cell: the root is key two, that is twenty. That splits the range into one key on the left and two on the right. The left cell names key one. The right cell names key four. Then key three goes under it.',
      keyword: 'walk the root table down',
      trap: 'Reading the root table as a whole tree at once. It must be walked range by range, starting from the top cell.'
    },
    {
      id: 'rb-3', scene: 'rebuild', start: 225, end: 232,
      caption: 'Recompute the cost from the rebuilt tree. It must equal the table entry, or one of the two is wrong.',
      detail: 'Summing weight times level over the rebuilt tree gives 19, which matches C(1,4). That agreement is the check that reconstruction used the right cells.',
      narration: 'Then check. Sum weight times level over the tree you just rebuilt. It must equal the number in the top cell. If it does not, you have read a wrong cell or added a wrong level.',
      keyword: 'the rebuilt tree must re-add to the table',
      trap: 'Trusting the reconstruction without the re-add, which is the only cheap way to catch an off-by-one in the root table.'
    },
    {
      id: 'rb-4', scene: 'rebuild', start: 232, end: 240,
      caption: 'Ties are real: with weights 5, 45, 45, 5 there are two optimal roots, so two optimal trees.',
      detail: 'Both C(1,2) plus C(3,4) and C(1,1) plus C(2,4) plus the range weight give 160, so roots 2 and 3 both win. Two trees reach the same cost; a question that asks for "the" optimal tree in such a case has two correct answers.',
      narration: 'One warning about ties. With weights five, forty-five, forty-five and five, both middle keys win as root. Two different trees reach the same cost of one hundred and sixty. So "the" optimal tree is not unique in general.',
      keyword: 'two roots, one cost',
      trap: 'Assuming the optimal tree is unique. It is unique here on weights 4, 2, 1, 3 and it is not unique in general.'
    },

    /* ---------------- scene 9: huffman ---------------- */
    {
      id: 'hu-1', scene: 'huffman', start: 240, end: 248,
      caption: 'Huffman also minimises a weighted depth. But its tree has no ordering constraint at all.',
      detail: 'Huffman coding builds a binary tree whose leaves are symbols, with no requirement that the leaves appear in any particular left-to-right order. The search tree requires exactly that order, which is what makes searching possible.',
      narration: 'This looks like Huffman coding, and it is not. Huffman also minimises weight times depth. But Huffman may put its symbols anywhere: there is no left-to-right order to respect. That single constraint changes the problem completely.',
      keyword: 'one constraint changes everything',
      trap: 'Reusing the Huffman algorithm with the keys as leaves. A search tree stores keys in internal nodes, so every key must be reachable as a comparison.'
    },
    {
      id: 'hu-2', scene: 'huffman', start: 248, end: 255,
      caption: 'Huffman merges the two lightest weights repeatedly. On 5, 45, 45, 5 it gives a cost of 165.',
      detail: 'Huffman merges 5 with 5 to get 10, then 10 with 45 to get 55, then 55 with 45 to get 100. One 45 ends at depth 1, the other at depth 2, and the two 5s at depth 3, so the cost is 45 plus 90 plus 15 plus 15, which is 165.',
      narration: 'Huffman merges the two lightest weights repeatedly: the two fives become ten, ten and forty-five become fifty-five, and fifty-five and forty-five become the root. One heavy key ends at depth one, the other at depth two, the two fives at depth three, and the cost is one hundred and sixty-five.',
      keyword: 'Huffman: 165',
      trap: 'Reading 165 against 160 as a comparison. The two numbers charge different objects, so one is not better than the other.'
    },
    {
      id: 'hu-3', scene: 'huffman', start: 255, end: 262,
      caption: 'Huffman is not a search tree: it puts keys 1 and 4 in one subtree and keys 2 and 3 in the other.',
      detail: 'Its first subtree contains keys 1 and 4, which straddle keys 2 and 3 in the other subtree. No assignment of left and right can make that a binary search tree. And its symbols are at leaves, while a search tree stores keys at the nodes where comparisons happen.',
      narration: 'And here is the catch. Huffman puts keys one and four together, and keys two and three together. No way of choosing left and right turns that into a search tree. It also stores its symbols at leaves, and a search tree stores keys where the comparisons happen.',
      keyword: 'not a search tree at all',
      trap: 'Believing a tree with a smaller number is a better answer. Here the number is larger and the tree is invalid; both facts matter.'
    },
    {
      id: 'hu-4', scene: 'huffman', start: 262, end: 270,
      caption: 'The order-respecting cousin of Huffman is alphabetic coding, and it is not what GATE asks for here.',
      detail: 'Hu and Tucker gave an algorithm for optimal alphabetic binary trees, which do keep the leaves in order. That is a different object from a search tree over keys in internal nodes, and the GATE syllabus names neither.',
      narration: 'There is an order-respecting relative of Huffman, called alphabetic coding, solved by Hu and Tucker. It is a different object again, and it is not what this question asks. Keep the three apart: Huffman, alphabetic coding, and the search tree.',
      keyword: 'three different trees',
      trap: 'Mixing up alphabetic coding with the optimal search tree because both keep an order. In alphabetic coding the symbols are leaves; here the keys are internal nodes.'
    },

    /* ---------------- scene 10: proc ---------------- */
    {
      id: 'pr-1', scene: 'proc', start: 270, end: 278,
      caption: 'Step one: check that the keys are sorted and that every key has a weight. Step two: build the triangle.',
      detail: 'The method assumes a sorted key list and a weight per key. If the question gives probabilities, keep them; if it gives frequencies, keep them; the total is divided out only at the very end.',
      narration: 'Five steps. First, check the keys are in order and every key carries a weight. Second, draw the triangle: four rows of four cells for four keys, and fill the diagonal with the weights.',
      keyword: 'check, then draw the triangle',
      trap: 'Starting the table before checking that the weights line up with the keys in sorted order.'
    },
    {
      id: 'pr-2', scene: 'proc', start: 278, end: 285,
      caption: 'Step three: fill by increasing length. Step four: record the winning root in every cell.',
      detail: 'Length one is the diagonal. For each longer length, every cell tries each root in its range and keeps the smallest. The argmin goes into the second table so the tree can be rebuilt.',
      narration: 'Third, fill by length, shortest first. Fourth, write the winning root in a second table as you go. Both tables are the same shape, and the second one is what gives you the tree rather than just its price.',
      keyword: 'fill by length, record the root',
      trap: 'Filling by row. It sometimes gives the right numbers on a four-key table and is still the wrong procedure.'
    },
    {
      id: 'pr-3', scene: 'proc', start: 285, end: 293,
      caption: 'Step five: rebuild the tree, then re-add weight times level and check it against the top cell.',
      detail: 'The re-add is the only cheap self-check available: if the rebuilt tree does not sum to the table entry, a cell was misread. Report the cost and, if asked, the average by dividing by the total weight.',
      narration: 'Fifth, rebuild the tree from the root table and add up weight times level. If that does not equal the top cell, something was misread. Then report the cost, or the average if the question asks for expected comparisons.',
      keyword: 'always re-add',
      trap: 'Reporting the cost when the question asked for the expected number of comparisons, or the other way round.'
    },
    {
      id: 'pr-4', scene: 'proc', start: 293, end: 300,
      caption: 'The traps: greedy root, edge-depth, a missing range weight, and assuming the answer is unique.',
      detail: 'Four traps cover almost every wrong option: making the heaviest key the root, counting levels from zero, dropping the range-weight term, and asserting uniqueness when two roots tie. Each is defeated by one of the checks on this page.',
      narration: 'And the four traps. Making the heaviest key the root. Counting levels from zero instead of one. Forgetting the range weight. And claiming the optimal tree is unique when two roots tie. Each one is defeated by a check you can do in seconds.',
      keyword: 'the four traps',
      trap: 'Memorising a worked answer instead of the procedure. The numbers change between papers; the five steps do not.'
    }
  ]
};
