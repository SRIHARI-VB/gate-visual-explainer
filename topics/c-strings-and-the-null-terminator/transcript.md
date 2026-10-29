# C Strings: the Null Terminator, Literals, and strlen against sizeof — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/c-strings-and-the-null-terminator/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A string is bytes up to the first zero

*0:00 – 0:30 · objective: See a string as a byte array plus a terminator, and see every string function stop at that zero.*

**0:00–0:08** — C has no string type. A string is a run of char objects that ends at the first byte of value zero.

> Caption: C has no string type. A string is a run of char objects ending at the first byte of value zero.

Exam-trap caption mode adds: *The terminator is a byte, not a symbol. It occupies memory, and it is counted by sizeof and not by strlen.*

**0:08–0:16** — The literal G A T E is five bytes: four letters and the zero.

> Caption: The literal "GATE" is five bytes: G, A, T, E, and the zero.

Exam-trap caption mode adds: *A four-letter word is five bytes. Every "how many bytes" question turns on this one addition.*

**0:16–0:24** — Printing a string copies bytes until it meets the zero. That is the only length signal there is.

> Caption: printf with %s copies bytes until it meets the zero. It has no other way to know the length.

Exam-trap caption mode adds: *A char array with no terminator is a legal object and an illegal string. Passing it to %s reads past the array.*

**0:24–0:30** — Two numbers describe every string: the bytes stored, and the bytes before the zero.

> Caption: So two numbers describe every string: bytes stored, and bytes before the zero.

Exam-trap caption mode adds: *The two numbers are equal for a pointer and unequal for an array. That asymmetry is the whole topic.*

## Scene 2. Literal and array: the same five bytes, two different objects

*0:30 – 1:00 · objective: Separate char *s = "GATE" from char t[] = "GATE" on writability, on sizeof, and on assignability.*

**0:30–0:38** — char star s equals a literal stores a pointer. The five bytes live elsewhere, for the life of the program.

> Caption: char *s = "GATE" stores a pointer. The five bytes live somewhere else, with static storage duration.

Exam-trap caption mode adds: *The array is not on the stack. Returning a pointer to a literal is legal; returning a pointer to a local array is not.*

**0:38–0:46** — char t open bracket close bracket equals a literal stores a copy in t itself. t is an array you may write to.

> Caption: char t[] = "GATE" stores a copy of the five bytes in t itself, and t is an array.

Exam-trap caption mode adds: *The copy is what makes t[0] = 'g' defined and s[0] = 'g' undefined.*

**0:46–0:54** — Writing through s is undefined behaviour. The literal may sit in memory the program may not write.

> Caption: Writing through s is undefined behaviour. The standard says a program that modifies that array has undefined behaviour.

Exam-trap caption mode adds: *Undefined is not "prints the old character". The program may work, crash, or print something else; none of those is the answer.*

**0:54–1:00** — Three differences follow: t is writable, sizeof of t is five, and t cannot be reassigned.

> Caption: Three differences follow: t is writable, sizeof(t) is five, and t cannot be reassigned.

Exam-trap caption mode adds: *The exam asks for sizeof and for the effect of a write. Both are decided by this one distinction.*

## Scene 3. sizeof against strlen

*1:00 – 1:32 · objective: Read sizeof as a compile-time size of the object and strlen as a run-time count of bytes before the zero.*

**1:00–1:08** — sizeof is answered by the compiler from the type. strlen is answered at run time by counting bytes.

> Caption: sizeof is answered by the compiler from the declared type. strlen is answered at run time by counting.

Exam-trap caption mode adds: *sizeof never looks inside a string. It reports the object it is given, so it cannot see an embedded zero.*

**1:08–1:16** — For an array with no size written, sizeof is five and strlen is four. The difference is the terminator.

> Caption: For char a[] = "GATE", sizeof is 5 and strlen is 4. The difference is the terminator.

Exam-trap caption mode adds: *For a pointer the two numbers are not one apart: sizeof(p) is the pointer width and strlen(p) is the text length.*

**1:16–1:24** — sizeof counts the bytes the array has; strlen stops at the first zero.

> Caption: sizeof counts bytes that are not there yet; strlen stops at the first zero.

Exam-trap caption mode adds: *An embedded zero truncates the string but not the array: "GA\0TE" has sizeof 6 and strlen 2.*

**1:24–1:32** — An array passed to a function arrives as a pointer, so sizeof there reports the pointer.

> Caption: An array passed to a function is a pointer, so sizeof inside that function reports the pointer.

Exam-trap caption mode adds: *This is why a function cannot recover an array length with sizeof. It is the same rule as the literal-against-array distinction.*

## Scene 4. What fits: a bigger array, an exact array, one byte short

*1:32 – 2:02 · objective: Predict the padding of char t[10] = "GATE" and the lost terminator of char c[4] = "GATE".*

