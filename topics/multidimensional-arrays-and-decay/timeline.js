/* ==========================================================================
   multidimensional-arrays-and-decay — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   captions.vtt, captions.srt and transcript.md are derived from this file by
   tools/gen-captions.mjs — never edited by hand.

   Every number quoted in a caption is produced by the array model in lesson.js,
   which builds the declared type, the decayed types, the strides and the byte
   image of int a[3][4] and checks them against each other at load.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'lie', n: 1,
      title: 'One sizeof decides the argument',
      start: 0, end: 30,
      objective: 'Settle the question the rest of the lesson depends on: is a two-dimensional array a pointer? Three sizeof answers say no.'
    },
    {
      id: 'nest', n: 2,
      title: 'An array whose elements are arrays',
      start: 30, end: 60,
      objective: 'Read the declarator int a[3][4] as array of 3 arrays of 4 ints, and see the nesting as three complete rows inside one block.'
    },
    {
      id: 'decay', n: 3,
      title: 'What a becomes inside an expression',
      start: 60, end: 90,
      objective: 'Apply the array-to-pointer rule at each of the three levels and name the resulting type exactly, including the three places where no conversion happens.'
    },
    {
      id: 'stride', n: 4,
      title: 'One address, three types',
      start: 90, end: 120,
      objective: 'Separate an address from the type that carries it: a, &a[0] and &a all hold 1000, and adding 1 moves 16, 16 and 48 bytes.'
    },
    {
      id: 'deref', n: 5,
      title: 'a[i][j] is two dereferences',
      start: 120, end: 150,
      objective: 'Expand the subscript twice and check all twelve cells: the spelled-out form and the indexed form land on the same byte.'
    },
    {
      id: 'bad', n: 6,
      title: 'Why int ** cannot be passed',
      start: 150, end: 180,
      objective: 'Read the same 48 bytes through an int ** and see a number that is not an address of anything, which is why the compiler rejects the call and a cast makes it undefined behaviour.'
    },
    {
      id: 'param', n: 7,
      title: 'The parameter rule',
      start: 180, end: 210,
      objective: 'Turn a parameter declaration into its pointer form, see which dimensions survive, and know why int a[][] does not compile while int a[][4] does.'
    },
    {
      id: 'vs', n: 8,
      title: 'Pointer to array against array of pointers',
      start: 210, end: 240,
      objective: 'Tell int (*p)[4] from int *q[4] by sizeof and by stride, and place the ragged int *rows[3] on the correct side of the line.'
    },
    {
      id: 'arith', n: 9,
      title: 'Address arithmetic under exam conditions',
      start: 240, end: 270,
      objective: 'Compute a cell address in row-major and column-major order, then run the same formula backwards to recover a base address from two given cells.'
    },
    {
      id: 'routine', n: 10,
      title: 'The routine and the five traps',
      start: 270, end: 300,
      objective: 'Leave with a four-step routine that answers any of these questions, and the five answers that look right and are not.'
    }
  ],

  events: [

    /* ---------- scene 1: lie ---------- */
    { id: 'l-1', scene: 'lie', start: 0, end: 7.5,
      caption: 'int a[3][4] holds twelve ints in one block. If a were a pointer to a pointer, sizeof(a) would be the size of one pointer.',
      detail: 'Twelve ints of four bytes each occupy forty-eight bytes, and they occupy them as one contiguous object with no gaps. A pointer is one word. Those are different shapes, so the first question is simply which one a is.',
      narration: 'An int a[3][4] holds twelve ints in one block. If a were a pointer to a pointer, sizeof a would be the size of one pointer.',
      keyword: 'sizeof(a) would be the size of one pointer' },

    { id: 'l-2', scene: 'lie', start: 7.5, end: 15,
      caption: 'sizeof a is 48, sizeof a[0] is 16, sizeof a[0][0] is 4. Three levels, three sizes, all measured.',
      detail: 'Forty-eight is three times sixteen, and sixteen is four times four. Each level is the whole of the level below it multiplied out, which is what containment looks like in numbers.',
      narration: 'sizeof a is forty-eight. sizeof a[0] is sixteen. sizeof a[0][0] is four.',
      keyword: '48, 16, 4',
      trap: 'A student who expects sizeof(a) to be 8 has already decided a is a pointer. The number is the test, and it is 48.' },

    { id: 'l-3', scene: 'lie', start: 15, end: 22.5,
      caption: 'A pointer is one word. On this page a pointer is 8 bytes, so 48 against 8 is not a rounding difference.',
      detail: 'The lesson uses 8-byte pointers and 4-byte ints throughout, which is one common 64-bit arrangement. The conclusions do not depend on those two numbers; only the arithmetic does.',
      narration: 'A pointer is one word. On this page a pointer is eight bytes, so forty-eight against eight is not a rounding difference.',
      keyword: 'not a rounding difference' },

    { id: 'l-4', scene: 'lie', start: 22.5, end: 30,
      caption: 'So a is an object of 48 bytes. Everything else in this lesson is that sentence, applied carefully.',
      detail: 'The whole lesson is one consequence: an array expression converts to a pointer to its first element, and the first element here is a row, not an int. Hold that and the rest follows.',
      narration: 'So a is an object of forty-eight bytes. Everything else in this lesson is that sentence, applied carefully.',
      keyword: 'an object of 48 bytes' },

    /* ---------- scene 2: nest ---------- */
    { id: 'n-1', scene: 'nest', start: 30, end: 37.5,
      caption: 'Read the declarator from the name outwards: a is an array of 3 things, each of which is an array of 4 ints.',
      detail: 'The brackets bind tighter than the base type. a[3][4] means (a[3])[4]: first an array of three, then each of those is an array of four. The type is written int[3][4], and the outer dimension is the first one written.',
      narration: 'Read the declarator from the name outwards. a is an array of three things, each of which is an array of four ints.',
      keyword: 'an array of 3 things' },

    { id: 'n-2', scene: 'nest', start: 37.5, end: 45,
      caption: 'So a[0], a[1] and a[2] are not ints. Each is a complete int[4], sixteen bytes, and each is a legal array in its own right.',
      detail: 'a[0] has type int[4]. You can take sizeof of it, take its address, and pass it to anything expecting an int array of four. It is not an element of an array of ints; it is an array that happens to be an element.',
      narration: 'So a[0], a[1] and a[2] are not ints. Each is a complete int array of four, sixteen bytes, and each is a legal array in its own right.',
      keyword: 'not ints' },

    { id: 'n-3', scene: 'nest', start: 45, end: 52.5,
      caption: 'The twelve ints are laid out row by row in one block: 1000 to 1047, with a[2][3] the last at 1044.',
      detail: 'Row-major is not a convention the standard offers a choice about: the elements of an array are contiguous, so the three rows must follow each other. The last row starts at 1032 and its last int sits at 1044, four bytes before the end of the object.',
      narration: 'The twelve ints are laid out row by row in one block: a thousand to a thousand and forty-seven, with the last cell at a thousand and forty-four.',
      keyword: 'one block' },

    { id: 'n-4', scene: 'nest', start: 52.5, end: 60,
      caption: 'No row pointer is stored anywhere. The geometry is in the type, not in memory.',
      detail: 'There is no table of three row pointers in front of the data. The compiler knows where row i starts because it knows the row is sixteen bytes wide. That single fact is why an int ** cannot stand in for this object.',
      narration: 'No row pointer is stored anywhere. The geometry is in the type, not in memory.',
      keyword: 'the geometry is in the type' },

    /* ---------- scene 3: decay ---------- */
    { id: 'd-1', scene: 'decay', start: 60, end: 67.5,
      caption: 'In an expression an array becomes a pointer to its first element. The first element of a is a[0], an int[4].',
      detail: 'The conversion is stated in the standard as: an expression of type array of type becomes an expression of type pointer to type, pointing at the initial element. The type that fills the blank is the element type, and here the element type is int[4], not int.',
      narration: 'In an expression an array becomes a pointer to its first element. The first element of a is a[0], which is an int array of four.',
      keyword: 'pointer to its first element' },

    { id: 'd-2', scene: 'decay', start: 67.5, end: 75,
      caption: 'So a decays to int (*)[4]: a pointer to an array of four ints. That is read "pointer to", not "array of pointers".',
      detail: 'The parentheses are the whole difference. int (*p)[4] is one pointer whose target is an array of four. int *p[4] is an array of four pointers. Both are legal; they are not the same type and they do not behave alike.',
      narration: 'So a decays to a pointer to an array of four ints. That is read pointer to, not array of pointers.',
      keyword: 'pointer to an array of four ints',
      trap: 'int (*)[4] and int *[4] differ only in where the parentheses sit, and the two types differ by 8 bytes against 32 in sizeof.' },

    { id: 'd-3', scene: 'decay', start: 75, end: 82.5,
      caption: 'One level down: a[0] is an int[4], so it decays to int *. Two levels down: a[0][0] is an int, and an int does not decay.',
      detail: 'The rule applies once per expression, at whatever level you are standing. a gives a pointer to a row, a[0] gives a pointer to an int, and a[0][0] is simply a value. This is why the two subscripts produce two different pointer types on the way in.',
      narration: 'One level down, a[0] is an int array of four, so it decays to a pointer to int. Two levels down, a[0][0] is an int, and an int does not decay.',
      keyword: 'an int does not decay' },

    { id: 'd-4', scene: 'decay', start: 82.5, end: 90,
      caption: 'Three places where no conversion happens: the operand of sizeof, the operand of unary &, and a string literal initialising an array.',
      detail: 'Those three exceptions are why sizeof a is 48 rather than 8, and why &a is a pointer to the whole object rather than a pointer to a pointer. Every other appearance of a bare array name converts.',
      narration: 'Three places where no conversion happens: the operand of sizeof, the operand of unary address-of, and a string literal initialising an array.',
      keyword: 'no conversion happens' },

    /* ---------- scene 4: stride ---------- */
    { id: 's-1', scene: 'stride', start: 90, end: 97.5,
      caption: 'a, &a[0] and &a all hold the number 1000. Three expressions, one address, three different types.',
      detail: 'The address of an object and the address of its first byte are the same byte. What differs is the type, and the type is what the compiler uses to scale arithmetic. So the interesting question is never what the number is, but what +1 does to it.',
      narration: 'a, and a-zero, and a, all hold the number one thousand. Three expressions, one address, three different types.',
      keyword: 'one address, three types' },

    { id: 's-2', scene: 'stride', start: 97.5, end: 105,
      caption: 'a + 1 is 1016: one row of sixteen bytes. a[0] + 1 is 1004: one int. &a + 1 is 1048: the whole object.',
      detail: 'Pointer arithmetic is scaled by the size of the pointed-to type. A pointer to int[4] moves sixteen bytes; a pointer to int moves four; a pointer to int[3][4] moves forty-eight and lands one past the end of the object.',
      narration: 'a plus one is one thousand and sixteen, one row of sixteen bytes. a-zero plus one is one thousand and four, one int. And a plus one is one thousand and forty-eight, the whole object.',
      keyword: 'scaled by the size of the pointed-to type',
      trap: 'Two expressions can print the same address and still disagree about where +1 goes. Comparing addresses tells you nothing about types.' },

    { id: 's-3', scene: 'stride', start: 105, end: 112.5,
      caption: 'The general form: a + i moves i times 16, and *(a + i) is the row itself, which then decays to int *.',
      detail: 'This is the only scaling rule in the lesson. Everything that follows is that rule applied twice: once to reach a row, once to reach an int inside it. Write it as i times the row width, not as i rows, and the arithmetic stays honest.',
      narration: 'The general form: a plus i moves i times sixteen bytes, and the dereference gives the row itself, which then decays to a pointer to int.',
      keyword: 'moves i times 16' },

    { id: 's-4', scene: 'stride', start: 112.5, end: 120,
      caption: '&a + 1 is one past the end of the whole object. Forming it is legal; dereferencing it is not.',
      detail: 'A pointer one past the end may be formed and compared, but it points at no object, so dereferencing it is undefined behaviour. The same rule already governs a one-past-the-end pointer on a one-dimensional array; the two-dimensional case simply has a bigger step.',
      narration: 'The address-of-a plus one is one past the end of the whole object. Forming it is legal; dereferencing it is not.',
      keyword: 'one past the end' },

    /* ---------- scene 5: deref ---------- */
    { id: 'f-1', scene: 'deref', start: 120, end: 127.5,
      caption: 'The standard defines E1[E2] as *((E1) + (E2)). So a[i][j] is *(*(a + i) + j), and nothing else.',
      detail: 'Subscripting is not a separate operation with its own rules; it is defined in terms of addition and dereference. That definition is why the two spellings can never disagree, and it is the tool that makes a two-dimensional expression readable.',
      narration: 'The standard defines a bracket b as star, a plus b. So a i j is star star a plus i plus j, and nothing else.',
      keyword: 'defined as *((E1) + (E2))' },

    { id: 'f-2', scene: 'deref', start: 127.5, end: 135,
      caption: 'First expansion: *(a + i) is row i. It has type int[4], so in this expression it decays again, to int *.',
      detail: 'The inner dereference produces an array, and an array in an expression converts. This is the step students skip, and skipping it is what makes the second dereference look like it needs a second stored pointer.',
      narration: 'First expansion: star a plus i is row i. It has type int array of four, so in this expression it decays again, to a pointer to int.',
      keyword: 'it decays again' },

    { id: 'f-3', scene: 'deref', start: 135, end: 142.5,
      caption: 'Second expansion: adding j moves j ints, and the final dereference is the value. Checked on all twelve cells: both spellings give the same byte.',
      detail: 'For every pair i, j in this 3 by 4 array the address computed as base plus (i times 4 plus j) times 4 equals the address computed by the two-step pointer walk. Twelve cells, twelve agreements, checked at load rather than asserted.',
      narration: 'Second expansion: adding j moves j ints, and the final dereference is the value. Checked on all twelve cells, both spellings give the same byte.',
      keyword: 'both spellings give the same byte' },

    { id: 'f-4', scene: 'deref', start: 142.5, end: 150,
      caption: 'The row-major formula falls out of the type: base + (i * C + j) * w, with C the number of columns, not the number of rows.',
      detail: 'C appears because moving down one row means stepping over a whole row of C ints. Writing R there is the single most common arithmetic slip in this topic, and it is a type error in disguise: R is not the size of anything a pointer to a row steps over.',
      narration: 'The row-major formula falls out of the type: base plus, i times C plus j, times the width. C is the number of columns, not the number of rows.',
      keyword: 'C the number of columns',
      trap: 'Using the row count where the column count belongs. The two are equal in a square array, which is exactly why the mistake survives practice.' },

    /* ---------- scene 6: bad ---------- */
    { id: 'b-1', scene: 'bad', start: 150, end: 157.5,
      caption: 'Now read the same 48 bytes as an int **. The first eight bytes are a[0][0] and a[0][1], which are the integers 1000 and 1004.',
      detail: 'An int ** says: at this address there is a pointer, and at the address that pointer holds there is an int. Nothing in the array is arranged that way, so the first thing the machine reads is two integers fused into one 64-bit value.',
      narration: 'Now read the same forty-eight bytes as a pointer to a pointer. The first eight bytes are the integers one thousand and one thousand and four.',
      keyword: 'two integers fused into one 64-bit value' },

    { id: 'b-2', scene: 'bad', start: 157.5, end: 165,
      caption: 'On a little-endian 64-bit machine that pair reads as 0x000003ec000003e8 — a number, but not the address of anything in this program.',
      detail: 'The value is 4,312,147,166,184 in decimal. Dereferencing it is undefined behaviour, and in practice it is a segmentation fault. Nothing about the program said this was intended, which is why the standard calls it undefined rather than merely wrong.',
      narration: 'That pair reads as a number, but not the address of anything in this program. Dereferencing it is undefined behaviour.',
      keyword: 'not the address of anything' },

    { id: 'b-3', scene: 'bad', start: 165, end: 172.5,
      caption: 'The compiler rejects int ** p = a; because the types differ. A cast silences the compiler and changes nothing about the bytes.',
      detail: 'A diagnostic is a gift here. Assigning a to an int ** without a cast is a constraint violation, so a conforming implementation must say something. With a cast the program compiles and the behaviour becomes undefined, which is strictly worse than a warning.',
      narration: 'The compiler rejects the assignment because the types differ. A cast silences the compiler and changes nothing about the bytes.',
      keyword: 'a cast changes nothing about the bytes',
      trap: 'Adding a cast to make a diagnostic go away. The diagnostic was the only thing standing between the program and undefined behaviour.' },

    { id: 'b-4', scene: 'bad', start: 172.5, end: 180,
      caption: 'What would make int ** correct: an actual array of pointers, filled with real addresses. That is a different object with different contents.',
      detail: 'An int *rows[3] whose three elements point at three separately allocated int arrays is a genuine two-level structure, and an int ** may point at it. The difference is not the syntax but whether the pointers are stored.',
      narration: 'What would make the pointer-to-pointer correct: an actual array of pointers, filled with real addresses. That is a different object with different contents.',
      keyword: 'a different object' },

    /* ---------- scene 7: param ---------- */
    { id: 'p-1', scene: 'param', start: 180, end: 187.5,
      caption: 'A parameter declared as an array is adjusted to a pointer to its element type. int a[3][4] becomes int (*a)[4].',
      detail: 'The adjustment is stated in the standard and happens before any other analysis of the declaration. It is why a function cannot receive an array by value, and why sizeof a parameter is the size of a pointer even when the brackets are still written.',
      narration: 'A parameter declared as an array is adjusted to a pointer to its element type. An int a three by four becomes a pointer to an array of four.',
      keyword: 'adjusted to a pointer to its element type' },

    { id: 'p-2', scene: 'param', start: 187.5, end: 195,
      caption: 'Only the outermost dimension is discarded. The inner ones must survive, because they are the row width the arithmetic needs.',
      detail: 'The adjustment removes the first bracket and nothing else. What remains is the element type, int[4], and the function needs its size to compute any address inside the array. Discard the inner dimension too and the type becomes int *, which steps four bytes instead of sixteen.',
      narration: 'Only the outermost dimension is discarded. The inner ones must survive, because they are the row width the arithmetic needs.',
      keyword: 'only the outermost dimension' },

    { id: 'p-3', scene: 'param', start: 195, end: 202.5,
      caption: 'So int a[3][4], int a[100][4] and int a[][4] are three spellings of one parameter type. The 3 and the 100 mean nothing.',
      detail: 'All three adjust to int (*)[4], so all three declare the same function and a program may not define two of them as different functions. The first dimension in a parameter is documentation for the reader, not information for the compiler.',
      narration: 'So three by four, a hundred by four, and unspecified by four are three spellings of one parameter type. The three and the hundred mean nothing.',
      keyword: 'three spellings of one parameter type' },

    { id: 'p-4', scene: 'param', start: 202.5, end: 210,
      caption: 'But int a[][] does not compile: it would be an array whose elements are incomplete arrays, and an element type may not be incomplete.',
      detail: 'The adjustment happens after the declaration is analysed, so the declaration itself must be well formed first. int a[][] declares an array of arrays of int with no size, and an array element must be a complete type. int (*a)[] is legal, because a pointer may point at an incomplete type as long as no arithmetic is done through it.',
      narration: 'But an empty by empty parameter does not compile, because it would be an array whose elements are incomplete arrays, and an element type may not be incomplete.',
      keyword: 'an element type may not be incomplete',
      trap: 'Believing that every dimension of a parameter is optional. Exactly one is, and it is the first.' },

    /* ---------- scene 8: vs ---------- */
    { id: 'v-1', scene: 'vs', start: 210, end: 217.5,
      caption: 'One asterisk, two types. int (*p)[4] is a pointer to an array of four. int *q[4] is an array of four pointers.',
      detail: 'The brackets bind tighter than the asterisk, so (*p)[4] forces the pointer first and then applies the array to its target, while *q[4] applies the array to q first and then each element is a pointer. This is the declarator rule doing real work.',
      narration: 'One asterisk, two types. A parenthesised pointer to an array of four, against an array of four pointers.',
      keyword: 'one asterisk, two types' },

    { id: 'v-2', scene: 'vs', start: 217.5, end: 225,
      caption: 'sizeof tells them apart at once: 8 for the pointer, 32 for the array of four pointers. And p + 1 moves 16 bytes against q + 1 at 8.',
      detail: 'Both numbers follow from the types: one pointer is one word, four pointers are four words, a pointer to an array of four ints steps sixteen bytes, and a pointer to int steps eight on a machine with eight-byte pointers.',
      narration: 'sizeof tells them apart at once: eight for the pointer, thirty-two for the array of four pointers. And plus one moves sixteen bytes against eight.',
      keyword: '8 against 32' },

    { id: 'v-3', scene: 'vs', start: 225, end: 232.5,
      caption: 'The ragged array int *rows[3] is the array-of-pointers side: three pointers, each free to aim at a row of a different length.',
      detail: 'A ragged table is the one case where the two-level structure is genuinely needed, because rows of different lengths cannot be one contiguous block of equal rows. Note what is lost: the row width is no longer in the type, so every function needs the lengths passed separately.',
      narration: 'The ragged array of three row pointers is on the array-of-pointers side: three pointers, each free to aim at a row of a different length.',
      keyword: 'free to aim at a row of a different length' },

    { id: 'v-4', scene: 'vs', start: 232.5, end: 240,
      caption: 'And rows, being an array, decays to int ** — which is why int ** is right for ragged tables and wrong for int a[3][4].',
      detail: 'This is the resolution of the whole confusion. int ** is a legitimate type; it is simply the type of a different object. The same source line can be correct for a ragged table and undefined for a rectangular one, and only the declaration of what was passed tells you which.',
      narration: 'And rows, being an array, decays to a pointer to a pointer. Which is why that type is right for ragged tables and wrong for a rectangular array.',
      keyword: 'right for ragged tables and wrong for a rectangular array' },

    /* ---------- scene 9: arith ---------- */
    { id: 'a-1', scene: 'arith', start: 240, end: 247.5,
      caption: 'Question shape one: int a[5][6], base 1000, four bytes each, row-major. Address of a[3][4] is 1000 + (3*6 + 4)*4 = 1088.',
      detail: 'Do it in three steps: the row index times the column count gives the number of whole rows passed, adding the column index gives the element index, and multiplying by the width gives the byte offset. Eighteen plus four is twenty-two elements, eighty-eight bytes.',
      narration: 'Question shape one: an array of five rows of six, base one thousand, four bytes each, row-major. The address is one thousand and eighty-eight.',
      keyword: '1088' },

    { id: 'a-2', scene: 'arith', start: 247.5, end: 255,
      caption: 'Column-major swaps the roles: 1000 + (4*5 + 3)*4 = 1092. Same array, same cell, four bytes apart.',
      detail: 'Column-major steps down a column before moving across, so the multiplier is the number of rows. The two orders agree on every cell only when one of the dimensions is 1, which is worth checking on a shape you can hold in your head.',
      narration: 'Column-major swaps the roles: one thousand and ninety-two. Same array, same cell, four bytes apart.',
      keyword: '1092',
      trap: 'Assuming C is column-major. A declared C array is row-major because its elements must be contiguous; column-major appears in these questions as a hypothetical.' },

    { id: 'a-3', scene: 'arith', start: 255, end: 262.5,
      caption: 'Question shape two runs backwards: given a[2][3] at 1112 and a[3][1] at 1124 on int a[4][5], the gap is 3 elements, and the base is 1060.',
      detail: 'The difference in bytes divided by the width gives the element gap. Then the row difference times the column count plus the column difference must equal that gap, which fixes the column count if it was unknown. With the base recovered, any other cell can be predicted and checked against the given one.',
      narration: 'Question shape two runs backwards: two given cells, a gap of three elements, and a base of one thousand and sixty.',
      keyword: 'the base is 1060' },

    { id: 'a-4', scene: 'arith', start: 262.5, end: 270,
      caption: 'The check that costs nothing: recompute the second given cell from the recovered base. If it does not come back, the base is wrong.',
      detail: 'Back-solving has one failure mode: an arithmetic slip that still produces a plausible number. Recomputing a cell the question already gave you is the cheapest possible guard, and it takes one multiplication.',
      narration: 'The check that costs nothing: recompute the second given cell from the recovered base. If it does not come back, the base is wrong.',
      keyword: 'recompute the second given cell' },

    /* ---------- scene 10: routine ---------- */
    { id: 'r-1', scene: 'routine', start: 270, end: 277.5,
      caption: 'Step 1: name the object. Write the type out as array of ... of T before you do anything else.',
      detail: 'Naming the object settles sizeof, decay and the parameter question at once, because all three are read off the type. If you cannot say the type in words, no amount of arithmetic will save the answer.',
      narration: 'Step one: name the object. Write the type out as array of, of T, before you do anything else.',
      keyword: 'write the type out' },

    { id: 'r-2', scene: 'routine', start: 277.5, end: 285,
      caption: 'Step 2: ask what the expression has become. Pointer to the element type — and the element type is one level in, not T.',
      detail: 'Decay happens once, at the level you are standing on. Standing on a you get a pointer to a row; standing on a[0] you get a pointer to an int. Say which one out loud before computing a stride.',
      narration: 'Step two: ask what the expression has become. Pointer to the element type, and the element type is one level in, not T.',
      keyword: 'one level in' },

    { id: 'r-3', scene: 'routine', start: 285, end: 292.5,
      caption: 'Step 3: scale by the pointed-to type, then add. Row width for a pointer to a row, element width for a pointer to an element.',
      detail: 'Every stride question is this step. A pointer to int[4] moves sixteen; a pointer to int moves four; a pointer to int[3][4] moves forty-eight. There is no other rule.',
      narration: 'Step three: scale by the pointed-to type, then add. Row width for a pointer to a row, element width for a pointer to an element.',
      keyword: 'scale by the pointed-to type' },

    { id: 'r-4', scene: 'routine', start: 292.5, end: 300,
      caption: 'Step 4: check the type of the answer. If a question asks for bytes, say bytes; if it asks for an element index, do not multiply by the width.',
      detail: 'The five traps: treating a as a pointer, writing R where C belongs, reading int (*)[4] as an array of pointers, thinking every parameter dimension is optional, and casting to silence the compiler. All five are the same mistake in different clothes: reading the type carelessly.',
      narration: 'Step four: check the type of the answer. Bytes against element index is the last place these questions go wrong.',
      keyword: 'bytes against element index',
      trap: 'Reporting an element index when the question asked for an address, or the reverse. The arithmetic can be perfect and the answer still wrong.' }
  ]
};
