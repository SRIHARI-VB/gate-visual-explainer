# Data-Flow Analysis: the Framework Behind Constant Propagation, Liveness and CSE — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/data-flow-analysis-framework/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 30 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Four knobs and one machine

*0:00 – 0:30 · objective: Name the four parts every data-flow analysis is built from, so that an unfamiliar analysis can be read off its four answers rather than memorised.*

**0:00–0:10** — Every data-flow analysis is four answers: which way the facts travel, what a fact is, how two facts combine, and what a block does to them.

> Caption: A data-flow analysis is four answers, not a list of formulas.

Exam-trap caption mode adds: *The four parts are asked about the analysis, not about the program. "It is a forward analysis" is an answer about the analysis.*

**0:10–0:20** — Direction is forward or backward. The domain is a lattice: a set of possible facts with an order, a top and a bottom.

> Caption: Direction is forward or backward; the domain is a lattice of facts.

Exam-trap caption mode adds: *The domain is a lattice, not merely a set. Without the order there is no notion of "more precise", and the termination argument has nothing to stand on.*

**0:20–0:30** — The meet operator combines the facts arriving on two different paths. The transfer function says what one block does to a fact that passes through it.

> Caption: Meet combines two paths; the transfer function says what one block does.

Exam-trap caption mode adds: *Meet is not always union. Union belongs to may analyses; intersection belongs to must analyses. Choosing the wrong one makes the answer wrong, not merely imprecise.*

## Scene 2. The lattice is the analysis

*0:30 – 1:00 · objective: Read the domain as a partial order with a top and a bottom, and see that union-meet and intersection-meet are two different questions about the same program.*

**0:30–0:40** — Take two variables. Their four subsets, ordered by inclusion, form a lattice: every pair has a least upper bound and a greatest lower bound.

> Caption: Four subsets of two variables form a lattice under inclusion.

Exam-trap caption mode adds: *The drawing is a picture of the order, not a proof that the order is a lattice. The proof is that union and intersection of two subsets are always subsets.*

**0:40–0:50** — A may analysis meets with union: a fact survives if some path carries it. A must analysis meets with intersection: a fact survives only if every path carries it.

> Caption: A may analysis meets with union; a must analysis meets with intersection.

Exam-trap caption mode adds: *The lattice is the same shape in both cases; what changes is which end is top. For available expressions the order is turned round, so the empty set is top.*

**0:50–1:00** — For available expressions the order is reversed: a smaller set is a larger fact, so the empty set is top and the full set is bottom.

> Caption: Turning the order round turns the empty set into the top element.

Exam-trap caption mode adds: *A common slip is to keep subset order and still use intersection. Then top and bottom swap silently and the initialisation is wrong.*

## Scene 3. GEN, KILL, and the transfer function

*1:00 – 1:30 · objective: Write the transfer function of a block as GEN together with what survives KILL, and say what KILL means for a definition, a variable and an expression.*

**1:00–1:10** — A block makes some facts true and destroys others. GEN is the first set, KILL is the second.

> Caption: GEN is what a block makes true; KILL is what it makes false.

Exam-trap caption mode adds: *GEN and KILL are local. A question that asks for them is asking you to read one block, not to run the analysis.*

**1:10–1:20** — KILL is not one idea. For a definition, assigning to the same variable kills the old definition. For a variable, an assignment kills its liveness. For an expression, writing to any operand kills the expression.

> Caption: KILL means one thing for a definition, another for a variable, another for an expression.

Exam-trap caption mode adds: *Killing an expression means touching any of its operands, not just the left-hand side. In a = b + c followed by b = 1, the expression b + c is dead.*

**1:20–1:30** — So the transfer function is: OUT equals GEN, together with everything that arrived and was not killed.

> Caption: OUT is GEN together with whatever came in and was not killed.

Exam-trap caption mode adds: *The union with GEN is not optional. Dropping it makes every fact that is generated inside a block invisible to the rest of the program.*

## Scene 4. Forward and backward are the same equations

