# Relational Calculus: Safety and Expressive Power — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/relational-calculus-and-safety/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Two ways to ask one question

*0:00 – 0:30 · objective: Separate a language that says how to compute an answer from one that says what the answer must satisfy, and read the set-former {t | P(t)} as the second kind.*

**0:00–0:07** — Two languages answer the same question. Relational algebra gives a recipe: take these rows, keep those, join with that. Relational calculus gives a description: the set of all tuples that satisfy a condition. Both return the same relation, and that is the point of the subject.

> Caption: Algebra says how to compute the answer; calculus says what the answer must satisfy.

Exam-trap caption mode adds: *A calculus expression is not a program with a hidden loop order. It denotes a set, and a set has no order, so "which row is read first" is never a question about it.*

**0:07–0:15** — The syntax is one brace, a tuple variable, a vertical bar, and a formula. Read it aloud as "the set of tuples t such that P of t". The tuple variable t is the answer being described; the formula says which ones qualify.

> Caption: A tuple calculus expression is a set former: the tuples t such that the condition holds.

Exam-trap caption mode adds: *Reading the bar as "such that t is in P". P is a formula about t, not a relation, and t need not be in any relation at all.*

**0:15–0:22** — Because the condition is a formula, every question about a calculus expression is a question about truth: is there a witness, is there a counterexample, does the condition hold for every element of a relation. That is why the marks in this topic are about quantifiers and about safety, not about tracing a loop.

> Caption: The condition is a logical formula, so the question becomes truth, not order of steps.

Exam-trap caption mode adds: *Assuming the formula is evaluated left to right with a short circuit that matters. Truth does not depend on evaluation order; only cost does.*

**0:22–0:30** — Here is GATE CSE 1999 Q1.19 as the smallest possible example. The calculus says: tuples t in r with t of A equal to 10 and t of B equal to 20. The algebra says: select A equals 10 and B equals 20. Both return the same one tuple, and the page computes both.

> Caption: Same question, two notations: the algebra keeps the rows with A = 10 and B = 20.

Exam-trap caption mode adds: *Conjunction maps to intersection of two selections, not to their union. Union is disjunction, and the two words are swapped often under time pressure.*

## Scene 2. The three atoms, and free against bound

*0:30 – 1:00 · objective: Name the only three atoms a formula may contain, close them under five connectives and two quantifiers, and say which variables the answer tuple is built from.*

**0:30–0:37** — A formula is built from exactly three kinds of atom. First, t is in r: a tuple variable belongs to a relation. Second, t of A equals u of B: two attribute values compared. Third, t of A equals a constant. Nothing else is an atom.

> Caption: Three atoms only: membership, attribute against attribute, attribute against a constant.

Exam-trap caption mode adds: *Writing t is not in r as an atom. The notation deliberately has no such atom: negation is applied to a formula, and that is where the trouble starts.*

**0:37–0:45** — A variable is bound when a quantifier captures it, and free otherwise. The free variables are what the answer tuple is made of. In the expression on the right, t is free and u is bound: the answer is a set of t values, and u exists only inside the condition.

> Caption: Free variables build the answer; bound variables are internal to the condition.

Exam-trap caption mode adds: *Leaving an output attribute unbound by any membership atom. That is not a syntax error, and it is exactly what makes an expression unsafe.*

**0:45–0:52** — Tuple calculus names an attribute: t of A. Domain calculus uses position: the first component of the tuple is the first attribute of the relation. Both are ways of saying which column is meant, and the two notations are otherwise the same logic.

> Caption: t of A picks an attribute by name; a domain variable is bound by position instead.

Exam-trap caption mode adds: *Mixing the two conventions inside one expression. An expression either names attributes or indexes positions; a hybrid is not a well-formed query.*

**0:52–1:00** — From atoms, formulae are built by five connectives and two quantifiers, and that is the whole grammar. Because implication is defined as not-p or q, and for-all is defined as not-exists-not, the language has far fewer primitive ideas than it appears to have.

> Caption: Formulae close under not, and, or, implies, and the two quantifiers.

Exam-trap caption mode adds: *Treating implies as a connective with its own truth table that differs from not-p or q. It does not; the two are the same formula.*

