# Optimal Binary Search Tree — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/optimal-binary-search-tree/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Same keys, two shapes, two costs

*0:00 – 0:30 · objective: See that the cost of searching is a weighted sum of depths, so the shape of the tree is a decision with a price attached.*

**0:00–0:08** — Here are four keys, searched with four different frequencies. The order of the keys is fixed, left to right. Everything else about the tree is yours to choose.

> Caption: Four keys, searched with different frequencies. The tree is not fixed: only the left-to-right order is.

Exam-trap caption mode adds: *Assuming there is one right tree because there is one sorted order. Order constrains the shape; it does not determine it.*

**0:08–0:15** — Three legal trees. A chain with ten on top. One with forty on top. One with twenty on top. All three are correct binary search trees, and they are not equally good.

> Caption: Three legal trees on the same keys: a chain with 10 on top, one with 40 on top, one with 20 on top.

Exam-trap caption mode adds: *Believing that any shape is as good as any other because all of them search correctly. They are equally correct and unequally fast.*

**0:15–0:23** — The numbers under the keys are how often each is searched for: four, two, one and three out of every ten. The common key should be cheap to reach. That is the whole idea.

> Caption: The weights are 4, 2, 1 and 3 searches out of every ten. Key 10 is asked for most often, key 30 least.

Exam-trap caption mode adds: *Normalising the weights by hand before starting. The recurrence works on raw counts, and dividing by the total at the end is one step.*

**0:23–0:30** — Count the comparisons. Twenty-three for the chain, twenty-one for the tree with forty on top, nineteen for the tree with twenty on top. Same keys, same order, four comparisons apart. So the shape is worth choosing.

> Caption: The three cost 23, 21 and 19 on these weights. Same keys, same order, four comparisons apart.

Exam-trap caption mode adds: *Concluding that the shallowest tree is always best. Depth is a property of the shape alone; the cost also depends on which keys sit deep.*

## Scene 2. What the cost actually counts

*0:30 – 1:00 · objective: Define the level of a key as the number of comparisons needed to reach it, and the cost of a tree as the weighted sum of those levels.*

**0:30–0:38** — One definition first. The level of a key is the number of comparisons a successful search makes. The root is level one, not level zero, because you must compare against the root to know you are done.

> Caption: The level of a key is how many keys you compare it against, counting itself. The root sits at level 1.

Exam-trap caption mode adds: *Using the edge-counting depth, which starts at zero, and then reporting a cost one comparison too small on every key.*

**0:38–0:45** — The cost of a tree is a sum: each key contributes its weight times its level. On the chain that is four times one, two times two, one times three and three times four, which is twenty-three.

> Caption: Cost of a tree = sum over keys of weight times level. On the chain: 4 times 1, 2 times 2, 1 times 3, 3 times 4 = 23.

Exam-trap caption mode adds: *Weighting by probability and then also dividing by the total, which double-counts the normalisation. Do one or the other.*

**0:45–0:52** — Divide by ten and you get the average per search: two point three, two point one, and one point nine. Every average is at least one, because every key needs at least one comparison.

> Caption: Divide by the total weight 10: the three trees average 2.3, 2.1 and 1.9 comparisons per search.

Exam-trap caption mode adds: *Reporting the total cost when the question asks for the expected number of comparisons. The two differ by the total weight.*

**0:52–1:00** — One extension, named but not used in the rest of this lesson. If the question also gives weights for searches that fail, each gap between keys becomes an external node and is charged at the level where the search falls out of the tree.

> Caption: The same cost function covers unsuccessful searches too, with one convention change.

Exam-trap caption mode adds: *Mixing the two conventions, charging a failing search at the level of the last key compared rather than at the level where the search exits.*

## Scene 3. Push a subtree down, and everything in it costs one more

*1:00 – 1:30 · objective: Derive the key lemma: cost of a tree equals cost of both subtrees plus the total weight of the keys in it.*

**1:00–1:08** — Now the step that makes this a dynamic program. Suppose you have decided who the root is. Then the keys below it are forced into two groups: the smaller ones on the left, the larger ones on the right. Each group is itself a search tree over a contiguous range.

> Caption: Fix the root. Everything smaller goes left, everything larger goes right, and each side is itself a search tree.

Exam-trap caption mode adds: *Imagining you can interleave the two sides. You cannot: the ordering puts every smaller key left and every larger key right.*

**1:08–1:15** — Here is the accounting. Push a subtree down one level and every key in it needs one more comparison. So the subtree costs more by the sum of its weights — a number that depends only on which keys are in it, not on how they are arranged.

> Caption: A key one level deeper costs exactly its weight more. So moving a whole subtree down adds its total weight once.

Exam-trap caption mode adds: *Adding the number of keys instead of the sum of their weights. Only with equal weights do the two coincide.*

