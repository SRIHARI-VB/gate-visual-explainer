/* ==========================================================================
   data-flow-analysis-framework — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs — never edited by hand.

   Every number quoted in a caption is produced by the model in lesson.js and
   printed on the canvas, so caption and canvas agree because both read the same
   computation.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'four-knobs',
      n: 1,
      title: 'Four knobs and one machine',
      start: 0, end: 30,
      objective: 'Name the four parts every data-flow analysis is built from, so that an unfamiliar analysis can be read off its four answers rather than memorised.'
    },
    {
      id: 'lattice',
      n: 2,
      title: 'The lattice is the analysis',
      start: 30, end: 60,
      objective: 'Read the domain as a partial order with a top and a bottom, and see that union-meet and intersection-meet are two different questions about the same program.'
    },
    {
      id: 'genkill',
      n: 3,
      title: 'GEN, KILL, and the transfer function',
      start: 60, end: 90,
      objective: 'Write the transfer function of a block as GEN together with what survives KILL, and say what KILL means for a definition, a variable and an expression.'
    },
    {
      id: 'direction',
      n: 4,
      title: 'Forward and backward are the same equations',
      start: 90, end: 120,
      objective: 'Swap IN and OUT, predecessors for successors, entry for exit, and turn a forward analysis into a backward one without changing anything else.'
    },
    {
      id: 'fixpoint',
      n: 5,
      title: 'Iterate until nothing changes',
      start: 120, end: 150,
      objective: 'Run the equations round by round, watch the values descend the lattice, and say exactly why the loop must stop.'
    },
    {
      id: 'liveness',
      n: 6,
      title: 'Liveness on a four-block graph',
      start: 150, end: 180,
      objective: 'Compute the live variables at the exit of every block on the GATE CSE 2023 graph, including the back edge, and match the recorded key.'
    },
    {
      id: 'available',
      n: 7,
      title: 'Available expressions, and the union trap',
      start: 180, end: 210,
      objective: 'Decide when a repeated expression is redundant, and see the concrete wrong answer that set union produces at a join.'
    },
    {
      id: 'reaching',
      n: 8,
      title: 'Reaching definitions',
      start: 210, end: 240,
      objective: 'Run the forward may analysis whose facts are assignments rather than variables, and check it against a path search.'
    },
    {
      id: 'constant',
      n: 9,
      title: 'Constant propagation is not distributive',
      start: 240, end: 270,
      objective: 'See a program where the meet-over-all-paths answer is a constant but the fixpoint answer is not, and understand which one a compiler is allowed to use.'
    },
    {
      id: 'classify',
      n: 10,
      title: 'The classification, and three traps',
      start: 270, end: 300,
      objective: 'Place the four classical analyses in the forward/backward and may/must grid, and name the three errors that cost marks.'
    }
  ],

  events: [

    /* ---------------- scene 1: four knobs ---------------- */
    {
      id: 'e1a', scene: 'four-knobs', start: 0, end: 10,
      caption: 'A data-flow analysis is four answers, not a list of formulas.',
      narration: 'Every data-flow analysis is four answers: which way the facts travel, what a fact is, how two facts combine, and what a block does to them.',
      detail: 'The four parts are direction, domain with its meet operator, the set of transfer functions, and the boundary value. A framework is the quadruple. An analysis is a framework plus a program.',
      keyword: 'four answers',
      trap: 'The four parts are asked about the analysis, not about the program. "It is a forward analysis" is an answer about the analysis.'
    },
    {
      id: 'e1b', scene: 'four-knobs', start: 10, end: 20,
      caption: 'Direction is forward or backward; the domain is a lattice of facts.',
      narration: 'Direction is forward or backward. The domain is a lattice: a set of possible facts with an order, a top and a bottom.',
      detail: 'Forward analyses ask what happened before this point; backward analyses ask what will happen after it. The domain is not a set of sets by accident: it must be a lattice so that "combine two paths" always has an answer.',
      keyword: 'lattice',
      trap: 'The domain is a lattice, not merely a set. Without the order there is no notion of "more precise", and the termination argument has nothing to stand on.'
    },
    {
      id: 'e1c', scene: 'four-knobs', start: 20, end: 30,
      caption: 'Meet combines two paths; the transfer function says what one block does.',
      narration: 'The meet operator combines the facts arriving on two different paths. The transfer function says what one block does to a fact that passes through it.',
      detail: 'IN is the meet of the OUT values of the neighbours, and OUT is the transfer function applied to IN. Those two lines, plus a boundary value, are the whole analysis.',
      keyword: 'meet',
      trap: 'Meet is not always union. Union belongs to may analyses; intersection belongs to must analyses. Choosing the wrong one makes the answer wrong, not merely imprecise.'
    },

    /* ---------------- scene 2: lattice ---------------- */
    {
      id: 'e2a', scene: 'lattice', start: 30, end: 40,
      caption: 'Four subsets of two variables form a lattice under inclusion.',
      narration: 'Take two variables. Their four subsets, ordered by inclusion, form a lattice: every pair has a least upper bound and a greatest lower bound.',
      detail: 'A lattice is a partially ordered set in which every two elements have a join and a meet. For subsets, join is union and meet is intersection. Top is the whole set, bottom is the empty set. With three variables the same drawing would have eight nodes.',
      keyword: 'Four subsets',
      trap: 'The drawing is a picture of the order, not a proof that the order is a lattice. The proof is that union and intersection of two subsets are always subsets.'
    },
    {
      id: 'e2b', scene: 'lattice', start: 40, end: 50,
      caption: 'A may analysis meets with union; a must analysis meets with intersection.',
      narration: 'A may analysis meets with union: a fact survives if some path carries it. A must analysis meets with intersection: a fact survives only if every path carries it.',
      detail: 'Liveness is a may analysis: a variable is live if some path uses it before redefining it. Available expressions is a must analysis: an expression is available only if every path computes it and none destroys it.',
      keyword: 'may analysis',
      trap: 'The lattice is the same shape in both cases; what changes is which end is top. For available expressions the order is turned round, so the empty set is top.'
    },
    {
      id: 'e2c', scene: 'lattice', start: 50, end: 60,
      caption: 'Turning the order round turns the empty set into the top element.',
      narration: 'For available expressions the order is reversed: a smaller set is a larger fact, so the empty set is top and the full set is bottom.',
      detail: 'Writing the available-expressions domain as sets ordered by superset makes intersection the meet and the empty set the top. Nothing about the program changed; only the direction of the order did.',
      keyword: 'order is reversed',
      trap: 'A common slip is to keep subset order and still use intersection. Then top and bottom swap silently and the initialisation is wrong.'
    },

    /* ---------------- scene 3: gen and kill ---------------- */
    {
      id: 'e3a', scene: 'genkill', start: 60, end: 70,
      caption: 'GEN is what a block makes true; KILL is what it makes false.',
      narration: 'A block makes some facts true and destroys others. GEN is the first set, KILL is the second.',
      detail: 'For a block that assigns to x, GEN contains the definition itself, and KILL contains every other definition of x. The two sets are computed from the block alone, with no knowledge of the rest of the program.',
      keyword: 'GEN',
      trap: 'GEN and KILL are local. A question that asks for them is asking you to read one block, not to run the analysis.'
    },
    {
      id: 'e3b', scene: 'genkill', start: 70, end: 80,
      caption: 'KILL means one thing for a definition, another for a variable, another for an expression.',
      narration: 'KILL is not one idea. For a definition, assigning to the same variable kills the old definition. For a variable, an assignment kills its liveness. For an expression, writing to any operand kills the expression.',
      detail: 'The three kill rules: a definition d of x is killed by any other definition of x; a variable is killed by an assignment to it; an expression is killed by an assignment to any variable it mentions.',
      keyword: 'not one idea',
      trap: 'Killing an expression means touching any of its operands, not just the left-hand side. In a = b + c followed by b = 1, the expression b + c is dead.'
    },
    {
      id: 'e3c', scene: 'genkill', start: 80, end: 90,
      caption: 'OUT is GEN together with whatever came in and was not killed.',
      narration: 'So the transfer function is: OUT equals GEN, together with everything that arrived and was not killed.',
      detail: 'This one line is the whole of a gen-kill analysis. Substituting GEN and KILL for a specific fact gives reaching definitions, available expressions and very busy expressions, with no other change.',
      keyword: 'GEN',
      trap: 'The union with GEN is not optional. Dropping it makes every fact that is generated inside a block invisible to the rest of the program.'
    },

    /* ---------------- scene 4: direction ---------------- */
    {
      id: 'e4a', scene: 'direction', start: 90, end: 100,
      caption: 'Forward: IN comes from predecessors, and the boundary is the entry.',
      narration: 'In a forward analysis the IN of a block is built from its predecessors, and the boundary value sits at the entry.',
      detail: 'Forward analyses answer a question about the past: which definitions reach here, which expressions were computed here. The data enters at the top of the graph and flows down the edges.',
      keyword: 'Forward',
      trap: 'The entry block is initialised by hand and is never recomputed from its predecessors. Doing both is the usual way to get a self-consistent but wrong answer.'
    },
    {
      id: 'e4b', scene: 'direction', start: 100, end: 110,
      caption: 'Backward: swap IN and OUT, predecessors for successors, entry for exit.',
      narration: 'In a backward analysis every one of those words flips: OUT comes from successors, and the boundary value sits at the exit.',
      detail: 'Liveness is the backward case. A variable is live at a point if a future path uses it, so the fact travels against the edges, from the exit back to the entry.',
      keyword: 'Backward',
      trap: 'In a backward analysis you compute OUT before IN for each block. Computing them in the forward order still converges, but takes more rounds and invites errors.'
    },
    {
      id: 'e4c', scene: 'direction', start: 110, end: 120,
      caption: 'The equations are identical once you swap the names.',
      narration: 'There is only one algorithm. Rename IN to OUT and the forward solver becomes the backward solver.',
      detail: 'A single solver parameterised by direction, meet operator and transfer function handles all of them. That is why one implementation in a compiler covers a dozen analyses.',
      keyword: 'one algorithm',
      trap: 'The boundary condition is the part that does not survive renaming by itself. You must also move it from entry to exit.'
    },

    /* ---------------- scene 5: fixpoint ---------------- */
    {
      id: 'e5a', scene: 'fixpoint', start: 120, end: 130,
      caption: 'Start optimistic, then let the values fall to the truth.',
      narration: 'Start with the most optimistic value the lattice allows, and let the rounds push each block down to the truth.',
      detail: 'Optimistic means assuming the fact holds everywhere, so that any place it fails to hold will be found. For a must analysis that is top; for a may analysis, with the order reversed, it is the empty set.',
      keyword: 'optimistic',
      trap: 'Starting at the wrong end still converges, but to the other fixpoint, which may be wrong rather than merely imprecise.'
    },
    {
      id: 'e5b', scene: 'fixpoint', start: 130, end: 140,
      caption: 'On this four-block graph the values stop changing in two rounds.',
      narration: 'On this four-block graph the values stop changing after two rounds: one round of change, and a second that finds nothing new.',
      detail: 'The second round is the convergence check, not a round of work. A question that asks how many iterations are needed usually wants the count including the confirming round, so read the wording.',
      keyword: 'two rounds',
      trap: 'Counting only the rounds that changed something is the most common off-by-one in this topic.'
    },
    {
      id: 'e5c', scene: 'fixpoint', start: 140, end: 150,
      caption: 'It must stop: the lattice has finite height and the functions are monotone.',
      narration: 'It must stop, for two reasons. The lattice has finite height, and every transfer function is monotone, so a value never climbs back.',
      detail: 'A chain of strict descents can be no longer than the height of the lattice, and monotonicity guarantees each round only descends. So the number of rounds is bounded by the height times the number of blocks.',
      keyword: 'monotone',
      trap: 'Termination is a consequence of two conditions, and both are needed. Finite height alone does not stop a function that jumps back up.'
    },

    /* ---------------- scene 6: liveness ---------------- */
    {
      id: 'e6a', scene: 'liveness', start: 150, end: 160,
      caption: 'Four blocks, one back edge, and five variables.',
      narration: 'Here is the graph from a GATE paper: four blocks, a branch, a join and a back edge from the fourth block to the second.',
      detail: 'Block one initialises i, j and a. Block two increments i and decrements j. Block three sets a. Block four computes i from a. The back edge is what makes this a loop and forces more than one round.',
      keyword: 'back edge',
      trap: 'Ignoring the back edge gives a graph with no cycle, and then one backward pass appears to be enough. That answer is wrong.'
    },
    {
      id: 'e6b', scene: 'liveness', start: 160, end: 170,
      caption: 'USE and DEF come from the block; IN and OUT come from the neighbours.',
      narration: 'USE is what the block reads before writing, DEF is what it writes. IN adds USE to whatever is still live after the block and not overwritten.',
      detail: 'For block two, USE is i and j because both are read by i = i + 1 and j = j - 1 before being written. DEF is also i and j. Because DEF is contained in USE, the two conventions for DEF give the same IN.',
      keyword: 'USE',
      trap: 'A variable that is read and then written is in USE. A variable that is written and then read is not: the write kills the earlier value.'
    },
    {
      id: 'e6c', scene: 'liveness', start: 170, end: 180,
      caption: 'The exits are a, i, j; a, j; a, j; a, i, j — option D.',
      narration: 'After three rounds the live sets at the four exits are a, i and j; then a and j; then a and j; then a, i and j again.',
      detail: 'That is option D of the paper, and this page reaches it by running the equations rather than by reading the options. A second, independent route — searching every path for a use before a definition — agrees at all twenty block-variable pairs.',
      keyword: 'option D',
      trap: 'The last block still has i live, because i is used at the top of block two, which the back edge reaches. Dropping i there is the standard wrong answer.'
    },

    /* ---------------- scene 7: available expressions ---------------- */
    {
      id: 'e7a', scene: 'available', start: 180, end: 190,
      caption: 'An expression is available if every path computes it and none destroys it.',
      narration: 'An expression is available at a point if every path from the entry computes it, and no path overwrites any of its operands.',
      detail: 'Both halves matter. The first is the word every, which is why the meet is intersection. The second is the KILL set, which is why writing to a is what destroys a + b.',
      keyword: 'every path',
      trap: '"Computed on this path" is not available. The word is every, and one killing path is enough to make the expression unavailable.'
    },
    {
      id: 'e7b', scene: 'available', start: 190, end: 200,
      caption: 'Intersecting at the join says a + b is not available; union says it is.',
      narration: 'At the join, intersecting the two incoming sets leaves nothing, because the right branch assigned to a. Union, by contrast, keeps a + b.',
      detail: 'The left branch computes a + b, so it is in the left OUT. The right branch assigns to a, which kills a + b, so it is not in the right OUT. Intersection is empty; union is not.',
      keyword: 'Intersecting',
      trap: 'This is the trap of the topic. Union at a must-join produces a wrong answer that looks plausible and would break the program if a compiler acted on it.'
    },
    {
      id: 'e7c', scene: 'available', start: 200, end: 210,
      caption: 'Inside the left branch the expression is redundant; after the join it is not.',
      narration: 'So the second computation of a + b inside the left branch can reuse the first, and the computation after the join cannot.',
      detail: 'Global common subexpression elimination replaces a repeated expression with a copy of an earlier one, but only where the analysis says the value is still available. Here that is the left branch and nowhere else.',
      keyword: 'redundant',
      trap: 'Redundancy is a property of a program point, not of an expression. The same expression is redundant in one block and not in another.'
    },

    /* ---------------- scene 8: reaching definitions ---------------- */
    {
      id: 'e8a', scene: 'reaching', start: 210, end: 220,
      caption: 'A reaching definition is an assignment, not a variable.',
      narration: 'Here the facts are assignments. A definition reaches a point if some path carries it there without an intervening redefinition.',
      detail: 'Naming definitions d1 to d4 makes the domain a set of labels rather than a set of names, which is what makes the analysis a may analysis: one surviving path is enough.',
      keyword: 'assignment',
      trap: 'Do not answer with a variable name. The answer to a reaching-definitions question is a set of definition labels.'
    },
    {
      id: 'e8b', scene: 'reaching', start: 220, end: 230,
      caption: 'Forward, union, and a kill set of every other definition of the same variable.',
      narration: 'Forward, meet by union, and a definition kills every other definition of the same variable.',
      detail: 'Assigning to a kills the earlier definitions of a, so d3 kills d1 and d2 in this graph, while d4, which defines v, kills nothing here.',
      keyword: 'union',
      trap: 'KILL is about the assigned variable, not about the block. Two assignments to different variables in the same block do not kill each other.'
    },
    {
      id: 'e8c', scene: 'reaching', start: 230, end: 240,
      caption: 'The entry of the join holds three definitions; a path search agrees.',
      narration: 'The join receives three definitions: the first two, and the one from the right branch. A direct search over paths finds exactly the same set.',
      detail: 'The fixpoint result and the path search are computed by different code in this page and compared, so the agreement is a check rather than an assertion.',
      keyword: 'three definitions',
      trap: 'The kill in the right branch removes d1 and d2 from that branch only. They still reach the join through the left branch.'
    },

    /* ---------------- scene 9: constant propagation ---------------- */
    {
      id: 'e9a', scene: 'constant', start: 240, end: 250,
      caption: 'A constant-propagation lattice has three kinds of value.',
      narration: 'For constants the domain is three kinds of value: not yet known, a particular constant, and definitely not a constant.',
      detail: 'Not yet known is top, definitely not a constant is bottom, and each constant sits between them. The meet of two different constants is the bottom value.',
      keyword: 'three kinds',
      trap: 'The bottom value is not an error. It is the honest answer "this is not a single constant", and it is what makes the analysis safe.'
    },
    {
      id: 'e9b', scene: 'constant', start: 250, end: 260,
      caption: 'One branch sets x to one and y to two; the other swaps them.',
      narration: 'One branch sets x to one and y to two. The other sets x to two and y to one. Both branches then reach the same addition.',
      detail: 'Each variable individually is not a constant at the join. But the sum is three on both paths, which is exactly the situation where meeting early loses information.',
      keyword: 'swaps',
      trap: 'The temptation is to say z is three because both paths give three. That is the meet-over-all-paths answer, and a compiler cannot compute it in general.'
    },
    {
      id: 'e9c', scene: 'constant', start: 260, end: 270,
      caption: 'Meet-over-all-paths gives three; the fixpoint gives not-a-constant.',
      narration: 'Meeting over all paths gives three. The fixpoint gives not-a-constant, because it meets the inputs before adding them.',
      detail: 'Both answers are safe, and the fixpoint is the more conservative one. The gap exists because the transfer function for addition does not distribute over the meet, which is a property of constant propagation alone among the analyses here.',
      keyword: 'fixpoint',
      trap: 'For the three gen-kill analyses the two answers always coincide. Only here do they differ, and a question that asks which is precise is asking about distributivity.'
    },

    /* ---------------- scene 10: classification ---------------- */
    {
      id: 'e10a', scene: 'classify', start: 270, end: 280,
      caption: 'Four analyses, four cells of one grid.',
      narration: 'Four analyses fill the four cells: reaching definitions forward and may, available expressions forward and must, liveness backward and may, very busy expressions backward and must.',
      detail: 'The grid is not a mnemonic to memorise; it falls out of two questions. Does the fact describe the past or the future, and does it survive on some path or on all of them.',
      keyword: 'four cells',
      trap: 'Very busy expressions is the cell most often left empty. It asks which expressions will be evaluated on every path before any operand changes, and it drives code hoisting.'
    },
    {
      id: 'e10b', scene: 'classify', start: 280, end: 290,
      caption: 'Union at a must-join, a forgotten back edge, a dropped GEN.',
      narration: 'Three errors account for most lost marks: union at a must-join, a forgotten back edge, and a dropped GEN set.',
      detail: 'Each one is a single symbol changed, and each produces an answer that looks like an option. Checking the three against your working is faster than redoing the question.',
      keyword: 'Three errors',
      trap: 'A fourth error is the off-by-one in the iteration count, which is a reading error rather than a modelling one.'
    },
    {
      id: 'e10c', scene: 'classify', start: 290, end: 300,
      caption: 'Two answers per analysis: what it computes, and which optimisation it enables.',
      narration: 'For each analysis, know two answers: what it computes, and which optimisation it enables. Most conceptual questions ask the second.',
      detail: 'Liveness enables register allocation and dead-code elimination. Available expressions enables global common subexpression elimination. Reaching definitions enables constant propagation and use-def chains.',
      keyword: 'optimisation',
      trap: 'Constant folding is not common subexpression elimination. Folding evaluates arithmetic at compile time; elimination reuses a previously computed value.'
    }
  ]
};