## Scene 3. Exists is a scan; for-all is a failed search

*1:00 – 1:30 · objective: See ∃ as a scan that stops at a witness and ∀ as ¬∃¬, and know which of the two carries a join and which carries a "for every" requirement.*

**1:00–1:07** — An existential quantifier bounded by a relation is a scan with early exit. To decide whether some tuple of R2 has A equal to 3, you look until you find one. The scan is finite because the relation is finite, and that is the whole reason bounded quantifiers are safe.

> Caption: Exists scans the relation and stops at the first witness.

Exam-trap caption mode adds: *Thinking two existential quantifiers over the same relation must use two different tuples. They may use the same tuple unless the formula says otherwise.*

**1:07–1:15** — A universal quantifier bounded by a relation is a search for a counterexample. If no counterexample exists, the universal statement is true. Written out, for-all u in R of P is the same as not exists u in R of not P, and the page checks that identity by evaluating both on every tuple of two domains.

> Caption: For-all is not-exists-not: a search for a counterexample that never succeeds.

Exam-trap caption mode adds: *Reading for-all as "there are many". A universal statement over an empty relation is true, and that vacuous truth is the source of the next trap in this lesson.*

**1:15–1:22** — Two shapes cover most exam questions. A join is an existential over the second relation, with an equality between the two tuple variables. A "for every one of these" requirement is a universal quantifier whose body contains an existential: for every course, there exists an enrolment.

> Caption: A join is an exists over the second relation; "for all" is a for-all with an exists inside.

Exam-trap caption mode adds: *Writing the "for every" shape with the quantifiers in the other order. For every course there exists a student, and there exists a student such that for every course, are different statements.*

**1:22–1:30** — The page does not take the identity on trust. It evaluates the two forms on every tuple of the active domain, on two different domains, and reports the number of disagreements, which is zero. That number is printed on the canvas beside the check count.

> Caption: Measured: for-all and not-exists-not agree on every tuple tested.

Exam-trap caption mode adds: *Believing a check that only compares sizes. Two different answer sets can have the same cardinality, so equivalence must compare the sets.*

## Scene 4. A shared variable is a join: GATE 2026 Set 1 Q43

*1:30 – 2:00 · objective: Translate the domain-calculus expression of the 2026 paper into relational algebra by matching each variable to a position, and decide all four options on a computed instance.*

**1:30–1:37** — The 2026 paper writes a domain-calculus expression over two relations, R of P and Q, and S of X and Y. The variable v appears in both membership atoms, so it is the same value in both: v is Q in R and X in S, and that equality is the join condition.

> Caption: The shared variable v is the join: second attribute of R, first attribute of S.

Exam-trap caption mode adds: *Joining on the position that looks symmetrical rather than the one the variable occupies. The shared variable sits in the second position of R and the first of S, and those are the two columns to equate.*

**1:37–1:45** — The answer tuple is the single value u, and u appears only as the first component of R. So the answer is the projection onto P of the join. Both relations contribute a condition, and only R contributes a column to the answer.

> Caption: The free variable u is the first attribute of R, so the answer is a projection of P.

Exam-trap caption mode adds: *Projecting onto the join attribute instead of the answer attribute. The join column is v, and v is not free, so it never appears in the answer.*

**1:45–1:52** — On this instance R holds three pairs and S holds three. Only two values of u have a partner: u equals 1 pairs with v equals 2, which is in S as a first component, and u equals 2 pairs with v equals 3, which is also there. The third pair has v equal to 4, which S does not contain.

> Caption: Computed on the instance: u takes the values 1 and 2, and nothing else.

Exam-trap caption mode adds: *Counting the join pairs rather than the distinct values of the free variable. The answer is a set of u values, so two pairs with the same u give one row.*

**1:52–2:00** — The official key is B: project P of S joined with R on S of X equal to R of Q. Option A joins P with X, option C joins P with Y, and option D joins Y with Q. Each of those equates two columns that never share a variable, and the page evaluates all four to show they return different sets here.

> Caption: Option B matches; A, C and D each join on the wrong pair of columns.

Exam-trap caption mode adds: *Assuming a natural join was intended. The expression names no common attribute, so the join is a theta join on the two positions the variable occupies.*

