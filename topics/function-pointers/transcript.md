# Function Pointers — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/function-pointers/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A function is code at an address

*0:00 – 0:30 · objective: See a function pointer as an ordinary variable whose value is a code address, and see why it is not an int pointer.*

**0:00–0:07** — Start with what a function is in memory: a run of instructions at a fixed address. Here are three of them, add at 0x401136, mul at 0x401150 and neg at 0x40116A.

> Caption: Three functions, three addresses in the code segment. The instructions live here, not in the data segment.

**0:07–0:15** — Now a variable p of type pointer to function taking an int and returning an int. Its cell holds 0x401136. The cell is data; the thing it points at is code.

> Caption: A function pointer is an ordinary variable. Its value is one of those addresses, and it lives in the data segment.

**0:15–0:22** — You may write p equals add, or p equals ampersand add, or even p equals star add. All three store 0x401136, and the reason is the designator rule.

> Caption: Three ways to write the assignment, and all three store the same address: = add, = &add, = *add.

**0:22–0:30** — The pointer has a size, eight bytes here. The function does not: applying sizeof to a function type is a constraint violation, so a compiler must complain.

> Caption: sizeof p is eight bytes. sizeof add is not allowed at all: a function type has no size to report.

Exam-trap caption mode adds: *sizeof(&f) is the pointer size, sizeof(f) is a constraint violation, and sizeof(*f) is also a violation because *f is again the designator. Only the pointer has a size.*

## Scene 2. Reading int (*f)(int *) — GATE CSE 2005

*0:30 – 1:00 · objective: Read one declaration in four steps and pick the correct English sentence from four offered ones.*

**0:30–0:37** — A one-mark question from GATE CSE 2005: what does this statement declare? Four sentences, one of them true. Nine tokens, and the parentheses carry the whole answer.

> Caption: GATE CSE 2005 asked what int (*f)(int *) declares, and offered four English sentences.

**0:37–0:45** — Always begin at the identifier. Here it is f. Every other token in the declaration is a statement about f, and the reading must start there.

> Caption: Step one: find the identifier. It is f, and everything else describes f.

**0:45–0:52** — Inside the parentheses, the star binds first, so f is a pointer. Outside them, the parameter list says what it points to: a function that takes a pointer to int.

> Caption: Step two: the star inside the parentheses makes f a pointer. Step three: (int *) says it points at a function taking int *.

**0:52–1:00** — The remaining int is the return type. Read it out: f is a pointer to a function taking a pointer to int and returning an int. That is option C, and each wrong option moves exactly one word.

> Caption: Step four: what is left is the return type, int. So f is a pointer to function taking (int *) returning int — option C.

Exam-trap caption mode adds: *int *f(int *) is a function returning a pointer to int. Moving one star out of the parentheses changes the type completely, and that is the whole trap.*

## Scene 3. Four spellings, four different types

*1:00 – 1:30 · objective: Hold four declarations apart that share a base type and an identifier, and differ only in punctuation.*

**1:00–1:07** — First spelling. No parentheses around the star, so the parameter list binds first: f is a function, and the pointer is its return type.

> Caption: int *f(int) is a function taking an int and returning a pointer to int.

**1:07–1:15** — Second spelling. The parentheses make the star bind before the parameter list, so f is the pointer and the function is what it points at.

> Caption: int (*f)(int) is a pointer to a function taking an int and returning int. One pair of parentheses, a different type.

**1:15–1:22** — Third spelling. The brackets bind tighter than the star, so f is an array of three pointers. Each cell holds a function address. This is the dispatch table in scene nine.

> Caption: int (*f[3])(int) is an array of three pointers to functions. It is a table, not a pointer to a table.

**1:22–1:30** — Fourth spelling. Two stars, so f is a pointer to a pointer to a function. The extra level exists so that a function can change which handler a caller holds.

> Caption: int (**f)(int) is a pointer to a pointer to function: you can repoint which pointer is used.

Exam-trap caption mode adds: *An array of pointers to functions and a pointer to an array of functions look alike and behave nothing alike: int (*f[3])(int) against int (*f[3])[4]. Count the parentheses before reading either.*

## Scene 4. Why the parentheses decide everything

*1:30 – 2:00 · objective: Derive the two readings from the declarator grammar instead of memorising them.*

**1:30–1:37** — This is why the parenthesis matters, and it is a rule, not a convention. A declarator is an optional star, then a direct-declarator, and the suffixes attach to the direct-declarator.

> Caption: The grammar is short: a declarator is an optional pointer followed by a direct-declarator.

