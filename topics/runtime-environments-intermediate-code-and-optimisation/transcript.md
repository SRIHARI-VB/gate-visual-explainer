# Runtime Environments, Intermediate Code and Optimisation — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/runtime-environments-intermediate-code-and-optimisation/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. An activation record is one call, written down

*0:00 – 0:30 · objective: Name every field of an activation record, compute its size and offsets, and tell the control link from the access link.*

**0:00–0:07** — When a procedure is called, the machine sets aside one block of memory for that single execution. It is called an activation record, or a stack frame. Everything the call needs lives there: where to return, who called, the parameters, the locals and the temporaries. Two calls to the same procedure get two separate records.

> Caption: Every call gets its own record on the stack, pushed on entry and popped on return.

Exam-trap caption mode adds: *A frame is per activation, not per procedure. Reading "the activation record of f" as if there were only one is the first error in most of these questions.*

**0:07–0:15** — Here is one layout, with four-byte words. Three parameters take twelve bytes. The return address takes four. Two links take four each. The return value takes four. Two locals take eight, and two temporaries take eight. The frame is forty-four bytes, and that is simply the sum of its parts.

> Caption: Nine fields, forty-four bytes: three parameters, the return address, two links, the return value, two locals, two temporaries.

Exam-trap caption mode adds: *The size of a frame is not a fixed number. It depends on the word size, the number of parameters, the number of locals and the number of temporaries the code generator needs.*

**0:15–0:22** — Two pointers, two different jobs. The control link points at the caller, and the chain of control links is the history of calls. The access link points at the procedure that encloses this one in the source text, and that chain is the nesting you can see by reading the program. C has no nested functions, so in C the access link is unnecessary.

> Caption: The control link points at the caller; the access link points at the lexically enclosing procedure.

Exam-trap caption mode adds: *Swapping the two is the standard mistake. Control link equals dynamic equals caller. Access link equals static equals enclosing scope.*

**0:22–0:30** — The frame pointer is a register that holds one address inside the frame, and every field is reached as an offset from it. Above the pointer are the caller-pushed parameters and the return address. Below it are the links, the return value, the locals and the temporaries. Nine fields, nine distinct offsets, forty-four bytes.

> Caption: Offsets are measured from the frame pointer, and every field starts at its own offset.

Exam-trap caption mode adds: *A question that gives field sizes and asks for a frame size wants the sum, not the largest field, and not the sum plus one word unless a padding rule is stated.*

## Scene 2. Recursion: one record per call, popped in reverse

*0:30 – 1:00 · objective: Trace fact of 3 on the stack, and read the call order as a preorder and the return order as a postorder traversal of the activation tree.*

**0:30–0:37** — Calling fact of three pushes a frame for fact of three. That call calls fact of two, which pushes another frame, and so on down to fact of zero. At the deepest point there are five frames: main, and four calls of fact. Each one has its own n, holding three, two, one and zero.

> Caption: fact of three pushes four fact frames above main, each with its own copy of n.

Exam-trap caption mode adds: *Recursion does not need a heap. It needs a stack, because the records are freed in the reverse of the order they were created.*

**0:37–0:45** — Draw one node for each activation and join each callee to its caller. A node is visited when the procedure is entered, and a parent is always entered before its children. So the order of calls is a preorder traversal of that tree. Here it is main, then three, two, one, zero.

> Caption: The order of calls is a preorder traversal of the activation tree; that is GATE 2021 Set 1.

Exam-trap caption mode adds: *The tree has one node per call, not one node per procedure. Four calls of fact give four nodes.*

**0:45–0:52** — A procedure cannot return before the calls it made have returned, so the returns visit the tree from the bottom up: a postorder traversal. Zero returns one. One returns one times one. Two returns two times one. Three returns three times two, which is six, and that matches the product computed in a loop.

> Caption: The order of returns is a postorder traversal, and the values come back as one, one, two, six.

Exam-trap caption mode adds: *Do not read the return values in the order they are printed on the way down. The multiplications happen on the way back up.*

**0:52–1:00** — The frame for fact of three cannot be thrown away while fact of two is running, because it still needs its own n to finish the multiplication. So frames are released in the reverse of the order they were created. That is why recursion forces dynamic allocation on a stack, and why giving each procedure one fixed slot makes recursion impossible.

