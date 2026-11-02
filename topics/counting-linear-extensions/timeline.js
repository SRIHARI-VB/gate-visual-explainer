/* ==========================================================================
   counting-linear-extensions - THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs - never edited by hand.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 336,

  scenes: [
    { id: 'poset',    n: 1,  title: 'A partial order fixes only some of the order', objective: 'see a linear extension as an ordering that keeps every arrow pointing forward', start: 0,   end: 30  },
    { id: 'small',    n: 2,  title: 'The smallest cases, and the two ends of the range', objective: 'count two and three elements, and see that the answer lies between 1 and n!', start: 30,  end: 60  },
    { id: 'brute',    n: 3,  title: 'The definition as a search: 24 orderings, 5 survivors', objective: 'test every ordering of four elements against three constraints', start: 60,  end: 92  },
    { id: 'series',   n: 4,  title: 'Series multiplies, parallel chooses slots', objective: 'state the two composition rules that give every closed form in this lesson', start: 92,  end: 126 },
    { id: 'binom',    n: 5,  title: 'Two chains: a binomial coefficient, not a division', objective: 'count two parallel chains by choosing slots, and read C(m+n,m)', start: 126, end: 152 },
    { id: 'multi',    n: 6,  title: 'Three chains, and the shortcut that fails', objective: 'use the multinomial, then break the divide-by-two-per-edge rule', start: 152, end: 180 },
    { id: 'tree',     n: 7,  title: 'A rooted tree: n! over the subtree sizes', objective: 'apply the hook-length formula to a tree and to a forest', start: 180, end: 210 },
    { id: 'hard',     n: 8,  title: 'A poset no formula reaches', objective: 'count a non-series-parallel poset by cases, and know why no formula exists', start: 210, end: 244 },
    { id: 'dp',       n: 9,  title: 'The general method: dynamic programming over subsets', objective: 'state and cost the subset recurrence that always works', start: 244, end: 272 },
    { id: 'pyq2016',  n: 10, title: 'GATE CSE 2016, Set 1, Q11: six orderings', objective: 'answer the verified previous-year question by decomposition', start: 272, end: 300 },
    { id: 'apps',     n: 11, title: 'One arithmetic, three names', objective: 'recognise the same count inside interleavings and serialisable schedules', start: 300, end: 336 }
  ],

  events: [
    /* ---- 1. what a linear extension is ---------------------------------- */
    { id: 'p1', scene: 'poset', start: 0, end: 8,
      caption: 'Four tasks and three constraints: A before B, A before C, and both B and C before D.',
      narration: 'Four tasks and three constraints. A before B. A before C. And both B and C before D. That is a partial order: some pairs are ordered and the rest are free.',
      detail: 'A partial order on a set is a relation that is reflexive, antisymmetric and transitive. Only the comparabilities matter here, so the picture keeps just the arrows that are not forced by a longer path.',
      keyword: 'partial order' },

    { id: 'p2', scene: 'poset', start: 8, end: 16,
      caption: 'A B C D is legal: read every arrow against the ordering and each one still points forward.',
      narration: 'A B C D is legal. Read every arrow against the ordering and each one still points forward. A comes before B, A before C, B before C, C before D.',
      detail: 'The test is mechanical: for every constraint x before y, the position of x in the ordering is smaller than the position of y. Nothing else is checked, and nothing else is allowed to fail.',
      keyword: 'still points forward' },

    { id: 'p3', scene: 'poset', start: 16, end: 23,
      caption: 'B A C D is not legal. The constraint A before B is broken, so this ordering is not a linear extension.',
      narration: 'B A C D is not legal. The constraint A before B is broken, so this ordering is not a linear extension of the partial order.',
      detail: 'One broken constraint is enough. An ordering is a linear extension only if it breaks none of them, which is why the count is a count of complete orderings and not of paths.',
      keyword: 'not a linear extension',
      trap: 'A valid topological sort is not a set of independent choices at each step. The count is over whole orderings, so a greedy walk that makes one choice early still has to be counted with every alternative.' },

    { id: 'p4', scene: 'poset', start: 23, end: 30,
      caption: 'A linear extension is a full ordering in which every constraint still points forward. This diamond has exactly two.',
      narration: 'A linear extension is a full ordering in which every constraint still points forward. This diamond has exactly two: A B C D and A C B D.',
      detail: 'The name is standard: a linear extension of a partially ordered set P is a linear ordering that contains P. Topological orderings of a directed acyclic graph are the same objects, because a DAG is a partial order once you close it under transitivity.',
      keyword: 'linear extension' },

    /* ---- 2. the smallest cases ------------------------------------------ */
    { id: 's1', scene: 'small', start: 30, end: 37,
      caption: 'Two elements with no constraint: A B and B A, so two orderings. Add A before B and only one is left.',
      narration: 'Two elements with no constraint. A B and B A, so two orderings. Add the constraint A before B and only one is left.',
      detail: 'Two elements can be incomparable or comparable, and that is the whole of the two-element theory: 2 or 1. The count falls by exactly the orderings the constraint forbids.',
      keyword: 'two orderings' },

    { id: 's2', scene: 'small', start: 37, end: 44,
      caption: 'Three elements with no constraint give six. With A first, two. As a chain, one.',
      narration: 'Three elements with no constraint give six. With A before both others, two. As a chain of three, one.',
      detail: 'The chain of three is the extreme case: six orderings exist and five of them put some element before its predecessor, so exactly one survives.',
      keyword: 'six' },

    { id: 's3', scene: 'small', start: 44, end: 52,
      caption: 'The count always lies between 1 and n factorial, and both ends are reached.',
      narration: 'The count always lies between one and n factorial, and both ends are reached: a chain gives one, and an antichain, with no constraints at all, gives n factorial.',
      detail: 'An antichain is a set in which no two elements are comparable. Every ordering is then a linear extension, so the count is n factorial: 2, 6, 24, 120 for two to five elements.',
      keyword: 'n factorial' },

    { id: 's4', scene: 'small', start: 52, end: 60,
      caption: 'Adding a constraint can only lower the count. It can never raise it, and it may leave it unchanged.',
      narration: 'Adding a constraint can only lower the count. It can never raise it, and sometimes it changes nothing at all, when the constraint was already implied by the others.',
      detail: 'A constraint implied by transitivity removes nothing, which is why a DAG and its transitive closure have the same number of topological orderings. A constraint that is not implied removes at least one ordering.',
      keyword: 'only lower the count' },

    /* ---- 3. the definition as a search ---------------------------------- */
    { id: 'b1', scene: 'brute', start: 60, end: 68,
      caption: 'Four elements, three constraints: A before C, B before C, B before D. Twenty-four orderings exist.',
      narration: 'Four elements, three constraints. A before C. B before C. B before D. Twenty-four orderings exist, because four factorial is twenty-four.',
      detail: 'This poset is the smallest one that no series or parallel join produces, and it is the shape a question uses when it wants a count that cannot be read off a formula.',
      keyword: 'Twenty-four orderings' },

    { id: 'b2', scene: 'brute', start: 68, end: 76,
      caption: 'Test each one. C A B D fails, because C comes before B and the constraint says B before C.',
      narration: 'Test each one. C A B D fails, because C comes before B and the constraint says B before C. D B A C fails, because D comes before B.',
      detail: 'The test is a loop over the constraints, not a judgement about how the ordering looks. Nineteen of the twenty-four fail at least one of the three.',
      keyword: 'fails' },

    { id: 'b3', scene: 'brute', start: 76, end: 84,
      caption: 'Five survive: A B C D, A B D C, B A C D, B A D C and B D A C.',
      narration: 'Five survive: A B C D, A B D C, B A C D, B A D C and B D A C. Every other ordering puts something before an element it must follow.',
      detail: 'Notice that A and B are incomparable, so they may appear in either order, and that C and D are incomparable too. The five orderings are exactly the ways of interleaving the two chains A and B under one common successor C and an extra constraint on D.',
      keyword: 'Five survive' },

    { id: 'b4', scene: 'brute', start: 84, end: 92,
      caption: 'Twenty-four orderings tested, five accepted. That is the definition, and it is also a method.',
      narration: 'Twenty-four orderings tested, five accepted. That is the definition, and it is also a method: it costs n factorial, so it settles every instance up to about eight elements and nothing beyond.',
      detail: 'Eight factorial is 40,320 and ten factorial is 3,628,800, so a hand count is possible on paper only for very small sets. Every shortcut in this lesson is a way of avoiding that loop.',
      keyword: 'five accepted' },

    /* ---- 4. the two composition rules ----------------------------------- */
    { id: 'r1', scene: 'series', start: 92, end: 100,
      caption: 'Two blocks in series: every element of the first comes before every element of the second. The counts multiply.',
      narration: 'Two blocks in series. Every element of the first comes before every element of the second. The counts multiply, because the two orders are chosen independently and then concatenated.',
      detail: 'In series notation P then Q, each linear extension is a linear extension of P followed by a linear extension of Q. No interleaving is possible, so e of P then Q is e of P times e of Q.',
      keyword: 'counts multiply' },

    { id: 'r2', scene: 'series', start: 100, end: 108,
      caption: 'Two blocks in parallel: nothing crosses between them, so their elements interleave. Choose which slots belong to the first block.',
      narration: 'Two blocks in parallel. Nothing crosses between them, so their elements interleave freely. Choose which slots of the combined sequence belong to the first block, and the rest belong to the second.',
      detail: 'The parallel join is the disjoint union of the two posets: no element of one is comparable with any element of the other. Every linear extension is an interleaving of a linear extension of each.',
      keyword: 'interleave' },

    { id: 'r3', scene: 'series', start: 108, end: 117,
      caption: 'Sizes m and n: the number of ways to choose the m slots is C of m plus n, choose m.',
      narration: 'Sizes m and n. The number of ways to choose the m slots out of m plus n is the binomial coefficient C of m plus n, choose m. Multiply by the internal counts and the parallel rule is complete.',
      detail: 'e of P parallel Q equals C of size P plus size Q, choose size P, times e of P times e of Q. Choosing the slots for P also fixes the slots for Q, which is why there is one binomial and not two.',
      keyword: 'choose m' },

    { id: 'r4', scene: 'series', start: 117, end: 126,
      caption: 'Series-parallel posets are exactly the ones these two rules reach. Every closed form in this lesson is built from them.',
      narration: 'Series-parallel posets are exactly the ones these two rules reach. Every closed form in this lesson is built from them, and the poset in scene eight is the smallest one they cannot build.',
      detail: 'A poset is series-parallel when it can be built from single elements by series and parallel composition. Trees read from the root are series-parallel, and so are disjoint unions of chains.',
      keyword: 'exactly the ones' },

    /* ---- 5. two chains -------------------------------------------------- */
    { id: 'c1', scene: 'binom', start: 126, end: 134,
      caption: 'Two chains of two: B before C, and D before E. Four slots between them, and two slots go to the first chain.',
      narration: 'Two chains of two. B before C, and D before E. Four slots between them, and two of those slots go to the first chain.',
      detail: 'The two chains are in parallel, so their sizes are two and two, and the combined length is four. Choosing which two of the four slots hold B and C fixes everything else.',
      keyword: 'Four slots' },

    { id: 'c2', scene: 'binom', start: 134, end: 142,
      caption: 'Six ways: slots one and two, one and three, one and four, two and three, two and four, three and four.',
      narration: 'Six ways: slots one and two, one and three, one and four, two and three, two and four, and three and four. C of four choose two is six.',
      detail: 'Each choice of slots gives exactly one ordering, because inside a chain the order is already fixed: B before C, and D before E. So the binomial is the whole answer.',
      keyword: 'Six ways' },

    { id: 'c3', scene: 'binom', start: 142, end: 148,
      caption: 'Sizes three and two give C of five choose two, which is ten. The smaller chain takes the chosen slots.',
      narration: 'Sizes three and two give C of five choose two, which is ten. The smaller chain takes the chosen slots and the larger one fills the rest.',
      detail: 'Choosing two slots out of five is the same as choosing three, because C of n choose k equals C of n choose n minus k. That symmetry is why the rule does not care which chain you choose slots for.',
      keyword: 'ten' },

    { id: 'c4', scene: 'binom', start: 148, end: 152,
      caption: 'The binomial is not a division by two. It counts the choices of position, and positions are what the two chains compete for.',
      narration: 'The binomial is not a division by two. It counts the choices of position, and position is exactly what the two chains compete for.',
      detail: 'For two chains of two, n factorial over two is 12, which is twice the answer. The correct denominator is two factorial twice, because each chain’s internal order is fixed and must be divided out.',
      keyword: 'not a division by two',
      trap: 'Dividing 4 factorial by 2 gives 12, not 6. The denominator is 2 factorial for each chain, so 24 over 4 gives 6.' },

    /* ---- 6. three chains and the failing shortcut ----------------------- */
    { id: 'm1', scene: 'multi', start: 152, end: 160,
      caption: 'Three chains of two: choose two slots of six, then two of four, then two of two. Fifteen times six times one.',
      narration: 'Three chains of two, six elements. Choose two slots of six, then two of the remaining four, then the last two. Fifteen times six times one is ninety.',
      detail: 'That product is the multinomial coefficient: 6 factorial over 2 factorial cubed, which is 720 over 8, and 90. It is the parallel rule applied twice.',
      keyword: 'Ninety' },

    { id: 'm2', scene: 'multi', start: 160, end: 168,
      caption: 'A common shortcut divides n factorial by two for every constraint. Here it happens to give 720 over 8, which is 90.',
      narration: 'A common shortcut divides n factorial by two for every constraint. Here it happens to give 720 over 8, which is 90, and it agrees with the multinomial.',
      detail: 'The shortcut is right here for a reason: the three constraints are on three disjoint pairs, so each halves the count independently. The coincidence is what makes the rule look general.',
      keyword: 'happens to give' },

    { id: 'm3', scene: 'multi', start: 168, end: 175,
      caption: 'On one chain of three it gives six over four, which is 1.5. A count is never a fraction.',
      narration: 'On one chain of three it gives six over four, which is one and a half. A count is never a fraction, so the rule has already failed.',
      detail: 'A chain of three has exactly one linear extension, A B C. The two constraints share the element B, so halving twice counts the same ordering twice.',
      keyword: '1.5',
      trap: 'If a proposed formula returns a non-integer, it is wrong. That check takes one second and catches this shortcut every time.' },

    { id: 'm4', scene: 'multi', start: 175, end: 180,
      caption: 'On a chain of four it gives twenty-four over eight, which is three, and the true answer is one.',
      narration: 'On a chain of four it gives twenty-four over eight, which is three, and the true answer is one. Two constraints that share an element are not independent, so their factors cannot be multiplied.',
      detail: 'The correct general statement needs the shape of the poset, not the number of arrows. Counting constraints is not counting degrees of freedom.',
      keyword: 'three, and the true answer is one' },

    /* ---- 7. the tree ---------------------------------------------------- */
    { id: 't1', scene: 'tree', start: 180, end: 188,
      caption: 'A rooted tree read downwards is a partial order: each node after its parent. Write in each node its subtree size.',
      narration: 'A rooted tree read downwards is a partial order: each node comes after its parent. Write in each node the size of its subtree, counting the node itself.',
      detail: 'The tree here has four nodes: a root with two children, and the left child has one child of its own. The subtree sizes are four, two, one and one.',
      keyword: 'subtree size' },

    { id: 't2', scene: 'tree', start: 188, end: 197,
      caption: 'Hook length: n factorial over the product of the subtree sizes. Twenty-four over eight is three.',
      narration: 'The hook-length formula: n factorial divided by the product of the subtree sizes. Twenty-four divided by eight is three, and three is the count.',
      detail: 'The name hook length is older than the tree case: it is the number of cells in the hook of a Young diagram. For a tree poset the hook of a node is its subtree, which is why the same formula appears.',
      keyword: 'Twenty-four over eight' },

    { id: 't3', scene: 'tree', start: 197, end: 205,
      caption: 'A forest of two chains of two: sizes 2, 1, 2, 1, product four, so twenty-four over four is six.',
      narration: 'A forest of two chains of two. The sizes are two, one, two and one, the product is four, and twenty-four over four is six, which the binomial also gives.',
      detail: 'The two formulas must agree on every series-parallel poset, and they do here: C of four choose two is six, and the hook-length product is also six.',
      keyword: 'six' },

    { id: 't4', scene: 'tree', start: 205, end: 210,
      caption: 'The formula is exact for forests and for series-parallel posets. It fails the moment a poset is neither.',
      narration: 'The formula is exact for forests and for series-parallel posets. It fails the moment a poset is neither, which is the next scene.',
      detail: 'Applied to the four-element poset of scene three, the tree formula has no tree to read, so there is nothing to compute: the shape, not the count of elements, decides which formula is legal.',
      keyword: 'fails' },

    /* ---- 8. the poset no formula reaches -------------------------------- */
    { id: 'h1', scene: 'hard', start: 210, end: 218,
      caption: 'A before C, B before C, B before D. No series join and no parallel join produces this poset.',
      narration: 'A before C, B before C, B before D. No series join and no parallel join produces this poset, so none of the formulas applies.',
      detail: 'It is the four-element poset usually drawn as an N. Every attempt to split it into two blocks fails: the element B touches both halves, and A and D are incomparable with everything they could be separated from.',
      keyword: 'none of the formulas applies' },

    { id: 'h2', scene: 'hard', start: 218, end: 226,
      caption: 'Count by cases on the last element. If C is last, A and B and D are free except B before D: three orderings.',
      narration: 'Count by cases on the last element. If C is last, the remaining three are free except that B comes before D, so there are three orderings: A B D, B A D and B D A.',
      detail: 'Three elements with one constraint have 3 factorial over 2 factorial, which is three, orderings. This is the two-chain case again, one level down.',
      keyword: 'three orderings' },

    { id: 'h3', scene: 'hard', start: 226, end: 235,
      caption: 'If D is last, C must follow both A and B, so C is last among the three: two orderings. Three plus two is five.',
      narration: 'If D is last, C must follow both A and B, so C is last among the remaining three, and A and B may come in either order. Two orderings. Three plus two is five.',
      detail: 'The two cases are exhaustive because the last element of a linear extension must be maximal, and only C and D are maximal. Cases on the last element always partition the count exactly.',
      keyword: 'five' },

    { id: 'h4', scene: 'hard', start: 235, end: 244,
      caption: 'Brightwell and Winkler proved in 1991 that counting linear extensions is #P-complete. No formula exists for the general case.',
      narration: 'Brightwell and Winkler proved in 1991 that counting linear extensions is number-P complete. No formula exists for the general case. Polynomial algorithms exist for trees, for series-parallel posets and for posets of bounded width, and an exam instance is always one of those or small enough to count.',
      detail: 'The decision problem is trivial: every partial order has a linear extension. Only the count is hard, which is why the result is surprising and why the exam cannot ask for an arbitrary large poset.',
      keyword: '#P-complete' },

    /* ---- 9. the subset dynamic program ---------------------------------- */
    { id: 'd1', scene: 'dp', start: 244, end: 252,
      caption: 'The method that always works: let f of S be the number of ways to order the set S as a prefix of the sequence.',
      narration: 'The method that always works is dynamic programming over subsets. Let f of S be the number of ways to order the set S as a prefix of the whole sequence.',
      detail: 'A subset is the set of elements already placed. Its order matters for the count but not for the recurrence, because the only thing the next step needs to know is which elements are already down.',
      keyword: 'f of S' },

    { id: 'd2', scene: 'dp', start: 252, end: 260,
      caption: 'The next element must have all of its predecessors already in S. Sum f of S plus that element over every legal choice.',
      narration: 'The next element must have all of its predecessors already in S. Sum f of S plus that element over every legal choice, and the sum is f of S.',
      detail: 'This is the same rule a topological sort uses to pick a source, except that every choice is taken and the results are added instead of one being followed.',
      keyword: 'predecessors already in S' },

    { id: 'd3', scene: 'dp', start: 260, end: 266,
      caption: 'Four elements give sixteen subsets. Fill them in order of size; the full set counts one way and the empty set holds the answer.',
      narration: 'Four elements give sixteen subsets. Fill them in order of size. The full set counts one way, and f of the empty set is the answer, which is five here.',
      detail: 'The base case is f of the full set equals 1: there is exactly one way to order nothing further. Every other entry is a sum of entries one element larger.',
      keyword: 'sixteen subsets' },

    { id: 'd4', scene: 'dp', start: 266, end: 272,
      caption: 'The cost is n times two to the n. That is fine to about twenty elements, which is why questions keep n small or the shape special.',
      narration: 'The cost is n times two to the n. That is fine to about twenty elements, which is why a question either keeps n small or gives a shape a formula can reach.',
      detail: 'At n equals twenty the table holds about a million entries, which is a second of computer time and far too much for paper. At n equals eight it is 256, which is a page.',
      keyword: 'n times two to the n' },

    /* ---- 10. the previous-year question --------------------------------- */
    { id: 'q1', scene: 'pyq2016', start: 272, end: 280,
      caption: 'GATE CSE 2016, Set 1, Question 11: the number of different topological orderings of the given graph.',
      narration: 'GATE CSE 2016, Set 1, Question 11. Consider the following directed graph. The number of different topological orderings of the vertices of the graph is blank.',
      detail: 'A fill-in-the-blank item, so the answer is a number and there is no option to eliminate. The graph has six vertices and the solutions agree that the count is six.',
      keyword: 'number of different topological orderings' },

    { id: 'q2', scene: 'pyq2016', start: 280, end: 288,
      caption: 'A is the only source and F the only sink, so every ordering starts with A and ends with F. Four slots remain.',
      narration: 'A is the only source and F the only sink, so every ordering starts with A and ends with F. Four slots remain in the middle.',
      detail: 'A vertex with in-degree zero must come first, and a vertex with out-degree zero must come last. When each is unique, both ends are fixed and the problem loses two elements.',
      keyword: 'four slots remain' },

    { id: 'q3', scene: 'pyq2016', start: 288, end: 294,
      caption: 'The middle is two chains in parallel: B before C, and D before E. So C of four choose two, which is six.',
      narration: 'The middle is two chains in parallel: B before C, and D before E. So the answer is C of four choose two, which is six.',
      detail: 'Both chains end at F and both start after A, so neither crosses the other. That is exactly the parallel join, and the binomial is the parallel rule.',
      keyword: 'C of four choose two' },

    { id: 'q4', scene: 'pyq2016', start: 294, end: 300,
      caption: 'The six: A B C D E F, A B D C E F, A B D E C F, A D B C E F, A D B E C F, A D E B C F. The answer is 6.',
      narration: 'The six orderings are A B C D E F, A B D C E F, A B D E C F, A D B C E F, A D B E C F and A D E B C F. The answer is six.',
      detail: 'Listing them is the check, and it is cheap here. Each one keeps B before C and D before E, and no other ordering does.',
      keyword: 'The answer is 6' },

    /* ---- 11. three names for one arithmetic ----------------------------- */
    { id: 'a1', scene: 'apps', start: 300, end: 308,
      caption: 'Two threads, two statements each. The six interleavings are the linear extensions of two parallel chains of two.',
      narration: 'Two threads, two statements each. The six interleavings are the linear extensions of two parallel chains of two, because each thread keeps its own order and nothing crosses between them.',
      detail: 'The partial order is: within thread one, the first statement before the second; within thread two, the same. No constraint links the two threads, so the poset is a parallel join.',
      keyword: 'six interleavings' },

    { id: 'a2', scene: 'apps', start: 308, end: 317,
      caption: 'GATE CSE 2024, Set 1, Question 40: all six orders are legal, but they produce only three distinct value pairs.',
      narration: 'GATE CSE 2024, Set 1, Question 40. All six orders are legal, but they produce only three distinct value pairs: four and four, four and three, and three and three.',
      detail: 'This is the distinction the question tests. Counting orderings and counting outcomes are different questions, and the answer is the set of outcomes, which has three members while the orderings number six.',
      keyword: 'three distinct value pairs',
      trap: 'Six interleavings is not the answer. The question asks which value pairs are possible, and four of the six orderings give the same pair.' },

    { id: 'a3', scene: 'apps', start: 317, end: 326,
      caption: 'GATE CSE 2017, Set 2, Question 44: eight operations give C of eight choose four, seventy schedules; sixteen create a cycle, leaving fifty-four.',
      narration: 'GATE CSE 2017, Set 2, Question 44. Eight operations give C of eight choose four, which is seventy schedules. Sixteen of them create a cycle in the precedence graph, leaving fifty-four conflict serialisable schedules.',
      detail: 'The seventy is the binomial for two chains of four. The sixteen is a subtraction, not a formula: a schedule is conflict serialisable exactly when its precedence graph is acyclic, and here that fails only when each transaction reads the item before the other writes it.',
      keyword: 'fifty-four' },

    { id: 'a4', scene: 'apps', start: 326, end: 336,
      caption: 'One arithmetic, three names: topological orderings, thread interleavings, serialisable schedules. Count the orderings that respect the constraints.',
      narration: 'One arithmetic, three names: topological orderings, thread interleavings and conflict serialisable schedules. In each case the task is to count the orderings that respect the constraints, so the first move is always to draw the partial order.',
      detail: 'That is the transferable habit. Name the elements, draw the arrows that must hold, ask whether the shape is a chain, a set of parallel chains, a tree or neither, and then choose between a formula, a case split and the subset table.',
      keyword: 'Count the orderings that respect the constraints' }
  ]
};
