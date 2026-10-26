/* ==========================================================================
   recursion — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs — never edited by hand.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'idea',
      n: 1,
      title: 'A recursive call is the same problem, smaller',
      start: 0, end: 30,
      objective: 'State the two obligations of a recursive definition: the input shrinks, and a base case stops it.'
    },
    {
      id: 'stack',
      n: 2,
      title: 'The call stack is recursion\'s memory',
      start: 30, end: 60,
      objective: 'Watch four frames push for sumTo(3), then unwind with the answer assembled on the way back up.'
    },
    {
      id: 'depth',
      n: 3,
      title: 'Calls and depth are different numbers',
      start: 60, end: 90,
      objective: 'Separate the number of calls from the peak stack depth, using a linear and a branching recursion.'
    },
    {
      id: 'termination',
      n: 4,
      title: 'No base case, or a base case you never reach',
      start: 90, end: 120,
      objective: 'Distinguish a missing base case from an unreachable one, and say what C promises in each case.'
    },
    {
      id: 'iteration',
      n: 5,
      title: 'Recursion, iteration and the tail call',
      start: 120, end: 150,
      objective: 'Rewrite a recursion as a loop, then see what a tail call does and does not guarantee in C.'
    },
    {
      id: 'gate2015',
      n: 6,
      title: 'The value a trace gives — GATE 2015 Set 2',
      start: 150, end: 180,
      objective: 'Evaluate a double recursion inside a loop upward from the base case, and get 51.'
    },
    {
      id: 'algorithms',
      n: 7,
      title: 'Read the recursion as an algorithm — GATE 2021 and 2011',
      start: 180, end: 210,
      objective: 'Recognise the Euclidean algorithm and the base-r digit sum inside unfamiliar recursive code.'
    },
    {
      id: 'converge',
      n: 8,
      title: 'A recursion that converges — GATE 2014 Set 2',
      start: 210, end: 240,
      objective: 'Handle a base case written as a tolerance, where the argument is not what shrinks.'
    },
    {
      id: 'storage',
      n: 9,
      title: 'Parameters, statics and arrays across frames',
      start: 240, end: 270,
      objective: 'Decide which objects each frame gets fresh and which ones every frame shares.'
    },
    {
      id: 'procedure',
      n: 10,
      title: 'The procedure, and the two questions GATE asks',
      start: 270, end: 300,
      objective: 'Fix a written procedure for trace questions and for cost questions, and see where recursion returns later.'
    }
  ],

  events: [

    /* ---- scene 1: the idea ---- */
    {
      id: 'idea-1', start: 0, end: 7, scene: 'idea',
      caption: 'A recursive function solves a copy of its own problem on a smaller input, and has one input where it stops.',
      detail: 'That is the whole idea: one case that returns without calling, and one case that calls the same function on something smaller. C imposes no extra syntax; a recursive function is an ordinary function that happens to call itself.',
      keyword: 'a copy of its own problem',
      trap: 'Recursion is not a keyword in C. Nothing marks a function as recursive except its own body.',
      narration: 'A recursive function solves a copy of its own problem on a smaller input, and has one input where it stops.'
    },
    {
      id: 'idea-2', start: 7, end: 15, scene: 'idea',
      caption: 'sumTo(n) returns n + sumTo(n-1). The base case is n == 0, which returns 0 and calls nothing.',
      detail: 'The definition of the answer is written in terms of a smaller answer: the sum of 1 to n is n plus the sum of 1 to n-1. The base case gives the chain a place to stop.',
      keyword: 'n + sumTo(n-1)',
      trap: 'The base case is part of the definition, not a safety net. A recursion without one is not a slower recursion; it is not a function at all.',
      narration: 'sumTo of n returns n plus sumTo of n minus one. The base case is n equal to zero, which returns zero and calls nothing.'
    },
    {
      id: 'idea-3', start: 15, end: 23, scene: 'idea',
      caption: 'Two obligations: the argument must move towards the base case, and the base case must be on that path.',
      detail: 'Both are needed. sumTo(n-1) satisfies them. A call on n-2 with a base case at n == 1 satisfies the first for odd n and fails it for even n.',
      keyword: 'two obligations',
      trap: 'Checking only that a base case exists is the classic half-check. It answers a different question from the one asked.',
      narration: 'Two obligations: the argument must move towards the base case, and the base case must be on that path.'
    },
    {
      id: 'idea-4', start: 23, end: 30, scene: 'idea',
      caption: 'Everything else is bookkeeping: the machine must remember where it was, and what it had already computed.',
      detail: 'That bookkeeping is the call stack. The next scene opens it up, because every trace question in this topic is answered from it.',
      keyword: 'bookkeeping',
      trap: 'The values are not stored in one place. Each level keeps its own copy of n, which is why the same name holds different numbers at once.',
      narration: 'Everything else is bookkeeping: the machine must remember where it was, and what it had already computed.'
    },

    /* ---- scene 2: the stack ---- */
    {
      id: 'stack-1', start: 30, end: 37, scene: 'stack',
      caption: 'Each call gets its own frame: its own parameters, its own locals, and its own place to return to.',
      detail: 'C calls this an activation record. The parameter n is a fresh object in every frame, so the three frames in sumTo(3) hold three different n values at the same moment.',
      keyword: 'its own frame',
      trap: 'One name, several live objects. A trace that keeps a single column for n loses the whole picture.',
      narration: 'Each call gets its own frame: its own parameters, its own locals, and its own place to return to.'
    },
    {
      id: 'stack-2', start: 37, end: 45, scene: 'stack',
      caption: 'sumTo(3) pushes four frames — n = 3, 2, 1, 0 — before anything is added. Only the last one returns without calling.',
      detail: 'Nothing is computed on the way down. Each frame evaluates n + sumTo(n-1), and to finish that expression it must first finish the call.',
      keyword: 'four frames',
      trap: 'The answer is not built while descending. Descending only builds the stack.',
      narration: 'sumTo of three pushes four frames — n equal to three, two, one, zero — before anything is added.'
    },
    {
      id: 'stack-3', start: 45, end: 53, scene: 'stack',
      caption: 'Then the stack unwinds: 0, then 0+1 = 1, then 1+2 = 3, then 3+3 = 6. The deepest frame finishes first.',
      detail: 'Each return value is copied into the caller, the caller\'s frame is popped, and the caller completes its own addition. sumTo(3) = 6.',
      keyword: 'unwinds',
      trap: 'Reading the recursion as "3+2+1+0" gives the right number here and the wrong one for factorial, where the operations are multiplications.',
      narration: 'Then the stack unwinds: zero, then one, then three, then six. The deepest frame finishes first.'
    },
    {
      id: 'stack-4', start: 53, end: 60, scene: 'stack',
      caption: 'So the peak depth is what the machine must hold at once, and the number of frames equals the number of calls.',
      detail: 'For sumTo(n) both numbers are n+1. The next scene shows a recursion where they separate: many calls, little depth.',
      keyword: 'peak depth',
      trap: 'This equality is special to linear recursion. It is not a general rule about recursion.',
      narration: 'So the peak depth is what the machine must hold at once, and the number of frames equals the number of calls.'
    },

    /* ---- scene 3: calls vs depth ---- */
    {
      id: 'depth-1', start: 60, end: 67, scene: 'depth',
      caption: 'A linear recursion calls itself once per level. sumTo(n) and fact(n) both reach a peak depth of n+1 frames.',
      detail: 'fact(n) = n == 0 ? 1 : n * fact(n-1) makes exactly n+1 calls, and the deepest stack holds all n+1 frames at once.',
      keyword: 'once per level',
      trap: 'The depth is a count of frames alive at the same time, not a count of calls made.',
      narration: 'A linear recursion calls itself once per level. sumTo of n and fact of n both reach a peak depth of n plus one frames.'
    },
    {
      id: 'depth-2', start: 67, end: 75, scene: 'depth',
      caption: 'A branching recursion calls itself twice. Naive fib(n) makes two calls per level, so the calls multiply while the depth stays n+1.',
      detail: 'The call tree has about 1.6^n nodes, which is exponential, while the longest root-to-leaf path is n+1 frames. Both statements are true at once.',
      keyword: 'branching',
      trap: '"Depth is linear, so it is fast" is a non sequitur. The cost of a recursion is the number of nodes, not the height of the tree.',
      narration: 'A branching recursion calls itself twice. Naive fib of n makes two calls per level, so the calls multiply while the depth stays n plus one.'
    },
    {
      id: 'depth-3', start: 75, end: 83, scene: 'depth',
      caption: 'The page counts them: fib(10) makes 177 calls and never goes deeper than 10 frames. fib(30) makes 2,692,537 calls at depth 30.',
      detail: 'The count follows 2·F(n+1) - 1, where F is the Fibonacci sequence starting 1, 1. The page computes both numbers and checks the formula.',
      keyword: '177 calls',
      trap: 'fib(30) is already slow enough to feel, and it is a 30-input problem. This is why memoisation and iteration replace naive recursion.',
      narration: 'The page counts them: fib of ten makes one hundred and seventy seven calls at a depth of eleven. fib of thirty makes over two and a half million calls at depth thirty one.'
    },
    {
      id: 'depth-4', start: 83, end: 90, scene: 'depth',
      caption: 'GATE 2015 Set 2 is the same gap in miniature: fun(5) returns 51 after 81 calls, at a peak depth of 5 frames.',
      detail: '81 is 3^4. The call count of that function grows by a factor of three per step, so a one-mark question on fun(5) is already 81 calls if you trace every one.',
      keyword: '81 calls',
      trap: 'The efficient route is a table of fun(1) to fun(5), not a call tree. The tree is what you must avoid drawing.',
      narration: 'The GATE 2015 question is the same gap in miniature: fun of five returns fifty one after eighty one calls, at a peak depth of five frames.'
    },

    /* ---- scene 4: termination ---- */
    {
      id: 'term-1', start: 90, end: 97, scene: 'termination',
      caption: 'Remove the base case and the function keeps calling. In C that is not an endless loop: it consumes stack until the stack runs out.',
      detail: 'Each call pushes a frame and no frame is ever popped, so the available stack is exhausted. What happens next is outside the standard.',
      keyword: 'consumes stack',
      trap: 'A program that "worked" without a base case did not terminate correctly. It stopped for a reason the standard does not describe.',
      narration: 'Remove the base case and the function keeps calling. In C that is not an endless loop: it consumes stack until the stack runs out.'
    },
    {
      id: 'term-2', start: 97, end: 105, scene: 'termination',
      caption: 'The standard calls that undefined behaviour, not a required error. It needs no diagnostic, and the result is not yours to predict.',
      detail: 'Running out of stack is a constraint on the implementation, not a trap the language defines. A given compiler may crash, may print something, or may optimise the recursion away.',
      keyword: 'undefined behaviour',
      trap: 'A question that asks for the output of a non-terminating recursion has no defined answer. "Does not terminate" or "undefined" is the honest answer.',
      narration: 'The standard calls that undefined behaviour, not a required error. It needs no diagnostic, and the result is not yours to predict.'
    },
    {
      id: 'term-3', start: 105, end: 113, scene: 'termination',
      caption: 'A base case can exist and still be unreachable: f(n) = f(n-2) with a base case at n == 1 never stops for an even n.',
      detail: 'The base case is present and correct. The argument simply steps over it. Every even start misses n == 1 forever.',
      keyword: 'unreachable',
      trap: 'This is the case candidates miss most often, because the code visibly contains a base case and looks finished.',
      narration: 'A base case can exist and still be unreachable: f of n calls f of n minus two, with a base case at n equal to one, which an even n never reaches.'
    },
    {
      id: 'term-4', start: 113, end: 120, scene: 'termination',
      caption: 'So ask two separate questions: does the argument move towards the base case, and does the base case lie on that path?',
      detail: 'For a recursion on two arguments, or on a floating-point value, the same two questions become "does the distance to the base case shrink?" and "is the base case a condition this sequence can satisfy?".',
      keyword: 'two separate questions',
      trap: 'Answering the first question and assuming the second is how a "correct" recursion is written that never returns.',
      narration: 'So ask two separate questions: does the argument move towards the base case, and does the base case lie on that path?'
    },

    /* ---- scene 5: iteration and tail calls ---- */
    {
      id: 'iter-1', start: 120, end: 127, scene: 'iteration',
      caption: 'sumTo can be written as a loop. Same arithmetic, no frames: constant extra space instead of space proportional to n.',
      detail: 'The loop keeps one accumulator and one counter. The recursion keeps n+1 frames. For n = 100000 the difference decides whether the program runs at all.',
      keyword: 'a loop',
      trap: 'Recursion is not "more advanced" than a loop. On a fixed stack it is the version with the hard limit.',
      narration: 'sumTo can be written as a loop. Same arithmetic, no frames: constant extra space instead of space proportional to n.'
    },
    {
      id: 'iter-2', start: 127, end: 135, scene: 'iteration',
      caption: 'A tail call is a call whose result is returned immediately, with no work left to do afterwards. Its frame is no longer needed.',
      detail: 'In sumTo the call is not in tail position: n + sumTo(n-1) has an addition to do after the call returns. In sumTo(n-1, acc+n) the call is the last thing that happens.',
      keyword: 'tail call',
      trap: 'The position of the call in the source decides this. n + f(n-1) is not a tail call however it is spaced or bracketed.',
      narration: 'A tail call is a call whose result is returned immediately, with no work left to do afterwards. Its frame is no longer needed.'
    },
    {
      id: 'iter-3', start: 135, end: 143, scene: 'iteration',
      caption: 'Some compilers reuse that frame anyway. But the C standard does not require it, so you may not assume constant stack.',
      detail: 'Tail call optimisation is an implementation choice. Whether a given build does it depends on the compiler and the optimisation level, so a program that relies on it is relying on something the language does not promise.',
      keyword: 'does not require it',
      trap: 'A claim that "tail recursion is O(1) space in C" is not a language guarantee. It is a property of some compilers at some settings.',
      narration: 'Some compilers reuse that frame anyway. But the C standard does not require it, so you may not assume constant stack.'
    },
    {
      id: 'iter-4', start: 143, end: 150, scene: 'iteration',
      caption: 'An accumulator makes the call a tail call; a loop removes the calls. Both keep the answer, and the page checks that they do.',
      detail: 'sumTo(n) = n + sumTo(n-1), sumToTail(n, acc) with acc += n, and a while loop all return n(n+1)/2. The model computes all three and compares them.',
      keyword: 'accumulator',
      trap: 'The accumulator must carry the whole partial answer. Carrying half of it is a common rewriting error that still terminates.',
      narration: 'An accumulator makes the call a tail call; a loop removes the calls. Both keep the answer, and the page checks that they do.'
    },

    /* ---- scene 6: GATE 2015 ---- */
    {
      id: 'g15-1', start: 150, end: 157, scene: 'gate2015',
      caption: 'GATE CSE 2015 Set 2: fun(1) is 1; for any larger n, x starts at 1 and gains fun(k) * fun(n-k) for k = 1 to n-1.',
      detail: 'The loop runs k from 1 while k < n, so the term for k = n is never added. x starts at 1, not at 0, and that 1 is the first thing many solutions lose.',
      keyword: 'fun(k) * fun(n-k)',
      trap: 'Two loops of the same recursion, multiplied. Each k needs two evaluations, and both are recursive.',
      narration: 'GATE 2015 Set 2: fun of one is one. For any larger n, x starts at one and gains fun of k times fun of n minus k, for k from one to n minus one.'
    },
    {
      id: 'g15-2', start: 157, end: 165, scene: 'gate2015',
      caption: 'Work upward, not downward: fun(2) = 1 + 1·1 = 2, fun(3) = 1 + 1·2 + 2·1 = 5, fun(4) = 1 + 5 + 4 + 5 = 15.',
      detail: 'Each value depends only on smaller values, so a table from 1 upward is enough. The page builds that table and checks each entry against a direct recursive evaluation.',
      keyword: 'work upward',
      trap: 'Trying to expand fun(5) as a tree means 81 calls. The table is 5 lines. Same answer, different cost for you.',
      narration: 'Work upward, not downward: fun of two is two, fun of three is five, and fun of four is fifteen.'
    },
    {
      id: 'g15-3', start: 165, end: 173, scene: 'gate2015',
      caption: 'fun(5) = 1 + 1·15 + 2·5 + 5·2 + 15·1 = 51. The answer is 51, and the model agrees.',
      detail: 'Four terms because k runs 1 to 4. The symmetry fun(k)·fun(n-k) appears twice, which is why 15 and 15, 10 and 10, pair up.',
      keyword: '51',
      trap: 'Adding the k = 5 term gives 71. Starting x at 0 gives 50, and dropping a term gives 26 or 36.',
      narration: 'fun of five is one plus fifteen plus ten plus ten plus fifteen, which is fifty one. The answer is fifty one.'
    },
    {
      id: 'g15-4', start: 173, end: 180, scene: 'gate2015',
      caption: 'The page also counts the calls: 1, 3, 9, 27, 81 — three to the power n-1. One mark, eighty-one calls, if you trace them all.',
      detail: 'Every call makes two recursive calls per k, and the number of k values grows by one per level, which gives the factor of three. The count is verified against the recursion, not assumed.',
      keyword: 'three to the power n-1',
      trap: 'A question worth one mark can hide exponential work. Recognising the table shape is the whole skill.',
      narration: 'The page also counts the calls: one, three, nine, twenty seven, eighty one — three to the power n minus one.'
    },

    /* ---- scene 7: read it as an algorithm ---- */
    {
      id: 'algo-1', start: 180, end: 187, scene: 'algorithms',
      caption: 'GATE CSE 2021 Set 2: SomeFunction subtracts the smaller argument from the larger and calls itself again.',
      detail: 'Three guards come first: if either argument is 1, return 1; if the arguments are equal, return that value; otherwise subtract and recurse.',
      keyword: 'subtracts',
      trap: 'The function has no single return at the end. Every path returns, which is why the compiler accepts it.',
      narration: 'GATE 2021 Set 2: SomeFunction subtracts the smaller argument from the larger and calls itself again.'
    },
    {
      id: 'algo-2', start: 187, end: 195, scene: 'algorithms',
      caption: 'That is the Euclidean algorithm by repeated subtraction, so it returns the gcd. The page checks the identity on every pair up to 40.',
      detail: 'Subtracting the smaller from the larger leaves the gcd unchanged, which is the invariant that makes the algorithm correct. The check compares SomeFunction(x, y) with gcd(x, y) for all pairs from 1 to 40.',
      keyword: 'the gcd',
      trap: 'Tracing (15, 255) by hand means 16 subtractions. Identifying the algorithm makes the trace unnecessary.',
      narration: 'That is the Euclidean algorithm by repeated subtraction, so it returns the gcd. The page checks the identity on every pair up to forty.'
    },
    {
      id: 'algo-3', start: 195, end: 203, scene: 'algorithms',
      caption: 'So SomeFunction(15, 255) is 15: the trace reaches (15, 15) after sixteen subtractions. The official key is 15.',
      detail: '255 = 15 x 17, so repeatedly subtracting 15 walks 255 down to 15 exactly. The function is called 17 times in total, counting the first call.',
      keyword: '15',
      trap: 'Answering 1275 multiplies the arguments instead of taking the gcd. Answering 1 assumes the "either argument is 1" guard fired.',
      narration: 'So SomeFunction of fifteen and two hundred and fifty five is fifteen: the trace reaches fifteen and fifteen after sixteen subtractions.'
    },
    {
      id: 'algo-4', start: 203, end: 210, scene: 'algorithms',
      caption: 'GATE CSE 2011: foo(n, r) = n mod r + foo(n / r, r) adds the digits of n in base r. foo(513, 2) = 2.',
      detail: '513 in binary is 1000000001, which has two 1 digits, so the digit sum is 2. The same function with r = 10 adds decimal digits: foo(345, 10) = 12. Both are checked against a digit-sum routine.',
      keyword: 'digits in base r',
      trap: 'The integer division is the point. With n / r as a real division the recursion never reaches 0, and the digit-sum reading disappears.',
      narration: 'GATE 2011: foo of n and r adds the digits of n in base r. foo of five hundred and thirteen and two is two, because that number has two ones in binary.'
    },

    /* ---- scene 8: convergence ---- */
    {
      id: 'conv-1', start: 210, end: 217, scene: 'converge',
      caption: 'GATE CSE 2014 Set 2: f(x) returns x when |x*x - 3| < 0.01, and otherwise calls f(x/2 + 1.5/x).',
      detail: 'The base case tests the value, not the argument. There is no decreasing integer and no obvious stopping index; the stopping condition is a tolerance on the answer.',
      keyword: 'returns x when',
      trap: 'Reading the condition as x*x == 3 exactly would make the base case almost unreachable in floating point.',
      narration: 'GATE 2014 Set 2: f of x returns x when the absolute value of x squared minus three is less than zero point zero one, and otherwise calls f of x over two plus one point five over x.'
    },
    {
      id: 'conv-2', start: 217, end: 225, scene: 'converge',
      caption: 'That update is Newton\'s step for x*x - 3 = 0, so the sequence converges to the square root of 3, about 1.732.',
      detail: 'x/2 + 1.5/x equals (x*x + 3) / (2x), which is the Newton iteration for x^2 = 3. Setting it equal to x gives x*x = 3, so the fixed point is exactly the square root of 3.',
      keyword: 'Newton\'s step',
      trap: 'The fixed point is where the update returns its own input. Solving that equation is faster than iterating, and it also proves where the iteration can end.',
      narration: 'That update is Newton\'s step for x squared minus three equals zero, so the sequence converges to the square root of three, about one point seven three two.'
    },
    {
      id: 'conv-3', start: 225, end: 233, scene: 'converge',
      caption: 'So the answer is a range, not one number: the official key accepts 1.72 to 1.74. Any q with |q*q - 3| < 0.01 returns itself at once.',
      detail: 'q = 1.73 gives |2.9929 - 3| = 0.0071, which is inside the tolerance, so f(1.73) returns at the first test with no recursive call at all.',
      keyword: '1.72 to 1.74',
      trap: 'A tolerance base case turns a value question into an interval question. Answering with one number when a range is asked can lose the mark.',
      narration: 'So the answer is a range, not one number: the official key accepts one point seven two to one point seven four.'
    },
    {
      id: 'conv-4', start: 233, end: 240, scene: 'converge',
      caption: 'One warning about this snippet as C: abs() takes an int, so abs(x*x - 3) is not the test written. The key answers the mathematical reading.',
      detail: 'In C, abs is declared for int, and the double argument is converted, so the tolerance effectively becomes 1. The function that computes a magnitude of a double is fabs. The official key is 1.73, which is the intended reading, so treat the snippet as pseudocode.',
      keyword: 'abs() takes an int',
      trap: 'Do not learn this line as good C. It is a GATE question, and the mark is for the mathematics.',
      narration: 'One warning about this snippet as C: abs takes an int, so that is not the test written. The key answers the mathematical reading.'
    },

    /* ---- scene 9: storage across frames ---- */
    {
      id: 'store-1', start: 240, end: 247, scene: 'storage',
      caption: 'Every parameter and every automatic local is a fresh object in each frame. That is why one name can hold many values at once.',
      detail: 'The recursion in scene 2 had four frames, each with its own n: 3, 2, 1, 0. Nothing was copied between them; they were separate objects created by separate calls.',
      keyword: 'fresh object',
      trap: 'The opposite belief — that n is one variable updated on the way down — makes every trace wrong from the second level onward.',
      narration: 'Every parameter and every automatic local is a fresh object in each frame. That is why one name can hold many values at once.'
    },
    {
      id: 'store-2', start: 247, end: 255, scene: 'storage',
      caption: 'A static local is one object for the whole run. All frames read and write the same counter, so it counts calls, not depth.',
      detail: 'The page runs depth(n) with a static counter: depth(3) increments it four times and returns 4, and a later call to depth(0) returns 5 because the object was never rebuilt.',
      keyword: 'one object',
      trap: 'A static local inside a recursive function is the same trap as the GATE 2019 loop question: the value survives between calls, so each level sees the previous level\'s number.',
      narration: 'A static local is one object for the whole run. All frames read and write the same counter, so it counts calls, not depth.'
    },
    {
      id: 'store-3', start: 255, end: 263, scene: 'storage',
      caption: 'An array parameter is a pointer, so every frame sees the same array. Recursion can fill it in place, and all levels see the change.',
      detail: 'The page bumps a[0] once per level: after bump(a, 3) with a[0] = 0 the element is 3, because the three frames wrote to one object rather than three copies.',
      keyword: 'a pointer',
      trap: 'A local array declared inside the function is the opposite: a fresh copy per frame. The two look alike and behave oppositely.',
      narration: 'An array parameter is a pointer, so every frame sees the same array. Recursion can fill it in place, and all levels see the change.'
    },
    {
      id: 'store-4', start: 263, end: 270, scene: 'storage',
      caption: 'So before any trace, sort every name in the function into per-frame or shared. The answer depends on that sort, not on the arithmetic.',
      detail: 'Parameters, automatic locals and local arrays are per-frame. Statics, globals, and anything reached through a pointer are shared. This one classification decides most trace questions.',
      keyword: 'per-frame or shared',
      trap: 'Two questions with identical arithmetic can have different answers because of one static keyword. The classification is the question.',
      narration: 'So before any trace, sort every name in the function into per-frame or shared. The answer depends on that sort, not on the arithmetic.'
    },

    /* ---- scene 10: procedure ---- */
    {
      id: 'proc-1', start: 270, end: 277, scene: 'procedure',
      caption: 'For a value question: write the call tree on paper, evaluate the base cases, then combine on the way up. Do not run it in one pass.',
      detail: 'The three steps match the three parts of the definition. Skipping the middle step is what produces a number that is nearly right.',
      keyword: 'call tree',
      trap: 'A single-pass mental run works only on linear recursions of depth two or three. It fails silently beyond that.',
      narration: 'For a value question: write the call tree on paper, evaluate the base cases, then combine on the way up.'
    },
    {
      id: 'proc-2', start: 277, end: 285, scene: 'procedure',
      caption: 'For a cost question: write the recurrence for the number of calls, then solve it. Calls and depth are two different recurrences.',
      detail: 'Linear recursion: T(n) = T(n-1) + 1, so n+1 calls at depth n+1. Merge-sort recursion: T(n) = 2T(n/2) + n, which for n a power of 2 is n log2 n + n. The page computes both and checks the closed forms.',
      keyword: 'the recurrence for the number of calls',
      trap: 'Writing the recurrence for the depth and calling it the cost is the single most common analysis error in this topic.',
      narration: 'For a cost question: write the recurrence for the number of calls, then solve it. Calls and depth are two different recurrences.'
    },
    {
      id: 'proc-3', start: 285, end: 293, scene: 'procedure',
      caption: 'Recursion is also the tool behind divide and conquer, tree traversals, and the recurrence-relations lesson you have already met.',
      detail: 'Merge sort, quicksort, binary search, tree and graph traversals, and backtracking are all recursions of the shapes in this lesson. The frames picture is the same in each.',
      keyword: 'the tool behind',
      trap: 'Do not relearn recursion inside each of those topics. Reuse this picture and learn only what the new algorithm adds.',
      narration: 'Recursion is also the tool behind divide and conquer, tree traversals, and the recurrence relations lesson you have already met.'
    },
    {
      id: 'proc-4', start: 293, end: 300, scene: 'procedure',
      caption: 'The two errors that cost the most marks: assuming a static local is per frame, and assuming the call returns before the rest of the expression.',
      detail: 'The first breaks the trace. The second breaks the order of side effects, which is why a call such as f(i, i++) is not a defined question in C.',
      keyword: 'the most marks',
      trap: 'Neither error looks like an error while you are making it. Both produce a plausible number.',
      narration: 'The two errors that cost the most marks: assuming a static local is per frame, and assuming the call returns before the rest of the expression.'
    }
  ]
};
