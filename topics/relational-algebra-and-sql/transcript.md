# Relational Algebra And Sql — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/relational-algebra-and-sql/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 30 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A relation is a set of tuples, and that is the whole model

*0:00 – 0:30 · objective: Separate schema from instance, fix the words degree and cardinality, and see that a set never holds the same tuple twice - the fact that separates relational algebra from SQL.*

**0:00–0:10** — A relation is a set of tuples over one fixed schema.

> Caption: A relation is a set of tuples over one fixed schema.

Exam-trap caption mode adds: *Reading a relation as a file. A file has an order and may repeat a line; a relation has neither.*

**0:10–0:20** — The tuple two comma y arrives twice, and the set keeps it once.

> Caption: The tuple (2, y) arrives twice, and the set keeps it once.

Exam-trap caption mode adds: *Answering a relational-algebra cardinality question with the number of rows printed, when two printed rows are equal. Count distinct tuples.*

**0:20–0:30** — Six operators generate everything else in this lesson.

> Caption: Six operators generate everything else in this lesson.

Exam-trap caption mode adds: *Treating intersection or division as primitive and being unable to rewrite them. Both are derived, and the rewrites are examinable.*

## Scene 2. Selection filters rows; projection keeps columns

*0:30 – 1:00 · objective: Apply sigma and pi to the eighteen-tuple instance from GATE 2017, and see projection collapse eighteen rows to four because a set has no duplicates.*

**0:30–0:40** — Selection keeps the rows that pass a test, and the schema is unchanged.

> Caption: Selection keeps the rows that pass a test; the schema is unchanged.

Exam-trap caption mode adds: *Expecting selection to reduce the number of columns. That is projection, and the two words are swapped in ordinary English.*

**0:40–0:50** — Projection keeps the columns you name, and drops repeated rows.

> Caption: Projection keeps the columns you name, and drops repeated rows.

Exam-trap caption mode adds: *Writing pi as SELECT and calling the two equivalent. SELECT keeps duplicates; only SELECT DISTINCT matches pi.*

**0:50–1:00** — SQL keeps duplicates, so the algebra and SQL differ by DISTINCT.

> Caption: SQL keeps duplicates, so the algebra and SQL differ by DISTINCT.

Exam-trap caption mode adds: *Assuming a duplicate-free instance proves SELECT and pi equivalent. Test on an instance that has duplicates.*

## Scene 3. Union, difference, intersection, and the product

*1:00 – 1:30 · objective: Run the set operators on two relations with the same schema, derive intersection from difference, and read the cardinality and degree of a product.*

**1:00–1:10** — Union needs the same schema on both sides, in the same order.

> Caption: Union needs the same schema on both sides, in the same order.

Exam-trap caption mode adds: *Taking a union of relations with different schemas. The operation is undefined, not merely discouraged.*

**1:10–1:20** — Difference keeps the rows of the left operand that are not on the right.

> Caption: Difference keeps the rows of the left operand that are not on the right.

Exam-trap caption mode adds: *Reading R minus S as the symmetric difference. It is one-directional, and swapping the operands gives a different relation.*

**1:20–1:30** — The product pairs every row with every row: three times two gives six rows.

> Caption: The product pairs every row with every row: 3 times 2 gives 6 rows.

Exam-trap caption mode adds: *Adding the cardinalities instead of multiplying them, or forgetting that the degree adds rather than maxes.*

## Scene 4. The join is a selection on a product

*1:30 – 2:00 · objective: Trace a theta join on R(P,Q) and S(X,Y), see why Q=20 loses its row, and compute the degree of a natural join from the common attributes.*

**1:30–1:40** — A theta join is a product followed by a selection on the pair.

> Caption: A theta join is a product followed by a selection on the pair.

Exam-trap caption mode adds: *Joining on the first attribute of each relation by reflex. The shared variable or the stated condition names the attributes, not their positions.*

**1:40–1:50** — A theta join keeps both copies of the joined attribute; a natural join merges them.

> Caption: A theta join keeps both copies of the joined attribute; a natural join merges them.

Exam-trap caption mode adds: *Writing the degree of a natural join as the sum of the degrees. Subtract the common attributes.*

**1:50–2:00** — Outer joins keep unmatched rows and fill the other side with NULL.

> Caption: Outer joins keep unmatched rows and fill the other side with NULL.

Exam-trap caption mode adds: *Using an inner join and expecting the unmatched rows to survive. They are removed by the join condition.*

## Scene 5. Division answers "for every one of these"

*2:00 – 2:30 · objective: Compute CR / T1 on the printed GATE 2017 instance and get four rows, then write division using only projection, product and difference.*

**2:00–2:10** — The question is: which students took every course that SA took?

> Caption: The question is: which students took every course that SA took?

Exam-trap caption mode adds: *Reading division as an ordinary division of numbers. It compares sets of tuples, and the answer has fewer attributes than the left operand.*

**2:10–2:20** — Four students survive: SA, SC, SD and SF, so T2 has four rows.

> Caption: Four students survive: SA, SC, SD and SF, so T2 has 4 rows.

Exam-trap caption mode adds: *Counting the students who took most of the courses, or counting the courses instead of the students. Division returns the non-common attributes of the left operand.*

**2:20–2:30** — Division needs no new operator: projection, product and difference suffice.

> Caption: Division needs no new operator: projection, product and difference suffice.

Exam-trap caption mode adds: *Dividing by a relation whose attributes are not a subset of the left operand. The expression is then undefined, not merely empty.*

## Scene 6. Four ways to write "owns all the brands"