## Scene 5. Domain calculus: variables that hold values

*2:00 – 2:30 · objective: Read {<x1,...,xn> | P} with positional membership, write the same query in both calculi, and accept the computed fact that the two answers are equal.*

**2:00–2:07** — In domain calculus there is no tuple variable. The variables are domain variables, each holding one value, and the answer is an ordered tuple of them. The braces hold an angle-bracketed list instead of a single letter.

> Caption: Domain calculus swaps tuples for values: the answer is an ordered tuple of values.

Exam-trap caption mode adds: *Believing the change of notation changes the power of the language. It does not, once both are restricted to safe expressions, and that is the theorem of scene nine.*

**2:07–2:15** — The membership atom lists the components in the relation's attribute order. So the angle-bracket u comma v in R means u is P and v is Q, and the angle-bracket v comma w in S means v is X and w is Y. One shared letter, one equality.

> Caption: Membership is positional: angle-bracket u, v in R means u is the first attribute.

Exam-trap caption mode adds: *Swapping two components of the same type. Nothing complains, and the query silently answers a different question.*

**2:15–2:22** — Written as a tuple expression and written as a domain expression, the query returns the same set: one and two. The page evaluates both and compares the sets, and this is one of the model checks reported under the canvas.

> Caption: The same query in both calculi returns the same two values here.

Exam-trap caption mode adds: *Comparing only the number of rows. Equality of answer sets is the claim; equal cardinality is not evidence for it.*

**2:22–2:30** — Domain calculus is the theoretical basis of query-by-example, where you fill in example rows and the system infers the query. It is also the notation GATE used in 2026 for this item, which is why the notation is worth reading even if a paper usually writes tuple calculus.

> Caption: This is the notation of query-by-example, and the notation the 2026 paper used.

Exam-trap caption mode adds: *Refusing a question because it uses the notation you did not revise. The logic is identical; only the binding convention differs.*

## Scene 6. Why the domain must be finite

*2:30 – 3:00 · objective: State dom(P), state what safety forbids, and see the test this page uses: enlarge the ambient domain by one value nobody mentions and watch whether the answer moves.*

**2:30–2:37** — Here is the difficulty the notation creates. A tuple variable ranges over tuples of values, and nothing in the syntax says which values. If the values may be anything at all, the answer to "all tuples not in r" is infinite, and an infinite relation is not something a database can return.

> Caption: A calculus expression ranges over every tuple the domain allows, so an infinite domain means an infinite answer.

Exam-trap caption mode adds: *Thinking this is a practical limit of storage. It is a definitional problem: the expression would have no well-defined finite answer.*

**2:37–2:45** — So the notation is given a finite universe. The domain of a formula P, written dom of P, is the set of values that appear explicitly in P, plus every value in every relation P mentions. It is finite, because a formula names finitely many relations and constants.

> Caption: The domain of a formula is its constants plus every value in the relations it names.

Exam-trap caption mode adds: *Including values from relations the formula does not mention. The domain is defined by what the formula references, not by the whole database.*

**2:45–2:52** — An expression is safe when every value that appears in its answer is a value of dom of P. That is the whole definition for the tuple calculus. It rules out the complement of a relation, because a tuple outside r may hold a value that appears nowhere in r.

> Caption: An expression is safe when every value in its answer comes from that domain.

Exam-trap caption mode adds: *Checking safety on the instance in front of you. Safety is a claim about all instances, so a single instance where the answer happens to be finite is not a proof.*

**2:52–3:00** — The operational form is a growth test. Evaluate the expression over dom of P. Then add one fresh value that appears in no relation and in no constant, and evaluate again. A safe expression returns exactly the same set; an unsafe one grows, because the new value is now allowed to appear in its answer.

> Caption: The test used here: add a value nobody mentions, and see whether the answer changes.

Exam-trap caption mode adds: *Adding a value that already appears somewhere in the query. The test only has force when the added value is genuinely fresh, or the answer could not change for the wrong reason.*

## Scene 7. GATE CSE 2001: which expression is not safe

*3:00 – 3:30 · objective: Decide all four options of GATE CSE 2001 Q2.24 by the growth test rather than by pattern, and say exactly which atom fails to bind the output attribute.*

