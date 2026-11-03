# Command-Line Arguments in C: argc, the argv Pointer Array and the Null Sentinel — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/command-line-arguments-in-c/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 50 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Four words arrive, and one of them is the program

*0:00 – 0:30 · objective: See that the shell splits a command line into words before the program starts, that the program name is one of those words, and that main receives the count and the words as its two parameters.*

**0:00–0:06** — When you type a command and press enter, the shell does not hand your program one long line of text. It splits the line into words first, and your program begins with the words already separated.

> Caption: The shell splits the command line into words before your program starts.

**0:06–0:12** — The first word is the name you used to start the program. The four words here are the name, then ten, then twenty, then a plus sign.

> Caption: The first word is the program's own name, and it counts.

Exam-trap caption mode adds: *A program that forgets the name is present will report one argument too many, or one too few, on every run.*

**0:12–0:18** — The count and the list of words travel into your program as the two parameters of main. That is the whole mechanism.

> Caption: The operating system passes the count and the words to main.

**0:18–0:24** — main is not special syntax. It is a function with a return type of int, and the startup code calls it, the same way any function is called.

> Caption: main is an ordinary function, called by the environment.

**0:24–0:30** — Remember the arithmetic of this picture. You typed three things after the name, and four words arrive. The difference of one is the name itself.

> Caption: Three things were typed after the name; four words arrive.

## Scene 2. argc counts the program name

*0:30 – 1:00 · objective: Establish that argc is the number of strings, so three typed parameters give argc equal to four, and that argc minus one is the parameter count whenever argc is at least one.*

**0:30–0:36** — argc is a count of strings in the array. It is not a count of the things you typed after the name.

> Caption: argc is the number of strings in argv, not the number of things you typed.

**0:36–0:42** — On this run argc is four, and the parameters you supplied number three. Both numbers are correct; they count different things.

> Caption: Here argc is 4 while the parameters number 3.

Exam-trap caption mode adds: *A question that says "the program is run with three arguments" is telling you argc equals four, not three.*

**0:42–0:48** — Subtract one and you have the number of parameters, as long as argc is at least one. On this run that is three.

> Caption: argc minus one is the parameter count, whenever argc is at least one.

**0:48–0:54** — A program that insists on exactly three parameters therefore tests argc for the value four, and rejects every other count.

> Caption: So a program that wants three parameters tests argc for 4.

**0:54–1:00** — Every question on this topic is, at bottom, a question about whether you remembered the program name.

> Caption: That one extra word is where most marks are lost.

## Scene 3. argv is an array of pointers

*1:00 – 1:30 · objective: Draw the two-level structure: slots that hold addresses, and separate character arrays behind them, each with its own null terminator.*

**1:00–1:06** — Here is the part a picture settles. argv is an array of slots, and each slot holds a pointer. The characters are somewhere else.

> Caption: argv is an array whose slots hold pointers, not characters.

**1:06–1:12** — Follow a pointer and you land on a character array. Each of those arrays ends with a null character, exactly like every other C string.

> Caption: Each pointer leads to a separate character array ending in a null.

Exam-trap caption mode adds: *A string terminator is a zero byte. The sentinel closing argv is a zero pointer. Do not count them as the same object.*

**1:12–1:18** — Slot zero points at the program name. The first parameter you typed is therefore at slot one, not slot zero.

> Caption: argv[0] is the program name, so the first parameter is argv[1].

**1:18–1:24** — The four strings have four different lengths. Nothing lines up; the arrays are separate objects that happen to be reachable from one list.

> Caption: The strings have their own lengths, and they need not match.

**1:24–1:30** — Two subscripts, two steps. The first picks a pointer out of the array; the second picks a character out of the string that pointer names.

> Caption: Reading argv[2][0] gives the first character of the second parameter.

## Scene 4. argv[argc] is a null pointer, and the standard requires it

*1:30 – 2:00 · objective: Locate the one extra slot, see that its value is a null pointer by requirement rather than by luck, and separate comparing it from dereferencing it.*

**1:30–1:36** — Count the slots. There are five, and argc is four. The extra slot is not an accident of this implementation; it is required.

> Caption: The array has one slot more than argc, and the last slot is guaranteed null.

**1:36–1:42** — The standard does not say it is usually null. It says it shall be a null pointer, in a list of constraints on the parameters of main.

