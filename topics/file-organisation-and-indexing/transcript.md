# File Organisation And Indexing — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/file-organisation-and-indexing/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Why a database keeps a tree beside its data

*0:00 – 0:30 · objective: Turn "the file is on disk" into a cost: one block read per level, and see the ratio an index buys.*

**0:00–0:07** — A table is not a list you can walk cheaply. It is a set of fixed-size blocks, and every block you need is a separate read from the disk. So the only cost that matters is how many blocks a query touches.

> Caption: A database file lives on disk in blocks. One block is one disk read, and a disk read is thousands of times slower than a memory read.

**0:07–0:15** — An unordered file gives no shortcut. You read block after block until the record shows up, so the expected cost is half the file. Ten thousand blocks, five thousand reads, for one row.

> Caption: Without an index, finding one record means reading blocks until it appears. On average that is half the file: five thousand block reads here.

Exam-trap caption mode adds: *The worst case is the whole file, not half. GATE asks for the average when it says "on average", and for the worst case otherwise. Read which one is being asked.*

**0:15–0:22** — The index stores the search key and the address of the record, sorted, and it is small because it holds no other column. Because it is sorted, one descent through its levels finds any key.

> Caption: An index is a second, much smaller file: sorted (key, block pointer) entries, organised as a tree whose nodes are blocks too.

**0:22–0:30** — Three levels of index, one read each, then the record itself. Four reads against five thousand. Every later question in this lesson is a variation on that single comparison.

> Caption: Three index blocks plus the one record block: four reads instead of five thousand. That ratio is the whole reason this topic exists.

Exam-trap caption mode adds: *The record block is a fourth read and candidates forget it. GATE 2020 keyed four, not three, for exactly this reason.*

## Scene 2. File organisation, and the four adjectives an index can carry

*0:30 – 1:00 · objective: Separate heap, sorted and hashed files, then place dense, sparse, clustered and unclustered indexes on the right axis.*

**0:30–0:37** — File organisation is the placement of records. A heap file puts each new record in any block with room, so inserts are cheap and every search is a scan. There is no order to exploit.

> Caption: How records are laid out is a separate decision from how they are indexed. Heap: append anywhere, search by scanning.

**0:37–0:45** — Dense means an entry for every record. Sparse means an entry for some records, and here "some" means one per block, because the file is sorted and a block holds a contiguous key range. Sparse is smaller, but it needs the file to be ordered on the key.

> Caption: A sorted file allows a sparse index: one entry per block, pointing at that block's first key. A heap file needs a dense index: one entry per record.

Exam-trap caption mode adds: *A sparse index is only possible on a sorted file. Drawing a sparse index over a heap file is the standard wrong answer.*

**0:45–0:52** — Clustered is the same idea as primary. Because the file order matches the key order, a range query reads consecutive blocks. Unclustered, or secondary, has the records scattered, so a thousand matches can cost a thousand reads.

> Caption: Clustered: the file is sorted on the index key, so matching records sit in neighbouring blocks. Unclustered: each match can be on any block.

Exam-trap caption mode adds: *Clustered and dense are different axes. An index can be clustered and sparse, or unclustered and dense. GATE 2015 asked only for the word "clustered".*

**0:52–1:00** — One index level may still be too big to search cheaply, so you build an index over the index. Each additional level multiplies the fan-out, which is how a million records end up three levels deep. The top level is small enough to be cached, so the descent starts in memory.

> Caption: The index is a file too, so it can be indexed. That is a multilevel index, and its top level is usually small enough to stay in memory.

## Scene 3. The B-tree: order, occupancy, and where the records live

*1:00 – 1:30 · objective: Read a B-tree node as p child pointers and p-1 keys, each key carrying a record pointer, with every leaf at the same depth.*

**1:00–1:07** — Order counts children, not keys. A node of order p has at most p child pointers and therefore at most p minus one keys, and in a B-tree every one of those keys points at a record.

> Caption: The order p is the maximum number of children a node may have. Such a node holds p-1 keys and p pointers, and each key carries a record pointer.

Exam-trap caption mode adds: *Order p means at most p-1 keys, never p keys. GATE 2005 asked for the maximum keys in a node of order five, and the answer is four.*

**1:07–1:15** — This is the structural difference to hold on to. The B-tree stores the record pointer beside the key wherever the key lives, including in the root. A successful search may therefore end early, without reaching a leaf.

> Caption: In a B-tree each key appears exactly once in the whole tree, so a search can stop at an internal node — the record is right there.