**3:00–3:07** — GATE CSE 2001 asked which of four calculus expressions is not safe. The page takes the four as written, evaluates each over the domain of the instance and then over the domain plus one fresh value, and reports the two sizes. Exactly one row in this table grows.

> Caption: Four expressions, one instance, two domains: only one answer moves.

Exam-trap caption mode adds: *Deciding by counting negations. A negation is harmless when the atom it negates is already bound by a positive atom elsewhere in the formula.*

**3:07–3:15** — Option C is the expression t such that not t in R1. Nothing binds t. The answer is every tuple over the domain that is not in R1, so when the domain grows by a value, the answer grows by every tuple built from that value. This is the textbook unsafe expression.

> Caption: The unsafe one is the naked complement: every tuple not in the relation.

Exam-trap caption mode adds: *Reading not t in R1 as a harmless filter. A filter needs a universe to filter from, and here the universe is the domain, not a relation.*

**3:15–3:22** — Options A, B and D each contain a positive atom that ties t of A to a value appearing in R1 or R2. Once the output attribute is tied to stored values, no fresh value can enter the answer, and the growth test leaves the size unchanged. That is the whole difference.

> Caption: The other three each bind the output value to a relation.

Exam-trap caption mode adds: *Assuming a vacuous universal quantifier is always safe. Vacuity is what makes a universal quantifier true of everything, and "everything" is not finite.*

**3:22–3:30** — The published key is C. The reason to give in an exam is the one just computed: the answer changes when the domain grows, so the expression has no finite answer independent of the universe. A, B and D keep the same answer on both domains.

> Caption: Answer C, and the reason is the growth, not the syntax.

Exam-trap caption mode adds: *Answering "C because it has a negation" when B also contains a negation. The negation is not the defect; the unbound output is.*

## Scene 8. The vacuous for-all, and the 2017 question

*3:30 – 4:00 · objective: See a true-for-everything universal quantifier produce an unbounded answer, watch one existential repair it, and place GATE CSE 2017 Set 1 Q41 inside that trap.*

**3:30–3:37** — Take the query "students who have taken every Biology course", with a course relation that offers no Biology course at all. For every course, if it is Biology then the student took it. With no Biology course, the condition inside is never triggered, so the statement is true of every student and of every non-student.

> Caption: A for-all over an empty set of courses is true, so it is satisfied by everyone.

Exam-trap caption mode adds: *Believing the query is wrong. The query is correct as written; the answer is simply not the one the English sentence suggests.*

**3:37–3:45** — On this instance the naive expression returns one row for every value in the domain, because nothing ties the answer to the enrolment relation. The page prints the size: the whole domain, not the students. That is unsafe behaviour arriving through a vacuous quantifier rather than through a naked negation.

> Caption: With no Biology course the naive expression returns every value the domain allows.

Exam-trap caption mode adds: *Judging safety by whether the formula looks like a query about students. The formula must bind its output; the English gloss does not bind anything.*

**3:45–3:52** — The repair is to add a conjunct that ties the output to a stored value: there exists an enrolment with this student. Now the answer is a subset of the students in the enrolment relation, the fresh value cannot enter, and the answer has the same size on both domains. This is exactly the repair the textbook gives for its "all Biology courses" query.

> Caption: One existential over the enrolment relation fixes it: the answer is then just students.

Exam-trap caption mode adds: *Adding the existential outside the quantifier but still leaving a second free variable unbound. Each output attribute needs its own binder.*

**3:52–4:00** — The 2017 paper showed three expressions over EMP and DEPT and asked which are safe. The published key is that all three are. The community discussion around that item is exactly the argument this scene has just made: in the first two, the department id of the answer is compared but never positively bound, and readers disagree about whether the comparison is enough.

> Caption: GATE 2017 Set 1 Q41 asks exactly this; the published key is all three.

Exam-trap caption mode adds: *Overruling a published key in an exam answer. Answer the key, and know why the strict test may disagree.*

## Scene 9. Expressive power, and where it stops

*4:00 – 4:30 · objective: State Codd's equivalence of the basic algebra, safe TRC and safe DRC, and see the measured failure of a fixed quantifier depth on an unbounded chain.*

