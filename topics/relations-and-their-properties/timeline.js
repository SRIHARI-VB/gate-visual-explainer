/* ==========================================================================
   relations-and-their-properties — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs — never edited by hand.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'definition',
      n: 1,
      title: 'A relation is a set of ordered pairs, and nothing more',
      start: 0, end: 30,
      objective: 'See a relation on a three-element set as a subset of the nine cells of A cross A, and count all of them as two to the n squared.'
    },
    {
      id: 'matrix',
      n: 2,
      title: 'One object, two pictures: the 0/1 matrix and the arrow diagram',
      start: 30, end: 60,
      objective: 'Translate between the pair list, the matrix and the digraph, and locate the diagonal and the mirrored pair of cells that every property is read from.'
    },
    {
      id: 'reflexive',
      n: 3,
      title: 'Reflexive and irreflexive are about the diagonal',
      start: 60, end: 92,
      objective: 'Read reflexivity off the diagonal, separate it from irreflexivity, and count reflexive relations as two to the n squared minus n.'
    },
    {
      id: 'symmetric',
      n: 4,
      title: 'Symmetric means the matrix equals its mirror image',
      start: 92, end: 124,
      objective: 'Read symmetry off the mirrored pair of cells, count symmetric relations as two to the n times n plus one over two, and see why one missing mirror kills the property.'
    },
    {
      id: 'antisymmetric',
      n: 5,
      title: 'Antisymmetric is not the opposite of symmetric',
      start: 124, end: 158,
      objective: 'Read antisymmetry as at most one arrow between two different elements, count those relations, and exhibit relations that are both properties at once and neither.'
    },
    {
      id: 'transitive',
      n: 6,
      title: 'Transitive closes a two-step path with a one-step shortcut',
      start: 158, end: 192,
      objective: 'Test transitivity on a concrete relation, find the missing shortcut, and refute the popular claim that symmetric plus transitive gives reflexive.'
    },
    {
      id: 'closure',
      n: 7,
      title: 'The closure is the smallest relation that fixes the defect',
      start: 192, end: 224,
      objective: 'Build the transitive, reflexive and symmetric closures of one relation, and see that the closure is contained in every relation that already has the property.'
    },
    {
      id: 'equivalence',
      n: 8,
      title: 'Reflexive, symmetric and transitive together make a partition',
      start: 224, end: 256,
      objective: 'Compute the equivalence classes of a relation, see that they are non-empty, disjoint and covering, and count the equivalence relations on three elements as five.'
    },
    {
      id: 'counting',
      n: 9,
      title: 'The counting table, every entry enumerated in code',
      start: 256, end: 286,
      objective: 'Collect the counting formulas for each property, check them against brute-force enumeration, and see that transitivity has no such formula.'
    },
    {
      id: 'rules',
      n: 10,
      title: 'Five rules to carry into the exam',
      start: 286, end: 300,
      objective: 'Consolidate the decision procedure for each property, the counterexample to remember, and the counting facts that recur.'
    }
  ],

  events: [
    /* ---------------- scene 1: definition ---------------- */
    {
      id: 'd-1', start: 0, end: 6, scene: 'definition',
      caption: 'Start with a set of three elements. Every relation on it is built from pairs of those elements.',
      detail: 'The set is A = {1, 2, 3}. A pair is written (a, b) with a first coordinate and a second coordinate, and the order matters: (1, 2) and (2, 1) are two different pairs.',
      keyword: 'pairs',
      trap: null,
      narration: 'Start with a set of three elements. Every relation on it is built from pairs of those elements.'
    },
    {
      id: 'd-2', start: 6, end: 13, scene: 'definition',
      caption: 'There are nine pairs in all, one for each cell of this three by three grid.',
      detail: 'The grid is the Cartesian product A cross A. A row is the first coordinate and a column is the second. Nine cells means nine pairs, which is three squared.',
      keyword: 'nine pairs',
      trap: null,
      narration: 'There are nine pairs in all, one for each cell of this three by three grid.'
    },
    {
      id: 'd-3', start: 13, end: 21, scene: 'definition',
      caption: 'A relation is any choice of cells. Here it is one, two, one-two, two-three: four cells chosen out of nine.',
      detail: 'The relation shown is R = {(1,1), (1,2), (2,3)}. The cell for (1,1) is on the diagonal, the cell for (1,2) is off it, and (2,3) sits one row down. Choosing a set of cells is the whole definition.',
      keyword: 'any choice of cells',
      trap: null,
      narration: 'A relation is any choice of cells. Here it is one, one; one, two; and two, three: four cells chosen out of nine.'
    },
    {
      id: 'd-4', start: 21, end: 30, scene: 'definition',
      caption: 'Each of the nine cells is in or out, so there are two to the nine, which is 512, relations on a three-element set.',
      detail: 'This is the product rule again: nine independent yes-or-no decisions. For a set of n elements the count is two to the n squared, computed here for n equal to zero through four.',
      keyword: 'two to the nine',
      trap: null,
      narration: 'Each of the nine cells is in or out, so there are two to the nine, which is 512, relations on a three-element set.'
    },

    /* ---------------- scene 2: matrix ---------------- */
    {
      id: 'm-1', start: 30, end: 38, scene: 'matrix',
      caption: 'Write the same relation as a matrix: row one, column two is a 1 because 1 is related to 2.',
      detail: 'The entry in row a and column b is 1 exactly when the pair (a, b) is in the relation, and 0 otherwise. The matrix is a complete description of the relation: nothing is lost.',
      keyword: 'row one, column two',
      trap: null,
      narration: 'Write the same relation as a matrix: row one, column two is a one because one is related to two.'
    },
    {
      id: 'm-2', start: 38, end: 45, scene: 'matrix',
      caption: 'Or draw it as arrows between the elements. An arrow from 2 to 3 is the same fact as the 1 in that cell.',
      detail: 'The arrow picture is called a directed graph, or digraph, of the relation. A self-loop is a pair (a, a). An arrow in both directions between two different elements is a symmetric pair.',
      keyword: 'arrows between the elements',
      trap: null,
      narration: 'Or draw it as arrows between the elements. An arrow from two to three is the same fact as the one in that cell.'
    },
    {
      id: 'm-3', start: 45, end: 52, scene: 'matrix',
      caption: 'Two features of the matrix carry every property in this lesson: the diagonal, and the mirror pair of cells.',
      detail: 'The diagonal holds the pairs (a, a). A mirror pair is the two cells (a, b) and (b, a) for different elements a and b. Reflexivity lives on the diagonal; symmetry and antisymmetry live on the mirror pairs.',
      keyword: 'the diagonal, and the mirror pair',
      trap: null,
      narration: 'Two features of the matrix carry every property in this lesson: the diagonal, and the mirror pair of cells.'
    },
    {
      id: 'm-4', start: 52, end: 60, scene: 'matrix',
      caption: 'So there are three diagonal cells and three mirror pairs. Six independent decisions, not nine, once you know what you want.',
      detail: 'Three diagonal cells plus three unordered pairs of distinct elements gives six independent choices. That is the shape of every counting formula that follows: some cells are forced, the rest are free.',
      keyword: 'six independent decisions',
      trap: null,
      narration: 'So there are three diagonal cells and three mirror pairs. Six independent decisions, not nine, once you know what you want.'
    },

    /* ---------------- scene 3: reflexive ---------------- */
    {
      id: 'rf-1', start: 60, end: 68, scene: 'reflexive',
      caption: 'Reflexive means every element is related to itself: every diagonal cell is a 1.',
      detail: 'Formally, for every a in A, the pair (a, a) is in R. On a three-element set that forces three of the nine cells and leaves the other six free.',
      keyword: 'every element is related to itself',
      trap: null,
      narration: 'Reflexive means every element is related to itself: every diagonal cell is a one.'
    },
    {
      id: 'rf-2', start: 68, end: 76, scene: 'reflexive',
      caption: 'Irreflexive means the opposite: no element is related to itself, so every diagonal cell is a 0.',
      detail: 'Irreflexive is not the negation of reflexive. The negation of "all diagonal cells are 1" is "at least one diagonal cell is 0", which is much weaker than "all are 0".',
      keyword: 'no element is related to itself',
      trap: 'The negation of reflexive is "some element fails to relate to itself", not irreflexive. A relation with two diagonal 1s and one diagonal 0 is neither reflexive nor irreflexive.',
      narration: 'Irreflexive means the opposite: no element is related to itself, so every diagonal cell is a zero.'
    },
    {
      id: 'rf-3', start: 76, end: 84, scene: 'reflexive',
      caption: 'The identity relation is reflexive, the empty relation is not, and the relation below is neither.',
      detail: 'On A = {1, 2, 3}: the identity holds (1,1), (2,2), (3,3) and is reflexive. The empty relation holds nothing and is irreflexive. The relation holding only (1,1) and (2,2) has one diagonal zero, so it is neither. All three verdicts are computed on this page.',
      keyword: 'neither',
      trap: null,
      narration: 'The identity relation is reflexive, the empty relation is not, and the relation below is neither.'
    },
    {
      id: 'rf-4', start: 84, end: 92, scene: 'reflexive',
      caption: 'Count them: three cells forced to 1, six free, so 2 to the 6, which is 64 reflexive relations.',
      detail: 'For n elements, the diagonal has n cells and the rest number n squared minus n. Reflexive relations therefore number 2 to the power n squared minus n, and irreflexive relations have exactly the same count. For n equal to 3 that is 64, confirmed by listing all 512 relations.',
      keyword: '64 reflexive relations',
      trap: null,
      narration: 'Count them: three cells forced to one, six free, so two to the six, which is 64 reflexive relations.'
    },

    /* ---------------- scene 4: symmetric ---------------- */
    {
      id: 'sy-1', start: 92, end: 100, scene: 'symmetric',
      caption: 'Symmetric: if 1 is related to 2 then 2 is related to 1. In the matrix, the two mirrored cells must agree.',
      detail: 'Formally, (a, b) in R implies (b, a) in R for every a and b. In matrix language, the matrix equals its transpose. Note that a and b are allowed to be equal, and the diagonal agrees with itself automatically.',
      keyword: 'the two mirrored cells must agree',
      trap: null,
      narration: 'Symmetric: if one is related to two then two is related to one. In the matrix, the two mirrored cells must agree.'
    },
    {
      id: 'sy-2', start: 100, end: 108, scene: 'symmetric',
      caption: 'Here the pair is broken: the 1 from 1 to 3 has no partner. One missing mirror is enough to fail.',
      detail: 'A universal claim fails at its first counterexample. The relation holding (1,2), (2,1) and (1,3) but not (3,1) is not symmetric, even though most of its arrows come in pairs.',
      keyword: 'one missing mirror',
      trap: 'Counting the arrows that do come in pairs and concluding "mostly symmetric" is the usual error. Symmetry is all or nothing.',
      narration: 'Here the pair is broken: the one from one to three has no partner. One missing mirror is enough to fail.'
    },
    {
      id: 'sy-3', start: 108, end: 116, scene: 'symmetric',
      caption: 'Count them: three diagonal cells are free, and each of the three mirror pairs is one decision, so 2 to the 6 again.',
      detail: 'The free decisions are the n diagonal cells and the n times n minus one over two unordered pairs of distinct elements. Adding gives n times n plus one over two, so symmetric relations number 2 to that power. For n equal to 3 the exponent is 6 and the count is 64.',
      keyword: 'each mirror pair is one decision',
      trap: null,
      narration: 'Count them: three diagonal cells are free, and each of the three mirror pairs is one decision, so two to the six again.'
    },
    {
      id: 'sy-4', start: 116, end: 124, scene: 'symmetric',
      caption: 'Symmetric relations are exactly the ones equal to their own inverse. That is a useful one-line test.',
      detail: 'The inverse relation R inverse holds (b, a) whenever R holds (a, b). A relation is symmetric exactly when it equals its inverse, which was checked here on all 512 relations of a three-element set.',
      keyword: 'equal to their own inverse',
      trap: null,
      narration: 'Symmetric relations are exactly the ones equal to their own inverse. That is a useful one-line test.'
    },

    /* ---------------- scene 5: antisymmetric ---------------- */
    {
      id: 'as-1', start: 124, end: 132, scene: 'antisymmetric',
      caption: 'Antisymmetric: two different elements may not point at each other. At most one of each mirror pair is a 1.',
      detail: 'Formally, if (a, b) and (b, a) are both in R, then a equals b. Two arrows between different elements are forbidden; a self-loop is always allowed and says nothing against antisymmetry.',
      keyword: 'at most one of each mirror pair',
      trap: null,
      narration: 'Antisymmetric: two different elements may not point at each other. At most one of each mirror pair is a one.'
    },
    {
      id: 'as-2', start: 132, end: 140, scene: 'antisymmetric',
      caption: 'Divisibility is the standard example: 1 divides 2 and 2 does not divide 1, so the pair is allowed.',
      detail: 'On {1, 2, 3} the divides relation holds (1,1), (2,2), (3,3), (1,2) and (1,3). It is reflexive, antisymmetric and transitive, which is why it is the model partial order. Equality is the other one: a divides b and b divides a only when a equals b.',
      keyword: 'divisibility',
      trap: null,
      narration: 'Divisibility is the standard example: one divides two and two does not divide one, so the pair is allowed.'
    },
    {
      id: 'as-3', start: 140, end: 148, scene: 'antisymmetric',
      caption: 'The identity relation is symmetric and antisymmetric at the same time, so the two are not opposites.',
      detail: 'Any subset of the identity relation is both symmetric and antisymmetric, and there are 2 to the n of them. The empty relation is also both. A relation that is neither is easy to write: keep one mirrored pair and break another.',
      keyword: 'not opposites',
      trap: 'Treating antisymmetric as "not symmetric" loses marks. Antisymmetric forbids two-way arrows between distinct elements; it says nothing about one-way arrows, which is exactly what makes a relation not symmetric.',
      narration: 'The identity relation is symmetric and antisymmetric at the same time, so the two are not opposites.'
    },
    {
      id: 'as-4', start: 148, end: 158, scene: 'antisymmetric',
      caption: 'Count them: three diagonal cells free, three mirror pairs with three choices each, so 8 times 27, which is 216.',
      detail: 'Each mirror pair may be empty, hold only (a, b), or hold only (b, a): three options, never both. That gives 2 to the n times 3 to the n times n minus one over two. For n equal to 3, 8 times 27 is 216, confirmed by enumeration. Asymmetric is the same count with the diagonal forced off: 27.',
      keyword: '216',
      trap: null,
      narration: 'Count them: three diagonal cells free, three mirror pairs with three choices each, so eight times 27, which is 216.'
    },

    /* ---------------- scene 6: transitive ---------------- */
    {
      id: 'tr-1', start: 158, end: 166, scene: 'transitive',
      caption: 'Transitive: a two-step path must come with a one-step shortcut. One to two and two to three forces one to three.',
      detail: 'Formally, (a, b) and (b, c) in R imply (a, c) in R. In the matrix, whenever a row has a 1 under a column whose own row has a 1, the crossing cell must also be 1.',
      keyword: 'one-step shortcut',
      trap: null,
      narration: 'Transitive: a two-step path must come with a one-step shortcut. One to two and two to three forces one to three.'
    },
    {
      id: 'tr-2', start: 166, end: 174, scene: 'transitive',
      caption: 'Here the shortcut is missing, so the relation is not transitive. Adding that one cell repairs it.',
      detail: 'The relation {(1,2), (2,3)} fails at exactly the pair (1,3). Adding (1,3) gives {(1,2), (2,3), (1,3)}, which is transitive and is the smallest transitive relation containing the original.',
      keyword: 'the shortcut is missing',
      trap: null,
      narration: 'Here the shortcut is missing, so the relation is not transitive. Adding that one cell repairs it.'
    },
    {
      id: 'tr-3', start: 174, end: 184, scene: 'transitive',
      caption: 'Now the popular claim: if a relation is symmetric and transitive, must it be reflexive? No.',
      detail: 'The argument offered for the claim is that a related to b gives b related to a by symmetry, hence a related to a by transitivity. That argument only works for elements that are related to something. An element with no arrow at all is never forced to relate to itself.',
      keyword: 'must it be reflexive',
      trap: 'Symmetric plus transitive does not give reflexive. On {1, 2} the relation holding only (1,1) is symmetric and transitive but not reflexive, because (2,2) is missing. This exact claim has been examined in GATE papers.',
      narration: 'Now the popular claim: if a relation is symmetric and transitive, must it be reflexive? No.'
    },
    {
      id: 'tr-4', start: 184, end: 192, scene: 'transitive',
      caption: 'The smallest counterexample is one self-loop on a two-element set: symmetric, transitive, not reflexive.',
      detail: 'On {1, 2} take R = {(1,1)}. Symmetry holds because the only pair is its own mirror. Transitivity holds because there is no two-step path to check. Reflexivity fails because (2,2) is absent. One cell is all it takes, and the verdicts here are computed.',
      keyword: 'one self-loop',
      trap: null,
      narration: 'The smallest counterexample is one self-loop on a two-element set: symmetric, transitive, not reflexive.'
    },

    /* ---------------- scene 7: closure ---------------- */
    {
      id: 'cl-1', start: 192, end: 200, scene: 'closure',
      caption: 'The transitive closure of R is R plus every shortcut its paths force. For this relation that adds one cell.',
      detail: 'Written R plus, it is the smallest transitive relation containing R. The definition is a conjunction of two conditions: it contains R, and it is transitive, and no smaller relation has both.',
      keyword: 'every shortcut its paths force',
      trap: null,
      narration: 'The transitive closure of R is R plus every shortcut its paths force. For this relation that adds one cell.'
    },
    {
      id: 'cl-2', start: 200, end: 208, scene: 'closure',
      caption: 'Repeat until nothing new appears: with a longer chain, one to two, two to three, three to four, three cells arrive.',
      detail: 'On a four-element chain {(1,2), (2,3), (3,4)} the closure adds (1,3), (2,4) and (1,4). That is reachability: (a, c) is in the closure exactly when a path of length at least one runs from a to c.',
      keyword: 'Repeat until nothing new appears',
      trap: null,
      narration: 'Repeat until nothing new appears: with a longer chain, one to two, two to three, three to four, two cells arrive.'
    },
    {
      id: 'cl-3', start: 208, end: 216, scene: 'closure',
      caption: 'The reflexive closure fills the diagonal, the symmetric closure mirrors every cell. Each is the smallest fix of its own defect.',
      detail: 'Reflexive closure is R together with all (a, a). Symmetric closure is R together with all (b, a) for each (a, b) in R. Neither is the same as the transitive closure: they repair different properties.',
      keyword: 'smallest fix of its own defect',
      trap: 'Asking for "the closure" without naming the property is ambiguous. A question that says "reflexive closure" and a question that says "transitive closure" have different answers, and the transitive closure of a reflexive relation is not automatically reflexive.',
      narration: 'The reflexive closure fills the diagonal, the symmetric closure mirrors every cell. Each is the smallest fix of its own defect.'
    },
    {
      id: 'cl-4', start: 216, end: 224, scene: 'closure',
      caption: 'Smallest is checkable: every transitive relation containing R also contains the closure. That was tested by listing them.',
      detail: 'On a three-element set, all 512 relations were listed; for each starting relation, every transitive superset was collected and each was tested for containing the computed closure. No exception was found, which is what "smallest" means.',
      keyword: 'every transitive relation containing R',
      trap: null,
      narration: 'Smallest is checkable: every transitive relation containing R also contains the closure. That was tested by listing them.'
    },

    /* ---------------- scene 8: equivalence ---------------- */
    {
      id: 'eq-1', start: 224, end: 232, scene: 'equivalence',
      caption: 'An equivalence relation is reflexive, symmetric and transitive at once. Same parity is the familiar example.',
      detail: 'On {1, 2, 3, 4, 5, 6} say a relates to b when a and b have the same parity. Each element relates to itself, the relation is symmetric, and two steps preserve parity, so all three properties hold.',
      keyword: 'reflexive, symmetric and transitive',
      trap: null,
      narration: 'An equivalence relation is reflexive, symmetric and transitive at once. Same parity is the familiar example.'
    },
    {
      id: 'eq-2', start: 232, end: 240, scene: 'equivalence',
      caption: 'The equivalence class of an element is everything related to it. Here the classes are the odds and the evens.',
      detail: 'The class of a, written with square brackets, is the set of all b with a related to b. For same parity that gives {1, 3, 5} and {2, 4, 6}. The three properties force every element into exactly one class.',
      keyword: 'equivalence class',
      trap: null,
      narration: 'The equivalence class of an element is everything related to it. Here the classes are the odds and the evens.'
    },
    {
      id: 'eq-3', start: 240, end: 248, scene: 'equivalence',
      caption: 'Classes are non-empty, never overlap, and together cover the set: that is a partition, and it is forced, not chosen.',
      detail: 'Reflexivity puts each element in its own class, so no class is empty and nothing is left out. Symmetry makes membership mutual. Transitivity makes two classes either identical or disjoint, because a shared element would relate everything in both.',
      keyword: 'a partition',
      trap: null,
      narration: 'Classes are non-empty, never overlap, and together cover the set: that is a partition, and it is forced, not chosen.'
    },
    {
      id: 'eq-4', start: 248, end: 256, scene: 'equivalence',
      caption: 'So equivalence relations on a set are partitions of it. On three elements there are five of each, counted here.',
      detail: 'The five partitions of {1, 2, 3} are one block, three two-block partitions, and three singletons. Enumerating all 512 relations and testing the three properties gives exactly five equivalence relations, and their class lists are exactly those five partitions.',
      keyword: 'five of each',
      trap: null,
      narration: 'So equivalence relations on a set are partitions of it. On three elements there are five of each, counted here.'
    },

    /* ---------------- scene 9: counting ---------------- */
    {
      id: 'co-1', start: 256, end: 264, scene: 'counting',
      caption: 'Every count in this table comes from one idea: which cells are forced and which are free.',
      detail: 'Reflexive forces the diagonal; symmetric ties each mirror pair together; antisymmetric allows at most one of a mirror pair. The formulas are not separate facts to memorise, they are the same argument applied three times.',
      keyword: 'which cells are forced',
      trap: null,
      narration: 'Every count in this table comes from one idea: which cells are forced and which are free.'
    },
    {
      id: 'co-2', start: 264, end: 272, scene: 'counting',
      caption: 'For four elements: 65536 relations in all, 4096 reflexive, 1024 symmetric, 11664 antisymmetric, 16 both.',
      detail: 'With n equal to 4 the exponent n squared is 16, so there are 65536 relations. Reflexive is 2 to the 12. Symmetric is 2 to the 10. Antisymmetric is 2 to the 4 times 3 to the 6. Symmetric and antisymmetric together is 2 to the 4. Every figure was produced by enumeration, not by trusting the formula.',
      keyword: '65536',
      trap: null,
      narration: 'For four elements: 65536 relations in all, 4096 reflexive, 1024 symmetric, 11664 antisymmetric, 16 both.'
    },
    {
      id: 'co-3', start: 272, end: 279, scene: 'counting',
      caption: 'Transitive has no such formula. The counts are 2, 13, 171, 3994, and beyond four elements they are only ever computed.',
      detail: 'For n equal to 1, 2, 3 and 4 the number of transitive relations is 2, 13, 171 and 3994. Each was obtained here by testing every relation of that size. No closed form is known, which is why a GATE question on transitivity asks you to test a given relation rather than to count all of them.',
      keyword: 'no such formula',
      trap: 'A question that asks for the number of transitive relations on n elements has no formula answer. If an option offers one, the question is not what it appears to be, or the option is a distractor.',
      narration: 'Transitive has no such formula. The counts are 2, 13, 171, 3994, and beyond four elements they are only ever computed.'
    },
    {
      id: 'co-4', start: 279, end: 286, scene: 'counting',
      caption: 'Equivalence relations on three elements: five. On four: fifteen. Same numbers as the partitions, because they are the same objects.',
      detail: 'These are the Bell numbers. The correspondence with partitions is a bijection, so counting one counts the other. Both figures were produced by brute force in this page.',
      keyword: 'five',
      trap: null,
      narration: 'Equivalence relations on three elements: five. On four: fifteen. Same numbers as the partitions, because they are the same objects.'
    },

    /* ---------------- scene 10: rules ---------------- */
    {
      id: 'ru-1', start: 286, end: 291, scene: 'rules',
      caption: 'One: read the diagonal for reflexive and irreflexive, the mirror pairs for symmetric and antisymmetric.',
      detail: 'Draw the matrix for a small set and fill in the cells from the definition. Four of the six properties become a glance at the picture, and the picture cannot be argued with.',
      keyword: 'read the diagonal',
      trap: null,
      narration: 'Rule one: read the diagonal for reflexive and irreflexive, the mirror pairs for symmetric and antisymmetric.'
    },
    {
      id: 'ru-2', start: 291, end: 295, scene: 'rules',
      caption: 'Two: antisymmetric is not the negation of symmetric. Both, neither, and exactly one are all possible.',
      detail: 'The identity relation has both; the empty relation has both; a single two-way pair has symmetric without antisymmetric; a single one-way pair has antisymmetric without symmetric.',
      keyword: 'not the negation of symmetric',
      trap: null,
      narration: 'Rule two: antisymmetric is not the negation of symmetric. Both, neither, and exactly one are all possible.'
    },
    {
      id: 'ru-3', start: 295, end: 300, scene: 'rules',
      caption: 'Three: one missing pair breaks a universal property, and one element with no arrow breaks the claim that symmetry plus transitivity gives reflexivity.',
      detail: 'Test a universal property by hunting for its counterexample, not by counting favourable cases. The smallest counterexamples here are a single missing mirror and a single self-loop.',
      keyword: 'one missing pair',
      trap: null,
      narration: 'Rule three: one missing pair breaks a universal property, and one element with no arrow breaks the claim that symmetry plus transitivity gives reflexivity.'
    }
  ]
};