**1:15–1:22** — Balanced is not "within one of each other", and it is not about the number of records per leaf. It means every path from the root to a leaf has exactly the same length, which is why the worst-case search cost is the height.

> Caption: Every leaf is at the same depth. That is what "balanced" means, and it is the answer GATE 2016 Set 2 keys: equal root-to-leaf path lengths.

Exam-trap caption mode adds: *Options that say paths differ by at most one, or that sibling nodes have similar child counts, are the decoys. Equal, not nearly equal.*

**1:22–1:30** — Half-full is the rule, with two adjustments. Round the children up, then subtract one for the key. And the root is exempt, because a tree with two levels has a root holding a single key.

> Caption: Occupancy: every node except the root holds between ceil(p/2)-1 and p-1 keys. The root is exempt, and may hold as little as one key.

Exam-trap caption mode adds: *GATE 2010 gave maximum keys five, so order six, so minimum children three, so minimum keys two. Answering three is the classic slip: it is the child count, not the key count.*

## Scene 4. The B+ tree: separators above, every record below

*1:30 – 2:00 · objective: State the copy-up rule, place every key at the leaf level, and connect the leaves into the chain a range scan walks.*

**1:30–1:37** — An internal node in a B+ tree stores keys and child pointers and nothing else. No record addresses, no data. That is the entire design change, and everything else about the structure follows from it.

> Caption: The B+ tree moves every record pointer down to the leaves. Internal nodes keep only separators, so they hold more keys per block.

**1:37–1:45** — The key stored in the parent is a copy, not a move. It equals the smallest key of the child to its right, so the search rule is simple: if your key is at least the separator, go right.

> Caption: A separator equals the smallest key in the subtree to its right. This is the copy-up rule GATE 2025 Set 2 states outright.

Exam-trap caption mode adds: *Two conventions exist in textbooks: separator equals the minimum of the right child, or the maximum of the left. A question that draws the tree has already fixed the convention; read the figure, do not impose one.*

**1:45–1:52** — This is the reason databases chose the B+ tree. Once you are at the first leaf in range, the answer is the next leaf, then the next, with no return to the root. A B-tree has no such chain and must re-descend for each successor.

> Caption: The leaves are chained left to right, in key order. A range scan is one descent plus a walk along that chain.

**1:52–2:00** — Because no record pointer sits above the leaf level, no search can end early. Every search reaches a leaf, so every search costs the same number of block reads, which is the height. And separators are duplicates, so the key count in the tree exceeds the number of records.

> Caption: So every successful search costs exactly the height, leaves included, and a key may appear twice: once in a leaf, once as a separator above it.

Exam-trap caption mode adds: *Counting distinct keys in a B+ tree as "keys in leaves plus keys above" double-counts the separators. The number of records is the number of leaf entries.*

## Scene 5. Order is arithmetic: the block equation

*2:00 – 2:30 · objective: Derive the internal-node and leaf-node capacities from a block size, and round down — the four verified numbers.*

**2:00–2:07** — Every order question is one inequality. The bytes a full node needs must not exceed the block. Write that down and the answer is arithmetic, not memory.

> Caption: Order is not chosen, it is solved. A node must fit in one block: p child pointers plus p-1 keys, each of known size.

**2:07–2:15** — Twenty p minus twelve is at most one thousand and twenty-four, so p is at most fifty-one point eight, and p must be a whole number, so fifty-one. The question asks for keys, so subtract one: fifty.

> Caption: GATE 2015 Set 3: block 1024, key 12, pointer 8. So 8p + 12(p-1) is at most 1024, giving p at most 51, so at most 50 keys.

Exam-trap caption mode adds: *The record pointer size, ten bytes, is a decoy here. Non-leaf nodes in a B+ tree hold no record pointers. Including it gives the wrong inequality.*

**2:15–2:22** — The leaf equation has a different shape. Each entry costs the key plus the record pointer, and there is exactly one extra pointer, the link to the next leaf. Ten twenty-four minus six is one thousand and eighteen, over sixteen, is sixty-three point six, so sixty-three.

> Caption: A leaf holds (key, record pointer) pairs plus one pointer to the next leaf. GATE 2007: 16n + 6 is at most 1024, so n is 63.

Exam-trap caption mode adds: *Forgetting the single next-leaf pointer gives 64. That is option B in the original paper, and it is wrong for exactly one pointer.*

