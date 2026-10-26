/* ==========================================================================
   monoids-and-groups — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs — never edited by hand.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 330,

  scenes: [
    {
      id: 'rule', n: 1,
      title: 'A set with a rule is a table',
      start: 0, end: 30,
      objective: 'See a binary operation as a complete table, see closure as the promise that no cell escapes the set, and see that subtraction on a three-element set is a legitimate rule.'
    },
    {
      id: 'assoc', n: 2,
      title: 'Associativity: the semigroup',
      start: 30, end: 60,
      objective: 'Read associativity as the statement that two ways of bracketing three elements give the same cell, find the triple that breaks it, and see that addition modulo 6 survives all 216 triples.'
    },
    {
      id: 'identity', n: 3,
      title: 'The identity: the monoid',
      start: 60, end: 90,
      objective: 'Find the identity by scanning for a row and column that copy the header, prove there is at most one, and classify a closed associative structure with an identity as a monoid.'
    },
    {
      id: 'inverse', n: 4,
      title: 'Inverses: the group',
      start: 90, end: 120,
      objective: 'Look for a cell holding the identity in every row, see multiplication modulo 6 fail on four rows, and see addition modulo 6 succeed, so one structure is a monoid and the other a group.'
    },
    {
      id: 'abelian', n: 5,
      title: 'Commutative or not: Z6 against S3',
      start: 120, end: 150,
      objective: 'Test symmetry of the table as a whole, find the single asymmetric pair in the six permutations of three letters, and see two groups of order 6 that are not the same group.'
    },
    {
      id: 'order', n: 6,
      title: 'Order of an element and cyclic groups',
      start: 150, end: 180,
      objective: 'Compute the powers of an element until the identity returns, read the order off that count, and separate the two groups of order 4 — one cyclic, one with every element of order 2.'
    },
    {
      id: 'subgroup', n: 7,
      title: 'Subgroups and the coset split',
      start: 180, end: 210,
      objective: 'Recognise a subgroup as a closed set containing the identity and closed under inverses, list all of them for Z6, and watch the cosets of one split the group into equal blocks.'
    },
    {
      id: 'lagrange', n: 8,
      title: "Lagrange's theorem, and what it does not say",
      start: 210, end: 240,
      objective: 'Use the divisor test to answer subgroup-size questions in one line, then meet A4, whose order 12 has a divisor 6 with no subgroup of that size.'
    },
    {
      id: 'prime', n: 9,
      title: 'Prime order, and groups of order 6',
      start: 240, end: 270,
      objective: 'Derive that a group of prime order is cyclic, then answer the order-6 question: the group may be non-cyclic, but every proper non-trivial subgroup is cyclic.'
    },
    {
      id: 'ladder', n: 10,
      title: 'Classifying a structure in the exam',
      start: 270, end: 300,
      objective: 'Climb closure, associativity, identity, inverse and commutativity in order, and apply the ladder to a power set under symmetric difference and to pointwise addition of functions.'
    },
    {
      id: 'rules', n: 11,
      title: 'Four rules to carry into the exam',
      start: 300, end: 330,
      objective: 'Consolidate the definitions that decide marks: the ladder, the divisor test, the order of an element, and the two groups of order 6.'
    }
  ],

  events: [
    /* ---------------- scene 1: rule ---------------- */
    {
      id: 'ru-1a', start: 0, end: 7, scene: 'rule',
      caption: 'A binary operation on a set is a rule that takes two elements and returns one. Write every answer in a table and the rule is completely known.',
      detail: 'The table is called a Cayley table. The row is the left input, the column is the right input, and the cell holds the answer. Nothing about the structure is hidden once the table is filled: every question about identity, inverses, commutativity and subgroups is a question about cells.',
      keyword: 'binary operation',
      trap: null,
      narration: 'A binary operation on a set takes two elements and returns one. Write every answer in a table and the rule is completely known.'
    },
    {
      id: 'ru-1b', start: 7, end: 14, scene: 'rule',
      caption: 'Here is subtraction modulo 3 on the set 0, 1, 2. Row 1 column 2 means 1 minus 2, which is minus 1, which is 2 modulo 3.',
      detail: 'Modulo 3 means keep the remainder after dividing by 3, so minus 1 becomes 2. Read the table the way you read coordinates: the answer sits where the row and the column meet.',
      keyword: 'modulo 3',
      trap: null,
      narration: 'Here is subtraction modulo 3 on the set 0, 1, 2. Row 1 column 2 means 1 minus 2, which is minus 1, which is 2 modulo 3.'
    },
    {
      id: 'ru-1c', start: 14, end: 22, scene: 'rule',
      caption: 'Closure is the first promise: every cell must hold an element of the same set. All nine cells do, so this rule stays inside the set.',
      detail: 'Closure is easy to overlook because it is usually true. It fails on the positive integers under subtraction, because 1 minus 2 is minus 1 and minus 1 is not positive, and it fails on a finite set of functions under pointwise addition once two values add past the largest element.',
      keyword: 'closure',
      trap: 'A question that names a set and an operation is testing closure first. If the operation can leave the set, nothing else needs checking and the answer is already decided.',
      narration: 'Closure is the first promise: every cell must hold an element of the same set. All nine cells do, so this rule stays inside the set.'
    },
    {
      id: 'ru-1d', start: 22, end: 30, scene: 'rule',
      caption: 'The table is the whole object. Every later word — semigroup, monoid, group — is a promise about which pattern this table must contain.',
      detail: 'This is the reason the lesson works from tables rather than from axioms alone: a promise such as "every element has an inverse" becomes a visible statement that every row contains the identity cell.',
      keyword: 'the whole object',
      trap: null,
      narration: 'The table is the whole object. Every later word is a promise about which pattern this table must contain.'
    },

    /* ---------------- scene 2: assoc ---------------- */
    {
      id: 'as-1', start: 30, end: 38, scene: 'assoc',
      caption: 'Associativity says bracketing does not matter. Take three elements, combine the first two, then combine the result with the third.',
      detail: 'Written out, the promise is that a star b star c means the same thing however the brackets fall. It is a statement about three elements at a time, which is why one counterexample with three elements is enough to refute it.',
      keyword: 'bracketing',
      trap: null,
      narration: 'Associativity says bracketing does not matter. Take three elements, combine the first two, then combine the result with the third.'
    },
    {
      id: 'as-2', start: 38, end: 46, scene: 'assoc',
      caption: 'Now the other bracketing. Zero minus 1 is 2, then 2 minus 2 is 0. But zero minus the answer of 1 minus 2 gives 1. The two cells disagree.',
      detail: 'One disagreement is decisive: the rule is not associative, so subtraction modulo 3 is closed but not a semigroup. It also has no identity, since 0 minus a is not a for any non-zero a.',
      keyword: 'disagree',
      trap: 'Associativity is not commutativity. Addition is both, multiplication is both, function composition is associative but not commutative, and subtraction is neither.',
      narration: 'Now the other bracketing. Zero minus 1 is 2, then 2 minus 2 is 0. But zero minus the answer of 1 minus 2 gives 1. The two cells disagree.'
    },
    {
      id: 'as-3', start: 46, end: 54, scene: 'assoc',
      caption: 'Addition modulo 6 passes. All 216 triples were computed and every pair of bracketings landed on the same cell.',
      detail: '216 is six choices for each of three elements. The page computes the whole sweep rather than trusting the pattern, and reports the count, so the claim is checked rather than asserted.',
      keyword: '216 triples',
      trap: null,
      narration: 'Addition modulo 6 passes. All 216 triples were computed and every pair of bracketings landed on the same cell.'
    },
    {
      id: 'as-4', start: 54, end: 60, scene: 'assoc',
      caption: 'Closed plus associative is called a semigroup. That is the first named rung of the ladder, and nothing more is promised.',
      detail: 'A semigroup needs no identity and no inverses. The positive integers under addition are a semigroup and also a monoid; the positive integers under subtraction are not even closed.',
      keyword: 'semigroup',
      trap: null,
      narration: 'Closed plus associative is called a semigroup. That is the first named rung of the ladder, and nothing more is promised.'
    },

    /* ---------------- scene 3: identity ---------------- */
    {
      id: 'id-1', start: 60, end: 68, scene: 'identity',
      caption: 'An identity element leaves everything unchanged. In the table it is the row that copies the column headings, and the column that copies the row headings.',
      detail: 'In addition modulo 6 the identity is 0, because 0 plus a is a for every a. In multiplication modulo 6 the identity is 1, because 1 times a is a. The identity is found by scanning, not by guessing.',
      keyword: 'unchanged',
      trap: null,
      narration: 'An identity element leaves everything unchanged. In the table it is the row that copies the column headings.'
    },
    {
      id: 'id-2', start: 68, end: 76, scene: 'identity',
      caption: 'There can be at most one. If e and f are both identities then e equals e star f, and e star f equals f, so the two names are one element.',
      detail: 'That three-line argument is worth memorising, because it is the standard shape of a uniqueness proof: assume two, show they are equal. Questions that ask how many identities a structure can have are settled by it.',
      keyword: 'at most one',
      trap: null,
      narration: 'There can be at most one. If e and f are both identities then e equals e star f, and e star f equals f, so the two names are one element.'
    },
    {
      id: 'id-3', start: 76, end: 84, scene: 'identity',
      caption: 'A semigroup with an identity is a monoid. Addition modulo 6 is a monoid, multiplication modulo 6 is a monoid, and so are the strings under concatenation with the empty string.',
      detail: 'Other standard monoids: the natural numbers under addition with identity 0, the natural numbers under multiplication with identity 1, the power set under union with identity the empty set, and the functions from a set to itself under composition with identity the identity function.',
      keyword: 'monoid',
      trap: 'The integers under subtraction have no identity, so they are not a monoid even though subtraction looks like addition. The identity must work on both sides, and 0 minus a is not a.',
      narration: 'A semigroup with an identity is a monoid. Addition modulo 6 is a monoid, multiplication modulo 6 is a monoid, and so are the strings under concatenation.'
    },
    {
      id: 'id-4', start: 84, end: 90, scene: 'identity',
      caption: 'So the ladder so far reads: closed, then associative, then an identity. Two more rungs remain, and the next one is the one that decides most exam questions.',
      detail: 'The order of the rungs matters: a structure cannot have an identity unless the operation is associative in the sense the word is used here, and it cannot have inverses without an identity to aim at.',
      keyword: 'two more rungs',
      trap: null,
      narration: 'So the ladder so far reads: closed, then associative, then an identity. Two more rungs remain.'
    },

    /* ---------------- scene 4: inverse ---------------- */
    {
      id: 'in-1', start: 90, end: 98, scene: 'inverse',
      caption: 'An inverse of a is an element b with a star b equal to the identity and b star a equal to the identity. In the table, the identity cell must appear in the row of a.',
      detail: 'Both sides are required in the definition. In a finite associative structure one side is enough, but the definition is written with both because it must also work for infinite structures and for non-associative ones.',
      keyword: 'inverse',
      trap: null,
      narration: 'An inverse of a is an element b with a star b equal to the identity and b star a equal to the identity. The identity cell must appear in the row of a.'
    },
    {
      id: 'in-2', start: 98, end: 106, scene: 'inverse',
      caption: 'Multiplication modulo 6 fails on four rows. Zero has no inverse, and neither do 2, 3 and 4, because their products with everything are even or zero and never 1.',
      detail: 'The elements that do have inverses are exactly the ones coprime to 6, namely 1 and 5. Those two form a group on their own, the units of Z6, and that group has order 2.',
      keyword: 'four rows',
      trap: 'Do not assume that multiplication on a set of numbers is a group. It is a group only after the zero and the non-units are removed.',
      narration: 'Multiplication modulo 6 fails on four rows. Zero has no inverse, and neither do 2, 3 and 4.'
    },
    {
      id: 'in-3', start: 106, end: 114, scene: 'inverse',
      caption: 'Addition modulo 6 passes on every row. The inverse of a is 6 minus a, and 0 is its own inverse. That structure is a group.',
      detail: 'The group is written Z6 or Z/6Z. It has six elements, it is commutative, and every element can be written as a repeated sum of the element 1, which makes it cyclic.',
      keyword: 'a group',
      trap: null,
      narration: 'Addition modulo 6 passes on every row. The inverse of a is 6 minus a, and 0 is its own inverse. That structure is a group.'
    },
    {
      id: 'in-4', start: 114, end: 120, scene: 'inverse',
      caption: 'So a group is a monoid in which every element has an inverse. Same set, two operations, two different answers: one monoid, one group.',
      detail: 'This pair is the single most useful example in the topic, because it shows that the classification belongs to the pair of set and operation, never to the set alone.',
      keyword: 'monoid in which every element has an inverse',
      trap: 'A question may ask about the structure (S, star) and name S only. Read which operation is written; the verdict changes with it.',
      narration: 'So a group is a monoid in which every element has an inverse. Same set, two operations, two different answers.'
    },

    /* ---------------- scene 5: abelian ---------------- */
    {
      id: 'ab-1', start: 120, end: 128, scene: 'abelian',
      caption: 'Commutativity says a star b equals b star a. In the table it is a statement about the whole picture: the cell in row a column b must match the cell in row b column a.',
      detail: 'A table with that mirror symmetry is symmetric about its diagonal. Testing it is a scan of the upper triangle against the lower triangle, and one mismatched pair is enough to refute the claim.',
      keyword: 'mirror symmetry',
      trap: null,
      narration: 'Commutativity says a star b equals b star a. In the table it is a statement about the whole picture: the mirror cell must match.'
    },
    {
      id: 'ab-2', start: 128, end: 136, scene: 'abelian',
      caption: 'Now the six permutations of three letters under composition. This is S3, the symmetric group, and it has six elements like Z6 does.',
      detail: 'A permutation is written as the list of where each letter goes. The permutation 120 sends 0 to 1, 1 to 2 and 2 to 0. Composition means apply the left permutation first, then the right one.',
      keyword: 'six permutations',
      trap: null,
      narration: 'Now the six permutations of three letters under composition. This is S3, the symmetric group, and it has six elements like Z6 does.'
    },
    {
      id: 'ab-3', start: 136, end: 144, scene: 'abelian',
      caption: 'Two of them fail to commute. Swapping the first two letters and then cycling gives a different permutation from cycling and then swapping.',
      detail: 'The pair is a transposition and a three-cycle. Their two products differ, so the table is not symmetric, so S3 is not abelian. This is the standard counterexample to "every group is commutative".',
      keyword: 'fail to commute',
      trap: 'Two groups with the same number of elements need not be the same group. Z6 is abelian and S3 is not, and commutativity is preserved by isomorphism, so they cannot be isomorphic.',
      narration: 'Two of them fail to commute. Swapping the first two letters and then cycling gives a different permutation from cycling and then swapping.'
    },
    {
      id: 'ab-4', start: 144, end: 150, scene: 'abelian',
      caption: 'An abelian group is a group whose table is symmetric. Z6 is abelian; S3 is a group and not abelian; both have order 6.',
      detail: 'The name honours Niels Henrik Abel. Every group of order 2, 3 or 5 is abelian because every group of prime order is cyclic, and the smallest non-abelian group is S3 of order 6.',
      keyword: 'abelian',
      trap: null,
      narration: 'An abelian group is a group whose table is symmetric. Z6 is abelian; S3 is a group and not abelian; both have order 6.'
    },

    /* ---------------- scene 6: order ---------------- */
    {
      id: 'or-1', start: 150, end: 158, scene: 'order',
      caption: 'The order of an element is the smallest positive power that returns the identity. In the units of 7, the powers of 2 are 2, 4, 1, so 2 has order 3.',
      detail: 'Powers here mean repeated multiplication modulo 7. The units of 7 are 1 to 6, and 2 times 2 is 4, 4 times 2 is 8 which is 1 modulo 7. The identity returned after three steps, and not before.',
      keyword: 'order of an element',
      trap: 'The order of an element is not its value. The element 2 has order 3 in this group; the element 1 has order 1 in every group.',
      narration: 'The order of an element is the smallest positive power that returns the identity. In the units of 7, the powers of 2 are 2, 4, 1, so 2 has order 3.'
    },
    {
      id: 'or-2', start: 158, end: 166, scene: 'order',
      caption: 'If some element has order equal to the size of the group, it generates everything and the group is cyclic. Here 3 generates all six units of 7.',
      detail: 'The powers of 3 modulo 7 run 3, 2, 6, 4, 5, 1: six distinct values before the identity returns, so the order is 6 and the element is a generator. The units of 7 form a cyclic group of order 6, and 5 is the other generator.',
      keyword: 'cyclic',
      trap: null,
      narration: 'If some element has order equal to the size of the group, it generates everything and the group is cyclic. Here 3 generates all six units of 7.'
    },
    {
      id: 'or-3', start: 166, end: 174, scene: 'order',
      caption: 'Two groups of order 4. The integers modulo 4 have an element of order 4. The units of 8 have only orders 1 and 2, so no single element generates the group.',
      detail: 'The units of 8 are 1, 3, 5, 7, and each of 3, 5, 7 squares to 1 modulo 8. That group is the Klein four group, written V4, and it is isomorphic to Z2 times Z2. Both groups of order 4 are abelian; only one is cyclic.',
      keyword: 'Klein four group',
      trap: 'Cyclic is stronger than abelian. Both groups of order 4 are abelian, and only Z4 is cyclic, so a question that asks whether a group is cyclic is not answered by its commutativity.',
      narration: 'Two groups of order 4. The integers modulo 4 have an element of order 4. The units of 8 have only orders 1 and 2, so no single element generates the group.'
    },
    {
      id: 'or-4', start: 174, end: 180, scene: 'order',
      caption: 'The order of an element always divides the order of the group. That single sentence is the reason most subgroup questions can be answered by arithmetic.',
      detail: 'The reason is that the powers of an element form a subgroup whose size is exactly the order of the element, so the divisor statement follows from the subgroup statement proved in the next scene.',
      keyword: 'divides',
      trap: null,
      narration: 'The order of an element always divides the order of the group. That single sentence answers most subgroup questions by arithmetic.'
    },

    /* ---------------- scene 7: subgroup ---------------- */
    {
      id: 'sg-1', start: 180, end: 188, scene: 'subgroup',
      caption: 'A subgroup is a subset that is itself a group under the same operation. To test it: the identity is inside, the subset is closed, and every element inside has its inverse inside.',
      detail: 'For a finite subset of a group, closure alone implies the other two conditions, because the powers of an element must repeat and the first repeat is the identity. The full test is safest in an exam answer.',
      keyword: 'subgroup',
      trap: null,
      narration: 'A subgroup is a subset that is itself a group under the same operation. The identity is inside, the subset is closed, and every element has its inverse inside.'
    },
    {
      id: 'sg-2', start: 188, end: 196, scene: 'subgroup',
      caption: 'Addition modulo 6 has four subgroups: zero alone, zero with 3, zero with 2 and 4, and the whole group. Sizes 1, 2, 3 and 6.',
      detail: 'Every one of those sizes divides 6. A subgroup of size 4 or 5 cannot exist here, and the divisor test in the next scene explains why without listing anything.',
      keyword: 'four subgroups',
      trap: 'The trivial subgroup and the group itself both count. A question that asks for proper subgroups excludes the group itself, and one that asks for non-trivial subgroups excludes the identity alone.',
      narration: 'Addition modulo 6 has four subgroups: zero alone, zero with 3, zero with 2 and 4, and the whole group. Sizes 1, 2, 3 and 6.'
    },
    {
      id: 'sg-3', start: 196, end: 204, scene: 'subgroup',
      caption: 'Shift the subgroup by each element and you get cosets. Each coset has the same size, and together they split the group with nothing left over.',
      detail: 'For the subgroup holding 0 and 3, the three cosets are 0 with 3, 1 with 4, and 2 with 5. They are disjoint and they cover all six elements, which is the whole proof of Lagrange in one picture.',
      keyword: 'cosets',
      trap: null,
      narration: 'Shift the subgroup by each element and you get cosets. Each coset has the same size, and together they split the group with nothing left over.'
    },
    {
      id: 'sg-4', start: 204, end: 210, scene: 'subgroup',
      caption: 'The number of cosets is the index, and the group size is the index times the subgroup size. So the subgroup size divides the group size.',
      detail: 'Written as |G| equals the index times |H|. This is Lagrange\'s theorem, and the equality is exact rather than an inequality, which is what makes it a counting tool.',
      keyword: 'index',
      trap: null,
      narration: 'The number of cosets is the index, and the group size is the index times the subgroup size. So the subgroup size divides the group size.'
    },

    /* ---------------- scene 8: lagrange ---------------- */
    {
      id: 'lg-1', start: 210, end: 218, scene: 'lagrange',
      caption: "Lagrange's theorem: the order of a subgroup divides the order of the group. A group of 35 elements can only have subgroups of size 1, 5, 7 or 35.",
      detail: 'The divisors of 35 are 1, 5, 7 and 35. Excluding the group itself, the largest possible proper subgroup has size 7, and it exists, generated by the element 5.',
      keyword: 'divides',
      trap: null,
      narration: "Lagrange's theorem: the order of a subgroup divides the order of the group. A group of 35 elements can only have subgroups of size 1, 5, 7 or 35."
    },
    {
      id: 'lg-2', start: 218, end: 226, scene: 'lagrange',
      caption: 'The same one-line test answers the other sizes. For 84 the largest proper divisor is 42, and for 15 with a subgroup of at least 4 elements the only candidate is 5.',
      detail: 'The largest proper divisor of a composite number is the number divided by its smallest prime factor. For 84 that is 42, for 15 it is 5, and for 35 it is 7. This is the fastest route to every question of this family.',
      keyword: 'largest proper divisor',
      trap: 'The divisor test bounds the answer; it does not guarantee that a subgroup of that size exists in the particular group. The bound is an upper limit, and existence needs a separate argument.',
      narration: 'The same one-line test answers the other sizes. For 84 the largest proper divisor is 42, and for 15 with a subgroup of at least 4 elements the only candidate is 5.'
    },
    {
      id: 'lg-3', start: 226, end: 234, scene: 'lagrange',
      caption: 'Now the warning. The alternating group on four letters has 12 elements, and six divides twelve, but it has no subgroup of order 6.',
      detail: 'The subgroups of A4 have sizes 1, 2, 3, 4 and 12, counted here by testing all 4096 subsets for closure and inverses. Six is a divisor that is missing, so the converse of Lagrange is false.',
      keyword: 'no subgroup of order 6',
      trap: 'Never answer "a subgroup of order d exists because d divides the order". That inference is valid only for cyclic groups, where every divisor does give exactly one subgroup.',
      narration: 'Now the warning. The alternating group on four letters has 12 elements, and six divides twelve, but it has no subgroup of order 6.'
    },
    {
      id: 'lg-4', start: 234, end: 240, scene: 'lagrange',
      caption: 'In a cyclic group the converse does hold: one subgroup for each divisor. The integers modulo 12 have six divisors and exactly six subgroups.',
      detail: 'The subgroup of order d is generated by the element 12 over d. That gives sizes 1, 2, 3, 4, 6 and 12, and no others, which is why cyclic-group questions reduce to counting divisors.',
      keyword: 'one subgroup for each divisor',
      trap: null,
      narration: 'In a cyclic group the converse does hold: one subgroup for each divisor. The integers modulo 12 have six divisors and exactly six subgroups.'
    },

    /* ---------------- scene 9: prime ---------------- */
    {
      id: 'pr-1', start: 240, end: 248, scene: 'prime',
      caption: 'If the order is prime, every non-identity element has order equal to the whole group, so every non-identity element generates it. Every group of prime order is cyclic.',
      detail: 'The argument is two lines: the order of an element divides the group order by Lagrange, and a prime has only two divisors, so the order is 1 or p. An element of order 1 is the identity, so every other element has order p and generates the group.',
      keyword: 'prime order',
      trap: null,
      narration: 'If the order is prime, every non-identity element has order equal to the whole group, so every non-identity element generates it. Every group of prime order is cyclic.'
    },
    {
      id: 'pr-2', start: 248, end: 256, scene: 'prime',
      caption: 'Order 6 is the first case where the answer is not forced. There are exactly two groups of order 6 up to renaming: Z6, which is cyclic, and S3, which is not.',
      detail: 'A group of order 6 either has an element of order 6, in which case it is Z6, or every element has order 1, 2 or 3, in which case it is S3. Nothing else is possible, and the element-order list distinguishes them immediately.',
      keyword: 'exactly two',
      trap: null,
      narration: 'Order 6 is the first case where the answer is not forced. There are exactly two groups of order 6 up to renaming: Z6, which is cyclic, and S3, which is not.'
    },
    {
      id: 'pr-3', start: 256, end: 264, scene: 'prime',
      caption: 'So if H is a subgroup with size strictly between 1 and 6, its size is 2 or 3. Both are prime, so H is cyclic in either group.',
      detail: 'This is the 2021 question. The group may be S3, which is not cyclic, and yet every proper non-trivial subgroup is cyclic because 2 and 3 are prime. The two halves of the sentence have different reasons and both must be stated.',
      keyword: '2 or 3',
      trap: 'The tempting error is to reason from the group to the subgroup. A non-cyclic group can have only cyclic subgroups, and S3 is the smallest example.',
      narration: 'So if H is a subgroup with size strictly between 1 and 6, its size is 2 or 3. Both are prime, so H is cyclic in either group.'
    },
    {
      id: 'pr-4', start: 264, end: 270, scene: 'prime',
      caption: 'And two groups of order 6 cannot be the same group when one has an element of order 6 and the other does not. Element orders are an isomorphism fingerprint.',
      detail: 'An isomorphism preserves the order of every element, so the sorted list of element orders is an invariant. Z6 gives 1, 2, 3, 3, 6, 6 and S3 gives 1, 2, 2, 2, 3, 3, which is enough to separate them.',
      keyword: 'fingerprint',
      trap: null,
      narration: 'And two groups of order 6 cannot be the same group when one has an element of order 6 and the other does not. Element orders are an isomorphism fingerprint.'
    },

    /* ---------------- scene 10: ladder ---------------- */
    {
      id: 'ld-1', start: 270, end: 278, scene: 'ladder',
      caption: 'For a classification question, climb the ladder in order and stop at the first rung that fails: closed, associative, identity, inverses, commutative.',
      detail: 'The ladder is what makes these questions mechanical. Each rung is one property, each failure names the structure, and the naming is a fixed vocabulary: semigroup, monoid, group, abelian group.',
      keyword: 'ladder',
      trap: 'Report the first rung that fails, not the most interesting one. A structure that is not closed is not a monoid even if it has an identity candidate.',
      narration: 'For a classification question, climb the ladder in order and stop at the first rung that fails: closed, associative, identity, inverses, commutative.'
    },
    {
      id: 'ld-2', start: 278, end: 286, scene: 'ladder',
      caption: 'The power set of a three-element set under symmetric difference: the empty set is the identity, every set is its own inverse, and the order of the whole group is 8.',
      detail: 'Symmetric difference keeps the elements in exactly one of the two sets. Union with itself gives the empty set, so every element has order 2, and the group is abelian. It is the direct product of three copies of Z2.',
      keyword: 'symmetric difference',
      trap: null,
      narration: 'The power set of a three-element set under symmetric difference: the empty set is the identity, every set is its own inverse, and the group is abelian.'
    },
    {
      id: 'ld-3', start: 286, end: 294, scene: 'ladder',
      caption: 'Functions from the non-negative integers to themselves under pointwise addition: closed, associative, commutative, identity is the zero function. But no inverse, so a monoid.',
      detail: 'The inverse of the function that is constantly 1 would have to send every number to minus 1, which is not a non-negative integer. That single value decides the whole question, which is why the 2025 question is about the missing rung and not about the arithmetic.',
      keyword: 'no inverse',
      trap: 'Closure here needs the infinite set. On a finite set of values, adding two functions can leave the set, so the structure would fail at the very first rung.',
      narration: 'Functions from the non-negative integers to themselves under pointwise addition: closed, associative, commutative, identity is the zero function. But no inverse, so a monoid.'
    },
    {
      id: 'ld-4', start: 294, end: 300, scene: 'ladder',
      caption: 'The integers under multiplication stop at the same rung: 1 is the identity, and 2 has no inverse among the integers. Multiplication is a monoid, not a group.',
      detail: 'Removing zero is not enough. The non-zero rationals under multiplication are a group, and the non-zero integers are not, because the inverse of 2 is one half. The set must be closed under taking inverses for the last rung to hold.',
      keyword: 'not a group',
      trap: null,
      narration: 'The integers under multiplication stop at the same rung: 1 is the identity, and 2 has no inverse among the integers. Multiplication is a monoid, not a group.'
    },

    /* ---------------- scene 11: rules ---------------- */
    {
      id: 'rl-1', start: 300, end: 308, scene: 'rules',
      caption: 'One: the verdict belongs to the pair of set and operation. Name the operation before you answer, and check closure first.',
      detail: 'The same set gives a monoid under one operation and a group under another. Reading the operation is the step candidates skip, and it is the step that decides the question.',
      keyword: 'set and operation',
      trap: null,
      narration: 'One: the verdict belongs to the pair of set and operation. Name the operation before you answer, and check closure first.'
    },
    {
      id: 'rl-2', start: 308, end: 316, scene: 'rules',
      caption: "Two: for any subgroup question on a finite group, start with Lagrange. The size divides the order, so list the divisors and read the answer off.",
      detail: 'Largest proper subgroup is the order divided by its smallest prime factor. Subgroup sizes with a lower bound are the divisors above it. A subgroup of order d exists for every divisor only when the group is cyclic.',
      keyword: 'Lagrange',
      trap: 'Lagrange bounds and forbids; it does not guarantee. Answer "must exist" only for cyclic groups or when the question supplies the subgroup.',
      narration: 'Two: for any subgroup question on a finite group, start with Lagrange. The size divides the order, so list the divisors.'
    },
    {
      id: 'rl-3', start: 316, end: 324, scene: 'rules',
      caption: 'Three: the order of an element divides the group order, and a group is cyclic exactly when some element has order equal to the group size.',
      detail: 'Computing the order of an element is repeated multiplication until the identity returns. Cyclic is stronger than abelian: both groups of order 4 are abelian, and only Z4 is cyclic.',
      keyword: 'cyclic',
      trap: null,
      narration: 'Three: the order of an element divides the group order, and a group is cyclic exactly when some element has order equal to the group size.'
    },
    {
      id: 'rl-4', start: 324, end: 330, scene: 'rules',
      caption: 'Four: know the two groups of order 6. Z6 is cyclic and abelian; S3 is neither, and every proper non-trivial subgroup of either is cyclic.',
      detail: 'Those two examples settle most statements of the form "for every group G". A claim that fails in S3 is false, and a claim that holds in both of the only two groups of order 6 holds for order 6.',
      keyword: 'two groups of order 6',
      trap: null,
      narration: 'Four: know the two groups of order 6. Z6 is cyclic and abelian; S3 is neither, and every proper non-trivial subgroup of either is cyclic.'
    }
  ]
};
