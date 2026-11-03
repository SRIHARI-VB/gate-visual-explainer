# First-Order Resolution and Unification: Terms as Trees, the Most General Unifier, and Skolemisation — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/first-order-resolution-and-unification/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A quantified claim is a promise, not a clause

*0:00 – 0:30 · objective: See why propositional resolution does not apply directly to a sentence with a quantifier, and what unification is for.*

**0:00–0:07** — A clause is a ground clause. Every variable has already been replaced by an object.

> Caption: A clause is a ground clause: every variable has already been replaced by an object.

Exam-trap caption mode adds: *Treating "for all x" as a decoration on a clause. It changes what the clause promises.*

**0:07–0:15** — One way out is to instantiate. Write one clause per object, then resolve propositionally.

> Caption: One way out is to instantiate: write one clause per object, then resolve propositionally.

Exam-trap caption mode adds: *Believing instantiation is a decision procedure. It is a proof procedure that may never stop.*

**0:15–0:22** — The other way out is to ask when two atoms can be made identical by one substitution.

> Caption: The other way out is to ask when two atoms can be made identical by one substitution.

Exam-trap caption mode adds: *Reading unification as equality of terms. It is equality after a substitution, which is a weaker question.*

**0:22–0:30** — Robinson combined the substitution and the truth-functional step into one rule.

> Caption: Robinson 1965 combined the substitution and the truth-functional step into one rule.

Exam-trap caption mode adds: *Thinking resolution is a heuristic. It is a complete refutation procedure, and incompleteness is a different claim.*

## Scene 2. Terms are trees, and trees can nest

*0:30 – 1:00 · objective: Read a term as a finite tree of constants, variables and function symbols, and see why the term universe is infinite.*

**0:30–0:37** — A term is a constant, a variable, or a function symbol applied to terms.

> Caption: A term is a constant, a variable, or a function symbol applied to terms.

Exam-trap caption mode adds: *Putting a predicate inside a term. P(x) is an atom; f(P(x)) is not a term in first-order logic.*

**0:37–0:45** — So a term is a finite tree, and the symbol at the root is what the term is.

> Caption: So a term is a finite tree, and the symbol at the root is what the term is.

Exam-trap caption mode adds: *Comparing terms by their printed form. Spacing and brackets differ; the tree does not.*

**0:45–0:52** — Because a function may be applied to its own output, the set of terms is infinite.

> Caption: Because f may be applied to its own output, the set of terms is infinite.

Exam-trap caption mode adds: *Assuming a finite signature gives finitely many terms. Nesting gives infinitely many.*

**0:52–1:00** — A substitution maps variables to terms, and never touches constants.

> Caption: A substitution maps variables to terms, and never touches constants.

Exam-trap caption mode adds: *Trying to substitute for a constant. A constant is a name, not a placeholder.*

## Scene 3. A substitution is a finite list of replacements

*1:00 – 1:30 · objective: Apply a substitution to a term, compose two of them, and see that the order of composition matters.*

**1:00–1:07** — Applying x to a and y to b to f of x, g of y gives f of a, g of b.

> Caption: Applying {x/a, y/b} to f(x, g(y)) gives f(a, g(b)).

Exam-trap caption mode adds: *Applying a substitution left to right and stopping. It reaches every occurrence.*

**1:07–1:15** — Composing two substitutions means apply the first, then the second.

> Caption: Composing two substitutions means: apply the first, then the second.

Exam-trap caption mode adds: *Reading composition right to left out of habit. Fix the convention and stay with it.*

**1:15–1:22** — The two orders can disagree, and here is a term where they do.

> Caption: The two orders can disagree, and here is a term where they do.

Exam-trap caption mode adds: *Assuming substitutions commute because numbers do. They do not.*

**1:22–1:30** — Associativity is what lets the algorithm keep composing without bookkeeping.

> Caption: Associativity is what lets the algorithm keep composing without bookkeeping.

Exam-trap caption mode adds: *Believing the algorithm must remember every binding separately. One composed map is enough.*

## Scene 4. Walk both trees until they disagree

*1:30 – 2:00 · objective: Run the unification algorithm on f(x,g(y)) against f(a,g(b)) and read the two bindings off the walk.*

