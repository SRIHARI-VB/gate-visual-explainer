/* ==========================================================================
   boolean-algebra-and-minimisation — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs — never edited by hand.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'algebra',
      n: 1,
      title: 'A Boolean function is a column of a truth table',
      start: 0, end: 30,
      objective: 'Say precisely what a Boolean function is, why an expression is only a description of it, and what minimisation is trying to make smaller.'
    },
    {
      id: 'identities',
      n: 2,
      title: 'The identities, and the principle of duality',
      start: 30, end: 60,
      objective: 'Fix the identities that every minimisation uses, see that each is a statement about a truth table, and learn duality as the rule that halves the list you have to remember.'
    },
    {
      id: 'algebraicmin',
      n: 3,
      title: 'Algebraic minimisation, and where it stops',
      start: 60, end: 90,
      objective: 'Use absorption and consensus on a real three-variable function, then see why algebraic manipulation cannot promise a minimum.'
    },
    {
      id: 'canonical',
      n: 4,
      title: 'Minterms, maxterms and the two canonical forms',
      start: 90, end: 120,
      objective: 'Build canonical sum-of-products from the rows that are one and canonical product-of-sums from the rows that are zero, and see why each is unique but not minimal.'
    },
    {
      id: 'kmap',
      n: 5,
      title: 'The map, and why its labels are in Gray code',
      start: 120, end: 150,
      objective: 'Read a Karnaugh map as a folded truth table, justify the 00 01 11 10 ordering by adjacency, and count the literals a block of size 2 to the k removes.'
    },
    {
      id: 'grouping',
      n: 6,
      title: 'Grouping rules and prime implicants',
      start: 150, end: 180,
      objective: 'Apply the five grouping rules and answer GATE 2015 Set 3 Q43 by counting prime implicants, distinguishing a prime implicant from a pair that sits inside a bigger block.'
    },
    {
      id: 'dontcare',
      n: 7,
      title: "Don't-cares, and the 2018 essential prime implicants",
      start: 180, end: 210,
      objective: 'Use a don\'t-care as an optional one, then work GATE 2018 Q49: five prime implicants, three of them essential, and why a don\'t-care never makes one essential.'
    },
    {
      id: 'pos',
      n: 8,
      title: 'Group the zeros: product of sums',
      start: 210, end: 240,
      objective: 'Minimise the complement and invert with De Morgan, working GATE 2017 Set 2 Q28 to option A and testing the other three options against a row of the function.'
    },
    {
      id: 'tabular',
      n: 9,
      title: 'The tabular method: Quine and McCluskey',
      start: 240, end: 270,
      objective: 'Run the same search without a picture: dash notation, rounds of combining, the list of prime implicants, and the cover chart that finds essentials.'
    },
    {
      id: 'procedure',
      n: 10,
      title: 'The procedure and four traps',
      start: 270, end: 300,
      objective: 'Fix the order of work, name the four errors that cost marks, and finish with the two-row check that catches them.'
    }
  ],

  events: [
    /* ---------------- scene 1: algebra ---------------- */
    {
      id: 'al-1', start: 0, end: 7, scene: 'algebra',
      caption: 'A Boolean function takes n bits in and returns one bit out; its truth table has two to the n rows, and that table is the whole function.',
      detail: 'A Boolean variable is a quantity with exactly two possible values, written 0 and 1. A Boolean function of n variables is a rule that assigns to each of the two to the n assignments of the inputs one output bit. The table of that assignment is not a picture of the function, it is the function: two Boolean functions are equal exactly when their tables agree row by row.',
      keyword: 'two to the n rows',
      trap: null,
      narration: 'A Boolean function takes n bits in and returns one bit out; its truth table has two to the n rows, and that table is the whole function.'
    },
    {
      id: 'al-2', start: 7, end: 15, scene: 'algebra',
      caption: 'Three variables already give 256 different functions, because each of the eight rows can independently be a zero or a one.',
      detail: 'The output column of a table with eight rows can be filled in two to the eight, that is 256, ways. In general n variables give two to the two to the n functions. This is why an expression cannot be unique: 256 different descriptions exist for 256 different columns, and many descriptions exist for each column. The expression is a compression of the column, not the column itself.',
      keyword: '256 different functions',
      trap: null,
      narration: 'Three variables already give 256 different functions, because each of the eight rows can independently be a zero or a one.'
    },
    {
      id: 'al-3', start: 15, end: 22, scene: 'algebra',
      caption: 'A Boolean expression describes one column: variables, AND, OR and NOT, combined into a formula that is evaluated row by row.',
      detail: 'AND is written as a product, so x times y is 1 only when both are 1. OR is written as a sum, so x plus y is 1 when at least one is 1. NOT is written as a bar or a prime, and flips the value. A product of literals is called a product term; a sum of product terms is a sum of products, which is the form a two-level AND-OR circuit implements directly.',
      keyword: 'variables, AND, OR and NOT',
      trap: null,
      narration: 'A Boolean expression describes one column: variables, AND, OR and NOT, combined into a formula that is evaluated row by row.'
    },
    {
      id: 'al-4', start: 22, end: 30, scene: 'algebra',
      caption: 'Minimisation means the same column described with fewer terms and fewer literals: fewer gates, less delay, less power.',
      detail: 'A literal is one variable either plain or complemented, so x and x-prime are two literals. A term is one product or one sum. The cost of a two-level circuit is roughly the number of gates, which is the number of terms plus one, and the number of inputs to those gates, which is the number of literals. Minimisation is the search for the expression with the fewest of each among all expressions with the same truth table.',
      keyword: 'fewer terms and fewer literals',
      trap: null,
      narration: 'Minimisation means the same column described with fewer terms and fewer literals: fewer gates, less delay, less power.'
    },

    /* ---------------- scene 2: identities ---------------- */
    {
      id: 'id-1', start: 30, end: 38, scene: 'identities',
      caption: 'Every identity is a claim about a truth table: both sides agree on every row. Nothing is proved by rearranging symbols alone.',
      detail: 'The identities of Boolean algebra are not axioms you accept on faith; each is a statement that two expressions have the same column, and each can be checked by writing all the rows. The page checks every identity in this lesson exhaustively over its variables, and a check fails loudly if a single row disagrees.',
      keyword: 'both sides agree on every row',
      trap: null,
      narration: 'Every identity is a claim about a truth table: both sides agree on every row. Nothing is proved by rearranging symbols alone.'
    },
    {
      id: 'id-2', start: 38, end: 45, scene: 'identities',
      caption: 'Duality: swap AND with OR and swap zero with one in a true identity, and the result is also true.',
      detail: 'Take x plus x times y equals x, and dualise: x times, in brackets, x plus y, equals x. Both are true. Duality halves the list you must remember, and it is the reason the tables of identities are printed in pairs. It applies to identities only, not to an arbitrary expression you are trying to simplify: the dual of a function is a different function in general.',
      keyword: 'Duality',
      trap: null,
      narration: 'Duality: swap AND with OR and swap zero with one in a true identity, and the result is also true.'
    },
    {
      id: 'id-3', start: 45, end: 52, scene: 'identities',
      caption: 'x plus x is x, and x times x is x. There is no coefficient two here, and that is where ordinary algebra stops helping.',
      detail: 'Idempotence means a term repeated adds nothing. Together with x plus x-prime equals one and x times x-prime equals zero, it lets you delete duplicates and merge complementary pairs. It also means you cannot divide: there is no subtraction that undoes an OR, so an equation in Boolean algebra is solved by case analysis, not by moving terms across.',
      keyword: 'no coefficient two',
      trap: null,
      narration: 'x plus x is x, and x times x is x. There is no coefficient two here, and that is where ordinary algebra stops helping.'
    },
    {
      id: 'id-4', start: 52, end: 60, scene: 'identities',
      caption: "De Morgan: the complement of a product is the sum of the complements, and the complement of a sum is the product of the complements.",
      detail: 'The bar of x times y equals x-bar plus y-bar, and the bar of x plus y equals x-bar times y-bar. The rule generalises to any number of factors, and it is the step that converts a sum of products into a product of sums, which is why every POS answer in this lesson comes from minimising the complement and then applying it. A common error is to negate the variables and forget to change the operator.',
      keyword: 'De Morgan',
      trap: 'De Morgan changes the operator as well as the variables. Writing the complement of x plus y as x-bar plus y-bar is the single most common slip in this topic; the correct form is a product.',
      narration: 'De Morgan: the complement of a product is the sum of the complements, and the complement of a sum is the product of the complements.'
    },

    /* ---------------- scene 3: algebraicmin ---------------- */
    {
      id: 'am-1', start: 60, end: 68, scene: 'algebraicmin',
      caption: 'Absorption: x plus x times y is x. A term that is contained in another term adds nothing.',
      detail: 'The proof is one line: x plus x y equals x times, one plus y, equals x times one, equals x. The pattern to recognise is a term appearing both alone and inside a larger product, or a literal appearing both alone and inside a larger sum. Absorption deletes the larger term. It is the workhorse of hand simplification.',
      keyword: 'Absorption',
      trap: null,
      narration: 'Absorption: x plus x times y is x. A term that is contained in another term adds nothing.'
    },
    {
      id: 'am-2', start: 68, end: 75, scene: 'algebraicmin',
      caption: 'Consensus: x y plus x-prime z plus y z is x y plus x-prime z. The third term is already covered by the first two.',
      detail: 'Any assignment that makes y z true makes either x true or x false. If x is true, x y is true; if x is false, x-prime z is true. So the consensus term y z can never be the only reason the function is one, and it can be deleted. The reverse move, adding a consensus term, is also legal and occasionally useful. The page checks the identity over all eight rows.',
      keyword: 'Consensus',
      trap: null,
      narration: 'Consensus: x y plus x-prime z plus y z is x y plus x-prime z. The third term is already covered by the first two.'
    },
    {
      id: 'am-3', start: 75, end: 82, scene: 'algebraicmin',
      caption: 'Worked: f equals a-prime c plus a c-prime plus b-prime c has minterms one, three, four, five and six.',
      detail: 'a-prime c is one where a is zero and c is one, which is minterms one and three. a c-prime is one where a is one and c is zero, which is four and six. b-prime c is one where b is zero and c is one, which is one and five. The union is one, three, four, five, six. All four prime implicants of this function are a-prime c, a c-prime, b-prime c and a b-prime, and the first two are essential.',
      keyword: 'minterms one, three, four, five and six',
      trap: null,
      narration: 'Worked: f equals a-prime c plus a c-prime plus b-prime c has minterms one, three, four, five and six.'
    },
    {
      id: 'am-4', start: 82, end: 90, scene: 'algebraicmin',
      caption: 'But algebra alone cannot promise a minimum: a different order of steps reaches a different expression, and nothing tells you which is smallest.',
      detail: 'Algebraic simplification is a sequence of local rewrites. Each rewrite keeps the truth table, and each reduces some measure, but the sequence you happen to choose decides where you stop. Two students can both simplify correctly and end with different literal counts. A method that guarantees the minimum must search the space of implicants, and that is exactly what the map and the tabular method do.',
      keyword: 'cannot promise a minimum',
      trap: 'An expression that no longer simplifies by the identities you know is not necessarily minimal. "I could not simplify it further" is not a proof of minimality.',
      narration: 'But algebra alone cannot promise a minimum: a different order of steps reaches a different expression, and nothing tells you which is smallest.'
    },

    /* ---------------- scene 4: canonical ---------------- */
    {
      id: 'cn-1', start: 90, end: 98, scene: 'canonical',
      caption: 'A minterm is one row written as a product: every variable appears once, plain where the row has a one and complemented where it has a zero.',
      detail: 'For three variables, minterm five is the row a equals one, b equals zero, c equals one, so the product is a b-prime c. That product is one on that row and zero on the other seven. Minterms are numbered by reading the row as a binary number with the first variable as the most significant bit, which is why the numbering depends on the order the variables are written.',
      keyword: 'one row written as a product',
      trap: 'The minterm number depends on the variable order. Writing f(a,b,c) and reading rows as c b a instead of a b c shifts every index. Fix the order first, then number.',
      narration: 'A minterm is one row written as a product: every variable appears once, plain where the row has a one and complemented where it has a zero.'
    },
    {
      id: 'cn-2', start: 98, end: 105, scene: 'canonical',
      caption: 'A maxterm is one row written as a sum, and maxterm i is the complement of minterm i.',
      detail: 'Maxterm five for three variables is the sum a-prime plus b plus c-prime: it is zero exactly on row five and one everywhere else. Complementing a minterm flips every literal and swaps the product for a sum, which is De Morgan, so maxterm i equals the complement of minterm i. This is the whole content of the letter M against the letter m.',
      keyword: 'maxterm i is the complement of minterm i',
      trap: null,
      narration: 'A maxterm is one row written as a sum, and maxterm i is the complement of minterm i.'
    },
    {
      id: 'cn-3', start: 105, end: 112, scene: 'canonical',
      caption: 'Canonical sum of products ORs the minterms where the function is one; canonical product of sums ANDs the maxterms where it is zero.',
      detail: 'The first is a sum of the rows that are one, and it is one exactly on those rows. The second is a product of the rows that are zero, and it is zero exactly on those rows, hence one everywhere else. Sigma m lists the first set; Pi M lists the second. The two lists are complements of each other inside the set of all indices from zero to two to the n minus one.',
      keyword: 'the rows that are one',
      trap: null,
      narration: 'Canonical sum of products ORs the minterms where the function is one; canonical product of sums ANDs the maxterms where it is zero.'
    },
    {
      id: 'cn-4', start: 112, end: 120, scene: 'canonical',
      caption: 'Both canonical forms always exist and both are unique, and neither is minimal: every term carries every variable.',
      detail: 'Canonical sum of products has one term per one-row, and each term has n literals, so a function that is one on twelve of sixteen rows needs forty-eight literals. Minimisation is the step that shrinks that. Keep the canonical form as the starting point and as the specification to check against; deliver the minimal form as the answer.',
      keyword: 'neither is minimal',
      trap: null,
      narration: 'Both canonical forms always exist and both are unique, and neither is minimal: every term carries every variable.'
    },

    /* ---------------- scene 5: kmap ---------------- */
    {
      id: 'km-1', start: 120, end: 128, scene: 'kmap',
      caption: 'The map is the truth table bent into a rectangle so that rows differing in one bit are placed next to each other.',
      detail: 'Write the function into a grid whose rows carry some of the variables and whose columns carry the rest. Each cell is one row of the table. The point of the arrangement is physical adjacency: two cells that share an edge are two assignments that differ in exactly one variable, and such a pair can be merged into a single product with one literal fewer.',
      keyword: 'bent into a rectangle',
      trap: null,
      narration: 'The map is the truth table bent into a rectangle so that rows differing in one bit are placed next to each other.'
    },
    {
      id: 'km-2', start: 128, end: 135, scene: 'kmap',
      caption: 'That is why the labels run 00, 01, 11, 10. Consecutive labels differ in one bit, which binary counting order would not give.',
      detail: 'Counting 00, 01, 10, 11 would put 01 next to 10, and those two differ in both bits, so they cannot be merged. The Gray-code order 00, 01, 11, 10 changes exactly one bit at every step. The page checks this for the two-, three- and four-variable maps, including the wrap from the last label back to the first.',
      keyword: '00, 01, 11, 10',
      trap: 'Reading the map as a normal table, with rows in counting order, makes neighbouring cells look adjacent when they are not. The labels are Gray code, not binary counting.',
      narration: 'That is why the labels run 00, 01, 11, 10. Consecutive labels differ in one bit, which binary counting order would not give.'
    },
    {
      id: 'km-3', start: 135, end: 142, scene: 'kmap',
      caption: 'The edges wrap: the left column touches the right column, and the top row touches the bottom, because the map is a cylinder and then a torus.',
      detail: 'Four cells in the left column and four in the right column form a valid block of eight, because the pair of columns differs only in the variable that separates them. The same holds for the first and last rows. A student who does not wrap loses the largest block on the map, and with it the minimum.',
      keyword: 'The edges wrap',
      trap: null,
      narration: 'The edges wrap: the left column touches the right column, and the top row touches the bottom, because the map is a cylinder and then a torus.'
    },
    {
      id: 'km-4', start: 142, end: 150, scene: 'kmap',
      caption: 'A block of two to the k cells drops k variables, so a pair keeps n minus one literals and a quad keeps n minus two.',
      detail: 'A block of two cells is a pair, four is a quad, eight is an octet, and sixteen fills a four-variable map. Only powers of two are allowed, because only a set of cells that is a full sub-cube corresponds to a product term. The block must be a rectangle in the grid, including rectangles that wrap around an edge.',
      keyword: 'drops k variables',
      trap: null,
      narration: 'A block of two to the k cells drops k variables, so a pair keeps n minus one literals and a quad keeps n minus two.'
    },

    /* ---------------- scene 6: grouping ---------------- */
    {
      id: 'gr-1', start: 150, end: 158, scene: 'grouping',
      caption: 'The rules: cover every one, take the largest blocks first, overlapping is allowed, wrapping is allowed, and only one, two, four, eight or sixteen cells.',
      detail: 'Largest first, because a larger block removes more literals. Overlap is allowed, because a cell may belong to several blocks and each block is one term. Every one must be inside at least one block; a zero must be inside none. Cells holding a don\'t-care may be inside a block or left out, at your choice.',
      keyword: 'largest blocks first',
      trap: null,
      narration: 'The rules: cover every one, take the largest blocks first, overlapping is allowed, wrapping is allowed, and only one, two, four, eight or sixteen cells.'
    },
    {
      id: 'gr-2', start: 158, end: 165, scene: 'grouping',
      caption: 'A prime implicant is a block that cannot be made larger. GATE 2015 Set 3 Q43 asks only for their number, for f equals sigma of zero, two, four, five, six, ten.',
      detail: 'The question is a numerical answer type worth two marks, and its official key is three. The temptation is to count every pair you can draw, which gives a much larger number, or to count only the blocks you would choose for the answer, which is also wrong. A prime implicant is defined by maximality, not by usefulness.',
      keyword: 'cannot be made larger',
      trap: 'Every prime implicant is a valid block, but not every valid block is prime. Counting all pairs and quads on the map overcounts; the definition requires maximality.',
      narration: 'A prime implicant is a block that cannot be made larger. GATE 2015 Set 3 Q43 asks only for their number, for f equals sigma of zero, two, four, five, six, ten.'
    },
    {
      id: 'gr-3', start: 165, end: 172, scene: 'grouping',
      caption: 'There are three: the quad w-prime z-prime over zero, two, four and six; the pair w-prime x y-prime over four and five; the pair x-prime y z-prime over two and ten.',
      detail: 'Zero, two, four and six all have w equal to zero and z equal to zero, so they form a quad and the term is w-prime z-prime. Four and five differ only in z, so they form a pair with w zero, x one, y zero: w-prime x y-prime. Two and ten differ only in w, so they form a pair with x zero, y one, z zero: x-prime y z-prime. Nothing larger contains any of them, so all three are prime, and the answer is three.',
      keyword: 'the quad w-prime z-prime',
      trap: null,
      narration: 'There are three: the quad w-prime z-prime over zero, two, four and six; the pair w-prime x y-prime over four and five; the pair x-prime y z-prime over two and ten.'
    },
    {
      id: 'gr-4', start: 172, end: 180, scene: 'grouping',
      caption: 'A pair sitting inside that quad, such as zero with two, is not prime, because a larger block already contains it.',
      detail: 'This is the distinction the question is really testing. The pairs zero-two, zero-four, two-six and four-six all exist, and all four are contained in the quad, so none of them is a prime implicant. A useful self-check: a block is prime exactly when no block of twice its size contains it, which on a map you can see by eye.',
      keyword: 'is not prime',
      trap: null,
      narration: 'A pair sitting inside that quad, such as zero with two, is not prime, because a larger block already contains it.'
    },

    /* ---------------- scene 7: dontcare ---------------- */
    {
      id: 'dc-1', start: 180, end: 188, scene: 'dontcare',
      caption: "A don't-care is a row the specification never uses. Its output may be zero or one, whichever helps the grouping.",
      detail: 'Don\'t-cares come from inputs that cannot occur, such as a four-bit code that only uses ten of its sixteen patterns, or from outputs nobody reads. Because the row is never used, either value is correct behaviour, and the minimiser is free to pick. In the expression you write down, a don\'t-care that you covered is treated as a one; one that you ignored is treated as a zero.',
      keyword: "don't-care",
      trap: null,
      narration: "A don't-care is a row the specification never uses. Its output may be zero or one, whichever helps the grouping."
    },
    {
      id: 'dc-2', start: 188, end: 195, scene: 'dontcare',
      caption: 'GATE 2018 Q49: F of P, Q, R, S is sigma m of zero, two, five, seven, nine, eleven, plus d of three, eight, ten, twelve, fourteen.',
      detail: 'Six ones, five don\'t-cares, five zeros. The question asks for the number of essential prime implicants, not for the expression. That is a two-mark numerical question whose official key is three, and the reasoning is entirely about which ones can be covered in more than one way.',
      keyword: 'essential prime implicants',
      trap: null,
      narration: 'GATE 2018 Q49: F of P, Q, R, S is sigma m of zero, two, five, seven, nine, eleven, plus d of three, eight, ten, twelve, fourteen.'
    },
    {
      id: 'dc-3', start: 195, end: 203, scene: 'dontcare',
      caption: 'Five prime implicants exist, and three of them cover a one that no other prime implicant covers: Q-prime S-prime, P-prime Q S, and P Q-prime.',
      detail: 'Q-prime S-prime is the quad over zero, two, eight and ten, of which eight and ten are don\'t-cares. P-prime Q S is the pair over five and seven. P Q-prime is the pair over nine and eleven. The two remaining prime implicants are Q-prime R over two and eleven, and P-prime R S, which owns only the one at minterm seven and otherwise covers the don\'t-care at three. So there are five prime implicants and three essentials, and the answer is three.',
      keyword: 'three of them',
      trap: null,
      narration: 'Five prime implicants exist, and three of them cover a one that no other prime implicant covers: Q-prime S-prime, P-prime Q S, and P Q-prime.'
    },
    {
      id: 'dc-4', start: 203, end: 210, scene: 'dontcare',
      caption: "Essential means it covers a one that no other prime implicant covers. A don't-care can never make an implicant essential.",
      detail: 'This is the rule students get wrong. If a prime implicant covers only don\'t-cares that no other implicant covers, it is not essential, because those cells do not need covering at all. The test is always: does this prime implicant own a one? The page checks the property directly, by finding for every essential implicant a minterm of the function that it alone covers.',
      keyword: 'a one that no other prime implicant covers',
      trap: "A don't-care is not a reason to keep a term. Counting a don't-care as a row that must be covered is the error the 2018 question is built to catch.",
      narration: "Essential means it covers a one that no other prime implicant covers. A don't-care can never make an implicant essential."
    },

    /* ---------------- scene 8: pos ---------------- */
    {
      id: 'ps-1', start: 210, end: 218, scene: 'pos',
      caption: 'For a product of sums, group the zeros instead. Each block of zeros becomes one sum term, with every literal flipped.',
      detail: 'Group the zeros exactly as you would group the ones, taking the largest blocks and using don\'t-cares where they help. The blocks describe the complement of the function as a sum of products. Apply De Morgan to the whole expression: every product becomes a sum and every literal flips, which is the product of sums. A block of zeros over a quad gives a two-literal sum term.',
      keyword: 'group the zeros',
      trap: null,
      narration: 'For a product of sums, group the zeros instead. Each block of zeros becomes one sum term, with every literal flipped.'
    },
    {
      id: 'ps-2', start: 218, end: 225, scene: 'pos',
      caption: 'GATE 2017 Set 2 Q28: f is sigma m of zero, one, two, three, seven, eight, ten plus d of five, six, eleven, fifteen. The zeros are four, nine, twelve, thirteen, fourteen.',
      detail: 'Everything not listed as a one and not a don\'t-care is a zero: four, nine, twelve, thirteen and fourteen. Those five cells must be covered by the zero-blocks. The don\'t-cares at five, six, eleven and fifteen are available to enlarge a block, and a block that uses one is still a valid implicant of the complement.',
      keyword: 'The zeros are four, nine, twelve, thirteen, fourteen',
      trap: null,
      narration: 'GATE 2017 Set 2 Q28: f is sigma m of zero, one, two, three, seven, eight, ten plus d of five, six, eleven, fifteen. The zeros are four, nine, twelve, thirteen, fourteen.'
    },
    {
      id: 'ps-3', start: 225, end: 233, scene: 'pos',
      caption: 'Four, six, twelve and fourteen group to x z-bar; nine, eleven, thirteen and fifteen group to w z. So f-bar is x z-bar plus w z.',
      detail: 'The first block has x equal to one and z equal to zero, with w and y free, and it covers the zeros at four, twelve and fourteen plus the don\'t-care at six. The second has w equal to one and z equal to one, covering the zeros at nine and thirteen plus the don\'t-cares at eleven and fifteen. Inverting gives f equals the product of x-bar plus z and w-bar plus z-bar.',
      keyword: 'x z-bar plus w z',
      trap: null,
      narration: 'Four, six, twelve and fourteen group to x z-bar; nine, eleven, thirteen and fifteen group to w z. So f-bar is x z-bar plus w z.'
    },
    {
      id: 'ps-4', start: 233, end: 240, scene: 'pos',
      caption: 'That is option A. The others fail on a row where f is one: w-bar plus z times x plus z is zero at minterm zero, for example.',
      detail: 'Test an option by finding a single row where it disagrees with the specification. Option B is zero when w is one and z is zero, or when x is zero and z is zero; minterm zero has x and z both zero, and there f must be one. Option C is zero at minterm zero too, because w and z are both zero. Option D is zero at minterm one, where w is zero and z is one. Option A agrees on all eleven specified rows, so it is the answer.',
      keyword: 'option A',
      trap: 'A POS answer can be checked without expanding it: substitute the values of one row. One disagreement kills the option, and it takes seconds.',
      narration: 'That is option A. The others fail on a row where f is one: w-bar plus z times x plus z is zero at minterm zero, for example.'
    },

    /* ---------------- scene 9: tabular ---------------- */
    {
      id: 'tb-1', start: 240, end: 248, scene: 'tabular',
      caption: 'The tabular method is the same search on paper, with no picture: write every minterm in binary and group them by the number of ones.',
      detail: 'Quine and McCluskey published the procedure in 1955, and it is the reason a computer can minimise a function with twenty variables while a map cannot be drawn. Group the minterms by their number of ones, because two minterms that differ in exactly one bit differ by one in that count, so a combination can only be found between neighbouring groups.',
      keyword: 'group them by the number of ones',
      trap: null,
      narration: 'The tabular method is the same search on paper, with no picture: write every minterm in binary and group them by the number of ones.'
    },
    {
      id: 'tb-2', start: 248, end: 255, scene: 'tabular',
      caption: 'Combine any two terms that differ in exactly one bit and mark that bit with a dash. Repeat until nothing combines; what remains is the list of prime implicants.',
      detail: 'A term with a dash is a block of two; two dashes is a block of four. Terms combine only when their dash patterns are identical and their remaining bits differ in exactly one position. A term that was combined is ticked, and only unticked terms survive to the next round. When a round produces nothing new, the surviving terms are the prime implicants.',
      keyword: 'mark that bit with a dash',
      trap: null,
      narration: 'Combine any two terms that differ in exactly one bit and mark that bit with a dash. Repeat until nothing combines; what remains is the list of prime implicants.'
    },
    {
      id: 'tb-3', start: 255, end: 262, scene: 'tabular',
      caption: 'For f equals sigma of zero, two, four, five, six, ten: the four minterms zero, two, four, six collapse to zero dash dash zero, and two pairs survive. Three prime implicants, the same three the map gave.',
      detail: 'Zero, two, four and six combine in two rounds to the term with the middle two bits free, which is w-prime z-prime. Four and five combine to zero one zero dash, which is w-prime x y-prime. Two and ten combine to dash zero one zero, which is x-prime y z-prime. The map and the table must always agree, because both are searching for maximal sub-cubes; the page runs the tabular algorithm in code and compares with the map answer.',
      keyword: 'zero dash dash zero',
      trap: null,
      narration: 'For f equals sigma of zero, two, four, five, six, ten: the four minterms zero, two, four, six collapse to zero dash dash zero, and two pairs survive. Three prime implicants, the same three the map gave.'
    },
    {
      id: 'tb-4', start: 262, end: 270, scene: 'tabular',
      caption: 'Then the cover chart: a minterm covered by a single prime implicant makes that implicant essential. When no column has a single cross, the map is cyclic and you must choose.',
      detail: 'Write prime implicants down the side and minterms across the top, and cross every cell where the implicant covers the minterm. A column with one cross forces its row. Delete the covered minterms and the forced rows, and repeat. If you reach a stage where every remaining column has two or more crosses, the map is cyclic, no implicant is essential, and the minimum must be found by trying combinations, as the page does for the six-implicant example.',
      keyword: 'cover chart',
      trap: 'A cyclic map has no essential prime implicant at all. Answering "the essentials" is then answering nothing; a cover must be chosen by comparing literal counts.',
      narration: 'Then the cover chart: a minterm covered by a single prime implicant makes that implicant essential. When no column has a single cross, the map is cyclic and you must choose.'
    },

    /* ---------------- scene 10: procedure ---------------- */
    {
      id: 'pr-1', start: 270, end: 278, scene: 'procedure',
      caption: 'Procedure: write the canonical form, draw the map or build the table, take the largest blocks, then check every one is covered and no zero is.',
      detail: 'The canonical form is not busywork: it is the specification you will check the answer against, and writing it catches a misread variable order before it costs marks. Then minimise. Then verify by evaluating your answer on every row, which is what the page does for every expression it prints. Verification is the step that converts a plausible answer into a correct one.',
      keyword: 'write the canonical form',
      trap: null,
      narration: 'Procedure: write the canonical form, draw the map or build the table, take the largest blocks, then check every one is covered and no zero is.'
    },
    {
      id: 'pr-2', start: 278, end: 285, scene: 'procedure',
      caption: "Trap one: a don't-care is not a one. Using one is optional, and a block may never contain a zero.",
      detail: 'Two errors live here. Treating a don\'t-care as a row that must be covered adds a term that is not needed. Letting a block run over a zero is a plain mistake in reading the map, and it changes the function. A group of size four that includes one zero is not a block at all.',
      keyword: "a don't-care is not a one",
      trap: null,
      narration: "Trap one: a don't-care is not a one. Using one is optional, and a block may never contain a zero."
    },
    {
      id: 'pr-3', start: 285, end: 293, scene: 'procedure',
      caption: 'Trap two: prime implicants are not the answer; a cover is. Trap three: fewest terms is not always fewest literals.',
      detail: 'A question that asks for the minimal expression wants a set of prime implicants that covers every one, not the list of all prime implicants. And when two covers have the same number of terms, the tie is broken by literals, which is the real cost of the circuit. Read what the question is counting: terms, literals, gates, or prime implicants.',
      keyword: 'a cover',
      trap: null,
      narration: 'Trap two: prime implicants are not the answer; a cover is. Trap three: fewest terms is not always fewest literals.'
    },
    {
      id: 'pr-4', start: 293, end: 300, scene: 'procedure',
      caption: 'Trap four: grouping zeros gives a product of sums, and every literal flips. Check two rows by hand before you trust the answer.',
      detail: 'A product of sums written by copying the zero-blocks without inverting is the most common POS error. The check is mechanical: pick a row where the function must be one, substitute, and confirm the expression gives one; pick a row where it must be zero, and confirm zero. Two rows catch almost every slip, and the page runs the same test on all rows for every expression it shows.',
      keyword: 'every literal flips',
      trap: 'Substituting into a POS expression is easy to get wrong: a sum term is zero only when every literal in it is zero. Take the terms one at a time.',
      narration: 'Trap four: grouping zeros gives a product of sums, and every literal flips. Check two rows by hand before you trust the answer.'
    }
  ]
};
