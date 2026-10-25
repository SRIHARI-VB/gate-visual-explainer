/* ==========================================================================
   functions-and-their-properties — THE timeline.
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
      title: 'A function is a relation with two promises',
      start: 0, end: 30,
      objective: 'See a function from A to B as a relation on A times B that is total and single-valued, and count the functions among the relations.'
    },
    {
      id: 'parts',
      n: 2,
      title: 'Domain, codomain, range: three sets, not two',
      start: 30, end: 58,
      objective: 'Separate the codomain, which is declared, from the range, which is computed, and see that they differ exactly when the function is not onto.'
    },
    {
      id: 'injective',
      n: 3,
      title: 'Injective means no two elements share an image',
      start: 58, end: 90,
      objective: 'Test injectivity by looking for a colliding pair, read it off the matrix by columns, and see why m greater than n forces the count to zero.'
    },
    {
      id: 'surjective',
      n: 4,
      title: 'Surjective means every codomain element is hit',
      start: 90, end: 122,
      objective: 'Test surjectivity by hunting for an uncovered codomain element, and count onto functions by inclusion and exclusion.'
    },
    {
      id: 'bijection',
      n: 5,
      title: 'On equal finite sizes the three properties collapse',
      start: 122, end: 150,
      objective: 'See that for finite A and B of the same size, injective, surjective and bijective are the same condition, and that the collapse needs finiteness.'
    },
    {
      id: 'counting',
      n: 6,
      title: 'Four counts, and only one of them is a product',
      start: 150, end: 180,
      objective: 'Collect the counting formulas for functions, injections, surjections and bijections, and check every figure against enumeration.'
    },
    {
      id: 'composition',
      n: 7,
      title: 'Composition: what survives, and only in one direction',
      start: 180, end: 214,
      objective: 'Compose two functions, see that order matters, and learn which properties of the composite force which properties of the parts.'
    },
    {
      id: 'inverse',
      n: 8,
      title: 'The inverse function exists only for a bijection',
      start: 214, end: 240,
      objective: 'Distinguish the inverse function from the preimage of a set, and see why a function that is not injective has no inverse.'
    },
    {
      id: 'images',
      n: 9,
      title: 'Images and preimages behave differently',
      start: 240, end: 272,
      objective: 'Prove that images commute with union but only half-commute with intersection, while preimages commute with union, intersection and complement.'
    },
    {
      id: 'rules',
      n: 10,
      title: 'Four rules to carry into the exam',
      start: 272, end: 300,
      objective: 'Consolidate the tests and the traps into four rules that cover the function questions in the papers.'
    }
  ],

  events: [

    /* ---------------- scene 1: definition ---------------- */
    {
      id: 'df-1', start: 0, end: 7, scene: 'definition',
      caption: 'A relation from A to B is any set of arrows. A function is the special case where every element of A has exactly one arrow.',
      detail: 'Write A for the domain and B for the codomain. The product A times B has m times n ordered pairs, so a relation is any subset of those pairs and there are two to the m times n of them. A function keeps only those subsets in which every element of A appears exactly once as a first coordinate.',
      keyword: 'exactly one arrow',
      trap: null,
      narration: 'A relation from A to B is any set of arrows. A function is the special case where every element of A has exactly one arrow.'
    },
    {
      id: 'df-2', start: 7, end: 14, scene: 'definition',
      caption: 'With two elements in A and three in B there are six possible arrows, so 64 relations — and only 9 of them are functions.',
      detail: 'Each of the six pairs can be present or absent, which gives 2 to the 6, that is 64 relations. A function is fixed by choosing, independently, one of the three targets for each of the two domain elements, which gives 3 squared, that is 9. Both figures were counted here by enumerating all 64 subsets.',
      keyword: '64 relations',
      trap: null,
      narration: 'With two elements in A and three in B there are six possible arrows, so 64 relations, and only 9 of them are functions.'
    },
    {
      id: 'df-3', start: 14, end: 22, scene: 'definition',
      caption: 'Promise one: total. No element of the domain is left without an image.',
      detail: 'A relation may leave a first coordinate unused. A function may not. The left-hand pair of pictures shows one element with no arrow at all, which is enough to disqualify it.',
      keyword: 'total',
      trap: 'Every function is a relation, but almost no relation is a function. A question that says "let R be a relation" and later assumes R is a function has changed the subject.',
      narration: 'Promise one: total. No element of the domain is left without an image.'
    },
    {
      id: 'df-4', start: 22, end: 30, scene: 'definition',
      caption: 'Promise two: single-valued. No element of the domain gets two images. A relation missing either promise is not a function.',
      detail: 'Two arrows leaving the same element would mean the rule gives two answers to one input. Functions may still share an image between different inputs, which is why the single-valuedness is about the domain side only.',
      keyword: 'single-valued',
      trap: null,
      narration: 'Promise two: single-valued. No element of the domain gets two images. A relation missing either promise is not a function.'
    },

    /* ---------------- scene 2: parts ---------------- */
    {
      id: 'pt-1', start: 30, end: 38, scene: 'parts',
      caption: 'f from A to B. A is the domain, B is the codomain, and the set of values actually taken is the range.',
      detail: 'The domain is the set you may feed in. The codomain is the set you are told the outputs live in. The range, also called the image of the domain, is the subset of the codomain that is actually produced.',
      keyword: 'the range',
      trap: null,
      narration: 'f from A to B. A is the domain, B is the codomain, and the set of values actually taken is the range.'
    },
    {
      id: 'pt-2', start: 38, end: 46, scene: 'parts',
      caption: 'Here the range is a and c, smaller than the codomain a, b, c, d. The two are equal exactly when f is onto.',
      detail: 'Four domain elements map into two distinct values. The range therefore has two elements while the codomain has four, and the function is not onto. This is computed on screen by collecting the images of all four domain elements.',
      keyword: 'exactly when f is onto',
      trap: 'The codomain is not a fact you can read off the arrows. It is declared by the notation f : A to B, and two functions with identical arrows but different declared codomains are different functions.',
      narration: 'Here the range is a and c, smaller than the codomain a, b, c, d. The two are equal exactly when f is onto.'
    },
    {
      id: 'pt-3', start: 46, end: 52, scene: 'parts',
      caption: 'The codomain is a promise about where values are allowed to live; the range is a fact about where they landed.',
      detail: 'This is the whole content of the range-codomain distinction, and it is what decides surjectivity. A question asking whether a function is onto is asking whether the computed range fills the declared codomain.',
      keyword: 'a fact about where they landed',
      trap: null,
      narration: 'The codomain is a promise about where values are allowed to live; the range is a fact about where they landed.'
    },
    {
      id: 'pt-4', start: 52, end: 58, scene: 'parts',
      caption: 'Every element of the domain has an image, so the range is never empty when the domain is not.',
      detail: 'This follows from totality alone and needs no other property. It is the smallest fact worth stating about the range, and it is the one that fails for the empty relation that is not a function.',
      keyword: 'never empty',
      trap: null,
      narration: 'Every element of the domain has an image, so the range is never empty when the domain is not.'
    },

    /* ---------------- scene 3: injective ---------------- */
    {
      id: 'in-1', start: 58, end: 66, scene: 'injective',
      caption: 'Injective, or one-to-one, means no two different elements of the domain share an image.',
      detail: 'In symbols: f(a) equals f(b) forces a equals b. The property is about collisions between different inputs, and it says nothing about whether every codomain element is reached.',
      keyword: 'share an image',
      trap: 'One-to-one in GATE means injective. A one-to-one correspondence means bijective. The two phrases are not interchangeable, and the papers use both.',
      narration: 'Injective, or one-to-one, means no two different elements of the domain share an image.'
    },
    {
      id: 'in-2', start: 66, end: 74, scene: 'injective',
      caption: 'Read the matrix down each column: at most one 1 per column. Here column a has two, so f is not injective.',
      detail: 'The matrix has a row per domain element and a column per codomain element, with a 1 where the arrow goes. Two 1s in one column is exactly a colliding pair. Reading by columns tests injectivity; reading by rows would test only that the relation is a function.',
      keyword: 'at most one 1 per column',
      trap: null,
      narration: 'Read the matrix down each column: at most one 1 per column. Here column a has two, so f is not injective.'
    },
    {
      id: 'in-3', start: 74, end: 82, scene: 'injective',
      caption: 'The witness is a pair: f(1) equals f(2) equals a with 1 different from 2. One colliding pair is enough.',
      detail: 'Injectivity is a universal statement, so its negation is existential. You do not need to survey every pair to refute it; you need one pair. The screen shows the pair the page found by search.',
      keyword: 'one colliding pair',
      trap: null,
      narration: 'The witness is a pair: f of 1 equals f of 2 equals a with 1 different from 2. One colliding pair is enough.'
    },
    {
      id: 'in-4', start: 82, end: 90, scene: 'injective',
      caption: 'Consequence: an injection needs at least as many elements in B as in A. If m exceeds n, the number of injections is zero.',
      detail: 'This is the pigeonhole principle: m distinct images are needed for m distinct inputs, and B has only n elements. The count n falling m, which is n factorial over n minus m factorial, becomes zero by convention as soon as m exceeds n, and the page confirms it by enumeration.',
      keyword: 'zero',
      trap: 'The pigeonhole bound is about the sizes of the two sets, not about the arrows you happen to draw. No amount of cleverness produces an injection from a larger set into a smaller one.',
      narration: 'Consequence: an injection needs at least as many elements in B as in A. If m exceeds n, the number of injections is zero.'
    },

    /* ---------------- scene 4: surjective ---------------- */
    {
      id: 'su-1', start: 90, end: 98, scene: 'surjective',
      caption: 'Surjective, or onto, means every element of the codomain is hit at least once.',
      detail: 'In symbols: for every b in B there is some a in A with f(a) equals b. Equivalently the range equals the codomain. Surjectivity is about coverage of B, and it says nothing about collisions.',
      keyword: 'hit at least once',
      trap: null,
      narration: 'Surjective, or onto, means every element of the codomain is hit at least once.'
    },
    {
      id: 'su-2', start: 98, end: 106, scene: 'surjective',
      caption: 'Read the matrix down each column again: at least one 1 per column. Here column c is empty, so f is not onto.',
      detail: 'The same matrix answers both questions, read the same way. Injectivity asks for at most one 1 per column, surjectivity asks for at least one, and bijectivity asks for exactly one. An empty column is the witness against surjectivity.',
      keyword: 'at least one 1 per column',
      trap: null,
      narration: 'Read the matrix down each column again: at least one 1 per column. Here column c is empty, so f is not onto.'
    },
    {
      id: 'su-3', start: 106, end: 114, scene: 'surjective',
      caption: 'Consequence: an onto function needs at least as many domain elements as codomain elements.',
      detail: 'Each codomain element consumes at least one distinct domain element, so m is at least n. When m is smaller than n the number of onto functions is zero, and the inclusion-exclusion formula gives zero, which the page checks.',
      keyword: 'at least as many domain elements',
      trap: null,
      narration: 'Consequence: an onto function needs at least as many domain elements as codomain elements.'
    },
    {
      id: 'su-4', start: 114, end: 122, scene: 'surjective',
      caption: 'Counting onto functions needs inclusion and exclusion: 3 to the 4 minus 3 times 2 to the 4 plus 3 times 1 to the 4, which is 81 minus 48 plus 3, that is 36.',
      detail: 'Start with all 81 functions, subtract those that miss one named codomain element, add back those that miss two, and so on by the principle of inclusion and exclusion. The general formula is the sum over k of minus one to the k, times C of n comma k, times n minus k to the m.',
      keyword: '36',
      trap: 'Subtracting only the three functions that miss one element each gives 81 minus 48 equals 33, which is wrong. The add-back term is not optional.',
      narration: 'Counting onto functions needs inclusion and exclusion: three to the four minus three times two to the four plus three times one to the four, which is 81 minus 48 plus 3, that is 36.'
    },

    /* ---------------- scene 5: bijection ---------------- */
    {
      id: 'bi-1', start: 122, end: 130, scene: 'bijection',
      caption: 'Bijective means injective and surjective at once: every codomain element is hit exactly once.',
      detail: 'A bijection pairs the two sets off perfectly. On a finite set it is the same thing as a permutation of the elements, and there are n factorial of them.',
      keyword: 'exactly once',
      trap: null,
      narration: 'Bijective means injective and surjective at once: every codomain element is hit exactly once.'
    },
    {
      id: 'bi-2', start: 130, end: 138, scene: 'bijection',
      caption: 'On finite sets of the same size the three properties collapse: injective, surjective and bijective are the same condition.',
      detail: 'If the two sets both have n elements, m distinct images already fill B, and n distinct inputs already exhaust A. Each of the two weaker properties therefore forces the other. The page tests this on every function between two three-element sets.',
      keyword: 'the same condition',
      trap: 'The collapse is a theorem about finite sets of equal size. It is not a definition, and it does not hold when the sizes differ or when the sets are infinite.',
      narration: 'On finite sets of the same size the three properties collapse: injective, surjective and bijective are the same condition.'
    },
    {
      id: 'bi-3', start: 138, end: 144, scene: 'bijection',
      caption: 'Of the 27 functions from a three-element set to itself, 6 are injective, 6 are surjective, and they are the same 6.',
      detail: 'All 27 functions were enumerated here. The 6 bijections are exactly the permutations of the three elements, which is 3 factorial. The injective list and the surjective list coincide element by element, not merely in size.',
      keyword: 'the same 6',
      trap: null,
      narration: 'Of the 27 functions from a three-element set to itself, 6 are injective, 6 are surjective, and they are the same 6.'
    },
    {
      id: 'bi-4', start: 144, end: 150, scene: 'bijection',
      caption: 'The collapse needs finiteness. On the natural numbers, n maps to n plus 1 is injective and not surjective.',
      detail: 'The successor function on the natural numbers never repeats a value, so it is injective, and it never produces zero, so it is not surjective. A bijection between a set and a proper part of itself is the defining oddity of infinite sets.',
      keyword: 'needs finiteness',
      trap: 'A question that concludes "injective therefore surjective" without the equal-size hypothesis is invalid. It is the single most common error in this topic.',
      narration: 'The collapse needs finiteness. On the natural numbers, n maps to n plus 1 is injective and not surjective.'
    },

    /* ---------------- scene 6: counting ---------------- */
    {
      id: 'co-1', start: 150, end: 158, scene: 'counting',
      caption: 'Four counts, one per row: all functions, injections, surjections, bijections.',
      detail: 'Every question of the form "how many functions with property P" reduces to one of these four rows, with m and n substituted. Getting the row right is most of the work.',
      keyword: 'one per row',
      trap: null,
      narration: 'Four counts, one per row: all functions, injections, surjections, bijections.'
    },
    {
      id: 'co-2', start: 158, end: 166, scene: 'counting',
      caption: 'All functions: n to the m, because each of the m domain elements picks one of n targets independently.',
      detail: 'This is the product rule applied m times. With m equal to 4 and n equal to 3 the count is 81; with both equal to 3 it is 27. Note the exponent is the size of the domain, not of the codomain.',
      keyword: 'n to the m',
      trap: 'm to the n and n to the m are different numbers and different questions. The exponent is always the number of things that make a free choice, which here is the domain.',
      narration: 'All functions: n to the m, because each of the m domain elements picks one of n targets independently.'
    },
    {
      id: 'co-3', start: 166, end: 173, scene: 'counting',
      caption: 'Injections: n falling m, that is n factorial over n minus m factorial, and zero as soon as m exceeds n. Bijections: n factorial when m equals n.',
      detail: 'For an injection the first domain element has n choices, the second has n minus 1, and so on down to n minus m plus 1. When m equals n every injection is a bijection, and the falling factorial becomes n factorial.',
      keyword: 'n falling m',
      trap: null,
      narration: 'Injections: n falling m, that is n factorial over n minus m factorial, and zero as soon as m exceeds n. Bijections: n factorial when m equals n.'
    },
    {
      id: 'co-4', start: 173, end: 180, scene: 'counting',
      caption: 'Surjections have no product formula. Inclusion and exclusion is the method, and this page checks every figure by enumeration.',
      detail: 'The formula is a sum with alternating signs, so it is a computation rather than a product of choices. Every number in the two right-hand columns of the table was produced by listing all n to the m functions and testing them.',
      keyword: 'no product formula',
      trap: 'A common wrong answer multiplies n factorial by C of m comma n, which counts onto functions only when m equals n. For m equal to 4 and n equal to 3 that method gives 18 against the correct 36.',
      narration: 'Surjections have no product formula. Inclusion and exclusion is the method, and this page checks every figure by enumeration.'
    },

    /* ---------------- scene 7: composition ---------------- */
    {
      id: 'cp-1', start: 180, end: 188, scene: 'composition',
      caption: 'Compose g from A to B with f from B to C. The composite f after g sends a to f of g of a, and the order matters.',
      detail: 'The inner function is applied first. For the composite to be defined the codomain of g must be the domain of f, or at least sit inside it. Composition is associative but not commutative.',
      keyword: 'the order matters',
      trap: null,
      narration: 'Compose g from A to B with f from B to C. The composite f after g sends a to f of g of a, and the order matters.'
    },
    {
      id: 'cp-2', start: 188, end: 196, scene: 'composition',
      caption: 'Injective after injective is injective, and surjective after surjective is surjective.',
      detail: 'If both parts never collide, the composite never collides: g(a1) equals g(a2) forces a1 equals a2 by injectivity of g, and f of two distinct values differs by injectivity of f. The same two-step argument works for coverage. Both were checked on all pairs of functions of a three-element set here.',
      keyword: 'is injective',
      trap: null,
      narration: 'Injective after injective is injective, and surjective after surjective is surjective.'
    },
    {
      id: 'cp-3', start: 196, end: 204, scene: 'composition',
      caption: 'Only one direction survives. If the composite is injective then the inner function g is injective, but the outer function f need not be.',
      detail: 'The composite cannot distinguish two inputs that g already merged, so g must be injective. The outer function is only ever evaluated on the range of g, so it may collide freely outside that range. The page exhibits such a pair.',
      keyword: 'g is injective',
      trap: 'The tempting wrong claim is that the composite being injective makes both parts injective. Only the inner one is forced.',
      narration: 'Only one direction survives. If the composite is injective then the inner function g is injective, but the outer function f need not be.'
    },
    {
      id: 'cp-4', start: 204, end: 214, scene: 'composition',
      caption: 'If the composite is onto then the outer function f is onto, but the inner function g need not be, even when f is also onto. That is the shape of the GATE 2025 question.',
      detail: 'Every value the composite reaches is reached through f, so f must cover C. Nothing forces g to cover B, because f can collapse the missing elements of B onto values that are already reached. The page shows the three-element counterexample and confirms the claim on all pairs.',
      keyword: 'g need not be',
      trap: 'The false step is assuming that the composite being onto, together with f being onto, forces g to be onto. It does not; a single-element C refutes it.',
      narration: 'If the composite is onto then the outer function f is onto, but the inner function g need not be, even when f is also onto.'
    },

    /* ---------------- scene 8: inverse ---------------- */
    {
      id: 'iv-1', start: 214, end: 222, scene: 'inverse',
      caption: 'An inverse function exists exactly when f is bijective. Then f inverse after f is the identity on A, and f after f inverse is the identity on B.',
      detail: 'Injectivity is what lets you recover the input from the output, so the reverse rule is single-valued. Surjectivity is what guarantees the reverse rule is defined everywhere on B. Both are needed, so bijectivity is exactly the condition.',
      keyword: 'exactly when f is bijective',
      trap: null,
      narration: 'An inverse function exists exactly when f is bijective. Then f inverse after f is the identity on A, and f after f inverse is the identity on B.'
    },
    {
      id: 'iv-2', start: 222, end: 230, scene: 'inverse',
      caption: 'The preimage of a set is always defined, bijection or not. The inverse function is the stricter object.',
      detail: 'The preimage of a subset T of B is the set of domain elements whose image lies in T. It exists for every function and is always a set. The inverse function is a rule from B back to A, and it needs bijectivity to be a function at all.',
      keyword: 'the stricter object',
      trap: 'Writing f inverse of y as though it were always an element is the trap. For a function that is not injective the preimage of y may hold several elements, or none.',
      narration: 'The preimage of a set is always defined, bijection or not. The inverse function is the stricter object.'
    },
    {
      id: 'iv-3', start: 230, end: 240, scene: 'inverse',
      caption: 'Squaring on the reals is not injective, so it has no inverse on the reals. Restricted to the non-negative reals it becomes a bijection and gains one.',
      detail: 'Both 2 and minus 2 square to 4, so the reverse rule would have to send 4 to two places. Cutting the domain to the non-negative reals removes one of the two preimages and leaves a bijection onto the non-negative reals, whose inverse is the square root. The lesson here is that the domain is part of the function.',
      keyword: 'restricted to the non-negative reals',
      trap: null,
      narration: 'Squaring on the reals is not injective, so it has no inverse on the reals. Restricted to the non-negative reals it becomes a bijection and gains one.'
    },

    /* ---------------- scene 9: images ---------------- */
    {
      id: 'im-1', start: 240, end: 248, scene: 'images',
      caption: 'For subsets S and T of the domain, the image of the union is the union of the images. Always.',
      detail: 'An element of f of S union T comes from some element in S or in T, so it lies in f of S or in f of T, and conversely. No property of the function is used, which is why this holds for every function. Checked here on all 64 pairs of subsets of a three-element domain.',
      keyword: 'the union of the images',
      trap: null,
      narration: 'For subsets S and T of the domain, the image of the union is the union of the images. Always.'
    },
    {
      id: 'im-2', start: 248, end: 256, scene: 'images',
      caption: 'For intersections only one inclusion survives: the image of the intersection sits inside the intersection of the images.',
      detail: 'An element of f of S intersect T comes from an element in both S and T, so it is in both images. The converse can fail, because the two images may share a value that no single element of the intersection produces.',
      keyword: 'only one inclusion',
      trap: 'Writing f of S intersect T equals f of S intersect f of T is the classic error. It is true for preimages and false for images.',
      narration: 'For intersections only one inclusion survives: the image of the intersection sits inside the intersection of the images.'
    },
    {
      id: 'im-3', start: 256, end: 264, scene: 'images',
      caption: 'Here 1 and 3 both map to p, so the image of the intersection is the single element q while the intersection of the images is p and q. Equality holds exactly when f is injective.',
      detail: 'Take S equal to 1 and 3, T equal to 2 and 3, with f of 1 and f of 2 both p and f of 3 equal q. Then the intersection of S and T is 3, whose image is q, while both images are p and q, whose intersection is p and q. The page checks that equality holds for a function exactly when it is injective.',
      keyword: 'exactly when f is injective',
      trap: null,
      narration: 'Here 1 and 3 both map to p, so the image of the intersection is q while the intersection of the images is p and q. Equality holds exactly when f is injective.'
    },
    {
      id: 'im-4', start: 264, end: 272, scene: 'images',
      caption: 'Preimages are better behaved: the preimage of an intersection is the intersection of the preimages, for every function. That is GATE 2014 Set 3.',
      detail: 'An element is in the preimage of S intersect T exactly when its image is in both S and T, which is exactly when it is in both preimages. The same argument works for union and for complement, so all three operations pull back exactly. The page verifies all three on every function between three-element sets.',
      keyword: 'for every function',
      trap: null,
      narration: 'Preimages are better behaved: the preimage of an intersection is the intersection of the preimages, for every function.'
    },

    /* ---------------- scene 10: rules ---------------- */
    {
      id: 'ru-1', start: 272, end: 280, scene: 'rules',
      caption: 'One: total and single-valued. Check the domain first, because a relation that misses an element is not a function.',
      detail: 'Before any property question, confirm the object is a function at all. A rule that leaves an input undefined, or gives an input two outputs, has to be repaired by restricting the domain before injectivity or surjectivity can even be asked.',
      keyword: 'total and single-valued',
      trap: null,
      narration: 'Rule one: total and single-valued. Check the domain first, because a relation that misses an element is not a function.'
    },
    {
      id: 'ru-2', start: 280, end: 288, scene: 'rules',
      caption: 'Two: read the matrix by columns. Two ones in a column kills injectivity, and an empty column kills surjectivity.',
      detail: 'Draw the m by n matrix of the function for small sets. Both properties become a scan down the columns, and the witness for either failure is visible in the picture rather than needing to be found by argument.',
      keyword: 'by columns',
      trap: null,
      narration: 'Rule two: read the matrix by columns. Two ones in a column kills injectivity, and an empty column kills surjectivity.'
    },
    {
      id: 'ru-3', start: 288, end: 294, scene: 'rules',
      caption: 'Three: on finite sets of equal size, injective, surjective and bijective are one property. Without that hypothesis they are three.',
      detail: 'The collapse needs both finiteness and equal size. Every counterexample in this topic comes from dropping one of the two: the successor function drops finiteness, and a function between sets of different sizes drops the equal size.',
      keyword: 'one property',
      trap: 'Concluding surjective from injective on sets of different sizes is wrong in one direction and impossible in the other. Always state the two sizes before using the collapse.',
      narration: 'Rule three: on finite sets of equal size, injective, surjective and bijective are one property. Without that hypothesis they are three.'
    },
    {
      id: 'ru-4', start: 294, end: 300, scene: 'rules',
      caption: 'Four: images commute with union only, while preimages commute with union, intersection and complement.',
      detail: 'This single asymmetry answers a whole family of questions. When an option claims an equality for images under intersection, it is false unless injectivity is also given; when it claims one for preimages, it is true without any hypothesis.',
      keyword: 'images commute with union only',
      trap: null,
      narration: 'Rule four: images commute with union only, while preimages commute with union, intersection and complement.'
    }
  ]
};
