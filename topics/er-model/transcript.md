# Er Model — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/er-model/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 41 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. What Section 9 actually asks

*0:00 – 0:30 · objective: See that the ER model is the design step that comes before tables, and name its three primitives — entity, attribute and relationship — with the table each one maps to.*

**0:00–0:07** — Section nine of the syllabus opens with two words: E R model. It is named before the relational model, because you design in one and implement in the other.

> Caption: Section 9 of the GATE 2027 syllabus opens with two words: ER-model.

Exam-trap caption mode adds: *An ER question is not a relational-algebra question. Read which model the question names.*

**0:07–0:14** — Three primitives: an entity set, which is a collection of things of one kind; attributes, which are properties of one; and relationship sets, which are associations between entities.

> Caption: Three primitives: an entity set, its attributes, and a relationship set.

Exam-trap caption mode adds: *A relationship is not a foreign key. The foreign key is what it becomes later.*

**0:14–0:21** — Each primitive has its own shape, and each shape carries a mapping rule. The shapes are examinable content, not decoration.

> Caption: Each primitive has a shape, and each shape has a mapping rule.

Exam-trap caption mode adds: *Double border means weak. It applies to the rectangle and to the diamond, and they mean different things.*

**0:21–0:30** — Design first, tables second. Every table count in this lesson is produced by running the mapping rules on a stated diagram, not by remembering a number.

> Caption: Design first, tables second: every count in this lesson is computed, not remembered.

Exam-trap caption mode adds: *A table count with no stated diagram is a guess. Always ask what the participation is.*

## Scene 2. Entity sets and four kinds of attribute

*0:30 – 1:00 · objective: Distinguish key, simple, composite and multivalued attributes, and see that only the multivalued one forces a new table.*

**0:30–0:37** — An entity set is a set, so its members must be distinguishable. That is what a key is for, and it is drawn underlined.

> Caption: An entity set is a set, so its members are distinguishable — that needs a key.

Exam-trap caption mode adds: *Every entity set needs a key, including a weak one — a weak one borrows part of its key.*

**0:37–0:44** — A simple attribute becomes one column. A composite attribute is flattened: address becomes street, city and pin, three columns and no new table.

> Caption: A simple attribute is one column. A composite attribute is flattened into several.

Exam-trap caption mode adds: *A composite attribute never becomes a table. Only a multivalued one does.*

**0:44–0:51** — A multivalued attribute forces a table of its own, because a relational cell holds one value. phone becomes Reader underscore Phone, keyed by both columns.

> Caption: A multivalued attribute is the one that forces a table of its own.

Exam-trap caption mode adds: *A multivalued attribute is drawn with a double capsule. A double rectangle is a weak entity, which is a different thing.*

**0:51–1:00** — Seven phone values for four readers. Flattened, one cell would hold three of them, which is exactly what first normal form forbids. Split, it is seven rows of one value each.

> Caption: Seven phone values for four readers: three in one cell if flattened, one per row if split.

Exam-trap caption mode adds: *Counting values and counting rows are different questions once a table has a composite key.*

## Scene 3. Relationship sets and their attributes

*1:00 – 1:30 · objective: Place an attribute on the relationship rather than on either entity, using the rent-on-lodging argument from GATE CSE 2005.*

**1:00–1:07** — A relationship set associates entities and has a degree: two here, so it is binary. Three entity sets joined would make it ternary.

> Caption: A relationship set associates entities, and it has a degree: two here, three when three sets join.

Exam-trap caption mode adds: *Degree is the number of entity sets, not the number of rows in the relationship.*

**1:07–1:14** — An attribute of a relationship belongs to the pair. Rent depends on the person and the room together, so it belongs to Lodging, not to either side.

> Caption: An attribute of the relationship belongs to the pair, not to either entity.

Exam-trap caption mode adds: *If the relationship is one-to-many, the attribute can often move to the many side. If it is many-to-many, it cannot.*

**1:14–1:21** — A relationship attribute is what forces the third table. Without it a many-to-many can sometimes be folded; with it, the table must exist.

> Caption: A relationship attribute is what forces the third table in a many-to-many design.

Exam-trap caption mode adds: *The 2008 question hinges on exactly this: R1 has no attributes, so it can be folded.*

**1:21–1:30** — Borrows is keyed by rid, isbn and copy no together, because Copy is a weak entity and its key is already two columns.

> Caption: Borrows(rid, isbn, copy_no, since), keyed by all three.

Exam-trap caption mode adds: *Forgetting that a weak side contributes two columns is the commonest missing-column error.*

## Scene 4. Cardinality ratios, counted

*1:30 – 2:00 · objective: Count the possible relationship instances under 1:1, 1:N and M:N by enumerating the grid of pairs, and match each count to its closed form.*

**1:30–1:37** — Cardinality ratio says how many partners an entity may have. One to one, one to many, or many to many.

> Caption: Cardinality ratio says how many partners one entity may have.

Exam-trap caption mode adds: *The ratio is a limit, not a promise. At most one does not mean exactly one.*

**1:37–1:44** — Count them. Three by two gives sixty-four many-to-many instances and thirteen one-to-one. Three on the one side and four on the many gives two hundred and fifty-six.

