# Trees, Binary Search Trees and Heaps — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/trees-bst-and-heaps/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A tree is a chain that branches

*0:00 – 0:30 · objective: Name the parts of a binary tree and read its numbers off its shape: leaves, one-child and two-child nodes, height, depth, and the three words full, complete and perfect.*

**0:00–0:07** — A binary tree is a set of nodes where each node has at most two children, and one node is the root.

> Caption: A binary tree is a set of nodes where each node has at most two children, and one node is the root.

Exam-trap caption mode adds: *A node with one child still has a left or a right child, and which one it is matters. "One child" is not a single case.*

**0:07–0:15** — Depth counts edges down from the root. Height counts edges down to the deepest leaf. The root is at depth 0.

> Caption: Depth counts edges down from the root. Height counts edges down to the deepest leaf. The root is at depth 0.

Exam-trap caption mode adds: *Some books count nodes instead of edges and call a single node height 1. Read the question; if it says "the height of a tree with a single node is 0", edges are meant.*

**0:15–0:22** — Count the nodes by how many children they have. Then the number of leaves is one more than the number of nodes with two children.

> Caption: Count the nodes by how many children they have: n0 leaves, n1 with one child, n2 with two. Then n0 = n2 + 1, always.

Exam-trap caption mode adds: *The identity is about a binary tree, not about a full one. It holds for any shape, including a single chain, where n0 = 1 and n2 = 0.*

**0:22–0:30** — Full means every node has zero or two children. Complete means every level is filled except possibly the last, which fills from the left. Perfect means both.

> Caption: Full: every node has 0 or 2 children. Complete: every level is filled except possibly the last, which fills left to right. Perfect: both at once.

Exam-trap caption mode adds: *These three words are not interchangeable, and a question that says "complete binary tree" is handing you the array indexing, not a promise about balance in the height sense.*

## Scene 2. Four walks over one tree

*0:30 – 1:00 · objective: Run preorder, inorder, postorder and level order on the same tree, then rebuild the tree from a traversal pair and say which pairs are not enough.*

**0:30–0:37** — A traversal is a fixed order of visiting the nodes. The four you need differ only in when the root is visited.

> Caption: A traversal is a fixed order of visiting the nodes. The four you need differ only in when the root is visited.

Exam-trap caption mode adds: *Each traversal is defined recursively over subtrees, not over single nodes. Writing the order as a flat list hides the recursion and makes reconstruction look like guesswork.*

**0:37–0:45** — Preorder is root first, so the first key you print is the root of the whole tree.

> Caption: Preorder is root first, so the first key you print is the root of the whole tree.

Exam-trap caption mode adds: *Preorder alone cannot rebuild a tree, because it never says where the left subtree ends. You need a second traversal that does.*

**0:45–0:52** — Inorder gives a sorted list here, and postorder ends with the root.

> Caption: Inorder gives 1, 2, 3, 4, 5, 6, 7 here, and postorder gives 1, 3, 2, 5, 7, 6, 4.

Exam-trap caption mode adds: *Inorder is sorted only for a search tree. On an arbitrary binary tree it is just one of the orders, and a question that assumes otherwise is testing exactly this confusion.*

**0:52–1:00** — Preorder plus inorder rebuilds the tree exactly. Preorder plus postorder does not, because a single child cannot be told from the other side.

> Caption: Preorder plus inorder rebuilds the tree exactly. Preorder plus postorder does not: the two-node tree is already ambiguous.

Exam-trap caption mode adds: *Inorder with any one of preorder or postorder is enough. Inorder is the one you cannot drop, because it is the only list that separates left from right.*

## Scene 3. A BST is a promise about every descendant

*1:00 – 1:30 · objective: State the search-tree property over subtrees rather than parents, use bounds to test it, and read a search path as a sequence of decisions.*

**1:00–1:07** — A binary search tree promises that every key in the left subtree is smaller than the root, and every key in the right subtree is larger.

> Caption: A binary search tree promises this: every key in the left subtree is smaller than the root, and every key in the right subtree is larger.

Exam-trap caption mode adds: *The promise is not "the left child is smaller". A tree can satisfy the parent-child version at every node and still not be a search tree.*

**1:07–1:15** — One consequence you will use constantly: the inorder traversal of a search tree is sorted.

> Caption: One consequence you will use constantly: the inorder traversal of a search tree is sorted.

