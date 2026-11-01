# AVL Trees: the Balance Invariant, the Four Rotations and the Height Bound — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/avl-trees-and-rotations/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A search tree is only as fast as its height

*0:00 – 0:30 · objective: See that a plain binary search tree promises O(h) and not O(log n), that the input order decides h, and that the six keys 9, 6, 5, 8, 7, 10 can be held in height 5 or height 2.*

**0:00–0:07** — Six keys. Inserted in sorted order they make a chain five levels deep, and a search may visit every one of them.

> Caption: Six keys. Inserted in sorted order they make a chain five levels deep, and a search may visit every one of them.

Exam-trap caption mode adds: *A binary search tree does not promise logarithmic search. It promises search in time proportional to its height, and the input decides the height.*

**0:07–0:15** — The same six keys, inserted as 9, 6, 5, 8, 7, 10, sit in height 2. Every search now visits at most three nodes.

> Caption: The same six keys, inserted as 9, 6, 5, 8, 7, 10, sit in height 2. Every search now visits at most three nodes.

**0:15–0:22** — An AVL tree keeps the height logarithmic no matter what order the keys arrive in. That is the whole promise.

> Caption: An AVL tree keeps the height logarithmic no matter what order the keys arrive in. That is the whole promise.

**0:22–0:30** — It buys that with one extra rule, and the rule is local: at every node, the two subtree heights differ by at most one.

> Caption: It buys that with one extra rule, and the rule is local: at every node, the two subtree heights differ by at most one.

## Scene 2. The balance factor and the height convention

*0:30 – 1:00 · objective: Fix the height convention (empty = -1, leaf = 0), define the balance factor as height(right) minus height(left), and state the AVL rule as a condition on every node.*

**0:30–0:37** — Height is a convention before it is a number. An empty tree has height minus one; a single node has height zero.

> Caption: Height is a convention before it is a number. An empty tree has height minus one; a single node has height zero.

Exam-trap caption mode adds: *Questions state their convention. With "height of a single node is 0" the answers to a height question are one less than with "number of levels".*

**0:37–0:45** — The balance factor of a node is the height of its right subtree minus the height of its left subtree.

> Caption: The balance factor of a node is the height of its right subtree minus the height of its left subtree.

**0:45–0:52** — The AVL condition is that this factor lies between minus one and plus one, at every node, at all times.

> Caption: The AVL condition is that this factor lies between minus one and plus one, at every node, at all times.

**0:52–1:00** — A node whose factor reaches plus or minus two is the only thing a rotation exists to fix.

> Caption: A node whose factor reaches plus or minus two is the only thing a rotation exists to fix.

## Scene 3. LL and RR: one rotation, three pointer writes

*1:00 – 1:30 · objective: Repair an outside imbalance with one rotation, and see the sign pattern that identifies it before any pointer moves.*

**1:00–1:07** — Insert 30, then 20, then 10. Node 30 ends up with factor minus two: two levels of left child in a row.

> Caption: Insert 30, then 20, then 10. Node 30 ends up with factor minus two: two levels of left child in a row.

Exam-trap caption mode adds: *LL does not mean "the inserted key was smaller than its parent". It means the imbalance path goes left twice from the unbalanced node.*

**1:07–1:15** — One right rotation at 30 fixes it. The middle key 20 rises, and 10 and 30 become its children.

> Caption: One right rotation at 30 fixes it. The middle key 20 rises, and 10 and 30 become its children.

**1:15–1:22** — The mirror case is RR: 10, 20, 30 gives factor plus two at 10, and one left rotation lifts 20.

> Caption: The mirror case is RR: 10, 20, 30 gives factor plus two at 10, and one left rotation lifts 20.

**1:22–1:30** — Both single cases move three pointers. Nothing is copied, nothing is allocated, and the in-order walk is untouched.

> Caption: Both single cases move three pointers. Nothing is copied, nothing is allocated, and the in-order walk is untouched.

## Scene 4. LR and RL: the zig-zag needs two rotations

*1:30 – 2:00 · objective: Repair an inside imbalance with two rotations, and see why the first rotation only converts the case into LL or RR.*

**1:30–1:37** — Now insert 30, then 10, then 20. The path goes left and then right: a zig-zag, not a straight line.

