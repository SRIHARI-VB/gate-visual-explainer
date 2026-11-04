# Chomsky Normal Form and Grammar Simplification: Four Passes, the Helper Counts and the 2n − 1 Arithmetic — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/chomsky-normal-form-and-grammar-simplification/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Why a fixed shape

*0:00 – 0:30 · objective: See what a normal form is for: a grammar whose rules are allowed any right-hand side becomes a grammar of two fixed shapes, and the fixed shape is what makes derivation counting possible.*

**0:00–0:07** — A grammar is a recipe: each rule says how one symbol may be rewritten.

> Caption: A grammar is a recipe: each rule says how one symbol may be rewritten.

**0:07–0:15** — The right side may be any length: one letter, two symbols, or a whole string.

> Caption: The right side may be any length: one letter, two symbols, or a whole string.

**0:15–0:22** — A normal form removes that freedom: every rule must have one of two shapes.

> Caption: A normal form removes that freedom: every rule must have one of two shapes.

**0:22–0:30** — Four passes get you there, and each pass is a small, checkable rewrite.

> Caption: Four passes get you there, and each pass is a small, checkable rewrite.

## Scene 2. The two shapes

*0:30 – 1:00 · objective: State Chomsky normal form and Greibach normal form exactly, gloss every symbol, and name what each shape buys before any algorithm is shown.*

**0:30–0:37** — Chomsky normal form: A gives B C, or A gives a single terminal a.

> Caption: Chomsky normal form: A gives B C, or A gives a single terminal a.

**0:37–0:45** — Greibach normal form: A gives a, followed by any number of nonterminals.

> Caption: Greibach normal form: A gives a, followed by any number of nonterminals.

**0:45–0:52** — The binary shape makes the parse tree a binary tree; that is the counting machine.

> Caption: The binary shape makes the parse tree a binary tree; that is the counting machine.

**0:52–1:00** — Neither form is a language class: every context-free grammar without the empty string has both.

> Caption: Neither form is a language class: every context-free grammar without the empty string has both.

Exam-trap caption mode adds: *A normal form is a property of a grammar, never of a language.*

## Scene 3. Useless symbols: productive and reachable

*1:00 – 1:30 · objective: A symbol survives only if it can derive a string of terminals (productive) AND is reachable from the start symbol. The teaching grammar has one of each failure.*

**1:00–1:07** — A nonterminal is productive if some derivation from it ends in terminals.

> Caption: A nonterminal is productive if some derivation from it ends in terminals.

**1:07–1:15** — A nonterminal is reachable if it appears in some derivation from the start symbol.

> Caption: A nonterminal is reachable if it appears in some derivation from the start symbol.

**1:15–1:22** — Useless means one failure or the other: unreachable, or unproductive.

> Caption: Useless means one failure or the other: unreachable, or unproductive.

**1:22–1:30** — Five nonterminals become three, and the language does not move.

> Caption: Five nonterminals become three, and the language does not move.

## Scene 4. Removing the empty production

*1:30 – 2:00 · objective: Compute the nullable set, substitute every combination of nullable symbols, delete the empty rule — and keep one empty rule when the empty string is in the language.*

**1:30–1:37** — A nullable nonterminal is one that can vanish: it derives the empty string.

> Caption: A nullable nonterminal is one that can vanish: it derives the empty string.

**1:37–1:45** — For every rule, add a copy for each way its nullable symbols could vanish.

> Caption: For every rule, add a copy for each way its nullable symbols could vanish.

**1:45–1:52** — One empty rule survives when the empty string is in the language.

> Caption: One empty rule survives when the empty string is in the language.

Exam-trap caption mode adds: *GATE CSE 2008 asks whether all empty productions can be removed from any grammar. The statement is false for exactly this reason.*

**1:52–2:00** — The empty production can also create unit productions, which is why the next pass exists.

> Caption: The empty production can also create unit productions, which is why the next pass exists.

## Scene 5. Removing the unit production

*2:00 – 2:30 · objective: A unit production is A gives B, one nonterminal alone. Expand along the unit pairs and drop the unit rules; on the teaching grammar the only pair is S gives B.*

**2:00–2:07** — A unit production is a rule with one nonterminal and nothing else.

> Caption: A unit production is a rule with one nonterminal and nothing else.

**2:07–2:15** — Compute the unit pairs by closure, then copy every non-unit rule along each pair.

> Caption: Compute the unit pairs by closure, then copy every non-unit rule along each pair.

**2:15–2:22** — S now has four rules instead of three, and B keeps its own two.

> Caption: S now has four rules instead of three, and B keeps its own two.

**2:22–2:30** — A unit rule is not an error to leave in: it is a step that no counting theorem allows.

> Caption: A unit rule is not an error to leave in: it is a step that no counting theorem allows.

## Scene 6. Why the order is not free

