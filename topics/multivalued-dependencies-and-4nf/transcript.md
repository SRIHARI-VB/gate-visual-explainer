# Multivalued Dependencies And 4nf — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/multivalued-dependencies-and-4nf/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. The redundancy a functional dependency cannot see

*0:00 – 0:30 · objective: Show a relation in BCNF that is still redundant, because the redundancy comes from two independent multi-valued facts about one key rather than from a functional dependency.*

**0:00–0:07** — Pythagoras has two children and two salary years, so the table holds four rows for him.

> Caption: Pythagoras has two children and two salary-years, so the table holds four rows for him.

**0:07–0:15** — Children and salary history are independent facts, and the flat table writes down every combination.

> Caption: Children and salary history are independent facts, and the flat table writes every combination.

**0:15–0:22** — The cost is c times s rows, so three children and two salary years give six rows where five would do.

> Caption: The cost is c times s rows: three children and two salary-years give six rows where five would do.

Exam-trap caption mode adds: *With c = 2 and s = 2 the two row counts are equal, so a row count alone will not reveal the redundancy. The anomaly shows in updates, not in totals.*

**0:22–0:30** — No functional dependency is violated. The only key is all three attributes, so this is BCNF.

> Caption: No functional dependency is violated: the only key is all three attributes, so this is BCNF.

Exam-trap caption mode adds: *BCNF removes redundancy caused by functional dependencies only. A schema can be in BCNF and still repeat facts, which is the whole reason 4NF exists.*

## Scene 2. The multivalued dependency, in two equivalent forms

*0:30 – 1:00 · objective: State X ->> Y both as "the Y-values for a fixed x do not depend on z" and as the swap condition, and verify on all 4,864 small cases that the two statements decide the same way.*

**0:30–0:37** — X multi-determines Y when, once x is fixed, the set of Y values does not depend on which z value you also fixed.

> Caption: X ->> Y says: once x is fixed, the set of Y-values does not depend on which Z-value you also fixed.

**0:37–0:45** — Equivalently, two tuples that agree on X may swap their Y parts, and the results must still be in the relation.

> Caption: Equivalently: two tuples that agree on X may swap their Y-parts, and the results must still be in the relation.

**0:45–0:52** — Both readings are tested against each other on four thousand eight hundred and sixty-four cases.

> Caption: Both readings are tested against each other on 4,864 cases: every relation on three attributes over a two-value domain.

**0:52–1:00** — They agree in all of them. The definition has two faces, and they are the same definition.

> Caption: They agree in all 4,864. The definition has two faces, and they are one definition.

## Scene 3. Every FD is an MVD, and the converse fails

*1:00 – 1:30 · objective: Establish replication, count the instances where it applies, exhibit witnesses to the failed converse, and state the two triviality conditions and complementation.*

**1:00–1:07** — Every functional dependency is an MVD. Seven hundred and fifty-three instances here satisfy the FD and therefore the MVD.

> Caption: Every functional dependency is an MVD: 753 instances here satisfy X -> Y and therefore X ->> Y.

**1:07–1:15** — The converse fails in nineteen hundred and fifteen cases. Two tuples with the same x and different y break the FD but not the MVD.

> Caption: The converse fails in 1,915 cases: two tuples with the same x and different y break the FD but not the MVD.

Exam-trap caption mode adds: *Reading X ->> Y as "X determines Y" is the single most common error on this topic. It determines a set, not a value.*

**1:15–1:22** — An MVD is trivial when Y lies inside X, or when X and Y together are the whole schema.

> Caption: An MVD is trivial when Y lies inside X, or when X and Y together are the whole schema.

Exam-trap caption mode adds: *Triviality has two limbs, not one. Checking only Y inside X misses the whole-schema case, which is the one papers use.*

**1:22–1:30** — And X multi-determines Y always brings X multi-determines Z with it. Complementation, checked on every case.

> Caption: And X ->> Y always brings X ->> Z with it: complementation, checked on every case.

## Scene 4. Fagin's theorem: an MVD is exactly a lossless two-way split

