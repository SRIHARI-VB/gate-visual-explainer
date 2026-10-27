/* ==========================================================================
   relational-algebra-and-sql - THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs - never edited by hand.

   Every number quoted in a caption is computed by the model in lesson.js and
   printed on the canvas; the two agree because both read the same simulation.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'model',
      n: 1,
      title: 'A relation is a set of tuples, and that is the whole model',
      start: 0, end: 30,
      objective: 'Separate schema from instance, fix the words degree and cardinality, and see that a set never holds the same tuple twice - the fact that separates relational algebra from SQL.'
    },
    {
      id: 'prim',
      n: 2,
      title: 'Selection filters rows; projection keeps columns',
      start: 30, end: 60,
      objective: 'Apply sigma and pi to the eighteen-tuple instance from GATE 2017, and see projection collapse eighteen rows to four because a set has no duplicates.'
    },
    {
      id: 'sets',
      n: 3,
      title: 'Union, difference, intersection, and the product',
      start: 60, end: 90,
      objective: 'Run the set operators on two relations with the same schema, derive intersection from difference, and read the cardinality and degree of a product.'
    },
    {
      id: 'join',
      n: 4,
      title: 'The join is a selection on a product',
      start: 90, end: 120,
      objective: 'Trace a theta join on R(P,Q) and S(X,Y), see why Q=20 loses its row, and compute the degree of a natural join from the common attributes.'
    },
    {
      id: 'div',
      n: 5,
      title: 'Division answers "for every one of these"',
      start: 120, end: 150,
      objective: 'Compute CR / T1 on the printed GATE 2017 instance and get four rows, then write division using only projection, product and difference.'
    },
    {
      id: 'forall',
      n: 6,
      title: 'Four ways to write "owns all the brands"',
      start: 150, end: 180,
      objective: 'Evaluate the four options of GATE 2022 Q25 on two witness instances, and see options C and D fail on one witness each while A and B never disagree.'
    },
    {
      id: 'trc',
      n: 7,
      title: 'The same question as a logical formula',
      start: 180, end: 210,
      objective: 'Read a tuple relational calculus expression, map each tuple variable to an attribute, turn the shared variable into a join condition, and reproduce GATE 2026 Set 1 Q43.'
    },
    {
      id: 'sql',
      n: 8,
      title: 'SQL is written in one order and evaluated in another',
      start: 210, end: 240,
      objective: 'Fix the evaluation order FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY and the operator correspondence that most SQL questions test.'
    },
    {
      id: 'nulls',
      n: 9,
      title: 'NULL is unknown, so WHERE can lose a row twice',
      start: 240, end: 270,
      objective: 'Use three-valued logic to explain why x = 5 and x <> 5 miss the NULL row, why NOT IN over a NULL returns nothing, and what AVG divides by.'
    },
    {
      id: 'ermap',
      n: 10,
      title: 'From an ER diagram to relations, then the procedure',
      start: 270, end: 300,
      objective: 'Map an ER design to six relations with their keys and foreign keys, then fix a five-step procedure for every question in this lesson.'
    }
  ],

  events: [
    /* ---------------- scene 1: the model ---------------- */
    {
      id: 'md-1', start: 0, end: 10, scene: 'model',
      caption: 'A relation is a set of tuples over one fixed schema.',
      detail: 'A schema is a name and a list of attributes, here R with attributes A and B. An instance is the set of tuples that exists at one moment. Every operator in this lesson takes one or two instances and returns a new instance whose schema you can predict before you compute a single value. That predictability is why the algebra is a language and not a collection of tricks.',
      keyword: 'a set of tuples',
      trap: 'Reading a relation as a file. A file has an order and may repeat a line; a relation has neither.',
      narration: 'A relation is a set of tuples over one fixed schema.'
    },
    {
      id: 'md-2', start: 10, end: 20, scene: 'model',
      caption: 'The tuple (2, y) arrives twice, and the set keeps it once.',
      detail: 'Degree is the number of attributes, two here. Cardinality is the number of tuples in the instance, four here. When the same tuple is inserted twice nothing changes, because membership in a set is all that a relation records. SQL breaks this rule deliberately: a table is a bag, so it can hold the same row twice, and that single difference is behind most of the questions that compare SQL with the algebra.',
      keyword: 'the set keeps it once',
      trap: 'Answering a relational-algebra cardinality question with the number of rows printed, when two printed rows are equal. Count distinct tuples.',
      narration: 'The tuple two comma y arrives twice, and the set keeps it once.'
    },
    {
      id: 'md-3', start: 20, end: 30, scene: 'model',
      caption: 'Six operators generate everything else in this lesson.',
      detail: 'Selection, projection, rename, union, difference and the Cartesian product are the primitives. Intersection, the joins and division are all written from them, which is why a question can ask you to express division without using division. Learn which six are primitive and the rest of the topic becomes rewriting.',
      keyword: 'Six operators',
      trap: 'Treating intersection or division as primitive and being unable to rewrite them. Both are derived, and the rewrites are examinable.',
      narration: 'Six operators generate everything else in this lesson.'
    },

    /* ---------------- scene 2: selection and projection ---------------- */
    {
      id: 'pr-1', start: 30, end: 40, scene: 'prim',
      caption: 'Selection keeps the rows that pass a test; the schema is unchanged.',
      detail: 'The instance is CR with eighteen tuples, from GATE CSE 2017 Set 1 Q46. Selection with the test StudentName equal to SA keeps three tuples and changes nothing about the columns: the result still has both s and c. Sigma never adds or removes an attribute.',
      keyword: 'the schema is unchanged',
      trap: 'Expecting selection to reduce the number of columns. That is projection, and the two words are swapped in ordinary English.',
      narration: 'Selection keeps the rows that pass a test, and the schema is unchanged.'
    },
    {
      id: 'pr-2', start: 40, end: 50, scene: 'prim',
      caption: 'Projection keeps the columns you name, and drops repeated rows.',
      detail: 'Projecting the eighteen tuples of CR onto the course column leaves CA, CB, CC and CD: four tuples, not eighteen, because a set cannot hold the same tuple twice. This is the definition of projection in the algebra, and it is why SELECT DISTINCT, not SELECT, is the SQL form that matches it.',
      keyword: 'drops repeated rows',
      trap: 'Writing pi as SELECT and calling the two equivalent. SELECT keeps duplicates; only SELECT DISTINCT matches pi.',
      narration: 'Projection keeps the columns you name, and drops repeated rows.'
    },
    {
      id: 'pr-3', start: 50, end: 60, scene: 'prim',
      caption: 'SQL keeps duplicates, so the algebra and SQL differ by DISTINCT.',
      detail: 'The SQL query SELECT DISTINCT c FROM CR WHERE s equals SA returns the same three courses as the algebra. Without DISTINCT it would return three rows too, because the three SA tuples have three different courses; on the full relation it would return eighteen rows instead of four. The difference is invisible on some instances and decisive on others, which is exactly how it appears in a question.',
      keyword: 'differ by DISTINCT',
      trap: 'Assuming a duplicate-free instance proves SELECT and pi equivalent. Test on an instance that has duplicates.',
      narration: 'SQL keeps duplicates, so the algebra and SQL differ by DISTINCT.'
    },

    /* ---------------- scene 3: the set operators ---------------- */
    {
      id: 'se-1', start: 60, end: 70, scene: 'sets',
      caption: 'Union needs the same schema on both sides, in the same order.',
      detail: 'Union, difference and intersection all compare whole tuples, so both operands must have the same attributes in the same order. With R holding three tuples and S holding two, one of them shared, the union has four tuples: the shared tuple (2, y) appears once. This is not a convention that engines might relax; it is what makes the operators well defined.',
      keyword: 'the same schema on both sides',
      trap: 'Taking a union of relations with different schemas. The operation is undefined, not merely discouraged.',
      narration: 'Union needs the same schema on both sides, in the same order.'
    },
    {
      id: 'se-2', start: 70, end: 80, scene: 'sets',
      caption: 'Difference keeps the rows of the left operand that are not on the right.',
      detail: 'R minus S holds (1, x) and (3, x): the two tuples of R that S does not contain. Difference is not symmetric, so the order of the operands matters. Intersection is derived as R minus (R minus S), and every join is derived from a product plus a selection, so the primitive set stays at six.',
      keyword: 'not symmetric',
      trap: 'Reading R minus S as the symmetric difference. It is one-directional, and swapping the operands gives a different relation.',
      narration: 'Difference keeps the rows of the left operand that are not on the right.'
    },
    {
      id: 'se-3', start: 80, end: 90, scene: 'sets',
      caption: 'The product pairs every row with every row: 3 times 2 gives 6 rows.',
      detail: 'The Cartesian product of a three-tuple relation and a two-tuple relation has six tuples and four columns, because the columns are concatenated. The count is the product of the cardinalities and the degree is the sum of the degrees. Those two formulas answer a large share of the questions that look like they need the whole result computed.',
      keyword: '3 times 2 gives 6 rows',
      trap: 'Adding the cardinalities instead of multiplying them, or forgetting that the degree adds rather than maxes.',
      narration: 'The product pairs every row with every row: three times two gives six rows.'
    },

    /* ---------------- scene 4: the join ---------------- */
    {
      id: 'jn-1', start: 90, end: 100, scene: 'join',
      caption: 'A theta join is a product followed by a selection on the pair.',
      detail: 'R has attributes P and Q, S has X and Y, and the join condition is R.Q equals S.X. Every pair of tuples is formed first, twelve of them, and only the pairs that satisfy the test survive. Here three survive: the pairs whose Q equals an X, which are Q equal to 10, 10 and 40. The row with Q equal to 20 disappears because no tuple of S has X equal to 20.',
      keyword: 'a product followed by a selection',
      trap: 'Joining on the first attribute of each relation by reflex. The shared variable or the stated condition names the attributes, not their positions.',
      narration: 'A theta join is a product followed by a selection on the pair.'
    },
    {
      id: 'jn-2', start: 100, end: 110, scene: 'join',
      caption: 'A theta join keeps both copies of the joined attribute; a natural join merges them.',
      detail: 'The theta join result has four columns, R.P, R.Q, S.X and S.Y, because the two joined attributes have different names and both are kept. A natural join joins on every equally named attribute and keeps one copy, so its degree is the degree of R plus the degree of S minus the number of common attributes. With Q and X both named k, the natural join would give three columns.',
      keyword: 'a natural join merges them',
      trap: 'Writing the degree of a natural join as the sum of the degrees. Subtract the common attributes.',
      narration: 'A theta join keeps both copies of the joined attribute; a natural join merges them.'
    },
    {
      id: 'jn-3', start: 110, end: 120, scene: 'join',
      caption: 'Outer joins keep unmatched rows and fill the other side with NULL.',
      detail: 'A left outer join keeps every tuple of the left operand even when no tuple of the right operand matches, filling the right columns with NULL. This is a SQL addition, not a relational-algebra operator, and it is the reason a NULL can mean two different things in one result: an unknown value, or an absent match. Telling those two apart is what the NULL scene later depends on.',
      keyword: 'fill the other side with NULL',
      trap: 'Using an inner join and expecting the unmatched rows to survive. They are removed by the join condition.',
      narration: 'Outer joins keep unmatched rows and fill the other side with NULL.'
    },

    /* ---------------- scene 5: division ---------------- */
    {
      id: 'dv-1', start: 120, end: 130, scene: 'div',
      caption: 'The question is: which students took every course that SA took?',
      detail: 'T1 is the projection of the SA tuples onto the course column, which gives CA, CB and CC. The division CR divided by T1 asks for the students whose set of courses contains all of T1. This is the one operator whose meaning is a universal statement, and it is why division appears whenever a question says all, every, or each.',
      keyword: 'every course that SA took',
      trap: 'Reading division as an ordinary division of numbers. It compares sets of tuples, and the answer has fewer attributes than the left operand.',
      narration: 'The question is: which students took every course that SA took?'
    },
    {
      id: 'dv-2', start: 130, end: 140, scene: 'div',
      caption: 'Four students survive: SA, SC, SD and SF, so T2 has 4 rows.',
      detail: 'Each row of the grid is one student and each dot is a course taken. The three highlighted columns are T1. SA, SC, SD and SF have a dot in all three. SB has no CA and SE has no CC, so each of them fails on exactly one course, and one failure is enough. The answer to the GATE 2017 item is therefore four.',
      keyword: '4 rows',
      trap: 'Counting the students who took most of the courses, or counting the courses instead of the students. Division returns the non-common attributes of the left operand.',
      narration: 'Four students survive: SA, SC, SD and SF, so T2 has four rows.'
    },
    {
      id: 'dv-3', start: 140, end: 150, scene: 'div',
      caption: 'Division needs no new operator: projection, product and difference suffice.',
      detail: 'R divided by S equals the projection of R on its own attributes, minus the projection of the missing pairs. The missing pairs are the ideal pairs, every A-value paired with every S tuple, minus the pairs R actually holds. A student with any missing pair is subtracted. Two edge cases matter: if S is empty the answer is every A-value of R, because the test holds vacuously, and S must have a subset of the attributes of R for the expression to be legal at all.',
      keyword: 'projection, product and difference',
      trap: 'Dividing by a relation whose attributes are not a subset of the left operand. The expression is then undefined, not merely empty.',
      narration: 'Division needs no new operator: projection, product and difference suffice.'
    },

    /* ---------------- scene 6: for all, GATE 2022 ---------------- */
    {
      id: 'fa-1', start: 150, end: 160, scene: 'forall',
      caption: 'Options A and B are the two standard spellings of division.',
      detail: 'A divides the pairs of Own by the brands in Brand. B takes every employee, forms the ideal pairs with every brand, subtracts the pairs that Own actually holds, and then subtracts the employees who are missing at least one pair. On the first witness both return the empty set, which is correct, because three of the four brands are owned by nobody and so no employee owns all four.',
      keyword: 'the two standard spellings',
      trap: 'Believing only one spelling can be right. Both are correct, and a multiple-select question can key both.',
      narration: 'Options A and B are the two standard spellings of division.'
    },
    {
      id: 'fa-2', start: 160, end: 170, scene: 'forall',
      caption: 'Option C divides by the brands that happen to be owned, and returns E1.',
      detail: 'C replaces Brand with the projection of Own onto the brand column. That set holds only the brands at least one person owns, so it is smaller than Brand whenever some brand is owned by nobody. On the first witness C therefore returns E1, who owns B1 and B2 and so owns every brand that is owned at all. The question asks for every brand in Brand, so C is wrong.',
      keyword: 'returns E1',
      trap: 'Dividing by the projection of the fact table instead of by the dimension table. It silently drops the values nobody has.',
      narration: 'Option C divides by the brands that happen to be owned, and returns E1.'
    },
    {
      id: 'fa-3', start: 170, end: 180, scene: 'forall',
      caption: 'Option D invents every pair first, and returns E1 and E2 on the second witness.',
      detail: 'D forms the product of the employees and the brands that appear in Own, then divides by Brand. That product contains pairs that Own does not hold, so the division can succeed for an employee who owns nothing like the complete set. On the second witness, two employees and two brands with no overlap, the correct answer is empty and D returns both employees. Each of C and D fails on one witness, and a single witness is enough.',
      keyword: 'invents every pair first',
      trap: 'Testing an option on the instance where it happens to work. Construct the instance where the candidate is weakest.',
      narration: 'Option D invents every pair first, and returns E1 and E2 on the second witness.'
    },

    /* ---------------- scene 7: tuple relational calculus ---------------- */
    {
      id: 'tr-1', start: 180, end: 190, scene: 'trc',
      caption: 'A calculus expression is a set former with a logical condition.',
      detail: 'The expression reads: the set of one-attribute tuples u such that there exists a v and there exists a w with the pair u v in R and the pair v w in S. There are no operators in it, only variables, quantifiers and conditions. It is declarative: it says what the answer is, where the algebra says how to compute it, and the two are equally expressive under the safety condition.',
      keyword: 'a set former with a logical condition',
      trap: 'Reading the angle brackets as an ordered pair of relations. They are one tuple of values, position by position.',
      narration: 'A calculus expression is a set former with a logical condition.'
    },
    {
      id: 'tr-2', start: 190, end: 200, scene: 'trc',
      caption: 'A variable shared by two relations becomes an equality condition.',
      detail: 'In R of degree two the tuple u v means P is u and Q is v. In S of degree two the tuple v w means X is v and Y is w. The variable v appears in both, so a tuple of R and a tuple of S must agree on it: R.Q equals S.X. The variable w is quantified and never output, so the attribute Y disappears from the answer, exactly as a projection would remove it.',
      keyword: 'becomes an equality condition',
      trap: 'Matching variables to attributes by name rather than by position. The position in the angle brackets decides.',
      narration: 'A variable shared by two relations becomes an equality condition.'
    },
    {
      id: 'tr-3', start: 200, end: 210, scene: 'trc',
      caption: 'GATE 2026 Set 1 Q43: the answer is option B, P of S joined on X equal to Q.',
      detail: 'The output attribute is u, which is P, so the expression projects P. The join condition is R.Q equals S.X. Option A joins P to X and options C and D use Y, which is the wrong attribute of S. Evaluated on this instance the correct expression gives P equal to 1, 3 and 4, and the row with P equal to 2 is absent because its Q is 20 and no S tuple has X equal to 20.',
      keyword: 'option B',
      trap: 'Joining on the first attribute of each relation because it looks symmetrical. The shared variable sits in the second position of R and the first of S.',
      narration: 'GATE 2026 Set 1 Q43: the answer is option B.'
    },

    /* ---------------- scene 8: SQL ---------------- */
    {
      id: 'sq-1', start: 210, end: 220, scene: 'sql',
      caption: 'FROM builds the product, WHERE filters rows, SELECT chooses columns.',
      detail: 'The clauses are evaluated in the order FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, which is not the order they are typed. FROM forms the product of the listed tables, WHERE keeps the rows whose condition is true, and only then does SELECT choose columns. That order explains why a column alias created in the SELECT list cannot be used in the WHERE clause of the same query.',
      keyword: 'FROM builds the product',
      trap: 'Reading the query top to bottom and assuming SELECT runs first. It runs fifth.',
      narration: 'FROM builds the product, WHERE filters rows, SELECT chooses columns.'
    },
    {
      id: 'sq-2', start: 220, end: 230, scene: 'sql',
      caption: 'GROUP BY forms groups; HAVING filters groups, never individual rows.',
      detail: 'After WHERE, GROUP BY collects the surviving rows into groups that share the grouping attributes, and every aggregate in the SELECT list is computed once per group. HAVING then removes whole groups, so a condition on COUNT belongs in HAVING and a condition on a column belongs in WHERE. Putting an aggregate in WHERE is not merely inefficient; it is not legal.',
      keyword: 'HAVING filters groups',
      trap: 'Writing WHERE COUNT(*) greater than 1. An aggregate cannot appear in WHERE because the groups do not exist yet.',
      narration: 'GROUP BY forms groups; HAVING filters groups, never individual rows.'
    },
    {
      id: 'sq-3', start: 230, end: 240, scene: 'sql',
      caption: 'pi is SELECT DISTINCT, sigma is WHERE, the product is a comma in FROM.',
      detail: 'The correspondence is the part most questions test: pi maps to SELECT DISTINCT, sigma to WHERE, the Cartesian product to several tables in FROM, union and difference to UNION and EXCEPT, and rename to AS. EXCEPT and INTERSECT are not implemented by every engine, so a question that uses them assumes a standard-conforming one. Knowing the mapping lets you translate a query in either direction without guessing.',
      keyword: 'pi is SELECT DISTINCT',
      trap: 'Assuming EXCEPT or INTERSECT is available everywhere, or that UNION ALL removes duplicates. It keeps them.',
      narration: 'pi is SELECT DISTINCT, sigma is WHERE, the product is a comma in FROM.'
    },

    /* ---------------- scene 9: NULL ---------------- */
    {
      id: 'nu-1', start: 240, end: 250, scene: 'nulls',
      caption: 'A comparison with NULL is UNKNOWN, and WHERE keeps only TRUE.',
      detail: 'SQL has three truth values. NULL AND FALSE is FALSE because a definite false settles the conjunction; NULL OR TRUE is TRUE for the same reason in the other direction; NULL AND TRUE is UNKNOWN, and NOT UNKNOWN is still UNKNOWN. Since WHERE keeps only rows whose condition is TRUE, a row that evaluates to UNKNOWN is discarded exactly as if it were false, which is why the row is invisible to both a test and its negation.',
      keyword: 'WHERE keeps only TRUE',
      trap: 'Writing WHERE p OR NOT p and expecting every row. In three-valued logic that condition is UNKNOWN on the NULL rows, so they are dropped.',
      narration: 'A comparison with NULL is UNKNOWN, and WHERE keeps only TRUE.'
    },
    {
      id: 'nu-2', start: 250, end: 260, scene: 'nulls',
      caption: 'On the values 6, 5 and NULL, x = 5 and x <> 5 return one row each.',
      detail: 'The first test matches 5, the second matches 6, and the NULL row matches neither, so the two counts add to two rather than three. The only test that reaches the NULL row is IS NULL. GATE CSE 2000 Q2.26 turns on the same fact from the other side: the paper stipulates that a comparison with NULL counts as false, and under that stipulation x not equal to 5 and NOT of x equal to 5 stop being equivalent. Under ordinary three-valued logic they are equivalent, which is worth knowing before the paper tells you otherwise.',
      keyword: 'one row each',
      trap: 'Adding the counts of a predicate and its negation and expecting the table size. Any NULL in the column breaks the sum.',
      narration: 'On the values six, five and NULL, x equals five and x not equal to five return one row each.'
    },
    {
      id: 'nu-3', start: 260, end: 270, scene: 'nulls',
      caption: 'NOT IN over a subquery holding a NULL returns no rows at all.',
      detail: 'NOT IN expands to a chain of not-equal tests joined by AND. If the subquery holds a NULL, one of those tests is UNKNOWN, the conjunction is UNKNOWN, and no row survives. NOT EXISTS is unaffected because EXISTS yields a definite true or false and never UNKNOWN. The same discipline governs aggregates: COUNT of a column skips NULLs while COUNT of star counts rows, so AVG of a column divides by the non-NULL count, and all rows whose grouping key is NULL form a single group.',
      keyword: 'returns no rows at all',
      trap: 'Rewriting NOT IN as NOT EXISTS and assuming the two agree. They agree only when the subquery has no NULLs.',
      narration: 'NOT IN over a subquery holding a NULL returns no rows at all.'
    },

    /* ---------------- scene 10: ER to relations, and the procedure ---------------- */
    {
      id: 'er-1', start: 270, end: 280, scene: 'ermap',
      caption: 'A one-to-many relationship puts its foreign key on the many side.',
      detail: 'Each strong entity becomes a relation with its own key. A one-to-many relationship needs no relation of its own: the key of the one side is placed in the relation of the many side, so Employee gains a did attribute. A many-to-many relationship cannot be held by either side, so it becomes a relation whose key is the pair of foreign keys. A multivalued attribute and a weak entity each need a relation too, and a weak entity is keyed by its owner key plus its partial key.',
      keyword: 'foreign key on the many side',
      trap: 'Creating a relation for every relationship. Only the many-to-many ones need it, and adding the others invents joins that the design does not have.',
      narration: 'A one-to-many relationship puts its foreign key on the many side.'
    },
    {
      id: 'er-2', start: 280, end: 290, scene: 'ermap',
      caption: 'Six relations come out of this design, and every key is accounted for.',
      detail: 'Employee, Department and Project come from the entities. WorksOn comes from the many-to-many relationship. Phone comes from the multivalued attribute. Dependent comes from the weak entity. Employee also carries the did foreign key from the one-to-many relationship, which is why it appears twice in the table with different roles: once as an entity and once as the place where the foreign key lands.',
      keyword: 'Six relations',
      trap: 'Forgetting that a relation can appear twice in a mapping: once for the entity and once as the home of a foreign key.',
      narration: 'Six relations come out of this design, and every key is accounted for.'
    },
    {
      id: 'er-3', start: 290, end: 300, scene: 'ermap',
      caption: 'Write the result schema first, then the tuples, and check NULLs last.',
      detail: 'Five steps cover every question in this lesson. Fix the schema of each operand. Write the schema of the answer before computing it, including whether any attribute merges. Read all or every as division or as a double difference. For a count, enumerate the tuples instead of estimating from the wording. And check for NULLs before counting anything, because WHERE drops UNKNOWN rows as well as FALSE ones.',
      keyword: 'Write the result schema first',
      trap: 'Starting with the numbers. Writing the answer schema first turns most of these questions into a filling-in exercise.',
      narration: 'Write the result schema first, then the tuples, and check NULLs last.'
    }
  ]
};