**1:32–1:40** — char t ten equals G A T E gives ten bytes: five used and five zero-filled.

> Caption: char t[10] = "GATE" gives ten bytes: five used, five zero-filled.

Exam-trap caption mode adds: *The spare room is not free for strcat unless you count it: appending needs strlen plus the new text plus one.*

**1:40–1:48** — char c four equals G A T E gives four bytes and no zero. c is an array, not a string.

> Caption: char c[4] = "GATE" gives four bytes and no zero. c is a char array, not a string.

Exam-trap caption mode adds: *strlen(c) is then undefined: it reads past the array looking for a zero. The declaration is legal; using it as a string is not.*

**1:48–1:56** — Brace initialisation adds no terminator of its own. You must list the zero yourself.

> Caption: Brace initialisation is the other way in, and it adds no terminator of its own.

Exam-trap caption mode adds: *The two initialisations look interchangeable and are not. The brace form stores exactly the bytes you list.*

**1:56–2:02** — Only one byte may be dropped, only the terminator, and only when the array is exactly one short.

> Caption: Only one byte may ever be dropped, and only the terminator, and only when the array is one short.

Exam-trap caption mode adds: *A question that gives an array one byte short is asking whether you notice; one two bytes short is not valid C at all.*

## Scene 5. Escapes are one byte each

*2:02 – 2:32 · objective: Count the bytes of a literal with escapes and adjacent-literal concatenation.*

**2:02–2:10** — An escape sequence is one byte in memory, however many characters it takes to write.

> Caption: An escape sequence is one byte in memory, however many characters it takes to write.

Exam-trap caption mode adds: *Counting source characters instead of bytes is the commonest arithmetic error in this topic.*

**2:10–2:18** — Backslash zero has sizeof two and strlen zero, because its only content byte is the zero.

> Caption: "\0" has sizeof 2 and strlen 0, because its only content byte is the zero.

Exam-trap caption mode adds: *sizeof 2 with strlen 0 is not a contradiction. One counts storage, the other counts characters before the first zero.*

**2:18–2:26** — Adjacent literals are joined first, so a b c d in two pieces is one literal of five bytes.

> Caption: Adjacent literals are joined before anything else, so "ab" "cd" is one literal of five bytes.

Exam-trap caption mode adds: *Concatenation happens before escape processing of the result, so "\x12" "3" is two bytes, not one escape of value 0x123.*

**2:26–2:32** — Hex and octal escapes are read greedily, so a following digit can be swallowed.

> Caption: Hex and octal escapes are read greedily, so a following digit can be swallowed.

Exam-trap caption mode adds: *The value is implementation-defined when it does not fit in a char, so such a literal is not a safe exam answer.*

## Scene 6. strlen returns size_t, which is unsigned

*2:32 – 3:04 · objective: Show why strlen(s) - strlen(t) is never negative, and why i >= 0 with strlen is always true.*

**2:32–2:40** — strlen returns size t, which is unsigned, so a subtraction of two lengths never goes negative.

> Caption: strlen returns size_t. The subtraction of two size_t values is unsigned, so it never goes negative.

Exam-trap caption mode adds: *The type is size_t even when the answer is small. The trap is in the comparison, not in the value.*

**2:40–2:48** — The wrapped value is huge on either width. What matters is that it is positive.

> Caption: On a 64-bit machine, 3 - 5 is 18446744073709551614. On the 32-bit convention it is 4294967294.

Exam-trap caption mode adds: *Do not try to compute the wrapped value in the exam. Decide the sign and move on.*

**2:48–2:56** — So the comparison is true whenever the lengths differ, and the program prints 3.

> Caption: So strlen(s) - strlen(t) > 0 is true whenever the two lengths differ at all.

Exam-trap caption mode adds: *The intuitive answer is 5, the larger length. The question exists to punish that intuition.*

**2:56–3:04** — The same unsigned type breaks a downward loop over a string: the test is true for every value.

> Caption: The same unsigned type breaks a downward loop: for (i = strlen(s) - 1; i >= 0; i--) never ends.

Exam-trap caption mode adds: *Write the loop with a signed index, or with the test i != 0 after decrementing, or stop at the first byte.*

## Scene 7. 2[p] is p[2]: the 2017 arithmetic

*3:04 – 3:34 · objective: Trace GATE 2017 Set 2 Q55 as character arithmetic on a literal, and land on index 10.*

**3:04–3:12** — The subscript is defined as a sum, so two of p and p of two are the same object.

> Caption: The subscript is defined as a sum, so 2[p] and p[2] are the same object.

Exam-trap caption mode adds: *Reversed subscripts are not a special syntax. Substitute the definition and it becomes ordinary pointer arithmetic.*

**3:12–3:20** — In the literal, p of two is T and p of six is I, with values eighty-four and seventy-three.

> Caption: In "GATECSIT2017", p[2] is T and p[6] is I, with values 84 and 73.

