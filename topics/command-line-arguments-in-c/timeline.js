/* ==========================================================================
   command-line-arguments-in-c — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   captions.vtt, captions.srt and transcript.md are derived from this file by
   tools/gen-captions.mjs — never edited by hand.

   Every number quoted in a caption is computed by the model in lesson.js and
   printed on the canvas; the two agree because both read the same computation.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'shell', n: 1,
      title: 'Four words arrive, and one of them is the program',
      start: 0, end: 30,
      objective: 'See that the shell splits a command line into words before the program starts, that the program name is one of those words, and that main receives the count and the words as its two parameters.'
    },
    {
      id: 'argc', n: 2,
      title: 'argc counts the program name',
      start: 30, end: 60,
      objective: 'Establish that argc is the number of strings, so three typed parameters give argc equal to four, and that argc minus one is the parameter count whenever argc is at least one.'
    },
    {
      id: 'argv', n: 3,
      title: 'argv is an array of pointers',
      start: 60, end: 90,
      objective: 'Draw the two-level structure: slots that hold addresses, and separate character arrays behind them, each with its own null terminator.'
    },
    {
      id: 'sentinel', n: 4,
      title: 'argv[argc] is a null pointer, and the standard requires it',
      start: 90, end: 120,
      objective: 'Locate the one extra slot, see that its value is a null pointer by requirement rather than by luck, and separate comparing it from dereferencing it.'
    },
    {
      id: 'counter', n: 5,
      title: 'Walking with a counter',
      start: 120, end: 150,
      objective: 'Trace a loop bounded by argc, and see that atoi turns the non-numeric word into 0, so a loop that starts at the wrong index still prints the right total.'
    },
    {
      id: 'while', n: 6,
      title: 'Walking with the sentinel, and the loop that reaches the null',
      start: 150, end: 180,
      objective: 'Trace the sentinel loop to the same total, then run the loop with bound argc inclusive and watch it hand a null pointer to printf, which is undefined rather than an empty line.'
    },
    {
      id: 'none', n: 7,
      title: 'No arguments at all',
      start: 180, end: 210,
      objective: 'Run the program with nothing after its name, read argc as 1 and argv[1] as a null pointer, and see why the test on argc must come before the read.'
    },
    {
      id: 'atoi', n: 8,
      title: 'Turning a word into a number',
      start: 210, end: 240,
      objective: 'Read atoi as a prefix converter with no failure report, and strtol as the same conversion with an end pointer that does report where the number stopped.'
    },
    {
      id: 'decl', n: 9,
      title: 'Two declarations that are one type',
      start: 240, end: 270,
      objective: 'Show that char *argv[] and char **argv are the same parameter, and that sizeof on argv inside main measures a pointer rather than the array.'
    },
    {
      id: 'guarantee', n: 10,
      title: 'What is guaranteed, what is left open',
      start: 270, end: 300,
      objective: 'Sort the standard\'s statements into promises and open choices, then reduce the whole topic to a five-step procedure.'
    }
  ],

  events: [
    /* ---------------- scene 1: four words arrive ---------------- */
    {
      id: 'e01', scene: 'shell', start: 0, end: 6,
      caption: 'The shell splits the command line into words before your program starts.',
      narration: 'When you type a command and press enter, the shell does not hand your program one long line of text. It splits the line into words first, and your program begins with the words already separated.',
      detail: 'The splitting happens in the shell, which is a separate program. Your C program never sees the spaces, the quotes or the original line. It sees the finished list of words, and nothing else. That is why a program cannot recover whether you typed one space or five.',
      keyword: 'splits the command line'
    },
    {
      id: 'e02', scene: 'shell', start: 6, end: 12,
      caption: 'The first word is the program\'s own name, and it counts.',
      narration: 'The first word is the name you used to start the program. The four words here are the name, then ten, then twenty, then a plus sign.',
      detail: 'The word is whatever the shell was asked to run: a bare name, a relative path or an absolute path. Which of those it is, is decided by how the program was started, not by the C language.',
      keyword: 'the program\'s own name',
      trap: 'A program that forgets the name is present will report one argument too many, or one too few, on every run.'
    },
    {
      id: 'e03', scene: 'shell', start: 12, end: 18,
      caption: 'The operating system passes the count and the words to main.',
      narration: 'The count and the list of words travel into your program as the two parameters of main. That is the whole mechanism.',
      detail: 'The C standard calls these two parameters argc and argv, and says any names may be used, because they are ordinary parameters local to main. The names are a convention, not a keyword.',
      keyword: 'the two parameters of main'
    },
    {
      id: 'e04', scene: 'shell', start: 18, end: 24,
      caption: 'main is an ordinary function, called by the environment.',
      narration: 'main is not special syntax. It is a function with a return type of int, and the startup code calls it, the same way any function is called.',
      detail: 'The standard states that the implementation declares no prototype for main, and that it is defined either with no parameters or with the two shown here, or in some other implementation-defined manner.',
      keyword: 'called by the environment'
    },
    {
      id: 'e05', scene: 'shell', start: 24, end: 30,
      caption: 'Three things were typed after the name; four words arrive.',
      narration: 'Remember the arithmetic of this picture. You typed three things after the name, and four words arrive. The difference of one is the name itself.',
      detail: 'Everything in the rest of this lesson follows from that one extra word. Counting it wrongly is the single most common error on this topic.',
      keyword: 'four words arrive'
    },

    /* ---------------- scene 2: argc counts the program name ---------------- */
    {
      id: 'e06', scene: 'argc', start: 30, end: 36,
      caption: 'argc is the number of strings in argv, not the number of things you typed.',
      narration: 'argc is a count of strings in the array. It is not a count of the things you typed after the name.',
      detail: 'The name argc is short for argument count. The standard only requires that its value is nonnegative and that it counts the entries in argv.',
      keyword: 'number of strings'
    },
    {
      id: 'e07', scene: 'argc', start: 36, end: 42,
      caption: 'Here argc is 4 while the parameters number 3.',
      narration: 'On this run argc is four, and the parameters you supplied number three. Both numbers are correct; they count different things.',
      detail: 'The program name occupies index zero. Indices one through three hold the three parameters. Index four holds the null pointer that closes the array.',
      keyword: 'argc is 4',
      trap: 'A question that says "the program is run with three arguments" is telling you argc equals four, not three.'
    },
    {
      id: 'e08', scene: 'argc', start: 42, end: 48,
      caption: 'argc minus one is the parameter count, whenever argc is at least one.',
      narration: 'Subtract one and you have the number of parameters, as long as argc is at least one. On this run that is three.',
      detail: 'The subtraction is safe only after the value has been established to be at least one. Applying it to a zero gives minus one, and a loop bounded by minus one does nothing at all, silently.',
      keyword: 'argc minus one'
    },
    {
      id: 'e09', scene: 'argc', start: 48, end: 54,
      caption: 'So a program that wants three parameters tests argc for 4.',
      narration: 'A program that insists on exactly three parameters therefore tests argc for the value four, and rejects every other count.',
      detail: 'The test is written before any index is used, so the guard runs on the count alone and never touches a pointer. That ordering is the subject of scene seven.',
      keyword: 'tests argc for 4'
    },
    {
      id: 'e10', scene: 'argc', start: 54, end: 60,
      caption: 'That one extra word is where most marks are lost.',
      narration: 'Every question on this topic is, at bottom, a question about whether you remembered the program name.',
      detail: 'Two habits prevent the error: write the bound as argc, never as a remembered number, and start every parameter loop at one rather than zero.',
      keyword: 'where most marks are lost'
    },

    /* ---------------- scene 3: argv is an array of pointers ---------------- */
    {
      id: 'e11', scene: 'argv', start: 60, end: 66,
      caption: 'argv is an array whose slots hold pointers, not characters.',
      narration: 'Here is the part a picture settles. argv is an array of slots, and each slot holds a pointer. The characters are somewhere else.',
      detail: 'The declared type is char *argv[], which is an array of pointers to char. The array itself is a list of addresses; no character lives in it.',
      keyword: 'slots hold pointers'
    },
    {
      id: 'e12', scene: 'argv', start: 66, end: 72,
      caption: 'Each pointer leads to a separate character array ending in a null.',
      narration: 'Follow a pointer and you land on a character array. Each of those arrays ends with a null character, exactly like every other C string.',
      detail: 'The terminators are separate from the null pointer that closes argv. One is a byte with value zero inside a string; the other is a pointer with value zero in the array of pointers. They are two different things that share the word null.',
      keyword: 'a separate character array',
      trap: 'A string terminator is a zero byte. The sentinel closing argv is a zero pointer. Do not count them as the same object.'
    },
    {
      id: 'e13', scene: 'argv', start: 72, end: 78,
      caption: 'argv[0] is the program name, so the first parameter is argv[1].',
      narration: 'Slot zero points at the program name. The first parameter you typed is therefore at slot one, not slot zero.',
      detail: 'The standard says the string pointed to by argv[0] represents the program name, and that argv[1] through argv[argc-1] represent the parameters.',
      keyword: 'the first parameter is argv[1]'
    },
    {
      id: 'e14', scene: 'argv', start: 78, end: 84,
      caption: 'The strings have their own lengths, and they need not match.',
      narration: 'The four strings have four different lengths. Nothing lines up; the arrays are separate objects that happen to be reachable from one list.',
      detail: 'The lengths here are six, two, two and one characters before the terminator. A program reads them with strlen or walks them byte by byte; it never assumes a fixed width.',
      keyword: 'four different lengths'
    },
    {
      id: 'e15', scene: 'argv', start: 84, end: 90,
      caption: 'Reading argv[2][0] gives the first character of the second parameter.',
      narration: 'Two subscripts, two steps. The first picks a pointer out of the array; the second picks a character out of the string that pointer names.',
      detail: 'argv[2] is a pointer to char, so argv[2][0] is a char. In pointer arithmetic the same byte is written *(*(argv + 2) + 0), which is the same address by a different spelling.',
      keyword: 'two subscripts'
    },

    /* ---------------- scene 4: the sentinel ---------------- */
    {
      id: 'e16', scene: 'sentinel', start: 90, end: 96,
      caption: 'The array has one slot more than argc, and the last slot is guaranteed null.',
      narration: 'Count the slots. There are five, and argc is four. The extra slot is not an accident of this implementation; it is required.',
      detail: 'Indices zero through argc-1 hold pointers to strings. Index argc holds a null pointer. So the array always has argc plus one usable slots.',
      keyword: 'one slot more than argc'
    },
    {
      id: 'e17', scene: 'sentinel', start: 96, end: 102,
      caption: 'argv[argc] shall be a null pointer — that is the standard\'s word.',
      narration: 'The standard does not say it is usually null. It says it shall be a null pointer, in a list of constraints on the parameters of main.',
      detail: 'The wording is from the program startup clause: the value of argc shall be nonnegative, and argv[argc] shall be a null pointer. A program may rely on both.',
      keyword: 'shall be a null pointer',
      trap: 'This is a promise about the value at index argc. It is not a promise that index argc plus one exists.'
    },
    {
      id: 'e18', scene: 'sentinel', start: 102, end: 108,
      caption: 'That null is a value you may compare, never a string you may read.',
      narration: 'So you may compare the slot against a null pointer. You may not hand that pointer to a function that reads a string through it.',
      detail: 'Comparing is reading the pointer value, which is defined. Passing it to printf with a percent s asks the library to walk a string starting at address zero, which is undefined behaviour.',
      keyword: 'compare, never read'
    },
    {
      id: 'e19', scene: 'sentinel', start: 108, end: 114,
      caption: 'It exists so a loop can stop on it without knowing the count.',
      narration: 'The purpose of the extra slot is to let a loop run until it meets the null, without being told how many entries there are.',
      detail: 'This is the same sentinel idea as a null-terminated string, one level up: a string ends at a zero byte, and this array ends at a zero pointer.',
      keyword: 'stop on it'
    },
    {
      id: 'e20', scene: 'sentinel', start: 114, end: 120,
      caption: 'Compare against it freely; dereference it and the program is undefined.',
      narration: 'Hold the two operations apart. Testing the pointer is fine. Following it is not.',
      detail: 'The distinction is the same one that separates reading a null-terminated string from reading past its terminator: the terminator is there to be found, not to be used as data.',
      keyword: 'dereference it'
    },

    /* ---------------- scene 5: the counter loop ---------------- */
    {
      id: 'e21', scene: 'counter', start: 120, end: 126,
      caption: 'A counter loop starts at 1 to skip the program name.',
      narration: 'The usual loop initialises its index to one, and runs while the index is below argc. Starting at one skips the name.',
      detail: 'The bound is written with argc, not with a constant, so the loop adapts to any run. The strict less-than is what stops it before the null slot.',
      keyword: 'starts at 1'
    },
    {
      id: 'e22', scene: 'counter', start: 126, end: 132,
      caption: 'It adds atoi of the words, so ten plus twenty is thirty.',
      narration: 'Each word goes through atoi, which turns text into an integer, and the integers are added. Ten plus twenty is thirty.',
      detail: 'atoi stands for ASCII to integer. It reads an optional sign and then digits, and returns the value of the longest prefix that forms a number.',
      keyword: 'atoi'
    },
    {
      id: 'e23', scene: 'counter', start: 132, end: 138,
      caption: 'The plus sign is read too, and atoi turns it into 0.',
      narration: 'The loop does reach the plus sign at index three. atoi finds no digits after the sign, so it returns zero, and the total is unchanged.',
      detail: 'This is the behaviour of atoi rather than a special case for arithmetic operators. Any word that does not begin with a number converts to zero, silently.',
      keyword: 'atoi turns it into 0',
      trap: 'A program that prints the right total can still be reading the wrong words. Correct output is not evidence of a correct loop.'
    },
    {
      id: 'e24', scene: 'counter', start: 138, end: 144,
      caption: 'Starting at 0 instead would add atoi of the program name.',
      narration: 'Now start the same loop at zero. The extra word is the program name, and atoi of a word that begins with a dot finds no digits.',
      detail: 'The value is again zero, so the printed total is unchanged. The loop is wrong and the answer looks right.',
      keyword: 'add atoi of the program name'
    },
    {
      id: 'e25', scene: 'counter', start: 144, end: 150,
      caption: 'The total hides the bug; only the bound tells the truth.',
      narration: 'Both loops print thirty. What separates them is not the output but the bound, and a question that changes the program name to something starting with a digit would expose it.',
      detail: 'If the program were started as a path containing a leading digit, the zero-from-the-name assumption would fail and the totals would differ. The correct habit is to start at one because the name is there, not because it happens to convert to zero.',
      keyword: 'hides the bug'
    },

    /* ---------------- scene 6: the sentinel loop ---------------- */
    {
      id: 'e26', scene: 'while', start: 150, end: 156,
      caption: 'The sentinel loop reads a pointer and stops when it is null.',
      narration: 'The second loop ignores argc entirely. It reads the slot, tests the pointer, and stops the moment the pointer is null.',
      detail: 'The condition is the pointer itself, used as a truth value. A non-null pointer is true and a null pointer is false, so the loop needs no comparison operator.',
      keyword: 'stops when it is null'
    },
    {
      id: 'e27', scene: 'while', start: 156, end: 162,
      caption: 'It visits the same three slots and prints the same 30.',
      narration: 'It reads indices one, two and three, meets the null at four, and stops. Same three words, same total.',
      detail: 'The two loops agree here because the array is well formed. They disagree when a program modifies the array, which the standard permits but no exam question should rely on.',
      keyword: 'the same three slots'
    },
    {
      id: 'e28', scene: 'while', start: 162, end: 168,
      caption: 'A bound of argc inclusive also reaches index 4, and that pointer is null.',
      narration: 'Now change the loop bound from less-than to less-than-or-equal. The counter reaches index four, and the pointer stored there is null.',
      detail: 'The loop condition itself is still defined: comparing an index against argc is arithmetic. What changes is what the body does with the null pointer it has just fetched.',
      keyword: 'reaches index 4',
      trap: 'The failure is in the body, not the condition. A loop that fetches a null pointer and tests it is fine; one that passes it to printf is not.'
    },
    {
      id: 'e29', scene: 'while', start: 168, end: 174,
      caption: 'Handing a null pointer to printf is undefined, not an empty line.',
      narration: 'Passing that null pointer to printf with a percent s is undefined behaviour. It is not guaranteed to print nothing, and it is not guaranteed to crash.',
      detail: 'Undefined behaviour means the standard imposes no requirement on the program at all. A particular compiler may print the word null, may print nothing, or may abort, and none of those outcomes is the language\'s answer.',
      keyword: 'undefined'
    },
    {
      id: 'e30', scene: 'while', start: 174, end: 180,
      caption: 'The null is there to be tested, not to be printed.',
      narration: 'So the rule for the extra slot is short. Test it. Do not use it.',
      detail: 'The safe sentinel loop tests the pointer in its condition and never passes it onward. The unsafe loop fetches it and uses it, which is why the bound has to be strict.',
      keyword: 'to be tested'
    },

    /* ---------------- scene 7: no arguments ---------------- */
    {
      id: 'e31', scene: 'none', start: 180, end: 186,
      caption: 'Run with nothing after the name, and argc is 1 — never 0.',
      narration: 'Start the program with no parameters at all. argc is one, because the name is still there.',
      detail: 'A count of zero would mean even the name was missing. In a hosted environment the shell always supplies a name, so the common case is one.',
      keyword: 'argc is 1',
      trap: 'The most common wrong answer to "what is argc here" is 0. The name is a word like any other.'
    },
    {
      id: 'e32', scene: 'none', start: 186, end: 192,
      caption: 'argv[1] then holds the null pointer, so there is no string there.',
      narration: 'The array still has its sentinel. With argc equal to one, the null sits at index one, which is exactly the slot a parameter would have used.',
      detail: 'The array has two slots: index zero pointing at the name, index one holding the null. There is no index two.',
      keyword: 'argv[1] then holds the null pointer'
    },
    {
      id: 'e33', scene: 'none', start: 192, end: 198,
      caption: 'atoi(argv[1]) on that run dereferences null: undefined.',
      narration: 'A program that goes straight to atoi of slot one on this run is following a null pointer. That is undefined behaviour, not a zero.',
      detail: 'The mistake is easy to make because the program works when it is tested with parameters and fails only on the empty run, which is often the run the grader uses.',
      keyword: 'dereferences null'
    },
    {
      id: 'e34', scene: 'none', start: 198, end: 204,
      caption: 'The guard is a test of argc before the read, not after.',
      narration: 'The repair is a test on the count, placed before any slot is read. If argc is below two there is no first parameter, and the program should say so.',
      detail: 'Testing the pointer for null after fetching it also works, and is the sentinel habit applied to one slot. Testing the count is clearer, because the count is the thing that is wrong.',
      keyword: 'test of argc before the read'
    },
    {
      id: 'e35', scene: 'none', start: 204, end: 210,
      caption: 'argc may be 0 in the standard\'s wording, and then argv[0] is not the name.',
      narration: 'One caution about the general case. The standard requires only that argc be nonnegative, so a count of zero is permitted, and then argv[0] is not required to be a name at all.',
      detail: 'The clause that makes argv[0] the program name begins with the words "if the value of argc is greater than zero". A program that must be portable reads argv[0] only after checking that argc is at least one.',
      keyword: 'may be 0'
    },

    /* ---------------- scene 8: atoi ---------------- */
    {
      id: 'e36', scene: 'atoi', start: 210, end: 216,
      caption: 'Every parameter arrives as text, so a number has to be converted.',
      narration: 'Nothing in argv is a number. Every slot points at characters. A program that wants an integer has to convert one.',
      detail: 'The conversion is not a cast. A cast would reinterpret the address as an integer; a conversion reads digits and computes a value.',
      keyword: 'arrives as text'
    },
    {
      id: 'e37', scene: 'atoi', start: 216, end: 222,
      caption: 'atoi reads the longest prefix that forms a number and stops.',
      narration: 'atoi skips leading blanks, takes an optional sign, reads digits, and stops at the first character that cannot continue the number.',
      detail: 'So twelve followed by letters converts to twelve. The trailing letters are not an error and are not reported; they are simply not read.',
      keyword: 'longest prefix'
    },
    {
      id: 'e38', scene: 'atoi', start: 222, end: 228,
      caption: 'atoi cannot report failure: abc and 0 both give 0.',
      narration: 'Here is the weakness. atoi has no way to say that nothing was converted, so the word abc and the word zero produce the same integer.',
      detail: 'That is why the plus sign in scene five converted to zero without complaint. The library did exactly what it promises; the promise is just weaker than most programs need.',
      keyword: 'cannot report failure',
      trap: 'Never test atoi\'s result against zero to decide whether the argument was a number. Both failures and real zeros land there.'
    },
    {
      id: 'e39', scene: 'atoi', start: 228, end: 234,
      caption: 'strtol takes an end pointer, and the end pointer is the report.',
      narration: 'strtol performs the same conversion and also writes back an address. That address is where reading stopped, and comparing it with the start is the error test.',
      detail: 'If the end pointer equals the start of the string, no digits were consumed and the argument was not a number. If it points past the last digit, the conversion is clean.',
      keyword: 'end pointer'
    },
    {
      id: 'e40', scene: 'atoi', start: 234, end: 240,
      caption: 'Use strtol when zero and nonsense must be told apart.',
      narration: 'So the choice is a choice about error reporting. atoi is shorter and loses the distinction; strtol keeps it.',
      detail: 'Neither function is wrong. The right one depends on whether the program has to distinguish a genuine zero from a word that was never a number.',
      keyword: 'told apart'
    },

    /* ---------------- scene 9: the two declarations ---------------- */
    {
      id: 'e41', scene: 'decl', start: 240, end: 246,
      caption: 'char *argv[] and char **argv declare the same parameter.',
      narration: 'These two spellings look different and are the same thing in a parameter list. Both say that argv is a pointer to a pointer to char.',
      detail: 'The standard notes that the type of argv can be written as char **, calling the two forms equivalent. The brackets in a parameter list are a way of writing a pointer, not an array.',
      keyword: 'the same parameter'
    },
    {
      id: 'e42', scene: 'decl', start: 246, end: 252,
      caption: 'In a parameter list an array type is rewritten as a pointer.',
      narration: 'The reason is a rule of the language rather than a special case for main. A parameter declared with an array type is adjusted to a pointer type before anything else happens.',
      detail: 'That adjustment is why a function cannot receive an array by value in C. It receives an address, and the size of the array is lost at the boundary.',
      keyword: 'rewritten as a pointer'
    },
    {
      id: 'e43', scene: 'decl', start: 252, end: 258,
      caption: 'So sizeof(argv) inside main is the size of a pointer, not the array.',
      narration: 'Now the consequence. Measuring argv inside main gives the width of one pointer, not the width of the whole list.',
      detail: 'On a machine with eight-byte addresses that is eight, while the list holds five pointers and would measure forty if it were still an array.',
      keyword: 'the size of a pointer',
      trap: 'A common wrong answer to "what does sizeof(argv) print" is argc times the pointer width. It is the pointer width alone.'
    },
    {
      id: 'e44', scene: 'decl', start: 258, end: 264,
      caption: 'The count is argc; the pointer width tells you nothing about it.',
      narration: 'The number of entries comes from argc, and from nowhere else. No measurement of argv can recover it.',
      detail: 'A program that needs the count uses the parameter, or counts to the sentinel. It never divides one size by another, because one of the two sizes was lost.',
      keyword: 'The count is argc'
    },
    {
      id: 'e45', scene: 'decl', start: 264, end: 270,
      caption: 'sizeof(*argv) is a pointer, and sizeof(**argv) is one byte.',
      narration: 'Follow the stars and the measurements shrink. One star gives the size of a pointer, two stars give the size of a character.',
      detail: 'The values are eight and one on a machine with eight-byte pointers and one-byte characters. The second is one by the definition of sizeof on a character type.',
      keyword: 'one byte'
    },

    /* ---------------- scene 10: guarantees ---------------- */
    {
      id: 'e46', scene: 'guarantee', start: 270, end: 276,
      caption: 'Guaranteed: argc is nonnegative, and the slot at argc is null.',
      narration: 'Two promises hold on every conforming implementation. The count is never negative, and the slot at index argc is a null pointer.',
      detail: 'Both sentences are constraints on the parameters of main in the hosted environment. A program may test them and rely on them.',
      keyword: 'Guaranteed'
    },
    {
      id: 'e47', scene: 'guarantee', start: 276, end: 282,
      caption: 'Guaranteed: argv and the strings it points to may be modified.',
      narration: 'A third promise. The strings are not read-only literals; a program is allowed to change the characters in them.',
      detail: 'The standard says the parameters argc and argv and the strings pointed to by the argv array shall be modifiable, and retain their last-stored values until termination. That is a stronger promise than a string literal gets.',
      keyword: 'may be modified',
      trap: 'This is the opposite of the rule for string literals. Copying that rule here gives the wrong answer.'
    },
    {
      id: 'e48', scene: 'guarantee', start: 282, end: 288,
      caption: 'Still not allowed: writing past a string\'s own length.',
      narration: 'Modifiable does not mean roomy. A string is as long as it was, and writing beyond its terminator is still out of bounds.',
      detail: 'The permission covers the characters that exist. It says nothing about space that does not exist, so overwriting a short argument with a longer one is undefined.',
      keyword: 'past a string\'s own length'
    },
    {
      id: 'e49', scene: 'guarantee', start: 288, end: 294,
      caption: 'Left open: where the strings live, and what argv[0] holds.',
      narration: 'Some things are deliberately not fixed. Where the characters are stored is up to the implementation, and so is the exact text of the program name.',
      detail: 'The name may be a bare name, a relative path or an absolute path, and its first character is the null character if no name is available. The standard fixes none of that.',
      keyword: 'Left open'
    },
    {
      id: 'e50', scene: 'guarantee', start: 294, end: 300,
      caption: 'Five steps: check argc, start at 1, stop at argc or null, convert, report.',
      narration: 'That is the whole procedure. Check the count before reading anything. Start the loop at one. Stop at argc, or at the null if you are walking the sentinel. Convert with the error reporting you need. Report what went wrong.',
      detail: 'Each step exists because of one of the facts in this lesson: the name at index zero, the null at index argc, the silent zero from atoi, and the guard that has to come first.',
      keyword: 'Five steps'
    }
  ]
};
