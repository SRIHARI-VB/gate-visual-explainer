# Arrays Stacks Queues — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/arrays-stacks-queues/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. An array is one block plus a multiplication

*0:00 – 0:30 · objective: See that an index is arithmetic on an address, not a lookup in a table, and name the two costs that follow from it.*

**0:00–0:07** — An array is one block of memory cut into equal slots. The index is not stored anywhere. It is arithmetic on the base address.

> Caption: An array is one block of memory cut into equal slots. The index is not stored anywhere — it is arithmetic on the base address.

Exam-trap caption mode adds: *An array is not a list of boxes with addresses written on them. Only the base address exists; every other address is computed when you ask for it.*

**0:07–0:15** — The address of a of i is the base address plus i times w, where w is the size of one element in bytes. That is the whole of indexing.

> Caption: Address of a[i] = base + i times w, where w is the size of one element in bytes. That is the whole of indexing.

Exam-trap caption mode adds: *The size of one element is the size of the type, not of the value stored. sizeof(int) is fixed per implementation, usually four bytes, but the standard only fixes sizeof(char) at one.*

**0:15–0:23** — Reading any element costs the same. Inserting in the middle costs n shifts, because the block must stay contiguous.

> Caption: Reading any element costs the same. Inserting in the middle costs n shifts, because the block must stay contiguous.

Exam-trap caption mode adds: *Appending at the end is O(1) only while capacity remains. A dynamic array that must grow pays O(n) for the copy, which is why "amortised O(1) append" is a statement about a sequence of operations, not about one.*

**0:23–0:30** — Two consequences GATE uses: nothing checks the index, and the length is recoverable only where the array type is still visible.

> Caption: Two consequences GATE uses: nothing checks the index, and the length is recoverable only where the array type is still visible.

Exam-trap caption mode adds: *The two consequences are unrelated facts that share one cause. Learn the cause — the array is a block plus an offset — and both follow.*

## Scene 2. Two dimensions, one line of memory

*0:30 – 1:00 · objective: Derive the row-major and column-major address formulas from "which index varies fastest", then evaluate GATE 1998.*

**0:30–0:37** — A two-dimensional array is still one run of memory. Row-major stores whole rows one after another; column-major stores whole columns.

> Caption: A two-dimensional array is still one run of memory. Row-major stores whole rows one after another; column-major stores whole columns.

Exam-trap caption mode adds: *The two orders contain the same elements. Only the addresses differ, so a question about order is always a question about addresses.*

**0:37–0:45** — Row-major: base plus the row offset times the number of columns, plus the column offset, all times w. Column-major swaps the two roles.

> Caption: Row-major: base + ((i - L1) times cols + (j - L2)) times w. Column-major swaps the two roles: rows where columns stood.

Exam-trap caption mode adds: *The multiplier is the length of the other dimension, not the one being counted. Writing cols where rows belongs is the single most common error in this question.*

**0:45–0:53** — The mnemonic that never fails: in row-major the second index varies fastest, so consecutive addresses walk along a row.

> Caption: The mnemonic that never fails: in row-major the second index varies fastest, so consecutive addresses walk along a row.

Exam-trap caption mode adds: *C is row-major. A question that says column-major is asking about Fortran-style storage and must be answered with the other formula, even when the code shown is C.*

**0:53–1:00** — GATE 1998: the array runs from one to ten by one to fifteen, one location per integer, row-major, first element at one hundred. The address of a of i j is fifteen i plus j plus eighty four.

> Caption: GATE 1998: A[1..10][1..15], one location per integer, row-major, first element at 100. The address is 15i + j + 84.

Exam-trap caption mode adds: *The constant 84 comes from 100 - 15 - 1, and it changes if the base address or the lower bounds change. Copying the constant without its derivation loses the mark on the next variant.*

## Scene 3. What C checks, and what it does not

*1:00 – 1:30 · objective: Separate "compiles" from "defined": no bounds check, array decay, and sizeof inside a callee.*

**1:00–1:07** — C does not check array bounds. Reading a of ten on an array of ten compiles; the standard makes it undefined behaviour.

> Caption: C does not check array bounds. a[10] on int a[10] compiles; the standard makes reading or writing it undefined behaviour.

Exam-trap caption mode adds: *"It ran and printed the right answer" is not evidence that the program is defined. Undefined behaviour is allowed to look correct, and a question that asks for its output has no answer.*

**1:07–1:15** — A of minus one is the same kind of mistake from the other side: defined pointer arithmetic only inside the object, and here it leaves the object.

> Caption: a[-1] is the same kind of mistake from the other side: defined pointer arithmetic only inside the object, and here it leaves the object.

