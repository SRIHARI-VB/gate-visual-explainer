# Pointers in C — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/pointers-in-c/index.html`
- Total duration: 4:00 (240 seconds), 10 scenes, 41 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Memory is a row of numbered bytes

*0:00 – 0:18 · objective: Separate a variable's address from its value.*

**0:00–0:05** — A variable is a name for a place in memory. Memory is a long row of byte cells, and every cell has a number called its address.

> Caption: A variable is a name for a place in memory.

Exam-trap caption mode adds: *A variable is not its value. The name refers to a location that holds a value, and the two can be reported separately.*

**0:05–0:11** — Writing int x equals forty two reserves four bytes. The address of x is the address of the first of those four bytes.

> Caption: int x = 42 reserves four bytes. The first byte's address is the address of x.

Exam-trap caption mode adds: *sizeof(int) is not fixed by the C standard. Here it is 4, and any question that needs it will state it.*

**0:11–0:15** — So x has two separate things. An address, one thousand, and a value, forty two.

> Caption: So x has two separate things: an address, 1000, and a value, 42.

Exam-trap caption mode adds: *Both are plain numbers, so printing the wrong one still looks like a plausible answer.*

**0:15–0:18** — An ordinary variable keeps the value. A pointer keeps the address.

> Caption: An ordinary variable keeps the value. A pointer keeps the address.

## Scene 2. A pointer holds an address

*0:18 – 0:38 · objective: Read &x and int *p = &x; and see p as a variable with its own address.*

**0:18–0:23** — The ampersand means address of. So ampersand x is one thousand.

> Caption: The ampersand means "address of". So &x is 1000.

Exam-trap caption mode adds: *& is not "reference" here and it is not multiplication. In a unary position it always means address of.*

**0:23–0:29** — int star p equals ampersand x declares p as a pointer to int, and stores one thousand in it.

> Caption: int *p = &x; declares p as a pointer to int, and stores 1000 in it.

Exam-trap caption mode adds: *int *p, int* p and int * p are the same declaration. The spacing carries no meaning.*

**0:29–0:34** — p is a variable too. It lives at its own address, and takes eight bytes here.

> Caption: p is a variable too. It lives at its own address and takes eight bytes here.

Exam-trap caption mode adds: *The size of a pointer is not the size of what it points at. A pointer to a 40-byte array is still 8 bytes.*

**0:34–0:38** — A pointer is a variable whose value is an address.

> Caption: A pointer is a variable whose value is an address.

## Scene 3. Dereferencing follows the arrow

*0:38 – 1:00 · objective: Read *p as an object, not a value; see *p = 99 write through.*

**0:38–0:43** — The star in an expression means the object at the address stored here.

> Caption: The star in an expression means "the object at the address stored here".

Exam-trap caption mode adds: *Declaration star and expression star are different jobs. Confusing them is behind most of the "*p is 1000" errors.*

**0:43–0:48** — Follow the arrow. p holds one thousand, and one thousand is where x lives, so star p is x itself.

> Caption: Follow the arrow: p holds 1000, and 1000 is where x lives. So *p is x itself.

Exam-trap caption mode adds: **p is not "the value of p". It is the object p points at.*

**0:48–0:54** — Star p equals ninety nine writes through the arrow. x becomes ninety nine, and p does not change.

> Caption: *p = 99 writes through the arrow. x becomes 99. p does not change.

Exam-trap caption mode adds: *Writing through a pointer changes the target, never the pointer. Only an assignment to p itself changes p.*

**0:54–1:00** — That is why ampersand star p is p, and star ampersand x is x. The two operators undo each other.

> Caption: That is why &*p is p and *&x is x: the two operators undo each other.

Exam-trap caption mode adds: *They cancel as operators, but the intermediate must be a valid pointer. &*p on an uninitialised p is still undefined behaviour.*

## Scene 4. Pointer arithmetic is scaled

*1:00 – 1:24 · objective: Derive addr(p + k) = addr(p) + k x sizeof(*p) for int and char pointers.*

**1:00–1:05** — Pointer arithmetic is scaled by the size of the type pointed to.

> Caption: Pointer arithmetic is scaled by the size of the type pointed to.

Exam-trap caption mode adds: *Nothing about the address arithmetic is in bytes. The compiler multiplies for you.*

**1:05–1:11** — On an int pointer, p plus one moves four bytes, not one.

> Caption: On an int pointer, p + 1 moves four bytes, not one.

