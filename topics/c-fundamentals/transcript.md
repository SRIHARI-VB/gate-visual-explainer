# C Fundamentals — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/c-fundamentals/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A type is a promise about width

*0:00 – 0:28 · objective: Separate what the C standard guarantees about a type from what this machine happens to do.*

**0:00–0:07** — A type is not a size. It is a promise about what the compiler will let you store.

> Caption: A type is not a size. It is a promise about what the compiler will let you store.

Exam-trap caption mode adds: *Never write down a size as if C guaranteed it. Read the sizes the question states, or assume the usual 4-byte int.*

**0:07–0:14** — The standard guarantees char is one byte, and that the rank order char, short, int, long is respected.

> Caption: The standard guarantees char is one byte, and that the rank order char < short < int < long is respected.

Exam-trap caption mode adds: *sizeof(int) is 4 on the machines GATE uses, but that is a platform fact, not a language rule.*

**0:14–0:21** — The range follows from the width. An n-bit unsigned type runs from zero to two to the n minus one.

> Caption: The range follows from the width: an n-bit unsigned type runs 0 to 2^n - 1, and signed runs -2^(n-1) to 2^(n-1) - 1.

Exam-trap caption mode adds: *A signed type of n bits holds one more negative value than positive. That asymmetry is what breaks -x at the minimum.*

**0:21–0:28** — char is the awkward one. It is a distinct type, and whether it is signed is the implementation choice.

> Caption: char is the awkward one: it is a distinct type, and whether it is signed is the implementation's choice.

Exam-trap caption mode adds: *A program that compares a plain char against 200 behaves differently on a signed-char and an unsigned-char machine.*

## Scene 2. Every literal already has a type

*0:28 – 0:56 · objective: Read the type of 42, 42u, 3.0, 3.0f, 'a' and "a" from the way each is written.*

**0:28–0:35** — A literal is not untyped. The way you write it decides the type before any operator sees it.

> Caption: A literal is not untyped. The way you write it decides the type before any operator sees it.

Exam-trap caption mode adds: *Integer promotion does not apply to a literal that is already int or wider.*

**0:35–0:42** — Forty two is an int. Adding u makes it unsigned, adding L makes it long.

> Caption: 42 is int. Adding u makes it unsigned, adding L makes it long, and 42LL is long long.

Exam-trap caption mode adds: *Write 1u, not 1, when you mean an unsigned value. The suffix is the only control you have over a literal.*

**0:42–0:49** — Three point zero is a double even though it looks like an int. Three point zero f is the float.

> Caption: 3.0 is a double even though it looks like an int, and 3.0f is the float. The default is double.

Exam-trap caption mode adds: *The classic trap is 1/2 == 0. One operand written as 2.0 turns the whole division into floating point.*

**0:49–0:56** — In C a character constant has type int, so sizeof of a character constant is four, not one.

> Caption: In C a character constant has type int, so sizeof('a') is 4, not 1. The string "a" is a char array of length 2.

Exam-trap caption mode adds: *sizeof("a") is 2 because of the trailing null byte, and sizeof('a') is sizeof(int). Both surprise people.*

## Scene 3. Integer promotion lifts small types to int

*0:56 – 1:26 · objective: See char arithmetic happen in int, with sign extension, and why the answer can leave the char range.*

**0:56–1:03** — char and short are narrower than int, so in arithmetic they are first converted to int.

> Caption: char and short are narrower than int, so in arithmetic they are first converted to int.

Exam-trap caption mode adds: *Promotion is not an assignment. It happens inside the expression, and the result has type int, not char.*

**1:03–1:11** — Lifting a signed char copies the sign bit upwards. Lifting an unsigned char pads with zeros.

> Caption: Lifting a signed char copies the sign bit upwards. Lifting an unsigned char pads with zeros.

Exam-trap caption mode adds: *The two paths differ only because the source type differed, not because the stored pattern differed.*

**1:11–1:18** — So a char holding two hundred actually stores minus fifty six, and adding one gives minus fifty five.

> Caption: So char c = 200 stores -56 on a signed-char machine, and c + 1 is the int -55.

Exam-trap caption mode adds: *The answer -55 is wider than a char. Assigning it back to a char would convert again.*

**1:18–1:26** — An unsigned char holding two hundred is exactly two hundred, and adding one gives two hundred one.

> Caption: unsigned char u = 200 is exactly 200, and u + 1 is 201. Same pattern, different declared type.

Exam-trap caption mode adds: *A question that says "assume char is signed" or "assume char is unsigned" is telling you which column to use.*

## Scene 4. Usual arithmetic conversions, and the signedness trap

*1:26 – 1:58 · objective: Apply the conversion ladder and explain why -1 < 1u is false.*

**1:26–1:34** — Two operands of different types are converted to one common type before the operator runs.

> Caption: Two operands of different types are converted to one common type before the operator runs.

