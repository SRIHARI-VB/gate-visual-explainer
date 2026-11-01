# Multidimensional Arrays And Decay — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/multidimensional-arrays-and-decay/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. One sizeof decides the argument

*0:00 – 0:30 · objective: Settle the question the rest of the lesson depends on: is a two-dimensional array a pointer? Three sizeof answers say no.*

**0:00–0:07** — An int a[3][4] holds twelve ints in one block. If a were a pointer to a pointer, sizeof a would be the size of one pointer.

> Caption: int a[3][4] holds twelve ints in one block. If a were a pointer to a pointer, sizeof(a) would be the size of one pointer.

**0:07–0:15** — sizeof a is forty-eight. sizeof a[0] is sixteen. sizeof a[0][0] is four.

> Caption: sizeof a is 48, sizeof a[0] is 16, sizeof a[0][0] is 4. Three levels, three sizes, all measured.

Exam-trap caption mode adds: *A student who expects sizeof(a) to be 8 has already decided a is a pointer. The number is the test, and it is 48.*

**0:15–0:22** — A pointer is one word. On this page a pointer is eight bytes, so forty-eight against eight is not a rounding difference.

> Caption: A pointer is one word. On this page a pointer is 8 bytes, so 48 against 8 is not a rounding difference.

**0:22–0:30** — So a is an object of forty-eight bytes. Everything else in this lesson is that sentence, applied carefully.

> Caption: So a is an object of 48 bytes. Everything else in this lesson is that sentence, applied carefully.

## Scene 2. An array whose elements are arrays

*0:30 – 1:00 · objective: Read the declarator int a[3][4] as array of 3 arrays of 4 ints, and see the nesting as three complete rows inside one block.*

**0:30–0:37** — Read the declarator from the name outwards. a is an array of three things, each of which is an array of four ints.

> Caption: Read the declarator from the name outwards: a is an array of 3 things, each of which is an array of 4 ints.

**0:37–0:45** — So a[0], a[1] and a[2] are not ints. Each is a complete int array of four, sixteen bytes, and each is a legal array in its own right.

> Caption: So a[0], a[1] and a[2] are not ints. Each is a complete int[4], sixteen bytes, and each is a legal array in its own right.

**0:45–0:52** — The twelve ints are laid out row by row in one block: a thousand to a thousand and forty-seven, with the last cell at a thousand and forty-four.

> Caption: The twelve ints are laid out row by row in one block: 1000 to 1047, with a[2][3] the last at 1044.

**0:52–1:00** — No row pointer is stored anywhere. The geometry is in the type, not in memory.

> Caption: No row pointer is stored anywhere. The geometry is in the type, not in memory.

## Scene 3. What a becomes inside an expression

*1:00 – 1:30 · objective: Apply the array-to-pointer rule at each of the three levels and name the resulting type exactly, including the three places where no conversion happens.*

**1:00–1:07** — In an expression an array becomes a pointer to its first element. The first element of a is a[0], which is an int array of four.

> Caption: In an expression an array becomes a pointer to its first element. The first element of a is a[0], an int[4].

**1:07–1:15** — So a decays to a pointer to an array of four ints. That is read pointer to, not array of pointers.

> Caption: So a decays to int (*)[4]: a pointer to an array of four ints. That is read "pointer to", not "array of pointers".

Exam-trap caption mode adds: *int (*)[4] and int *[4] differ only in where the parentheses sit, and the two types differ by 8 bytes against 32 in sizeof.*

**1:15–1:22** — One level down, a[0] is an int array of four, so it decays to a pointer to int. Two levels down, a[0][0] is an int, and an int does not decay.

> Caption: One level down: a[0] is an int[4], so it decays to int *. Two levels down: a[0][0] is an int, and an int does not decay.

**1:22–1:30** — Three places where no conversion happens: the operand of sizeof, the operand of unary address-of, and a string literal initialising an array.

> Caption: Three places where no conversion happens: the operand of sizeof, the operand of unary &, and a string literal initialising an array.

## Scene 4. One address, three types

*1:30 – 2:00 · objective: Separate an address from the type that carries it: a, &a[0] and &a all hold 1000, and adding 1 moves 16, 16 and 48 bytes.*

**1:30–1:37** — a, and a-zero, and a, all hold the number one thousand. Three expressions, one address, three different types.

> Caption: a, &a[0] and &a all hold the number 1000. Three expressions, one address, three different types.

