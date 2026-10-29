# Integrity Constraints: Keys, Foreign Keys and NULL — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/integrity-constraints-keys-and-null/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A constraint is a predicate the engine re-checks

*0:00 – 0:30 · objective: See an integrity constraint as a schema-level predicate that every INSERT, UPDATE and DELETE must leave TRUE.*

**0:00–0:08** — A constraint is a rule the database re-checks on every write. You state it once, and the engine enforces it forever.

> Caption: A constraint is a predicate written once in the schema and re-checked on every write that touches the table.

Exam-trap caption mode adds: *A constraint is not a query and not a trigger: it is part of the schema, and it cannot be bypassed by a different application.*

**0:08–0:15** — If a write would make the rule false, the whole statement is rejected. The engine never quietly fixes the row for you.

> Caption: An INSERT, UPDATE or DELETE that would leave a constraint FALSE is refused; the statement is rolled back, not repaired.

Exam-trap caption mode adds: *A rejected statement changes nothing. Half-applied repairs are not how SQL constraint enforcement works.*

**0:15–0:23** — There are four families: keys, references between tables, single-row checks, and the general assertion.

> Caption: Four families: keys, referential integrity, domain and CHECK constraints, and the general assertion.

Exam-trap caption mode adds: *DEFAULT is not a constraint. It supplies a value when none is written; it forbids nothing.*

**0:23–0:30** — The paper does not ask for syntax. It asks which write is refused, and which rows disappear as a consequence.

> Caption: GATE asks what a constraint permits, not how to type it: which write is refused, and which rows disappear.

Exam-trap caption mode adds: *The commonest lost mark is answering what should happen in a well-designed schema instead of what the stated constraint does.*

## Scene 2. Superkey, candidate key, primary key

*0:30 – 1:00 · objective: Read the key ladder on one relation and state PRIMARY KEY = UNIQUE + NOT NULL.*

**0:30–0:38** — A superkey is a set of columns that never repeats a value. On this small relation, five of the seven non-empty column sets qualify.

> Caption: A superkey is an attribute set whose values never repeat. On this three-row relation, five of the seven non-empty subsets are superkeys.

Exam-trap caption mode adds: *Every superset of a key is a superkey, so counting superkeys means counting closed sets, not counting keys.*

**0:38–0:45** — A candidate key is a superkey with nothing to spare. Drop one column and the uniqueness is gone.

> Caption: A candidate key is a minimal superkey: drop an attribute and uniqueness is lost. There are two here, A and the pair (B, C).

Exam-trap caption mode adds: *Minimal means no proper subset is a superkey, not smallest in size. A two-column key can be minimal.*

**0:45–0:53** — The designer picks one candidate key to be the primary key. The others still have to be enforced, and UNIQUE is how.

> Caption: The schema declares one candidate key as PRIMARY KEY; the rest are alternate keys, enforced with UNIQUE.

Exam-trap caption mode adds: *A table has at most one primary key constraint, even when that constraint spans several columns.*

**0:53–1:00** — A primary key is a unique constraint plus a not-null constraint. Unique on its own is the weaker promise.

> Caption: PRIMARY KEY = UNIQUE + NOT NULL. UNIQUE alone permits NULL, so it is weaker than a key.

Exam-trap caption mode adds: *A nullable UNIQUE column does not identify rows: several rows may hold NULL and none of them is identified.*

## Scene 3. Three constraints, one NULL, three verdicts

*1:00 – 1:30 · objective: Count which candidates NOT NULL, UNIQUE and PRIMARY KEY accept, and explain why UNIQUE admits a second NULL.*

**1:00–1:08** — The same NULL is refused by NOT NULL, accepted by UNIQUE, and refused by PRIMARY KEY.

> Caption: Three constraints, one NULL, three verdicts: NOT NULL refuses it, UNIQUE accepts it, PRIMARY KEY refuses it.

Exam-trap caption mode adds: *PRIMARY KEY refusing NULL is not a separate rule to memorise; it is the NOT NULL half of the definition.*

**1:08–1:15** — Try each of the three candidate values. NOT NULL and UNIQUE each accept two, and the primary key accepts one.

