/* ==========================================================================
   pointers-in-c — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs — never edited by hand.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 240,

  scenes: [
    {
      id: 'memory',
      n: 1,
      title: 'Memory is a row of numbered bytes',
      start: 0, end: 18,
      objective: 'Separate a variable\'s address from its value.'
    },
    {
      id: 'address-of',
      n: 2,
      title: 'A pointer holds an address',
      start: 18, end: 38,
      objective: 'Read &x and int *p = &x; and see p as a variable with its own address.'
    },
    {
      id: 'dereference',
      n: 3,
      title: 'Dereferencing follows the arrow',
      start: 38, end: 60,
      objective: 'Read *p as an object, not a value; see *p = 99 write through.'
    },
    {
      id: 'scaling',
      n: 4,
      title: 'Pointer arithmetic is scaled',
      start: 60, end: 84,
      objective: 'Derive addr(p + k) = addr(p) + k x sizeof(*p) for int and char pointers.'
    },
    {
      id: 'array-decay',
      n: 5,
      title: 'An array decays to a pointer',
      start: 84, end: 112,
      objective: 'Show contiguity, decay, and a[i] == *(a + i).'
    },
    {
      id: 'sizeof',
      n: 6,
      title: 'The sizeof trap',
      start: 112, end: 142,
      objective: 'Distinguish sizeof(array), sizeof(pointer), sizeof(&a) and a decayed parameter.'
    },
    {
      id: 'precedence',
      n: 7,
      title: 'Four ways * and ++ combine',
      start: 142, end: 176,
      objective: 'Predict the value, the pointer position and the array after each expression.'
    },
    {
      id: 'double-pointer',
      n: 8,
      title: 'A pointer to a pointer',
      start: 176, end: 198,
      objective: 'Follow two arrows and see why a function needs int ** to change a pointer.'
    },
    {
      id: 'lifetime',
      n: 9,
      title: 'Dangling pointers',
      start: 198, end: 222,
      objective: 'See the object disappear while the pointer keeps the number.'
    },
    {
      id: 'rules',
      n: 10,
      title: 'The rules worth carrying in',
      start: 222, end: 240,
      objective: 'Consolidate the three load-bearing rules.'
    }
  ],

  events: [
    /* ---- scene 1: memory ---- */
    {
      id: 'memory-1', start: 0, end: 5.5, scene: 'memory',
      caption: 'A variable is a name for a place in memory.',
      detail: 'Memory is one long row of byte-sized cells. Each cell has a number, called its address. A variable is a name the compiler binds to some of those cells.',
      keyword: 'place in memory',
      trap: 'A variable is not its value. The name refers to a location that holds a value, and the two can be reported separately.',
      narration: 'A variable is a name for a place in memory. Memory is a long row of byte cells, and every cell has a number called its address.'
    },
    {
      id: 'memory-2', start: 5.5, end: 11, scene: 'memory',
      caption: 'int x = 42 reserves four bytes. The first byte\'s address is the address of x.',
      detail: 'An int needs four bytes on the convention used here. The four bytes are consecutive, and the address of the object is the address of its first byte.',
      keyword: 'four bytes',
      trap: 'sizeof(int) is not fixed by the C standard. Here it is 4, and any question that needs it will state it.',
      narration: 'Writing int x equals forty two reserves four bytes. The address of x is the address of the first of those four bytes.'
    },
    {
      id: 'memory-3', start: 11, end: 15, scene: 'memory',
      caption: 'So x has two separate things: an address, 1000, and a value, 42.',
      detail: 'The address answers "where". The value answers "what is stored there". Both are numbers, which is exactly why they are easy to confuse.',
      keyword: 'address',
      trap: 'Both are plain numbers, so printing the wrong one still looks like a plausible answer.',
      narration: 'So x has two separate things. An address, one thousand, and a value, forty two.'
    },
    {
      id: 'memory-4', start: 15, end: 18, scene: 'memory',
      caption: 'An ordinary variable keeps the value. A pointer keeps the address.',
      detail: 'This one sentence is the whole idea. Everything else in the lesson is a consequence of it.',
      keyword: 'pointer',
      trap: null,
      narration: 'An ordinary variable keeps the value. A pointer keeps the address.'
    },

    /* ---- scene 2: address-of ---- */
    {
      id: 'address-of-1', start: 18, end: 23, scene: 'address-of',
      caption: 'The ampersand means "address of". So &x is 1000.',
      detail: 'The unary & operator takes an object and produces its address. It needs an object that actually lives somewhere, so &42 is not allowed.',
      keyword: 'address of',
      trap: '& is not "reference" here and it is not multiplication. In a unary position it always means address of.',
      narration: 'The ampersand means address of. So ampersand x is one thousand.'
    },
    {
      id: 'address-of-2', start: 23, end: 29, scene: 'address-of',
      caption: 'int *p = &x; declares p as a pointer to int, and stores 1000 in it.',
      detail: 'Read the declaration from the name outward: p is a pointer, and the thing it points to is an int. The star belongs to the type, not to the value.',
      keyword: 'pointer to int',
      trap: 'int *p, int* p and int * p are the same declaration. The spacing carries no meaning.',
      narration: 'int star p equals ampersand x declares p as a pointer to int, and stores one thousand in it.'
    },
    {
      id: 'address-of-3', start: 29, end: 34, scene: 'address-of',
      caption: 'p is a variable too. It lives at its own address and takes eight bytes here.',
      detail: 'A pointer is an object like any other, so it occupies memory and has an address of its own. On the 64-bit convention used here a pointer is 8 bytes.',
      keyword: 'eight bytes',
      trap: 'The size of a pointer is not the size of what it points at. A pointer to a 40-byte array is still 8 bytes.',
      narration: 'p is a variable too. It lives at its own address, and takes eight bytes here.'
    },
    {
      id: 'address-of-4', start: 34, end: 38, scene: 'address-of',
      caption: 'A pointer is a variable whose value is an address.',
      detail: 'Not a link, not an alias, not a special object. A number, of a type the compiler tracks.',
      keyword: 'variable whose value is an address',
      trap: null,
      narration: 'A pointer is a variable whose value is an address.'
    },

    /* ---- scene 3: dereference ---- */
    {
      id: 'dereference-1', start: 38, end: 43, scene: 'dereference',
      caption: 'The star in an expression means "the object at the address stored here".',
      detail: 'In a declaration the star builds a pointer type. In an expression it applies to a pointer value and produces the object it points at. The same symbol, two jobs.',
      keyword: 'the object at',
      trap: 'Declaration star and expression star are different jobs. Confusing them is behind most of the "*p is 1000" errors.',
      narration: 'The star in an expression means the object at the address stored here.'
    },
    {
      id: 'dereference-2', start: 43, end: 48, scene: 'dereference',
      caption: 'Follow the arrow: p holds 1000, and 1000 is where x lives. So *p is x itself.',
      detail: 'Dereferencing does not copy the value out. It produces the object, which is why you can assign to it.',
      keyword: 'x itself',
      trap: '*p is not "the value of p". It is the object p points at.',
      narration: 'Follow the arrow. p holds one thousand, and one thousand is where x lives, so star p is x itself.'
    },
    {
      id: 'dereference-3', start: 48, end: 54, scene: 'dereference',
      caption: '*p = 99 writes through the arrow. x becomes 99. p does not change.',
      detail: 'The left side of the assignment is an object, so the assignment writes into that object. p still holds 1000.',
      keyword: 'writes through',
      trap: 'Writing through a pointer changes the target, never the pointer. Only an assignment to p itself changes p.',
      narration: 'Star p equals ninety nine writes through the arrow. x becomes ninety nine, and p does not change.'
    },
    {
      id: 'dereference-4', start: 54, end: 60, scene: 'dereference',
      caption: 'That is why &*p is p and *&x is x: the two operators undo each other.',
      detail: 'Take an address and then dereference it, and you are back where you started. This identity is the quickest check that you read an expression correctly.',
      keyword: 'undo each other',
      trap: 'They cancel as operators, but the intermediate must be a valid pointer. &*p on an uninitialised p is still undefined behaviour.',
      narration: 'That is why ampersand star p is p, and star ampersand x is x. The two operators undo each other.'
    },

    /* ---- scene 4: scaling ---- */
    {
      id: 'scaling-1', start: 60, end: 65, scene: 'scaling',
      caption: 'Pointer arithmetic is scaled by the size of the type pointed to.',
      detail: 'This is the one rule that explains almost every pointer arithmetic question. Adding one does not mean adding one byte.',
      keyword: 'scaled',
      trap: 'Nothing about the address arithmetic is in bytes. The compiler multiplies for you.',
      narration: 'Pointer arithmetic is scaled by the size of the type pointed to.'
    },
    {
      id: 'scaling-2', start: 65, end: 71, scene: 'scaling',
      caption: 'On an int pointer, p + 1 moves four bytes, not one.',
      detail: 'p + 1 must land on the next int, and the next int starts four bytes later. The number 1 counts elements, not bytes.',
      keyword: 'four bytes',
      trap: 'p + 1 does not mean "the next byte". That is the single most common arithmetic error in output questions.',
      narration: 'On an int pointer, p plus one moves four bytes, not one.'
    },
    {
      id: 'scaling-3', start: 71, end: 77, scene: 'scaling',
      caption: 'On a char pointer, q + 1 moves one byte, because sizeof(char) is 1 by definition.',
      detail: 'The same source expression, a different distance, because the pointee type differs. The rule did not change; the scale did.',
      keyword: 'one byte',
      trap: 'char arithmetic happens to equal byte arithmetic. Do not generalise that to other types.',
      narration: 'On a char pointer, q plus one moves one byte, because the size of char is one by definition.'
    },
    {
      id: 'scaling-4', start: 77, end: 84, scene: 'scaling',
      caption: 'addr(p + k) = addr(p) + k x sizeof(*p). One rule, both rows.',
      detail: 'The star inside sizeof means "the type pointed at". So sizeof(*p) is the size of one element, which is the scale factor.',
      keyword: 'sizeof(*p)',
      trap: 'p2 - p1 counts elements, not bytes. Divide the byte gap by the element size to get the same answer.',
      narration: 'The address of p plus k equals the address of p plus k times the size of what p points at. One rule explains both rows.'
    },

    /* ---- scene 5: array decay ---- */
    {
      id: 'array-decay-1', start: 84, end: 90, scene: 'array-decay',
      caption: 'An array is a block of equal-sized cells, laid out one after another.',
      detail: 'Five ints occupy twenty consecutive bytes. Index 0 is at the lowest address, and index i is at base + i x 4.',
      keyword: 'one after another',
      trap: 'C does not store the length with the array. Nothing in memory records that there are five of them.',
      narration: 'An array is a block of equal sized cells, laid out one after another.'
    },
    {
      id: 'array-decay-2', start: 90, end: 96, scene: 'array-decay',
      caption: 'In most expressions the name a decays: it becomes &a[0], a pointer to the first element.',
      detail: 'Decay is a conversion the compiler applies to an array expression. The array object itself does not move or change.',
      keyword: 'decays',
      trap: 'Decay happens in expressions, not in declarations. The array is still an array where it is declared.',
      narration: 'In most expressions the name a decays. It becomes ampersand a zero, a pointer to the first element.'
    },
    {
      id: 'array-decay-3', start: 96, end: 103, scene: 'array-decay',
      caption: 'a and &a[0] hold the same address, but they are not the same type.',
      detail: 'a has type int[5] and decays to int *. &a[0] is already int *. Identical numbers, different types, and therefore different arithmetic.',
      keyword: 'same address',
      trap: 'Equal addresses do not mean equal types. That is exactly how &a + 1 comes to differ from a + 1.',
      narration: 'a and ampersand a zero hold the same address, but they are not the same type.'
    },
    {
      id: 'array-decay-4', start: 103, end: 107, scene: 'array-decay',
      caption: 'a[i] is defined as *(a + i). So a[2] and *(a + 2) reach the same cell.',
      detail: 'Subscripting is not a separate mechanism. It is defined in terms of a pointer addition and a dereference.',
      keyword: 'a[i] is defined as *(a + i)',
      trap: 'Because the definition is in terms of pointers, an array parameter and a pointer parameter behave identically inside the function.',
      narration: 'a i is defined as star a plus i. So a two and star a plus two reach the same cell.'
    },
    {
      id: 'array-decay-5', start: 107, end: 112, scene: 'array-decay',
      caption: 'Since addition commutes, 2[a] is legal and means the same cell.',
      detail: '*(a + 2) and *(2 + a) are the same expression, and the second is written with subscripts as 2[a].',
      keyword: '2[a]',
      trap: 'It is legal, and GATE has used it. It is not good style; it is a definition being applied literally.',
      narration: 'Since addition commutes, two bracket a is legal and means the same cell.'
    },

    /* ---- scene 6: sizeof ---- */
    {
      id: 'sizeof-1', start: 112, end: 117, scene: 'sizeof',
      caption: 'sizeof asks about the object. It answers in bytes, and it is computed from the type.',
      detail: 'sizeof is an operator, not a function call. Its operand keeps its type, and the answer is a count of bytes.',
      keyword: 'computed from the type',
      trap: 'sizeof is evaluated at compile time for these operands, so it never tells you what a pointer currently points at.',
      narration: 'sizeof asks about the object. It answers in bytes, and it is computed from the type.'
    },
    {
      id: 'sizeof-2', start: 117, end: 124, scene: 'sizeof',
      caption: 'sizeof(a) is 20: five ints of four bytes. The array knows its own size.',
      detail: 'Here a is still an array, so the operand is the whole block. Five times four is twenty.',
      keyword: '20',
      trap: 'sizeof(a) is not the number of elements. Divide by sizeof(a[0]) if you want the count.',
      narration: 'The size of a is twenty. Five ints of four bytes each. The array knows its own size.'
    },
    {
      id: 'sizeof-3', start: 124, end: 130, scene: 'sizeof',
      caption: 'sizeof(p) is 8: the pointer\'s own size, whatever it points at.',
      detail: 'A pointer carries no length. Eight bytes holds an address, and the same eight bytes would hold a pointer to a single int or to a thousand of them.',
      keyword: '8',
      trap: 'sizeof(p) never tells you how much memory is reachable through p. Nothing in the language does.',
      narration: 'The size of p is eight. The pointer\'s own size, whatever it points at.'
    },
    {
      id: 'sizeof-4', start: 130, end: 136, scene: 'sizeof',
      caption: '&a is a pointer to the whole array, so &a + 1 jumps twenty bytes, past all of it.',
      detail: 'a + 1 moves by one element, four bytes. &a + 1 moves by one array, twenty bytes. Same numeric address, different scale.',
      keyword: '&a + 1',
      trap: 'This is the classic sizeof question. a + 1 and &a + 1 start at the same address and end twenty bytes apart.',
      narration: 'Ampersand a is a pointer to the whole array, so ampersand a plus one jumps twenty bytes, past all of it.'
    },
    {
      id: 'sizeof-5', start: 136, end: 142, scene: 'sizeof',
      caption: 'Inside a function, an array parameter has already decayed, so sizeof gives 8, not 20.',
      detail: 'The parameter is declared int arr[10] but its type is int *. sizeof reports the pointer, and the 10 in the brackets is documentation only.',
      keyword: 'already decayed',
      trap: 'Writing int arr[10] in a parameter list does not pass the size. The length must be passed separately.',
      narration: 'Inside a function, an array parameter has already decayed, so sizeof gives eight, not twenty.'
    },

    /* ---- scene 7: precedence ---- */
    {
      id: 'precedence-1', start: 142, end: 147, scene: 'precedence',
      caption: 'The star and the increment can combine in four ways, and each means something different.',
      detail: 'Which one you wrote decides three things: the value produced, where p ends up, and what the array holds afterwards.',
      keyword: 'four ways',
      trap: 'These four appear in output questions because they look almost identical on paper.',
      narration: 'The star and the increment can combine in four ways, and each means something different.'
    },
    {
      id: 'precedence-2', start: 147, end: 154, scene: 'precedence',
      caption: '*p++ is *(p++): read the current cell, then move p forward.',
      detail: 'Postfix ++ binds tighter than unary *. It yields the old pointer value, and the increment happens as a side effect. So the read uses the old address.',
      keyword: 'read, then move',
      trap: '*p++ does not increment the value. It moves the pointer.',
      narration: 'Star p plus plus is star of p plus plus. Read the current cell, then move p forward.'
    },
    {
      id: 'precedence-3', start: 154, end: 161, scene: 'precedence',
      caption: '(*p)++ increments the cell and leaves p where it is.',
      detail: 'The brackets force the star to apply first, so the increment lands on the object p points at. The value of the expression is the old cell value.',
      keyword: 'increments the cell',
      trap: '(*p)++ and *p++ differ in which object is incremented. Brackets are the whole difference.',
      narration: 'Bracket star p bracket plus plus increments the cell, and leaves p where it is.'
    },
    {
      id: 'precedence-4', start: 161, end: 168, scene: 'precedence',
      caption: '++*p increments the cell before reading it; *++p moves first, then reads.',
      detail: 'Prefix ++ on the object gives the new value. Prefix ++ on the pointer moves first, so the read lands on the next cell.',
      keyword: 'before reading',
      trap: 'Prefix versus postfix changes the value produced, not only the timing of the side effect.',
      narration: 'Plus plus star p increments the cell before reading it. Star plus plus p moves first, then reads.'
    },
    {
      id: 'precedence-5', start: 168, end: 176, scene: 'precedence',
      caption: 'Postfix binds tighter than star. Brackets decide everything else.',
      detail: 'Read the expression by applying the tighter operator first, then the star. Where the ++ sits relative to p decides whether the pointer or the cell moves.',
      keyword: 'Postfix binds tighter',
      trap: 'If ++ is attached to p, the pointer moves. If it is attached to *p or to a bracketed (*p), the cell changes.',
      narration: 'Postfix binds tighter than star. Brackets decide everything else.'
    },

    /* ---- scene 8: double pointer ---- */
    {
      id: 'double-pointer-1', start: 176, end: 182, scene: 'double-pointer',
      caption: 'A pointer variable has an address too, so a pointer can point at it.',
      detail: 'p lives at some address and holds the address of x. Taking &p gives the address of the pointer itself.',
      keyword: 'an address too',
      trap: 'This is not a special construct. It is the same rule applied to an object that happens to be a pointer.',
      narration: 'A pointer variable has an address too, so a pointer can point at it.'
    },
    {
      id: 'double-pointer-2', start: 182, end: 189, scene: 'double-pointer',
      caption: 'int **pp = &p stores the address of p. **pp follows two arrows to reach 7.',
      detail: 'Read int **pp as: pp is a pointer, to a pointer, to an int. Each star in the expression removes one level.',
      keyword: 'two arrows',
      trap: '**pp is not the address of the address. It is the int at the end of the chain.',
      narration: 'int star star pp equals ampersand p stores the address of p. Star star pp follows two arrows to reach seven.'
    },
    {
      id: 'double-pointer-3', start: 189, end: 198, scene: 'double-pointer',
      caption: 'This is how a function changes the caller\'s pointer, not just the value it points at.',
      detail: 'To change a caller\'s int you pass int *. To change a caller\'s int * you must pass int **, because the thing being modified is itself a pointer.',
      keyword: 'changes the caller\'s pointer',
      trap: 'Passing int * lets you write to the int. It does not let you reassign the caller\'s pointer variable.',
      narration: 'This is how a function changes the caller\'s pointer, not just the value it points at.'
    },

    /* ---- scene 9: lifetime ---- */
    {
      id: 'lifetime-1', start: 198, end: 204, scene: 'lifetime',
      caption: 'A local variable lives only while its function is running.',
      detail: 'Its storage belongs to the call. When the call returns, the storage is released and reused by the next call.',
      keyword: 'only while its function is running',
      trap: 'Nothing in C stops you holding the address after the call ends. That is why this is a trap rather than an error message.',
      narration: 'A local variable lives only while its function is running.'
    },
    {
      id: 'lifetime-2', start: 204, end: 211, scene: 'lifetime',
      caption: 'Returning its address gives a pointer to a frame that no longer exists.',
      detail: 'The function returns a perfectly well-formed address. The object that address described has gone out of existence.',
      keyword: 'no longer exists',
      trap: 'The compiler may warn, and often does not. A warning is not the point; the behaviour is undefined either way.',
      narration: 'Returning its address gives a pointer to a frame that no longer exists.'
    },
    {
      id: 'lifetime-3', start: 211, end: 216, scene: 'lifetime',
      caption: 'The pointer still holds the number. The object is gone. That is a dangling pointer.',
      detail: 'The same thing happens after free(), or when a pointer outlives the block a variable was declared in.',
      keyword: 'dangling pointer',
      trap: 'A dangling pointer is not NULL. It holds a real address, so a NULL check will not catch it.',
      narration: 'The pointer still holds the number. The object is gone. That is a dangling pointer.'
    },
    {
      id: 'lifetime-4', start: 216, end: 222, scene: 'lifetime',
      caption: 'Reading or writing through it is undefined behaviour, not a predictable value.',
      detail: 'Undefined behaviour means the standard imposes no requirement at all. A "plausible" output from such a program is not an answer.',
      keyword: 'undefined behaviour',
      trap: 'A question whose program has undefined behaviour has no defined output. Saying so is the correct answer.',
      narration: 'Reading or writing through it is undefined behaviour, not a predictable value.'
    },

    /* ---- scene 10: rules ---- */
    {
      id: 'rules-1', start: 222, end: 228, scene: 'rules',
      caption: 'Rule one: p + k moves k elements, never k bytes.',
      detail: 'Scale by sizeof(*p). Subtract two pointers to get an element count, not a byte count.',
      keyword: 'k elements',
      trap: 'Every "what is the address" question is this rule, applied carefully.',
      narration: 'Rule one. p plus k moves k elements, never k bytes.'
    },
    {
      id: 'rules-2', start: 228, end: 234, scene: 'rules',
      caption: 'Rule two: a[i] is *(a + i), and the name decays except under sizeof and &.',
      detail: 'Three exceptions: the operand of sizeof, the operand of unary &, and a string literal initialising a char array.',
      keyword: 'except under sizeof and &',
      trap: 'Forgetting the exceptions is what makes sizeof(a) and &a + 1 come out wrong.',
      narration: 'Rule two. a i is star a plus i, and the name decays except under sizeof and ampersand.'
    },
    {
      id: 'rules-3', start: 234, end: 240, scene: 'rules',
      caption: 'Rule three: sizeof reports the object\'s size; a pointer reports only its own.',
      detail: 'And once an array is a parameter, it is a pointer. Carry the length separately, or it is gone.',
      keyword: 'only its own',
      trap: 'sizeof(pointer) is a constant for the machine. It never varies with what the pointer points at.',
      narration: 'Rule three. sizeof reports the object\'s size, and a pointer reports only its own.'
    }
  ]
};
