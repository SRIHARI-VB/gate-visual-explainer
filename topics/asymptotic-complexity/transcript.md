# Asymptotic Complexity and Recurrences — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/asymptotic-complexity/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Cost is a function, not a number

*0:00 – 0:30 · objective: See why a running time is a function of the input size, why the constants lose and the growth wins, and what "n" is counting.*

**0:00–0:07** — A running time is not a number of seconds. It is a function of the input size n.

> Caption: A running time is not a number of seconds. It is a function of n, the size of the input.

Exam-trap caption mode adds: *A timing in seconds measures your laptop, not the algorithm. Nothing in the notation is a stopwatch.*

**0:07–0:15** — Two algorithms on the same problem: one does about 5n steps, the other about n squared.

> Caption: Here are two algorithms on the same problem: one does about 5n steps, the other about n squared.

Exam-trap caption mode adds: *The count is of a named basic operation, so two different counts for the same program can both be right. Say what you counted.*

**0:15–0:22** — Below n equals five the quadratic is cheaper. Above five it is never cheaper again.

> Caption: Below n = 5 the quadratic is the cheaper one. Above n = 5 it is never cheaper again.

Exam-trap caption mode adds: *A crossover point is not an asymptote. The claim is about all large n, not about the n your test data happened to use.*

**0:22–0:30** — The question is never which is faster, but which grows slower. That question has a precise answer.

> Caption: So the question is never "which is faster" but "which grows slower", and that question has a precise answer.

Exam-trap caption mode adds: *Asymptotics throws away exactly the information a real deployment needs. Both statements can be true: the quadratic is the right choice for your four items.*

## Scene 2. Big-O is a bound with two witnesses

*0:30 – 1:00 · objective: Read the definition as a game against an adversary: one constant c and one starting point n0 that work for every larger n.*

**0:30–0:37** — Write f of n for the work your algorithm does. f is O of g when g is eventually an upper bound up to a constant.

> Caption: Write f(n) for the work your algorithm does. f is O of g when g is eventually an upper bound up to a constant.

Exam-trap caption mode adds: *O is not "about". It is a one-sided inequality that must hold from some point onward, with a fixed constant.*

**0:37–0:45** — There is a c greater than zero and an n zero such that for every n at least n zero, f of n is at most c times g of n.

> Caption: Formally: there is a c greater than zero and an n0 such that for every n at least n0, f(n) is at most c times g(n).

Exam-trap caption mode adds: *The "for every n at least n0" is the part that is dropped by mistake. Checking f(n) is at most c g(n) at one large n proves nothing.*

**0:45–0:52** — With f of n equal to three n squared plus five n plus two, and g of n equal to n squared, the witness is c equals four and n zero equals six.

> Caption: Take f(n) = 3n squared + 5n + 2 and g(n) = n squared. The witness is c = 4, n0 = 6.

Exam-trap caption mode adds: *The witness does not have to be tight or pretty. Any c and n0 that work are a complete proof, and the question never asks for the smallest one.*

**0:52–1:00** — The shaded tail is the whole claim: from n zero onward, f never rises above the dashed ceiling.

> Caption: The shaded tail is the whole claim: from n0 onward, f never rises above the dashed ceiling.

Exam-trap caption mode adds: *A curve that dips below the ceiling and then rises through it again is not O of that ceiling, however long it stayed under. Crossing back is fatal.*

## Scene 3. Omega from below, Theta from both sides

*1:00 – 1:30 · objective: State the lower bound, show that Theta is exactly O and Omega together, and see why a tight bound is the one worth reporting.*

**1:00–1:07** — Turn the inequality around and you have Omega: g is eventually a lower bound on f, again up to a constant.

> Caption: Turn the inequality around and you have Omega: g is eventually a lower bound on f, again up to a constant.

Exam-trap caption mode adds: *An upper bound does not exclude a faster algorithm and a lower bound does not exhibit one. Confusing the two is the commonest error in complexity questions.*

**1:07–1:15** — Theta needs both: f is Theta of g when f is O of g and f is Omega of g.

> Caption: Theta needs both: f is Theta of g when f is O of g and f is Omega of g.

