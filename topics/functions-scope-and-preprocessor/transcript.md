# Functions, Scope, Lifetime and the Preprocessor — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/functions-scope-and-preprocessor/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A prototype is a promise the compiler can check

*0:00 – 0:30 · objective: Separate a declaration from a definition, and see what is lost when the prototype is missing.*

**0:00–0:08** — A declaration tells the compiler the name, the parameter types and the return type. A definition also supplies the body.

> Caption: A declaration tells the compiler the name, the parameter types and the return type. A definition also supplies the body.

Exam-trap caption mode adds: *A definition is also a declaration. The two words are not opposites.*

**0:08–0:16** — With a prototype in view, the compiler converts each argument to the declared parameter type, as if by assignment.

> Caption: With a prototype in view, the compiler converts each argument to the declared parameter type, as if by assignment.

Exam-trap caption mode adds: *The conversion is silent. A double passed to an int parameter is truncated with no warning unless you enable warnings.*

**0:16–0:23** — Without a prototype the compiler cannot convert. Only the default argument promotions apply.

> Caption: Without a prototype the compiler cannot convert. Only the default argument promotions apply: char and short become int, float becomes double.

Exam-trap caption mode adds: *printf("%f", f) is safe because float is promoted to double; printf("%f", 1.0f) is not the trap it looks like. printf("%d", 3.7) is.*

**0:23–0:30** — So a char parameter that receives a promoted int is undefined behaviour. The code still compiles.

> Caption: So a char parameter that receives a promoted int is undefined behaviour. The code still compiles, and the answer is not yours to predict.

Exam-trap caption mode adds: *A question that asks for the output of such a program has no defined answer. That is often the intended answer.*

## Scene 2. Every argument is copied into the parameter

*0:30 – 1:00 · objective: Show why a swap on parameters cannot change the caller, and why an array parameter is really a pointer.*

**0:30–0:38** — Every argument is copied into a new parameter object. The parameter is not the caller's variable.

> Caption: Every argument is copied into a new parameter object. The parameter is not the caller's variable.

Exam-trap caption mode adds: *A parameter that is modified is a modified copy. The caller sees nothing.*

**0:38–0:46** — So a swap that swaps its own parameters changes nothing in main. The two copies die when the call returns.

> Caption: So a swap that swaps its own parameters changes nothing in main. The two copies die when the call returns.

Exam-trap caption mode adds: *This is the most common single mistake in the whole topic. It is not a bug in the compiler.*

**0:46–0:53** — An array parameter is the same rule in disguise: a parameter declared int a[] is adjusted to int *a.

> Caption: An array parameter is the same rule in disguise: a parameter declared int a[] is adjusted to int *a. The pointer is copied, not the array.

Exam-trap caption mode adds: *void f(int a[10]) does not check that the caller passes ten elements. The 10 is ignored.*

**0:53–1:00** — That is why sizeof inside the function gives the size of a pointer, not the size of the caller's array.

> Caption: That is why sizeof inside the function gives the size of a pointer, not the size of the caller's array.

Exam-trap caption mode adds: *The idiom sizeof(a)/sizeof(a[0]) works only where the array is still an array, which means not inside a function that took it as a parameter.*

## Scene 3. Scope decides which object a name refers to

*1:00 – 1:30 · objective: Resolve a shadowed name by searching from the innermost block outward.*

**1:00–1:08** — Scope is where a name is visible. C has block scope, function scope, file scope and function-prototype scope.

> Caption: Scope is where a name is visible. C has block scope, function scope, file scope and function-prototype scope.

Exam-trap caption mode adds: *Function-prototype scope means a parameter name in a declaration is invisible in the definition. Only the types matter.*

**1:08–1:16** — Name lookup starts in the innermost block and moves outward. The first declaration found wins.

> Caption: Name lookup starts in the innermost block and moves outward. The first declaration found wins.

Exam-trap caption mode adds: *There is no ambiguity and no error. The inner name simply wins, silently.*

**1:16–1:24** — So a local hides a global of the same name. That is shadowing.

> Caption: So a local hides a global of the same name. That is shadowing, and it is what makes a two-variable trace confusing.

Exam-trap caption mode adds: *Two objects with one spelling in one program is legal. GATE uses it deliberately.*

**1:24–1:30** — In the 2023 question, main's x and the static x inside funcp are different objects that happen to share a spelling.

> Caption: In the 2023 question, main's x and the static x inside funcp are different objects that happen to share a spelling.

Exam-trap caption mode adds: *A trace that treats the two x as one variable gets every number wrong after the first call.*

## Scene 4. Scope and lifetime are different questions

*1:30 – 2:00 · objective: Distinguish where a name is visible from when the object exists, using the two storage durations.*

**1:30–1:38** — Scope and lifetime are different questions. Scope asks where the name is visible; lifetime asks when the object exists.

> Caption: Scope and lifetime are different questions. Scope asks where the name is visible; lifetime asks when the object exists.

Exam-trap caption mode adds: *An object can outlive its name, and a name can be visible where no object exists. Neither implies the other.*