**1:37–1:45** — a plus one is one thousand and sixteen, one row of sixteen bytes. a-zero plus one is one thousand and four, one int. And a plus one is one thousand and forty-eight, the whole object.

> Caption: a + 1 is 1016: one row of sixteen bytes. a[0] + 1 is 1004: one int. &a + 1 is 1048: the whole object.

Exam-trap caption mode adds: *Two expressions can print the same address and still disagree about where +1 goes. Comparing addresses tells you nothing about types.*

**1:45–1:52** — The general form: a plus i moves i times sixteen bytes, and the dereference gives the row itself, which then decays to a pointer to int.

> Caption: The general form: a + i moves i times 16, and *(a + i) is the row itself, which then decays to int *.

**1:52–2:00** — The address-of-a plus one is one past the end of the whole object. Forming it is legal; dereferencing it is not.

> Caption: &a + 1 is one past the end of the whole object. Forming it is legal; dereferencing it is not.

## Scene 5. a[i][j] is two dereferences

*2:00 – 2:30 · objective: Expand the subscript twice and check all twelve cells: the spelled-out form and the indexed form land on the same byte.*

**2:00–2:07** — The standard defines a bracket b as star, a plus b. So a i j is star star a plus i plus j, and nothing else.

> Caption: The standard defines E1[E2] as *((E1) + (E2)). So a[i][j] is *(*(a + i) + j), and nothing else.

**2:07–2:15** — First expansion: star a plus i is row i. It has type int array of four, so in this expression it decays again, to a pointer to int.

> Caption: First expansion: *(a + i) is row i. It has type int[4], so in this expression it decays again, to int *.

**2:15–2:22** — Second expansion: adding j moves j ints, and the final dereference is the value. Checked on all twelve cells, both spellings give the same byte.

> Caption: Second expansion: adding j moves j ints, and the final dereference is the value. Checked on all twelve cells: both spellings give the same byte.

**2:22–2:30** — The row-major formula falls out of the type: base plus, i times C plus j, times the width. C is the number of columns, not the number of rows.

> Caption: The row-major formula falls out of the type: base + (i * C + j) * w, with C the number of columns, not the number of rows.

Exam-trap caption mode adds: *Using the row count where the column count belongs. The two are equal in a square array, which is exactly why the mistake survives practice.*

## Scene 6. Why int ** cannot be passed

*2:30 – 3:00 · objective: Read the same 48 bytes through an int ** and see a number that is not an address of anything, which is why the compiler rejects the call and a cast makes it undefined behaviour.*

**2:30–2:37** — Now read the same forty-eight bytes as a pointer to a pointer. The first eight bytes are the integers one thousand and one thousand and four.

> Caption: Now read the same 48 bytes as an int **. The first eight bytes are a[0][0] and a[0][1], which are the integers 1000 and 1004.

**2:37–2:45** — That pair reads as a number, but not the address of anything in this program. Dereferencing it is undefined behaviour.

> Caption: On a little-endian 64-bit machine that pair reads as 0x000003ec000003e8 — a number, but not the address of anything in this program.

**2:45–2:52** — The compiler rejects the assignment because the types differ. A cast silences the compiler and changes nothing about the bytes.

> Caption: The compiler rejects int ** p = a; because the types differ. A cast silences the compiler and changes nothing about the bytes.

Exam-trap caption mode adds: *Adding a cast to make a diagnostic go away. The diagnostic was the only thing standing between the program and undefined behaviour.*

**2:52–3:00** — What would make the pointer-to-pointer correct: an actual array of pointers, filled with real addresses. That is a different object with different contents.

> Caption: What would make int ** correct: an actual array of pointers, filled with real addresses. That is a different object with different contents.

## Scene 7. The parameter rule

*3:00 – 3:30 · objective: Turn a parameter declaration into its pointer form, see which dimensions survive, and know why int a[][] does not compile while int a[][4] does.*

**3:00–3:07** — A parameter declared as an array is adjusted to a pointer to its element type. An int a three by four becomes a pointer to an array of four.

> Caption: A parameter declared as an array is adjusted to a pointer to its element type. int a[3][4] becomes int (*a)[4].

**3:07–3:15** — Only the outermost dimension is discarded. The inner ones must survive, because they are the row width the arithmetic needs.

> Caption: Only the outermost dimension is discarded. The inner ones must survive, because they are the row width the arithmetic needs.

**3:15–3:22** — So three by four, a hundred by four, and unspecified by four are three spellings of one parameter type. The three and the hundred mean nothing.

