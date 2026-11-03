# Resolution Refutation And Horn Clauses — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/resolution-refutation-and-horn-clauses/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. To prove a thing, assume it is false

*0:00 – 0:30 · objective: See why resolution proves by contradiction, and what its input — a set of clauses — actually means.*

**0:00–0:07** — A clause is a disjunction of literals. A set of clauses is a conjunction of them, so every clause must be true at once.

> Caption: A clause is a disjunction of literals; a set of clauses is a conjunction of them.

Exam-trap caption mode adds: *Reading a set of clauses as a disjunction. A set of clauses is an AND, and one false clause falsifies the whole set.*

**0:07–0:15** — Resolution does not build a proof of the goal. It refutes the goal together with the knowledge base.

> Caption: Resolution does not build a proof of the goal. It refutes the goal together with the knowledge base.

Exam-trap caption mode adds: *Trying to derive the goal clause directly. The method produces the empty clause, and only the empty clause, as its verdict.*

**0:15–0:22** — Add the negation of the goal to the clauses. If the whole set is unsatisfiable, the goal follows.

> Caption: Add the negation of the goal to the clauses. If the whole set is unsatisfiable, the goal follows.

Exam-trap caption mode adds: *Forgetting that the negation of the goal is usually several clauses, not one. A conjunction of clauses is added, one clause at a time.*

**0:22–0:30** — So the whole method asks one question: can all these clauses be true at the same time?

> Caption: So the whole method asks one question: can all these clauses be true at the same time?

Exam-trap caption mode adds: *Confusing satisfiability of the set with truth of each clause separately. Each clause is easy; the set is the problem.*

## Scene 2. From a formula to a set of clauses

*0:30 – 1:00 · objective: Convert a formula to clausal form in five steps, and know what the empty clause and the empty set mean.*

**0:30–0:37** — Five steps take any formula to clauses: implications out, negations in, distribute, split the conjunction, name the clauses.

> Caption: Five steps take any formula to clauses: implications out, negations in, distribute, split the conjunction, name the clauses.

Exam-trap caption mode adds: *Skipping the distribution step. Without it the result is a formula, not a set of clauses, and resolution has nothing to work on.*

**0:37–0:45** — P implies Q and R becomes two clauses: not P or Q, and not P or R.

> Caption: P implies Q and R becomes two clauses: not P or Q, and not P or R.

Exam-trap caption mode adds: *Writing not P or Q and R as a single clause. A clause has no conjunction inside it; the AND becomes the split between clauses.*

**0:45–0:52** — Negating the goal is part of the method: not (P implies Q) becomes P and not Q, which is two unit clauses.

> Caption: Negating the goal is part of the method: not (P implies Q) becomes P and not Q, which is two unit clauses.

Exam-trap caption mode adds: *Negating an implication as an implication. The negation of P implies Q is not P implies not Q; it is P and not Q.*

**0:52–1:00** — The empty clause is falsity, and the empty set of clauses is trivially true.

> Caption: The empty clause is falsity, and the empty set of clauses is trivially true.

Exam-trap caption mode adds: *Treating an empty clause as a clause you forgot to fill in. It is the goal of the whole method, and it is drawn as a small square.*

## Scene 3. One variable, two clauses, one new clause

*1:00 – 1:30 · objective: State the resolution rule exactly: one pivot, everything else kept, tautologies dropped.*

**1:00–1:07** — Two clauses that disagree on exactly one variable produce a new clause.

> Caption: Two clauses that disagree on exactly one variable produce a new clause.

Exam-trap caption mode adds: *Resolving two clauses that share no complementary variable. Two clauses that agree on every shared variable have no resolvent.*

**1:07–1:15** — Cancel the pair, keep everything else, drop repeated literals. That is the resolvent.

> Caption: Cancel the pair, keep everything else, drop repeated literals. That is the resolvent.

Exam-trap caption mode adds: *Removing a literal because it looks irrelevant. Only the pivot pair is removed; every other literal is kept.*

**1:15–1:22** — The pivot must be positive in one parent and negative in the other. Agreement on a variable gives nothing.

> Caption: The pivot must be positive in one parent and negative in the other. Agreement on a variable gives nothing.

Exam-trap caption mode adds: *Resolving on a variable both parents share with the same sign. That is not a resolution step, and any clause it produces is unsound.*

**1:22–1:30** — A resolvent containing a variable and its negation is a tautology, and it is thrown away.

> Caption: A resolvent containing a variable and its negation is a tautology, and it is thrown away.

Exam-trap caption mode adds: *Keeping tautological resolvents, then concluding that a satisfiable set is unsatisfiable because the closure looks busy.*

## Scene 4. Why the resolvent has to be true

*1:30 – 2:00 · objective: Prove soundness by the two cases on the pivot, and see that a resolvent preserves satisfiability.*

**1:30–1:37** — The rule is sound: every assignment that satisfies both parents satisfies the resolvent.

