/* ==========================================================================
   red-black-deletion — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   captions.vtt, captions.srt and transcript.md are derived from this file by
   tools/gen-captions.mjs — never edited by hand.

   Every number quoted in a caption is produced by the red-black deletion model
   in lesson.js, which re-checks all five rules after every operation and runs
   an exhaustive sweep over every insertion order of up to six keys.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'deficit', n: 1,
      title: 'Deleting is an accounting problem',
      start: 0, end: 30,
      objective: 'See that one deletion breaks nothing while another breaks exactly one rule, and that the broken quantity is one black missing on every path through the removed node.'
    },
    {
      id: 'where', n: 2,
      title: 'Where the deletion actually happens',
      start: 30, end: 60,
      objective: 'Follow a two-children deletion: the successor moves up, takes the deleted colour, and leaves the deficit at its own old position.'
    },
    {
      id: 'extra', n: 3,
      title: 'The extra black, and the three exits',
      start: 60, end: 90,
      objective: 'Understand the debt as bookkeeping rather than a third colour, and name the three ways the fix-up loop can end.'
    },
    {
      id: 'case1', n: 4,
      title: 'Case 1: the sibling is red',
      start: 90, end: 120,
      objective: 'Repair a red sibling with one rotation and two recolourings, and see that case 1 always hands over to case 2, 3 or 4.'
    },
    {
      id: 'case2', n: 5,
      title: 'Case 2: both nephews black',
      start: 120, end: 150,
      objective: 'Recolour the sibling and climb, twice, on the all-black perfect tree, and watch the root black-height fall from 3 to 2 with no rotation.'
    },
    {
      id: 'case3', n: 6,
      title: 'Case 3: the near nephew is red',
      start: 150, end: 180,
      objective: 'Straighten the near-nephew shape with one rotation so that case 4 can fire, and count two rotations for the pair.'
    },
    {
      id: 'case4', n: 7,
      title: 'Case 4: the far nephew is red',
      start: 180, end: 210,
      objective: 'Pay the debt with one rotation: the sibling takes the parent colour, the parent and far nephew go black, and the loop ends.'
    },
    {
      id: 'trace', n: 8,
      title: 'Four deletions, four answers',
      start: 210, end: 240,
      objective: 'Run four deletions from one ten-key tree and see four different outcomes: two rotations, none, no fix-up at all, and a single recolour.'
    },
    {
      id: 'cost', n: 9,
      title: 'What it costs',
      start: 240, end: 270,
      objective: 'Read the measured rotation counts and case sequences off an exhaustive sweep, and place them against the O(log n) recolouring bound and against AVL.'
    },
    {
      id: 'routine', n: 10,
      title: 'The routine and the traps',
      start: 270, end: 300,
      objective: 'Leave with a four-step routine that turns a deletion question into four decisions, and the five answers that look right and are not.'
    }
  ],

  events: [

    /* ---------- scene 1: the deficit ---------- */
    { id: 'd-1', scene: 'deficit', start: 0, end: 7.5,
      caption: 'Seven keys sit in height 3 with black-height 2: root 20, children 12 and 30, and 5, 10, 15, 25 below.',
      detail: 'The tree is 20 black with children 12 red and 30 black; 12 has 10 black on its left and 15 black on its right; 10 has 5 red on its left; 30 has 25 red on its left. In-order the keys read 5, 10, 12, 15, 20, 25, 30, so it is a search tree. Every path from the root to a NIL leaf passes two black nodes, so rule five holds with black-height 2.',
      narration: 'Seven keys sit in height three with black-height two: root twenty, children twelve and thirty, and five, ten, fifteen, twenty-five below.',
      keyword: 'height 3' },

    { id: 'd-2', scene: 'deficit', start: 7.5, end: 15,
      caption: 'Delete the red leaf 25 and no fix-up runs at all: no path lost a black, so all five rules still hold.',
      detail: 'A red node contributes nothing to any black count, so removing it leaves every path with the same number of blacks. It also has no children, so it cannot create a red-red edge. The tree keeps height 3 and black-height 2.',
      narration: 'Delete the red leaf twenty-five and no fix-up runs at all: no path lost a black, so all five rules still hold.',
      keyword: 'no fix-up runs at all' },

    { id: 'd-3', scene: 'deficit', start: 15, end: 22.5,
      caption: 'Delete the black leaf 15 with the repair skipped and rule five fails at node 12: two blacks on the left, one on the right.',
      detail: 'Paths from 12 through 10 pass the black node 10 and then a NIL leaf: two blacks. Paths from 12 to its right NIL leaf pass only the NIL: one black. Rules one to four still hold, so the tree is a search tree with correct colours and one broken count.',
      narration: 'Delete the black leaf fifteen with the repair skipped and rule five fails at node twelve: two blacks on the left, one on the right.',
      keyword: 'rule five fails at node 12',
      trap: 'A deletion question that asks which rule breaks has one answer for a black node: rule five. Rules one to four are about colours, and a deletion does not change any colour.' },

    { id: 'd-4', scene: 'deficit', start: 22.5, end: 30,
      caption: 'Only rule five can break. The whole lesson repairs one quantity: a single missing black on one path.',
      detail: 'The root is not removed unless the tree has one node, and removing a node cannot put two reds next to each other because the node leaves no children behind. So rule five is the only rule at risk, and the deficit is always exactly one black on the paths that went through the removed node.',
      narration: 'Only rule five can break. The whole lesson repairs one quantity: a single missing black on one path.',
      keyword: 'one single missing black',
      trap: 'Deleting a node with two children does not automatically break anything: the key that actually leaves the tree is the successor, and the successor may be red.' },

    /* ---------- scene 2: where ---------- */
    { id: 'w-1', scene: 'where', start: 30, end: 37.5,
      caption: 'Delete 12 and the key that leaves the tree is not 12: 12 has two children, so the successor 15 is the node that moves.',
      detail: 'A binary search tree cannot simply unlink a node with two children. The usual repair is to move the smallest key of the right subtree, here 15, into the vacated place, and then remove 15 from where it was. Every comparison in the fix-up concerns the moved node, not the key that was asked for.',
      narration: 'Delete twelve and the key that leaves the tree is not twelve: twelve has two children, so the successor fifteen is the node that moves.',
      keyword: 'the successor 15 is the node that moves' },

    { id: 'w-2', scene: 'where', start: 37.5, end: 45,
      caption: '15 takes 12\'s place and 12\'s colour, which was red. The colour travels with the position, not with the key.',
      detail: 'The promoted node inherits the colour of the node it replaces, so the black count on the paths above the position is unchanged. This is why the replacement itself never breaks rule five.',
      narration: 'Fifteen takes twelve\u2019s place and twelve\u2019s colour, which was red. The colour travels with the position, not with the key.',
      keyword: 'takes 12\u2019s colour' },

    { id: 'w-3', scene: 'where', start: 45, end: 52.5,
      caption: 'The missing black is at 15\'s old position — its right NIL — so the repair starts under 15, not where 12 stood.',
      detail: 'Before the move, 15 was black and had a NIL right child. That NIL child is what replaces 15, and it is the node the fix-up is handed. Everything above the moved node is already correct, which is what makes the four cases local.',
      narration: 'The missing black is at fifteen\u2019s old position, its right NIL, so the repair starts under fifteen, not where twelve stood.',
      keyword: 'under 15, not where 12 stood',
      trap: 'Starting the fix-up at the position of the deleted key is the single most common deletion error. The fix-up belongs at the successor\u2019s old position.' },

    { id: 'w-4', scene: 'where', start: 52.5, end: 60,
      caption: 'The moved node\'s old colour decides everything: 15 was black, so a fix-up runs. Had it been red, the deletion would be over.',
      detail: 'Deleting a red node removes no black from any path. So the test is not the colour of the key asked for and not the colour of the promoted node: it is the colour the promoted node had before it moved. This tree needs one case, case 4, and one rotation.',
      narration: 'The moved node\u2019s old colour decides everything: fifteen was black, so a fix-up runs. Had it been red, the deletion would be over.',
      keyword: 'old colour decides everything' },

    /* ---------- scene 3: extra ---------- */
    { id: 'x-1', scene: 'extra', start: 60, end: 67.5,
      caption: 'The fix-up carries one quantity: x is a node one black short, and the debt lives in the loop, not in the node.',
      detail: 'The standard presentation says x has an extra black. Nothing is stored and no third colour exists: x is red or black as usual, and the loop variable says how much black the path through x still owes.',
      narration: 'The fix-up carries one quantity: x is a node one black short, and the debt lives in the loop, not in the node.',
      keyword: 'one black short',
      trap: 'There is no double-black colour. A question that asks how many colours a red-black node stores has answer two, plus one bit — never three.' },

    { id: 'x-2', scene: 'extra', start: 67.5, end: 75,
      caption: 'The loop ends in three ways: x is red, so colour it black; x is the root, so drop the debt; or a rotation case finishes.',
      detail: 'Colouring a red x black adds the missing black to exactly the short paths and changes nothing else. Reaching the root means every path is one black short, so dropping the debt restores rule five with a black-height one smaller. The third exit is case 4.',
      narration: 'The loop ends in three ways: x is red, so colour it black; x is the root, so drop the debt; or a rotation case finishes.',
      keyword: 'three ways' },

    { id: 'x-3', scene: 'extra', start: 75, end: 82.5,
      caption: 'x may be the NIL sentinel, so the code keeps x\'s parent. The sibling is never NIL, because that path would already be short.',
      detail: 'When the removed node had no children, x is the sentinel and has no useful child pointers, which is why the deletion sets the sentinel\'s parent before the fix-up runs. The sibling cannot be the sentinel: rule five before the deletion forces the two sides of the parent to carry the same number of blacks, so a NIL sibling would mean the deficit was never real.',
      narration: 'x may be the NIL sentinel, so the code keeps x\u2019s parent. The sibling is never NIL, because that path would already be short.',
      keyword: 'the sibling is never NIL' },

    { id: 'x-4', scene: 'extra', start: 82.5, end: 90,
      caption: 'The invariant: every path other than the one through x already carries the right number of blacks.',
      detail: 'Each case either moves the debt up one level or cancels it, and each case is checked to leave the black count on every other path unchanged. That is what makes the four cases a complete repair rather than a sequence of guesses.',
      narration: 'The invariant: every path other than the one through x already carries the right number of blacks.',
      keyword: 'already carries the right number' },

    /* ---------- scene 4: case 1 ---------- */
    { id: 'c1-1', scene: 'case1', start: 90, end: 97.5,
      caption: 'Built by inserting 1 to 6: root 2, left child 1, right child 4 with 3 and 5 below it, and 6 under 5. Now delete 1.',
      detail: 'The build produces 2 black with children 1 black and 4 red; 4 has 3 black on the left and 5 black on the right; 5 has 6 red on its right. Deleting 1 leaves x as the NIL left child of 2, and the sibling of x is 4.',
      narration: 'Built by inserting one to six: root two, left child one, right child four with three and five below it, and six under five. Now delete one.',
      keyword: 'delete 1' },

    { id: 'c1-2', scene: 'case1', start: 97.5, end: 105,
      caption: 'Case 1: the sibling 4 is red. Recolour 4 black and 2 red, then rotate left at 2 — one rotation.',
      detail: 'A red sibling must have black children, so the rotation moves it above the parent and leaves a black node as the new sibling. The recolouring keeps the black count on every path: the parent loses a black and the sibling gains one.',
      narration: 'Case one: the sibling four is red. Recolour four black and two red, then rotate left at two, one rotation.',
      keyword: 'recolour 4 black and 2 red' },

    { id: 'c1-3', scene: 'case1', start: 105, end: 112.5,
      caption: 'The new sibling is 3, black with two black children, so case 2 fires: recolour 3 red and climb to the parent, which is red.',
      detail: 'Recolouring the sibling red takes a black from the sibling side as well, so both sides of the parent are one short and the debt moves up. The parent is red, so the loop stops and the final step colours it black. Result: 4 black with children 2 and 5, and 3 red under 2.',
      narration: 'The new sibling is three, black with two black children, so case two fires: recolour three red and climb to the parent, which is red.',
      keyword: 'case 2 fires' },

    { id: 'c1-4', scene: 'case1', start: 112.5, end: 120,
      caption: 'Case 1 finished nothing. It bought a black sibling and handed over: cases 1 and 2, one rotation, height 3 down to 2.',
      detail: 'This is the shape of the whole algorithm. Cases 1 and 3 never end a deletion; they convert the situation into another case. Only case 4 ends it, and case 2 ends it only by reaching a red node or the root.',
      narration: 'Case one finished nothing. It bought a black sibling and handed over: cases one and two, one rotation, height three down to two.',
      keyword: 'finished nothing',
      trap: 'Reporting only case 1 for this deletion is wrong: the repair continues into case 2, and the count of rotations is one, not two.' },

    /* ---------- scene 5: case 2 ---------- */
    { id: 'c2-1', scene: 'case2', start: 120, end: 127.5,
      caption: 'An all-black perfect tree of seven keys: root 8, children 4 and 12, and four leaves. Black-height 3, height 2.',
      detail: 'Every node is black, so every root-to-NIL path passes three black nodes counting the NIL: the root, a child, a leaf, and the NIL. An all-black colouring is valid exactly when the tree is perfect, which this one is.',
      narration: 'An all-black perfect tree of seven keys: root eight, children four and twelve, and four leaves. Black-height three, height two.',
      keyword: 'all-black perfect tree' },

    { id: 'c2-2', scene: 'case2', start: 127.5, end: 135,
      caption: 'Delete the black leaf 2. Its sibling 6 is black and both its children are NIL, so case 2 fires.',
      detail: 'x is the NIL left child of 4, and the sibling 6 is black with two black children. Case 2 takes one black from each side: the sibling becomes red, and the debt moves to the parent 4.',
      narration: 'Delete the black leaf two. Its sibling six is black and both its children are NIL, so case two fires.',
      keyword: 'case 2 fires' },

    { id: 'c2-3', scene: 'case2', start: 135, end: 142.5,
      caption: 'Recolour 6 red and move x up to 4. Sibling 12 has black children too, so case 2 fires a second time.',
      detail: 'The parent 4 is black and is not the root, so the loop continues. At 4 the sibling is 12, black with two black children, which is case 2 again. Case 2 is the only case that can repeat, and it never rotates.',
      narration: 'Recolour six red and move x up to four. Sibling twelve has black children too, so case two fires a second time.',
      keyword: 'case 2 fires a second time' },

    { id: 'c2-4', scene: 'case2', start: 142.5, end: 150,
      caption: 'Recolour 12 red and move x to the root, where the debt is dropped: black-height 3 falls to 2, height stays 2.',
      detail: 'When the debt reaches the root every path is one black short, so removing it restores rule five with a black-height one smaller. The result is 8 black with children 4 black and 12 red, 6 red under 4 and 10 and 14 black under 12. No rotation was performed.',
      narration: 'Recolour twelve red and move x to the root, where the debt is dropped: black-height three falls to two, height stays two.',
      keyword: 'the debt is dropped',
      trap: 'The black-height of the whole tree can change during a deletion. A question that fixes the black-height before the repair and never rechecks it will get the final tree wrong.' },

    /* ---------- scene 6: case 3 ---------- */
    { id: 'c3-1', scene: 'case3', start: 150, end: 157.5,
      caption: 'Built by inserting 1, 2, 4, 3: root 2 black, left child 1 black, right child 4 black with 3 red on its left.',
      detail: 'Inserting 4 after 2 leaves it black because the insertion fix-up rotates at the root. Adding 3 puts a red node on the left of 4. The tree has height 2 and black-height 2.',
      narration: 'Built by inserting one, two, four, three: root two black, left child one black, right child four black with three red on its left.',
      keyword: 'root 2 black' },

    { id: 'c3-2', scene: 'case3', start: 157.5, end: 165,
      caption: 'Delete 1. x is its NIL child; the sibling 4 is black, the near nephew 3 is red, the far nephew is NIL.',
      detail: 'The near nephew is the sibling\'s child on x\'s side; the far nephew is the other one. Here the red child is near and the far child is black, which is exactly case 3.',
      narration: 'Delete one. x is its NIL child; the sibling four is black, the near nephew three is red, the far nephew is NIL.',
      keyword: 'the near nephew 3 is red' },

    { id: 'c3-3', scene: 'case3', start: 165, end: 172.5,
      caption: 'Case 3: recolour 3 black and 4 red, then rotate right at 4. The far nephew is now red.',
      detail: 'The rotation at the sibling moves the red child to the far side and makes the sibling the red one. The black count on the paths through the sibling is unchanged, so nothing new breaks.',
      narration: 'Case three: recolour three black and four red, then rotate right at four. The far nephew is now red.',
      keyword: 'rotate right at 4' },

    { id: 'c3-4', scene: 'case3', start: 172.5, end: 180,
      caption: 'Case 4 finishes it: two rotations in all, and the tree drops from height 2 to height 1 with three keys.',
      detail: 'Case 4 rotates at the parent and recolours, leaving 3 black with children 2 and 4. A deletion that shrinks a tree can also shorten it: three keys in height 1 is the smallest possible red-black tree on three keys.',
      narration: 'Case four finishes it: two rotations in all, and the tree drops from height two to height one with three keys.',
      keyword: 'two rotations in all',
      trap: 'Counting one rotation for case 3 is right, but the deletion is not over: case 3 always hands over to case 4, so the count for the pair is two.' },

    /* ---------- scene 7: case 4 ---------- */
    { id: 'c4-1', scene: 'case4', start: 180, end: 187.5,
      caption: 'Built by inserting 1, 2, 3, 4: root 2 black, left child 1 black, right child 3 black with 4 red on its right.',
      detail: 'The insertion of 4 leaves a red node on the far side of 3, which is the shape case 4 needs. The tree has height 2 and black-height 2.',
      narration: 'Built by inserting one, two, three, four: root two black, left child one black, right child three black with four red on its right.',
      keyword: 'root 2 black' },

    { id: 'c4-2', scene: 'case4', start: 187.5, end: 195,
      caption: 'Delete 1. The sibling 3 is black and the far nephew 4 is red, so case 4 fires at once.',
      detail: 'There is no need for case 1 or case 3 first: the far nephew is already red, which is the one configuration that pays the debt directly.',
      narration: 'Delete one. The sibling three is black and the far nephew four is red, so case four fires at once.',
      keyword: 'case 4 fires at once' },

    { id: 'c4-3', scene: 'case4', start: 195, end: 202.5,
      caption: 'The sibling takes the parent\'s colour, the parent and the far nephew go black, and one rotation at the parent ends it.',
      detail: 'Three colour writes and one rotation. The sibling inherits the parent colour so the paths through the sibling keep their black count; the parent becomes black so the short side gains one; the far nephew becomes black so its own paths keep their count.',
      narration: 'The sibling takes the parent\u2019s colour, the parent and the far nephew go black, and one rotation at the parent ends it.',
      keyword: 'one rotation at the parent' },

    { id: 'c4-4', scene: 'case4', start: 202.5, end: 210,
      caption: 'One rotation and the debt is paid. Case 4 is the only case that ends a deletion by rotating.',
      detail: 'The result is 3 black with children 2 and 4, height 1. The loop is forced to end by setting x to the root, which is a trick of the code rather than a condition of the tree.',
      narration: 'One rotation and the debt is paid. Case four is the only case that ends a deletion by rotating.',
      keyword: 'the debt is paid' },

    /* ---------- scene 8: trace ---------- */
    { id: 't-1', scene: 'trace', start: 210, end: 217.5,
      caption: 'The ten-key build of 5, 10, 9, 1, 2, 8, 7, 4, 3, 6 has height 4. Delete 9: cases 2, 3 and 4, and two rotations.',
      detail: 'The successor of 9 is 10, which is black, so a fix-up runs. The debt climbs once through case 2, then the sibling shape forces case 3, which converts to case 4. Two rotations, and the tree drops to height 3.',
      narration: 'The ten-key build of five, ten, nine, one, two, eight, seven, four, three, six has height four. Delete nine: cases two, three and four, and two rotations.',
      keyword: 'cases 2, 3 and 4' },

    { id: 't-2', scene: 'trace', start: 217.5, end: 225,
      caption: 'Delete 1: case 2 twice and no rotation. The debt walks up to the root and is dropped there.',
      detail: 'Two consecutive case-2 applications, which is why case 2 is called the only repeatable case. The root black-height falls from 3 to 2 while the height stays 3.',
      narration: 'Delete one: case two twice and no rotation. The debt walks up to the root and is dropped there.',
      keyword: 'case 2 twice' },

    { id: 't-3', scene: 'trace', start: 225, end: 232.5,
      caption: 'Delete 7: no fix-up at all, because the successor 8 was red.',
      detail: 'The key that leaves the tree is the successor 8, not 7, and 8 is red. A red node carries no black, so every black count survives and the loop is never entered.',
      narration: 'Delete seven: no fix-up at all, because the successor eight was red.',
      keyword: 'no fix-up at all',
      trap: 'A deletion of a black key can need no repair at all. The colour to test is the moved node\u2019s original colour, not the colour of the key in the question.' },

    { id: 't-4', scene: 'trace', start: 232.5, end: 240,
      caption: 'Delete 4: no case either — the successor 5 was black but its child 6 was red, so one recolour absorbs the debt.',
      detail: 'x is 6, which is red, so the loop condition fails immediately and the final step colours x black. The tree is valid at height 2 and black-height 2. Four deletions, four different outcomes, from one tree.',
      narration: 'Delete four: no case either, the successor five was black but its child six was red, so one recolour absorbs the debt.',
      keyword: 'one recolour absorbs the debt' },

    /* ---------- scene 9: cost ---------- */
    { id: 's-1', scene: 'cost', start: 240, end: 247.5,
      caption: 'The page runs every insertion order of up to six keys and deletes every key from each: 5,039 deletions in all.',
      detail: 'That is every permutation of one to six distinct keys, each built by real insertion with the insertion fix-up, and then every deletion from it with all five rules rechecked afterwards. The sweep is a measurement of this algorithm, not a proof about all trees.',
      narration: 'The page runs every insertion order of up to six keys and deletes every key from each: five thousand and thirty-nine deletions in all.',
      keyword: 'every insertion order',
      trap: 'A measured sweep on small trees is evidence, not a proof. The general bound comes from the argument that only case 2 repeats, and from CLRS 13.4.' },

    { id: 's-2', scene: 'cost', start: 247.5, end: 255,
      caption: '1,080 of them fire at least one case and 3,959 need none. The largest rotation count is 3, seen 108 times.',
      detail: 'The 3,959 include both deletions of red nodes, where no fix-up runs, and deletions whose replacement child was red, where one recolouring ends it. The 108 three-rotation deletions are exactly the ones whose case sequence is 1, 3, 4.',
      narration: 'One thousand and eighty of them fire at least one case and three thousand nine hundred and fifty-nine need none. The largest rotation count is three, seen one hundred and eight times.',
      keyword: 'the largest rotation count is 3' },

    { id: 's-3', scene: 'cost', start: 255, end: 262.5,
      caption: 'Only five case sequences occur in the sweep: 4, 1-2, 1-4, 3-4 and 1-3-4. No bare case 1 and no bare case 3.',
      detail: 'That is not an accident of the sweep. Case 1 recolours and rotates at the parent, which always leaves a black sibling, so another case must follow. Case 3 rotates at the sibling and makes the far nephew red, so case 4 must follow. Neither can finish a deletion on its own.',
      narration: 'Only five case sequences occur in the sweep: four, one-two, one-four, three-four and one-three-four. No bare case one and no bare case three.',
      keyword: 'no bare case 1 and no bare case 3' },

    { id: 's-4', scene: 'cost', start: 262.5, end: 270,
      caption: 'So deletion costs O(log n) recolourings and at most three rotations — against AVL deletion, which may rotate at every level.',
      detail: 'The loop runs once per level because case 2 is the only repeat and it moves x up one level. Cases 1, 3 and 4 each rotate once, and case 4 ends the loop, so the rotations total at most three. Insertion is cheaper still: at most two.',
      narration: 'So deletion costs O of log n recolourings and at most three rotations, against AVL deletion, which may rotate at every level.',
      keyword: 'at most three rotations' },

    /* ---------- scene 10: routine ---------- */
    { id: 'r-1', scene: 'routine', start: 270, end: 277.5,
      caption: 'Step 1: splice. With two children the successor moves up, and the key that leaves the tree is the successor.',
      detail: 'Find the key. If it has fewer than two children, it leaves directly. If it has two, the smallest key of the right subtree takes its place and the successor is the node that leaves.',
      narration: 'Step one: splice. With two children the successor moves up, and the key that leaves the tree is the successor.',
      keyword: 'the successor moves up' },

    { id: 'r-2', scene: 'routine', start: 277.5, end: 285,
      caption: 'Step 2: colour. The moved node takes the deleted node\'s colour — and you must save the colour it had before.',
      detail: 'Two colours matter and they are different: the colour the moved node inherits, which keeps the paths above correct, and the colour it had before the move, which decides whether any fix-up is needed.',
      narration: 'Step two: colour. The moved node takes the deleted node\u2019s colour, and you must save the colour it had before.',
      keyword: 'save the colour it had before',
      trap: 'Confusing the two colours is the second most common deletion error: the inherited colour is used by the tree, the saved colour is used by the test.' },

    { id: 'r-3', scene: 'routine', start: 285, end: 292.5,
      caption: 'Step 3: decide. Old colour red, stop. Child red, colour it black and stop. Otherwise the debt is real.',
      detail: 'Two cheap exits cover most deletions: the moved node was red, or the node now in its place is red. Only when both fail does the loop run.',
      narration: 'Step three: decide. Old colour red, stop. Child red, colour it black and stop. Otherwise the debt is real.',
      keyword: 'the debt is real' },

    { id: 'r-4', scene: 'routine', start: 292.5, end: 300,
      caption: 'Step 4: repair. Read the sibling, then the two nephews; report the cases in order and count rotations only.',
      detail: 'Sibling red is case 1. Sibling black with two black nephews is case 2. Sibling black with a red near nephew is case 3. Sibling black with a red far nephew is case 4. Then report the sequence and the rotation count, which never exceeds three.',
      narration: 'Step four: repair. Read the sibling, then the two nephews; report the cases in order and count rotations only.',
      keyword: 'count rotations only' }
  ]
};