> Caption: Now insert 30, then 10, then 20. The path goes left and then right: a zig-zag, not a straight line.

Exam-trap caption mode adds: *The case is decided by the grandchild side, not by the key values. LR and RL are mirror images and are the two cases a single rotation cannot repair.*

**1:37–1:45** — A right rotation at 30 alone would leave the zig-zag intact. So first rotate left at the child 10.

> Caption: A right rotation at 30 alone would leave the zig-zag intact. So first rotate left at the child 10.

**1:45–1:52** — Now the case is LL, so rotate right at 30. Two rotations, and the same tree as the single cases.

> Caption: Now the case is LL, so rotate right at 30. Two rotations, and the same tree as the single cases.

**1:52–2:00** — So a double rotation is two single rotations, and both must be counted if the question asks for a count.

> Caption: So a double rotation is two single rotations, and both must be counted if the question asks for a count.

Exam-trap caption mode adds: *One rotation-event, two rotations. A question that counts rotations and a question that counts repairs give different numbers for the same insertion.*

## Scene 5. What a rotation actually does

*2:00 – 2:30 · objective: Write the three pointer assignments of a right rotation and prove that the in-order sequence is unchanged, so no search path is broken.*

**2:00–2:07** — Take 30 with left child 20, and 20 has a right child 25. Node 30 has factor minus two.

> Caption: Take 30 with left child 20, and 20 has a right child 25. Node 30 has factor minus two.

**2:07–2:15** — A right rotation is three assignments: name the left child, hand its right subtree to the old root, hang the old root beneath it.

> Caption: A right rotation is three assignments: name the left child, hand its right subtree to the old root, hang the old root beneath it.

**2:15–2:22** — The in-order walk before and after is 20 25 30 both times. That is the proof the search property survives.

> Caption: The in-order walk before and after is 20 25 30 both times. That is the proof the search property survives.

Exam-trap caption mode adds: *A rotation is not a re-sort. If a candidate answer changes the in-order sequence, the answer is wrong regardless of how balanced the shape looks.*

**2:22–2:30** — So the repair is O(1) on top of an O(log n) descent. The rotation never dominates the cost.

> Caption: So the repair is O(1) on top of an O(log n) descent. The rotation never dominates the cost.

## Scene 6. Insert 9, 6, 5, 8, 7, 10 and watch the repairs

*2:30 – 3:00 · objective: Run six insertions, log every repair, and see the height never pass 2 while the in-order sequence stays 5 6 7 8 9 10.*

**2:30–2:37** — Insert 9, then 6. Nothing breaks: 9 leans left by one, which is legal.

> Caption: Insert 9, then 6. Nothing breaks: 9 leans left by one, which is legal.

**2:37–2:45** — Insert 5 and 9 reaches minus two. LL at 9, so one right rotation: 6 becomes the root.

> Caption: Insert 5 and 9 reaches minus two. LL at 9, so one right rotation: 6 becomes the root.

**2:45–2:52** — Insert 8, then 7. Now 8 has a left child 7 beneath 9, so 9 breaks again: LL, one more rotation.

> Caption: Insert 8, then 7. Now 8 has a left child 7 beneath 9, so 9 breaks again: LL, one more rotation.

**2:52–3:00** — Insert 10 and the root 6 leans right, so one left rotation: 8 becomes the root at height 2.

> Caption: Insert 10 and the root 6 leans right, so one left rotation: 8 becomes the root at height 2.

## Scene 7. Insertion needs one repair; deletion may need several

*3:00 – 3:30 · objective: Explain why a repaired insertion restores the old subtree height while a deletion can shorten it, and count both on real trees.*

**3:00–3:07** — The six-key run needed three repairs: none, none, one, none, one, one.

> Caption: The six-key run needed three repairs: none, none, one, none, one, one.

**3:07–3:15** — Why one is enough for an insertion: the repaired subtree comes back to its old height, so no ancestor can break.

> Caption: Why one is enough for an insertion: the repaired subtree comes back to its old height, so no ancestor can break.

Exam-trap caption mode adds: *"At most one rotation per insertion" is about repairs. A double rotation is still two single rotations, so the count of rotations can be two.*

**3:15–3:22** — A deletion is different: the repaired subtree can come back shorter, so the imbalance travels up the path.