**1:38–1:46** — An automatic object is created when its block is entered and destroyed when it is left.

> Caption: An automatic object is created when its block is entered and destroyed when it is left. Each call gets a fresh one.

Exam-trap caption mode adds: *A pointer to an automatic object becomes dangling the moment the call returns. Using it is undefined behaviour.*

**1:46–1:54** — A static object exists for the whole run and is initialised once, before main.

> Caption: A static object exists for the whole run and is initialised once, before main. A call does not recreate it.

Exam-trap caption mode adds: *The initialiser of a static local is not re-run. A statement such as static int n = 0; cannot be used to reset a counter.*

**1:54–2:00** — So a static local can count its own calls. Its name is still local; only its lifetime is global.

> Caption: So a static local can count its own calls. Its name is still local; only its lifetime is global.

Exam-trap caption mode adds: *Confusing the name's scope with the object's lifetime is the whole difficulty. Two lines, two different properties.*

## Scene 5. A static local is initialised once and remembers

*2:00 – 2:30 · objective: Trace a static counter, then use it to solve the 2019 paper's for-loop question.*

**2:00–2:08** — Here is the counter: static int n equals zero, then n plus plus, then return n. Three calls return 1, 2, 3.

> Caption: Here is the counter: static int n = 0; then n++; then return n. Three calls return 1, 2, 3.

Exam-trap caption mode adds: *Without static the answer would be 1, 1, 1. One keyword changes every call after the first.*

**2:08–2:16** — The 2019 paper hides the same idea in a loop header: for r(); r(); r(), with static int num equal to seven, returning num minus minus.

> Caption: The 2019 paper hides the same idea in a loop header: for (r(); r(); r()), with static int num = 7; return num--;

Exam-trap caption mode adds: *Every call to r() consumes one value, whether or not it looks like it belongs to the body.*

**2:16–2:24** — The initialisation runs once, then condition, body, update, condition. Each call returns the value and then decrements.

> Caption: The initialisation runs once, then condition, body, update, condition. Each r() returns the value and then decrements.

Exam-trap caption mode adds: *The post-decrement returns first and decrements second. Using --num instead shifts every printed digit.*

**2:24–2:30** — The body prints 5, then 2. The answer is 52.

> Caption: The body prints 5, then 2. The answer is 52, and the page computes it rather than trusting the trace.

Exam-trap caption mode adds: *63 and 630 come from decrementing before the return. 41 comes from one iteration too few.*

## Scene 6. Linkage is about the linker, not the block

*2:30 – 3:00 · objective: Read the four storage classes off one table: duration, linkage and the default initial value.*

**2:30–2:38** — Linkage is about the linker, not the block. External linkage means the name can be used from another translation unit.

> Caption: Linkage is about the linker, not the block. External linkage means the name can be used from another translation unit.

Exam-trap caption mode adds: *Scope is a compile-time question; linkage is a link-time question. They are independent.*

**2:38–2:46** — static at file scope gives internal linkage, so the name stays in this file. extern says the object exists, here or elsewhere.

> Caption: static at file scope gives internal linkage, so the name stays in this file. extern says the object exists, here or elsewhere.

Exam-trap caption mode adds: *extern int g; inside a function is a declaration. int g; at file scope is a tentative definition. The two do different things.*

**2:46–2:54** — The four storage classes fix three things at once: storage duration, linkage, and the default initial value.

> Caption: The four storage classes fix three things at once: storage duration, linkage, and the default initial value.

Exam-trap caption mode adds: *register forbids taking the address of the object. That is a constraint, not a hint.*

**2:54–3:00** — Automatic objects start as garbage. Objects with static duration start as zero.

> Caption: Automatic objects start as garbage. Objects with static duration start as zero. That one difference answers many questions.

Exam-trap caption mode adds: *Reading an uninitialised automatic variable is undefined behaviour, not "probably zero".*

## Scene 7. A macro is a text substitution, not a function

*3:00 – 3:30 · objective: Expand SQR(b+2) by hand and get 14, then see the parentheses that give 36.*

**3:00–3:08** — Hash define is a text substitution done before the compiler sees the code. SQR of x, open x times x close, with b plus two becomes b plus two times b plus two.

> Caption: #define is a text substitution done before the compiler sees the code. SQR(x) (x*x) with b+2 becomes b+2*b+2.

Exam-trap caption mode adds: *A macro is not a function. There is no type checking, no scope, and no call.*

**3:08–3:16** — With b equal to four that is four plus two times four plus two, which is fourteen, not thirty six.

> Caption: With b = 4 that is 4 + 2*4 + 2 = 14, not 36. Multiplication binds tighter than addition.

Exam-trap caption mode adds: *The answer 36 is what a function call would give. The whole question is whether you remember there is no function.*

**3:16–3:23** — The fix is two pairs of parentheses: around each parameter, and around the whole body. That gives thirty six.

> Caption: The fix is two pairs of parentheses: around each parameter, and around the whole body. ((x)*(x)) gives 36.

