# Red-Black Deletion: the Four Repairs, the Extra Black and the Three-Rotation Bound — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/red-black-deletion/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Deleting is an accounting problem

*0:00 – 0:30 · objective: See that one deletion breaks nothing while another breaks exactly one rule, and that the broken quantity is one black missing on every path through the removed node.*

**0:00–0:07** — Seven keys sit in height three with black-height two: root twenty, children twelve and thirty, and five, ten, fifteen, twenty-five below.

> Caption: Seven keys sit in height 3 with black-height 2: root 20, children 12 and 30, and 5, 10, 15, 25 below.

**0:07–0:15** — Delete the red leaf twenty-five and no fix-up runs at all: no path lost a black, so all five rules still hold.

> Caption: Delete the red leaf 25 and no fix-up runs at all: no path lost a black, so all five rules still hold.

**0:15–0:22** — Delete the black leaf fifteen with the repair skipped and rule five fails at node twelve: two blacks on the left, one on the right.

> Caption: Delete the black leaf 15 with the repair skipped and rule five fails at node 12: two blacks on the left, one on the right.

Exam-trap caption mode adds: *A deletion question that asks which rule breaks has one answer for a black node: rule five. Rules one to four are about colours, and a deletion does not change any colour.*

**0:22–0:30** — Only rule five can break. The whole lesson repairs one quantity: a single missing black on one path.

> Caption: Only rule five can break. The whole lesson repairs one quantity: a single missing black on one path.

Exam-trap caption mode adds: *Deleting a node with two children does not automatically break anything: the key that actually leaves the tree is the successor, and the successor may be red.*

## Scene 2. Where the deletion actually happens

*0:30 – 1:00 · objective: Follow a two-children deletion: the successor moves up, takes the deleted colour, and leaves the deficit at its own old position.*

**0:30–0:37** — Delete twelve and the key that leaves the tree is not twelve: twelve has two children, so the successor fifteen is the node that moves.

> Caption: Delete 12 and the key that leaves the tree is not 12: 12 has two children, so the successor 15 is the node that moves.

**0:37–0:45** — Fifteen takes twelve’s place and twelve’s colour, which was red. The colour travels with the position, not with the key.

> Caption: 15 takes 12's place and 12's colour, which was red. The colour travels with the position, not with the key.

**0:45–0:52** — The missing black is at fifteen’s old position, its right NIL, so the repair starts under fifteen, not where twelve stood.

> Caption: The missing black is at 15's old position — its right NIL — so the repair starts under 15, not where 12 stood.

Exam-trap caption mode adds: *Starting the fix-up at the position of the deleted key is the single most common deletion error. The fix-up belongs at the successor’s old position.*

**0:52–1:00** — The moved node’s old colour decides everything: fifteen was black, so a fix-up runs. Had it been red, the deletion would be over.

> Caption: The moved node's old colour decides everything: 15 was black, so a fix-up runs. Had it been red, the deletion would be over.

## Scene 3. The extra black, and the three exits

*1:00 – 1:30 · objective: Understand the debt as bookkeeping rather than a third colour, and name the three ways the fix-up loop can end.*

**1:00–1:07** — The fix-up carries one quantity: x is a node one black short, and the debt lives in the loop, not in the node.

> Caption: The fix-up carries one quantity: x is a node one black short, and the debt lives in the loop, not in the node.

Exam-trap caption mode adds: *There is no double-black colour. A question that asks how many colours a red-black node stores has answer two, plus one bit — never three.*

**1:07–1:15** — The loop ends in three ways: x is red, so colour it black; x is the root, so drop the debt; or a rotation case finishes.

> Caption: The loop ends in three ways: x is red, so colour it black; x is the root, so drop the debt; or a rotation case finishes.

**1:15–1:22** — x may be the NIL sentinel, so the code keeps x’s parent. The sibling is never NIL, because that path would already be short.

> Caption: x may be the NIL sentinel, so the code keeps x's parent. The sibling is never NIL, because that path would already be short.

**1:22–1:30** — The invariant: every path other than the one through x already carries the right number of blacks.

> Caption: The invariant: every path other than the one through x already carries the right number of blacks.

## Scene 4. Case 1: the sibling is red

*1:30 – 2:00 · objective: Repair a red sibling with one rotation and two recolourings, and see that case 1 always hands over to case 2, 3 or 4.*