Exam-trap caption mode adds: *A negative index that "reads the length field before the array" is an implementation detail of some layouts, not a language rule, and it is exactly the kind of folklore a GATE question punishes.*

**1:15–1:23** — An array name becomes a pointer to its first element in almost every expression. sizeof is one of the few exceptions.

> Caption: An array name becomes a pointer to its first element in almost every expression. sizeof is one of the few exceptions.

Exam-trap caption mode adds: *Because of decay, sizeof inside the callee measures a pointer. The length computed at the call site and the length computed inside the function are different numbers for the same name.*

**1:23–1:30** — So a function that fills an array must be given its length, and an index that came from user input must be checked by you.

> Caption: So a function that fills an array must be given its length, and an index that came from user input must be checked by you.

Exam-trap caption mode adds: *Two arrays of the same type have the same pointer type, so a callee cannot tell a ten-element array from a thousand-element one. Nothing in the type system stops the overrun.*

## Scene 4. A stack is LIFO with one index

*1:30 – 2:00 · objective: Run push and pop on an array with top = -1, and name the two boundary states exactly.*

**1:30–1:37** — A stack inserts and removes at one end only. Last in, first out: the newest element is the only one you can reach.

> Caption: A stack inserts and removes at one end only. Last in, first out: the newest element is the only one you can reach.

Exam-trap caption mode adds: *A stack is not "an array used backwards". The restriction is the point: because only the top is reachable, the implementation needs one index and no searching.*

**1:37–1:45** — On an array: int a of N, and top equal to minus one. push writes a of plus plus top; pop reads a of top minus minus. Both are constant time.

> Caption: On an array: int a[N]; int top = -1. push writes a[++top]; pop reads a[top--]. Both are O(1).

Exam-trap caption mode adds: *The convention where top points at the last used slot and the convention where it points at the next free slot differ by one in every test. Read the code, not your memory of it.*

**1:45–1:53** — Every operation is constant time, and the price is a fixed capacity. Overflow belongs to this implementation, not to the stack idea.

> Caption: Every operation is O(1), and the price is a fixed capacity. Overflow belongs to this implementation, not to the stack idea.

Exam-trap caption mode adds: *Overflow on push is not a bug in the algorithm. Underflow on pop is not an error in the data either: it is the empty case, and the code must test for it.*

**1:53–2:00** — Two boundary states to keep apart: empty is top equal to minus one, full is top equal to N minus one. Mixing them is an off-by-one that costs a mark.

> Caption: Two boundary states to keep apart: empty is top == -1, full is top == N-1. Mixing them is an off-by-one that costs a mark.

Exam-trap caption mode adds: *A stack of capacity N holding N elements is full but valid. Saying it overflows at N-1 imports the circular-queue sacrifice convention into a structure that does not need it.*

## Scene 5. The stack evaluates postfix

*2:00 – 2:30 · objective: Evaluate a postfix expression stack by stack, including the operand order for minus and divide.*

**2:00–2:07** — Postfix writes each operator after its two operands, so no parentheses and no precedence rules are needed.

> Caption: Postfix writes each operator after its two operands, so no parentheses and no precedence rules are needed.

Exam-trap caption mode adds: *Postfix is not "reverse Polish for humans to read". It is the form a stack evaluates directly, which is why compilers emit it as intermediate code.*

**2:07–2:15** — Scan left to right. A number is pushed. An operator pops two, computes, and pushes the result. The first pop is the right operand.

> Caption: Scan left to right. A number is pushed. An operator pops two, computes, and pushes the result. The first pop is the right operand.

Exam-trap caption mode adds: *A stack underflow while evaluating means the expression was not valid postfix. A stack holding more than one value at the end means the same thing.*

**2:15–2:23** — GATE 2015 Set 3: ten five plus sixty six divide times eight minus gives fifteen, then ten, then one hundred and fifty, then one hundred and forty two.

> Caption: GATE 2015 Set 3: 10 5 + 60 6 / * 8 - gives 15, then 10, then 150, then 142. The answer is 142.

Exam-trap caption mode adds: *The distractor 213 comes from dividing 60 by 6 and then subtracting 8 before multiplying. That is the infix reading, not the postfix one.*

**2:23–2:30** — GATE 2007 asked a different question about the same trace: the top two elements after the first multiplication are six and one, not the final value two.

> Caption: GATE 2007 asked a different question about the same trace: the top two elements after the first * are 6 and 1, not the final value 2.

Exam-trap caption mode adds: *Answering 2 evaluates the whole expression. The question asked for a state in the middle, and a state question is answered by stopping the trace where it says to stop.*