*1:30 – 2:00 · objective: Test X ->> Y against the join of the XY and XZ projections on every small instance, then delete one tuple and watch both the MVD and the join fail together.*

**1:30–1:37** — Fagin's theorem. X multi-determines Y exactly when the relation is the join of its X-Y and X-Z projections.

> Caption: Fagin's theorem: X ->> Y holds exactly when the relation is the join of its XY and XZ projections.

**1:37–1:45** — Forty-eight hundred and sixty-four cases tested. The MVD held in two thousand six hundred and sixty-eight, and the join recovered the relation in exactly those.

> Caption: 4,864 cases tested, the MVD held in 2,668 of them, and the join recovered the relation in exactly those.

**1:45–1:52** — Delete one tuple from the employee table and the MVD dies with it. Eight rows become seven.

> Caption: Delete one tuple from the employee table and the MVD dies with it: eight rows become seven.

**1:52–2:00** — So an MVD is a claim about every legal instance, not a fact about one printed table.

> Caption: So an MVD is a claim about every legal instance, not a fact about one printed table.

Exam-trap caption mode adds: *An instance that satisfies the MVD does not prove the schema does. Read whether the question says relation or relation schema.*

## Scene 5. Fourth normal form, and why it is strictly stronger than BCNF

*2:00 – 2:30 · objective: Define 4NF with superkeys, and place the employee schema as the witness that BCNF does not imply 4NF.*

**2:00–2:07** — Fourth normal form. For every non-trivial MVD, the left side must be a superkey.

> Caption: Fourth normal form: for every non-trivial MVD X ->> Y, the set X is a superkey.

**2:07–2:15** — Employee, child, salary has no FD at all, so BCNF is satisfied and 4NF is not.

> Caption: Employee, Child, Salary has no FD at all, so BCNF is satisfied and 4NF is not.

**2:15–2:22** — So 4NF is strictly stronger than BCNF, and this schema is the witness that the converse fails.

> Caption: So 4NF is strictly stronger than BCNF, and this schema is the witness that the converse fails.

**2:22–2:30** — The key here is all three attributes, which is why BCNF has nothing to complain about.

> Caption: The key here is all three attributes, which is why BCNF has nothing to complain about.

## Scene 6. The 4NF decomposition: split on the MVD, and count what it saves

*2:30 – 3:00 · objective: Apply the split into X-with-Y and X-with-Z to the pizza table, check the join is exact, and count the rows an update costs before and after.*

**2:30–2:37** — To fix it, split on the violating MVD. X together with Y, and X together with Z.

> Caption: To fix it, split on the violating MVD: X together with Y, and X together with Z.

**2:37–2:45** — The pizza table. Twelve rows become six and six, and joining them back returns exactly the twelve.

> Caption: The pizza table: 12 rows become 6 and 6, and joining them back returns exactly the 12.

Exam-trap caption mode adds: *Twelve becoming six plus six is not evidence of saving here. This instance is a complete product, so the totals coincide. The saving shows up on the next update, not in this count.*

**2:45–2:52** — A new variety for A1 now costs one row instead of three, and the half done update is impossible.

> Caption: A new variety for A1 now costs one row instead of three, and the half-done update is impossible.

**2:52–3:00** — The split is lossless by construction. The fragments share X, and the MVD is what makes the join exact.

> Caption: The split is lossless by construction: the fragments share X, and the MVD is what makes the join exact.

## Scene 7. The inference rules, and the four implications from a past paper

*3:00 – 3:30 · objective: Separate the MVD rules that hold from the two that do not, and decide each of the four implications by exhaustive search rather than by memory.*

**3:00–3:07** — Four implications from a past paper, each decided by search over all two hundred and fifty-six instances.

> Caption: Four implications from a past paper, each decided by search over all 256 instances.

**3:07–3:15** — A multi-determines B and A multi-determines C does not give A determines B C. The full cube of eight tuples satisfies both MVDs.

> Caption: A ->> B with A ->> C does not give A -> BC: the full cube of eight tuples satisfies both MVDs.

Exam-trap caption mode adds: *Union holds for MVDs on the same left side, so A ->> BC is valid. The invalid step is the change of arrow, from ->> to ->.*