**1:30–1:37** — Built by inserting one to six: root two, left child one, right child four with three and five below it, and six under five. Now delete one.

> Caption: Built by inserting 1 to 6: root 2, left child 1, right child 4 with 3 and 5 below it, and 6 under 5. Now delete 1.

**1:37–1:45** — Case one: the sibling four is red. Recolour four black and two red, then rotate left at two, one rotation.

> Caption: Case 1: the sibling 4 is red. Recolour 4 black and 2 red, then rotate left at 2 — one rotation.

**1:45–1:52** — The new sibling is three, black with two black children, so case two fires: recolour three red and climb to the parent, which is red.

> Caption: The new sibling is 3, black with two black children, so case 2 fires: recolour 3 red and climb to the parent, which is red.

**1:52–2:00** — Case one finished nothing. It bought a black sibling and handed over: cases one and two, one rotation, height three down to two.

> Caption: Case 1 finished nothing. It bought a black sibling and handed over: cases 1 and 2, one rotation, height 3 down to 2.

Exam-trap caption mode adds: *Reporting only case 1 for this deletion is wrong: the repair continues into case 2, and the count of rotations is one, not two.*

## Scene 5. Case 2: both nephews black

*2:00 – 2:30 · objective: Recolour the sibling and climb, twice, on the all-black perfect tree, and watch the root black-height fall from 3 to 2 with no rotation.*

**2:00–2:07** — An all-black perfect tree of seven keys: root eight, children four and twelve, and four leaves. Black-height three, height two.

> Caption: An all-black perfect tree of seven keys: root 8, children 4 and 12, and four leaves. Black-height 3, height 2.

**2:07–2:15** — Delete the black leaf two. Its sibling six is black and both its children are NIL, so case two fires.

> Caption: Delete the black leaf 2. Its sibling 6 is black and both its children are NIL, so case 2 fires.

**2:15–2:22** — Recolour six red and move x up to four. Sibling twelve has black children too, so case two fires a second time.

> Caption: Recolour 6 red and move x up to 4. Sibling 12 has black children too, so case 2 fires a second time.

**2:22–2:30** — Recolour twelve red and move x to the root, where the debt is dropped: black-height three falls to two, height stays two.

> Caption: Recolour 12 red and move x to the root, where the debt is dropped: black-height 3 falls to 2, height stays 2.

Exam-trap caption mode adds: *The black-height of the whole tree can change during a deletion. A question that fixes the black-height before the repair and never rechecks it will get the final tree wrong.*

## Scene 6. Case 3: the near nephew is red

*2:30 – 3:00 · objective: Straighten the near-nephew shape with one rotation so that case 4 can fire, and count two rotations for the pair.*

**2:30–2:37** — Built by inserting one, two, four, three: root two black, left child one black, right child four black with three red on its left.

> Caption: Built by inserting 1, 2, 4, 3: root 2 black, left child 1 black, right child 4 black with 3 red on its left.

**2:37–2:45** — Delete one. x is its NIL child; the sibling four is black, the near nephew three is red, the far nephew is NIL.

> Caption: Delete 1. x is its NIL child; the sibling 4 is black, the near nephew 3 is red, the far nephew is NIL.

**2:45–2:52** — Case three: recolour three black and four red, then rotate right at four. The far nephew is now red.

> Caption: Case 3: recolour 3 black and 4 red, then rotate right at 4. The far nephew is now red.

**2:52–3:00** — Case four finishes it: two rotations in all, and the tree drops from height two to height one with three keys.

> Caption: Case 4 finishes it: two rotations in all, and the tree drops from height 2 to height 1 with three keys.

Exam-trap caption mode adds: *Counting one rotation for case 3 is right, but the deletion is not over: case 3 always hands over to case 4, so the count for the pair is two.*

## Scene 7. Case 4: the far nephew is red

*3:00 – 3:30 · objective: Pay the debt with one rotation: the sibling takes the parent colour, the parent and far nephew go black, and the loop ends.*

**3:00–3:07** — Built by inserting one, two, three, four: root two black, left child one black, right child three black with four red on its right.

> Caption: Built by inserting 1, 2, 3, 4: root 2 black, left child 1 black, right child 3 black with 4 red on its right.

**3:07–3:15** — Delete one. The sibling three is black and the far nephew four is red, so case four fires at once.

> Caption: Delete 1. The sibling 3 is black and the far nephew 4 is red, so case 4 fires at once.

