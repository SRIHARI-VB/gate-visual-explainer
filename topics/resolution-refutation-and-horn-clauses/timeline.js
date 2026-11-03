/* ==========================================================================
   resolution-refutation-and-horn-clauses — THE timeline.
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
      id: 'refute',
      n: 1,
      title: 'To prove a thing, assume it is false',
      start: 0, end: 30,
      objective: 'See why resolution proves by contradiction, and what its input — a set of clauses — actually means.'
    },
    {
      id: 'clause',
      n: 2,
      title: 'From a formula to a set of clauses',
      start: 30, end: 60,
      objective: 'Convert a formula to clausal form in five steps, and know what the empty clause and the empty set mean.'
    },
    {
      id: 'rule',
      n: 3,
      title: 'One variable, two clauses, one new clause',
      start: 60, end: 90,
      objective: 'State the resolution rule exactly: one pivot, everything else kept, tautologies dropped.'
    },
    {
      id: 'sound',
      n: 4,
      title: 'Why the resolvent has to be true',
      start: 90, end: 120,
      objective: 'Prove soundness by the two cases on the pivot, and see that a resolvent preserves satisfiability.'
    },
    {
      id: 'work',
      n: 5,
      title: 'A refutation, clause by clause',
      start: 120, end: 150,
      objective: 'Run the four-clause refutation and read the derivation as a tree that ends in the empty clause.'
    },
    {
      id: 'limit',
      n: 6,
      title: 'Complete for refutation, not for derivation',
      start: 150, end: 180,
      objective: 'Separate refutation-completeness from the false claim that resolution derives every consequence.'
    },
    {
      id: 'horn',
      n: 7,
      title: 'Horn clauses: at most one conclusion',
      start: 180, end: 210,
      objective: 'Read a Horn clause as a rule, and run unit propagation as the marking of facts.'
    },
    {
      id: 'up',
      n: 8,
      title: 'Unit propagation: complete here, stuck there',
      start: 210, end: 240,
      objective: 'See propagation settle a Horn set in linear time, and stall on a general set that is unsatisfiable.'
    },
    {
      id: 'trap',
      n: 9,
      title: 'Two cancels at once, and the price of completeness',
      start: 240, end: 270,
      objective: 'Meet the unsound double cancel, the tautology that is dropped, and the exponential worst case.'
    },
    {
      id: 'proc',
      n: 10,
      title: 'The procedure and five traps',
      start: 270, end: 300,
      objective: 'Leave with a fixed order of steps and the five mistakes that cost the mark.'
    }
  ],

  events: [
    /* ---- scene 1: refute ---- */
    {
      id: 'r-1', scene: 'refute', start: 0, end: 7.5,
      caption: 'A clause is a disjunction of literals; a set of clauses is a conjunction of them.',
      detail: 'A literal is a variable or its negation. A clause is a disjunction of literals, so it is true when at least one of them is true. A set of clauses is read as their conjunction: every clause must be true at once. That is why a set of clauses with no satisfying assignment is the same as a contradiction.',
      narration: 'A clause is a disjunction of literals. A set of clauses is a conjunction of them, so every clause must be true at once.',
      keyword: 'disjunction of literals',
      trap: 'Reading a set of clauses as a disjunction. A set of clauses is an AND, and one false clause falsifies the whole set.'
    },
    {
      id: 'r-2', scene: 'refute', start: 7.5, end: 15,
      caption: 'Resolution does not build a proof of the goal. It refutes the goal together with the knowledge base.',
      detail: 'The method is a refutation procedure. You never derive the goal itself. You add its negation to the clauses you already have and try to derive the empty clause. Robinson called the result a refutation of the set, not a proof of a formula.',
      narration: 'Resolution does not build a proof of the goal. It refutes the goal together with the knowledge base.',
      keyword: 'refutes',
      trap: 'Trying to derive the goal clause directly. The method produces the empty clause, and only the empty clause, as its verdict.'
    },
    {
      id: 'r-3', scene: 'refute', start: 15, end: 22.5,
      caption: 'Add the negation of the goal to the clauses. If the whole set is unsatisfiable, the goal follows.',
      detail: 'If the knowledge base entails the goal, then there is no assignment making the knowledge base true and the goal false. Adding the negation of the goal rules out every such assignment, so the enlarged set has no model, and that is what a refutation reports.',
      narration: 'Add the negation of the goal to the clauses. If the whole set is unsatisfiable, the goal follows.',
      keyword: 'unsatisfiable',
      trap: 'Forgetting that the negation of the goal is usually several clauses, not one. A conjunction of clauses is added, one clause at a time.'
    },
    {
      id: 'r-4', scene: 'refute', start: 22.5, end: 30,
      caption: 'So the whole method asks one question: can all these clauses be true at the same time?',
      detail: 'Every later scene is a variation on that single question. The rule is one step, soundness says the step cannot create a model, completeness says the steps always find the contradiction when there is one, and Horn clauses are the case where the question is cheap.',
      narration: 'So the whole method asks one question: can all these clauses be true at the same time?',
      keyword: 'true at the same time',
      trap: 'Confusing satisfiability of the set with truth of each clause separately. Each clause is easy; the set is the problem.'
    },

    /* ---- scene 2: clause ---- */
    {
      id: 'c-1', scene: 'clause', start: 30, end: 37.5,
      caption: 'Five steps take any formula to clauses: implications out, negations in, distribute, split the conjunction, name the clauses.',
      detail: 'The steps are mechanical. Remove the biconditional and the implication, push every negation inwards until it sits on a variable, distribute the disjunction over the conjunction, then read the conjunction as a list and each disjunct as one clause.',
      narration: 'Five steps take any formula to clauses: implications out, negations in, distribute, split the conjunction, name the clauses.',
      keyword: 'five steps',
      trap: 'Skipping the distribution step. Without it the result is a formula, not a set of clauses, and resolution has nothing to work on.'
    },
    {
      id: 'c-2', scene: 'clause', start: 37.5, end: 45,
      caption: 'P implies Q and R becomes two clauses: not P or Q, and not P or R.',
      detail: 'Removing the implication gives not P or (Q and R). Distributing the disjunction over the conjunction copies not P into both branches, giving (not P or Q) and (not P or R). Two clauses, three literals each of them two.',
      narration: 'P implies Q and R becomes two clauses: not P or Q, and not P or R.',
      keyword: 'two clauses',
      trap: 'Writing not P or Q and R as a single clause. A clause has no conjunction inside it; the AND becomes the split between clauses.'
    },
    {
      id: 'c-3', scene: 'clause', start: 45, end: 52.5,
      caption: 'Negating the goal is part of the method: not (P implies Q) becomes P and not Q, which is two unit clauses.',
      detail: 'The negation of an implication is the one case where the implication is false: the hypothesis holds and the conclusion fails. So not (P implies Q) is P and not Q, which is two clauses of one literal each. Unit clauses are the strongest kind, and they drive every propagation.',
      narration: 'Negating the goal is part of the method: not (P implies Q) becomes P and not Q, which is two unit clauses.',
      keyword: 'two unit clauses',
      trap: 'Negating an implication as an implication. The negation of P implies Q is not P implies not Q; it is P and not Q.'
    },
    {
      id: 'c-4', scene: 'clause', start: 52.5, end: 60,
      caption: 'The empty clause is falsity, and the empty set of clauses is trivially true.',
      detail: 'A clause with no literals cannot be satisfied by anything, so it stands for false. A set with no clauses has nothing to satisfy, so it stands for true. Every refutation ends at the empty clause, and the empty clause is the only way resolution reports a contradiction.',
      narration: 'The empty clause is falsity, and the empty set of clauses is trivially true.',
      keyword: 'empty clause',
      trap: 'Treating an empty clause as a clause you forgot to fill in. It is the goal of the whole method, and it is drawn as a small square.'
    },

    /* ---- scene 3: rule ---- */
    {
      id: 'u-1', scene: 'rule', start: 60, end: 67.5,
      caption: 'Two clauses that disagree on exactly one variable produce a new clause.',
      detail: 'The two parents must contain the same variable, once positive and once negative. That variable is the pivot. If no variable is complementary, the pair says nothing new, and no resolvent exists.',
      narration: 'Two clauses that disagree on exactly one variable produce a new clause.',
      keyword: 'exactly one variable',
      trap: 'Resolving two clauses that share no complementary variable. Two clauses that agree on every shared variable have no resolvent.'
    },
    {
      id: 'u-2', scene: 'rule', start: 67.5, end: 75,
      caption: 'Cancel the pair, keep everything else, drop repeated literals. That is the resolvent.',
      detail: 'The resolvent is the union of the two clauses with the pivot and its negation removed. Repeated literals collapse, because a disjunction is a set. Nothing else is removed: every other literal of both parents survives into the resolvent.',
      narration: 'Cancel the pair, keep everything else, drop repeated literals. That is the resolvent.',
      keyword: 'cancel the pair',
      trap: 'Removing a literal because it looks irrelevant. Only the pivot pair is removed; every other literal is kept.'
    },
    {
      id: 'u-3', scene: 'rule', start: 75, end: 82.5,
      caption: 'The pivot must be positive in one parent and negative in the other. Agreement on a variable gives nothing.',
      detail: 'The rule is asymmetric in the literals it needs: one parent carries the variable, the other carries its negation. Two clauses that both contain P, or both contain not P, cannot be resolved on P, because no assignment is forced by their agreement.',
      narration: 'The pivot must be positive in one parent and negative in the other. Agreement on a variable gives nothing.',
      keyword: 'positive in one, negative in the other',
      trap: 'Resolving on a variable both parents share with the same sign. That is not a resolution step, and any clause it produces is unsound.'
    },
    {
      id: 'u-4', scene: 'rule', start: 82.5, end: 90,
      caption: 'A resolvent containing a variable and its negation is a tautology, and it is thrown away.',
      detail: 'If the union brings in Q and not Q, the resolvent is true under every assignment and carries no information. Keeping it would make the closure grow without teaching anything, so every implementation drops it. Dropping a tautology is safe because it is entailed by everything.',
      narration: 'A resolvent containing a variable and its negation is a tautology, and it is thrown away.',
      keyword: 'tautology',
      trap: 'Keeping tautological resolvents, then concluding that a satisfiable set is unsatisfiable because the closure looks busy.'
    },

    /* ---- scene 4: sound ---- */
    {
      id: 's-1', scene: 'sound', start: 90, end: 97.5,
      caption: 'The rule is sound: every assignment that satisfies both parents satisfies the resolvent.',
      detail: 'Soundness is the claim that the resolvent is a logical consequence of its two parents. It is checked here by brute force on every pair of clauses over four variables: every assignment satisfying both parents also satisfies the resolvent, with no exception.',
      narration: 'The rule is sound: every assignment that satisfies both parents satisfies the resolvent.',
      keyword: 'sound',
      trap: 'Believing the resolvent is equivalent to the parents. It is weaker: it follows from them, and it does not imply them.'
    },
    {
      id: 's-2', scene: 'sound', start: 97.5, end: 105,
      caption: 'There are two cases and no third: the pivot is true, or the pivot is false.',
      detail: 'Take the pivot variable R. Under any assignment it has one truth value. The case split is exhaustive, and each case forces one of the two parents to supply a surviving literal, which is exactly a literal of the resolvent.',
      narration: 'There are two cases and no third: the pivot is true, or the pivot is false.',
      keyword: 'two cases',
      trap: 'Trying to prove soundness with a third case, or by example. One example shows the rule can work; the case split shows it always works.'
    },
    {
      id: 's-3', scene: 'sound', start: 105, end: 112.5,
      caption: 'If the pivot is true, the clause holding its negation must be satisfied by something else.',
      detail: 'When R is true, the parent that contains not R is satisfied only through one of its other literals, and that literal is in the resolvent. When R is false, the parent that contains R is satisfied only through one of its other literals, and that one is in the resolvent too.',
      narration: 'If the pivot is true, the clause holding its negation must be satisfied by something else, and that something is in the resolvent.',
      keyword: 'satisfied by something else',
      trap: 'Forgetting that a clause is satisfied by one literal, not by all of them. That is what makes the case argument work.'
    },
    {
      id: 's-4', scene: 'sound', start: 112.5, end: 120,
      caption: 'Adding a resolvent never changes satisfiability, so a satisfiable set can never produce the empty clause.',
      detail: 'A resolvent is entailed by the set, so adding it removes no model. Satisfiability is therefore preserved in both directions: the set with the resolvent is satisfiable exactly when the set without it is. The empty clause has no model, so it can only appear when the original set had none.',
      narration: 'Adding a resolvent never changes satisfiability, so a satisfiable set can never produce the empty clause.',
      keyword: 'never changes satisfiability',
      trap: 'Concluding from a derived clause that the set changed meaning. Resolution adds consequences, and consequences never remove models.'
    },

    /* ---- scene 5: work ---- */
    {
      id: 'w-1', scene: 'work', start: 120, end: 127.5,
      caption: 'Four clauses over two variables: P or Q, P or not Q, not P or Q, not P or not Q.',
      detail: 'Every pair of clauses differs in exactly one variable, which is the shape that makes this the standard first refutation. The set has no model: whatever P and Q are, one of the four clauses is false, and the page checks all four assignments.',
      narration: 'Four clauses over two variables: P or Q, P or not Q, not P or Q, not P or not Q.',
      keyword: 'four clauses',
      trap: 'Assuming a set of four clauses is satisfiable because no single clause is obviously false. Each clause is true in three of the four assignments.'
    },
    {
      id: 'w-2', scene: 'work', start: 127.5, end: 135,
      caption: 'The first pair differs only on Q, so resolve on Q and get P.',
      detail: 'P or Q and P or not Q share the literal P and disagree on Q. Cancelling the Q pair leaves P alone: a unit clause, which is the strongest thing a refutation can derive before the end.',
      narration: 'The first pair differs only on Q, so resolve on Q and get P.',
      keyword: 'resolve on Q',
      trap: 'Writing the resolvent as P or Q or not Q. The cancelled pair disappears; it does not become a tautology inside the answer.'
    },
    {
      id: 'w-3', scene: 'work', start: 135, end: 142.5,
      caption: 'The second pair differs only on Q as well, so resolve on Q and get not P.',
      detail: 'not P or Q and not P or not Q share not P and disagree on Q. Cancelling the Q pair leaves not P. The two derived units now contradict each other, and the next step is forced.',
      narration: 'The second pair differs only on Q as well, so resolve on Q and get not P.',
      keyword: 'get not P',
      trap: 'Resolving the first clause with the third clause instead. It is legal, and it produces a tautology that teaches nothing.'
    },
    {
      id: 'w-4', scene: 'work', start: 142.5, end: 150,
      caption: 'P and not P give the empty clause. The set is unsatisfiable, and every original clause is used once.',
      detail: 'The last step cancels P and not P and leaves nothing at all, which is the empty clause. Reading the derivation backwards gives a tree with the four original clauses as leaves and the empty clause as the only root: a refutation.',
      narration: 'P and not P give the empty clause. The set is unsatisfiable, and every original clause is used once.',
      keyword: 'the empty clause',
      trap: 'Stopping at the contradictory units. Two unit clauses are a contradiction only after they are resolved into the empty clause.'
    },

    /* ---- scene 6: limit ---- */
    {
      id: 'l-1', scene: 'limit', start: 150, end: 157.5,
      caption: 'Resolution is complete for refutation: an unsatisfiable set always has a refutation.',
      detail: 'Robinson proved in 1965 that a finite set of clauses is unsatisfiable if and only if some sequence of resolution steps ends at the empty clause. The page checks the propositional half exhaustively on every set of up to three clauses over three variables.',
      narration: 'Resolution is complete for refutation: an unsatisfiable set always has a refutation.',
      keyword: 'complete for refutation',
      trap: 'Reading completeness as "every consequence can be derived". The theorem is about the empty clause, not about arbitrary clauses.'
    },
    {
      id: 'l-2', scene: 'limit', start: 157.5, end: 165,
      caption: 'It is not complete for derivation: from the single clause P you can derive nothing at all.',
      detail: 'Resolution needs two parents with a complementary pair. A set of unit clauses offers no such pair, so the closure of P is just P, with zero derived clauses. The clause P or Q is a consequence of P, and no sequence of resolution steps produces it.',
      narration: 'It is not complete for derivation: from the single clause P you can derive nothing at all.',
      keyword: 'nothing at all',
      trap: 'Expecting the closure to contain every entailed clause. It contains the resolvents, which is a smaller set.'
    },
    {
      id: 'l-3', scene: 'limit', start: 165, end: 172.5,
      caption: 'That is not a defect. To show P entails Q, you refute P together with not Q, and that set is satisfiable.',
      detail: 'The set of P and not Q has a model, the assignment making P true and Q false. So no refutation exists, and the method correctly reports that Q does not follow. The refutation form is what turns a completeness theorem into a decision procedure for entailment.',
      narration: 'That is not a defect. To show P entails Q, you refute P together with not Q, and that set is satisfiable.',
      keyword: 'satisfiable',
      trap: 'Running resolution on the knowledge base alone and expecting a verdict. Nothing is being refuted unless the negated goal is in the set.'
    },
    {
      id: 'l-4', scene: 'limit', start: 172.5, end: 180,
      caption: 'Refutation answers one question only: can this set of clauses be satisfied?',
      detail: 'That is the whole interface. Given a set, the method either produces the empty clause, which means no, or it saturates without producing it, which means yes for a finite propositional set. Every other use of resolution is this question in disguise.',
      narration: 'Refutation answers one question only: can this set of clauses be satisfied?',
      keyword: 'can this set be satisfied',
      trap: 'Asking resolution to produce a model. It proves that no model exists; it does not hand one back.'
    },

    /* ---- scene 7: horn ---- */
    {
      id: 'h-1', scene: 'horn', start: 180, end: 187.5,
      caption: 'A Horn clause has at most one positive literal, so at most one conclusion.',
      detail: 'A positive literal is a variable written without a negation sign. A Horn clause allows at most one of those. The restriction is severe: the clause P or Q is not Horn, because it offers two ways to be true and neither is a conclusion.',
      narration: 'A Horn clause has at most one positive literal, so at most one conclusion.',
      keyword: 'at most one positive literal',
      trap: 'Counting all literals instead of the positive ones. Not A or not B or C is Horn, and it has three literals.'
    },
    {
      id: 'h-2', scene: 'horn', start: 187.5, end: 195,
      caption: 'Read as a rule: not A or not B or C says A and B together give C.',
      detail: 'The single positive literal becomes the conclusion and every negative literal becomes a premise. A clause with no negative literals is a fact, and a clause with no positive literal is a goal, a statement of something to be refuted. A clause with neither is the empty clause.',
      narration: 'Read as a rule: not A or not B or C says A and B together give C.',
      keyword: 'A and B give C',
      trap: 'Reading the negated literals as conclusions. In a Horn clause the only conclusion is the single positive literal.'
    },
    {
      id: 'h-3', scene: 'horn', start: 195, end: 202.5,
      caption: 'Unit propagation marks a fact, then fires every rule whose premises are all marked.',
      detail: 'Start from the unit clauses and mark their atoms. Then a rule whose premises are all marked marks its conclusion, which may fire further rules. Every mark is forced: an atom marked this way is true in every model of the set, which is why the result is the smallest model.',
      narration: 'Unit propagation marks a fact, then fires every rule whose premises are all marked.',
      keyword: 'fires every rule',
      trap: 'Marking a conclusion whose premises are only partly marked. The rule needs all of its premises, not one of them.'
    },
    {
      id: 'h-4', scene: 'horn', start: 202.5, end: 210,
      caption: 'On Horn clauses this settles satisfiability in linear time.',
      detail: 'Dowling and Gallier gave a linear-time algorithm in 1984: with a queue of newly marked atoms and a list of the rules that watch each atom, every literal is visited once. The set is unsatisfiable exactly when some goal clause has all of its premises marked.',
      narration: 'On Horn clauses this settles satisfiability in linear time.',
      keyword: 'linear time',
      trap: 'Claiming the linear bound for arbitrary clauses. The linear-time result is for Horn sets; the general problem is NP-complete.'
    },

    /* ---- scene 8: up ---- */
    {
      id: 'p-1', scene: 'up', start: 210, end: 217.5,
      caption: 'Five Horn clauses over five atoms: two facts, two rules and one goal.',
      detail: 'The facts are A and C. The rules are: A and C give B, and A and B give D. The goal is not B or not E. Propagation marks A and C from the facts, fires the first rule to mark B, then the second to mark D, and the page prints the marks in the order they arrive.',
      narration: 'Five Horn clauses over five atoms: two facts, two rules and one goal.',
      keyword: 'two facts, two rules, one goal',
      trap: 'Treating the goal clause as a fact. A clause with no positive literal is what you are trying to refute, not something you may assume.'
    },
    {
      id: 'p-2', scene: 'up', start: 217.5, end: 225,
      caption: 'The goal is never triggered, because E is never derived, so the set is satisfiable and the marked atoms form its smallest model.',
      detail: 'The goal needs B and E. B is marked, but E is never marked: no rule concludes E. So the goal clause is not violated, the set is satisfiable, and the marked atoms alone form a model, the one with the fewest true atoms.',
      narration: 'The goal is never triggered, because E is never derived, so the set is satisfiable and the marked atoms form its smallest model.',
      keyword: 'smallest model',
      trap: 'Assuming the unmarked atoms are false in every model. They are false in the smallest model; other models may set them true.'
    },
    {
      id: 'p-3', scene: 'up', start: 225, end: 232.5,
      caption: 'Now the four clauses over P and Q. There is no unit clause, so propagation cannot start.',
      detail: 'All four clauses have two literals. Unit propagation needs a clause of one literal to begin, and there is none, so the procedure stops immediately and reports no conflict. It has learned nothing about the set, and it says so.',
      narration: 'Now the four clauses over P and Q. There is no unit clause, so propagation cannot start.',
      keyword: 'no unit clause',
      trap: 'Reporting a set as satisfiable because propagation found no conflict. No conflict means no refutation was found, not that a model exists.'
    },
    {
      id: 'p-4', scene: 'up', start: 232.5, end: 240,
      caption: 'Yet the set is unsatisfiable, and resolution refutes it in three steps. Unit propagation alone is not complete.',
      detail: 'The same four clauses are refuted by resolving on Q twice and then on P. So propagation is complete on Horn sets and incomplete in general: it is a decision procedure only inside the fragment it was designed for.',
      narration: 'Yet the set is unsatisfiable, and resolution refutes it in three steps. Unit propagation alone is not complete.',
      keyword: 'not complete',
      trap: 'Using propagation as a satisfiability test on general CNF. It is a sound refuter and an incomplete one.'
    },

    /* ---- scene 9: trap ---- */
    {
      id: 't-1', scene: 'trap', start: 240, end: 247.5,
      caption: 'Resolving on two variables at once is unsound: P or Q with not P or not Q.',
      detail: 'The two clauses are complementary on P and also on Q, so a rule that cancels both pairs at once would produce the empty clause. That rule is wrong, and one assignment is enough to show it: P true and Q false satisfies both parents.',
      narration: 'Resolving on two variables at once is unsound: P or Q with not P or not Q.',
      keyword: 'two variables at once',
      trap: 'Cancelling every complementary pair between two clauses. One pivot per step, always.'
    },
    {
      id: 't-2', scene: 'trap', start: 247.5, end: 255,
      caption: 'Cancelling both pairs gives the empty clause, but P true and Q false satisfies both parents.',
      detail: 'Under that assignment P or Q is true through P, and not P or not Q is true through not Q. So the pair has a model, and the empty clause derived from it would be a false conclusion drawn from true premises. Unsoundness, in one line.',
      narration: 'Cancelling both pairs gives the empty clause, but P true and Q false satisfies both parents.',
      keyword: 'satisfies both parents',
      trap: 'Trusting a derivation that cancels more than one pair because the result looks like a clean contradiction.'
    },
    {
      id: 't-3', scene: 'trap', start: 255, end: 262.5,
      caption: 'Done legally, both resolvents are tautologies and are dropped, so nothing new is derived.',
      detail: 'Resolving on P alone leaves Q or not Q; resolving on Q alone leaves P or not P. Both are tautologies, both are dropped, and the closure is exactly the two original clauses. The method correctly reports that the set is satisfiable.',
      narration: 'Done legally, both resolvents are tautologies and are dropped, so nothing new is derived.',
      keyword: 'tautologies',
      trap: 'Thinking a set is unsatisfiable because resolving it produces clauses with a variable and its negation. Those are the tautologies you drop.'
    },
    {
      id: 't-4', scene: 'trap', start: 262.5, end: 270,
      caption: 'Complete does not mean cheap: the pigeonhole clauses grow from 6 to 73 to more than 900.',
      detail: 'For n plus one pigeons in n holes the page saturates the clause set and counts. Two pigeons give 6 clauses, three give 73, and four pass 900 before the page stops counting. Haken proved in 1985 that every resolution refutation of these clauses needs exponentially many steps.',
      narration: 'Complete does not mean cheap: the pigeonhole clauses grow from 6 to 73 to more than 900.',
      keyword: 'exponentially',
      trap: 'Assuming a complete method is a practical one. Completeness is a guarantee about existence, never about size.'
    },

    /* ---- scene 10: proc ---- */
    {
      id: 'x-1', scene: 'proc', start: 270, end: 277.5,
      caption: 'Step one: put the negation of the goal into clauses, and add those clauses to the set.',
      detail: 'The goal is negated first, then converted, because the conversion works on any formula. A negated goal usually becomes several clauses, and every one of them is added. Forgetting one clause is the commonest way to refute the wrong set.',
      narration: 'Step one: put the negation of the goal into clauses, and add those clauses to the set.',
      keyword: 'negation of the goal',
      trap: 'Adding the goal instead of its negation. That refutes the wrong thing, and usually finds nothing.'
    },
    {
      id: 'x-2', scene: 'proc', start: 277.5, end: 285,
      caption: 'Step two: find a complementary pair, resolve on that one variable, and keep the result if it is new and not a tautology.',
      detail: 'One pivot per step. Drop the resolvent if it repeats a clause already present, if a present clause subsumes it, or if it is a tautology. Those three tests are what keep the closure from exploding on small examples.',
      narration: 'Step two: find a complementary pair, resolve on that one variable, and keep the result if it is new and not a tautology.',
      keyword: 'one variable',
      trap: 'Resolving on several pairs in one step, which is the unsound rule from the previous scene.'
    },
    {
      id: 'x-3', scene: 'proc', start: 285, end: 292.5,
      caption: 'Step three: repeat until the empty clause appears, or until no new clause can be made.',
      detail: 'The two outcomes are the two answers. The empty clause means the set is unsatisfiable, so the goal is entailed. A closed set without the empty clause means the set is satisfiable, so the goal is not entailed. For a Horn set, unit propagation does this without any search.',
      narration: 'Step three: repeat until the empty clause appears, or until no new clause can be made.',
      keyword: 'until no new clause',
      trap: 'Stopping early because the closure looks large. Only the empty clause or a closed set is an answer.'
    },
    {
      id: 'x-4', scene: 'proc', start: 292.5, end: 300,
      caption: 'Five traps, one defence: one pivot, one pair, and the empty clause as the only verdict.',
      detail: 'The traps are: reading a set of clauses as a disjunction, adding the goal instead of its negation, cancelling two pairs at once, keeping tautologies, and treating a stalled propagation as a model. The defence is the same each time: name the pivot, name the set, and ask for the empty clause.',
      narration: 'Five traps, one defence: one pivot, one pair, and the empty clause as the only verdict.',
      keyword: 'the empty clause',
      trap: 'Checking the arithmetic of a derivation and never the shape of the step. Every trap here produces a plausible-looking clause.'
    }
  ]
};
