# Target code generation: instruction selection, register allocation by colouring, and peephole optimisation — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/target-code-generation/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. What the back end has to decide

*0:00 – 0:30 · objective: See the three jobs between intermediate code and machine code — choosing instructions, choosing registers, and cleaning up locally — and the four counts a question can ask for.*

**0:00–0:07** — The intermediate form names no register. The back end supplies them.

> Caption: Intermediate code is machine-independent. Machine code is not.

**0:07–0:15** — Three jobs: select, allocate, clean up.

> Caption: Three jobs: select instructions, allocate registers, clean up locally.

Exam-trap caption mode adds: *A question that asks for instructions is not asking for registers. Read which count it wants before you compute either.*

**0:15–0:22** — Four counts, one block, every number computed here.

> Caption: This page computes four counts: instructions, registers, live variables, colours.

**0:22–0:30** — The clause names liveness and local optimisation. These are what they are for.

> Caption: Syllabus position: Section 7 names the inputs, not these three jobs by name.

Exam-trap caption mode adds: *Do not call this a syllabus topic by name. It is the exam-facing consequence of two clauses that are named.*

## Scene 2. One node per distinct computation

*0:30 – 1:00 · objective: Turn a basic block into a DAG, see repeated computations merge into one node, and count what the merge saves: 4 operator nodes and 4 loads instead of 5 and 6.*

**0:30–0:37** — Five statements. Four different computations.

> Caption: Five statements, but only four different computations.

**0:37–0:45** — One node per value. The repeat lands on the same node.

> Caption: A DAG node is a value; an edge is a use. Shared nodes are shared values.

**0:45–0:52** — Eleven instructions become eight.

> Caption: Six leaf occurrences become four loads; five operators become four.

**0:52–1:00** — Built by lookup, so the sharing is a fact about the block.

> Caption: The DAG is built from the block, so it can never disagree with it.

Exam-trap caption mode adds: *A DAG is not an optimisation you apply later. It is the block with its repeats merged, and it is only valid inside one basic block.*

## Scene 3. Two machines, two prices

*1:00 – 1:30 · objective: Cover one DAG with two instruction sets and count both: 8 instructions at 3 registers, or 12 instructions at 1 register, with both programs executed to confirm they agree.*

**1:00–1:07** — Eight instructions at three registers, or twelve at one.

> Caption: Same DAG, two machines: 8 instructions at 3 registers, or 12 at 1.

**1:07–1:15** — Each instruction covers part of the DAG. The machine sets the price.

> Caption: Selection is a covering problem: which instruction covers which nodes.

**1:15–1:22** — Both were run. Both agree.

> Caption: Both programs were executed: they agree on every input tried.

**1:22–1:30** — Shorter code, more registers. The trade is the point.

> Caption: Fewer instructions usually means more registers. That is the trade.

Exam-trap caption mode adds: *Never answer "minimum instructions" and "minimum registers" with the same covering. They pull in opposite directions.*

## Scene 4. How many registers an expression needs

*1:30 – 2:00 · objective: Apply the Sethi-Ullman numbering to (a-1)*(((b+c)/3)+d), get 3, and see the exhaustive search return 2 — the number GATE CSE 2017 Set 1 Q52 keys — because the constants are immediates.*

**1:30–1:37** — The formula says three. The machine needs two.

> Caption: (a-1)*(((b+c)/3)+d): the numbering gives 3, the machine needs 2.

**1:37–1:45** — Label the constants zero and the formula gives two as well.

> Caption: The formula charges each constant a register. The instruction set does not.

**1:45–1:52** — Load, add, divide, add, subtract, multiply. Two registers.

> Caption: Two registers, eight instructions, no spill — the 2017 answer.

**1:52–2:00** — The formula assumes a register per leaf. Check that assumption.

> Caption: The formula is exact when every leaf costs a register; the search is exact always.

Exam-trap caption mode adds: *Sethi-Ullman is an upper bound on a machine with immediates. It is not the answer to a question that allows them.*

## Scene 5. Liveness: what is still needed

*2:00 – 2:30 · objective: Run liveness backwards over the GATE CSE 2013 Q49 block, write the live set at every statement, and find that the largest one holds 4 variables.*

**2:00–2:07** — Live means read before overwritten, on some path from here.

> Caption: A variable is live at a point if some path from there reads it first.

**2:07–2:15** — Four variables alive at once, at the if.

> Caption: The worst point holds 4 variables: a, d, e and x at the if.

**2:15–2:22** — y is written and never read, so it never appears.

> Caption: y is never live: it is written and then never read.

**2:22–2:30** — A lower bound. Sufficiency is the colouring question.

> Caption: Maximum live is a lower bound on registers, never an upper bound.