Exam-trap caption mode adds: *You do not need the character set to be ASCII. The question works because letters are consecutive in any character set C permits.*

**3:20–3:28** — The argument becomes c plus eleven minus one, which is c plus ten, pointing at the last two characters.

> Caption: The argument becomes c + 11 - 1, which is c + 10, pointing at "17".

Exam-trap caption mode adds: *The scaling rule of pointer arithmetic is invisible here only because sizeof(char) is 1.*

**3:28–3:34** — strlen of the two remaining characters is two. That is the printed answer.

> Caption: strlen of the two remaining characters is 2, and that is the printed answer.

Exam-trap caption mode adds: *The literal has twelve characters, so a careless count gives 12, 10 or 11. Trace the index, do not guess.*

## Scene 8. A copy is not a copy until the zero is written

*3:34 – 4:08 · objective: Run GATE 2025 Set 2 Q9 byte by byte and see the leftover characters survive.*

**3:34–3:42** — A copy loop that tests the source byte and copies it never writes the terminator.

> Caption: A copy loop that tests the source byte and copies it never writes the terminator.

Exam-trap caption mode adds: *This is the difference between a correct copy and a copy that happens to work. The library strcpy copies the zero too.*

**3:42–3:50** — The array holds fourteen characters, and the call copies twelve of them, starting at index two.

> Caption: GATE 2025 Set 2 Q9: a[30] holds "@#Hello World!", and the call copies from a + 2.

Exam-trap caption mode adds: *The source and destination overlap. Copying forward from a higher index to a lower one is safe; the reverse direction is not.*

**3:50–3:58** — Indices twelve and thirteen still hold d and exclamation, and the zero was never touched.

> Caption: Indices 12 and 13 still hold d and !, and the zero at 14 was never touched.

Exam-trap caption mode adds: *A learner who assumes the copy produced a clean "Hello World!" misses that the array beyond the write is untouched.*

**3:58–4:08** — So the program prints Hello World, exclamation, d, exclamation. That is option D.

> Caption: printf therefore prints "Hello World!d!". Option D of the paper.

Exam-trap caption mode adds: *The library contract says strcpy and strcat require non-overlapping objects; a hand-written loop has no such promise either way.*

## Scene 9. Arrays of strings: a grid of bytes against an array of pointers

*4:08 – 4:36 · objective: Distinguish char names[3][8] from char *names[3] by stride, by sizeof and by what may be stored.*

**4:08–4:16** — char names three by eight is one object of twenty-four bytes. Each row is eight bytes.

> Caption: char names[3][8] is one object of 24 bytes. Each row is eight bytes, used or not.

Exam-trap caption mode adds: *Short names waste the difference. That waste is the price of a fixed stride.*

**4:16–4:24** — char star names three is an array of three pointers, and each element may be reassigned.

> Caption: char *names[3] is an array of three pointers. sizeof is three pointer widths.

Exam-trap caption mode adds: *The two declarations can produce the same sizeof and mean entirely different things. Compare the element type, not the total.*

**4:24–4:30** — A row of the grid is an array of eight characters; an element of the pointer array is a pointer.

> Caption: A row of the grid is a char[8]; an element of the pointer array is a char *.

Exam-trap caption mode adds: *names[i] = "NEW" is an error for the grid and legal for the pointer array.*

**4:30–4:36** — That is why main receives argv as an array of pointers to characters.

> Caption: This is why main receives argv as char *argv[], and why argv[1] may be reassigned.

Exam-trap caption mode adds: *argv[i][j] = x writes into the environment block, which is not a promise the standard makes.*

## Scene 10. The four-step procedure and the five traps

*4:36 – 5:00 · objective: Fix the order of operations that answers any string question on the paper.*

**4:36–4:42** — Step one: find the object. Is it an array or a pointer?

> Caption: Step one: find the object. Is it an array or a pointer? sizeof is decided here.

Exam-trap caption mode adds: *Every sizeof question in this topic is answered at the declaration, before any expression is evaluated.*

**4:42–4:48** — Step two: lay out the bytes, including the zero, and count what strlen would see.

> Caption: Step two: lay out the bytes, including the zero, and count what strlen would see.

Exam-trap caption mode adds: *An embedded zero ends the string early without shrinking the array.*

**4:48–4:54** — Step three: check the types. A difference of two size t values is never negative.

> Caption: Step three: check the types of any arithmetic. size_t is unsigned, so a difference is never negative.

Exam-trap caption mode adds: *If the expression subtracts two lengths and compares with zero, the answer is decided by the sign rule.*

**4:54–5:00** — Step four: ask whether the terminator was written. If not, the object is not a string.

> Caption: Step four: ask whether the terminator was written. If not, the object is not a string.

Exam-trap caption mode adds: *Answering "the string is gnirts" when the code wrote the zero first is the classic loss of marks.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
