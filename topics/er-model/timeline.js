/* ==========================================================================
   er-model — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs — never edited by hand.

   Every number quoted in a caption is computed by the model in lesson.js and
   printed on the canvas; the two agree because both read the same computation.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'ask',
      n: 1,
      title: 'What Section 9 actually asks',
      start: 0, end: 30,
      objective: 'See that the ER model is the design step that comes before tables, and name its three primitives — entity, attribute and relationship — with the table each one maps to.'
    },
    {
      id: 'entity',
      n: 2,
      title: 'Entity sets and four kinds of attribute',
      start: 30, end: 60,
      objective: 'Distinguish key, simple, composite and multivalued attributes, and see that only the multivalued one forces a new table.'
    },
    {
      id: 'rel',
      n: 3,
      title: 'Relationship sets and their attributes',
      start: 60, end: 90,
      objective: 'Place an attribute on the relationship rather than on either entity, using the rent-on-lodging argument from GATE CSE 2005.'
    },
    {
      id: 'card',
      n: 4,
      title: 'Cardinality ratios, counted',
      start: 90, end: 120,
      objective: 'Count the possible relationship instances under 1:1, 1:N and M:N by enumerating the grid of pairs, and match each count to its closed form.'
    },
    {
      id: 'part',
      n: 5,
      title: 'Participation: total and partial',
      start: 120, end: 150,
      objective: 'Read total participation from the double line, and see that it is what makes a merged foreign key NOT NULL — the reasoning behind GATE CSE 2017 Set 2 Q17.'
    },
    {
      id: 'weak',
      n: 6,
      title: 'Weak entity sets and borrowed keys',
      start: 150, end: 180,
      objective: 'Show that a partial key does not identify anything on its own, and that the composite owner key does — the content of GATE CSE 2024 Set 2 and GATE CSE 2020 Q14.'
    },
    {
      id: 'isa',
      n: 7,
      title: 'Specialisation and its three mappings',
      start: 180, end: 210,
      objective: 'Compare the three ways to map a superclass and its subclasses, with their table counts and the conditions each one needs.'
    },
    {
      id: 'map',
      n: 8,
      title: 'The seven-step mapping, run',
      start: 210, end: 240,
      objective: 'Run the standard mapping on the library schema and get six tables, with the rejoin check showing that nothing was lost.'
    },
    {
      id: 'count',
      n: 9,
      title: 'Minimum number of tables, computed',
      start: 240, end: 270,
      objective: 'Run the same mapper on the 2015 Set 1, 2008 and 2005 items and reproduce their keys from the model rather than from memory.'
    },
    {
      id: 'proc',
      n: 10,
      title: 'The procedure and the five traps',
      start: 270, end: 300,
      objective: 'Fix the order of decisions — participation, cardinality, weak, multivalued, ISA — and the five places where the count goes wrong.'
    }
  ],

  events: [
    /* ---------- scene 1: ask ---------- */
    {
      id: 'a-1', scene: 'ask', start: 0, end: 7,
      caption: 'Section 9 of the GATE 2027 syllabus opens with two words: ER-model.',
      detail: 'The full wording is: "Section 9: Databases — ER-model. Relational model: relational algebra, tuple calculus, SQL. Integrity constraints, normal forms. File organization, indexing (e.g., B and B+ trees). Transactions and concurrency control." The ER model is named first, before the relational model, because you design in it and implement in the other.',
      narration: 'Section nine of the syllabus opens with two words: E R model. It is named before the relational model, because you design in one and implement in the other.',
      keyword: 'ER-model',
      trap: 'An ER question is not a relational-algebra question. Read which model the question names.'
    },
    {
      id: 'a-2', scene: 'ask', start: 7, end: 14,
      caption: 'Three primitives: an entity set, its attributes, and a relationship set.',
      detail: 'An entity set is a collection of things of the same kind that the database needs to describe — all readers, all books. An attribute is a property of one entity. A relationship set is a set of associations among entities, and it is itself a first-class object that can carry attributes.',
      narration: 'Three primitives: an entity set, which is a collection of things of one kind; attributes, which are properties of one; and relationship sets, which are associations between entities.',
      keyword: 'Three primitives',
      trap: 'A relationship is not a foreign key. The foreign key is what it becomes later.'
    },
    {
      id: 'a-3', scene: 'ask', start: 14, end: 21,
      caption: 'Each primitive has a shape, and each shape has a mapping rule.',
      detail: 'A rectangle is an entity set, a capsule is an attribute, a diamond is a relationship. The shapes are not decoration: GATE has asked directly which shape represents a given construct, so the notation is examinable content.',
      narration: 'Each primitive has its own shape, and each shape carries a mapping rule. The shapes are examinable content, not decoration.',
      keyword: 'mapping rule',
      trap: 'Double border means weak. It applies to the rectangle and to the diamond, and they mean different things.'
    },
    {
      id: 'a-4', scene: 'ask', start: 21, end: 30,
      caption: 'Design first, tables second: every count in this lesson is computed, not remembered.',
      detail: 'The model under the canvas enumerates relationship instances and maps four schemas — the library schema and three past papers. So when this lesson says six tables, that is the output of the mapping rules applied to a stated diagram, not a claim about diagrams in general.',
      narration: 'Design first, tables second. Every table count in this lesson is produced by running the mapping rules on a stated diagram, not by remembering a number.',
      keyword: 'computed',
      trap: 'A table count with no stated diagram is a guess. Always ask what the participation is.'
    },

    /* ---------- scene 2: entity ---------- */
    {
      id: 'e-1', scene: 'entity', start: 30, end: 37,
      caption: 'An entity set is a set, so its members are distinguishable — that needs a key.',
      detail: 'Reader is an entity set: every reader is an entity. Because it is a set, no two members may be indistinguishable, so at least one attribute must be unique. That attribute is the key, and it is drawn underlined.',
      narration: 'An entity set is a set, so its members must be distinguishable. That is what a key is for, and it is drawn underlined.',
      keyword: 'key',
      trap: 'Every entity set needs a key, including a weak one — a weak one borrows part of its key.'
    },
    {
      id: 'e-2', scene: 'entity', start: 37, end: 44,
      caption: 'A simple attribute is one column. A composite attribute is flattened into several.',
      detail: 'address is composite: it has parts street, city and pin. Mapping rule one flattens a composite attribute into one column per part, so Reader gains three columns and no table. Nothing is lost and nothing is created.',
      narration: 'A simple attribute becomes one column. A composite attribute is flattened: address becomes street, city and pin, three columns and no new table.',
      keyword: 'flattened',
      trap: 'A composite attribute never becomes a table. Only a multivalued one does.'
    },
    {
      id: 'e-3', scene: 'entity', start: 44, end: 51,
      caption: 'A multivalued attribute is the one that forces a table of its own.',
      detail: 'A reader may have several phone numbers, and a relational table may not hold several values in one cell. So phone becomes Reader_Phone, keyed by rid together with phone. That is the same rule that makes first normal form necessary.',
      narration: 'A multivalued attribute forces a table of its own, because a relational cell holds one value. phone becomes Reader underscore Phone, keyed by both columns.',
      keyword: 'multivalued',
      trap: 'A multivalued attribute is drawn with a double capsule. A double rectangle is a weak entity, which is a different thing.'
    },
    {
      id: 'e-4', scene: 'entity', start: 51, end: 60,
      caption: 'Seven phone values for four readers: three in one cell if flattened, one per row if split.',
      detail: 'The model counts the sample data: seven phone values belonging to four readers, and the largest group is three. Flattened, that is a cell holding three values, which violates first normal form. Split, it is seven atomic rows.',
      narration: 'Seven phone values for four readers. Flattened, one cell would hold three of them, which is exactly what first normal form forbids. Split, it is seven rows of one value each.',
      keyword: 'seven',
      trap: 'Counting values and counting rows are different questions once a table has a composite key.'
    },

    /* ---------- scene 3: rel ---------- */
    {
      id: 'r-1', scene: 'rel', start: 60, end: 67,
      caption: 'A relationship set associates entities, and it has a degree: two here, three when three sets join.',
      detail: 'Lodging associates a Person with a Room, so its degree is two and it is binary. A ternary relationship such as Supplies joining Supplier, Part and Project has degree three. Degree is the number of entity sets involved, not the number of entities.',
      narration: 'A relationship set associates entities and has a degree: two here, so it is binary. Three entity sets joined would make it ternary.',
      keyword: 'degree',
      trap: 'Degree is the number of entity sets, not the number of rows in the relationship.'
    },
    {
      id: 'r-2', scene: 'rel', start: 67, end: 74,
      caption: 'An attribute of the relationship belongs to the pair, not to either entity.',
      detail: 'GATE CSE 2005 asked where rent belongs when persons lodge in rooms many-to-many. Rent depends on the person and the room together, so it is an attribute of Lodging. On Person it would be one value for many rooms; on Room it would be one value for many persons.',
      narration: 'An attribute of a relationship belongs to the pair. Rent depends on the person and the room together, so it belongs to Lodging, not to either side.',
      keyword: 'the pair',
      trap: 'If the relationship is one-to-many, the attribute can often move to the many side. If it is many-to-many, it cannot.'
    },
    {
      id: 'r-3', scene: 'rel', start: 74, end: 81,
      caption: 'A relationship attribute is what forces the third table in a many-to-many design.',
      detail: 'Without since, Borrows could in principle be folded away when the cardinality allows it. With since, the pair itself carries data, so the table must exist. This is why "does the relationship have attributes" is the first thing to check before counting tables.',
      narration: 'A relationship attribute is what forces the third table. Without it a many-to-many can sometimes be folded; with it, the table must exist.',
      keyword: 'forces the third table',
      trap: 'The 2008 question hinges on exactly this: R1 has no attributes, so it can be folded.'
    },
    {
      id: 'r-4', scene: 'rel', start: 81, end: 90,
      caption: 'Borrows(rid, isbn, copy_no, since), keyed by all three.',
      detail: 'The key of a many-to-many relationship table is the union of the keys of the participating entity sets. Here Copy is weak, so its key is itself two columns, and the key of Borrows is rid, isbn and copy_no together.',
      narration: 'Borrows is keyed by rid, isbn and copy no together, because Copy is a weak entity and its key is already two columns.',
      keyword: 'all three',
      trap: 'Forgetting that a weak side contributes two columns is the commonest missing-column error.'
    },

    /* ---------- scene 4: card ---------- */
    {
      id: 'c-1', scene: 'card', start: 90, end: 97,
      caption: 'Cardinality ratio says how many partners one entity may have.',
      detail: 'One-to-one: each entity on either side has at most one partner. One-to-many: an entity on the one side may have many partners, an entity on the many side at most one. Many-to-many: neither side is limited.',
      narration: 'Cardinality ratio says how many partners an entity may have. One to one, one to many, or many to many.',
      keyword: 'how many partners',
      trap: 'The ratio is a limit, not a promise. At most one does not mean exactly one.'
    },
    {
      id: 'c-2', scene: 'card', start: 97, end: 104,
      caption: 'Count them: 3 by 2 gives 64 many-to-many instances, 13 one-to-one, and 256 for 3 by 4 one-to-many.',
      detail: 'A relationship instance is a choice of which pairs exist, so before any constraint there are two to the power m times n possibilities. The one-to-one constraint is an injective pairing, which counts as the sum over k of C(m,k)C(n,k)k!, giving 13 for 3 by 2. The one-to-many constraint lets each many-side entity pick at most one partner, giving (m+1)^n, which is 256 for 3 on the one side and 4 on the many.',
      narration: 'Count them. Three by two gives sixty-four many-to-many instances and thirteen one-to-one. Three on the one side and four on the many gives two hundred and fifty-six.',
      keyword: '64',
      trap: 'The exponent is the number of cells, not the number of entities.'
    },
    {
      id: 'c-3', scene: 'card', start: 104, end: 111,
      caption: 'The model enumerates every subset and compares it with the closed form.',
      detail: 'Both numbers come from the page: it walks all 2^6 subsets of the 3 by 2 grid, tests each against the cardinality constraint, and separately evaluates the formula. The two agree, which is the check that the formula is the right one for the diagram.',
      narration: 'The page walks every subset of the grid, tests each against the constraint, and separately evaluates the closed form. Both agree.',
      keyword: 'enumerates',
      trap: 'A formula remembered without its diagram is how the wrong power gets used.'
    },
    {
      id: 'c-4', scene: 'card', start: 111, end: 120,
      caption: 'Same diagram, same sizes, different constraint: 27 instances become 8.',
      detail: 'Take two entities on the one side and three on the many. With partial participation there are 27 instances. If every many-side entity must have a partner, only 8 remain. Cardinality and participation are two separate questions, and the table count depends on both.',
      narration: 'Same diagram, same sizes, different constraint: twenty-seven instances become eight. Cardinality and participation are two separate questions.',
      keyword: 'different constraint',
      trap: 'Reading the ratio and ignoring the line under it is the commonest misreading in ER questions.'
    },

    /* ---------- scene 5: part ---------- */
    {
      id: 'p-1', scene: 'part', start: 120, end: 127,
      caption: 'A single line is partial participation; a double line is total.',
      detail: 'Total participation means every entity of that set appears in at least one pair of the relationship. Partial means some may appear in none. The notation is a single or double line from the entity to the diamond, and in some books a (min,max) pair such as (1,N) instead.',
      narration: 'A single line is partial participation, a double line is total. Total means every entity appears in at least one pair.',
      keyword: 'double line',
      trap: 'The double line is about entities of the set, not about the number of partners.'
    },
    {
      id: 'p-2', scene: 'part', start: 127, end: 134,
      caption: 'Total participation is what makes a merged foreign key NOT NULL.',
      detail: 'Keeps is one-to-many from Branch to Copy, and Copy participates totally. Mapping rule four puts the foreign key bid in Copy, and because every copy has a branch, the column can be declared NOT NULL. In the sample data there are five copies and zero nulls.',
      narration: 'Total participation is what makes a merged foreign key not null. Five copies, every one in a branch, so bid is declared not null.',
      keyword: 'NOT NULL',
      trap: 'NOT NULL is the physical form of a total participation constraint. Dropping it loses the constraint.'
    },
    {
      id: 'p-3', scene: 'part', start: 134, end: 141,
      caption: 'Partial participation leaves nulls: two of the five readers never borrow.',
      detail: 'Borrows is partial on the Reader side, so a foreign key for it could not be NOT NULL. The model counts two readers with no borrow at all. That is the difference between a constraint that can be enforced and one that has to be allowed to be empty.',
      narration: 'Partial participation leaves nulls: two of the five readers never borrow. That is why the column has to allow null.',
      keyword: 'nulls',
      trap: 'GATE CSE 2017 Set 2 Q17 asks exactly when the merge is clean: many-to-one, with total participation.'
    },
    {
      id: 'p-4', scene: 'part', start: 141, end: 150,
      caption: 'GATE CSE 2018 Q11: many-to-one with both sides total means exactly one partner for the many side.',
      detail: 'The question says R is many-to-one from E1 to E2, both total, and E1 is larger. Then each E1 entity has exactly one E2 partner: at most one from many-to-one, and at least one from total participation. The model confirms it by enumerating all 6 instances and finding no E1 entity with two partners, while some E2 entity always has two or more — which is why the options about E2 are false.',
      narration: 'GATE twenty eighteen: many-to-one with both sides total means each E one entity has exactly one E two partner. The page checks this over all six instances.',
      keyword: 'exactly one partner',
      trap: 'Many-to-one limits the many side to one partner. Total participation then upgrades at most one to exactly one.'
    },

    /* ---------- scene 6: weak ---------- */
    {
      id: 'w-1', scene: 'weak', start: 150, end: 157,
      caption: 'A weak entity set has no key of its own: a double rectangle.',
      detail: 'Copy has no attribute unique by itself. Copy numbers repeat across books, so copy_no alone identifies nothing. The set is drawn with a double rectangle, and the relationship that ties it to its owner is drawn with a double diamond and is called the identifying relationship.',
      narration: 'A weak entity set has no key of its own, and is drawn with a double rectangle. The relationship that ties it to its owner is a double diamond.',
      keyword: 'no key of its own',
      trap: 'GATE CSE 2020 Q14 asks for the shape of the relationship, not the shape of the entity set.'
    },
    {
      id: 'w-2', scene: 'weak', start: 157, end: 164,
      caption: 'The partial key alone collides: six copies share two copy numbers.',
      detail: 'Three books with two copies each give six rows but only two distinct values of copy_no. So four of the six rows are indistinguishable by the partial key. The partial key is underlined with a dashed line, never a solid one.',
      narration: 'The partial key alone collides: six copies, two copy numbers, four collisions. That is what makes the entity set weak.',
      keyword: 'collides',
      trap: 'A dashed underline is a partial key. A solid underline is a key.'
    },
    {
      id: 'w-3', scene: 'weak', start: 164, end: 171,
      caption: 'The owner key completes it: (isbn, copy_no) is unique, six rows and six keys.',
      detail: 'The mapping rule gives the weak entity a table whose key is the owner key together with the partial key, and whose owner key is a non-nullable foreign key. Six rows now give six distinct keys, so the table is a relation.',
      narration: 'The owner key completes it: isbn together with copy no is unique, six rows and six keys. The owner key is also a not null foreign key.',
      keyword: 'owner key',
      trap: 'The identifying relationship itself makes no table. Its key contribution goes inside the weak entity.'
    },
    {
      id: 'w-4', scene: 'weak', start: 171, end: 180,
      caption: 'GATE CSE 2024 Set 2: only the weak set must participate totally in the identifying relationship.',
      detail: 'The owner may exist with no weak entities at all — a book with no copies is still a book. The weak entity cannot exist without its owner, because without one its key is incomplete. So total participation is required of the weak side only, and the key is option A.',
      narration: 'Only the weak set must participate totally in the identifying relationship, because without an owner its key is incomplete. The owner may have no weak entities at all.',
      keyword: 'only the weak set',
      trap: 'Symmetry is the trap here: it is tempting to think both sides must be total.'
    },

    /* ---------- scene 7: isa ---------- */
    {
      id: 'i-1', scene: 'isa', start: 180, end: 187,
      caption: 'Specialisation puts subclasses under a superclass: Student and Faculty under Person.',
      detail: 'Each subclass inherits the superclass attributes and adds its own. The constraints are whether the subclasses cover every superclass entity — total — and whether an entity may belong to more than one — overlapping. Generalisation is the same diagram read upwards, from the subclasses to the common superclass.',
      narration: 'Specialisation puts subclasses under a superclass. The two questions are whether they cover it, and whether they may overlap.',
      keyword: 'subclasses',
      trap: 'Total and disjoint are two independent flags, which gives four cases, not two.'
    },
    {
      id: 'i-2', scene: 'isa', start: 187, end: 194,
      caption: 'Strategy A: a superclass table and one table per subclass — three tables here.',
      detail: 'Person holds pid and pname; Student holds pid, roll and cgpa with pid as a foreign key; Faculty likewise. This always works, keeps every constraint expressible, and costs one join per query that needs the whole picture.',
      narration: 'Strategy A gives a superclass table and one table per subclass, three tables here. It always works and costs a join.',
      keyword: 'three tables',
      trap: 'The subclass table key is the superclass key, not a new key.'
    },
    {
      id: 'i-3', scene: 'isa', start: 194, end: 201,
      caption: 'Strategy B: one table with a type column — one table, many nulls.',
      detail: 'One Person table holds every attribute of every subclass plus a discriminator column. It is always valid, needs no join, and leaves a row with nulls in exactly the columns that do not apply to its type. The nulls are the price of the single table.',
      narration: 'Strategy B is one table with a type column: one table and many nulls. Always valid, never needs a join.',
      keyword: 'type column',
      trap: 'A null in a strategy B table is not missing data; it means "not applicable to this type".'
    },
    {
      id: 'i-4', scene: 'isa', start: 201, end: 210,
      caption: 'Strategy C needs total and disjoint; with an overlap, three persons become four rows.',
      detail: 'Strategy C keeps only the subclass tables and copies the inherited attributes into each. It works only when every person is in at least one subclass and in at most one. If a person is both a student and a faculty member, that person is stored twice, so three persons produce four rows and the identity is duplicated.',
      narration: 'Strategy C needs total and disjoint. With one person in both subclasses, three persons become four rows, and the identity is stored twice.',
      keyword: 'total and disjoint',
      trap: 'Strategy C is the one that breaks silently. A, B and C do not fail on the same diagrams.'
    },

    /* ---------- scene 8: map ---------- */
    {
      id: 'm-1', scene: 'map', start: 210, end: 217,
      caption: 'The seven rules, in the order that avoids rework.',
      detail: 'Strong entities first, then weak entities, then binary one-to-one, then one-to-many, then many-to-many, then n-ary, then multivalued attributes. Each rule either makes a table or adds a foreign key to one that already exists, so running them in order means never editing a table twice.',
      narration: 'Seven rules in an order that avoids rework: strong entities, weak entities, one-to-one, one-to-many, many-to-many, n-ary, then multivalued attributes.',
      keyword: 'seven rules',
      trap: 'Skipping to the many-to-many rule first usually means the foreign keys land in the wrong tables.'
    },
    {
      id: 'm-2', scene: 'map', start: 217, end: 224,
      caption: 'Four entities give four tables; the weak one takes a composite key.',
      detail: 'Reader, Book, Branch and Copy. Copy is weak under Book, so its key is isbn together with copy_no and its isbn is a non-nullable foreign key. The composite address is already flattened into three columns of Reader.',
      narration: 'Four entities give four tables, and the weak one takes a composite key. Copy is keyed by isbn and copy no.',
      keyword: 'composite key',
      trap: 'A weak entity is still an entity: it gets a table. What it does not get is a key of its own.'
    },
    {
      id: 'm-3', scene: 'map', start: 224, end: 231,
      caption: 'The one-to-many and the one-to-one make no table: bid lands in Copy, rid in Branch.',
      detail: 'Keeps is one-to-many from Branch to Copy, so the key of the one side becomes a column of the many side: bid goes into Copy. Manages is one-to-one with Branch total, so rid goes into Branch. Neither relationship gets a table of its own.',
      narration: 'The one-to-many and the one-to-one make no table. bid lands in Copy and rid lands in Branch, on the many side and the total side.',
      keyword: 'no table',
      trap: 'Putting the foreign key on the one side of a one-to-many is the classic error, and it cannot hold the data.'
    },
    {
      id: 'm-4', scene: 'map', start: 231, end: 240,
      caption: 'Six tables. Rejoining gives back all five borrow rows; folding Borrows into Reader loses two.',
      detail: 'The model joins Borrows to Copy on isbn and copy_no and recovers exactly the five universal rows it started from, so the mapping is lossless. It also runs the wrong mapping — folding the many-to-many into Reader and keeping one copy per reader — which keeps three pairs and loses two. That is the information loss the third table exists to prevent.',
      narration: 'Six tables. Rejoining gives back all five borrow rows, so nothing was lost. Folding the many-to-many into Reader instead keeps three and loses two.',
      keyword: 'lossless',
      trap: 'A mapping that runs without error can still lose rows. Check by rejoining.'
    },

    /* ---------- scene 9: count ---------- */
    {
      id: 'n-1', scene: 'count', start: 240, end: 247,
      caption: 'GATE CSE 2015 Set 1 Q38: m:n between E1 and E2, 1:n between E1 and E3 — four relations.',
      detail: 'E1, E2 and E3 give three tables. R12 is many-to-many, so it is a fourth table keyed by a11 and a21. R13 is one-to-many with one on E1 side, so a11 becomes a foreign key of E3 and R13 makes no table. The key is 4.',
      narration: 'Twenty fifteen, set one: three entity tables plus one many-to-many table, and the one-to-many folds into E three. Four relations.',
      keyword: 'four relations',
      trap: 'The natural-language ratio "1:n with 1 on E1 side" fixes which side receives the foreign key.'
    },
    {
      id: 'n-2', scene: 'count', start: 247, end: 254,
      caption: 'GATE CSE 2008 Q82: two strong entities and one weak — three tables, and M gains P1.',
      detail: 'M and P are strong. R1 is many-to-one from M with M total and has no attributes, so P1 becomes a column of M and R1 makes no table. N is weak under P with partial key N1, so N is keyed by P1 and N1 and R2 makes no table. Three tables, and the attribute set of M is M1, M2, M3 and P1 — which is option A of the companion question.',
      narration: 'Twenty oh eight: two strong entities and one weak. P one joins M, the weak entity takes P one and N one, and R one and R two make no tables. Three tables.',
      keyword: 'three tables',
      trap: 'The companion question asks for the attribute set, so the columns matter, not just the count.'
    },
    {
      id: 'n-3', scene: 'count', start: 254, end: 261,
      caption: 'GATE CSE 2005 Q15: one 1:N and one M:N between the same pair — three tables.',
      detail: 'Two entities, one one-to-many relationship that folds into the many side, and one many-to-many that needs its own table. Three tables. The pairing of relationships between the same two entity sets changes nothing: each relationship is mapped on its own cardinality.',
      narration: 'Twenty oh five: one one-to-many and one many-to-many between the same pair. The first folds, the second does not. Three tables.',
      keyword: 'three tables',
      trap: 'Two relationships between the same two entities are two separate decisions, not one.'
    },
    {
      id: 'n-4', scene: 'count', start: 261, end: 270,
      caption: 'All three keys are reproduced by the model, not copied from an answer key.',
      detail: 'The same mapper that produced the six tables of the library schema produces four, three and three for these three papers. That is an independent check on the keys: if the rules were wrong, the counts would not match. The keys themselves are quoted with their year and question number.',
      narration: 'All three keys come out of the model, not out of a key sheet. The same rules that gave six tables give four, three and three.',
      keyword: 'reproduced',
      trap: 'A key you cannot derive is a key you cannot use on a diagram you have not seen.'
    },

    /* ---------- scene 10: proc ---------- */
    {
      id: 'x-1', scene: 'proc', start: 270, end: 276,
      caption: 'Step one: read the participation. Single line partial, double line total.',
      detail: 'Participation never changes the number of tables. It changes whether a foreign key may be null, and it decides which side of a one-to-one receives the key. Read it first because it is the constraint most often drawn and most often ignored.',
      narration: 'Step one: read the participation. It never changes the table count, but it decides nullability and the side of a one-to-one.',
      keyword: 'read the participation',
      trap: 'A double line drawn on the wrong side changes the answer, so check which entity it leaves.'
    },
    {
      id: 'x-2', scene: 'proc', start: 276, end: 282,
      caption: 'Step two: read the cardinality, and say which side is which.',
      detail: 'One-to-one, one-to-many or many-to-many, and then which entity is on the one side. In a one-to-many the foreign key goes on the many side. In a one-to-one it goes on the side with total participation, or on either with a null allowed.',
      narration: 'Step two: read the cardinality and say which side is which. The foreign key goes on the many side, or on the total side of a one-to-one.',
      keyword: 'which side is which',
      trap: 'The ratio is symmetric in name and not in consequence: one-to-many and many-to-one place the key differently.'
    },
    {
      id: 'x-3', scene: 'proc', start: 282, end: 288,
      caption: 'Step three: look for a weak entity — double rectangle, partial key, owner.',
      detail: 'A weak entity contributes a table whose key is the owner key plus the partial key, and whose identifying relationship contributes nothing. Both of those are counts, and both are asked about directly in recent papers.',
      narration: 'Step three: look for a weak entity. It adds a table with a composite key, and its identifying relationship adds nothing.',
      keyword: 'weak entity',
      trap: 'Counting the identifying relationship as a table inflates the answer by one.'
    },
    {
      id: 'x-4', scene: 'proc', start: 288, end: 294,
      caption: 'Step four: look for multivalued attributes and for an ISA hierarchy.',
      detail: 'A multivalued attribute adds one table. An ISA hierarchy replaces the superclass table according to the strategy chosen, so it can add two, add none, or replace one with two — which is why the question must say which mapping it wants.',
      narration: 'Step four: multivalued attributes add a table, and an ISA hierarchy changes the count according to the strategy.',
      keyword: 'multivalued',
      trap: 'A composite attribute adds no table. Only the multivalued one does.'
    },
    {
      id: 'x-5', scene: 'proc', start: 294, end: 300,
      caption: 'Step five: count and justify each table: strong entities plus weak plus M:N plus multivalued.',
      detail: 'For the library schema that is three strong entities, one weak entity, one many-to-many relationship and one multivalued attribute: six. Participation never enters the count, and one-to-one and one-to-many relationships never add a table. Adjust only for the ISA strategy and for n-ary relationships.',
      narration: 'Step five: count and justify each table. Three strong entities, one weak, one many-to-many, one multivalued: six. Participation never enters the count.',
      keyword: 'justify each table',
      trap: 'A count you cannot justify per table is a count you cannot check.'
    }
  ]
};