Exam-trap caption mode adds: *p + 1 does not mean "the next byte". That is the single most common arithmetic error in output questions.*

**1:11–1:17** — On a char pointer, q plus one moves one byte, because the size of char is one by definition.

> Caption: On a char pointer, q + 1 moves one byte, because sizeof(char) is 1 by definition.

Exam-trap caption mode adds: *char arithmetic happens to equal byte arithmetic. Do not generalise that to other types.*

**1:17–1:24** — The address of p plus k equals the address of p plus k times the size of what p points at. One rule explains both rows.

> Caption: addr(p + k) = addr(p) + k x sizeof(*p). One rule, both rows.

Exam-trap caption mode adds: *p2 - p1 counts elements, not bytes. Divide the byte gap by the element size to get the same answer.*

## Scene 5. An array decays to a pointer

*1:24 – 1:52 · objective: Show contiguity, decay, and a[i] == *(a + i).*

**1:24–1:30** — An array is a block of equal sized cells, laid out one after another.

> Caption: An array is a block of equal-sized cells, laid out one after another.

Exam-trap caption mode adds: *C does not store the length with the array. Nothing in memory records that there are five of them.*

**1:30–1:36** — In most expressions the name a decays. It becomes ampersand a zero, a pointer to the first element.

> Caption: In most expressions the name a decays: it becomes &a[0], a pointer to the first element.

Exam-trap caption mode adds: *Decay happens in expressions, not in declarations. The array is still an array where it is declared.*

**1:36–1:43** — a and ampersand a zero hold the same address, but they are not the same type.

> Caption: a and &a[0] hold the same address, but they are not the same type.

Exam-trap caption mode adds: *Equal addresses do not mean equal types. That is exactly how &a + 1 comes to differ from a + 1.*

**1:43–1:47** — a i is defined as star a plus i. So a two and star a plus two reach the same cell.

> Caption: a[i] is defined as *(a + i). So a[2] and *(a + 2) reach the same cell.

Exam-trap caption mode adds: *Because the definition is in terms of pointers, an array parameter and a pointer parameter behave identically inside the function.*

**1:47–1:52** — Since addition commutes, two bracket a is legal and means the same cell.

> Caption: Since addition commutes, 2[a] is legal and means the same cell.

Exam-trap caption mode adds: *It is legal, and GATE has used it. It is not good style; it is a definition being applied literally.*

## Scene 6. The sizeof trap

*1:52 – 2:22 · objective: Distinguish sizeof(array), sizeof(pointer), sizeof(&a) and a decayed parameter.*

**1:52–1:57** — sizeof asks about the object. It answers in bytes, and it is computed from the type.

> Caption: sizeof asks about the object. It answers in bytes, and it is computed from the type.

Exam-trap caption mode adds: *sizeof is evaluated at compile time for these operands, so it never tells you what a pointer currently points at.*

**1:57–2:04** — The size of a is twenty. Five ints of four bytes each. The array knows its own size.

> Caption: sizeof(a) is 20: five ints of four bytes. The array knows its own size.

Exam-trap caption mode adds: *sizeof(a) is not the number of elements. Divide by sizeof(a[0]) if you want the count.*

**2:04–2:10** — The size of p is eight. The pointer's own size, whatever it points at.

> Caption: sizeof(p) is 8: the pointer's own size, whatever it points at.

Exam-trap caption mode adds: *sizeof(p) never tells you how much memory is reachable through p. Nothing in the language does.*

**2:10–2:16** — Ampersand a is a pointer to the whole array, so ampersand a plus one jumps twenty bytes, past all of it.

> Caption: &a is a pointer to the whole array, so &a + 1 jumps twenty bytes, past all of it.

Exam-trap caption mode adds: *This is the classic sizeof question. a + 1 and &a + 1 start at the same address and end twenty bytes apart.*

**2:16–2:22** — Inside a function, an array parameter has already decayed, so sizeof gives eight, not twenty.

> Caption: Inside a function, an array parameter has already decayed, so sizeof gives 8, not 20.

Exam-trap caption mode adds: *Writing int arr[10] in a parameter list does not pass the size. The length must be passed separately.*

## Scene 7. Four ways * and ++ combine

*2:22 – 2:56 · objective: Predict the value, the pointer position and the array after each expression.*

**2:22–2:27** — The star and the increment can combine in four ways, and each means something different.

> Caption: The star and the increment can combine in four ways, and each means something different.