**1:37–1:45** — Left side. The suffix attaches to f directly, so the function is built first, and the star then wraps the result. Function first, pointer second.

> Caption: In int *f(int), the parameter list attaches first: f is a function, then the pointer applies to what it returns.

**1:45–1:52** — Right side. The parentheses make the star part of the inner declarator, so the pointer is built first and the parameter list then wraps that. Pointer first, function second.

> Caption: In int (*f)(int), the star attaches first: f is a pointer, and the function is what it points at.

**1:52–2:00** — The English sentence is just the constructor chain read out loud, with the base type at the end. Learn the two orders and no declaration can surprise you.

> Caption: So the reading order is the constructor order, and the base type is always applied last.

Exam-trap caption mode adds: *Reading the declaration left to right gives the wrong answer every time. The base type int on the left is applied last, not first.*

## Scene 5. The signal declaration, peeled inside out

*2:00 – 2:30 · objective: Read the standard library's hardest declaration in four steps, and collapse it with one typedef.*

**2:00–2:07** — One declaration from the standard library, and the one everybody skips: signal. Read it from the identifier outward and it comes apart in four steps.

> Caption: This is the declaration of signal in signal.h. It is the hardest one the standard library asks you to read.

**2:07–2:15** — Signal is followed by a parameter list, so it is a function. Its two parameters are an int and a pointer to a function taking an int and returning void.

> Caption: Step one: signal followed by a parameter list, so signal is a function taking an int and a handler.

**2:15–2:22** — Outside the parameter list there is a star, so the function returns a pointer. The trailing parameter list says that pointer points at a function taking an int and returning void.

> Caption: Step two: the star before signal makes the result a pointer, and the trailing (int) says what it points at.

**2:22–2:30** — Here is the whole reading in one sentence. Then one typedef, and the same declaration fits on a line. That is the practical lesson: when a declarator hurts, name a piece of it.

> Caption: The full reading, then one typedef that collapses it: typedef void (*handler)(int); handler signal(int, handler);

Exam-trap caption mode adds: *The trailing (int) belongs to the return type, not to the parameters. Reading it as part of the argument list is the standard mistake on this declaration.*

## Scene 6. Calling through the pointer

*2:30 – 3:00 · objective: See that f, &f and *f name the same address, that p(3) and (*p)(3) are the same call, and that *p(3) is not.*

**2:30–2:37** — Back to the machine. A pointer cell holds an address; calling through it loads that address and jumps. One extra load, and nothing else changes.

> Caption: A pointer cell holding 0x401136, and the function it points at. Calling through it is one extra load.

**2:37–2:45** — Calling f directly, the designator decays to a pointer and then the call happens. Writing star f in parentheses, the star turns the pointer back into the designator, which decays again. Same address, same call.

> Caption: f(3) and (*f)(3) are the same call. The star is undone by the designator rule.

**2:45–2:52** — Here is the trap. Without the parentheses, the call binds tighter than the star, so star p of three means: call p, then dereference the int it returned. The compiler will refuse, or worse, accept it.

> Caption: But *p(3) is *(p(3)): it calls p first and dereferences the int it returns. That is not a call at all.

Exam-trap caption mode adds: *The parentheses in (*p)(3) are not decoration: they are what makes the star apply to the pointer instead of to the result of the call.*

**2:52–3:00** — Three spellings, one address: f, ampersand f and star f all give 0x401136, which the model checks by resolving all three. Ampersand p is different: that is the address of the pointer cell itself.

> Caption: f, &f and *f all name 0x401136. But &p is the address of the cell, not the code.

## Scene 7. qsort: the contract the callback must keep

*3:00 – 3:30 · objective: State the comparator contract and count the comparisons a real sort makes under it.*

**3:00–3:07** — qsort knows nothing about your data. It moves fixed-size blocks and asks your comparator, every time it needs to compare two of them.

> Caption: Six integers, and a comparator the sort will call with pointers to two of them.

**3:07–3:15** — The contract has exactly three outcomes. Return negative when the first argument is smaller, zero when they are equal, positive when it is larger. Any other convention breaks the sort silently.

> Caption: The contract: negative if the first is less, zero if equal, positive if greater. Nothing else is promised.

**3:15–3:22** — Run a comparison-counting sort over that array with the correct comparator and it takes eleven comparisons. The bounds are at least five and at most fifteen, and eleven sits inside them.

> Caption: Under the correct comparator this array sorts in eleven comparisons — inside the five to fifteen bounds.

**3:22–3:30** — The array has two 3s. After sorting, either may come first, because qsort is not stable. If the tie matters, add a tie-breaker to the comparator.

> Caption: Equal elements may come out in either order: qsort is not stable. The two 3s are not interchangeable.