Exam-trap caption mode adds: *The common type is the type of the result. 5/2 is int because both operands are int.*

**1:34–1:42** — For two integers the rule is short. Promote both, then the wider type wins, and unsigned beats signed of equal rank.

> Caption: For two integers the rule is short: promote both, then the wider type wins, and unsigned beats signed of equal rank.

Exam-trap caption mode adds: *This single sentence explains almost every surprising comparison in a GATE C program.*

**1:42–1:50** — So in minus one less than one u, the minus one becomes four billion two hundred ninety four million.

> Caption: So in -1 < 1u the -1 becomes 4294967295, and the comparison is false.

Exam-trap caption mode adds: *The comparison is well defined and the answer is not the mathematical one. Nothing here is undefined behaviour.*

**1:50–1:58** — The same conversion is behind the warning on comparing minus one with sizeof, because sizeof has an unsigned type.

> Caption: The same conversion is behind the warning on -1 < sizeof(int): sizeof has type size_t, which is unsigned.

Exam-trap caption mode adds: *Cast to int, or compare against 0u, when you really mean a signed test.*

## Scene 5. Unsigned wraps by definition; signed overflow does not

*1:58 – 2:26 · objective: Distinguish modulo arithmetic, which the standard defines, from signed overflow, which it does not.*

**1:58–2:05** — Unsigned arithmetic is defined to be modulo two to the n, where n is the number of value bits.

> Caption: Unsigned arithmetic is defined to be modulo 2^n, where n is the number of value bits.

Exam-trap caption mode adds: *This is arithmetic, not undefined behaviour. A wrap-around answer is a correct answer.*

**2:05–2:12** — So an unsigned char holding two hundred fifty, plus ten, is four. The odometer rolls past two fifty five.

> Caption: So an unsigned char holding 250, plus 10, is 4. The odometer rolls past 255 and continues at 0.

Exam-trap caption mode adds: *The conversion back to the narrow type is the wrapping step, and it is fully defined for unsigned targets.*

**2:12–2:19** — Signed overflow is different. The standard says the behaviour is undefined, so there is no answer to give.

> Caption: Signed overflow is different: the standard says the behaviour is undefined, so there is no answer to give.

Exam-trap caption mode adds: *If a GATE question asks for the output of signed overflow, the honest answer is that it is undefined, not the wrapped value.*

**2:19–2:26** — Keep the two apart. Unsigned wrap is a rule you can compute with. Signed overflow is a rule that does not exist.

> Caption: Keep the two apart: unsigned wrap is a rule you can compute with, signed overflow is a rule that does not exist.

Exam-trap caption mode adds: *Use unsigned when you want defined wraparound, for example in hashing and counters.*

## Scene 6. Division truncates; remainder follows the dividend

*2:26 – 2:54 · objective: Derive -7/2 and -7%2 from the identity (a/b)*b + a%b == a.*

**2:26–2:33** — Integer division throws the fraction away. Since C99 the direction is fixed: truncate towards zero.

> Caption: Integer division throws the fraction away. Since C99 the direction is fixed: truncate towards zero.

Exam-trap caption mode adds: *Truncation towards zero is not the same as the floor. They differ exactly when the true quotient is negative.*

**2:33–2:40** — So minus seven over two is minus three, not minus four. Minus three point five moves towards zero.

> Caption: So -7/2 is -3, not -4. Minus 3.5 moves towards zero, and floor would have moved away from it.

Exam-trap caption mode adds: *Python floors, C truncates. A habit from one language gives the wrong answer in the other.*

**2:40–2:47** — The remainder is fixed by one identity: the quotient times the divisor plus the remainder equals the dividend.

> Caption: The remainder is fixed by one identity: (a/b)*b + a%b equals a. That forces -7%2 to be -1.

Exam-trap caption mode adds: *The remainder takes the sign of the dividend, not of the divisor. 7%-2 is 1.*

**2:47–2:54** — Two more facts. Division by zero is undefined, and the most negative value divided by minus one overflows.

> Caption: Two more facts: division by zero is undefined, and INT_MIN / -1 overflows, so it is undefined too.

Exam-trap caption mode adds: *INT_MIN % -1 is not zero in the standard. It is undefined behaviour.*

## Scene 7. Precedence and associativity decide the grouping

*2:54 – 3:22 · objective: Group an unparenthesised expression by the table, not by reading left to right.*

**2:54–3:01** — Precedence decides which operator binds first. Associativity decides the order between equals.

> Caption: Precedence decides which operator binds first. Associativity decides the order between equals.

Exam-trap caption mode adds: *Precedence is not evaluation order. Which subexpression is computed first is a separate question.*

**3:01–3:08** — Unary, then multiplicative, then additive, then shift, then relational, then equality, then the bitwise three, then logical.

> Caption: Unary, then multiplicative, then additive, then shift, then relational, then equality, then the bitwise three, then logical.

