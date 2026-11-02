# Minimum NAND and NOR Gate Count: why the number depends on the clause — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/minimum-nand-nor-gate-count/index.html`
- Total duration: 5:48 (348 seconds), 12 scenes, 48 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. One function, three honest answers

*0:00 – 0:28 · objective: undefined*

**0:00–0:07** — How many gates does a function need? That question has no single answer until you say what a gate is, and what you are allowed to start with.

> Caption: How many gates does a function need? The question has no single answer until you say what a gate is and what you are allowed to start with.

Exam-trap caption mode adds: *A bare number in an answer key is meaningless unless the question fixed the gate type and the fan-in. Read those words before counting.*

**0:07–0:14** — Take one function, A B plus C. Built from two-input NAND gates, with only A, B and C available, it costs three gates.

> Caption: Take one function: A times B, or C. In two-input NAND gates with only A, B, C available it costs three.

**0:14–0:21** — Now hand it the complements for free. The same function, the same gate type, costs two gates, because the inverter disappears into the input.

> Caption: Hand it the complements for free and the same function costs two: the inverter disappears into the input.

Exam-trap caption mode adds: *This is the clause that decides several previous-year answers, and the one most often left unread: are the complements of the inputs available?*

**0:21–0:28** — Every number on this page is computed by the page itself, by exhaustive search over small circuits, and then re-checked by simulating the circuit on every input row.

> Caption: Every number on this page is computed by the page, by exhaustive search over small circuits, and then re-checked by simulating the circuit on every row.

## Scene 2. A gate count is a property of a cost model

*0:28 – 0:58 · objective: undefined*

**0:28–0:35** — Four settings fix the answer. Which gate type. How many inputs one gate may have. Which signals arrive for free. And whether a computed signal may be reused.

> Caption: Four settings fix the answer: which gate type, how many inputs a gate may have, which signals are free, and whether a signal may be reused.

**0:35–0:42** — Two-input NAND only. Then a three-input NAND is not one gate. It is three two-input gates, and a four-input one is five.

> Caption: Two-input NAND only. A three-input NAND is not one gate: it is three two-input gates.

Exam-trap caption mode adds: *Counting a four-input NAND as one gate is the single most common arithmetic slip in this topic. Expand every gate wider than the limit before you count.*

**0:42–0:49** — Are only A, B and C available, or are their complements free as well? One gate buys three functions in the first case, and nine in the second.

> Caption: Only A, B, C available, or A, B, C and their complements? One gate buys three functions in the first case and nine in the second.

**0:49–0:58** — Reuse allowed. A signal computed once may feed several gates. That is what makes two outputs cheaper together than apart, and it is why the full adder is nine gates and not fourteen.

> Caption: Reuse allowed: a signal computed once may feed several gates. That is what makes two outputs cheaper together than apart.

## Scene 3. What one gate buys, and what two cannot

*0:58 – 1:28 · objective: undefined*

**0:58–1:05** — One gate computes not of a product, or not of a sum. Nothing else. That is the whole of what a single gate can do.

> Caption: One gate computes not of a product, or not of a sum. Nothing else. That is the whole of what a single gate can do.

**1:05–1:12** — With only x and y available, three functions of two variables are one gate away. AND is not one of them. AND takes two.

> Caption: With only x and y available, three functions of two variables are one gate away. AND is not one of them; it takes two.

Exam-trap caption mode adds: *The inverter looks free because tying the inputs costs nothing, and then AND looks like one gate. It is two: one to make not-xy, one to invert it.*

**1:12–1:20** — The exhaustive search reports every depth. Of the sixteen functions of two variables, exactly one needs five NAND gates, and only one does.

> Caption: The exhaustive search reports every depth. Of the sixteen functions of two variables, one needs five NAND gates and only one does.

**1:20–1:28** — The function that costs five is the complement of exclusive-OR. Its partner, exclusive-OR itself, costs four.

> Caption: The one that costs five is exclusive-OR&rsquo;s complement. Its partner, exclusive-OR, costs four.

## Scene 4. Every two-variable function, and what it costs

*1:28 – 2:00 · objective: undefined*

**1:28–1:36** — Here is every function of two variables, against four cost models. NAND or NOR, and with or without the complements supplied.

> Caption: Here is every function of two variables against four cost models: NAND or NOR, with or without the complements supplied.

**1:36–1:45** — Read the AND row. Two NAND gates without complements, and still two with them. Under NOR it is three gates, or one when the complements are free.

> Caption: Read the AND row: two NAND gates without complements, and still two with them. NOR gives three, or one.

**1:45–1:53** — Read the XOR row. Four NAND gates without complements, three with. The familiar four assumes you were not given the complements.

