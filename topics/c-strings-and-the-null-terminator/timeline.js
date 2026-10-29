/* ==========================================================================
   c-strings-and-the-null-terminator — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs — never edited by hand.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'bytes',
      n: 1,
      title: 'A string is bytes up to the first zero',
      start: 0, end: 30,
      objective: 'See a string as a byte array plus a terminator, and see every string function stop at that zero.'
    },
    {
      id: 'literal-array',
      n: 2,
      title: 'Literal and array: the same five bytes, two different objects',
      start: 30, end: 60,
      objective: 'Separate char *s = "GATE" from char t[] = "GATE" on writability, on sizeof, and on assignability.'
    },
    {
      id: 'sizeof-strlen',
      n: 3,
      title: 'sizeof against strlen',
      start: 60, end: 92,
      objective: 'Read sizeof as a compile-time size of the object and strlen as a run-time count of bytes before the zero.'
    },
    {
      id: 'sizing',
      n: 4,
      title: 'What fits: a bigger array, an exact array, one byte short',
      start: 92, end: 122,
      objective: 'Predict the padding of char t[10] = "GATE" and the lost terminator of char c[4] = "GATE".'
    },
    {
      id: 'escapes',
      n: 5,
      title: 'Escapes are one byte each',
      start: 122, end: 152,
      objective: 'Count the bytes of a literal with escapes and adjacent-literal concatenation.'
    },
    {
      id: 'unsigned',
      n: 6,
      title: 'strlen returns size_t, which is unsigned',
      start: 152, end: 184,
      objective: 'Show why strlen(s) - strlen(t) is never negative, and why i >= 0 with strlen is always true.'
    },
    {
      id: 'pointer-arith',
      n: 7,
      title: '2[p] is p[2]: the 2017 arithmetic',
      start: 184, end: 214,
      objective: 'Trace GATE 2017 Set 2 Q55 as character arithmetic on a literal, and land on index 10.'
    },
    {
      id: 'copy',
      n: 8,
      title: 'A copy is not a copy until the zero is written',
      start: 214, end: 248,
      objective: 'Run GATE 2025 Set 2 Q9 byte by byte and see the leftover characters survive.'
    },
    {
      id: 'two-d',
      n: 9,
      title: 'Arrays of strings: a grid of bytes against an array of pointers',
      start: 248, end: 276,
      objective: 'Distinguish char names[3][8] from char *names[3] by stride, by sizeof and by what may be stored.'
    },
    {
      id: 'rules',
      n: 10,
      title: 'The four-step procedure and the five traps',
      start: 276, end: 300,
      objective: 'Fix the order of operations that answers any string question on the paper.'
    }
  ],

  events: [
    /* ---- scene 1: bytes ---- */
    {
      id: 'bytes-1', start: 0, end: 8, scene: 'bytes',
      caption: 'C has no string type. A string is a run of char objects ending at the first byte of value zero.',
      detail: 'The standard defines a string as a contiguous sequence of characters terminated by and including the first null character. The null character is the byte whose value is zero, written \'\\0\'.',
      keyword: 'no string type',
      trap: 'The terminator is a byte, not a symbol. It occupies memory, and it is counted by sizeof and not by strlen.',
      narration: 'C has no string type. A string is a run of char objects that ends at the first byte of value zero.'
    },
    {
      id: 'bytes-2', start: 8, end: 16, scene: 'bytes',
      caption: 'The literal "GATE" is five bytes: G, A, T, E, and the zero.',
      detail: 'Four characters of content plus one terminator. The array the compiler builds is of length just sufficient to hold the sequence and its terminator, so its length is five.',
      keyword: 'five bytes',
      trap: 'A four-letter word is five bytes. Every "how many bytes" question turns on this one addition.',
      narration: 'The literal G A T E is five bytes: four letters and the zero.'
    },
    {
      id: 'bytes-3', start: 16, end: 24, scene: 'bytes',
      caption: 'printf with %s copies bytes until it meets the zero. It has no other way to know the length.',
      detail: 'No length travels with the characters. The only signal is the zero byte, which is why a char array without one is not a string and why printing it reads whatever follows in memory.',
      keyword: 'no other way',
      trap: 'A char array with no terminator is a legal object and an illegal string. Passing it to %s reads past the array.',
      narration: 'Printing a string copies bytes until it meets the zero. That is the only length signal there is.'
    },
    {
      id: 'bytes-4', start: 24, end: 30, scene: 'bytes',
      caption: 'So two numbers describe every string: bytes stored, and bytes before the zero.',
      detail: 'sizeof answers the first and strlen answers the second, and for a literal initialising an array with no size written, they differ by exactly one.',
      keyword: 'two numbers',
      trap: 'The two numbers are equal for a pointer and unequal for an array. That asymmetry is the whole topic.',
      narration: 'Two numbers describe every string: the bytes stored, and the bytes before the zero.'
    },

    /* ---- scene 2: literal against array ---- */
    {
      id: 'lit-1', start: 30, end: 38, scene: 'literal-array',
      caption: 'char *s = "GATE" stores a pointer. The five bytes live somewhere else, with static storage duration.',
      detail: 'The literal initialises an unnamed array of static storage duration. s holds the address of its first byte. The array outlives every function call, so returning s from a function is safe.',
      keyword: 'a pointer',
      trap: 'The array is not on the stack. Returning a pointer to a literal is legal; returning a pointer to a local array is not.',
      narration: 'char star s equals a literal stores a pointer. The five bytes live elsewhere, for the life of the program.'
    },
    {
      id: 'lit-2', start: 38, end: 46, scene: 'literal-array',
      caption: 'char t[] = "GATE" stores a copy of the five bytes in t itself, and t is an array.',
      detail: 'An array of character type may be initialised by a string literal; successive bytes of the literal, including the terminating null if there is room, initialise the elements. A local t is an ordinary automatic array you may write to.',
      keyword: 'a copy',
      trap: 'The copy is what makes t[0] = \'g\' defined and s[0] = \'g\' undefined.',
      narration: 'char t open bracket close bracket equals a literal stores a copy in t itself. t is an array you may write to.'
    },
    {
      id: 'lit-3', start: 46, end: 54, scene: 'literal-array',
      caption: 'Writing through s is undefined behaviour. The standard says a program that modifies that array has undefined behaviour.',
      detail: 'It is unspecified whether identical literals share one array, so two literals with the same text may or may not have the same address. Both facts come from the same paragraph of the standard.',
      keyword: 'undefined behaviour',
      trap: 'Undefined is not "prints the old character". The program may work, crash, or print something else; none of those is the answer.',
      narration: 'Writing through s is undefined behaviour. The literal may sit in memory the program may not write.'
    },
    {
      id: 'lit-4', start: 54, end: 60, scene: 'literal-array',
      caption: 'Three differences follow: t is writable, sizeof(t) is five, and t cannot be reassigned.',
      detail: 'sizeof(s) is the size of a pointer, not of the text. t = "OTHER"; is a compile-time error because an array name is not a modifiable lvalue, while s = "OTHER"; is a legal pointer assignment.',
      keyword: 'three differences',
      trap: 'The exam asks for sizeof and for the effect of a write. Both are decided by this one distinction.',
      narration: 'Three differences follow: t is writable, sizeof of t is five, and t cannot be reassigned.'
    },

    /* ---- scene 3: sizeof against strlen ---- */
    {
      id: 'ss-1', start: 60, end: 68, scene: 'sizeof-strlen',
      caption: 'sizeof is answered by the compiler from the declared type. strlen is answered at run time by counting.',
      detail: 'sizeof is an operator, not a function, and its result is a constant of type size_t for a fixed type. strlen is a library function that walks the bytes.',
      keyword: 'compiler against run time',
      trap: 'sizeof never looks inside a string. It reports the object it is given, so it cannot see an embedded zero.',
      narration: 'sizeof is answered by the compiler from the type. strlen is answered at run time by counting bytes.'
    },
    {
      id: 'ss-2', start: 68, end: 76, scene: 'sizeof-strlen',
      caption: 'For char a[] = "GATE", sizeof is 5 and strlen is 4. The difference is the terminator.',
      detail: 'The array has no size written, so the compiler makes it exactly big enough: four characters and the null.',
      keyword: 'the terminator',
      trap: 'For a pointer the two numbers are not one apart: sizeof(p) is the pointer width and strlen(p) is the text length.',
      narration: 'For an array with no size written, sizeof is five and strlen is four. The difference is the terminator.'
    },
    {
      id: 'ss-3', start: 76, end: 84, scene: 'sizeof-strlen',
      caption: 'sizeof counts bytes that are not there yet; strlen stops at the first zero.',
      detail: 'char b[10] = "GATE" reports sizeof 10 and strlen 4, because the remaining five bytes are zero-filled by the initialisation and strlen stops at the first of them.',
      keyword: 'stops at the first zero',
      trap: 'An embedded zero truncates the string but not the array: "GA\\0TE" has sizeof 6 and strlen 2.',
      narration: 'sizeof counts the bytes the array has; strlen stops at the first zero.'
    },
    {
      id: 'ss-4', start: 84, end: 92, scene: 'sizeof-strlen',
      caption: 'An array passed to a function is a pointer, so sizeof inside that function reports the pointer.',
      detail: 'The parameter char t[] in a function header is adjusted to char *t. sizeof(t) is then the pointer width, and the length must be passed separately.',
      keyword: 'a pointer',
      trap: 'This is why a function cannot recover an array length with sizeof. It is the same rule as the literal-against-array distinction.',
      narration: 'An array passed to a function arrives as a pointer, so sizeof there reports the pointer.'
    },

    /* ---- scene 4: sizing ---- */
    {
      id: 'size-1', start: 92, end: 100, scene: 'sizing',
      caption: 'char t[10] = "GATE" gives ten bytes: five used, five zero-filled.',
      detail: 'An initialiser shorter than the array leaves the remaining elements zero, so the array is a well-formed string with plenty of spare room.',
      keyword: 'zero-filled',
      trap: 'The spare room is not free for strcat unless you count it: appending needs strlen plus the new text plus one.',
      narration: 'char t ten equals G A T E gives ten bytes: five used and five zero-filled.'
    },
    {
      id: 'size-2', start: 100, end: 108, scene: 'sizing',
      caption: 'char c[4] = "GATE" gives four bytes and no zero. c is a char array, not a string.',
      detail: 'The initialisation rule fills elements with the literal including its terminating null if there is room. With four bytes and five needed, the terminator is the byte that does not fit.',
      keyword: 'no zero',
      trap: 'strlen(c) is then undefined: it reads past the array looking for a zero. The declaration is legal; using it as a string is not.',
      narration: 'char c four equals G A T E gives four bytes and no zero. c is an array, not a string.'
    },
    {
      id: 'size-3', start: 108, end: 116, scene: 'sizing',
      caption: 'Brace initialisation is the other way in, and it adds no terminator of its own.',
      detail: 'char e[] = {\'G\',\'A\',\'T\',\'E\'}; has sizeof 4 and is not a string. Adding the explicit \'\\0\' makes it sizeof 5 and a string. This is the one place you must write the zero yourself.',
      keyword: 'no terminator of its own',
      trap: 'The two initialisations look interchangeable and are not. The brace form stores exactly the bytes you list.',
      narration: 'Brace initialisation adds no terminator of its own. You must list the zero yourself.'
    },
    {
      id: 'size-4', start: 116, end: 122, scene: 'sizing',
      caption: 'Only one byte may ever be dropped, and only the terminator, and only when the array is one short.',
      detail: 'The initialisation rule allows the terminating null to be omitted when there is no room for it. An initialiser two bytes too long provides values for elements the array does not have, which the standard forbids.',
      keyword: 'only one byte',
      trap: 'A question that gives an array one byte short is asking whether you notice; one two bytes short is not valid C at all.',
      narration: 'Only one byte may be dropped, only the terminator, and only when the array is exactly one short.'
    },

    /* ---- scene 5: escapes ---- */
    {
      id: 'esc-1', start: 122, end: 130, scene: 'escapes',
      caption: 'An escape sequence is one byte in memory, however many characters it takes to write.',
      detail: 'Backslash-n is two characters of source and one byte of value ten. Backslash-0 is two characters of source and one byte of value zero.',
      keyword: 'one byte',
      trap: 'Counting source characters instead of bytes is the commonest arithmetic error in this topic.',
      narration: 'An escape sequence is one byte in memory, however many characters it takes to write.'
    },
    {
      id: 'esc-2', start: 130, end: 138, scene: 'escapes',
      caption: '"\\0" has sizeof 2 and strlen 0, because its only content byte is the zero.',
      detail: 'The literal contains an embedded null, so the string it forms is empty even though the array is two bytes long. A character string literal need not be a string, precisely because an escape can put a zero inside it.',
      keyword: 'strlen 0',
      trap: 'sizeof 2 with strlen 0 is not a contradiction. One counts storage, the other counts characters before the first zero.',
      narration: 'Backslash zero has sizeof two and strlen zero, because its only content byte is the zero.'
    },
    {
      id: 'esc-3', start: 138, end: 146, scene: 'escapes',
      caption: 'Adjacent literals are joined before anything else, so "ab" "cd" is one literal of five bytes.',
      detail: 'In translation phase six the compiler concatenates adjacent string literals into a single sequence, then appends one terminator. Two written pieces, one array, one zero.',
      keyword: 'joined',
      trap: 'Concatenation happens before escape processing of the result, so "\\x12" "3" is two bytes, not one escape of value 0x123.',
      narration: 'Adjacent literals are joined first, so a b c d in two pieces is one literal of five bytes.'
    },
    {
      id: 'esc-4', start: 146, end: 152, scene: 'escapes',
      caption: 'Hex and octal escapes are read greedily, so a following digit can be swallowed.',
      detail: 'A hexadecimal escape takes as many hexadecimal digits as follow. "\\x41BC" is one byte of value 0x41BC truncated to a char, not the letter A followed by BC. Writing "\\x41" "BC" separates them.',
      keyword: 'read greedily',
      trap: 'The value is implementation-defined when it does not fit in a char, so such a literal is not a safe exam answer.',
      narration: 'Hex and octal escapes are read greedily, so a following digit can be swallowed.'
    },

    /* ---- scene 6: unsigned ---- */
    {
      id: 'uns-1', start: 152, end: 160, scene: 'unsigned',
      caption: 'strlen returns size_t. The subtraction of two size_t values is unsigned, so it never goes negative.',
      detail: 'Both operands convert to the unsigned type, and the result is reduced modulo one more than the largest value of that type. Three minus five is therefore a very large number, not minus two.',
      keyword: 'never goes negative',
      trap: 'The type is size_t even when the answer is small. The trap is in the comparison, not in the value.',
      narration: 'strlen returns size t, which is unsigned, so a subtraction of two lengths never goes negative.'
    },
    {
      id: 'uns-2', start: 160, end: 168, scene: 'unsigned',
      caption: 'On a 64-bit machine, 3 - 5 is 18446744073709551614. On the 32-bit convention it is 4294967294.',
      detail: 'The exact value depends on how many bits size_t has, which the question usually does not state, because the answer does not depend on it. Only the sign matters.',
      keyword: 'only the sign matters',
      trap: 'Do not try to compute the wrapped value in the exam. Decide the sign and move on.',
      narration: 'The wrapped value is huge on either width. What matters is that it is positive.'
    },
    {
      id: 'uns-3', start: 168, end: 176, scene: 'unsigned',
      caption: 'So strlen(s) - strlen(t) > 0 is true whenever the two lengths differ at all.',
      detail: 'In GATE 2017 Set 1 Q53 the lengths are 3 and 5, the difference wraps to a large positive value, the comparison is true, and the conditional selects strlen(s), which is 3. The answer is 3, not 5.',
      keyword: 'true whenever',
      trap: 'The intuitive answer is 5, the larger length. The question exists to punish that intuition.',
      narration: 'So the comparison is true whenever the lengths differ, and the program prints 3.'
    },
    {
      id: 'uns-4', start: 176, end: 184, scene: 'unsigned',
      caption: 'The same unsigned type breaks a downward loop: for (i = strlen(s) - 1; i >= 0; i--) never ends.',
      detail: 'When the string is empty, strlen(s) - 1 is the largest value of size_t, not minus one. And i >= 0 is true for every unsigned value, so the test can never fail.',
      keyword: 'never ends',
      trap: 'Write the loop with a signed index, or with the test i != 0 after decrementing, or stop at the first byte.',
      narration: 'The same unsigned type breaks a downward loop over a string: the test is true for every value.'
    },

    /* ---- scene 7: pointer arithmetic on a literal ---- */
    {
      id: 'pa-1', start: 184, end: 192, scene: 'pointer-arith',
      caption: 'The subscript is defined as a sum, so 2[p] and p[2] are the same object.',
      detail: 'a[i] means *(a + i), and addition is commutative, so i[a] is the same expression. GATE uses the reversed form to test whether you know the definition rather than the notation.',
      keyword: 'the same object',
      trap: 'Reversed subscripts are not a special syntax. Substitute the definition and it becomes ordinary pointer arithmetic.',
      narration: 'The subscript is defined as a sum, so two of p and p of two are the same object.'
    },
    {
      id: 'pa-2', start: 192, end: 200, scene: 'pointer-arith',
      caption: 'In "GATECSIT2017", p[2] is T and p[6] is I, with values 84 and 73.',
      detail: 'The literal has twelve characters and a terminator at index 12. T is 84 and I is 73 in ASCII, so the difference is 11, and letters being consecutive is all the arithmetic the question needs.',
      keyword: '84 and 73',
      trap: 'You do not need the character set to be ASCII. The question works because letters are consecutive in any character set C permits.',
      narration: 'In the literal, p of two is T and p of six is I, with values eighty-four and seventy-three.'
    },
    {
      id: 'pa-3', start: 200, end: 208, scene: 'pointer-arith',
      caption: 'The argument becomes c + 11 - 1, which is c + 10, pointing at "17".',
      detail: 'Character subtraction yields an int, so it is the byte offset that is added to the pointer, not a scaled element count: p + 10 moves ten characters because the element type is char.',
      keyword: 'c + 10',
      trap: 'The scaling rule of pointer arithmetic is invisible here only because sizeof(char) is 1.',
      narration: 'The argument becomes c plus eleven minus one, which is c plus ten, pointing at the last two characters.'
    },
    {
      id: 'pa-4', start: 208, end: 214, scene: 'pointer-arith',
      caption: 'strlen of the two remaining characters is 2, and that is the printed answer.',
      detail: 'The terminator at index 12 is untouched, so counting from index 10 stops after two characters. Answer 2, GATE 2017 Set 2 Q55.',
      keyword: '2',
      trap: 'The literal has twelve characters, so a careless count gives 12, 10 or 11. Trace the index, do not guess.',
      narration: 'strlen of the two remaining characters is two. That is the printed answer.'
    },

    /* ---- scene 8: copying ---- */
    {
      id: 'copy-1', start: 214, end: 222, scene: 'copy',
      caption: 'A copy loop that tests the source byte and copies it never writes the terminator.',
      detail: 'while (*t) *s++ = *t++; stops when the source byte is zero, so the zero itself is never stored. The destination keeps whatever was already there.',
      keyword: 'never writes the terminator',
      trap: 'This is the difference between a correct copy and a copy that happens to work. The library strcpy copies the zero too.',
      narration: 'A copy loop that tests the source byte and copies it never writes the terminator.'
    },
    {
      id: 'copy-2', start: 222, end: 230, scene: 'copy',
      caption: 'GATE 2025 Set 2 Q9: a[30] holds "@#Hello World!", and the call copies from a + 2.',
      detail: 'Fourteen characters occupy indices 0 to 13, with the terminator at 14. The source a + 2 begins at H, so twelve characters are copied into indices 0 to 11.',
      keyword: 'twelve characters',
      trap: 'The source and destination overlap. Copying forward from a higher index to a lower one is safe; the reverse direction is not.',
      narration: 'The array holds fourteen characters, and the call copies twelve of them, starting at index two.'
    },
    {
      id: 'copy-3', start: 230, end: 238, scene: 'copy',
      caption: 'Indices 12 and 13 still hold d and !, and the zero at 14 was never touched.',
      detail: 'The loop wrote only twelve bytes. The old characters beyond the copied region survive, and the terminator that was already at index 14 still ends the string there.',
      keyword: 'still hold d and !',
      trap: 'A learner who assumes the copy produced a clean "Hello World!" misses that the array beyond the write is untouched.',
      narration: 'Indices twelve and thirteen still hold d and exclamation, and the zero was never touched.'
    },
    {
      id: 'copy-4', start: 238, end: 248, scene: 'copy',
      caption: 'printf therefore prints "Hello World!d!". Option D of the paper.',
      detail: 'Twelve copied characters plus the two leftovers, ending at the original terminator. The destination needs strlen(src) + 1 bytes for a copy and strlen(dst) + strlen(src) + 1 for an append.',
      keyword: 'Hello World!d!',
      trap: 'The library contract says strcpy and strcat require non-overlapping objects; a hand-written loop has no such promise either way.',
      narration: 'So the program prints Hello World, exclamation, d, exclamation. That is option D.'
    },

    /* ---- scene 9: arrays of strings ---- */
    {
      id: 'twod-1', start: 248, end: 256, scene: 'two-d',
      caption: 'char names[3][8] is one object of 24 bytes. Each row is eight bytes, used or not.',
      detail: 'A two-dimensional array is an array of arrays. names[i] is a char[8], and sizeof(names[i]) is 8 whatever the text in it. names[i] is an array, so it cannot be reassigned.',
      keyword: '24 bytes',
      trap: 'Short names waste the difference. That waste is the price of a fixed stride.',
      narration: 'char names three by eight is one object of twenty-four bytes. Each row is eight bytes.'
    },
    {
      id: 'twod-2', start: 256, end: 264, scene: 'two-d',
      caption: 'char *names[3] is an array of three pointers. sizeof is three pointer widths.',
      detail: 'On a 64-bit machine that is 24 as well, which is a coincidence and not an identity. On the 32-bit convention it is 12. Each element may point anywhere, and may be reassigned.',
      keyword: 'three pointers',
      trap: 'The two declarations can produce the same sizeof and mean entirely different things. Compare the element type, not the total.',
      narration: 'char star names three is an array of three pointers, and each element may be reassigned.'
    },
    {
      id: 'twod-3', start: 264, end: 270, scene: 'two-d',
      caption: 'A row of the grid is a char[8]; an element of the pointer array is a char *.',
      detail: 'That single difference decides what sizeof gives, whether an assignment is legal, and whether the strings may be modified. It is the same distinction as scene two, one level up.',
      keyword: 'char[8] against char *',
      trap: 'names[i] = "NEW" is an error for the grid and legal for the pointer array.',
      narration: 'A row of the grid is an array of eight characters; an element of the pointer array is a pointer.'
    },
    {
      id: 'twod-4', start: 270, end: 276, scene: 'two-d',
      caption: 'This is why main receives argv as char *argv[], and why argv[1] may be reassigned.',
      detail: 'The operating system builds an array of pointers to strings it has already placed in memory. The strings are not yours to modify; the pointers are.',
      keyword: 'char *argv[]',
      trap: 'argv[i][j] = x writes into the environment block, which is not a promise the standard makes.',
      narration: 'That is why main receives argv as an array of pointers to characters.'
    },

    /* ---- scene 10: rules ---- */
    {
      id: 'rules-1', start: 276, end: 282, scene: 'rules',
      caption: 'Step one: find the object. Is it an array or a pointer? sizeof is decided here.',
      detail: 'Read the declaration before the expression. An array of known size has that size; a parameter or a pointer has the pointer width.',
      keyword: 'array or a pointer',
      trap: 'Every sizeof question in this topic is answered at the declaration, before any expression is evaluated.',
      narration: 'Step one: find the object. Is it an array or a pointer?'
    },
    {
      id: 'rules-2', start: 282, end: 288, scene: 'rules',
      caption: 'Step two: lay out the bytes, including the zero, and count what strlen would see.',
      detail: 'Write the indices. Mark the first zero. strlen is the index of that zero; sizeof is the number of bytes the object has.',
      keyword: 'lay out the bytes',
      trap: 'An embedded zero ends the string early without shrinking the array.',
      narration: 'Step two: lay out the bytes, including the zero, and count what strlen would see.'
    },
    {
      id: 'rules-3', start: 288, end: 294, scene: 'rules',
      caption: 'Step three: check the types of any arithmetic. size_t is unsigned, so a difference is never negative.',
      detail: 'Lengths, indices and counts from the library are size_t. A comparison against zero or a subtraction that should be negative is the trap.',
      keyword: 'unsigned',
      trap: 'If the expression subtracts two lengths and compares with zero, the answer is decided by the sign rule.',
      narration: 'Step three: check the types. A difference of two size t values is never negative.'
    },
    {
      id: 'rules-4', start: 294, end: 300, scene: 'rules',
      caption: 'Step four: ask whether the terminator was written. If not, the object is not a string.',
      detail: 'A copy loop, a strncpy with a short count, or a char array one byte short all leave no terminator. Say so, and say that using it as a string is undefined.',
      keyword: 'was the terminator written',
      trap: 'Answering "the string is gnirts" when the code wrote the zero first is the classic loss of marks.',
      narration: 'Step four: ask whether the terminator was written. If not, the object is not a string.'
    }
  ]
};
