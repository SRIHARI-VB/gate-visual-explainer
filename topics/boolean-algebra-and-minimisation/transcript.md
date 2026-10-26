# Boolean Algebra and Minimisation — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/boolean-algebra-and-minimisation/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A Boolean function is a column of a truth table

*0:00 – 0:30 · objective: Say precisely what a Boolean function is, why an expression is only a description of it, and what minimisation is trying to make smaller.*

**0:00–0:07** — A Boolean function takes n bits in and returns one bit out; its truth table has two to the n rows, and that table is the whole function.

> Caption: A Boolean function takes n bits in and returns one bit out; its truth table has two to the n rows, and that table is the whole function.

**0:07–0:15** — Three variables already give 256 different functions, because each of the eight rows can independently be a zero or a one.

> Caption: Three variables already give 256 different functions, because each of the eight rows can independently be a zero or a one.

**0:15–0:22** — A Boolean expression describes one column: variables, AND, OR and NOT, combined into a formula that is evaluated row by row.

> Caption: A Boolean expression describes one column: variables, AND, OR and NOT, combined into a formula that is evaluated row by row.

**0:22–0:30** — Minimisation means the same column described with fewer terms and fewer literals: fewer gates, less delay, less power.

> Caption: Minimisation means the same column described with fewer terms and fewer literals: fewer gates, less delay, less power.

## Scene 2. The identities, and the principle of duality

*0:30 – 1:00 · objective: Fix the identities that every minimisation uses, see that each is a statement about a truth table, and learn duality as the rule that halves the list you have to remember.*

**0:30–0:38** — Every identity is a claim about a truth table: both sides agree on every row. Nothing is proved by rearranging symbols alone.

> Caption: Every identity is a claim about a truth table: both sides agree on every row. Nothing is proved by rearranging symbols alone.

**0:38–0:45** — Duality: swap AND with OR and swap zero with one in a true identity, and the result is also true.

> Caption: Duality: swap AND with OR and swap zero with one in a true identity, and the result is also true.

**0:45–0:52** — x plus x is x, and x times x is x. There is no coefficient two here, and that is where ordinary algebra stops helping.

> Caption: x plus x is x, and x times x is x. There is no coefficient two here, and that is where ordinary algebra stops helping.

**0:52–1:00** — De Morgan: the complement of a product is the sum of the complements, and the complement of a sum is the product of the complements.

> Caption: De Morgan: the complement of a product is the sum of the complements, and the complement of a sum is the product of the complements.

Exam-trap caption mode adds: *De Morgan changes the operator as well as the variables. Writing the complement of x plus y as x-bar plus y-bar is the single most common slip in this topic; the correct form is a product.*

## Scene 3. Algebraic minimisation, and where it stops

*1:00 – 1:30 · objective: Use absorption and consensus on a real three-variable function, then see why algebraic manipulation cannot promise a minimum.*

**1:00–1:08** — Absorption: x plus x times y is x. A term that is contained in another term adds nothing.

> Caption: Absorption: x plus x times y is x. A term that is contained in another term adds nothing.

**1:08–1:15** — Consensus: x y plus x-prime z plus y z is x y plus x-prime z. The third term is already covered by the first two.

> Caption: Consensus: x y plus x-prime z plus y z is x y plus x-prime z. The third term is already covered by the first two.

**1:15–1:22** — Worked: f equals a-prime c plus a c-prime plus b-prime c has minterms one, three, four, five and six.

> Caption: Worked: f equals a-prime c plus a c-prime plus b-prime c has minterms one, three, four, five and six.

**1:22–1:30** — But algebra alone cannot promise a minimum: a different order of steps reaches a different expression, and nothing tells you which is smallest.

> Caption: But algebra alone cannot promise a minimum: a different order of steps reaches a different expression, and nothing tells you which is smallest.

Exam-trap caption mode adds: *An expression that no longer simplifies by the identities you know is not necessarily minimal. "I could not simplify it further" is not a proof of minimality.*

## Scene 4. Minterms, maxterms and the two canonical forms

*1:30 – 2:00 · objective: Build canonical sum-of-products from the rows that are one and canonical product-of-sums from the rows that are zero, and see why each is unique but not minimal.*

**1:30–1:38** — A minterm is one row written as a product: every variable appears once, plain where the row has a one and complemented where it has a zero.

> Caption: A minterm is one row written as a product: every variable appears once, plain where the row has a one and complemented where it has a zero.

Exam-trap caption mode adds: *The minterm number depends on the variable order. Writing f(a,b,c) and reading rows as c b a instead of a b c shifts every index. Fix the order first, then number.*

**1:38–1:45** — A maxterm is one row written as a sum, and maxterm i is the complement of minterm i.

> Caption: A maxterm is one row written as a sum, and maxterm i is the complement of minterm i.

