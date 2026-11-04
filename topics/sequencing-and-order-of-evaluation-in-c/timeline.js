/* ==========================================================================
   sequencing-and-order-of-evaluation-in-c — THE timeline.
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
      id: 'grouping',
      n: 1,
      title: 'Precedence groups the syntax, it does not order the run',
      start: 0, end: 30,
      objective: 'Separate two questions that look like one: which operator binds which operand, and which subexpression is computed first.'
    },
    {
      id: 'evaluations',
      n: 2,
      title: 'One evaluation, two parts: a value and a side effect',
      start: 30, end: 60,
      objective: 'Split i++ and ++i into the value computation and the store, and say which of the two the standard calls the side effect.'
    },
    {
      id: 'points',
      n: 3,
      title: 'Where the barriers are',
      start: 60, end: 90,
      objective: 'Name the places the standard puts a sequence point, and state what a sequence point orders: every value and every side effect on one side before everything on the other.'
    },
    {
      id: 'unsequenced',
      n: 4,
      title: 'The rule that decides every question on this topic',
      start: 90, end: 120,
      objective: 'State the C11 rule on an unsequenced side effect on a scalar object, and apply it to i = i++ + 1.'
    },
    {
      id: 'enumerate',
      n: 5,
      title: 'Six allowable orderings, two answers',
      start: 120, end: 150,
      objective: 'Enumerate every ordering of i++ + i++ with i = 5, collect the sums, and see two distinct answers where a student writes one.'
    },
    {
      id: 'verdicts',
      n: 6,
      title: 'Three verdicts, not two',
      start: 150, end: 180,
      objective: 'Distinguish one answer with free order, several answers, and no answer at all, using f() + g(), f(i++, i) and x = i + 1.'
    },
    {
      id: 'shortcircuit',
      n: 7,
      title: 'The operators that build their own barrier',
      start: 180, end: 210,
      objective: 'Show why i < n && a[i] == x is safe: &&, ||, the comma operator and ?: each carry a sequence point, and the comma in an argument list is not the comma operator.'
    },
    {
      id: 'fourforms',
      n: 8,
      title: 'Four forms, four rewrites',
      start: 210, end: 240,
      objective: 'Give the verdict and the defined rewrite for the four shapes that appear in questions, including the one that has a single answer and is still undefined.'
    },
    {
      id: 'exam',
      n: 9,
      title: 'The five-step decision procedure',
      start: 240, end: 270,
      objective: 'Turn the rule into a procedure that works on any expression, and name the two shapes a well-posed question can legally take.'
    },
    {
      id: 'consolidate',
      n: 10,
      title: 'The chain, and the six slips',
      start: 270, end: 300,
      objective: 'Assemble the five statements that carry the topic, then the six slips that cost marks, each with its counterexample.'
    }
  ],

  events: [
    /* ---- scene 1: grouping ---- */
    {
      id: 'e1a', scene: 'grouping', start: 0, end: 7.5,
      caption: 'Precedence decides which operator takes which operand. It says nothing about which operand is computed first.',
      detail: 'The grammar of the language is a tree. It fixes f() + (g() * h()) and nothing else. The order in which the three calls run is a separate question with its own answer.',
      narration: 'Precedence groups the syntax. It does not schedule the run.',
      keyword: 'which operator takes which operand'
    },
    {
      id: 'e1b', scene: 'grouping', start: 7.5, end: 15,
      caption: 'The tree is fixed by the grammar. The schedule is not fixed by anything in the source text.',
      detail: 'Associativity is part of the tree too: a + b + c is (a + b) + c. It is not an instruction to compute a first.',
      narration: 'The tree is fixed. The schedule is free.',
      keyword: 'The schedule is not fixed',
      trap: 'Reading left-to-right associativity as left-to-right execution is the single most common error on this topic.'
    },
    {
      id: 'e1c', scene: 'grouping', start: 15, end: 22.5,
      caption: 'Three schedules, one tree, one value: g then h then f, or f then g then h, or h then g then f.',
      detail: 'Each row is a legal execution of the same source line. The sum is the same in all three because no two of the calls touch the same object.',
      narration: 'Three schedules, one tree, one value.',
      keyword: 'Three schedules'
    },
    {
      id: 'e1d', scene: 'grouping', start: 22.5, end: 30,
      caption: 'So two questions: grouping, answered by precedence and associativity; order of evaluation, answered by the standard as unspecified.',
      detail: 'The next scene takes the unit that gets ordered: not the operator, but the evaluation of an expression, which has a value part and possibly a side effect.',
      narration: 'Two questions, two answers. Grouping by precedence, order by the standard.',
      keyword: 'order of evaluation'
    },

    /* ---- scene 2: evaluations ---- */
    {
      id: 'e2a', scene: 'evaluations', start: 30, end: 37.5,
      caption: 'Evaluating i++ does two things: it computes the value 5, and it stores 6. Only the store is a side effect.',
      detail: 'The standard calls a modification of an object a side effect. Reading a value is a value computation. The two are separate events and the standard orders them separately.',
      narration: 'One expression, two parts: the value and the store.',
      keyword: 'Only the store is a side effect'
    },
    {
      id: 'e2b', scene: 'evaluations', start: 37.5, end: 45,
      caption: 'For i++ the value computation comes first and the store after: that is why it yields the old value.',
      detail: 'C11 rule: the value computation of postfix increment is sequenced before its side effect. For prefix ++ the value produced is the stored one, so the same two events give a different value.',
      narration: 'Value first, store second. That is the whole difference between i plus plus and plus plus i.',
      keyword: 'value computation comes first'
    },
    {
      id: 'e2c', scene: 'evaluations', start: 45, end: 52.5,
      caption: 'An assignment is also two events: the value computations of both sides, then the store to the left side.',
      detail: 'C11 rule: the side effect of updating the stored value of the left operand is sequenced after the value computations of the left and right operands. The store itself is not sequenced with respect to anything else.',
      narration: 'An assignment stores last, and only after both sides have been valued.',
      keyword: 'then the store to the left side'
    },
    {
      id: 'e2d', scene: 'evaluations', start: 52.5, end: 60,
      caption: 'Every question on this topic is a question about these small events and which of them may be reordered.',
      detail: 'Once i++ is two events, a question about i++ + i++ becomes a question about four events and their order. The next scene says where the order is fixed.',
      narration: 'Four events, and one question: which may be reordered.',
      keyword: 'which of them may be reordered'
    },

    /* ---- scene 3: sequence points ---- */
    {
      id: 'e3a', scene: 'points', start: 60, end: 67.5,
      caption: 'A sequence point is a barrier: everything before it is complete, including side effects, before anything after it begins.',
      detail: 'The standard states it as a relation: A is sequenced before B means every value computation and every side effect of A precedes every value computation and side effect of B.',
      narration: 'A sequence point is a barrier in time.',
      keyword: 'A sequence point is a barrier'
    },
    {
      id: 'e3b', scene: 'points', start: 67.5, end: 75,
      caption: 'The barriers that decide expression questions: the call, &&, ||, the comma operator, ?:, and the end of a full expression.',
      detail: 'Annex C also lists the end of a full declarator, the return from a library function, each conversion specifier in formatted input and output, and each call to a comparison function by qsort and bsearch.',
      narration: 'The call, and or, comma, conditional, and the end of the statement.',
      keyword: 'the call, &&, ||, the comma operator, ?:'
    },
    {
      id: 'e3c', scene: 'points', start: 75, end: 82.5,
      caption: 'A full expression ends at the semicolon, the condition of if or while, each part of a for header, or the expression in return.',
      detail: 'Between one full expression and the next there is a sequence point. That is why i++ on one line and i on the next line never interfere, whatever the compiler does inside either line.',
      narration: 'One statement, one segment. The semicolon is a barrier.',
      keyword: 'A full expression ends at the semicolon'
    },
    {
      id: 'e3d', scene: 'points', start: 82.5, end: 90,
      caption: 'Inside a segment nothing is ordered. That gap is where every undefined answer in this lesson lives.',
      detail: 'Two evaluations in the same segment are unsequenced unless one is a subexpression of the other: the value computations of the operands are sequenced before the value computation of the result, but not their side effects.',
      narration: 'Inside a segment, nothing is ordered. That is where the trouble lives.',
      keyword: 'Inside a segment nothing is ordered',
      trap: 'The value computations of operands are ordered before the result, but the side effects are not. Questions turn on exactly that difference.'
    },

    /* ---- scene 4: the rule ---- */
    {
      id: 'e4a', scene: 'unsequenced', start: 90, end: 97.5,
      caption: 'The rule: if a side effect on a scalar object is unsequenced with another side effect on it, or with a read of it, the behaviour is undefined.',
      detail: 'C11 section 6.5 paragraph 2. A scalar object is one number: an int, a pointer, a float. An array is not one scalar, which is why a[i] and a[j] are separate objects when i differs from j.',
      narration: 'Same object, two unsequenced accesses, one of them a write: undefined.',
      keyword: 'the behaviour is undefined'
    },
    {
      id: 'e4b', scene: 'unsequenced', start: 97.5, end: 105,
      caption: 'Undefined is not unknown. It is the absence of any requirement: the compiler may do anything at all.',
      detail: 'The standard says a program that has undefined behaviour imposes no requirements on the implementation. It may print the answer you expected, print something else, trap, or be optimised under the assumption that the expression cannot occur.',
      narration: 'Undefined does not mean unpredictable. It means unconstrained.',
      keyword: 'Undefined is not unknown'
    },
    {
      id: 'e4c', scene: 'unsequenced', start: 105, end: 112.5,
      caption: 'i = i++ + 1 has two stores to i and no barrier between them, so the whole statement is undefined.',
      detail: 'The assignment store is sequenced after the value computation of the right side, but the store inside i++ is not sequenced with respect to the assignment store. Two side effects on one scalar, unsequenced.',
      narration: 'Two stores to one variable, no barrier: undefined.',
      keyword: 'the whole statement is undefined'
    },
    {
      id: 'e4d', scene: 'unsequenced', start: 112.5, end: 120,
      caption: 'And the answer still comes out as 6 on every ordering. One answer does not make the statement defined.',
      detail: 'This is the counterexample that breaks the habit of computing an answer and trusting it. The page enumerates both orderings and both give 6, and the statement is undefined all the same.',
      narration: 'Both orderings give six. And the statement is still undefined.',
      keyword: 'One answer does not make the statement defined',
      trap: 'A program with undefined behaviour can produce the expected output. Correct output is not evidence of defined behaviour.'
    },

    /* ---- scene 5: enumeration ---- */
    {
      id: 'e5a', scene: 'enumerate', start: 120, end: 127.5,
      caption: 'Take i equal to 5 and the expression i++ + i++. Four events: read, store, read, store.',
      detail: 'Each postfix increment is a read of i and a store of the read value plus one, with the read sequenced before its own store. Nothing orders one increment against the other.',
      narration: 'Four events, two of them stores.',
      keyword: 'Four events'
    },
    {
      id: 'e5b', scene: 'enumerate', start: 127.5, end: 135,
      caption: 'Six orderings are legal. Two of them give 11, and the other four give 10.',
      detail: 'The sum is the two read values. If the second read happens after the first store it sees 6 and the sum is 11; otherwise both reads see 5 and the sum is 10.',
      narration: 'Six orderings. Four give ten, two give eleven.',
      keyword: 'Six orderings are legal'
    },
    {
      id: 'e5c', scene: 'enumerate', start: 135, end: 142.5,
      caption: 'So the set of answers is 10 and 11, and three pairs of events are unsequenced: each read against the other store, and the two stores against each other.',
      detail: 'A pair is unsequenced when neither is reachable from the other through the sequencing relation. The page counts the conflicting pairs by searching the partial order, not by inspection.',
      narration: 'Two answers, three unsequenced pairs. The statement is undefined.',
      keyword: 'the set of answers is 10 and 11'
    },
    {
      id: 'e5d', scene: 'enumerate', start: 142.5, end: 150,
      caption: 'A question that asks for the value of i++ + i++ has no answer to mark. The defensible answer is that the behaviour is undefined.',
      detail: 'The same enumeration applied to the other nine forms on this page gives the counts printed in the next scenes. Every one of them was computed when the page loaded.',
      narration: 'No answer to mark. The statement is undefined.',
      keyword: 'no answer to mark'
    },

    /* ---- scene 6: three verdicts ---- */
    {
      id: 'e6a', scene: 'verdicts', start: 150, end: 157.5,
      caption: 'One answer with free order: f() + g(). Two orderings, the same sum, and the program is well defined.',
      detail: 'The order of evaluation of function calls is unspecified, and unspecified is not undefined: the standard provides two possibilities and requires one of them. Any of them is correct.',
      narration: 'Free order, one answer, well defined.',
      keyword: 'One answer with free order'
    },
    {
      id: 'e6b', scene: 'verdicts', start: 157.5, end: 165,
      caption: 'Several answers: f(i++, i). Three orderings give the argument pairs 5,5 and 5,6, so the call may see either.',
      detail: 'Because the two arguments are unsequenced and one of them writes i, this is the undefined case, not merely the unspecified one. The two pairs are what the enumeration produces, not a claim about any compiler.',
      narration: 'Two possible argument pairs. Undefined, not unspecified.',
      keyword: 'Several answers'
    },
    {
      id: 'e6c', scene: 'verdicts', start: 165, end: 172.5,
      caption: 'One answer with fixed order: x = i + 1. One ordering, one value, defined.',
      detail: 'No object is written, so no side effect can be unsequenced. Nothing about the statement depends on which compiler reads it.',
      narration: 'Fixed order, one answer, defined.',
      keyword: 'One answer with fixed order'
    },
    {
      id: 'e6d', scene: 'verdicts', start: 172.5, end: 180,
      caption: 'Three verdicts: defined with one answer, defined with an order the standard leaves open, and undefined.',
      detail: 'The middle verdict is the one students forget. Unspecified order is a promise that any order is acceptable; undefined behaviour is the absence of a promise.',
      narration: 'Three verdicts, not two.',
      keyword: 'Three verdicts',
      trap: 'Calling f() + g() undefined because the order is unspecified is the second most common error on this topic.'
    },

    /* ---- scene 7: short circuit ---- */
    {
      id: 'e7a', scene: 'shortcircuit', start: 180, end: 187.5,
      caption: 'i < n && a[i] == x is safe because && puts a barrier after its first operand.',
      detail: 'There is a sequence point after the evaluation of the left operand of && and of ||. Every side effect of the left side is complete before the right side is looked at.',
      narration: 'The ampersands are a barrier. That is why the index check works.',
      keyword: 'because && puts a barrier'
    },
    {
      id: 'e7b', scene: 'shortcircuit', start: 187.5, end: 195,
      caption: 'Written the other way round, a[i] == x && i < n, the read of a[i] happens before the guard, and the guard protects nothing.',
      detail: 'The barrier only orders left before right. Swapping the operands swaps which one is protected, and the array read is then unguarded.',
      narration: 'Swap the operands and the guard protects nothing.',
      keyword: 'the guard protects nothing'
    },
    {
      id: 'e7c', scene: 'shortcircuit', start: 195, end: 202.5,
      caption: 'The comma operator and ?: also carry a barrier. The comma between arguments does not.',
      detail: 'In f(a, b) the comma separates arguments: it is punctuation, not the comma operator, and there is no sequence point between the arguments. In (a, b) the comma is an operator with a sequence point after a.',
      narration: 'Comma as operator: a barrier. Comma as separator: no barrier.',
      keyword: 'The comma between arguments does not'
    },
    {
      id: 'e7d', scene: 'shortcircuit', start: 202.5, end: 210,
      caption: 'So a barrier can be bought with a comma operator, and that is the usual repair: x = (i++, i) has one ordering and one answer.',
      detail: 'The parentheses are part of the repair: they stop the comma from being read as an argument separator. Without them the expression is a different one.',
      narration: 'Buy a barrier with a comma, and the expression becomes defined.',
      keyword: 'a barrier can be bought with a comma operator'
    },

    /* ---- scene 8: four forms ---- */
    {
      id: 'e8a', scene: 'fourforms', start: 210, end: 217.5,
      caption: 'Four shapes, four verdicts. i++ + i++: undefined, two answers, and no rewrite is needed because nobody wants it.',
      detail: 'If the intent was to add the old value twice, write two variables: a = i; b = i; i += 2. If the intent was to double and increment, say so in three statements.',
      narration: 'Shape one: undefined, two answers.',
      keyword: 'undefined, two answers'
    },
    {
      id: 'e8b', scene: 'fourforms', start: 217.5, end: 225,
      caption: 'a[i] = i++: undefined, because the store to i is unsequenced with the read of i used as the index.',
      detail: 'The enumeration gives index 5 or 6. The repair is to separate the two: a[i] = i + 1; i++; or i++; a[i - 1] = i;',
      narration: 'Shape two: the index and the increment fight.',
      keyword: 'undefined, because the store to i is unsequenced'
    },
    {
      id: 'e8c', scene: 'fourforms', start: 225, end: 232.5,
      caption: 'f(i++, i): undefined, because the two arguments are unsequenced and one writes what the other reads.',
      detail: 'There is a sequence point after all the arguments and before the call, but not between the arguments. Moving the increment out of the call is the repair.',
      narration: 'Shape three: two arguments, one variable.',
      keyword: 'the two arguments are unsequenced'
    },
    {
      id: 'e8d', scene: 'fourforms', start: 232.5, end: 240,
      caption: 'i = i++ + 1: undefined with a single answer of 6. That is the one that teaches the rule, because the answer looks right.',
      detail: 'Both orderings of the two stores leave 6. The statement is still undefined, so no compiler is obliged to produce 6, and an optimiser may remove the statement entirely.',
      narration: 'Shape four: one answer, still undefined.',
      keyword: 'undefined with a single answer',
      trap: 'The exam-shaped trap: the answer 6 is not a proof that the expression is well defined.'
    },

    /* ---- scene 9: procedure ---- */
    {
      id: 'e9a', scene: 'exam', start: 240, end: 247.5,
      caption: 'Step one: find the full expression. Step two: mark the barriers inside it.',
      detail: 'A full expression is the one that is not part of another. Everything between two barriers is one segment, and only inside a segment can anything be reordered.',
      narration: 'Find the statement, then mark the barriers.',
      keyword: 'find the full expression'
    },
    {
      id: 'e9b', scene: 'exam', start: 247.5, end: 255,
      caption: 'Step three: list every access to each variable in the segment, and mark which are writes.',
      detail: 'A write is a store from assignment, compound assignment, prefix or postfix increment or decrement, or a library call that writes through a pointer such as scanf.',
      narration: 'List the accesses, mark the writes.',
      keyword: 'mark which are writes'
    },
    {
      id: 'e9c', scene: 'exam', start: 255, end: 262.5,
      caption: 'Step four: if two of them are unsequenced and at least one is a write, stop. The answer is undefined.',
      detail: 'Unsequenced means neither is sequenced before the other. Two reads never conflict. A write and a read conflict, and two writes conflict, on the same scalar object.',
      narration: 'Two unsequenced accesses, one a write: stop, undefined.',
      keyword: 'The answer is undefined'
    },
    {
      id: 'e9d', scene: 'exam', start: 262.5, end: 270,
      caption: 'Step five, only if no conflict: the answer is fixed, and the only freedom left is the order of calls that touch nothing shared.',
      detail: 'A well-posed question therefore either avoids the conflict or asks for the verdict itself. A question that prints one number for an undefined statement is a question with a broken premise.',
      narration: 'No conflict: the answer is fixed. Otherwise the answer is the verdict.',
      keyword: 'the only freedom left is the order of calls'
    },

    /* ---- scene 10: consolidation ---- */
    {
      id: 'e10a', scene: 'consolidate', start: 270, end: 277.5,
      caption: 'The chain: an expression is events; barriers order the events; a gap lets them reorder; two unsequenced accesses with a write are undefined.',
      detail: 'Every question on the topic is answered by walking that chain in order, and the chain is what the five scenes of the animation established.',
      narration: 'Events, barriers, gaps, and the rule.',
      keyword: 'an expression is events'
    },
    {
      id: 'e10b', scene: 'consolidate', start: 277.5, end: 285,
      caption: 'Six slips: reading associativity as execution, calling unspecified undefined, forgetting the argument comma is not an operator, trusting one printed answer, and two more.',
      detail: 'The two more: assuming a function call orders its arguments, and assuming that an array is one scalar object when a[i] and a[j] are separate objects for different i and j.',
      narration: 'Six slips, each with a counterexample on this page.',
      keyword: 'Six slips'
    },
    {
      id: 'e10c', scene: 'consolidate', start: 285, end: 292.5,
      caption: 'The one-line test: name the barriers, then ask whether anything in the gap writes what anything else in the gap reads.',
      detail: 'If nothing in the gap writes what anything else in the gap reads, the expression is defined and the answer is computable. If something does, the answer is the verdict, not a number.',
      narration: 'Name the barriers, then ask what writes and what reads inside the gap.',
      keyword: 'name the barriers'
    },
    {
      id: 'e10d', scene: 'consolidate', start: 292.5, end: 300,
      caption: 'The revision sheet keeps the three verdicts and the four rewrites; the practice set keeps the arithmetic of the enumeration.',
      detail: 'Ten forms were enumerated on this page, twenty-nine orderings in all, eleven conflicting pairs, and three of the ten defined. Those counts are recomputed at load and printed under the canvas.',
      narration: 'Three verdicts, four rewrites, and the counts recomputed at load.',
      keyword: 'three verdicts and the four rewrites',
      trap: 'The last trap is the quietest: a program with undefined behaviour that prints the expected answer teaches the wrong lesson.'
    }
  ]
};