**1:15–1:22** — Put those two facts together. The cost of a tree is the cost of its left subtree, plus the cost of its right subtree, plus the total weight of the range, counted once. That last term is the price of having a root at all.

> Caption: So cost of tree = cost of left + cost of right + weight of the whole range.

Exam-trap caption mode adds: *Omitting the range-weight term, which yields the impossible answer that a two-key tree costs less than the deeper of its two keys.*

**1:22–1:30** — And the reason the DP is correct: if either subtree were not the best one for its range, swapping in a better one would make the whole tree cheaper, because the range-weight term does not change. So the best tree is made of the best subtrees.

> Caption: That is optimal substructure: the best tree for a range uses the best trees for its two parts.

Exam-trap caption mode adds: *Quoting optimal substructure without checking that the shared term is independent of the choice. Here it is, and that is exactly why the argument works.*

## Scene 4. One choice per subproblem: who sits at the root

*1:30 – 2:00 · objective: State the recurrence, its two base cases, and read it as "choose a root, then pay the interval once".*

**1:30–1:38** — Name the subproblems. C of i and j means the cheapest cost for the keys numbered i through j, counting levels from that range root. There are only n times n plus one over two such ranges, which is why the table is small.

> Caption: C of i and j is the cheapest cost for keys i to j. One cell, one range.

Exam-trap caption mode adds: *Indexing the table by key value rather than by position. The ranges are contiguous in sorted position, and only position matters.*

**1:38–1:45** — The base case is the single key. One key, sitting at the root of its own little tree, costs its weight exactly. A range with no keys costs nothing at all.

> Caption: C of i and i is just the weight of key i: one key, one comparison.

Exam-trap caption mode adds: *Starting the table with zeros everywhere and forgetting that a one-key range costs its weight, not zero.*

**1:45–1:52** — Now the recurrence. Add the weight of the range. Then, for each possible root, add the costs of the two pieces beside it. Take the smallest of those sums. That is the cheapest tree for the range.

> Caption: C of i and j = weight of the range + the smallest of C(i,r-1) + C(r+1,j) over every root r.

Exam-trap caption mode adds: *Minimising the sum of the two sub-costs without the range weight. Every root then scores zero and the answer collapses.*

**1:52–2:00** — Notice what the recurrence depends on: only shorter ranges. That is the whole reason the table works. Fill the short ones first and every cell you need is already there when you ask for it.

> Caption: Every subproblem is solved once, and the answer is one cell: C of 1 and n.

Exam-trap caption mode adds: *Filling the table by row, so that cell (1,4) is asked for before (3,4) exists. Fill by length.*

## Scene 5. Fill by length, not by row

*2:00 – 2:30 · objective: See why the table is a triangle, why length-one cells are free, and why cell (1,4) cannot be filled before (1,1) through (3,4).*

**2:00–2:08** — The table is a triangle. A range is named by its two ends, and the left end never passes the right end. For four keys that is ten cells: four of length one, three of length two, two of length three, one of length four.

> Caption: The table is a triangle: n times n plus one over two cells, which is 10 for four keys.

Exam-trap caption mode adds: *Allocating and reading a full square, then treating the lower half as zeros that can be read as costs.*

**2:08–2:15** — Start on the main diagonal. Each cell there is one key on its own, so the answer is that key weight: four, two, one, three. No work yet.

> Caption: The first diagonal is free: each cell is the weight of one key.

Exam-trap caption mode adds: *Trying to apply the full recurrence on the diagonal, where the two sub-ranges are empty and the minimum is degenerate.*

**2:15–2:22** — Each cell reads shorter cells only. So the order is by length: all length one, then all length two, then three, then four. Within one length the cells do not depend on each other, so any order inside a diagonal is fine.

> Caption: Length two needs length one. Length three needs length two. Length four needs everything below it.

Exam-trap caption mode adds: *Believing a row-major or column-major pass is correct. It happens to work for some small tables and fails in general.*

**2:22–2:30** — The cost of filling a cell is proportional to how many roots it tries. Adding that up over the triangle gives a cubic. Cubic time, quadratic space, and for exam-sized tables that is fast enough.

> Caption: The work per cell is proportional to its length, so the total is a cubic in n.

Exam-trap caption mode adds: *Claiming the algorithm is quadratic. Only the space is quadratic; the time is cubic unless an extra monotonicity condition holds.*

## Scene 6. Four keys, weights 4, 2, 1, 3: the answer is 19

*2:30 – 3:00 · objective: Run the recurrence on one instance, read the four candidate roots at the top level, and confirm the winner by hand.*

**2:30–2:38** — One instance, worked all the way through. Keys ten, twenty, thirty, forty, with weights four, two, one and three. The diagonal of the table is just those four weights.

