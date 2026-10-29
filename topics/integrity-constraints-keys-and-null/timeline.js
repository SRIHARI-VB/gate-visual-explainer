/* ==========================================================================
   integrity-constraints-keys-and-null — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs — never edited by hand.

   Every count quoted in a caption is computed by the model in lesson.js and
   printed on the canvas. The two agree because both read the same computation.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'what',
      n: 1,
      title: 'A constraint is a predicate the engine re-checks',
      start: 0, end: 30,
      objective: 'See an integrity constraint as a schema-level predicate that every INSERT, UPDATE and DELETE must leave TRUE.'
    },
    {
      id: 'keys',
      n: 2,
      title: 'Superkey, candidate key, primary key',
      start: 30, end: 60,
      objective: 'Read the key ladder on one relation and state PRIMARY KEY = UNIQUE + NOT NULL.'
    },
    {
      id: 'nulls',
      n: 3,
      title: 'Three constraints, one NULL, three verdicts',
      start: 60, end: 90,
      objective: 'Count which candidates NOT NULL, UNIQUE and PRIMARY KEY accept, and explain why UNIQUE admits a second NULL.'
    },
    {
      id: 'check',
      n: 4,
      title: 'CHECK passes on UNKNOWN',
      start: 90, end: 120,
      objective: 'Evaluate a CHECK under three-valued logic and show that UNKNOWN is accepted, so CHECK cannot forbid NULL.'
    },
    {
      id: 'fk',
      n: 5,
      title: 'A foreign key and its match types',
      start: 120, end: 150,
      objective: 'State what a foreign key requires, and count the candidates MATCH SIMPLE, MATCH FULL and MATCH PARTIAL accept.'
    },
    {
      id: 'actions',
      n: 6,
      title: 'Five referential actions, and when they run',
      start: 150, end: 180,
      objective: 'Distinguish NO ACTION, RESTRICT, CASCADE, SET NULL and SET DEFAULT, and separate immediate from deferred checking.'
    },
    {
      id: 'cascade05',
      n: 7,
      title: 'Cascade closure: GATE CSE 2005',
      start: 180, end: 210,
      objective: 'Compute the full closure of an ON DELETE CASCADE in rounds, and match it to the printed options.'
    },
    {
      id: 'setnull17',
      n: 8,
      title: 'SET NULL stops a cascade: GATE CSE 2017 Set 2',
      start: 210, end: 240,
      objective: 'Trace a two-table delete where the referencing action is SET NULL, and show why the cascade never fires.'
    },
    {
      id: 'ops',
      n: 9,
      title: 'Which writes can break a foreign key',
      start: 240, end: 270,
      objective: 'Derive, by enumeration, that only child-insert and parent-delete can orphan a row.'
    },
    {
      id: 'beyond',
      n: 10,
      title: 'Constraints, functional dependencies and deferral',
      start: 270, end: 300,
      objective: 'Separate what SQL enforces from what a dependency proof shows, and say when a constraint may be deferred.'
    }
  ],

  events: [
    /* ---------------- scene 1: what ---------------- */
    {
      id: 'what-1', start: 0, end: 8, scene: 'what',
      visualAction: 'draw-write-gate',
      caption: 'A constraint is a predicate written once in the schema and re-checked on every write that touches the table.',
      narration: 'A constraint is a rule the database re-checks on every write. You state it once, and the engine enforces it forever.',
      trap: 'A constraint is not a query and not a trigger: it is part of the schema, and it cannot be bypassed by a different application.'
    },
    {
      id: 'what-2', start: 8, end: 15, scene: 'what',
      visualAction: 'show-reject',
      caption: 'An INSERT, UPDATE or DELETE that would leave a constraint FALSE is refused; the statement is rolled back, not repaired.',
      narration: 'If a write would make the rule false, the whole statement is rejected. The engine never quietly fixes the row for you.',
      trap: 'A rejected statement changes nothing. Half-applied repairs are not how SQL constraint enforcement works.'
    },
    {
      id: 'what-3', start: 15, end: 23, scene: 'what',
      visualAction: 'list-families',
      caption: 'Four families: keys, referential integrity, domain and CHECK constraints, and the general assertion.',
      narration: 'There are four families: keys, references between tables, single-row checks, and the general assertion.',
      trap: 'DEFAULT is not a constraint. It supplies a value when none is written; it forbids nothing.'
    },
    {
      id: 'what-4', start: 23, end: 30, scene: 'what',
      visualAction: 'name-question-shape',
      caption: 'GATE asks what a constraint permits, not how to type it: which write is refused, and which rows disappear.',
      narration: 'The paper does not ask for syntax. It asks which write is refused, and which rows disappear as a consequence.',
      trap: 'The commonest lost mark is answering what should happen in a well-designed schema instead of what the stated constraint does.'
    },

    /* ---------------- scene 2: keys ---------------- */
    {
      id: 'keys-1', start: 30, end: 38, scene: 'keys',
      visualAction: 'draw-relation',
      caption: 'A superkey is an attribute set whose values never repeat. On this three-row relation, five of the seven non-empty subsets are superkeys.',
      narration: 'A superkey is a set of columns that never repeats a value. On this small relation, five of the seven non-empty column sets qualify.',
      trap: 'Every superset of a key is a superkey, so counting superkeys means counting closed sets, not counting keys.'
    },
    {
      id: 'keys-2', start: 38, end: 45, scene: 'keys',
      visualAction: 'show-minimal',
      caption: 'A candidate key is a minimal superkey: drop an attribute and uniqueness is lost. There are two here, A and the pair (B, C).',
      narration: 'A candidate key is a superkey with nothing to spare. Drop one column and the uniqueness is gone.',
      trap: 'Minimal means no proper subset is a superkey, not smallest in size. A two-column key can be minimal.'
    },
    {
      id: 'keys-3', start: 45, end: 53, scene: 'keys',
      visualAction: 'choose-primary',
      caption: 'The schema declares one candidate key as PRIMARY KEY; the rest are alternate keys, enforced with UNIQUE.',
      narration: 'The designer picks one candidate key to be the primary key. The others still have to be enforced, and UNIQUE is how.',
      trap: 'A table has at most one primary key constraint, even when that constraint spans several columns.'
    },
    {
      id: 'keys-4', start: 53, end: 60, scene: 'keys',
      visualAction: 'state-equation',
      caption: 'PRIMARY KEY = UNIQUE + NOT NULL. UNIQUE alone permits NULL, so it is weaker than a key.',
      narration: 'A primary key is a unique constraint plus a not-null constraint. Unique on its own is the weaker promise.',
      trap: 'A nullable UNIQUE column does not identify rows: several rows may hold NULL and none of them is identified.'
    },

    /* ---------------- scene 3: nulls ---------------- */
    {
      id: 'nulls-1', start: 60, end: 68, scene: 'nulls',
      visualAction: 'draw-three-constraints',
      caption: 'Three constraints, one NULL, three verdicts: NOT NULL refuses it, UNIQUE accepts it, PRIMARY KEY refuses it.',
      narration: 'The same NULL is refused by NOT NULL, accepted by UNIQUE, and refused by PRIMARY KEY.',
      trap: 'PRIMARY KEY refusing NULL is not a separate rule to memorise; it is the NOT NULL half of the definition.'
    },
    {
      id: 'nulls-2', start: 68, end: 75, scene: 'nulls',
      visualAction: 'count-accepted',
      caption: 'Against rows 1 and NULL, over the domain {NULL, 1, 2}: NOT NULL accepts 2 of 3, UNIQUE accepts 2 of 3, PRIMARY KEY accepts 1 of 3.',
      narration: 'Try each of the three candidate values. NOT NULL and UNIQUE each accept two, and the primary key accepts one.',
      trap: 'The counts depend on the instance. Change the existing rows and every number here changes.'
    },
    {
      id: 'nulls-3', start: 75, end: 83, scene: 'nulls',
      visualAction: 'explain-distinct',
      caption: 'UNIQUE accepts the second NULL because two nulls are not equal: the default is NULLS DISTINCT.',
      narration: 'Two nulls are not equal, so a unique constraint never sees a duplicate. The default is that nulls are distinct.',
      trap: 'NULL = NULL is UNKNOWN, not TRUE. Any test written as "equals" will never match two nulls.'
    },
    {
      id: 'nulls-4', start: 83, end: 90, scene: 'nulls',
      visualAction: 'show-clause',
      caption: 'The SQL standard leaves this choice to the implementation; PostgreSQL 15 added UNIQUE NULLS NOT DISTINCT to make nulls collide.',
      narration: 'The standard leaves the treatment of nulls to the implementation, and a clause exists to make the nulls collide instead.',
      trap: 'Do not generalise one engine to all engines. The null treatment of a UNIQUE constraint is exactly where they differ.'
    },

    /* ---------------- scene 4: check ---------------- */
    {
      id: 'check-1', start: 90, end: 98, scene: 'check',
      visualAction: 'draw-check-row',
      caption: 'A CHECK is a Boolean expression over the row, and it is satisfied when the expression is TRUE — or UNKNOWN.',
      narration: 'A check constraint is a Boolean expression. It is satisfied when the expression comes out true, or when it comes out unknown.',
      trap: 'The rule is "not FALSE", not "TRUE". This one sentence decides most CHECK questions.'
    },
    {
      id: 'check-2', start: 98, end: 105, scene: 'check',
      visualAction: 'evaluate-three-values',
      caption: 'CHECK (a > 5) over NULL, 1 and 2: only the NULL row survives, because UNKNOWN is not FALSE.',
      narration: 'Evaluate a greater-than on each value. One is true, one is false, one is unknown, and only the false one is refused.',
      trap: 'Reading UNKNOWN as FALSE turns the answer from 1 accepted row into 0, or from 2 into 1.'
    },
    {
      id: 'check-3', start: 105, end: 113, scene: 'check',
      visualAction: 'show-price-bug',
      caption: 'So CHECK (price > 0) does not stop a NULL price. NOT NULL is the constraint that does.',
      narration: 'A positive-price check does not stop a missing price. Only a not-null constraint stops a missing price.',
      trap: 'This is the standard interview and exam trap: a business rule needs two constraints, not one.'
    },
    {
      id: 'check-4', start: 113, end: 120, scene: 'check',
      visualAction: 'show-conjunction',
      caption: 'CHECK (a > 5) and CHECK (NOT (a > 5)) both admit NULL, so the two together still do not exclude it.',
      narration: 'Add the opposite check and the null still passes both. Two checks cannot between them forbid a null.',
      trap: 'Excluded middle holds for TRUE and FALSE only. UNKNOWN satisfies neither side of a contradiction.'
    },

    /* ---------------- scene 5: fk ---------------- */
    {
      id: 'fk-1', start: 120, end: 128, scene: 'fk',
      visualAction: 'draw-parent-child',
      caption: 'A foreign key names a column set in the child and a target in the parent; the target must be a primary key or a UNIQUE constraint.',
      narration: 'A foreign key points from a set of child columns at a set of parent columns, and the parent target must already be unique.',
      trap: 'A foreign key to a column that is merely indexed, and not unique, is not allowed: the reference would be ambiguous.'
    },
    {
      id: 'fk-2', start: 128, end: 135, scene: 'fk',
      visualAction: 'show-match-simple',
      caption: 'MATCH SIMPLE, the default: if any referencing column is NULL, the row passes without a match at all.',
      narration: 'Under the default match type, one null in the child key and the row is excused from matching anything.',
      trap: 'A composite foreign key with one null column is therefore not checked at all, which is rarely what a designer intended.'
    },
    {
      id: 'fk-3', start: 135, end: 143, scene: 'fk',
      visualAction: 'count-match-types',
      caption: 'Over the nine candidates on {NULL, 1, 2} squared, with the parent holding (1,1): SIMPLE accepts 6, FULL accepts 2, PARTIAL accepts 4.',
      narration: 'Nine candidate pairs. Simple accepts six, full accepts two, and the standard partial rule accepts four.',
      trap: 'MATCH SIMPLE is more permissive than MATCH PARTIAL, not less. The names invite the opposite guess.'
    },
    {
      id: 'fk-4', start: 143, end: 150, scene: 'fk',
      visualAction: 'state-choices',
      caption: 'MATCH FULL demands all-or-nothing; MATCH PARTIAL is defined in the standard and not implemented in PostgreSQL.',
      narration: 'Full means all the columns are null or none are. Partial exists in the standard and is not implemented in PostgreSQL.',
      trap: 'Do not quote MATCH PARTIAL behaviour as PostgreSQL behaviour; the manual says it is not yet implemented.'
    },

    /* ---------------- scene 6: actions ---------------- */
    {
      id: 'actions-1', start: 150, end: 158, scene: 'actions',
      visualAction: 'draw-five-actions',
      caption: 'Five referential actions: NO ACTION, RESTRICT, CASCADE, SET NULL and SET DEFAULT. NO ACTION is the default.',
      narration: 'There are five actions a foreign key may take when its parent row changes. The default refuses the change.',
      trap: 'Omitting the clause is not "do nothing"; it is NO ACTION, which refuses the delete when children remain.'
    },
    {
      id: 'actions-2', start: 158, end: 165, scene: 'actions',
      visualAction: 'separate-restrict',
      caption: 'NO ACTION may be deferred to the end of the transaction; RESTRICT may not, and it refuses even a delete whose end state would be legal.',
      narration: 'No action can wait until the transaction ends. Restrict cannot wait, and it refuses earlier.',
      trap: 'The two look identical in a single-statement test, which is why a question that only runs one statement cannot separate them.'
    },
    {
      id: 'actions-3', start: 165, end: 173, scene: 'actions',
      visualAction: 'show-cascade-setnull',
      caption: 'CASCADE deletes the children, SET NULL nulls the child key, SET DEFAULT writes the default and then demands that it exist in the parent.',
      narration: 'Cascade removes the children, set null blanks the child key, and set default writes a value that must itself be a valid parent key.',
      trap: 'SET DEFAULT fails if the default value has no matching parent row, so it can turn a delete into an error.'
    },
    {
      id: 'actions-4', start: 173, end: 180, scene: 'actions',
      visualAction: 'show-deferrable',
      caption: 'Only UNIQUE, PRIMARY KEY and FOREIGN KEY can be DEFERRABLE; CHECK and NOT NULL are always checked immediately.',
      narration: 'Deferral is available to the three constraints that can need it. Check and not-null are always immediate.',
      trap: 'Deferring a foreign key does not defer its referential action: the cascade still runs with the statement.'
    },

    /* ---------------- scene 7: cascade05 ---------------- */
    {
      id: 'cascade05-1', start: 180, end: 188, scene: 'cascade05',
      visualAction: 'draw-2005-table',
      caption: 'GATE CSE 2005: A is the primary key, C is a foreign key to A with ON DELETE CASCADE, and the tuple (2,4) is deleted.',
      narration: 'One table, key A, and a cascading foreign key from C back to A. The row with A equal to two is deleted.',
      trap: 'The foreign key is inside the same table. A self-referencing key cascades within one relation.'
    },
    {
      id: 'cascade05-2', start: 188, end: 195, scene: 'cascade05',
      visualAction: 'round-one',
      caption: 'Round 1: the key 2 has gone, so every row whose C equals 2 must go — (5,2) and (7,2).',
      narration: 'First round: find the rows that point at the key just deleted. There are two of them.',
      trap: 'The row (2,4) is not re-examined for C; only the deleted key value matters.'
    },
    {
      id: 'cascade05-3', start: 195, end: 203, scene: 'cascade05',
      visualAction: 'round-two',
      caption: 'Round 2: keys 5 and 7 have now gone. No row has C equal to 7, but (9,5) has C equal to 5, so it goes too.',
      narration: 'Second round: the two new keys are five and seven. One row points at five, and nothing points at seven.',
      trap: 'Cascade is transitive. Stopping after one round gives two tuples instead of three, which is option B.'
    },
    {
      id: 'cascade05-4', start: 203, end: 210, scene: 'cascade05',
      visualAction: 'round-three',
      caption: 'Round 3: nothing has C equal to 9, so the closure is (5,2), (7,2) and (9,5) — three tuples, option C.',
      narration: 'Third round finds nothing, so the closure is those three rows and the answer is option C.',
      trap: '(3,4), (4,3) and (6,4) are the rows pointing at 4, which is not the key that was deleted.'
    },

    /* ---------------- scene 8: setnull17 ---------------- */
    {
      id: 'setnull17-1', start: 210, end: 218, scene: 'setnull17',
      visualAction: 'draw-2017-tables',
      caption: 'GATE CSE 2017 Set 2: T1.P is the key, T1.Q references T2.R with cascade, and T2.S references T1.P with ON DELETE SET NULL.',
      narration: 'Two tables with a reference each way. One reference cascades, and the other sets its column to null.',
      trap: 'The two references point in opposite directions, so the action taken in one table decides whether the other fires.'
    },
    {
      id: 'setnull17-2', start: 218, end: 225, scene: 'setnull17',
      visualAction: 'apply-setnull',
      caption: 'Delete (3,8) from T1. T2 holds (8,3), whose S is 3, so SET NULL rewrites that row to (8, NULL).',
      narration: 'Deleting the T1 row removes the key three, and the T2 row that pointed at three is updated, not deleted.',
      trap: 'SET NULL is an update. Counting it as a deletion is the error this question is built to catch.'
    },
    {
      id: 'setnull17-3', start: 225, end: 233, scene: 'setnull17',
      visualAction: 'show-no-cascade',
      caption: 'No row of T2 is deleted, so the cascade from T1.Q to T2.R never fires and nothing comes back into T1.',
      narration: 'Because nothing was deleted in the second table, the cascade that depends on a deletion there never starts.',
      trap: 'A cascade fires on a deletion, not on an update. The T2 row survives, so the chain stops.'
    },
    {
      id: 'setnull17-4', start: 233, end: 240, scene: 'setnull17',
      visualAction: 'state-answer',
      caption: 'The number of additional T1 rows that must be deleted is 0, which is the official key.',
      narration: 'The answer is zero additional rows, and that is the key the paper gives.',
      trap: 'The chain would delete more if T2.S had been declared CASCADE. The action, not the data, decides the answer.'
    },

    /* ---------------- scene 9: ops ---------------- */
    {
      id: 'ops-1', start: 240, end: 248, scene: 'ops',
      visualAction: 'draw-grid',
      caption: 'Which writes can break a foreign key? Insert into the child, or delete from the parent — those two, and not the other two.',
      narration: 'Two of the four operations can orphan a row: adding a child, and removing a parent.',
      trap: 'The question asks what can violate, not what will: one violating instance is enough.'
    },
    {
      id: 'ops-2', start: 248, end: 255, scene: 'ops',
      visualAction: 'explain-safe-ops',
      caption: 'Inserting into the parent only adds a key, and deleting from the child only removes a reference; neither can orphan anything.',
      narration: 'The other two are safe by construction: one adds keys, the other removes references.',
      trap: 'Deleting from the child is safe for this constraint but can break a constraint on a table below it.'
    },
    {
      id: 'ops-3', start: 255, end: 263, scene: 'ops',
      visualAction: 'show-updates',
      caption: 'Updates split the same way: changing a child key to a missing value, or a parent key to a new value, can orphan rows.',
      narration: 'Updates behave like the matching insert and delete. Change either side of the reference and the check runs again.',
      trap: 'An update of a non-key column triggers no referential check, because the referenced value did not change.'
    },
    {
      id: 'ops-4', start: 263, end: 270, scene: 'ops',
      visualAction: 'link-algebra',
      caption: 'GATE CSE 2004 Q13: with referential integrity holding, the child keys minus the parent keys is empty.',
      narration: 'That fact is exactly one relational-algebra expression: project the child keys, subtract the parent keys, and get nothing.',
      trap: 'The subtraction only goes one way. Parent keys minus child keys is not empty, because a parent need not be referenced.'
    },

    /* ---------------- scene 10: beyond ---------------- */
    {
      id: 'beyond-1', start: 270, end: 278, scene: 'beyond',
      visualAction: 'separate-fd',
      caption: 'SQL enforces the keys you declare, not the functional dependencies you can prove: a non-key dependency is not a constraint.',
      narration: 'SQL knows about the keys you declared. A dependency that is not a declared key is not enforced by the engine.',
      trap: 'Normalisation is about dependencies; constraint enforcement is about declarations. A BCNF schema is not automatically a checked one.'
    },
    {
      id: 'beyond-2', start: 278, end: 285, scene: 'beyond',
      visualAction: 'draw-deferral',
      caption: 'Two tables that reference each other cannot be filled row by row, which is why deferral exists: check at COMMIT instead.',
      narration: 'A circular pair of references cannot be satisfied one statement at a time, so the check can be postponed to the end.',
      trap: 'Deferring changes when the error appears, not whether it appears. An unsatisfied key still fails at COMMIT.'
    },
    {
      id: 'beyond-3', start: 285, end: 293, scene: 'beyond',
      visualAction: 'show-assertion',
      caption: 'Constraints beyond the five kinds need an assertion or a trigger; PostgreSQL has no CREATE ASSERTION, so a trigger is the route.',
      narration: 'For a rule that spans rows, the standard offers an assertion, and where that is missing a trigger does the work.',
      trap: 'A CHECK cannot look at other rows. The engine rejects the attempt or silently enforces only the current row.'
    },
    {
      id: 'beyond-4', start: 293, end: 300, scene: 'beyond',
      visualAction: 'close',
      caption: 'A decomposition keeps its keys with UNIQUE and its links with foreign keys; losslessness is a property of the join, not a constraint.',
      narration: 'After splitting a table, the keys and the links must be re-declared. Losslessness is proved by the join, not enforced by a constraint.',
      trap: 'A foreign key across a decomposition does not give losslessness, and losslessness does not give referential integrity.'
    }
  ]
};