**2:22–2:30** — Fan-out first, then levels. Four thousand and ninety-six plus twelve, over twenty, is two hundred and five. The leaf holds two hundred and four. One million over two hundred and four is four thousand nine hundred and two leaves, which fit under twenty-four internal nodes, under one root. Three levels, plus the record: four reads.

> Caption: GATE 2020: order 205, leaf capacity 204, one million records, so three levels, so three index reads plus one for the record: four.

Exam-trap caption mode adds: *Always round the order down. Rounding to nearest, or up, produces an option that is present but wrong.*

## Scene 6. Insertion: fill, split, copy up, and the one way the tree grows taller

*2:30 – 3:00 · objective: Run nine insertions on a tree with room for three keys and watch three splits and one root split.*

**2:30–2:37** — The order is four, so at most three keys per node. We insert ten, twenty, thirty, and the fourth key forty makes the leaf overflow. Everything that follows is repair.

> Caption: Insertion begins with one descent to the leaf that owns the key. Here the tree allows at most three keys per node, so a fourth forces a split.

**2:37–2:45** — Two keys left, two keys right, and the smallest key of the right half is copied into the parent as the separator. The key is copied, not moved, so it now exists in two places.

> Caption: The overflowed leaf splits into two halves, and the smallest key of the new right leaf is copied up into the parent.

Exam-trap caption mode adds: *The separator is the smallest key of the right node. Using the largest key of the left node instead gives a tree that still searches correctly but is not the one the figure shows.*

**2:45–2:52** — The repair is the same rule at every level, which is why the algorithm is short. Insert the separator, and if the parent is now over-full, split it and copy a separator to its parent. Three splits for these nine keys.

> Caption: The parent can now overflow too, and repairs the same way one level up. Nine keys, three splits in this run.

**2:52–3:00** — When the root itself splits, a new root is created above it holding one key and two children. The height therefore increases by exactly one, and only here. This is why all leaves stay at the same depth however the keys arrive.

> Caption: A split at the root creates a new root. That is the only way a B+ tree grows taller, so the height rises by one and never by more.

Exam-trap caption mode adds: *The height never grows by two in one insertion, and a split in the middle of the tree never changes the height. Only a root split does.*

## Scene 7. Deletion: borrow from a sibling, or merge and cascade

*3:00 – 3:30 · objective: Repair underflow in the right order — borrow first, merge second — and see the only way the tree gets shorter.*

**3:00–3:07** — Deletion starts like insertion: find the leaf and remove the entry. With the minimum at one key for this tree, most deletions stop here. The separator above may now be stale, so it is refreshed to the leaf's new smallest key.

> Caption: Deletion removes the key from its leaf. If the leaf still holds at least the minimum number of keys, nothing else changes.

**3:07–3:15** — If the leaf drops below the minimum, look at its neighbour. If that neighbour is above the minimum, move one entry across. The tree keeps its shape and the total number of nodes is unchanged.

> Caption: Underflow means fewer keys than the minimum. The first repair is to borrow from an adjacent sibling that has a key to spare.

Exam-trap caption mode adds: *Borrowing changes the separator above the sibling, not just the one above the emptied node. Both must be refreshed.*

**3:15–3:22** — When nobody can spare a key, the two nodes become one. That removes a child from the parent, and the parent loses the separator that pointed between them. One fewer node, one fewer separator.

> Caption: If both siblings are already at the minimum, borrow is impossible. Merge the two nodes into one and drop the separator that divided them.

**3:22–3:30** — The cascade is why deletion is harder to trace than insertion. If the root loses its last key, it is discarded and its single child becomes the new root, which is the only way the height decreases.

> Caption: A merge can make the parent underfull, so the repair cascades upward. If the root ends with no keys, its only child becomes the root.

Exam-trap caption mode adds: *The root is allowed to hold one key and two children. Do not "repair" a root that looks too empty; only a root with no keys at all is contracted.*

## Scene 8. Counting what a query costs

*3:30 – 4:00 · objective: Count nodes fetched, not keys compared, on the GATE 2015 Set 2 index: five nodes for the range [7, 15).*

**3:30–3:37** — Every level is one block read, and the height is the same for every key because the tree is balanced. So a point query costs the height, which is why the fan-out matters so much.

> Caption: A point query fetches one node per level, so its cost is exactly the height. The comparison is in block reads, never in key comparisons.

**3:37–3:45** — The first leaf is reached by a descent. Every leaf after that is one more read, taken from the chain rather than from the root. So the cost is the height plus the number of extra leaves.