**3:15–3:22** — The sibling takes the parent’s colour, the parent and the far nephew go black, and one rotation at the parent ends it.

> Caption: The sibling takes the parent's colour, the parent and the far nephew go black, and one rotation at the parent ends it.

**3:22–3:30** — One rotation and the debt is paid. Case four is the only case that ends a deletion by rotating.

> Caption: One rotation and the debt is paid. Case 4 is the only case that ends a deletion by rotating.

## Scene 8. Four deletions, four answers

*3:30 – 4:00 · objective: Run four deletions from one ten-key tree and see four different outcomes: two rotations, none, no fix-up at all, and a single recolour.*

**3:30–3:37** — The ten-key build of five, ten, nine, one, two, eight, seven, four, three, six has height four. Delete nine: cases two, three and four, and two rotations.

> Caption: The ten-key build of 5, 10, 9, 1, 2, 8, 7, 4, 3, 6 has height 4. Delete 9: cases 2, 3 and 4, and two rotations.

**3:37–3:45** — Delete one: case two twice and no rotation. The debt walks up to the root and is dropped there.

> Caption: Delete 1: case 2 twice and no rotation. The debt walks up to the root and is dropped there.

**3:45–3:52** — Delete seven: no fix-up at all, because the successor eight was red.

> Caption: Delete 7: no fix-up at all, because the successor 8 was red.

Exam-trap caption mode adds: *A deletion of a black key can need no repair at all. The colour to test is the moved node’s original colour, not the colour of the key in the question.*

**3:52–4:00** — Delete four: no case either, the successor five was black but its child six was red, so one recolour absorbs the debt.

> Caption: Delete 4: no case either — the successor 5 was black but its child 6 was red, so one recolour absorbs the debt.

## Scene 9. What it costs

*4:00 – 4:30 · objective: Read the measured rotation counts and case sequences off an exhaustive sweep, and place them against the O(log n) recolouring bound and against AVL.*

**4:00–4:07** — The page runs every insertion order of up to six keys and deletes every key from each: five thousand and thirty-nine deletions in all.

> Caption: The page runs every insertion order of up to six keys and deletes every key from each: 5,039 deletions in all.

Exam-trap caption mode adds: *A measured sweep on small trees is evidence, not a proof. The general bound comes from the argument that only case 2 repeats, and from CLRS 13.4.*

**4:07–4:15** — One thousand and eighty of them fire at least one case and three thousand nine hundred and fifty-nine need none. The largest rotation count is three, seen one hundred and eight times.

> Caption: 1,080 of them fire at least one case and 3,959 need none. The largest rotation count is 3, seen 108 times.

**4:15–4:22** — Only five case sequences occur in the sweep: four, one-two, one-four, three-four and one-three-four. No bare case one and no bare case three.

> Caption: Only five case sequences occur in the sweep: 4, 1-2, 1-4, 3-4 and 1-3-4. No bare case 1 and no bare case 3.

**4:22–4:30** — So deletion costs O of log n recolourings and at most three rotations, against AVL deletion, which may rotate at every level.

> Caption: So deletion costs O(log n) recolourings and at most three rotations — against AVL deletion, which may rotate at every level.

## Scene 10. The routine and the traps

*4:30 – 5:00 · objective: Leave with a four-step routine that turns a deletion question into four decisions, and the five answers that look right and are not.*

**4:30–4:37** — Step one: splice. With two children the successor moves up, and the key that leaves the tree is the successor.

> Caption: Step 1: splice. With two children the successor moves up, and the key that leaves the tree is the successor.

**4:37–4:45** — Step two: colour. The moved node takes the deleted node’s colour, and you must save the colour it had before.

> Caption: Step 2: colour. The moved node takes the deleted node's colour — and you must save the colour it had before.

Exam-trap caption mode adds: *Confusing the two colours is the second most common deletion error: the inherited colour is used by the tree, the saved colour is used by the test.*

**4:45–4:52** — Step three: decide. Old colour red, stop. Child red, colour it black and stop. Otherwise the debt is real.

> Caption: Step 3: decide. Old colour red, stop. Child red, colour it black and stop. Otherwise the debt is real.

**4:52–5:00** — Step four: repair. Read the sibling, then the two nephews; report the cases in order and count rotations only.

> Caption: Step 4: repair. Read the sibling, then the two nephews; report the cases in order and count rotations only.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
