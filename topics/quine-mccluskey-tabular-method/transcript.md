# The Tabular Method: Quine–McCluskey, Prime Implicant Charts and Petrick's Method — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/quine-mccluskey-tabular-method/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Why a picture stops at four variables

*0:00 – 0:30 · objective: Count the cells a Karnaugh map needs at five and six variables, and accept that the tabular method is the same search written down instead of seen.*

**0:00–0:07** — A Karnaugh map is a picture with two to the n cells, one for each minterm. At four variables that is sixteen cells, and the picture is comfortable.

> Caption: A Karnaugh map is a picture of 2 to the n cells. At four variables that is sixteen.

Exam-trap caption mode adds: *Assuming a five-variable map is just a bigger four-variable map. It is two maps side by side, and the cells that are adjacent across the fold are the ones people miss.*

**0:07–0:15** — At five variables the map becomes two four-variable maps laid side by side, and the cells adjacent across the fold are easy to miss. At six variables it needs a third dimension, and eyes are not built for that.

> Caption: At five variables it is two maps folded together; at six it needs a third dimension.

Exam-trap caption mode adds: *Drawing a six-variable map as one flat grid with the wrong adjacency. Any flat drawing of it loses exactly the adjacencies the method depends on.*

**0:15–0:22** — The tabular method, published by Quine in 1952 and extended by McCluskey in 1956, performs the same search as the map. It writes the search down instead of drawing it, so nothing has to be seen.

> Caption: The tabular method is the same search written down, so it has no size limit.

Exam-trap caption mode adds: *Treating the tabular method as a slower duplicate of the map and skipping it. It is the method that answers the questions the map cannot draw.*

**0:22–0:30** — And because every step is a comparison of two strings rather than a judgement about a picture, the tabular method is deterministic. It is the method a program can run, and the reason it is the ancestor of every minimiser since.

> Caption: Because it is written, it is also the method a program can run.

Exam-trap caption mode adds: *Believing the table is exact because it is written. It is exact only if the combining passes run to a fixed point; stopping early silently loses a prime implicant.*

## Scene 2. The combining theorem and the dash

*0:30 – 1:00 · objective: Derive x·y + x·y′ = x, read a dash as the variable that combination removed, and prove that only groups whose one-counts differ by one can ever combine.*

**0:30–0:37** — The whole method rests on one identity. Two product terms that agree everywhere except in one variable are x times y and x times y-bar, and their sum is x. The variable that changed disappears.

> Caption: Two product terms that differ in one variable are x·y and x·y prime, which sum to x.

Exam-trap caption mode adds: *Combining two terms that differ in two variables. There is no identity for that, and the merged term would not be an implicant at all.*

**0:37–0:45** — So the merge is written as a dash in the position that differed. The minterms 0010 and 0110 agree in the first, third and fourth positions and differ in the second, so they merge to 0 dash 1 0, which reads as w-bar, y, z-bar.

> Caption: The dash records the variable the merge removed: 0010 with 0110 becomes 0-10.

Exam-trap caption mode adds: *Reading a dash as "either value, freely". A dash is bounded: it covers exactly the two to the k minterms obtained by filling the dashes with every combination, and no others.*

**0:45–0:52** — Two terms that differ in exactly one position have one-counts that differ by exactly one, because flipping one bit changes the count of ones by one. So the table sorts its terms into groups by the number of ones, and only neighbouring groups need to be compared.

> Caption: Only groups whose one-counts differ by one can combine, so the table sorts by that count.

Exam-trap caption mode adds: *Comparing only inside a group. Terms within one group have equal counts and cannot differ in one bit, so the pairs that matter are always in adjacent groups.*

**0:52–1:00** — In later rounds the terms already contain dashes, and two dashed terms may combine only if their dashes are in the same positions and they differ in exactly one of the remaining positions. Otherwise the difference is more than one variable and no identity applies.

