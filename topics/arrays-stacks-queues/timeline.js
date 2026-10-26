/* ==========================================================================
   arrays-stacks-queues — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs — never edited by hand.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'contiguous',
      n: 1,
      title: 'An array is one block plus a multiplication',
      start: 0, end: 30,
      objective: 'See that an index is arithmetic on an address, not a lookup in a table, and name the two costs that follow from it.'
    },
    {
      id: 'twod',
      n: 2,
      title: 'Two dimensions, one line of memory',
      start: 30, end: 60,
      objective: 'Derive the row-major and column-major address formulas from "which index varies fastest", then evaluate GATE 1998.'
    },
    {
      id: 'bounds',
      n: 3,
      title: 'What C checks, and what it does not',
      start: 60, end: 90,
      objective: 'Separate "compiles" from "defined": no bounds check, array decay, and sizeof inside a callee.'
    },
    {
      id: 'stack',
      n: 4,
      title: 'A stack is LIFO with one index',
      start: 90, end: 120,
      objective: 'Run push and pop on an array with top = -1, and name the two boundary states exactly.'
    },
    {
      id: 'postfix',
      n: 5,
      title: 'The stack evaluates postfix',
      start: 120, end: 150,
      objective: 'Evaluate a postfix expression stack by stack, including the operand order for minus and divide.'
    },
    {
      id: 'permutations',
      n: 6,
      title: 'Which orders a stack can produce',
      start: 150, end: 180,
      objective: 'Decide whether an output order is reachable with one stack, and count how many are.'
    },
    {
      id: 'queue',
      n: 7,
      title: 'FIFO, and the drift problem',
      start: 180, end: 210,
      objective: 'Show why a plain array queue refuses an insertion while free slots exist.'
    },
    {
      id: 'circular',
      n: 8,
      title: 'Wrapping the index, and the full/empty ambiguity',
      start: 210, end: 240,
      objective: 'Use modulo arithmetic, then repair the fact that front == rear means both empty and full.'
    },
    {
      id: 'twostacks',
      n: 9,
      title: 'Building one structure from another',
      start: 240, end: 270,
      objective: 'Queue from two stacks, stack from two queues, and two stacks in one array: three cost arguments.'
    },
    {
      id: 'procedure',
      n: 10,
      title: 'The procedure, and where these go next',
      start: 270, end: 300,
      objective: 'Fix a written procedure for each of the three question shapes, and name what replaces these structures later.'
    }
  ],

  events: [

    /* ---- scene 1: contiguous ---- */
    {
      id: 'cont-1', start: 0, end: 7, scene: 'contiguous',
      caption: 'An array is one block of memory cut into equal slots. The index is not stored anywhere — it is arithmetic on the base address.',
      detail: 'Ten ints of four bytes occupy one run of forty bytes. Slot 0 starts at the base address, slot 1 four bytes later, slot i at base plus four times i. There is no table of positions to consult.',
      keyword: 'arithmetic on the base address',
      trap: 'An array is not a list of boxes with addresses written on them. Only the base address exists; every other address is computed when you ask for it.',
      narration: 'An array is one block of memory cut into equal slots. The index is not stored anywhere. It is arithmetic on the base address.'
    },
    {
      id: 'cont-2', start: 7, end: 15, scene: 'contiguous',
      caption: 'Address of a[i] = base + i times w, where w is the size of one element in bytes. That is the whole of indexing.',
      detail: 'For int a[10] with four-byte ints and base 1000, a[7] sits at 1000 + 7 times 4 = 1028. The C standard defines a[i] as *(a+i), so the bracket is not a primitive operation: it is pointer arithmetic plus a dereference.',
      keyword: 'base + i times w',
      trap: 'The size of one element is the size of the type, not of the value stored. sizeof(int) is fixed per implementation, usually four bytes, but the standard only fixes sizeof(char) at one.',
      narration: 'The address of a of i is the base address plus i times w, where w is the size of one element in bytes. That is the whole of indexing.'
    },
    {
      id: 'cont-3', start: 15, end: 23, scene: 'contiguous',
      caption: 'Reading any element costs the same. Inserting in the middle costs n shifts, because the block must stay contiguous.',
      detail: 'Random access is O(1) because the address is computed, not searched. Insertion and deletion in the middle are O(n) in the worst case because every element after the hole must move one slot.',
      keyword: 'n shifts',
      trap: 'Appending at the end is O(1) only while capacity remains. A dynamic array that must grow pays O(n) for the copy, which is why "amortised O(1) append" is a statement about a sequence of operations, not about one.',
      narration: 'Reading any element costs the same. Inserting in the middle costs n shifts, because the block must stay contiguous.'
    },
    {
      id: 'cont-4', start: 23, end: 30, scene: 'contiguous',
      caption: 'Two consequences GATE uses: nothing checks the index, and the length is recoverable only where the array type is still visible.',
      detail: 'sizeof(a) divided by sizeof(a[0]) gives the number of elements only for an actual array in scope. In a function that received a pointer, the same expression divides a pointer size by an element size, which is not the length.',
      keyword: 'nothing checks the index',
      trap: 'The two consequences are unrelated facts that share one cause. Learn the cause — the array is a block plus an offset — and both follow.',
      narration: 'Two consequences GATE uses: nothing checks the index, and the length is recoverable only where the array type is still visible.'
    },

    /* ---- scene 2: two dimensions ---- */
    {
      id: 'two-1', start: 30, end: 37, scene: 'twod',
      caption: 'A two-dimensional array is still one run of memory. Row-major stores whole rows one after another; column-major stores whole columns.',
      detail: 'A[3][4] has twelve elements in one line of memory whichever order is used. The order decides only which elements are neighbours: in row-major, A[0][0] and A[0][1] are adjacent.',
      keyword: 'one run of memory',
      trap: 'The two orders contain the same elements. Only the addresses differ, so a question about order is always a question about addresses.',
      narration: 'A two-dimensional array is still one run of memory. Row-major stores whole rows one after another; column-major stores whole columns.'
    },
    {
      id: 'two-2', start: 37, end: 45, scene: 'twod',
      caption: 'Row-major: base + ((i - L1) times cols + (j - L2)) times w. Column-major swaps the two roles: rows where columns stood.',
      detail: 'L1 and L2 are the lower bounds of the two index ranges. cols is the number of columns, that is U2 - L2 + 1. For column-major the multiplier is rows = U1 - L1 + 1 and the outer count is (j - L2).',
      keyword: 'times cols',
      trap: 'The multiplier is the length of the other dimension, not the one being counted. Writing cols where rows belongs is the single most common error in this question.',
      narration: 'Row-major: base plus the row offset times the number of columns, plus the column offset, all times w. Column-major swaps the two roles.'
    },
    {
      id: 'two-3', start: 45, end: 53, scene: 'twod',
      caption: 'The mnemonic that never fails: in row-major the second index varies fastest, so consecutive addresses walk along a row.',
      detail: 'If you can say which index changes when the address goes up by one element, you can rebuild the formula. Row-major: j changes, so the outer term counts i and the multiplier is the number of columns.',
      keyword: 'the second index varies fastest',
      trap: 'C is row-major. A question that says column-major is asking about Fortran-style storage and must be answered with the other formula, even when the code shown is C.',
      narration: 'The mnemonic that never fails: in row-major the second index varies fastest, so consecutive addresses walk along a row.'
    },
    {
      id: 'two-4', start: 53, end: 60, scene: 'twod',
      caption: 'GATE 1998: A[1..10][1..15], one location per integer, row-major, first element at 100. The address is 15i + j + 84.',
      detail: '100 + ((i-1) times 15 + (j-1)) expands to 15i + j + 84. The page evaluates this for all 150 cells and compares it with the direct formula, so the algebra is checked rather than trusted.',
      keyword: '15i + j + 84',
      trap: 'The constant 84 comes from 100 - 15 - 1, and it changes if the base address or the lower bounds change. Copying the constant without its derivation loses the mark on the next variant.',
      narration: 'GATE 1998: the array runs from one to ten by one to fifteen, one location per integer, row-major, first element at one hundred. The address of a of i j is fifteen i plus j plus eighty four.'
    },

    /* ---- scene 3: bounds ---- */
    {
      id: 'bnd-1', start: 60, end: 67, scene: 'bounds',
      caption: 'C does not check array bounds. a[10] on int a[10] compiles; the standard makes reading or writing it undefined behaviour.',
      detail: 'The compiler has no obligation to diagnose it, and the program has no defined result. It may appear to work, may corrupt a neighbour, or may crash. The expression a[10] means *(a + 10), and the pointer a + 10 is one past the end of the object.',
      keyword: 'undefined behaviour',
      trap: '"It ran and printed the right answer" is not evidence that the program is defined. Undefined behaviour is allowed to look correct, and a question that asks for its output has no answer.',
      narration: 'C does not check array bounds. Reading a of ten on an array of ten compiles; the standard makes it undefined behaviour.'
    },
    {
      id: 'bnd-2', start: 67, end: 75, scene: 'bounds',
      caption: 'a[-1] is the same kind of mistake from the other side: defined pointer arithmetic only inside the object, and here it leaves the object.',
      detail: 'Pointer arithmetic is defined within an array and one element past its end. Stepping before the first element is outside that range, so the dereference is undefined behaviour even though the address is computable.',
      keyword: 'leaves the object',
      trap: 'A negative index that "reads the length field before the array" is an implementation detail of some layouts, not a language rule, and it is exactly the kind of folklore a GATE question punishes.',
      narration: 'A of minus one is the same kind of mistake from the other side: defined pointer arithmetic only inside the object, and here it leaves the object.'
    },
    {
      id: 'bnd-3', start: 75, end: 83, scene: 'bounds',
      caption: 'An array name becomes a pointer to its first element in almost every expression. sizeof is one of the few exceptions.',
      detail: 'The exceptions are the operands of sizeof, the operand of unary &, and a string literal used to initialise an array. Everywhere else the array decays, which is why passing an array to a function passes an address and not a copy.',
      keyword: 'sizeof is one of the few exceptions',
      trap: 'Because of decay, sizeof inside the callee measures a pointer. The length computed at the call site and the length computed inside the function are different numbers for the same name.',
      narration: 'An array name becomes a pointer to its first element in almost every expression. sizeof is one of the few exceptions.'
    },
    {
      id: 'bnd-4', start: 83, end: 90, scene: 'bounds',
      caption: 'So a function that fills an array must be given its length, and an index that came from user input must be checked by you.',
      detail: 'The C standard library follows the same rule: memcpy and fread take a count. The language supplies no length with the address, because the address is all that was passed.',
      keyword: 'must be given its length',
      trap: 'Two arrays of the same type have the same pointer type, so a callee cannot tell a ten-element array from a thousand-element one. Nothing in the type system stops the overrun.',
      narration: 'So a function that fills an array must be given its length, and an index that came from user input must be checked by you.'
    },

    /* ---- scene 4: stack ---- */
    {
      id: 'stk-1', start: 90, end: 97, scene: 'stack',
      caption: 'A stack inserts and removes at one end only. Last in, first out: the newest element is the only one you can reach.',
      detail: 'The abstract data type has push, pop, and a way to look at the top without removing it. The discipline is what makes it a stack, not the array underneath.',
      keyword: 'Last in, first out',
      trap: 'A stack is not "an array used backwards". The restriction is the point: because only the top is reachable, the implementation needs one index and no searching.',
      narration: 'A stack inserts and removes at one end only. Last in, first out: the newest element is the only one you can reach.'
    },
    {
      id: 'stk-2', start: 97, end: 105, scene: 'stack',
      caption: 'On an array: int a[N]; int top = -1. push writes a[++top]; pop reads a[top--]. Both are O(1).',
      detail: 'push must test top == N-1 first and report overflow; pop must test top == -1 first and report underflow. The page runs both operations and checks the two boundary states.',
      keyword: 'top = -1',
      trap: 'The convention where top points at the last used slot and the convention where it points at the next free slot differ by one in every test. Read the code, not your memory of it.',
      narration: 'On an array: int a of N, and top equal to minus one. push writes a of plus plus top; pop reads a of top minus minus. Both are constant time.'
    },
    {
      id: 'stk-3', start: 105, end: 113, scene: 'stack',
      caption: 'Every operation is O(1), and the price is a fixed capacity. Overflow belongs to this implementation, not to the stack idea.',
      detail: 'A linked-list stack has no fixed capacity and pays with a pointer per element. A question that asks "what is the time complexity of push" is asking about the array version unless it says otherwise.',
      keyword: 'fixed capacity',
      trap: 'Overflow on push is not a bug in the algorithm. Underflow on pop is not an error in the data either: it is the empty case, and the code must test for it.',
      narration: 'Every operation is constant time, and the price is a fixed capacity. Overflow belongs to this implementation, not to the stack idea.'
    },
    {
      id: 'stk-4', start: 113, end: 120, scene: 'stack',
      caption: 'Two boundary states to keep apart: empty is top == -1, full is top == N-1. Mixing them is an off-by-one that costs a mark.',
      detail: 'With N = 8, the stack holds eight elements, and the eighth push leaves top at 7. The ninth push must be refused. The page pushes nine times and checks that exactly one overflow is reported.',
      keyword: 'empty is top == -1',
      trap: 'A stack of capacity N holding N elements is full but valid. Saying it overflows at N-1 imports the circular-queue sacrifice convention into a structure that does not need it.',
      narration: 'Two boundary states to keep apart: empty is top equal to minus one, full is top equal to N minus one. Mixing them is an off-by-one that costs a mark.'
    },

    /* ---- scene 5: postfix ---- */
    {
      id: 'post-1', start: 120, end: 127, scene: 'postfix',
      caption: 'Postfix writes each operator after its two operands, so no parentheses and no precedence rules are needed.',
      detail: 'The infix form (10+5)*(60/6)-8 needs brackets to say what postfix says by position: 10 5 + 60 6 / * 8 -. The structure of the expression is in the token order itself.',
      keyword: 'after its two operands',
      trap: 'Postfix is not "reverse Polish for humans to read". It is the form a stack evaluates directly, which is why compilers emit it as intermediate code.',
      narration: 'Postfix writes each operator after its two operands, so no parentheses and no precedence rules are needed.'
    },
    {
      id: 'post-2', start: 127, end: 135, scene: 'postfix',
      caption: 'Scan left to right. A number is pushed. An operator pops two, computes, and pushes the result. The first pop is the right operand.',
      detail: 'For subtraction and division the order matters: pop b then a, and compute a - b. Reversing them is the most common arithmetic slip, and it is invisible for + and *.',
      keyword: 'The first pop is the right operand',
      trap: 'A stack underflow while evaluating means the expression was not valid postfix. A stack holding more than one value at the end means the same thing.',
      narration: 'Scan left to right. A number is pushed. An operator pops two, computes, and pushes the result. The first pop is the right operand.'
    },
    {
      id: 'post-3', start: 135, end: 143, scene: 'postfix',
      caption: 'GATE 2015 Set 3: 10 5 + 60 6 / * 8 - gives 15, then 10, then 150, then 142. The answer is 142.',
      detail: 'The page evaluates the expression token by token and records the stack after each one, so the trace on screen is the trace the algorithm produced. 15 times 10 is 150, and 150 minus 8 is 142.',
      keyword: '142',
      trap: 'The distractor 213 comes from dividing 60 by 6 and then subtracting 8 before multiplying. That is the infix reading, not the postfix one.',
      narration: 'GATE 2015 Set 3: ten five plus sixty six divide times eight minus gives fifteen, then ten, then one hundred and fifty, then one hundred and forty two.'
    },
    {
      id: 'post-4', start: 143, end: 150, scene: 'postfix',
      caption: 'GATE 2007 asked a different question about the same trace: the top two elements after the first * are 6 and 1, not the final value 2.',
      detail: 'The expression is 8 2 3 ^ / 2 3 * + 5 1 * -, with ^ as exponentiation. After the first multiplication the stack holds 1 and 6, so the answer is the pair, not the result of finishing the evaluation.',
      keyword: '6 and 1',
      trap: 'Answering 2 evaluates the whole expression. The question asked for a state in the middle, and a state question is answered by stopping the trace where it says to stop.',
      narration: 'GATE 2007 asked a different question about the same trace: the top two elements after the first multiplication are six and one, not the final value two.'
    },

    /* ---- scene 6: permutations ---- */
    {
      id: 'prm-1', start: 150, end: 157, scene: 'permutations',
      caption: 'Push 1, 2, 3 in that order, and pop whenever you like. The output orders are limited: 1, 2, 3 and 3, 2, 1 are both possible.',
      detail: 'Alternating push and pop gives 1, 2, 3. Pushing all three then popping gives 3, 2, 1. Mixed orders such as 2, 3, 1 are also reachable, so the discipline does not simply reverse the input.',
      keyword: 'pop whenever you like',
      trap: 'The input order is fixed. A question about reachable outputs never lets you reorder the pushes, only interleave them with pops.',
      narration: 'Push one, two, three in that order, and pop whenever you like. The output orders are limited: one two three and three two one are both possible.'
    },
    {
      id: 'prm-2', start: 157, end: 165, scene: 'permutations',
      caption: 'Greedy test: push until the next wanted element is on top, then pop it. If it is buried under a larger element, the order is impossible.',
      detail: 'There is only one sensible way to try: work through the wanted output from left to right, pushing as needed. If the wanted element is already on the stack but not on top, no sequence of legal moves can free it.',
      keyword: 'push until the next wanted element is on top',
      trap: 'Trying one clever sequence is not a test. The greedy pass is exhaustive because any successful sequence must push up to the wanted element before it can pop it.',
      narration: 'The test: push until the next wanted element is on top, then pop it. If it is buried under a larger element, the order is impossible.'
    },
    {
      id: 'prm-3', start: 165, end: 173, scene: 'permutations',
      caption: 'GATE 1994 offered four orders for the input 1..5. Only 3, 4, 5, 2, 1 works. In 3, 4, 5, 1, 2 the 1 sits under the 2 forever.',
      detail: 'The page runs the greedy test on all four options: 3,4,5,1,2 fails, 3,4,5,2,1 succeeds, 1,5,2,3,4 fails, 5,4,3,1,2 fails. Option B is the only reachable order.',
      keyword: 'only 3, 4, 5, 2, 1',
      trap: '5, 4, 3, 1, 2 looks close to the full reversal, which is reachable. The last two elements are swapped, and that is enough to make it impossible.',
      narration: 'GATE 1994 offered four orders for the input one to five. Only three four five two one works. In three four five one two the one sits under the two forever.'
    },
    {
      id: 'prm-4', start: 173, end: 180, scene: 'permutations',
      caption: 'How many are reachable? The Catalan number: 5 for three elements, 14 for four, 42 for five. Equivalently, the order must avoid the pattern 312.',
      detail: 'The count is (2n)! divided by ((n+1)! times n!). The page enumerates every permutation up to six elements, tests each with the greedy pass, and confirms the counts 1, 2, 5, 14, 42, 132 and the equivalence with 312-avoidance on all 873 permutations.',
      keyword: 'Catalan',
      trap: 'Catalan counts orders, not sequences of push and pop. Several different operation sequences can produce the same output order, so counting operation sequences gives a different, larger number.',
      narration: 'How many are reachable? The Catalan number: five for three elements, fourteen for four, forty two for five. Equivalently, the order must avoid the pattern three one two.'
    },

    /* ---- scene 7: queue ---- */
    {
      id: 'que-1', start: 180, end: 187, scene: 'queue',
      caption: 'A queue inserts at the rear and removes at the front. First in, first out: the oldest element is the one you get.',
      detail: 'The abstract data type has enqueue, dequeue, and a way to see the front. It is the discipline a printer spool, a scheduler and a breadth-first search all need.',
      keyword: 'First in, first out',
      trap: 'A queue is not a stack with two ends. Both structures have two ends in the array; what differs is which end is allowed to remove.',
      narration: 'A queue inserts at the rear and removes at the front. First in, first out: the oldest element is the one you get.'
    },
    {
      id: 'que-2', start: 187, end: 195, scene: 'queue',
      caption: 'In a plain array both indices only move forward, so the slots at the front are never reused after a dequeue.',
      detail: 'front records where the oldest element is, rear records where the next insertion goes. A dequeue increments front and leaves the cell behind it unusable for the rest of the run.',
      keyword: 'never reused',
      trap: 'The wasted space is not a leak of the algorithm. It is a consequence of using two monotone indices over a finite array.',
      narration: 'In a plain array both indices only move forward, so the slots at the front are never reused after a dequeue.'
    },
    {
      id: 'que-3', start: 195, end: 203, scene: 'queue',
      caption: 'With N = 5: five insertions, three deletions, then one more insertion is refused while three slots sit free. The queue lies about being full.',
      detail: 'The page simulates exactly this and records the refusal. rear has reached the end of the array, so the test rear == N-1 fires, even though front has walked past three cells that will never be used again.',
      keyword: 'three slots sit free',
      trap: 'This false-full condition is the reason the circular version exists. A question that shows a linear queue and asks for the number of elements must be answered from the indices, not from the capacity.',
      narration: 'With N equal to five: five insertions, three deletions, then one more insertion is refused while three slots sit free. The queue lies about being full.'
    },
    {
      id: 'que-4', start: 203, end: 210, scene: 'queue',
      caption: 'Two repairs: shift every element down after each dequeue, which is O(n), or wrap the indices, which is O(1). Every real implementation wraps.',
      detail: 'Shifting keeps the code simple and makes dequeue linear. Wrapping keeps every operation constant time and needs one extra rule to tell a full queue from an empty one.',
      keyword: 'wrap the indices',
      trap: 'Dequeues in a shifted queue are O(n) each, so a sequence of n operations is O(n squared). That is the cost hidden by "a queue is O(1)".',
      narration: 'Two repairs: shift every element down after each dequeue, which is linear, or wrap the indices, which is constant. Every real implementation wraps.'
    },

    /* ---- scene 8: circular ---- */
    {
      id: 'cir-1', start: 210, end: 217, scene: 'circular',
      caption: 'Circular queue: rear becomes (rear + 1) mod N, and front advances the same way. The array behaves as a ring.',
      detail: 'After the last index comes index 0, so the cells freed by earlier dequeues are reachable again. With N = 8, filling four, draining four and filling four more reports no overflow at all.',
      keyword: 'mod N',
      trap: 'The modulo is on the index, not on the value stored. The elements keep their order; only the position wraps.',
      narration: 'Circular queue: rear becomes rear plus one modulo N, and front advances the same way. The array behaves as a ring.'
    },
    {
      id: 'cir-2', start: 217, end: 225, scene: 'circular',
      caption: 'But now front == rear happens twice: when the queue is empty, and when it has wrapped all the way round. The indices alone cannot tell you which.',
      detail: 'If every slot may be filled, then after N insertions rear returns to front, and the state is indistinguishable from the empty state by the two indices alone. This ambiguity is the whole content of GATE 2012.',
      keyword: 'indistinguishable',
      trap: 'This is not a flaw of modulo arithmetic. It is a counting problem: two indices carry only N times N states, and the pair (empty, full) collides.',
      narration: 'But now front equal to rear happens twice: when the queue is empty, and when it has wrapped all the way round. The indices alone cannot tell you which.'
    },
    {
      id: 'cir-3', start: 225, end: 233, scene: 'circular',
      caption: 'Repair one, sacrifice a slot: empty is front == rear, full is (rear + 1) mod N == front, capacity N - 1, count (rear - front + N) mod N.',
      detail: 'One cell is always left empty, so rear can never equal front in the full state. The page checks that the count formula equals the true number of stored elements over a long sequence of operations.',
      keyword: 'capacity N - 1',
      trap: 'Capacity is N - 1 with this convention and N with the count convention. A question that says "array of size n" is not yet telling you the capacity.',
      narration: 'Repair one, sacrifice a slot: empty is front equal to rear, full is rear plus one modulo N equal to front, capacity N minus one, count rear minus front plus N modulo N.'
    },
    {
      id: 'cir-4', start: 233, end: 240, scene: 'circular',
      caption: 'GATE 2012 asked exactly this: capacity n - 1 in an array of n, so full is (REAR+1) mod n == FRONT and empty is REAR == FRONT. Answer A.',
      detail: 'The page simulates n = 8 under that convention: seven insertions succeed, the eighth is refused, and the empty test is true at the start. Repair two, keeping a count, holds all N and costs one more variable.',
      keyword: 'Answer A',
      trap: 'The distractor that swaps the two conditions is tempting because both involve REAR and FRONT. Empty is the equality of the two; full is the equality after one step.',
      narration: 'GATE 2012 asked exactly this: capacity n minus one in an array of n, so full is rear plus one modulo n equal to front and empty is rear equal to front. The answer is A.'
    },

    /* ---- scene 9: two stacks ---- */
    {
      id: 'tws-1', start: 240, end: 247, scene: 'twostacks',
      caption: 'A queue from two stacks: push onto one stack. To dequeue, if the other stack is empty, pour everything across, then pop from it.',
      detail: 'The pour reverses the order once, and popping reverses it again, so the element that waited longest comes out first. The page runs a mixed sequence and checks the output is exactly first-in first-out.',
      keyword: 'pour everything across',
      trap: 'Pouring on every dequeue destroys the order and makes the structure wrong, not merely slow. Pour only when the output stack is empty.',
      narration: 'A queue from two stacks: push onto one stack. To dequeue, if the other stack is empty, pour everything across, then pop from it.'
    },
    {
      id: 'tws-2', start: 247, end: 255, scene: 'twostacks',
      caption: 'One dequeue can move n elements, but each element crosses at most once, so m operations cost O(m). That is amortised O(1).',
      detail: 'The expensive dequeue happens only after the output stack has been drained, and it is paid for by all the pushes that filled the input stack. Averaged over a sequence, the cost per operation is constant.',
      keyword: 'amortised O(1)',
      trap: 'Worst case and amortised case answer different questions. A single dequeue is Θ(n) in the worst case; a sequence of m is O(m). Read which one is asked.',
      narration: 'One dequeue can move n elements, but each element crosses at most once, so m operations cost O of m. That is amortised constant time.'
    },
    {
      id: 'tws-3', start: 255, end: 263, scene: 'twostacks',
      caption: 'The other direction: a stack from two queues. Push onto the first queue. To pop, move all but the last element to the second queue, take the last, swap.',
      detail: 'Taking the last element of a queue means moving everything ahead of it, so every pop is Θ(n) and there is no amortisation. The page runs the same operation sequence and checks the output is last-in first-out.',
      keyword: 'all but the last',
      trap: 'The two constructions are not symmetric in cost. Queue-from-stacks is amortised O(1); stack-from-queues is Θ(n) per pop. The direction matters.',
      narration: 'The other direction: a stack from two queues. Push onto the first queue. To pop, move all but the last element to the second queue, take the last, swap.'
    },
    {
      id: 'tws-4', start: 263, end: 270, scene: 'twostacks',
      caption: 'And two stacks can share one array: grow one from the left and one from the right. Overflow is exactly top1 + 1 == top2.',
      detail: 'Neither stack has a fixed half. The array of N cells holds N elements in total, split wherever the two tops meet, and the page checks that N pushes succeed and the N+1-th is refused.',
      keyword: 'top1 + 1 == top2',
      trap: 'Splitting the array in half throws away the flexibility that makes the construction worth doing: one stack could overflow while the other half sits empty.',
      narration: 'And two stacks can share one array: grow one from the left and one from the right. Overflow is exactly top one plus one equal to top two.'
    },

    /* ---- scene 10: procedure ---- */
    {
      id: 'pro-1', start: 270, end: 277, scene: 'procedure',
      caption: 'Address question: fix the lower bound, the storage order and the element size before substituting anything.',
      detail: 'Those three are the only inputs to the formula. The page derives 15i + j + 84 from them and then evaluates all 150 cells, so the answer is checked against the formula rather than against one substituted example.',
      keyword: 'three inputs',
      trap: 'Each of the three is a separate chance to be wrong, and two of them are stated in words rather than in the expression. Read the sentence, then write the formula.',
      narration: 'Address question: fix the lower bound, the storage order and the element size before substituting anything.'
    },
    {
      id: 'pro-2', start: 277, end: 285, scene: 'procedure',
      caption: 'Stack or queue question: draw the array with its index variables and run the operations. Never reason from the name of the structure.',
      detail: 'Two questions that both say "circular queue" can have different capacities, because the full test differs. The drawing, not the vocabulary, decides the answer.',
      keyword: 'draw the array',
      trap: 'A remembered rule such as "a circular queue holds N-1" is a statement about one convention. It is wrong for the count convention, and it is wrong for a linear queue.',
      narration: 'Stack or queue question: draw the array with its index variables and run the operations. Never reason from the name of the structure.'
    },
    {
      id: 'pro-3', start: 285, end: 293, scene: 'procedure',
      caption: 'Permutation question: run the greedy push-until-possible test on the option you are checking, and count with Catalan if the question asks how many.',
      detail: 'The greedy pass is exhaustive, so it answers "possible?" for one option in time proportional to n. Counting all reachable orders needs the closed form, and the page confirms it by enumeration up to n = 6.',
      keyword: 'greedy push-until-possible test',
      trap: 'A single counterexample rules out one option but proves nothing about the others. Test each option separately; the greedy pass is cheap enough.',
      narration: 'Permutation question: run the greedy push-until-possible test on the option you are checking, and count with Catalan if the question asks how many.'
    },
    {
      id: 'pro-4', start: 293, end: 300, scene: 'procedure',
      caption: 'These are the substrate of everything after: linked lists replace the fixed block, heaps are priority queues, BFS is a queue and DFS is a stack.',
      detail: 'The disciplines survive the change of implementation. A linked list is still indexed by counting rather than multiplying, which is exactly the O(n) access it trades for O(1) insertion.',
      keyword: 'the substrate',
      trap: 'Do not relearn LIFO and FIFO inside each later topic. Learn them once here, then learn only what the new structure adds — pointers, priorities, or recursion.',
      narration: 'These are the substrate of everything after: linked lists replace the fixed block, heaps are priority queues, breadth-first search is a queue and depth-first search is a stack.'
    }
  ]
};