> Caption: Count them: 3 by 2 gives 64 many-to-many instances, 13 one-to-one, and 256 for 3 by 4 one-to-many.

Exam-trap caption mode adds: *The exponent is the number of cells, not the number of entities.*

**1:44–1:51** — The page walks every subset of the grid, tests each against the constraint, and separately evaluates the closed form. Both agree.

> Caption: The model enumerates every subset and compares it with the closed form.

Exam-trap caption mode adds: *A formula remembered without its diagram is how the wrong power gets used.*

**1:51–2:00** — Same diagram, same sizes, different constraint: twenty-seven instances become eight. Cardinality and participation are two separate questions.

> Caption: Same diagram, same sizes, different constraint: 27 instances become 8.

Exam-trap caption mode adds: *Reading the ratio and ignoring the line under it is the commonest misreading in ER questions.*

## Scene 5. Participation: total and partial

*2:00 – 2:30 · objective: Read total participation from the double line, and see that it is what makes a merged foreign key NOT NULL — the reasoning behind GATE CSE 2017 Set 2 Q17.*

**2:00–2:07** — A single line is partial participation, a double line is total. Total means every entity appears in at least one pair.

> Caption: A single line is partial participation; a double line is total.

Exam-trap caption mode adds: *The double line is about entities of the set, not about the number of partners.*

**2:07–2:14** — Total participation is what makes a merged foreign key not null. Five copies, every one in a branch, so bid is declared not null.

> Caption: Total participation is what makes a merged foreign key NOT NULL.

Exam-trap caption mode adds: *NOT NULL is the physical form of a total participation constraint. Dropping it loses the constraint.*

**2:14–2:21** — Partial participation leaves nulls: two of the five readers never borrow. That is why the column has to allow null.

> Caption: Partial participation leaves nulls: two of the five readers never borrow.

Exam-trap caption mode adds: *GATE CSE 2017 Set 2 Q17 asks exactly when the merge is clean: many-to-one, with total participation.*

**2:21–2:30** — GATE twenty eighteen: many-to-one with both sides total means each E one entity has exactly one E two partner. The page checks this over all six instances.

> Caption: GATE CSE 2018 Q11: many-to-one with both sides total means exactly one partner for the many side.

Exam-trap caption mode adds: *Many-to-one limits the many side to one partner. Total participation then upgrades at most one to exactly one.*

## Scene 6. Weak entity sets and borrowed keys

*2:30 – 3:00 · objective: Show that a partial key does not identify anything on its own, and that the composite owner key does — the content of GATE CSE 2024 Set 2 and GATE CSE 2020 Q14.*

**2:30–2:37** — A weak entity set has no key of its own, and is drawn with a double rectangle. The relationship that ties it to its owner is a double diamond.

> Caption: A weak entity set has no key of its own: a double rectangle.

Exam-trap caption mode adds: *GATE CSE 2020 Q14 asks for the shape of the relationship, not the shape of the entity set.*

**2:37–2:44** — The partial key alone collides: six copies, two copy numbers, four collisions. That is what makes the entity set weak.

> Caption: The partial key alone collides: six copies share two copy numbers.

Exam-trap caption mode adds: *A dashed underline is a partial key. A solid underline is a key.*

**2:44–2:51** — The owner key completes it: isbn together with copy no is unique, six rows and six keys. The owner key is also a not null foreign key.

> Caption: The owner key completes it: (isbn, copy_no) is unique, six rows and six keys.

Exam-trap caption mode adds: *The identifying relationship itself makes no table. Its key contribution goes inside the weak entity.*

**2:51–3:00** — Only the weak set must participate totally in the identifying relationship, because without an owner its key is incomplete. The owner may have no weak entities at all.

> Caption: GATE CSE 2024 Set 2: only the weak set must participate totally in the identifying relationship.

Exam-trap caption mode adds: *Symmetry is the trap here: it is tempting to think both sides must be total.*

## Scene 7. Specialisation and its three mappings

*3:00 – 3:30 · objective: Compare the three ways to map a superclass and its subclasses, with their table counts and the conditions each one needs.*

**3:00–3:07** — Specialisation puts subclasses under a superclass. The two questions are whether they cover it, and whether they may overlap.

> Caption: Specialisation puts subclasses under a superclass: Student and Faculty under Person.

Exam-trap caption mode adds: *Total and disjoint are two independent flags, which gives four cases, not two.*

**3:07–3:14** — Strategy A gives a superclass table and one table per subclass, three tables here. It always works and costs a join.

> Caption: Strategy A: a superclass table and one table per subclass — three tables here.

Exam-trap caption mode adds: *The subclass table key is the superclass key, not a new key.*

**3:14–3:21** — Strategy B is one table with a type column: one table and many nulls. Always valid, never needs a join.

> Caption: Strategy B: one table with a type column — one table, many nulls.

Exam-trap caption mode adds: *A null in a strategy B table is not missing data; it means "not applicable to this type".*

**3:21–3:30** — Strategy C needs total and disjoint. With one person in both subclasses, three persons become four rows, and the identity is stored twice.