Exam-trap caption mode adds: *Theta is not "approximately equal for the n I tested". It is two inequalities with fixed constants, and one of them can fail while the other holds.*

**1:15–1:22** — Three n squared plus five n plus two is Theta of n squared, and also O of n cubed, but it is not Theta of n cubed.

> Caption: So 3n squared + 5n + 2 is Theta of n squared, and also O of n cubed, but it is not Theta of n cubed.

Exam-trap caption mode adds: *Because O is loose, "f is O of n squared" and "f is Theta of n squared" can both be true. An option is not wrong for being loose unless the question asks for the tight bound.*

**1:22–1:30** — Write Theta when you can, and say which quantity you are bounding: time, space, or the number of a named operation.

> Caption: Write Theta when you can, and say which quantity you are bounding: time, space, or the number of a named operation.

Exam-trap caption mode adds: *Merge sort is Theta(n log n) time and Theta(n) auxiliary space. Quoting the first when the second was asked is a lost mark, not a subtle error.*

## Scene 4. Little-o is strict, and the ratio decides

*1:30 – 2:00 · objective: Separate O from o with one pair, then use the limit of the ratio as the single test that sorts every comparison into three outcomes.*

**1:30–1:37** — Big-O allows a constant factor to be as large as you like. Little-o forbids equality in the limit.

> Caption: Big-O allows a constant factor to be as large as you like. Little-o forbids equality in the limit.

Exam-trap caption mode adds: *n is O of n and n is not o of n, because the ratio is one, not zero. A question that says little-o is asking about strictness.*

**1:37–1:45** — Take the limit of f of n over g of n. Zero means little-o, a finite positive number means Theta, and infinity means little-omega.

> Caption: Take the limit of f(n) over g(n) as n grows. Zero means little-o; a finite positive number means Theta; infinity means little-omega.

Exam-trap caption mode adds: *The test needs the limit to exist. When the ratio oscillates the limit may not exist at all, and then the definitions, not the test, decide.*

**1:45–1:52** — The limit is often easiest to read after taking logarithms of both functions, because a product becomes a sum.

> Caption: The limit is often easiest to read after taking logarithms of both functions, because a product becomes a sum.

Exam-trap caption mode adds: *Taking a logarithm preserves order but destroys the constant factor, so it answers an ordering question and never a question about the exact value.*

**1:52–2:00** — A sample of values is not a proof: n log n over n to the 1.01 is still rising at n equal to ten to the twelve.

> Caption: And a sample of values is not a proof: n log n over n to the power 1.01 is still rising at n equal to 10 to the 12.

Exam-trap caption mode adds: *Plotting two functions and declaring a winner is the most reliable way to be wrong on a growth question. Prove it, or use the log trick.*

## Scene 5. The growth ladder

*2:00 – 2:30 · objective: Place the nine standard functions in one order, see that a logarithm base is only a constant, and see that log(n!) is Theta(n log n).*

**2:00–2:07** — Nine functions cover almost every answer GATE asks for, and they have one fixed order.

> Caption: Nine functions cover almost every answer GATE asks for, and they have one fixed order.

Exam-trap caption mode adds: *The ladder is about growth, not about value. At n = 2, n squared is 4 and n log n is 2, so a small test case can rank them the other way round.*

**2:07–2:15** — Polynomials are ordered by degree, and any power of n loses to any exponential, whatever the constant.

> Caption: Polynomials are ordered by degree, and any power of n loses to any exponential, whatever the constant.

Exam-trap caption mode adds: *A large exponent looks exponential and is not. n to the 100 is still a polynomial, and it beats 2 to the n for every n you could ever run.*

**2:15–2:22** — Two things look like they should matter and do not: the base of a logarithm, and a constant multiplier.

> Caption: Two things look like they should matter and do not: the base of a logarithm, and a constant multiplier.

Exam-trap caption mode adds: *Log squared n is not log n. A logarithm is absorbed, a power of a logarithm is not: log n squared is little-o of root n but it is not Theta of log n.*

**2:22–2:30** — Log of n factorial sits between half n log n and n log n, so sorting by comparison is Theta of n log n.

> Caption: Log of n factorial sits between half n log n and n log n, so sorting by comparison is Theta(n log n).

