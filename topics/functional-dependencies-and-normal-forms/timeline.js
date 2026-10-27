/* ==========================================================================
   functional-dependencies-and-normal-forms - THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs - never edited by hand.

   Every number quoted in a caption is computed by the model in lesson.js and
   printed on the canvas; the two agree because both read the same computation.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'fd',
      n: 1,
      title: 'A functional dependency is a promise about every legal instance',
      start: 0, end: 30,
      objective: 'State what X -> Y asserts, separate a constraint from a coincidence in one printed table, and fix the direction of the arrow.'
    },
    {
      id: 'armstrong',
      n: 2,
      title: 'Three rules generate every consequence of a set of FDs',
      start: 30, end: 60,
      objective: 'Use reflexivity, augmentation and transitivity to derive an FD that was never written down, and name the three shortcuts they imply.'
    },
    {
      id: 'closure',
      n: 3,
      title: 'Closure: what one attribute set forces',
      start: 60, end: 90,
      objective: 'Run the closure algorithm on R(A,B,C,D,E) with AB->C, BC->D, C->E and watch AB grow to all five attributes in three passes.'
    },
    {
      id: 'keys',
      n: 4,
      title: 'Candidate key, superkey, and the count',
      start: 90, end: 120,
      objective: 'Separate a superkey from a candidate key, enumerate the 32 subsets of five attributes, and compute the superkey count as a power of two.'
    },
    {
      id: 'nf2',
      n: 5,
      title: '1NF and 2NF: atomic values, and no partial dependency',
      start: 120, end: 150,
      objective: 'Reject a set-valued attribute at 1NF, and distinguish a partial dependency from a transitive one on two schemas from GATE 2018.'
    },
    {
      id: 'nf3',
      n: 6,
      title: '3NF: the prime-attribute exemption',
      start: 150, end: 180,
      objective: 'See the one clause that 3NF adds to BCNF, and use it to keep Schema II in 3NF while it still fails BCNF.'
    },
    {
      id: 'bcnf',
      n: 7,
      title: 'BCNF: no exemption, and how to decompose to reach it',
      start: 180, end: 210,
      objective: 'Test BCNF on GATE 2004 studentPerformance, then split on the violating dependency and re-test both fragments.'
    },
    {
      id: 'lossless',
      n: 8,
      title: 'Lossless join: the join must give back exactly r',
      start: 210, end: 240,
      objective: 'Join two fragments of a two-row instance, watch four rows appear, and state the condition that rules this out in advance.'
    },
    {
      id: 'preserve',
      n: 9,
      title: 'Dependency preservation, and the trade-off with BCNF',
      start: 240, end: 270,
      objective: 'Project a dependency set onto fragments, and see why one schema has no decomposition that is BCNF, lossless and dependency preserving at once.'
    },
    {
      id: 'decision',
      n: 10,
      title: 'The decision procedure, end to end',
      start: 270, end: 300,
      objective: 'Assemble closure, keys, minimal cover, the normal-form ladder and the two decomposition tests into one procedure that answers any question of this kind.'
    }
  ],

  events: [

    /* ---------------- scene 1: fd ---------------- */
    {
      id: 'fd-1', scene: 'fd', start: 0, end: 8,
      caption: 'A functional dependency X -> Y says: whenever two rows agree on every attribute of X, they must also agree on every attribute of Y.',
      narration: 'A functional dependency, written X arrow Y, is a rule about pairs of rows. If two rows agree on all of X, they must agree on all of Y. Nothing else is promised.',
      trap: 'The arrow points one way only. X -> Y never lets you conclude Y -> X.'
    },
    {
      id: 'fd-2', scene: 'fd', start: 8, end: 15,
      caption: 'Here the two rows agree on A, so the dependency A -> B forces them to agree on B as well. Agreeing on B would not have forced anything about A.',
      narration: 'Two rows, both with A equal to one. Because A determines B, both must carry the same B. The reverse is not available: equal B values say nothing about A.',
      trap: 'Equal values on the right-hand side are not evidence for the dependency. Only the left-hand side constrains.'
    },
    {
      id: 'fd-3', scene: 'fd', start: 15, end: 22,
      caption: 'One printed table can satisfy A -> B by accident. The dependency is the claim that no legal instance can ever break it.',
      narration: 'A table is one instance. It can happen to satisfy a dependency without the dependency being true. The dependency is a statement about every instance the schema allows.',
      trap: 'A single table that happens to fit is not a proof, and a single table that breaks it is a refutation.'
    },
    {
      id: 'fd-4', scene: 'fd', start: 22, end: 30,
      caption: 'So a dependency is a constraint you are given, not a pattern you discover. Data can refute an FD; data can never establish one.',
      narration: 'This is why every question of this kind hands you the dependency set. You reason from the set. Data appears only to refute a candidate dependency, never to prove one.',
      trap: 'GATE 2006 asked which FD is NOT implied by a given set. Answering it from the printed rows instead of from the set loses the mark.'
    },

    /* ---------------- scene 2: armstrong ---------------- */
    {
      id: 'arm-1', scene: 'armstrong', start: 30, end: 38,
      caption: 'Reflexivity: if every attribute of Y already sits inside X, then X -> Y holds with no help from the dependency set.',
      narration: 'Rule one is reflexivity. If Y is contained in X, then X arrow Y is true in every relation whatsoever. These are the trivial dependencies, and they are the base case for every derivation.',
      trap: 'Trivial dependencies still count when you test a normal form: skip them, or every schema looks like it violates something.'
    },
    {
      id: 'arm-2', scene: 'armstrong', start: 38, end: 45,
      caption: 'Augmentation: from X -> Y you may add the same attribute set Z to both sides, getting XZ -> YZ.',
      narration: 'Rule two is augmentation. Adding the same attributes to both sides preserves truth. This is the rule that lets a dependency survive inside a larger fragment.',
      trap: 'Augmentation adds to both sides. Adding only to the left is a different and invalid move.'
    },
    {
      id: 'arm-3', scene: 'armstrong', start: 45, end: 52,
      caption: 'Transitivity: X -> Y together with Y -> Z gives X -> Z. Chaining is how a dependency set implies dependencies nobody wrote down.',
      narration: 'Rule three is transitivity. If X determines Y and Y determines Z, then X determines Z. Almost every implied dependency in an exam question is found by chaining these three rules.',
      trap: 'Transitivity needs the middle set to match exactly, or to be reachable by augmentation. A near miss is not a chain.'
    },
    {
      id: 'arm-4', scene: 'armstrong', start: 52, end: 60,
      caption: 'Three useful shortcuts follow: union, decomposition and pseudotransitivity. Each one is proved from the three axioms, so using it is never a leap.',
      narration: 'Union merges two dependencies with the same left side. Decomposition splits a right side into single attributes. Pseudotransitivity chains through part of a left side. All three are theorems, not extra assumptions.',
      trap: 'Union and decomposition are safe on the right side. Splitting the left side is not: AB -> C does not give A -> C.'
    },

    /* ---------------- scene 3: closure ---------------- */
    {
      id: 'clo-1', scene: 'closure', start: 60, end: 68,
      caption: 'Start the closure of AB with AB itself, on R(A,B,C,D,E) with AB -> C, BC -> D and C -> E. This is the schema from GATE CSE 2022.',
      narration: 'The closure of an attribute set X is everything X forces. Begin with X and add nothing else yet. The schema is five attributes with three dependencies, the one GATE 2022 used for its superkey question.',
      trap: 'The closure starts with X inside it. Forgetting that makes every closure one attribute short.'
    },
    {
      id: 'clo-2', scene: 'closure', start: 68, end: 76,
      caption: 'Pass one: AB -> C applies, because AB is already present. The closure grows to ABC.',
      narration: 'Scan the dependencies. AB arrow C has its left side inside what we hold, so C joins the set. We now hold A, B and C.',
      trap: 'A dependency fires only when its whole left side is present. A alone does not fire AB -> C.'
    },
    {
      id: 'clo-3', scene: 'closure', start: 76, end: 83,
      caption: 'Pass two: BC -> D now fires, because both B and C are present. The closure is ABCD.',
      narration: 'Second pass. B and C are both held, so BC arrow D applies and D is added. Holding C alone would not have been enough.',
      trap: 'Order of passes does not matter. Repeat until a whole pass adds nothing; stopping early loses attributes.'
    },
    {
      id: 'clo-4', scene: 'closure', start: 83, end: 90,
      caption: 'Pass three: C -> E fires. The closure is ABCDE, all five attributes, so AB is a superkey.',
      narration: 'Third pass adds E. The closure is now the entire schema, which is exactly the definition of a superkey. A fourth pass adds nothing, so the computation stops.',
      trap: 'A superkey is not automatically a candidate key. AB still has to be shown minimal.'
    },

    /* ---------------- scene 4: keys ---------------- */
    {
      id: 'key-1', scene: 'keys', start: 90, end: 97,
      caption: 'A superkey closes to all five attributes. A candidate key is a superkey that contains no smaller superkey.',
      narration: 'Two definitions, one inside the other. A superkey determines every attribute. A candidate key is a superkey with nothing removable: drop any attribute and the closure falls short.',
      trap: 'Every candidate key is a superkey, but a table can have one candidate key and many superkeys.'
    },
    {
      id: 'key-2', scene: 'keys', start: 97, end: 104,
      caption: 'All 32 subsets of the five attributes are tested. The ones that close to ABCDE are exactly the ones that contain both A and B.',
      narration: 'The model enumerates every subset and computes its closure. Only sets containing A and B can reach C, and through C reach D and E. So the superkeys are AB together with any choice from C, D and E.',
      trap: 'Subsets containing C but not B do reach E, yet never reach D or A. Partial progress is not a superkey.'
    },
    {
      id: 'key-3', scene: 'keys', start: 104, end: 112,
      caption: 'Exactly one subset is minimal: AB. So the schema has one candidate key, and 2 to the power 3, that is 8, superkeys.',
      narration: 'AB is the only minimal superkey, so it is the only candidate key. Every superkey is AB plus any subset of the remaining three attributes, which gives two cubed, eight. GATE 2022 asked for that number.',
      trap: 'The exponent is the number of attributes outside the key, not the number of attributes in it.'
    },
    {
      id: 'key-4', scene: 'keys', start: 112, end: 120,
      caption: 'E on its own is not a key: its closure is just E. C on its own gives CE. Neither reaches all five attributes.',
      narration: 'Check the tempting single attributes. E forces nothing. C forces E, so its closure is C and E. Neither is a key. Only AB is.',
      trap: 'A single attribute that appears on the right of many dependencies is often mistaken for a key. Compute the closure instead.'
    },

    /* ---------------- scene 5: nf2 ---------------- */
    {
      id: 'nf2-1', scene: 'nf2', start: 120, end: 127,
      caption: 'First normal form asks only that every cell hold one atomic value. GATE 2018 Schema I stores a set of courses in one cell, so it is not even in 1NF.',
      narration: 'First normal form is the weakest. Each cell holds one value, not a list. Schema I of GATE 2018 puts a set of courses in a single column, so it fails before any dependency is examined.',
      trap: 'A column whose values are sets is not a violation of 2NF or 3NF. It is a violation of 1NF, and the ladder stops there.'
    },
    {
      id: 'nf2-2', scene: 'nf2', start: 127, end: 135,
      caption: 'Second normal form forbids a non-prime attribute from depending on part of a candidate key. Schema IV has courseid -> credit, with key {rollno, courseid}.',
      narration: 'Second normal form is about partial dependencies. A non-prime attribute may not depend on a proper subset of a key. In Schema IV the key is rollno together with courseid, and courseid alone determines credit.',
      trap: 'The subset must be a proper subset of a candidate key. A left side that is not part of any key is a different defect.'
    },
    {
      id: 'nf2-3', scene: 'nf2', start: 135, end: 143,
      caption: 'credit is non-prime and courseid is a proper subset of the key, so Schema IV is in 1NF only. That is the GATE 2018 answer for that schema.',
      narration: 'The dependency is partial, the right side is not prime, so 2NF fails. Schema IV stops at first normal form. GATE 2018 asked which schema was in 3NF but not BCNF, so this one is ruled out immediately.',
      trap: 'Dropping the composite key and calling courseid the key hides the partial dependency. Find every candidate key first.'
    },
    {
      id: 'nf2-4', scene: 'nf2', start: 143, end: 150,
      caption: 'Schema III has marks -> grade. marks is not part of any key at all, so this is a transitive dependency, not a partial one: Schema III reaches 2NF and stops.',
      narration: 'Schema III looks similar and is one rung higher. Its key is rollno with courseid, and marks is in no key. So marks arrow grade is transitive, not partial. It passes 2NF and fails 3NF.',
      trap: 'Partial and transitive dependencies both cost a rung, but they fail different rungs. Name which one before you name the normal form.'
    },

    /* ---------------- scene 6: nf3 ---------------- */
    {
      id: 'nf3-1', scene: 'nf3', start: 150, end: 158,
      caption: 'Third normal form adds one escape clause to BCNF: a dependency X -> A is allowed even when X is not a superkey, provided A is a prime attribute.',
      narration: 'Third normal form is BCNF with an exception. If the right side is prime, meaning it belongs to some candidate key, then a left side that is not a superkey is tolerated. That single clause is the whole difference between the two forms.',
      trap: 'The clause is about the right side only. A non-superkey left side with a non-prime right side fails 3NF as well.'
    },
    {
      id: 'nf3-2', scene: 'nf3', start: 158, end: 166,
      caption: 'Schema II: rollno, courseid -> email, and email -> rollno. The candidate keys are {rollno, courseid} and {email, courseid}, so rollno is prime.',
      narration: 'Two candidate keys here, because email with courseid also determines everything. That makes rollno a prime attribute. The dependency email arrow rollno has a left side that is not a superkey, but a prime right side.',
      trap: 'The second key is easy to miss. Without it, rollno looks non-prime and Schema II looks like a 2NF failure.'
    },
    {
      id: 'nf3-3', scene: 'nf3', start: 166, end: 173,
      caption: 'So Schema II survives 3NF and fails BCNF on the same dependency. The exemption is the only thing keeping it at 3NF.',
      narration: 'One dependency, two verdicts. For 3NF the prime right side is enough. For BCNF nothing is enough except a superkey on the left. So Schema II is in third normal form and not in BCNF.',
      trap: 'A schema in 3NF is not automatically in BCNF. The converse does hold: BCNF implies 3NF.'
    },
    {
      id: 'nf3-4', scene: 'nf3', start: 173, end: 180,
      caption: 'That is the answer to GATE 2018 Q42: Schema II is the one in 3NF but not BCNF. Schema III stops at 2NF and Schema IV at 1NF.',
      narration: 'Put the four schemas on the ladder and only one lands between third normal form and BCNF. Schema I never enters the ladder, Schema III stops at second, Schema IV at first.',
      trap: 'Reading the four schemas quickly, Schema IV looks like Schema II. The difference is whether the right side is prime.'
    },

    /* ---------------- scene 7: bcnf ---------------- */
    {
      id: 'bcnf-1', scene: 'bcnf', start: 180, end: 188,
      caption: 'BCNF deletes the exemption. Every non-trivial dependency must have a superkey on the left, with no exception for prime attributes.',
      narration: 'BCNF is the strict form. Take every non-trivial dependency and ask one question: is the left side a superkey. If the answer is yes for all of them, the schema is in BCNF. Nothing else is considered.',
      trap: 'Trivial dependencies are excluded. A dependency whose right side sits inside its left side never violates anything.'
    },
    {
      id: 'bcnf-2', scene: 'bcnf', start: 188, end: 196,
      caption: 'GATE 2004 studentPerformance(Name, CourseNo, RollNo, Grade) has keys {Name, CourseNo} and {RollNo, CourseNo}. So Name, CourseNo and RollNo are prime, and Grade is not.',
      narration: 'Name with CourseNo determines Grade, and RollNo with CourseNo does too. Name and RollNo determine each other, which creates the second key. Three attributes are prime and Grade alone is not.',
      trap: 'Grade looks prime because every row has one. Prime means part of a candidate key, not present in every row.'
    },
    {
      id: 'bcnf-3', scene: 'bcnf', start: 196, end: 204,
      caption: 'Name -> RollNo has a non-superkey on the left but a prime right side, so 3NF allows it and BCNF does not. The schema is in 3NF only.',
      narration: 'Name arrow RollNo is the violating dependency. Third normal form forgives it because RollNo is prime. BCNF does not, because Name is not a superkey. The highest normal form is third.',
      trap: 'The answer is 3NF, not BCNF, even though Name and RollNo determine each other. Mutual determination is not a superkey.'
    },
    {
      id: 'bcnf-4', scene: 'bcnf', start: 204, end: 210,
      caption: 'To reach BCNF, split on the violating dependency: one fragment holds its two sides, the other holds the left side plus everything left over. Both fragments are then re-tested.',
      narration: 'The decomposition rule is mechanical. For a violating dependency, make one fragment from its left and right sides, and one from its left side plus all remaining attributes. Then test each fragment again, because a fragment can violate BCNF too.',
      trap: 'The rule always removes the violation but does not always preserve the dependencies. Scene 9 shows a schema where it cannot.'
    },

    /* ---------------- scene 8: lossless ---------------- */
    {
      id: 'll-1', scene: 'lossless', start: 210, end: 218,
      caption: 'GATE 2001: R(A,B,C,D) with A -> B and C -> D, decomposed into AB and CD. The two fragments share no attribute at all.',
      narration: 'Here is a decomposition that looks natural: one fragment per dependency. A arrow B lives in AB and C arrow D lives in CD, so nothing is lost. But the fragments have nothing in common.',
      trap: 'A decomposition that keeps every dependency can still be wrong. Preservation and losslessness are separate tests.'
    },
    {
      id: 'll-2', scene: 'lossless', start: 218, end: 226,
      caption: 'Take a two-row instance, project it onto ABC and onto AD, then join the two results. The join has four rows, not two.',
      narration: 'Project r onto A, B, C and onto A, D. Each projection has two rows. Joining them pairs every row with every row on the shared attribute A, so two rows become four.',
      trap: 'The join of two projections is always a superset of the original. The question is whether it is strictly larger.'
    },
    {
      id: 'll-3', scene: 'lossless', start: 226, end: 234,
      caption: 'Every original row survives, and two rows that never existed appear. That is what lossy means: r is a proper subset of the join, so information was invented.',
      narration: 'Both original rows are still there, so nothing was lost in that sense. But two spurious rows appeared. A lossy decomposition adds tuples that the constraints forbid, and that is the failure.',
      trap: 'Lossy does not mean rows disappeared. It means rows appeared. GATE 2005 asked exactly this, and the answer was that r is a subset of the join.'
    },
    {
      id: 'll-4', scene: 'lossless', start: 234, end: 240,
      caption: 'The two-fragment test: the join is lossless exactly when the shared attributes determine all of one fragment. Here the shared set is empty, so the test fails.',
      narration: 'For two fragments there is a shortcut. Take the attributes they share and compute the closure. If it contains all of one fragment, the join is lossless. Here they share nothing, so the closure is empty and the test fails at once.',
      trap: 'With three or more fragments there is no such shortcut. Use the chase, which is the same test generalised.'
    },

    /* ---------------- scene 9: preserve ---------------- */
    {
      id: 'dp-1', scene: 'preserve', start: 240, end: 248,
      caption: 'A dependency is preserved when its left and right sides both fit inside one fragment, or when the fragments together still imply it.',
      narration: 'Project the dependency set onto each fragment: keep a dependency only if all of its attributes live in that fragment. The decomposition preserves the set when the union of those projections still implies every original dependency.',
      trap: 'A dependency whose attributes are split across two fragments is not automatically lost. It may still be implied by the union.'
    },
    {
      id: 'dp-2', scene: 'preserve', start: 248, end: 256,
      caption: 'GATE 2001: R(A,B,C,D) with AB -> C and C -> AD, split into ABC and CD. AB -> C fits in ABC, and C -> A does too, so everything survives.',
      narration: 'Here the split works for preservation. AB arrow C sits inside ABC. C arrow A also sits inside ABC, because A is in that fragment. C arrow D sits inside CD. Every dependency has a home.',
      trap: 'It is tempting to stop here and call the decomposition good. Preservation is only one of three requirements.'
    },
    {
      id: 'dp-3', scene: 'preserve', start: 256, end: 264,
      caption: 'But ABC is not in BCNF: C -> A has a non-superkey on the left. The model enumerated all 14 partitions of ABCD, and none is BCNF, lossless and dependency preserving at once.',
      narration: 'Fragment ABC inherits C arrow A, and C is not a superkey of ABC. To fix that you must split A away from C, and once you do, AB arrow C has no home. The model tested every partition and found no decomposition satisfying all three requirements.',
      trap: 'This is the schema GATE 2001 asked about. The answer is that no such decomposition exists, not that a clever one was missed.'
    },
    {
      id: 'dp-4', scene: 'preserve', start: 264, end: 270,
      caption: 'So the three goals conflict. A 3NF decomposition always exists that is lossless and dependency preserving; a BCNF one need not. That trade-off is the examinable fact.',
      narration: 'Third normal form synthesis always succeeds on both counts, at the cost of leaving some redundancy. BCNF removes more redundancy but can force a choice. Knowing which guarantee survives is what these questions test.',
      trap: 'The theorem is about existence, not about every decomposition. A particular BCNF split can still be lossless and preserving.'
    },

    /* ---------------- scene 10: decision ---------------- */
    {
      id: 'dec-1', scene: 'decision', start: 270, end: 278,
      caption: 'Step one: compute the closure of every candidate left side, and from the closures read off all candidate keys. Step two: mark the prime attributes.',
      narration: 'Every question of this kind begins the same way. Closure gives you the keys. The keys give you the prime attributes. Almost every later answer depends on those two facts, so compute them before anything else.',
      trap: 'Missing one candidate key makes an attribute look non-prime and moves the schema one rung down the ladder.'
    },
    {
      id: 'dec-2', scene: 'decision', start: 278, end: 286,
      caption: 'Step three: reduce the set to a minimal cover, then ask of each dependency: is the left side a superkey, and is the right side prime. Those two answers place the schema on the ladder.',
      narration: 'A minimal cover has single attributes on the right and no redundant attributes or dependencies, so it is the shortest set of tests. Superkey on the left means BCNF. Non-superkey with a prime right side means 3NF. Non-superkey with a non-prime right side means at most 2NF, or 1NF if the left side is part of a key.',
      trap: 'Testing the original set instead of a minimal cover can miss a violation hidden behind a redundant dependency.'
    },
    {
      id: 'dec-3', scene: 'decision', start: 286, end: 294,
      caption: 'Step four: for a proposed decomposition, run the chase for losslessness and the projection test for preservation. Both are mechanical and both must pass.',
      narration: 'Once a decomposition is proposed, two independent tests decide it. The chase builds a tableau and looks for an all-distinguished row. The projection test checks that every original dependency is still implied. A decomposition can pass one and fail the other.',
      trap: 'Dependency preservation does not imply losslessness, and losslessness does not imply preservation. GATE 2001 asked each one separately.'
    },
    {
      id: 'dec-4', scene: 'decision', start: 294, end: 300,
      caption: 'Two facts survive every variation: 3NF synthesis always gives a lossless, dependency preserving decomposition; BCNF cannot always be reached without giving one of them up.',
      narration: 'Hold these two facts and the questions become checkable rather than memorable. Third normal form always has a safe decomposition. BCNF sometimes forces a choice between the two guarantees, and no amount of searching avoids it.',
      trap: 'Neither fact says anything about how many questions will appear. They are theorems about schemas, not forecasts about the paper.'
    }
  ]
};