> Caption: The rule is sound: every assignment that satisfies both parents satisfies the resolvent.

Exam-trap caption mode adds: *Believing the resolvent is equivalent to the parents. It is weaker: it follows from them, and it does not imply them.*

**1:37–1:45** — There are two cases and no third: the pivot is true, or the pivot is false.

> Caption: There are two cases and no third: the pivot is true, or the pivot is false.

Exam-trap caption mode adds: *Trying to prove soundness with a third case, or by example. One example shows the rule can work; the case split shows it always works.*

**1:45–1:52** — If the pivot is true, the clause holding its negation must be satisfied by something else, and that something is in the resolvent.

> Caption: If the pivot is true, the clause holding its negation must be satisfied by something else.

Exam-trap caption mode adds: *Forgetting that a clause is satisfied by one literal, not by all of them. That is what makes the case argument work.*

**1:52–2:00** — Adding a resolvent never changes satisfiability, so a satisfiable set can never produce the empty clause.

> Caption: Adding a resolvent never changes satisfiability, so a satisfiable set can never produce the empty clause.

Exam-trap caption mode adds: *Concluding from a derived clause that the set changed meaning. Resolution adds consequences, and consequences never remove models.*

## Scene 5. A refutation, clause by clause

*2:00 – 2:30 · objective: Run the four-clause refutation and read the derivation as a tree that ends in the empty clause.*

**2:00–2:07** — Four clauses over two variables: P or Q, P or not Q, not P or Q, not P or not Q.

> Caption: Four clauses over two variables: P or Q, P or not Q, not P or Q, not P or not Q.

Exam-trap caption mode adds: *Assuming a set of four clauses is satisfiable because no single clause is obviously false. Each clause is true in three of the four assignments.*

**2:07–2:15** — The first pair differs only on Q, so resolve on Q and get P.

> Caption: The first pair differs only on Q, so resolve on Q and get P.

Exam-trap caption mode adds: *Writing the resolvent as P or Q or not Q. The cancelled pair disappears; it does not become a tautology inside the answer.*

**2:15–2:22** — The second pair differs only on Q as well, so resolve on Q and get not P.

> Caption: The second pair differs only on Q as well, so resolve on Q and get not P.

Exam-trap caption mode adds: *Resolving the first clause with the third clause instead. It is legal, and it produces a tautology that teaches nothing.*

**2:22–2:30** — P and not P give the empty clause. The set is unsatisfiable, and every original clause is used once.

> Caption: P and not P give the empty clause. The set is unsatisfiable, and every original clause is used once.

Exam-trap caption mode adds: *Stopping at the contradictory units. Two unit clauses are a contradiction only after they are resolved into the empty clause.*

## Scene 6. Complete for refutation, not for derivation

*2:30 – 3:00 · objective: Separate refutation-completeness from the false claim that resolution derives every consequence.*

**2:30–2:37** — Resolution is complete for refutation: an unsatisfiable set always has a refutation.

> Caption: Resolution is complete for refutation: an unsatisfiable set always has a refutation.

Exam-trap caption mode adds: *Reading completeness as "every consequence can be derived". The theorem is about the empty clause, not about arbitrary clauses.*

**2:37–2:45** — It is not complete for derivation: from the single clause P you can derive nothing at all.

> Caption: It is not complete for derivation: from the single clause P you can derive nothing at all.

Exam-trap caption mode adds: *Expecting the closure to contain every entailed clause. It contains the resolvents, which is a smaller set.*

**2:45–2:52** — That is not a defect. To show P entails Q, you refute P together with not Q, and that set is satisfiable.

> Caption: That is not a defect. To show P entails Q, you refute P together with not Q, and that set is satisfiable.

Exam-trap caption mode adds: *Running resolution on the knowledge base alone and expecting a verdict. Nothing is being refuted unless the negated goal is in the set.*

**2:52–3:00** — Refutation answers one question only: can this set of clauses be satisfied?

> Caption: Refutation answers one question only: can this set of clauses be satisfied?

Exam-trap caption mode adds: *Asking resolution to produce a model. It proves that no model exists; it does not hand one back.*

## Scene 7. Horn clauses: at most one conclusion

*3:00 – 3:30 · objective: Read a Horn clause as a rule, and run unit propagation as the marking of facts.*

**3:00–3:07** — A Horn clause has at most one positive literal, so at most one conclusion.

> Caption: A Horn clause has at most one positive literal, so at most one conclusion.

Exam-trap caption mode adds: *Counting all literals instead of the positive ones. Not A or not B or C is Horn, and it has three literals.*

**3:07–3:15** — Read as a rule: not A or not B or C says A and B together give C.

> Caption: Read as a rule: not A or not B or C says A and B together give C.

Exam-trap caption mode adds: *Reading the negated literals as conclusions. In a Horn clause the only conclusion is the single positive literal.*

**3:15–3:22** — Unit propagation marks a fact, then fires every rule whose premises are all marked.

