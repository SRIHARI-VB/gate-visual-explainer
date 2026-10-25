/* ==========================================================================
   partial-orders-and-lattices — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs — never edited by hand.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'order',
      n: 1,
      title: 'An order is a before-list',
      start: 0, end: 30,
      objective: 'See a partial order as a fully specified "must come before" relation, and see that its picture does not have to put every pair in a line.'
    },
    {
      id: 'three',
      n: 2,
      title: 'The three promises',
      start: 30, end: 60,
      objective: 'Test reflexivity on the diagonal, antisymmetry on mirror pairs, and transitivity on paths of two, and name the promise that usually fails.'
    },
    {
      id: 'compare',
      n: 3,
      title: 'Comparable, chain, antichain',
      start: 60, end: 90,
      objective: 'Separate comparable from incomparable pairs, and see a total order as the special case where no pair is incomparable.'
    },
    {
      id: 'cover',
      n: 4,
      title: 'The covering relation',
      start: 90, end: 120,
      objective: 'Strip an order down to its covers, and see that closing the covers gives the whole order back.'
    },
    {
      id: 'hasse',
      n: 5,
      title: 'Drawing the Hasse diagram',
      start: 120, end: 150,
      objective: 'Build the diagram from the covers, level by level, and read the order back off it by walking upward.'
    },
    {
      id: 'extrema',
      n: 6,
      title: 'Maximal against greatest',
      start: 150, end: 180,
      objective: 'Separate the local extremal elements from the global ones, and count them on two posets.'
    },
    {
      id: 'bounds',
      n: 7,
      title: 'Bounds of a subset',
      start: 180, end: 210,
      objective: 'Find all upper and lower bounds of a named subset, then the least upper bound, and see that it need not be inside the subset.'
    },
    {
      id: 'lattice',
      n: 8,
      title: 'The lattice test',
      start: 210, end: 240,
      objective: 'Decide whether a poset is a lattice by testing every pair, and recognise the two shapes that make the test fail.'
    },
    {
      id: 'distributive',
      n: 9,
      title: 'Distributive and complemented',
      start: 240, end: 270,
      objective: 'Test distributivity with one triple, count complements, and see why M3 and N5 are the two obstructions.'
    },
    {
      id: 'rules',
      n: 10,
      title: 'Four rules to carry into the exam',
      start: 270, end: 300,
      objective: 'Consolidate the tests and the traps into four rules that cover the questions in this unit.'
    }
  ],

  events: [

    /* ---------------- scene 1: order ---------------- */
    {
      id: 'or-1', start: 0, end: 8, scene: 'order',
      caption: 'An order on a set says which elements must come before which. The symbol a ⪯ b means a comes before b, or a is the same element as b.',
      detail: 'Read the symbol ⪯ as "is below, or equal to". It is one relation on the set, written as a set of ordered pairs: the pair (a, b) is in the relation exactly when a comes before b or a equals b. Every question in this unit starts by fixing both the set and the relation.',
      keyword: 'comes before',
      trap: null,
      narration: 'An order on a set says which elements must come before which. The symbol a is-below b means a comes before b, or a is the same element as b.'
    },
    {
      id: 'or-2', start: 8, end: 16, scene: 'order',
      caption: 'Draw each element as a dot and each comparison as a line going upward. Two dots with no line either way are simply not compared.',
      detail: 'A dependency chart is the picture of an order: courses as dots, prerequisites as lines going upward. The absence of a line between two dots is not a missing fact — it is the fact that neither must precede the other.',
      keyword: 'not compared',
      trap: null,
      narration: 'Draw each element as a dot and each comparison as a line going upward. Two dots with no line either way are simply not compared.'
    },
    {
      id: 'or-3', start: 16, end: 23, scene: 'order',
      caption: 'Divisibility is an order. On the divisors of 12, the number 1 is below everything and 12 is above everything, while 2 and 3 sit side by side.',
      detail: 'Take the set 1, 2, 3, 4, 6, 12 and let a be below b mean that a divides b. Every element divides itself, and the chart has a bottom, a top, and two middle elements that are not related to each other. This poset is used for the next three scenes.',
      keyword: 'divisibility',
      trap: null,
      narration: 'Divisibility is an order. On the divisors of 12, 1 is below everything and 12 is above everything, while 2 and 3 sit side by side.'
    },
    {
      id: 'or-4', start: 23, end: 30, scene: 'order',
      caption: 'That is why the word is partial: the order is completely known, but not every pair has to be in a line.',
      detail: 'A partial order that does compare every pair is called a total order, and its picture is a single vertical line. Nothing is unknown in a partial order; the word partial describes comparability, not information.',
      keyword: 'partial',
      trap: 'Partial does not mean incomplete. Every pair is decided; some pairs are simply decided as "no relation either way".',
      narration: 'That is why the word is partial: the order is completely known, but not every pair has to be in a line.'
    },

    /* ---------------- scene 2: three ---------------- */
    {
      id: 'th-1', start: 30, end: 38, scene: 'three',
      caption: 'Promise one, reflexivity: every element comes before itself. In the matrix of the relation, the whole diagonal is ones.',
      detail: 'In a matrix with rows and columns indexed by the elements, the cell in row a and column b is one exactly when a is below b. Reflexivity is then the single statement that every diagonal cell is one — six ones for the six divisors of 12.',
      keyword: 'diagonal',
      trap: null,
      narration: 'Promise one, reflexivity: every element comes before itself. In the matrix of the relation, the whole diagonal is ones.'
    },
    {
      id: 'th-2', start: 38, end: 45, scene: 'three',
      caption: 'Promise two, antisymmetry: if a comes before b and b comes before a, then a and b are the same element. No pair of ones mirrors across the diagonal.',
      detail: 'Antisymmetry is not the negation of symmetry. A relation may be both symmetric and antisymmetric — the identity relation is both. What antisymmetry forbids is a genuine two-way comparison between two different elements, which is exactly what makes an order a ranking rather than a grouping.',
      keyword: 'antisymmetry',
      trap: 'Antisymmetric is not "not symmetric". The identity relation is symmetric and antisymmetric at the same time. The forbidden pattern is a two-way comparison between two distinct elements.',
      narration: 'Promise two, antisymmetry: if a comes before b and b comes before a, then a and b are the same element.'
    },
    {
      id: 'th-3', start: 45, end: 52, scene: 'three',
      caption: 'Promise three, transitivity: if a comes before b and b comes before c, then a comes before c, whether or not the pair is written down.',
      detail: 'Transitivity is what lets a picture keep only the immediate steps. In the divisors of 12, 1 is below 2 and 2 is below 12, so 1 is below 12 — and that comparison is in the relation even though nothing draws it directly.',
      keyword: 'transitivity',
      trap: null,
      narration: 'Promise three, transitivity: if a comes before b and b comes before c, then a comes before c, whether or not the pair is written down.'
    },
    {
      id: 'th-4', start: 52, end: 60, scene: 'three',
      caption: 'A relation with all three promises is a partial order, and the set together with it is a poset. Take any promise away and it is not one.',
      detail: 'The three promises are independent: dropping reflexivity gives a strict order, dropping antisymmetry gives a preorder such as "is related to", and dropping transitivity gives an arbitrary comparison table. Each failure has its own counterexample, and the page tests all three separately so that a relation failing two is reported as failing two.',
      keyword: 'poset',
      trap: 'A relation can be reflexive and transitive and still fail — antisymmetry is the promise that is most often missing. Test all three before concluding.',
      narration: 'A relation with all three promises is a partial order, and the set together with it is a poset.'
    },

    /* ---------------- scene 3: compare ---------------- */
    {
      id: 'co-1', start: 60, end: 68, scene: 'compare',
      caption: 'Two elements are comparable when one comes before the other, and incomparable when neither does. Incomparable pairs are drawn side by side.',
      detail: 'Comparability is a property of a pair, not of an element. The number 2 is comparable with 1, 4, 6 and 12, and incomparable with 3. Counting comparable pairs is often the quickest way to check a claim about a poset.',
      keyword: 'comparable',
      trap: null,
      narration: 'Two elements are comparable when one comes before the other, and incomparable when neither does.'
    },
    {
      id: 'co-2', start: 68, end: 75, scene: 'compare',
      caption: 'If every pair is comparable the order is total, and the whole set is called a chain. A chain is drawn as one straight line.',
      detail: 'The divisors of 12 are not a chain, because 2 and 3 are incomparable. The divisors of 8 are a chain: 1, 2, 4, 8. A total order is the special case of a partial order in which the incomparable count is zero.',
      keyword: 'chain',
      trap: null,
      narration: 'If every pair is comparable the order is total, and the whole set is called a chain.'
    },
    {
      id: 'co-3', start: 75, end: 83, scene: 'compare',
      caption: 'A set of elements that are pairwise incomparable is an antichain. In the divisors of 12 the set containing 2 and 3 is one.',
      detail: 'Antichains are the opposite extreme from chains: nothing in an antichain is comparable with anything else in it. In the power set of a three-element set the three two-element subsets form an antichain of size three, and so do the three one-element subsets.',
      keyword: 'antichain',
      trap: null,
      narration: 'A set of elements that are pairwise incomparable is an antichain. In the divisors of 12 the set containing 2 and 3 is one.'
    },
    {
      id: 'co-4', start: 83, end: 90, scene: 'compare',
      caption: 'In the divisors of 12, twelve pairs are comparable and three are not, so the order is partial and not total.',
      detail: 'Six elements give fifteen unordered pairs. Twelve of them are comparable and the three incomparable pairs are 2 with 3, 4 with 3, and 6 with 3. A total order on six elements would need all fifteen comparable, which is exactly what a chain looks like.',
      keyword: 'twelve pairs',
      trap: null,
      narration: 'In the divisors of 12, twelve pairs are comparable and three are not, so the order is partial and not total.'
    },

    /* ---------------- scene 4: cover ---------------- */
    {
      id: 'cv-1', start: 90, end: 98, scene: 'cover',
      caption: 'Most of an order is redundant. The element b covers a when a is strictly below b and nothing sits strictly between them.',
      detail: 'The covering relation keeps only the immediate steps. Formally, a is covered by b when a is below b, a is not b, and there is no element z with a strictly below z strictly below b. It is the transitive reduction of the order.',
      keyword: 'covers',
      trap: null,
      narration: 'Most of an order is redundant. The element b covers a when a is strictly below b and nothing sits strictly between them.'
    },
    {
      id: 'cv-2', start: 98, end: 105, scene: 'cover',
      caption: 'On the divisors of 12 the relation has eighteen pairs, and only seven of them are covers.',
      detail: 'The seven covers are 1 with 2, 1 with 3, 2 with 4, 2 with 6, 3 with 6, 4 with 12 and 6 with 12. The pair 1 with 12 is in the relation but is not a cover, because 1 is strictly below 2 which is strictly below 12.',
      keyword: 'seven',
      trap: 'Removing only the self-pairs is not enough. Transitivity also has to be stripped: twelve arrows remain after removing the diagonal, but only seven are covers.',
      narration: 'On the divisors of 12 the relation has eighteen pairs, and only seven of them are covers.'
    },
    {
      id: 'cv-3', start: 105, end: 113, scene: 'cover',
      caption: 'Close the seven covers transitively and the eighteen pairs come back exactly. Nothing has been lost.',
      detail: 'This is the sense in which a diagram is complete: the cover relation determines the order it came from, and there is at most one partial order with a given cover relation. The page rebuilds the order from the covers and compares it with the original pair by pair.',
      keyword: 'nothing has been lost',
      trap: null,
      narration: 'Close the seven covers transitively and the eighteen pairs come back exactly. Nothing has been lost.'
    },
    {
      id: 'cv-4', start: 113, end: 120, scene: 'cover',
      caption: 'So a question that says "draw the poset" always means the covers. A line between two elements is a cover, never a long comparison.',
      detail: 'This convention is what makes the diagram readable: twelve arrows would be a mess, seven are a picture. When a question gives a diagram, every drawn line is a cover, and every longer comparison is a path of drawn lines.',
      keyword: 'the covers',
      trap: null,
      narration: 'So a question that says draw the poset always means the covers. A line between two elements is a cover, never a long comparison.'
    },

    /* ---------------- scene 5: hasse ---------------- */
    {
      id: 'ha-1', start: 120, end: 128, scene: 'hasse',
      caption: 'A Hasse diagram puts a dot for each element, a line for each cover, larger elements higher, and no arrowheads and no self-loops.',
      detail: 'The three simplifications are each justified by one promise: self-loops are dropped because the order is reflexive, arrowheads are dropped because the order is antisymmetric so direction is unambiguous, and long comparisons are dropped because the order is transitive.',
      keyword: 'no arrowheads',
      trap: null,
      narration: 'A Hasse diagram puts a dot for each element, a line for each cover, larger elements higher, and no arrowheads and no self-loops.'
    },
    {
      id: 'ha-2', start: 128, end: 136, scene: 'hasse',
      caption: 'Place the minimal elements on the bottom row, then each element one row above the highest element it covers.',
      detail: 'The row of an element is its height: one more than the largest height among the elements it covers. On the divisors of 12 that gives four rows — 1 alone, then 2 and 3, then 4 and 6, then 12.',
      keyword: 'bottom row',
      trap: null,
      narration: 'Place the minimal elements on the bottom row, then each element one row above the highest element it covers.'
    },
    {
      id: 'ha-3', start: 136, end: 143, scene: 'hasse',
      caption: 'Read the order by walking upward: if you can get from a to b going up along the lines, then a comes before b.',
      detail: 'The path 2 to 4 to 12 shows that 2 is below 12, even though no line joins them. Equivalently, walking downward reverses the comparison. Walking sideways is not a comparison at all.',
      keyword: 'walking upward',
      trap: null,
      narration: 'Read the order by walking upward: if you can get from a to b going up along the lines, then a comes before b.'
    },
    {
      id: 'ha-4', start: 143, end: 150, scene: 'hasse',
      caption: 'Height on the page is not the order. Only a path of lines is, so a diagram can be redrawn with dots moved and the order is unchanged.',
      detail: 'A labelled diagram determines its order uniquely, but the same order has many drawings. Moving a dot higher without adding a path changes nothing; adding a line changes everything. This is why a question about a diagram is a question about its lines.',
      keyword: 'not the order',
      trap: 'A dot drawn higher is not thereby larger. Read the lines, not the layout — a common trap when a diagram is drawn with a maximal element lower than a non-maximal one.',
      narration: 'Height on the page is not the order. Only a path of lines is, so a diagram can be redrawn with dots moved and the order is unchanged.'
    },

    /* ---------------- scene 6: extrema ---------------- */
    {
      id: 'ex-1', start: 150, end: 158, scene: 'extrema',
      caption: 'An element is minimal when nothing is strictly below it, and maximal when nothing is strictly above it. Both are local statements.',
      detail: 'Minimal and maximal look only one step away, through the cover relation: a minimal element covers nothing, a maximal element is covered by nothing. So a poset can have several of each, and it usually does.',
      keyword: 'minimal',
      trap: null,
      narration: 'An element is minimal when nothing is strictly below it, and maximal when nothing is strictly above it. Both are local statements.'
    },
    {
      id: 'ex-2', start: 158, end: 166, scene: 'extrema',
      caption: 'An element is the least when it is below every element, and the greatest when it is above every element. Both are global, and each is unique if it exists.',
      detail: 'Two greatest elements would each have to be above the other, which antisymmetry forbids unless they are equal. So the greatest element is unique when it exists — but many posets have none, and that is the usual case.',
      keyword: 'greatest',
      trap: null,
      narration: 'An element is the least when it is below every element, and the greatest when it is above every element. Both are global, and each is unique if it exists.'
    },
    {
      id: 'ex-3', start: 166, end: 173, scene: 'extrema',
      caption: 'Here a and b are both below c and below d. Both c and d are maximal, and there is no greatest element at all.',
      detail: 'Nothing is above c and nothing is above d, so both are maximal — two of them. Neither is above the other, so neither is above everything, so there is no greatest element. Two maximal elements make a greatest element impossible. On a finite poset a single maximal element is always the greatest, so the count settles the question either way.',
      keyword: 'no greatest element',
      trap: 'Counting maximal elements is the fast test. Two or more of them rule out a greatest element; exactly one, on a finite poset, is the greatest element.',
      narration: 'Here a and b are both below c and below d. Both c and d are maximal, and there is no greatest element at all.'
    },
    {
      id: 'ex-4', start: 173, end: 180, scene: 'extrema',
      caption: 'In the 2024 paper poset, 1 and 3 are minimal and 2 and 4 are maximal, so there is neither a least nor a greatest element.',
      detail: 'The relations are 1 below 2, 3 below 2 and 3 below 4. Two minimal elements rule out a least element and two maximal elements rule out a greatest one, immediately. This is the poset behind the linear-extension question in the practice set.',
      keyword: 'two minimal',
      trap: null,
      narration: 'In the 2024 paper poset, 1 and 3 are minimal and 2 and 4 are maximal, so there is neither a least nor a greatest element.'
    },

    /* ---------------- scene 7: bounds ---------------- */
    {
      id: 'bo-1', start: 180, end: 188, scene: 'bounds',
      caption: 'Fix a subset S. An upper bound of S is above every element of S, and a lower bound is below every element of S.',
      detail: 'Bounds are computed by scanning the whole poset, not just S. The definition says "every element of S is below it", so an element of S can be a bound, but nothing requires it to be.',
      keyword: 'upper bound',
      trap: null,
      narration: 'Fix a subset S. An upper bound of S is above every element of S, and a lower bound is below every element of S.'
    },
    {
      id: 'bo-2', start: 188, end: 196, scene: 'bounds',
      caption: 'In the divisors of 12 take S as the pair 4 and 6. The only upper bound is 12, so 12 is the least upper bound.',
      detail: 'An element above both 4 and 6 must be a common multiple that divides 12, and 12 is the only one. The least upper bound is therefore 12, and in a divisibility order it is always the least common multiple.',
      keyword: 'least upper bound',
      trap: null,
      narration: 'In the divisors of 12 take S as the pair 4 and 6. The only upper bound is 12, so 12 is the least upper bound.'
    },
    {
      id: 'bo-3', start: 196, end: 203, scene: 'bounds',
      caption: 'The lower bounds are 1 and 2, and the greatest of those is 2. So the meet of 4 and 6 is 2, which is their greatest common divisor.',
      detail: 'Two lower bounds, and one of them is above the other: 1 is below 2. The greatest lower bound is therefore 2 and not 1 — the meet takes the largest lower bound, not the smallest.',
      keyword: 'greatest lower bound',
      trap: 'The meet is the greatest lower bound, so it is the largest of the lower bounds. Answering with the least element of the poset is the standard slip.',
      narration: 'The lower bounds are 1 and 2, and the greatest of those is 2. So the meet of 4 and 6 is 2, which is their greatest common divisor.'
    },
    {
      id: 'bo-4', start: 203, end: 210, scene: 'bounds',
      caption: 'Notice that 12 is not in S, and that S has no greatest element. A bound and an extreme element are different objects.',
      detail: 'The pair 4 and 6 has no maximum, because 4 and 6 are incomparable. Yet the pair has a least upper bound, 12, which lives outside it. Confusing the two is the most common error in this unit, and it is why the definitions are worth memorising separately.',
      keyword: 'not in S',
      trap: 'The least upper bound of S need not belong to S, and S need not have a greatest element even when it has a least upper bound.',
      narration: 'Notice that 12 is not in S, and that S has no greatest element. A bound and an extreme element are different objects.'
    },

    /* ---------------- scene 8: lattice ---------------- */
    {
      id: 'la-1', start: 210, end: 218, scene: 'lattice',
      caption: 'A lattice is a poset in which every pair of elements has both a least upper bound and a greatest lower bound.',
      detail: 'The join of a and b, written a or b with the vee, is their least upper bound; the meet, written a wedge b, is their greatest lower bound. A lattice needs both for every pair, including a pair of equal elements, where both answers are the element itself.',
      keyword: 'every pair',
      trap: null,
      narration: 'A lattice is a poset in which every pair of elements has both a least upper bound and a greatest lower bound.'
    },
    {
      id: 'la-2', start: 218, end: 226, scene: 'lattice',
      caption: 'Two upper bounds that cannot be compared give no join. Two lower bounds that cannot be compared give no meet.',
      detail: 'These are the only two ways the test can fail. If a pair has upper bounds and exactly one of them is below all the others, the join exists; if two of them are incomparable and no element sits below both, the join does not exist. The same reading, upside down, decides the meet.',
      keyword: 'no join',
      trap: null,
      narration: 'Two upper bounds that cannot be compared give no join. Two lower bounds that cannot be compared give no meet.'
    },
    {
      id: 'la-3', start: 226, end: 233, scene: 'lattice',
      caption: 'The diamond is a lattice: 0 below three pairwise incomparable elements, all three below 1. The join of any two middles is 1 and the meet is 0.',
      detail: 'This five-element poset is called M3. Testing all pairs: two equal elements give themselves, a middle with 0 gives the middle, a middle with 1 gives 1, and two different middles give join 1 and meet 0. Every pair works, so M3 is a lattice.',
      keyword: 'diamond',
      trap: null,
      narration: 'The diamond is a lattice: 0 below three pairwise incomparable elements, all three below 1. The join of any two middles is 1 and the meet is 0.'
    },
    {
      id: 'la-4', start: 233, end: 240, scene: 'lattice',
      caption: 'The 2024 poset fails the test: the pair 1 and 3 has upper bound 2 but no lower bound at all, so it has no meet.',
      detail: 'Every pair must be tested, and one failure is enough. Here the failure is on the meet side: nothing is below both 1 and 3, so the set of lower bounds is empty and there is no greatest element among it.',
      keyword: 'no meet',
      trap: 'A lattice is not a poset in which every subset has a bound — only every pair, which on a finite poset is equivalent. A question that says "complete lattice" is asking about all subsets, a strictly stronger condition.',
      narration: 'The 2024 poset fails the test: the pair 1 and 3 has upper bound 2 but no lower bound at all, so it has no meet.'
    },

    /* ---------------- scene 9: distributive ---------------- */
    {
      id: 'di-1', start: 240, end: 248, scene: 'distributive',
      caption: 'A lattice is distributive when meet distributes over join: a ∧ (b ∨ c) equals (a ∧ b) ∨ (a ∧ c) for every triple.',
      detail: 'Only one direction of the identity has to be checked, because in any lattice the right-hand side is always below the left-hand side. Distributivity says the two sides coincide. In a power set it holds for every triple, because union and intersection distribute over each other.',
      keyword: 'distributive',
      trap: null,
      narration: 'A lattice is distributive when meet distributes over join: a wedge the join of b and c equals the join of a wedge b and a wedge c, for every triple.'
    },
    {
      id: 'di-2', start: 248, end: 256, scene: 'distributive',
      caption: 'M3 fails. With a, b, c the three middles, the left side is a ∧ 1 = a and the right side is 0 ∨ 0 = 0.',
      detail: 'One failing triple is enough. The two sides differ because the three middle elements are mutually incomparable, so each of them disappears from the right-hand side while surviving on the left. This is the pentagon-free condition in miniature: a finite lattice is distributive exactly when it contains neither M3 nor N5 as a sublattice.',
      keyword: 'one failing triple',
      trap: null,
      narration: 'M3 fails. With a, b and c the three middles, the left side is a meet 1 which is a, and the right side is 0 join 0 which is 0.'
    },
    {
      id: 'di-3', start: 256, end: 263, scene: 'distributive',
      caption: 'A complement of a is an element b with a ∨ b = 1 and a ∧ b = 0. In M3 each middle element has two complements.',
      detail: 'In M3, a has complements b and c, since the join of a with either is 1 and the meet is 0. In a distributive lattice with a least and a greatest element a complement is unique, so two complements is proof of non-distributivity — a much faster test than hunting for a failing triple.',
      keyword: 'complement',
      trap: 'Two complements is evidence against distributivity, not a definition of it. Conversely, "not distributive" does not mean "no complements" — M3 is complemented and not distributive.',
      narration: 'A complement of a is an element b with a join b equal to 1 and a meet b equal to 0. In M3 each middle element has two complements.'
    },
    {
      id: 'di-4', start: 263, end: 270, scene: 'distributive',
      caption: 'The power set of a three-element set is distributive and every one of its eight elements has exactly one complement, the set difference.',
      detail: 'Union and intersection distribute, so the lattice identity holds for every triple. The complement of a subset is its difference from the whole set, and it is unique. A distributive, bounded, complemented lattice of this kind is a Boolean algebra — the power set is the standard example, and M3 is the standard near-miss.',
      keyword: 'exactly one complement',
      trap: null,
      narration: 'The power set of a three-element set is distributive and every one of its eight elements has exactly one complement, the set difference.'
    },

    /* ---------------- scene 10: rules ---------------- */
    {
      id: 'ru-1', start: 270, end: 277, scene: 'rules',
      caption: 'One: test the three promises separately. Antisymmetry is the one usually missing, and it is the one that makes the object an order.',
      detail: 'Reflexivity is a glance at the diagonal, transitivity is a closure, and antisymmetry is a check that no comparison runs both ways between two different elements. Report all failures, because a question may ask which promise fails.',
      keyword: 'three promises',
      trap: null,
      narration: 'Rule one: test the three promises separately. Antisymmetry is the one usually missing, and it is the one that makes the object an order.'
    },
    {
      id: 'ru-2', start: 277, end: 284, scene: 'rules',
      caption: 'Two: draw the covers, not the closure. Then read comparisons by walking upward along the lines.',
      detail: 'The cover relation is the transitive reduction, and it determines the order completely. Every later question is faster on the picture: comparability is a path, maximal and minimal are the top and bottom of the picture, and a join is the lowest common point above two dots.',
      keyword: 'draw the covers',
      trap: null,
      narration: 'Rule two: draw the covers, not the closure. Then read comparisons by walking upward along the lines.'
    },
    {
      id: 'ru-3', start: 284, end: 292, scene: 'rules',
      caption: 'Three: keep maximal apart from greatest and minimal apart from least. Count them before answering.',
      detail: 'Maximal means nothing above, and there may be several; greatest means above everything, and there is at most one. The same pair of definitions, reversed, gives minimal and least. A poset with two maximal elements has no greatest element, and that single observation often settles a question.',
      keyword: 'maximal apart from greatest',
      trap: 'Two maximal elements rule out a greatest element, and on a finite poset exactly one maximal element is automatically the greatest — so the count is the whole test.',
      narration: 'Rule three: keep maximal apart from greatest and minimal apart from least. Count them before answering.'
    },
    {
      id: 'ru-4', start: 292, end: 300, scene: 'rules',
      caption: 'Four: a lattice needs a join and a meet for every pair. Then test distributivity with one triple, and count complements.',
      detail: 'Climb the ladder in order: lattice, then distributive, then complemented, then Boolean. A single failing pair stops the first rung, a single failing triple stops the second, and two complements for one element stops the second as well. Answering the rung above before the one below is how marks are lost.',
      keyword: 'every pair',
      trap: null,
      narration: 'Rule four: a lattice needs a join and a meet for every pair. Then test distributivity with one triple, and count complements.'
    }
  ]
};
