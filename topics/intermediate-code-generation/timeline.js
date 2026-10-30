/* ==========================================================================
   intermediate-code-generation — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   captions.vtt, captions.srt and transcript.md are generated from this file by
   tools/gen-captions.mjs — never edited by hand.

   Every number quoted in a caption is computed by the model in lesson.js and
   printed on the canvas: the 4-language, 3-machine arithmetic that gives 12
   generators without an intermediate form and 8 components with one; the three
   instructions t1 = a + b, t2 = c + d, t1 = t1 * t2 that (a+b)*(c+d) becomes;
   the operator counts 3, 5, 7, 8 and 2 with their fresh-temporary counts and
   their exhaustively searched minimum live counts 2, 2, 3, 2 and 1; the eight
   SSA temporaries of q + r/3 + s - t*5 + u*v/w; the two instructions of an
   indexed load at a scale of 4; the five instructions, three labels and three
   jumps of the while loop, checked over 25 input pairs; the 7-against-14
   instruction counts of the two short-circuit translations and the 12 of 16
   cases where the control version skips the second comparison; and the 5 inputs
   plus 5 definitions that make 10 SSA variables.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'why', n: 1,
      title: 'Why an intermediate form exists',
      start: 0, end: 30,
      objective: 'See what an intermediate representation buys — machine independence, a shared optimiser and retargeting — and get the arithmetic that makes the case countable.'
    },
    {
      id: 'forms', n: 2,
      title: 'The instruction forms',
      start: 30, end: 60,
      objective: 'Learn the six three-address forms and the rule that gives the form its name: one operator, at most three addresses, no machine named.'
    },
    {
      id: 'tree2tac', n: 3,
      title: 'From a tree to instructions',
      start: 60, end: 90,
      objective: 'Watch a postorder walk turn (a+b)*(c+d) into three instructions with three temporaries, and see why the counts cannot disagree for a straight-line expression.'
    },
    {
      id: 'temps', n: 4,
      title: 'How many temporaries at once',
      start: 90, end: 120,
      objective: 'Separate the three counts a question can mean — operators, fresh temporaries, live temporaries, registers — and see the page find the minimum by exhaustive search.'
    },
    {
      id: 'ssa', n: 5,
      title: 'Static single assignment',
      start: 120, end: 150,
      objective: 'Convert one expression into SSA form and see why the count becomes the operator count: eight for the expression GATE 2015 Set 1 keyed as 8.'
    },
    {
      id: 'arrays', n: 6,
      title: 'Indexing, pointers and calls',
      start: 150, end: 180,
      objective: 'Translate the forms that touch memory: an indexed load with its scale, a store through a pointer, and the param-call-return sequence.'
    },
    {
      id: 'control', n: 7,
      title: 'Control flow as labels and jumps',
      start: 180, end: 210,
      objective: 'Translate a while loop, count its instructions, labels and jumps, check every target exists, and execute the result against the loop it came from.'
    },
    {
      id: 'short', n: 8,
      title: 'Short circuit in two contexts',
      start: 210, end: 240,
      objective: 'Translate one boolean condition in control context and in value context, and measure the difference: 7 against 14 instructions, and 4 against 16 evaluations of the second test.'
    },
    {
      id: 'tables', n: 9,
      title: 'Quadruples, triples, indirect triples',
      start: 240, end: 270,
      objective: 'Store one instruction list three ways and see what each table costs and what each one makes easy.'
    },
    {
      id: 'exam', n: 10,
      title: 'The procedure',
      start: 270, end: 300,
      objective: 'Turn the whole topic into five steps, place the two verified previous-year numbers, and name the two checks that remove wrong options.'
    }
  ],

  events: [
    /* ---- scene 1 ---- */
    {
      id: 's1a', start: 0, end: 7.5, scene: 'why',
      caption: 'Intermediate code is the machine-independent form between the front end and the back end.',
      detail: 'The front end analyses the source program and writes a form that names no register, no instruction set and no word size. The back end turns that form into one particular machine\u2019s code. The form in the middle is the subject of this lesson.',
      narration: 'The front end writes a form that names no machine. The back end turns it into one machine\u2019s code.',
      keyword: 'machine-independent'
    },
    {
      id: 's1b', start: 7.5, end: 15, scene: 'why',
      caption: 'M languages and N machines: one form turns M x N generators into M front ends plus N back ends.',
      detail: 'Four languages and three machines need twelve code generators if each pair is written separately. With one shared intermediate form the same coverage costs four front ends, three back ends and a single optimiser: eight components. The saving grows with both numbers.',
      narration: 'Twelve generators without the form. Four plus three plus one with it.',
      keyword: 'M x N',
      trap: 'The saving is in the optimiser and the code generators, not in the parsers.'
    },
    {
      id: 's1c', start: 15, end: 22.5, scene: 'why',
      caption: 'The optimiser is written once on that form and reused by every compiler built on it.',
      detail: 'Constant propagation, liveness and common-subexpression elimination all read the intermediate form. Because the form is machine-independent, one implementation serves every source language and every target, which is the practical reason the form exists.',
      narration: 'One optimiser, written once, reused by every compiler built on the form.',
      keyword: 'reused'
    },
    {
      id: 's1d', start: 22.5, end: 30, scene: 'why',
      caption: 'GATE 2014 Set 3 asked this purpose and keyed the optimiser-reuse answer.',
      detail: 'The question offers four purposes and only "increase the chances of reusing the machine-independent code optimizer in other compilers" is keyed correct. Parsing is not simplified by the form, error recovery happens earlier, and register allocation is machine-dependent, so it cannot be the purpose.',
      narration: 'Reuse of the machine-independent optimiser is the keyed purpose.',
      keyword: 'optimiser-reuse',
      trap: 'Register allocation is machine-dependent, so "improve register allocation" is not the answer.'
    },

    /* ---- scene 2 ---- */
    {
      id: 's2a', start: 30, end: 37.5, scene: 'forms',
      caption: 'Three-address code: at most one operator per instruction, and at most three addresses.',
      detail: 'An instruction names at most two operands and one result. That is where the name comes from, and it is a rule about shape, not about the number of characters in the line.',
      narration: 'One operator, at most two operands, one result.',
      keyword: 'one operator'
    },
    {
      id: 's2b', start: 37.5, end: 45, scene: 'forms',
      caption: 'x = y + z * w is two instructions, not one: the order of evaluation must be explicit.',
      detail: 'The source leaves the order to precedence. The intermediate form fixes it: t1 = z * w, then x = y + t1. Every later pass can then read one operation at a time, which is exactly what value numbering and register allocation need.',
      narration: 'Precedence is resolved before the form is written, so each instruction holds one operation.',
      keyword: 'two instructions'
    },
    {
      id: 's2c', start: 45, end: 52.5, scene: 'forms',
      caption: 'Six forms cover this lesson: binary, unary, copy, indexed load, and the two jumps.',
      detail: 'Binary x = y op z, unary x = op y, copy x = y, indexed load x = y[i], conditional jump if x relop y goto L, unconditional jump goto L. A call is a param sequence followed by call, and a return closes the frame; both are built from these forms.',
      narration: 'Binary, unary, copy, indexed load, and the two jumps.',
      keyword: 'six forms'
    },
    {
      id: 's2d', start: 52.5, end: 60, scene: 'forms',
      caption: 'Nothing here names a register or an instruction set, which is what machine-independent means.',
      detail: 'The temporaries are names in a table, not physical registers. Which register holds which temporary is decided much later, in the back end, and that decision is the machine-dependent part.',
      narration: 'Temporaries are names, not registers. The registers come later.',
      keyword: 'machine-independent',
      trap: 'A label is a position, not an operand. It is not one of the three addresses.'
    },

    /* ---- scene 3 ---- */
    {
      id: 's3a', start: 60, end: 67.5, scene: 'tree2tac',
      caption: 'Postorder walks the tree: left subtree, right subtree, then the operator.',
      detail: 'The order is forced. An operator can only be computed after both of its operands exist, so any legal translation must compute the children first. Postorder is one such order, and it is the one a syntax-directed translation produces naturally.',
      narration: 'Children before parent, left before right.',
      keyword: 'postorder'
    },
    {
      id: 's3b', start: 67.5, end: 75, scene: 'tree2tac',
      caption: 'Each operator emits exactly one instruction and one new temporary.',
      detail: 'The temporary holds the operator\u2019s result. Giving every definition its own name is what makes the code easy to analyse, and it is exactly the SSA convention introduced later in the lesson.',
      narration: 'One operator, one instruction, one fresh temporary.',
      keyword: 'one instruction'
    },
    {
      id: 's3c', start: 75, end: 82.5, scene: 'tree2tac',
      caption: 'Leaves are source variables, so they cost no temporary at all.',
      detail: 'a, b, c and d are already stored somewhere by the time this code runs. The intermediate form reads them; it does not copy them into temporaries. That is why the temporary count follows the operators and not the leaves.',
      narration: 'Variables cost nothing; operators cost a temporary each.',
      keyword: 'no temporary'
    },
    {
      id: 's3d', start: 82.5, end: 90, scene: 'tree2tac',
      caption: 'Three operators give three instructions: t1 = a+b, t2 = c+d, t3 = t1*t2.',
      detail: 'The last instruction writes t3, so the expression\u2019s value is in t3. For a tree with n operators this is always n instructions and n fresh temporaries, and the page checks the claim on five different trees.',
      narration: 'Three operators, three instructions, three temporaries.',
      keyword: 'three instructions'
    },

    /* ---- scene 4 ---- */
    {
      id: 's4a', start: 90, end: 97.5, scene: 'temps',
      caption: 'The number of temporaries used and the number that must exist at once are different questions.',
      detail: 'A program can use eight temporaries and never need more than two at one moment. The first number counts definitions; the second counts the peak of what is live. A question that says "least number" is asking the second.',
      narration: 'How many are used, and how many are live at once, are two questions.',
      keyword: 'at once'
    },
    {
      id: 's4b', start: 97.5, end: 105, scene: 'temps',
      caption: '(a+b)*(c+d) uses three names but never needs more than two live at once.',
      detail: 't1 = a + b, then t2 = c + d, then t1 = t1 * t2. The third instruction overwrites t1 because t1 dies at that instruction, so two slots carry the whole expression. Nothing is lost: the overwritten value is never read again.',
      narration: 'Two slots are enough, because the result may overwrite an operand that dies.',
      keyword: 'two live'
    },
    {
      id: 's4c', start: 105, end: 112.5, scene: 'temps',
      caption: 'The page finds the minimum by trying every legal evaluation order, not by a formula.',
      detail: 'For each tree it enumerates every order that respects the children-before-parent rule, simulates which temporaries are live at each step, and keeps the smallest peak. Two orders exist for a three-operator tree, and 84 for the eight-operator one.',
      narration: 'Every legal order, simulated, and the smallest peak kept.',
      keyword: 'every legal order'
    },
    {
      id: 's4d', start: 112.5, end: 120, scene: 'temps',
      caption: 'The register number counts leaves too, so a*b+c*d+e*f is 2 temporaries and 3 registers.',
      detail: 'Sethi-Ullman counts registers, and a leaf value occupies one. Two children with equal numbers k need k + 1, because the first result is held while the second subtree is built. That gives 3 here, while the temporary-only peak is 2.',
      narration: 'Two temporaries, three registers. The wording decides which number is wanted.',
      keyword: 'registers',
      trap: 'Read whether the question says temporaries or registers before you add one for the leaves.'
    },

    /* ---- scene 5 ---- */
    {
      id: 's5a', start: 120, end: 127.5, scene: 'ssa',
      caption: 'In static single assignment form every definition gets a name of its own.',
      detail: 'No name is assigned twice. A variable that is reassigned in the source becomes a new version, t1 then t2 then t3. The rule is what lets a later analysis talk about "the value of x here" without ambiguity.',
      narration: 'One definition per name, always.',
      keyword: 'its own'
    },
    {
      id: 's5b', start: 127.5, end: 135, scene: 'ssa',
      caption: 'So the count is the number of operators: eight for this expression.',
      detail: 'Each operator produces a value, and each value needs a name that is used once. The expression has eight operators, so SSA form needs eight temporaries. There is no way to need fewer, and no reason to use more.',
      narration: 'Eight operators, eight names.',
      keyword: 'eight'
    },
    {
      id: 's5c', start: 135, end: 142.5, scene: 'ssa',
      caption: 'GATE 2015 Set 1 keyed 8 for exactly this expression.',
      detail: 'The question asks for the least number of temporary variables needed to create three-address code in static single assignment form for q + r/3 + s - t*5 + u*v/w. The official answer is 8, which is the operator count, and the page recomputes it from the tree.',
      narration: 'The official answer is eight, and it is the operator count.',
      keyword: 'GATE 2015 Set 1',
      trap: '2 is the answer to the reuse question. It is wrong here because the question says SSA.'
    },
    {
      id: 's5d', start: 142.5, end: 150, scene: 'ssa',
      caption: 'The page generates both forms and checks that each computes the same values.',
      detail: 'The SSA version and the two-slot version are both executed over a grid of inputs and compared with the expression tree evaluated directly. Same answers everywhere, different numbers of names. That is the whole distinction in one check.',
      narration: 'Both forms, executed, compared with the tree.',
      keyword: 'same values'
    },

    /* ---- scene 6 ---- */
    {
      id: 's6a', start: 150, end: 157.5, scene: 'arrays',
      caption: 'An indexed load hides an address calculation.',
      detail: 'The source says a[i]. The machine needs a byte address, and the byte address is the base plus the index times the element size. The intermediate form makes that multiplication an instruction of its own, where every later pass can see it.',
      narration: 'An index is not an address. The multiplication is an instruction.',
      keyword: 'address calculation'
    },
    {
      id: 's6b', start: 157.5, end: 165, scene: 'arrays',
      caption: 'x = a[i] is two instructions: t1 = i*4, then t2 = a[t1].',
      detail: 'With four-byte integers the scale is 4. A one-word element hides the multiplication in the addressing mode of a real machine, but in the intermediate form it is written out, and a question that counts instructions counts it.',
      narration: 'Scale by four, then load. Two instructions.',
      keyword: 'two instructions'
    },
    {
      id: 's6c', start: 165, end: 172.5, scene: 'arrays',
      caption: 'The scale is the element size, so an array of 24-byte records gives i*24.',
      detail: 'The number in the multiplication is the size of one element in bytes, not the number of elements and not the index. Getting this wrong is the commonest arithmetic error in this translation.',
      narration: 'The multiplier is the size of one element.',
      keyword: 'element size',
      trap: 'The scale is the element size, not the array length.'
    },
    {
      id: 's6d', start: 172.5, end: 180, scene: 'arrays',
      caption: 'A call emits one param per argument, then the call, then a copy of the result.',
      detail: 'The call instruction carries the number of arguments, because the callee pops its own frame using that count. The returned value lands in a temporary, and the assignment that follows copies it where the source wanted it.',
      narration: 'One param per argument, the call with its count, then the copy.',
      keyword: 'param'
    },

    /* ---- scene 7 ---- */
    {
      id: 's7a', start: 180, end: 187.5, scene: 'control',
      caption: 'A loop becomes labels and jumps, with the test at the top.',
      detail: 'L1 marks the test, L2 the body, L3 the exit. The test jumps into the body when it holds and out of the loop when it does not, and the body ends with a jump back to the test. That is the whole shape of a while loop in three-address code.',
      narration: 'Test, body, exit. Three labels and a jump back.',
      keyword: 'labels and jumps'
    },
    {
      id: 's7b', start: 187.5, end: 195, scene: 'control',
      caption: 'The while loop is five instructions, three labels and three jumps.',
      detail: 'Five real instructions: the conditional jump, the exit jump, the addition, the copy back, and the loop-back jump. Labels compute nothing but they occupy rows, so a row count and an instruction count differ by three here.',
      narration: 'Five instructions, three labels, three jumps.',
      keyword: 'five instructions'
    },
    {
      id: 's7c', start: 195, end: 202.5, scene: 'control',
      caption: 'Every jump target must be a label that exists, and the page checks all of them.',
      detail: 'A target that names no label is a broken program, and it is the kind of error a hand-written answer makes. The check is mechanical: collect the labels, collect the jumps, and require every target to be in the first set.',
      narration: 'Collect the labels, collect the jumps, require every target to be found.',
      keyword: 'target',
      trap: 'A label is a position, not an operand. Do not count it among the three addresses.'
    },
    {
      id: 's7d', start: 202.5, end: 210, scene: 'control',
      caption: 'The page executes the code for 25 input pairs and matches max(x, n) every time.',
      detail: 'Translation is only correct if it computes the same function. The page runs the generated code in a small three-address interpreter for x and n from 0 to 4 and compares the final value of x with the loop\u2019s own meaning, max(x, n). All 25 pairs agree.',
      narration: 'Twenty-five input pairs, all agreeing with the loop.',
      keyword: '25 input pairs'
    },

    /* ---- scene 8 ---- */
    {
      id: 's8a', start: 210, end: 217.5, scene: 'short',
      caption: 'a < b && c < d means: do not evaluate c < d unless a < b is true.',
      detail: 'That is what short circuit promises. It is a statement about which evaluations happen, so it can be observed whenever the second test has a side effect or can fail. It is not a promise about speed.',
      narration: 'The second test is skipped when the first is false.',
      keyword: 'unless'
    },
    {
      id: 's8b', start: 217.5, end: 225, scene: 'short',
      caption: 'In control context that is 7 instructions, and the second test runs in 4 cases out of 16.',
      detail: 'Two conditional jumps with their exits, two constants and a final jump: seven instructions and four labels. Executing the code on every combination of four booleans shows the c < d comparison happening exactly when a < b holds, which is four of the sixteen cases.',
      narration: 'Seven instructions, and the second comparison runs four times in sixteen.',
      keyword: '7 instructions'
    },
    {
      id: 's8c', start: 225, end: 232.5, scene: 'short',
      caption: 'In value context the truth values are built first: 14 instructions, and both tests always run.',
      detail: 'A truth value has to exist before && can be applied, so each comparison becomes its own if-goto diamond with a temporary: four instructions each, then the conjunction, then the final test. Fourteen instructions, seven labels, and the second comparison runs in all sixteen cases.',
      narration: 'Fourteen instructions, and both comparisons always run.',
      keyword: '14 instructions'
    },
    {
      id: 's8d', start: 232.5, end: 240, scene: 'short',
      caption: 'If c < d could divide by zero, only the control translation is safe.',
      detail: 'The value translation evaluates both sides, so a second test that would fail on a particular input fails even when the first test already decided the answer. Short circuit is a semantic guarantee, and a value-context translation breaks it.',
      narration: 'Only the control translation keeps the promise.',
      keyword: 'safe',
      trap: 'Short circuit is a promise about evaluation, not an optimisation you may drop.'
    },

    /* ---- scene 9 ---- */
    {
      id: 's9a', start: 240, end: 247.5, scene: 'tables',
      caption: 'The same three instructions can be stored three ways.',
      detail: 'The instruction list is the meaning; the table is the storage. Quadruples, triples and indirect triples all represent this one list, and all three are built from it here, so they must compute the same function.',
      narration: 'One list, three tables, one meaning.',
      keyword: 'three ways'
    },
    {
      id: 's9b', start: 247.5, end: 255, scene: 'tables',
      caption: 'Quadruples name the result; triples use the row number as the result.',
      detail: 'A quadruple has four fields: operator, first operand, second operand, result. A triple drops the result field, so a temporary is identified by the row that defined it: the operand (1) means "the value computed by row 1".',
      narration: 'Four fields against three, with the row number standing in for the name.',
      keyword: 'row number'
    },
    {
      id: 's9c', start: 255, end: 262.5, scene: 'tables',
      caption: 'Indirect triples add a table of pointers so a pass can move or delete a row.',
      detail: 'The rows stay in place and a separate statement table says which row comes first. Reordering the statement table reorders the program without touching a single operand reference, which is what an optimising pass needs.',
      narration: 'The rows stay put and the pointer table moves.',
      keyword: 'pointer table'
    },
    {
      id: 's9d', start: 262.5, end: 270, scene: 'tables',
      caption: 'Inserting a row breaks every triple reference after it; that is what the pointer table fixes.',
      detail: 'In a plain triple table the identity of a temporary is a position, so inserting or deleting a row shifts every later position and silently changes what (7) refers to. Indirect triples keep positions stable by moving pointers instead.',
      narration: 'Insert a row and every later reference moves. The pointer table prevents that.',
      keyword: 'breaks',
      trap: 'In a triple, (1) means row 1, not the value 1.'
    },

    /* ---- scene 10 ---- */
    {
      id: 's10a', start: 270, end: 277.5, scene: 'exam',
      caption: 'Read the wording first: SSA, plain three-address code, or registers.',
      detail: 'Three different counts hide behind one expression. Static single assignment asks for one name per definition. Plain three-address code with reuse asks for the peak live count. A question about registers adds one because a leaf occupies a register too.',
      narration: 'SSA, plain code, or registers. The wording picks the count.',
      keyword: 'wording'
    },
    {
      id: 's10b', start: 277.5, end: 285, scene: 'exam',
      caption: 'Then count operators for instructions, and definitions for SSA names.',
      detail: 'A straight-line expression with n operators becomes n instructions and n fresh names. Add one instruction for the final assignment to the target variable. With control flow, add the labels and jumps, and report which count the question asked for.',
      narration: 'Operators for instructions, definitions for names.',
      keyword: 'count operators'
    },
    {
      id: 's10c', start: 285, end: 292.5, scene: 'exam',
      caption: 'GATE 2016 Set 1 asked for total SSA variables: 5 inputs plus 5 definitions, so 10.',
      detail: 'The segment has five statements and uses u, t, v, w and z without defining them. Five input variables plus five fresh definitions gives ten variables in total. The page renames the segment, checks each name is defined once, and executes the renamed version to confirm it computes the same function.',
      narration: 'Five inputs, five definitions, ten variables.',
      keyword: '10',
      trap: 'The question asks for total variables, not temporaries: the five inputs count too.'
    },
    {
      id: 's10d', start: 292.5, end: 300, scene: 'exam',
      caption: 'Two checks remove most wrong options before any arithmetic.',
      detail: 'Does the question say static single assignment form? Then the answer is the definition count and never the peak live count. Does the code contain control flow? Then labels are rows, and any count that ignores them is short by exactly the number of labels.',
      narration: 'SSA or not, and whether labels count. Two questions before the counting.',
      keyword: 'two checks',
      trap: 'A count that ignores label rows is short by the number of labels.'
    }
  ]
};
