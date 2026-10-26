# Recursion — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/recursion/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A recursive call is the same problem, smaller

*0:00 – 0:30 · objective: State the two obligations of a recursive definition: the input shrinks, and a base case stops it.*

**0:00–0:07** — A recursive function solves a copy of its own problem on a smaller input, and has one input where it stops.

> Caption: A recursive function solves a copy of its own problem on a smaller input, and has one input where it stops.

Exam-trap caption mode adds: *Recursion is not a keyword in C. Nothing marks a function as recursive except its own body.*

**0:07–0:15** — sumTo of n returns n plus sumTo of n minus one. The base case is n equal to zero, which returns zero and calls nothing.

> Caption: sumTo(n) returns n + sumTo(n-1). The base case is n == 0, which returns 0 and calls nothing.

Exam-trap caption mode adds: *The base case is part of the definition, not a safety net. A recursion without one is not a slower recursion; it is not a function at all.*

**0:15–0:23** — Two obligations: the argument must move towards the base case, and the base case must be on that path.

> Caption: Two obligations: the argument must move towards the base case, and the base case must be on that path.

Exam-trap caption mode adds: *Checking only that a base case exists is the classic half-check. It answers a different question from the one asked.*

**0:23–0:30** — Everything else is bookkeeping: the machine must remember where it was, and what it had already computed.

> Caption: Everything else is bookkeeping: the machine must remember where it was, and what it had already computed.

Exam-trap caption mode adds: *The values are not stored in one place. Each level keeps its own copy of n, which is why the same name holds different numbers at once.*

## Scene 2. The call stack is recursion's memory

*0:30 – 1:00 · objective: Watch four frames push for sumTo(3), then unwind with the answer assembled on the way back up.*

**0:30–0:37** — Each call gets its own frame: its own parameters, its own locals, and its own place to return to.

> Caption: Each call gets its own frame: its own parameters, its own locals, and its own place to return to.

Exam-trap caption mode adds: *One name, several live objects. A trace that keeps a single column for n loses the whole picture.*

**0:37–0:45** — sumTo of three pushes four frames — n equal to three, two, one, zero — before anything is added.

> Caption: sumTo(3) pushes four frames — n = 3, 2, 1, 0 — before anything is added. Only the last one returns without calling.

Exam-trap caption mode adds: *The answer is not built while descending. Descending only builds the stack.*

**0:45–0:53** — Then the stack unwinds: zero, then one, then three, then six. The deepest frame finishes first.

> Caption: Then the stack unwinds: 0, then 0+1 = 1, then 1+2 = 3, then 3+3 = 6. The deepest frame finishes first.

Exam-trap caption mode adds: *Reading the recursion as "3+2+1+0" gives the right number here and the wrong one for factorial, where the operations are multiplications.*

**0:53–1:00** — So the peak depth is what the machine must hold at once, and the number of frames equals the number of calls.

> Caption: So the peak depth is what the machine must hold at once, and the number of frames equals the number of calls.

Exam-trap caption mode adds: *This equality is special to linear recursion. It is not a general rule about recursion.*

## Scene 3. Calls and depth are different numbers

*1:00 – 1:30 · objective: Separate the number of calls from the peak stack depth, using a linear and a branching recursion.*

**1:00–1:07** — A linear recursion calls itself once per level. sumTo of n and fact of n both reach a peak depth of n plus one frames.

> Caption: A linear recursion calls itself once per level. sumTo(n) and fact(n) both reach a peak depth of n+1 frames.

Exam-trap caption mode adds: *The depth is a count of frames alive at the same time, not a count of calls made.*

**1:07–1:15** — A branching recursion calls itself twice. Naive fib of n makes two calls per level, so the calls multiply while the depth stays n plus one.

> Caption: A branching recursion calls itself twice. Naive fib(n) makes two calls per level, so the calls multiply while the depth stays n+1.

Exam-trap caption mode adds: *"Depth is linear, so it is fast" is a non sequitur. The cost of a recursion is the number of nodes, not the height of the tree.*

**1:15–1:23** — The page counts them: fib of ten makes one hundred and seventy seven calls at a depth of eleven. fib of thirty makes over two and a half million calls at depth thirty one.

> Caption: The page counts them: fib(10) makes 177 calls and never goes deeper than 10 frames. fib(30) makes 2,692,537 calls at depth 30.