**4:00–4:07** — The central theorem of the topic is an equality of three languages: the basic relational algebra with selection, projection, product, union, difference and renaming; the tuple calculus restricted to safe expressions; and the domain calculus restricted to safe expressions. Each can express exactly what the others can.

> Caption: Codd: the basic algebra, safe tuple calculus and safe domain calculus are one language.

Exam-trap caption mode adds: *Dropping the word safe. Unsafe tuple calculus is strictly more expressive than the algebra, which is why the restriction is part of the statement.*

**4:07–4:15** — The theorem has a practical form. Every algebra expression can be written as a safe calculus expression, by turning each operator into an atom and each join into a shared variable. Every safe calculus expression can be written in the algebra, by eliminating quantifiers one at a time.

> Caption: Same power means a translation exists in both directions.

Exam-trap caption mode adds: *Expecting a short translation for every query. The reverse direction can blow up in size even when the answer is small.*

**4:15–4:22** — What the three languages cannot do is as examinable as what they can. Transitive closure, "there is a path from u to w of any length", is not expressible, because a calculus expression has a fixed number of quantifiers and a chain can be longer than that number of hops.

> Caption: Reachability is the standard counterexample: fixed quantifier depth cannot follow an unbounded chain.

Exam-trap caption mode adds: *Writing a query with dots meaning "and so on". A calculus expression has no ellipsis; recursion is outside the language.*

**4:22–4:30** — On a three-node chain the two-hop expression is exact: every reachable pair is at distance one or two. On a five-node chain there are ten reachable pairs and the expression finds seven, missing the three pairs that need three hops. Add a node and the gap widens, which is the failure of fixed depth stated as a measurement.

> Caption: Measured: depth two finds every path up to two hops and misses the rest.

Exam-trap caption mode adds: *Concluding that reachability needs a more powerful quantifier. It needs recursion, which is a different construct, and SQL gets it through a recursive query rather than through calculus.*

## Scene 10. Counts, reading procedure and traps

*4:30 – 5:00 · objective: Leave with a four-step reading procedure for any calculus question, the candidate-count bound, and the three traps that lose marks.*

**4:30–4:37** — For any calculus question, four steps. Find the free variables and check that a positive atom binds each one. Then find the quantifiers and decide which shape the query is: a join or a "for every". Then look at the polarity, because a negation in front of an unbound atom is the classic defect. Then test the domain by adding a fresh value.

> Caption: Four steps: bound the output, count the quantifiers, check the polarity, test the domain.

Exam-trap caption mode adds: *Starting with the fourth step and running out of time. The first step decides the schema of the answer, which is half the marks in an equivalence question.*

**4:37–4:45** — Two counts are worth carrying. A tuple expression of arity n has at most d to the n candidate tuples, where d is the size of the domain, so no safe answer can be larger than that. And a safe expression returns the same set on every domain that contains its own domain, which is what makes the growth test conclusive.

> Caption: The counts: the domain to the power of the arity bounds every answer.

Exam-trap caption mode adds: *Reporting an answer larger than the candidate bound, which happens when rows are counted with duplicates or the arity is taken from the wrong relation.*

**4:45–4:52** — Three traps. A universal quantifier over an empty relation is true, which makes the query answer everything. An output attribute that no positive atom binds is unbound, and the answer then depends on the universe. And a negated atom over an unbound variable is the naked complement, which is the same defect with a shorter formula.

> Caption: Three traps: vacuous truth, an unbound output, and a negated unbound atom.

Exam-trap caption mode adds: *Fixing a vacuous quantifier by adding a condition inside it. The repair must bind the output, so it belongs outside, as a conjunct on the answer tuple.*

**4:52–5:00** — The sentence to keep: calculus lets you describe the answer instead of computing it, and safety is the price of that freedom. A safe expression is exactly one whose answer depends only on the stored data, and that is why the safe calculi are the same language as the algebra.

> Caption: Safety is the price of saying what you want instead of how to get it.

Exam-trap caption mode adds: *Treating safety as an advanced topic to skip. It is one definition and one test, and it decides a mark in most papers that ask about calculus at all.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
