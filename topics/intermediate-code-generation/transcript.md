# Intermediate Code Generation — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/intermediate-code-generation/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Why an intermediate form exists

*0:00 – 0:30 · objective: See what an intermediate representation buys — machine independence, a shared optimiser and retargeting — and get the arithmetic that makes the case countable.*

**0:00–0:07** — The front end writes a form that names no machine. The back end turns it into one machine’s code.

> Caption: Intermediate code is the machine-independent form between the front end and the back end.

**0:07–0:15** — Twelve generators without the form. Four plus three plus one with it.

> Caption: M languages and N machines: one form turns M x N generators into M front ends plus N back ends.

Exam-trap caption mode adds: *The saving is in the optimiser and the code generators, not in the parsers.*

**0:15–0:22** — One optimiser, written once, reused by every compiler built on the form.

> Caption: The optimiser is written once on that form and reused by every compiler built on it.

**0:22–0:30** — Reuse of the machine-independent optimiser is the keyed purpose.

> Caption: GATE 2014 Set 3 asked this purpose and keyed the optimiser-reuse answer.

Exam-trap caption mode adds: *Register allocation is machine-dependent, so "improve register allocation" is not the answer.*

## Scene 2. The instruction forms

*0:30 – 1:00 · objective: Learn the six three-address forms and the rule that gives the form its name: one operator, at most three addresses, no machine named.*

**0:30–0:37** — One operator, at most two operands, one result.

> Caption: Three-address code: at most one operator per instruction, and at most three addresses.

**0:37–0:45** — Precedence is resolved before the form is written, so each instruction holds one operation.

> Caption: x = y + z * w is two instructions, not one: the order of evaluation must be explicit.

**0:45–0:52** — Binary, unary, copy, indexed load, and the two jumps.

> Caption: Six forms cover this lesson: binary, unary, copy, indexed load, and the two jumps.

**0:52–1:00** — Temporaries are names, not registers. The registers come later.

> Caption: Nothing here names a register or an instruction set, which is what machine-independent means.

Exam-trap caption mode adds: *A label is a position, not an operand. It is not one of the three addresses.*

## Scene 3. From a tree to instructions

*1:00 – 1:30 · objective: Watch a postorder walk turn (a+b)*(c+d) into three instructions with three temporaries, and see why the counts cannot disagree for a straight-line expression.*

**1:00–1:07** — Children before parent, left before right.

> Caption: Postorder walks the tree: left subtree, right subtree, then the operator.

**1:07–1:15** — One operator, one instruction, one fresh temporary.

> Caption: Each operator emits exactly one instruction and one new temporary.

**1:15–1:22** — Variables cost nothing; operators cost a temporary each.

> Caption: Leaves are source variables, so they cost no temporary at all.

**1:22–1:30** — Three operators, three instructions, three temporaries.

> Caption: Three operators give three instructions: t1 = a+b, t2 = c+d, t3 = t1*t2.

## Scene 4. How many temporaries at once

*1:30 – 2:00 · objective: Separate the three counts a question can mean — operators, fresh temporaries, live temporaries, registers — and see the page find the minimum by exhaustive search.*

**1:30–1:37** — How many are used, and how many are live at once, are two questions.

> Caption: The number of temporaries used and the number that must exist at once are different questions.

**1:37–1:45** — Two slots are enough, because the result may overwrite an operand that dies.

> Caption: (a+b)*(c+d) uses three names but never needs more than two live at once.

**1:45–1:52** — Every legal order, simulated, and the smallest peak kept.

> Caption: The page finds the minimum by trying every legal evaluation order, not by a formula.

**1:52–2:00** — Two temporaries, three registers. The wording decides which number is wanted.

> Caption: The register number counts leaves too, so a*b+c*d+e*f is 2 temporaries and 3 registers.

Exam-trap caption mode adds: *Read whether the question says temporaries or registers before you add one for the leaves.*

## Scene 5. Static single assignment

*2:00 – 2:30 · objective: Convert one expression into SSA form and see why the count becomes the operator count: eight for the expression GATE 2015 Set 1 keyed as 8.*

**2:00–2:07** — One definition per name, always.

> Caption: In static single assignment form every definition gets a name of its own.

**2:07–2:15** — Eight operators, eight names.

> Caption: So the count is the number of operators: eight for this expression.

**2:15–2:22** — The official answer is eight, and it is the operator count.

> Caption: GATE 2015 Set 1 keyed 8 for exactly this expression.

Exam-trap caption mode adds: *2 is the answer to the reuse question. It is wrong here because the question says SSA.*