Exam-trap caption mode adds: *Bitwise AND, XOR and OR sit below equality, which is why a & b == c parses as a & (b == c).*

**3:08–3:15** — In this expression the multiplicative pair binds first, left to right. Three times four is twelve, then twelve mod five is two.

> Caption: In 2 + 3 * 4 % 5 - 1 the multiplicative pair binds first, left to right: 3*4 is 12, then 12%5 is 2.

Exam-trap caption mode adds: *Right associativity is rare: assignment, the conditional operator, and unary operators are the ones that use it.*

**3:15–3:22** — So the expression is two plus two minus one, which is three. Assignment is right associative.

> Caption: So the expression is 2 + 2 - 1, which is 3. Assignment is right associative, so a = b = 0 stores 0 in b first.

Exam-trap caption mode adds: *a = b = 0 is not the same shape as a = b == 0, which stores a boolean instead.*

## Scene 8. && and || stop as soon as the answer is known

*3:22 – 3:52 · objective: Count which operands are evaluated, and see why the guarded index is safe.*

**3:22–3:29** — Logical and evaluates its left operand, and stops if that operand is false. The right side is never touched.

> Caption: && evaluates its left operand, and stops if that operand is false. The right side is never touched.

Exam-trap caption mode adds: *This is guaranteed by the standard, so a guarded access is genuinely safe, not accidentally safe.*

**3:29–3:37** — Logical or is the mirror image. It stops when the left operand is true.

> Caption: || is the mirror image: it stops when the left operand is true.

Exam-trap caption mode adds: *Swapping && for & removes the short circuit and evaluates both sides. That is a different operator.*

**3:37–3:44** — So the guarded test is safe. When the index is out of range the array is never indexed.

> Caption: So if (i < n && a[i] == key) is safe: when i is out of range the array is never indexed.

Exam-trap caption mode adds: *Writing the tests in the other order reads a[i] before checking i. The order of the operands is the whole safety.*

**3:44–3:52** — Count the side effects, not the operands. In zero and f, the call happens zero times.

> Caption: Count the side effects, not the operands: in 0 && f() the call happens zero times.

Exam-trap caption mode adds: *This is how a question hides a counter that does not increment, or a printf that does not print.*

## Scene 9. Three loops, and the one that never ends

*3:52 – 4:24 · objective: Count iterations for while, for and do-while, then spot the unsigned countdown that cannot terminate.*

**3:52–4:00** — while tests first. for is a while with the bookkeeping moved into the header. do-while tests last.

> Caption: while tests first, for is a while with the bookkeeping moved into the header, and do-while tests last.

Exam-trap caption mode adds: *for(;;) and while(1) are both infinite by construction, not by accident.*

**4:00–4:08** — A for loop counting from zero while less than n runs exactly n times.

> Caption: for (i = 0; i < n; i++) runs exactly n times when n is positive, and zero times when n is zero.

Exam-trap caption mode adds: *i <= n runs n+1 times. Read the comparison symbol, not the shape of the loop.*

**4:08–4:16** — Now the trap. Counting down to zero with an unsigned counter never terminates.

> Caption: Now the trap: for (i = n; i >= 0; i--) with i declared unsigned never terminates.

Exam-trap caption mode adds: *This exact loop is a standard GATE trap. The compiler may warn, and the program still hangs.*

**4:16–4:24** — break leaves the loop at once. continue jumps to the next test, skipping the rest of the body.

> Caption: break leaves the loop at once; continue jumps to the next test, skipping the rest of the body.

Exam-trap caption mode adds: *A continue that skips the increment in a while loop produces an infinite loop with no undefined behaviour at all.*

## Scene 10. switch falls through until a break

*4:24 – 5:00 · objective: Trace execution from the matching case label downwards, and see why a missing break changes the output.*

**4:24–4:33** — switch evaluates its expression once, then jumps to the matching case label.

> Caption: switch evaluates its expression once, then jumps to the matching case label.

Exam-trap caption mode adds: *A case label cannot be a variable, and two labels cannot share a value.*

**4:33–4:42** — From that label execution runs straight on into the following cases. That is fall-through, and it is the default.

> Caption: From that label execution runs straight on into the following cases. That is fall-through, and it is the default.

Exam-trap caption mode adds: *Missing break is not a syntax error. It silently changes the output.*

**4:42–4:51** — With x equal to one, case one increments a, falls into case two and increments b, then break stops it.

> Caption: With x = 1, case 1 increments a, falls into case 2 and increments b, then break stops it. c is untouched.

Exam-trap caption mode adds: *The answer is often the sum of two counters, which is what makes the question discriminating.*

**4:51–5:00** — A default label is optional, and it is only used when no case matches.

> Caption: A default label is optional, and it is only used when no case matches. A missing match with no default does nothing.

Exam-trap caption mode adds: *default in the middle still falls through. Position is not what makes it run last.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