Exam-trap caption mode adds: *Returning 1 and -1 with no zero case is not the same as returning a difference: two equal keys then report a strict order, and the sort may produce a different array depending on the algorithm.*

## Scene 8. Two comparators that compile and lie

*3:30 – 4:00 · objective: Predict the wrong output of the subtraction comparator and the boolean comparator, and repair both.*

**3:30–3:37** — Everybody writes return a minus b, and for small integers it is correct. Take a equal to two billion and b equal to minus two billion and the difference is four billion.

> Caption: The most common comparator is return a - b. With a two billion and b minus two billion, that is four billion.

**3:37–3:45** — Four billion does not fit in a 32-bit int, so the result wraps to minus 294967296. The comparator now reports that the larger value is smaller, and the pair stays in the order it arrived.

> Caption: Four billion does not fit in an int. It wraps to minus two hundred ninety-four million, so the sign is wrong.

Exam-trap caption mode adds: *On a 64-bit int this particular pair is fine, and the bug hides until the values get large enough. That is why the subtraction comparator survives review.*

**3:45–3:52** — The second mistake returns a greater-than b. That yields one or zero, and never minus one. So every pair reads as not-less, and nothing ever moves.

> Caption: The second broken comparator returns a > b, which is 1 or 0 and never negative.

**3:52–4:00** — Both bugs have the same repair: return a greater-than b minus a less-than b. That gives exactly minus one, zero and one, with no subtraction of the values themselves.

> Caption: The repair is one line: return (a > b) - (a < b). Three outcomes, no arithmetic to overflow.

Exam-trap caption mode adds: *Writing return a - b is safe only when the values are known to be small. GATE questions that show large values are testing exactly this line.*

## Scene 9. An array of function pointers is a jump table

*4:00 – 4:30 · objective: Replace a switch with an indexed table, check the two agree, and price the difference.*

**4:00–4:07** — An array of function pointers, one cell per operator. The opcode is the index, so choosing an operation is an array subscript, not a chain of tests.

> Caption: Four function pointers in one array: add, sub, mul, div. The opcode is the index.

**4:07–4:15** — A three-step program: add five, multiply by three, subtract two. Walking it through the table gives thirteen. Walking the same program through a switch also gives thirteen.

> Caption: The program adds five, multiplies by three, subtracts two. Table lookup and switch both give thirteen.

**4:15–4:22** — Not one program: all of them. Three steps, four opcodes and three arguments each gives 1728 programs, and the table and the switch agreed on all 1728.

> Caption: The model ran all one thousand seven hundred twenty-eight programs of three steps both ways, and they agreed every time.

**4:22–4:30** — Why use a table at all? Because an if-chain over four operators averages two and a half comparisons per instruction, while a table costs one. Over a thousand instructions, 2500 tests against 1000.

> Caption: Cost: an if-chain over four operators averages two and a half tests per instruction, the table one. Over a thousand instructions that is 2500 against 1000.

Exam-trap caption mode adds: *The table is writable at run time, which is the point and the risk. A corrupted entry turns a data bug into a jump into arbitrary code.*

## Scene 10. Where the standard says undefined

*4:30 – 5:00 · objective: Name the five clauses that make the sharp edges of this topic, so no exam answer is guessed.*

**4:30–4:37** — First rule, and the one that matters most: you may convert a function pointer to another function pointer type and back, but calling through the converted pointer when the types are not compatible is undefined.

> Caption: Calling through a converted pointer of the wrong type is undefined behaviour.

**4:37–4:45** — Second rule. Adding one to a function pointer requires a pointer to a complete object type, and a function type is not an object type. GCC allows it as an extension, treating the size as one.

> Caption: Arithmetic on a function pointer is not allowed: addition needs a pointer to a complete object type.

**4:45–4:52** — Third rule. sizeof cannot be applied to a function type, and the reason is that a function is not an object: there is no size to report. The pointer, by contrast, has the machine's pointer size.

> Caption: sizeof of a function is a constraint violation; sizeof of the pointer is the pointer size.

**4:52–5:00** — Fourth rule, and the one that catches people inside the callee. Write a parameter as a function type and it is adjusted to a pointer to function, so ampersand cb is one level deeper than you might think. Converting is legal; calling through the wrong type is not.

> Caption: A parameter written with a function type is adjusted to a pointer. Inside the callee, &cb is a pointer to a pointer.

Exam-trap caption mode adds: *A comparator declared as int (*)(int *, int *) and cast to the void * signature is the textbook case of 6.3.2.3p8. It usually appears to work, which is why it survives in real code.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