> Caption: A frame is freed only after the call it is waiting on returns, so the stack is a stack.

Exam-trap caption mode adds: *"Dynamic allocation" here means on the run-time stack, not on the heap. A stack is enough for recursion; a heap is not required.*

## Scene 3. Static and dynamic scoping: two links, two answers

*1:00 – 1:30 · objective: Resolve a free name through the access link under static scoping and through the control link under dynamic scoping, and get both printed values right.*

**1:00–1:07** — Here is the program from the paper. There is a global a equal to three. Inside m there is a parameter y and a local a that starts at one and becomes y minus a. Then m calls n, passing its own local a. Inside n there is no declaration of a at all, so the whole question is which a n means.

> Caption: The 2016 program: a global a, a local a inside m, and n reading an a it never declares.

Exam-trap caption mode adds: *The assignment a equals one inside m declares a new local. It does not update the global, and that single fact decides the whole trace.*

**1:07–1:15** — Under static scoping, a name means whatever it means where the procedure is written. n is written at the top level, so its a is the global a, which is three. x is two, and two times three is six. Because the parameter was passed by reference, that write lands in the frame of m too, so both prints show six.

> Caption: Static scoping follows the access link to the global a, which is three, so x becomes six and both prints show six.

Exam-trap caption mode adds: *The value printed inside n is not the value of the caller's a. It is the value of x after the multiplication, which happens to be the same cell.*

**1:15–1:22** — Under dynamic scoping, a name is looked up in the frames that are actually active, newest first. The newest frame that has an a is m, where a is two. So x becomes two times two, which is four. That write goes into m as well, so m prints four. The answer is four and four.

> Caption: Dynamic scoping follows the control link to the a in m, which is two, so x becomes four and both prints show four.

Exam-trap caption mode adds: *The tempting answer six and two comes from resolving the name dynamically but forgetting that the reference parameter made the two cells one.*

**1:22–1:30** — Same program, same parameters, two rules. Static scoping gives six and six. Dynamic scoping gives four and four. The pair six and two belongs to no rule at all: it is what you get if you change the lookup and forget the aliasing.

> Caption: One program, two rules, two answers: static gives six and six, dynamic gives four and four.

Exam-trap caption mode adds: *C, Java, Python and JavaScript all use static scoping. Dynamic scoping appears in this paper only because the question says to assume it.*

## Scene 4. Parameter passing decides what the callee can change

*1:30 – 2:00 · objective: Simulate call by value, by reference and by value-result, and know which one lets a swap function work.*

**1:30–1:37** — Call by value copies the value into the callee's frame. So a swap procedure receives two copies, swaps its own copies, and throws them away on return. The caller still has one and two. The procedure looks correct and does nothing.

> Caption: Call by value copies the argument, so the callee can change only its own copy.

Exam-trap caption mode adds: *C passes everything by value. To get a reference effect in C you pass a pointer, which is still a value that happens to be an address.*

**1:37–1:45** — Call by reference puts the address of the caller's variable in the frame, so the parameter and the argument are the same cell seen through two names. Now the swap works: two and one. And this is exactly why the scoping question has two prints that agree instead of differing.

> Caption: Call by reference copies the address, so the parameter and the argument are one cell.

Exam-trap caption mode adds: *A reference parameter is an alias. Two names for one cell means a write through either name is visible through the other, and that is the whole of aliasing.*

**1:45–1:52** — Value-result copies the argument in at entry and copies the result back at exit. For a swap that is indistinguishable from reference. It separates when one variable is passed twice: with a reference the two names are one cell, and with value-result the two copies are written back one after the other, so one of them is lost.

> Caption: Call by value-result copies in and copies back at return, so it differs from reference when two parameters alias.

Exam-trap caption mode adds: *If a question says value-result and passes the same variable to two parameters, the answer depends on the order of the copy-backs, which is usually stated.*

**1:52–2:00** — So ask two things. Which mechanism is it: value, reference, or value-result. And is any single variable passed to two different parameters, which is where the mechanisms stop agreeing. Those two questions settle every parameter-passing question in this paper.

> Caption: Two questions decide every parameter question: which mechanism, and is any argument passed twice.