**1:30–1:37** — Compare the two roots first. Both are f, so walk into the arguments together.

> Caption: Compare the two roots first: both are f, so walk into the arguments together.

Exam-trap caption mode adds: *Comparing whole terms first. The first disagreement is the only one that matters.*

**1:37–1:45** — First argument: x against a. That is a variable, so bind x to a.

> Caption: First argument: x against a. That is a variable, so bind x to a.

Exam-trap caption mode adds: *Recording the binding and not applying it. Later comparisons then use stale terms.*

**1:45–1:52** — Second argument: g of y against g of b. Same symbol, so recurse and bind y to b.

> Caption: Second argument: g(y) against g(b). Same symbol, so recurse: bind y to b.

Exam-trap caption mode adds: *Comparing g(y) with g(b) as opaque atoms. The walk goes inside.*

**1:52–2:00** — Nothing is left to compare, so x to a and y to b is a unifier.

> Caption: Nothing is left to compare, so {x/a, y/b} is a unifier.

Exam-trap caption mode adds: *Stopping at the first binding. Both arguments had to agree.*

## Scene 5. The three ways unification fails

*2:00 – 2:30 · objective: Separate a clash from an occurs check from a binding that is undone by a later one, and know which is repairable.*

**2:00–2:07** — A clash: two different constants, or two different function symbols, at the same place.

> Caption: A clash: two different constants, or two different function symbols, at the same place.

Exam-trap caption mode adds: *Calling a clash a failure of the algorithm. It is the correct answer to the question.*

**2:07–2:15** — An occurs check: a variable against a term that contains it.

> Caption: An occurs check: a variable against a term that contains it.

Exam-trap caption mode adds: *Dropping the occurs check as an optimisation. It is a correctness condition.*

**2:15–2:22** — A binding can also be undone by the next one: f of x, x against f of a, b.

> Caption: A binding can also be undone by the next one: f(x,x) against f(a,b).

Exam-trap caption mode adds: *Concluding success from the first binding. Apply it and keep walking.*

**2:22–2:30** — Two of the three are fatal at once. The third only fails later.

> Caption: Two of the three are fatal at once; the third only fails later.

Exam-trap caption mode adds: *Assuming a failure means the terms are "different". They may differ only after substitution.*

## Scene 6. The most general unifier is the least commitment

*2:30 – 3:00 · objective: State what makes a unifier most general, and see every other unifier as an instance of it.*

**2:30–2:37** — Many substitutions can unify a pair. One of them is the weakest.

> Caption: Many substitutions can unify a pair; one of them is the weakest.

Exam-trap caption mode adds: *Picking the first unifier found. A more specific one throws away resolvents.*

**2:37–2:45** — Most general means every other unifier is this one followed by something.

> Caption: Most general means every other unifier is this one followed by something.

Exam-trap caption mode adds: *Reading "most general" as "largest". It is the least specific, not the most.*

**2:45–2:52** — The most general unifier is unique up to renaming of variables.

> Caption: The most general unifier is unique up to renaming of variables.

Exam-trap caption mode adds: *Treating two differently named MGUs as different answers. They are the same answer.*

**2:52–3:00** — Matching is the one-way case: the pattern has variables, the other side does not.

> Caption: Matching is the one-way case: the pattern has variables, the other side does not.

Exam-trap caption mode adds: *Using the words interchangeably. Matching is unification with one side frozen.*

## Scene 7. Skolemisation: a witness needs a name

*3:00 – 3:30 · objective: Turn a prenex sentence into clauses, give each existential a Skolem symbol of the right arity, and say what is preserved.*

**3:00–3:07** — First put the quantifiers in front, then remove the existentials one at a time.

> Caption: First put the quantifiers in front, then remove the existentials one at a time.

Exam-trap caption mode adds: *Skolemising before renaming. Capture changes the meaning of the formula.*

**3:07–3:15** — An existential with no forall to its left becomes a constant.

> Caption: An existential with no forall to its left becomes a constant.

Exam-trap caption mode adds: *Using the same constant for two different existentials. They may be different objects.*

**3:15–3:22** — An existential under one forall becomes a function of that variable.

> Caption: An existential under one forall becomes a function of that variable.