> Caption: argv[argc] shall be a null pointer — that is the standard's word.

Exam-trap caption mode adds: *This is a promise about the value at index argc. It is not a promise that index argc plus one exists.*

**1:42–1:48** — So you may compare the slot against a null pointer. You may not hand that pointer to a function that reads a string through it.

> Caption: That null is a value you may compare, never a string you may read.

**1:48–1:54** — The purpose of the extra slot is to let a loop run until it meets the null, without being told how many entries there are.

> Caption: It exists so a loop can stop on it without knowing the count.

**1:54–2:00** — Hold the two operations apart. Testing the pointer is fine. Following it is not.

> Caption: Compare against it freely; dereference it and the program is undefined.

## Scene 5. Walking with a counter

*2:00 – 2:30 · objective: Trace a loop bounded by argc, and see that atoi turns the non-numeric word into 0, so a loop that starts at the wrong index still prints the right total.*

**2:00–2:06** — The usual loop initialises its index to one, and runs while the index is below argc. Starting at one skips the name.

> Caption: A counter loop starts at 1 to skip the program name.

**2:06–2:12** — Each word goes through atoi, which turns text into an integer, and the integers are added. Ten plus twenty is thirty.

> Caption: It adds atoi of the words, so ten plus twenty is thirty.

**2:12–2:18** — The loop does reach the plus sign at index three. atoi finds no digits after the sign, so it returns zero, and the total is unchanged.

> Caption: The plus sign is read too, and atoi turns it into 0.

Exam-trap caption mode adds: *A program that prints the right total can still be reading the wrong words. Correct output is not evidence of a correct loop.*

**2:18–2:24** — Now start the same loop at zero. The extra word is the program name, and atoi of a word that begins with a dot finds no digits.

> Caption: Starting at 0 instead would add atoi of the program name.

**2:24–2:30** — Both loops print thirty. What separates them is not the output but the bound, and a question that changes the program name to something starting with a digit would expose it.

> Caption: The total hides the bug; only the bound tells the truth.

## Scene 6. Walking with the sentinel, and the loop that reaches the null

*2:30 – 3:00 · objective: Trace the sentinel loop to the same total, then run the loop with bound argc inclusive and watch it hand a null pointer to printf, which is undefined rather than an empty line.*

**2:30–2:36** — The second loop ignores argc entirely. It reads the slot, tests the pointer, and stops the moment the pointer is null.

> Caption: The sentinel loop reads a pointer and stops when it is null.

**2:36–2:42** — It reads indices one, two and three, meets the null at four, and stops. Same three words, same total.

> Caption: It visits the same three slots and prints the same 30.

**2:42–2:48** — Now change the loop bound from less-than to less-than-or-equal. The counter reaches index four, and the pointer stored there is null.

> Caption: A bound of argc inclusive also reaches index 4, and that pointer is null.

Exam-trap caption mode adds: *The failure is in the body, not the condition. A loop that fetches a null pointer and tests it is fine; one that passes it to printf is not.*

**2:48–2:54** — Passing that null pointer to printf with a percent s is undefined behaviour. It is not guaranteed to print nothing, and it is not guaranteed to crash.

> Caption: Handing a null pointer to printf is undefined, not an empty line.

**2:54–3:00** — So the rule for the extra slot is short. Test it. Do not use it.

> Caption: The null is there to be tested, not to be printed.

## Scene 7. No arguments at all

*3:00 – 3:30 · objective: Run the program with nothing after its name, read argc as 1 and argv[1] as a null pointer, and see why the test on argc must come before the read.*

**3:00–3:06** — Start the program with no parameters at all. argc is one, because the name is still there.

> Caption: Run with nothing after the name, and argc is 1 — never 0.

Exam-trap caption mode adds: *The most common wrong answer to "what is argc here" is 0. The name is a word like any other.*

**3:06–3:12** — The array still has its sentinel. With argc equal to one, the null sits at index one, which is exactly the slot a parameter would have used.

> Caption: argv[1] then holds the null pointer, so there is no string there.

**3:12–3:18** — A program that goes straight to atoi of slot one on this run is following a null pointer. That is undefined behaviour, not a zero.

> Caption: atoi(argv[1]) on that run dereferences null: undefined.