Exam-trap caption mode adds: *fib(30) is already slow enough to feel, and it is a 30-input problem. This is why memoisation and iteration replace naive recursion.*

**1:23–1:30** — The GATE 2015 question is the same gap in miniature: fun of five returns fifty one after eighty one calls, at a peak depth of five frames.

> Caption: GATE 2015 Set 2 is the same gap in miniature: fun(5) returns 51 after 81 calls, at a peak depth of 5 frames.

Exam-trap caption mode adds: *The efficient route is a table of fun(1) to fun(5), not a call tree. The tree is what you must avoid drawing.*

## Scene 4. No base case, or a base case you never reach

*1:30 – 2:00 · objective: Distinguish a missing base case from an unreachable one, and say what C promises in each case.*

**1:30–1:37** — Remove the base case and the function keeps calling. In C that is not an endless loop: it consumes stack until the stack runs out.

> Caption: Remove the base case and the function keeps calling. In C that is not an endless loop: it consumes stack until the stack runs out.

Exam-trap caption mode adds: *A program that "worked" without a base case did not terminate correctly. It stopped for a reason the standard does not describe.*

**1:37–1:45** — The standard calls that undefined behaviour, not a required error. It needs no diagnostic, and the result is not yours to predict.

> Caption: The standard calls that undefined behaviour, not a required error. It needs no diagnostic, and the result is not yours to predict.

Exam-trap caption mode adds: *A question that asks for the output of a non-terminating recursion has no defined answer. "Does not terminate" or "undefined" is the honest answer.*

**1:45–1:53** — A base case can exist and still be unreachable: f of n calls f of n minus two, with a base case at n equal to one, which an even n never reaches.

> Caption: A base case can exist and still be unreachable: f(n) = f(n-2) with a base case at n == 1 never stops for an even n.

Exam-trap caption mode adds: *This is the case candidates miss most often, because the code visibly contains a base case and looks finished.*

**1:53–2:00** — So ask two separate questions: does the argument move towards the base case, and does the base case lie on that path?

> Caption: So ask two separate questions: does the argument move towards the base case, and does the base case lie on that path?

Exam-trap caption mode adds: *Answering the first question and assuming the second is how a "correct" recursion is written that never returns.*

## Scene 5. Recursion, iteration and the tail call

*2:00 – 2:30 · objective: Rewrite a recursion as a loop, then see what a tail call does and does not guarantee in C.*

**2:00–2:07** — sumTo can be written as a loop. Same arithmetic, no frames: constant extra space instead of space proportional to n.

> Caption: sumTo can be written as a loop. Same arithmetic, no frames: constant extra space instead of space proportional to n.

Exam-trap caption mode adds: *Recursion is not "more advanced" than a loop. On a fixed stack it is the version with the hard limit.*

**2:07–2:15** — A tail call is a call whose result is returned immediately, with no work left to do afterwards. Its frame is no longer needed.

> Caption: A tail call is a call whose result is returned immediately, with no work left to do afterwards. Its frame is no longer needed.

Exam-trap caption mode adds: *The position of the call in the source decides this. n + f(n-1) is not a tail call however it is spaced or bracketed.*

**2:15–2:23** — Some compilers reuse that frame anyway. But the C standard does not require it, so you may not assume constant stack.

> Caption: Some compilers reuse that frame anyway. But the C standard does not require it, so you may not assume constant stack.

Exam-trap caption mode adds: *A claim that "tail recursion is O(1) space in C" is not a language guarantee. It is a property of some compilers at some settings.*

**2:23–2:30** — An accumulator makes the call a tail call; a loop removes the calls. Both keep the answer, and the page checks that they do.

> Caption: An accumulator makes the call a tail call; a loop removes the calls. Both keep the answer, and the page checks that they do.

Exam-trap caption mode adds: *The accumulator must carry the whole partial answer. Carrying half of it is a common rewriting error that still terminates.*

## Scene 6. The value a trace gives — GATE 2015 Set 2

*2:30 – 3:00 · objective: Evaluate a double recursion inside a loop upward from the base case, and get 51.*

**2:30–2:37** — GATE 2015 Set 2: fun of one is one. For any larger n, x starts at one and gains fun of k times fun of n minus k, for k from one to n minus one.