> Caption: Against rows 1 and NULL, over the domain {NULL, 1, 2}: NOT NULL accepts 2 of 3, UNIQUE accepts 2 of 3, PRIMARY KEY accepts 1 of 3.

Exam-trap caption mode adds: *The counts depend on the instance. Change the existing rows and every number here changes.*

**1:15–1:23** — Two nulls are not equal, so a unique constraint never sees a duplicate. The default is that nulls are distinct.

> Caption: UNIQUE accepts the second NULL because two nulls are not equal: the default is NULLS DISTINCT.

Exam-trap caption mode adds: *NULL = NULL is UNKNOWN, not TRUE. Any test written as "equals" will never match two nulls.*

**1:23–1:30** — The standard leaves the treatment of nulls to the implementation, and a clause exists to make the nulls collide instead.

> Caption: The SQL standard leaves this choice to the implementation; PostgreSQL 15 added UNIQUE NULLS NOT DISTINCT to make nulls collide.

Exam-trap caption mode adds: *Do not generalise one engine to all engines. The null treatment of a UNIQUE constraint is exactly where they differ.*

## Scene 4. CHECK passes on UNKNOWN

*1:30 – 2:00 · objective: Evaluate a CHECK under three-valued logic and show that UNKNOWN is accepted, so CHECK cannot forbid NULL.*

**1:30–1:38** — A check constraint is a Boolean expression. It is satisfied when the expression comes out true, or when it comes out unknown.

> Caption: A CHECK is a Boolean expression over the row, and it is satisfied when the expression is TRUE — or UNKNOWN.

Exam-trap caption mode adds: *The rule is "not FALSE", not "TRUE". This one sentence decides most CHECK questions.*

**1:38–1:45** — Evaluate a greater-than on each value. One is true, one is false, one is unknown, and only the false one is refused.

> Caption: CHECK (a > 5) over NULL, 1 and 2: only the NULL row survives, because UNKNOWN is not FALSE.

Exam-trap caption mode adds: *Reading UNKNOWN as FALSE turns the answer from 1 accepted row into 0, or from 2 into 1.*

**1:45–1:53** — A positive-price check does not stop a missing price. Only a not-null constraint stops a missing price.

> Caption: So CHECK (price > 0) does not stop a NULL price. NOT NULL is the constraint that does.

Exam-trap caption mode adds: *This is the standard interview and exam trap: a business rule needs two constraints, not one.*

**1:53–2:00** — Add the opposite check and the null still passes both. Two checks cannot between them forbid a null.

> Caption: CHECK (a > 5) and CHECK (NOT (a > 5)) both admit NULL, so the two together still do not exclude it.

Exam-trap caption mode adds: *Excluded middle holds for TRUE and FALSE only. UNKNOWN satisfies neither side of a contradiction.*

## Scene 5. A foreign key and its match types

*2:00 – 2:30 · objective: State what a foreign key requires, and count the candidates MATCH SIMPLE, MATCH FULL and MATCH PARTIAL accept.*

**2:00–2:08** — A foreign key points from a set of child columns at a set of parent columns, and the parent target must already be unique.

> Caption: A foreign key names a column set in the child and a target in the parent; the target must be a primary key or a UNIQUE constraint.

Exam-trap caption mode adds: *A foreign key to a column that is merely indexed, and not unique, is not allowed: the reference would be ambiguous.*

**2:08–2:15** — Under the default match type, one null in the child key and the row is excused from matching anything.

> Caption: MATCH SIMPLE, the default: if any referencing column is NULL, the row passes without a match at all.

Exam-trap caption mode adds: *A composite foreign key with one null column is therefore not checked at all, which is rarely what a designer intended.*

**2:15–2:23** — Nine candidate pairs. Simple accepts six, full accepts two, and the standard partial rule accepts four.

> Caption: Over the nine candidates on {NULL, 1, 2} squared, with the parent holding (1,1): SIMPLE accepts 6, FULL accepts 2, PARTIAL accepts 4.

Exam-trap caption mode adds: *MATCH SIMPLE is more permissive than MATCH PARTIAL, not less. The names invite the opposite guess.*

**2:23–2:30** — Full means all the columns are null or none are. Partial exists in the standard and is not implemented in PostgreSQL.