**1:45–1:52** — Canonical sum of products ORs the minterms where the function is one; canonical product of sums ANDs the maxterms where it is zero.

> Caption: Canonical sum of products ORs the minterms where the function is one; canonical product of sums ANDs the maxterms where it is zero.

**1:52–2:00** — Both canonical forms always exist and both are unique, and neither is minimal: every term carries every variable.

> Caption: Both canonical forms always exist and both are unique, and neither is minimal: every term carries every variable.

## Scene 5. The map, and why its labels are in Gray code

*2:00 – 2:30 · objective: Read a Karnaugh map as a folded truth table, justify the 00 01 11 10 ordering by adjacency, and count the literals a block of size 2 to the k removes.*

**2:00–2:08** — The map is the truth table bent into a rectangle so that rows differing in one bit are placed next to each other.

> Caption: The map is the truth table bent into a rectangle so that rows differing in one bit are placed next to each other.

**2:08–2:15** — That is why the labels run 00, 01, 11, 10. Consecutive labels differ in one bit, which binary counting order would not give.

> Caption: That is why the labels run 00, 01, 11, 10. Consecutive labels differ in one bit, which binary counting order would not give.

Exam-trap caption mode adds: *Reading the map as a normal table, with rows in counting order, makes neighbouring cells look adjacent when they are not. The labels are Gray code, not binary counting.*

**2:15–2:22** — The edges wrap: the left column touches the right column, and the top row touches the bottom, because the map is a cylinder and then a torus.

> Caption: The edges wrap: the left column touches the right column, and the top row touches the bottom, because the map is a cylinder and then a torus.

**2:22–2:30** — A block of two to the k cells drops k variables, so a pair keeps n minus one literals and a quad keeps n minus two.

> Caption: A block of two to the k cells drops k variables, so a pair keeps n minus one literals and a quad keeps n minus two.

## Scene 6. Grouping rules and prime implicants

*2:30 – 3:00 · objective: Apply the five grouping rules and answer GATE 2015 Set 3 Q43 by counting prime implicants, distinguishing a prime implicant from a pair that sits inside a bigger block.*

**2:30–2:38** — The rules: cover every one, take the largest blocks first, overlapping is allowed, wrapping is allowed, and only one, two, four, eight or sixteen cells.

> Caption: The rules: cover every one, take the largest blocks first, overlapping is allowed, wrapping is allowed, and only one, two, four, eight or sixteen cells.

**2:38–2:45** — A prime implicant is a block that cannot be made larger. GATE 2015 Set 3 Q43 asks only for their number, for f equals sigma of zero, two, four, five, six, ten.

> Caption: A prime implicant is a block that cannot be made larger. GATE 2015 Set 3 Q43 asks only for their number, for f equals sigma of zero, two, four, five, six, ten.

Exam-trap caption mode adds: *Every prime implicant is a valid block, but not every valid block is prime. Counting all pairs and quads on the map overcounts; the definition requires maximality.*

**2:45–2:52** — There are three: the quad w-prime z-prime over zero, two, four and six; the pair w-prime x y-prime over four and five; the pair x-prime y z-prime over two and ten.

> Caption: There are three: the quad w-prime z-prime over zero, two, four and six; the pair w-prime x y-prime over four and five; the pair x-prime y z-prime over two and ten.

**2:52–3:00** — A pair sitting inside that quad, such as zero with two, is not prime, because a larger block already contains it.

> Caption: A pair sitting inside that quad, such as zero with two, is not prime, because a larger block already contains it.

## Scene 7. Don't-cares, and the 2018 essential prime implicants

*3:00 – 3:30 · objective: Use a don't-care as an optional one, then work GATE 2018 Q49: five prime implicants, three of them essential, and why a don't-care never makes one essential.*

**3:00–3:08** — A don't-care is a row the specification never uses. Its output may be zero or one, whichever helps the grouping.

> Caption: A don't-care is a row the specification never uses. Its output may be zero or one, whichever helps the grouping.

**3:08–3:15** — GATE 2018 Q49: F of P, Q, R, S is sigma m of zero, two, five, seven, nine, eleven, plus d of three, eight, ten, twelve, fourteen.

> Caption: GATE 2018 Q49: F of P, Q, R, S is sigma m of zero, two, five, seven, nine, eleven, plus d of three, eight, ten, twelve, fourteen.

**3:15–3:23** — Five prime implicants exist, and three of them cover a one that no other prime implicant covers: Q-prime S-prime, P-prime Q S, and P Q-prime.

> Caption: Five prime implicants exist, and three of them cover a one that no other prime implicant covers: Q-prime S-prime, P-prime Q S, and P Q-prime.

**3:23–3:30** — Essential means it covers a one that no other prime implicant covers. A don't-care can never make an implicant essential.