> Caption: GATE CSE 2015 Set 2: fun(1) is 1; for any larger n, x starts at 1 and gains fun(k) * fun(n-k) for k = 1 to n-1.

Exam-trap caption mode adds: *Two loops of the same recursion, multiplied. Each k needs two evaluations, and both are recursive.*

**2:37–2:45** — Work upward, not downward: fun of two is two, fun of three is five, and fun of four is fifteen.

> Caption: Work upward, not downward: fun(2) = 1 + 1·1 = 2, fun(3) = 1 + 1·2 + 2·1 = 5, fun(4) = 1 + 5 + 4 + 5 = 15.

Exam-trap caption mode adds: *Trying to expand fun(5) as a tree means 81 calls. The table is 5 lines. Same answer, different cost for you.*

**2:45–2:53** — fun of five is one plus fifteen plus ten plus ten plus fifteen, which is fifty one. The answer is fifty one.

> Caption: fun(5) = 1 + 1·15 + 2·5 + 5·2 + 15·1 = 51. The answer is 51, and the model agrees.

Exam-trap caption mode adds: *Adding the k = 5 term gives 71. Starting x at 0 gives 50, and dropping a term gives 26 or 36.*

**2:53–3:00** — The page also counts the calls: one, three, nine, twenty seven, eighty one — three to the power n minus one.

> Caption: The page also counts the calls: 1, 3, 9, 27, 81 — three to the power n-1. One mark, eighty-one calls, if you trace them all.

Exam-trap caption mode adds: *A question worth one mark can hide exponential work. Recognising the table shape is the whole skill.*

## Scene 7. Read the recursion as an algorithm — GATE 2021 and 2011

*3:00 – 3:30 · objective: Recognise the Euclidean algorithm and the base-r digit sum inside unfamiliar recursive code.*

**3:00–3:07** — GATE 2021 Set 2: SomeFunction subtracts the smaller argument from the larger and calls itself again.

> Caption: GATE CSE 2021 Set 2: SomeFunction subtracts the smaller argument from the larger and calls itself again.

Exam-trap caption mode adds: *The function has no single return at the end. Every path returns, which is why the compiler accepts it.*

**3:07–3:15** — That is the Euclidean algorithm by repeated subtraction, so it returns the gcd. The page checks the identity on every pair up to forty.

> Caption: That is the Euclidean algorithm by repeated subtraction, so it returns the gcd. The page checks the identity on every pair up to 40.

Exam-trap caption mode adds: *Tracing (15, 255) by hand means 16 subtractions. Identifying the algorithm makes the trace unnecessary.*

**3:15–3:23** — So SomeFunction of fifteen and two hundred and fifty five is fifteen: the trace reaches fifteen and fifteen after sixteen subtractions.

> Caption: So SomeFunction(15, 255) is 15: the trace reaches (15, 15) after sixteen subtractions. The official key is 15.

Exam-trap caption mode adds: *Answering 1275 multiplies the arguments instead of taking the gcd. Answering 1 assumes the "either argument is 1" guard fired.*

**3:23–3:30** — GATE 2011: foo of n and r adds the digits of n in base r. foo of five hundred and thirteen and two is two, because that number has two ones in binary.

> Caption: GATE CSE 2011: foo(n, r) = n mod r + foo(n / r, r) adds the digits of n in base r. foo(513, 2) = 2.

Exam-trap caption mode adds: *The integer division is the point. With n / r as a real division the recursion never reaches 0, and the digit-sum reading disappears.*

## Scene 8. A recursion that converges — GATE 2014 Set 2

*3:30 – 4:00 · objective: Handle a base case written as a tolerance, where the argument is not what shrinks.*

**3:30–3:37** — GATE 2014 Set 2: f of x returns x when the absolute value of x squared minus three is less than zero point zero one, and otherwise calls f of x over two plus one point five over x.

> Caption: GATE CSE 2014 Set 2: f(x) returns x when |x*x - 3| < 0.01, and otherwise calls f(x/2 + 1.5/x).

Exam-trap caption mode adds: *Reading the condition as x*x == 3 exactly would make the base case almost unreachable in floating point.*

**3:37–3:45** — That update is Newton's step for x squared minus three equals zero, so the sequence converges to the square root of three, about one point seven three two.

