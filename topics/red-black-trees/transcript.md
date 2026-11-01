# Red Black Trees — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/red-black-trees/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A search tree is only as fast as it is short

*0:00 – 0:30 · objective: See that a binary search tree promises search in time proportional to its height, and that a red-black tree bounds that height at 2 log2(n+1) by spending one bit per node.*

**0:00–0:07** — Seven keys inserted in sorted order make a chain six levels deep, and a search for the largest key visits every one of them.

> Caption: Seven keys inserted in sorted order make a chain six levels deep, and a search for the largest key visits every one of them.

Exam-trap caption mode adds: *A binary search tree promises search time proportional to its height. It does not promise logarithmic search; the insertion order decides the height.*

**0:07–0:15** — The same seven keys, inserted as 10, 20, 30, 15, 25, 12, 5, sit in height 3. Finding 25 compares three keys.

> Caption: The same seven keys, inserted as 10, 20, 30, 15, 25, 12, 5, sit in height 3. Finding 25 compares three keys.

**0:15–0:22** — A red-black tree promises height at most twice the base-2 logarithm of n plus 1. For seven keys that ceiling is 6.

> Caption: A red-black tree promises height at most twice the base-2 logarithm of n plus 1. For seven keys that ceiling is 6.

Exam-trap caption mode adds: *The promise is 2 log2(n+1), not log2(n+1). A red-black tree may be almost twice as tall as a perfectly balanced one.*

**0:22–0:30** — An AVL tree promises 1.44 log base 2 of n plus 2. Red-black trees accept a taller tree in exchange for cheaper repairs.

> Caption: An AVL tree promises 1.44 log base 2 of n plus 2. Red-black trees accept a taller tree in exchange for cheaper repairs.

## Scene 2. The five rules, and which one does the work

*0:30 – 1:00 · objective: State the five red-black rules with the NIL leaves drawn, and see that rules one to four are cheap while rule five is the one that bounds the height.*

**0:30–0:37** — Rule one: every node is red or black. One bit per node is the entire overhead of the structure.

> Caption: Rule one: every node is red or black. One bit per node is the entire overhead of the structure.

**0:37–0:45** — Rules two and three: the root is black, and every leaf is black. The leaves here are the NIL markers, not keys.

> Caption: Rules two and three: the root is black, and every leaf is black. The leaves here are the NIL markers, not keys.

Exam-trap caption mode adds: *The leaves in rule three are the empty markers, not the nodes without children. Counting only keyed nodes gives the wrong black-height everywhere.*

**0:45–0:52** — Rule four: a red node has two black children. No path from the root may hold two reds in a row.

> Caption: Rule four: a red node has two black children. No path from the root may hold two reds in a row.

**0:52–1:00** — Rule five: every path from a node down to a NIL leaf holds the same number of black nodes. This is the rule that bounds the height.

> Caption: Rule five: every path from a node down to a NIL leaf holds the same number of black nodes. This is the rule that bounds the height.

## Scene 3. Black-height: the number that rule five equalises

*1:00 – 1:30 · objective: Compute the black-height of every node of a seven-key tree, and watch rule five fail on a tree that breaks nothing else.*

**1:00–1:07** — The black-height of a node counts the black nodes below it on the way to a NIL leaf, the NIL included and the node itself excluded.

> Caption: The black-height of a node counts the black nodes below it on the way to a NIL leaf, the NIL included and the node itself excluded.

Exam-trap caption mode adds: *Counting the node itself shifts every black-height by one and makes a correct tree look wrong. Write the definition down before you count.*

**1:07–1:15** — In this seven-key tree the root 20 has black-height 2, the red 12 also has 2, and every leaf key has 1.

> Caption: In this seven-key tree the root 20 has black-height 2, the red 12 also has 2, and every leaf key has 1.

**1:15–1:22** — Rule five says the two children of every node have equal black-height, and the numbers on screen satisfy it everywhere.

> Caption: Rule five says the two children of every node have equal black-height, and the numbers on screen satisfy it everywhere.

**1:22–1:30** — Insert 30 as a black node instead, and the two sides of 20 disagree: 1 against 2. Rule five breaks, rule four does not.

> Caption: Insert 30 as a black node instead, and the two sides of 20 disagree: 1 against 2. Rule five breaks, rule four does not.

Exam-trap caption mode adds: *Checking a tree by looking for two reds in a row passes a tree that breaks rule five. Both checks are needed, at every node.*

## Scene 4. Why a black-height of b needs at least 2 to the b minus 1 keys

