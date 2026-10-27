# Functional Dependencies, Normal Forms and Decomposition — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/functional-dependencies-and-normal-forms/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A functional dependency is a promise about every legal instance

*0:00 – 0:30 · objective: State what X -> Y asserts, separate a constraint from a coincidence in one printed table, and fix the direction of the arrow.*

**0:00–0:08** — A functional dependency, written X arrow Y, is a rule about pairs of rows. If two rows agree on all of X, they must agree on all of Y. Nothing else is promised.

> Caption: A functional dependency X -> Y says: whenever two rows agree on every attribute of X, they must also agree on every attribute of Y.

Exam-trap caption mode adds: *The arrow points one way only. X -> Y never lets you conclude Y -> X.*

**0:08–0:15** — Two rows, both with A equal to one. Because A determines B, both must carry the same B. The reverse is not available: equal B values say nothing about A.

> Caption: Here the two rows agree on A, so the dependency A -> B forces them to agree on B as well. Agreeing on B would not have forced anything about A.

Exam-trap caption mode adds: *Equal values on the right-hand side are not evidence for the dependency. Only the left-hand side constrains.*

**0:15–0:22** — A table is one instance. It can happen to satisfy a dependency without the dependency being true. The dependency is a statement about every instance the schema allows.

> Caption: One printed table can satisfy A -> B by accident. The dependency is the claim that no legal instance can ever break it.

Exam-trap caption mode adds: *A single table that happens to fit is not a proof, and a single table that breaks it is a refutation.*

**0:22–0:30** — This is why every question of this kind hands you the dependency set. You reason from the set. Data appears only to refute a candidate dependency, never to prove one.

> Caption: So a dependency is a constraint you are given, not a pattern you discover. Data can refute an FD; data can never establish one.

Exam-trap caption mode adds: *GATE 2006 asked which FD is NOT implied by a given set. Answering it from the printed rows instead of from the set loses the mark.*

## Scene 2. Three rules generate every consequence of a set of FDs

*0:30 – 1:00 · objective: Use reflexivity, augmentation and transitivity to derive an FD that was never written down, and name the three shortcuts they imply.*

**0:30–0:38** — Rule one is reflexivity. If Y is contained in X, then X arrow Y is true in every relation whatsoever. These are the trivial dependencies, and they are the base case for every derivation.

> Caption: Reflexivity: if every attribute of Y already sits inside X, then X -> Y holds with no help from the dependency set.

Exam-trap caption mode adds: *Trivial dependencies still count when you test a normal form: skip them, or every schema looks like it violates something.*

**0:38–0:45** — Rule two is augmentation. Adding the same attributes to both sides preserves truth. This is the rule that lets a dependency survive inside a larger fragment.

> Caption: Augmentation: from X -> Y you may add the same attribute set Z to both sides, getting XZ -> YZ.

Exam-trap caption mode adds: *Augmentation adds to both sides. Adding only to the left is a different and invalid move.*

**0:45–0:52** — Rule three is transitivity. If X determines Y and Y determines Z, then X determines Z. Almost every implied dependency in an exam question is found by chaining these three rules.

> Caption: Transitivity: X -> Y together with Y -> Z gives X -> Z. Chaining is how a dependency set implies dependencies nobody wrote down.

Exam-trap caption mode adds: *Transitivity needs the middle set to match exactly, or to be reachable by augmentation. A near miss is not a chain.*

**0:52–1:00** — Union merges two dependencies with the same left side. Decomposition splits a right side into single attributes. Pseudotransitivity chains through part of a left side. All three are theorems, not extra assumptions.

> Caption: Three useful shortcuts follow: union, decomposition and pseudotransitivity. Each one is proved from the three axioms, so using it is never a leap.

Exam-trap caption mode adds: *Union and decomposition are safe on the right side. Splitting the left side is not: AB -> C does not give A -> C.*

## Scene 3. Closure: what one attribute set forces

*1:00 – 1:30 · objective: Run the closure algorithm on R(A,B,C,D,E) with AB->C, BC->D, C->E and watch AB grow to all five attributes in three passes.*