> Caption: Keys 10, 20, 30, 40 with weights 4, 2, 1, 3. The diagonal is 4, 2, 1, 3.

Exam-trap caption mode adds: *Sorting the weights independently of the keys. The weights belong to positions, and the positions are already sorted by key.*

**2:38–2:45** — Length two. Range one to two: the range weight is six, and the two roots score eight and ten, so eight. Range two to three: four and five, so four. Range three to four: seven and five, so five. Note the last one picks the heavier key as root, because the other side is heavier still.

> Caption: Length two: range 1 to 2 costs 8, range 2 to 3 costs 4, range 3 to 4 costs 5.

Exam-trap caption mode adds: *Adding the range weight twice, once per sub-range. It is added once per cell, not once per side.*

**2:45–2:52** — Length three: eleven for the first range, ten for the second. Now the last cell. The range weight is ten. Root one gives twenty, root two gives nineteen, root three gives twenty-one, root four gives twenty-one. Nineteen wins, and the root is key twenty.

> Caption: Length three: 11 and 10. Length four: the four roots score 20, 19, 21, 21.

Exam-trap caption mode adds: *Choosing root 1 because its own weight is the largest. It is the largest and it is not the winner.*

**2:52–3:00** — Read the tree out. Twenty at the root. Ten on the left. Forty on the right, with thirty hanging on its left. Levels one, two, two, three. Multiply and add: nineteen. Over ten searches that is an average of one point nine comparisons.

> Caption: Root 20, with 10 on the left and 40 on the right carrying 30. Levels 1, 2, 2, 3. Check: 19.

Exam-trap caption mode adds: *Reading 30 as level two because it is drawn near 40. Its level is three: root, then 40, then 30.*

## Scene 7. The most probable key is not always the root

*3:00 – 3:30 · objective: Defeat the greedy rule with a counterexample that costs exactly one comparison more, and say why the greedy choice fails.*

**3:00–3:08** — Here is the rule that looks obviously right. Put the most searched key at the root, then do the same on each side. On this instance it puts ten on top, then forty, then twenty. Count the cost: twenty.

> Caption: The tempting rule: put the most probable key at the root, then repeat. On this instance it gives 20.

Exam-trap caption mode adds: *Checking the greedy rule only on instances where it happens to win, which is most of the small symmetric ones.*

**3:08–3:15** — The optimal tree scores nineteen. So greedy is one comparison worse. Why? Because making the heaviest key the root is cheap for that key and expensive for everyone below it, and greedy never looks below.

> Caption: The optimal tree scores 19. Greedy is one comparison worse, and that is enough to be wrong.

Exam-trap caption mode adds: *Deciding greedy is "almost right" and acceptable. In an exam, one comparison is the difference between the right option and the wrong one.*

**3:15–3:22** — And it is not a one-off. Weights three, three, one, one. Greedy produces a chain costing sixteen. The right root is the second key, and it costs fourteen. The gap widens as the weights get more lopsided in the middle.

> Caption: A second instance: weights 3, 3, 1, 1. Greedy gives 16, the optimum is 14 with root 20.

Exam-trap caption mode adds: *Believing the tie in weights makes the choice arbitrary. Here the tie is exactly why the choice matters: either of the two heavy keys can be root, and only one of them wins.*

**3:22–3:30** — The reason is structural. Choosing a root saves that one key a comparison and charges every other key in the range one comparison. So the root is not a local decision at all: it is a decision about the whole range, which is precisely what the table computes.

> Caption: The failure is structural: the root choice is paid for by every key below it, so it cannot be judged alone.

Exam-trap caption mode adds: *Looking for a tie-breaking rule on the weights. No rule on the weights alone is correct; the answer depends on the intervals.*

## Scene 8. The second table remembers the tree

*3:30 – 4:00 · objective: Record the winning root in each cell, walk the tree out of the table, and recognise when more than one tree ties for optimal.*

**3:30–3:38** — The cost table tells you how much. To get the tree itself, keep a second table of the same shape, and in each cell write down which root won.

> Caption: Keep a second table: R of i and j is the root that won that cell.

Exam-trap caption mode adds: *Recomputing the argmin at reconstruction time from the cost table. It works, but it costs the same cubic work twice, and ties can resolve differently.*

**3:38–3:45** — Read the top cell: the root is key two, that is twenty. That splits the range into one key on the left and two on the right. The left cell names key one. The right cell names key four. Then key three goes under it.

> Caption: R of 1 and 4 is 2, so 20 is the root. R of 1 and 1 is 1. R of 3 and 4 is 4.

Exam-trap caption mode adds: *Reading the root table as a whole tree at once. It must be walked range by range, starting from the top cell.*

**3:45–3:52** — Then check. Sum weight times level over the tree you just rebuilt. It must equal the number in the top cell. If it does not, you have read a wrong cell or added a wrong level.

