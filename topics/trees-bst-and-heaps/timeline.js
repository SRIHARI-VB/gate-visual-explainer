/* ==========================================================================
   trees-bst-and-heaps — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs — never edited by hand.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'shape',
      n: 1,
      title: 'A tree is a chain that branches',
      start: 0, end: 30,
      objective: 'Name the parts of a binary tree and read its numbers off its shape: leaves, one-child and two-child nodes, height, depth, and the three words full, complete and perfect.'
    },
    {
      id: 'walks',
      n: 2,
      title: 'Four walks over one tree',
      start: 30, end: 60,
      objective: 'Run preorder, inorder, postorder and level order on the same tree, then rebuild the tree from a traversal pair and say which pairs are not enough.'
    },
    {
      id: 'promise',
      n: 3,
      title: 'A BST is a promise about every descendant',
      start: 60, end: 90,
      objective: 'State the search-tree property over subtrees rather than parents, use bounds to test it, and read a search path as a sequence of decisions.'
    },
    {
      id: 'insert',
      n: 4,
      title: 'Insertion writes the shape',
      start: 90, end: 120,
      objective: 'See insertion as a search that fails, show that the same keys in a different order give a different tree, and get the best and worst height for n nodes.'
    },
    {
      id: 'count',
      n: 5,
      title: 'Counting the trees',
      start: 120, end: 150,
      objective: 'Derive the Catalan recurrence by splitting at the root, and count binary trees, binary search trees and the ways to fill a given shape.'
    },
    {
      id: 'delete',
      n: 6,
      title: 'Deletion, and the node that replaces',
      start: 150, end: 180,
      objective: 'Delete a leaf, a one-child node and a two-child node, and see why only the inorder successor keeps every promise.'
    },
    {
      id: 'heap',
      n: 7,
      title: 'A heap makes a different promise',
      start: 180, end: 210,
      objective: 'Separate the two promises a heap makes, index it in an array with no pointers, and locate the maximum and the leaves without walking the tree.'
    },
    {
      id: 'sift',
      n: 8,
      title: 'Sift up, sift down',
      start: 210, end: 240,
      objective: 'Insert by appending and bubbling up, remove the root by moving the last leaf up and sifting down, and count the work as the height of the tree.'
    },
    {
      id: 'build',
      n: 9,
      title: 'Building a heap in linear time',
      start: 240, end: 270,
      objective: 'Build bottom-up, sum the work per level to get O(n), trace a real array through it, then run heapsort and say what it costs.'
    },
    {
      id: 'table',
      n: 10,
      title: 'Three promises, one table',
      start: 270, end: 300,
      objective: 'Put the sorted array, the search tree and the heap side by side, and fix the questions that decide which one a question is asking about.'
    }
  ],

  events: [

    /* ---- scene 1: shape ---- */
    {
      id: 'shp-1', start: 0, end: 7, scene: 'shape',
      caption: 'A binary tree is a set of nodes where each node has at most two children, and one node is the root.',
      detail: 'The two children are ordered: the left child and the right child are different positions even when they hold the same kind of value. That ordering is what makes the shapes countable later, and what makes a search tree possible at all.',
      keyword: 'at most two children',
      trap: 'A node with one child still has a left or a right child, and which one it is matters. "One child" is not a single case.',
      narration: 'A binary tree is a set of nodes where each node has at most two children, and one node is the root.'
    },
    {
      id: 'shp-2', start: 7, end: 15, scene: 'shape',
      caption: 'Depth counts edges down from the root. Height counts edges down to the deepest leaf. The root is at depth 0.',
      detail: 'Depth is a property of one node; height is a property of the tree, or of a subtree if you name its root. A tree of one node has height 0 under this convention, which is the convention GATE states whenever the answer depends on it.',
      keyword: 'The root is at depth 0',
      trap: 'Some books count nodes instead of edges and call a single node height 1. Read the question; if it says "the height of a tree with a single node is 0", edges are meant.',
      narration: 'Depth counts edges down from the root. Height counts edges down to the deepest leaf. The root is at depth 0.'
    },
    {
      id: 'shp-3', start: 15, end: 22, scene: 'shape',
      caption: 'Count the nodes by how many children they have: n0 leaves, n1 with one child, n2 with two. Then n0 = n2 + 1, always.',
      detail: 'Count the edges from the other side. Every node except the root is reached by exactly one edge, so the number of edges is n0 + n1 + n2 - 1. Every edge leaves either a one-child node or a two-child node, so the number of edges is also n1 + 2 n2. Setting the two equal gives n0 = n2 + 1.',
      keyword: 'n0 = n2 + 1',
      trap: 'The identity is about a binary tree, not about a full one. It holds for any shape, including a single chain, where n0 = 1 and n2 = 0.',
      narration: 'Count the nodes by how many children they have. Then the number of leaves is one more than the number of nodes with two children.'
    },
    {
      id: 'shp-4', start: 22, end: 30, scene: 'shape',
      caption: 'Full: every node has 0 or 2 children. Complete: every level is filled except possibly the last, which fills left to right. Perfect: both at once.',
      detail: 'A complete tree is the shape an array can hold without wasting a slot, which is why a heap is complete. A perfect tree of height h has exactly 2^(h+1) - 1 nodes. A full tree need not be complete, and a complete tree with a half-filled last level is not full.',
      keyword: 'Complete fills left to right',
      trap: 'These three words are not interchangeable, and a question that says "complete binary tree" is handing you the array indexing, not a promise about balance in the height sense.',
      narration: 'Full means every node has zero or two children. Complete means every level is filled except possibly the last, which fills from the left. Perfect means both.'
    },

    /* ---- scene 2: walks ---- */
    {
      id: 'wlk-1', start: 30, end: 37, scene: 'walks',
      caption: 'A traversal is a fixed order of visiting the nodes. The four you need differ only in when the root is visited.',
      detail: 'Preorder visits the root, then the left subtree, then the right. Inorder visits the left subtree, then the root, then the right. Postorder visits both subtrees, then the root. Level order visits by depth, left to right, and needs a queue rather than a stack.',
      keyword: 'when the root is visited',
      trap: 'Each traversal is defined recursively over subtrees, not over single nodes. Writing the order as a flat list hides the recursion and makes reconstruction look like guesswork.',
      narration: 'A traversal is a fixed order of visiting the nodes. The four you need differ only in when the root is visited.'
    },
    {
      id: 'wlk-2', start: 37, end: 45, scene: 'walks',
      caption: 'Preorder is root first, so the first key you print is the root of the whole tree.',
      detail: 'On the seven-node tree in the picture, preorder gives 4, 2, 1, 3, 6, 5, 7. The recursion shows why: 4 is printed, then the whole left subtree 2, 1, 3 is printed, then the whole right subtree 6, 5, 7.',
      keyword: 'the first key is the root',
      trap: 'Preorder alone cannot rebuild a tree, because it never says where the left subtree ends. You need a second traversal that does.',
      narration: 'Preorder is root first, so the first key you print is the root of the whole tree.'
    },
    {
      id: 'wlk-3', start: 45, end: 52, scene: 'walks',
      caption: 'Inorder gives 1, 2, 3, 4, 5, 6, 7 here, and postorder gives 1, 3, 2, 5, 7, 6, 4.',
      detail: 'Inorder printed a sorted list because this tree happens to be a search tree. That is not a property of inorder; it is a property of the tree. Postorder always ends with the root, which is the mirror of preorder starting with it.',
      keyword: 'postorder always ends with the root',
      trap: 'Inorder is sorted only for a search tree. On an arbitrary binary tree it is just one of the orders, and a question that assumes otherwise is testing exactly this confusion.',
      narration: 'Inorder gives a sorted list here, and postorder ends with the root.'
    },
    {
      id: 'wlk-4', start: 52, end: 60, scene: 'walks',
      caption: 'Preorder plus inorder rebuilds the tree exactly. Preorder plus postorder does not: the two-node tree is already ambiguous.',
      detail: 'The root comes from the front of the preorder. Find it in the inorder and the list splits into the left and right subtrees, whose sizes then cut the preorder. With only preorder and postorder there is no separator, so a single child cannot be told from the other side, and two different trees share both lists.',
      keyword: 'Preorder plus postorder does not',
      trap: 'Inorder with any one of preorder or postorder is enough. Inorder is the one you cannot drop, because it is the only list that separates left from right.',
      narration: 'Preorder plus inorder rebuilds the tree exactly. Preorder plus postorder does not, because a single child cannot be told from the other side.'
    },

    /* ---- scene 3: promise ---- */
    {
      id: 'prm-1', start: 60, end: 67, scene: 'promise',
      caption: 'A binary search tree promises this: every key in the left subtree is smaller than the root, and every key in the right subtree is larger.',
      detail: 'The promise is about whole subtrees, and it is inherited at every node. So a key is placed not only by comparing it with its parent, but by being inside the range its ancestors allow.',
      keyword: 'every key in the left subtree',
      trap: 'The promise is not "the left child is smaller". A tree can satisfy the parent-child version at every node and still not be a search tree.',
      narration: 'A binary search tree promises that every key in the left subtree is smaller than the root, and every key in the right subtree is larger.'
    },
    {
      id: 'prm-2', start: 67, end: 75, scene: 'promise',
      caption: 'One consequence you will use constantly: the inorder traversal of a search tree is sorted.',
      detail: 'Inorder visits the left subtree, then the root, then the right. If everything on the left is smaller and everything on the right is larger, the printed list is increasing. That is why a sorted list is a necessary condition for being an inorder sequence of some search tree.',
      keyword: 'the inorder traversal is sorted',
      trap: 'Sorted is necessary, not sufficient, for a list to be the inorder of a particular tree. It does not tell you the shape, only that some shape exists.',
      narration: 'One consequence you will use constantly: the inorder traversal of a search tree is sorted.'
    },
    {
      id: 'prm-3', start: 75, end: 83, scene: 'promise',
      caption: 'Here is a tree that passes the parent-child test everywhere and is still not a search tree: 12 sits in the left subtree of 10.',
      detail: 'At every node, the left child is smaller and the right child is larger: 5 is left of 10, 12 is right of 5. Yet 12 is greater than 10 while standing in 10 left subtree, so a search for 12 would go left at the root and never find it. The bounds test rejects it, and the inorder list 5, 12, 10 is not sorted.',
      keyword: 'still not a search tree',
      trap: 'This is the single most common wrong answer on a validity question. Carry a lower and an upper bound down the recursion instead of comparing with the parent.',
      narration: 'Here is a tree that passes the parent-child test everywhere and is still not a search tree: twelve sits in the left subtree of ten.'
    },
    {
      id: 'prm-4', start: 83, end: 90, scene: 'promise',
      caption: 'A search path is a sequence of left and right decisions. Read it as bounds: each step narrows the range the target may lie in.',
      detail: 'GATE 2008 gave four sequences and asked which could be the nodes examined while searching for 273 in a search tree holding 37 to 573. Going left sets an upper bound, going right sets a lower bound, and any key that breaks the bounds already set cannot have been examined. Only one of the four survives.',
      keyword: 'each step narrows the range',
      trap: 'Do not ask whether the sequence is sorted. Ask, key by key, whether it is consistent with the bounds the earlier keys forced.',
      narration: 'A search path is a sequence of left and right decisions. Read it as bounds: each step narrows the range the target may lie in.'
    },

    /* ---- scene 4: insert ---- */
    {
      id: 'ins-1', start: 90, end: 97, scene: 'insert',
      caption: 'Insertion is a search that fails. Walk down comparing, and hang the new key where the walk falls off the tree.',
      detail: 'The new key always becomes a leaf. That is why insertion costs one root-to-leaf walk, and why the shape is decided entirely by the order the keys arrive in.',
      keyword: 'a search that fails',
      trap: 'A duplicate key is usually rejected or sent to a fixed side by a tie rule. The question decides; do not invent a rule.',
      narration: 'Insertion is a search that fails. Walk down comparing, and hang the new key where the walk falls off the tree.'
    },
    {
      id: 'ins-2', start: 97, end: 105, scene: 'insert',
      caption: 'Same six keys, two orders, two trees. The set of keys does not determine the shape; the insertion order does.',
      detail: 'Inserting 4, 2, 6, 1, 3, 5 gives a balanced tree of height 2. Inserting the same keys as 1, 2, 3, 4, 5, 6 gives a chain of height 5. The inorder list is identical in both, which is why a question that gives only the key set can ask about traversals but not about shape.',
      keyword: 'the insertion order does',
      trap: 'This is what makes GATE 2022 question about a tree built by inserting an unknown order answerable only for inorder: the set fixes the inorder, nothing else.',
      narration: 'Same six keys, two orders, two trees. The set of keys does not determine the shape; the insertion order does.'
    },
    {
      id: 'ins-3', start: 105, end: 113, scene: 'insert',
      caption: 'Sorted insertion gives a chain, so search becomes a walk: n comparisons, height n-1. That is the worst case.',
      detail: 'Search, insert and delete all cost one root-to-leaf walk, so their cost is the height. The best height is about log2 of the node count, the worst is n-1, and nothing in the search-tree promise prevents the worst case. That is the whole reason balanced trees exist.',
      keyword: 'Sorted insertion gives a chain',
      trap: 'Do not answer log n from the name "search tree". Log n is the height of a balanced tree; the promise alone gives only the height of the tree you were handed.',
      narration: 'Sorted insertion gives a chain, so search becomes a walk of n comparisons. That is the worst case.'
    },
    {
      id: 'ins-4', start: 113, end: 120, scene: 'insert',
      caption: 'With 15 nodes the smallest possible height is 3 and the largest is 14. Both are reachable.',
      detail: 'A tree of height h holds at most 2^(h+1) - 1 nodes, so 15 nodes need h at least 3, and a perfect tree of height 3 achieves it. The largest height comes from a chain, where each node has exactly one child, giving n-1. GATE 2016 Set 2 asked exactly this pair.',
      keyword: 'smallest is 3 and largest is 14',
      trap: 'The upper bound n-1 is not n. Off by one here is a lost mark, so fix the convention before computing.',
      narration: 'With fifteen nodes the smallest possible height is three and the largest is fourteen. Both are reachable.'
    },

    /* ---- scene 5: count ---- */
    {
      id: 'cnt-1', start: 120, end: 127, scene: 'count',
      caption: 'To count the trees on n nodes, split at the root: if the left subtree has k-1 nodes, the right has n-k.',
      detail: 'Every tree has exactly one root, and once you choose how many nodes go left, the two subtrees are independent. So the count T(n) is the sum over k of T(k-1) times T(n-k). The answer to that recurrence is the Catalan number, which this page also meets in the counting lesson.',
      keyword: 'split at the root',
      trap: 'GATE 2003 asked precisely which index fills the gap in the sum. Read the index from the total: left plus right must be n-1, so the right subtree holds n-k.',
      narration: 'To count the trees on n nodes, split at the root: if the left subtree has k minus one nodes, the right has n minus k.'
    },
    {
      id: 'cnt-2', start: 127, end: 135, scene: 'count',
      caption: 'The Catalan numbers are 1, 1, 2, 5, 14, 42, 132, 429. The formula is 2n choose n, divided by n+1.',
      detail: 'The first few values are worth memorising because GATE asks small cases: 5 shapes on 3 nodes, 14 on 4 nodes, 42 on 5 nodes. The page counts them by enumeration as well as by formula and gets the same answers.',
      keyword: '2n choose n, divided by n+1',
      trap: 'T(0) = 1, the empty tree, and that base case is what makes the recurrence work. Dropping it breaks every later value.',
      narration: 'The Catalan numbers are one, one, two, five, fourteen, forty-two, one hundred and thirty-two. The formula is two n choose n, divided by n plus one.'
    },
    {
      id: 'cnt-3', start: 135, end: 143, scene: 'count',
      caption: 'Three distinct keys give 5 search trees; four keys give 14. The number of search trees equals the number of shapes.',
      detail: 'Fix a shape on n nodes. There is exactly one way to put n sorted distinct keys into it and keep the search property: fill the nodes in inorder with the keys in order. So counting search trees is counting shapes, which is why the same Catalan number answers both. GATE 2008 asked the three-key case and GATE 2005 the four-key case.',
      keyword: 'equals the number of shapes',
      trap: 'The equality needs distinct keys. With repeated keys the search property forces a tie rule, and the count changes.',
      narration: 'Three distinct keys give five search trees, and four keys give fourteen. The number of search trees equals the number of shapes.'
    },
    {
      id: 'cnt-4', start: 143, end: 150, scene: 'count',
      caption: 'If the shape is given and labelled, there is only one filling. If the keys are labelled and the shape is free, Catalan counts.',
      detail: 'GATE 2011 gave an unlabelled tree with n nodes and a set of n distinct elements and asked how many ways populate it as a search tree. The answer is one: the inorder walk of the shape dictates where each key goes. Distinguish that from counting labelled binary trees, where the shapes are counted first and then the labels arranged.',
      keyword: 'there is only one filling',
      trap: 'Read whether the question fixes the shape, the labels, or both. "Unlabelled tree given" and "n distinct keys given" lead to different counts.',
      narration: 'If the shape is given, there is only one filling. If the keys are given and the shape is free, Catalan counts.'
    },

    /* ---- scene 6: delete ---- */
    {
      id: 'del-1', start: 150, end: 157, scene: 'delete',
      caption: 'Deleting a leaf is free. Deleting a node with one child splices that child into its place.',
      detail: 'Both cases are one pointer write once you have the node, because the rest of the tree never learns about the change. The walk to find the node is the only cost, and that is the height.',
      keyword: 'splices that child into its place',
      trap: 'The spliced child keeps its own subtree. You are moving one subtree up, not rebuilding it.',
      narration: 'Deleting a leaf is free. Deleting a node with one child splices that child into its place.'
    },
    {
      id: 'del-2', start: 157, end: 165, scene: 'delete',
      caption: 'A node with two children cannot be spliced. Copy in its inorder successor, the leftmost node of its right subtree, and delete that node instead.',
      detail: 'The successor is the smallest key larger than the one being removed, so it is larger than everything in the left subtree and smaller than everything else in the right subtree. Putting it in the vacated position keeps both promises. The node it came from has no left child, so removing it is the easy one-child case.',
      keyword: 'the leftmost node of its right subtree',
      trap: 'The predecessor, the rightmost node of the left subtree, works equally well. What does not work is an arbitrary child: it breaks one of the two promises.',
      narration: 'A node with two children cannot be spliced. Copy in its inorder successor, the leftmost node of its right subtree, and delete that node instead.'
    },
    {
      id: 'del-3', start: 165, end: 173, scene: 'delete',
      caption: 'Successor and predecessor are also how you answer "the k-th smallest" and "the next key after x".',
      detail: 'The inorder position of a key is the number of keys smaller than it. Walking to a key and then stepping to its successor visits the keys in sorted order without ever sorting. That is why an in-order walk of a search tree is the standard answer to a range question.',
      keyword: 'the k-th smallest',
      trap: 'The successor of a key is not its right child. It is the leftmost node of the right subtree, or, when there is no right subtree, the first ancestor that turns right.',
      narration: 'Successor and predecessor are also how you answer the k-th smallest and the next key after a given one.'
    },
    {
      id: 'del-4', start: 173, end: 180, scene: 'delete',
      caption: 'Every deletion case costs the height: one walk down, and at most one more walk down the successor subtree.',
      detail: 'Nothing in the three cases touches a node outside the path from the root to the removed key and the path to its successor. So the cost is bounded by the height, and the height is what a balanced tree is buying you.',
      keyword: 'costs the height',
      trap: 'Deletion does not rebalance. A tree can stay a legal search tree and become a chain after a run of deletions, which is why real implementations rebalance.',
      narration: 'Every deletion case costs the height: one walk down, and at most one more walk down the successor subtree.'
    },

    /* ---- scene 7: heap ---- */
    {
      id: 'hep-1', start: 180, end: 187, scene: 'heap',
      caption: 'A heap makes two promises: the shape is complete, and every parent is no larger than its children.',
      detail: 'The shape promise is what lets an array hold it with no pointers. The order promise is weaker than the search-tree promise: it says nothing about left against right, so the tree cannot be searched. It only guarantees that the smallest key is at the root.',
      keyword: 'two promises',
      trap: 'A heap is not a sorted array and not a search tree. Its inorder traversal is not sorted, and searching for an arbitrary key is linear.',
      narration: 'A heap makes two promises: the shape is complete, and every parent is no larger than its children.'
    },
    {
      id: 'hep-2', start: 187, end: 195, scene: 'heap',
      caption: 'In an array indexed from 0, the children of i are 2i+1 and 2i+2, and the parent is (i-1)/2 rounded down.',
      detail: 'The arithmetic is the whole point of the complete shape: position in the array is the node, so no pointer is stored and no node is allocated. With indices from 1 the formulas shift to 2i and 2i+1, parent i/2 rounded down. GATE uses both, and states which.',
      keyword: 'the children of i are 2i+1 and 2i+2',
      trap: 'Mixing the two conventions is the commonest arithmetic slip on a heap question. Check the stated base index before writing a formula.',
      narration: 'In an array indexed from zero, the children of i are two i plus one and two i plus two, and the parent is i minus one over two, rounded down.'
    },
    {
      id: 'hep-3', start: 195, end: 203, scene: 'heap',
      caption: 'In a min-heap the largest key must be a leaf, because any internal node has a child at least as large. So there are as many candidate positions as leaves.',
      detail: 'In an array of n keys indexed from 1, the leaves are the indices from n/2 + 1 to n, which is n minus n/2 of them. GATE 2024 Set 1 asked how many values the index of the maximum could take in a heap of 105 elements: 105 minus 52, which is 53.',
      keyword: 'must be a leaf',
      trap: 'The largest being a leaf does not tell you which leaf, so finding it still costs a scan of all the leaves, which is linear.',
      narration: 'In a min-heap the largest key must be a leaf, because any internal node has a child at least as large. So there are as many candidate positions as leaves.'
    },
    {
      id: 'hep-4', start: 203, end: 210, scene: 'heap',
      caption: 'How deep can the 9th smallest key go? At most 8 edges, because every ancestor must be smaller and there are only 8 smaller keys.',
      detail: 'GATE 2016 Set 2 asked this for a heap holding 1 to 1023 exactly once: the answer is 8. The bound is one less than the rank, and it is tight whenever the tree is deep enough to hold the path, which 1023 nodes are.',
      keyword: 'At most 8 edges',
      trap: 'The bound is about the rank of the key, not about the size of the heap. Adding more keys does not let a small key go deeper.',
      narration: 'How deep can the ninth smallest key go? At most eight edges, because every ancestor must be smaller and there are only eight smaller keys.'
    },

    /* ---- scene 8: sift ---- */
    {
      id: 'sft-1', start: 210, end: 217, scene: 'sift',
      caption: 'Insert: put the new key at the next free position, which keeps the shape, then swap it upward while it is smaller than its parent.',
      detail: 'The shape promise is restored by the append, because the next free position is exactly the leftmost free slot on the last level. The order promise is restored by the sift up, which touches one node per level and never more than the height.',
      keyword: 'swap it upward',
      trap: 'Only one comparison per level is needed, against the parent. There is no choice of direction, so sift up is a single path, not a search.',
      narration: 'Insert by putting the new key at the next free position, which keeps the shape, then swapping it upward while it is smaller than its parent.'
    },
    {
      id: 'sft-2', start: 217, end: 225, scene: 'sift',
      caption: 'Remove the minimum: move the last leaf to the root, shrink the array, then swap downward against the smaller child.',
      detail: 'The last leaf is the one position whose removal keeps the shape complete. Placing it at the root can break the order, so the sift down compares the node with both children and swaps with the smaller one, because the smaller one must end up above the larger.',
      keyword: 'against the smaller child',
      trap: 'Swapping with the larger child looks similar and breaks the heap. Always compare both children and take the smaller.',
      narration: 'Remove the minimum by moving the last leaf to the root, shrinking the array, then swapping downward against the smaller child.'
    },
    {
      id: 'sft-3', start: 225, end: 232, scene: 'sift',
      caption: 'Both operations cost the height, which for a complete tree of n nodes is at most log2(n+1) - 1, so O(log n).',
      detail: 'The path is one node per level and the tree is complete, so its height is logarithmic in the node count and cannot degenerate. That is the advantage a heap has over a search tree: no insertion order can make it a chain.',
      keyword: 'cost the height',
      trap: 'Log n here is a guarantee, unlike log n for a search tree, which is only the best case. Say which structure you are describing.',
      narration: 'Both operations cost the height, which for a complete tree of n nodes is at most log base two of n plus one, minus one, so O of log n.'
    },
    {
      id: 'sft-4', start: 232, end: 240, scene: 'sift',
      caption: 'Deleting an arbitrary element is not a heap operation, but it is a fixed recipe: replace it with the last leaf, then sift up or down, whichever the comparison demands.',
      detail: 'GATE 2016 Set 1 asked for the cost of deleting the i-th node of a heap of depth d: one repair along a single path, so O(log n), which is O(d) with the depth given. The recipe works because after the replacement only the ancestors and the descendants of that position can be out of order.',
      keyword: 'sift up or down',
      trap: 'You cannot tell in advance which direction is needed, so the algorithm must compare and choose. Assuming a sift down always is wrong when the replacement is smaller than the parent.',
      narration: 'Deleting an arbitrary element is not a heap operation, but it is a fixed recipe: replace it with the last leaf, then sift up or down, whichever the comparison demands.'
    },

    /* ---- scene 9: build ---- */
    {
      id: 'bld-1', start: 240, end: 247, scene: 'build',
      caption: 'Building a heap by n insertions costs n log n. Building it bottom-up costs n, and the difference is not a constant factor.',
      detail: 'Insertion charges log n for every key, including the ones that end up near the bottom. The bottom-up build instead sifts down only the internal nodes, and the nodes near the bottom barely move at all.',
      keyword: 'bottom-up costs n',
      trap: 'The tempting argument "n/2 nodes times log n each" is the wrong bound, because most of those nodes sit in the last two levels and sift down almost no distance.',
      narration: 'Building a heap by n insertions costs n log n. Building it bottom-up costs n, and the difference is not a constant factor.'
    },
    {
      id: 'bld-2', start: 247, end: 255, scene: 'build',
      caption: 'Sum the work by height: about n/4 nodes move one level, n/8 move two, and the total is at most 2n.',
      detail: 'A complete tree has at most n/2^(h+1) nodes at height h, each costing at most h swaps, so the total is bounded by n times the sum of h over 2^(h+1), which is 1 plus a half plus a quarter, and so on. That sum is at most 2, giving 2n. The build is linear in the worst case, not on average.',
      keyword: 'the total is at most 2n',
      trap: 'This is the one place where a sum over levels, not a worst-case per node, gives the right bound. Quote the sum, not just the conclusion.',
      narration: 'Sum the work by height: about n over four nodes move one level, n over eight move two, and the total is at most two n.'
    },
    {
      id: 'bld-3', start: 255, end: 262, scene: 'build',
      caption: 'Start at the last internal node and sift down each one, working back to the root. The array becomes a heap in one pass.',
      detail: 'The page runs this on the ten-element array GATE 2024 Set 1 used: 82, 101, 90, 11, 111, 75, 33, 131, 44, 93. Working from the last internal node back to index 0 gives 11, 44, 33, 82, 93, 75, 90, 131, 101, 111, using six swaps.',
      keyword: 'Start at the last internal node',
      trap: 'Sifting from the root downward, in array order, does not work: a node sifted early can be broken again by a later swap above it. Bottom-up order is what makes one pass enough.',
      narration: 'Start at the last internal node and sift down each one, working back to the root. The array becomes a heap in one pass.'
    },
    {
      id: 'bld-4', start: 262, end: 270, scene: 'build',
      caption: 'Heapsort: build in n, then remove the minimum n times at log n each. n log n in place, and not stable.',
      detail: 'For an ascending sort you build a max-heap and repeatedly swap the root to the end of the shrinking array. The array is its own storage, so the extra space is constant, which is the property that makes heapsort worth knowing beside quicksort and mergesort.',
      keyword: 'n log n in place',
      trap: 'Heapsort is not stable, and it is not linear even on nearly sorted input, because the build and every removal behave the same way regardless of order.',
      narration: 'Heapsort builds in n, then removes the minimum n times at log n each. That is n log n in place, and it is not stable.'
    },

    /* ---- scene 10: table ---- */
    {
      id: 'tbl-1', start: 270, end: 277, scene: 'table',
      caption: 'A sorted array searches in log n and inserts in n. A search tree trades those. A heap gives up search entirely.',
      detail: 'The sorted array has no room to insert without shifting. The search tree inserts in the height and searches in the height, at the cost of a pointer per node. The heap keeps only the minimum, in constant time, and pays for it by being unable to find anything else quickly.',
      keyword: 'A heap gives up search entirely',
      trap: 'There is no structure that is best at everything here. A question that asks for "the best" is asking you to name the operation it cares about.',
      narration: 'A sorted array searches in log n and inserts in n. A search tree trades those. A heap gives up search entirely.'
    },
    {
      id: 'tbl-2', start: 277, end: 284, scene: 'table',
      caption: 'Find the minimum in constant time: a heap. Find an arbitrary key: a search tree or a hash table. Report keys in order: a search tree.',
      detail: 'The table on the right is the whole comparison, and it is worth being able to rebuild from the two promises. Ask which operation the question names, then read the column.',
      keyword: 'which operation the question names',
      trap: 'A heap cannot answer "is x present" in log n, and a search tree cannot answer "minimum" in constant time. Swapping them is the classic wrong option.',
      narration: 'Find the minimum in constant time with a heap. Find an arbitrary key with a search tree or a hash table. Report keys in order with a search tree.'
    },
    {
      id: 'tbl-3', start: 284, end: 292, scene: 'table',
      caption: 'Four questions decide almost every tree question: which promise is stated, is the shape fixed, is the order fixed, and which base index is in force.',
      detail: 'The promise tells you which structure. The shape tells you the height. The order tells you whether the shape is determined at all. The base index tells you the array arithmetic. Almost every wrong option on a tree question breaks one of the four.',
      keyword: 'Four questions',
      trap: 'The fourth one is the quiet killer: 0-indexed against 1-indexed changes every heap formula, and examiners switch between them.',
      narration: 'Four questions decide almost every tree question: which promise is stated, is the shape fixed, is the order fixed, and which base index is in force.'
    },
    {
      id: 'tbl-4', start: 292, end: 300, scene: 'table',
      caption: 'Next: balanced trees, then graphs. The pointer surgery from the linked-list lesson is the same surgery a rotation uses.',
      detail: 'A rotation is three or four link writes that lowers the height without breaking the search promise, which is how a search tree keeps its logarithmic guarantee. Graphs then drop the "one root" and "at most two children" conditions and keep only the edges.',
      keyword: 'a rotation is three or four link writes',
      trap: 'Balancing does not change the search promise. If a rotation ever changed the inorder order, it would have destroyed the structure it was meant to protect.',
      narration: 'Next come balanced trees, then graphs. The pointer surgery from the linked-list lesson is the same surgery a rotation uses.'
    }
  ]
};
