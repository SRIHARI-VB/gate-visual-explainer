/* ==========================================================================
   algebraic-boolean-minimisation — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   captions.vtt, captions.srt and transcript.md are derived from this file by
   tools/gen-captions.mjs — never edited by hand.

   Every number quoted in a caption is produced by the model in lesson.js, which
   builds the cubes, checks every rewrite against the truth table, searches every
   cover for the minimum, and enumerates all 255 three-variable functions before
   anything is drawn.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 346,

  scenes: [
    {
      id: 'methods', n: 1,
      title: 'Three methods, one clause, three different promises',
      start: 0, end: 26,
      objective: 'Name the three methods the syllabus puts in one clause, and see that only two of them can certify a minimum.'
    },
    {
      id: 'cost', n: 2,
      title: 'The cost is the number of literals',
      start: 26, end: 50,
      objective: 'Define a literal, count literals in terms and in a whole expression, and say why the count is the cost.'
    },
    {
      id: 'rules', n: 3,
      title: 'Eight identities used as rewrites',
      start: 50, end: 78,
      objective: 'Read each identity as a licence to replace a sub-expression, and see that no rewrite can change the function.'
    },
    {
      id: 'chain', n: 4,
      title: 'One worked chain: ten literals to eight',
      start: 78, end: 110,
      objective: 'Follow the textbook example line by line: two factors, two eliminated literals, one expansion, ending at the minimum.'
    },
    {
      id: 'absorb', n: 5,
      title: 'The two rules that do most of the work',
      start: 110, end: 138,
      objective: 'Prove absorption and literal elimination by splitting on one variable, and see the case where the second rule is misapplied.'
    },
    {
      id: 'consensus', n: 6,
      title: 'The consensus theorem',
      start: 138, end: 170,
      objective: 'Build the consensus of two terms, prove it is redundant row by row, and delete it to save two literals.'
    },
    {
      id: 'undefined', n: 7,
      title: 'Where the consensus rule stops',
      start: 170, end: 194,
      objective: 'See that a consensus exists only for exactly one opposition, and what goes wrong when it is applied to two.'
    },
    {
      id: 'order', n: 8,
      title: 'The order decides the answer',
      start: 194, end: 222,
      objective: 'Run two correct routes on one expression and get 6 and 8 literals, both equal to F.'
    },
    {
      id: 'stall', n: 9,
      title: 'The stall, and the way out',
      start: 222, end: 254,
      objective: 'Meet an expression no reducing rule touches, and escape by adding a term before removing three.'
    },
    {
      id: 'count', n: 10,
      title: 'How often the algebraic route stops short',
      start: 254, end: 276,
      objective: 'Read the machine count over every three-variable function, and keep one small witness.'
    },
    {
      id: 'three', n: 11,
      title: 'One function, three methods',
      start: 276, end: 300,
      objective: 'Take one function from 18 literals to 6 by three routes, and see which routes can prove they are done.'
    },
    {
      id: 'levels', n: 12,
      title: 'Two levels against many',
      start: 300, end: 324,
      objective: 'See factoring cut literals, see depth grow, and see why a redundant term is sometimes kept on purpose.'
    },
    {
      id: 'procedure', n: 13,
      title: 'The procedure for a simplify question',
      start: 324, end: 346,
      objective: 'Leave with five ordered steps, the escape when they stall, and the one check that proves the answer.'
    }
  ],

  events: [
    /* ---------- 1. methods ---------- */
    {
      id: 'e01', scene: 'methods', start: 0, end: 8,
      caption: 'The GATE 2027 syllabus names three ways to minimise a Boolean function: the algebraic technique, the Karnaugh map, and the tabular method.',
      detail: 'Section 2 of the GATE 2027 CS syllabus, IIT Madras, reads: "Boolean algebra and minimization \u2013 algebraic technique, Karnaugh map, tabular method." One clause, three methods, and this lesson owns the first.',
      narration: 'The syllabus puts three methods in one clause. This lesson takes the first of them.',
      keyword: 'algebraic technique',
      trap: 'A clause that names three methods does not say they are interchangeable; only two of them can certify a minimum.'
    },
    {
      id: 'e02', scene: 'methods', start: 8, end: 16,
      caption: 'All three start from the same object \u2014 a function given by a truth table or a canonical expression \u2014 and all three aim at a shorter expression.',
      detail: 'The function is fixed by its truth table. An expression is only one description of it, and there are infinitely many. Minimising means choosing a description with fewest literals.',
      narration: 'All three start from the same function and aim at a shorter description of it.',
      keyword: 'same object'
    },
    {
      id: 'e03', scene: 'methods', start: 16, end: 26,
      caption: 'Only two of them tell you when to stop. The algebraic route stops when nothing looks applicable, which is not the same thing as minimal.',
      detail: 'The map stops when every 1 is circled; the table stops when the prime implicant chart is covered. The algebra has no such certificate: it stops when you run out of ideas.',
      narration: 'Only two of the three can tell you when you are finished. The algebraic route cannot.',
      keyword: 'when to stop',
      trap: '"Simplified" is not "minimal". A question that says minimal is asking for a count, not for an improvement.'
    },

    /* ---------- 2. cost ---------- */
    {
      id: 'e04', scene: 'cost', start: 26, end: 34,
      caption: 'A literal is one occurrence of a variable, negated or not. ab\u2032c\u2032 has three literals; xy + x\u2032z has four.',
      detail: 'Count occurrences, not distinct variables. xy + xy\u2032 has three literals even though it only mentions x and y, because x appears twice.',
      narration: 'A literal is one occurrence of a variable. Count the occurrences, not the variables.',
      keyword: 'literal'
    },
    {
      id: 'e05', scene: 'cost', start: 34, end: 42,
      caption: 'Cost is counted in literals because a literal is a gate input. Terms count gates; literals count the inputs those gates need.',
      detail: 'A sum of products is an OR of ANDs. Each term is one AND gate and each literal is one input to it, so the literal count tracks the number of connections in the two-level circuit.',
      narration: 'Literals are gate inputs, so the literal count is the cost we minimise.',
      keyword: 'gate input'
    },
    {
      id: 'e06', scene: 'cost', start: 42, end: 50,
      caption: 'The canonical form of n variables costs n literals per minterm, so a five-minterm three-variable function starts at fifteen literals.',
      detail: 'Canonical form has one term per minterm and each term mentions every variable. That is the starting point the algebraic method is given, and the number every later count is compared against.',
      narration: 'Canonical form is the expensive starting point: three literals per minterm for three variables.',
      keyword: 'canonical form'
    },

    /* ---------- 3. rules ---------- */
    {
      id: 'e07', scene: 'rules', start: 50, end: 58,
      caption: 'Eight identities, each an equality, each usable as a rewrite: replace the left side by the right side anywhere inside the expression.',
      detail: 'The table lists the identity, its dual, and whether it reduces the expression. The dual is not a separate fact: it follows by swapping AND with OR and 1 with 0 throughout.',
      narration: 'Each identity is a licence to replace a piece of the expression by something equal.',
      keyword: 'rewrite'
    },
    {
      id: 'e08', scene: 'rules', start: 58, end: 66,
      caption: 'Five of them reduce: combine, absorb, eliminate a literal, remove a consensus term, and De Morgan to cross between the two normal forms.',
      detail: 'The clean-up rules (identity, idempotence, complement) keep the expression tidy without shortening it. The five reducing rules are the ones that move the literal count.',
      narration: 'Five of the eight actually make the expression smaller. Those five are the method.',
      keyword: 'reduces'
    },
    {
      id: 'e09', scene: 'rules', start: 66, end: 78,
      caption: 'Because every one is an equality, no rewrite can change the function. The page tests 250 applications on three-variable pairs and finds none that moves a truth table.',
      detail: 'Soundness is the easy half and the model checks it exhaustively: every pair of cubes over three variables, every rule, every resulting expression compared against the original by truth table. Nothing differs. The hard half is knowing which rule to apply.',
      narration: 'Every rewrite is safe. The page proves it by comparing truth tables, and then the real difficulty begins.',
      keyword: 'equality',
      trap: 'Soundness is not completeness: a rule that never changes the function still cannot guarantee you reach the smallest one.'
    },

    /* ---------- 4. chain ---------- */
    {
      id: 'e10', scene: 'chain', start: 78, end: 86,
      caption: 'Start with a\u2032b + a\u2032b\u2032c\u2032d\u2032 + abcd\u2032: ten literals in three terms, none of them canonical.',
      detail: 'This is example 3-26 in Roth, Fundamentals of Logic Design, section 3.3, where it illustrates "eliminating literals" \u2014 the third of the four algebraic methods.',
      narration: 'Ten literals, three terms. This is the textbook example for eliminating a literal.',
      keyword: 'ten literals'
    },
    {
      id: 'e11', scene: 'chain', start: 86, end: 94,
      caption: 'Factor a\u2032 out of the first two terms: a\u2032(b + b\u2032c\u2032d\u2032) + abcd\u2032. Nothing has been deleted yet \u2014 the shape changed.',
      detail: 'Factoring is the one rewrite that does not delete anything. It exists to put an expression into the shape a deleting rule can use, which is why the method needs it before it can proceed.',
      narration: 'Factor first. Factoring deletes nothing; it only makes the next rule applicable.',
      keyword: 'factor'
    },
    {
      id: 'e12', scene: 'chain', start: 94, end: 102,
      caption: 'Now eliminate: b + b\u2032c\u2032d\u2032 = b + c\u2032d\u2032, because b is a single literal. Then factor again and eliminate again.',
      detail: 'The rule is X + X\u2032Y = X + Y with X the literal b. The second round uses the same rule with X the literal a\u2032: a\u2032 + acd\u2032 = a\u2032 + cd\u2032. Two deletions, nine literals down to seven.',
      narration: 'With the term factored, the elimination rule applies twice. Seven literals in the factored form.',
      keyword: 'eliminate'
    },
    {
      id: 'e13', scene: 'chain', start: 102, end: 110,
      caption: 'Multiplying out gives a\u2032b + bcd\u2032 + a\u2032c\u2032d\u2032: eight literals, and the exhaustive search confirms eight is the minimum.',
      detail: 'Note the last two lines: the factored form has 7 literals and the sum of products has 8. A factored expression is not a sum of products, so its count is not comparable with a two-level minimum. If the question asks for a minimal sum of products, you expand.',
      narration: 'Eight literals in a sum of products, and eight is the minimum. Every line was checked against the truth table.',
      keyword: 'eight literals',
      trap: 'A 7-literal factored form and an 8-literal minimal sum of products are answers to different questions. Read which form the question asks for.'
    },

    /* ---------- 5. absorb ---------- */
    {
      id: 'e14', scene: 'absorb', start: 110, end: 118,
      caption: 'Absorption: X + XY = X. If X is 1 both terms are 1; if X is 0 both terms are 0, so the second term never decides anything.',
      detail: 'The proof is a case split on X alone, which is why it works for any product terms X and Y. The rule deletes a whole term: a\u2032b\u2032 + a\u2032b\u2032c is a\u2032b\u2032, five literals to two.',
      narration: 'Absorption deletes a term, and the proof is one case split on X.',
      keyword: 'absorption'
    },
    {
      id: 'e15', scene: 'absorb', start: 118, end: 126,
      caption: 'Eliminating a literal: X + X\u2032Y = X + Y. If X is 1 both sides are 1; if X is 0 then X\u2032 is 1 and both sides are Y.',
      detail: 'This rule deletes a literal rather than a term, and it is the one that turns c + c\u2032d into c + d. It is the only rule that can shorten a term without removing it.',
      narration: 'Elimination deletes a literal. The same case split proves it.',
      keyword: 'eliminating a literal'
    },
    {
      id: 'e16', scene: 'absorb', start: 126, end: 138,
      caption: 'But X must be one literal. With a longer X you must factor first: a\u2032b\u2032 + a\u2032bc\u2032 = a\u2032(b\u2032 + bc\u2032) = a\u2032(b\u2032 + c\u2032).',
      detail: 'Deleting a literal from a multi-literal X changes the function. The model checks xy + x\u2032y\u2032z against xy + y\u2032z and finds they disagree on minterm 5, where x is 1, y is 0 and z is 1.',
      narration: 'With a longer X the same deletion is wrong, and the page finds the row where it breaks.',
      keyword: 'one literal',
      trap: 'X + X\u2032Y = X + Y is quoted without its condition in many notes. The condition is that X is a single literal.'
    },

    /* ---------- 6. consensus ---------- */
    {
      id: 'e17', scene: 'consensus', start: 138, end: 146,
      caption: 'The consensus of xy and x\u2032z is yz: keep every literal the two terms share, and drop the variable they disagree on.',
      detail: 'xy and x\u2032z disagree on x and share y and z, so the consensus is yz. The theorem says xy + x\u2032z + yz = xy + x\u2032z for every assignment.',
      narration: 'Two terms disagree on one variable. Their consensus is what is left when that variable goes.',
      keyword: 'consensus'
    },
    {
      id: 'e18', scene: 'consensus', start: 146, end: 154,
      caption: 'Row by row: the consensus term is 1 only on rows where one of the two original terms is already 1.',
      detail: 'yz is 1 exactly when y = 1 and z = 1, which is rows 011 and 111. On both rows x is either 1 or 0, so xy or x\u2032z is already 1. The consensus term never supplies a 1 that was not there.',
      narration: 'Wherever the consensus term is one, one of the two terms it came from is already one.',
      keyword: 'already 1'
    },
    {
      id: 'e19', scene: 'consensus', start: 154, end: 162,
      caption: 'That is the whole proof: yz is 1 only when y and z are both 1, and then x is either 1 or 0, so xy or x\u2032z is 1.',
      detail: 'The argument is a case split on x, exactly like absorption. It is the same shape of proof each time: the redundant term cannot be the only reason the output is 1.',
      narration: 'Split on x. If x is one, xy covers the row. If x is zero, x-prime z covers it.',
      keyword: 'case split'
    },
    {
      id: 'e20', scene: 'consensus', start: 162, end: 170,
      caption: 'So the term can go: six literals become four, and the model confirms the two expressions agree on all eight rows.',
      detail: 'Consensus removal is the fourth reducing rule, and it is the one that is easiest to miss, because the term it removes looks like it is doing work.',
      narration: 'Removing the consensus term saves two literals and changes nothing.',
      keyword: 'six to four'
    },

    /* ---------- 7. undefined ---------- */
    {
      id: 'e21', scene: 'undefined', start: 170, end: 178,
      caption: 'The consensus exists only when the two terms disagree on exactly one variable. xy and x\u2032y\u2032 disagree on two.',
      detail: 'With two oppositions there is no resolvent: the standard definition requires a single variable with opposite signs. Notes that skip the condition produce a rule that looks the same and is false.',
      narration: 'One opposition, or no consensus. Here there are two oppositions.',
      keyword: 'exactly one'
    },
    {
      id: 'e22', scene: 'undefined', start: 178, end: 186,
      caption: 'Apply the rule blindly and the empty term 1 appears: xy + x\u2032y\u2032 becomes xy + x\u2032y\u2032 + 1, which is the constant 1.',
      detail: 'Take every literal of both terms and delete the ones they disagree on. With two oppositions all four literals go and nothing is left, so the term is 1, and a constant 1 is not redundant.',
      narration: 'Delete the opposed literals and nothing remains, which reads as the constant one.',
      keyword: 'the empty term'
    },
    {
      id: 'e23', scene: 'undefined', start: 186, end: 194,
      caption: 'At x = 1, y = 0 the function is 0 and the constant is 1: minterm 5. Count the oppositions before you remove anything.',
      detail: 'The two expressions differ on four of the eight rows. The model reports the disagreement rather than the rule, which is the habit to build: test the rule on one assignment where the answer should be 0.',
      narration: 'One row is enough to show it is wrong. Count the oppositions first.',
      keyword: 'minterm 5',
      trap: 'A rule with an unstated condition is a trap. The consensus needs exactly one opposition, and the dual needs exactly one too.'
    },

    /* ---------- 8. order ---------- */
    {
      id: 'e24', scene: 'order', start: 194, end: 202,
      caption: 'Five terms, ten literals: a\u2032b\u2032 + ac + a\u2032c\u2032 + b\u2032c + ab. The minimum is six. Two routes both reach a correct answer.',
      detail: 'This is the example the lecture notes use to show that consensus removal depends on the order in which terms are eliminated. The notes give two different results from the same expression.',
      narration: 'One expression, five terms. Two orders, two answers, both correct.',
      keyword: 'ten literals'
    },
    {
      id: 'e25', scene: 'order', start: 202, end: 210,
      caption: 'Route one removes consensus terms first: a\u2032c\u2032 + ab + b\u2032c, six literals. That is the minimum.',
      detail: 'Two consensus removals in a row. Both removed terms were consensus terms of pairs that remained, so both steps were safe and the result is the six-literal minimum.',
      narration: 'Remove the consensus terms first and you land on the minimum, six literals.',
      keyword: 'six literals'
    },
    {
      id: 'e26', scene: 'order', start: 210, end: 222,
      caption: 'Route two absorbs first and then finds nothing applicable: a\u2032b\u2032 + ac + a\u2032c\u2032 + ab, eight literals, still equal to F.',
      detail: 'Every step was legal. The route simply arrived at a place where no reducing rule applies, and the expression is two literals longer than it needs to be. Nothing in the algebra tells you which route you are on.',
      narration: 'The other order stops two literals short of the minimum, with every step still legal.',
      keyword: 'eight literals',
      trap: 'Both answers are correct expressions of F. Only one is minimal, and "I could not simplify it further" does not mean minimal.'
    },

    /* ---------- 9. stall ---------- */
    {
      id: 'e27', scene: 'stall', start: 222, end: 230,
      caption: 'wx + xy + x\u2032z\u2032 + wy\u2032z\u2032: nine literals, and not one reducing rule applies. No combine, no absorb, no elimination, no consensus term.',
      detail: 'This is the harder failure than the previous scene: the expression is not merely non-minimal, it is a fixed point of all four reducing rules. The minimum is six literals, wx + x\u2032z\u2032 + xy.',
      narration: 'Nine literals and every reducing rule refuses. The minimum is six.',
      keyword: 'no rule applies'
    },
    {
      id: 'e28', scene: 'stall', start: 230, end: 238,
      caption: 'The escape is to add a term: wz\u2032 is the consensus of wx and x\u2032z\u2032, so adding it is safe. Eleven literals \u2014 worse.',
      detail: 'Adding a redundant term is the fourth of Roth\u2032s algebraic methods. It is the step that feels wrong, because the expression gets longer before it gets shorter.',
      narration: 'Add a redundant term. The expression gets longer, and that is the point.',
      keyword: 'add a term'
    },
    {
      id: 'e29', scene: 'stall', start: 238, end: 246,
      caption: 'Now wy\u2032z\u2032 is absorbed by wz\u2032: wx + xy + x\u2032z\u2032 + wz\u2032, eight literals.',
      detail: 'Absorption needs a term contained in another, and wz\u2032 is contained in wy\u2032z\u2032. The added term was never going to survive; its job was to make a deletion possible.',
      narration: 'The term you added now absorbs one that was stuck. Eight literals.',
      keyword: 'absorbed'
    },
    {
      id: 'e30', scene: 'stall', start: 246, end: 254,
      caption: 'And wz\u2032 is itself the consensus of wx and x\u2032z\u2032, so it goes too: wx + x\u2032z\u2032 + xy, six literals, the minimum.',
      detail: 'Three steps: add, absorb, remove. The model checks that the added term is redundant, that each stage is equal to F, and that the last stage has the minimum count.',
      narration: 'Then remove the term you added, and you are at six literals, which is the minimum.',
      keyword: 'six literals',
      trap: 'This route needs a decision \u2014 which consensus term to add. That decision is what the map and the table replace with a search.'
    },

    /* ---------- 10. count ---------- */
    {
      id: 'e31', scene: 'count', start: 254, end: 262,
      caption: 'Every non-constant three-variable function was tried: 255 of them, from the canonical form, applying the four reducing rules until none applies.',
      detail: 'The strategy is fixed and stated: one application at a time, in the order combine, absorb, eliminate, remove-consensus, repeated to a fixed point. No factoring and no added terms, because those are decisions rather than rules.',
      narration: 'Two hundred and fifty-five functions, one fixed strategy, run by machine.',
      keyword: '255'
    },
    {
      id: 'e32', scene: 'count', start: 262, end: 270,
      caption: '148 of the 255 end above the minimum: 58 per cent. Adding the best single consensus term fixes 108 of those, and leaves 40 still above.',
      detail: 'So the reducing rules alone stop short more often than not, and even the escape of adding one consensus term does not close the gap. What remains is a choice that has to be searched, not derived.',
      narration: 'Fifty-eight per cent stop short. One added consensus term fixes most of them, but not all.',
      keyword: '148',
      trap: 'A method that works on the examples you tried is not a method that always works. This is the count that shows the difference.'
    },
    {
      id: 'e33', scene: 'count', start: 270, end: 276,
      caption: 'One witness is kept: the function that is 1 everywhere except minterm 001. The algebraic route stops at nine literals; the answer is a + b + c\u2032, three.',
      detail: 'The small witness is the useful one, because you can check the minimum by eye: a + b + c\u2032 is 0 only when a, b and c\u2032 are all 0, which is minterm 001.',
      narration: 'The witness is small enough to check by eye: three literals against nine.',
      keyword: 'witness'
    },

    /* ---------- 11. three ---------- */
    {
      id: 'e34', scene: 'three', start: 276, end: 284,
      caption: 'One function: \u03a3(0,1,2,5,6,7) on a, b, c. Canonical form is six terms of three literals \u2014 eighteen.',
      detail: 'The same function is used for all three methods so the counts are comparable. The canonical form is what the algebra starts from and what the map is drawn from.',
      narration: 'One function, six minterms, eighteen literals in canonical form.',
      keyword: 'eighteen'
    },
    {
      id: 'e35', scene: 'three', start: 284, end: 292,
      caption: 'The algebra reaches six literals by removing consensus terms. The map and the table reach the same six, and can prove it is the smallest.',
      detail: 'The algebraic route here depends on removing the right consensus terms in the right order, which the previous scenes showed is not guaranteed. The map and the table search the prime implicants and compare covers.',
      narration: 'All three reach six literals. Only two of them can prove six is the smallest.',
      keyword: 'six literals'
    },
    {
      id: 'e36', scene: 'three', start: 292, end: 300,
      caption: 'And the minimum is not always unique: 28 of the 255 three-variable functions have more than one six-literal answer, or more than one answer at their minimum.',
      detail: 'Uniqueness is not promised by any of the three methods. A multiple-choice question that offers two minimal expressions may have two correct options, which is why some of these questions are multiple-select.',
      narration: 'A minimum need not be unique. Twenty-eight of the two hundred and fifty-five functions have more than one.',
      keyword: 'not unique',
      trap: 'In a multiple-select question, two minimal expressions can both be correct. Do not eliminate one because "there can only be one".'
    },

    /* ---------- 12. levels ---------- */
    {
      id: 'e37', scene: 'levels', start: 300, end: 308,
      caption: 'Factoring is a rewrite too: AB + AC + AD is six literals in four gates; A(B + C + D) is four literals in two.',
      detail: 'Factoring does not delete anything, it changes the shape. The literal count falls because the shared A is written once instead of three times.',
      narration: 'Factor the shared literal and the count falls from six to four.',
      keyword: 'factoring'
    },
    {
      id: 'e38', scene: 'levels', start: 308, end: 316,
      caption: 'But depth is a cost as well: AB + AC + D is five literals at depth two, while A(B + C) + D is four literals at depth three.',
      detail: 'Depth is the number of gate levels a signal passes through, so it is the delay along the longest path. Fewer literals is not automatically faster, which is why a two-level minimum is not always the circuit you build.',
      narration: 'Fewer literals can mean more delay. Both counts matter.',
      keyword: 'depth',
      trap: '"Minimal" in a GATE question means fewest literals in the named form. It does not mean fastest, and it does not mean fewest gates.'
    },
    {
      id: 'e39', scene: 'levels', start: 316, end: 324,
      caption: 'And a redundant term is sometimes kept on purpose: for xy + x\u2032z, the consensus yz holds the output at 1 while x changes, so a glitch cannot pass.',
      detail: 'If y and z are both 1 and x changes, xy and x\u2032z can both drop for a moment because of gate delays. The consensus term yz stays 1 throughout, so the output never dips. The minimum-literal answer and the glitch-free answer differ here.',
      narration: 'The term the theorem lets you delete is the term that removes a glitch. Sometimes you keep it.',
      keyword: 'on purpose'
    },

    /* ---------- 13. procedure ---------- */
    {
      id: 'e40', scene: 'procedure', start: 324, end: 332,
      caption: 'Five ordered steps: count the literals, combine, absorb, eliminate, remove a consensus term \u2014 and repeat from the top.',
      detail: 'The order matters for speed, not for correctness: combine first, because it removes the most literals per step, then the three rules that need a term to be present. Repeat until nothing applies.',
      narration: 'Five steps in order, repeated until nothing applies.',
      keyword: 'five steps'
    },
    {
      id: 'e41', scene: 'procedure', start: 332, end: 340,
      caption: 'If nothing applies and you are still long, factor, or add a consensus term and try again. That is a decision, not a rule.',
      detail: 'This is the step the counting scene showed cannot be avoided: 40 of the 255 functions need more than one added term, and which term to add is a search.',
      narration: 'When the rules stall, you have to choose a term to add. That is where the method becomes a search.',
      keyword: 'a decision'
    },
    {
      id: 'e42', scene: 'procedure', start: 340, end: 346,
      caption: 'Then check the answer on one assignment where it should be 0 and one where it should be 1. Two expressions that disagree on one row are different functions.',
      detail: 'This is the only step that proves anything. Pick the row that your rewrite was most likely to break \u2014 usually the one where the variable you eliminated changes \u2014 and evaluate both expressions there.',
      narration: 'Check one zero row and one one row. That is the step that catches every mistake.',
      keyword: 'check',
      trap: 'Checking only the rows where the function is 1 cannot catch a term that was over-deleted. Check a zero row too.'
    }
  ]
};