> Caption: Essential means it covers a one that no other prime implicant covers. A don't-care can never make an implicant essential.

Exam-trap caption mode adds: *A don't-care is not a reason to keep a term. Counting a don't-care as a row that must be covered is the error the 2018 question is built to catch.*

## Scene 8. Group the zeros: product of sums

*3:30 – 4:00 · objective: Minimise the complement and invert with De Morgan, working GATE 2017 Set 2 Q28 to option A and testing the other three options against a row of the function.*

**3:30–3:38** — For a product of sums, group the zeros instead. Each block of zeros becomes one sum term, with every literal flipped.

> Caption: For a product of sums, group the zeros instead. Each block of zeros becomes one sum term, with every literal flipped.

**3:38–3:45** — GATE 2017 Set 2 Q28: f is sigma m of zero, one, two, three, seven, eight, ten plus d of five, six, eleven, fifteen. The zeros are four, nine, twelve, thirteen, fourteen.

> Caption: GATE 2017 Set 2 Q28: f is sigma m of zero, one, two, three, seven, eight, ten plus d of five, six, eleven, fifteen. The zeros are four, nine, twelve, thirteen, fourteen.

**3:45–3:53** — Four, six, twelve and fourteen group to x z-bar; nine, eleven, thirteen and fifteen group to w z. So f-bar is x z-bar plus w z.

> Caption: Four, six, twelve and fourteen group to x z-bar; nine, eleven, thirteen and fifteen group to w z. So f-bar is x z-bar plus w z.

**3:53–4:00** — That is option A. The others fail on a row where f is one: w-bar plus z times x plus z is zero at minterm zero, for example.

> Caption: That is option A. The others fail on a row where f is one: w-bar plus z times x plus z is zero at minterm zero, for example.

Exam-trap caption mode adds: *A POS answer can be checked without expanding it: substitute the values of one row. One disagreement kills the option, and it takes seconds.*

## Scene 9. The tabular method: Quine and McCluskey

*4:00 – 4:30 · objective: Run the same search without a picture: dash notation, rounds of combining, the list of prime implicants, and the cover chart that finds essentials.*

**4:00–4:08** — The tabular method is the same search on paper, with no picture: write every minterm in binary and group them by the number of ones.

> Caption: The tabular method is the same search on paper, with no picture: write every minterm in binary and group them by the number of ones.

**4:08–4:15** — Combine any two terms that differ in exactly one bit and mark that bit with a dash. Repeat until nothing combines; what remains is the list of prime implicants.

> Caption: Combine any two terms that differ in exactly one bit and mark that bit with a dash. Repeat until nothing combines; what remains is the list of prime implicants.

**4:15–4:22** — For f equals sigma of zero, two, four, five, six, ten: the four minterms zero, two, four, six collapse to zero dash dash zero, and two pairs survive. Three prime implicants, the same three the map gave.

> Caption: For f equals sigma of zero, two, four, five, six, ten: the four minterms zero, two, four, six collapse to zero dash dash zero, and two pairs survive. Three prime implicants, the same three the map gave.

**4:22–4:30** — Then the cover chart: a minterm covered by a single prime implicant makes that implicant essential. When no column has a single cross, the map is cyclic and you must choose.

> Caption: Then the cover chart: a minterm covered by a single prime implicant makes that implicant essential. When no column has a single cross, the map is cyclic and you must choose.

Exam-trap caption mode adds: *A cyclic map has no essential prime implicant at all. Answering "the essentials" is then answering nothing; a cover must be chosen by comparing literal counts.*

## Scene 10. The procedure and four traps

*4:30 – 5:00 · objective: Fix the order of work, name the four errors that cost marks, and finish with the two-row check that catches them.*

**4:30–4:38** — Procedure: write the canonical form, draw the map or build the table, take the largest blocks, then check every one is covered and no zero is.

> Caption: Procedure: write the canonical form, draw the map or build the table, take the largest blocks, then check every one is covered and no zero is.

**4:38–4:45** — Trap one: a don't-care is not a one. Using one is optional, and a block may never contain a zero.

> Caption: Trap one: a don't-care is not a one. Using one is optional, and a block may never contain a zero.

**4:45–4:53** — Trap two: prime implicants are not the answer; a cover is. Trap three: fewest terms is not always fewest literals.

> Caption: Trap two: prime implicants are not the answer; a cover is. Trap three: fewest terms is not always fewest literals.

**4:53–5:00** — Trap four: grouping zeros gives a product of sums, and every literal flips. Check two rows by hand before you trust the answer.

> Caption: Trap four: grouping zeros gives a product of sums, and every literal flips. Check two rows by hand before you trust the answer.

Exam-trap caption mode adds: *Substituting into a POS expression is easy to get wrong: a sum term is zero only when every literal in it is zero. Take the terms one at a time.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