Exam-trap caption mode adds: *n factorial is not 2 to the n. Factorial is bigger than every exponential, which is why a brute-force permutation search is worse than an exponential subset search.*

## Scene 6. Not every pair can be compared

*2:30 – 3:00 · objective: Meet a function that is neither O nor Omega of n, and stop believing that asymptotic order is a total order.*

**2:30–2:37** — Here is a function that is neither O nor Omega of n: g of n is n to the power one plus sine of n.

> Caption: Here is a function that is neither O nor Omega of n: g(n) is n to the power 1 plus sine of n.

Exam-trap caption mode adds: *The exponent is not fixed, so none of the polynomial rules apply. Reading it as n squared, or as n, is the mistake the question is built on.*

**2:37–2:45** — Take the ratio n over g of n. It equals n to the power minus sine of n, which swings both above and below one.

> Caption: Take the ratio n over g(n). It equals n to the power minus sine of n, which swings both above and below 1.

Exam-trap caption mode adds: *A ratio that visits both zero and infinity has no limit, so the limit test does not apply. Fall back on the definitions.*

**2:45–2:52** — So neither n is O of g, nor g is O of n. Two functions need not be comparable at all.

> Caption: So neither n is O of g, nor g is O of n. Two functions need not be comparable at all.

Exam-trap caption mode adds: *Asymptotic order is a partial order on functions, not a total order. Any statement of the form "one of these must be O of the other" is false in general.*

**2:52–3:00** — The same lesson in a friendlier form: f of n squared is not always Theta of f of n squared.

> Caption: The same lesson in a friendlier form: f(n squared) is not always Theta of f(n) squared.

Exam-trap caption mode adds: *The hypothesis in the option is load-bearing. An option that is true for polynomials and false for exponentials is false as stated for all positive functions.*

## Scene 7. Best, average and worst are three functions

*3:00 – 3:30 · objective: Count the three cases of linear search, see that the average needs a distribution, and see why the syllabus names the worst case.*

**3:00–3:07** — Linear search looks at the cells one at a time until it finds the key. The count depends on where the key is.

> Caption: Linear search looks at the cells one at a time until it finds the key. The count depends on where the key is.

Exam-trap caption mode adds: *Best, average and worst are three different functions of n, not three estimates of one number.*

**3:07–3:15** — Best case: the key is first, so one comparison. Worst case: the key is last, so n comparisons.

> Caption: Best case: the key is first, so one comparison. Worst case: the key is last, so n comparisons.

Exam-trap caption mode adds: *A best-case bound is not a bound on the algorithm. Saying "linear search is O of 1" because the key might be first is true only of that input.*

**3:15–3:22** — Average case needs a distribution. Assume the key is equally likely to be in any position, and the average is n plus one over two.

> Caption: Average case needs a distribution. Assume the key is equally likely to be in any position, and the average is (n + 1) over 2.

Exam-trap caption mode adds: *An average case quoted without its distribution is not a claim at all. GATE questions state the distribution or ask only for the worst case.*

**3:22–3:30** — Whatever the distribution, the average lies between the best and the worst. That is the one free fact.

> Caption: Whatever the distribution, the average lies between the best and the worst. That is the one free fact.

Exam-trap caption mode adds: *All three are Theta of n here, so the distinction does not change the class. It changes the class when the best and worst differ in order, as in quicksort.*

## Scene 8. A recurrence, counted level by level

*3:30 – 4:00 · objective: Turn a divide-and-conquer algorithm into a recursion tree, add the level costs, and read off the three cases of the master theorem.*

**3:30–3:37** — A divide-and-conquer algorithm splits the input and pays for the split. That is a recurrence: T of n equals two T of n over two plus n.

> Caption: A divide-and-conquer algorithm splits the input and pays for the split. That is a recurrence: T(n) = 2T(n/2) + n.

Exam-trap caption mode adds: *The n term is the work at this level, not the work of the whole algorithm. Dropping it, or counting it once instead of per level, gives the wrong answer.*

**3:37–3:45** — Draw the calls as a tree. Level zero costs n, level one has two nodes costing n over two each, so it also costs n.

> Caption: Draw the calls as a tree. Level zero costs n, level one has two nodes costing n over 2 each, so it also costs n.