> Caption: So int a[3][4], int a[100][4] and int a[][4] are three spellings of one parameter type. The 3 and the 100 mean nothing.

**3:22–3:30** — But an empty by empty parameter does not compile, because it would be an array whose elements are incomplete arrays, and an element type may not be incomplete.

> Caption: But int a[][] does not compile: it would be an array whose elements are incomplete arrays, and an element type may not be incomplete.

Exam-trap caption mode adds: *Believing that every dimension of a parameter is optional. Exactly one is, and it is the first.*

## Scene 8. Pointer to array against array of pointers

*3:30 – 4:00 · objective: Tell int (*p)[4] from int *q[4] by sizeof and by stride, and place the ragged int *rows[3] on the correct side of the line.*

**3:30–3:37** — One asterisk, two types. A parenthesised pointer to an array of four, against an array of four pointers.

> Caption: One asterisk, two types. int (*p)[4] is a pointer to an array of four. int *q[4] is an array of four pointers.

**3:37–3:45** — sizeof tells them apart at once: eight for the pointer, thirty-two for the array of four pointers. And plus one moves sixteen bytes against eight.

> Caption: sizeof tells them apart at once: 8 for the pointer, 32 for the array of four pointers. And p + 1 moves 16 bytes against q + 1 at 8.

**3:45–3:52** — The ragged array of three row pointers is on the array-of-pointers side: three pointers, each free to aim at a row of a different length.

> Caption: The ragged array int *rows[3] is the array-of-pointers side: three pointers, each free to aim at a row of a different length.

**3:52–4:00** — And rows, being an array, decays to a pointer to a pointer. Which is why that type is right for ragged tables and wrong for a rectangular array.

> Caption: And rows, being an array, decays to int ** — which is why int ** is right for ragged tables and wrong for int a[3][4].

## Scene 9. Address arithmetic under exam conditions

*4:00 – 4:30 · objective: Compute a cell address in row-major and column-major order, then run the same formula backwards to recover a base address from two given cells.*

**4:00–4:07** — Question shape one: an array of five rows of six, base one thousand, four bytes each, row-major. The address is one thousand and eighty-eight.

> Caption: Question shape one: int a[5][6], base 1000, four bytes each, row-major. Address of a[3][4] is 1000 + (3*6 + 4)*4 = 1088.

**4:07–4:15** — Column-major swaps the roles: one thousand and ninety-two. Same array, same cell, four bytes apart.

> Caption: Column-major swaps the roles: 1000 + (4*5 + 3)*4 = 1092. Same array, same cell, four bytes apart.

Exam-trap caption mode adds: *Assuming C is column-major. A declared C array is row-major because its elements must be contiguous; column-major appears in these questions as a hypothetical.*

**4:15–4:22** — Question shape two runs backwards: two given cells, a gap of three elements, and a base of one thousand and sixty.

> Caption: Question shape two runs backwards: given a[2][3] at 1112 and a[3][1] at 1124 on int a[4][5], the gap is 3 elements, and the base is 1060.

**4:22–4:30** — The check that costs nothing: recompute the second given cell from the recovered base. If it does not come back, the base is wrong.

> Caption: The check that costs nothing: recompute the second given cell from the recovered base. If it does not come back, the base is wrong.

## Scene 10. The routine and the five traps

*4:30 – 5:00 · objective: Leave with a four-step routine that answers any of these questions, and the five answers that look right and are not.*

**4:30–4:37** — Step one: name the object. Write the type out as array of, of T, before you do anything else.

> Caption: Step 1: name the object. Write the type out as array of ... of T before you do anything else.

**4:37–4:45** — Step two: ask what the expression has become. Pointer to the element type, and the element type is one level in, not T.

> Caption: Step 2: ask what the expression has become. Pointer to the element type — and the element type is one level in, not T.

**4:45–4:52** — Step three: scale by the pointed-to type, then add. Row width for a pointer to a row, element width for a pointer to an element.

> Caption: Step 3: scale by the pointed-to type, then add. Row width for a pointer to a row, element width for a pointer to an element.

**4:52–5:00** — Step four: check the type of the answer. Bytes against element index is the last place these questions go wrong.

> Caption: Step 4: check the type of the answer. If a question asks for bytes, say bytes; if it asks for an element index, do not multiply by the width.

Exam-trap caption mode adds: *Reporting an element index when the question asked for an address, or the reverse. The arithmetic can be perfect and the answer still wrong.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
