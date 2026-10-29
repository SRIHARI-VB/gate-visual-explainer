# Local Optimisation and Basic Blocks: Leaders, DAGs and the Six Safe Rewrites — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/local-optimisation-and-basic-blocks/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 30 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Where local optimisation sits

*0:00 – 0:30 · objective: Place local optimisation between intermediate code generation and global analysis, and say what a single basic block can and cannot decide.*

**0:00–0:10** — Local optimisation is the part of a compiler that improves code one basic block at a time, with no branch inside the block it is looking at.

> Caption: Local optimisation looks at one basic block at a time.

Exam-trap caption mode adds: *Local does not mean small. A block can be hundreds of instructions long. It means single-entry, single-exit, so no branch inside it.*

**0:10–0:20** — Because control enters once and leaves once, a single top-to-bottom scan knows every value the block computes.

> Caption: Inside a block there is no branch, so one scan knows every value.

Exam-trap caption mode adds: *The live-out set is not computed inside the block. It comes from the successors, which is why even a local pass takes one fact from elsewhere.*

**0:20–0:30** — Everything in the left column is decidable from the block alone. Everything in the right column needs other blocks, and that is the next lesson.

> Caption: Fold, propagate, reuse, simplify, cheapen, delete — all decidable here.

Exam-trap caption mode adds: *A question that says "in the following basic block" is telling you which column you are in. Do not run a global analysis to answer it.*

## Scene 2. Three rules find every leader

*0:30 – 1:00 · objective: Apply the three leader rules to a nine-instruction program and cut it into blocks with no choices left to make.*

**0:30–0:40** — Three rules find every leader. The first instruction. The target of any jump. The instruction printed immediately after any jump.

> Caption: A leader is the first instruction, a jump target, or what follows a jump.

Exam-trap caption mode adds: *Rule three applies after an unconditional jump as well as a conditional one. An unconditional jump still ends a block.*

**0:40–0:50** — On this nine-instruction program the leaders are one, three, five, six and seven. Instruction three is a leader because line seven jumps to it.

> Caption: Nine instructions, five leaders, five blocks.

Exam-trap caption mode adds: *The instruction after a jump and the target of a jump are different instructions and both are leaders. Learners often mark only the target.*

**0:50–1:00** — That is the definition, and the word maximal is what removes every choice: the rules give the finest partition that has one entry and one exit.

> Caption: A block is maximal: no jump lands inside it and it exits only at the end.

Exam-trap caption mode adds: *The definition is a property of the partition, not a procedure. The three rules are the procedure that produces it, and they agree with the definition.*

## Scene 3. The 2025 paper: count the blocks

*1:00 – 1:30 · objective: Run the leader algorithm on the seventeen-instruction GATE CSE 2025 Set 1 Q52 program, get six blocks, and build its control-flow graph.*

**1:00–1:10** — Here is the program from a GATE paper: seventeen numbered instructions with three conditional jumps, two of them closing a loop and one closing an inner loop.

> Caption: Seventeen instructions, three jumps, and a nested loop.

Exam-trap caption mode adds: *Reading the addresses as if they were line numbers is safe here, because they are printed in order. Do not assume that in general.*

**1:10–1:20** — Rule one marks 1001. Rule two marks the three targets, 1003, 1002 and 1013. Rule three marks 1010 and 1012, which follow the first two jumps.

> Caption: Six leaders: 1001, 1002, 1003, 1010, 1012, 1013.

Exam-trap caption mode adds: *Forgetting 1012, which follows the jump at 1011, gives five blocks. That is the most common wrong answer to this question.*

**1:20–1:30** — B1 falls into B2, B2 into B3, and B3 jumps back to itself and forward to B4. B4 jumps to B2 and falls into B5, B5 into B6, and B6 jumps to itself.

> Caption: Eight edges between blocks, and two blocks that jump to themselves.

Exam-trap caption mode adds: *Whether the exit counts as a node is a convention. Questions about blocks do not depend on it; questions about nodes and edges do, so read the wording.*

## Scene 4. The 2024 paper: blocks and the largest block

*1:30 – 2:00 · objective: Get seven blocks and a largest block of six instructions on the GATE CSE 2024 Set 1 Q39 program, including the backward jump target that is easy to miss.*

**1:30–1:40** — This is the 2024 question: fifteen labelled instructions, with jumps at L9, L12 and L14.