## Scene 6. Which orders a stack can produce

*2:30 – 3:00 · objective: Decide whether an output order is reachable with one stack, and count how many are.*

**2:30–2:37** — Push one, two, three in that order, and pop whenever you like. The output orders are limited: one two three and three two one are both possible.

> Caption: Push 1, 2, 3 in that order, and pop whenever you like. The output orders are limited: 1, 2, 3 and 3, 2, 1 are both possible.

Exam-trap caption mode adds: *The input order is fixed. A question about reachable outputs never lets you reorder the pushes, only interleave them with pops.*

**2:37–2:45** — The test: push until the next wanted element is on top, then pop it. If it is buried under a larger element, the order is impossible.

> Caption: Greedy test: push until the next wanted element is on top, then pop it. If it is buried under a larger element, the order is impossible.

Exam-trap caption mode adds: *Trying one clever sequence is not a test. The greedy pass is exhaustive because any successful sequence must push up to the wanted element before it can pop it.*

**2:45–2:53** — GATE 1994 offered four orders for the input one to five. Only three four five two one works. In three four five one two the one sits under the two forever.

> Caption: GATE 1994 offered four orders for the input 1..5. Only 3, 4, 5, 2, 1 works. In 3, 4, 5, 1, 2 the 1 sits under the 2 forever.

Exam-trap caption mode adds: *5, 4, 3, 1, 2 looks close to the full reversal, which is reachable. The last two elements are swapped, and that is enough to make it impossible.*

**2:53–3:00** — How many are reachable? The Catalan number: five for three elements, fourteen for four, forty two for five. Equivalently, the order must avoid the pattern three one two.

> Caption: How many are reachable? The Catalan number: 5 for three elements, 14 for four, 42 for five. Equivalently, the order must avoid the pattern 312.

Exam-trap caption mode adds: *Catalan counts orders, not sequences of push and pop. Several different operation sequences can produce the same output order, so counting operation sequences gives a different, larger number.*

## Scene 7. FIFO, and the drift problem

*3:00 – 3:30 · objective: Show why a plain array queue refuses an insertion while free slots exist.*

**3:00–3:07** — A queue inserts at the rear and removes at the front. First in, first out: the oldest element is the one you get.

> Caption: A queue inserts at the rear and removes at the front. First in, first out: the oldest element is the one you get.

Exam-trap caption mode adds: *A queue is not a stack with two ends. Both structures have two ends in the array; what differs is which end is allowed to remove.*

**3:07–3:15** — In a plain array both indices only move forward, so the slots at the front are never reused after a dequeue.

> Caption: In a plain array both indices only move forward, so the slots at the front are never reused after a dequeue.

Exam-trap caption mode adds: *The wasted space is not a leak of the algorithm. It is a consequence of using two monotone indices over a finite array.*

**3:15–3:23** — With N equal to five: five insertions, three deletions, then one more insertion is refused while three slots sit free. The queue lies about being full.

> Caption: With N = 5: five insertions, three deletions, then one more insertion is refused while three slots sit free. The queue lies about being full.

Exam-trap caption mode adds: *This false-full condition is the reason the circular version exists. A question that shows a linear queue and asks for the number of elements must be answered from the indices, not from the capacity.*

**3:23–3:30** — Two repairs: shift every element down after each dequeue, which is linear, or wrap the indices, which is constant. Every real implementation wraps.

> Caption: Two repairs: shift every element down after each dequeue, which is O(n), or wrap the indices, which is O(1). Every real implementation wraps.

Exam-trap caption mode adds: *Dequeues in a shifted queue are O(n) each, so a sequence of n operations is O(n squared). That is the cost hidden by "a queue is O(1)".*

## Scene 8. Wrapping the index, and the full/empty ambiguity

*3:30 – 4:00 · objective: Use modulo arithmetic, then repair the fact that front == rear means both empty and full.*

**3:30–3:37** — Circular queue: rear becomes rear plus one modulo N, and front advances the same way. The array behaves as a ring.

> Caption: Circular queue: rear becomes (rear + 1) mod N, and front advances the same way. The array behaves as a ring.

Exam-trap caption mode adds: *The modulo is on the index, not on the value stored. The elements keep their order; only the position wraps.*

**3:37–3:45** — But now front equal to rear happens twice: when the queue is empty, and when it has wrapped all the way round. The indices alone cannot tell you which.

> Caption: But now front == rear happens twice: when the queue is empty, and when it has wrapped all the way round. The indices alone cannot tell you which.

Exam-trap caption mode adds: *This is not a flaw of modulo arithmetic. It is a counting problem: two indices carry only N times N states, and the pair (empty, full) collides.*

