/* ==========================================================================
   group-isomorphism-and-invariants — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   captions.vtt, captions.srt and transcript.md are derived from this file by
   tools/gen-captions.mjs — never edited by hand.

   Every figure quoted in a caption is computed by the model in lesson.js and
   asserted there: the eight multiplication tables, the element-order profiles,
   the subgroup and automorphism counts, the four pair comparisons, the witness
   map on 36 pairs, and the 5040-candidate search pruned to nothing.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'same',
      n: 1,
      title: 'Two groups of order 4, and one question',
      start: 0, end: 30,
      objective: 'See that two groups can satisfy every axiom, have the same number of elements, and still be different objects, so the axioms alone cannot answer the question.'
    },
    {
      id: 'def',
      n: 2,
      title: 'The definition, and what it forces',
      start: 30, end: 60,
      objective: 'State an isomorphism as a bijection preserving the operation, derive the three consequences that come free, and see that the relation is an equivalence.'
    },
    {
      id: 'witness',
      n: 3,
      title: 'A witness: Z6 is Z2 x Z3',
      start: 60, end: 90,
      objective: 'Prove two groups are the same by writing the map down and checking it on all 36 pairs, and see that a proof of sameness is always a witness.'
    },
    {
      id: 'invar',
      n: 4,
      title: 'The invariants: what a relabelling cannot change',
      start: 90, end: 120,
      objective: 'Name the six numbers a relabelling must preserve, and see that a mismatch is a proof while a match is not.'
    },
    {
      id: 'z4v4',
      n: 5,
      title: 'Order 4: Z4 against V4',
      start: 120, end: 150,
      objective: 'Separate the two groups of order 4 by counting elements of order 2, and watch the pruned search confirm it without testing a single product.'
    },
    {
      id: 'six',
      n: 6,
      title: 'Order 6: Z6 against S3',
      start: 150, end: 180,
      objective: 'Use abelianness as the one-line invariant that separates the two groups of order 6, and see the profile agree for a second reason.'
    },
    {
      id: 'eight',
      n: 7,
      title: 'Order 8: D4 against Q8',
      start: 180, end: 210,
      objective: 'Separate two non-abelian groups of order 8 whose order, abelianness and centre all match, using only the element-order profile.'
    },
    {
      id: 'brute',
      n: 8,
      title: 'The test that always works',
      start: 210, end: 240,
      objective: 'See isomorphism decided by a finite search over all bijections fixing the identity, and see the profile test as that search with the impossible candidates removed.'
    },
    {
      id: 'limit',
      n: 9,
      title: 'Where the profile stops',
      start: 240, end: 270,
      objective: 'Exhibit two groups of order 16 with identical element-order profiles and no isomorphism, so a matching profile is never a proof of sameness.'
    },
    {
      id: 'exam',
      n: 10,
      title: 'The decision procedure, and how it is asked',
      start: 270, end: 300,
      objective: 'Run the four-step procedure cheapest-first, mark which steps prove difference and which alone can prove sameness, and read a previous-year question through it.'
    }
  ],

  events: [
    /* ---------------- scene 1: same ---------------- */
    { id: 'e01', scene: 'same', start: 0, end: 6,
      caption: 'Two groups of order 4. Both satisfy every axiom. Both have four elements. Are they the same group?',
      detail: 'A group of order 4 has four elements, an identity, an inverse for each element, and an associative operation. Two different tables can satisfy all of that. The question the lesson answers is what "the same group" means when the tables differ.',
      narration: 'Two groups of order 4. Both satisfy every axiom. Both have four elements. Are they the same group?',
      keyword: 'the same group' },

    { id: 'e02', scene: 'same', start: 6, end: 12,
      caption: 'On the left, the integers 0 to 3 under addition mod 4. On the right, pairs of bits added component by component.',
      detail: 'The left group is written Z4: add, then take the remainder on division by 4. The right group is written V4, or Z2 x Z2: two bits, each added mod 2, independently. Both are groups of four elements, and both are abelian.',
      narration: 'On the left, the integers 0 to 3 under addition mod 4. On the right, pairs of bits added component by component.',
      keyword: 'V4' },

    { id: 'e03', scene: 'same', start: 12, end: 18,
      caption: 'The axioms cannot separate them. Everything the axioms demand is true of both. Only the tables differ.',
      detail: 'Closure, associativity, an identity and inverses are all satisfied by both tables. So no argument that uses only the axioms can tell the two apart. A separation has to use something the table says that the axioms do not.',
      narration: 'The axioms cannot separate them. Everything the axioms demand is true of both. Only the tables differ.',
      keyword: 'only the tables differ' },

    { id: 'e04', scene: 'same', start: 18, end: 24,
      caption: 'A relabelling is a bijection that also respects the table: phi of a plus b equals phi of a plus phi of b.',
      detail: 'Renaming the elements is allowed. What is not allowed is renaming them in a way that breaks the table. The condition says: work out a plus b in the first group, rename the answer, and you must get the same thing as renaming a and b first and then adding them in the second group.',
      narration: 'A relabelling is a bijection that also respects the table. phi of a plus b equals phi of a plus phi of b.',
      keyword: 'relabelling' },

    { id: 'e05', scene: 'same', start: 24, end: 30,
      caption: 'Z4 has one element of order 2. V4 has three. A relabelling preserves order, so no relabelling exists.',
      detail: 'The order of an element is the smallest positive number of times you must combine it with itself to reach the identity. In Z4 only the element 2 has order 2. In V4 all three non-identity elements do. Since a relabelling sends an element of order 2 to an element of order 2, it would have to send one element to three, which no bijection can do.',
      narration: 'Z4 has one element of order 2. V4 has three. A relabelling preserves order, so no relabelling exists.',
      keyword: 'one against three' },

    /* ---------------- scene 2: def ---------------- */
    { id: 'e06', scene: 'def', start: 30, end: 36,
      caption: 'Two groups are isomorphic when a bijection exists that preserves the operation. The bijection is the definition.',
      detail: 'Written G is isomorphic to H. The definition has two halves: a bijection, so the sets match one for one, and the equation phi of a times b equals phi of a times phi of b, so the tables match. Both halves are needed, and neither implies the other.',
      narration: 'Two groups are isomorphic when a bijection exists that preserves the operation. The bijection is the definition.',
      keyword: 'the bijection is the definition' },

    { id: 'e07', scene: 'def', start: 36, end: 42,
      caption: 'Three things come free: the identity goes to the identity, inverses to inverses, and the order of every element is preserved.',
      detail: 'None of these is an extra condition. Each is a consequence of the one equation. If phi of a times b equals phi of a times phi of b for all a and b, then putting b equal to the identity forces phi of the identity to behave as an identity in the second group, and the inverse statement follows by cancelling.',
      narration: 'Three things come free. The identity goes to the identity, inverses to inverses, and the order of every element is preserved.',
      keyword: 'come free' },

    { id: 'e08', scene: 'def', start: 42, end: 48,
      caption: 'Isomorphism is an equivalence relation. Reflexive by the identity map, symmetric by inverting the bijection, transitive by composing two of them.',
      detail: 'Each of the three proofs is one line. The identity map preserves the operation trivially. The inverse of an operation-preserving bijection also preserves the operation, because the equation can be read backwards. A composition of two operation-preserving bijections preserves the operation because two equations chain.',
      narration: 'Isomorphism is an equivalence relation. Reflexive by the identity map, symmetric by inverting the bijection, transitive by composing two of them.',
      keyword: 'equivalence relation' },

    { id: 'e09', scene: 'def', start: 48, end: 54,
      caption: 'Checked here on four groups of order 6: reflexive 4 of 4, symmetric on all 12 ordered pairs, transitive on all 64 ordered triples.',
      detail: 'The four groups are Z6, Z2 x Z3, Z3 x Z2 and S3. Three of them are one group written three ways, and the fourth is genuinely different. The page runs the isomorphism search on every ordered pair and triple and reports the counts, so the relation is demonstrated rather than asserted.',
      narration: 'Checked here on four groups of order 6. Reflexive 4 of 4, symmetric on all 12 ordered pairs, transitive on all 64 ordered triples.',
      keyword: 'checked, not asserted' },

    { id: 'e10', scene: 'def', start: 54, end: 60,
      caption: 'So isomorphic means: the same group with the elements renamed. Every question answerable from the table has the same answer in both.',
      detail: 'This is why classification is the natural question for groups. Once you know two groups are isomorphic, every table-only question about one is answered for the other, and you stop counting them separately. A number that a relabelling cannot change is called an invariant, and the rest of the lesson is about finding them.',
      narration: 'So isomorphic means the same group with the elements renamed. Every question answerable from the table has the same answer in both.',
      keyword: 'renamed' },

    /* ---------------- scene 3: witness ---------------- */
    { id: 'e11', scene: 'witness', start: 60, end: 66,
      caption: 'Now the other direction. Claim: Z6 and Z2 x Z3 are the same group. The proof is a map.',
      detail: 'Z6 is the integers 0 to 5 under addition mod 6. Z2 x Z3 is pairs of bits, the first mod 2 and the second mod 3, added component by component. Both have six elements. Nothing so far shows they are the same group.',
      narration: 'Now the other direction. Claim: Z6 and Z2 x Z3 are the same group. The proof is a map.',
      keyword: 'the proof is a map' },

    { id: 'e12', scene: 'witness', start: 66, end: 72,
      caption: 'The candidate is phi of x equals x mod 2 paired with x mod 3. Send each number to its two remainders.',
      detail: 'The map is the Chinese remainder map. It sends 0 to the pair 0 and 0, 1 to 1 and 1, 2 to 0 and 2, 3 to 1 and 0, 4 to 0 and 1, 5 to 1 and 2. Each number of the six gets a different pair, so the map is a bijection.',
      narration: 'The candidate is phi of x equals x mod 2 paired with x mod 3. Send each number to its two remainders.',
      keyword: 'two remainders' },

    { id: 'e13', scene: 'witness', start: 72, end: 78,
      caption: 'Thirty-six ordered pairs to check. A pair a and b is fine when phi of a plus b equals phi of a plus phi of b.',
      detail: 'Six elements, so six times six is thirty-six ordered pairs. The equation is not obviously true: adding first and then taking remainders could in principle differ from taking remainders and then adding. It happens not to, because remainders commute with addition.',
      narration: 'Thirty-six ordered pairs to check. A pair a and b is fine when phi of a plus b equals phi of a plus phi of b.',
      keyword: 'thirty-six' },

    { id: 'e14', scene: 'witness', start: 78, end: 84,
      caption: 'Zero violations in thirty-six. And the order of each element is preserved, six of six, which the definition guarantees.',
      detail: 'The page computes all thirty-six products and finds no disagreement. It also computes the order of each element in both groups and finds the same order on each side: 1, 6, 3, 2, 3, 6 in Z6 and the same six numbers in Z2 x Z3. That second check is not needed, but it is the invariant from the next scene arriving early.',
      narration: 'Zero violations in thirty-six. And the order of each element is preserved, six of six, which the definition guarantees.',
      keyword: 'zero violations' },

    { id: 'e15', scene: 'witness', start: 84, end: 90,
      caption: 'So the two are one group. A proof of sameness is always a witness; a proof of difference is always an invariant.',
      detail: 'There is no other kind of proof available. To show two groups are the same you must produce the map, because sameness is an existential statement: there exists a bijection with this property. To show they are different you produce an invariant that one has and the other lacks, which is a universal statement in disguise.',
      narration: 'So the two are one group. A proof of sameness is always a witness; a proof of difference is always an invariant.',
      keyword: 'witness against invariant' },

    /* ---------------- scene 4: invar ---------------- */
    { id: 'e16', scene: 'invar', start: 90, end: 96,
      caption: 'An invariant is a number you can compute from the table that a relabelling cannot change. Six of them are enough for this lesson.',
      detail: 'The word invariant is used throughout mathematics: a quantity preserved by the maps you are allowing. Here the allowed maps are relabellings, so an invariant is anything computed from the multiplication table alone, without naming the elements.',
      narration: 'An invariant is a number you can compute from the table that a relabelling cannot change. Six of them are enough for this lesson.',
      keyword: 'invariant' },

    { id: 'e17', scene: 'invar', start: 96, end: 102,
      caption: 'One: the order of the group. Two: whether it is abelian. Three: the element-order profile, which is how many elements have each order.',
      detail: 'The order is the cheapest, and it settles most pairs instantly. Abelianness is one line of arithmetic and settles S3 against Z6. The profile is a list: so many elements of order 1, so many of order 2, and so on. It is computed by walking the elements and taking each one to a power until the identity appears.',
      narration: 'One: the order of the group. Two: whether it is abelian. Three: the element-order profile, which is how many elements have each order.',
      keyword: 'the profile' },

    { id: 'e18', scene: 'invar', start: 102, end: 108,
      caption: 'Four: the size of the centre. Five: how many subgroups of each order. Six: the automorphism count, which is the number of relabellings of a group onto itself.',
      detail: 'The centre is the set of elements that commute with everything; its size is preserved because commutation is a table fact. The subgroup counts are preserved because a relabelling carries subgroups to subgroups. The automorphism count is the number of isomorphisms from the group to itself, which is the same as the number of relabellings that respect the table.',
      narration: 'Four: the size of the centre. Five: how many subgroups of each order. Six: the automorphism count, the number of relabellings of a group onto itself.',
      keyword: 'automorphism count' },

    { id: 'e19', scene: 'invar', start: 108, end: 114,
      caption: 'A mismatch in any one of them proves the groups differ. That direction is airtight, and it is all an exam answer needs.',
      detail: 'If the groups were isomorphic, every invariant would have to agree. So one disagreement is a complete proof of difference, and it takes one line. This is why almost every exam question about isomorphism is really a question about computing one of these six numbers.',
      narration: 'A mismatch in any one of them proves the groups differ. That direction is airtight, and it is all an exam answer needs.',
      keyword: 'mismatch proves difference' },

    { id: 'e20', scene: 'invar', start: 114, end: 120,
      caption: 'A match proves nothing yet. Every one of these is necessary, and the next scenes show that none of them is sufficient.',
      detail: 'Necessary means every isomorphism preserves it. Sufficient would mean agreement forces an isomorphism, and that is false for the profile, as the order-16 pair later in the lesson demonstrates. Confusing the two is the central mistake in the topic.',
      narration: 'A match proves nothing yet. Every one of these is necessary, and the next scenes show that none of them is sufficient.',
      keyword: 'necessary, not sufficient' },

    /* ---------------- scene 5: z4v4 ---------------- */
    { id: 'e21', scene: 'z4v4', start: 120, end: 126,
      caption: 'Order 4, the first real case. Z4 on the left, V4 on the right. Both abelian, so the abelianness test is useless here.',
      detail: 'Two of the six invariants already fail to separate them: the order is 4 for both, and both are abelian. The lesson now has to use the profile, which is the third invariant.',
      narration: 'Order 4, the first real case. Z4 on the left, V4 on the right. Both abelian, so the abelianness test is useless here.',
      keyword: 'both abelian' },

    { id: 'e22', scene: 'z4v4', start: 126, end: 132,
      caption: 'In Z4 the element orders are 1, 4, 2, 4. One element has order 2, two have order 4, and the identity has order 1.',
      detail: 'Adding 2 to itself gives 4, which is 0 mod 4, so the element 2 has order 2. Adding 1 to itself four times gives 0, so 1 has order 4, and likewise 3. The profile of Z4 is therefore one element of order 1, one of order 2, and two of order 4.',
      narration: 'In Z4 the element orders are 1, 4, 2, 4. One element has order 2, two have order 4, and the identity has order 1.',
      keyword: 'order 1, 4, 2, 4' },

    { id: 'e23', scene: 'z4v4', start: 132, end: 138,
      caption: 'In V4 every non-identity element has order 2. The profile is one of order 1 and three of order 2, with nothing above.',
      detail: 'Adding any pair of bits to itself gives the pair of zeros, because each bit is doubled mod 2. So there is no element of order 4 at all. The profile is one, three, and nothing else.',
      narration: 'In V4 every non-identity element has order 2. The profile is one of order 1 and three of order 2, with nothing above.',
      keyword: 'nothing above order 2' },

    { id: 'e24', scene: 'z4v4', start: 138, end: 144,
      caption: 'One against three. A bijection sends elements of order 2 to elements of order 2, so this one cannot exist.',
      detail: 'This is the whole proof, and it is a counting argument rather than a construction. It also explains why the profile is such a strong invariant: it reads the structure of the group element by element, so a difference anywhere in it is a difference in the group.',
      narration: 'One against three. A bijection sends elements of order 2 to elements of order 2, so this one cannot exist.',
      keyword: 'counting, not construction' },

    { id: 'e25', scene: 'z4v4', start: 144, end: 150,
      caption: 'The search agrees and never tests a product: six bijections fix the identity, the profile filter removes all six, zero survive.',
      detail: 'Without any pruning there are six bijections of a four-element set that send the identity to the identity, and each would cost sixteen product checks, ninety-six in all. The order check removes every candidate before a single product is examined. That is the profile test and the brute-force test being the same procedure.',
      narration: 'The search agrees and never tests a product. Six bijections fix the identity, the profile filter removes all six, zero survive.',
      keyword: 'zero survive' },

    /* ---------------- scene 6: six ---------------- */
    { id: 'e26', scene: 'six', start: 150, end: 156,
      caption: 'Order 6. Z6 against S3, the permutations of three objects. Six elements each, so the first invariant fails.',
      detail: 'S3 has six elements: three that swap a pair and leave the third alone, two three-cycles, and the identity. Z6 has six elements. Both are groups. The order of the group cannot separate them.',
      narration: 'Order 6. Z6 against S3, the permutations of three objects. Six elements each, so the first invariant fails.',
      keyword: 'S3' },

    { id: 'e27', scene: 'six', start: 156, end: 162,
      caption: 'Z6 is abelian: a plus b equals b plus a for all thirty-six pairs. Every subgroup of an abelian group is normal.',
      detail: 'Addition mod 6 commutes because addition of integers commutes and taking remainders preserves that. So Z6 is abelian. One consequence worth carrying: in an abelian group the left and right cosets of every subgroup coincide, so there is no room for a non-normal subgroup.',
      narration: 'Z6 is abelian. a plus b equals b plus a for all thirty-six pairs. Every subgroup of an abelian group is normal.',
      keyword: 'abelian' },

    { id: 'e28', scene: 'six', start: 162, end: 168,
      caption: 'S3 is not. The transposition 0 1 and the three-cycle 0 1 2 give different answers in the two orders.',
      detail: 'Doing the swap first and then the cycle is not the same as doing the cycle first and then the swap. The two composites are different permutations, so the group is not abelian. This is the smallest non-abelian group, which is why order 6 is the first order where the question is interesting.',
      narration: 'S3 is not. The transposition 0 1 and the three-cycle 0 1 2 give different answers in the two orders.',
      keyword: 'not abelian' },

    { id: 'e29', scene: 'six', start: 168, end: 174,
      caption: 'Abelianness is preserved by every isomorphism, so one line settles it. The profile agrees, and says it a second way.',
      detail: 'If a map preserves the operation, then the equation a times b equals b times a survives being pushed through the map, so the image group is abelian exactly when the original is. The profile of Z6 is one, one, two, two and the profile of S3 is one, three, two with no element of order 6 at all, so the same conclusion arrives twice.',
      narration: 'Abelianness is preserved by every isomorphism, so one line settles it. The profile agrees, and says it a second way.',
      keyword: 'one line' },

    { id: 'e30', scene: 'six', start: 174, end: 180,
      caption: 'The search: 120 bijections fix the identity, the profile filter removes all of them, and no product is tested.',
      detail: 'There are 120 permutations of six elements that fix the identity, and each would cost thirty-six product checks, four thousand three hundred and twenty in all. The order check removes every one first. The subgroup counts, four for Z6 and six for S3, give a third confirmation.',
      narration: 'The search. 120 bijections fix the identity, the profile filter removes all of them, and no product is tested.',
      keyword: '120 candidates' },

    /* ---------------- scene 7: eight ---------------- */
    { id: 'e31', scene: 'eight', start: 180, end: 186,
      caption: 'Order 8. Now the cheap invariants run out. D4 against Q8: both non-abelian, both with a centre of size 2.',
      detail: 'D4 is the eight symmetries of a square: four rotations and four reflections. Q8 is the quaternions, the eight elements plus or minus 1, i, j, k. Both are non-abelian, both have exactly two elements in the centre, and both have three subgroups of order 4. Four of the six invariants agree.',
      narration: 'Order 8. Now the cheap invariants run out. D4 against Q8. Both non-abelian, both with a centre of size 2.',
      keyword: 'the cheap invariants run out' },

    { id: 'e32', scene: 'eight', start: 186, end: 192,
      caption: 'In D4 the element orders are 1, 4, 2, 4, 2, 2, 2, 2. Two elements of order 4 and five of order 2.',
      detail: 'A quarter turn and a three-quarter turn each have order 4. The half turn and the four reflections each have order 2. So the profile is one, five, two. The two elements of order 4 generate the same cyclic subgroup, which is one reason the group looks small from the inside.',
      narration: 'In D4 the element orders are 1, 4, 2, 4, 2, 2, 2, 2. Two elements of order 4 and five of order 2.',
      keyword: 'one, five, two' },

    { id: 'e33', scene: 'eight', start: 192, end: 198,
      caption: 'In Q8 the element orders are 1, 4, 2, 4, 2, 4, 2, 4. Six elements of order 4 and only one of order 2.',
      detail: 'The only element of order 2 is minus 1, which is the square of i and of j and of k. Every other non-identity element has order 4. So the profile is one, one, six, which is as far from one, five, two as an eight-element group can be.',
      narration: 'In Q8 the element orders are 1, 4, 2, 4, 2, 4, 2, 4. Six elements of order 4 and only one of order 2.',
      keyword: 'one, one, six' },

    { id: 'e34', scene: 'eight', start: 198, end: 204,
      caption: 'Five against one. The profiles disagree, so D4 and Q8 are not isomorphic, and nothing else had to be computed.',
      detail: 'This is the pair to remember, because it is the first case where a student who knows only the order and abelianness has nothing to say. It is also why the element-order profile earns its place as the workhorse invariant.',
      narration: 'Five against one. The profiles disagree, so D4 and Q8 are not isomorphic, and nothing else had to be computed.',
      keyword: 'the pair to remember' },

    { id: 'e35', scene: 'eight', start: 204, end: 210,
      caption: 'The subgroup counts agree here, three of order 4 each, and the automorphism counts do not: 8 for D4 against 24 for Q8.',
      detail: 'Ten subgroups in D4 and eight in Q8, so the total also separates them. The automorphism counts differ sharply because the six elements of order 4 in Q8 can be permuted far more freely than the two in D4. Of the five groups of order 8, three are abelian and two are not, and these are the two.',
      narration: 'The subgroup counts agree here, three of order 4 each, and the automorphism counts do not. 8 for D4 against 24 for Q8.',
      keyword: '8 against 24' },

    /* ---------------- scene 8: brute ---------------- */
    { id: 'e36', scene: 'brute', start: 210, end: 216,
      caption: 'There is a test that always works. Try every bijection that sends the identity to the identity, and check every product.',
      detail: 'The definition is an existential statement, so the test is exhaustive search. An isomorphism must send the identity to the identity, which removes n of the n factorial bijections from consideration, and each surviving candidate is checked against every pair of elements.',
      narration: 'There is a test that always works. Try every bijection that sends the identity to the identity, and check every product.',
      keyword: 'exhaustive search' },

    { id: 'e37', scene: 'brute', start: 216, end: 222,
      caption: 'Order 4 costs 6 bijections and 96 product checks. Order 6 costs 120 and 4320. Order 8 costs 5040 and 322560.',
      detail: 'The count of bijections fixing the identity is n minus one factorial: 6, 120 and 5040 for orders 4, 6 and 8. Each is checked with n squared products: 16, 36 and 64. The products are 96, 4320 and 322560. Every one of these is finite, which is why the question is decidable at all.',
      narration: 'Order 4 costs 6 bijections and 96 product checks. Order 6 costs 120 and 4320. Order 8 costs 5040 and 322560.',
      keyword: 'finite, therefore decidable' },

    { id: 'e38', scene: 'brute', start: 222, end: 228,
      caption: 'Now prune it. Skip any candidate that sends an element of order d to an element of a different order.',
      detail: 'The pruning is sound because an isomorphism preserves the order of every element, so a candidate that changes an order cannot possibly be an isomorphism. This is not a heuristic: it removes only candidates that would have failed the product test anyway.',
      narration: 'Now prune it. Skip any candidate that sends an element of order d to an element of a different order.',
      keyword: 'prune it' },

    { id: 'e39', scene: 'brute', start: 228, end: 234,
      caption: 'D4 against Q8: 5040 candidates become zero before a single product is tested. The profile test is the search.',
      detail: 'The profile of D4 has five elements of order 2 and the profile of Q8 has one, so no bijection can match them element by element. The search therefore finds no candidate to test. This is exactly the same verdict the invariant gave, obtained by running the general procedure.',
      narration: 'D4 against Q8. 5040 candidates become zero before a single product is tested. The profile test is the search.',
      keyword: 'the search, pruned' },

    { id: 'e40', scene: 'brute', start: 234, end: 240,
      caption: 'Z6 against Z2 x Z3: four candidates survive the filter, and two of them pass the product test. Those two are the isomorphisms.',
      detail: 'Two isomorphisms exist, and they are the two choices of where to send the element 1: to the pair 1 and 1, or to the pair 1 and 2. Once the image of a generator is fixed, the rest of the map is forced, because every element is a multiple of 1. The number of isomorphisms is also the automorphism count, which is 2.',
      narration: 'Z6 against Z2 x Z3. Four candidates survive the filter, and two of them pass the product test. Those two are the isomorphisms.',
      keyword: 'two of them' },

    /* ---------------- scene 9: limit ---------------- */
    { id: 'e41', scene: 'limit', start: 240, end: 246,
      caption: 'Now the trap. Two groups of order 16 on this page have the same element-order profile and are not the same group.',
      detail: 'The profile has been doing all the work for three scenes, so it is natural to treat it as a test for sameness. It is not. The counterexample is computed on this page from two real multiplication tables, not quoted.',
      narration: 'Now the trap. Two groups of order 16 on this page have the same element-order profile and are not the same group.',
      keyword: 'the trap' },

    { id: 'e42', scene: 'limit', start: 246, end: 252,
      caption: 'Z4 x Z4 and Q8 x Z2: both order 16, both with 1 element of order 1, 3 of order 2 and 12 of order 4.',
      detail: 'Z4 x Z4 is pairs of residues mod 4. Q8 x Z2 is a quaternion and a bit. In both, the elements of order at most 2 number exactly four, so the elements of order 4 number twelve. The two profiles are identical, digit for digit.',
      narration: 'Z4 x Z4 and Q8 x Z2. Both order 16, both with 1 element of order 1, 3 of order 2 and 12 of order 4.',
      keyword: 'identical, digit for digit' },

    { id: 'e43', scene: 'limit', start: 252, end: 258,
      caption: 'But one is abelian and the other is not. Two groups with the same profile, and no isomorphism between them.',
      detail: 'In Z4 x Z4 every pair of elements commutes. In Q8 x Z2 the quaternion i does not commute with j, and the bit does not repair that. So the abelianness invariant separates them in one line, and the profile does not separate them at all.',
      narration: 'But one is abelian and the other is not. Two groups with the same profile, and no isomorphism between them.',
      keyword: 'no isomorphism' },

    { id: 'e44', scene: 'limit', start: 258, end: 264,
      caption: 'So a matching profile is never a proof of sameness. It removes candidates. It does not produce a map.',
      detail: 'This is the asymmetry that runs through the whole lesson. An invariant is a filter: agreement keeps the pair alive and disagreement kills it. Only a witness map can finish the argument, and there is no shortcut around producing it.',
      narration: 'So a matching profile is never a proof of sameness. It removes candidates. It does not produce a map.',
      keyword: 'removes candidates' },

    { id: 'e45', scene: 'limit', start: 264, end: 270,
      caption: 'A mismatching invariant is always a proof of difference. A matching one never is. That single sentence is the topic.',
      detail: 'It is the same asymmetry as everywhere else: a finite check can refute a claim, and only a proof can confirm one. Recognising which of the two you have in hand is most of the marks in an isomorphism question.',
      narration: 'A mismatching invariant is always a proof of difference. A matching one never is. That single sentence is the topic.',
      keyword: 'the single sentence' },

    /* ---------------- scene 10: exam ---------------- */
    { id: 'e46', scene: 'exam', start: 270, end: 276,
      caption: 'The procedure, cheapest first: compare the order, then abelianness, then the element-order profile, then write the map.',
      detail: 'The first three steps can only prove difference. The fourth is the only step that can prove sameness. Running them in this order means most exam questions are settled in the first line, and the expensive step is reached only when the answer is yes.',
      narration: 'The procedure, cheapest first. Compare the order, then abelianness, then the element-order profile, then write the map.',
      keyword: 'cheapest first' },

    { id: 'e47', scene: 'exam', start: 276, end: 282,
      caption: 'A question that asks how many non-isomorphic groups of a given order exist is a classification question, not a comparison.',
      detail: 'The two shapes are different. A comparison asks whether two named groups are the same. A classification asks for the list of groups of a given order, one representative per class. The classification needs the list, and the list for small orders is short enough to carry.',
      narration: 'A question that asks how many non-isomorphic groups of a given order exist is a classification question, not a comparison.',
      keyword: 'classification' },

    { id: 'e48', scene: 'exam', start: 282, end: 288,
      caption: 'Order 4 has two classes: Z4 and V4. So a question asking for the number of non-isomorphic abelian groups of order 4 has answer 2.',
      detail: 'Every group of order p squared is abelian, so for order 4 the abelian restriction changes nothing. The two classes are the cyclic group Z4 and the Klein four-group. This is GATE CSE 2007, and the four options were 2, 3, 4 and 5.',
      narration: 'Order 4 has two classes, Z4 and V4. So a question asking for the number of non-isomorphic abelian groups of order 4 has answer 2.',
      keyword: 'two classes' },

    { id: 'e49', scene: 'exam', start: 288, end: 294,
      caption: 'Order 6 has two classes, order 8 has five, and order 9 has two. Every group of prime order is cyclic, so prime orders have one.',
      detail: 'The five groups of order 8 are Z8, Z4 x Z2, Z2 x Z2 x Z2, D4 and Q8. Order 9 has Z9 and Z3 x Z3, again because every group of order p squared is abelian. For a prime order there is only the cyclic group, because any non-identity element has order dividing the prime and so generates everything.',
      narration: 'Order 6 has two classes, order 8 has five, and order 9 has two. Every group of prime order is cyclic, so prime orders have one.',
      keyword: 'the short list' },

    { id: 'e50', scene: 'exam', start: 294, end: 300,
      caption: 'Sameness needs a witness. Difference needs an invariant. Decide which one the question is asking before you compute anything.',
      detail: 'Every question in this topic is one of the two, and the two demand different work. A witness is a map that must be written and checked. An invariant is a number that must be computed and compared. Naming the shape first is the habit that stops a correct calculation being applied to the wrong question.',
      narration: 'Sameness needs a witness. Difference needs an invariant. Decide which one the question is asking before you compute anything.',
      keyword: 'decide which one' }
  ]
};