*1:30 – 2:00 · objective: Swap IN and OUT, predecessors for successors, entry for exit, and turn a forward analysis into a backward one without changing anything else.*

**1:30–1:40** — In a forward analysis the IN of a block is built from its predecessors, and the boundary value sits at the entry.

> Caption: Forward: IN comes from predecessors, and the boundary is the entry.

Exam-trap caption mode adds: *The entry block is initialised by hand and is never recomputed from its predecessors. Doing both is the usual way to get a self-consistent but wrong answer.*

**1:40–1:50** — In a backward analysis every one of those words flips: OUT comes from successors, and the boundary value sits at the exit.

> Caption: Backward: swap IN and OUT, predecessors for successors, entry for exit.

Exam-trap caption mode adds: *In a backward analysis you compute OUT before IN for each block. Computing them in the forward order still converges, but takes more rounds and invites errors.*

**1:50–2:00** — There is only one algorithm. Rename IN to OUT and the forward solver becomes the backward solver.

> Caption: The equations are identical once you swap the names.

Exam-trap caption mode adds: *The boundary condition is the part that does not survive renaming by itself. You must also move it from entry to exit.*

## Scene 5. Iterate until nothing changes

*2:00 – 2:30 · objective: Run the equations round by round, watch the values descend the lattice, and say exactly why the loop must stop.*

**2:00–2:10** — Start with the most optimistic value the lattice allows, and let the rounds push each block down to the truth.

> Caption: Start optimistic, then let the values fall to the truth.

Exam-trap caption mode adds: *Starting at the wrong end still converges, but to the other fixpoint, which may be wrong rather than merely imprecise.*

**2:10–2:20** — On this four-block graph the values stop changing after two rounds: one round of change, and a second that finds nothing new.

> Caption: On this four-block graph the values stop changing in two rounds.

Exam-trap caption mode adds: *Counting only the rounds that changed something is the most common off-by-one in this topic.*

**2:20–2:30** — It must stop, for two reasons. The lattice has finite height, and every transfer function is monotone, so a value never climbs back.

> Caption: It must stop: the lattice has finite height and the functions are monotone.

Exam-trap caption mode adds: *Termination is a consequence of two conditions, and both are needed. Finite height alone does not stop a function that jumps back up.*

## Scene 6. Liveness on a four-block graph

*2:30 – 3:00 · objective: Compute the live variables at the exit of every block on the GATE CSE 2023 graph, including the back edge, and match the recorded key.*

**2:30–2:40** — Here is the graph from a GATE paper: four blocks, a branch, a join and a back edge from the fourth block to the second.

> Caption: Four blocks, one back edge, and five variables.

Exam-trap caption mode adds: *Ignoring the back edge gives a graph with no cycle, and then one backward pass appears to be enough. That answer is wrong.*

**2:40–2:50** — USE is what the block reads before writing, DEF is what it writes. IN adds USE to whatever is still live after the block and not overwritten.

> Caption: USE and DEF come from the block; IN and OUT come from the neighbours.

Exam-trap caption mode adds: *A variable that is read and then written is in USE. A variable that is written and then read is not: the write kills the earlier value.*

**2:50–3:00** — After three rounds the live sets at the four exits are a, i and j; then a and j; then a and j; then a, i and j again.

> Caption: The exits are a, i, j; a, j; a, j; a, i, j — option D.

Exam-trap caption mode adds: *The last block still has i live, because i is used at the top of block two, which the back edge reaches. Dropping i there is the standard wrong answer.*

## Scene 7. Available expressions, and the union trap

*3:00 – 3:30 · objective: Decide when a repeated expression is redundant, and see the concrete wrong answer that set union produces at a join.*

**3:00–3:10** — An expression is available at a point if every path from the entry computes it, and no path overwrites any of its operands.

> Caption: An expression is available if every path computes it and none destroys it.

Exam-trap caption mode adds: *"Computed on this path" is not available. The word is every, and one killing path is enough to make the expression unavailable.*

**3:10–3:20** — At the join, intersecting the two incoming sets leaves nothing, because the right branch assigned to a. Union, by contrast, keeps a + b.