> Caption: That update is Newton's step for x*x - 3 = 0, so the sequence converges to the square root of 3, about 1.732.

Exam-trap caption mode adds: *The fixed point is where the update returns its own input. Solving that equation is faster than iterating, and it also proves where the iteration can end.*

**3:45–3:53** — So the answer is a range, not one number: the official key accepts one point seven two to one point seven four.

> Caption: So the answer is a range, not one number: the official key accepts 1.72 to 1.74. Any q with |q*q - 3| < 0.01 returns itself at once.

Exam-trap caption mode adds: *A tolerance base case turns a value question into an interval question. Answering with one number when a range is asked can lose the mark.*

**3:53–4:00** — One warning about this snippet as C: abs takes an int, so that is not the test written. The key answers the mathematical reading.

> Caption: One warning about this snippet as C: abs() takes an int, so abs(x*x - 3) is not the test written. The key answers the mathematical reading.

Exam-trap caption mode adds: *Do not learn this line as good C. It is a GATE question, and the mark is for the mathematics.*

## Scene 9. Parameters, statics and arrays across frames

*4:00 – 4:30 · objective: Decide which objects each frame gets fresh and which ones every frame shares.*

**4:00–4:07** — Every parameter and every automatic local is a fresh object in each frame. That is why one name can hold many values at once.

> Caption: Every parameter and every automatic local is a fresh object in each frame. That is why one name can hold many values at once.

Exam-trap caption mode adds: *The opposite belief — that n is one variable updated on the way down — makes every trace wrong from the second level onward.*

**4:07–4:15** — A static local is one object for the whole run. All frames read and write the same counter, so it counts calls, not depth.

> Caption: A static local is one object for the whole run. All frames read and write the same counter, so it counts calls, not depth.

Exam-trap caption mode adds: *A static local inside a recursive function is the same trap as the GATE 2019 loop question: the value survives between calls, so each level sees the previous level's number.*

**4:15–4:23** — An array parameter is a pointer, so every frame sees the same array. Recursion can fill it in place, and all levels see the change.

> Caption: An array parameter is a pointer, so every frame sees the same array. Recursion can fill it in place, and all levels see the change.

Exam-trap caption mode adds: *A local array declared inside the function is the opposite: a fresh copy per frame. The two look alike and behave oppositely.*

**4:23–4:30** — So before any trace, sort every name in the function into per-frame or shared. The answer depends on that sort, not on the arithmetic.

> Caption: So before any trace, sort every name in the function into per-frame or shared. The answer depends on that sort, not on the arithmetic.

Exam-trap caption mode adds: *Two questions with identical arithmetic can have different answers because of one static keyword. The classification is the question.*

## Scene 10. The procedure, and the two questions GATE asks

*4:30 – 5:00 · objective: Fix a written procedure for trace questions and for cost questions, and see where recursion returns later.*

**4:30–4:37** — For a value question: write the call tree on paper, evaluate the base cases, then combine on the way up.

> Caption: For a value question: write the call tree on paper, evaluate the base cases, then combine on the way up. Do not run it in one pass.

Exam-trap caption mode adds: *A single-pass mental run works only on linear recursions of depth two or three. It fails silently beyond that.*

**4:37–4:45** — For a cost question: write the recurrence for the number of calls, then solve it. Calls and depth are two different recurrences.

> Caption: For a cost question: write the recurrence for the number of calls, then solve it. Calls and depth are two different recurrences.

Exam-trap caption mode adds: *Writing the recurrence for the depth and calling it the cost is the single most common analysis error in this topic.*

**4:45–4:53** — Recursion is also the tool behind divide and conquer, tree traversals, and the recurrence relations lesson you have already met.

> Caption: Recursion is also the tool behind divide and conquer, tree traversals, and the recurrence-relations lesson you have already met.

Exam-trap caption mode adds: *Do not relearn recursion inside each of those topics. Reuse this picture and learn only what the new algorithm adds.*

**4:53–5:00** — The two errors that cost the most marks: assuming a static local is per frame, and assuming the call returns before the rest of the expression.

> Caption: The two errors that cost the most marks: assuming a static local is per frame, and assuming the call returns before the rest of the expression.

Exam-trap caption mode adds: *Neither error looks like an error while you are making it. Both produce a plausible number.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
