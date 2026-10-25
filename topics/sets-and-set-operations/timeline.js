/* ==========================================================================
   sets-and-set-operations — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs — never edited by hand.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'membership',
      n: 1,
      title: 'A set is a collection, and membership is the only question',
      start: 0, end: 30,
      objective: 'State what a set is, see that order and repetition are not part of it, and read the membership symbol as the one primitive relation every other idea is built from.'
    },
    {
      id: 'empty',
      n: 2,
      title: 'The empty set and the two symbols that look like it',
      start: 30, end: 62,
      objective: 'Separate the empty set from the set holding zero and from the set holding the empty set, using computed sizes and membership tests rather than a slogan.'
    },
    {
      id: 'subset',
      n: 3,
      title: 'Subset is an implication over elements',
      start: 62, end: 96,
      objective: 'Evaluate A subset of B by testing every element of the universe, see why the empty set passes automatically, and use double inclusion to prove two sets equal.'
    },
    {
      id: 'powerset',
      n: 4,
      title: 'The power set, and why its size is two to the n',
      start: 96, end: 128,
      objective: 'Enumerate every subset of a three-element set, count them as 2^n, and see that the power set of the empty set holds exactly one element.'
    },
    {
      id: 'ops',
      n: 5,
      title: 'Union, intersection, difference, symmetric difference, complement',
      start: 128, end: 162,
      objective: 'Compute all five operations on one concrete pair of sets and read each result off the picture rather than from memory.'
    },
    {
      id: 'demorgan',
      n: 6,
      title: 'De Morgan for sets is De Morgan for logic',
      start: 162, end: 194,
      objective: 'Verify both complement laws on every pair of subsets of a three-element universe, and see the logical law that forces them.'
    },
    {
      id: 'cardinality',
      n: 7,
      title: 'Counting a union: inclusion and exclusion',
      start: 194, end: 228,
      objective: 'Derive the two-set and three-set union formulas from the double count, check both by enumeration, and read off the two inequalities they imply.'
    },
    {
      id: 'product',
      n: 8,
      title: 'The Cartesian product is a set of ordered pairs',
      start: 228, end: 260,
      objective: 'Build A cross B, count it as the product of the sizes, see that swapping the operands changes the set, and see why a product with the empty set is empty.'
    },
    {
      id: 'bits',
      n: 9,
      title: 'Every subset is a bit string',
      start: 260, end: 286,
      objective: 'Turn each subset into a row of bits, recover 2^n from the picture, and use the same three-way choice per element to count subset pairs.'
    },
    {
      id: 'rules',
      n: 10,
      title: 'The three rules to carry into the exam',
      start: 286, end: 300,
      objective: 'Consolidate membership as the primitive, the two symbols that are not the empty set, and the two counting formulas into three lines.'
    }
  ],

  events: [
    /* ---------------- scene 1: membership ---------------- */
    {
      id: 'm-1', start: 0, end: 7, scene: 'membership',
      caption: 'A set is a collection of distinct objects. The objects are its elements.',
      detail: 'The objects can be numbers, letters, people, or other sets. Distinct means the collection is judged by which objects are in it, not by how many times a name was written.',
      keyword: 'set',
      trap: null,
      narration: 'A set is a collection of distinct objects. The objects are its elements.'
    },
    {
      id: 'm-2', start: 7, end: 15, scene: 'membership',
      caption: 'Order and repetition are not part of a set: {1, 2, 3} and {3, 1, 2, 2} are the same set.',
      detail: 'Both listings contain exactly the numbers one, two and three, so the two sets are equal. A listing is one way to name a set, never the set itself.',
      keyword: 'same set',
      trap: 'Writing an element twice does not make a larger set, and writing the elements in another order does not make a different one.',
      narration: 'Order and repetition are not part of a set. The set one two three and the set three one two two are the same set.'
    },
    {
      id: 'm-3', start: 15, end: 22, scene: 'membership',
      caption: 'Write x in A when x is an element of A, and x not in A when it is not.',
      detail: 'The symbol that looks like a small e means is an element of. Every verdict on this screen is computed by testing the elements one at a time against the set, not typed in by hand.',
      keyword: 'is an element of',
      trap: null,
      narration: 'Write x in A when x is an element of A, and x not in A when it is not.'
    },
    {
      id: 'm-4', start: 22, end: 30, scene: 'membership',
      caption: 'Roster form lists the elements. Set-builder form states the rule an element must satisfy.',
      detail: 'The roster form is only usable for a set you can finish listing. The set-builder form works for infinite sets too: the set of all x in the universe such that x is even, for example.',
      keyword: 'set-builder',
      trap: null,
      narration: 'Roster form lists the elements. Set-builder form states the rule an element must satisfy.'
    },

    /* ---------------- scene 2: empty ---------------- */
    {
      id: 'e-1', start: 30, end: 37, scene: 'empty',
      caption: 'The empty set has no elements at all. It is written as the empty-set symbol, or as a pair of braces with nothing between them.',
      detail: 'Its size is zero. There is exactly one empty set: any two collections with no elements contain the same elements, namely none.',
      keyword: 'empty set',
      trap: null,
      narration: 'The empty set has no elements at all. Its size is zero.'
    },
    {
      id: 'e-2', start: 37, end: 45, scene: 'empty',
      caption: 'The set holding zero is not empty. It has one element, the number zero.',
      detail: 'The braces matter. Without them you have the number zero; with them you have a set whose single element is zero. The computed sizes below are zero and one.',
      keyword: 'not empty',
      trap: 'This is the single most common set-theory error: writing the empty set as a set containing zero.',
      narration: 'The set holding zero is not empty. It has one element, the number zero.'
    },
    {
      id: 'e-3', start: 45, end: 53, scene: 'empty',
      caption: 'The set holding the empty set is also not empty. Its one element is the empty set.',
      detail: 'Nesting a set inside braces always produces a set with one more level. The empty set is an element of this set, and the empty set is a subset of every set, including this one.',
      keyword: 'one element',
      trap: null,
      narration: 'The set holding the empty set is also not empty. Its one element is the empty set.'
    },
    {
      id: 'e-4', start: 53, end: 62, scene: 'empty',
      caption: 'So the empty set and the set holding the empty set are different sets: sizes zero and one.',
      detail: 'Four computed tests separate them: the empty set is an element of the set holding it, but not an element of itself; the set holding it is not a subset of the empty set, while the empty set is a subset of it.',
      keyword: 'different sets',
      trap: 'A question that writes these two symbols interchangeably has changed the answer, not the notation.',
      narration: 'So the empty set and the set holding the empty set are different sets: sizes zero and one.'
    },

    /* ---------------- scene 3: subset ---------------- */
    {
      id: 's-1', start: 62, end: 70, scene: 'subset',
      caption: 'A is a subset of B when every element of A is also an element of B.',
      detail: 'Written A subset-of B. The relation compares the two sets element by element; it says nothing about size, and a set is always a subset of itself.',
      keyword: 'subset',
      trap: null,
      narration: 'A is a subset of B when every element of A is also an element of B.'
    },
    {
      id: 's-2', start: 70, end: 78, scene: 'subset',
      caption: 'Read the definition as an implication: for every x, if x is in A then x is in B.',
      detail: 'The test runs over the whole universe, not only over the elements of A. An element outside A makes the implication true automatically, which is exactly why extra elements in B are harmless.',
      keyword: 'if then',
      trap: 'Testing only the elements of A hides nothing here, but testing only the elements of B answers a different question.',
      narration: 'Read the definition as an implication: for every x, if x is in A then x is in B.'
    },
    {
      id: 's-3', start: 78, end: 87, scene: 'subset',
      caption: 'The empty set is a subset of every set, because there is no element of it that could fail the test.',
      detail: 'The implication has a false hypothesis at every element, and an implication with a false hypothesis is true. Nothing about the other set is used, so the claim holds for all of them.',
      keyword: 'empty set is a subset',
      trap: null,
      narration: 'The empty set is a subset of every set, because there is no element of it that could fail the test.'
    },
    {
      id: 's-4', start: 87, end: 96, scene: 'subset',
      caption: 'Two sets are equal exactly when each is a subset of the other. That is the double-inclusion method.',
      detail: 'To prove two sets equal, prove both inclusions. To prove them different, exhibit one element in exactly one of them. Both directions were checked on all sixty-four pairs of subsets of a three-element universe.',
      keyword: 'double inclusion',
      trap: null,
      narration: 'Two sets are equal exactly when each is a subset of the other. That is the double-inclusion method.'
    },

    /* ---------------- scene 4: powerset ---------------- */
    {
      id: 'p-1', start: 96, end: 104, scene: 'powerset',
      caption: 'The power set of A is the set whose elements are all the subsets of A.',
      detail: 'It is written P of A, or two to the A. Its elements are themselves sets, which is why every element of a power set is written inside braces.',
      keyword: 'power set',
      trap: null,
      narration: 'The power set of A is the set whose elements are all the subsets of A.'
    },
    {
      id: 'p-2', start: 104, end: 112, scene: 'powerset',
      caption: 'If A has n elements, the power set has two to the n elements.',
      detail: 'Each element of A makes one independent decision: present in the subset, or absent. Two choices per element and n elements give two to the n different subsets.',
      keyword: 'two to the n',
      trap: null,
      narration: 'If A has n elements, the power set has two to the n elements.'
    },
    {
      id: 'p-3', start: 112, end: 120, scene: 'powerset',
      caption: 'Here are all eight subsets of a three-element set, produced by enumeration in this page.',
      detail: 'One subset of size zero, three of size one, three of size two, and one of size three. The counts one, three, three, one are the binomial coefficients for n equal to three.',
      keyword: 'eight subsets',
      trap: null,
      narration: 'Here are all eight subsets of a three-element set, produced by enumeration in this page.'
    },
    {
      id: 'p-4', start: 120, end: 128, scene: 'powerset',
      caption: 'The power set of the empty set holds one element, the empty set, and two to the zero is one.',
      detail: 'This is consistent, not an exception. The empty set has no elements to decide about, so there is exactly one subset of it. Applying the power set twice gives two elements.',
      keyword: 'power set of the empty set',
      trap: null,
      narration: 'The power set of the empty set holds one element, the empty set, and two to the zero is one.'
    },

    /* ---------------- scene 5: ops ---------------- */
    {
      id: 'o-1', start: 128, end: 136, scene: 'ops',
      caption: 'The union holds everything that is in A or in B, including what is in both.',
      detail: 'The word or here is inclusive, exactly as in propositional logic. An element in both sets appears once in the union, because a set does not record repetition.',
      keyword: 'union',
      trap: null,
      narration: 'The union holds everything that is in A or in B, including what is in both.'
    },
    {
      id: 'o-2', start: 136, end: 144, scene: 'ops',
      caption: 'The intersection holds what is in both. The difference holds what is in A and not in B.',
      detail: 'The difference is not symmetric: taking B away from A is a different set from taking A away from B. The symmetric difference holds the elements in exactly one of the two.',
      keyword: 'intersection',
      trap: 'Set difference does not commute. A minus B and B minus A are different sets whenever the two sets differ.',
      narration: 'The intersection holds what is in both. The difference holds what is in A and not in B.'
    },
    {
      id: 'o-3', start: 144, end: 152, scene: 'ops',
      caption: 'The complement of A is everything in the universe that is not in A.',
      detail: 'A complement needs a stated universe. Without one, the complement is not defined, which is why every question about complements names the universal set first.',
      keyword: 'complement',
      trap: 'A complement without a stated universe is not a set at all. Read the question for the universal set before computing anything.',
      narration: 'The complement of A is everything in the universe that is not in A.'
    },
    {
      id: 'o-4', start: 152, end: 162, scene: 'ops',
      caption: 'One concrete pair, computed five ways. The number under each result is its size.',
      detail: 'The two circles show the elements by region: left only, in both, right only. Each roster below was produced by testing the three elements of the universe against the definitions, not copied from a table.',
      keyword: 'computed',
      trap: null,
      narration: 'One concrete pair, computed five ways. The number under each result is its size.'
    },

    /* ---------------- scene 6: demorgan ---------------- */
    {
      id: 'd-1', start: 162, end: 170, scene: 'demorgan',
      caption: 'The complement of a union is the intersection of the complements.',
      detail: 'An element escapes the union only when it is in neither set, which is exactly the condition for being in both complements. Checked on all sixty-four pairs of subsets of a three-element universe.',
      keyword: 'complement of a union',
      trap: null,
      narration: 'The complement of a union is the intersection of the complements.'
    },
    {
      id: 'd-2', start: 170, end: 178, scene: 'demorgan',
      caption: 'The complement of an intersection is the union of the complements.',
      detail: 'An element misses the intersection as soon as it misses one of the two sets, which is exactly the condition for being in at least one complement. Also checked on all sixty-four pairs.',
      keyword: 'complement of an intersection',
      trap: null,
      narration: 'The complement of an intersection is the union of the complements.'
    },
    {
      id: 'd-3', start: 178, end: 186, scene: 'demorgan',
      caption: 'Both laws come from one logical law, applied element by element.',
      detail: 'The statement that x is in the union is the disjunction of two membership statements. Negating a disjunction gives a conjunction of negations, and that is the whole proof.',
      keyword: 'one logical law',
      trap: null,
      narration: 'Both laws come from one logical law, applied element by element.'
    },
    {
      id: 'd-4', start: 186, end: 194, scene: 'demorgan',
      caption: 'So set identities are logical identities in disguise, and the truth table you already know settles them.',
      detail: 'This is the bridge from the logic lessons to set algebra: every set identity can be checked by replacing membership with a proposition and using a truth table. The counts on the right are that check, run in code.',
      keyword: 'in disguise',
      trap: null,
      narration: 'So set identities are logical identities in disguise, and the truth table you already know settles them.'
    },

    /* ---------------- scene 7: cardinality ---------------- */
    {
      id: 'c-1', start: 194, end: 202, scene: 'cardinality',
      caption: 'Adding the two sizes counts the overlap twice, so subtract it once.',
      detail: 'Every element in exactly one set is counted once by each size, which is correct. Every element in both is counted twice, so the intersection must come off once. Checked on all sixty-four pairs.',
      keyword: 'subtract the overlap',
      trap: null,
      narration: 'Adding the two sizes counts the overlap twice, so subtract it once.'
    },
    {
      id: 'c-2', start: 202, end: 210, scene: 'cardinality',
      caption: 'For three sets, add the three sizes, subtract the three pairwise overlaps, add the triple overlap back.',
      detail: 'The triple overlap is counted three times by the sizes, removed three times by the pairwise terms, and so must be restored once. Checked on all five hundred and twelve triples of subsets.',
      keyword: 'three sets',
      trap: 'Leaving out the final plus term is the standard error, and it is wrong exactly on elements that lie in all three sets.',
      narration: 'For three sets, add the three sizes, subtract the three pairwise overlaps, add the triple overlap back.'
    },
    {
      id: 'c-3', start: 210, end: 218, scene: 'cardinality',
      caption: 'Two bounds follow at once: the union is at least as large as either set, and at most the sum of the sizes.',
      detail: 'Both were checked by enumeration. They are the fastest way to eliminate options in a numerical question: an option outside these bounds is wrong without any further work.',
      keyword: 'bounds',
      trap: null,
      narration: 'Two bounds follow at once: the union is at least as large as either set, and at most the sum of the sizes.'
    },
    {
      id: 'c-4', start: 218, end: 228, scene: 'cardinality',
      caption: 'The same subtraction gives the difference and the symmetric difference.',
      detail: 'Removing B from A deletes exactly the shared part, so the size drops by the intersection. The symmetric difference deletes the shared part from both sides, so it comes off twice.',
      keyword: 'difference',
      trap: null,
      narration: 'The same subtraction gives the difference and the symmetric difference.'
    },

    /* ---------------- scene 8: product ---------------- */
    {
      id: 'x-1', start: 228, end: 236, scene: 'product',
      caption: 'The Cartesian product is the set of all ordered pairs, first coordinate from A and second from B.',
      detail: 'An ordered pair is not a set of two elements: the pair a comma x is different from the pair x comma a. That is what makes the product sensitive to which set comes first.',
      keyword: 'ordered pairs',
      trap: null,
      narration: 'The Cartesian product is the set of all ordered pairs, first coordinate from A and second from B.'
    },
    {
      id: 'x-2', start: 236, end: 244, scene: 'product',
      caption: 'Its size is the product of the sizes: every first coordinate is paired with every second coordinate once.',
      detail: 'A grid makes this visible: three rows and two columns give six cells, and each cell is one pair. The count was checked for every pair of subsets of the universe.',
      keyword: 'product of the sizes',
      trap: null,
      narration: 'Its size is the product of the sizes: every first coordinate is paired with every second coordinate once.'
    },
    {
      id: 'x-3', start: 244, end: 252, scene: 'product',
      caption: 'Swapping the two sets changes the product whenever the sets differ.',
      detail: 'The pairs are reversed, so a pair in one product is generally not in the other. The two products have the same size, which is why they are easy to confuse, but they are different sets.',
      keyword: 'changes the product',
      trap: 'Equal size does not mean equal set. A question that treats A cross B and B cross A as the same set is wrong even though the sizes agree.',
      narration: 'Swapping the two sets changes the product whenever the sets differ.'
    },
    {
      id: 'x-4', start: 252, end: 260, scene: 'product',
      caption: 'A product with the empty set is empty: there is no second coordinate to pair anything with.',
      detail: 'The size formula agrees, since anything times zero is zero. The same argument gives an empty product whenever either side is empty, and a non-empty product whenever both sides are non-empty.',
      keyword: 'product with the empty set',
      trap: null,
      narration: 'A product with the empty set is empty: there is no second coordinate to pair anything with.'
    },

    /* ---------------- scene 9: bits ---------------- */
    {
      id: 'b-1', start: 260, end: 268, scene: 'bits',
      caption: 'Fix the universe and put its three elements in a fixed order. A subset becomes a row of three bits.',
      detail: 'A bit is one when the element is in the subset and zero when it is not. The order of the columns is fixed once and used for every row, so each row is a complete description of one subset.',
      keyword: 'row of three bits',
      trap: null,
      narration: 'Fix the universe and put its three elements in a fixed order. A subset becomes a row of three bits.'
    },
    {
      id: 'b-2', start: 268, end: 277, scene: 'bits',
      caption: 'Eight rows, eight subsets. That is where two to the n comes from.',
      detail: 'Every subset appears once and no two rows agree, so the bit strings and the subsets are two names for the same eight objects. The correspondence is a bijection, and it was checked by counting distinct rows.',
      keyword: 'eight rows',
      trap: null,
      narration: 'Eight rows, eight subsets. That is where two to the n comes from.'
    },
    {
      id: 'b-3', start: 277, end: 286, scene: 'bits',
      caption: 'The same picture counts subset pairs: each element has three choices, so there are three to the n pairs with A inside B.',
      detail: 'For each element: in neither set, in B only, or in both. That is three options, independently, for every element. For three elements the count is twenty-seven, computed here by listing all sixty-four pairs and testing the inclusion.',
      keyword: 'three choices',
      trap: null,
      narration: 'The same picture counts subset pairs: each element has three choices, so there are three to the n pairs with A inside B.'
    },

    /* ---------------- scene 10: rules ---------------- */
    {
      id: 'r-1', start: 286, end: 291, scene: 'rules',
      caption: 'One: membership is the primitive. Subset is an implication over members.',
      detail: 'When a set question looks unfamiliar, expand the definitions of subset, union and intersection into statements about elements, and the question becomes a logic question.',
      keyword: 'membership is the primitive',
      trap: null,
      narration: 'Rule one: membership is the primitive. Subset is an implication over members.'
    },
    {
      id: 'r-2', start: 291, end: 296, scene: 'rules',
      caption: 'Two: the empty set is not the set holding zero, and not the set holding itself.',
      detail: 'The three symbols have sizes zero, one and one, and they are three different sets. A question that mixes them has already changed its own answer.',
      keyword: 'not the set holding zero',
      trap: null,
      narration: 'Rule two: the empty set is not the set holding zero, and not the set holding itself.'
    },
    {
      id: 'r-3', start: 296, end: 300, scene: 'rules',
      caption: 'Three: the union size subtracts the overlap, and the product size multiplies the sizes.',
      detail: 'Two formulas cover most numerical questions: the union size by inclusion and exclusion, and the product size by multiplication. Both were checked by enumeration in this page.',
      keyword: 'subtracts the overlap',
      trap: null,
      narration: 'Rule three: the union size subtracts the overlap, and the product size multiplies the sizes.'
    }
  ]
};