> Caption: Intersecting at the join says a + b is not available; union says it is.

Exam-trap caption mode adds: *This is the trap of the topic. Union at a must-join produces a wrong answer that looks plausible and would break the program if a compiler acted on it.*

**3:20–3:30** — So the second computation of a + b inside the left branch can reuse the first, and the computation after the join cannot.

> Caption: Inside the left branch the expression is redundant; after the join it is not.

Exam-trap caption mode adds: *Redundancy is a property of a program point, not of an expression. The same expression is redundant in one block and not in another.*

## Scene 8. Reaching definitions

*3:30 – 4:00 · objective: Run the forward may analysis whose facts are assignments rather than variables, and check it against a path search.*

**3:30–3:40** — Here the facts are assignments. A definition reaches a point if some path carries it there without an intervening redefinition.

> Caption: A reaching definition is an assignment, not a variable.

Exam-trap caption mode adds: *Do not answer with a variable name. The answer to a reaching-definitions question is a set of definition labels.*

**3:40–3:50** — Forward, meet by union, and a definition kills every other definition of the same variable.

> Caption: Forward, union, and a kill set of every other definition of the same variable.

Exam-trap caption mode adds: *KILL is about the assigned variable, not about the block. Two assignments to different variables in the same block do not kill each other.*

**3:50–4:00** — The join receives three definitions: the first two, and the one from the right branch. A direct search over paths finds exactly the same set.

> Caption: The entry of the join holds three definitions; a path search agrees.

Exam-trap caption mode adds: *The kill in the right branch removes d1 and d2 from that branch only. They still reach the join through the left branch.*

## Scene 9. Constant propagation is not distributive

*4:00 – 4:30 · objective: See a program where the meet-over-all-paths answer is a constant but the fixpoint answer is not, and understand which one a compiler is allowed to use.*

**4:00–4:10** — For constants the domain is three kinds of value: not yet known, a particular constant, and definitely not a constant.

> Caption: A constant-propagation lattice has three kinds of value.

Exam-trap caption mode adds: *The bottom value is not an error. It is the honest answer "this is not a single constant", and it is what makes the analysis safe.*

**4:10–4:20** — One branch sets x to one and y to two. The other sets x to two and y to one. Both branches then reach the same addition.

> Caption: One branch sets x to one and y to two; the other swaps them.

Exam-trap caption mode adds: *The temptation is to say z is three because both paths give three. That is the meet-over-all-paths answer, and a compiler cannot compute it in general.*

**4:20–4:30** — Meeting over all paths gives three. The fixpoint gives not-a-constant, because it meets the inputs before adding them.

> Caption: Meet-over-all-paths gives three; the fixpoint gives not-a-constant.

Exam-trap caption mode adds: *For the three gen-kill analyses the two answers always coincide. Only here do they differ, and a question that asks which is precise is asking about distributivity.*

## Scene 10. The classification, and three traps

*4:30 – 5:00 · objective: Place the four classical analyses in the forward/backward and may/must grid, and name the three errors that cost marks.*

**4:30–4:40** — Four analyses fill the four cells: reaching definitions forward and may, available expressions forward and must, liveness backward and may, very busy expressions backward and must.

> Caption: Four analyses, four cells of one grid.

Exam-trap caption mode adds: *Very busy expressions is the cell most often left empty. It asks which expressions will be evaluated on every path before any operand changes, and it drives code hoisting.*

**4:40–4:50** — Three errors account for most lost marks: union at a must-join, a forgotten back edge, and a dropped GEN set.

> Caption: Union at a must-join, a forgotten back edge, a dropped GEN.

Exam-trap caption mode adds: *A fourth error is the off-by-one in the iteration count, which is a reading error rather than a modelling one.*

**4:50–5:00** — For each analysis, know two answers: what it computes, and which optimisation it enables. Most conceptual questions ask the second.

> Caption: Two answers per analysis: what it computes, and which optimisation it enables.

Exam-trap caption mode adds: *Constant folding is not common subexpression elimination. Folding evaluates arithmetic at compile time; elimination reuses a previously computed value.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