Exam-trap caption mode adds: *The word "reference" in a C question means a pointer. Do not assume C has reference parameters; it does not.*

## Scene 5. Intermediate code: one operator per statement

*2:00 – 2:30 · objective: Turn an expression into three-address code, then write the same statements as quadruples and as triples.*

**2:00–2:07** — Take the expression a plus b, times c minus d. Every operator becomes its own statement, and every intermediate value gets a name. So t1 is a plus b, t2 is c minus d, t3 is t1 times t2, and x is t3. Four statements, one operator each.

> Caption: One operator per statement: the tree for a plus b times c minus d becomes four statements.

Exam-trap caption mode adds: *Three-address code is not the same as machine code. The number of temporaries is unlimited, which is exactly what register allocation later has to fix.*

**2:07–2:15** — There are two ways to write the same statements down. A quadruple names the result: operator, operand, operand, result. A triple drops the name and refers to the result by its position in the list, so position two is the multiplication of positions zero and one. Triples are shorter, and much harder to reorder.

> Caption: Quadruples give the result a name; triples give the result a position instead.

Exam-trap caption mode adds: *In a triple, an operand that is a number can be a constant or a position. Questions that mix the two conventions are decided by reading whether the table has a result column.*

**2:15–2:22** — Why bother with a middle language at all. Because it is independent of both the source language and the target machine. Write the optimiser once against the intermediate code, and reuse it when you retarget the compiler. Register allocation is not the reason, because registers belong to the target.

> Caption: Intermediate code is machine-independent, which is why the optimiser can be reused for another target.

Exam-trap caption mode adds: *Intermediate code does not make parsing easier and does not improve error messages. Both happen before it exists.*

**2:22–2:30** — The page checks the representation rather than trusting it. It evaluates the original tree and the four statements on the same inputs and requires the same answer. For two, three, five and one, both give twenty. That equality is the standard every optimisation is later held to.

> Caption: Four statements, four quadruples, and the same value as the tree for every input the model tries.

Exam-trap caption mode adds: *A representation change must preserve the value. If a rewrite changes the answer for any input, it is a bug, not an optimisation.*

## Scene 6. Basic blocks: find the leaders, count the blocks

*2:30 – 3:00 · objective: Apply the three leader rules to a seventeen-statement sequence and partition it into basic blocks.*

**2:30–2:37** — A basic block is a run of statements with one way in and one way out. Control enters at the top, runs straight through, and leaves at the bottom. No jump lands in the middle and none leaves from the middle. That is why a whole block can be analysed as one object.

> Caption: A basic block has exactly one entry, at its first statement, and one exit, at its last.

Exam-trap caption mode adds: *A block is maximal. If two adjacent statements satisfy the condition, they are in the same block, and splitting them would over-count.*

**2:37–2:45** — Three rules and nothing else. The first statement is a leader. Every jump target is a leader. Every statement right after a jump is a leader. Each leader starts a block, and the block runs until the next leader. Apply them in that order and the partition is forced.

> Caption: Three rules find the leaders: the first statement, every jump target, and every statement after a jump.

Exam-trap caption mode adds: *Forgetting the statement after a jump is the commonest slip. A jump out ends a block even if nothing jumps to the next line.*

**2:45–2:52** — Here is the sequence from the 2025 paper, from address 1001 to 1017. First statement leads. Then the three jump targets: 1003, 1002 and 1013. Then the two statements that follow a jump: 1010 and 1012. Six leaders, so six blocks, of sizes one, one, seven, two, one and five. They add to seventeen.

> Caption: The GATE 2025 sequence has six leaders, so it has six basic blocks, holding one, one, seven, two, one and five statements.

Exam-trap caption mode adds: *Count blocks, not leaders, only after you have checked whether two leaders are adjacent. Here they are not, so the two counts agree at six.*

**2:52–3:00** — The page does not just print six. It builds the partition and checks it: every one of the seventeen statements appears exactly once, each block is contiguous, and nothing jumps into the middle of a block. A count that survives those checks is a count you can defend.

> Caption: The partition is checked: every statement lies in exactly one block, and no block is entered in the middle.

Exam-trap caption mode adds: *A sequence with two adjacent leaders, such as a jump target immediately after a jump, gives one block of one statement. Do not merge it away.*

