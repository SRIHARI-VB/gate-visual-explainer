/* ==========================================================================
   quine-mccluskey-tabular-method — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   captions.vtt, captions.srt and transcript.md are generated from this file by
   tools/gen-captions.mjs and must never be edited by hand.

   Every number quoted below is computed by the model in lesson.js and printed
   on the canvas, so the caption and the picture cannot drift apart.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'why', n: 1,
      title: 'Why a picture stops at four variables',
      start: 0, end: 30,
      objective: 'Count the cells a Karnaugh map needs at five and six variables, and accept that the tabular method is the same search written down instead of seen.'
    },
    {
      id: 'theorem', n: 2,
      title: 'The combining theorem and the dash',
      start: 30, end: 60,
      objective: 'Derive x·y + x·y′ = x, read a dash as the variable that combination removed, and prove that only groups whose one-counts differ by one can ever combine.'
    },
    {
      id: 'pass1', n: 3,
      title: 'Round one: GATE CSE 2015 Set 3, Q43',
      start: 60, end: 90,
      objective: 'Write the six minterms of the 2015 function in binary, group them by their number of ones, and record all six first-round merges with a tick on every parent.'
    },
    {
      id: 'rounds', n: 4,
      title: 'Rounds two and three: until nothing combines',
      start: 90, end: 120,
      objective: 'Carry the passes to a fixed point on the 2015 function, count eight merges and three survivors, and match the published answer of three prime implicants.'
    },
    {
      id: 'prime', n: 5,
      title: 'Prime means unticked, and nothing more',
      start: 120, end: 150,
      objective: 'Read a prime implicant off the table as an unticked entry, then verify the table against the definition by enumerating every cube — and separate "prime" from "useful".'
    },
    {
      id: 'chart', n: 6,
      title: 'The prime implicant chart and the essential row',
      start: 150, end: 180,
      objective: 'Build the covering chart for the 2015 function, read an essential prime implicant off a column holding one cross, and count the literals of the resulting cover.'
    },
    {
      id: 'dc', n: 7,
      title: "Don't-cares: in when you generate, out of the chart",
      start: 180, end: 210,
      objective: 'Run GATE CSE 2018 Q49, where five don\'t-cares are used to grow implicants but never appear as chart columns, and find the one prime implicant that covers only don\'t-cares.'
    },
    {
      id: 'cyclic', n: 8,
      title: 'The cyclic chart: six rows, no essential',
      start: 210, end: 240,
      objective: 'Meet Σm(0,1,2,5,6,7), whose six prime implicants each cover two minterms and whose every column holds exactly two crosses, so no essential exists and dominance cannot help.'
    },
    {
      id: 'petrick', n: 9,
      title: "Petrick's method: one product, two answers",
      start: 240, end: 270,
      objective: "Form one sum per column, multiply, absorb with X + XY = X, and read the two minimal covers of six literals each out of the expansion."
    },
    {
      id: 'cost', n: 10,
      title: 'The procedure, the cost, and the traps',
      start: 270, end: 300,
      objective: 'Fix the order of work, state where exact minimisation becomes expensive, and finish with the four errors that cost marks on this topic.'
    }
  ],

  events: [
    /* ---------- scene 1: why ---------- */
    {
      id: 'wh1', scene: 'why', start: 0, end: 7.5,
      caption: 'A Karnaugh map is a picture of 2 to the n cells. At four variables that is sixteen.',
      narration: 'A Karnaugh map is a picture with two to the n cells, one for each minterm. At four variables that is sixteen cells, and the picture is comfortable.',
      detail: 'Comfortable means a person can see every adjacency at once. That is the whole value of the map, and it is also the whole limitation, because the value depends on the picture being small enough to hold in the eye.',
      keyword: '2 to the n',
      trap: 'Assuming a five-variable map is just a bigger four-variable map. It is two maps side by side, and the cells that are adjacent across the fold are the ones people miss.'
    },
    {
      id: 'wh2', scene: 'why', start: 7.5, end: 15,
      caption: 'At five variables it is two maps folded together; at six it needs a third dimension.',
      narration: 'At five variables the map becomes two four-variable maps laid side by side, and the cells adjacent across the fold are easy to miss. At six variables it needs a third dimension, and eyes are not built for that.',
      detail: 'The count is the point: thirty-two cells at five variables, sixty-four at six. Nothing about the underlying search has changed; only the amount of paper has.',
      keyword: 'third dimension',
      trap: 'Drawing a six-variable map as one flat grid with the wrong adjacency. Any flat drawing of it loses exactly the adjacencies the method depends on.'
    },
    {
      id: 'wh3', scene: 'why', start: 15, end: 22.5,
      caption: 'The tabular method is the same search written down, so it has no size limit.',
      narration: 'The tabular method, published by Quine in 1952 and extended by McCluskey in 1956, performs the same search as the map. It writes the search down instead of drawing it, so nothing has to be seen.',
      detail: 'The syllabus names it directly: GATE 2027 Section 2 reads "Boolean algebra and minimization — algebraic technique, Karnaugh map, tabular method". All three methods are examinable, and this is the third one.',
      keyword: 'written down',
      trap: 'Treating the tabular method as a slower duplicate of the map and skipping it. It is the method that answers the questions the map cannot draw.'
    },
    {
      id: 'wh4', scene: 'why', start: 22.5, end: 30,
      caption: 'Because it is written, it is also the method a program can run.',
      narration: 'And because every step is a comparison of two strings rather than a judgement about a picture, the tabular method is deterministic. It is the method a program can run, and the reason it is the ancestor of every minimiser since.',
      detail: 'Deterministic matters for a second reason: it gives a way to check that the minimal form has actually been reached, which the map never does. The map finds a cover; the table certifies that no smaller one exists.',
      keyword: 'deterministic',
      trap: 'Believing the table is exact because it is written. It is exact only if the combining passes run to a fixed point; stopping early silently loses a prime implicant.'
    },

    /* ---------- scene 2: theorem ---------- */
    {
      id: 'th1', scene: 'theorem', start: 30, end: 37.5,
      caption: 'Two product terms that differ in one variable are x·y and x·y prime, which sum to x.',
      narration: 'The whole method rests on one identity. Two product terms that agree everywhere except in one variable are x times y and x times y-bar, and their sum is x. The variable that changed disappears.',
      detail: 'This is the consensus-free half of Boolean algebra: x·y + x·y′ = x(y + y′) = x·1 = x. The map draws this as two adjacent cells merging into a domino; the table writes it as one string with a dash.',
      keyword: 'x times y and x times y-bar',
      trap: 'Combining two terms that differ in two variables. There is no identity for that, and the merged term would not be an implicant at all.'
    },
    {
      id: 'th2', scene: 'theorem', start: 37.5, end: 45,
      caption: 'The dash records the variable the merge removed: 0010 with 0110 becomes 0-10.',
      narration: 'So the merge is written as a dash in the position that differed. The minterms 0010 and 0110 agree in the first, third and fourth positions and differ in the second, so they merge to 0 dash 1 0, which reads as w-bar, y, z-bar.',
      detail: 'The dash is not a wildcard in the pattern-matching sense only; it is a record of a proof. It says: this term covers both parents, and the variable in this position is irrelevant to both.',
      keyword: '0 dash 1 0',
      trap: 'Reading a dash as "either value, freely". A dash is bounded: it covers exactly the two to the k minterms obtained by filling the dashes with every combination, and no others.'
    },
    {
      id: 'th3', scene: 'theorem', start: 45, end: 52.5,
      caption: 'Only groups whose one-counts differ by one can combine, so the table sorts by that count.',
      narration: 'Two terms that differ in exactly one position have one-counts that differ by exactly one, because flipping one bit changes the count of ones by one. So the table sorts its terms into groups by the number of ones, and only neighbouring groups need to be compared.',
      detail: 'That single observation is what makes the method practical. Without it, a column of m terms needs m-squared comparisons; with it, only the adjacent pairs are examined.',
      keyword: 'differ by one',
      trap: 'Comparing only inside a group. Terms within one group have equal counts and cannot differ in one bit, so the pairs that matter are always in adjacent groups.'
    },
    {
      id: 'th4', scene: 'theorem', start: 52.5, end: 60,
      caption: 'Dashes must line up: -110 with 011- differ in three places and never combine.',
      narration: 'In later rounds the terms already contain dashes, and two dashed terms may combine only if their dashes are in the same positions and they differ in exactly one of the remaining positions. Otherwise the difference is more than one variable and no identity applies.',
      detail: 'This is the step that produces most of the errors in a hand-worked table. Two terms that look almost equal but whose dashes sit in different columns are not combinable, and merging them invents a term that covers a minterm the function does not have.',
      keyword: 'dashes must line up',
      trap: 'Merging two terms whose dashes are in different positions. The result would cover minterms outside the function, so it is not an implicant.'
    },

    /* ---------- scene 3: pass 1 ---------- */
    {
      id: 'p1a', scene: 'pass1', start: 60, end: 67.5,
      caption: 'The 2015 paper asks for the prime implicants of sigma m of 0, 2, 4, 5, 6, 10.',
      narration: 'GATE CSE 2015 Set 3, question 43 asks for the total number of prime implicants of the four-variable function whose minterms are 0, 2, 4, 5, 6 and 10. Six minterms, no don\'t-cares.',
      detail: 'This is a numerical-answer question, so the answer is a count and nothing else. The table below produces the count, and every count in it is computed by this page rather than written from memory.',
      keyword: 'prime implicants',
      trap: 'Answering with the number of minterms, or with the number of groups in the first column. Neither is the question.'
    },
    {
      id: 'p1b', scene: 'pass1', start: 67.5, end: 75,
      caption: 'Written in binary and sorted by ones: one term with none, two with one, three with two.',
      narration: 'Write each minterm in four bits and sort by the number of ones. Minterm zero has no ones. Minterms two and four have one each. Minterms five, six and ten have two each.',
      detail: 'The four-bit strings are 0000, 0010, 0100, 0101, 0110 and 1010. The groups hold one, two and three terms respectively, and the last group is empty of higher counts.',
      keyword: 'sorted by ones',
      trap: 'Sorting by the minterm number instead of the one-count. The number order groups nothing useful; the one-count order is what makes the comparisons local.'
    },
    {
      id: 'p1c', scene: 'pass1', start: 75, end: 82.5,
      caption: 'Six merges in round one: every term finds a partner, so nothing survives yet.',
      narration: 'Compare group one with group two and group two with group three. All six minterms find a partner, which produces six merges and ticks every parent. No term survives the first round.',
      detail: 'The merges are 0 with 2, 0 with 4, 2 with 6, 2 with 10, 4 with 5 and 4 with 6. Each pair differs in exactly one bit, which is why each one is legal.',
      keyword: 'six merges',
      trap: 'Ticking only the term you compared from. Both parents are ticked, because both are contained in the larger term that the merge produced.'
    },
    {
      id: 'p1d', scene: 'pass1', start: 82.5, end: 90,
      caption: 'Round one leaves six dashed terms: 00-0, 0-00, 0-10, -010, 010- and 01-0.',
      narration: 'The first round leaves six new terms, each with one dash: 00-0, 0-00, 0-10, minus-010, 010-minus and 01-0. The dashes are in different columns, which is what the next round has to respect.',
      detail: 'Count them: six parents produced six merges, and the six merges are six distinct children. That is not automatic; a child reached from two different pairs is written once.',
      keyword: 'six dashed terms',
      trap: 'Writing a child twice because two different pairs produced it. The set of terms in a column is a set; duplicates collapse.'
    },

    /* ---------- scene 4: rounds ---------- */
    {
      id: 'rd1', scene: 'rounds', start: 90, end: 97.5,
      caption: 'Round two: two pairs combine, both producing 0--0, and two terms stand unticked.',
      narration: 'Round two compares the six dashed terms. Two pairs combine, and both pairs produce the same child, 0 dash dash 0, which is written once. Two terms find no partner and stand unticked.',
      detail: 'The two survivors are minus-010 and 010-minus. Neither can grow: the cells that would extend them are zeroes of the function, so they are already maximal.',
      keyword: 'both producing 0 dash dash 0',
      trap: 'Assuming a term with a dash is automatically prime. A dash does not make a term maximal; only the absence of a partner does.'
    },
    {
      id: 'rd2', scene: 'rounds', start: 97.5, end: 105,
      caption: 'Round three finds nothing: one term in, no pair combines, and the search stops.',
      narration: 'Round three has a single term left, 0 dash dash 0. No pair anywhere can combine, so the passes stop. That empty round is the fixed point, and it is what makes the table exact rather than merely finished.',
      detail: 'The dashes in 0--0 sit in columns two and three, so the term covers minterms with the first and last bits zero: 0000, 0010, 0100 and 0110, which are 0, 2, 4 and 6. All four are in the function.',
      keyword: 'the fixed point',
      trap: 'Treating an empty round as wasted work and skipping it. It is the proof that no term can still grow, so without it the prime list is not certified.'
    },
    {
      id: 'rd3', scene: 'rounds', start: 105, end: 112.5,
      caption: 'Eight merges, three survivors: the answer is 3, which is the published key.',
      narration: 'Count the work: six merges in round one, two in round two, none in round three, so eight merges in all. Three terms were never ticked, and those three are the prime implicants. The answer is 3.',
      detail: 'The three are 0--0, minus-010 and 010-minus. This page computes the count from the table and separately from the definition, and both give three, which is the number in the official key.',
      keyword: 'three survivors',
      trap: 'Counting the terms in the largest column instead of the unticked ones. The count of primes is a count of survivors, not of rows.'
    },
    {
      id: 'rd4', scene: 'rounds', start: 112.5, end: 120,
      caption: 'Three primes covering six minterms: two, three and one of them respectively.',
      narration: 'Read what each prime covers. 0 dash dash 0 covers four minterms, 0, 2, 4 and 6. Minus-010 covers three, 2, 6 and 10. 010-minus covers two, 4 and 5. The six minterms of the function are covered, and the counts add up with overlap.',
      detail: 'Overlap is expected and harmless: minterm 2 lies in two primes and minterm 4 lies in two. A cover is allowed to cover a minterm more than once; it is only forbidden to leave one uncovered.',
      keyword: 'covers four minterms',
      trap: 'Adding the cover sizes and expecting the minterm count. The sizes overlap, so the sum exceeds six, and that is not an error.'
    },

    /* ---------- scene 5: prime ---------- */
    {
      id: 'pm1', scene: 'prime', start: 120, end: 127.5,
      caption: 'A prime implicant is an implicant that no larger implicant contains.',
      narration: 'An implicant of a function is a product term that covers no minterm the function does not have. It is prime when no larger implicant contains it. That is a definition about containment, not about usefulness.',
      detail: 'Containment is a set relation between the minterms each cube covers. A cube of k dashes covers two to the k minterms, so a larger implicant is one with more dashes whose covered set contains the smaller one\'s.',
      keyword: 'no larger implicant contains it',
      trap: 'Defining a prime implicant as "a big group". Size is evidence, not the definition: a large group that can still grow is not prime.'
    },
    {
      id: 'pm2', scene: 'prime', start: 127.5, end: 135,
      caption: 'The table finds them by ticking. A ticked term is contained in its child, so it cannot be prime.',
      narration: 'The tick in the table is exactly the containment relation. A ticked term is contained in the term its merge produced, so it cannot be prime. An unticked term has no containing implicant, so it is.',
      detail: 'This is why the tick is the whole bookkeeping of the method: it is not a note, it is the definition applied. Anything unticked in any column is prime and is kept.',
      keyword: 'ticked term is contained',
      trap: 'Discarding the ticked terms entirely. They are still implicants and still correct; they are only not prime, and a cover is built from primes.'
    },
    {
      id: 'pm3', scene: 'prime', start: 135, end: 142.5,
      caption: 'Checked against the definition: all eighty-one cubes enumerated, the maximal ones are the three.',
      narration: 'This page does not take the table\'s word for it. It enumerates all eighty-one possible cubes over four variables, keeps the implicants, and finds those that no other implicant contains. The set is exactly the three unticked terms.',
      detail: 'Eighty-one is three to the fourth: each position is zero, one or dash. The check is exhaustive over four variables, so for this function it is a proof rather than a sample.',
      keyword: 'eighty-one cubes',
      trap: 'Treating agreement between the table and the definition as redundant. They are independent procedures, and their agreement is the only reason to trust either on a larger function.'
    },
    {
      id: 'pm4', scene: 'prime', start: 142.5, end: 150,
      caption: 'Prime is not the same as needed: a prime implicant can still be left out of every cover.',
      narration: 'Here is the separation that the rest of the lesson lives on. Being prime is a property of the term alone; being needed is a property of the term against the rest of the chart. A prime implicant can be perfectly maximal and still appear in no minimal expression.',
      detail: 'The 2018 function later in this lesson has a prime implicant that covers only don\'t-cares, so it is never selected by any cover at all. That is the extreme case of prime but not needed.',
      keyword: 'prime is not the same as needed',
      trap: 'Answering "which prime implicants are in the minimal expression" with the full prime list. The chart decides the second question and it is a different question.'
    },

    /* ---------- scene 6: chart ---------- */
    {
      id: 'ch1', scene: 'chart', start: 150, end: 157.5,
      caption: 'The chart: one row per prime implicant, one column per minterm of the function.',
      narration: 'Finding the primes is half the problem. The function has three primes and a minimal expression may not need all of them, so the second half is a covering problem. Set it out as a chart: a row per prime implicant, a column per minterm.',
      detail: 'Put a cross where a row covers a column. The chart is the incidence matrix of a set-cover instance, which is why the same three rules — essential, dominance, branch — appear in every treatment of it.',
      keyword: 'one row per prime implicant',
      trap: 'Putting don\'t-care terms on the columns. They are excluded from the chart, and including them makes a useless row look necessary.'
    },
    {
      id: 'ch2', scene: 'chart', start: 157.5, end: 165,
      caption: 'A column holding one cross forces its row: minterm 0 is covered only by 0--0.',
      narration: 'Now read the columns. A column holding exactly one cross means that minterm has only one prime implicant able to cover it, so that prime must be in every cover. It is essential.',
      detail: 'On this function minterm 0 appears only in 0--0, minterm 5 only in 010-minus, and minterm 10 only in minus-010. Three columns with one cross, so three essentials.',
      keyword: 'forces its row',
      trap: 'Looking for the essential row by looking for the widest row. Essentiality is read down a column, never across a row.'
    },
    {
      id: 'ch3', scene: 'chart', start: 165, end: 172.5,
      caption: 'All three are essential, they cover all six minterms, and the cover has eight literals.',
      narration: 'Take the three essentials and delete the columns they cover. Every column goes, so nothing is left to choose and the cover is exactly the three primes. Count the literals: two plus three plus three is eight.',
      detail: 'The expression is x-bar z-bar, plus w-bar x y-bar, plus w-bar y z-bar, depending on the declared variable order. This page prints the merged forms so the literal count can be checked against the table.',
      keyword: 'eight literals',
      trap: 'Stopping at "all essentials" when columns remain. When a column is left over, essentials alone do not form a cover and a choice is still required.'
    },
    {
      id: 'ch4', scene: 'chart', start: 172.5, end: 180,
      caption: 'Two bookkeeping rules shrink a chart before any guessing: row and column dominance.',
      narration: 'Two rules reduce a chart without any search. A row that covers everything another row covers is redundant, so the smaller row goes. A column that is crossed wherever another column is crossed is easier, so the harder column is kept and the easier one struck out.',
      detail: 'Applied alternately these rules often unravel a chart completely. They are the same rules as in the unate covering problem, and they are exact: they never remove a row that a minimum cover needed.',
      keyword: 'row and column dominance',
      trap: 'Deleting the dominating column instead of the dominated one. The column with fewer crosses is the harder constraint and must survive.'
    },

    /* ---------- scene 7: don't-cares ---------- */
    {
      id: 'dc1', scene: 'dc', start: 180, end: 187.5,
      caption: 'GATE CSE 2018 Q49: six minterms and five don\'t-cares, and the question is essentials.',
      narration: 'GATE CSE 2018, question 49 gives a four-variable function with six minterms and five don\'t-cares, and asks for the number of essential prime implicants. The don\'t-cares are 3, 8, 10, 12 and 14.',
      detail: 'The question is a numerical-answer item, and the published key is three. Everything below is computed, including the chart, so the key is checked rather than quoted.',
      keyword: 'number of essential prime implicants',
      trap: 'Ignoring the don\'t-cares while generating implicants. They exist precisely to let an implicant grow, and dropping them gives fewer and smaller primes.'
    },
    {
      id: 'dc2', scene: 'dc', start: 187.5, end: 195,
      caption: 'Don\'t-cares enter when the terms are listed and leave when the chart is drawn.',
      narration: 'The placement rule is the one thing to memorise. A don\'t-care is included when the terms are listed, because it may let a prime grow. It is excluded from the chart, because no cover is obliged to include it.',
      detail: 'Getting this the wrong way round is the commonest error in the whole procedure. Include them and you get larger primes; include them in the chart and you force a term that nothing requires.',
      keyword: 'in when listed, out of the chart',
      trap: 'Listing only the minterms and still drawing a five-column chart. The two halves of the rule must both be applied, and they go in opposite directions.'
    },
    {
      id: 'dc3', scene: 'dc', start: 195, end: 202.5,
      caption: 'Six primes, and one of them covers only don\'t-cares, so its row is empty.',
      narration: 'The passes produce six prime implicants. One of them, P S bar, covers minterms 8, 10, 12 and 14, and every one of those is a don\'t-care. Its row in the chart is empty, so no cover can ever select it.',
      detail: 'This is the cleanest illustration of prime against useful: the term is genuinely prime, genuinely maximal, and completely unable to help. It is listed and then discarded by the chart itself.',
      keyword: 'its row is empty',
      trap: 'Selecting the empty row because it looks large. A row with no cross covers no required minterm, so adding it changes nothing and costs literals.'
    },
    {
      id: 'dc4', scene: 'dc', start: 202.5, end: 210,
      caption: 'Three columns hold one cross — minterms 0, 5 and 9 — so the answer is 3.',
      narration: 'Read the columns of required minterms. Minterm 0 is covered only by Q bar S bar, minterm 5 only by P bar Q S, and minterm 9 only by P Q bar. Three columns with a single cross, so three essential prime implicants, which is the published key.',
      detail: 'Note that no don\'t-care column could have forced anything, because don\'t-cares are not columns. Every essential here rests on a one, which is the correct reason for it to be essential.',
      keyword: 'minterms 0, 5 and 9',
      trap: 'Counting an essential because it is the only cover of a don\'t-care. A don\'t-care is never required, so it can never force a row.'
    },

    /* ---------- scene 8: cyclic ---------- */
    {
      id: 'cy1', scene: 'cyclic', start: 210, end: 217.5,
      caption: 'Sigma m of 0, 1, 2, 5, 6, 7 over three variables: six primes, each of two minterms.',
      narration: 'Now the case that breaks the easy procedure. Take the three-variable function whose minterms are 0, 1, 2, 5, 6 and 7. It has six prime implicants and each one covers exactly two minterms.',
      detail: 'The six are A bar B bar, A bar C bar, B bar C, B C bar, A C and A B. Every one of them is a pair, and no quad is available because minterms 3 and 4 are zeroes of the function.',
      keyword: 'six prime implicants',
      trap: 'Looking for a quad and concluding the answer is wrong when none exists. Two zeroes can forbid every quad in a six-minterm function.'
    },
    {
      id: 'cy2', scene: 'cyclic', start: 217.5, end: 225,
      caption: 'Every column holds exactly two crosses, so no column forces a row.',
      narration: 'Draw the chart. Six columns, and each of the six minterms lies in exactly two primes. No column holds a single cross, so there is no essential prime implicant at all.',
      detail: 'That is not a mistake in the table. It is a genuine property of the function: no prime implicant is the unique cover of anything, so none of them is forced.',
      keyword: 'no essential prime implicant',
      trap: 'Assuming every function has at least one essential prime implicant. Cyclic functions have none, and answering "the essentials" then answers nothing.'
    },
    {
      id: 'cy3', scene: 'cyclic', start: 225, end: 232.5,
      caption: 'Dominance finds nothing either: every row covers two, every column holds two.',
      narration: 'Dominance cannot help here. Every row covers two minterms and no row covers everything another covers, so no row dominates. Every column holds two crosses and no column is crossed wherever another is, so no column dominates.',
      detail: 'The chart is irreducible: it is the cyclic core of the covering problem. Every remaining decision is a real choice, and the choice must be made by an exact procedure rather than by inspection.',
      keyword: 'irreducible',
      trap: 'Forcing a reduction that is not there. Guessing at a dominance and deleting a row silently removes a solution.'
    },
    {
      id: 'cy4', scene: 'cyclic', start: 232.5, end: 240,
      caption: 'Two minimal covers exist and they tie at three primes and six literals.',
      narration: 'There are exactly two minimal covers, each of three prime implicants and six literals. They are equally good, and nothing in the algebra prefers one over the other.',
      detail: 'The tie is real: A bar B bar with B C bar with A C, or A bar C bar with B bar C with A B. Both cover the six minterms and both cost six literals, so either is a correct answer to a question that asks for a minimum.',
      keyword: 'two minimal covers',
      trap: 'Reporting one cover and calling it the answer. On a cyclic chart the minimum is a set of expressions, and a question may ask how many there are.'
    },

    /* ---------- scene 9: petrick ---------- */
    {
      id: 'pk1', scene: 'petrick', start: 240, end: 247.5,
      caption: "Petrick's method writes one sum per column: the rows that cover it, or-ed together.",
      narration: 'Petrick\'s method turns the chart into an algebra problem. For each column write a sum of the rows that cover it, because the cover is valid only if at least one of them is selected. The cover is valid only if every column is satisfied, so multiply the sums.',
      detail: 'The variables here are not the inputs of the circuit. P sub i is true when prime implicant i is selected, so this is a Boolean expression about the design rather than about the signals.',
      keyword: 'one sum per column',
      trap: 'Reading the product as a circuit expression. It is a statement about which rows are chosen, and its variables are decisions, not wires.'
    },
    {
      id: 'pk2', scene: 'petrick', start: 247.5, end: 255,
      caption: 'Six sums multiplied out, then absorbed with X plus X Y equals X.',
      narration: 'Multiply the six sums out and simplify. The only rules needed are the ones already known: X plus X Y equals X absorbs any product containing another, X times X equals X collapses repeats, and X plus X equals X removes duplicates.',
      detail: 'Absorption is what keeps the expansion finite in practice. Without it the product of six two-term sums has sixty-four products; with it, five survive.',
      keyword: 'X plus X Y equals X',
      trap: 'Expanding fully and then choosing by eye. The absorption step is what makes the list of candidates short enough to read.'
    },
    {
      id: 'pk3', scene: 'petrick', start: 255, end: 262.5,
      caption: 'Five products survive, two of them with three terms, and those two are the minima.',
      narration: 'Five products survive the absorption. Two of them contain three prime implicants and the other three contain four. The minimum is therefore three, and there are exactly two ways to reach it.',
      detail: 'Each product in the expansion is a valid cover; the minimum ones are the products with the fewest terms. When two tie on count, compare literal counts, and here they also tie on that.',
      keyword: 'five products',
      trap: 'Taking the first three-term product and stopping. There are two, and a question may ask for the number of minimal solutions rather than for one of them.'
    },
    {
      id: 'pk4', scene: 'petrick', start: 262.5, end: 270,
      caption: 'Both covers were checked against all eight inputs of the function.',
      narration: 'Both answers were checked against all eight input combinations. Each evaluates to one exactly on the six minterms of the function and zero on minterms 3 and 4, which is the only test that matters.',
      detail: 'The page runs that check for every cover it reports, so no expression is printed here that has not been evaluated on the whole input space.',
      keyword: 'all eight inputs',
      trap: 'Trusting the expansion without evaluating the result. A slip in the absorption produces a product that looks minimal and covers the wrong minterms.'
    },

    /* ---------- scene 10: cost ---------- */
    {
      id: 'cs1', scene: 'cost', start: 270, end: 277.5,
      caption: 'The procedure: list, group, combine to a fixed point, chart, essentials, then choose.',
      narration: 'Fix the order of work. List the terms and don\'t-cares in binary and group them by the number of ones. Combine in rounds until nothing combines. Collect the unticked entries. Draw the chart with minterm columns only. Take the essentials, reduce by dominance, then solve whatever core is left.',
      detail: 'The order is not cosmetic. Drawing the chart before the combining has reached a fixed point is the single most common way to lose a prime implicant and with it the minimum.',
      keyword: 'fixed point',
      trap: 'Drawing the chart from the first round\'s terms. The chart must be built from the unticked survivors of the final round, not from an intermediate column.'
    },
    {
      id: 'cs2', scene: 'cost', start: 277.5, end: 285,
      caption: 'Eight primes on a four-variable function of eight minterms: the count is not small.',
      narration: 'The cost is the reason exact minimisation stops. This page searches every four-variable function with eight minterms, and the worst one has eight prime implicants. The chart for it has eight rows, and the choices multiply from there.',
      detail: 'Petrick\'s expansion can produce up to two to the m products before absorption, where m is the number of uncovered columns. That is tolerable on a reduced core and intolerable on a large one, which is why practical tools reduce first.',
      keyword: 'eight prime implicants',
      trap: 'Assuming a small formula means a small table. Four variables and eight minterms is a small formula and already a substantial chart.'
    },
    {
      id: 'cs3', scene: 'cost', start: 285, end: 292.5,
      caption: 'Three traps: don\'t-cares in the chart, a dash mismatch, and a cover stopped early.',
      narration: 'Three traps. Putting don\'t-cares on the chart columns, which makes a useless row look forced. Merging two terms whose dashes are in different columns, which invents a term outside the function. And stopping the passes while a pair can still merge, which loses a prime.',
      detail: 'All three are the same failure seen from three sides: a step of the procedure was applied to the wrong set of terms. Checking the term list at each round catches all three.',
      keyword: 'the same failure',
      trap: 'Fixing a wrong prime list by adjusting the chart. The chart is downstream; if the primes are wrong, every later step is wrong with them.'
    },
    {
      id: 'cs4', scene: 'cost', start: 292.5, end: 300,
      caption: 'The table is the map with the picture removed, and the chart is the price of exactness.',
      narration: 'The sentence to keep: the tabular method is the Karnaugh map with the picture removed, so it works where the picture cannot be drawn, and the price of that is a covering problem that has to be solved rather than seen.',
      detail: 'That sentence answers the counting questions, explains why a cyclic chart has no essential, and tells you why an exact minimiser is expensive while a heuristic one is not.',
      keyword: 'the picture removed',
      trap: 'Treating the chart as the hard part and the table as the easy part. The table is mechanical; the chart is the part that needs a decision procedure.'
    }
  ]
};