> Caption: Read the XOR row: four NAND gates without complements, three with. The folklore four assumes you were not given the complements.

Exam-trap caption mode adds: *Answering four to a question that supplied the complements is the classic mark lost here. The number is not wrong in general; it answers a different question.*

**1:53–2:00** — NAND and NOR swap under duality, and so do AND and OR, and XOR and its complement. But the counts are not the same function of the row.

> Caption: NAND and NOR swap under duality, and so do AND and OR with XOR and its complement. The counts are not the same function of the row.

## Scene 5. XOR: four gates, or three, depending on the inputs

*2:00 – 2:30 · objective: undefined*

**2:00–2:08** — Exclusive-OR is the standard worked example, because its two constructions differ by exactly one gate, and both are in use.

> Caption: Exclusive-OR is the standard worked example, because its two constructions differ by exactly one gate and both are in use.

**2:08–2:16** — Four gates. The first makes not of A B. Then two gates push A and B against it. The fourth combines the two results.

> Caption: Four gates: the first makes not-AB, then two gates push A and B against it, and the fourth combines them.

**2:16–2:24** — Three gates. Not-A with B, then A with not-B, then one gate to combine them. The saving is the two inverters that the first circuit had to build for itself.

> Caption: Three gates: not-A-B, A-not-B, then one gate to combine. The saving is the two inverters the first circuit had to build.

**2:24–2:30** — So the honest statement is this. Four gates when you must build the complements, three when they arrive already built.

> Caption: So the honest statement is: four gates when you must build the complements, three when they arrive built.

## Scene 6. From a sum of products: one NAND per term, then expand

*2:30 – 3:00 · objective: undefined*

**2:30–2:38** — When the function arrives as a sum of products, the NAND-NAND pattern gives a count directly. One gate per product term, plus one to combine them.

> Caption: When the function arrives as a sum of products, the NAND-NAND pattern gives a count directly: one gate per product term, plus one to combine.

**2:38–2:46** — Two products of two literals: three gates. A B or C D costs three two-input NAND gates, and that is checked on all sixteen rows.

> Caption: Two products of two literals: three gates. A B or C D costs three two-input NAND gates, and that is checked on all sixteen rows.

**2:46–2:54** — Three products. The final gate now has three inputs, so it is three gates and not one. Six in total.

> Caption: Three products: the final gate now has three inputs, so it is three gates, not one. Six in total.

Exam-trap caption mode adds: *The final NAND is one gate only when the sum has two terms. With p terms it needs 2p minus 3 gates once p exceeds 2.*

**2:54–3:00** — This is the first place where the minimal sum of products and the minimal gate count come apart. The next scene is the second place.

> Caption: This is the first place the minimal sum of products and the minimal gate count come apart, and the next scene is the second.

## Scene 7. Two outputs share gates: the full adder in nine

*3:00 – 3:32 · objective: undefined*

**3:00–3:08** — A full adder has two outputs. Built separately they cost eight gates and six. Built together, nine.

> Caption: A full adder has two outputs. Built separately they cost eight gates and six; built together, nine.

**3:08–3:16** — The shared part is the exclusive-OR of the first two inputs, and the not-AB signal that the four-gate exclusive-OR already built.

> Caption: The shared part is the exclusive-OR of the first two inputs, and the not-AB that the four-gate exclusive-OR already built.

**3:16–3:24** — Nine gates for the pair, and every one of the eight input rows is simulated here to check both outputs at once.

> Caption: Nine gates for the pair, and every one of the eight input rows is simulated here to check both outputs at once.

**3:24–3:32** — Nine is a construction that this page verifies, not a proved minimum. Proving it would need a search over eight-gate circuits in three variables, which was not run.

> Caption: Nine is a construction this page verifies, not a proved minimum: proving it would need a search over eight-gate circuits in three variables.

## Scene 8. GATE CSE 2009: AB + C in three NOR gates, and not two

*3:32 – 4:00 · objective: undefined*

**3:32–3:40** — GATE CSE 2009, one mark. The minimum number of gates for A B plus C, using only two-input NOR gates. The key is three.

> Caption: GATE CSE 2009, one mark: the minimum number of gates for AB plus C, using only two-input NOR gates. The key is three.

**3:40–3:48** — The trick is to distribute. A B plus C is also A plus C, times B plus C. And a product of two sums is exactly what a NOR-NOR circuit builds.

> Caption: The trick is to distribute: AB plus C is also A plus C, times B plus C. A product of two sums is what a NOR-NOR circuit builds.

**3:48–3:54** — Three gates. One for each sum, inverted, then one to combine. No complements of the inputs are needed anywhere.

> Caption: Three gates: one for each sum, inverted, then one to combine. No complements of the inputs are needed anywhere.