> Caption: A deletion is different: the repaired subtree can come back shorter, so the imbalance travels up the path.

**3:22–3:30** — So deletion costs up to O(log n) rotations and insertion O(1). Both are still O(log n) in total.

> Caption: So deletion costs up to O(log n) rotations and insertion O(1). Both are still O(log n) in total.

## Scene 8. How tall can an AVL tree get?

*3:30 – 4:00 · objective: Derive N(h) = N(h-1) + N(h-2) + 1, identify it as F(h+3) - 1, and read off both "minimum nodes at height h" and "maximum height on n nodes".*

**3:30–3:37** — To bound the height, ask the reverse question: how few nodes can a legal tree of height h have?

> Caption: To bound the height, ask the reverse question: how few nodes can a legal tree of height h have?

**3:37–3:45** — So N of h is N of h minus one, plus N of h minus two, plus one for the root: 1, 2, 4, 7, 12, 20, 33.

> Caption: So N of h is N of h minus one, plus N of h minus two, plus one for the root: 1, 2, 4, 7, 12, 20, 33.

**3:45–3:52** — A 7-key AVL tree can therefore be three tall, and no taller: N of 3 is exactly 7.

> Caption: A 7-key AVL tree can therefore be three tall, and no taller: N of 3 is exactly 7.

Exam-trap caption mode adds: *The perfect-tree formula 2 to the h plus 1 minus 1 is the MAXIMUM number of nodes at height h, not the minimum. Using it here gives 15 instead of 7.*

**3:52–4:00** — Solving the recurrence gives height at most 1.44 log base 2 of n plus 2, minus a third: logarithmic, with a constant near 1.44.

> Caption: Solving the recurrence gives height at most 1.44 log base 2 of n plus 2, minus a third: logarithmic, with a constant near 1.44.

## Scene 9. AVL is not complete, and a balanced root is not balanced

*4:00 – 4:30 · objective: Separate perfect, complete and AVL with two counterexamples, and see why the rule must be checked at every node rather than at the root.*

**4:00–4:07** — This tree on the left is AVL and is not complete. Nine keys, height 3, every factor inside the window.

> Caption: This tree on the left is AVL and is not complete. Nine keys, height 3, every factor inside the window.

**4:07–4:15** — And this one has a perfectly balanced root, factor zero, while two nodes below it are off by two.

> Caption: And this one has a perfectly balanced root, factor zero, while two nodes below it are off by two.

Exam-trap caption mode adds: *The AVL rule quantifies over every node. A root-only check is the single most common way to mark a non-AVL tree as AVL.*

**4:15–4:22** — Three different promises: perfect is a shape with all levels full, complete fills the last level from the left, AVL only bounds heights.

> Caption: Three different promises: perfect is a shape with all levels full, complete fills the last level from the left, AVL only bounds heights.

**4:22–4:30** — So the exam-safe check is a bottom-up pass: compute every height from the leaves, then test every factor in one walk.

> Caption: So the exam-safe check is a bottom-up pass: compute every height from the leaves, then test every factor in one walk.

## Scene 10. The four-step routine and the four traps

*4:30 – 5:00 · objective: Leave with a routine that turns any AVL question into four steps, and the four slips that produce a wrong answer.*

**4:30–4:37** — The routine, four steps: draw the insertions in the given order, mark heights and factors as you go.

> Caption: The routine, four steps: draw the insertions in the given order, mark heights and factors as you go.

**4:37–4:45** — Then repair at the lowest node with factor plus or minus two, using its child and grandchild sides to name the case.

> Caption: Then repair at the lowest node with factor plus or minus two, using its child and grandchild sides to name the case.

**4:45–4:52** — Trap one: repairing at the root when the lowest break is deeper. Trap two: one rotation on a zig-zag.

> Caption: Trap one: repairing at the root when the lowest break is deeper. Trap two: one rotation on a zig-zag.

**4:52–5:00** — Trap three: reading balanced as complete, or checking only the root. Trap four: using the perfect-tree formula for minimum nodes.

> Caption: Trap three: reading balanced as complete, or checking only the root. Trap four: using the perfect-tree formula for minimum nodes.

Exam-trap caption mode adds: *2 to the h plus 1 minus 1 is the maximum nodes at height h. The minimum is N(h), and confusing them turns 7 into 15.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