Exam-trap caption mode adds: *Sorted is necessary, not sufficient, for a list to be the inorder of a particular tree. It does not tell you the shape, only that some shape exists.*

**1:15–1:23** — Here is a tree that passes the parent-child test everywhere and is still not a search tree: twelve sits in the left subtree of ten.

> Caption: Here is a tree that passes the parent-child test everywhere and is still not a search tree: 12 sits in the left subtree of 10.

Exam-trap caption mode adds: *This is the single most common wrong answer on a validity question. Carry a lower and an upper bound down the recursion instead of comparing with the parent.*

**1:23–1:30** — A search path is a sequence of left and right decisions. Read it as bounds: each step narrows the range the target may lie in.

> Caption: A search path is a sequence of left and right decisions. Read it as bounds: each step narrows the range the target may lie in.

Exam-trap caption mode adds: *Do not ask whether the sequence is sorted. Ask, key by key, whether it is consistent with the bounds the earlier keys forced.*

## Scene 4. Insertion writes the shape

*1:30 – 2:00 · objective: See insertion as a search that fails, show that the same keys in a different order give a different tree, and get the best and worst height for n nodes.*

**1:30–1:37** — Insertion is a search that fails. Walk down comparing, and hang the new key where the walk falls off the tree.

> Caption: Insertion is a search that fails. Walk down comparing, and hang the new key where the walk falls off the tree.

Exam-trap caption mode adds: *A duplicate key is usually rejected or sent to a fixed side by a tie rule. The question decides; do not invent a rule.*

**1:37–1:45** — Same six keys, two orders, two trees. The set of keys does not determine the shape; the insertion order does.

> Caption: Same six keys, two orders, two trees. The set of keys does not determine the shape; the insertion order does.

Exam-trap caption mode adds: *This is what makes GATE 2022 question about a tree built by inserting an unknown order answerable only for inorder: the set fixes the inorder, nothing else.*

**1:45–1:53** — Sorted insertion gives a chain, so search becomes a walk of n comparisons. That is the worst case.

> Caption: Sorted insertion gives a chain, so search becomes a walk: n comparisons, height n-1. That is the worst case.

Exam-trap caption mode adds: *Do not answer log n from the name "search tree". Log n is the height of a balanced tree; the promise alone gives only the height of the tree you were handed.*

**1:53–2:00** — With fifteen nodes the smallest possible height is three and the largest is fourteen. Both are reachable.

> Caption: With 15 nodes the smallest possible height is 3 and the largest is 14. Both are reachable.

Exam-trap caption mode adds: *The upper bound n-1 is not n. Off by one here is a lost mark, so fix the convention before computing.*

## Scene 5. Counting the trees

*2:00 – 2:30 · objective: Derive the Catalan recurrence by splitting at the root, and count binary trees, binary search trees and the ways to fill a given shape.*

**2:00–2:07** — To count the trees on n nodes, split at the root: if the left subtree has k minus one nodes, the right has n minus k.

> Caption: To count the trees on n nodes, split at the root: if the left subtree has k-1 nodes, the right has n-k.

Exam-trap caption mode adds: *GATE 2003 asked precisely which index fills the gap in the sum. Read the index from the total: left plus right must be n-1, so the right subtree holds n-k.*

**2:07–2:15** — The Catalan numbers are one, one, two, five, fourteen, forty-two, one hundred and thirty-two. The formula is two n choose n, divided by n plus one.

> Caption: The Catalan numbers are 1, 1, 2, 5, 14, 42, 132, 429. The formula is 2n choose n, divided by n+1.

Exam-trap caption mode adds: *T(0) = 1, the empty tree, and that base case is what makes the recurrence work. Dropping it breaks every later value.*

**2:15–2:23** — Three distinct keys give five search trees, and four keys give fourteen. The number of search trees equals the number of shapes.

> Caption: Three distinct keys give 5 search trees; four keys give 14. The number of search trees equals the number of shapes.

Exam-trap caption mode adds: *The equality needs distinct keys. With repeated keys the search property forces a tie rule, and the count changes.*

**2:23–2:30** — If the shape is given, there is only one filling. If the keys are given and the shape is free, Catalan counts.

> Caption: If the shape is given and labelled, there is only one filling. If the keys are labelled and the shape is free, Catalan counts.

Exam-trap caption mode adds: *Read whether the question fixes the shape, the labels, or both. "Unlabelled tree given" and "n distinct keys given" lead to different counts.*