**1:00–1:08** — The closure of an attribute set X is everything X forces. Begin with X and add nothing else yet. The schema is five attributes with three dependencies, the one GATE 2022 used for its superkey question.

> Caption: Start the closure of AB with AB itself, on R(A,B,C,D,E) with AB -> C, BC -> D and C -> E. This is the schema from GATE CSE 2022.

Exam-trap caption mode adds: *The closure starts with X inside it. Forgetting that makes every closure one attribute short.*

**1:08–1:16** — Scan the dependencies. AB arrow C has its left side inside what we hold, so C joins the set. We now hold A, B and C.

> Caption: Pass one: AB -> C applies, because AB is already present. The closure grows to ABC.

Exam-trap caption mode adds: *A dependency fires only when its whole left side is present. A alone does not fire AB -> C.*

**1:16–1:23** — Second pass. B and C are both held, so BC arrow D applies and D is added. Holding C alone would not have been enough.

> Caption: Pass two: BC -> D now fires, because both B and C are present. The closure is ABCD.

Exam-trap caption mode adds: *Order of passes does not matter. Repeat until a whole pass adds nothing; stopping early loses attributes.*

**1:23–1:30** — Third pass adds E. The closure is now the entire schema, which is exactly the definition of a superkey. A fourth pass adds nothing, so the computation stops.

> Caption: Pass three: C -> E fires. The closure is ABCDE, all five attributes, so AB is a superkey.

Exam-trap caption mode adds: *A superkey is not automatically a candidate key. AB still has to be shown minimal.*

## Scene 4. Candidate key, superkey, and the count

*1:30 – 2:00 · objective: Separate a superkey from a candidate key, enumerate the 32 subsets of five attributes, and compute the superkey count as a power of two.*

**1:30–1:37** — Two definitions, one inside the other. A superkey determines every attribute. A candidate key is a superkey with nothing removable: drop any attribute and the closure falls short.

> Caption: A superkey closes to all five attributes. A candidate key is a superkey that contains no smaller superkey.

Exam-trap caption mode adds: *Every candidate key is a superkey, but a table can have one candidate key and many superkeys.*

**1:37–1:44** — The model enumerates every subset and computes its closure. Only sets containing A and B can reach C, and through C reach D and E. So the superkeys are AB together with any choice from C, D and E.

> Caption: All 32 subsets of the five attributes are tested. The ones that close to ABCDE are exactly the ones that contain both A and B.

Exam-trap caption mode adds: *Subsets containing C but not B do reach E, yet never reach D or A. Partial progress is not a superkey.*

**1:44–1:52** — AB is the only minimal superkey, so it is the only candidate key. Every superkey is AB plus any subset of the remaining three attributes, which gives two cubed, eight. GATE 2022 asked for that number.

> Caption: Exactly one subset is minimal: AB. So the schema has one candidate key, and 2 to the power 3, that is 8, superkeys.

Exam-trap caption mode adds: *The exponent is the number of attributes outside the key, not the number of attributes in it.*

**1:52–2:00** — Check the tempting single attributes. E forces nothing. C forces E, so its closure is C and E. Neither is a key. Only AB is.

> Caption: E on its own is not a key: its closure is just E. C on its own gives CE. Neither reaches all five attributes.

Exam-trap caption mode adds: *A single attribute that appears on the right of many dependencies is often mistaken for a key. Compute the closure instead.*

## Scene 5. 1NF and 2NF: atomic values, and no partial dependency

*2:00 – 2:30 · objective: Reject a set-valued attribute at 1NF, and distinguish a partial dependency from a transitive one on two schemas from GATE 2018.*

**2:00–2:07** — First normal form is the weakest. Each cell holds one value, not a list. Schema I of GATE 2018 puts a set of courses in a single column, so it fails before any dependency is examined.

> Caption: First normal form asks only that every cell hold one atomic value. GATE 2018 Schema I stores a set of courses in one cell, so it is not even in 1NF.

Exam-trap caption mode adds: *A column whose values are sets is not a violation of 2NF or 3NF. It is a violation of 1NF, and the ladder stops there.*