**3:54–4:00** — And two gates cannot do it. The page searches every two-gate NOR circuit in three variables, and finds none that works.

> Caption: And two gates cannot do it. The page searches every two-gate NOR circuit in three variables and finds none that works.

## Scene 9. GATE CSE 2017: a map, a don&rsquo;t care, one NOR gate

*4:00 – 4:26 · objective: undefined*

**4:00–4:07** — GATE CSE 2017, Set 1. A Karnaugh map, some don&rsquo;t cares, the complements available, two-input NOR gates only. The official key is one.

> Caption: GATE CSE 2017, Set 1: a Karnaugh map, some don&rsquo;t cares, complements available, two-input NOR gates only. The key is one.

**4:07–4:14** — Spend the don&rsquo;t cares and the whole map collapses to two literals: not-a AND c.

> Caption: Spend the don&rsquo;t cares and the whole map collapses to two literals: not-a AND c.

**4:14–4:20** — Not-a AND c is the negation of a or not-c. That is a single NOR gate, because not-c is supplied.

> Caption: not-a AND c is the negation of a OR not-c. That is a single NOR gate, because not-c is supplied.

**4:20–4:26** — The map did the work, and the complements clause did the rest. Without the complements, the same two literals would cost two gates.

> Caption: The map did the work and the complements clause did the rest. Without the complements the same two literals would cost two gates.

## Scene 10. GATE CSE 2019: the same three gates, one level up

*4:26 – 4:52 · objective: undefined*

**4:26–4:33** — GATE CSE 2019. A four-variable function, the sum of minterms zero, two, five, seven, eight, ten, thirteen and fifteen. Two-input NOR gates only.

> Caption: GATE CSE 2019: a four-variable function, sum of minterms zero, two, five, seven, eight, ten, thirteen, fifteen. Two-input NOR gates only.

**4:33–4:40** — The map gives B exclusive-NOR D. Only two variables survive out of four. The other two never matter.

> Caption: The map gives B XNOR D: only two variables survive out of four. The other two never matter.

**4:40–4:46** — Three NOR gates. B with not-D inverted, not-B with D inverted, then one gate to combine. The answer is three.

> Caption: Three NOR gates: B-not-D inverted, not-B-D inverted, then one gate to combine. The answer is three.

**4:46–4:52** — The folklore table says four for exclusive-NOR in NOR. It says four because it assumes the complements are not supplied. Here they were supplied, so the answer is three.

> Caption: The folklore table says four for exclusive-NOR in NOR. It says four because it assumes the complements are not supplied.

Exam-trap caption mode adds: *A student who has memorised the table writes four and loses the mark. Read the clause first, then look up the table.*

## Scene 11. The procedure, in the order that avoids the trap

*4:52 – 5:20 · objective: undefined*

**4:52–5:00** — Step one. Read the clause. Gate type, fan-in limit, complements available, sharing allowed.

> Caption: Step one: read the clause. Gate type, fan-in limit, complements available, sharing allowed.

**5:00–5:08** — Step two. Simplify, and check whether the result is already one gate. If it is the negation of a product or of a sum, stop, and answer one.

> Caption: Step two: simplify, and check whether the result is already one gate. If it is the negation of a product or a sum, stop and answer one.

**5:08–5:14** — Step three. Match the form. A sum of products wants NAND-NAND; a product of sums wants NOR-NOR.

> Caption: Step three: match the form. A sum of products wants NAND-NAND; a product of sums wants NOR-NOR.

**5:14–5:20** — Step four. Count, expand the wide gates, and simulate. A count that you did not check is a guess.

> Caption: Step four: count, expand the wide gates, and simulate. A count you did not check is a guess.

## Scene 12. One screen to hold

*5:20 – 5:48 · objective: undefined*

**5:20–5:27** — A gate count is a property of a cost model, not of a function. State the model before you state the number.

> Caption: A gate count is a property of a cost model, not of a function. State the model before you state the number.

**5:27–5:34** — The numbers worth carrying: NAND gives AND two, OR three, XOR four. NOR gives OR two, AND three, exclusive-NOR four.

> Caption: The numbers worth carrying: NAND gives AND two, OR three, XOR four. NOR gives OR two, AND three, XNOR four.

**5:34–5:41** — Two habits save a mark. Expand a wide gate before counting it, and reuse a shared signal instead of rebuilding it.

> Caption: Two gates save a mark: expand a wide gate before counting it, and reuse a shared signal instead of rebuilding it.

**5:41–5:48** — Three previous-year questions on this page, and every one of them turned on a clause rather than on algebra.

> Caption: Three previous-year questions on this page, and every one of them turned on a clause rather than on algebra.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