> Caption: Fifteen instructions, three jumps, one nested loop.

Exam-trap caption mode adds: *L3 looks like a plain initialisation line in the middle of the prologue. It is a leader because a later line jumps back to it.*

**1:40–1:50** — The seven sizes add up to fifteen, which is every instruction exactly once, so no instruction was dropped and none was counted twice.

> Caption: Seven blocks, and their sizes are 2, 1, 6, 1, 2, 2, 1.

Exam-trap caption mode adds: *A block may hold a single instruction. Blocks of one are normal in loop code and are still blocks.*

**1:50–2:00** — The largest block is L4 to L9, which holds six instructions. Seven blocks and a largest of six is option D.

> Caption: Seven blocks, largest six instructions — option D.

Exam-trap caption mode adds: *The question asks two numbers. A candidate who computes the block count correctly and then guesses the largest size still loses the mark.*

## Scene 5. Value numbering makes the redundancy visible

*2:00 – 2:30 · objective: Turn a five-statement block into a DAG, share the two identical computations, and count nodes and edges under a stated convention.*

**2:00–2:10** — This block computes b plus c twice and u times two twice. Value numbering gives the second occurrence the first one's node instead of a new one.

> Caption: Five statements, but only three distinct computations.

Exam-trap caption mode adds: *If an operand was redefined in between, the node is not shared, even though the printed expression looks identical.*

**2:10–2:20** — The leaves are the initial values b and c plus the constant two. The operators are the addition, the multiplication and the second addition. Six nodes, six edges.

> Caption: Six nodes: three leaves and three operators; six edges.

Exam-trap caption mode adds: *A variable can label only one node at a time. Assigning to a variable moves its label, so the earlier node loses it — that is what dead-code elimination later reads.*

**2:20–2:30** — Questions about DAG size differ on whether leaves count and whether a constant is a leaf. State the convention you used; the structure is not in doubt.

> Caption: Read the convention: with leaves six nodes, without them three.

Exam-trap caption mode adds: *Do not answer a node-count question from memory of a previous paper. The convention differs between question setters, and the marks follow the question in front of you.*

## Scene 6. Six rewrites and their conditions

*2:30 – 3:00 · objective: Name the six local transformations, the condition each depends on, and watch the pipeline take a nine-statement block to four.*

**2:30–2:40** — Folding evaluates an operation whose operands are known. Constant propagation replaces a use by the constant. Copy propagation replaces a use of one variable by another.

> Caption: Folding, constant propagation and copy propagation move values, not operators.

Exam-trap caption mode adds: *Constant folding and constant propagation are not the same. Folding produces a constant; propagation carries an existing constant to a new place.*

**2:40–2:50** — Common subexpression elimination reuses a value already computed. An algebraic identity drops a neutral operand. Strength reduction replaces a costly operation by a cheaper one.

> Caption: Common subexpression, algebraic identity, strength reduction change the operator.

Exam-trap caption mode adds: *Common subexpression elimination is not constant folding. Folding evaluates arithmetic at compile time; elimination reuses a value the program already computed.*

**2:50–3:00** — Run on the block from the dead-code scene, the pipeline takes nine statements to four. Folding t4 to sixteen is what lets x become sixteen plus t1, which is what makes t4 and t6 dead.

> Caption: Nine statements become four, and the order of the passes matters.

Exam-trap caption mode adds: *Running the passes once is not enough in general. A dead-code sweep before folding leaves behind statements that only become dead after it.*

## Scene 7. Dead code and the side-effect guard

*3:00 – 3:30 · objective: Delete the assignments nobody reads, and see exactly which statements must survive a deletion sweep.*

**3:00–3:10** — Starting from the variables that are live when the block ends, walk the block backwards. An assignment whose target is not live can be removed, and its own operands stop being live.

> Caption: Scan backwards from the live-out set, and strike what nobody reads.

Exam-trap caption mode adds: *Removing a statement can make an earlier statement dead, so the walk must continue to the top of the block rather than stopping after the first deletion.*

**3:10–3:20** — z is assigned and never read. t2 holds a value that is already in t1. The copies t5 and t6 have had all their uses replaced. x and y are live out, so they stay.

> Caption: z is dead, t2 is dead, the copies are dead; x and y are live out.

Exam-trap caption mode adds: *A variable that is live at the end of the block is not dead, even if the block assigns it and never reads it. Live-out is the whole point of the scan.*