## Scene 6. Deletion, and the node that replaces

*2:30 – 3:00 · objective: Delete a leaf, a one-child node and a two-child node, and see why only the inorder successor keeps every promise.*

**2:30–2:37** — Deleting a leaf is free. Deleting a node with one child splices that child into its place.

> Caption: Deleting a leaf is free. Deleting a node with one child splices that child into its place.

Exam-trap caption mode adds: *The spliced child keeps its own subtree. You are moving one subtree up, not rebuilding it.*

**2:37–2:45** — A node with two children cannot be spliced. Copy in its inorder successor, the leftmost node of its right subtree, and delete that node instead.

> Caption: A node with two children cannot be spliced. Copy in its inorder successor, the leftmost node of its right subtree, and delete that node instead.

Exam-trap caption mode adds: *The predecessor, the rightmost node of the left subtree, works equally well. What does not work is an arbitrary child: it breaks one of the two promises.*

**2:45–2:53** — Successor and predecessor are also how you answer the k-th smallest and the next key after a given one.

> Caption: Successor and predecessor are also how you answer "the k-th smallest" and "the next key after x".

Exam-trap caption mode adds: *The successor of a key is not its right child. It is the leftmost node of the right subtree, or, when there is no right subtree, the first ancestor that turns right.*

**2:53–3:00** — Every deletion case costs the height: one walk down, and at most one more walk down the successor subtree.

> Caption: Every deletion case costs the height: one walk down, and at most one more walk down the successor subtree.

Exam-trap caption mode adds: *Deletion does not rebalance. A tree can stay a legal search tree and become a chain after a run of deletions, which is why real implementations rebalance.*

## Scene 7. A heap makes a different promise

*3:00 – 3:30 · objective: Separate the two promises a heap makes, index it in an array with no pointers, and locate the maximum and the leaves without walking the tree.*

**3:00–3:07** — A heap makes two promises: the shape is complete, and every parent is no larger than its children.

> Caption: A heap makes two promises: the shape is complete, and every parent is no larger than its children.

Exam-trap caption mode adds: *A heap is not a sorted array and not a search tree. Its inorder traversal is not sorted, and searching for an arbitrary key is linear.*

**3:07–3:15** — In an array indexed from zero, the children of i are two i plus one and two i plus two, and the parent is i minus one over two, rounded down.

> Caption: In an array indexed from 0, the children of i are 2i+1 and 2i+2, and the parent is (i-1)/2 rounded down.

Exam-trap caption mode adds: *Mixing the two conventions is the commonest arithmetic slip on a heap question. Check the stated base index before writing a formula.*

**3:15–3:23** — In a min-heap the largest key must be a leaf, because any internal node has a child at least as large. So there are as many candidate positions as leaves.

> Caption: In a min-heap the largest key must be a leaf, because any internal node has a child at least as large. So there are as many candidate positions as leaves.

Exam-trap caption mode adds: *The largest being a leaf does not tell you which leaf, so finding it still costs a scan of all the leaves, which is linear.*

**3:23–3:30** — How deep can the ninth smallest key go? At most eight edges, because every ancestor must be smaller and there are only eight smaller keys.

> Caption: How deep can the 9th smallest key go? At most 8 edges, because every ancestor must be smaller and there are only 8 smaller keys.

Exam-trap caption mode adds: *The bound is about the rank of the key, not about the size of the heap. Adding more keys does not let a small key go deeper.*

## Scene 8. Sift up, sift down

*3:30 – 4:00 · objective: Insert by appending and bubbling up, remove the root by moving the last leaf up and sifting down, and count the work as the height of the tree.*

**3:30–3:37** — Insert by putting the new key at the next free position, which keeps the shape, then swapping it upward while it is smaller than its parent.

> Caption: Insert: put the new key at the next free position, which keeps the shape, then swap it upward while it is smaller than its parent.

Exam-trap caption mode adds: *Only one comparison per level is needed, against the parent. There is no choice of direction, so sift up is a single path, not a search.*

**3:37–3:45** — Remove the minimum by moving the last leaf to the root, shrinking the array, then swapping downward against the smaller child.

> Caption: Remove the minimum: move the last leaf to the root, shrink the array, then swap downward against the smaller child.

Exam-trap caption mode adds: *Swapping with the larger child looks similar and breaks the heap. Always compare both children and take the smaller.*

