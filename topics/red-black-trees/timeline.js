/* ==========================================================================
   red-black-trees — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   captions.vtt, captions.srt and transcript.md are derived from this file by
   tools/gen-captions.mjs — never edited by hand.

   Every number quoted in a caption is produced by the red-black model in
   lesson.js, which re-checks all five rules after every single insertion.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'cost', n: 1,
      title: 'A search tree is only as fast as it is short',
      start: 0, end: 30,
      objective: 'See that a binary search tree promises search in time proportional to its height, and that a red-black tree bounds that height at 2 log2(n+1) by spending one bit per node.'
    },
    {
      id: 'rules', n: 2,
      title: 'The five rules, and which one does the work',
      start: 30, end: 60,
      objective: 'State the five red-black rules with the NIL leaves drawn, and see that rules one to four are cheap while rule five is the one that bounds the height.'
    },
    {
      id: 'blackheight', n: 3,
      title: 'Black-height: the number that rule five equalises',
      start: 60, end: 90,
      objective: 'Compute the black-height of every node of a seven-key tree, and watch rule five fail on a tree that breaks nothing else.'
    },
    {
      id: 'count', n: 4,
      title: 'Why a black-height of b needs at least 2 to the b minus 1 keys',
      start: 90, end: 120,
      objective: 'Prove by induction that the subtree at x holds at least 2^bh(x) - 1 keys, and read the perfect black trees 1, 3, 7, 15 off that claim.'
    },
    {
      id: 'bound', n: 5,
      title: 'Height at most twice the black-height',
      start: 120, end: 150,
      objective: 'Chain the counting claim with the no-two-reds rule to get h <= 2 log2(n+1), then measure how loose that ceiling is on a real fifteen-key tree.'
    },
    {
      id: 'insertred', n: 6,
      title: 'Why the new node is red',
      start: 150, end: 180,
      objective: 'Compare a black insertion with a red one: black breaks rule five on every path, red breaks rule four in at most one place.'
    },
    {
      id: 'case1', n: 7,
      title: 'Case one: the uncle is red, so recolour',
      start: 180, end: 210,
      objective: 'Repair a red-red fault by recolouring three nodes, see the fault climb to the grandparent, and count the rotations: none.'
    },
    {
      id: 'case23', n: 8,
      title: 'Cases two and three: the uncle is black',
      start: 210, end: 240,
      objective: 'Straighten a zig-zag with one rotation, then repair the straight case with one rotation and two recolours, on a real three-step trace.'
    },
    {
      id: 'delete', n: 9,
      title: 'Deleting a red leaf against deleting a black one',
      start: 240, end: 270,
      objective: 'See that a red deletion leaves every rule intact while a black deletion leaves one path short, and compare the rotation cost with AVL.'
    },
    {
      id: 'routine', n: 10,
      title: 'The four-step routine and the four traps',
      start: 270, end: 300,
      objective: 'Leave with a routine that turns a red-black question into four steps, and the four answers that look right and are not.'
    }
  ],

  events: [

    /* ---------- scene 1: cost ---------- */
    { id: 'k-1', scene: 'cost', start: 0, end: 7.5,
      caption: 'Seven keys inserted in sorted order make a chain six levels deep, and a search for the largest key visits every one of them.',
      detail: 'Inserting 5, 6, 7, 8, 9, 10, 11 into a plain binary search tree sends every new key to the right, so the tree is one path. Its height is 6, and finding 11 walks 5, 6, 7, 8, 9, 10, 11: seven nodes compared.',
      narration: 'Seven keys inserted in sorted order make a chain six levels deep, and a search for the largest key visits every one of them.',
      keyword: 'a chain six levels deep',
      trap: 'A binary search tree promises search time proportional to its height. It does not promise logarithmic search; the insertion order decides the height.' },

    { id: 'k-2', scene: 'cost', start: 7.5, end: 15,
      caption: 'The same seven keys, inserted as 10, 20, 30, 15, 25, 12, 5, sit in height 3. Finding 25 compares three keys.',
      detail: 'This is the tree the rest of the lesson uses. Its root is 20, and every search descends at most three edges. The cost of a search is the number of nodes on the path, so the same seven keys cost seven comparisons in one order and three in the other.',
      narration: 'The same seven keys, inserted as 10, 20, 30, 15, 25, 12, 5, sit in height 3. Finding 25 compares three keys.',
      keyword: 'height 3' },

    { id: 'k-3', scene: 'cost', start: 15, end: 22.5,
      caption: 'A red-black tree promises height at most twice the base-2 logarithm of n plus 1. For seven keys that ceiling is 6.',
      detail: 'The ceiling comes from two facts proved later in this lesson: a tree with n keys has black-height at most log2(n+1), and the height is at most twice the black-height. For n equal to 7, log2(8) is 3, so the height is at most 6. A perfect tree on seven keys has height 2, and the tree on screen has height 3.',
      narration: 'A red-black tree promises height at most twice the base-2 logarithm of n plus 1. For seven keys that ceiling is 6.',
      keyword: 'twice the base-2 logarithm',
      trap: 'The promise is 2 log2(n+1), not log2(n+1). A red-black tree may be almost twice as tall as a perfectly balanced one.' },

    { id: 'k-4', scene: 'cost', start: 22.5, end: 30,
      caption: 'An AVL tree promises 1.44 log base 2 of n plus 2. Red-black trees accept a taller tree in exchange for cheaper repairs.',
      detail: 'For seven keys the AVL bound is 1.44 times log2(9), minus 0.328, which is about 4.24. The red-black ceiling of 6 is looser, so a red-black tree may hold the same keys in a taller shape. What it buys is repair cost: an insertion into a red-black tree needs at most two rotations, and a deletion at most three, while AVL deletion may rotate at every level.',
      narration: 'An AVL tree promises 1.44 log base 2 of n plus 2. Red-black trees accept a taller tree in exchange for cheaper repairs.',
      keyword: 'in exchange for cheaper repairs' },

    /* ---------- scene 2: rules ---------- */
    { id: 'r-1', scene: 'rules', start: 30, end: 37.5,
      caption: 'Rule one: every node is red or black. One bit per node is the entire overhead of the structure.',
      detail: 'The colour is stored beside the key, one bit, and nothing else is added to the node. Every other guarantee in this lesson is a consequence of how those bits are placed, which is why the five rules are worth memorising exactly.',
      narration: 'Rule one: every node is red or black. One bit per node is the entire overhead of the structure.',
      keyword: 'One bit per node' },

    { id: 'r-2', scene: 'rules', start: 37.5, end: 45,
      caption: 'Rules two and three: the root is black, and every leaf is black. The leaves here are the NIL markers, not keys.',
      detail: 'The small squares at the bottom of the drawing are the NIL leaves. They hold no key and are never searched, but they are nodes as far as the rules are concerned, and they are black. Rule two makes the root black, which costs nothing and removes a case from every proof.',
      narration: 'Rules two and three: the root is black, and every leaf is black. The leaves here are the NIL markers, not keys.',
      keyword: 'the NIL markers',
      trap: 'The leaves in rule three are the empty markers, not the nodes without children. Counting only keyed nodes gives the wrong black-height everywhere.' },

    { id: 'r-3', scene: 'rules', start: 45, end: 52.5,
      caption: 'Rule four: a red node has two black children. No path from the root may hold two reds in a row.',
      detail: 'Rule four is the only one that can be broken by a single insertion, and it is broken in one place: the new red node against its parent. On this tree the red nodes are 12 and 25, and both have black children.',
      narration: 'Rule four: a red node has two black children. No path from the root may hold two reds in a row.',
      keyword: 'two reds in a row' },

    { id: 'r-4', scene: 'rules', start: 52.5, end: 60,
      caption: 'Rule five: every path from a node down to a NIL leaf holds the same number of black nodes. This is the rule that bounds the height.',
      detail: 'Rules one, two and three are bookkeeping. Rule four limits how red can be spread along a path. Rule five is the counting rule: it forces every branch to carry the same black weight, and that is what makes the tree shallow. The next scene gives it a name and a number.',
      narration: 'Rule five: every path from a node down to a NIL leaf holds the same number of black nodes. This is the rule that bounds the height.',
      keyword: 'the same number of black nodes' },

    /* ---------- scene 3: blackheight ---------- */
    { id: 'b-1', scene: 'blackheight', start: 60, end: 67.5,
      caption: 'The black-height of a node counts the black nodes below it on the way to a NIL leaf, the NIL included and the node itself excluded.',
      detail: 'The definition excludes the node, so the black-height of a NIL leaf is 0, and the black-height of a node whose children are both NIL is 1. The black-height of the root is called the black-height of the tree.',
      narration: 'The black-height of a node counts the black nodes below it on the way to a NIL leaf, the NIL included and the node itself excluded.',
      keyword: 'the node itself excluded',
      trap: 'Counting the node itself shifts every black-height by one and makes a correct tree look wrong. Write the definition down before you count.' },

    { id: 'b-2', scene: 'blackheight', start: 67.5, end: 75,
      caption: 'In this seven-key tree the root 20 has black-height 2, the red 12 also has 2, and every leaf key has 1.',
      detail: 'Walk from 20 down to any NIL leaf: on the left it is 20, then 12, then 10, then the NIL, and the black nodes below 20 are 10 and the NIL, so 2. On the right it is 20, then 30, then the NIL, which is 1 plus 1, also 2. The red 12 contributes nothing to the count, which is why its black-height matches the root.',
      narration: 'In this seven-key tree the root 20 has black-height 2, the red 12 also has 2, and every leaf key has 1.',
      keyword: 'black-height 2' },

    { id: 'b-3', scene: 'blackheight', start: 75, end: 82.5,
      caption: 'Rule five says the two children of every node have equal black-height, and the numbers on screen satisfy it everywhere.',
      detail: 'At 20 the children are 12 and 30, both of black-height 2. At 12 the children are 10 and 15, both of black-height 1. At 10 the children are 5 and a NIL, both of black-height 1. Three nodes checked, three equalities, and the same holds at every node of the tree.',
      narration: 'Rule five says the two children of every node have equal black-height, and the numbers on screen satisfy it everywhere.',
      keyword: 'equal black-height' },

    { id: 'b-4', scene: 'blackheight', start: 82.5, end: 90,
      caption: 'Insert 30 as a black node instead, and the two sides of 20 disagree: 1 against 2. Rule five breaks, rule four does not.',
      detail: 'The tree on the right was built by inserting 10, then 20, then 30 coloured black with no repair at all. It has no two reds in a row, its root is black, and every node is coloured, so four of the five rules hold. The paths through the new node carry one more black than the paths that miss it, so rule five fails. This is the reason a new node is never black.',
      narration: 'Insert 30 as a black node instead, and the two sides of 20 disagree: 1 against 2. Rule five breaks, rule four does not.',
      keyword: '1 against 2',
      trap: 'Checking a tree by looking for two reds in a row passes a tree that breaks rule five. Both checks are needed, at every node.' },

    /* ---------- scene 4: count ---------- */
    { id: 'c-1', scene: 'count', start: 90, end: 97.5,
      caption: 'Claim: the subtree rooted at any node x holds at least 2 to the black-height of x, minus 1, keys.',
      detail: 'The claim is about keys, not about nodes including NIL. It is the counting claim that converts a black-height into a size, and it is what turns rule five into a height bound. It is proved by induction on the height of x, not on the size of the tree.',
      narration: 'Claim: the subtree rooted at any node x holds at least 2 to the black-height of x, minus 1, keys.',
      keyword: 'at least 2 to the black-height' },

    { id: 'c-2', scene: 'count', start: 97.5, end: 105,
      caption: 'Each child has black-height either bh of x or bh of x minus 1, so each subtree holds at least 2 to the bh minus 1, minus 1 keys.',
      detail: 'A black child contributes one to the black-height of x and keeps its own black-height one lower; a red child contributes nothing and keeps the same black-height. Either way each child has black-height at least bh(x) minus 1, so by the induction hypothesis each subtree holds at least 2 to the bh(x) minus 1, minus 1 keys. Adding the two children and x gives 2 times that quantity plus 1, which is 2 to the bh(x) minus 1.',
      narration: 'Each child has black-height either bh of x or bh of x minus 1, so each subtree holds at least 2 to the bh minus 1, minus 1 keys.',
      keyword: 'either bh of x or bh of x minus 1' },

    { id: 'c-3', scene: 'count', start: 105, end: 112.5,
      caption: 'Black-height 1 needs 1 key, 2 needs 3, 3 needs 7, 4 needs 15: at each step the smallest tree is a perfect all-black tree.',
      detail: 'The bound is attained exactly by the all-black perfect tree, whose black-height is its height plus one. A black-height of 4 therefore needs at least 15 keys, and no colouring does better. That row, 1, 3, 7, 15, 31, is the skeleton every red-black tree is built on.',
      narration: 'Black-height 1 needs 1 key, 2 needs 3, 3 needs 7, 4 needs 15: at each step the smallest tree is a perfect all-black tree.',
      keyword: 'a perfect all-black tree' },

    { id: 'c-4', scene: 'count', start: 112.5, end: 120,
      caption: 'Turned around: n keys force a black-height of at most log base 2 of n plus 1, because 2 to the bh minus 1 cannot exceed n.',
      detail: 'With n equal to 7 the black-height is at most log2(8), which is 3, and the tree on screen has black-height 2. With n equal to 15 the black-height is at most 4, and the fifteen-key tree later in the lesson has black-height 3. The inequality is a ceiling, never an equality.',
      narration: 'Turned around: n keys force a black-height of at most log base 2 of n plus 1, because 2 to the bh minus 1 cannot exceed n.',
      keyword: 'at most log base 2 of n plus 1' },

    /* ---------- scene 5: bound ---------- */
    { id: 'd-1', scene: 'bound', start: 120, end: 127.5,
      caption: 'No two reds in a row, so on any path at least half the nodes below the root are black, and the height is at most twice the black-height.',
      detail: 'Take any path from the root to a NIL leaf with h edges. Its nodes alternate at worst red, black, red, black, so the black nodes below the root number at least half of the h edges. The black-height of the root is that number, so h is at most twice the root black-height. The tree on screen has height 3 and black-height 2, and 3 is at most 4.',
      narration: 'No two reds in a row, so on any path at least half the nodes below the root are black, and the height is at most twice the black-height.',
      keyword: 'at most twice the black-height' },

    { id: 'd-2', scene: 'bound', start: 127.5, end: 135,
      caption: 'Chaining the two gives height at most 2 log base 2 of n plus 1. For fifteen keys that ceiling is 8.',
      detail: 'Black-height at most log2(n+1), height at most twice the black-height, so height at most 2 log2(n+1). For n equal to 15 the ceiling is 2 times log2(16), which is 8. Every operation that walks a path, so search, insert and delete, is therefore logarithmic in n.',
      narration: 'Chaining the two gives height at most 2 log base 2 of n plus 1. For fifteen keys that ceiling is 8.',
      keyword: 'that ceiling is 8' },

    { id: 'd-3', scene: 'bound', start: 135, end: 142.5,
      caption: 'The ceiling is loose. This valid fifteen-key tree has height 5, and no fifteen-key red-black tree can be taller.',
      detail: 'The tree was built by inserting 9, 1, 2, 13, 4, 3, 11, 5, 6, 10, 7, 15, 12, 8, 14, and the model confirms all five rules at every node. Its height is 5 and its black-height is 3, so 5 is at most 6. A search of this tree compares at most six keys, while the perfect tree on fifteen keys compares four.',
      narration: 'The ceiling is loose. This valid fifteen-key tree has height 5, and no fifteen-key red-black tree can be taller.',
      keyword: 'height 5' },

    { id: 'd-4', scene: 'bound', start: 142.5, end: 150,
      caption: 'Height 6 needs at least 23 keys, so 5 is the largest height fifteen keys allow. The bound of 8 is never reached.',
      detail: 'The smallest red-black tree of height h holds 1, 3, 5, 7, 11, 15, 23 keys for h equal to 0 to 6, computed exhaustively by the page. So with 15 keys the largest possible height is 5, and the answer 8 that the formula suggests is only a ceiling. This is the difference between the bound and the exact answer, and it is where exam questions are set.',
      narration: 'Height 6 needs at least 23 keys, so 5 is the largest height fifteen keys allow. The bound of 8 is never reached.',
      keyword: 'the largest height fifteen keys allow',
      trap: 'Answering 2 log2(n+1) when the question asks for the maximum height of a red-black tree on n keys is the standard error. The formula is an upper bound; the table is the answer.' },

    /* ---------- scene 6: insertred ---------- */
    { id: 'e-1', scene: 'insertred', start: 150, end: 157.5,
      caption: 'Insert as a red node. A red node adds no black to any path, so rule five survives by construction.',
      detail: 'A new key arrives as a leaf, so its two children are NIL leaves and its own black contribution is zero. Every path that passes through it gains one red node and no black node, so all black-heights are exactly what they were. Only rules two and four can now be broken, and rule two is repaired by colouring the root black at the end.',
      narration: 'Insert as a red node. A red node adds no black to any path, so rule five survives by construction.',
      keyword: 'adds no black to any path' },

    { id: 'e-2', scene: 'insertred', start: 157.5, end: 165,
      caption: 'Insert 30 as black instead, and the paths through it hold one more black than the paths that miss it.',
      detail: 'The tree on the left was built by inserting 10, then 20, then 30 coloured black with no repair. At node 20 the left path holds one black and the right path holds two, so rule five fails. The tree has no two reds in a row, which is exactly why the mistake is easy to make: the rule that breaks is the one nobody draws.',
      narration: 'Insert 30 as black instead, and the paths through it hold one more black than the paths that miss it.',
      keyword: 'one more black' },

    { id: 'e-3', scene: 'insertred', start: 165, end: 172.5,
      caption: 'A red insertion can only put red beside red. That is one broken rule, in one place, on one path.',
      detail: 'The tree on the right was built the same way with 30 coloured red. Rule five still holds, and rule four fails at the pair 20 and 30. Because the fault is a single red-red edge, the repair is local: it looks at the parent, the grandparent and the uncle, and nothing else.',
      narration: 'A red insertion can only put red beside red. That is one broken rule, in one place, on one path.',
      keyword: 'one broken rule, in one place',
      trap: 'A red insertion never breaks rule five. Saying otherwise leads to repairing black-heights that were never damaged.' },

    { id: 'e-4', scene: 'insertred', start: 172.5, end: 180,
      caption: 'So the repair is about rule four: a red node whose parent is red, with an uncle on the other side of the grandparent.',
      detail: 'The grandparent exists and is black, because the parent is red and no two reds are adjacent. That leaves two facts to read: the colour of the uncle, and whether the new node is on the inside or the outside of its parent. Those two facts name the three cases, and the cases are the next two scenes.',
      narration: 'So the repair is about rule four: a red node whose parent is red, with an uncle on the other side of the grandparent.',
      keyword: 'the colour of the uncle' },

    /* ---------- scene 7: case1 ---------- */
    { id: 'f-1', scene: 'case1', start: 180, end: 187.5,
      caption: 'Case one: the uncle is red. Recolour the parent and the uncle black and the grandparent red, and every path through the grandparent keeps its black count.',
      detail: 'Before the repair, 10 is red and its child 15 is red, while the uncle 30 is red too. Counting the grandparent 20 itself, each of its three paths holds two blacks before the recolouring; after colouring 10 and 30 black and 20 red, each path still holds two, because the black that moved out of 20 moved into its two children. The red-red fault at 10 and 15 is gone. Only the last line of the fix-up, which colours the root black, adds a black.',
      narration: 'Case one: the uncle is red. Recolour the parent and the uncle black and the grandparent red, and every path through the grandparent keeps its black count.',
      keyword: 'Recolour the parent and the uncle' },

    { id: 'f-2', scene: 'case1', start: 187.5, end: 195,
      caption: 'The grandparent is now red, so the same fault can reappear one level up. The repair moves up, never down.',
      detail: 'The recolouring makes the grandparent red. If its own parent is red, the fault has simply moved two levels up the tree, and the same three cases are applied again with the grandparent as the new node. This is why case one is written as a loop that climbs, and why it can run at every level of the tree.',
      narration: 'The grandparent is now red, so the same fault can reappear one level up. The repair moves up, never down.',
      keyword: 'moves up, never down' },

    { id: 'f-3', scene: 'case1', start: 195, end: 202.5,
      caption: 'On this ten-key build, inserting 6 fires case one at 4 and again at 7: two levels of climbing, no rotation at all.',
      detail: 'The sequence 5, 10, 9, 1, 2, 8, 7, 4, 3, 6 is run by the page. Inserting 6 creates a red-red pair at 4, whose uncle is red, so case one recolours and hands the fault to 7; there the uncle is red again, so case one runs a second time and the repair ends at the root. Inserting 4 in the same build takes one case one and then a case two and three, which is two rotations. The model records every case it takes, so the trace on screen is the algorithm and not an illustration of it.',
      narration: 'On this ten-key build, inserting 6 fires case one at 4 and again at 7: two levels of climbing, no rotation at all.',
      keyword: 'two levels of climbing' },

    { id: 'f-4', scene: 'case1', start: 202.5, end: 210,
      caption: 'Case one uses no rotation at all. Recolouring and rotating are different moves and are counted separately.',
      detail: 'A question that asks how many rotations an insertion needs is not asking how many times the tree was touched. Case one recolours three nodes and rotates none; case two rotates once and recolours nothing; case three recolours two nodes and rotates once. The seven-key build in this lesson performs three rotations over seven insertions, while taking case one twice.',
      narration: 'Case one uses no rotation at all. Recolouring and rotating are different moves and are counted separately.',
      keyword: 'Recolouring and rotating are different moves',
      trap: 'Counting a recolouring as a rotation, or counting the two rotations of case two plus case three as one, gives the wrong total. Count rotations only.' },

    /* ---------- scene 8: case23 ---------- */
    { id: 'g-1', scene: 'case23', start: 210, end: 217.5,
      caption: 'Case two: the uncle is black and the new red sits on the inside, a zig-zag. Rotate at the parent to straighten it.',
      detail: 'Inserting 12 into the five-key tree puts it left of the red 15, which hangs on the right of the black 10. The red-red pair is 15 and 12, and the uncle is the NIL leaf on the left of 10, which is black. A right rotation at 15 turns the zig-zag into a straight line, and the same fault is now case three.',
      narration: 'Case two: the uncle is black and the new red sits on the inside, a zig-zag. Rotate at the parent to straighten it.',
      keyword: 'a zig-zag' },

    { id: 'g-2', scene: 'case23', start: 217.5, end: 225,
      caption: 'Case three: uncle black, red on the outside. Recolour the parent black and the grandparent red, then rotate at the grandparent.',
      detail: 'Now 12 is red on the left of the red 15, both on the left of the black 10: the fault is straight. Colouring 15 black and 10 red, then rotating right at 10, leaves 15 black at the top of that subtree with 10 and 12 red beneath it. Every path holds the same black count as before the insertion.',
      narration: 'Case three: uncle black, red on the outside. Recolour the parent black and the grandparent red, then rotate at the grandparent.',
      keyword: 'rotate at the grandparent' },

    { id: 'g-3', scene: 'case23', start: 225, end: 232.5,
      caption: 'Inserting 12 into the five-key tree takes exactly that pair: rotate right at 15, then left at 10.',
      detail: 'The tree afterwards has root 20, left child the black 12 with red children 10 and 15, and right child the black 30 with the red 25. Height 2, black-height 2, all five rules holding, and the in-order walk 10, 12, 15, 20, 25, 30 unchanged. Two rotations, one per case. The seventh key, 5, then fires case one and lifts the 12 to red.',
      narration: 'Inserting 12 into the five-key tree takes exactly that pair: rotate right at 15, then left at 10.',
      keyword: 'rotate right at 15, then left at 10' },

    { id: 'g-4', scene: 'case23', start: 232.5, end: 240,
      caption: 'One insertion needs at most two rotations, but the recolouring of case one can repeat at every level.',
      detail: 'Cases two and three rotate, and each is followed by a finished repair, so at most two rotations happen in one insertion. Case one does not rotate, but it can move the fault up the tree and run again, so the recolouring work is bounded by the height. Both are O(log n), and the whole insertion is O(log n) with a small constant.',
      narration: 'One insertion needs at most two rotations, but the recolouring of case one can repeat at every level.',
      keyword: 'at most two rotations',
      trap: 'A red-black insertion needs at most two rotations, not O(log n). The O(log n) figure belongs to the recolouring of case one.' },

    /* ---------- scene 9: delete ---------- */
    { id: 'h-1', scene: 'delete', start: 240, end: 247.5,
      caption: 'Deleting a red leaf changes no black-height and no adjacency, so the tree stays valid. 25 goes and nothing else changes.',
      detail: 'The red 25 is a leaf of the seven-key tree. Removing it removes no black node from any path and leaves no two reds adjacent, so all five rules still hold. The page checks this by deleting with plain binary search tree deletion and then testing all five rules.',
      narration: 'Deleting a red leaf changes no black-height and no adjacency, so the tree stays valid. 25 goes and nothing else changes.',
      keyword: 'stays valid' },

    { id: 'h-2', scene: 'delete', start: 247.5, end: 255,
      caption: 'Deleting a black leaf leaves one path short of a black node. Rule five breaks and rule four still holds.',
      detail: 'The black 15 is a leaf. Removing it shortens every path through it by one black, so at node 12 the left path holds two blacks and the right path holds one. The same happens when a black node with two children is removed and a black key is moved up. Red deletions are free; black deletions are the hard case.',
      narration: 'Deleting a black leaf leaves one path short of a black node. Rule five breaks and rule four still holds.',
      keyword: 'one path short of a black node',
      trap: 'A deletion that keeps the search property can still destroy the tree. Always test rule five after a deletion, not only the ordering.' },

    { id: 'h-3', scene: 'delete', start: 255, end: 262.5,
      caption: 'That is why deletion needs a fix-up of its own: the deficit is pushed up to the parent and repaired with a red sibling.',
      detail: 'The fix-up treats the short path as carrying a double black, and moves it up until a red node can absorb it or a rotation restores the black count. There are four cases, mirror images of each other, and the repair can climb. This lesson names them and does not code them, because the insertion cases are what the questions test.',
      narration: 'That is why deletion needs a fix-up of its own: the deficit is pushed up to the parent and repaired with a red sibling.',
      keyword: 'a fix-up of its own' },

    { id: 'h-4', scene: 'delete', start: 262.5, end: 270,
      caption: 'The trade: an AVL deletion may rotate at every level, while a red-black deletion needs at most three rotations.',
      detail: 'In an AVL tree a deletion can shorten a subtree, so the balance can break again at the parent, and the repair can repeat all the way to the root: O(log n) rotations. In a red-black tree the fix-up also climbs, but it stops at the first rotation, so at most three rotations are performed. Insertion costs at most two rotations in both structures; the difference is deletion, and it is why red-black trees are used where deletion is frequent.',
      narration: 'The trade: an AVL deletion may rotate at every level, while a red-black deletion needs at most three rotations.',
      keyword: 'at most three rotations' },

    /* ---------- scene 10: routine ---------- */
    { id: 'i-1', scene: 'routine', start: 270, end: 277.5,
      caption: 'Step one: check the five rules on the drawn tree, and check rule five at every node, not only at the root.',
      detail: 'Write the black-height under every node and compare the two children at each node. A tree can have a perfectly balanced root and a broken node two levels down, exactly as the AVL lesson warns, and the same failure happens here with rule five.',
      narration: 'Step one: check the five rules on the drawn tree, and check rule five at every node, not only at the root.',
      keyword: 'at every node' },

    { id: 'i-2', scene: 'routine', start: 277.5, end: 285,
      caption: 'Step two: for a counting question, use the black-height. At least 2 to the bh minus 1 keys, and height at most twice the bh.',
      detail: 'Those two inequalities answer every height and size question, and the exact table 1, 3, 5, 7, 11, 15, 23 answers the sharper ones. When a question asks for the maximum height on n keys, find the largest h whose minimum does not exceed n rather than evaluating the logarithm.',
      narration: 'Step two: for a counting question, use the black-height. At least 2 to the bh minus 1 keys, and height at most twice the bh.',
      keyword: 'at least 2 to the bh minus 1 keys' },

    { id: 'i-3', scene: 'routine', start: 285, end: 292.5,
      caption: 'Step three: for an insertion, insert red, then name the case from the uncle colour and the zig-zag.',
      detail: 'Uncle red is case one: recolour and climb. Uncle black with the new node on the inside is case two: rotate once to straighten, then fall into case three. Uncle black with the new node on the outside is case three: recolour two nodes and rotate once. Finish by colouring the root black.',
      narration: 'Step three: for an insertion, insert red, then name the case from the uncle colour and the zig-zag.',
      keyword: 'name the case' },

    { id: 'i-4', scene: 'routine', start: 292.5, end: 300,
      caption: 'Trap: a red-black tree is not an AVL tree. This valid red-black tree has a root balance factor of plus 2.',
      detail: 'Inserting 10, 35, 8, 37, 20, 36 produces a tree that satisfies all five rules. Its root 10 has a left subtree of height 0 and a right subtree of height 2, so its balance factor is plus 2 and the tree is not AVL. Red-black trees allow a taller tree, and that slack is what buys the cheaper deletion. The other three traps: reading rule five at the root only, counting recolourings as rotations, and answering the logarithm when the table is exact.',
      narration: 'Trap: a red-black tree is not an AVL tree. This valid red-black tree has a root balance factor of plus 2.',
      keyword: 'not an AVL tree',
      trap: 'Every AVL tree on up to seven keys admits a red-black colouring in this page\u2019s exhaustive check, but a red-black tree need not be AVL. The two structures are not interchangeable answers.' }
  ]
};