**3:15–3:22** — A multi-determines B C with A determines B does not give A determines C. Four tuples satisfy both premises and break the conclusion.

> Caption: A ->> BC with A -> B does not give A -> C: four tuples satisfy both premises and break the conclusion.

**3:22–3:30** — The other two hold, by union, decomposition and replication. Two of the four are valid, so the answer is two.

> Caption: The other two hold, by union, decomposition and replication: two of four valid, so the answer is 2.

## Scene 8. The chase: the lossless-join test once there are three fragments

*3:30 – 4:00 · objective: Run the chase on three decompositions of one schema, see the fully distinguished row appear for the good one, and see a four-tuple witness explode to eight for the bad one.*

**3:30–3:37** — Three or more fragments need the chase. A tableau with one row per fragment, and a distinguished symbol per attribute.

> Caption: Three or more fragments need the chase: a tableau with one row per fragment and a distinguished symbol per attribute.

**3:37–3:45** — Functional dependencies unify symbols. A multivalued dependency adds the swapped row.

> Caption: Functional dependencies unify symbols; a multivalued dependency adds the swapped row.

**3:45–3:52** — A B with A C D works. The MVD produces a fully distinguished row. A B, A C and A D does not.

> Caption: AB with ACD works: the MVD produces a fully distinguished row. AB, AC and AD does not.

**3:52–4:00** — More fragments is not more safety. Four tuples in, eight tuples out.

> Caption: More fragments is not more safety: four tuples in, eight tuples out.

Exam-trap caption mode adds: *The common wrong move is to check two fragments at a time and declare the whole decomposition lossless. Three fragments can each be fine in pairs and still be lossy together.*

## Scene 9. The pairs that get confused: MVD, multivalued attribute, BCNF, 5NF

*4:00 – 4:30 · objective: Separate an MVD from a multivalued attribute, 4NF from BCNF, and 4NF from 5NF, each with the question that tells them apart.*

**4:00–4:07** — An MVD is not a multivalued attribute. First normal form is about cells, fourth normal form is about rows.

> Caption: An MVD is not a multivalued attribute: 1NF is about cells, 4NF is about rows.

Exam-trap caption mode adds: *Answering "not in 1NF" for a 4NF question, or the reverse, is a common slip. Ask whether a cell holds a set or whether a row repeats a fact.*

**4:07–4:15** — BCNF constrains functional dependencies. Fourth normal form constrains multivalued ones, which BCNF cannot see.

> Caption: BCNF constrains functional dependencies; 4NF constrains multivalued ones, which BCNF cannot see.

**4:15–4:22** — Fourth normal form is not fifth normal form. Fifth normal form constrains join dependencies, which is the next rung and a different question.

> Caption: 4NF is not 5NF: 5NF constrains join dependencies, which is the next rung and a different question.

**4:22–4:30** — Papers list fourth normal form as an option even when the answer is third normal form, so read what the option actually asks.

> Caption: Papers list 4NF as an option even when the answer is 3NF, so read what the option actually asks.

## Scene 10. The exam procedure

*4:30 – 5:00 · objective: Give the four-step decision procedure for a 4NF question, and say what each step uses and what it ignores.*

**4:30–4:37** — Step one. Find the keys from the functional dependencies alone.

> Caption: Step one: find the keys from the functional dependencies alone.

Exam-trap caption mode adds: *Using an MVD to compute a closure is the error that turns a 4NF question into a wrong answer, because it invents a key the schema does not have.*

**4:37–4:45** — Step two. List the non trivial MVDs, and test each left side against the superkeys.

> Caption: Step two: list the non-trivial MVDs, and test each left side against the superkeys.

**4:45–4:52** — Step three. Split on a violating MVD into X with Y and X with Z, then re test each fragment.

> Caption: Step three: split on a violating MVD into X with Y and X with Z, then re-test each fragment.

**4:52–5:00** — Step four. Three or more fragments, or a test against implied MVDs, means chase it.

> Caption: Step four: three or more fragments, or a test against implied MVDs, means chase it.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