## Scene 7. Local optimisation: five passes that must preserve meaning

*3:00 – 3:30 · objective: Fold constants, propagate copies, delete dead assignments and reduce strength, then check the block still computes the same value.*

**3:00–3:07** — The first pass evaluates arithmetic on constants. Four times five becomes twenty. And once that is folded, the temporary holding it is never read, so a statement that looked useful is now dead. Folding is always safe, and it exposes work for the passes that follow.

> Caption: Fold the constants first: four times five becomes twenty, and that exposes a statement nobody uses.

Exam-trap caption mode adds: *Constant folding is not common subexpression elimination. Four times five becoming twenty appears in GATE 2014 Set 1 precisely as the false option.*

**3:07–3:15** — Next, propagate: if a variable must hold twenty at this point, write twenty. If a variable was just a copy of another, use the original. Then delete assignments to variables nobody reads again. Three passes, and every one of them is licensed by a fact the analysis provides, not by a guess.

> Caption: Propagate constants and copies, then delete every assignment whose variable is not live afterwards.

Exam-trap caption mode adds: *Dead code elimination needs liveness. Deleting an assignment because the variable is not read later in the block is wrong if a later block reads it.*

**3:15–3:22** — Strength reduction replaces an expensive operation with a cheap one. Two times i is i plus i, and a shift would do as well. On most machines that is cheaper than a multiply. It needs no analysis at all, and it is safe as long as the arithmetic does not overflow.

> Caption: Strength reduction trades a multiplication by a small constant for an addition: two times i becomes i plus i.

Exam-trap caption mode adds: *For signed integers with overflow, a shift and a multiply can differ. A question that says the arithmetic is exact is telling you which answer it wants.*

**3:22–3:30** — Nine statements in, four out. And the page checks the rewrite rather than trusting it: both versions are run on nine different inputs and must agree every time. If a pass broke one of them, the check under the canvas would go red. That is the standard every optimisation has to meet.

> Caption: Nine statements become four, and both versions are checked to compute the same value for every input tried.

Exam-trap caption mode adds: *Fewer statements is not automatically better. A pass that changes the answer is a bug, and a pass that adds more work than it removes is a pessimisation.*

## Scene 8. Common subexpressions: one node per distinct value

*3:30 – 4:00 · objective: Build the DAG of a basic block by value numbering, count its nodes, and see which statements vanish.*

**3:30–3:37** — Five statements. Number the distinct expressions. b plus c is the first. a plus one is the second. The third statement is b plus c again, so it is the first expression under a new name. The fourth is the second expression under a new name. The fifth adds the second expression to itself, and that is the third.

> Caption: Value numbering notices that b plus c is computed twice and a plus one is computed twice.

Exam-trap caption mode adds: *The numbering must use the current value of each variable. If an operand was redefined, the expression is a different one.*

**3:37–3:45** — A DAG has leaves for the values that come in, and one interior node per distinct operator applied to two nodes. When a statement recomputes an expression that already has a node, nothing new is built: the new variable just joins the label on that node. That reuse is common subexpression elimination, done locally.

> Caption: The DAG reuses one node per distinct expression, and a second definition becomes a second label on the same node.

Exam-trap caption mode adds: *A leaf is created for each distinct initial value and each distinct constant. Two uses of the constant one share one leaf.*

**3:45–3:52** — Count the nodes. Three leaves: b, c and the constant one. Three operators: b plus c, then plus one, then the sum added to itself. Six nodes. That is the number the paper asks for, and it is neither the statement count nor the variable count.

> Caption: Five statements give a DAG of six nodes: three leaves for b, c and one, and three operator nodes.

Exam-trap caption mode adds: *The constant one appears twice in the statements and is one leaf. Counting it twice gives seven and loses the mark.*

**3:52–4:00** — Two statements vanish: the ones that recomputed an expression already in the DAG. And the page checks the DAG against the original: same final value for several inputs, and a node count that equals leaves plus distinct operators. A picture of a DAG is not evidence; those two checks are.

> Caption: Two statements disappear, and the model checks that the DAG computes the same final value as the original code.

Exam-trap caption mode adds: *A DAG is a picture of the block, not a proof of correctness. The value check is what makes the picture trustworthy.*