**3:20–3:30** — An assignment whose left side is a memory location, a volatile variable, or a call is not removable. The store is the effect, not a value to be read later.

> Caption: A store through a pointer is never dead, however unused it looks.

Exam-trap caption mode adds: *Deleting a store to an array element because the array is never read again is a real bug in real compilers, and a favourite exam counterexample.*

## Scene 8. Four rewrites that are not sound

*3:30 – 4:00 · objective: Show a witness for each of four tempting rewrites that change the answer: reassociation in floating point, division by shifting, multiplying by zero, and folding a division by zero.*

**3:30–3:40** — Grouping the additions differently gives a different double: one point six zero zero zero zero zero zero zero zero zero zero zero zero zero zero one against point six.

> Caption: Reassociation is false for floating point, and true for integers.

Exam-trap caption mode adds: *A compiler may only reassociate floating point under a flag that says the program does not care. The default in C is that it may not.*

**3:40–3:50** — For x equal to minus three, dividing by two gives minus one, because C truncates toward zero. Shifting right by one gives minus two, because an arithmetic shift rounds down.

> Caption: x / 2 is not x >> 1 when x is negative.

Exam-trap caption mode adds: *This is the standard example of a rewrite that is correct on the test data and wrong on the boundary. Unsigned types make the shift valid; signed ones do not.*

**3:50–4:00** — Multiplying NaN by zero gives NaN, not zero. And an integer division by a zero constant traps at run time, so folding it away removes a fault the program was going to have.

> Caption: x * 0 is not 0 when x is NaN, and 1 / 0 must not be folded.

Exam-trap caption mode adds: *A fold is a claim about the target machine, not about the mathematics. Where they disagree, the machine wins.*

## Scene 9. Where local stops

*4:00 – 4:30 · objective: See a fact computed in one block be invisible in the next, and count the GATE CSE 2021 Set 2 Q30 operations to show why the hoisting there is global.*

**4:00–4:10** — Here is the diamond. B1 computes a plus b. B2 computes the same expression. Nothing inside B2 mentions B1, so no local pass can see the redundancy.

> Caption: B1 computes a + b; B2 computes it again and cannot tell.

Exam-trap caption mode adds: *The tempting answer is that the compiler is being lazy. It is being correct: within one block there is no evidence that the value still holds.*

**4:10–4:20** — A global analysis carries the fact along the edges, so it can say the expression is available at the entry of B2 and not available after the join.

> Caption: Available expressions over the graph does see it, on one path.

Exam-trap caption mode adds: *Local and global are not competing techniques. A compiler runs local passes first because they are cheap, then global ones because they are stronger.*

**4:20–4:30** — The loop runs a hundred times, each turn costs three additions, and three additions happen before it: three hundred and three. The two dereferences are hoisted, so they happen twice.

> Caption: The 2021 count: three hundred and three additions, two dereferences.

Exam-trap caption mode adds: *The loop increment is an addition and counts. Forgetting i equals i plus two is the most common arithmetic slip in this question.*

## Scene 10. Five steps, three traps

*4:30 – 5:00 · objective: Fix the five-step procedure for any local-optimisation question and the three errors that cost marks.*

**4:30–4:40** — Mark the leaders. Cut at every leader and count the cuts. Add an edge for each jump and each fall-through. Apply the rewrite the question names. Re-count and re-check its condition.

> Caption: Five steps: leaders, cut, edges, rewrite, re-count.

Exam-trap caption mode adds: *A question about blocks never needs an optimisation, and a question about a rewrite never needs the edges. Doing both wastes time and invites errors.*

**4:40–4:50** — A backward jump target starts a block. The line after a jump is a leader even when the jump is unconditional. And whether the exit counts as a node changes node and edge counts, not block counts.

> Caption: Three traps: backward targets, the line after a jump, and the exit node.

Exam-trap caption mode adds: *A fourth trap is answering a two-number question with one number. Write both down before choosing an option.*

**4:50–5:00** — Local optimisation is the set of rewrites one block can justify on its own. Everything it cannot justify is a question about other blocks, and that is where data-flow analysis begins.

> Caption: Local is the half a block can justify; the rest is data-flow analysis.

Exam-trap caption mode adds: *Do not describe loop-invariant code motion as a local optimisation. It needs every block of the loop, so it is global.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
