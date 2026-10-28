/* ==========================================================================
   runtime-environments-intermediate-code-and-optimisation — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs — never edited by hand.

   Every number quoted in a caption is computed by the model in lesson.js and
   printed on the canvas; the two agree because both read the same computation.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'frame',
      n: 1,
      title: 'An activation record is one call, written down',
      start: 0, end: 30,
      objective: 'Name every field of an activation record, compute its size and offsets, and tell the control link from the access link.'
    },
    {
      id: 'recursion',
      n: 2,
      title: 'Recursion: one record per call, popped in reverse',
      start: 30, end: 60,
      objective: 'Trace fact of 3 on the stack, and read the call order as a preorder and the return order as a postorder traversal of the activation tree.'
    },
    {
      id: 'scoping',
      n: 3,
      title: 'Static and dynamic scoping: two links, two answers',
      start: 60, end: 90,
      objective: 'Resolve a free name through the access link under static scoping and through the control link under dynamic scoping, and get both printed values right.'
    },
    {
      id: 'params',
      n: 4,
      title: 'Parameter passing decides what the callee can change',
      start: 90, end: 120,
      objective: 'Simulate call by value, by reference and by value-result, and know which one lets a swap function work.'
    },
    {
      id: 'tac',
      n: 5,
      title: 'Intermediate code: one operator per statement',
      start: 120, end: 150,
      objective: 'Turn an expression into three-address code, then write the same statements as quadruples and as triples.'
    },
    {
      id: 'blocks',
      n: 6,
      title: 'Basic blocks: find the leaders, count the blocks',
      start: 150, end: 180,
      objective: 'Apply the three leader rules to a seventeen-statement sequence and partition it into basic blocks.'
    },
    {
      id: 'localopt',
      n: 7,
      title: 'Local optimisation: five passes that must preserve meaning',
      start: 180, end: 210,
      objective: 'Fold constants, propagate copies, delete dead assignments and reduce strength, then check the block still computes the same value.'
    },
    {
      id: 'dag',
      n: 8,
      title: 'Common subexpressions: one node per distinct value',
      start: 210, end: 240,
      objective: 'Build the DAG of a basic block by value numbering, count its nodes, and see which statements vanish.'
    },
    {
      id: 'liveness',
      n: 9,
      title: 'Liveness: a backward analysis that reaches a fixed point',
      start: 240, end: 270,
      objective: 'Write the use and def sets, iterate the two liveness equations from empty sets, and read the register count off the largest live set.'
    },
    {
      id: 'forward',
      n: 10,
      title: 'The mirror image, and the checklist',
      start: 270, end: 300,
      objective: 'Contrast available expressions with liveness on direction, meet operator and boundary, then carry one checklist across the whole topic.'
    }
  ],

  events: [

    /* ---------------- scene 1: the activation record ---------------- */
    {
      id: 'ar-1', scene: 'frame', start: 0, end: 7.5,
      caption: 'Every call gets its own record on the stack, pushed on entry and popped on return.',
      detail: 'An activation record, also called a stack frame, is the block of memory that holds everything one execution of a procedure needs: where to return to, which frame called it, where its own enclosing scope lives, its parameters, its local variables and the temporaries the code generator invented. A fresh record is allocated for each activation, so two calls to the same procedure have two separate records and cannot interfere.',
      narration: 'When a procedure is called, the machine sets aside one block of memory for that single execution. It is called an activation record, or a stack frame. Everything the call needs lives there: where to return, who called, the parameters, the locals and the temporaries. Two calls to the same procedure get two separate records.',
      keyword: 'one record per call',
      trap: 'A frame is per activation, not per procedure. Reading "the activation record of f" as if there were only one is the first error in most of these questions.'
    },
    {
      id: 'ar-2', scene: 'frame', start: 7.5, end: 15,
      caption: 'Nine fields, forty-four bytes: three parameters, the return address, two links, the return value, two locals, two temporaries.',
      detail: 'Taking a four-byte word, the incoming actual parameters take three words, twelve bytes. The return address takes one word. The control link and the access link take one word each. The slot for the return value takes one word. Two locals take eight bytes and two temporaries take eight bytes. Twelve plus four plus four plus four plus four plus eight plus eight is forty-four bytes.',
      narration: 'Here is one layout, with four-byte words. Three parameters take twelve bytes. The return address takes four. Two links take four each. The return value takes four. Two locals take eight, and two temporaries take eight. The frame is forty-four bytes, and that is simply the sum of its parts.',
      keyword: 'forty-four bytes',
      trap: 'The size of a frame is not a fixed number. It depends on the word size, the number of parameters, the number of locals and the number of temporaries the code generator needs.'
    },
    {
      id: 'ar-3', scene: 'frame', start: 15, end: 22.5,
      caption: 'The control link points at the caller; the access link points at the lexically enclosing procedure.',
      detail: 'The control link, also called the dynamic link, points to the record of the procedure that made the call. Following control links walks the dynamic chain, which is the history of who called whom. The access link, also called the static link, points to the record of the procedure that textually encloses this one. Following access links walks the static chain, which is the nesting written in the source program. In a language without nested procedures, such as C, the access link is not needed at all.',
      narration: 'Two pointers, two different jobs. The control link points at the caller, and the chain of control links is the history of calls. The access link points at the procedure that encloses this one in the source text, and that chain is the nesting you can see by reading the program. C has no nested functions, so in C the access link is unnecessary.',
      keyword: 'caller against enclosing scope',
      trap: 'Swapping the two is the standard mistake. Control link equals dynamic equals caller. Access link equals static equals enclosing scope.'
    },
    {
      id: 'ar-4', scene: 'frame', start: 22.5, end: 30,
      caption: 'Offsets are measured from the frame pointer, and every field starts at its own offset.',
      detail: 'With the frame pointer placed at the control link, the three parameters sit above it at offsets twelve, sixteen and twenty; the return address is at plus four; the control link is at zero; the access link is at minus four; the return value at minus eight; the two locals at minus twelve and minus sixteen; and the two temporaries at minus twenty and minus twenty-four. The model checks that the nine fields have nine distinct start offsets and that the span they occupy is exactly the forty-four bytes computed from the field sizes.',
      narration: 'The frame pointer is a register that holds one address inside the frame, and every field is reached as an offset from it. Above the pointer are the caller-pushed parameters and the return address. Below it are the links, the return value, the locals and the temporaries. Nine fields, nine distinct offsets, forty-four bytes.',
      keyword: 'offsets from the frame pointer',
      trap: 'A question that gives field sizes and asks for a frame size wants the sum, not the largest field, and not the sum plus one word unless a padding rule is stated.'
    },

    /* ---------------- scene 2: recursion ---------------- */
    {
      id: 'rc-1', scene: 'recursion', start: 30, end: 37.5,
      caption: 'fact of three pushes four fact frames above main, each with its own copy of n.',
      detail: 'The call main, then fact of three, then fact of two, then fact of one, then fact of zero. That is five records on the stack at the deepest point: one for main and four for fact. Each record has its own slot for the parameter n, holding three, two, one and zero respectively. Because the records are separate, no call overwrites another call\'s n.',
      narration: 'Calling fact of three pushes a frame for fact of three. That call calls fact of two, which pushes another frame, and so on down to fact of zero. At the deepest point there are five frames: main, and four calls of fact. Each one has its own n, holding three, two, one and zero.',
      keyword: 'five frames at the deepest point',
      trap: 'Recursion does not need a heap. It needs a stack, because the records are freed in the reverse of the order they were created.'
    },
    {
      id: 'rc-2', scene: 'recursion', start: 37.5, end: 45,
      caption: 'The order of calls is a preorder traversal of the activation tree; that is GATE 2021 Set 1.',
      detail: 'An activation tree has one node per activation, with the caller as the parent of the callee. The moment a procedure is entered is the moment its node is visited, and a parent is always entered before any of its children, so the sequence of entries is a preorder traversal. In this tree the preorder is main, fact of three, fact of two, fact of one, fact of zero.',
      narration: 'Draw one node for each activation and join each callee to its caller. A node is visited when the procedure is entered, and a parent is always entered before its children. So the order of calls is a preorder traversal of that tree. Here it is main, then three, two, one, zero.',
      keyword: 'calls are preorder',
      trap: 'The tree has one node per call, not one node per procedure. Four calls of fact give four nodes.'
    },
    {
      id: 'rc-3', scene: 'recursion', start: 45, end: 52.5,
      caption: 'The order of returns is a postorder traversal, and the values come back as one, one, two, six.',
      detail: 'A procedure returns only after all of its children have returned, so the moment of return visits a node after every node below it, which is a postorder traversal. fact of zero returns one, fact of one returns one times one, fact of two returns two times one, and fact of three returns three times two, which is six. The model checks that this recursive product equals the iterative product of one, two and three.',
      narration: 'A procedure cannot return before the calls it made have returned, so the returns visit the tree from the bottom up: a postorder traversal. Zero returns one. One returns one times one. Two returns two times one. Three returns three times two, which is six, and that matches the product computed in a loop.',
      keyword: 'returns are postorder',
      trap: 'Do not read the return values in the order they are printed on the way down. The multiplications happen on the way back up.'
    },
    {
      id: 'rc-4', scene: 'recursion', start: 52.5, end: 60,
      caption: 'A frame is freed only after the call it is waiting on returns, so the stack is a stack.',
      detail: 'The record for fact of three must stay alive while fact of two runs, because it still needs its own n to finish the multiplication. That is exactly the last-in, first-out discipline. It is also why static allocation of all data areas makes recursion impossible: with one fixed slot per procedure, the second call would overwrite the first call\'s state.',
      narration: 'The frame for fact of three cannot be thrown away while fact of two is running, because it still needs its own n to finish the multiplication. So frames are released in the reverse of the order they were created. That is why recursion forces dynamic allocation on a stack, and why giving each procedure one fixed slot makes recursion impossible.',
      keyword: 'last in, first out',
      trap: '"Dynamic allocation" here means on the run-time stack, not on the heap. A stack is enough for recursion; a heap is not required.'
    },

    /* ---------------- scene 3: scoping ---------------- */
    {
      id: 'sc-1', scene: 'scoping', start: 60, end: 67.5,
      caption: 'The 2016 program: a global a, a local a inside m, and n reading an a it never declares.',
      detail: 'The program sets a equal to three at the top level. Procedure m takes a parameter y, assigns one to a, which declares a local a inside m, then sets that local a to y minus a, and calls n with its own local a. Procedure n takes x, multiplies it by a, prints x, and returns. The only question is which a the body of n sees: the global one, or the one in the frame of m.',
      narration: 'Here is the program from the paper. There is a global a equal to three. Inside m there is a parameter y and a local a that starts at one and becomes y minus a. Then m calls n, passing its own local a. Inside n there is no declaration of a at all, so the whole question is which a n means.',
      keyword: 'which a does n see',
      trap: 'The assignment a equals one inside m declares a new local. It does not update the global, and that single fact decides the whole trace.'
    },
    {
      id: 'sc-2', scene: 'scoping', start: 67.5, end: 75,
      caption: 'Static scoping follows the access link to the global a, which is three, so x becomes six and both prints show six.',
      detail: 'Under static scoping a name is resolved in the textually enclosing scope, whatever the call history. Procedure n is written at the top level, so its free a is the global a, whose value is three. The call passed two by reference, so x and the local a of m are the same cell; x becomes two times three, which is six, and the print inside n shows six. Back in m, its local a has also become six, so the second print shows six as well.',
      narration: 'Under static scoping, a name means whatever it means where the procedure is written. n is written at the top level, so its a is the global a, which is three. x is two, and two times three is six. Because the parameter was passed by reference, that write lands in the frame of m too, so both prints show six.',
      keyword: 'six and six',
      trap: 'The value printed inside n is not the value of the caller\'s a. It is the value of x after the multiplication, which happens to be the same cell.'
    },
    {
      id: 'sc-3', scene: 'scoping', start: 75, end: 82.5,
      caption: 'Dynamic scoping follows the control link to the a in m, which is two, so x becomes four and both prints show four.',
      detail: 'Under dynamic scoping a name is resolved in the most recent activation record on the call chain that has that name. The chain at the moment n runs is n, then m, then main, then the globals. Procedure m has an a equal to two, so that is the one n uses: x becomes two times two, which is four, and four is printed. Because x aliases the local a of m, m then prints four as well. This is the answer the paper records.',
      narration: 'Under dynamic scoping, a name is looked up in the frames that are actually active, newest first. The newest frame that has an a is m, where a is two. So x becomes two times two, which is four. That write goes into m as well, so m prints four. The answer is four and four.',
      keyword: 'four and four',
      trap: 'The tempting answer six and two comes from resolving the name dynamically but forgetting that the reference parameter made the two cells one.'
    },
    {
      id: 'sc-4', scene: 'scoping', start: 82.5, end: 90,
      caption: 'One program, two rules, two answers: static gives six and six, dynamic gives four and four.',
      detail: 'The page runs both scoping rules over the same program with the same pass-by-reference semantics and records the pair of printed values. Static scoping produces six and six; dynamic scoping produces four and four. Neither rule produces six and two, which is what you get if you switch the lookup rule but keep thinking of the two variables as separate. The model checks that the two answers differ and that each equals the pair derived by hand.',
      narration: 'Same program, same parameters, two rules. Static scoping gives six and six. Dynamic scoping gives four and four. The pair six and two belongs to no rule at all: it is what you get if you change the lookup and forget the aliasing.',
      keyword: 'six, six against four, four',
      trap: 'C, Java, Python and JavaScript all use static scoping. Dynamic scoping appears in this paper only because the question says to assume it.'
    },

    /* ---------------- scene 4: parameter passing ---------------- */
    {
      id: 'pp-1', scene: 'params', start: 90, end: 97.5,
      caption: 'Call by value copies the argument, so the callee can change only its own copy.',
      detail: 'With call by value the actual argument is evaluated and its value is copied into the parameter slot of the new record. The callee therefore has a private variable that happens to start with the same value. A swap procedure receives two copies, exchanges them inside its own record, and returns; the caller\'s variables are untouched, so the caller still sees one and two.',
      narration: 'Call by value copies the value into the callee\'s frame. So a swap procedure receives two copies, swaps its own copies, and throws them away on return. The caller still has one and two. The procedure looks correct and does nothing.',
      keyword: 'copies in',
      trap: 'C passes everything by value. To get a reference effect in C you pass a pointer, which is still a value that happens to be an address.'
    },
    {
      id: 'pp-2', scene: 'params', start: 97.5, end: 105,
      caption: 'Call by reference copies the address, so the parameter and the argument are one cell.',
      detail: 'With call by reference the parameter slot holds the address of the caller\'s variable, so every read and write inside the callee reaches the caller\'s storage. The swap now works: after the call the caller sees two and one. This is also what makes the 2016 scoping question interesting, because a write to x inside n lands in the frame of m.',
      narration: 'Call by reference puts the address of the caller\'s variable in the frame, so the parameter and the argument are the same cell seen through two names. Now the swap works: two and one. And this is exactly why the scoping question has two prints that agree instead of differing.',
      keyword: 'aliases, not copies',
      trap: 'A reference parameter is an alias. Two names for one cell means a write through either name is visible through the other, and that is the whole of aliasing.'
    },
    {
      id: 'pp-3', scene: 'params', start: 105, end: 112.5,
      caption: 'Call by value-result copies in and copies back at return, so it differs from reference when two parameters alias.',
      detail: 'Call by value-result, also called copy-in copy-out, copies the argument in at entry and copies the parameter back to the argument at exit. For the swap it gives the same answer as call by reference, two and one. It differs when the same variable reaches two parameters: with call by reference the last write wins through the alias, while with value-result the two copies are restored in a fixed order and one silently overwrites the other.',
      narration: 'Value-result copies the argument in at entry and copies the result back at exit. For a swap that is indistinguishable from reference. It separates when one variable is passed twice: with a reference the two names are one cell, and with value-result the two copies are written back one after the other, so one of them is lost.',
      keyword: 'copy in, copy out',
      trap: 'If a question says value-result and passes the same variable to two parameters, the answer depends on the order of the copy-backs, which is usually stated.'
    },
    {
      id: 'pp-4', scene: 'params', start: 112.5, end: 120,
      caption: 'Two questions decide every parameter question: which mechanism, and is any argument passed twice.',
      detail: 'The mechanism decides whether a write inside the callee is visible outside. The aliasing question decides whether two parameters can interfere. The model simulates all three mechanisms on the same swap call and records the caller\'s values afterwards: unchanged for value, exchanged for reference, exchanged for value-result.',
      narration: 'So ask two things. Which mechanism is it: value, reference, or value-result. And is any single variable passed to two different parameters, which is where the mechanisms stop agreeing. Those two questions settle every parameter-passing question in this paper.',
      keyword: 'mechanism, then aliasing',
      trap: 'The word "reference" in a C question means a pointer. Do not assume C has reference parameters; it does not.'
    },

    /* ---------------- scene 5: three-address code ---------------- */
    {
      id: 'tac-1', scene: 'tac', start: 120, end: 127.5,
      caption: 'One operator per statement: the tree for a plus b times c minus d becomes four statements.',
      detail: 'The expression is a plus b, times c minus d. Each internal node of the expression tree becomes one statement whose right-hand side has at most one operator, and each temporary holds one intermediate value. The four statements are: t1 equals a plus b; t2 equals c minus d; t3 equals t1 times t2; x equals t3. A statement with at most one operator is the definition of three-address code, and it is what makes each step easy to reorder and analyse.',
      narration: 'Take the expression a plus b, times c minus d. Every operator becomes its own statement, and every intermediate value gets a name. So t1 is a plus b, t2 is c minus d, t3 is t1 times t2, and x is t3. Four statements, one operator each.',
      keyword: 'at most one operator',
      trap: 'Three-address code is not the same as machine code. The number of temporaries is unlimited, which is exactly what register allocation later has to fix.'
    },
    {
      id: 'tac-2', scene: 'tac', start: 127.5, end: 135,
      caption: 'Quadruples give the result a name; triples give the result a position instead.',
      detail: 'A quadruple has four fields: the operator, the first operand, the second operand and the result. A triple has three: the operator and the two operands, where an operand may be a pointer to the position of an earlier triple. So the same four statements are four quadruples, and four triples whose third and fourth entries refer back to positions zero and one. Triples save the result field but make the code hard to reorder, because a position changes when statements move.',
      narration: 'There are two ways to write the same statements down. A quadruple names the result: operator, operand, operand, result. A triple drops the name and refers to the result by its position in the list, so position two is the multiplication of positions zero and one. Triples are shorter, and much harder to reorder.',
      keyword: 'name against position',
      trap: 'In a triple, an operand that is a number can be a constant or a position. Questions that mix the two conventions are decided by reading whether the table has a result column.'
    },
    {
      id: 'tac-3', scene: 'tac', start: 135, end: 142.5,
      caption: 'Intermediate code is machine-independent, which is why the optimiser can be reused for another target.',
      detail: 'GATE 2014 Set 3 asks for the purpose of intermediate code and the answer is that it increases the chance of reusing the machine-independent code optimiser in other compilers. The front end produces it from the source language and the back end consumes it for a target machine, so a new target needs a new back end only. Register allocation is not the reason: it is machine-dependent and happens later.',
      narration: 'Why bother with a middle language at all. Because it is independent of both the source language and the target machine. Write the optimiser once against the intermediate code, and reuse it when you retarget the compiler. Register allocation is not the reason, because registers belong to the target.',
      keyword: 'one optimiser, many targets',
      trap: 'Intermediate code does not make parsing easier and does not improve error messages. Both happen before it exists.'
    },
    {
      id: 'tac-4', scene: 'tac', start: 142.5, end: 150,
      caption: 'Four statements, four quadruples, and the same value as the tree for every input the model tries.',
      detail: 'The model evaluates the expression tree directly and the quadruple sequence step by step for a set of sample inputs, and requires the two answers to agree. For a equal to two, b equal to three, c equal to five and d equal to one, the tree gives five times four, which is twenty, and the quadruple sequence gives the same twenty. That check is what licenses every later transformation: if a rewrite preserves the value here, it is a candidate optimisation.',
      narration: 'The page checks the representation rather than trusting it. It evaluates the original tree and the four statements on the same inputs and requires the same answer. For two, three, five and one, both give twenty. That equality is the standard every optimisation is later held to.',
      keyword: 'same value, checked',
      trap: 'A representation change must preserve the value. If a rewrite changes the answer for any input, it is a bug, not an optimisation.'
    },

    /* ---------------- scene 6: basic blocks ---------------- */
    {
      id: 'bb-1', scene: 'blocks', start: 150, end: 157.5,
      caption: 'A basic block has exactly one entry, at its first statement, and one exit, at its last.',
      detail: 'A basic block is a maximal straight-line sequence: control enters only at the first statement and leaves only after the last. Nothing inside it can be a jump target and nothing inside it can jump out. That is what makes the whole block analysable as one unit, because every statement in it executes if the first one does.',
      narration: 'A basic block is a run of statements with one way in and one way out. Control enters at the top, runs straight through, and leaves at the bottom. No jump lands in the middle and none leaves from the middle. That is why a whole block can be analysed as one object.',
      keyword: 'one way in, one way out',
      trap: 'A block is maximal. If two adjacent statements satisfy the condition, they are in the same block, and splitting them would over-count.'
    },
    {
      id: 'bb-2', scene: 'blocks', start: 157.5, end: 165,
      caption: 'Three rules find the leaders: the first statement, every jump target, and every statement after a jump.',
      detail: 'The first statement of the program is a leader. Every statement that is the target of a conditional or unconditional jump is a leader. Every statement that immediately follows a conditional or unconditional jump is a leader. Each leader begins a block, and the block runs to the statement before the next leader. Those three rules are the whole algorithm, and they are what the paper expects you to apply mechanically.',
      narration: 'Three rules and nothing else. The first statement is a leader. Every jump target is a leader. Every statement right after a jump is a leader. Each leader starts a block, and the block runs until the next leader. Apply them in that order and the partition is forced.',
      keyword: 'first, target, after a jump',
      trap: 'Forgetting the statement after a jump is the commonest slip. A jump out ends a block even if nothing jumps to the next line.'
    },
    {
      id: 'bb-3', scene: 'blocks', start: 165, end: 172.5,
      caption: 'The GATE 2025 sequence has six leaders, so it has six basic blocks, holding one, one, seven, two, one and five statements.',
      detail: 'The sequence runs from address 1001 to 1017. Statement 1001 is the first, so it leads. 1003 is the target of the jump at 1009, 1002 is the target of the jump at 1011, 1013 is the target of the jump at 1017, 1010 follows the jump at 1009, and 1012 follows the jump at 1011. That is six leaders and therefore six blocks, of sizes one, one, seven, two, one and five, which add to seventeen.',
      narration: 'Here is the sequence from the 2025 paper, from address 1001 to 1017. First statement leads. Then the three jump targets: 1003, 1002 and 1013. Then the two statements that follow a jump: 1010 and 1012. Six leaders, so six blocks, of sizes one, one, seven, two, one and five. They add to seventeen.',
      keyword: 'six blocks',
      trap: 'Count blocks, not leaders, only after you have checked whether two leaders are adjacent. Here they are not, so the two counts agree at six.'
    },
    {
      id: 'bb-4', scene: 'blocks', start: 172.5, end: 180,
      caption: 'The partition is checked: every statement lies in exactly one block, and no block is entered in the middle.',
      detail: 'The model computes the leaders from the jump structure, builds the partition, and then checks that the blocks cover all seventeen statements exactly once, that every block is contiguous in address order, and that no statement inside a block other than its first is a jump target. Those three checks are what make the count trustworthy rather than remembered.',
      narration: 'The page does not just print six. It builds the partition and checks it: every one of the seventeen statements appears exactly once, each block is contiguous, and nothing jumps into the middle of a block. A count that survives those checks is a count you can defend.',
      keyword: 'partition checked',
      trap: 'A sequence with two adjacent leaders, such as a jump target immediately after a jump, gives one block of one statement. Do not merge it away.'
    },

    /* ---------------- scene 7: local optimisation ---------------- */
    {
      id: 'lo-1', scene: 'localopt', start: 180, end: 187.5,
      caption: 'Fold the constants first: four times five becomes twenty, and that exposes a statement nobody uses.',
      detail: 'Constant folding evaluates an expression whose operands are all known at compile time, so four times five becomes twenty. Once it is folded, the temporary that holds twenty turns out never to be read, because the rest of the block recomputes what it needs from the input. Folding is cheap, always safe, and it is the pass that makes the later passes see dead code.',
      narration: 'The first pass evaluates arithmetic on constants. Four times five becomes twenty. And once that is folded, the temporary holding it is never read, so a statement that looked useful is now dead. Folding is always safe, and it exposes work for the passes that follow.',
      keyword: 'fold first',
      trap: 'Constant folding is not common subexpression elimination. Four times five becoming twenty appears in GATE 2014 Set 1 precisely as the false option.'
    },
    {
      id: 'lo-2', scene: 'localopt', start: 187.5, end: 195,
      caption: 'Propagate constants and copies, then delete every assignment whose variable is not live afterwards.',
      detail: 'Constant propagation replaces a use of a variable by the constant it must hold at that point. Copy propagation replaces a use of a variable by the variable it was copied from, which lets the copy itself be deleted. Dead code elimination then removes any assignment to a variable that is not live after it. Each of these three passes reads a fact that the data-flow analysis supplies, and each is a rewrite that must preserve the block\'s meaning.',
      narration: 'Next, propagate: if a variable must hold twenty at this point, write twenty. If a variable was just a copy of another, use the original. Then delete assignments to variables nobody reads again. Three passes, and every one of them is licensed by a fact the analysis provides, not by a guess.',
      keyword: 'propagate, then delete',
      trap: 'Dead code elimination needs liveness. Deleting an assignment because the variable is not read later in the block is wrong if a later block reads it.'
    },
    {
      id: 'lo-3', scene: 'localopt', start: 195, end: 202.5,
      caption: 'Strength reduction trades a multiplication by a small constant for an addition: two times i becomes i plus i.',
      detail: 'Multiplication by a power of two is a shift, and multiplication by two is an addition of a value to itself. Both are cheaper than a multiply on many machines, so a compiler replaces the expensive operation with the cheap one. The transformation is local, it needs no analysis, and it is safe whenever the arithmetic is exact, which is why a question about overflow can change the answer.',
      narration: 'Strength reduction replaces an expensive operation with a cheap one. Two times i is i plus i, and a shift would do as well. On most machines that is cheaper than a multiply. It needs no analysis at all, and it is safe as long as the arithmetic does not overflow.',
      keyword: 'cheaper operation',
      trap: 'For signed integers with overflow, a shift and a multiply can differ. A question that says the arithmetic is exact is telling you which answer it wants.'
    },
    {
      id: 'lo-4', scene: 'localopt', start: 202.5, end: 210,
      caption: 'Nine statements become four, and both versions are checked to compute the same value for every input tried.',
      detail: 'The block starts with nine statements and ends with four: the strength-reduced multiply, the addition, the product of the common subexpression with itself, and the final copy. The model runs both versions on nine different values of the input and requires identical results each time, so the rewrite is verified rather than asserted. A pass that changed any of those results would be reported as a failure under the canvas.',
      narration: 'Nine statements in, four out. And the page checks the rewrite rather than trusting it: both versions are run on nine different inputs and must agree every time. If a pass broke one of them, the check under the canvas would go red. That is the standard every optimisation has to meet.',
      keyword: 'nine in, four out',
      trap: 'Fewer statements is not automatically better. A pass that changes the answer is a bug, and a pass that adds more work than it removes is a pessimisation.'
    },

    /* ---------------- scene 8: the DAG ---------------- */
    {
      id: 'dg-1', scene: 'dag', start: 210, end: 217.5,
      caption: 'Value numbering notices that b plus c is computed twice and a plus one is computed twice.',
      detail: 'The block is: a equals b plus c; e equals a plus one; d equals b plus c; f equals d plus one; g equals e plus f. Give every distinct expression a number. b plus c is number one. a plus one, where a is the result of number one, is number two. The third statement computes b plus c again, which is number one, so d is just another name for it. The fourth computes d plus one, which is number two, so f is another name for that. The fifth adds two and two, which is number three.',
      narration: 'Five statements. Number the distinct expressions. b plus c is the first. a plus one is the second. The third statement is b plus c again, so it is the first expression under a new name. The fourth is the second expression under a new name. The fifth adds the second expression to itself, and that is the third.',
      keyword: 'one number per expression',
      trap: 'The numbering must use the current value of each variable. If an operand was redefined, the expression is a different one.'
    },
    {
      id: 'dg-2', scene: 'dag', start: 217.5, end: 225,
      caption: 'The DAG reuses one node per distinct expression, and a second definition becomes a second label on the same node.',
      detail: 'A node in the DAG is either a leaf, which is an initial value of a variable or a constant, or an interior node, which is an operator applied to two nodes. When a statement computes an expression that already has a node, no new node is created; the defined variable is simply added to the label set of the existing node. That is local common subexpression elimination, and it is exactly what value numbering found.',
      narration: 'A DAG has leaves for the values that come in, and one interior node per distinct operator applied to two nodes. When a statement recomputes an expression that already has a node, nothing new is built: the new variable just joins the label on that node. That reuse is common subexpression elimination, done locally.',
      keyword: 'labels, not new nodes',
      trap: 'A leaf is created for each distinct initial value and each distinct constant. Two uses of the constant one share one leaf.'
    },
    {
      id: 'dg-3', scene: 'dag', start: 225, end: 232.5,
      caption: 'Five statements give a DAG of six nodes: three leaves for b, c and one, and three operator nodes.',
      detail: 'The leaves are b, c and the constant one, which is three nodes. The interior nodes are the addition of b and c, the addition of that with one, and the addition of the second with itself, which is three more. Six nodes in total, and that is the answer the 2021 paper records for this block. The count is not the statement count, and it is not the number of distinct variables either.',
      narration: 'Count the nodes. Three leaves: b, c and the constant one. Three operators: b plus c, then plus one, then the sum added to itself. Six nodes. That is the number the paper asks for, and it is neither the statement count nor the variable count.',
      keyword: 'six nodes',
      trap: 'The constant one appears twice in the statements and is one leaf. Counting it twice gives seven and loses the mark.'
    },
    {
      id: 'dg-4', scene: 'dag', start: 232.5, end: 240,
      caption: 'Two statements disappear, and the model checks that the DAG computes the same final value as the original code.',
      detail: 'Statements three and four become label attachments rather than computations, so two of the five statements are eliminated. The model evaluates the original five statements and the DAG for several values of b and c and requires the same g. It also checks that the node count equals the number of leaves plus the number of distinct operators, which is the identity a DAG must satisfy by construction.',
      narration: 'Two statements vanish: the ones that recomputed an expression already in the DAG. And the page checks the DAG against the original: same final value for several inputs, and a node count that equals leaves plus distinct operators. A picture of a DAG is not evidence; those two checks are.',
      keyword: 'two statements gone',
      trap: 'A DAG is a picture of the block, not a proof of correctness. The value check is what makes the picture trustworthy.'
    },

    /* ---------------- scene 9: liveness ---------------- */
    {
      id: 'lv-1', scene: 'liveness', start: 240, end: 247.5,
      caption: 'A variable is live at a point when some path from there reaches a use without redefining it first.',
      detail: 'The definition has three parts: there is a later statement that uses the variable, there is a path from here to that statement in the flow graph, and along that path there is no assignment to the variable. If all three hold, the current value matters and must be kept. If no such path exists, the value can be discarded. This is a may analysis: one path is enough, so the information at a join is the union.',
      narration: 'A variable is live at a point if its value may still be needed. Three conditions: some later statement uses it, some path from here reaches that statement, and nothing on that path reassigns it first. If all three hold, keep the value. One path is enough, so where paths meet, we take the union.',
      keyword: 'some path to a use',
      trap: 'Liveness is a may analysis and uses union. Available expressions is a must analysis and uses intersection. Mixing them up is the most expensive error in this topic.'
    },
    {
      id: 'lv-2', scene: 'liveness', start: 247.5, end: 255,
      caption: 'The two equations run backwards: IN is use union the difference of OUT and def, and OUT is the union of the successors\' IN.',
      detail: 'For one statement, the variables live on entry are the variables it uses, together with the variables live on exit that it does not define. So IN equals use union (OUT minus def). For a block, the variables live on exit are exactly those live on entry to any successor, so OUT equals the union over successors of their IN. Because OUT depends on the successors and IN depends on OUT, the information travels from the end of the program towards the beginning, which is why liveness is called a backward analysis.',
      narration: 'Two equations. Live on entry means used here, plus whatever was live on exit that this statement does not redefine. Live on exit means live on entry to any successor, all of them unioned together. Since exit depends on the successors, the information flows from the end back towards the start. That is why it is called backward.',
      keyword: 'IN from OUT, backwards',
      trap: 'Subtracting def from IN instead of from OUT is a sign that the direction was misread. def removes what the statement itself kills, on the way out.'
    },
    {
      id: 'lv-3', scene: 'liveness', start: 255, end: 262.5,
      caption: 'Starting from empty sets, two rounds reach a fixed point; a third round changes nothing.',
      detail: 'Because the loop in the flow graph sends control backwards, one pass is not enough: a variable used at the top of the loop becomes live at the bottom only after the first round has propagated it. The model iterates from all-empty sets, records the sets after each round, and stops when a round changes nothing. It then checks that the result really is a fixed point, by recomputing every set from the equations and finding the same values, and it checks that no smaller solution satisfies them.',
      narration: 'The flow graph has a back edge, so one pass is not enough. Start with every set empty and iterate. The first round gets most of it, the second round pushes the loop-carried variables round the back edge, and the third changes nothing. Then verify: plug the answer back into the equations and confirm nothing moves.',
      keyword: 'iterate to a fixed point',
      trap: 'Stopping after one backward pass gives a solution that satisfies no equation at the loop header. Always iterate until a round changes nothing.'
    },
    {
      id: 'lv-4', scene: 'liveness', start: 262.5, end: 270,
      caption: 'The largest live set holds two variables, so two registers suffice, and the interference graph needs two colours.',
      detail: 'The live sets across the flow graph are the sets containing c, a, b, both b and c, and both a and c. The largest has two members. Two variables that are live at the same point cannot share a register, so each such pair becomes an edge in the interference graph: a with c, and b with c. That graph is a path of three nodes, which two colours can colour. The model colours it greedily and checks that no interfering pair shares a colour and that the number of colours equals the largest live set.',
      narration: 'The live sets hold at most two variables at any point. Two variables live together cannot share a register, so join them in an interference graph. Here a interferes with c and b interferes with c, and a never meets b. Two colours do it, so two registers. The largest live set and the number of colours agree.',
      keyword: 'two registers',
      trap: 'The number of registers needed is the size of the largest live set, not the number of variables in the program. Three variables, two registers.'
    },

    /* ---------------- scene 10: the forward dual ---------------- */
    {
      id: 'fw-1', scene: 'forward', start: 270, end: 277.5,
      caption: 'Available expressions is the mirror image: it runs forwards and intersects at a join.',
      detail: 'An expression is available at a point when every path from the entry to that point computes it and no operand has been redefined since. Every path, so the information at a join is the intersection of what the predecessors offer. The transfer function adds the expressions the statement computes and removes those whose operands it redefines. The boundary is the entry, where only the initial expressions are available, and the exit starts as everything.',
      narration: 'Available expressions asks a different question with the same machinery. An expression is available if every path to this point computed it and nothing has changed its operands since. Every path, so at a join we intersect. It runs forwards, from the entry towards the exit, which is the exact mirror of liveness.',
      keyword: 'forwards, intersect',
      trap: 'Using union here claims an expression is available when only one path computed it, and that is how a wrong common subexpression elimination is produced.'
    },
    {
      id: 'fw-2', scene: 'forward', start: 277.5, end: 285,
      caption: 'Union at the join would say a plus b is available, although one path reassigned a.',
      detail: 'The example has a first block computing a plus b, then a branch: one path goes straight on and the other reassigns a before rejoining. Both paths computed a plus b at the start, but the second path kills it by redefining an operand. The intersection therefore excludes it, and the expression is not available at the join, so recomputing it there is required. A union would have kept it and produced a wrong answer, which the model reports as the trap case.',
      narration: 'Look at the example. The first block computes a plus b. Then a branch, and one arm reassigns a before the paths meet again. Every path did compute a plus b, but one path destroyed it. The intersection drops it, so it is not available and must be recomputed. The union keeps it, and that is the wrong answer.',
      keyword: 'one arm kills it',
      trap: 'Redefining either operand kills the expression. A question that redefines a and still calls a plus b available is testing exactly this.'
    },
    {
      id: 'fw-3', scene: 'forward', start: 285, end: 292.5,
      caption: 'Four questions classify any data-flow analysis: direction, meet, boundary, and what is killed.',
      detail: 'Ask whether the information flows forwards from the entry or backwards from the exit. Ask whether the meet at a join is union, for a may analysis, or intersection, for a must analysis. Ask what the boundary value is: the empty set at the exit for liveness, and the set of all expressions at the exit for available expressions. Ask what the transfer function kills: an assignment to a variable kills every expression containing it, and every fact about that variable.',
      narration: 'Four questions classify any analysis. Which way does the information flow? Union or intersection where paths meet? What is the boundary value? And what does a statement kill? Answer those four and you have written the equations, whatever the analysis is called.',
      keyword: 'four questions',
      trap: 'The boundary for available expressions is the universal set at the exit, not the empty set. Getting it backwards makes every expression look available at the end of the program.'
    },
    {
      id: 'fw-4', scene: 'forward', start: 292.5, end: 300,
      caption: 'One checklist for the whole topic: leaders, DAG nodes, live sets, register count.',
      detail: 'For the runtime half, name the record, count its fields, and follow the right link. For the intermediate half, apply the three leader rules and count blocks. For the optimisation half, number the expressions and count DAG nodes as leaves plus operators. For the analysis half, write use and def, iterate to a fixed point, and read the largest live set as the register count. Those four procedures settle every question this section has asked since 1988.',
      narration: 'One checklist. Records: name the fields and follow the right link. Blocks: three leader rules. DAG: leaves plus distinct operators. Analysis: use and def, iterate to a fixed point, and take the largest live set as the register count. Four procedures, and they cover every question this section has asked for three decades.',
      keyword: 'the checklist',
      trap: 'Do not memorise answers. Memorise the four procedures, because the numbers change every year and the procedures do not.'
    }
  ]
};
