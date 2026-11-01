/* ==========================================================================
   relational-calculus-and-safety — THE timeline.
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
      id: 'what', n: 1,
      title: 'Two ways to ask one question',
      start: 0, end: 30,
      objective: 'Separate a language that says how to compute an answer from one that says what the answer must satisfy, and read the set-former {t | P(t)} as the second kind.'
    },
    {
      id: 'atoms', n: 2,
      title: 'The three atoms, and free against bound',
      start: 30, end: 60,
      objective: 'Name the only three atoms a formula may contain, close them under five connectives and two quantifiers, and say which variables the answer tuple is built from.'
    },
    {
      id: 'quant', n: 3,
      title: 'Exists is a scan; for-all is a failed search',
      start: 60, end: 90,
      objective: 'See ∃ as a scan that stops at a witness and ∀ as ¬∃¬, and know which of the two carries a join and which carries a "for every" requirement.'
    },
    {
      id: 'join', n: 4,
      title: 'A shared variable is a join: GATE 2026 Set 1 Q43',
      start: 90, end: 120,
      objective: 'Translate the domain-calculus expression of the 2026 paper into relational algebra by matching each variable to a position, and decide all four options on a computed instance.'
    },
    {
      id: 'drc', n: 5,
      title: 'Domain calculus: variables that hold values',
      start: 120, end: 150,
      objective: 'Read {<x1,...,xn> | P} with positional membership, write the same query in both calculi, and accept the computed fact that the two answers are equal.'
    },
    {
      id: 'safety', n: 6,
      title: 'Why the domain must be finite',
      start: 150, end: 180,
      objective: 'State dom(P), state what safety forbids, and see the test this page uses: enlarge the ambient domain by one value nobody mentions and watch whether the answer moves.'
    },
    {
      id: 'unsafe', n: 7,
      title: 'GATE CSE 2001: which expression is not safe',
      start: 180, end: 210,
      objective: 'Decide all four options of GATE CSE 2001 Q2.24 by the growth test rather than by pattern, and say exactly which atom fails to bind the output attribute.'
    },
    {
      id: 'vacuous', n: 8,
      title: 'The vacuous for-all, and the 2017 question',
      start: 210, end: 240,
      objective: 'See a true-for-everything universal quantifier produce an unbounded answer, watch one existential repair it, and place GATE CSE 2017 Set 1 Q41 inside that trap.'
    },
    {
      id: 'power', n: 9,
      title: 'Expressive power, and where it stops',
      start: 240, end: 270,
      objective: 'State Codd\'s equivalence of the basic algebra, safe TRC and safe DRC, and see the measured failure of a fixed quantifier depth on an unbounded chain.'
    },
    {
      id: 'procedure', n: 10,
      title: 'Counts, reading procedure and traps',
      start: 270, end: 300,
      objective: 'Leave with a four-step reading procedure for any calculus question, the candidate-count bound, and the three traps that lose marks.'
    }
  ],

  events: [
    /* ---------------- scene 1: what ---------------- */
    {
      id: 'wh1', scene: 'what', start: 0, end: 7.5,
      caption: 'Algebra says how to compute the answer; calculus says what the answer must satisfy.',
      narration: 'Two languages answer the same question. Relational algebra gives a recipe: take these rows, keep those, join with that. Relational calculus gives a description: the set of all tuples that satisfy a condition. Both return the same relation, and that is the point of the subject.',
      detail: 'The recipe and the description are not rivals. A recipe is easier to execute; a description is easier to write down when the requirement is a condition rather than a sequence of steps, especially when the condition contains the word "all".',
      keyword: 'how against what',
      trap: 'A calculus expression is not a program with a hidden loop order. It denotes a set, and a set has no order, so "which row is read first" is never a question about it.'
    },
    {
      id: 'wh2', scene: 'what', start: 7.5, end: 15,
      caption: 'A tuple calculus expression is a set former: the tuples t such that the condition holds.',
      narration: 'The syntax is one brace, a tuple variable, a vertical bar, and a formula. Read it aloud as "the set of tuples t such that P of t". The tuple variable t is the answer being described; the formula says which ones qualify.',
      detail: 'Everything in the notation is familiar from first-order logic: the same connectives, the same two quantifiers, the same idea of a variable being free or bound. The only new atoms are membership in a relation and comparison of attribute values.',
      keyword: 'the set of tuples t such that',
      trap: 'Reading the bar as "such that t is in P". P is a formula about t, not a relation, and t need not be in any relation at all.'
    },
    {
      id: 'wh3', scene: 'what', start: 15, end: 22.5,
      caption: 'The condition is a logical formula, so the question becomes truth, not order of steps.',
      narration: 'Because the condition is a formula, every question about a calculus expression is a question about truth: is there a witness, is there a counterexample, does the condition hold for every element of a relation. That is why the marks in this topic are about quantifiers and about safety, not about tracing a loop.',
      detail: 'A question that asks "what does this expression return" is answered by finding the tuples that make the formula true. A question that asks "is this expression equivalent to that one" is answered by finding a tuple on which the two formulae disagree.',
      keyword: 'truth, not order of steps',
      trap: 'Assuming the formula is evaluated left to right with a short circuit that matters. Truth does not depend on evaluation order; only cost does.'
    },
    {
      id: 'wh4', scene: 'what', start: 22.5, end: 30,
      caption: 'Same question, two notations: the algebra keeps the rows with A = 10 and B = 20.',
      narration: 'Here is GATE CSE 1999 Q1.19 as the smallest possible example. The calculus says: tuples t in r with t of A equal to 10 and t of B equal to 20. The algebra says: select A equals 10 and B equals 20. Both return the same one tuple, and the page computes both.',
      detail: 'The exam asked which algebra expression is equivalent, and offered the disjunction, the union, the intersection and the difference. Only the intersection of the two selections equals the conjunction, and the page measures all four against the calculus answer.',
      keyword: 'conjunction is intersection',
      trap: 'Conjunction maps to intersection of two selections, not to their union. Union is disjunction, and the two words are swapped often under time pressure.'
    },

    /* ---------------- scene 2: atoms ---------------- */
    {
      id: 'at1', scene: 'atoms', start: 30, end: 37.5,
      caption: 'Three atoms only: membership, attribute against attribute, attribute against a constant.',
      narration: 'A formula is built from exactly three kinds of atom. First, t is in r: a tuple variable belongs to a relation. Second, t of A equals u of B: two attribute values compared. Third, t of A equals a constant. Nothing else is an atom.',
      detail: 'The comparison operators allowed are the six usual ones. The membership atom is the one that carries data; the other two only compare values that some membership atom has already introduced, which is exactly the intuition behind safety.',
      keyword: 'three kinds of atom',
      trap: 'Writing t is not in r as an atom. The notation deliberately has no such atom: negation is applied to a formula, and that is where the trouble starts.'
    },
    {
      id: 'at2', scene: 'atoms', start: 37.5, end: 45,
      caption: 'Free variables build the answer; bound variables are internal to the condition.',
      narration: 'A variable is bound when a quantifier captures it, and free otherwise. The free variables are what the answer tuple is made of. In the expression on the right, t is free and u is bound: the answer is a set of t values, and u exists only inside the condition.',
      detail: 'This is the same free-and-bound distinction as in first-order logic. Every calculus question that asks "what is the schema of the answer" is asking which variables are free and in which order they appear.',
      keyword: 'free variables build the answer',
      trap: 'Leaving an output attribute unbound by any membership atom. That is not a syntax error, and it is exactly what makes an expression unsafe.'
    },
    {
      id: 'at3', scene: 'atoms', start: 45, end: 52.5,
      caption: 't of A picks an attribute by name; a domain variable is bound by position instead.',
      narration: 'Tuple calculus names an attribute: t of A. Domain calculus uses position: the first component of the tuple is the first attribute of the relation. Both are ways of saying which column is meant, and the two notations are otherwise the same logic.',
      detail: 'Positional binding is why domain calculus is the notation of query-by-example and why it appears in papers as angle brackets. When a relation has four attributes, the fourth position is the fourth attribute, and nothing in the syntax reminds you.',
      keyword: 'by name against by position',
      trap: 'Mixing the two conventions inside one expression. An expression either names attributes or indexes positions; a hybrid is not a well-formed query.'
    },
    {
      id: 'at4', scene: 'atoms', start: 52.5, end: 60,
      caption: 'Formulae close under not, and, or, implies, and the two quantifiers.',
      narration: 'From atoms, formulae are built by five connectives and two quantifiers, and that is the whole grammar. Because implication is defined as not-p or q, and for-all is defined as not-exists-not, the language has far fewer primitive ideas than it appears to have.',
      detail: 'The page uses those two definitions as computed checks: on every tuple of a small domain, the quantified form and its rewritten form must agree, and they do on both domains tested.',
      keyword: 'five connectives, two quantifiers',
      trap: 'Treating implies as a connective with its own truth table that differs from not-p or q. It does not; the two are the same formula.'
    },

    /* ---------------- scene 3: quantifiers ---------------- */
    {
      id: 'qu1', scene: 'quant', start: 60, end: 67.5,
      caption: 'Exists scans the relation and stops at the first witness.',
      narration: 'An existential quantifier bounded by a relation is a scan with early exit. To decide whether some tuple of R2 has A equal to 3, you look until you find one. The scan is finite because the relation is finite, and that is the whole reason bounded quantifiers are safe.',
      detail: 'Cost is not the exam question, but the shape of the scan is: one witness is enough, so the answer cannot depend on how many witnesses there are. This is why an existential contributes a filter, never a multiplication of rows.',
      keyword: 'one witness is enough',
      trap: 'Thinking two existential quantifiers over the same relation must use two different tuples. They may use the same tuple unless the formula says otherwise.'
    },
    {
      id: 'qu2', scene: 'quant', start: 67.5, end: 75,
      caption: 'For-all is not-exists-not: a search for a counterexample that never succeeds.',
      narration: 'A universal quantifier bounded by a relation is a search for a counterexample. If no counterexample exists, the universal statement is true. Written out, for-all u in R of P is the same as not exists u in R of not P, and the page checks that identity by evaluating both on every tuple of two domains.',
      detail: 'This rewriting is the single most useful algebraic move in the topic: it turns a "for all" requirement into a nested negation, which is how relational algebra expresses division as a double difference.',
      keyword: 'a search for a counterexample',
      trap: 'Reading for-all as "there are many". A universal statement over an empty relation is true, and that vacuous truth is the source of the next trap in this lesson.'
    },
    {
      id: 'qu3', scene: 'quant', start: 75, end: 82.5,
      caption: 'A join is an exists over the second relation; "for all" is a for-all with an exists inside.',
      narration: 'Two shapes cover most exam questions. A join is an existential over the second relation, with an equality between the two tuple variables. A "for every one of these" requirement is a universal quantifier whose body contains an existential: for every course, there exists an enrolment.',
      detail: 'Recognising which shape a question is in decides the whole solution. The join shape is answered by a projection of a join; the "for every" shape is answered by division, or by a double difference, or by a counting argument.',
      keyword: 'two shapes',
      trap: 'Writing the "for every" shape with the quantifiers in the other order. For every course there exists a student, and there exists a student such that for every course, are different statements.'
    },
    {
      id: 'qu4', scene: 'quant', start: 82.5, end: 90,
      caption: 'Measured: for-all and not-exists-not agree on every tuple tested.',
      narration: 'The page does not take the identity on trust. It evaluates the two forms on every tuple of the active domain, on two different domains, and reports the number of disagreements, which is zero. That number is printed on the canvas beside the check count.',
      detail: 'The same style of check is used for the two calculi later: the same query written in tuple and in domain notation is evaluated on one instance and the two answer sets must be equal, not merely similar in size.',
      keyword: 'zero disagreements',
      trap: 'Believing a check that only compares sizes. Two different answer sets can have the same cardinality, so equivalence must compare the sets.'
    },

    /* ---------------- scene 4: join ---------------- */
    {
      id: 'jo1', scene: 'join', start: 90, end: 97.5,
      caption: 'The shared variable v is the join: second attribute of R, first attribute of S.',
      narration: 'The 2026 paper writes a domain-calculus expression over two relations, R of P and Q, and S of X and Y. The variable v appears in both membership atoms, so it is the same value in both: v is Q in R and X in S, and that equality is the join condition.',
      detail: 'This is the whole technique. Find each variable, list the positions where it appears, and the pairs of positions that share a variable become equality conditions. A variable in one position only contributes nothing to the join.',
      keyword: 'the shared variable is the join',
      trap: 'Joining on the position that looks symmetrical rather than the one the variable occupies. The shared variable sits in the second position of R and the first of S, and those are the two columns to equate.'
    },
    {
      id: 'jo2', scene: 'join', start: 97.5, end: 105,
      caption: 'The free variable u is the first attribute of R, so the answer is a projection of P.',
      narration: 'The answer tuple is the single value u, and u appears only as the first component of R. So the answer is the projection onto P of the join. Both relations contribute a condition, and only R contributes a column to the answer.',
      detail: 'A useful discipline: decide the schema of the answer first, from the free variables, and only then write the expression. Getting the projection right is worth as much as getting the join right, and it is checked separately.',
      keyword: 'the answer is a projection of P',
      trap: 'Projecting onto the join attribute instead of the answer attribute. The join column is v, and v is not free, so it never appears in the answer.'
    },
    {
      id: 'jo3', scene: 'join', start: 105, end: 112.5,
      caption: 'Computed on the instance: u takes the values 1 and 2, and nothing else.',
      narration: 'On this instance R holds three pairs and S holds three. Only two values of u have a partner: u equals 1 pairs with v equals 2, which is in S as a first component, and u equals 2 pairs with v equals 3, which is also there. The third pair has v equal to 4, which S does not contain.',
      detail: 'Every one of those statements is computed rather than read off a picture: the page builds the answer from the two relations and prints the resulting set, and the four candidate options are each evaluated and compared with it.',
      keyword: '1 and 2, nothing else',
      trap: 'Counting the join pairs rather than the distinct values of the free variable. The answer is a set of u values, so two pairs with the same u give one row.'
    },
    {
      id: 'jo4', scene: 'join', start: 112.5, end: 120,
      caption: 'Option B matches; A, C and D each join on the wrong pair of columns.',
      narration: 'The official key is B: project P of S joined with R on S of X equal to R of Q. Option A joins P with X, option C joins P with Y, and option D joins Y with Q. Each of those equates two columns that never share a variable, and the page evaluates all four to show they return different sets here.',
      detail: 'This is the 2026 Set 1 paper, question 43, and the answer given is the published final key. The instance is this page\'s own, chosen so that all four options give different answers; the key does not depend on it.',
      keyword: 'the key is B',
      trap: 'Assuming a natural join was intended. The expression names no common attribute, so the join is a theta join on the two positions the variable occupies.'
    },

    /* ---------------- scene 5: drc ---------------- */
    {
      id: 'dr1', scene: 'drc', start: 120, end: 127.5,
      caption: 'Domain calculus swaps tuples for values: the answer is an ordered tuple of values.',
      narration: 'In domain calculus there is no tuple variable. The variables are domain variables, each holding one value, and the answer is an ordered tuple of them. The braces hold an angle-bracketed list instead of a single letter.',
      detail: 'The formula is otherwise identical in structure: the same atoms, the same connectives, the same quantifiers. What changes is what a variable ranges over, and therefore what a quantifier quantifies.',
      keyword: 'an ordered tuple of values',
      trap: 'Believing the change of notation changes the power of the language. It does not, once both are restricted to safe expressions, and that is the theorem of scene nine.'
    },
    {
      id: 'dr2', scene: 'drc', start: 127.5, end: 135,
      caption: 'Membership is positional: angle-bracket u, v in R means u is the first attribute.',
      narration: 'The membership atom lists the components in the relation\'s attribute order. So the angle-bracket u comma v in R means u is P and v is Q, and the angle-bracket v comma w in S means v is X and w is Y. One shared letter, one equality.',
      detail: 'Because the binding is positional, an expression with the wrong arity is a syntax error, while an expression with the right arity but the wrong order is a semantic error that still runs. The order is where marks are lost.',
      keyword: 'positional membership',
      trap: 'Swapping two components of the same type. Nothing complains, and the query silently answers a different question.'
    },
    {
      id: 'dr3', scene: 'drc', start: 135, end: 142.5,
      caption: 'The same query in both calculi returns the same two values here.',
      narration: 'Written as a tuple expression and written as a domain expression, the query returns the same set: one and two. The page evaluates both and compares the sets, and this is one of the model checks reported under the canvas.',
      detail: 'The translation is mechanical: replace each tuple variable by the list of its attributes, replace t of A by the corresponding position, and keep the formula. The free variables of the tuple form become the components of the answer tuple.',
      keyword: 'the same two values',
      trap: 'Comparing only the number of rows. Equality of answer sets is the claim; equal cardinality is not evidence for it.'
    },
    {
      id: 'dr4', scene: 'drc', start: 142.5, end: 150,
      caption: 'This is the notation of query-by-example, and the notation the 2026 paper used.',
      narration: 'Domain calculus is the theoretical basis of query-by-example, where you fill in example rows and the system infers the query. It is also the notation GATE used in 2026 for this item, which is why the notation is worth reading even if a paper usually writes tuple calculus.',
      detail: 'A paper may mix the two: a question can state a domain expression and ask for the equivalent algebra, as 2026 did, or state a tuple expression and ask which expressions are equivalent to it, as 2008 did.',
      keyword: 'the notation of query-by-example',
      trap: 'Refusing a question because it uses the notation you did not revise. The logic is identical; only the binding convention differs.'
    },

    /* ---------------- scene 6: safety ---------------- */
    {
      id: 'sa1', scene: 'safety', start: 150, end: 157.5,
      caption: 'A calculus expression ranges over every tuple the domain allows, so an infinite domain means an infinite answer.',
      narration: 'Here is the difficulty the notation creates. A tuple variable ranges over tuples of values, and nothing in the syntax says which values. If the values may be anything at all, the answer to "all tuples not in r" is infinite, and an infinite relation is not something a database can return.',
      detail: 'The problem is not that a real database has infinite domains. It is that the meaning of the expression would then depend on the surrounding universe of values rather than on the stored data, and a query language whose answers depend on the universe is not a query language at all.',
      keyword: 'an infinite answer',
      trap: 'Thinking this is a practical limit of storage. It is a definitional problem: the expression would have no well-defined finite answer.'
    },
    {
      id: 'sa2', scene: 'safety', start: 157.5, end: 165,
      caption: 'The domain of a formula is its constants plus every value in the relations it names.',
      narration: 'So the notation is given a finite universe. The domain of a formula P, written dom of P, is the set of values that appear explicitly in P, plus every value in every relation P mentions. It is finite, because a formula names finitely many relations and constants.',
      detail: 'On this instance dom of the formula is the set of values in r together with the constant 10. That set is what the page enumerates when it evaluates an expression, and it is why the answer can be computed at all.',
      keyword: 'dom of P is finite',
      trap: 'Including values from relations the formula does not mention. The domain is defined by what the formula references, not by the whole database.'
    },
    {
      id: 'sa3', scene: 'safety', start: 165, end: 172.5,
      caption: 'An expression is safe when every value in its answer comes from that domain.',
      narration: 'An expression is safe when every value that appears in its answer is a value of dom of P. That is the whole definition for the tuple calculus. It rules out the complement of a relation, because a tuple outside r may hold a value that appears nowhere in r.',
      detail: 'The definition is a property of the expression, not of one instance: the expression must be safe for every instance of the schema. That is why the growth test is the right operational form of it, and why one lucky instance proves nothing.',
      keyword: 'every value from the domain',
      trap: 'Checking safety on the instance in front of you. Safety is a claim about all instances, so a single instance where the answer happens to be finite is not a proof.'
    },
    {
      id: 'sa4', scene: 'safety', start: 172.5, end: 180,
      caption: 'The test used here: add a value nobody mentions, and see whether the answer changes.',
      narration: 'The operational form is a growth test. Evaluate the expression over dom of P. Then add one fresh value that appears in no relation and in no constant, and evaluate again. A safe expression returns exactly the same set; an unsafe one grows, because the new value is now allowed to appear in its answer.',
      detail: 'This page runs that test on every expression it shows, and reports the two answer sizes. It is the same idea as domain independence: the answer must not depend on values the data never mentions.',
      keyword: 'add a value, compare the answer',
      trap: 'Adding a value that already appears somewhere in the query. The test only has force when the added value is genuinely fresh, or the answer could not change for the wrong reason.'
    },

    /* ---------------- scene 7: unsafe ---------------- */
    {
      id: 'un1', scene: 'unsafe', start: 180, end: 187.5,
      caption: 'Four expressions, one instance, two domains: only one answer moves.',
      narration: 'GATE CSE 2001 asked which of four calculus expressions is not safe. The page takes the four as written, evaluates each over the domain of the instance and then over the domain plus one fresh value, and reports the two sizes. Exactly one row in this table grows.',
      detail: 'Reading the table is faster than reading the expressions: three of the four have the same size on both domains, which means the fresh value was never allowed to reach the answer. The fourth gains one row per fresh value.',
      keyword: 'only one answer moves',
      trap: 'Deciding by counting negations. A negation is harmless when the atom it negates is already bound by a positive atom elsewhere in the formula.'
    },
    {
      id: 'un2', scene: 'unsafe', start: 187.5, end: 195,
      caption: 'The unsafe one is the naked complement: every tuple not in the relation.',
      narration: 'Option C is the expression t such that not t in R1. Nothing binds t. The answer is every tuple over the domain that is not in R1, so when the domain grows by a value, the answer grows by every tuple built from that value. This is the textbook unsafe expression.',
      detail: 'It is worth seeing why the definition catches it: the values in the answer are not values of dom of P, because the fresh value appears in no relation the formula mentions. The definition and the growth test agree.',
      keyword: 'nothing binds t',
      trap: 'Reading not t in R1 as a harmless filter. A filter needs a universe to filter from, and here the universe is the domain, not a relation.'
    },
    {
      id: 'un3', scene: 'unsafe', start: 195, end: 202.5,
      caption: 'The other three each bind the output value to a relation.',
      narration: 'Options A, B and D each contain a positive atom that ties t of A to a value appearing in R1 or R2. Once the output attribute is tied to stored values, no fresh value can enter the answer, and the growth test leaves the size unchanged. That is the whole difference.',
      detail: 'Option B is the interesting one, and it is safe only for this instance: its universal quantifier is vacuous unless R1 contains the constant x. The page evaluates a variant of the instance where R1 has no x, and there the same expression grows, which is the trap worth remembering.',
      keyword: 'each binds the output value',
      trap: 'Assuming a vacuous universal quantifier is always safe. Vacuity is what makes a universal quantifier true of everything, and "everything" is not finite.'
    },
    {
      id: 'un4', scene: 'unsafe', start: 202.5, end: 210,
      caption: 'Answer C, and the reason is the growth, not the syntax.',
      narration: 'The published key is C. The reason to give in an exam is the one just computed: the answer changes when the domain grows, so the expression has no finite answer independent of the universe. A, B and D keep the same answer on both domains.',
      detail: 'This is the first of the two previous-year items in the lesson, and it is a one-mark item whose answer is settled in a few seconds once the growth test is a habit rather than a derivation.',
      keyword: 'the reason is the growth',
      trap: 'Answering "C because it has a negation" when B also contains a negation. The negation is not the defect; the unbound output is.'
    },

    /* ---------------- scene 8: vacuous ---------------- */
    {
      id: 'va1', scene: 'vacuous', start: 210, end: 217.5,
      caption: 'A for-all over an empty set of courses is true, so it is satisfied by everyone.',
      narration: 'Take the query "students who have taken every Biology course", with a course relation that offers no Biology course at all. For every course, if it is Biology then the student took it. With no Biology course, the condition inside is never triggered, so the statement is true of every student and of every non-student.',
      detail: 'This is vacuous truth, and it is not a quirk of the notation: it is the definition of implication with a false antecedent, which the page also checks. The consequence for calculus is that the answer is no longer restricted to students.',
      keyword: 'true of everyone',
      trap: 'Believing the query is wrong. The query is correct as written; the answer is simply not the one the English sentence suggests.'
    },
    {
      id: 'va2', scene: 'vacuous', start: 217.5, end: 225,
      caption: 'With no Biology course the naive expression returns every value the domain allows.',
      narration: 'On this instance the naive expression returns one row for every value in the domain, because nothing ties the answer to the enrolment relation. The page prints the size: the whole domain, not the students. That is unsafe behaviour arriving through a vacuous quantifier rather than through a naked negation.',
      detail: 'The growth test catches it for the same reason it caught the complement: the answer contains values that no relation in the formula stores. A question about safety can therefore be answered without knowing which of the two traps produced the defect.',
      keyword: 'the whole domain, not the students',
      trap: 'Judging safety by whether the formula looks like a query about students. The formula must bind its output; the English gloss does not bind anything.'
    },
    {
      id: 'va3', scene: 'vacuous', start: 225, end: 232.5,
      caption: 'One existential over the enrolment relation fixes it: the answer is then just students.',
      narration: 'The repair is to add a conjunct that ties the output to a stored value: there exists an enrolment with this student. Now the answer is a subset of the students in the enrolment relation, the fresh value cannot enter, and the answer has the same size on both domains. This is exactly the repair the textbook gives for its "all Biology courses" query.',
      detail: 'The general rule follows: every free variable of the answer must appear in at least one positive atom, and every universal quantifier should be guarded so that a false antecedent cannot make it vacuous in an unbounded way.',
      keyword: 'tie the output to a stored value',
      trap: 'Adding the existential outside the quantifier but still leaving a second free variable unbound. Each output attribute needs its own binder.'
    },
    {
      id: 'va4', scene: 'vacuous', start: 232.5, end: 240,
      caption: 'GATE 2017 Set 1 Q41 asks exactly this; the published key is all three.',
      narration: 'The 2017 paper showed three expressions over EMP and DEPT and asked which are safe. The published key is that all three are. The community discussion around that item is exactly the argument this scene has just made: in the first two, the department id of the answer is compared but never positively bound, and readers disagree about whether the comparison is enough.',
      detail: 'This page states the key and states its own computation separately, because they are different claims. The key is what earns marks; the computation is what the growth test says, and the two are reported side by side rather than merged.',
      keyword: 'the published key is all three',
      trap: 'Overruling a published key in an exam answer. Answer the key, and know why the strict test may disagree.'
    },

    /* ---------------- scene 9: power ---------------- */
    {
      id: 'po1', scene: 'power', start: 240, end: 247.5,
      caption: 'Codd: the basic algebra, safe tuple calculus and safe domain calculus are one language.',
      narration: 'The central theorem of the topic is an equality of three languages: the basic relational algebra with selection, projection, product, union, difference and renaming; the tuple calculus restricted to safe expressions; and the domain calculus restricted to safe expressions. Each can express exactly what the others can.',
      detail: 'This is Codd\'s relational completeness result, and it is the answer to GATE CSE 2006\'s one-mark question, whose four options were the three subsets and the single language. The page records the key as D, all three.',
      keyword: 'one language, three notations',
      trap: 'Dropping the word safe. Unsafe tuple calculus is strictly more expressive than the algebra, which is why the restriction is part of the statement.'
    },
    {
      id: 'po2', scene: 'power', start: 247.5, end: 255,
      caption: 'Same power means a translation exists in both directions.',
      narration: 'The theorem has a practical form. Every algebra expression can be written as a safe calculus expression, by turning each operator into an atom and each join into a shared variable. Every safe calculus expression can be written in the algebra, by eliminating quantifiers one at a time.',
      detail: 'The forward direction is the one exam questions use, and the four mappings are worth knowing by heart: selection becomes a conjunct, projection becomes a free variable, product becomes two membership atoms, and a join becomes one shared variable.',
      keyword: 'translation in both directions',
      trap: 'Expecting a short translation for every query. The reverse direction can blow up in size even when the answer is small.'
    },
    {
      id: 'po3', scene: 'power', start: 255, end: 262.5,
      caption: 'Reachability is the standard counterexample: fixed quantifier depth cannot follow an unbounded chain.',
      narration: 'What the three languages cannot do is as examinable as what they can. Transitive closure, "there is a path from u to w of any length", is not expressible, because a calculus expression has a fixed number of quantifiers and a chain can be longer than that number of hops.',
      detail: 'The page makes this concrete rather than quoting it. It takes a chain of nodes with an edge relation, writes the expression with two nested existentials, and counts how many reachable pairs it finds as the chain gets longer.',
      keyword: 'a fixed number of quantifiers',
      trap: 'Writing a query with dots meaning "and so on". A calculus expression has no ellipsis; recursion is outside the language.'
    },
    {
      id: 'po4', scene: 'power', start: 262.5, end: 270,
      caption: 'Measured: depth two finds every path up to two hops and misses the rest.',
      narration: 'On a three-node chain the two-hop expression is exact: every reachable pair is at distance one or two. On a five-node chain there are ten reachable pairs and the expression finds seven, missing the three pairs that need three hops. Add a node and the gap widens, which is the failure of fixed depth stated as a measurement.',
      detail: 'The general form is the derivation: the number of reachable pairs on a chain of n nodes is n times n minus one over two, and the number found by depth k is the number of pairs at distance at most k. The measurement is a check on the derivation, not a substitute for it.',
      keyword: 'seven of ten',
      trap: 'Concluding that reachability needs a more powerful quantifier. It needs recursion, which is a different construct, and SQL gets it through a recursive query rather than through calculus.'
    },

    /* ---------------- scene 10: procedure ---------------- */
    {
      id: 'pr1', scene: 'procedure', start: 270, end: 277.5,
      caption: 'Four steps: bound the output, count the quantifiers, check the polarity, test the domain.',
      narration: 'For any calculus question, four steps. Find the free variables and check that a positive atom binds each one. Then find the quantifiers and decide which shape the query is: a join or a "for every". Then look at the polarity, because a negation in front of an unbound atom is the classic defect. Then test the domain by adding a fresh value.',
      detail: 'The steps are ordered by cost: the first two take seconds and settle most questions, the third settles the safety questions, and the fourth is the check that catches what the first three missed.',
      keyword: 'four steps',
      trap: 'Starting with the fourth step and running out of time. The first step decides the schema of the answer, which is half the marks in an equivalence question.'
    },
    {
      id: 'pr2', scene: 'procedure', start: 277.5, end: 285,
      caption: 'The counts: the domain to the power of the arity bounds every answer.',
      narration: 'Two counts are worth carrying. A tuple expression of arity n has at most d to the n candidate tuples, where d is the size of the domain, so no safe answer can be larger than that. And a safe expression returns the same set on every domain that contains its own domain, which is what makes the growth test conclusive.',
      detail: 'The first count is a sanity bound that catches arithmetic slips in a numerical question; the second is the definition restated. Both are printed under the canvas for the instance used in the lesson.',
      keyword: 'd to the n',
      trap: 'Reporting an answer larger than the candidate bound, which happens when rows are counted with duplicates or the arity is taken from the wrong relation.'
    },
    {
      id: 'pr3', scene: 'procedure', start: 285, end: 292.5,
      caption: 'Three traps: vacuous truth, an unbound output, and a negated unbound atom.',
      narration: 'Three traps. A universal quantifier over an empty relation is true, which makes the query answer everything. An output attribute that no positive atom binds is unbound, and the answer then depends on the universe. And a negated atom over an unbound variable is the naked complement, which is the same defect with a shorter formula.',
      detail: 'All three are the same underlying problem seen from three angles, and all three are caught by the growth test. Knowing that they are one problem is worth more than memorising three separate warnings.',
      keyword: 'one problem, three faces',
      trap: 'Fixing a vacuous quantifier by adding a condition inside it. The repair must bind the output, so it belongs outside, as a conjunct on the answer tuple.'
    },
    {
      id: 'pr4', scene: 'procedure', start: 292.5, end: 300,
      caption: 'Safety is the price of saying what you want instead of how to get it.',
      narration: 'The sentence to keep: calculus lets you describe the answer instead of computing it, and safety is the price of that freedom. A safe expression is exactly one whose answer depends only on the stored data, and that is why the safe calculi are the same language as the algebra.',
      detail: 'That sentence answers the equivalence questions, the safety questions and the expressive-power questions, and it tells you which of the three traps a wrong option has fallen into.',
      keyword: 'safety is the price',
      trap: 'Treating safety as an advanced topic to skip. It is one definition and one test, and it decides a mark in most papers that ask about calculus at all.'
    }
  ]
};