Exam-trap caption mode adds: *The number of nodes doubles per level and the work per node halves, so neither alone gives the level cost. Multiply them.*

**3:45–3:52** — There are log base two of n plus one levels, each costing n, so the total is n log n.

> Caption: There are log base 2 of n plus one levels, each costing n, so the total is n log n. That is the whole solution, with no theorem needed.

Exam-trap caption mode adds: *Counting levels as log n is right only for a halving split. A split into thirds gives log base 3, which differs by a constant and is still Theta of log n.*

**3:52–4:00** — The three cases compare the root cost with the leaf count. Whichever is bigger wins; when they tie, the logarithm appears.

> Caption: The three cases compare the root cost with the leaf count. Whichever is bigger wins; when they tie, the logarithm appears.

Exam-trap caption mode adds: *The theorem has a gap: when the root term is neither polynomially smaller nor polynomially larger, all three cases fail. T(n) = 2T(n/2) + n/log n is in the gap and is Theta(n log log n).*

## Scene 9. Space is the same argument on another quantity

*4:00 – 4:30 · objective: Separate total space from auxiliary space, count a call stack as depth rather than as calls, and see which algorithms are in place.*

**4:00–4:07** — Space complexity counts memory cells as a function of n, and the input usually does not count.

> Caption: Space complexity counts memory cells as a function of n, and the input usually does not count.

Exam-trap caption mode adds: *An algorithm that copies the input has Theta(n) auxiliary space even though its total space is also Theta(n). Saying "in place" about it is wrong.*

**4:07–4:15** — A recursive algorithm pays for its stack. Merge sort runs to depth log n, so its stack is log n frames, not n.

> Caption: A recursive algorithm pays for its stack. Merge sort runs to depth log n, so its stack is log n frames, not n.

Exam-trap caption mode adds: *Counting all the calls as stack frames overestimates the stack by a factor of n. Depth is the measure.*

**4:15–4:22** — Merge sort needs an n-cell temporary array, so its auxiliary space is n. Heapsort needs a constant number of cells.

> Caption: Merge sort needs an n-cell temporary array, so its auxiliary space is n. Heapsort needs a constant number of cells.

Exam-trap caption mode adds: *In place does not mean no memory at all. Heapsort uses a few index variables, which is Theta(1) and still counts as in place.*

**4:22–4:30** — A space answer has three parts: what is counted, whether the input is included, and the depth rather than the call count.

> Caption: So a space answer has three parts: what is counted, whether the input is included, and the depth rather than the call count.

Exam-trap caption mode adds: *The same algorithm can be Theta(n) or Theta(1) in auxiliary space depending on whether the output array counts. State your convention.*

## Scene 10. The decision procedure

*4:30 – 5:00 · objective: Fix the four questions that answer a complexity question in order, and know which trap each question defuses.*

**4:30–4:37** — Four questions answer almost every complexity item. First: is the question about a bound from above, from below, or both?

> Caption: Four questions answer almost every complexity item. First: is the question about a bound from above, from below, or both?

Exam-trap caption mode adds: *A true loose bound is a true option. Do not reject "O of n cubed" for n squared just because a tighter bound exists, unless the question asks for tight.*

**4:37–4:45** — Second: is every exponent constant? If not, the polynomial rules and the ladder do not apply.

> Caption: Second: is every exponent constant? If not, the polynomial rules and the ladder do not apply.

Exam-trap caption mode adds: *This is the single most common reason a confident ordering answer is wrong: one of the functions was never on the ladder.*

**4:45–4:52** — Third: which quantity, time or space, and whose? The algorithm, the input size, or the depth of the recursion.

> Caption: Third: which quantity, time or space, and whose? The algorithm, the input size, or the depth of the recursion.

Exam-trap caption mode adds: *Worst-case time and worst-case space are separate answers. So are the time of one operation and the time of n of them.*

**4:52–5:00** — Fourth: does the question name an assumption? A distribution, a sorted array, a heap. The answer changes when it does.

> Caption: Fourth: does the question name an assumption? A distribution, a sorted array, a heap. The answer changes when it does.

Exam-trap caption mode adds: *Options often differ only in which assumption they rely on. The right answer is the one whose assumption the stem actually gives.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
