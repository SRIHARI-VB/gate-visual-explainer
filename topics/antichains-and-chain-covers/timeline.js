/* ==========================================================================
   antichains-and-chain-covers - THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs - never edited by hand.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 336,

  scenes: [
    { id: 'antichain', n: 1,  title: 'Two objects: a chain and an antichain', objective: 'recognise an antichain as a set of mutually incomparable elements, and a chain as a set of mutually comparable ones', start: 0,   end: 32  },
    { id: 'numbers',   n: 2,  title: 'Width and height: two numbers, not one', objective: 'define width and height and see that either can exceed the other', start: 32,  end: 64  },
    { id: 'mirsky',    n: 3,  title: 'Mirsky: the layers by longest chain', objective: 'partition a poset into antichains whose number equals the height', start: 64,  end: 96  },
    { id: 'dilworth',  n: 4,  title: 'Dilworth: the fewest chains that cover it', objective: 'state the equality of width and minimum chain cover and check it on a computed example', start: 96,  end: 128 },
    { id: 'sperner',   n: 5,  title: 'Sperner: the widest level of a power set', objective: 'read the width of the Boolean lattice off the binomial coefficient, and count antichains', start: 128, end: 162 },
    { id: 'divisor',   n: 6,  title: 'The divisors of 60, computed', objective: 'carry out both theorems on a twelve-element poset built from divisibility', start: 162, end: 192 },
    { id: 'matching',  n: 7,  title: 'The matching that finds the chains', objective: 'turn a poset into a bipartite graph and read the chain cover off a maximum matching', start: 192, end: 224 },
    { id: 'levels',    n: 8,  title: 'When the widest level is not the answer', objective: 'refute "the biggest level is the maximum antichain" with a computed graded poset', start: 224, end: 252 },
    { id: 'traps',     n: 9,  title: 'Four traps, and the greedy that overpays', objective: 'separate width from height, maximum from maximal, and an optimal cover from a greedy one', start: 252, end: 284 },
    { id: 'pyq1991',   n: 10, title: 'GATE CSE 1991, Q1(xiv): partition into n antichains', objective: 'answer the verified previous-year item, and the 2005 chain item, from the theorems', start: 284, end: 312 },
    { id: 'method',    n: 11, title: 'The four-step procedure', objective: 'consolidate the method that answers any width or chain-cover question', start: 312, end: 336 }
  ],

  events: [
    /* ---- 1. chain and antichain ---------------------------------------- */
    { id: 'a1', scene: 'antichain', start: 0, end: 8,
      caption: 'Five tasks, four constraints: A before B, A before C, and both B and C before D. E waits for nobody.',
      narration: 'Five tasks and four constraints. A before B. A before C. Both B and C before D. And E waits for nobody and nothing waits for E.',
      detail: 'The picture is a partial order drawn as a Hasse diagram: an arrow from x up to y means x must come before y, and arrows forced by a longer path are left out. E is drawn to the side because it is comparable with nothing.',
      keyword: 'partial order' },

    { id: 'a2', scene: 'antichain', start: 8, end: 16,
      caption: 'A chain is a set in which every pair is comparable: A, B, D is a chain of three.',
      narration: 'A chain is a set in which every pair is comparable. A, B and D form a chain of three, because A comes before B and B comes before D, so every pair in the set has an order.',
      detail: 'Comparable means one of the two comes before the other. In a chain no two elements sit side by side, which is why a chain can be listed in one line.',
      keyword: 'chain' },

    { id: 'a3', scene: 'antichain', start: 16, end: 24,
      caption: 'An antichain is a set in which no two distinct elements are comparable: B, C, E is one of size three.',
      narration: 'An antichain is the opposite: no two distinct elements are comparable. B, C and E form an antichain of size three. B and C are both below D but neither is below the other, and E is below nothing.',
      detail: 'An antichain can be run in parallel: nothing in it must precede anything else in it. That is why the number of machines, threads or colours a schedule needs is a question about antichains.',
      keyword: 'antichain' },

    { id: 'a4', scene: 'antichain', start: 24, end: 32,
      caption: 'A chain and an antichain share at most one element. That one fact carries both theorems.',
      narration: 'A chain and an antichain can share at most one element, because two shared elements would have to be both comparable and incomparable. That single observation carries both theorems on this page.',
      detail: 'If C is a chain and A an antichain, then no two elements of A can lie in the same chain, so any chain cover needs at least as many chains as the antichain has elements. Every lower bound in this lesson comes from that sentence.',
      keyword: 'share at most one element' },

    /* ---- 2. width and height ------------------------------------------- */
    { id: 'n1', scene: 'numbers', start: 32, end: 40,
      caption: 'The width is the size of the largest antichain. Here it is three, and B, C, E is one of them.',
      narration: 'The width of a poset is the size of its largest antichain. Here the width is three, and B, C and E is a largest antichain.',
      detail: 'Width is sometimes called the Dilworth number. It is a property of the whole poset, not of a chosen subset, and it is what a parallel schedule has to pay for: three mutually independent tasks need three machines.',
      keyword: 'width' },

    { id: 'n2', scene: 'numbers', start: 40, end: 48,
      caption: 'The height is the size of the longest chain. Here it is also three, and that is a coincidence.',
      narration: 'The height is the size of the longest chain. Here it is three as well, because A to B to D is a chain of three. That equality is a coincidence of this picture and nothing more.',
      detail: 'Height is also called the length of the poset. A chain of four and an antichain of four both exist in this lesson, and on those the two numbers are one and four, in opposite orders.',
      keyword: 'height' },

    { id: 'n3', scene: 'numbers', start: 48, end: 56,
      caption: 'A chain of four has width one and height four. An antichain of four has width four and height one.',
      narration: 'A chain of four has width one and height four, since everything is comparable and nothing bigger is incomparable. An antichain of four has width four and height one. So neither number bounds the other in general.',
      detail: 'Both extremes are computed by the page. The only general relation is that both lie between one and n, and that they can both equal one only for a single element.',
      keyword: 'width one and height four' },

    { id: 'n4', scene: 'numbers', start: 56, end: 64,
      caption: 'For a poset of n elements, width times height is at least n. That is a real inequality, and it is not an equality.',
      narration: 'For a poset of n elements, the width times the height is at least n. Five elements with width three and height three give nine, which is above five, so the inequality is real and it is not tight.',
      detail: 'The product bound is proved by the layer partition of the next scene: the height is the number of layers and each layer is an antichain of size at most the width. The product bound is the weakest of the three facts here and the easiest to quote wrongly as an equality.',
      keyword: 'width times height' },

    /* ---- 3. Mirsky ------------------------------------------------------ */
    { id: 'm1', scene: 'mirsky', start: 64, end: 72,
      caption: 'Give each element its level: one plus the longest chain that ends at it.',
      narration: 'Give every element a level: one plus the length of the longest chain that ends at it. A and E get level one because nothing is below them.',
      detail: 'This is a computed quantity, not a guess: the page computes the longest chain ending at every element by a pass over the arrows, and the maximum of those numbers is the height.',
      keyword: 'level' },

    { id: 'm2', scene: 'mirsky', start: 72, end: 80,
      caption: 'Elements of the same level are never comparable, so each level is an antichain.',
      narration: 'Two elements of the same level can never be comparable, because the upper one would then have a chain below it one longer than the lower one has. So each level is an antichain.',
      detail: 'That is the whole of Mirsky&rsquo;s theorem: the levels partition the elements, there are as many levels as the height, and every level is an antichain. The argument is one line and needs no matching theory.',
      keyword: 'each level is an antichain' },

    { id: 'm3', scene: 'mirsky', start: 80, end: 88,
      caption: 'Three antichains here, and the height is three: a partition into three antichains, and no fewer will do.',
      narration: 'This poset splits into three antichains and its height is three. No partition into two antichains exists, because a longest chain of three would have to put two of its elements in one antichain.',
      detail: 'The lower bound is the pigeonhole step from the first scene: a chain of h elements needs h different antichains, since each antichain holds at most one of them. Mirsky says that bound is always attained.',
      keyword: 'partition into three antichains' },

    { id: 'm4', scene: 'mirsky', start: 88, end: 96,
      caption: 'Mirsky: the minimum number of antichains covering a poset equals its height.',
      narration: 'Mirsky&rsquo;s theorem: the minimum number of antichains needed to cover a finite poset equals the size of its longest chain. Cover and partition coincide here, because a subset of an antichain is an antichain.',
      detail: 'The cover-and-partition remark matters in an exam answer: a cover by h antichains can always be trimmed to a partition by h antichains, since deleting elements from an antichain leaves an antichain.',
      keyword: 'Mirsky' },

    /* ---- 4. Dilworth ---------------------------------------------------- */
    { id: 'd1', scene: 'dilworth', start: 96, end: 104,
      caption: 'Now cover the same poset with chains instead. A B D is one chain; C is another; E is a third.',
      narration: 'Now cover the same poset with chains instead of antichains. A, B and D form one chain, C is a second, and E is a third. Three chains cover everything.',
      detail: 'A chain cover is a family of chains whose union is the whole poset. It does not have to be disjoint, though for chains it can always be made disjoint, so partition and cover give the same minimum.',
      keyword: 'chain cover' },

    { id: 'd2', scene: 'dilworth', start: 104, end: 112,
      caption: 'Two chains cannot do it: B, C and E are pairwise incomparable, so each needs its own chain.',
      narration: 'Two chains cannot do it. B, C and E are pairwise incomparable, so each of the three must sit in a different chain. The antichain is a certificate that three chains are necessary.',
      detail: 'This direction is the easy one and it is the one to write first in an exam: an antichain of size k forces at least k chains. The hard direction is that k chains always suffice.',
      keyword: 'each needs its own chain' },

    { id: 'd3', scene: 'dilworth', start: 112, end: 120,
      caption: 'Dilworth: the largest antichain and the smallest chain cover have the same size. That size is the width.',
      narration: 'Dilworth&rsquo;s theorem says the two numbers are equal: the largest antichain and the smallest chain cover of a finite poset have the same size, and that common size is the width.',
      detail: 'Published by Robert Dilworth in 1950. It is not obvious, because the antichain and the chains are different objects and nothing in the picture shows which chains to take. The matching in scene seven is what makes the choice constructive.',
      keyword: 'Dilworth' },

    { id: 'd4', scene: 'dilworth', start: 120, end: 128,
      caption: 'Width three, height three, three chains, three antichains. Both theorems hold on this poset, and they are different theorems.',
      narration: 'Width three, height three, three chains, three antichains: both theorems hold here, and they are different theorems. Dilworth constrains the chains by the largest antichain; Mirsky constrains the antichains by the longest chain.',
      detail: 'They are dual statements in the technical sense, and the exam wording tells you which one is wanted: partition into chains is Dilworth, partition into antichains is Mirsky.',
      keyword: 'different theorems' },

    /* ---- 5. Sperner ----------------------------------------------------- */
    { id: 's1', scene: 'sperner', start: 128, end: 136,
      caption: 'The Boolean lattice of a three-element set: eight subsets, ordered by inclusion.',
      narration: 'Take the eight subsets of a three-element set and order them by inclusion. This is the Boolean lattice, and it is the poset behind every question about subsets of a set.',
      detail: 'The order is set inclusion: X is below Y exactly when X is a subset of Y. It is a partial order because two subsets can be incomparable, for instance a two-element set and a different two-element set.',
      keyword: 'Boolean lattice' },

    { id: 's2', scene: 'sperner', start: 136, end: 145,
      caption: 'An antichain here is a family of sets no one of which contains another. The middle level has three such sets.',
      narration: 'An antichain in this poset is a family of sets no one of which contains another. The three two-element subsets form one of size three, and so do the three one-element subsets.',
      detail: 'Those two families are the only maximum antichains here, which the page confirms by testing all 256 subsets of the eight elements. Both sit at the middle of the lattice.',
      keyword: 'no one of which contains another' },

    { id: 's3', scene: 'sperner', start: 145, end: 154,
      caption: 'Sperner: the widest level of the power set of an n-element set has C of n, floor of n over two members.',
      narration: 'Sperner&rsquo;s theorem: the largest antichain in the power set of an n-element set is the middle level, of size C of n choose floor of n over two. For three elements that is three, and for four elements it is six.',
      detail: 'The page checks it by brute force: the width of the Boolean lattice is 1, 2, 3 and 6 for one to four elements, and the binomial gives the same four numbers. That is a check on four cases, not a proof of the theorem.',
      keyword: 'Sperner' },

    { id: 's4', scene: 'sperner', start: 154, end: 162,
      caption: 'Antichains and maximum antichains are different counts: twenty antichains in this lattice, but only two of size three.',
      narration: 'The number of antichains and the number of maximum antichains are different questions. This lattice has twenty antichains in all, counting the empty one, but only two of them have size three.',
      detail: 'The count of antichains in the Boolean lattice is the Dedekind number, computed here as 2, 3, 6, 20 and 168 for zero to four elements. A question that asks how many antichains exist wants that sequence, not the width.',
      keyword: 'twenty antichains' },

    /* ---- 6. the divisors of 60 ------------------------------------------ */
    { id: 'v1', scene: 'divisor', start: 162, end: 171,
      caption: 'Twelve divisors of 60, ordered by divisibility: 4 divides 12, 12 divides 60, and 4 does not divide 6.',
      narration: 'Twelve divisors of sixty, ordered by divisibility. Four divides twelve and twelve divides sixty; four does not divide six, and six does not divide four, so those two are incomparable.',
      detail: 'Divisibility on the divisors of a fixed number is a partial order: reflexive, antisymmetric and transitive. It is the standard exam stand-in for a poset that is not a power set.',
      keyword: 'divisibility' },

    { id: 'v2', scene: 'divisor', start: 171, end: 180,
      caption: 'The width is four, and the page finds it by testing all 4096 subsets: 4, 6, 10, 15.',
      narration: 'The width is four. The page finds it the honest way, by testing all four thousand and ninety-six subsets of the twelve elements and keeping the largest one with no comparable pair: four, six, ten and fifteen.',
      detail: 'Brute force is what a twelve-element poset can afford and a general question cannot, which is why the exam always gives a poset with visible structure. The point of computing it here is to have a number that no shortcut had to be trusted for.',
      keyword: 'the width is four' },

    { id: 'v3', scene: 'divisor', start: 180, end: 186,
      caption: 'The height is five, from the layers 1; 2,3,5; 4,6,10,15; 12,20,30; 60.',
      narration: 'The height is five. The layers are one; then two, three and five; then four, six, ten and fifteen; then twelve, twenty and thirty; then sixty. Each layer is an antichain and there are five of them.',
      detail: 'Notice the widest layer is the middle one with four elements, and here it does equal the width. The next scene but one shows a poset where that fails, which is why the layer argument is not a method for the width.',
      keyword: 'the height is five' },

    { id: 'v4', scene: 'divisor', start: 186, end: 192,
      caption: 'Four chains cover it: 1,2,4,12,60 and 3,6,30 and 5,10,20 and 15. Dilworth predicted four.',
      narration: 'Four chains cover the whole poset: one, two, four, twelve, sixty; then three, six, thirty; then five, ten, twenty; and fifteen alone. Dilworth predicted four from the width, and the cover attains it.',
      detail: 'Each of those four chains is a chain in the divisibility order, the four together contain all twelve divisors, and four is the width, so the cover is optimal. No count of five chains can be beaten down to four by hand-waving; this one is exhibited.',
      keyword: 'four chains cover it' },

    /* ---- 7. the matching ------------------------------------------------ */
    { id: 'g1', scene: 'matching', start: 192, end: 200,
      caption: 'To build the cover, split every element into a left copy and a right copy, and draw an edge for each strict comparison.',
      narration: 'To build the cover rather than just count it, split every element into a left copy and a right copy, and draw an edge from the left copy of x to the right copy of y whenever x is strictly below y.',
      detail: 'The result is a bipartite graph with two copies of the poset on its two sides. Nothing about chains is visible in it yet; the chains appear once a matching is chosen.',
      keyword: 'left copy and a right copy' },

    { id: 'g2', scene: 'matching', start: 200, end: 208,
      caption: 'A maximum matching pairs each left copy with at most one right copy. Here it has size three.',
      narration: 'A maximum matching pairs each left copy with at most one right copy and each right copy with at most one left copy. Here the largest matching has size three, which the page finds by the augmenting-path method.',
      detail: 'A matching is a set of edges with no shared endpoint, so it can be read as a set of links x-below-y where each x is used once and each y is used once. That is exactly what a chain needs internally.',
      keyword: 'maximum matching' },

    { id: 'g3', scene: 'matching', start: 208, end: 216,
      caption: 'The matching turns into chains: follow the links, and every element used as a link is not a chain start.',
      narration: 'The matching turns into chains. Follow the links from any element that is not the target of a link, and you walk a chain. The number of chains is the number of elements minus the size of the matching.',
      detail: 'Six elements with a matching of three give three chains, and that is the width, so the cover is optimal. This is the constructive half of Dilworth, and it runs in polynomial time.',
      keyword: 'elements minus the matching' },

    { id: 'g4', scene: 'matching', start: 216, end: 224,
      caption: 'So the width is computable: build the graph, find a maximum matching, subtract from n. That is the exam-safe route.',
      narration: 'So the width of a poset is computable in polynomial time: build the split graph, find a maximum matching, and subtract its size from the number of elements. That route needs no cleverness about the shape.',
      detail: 'Finding the maximum antichain itself is also polynomial, by the König side of the same theorem, but the chain cover is what the matching hands you directly. The matching lesson in this repository owns the algorithm; this page owns the reduction.',
      keyword: 'subtract from n' },

    /* ---- 8. when a level is not the answer ------------------------------ */
    { id: 'l1', scene: 'levels', start: 224, end: 232,
      caption: 'A seven-element poset with ranks 0, 1 and 2: one element, then three, then three. Every maximal chain has length three.',
      narration: 'Here is a seven-element poset with ranks zero, one and two: one element, then three, then three. Every maximal chain runs through all three ranks, so the poset is graded.',
      detail: 'Graded means there is a rank function rising by exactly one on every cover and putting all maximal elements at the same rank. It is the property that makes "the levels" look like a natural decomposition.',
      keyword: 'graded' },

    { id: 'l2', scene: 'levels', start: 232, end: 241,
      caption: 'The widest level has three elements. The width is four, and the maximum antichain is 1, 2, 5, 6.',
      narration: 'The widest level has three elements. But the width is four: one, two, five and six are pairwise incomparable, and no level contains all four of them.',
      detail: 'So "the biggest level is the maximum antichain" is false in general, even for a graded poset. It happens to be true for the Boolean lattice, which is exactly why the Boolean lattice is a misleading model to generalise from.',
      keyword: 'the width is four',
      trap: 'This is the most common wrong method on the topic: count the elements of the widest level and call it the width. It answers the 60-divisor poset correctly and this one wrongly.' },

    { id: 'l3', scene: 'levels', start: 241, end: 248,
      caption: 'What the levels do give is Mirsky: three antichains covering everything, matching the height of three.',
      narration: 'What the levels do give is Mirsky: three antichains covering everything, matching the height of three. The layer construction is always valid for antichains and only sometimes optimal for chains.',
      detail: 'The direction of the two theorems is the thing to hold on to. Layers of a poset are always an antichain partition whose size is the height; they are not a chain cover and they say nothing about the width.',
      keyword: 'always valid for antichains' },

    { id: 'l4', scene: 'levels', start: 248, end: 252,
      caption: 'The safe move: prove a lower bound with an antichain you exhibit, and an upper bound with chains you exhibit.',
      narration: 'The safe move in an exam is to exhibit both. An antichain you can point at proves the width is at least its size, and a chain cover you can point at proves it is at most the number of chains. When the two numbers meet, you are done.',
      detail: 'This is a proof by matching bounds, and it needs no theorem at all: the antichain is a certificate for the lower bound and the cover is a certificate for the upper bound. Dilworth is what guarantees the two certificates always exist at the same size.',
      keyword: 'exhibit both' },

    /* ---- 9. the traps --------------------------------------------------- */
    { id: 't1', scene: 'traps', start: 252, end: 260,
      caption: 'Width and height are different numbers. Quoting Dilworth as "width equals height" is wrong.',
      narration: 'Width and height are different numbers. Quoting Dilworth as width equals height is simply wrong: the theorem pairs the largest antichain with the smallest chain cover, not with the longest chain.',
      detail: 'On a chain of four the width is one and the height is four, so a statement that they are equal is refuted by the smallest possible example. Mirsky is the theorem that pairs the longest chain with a partition into antichains.',
      keyword: 'different numbers',
      trap: 'Width equals height is false. Dilworth: width equals minimum chain cover. Mirsky: height equals minimum antichain cover.' },

    { id: 't2', scene: 'traps', start: 260, end: 268,
      caption: 'A maximal antichain is not a maximum one. Maximal means you cannot add an element; maximum means nothing bigger exists.',
      narration: 'A maximal antichain is not a maximum antichain. Maximal means no further element can be added while keeping it an antichain; maximum means no antichain anywhere in the poset is larger.',
      detail: 'In the first poset of this lesson, A together with E is maximal: neither B, C nor D can be added, because A is below all three. Yet it has size two while the maximum is three. A question that says largest or maximum wants the width; a question that says maximal wants a different object.',
      keyword: 'maximal is not maximum' },

    { id: 't3', scene: 'traps', start: 268, end: 276,
      caption: 'Greedy chain covers overpay: this seven-element poset has width four, and taking the longest chain first costs five chains.',
      narration: 'Greedy chain covers overpay. This seven-element poset has width four, but taking the longest chain first and then repeating costs five chains. Four is attainable and the page exhibits a cover of four.',
      detail: 'The greedy walk is the same mistake as always: an optimal-looking first choice removes elements that a better cover needed. The page computes both numbers, so the gap of one is measured and not asserted.',
      keyword: 'greedy overpays',
      trap: 'Any chain-cover answer obtained by repeatedly taking a longest chain is an upper bound, never a proof of optimality.' },

    { id: 't4', scene: 'traps', start: 276, end: 284,
      caption: 'In a general graph, independence number and clique cover need not agree. In a poset they do, because comparability graphs are perfect.',
      narration: 'In a general graph, the largest independent set and the fewest cliques needed to cover the vertices need not agree. In a poset they do, because the comparability graph is perfect, and Dilworth is that statement in order-theoretic language.',
      detail: 'An antichain is an independent set of the comparability graph, and a chain is a clique of it, so the poset statement is exactly independence number equals clique cover number. That equality fails on an odd cycle of length five, which is the counterexample to remember.',
      keyword: 'perfect graph' },

    /* ---- 10. the verified previous-year items --------------------------- */
    { id: 'p1', scene: 'pyq1991', start: 284, end: 292,
      caption: 'GATE CSE 1991, Q1(xiv): if the longest chain has length n, the poset can be written as a ____ of n antichains.',
      narration: 'GATE CSE 1991, question one, part fourteen: if the longest chain in a partial order is of length n, then the partial order can be written as a blank of n antichains. The blank is partition.',
      detail: 'The item is a fill-in-the-blank asking for the name of the construction, and it is Mirsky&rsquo;s theorem stated as a fact. It is reproduced from a public archive of the 1991 paper; the original paper scan was not consulted this run.',
      keyword: 'partition' },

    { id: 'p2', scene: 'pyq1991', start: 292, end: 300,
      caption: 'Why partition and not cover: the levels are disjoint, and n is the height, which no smaller number of antichains can beat.',
      narration: 'Why partition rather than cover: the levels are disjoint by construction, and n is the height, so no smaller number of antichains can work. A chain of n elements needs n antichains because each holds at most one of them.',
      detail: 'If the item had asked for the minimum number of antichains needed to cover the poset, the answer would be the same number, because a cover by antichains can always be trimmed to a partition by the same number.',
      keyword: 'the levels are disjoint' },

    { id: 'p3', scene: 'pyq1991', start: 300, end: 306,
      caption: 'GATE IT 2005, Q33: the largest family of subsets of an n-set that is totally ordered by inclusion has n plus one members.',
      narration: 'GATE IT 2005, question thirty-three, which some archives file under the CSE paper: the largest family of subsets of an n-element set in which any two are comparable has n plus one members. That is the height of the Boolean lattice.',
      detail: 'The upper bound is that a chain of distinct subsets must have strictly increasing sizes, and sizes run from zero to n. The bound is attained by the chain of initial segments, so the answer is n plus one and not n.',
      keyword: 'n plus one' },

    { id: 'p4', scene: 'pyq1991', start: 306, end: 312,
      caption: 'Chain questions give a longest chain or a widest antichain; read which, then quote Mirsky or Dilworth, never both at once.',
      narration: 'Both previous-year items are the same skill: read whether the question is about a longest chain or a widest antichain, then quote the matching theorem. Mirsky for antichains from a chain, Dilworth for chains from an antichain.',
      detail: 'The 1991 item quotes the chain and asks for antichains, so it is Mirsky. A question that quotes an antichain and asks for chains is Dilworth. The wording of the object you are given is the whole signal.',
      keyword: 'the object you are given' },

    /* ---- 11. the method ------------------------------------------------- */
    { id: 'c1', scene: 'method', start: 312, end: 320,
      caption: 'Step one: decide which number the question wants. Width, height, a chain cover, or a count of antichains.',
      narration: 'Step one is to decide which number the question wants: the width, the height, a minimum chain cover, or a count of antichains. Those are four different answers and only two of them are numbers the theorems name.',
      detail: 'A count of antichains is not the width and not the Dedekind number unless the poset is a Boolean lattice. Reading the question is cheaper than any computation.',
      keyword: 'which number' },

    { id: 'c2', scene: 'method', start: 320, end: 328,
      caption: 'Step two: exhibit a candidate antichain for the lower bound, and candidate chains for the upper bound.',
      narration: 'Step two is to exhibit both certificates: an antichain for the lower bound and a chain cover for the upper bound. If the two numbers meet, the answer is proved without quoting any theorem.',
      detail: 'Exhibiting is also the fastest check on a computed answer. A wrong width is usually wrong by one, and one glance at the antichain and the cover shows which side is short.',
      keyword: 'exhibit both certificates' },

    { id: 'c3', scene: 'method', start: 328, end: 336,
      caption: 'Step three: if the poset is big, use the split graph and a maximum matching. Width equals n minus the matching size.',
      narration: 'Step three, for a poset too big to draw: split every element into two copies, take a maximum matching, and read the width as the number of elements minus the matching. That is polynomial and it needs no insight into the shape.',
      detail: 'The full method: name the object the question wants, exhibit the two certificates, and fall back on the matching when the poset is large. The layers are a shortcut for the antichain side only, and the widest level is a shortcut for neither.',
      keyword: 'n minus the matching size' }
  ]
};