**3:45–3:53** — Repair one, sacrifice a slot: empty is front equal to rear, full is rear plus one modulo N equal to front, capacity N minus one, count rear minus front plus N modulo N.

> Caption: Repair one, sacrifice a slot: empty is front == rear, full is (rear + 1) mod N == front, capacity N - 1, count (rear - front + N) mod N.

Exam-trap caption mode adds: *Capacity is N - 1 with this convention and N with the count convention. A question that says "array of size n" is not yet telling you the capacity.*

**3:53–4:00** — GATE 2012 asked exactly this: capacity n minus one in an array of n, so full is rear plus one modulo n equal to front and empty is rear equal to front. The answer is A.

> Caption: GATE 2012 asked exactly this: capacity n - 1 in an array of n, so full is (REAR+1) mod n == FRONT and empty is REAR == FRONT. Answer A.

Exam-trap caption mode adds: *The distractor that swaps the two conditions is tempting because both involve REAR and FRONT. Empty is the equality of the two; full is the equality after one step.*

## Scene 9. Building one structure from another

*4:00 – 4:30 · objective: Queue from two stacks, stack from two queues, and two stacks in one array: three cost arguments.*

**4:00–4:07** — A queue from two stacks: push onto one stack. To dequeue, if the other stack is empty, pour everything across, then pop from it.

> Caption: A queue from two stacks: push onto one stack. To dequeue, if the other stack is empty, pour everything across, then pop from it.

Exam-trap caption mode adds: *Pouring on every dequeue destroys the order and makes the structure wrong, not merely slow. Pour only when the output stack is empty.*

**4:07–4:15** — One dequeue can move n elements, but each element crosses at most once, so m operations cost O of m. That is amortised constant time.

> Caption: One dequeue can move n elements, but each element crosses at most once, so m operations cost O(m). That is amortised O(1).

Exam-trap caption mode adds: *Worst case and amortised case answer different questions. A single dequeue is Θ(n) in the worst case; a sequence of m is O(m). Read which one is asked.*

**4:15–4:23** — The other direction: a stack from two queues. Push onto the first queue. To pop, move all but the last element to the second queue, take the last, swap.

> Caption: The other direction: a stack from two queues. Push onto the first queue. To pop, move all but the last element to the second queue, take the last, swap.

Exam-trap caption mode adds: *The two constructions are not symmetric in cost. Queue-from-stacks is amortised O(1); stack-from-queues is Θ(n) per pop. The direction matters.*

**4:23–4:30** — And two stacks can share one array: grow one from the left and one from the right. Overflow is exactly top one plus one equal to top two.

> Caption: And two stacks can share one array: grow one from the left and one from the right. Overflow is exactly top1 + 1 == top2.

Exam-trap caption mode adds: *Splitting the array in half throws away the flexibility that makes the construction worth doing: one stack could overflow while the other half sits empty.*

## Scene 10. The procedure, and where these go next

*4:30 – 5:00 · objective: Fix a written procedure for each of the three question shapes, and name what replaces these structures later.*

**4:30–4:37** — Address question: fix the lower bound, the storage order and the element size before substituting anything.

> Caption: Address question: fix the lower bound, the storage order and the element size before substituting anything.

Exam-trap caption mode adds: *Each of the three is a separate chance to be wrong, and two of them are stated in words rather than in the expression. Read the sentence, then write the formula.*

**4:37–4:45** — Stack or queue question: draw the array with its index variables and run the operations. Never reason from the name of the structure.

> Caption: Stack or queue question: draw the array with its index variables and run the operations. Never reason from the name of the structure.

Exam-trap caption mode adds: *A remembered rule such as "a circular queue holds N-1" is a statement about one convention. It is wrong for the count convention, and it is wrong for a linear queue.*

**4:45–4:53** — Permutation question: run the greedy push-until-possible test on the option you are checking, and count with Catalan if the question asks how many.

> Caption: Permutation question: run the greedy push-until-possible test on the option you are checking, and count with Catalan if the question asks how many.

Exam-trap caption mode adds: *A single counterexample rules out one option but proves nothing about the others. Test each option separately; the greedy pass is cheap enough.*

**4:53–5:00** — These are the substrate of everything after: linked lists replace the fixed block, heaps are priority queues, breadth-first search is a queue and depth-first search is a stack.

> Caption: These are the substrate of everything after: linked lists replace the fixed block, heaps are priority queues, BFS is a queue and DFS is a stack.

Exam-trap caption mode adds: *Do not relearn LIFO and FIFO inside each later topic. Learn them once here, then learn only what the new structure adds — pointers, priorities, or recursion.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