> Caption: Dashes must line up: -110 with 011- differ in three places and never combine.

Exam-trap caption mode adds: *Merging two terms whose dashes are in different positions. The result would cover minterms outside the function, so it is not an implicant.*

## Scene 3. Round one: GATE CSE 2015 Set 3, Q43

*1:00 – 1:30 · objective: Write the six minterms of the 2015 function in binary, group them by their number of ones, and record all six first-round merges with a tick on every parent.*

**1:00–1:07** — GATE CSE 2015 Set 3, question 43 asks for the total number of prime implicants of the four-variable function whose minterms are 0, 2, 4, 5, 6 and 10. Six minterms, no don't-cares.

> Caption: The 2015 paper asks for the prime implicants of sigma m of 0, 2, 4, 5, 6, 10.

Exam-trap caption mode adds: *Answering with the number of minterms, or with the number of groups in the first column. Neither is the question.*

**1:07–1:15** — Write each minterm in four bits and sort by the number of ones. Minterm zero has no ones. Minterms two and four have one each. Minterms five, six and ten have two each.

> Caption: Written in binary and sorted by ones: one term with none, two with one, three with two.

Exam-trap caption mode adds: *Sorting by the minterm number instead of the one-count. The number order groups nothing useful; the one-count order is what makes the comparisons local.*

**1:15–1:22** — Compare group one with group two and group two with group three. All six minterms find a partner, which produces six merges and ticks every parent. No term survives the first round.

> Caption: Six merges in round one: every term finds a partner, so nothing survives yet.

Exam-trap caption mode adds: *Ticking only the term you compared from. Both parents are ticked, because both are contained in the larger term that the merge produced.*

**1:22–1:30** — The first round leaves six new terms, each with one dash: 00-0, 0-00, 0-10, minus-010, 010-minus and 01-0. The dashes are in different columns, which is what the next round has to respect.

> Caption: Round one leaves six dashed terms: 00-0, 0-00, 0-10, -010, 010- and 01-0.

Exam-trap caption mode adds: *Writing a child twice because two different pairs produced it. The set of terms in a column is a set; duplicates collapse.*

## Scene 4. Rounds two and three: until nothing combines

*1:30 – 2:00 · objective: Carry the passes to a fixed point on the 2015 function, count eight merges and three survivors, and match the published answer of three prime implicants.*

**1:30–1:37** — Round two compares the six dashed terms. Two pairs combine, and both pairs produce the same child, 0 dash dash 0, which is written once. Two terms find no partner and stand unticked.

> Caption: Round two: two pairs combine, both producing 0--0, and two terms stand unticked.

Exam-trap caption mode adds: *Assuming a term with a dash is automatically prime. A dash does not make a term maximal; only the absence of a partner does.*

**1:37–1:45** — Round three has a single term left, 0 dash dash 0. No pair anywhere can combine, so the passes stop. That empty round is the fixed point, and it is what makes the table exact rather than merely finished.

> Caption: Round three finds nothing: one term in, no pair combines, and the search stops.

Exam-trap caption mode adds: *Treating an empty round as wasted work and skipping it. It is the proof that no term can still grow, so without it the prime list is not certified.*

**1:45–1:52** — Count the work: six merges in round one, two in round two, none in round three, so eight merges in all. Three terms were never ticked, and those three are the prime implicants. The answer is 3.

> Caption: Eight merges, three survivors: the answer is 3, which is the published key.

Exam-trap caption mode adds: *Counting the terms in the largest column instead of the unticked ones. The count of primes is a count of survivors, not of rows.*

**1:52–2:00** — Read what each prime covers. 0 dash dash 0 covers four minterms, 0, 2, 4 and 6. Minus-010 covers three, 2, 6 and 10. 010-minus covers two, 4 and 5. The six minterms of the function are covered, and the counts add up with overlap.

> Caption: Three primes covering six minterms: two, three and one of them respectively.