*1:30 – 2:00 · objective: Prove by induction that the subtree at x holds at least 2^bh(x) - 1 keys, and read the perfect black trees 1, 3, 7, 15 off that claim.*

**1:30–1:37** — Claim: the subtree rooted at any node x holds at least 2 to the black-height of x, minus 1, keys.

> Caption: Claim: the subtree rooted at any node x holds at least 2 to the black-height of x, minus 1, keys.

**1:37–1:45** — Each child has black-height either bh of x or bh of x minus 1, so each subtree holds at least 2 to the bh minus 1, minus 1 keys.

> Caption: Each child has black-height either bh of x or bh of x minus 1, so each subtree holds at least 2 to the bh minus 1, minus 1 keys.

**1:45–1:52** — Black-height 1 needs 1 key, 2 needs 3, 3 needs 7, 4 needs 15: at each step the smallest tree is a perfect all-black tree.

> Caption: Black-height 1 needs 1 key, 2 needs 3, 3 needs 7, 4 needs 15: at each step the smallest tree is a perfect all-black tree.

**1:52–2:00** — Turned around: n keys force a black-height of at most log base 2 of n plus 1, because 2 to the bh minus 1 cannot exceed n.

> Caption: Turned around: n keys force a black-height of at most log base 2 of n plus 1, because 2 to the bh minus 1 cannot exceed n.

## Scene 5. Height at most twice the black-height

*2:00 – 2:30 · objective: Chain the counting claim with the no-two-reds rule to get h <= 2 log2(n+1), then measure how loose that ceiling is on a real fifteen-key tree.*

**2:00–2:07** — No two reds in a row, so on any path at least half the nodes below the root are black, and the height is at most twice the black-height.

> Caption: No two reds in a row, so on any path at least half the nodes below the root are black, and the height is at most twice the black-height.

**2:07–2:15** — Chaining the two gives height at most 2 log base 2 of n plus 1. For fifteen keys that ceiling is 8.

> Caption: Chaining the two gives height at most 2 log base 2 of n plus 1. For fifteen keys that ceiling is 8.

**2:15–2:22** — The ceiling is loose. This valid fifteen-key tree has height 5, and no fifteen-key red-black tree can be taller.

> Caption: The ceiling is loose. This valid fifteen-key tree has height 5, and no fifteen-key red-black tree can be taller.

**2:22–2:30** — Height 6 needs at least 23 keys, so 5 is the largest height fifteen keys allow. The bound of 8 is never reached.

> Caption: Height 6 needs at least 23 keys, so 5 is the largest height fifteen keys allow. The bound of 8 is never reached.

Exam-trap caption mode adds: *Answering 2 log2(n+1) when the question asks for the maximum height of a red-black tree on n keys is the standard error. The formula is an upper bound; the table is the answer.*

## Scene 6. Why the new node is red

*2:30 – 3:00 · objective: Compare a black insertion with a red one: black breaks rule five on every path, red breaks rule four in at most one place.*

**2:30–2:37** — Insert as a red node. A red node adds no black to any path, so rule five survives by construction.

> Caption: Insert as a red node. A red node adds no black to any path, so rule five survives by construction.

**2:37–2:45** — Insert 30 as black instead, and the paths through it hold one more black than the paths that miss it.

> Caption: Insert 30 as black instead, and the paths through it hold one more black than the paths that miss it.

**2:45–2:52** — A red insertion can only put red beside red. That is one broken rule, in one place, on one path.

> Caption: A red insertion can only put red beside red. That is one broken rule, in one place, on one path.

Exam-trap caption mode adds: *A red insertion never breaks rule five. Saying otherwise leads to repairing black-heights that were never damaged.*

**2:52–3:00** — So the repair is about rule four: a red node whose parent is red, with an uncle on the other side of the grandparent.

> Caption: So the repair is about rule four: a red node whose parent is red, with an uncle on the other side of the grandparent.

## Scene 7. Case one: the uncle is red, so recolour

*3:00 – 3:30 · objective: Repair a red-red fault by recolouring three nodes, see the fault climb to the grandparent, and count the rotations: none.*

**3:00–3:07** — Case one: the uncle is red. Recolour the parent and the uncle black and the grandparent red, and every path through the grandparent keeps its black count.

> Caption: Case one: the uncle is red. Recolour the parent and the uncle black and the grandparent red, and every path through the grandparent keeps its black count.

**3:07–3:15** — The grandparent is now red, so the same fault can reappear one level up. The repair moves up, never down.

> Caption: The grandparent is now red, so the same fault can reappear one level up. The repair moves up, never down.