> Caption: A range query costs the descent plus one extra read for each additional leaf it must visit. The chain turns a range into a walk.

**3:45–3:52** — Seven is less than the root separator nine, so we go left. Seven is at least five, so we go right to the leaf holding five and seven. Then the chain gives nine and eleven, then thirteen and fifteen. Five nodes in total.

> Caption: GATE 2015 Set 2: for keys from 7 up to but not including 15, the model fetches five nodes — root, one internal node, and three leaves.

Exam-trap caption mode adds: *Counting the descent as one read rather than three loses the internal levels. Counting only the leaves gives three.*

**3:52–4:00** — The upper bound is open, so thirteen qualifies and fifteen does not. The leaf containing both must still be read, because it holds thirteen. Four would be right only if the range ended at twelve.

> Caption: Fifteen is excluded, so the last leaf is still needed for thirteen. The bound is on nodes fetched, which is why the answer is five and not four.

Exam-trap caption mode adds: *Whether the upper bound is inclusive changes the answer. Read "less than" and "at most" as different words, because they are.*

## Scene 9. Why databases chose the B+ tree over the B-tree

*4:00 – 4:30 · objective: Compare the two on the same nine keys: three levels against two, nine key copies against twelve, and a chain against a traversal.*

**4:00–4:07** — Insert the same nine keys into a B-tree and into a B+ tree with the same minimum degree. The B-tree is three levels deep, the B+ tree two. Nothing about the keys caused that; the node contents did.

> Caption: Same nine keys, same minimum degree: the B-tree needs three levels and the B+ tree needs two. The model builds both and measures.

**4:07–4:15** — A B-tree internal node holds p minus one keys and p minus one record pointers and p child pointers. A B+ tree internal node holds no record pointers at all. For the same block, the B+ node holds more keys, so it has more children, so it is shorter.

> Caption: The B-tree spends block space on record pointers in every node. The B+ tree spends it on keys, so more keys fit, so the fan-out is larger.

**4:15–4:22** — Duplication is the cost of the B+ tree, and it is small because only keys are duplicated, never records. The B-tree avoids the duplication and pays for it with a shorter fan-out and no leaf chain.

> Caption: The B+ tree stores nine keys as twelve copies: nine in the leaves and three separators. The B-tree stores nine, once each. That is the price.

Exam-trap caption mode adds: *Counting separators as records inflates the record count. The number of records equals the number of leaf entries.*

**4:22–4:30** — Real queries ask for ranges far more often than for single keys. The leaf chain makes a range scan sequential, which the disk likes. That is why the B+ tree is what a database actually builds, and why the syllabus writes them in that order.

> Caption: A full scan of a B+ tree is a walk along the leaf chain. In a B-tree it is a traversal. Range queries decided the choice.

## Scene 10. The five-step procedure these questions actually reward

*4:30 – 5:00 · objective: Fix an order of operations for every order, occupancy, cost and node-count question in this area.*

**4:30–4:37** — Before computing anything, ask what sits in the node being sized. An internal node of a B+ tree holds keys and child pointers. A leaf holds key and record pointer pairs plus one chain pointer. A B-tree node adds record pointers at every level.

> Caption: Step one: decide which node the question is about, then write that node's byte equation. Internal and leaf equations have different shapes.

Exam-trap caption mode adds: *Using the leaf equation for an internal node, or including record pointers in a B+ internal node, are the two errors that cost these marks.*

**4:37–4:45** — The solution is always a floor, because a node that does not fit is not a node. Then read the question again: does it want pointers, keys, or entries? Those are three different numbers.

> Caption: Step two: solve the inequality and round down. The largest integer that fits is the order, and the key count is one less.

**4:45–4:52** — Occupancy questions are pure arithmetic on the order, with the root exempted. Compute the children first, then subtract one. GATE 2010 is exactly this computation with maximum keys five.

> Caption: Step three, for occupancy: order is maximum keys plus one, and the minimum for a non-root node is ceil(order/2) minus one. The root is exempt.

**4:52–5:00** — Cost questions want the number of block reads: build the fan-out, count the levels, add one for the record. Figure questions want the nodes fetched: the descent to the first leaf, then each additional leaf the range touches. Both are counts of blocks, never of comparisons.

> Caption: Steps four and five: for cost, fan-out, then levels, then the record block. For a drawn tree, count the descent plus the leaves scanned.

Exam-trap caption mode adds: *The most common lost mark is forgetting the final record block. The second most common is treating an open bound as closed.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
