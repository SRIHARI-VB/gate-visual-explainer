/* ==========================================================================
   function-pointers — THE timeline.
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
      id: 'address',
      n: 1,
      title: 'A function is code at an address',
      start: 0, end: 30,
      objective: 'See a function pointer as an ordinary variable whose value is a code address, and see why it is not an int pointer.'
    },
    {
      id: 'reading',
      n: 2,
      title: 'Reading int (*f)(int *) — GATE CSE 2005',
      start: 30, end: 60,
      objective: 'Read one declaration in four steps and pick the correct English sentence from four offered ones.'
    },
    {
      id: 'spellings',
      n: 3,
      title: 'Four spellings, four different types',
      start: 60, end: 90,
      objective: 'Hold four declarations apart that share a base type and an identifier, and differ only in punctuation.'
    },
    {
      id: 'grammar',
      n: 4,
      title: 'Why the parentheses decide everything',
      start: 90, end: 120,
      objective: 'Derive the two readings from the declarator grammar instead of memorising them.'
    },
    {
      id: 'signal',
      n: 5,
      title: 'The signal declaration, peeled inside out',
      start: 120, end: 150,
      objective: 'Read the standard library\'s hardest declaration in four steps, and collapse it with one typedef.'
    },
    {
      id: 'calling',
      n: 6,
      title: 'Calling through the pointer',
      start: 150, end: 180,
      objective: 'See that f, &f and *f name the same address, that p(3) and (*p)(3) are the same call, and that *p(3) is not.'
    },
    {
      id: 'qsort',
      n: 7,
      title: 'qsort: the contract the callback must keep',
      start: 180, end: 210,
      objective: 'State the comparator contract and count the comparisons a real sort makes under it.'
    },
    {
      id: 'broken',
      n: 8,
      title: 'Two comparators that compile and lie',
      start: 210, end: 240,
      objective: 'Predict the wrong output of the subtraction comparator and the boolean comparator, and repair both.'
    },
    {
      id: 'table',
      n: 9,
      title: 'An array of function pointers is a jump table',
      start: 240, end: 270,
      objective: 'Replace a switch with an indexed table, check the two agree, and price the difference.'
    },
    {
      id: 'rules',
      n: 10,
      title: 'Where the standard says undefined',
      start: 270, end: 300,
      objective: 'Name the five clauses that make the sharp edges of this topic, so no exam answer is guessed.'
    }
  ],

  events: [

    /* ---------------- scene 1: an address ---------------- */
    {
      id: 'ad-1', start: 0, end: 7.5, scene: 'address',
      visualAction: 'code-segment',
      caption: 'Three functions, three addresses in the code segment. The instructions live here, not in the data segment.',
      narration: 'Start with what a function is in memory: a run of instructions at a fixed address. Here are three of them, add at 0x401136, mul at 0x401150 and neg at 0x40116A.',
      keyword: 'fixed address',
      detail: 'In an LP64 model a pointer is eight bytes. The code addresses shown are the stated model, not a measurement of any particular binary.'
    },
    {
      id: 'ad-2', start: 7.5, end: 15, scene: 'address',
      visualAction: 'pointer-cell',
      caption: 'A function pointer is an ordinary variable. Its value is one of those addresses, and it lives in the data segment.',
      narration: 'Now a variable p of type pointer to function taking an int and returning an int. Its cell holds 0x401136. The cell is data; the thing it points at is code.',
      keyword: 'ordinary variable',
      detail: 'p is an object of pointer type, so it has a size, an address and a storage duration. The function it points at has none of those as an object.'
    },
    {
      id: 'ad-3', start: 15, end: 22.5, scene: 'address',
      caption: 'Three ways to write the assignment, and all three store the same address: = add, = &add, = *add.',
      narration: 'You may write p equals add, or p equals ampersand add, or even p equals star add. All three store 0x401136, and the reason is the designator rule.',
      keyword: 'all three store the same address',
      detail: 'C11 6.3.2.1p4: a function designator is converted to a pointer to function except when it is the operand of sizeof or the unary &. And 6.5.3.2p4 turns *p back into the designator, which then converts again.'
    },
    {
      id: 'ad-4', start: 22.5, end: 30, scene: 'address',
      visualAction: 'sizeof',
      caption: 'sizeof p is eight bytes. sizeof add is not allowed at all: a function type has no size to report.',
      narration: 'The pointer has a size, eight bytes here. The function does not: applying sizeof to a function type is a constraint violation, so a compiler must complain.',
      keyword: 'not allowed at all',
      detail: 'C11 6.5.3.4 forbids sizeof on a function type. GCC accepts sizeof of a function as an extension and returns 1, which is exactly why the rule is worth knowing.',
      trap: 'sizeof(&f) is the pointer size, sizeof(f) is a constraint violation, and sizeof(*f) is also a violation because *f is again the designator. Only the pointer has a size.'
    },

    /* ---------------- scene 2: reading ---------------- */
    {
      id: 'rd-1', start: 30, end: 37.5, scene: 'reading',
      visualAction: 'tokens',
      caption: 'GATE CSE 2005 asked what int (*f)(int *) declares, and offered four English sentences.',
      narration: 'A one-mark question from GATE CSE 2005: what does this statement declare? Four sentences, one of them true. Nine tokens, and the parentheses carry the whole answer.',
      keyword: 'four English sentences',
      detail: 'GATE CSE 2005, question 1 in one catalogue and question 23 in another; the paper and set are what matter, not the index. One mark, negative marking of one third.'
    },
    {
      id: 'rd-2', start: 37.5, end: 45, scene: 'reading',
      visualAction: 'identifier',
      caption: 'Step one: find the identifier. It is f, and everything else describes f.',
      narration: 'Always begin at the identifier. Here it is f. Every other token in the declaration is a statement about f, and the reading must start there.',
      keyword: 'find the identifier',
      detail: 'The declarator is the part that carries the identifier; the type specifier int on the left is the base type that everything else wraps.'
    },
    {
      id: 'rd-3', start: 45, end: 52.5, scene: 'reading',
      visualAction: 'paren-star',
      caption: 'Step two: the star inside the parentheses makes f a pointer. Step three: (int *) says it points at a function taking int *.',
      narration: 'Inside the parentheses, the star binds first, so f is a pointer. Outside them, the parameter list says what it points to: a function that takes a pointer to int.',
      keyword: 'a pointer',
      detail: 'Postfix parentheses and brackets bind tighter than the prefix star, so the star can only apply to f because the parentheses group it first.'
    },
    {
      id: 'rd-4', start: 52.5, end: 60, scene: 'reading',
      visualAction: 'answer',
      caption: 'Step four: what is left is the return type, int. So f is a pointer to function taking (int *) returning int — option C.',
      narration: 'The remaining int is the return type. Read it out: f is a pointer to a function taking a pointer to int and returning an int. That is option C, and each wrong option moves exactly one word.',
      keyword: 'option C',
      detail: 'Option A drops the pointer and calls f a function. Option B moves the star to the return type. Option D invents a return type that is itself a function pointer.',
      trap: 'int *f(int *) is a function returning a pointer to int. Moving one star out of the parentheses changes the type completely, and that is the whole trap.'
    },

    /* ---------------- scene 3: four spellings ---------------- */
    {
      id: 'sp-1', start: 60, end: 67.5, scene: 'spellings',
      visualAction: 'row-one',
      caption: 'int *f(int) is a function taking an int and returning a pointer to int.',
      narration: 'First spelling. No parentheses around the star, so the parameter list binds first: f is a function, and the pointer is its return type.',
      keyword: 'return type',
      detail: 'The base type is int; the star applies to the result of the function declarator, so the pointer is on the way out, not on the way in.'
    },
    {
      id: 'sp-2', start: 67.5, end: 75, scene: 'spellings',
      visualAction: 'row-two',
      caption: 'int (*f)(int) is a pointer to a function taking an int and returning int. One pair of parentheses, a different type.',
      narration: 'Second spelling. The parentheses make the star bind before the parameter list, so f is the pointer and the function is what it points at.',
      keyword: 'a different type',
      detail: 'This is the GATE CSE 2005 declaration with the pointer removed from the parameter. Its reading is the answer to that question.'
    },
    {
      id: 'sp-3', start: 75, end: 82.5, scene: 'spellings',
      visualAction: 'row-three',
      caption: 'int (*f[3])(int) is an array of three pointers to functions. It is a table, not a pointer to a table.',
      narration: 'Third spelling. The brackets bind tighter than the star, so f is an array of three pointers. Each cell holds a function address. This is the dispatch table in scene nine.',
      keyword: 'an array of three pointers',
      detail: 'The reading is an array of 3 pointers to function taking (int) returning int. The array itself is the object; each element is a pointer.'
    },
    {
      id: 'sp-4', start: 82.5, end: 90, scene: 'spellings',
      visualAction: 'row-four',
      caption: 'int (**f)(int) is a pointer to a pointer to function: you can repoint which pointer is used.',
      narration: 'Fourth spelling. Two stars, so f is a pointer to a pointer to a function. The extra level exists so that a function can change which handler a caller holds.',
      keyword: 'pointer to a pointer',
      detail: 'A pointer to pointer to function taking (int) returning int. Passing &cb to a function lets the callee replace the handler the caller will use next.',
      trap: 'An array of pointers to functions and a pointer to an array of functions look alike and behave nothing alike: int (*f[3])(int) against int (*f[3])[4]. Count the parentheses before reading either.'
    },

    /* ---------------- scene 4: grammar ---------------- */
    {
      id: 'gr-1', start: 90, end: 97.5, scene: 'grammar',
      visualAction: 'grammar-rule',
      caption: 'The grammar is short: a declarator is an optional pointer followed by a direct-declarator.',
      narration: 'This is why the parenthesis matters, and it is a rule, not a convention. A declarator is an optional star, then a direct-declarator, and the suffixes attach to the direct-declarator.',
      keyword: 'optional star, then a direct-declarator',
      detail: 'C11 6.7.6: declarator := pointer? direct-declarator; direct-declarator := identifier | ( declarator ) | direct-declarator [ n ] | direct-declarator ( params ).'
    },
    {
      id: 'gr-2', start: 97.5, end: 105, scene: 'grammar',
      visualAction: 'left-chain',
      caption: 'In int *f(int), the parameter list attaches first: f is a function, then the pointer applies to what it returns.',
      narration: 'Left side. The suffix attaches to f directly, so the function is built first, and the star then wraps the result. Function first, pointer second.',
      keyword: 'function first, pointer second',
      detail: 'The chain of constructors is: function taking (int), then pointer to, then the base type int.'
    },
    {
      id: 'gr-3', start: 105, end: 112.5, scene: 'grammar',
      visualAction: 'right-chain',
      caption: 'In int (*f)(int), the star attaches first: f is a pointer, and the function is what it points at.',
      narration: 'Right side. The parentheses make the star part of the inner declarator, so the pointer is built first and the parameter list then wraps that. Pointer first, function second.',
      keyword: 'pointer first, function second',
      detail: 'The chain is: pointer to, then function taking (int), then the base type int. Two orders, two types.'
    },
    {
      id: 'gr-4', start: 112.5, end: 120, scene: 'grammar',
      visualAction: 'conclusion',
      caption: 'So the reading order is the constructor order, and the base type is always applied last.',
      narration: 'The English sentence is just the constructor chain read out loud, with the base type at the end. Learn the two orders and no declaration can surprise you.',
      keyword: 'the constructor chain read out loud',
      detail: 'This is the inside-out or spiral rule, derived rather than memorised: read the identifier, apply each suffix, then each prefix, and finish with the base type.',
      trap: 'Reading the declaration left to right gives the wrong answer every time. The base type int on the left is applied last, not first.'
    },

    /* ---------------- scene 5: signal ---------------- */
    {
      id: 'sg-1', start: 120, end: 127.5, scene: 'signal',
      visualAction: 'signal-intro',
      caption: 'This is the declaration of signal in signal.h. It is the hardest one the standard library asks you to read.',
      narration: 'One declaration from the standard library, and the one everybody skips: signal. Read it from the identifier outward and it comes apart in four steps.',
      keyword: 'four steps',
      detail: 'C11 7.14.1.1 declares signal as void (*signal(int, void (*)(int)))(int). The handler type is void (*)(int).'
    },
    {
      id: 'sg-2', start: 127.5, end: 135, scene: 'signal',
      visualAction: 'step-one',
      caption: 'Step one: signal followed by a parameter list, so signal is a function taking an int and a handler.',
      narration: 'Signal is followed by a parameter list, so it is a function. Its two parameters are an int and a pointer to a function taking an int and returning void.',
      keyword: 'signal is a function',
      detail: 'The second parameter is written void (*)(int): an abstract declarator, with no identifier, read as a pointer to function taking (int) returning void.'
    },
    {
      id: 'sg-3', start: 135, end: 142.5, scene: 'signal',
      visualAction: 'step-two',
      caption: 'Step two: the star before signal makes the result a pointer, and the trailing (int) says what it points at.',
      narration: 'Outside the parameter list there is a star, so the function returns a pointer. The trailing parameter list says that pointer points at a function taking an int and returning void.',
      keyword: 'returns a pointer',
      detail: 'The return type is pointer to function taking (int) returning void, which is the previous handler: signal returns what was installed before.'
    },
    {
      id: 'sg-4', start: 142.5, end: 150, scene: 'signal',
      visualAction: 'typedef',
      caption: 'The full reading, then one typedef that collapses it: typedef void (*handler)(int); handler signal(int, handler);',
      narration: 'Here is the whole reading in one sentence. Then one typedef, and the same declaration fits on a line. That is the practical lesson: when a declarator hurts, name a piece of it.',
      keyword: 'one typedef',
      detail: 'The model reads it as: signal is a function taking (int, void (*)(int)) returning pointer to function taking (int) returning void. The typedef names the handler type, not the pointer, in the cleanest style.',
      trap: 'The trailing (int) belongs to the return type, not to the parameters. Reading it as part of the argument list is the standard mistake on this declaration.'
    },

    /* ---------------- scene 6: calling ---------------- */
    {
      id: 'cl-1', start: 150, end: 157.5, scene: 'calling',
      visualAction: 'pointer-and-code',
      caption: 'A pointer cell holding 0x401136, and the function it points at. Calling through it is one extra load.',
      narration: 'Back to the machine. A pointer cell holds an address; calling through it loads that address and jumps. One extra load, and nothing else changes.',
      keyword: 'one extra load',
      detail: 'The model is a stated LP64 machine: an 8-byte pointer, a 4-byte int, and code addresses 0x401136, 0x401150, 0x40116A.'
    },
    {
      id: 'cl-2', start: 157.5, end: 165, scene: 'calling',
      visualAction: 'three-spellings',
      caption: 'f(3) and (*f)(3) are the same call. The star is undone by the designator rule.',
      narration: 'Calling f directly, the designator decays to a pointer and then the call happens. Writing star f in parentheses, the star turns the pointer back into the designator, which decays again. Same address, same call.',
      keyword: 'the same call',
      detail: 'C11 6.5.2.2p1 requires the called expression to have pointer-to-function type; 6.5.3.2p4 makes *p on a function pointer yield the designator, which 6.3.2.1p4 converts back.'
    },
    {
      id: 'cl-3', start: 165, end: 172.5, scene: 'calling',
      visualAction: 'trap',
      caption: 'But *p(3) is *(p(3)): it calls p first and dereferences the int it returns. That is not a call at all.',
      narration: 'Here is the trap. Without the parentheses, the call binds tighter than the star, so star p of three means: call p, then dereference the int it returned. The compiler will refuse, or worse, accept it.',
      keyword: '*(p(3))',
      detail: 'Postfix call binds tighter than prefix star, so *p(3) groups as *(p(3)). If p returns a pointer the program compiles and dereferences the wrong object.',
      trap: 'The parentheses in (*p)(3) are not decoration: they are what makes the star apply to the pointer instead of to the result of the call.'
    },
    {
      id: 'cl-4', start: 172.5, end: 180, scene: 'calling',
      visualAction: 'addresses',
      caption: 'f, &f and *f all name 0x401136. But &p is the address of the cell, not the code.',
      narration: 'Three spellings, one address: f, ampersand f and star f all give 0x401136, which the model checks by resolving all three. Ampersand p is different: that is the address of the pointer cell itself.',
      keyword: 'one address',
      detail: 'The three spellings resolve to 4198710 in the model, which is 0x401136. &p would be a different number and a different type: pointer to pointer to function.'
    },

    /* ---------------- scene 7: qsort ---------------- */
    {
      id: 'qs-1', start: 180, end: 187.5, scene: 'qsort',
      visualAction: 'array',
      caption: 'Six integers, and a comparator the sort will call with pointers to two of them.',
      narration: 'qsort knows nothing about your data. It moves fixed-size blocks and asks your comparator, every time it needs to compare two of them.',
      keyword: 'asks your comparator',
      detail: 'The array is 5, 3, 9, 1, 7, 3. The comparator receives pointers into the array, so it casts each to the element type before reading.'
    },
    {
      id: 'qs-2', start: 187.5, end: 195, scene: 'qsort',
      visualAction: 'sorted',
      caption: 'The contract: negative if the first is less, zero if equal, positive if greater. Nothing else is promised.',
      narration: 'The contract has exactly three outcomes. Return negative when the first argument is smaller, zero when they are equal, positive when it is larger. Any other convention breaks the sort silently.',
      keyword: 'three outcomes',
      detail: 'The glibc manual adds two obligations: the comparator must not alter the array, and its result must not depend on element addresses or positions.'
    },
    {
      id: 'qs-3', start: 195, end: 202.5, scene: 'qsort',
      visualAction: 'comparisons',
      caption: 'Under the correct comparator this array sorts in eleven comparisons — inside the five to fifteen bounds.',
      narration: 'Run a comparison-counting sort over that array with the correct comparator and it takes eleven comparisons. The bounds are at least five and at most fifteen, and eleven sits inside them.',
      keyword: 'eleven comparisons',
      detail: 'The model counts comparisons in an insertion sort: eleven for six elements, against the lower bound n-1 = 5 and the upper bound n(n-1)/2 = 15.'
    },
    {
      id: 'qs-4', start: 202.5, end: 210, scene: 'qsort',
      visualAction: 'stability',
      caption: 'Equal elements may come out in either order: qsort is not stable. The two 3s are not interchangeable.',
      narration: 'The array has two 3s. After sorting, either may come first, because qsort is not stable. If the tie matters, add a tie-breaker to the comparator.',
      keyword: 'not stable',
      detail: 'The glibc manual states that when two elements compare equal their order afterwards is unpredictable. A stable sort is available as mergesort where the platform provides it.',
      trap: 'Returning 1 and -1 with no zero case is not the same as returning a difference: two equal keys then report a strict order, and the sort may produce a different array depending on the algorithm.'
    },

    /* ---------------- scene 8: broken comparators ---------------- */
    {
      id: 'bk-1', start: 210, end: 217.5, scene: 'broken',
      visualAction: 'subtraction',
      caption: 'The most common comparator is return a - b. With a two billion and b minus two billion, that is four billion.',
      narration: 'Everybody writes return a minus b, and for small integers it is correct. Take a equal to two billion and b equal to minus two billion and the difference is four billion.',
      keyword: 'return a - b',
      detail: 'The values are 2000000000 and -2000000000. Their difference, 4000000000, exceeds INT_MAX on a 32-bit int model.'
    },
    {
      id: 'bk-2', start: 217.5, end: 225, scene: 'broken',
      visualAction: 'wraps',
      caption: 'Four billion does not fit in an int. It wraps to minus two hundred ninety-four million, so the sign is wrong.',
      narration: 'Four billion does not fit in a 32-bit int, so the result wraps to minus 294967296. The comparator now reports that the larger value is smaller, and the pair stays in the order it arrived.',
      keyword: 'wraps',
      detail: 'Signed overflow is undefined behaviour in C; the wrap shown is the two\'s-complement result on the stated model. Either way the sign is not the sign of the true difference.',
      trap: 'On a 64-bit int this particular pair is fine, and the bug hides until the values get large enough. That is why the subtraction comparator survives review.'
    },
    {
      id: 'bk-3', start: 225, end: 232.5, scene: 'broken',
      visualAction: 'boolean',
      caption: 'The second broken comparator returns a > b, which is 1 or 0 and never negative.',
      narration: 'The second mistake returns a greater-than b. That yields one or zero, and never minus one. So every pair reads as not-less, and nothing ever moves.',
      keyword: 'never negative',
      detail: 'With the boolean comparator the three-element array 3, 1, 2 comes back as 3, 1, 2: unsorted, and the model checks that it is unsorted.'
    },
    {
      id: 'bk-4', start: 232.5, end: 240, scene: 'broken',
      visualAction: 'repair',
      caption: 'The repair is one line: return (a > b) - (a < b). Three outcomes, no arithmetic to overflow.',
      narration: 'Both bugs have the same repair: return a greater-than b minus a less-than b. That gives exactly minus one, zero and one, with no subtraction of the values themselves.',
      keyword: '(a > b) - (a < b)',
      detail: 'The model checks the repair returns -1, 0 and 1 exactly, and that it sorts both the overflow pair and the three-element array.',
      trap: 'Writing return a - b is safe only when the values are known to be small. GATE questions that show large values are testing exactly this line.'
    },

    /* ---------------- scene 9: dispatch table ---------------- */
    {
      id: 'tb-1', start: 240, end: 247.5, scene: 'table',
      visualAction: 'table',
      caption: 'Four function pointers in one array: add, sub, mul, div. The opcode is the index.',
      narration: 'An array of function pointers, one cell per operator. The opcode is the index, so choosing an operation is an array subscript, not a chain of tests.',
      keyword: 'the opcode is the index',
      detail: 'The declaration is int (*ops[4])(int, int) = { add, sub, mul, div }; an array of four pointers to functions taking two ints and returning int.'
    },
    {
      id: 'tb-2', start: 247.5, end: 255, scene: 'table',
      visualAction: 'program',
      caption: 'The program adds five, multiplies by three, subtracts two. Table lookup and switch both give thirteen.',
      narration: 'A three-step program: add five, multiply by three, subtract two. Walking it through the table gives thirteen. Walking the same program through a switch also gives thirteen.',
      keyword: 'thirteen',
      detail: 'The model starts the accumulator at zero and applies each step, so ((0+5)*3)-2 = 13 by both routes.'
    },
    {
      id: 'tb-3', start: 255, end: 262.5, scene: 'table',
      visualAction: 'enumeration',
      caption: 'The model ran all one thousand seven hundred twenty-eight programs of three steps both ways, and they agreed every time.',
      narration: 'Not one program: all of them. Three steps, four opcodes and three arguments each gives 1728 programs, and the table and the switch agreed on all 1728.',
      keyword: 'all 1728',
      detail: 'Four opcodes cubed times three arguments cubed is 1728. The model enumerates them exhaustively and compares the two evaluations.'
    },
    {
      id: 'tb-4', start: 262.5, end: 270, scene: 'table',
      visualAction: 'cost',
      caption: 'Cost: an if-chain over four operators averages two and a half tests per instruction, the table one. Over a thousand instructions that is 2500 against 1000.',
      narration: 'Why use a table at all? Because an if-chain over four operators averages two and a half comparisons per instruction, while a table costs one. Over a thousand instructions, 2500 tests against 1000.',
      keyword: '2500 against 1000',
      detail: 'This is a model arithmetic count of tests, not a measurement of generated code: a compiler may turn a dense switch into a jump table anyway, which is the same idea done for you.',
      trap: 'The table is writable at run time, which is the point and the risk. A corrupted entry turns a data bug into a jump into arbitrary code.'
    },

    /* ---------------- scene 10: the rules ---------------- */
    {
      id: 'ru-1', start: 270, end: 277.5, scene: 'rules',
      visualAction: 'rule-one',
      caption: 'Calling through a converted pointer of the wrong type is undefined behaviour.',
      narration: 'First rule, and the one that matters most: you may convert a function pointer to another function pointer type and back, but calling through the converted pointer when the types are not compatible is undefined.',
      keyword: 'undefined behaviour',
      detail: 'C11 6.3.2.3p8. The conversion and the comparison back are guaranteed; only the call is undefined. This is the clause that makes the qsort cast dangerous.'
    },
    {
      id: 'ru-2', start: 277.5, end: 285, scene: 'rules',
      visualAction: 'rule-two',
      caption: 'Arithmetic on a function pointer is not allowed: addition needs a pointer to a complete object type.',
      narration: 'Second rule. Adding one to a function pointer requires a pointer to a complete object type, and a function type is not an object type. GCC allows it as an extension, treating the size as one.',
      keyword: 'not an object type',
      detail: 'C11 6.5.6p2, and 6.5.2.1 for subscripting. -pedantic and -Wpointer-arith are what surface the extension.'
    },
    {
      id: 'ru-3', start: 285, end: 292.5, scene: 'rules',
      visualAction: 'rule-three',
      caption: 'sizeof of a function is a constraint violation; sizeof of the pointer is the pointer size.',
      narration: 'Third rule. sizeof cannot be applied to a function type, and the reason is that a function is not an object: there is no size to report. The pointer, by contrast, has the machine\'s pointer size.',
      keyword: 'no size to report',
      detail: 'C11 6.5.3.4. On the stated LP64 model the pointer is 8 bytes; on ILP32 it would be 4.'
    },
    {
      id: 'ru-4', start: 292.5, end: 300, scene: 'rules',
      visualAction: 'rule-four',
      caption: 'A parameter written with a function type is adjusted to a pointer. Inside the callee, &cb is a pointer to a pointer.',
      narration: 'Fourth rule, and the one that catches people inside the callee. Write a parameter as a function type and it is adjusted to a pointer to function, so ampersand cb is one level deeper than you might think. Converting is legal; calling through the wrong type is not.',
      keyword: 'adjusted to a pointer',
      detail: 'C11 6.7.6.3p8 adjusts a function-type parameter to pointer to function, exactly as an array parameter becomes a pointer. The model checks the adjustment and the compatibility pairs.',
      trap: 'A comparator declared as int (*)(int *, int *) and cast to the void * signature is the textbook case of 6.3.2.3p8. It usually appears to work, which is why it survives in real code.'
    }
  ]
};