**3:18–3:24** — The repair is a test on the count, placed before any slot is read. If argc is below two there is no first parameter, and the program should say so.

> Caption: The guard is a test of argc before the read, not after.

**3:24–3:30** — One caution about the general case. The standard requires only that argc be nonnegative, so a count of zero is permitted, and then argv[0] is not required to be a name at all.

> Caption: argc may be 0 in the standard's wording, and then argv[0] is not the name.

## Scene 8. Turning a word into a number

*3:30 – 4:00 · objective: Read atoi as a prefix converter with no failure report, and strtol as the same conversion with an end pointer that does report where the number stopped.*

**3:30–3:36** — Nothing in argv is a number. Every slot points at characters. A program that wants an integer has to convert one.

> Caption: Every parameter arrives as text, so a number has to be converted.

**3:36–3:42** — atoi skips leading blanks, takes an optional sign, reads digits, and stops at the first character that cannot continue the number.

> Caption: atoi reads the longest prefix that forms a number and stops.

**3:42–3:48** — Here is the weakness. atoi has no way to say that nothing was converted, so the word abc and the word zero produce the same integer.

> Caption: atoi cannot report failure: abc and 0 both give 0.

Exam-trap caption mode adds: *Never test atoi's result against zero to decide whether the argument was a number. Both failures and real zeros land there.*

**3:48–3:54** — strtol performs the same conversion and also writes back an address. That address is where reading stopped, and comparing it with the start is the error test.

> Caption: strtol takes an end pointer, and the end pointer is the report.

**3:54–4:00** — So the choice is a choice about error reporting. atoi is shorter and loses the distinction; strtol keeps it.

> Caption: Use strtol when zero and nonsense must be told apart.

## Scene 9. Two declarations that are one type

*4:00 – 4:30 · objective: Show that char *argv[] and char **argv are the same parameter, and that sizeof on argv inside main measures a pointer rather than the array.*

**4:00–4:06** — These two spellings look different and are the same thing in a parameter list. Both say that argv is a pointer to a pointer to char.

> Caption: char *argv[] and char **argv declare the same parameter.

**4:06–4:12** — The reason is a rule of the language rather than a special case for main. A parameter declared with an array type is adjusted to a pointer type before anything else happens.

> Caption: In a parameter list an array type is rewritten as a pointer.

**4:12–4:18** — Now the consequence. Measuring argv inside main gives the width of one pointer, not the width of the whole list.

> Caption: So sizeof(argv) inside main is the size of a pointer, not the array.

Exam-trap caption mode adds: *A common wrong answer to "what does sizeof(argv) print" is argc times the pointer width. It is the pointer width alone.*

**4:18–4:24** — The number of entries comes from argc, and from nowhere else. No measurement of argv can recover it.

> Caption: The count is argc; the pointer width tells you nothing about it.

**4:24–4:30** — Follow the stars and the measurements shrink. One star gives the size of a pointer, two stars give the size of a character.

> Caption: sizeof(*argv) is a pointer, and sizeof(**argv) is one byte.

## Scene 10. What is guaranteed, what is left open

*4:30 – 5:00 · objective: Sort the standard's statements into promises and open choices, then reduce the whole topic to a five-step procedure.*

**4:30–4:36** — Two promises hold on every conforming implementation. The count is never negative, and the slot at index argc is a null pointer.

> Caption: Guaranteed: argc is nonnegative, and the slot at argc is null.

**4:36–4:42** — A third promise. The strings are not read-only literals; a program is allowed to change the characters in them.

> Caption: Guaranteed: argv and the strings it points to may be modified.

Exam-trap caption mode adds: *This is the opposite of the rule for string literals. Copying that rule here gives the wrong answer.*

**4:42–4:48** — Modifiable does not mean roomy. A string is as long as it was, and writing beyond its terminator is still out of bounds.

> Caption: Still not allowed: writing past a string's own length.

**4:48–4:54** — Some things are deliberately not fixed. Where the characters are stored is up to the implementation, and so is the exact text of the program name.

> Caption: Left open: where the strings live, and what argv[0] holds.

**4:54–5:00** — That is the whole procedure. Check the count before reading anything. Start the loop at one. Stop at argc, or at the null if you are walking the sentinel. Convert with the error reporting you need. Report what went wrong.

> Caption: Five steps: check argc, start at 1, stop at argc or null, convert, report.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
