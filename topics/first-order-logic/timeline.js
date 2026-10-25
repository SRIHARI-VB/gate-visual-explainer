/* ==========================================================================
   first-order-logic — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs — never edited by hand.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'predicate',
      n: 1,
      title: 'A predicate waits for a value',
      start: 0, end: 30,
      objective: 'Separate a proposition from a predicate, and see that a predicate becomes true or false only once its variable is given a value from the domain.'
    },
    {
      id: 'forall',
      n: 2,
      title: 'The universal quantifier is a big AND',
      start: 30, end: 62,
      objective: 'Evaluate for-all over a finite domain as a conjunction, and see why one false case refutes it while the empty domain makes it vacuously true.'
    },
    {
      id: 'exists',
      n: 3,
      title: 'The existential quantifier is a big OR',
      start: 62, end: 94,
      objective: 'Evaluate there-exists over a finite domain as a disjunction, name the witness, and note the asymmetry with for-all on the empty domain.'
    },
    {
      id: 'domain',
      n: 4,
      title: 'The domain decides the truth value',
      start: 94, end: 124,
      objective: 'Show the same formula evaluated over two different domains, computed both times, and state why an unstated domain makes a question incomplete.'
    },
    {
      id: 'negation',
      n: 5,
      title: 'NOT flips the quantifier',
      start: 124, end: 160,
      objective: 'Derive and verify both quantifier negation laws, then apply them to the "not all that glitters is gold" pattern.'
    },
    {
      id: 'order',
      n: 6,
      title: 'Order matters when the quantifiers differ',
      start: 160, end: 202,
      objective: 'Read for-all-there-exists and there-exists-for-all off one relation grid, and exhibit a model where the first is true and the second false.'
    },
    {
      id: 'swap',
      n: 7,
      title: 'Same-kind swap is free, mixed swap is not',
      start: 202, end: 228,
      objective: 'Verify that quantifiers of the same kind commute, and that the mixed pair only implies in one direction, with the model counts that show it.'
    },
    {
      id: 'translation',
      n: 8,
      title: 'Implication for ALL, conjunction for SOME',
      start: 228, end: 266,
      objective: 'Translate restricted English sentences into the correct shape and compute what the two swapped shapes do on the same domain.'
    },
    {
      id: 'scope',
      n: 9,
      title: 'Free, bound, and what a sentence is',
      start: 266, end: 288,
      objective: 'Find the free variables of a formula mechanically, and state what it means for a formula to be a sentence.'
    },
    {
      id: 'rules',
      n: 10,
      title: 'The three rules to carry into the exam',
      start: 288, end: 300,
      objective: 'Consolidate the quantifier-as-loop picture, the negation law and the order restriction into three lines.'
    }
  ],

  events: [
    /* ---------------- scene 1: predicate ---------------- */
    {
      id: 'p-1', start: 0, end: 7, scene: 'predicate',
      caption: 'A proposition has a truth value. A predicate does not — until its variable is given one.',
      detail: '"7 is prime" is a proposition: true. "x is prime" is a predicate: neither true nor false until x is named. The missing ingredient is a value for x.',
      keyword: 'predicate',
      trap: 'A predicate is not a proposition. It becomes one only after a value or a quantifier is supplied.',
      narration: 'A proposition has a truth value. A predicate does not, until its variable is given one.'
    },
    {
      id: 'p-2', start: 7, end: 15, scene: 'predicate',
      caption: 'Write P(x) for "x is greater than 5". Then P(2) is false, P(7) is true, P(9) is true.',
      detail: 'Each substitution of a value turns the predicate into a proposition. The three verdicts below are computed by evaluating the comparison, not typed in by hand.',
      keyword: 'P(2) is false',
      trap: null,
      narration: 'Write P of x for x is greater than five. Then P of two is false, P of seven is true, P of nine is true.'
    },
    {
      id: 'p-3', start: 15, end: 22, scene: 'predicate',
      caption: 'The domain is the set of values the variable may take. It is part of the meaning.',
      detail: 'The domain, also called the universe of discourse, is declared with the formula. A formula evaluated on one domain may be true and on another false — scene four shows exactly that.',
      keyword: 'domain',
      trap: null,
      narration: 'The domain is the set of values the variable may take. It is part of the meaning.'
    },
    {
      id: 'p-4', start: 22, end: 30, scene: 'predicate',
      caption: 'Bind the variable with a quantifier and the predicate is a proposition again.',
      detail: 'A quantifier says how many values of the domain must satisfy the predicate: all of them, or at least one. A formula in which every variable is bound has a truth value in a model, and is called a sentence.',
      keyword: 'quantifier',
      trap: null,
      narration: 'Bind the variable with a quantifier and the predicate is a proposition again.'
    },

    /* ---------------- scene 2: forall ---------------- */
    {
      id: 'f-1', start: 30, end: 37, scene: 'forall',
      caption: 'For all x, P(x) — written with an upside-down A — means every element of the domain satisfies P.',
      detail: 'The symbol is read "for all" or "for every". The variable after it is bound: it is a placeholder, not a name of any particular element.',
      keyword: 'every element',
      trap: null,
      narration: 'For all x, P of x, written with an upside-down A, means every element of the domain satisfies P.'
    },
    {
      id: 'f-2', start: 37, end: 45, scene: 'forall',
      caption: 'Over a finite domain it is just a conjunction: P(a) and P(b) and P(c).',
      detail: 'This is the whole computation. For-all over a domain of three elements is one AND of three propositions, so a for-all question on a small domain can always be settled by checking each element.',
      keyword: 'conjunction',
      trap: null,
      narration: 'Over a finite domain it is just a conjunction: P of a and P of b and P of c.'
    },
    {
      id: 'f-3', start: 45, end: 53, scene: 'forall',
      caption: 'One false case refutes it. Here P(b) is false, so for-all is false.',
      detail: 'A single element that fails is a counterexample to the universal claim. Note the contrast with there-exists, where one true case is enough to confirm.',
      keyword: 'One false case',
      trap: 'A single counterexample refutes a for-all claim completely; no number of agreeing elements can establish one.',
      narration: 'One false case refutes it. Here P of b is false, so for-all is false.'
    },
    {
      id: 'f-4', start: 53, end: 62, scene: 'forall',
      caption: 'On the empty domain there is nothing to check, so for-all is vacuously true.',
      detail: 'An empty conjunction is true. This is not a trick of notation: it is why "every unicorn is blue" is true when there are no unicorns. GATE questions often say "assuming non-empty domains" precisely to switch this case off.',
      keyword: 'vacuously true',
      trap: 'For-all over an empty domain is TRUE; there-exists over an empty domain is FALSE. The two quantifiers differ at exactly this boundary.',
      narration: 'On the empty domain there is nothing to check, so for-all is vacuously true.'
    },

    /* ---------------- scene 3: exists ---------------- */
    {
      id: 'e-1', start: 62, end: 69, scene: 'exists',
      caption: 'There exists x with P(x) — written with a backwards E — means at least one element satisfies P.',
      detail: 'Read "there is", "there exists", "for some". It asserts one witness, not a particular one, and not a unique one.',
      keyword: 'at least one',
      trap: null,
      narration: 'There exists x with P of x, written with a backwards E, means at least one element satisfies P.'
    },
    {
      id: 'e-2', start: 69, end: 77, scene: 'exists',
      caption: 'Over a finite domain it is a disjunction: P(a) or P(b) or P(c).',
      detail: 'The same loop picture as for-all, with OR instead of AND. This is the single most useful mental model in the topic: for-all is a big AND, there-exists is a big OR.',
      keyword: 'disjunction',
      trap: null,
      narration: 'Over a finite domain it is a disjunction: P of a or P of b or P of c.'
    },
    {
      id: 'e-3', start: 77, end: 85, scene: 'exists',
      caption: 'One true case is enough. That element is called a witness.',
      detail: 'To prove a there-exists claim you exhibit one witness. To refute it you must show that every element fails, which is exactly the for-all-not statement.',
      keyword: 'witness',
      trap: null,
      narration: 'One true case is enough. That element is called a witness.'
    },
    {
      id: 'e-4', start: 85, end: 94, scene: 'exists',
      caption: 'On the empty domain there is no witness, so there-exists is false.',
      detail: 'The two quantifiers therefore disagree on the empty domain: for-all is true there and there-exists is false. A formula claiming for-all implies there-exists is valid on every non-empty domain and fails on the empty one.',
      keyword: 'no witness',
      trap: 'for-all x P(x) implies there-exists x P(x) is NOT valid on the empty domain. It is valid as soon as the domain is non-empty.',
      narration: 'On the empty domain there is no witness, so there-exists is false.'
    },

    /* ---------------- scene 4: domain ---------------- */
    {
      id: 'd-1', start: 94, end: 101, scene: 'domain',
      caption: 'Truth in first-order logic is always relative to a domain and an interpretation.',
      detail: 'A model is a domain plus a meaning for every predicate symbol. A sentence is true in a model, not true absolutely. Validity means true in every model.',
      keyword: 'relative to a domain',
      trap: null,
      narration: 'Truth in first-order logic is always relative to a domain and an interpretation.'
    },
    {
      id: 'd-2', start: 101, end: 109, scene: 'domain',
      caption: 'Take: there exists x such that x is even and x is prime. On {2,4,6} it is true.',
      detail: 'The witness is 2 — even and prime at once. Both predicates are computed on each element, then the conjunction, then the disjunction over the domain.',
      keyword: 'true',
      trap: null,
      narration: 'Take: there exists x such that x is even and x is prime. On the domain two, four, six it is true.'
    },
    {
      id: 'd-3', start: 109, end: 117, scene: 'domain',
      caption: 'The same formula on {9,15,21} is false: every element fails the first predicate.',
      detail: 'Nothing about the formula changed. Only the domain changed. Every value that makes the formula true lies outside the new domain, so there is no witness inside it.',
      keyword: 'false',
      trap: 'A question that never states the domain is incomplete. Read the domain line before evaluating anything.',
      narration: 'The same formula on nine, fifteen, twenty-one is false: every element fails the first predicate.'
    },
    {
      id: 'd-4', start: 117, end: 124, scene: 'domain',
      caption: 'So a quantified formula is never true on its own — the model comes first.',
      detail: 'The practical rule for the exam: write the domain at the top of your rough work, then substitute. Most translation errors are really domain errors in disguise.',
      keyword: 'the model comes first',
      trap: null,
      narration: 'So a quantified formula is never true on its own. The model comes first.'
    },

    /* ---------------- scene 5: negation ---------------- */
    {
      id: 'n-1', start: 124, end: 131, scene: 'negation',
      caption: 'Put NOT in front of a quantifier and the quantifier flips.',
      detail: 'Negation pushes through a quantifier by swapping for-all with there-exists and negating the body. There is no third case: the two laws below cover every formula that starts with a quantifier.',
      keyword: 'the quantifier flips',
      trap: null,
      narration: 'Put not in front of a quantifier and the quantifier flips.'
    },
    {
      id: 'n-2', start: 131, end: 139, scene: 'negation',
      caption: 'NOT for-all is there-exists NOT: not (for all x, P(x)) means some x fails P.',
      detail: 'If not every element has the property, at least one element lacks it. Both sides were evaluated on all eight predicates over a three-element domain and agreed every time.',
      keyword: 'there-exists NOT',
      trap: null,
      narration: 'Not for all x P of x means some x fails P.'
    },
    {
      id: 'n-3', start: 139, end: 147, scene: 'negation',
      caption: 'NOT there-exists is for-all NOT: no x has P means every x lacks P.',
      detail: 'The second law is the first with the negation moved to the other side. Both are verified in code on every predicate over the three-element domain.',
      keyword: 'for-all NOT',
      trap: null,
      narration: 'Not there exists x P of x means every x lacks P.'
    },
    {
      id: 'n-4', start: 147, end: 154, scene: 'negation',
      caption: '"Not all that glitters is gold" becomes: some x glitters and is not gold.',
      detail: 'Negate the for-all, then push the negation inside the implication: not (glitters implies gold) is glitters and not gold. This is GATE CSE 2014 Set 1, question 1, and the same idea appears as "not all rainy days are cold".',
      keyword: 'some x glitters and is not gold',
      trap: '"Not all that glitters is gold" is NOT "all that glitters is not gold". The first is one counterexample; the second is a universal claim.',
      narration: 'Not all that glitters is gold becomes: some x glitters and is not gold.'
    },
    {
      id: 'n-5', start: 154, end: 160, scene: 'negation',
      caption: 'Both laws hold on every model — they are equivalences, not rules of thumb.',
      detail: 'Equivalence means the two formulas have the same truth value in every model with every assignment. The check ran over every unary predicate on the three-element domain and every binary relation as well.',
      keyword: 'equivalences',
      trap: null,
      narration: 'Both laws hold on every model. They are equivalences, not rules of thumb.'
    },

    /* ---------------- scene 6: order ---------------- */
    {
      id: 'o-1', start: 160, end: 167, scene: 'order',
      caption: 'Two variables, two quantifiers — now the order is part of the meaning.',
      detail: 'The grid shows a binary relation R: row x, column y, a filled cell means R(x,y) holds. Reading a row is fixing x; reading a column is fixing y.',
      keyword: 'the order is part of the meaning',
      trap: null,
      narration: 'Two variables, two quantifiers. Now the order is part of the meaning.'
    },
    {
      id: 'o-2', start: 167, end: 176, scene: 'order',
      caption: 'For all x there exists y: each row needs some filled cell, and y may differ per row.',
      detail: 'The witness for y is allowed to depend on x. Read it as a function of x: for every x you may look for a y that suits that x.',
      keyword: 'y may differ per row',
      trap: null,
      narration: 'For all x there exists y: each row needs some filled cell, and y may differ per row.'
    },
    {
      id: 'o-3', start: 176, end: 186, scene: 'order',
      caption: 'There exists y for all x: one single column must be filled all the way down.',
      detail: 'Now the witness is chosen first, before x is known, so it must work for every x. The dependency is reversed: y may not depend on x.',
      keyword: 'one single column',
      trap: null,
      narration: 'There exists y for all x: one single column must be filled all the way down.'
    },
    {
      id: 'o-4', start: 186, end: 194, scene: 'order',
      caption: 'Here the first is true and the second false: the three witnesses are all different.',
      detail: 'Every row has a filled cell, so the for-all-there-exists sentence is true. No column is completely filled, so the there-exists-for-all sentence is false. This is the smallest counterexample and it needs only three elements.',
      keyword: 'the second false',
      trap: null,
      narration: 'Here the first is true and the second false: the three witnesses are all different.'
    },
    {
      id: 'o-5', start: 194, end: 202, scene: 'order',
      caption: 'So for-all-there-exists does not imply there-exists-for-all.',
      detail: 'The reverse implication does hold and is checked in the next scene. Remember the direction: the stronger sentence, where one witness serves everybody, implies the weaker one, never the other way round.',
      keyword: 'does not imply',
      trap: 'Reading "for every x there is a y" as "there is a y for every x" is the single most common quantifier error in GATE translations.',
      narration: 'So for all x there exists y does not imply there exists y for all x.'
    },

    /* ---------------- scene 7: swap ---------------- */
    {
      id: 's-1', start: 202, end: 209, scene: 'swap',
      caption: 'Two quantifiers of the same kind may be swapped freely.',
      detail: 'Swapping two for-alls, or two there-exists, changes nothing: a double loop over the same grid in the other order still visits every pair.',
      keyword: 'same kind',
      trap: null,
      narration: 'Two quantifiers of the same kind may be swapped freely.'
    },
    {
      id: 's-2', start: 209, end: 216, scene: 'swap',
      caption: 'for-all x for-all y equals for-all y for-all x, and the same for there-exists.',
      detail: 'Both equivalences were verified on all 512 binary relations over a three-element domain, with no disagreement. Swapping the grid is a transpose, and the truth of a universal or existential over the whole grid survives a transpose.',
      keyword: 'equals',
      trap: null,
      narration: 'For all x for all y equals for all y for all x, and the same for there exists.'
    },
    {
      id: 's-3', start: 216, end: 222, scene: 'swap',
      caption: 'The mixed pair implies one way only: there-exists-for-all implies for-all-there-exists.',
      detail: 'If one y works for every x, then in particular each x has a y — namely that one. The other direction fails, as the previous scene showed.',
      keyword: 'one way only',
      trap: null,
      narration: 'The mixed pair implies one way only: there exists y for all x implies for all x there exists y.'
    },
    {
      id: 's-4', start: 222, end: 228, scene: 'swap',
      caption: 'Of the 512 relations on three elements, 169 satisfy there-exists-for-all and 343 satisfy for-all-there-exists.',
      detail: 'Both counts are computed by enumerating every relation. 343 minus 169 gives 174 relations that separate the two sentences — the one-way implication is not an equivalence.',
      keyword: '169',
      trap: null,
      narration: 'Of the 512 relations on three elements, 169 satisfy there exists y for all x, and 343 satisfy for all x there exists y.'
    },

    /* ---------------- scene 8: translation ---------------- */
    {
      id: 't-1', start: 228, end: 235, scene: 'translation',
      caption: 'Every restricted English sentence has one right shape.',
      detail: 'Restricted sentences — "all students", "some student" — combine a property that selects the group with a property claimed of it. The quantifier chooses the connective, and only one connective works.',
      keyword: 'one right shape',
      trap: null,
      narration: 'Every restricted English sentence has one right shape.'
    },
    {
      id: 't-2', start: 235, end: 243, scene: 'translation',
      caption: 'For ALL, restrict with an implication: for all x, student implies studies.',
      detail: 'The implication quietly exempts everything that is not a student, which is what "all students" means. On the domain below, the teacher makes the implication vacuously true and does not disturb the claim.',
      keyword: 'implication',
      trap: null,
      narration: 'For all, restrict with an implication: for all x, student implies studies.'
    },
    {
      id: 't-3', start: 243, end: 251, scene: 'translation',
      caption: 'For SOME, restrict with a conjunction: there exists x who is a student and studies.',
      detail: 'The witness must be both a student and a studier. A conjunction forces that; an implication does not, because a non-student satisfies it for free.',
      keyword: 'conjunction',
      trap: null,
      narration: 'For some, restrict with a conjunction: there exists x who is a student and studies.'
    },
    {
      id: 't-4', start: 251, end: 259, scene: 'translation',
      caption: 'Swap them and both sentences break on the same domain.',
      detail: 'For all x, student and studies is false because the teacher is not a student. There exists x, student implies studies, is true because the teacher satisfies the implication — and it says nothing about students at all.',
      keyword: 'both sentences break',
      trap: 'Under for-all, a conjunction is too strong; under there-exists, an implication is too weak. Both errors are marked wrong, and both are common.',
      narration: 'Swap them and both sentences break on the same domain.'
    },
    {
      id: 't-5', start: 259, end: 266, scene: 'translation',
      caption: 'The four verdicts on this one domain are computed, not assumed.',
      detail: 'The model has three elements: a student who studies, a student who does not, and a non-student. Every one of the four formulas is evaluated on it, which is what makes the comparison exact rather than rhetorical.',
      keyword: 'computed',
      trap: null,
      narration: 'The four verdicts on this one domain are computed, not assumed.'
    },

    /* ---------------- scene 9: scope ---------------- */
    {
      id: 'b-1', start: 266, end: 273, scene: 'scope',
      caption: 'A quantifier binds its variable inside its scope only.',
      detail: 'The scope is the part of the formula the quantifier governs. Inside it, every occurrence of that variable refers to the bound placeholder; outside it, an occurrence of the same letter is a different, free variable.',
      keyword: 'scope',
      trap: null,
      narration: 'A quantifier binds its variable inside its scope only.'
    },
    {
      id: 'b-2', start: 273, end: 280, scene: 'scope',
      caption: 'In for-all x (P(x) and Q(y)), x is bound and y is free.',
      detail: 'The free variables are found mechanically: walk the formula, remove the bound occurrences, and whatever is left is free. The code in this lesson does exactly that walk.',
      keyword: 'x is bound and y is free',
      trap: null,
      narration: 'In for all x, P of x and Q of y, x is bound and y is free.'
    },
    {
      id: 'b-3', start: 280, end: 288, scene: 'scope',
      caption: 'No free variables means a sentence — it has a truth value in a model.',
      detail: 'A sentence is true or false in each model, which is what makes validity and satisfiability definable for it. A formula with free variables needs an assignment as well as a model before it can be judged.',
      keyword: 'sentence',
      trap: null,
      narration: 'No free variables means a sentence: it has a truth value in a model.'
    },

    /* ---------------- scene 10: rules ---------------- */
    {
      id: 'r-1', start: 288, end: 293, scene: 'rules',
      caption: 'One: for-all is a big AND, there-exists is a big OR.',
      detail: 'Run the loop over the domain in your head. That one picture settles vacuous truth, witnesses and counterexamples at the same time.',
      keyword: 'big AND',
      trap: null,
      narration: 'Rule one: for all is a big AND, there exists is a big OR.'
    },
    {
      id: 'r-2', start: 293, end: 297, scene: 'rules',
      caption: 'Two: NOT flips the quantifier and negates the body.',
      detail: 'not for-all is there-exists-not; not there-exists is for-all-not. Push negation inwards one quantifier at a time, from the outside.',
      keyword: 'flips the quantifier',
      trap: null,
      narration: 'Rule two: not flips the quantifier and negates the body.'
    },
    {
      id: 'r-3', start: 297, end: 300, scene: 'rules',
      caption: 'Three: mixed order is not swappable — only there-exists-for-all implies for-all-there-exists.',
      detail: 'Same-kind quantifiers commute freely. Mixed quantifiers do not, and the implication runs in one direction only.',
      keyword: 'not swappable',
      trap: null,
      narration: 'Rule three: mixed order is not swappable. Only there exists y for all x implies for all x there exists y.'
    }
  ]
};
