/* ==========================================================================
   group-actions-orbits-and-burnside — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   captions.vtt, captions.srt and transcript.md are derived from this file by
   tools/gen-captions.mjs — never edited by hand.

   Every figure quoted in a caption is computed by the model in lesson.js and
   asserted there: the orbit and stabiliser of every point of every action in
   the catalogue (355 orbit-stabiliser tests), the fixed-point counts of all
   eight symmetries of the square on its 16 two-colourings, the 81
   three-colourings, the 64 two-coloured six-bead necklaces under rotation and
   under the full symmetry group, the k-colour formulas checked against brute
   force for k = 1..4, the conjugacy classes of S3 and D4, and the two naive
   divisions that give the wrong answer.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'act',
      n: 1,
      title: 'A group that moves things',
      start: 0, end: 30,
      objective: 'See the eight symmetries of a square as eight ways of moving its corners, and see one corner reach all four: the group acts on the object.'
    },
    {
      id: 'axioms',
      n: 2,
      title: 'The two axioms an action must obey',
      start: 30, end: 60,
      objective: 'State an action as a map from group and point to point, with the identity fixing every point and the group law composing, and check both on real tables.'
    },
    {
      id: 'orbit',
      n: 3,
      title: 'The orbit: everything a point can reach',
      start: 60, end: 90,
      objective: 'Define the orbit of a point, see that orbits are the classes of an equivalence relation and so partition the set, and see two orbits of different sizes inside one action.'
    },
    {
      id: 'stab',
      n: 4,
      title: 'The stabiliser: the symmetries that leave a point alone',
      start: 90, end: 120,
      objective: 'Define the stabiliser of a point, verify from the table that it is a subgroup, and see that it is not normal in general: conjugating it gives the stabiliser of the moved point.'
    },
    {
      id: 'ost',
      n: 5,
      title: 'Orbit-stabiliser: the group size factors',
      start: 120, end: 150,
      objective: 'State and use |G| = |orbit| times |stabiliser|, verified on every point of every action, and read the two extreme cases: a transitive action and a free one.'
    },
    {
      id: 'burnside',
      n: 6,
      title: "Burnside's lemma: average the fixed points",
      start: 150, end: 180,
      objective: 'Count orbits by averaging the number of points each group element fixes, watch the naive division fail, and see the average agree with a brute-force orbit count.'
    },
    {
      id: 'necklace',
      n: 7,
      title: 'Necklaces and bracelets: six beads, two colours',
      start: 180, end: 210,
      objective: 'Run the average on 64 two-coloured six-bead strings under the six rotations (14) and under the twelve symmetries (13), and see why 64 divided by 6 is not the answer.'
    },
    {
      id: 'colours',
      n: 8,
      title: 'k colours on a square: the two formulas',
      start: 210, end: 240,
      objective: 'Derive (k^4 + k^2 + 2k)/4 for rotations and (k^4 + 2k^3 + 3k^2 + 2k)/8 for the full symmetry group, and check both against brute force for k = 1 to 4.'
    },
    {
      id: 'known',
      n: 9,
      title: 'Two actions you already know',
      start: 240, end: 270,
      objective: 'Recognise left multiplication on the group itself (Cayley) and conjugation on the group itself (conjugacy classes), and see Burnside count the classes of S3 and D4.'
    },
    {
      id: 'exam',
      n: 10,
      title: 'How GATE asks it, and the four traps',
      start: 270, end: 300,
      objective: 'Reduce a counting question to naming the group, the set and the fixed-point counts, and avoid the four traps: naive division, wrong group, swapped roles, normal stabiliser.'
    }
  ],

  events: [

    /* ---------------- scene 1: act ---------------- */
    { id: 'e1', scene: 'act', start: 0, end: 6,
      caption: 'A square has eight symmetries. Four turn it, four flip it. Each one moves the four corners around.',
      detail: 'The four rotations are the identity, a quarter turn, a half turn and a three-quarter turn. The four reflections are across the two diagonals and across the two lines through midpoints of opposite sides. Together they form a group of order eight, written D4, because the composition of two symmetries is again a symmetry and every symmetry can be undone.',
      narration: 'A square has eight symmetries. Four turn it, four flip it. Each one moves the four corners around.',
      keyword: 'eight symmetries' },

    { id: 'e2', scene: 'act', start: 6, end: 12,
      caption: 'Follow one corner. A quarter turn sends it to its neighbour, a half turn to the opposite corner, a flip across a diagonal keeps it still.',
      detail: 'The corner labelled 0 reaches 1 under the quarter turn, 2 under the half turn and 3 under the three-quarter turn, and stays at 0 under the identity and under the reflection across the diagonal through 0 and 2. So the eight symmetries send this one corner to only four places, and each place is reached twice.',
      narration: 'Follow one corner. A quarter turn sends it to its neighbour, a half turn to the opposite corner, a flip across a diagonal keeps it still.',
      keyword: 'follow one corner' },

    { id: 'e3', scene: 'act', start: 12, end: 18,
      caption: 'That is what an action is: a group whose elements move the points of a set. The group is D4, the set is the four corners.',
      detail: 'The group on its own is an abstract thing with a multiplication. To act, it needs something to move. Here the set is the four corners of the square, and each of the eight symmetries is a rule that sends every corner to a corner. The set is not the group, and the two are not confused anywhere on this page.',
      narration: 'That is what an action is: a group whose elements move the points of a set. The group is D4, the set is the four corners.',
      keyword: 'a group whose elements move the points' },

    { id: 'e4', scene: 'act', start: 18, end: 24,
      caption: 'Change the set and the same group behaves differently. On the six segments, the four sides stay together and the two diagonals stay together.',
      detail: 'The six segments are the four sides and the two diagonals. No symmetry can send a side to a diagonal, because a side has length one and a diagonal has length the square root of two, and a symmetry preserves distances. So this one action has two separate orbits: four segments in one, two in the other.',
      narration: 'Change the set and the same group behaves differently. On the six segments, the four sides stay together and the two diagonals stay together.',
      keyword: 'change the set' },

    { id: 'e5', scene: 'act', start: 24, end: 30,
      caption: 'So one group can act on many sets, and the picture it produces depends on the set, not on the group alone.',
      detail: 'The same eight symmetries act on the four corners (one block of four), on the six segments (four and two), on the sixteen two-colourings of the corners (six blocks), and on the group itself. Each is a different action of the same group. Every question in this lesson is really two questions: which group, and which set.',
      narration: 'So one group can act on many sets, and the picture it produces depends on the set, not on the group alone.',
      keyword: 'depends on the set' },

    /* ---------------- scene 2: axioms ---------------- */
    { id: 'e6', scene: 'axioms', start: 30, end: 36,
      caption: 'Formally: a map that takes a group element and a point to a point, written g dot x, obeying two rules.',
      detail: 'Write the group G and the set X. An action is a function from pairs (g, x) to a point of X, written g dot x. Nothing else is required: no bijection between G and X, no shared structure. The two rules below are the whole definition, and they are what makes the word action mean something.',
      narration: 'Formally: a map that takes a group element and a point to a point, written g dot x, obeying two rules.',
      keyword: 'two rules' },

    { id: 'e7', scene: 'axioms', start: 36, end: 42,
      caption: 'Rule one: the identity moves nothing. The identity element leaves every point exactly where it was.',
      detail: 'The identity is the do-nothing symmetry. If it moved a point, the map would not be describing symmetry at all. This rule is checked for every point of every action on this page: 16 colourings, 6 segments, 4 corners, and the group acting on itself, all fixed by the identity.',
      narration: 'Rule one: the identity moves nothing. The identity element leaves every point exactly where it was.',
      keyword: 'the identity moves nothing' },

    { id: 'e8', scene: 'axioms', start: 42, end: 48,
      caption: 'Rule two: doing g after h is the same as doing the product gh once. Move first, then compose, or compose first, then move.',
      detail: 'This is the rule that ties the group multiplication to the moving. Without it, any assignment of points to points would qualify and the group structure would be unused. With it, the whole theory follows: orbits, stabilisers, the size identity and the counting theorem.',
      narration: 'Rule two: doing g after h is the same as doing the product gh once. Move first, then compose, or compose first, then move.',
      keyword: 'doing g after h' },

    { id: 'e9', scene: 'axioms', start: 48, end: 54,
      caption: 'Both rules are checked here by building the full table of moves and testing every triple, not by trusting the picture.',
      detail: 'Each action on the page is stored as a table with one row per group element and one column per point. The identity row must be the identity map, and for every pair of group elements the composed row must equal the row-by-row composition. A failure would throw at load rather than draw a wrong picture.',
      narration: 'Both rules are checked here by building the full table of moves and testing every triple, not by trusting the picture.',
      keyword: 'every triple' },

    { id: 'e10', scene: 'axioms', start: 54, end: 60,
      caption: 'Two rules, and everything else in this lesson is a consequence: orbits, stabilisers, the size identity, and the counting formula.',
      detail: 'The rest of the page never re-checks the axioms. It reads the validated table and derives: the orbit as the reachable set, the stabiliser as the fixed row entries, their product as the group order, and the average of fixed points as the number of orbits.',
      narration: 'Two rules, and everything else in this lesson is a consequence: orbits, stabilisers, the size identity, and the counting formula.',
      keyword: 'everything else is a consequence' },

    /* ---------------- scene 3: orbit ---------------- */
    { id: 'e11', scene: 'orbit', start: 60, end: 66,
      caption: 'The orbit of a point is everything it can reach: apply every element of the group and collect the results.',
      detail: 'The orbit of x is the set of all g dot x as g runs over the group. On the corners it is all four corners. On the six segments it is the four sides for a side, and the two diagonals for a diagonal. The orbit is the answer to "what else is this point equivalent to".',
      narration: 'The orbit of a point is everything it can reach: apply every element of the group and collect the results.',
      keyword: 'everything it can reach' },

    { id: 'e12', scene: 'orbit', start: 66, end: 72,
      caption: 'Being in the same orbit is an equivalence relation, so the orbits split the set into disjoint blocks with nothing left over.',
      detail: 'Reflexive because the identity stays put, symmetric because a symmetry can be undone, transitive because two symmetries compose. An equivalence relation always partitions. So the sixteen two-colourings break into six blocks of sizes that add to sixteen, and no colouring sits in two blocks.',
      narration: 'Being in the same orbit is an equivalence relation, so the orbits split the set into disjoint blocks with nothing left over.',
      keyword: 'disjoint blocks' },

    { id: 'e13', scene: 'orbit', start: 72, end: 78,
      caption: 'On the six segments there are two orbits, of sizes four and two. Different sizes in one action are normal, not a mistake.',
      detail: 'A common wrong instinct is that all orbits must be the same size. They need not be: the stabilisers differ, and the size identity below shows that orbit size and stabiliser size trade off against each other inside a fixed group. Four times two is eight, and two times four is eight.',
      narration: 'On the six segments there are two orbits, of sizes four and two. Different sizes in one action are normal, not a mistake.',
      keyword: 'two orbits',
      trap: 'Assuming all orbits have the same size. On the six segments of a square they are four and two, because a side and a diagonal have different stabilisers.' },

    { id: 'e14', scene: 'orbit', start: 78, end: 84,
      caption: 'A transitive action is one with a single orbit: every point reaches every point. The corners of the square are transitive.',
      detail: 'D4 on four corners is transitive: any corner can be carried to any other, because the rotations alone already cycle through all four. D4 on the six segments is not transitive: no symmetry carries a side to a diagonal. Transitive is a property of the action, never of the group by itself.',
      narration: 'A transitive action is one with a single orbit: every point reaches every point. The corners of the square are transitive.',
      keyword: 'transitive' },

    { id: 'e15', scene: 'orbit', start: 84, end: 90,
      caption: 'The count of orbits is the number of genuinely different objects once symmetry is ignored. That count is the thing this lesson computes.',
      detail: 'Six blocks of two-colourings means six genuinely different paintings of the square, if a painting and its rotated copy are called the same. That is exactly the "how many distinct" question an exam asks. The rest of the lesson is one reliable way to get that number without listing every block by hand.',
      narration: 'The count of orbits is the number of genuinely different objects once symmetry is ignored. That count is the thing this lesson computes.',
      keyword: 'genuinely different objects' },

    /* ---------------- scene 4: stab ---------------- */
    { id: 'e16', scene: 'stab', start: 90, end: 96,
      caption: 'The stabiliser of a point is the set of group elements that leave it exactly where it is.',
      detail: 'For corner 0 of the square the stabiliser holds two elements: the identity, and the reflection across the diagonal through corners 0 and 2. Six of the eight symmetries move that corner. The stabiliser is the measure of how much symmetry the point itself has.',
      narration: 'The stabiliser of a point is the set of group elements that leave it exactly where it is.',
      keyword: 'leave it exactly where it is' },

    { id: 'e17', scene: 'stab', start: 96, end: 102,
      caption: 'The stabiliser is always a subgroup. It contains the identity, and if two elements fix the point then so does their product and their inverse.',
      detail: 'Closure: if g and h both fix x then gh fixes x, because h puts x back at x and g leaves it there. Inverses: if g fixes x then applying g to both sides of g dot x equals x gives x equals g inverse dot x. So the stabiliser is closed under the group operation and under inverses, and it contains the identity by rule one.',
      narration: 'The stabiliser is always a subgroup. It contains the identity, and if two elements fix the point then so does their product and their inverse.',
      keyword: 'always a subgroup' },

    { id: 'e18', scene: 'stab', start: 102, end: 108,
      caption: 'It is a subgroup but not in general a normal one. Conjugating the stabiliser of a corner gives the stabiliser of the corner it moved to.',
      detail: 'The stabiliser of corner 0 is the identity and the reflection across the diagonal 0-2. Conjugate it by the quarter turn and you get the identity and the reflection across the other diagonal, which is the stabiliser of corner 2. Those are different subgroups, so the stabiliser is not normal in D4. This is checked for 98 point-element pairs with no exception.',
      narration: 'It is a subgroup but not in general a normal one. Conjugating the stabiliser of a corner gives the stabiliser of the corner it moved to.',
      keyword: 'not in general a normal one',
      trap: 'Concluding "subgroup therefore normal". The stabiliser of a corner in D4 is a subgroup of order two and is not normal, because its two conjugates are the two different diagonal reflections.' },

    { id: 'e19', scene: 'stab', start: 108, end: 114,
      caption: 'So points in one orbit have stabilisers of the same size, related by conjugation. Same orbit, same amount of symmetry.',
      detail: 'All four corners of the square have stabiliser size two. The two diagonals have stabiliser size four, and the four sides have stabiliser size two. Nothing in one orbit can have a stabiliser of a different size, because conjugation is a bijection between the two stabilisers.',
      narration: 'So points in one orbit have stabilisers of the same size, related by conjugation. Same orbit, same amount of symmetry.',
      keyword: 'same amount of symmetry' },

    { id: 'e20', scene: 'stab', start: 114, end: 120,
      caption: 'Two named extremes. A free action has every stabiliser trivial. A point fixed by the whole group has stabiliser equal to the group.',
      detail: 'Left multiplication of a group on itself is free: only the identity fixes an element, so every stabiliser is trivial and every orbit has size equal to the order of the group. A point that no symmetry moves, such as the centre of the square, has the whole group as its stabiliser and an orbit of size one.',
      narration: 'Two named extremes. A free action has every stabiliser trivial. A point fixed by the whole group has stabiliser equal to the group.',
      keyword: 'two named extremes' },

    /* ---------------- scene 5: ost ---------------- */
    { id: 'e21', scene: 'ost', start: 120, end: 126,
      caption: 'The orbit-stabiliser theorem: the size of the group equals the size of the orbit times the size of the stabiliser.',
      detail: 'Written as |G| equals |orbit of x| times |stabiliser of x|, and it holds for every point x, not just some. It is the single most useful identity on this page, because it converts a count of one quantity into a count of the other without listing anything.',
      narration: 'The orbit-stabiliser theorem: the size of the group equals the size of the orbit times the size of the stabiliser.',
      keyword: 'orbit times the stabiliser' },

    { id: 'e22', scene: 'ost', start: 126, end: 132,
      caption: 'On the corners: eight is four times two. On a diagonal: eight is two times four. On three points of S3: six is three times two.',
      detail: 'A corner reaches four corners and is fixed by two symmetries. A diagonal reaches two diagonals and is fixed by four symmetries. A point of a three-element set under S3 reaches three points and is fixed by two permutations, the identity and the transposition of the other two. All three products are the group order.',
      narration: 'On the corners: eight is four times two. On a diagonal: eight is two times four. On three points of S3: six is three times two.',
      keyword: 'four times two' },

    { id: 'e23', scene: 'ost', start: 132, end: 138,
      caption: 'Why it is true: send each group element to the point it moves x to. Every point of the orbit gets exactly as many senders as the stabiliser has elements.',
      detail: 'The map from g to g dot x is onto the orbit by definition. Two elements g and h land on the same point exactly when h inverse g fixes x, that is, when they differ by an element of the stabiliser. So each fibre is a coset of the stabiliser, every fibre has the same size, and the group splits into one coset per orbit point.',
      narration: 'Why it is true: send each group element to the point it moves x to. Every point of the orbit gets exactly as many senders as the stabiliser has elements.',
      keyword: 'exactly as many senders' },

    { id: 'e24', scene: 'ost', start: 138, end: 144,
      caption: 'It is checked on every point of every action here: 355 tests, no exception. The identity is read off the table, never assumed.',
      detail: 'For each of the twelve actions in the catalogue, and each point of its set, the page computes the orbit by search, the stabiliser by scanning the table, and compares the product with the group order. The test set includes colourings, segments, points and the group acting on itself.',
      narration: 'It is checked on every point of every action here: 355 tests, no exception. The identity is read off the table, never assumed.',
      keyword: '355 tests' },

    { id: 'e25', scene: 'ost', start: 144, end: 150,
      caption: 'One consequence to keep: orbit size always divides the group order, because the stabiliser size is a whole number.',
      detail: 'The product of two positive whole numbers is the group order, so each factor divides it. That is why an orbit can be of size four or two but never three inside a group of order eight. It also gives a fast check on any claimed orbit size in an exam.',
      narration: 'One consequence to keep: orbit size always divides the group order, because the stabiliser size is a whole number.',
      keyword: 'always divides the group order' },

    /* ---------------- scene 6: burnside ---------------- */
    { id: 'e26', scene: 'burnside', start: 150, end: 156,
      caption: "Burnside's lemma: the number of orbits equals the average number of points each group element fixes.",
      detail: 'Average over the group: for each element count the points it fixes, add those counts, divide by the order of the group. The answer is the number of orbits exactly, with no rounding and no case analysis. The name is Burnside, though the result is older; Cauchy and Frobenius used it first.',
      narration: "Burnside's lemma: the number of orbits equals the average number of points each group element fixes.",
      keyword: 'average number of points' },

    { id: 'e27', scene: 'burnside', start: 156, end: 162,
      caption: 'The four rotations fix 16, 2, 4 and 2 of the sixteen two-colourings. The average is 24 over 4, which is 6.',
      detail: 'The identity fixes all sixteen. A quarter turn forces all four corners to share a colour, so it fixes two colourings. A half turn fixes colourings with opposite corners equal, so four. A three-quarter turn behaves like a quarter turn, so two. The sum is 24 and 24 divided by 4 is 6.',
      narration: 'The four rotations fix 16, 2, 4 and 2 of the sixteen two-colourings. The average is 24 over 4, which is 6.',
      keyword: '16, 2, 4 and 2' },

    { id: 'e28', scene: 'burnside', start: 162, end: 168,
      caption: 'Six is also the count you get by listing every colouring and grouping it with its rotated copies. The average and the listing agree.',
      detail: 'The page computes the orbits by search as well, and compares. Six blocks, of sizes that add to sixteen. This is the validation that matters: the formula is not trusted because a book states it, but because two independent computations on the same table give the same number, for all twelve actions.',
      narration: 'Six is also the count you get by listing every colouring and grouping it with its rotated copies. The average and the listing agree.',
      keyword: 'the average and the listing agree' },

    { id: 'e29', scene: 'burnside', start: 168, end: 174,
      caption: 'Why dividing by the group size naively fails: sixteen colourings over eight symmetries is two, and the answer is six.',
      detail: 'The naive division assumes every object appears the same number of times in the list of sixteen. The all-one-colour painting appears once, a two-and-two painting appears four times, a three-and-one painting appears four times. Different multiplicities mean no single divisor exists, so the division is not merely inaccurate, it is meaningless.',
      narration: 'Why dividing by the group size naively fails: sixteen colourings over eight symmetries is two, and the answer is six.',
      keyword: 'naive division',
      trap: 'Dividing the number of colourings by the group size. For 16 two-colourings under 8 symmetries that gives 2, while the true count is 6, because objects with more symmetry are counted fewer times in the list.' },

    { id: 'e30', scene: 'burnside', start: 174, end: 180,
      caption: 'The average is right because counting pairs of element and fixed point, in either order, gives the same total.',
      detail: 'Count the pairs where the element fixes the point. Summing fixed points over elements gives one total; summing stabiliser sizes over points gives the same total. By orbit-stabiliser each point contributes its orbit size, so the total is the sum of orbit sizes, which is the size of the set. Dividing that identity by the group order gives the lemma.',
      narration: 'The average is right because counting pairs of element and fixed point, in either order, gives the same total.',
      keyword: 'counting pairs' },

    /* ---------------- scene 7: necklace ---------------- */
    { id: 'e31', scene: 'necklace', start: 180, end: 186,
      caption: 'Six beads in a circle, two colours. There are 64 strings. How many are genuinely different if turning the necklace is allowed?',
      detail: 'Each bead is one of two colours, and there are six beads, so 64 labelled strings. Two strings count as the same necklace when one can be rotated into the other. The group is the six rotations, not the twelve symmetries: flipping a necklace over is a different physical move and is excluded unless the question says so.',
      narration: 'Six beads in a circle, two colours. There are 64 strings. How many are genuinely different if turning the necklace is allowed?',
      keyword: 'genuinely different' },

    { id: 'e32', scene: 'necklace', start: 186, end: 192,
      caption: 'The six rotations fix 64, 2, 4, 8, 4 and 2 strings. The sum is 84, and 84 over 6 is 14 necklaces.',
      detail: 'The identity fixes all 64. A rotation by one or five beads forces all beads the same colour, so two. A rotation by two or four beads forces a period of two, so four. A half turn forces a period of three, so eight. The sum 84 divided by 6 is exactly 14.',
      narration: 'The six rotations fix 64, 2, 4, 8, 4 and 2 strings. The sum is 84, and 84 over 6 is 14 necklaces.',
      keyword: '84 over 6 is 14' },

    { id: 'e33', scene: 'necklace', start: 192, end: 198,
      caption: 'Now allow flipping as well: twelve symmetries, fixed counts 64, 2, 4, 8, 4, 2 and six reflections, and the answer is 13.',
      detail: 'The six reflections split into two kinds. Three pass through two opposite beads and fix 16 strings each; three pass between beads and fix 8 each. The total becomes 156, and 156 divided by 12 is 13. So one bracelet collapses two necklaces that were mirror images and not rotations of each other.',
      narration: 'Now allow flipping as well: twelve symmetries, fixed counts 64, 2, 4, 8, 4, 2 and six reflections, and the answer is 13.',
      keyword: 'the answer is 13' },

    { id: 'e34', scene: 'necklace', start: 198, end: 204,
      caption: 'Fourteen and thirteen differ by one. The group you divide by is part of the answer, not a detail.',
      detail: 'Rotation only gives 14, rotation plus reflection gives 13. A question that says "necklaces" usually means rotation, and one that says "bracelets", or that lets you turn the object over, means the full symmetry group. Reading which group is intended is worth more marks than the arithmetic.',
      narration: 'Fourteen and thirteen differ by one. The group you divide by is part of the answer, not a detail.',
      keyword: 'part of the answer',
      trap: 'Using the dihedral group when the question only allows rotation, or the reverse. Six beads in two colours give 14 by rotation and 13 with reflections.' },

    { id: 'e35', scene: 'necklace', start: 204, end: 210,
      caption: 'And 64 divided by 6 is 10.67, not 14. The strings are not spread evenly over the necklaces, which is exactly what the average repairs.',
      detail: 'The all-one-colour necklace appears once in the list of 64 strings, an alternating necklace appears twice, and a necklace with no rotational symmetry appears six times. Since the multiplicity varies, no division works. Burnside weights each element by the strings it fixes, which is precisely the correction needed.',
      narration: 'And 64 divided by 6 is 10.67, not 14. The strings are not spread evenly over the necklaces, which is exactly what the average repairs.',
      keyword: '10.67, not 14' },

    /* ---------------- scene 8: colours ---------------- */
    { id: 'e36', scene: 'colours', start: 210, end: 216,
      caption: 'Generalise: paint the four corners with k colours. Rotations only gives k to the fourth plus k squared plus 2k, all over 4.',
      detail: 'The four rotations contribute: identity k to the fourth, half turn k squared because opposite corners must match, and each quarter turn k because all four corners must match. Two quarter turns, so 2k. Divide by 4. For k equal to 3 this is 96 over 4, which is 24.',
      narration: 'Generalise: paint the four corners with k colours. Rotations only gives k to the fourth plus k squared plus 2k, all over 4.',
      keyword: 'k to the fourth plus k squared plus 2k' },

    { id: 'e37', scene: 'colours', start: 216, end: 222,
      caption: 'Add the four reflections: two diagonals fix k cubed each, two side-midpoint lines fix k squared each. Divide by 8.',
      detail: 'A reflection across a diagonal fixes two corners and swaps the other two, so the colouring is fixed when the swapped pair matches: k cubed. A reflection across a line through midpoints swaps two pairs, so two conditions: k squared. The total is k to the fourth plus 2 k cubed plus 3 k squared plus 2k, over 8.',
      narration: 'Add the four reflections: two diagonals fix k cubed each, two side-midpoint lines fix k squared each. Divide by 8.',
      keyword: 'two diagonals fix k cubed' },

    { id: 'e38', scene: 'colours', start: 222, end: 228,
      caption: 'For k equal to 3 the two answers are 24 and 21. The gap of three is the three paintings that are mirror images and not rotations.',
      detail: 'Three colours on four corners: 24 up to rotation, 21 up to the full symmetry group. The difference of three is exactly the number of rotation-classes that a reflection splits. Both numbers are also produced by brute force on the 81 colourings, and the formulas agree with brute force for k from 1 to 4.',
      narration: 'For k equal to 3 the two answers are 24 and 21. The gap of three is the three paintings that are mirror images and not rotations.',
      keyword: '24 and 21' },

    { id: 'e39', scene: 'colours', start: 228, end: 234,
      caption: 'The table: k of 1, 2, 3, 4, 5 gives 1, 6, 24, 70, 165 by rotation and 1, 6, 21, 55, 120 with reflections.',
      detail: 'For k equal to 2 both columns give 6, which is a coincidence at four corners and two colours, not a rule: at six beads and two colours the two columns give 14 and 13. Do not generalise from the row where they agree.',
      narration: 'The table: k of 1, 2, 3, 4, 5 gives 1, 6, 24, 70, 165 by rotation and 1, 6, 21, 55, 120 with reflections.',
      keyword: '1, 6, 24, 70, 165' },

    { id: 'e40', scene: 'colours', start: 234, end: 240,
      caption: 'Both formulas are re-derived here from the fixed-point counts, and both are checked against enumerating every colouring for k up to 4.',
      detail: 'The page builds the action for each k from 1 to 4, counts the orbits by search, and compares with the closed form. Four rows, two formulas, eight comparisons, no mismatch. The formula is therefore a summary of a computation, not a remembered fact.',
      narration: 'Both formulas are re-derived here from the fixed-point counts, and both are checked against enumerating every colouring for k up to 4.',
      keyword: 'checked against enumerating' },

    /* ---------------- scene 9: known ---------------- */
    { id: 'e41', scene: 'known', start: 240, end: 246,
      caption: 'Left multiplication: let a group act on its own elements by multiplying on the left. One orbit, of size the group order.',
      detail: 'For S3 acting on its six elements, the orbit of the identity is all six, because g times the identity is g. The stabiliser of the identity is only the identity, because g times the identity is the identity forces g to be the identity. Six is six times one, so the action is free and transitive.',
      narration: 'Left multiplication: let a group act on its own elements by multiplying on the left. One orbit, of size the group order.',
      keyword: 'left multiplication' },

    { id: 'e42', scene: 'known', start: 246, end: 252,
      caption: 'Orbit-stabiliser then says the orbit of the identity has the size of the group. That is the standard proof of Cayley\u2019s theorem.',
      detail: 'Since the stabiliser is trivial, orbit size equals group order, and the action gives an injective map from the group into the permutations of its own elements. That is Cayley: every group of order n is a subgroup of the symmetric group on n letters. It is a corollary of the identity you just used, not a separate fact.',
      narration: 'Orbit-stabiliser then says the orbit of the identity has the size of the group. That is the standard proof of Cayley\u2019s theorem.',
      keyword: 'Cayley' },

    { id: 'e43', scene: 'known', start: 252, end: 258,
      caption: 'Conjugation: let the group act on itself by g h g inverse. The orbits are the conjugacy classes.',
      detail: 'Two elements are in the same orbit exactly when some g carries one to the other by conjugation, which is the definition of conjugate. For S3 there are three classes: the identity, the three transpositions, and the two three-cycles. For D4 there are five: identity, the half turn, the two quarter turns, and the four reflections split into two pairs.',
      narration: 'Conjugation: let the group act on itself by g h g inverse. The orbits are the conjugacy classes.',
      keyword: 'conjugacy classes' },

    { id: 'e44', scene: 'known', start: 258, end: 264,
      caption: 'So Burnside counts conjugacy classes: 18 over 6 is 3 for S3, and 40 over 8 is 5 for D4.',
      detail: 'The stabiliser under conjugation is the centraliser, the elements that commute with h. So orbit-stabiliser says the class of h has size the group order divided by the centraliser size. Summing fixed points over the six elements of S3 gives 18, and 18 over 6 is the three classes. For D4 the sum is 40 over 8, five classes.',
      narration: 'So Burnside counts conjugacy classes: 18 over 6 is 3 for S3, and 40 over 8 is 5 for D4.',
      keyword: 'counts conjugacy classes' },

    { id: 'e45', scene: 'known', start: 264, end: 270,
      caption: 'One idea, three questions: how many distinct objects, how large is an orbit, and how many classes are there. Same average, same identity.',
      detail: 'Counting distinct paintings, counting necklaces, counting conjugacy classes and proving Cayley are all the same two results applied to different sets. Recognising which one a question is asking is the whole skill; the arithmetic is four numbers and a division.',
      narration: 'One idea, three questions: how many distinct objects, how large is an orbit, and how many classes are there. Same average, same identity.',
      keyword: 'one idea, three questions' },

    /* ---------------- scene 10: exam ---------------- */
    { id: 'e46', scene: 'exam', start: 270, end: 276,
      caption: 'Four steps: name the group, name the set it acts on, count the points each element fixes, divide by the group order.',
      detail: 'Naming the group decides rotation against rotation plus reflection. Naming the set decides whether you are counting colourings, permutations or subgraphs. The fixed-point count is read off the cycle structure: an element with c cycles on the moved positions fixes k to the c colourings. The division finishes it.',
      narration: 'Four steps: name the group, name the set it acts on, count the points each element fixes, divide by the group order.',
      keyword: 'four steps' },

    { id: 'e47', scene: 'exam', start: 276, end: 282,
      caption: 'The shortcut that does most of the work: a permutation with c cycles fixes exactly k to the c colourings, where k is the number of colours.',
      detail: 'A colouring is fixed when every cycle of the permutation is monochromatic. So each cycle is one free colour choice, and there are k to the number of cycles. On the four corners, the half turn has two cycles and fixes k squared; a diagonal reflection has three cycles and fixes k cubed. This one rule produces every fixed-point count on this page.',
      narration: 'The shortcut that does most of the work: a permutation with c cycles fixes exactly k to the c colourings, where k is the number of colours.',
      keyword: 'c cycles fixes k to the c' },

    { id: 'e48', scene: 'exam', start: 282, end: 288,
      caption: 'Trap one: dividing the total by the group order. Trap two: using the wrong group, rotation only against rotation and reflection.',
      detail: 'The division assumes every object is counted the same number of times, and symmetric objects are counted fewer times. The wrong group changes the answer by a whole integer: 14 against 13 for six beads, 24 against 21 for three colours on a square. Both traps are avoided by naming the group and averaging instead of dividing.',
      narration: 'Trap one: dividing the total by the group order. Trap two: using the wrong group, rotation only against rotation and reflection.',
      keyword: 'trap one and trap two',
      trap: 'Dividing 16 colourings by 8 symmetries to get 2, or 64 strings by 6 rotations to get 10.67. Both are wrong because objects with more symmetry appear fewer times in the list.' },

    { id: 'e49', scene: 'exam', start: 288, end: 294,
      caption: 'Trap three: swapping orbit and stabiliser in the size identity. Trap four: assuming a stabiliser is normal because it is a subgroup.',
      detail: 'The identity is group order equals orbit size times stabiliser size, and swapping them gives a wrong number whenever they differ, which is almost always. And a stabiliser is a subgroup that is conjugate to the stabilisers of the other points of the orbit, so it is normal only when the orbit has one point.',
      narration: 'Trap three: swapping orbit and stabiliser in the size identity. Trap four: assuming a stabiliser is normal because it is a subgroup.',
      keyword: 'swapping orbit and stabiliser' },

    { id: 'e50', scene: 'exam', start: 294, end: 300,
      caption: 'One line to carry: orbits are what you count, stabilisers are how much symmetry one point has, and the average over the group joins them.',
      detail: 'Any question on this topic is asking one of three things: how many distinct objects (an orbit count), how big is one orbit (orbit-stabiliser), or how much symmetry does one point have (a stabiliser). Name which, and the method is fixed.',
      narration: 'One line to carry: orbits are what you count, stabilisers are how much symmetry one point has, and the average over the group joins them.',
      keyword: 'the average over the group joins them' }
  ]
};