Exam-trap caption mode adds: *One pair is not enough. The classic half-fix is #define SQR(x) (x*x), which is exactly the broken version.*

**3:23–3:30** — The same trap turns sixty four divided by SQR of four into sixty four divided by four times four, which is sixty four instead of four.

> Caption: The same trap turns 64 / SQR(4) into 64/4*4 = 64 instead of 4. Division and multiplication share a level and run left to right.

Exam-trap caption mode adds: *This shape appears in coaching material attributed to more than one exam. Check the arithmetic, not the label.*

## Scene 8. Parentheses do not fix double evaluation

*3:30 – 4:00 · objective: Show that a fully parenthesised macro still evaluates its argument twice when it uses it twice.*

**3:30–3:38** — A macro argument is substituted once for every use in the body. Two uses mean two evaluations.

> Caption: A macro argument is substituted once for every use in the body. Two uses mean two evaluations.

Exam-trap caption mode adds: *This survives every parenthesis. No amount of bracketing makes a macro evaluate an argument once.*

**3:38–3:46** — With i equal to five, SQR of i plus plus expands to i plus plus times i plus plus. The product is thirty, and i becomes seven.

> Caption: With i = 5, SQR(i++) expands to ((i++)*(i++)). The first gives 5, the second gives 6, so the product is 30.

Exam-trap caption mode adds: *The expected 25 requires a function, or a temporary. Neither is what the macro does.*

**3:46–3:53** — A function evaluates each argument once, because the argument is evaluated to produce the copy.

> Caption: A function evaluates each argument once, because the argument is evaluated to produce the copy. That is the difference.

Exam-trap caption mode adds: *A macro is chosen for speed or for being type-generic. Both reasons are weaker than they look once a side effect is involved.*

**3:53–4:00** — So use a macro for a constant or a type-generic wrapper, and a function when an argument can have a side effect.

> Caption: So use a macro for a constant or a type-generic wrapper, and a function when an argument can have a side effect.

Exam-trap caption mode adds: *Both the missing parentheses and the double evaluation appear in the same question, and only one is fixed by brackets.*

## Scene 9. #include pastes text; conditional compilation deletes it

*4:00 – 4:30 · objective: See why an include guard is needed, and what NDEBUG does to assert.*

**4:00–4:08** — Hash include is textual: the whole header is pasted in at that line. Nothing checks whether it was already included.

> Caption: #include is textual: the whole header is pasted in at that line. Nothing checks whether it was already included.

Exam-trap caption mode adds: *The preprocessor has no memory of what it has already read in this file, unless you give it one.*

**4:08–4:16** — Include the same header twice and its struct definition appears twice, which is an error. An include guard prevents it.

> Caption: Include the same header twice and its struct definition appears twice, which is an error. An include guard prevents it.

Exam-trap caption mode adds: *A header with only declarations of functions survives double inclusion. A header with definitions does not.*

**4:16–4:23** — If not defined guard, define guard, then the body, then end if. On the second inclusion the body expands to nothing.

> Caption: #ifndef GUARD, #define GUARD, then the body, then #endif. On the second inclusion the body expands to nothing.

Exam-trap caption mode adds: *The guard must be the very first and very last thing in the file, or part of the header is still pasted twice.*

**4:23–4:30** — Conditional compilation chooses code before compiling. NDEBUG turns assert into nothing, so a debug check can vanish in a release build.

> Caption: Conditional compilation chooses code before compiling. NDEBUG turns assert into nothing, so a debug check can vanish in a release build.

Exam-trap caption mode adds: *The test is made where assert.h is included, not where assert is written. Defining NDEBUG after the include changes nothing.*

## Scene 10. Four build steps, and one definition per name

*4:30 – 5:00 · objective: Follow one source file through preprocess, compile, assemble and link, and see what the linker rejects.*

**4:30–4:38** — The build is four steps: preprocess, compile, assemble, link. Each one has its own kind of error.

> Caption: The build is four steps: preprocess, compile, assemble, link. Each one has its own kind of error.

Exam-trap caption mode adds: *A missing include usually shows up as a compile error, because a type or a prototype was never declared.*

**4:38–4:46** — The preprocessor expands macros and pastes includes. The compiler turns one translation unit into assembly.

> Caption: The preprocessor expands macros and pastes includes. The compiler turns one translation unit into assembly. The assembler makes an object file.

Exam-trap caption mode adds: *Each .c file is compiled separately. That is why a prototype must be visible in every file that calls the function.*

**4:46–4:53** — The linker joins the object files and resolves names. One external definition per name is the rule.

> Caption: The linker joins the object files and resolves names. One external definition per name is the rule.

Exam-trap caption mode adds: *A static function defined in a header is copied into every file that includes it. Each copy is private, so the link succeeds and the code is duplicated.*

**4:53–5:00** — Two non-static definitions of one global collide at link time. Two static ones do not, because each is private to its file.

> Caption: Two non-static definitions of one global collide at link time. Two static ones do not, because each is private to its file.

Exam-trap caption mode adds: *Making the name static also hides it from the other files that wanted it. The fix and the new bug are one keyword apart.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
