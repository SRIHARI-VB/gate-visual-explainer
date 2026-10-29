/* ==========================================================================
   local-optimisation-and-basic-blocks — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs — never edited by hand.

   Every number quoted in a caption is produced by the model in lesson.js and
   printed on the canvas, so caption and canvas agree because both read the
   same computation.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'where-local',
      n: 1,
      title: 'Where local optimisation sits',
      start: 0, end: 30,
      objective: 'Place local optimisation between intermediate code generation and global analysis, and say what a single basic block can and cannot decide.'
    },
    {
      id: 'leaders',
      n: 2,
      title: 'Three rules find every leader',
      start: 30, end: 60,
      objective: 'Apply the three leader rules to a nine-instruction program and cut it into blocks with no choices left to make.'
    },
    {
      id: 'cfg-2025',
      n: 3,
      title: 'The 2025 paper: count the blocks',
      start: 60, end: 90,
      objective: 'Run the leader algorithm on the seventeen-instruction GATE CSE 2025 Set 1 Q52 program, get six blocks, and build its control-flow graph.'
    },
    {
      id: 'cfg-2024',
      n: 4,
      title: 'The 2024 paper: blocks and the largest block',
      start: 90, end: 120,
      objective: 'Get seven blocks and a largest block of six instructions on the GATE CSE 2024 Set 1 Q39 program, including the backward jump target that is easy to miss.'
    },
    {
      id: 'dag',
      n: 5,
      title: 'Value numbering makes the redundancy visible',
      start: 120, end: 150,
      objective: 'Turn a five-statement block into a DAG, share the two identical computations, and count nodes and edges under a stated convention.'
    },
    {
      id: 'rewrites',
      n: 6,
      title: 'Six rewrites and their conditions',
      start: 150, end: 180,
      objective: 'Name the six local transformations, the condition each depends on, and watch the pipeline take a nine-statement block to four.'
    },
    {
      id: 'dead-code',
      n: 7,
      title: 'Dead code and the side-effect guard',
      start: 180, end: 210,
      objective: 'Delete the assignments nobody reads, and see exactly which statements must survive a deletion sweep.'
    },
    {
      id: 'soundness',
      n: 8,
      title: 'Four rewrites that are not sound',
      start: 210, end: 240,
      objective: 'Show a witness for each of four tempting rewrites that change the answer: reassociation in floating point, division by shifting, multiplying by zero, and folding a division by zero.'
    },
    {
      id: 'where-local-stops',
      n: 9,
      title: 'Where local stops',
      start: 240, end: 270,
      objective: 'See a fact computed in one block be invisible in the next, and count the GATE CSE 2021 Set 2 Q30 operations to show why the hoisting there is global.'
    },
    {
      id: 'procedure',
      n: 10,
      title: 'Five steps, three traps',
      start: 270, end: 300,
      objective: 'Fix the five-step procedure for any local-optimisation question and the three errors that cost marks.'
    }
  ],

  events: [

    /* ---------------- scene 1: where local sits ---------------- */
    {
      id: 'e1a', scene: 'where-local', start: 0, end: 10,
      caption: 'Local optimisation looks at one basic block at a time.',
      narration: 'Local optimisation is the part of a compiler that improves code one basic block at a time, with no branch inside the block it is looking at.',
      detail: 'The pipeline is: front end, intermediate code, local optimisation, global optimisation, code generation. This page covers the third box. The fourth box is data-flow analysis, which the previous lesson builds.',
      keyword: 'one basic block',
      trap: 'Local does not mean small. A block can be hundreds of instructions long. It means single-entry, single-exit, so no branch inside it.'
    },
    {
      id: 'e1b', scene: 'where-local', start: 10, end: 20,
      caption: 'Inside a block there is no branch, so one scan knows every value.',
      narration: 'Because control enters once and leaves once, a single top-to-bottom scan knows every value the block computes.',
      detail: 'That is why a local pass needs no iteration and no fixed point. The only fact it needs from outside the block is which variables are live when the block ends.',
      keyword: 'one scan',
      trap: 'The live-out set is not computed inside the block. It comes from the successors, which is why even a local pass takes one fact from elsewhere.'
    },
    {
      id: 'e1c', scene: 'where-local', start: 20, end: 30,
      caption: 'Fold, propagate, reuse, simplify, cheapen, delete — all decidable here.',
      narration: 'Everything in the left column is decidable from the block alone. Everything in the right column needs other blocks, and that is the next lesson.',
      detail: 'Decidable locally: evaluate constants, reuse an earlier value, delete a store nobody reads, replace a costly operation, apply an identity. Not decidable locally: what another block computed, whether a value survives a branch, what a loop recomputes.',
      keyword: 'decidable',
      trap: 'A question that says "in the following basic block" is telling you which column you are in. Do not run a global analysis to answer it.'
    },

    /* ---------------- scene 2: the leader rules ---------------- */
    {
      id: 'e2a', scene: 'leaders', start: 30, end: 40,
      caption: 'A leader is the first instruction, a jump target, or what follows a jump.',
      narration: 'Three rules find every leader. The first instruction. The target of any jump. The instruction printed immediately after any jump.',
      detail: 'Rule one exists because the program starts somewhere. Rule two exists because control can arrive from elsewhere. Rule three exists because control may not arrive at all, and a block must not be entered in its middle.',
      keyword: 'Three rules',
      trap: 'Rule three applies after an unconditional jump as well as a conditional one. An unconditional jump still ends a block.'
    },
    {
      id: 'e2b', scene: 'leaders', start: 40, end: 50,
      caption: 'Nine instructions, five leaders, five blocks.',
      narration: 'On this nine-instruction program the leaders are one, three, five, six and seven. Instruction three is a leader because line seven jumps to it.',
      detail: 'So lines one and two are one block of two instructions, not part of a longer block. Instruction five is a leader because line four jumps away before it. Each block runs to the instruction before the next leader.',
      keyword: 'five leaders',
      trap: 'The instruction after a jump and the target of a jump are different instructions and both are leaders. Learners often mark only the target.'
    },
    {
      id: 'e2c', scene: 'leaders', start: 50, end: 60,
      caption: 'A block is maximal: no jump lands inside it and it exits only at the end.',
      narration: 'That is the definition, and the word maximal is what removes every choice: the rules give the finest partition that has one entry and one exit.',
      detail: 'A basic block is a maximal run of consecutive instructions with a single entry at the top and a single exit at the bottom. The number of leaders is the number of blocks, always.',
      keyword: 'maximal',
      trap: 'The definition is a property of the partition, not a procedure. The three rules are the procedure that produces it, and they agree with the definition.'
    },

    /* ---------------- scene 3: 2025 paper ---------------- */
    {
      id: 'e3a', scene: 'cfg-2025', start: 60, end: 70,
      caption: 'Seventeen instructions, three jumps, and a nested loop.',
      narration: 'Here is the program from a GATE paper: seventeen numbered instructions with three conditional jumps, two of them closing a loop and one closing an inner loop.',
      detail: 'The jumps are at 1009 to 1003, at 1011 to 1002, and at 1017 to 1013. Both loops jump backwards, which is what makes their targets leaders.',
      keyword: 'three jumps',
      trap: 'Reading the addresses as if they were line numbers is safe here, because they are printed in order. Do not assume that in general.'
    },
    {
      id: 'e3b', scene: 'cfg-2025', start: 70, end: 80,
      caption: 'Six leaders: 1001, 1002, 1003, 1010, 1012, 1013.',
      narration: 'Rule one marks 1001. Rule two marks the three targets, 1003, 1002 and 1013. Rule three marks 1010 and 1012, which follow the first two jumps.',
      detail: 'Nothing follows 1017, so rule three adds nothing there. That gives six leaders and therefore six blocks, which is the official answer to this question.',
      keyword: 'Six leaders',
      trap: 'Forgetting 1012, which follows the jump at 1011, gives five blocks. That is the most common wrong answer to this question.'
    },
    {
      id: 'e3c', scene: 'cfg-2025', start: 80, end: 90,
      caption: 'Eight edges between blocks, and two blocks that jump to themselves.',
      narration: 'B1 falls into B2, B2 into B3, and B3 jumps back to itself and forward to B4. B4 jumps to B2 and falls into B5, B5 into B6, and B6 jumps to itself.',
      detail: 'Eight edges between real blocks, plus one from B6 to the exit. The two self-loops appear because each loop-back jump targets the first instruction of the block that contains the jump.',
      keyword: 'Eight edges',
      trap: 'Whether the exit counts as a node is a convention. Questions about blocks do not depend on it; questions about nodes and edges do, so read the wording.'
    },

    /* ---------------- scene 4: 2024 paper ---------------- */
    {
      id: 'e4a', scene: 'cfg-2024', start: 90, end: 100,
      caption: 'Fifteen instructions, three jumps, one nested loop.',
      narration: 'This is the 2024 question: fifteen labelled instructions, with jumps at L9, L12 and L14.',
      detail: 'The jumps go to L11, L4 and L3. L3 is a backward jump target, reached from the outer loop at L14, and that is the leader most candidates miss.',
      keyword: 'Fifteen',
      trap: 'L3 looks like a plain initialisation line in the middle of the prologue. It is a leader because a later line jumps back to it.'
    },
    {
      id: 'e4b', scene: 'cfg-2024', start: 100, end: 110,
      caption: 'Seven blocks, and their sizes are 2, 1, 6, 1, 2, 2, 1.',
      narration: 'The seven sizes add up to fifteen, which is every instruction exactly once, so no instruction was dropped and none was counted twice.',
      detail: 'That sum is a free check on any block-count question: the block sizes must partition the program. If they do not, a leader was missed or invented.',
      keyword: 'sizes add up',
      trap: 'A block may hold a single instruction. Blocks of one are normal in loop code and are still blocks.'
    },
    {
      id: 'e4c', scene: 'cfg-2024', start: 110, end: 120,
      caption: 'Seven blocks, largest six instructions — option D.',
      narration: 'The largest block is L4 to L9, which holds six instructions. Seven blocks and a largest of six is option D.',
      detail: 'Counting only the forward jump targets gives six blocks and the option with six and six. The backward target L3 is what separates the two answers.',
      keyword: 'option D',
      trap: 'The question asks two numbers. A candidate who computes the block count correctly and then guesses the largest size still loses the mark.'
    },

    /* ---------------- scene 5: the DAG ---------------- */
    {
      id: 'e5a', scene: 'dag', start: 120, end: 130,
      caption: 'Five statements, but only three distinct computations.',
      narration: 'This block computes b plus c twice and u times two twice. Value numbering gives the second occurrence the first one\'s node instead of a new one.',
      detail: 'Same operator and same operand nodes means the same node. For a commutative operator the operands may be swapped, so b plus c and c plus b are one node.',
      keyword: 'three distinct',
      trap: 'If an operand was redefined in between, the node is not shared, even though the printed expression looks identical.'
    },
    {
      id: 'e5b', scene: 'dag', start: 130, end: 140,
      caption: 'Six nodes: three leaves and three operators; six edges.',
      narration: 'The leaves are the initial values b and c plus the constant two. The operators are the addition, the multiplication and the second addition. Six nodes, six edges.',
      detail: 'Each edge is one operand position. An operator node has two edges here because every operation in this block is binary. A copy would add no operator at all: it just attaches a second label to an existing node.',
      keyword: 'Six nodes',
      trap: 'A variable can label only one node at a time. Assigning to a variable moves its label, so the earlier node loses it — that is what dead-code elimination later reads.'
    },
    {
      id: 'e5c', scene: 'dag', start: 140, end: 150,
      caption: 'Read the convention: with leaves six nodes, without them three.',
      narration: 'Questions about DAG size differ on whether leaves count and whether a constant is a leaf. State the convention you used; the structure is not in doubt.',
      detail: 'The reading back of the DAG is the optimised block: u and v become one computation, w and x become one, and y stays separate because addition and multiplication are different operators.',
      keyword: 'convention',
      trap: 'Do not answer a node-count question from memory of a previous paper. The convention differs between question setters, and the marks follow the question in front of you.'
    },

    /* ---------------- scene 6: the six rewrites ---------------- */
    {
      id: 'e6a', scene: 'rewrites', start: 150, end: 160,
      caption: 'Folding, constant propagation and copy propagation move values, not operators.',
      narration: 'Folding evaluates an operation whose operands are known. Constant propagation replaces a use by the constant. Copy propagation replaces a use of one variable by another.',
      detail: 'Each needs a condition: both operands constant, no reassignment in between, no reassignment of either name in between. Without the condition each of them is unsound.',
      keyword: 'Folding',
      trap: 'Constant folding and constant propagation are not the same. Folding produces a constant; propagation carries an existing constant to a new place.'
    },
    {
      id: 'e6b', scene: 'rewrites', start: 160, end: 170,
      caption: 'Common subexpression, algebraic identity, strength reduction change the operator.',
      narration: 'Common subexpression elimination reuses a value already computed. An algebraic identity drops a neutral operand. Strength reduction replaces a costly operation by a cheaper one.',
      detail: 'The condition for elimination is that no operand changed in between. The condition for an identity is that it holds for the type. The condition for strength reduction is that the cheaper form gives the identical result for every input.',
      keyword: 'reduction',
      trap: 'Common subexpression elimination is not constant folding. Folding evaluates arithmetic at compile time; elimination reuses a value the program already computed.'
    },
    {
      id: 'e6c', scene: 'rewrites', start: 170, end: 180,
      caption: 'Nine statements become four, and the order of the passes matters.',
      narration: 'Run on the block from the dead-code scene, the pipeline takes nine statements to four. Folding t4 to sixteen is what lets x become sixteen plus t1, which is what makes t4 and t6 dead.',
      detail: 'The passes are fold, simplify, propagate copies, value-number, delete dead code, repeated to a fixed point because one pass exposes another. The page runs four rounds and the check confirms the count stops changing.',
      keyword: 'Nine to four',
      trap: 'Running the passes once is not enough in general. A dead-code sweep before folding leaves behind statements that only become dead after it.'
    },

    /* ---------------- scene 7: dead code ---------------- */
    {
      id: 'e7a', scene: 'dead-code', start: 180, end: 190,
      caption: 'Scan backwards from the live-out set, and strike what nobody reads.',
      narration: 'Starting from the variables that are live when the block ends, walk the block backwards. An assignment whose target is not live can be removed, and its own operands stop being live.',
      detail: 'That backward walk is the whole of local dead-code elimination. It needs no fixed point because a block has no branches, so one pass in reverse order is enough.',
      keyword: 'backwards',
      trap: 'Removing a statement can make an earlier statement dead, so the walk must continue to the top of the block rather than stopping after the first deletion.'
    },
    {
      id: 'e7b', scene: 'dead-code', start: 190, end: 200,
      caption: 'z is dead, t2 is dead, the copies are dead; x and y are live out.',
      narration: 'z is assigned and never read. t2 holds a value that is already in t1. The copies t5 and t6 have had all their uses replaced. x and y are live out, so they stay.',
      detail: 'Each deletion is justified by one fact: the value is not read afterwards. Nothing about the arithmetic changed, so nothing about the result can change.',
      keyword: 'dead',
      trap: 'A variable that is live at the end of the block is not dead, even if the block assigns it and never reads it. Live-out is the whole point of the scan.'
    },
    {
      id: 'e7c', scene: 'dead-code', start: 200, end: 210,
      caption: 'A store through a pointer is never dead, however unused it looks.',
      narration: 'An assignment whose left side is a memory location, a volatile variable, or a call is not removable. The store is the effect, not a value to be read later.',
      detail: 'The guard in this page is a flag on the statement. The check confirms that a store through a pointer survives a sweep that removes its neighbouring arithmetic.',
      keyword: 'side effect',
      trap: 'Deleting a store to an array element because the array is never read again is a real bug in real compilers, and a favourite exam counterexample.'
    },

    /* ---------------- scene 8: soundness ---------------- */
    {
      id: 'e8a', scene: 'soundness', start: 210, end: 220,
      caption: 'Reassociation is false for floating point, and true for integers.',
      narration: 'Grouping the additions differently gives a different double: one point six zero zero zero zero zero zero zero zero zero zero zero zero zero zero one against point six.',
      detail: 'The witness is a equal to zero point one, b equal to zero point two, c equal to zero point three. Integer addition is associative; double addition is not, because each intermediate result is rounded.',
      keyword: 'not associative',
      trap: 'A compiler may only reassociate floating point under a flag that says the program does not care. The default in C is that it may not.'
    },
    {
      id: 'e8b', scene: 'soundness', start: 220, end: 230,
      caption: 'x / 2 is not x >> 1 when x is negative.',
      narration: 'For x equal to minus three, dividing by two gives minus one, because C truncates toward zero. Shifting right by one gives minus two, because an arithmetic shift rounds down.',
      detail: 'The two agree for every non-negative x, which is why the rewrite survives in code that only ever sees positive values. It is not a valid rewrite in general.',
      keyword: 'minus three',
      trap: 'This is the standard example of a rewrite that is correct on the test data and wrong on the boundary. Unsigned types make the shift valid; signed ones do not.'
    },
    {
      id: 'e8c', scene: 'soundness', start: 230, end: 240,
      caption: 'x * 0 is not 0 when x is NaN, and 1 / 0 must not be folded.',
      narration: 'Multiplying NaN by zero gives NaN, not zero. And an integer division by a zero constant traps at run time, so folding it away removes a fault the program was going to have.',
      detail: 'Two more, from the machine: folding in 32 bits wraps, so the largest integer plus one becomes the most negative one; and reusing an earlier a[i] after a[j] equals five is wrong when i equals j.',
      keyword: 'NaN',
      trap: 'A fold is a claim about the target machine, not about the mathematics. Where they disagree, the machine wins.'
    },

    /* ---------------- scene 9: where local stops ---------------- */
    {
      id: 'e9a', scene: 'where-local-stops', start: 240, end: 250,
      caption: 'B1 computes a + b; B2 computes it again and cannot tell.',
      narration: 'Here is the diamond. B1 computes a plus b. B2 computes the same expression. Nothing inside B2 mentions B1, so no local pass can see the redundancy.',
      detail: 'That is not a limitation of a particular implementation: the fact lives in another block, so a block-local argument cannot reach it. After the join the expression is unavailable anyway, because B3 overwrote a.',
      keyword: 'cannot tell',
      trap: 'The tempting answer is that the compiler is being lazy. It is being correct: within one block there is no evidence that the value still holds.'
    },
    {
      id: 'e9b', scene: 'where-local-stops', start: 250, end: 260,
      caption: 'Available expressions over the graph does see it, on one path.',
      narration: 'A global analysis carries the fact along the edges, so it can say the expression is available at the entry of B2 and not available after the join.',
      detail: 'That is data-flow analysis, and the previous lesson builds it. The point here is the boundary: the same rewrite becomes possible once you are allowed to look at more than one block.',
      keyword: 'available',
      trap: 'Local and global are not competing techniques. A compiler runs local passes first because they are cheap, then global ones because they are stronger.'
    },
    {
      id: 'e9c', scene: 'where-local-stops', start: 260, end: 270,
      caption: 'The 2021 count: three hundred and three additions, two dereferences.',
      narration: 'The loop runs a hundred times, each turn costs three additions, and three additions happen before it: three hundred and three. The two dereferences are hoisted, so they happen twice.',
      detail: 'That hoisting is not local. It needs the fact that x, y and both fields are unchanged by every block in the loop, which is a statement about the whole loop at once.',
      keyword: 'three hundred and three',
      trap: 'The loop increment is an addition and counts. Forgetting i equals i plus two is the most common arithmetic slip in this question.'
    },

    /* ---------------- scene 10: procedure ---------------- */
    {
      id: 'e10a', scene: 'procedure', start: 270, end: 280,
      caption: 'Five steps: leaders, cut, edges, rewrite, re-count.',
      narration: 'Mark the leaders. Cut at every leader and count the cuts. Add an edge for each jump and each fall-through. Apply the rewrite the question names. Re-count and re-check its condition.',
      detail: 'Steps one to three are the same for every question of this shape. Only step four changes with the topic, and step five is where marks are lost.',
      keyword: 'Five steps',
      trap: 'A question about blocks never needs an optimisation, and a question about a rewrite never needs the edges. Doing both wastes time and invites errors.'
    },
    {
      id: 'e10b', scene: 'procedure', start: 280, end: 290,
      caption: 'Three traps: backward targets, the line after a jump, and the exit node.',
      narration: 'A backward jump target starts a block. The line after a jump is a leader even when the jump is unconditional. And whether the exit counts as a node changes node and edge counts, not block counts.',
      detail: 'The first two traps each cost a whole mark on a real paper: 2024 needs the backward target, and 2025 needs both lines that follow the two loop jumps.',
      keyword: 'Three traps',
      trap: 'A fourth trap is answering a two-number question with one number. Write both down before choosing an option.'
    },
    {
      id: 'e10c', scene: 'procedure', start: 290, end: 300,
      caption: 'Local is the half a block can justify; the rest is data-flow analysis.',
      narration: 'Local optimisation is the set of rewrites one block can justify on its own. Everything it cannot justify is a question about other blocks, and that is where data-flow analysis begins.',
      detail: 'Fold, propagate, reuse, simplify, cheapen, delete: six rewrites, six conditions. The next lesson in this subject is the global half, which the data-flow framework page already builds.',
      keyword: 'the rest',
      trap: 'Do not describe loop-invariant code motion as a local optimisation. It needs every block of the loop, so it is global.'
    }
  ]
};
