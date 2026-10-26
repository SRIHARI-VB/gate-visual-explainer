/* ==========================================================================
   functions-scope-and-preprocessor — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs — never edited by hand.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'prototype',
      n: 1,
      title: 'A prototype is a promise the compiler can check',
      start: 0, end: 30,
      objective: 'Separate a declaration from a definition, and see what is lost when the prototype is missing.'
    },
    {
      id: 'byvalue',
      n: 2,
      title: 'Every argument is copied into the parameter',
      start: 30, end: 60,
      objective: 'Show why a swap on parameters cannot change the caller, and why an array parameter is really a pointer.'
    },
    {
      id: 'scope',
      n: 3,
      title: 'Scope decides which object a name refers to',
      start: 60, end: 90,
      objective: 'Resolve a shadowed name by searching from the innermost block outward.'
    },
    {
      id: 'lifetime',
      n: 4,
      title: 'Scope and lifetime are different questions',
      start: 90, end: 120,
      objective: 'Distinguish where a name is visible from when the object exists, using the two storage durations.'
    },
    {
      id: 'staticlocal',
      n: 5,
      title: 'A static local is initialised once and remembers',
      start: 120, end: 150,
      objective: 'Trace a static counter, then use it to solve the 2019 paper\'s for-loop question.'
    },
    {
      id: 'linkage',
      n: 6,
      title: 'Linkage is about the linker, not the block',
      start: 150, end: 180,
      objective: 'Read the four storage classes off one table: duration, linkage and the default initial value.'
    },
    {
      id: 'objmacro',
      n: 7,
      title: 'A macro is a text substitution, not a function',
      start: 180, end: 210,
      objective: 'Expand SQR(b+2) by hand and get 14, then see the parentheses that give 36.'
    },
    {
      id: 'doubleeval',
      n: 8,
      title: 'Parentheses do not fix double evaluation',
      start: 210, end: 240,
      objective: 'Show that a fully parenthesised macro still evaluates its argument twice when it uses it twice.'
    },
    {
      id: 'include',
      n: 9,
      title: '#include pastes text; conditional compilation deletes it',
      start: 240, end: 270,
      objective: 'See why an include guard is needed, and what NDEBUG does to assert.'
    },
    {
      id: 'pipeline',
      n: 10,
      title: 'Four build steps, and one definition per name',
      start: 270, end: 300,
      objective: 'Follow one source file through preprocess, compile, assemble and link, and see what the linker rejects.'
    }
  ],

  events: [

    /* ---- scene 1: prototype ---- */
    {
      id: 'proto-1', start: 0, end: 8, scene: 'prototype',
      caption: 'A declaration tells the compiler the name, the parameter types and the return type. A definition also supplies the body.',
      detail: 'int f(int); is a declaration only. int f(int a){ return a+1; } is a definition. A prototype is a declaration that names every parameter type.',
      keyword: 'declaration',
      trap: 'A definition is also a declaration. The two words are not opposites.',
      narration: 'A declaration tells the compiler the name, the parameter types and the return type. A definition also supplies the body.'
    },
    {
      id: 'proto-2', start: 8, end: 16, scene: 'prototype',
      caption: 'With a prototype in view, the compiler converts each argument to the declared parameter type, as if by assignment.',
      detail: 'This is the C rule for a call to a function whose type includes a prototype: each argument is converted to the unqualified declared type of its parameter.',
      keyword: 'converts each argument',
      trap: 'The conversion is silent. A double passed to an int parameter is truncated with no warning unless you enable warnings.',
      narration: 'With a prototype in view, the compiler converts each argument to the declared parameter type, as if by assignment.'
    },
    {
      id: 'proto-3', start: 16, end: 23, scene: 'prototype',
      caption: 'Without a prototype the compiler cannot convert. Only the default argument promotions apply: char and short become int, float becomes double.',
      detail: 'These promotions exist for compatibility with pre-1989 C. They are also what happens to the trailing arguments of a variadic function such as printf.',
      keyword: 'default argument promotions',
      trap: 'printf("%f", f) is safe because float is promoted to double; printf("%f", 1.0f) is not the trap it looks like. printf("%d", 3.7) is.',
      narration: 'Without a prototype the compiler cannot convert. Only the default argument promotions apply.'
    },
    {
      id: 'proto-4', start: 23, end: 30, scene: 'prototype',
      caption: 'So a char parameter that receives a promoted int is undefined behaviour. The code still compiles, and the answer is not yours to predict.',
      detail: 'The standard says the behaviour is undefined when the types of the arguments after promotion are not compatible with the parameters after promotion, with a small exception for signed against unsigned of the same value.',
      keyword: 'undefined behaviour',
      trap: 'A question that asks for the output of such a program has no defined answer. That is often the intended answer.',
      narration: 'So a char parameter that receives a promoted int is undefined behaviour. The code still compiles.'
    },

    /* ---- scene 2: pass by value ---- */
    {
      id: 'value-1', start: 30, end: 38, scene: 'byvalue',
      caption: 'Every argument is copied into a new parameter object. The parameter is not the caller\'s variable.',
      detail: 'C has one passing mechanism: by value. The copy is a fresh object with automatic storage duration, created when the call is made.',
      keyword: 'copied',
      trap: 'A parameter that is modified is a modified copy. The caller sees nothing.',
      narration: 'Every argument is copied into a new parameter object. The parameter is not the caller\'s variable.'
    },
    {
      id: 'value-2', start: 38, end: 46, scene: 'byvalue',
      caption: 'So a swap that swaps its own parameters changes nothing in main. The two copies die when the call returns.',
      detail: 'To swap the caller\'s objects you must pass their addresses and dereference inside: void swap(int *a, int *b).',
      keyword: 'changes nothing',
      trap: 'This is the most common single mistake in the whole topic. It is not a bug in the compiler.',
      narration: 'So a swap that swaps its own parameters changes nothing in main. The two copies die when the call returns.'
    },
    {
      id: 'value-3', start: 46, end: 53, scene: 'byvalue',
      caption: 'An array parameter is the same rule in disguise: a parameter declared int a[] is adjusted to int *a. The pointer is copied, not the array.',
      detail: 'The adjustment happens in the parameter type itself, so void f(int a[10]) and void f(int *a) declare exactly the same function.',
      keyword: 'adjusted to a pointer',
      trap: 'void f(int a[10]) does not check that the caller passes ten elements. The 10 is ignored.',
      narration: 'An array parameter is the same rule in disguise: a parameter declared int a[] is adjusted to int *a.'
    },
    {
      id: 'value-4', start: 53, end: 60, scene: 'byvalue',
      caption: 'That is why sizeof inside the function gives the size of a pointer, not the size of the caller\'s array.',
      detail: 'On a 64-bit machine sizeof(int *) is 8 while sizeof of a ten-int array is 40. Divide the array size by the element size in the caller, never in the callee.',
      keyword: 'sizeof inside the function',
      trap: 'The idiom sizeof(a)/sizeof(a[0]) works only where the array is still an array, which means not inside a function that took it as a parameter.',
      narration: 'That is why sizeof inside the function gives the size of a pointer, not the size of the caller\'s array.'
    },

    /* ---- scene 3: scope ---- */
    {
      id: 'scope-1', start: 60, end: 68, scene: 'scope',
      caption: 'Scope is where a name is visible. C has block scope, function scope, file scope and function-prototype scope.',
      detail: 'A label has function scope. A parameter name inside a prototype has prototype scope, which ends at the closing parenthesis. Everything declared at the top level of a file has file scope.',
      keyword: 'where a name is visible',
      trap: 'Function-prototype scope means a parameter name in a declaration is invisible in the definition. Only the types matter.',
      narration: 'Scope is where a name is visible. C has block scope, function scope, file scope and function-prototype scope.'
    },
    {
      id: 'scope-2', start: 68, end: 76, scene: 'scope',
      caption: 'Name lookup starts in the innermost block and moves outward. The first declaration found wins.',
      detail: 'The search stops at the first match, so an inner declaration hides every outer one of the same spelling for the rest of its block.',
      keyword: 'innermost block',
      trap: 'There is no ambiguity and no error. The inner name simply wins, silently.',
      narration: 'Name lookup starts in the innermost block and moves outward. The first declaration found wins.'
    },
    {
      id: 'scope-3', start: 76, end: 84, scene: 'scope',
      caption: 'So a local hides a global of the same name. That is shadowing, and it is what makes a two-variable trace confusing.',
      detail: 'When the inner block ends, the outer declaration becomes visible again and the inner object is gone.',
      keyword: 'shadowing',
      trap: 'Two objects with one spelling in one program is legal. GATE uses it deliberately.',
      narration: 'So a local hides a global of the same name. That is shadowing.'
    },
    {
      id: 'scope-4', start: 84, end: 90, scene: 'scope',
      caption: 'In the 2023 question, main\'s x and the static x inside funcp are different objects that happen to share a spelling.',
      detail: 'Writing x = funcp() assigns funcp\'s static x to main\'s automatic x. The two are never the same storage.',
      keyword: 'different objects',
      trap: 'A trace that treats the two x as one variable gets every number wrong after the first call.',
      narration: 'In the 2023 question, main\'s x and the static x inside funcp are different objects that happen to share a spelling.'
    },

    /* ---- scene 4: lifetime ---- */
    {
      id: 'life-1', start: 90, end: 98, scene: 'lifetime',
      caption: 'Scope and lifetime are different questions. Scope asks where the name is visible; lifetime asks when the object exists.',
      detail: 'C calls the second one storage duration. Every object has exactly one of: automatic, static, thread, or allocated.',
      keyword: 'storage duration',
      trap: 'An object can outlive its name, and a name can be visible where no object exists. Neither implies the other.',
      narration: 'Scope and lifetime are different questions. Scope asks where the name is visible; lifetime asks when the object exists.'
    },
    {
      id: 'life-2', start: 98, end: 106, scene: 'lifetime',
      caption: 'An automatic object is created when its block is entered and destroyed when it is left. Each call gets a fresh one.',
      detail: 'Function parameters and every non-static block-scope object have automatic storage duration. On recursion, each level gets its own allocation.',
      keyword: 'fresh one',
      trap: 'A pointer to an automatic object becomes dangling the moment the call returns. Using it is undefined behaviour.',
      narration: 'An automatic object is created when its block is entered and destroyed when it is left.'
    },
    {
      id: 'life-3', start: 106, end: 114, scene: 'lifetime',
      caption: 'A static object exists for the whole run and is initialised once, before main. A call does not recreate it.',
      detail: 'The standard says the value is initialised only once, prior to program startup. A static local keeps its last value between calls.',
      keyword: 'initialised once',
      trap: 'The initialiser of a static local is not re-run. A statement such as static int n = 0; cannot be used to reset a counter.',
      narration: 'A static object exists for the whole run and is initialised once, before main.'
    },
    {
      id: 'life-4', start: 114, end: 120, scene: 'lifetime',
      caption: 'So a static local can count its own calls. Its name is still local; only its lifetime is global.',
      detail: 'This combination — local name, static duration — is exactly what makes the pattern a favourite exam question.',
      keyword: 'count its own calls',
      trap: 'Confusing the name\'s scope with the object\'s lifetime is the whole difficulty. Two lines, two different properties.',
      narration: 'So a static local can count its own calls. Its name is still local; only its lifetime is global.'
    },

    /* ---- scene 5: static local ---- */
    {
      id: 'static-1', start: 120, end: 128, scene: 'staticlocal',
      caption: 'Here is the counter: static int n = 0; then n++; then return n. Three calls return 1, 2, 3.',
      detail: 'The initialisation happens once. Each call finds the value left by the previous call and increments it.',
      keyword: '1, 2, 3',
      trap: 'Without static the answer would be 1, 1, 1. One keyword changes every call after the first.',
      narration: 'Here is the counter: static int n equals zero, then n plus plus, then return n. Three calls return 1, 2, 3.'
    },
    {
      id: 'static-2', start: 128, end: 136, scene: 'staticlocal',
      caption: 'The 2019 paper hides the same idea in a loop header: for (r(); r(); r()), with static int num = 7; return num--;',
      detail: 'The function has a side effect on every call, including the ones the loop makes for its own bookkeeping.',
      keyword: 'loop header',
      trap: 'Every call to r() consumes one value, whether or not it looks like it belongs to the body.',
      narration: 'The 2019 paper hides the same idea in a loop header: for r(); r(); r(), with static int num equal to seven, returning num minus minus.'
    },
    {
      id: 'static-3', start: 136, end: 144, scene: 'staticlocal',
      caption: 'The initialisation runs once, then condition, body, update, condition. Each r() returns the value and then decrements.',
      detail: 'The calls return 7, 6, 5, 4, 3, 2, 1, 0. The condition is false when it receives 0, so the loop stops after the second body.',
      keyword: 'condition, body, update',
      trap: 'The post-decrement returns first and decrements second. Using --num instead shifts every printed digit.',
      narration: 'The initialisation runs once, then condition, body, update, condition. Each call returns the value and then decrements.'
    },
    {
      id: 'static-4', start: 144, end: 150, scene: 'staticlocal',
      caption: 'The body prints 5, then 2. The answer is 52, and the page computes it rather than trusting the trace.',
      detail: 'The answer is two digits because the loop runs its body twice, not because 52 is special.',
      keyword: '52',
      trap: '63 and 630 come from decrementing before the return. 41 comes from one iteration too few.',
      narration: 'The body prints 5, then 2. The answer is 52.'
    },

    /* ---- scene 6: linkage ---- */
    {
      id: 'link-1', start: 150, end: 158, scene: 'linkage',
      caption: 'Linkage is about the linker, not the block. External linkage means the name can be used from another translation unit.',
      detail: 'A translation unit is one source file after preprocessing, which is what the compiler actually sees.',
      keyword: 'linkage',
      trap: 'Scope is a compile-time question; linkage is a link-time question. They are independent.',
      narration: 'Linkage is about the linker, not the block. External linkage means the name can be used from another translation unit.'
    },
    {
      id: 'link-2', start: 158, end: 166, scene: 'linkage',
      caption: 'static at file scope gives internal linkage, so the name stays in this file. extern says the object exists, here or elsewhere.',
      detail: 'An extern declaration without an initialiser is a declaration, not a definition: it allocates nothing.',
      keyword: 'internal linkage',
      trap: 'extern int g; inside a function is a declaration. int g; at file scope is a tentative definition. The two do different things.',
      narration: 'static at file scope gives internal linkage, so the name stays in this file. extern says the object exists, here or elsewhere.'
    },
    {
      id: 'link-3', start: 166, end: 174, scene: 'linkage',
      caption: 'The four storage classes fix three things at once: storage duration, linkage, and the default initial value.',
      detail: 'auto and register give automatic duration and no linkage. static at block scope gives static duration and no linkage. static at file scope gives static duration and internal linkage. extern gives static duration and external linkage.',
      keyword: 'three things at once',
      trap: 'register forbids taking the address of the object. That is a constraint, not a hint.',
      narration: 'The four storage classes fix three things at once: storage duration, linkage, and the default initial value.'
    },
    {
      id: 'link-4', start: 174, end: 180, scene: 'linkage',
      caption: 'Automatic objects start as garbage. Objects with static duration start as zero. That one difference answers many questions.',
      detail: 'Zero means 0 for arithmetic types, a null pointer for pointers, and a proper empty aggregate for arrays, structs and unions.',
      keyword: 'start as zero',
      trap: 'Reading an uninitialised automatic variable is undefined behaviour, not "probably zero".',
      narration: 'Automatic objects start as garbage. Objects with static duration start as zero.'
    },

    /* ---- scene 7: object macros ---- */
    {
      id: 'macro-1', start: 180, end: 188, scene: 'objmacro',
      caption: '#define is a text substitution done before the compiler sees the code. SQR(x) (x*x) with b+2 becomes b+2*b+2.',
      detail: 'The preprocessor replaces the token x with the argument tokens. It does not add a single parenthesis of its own.',
      keyword: 'text substitution',
      trap: 'A macro is not a function. There is no type checking, no scope, and no call.',
      narration: 'Hash define is a text substitution done before the compiler sees the code. SQR of x, open x times x close, with b plus two becomes b plus two times b plus two.'
    },
    {
      id: 'macro-2', start: 188, end: 196, scene: 'objmacro',
      caption: 'With b = 4 that is 4 + 2*4 + 2 = 14, not 36. Multiplication binds tighter than addition.',
      detail: 'The expansion is (b+2*b+2) only if the body has outer parentheses. Without them the whole expression is b + 2*b + 2.',
      keyword: '14, not 36',
      trap: 'The answer 36 is what a function call would give. The whole question is whether you remember there is no function.',
      narration: 'With b equal to four that is four plus two times four plus two, which is fourteen, not thirty six.'
    },
    {
      id: 'macro-3', start: 196, end: 203, scene: 'objmacro',
      caption: 'The fix is two pairs of parentheses: around each parameter, and around the whole body. ((x)*(x)) gives 36.',
      detail: 'Both pairs are needed. Parentheses around the body alone still fail for an argument that is itself a sum used in a product.',
      keyword: '((x)*(x))',
      trap: 'One pair is not enough. The classic half-fix is #define SQR(x) (x*x), which is exactly the broken version.',
      narration: 'The fix is two pairs of parentheses: around each parameter, and around the whole body. That gives thirty six.'
    },
    {
      id: 'macro-4', start: 203, end: 210, scene: 'objmacro',
      caption: 'The same trap turns 64 / SQR(4) into 64/4*4 = 64 instead of 4. Division and multiplication share a level and run left to right.',
      detail: 'The macro body x*x is substituted as a unit only where the surrounding expression lets it be one. A / on the left breaks it.',
      keyword: '64/4*4',
      trap: 'This shape appears in coaching material attributed to more than one exam. Check the arithmetic, not the label.',
      narration: 'The same trap turns sixty four divided by SQR of four into sixty four divided by four times four, which is sixty four instead of four.'
    },

    /* ---- scene 8: double evaluation ---- */
    {
      id: 'double-1', start: 210, end: 218, scene: 'doubleeval',
      caption: 'A macro argument is substituted once for every use in the body. Two uses mean two evaluations.',
      detail: 'The preprocessor expands arguments before substitution unless the parameter is next to # or ##. What is duplicated is the expression, not a value.',
      keyword: 'two evaluations',
      trap: 'This survives every parenthesis. No amount of bracketing makes a macro evaluate an argument once.',
      narration: 'A macro argument is substituted once for every use in the body. Two uses mean two evaluations.'
    },
    {
      id: 'double-2', start: 218, end: 226, scene: 'doubleeval',
      caption: 'With i = 5, SQR(i++) expands to ((i++)*(i++)). The first gives 5, the second gives 6, so the product is 30.',
      detail: 'After the statement i is 7, not 6. Two increments happened where the source shows one.',
      keyword: '30',
      trap: 'The expected 25 requires a function, or a temporary. Neither is what the macro does.',
      narration: 'With i equal to five, SQR of i plus plus expands to i plus plus times i plus plus. The product is thirty, and i becomes seven.'
    },
    {
      id: 'double-3', start: 226, end: 233, scene: 'doubleeval',
      caption: 'A function evaluates each argument once, because the argument is evaluated to produce the copy. That is the difference.',
      detail: 'The single call-by-value rule that makes swap fail is the same rule that makes a function safe here.',
      keyword: 'evaluates each argument once',
      trap: 'A macro is chosen for speed or for being type-generic. Both reasons are weaker than they look once a side effect is involved.',
      narration: 'A function evaluates each argument once, because the argument is evaluated to produce the copy.'
    },
    {
      id: 'double-4', start: 233, end: 240, scene: 'doubleeval',
      caption: 'So use a macro for a constant or a type-generic wrapper, and a function when an argument can have a side effect.',
      detail: 'A static inline function gives the speed without the double evaluation, and the standard header assert is a macro for a different reason: it must see __LINE__.',
      keyword: 'side effect',
      trap: 'Both the missing parentheses and the double evaluation appear in the same question, and only one is fixed by brackets.',
      narration: 'So use a macro for a constant or a type-generic wrapper, and a function when an argument can have a side effect.'
    },

    /* ---- scene 9: include ---- */
    {
      id: 'inc-1', start: 240, end: 248, scene: 'include',
      caption: '#include is textual: the whole header is pasted in at that line. Nothing checks whether it was already included.',
      detail: 'Quoted form searches the current directory first; angle-bracket form searches the implementation\'s include path. Both paste the file.',
      keyword: 'pasted in',
      trap: 'The preprocessor has no memory of what it has already read in this file, unless you give it one.',
      narration: 'Hash include is textual: the whole header is pasted in at that line. Nothing checks whether it was already included.'
    },
    {
      id: 'inc-2', start: 248, end: 256, scene: 'include',
      caption: 'Include the same header twice and its struct definition appears twice, which is an error. An include guard prevents it.',
      detail: 'Two definitions of the same struct type in one translation unit is a constraint violation. Two identical typedefs are also an error.',
      keyword: 'include guard',
      trap: 'A header with only declarations of functions survives double inclusion. A header with definitions does not.',
      narration: 'Include the same header twice and its struct definition appears twice, which is an error. An include guard prevents it.'
    },
    {
      id: 'inc-3', start: 256, end: 263, scene: 'include',
      caption: '#ifndef GUARD, #define GUARD, then the body, then #endif. On the second inclusion the body expands to nothing.',
      detail: 'The guard macro is defined the first time, so the second time the #ifndef test fails and the whole block is skipped.',
      keyword: 'expands to nothing',
      trap: 'The guard must be the very first and very last thing in the file, or part of the header is still pasted twice.',
      narration: 'If not defined guard, define guard, then the body, then end if. On the second inclusion the body expands to nothing.'
    },
    {
      id: 'inc-4', start: 263, end: 270, scene: 'include',
      caption: 'Conditional compilation chooses code before compiling. NDEBUG turns assert into nothing, so a debug check can vanish in a release build.',
      detail: 'The standard says that if NDEBUG is defined when assert.h is included, assert is defined to expand to ((void)0).',
      keyword: 'NDEBUG',
      trap: 'The test is made where assert.h is included, not where assert is written. Defining NDEBUG after the include changes nothing.',
      narration: 'Conditional compilation chooses code before compiling. NDEBUG turns assert into nothing, so a debug check can vanish in a release build.'
    },

    /* ---- scene 10: pipeline ---- */
    {
      id: 'pipe-1', start: 270, end: 278, scene: 'pipeline',
      caption: 'The build is four steps: preprocess, compile, assemble, link. Each one has its own kind of error.',
      detail: 'A missing semicolon is a compile error. A missing definition of a function you called is a link error. The message tells you which step failed.',
      keyword: 'four steps',
      trap: 'A missing include usually shows up as a compile error, because a type or a prototype was never declared.',
      narration: 'The build is four steps: preprocess, compile, assemble, link. Each one has its own kind of error.'
    },
    {
      id: 'pipe-2', start: 278, end: 286, scene: 'pipeline',
      caption: 'The preprocessor expands macros and pastes includes. The compiler turns one translation unit into assembly. The assembler makes an object file.',
      detail: 'The object file holds machine code plus a symbol table listing what it defines and what it needs.',
      keyword: 'translation unit',
      trap: 'Each .c file is compiled separately. That is why a prototype must be visible in every file that calls the function.',
      narration: 'The preprocessor expands macros and pastes includes. The compiler turns one translation unit into assembly.'
    },
    {
      id: 'pipe-3', start: 286, end: 293, scene: 'pipeline',
      caption: 'The linker joins the object files and resolves names. One external definition per name is the rule.',
      detail: 'This is the practical form of the one-definition rule: a function or an object with external linkage may be defined in exactly one translation unit.',
      keyword: 'resolves names',
      trap: 'A static function defined in a header is copied into every file that includes it. Each copy is private, so the link succeeds and the code is duplicated.',
      narration: 'The linker joins the object files and resolves names. One external definition per name is the rule.'
    },
    {
      id: 'pipe-4', start: 293, end: 300, scene: 'pipeline',
      caption: 'Two non-static definitions of one global collide at link time. Two static ones do not, because each is private to its file.',
      detail: 'Making a name static is the standard fix for a multiple-definition error on a variable placed in a header.',
      keyword: 'private to its file',
      trap: 'Making the name static also hides it from the other files that wanted it. The fix and the new bug are one keyword apart.',
      narration: 'Two non-static definitions of one global collide at link time. Two static ones do not, because each is private to its file.'
    }
  ]
};