## Scene 9. Liveness: a backward analysis that reaches a fixed point

*4:00 – 4:30 · objective: Write the use and def sets, iterate the two liveness equations from empty sets, and read the register count off the largest live set.*

**4:00–4:07** — A variable is live at a point if its value may still be needed. Three conditions: some later statement uses it, some path from here reaches that statement, and nothing on that path reassigns it first. If all three hold, keep the value. One path is enough, so where paths meet, we take the union.

> Caption: A variable is live at a point when some path from there reaches a use without redefining it first.

Exam-trap caption mode adds: *Liveness is a may analysis and uses union. Available expressions is a must analysis and uses intersection. Mixing them up is the most expensive error in this topic.*

**4:07–4:15** — Two equations. Live on entry means used here, plus whatever was live on exit that this statement does not redefine. Live on exit means live on entry to any successor, all of them unioned together. Since exit depends on the successors, the information flows from the end back towards the start. That is why it is called backward.

> Caption: The two equations run backwards: IN is use union the difference of OUT and def, and OUT is the union of the successors' IN.

Exam-trap caption mode adds: *Subtracting def from IN instead of from OUT is a sign that the direction was misread. def removes what the statement itself kills, on the way out.*

**4:15–4:22** — The flow graph has a back edge, so one pass is not enough. Start with every set empty and iterate. The first round gets most of it, the second round pushes the loop-carried variables round the back edge, and the third changes nothing. Then verify: plug the answer back into the equations and confirm nothing moves.

> Caption: Starting from empty sets, two rounds reach a fixed point; a third round changes nothing.

Exam-trap caption mode adds: *Stopping after one backward pass gives a solution that satisfies no equation at the loop header. Always iterate until a round changes nothing.*

**4:22–4:30** — The live sets hold at most two variables at any point. Two variables live together cannot share a register, so join them in an interference graph. Here a interferes with c and b interferes with c, and a never meets b. Two colours do it, so two registers. The largest live set and the number of colours agree.

> Caption: The largest live set holds two variables, so two registers suffice, and the interference graph needs two colours.

Exam-trap caption mode adds: *The number of registers needed is the size of the largest live set, not the number of variables in the program. Three variables, two registers.*

## Scene 10. The mirror image, and the checklist

*4:30 – 5:00 · objective: Contrast available expressions with liveness on direction, meet operator and boundary, then carry one checklist across the whole topic.*

**4:30–4:37** — Available expressions asks a different question with the same machinery. An expression is available if every path to this point computed it and nothing has changed its operands since. Every path, so at a join we intersect. It runs forwards, from the entry towards the exit, which is the exact mirror of liveness.

> Caption: Available expressions is the mirror image: it runs forwards and intersects at a join.

Exam-trap caption mode adds: *Using union here claims an expression is available when only one path computed it, and that is how a wrong common subexpression elimination is produced.*

**4:37–4:45** — Look at the example. The first block computes a plus b. Then a branch, and one arm reassigns a before the paths meet again. Every path did compute a plus b, but one path destroyed it. The intersection drops it, so it is not available and must be recomputed. The union keeps it, and that is the wrong answer.

> Caption: Union at the join would say a plus b is available, although one path reassigned a.

Exam-trap caption mode adds: *Redefining either operand kills the expression. A question that redefines a and still calls a plus b available is testing exactly this.*

**4:45–4:52** — Four questions classify any analysis. Which way does the information flow? Union or intersection where paths meet? What is the boundary value? And what does a statement kill? Answer those four and you have written the equations, whatever the analysis is called.

> Caption: Four questions classify any data-flow analysis: direction, meet, boundary, and what is killed.

Exam-trap caption mode adds: *The boundary for available expressions is the universal set at the exit, not the empty set. Getting it backwards makes every expression look available at the end of the program.*

**4:52–5:00** — One checklist. Records: name the fields and follow the right link. Blocks: three leader rules. DAG: leaves plus distinct operators. Analysis: use and def, iterate to a fixed point, and take the largest live set as the register count. Four procedures, and they cover every question this section has asked for three decades.

> Caption: One checklist for the whole topic: leaders, DAG nodes, live sets, register count.

Exam-trap caption mode adds: *Do not memorise answers. Memorise the four procedures, because the numbers change every year and the procedures do not.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