Exam-trap caption mode adds: *Replacing both forms by one constant. That is the quantifier swap the GATE item tests.*

**3:22–3:30** — Satisfiability is preserved. Logical equivalence is not.

> Caption: Satisfiability is preserved; logical equivalence is not.

Exam-trap caption mode adds: *Using a Skolem form to prove equivalence. It may only be used to refute.*

## Scene 8. Resolve after you unify

*3:30 – 4:00 · objective: State the first-order resolution rule: rename apart, unify one complementary pair, apply that unifier to everything else.*

**3:30–3:37** — Rename the two clauses apart before doing anything else.

> Caption: Rename the two clauses apart before doing anything else.

Exam-trap caption mode adds: *Resolving two clauses that share a variable letter. The result is usually wrong.*

**3:37–3:45** — Pick one positive and one negative atom with the same predicate, and unify them.

> Caption: Pick one positive and one negative atom with the same predicate, and unify them.

Exam-trap caption mode adds: *Requiring the two atoms to be identical. Requiring them to be unifiable is the whole gain.*

**3:45–3:52** — Apply that unifier to everything else and keep it: that is the resolvent.

> Caption: Apply that unifier to everything else and keep it: that is the resolvent.

Exam-trap caption mode adds: *Forgetting to apply the unifier to the remaining literals.*

**3:52–4:00** — Factoring handles two equal atoms inside one clause, and it strengthens the clause.

> Caption: Factoring handles two equal atoms inside one clause, and it strengthens the clause.

Exam-trap caption mode adds: *Calling a factor equivalent to its clause. It is a consequence, not an equal.*

## Scene 9. One refutation, lifted from the ground case

*4:00 – 4:30 · objective: Read the two-step refutation of the Socrates set as a tree, and see what the lifting lemma buys.*

**4:00–4:07** — Three clauses: every man is mortal, Socrates is a man, Socrates is not mortal.

> Caption: Three clauses: every man is mortal, Socrates is a man, Socrates is not mortal.

Exam-trap caption mode adds: *Adding the goal instead of its negation. Then the empty clause proves nothing useful.*

**4:07–4:15** — Unify Man of x with Man of s: x becomes s, and the resolvent is Mortal of s.

> Caption: Unify Man(x) with Man(s): x becomes s, and the resolvent is Mortal(s).

Exam-trap caption mode adds: *Looking for a longer proof. The shortest one is two steps.*

**4:15–4:22** — The lifting lemma: every ground step is an instance of a general step.

> Caption: The lifting lemma: every ground step is an instance of a general step.

Exam-trap caption mode adds: *Thinking resolution searches for instances. It never builds one.*

**4:22–4:30** — Soundness is one case. Completeness is Herbrand plus lifting.

> Caption: Soundness is one case; completeness is Herbrand plus lifting.

Exam-trap caption mode adds: *Proving completeness by running the algorithm. Completeness is a theorem about all sets.*

## Scene 10. What this method does not do

*4:30 – 5:00 · objective: Name the three limits — semi-decidability, no built-in equality, and syntactic matching — and answer the GATE 2017 item.*

**4:30–4:37** — First-order validity is only semi-decidable: a refutation is a proof, a failure is not.

> Caption: First-order validity is only semi-decidable: a refutation is a proof, a failure is not.

Exam-trap caption mode adds: *Reading a stalled search as a model. Only an actual model is a model.*

**4:37–4:45** — Equality is not built in: without extra rules, a equals a cannot be derived.

> Caption: Equality is not built in: without extra rules, a = a cannot be derived.

Exam-trap caption mode adds: *Assuming a solver knows that a equals a. It must be told, or given a rule for it.*

**4:45–4:52** — From for all x there exists y, only two of the four statements follow.

> Caption: GATE CSE 2017 Set 1: from for all x there exists y, only two of the four follow.

Exam-trap caption mode adds: *Swapping two quantifiers of different kinds. The swap is the commonest wrong step.*

**4:52–5:00** — Four questions decide every case: clauses, unifier, arity, and what is preserved.

> Caption: Four questions decide every case: clauses, unifier, arity, and what is preserved.

Exam-trap caption mode adds: *Checking the algebra of a step and never the shape of the transformation.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