Exam-trap caption mode adds: *Maximum-live is necessary, not sufficient. Answer with it only when you can also show a colouring that meets it.*

## Scene 6. The interference graph

*2:30 – 3:00 · objective: Build the graph from the live sets — one node per variable, one edge per pair alive together — and check every edge against a witness program point.*

**2:30–2:37** — Six nodes, ten edges, each edge with a witness.

> Caption: One node per variable, one edge per pair that is alive together.

**2:37–2:45** — a touches everything. b touches only a.

> Caption: Degrees: a has 5, d and e have 4, c and x have 3, b has 1.

**2:45–2:52** — Checked in both directions, all fifteen pairs.

> Caption: Every edge has a witness point; every non-edge has none.

**2:52–3:00** — d and e never meet in a statement, and still interfere.

> Caption: Interference is about overlap, not about being mentioned together.

Exam-trap caption mode adds: *Drawing an edge because two variables appear in one statement is right by accident. Draw it because both are live at one point.*

## Scene 7. Colouring is allocating

*3:00 – 3:30 · objective: Colour the interference graph, meet the lower bound given by its largest clique, and conclude that 4 registers is optimal rather than merely what one heuristic found.*

**3:00–3:07** — Colour equals register. Adjacent means different.

> Caption: A colour is a register. Adjacent nodes must get different colours.

**3:07–3:15** — Greedy takes four colours here.

> Caption: Greedy colouring, highest degree first, uses 4 colours here.

**3:15–3:22** — Four mutually interfering variables. Four registers, proved.

> Caption: The clique {a, c, d, e} is 4 nodes all joined, so 3 colours is impossible.

**3:22–3:30** — One proves enough, the other proves necessary.

> Caption: A valid colouring is a proof of sufficiency. A clique is a proof of necessity.

Exam-trap caption mode adds: *A greedy colouring is never a proof of minimality by itself. Quote the clique, or say the number is an upper bound.*

## Scene 8. Registers, spills and the 2013 answer

*3:30 – 4:00 · objective: Turn four colours into four registers, then ask what three registers cost: the cheapest spill set and its reload count, against the answer GATE CSE 2013 Q49 keys.*

**3:30–3:37** — Read the assignment off the colours.

> Caption: Four colours become R1 to R4, and every variable gets its register.

**3:37–3:45** — Four registers, no spill. That is the 2013 answer.

> Caption: GATE CSE 2013 Q49 asks for the minimum with no spill: the answer is 4.

**3:45–3:52** — Spill d: one reload, two stores.

> Caption: With only 3 registers one variable must spill: the cheapest is d, at cost 3.

**3:52–4:00** — A spill helps only if it breaks a clique.

> Caption: Spilling a variable outside every clique cannot lower the answer.

Exam-trap caption mode adds: *Spilling the least-used variable is not always right. The variable must be inside the obstruction.*

## Scene 9. Peephole optimisation

*4:00 – 4:30 · objective: Slide a small window over the generated code, apply five local rules, remove 5 of 11 instructions, and check the two programs agree on every input tried.*

**4:00–4:07** — A small window, a local rule, a shorter list.

> Caption: A peephole pass looks at a few instructions at a time and rewrites them.

**4:07–4:15** — Five rules, five instructions, eleven becomes six.

> Caption: Five rules remove five instructions: 11 become 6.

**4:15–4:22** — Twenty-five pairs, same memory, same registers.

> Caption: Both programs were run on 25 input pairs and agreed on memory and registers.

**4:22–4:30** — Each rule carries a condition. The condition is the rule.

> Caption: Each rule needs a condition; drop the condition and the rule is wrong.

Exam-trap caption mode adds: *A peephole rule quoted without its condition is not a rule. The condition is what makes it sound.*

## Scene 10. How the question is asked

*4:30 – 5:00 · objective: Recognise the four shapes these questions take and apply the two checks — registers or variables, and whether code motion is allowed — before doing any arithmetic.*

**4:30–4:37** — Registers, variables, or instructions. Read which.

> Caption: First check: does the question ask for registers, variables, or instructions?

**4:37–4:45** — Code motion allowed or not. That changes the answer.

> Caption: Second check: is code motion allowed, and are spills allowed?

Exam-trap caption mode adds: *The same code has two right answers. The sentence that allows or forbids code motion decides which one the question wants.*

**4:45–4:52** — Immediates allowed? Then the formula over-counts.

> Caption: For an expression tree, ask whether the constants are immediates before using the formula.

**4:52–5:00** — Two checks before the arithmetic.

> Caption: Two checks, then the arithmetic: that order removes most wrong options.

Exam-trap caption mode adds: *Doing the arithmetic first is how the plausible wrong option gets chosen.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