**2:07–2:15** — Second normal form is about partial dependencies. A non-prime attribute may not depend on a proper subset of a key. In Schema IV the key is rollno together with courseid, and courseid alone determines credit.

> Caption: Second normal form forbids a non-prime attribute from depending on part of a candidate key. Schema IV has courseid -> credit, with key {rollno, courseid}.

Exam-trap caption mode adds: *The subset must be a proper subset of a candidate key. A left side that is not part of any key is a different defect.*

**2:15–2:23** — The dependency is partial, the right side is not prime, so 2NF fails. Schema IV stops at first normal form. GATE 2018 asked which schema was in 3NF but not BCNF, so this one is ruled out immediately.

> Caption: credit is non-prime and courseid is a proper subset of the key, so Schema IV is in 1NF only. That is the GATE 2018 answer for that schema.

Exam-trap caption mode adds: *Dropping the composite key and calling courseid the key hides the partial dependency. Find every candidate key first.*

**2:23–2:30** — Schema III looks similar and is one rung higher. Its key is rollno with courseid, and marks is in no key. So marks arrow grade is transitive, not partial. It passes 2NF and fails 3NF.

> Caption: Schema III has marks -> grade. marks is not part of any key at all, so this is a transitive dependency, not a partial one: Schema III reaches 2NF and stops.

Exam-trap caption mode adds: *Partial and transitive dependencies both cost a rung, but they fail different rungs. Name which one before you name the normal form.*

## Scene 6. 3NF: the prime-attribute exemption

*2:30 – 3:00 · objective: See the one clause that 3NF adds to BCNF, and use it to keep Schema II in 3NF while it still fails BCNF.*

**2:30–2:38** — Third normal form is BCNF with an exception. If the right side is prime, meaning it belongs to some candidate key, then a left side that is not a superkey is tolerated. That single clause is the whole difference between the two forms.

> Caption: Third normal form adds one escape clause to BCNF: a dependency X -> A is allowed even when X is not a superkey, provided A is a prime attribute.

Exam-trap caption mode adds: *The clause is about the right side only. A non-superkey left side with a non-prime right side fails 3NF as well.*

**2:38–2:46** — Two candidate keys here, because email with courseid also determines everything. That makes rollno a prime attribute. The dependency email arrow rollno has a left side that is not a superkey, but a prime right side.

> Caption: Schema II: rollno, courseid -> email, and email -> rollno. The candidate keys are {rollno, courseid} and {email, courseid}, so rollno is prime.

Exam-trap caption mode adds: *The second key is easy to miss. Without it, rollno looks non-prime and Schema II looks like a 2NF failure.*

**2:46–2:53** — One dependency, two verdicts. For 3NF the prime right side is enough. For BCNF nothing is enough except a superkey on the left. So Schema II is in third normal form and not in BCNF.

> Caption: So Schema II survives 3NF and fails BCNF on the same dependency. The exemption is the only thing keeping it at 3NF.

Exam-trap caption mode adds: *A schema in 3NF is not automatically in BCNF. The converse does hold: BCNF implies 3NF.*

**2:53–3:00** — Put the four schemas on the ladder and only one lands between third normal form and BCNF. Schema I never enters the ladder, Schema III stops at second, Schema IV at first.

> Caption: That is the answer to GATE 2018 Q42: Schema II is the one in 3NF but not BCNF. Schema III stops at 2NF and Schema IV at 1NF.

Exam-trap caption mode adds: *Reading the four schemas quickly, Schema IV looks like Schema II. The difference is whether the right side is prime.*

## Scene 7. BCNF: no exemption, and how to decompose to reach it

*3:00 – 3:30 · objective: Test BCNF on GATE 2004 studentPerformance, then split on the violating dependency and re-test both fragments.*

**3:00–3:08** — BCNF is the strict form. Take every non-trivial dependency and ask one question: is the left side a superkey. If the answer is yes for all of them, the schema is in BCNF. Nothing else is considered.

