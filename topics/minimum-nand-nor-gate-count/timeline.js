/* ==========================================================================
   minimum-nand-nor-gate-count - THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs - never edited by hand.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 348,

  scenes: [
    { id: 'why',       n: 1,  title: 'One function, three honest answers',                    start: 0,   end: 28  },
    { id: 'model',     n: 2,  title: 'A gate count is a property of a cost model',            start: 28,  end: 58  },
    { id: 'onegate',   n: 3,  title: 'What one gate buys, and what two cannot',               start: 58,  end: 88  },
    { id: 'table',     n: 4,  title: 'Every two-variable function, and what it costs',        start: 88,  end: 120 },
    { id: 'xor',       n: 5,  title: 'XOR: four gates, or three, depending on the inputs',    start: 120, end: 150 },
    { id: 'sop',       n: 6,  title: 'From a sum of products: one NAND per term, then expand', start: 150, end: 180 },
    { id: 'adder',     n: 7,  title: 'Two outputs share gates: the full adder in nine',       start: 180, end: 212 },
    { id: 'pyq2009',   n: 8,  title: 'GATE CSE 2009: AB + C in three NOR gates, and not two', start: 212, end: 240 },
    { id: 'pyq2017',   n: 9,  title: 'GATE CSE 2017: a map, a don&rsquo;t care, one NOR gate', start: 240, end: 266 },
    { id: 'pyq2019',   n: 10, title: 'GATE CSE 2019: the same three gates, one level up',     start: 266, end: 292 },
    { id: 'procedure', n: 11, title: 'The procedure, in the order that avoids the trap',      start: 292, end: 320 },
    { id: 'hold',      n: 12, title: 'One screen to hold',                                    start: 320, end: 348 }
  ],

  events: [
    /* ---- 1. why -------------------------------------------------------- */
    { id: 'w1', scene: 'why', start: 0, end: 7,
      caption: 'How many gates does a function need? The question has no single answer until you say what a gate is and what you are allowed to start with.',
      narration: 'How many gates does a function need? That question has no single answer until you say what a gate is, and what you are allowed to start with.',
      detail: 'The count is not a property of the function alone. Change the gate type, the fan-in limit, the inputs supplied, or whether sharing is allowed, and the number changes.',
      keyword: 'no single answer',
      trap: 'A bare number in an answer key is meaningless unless the question fixed the gate type and the fan-in. Read those words before counting.' },

    { id: 'w2', scene: 'why', start: 7, end: 14,
      caption: 'Take one function: A times B, or C. In two-input NAND gates with only A, B, C available it costs three.',
      narration: 'Take one function, A B plus C. Built from two-input NAND gates, with only A, B and C available, it costs three gates.',
      detail: 'The construction: one gate for the product AB, one gate to invert C, one gate to combine. Three gates, all verified on the eight rows.',
      keyword: 'three' },

    { id: 'w3', scene: 'why', start: 14, end: 21,
      caption: 'Hand it the complements for free and the same function costs two: the inverter disappears into the input.',
      narration: 'Now hand it the complements for free. The same function, the same gate type, costs two gates, because the inverter disappears into the input.',
      detail: 'With not-C available, NAND of not-AB with not-C is AB plus C. One gate fewer, and nothing about the function changed.',
      keyword: 'two',
      trap: 'This is the clause that decides several previous-year answers, and the one most often left unread: are the complements of the inputs available?' },

    { id: 'w4', scene: 'why', start: 21, end: 28,
      caption: 'Every number on this page is computed by the page, by exhaustive search over small circuits, and then re-checked by simulating the circuit on every row.',
      narration: 'Every number on this page is computed by the page itself, by exhaustive search over small circuits, and then re-checked by simulating the circuit on every input row.',
      detail: 'The search is not a heuristic: for one and two variables it visits every circuit up to the stated depth, so the minimum it reports is the minimum.',
      keyword: 'exhaustive search' },

    /* ---- 2. model ------------------------------------------------------ */
    { id: 'm1', scene: 'model', start: 28, end: 35,
      caption: 'Four settings fix the answer: which gate type, how many inputs a gate may have, which signals are free, and whether a signal may be reused.',
      narration: 'Four settings fix the answer. Which gate type. How many inputs one gate may have. Which signals arrive for free. And whether a computed signal may be reused.',
      detail: 'These are the four parameters of the cost model. A question that fixes none of them does not have an answer.',
      keyword: 'Four settings' },

    { id: 'm2', scene: 'model', start: 35, end: 42,
      caption: 'Two-input NAND only. A three-input NAND is not one gate: it is three two-input gates.',
      narration: 'Two-input NAND only. Then a three-input NAND is not one gate. It is three two-input gates, and a four-input one is five.',
      detail: 'Building a k-input NAND from two-input NAND gates takes 2k minus 3 gates for k at least 2. For k equal to 3 that is 3; for k equal to 4 it is 5. A k-input AND takes 2k minus 2.',
      keyword: 'three two-input gates',
      trap: 'Counting a four-input NAND as one gate is the single most common arithmetic slip in this topic. Expand every gate wider than the limit before you count.' },

    { id: 'm3', scene: 'model', start: 42, end: 49,
      caption: 'Only A, B, C available, or A, B, C and their complements? One gate buys three functions in the first case and nine in the second.',
      narration: 'Are only A, B and C available, or are their complements free as well? One gate buys three functions in the first case, and nine in the second.',
      detail: 'With only the literals, the one-gate functions of two variables are not-x, not-y and not-xy. With complements free, nine of the sixteen functions of two variables are one gate away.',
      keyword: 'nine' },

    { id: 'm4', scene: 'model', start: 49, end: 58,
      caption: 'Reuse allowed: a signal computed once may feed several gates. That is what makes two outputs cheaper together than apart.',
      narration: 'Reuse allowed. A signal computed once may feed several gates. That is what makes two outputs cheaper together than apart, and it is why the full adder is nine gates and not fourteen.',
      detail: 'Fan-out is free in this model. Every count on this page therefore charges a shared subexpression once, not once per use.',
      keyword: 'Reuse' },

    /* ---- 3. onegate ---------------------------------------------------- */
    { id: 'o1', scene: 'onegate', start: 58, end: 65,
      caption: 'One gate computes not of a product, or not of a sum. Nothing else. That is the whole of what a single gate can do.',
      narration: 'One gate computes not of a product, or not of a sum. Nothing else. That is the whole of what a single gate can do.',
      detail: 'A NAND gate outputs not-p-q; a NOR gate outputs not of p plus q. So a function is one gate exactly when it is the negation of a product, or of a sum, of two available signals.',
      keyword: 'Nothing else' },

    { id: 'o2', scene: 'onegate', start: 65, end: 72,
      caption: 'With only x and y available, three functions of two variables are one gate away. AND is not one of them; it takes two.',
      narration: 'With only x and y available, three functions of two variables are one gate away. AND is not one of them. AND takes two.',
      detail: 'Tying both inputs of a NAND gives not-x, so the inverter is free. But AND needs that inverter undone, which is a second gate.',
      keyword: 'three functions',
      trap: 'The inverter looks free because tying the inputs costs nothing, and then AND looks like one gate. It is two: one to make not-xy, one to invert it.' },

    { id: 'o3', scene: 'onegate', start: 72, end: 80,
      caption: 'The exhaustive search reports every depth. Of the sixteen functions of two variables, one needs five NAND gates and only one does.',
      narration: 'The exhaustive search reports every depth. Of the sixteen functions of two variables, exactly one needs five NAND gates, and only one does.',
      detail: 'The distribution with only the literals available: two functions need nothing, three need one gate, four need two, four need three, two need four, and one needs five.',
      keyword: 'five' },

    { id: 'o4', scene: 'onegate', start: 80, end: 88,
      caption: 'The one that costs five is exclusive-OR&rsquo;s complement. Its partner, exclusive-OR, costs four.',
      narration: 'The function that costs five is the complement of exclusive-OR. Its partner, exclusive-OR itself, costs four.',
      detail: 'This is where the familiar line comes from: XOR needs four two-input NAND gates. The next scene shows what happens to that line when the complements arrive for free.',
      keyword: 'four' },

    /* ---- 4. table ------------------------------------------------------ */
    { id: 't1', scene: 'table', start: 88, end: 96,
      caption: 'Here is every function of two variables against four cost models: NAND or NOR, with or without the complements supplied.',
      narration: 'Here is every function of two variables, against four cost models. NAND or NOR, and with or without the complements supplied.',
      detail: 'Each cell is an exhaustive minimum: the search visits every circuit up to that depth, so the number is a minimum and not a best attempt.',
      keyword: 'four cost models' },

    { id: 't2', scene: 'table', start: 96, end: 105,
      caption: 'Read the AND row: two NAND gates without complements, and still two with them. NOR gives three, or one.',
      narration: 'Read the AND row. Two NAND gates without complements, and still two with them. Under NOR it is three gates, or one when the complements are free.',
      detail: 'AND in NOR: not of not-x or not-y is x AND y, so with complements free it is a single NOR gate. In NAND no such shortcut exists, because NAND of the complements gives OR.',
      keyword: 'AND row' },

    { id: 't3', scene: 'table', start: 105, end: 113,
      caption: 'Read the XOR row: four NAND gates without complements, three with. The folklore four assumes you were not given the complements.',
      narration: 'Read the XOR row. Four NAND gates without complements, three with. The familiar four assumes you were not given the complements.',
      detail: 'With complements free, XOR is NAND of not-x-y with x-not-y, then one more gate. Three in total, and the exhaustive search confirms three is the minimum.',
      keyword: 'three with',
      trap: 'Answering four to a question that supplied the complements is the classic mark lost here. The number is not wrong in general; it answers a different question.' },

    { id: 't4', scene: 'table', start: 113, end: 120,
      caption: 'NAND and NOR swap under duality, and so do AND and OR with XOR and its complement. The counts are not the same function of the row.',
      narration: 'NAND and NOR swap under duality, and so do AND and OR, and XOR and its complement. But the counts are not the same function of the row.',
      detail: 'The NAND column of AND is two and of OR is three; the NOR column of OR is two and of AND is three. Under complements the columns differ again, and by more.',
      keyword: 'duality' },

    /* ---- 5. xor -------------------------------------------------------- */
    { id: 'x1', scene: 'xor', start: 120, end: 128,
      caption: 'Exclusive-OR is the standard worked example, because its two constructions differ by exactly one gate and both are in use.',
      narration: 'Exclusive-OR is the standard worked example, because its two constructions differ by exactly one gate, and both are in use.',
      detail: 'The four-gate circuit is the one in textbooks and in the older papers. The three-gate circuit needs the complements on the input side.',
      keyword: 'exactly one gate' },

    { id: 'x2', scene: 'xor', start: 128, end: 136,
      caption: 'Four gates: the first makes not-AB, then two gates push A and B against it, and the fourth combines them.',
      narration: 'Four gates. The first makes not of A B. Then two gates push A and B against it. The fourth combines the two results.',
      detail: 'Gate one: not-AB. Gate two: not of A and not-AB, which is not-A or AB. Gate three: the mirror in B. Gate four combines them into A exclusive-or B.',
      keyword: 'Four gates' },

    { id: 'x3', scene: 'xor', start: 136, end: 144,
      caption: 'Three gates: not-A-B, A-not-B, then one gate to combine. The saving is the two inverters the first circuit had to build.',
      narration: 'Three gates. Not-A with B, then A with not-B, then one gate to combine them. The saving is the two inverters that the first circuit had to build for itself.',
      detail: 'Both circuits are simulated on all four rows here. Both give the exclusive-OR truth table, and the search says no two-gate circuit does.',
      keyword: 'Three gates' },

    { id: 'x4', scene: 'xor', start: 144, end: 150,
      caption: 'So the honest statement is: four gates when you must build the complements, three when they arrive built.',
      narration: 'So the honest statement is this. Four gates when you must build the complements, three when they arrive already built.',
      detail: 'The same distinction moves XNOR from five NAND gates to three, and XOR from five NOR gates to three.',
      keyword: 'honest statement' },

    /* ---- 6. sop -------------------------------------------------------- */
    { id: 's1', scene: 'sop', start: 150, end: 158,
      caption: 'When the function arrives as a sum of products, the NAND-NAND pattern gives a count directly: one gate per product term, plus one to combine.',
      narration: 'When the function arrives as a sum of products, the NAND-NAND pattern gives a count directly. One gate per product term, plus one to combine them.',
      detail: 'Each product term becomes one NAND gate, because a NAND gate already contains the inversion the sum of products needs. The final combine is one more gate.',
      keyword: 'one gate per product term' },

    { id: 's2', scene: 'sop', start: 158, end: 166,
      caption: 'Two products of two literals: three gates. A B or C D costs three two-input NAND gates, and that is checked on all sixteen rows.',
      narration: 'Two products of two literals: three gates. A B or C D costs three two-input NAND gates, and that is checked on all sixteen rows.',
      detail: 'Gate one makes not-AB, gate two makes not-CD, gate three combines them into AB or CD. No complements were needed.',
      keyword: 'three gates' },

    { id: 's3', scene: 'sop', start: 166, end: 174,
      caption: 'Three products: the final gate now has three inputs, so it is three gates, not one. Six in total.',
      narration: 'Three products. The final gate now has three inputs, so it is three gates and not one. Six in total.',
      detail: 'Three product gates, then a three-input NAND expanded to three two-input gates: six. Counting the final gate as one would have given four, and four is wrong.',
      keyword: 'Six in total',
      trap: 'The final NAND is one gate only when the sum has two terms. With p terms it needs 2p minus 3 gates once p exceeds 2.' },

    { id: 's4', scene: 'sop', start: 174, end: 180,
      caption: 'This is the first place the minimal sum of products and the minimal gate count come apart, and the next scene is the second.',
      narration: 'This is the first place where the minimal sum of products and the minimal gate count come apart. The next scene is the second place.',
      detail: 'A cover with fewer terms is not automatically a circuit with fewer gates, and a cover with fewer literals is not either. The two costs are different.',
      keyword: 'come apart' },

    /* ---- 7. adder ------------------------------------------------------ */
    { id: 'a1', scene: 'adder', start: 180, end: 188,
      caption: 'A full adder has two outputs. Built separately they cost eight gates and six; built together, nine.',
      narration: 'A full adder has two outputs. Built separately they cost eight gates and six. Built together, nine.',
      detail: 'The sum is the three-way exclusive-OR. The carry is the majority of the three inputs. Eight plus six is fourteen; sharing brings it to nine.',
      keyword: 'nine' },

    { id: 'a2', scene: 'adder', start: 188, end: 196,
      caption: 'The shared part is the exclusive-OR of the first two inputs, and the not-AB that the four-gate exclusive-OR already built.',
      narration: 'The shared part is the exclusive-OR of the first two inputs, and the not-AB signal that the four-gate exclusive-OR already built.',
      detail: 'Gates one to four make A exclusive-or B. The carry reuses gate one and adds two gates; the sum reuses the exclusive-OR and adds four.',
      keyword: 'shared part' },

    { id: 'a3', scene: 'adder', start: 196, end: 204,
      caption: 'Nine gates for the pair, and every one of the eight input rows is simulated here to check both outputs at once.',
      narration: 'Nine gates for the pair, and every one of the eight input rows is simulated here to check both outputs at once.',
      detail: 'The page builds the circuit, evaluates all nine gates on all eight rows, and compares both outputs against the arithmetic sum of the three inputs.',
      keyword: 'Nine gates' },

    { id: 'a4', scene: 'adder', start: 204, end: 212,
      caption: 'Nine is a construction this page verifies, not a proved minimum: proving it would need a search over eight-gate circuits in three variables.',
      narration: 'Nine is a construction that this page verifies, not a proved minimum. Proving it would need a search over eight-gate circuits in three variables, which was not run.',
      detail: 'What is proved here is the two-variable table. Three-variable minima are reported as constructions, and the page says so rather than borrowing a number.',
      keyword: 'not a proved minimum' },

    /* ---- 8. pyq2009 ---------------------------------------------------- */
    { id: 'p1', scene: 'pyq2009', start: 212, end: 220,
      caption: 'GATE CSE 2009, one mark: the minimum number of gates for AB plus C, using only two-input NOR gates. The key is three.',
      narration: 'GATE CSE 2009, one mark. The minimum number of gates for A B plus C, using only two-input NOR gates. The key is three.',
      detail: 'Question 6 of the GATE CSE 2009 paper, a single-correct multiple choice with options two, three, four and five. The official key is three.',
      keyword: 'GATE CSE 2009' },

    { id: 'p2', scene: 'pyq2009', start: 220, end: 228,
      caption: 'The trick is to distribute: AB plus C is also A plus C, times B plus C. A product of two sums is what a NOR-NOR circuit builds.',
      narration: 'The trick is to distribute. A B plus C is also A plus C, times B plus C. And a product of two sums is exactly what a NOR-NOR circuit builds.',
      detail: 'Distribution: AB plus C equals (A plus C) times (B plus C). Check the row A equals 0, B equals 0, C equals 1: both sides are 1.',
      keyword: 'distribute' },

    { id: 'p3', scene: 'pyq2009', start: 228, end: 234,
      caption: 'Three gates: one for each sum, inverted, then one to combine. No complements of the inputs are needed anywhere.',
      narration: 'Three gates. One for each sum, inverted, then one to combine. No complements of the inputs are needed anywhere.',
      detail: 'Gate one: NOR of A and C. Gate two: NOR of B and C. Gate three: NOR of the two results, which by De Morgan is their product. Three gates, all two-input.',
      keyword: 'Three gates' },

    { id: 'p4', scene: 'pyq2009', start: 234, end: 240,
      caption: 'And two gates cannot do it. The page searches every two-gate NOR circuit in three variables and finds none that works.',
      narration: 'And two gates cannot do it. The page searches every two-gate NOR circuit in three variables, and finds none that works.',
      detail: 'Forty-two candidate circuits without the complements, a hundred and twenty-eight with them. Neither search finds AB plus C in two gates, so three is the minimum.',
      keyword: 'two gates cannot' },

    /* ---- 9. pyq2017 ---------------------------------------------------- */
    { id: 'q1', scene: 'pyq2017', start: 240, end: 247,
      caption: 'GATE CSE 2017, Set 1: a Karnaugh map, some don&rsquo;t cares, complements available, two-input NOR gates only. The key is one.',
      narration: 'GATE CSE 2017, Set 1. A Karnaugh map, some don&rsquo;t cares, the complements available, two-input NOR gates only. The official key is one.',
      detail: 'Question 21 of GATE CSE 2017 Set 1, a numerical-answer item worth one mark. The published key is 1.',
      keyword: 'The key is one' },

    { id: 'q2', scene: 'pyq2017', start: 247, end: 254,
      caption: 'Spend the don&rsquo;t cares and the whole map collapses to two literals: not-a AND c.',
      narration: 'Spend the don&rsquo;t cares and the whole map collapses to two literals: not-a AND c.',
      detail: 'One group of four cells covers every one-cell in the map, using two don&rsquo;t cares. The group leaves a and c as the only surviving variables, with a complemented.',
      keyword: 'two literals' },

    { id: 'q3', scene: 'pyq2017', start: 254, end: 260,
      caption: 'not-a AND c is the negation of a OR not-c. That is a single NOR gate, because not-c is supplied.',
      narration: 'Not-a AND c is the negation of a or not-c. That is a single NOR gate, because not-c is supplied.',
      detail: 'De Morgan: not of (a or not-c) is not-a AND c. One gate, two inputs, and the complement of c came for free.',
      keyword: 'single NOR gate' },

    { id: 'q4', scene: 'pyq2017', start: 260, end: 266,
      caption: 'The map did the work and the complements clause did the rest. Without the complements the same two literals would cost two gates.',
      narration: 'The map did the work, and the complements clause did the rest. Without the complements, the same two literals would cost two gates.',
      detail: 'Not-a would have to be built, and building it takes one NOR gate, so the count would be two. The published key of one depends on the clause.',
      keyword: 'complements clause' },

    /* ---- 10. pyq2019 --------------------------------------------------- */
    { id: 'r1', scene: 'pyq2019', start: 266, end: 273,
      caption: 'GATE CSE 2019: a four-variable function, sum of minterms zero, two, five, seven, eight, ten, thirteen, fifteen. Two-input NOR gates only.',
      narration: 'GATE CSE 2019. A four-variable function, the sum of minterms zero, two, five, seven, eight, ten, thirteen and fifteen. Two-input NOR gates only.',
      detail: 'A numerical-answer item. All inputs and their complements are available, which the question states explicitly.',
      keyword: 'GATE CSE 2019' },

    { id: 'r2', scene: 'pyq2019', start: 273, end: 280,
      caption: 'The map gives B XNOR D: only two variables survive out of four. The other two never matter.',
      narration: 'The map gives B exclusive-NOR D. Only two variables survive out of four. The other two never matter.',
      detail: 'Grouping the eight ones gives the product pairs BD and not-B not-D, whose sum is B exclusive-NOR D. This is why a four-variable question is really a two-variable one.',
      keyword: 'only two variables' },

    { id: 'r3', scene: 'pyq2019', start: 280, end: 286,
      caption: 'Three NOR gates: B-not-D inverted, not-B-D inverted, then one gate to combine. The answer is three.',
      narration: 'Three NOR gates. B with not-D inverted, not-B with D inverted, then one gate to combine. The answer is three.',
      detail: 'Gate one: NOR of not-B and D, which is B AND not-D. Gate two: NOR of B and not-D. Gate three combines them into the exclusive-NOR.',
      keyword: 'three' },

    { id: 'r4', scene: 'pyq2019', start: 286, end: 292,
      caption: 'The folklore table says four for exclusive-NOR in NOR. It says four because it assumes the complements are not supplied.',
      narration: 'The folklore table says four for exclusive-NOR in NOR. It says four because it assumes the complements are not supplied. Here they were supplied, so the answer is three.',
      detail: 'This is the same distinction as the XOR scene, one gate type over. The page&rsquo;s exhaustive two-variable search gives four without complements and three with.',
      keyword: 'assumes the complements',
      trap: 'A student who has memorised the table writes four and loses the mark. Read the clause first, then look up the table.' },

    /* ---- 11. procedure ------------------------------------------------- */
    { id: 'd1', scene: 'procedure', start: 292, end: 300,
      caption: 'Step one: read the clause. Gate type, fan-in limit, complements available, sharing allowed.',
      narration: 'Step one. Read the clause. Gate type, fan-in limit, complements available, sharing allowed.',
      detail: 'Four words decide the answer before any Boolean algebra happens. Write them down before you touch the function.',
      keyword: 'read the clause' },

    { id: 'd2', scene: 'procedure', start: 300, end: 308,
      caption: 'Step two: simplify, and check whether the result is already one gate. If it is the negation of a product or a sum, stop and answer one.',
      narration: 'Step two. Simplify, and check whether the result is already one gate. If it is the negation of a product or of a sum, stop, and answer one.',
      detail: 'This is the step that catches the zero-gate answer too: if the function simplifies to a single literal, no gate is needed at all.',
      keyword: 'already one gate' },

    { id: 'd3', scene: 'procedure', start: 308, end: 314,
      caption: 'Step three: match the form. A sum of products wants NAND-NAND; a product of sums wants NOR-NOR.',
      narration: 'Step three. Match the form. A sum of products wants NAND-NAND; a product of sums wants NOR-NOR.',
      detail: 'Then expand every gate wider than the stated fan-in: a k-input NAND becomes 2k minus 3 two-input gates.',
      keyword: 'match the form' },

    { id: 'd4', scene: 'procedure', start: 314, end: 320,
      caption: 'Step four: count, expand the wide gates, and simulate. A count you did not check is a guess.',
      narration: 'Step four. Count, expand the wide gates, and simulate. A count that you did not check is a guess.',
      detail: 'Simulating costs nothing and catches both the miscounted gate and the wrong Boolean algebra in the same pass.',
      keyword: 'simulate' },

    /* ---- 12. hold ------------------------------------------------------ */
    { id: 'h1', scene: 'hold', start: 320, end: 327,
      caption: 'A gate count is a property of a cost model, not of a function. State the model before you state the number.',
      narration: 'A gate count is a property of a cost model, not of a function. State the model before you state the number.',
      detail: 'Gate type, fan-in limit, available signals, sharing. Change one and the number changes.',
      keyword: 'cost model' },

    { id: 'h2', scene: 'hold', start: 327, end: 334,
      caption: 'The numbers worth carrying: NAND gives AND two, OR three, XOR four. NOR gives OR two, AND three, XNOR four.',
      narration: 'The numbers worth carrying: NAND gives AND two, OR three, XOR four. NOR gives OR two, AND three, exclusive-NOR four.',
      detail: 'All six assume only the literals are available. With complements supplied, every one of those six falls, and XOR and XNOR fall to three.',
      keyword: 'worth carrying' },

    { id: 'h3', scene: 'hold', start: 334, end: 341,
      caption: 'Two gates save a mark: expand a wide gate before counting it, and reuse a shared signal instead of rebuilding it.',
      narration: 'Two habits save a mark. Expand a wide gate before counting it, and reuse a shared signal instead of rebuilding it.',
      detail: 'The wide gate turns three into six in the three-product example. The shared signal turns fourteen into nine in the full adder.',
      keyword: 'Two habits' },

    { id: 'h4', scene: 'hold', start: 341, end: 348,
      caption: 'Three previous-year questions on this page, and every one of them turned on a clause rather than on algebra.',
      narration: 'Three previous-year questions on this page, and every one of them turned on a clause rather than on algebra.',
      detail: 'Two thousand and nine, two thousand and seventeen, two thousand and nineteen. The algebra was the easy part of all three.',
      keyword: 'a clause' }
  ]
};
