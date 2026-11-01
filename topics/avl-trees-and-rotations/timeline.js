/* ==========================================================================
   avl-trees-and-rotations — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   captions.vtt, captions.srt and transcript.md are derived from this file by
   tools/gen-captions.mjs — never edited by hand.

   Every number quoted in a caption is produced by the AVL model in lesson.js,
   which re-checks its own invariant after every operation, so the two agree by
   construction.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'why', n: 1,
      title: 'A search tree is only as fast as its height',
      start: 0, end: 30,
      objective: 'See that a plain binary search tree promises O(h) and not O(log n), that the input order decides h, and that the six keys 9, 6, 5, 8, 7, 10 can be held in height 5 or height 2.'
    },
    {
      id: 'invariant', n: 2,
      title: 'The balance factor and the height convention',
      start: 30, end: 60,
      objective: 'Fix the height convention (empty = -1, leaf = 0), define the balance factor as height(right) minus height(left), and state the AVL rule as a condition on every node.'
    },
    {
      id: 'single', n: 3,
      title: 'LL and RR: one rotation, three pointer writes',
      start: 60, end: 90,
      objective: 'Repair an outside imbalance with one rotation, and see the sign pattern that identifies it before any pointer moves.'
    },
    {
      id: 'double', n: 4,
      title: 'LR and RL: the zig-zag needs two rotations',
      start: 90, end: 120,
      objective: 'Repair an inside imbalance with two rotations, and see why the first rotation only converts the case into LL or RR.'
    },
    {
      id: 'pointers', n: 5,
      title: 'What a rotation actually does',
      start: 120, end: 150,
      objective: 'Write the three pointer assignments of a right rotation and prove that the in-order sequence is unchanged, so no search path is broken.'
    },
    {
      id: 'insert', n: 6,
      title: 'Insert 9, 6, 5, 8, 7, 10 and watch the repairs',
      start: 150, end: 180,
      objective: 'Run six insertions, log every repair, and see the height never pass 2 while the in-order sequence stays 5 6 7 8 9 10.'
    },
    {
      id: 'count', n: 7,
      title: 'Insertion needs one repair; deletion may need several',
      start: 180, end: 210,
      objective: 'Explain why a repaired insertion restores the old subtree height while a deletion can shorten it, and count both on real trees.'
    },
    {
      id: 'bound', n: 8,
      title: 'How tall can an AVL tree get?',
      start: 210, end: 240,
      objective: 'Derive N(h) = N(h-1) + N(h-2) + 1, identify it as F(h+3) - 1, and read off both "minimum nodes at height h" and "maximum height on n nodes".'
    },
    {
      id: 'shape', n: 9,
      title: 'AVL is not complete, and a balanced root is not balanced',
      start: 240, end: 270,
      objective: 'Separate perfect, complete and AVL with two counterexamples, and see why the rule must be checked at every node rather than at the root.'
    },
    {
      id: 'routine', n: 10,
      title: 'The four-step routine and the four traps',
      start: 270, end: 300,
      objective: 'Leave with a routine that turns any AVL question into four steps, and the four slips that produce a wrong answer.'
    }
  ],

  events: [

    /* ---------- scene 1: why ---------- */
    { id: 'w-1', scene: 'why', start: 0, end: 7.5,
      caption: 'Six keys. Inserted in sorted order they make a chain five levels deep, and a search may visit every one of them.',
      detail: 'The left tree is a binary search tree built by inserting 5, 6, 7, 8, 9, 10 in that order. Each new key is larger than the last, so every insertion goes to the right and the tree becomes a single path. Its height is 5, so searching for the largest key 10 visits six nodes: 5, 6, 7, 8, 9, 10.',
      narration: 'Six keys. Inserted in sorted order they make a chain five levels deep, and a search may visit every one of them.',
      keyword: 'a chain five levels deep',
      trap: 'A binary search tree does not promise logarithmic search. It promises search in time proportional to its height, and the input decides the height.' },

    { id: 'w-2', scene: 'why', start: 7.5, end: 15,
      caption: 'The same six keys, inserted as 9, 6, 5, 8, 7, 10, sit in height 2. Every search now visits at most three nodes.',
      detail: 'The right tree holds exactly the same keys. Its in-order walk is still 5 6 7 8 9 10, so it is the same search structure in every way that matters for correctness. The difference is shape: height 2 against height 5, so at most three nodes are visited instead of up to six.',
      narration: 'The same six keys, inserted as 9, 6, 5, 8, 7, 10, sit in height 2. Every search now visits at most three nodes.',
      keyword: 'height 2' },

    { id: 'w-3', scene: 'why', start: 15, end: 22.5,
      caption: 'An AVL tree keeps the height logarithmic no matter what order the keys arrive in. That is the whole promise.',
      detail: 'A plain binary search tree promises O(h) and leaves h to the input. An AVL tree promises O(log n) for every insertion order, because it refuses to store a shape whose height has drifted away from logarithmic. The cost is paid on insertion, in a repair that costs at most two rotations.',
      narration: 'An AVL tree keeps the height logarithmic no matter what order the keys arrive in. That is the whole promise.',
      keyword: 'no matter what order' },

    { id: 'w-4', scene: 'why', start: 22.5, end: 30,
      caption: 'It buys that with one extra rule, and the rule is local: at every node, the two subtree heights differ by at most one.',
      detail: 'The rule is not a global condition on the whole tree, and it is not a target shape. It compares two numbers at one node — the height of the left subtree and the height of the right subtree — and forbids a difference larger than one. Applied at every node, it forces the global height bound, which is what scene 8 proves.',
      narration: 'It buys that with one extra rule, and the rule is local: at every node, the two subtree heights differ by at most one.',
      keyword: 'the rule is local' },

    /* ---------- scene 2: invariant ---------- */
    { id: 'i-1', scene: 'invariant', start: 30, end: 37.5,
      caption: 'Height is a convention before it is a number. An empty tree has height minus one; a single node has height zero.',
      detail: 'The convention is what makes the arithmetic work. If an empty tree had height 0, then a leaf would have height 1, and the balance factor of a node with one child would be 1 at best. With empty equal to minus one, a leaf has height 0 and every height is the number of edges on the longest downward path.',
      narration: 'Height is a convention before it is a number. An empty tree has height minus one; a single node has height zero.',
      keyword: 'an empty tree has height minus one',
      trap: 'Questions state their convention. With "height of a single node is 0" the answers to a height question are one less than with "number of levels".' },

    { id: 'i-2', scene: 'invariant', start: 37.5, end: 45,
      caption: 'The balance factor of a node is the height of its right subtree minus the height of its left subtree.',
      detail: 'Written bf of n equals height of the right child minus height of the left child. A positive balance factor means the node leans right, a negative one means it leans left, and zero means the two sides are equally tall. Every node in the picture carries its factor underneath its key.',
      narration: 'The balance factor of a node is the height of its right subtree minus the height of its left subtree.',
      keyword: 'right subtree minus the height of its left' },

    { id: 'i-3', scene: 'invariant', start: 45, end: 52.5,
      caption: 'The AVL condition is that this factor lies between minus one and plus one, at every node, at all times.',
      detail: 'On the tree beside: node 8 has a left subtree of height 1 and a right subtree of height 1, so its factor is 0. Node 6 has two empty children, so both heights are minus one and its factor is 0. Node 9 has an empty left child and a right child of height 0, so its factor is plus one. All three are inside the window.',
      narration: 'The AVL condition is that this factor lies between minus one and plus one, at every node, at all times.',
      keyword: 'at every node' },

    { id: 'i-4', scene: 'invariant', start: 52.5, end: 60,
      caption: 'A node whose factor reaches plus or minus two is the only thing a rotation exists to fix.',
      detail: 'Insertion can break the rule at several nodes along one root-to-leaf path, but only the lowest broken node needs repair: fixing it restores the height of its subtree, and that restoration is what keeps every ancestor legal. This is why the repair is local, and why scene 7 can claim one repair per insertion.',
      narration: 'A node whose factor reaches plus or minus two is the only thing a rotation exists to fix.',
      keyword: 'the lowest broken node' },

    /* ---------- scene 3: LL and RR ---------- */
    { id: 's-1', scene: 'single', start: 60, end: 67.5,
      caption: 'Insert 30, then 20, then 10. Node 30 ends up with factor minus two: two levels of left child in a row.',
      detail: 'The three keys form a straight leftward path. Node 30 has a left subtree of height 1 and an empty right subtree of height minus one, so its balance factor is minus one minus one, which is minus two. The pattern is called LL: the imbalance is on the left child and again on the left grandchild, which is the outside of the path.',
      narration: 'Insert 30, then 20, then 10. Node 30 ends up with factor minus two: two levels of left child in a row.',
      keyword: 'two levels of left child in a row',
      trap: 'LL does not mean "the inserted key was smaller than its parent". It means the imbalance path goes left twice from the unbalanced node.' },

    { id: 's-2', scene: 'single', start: 67.5, end: 75,
      caption: 'One right rotation at 30 fixes it. The middle key 20 rises, and 10 and 30 become its children.',
      detail: 'A right rotation about 30 makes its left child 20 the new subtree root, gives 30 the former right child of 20 as its left child, and hangs 30 on the right of 20. Here 20 had no right child, so 30 simply becomes a leaf. Height falls from 2 to 1 and the factor at 20 is 0.',
      narration: 'One right rotation at 30 fixes it. The middle key 20 rises, and 10 and 30 become its children.',
      keyword: 'the middle key rises' },

    { id: 's-3', scene: 'single', start: 75, end: 82.5,
      caption: 'The mirror case is RR: 10, 20, 30 gives factor plus two at 10, and one left rotation lifts 20.',
      detail: 'Inserting 10, then 20, then 30 gives a straight rightward path. Node 10 has an empty left child and a right subtree of height 1, so its factor is plus two. A left rotation at 10 makes 20 the root, 10 its left child, and restores height 1.',
      narration: 'The mirror case is RR: 10, 20, 30 gives factor plus two at 10, and one left rotation lifts 20.',
      keyword: 'one left rotation' },

    { id: 's-4', scene: 'single', start: 82.5, end: 90,
      caption: 'Both single cases move three pointers. Nothing is copied, nothing is allocated, and the in-order walk is untouched.',
      detail: 'A right rotation is three assignments: take the left child, give its right subtree to the old root, and hang the old root under the new one. Only two heights need recomputing. Because the in-order sequence is unchanged, every key keeps its place in the sorted order, which is why a rotation never breaks the search property.',
      narration: 'Both single cases move three pointers. Nothing is copied, nothing is allocated, and the in-order walk is untouched.',
      keyword: 'three pointers' },

    /* ---------- scene 4: double ---------- */
    { id: 'd-1', scene: 'double', start: 90, end: 97.5,
      caption: 'Now insert 30, then 10, then 20. The path goes left and then right: a zig-zag, not a straight line.',
      detail: 'Node 30 has a left child 10 of height 1, so its factor is minus two — left heavy. But the left child 10 has an empty left subtree and a right child, so its own factor is plus one. That pair of signs, minus two above and plus one below, is the signature of LR. The imbalance is on the inside of the path.',
      narration: 'Now insert 30, then 10, then 20. The path goes left and then right: a zig-zag, not a straight line.',
      keyword: 'a zig-zag',
      trap: 'The case is decided by the grandchild side, not by the key values. LR and RL are mirror images and are the two cases a single rotation cannot repair.' },

    { id: 'd-2', scene: 'double', start: 97.5, end: 105,
      caption: 'A right rotation at 30 alone would leave the zig-zag intact. So first rotate left at the child 10.',
      detail: 'Rotating left at 10 makes 20 the left child of 30, with 10 beneath it on the left. The tree is now 30 with a left child 20 whose left child is 10 — a straight LL path. Nothing is balanced yet, and the factor at 30 is still minus two, but the case has changed.',
      narration: 'A right rotation at 30 alone would leave the zig-zag intact. So first rotate left at the child 10.',
      keyword: 'first rotate left at the child' },

    { id: 'd-3', scene: 'double', start: 105, end: 112.5,
      caption: 'Now the case is LL, so rotate right at 30. Two rotations, and the same tree as the single cases.',
      detail: 'The second rotation is the ordinary LL repair. The result is 20 at the root with 10 and 30 as children, exactly the tree the LL and RR examples reached. RL is the mirror: rotate right at the child first, then left at the grandparent.',
      narration: 'Now the case is LL, so rotate right at 30. Two rotations, and the same tree as the single cases.',
      keyword: 'two rotations' },

    { id: 'd-4', scene: 'double', start: 112.5, end: 120,
      caption: 'So a double rotation is two single rotations, and both must be counted if the question asks for a count.',
      detail: 'Textbooks and exam keys differ on whether LR counts as one rotation or two. The mechanism is unambiguous: two single rotations, the first at the child and the second at the grandparent. If a question asks for the number of rotations, state the convention you are using; if it asks which case, the answer is LR or RL.',
      narration: 'So a double rotation is two single rotations, and both must be counted if the question asks for a count.',
      keyword: 'both must be counted',
      trap: 'One rotation-event, two rotations. A question that counts rotations and a question that counts repairs give different numbers for the same insertion.' },

    /* ---------- scene 5: pointers ---------- */
    { id: 'p-1', scene: 'pointers', start: 120, end: 127.5,
      caption: 'Take 30 with left child 20, and 20 has a right child 25. Node 30 has factor minus two.',
      detail: 'This tree exists so that the rotation has a non-empty middle subtree to move. Node 20 has a left subtree of height minus one and a right subtree of height 0, so its factor is plus one. Node 30 has a left subtree of height 1 and no right child, so its factor is minus two: LR.',
      narration: 'Take 30 with left child 20, and 20 has a right child 25. Node 30 has factor minus two.',
      keyword: 'a non-empty middle subtree' },

    { id: 'p-2', scene: 'pointers', start: 127.5, end: 135,
      caption: 'A right rotation is three assignments: name the left child, hand its right subtree to the old root, hang the old root beneath it.',
      detail: 'In code: x becomes y dot left; y dot left becomes x dot right; x dot right becomes y. The order matters, because the second line must read the old value of x dot right before the third line overwrites x. After the three lines, 25 has moved from being the right child of 20 to being the left child of 30.',
      narration: 'A right rotation is three assignments: name the left child, hand its right subtree to the old root, hang the old root beneath it.',
      keyword: 'three assignments' },

    { id: 'p-3', scene: 'pointers', start: 135, end: 142.5,
      caption: 'The in-order walk before and after is 20 25 30 both times. That is the proof the search property survives.',
      detail: 'A rotation only moves a subtree from one parent to another along the same side of the order. Since the in-order sequence is a sorted list of the keys, and it is unchanged, every key still has exactly the keys below it on its left and above it on its right. A rotation therefore cannot break a search tree; it can only change its shape.',
      narration: 'The in-order walk before and after is 20 25 30 both times. That is the proof the search property survives.',
      keyword: 'in-order walk is unchanged',
      trap: 'A rotation is not a re-sort. If a candidate answer changes the in-order sequence, the answer is wrong regardless of how balanced the shape looks.' },

    { id: 'p-4', scene: 'pointers', start: 142.5, end: 150,
      caption: 'So the repair is O(1) on top of an O(log n) descent. The rotation never dominates the cost.',
      detail: 'Finding the insertion point costs one root-to-leaf walk, which is O(log n) because the tree is AVL. The repair then costs at most two rotations, each three pointer writes and two height updates. The total for an insertion is therefore O(log n), with a small constant.',
      narration: 'So the repair is O(1) on top of an O(log n) descent. The rotation never dominates the cost.',
      keyword: 'O(1) on top of an O(log n) descent' },

    /* ---------- scene 6: insert ---------- */
    { id: 'n-1', scene: 'insert', start: 150, end: 157.5,
      caption: 'Insert 9, then 6. Nothing breaks: 9 leans left by one, which is legal.',
      detail: 'After 9 the tree is one node of height 0. Inserting 6 makes it the left child of 9, so 9 has a left subtree of height 0 and an empty right side, giving factor minus one. That is inside the window, so no repair runs. The in-order sequence is 6 9.',
      narration: 'Insert 9, then 6. Nothing breaks: 9 leans left by one, which is legal.',
      keyword: 'factor minus one, which is legal' },

    { id: 'n-2', scene: 'insert', start: 157.5, end: 165,
      caption: 'Insert 5 and 9 reaches minus two. LL at 9, so one right rotation: 6 becomes the root.',
      detail: 'The path 9, 6, 5 is a straight leftward chain. The lowest node with factor minus two is 9, its left child 6 has factor 0, so the case is LL and one right rotation at 9 suffices. The tree becomes 6 with children 5 and 9, height 1, in-order 5 6 9.',
      narration: 'Insert 5 and 9 reaches minus two. LL at 9, so one right rotation: 6 becomes the root.',
      keyword: 'one right rotation' },

    { id: 'n-3', scene: 'insert', start: 165, end: 172.5,
      caption: 'Insert 8, then 7. Now 8 has a left child 7 beneath 9, so 9 breaks again: LL, one more rotation.',
      detail: 'After 8 the tree is 6 with right child 9, and 9 has left child 8; the factor at 9 is minus one, still legal. Inserting 7 puts it under 8, so 9 now has a left subtree of height 1 and no right child: factor minus two, and the path goes left twice, so it is LL again. Rotating right at 9 gives 8 with children 7 and 9.',
      narration: 'Insert 8, then 7. Now 8 has a left child 7 beneath 9, so 9 breaks again: LL, one more rotation.',
      keyword: 'LL again' },

    { id: 'n-4', scene: 'insert', start: 172.5, end: 180,
      caption: 'Insert 10 and the root 6 leans right, so one left rotation: 8 becomes the root at height 2.',
      detail: 'After inserting 10, node 6 has a left subtree of height 0 and a right subtree of height 2, so its factor is plus two and the right child 8 has factor 0: RR. One left rotation at 6 lifts 8 to the root. Six insertions, three single rotations, final height 2, in-order 5 6 7 8 9 10.',
      narration: 'Insert 10 and the root 6 leans right, so one left rotation: 8 becomes the root at height 2.',
      keyword: 'six insertions, three rotations' },

    /* ---------- scene 7: count ---------- */
    { id: 'c-1', scene: 'count', start: 180, end: 187.5,
      caption: 'The six-key run needed three repairs: none, none, one, none, one, one.',
      detail: 'Each bar is one insertion and its height is the number of single rotations that insertion caused. Inserting 5, 7 and 10 each cost one rotation; the other three cost none. A rotation count question is usually this chart, read off a specific insertion order.',
      narration: 'The six-key run needed three repairs: none, none, one, none, one, one.',
      keyword: 'none, none, one, none, one, one' },

    { id: 'c-2', scene: 'count', start: 187.5, end: 195,
      caption: 'Why one is enough for an insertion: the repaired subtree comes back to its old height, so no ancestor can break.',
      detail: 'Before the insertion, the subtree rooted at the lowest unbalanced node had some height. The rotation restores exactly that height, so every ancestor sees the same subtree height it saw before the insertion. An ancestor that was legal stays legal. This is why insertion needs at most one repair, and why the descent is the only O(log n) part.',
      narration: 'Why one is enough for an insertion: the repaired subtree comes back to its old height, so no ancestor can break.',
      keyword: 'comes back to its old height',
      trap: '"At most one rotation per insertion" is about repairs. A double rotation is still two single rotations, so the count of rotations can be two.' },

    { id: 'c-3', scene: 'count', start: 195, end: 202.5,
      caption: 'A deletion is different: the repaired subtree can come back shorter, so the imbalance travels up the path.',
      detail: 'Deleting a key can reduce the height of a subtree, and a rotation cannot always restore it. So the next ancestor up may now be unbalanced, and the repair repeats. The tree on the right is one example: deleting 15 from sixteen keys needs a rotation at 20 and then another at 25.',
      narration: 'A deletion is different: the repaired subtree can come back shorter, so the imbalance travels up the path.',
      keyword: 'the imbalance travels up' },

    { id: 'c-4', scene: 'count', start: 202.5, end: 210,
      caption: 'So deletion costs up to O(log n) rotations and insertion O(1). Both are still O(log n) in total.',
      detail: 'The descent dominates either way: one root-to-leaf walk is already O(log n). The distinction matters only for questions that count rotations, or that ask which operation can trigger more than one repair. In the sample measured for this lesson, the most any of two hundred insertions needed was one single rotation.',
      narration: 'So deletion costs up to O(log n) rotations and insertion O(1). Both are still O(log n) in total.',
      keyword: 'insertion O(1) rotations' },

    /* ---------- scene 8: bound ---------- */
    { id: 'b-1', scene: 'bound', start: 210, end: 217.5,
      caption: 'To bound the height, ask the reverse question: how few nodes can a legal tree of height h have?',
      detail: 'The sparsest legal tree of height h must have one subtree of height h minus one, because that is what makes the whole tree height h. The other subtree may be as short as the rule allows, which is h minus two. Anything shorter would violate the balance condition, and anything taller would make the tree higher than h.',
      narration: 'To bound the height, ask the reverse question: how few nodes can a legal tree of height h have?',
      keyword: 'how few nodes' },

    { id: 'b-2', scene: 'bound', start: 217.5, end: 225,
      caption: 'So N of h is N of h minus one, plus N of h minus two, plus one for the root: 1, 2, 4, 7, 12, 20, 33.',
      detail: 'The base cases are N of 0 equals 1, a single node, and N of 1 equals 2, a root with one child. The recurrence then gives 4, 7, 12, 20, 33, 54 and 88 for heights 2 to 8. It is the Fibonacci recurrence with a root added at every step, which is why the growth is geometric with ratio 1.618.',
      narration: 'So N of h is N of h minus one, plus N of h minus two, plus one for the root: 1, 2, 4, 7, 12, 20, 33.',
      keyword: 'plus one for the root' },

    { id: 'b-3', scene: 'bound', start: 225, end: 232.5,
      caption: 'A 7-key AVL tree can therefore be three tall, and no taller: N of 3 is exactly 7.',
      detail: 'Read the table in one direction: height 3 needs at least 7 nodes, so a tree with exactly 7 nodes may be height 3. Height 4 needs 12 nodes, which is more than 7, so height 4 is impossible. The same row read the other way gives the other question: the maximum height on 12 nodes is 4, on 20 nodes 5, on 33 nodes 6.',
      narration: 'A 7-key AVL tree can therefore be three tall, and no taller: N of 3 is exactly 7.',
      keyword: 'N of 3 is exactly 7',
      trap: 'The perfect-tree formula 2 to the h plus 1 minus 1 is the MAXIMUM number of nodes at height h, not the minimum. Using it here gives 15 instead of 7.' },

    { id: 'b-4', scene: 'bound', start: 232.5, end: 240,
      caption: 'Solving the recurrence gives height at most 1.44 log base 2 of n plus 2, minus a third: logarithmic, with a constant near 1.44.',
      detail: 'N of h equals F of h plus 3 minus 1, and the Fibonacci numbers grow like the golden ratio to the power h. Turning that round gives h at most 1.44 times log base 2 of n plus 2, minus 0.328. For n equal to 7 that bound is about 4.24, and the tree reaches 3, so the bound is not tight for small trees but it is never violated.',
      narration: 'Solving the recurrence gives height at most 1.44 log base 2 of n plus 2, minus a third: logarithmic, with a constant near 1.44.',
      keyword: '1.44' },

    /* ---------- scene 9: shape ---------- */
    { id: 'h-1', scene: 'shape', start: 240, end: 247.5,
      caption: 'This tree on the left is AVL and is not complete. Nine keys, height 3, every factor inside the window.',
      detail: 'It was built by inserting 50, 30, 70, 20, 60, 80, 10, 40, 65 into an empty AVL tree. Every node satisfies the balance rule, so it is AVL. But node 30 has a right child 40 and no left child, while the last level is not filled from the left, so it is not complete.',
      narration: 'This tree on the left is AVL and is not complete. Nine keys, height 3, every factor inside the window.',
      keyword: 'AVL and not complete' },

    { id: 'h-2', scene: 'shape', start: 247.5, end: 255,
      caption: 'And this one has a perfectly balanced root, factor zero, while two nodes below it are off by two.',
      detail: 'Insert 50, 20, 80, 10, 90, 5, 95 into a plain binary search tree. The left side is a chain of height 2 and the right side is a chain of height 2, so the root has factor 0. Node 20 has factor minus two and node 80 has factor plus two. A check that looks only at the root passes a tree that is not AVL.',
      narration: 'And this one has a perfectly balanced root, factor zero, while two nodes below it are off by two.',
      keyword: 'a check that looks only at the root',
      trap: 'The AVL rule quantifies over every node. A root-only check is the single most common way to mark a non-AVL tree as AVL.' },

    { id: 'h-3', scene: 'shape', start: 255, end: 262.5,
      caption: 'Three different promises: perfect is a shape with all levels full, complete fills the last level from the left, AVL only bounds heights.',
      detail: 'A perfect tree of height h has exactly 2 to the h plus 1 minus 1 nodes. A complete tree fills every level except the last, which fills left to right, and its levels therefore differ by at most one — so every complete tree is AVL. The converse fails: the tree on the left is AVL and not complete. AVL says nothing about which side a child is on.',
      narration: 'Three different promises: perfect is a shape with all levels full, complete fills the last level from the left, AVL only bounds heights.',
      keyword: 'AVL only bounds heights' },

    { id: 'h-4', scene: 'shape', start: 262.5, end: 270,
      caption: 'So the exam-safe check is a bottom-up pass: compute every height from the leaves, then test every factor in one walk.',
      detail: 'Do the in-order or post-order walk and compute heights from the leaves upward, then in a second pass compute the factor at every node and compare it with the window. Two passes, O(n), and no node is missed. Guessing from a drawing is how a wrong answer gets chosen.',
      narration: 'So the exam-safe check is a bottom-up pass: compute every height from the leaves, then test every factor in one walk.',
      keyword: 'bottom-up pass' },

    /* ---------- scene 10: routine ---------- */
    { id: 'r-1', scene: 'routine', start: 270, end: 277.5,
      caption: 'The routine, four steps: draw the insertions in the given order, mark heights and factors as you go.',
      detail: 'Step one is mechanical: insert the keys one at a time, going left when the key is smaller and right when it is larger, and redraw the tree after each insertion. Step two is to write the height and the balance factor beside every node, not just the root, because the lowest broken node decides the repair.',
      narration: 'The routine, four steps: draw the insertions in the given order, mark heights and factors as you go.',
      keyword: 'mark heights and factors' },

    { id: 'r-2', scene: 'routine', start: 277.5, end: 285,
      caption: 'Then repair at the lowest node with factor plus or minus two, using its child and grandchild sides to name the case.',
      detail: 'The case is named by two comparisons: which side of the unbalanced node the taller subtree is on, and which side of that child the taller subtree is on. Same side twice is a single rotation; opposite sides is a double rotation. Repair at the lowest broken node only, then continue the insertion sequence.',
      narration: 'Then repair at the lowest node with factor plus or minus two, using its child and grandchild sides to name the case.',
      keyword: 'the lowest node' },

    { id: 'r-3', scene: 'routine', start: 285, end: 292.5,
      caption: 'Trap one: repairing at the root when the lowest break is deeper. Trap two: one rotation on a zig-zag.',
      detail: 'Repairing at the root when a lower node is the broken one produces a tree that is still unbalanced, and it is the most common wrong drawing. Using a single rotation on LR or RL mirrors the zig-zag without removing it: the factor at the top node stays at plus or minus two. Both traps are avoided by naming the case from the two sides before drawing anything.',
      narration: 'Trap one: repairing at the root when the lowest break is deeper. Trap two: one rotation on a zig-zag.',
      keyword: 'the lowest break' },

    { id: 'r-4', scene: 'routine', start: 292.5, end: 300,
      caption: 'Trap three: reading balanced as complete, or checking only the root. Trap four: using the perfect-tree formula for minimum nodes.',
      detail: 'Balanced and complete are different shapes, and the AVL rule applies at every node. For the counting questions, remember the two directions of one table: the minimum nodes at height h are 1, 2, 4, 7, 12, 20, 33, 54, 88, and the maximum height on n nodes is the largest h whose entry does not exceed n. The perfect-tree count is the other end of the same question.',
      narration: 'Trap three: reading balanced as complete, or checking only the root. Trap four: using the perfect-tree formula for minimum nodes.',
      keyword: 'the two directions of one table',
      trap: '2 to the h plus 1 minus 1 is the maximum nodes at height h. The minimum is N(h), and confusing them turns 7 into 15.' }
  ]
};
