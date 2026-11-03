/* ==========================================================================
   first-order-resolution-and-unification — THE timeline.
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
      id: 'why',
      n: 1,
      title: 'A quantified claim is a promise, not a clause',
      start: 0, end: 30,
      objective: 'See why propositional resolution does not apply directly to a sentence with a quantifier, and what unification is for.'
    },
    {
      id: 'terms',
      n: 2,
      title: 'Terms are trees, and trees can nest',
      start: 30, end: 60,
      objective: 'Read a term as a finite tree of constants, variables and function symbols, and see why the term universe is infinite.'
    },
    {
      id: 'subst',
      n: 3,
      title: 'A substitution is a finite list of replacements',
      start: 60, end: 90,
      objective: 'Apply a substitution to a term, compose two of them, and see that the order of composition matters.'
    },
    {
      id: 'unify',
      n: 4,
      title: 'Walk both trees until they disagree',
      start: 90, end: 120,
      objective: 'Run the unification algorithm on f(x,g(y)) against f(a,g(b)) and read the two bindings off the walk.'
    },
    {
      id: 'fail',
      n: 5,
      title: 'The three ways unification fails',
      start: 120, end: 150,
      objective: 'Separate a clash from an occurs check from a binding that is undone by a later one, and know which is repairable.'
    },
    {
      id: 'mgu',
      n: 6,
      title: 'The most general unifier is the least commitment',
      start: 150, end: 180,
      objective: 'State what makes a unifier most general, and see every other unifier as an instance of it.'
    },
    {
      id: 'skolem',
      n: 7,
      title: 'Skolemisation: a witness needs a name',
      start: 180, end: 210,
      objective: 'Turn a prenex sentence into clauses, give each existential a Skolem symbol of the right arity, and say what is preserved.'
    },
    {
      id: 'resolve',
      n: 8,
      title: 'Resolve after you unify',
      start: 210, end: 240,
      objective: 'State the first-order resolution rule: rename apart, unify one complementary pair, apply that unifier to everything else.'
    },
    {
      id: 'proof',
      n: 9,
      title: 'One refutation, lifted from the ground case',
      start: 240, end: 270,
      objective: 'Read the two-step refutation of the Socrates set as a tree, and see what the lifting lemma buys.'
    },
    {
      id: 'limits',
      n: 10,
      title: 'What this method does not do',
      start: 270, end: 300,
      objective: 'Name the three limits — semi-decidability, no built-in equality, and syntactic matching — and answer the GATE 2017 item.'
    }
  ],

  events: [
    /* ---------- scene 1: why ---------- */
    {
      id: 'w-1', scene: 'why', start: 0, end: 7.5,
      caption: 'A clause is a ground clause: every variable has already been replaced by an object.',
      detail: 'Propositional resolution works on clauses with no variables. A sentence such as "every student is a person" is not a clause: it is a promise about every object in the domain at once, and a promise is not a disjunction of literals.',
      narration: 'A clause is a ground clause. Every variable has already been replaced by an object.',
      keyword: 'ground clause',
      trap: 'Treating "for all x" as a decoration on a clause. It changes what the clause promises.'
    },
    {
      id: 'w-2', scene: 'why', start: 7.5, end: 15,
      caption: 'One way out is to instantiate: write one clause per object, then resolve propositionally.',
      detail: 'Instantiating gives ground clauses, and ground resolution is complete. But the number of instances is the size of the domain, and the domain can be infinite, so the method has no last step.',
      narration: 'One way out is to instantiate. Write one clause per object, then resolve propositionally.',
      keyword: 'instantiate',
      trap: 'Believing instantiation is a decision procedure. It is a proof procedure that may never stop.'
    },
    {
      id: 'w-3', scene: 'why', start: 15, end: 22.5,
      caption: 'The other way out is to ask when two atoms can be made identical by one substitution.',
      detail: 'Instead of guessing an instance, ask a question about the atoms themselves: is there a single replacement of variables that turns P(x, a) and P(f(y), a) into the same atom? If yes, that replacement is a unifier, and it plays the role of the instance without ever naming an object.',
      narration: 'The other way out is to ask when two atoms can be made identical by one substitution.',
      keyword: 'one substitution',
      trap: 'Reading unification as equality of terms. It is equality after a substitution, which is a weaker question.'
    },
    {
      id: 'w-4', scene: 'why', start: 22.5, end: 30,
      caption: 'Robinson 1965 combined the substitution and the truth-functional step into one rule.',
      detail: 'Robinson replaced the alternating cycle of "substitute, then analyse truth-functionally" with a single inference, and proved the result complete. That is why first-order resolution is one rule and one algorithm rather than a family of rules.',
      narration: 'Robinson combined the substitution and the truth-functional step into one rule.',
      keyword: 'one rule',
      trap: 'Thinking resolution is a heuristic. It is a complete refutation procedure, and incompleteness is a different claim.'
    },

    /* ---------- scene 2: terms ---------- */
    {
      id: 't-1', scene: 'terms', start: 30, end: 37.5,
      caption: 'A term is a constant, a variable, or a function symbol applied to terms.',
      detail: 'That is the whole grammar, and it is recursive: f(g(a), x) is a term because f takes two terms and g(a) and x are terms. Nothing else is a term. A predicate applied to terms is an atom, not a term.',
      narration: 'A term is a constant, a variable, or a function symbol applied to terms.',
      keyword: 'recursive',
      trap: 'Putting a predicate inside a term. P(x) is an atom; f(P(x)) is not a term in first-order logic.'
    },
    {
      id: 't-2', scene: 'terms', start: 37.5, end: 45,
      caption: 'So a term is a finite tree, and the symbol at the root is what the term is.',
      detail: 'The root decides everything: f(x, g(y)) is a term whose root is f with two arguments. Two terms are syntactically equal exactly when their trees are equal node for node, including every symbol name.',
      narration: 'So a term is a finite tree, and the symbol at the root is what the term is.',
      keyword: 'finite tree',
      trap: 'Comparing terms by their printed form. Spacing and brackets differ; the tree does not.'
    },
    {
      id: 't-3', scene: 'terms', start: 45, end: 52.5,
      caption: 'Because f may be applied to its own output, the set of terms is infinite.',
      detail: 'a, f(a), f(f(a)) and so on are all different terms. That infinity is exactly why the lesson needs unification: there is no largest term to write down, so a method that enumerates terms cannot be complete in a finite number of steps.',
      narration: 'Because a function may be applied to its own output, the set of terms is infinite.',
      keyword: 'infinite',
      trap: 'Assuming a finite signature gives finitely many terms. Nesting gives infinitely many.'
    },
    {
      id: 't-4', scene: 'terms', start: 52.5, end: 60,
      caption: 'A substitution maps variables to terms, and never touches constants.',
      detail: 'Only variables are replaceable. That is the asymmetry the whole method rests on: constants and function symbols are fixed, variables are the only thing a proof may choose.',
      narration: 'A substitution maps variables to terms, and never touches constants.',
      keyword: 'only variables',
      trap: 'Trying to substitute for a constant. A constant is a name, not a placeholder.'
    },

    /* ---------- scene 3: subst ---------- */
    {
      id: 's-1', scene: 'subst', start: 60, end: 67.5,
      caption: 'Applying {x/a, y/b} to f(x, g(y)) gives f(a, g(b)).',
      detail: 'The substitution is applied to every node at once, not one node per step. Applying it twice changes nothing, which is what it means for a substitution to be idempotent.',
      narration: 'Applying x to a and y to b to f of x, g of y gives f of a, g of b.',
      keyword: 'every node at once',
      trap: 'Applying a substitution left to right and stopping. It reaches every occurrence.'
    },
    {
      id: 's-2', scene: 'subst', start: 67.5, end: 75,
      caption: 'Composing two substitutions means: apply the first, then the second.',
      detail: 'The composition of sigma and theta is written sigma then theta, and on a term it means exactly that order. The result is again a finite map from variables to terms, so compositions stay inside the same simple object.',
      narration: 'Composing two substitutions means apply the first, then the second.',
      keyword: 'first, then the second',
      trap: 'Reading composition right to left out of habit. Fix the convention and stay with it.'
    },
    {
      id: 's-3', scene: 'subst', start: 75, end: 82.5,
      caption: 'The two orders can disagree, and here is a term where they do.',
      detail: 'Take x to y, and separately y to a. Apply them in that order and x becomes a. Apply them in the other order and the binding to x is never reached, so x stays x. Composition is associative but not commutative, and the animation prints both results.',
      narration: 'The two orders can disagree, and here is a term where they do.',
      keyword: 'not commutative',
      trap: 'Assuming substitutions commute because numbers do. They do not.'
    },
    {
      id: 's-4', scene: 'subst', start: 82.5, end: 90,
      caption: 'Associativity is what lets the algorithm keep composing without bookkeeping.',
      detail: 'Because composition is associative, the unification algorithm can fold each new binding into one running substitution, in any grouping, and get the same answer. That is the only reason the algorithm can be written as a loop over disagreements.',
      narration: 'Associativity is what lets the algorithm keep composing without bookkeeping.',
      keyword: 'associative',
      trap: 'Believing the algorithm must remember every binding separately. One composed map is enough.'
    },

    /* ---------- scene 4: unify ---------- */
    {
      id: 'u-1', scene: 'unify', start: 90, end: 97.5,
      caption: 'Compare the two roots first: both are f, so walk into the arguments together.',
      detail: 'The algorithm never scans strings. It walks two trees in lockstep, in the same order, and stops at the first place where the symbols differ. Everything above that point already agrees and can be forgotten.',
      narration: 'Compare the two roots first. Both are f, so walk into the arguments together.',
      keyword: 'first place where the symbols differ',
      trap: 'Comparing whole terms first. The first disagreement is the only one that matters.'
    },
    {
      id: 'u-2', scene: 'unify', start: 97.5, end: 105,
      caption: 'First argument: x against a. That is a variable, so bind x to a.',
      detail: 'A disagreement between a variable and any other term is repairable: the variable takes the other term as its value. The binding is then applied to the rest of both trees before the walk continues, so later disagreements are judged on updated terms.',
      narration: 'First argument: x against a. That is a variable, so bind x to a.',
      keyword: 'bind x to a',
      trap: 'Recording the binding and not applying it. Later comparisons then use stale terms.'
    },
    {
      id: 'u-3', scene: 'unify', start: 105, end: 112.5,
      caption: 'Second argument: g(y) against g(b). Same symbol, so recurse: bind y to b.',
      detail: 'The walk descends because the two function symbols agree and the arities agree. One level down, y against b is the same repairable shape as before, and the second binding joins the first in the composed substitution.',
      narration: 'Second argument: g of y against g of b. Same symbol, so recurse and bind y to b.',
      keyword: 'recurse',
      trap: 'Comparing g(y) with g(b) as opaque atoms. The walk goes inside.'
    },
    {
      id: 'u-4', scene: 'unify', start: 112.5, end: 120,
      caption: 'Nothing is left to compare, so {x/a, y/b} is a unifier.',
      detail: 'The algorithm stops when the disagreement set is empty. What it returns is not just any unifier but the most general one, which is the subject of a later scene. The animation shows the two steps the engine actually took, not a remembered answer.',
      narration: 'Nothing is left to compare, so x to a and y to b is a unifier.',
      keyword: 'a unifier',
      trap: 'Stopping at the first binding. Both arguments had to agree.'
    },

    /* ---------- scene 5: fail ---------- */
    {
      id: 'f-1', scene: 'fail', start: 120, end: 127.5,
      caption: 'A clash: two different constants, or two different function symbols, at the same place.',
      detail: 'If both sides at the disagreement are non-variables with different symbols, no substitution can help. Constants and function symbols are fixed by the signature, so the two trees can never become equal. The engine reports the clash with the two symbols.',
      narration: 'A clash: two different constants, or two different function symbols, at the same place.',
      keyword: 'clash',
      trap: 'Calling a clash a failure of the algorithm. It is the correct answer to the question.'
    },
    {
      id: 'f-2', scene: 'fail', start: 127.5, end: 135,
      caption: 'An occurs check: a variable against a term that contains it.',
      detail: 'Binding x to f(x) would make x stand for a strictly larger term, and then for a larger one again. No finite term can be that value, so the binding is refused. Without this test the algorithm would loop forever or build an infinite term.',
      narration: 'An occurs check: a variable against a term that contains it.',
      keyword: 'contains it',
      trap: 'Dropping the occurs check as an optimisation. It is a correctness condition.'
    },
    {
      id: 'f-3', scene: 'fail', start: 135, end: 142.5,
      caption: 'A binding can also be undone by the next one: f(x,x) against f(a,b).',
      detail: 'The first disagreement binds x to a. Applied to the rest, the second argument becomes a against b, which is a clash. So the pair fails even though the first step looked fine. A failure can arrive after a successful-looking start.',
      narration: 'A binding can also be undone by the next one: f of x, x against f of a, b.',
      keyword: 'undone by the next one',
      trap: 'Concluding success from the first binding. Apply it and keep walking.'
    },
    {
      id: 'f-4', scene: 'fail', start: 142.5, end: 150,
      caption: 'Two of the three are fatal at once; the third only fails later.',
      detail: 'A clash and an occurs check are local: nothing can be done. The third is a global effect of the order in which disagreements are visited, and the brute-force search in this page confirms that none of the three pairs has a unifier.',
      narration: 'Two of the three are fatal at once. The third only fails later.',
      keyword: 'fatal at once',
      trap: 'Assuming a failure means the terms are "different". They may differ only after substitution.'
    },

    /* ---------- scene 6: mgu ---------- */
    {
      id: 'm-1', scene: 'mgu', start: 150, end: 157.5,
      caption: 'Many substitutions can unify a pair; one of them is the weakest.',
      detail: 'For f(x,y) against f(y,a) the search space of this page contains twelve unifiers. All of them make the two terms equal, and they differ in how much they commit to. The one that commits least is the one resolution should use.',
      narration: 'Many substitutions can unify a pair. One of them is the weakest.',
      keyword: 'the weakest',
      trap: 'Picking the first unifier found. A more specific one throws away resolvents.'
    },
    {
      id: 'm-2', scene: 'mgu', start: 157.5, end: 165,
      caption: 'Most general means every other unifier is this one followed by something.',
      detail: 'Formally, sigma is a most general unifier when it unifies the pair and every other unifier theta can be written as sigma followed by some substitution. The page tests exactly that on every unifier in its search space, rather than quoting the definition.',
      narration: 'Most general means every other unifier is this one followed by something.',
      keyword: 'followed by something',
      trap: 'Reading "most general" as "largest". It is the least specific, not the most.'
    },
    {
      id: 'm-3', scene: 'mgu', start: 165, end: 172.5,
      caption: 'The most general unifier is unique up to renaming of variables.',
      detail: 'Two most general unifiers for the same pair differ only by a consistent renaming of variables, which changes nothing about what the clauses mean. That is why a solver may return any of them and still be complete.',
      narration: 'The most general unifier is unique up to renaming of variables.',
      keyword: 'unique up to renaming',
      trap: 'Treating two differently named MGUs as different answers. They are the same answer.'
    },
    {
      id: 'm-4', scene: 'mgu', start: 172.5, end: 180,
      caption: 'Matching is the one-way case: the pattern has variables, the other side does not.',
      detail: 'When one side must stay fixed, only its variables may be bound. That is pattern matching, and it is what a functional language does at every call. Unification is the symmetric version, and it can fail where matching succeeds.',
      narration: 'Matching is the one-way case: the pattern has variables, the other side does not.',
      keyword: 'one-way',
      trap: 'Using the words interchangeably. Matching is unification with one side frozen.'
    },

    /* ---------- scene 7: skolem ---------- */
    {
      id: 'k-1', scene: 'skolem', start: 180, end: 187.5,
      caption: 'First put the quantifiers in front, then remove the existentials one at a time.',
      detail: 'Prenex form moves every quantifier to the front by equivalences that preserve meaning. After that the prefix is a list of forall and exists, and the matrix has no quantifiers left. Only then does Skolemisation apply.',
      narration: 'First put the quantifiers in front, then remove the existentials one at a time.',
      keyword: 'in front',
      trap: 'Skolemising before renaming. Capture changes the meaning of the formula.'
    },
    {
      id: 'k-2', scene: 'skolem', start: 187.5, end: 195,
      caption: 'An existential with no forall to its left becomes a constant.',
      detail: 'If the sentence merely says that some object exists, one name is enough: a fresh constant stands for it. With no universal quantifier in front, the witness does not depend on anything, so it needs no arguments.',
      narration: 'An existential with no forall to its left becomes a constant.',
      keyword: 'a constant',
      trap: 'Using the same constant for two different existentials. They may be different objects.'
    },
    {
      id: 'k-3', scene: 'skolem', start: 195, end: 202.5,
      caption: 'An existential under one forall becomes a function of that variable.',
      detail: 'For all x there exists y is not the same as there exists one y for all x. The witness may depend on x, so it is written f(x). Under two universals it takes two arguments. The arity of the Skolem symbol is exactly the number of universals to its left.',
      narration: 'An existential under one forall becomes a function of that variable.',
      keyword: 'function of that variable',
      trap: 'Replacing both forms by one constant. That is the quantifier swap the GATE item tests.'
    },
    {
      id: 'k-4', scene: 'skolem', start: 202.5, end: 210,
      caption: 'Satisfiability is preserved; logical equivalence is not.',
      detail: 'The Skolem form is stronger than the original, because it names a witness the original only promised. So a model of the original need not satisfy the Skolem form, and the page counts the models where they disagree. Equisatisfiability is all resolution needs.',
      narration: 'Satisfiability is preserved. Logical equivalence is not.',
      keyword: 'not equivalence',
      trap: 'Using a Skolem form to prove equivalence. It may only be used to refute.'
    },

    /* ---------- scene 8: resolve ---------- */
    {
      id: 'r-1', scene: 'resolve', start: 210, end: 217.5,
      caption: 'Rename the two clauses apart before doing anything else.',
      detail: 'The variables of one clause and the variables of the other are independent, even when they are printed with the same letter. Renaming one copy makes that independence explicit, and without it the occurs check can silently refuse a legitimate step.',
      narration: 'Rename the two clauses apart before doing anything else.',
      keyword: 'apart',
      trap: 'Resolving two clauses that share a variable letter. The result is usually wrong.'
    },
    {
      id: 'r-2', scene: 'resolve', start: 217.5, end: 225,
      caption: 'Pick one positive and one negative atom with the same predicate, and unify them.',
      detail: 'One pivot per step, as in the propositional rule, but the two atoms need not be identical: they need to have a most general unifier. That unifier is the step\'s whole content, and it is where first-order resolution differs from the propositional case.',
      narration: 'Pick one positive and one negative atom with the same predicate, and unify them.',
      keyword: 'unify them',
      trap: 'Requiring the two atoms to be identical. Requiring them to be unifiable is the whole gain.'
    },
    {
      id: 'r-3', scene: 'resolve', start: 225, end: 232.5,
      caption: 'Apply that unifier to everything else and keep it: that is the resolvent.',
      detail: 'On not Man(x) or Mortal(x) with Man(s), the unifier is x to s, and the resolvent is Mortal(s). The step is sound: any interpretation satisfying both parents satisfies the resolvent, which the page checks on every interpretation of a two-element domain.',
      narration: 'Apply that unifier to everything else and keep it: that is the resolvent.',
      keyword: 'the resolvent',
      trap: 'Forgetting to apply the unifier to the remaining literals.'
    },
    {
      id: 'r-4', scene: 'resolve', start: 232.5, end: 240,
      caption: 'Factoring handles two equal atoms inside one clause, and it strengthens the clause.',
      detail: 'If a clause contains two atoms that unify, they may be replaced by one instance. That is not an equivalence: the factor implies the clause and not conversely, which the page demonstrates with a model. Robinson included factoring because the rule is needed for completeness.',
      narration: 'Factoring handles two equal atoms inside one clause, and it strengthens the clause.',
      keyword: 'strengthens',
      trap: 'Calling a factor equivalent to its clause. It is a consequence, not an equal.'
    },

    /* ---------- scene 9: proof ---------- */
    {
      id: 'p-1', scene: 'proof', start: 240, end: 247.5,
      caption: 'Three clauses: every man is mortal, Socrates is a man, Socrates is not mortal.',
      detail: 'The third clause is the negation of the goal, which is what a refutation adds. The set is unsatisfiable exactly when the goal follows from the first two, so the empty clause is the proof.',
      narration: 'Three clauses: every man is mortal, Socrates is a man, Socrates is not mortal.',
      keyword: 'negation of the goal',
      trap: 'Adding the goal instead of its negation. Then the empty clause proves nothing useful.'
    },
    {
      id: 'p-2', scene: 'proof', start: 247.5, end: 255,
      caption: 'Unify Man(x) with Man(s): x becomes s, and the resolvent is Mortal(s).',
      detail: 'The first step is the one from the previous scene. The second step resolves Mortal(s) with not Mortal(s) with no substitution needed at all, and produces the empty clause. Two steps, three leaves, one root.',
      narration: 'Unify Man of x with Man of s: x becomes s, and the resolvent is Mortal of s.',
      keyword: 'two steps',
      trap: 'Looking for a longer proof. The shortest one is two steps.'
    },
    {
      id: 'p-3', scene: 'proof', start: 255, end: 262.5,
      caption: 'The lifting lemma: every ground step is an instance of a general step.',
      detail: 'Ground resolution needs the instances to be chosen in advance. The lifting lemma says that a refutation of any set of ground instances can be raised to a refutation of the clauses themselves. That is the bridge from Herbrand\'s theorem to the algorithm.',
      narration: 'The lifting lemma: every ground step is an instance of a general step.',
      keyword: 'lifting lemma',
      trap: 'Thinking resolution searches for instances. It never builds one.'
    },
    {
      id: 'p-4', scene: 'proof', start: 262.5, end: 270,
      caption: 'Soundness is one case; completeness is Herbrand plus lifting.',
      detail: 'Soundness: a resolvent is entailed by its parents, so a satisfiable set never reaches the empty clause. Completeness: an unsatisfiable set has unsatisfiable ground instances, those have a ground refutation, and lifting turns it into one over the clauses.',
      narration: 'Soundness is one case. Completeness is Herbrand plus lifting.',
      keyword: 'Herbrand plus lifting',
      trap: 'Proving completeness by running the algorithm. Completeness is a theorem about all sets.'
    },

    /* ---------- scene 10: limits ---------- */
    {
      id: 'x-1', scene: 'limits', start: 270, end: 277.5,
      caption: 'First-order validity is only semi-decidable: a refutation is a proof, a failure is not.',
      detail: 'By Church\'s theorem there is no algorithm that decides validity in first-order logic. Resolution is complete for refutation, so a derivation of the empty clause settles the question, but a search that has not found one settles nothing. That asymmetry is the whole limit.',
      narration: 'First-order validity is only semi-decidable: a refutation is a proof, a failure is not.',
      keyword: 'semi-decidable',
      trap: 'Reading a stalled search as a model. Only an actual model is a model.'
    },
    {
      id: 'x-2', scene: 'limits', start: 277.5, end: 285,
      caption: 'Equality is not built in: without extra rules, a = a cannot be derived.',
      detail: 'Resolution as stated sees equality as an ordinary predicate. Refuting a set that needs equality to be an equivalence relation and a congruence needs either the equality axioms or an extension such as paramodulation. That is a real boundary, not a technicality.',
      narration: 'Equality is not built in: without extra rules, a equals a cannot be derived.',
      keyword: 'not built in',
      trap: 'Assuming a solver knows that a equals a. It must be told, or given a rule for it.'
    },
    {
      id: 'x-3', scene: 'limits', start: 285, end: 292.5,
      caption: 'GATE CSE 2017 Set 1: from for all x there exists y, only two of the four follow.',
      detail: 'The sentence is F: for all x there exists y R(x,y). Statement I swaps the existentials and follows. Statement IV is the same sentence rewritten. Statement II moves the existential out, which is a different claim, and a two-element countermodel kills it. Statement III reverses the relation, and a different two-element countermodel kills that.',
      narration: 'From for all x there exists y, only two of the four statements follow.',
      keyword: 'only two',
      trap: 'Swapping two quantifiers of different kinds. The swap is the commonest wrong step.'
    },
    {
      id: 'x-4', scene: 'limits', start: 292.5, end: 300,
      caption: 'Four questions decide every case: clauses, unifier, arity, and what is preserved.',
      detail: 'Ask whether the input is clauses; ask for the most general unifier rather than any unifier; ask how many universals sit to the left of each existential; and ask whether the transformation preserved satisfiability or meaning. Those four answers cover the examinable surface of this topic.',
      narration: 'Four questions decide every case: clauses, unifier, arity, and what is preserved.',
      keyword: 'four questions',
      trap: 'Checking the algebra of a step and never the shape of the transformation.'
    }
  ]
};