> Caption: Recompute the cost from the rebuilt tree. It must equal the table entry, or one of the two is wrong.

Exam-trap caption mode adds: *Trusting the reconstruction without the re-add, which is the only cheap way to catch an off-by-one in the root table.*

**3:52–4:00** — One warning about ties. With weights five, forty-five, forty-five and five, both middle keys win as root. Two different trees reach the same cost of one hundred and sixty. So "the" optimal tree is not unique in general.

> Caption: Ties are real: with weights 5, 45, 45, 5 there are two optimal roots, so two optimal trees.

Exam-trap caption mode adds: *Assuming the optimal tree is unique. It is unique here on weights 4, 2, 1, 3 and it is not unique in general.*

## Scene 9. This is not Huffman, and the difference is one constraint

*4:00 – 4:30 · objective: Separate the two problems: Huffman has no ordering constraint and its greedy works; the search tree keeps the keys in order and its greedy fails.*

**4:00–4:08** — This looks like Huffman coding, and it is not. Huffman also minimises weight times depth. But Huffman may put its symbols anywhere: there is no left-to-right order to respect. That single constraint changes the problem completely.

> Caption: Huffman also minimises a weighted depth. But its tree has no ordering constraint at all.

Exam-trap caption mode adds: *Reusing the Huffman algorithm with the keys as leaves. A search tree stores keys in internal nodes, so every key must be reachable as a comparison.*

**4:08–4:15** — Huffman merges the two lightest weights repeatedly: the two fives become ten, ten and forty-five become fifty-five, and fifty-five and forty-five become the root. One heavy key ends at depth one, the other at depth two, the two fives at depth three, and the cost is one hundred and sixty-five.

> Caption: Huffman merges the two lightest weights repeatedly. On 5, 45, 45, 5 it gives a cost of 165.

Exam-trap caption mode adds: *Reading 165 against 160 as a comparison. The two numbers charge different objects, so one is not better than the other.*

**4:15–4:22** — And here is the catch. Huffman puts keys one and four together, and keys two and three together. No way of choosing left and right turns that into a search tree. It also stores its symbols at leaves, and a search tree stores keys where the comparisons happen.

> Caption: Huffman is not a search tree: it puts keys 1 and 4 in one subtree and keys 2 and 3 in the other.

Exam-trap caption mode adds: *Believing a tree with a smaller number is a better answer. Here the number is larger and the tree is invalid; both facts matter.*

**4:22–4:30** — There is an order-respecting relative of Huffman, called alphabetic coding, solved by Hu and Tucker. It is a different object again, and it is not what this question asks. Keep the three apart: Huffman, alphabetic coding, and the search tree.

> Caption: The order-respecting cousin of Huffman is alphabetic coding, and it is not what GATE asks for here.

Exam-trap caption mode adds: *Mixing up alphabetic coding with the optimal search tree because both keep an order. In alphabetic coding the symbols are leaves; here the keys are internal nodes.*

## Scene 10. Five steps, four traps

*4:30 – 5:00 · objective: Run a fixed procedure on any question in this family, and name the costs, the counts and the traps by sight.*

**4:30–4:38** — Five steps. First, check the keys are in order and every key carries a weight. Second, draw the triangle: four rows of four cells for four keys, and fill the diagonal with the weights.

> Caption: Step one: check that the keys are sorted and that every key has a weight. Step two: build the triangle.

Exam-trap caption mode adds: *Starting the table before checking that the weights line up with the keys in sorted order.*

**4:38–4:45** — Third, fill by length, shortest first. Fourth, write the winning root in a second table as you go. Both tables are the same shape, and the second one is what gives you the tree rather than just its price.

> Caption: Step three: fill by increasing length. Step four: record the winning root in every cell.

Exam-trap caption mode adds: *Filling by row. It sometimes gives the right numbers on a four-key table and is still the wrong procedure.*

**4:45–4:53** — Fifth, rebuild the tree from the root table and add up weight times level. If that does not equal the top cell, something was misread. Then report the cost, or the average if the question asks for expected comparisons.

> Caption: Step five: rebuild the tree, then re-add weight times level and check it against the top cell.

Exam-trap caption mode adds: *Reporting the cost when the question asked for the expected number of comparisons, or the other way round.*

**4:53–5:00** — And the four traps. Making the heaviest key the root. Counting levels from zero instead of one. Forgetting the range weight. And claiming the optimal tree is unique when two roots tie. Each one is defeated by a check you can do in seconds.

> Caption: The traps: greedy root, edge-depth, a missing range weight, and assuming the answer is unique.

Exam-trap caption mode adds: *Memorising a worked answer instead of the procedure. The numbers change between papers; the five steps do not.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