> Caption: BCNF deletes the exemption. Every non-trivial dependency must have a superkey on the left, with no exception for prime attributes.

Exam-trap caption mode adds: *Trivial dependencies are excluded. A dependency whose right side sits inside its left side never violates anything.*

**3:08–3:16** — Name with CourseNo determines Grade, and RollNo with CourseNo does too. Name and RollNo determine each other, which creates the second key. Three attributes are prime and Grade alone is not.

> Caption: GATE 2004 studentPerformance(Name, CourseNo, RollNo, Grade) has keys {Name, CourseNo} and {RollNo, CourseNo}. So Name, CourseNo and RollNo are prime, and Grade is not.

Exam-trap caption mode adds: *Grade looks prime because every row has one. Prime means part of a candidate key, not present in every row.*

**3:16–3:24** — Name arrow RollNo is the violating dependency. Third normal form forgives it because RollNo is prime. BCNF does not, because Name is not a superkey. The highest normal form is third.

> Caption: Name -> RollNo has a non-superkey on the left but a prime right side, so 3NF allows it and BCNF does not. The schema is in 3NF only.

Exam-trap caption mode adds: *The answer is 3NF, not BCNF, even though Name and RollNo determine each other. Mutual determination is not a superkey.*

**3:24–3:30** — The decomposition rule is mechanical. For a violating dependency, make one fragment from its left and right sides, and one from its left side plus all remaining attributes. Then test each fragment again, because a fragment can violate BCNF too.

> Caption: To reach BCNF, split on the violating dependency: one fragment holds its two sides, the other holds the left side plus everything left over. Both fragments are then re-tested.

Exam-trap caption mode adds: *The rule always removes the violation but does not always preserve the dependencies. Scene 9 shows a schema where it cannot.*

## Scene 8. Lossless join: the join must give back exactly r

*3:30 – 4:00 · objective: Join two fragments of a two-row instance, watch four rows appear, and state the condition that rules this out in advance.*

**3:30–3:38** — Here is a decomposition that looks natural: one fragment per dependency. A arrow B lives in AB and C arrow D lives in CD, so nothing is lost. But the fragments have nothing in common.

> Caption: GATE 2001: R(A,B,C,D) with A -> B and C -> D, decomposed into AB and CD. The two fragments share no attribute at all.

Exam-trap caption mode adds: *A decomposition that keeps every dependency can still be wrong. Preservation and losslessness are separate tests.*

**3:38–3:46** — Project r onto A, B, C and onto A, D. Each projection has two rows. Joining them pairs every row with every row on the shared attribute A, so two rows become four.

> Caption: Take a two-row instance, project it onto ABC and onto AD, then join the two results. The join has four rows, not two.

Exam-trap caption mode adds: *The join of two projections is always a superset of the original. The question is whether it is strictly larger.*

**3:46–3:54** — Both original rows are still there, so nothing was lost in that sense. But two spurious rows appeared. A lossy decomposition adds tuples that the constraints forbid, and that is the failure.

> Caption: Every original row survives, and two rows that never existed appear. That is what lossy means: r is a proper subset of the join, so information was invented.

Exam-trap caption mode adds: *Lossy does not mean rows disappeared. It means rows appeared. GATE 2005 asked exactly this, and the answer was that r is a subset of the join.*

**3:54–4:00** — For two fragments there is a shortcut. Take the attributes they share and compute the closure. If it contains all of one fragment, the join is lossless. Here they share nothing, so the closure is empty and the test fails at once.

> Caption: The two-fragment test: the join is lossless exactly when the shared attributes determine all of one fragment. Here the shared set is empty, so the test fails.

Exam-trap caption mode adds: *With three or more fragments there is no such shortcut. Use the chase, which is the same test generalised.*

## Scene 9. Dependency preservation, and the trade-off with BCNF

*4:00 – 4:30 · objective: Project a dependency set onto fragments, and see why one schema has no decomposition that is BCNF, lossless and dependency preserving at once.*

**4:00–4:08** — Project the dependency set onto each fragment: keep a dependency only if all of its attributes live in that fragment. The decomposition preserves the set when the union of those projections still implies every original dependency.