> Caption: Unit propagation marks a fact, then fires every rule whose premises are all marked.

Exam-trap caption mode adds: *Marking a conclusion whose premises are only partly marked. The rule needs all of its premises, not one of them.*

**3:22–3:30** — On Horn clauses this settles satisfiability in linear time.

> Caption: On Horn clauses this settles satisfiability in linear time.

Exam-trap caption mode adds: *Claiming the linear bound for arbitrary clauses. The linear-time result is for Horn sets; the general problem is NP-complete.*

## Scene 8. Unit propagation: complete here, stuck there

*3:30 – 4:00 · objective: See propagation settle a Horn set in linear time, and stall on a general set that is unsatisfiable.*

**3:30–3:37** — Five Horn clauses over five atoms: two facts, two rules and one goal.

> Caption: Five Horn clauses over five atoms: two facts, two rules and one goal.

Exam-trap caption mode adds: *Treating the goal clause as a fact. A clause with no positive literal is what you are trying to refute, not something you may assume.*

**3:37–3:45** — The goal is never triggered, because E is never derived, so the set is satisfiable and the marked atoms form its smallest model.

> Caption: The goal is never triggered, because E is never derived, so the set is satisfiable and the marked atoms form its smallest model.

Exam-trap caption mode adds: *Assuming the unmarked atoms are false in every model. They are false in the smallest model; other models may set them true.*

**3:45–3:52** — Now the four clauses over P and Q. There is no unit clause, so propagation cannot start.

> Caption: Now the four clauses over P and Q. There is no unit clause, so propagation cannot start.

Exam-trap caption mode adds: *Reporting a set as satisfiable because propagation found no conflict. No conflict means no refutation was found, not that a model exists.*

**3:52–4:00** — Yet the set is unsatisfiable, and resolution refutes it in three steps. Unit propagation alone is not complete.

> Caption: Yet the set is unsatisfiable, and resolution refutes it in three steps. Unit propagation alone is not complete.

Exam-trap caption mode adds: *Using propagation as a satisfiability test on general CNF. It is a sound refuter and an incomplete one.*

## Scene 9. Two cancels at once, and the price of completeness

*4:00 – 4:30 · objective: Meet the unsound double cancel, the tautology that is dropped, and the exponential worst case.*

**4:00–4:07** — Resolving on two variables at once is unsound: P or Q with not P or not Q.

> Caption: Resolving on two variables at once is unsound: P or Q with not P or not Q.

Exam-trap caption mode adds: *Cancelling every complementary pair between two clauses. One pivot per step, always.*

**4:07–4:15** — Cancelling both pairs gives the empty clause, but P true and Q false satisfies both parents.

> Caption: Cancelling both pairs gives the empty clause, but P true and Q false satisfies both parents.

Exam-trap caption mode adds: *Trusting a derivation that cancels more than one pair because the result looks like a clean contradiction.*

**4:15–4:22** — Done legally, both resolvents are tautologies and are dropped, so nothing new is derived.

> Caption: Done legally, both resolvents are tautologies and are dropped, so nothing new is derived.

Exam-trap caption mode adds: *Thinking a set is unsatisfiable because resolving it produces clauses with a variable and its negation. Those are the tautologies you drop.*

**4:22–4:30** — Complete does not mean cheap: the pigeonhole clauses grow from 6 to 73 to more than 900.

> Caption: Complete does not mean cheap: the pigeonhole clauses grow from 6 to 73 to more than 900.

Exam-trap caption mode adds: *Assuming a complete method is a practical one. Completeness is a guarantee about existence, never about size.*

## Scene 10. The procedure and five traps

*4:30 – 5:00 · objective: Leave with a fixed order of steps and the five mistakes that cost the mark.*

**4:30–4:37** — Step one: put the negation of the goal into clauses, and add those clauses to the set.

> Caption: Step one: put the negation of the goal into clauses, and add those clauses to the set.

Exam-trap caption mode adds: *Adding the goal instead of its negation. That refutes the wrong thing, and usually finds nothing.*

**4:37–4:45** — Step two: find a complementary pair, resolve on that one variable, and keep the result if it is new and not a tautology.

> Caption: Step two: find a complementary pair, resolve on that one variable, and keep the result if it is new and not a tautology.

Exam-trap caption mode adds: *Resolving on several pairs in one step, which is the unsound rule from the previous scene.*

**4:45–4:52** — Step three: repeat until the empty clause appears, or until no new clause can be made.

> Caption: Step three: repeat until the empty clause appears, or until no new clause can be made.

Exam-trap caption mode adds: *Stopping early because the closure looks large. Only the empty clause or a closed set is an answer.*

**4:52–5:00** — Five traps, one defence: one pivot, one pair, and the empty clause as the only verdict.

> Caption: Five traps, one defence: one pivot, one pair, and the empty clause as the only verdict.

Exam-trap caption mode adds: *Checking the arithmetic of a derivation and never the shape of the step. Every trap here produces a plausible-looking clause.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
