/* ==========================================================================
   propositional-logic — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs — never edited by hand.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'proposition',
      n: 1,
      title: 'A proposition is true or false',
      start: 0, end: 22,
      objective: 'Sort sentences into propositions and non-propositions, and see why an open sentence is not one.'
    },
    {
      id: 'connectives',
      n: 2,
      title: 'Negation, and, or',
      start: 22, end: 58,
      objective: 'Build the truth table of NOT, AND and OR column by column from the meanings of the words.'
    },
    {
      id: 'implication',
      n: 3,
      title: 'Implication: one false row out of four',
      start: 58, end: 96,
      objective: 'Read P implies Q, justify the two vacuous rows, and derive P implies Q is NOT P or Q.'
    },
    {
      id: 'converse',
      n: 4,
      title: 'Converse, inverse, contrapositive',
      start: 96, end: 130,
      objective: 'Identify which rearrangement of an implication is equivalent to it, by comparing columns.'
    },
    {
      id: 'xor-iff',
      n: 5,
      title: 'Exclusive or, biconditional, precedence',
      start: 130, end: 160,
      objective: 'Fix the meaning of XOR and IFF, then parse a formula using the precedence order.'
    },
    {
      id: 'classify',
      n: 6,
      title: 'Tautology, contradiction, contingency',
      start: 160, end: 186,
      objective: 'Classify a formula by reading the whole final column of its truth table.'
    },
    {
      id: 'equivalence',
      n: 7,
      title: 'Logical equivalence, and De Morgan',
      start: 186, end: 216,
      objective: 'Test equivalence by column matching, and verify both De Morgan laws across all eight rows.'
    },
    {
      id: 'arguments',
      n: 8,
      title: 'Valid arguments and the two famous errors',
      start: 216, end: 252,
      objective: 'Decide validity by a tautology test, then find the single row that kills affirming the consequent.'
    },
    {
      id: 'satisfiability',
      n: 9,
      title: 'Satisfiable, and how many rows',
      start: 252, end: 278,
      objective: 'Place every formula in one of three classes and count truth tables exactly.'
    },
    {
      id: 'rules',
      n: 10,
      title: 'The rules worth carrying in',
      start: 278, end: 300,
      objective: 'Consolidate the five load-bearing rules and the three errors they prevent.'
    }
  ],

  events: [
    /* ---- scene 1: proposition ---- */
    {
      id: 'prop-1', start: 0, end: 5.5, scene: 'proposition',
      caption: 'A proposition is a statement that is either true or false.',
      detail: 'A declarative sentence has a truth value: true or false. A proposition is such a sentence. It is never both, and it is never neither.',
      keyword: 'either true or false',
      trap: 'Questions, commands and exclamations are not propositions. They have no truth value to be right or wrong about.',
      narration: 'A proposition is a statement that is either true or false. Never both, and never neither.'
    },
    {
      id: 'prop-2', start: 5.5, end: 11, scene: 'proposition',
      caption: 'Seven is prime: a proposition, and it is true.',
      detail: 'Whether we know the value does not matter. The sentence is true or false in the world, and that is all a proposition needs.',
      keyword: 'true',
      trap: null,
      narration: 'Seven is prime is a proposition, and its value is true.'
    },
    {
      id: 'prop-3', start: 11, end: 16, scene: 'proposition',
      caption: 'Two plus two equals five: also a proposition, and false.',
      detail: 'A false statement is still a proposition. Being false is a truth value, not a failure to be one.',
      keyword: 'false',
      trap: 'A false statement is not a non-proposition. The common error is to throw out sentences that are false.',
      narration: 'Two plus two equals five is also a proposition. Its value is false.'
    },
    {
      id: 'prop-4', start: 16, end: 22, scene: 'proposition',
      caption: 'Close the door, and x plus one equals three: not propositions yet.',
      detail: 'A command has no truth value. An open sentence has a truth value only after the variable is given a value; supplying that value is what predicate logic does, in the next lesson.',
      keyword: 'open sentence',
      trap: 'x plus one equals three is the standard trap. It becomes true or false only once x is fixed, so as written it is not a proposition.',
      narration: 'A command has no truth value. And x plus one equals three stays open until x is fixed. Fixing x is the job of predicate logic.'
    },

    /* ---- scene 2: connectives ---- */
    {
      id: 'conn-1', start: 22, end: 27, scene: 'connectives',
      caption: 'NOT P flips the value: true becomes false, false becomes true.',
      detail: 'Negation is written with a hook symbol or a tilde, and read as "not P". It is the only connective that needs one input.',
      keyword: 'flips',
      trap: 'Double negation cancels: NOT NOT P has the same column as P, in every row.',
      narration: 'Negation flips the truth value. It is written as a hook, and read as not P.'
    },
    {
      id: 'conn-2', start: 27, end: 32, scene: 'connectives',
      caption: 'P AND Q is true in exactly one row: both true.',
      detail: 'Conjunction is written as an upside-down V, and read "P and Q". It needs both parts to hold, so every other row is false.',
      keyword: 'both true',
      trap: null,
      narration: 'P and Q is true in exactly one of the four rows, the row where both are true.'
    },
    {
      id: 'conn-3', start: 32, end: 38, scene: 'connectives',
      caption: 'P OR Q is true in three rows: at least one of them is true.',
      detail: 'Disjunction is written as a V, and read "P or Q". In logic it is inclusive: it is true when either holds, and also when both hold.',
      keyword: 'at least one',
      trap: 'Everyday English sometimes means exclusive or. In logic the V symbol is always inclusive unless the question says otherwise.',
      narration: 'P or Q is true in three rows. At least one of them is true, and that includes both.'
    },
    {
      id: 'conn-4', start: 38, end: 44, scene: 'connectives',
      caption: 'Four rows, because two variables give two to the power two combinations.',
      detail: 'Each variable contributes a factor of two. The left variable alternates slowest, so the rows run true-true, true-false, false-true, false-false.',
      keyword: 'four rows',
      trap: 'The row order is a convention, not part of the meaning. Any order is correct as long as every combination appears once.',
      narration: 'Four rows, because two variables give two squared, which is four, combinations.'
    },
    {
      id: 'conn-5', start: 44, end: 50, scene: 'connectives',
      caption: 'Read a table by columns, not by rows: each column is one formula.',
      detail: 'The two input columns are given. Every other column is computed from the ones to its left, which is how a long formula gets built without guessing.',
      keyword: 'one formula',
      trap: null,
      narration: 'Read the table by columns. Each column holds the value of one formula in all four rows.'
    },
    {
      id: 'conn-6', start: 50, end: 58, scene: 'connectives',
      caption: 'These three columns are the whole vocabulary you will reuse all lesson.',
      detail: 'NOT, AND and OR are enough to express every other connective, which is why the next two scenes are built out of them.',
      keyword: 'vocabulary',
      trap: null,
      narration: 'These three columns are the vocabulary the rest of the lesson reuses.'
    },

    /* ---- scene 3: implication ---- */
    {
      id: 'imp-1', start: 58, end: 64, scene: 'implication',
      caption: 'P implies Q: if P then Q. P is the hypothesis, Q the conclusion.',
      detail: 'The arrow points from the condition to the consequence. P is called the antecedent and Q the consequent.',
      keyword: 'if P then Q',
      trap: 'The arrow is not symmetric. Swapping the ends gives a different formula, which scene four makes precise.',
      narration: 'P implies Q reads, if P then Q. P is the hypothesis and Q is the conclusion.'
    },
    {
      id: 'imp-2', start: 64, end: 70, scene: 'implication',
      caption: 'Only one row is false: P true and Q false.',
      detail: 'An implication is broken exactly when the condition holds and the consequence does not. That single false row is what the whole connective is designed to catch.',
      keyword: 'only one row',
      trap: 'Three of the four rows are true. A student who remembers only the false row will get the vacuous rows wrong.',
      narration: 'Only one of the four rows is false, the row where P is true and Q is false.'
    },
    {
      id: 'imp-3', start: 70, end: 78, scene: 'implication',
      caption: 'A promise: if you score above ninety, I will gift you a cycle.',
      detail: 'I broke the promise only if you scored above ninety and got no cycle. If you scored below ninety, I never promised anything, so I cannot have broken it.',
      keyword: 'promise',
      trap: 'The two rows where P is false are true because no promise was made, not because something good happened.',
      narration: 'Think of it as a promise. I break it only if you score above ninety and get no cycle. Below ninety, I promised nothing, so I broke nothing.'
    },
    {
      id: 'imp-4', start: 78, end: 84, scene: 'implication',
      caption: 'When the hypothesis is false, the implication is true. This is vacuous truth.',
      detail: 'If the world never satisfies the condition, the conditional claim was never tested. Logic calls such a claim vacuously true.',
      keyword: 'vacuous truth',
      trap: 'If two plus two equals five, then I am the king of India is a true implication, because the hypothesis is false. That feels wrong and is right.',
      narration: 'When the hypothesis is false, the implication counts as true. That is called vacuous truth.'
    },
    {
      id: 'imp-5', start: 84, end: 90, scene: 'implication',
      caption: 'P implies Q has exactly the column of NOT P or Q.',
      detail: 'Compare the two columns row by row. They agree in all four rows, so the two formulas are logically equivalent and may replace each other anywhere.',
      keyword: 'NOT P or Q',
      trap: 'This equivalence is the standard way to remove an arrow. Do it only in the direction written, and never drop the NOT.',
      narration: 'P implies Q has exactly the same column as not P or Q. Four rows, four agreements.'
    },
    {
      id: 'imp-6', start: 90, end: 96, scene: 'implication',
      caption: 'Four English phrasings that all mean P implies Q.',
      detail: 'P only if Q. Q if P. P is sufficient for Q. Q is necessary for P. Each one puts the arrow from P to Q, and each one is a favourite of question setters.',
      keyword: 'only if',
      trap: 'P if Q is the converse, not the same claim. One word moves the arrow to the other end.',
      narration: 'P only if Q, Q if P, P is sufficient for Q, Q is necessary for P. All four mean the same arrow.'
    },

    /* ---- scene 4: converse ---- */
    {
      id: 'cv-1', start: 96, end: 101, scene: 'converse',
      caption: 'Converse: swap the ends, Q implies P.',
      detail: 'The converse is a new formula. It is not implied by the original in general, and it can be true or false independently.',
      keyword: 'converse',
      trap: 'Proving the converse does not prove the original. This is the single most common reasoning error in the whole subject.',
      narration: 'The converse swaps the ends. Q implies P. It is a different formula.'
    },
    {
      id: 'cv-2', start: 101, end: 107, scene: 'converse',
      caption: 'Inverse: negate both ends, NOT P implies NOT Q.',
      detail: 'The inverse keeps the arrow direction and negates each side. It is not equivalent to the original either.',
      keyword: 'inverse',
      trap: 'Inverse is not the same word as contrapositive. They look alike and behave differently.',
      narration: 'The inverse negates both ends and keeps the arrow direction. Not P implies not Q.'
    },
    {
      id: 'cv-3', start: 107, end: 114, scene: 'converse',
      caption: 'Contrapositive: swap the ends and negate both, NOT Q implies NOT P.',
      detail: 'Two changes at once: the ends exchange places and each is negated. This is the only rearrangement that preserves the meaning.',
      keyword: 'contrapositive',
      trap: 'Missing either change gives a formula that is not equivalent. Both changes are needed.',
      narration: 'The contrapositive swaps the ends and negates both. Not Q implies not P.'
    },
    {
      id: 'cv-4', start: 114, end: 121, scene: 'converse',
      caption: 'The contrapositive matches the original in all four rows.',
      detail: 'Column four and column two are identical down the table, so the two formulas are logically equivalent. Proving one proves the other.',
      keyword: 'matches in all four rows',
      trap: null,
      narration: 'The contrapositive matches the original in all four rows, so the two are equivalent.'
    },
    {
      id: 'cv-5', start: 121, end: 130, scene: 'converse',
      caption: 'The converse and the inverse each differ from the original in two rows.',
      detail: 'Both are false exactly when P is false and Q is true. They agree with each other in every row, which is why the pair is easy to mix up with the original.',
      keyword: 'two rows',
      trap: 'A single counterexample row is enough to disprove equivalence. Two rows disagree here, and the row P false, Q true is the memorable one.',
      narration: 'The converse and the inverse each differ from the original in two rows, both false when P is false and Q is true.'
    },

    /* ---- scene 5: xor-iff ---- */
    {
      id: 'x-1', start: 130, end: 135, scene: 'xor-iff',
      caption: 'Exclusive or is true when exactly one of the two is true.',
      detail: 'Written as a V inside a circle, or as the word XOR. It is false when both are true, which is exactly where inclusive or is true.',
      keyword: 'exactly one',
      trap: 'XOR and OR differ in the both-true row only. That one row is what a question is testing.',
      narration: 'Exclusive or is true when exactly one is true. It is false when both are true.'
    },
    {
      id: 'x-2', start: 135, end: 140, scene: 'xor-iff',
      caption: 'The biconditional P if and only if Q is true when the two agree.',
      detail: 'Written as a double arrow. It is true in the both-true row and in the both-false row, and false in the two mixed rows.',
      keyword: 'when the two agree',
      trap: 'The biconditional is not the conjunction of two implications written out; it is equivalent to it, which is a claim you verify, not a definition.',
      narration: 'The biconditional is true when the two sides agree, and false when they differ.'
    },
    {
      id: 'x-3', start: 140, end: 146, scene: 'xor-iff',
      caption: 'So the biconditional is the negation of exclusive or, in every row.',
      detail: 'Column five and the flipped column four agree in all four rows. Two connectives, one column and its mirror.',
      keyword: 'negation of exclusive or',
      trap: null,
      narration: 'The biconditional is the negation of exclusive or, in every row.'
    },
    {
      id: 'x-4', start: 146, end: 153, scene: 'xor-iff',
      caption: 'Precedence: NOT binds tightest, then AND, then OR, then implies, then iff.',
      detail: 'The order is NOT, AND, OR, implication, biconditional. Anything you want evaluated earlier goes in brackets.',
      keyword: 'precedence',
      trap: 'AND and OR do not have equal precedence. Reading left to right without the order is the standard way to get a parsing question wrong.',
      narration: 'Precedence runs from not, to and, to or, to implication, to biconditional.'
    },
    {
      id: 'x-5', start: 153, end: 160, scene: 'xor-iff',
      caption: 'Implication is right associative: P implies Q implies R means P implies, Q implies R.',
      detail: 'The arrow groups to the right. Bracketing the other way, P implies Q, then implies R, is a different formula with a different column.',
      keyword: 'right associative',
      trap: 'Most operators in mathematics associate to the left. The arrow is the exception that question setters exploit.',
      narration: 'Implication groups to the right. P implies Q implies R is P implies, Q implies R.'
    },

    /* ---- scene 6: classify ---- */
    {
      id: 'cl-1', start: 160, end: 166, scene: 'classify',
      caption: 'A tautology is true in every row. P or NOT P is the model.',
      detail: 'Whatever P is, one of P and its negation holds, so the column is all true. Tautologies are the formulas an argument may always use.',
      keyword: 'true in every row',
      trap: null,
      narration: 'A tautology is true in every row. P or not P is the model case.'
    },
    {
      id: 'cl-2', start: 166, end: 171, scene: 'classify',
      caption: 'A contradiction is false in every row. P and NOT P is the model.',
      detail: 'No assignment can make both P and its negation true, so the column is all false. A contradiction entails everything, which is why it is never a useful premise.',
      keyword: 'false in every row',
      trap: 'The negation of a tautology is a contradiction, and the negation of a contradiction is a tautology. Neither is a contingency.',
      narration: 'A contradiction is false in every row. P and not P is the model case.'
    },
    {
      id: 'cl-3', start: 171, end: 177, scene: 'classify',
      caption: 'Anything else is a contingency: true in some rows, false in others.',
      detail: 'P implies Q is the typical case. It is true in three rows and false in one, so it depends on the world, which is what contingency means.',
      keyword: 'contingency',
      trap: 'Most formulas you meet are contingencies. Do not assume a formula is a tautology because every row you checked happened to be true.',
      narration: 'Everything else is a contingency. True in some rows and false in others.'
    },
    {
      id: 'cl-4', start: 177, end: 186, scene: 'classify',
      caption: 'The decision procedure: write every row, then read the last column.',
      detail: 'All true means tautology. All false means contradiction. Mixed means contingency. There are finitely many rows, so the procedure always terminates.',
      keyword: 'read the last column',
      trap: 'One true row never proves a tautology. Every row must be true, and for three variables that is eight rows, not four.',
      narration: 'The procedure is mechanical. Write every row, then read the final column.'
    },

    /* ---- scene 7: equivalence ---- */
    {
      id: 'eq-1', start: 186, end: 192, scene: 'equivalence',
      caption: 'Two formulas are logically equivalent when their columns are identical.',
      detail: 'Equivalent means same truth value in every row, not same shape and not same length. An equivalence is a claim about all rows at once.',
      keyword: 'columns are identical',
      trap: 'A single row where the values agree proves nothing. Equivalence needs the whole column.',
      narration: 'Two formulas are logically equivalent when their columns are identical in every row.'
    },
    {
      id: 'eq-2', start: 192, end: 199, scene: 'equivalence',
      caption: 'De Morgan, first law: NOT of P and Q is NOT P or NOT Q.',
      detail: 'Negating a conjunction turns it into a disjunction of negations. Check it row by row: wherever the left side is true the right side is true.',
      keyword: 'first law',
      trap: 'The connective flips when the negation goes inside. NOT of P and Q is not NOT P and NOT Q.',
      narration: 'De Morgan, first law. Not, P and Q, is not P, or not Q. The connective flips.'
    },
    {
      id: 'eq-3', start: 199, end: 206, scene: 'equivalence',
      caption: 'De Morgan, second law: NOT of P or Q is NOT P and NOT Q.',
      detail: 'The same flip in the other direction. Both laws hold for any number of parts, which is why a long chain can be negated one term at a time.',
      keyword: 'second law',
      trap: 'Both laws require the connective to flip. Negating without flipping gives a formula that disagrees in two rows.',
      narration: 'De Morgan, second law. Not, P or Q, is not P, and not Q. Again the connective flips.'
    },
    {
      id: 'eq-4', start: 206, end: 216, scene: 'equivalence',
      caption: 'Distribution works, and the two sides need all eight rows of three variables to prove it.',
      detail: 'P and, Q or R, equals, P and Q, or, P and R. Three variables mean eight rows, and the two columns agree in every one of them.',
      keyword: 'eight rows',
      trap: 'A formula with three variables has eight rows, not six. The count is two to the power of the number of variables, and the rows you skip are where the counterexample hides.',
      narration: 'Distribution holds. With three variables that is eight rows, and the two columns agree in every one.'
    },

    /* ---- scene 8: arguments ---- */
    {
      id: 'a-1', start: 216, end: 222, scene: 'arguments',
      caption: 'An argument is valid when the premises cannot all be true while the conclusion is false.',
      detail: 'Validity is about form, not about whether the premises happen to be true in the real world. A valid argument with a false premise is still valid.',
      keyword: 'valid',
      trap: 'Valid is not the same word as true. Sound means valid with true premises, and that is a stronger requirement.',
      narration: 'An argument is valid when the premises cannot all be true while the conclusion is false.'
    },
    {
      id: 'a-2', start: 222, end: 229, scene: 'arguments',
      caption: 'Modus ponens: P implies Q, and P, therefore Q. Valid.',
      detail: 'The test is one formula: premises AND, implies, conclusion. If that formula is a tautology the argument is valid, and here it is true in all four rows.',
      keyword: 'modus ponens',
      trap: null,
      narration: 'Modus ponens. P implies Q, and P, therefore Q. The test formula is a tautology, so the argument is valid.'
    },
    {
      id: 'a-3', start: 229, end: 236, scene: 'arguments',
      caption: 'Modus tollens: P implies Q, and NOT Q, therefore NOT P. Also valid.',
      detail: 'This is the contrapositive in action. Denying the consequent does force the denial of the antecedent, and the test formula is true in all four rows.',
      keyword: 'modus tollens',
      trap: 'Modus tollens is valid. Denying the antecedent, which looks similar, is not.',
      narration: 'Modus tollens. P implies Q, and not Q, therefore not P. Also valid.'
    },
    {
      id: 'a-4', start: 236, end: 244, scene: 'arguments',
      caption: 'Affirming the consequent: P implies Q, and Q, therefore P. Invalid.',
      detail: 'The test formula is false in exactly one row, the row where P is false and Q is true. One false row is enough: the argument form does not guarantee its conclusion.',
      keyword: 'invalid',
      trap: 'The counterexample row is P false, Q true. It says the consequent can hold for a reason other than P, which is why Q does not give P back.',
      narration: 'Affirming the consequent. P implies Q, and Q, therefore P. The test formula is false in one row, so the form is invalid.'
    },
    {
      id: 'a-5', start: 244, end: 252, scene: 'arguments',
      caption: 'Denying the antecedent fails for the same row, and one counterexample settles it.',
      detail: 'P implies Q, and NOT P, therefore NOT Q. The same valuation, P false and Q true, makes both premises true and the conclusion false, so the form is invalid.',
      keyword: 'one counterexample',
      trap: 'You do not need to check every row to refute a form. One row with true premises and a false conclusion is a complete disproof.',
      narration: 'Denying the antecedent fails at the same row. One counterexample is a complete disproof of a form.'
    },

    /* ---- scene 9: satisfiability ---- */
    {
      id: 's-1', start: 252, end: 258, scene: 'satisfiability',
      caption: 'Satisfiable means some row makes it true. Unsatisfiable means no row does.',
      detail: 'A tautology is satisfiable and valid. A contradiction is unsatisfiable. A contingency is satisfiable but not valid, so the three classes are not the same split.',
      keyword: 'satisfiable',
      trap: 'Satisfiable and valid are different questions. One true row makes a formula satisfiable; only all-true rows make it valid.',
      narration: 'Satisfiable means some row makes it true. Unsatisfiable means no row does.'
    },
    {
      id: 's-2', start: 258, end: 265, scene: 'satisfiability',
      caption: 'With n variables there are two to the n rows, so three variables give eight.',
      detail: 'Each variable doubles the number of rows, because each existing row splits into a case where the new variable is true and one where it is false.',
      keyword: 'two to the n',
      trap: 'Three variables is eight rows, not six. Doubling, not adding, is what makes the table grow fast.',
      narration: 'With n variables there are two to the n rows. Three variables give eight.'
    },
    {
      id: 's-3', start: 265, end: 271, scene: 'satisfiability',
      caption: 'There are sixteen different truth tables on two variables, and 256 on three.',
      detail: 'A truth table on n variables is a column of two to the n values, so the number of distinct tables is two to the power two to the n. For two variables that is two to the fourth, sixteen.',
      keyword: 'sixteen',
      trap: 'The exponent is two to the n, not two times n. Two variables give sixteen tables, and three give two hundred and fifty six, not sixty four.',
      narration: 'There are sixteen truth tables on two variables, and two hundred and fifty six on three.'
    },
    {
      id: 's-4', start: 271, end: 278, scene: 'satisfiability',
      caption: 'That count is why questions ask how many functions or how many rows, not which one.',
      detail: 'The number of distinct Boolean functions of n variables is a fact about counting columns, and it is the same reasoning as counting rows. Recognising it turns a long question into one multiplication.',
      keyword: 'how many functions',
      trap: 'Do not answer the number of rows when the question asked for the number of functions. The second is an exponent of the first.',
      narration: 'That count is why questions ask how many functions exist rather than which one.'
    },

    /* ---- scene 10: rules ---- */
    {
      id: 'r-1', start: 278, end: 283, scene: 'rules',
      caption: 'One: an implication is false in exactly one row.',
      detail: 'True hypothesis with false conclusion is the only way to break it. Every other row is true, including the two vacuous ones.',
      keyword: 'exactly one row',
      trap: null,
      narration: 'Rule one. An implication is false in exactly one row.'
    },
    {
      id: 'r-2', start: 283, end: 288, scene: 'rules',
      caption: 'Two: contrapositive is equivalent, converse and inverse are not.',
      detail: 'Only the double change preserves the meaning. Swapping alone, or negating alone, changes the claim.',
      keyword: 'contrapositive',
      trap: null,
      narration: 'Rule two. The contrapositive is equivalent. The converse and the inverse are not.'
    },
    {
      id: 'r-3', start: 288, end: 294, scene: 'rules',
      caption: 'Three: remove an arrow by writing NOT P or Q.',
      detail: 'This single rewriting turns every implication question into a propositional one, and it is how the tautology test is computed.',
      keyword: 'NOT P or Q',
      trap: null,
      narration: 'Rule three. Remove an arrow by writing not P or Q.'
    },
    {
      id: 'r-4', start: 294, end: 300, scene: 'rules',
      caption: 'Four: a form is invalid the moment one row breaks it.',
      detail: 'One counterexample refutes a form completely, and no number of agreeing rows can establish one. Validity is a claim about all rows at once.',
      keyword: 'one row breaks it',
      trap: null,
      narration: 'Rule four. A form is invalid the moment one row breaks it. One counterexample is enough.'
    }
  ]
};