> Caption: Strategy C needs total and disjoint; with an overlap, three persons become four rows.

Exam-trap caption mode adds: *Strategy C is the one that breaks silently. A, B and C do not fail on the same diagrams.*

## Scene 8. The seven-step mapping, run

*3:30 – 4:00 · objective: Run the standard mapping on the library schema and get six tables, with the rejoin check showing that nothing was lost.*

**3:30–3:37** — Seven rules in an order that avoids rework: strong entities, weak entities, one-to-one, one-to-many, many-to-many, n-ary, then multivalued attributes.

> Caption: The seven rules, in the order that avoids rework.

Exam-trap caption mode adds: *Skipping to the many-to-many rule first usually means the foreign keys land in the wrong tables.*

**3:37–3:44** — Four entities give four tables, and the weak one takes a composite key. Copy is keyed by isbn and copy no.

> Caption: Four entities give four tables; the weak one takes a composite key.

Exam-trap caption mode adds: *A weak entity is still an entity: it gets a table. What it does not get is a key of its own.*

**3:44–3:51** — The one-to-many and the one-to-one make no table. bid lands in Copy and rid lands in Branch, on the many side and the total side.

> Caption: The one-to-many and the one-to-one make no table: bid lands in Copy, rid in Branch.

Exam-trap caption mode adds: *Putting the foreign key on the one side of a one-to-many is the classic error, and it cannot hold the data.*

**3:51–4:00** — Six tables. Rejoining gives back all five borrow rows, so nothing was lost. Folding the many-to-many into Reader instead keeps three and loses two.

> Caption: Six tables. Rejoining gives back all five borrow rows; folding Borrows into Reader loses two.

Exam-trap caption mode adds: *A mapping that runs without error can still lose rows. Check by rejoining.*

## Scene 9. Minimum number of tables, computed

*4:00 – 4:30 · objective: Run the same mapper on the 2015 Set 1, 2008 and 2005 items and reproduce their keys from the model rather than from memory.*

**4:00–4:07** — Twenty fifteen, set one: three entity tables plus one many-to-many table, and the one-to-many folds into E three. Four relations.

> Caption: GATE CSE 2015 Set 1 Q38: m:n between E1 and E2, 1:n between E1 and E3 — four relations.

Exam-trap caption mode adds: *The natural-language ratio "1:n with 1 on E1 side" fixes which side receives the foreign key.*

**4:07–4:14** — Twenty oh eight: two strong entities and one weak. P one joins M, the weak entity takes P one and N one, and R one and R two make no tables. Three tables.

> Caption: GATE CSE 2008 Q82: two strong entities and one weak — three tables, and M gains P1.

Exam-trap caption mode adds: *The companion question asks for the attribute set, so the columns matter, not just the count.*

**4:14–4:21** — Twenty oh five: one one-to-many and one many-to-many between the same pair. The first folds, the second does not. Three tables.

> Caption: GATE CSE 2005 Q15: one 1:N and one M:N between the same pair — three tables.

Exam-trap caption mode adds: *Two relationships between the same two entities are two separate decisions, not one.*

**4:21–4:30** — All three keys come out of the model, not out of a key sheet. The same rules that gave six tables give four, three and three.

> Caption: All three keys are reproduced by the model, not copied from an answer key.

Exam-trap caption mode adds: *A key you cannot derive is a key you cannot use on a diagram you have not seen.*

## Scene 10. The procedure and the five traps

*4:30 – 5:00 · objective: Fix the order of decisions — participation, cardinality, weak, multivalued, ISA — and the five places where the count goes wrong.*

**4:30–4:36** — Step one: read the participation. It never changes the table count, but it decides nullability and the side of a one-to-one.

> Caption: Step one: read the participation. Single line partial, double line total.

Exam-trap caption mode adds: *A double line drawn on the wrong side changes the answer, so check which entity it leaves.*

**4:36–4:42** — Step two: read the cardinality and say which side is which. The foreign key goes on the many side, or on the total side of a one-to-one.

> Caption: Step two: read the cardinality, and say which side is which.

Exam-trap caption mode adds: *The ratio is symmetric in name and not in consequence: one-to-many and many-to-one place the key differently.*

**4:42–4:48** — Step three: look for a weak entity. It adds a table with a composite key, and its identifying relationship adds nothing.

> Caption: Step three: look for a weak entity — double rectangle, partial key, owner.

Exam-trap caption mode adds: *Counting the identifying relationship as a table inflates the answer by one.*

**4:48–4:54** — Step four: multivalued attributes add a table, and an ISA hierarchy changes the count according to the strategy.

> Caption: Step four: look for multivalued attributes and for an ISA hierarchy.

Exam-trap caption mode adds: *A composite attribute adds no table. Only the multivalued one does.*

**4:54–5:00** — Step five: count and justify each table. Three strong entities, one weak, one many-to-many, one multivalued: six. Participation never enters the count.

> Caption: Step five: count and justify each table: strong entities plus weak plus M:N plus multivalued.

Exam-trap caption mode adds: *A count you cannot justify per table is a count you cannot check.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