*2:30 – 3:00 · objective: Removing the empty rule can leave a symbol that produces nothing, so the useless-symbol pass must run after the empty and unit passes, not before.*

**2:30–2:37** — Here is a five-symbol grammar where every symbol is useful at the start.

> Caption: Here is a five-symbol grammar where every symbol is useful at the start.

**2:37–2:45** — Delete the empty rule and D, C and B stop producing anything.

> Caption: Delete the empty rule and D, C and B stop producing anything.

**2:45–2:52** — So the useless-symbol pass runs last of the three, never first.

> Caption: So the useless-symbol pass runs last of the three, never first.

**2:52–3:00** — Run the pass twice and a unit rule survives: S gives A, which the unit pass already passed.

> Caption: Run the pass twice and a unit rule survives: S gives A, which the unit pass already passed.

Exam-trap caption mode adds: *An answer that needs a second useless pass can be correct and still not be in normal form.*

## Scene 7. Two terminals cannot share a rule

*3:00 – 3:30 · objective: Isolate every terminal that sits beside another symbol into its own nonterminal, then split long right-hand sides into a chain of binary rules, counting the helpers.*

**3:00–3:07** — Two shapes remain illegal: a terminal beside another symbol, and three symbols in a row.

> Caption: Two shapes remain illegal: a terminal beside another symbol, and three symbols in a row.

**3:07–3:15** — Give each terminal its own nonterminal, and reuse it whenever the terminal recurs.

> Caption: Give each terminal its own nonterminal, and reuse it whenever the terminal recurs.

**3:15–3:22** — A long right side becomes a chain: each new symbol holds two of the remaining symbols.

> Caption: A long right side becomes a chain: each new symbol holds two of the remaining symbols.

**3:22–3:30** — Isolate first, then split: the other order creates helpers for symbols you then move.

> Caption: Isolate first, then split: the other order creates helpers for symbols you then move.

Exam-trap caption mode adds: *Counting new nonterminals is only well defined once the order of the two sub-steps is fixed.*

## Scene 8. The whole pipeline on one grammar

*3:30 – 4:00 · objective: Run all four passes on the teaching grammar and check the result: ten productions, five nonterminals, and exactly the same language on every string up to length six.*

**3:30–3:37** — One grammar, four passes, and a table of what each pass changed.

> Caption: One grammar, four passes, and a table of what each pass changed.

**3:37–3:45** — The final grammar has ten rules, every one of them of an allowed shape.

> Caption: The final grammar has ten rules, every one of them of an allowed shape.

**3:45–3:52** — The check that matters: both grammars accept the same strings up to length six.

> Caption: The check that matters: both grammars accept the same strings up to length six.

**3:52–4:00** — On the textbook grammar the same code gives the same language on 120 strings.

> Caption: On the textbook grammar the same code gives the same language on 120 strings.

## Scene 9. What the shape buys: 2n minus 1

*4:00 – 4:30 · objective: Count a derivation in normal form: exactly 2n minus 1 steps and 2n minus 1 internal nodes for a string of length n, and the length bound that a grammar with k nonterminals imposes.*

**4:00–4:07** — A string of length n takes exactly 2n minus 1 steps in normal form.

> Caption: A string of length n takes exactly 2n minus 1 steps in normal form.

**4:07–4:15** — The tree has 2n minus 1 internal nodes and 3n minus 1 nodes in total.

> Caption: The tree has 2n minus 1 internal nodes and 3n minus 1 nodes in total.

**4:15–4:22** — With k nonterminals, a nonempty language has a string of length at most 2 to the k minus 1.

> Caption: With k nonterminals, a nonempty language has a string of length at most 2 to the k minus 1.

**4:22–4:30** — GATE CSE 2024 Set 1 asked for the step count with ten variables; the answer is 179.

> Caption: GATE CSE 2024 Set 1 asked for the step count with ten variables; the answer is 179.

Exam-trap caption mode adds: *The number of variables never enters the step count. Only the length of the string does.*

## Scene 10. Membership, and how GATE asks it

*4:30 – 5:00 · objective: Fill the triangular membership table of the converted grammar, see why it costs n cubed, and name the four ways the exam asks about normal forms.*

**4:30–4:37** — Membership becomes a triangle of cells: each cell asks which symbols derive that piece.

> Caption: Membership becomes a triangle of cells: each cell asks which symbols derive that piece.

**4:37–4:45** — Each cell tries every split point, so the whole table costs n cubed.

> Caption: Each cell tries every split point, so the whole table costs n cubed.

**4:45–4:52** — Four question shapes: the step count, the validity check, the conversion, the bound.

> Caption: Four question shapes: the step count, the validity check, the conversion, the bound.

**4:52–5:00** — Read the grammar, not the story: the shape decides the count, and the count decides the answer.

> Caption: Read the grammar, not the story: the shape decides the count, and the count decides the answer.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