Exam-trap caption mode adds: *Adding the cover sizes and expecting the minterm count. The sizes overlap, so the sum exceeds six, and that is not an error.*

## Scene 5. Prime means unticked, and nothing more

*2:00 – 2:30 · objective: Read a prime implicant off the table as an unticked entry, then verify the table against the definition by enumerating every cube — and separate "prime" from "useful".*

**2:00–2:07** — An implicant of a function is a product term that covers no minterm the function does not have. It is prime when no larger implicant contains it. That is a definition about containment, not about usefulness.

> Caption: A prime implicant is an implicant that no larger implicant contains.

Exam-trap caption mode adds: *Defining a prime implicant as "a big group". Size is evidence, not the definition: a large group that can still grow is not prime.*

**2:07–2:15** — The tick in the table is exactly the containment relation. A ticked term is contained in the term its merge produced, so it cannot be prime. An unticked term has no containing implicant, so it is.

> Caption: The table finds them by ticking. A ticked term is contained in its child, so it cannot be prime.

Exam-trap caption mode adds: *Discarding the ticked terms entirely. They are still implicants and still correct; they are only not prime, and a cover is built from primes.*

**2:15–2:22** — This page does not take the table's word for it. It enumerates all eighty-one possible cubes over four variables, keeps the implicants, and finds those that no other implicant contains. The set is exactly the three unticked terms.

> Caption: Checked against the definition: all eighty-one cubes enumerated, the maximal ones are the three.

Exam-trap caption mode adds: *Treating agreement between the table and the definition as redundant. They are independent procedures, and their agreement is the only reason to trust either on a larger function.*

**2:22–2:30** — Here is the separation that the rest of the lesson lives on. Being prime is a property of the term alone; being needed is a property of the term against the rest of the chart. A prime implicant can be perfectly maximal and still appear in no minimal expression.

> Caption: Prime is not the same as needed: a prime implicant can still be left out of every cover.

Exam-trap caption mode adds: *Answering "which prime implicants are in the minimal expression" with the full prime list. The chart decides the second question and it is a different question.*

## Scene 6. The prime implicant chart and the essential row

*2:30 – 3:00 · objective: Build the covering chart for the 2015 function, read an essential prime implicant off a column holding one cross, and count the literals of the resulting cover.*

**2:30–2:37** — Finding the primes is half the problem. The function has three primes and a minimal expression may not need all of them, so the second half is a covering problem. Set it out as a chart: a row per prime implicant, a column per minterm.

> Caption: The chart: one row per prime implicant, one column per minterm of the function.

Exam-trap caption mode adds: *Putting don't-care terms on the columns. They are excluded from the chart, and including them makes a useless row look necessary.*

**2:37–2:45** — Now read the columns. A column holding exactly one cross means that minterm has only one prime implicant able to cover it, so that prime must be in every cover. It is essential.

> Caption: A column holding one cross forces its row: minterm 0 is covered only by 0--0.

Exam-trap caption mode adds: *Looking for the essential row by looking for the widest row. Essentiality is read down a column, never across a row.*

**2:45–2:52** — Take the three essentials and delete the columns they cover. Every column goes, so nothing is left to choose and the cover is exactly the three primes. Count the literals: two plus three plus three is eight.

> Caption: All three are essential, they cover all six minterms, and the cover has eight literals.

Exam-trap caption mode adds: *Stopping at "all essentials" when columns remain. When a column is left over, essentials alone do not form a cover and a choice is still required.*

**2:52–3:00** — Two rules reduce a chart without any search. A row that covers everything another row covers is redundant, so the smaller row goes. A column that is crossed wherever another column is crossed is easier, so the harder column is kept and the easier one struck out.

> Caption: Two bookkeeping rules shrink a chart before any guessing: row and column dominance.

Exam-trap caption mode adds: *Deleting the dominating column instead of the dominated one. The column with fewer crosses is the harder constraint and must survive.*

## Scene 7. Don't-cares: in when you generate, out of the chart