**3:15–3:22** — On this ten-key build, inserting 6 fires case one at 4 and again at 7: two levels of climbing, no rotation at all.

> Caption: On this ten-key build, inserting 6 fires case one at 4 and again at 7: two levels of climbing, no rotation at all.

**3:22–3:30** — Case one uses no rotation at all. Recolouring and rotating are different moves and are counted separately.

> Caption: Case one uses no rotation at all. Recolouring and rotating are different moves and are counted separately.

Exam-trap caption mode adds: *Counting a recolouring as a rotation, or counting the two rotations of case two plus case three as one, gives the wrong total. Count rotations only.*

## Scene 8. Cases two and three: the uncle is black

*3:30 – 4:00 · objective: Straighten a zig-zag with one rotation, then repair the straight case with one rotation and two recolours, on a real three-step trace.*

**3:30–3:37** — Case two: the uncle is black and the new red sits on the inside, a zig-zag. Rotate at the parent to straighten it.

> Caption: Case two: the uncle is black and the new red sits on the inside, a zig-zag. Rotate at the parent to straighten it.

**3:37–3:45** — Case three: uncle black, red on the outside. Recolour the parent black and the grandparent red, then rotate at the grandparent.

> Caption: Case three: uncle black, red on the outside. Recolour the parent black and the grandparent red, then rotate at the grandparent.

**3:45–3:52** — Inserting 12 into the five-key tree takes exactly that pair: rotate right at 15, then left at 10.

> Caption: Inserting 12 into the five-key tree takes exactly that pair: rotate right at 15, then left at 10.

**3:52–4:00** — One insertion needs at most two rotations, but the recolouring of case one can repeat at every level.

> Caption: One insertion needs at most two rotations, but the recolouring of case one can repeat at every level.

Exam-trap caption mode adds: *A red-black insertion needs at most two rotations, not O(log n). The O(log n) figure belongs to the recolouring of case one.*

## Scene 9. Deleting a red leaf against deleting a black one

*4:00 – 4:30 · objective: See that a red deletion leaves every rule intact while a black deletion leaves one path short, and compare the rotation cost with AVL.*

**4:00–4:07** — Deleting a red leaf changes no black-height and no adjacency, so the tree stays valid. 25 goes and nothing else changes.

> Caption: Deleting a red leaf changes no black-height and no adjacency, so the tree stays valid. 25 goes and nothing else changes.

**4:07–4:15** — Deleting a black leaf leaves one path short of a black node. Rule five breaks and rule four still holds.

> Caption: Deleting a black leaf leaves one path short of a black node. Rule five breaks and rule four still holds.

Exam-trap caption mode adds: *A deletion that keeps the search property can still destroy the tree. Always test rule five after a deletion, not only the ordering.*

**4:15–4:22** — That is why deletion needs a fix-up of its own: the deficit is pushed up to the parent and repaired with a red sibling.

> Caption: That is why deletion needs a fix-up of its own: the deficit is pushed up to the parent and repaired with a red sibling.

**4:22–4:30** — The trade: an AVL deletion may rotate at every level, while a red-black deletion needs at most three rotations.

> Caption: The trade: an AVL deletion may rotate at every level, while a red-black deletion needs at most three rotations.

## Scene 10. The four-step routine and the four traps

*4:30 – 5:00 · objective: Leave with a routine that turns a red-black question into four steps, and the four answers that look right and are not.*

**4:30–4:37** — Step one: check the five rules on the drawn tree, and check rule five at every node, not only at the root.

> Caption: Step one: check the five rules on the drawn tree, and check rule five at every node, not only at the root.

**4:37–4:45** — Step two: for a counting question, use the black-height. At least 2 to the bh minus 1 keys, and height at most twice the bh.

> Caption: Step two: for a counting question, use the black-height. At least 2 to the bh minus 1 keys, and height at most twice the bh.

**4:45–4:52** — Step three: for an insertion, insert red, then name the case from the uncle colour and the zig-zag.

> Caption: Step three: for an insertion, insert red, then name the case from the uncle colour and the zig-zag.

**4:52–5:00** — Trap: a red-black tree is not an AVL tree. This valid red-black tree has a root balance factor of plus 2.

> Caption: Trap: a red-black tree is not an AVL tree. This valid red-black tree has a root balance factor of plus 2.

Exam-trap caption mode adds: *Every AVL tree on up to seven keys admits a red-black colouring in this page’s exhaustive check, but a red-black tree need not be AVL. The two structures are not interchangeable answers.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