Exam-trap caption mode adds: *These four appear in output questions because they look almost identical on paper.*

**2:27–2:34** — Star p plus plus is star of p plus plus. Read the current cell, then move p forward.

> Caption: *p++ is *(p++): read the current cell, then move p forward.

Exam-trap caption mode adds: **p++ does not increment the value. It moves the pointer.*

**2:34–2:41** — Bracket star p bracket plus plus increments the cell, and leaves p where it is.

> Caption: (*p)++ increments the cell and leaves p where it is.

Exam-trap caption mode adds: *(*p)++ and *p++ differ in which object is incremented. Brackets are the whole difference.*

**2:41–2:48** — Plus plus star p increments the cell before reading it. Star plus plus p moves first, then reads.

> Caption: ++*p increments the cell before reading it; *++p moves first, then reads.

Exam-trap caption mode adds: *Prefix versus postfix changes the value produced, not only the timing of the side effect.*

**2:48–2:56** — Postfix binds tighter than star. Brackets decide everything else.

> Caption: Postfix binds tighter than star. Brackets decide everything else.

Exam-trap caption mode adds: *If ++ is attached to p, the pointer moves. If it is attached to *p or to a bracketed (*p), the cell changes.*

## Scene 8. A pointer to a pointer

*2:56 – 3:18 · objective: Follow two arrows and see why a function needs int ** to change a pointer.*

**2:56–3:02** — A pointer variable has an address too, so a pointer can point at it.

> Caption: A pointer variable has an address too, so a pointer can point at it.

Exam-trap caption mode adds: *This is not a special construct. It is the same rule applied to an object that happens to be a pointer.*

**3:02–3:09** — int star star pp equals ampersand p stores the address of p. Star star pp follows two arrows to reach seven.

> Caption: int **pp = &p stores the address of p. **pp follows two arrows to reach 7.

Exam-trap caption mode adds: ***pp is not the address of the address. It is the int at the end of the chain.*

**3:09–3:18** — This is how a function changes the caller's pointer, not just the value it points at.

> Caption: This is how a function changes the caller's pointer, not just the value it points at.

Exam-trap caption mode adds: *Passing int * lets you write to the int. It does not let you reassign the caller's pointer variable.*

## Scene 9. Dangling pointers

*3:18 – 3:42 · objective: See the object disappear while the pointer keeps the number.*

**3:18–3:24** — A local variable lives only while its function is running.

> Caption: A local variable lives only while its function is running.

Exam-trap caption mode adds: *Nothing in C stops you holding the address after the call ends. That is why this is a trap rather than an error message.*

**3:24–3:31** — Returning its address gives a pointer to a frame that no longer exists.

> Caption: Returning its address gives a pointer to a frame that no longer exists.

Exam-trap caption mode adds: *The compiler may warn, and often does not. A warning is not the point; the behaviour is undefined either way.*

**3:31–3:36** — The pointer still holds the number. The object is gone. That is a dangling pointer.

> Caption: The pointer still holds the number. The object is gone. That is a dangling pointer.

Exam-trap caption mode adds: *A dangling pointer is not NULL. It holds a real address, so a NULL check will not catch it.*

**3:36–3:42** — Reading or writing through it is undefined behaviour, not a predictable value.

> Caption: Reading or writing through it is undefined behaviour, not a predictable value.

Exam-trap caption mode adds: *A question whose program has undefined behaviour has no defined output. Saying so is the correct answer.*

## Scene 10. The rules worth carrying in

*3:42 – 4:00 · objective: Consolidate the three load-bearing rules.*

**3:42–3:48** — Rule one. p plus k moves k elements, never k bytes.

> Caption: Rule one: p + k moves k elements, never k bytes.

Exam-trap caption mode adds: *Every "what is the address" question is this rule, applied carefully.*

**3:48–3:54** — Rule two. a i is star a plus i, and the name decays except under sizeof and ampersand.

> Caption: Rule two: a[i] is *(a + i), and the name decays except under sizeof and &.

Exam-trap caption mode adds: *Forgetting the exceptions is what makes sizeof(a) and &a + 1 come out wrong.*

**3:54–4:00** — Rule three. sizeof reports the object's size, and a pointer reports only its own.

> Caption: Rule three: sizeof reports the object's size; a pointer reports only its own.

Exam-trap caption mode adds: *sizeof(pointer) is a constant for the machine. It never varies with what the pointer points at.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