*3:00 – 3:30 · objective: Run GATE CSE 2018 Q49, where five don't-cares are used to grow implicants but never appear as chart columns, and find the one prime implicant that covers only don't-cares.*

**3:00–3:07** — GATE CSE 2018, question 49 gives a four-variable function with six minterms and five don't-cares, and asks for the number of essential prime implicants. The don't-cares are 3, 8, 10, 12 and 14.

> Caption: GATE CSE 2018 Q49: six minterms and five don't-cares, and the question is essentials.

Exam-trap caption mode adds: *Ignoring the don't-cares while generating implicants. They exist precisely to let an implicant grow, and dropping them gives fewer and smaller primes.*

**3:07–3:15** — The placement rule is the one thing to memorise. A don't-care is included when the terms are listed, because it may let a prime grow. It is excluded from the chart, because no cover is obliged to include it.

> Caption: Don't-cares enter when the terms are listed and leave when the chart is drawn.

Exam-trap caption mode adds: *Listing only the minterms and still drawing a five-column chart. The two halves of the rule must both be applied, and they go in opposite directions.*

**3:15–3:22** — The passes produce six prime implicants. One of them, P S bar, covers minterms 8, 10, 12 and 14, and every one of those is a don't-care. Its row in the chart is empty, so no cover can ever select it.

> Caption: Six primes, and one of them covers only don't-cares, so its row is empty.

Exam-trap caption mode adds: *Selecting the empty row because it looks large. A row with no cross covers no required minterm, so adding it changes nothing and costs literals.*

**3:22–3:30** — Read the columns of required minterms. Minterm 0 is covered only by Q bar S bar, minterm 5 only by P bar Q S, and minterm 9 only by P Q bar. Three columns with a single cross, so three essential prime implicants, which is the published key.

> Caption: Three columns hold one cross — minterms 0, 5 and 9 — so the answer is 3.

Exam-trap caption mode adds: *Counting an essential because it is the only cover of a don't-care. A don't-care is never required, so it can never force a row.*

## Scene 8. The cyclic chart: six rows, no essential

*3:30 – 4:00 · objective: Meet Σm(0,1,2,5,6,7), whose six prime implicants each cover two minterms and whose every column holds exactly two crosses, so no essential exists and dominance cannot help.*

**3:30–3:37** — Now the case that breaks the easy procedure. Take the three-variable function whose minterms are 0, 1, 2, 5, 6 and 7. It has six prime implicants and each one covers exactly two minterms.

> Caption: Sigma m of 0, 1, 2, 5, 6, 7 over three variables: six primes, each of two minterms.

Exam-trap caption mode adds: *Looking for a quad and concluding the answer is wrong when none exists. Two zeroes can forbid every quad in a six-minterm function.*

**3:37–3:45** — Draw the chart. Six columns, and each of the six minterms lies in exactly two primes. No column holds a single cross, so there is no essential prime implicant at all.

> Caption: Every column holds exactly two crosses, so no column forces a row.

Exam-trap caption mode adds: *Assuming every function has at least one essential prime implicant. Cyclic functions have none, and answering "the essentials" then answers nothing.*

**3:45–3:52** — Dominance cannot help here. Every row covers two minterms and no row covers everything another covers, so no row dominates. Every column holds two crosses and no column is crossed wherever another is, so no column dominates.

> Caption: Dominance finds nothing either: every row covers two, every column holds two.

Exam-trap caption mode adds: *Forcing a reduction that is not there. Guessing at a dominance and deleting a row silently removes a solution.*

**3:52–4:00** — There are exactly two minimal covers, each of three prime implicants and six literals. They are equally good, and nothing in the algebra prefers one over the other.

> Caption: Two minimal covers exist and they tie at three primes and six literals.

Exam-trap caption mode adds: *Reporting one cover and calling it the answer. On a cyclic chart the minimum is a set of expressions, and a question may ask how many there are.*