> Caption: MATCH FULL demands all-or-nothing; MATCH PARTIAL is defined in the standard and not implemented in PostgreSQL.

Exam-trap caption mode adds: *Do not quote MATCH PARTIAL behaviour as PostgreSQL behaviour; the manual says it is not yet implemented.*

## Scene 6. Five referential actions, and when they run

*2:30 – 3:00 · objective: Distinguish NO ACTION, RESTRICT, CASCADE, SET NULL and SET DEFAULT, and separate immediate from deferred checking.*

**2:30–2:38** — There are five actions a foreign key may take when its parent row changes. The default refuses the change.

> Caption: Five referential actions: NO ACTION, RESTRICT, CASCADE, SET NULL and SET DEFAULT. NO ACTION is the default.

Exam-trap caption mode adds: *Omitting the clause is not "do nothing"; it is NO ACTION, which refuses the delete when children remain.*

**2:38–2:45** — No action can wait until the transaction ends. Restrict cannot wait, and it refuses earlier.

> Caption: NO ACTION may be deferred to the end of the transaction; RESTRICT may not, and it refuses even a delete whose end state would be legal.

Exam-trap caption mode adds: *The two look identical in a single-statement test, which is why a question that only runs one statement cannot separate them.*

**2:45–2:53** — Cascade removes the children, set null blanks the child key, and set default writes a value that must itself be a valid parent key.

> Caption: CASCADE deletes the children, SET NULL nulls the child key, SET DEFAULT writes the default and then demands that it exist in the parent.

Exam-trap caption mode adds: *SET DEFAULT fails if the default value has no matching parent row, so it can turn a delete into an error.*

**2:53–3:00** — Deferral is available to the three constraints that can need it. Check and not-null are always immediate.

> Caption: Only UNIQUE, PRIMARY KEY and FOREIGN KEY can be DEFERRABLE; CHECK and NOT NULL are always checked immediately.

Exam-trap caption mode adds: *Deferring a foreign key does not defer its referential action: the cascade still runs with the statement.*

## Scene 7. Cascade closure: GATE CSE 2005

*3:00 – 3:30 · objective: Compute the full closure of an ON DELETE CASCADE in rounds, and match it to the printed options.*

**3:00–3:08** — One table, key A, and a cascading foreign key from C back to A. The row with A equal to two is deleted.

> Caption: GATE CSE 2005: A is the primary key, C is a foreign key to A with ON DELETE CASCADE, and the tuple (2,4) is deleted.

Exam-trap caption mode adds: *The foreign key is inside the same table. A self-referencing key cascades within one relation.*

**3:08–3:15** — First round: find the rows that point at the key just deleted. There are two of them.

> Caption: Round 1: the key 2 has gone, so every row whose C equals 2 must go — (5,2) and (7,2).

Exam-trap caption mode adds: *The row (2,4) is not re-examined for C; only the deleted key value matters.*

**3:15–3:23** — Second round: the two new keys are five and seven. One row points at five, and nothing points at seven.

> Caption: Round 2: keys 5 and 7 have now gone. No row has C equal to 7, but (9,5) has C equal to 5, so it goes too.

Exam-trap caption mode adds: *Cascade is transitive. Stopping after one round gives two tuples instead of three, which is option B.*

**3:23–3:30** — Third round finds nothing, so the closure is those three rows and the answer is option C.

> Caption: Round 3: nothing has C equal to 9, so the closure is (5,2), (7,2) and (9,5) — three tuples, option C.

Exam-trap caption mode adds: *(3,4), (4,3) and (6,4) are the rows pointing at 4, which is not the key that was deleted.*

## Scene 8. SET NULL stops a cascade: GATE CSE 2017 Set 2

*3:30 – 4:00 · objective: Trace a two-table delete where the referencing action is SET NULL, and show why the cascade never fires.*

**3:30–3:38** — Two tables with a reference each way. One reference cascades, and the other sets its column to null.

> Caption: GATE CSE 2017 Set 2: T1.P is the key, T1.Q references T2.R with cascade, and T2.S references T1.P with ON DELETE SET NULL.

Exam-trap caption mode adds: *The two references point in opposite directions, so the action taken in one table decides whether the other fires.*