*2:30 – 3:00 · objective: Evaluate the four options of GATE 2022 Q25 on two witness instances, and see options C and D fail on one witness each while A and B never disagree.*

**2:30–2:40** — Options A and B are the two standard spellings of division.

> Caption: Options A and B are the two standard spellings of division.

Exam-trap caption mode adds: *Believing only one spelling can be right. Both are correct, and a multiple-select question can key both.*

**2:40–2:50** — Option C divides by the brands that happen to be owned, and returns E1.

> Caption: Option C divides by the brands that happen to be owned, and returns E1.

Exam-trap caption mode adds: *Dividing by the projection of the fact table instead of by the dimension table. It silently drops the values nobody has.*

**2:50–3:00** — Option D invents every pair first, and returns E1 and E2 on the second witness.

> Caption: Option D invents every pair first, and returns E1 and E2 on the second witness.

Exam-trap caption mode adds: *Testing an option on the instance where it happens to work. Construct the instance where the candidate is weakest.*

## Scene 7. The same question as a logical formula

*3:00 – 3:30 · objective: Read a tuple relational calculus expression, map each tuple variable to an attribute, turn the shared variable into a join condition, and reproduce GATE 2026 Set 1 Q43.*

**3:00–3:10** — A calculus expression is a set former with a logical condition.

> Caption: A calculus expression is a set former with a logical condition.

Exam-trap caption mode adds: *Reading the angle brackets as an ordered pair of relations. They are one tuple of values, position by position.*

**3:10–3:20** — A variable shared by two relations becomes an equality condition.

> Caption: A variable shared by two relations becomes an equality condition.

Exam-trap caption mode adds: *Matching variables to attributes by name rather than by position. The position in the angle brackets decides.*

**3:20–3:30** — GATE 2026 Set 1 Q43: the answer is option B.

> Caption: GATE 2026 Set 1 Q43: the answer is option B, P of S joined on X equal to Q.

Exam-trap caption mode adds: *Joining on the first attribute of each relation because it looks symmetrical. The shared variable sits in the second position of R and the first of S.*

## Scene 8. SQL is written in one order and evaluated in another

*3:30 – 4:00 · objective: Fix the evaluation order FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY and the operator correspondence that most SQL questions test.*

**3:30–3:40** — FROM builds the product, WHERE filters rows, SELECT chooses columns.

> Caption: FROM builds the product, WHERE filters rows, SELECT chooses columns.

Exam-trap caption mode adds: *Reading the query top to bottom and assuming SELECT runs first. It runs fifth.*

**3:40–3:50** — GROUP BY forms groups; HAVING filters groups, never individual rows.

> Caption: GROUP BY forms groups; HAVING filters groups, never individual rows.

Exam-trap caption mode adds: *Writing WHERE COUNT(*) greater than 1. An aggregate cannot appear in WHERE because the groups do not exist yet.*

**3:50–4:00** — pi is SELECT DISTINCT, sigma is WHERE, the product is a comma in FROM.

> Caption: pi is SELECT DISTINCT, sigma is WHERE, the product is a comma in FROM.

Exam-trap caption mode adds: *Assuming EXCEPT or INTERSECT is available everywhere, or that UNION ALL removes duplicates. It keeps them.*

## Scene 9. NULL is unknown, so WHERE can lose a row twice

*4:00 – 4:30 · objective: Use three-valued logic to explain why x = 5 and x <> 5 miss the NULL row, why NOT IN over a NULL returns nothing, and what AVG divides by.*

**4:00–4:10** — A comparison with NULL is UNKNOWN, and WHERE keeps only TRUE.

> Caption: A comparison with NULL is UNKNOWN, and WHERE keeps only TRUE.

Exam-trap caption mode adds: *Writing WHERE p OR NOT p and expecting every row. In three-valued logic that condition is UNKNOWN on the NULL rows, so they are dropped.*

**4:10–4:20** — On the values six, five and NULL, x equals five and x not equal to five return one row each.

> Caption: On the values 6, 5 and NULL, x = 5 and x <> 5 return one row each.

Exam-trap caption mode adds: *Adding the counts of a predicate and its negation and expecting the table size. Any NULL in the column breaks the sum.*

**4:20–4:30** — NOT IN over a subquery holding a NULL returns no rows at all.

> Caption: NOT IN over a subquery holding a NULL returns no rows at all.

Exam-trap caption mode adds: *Rewriting NOT IN as NOT EXISTS and assuming the two agree. They agree only when the subquery has no NULLs.*

## Scene 10. From an ER diagram to relations, then the procedure

*4:30 – 5:00 · objective: Map an ER design to six relations with their keys and foreign keys, then fix a five-step procedure for every question in this lesson.*

**4:30–4:40** — A one-to-many relationship puts its foreign key on the many side.

> Caption: A one-to-many relationship puts its foreign key on the many side.

Exam-trap caption mode adds: *Creating a relation for every relationship. Only the many-to-many ones need it, and adding the others invents joins that the design does not have.*

**4:40–4:50** — Six relations come out of this design, and every key is accounted for.

> Caption: Six relations come out of this design, and every key is accounted for.

Exam-trap caption mode adds: *Forgetting that a relation can appear twice in a mapping: once for the entity and once as the home of a foreign key.*

**4:50–5:00** — Write the result schema first, then the tuples, and check NULLs last.

> Caption: Write the result schema first, then the tuples, and check NULLs last.

Exam-trap caption mode adds: *Starting with the numbers. Writing the answer schema first turns most of these questions into a filling-in exercise.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