## Scene 9. Petrick's method: one product, two answers

*4:00 – 4:30 · objective: Form one sum per column, multiply, absorb with X + XY = X, and read the two minimal covers of six literals each out of the expansion.*

**4:00–4:07** — Petrick's method turns the chart into an algebra problem. For each column write a sum of the rows that cover it, because the cover is valid only if at least one of them is selected. The cover is valid only if every column is satisfied, so multiply the sums.

> Caption: Petrick's method writes one sum per column: the rows that cover it, or-ed together.

Exam-trap caption mode adds: *Reading the product as a circuit expression. It is a statement about which rows are chosen, and its variables are decisions, not wires.*

**4:07–4:15** — Multiply the six sums out and simplify. The only rules needed are the ones already known: X plus X Y equals X absorbs any product containing another, X times X equals X collapses repeats, and X plus X equals X removes duplicates.

> Caption: Six sums multiplied out, then absorbed with X plus X Y equals X.

Exam-trap caption mode adds: *Expanding fully and then choosing by eye. The absorption step is what makes the list of candidates short enough to read.*

**4:15–4:22** — Five products survive the absorption. Two of them contain three prime implicants and the other three contain four. The minimum is therefore three, and there are exactly two ways to reach it.

> Caption: Five products survive, two of them with three terms, and those two are the minima.

Exam-trap caption mode adds: *Taking the first three-term product and stopping. There are two, and a question may ask for the number of minimal solutions rather than for one of them.*

**4:22–4:30** — Both answers were checked against all eight input combinations. Each evaluates to one exactly on the six minterms of the function and zero on minterms 3 and 4, which is the only test that matters.

> Caption: Both covers were checked against all eight inputs of the function.

Exam-trap caption mode adds: *Trusting the expansion without evaluating the result. A slip in the absorption produces a product that looks minimal and covers the wrong minterms.*

## Scene 10. The procedure, the cost, and the traps

*4:30 – 5:00 · objective: Fix the order of work, state where exact minimisation becomes expensive, and finish with the four errors that cost marks on this topic.*

**4:30–4:37** — Fix the order of work. List the terms and don't-cares in binary and group them by the number of ones. Combine in rounds until nothing combines. Collect the unticked entries. Draw the chart with minterm columns only. Take the essentials, reduce by dominance, then solve whatever core is left.

> Caption: The procedure: list, group, combine to a fixed point, chart, essentials, then choose.

Exam-trap caption mode adds: *Drawing the chart from the first round's terms. The chart must be built from the unticked survivors of the final round, not from an intermediate column.*

**4:37–4:45** — The cost is the reason exact minimisation stops. This page searches every four-variable function with eight minterms, and the worst one has eight prime implicants. The chart for it has eight rows, and the choices multiply from there.

> Caption: Eight primes on a four-variable function of eight minterms: the count is not small.

Exam-trap caption mode adds: *Assuming a small formula means a small table. Four variables and eight minterms is a small formula and already a substantial chart.*

**4:45–4:52** — Three traps. Putting don't-cares on the chart columns, which makes a useless row look forced. Merging two terms whose dashes are in different columns, which invents a term outside the function. And stopping the passes while a pair can still merge, which loses a prime.

> Caption: Three traps: don't-cares in the chart, a dash mismatch, and a cover stopped early.

Exam-trap caption mode adds: *Fixing a wrong prime list by adjusting the chart. The chart is downstream; if the primes are wrong, every later step is wrong with them.*

**4:52–5:00** — The sentence to keep: the tabular method is the Karnaugh map with the picture removed, so it works where the picture cannot be drawn, and the price of that is a covering problem that has to be solved rather than seen.

> Caption: The table is the map with the picture removed, and the chart is the price of exactness.

Exam-trap caption mode adds: *Treating the chart as the hard part and the table as the easy part. The table is mechanical; the chart is the part that needs a decision procedure.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
