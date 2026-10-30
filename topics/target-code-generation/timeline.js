/* ==========================================================================
   target-code-generation — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   captions.vtt, captions.srt and transcript.md are generated from this file by
   tools/gen-captions.mjs — never edited by hand.

   Every number quoted in a caption is computed by the model in lesson.js and
   printed on the canvas: the block of 5 statements with 6 leaf occurrences
   that becomes a DAG of 4 operator nodes and 4 leaves, taking 11 instructions
   as a tree and 8 from the DAG; the 8-instruction load-store selection that
   peaks at 3 registers against the 12-instruction accumulator selection that
   needs 1; the Sethi-Ullman label 3 of (a-1)*(((b+c)/3)+d) against the exact
   search's 2 when the constants are immediates (GATE CSE 2017 Set 1 Q52 keys
   2); the liveness of the GATE CSE 2013 Q49 block, whose largest live set has
   4 variables; its interference graph of 6 nodes and 10 edges with degrees
   5, 1, 3, 4, 4, 3; its chromatic number 4, reached by a valid greedy
   colouring and proved by the 4-clique {a, c, d, e}; the cheapest spill set
   {d} at cost 3 when only three registers exist; and the peephole pass that
   removes 5 of 11 instructions, one per rule, agreeing with the original on
   all 25 input pairs.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'why', n: 1,
      title: 'What the back end has to decide',
      start: 0, end: 30,
      objective: 'See the three jobs between intermediate code and machine code — choosing instructions, choosing registers, and cleaning up locally — and the four counts a question can ask for.'
    },
    {
      id: 'dag', n: 2,
      title: 'One node per distinct computation',
      start: 30, end: 60,
      objective: 'Turn a basic block into a DAG, see repeated computations merge into one node, and count what the merge saves: 4 operator nodes and 4 loads instead of 5 and 6.'
    },
    {
      id: 'cost', n: 3,
      title: 'Two machines, two prices',
      start: 60, end: 90,
      objective: 'Cover one DAG with two instruction sets and count both: 8 instructions at 3 registers, or 12 instructions at 1 register, with both programs executed to confirm they agree.'
    },
    {
      id: 'regs', n: 4,
      title: 'How many registers an expression needs',
      start: 90, end: 120,
      objective: 'Apply the Sethi-Ullman numbering to (a-1)*(((b+c)/3)+d), get 3, and see the exhaustive search return 2 — the number GATE CSE 2017 Set 1 Q52 keys — because the constants are immediates.'
    },
    {
      id: 'live', n: 5,
      title: 'Liveness: what is still needed',
      start: 120, end: 150,
      objective: 'Run liveness backwards over the GATE CSE 2013 Q49 block, write the live set at every statement, and find that the largest one holds 4 variables.'
    },
    {
      id: 'interf', n: 6,
      title: 'The interference graph',
      start: 150, end: 180,
      objective: 'Build the graph from the live sets — one node per variable, one edge per pair alive together — and check every edge against a witness program point.'
    },
    {
      id: 'colour', n: 7,
      title: 'Colouring is allocating',
      start: 180, end: 210,
      objective: 'Colour the interference graph, meet the lower bound given by its largest clique, and conclude that 4 registers is optimal rather than merely what one heuristic found.'
    },
    {
      id: 'assign', n: 8,
      title: 'Registers, spills and the 2013 answer',
      start: 210, end: 240,
      objective: 'Turn four colours into four registers, then ask what three registers cost: the cheapest spill set and its reload count, against the answer GATE CSE 2013 Q49 keys.'
    },
    {
      id: 'peep', n: 9,
      title: 'Peephole optimisation',
      start: 240, end: 270,
      objective: 'Slide a small window over the generated code, apply five local rules, remove 5 of 11 instructions, and check the two programs agree on every input tried.'
    },
    {
      id: 'exam', n: 10,
      title: 'How the question is asked',
      start: 270, end: 300,
      objective: 'Recognise the four shapes these questions take and apply the two checks — registers or variables, and whether code motion is allowed — before doing any arithmetic.'
    }
  ],

  events: [
    /* ---------- scene 1: why ---------- */
    {
      id: 's1a', start: 0, end: 7.5, scene: 'why',
      caption: 'Intermediate code is machine-independent. Machine code is not.',
      detail: 'The intermediate form names no register and no opcode. Everything the back end decides — which instruction, which register, which cleanup — happens after that form exists, and each decision is a separate pass with its own cost.',
      narration: 'The intermediate form names no register. The back end supplies them.',
      keyword: 'machine-independent'
    },
    {
      id: 's1b', start: 7.5, end: 15, scene: 'why',
      caption: 'Three jobs: select instructions, allocate registers, clean up locally.',
      detail: 'Instruction selection walks the DAG and picks machine instructions. Register allocation assigns the values it produces to physical registers. Peephole optimisation slides a small window over the result and removes what the pattern says is redundant. Each job is counted separately, which is why a question can ask for instructions or for registers.',
      narration: 'Three jobs: select, allocate, clean up.',
      keyword: 'three jobs',
      trap: 'A question that asks for instructions is not asking for registers. Read which count it wants before you compute either.'
    },
    {
      id: 's1c', start: 15, end: 22.5, scene: 'why',
      caption: 'This page computes four counts: instructions, registers, live variables, colours.',
      detail: 'The same block of code answers all four: 8 instructions on a load-store machine against 12 on an accumulator machine, 3 registers against 1, 4 variables alive at the worst point of the 2013 block, and 4 colours for its interference graph. Every one of those numbers is computed on this page, not quoted.',
      narration: 'Four counts, one block, every number computed here.',
      keyword: 'four counts'
    },
    {
      id: 's1d', start: 22.5, end: 30, scene: 'why',
      caption: 'Syllabus position: Section 7 names the inputs, not these three jobs by name.',
      detail: 'Section 7 of the GATE 2027 CS syllabus names lexical analysis, parsing, syntax-directed translation, runtime environments, intermediate code generation, local optimisation, and the three data-flow analyses. Code generation is not named, so this lesson is class C; but liveness analysis and local optimisation are named, and register assignment and peephole optimisation are what those two clauses are for. Two verified questions sit exactly here, from 2013 and 2017.',
      narration: 'The clause names liveness and local optimisation. These are what they are for.',
      keyword: 'Section 7',
      trap: 'Do not call this a syllabus topic by name. It is the exam-facing consequence of two clauses that are named.'
    },

    /* ---------- scene 2: dag ---------- */
    {
      id: 's2a', start: 30, end: 37.5, scene: 'dag',
      caption: 'Five statements, but only four different computations.',
      detail: 'The block computes t1 = a*b, t2 = c*d, t3 = t1+t2, t4 = a*b and t5 = t4-t2. The fourth statement recomputes exactly what the first one computed, so a DAG gives both statements one node. The tree form keeps two.',
      narration: 'Five statements. Four different computations.',
      keyword: 'four computations'
    },
    {
      id: 's2b', start: 37.5, end: 45, scene: 'dag',
      caption: 'A DAG node is a value; an edge is a use. Shared nodes are shared values.',
      detail: 'Each leaf is a variable read, each internal node is one operator applied to two values, and an edge says the value below is used above. Because the two multiply statements produce the same operator on the same two leaves, they land on the same node and the second one adds nothing.',
      narration: 'One node per value. The repeat lands on the same node.',
      keyword: 'shared node'
    },
    {
      id: 's2c', start: 45, end: 52.5, scene: 'dag',
      caption: 'Six leaf occurrences become four loads; five operators become four.',
      detail: 'Counting occurrences in the statements gives 6 reads of a variable and 5 operators, which is 11 instructions on a machine that loads before it computes. Counting the DAG gives 4 loads and 4 operators, which is 8. The saving is exactly the repeated multiply and its two operands.',
      narration: 'Eleven instructions become eight.',
      keyword: '11 to 8'
    },
    {
      id: 's2d', start: 52.5, end: 60, scene: 'dag',
      caption: 'The DAG is built from the block, so it can never disagree with it.',
      detail: 'The page constructs the DAG by looking up each operator and its two operands in a table, so two statements with the same operator and the same operands must share a node. The check re-walks the finished graph and confirms every node points only at nodes with smaller ids, which is what makes a postorder walk a valid instruction order.',
      narration: 'Built by lookup, so the sharing is a fact about the block.',
      keyword: 'built by lookup',
      trap: 'A DAG is not an optimisation you apply later. It is the block with its repeats merged, and it is only valid inside one basic block.'
    },

    /* ---------- scene 3: cost ---------- */
    {
      id: 's3a', start: 60, end: 67.5, scene: 'cost',
      caption: 'Same DAG, two machines: 8 instructions at 3 registers, or 12 at 1.',
      detail: 'A load-store machine keeps every operand in a register: 4 loads and 4 arithmetic instructions, peaking at 3 registers. An accumulator machine keeps one register and takes every operand from memory: 3 instructions per operator, 12 in all, one register.',
      narration: 'Eight instructions at three registers, or twelve at one.',
      keyword: '8 and 12'
    },
    {
      id: 's3b', start: 67.5, end: 75, scene: 'cost',
      caption: 'Selection is a covering problem: which instruction covers which nodes.',
      detail: 'Each machine instruction covers one node of the DAG together with some of the loads its operands need. A load-store instruction covers one node and no load; an accumulator instruction covers one node and one memory operand. The cheapest covering depends on the price list, and the price list is the machine.',
      narration: 'Each instruction covers part of the DAG. The machine sets the price.',
      keyword: 'covering'
    },
    {
      id: 's3c', start: 75, end: 82.5, scene: 'cost',
      caption: 'Both programs were executed: they agree on every input tried.',
      detail: 'The page runs both instruction lists on its own small machine. For a, b, c, d = 3, 5, 7, 2 both give t3 = 29 and t5 = 1; for 1, 0, -2, 6 both give t5 = 12. A selection that is shorter but computes something else is not an optimisation, and the execution is what rules that out here.',
      narration: 'Both were run. Both agree.',
      keyword: 'executed'
    },
    {
      id: 's3d', start: 82.5, end: 90, scene: 'cost',
      caption: 'Fewer instructions usually means more registers. That is the trade.',
      detail: 'The load-store code is 4 instructions shorter and needs 2 registers more. Nothing here says which is better: on a machine with registers to spare the first wins, and on a machine with one register the second is the only option. Questions that fix the machine remove the choice; questions that do not are asking you to notice it exists.',
      narration: 'Shorter code, more registers. The trade is the point.',
      keyword: 'the trade',
      trap: 'Never answer "minimum instructions" and "minimum registers" with the same covering. They pull in opposite directions.'
    },

    /* ---------- scene 4: regs ---------- */
    {
      id: 's4a', start: 90, end: 97.5, scene: 'regs',
      caption: '(a-1)*(((b+c)/3)+d): the numbering gives 3, the machine needs 2.',
      detail: 'The Sethi-Ullman numbering labels each leaf 1 and each internal node max of its children, plus one when the two labels are equal. On this tree that produces 3. An exhaustive search over every order in which the tree can be evaluated, with the constants allowed as immediates, produces 2 — which is the value GATE CSE 2017 Set 1 Q52 keys.',
      narration: 'The formula says three. The machine needs two.',
      keyword: '3 against 2'
    },
    {
      id: 's4b', start: 97.5, end: 105, scene: 'regs',
      caption: 'The formula charges each constant a register. The instruction set does not.',
      detail: 'Labelling the constant leaves 0 instead of 1 — because SUB R1, R1, #1 needs no register for the 1 — changes the root labels from 3 to 2, and the search agrees with the corrected formula exactly. The two constants in this expression are the whole difference.',
      narration: 'Label the constants zero and the formula gives two as well.',
      keyword: 'constants are free'
    },
    {
      id: 's4c', start: 105, end: 112.5, scene: 'regs',
      caption: 'Two registers, eight instructions, no spill — the 2017 answer.',
      detail: 'Load b and c, add, divide by the immediate 3, load d, add, load a, subtract the immediate 1, multiply. Two registers hold everything at every point. One register is impossible because the division needs both (b+c) and the immediate in play at once.',
      narration: 'Load, add, divide, add, subtract, multiply. Two registers.',
      keyword: 'eight instructions'
    },
    {
      id: 's4d', start: 112.5, end: 120, scene: 'regs',
      caption: 'The formula is exact when every leaf costs a register; the search is exact always.',
      detail: 'On trees with no constants the search returns the formula exactly — 4 for the balanced tree, 3 for the chain. On a tree with a constant it returns one less, and that is the machine, not a mistake. Quote the formula only after asking whether its assumption holds.',
      narration: 'The formula assumes a register per leaf. Check that assumption.',
      keyword: 'the assumption',
      trap: 'Sethi-Ullman is an upper bound on a machine with immediates. It is not the answer to a question that allows them.'
    },

    /* ---------- scene 5: live ---------- */
    {
      id: 's5a', start: 120, end: 127.5, scene: 'live',
      caption: 'A variable is live at a point if some path from there reads it first.',
      detail: 'Liveness is computed backwards: a variable is live on entry to a statement if the statement reads it, or if it is live on exit and the statement does not write it. The page iterates that rule over the control-flow graph until nothing changes, and records how many rounds it took.',
      narration: 'Live means read before overwritten, on some path from here.',
      keyword: 'live'
    },
    {
      id: 's5b', start: 127.5, end: 135, scene: 'live',
      caption: 'The worst point holds 4 variables: a, d, e and x at the if.',
      detail: 'On entry to the if statement, a, d, e and x are all live: the else branch reads d and e, the then branch reads a, and the test itself reads x and a. That is the largest live set in the block, so no allocation can use fewer than 4 registers.',
      narration: 'Four variables alive at once, at the if.',
      keyword: '4 at the if'
    },
    {
      id: 's5c', start: 135, end: 142.5, scene: 'live',
      caption: 'y is never live: it is written and then never read.',
      detail: 'The then branch assigns y and nothing ever reads it. Liveness therefore never records y at any point, and y never interferes with anything. A variable that is dead on arrival cannot be a register-allocation problem, however often it is assigned.',
      narration: 'y is written and never read, so it never appears.',
      keyword: 'y never live'
    },
    {
      id: 's5d', start: 142.5, end: 150, scene: 'live',
      caption: 'Maximum live is a lower bound on registers, never an upper bound.',
      detail: 'If 4 variables are live at one point then 4 registers are necessary, because each holds a distinct value that will be read later. It does not follow that 4 are sufficient: a colouring may still need more. Here the two numbers happen to agree at 4, which is a coincidence worth noticing rather than a rule.',
      narration: 'A lower bound. Sufficiency is the colouring question.',
      keyword: 'lower bound',
      trap: 'Maximum-live is necessary, not sufficient. Answer with it only when you can also show a colouring that meets it.'
    },

    /* ---------- scene 6: interf ---------- */
    {
      id: 's6a', start: 150, end: 157.5, scene: 'interf',
      caption: 'One node per variable, one edge per pair that is alive together.',
      detail: 'Six variables appear in the live sets, so the graph has six nodes. Two variables get an edge when some program point has both live; here that produces 10 edges out of the 15 possible pairs. Each edge is drawn with the point that witnesses it.',
      narration: 'Six nodes, ten edges, each edge with a witness.',
      keyword: '6 and 10'
    },
    {
      id: 's6b', start: 157.5, end: 165, scene: 'interf',
      caption: 'Degrees: a has 5, d and e have 4, c and x have 3, b has 1.',
      detail: 'Degree is how many other variables a variable can never share a register with. a is live across almost the whole block, so it touches everything. b appears only in the first statement and touches only a. The degree sequence is 5, 4, 4, 3, 3, 1.',
      narration: 'a touches everything. b touches only a.',
      keyword: 'degrees'
    },
    {
      id: 's6c', start: 165, end: 172.5, scene: 'interf',
      caption: 'Every edge has a witness point; every non-edge has none.',
      detail: 'The page checks both directions: each edge is justified by a statement whose live-in or live-out set contains both endpoints, and each of the 15 pairs that is never live together is confirmed absent. An edge with no witness is a bug in the analysis, not a fact about the program.',
      narration: 'Checked in both directions, all fifteen pairs.',
      keyword: 'both directions'
    },
    {
      id: 's6d', start: 172.5, end: 180, scene: 'interf',
      caption: 'Interference is about overlap, not about being mentioned together.',
      detail: 'd and e are never used in the same statement, yet they interfere: the else branch reads d and then e, so both are live across the point between them. Two variables that merely appear in one expression interfere only because both are live there — the reason is liveness, not syntax.',
      narration: 'd and e never meet in a statement, and still interfere.',
      keyword: 'overlap not mention',
      trap: 'Drawing an edge because two variables appear in one statement is right by accident. Draw it because both are live at one point.'
    },

    /* ---------- scene 7: colour ---------- */
    {
      id: 's7a', start: 180, end: 187.5, scene: 'colour',
      caption: 'A colour is a register. Adjacent nodes must get different colours.',
      detail: 'Colouring assigns each node a colour so that no edge joins two nodes of the same colour. Reading each colour as a physical register gives a valid assignment, because two variables that share a register are exactly two that were never alive together.',
      narration: 'Colour equals register. Adjacent means different.',
      keyword: 'colour is a register'
    },
    {
      id: 's7b', start: 187.5, end: 195, scene: 'colour',
      caption: 'Greedy colouring, highest degree first, uses 4 colours here.',
      detail: 'Taking the nodes in order of decreasing degree and giving each the smallest colour its neighbours do not already use produces 4 colours on this graph. Greedy is a heuristic: it always produces a valid colouring, and it can use more colours than necessary on other graphs.',
      narration: 'Greedy takes four colours here.',
      keyword: 'greedy 4'
    },
    {
      id: 's7c', start: 195, end: 202.5, scene: 'colour',
      caption: 'The clique {a, c, d, e} is 4 nodes all joined, so 3 colours is impossible.',
      detail: 'Four mutually interfering variables need four distinct registers whatever the algorithm. That is the lower bound. The exhaustive search over all 3-to-the-6 assignments finds no valid 3-colouring, and the 4-colouring above meets the bound, so 4 is the chromatic number and 4 registers is optimal.',
      narration: 'Four mutually interfering variables. Four registers, proved.',
      keyword: 'clique of 4'
    },
    {
      id: 's7d', start: 202.5, end: 210, scene: 'colour',
      caption: 'A valid colouring is a proof of sufficiency. A clique is a proof of necessity.',
      detail: 'The colouring proves k registers are enough; the clique proves fewer are impossible. When the two numbers meet, the answer is proved optimal. When they do not meet, you know only that the truth lies between them, and a question that asks for the minimum is asking you to close that gap.',
      narration: 'One proves enough, the other proves necessary.',
      keyword: 'two proofs',
      trap: 'A greedy colouring is never a proof of minimality by itself. Quote the clique, or say the number is an upper bound.'
    },

    /* ---------- scene 8: assign ---------- */
    {
      id: 's8a', start: 210, end: 217.5, scene: 'assign',
      caption: 'Four colours become R1 to R4, and every variable gets its register.',
      detail: 'The assignment is read straight off the colouring: a and d take different registers because they interfere, b shares a register with d because they never overlap, and so on. The check confirms no two interfering variables were given the same register.',
      narration: 'Read the assignment off the colours.',
      keyword: 'R1 to R4'
    },
    {
      id: 's8b', start: 217.5, end: 225, scene: 'assign',
      caption: 'GATE CSE 2013 Q49 asks for the minimum with no spill: the answer is 4.',
      detail: 'The question fixes the code and allows only register allocation as an optimisation, then asks how many registers the instruction set must have so that nothing spills. The block needs 4, which is both the maximum live count and the chromatic number of its interference graph.',
      narration: 'Four registers, no spill. That is the 2013 answer.',
      keyword: '2013 answer 4'
    },
    {
      id: 's8c', start: 225, end: 232.5, scene: 'assign',
      caption: 'With only 3 registers one variable must spill: the cheapest is d, at cost 3.',
      detail: 'Spilling a variable stores it after each definition and reloads it before each use, and it removes that node from the graph. The page tries all 63 non-empty spill sets and keeps the cheapest that leaves a 3-colourable graph. Spilling d costs 1 reload plus 2 stores, the cheapest of the four variables inside a 4-clique.',
      narration: 'Spill d: one reload, two stores.',
      keyword: 'spill d'
    },
    {
      id: 's8d', start: 232.5, end: 240, scene: 'assign',
      caption: 'Spilling a variable outside every clique cannot lower the answer.',
      detail: 'Dropping b and x leaves the clique {a, c, d, e} intact, so the graph still needs 4 colours and the spill bought nothing. A spill only helps if it breaks a clique. This is why a good spill heuristic looks at interference before it looks at use counts.',
      narration: 'A spill helps only if it breaks a clique.',
      keyword: 'break a clique',
      trap: 'Spilling the least-used variable is not always right. The variable must be inside the obstruction.'
    },

    /* ---------- scene 9: peep ---------- */
    {
      id: 's9a', start: 240, end: 247.5, scene: 'peep',
      caption: 'A peephole pass looks at a few instructions at a time and rewrites them.',
      detail: 'The window slides over the generated code. Each rule matches a short pattern and replaces it with a shorter equivalent. It is local by construction: it never reasons about the whole program, so it is cheap, and it can never make a change that depends on distant facts.',
      narration: 'A small window, a local rule, a shorter list.',
      keyword: 'small window'
    },
    {
      id: 's9b', start: 247.5, end: 255, scene: 'peep',
      caption: 'Five rules remove five instructions: 11 become 6.',
      detail: 'A load of the location just stored to is redundant. Adding zero and multiplying by one change nothing. A jump to the very next label is a no-op. A store overwritten by another store to the same location, with no read in between, is dead. Each rule fires exactly once here.',
      narration: 'Five rules, five instructions, eleven becomes six.',
      keyword: '11 to 6'
    },
    {
      id: 's9c', start: 255, end: 262.5, scene: 'peep',
      caption: 'Both programs were run on 25 input pairs and agreed on memory and registers.',
      detail: 'A rewrite is only an optimisation if it preserves behaviour. The page executes the original and the rewritten list on its own machine for every pair of inputs from 0 to 4, and compares the final memory and both registers. All 25 pairs agree, and a second pass over the result removes nothing more.',
      narration: 'Twenty-five pairs, same memory, same registers.',
      keyword: '25 pairs'
    },
    {
      id: 's9d', start: 262.5, end: 270, scene: 'peep',
      caption: 'Each rule needs a condition; drop the condition and the rule is wrong.',
      detail: 'The redundant load is only redundant when nothing writes the register in between. The dead store is only dead when no instruction reads the location between the two stores. The jump is only removable when the label is the next instruction. Remove any of those conditions and the rewrite changes the program.',
      narration: 'Each rule carries a condition. The condition is the rule.',
      keyword: 'conditions',
      trap: 'A peephole rule quoted without its condition is not a rule. The condition is what makes it sound.'
    },

    /* ---------- scene 10: exam ---------- */
    {
      id: 's10a', start: 270, end: 277.5, scene: 'exam',
      caption: 'First check: does the question ask for registers, variables, or instructions?',
      detail: 'Three different counts appear in these questions. Registers are physical; variables are names in the source; instructions are lines of machine code. A question that asks for the minimum number of registers wants the chromatic number of the interference graph, or the maximum live count when it is also a clique.',
      narration: 'Registers, variables, or instructions. Read which.',
      keyword: 'which count'
    },
    {
      id: 's10b', start: 277.5, end: 285, scene: 'exam',
      caption: 'Second check: is code motion allowed, and are spills allowed?',
      detail: 'The 2013 block needs 4 registers with allocation alone and 3 if code motion may also move statements. Both numbers are correct answers to different questions. The words "do not apply any optimization other than optimizing register allocation" are what choose between them.',
      narration: 'Code motion allowed or not. That changes the answer.',
      keyword: 'code motion',
      trap: 'The same code has two right answers. The sentence that allows or forbids code motion decides which one the question wants.'
    },
    {
      id: 's10c', start: 285, end: 292.5, scene: 'exam',
      caption: 'For an expression tree, ask whether the constants are immediates before using the formula.',
      detail: 'The 2017 expression gives 3 from the numbering and 2 from the machine, and the paper keys 2. If the question allows immediates, the numbering over-counts by one per constant that reaches an instruction. If it does not, the numbering is exact and is the fastest route to the answer.',
      narration: 'Immediates allowed? Then the formula over-counts.',
      keyword: 'immediates'
    },
    {
      id: 's10d', start: 292.5, end: 300, scene: 'exam',
      caption: 'Two checks, then the arithmetic: that order removes most wrong options.',
      detail: 'Decide the count, decide what is allowed, and only then compute. In the 2013 question, "4 registers" and "3 registers" are both options, and only the allowance sentence separates them. In the 2017 question, 3 is the formula answer and 2 is the machine answer, and only the immediates sentence separates those.',
      narration: 'Two checks before the arithmetic.',
      keyword: 'two checks',
      trap: 'Doing the arithmetic first is how the plausible wrong option gets chosen.'
    }
  ]
};