**3:45–3:52** — Both operations cost the height, which for a complete tree of n nodes is at most log base two of n plus one, minus one, so O of log n.

> Caption: Both operations cost the height, which for a complete tree of n nodes is at most log2(n+1) - 1, so O(log n).

Exam-trap caption mode adds: *Log n here is a guarantee, unlike log n for a search tree, which is only the best case. Say which structure you are describing.*

**3:52–4:00** — Deleting an arbitrary element is not a heap operation, but it is a fixed recipe: replace it with the last leaf, then sift up or down, whichever the comparison demands.

> Caption: Deleting an arbitrary element is not a heap operation, but it is a fixed recipe: replace it with the last leaf, then sift up or down, whichever the comparison demands.

Exam-trap caption mode adds: *You cannot tell in advance which direction is needed, so the algorithm must compare and choose. Assuming a sift down always is wrong when the replacement is smaller than the parent.*

## Scene 9. Building a heap in linear time

*4:00 – 4:30 · objective: Build bottom-up, sum the work per level to get O(n), trace a real array through it, then run heapsort and say what it costs.*

**4:00–4:07** — Building a heap by n insertions costs n log n. Building it bottom-up costs n, and the difference is not a constant factor.

> Caption: Building a heap by n insertions costs n log n. Building it bottom-up costs n, and the difference is not a constant factor.

Exam-trap caption mode adds: *The tempting argument "n/2 nodes times log n each" is the wrong bound, because most of those nodes sit in the last two levels and sift down almost no distance.*

**4:07–4:15** — Sum the work by height: about n over four nodes move one level, n over eight move two, and the total is at most two n.

> Caption: Sum the work by height: about n/4 nodes move one level, n/8 move two, and the total is at most 2n.

Exam-trap caption mode adds: *This is the one place where a sum over levels, not a worst-case per node, gives the right bound. Quote the sum, not just the conclusion.*

**4:15–4:22** — Start at the last internal node and sift down each one, working back to the root. The array becomes a heap in one pass.

> Caption: Start at the last internal node and sift down each one, working back to the root. The array becomes a heap in one pass.

Exam-trap caption mode adds: *Sifting from the root downward, in array order, does not work: a node sifted early can be broken again by a later swap above it. Bottom-up order is what makes one pass enough.*

**4:22–4:30** — Heapsort builds in n, then removes the minimum n times at log n each. That is n log n in place, and it is not stable.

> Caption: Heapsort: build in n, then remove the minimum n times at log n each. n log n in place, and not stable.

Exam-trap caption mode adds: *Heapsort is not stable, and it is not linear even on nearly sorted input, because the build and every removal behave the same way regardless of order.*

## Scene 10. Three promises, one table

*4:30 – 5:00 · objective: Put the sorted array, the search tree and the heap side by side, and fix the questions that decide which one a question is asking about.*

**4:30–4:37** — A sorted array searches in log n and inserts in n. A search tree trades those. A heap gives up search entirely.

> Caption: A sorted array searches in log n and inserts in n. A search tree trades those. A heap gives up search entirely.

Exam-trap caption mode adds: *There is no structure that is best at everything here. A question that asks for "the best" is asking you to name the operation it cares about.*

**4:37–4:44** — Find the minimum in constant time with a heap. Find an arbitrary key with a search tree or a hash table. Report keys in order with a search tree.

> Caption: Find the minimum in constant time: a heap. Find an arbitrary key: a search tree or a hash table. Report keys in order: a search tree.

Exam-trap caption mode adds: *A heap cannot answer "is x present" in log n, and a search tree cannot answer "minimum" in constant time. Swapping them is the classic wrong option.*

**4:44–4:52** — Four questions decide almost every tree question: which promise is stated, is the shape fixed, is the order fixed, and which base index is in force.

> Caption: Four questions decide almost every tree question: which promise is stated, is the shape fixed, is the order fixed, and which base index is in force.

Exam-trap caption mode adds: *The fourth one is the quiet killer: 0-indexed against 1-indexed changes every heap formula, and examiners switch between them.*

**4:52–5:00** — Next come balanced trees, then graphs. The pointer surgery from the linked-list lesson is the same surgery a rotation uses.

> Caption: Next: balanced trees, then graphs. The pointer surgery from the linked-list lesson is the same surgery a rotation uses.

Exam-trap caption mode adds: *Balancing does not change the search promise. If a rotation ever changed the inorder order, it would have destroyed the structure it was meant to protect.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