**2:22–2:30** — Both forms, executed, compared with the tree.

> Caption: The page generates both forms and checks that each computes the same values.

## Scene 6. Indexing, pointers and calls

*2:30 – 3:00 · objective: Translate the forms that touch memory: an indexed load with its scale, a store through a pointer, and the param-call-return sequence.*

**2:30–2:37** — An index is not an address. The multiplication is an instruction.

> Caption: An indexed load hides an address calculation.

**2:37–2:45** — Scale by four, then load. Two instructions.

> Caption: x = a[i] is two instructions: t1 = i*4, then t2 = a[t1].

**2:45–2:52** — The multiplier is the size of one element.

> Caption: The scale is the element size, so an array of 24-byte records gives i*24.

Exam-trap caption mode adds: *The scale is the element size, not the array length.*

**2:52–3:00** — One param per argument, the call with its count, then the copy.

> Caption: A call emits one param per argument, then the call, then a copy of the result.

## Scene 7. Control flow as labels and jumps

*3:00 – 3:30 · objective: Translate a while loop, count its instructions, labels and jumps, check every target exists, and execute the result against the loop it came from.*

**3:00–3:07** — Test, body, exit. Three labels and a jump back.

> Caption: A loop becomes labels and jumps, with the test at the top.

**3:07–3:15** — Five instructions, three labels, three jumps.

> Caption: The while loop is five instructions, three labels and three jumps.

**3:15–3:22** — Collect the labels, collect the jumps, require every target to be found.

> Caption: Every jump target must be a label that exists, and the page checks all of them.

Exam-trap caption mode adds: *A label is a position, not an operand. Do not count it among the three addresses.*

**3:22–3:30** — Twenty-five input pairs, all agreeing with the loop.

> Caption: The page executes the code for 25 input pairs and matches max(x, n) every time.

## Scene 8. Short circuit in two contexts

*3:30 – 4:00 · objective: Translate one boolean condition in control context and in value context, and measure the difference: 7 against 14 instructions, and 4 against 16 evaluations of the second test.*

**3:30–3:37** — The second test is skipped when the first is false.

> Caption: a < b && c < d means: do not evaluate c < d unless a < b is true.

**3:37–3:45** — Seven instructions, and the second comparison runs four times in sixteen.

> Caption: In control context that is 7 instructions, and the second test runs in 4 cases out of 16.

**3:45–3:52** — Fourteen instructions, and both comparisons always run.

> Caption: In value context the truth values are built first: 14 instructions, and both tests always run.

**3:52–4:00** — Only the control translation keeps the promise.

> Caption: If c < d could divide by zero, only the control translation is safe.

Exam-trap caption mode adds: *Short circuit is a promise about evaluation, not an optimisation you may drop.*

## Scene 9. Quadruples, triples, indirect triples

*4:00 – 4:30 · objective: Store one instruction list three ways and see what each table costs and what each one makes easy.*

**4:00–4:07** — One list, three tables, one meaning.

> Caption: The same three instructions can be stored three ways.

**4:07–4:15** — Four fields against three, with the row number standing in for the name.

> Caption: Quadruples name the result; triples use the row number as the result.

**4:15–4:22** — The rows stay put and the pointer table moves.

> Caption: Indirect triples add a table of pointers so a pass can move or delete a row.

**4:22–4:30** — Insert a row and every later reference moves. The pointer table prevents that.

> Caption: Inserting a row breaks every triple reference after it; that is what the pointer table fixes.

Exam-trap caption mode adds: *In a triple, (1) means row 1, not the value 1.*

## Scene 10. The procedure

*4:30 – 5:00 · objective: Turn the whole topic into five steps, place the two verified previous-year numbers, and name the two checks that remove wrong options.*

**4:30–4:37** — SSA, plain code, or registers. The wording picks the count.

> Caption: Read the wording first: SSA, plain three-address code, or registers.

**4:37–4:45** — Operators for instructions, definitions for names.

> Caption: Then count operators for instructions, and definitions for SSA names.

**4:45–4:52** — Five inputs, five definitions, ten variables.

> Caption: GATE 2016 Set 1 asked for total SSA variables: 5 inputs plus 5 definitions, so 10.

Exam-trap caption mode adds: *The question asks for total variables, not temporaries: the five inputs count too.*

**4:52–5:00** — SSA or not, and whether labels count. Two questions before the counting.

> Caption: Two checks remove most wrong options before any arithmetic.

Exam-trap caption mode adds: *A count that ignores label rows is short by the number of labels.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