> Caption: A dependency is preserved when its left and right sides both fit inside one fragment, or when the fragments together still imply it.

Exam-trap caption mode adds: *A dependency whose attributes are split across two fragments is not automatically lost. It may still be implied by the union.*

**4:08–4:16** — Here the split works for preservation. AB arrow C sits inside ABC. C arrow A also sits inside ABC, because A is in that fragment. C arrow D sits inside CD. Every dependency has a home.

> Caption: GATE 2001: R(A,B,C,D) with AB -> C and C -> AD, split into ABC and CD. AB -> C fits in ABC, and C -> A does too, so everything survives.

Exam-trap caption mode adds: *It is tempting to stop here and call the decomposition good. Preservation is only one of three requirements.*

**4:16–4:24** — Fragment ABC inherits C arrow A, and C is not a superkey of ABC. To fix that you must split A away from C, and once you do, AB arrow C has no home. The model tested every partition and found no decomposition satisfying all three requirements.

> Caption: But ABC is not in BCNF: C -> A has a non-superkey on the left. The model enumerated all 14 partitions of ABCD, and none is BCNF, lossless and dependency preserving at once.

Exam-trap caption mode adds: *This is the schema GATE 2001 asked about. The answer is that no such decomposition exists, not that a clever one was missed.*

**4:24–4:30** — Third normal form synthesis always succeeds on both counts, at the cost of leaving some redundancy. BCNF removes more redundancy but can force a choice. Knowing which guarantee survives is what these questions test.

> Caption: So the three goals conflict. A 3NF decomposition always exists that is lossless and dependency preserving; a BCNF one need not. That trade-off is the examinable fact.

Exam-trap caption mode adds: *The theorem is about existence, not about every decomposition. A particular BCNF split can still be lossless and preserving.*

## Scene 10. The decision procedure, end to end

*4:30 – 5:00 · objective: Assemble closure, keys, minimal cover, the normal-form ladder and the two decomposition tests into one procedure that answers any question of this kind.*

**4:30–4:38** — Every question of this kind begins the same way. Closure gives you the keys. The keys give you the prime attributes. Almost every later answer depends on those two facts, so compute them before anything else.

> Caption: Step one: compute the closure of every candidate left side, and from the closures read off all candidate keys. Step two: mark the prime attributes.

Exam-trap caption mode adds: *Missing one candidate key makes an attribute look non-prime and moves the schema one rung down the ladder.*

**4:38–4:46** — A minimal cover has single attributes on the right and no redundant attributes or dependencies, so it is the shortest set of tests. Superkey on the left means BCNF. Non-superkey with a prime right side means 3NF. Non-superkey with a non-prime right side means at most 2NF, or 1NF if the left side is part of a key.

> Caption: Step three: reduce the set to a minimal cover, then ask of each dependency: is the left side a superkey, and is the right side prime. Those two answers place the schema on the ladder.

Exam-trap caption mode adds: *Testing the original set instead of a minimal cover can miss a violation hidden behind a redundant dependency.*

**4:46–4:54** — Once a decomposition is proposed, two independent tests decide it. The chase builds a tableau and looks for an all-distinguished row. The projection test checks that every original dependency is still implied. A decomposition can pass one and fail the other.

> Caption: Step four: for a proposed decomposition, run the chase for losslessness and the projection test for preservation. Both are mechanical and both must pass.

Exam-trap caption mode adds: *Dependency preservation does not imply losslessness, and losslessness does not imply preservation. GATE 2001 asked each one separately.*

**4:54–5:00** — Hold these two facts and the questions become checkable rather than memorable. Third normal form always has a safe decomposition. BCNF sometimes forces a choice between the two guarantees, and no amount of searching avoids it.

> Caption: Two facts survive every variation: 3NF synthesis always gives a lossless, dependency preserving decomposition; BCNF cannot always be reached without giving one of them up.

Exam-trap caption mode adds: *Neither fact says anything about how many questions will appear. They are theorems about schemas, not forecasts about the paper.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