**3:38–3:45** — Deleting the T1 row removes the key three, and the T2 row that pointed at three is updated, not deleted.

> Caption: Delete (3,8) from T1. T2 holds (8,3), whose S is 3, so SET NULL rewrites that row to (8, NULL).

Exam-trap caption mode adds: *SET NULL is an update. Counting it as a deletion is the error this question is built to catch.*

**3:45–3:53** — Because nothing was deleted in the second table, the cascade that depends on a deletion there never starts.

> Caption: No row of T2 is deleted, so the cascade from T1.Q to T2.R never fires and nothing comes back into T1.

Exam-trap caption mode adds: *A cascade fires on a deletion, not on an update. The T2 row survives, so the chain stops.*

**3:53–4:00** — The answer is zero additional rows, and that is the key the paper gives.

> Caption: The number of additional T1 rows that must be deleted is 0, which is the official key.

Exam-trap caption mode adds: *The chain would delete more if T2.S had been declared CASCADE. The action, not the data, decides the answer.*

## Scene 9. Which writes can break a foreign key

*4:00 – 4:30 · objective: Derive, by enumeration, that only child-insert and parent-delete can orphan a row.*

**4:00–4:08** — Two of the four operations can orphan a row: adding a child, and removing a parent.

> Caption: Which writes can break a foreign key? Insert into the child, or delete from the parent — those two, and not the other two.

Exam-trap caption mode adds: *The question asks what can violate, not what will: one violating instance is enough.*

**4:08–4:15** — The other two are safe by construction: one adds keys, the other removes references.

> Caption: Inserting into the parent only adds a key, and deleting from the child only removes a reference; neither can orphan anything.

Exam-trap caption mode adds: *Deleting from the child is safe for this constraint but can break a constraint on a table below it.*

**4:15–4:23** — Updates behave like the matching insert and delete. Change either side of the reference and the check runs again.

> Caption: Updates split the same way: changing a child key to a missing value, or a parent key to a new value, can orphan rows.

Exam-trap caption mode adds: *An update of a non-key column triggers no referential check, because the referenced value did not change.*

**4:23–4:30** — That fact is exactly one relational-algebra expression: project the child keys, subtract the parent keys, and get nothing.

> Caption: GATE CSE 2004 Q13: with referential integrity holding, the child keys minus the parent keys is empty.

Exam-trap caption mode adds: *The subtraction only goes one way. Parent keys minus child keys is not empty, because a parent need not be referenced.*

## Scene 10. Constraints, functional dependencies and deferral

*4:30 – 5:00 · objective: Separate what SQL enforces from what a dependency proof shows, and say when a constraint may be deferred.*

**4:30–4:38** — SQL knows about the keys you declared. A dependency that is not a declared key is not enforced by the engine.

> Caption: SQL enforces the keys you declare, not the functional dependencies you can prove: a non-key dependency is not a constraint.

Exam-trap caption mode adds: *Normalisation is about dependencies; constraint enforcement is about declarations. A BCNF schema is not automatically a checked one.*

**4:38–4:45** — A circular pair of references cannot be satisfied one statement at a time, so the check can be postponed to the end.

> Caption: Two tables that reference each other cannot be filled row by row, which is why deferral exists: check at COMMIT instead.

Exam-trap caption mode adds: *Deferring changes when the error appears, not whether it appears. An unsatisfied key still fails at COMMIT.*

**4:45–4:53** — For a rule that spans rows, the standard offers an assertion, and where that is missing a trigger does the work.

> Caption: Constraints beyond the five kinds need an assertion or a trigger; PostgreSQL has no CREATE ASSERTION, so a trigger is the route.

Exam-trap caption mode adds: *A CHECK cannot look at other rows. The engine rejects the attempt or silently enforces only the current row.*

**4:53–5:00** — After splitting a table, the keys and the links must be re-declared. Losslessness is proved by the join, not enforced by a constraint.

> Caption: A decomposition keeps its keys with UNIQUE and its links with foreign keys; losslessness is a property of the join, not a constraint.

Exam-trap caption mode adds: *A foreign key across a decomposition does not give losslessness, and losslessness does not give referential integrity.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
