# Comparator Code Converter Bcd Adder — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/comparator-code-converter-bcd-adder/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A specification too big to tabulate

*0:00 – 0:30 · objective: See why three design problems cannot be solved by writing the truth table, and name the small state each one passes forward instead.*

**0:00–0:08** — Three problems that look unrelated. Compare two binary words. Write the same number in a different code. Add two decimal digits using a four-bit adder. They share one shape, and that shape is the whole lesson.

> Caption: Three design problems: compare two words, re-spell a word, and add two decimal digits with a four-bit adder.

Exam-trap caption mode adds: *Treating these as three separate facts to memorise. They are one method applied three times, and the method is what the exam tests.*

**0:08–0:16** — The obvious way to design any combinational circuit is to write its truth table. Two input bits give sixteen rows. Eight input bits give sixty-five thousand five hundred and thirty-six. A table that size is not a design.

> Caption: The naive method is a truth table, and it explodes: two bits need 16 rows, eight bits need 65536.

Exam-trap caption mode adds: *Assuming a big table is acceptable because software could generate it. The exam asks for a gate network, and the point of the structure is to avoid the table.*

**0:16–0:23** — The escape is the same every time. Find a small quantity that summarises everything the bits so far have already told you, and pass it forward one position at a time. Three bits for the comparator, one bit for the Gray code, one flag for the adder.

> Caption: Each problem is solved by one small quantity that summarises the bits already seen.

Exam-trap caption mode adds: *Calling the state a "carry" in a loose sense and then assuming it behaves like an arithmetic carry. It plays the same role, but the update rule is different in each case.*

**0:23–0:30** — If that sounds familiar, it should. A carry-look-ahead adder does exactly this: it replaces the table by a rule per position that composes upward. Same idea, three hats.

> Caption: This is the carry-look-ahead idea wearing three different hats.

Exam-trap caption mode adds: *Reading this as an analogy only. The composition is exact: the ripple comparator is literally a carry chain over a three-value alphabet.*

## Scene 2. The one-bit comparator: three outputs, one 1

*0:30 – 1:00 · objective: Read the four-row table and see that greater, equal and less are mutually exclusive and together exhaustive.*

**0:30–0:38** — Start at the smallest size. One bit against one bit. There are four possible pairs, and three questions you can ask about each: is the first greater, are they equal, is the first less.

> Caption: One bit against one bit has four rows and three outputs: greater, equal, less.

Exam-trap caption mode adds: *Thinking of the comparator as producing a single output that somehow encodes three values. On the wire it is three signals, and the design must guarantee one and only one is high.*

**0:38–0:46** — Each of the three is one gate. Greater is a and not b. Equal is a exclusive-nor b, which is an exclusive-or with a bubble. Less is not a and b. Two of them are single rows of the table.

> Caption: Greater is a AND NOT b; equal is a XNOR b; less is NOT a AND b.

Exam-trap caption mode adds: *Writing equal as a XOR b and then inverting the whole expression somewhere else. The bubble belongs on the gate, and a missing inversion turns the comparator inside out.*

**0:46–0:53** — Look down the three columns. Every row has exactly one 1. Never two, never none. That is not a coincidence, it is the definition: of any two numbers, exactly one of the three relations holds.

> Caption: The G, E and L columns hold exactly one 1 in every row — never two, never none.

Exam-trap caption mode adds: *A circuit with two outputs high looks plausible on three of the four rows, so checking only three rows is enough to miss it.*

**0:53–1:00** — One of these three matters more than the others. Equal is the only one that means the question is still open. If a higher bit already decided, no lower bit can overturn it.

> Caption: Equal is the output that gets passed forward, because it is the only one that says "not decided yet".

Exam-trap caption mode adds: *Passing greater or less forward as well, then OR-ing them at the top and wondering why a decided high bit can be overridden.*

## Scene 3. The triple is the carry

*1:00 – 1:30 · objective: Walk 1011 against 1001 from the most significant bit down, and see the higher bits decide while the lower bits stay unconsulted.*

**1:00–1:08** — Now two four-bit numbers. 1011 against 1001. We begin above the most significant bit, where nothing has been compared yet, so the state is tied: greater zero, equal one, less zero.

> Caption: Comparing 1011 with 1001 starts tied, at the most significant bit.

Exam-trap caption mode adds: *Starting from the least significant bit because addition starts there. Comparison is not addition: the most significant bit carries the most weight.*

**1:08–1:16** — Bit three: one against one. Equal, so nothing is decided and the tie passes down. Bit two: zero against zero. Still tied, still nothing decided.

> Caption: Bit 3 is 1 against 1, so the state stays tied and the question falls through to bit 2.

Exam-trap caption mode adds: *Concluding equality of the whole word from a single tied bit. A tie at one position says nothing about the positions below it.*

**1:16–1:24** — Bit one: one against zero. Now the answer is decided, greater. And because the state is no longer tied, bit zero has no say at all, even though it is also different.

> Caption: Bit 1 is 1 against 0, so greater goes high and bit 0 is never consulted.

Exam-trap caption mode adds: *Continuing to update the state after it is decided. The OR keeps it correct, but a hand trace that keeps comparing lower bits often reports the wrong reason.*

**1:24–1:30** — That rule is not just plausible. The page builds every pair up to six bits, runs the ripple on each, and compares the answer with ordinary numeric comparison. No disagreements.

> Caption: Checked against numeric comparison on every pair up to six bits: the ripple and the relation never disagree.

Exam-trap caption mode adds: *Believing a rule because it works on the example you chose. The example here is one of thousands, and the check is what earns the claim.*

## Scene 4. Counting the outcomes, and stacking comparators

*1:30 – 2:00 · objective: Derive 2 to the n and the half-and-half split, then cascade two four-bit comparators with a correct tie input.*

**1:30–1:38** — Now count instead of compare. With n bits each there are four to the n ordered pairs. How many are ties? Exactly two to the n, one partner for each value.

> Caption: Of the 4 to the n ordered pairs, exactly 2 to the n tie.

Exam-trap caption mode adds: *Counting ties as 2 to the n minus something. There is no double counting here, because the pairs are ordered.*

**1:38–1:46** — Everything that is not a tie is either greater or less, and swapping the two words turns one into the other. So they split evenly. At four bits: sixteen ties, one hundred and twenty greater, one hundred and twenty less.

> Caption: The rest split evenly, so greater is (4 to the n minus 2 to the n) over 2 — 120 at four bits.

Exam-trap caption mode adds: *Forgetting that the pairs are ordered and answering with half the total for the ties as well. The tie count is the one that does not halve.*

**1:46–1:54** — A four-bit comparator compares four bits. To compare eight, stack two: the low nibble stage reports on the low four bits, and hands its three flags up to the high nibble stage.

> Caption: Two four-bit comparators compare eight bits, and the low stage feeds the high stage.

Exam-trap caption mode adds: *Wiring it the other way, high into low. That makes the low nibble override the high one, which is the opposite of how numbers work.*

**1:54–2:00** — One detail decides marks. The bottom stage has nothing below it, so it must be told that the bits below are tied: zero, one, zero. Anything else injects an opinion about bits that are not there.

> Caption: The bottom stage must start tied: greater 0, equal 1, less 0.

Exam-trap caption mode adds: *Leaving the cascade inputs unconnected and hoping the unused inputs default to zero. A default of all zeros means equal is low, so the whole comparator reports a decided answer.*

## Scene 5. A code is a spelling

*2:00 – 2:30 · objective: Read BCD, excess-3 and Gray as three spellings of one digit, and see what self-complementing means.*

**2:00–2:08** — Now the second problem. A code is a spelling of a number. Binary is one spelling. BCD, excess-3 and Gray are others. Converting between them does not change the number, only the word that carries it.

> Caption: A code is a spelling: the same digit, written in a different four-bit word.

Exam-trap caption mode adds: *Treating a code conversion as arithmetic. The value is unchanged, so a converter is a wiring pattern, not an adder, unless the code itself is an offset.*

**2:08–2:16** — BCD writes one decimal digit per four bits. Zero to nine use ten of the sixteen words. The other six mean nothing, and remembering that is what makes the BCD adder make sense later.

> Caption: BCD writes each decimal digit in four bits, so ten of the sixteen words have a meaning.

Exam-trap caption mode adds: *Assuming the six unused words are don't-cares in every BCD circuit. They are unreachable at the input of a converter but reachable at the output of an adder.*

**2:16–2:23** — Excess-3 adds three to the digit before writing it. That offset buys a property: invert all four bits and you get the code for nine minus the digit. Subtraction becomes addition with no borrow.

> Caption: Excess-3 adds three, and inverting its bits gives the code for the nines complement.

Exam-trap caption mode adds: *Saying excess-3 is self-complementing without saying which complement. It is the nines complement, not the tens complement and not the ones complement.*

**2:23–2:30** — The table shows it on every row: invert the excess-3 word and you land on the excess-3 word for nine minus the digit. That is checked for all ten digits, not asserted.

> Caption: Every row of the table confirms it: the inverted code equals the code for 9 minus the digit.

Exam-trap caption mode adds: *Generalising the property to any offset. Only the offset of three makes the four-bit code self-complementing in this sense.*

## Scene 6. Binary to Gray: one exclusive-or per bit

*2:30 – 3:00 · objective: Convert 1011 to Gray by hand, and see the one-bit-change property hold down the whole list and across the wrap.*

**2:30–2:38** — Gray code is the code where neighbours differ in one bit. To build it: copy the top bit, then exclusive-or each binary bit with the bit above it. One gate per bit, no arithmetic.

> Caption: Binary to Gray: the top bit is copied, and every lower Gray bit is that binary bit exclusive-or the one above.

Exam-trap caption mode adds: *Using the decode rule to encode. Encoding pairs each bit with the one above; decoding pairs each bit with the already-decoded bit above, which is a different and longer chain.*

**2:38–2:46** — Run it on 1011. The top bit stays one. One exclusive-or zero is one. Zero exclusive-or one is one. One exclusive-or one is zero. So the Gray code is one one one zero.

> Caption: 1011 becomes 1110: g3 is 1, g2 is 1 xor 0, g1 is 0 xor 1, g0 is 1 xor 1.

Exam-trap caption mode adds: *Reading the answer in the wrong direction. Written most significant bit first, 1110 is not the same word as 0111, and option lists exploit that.*

**2:46–2:54** — Now the property that gives the code its name. Every row differs from the row above in exactly one bit. That is what a rotary encoder needs: a reading can be one step stale but never wildly wrong.

> Caption: Down the whole list, each row differs from the one before it in exactly one bit.

Exam-trap caption mode adds: *Believing one bit changes because the values are close. Consecutive values in ordinary binary often change several bits at once, which is precisely the problem Gray code solves.*

**2:54–3:00** — One more thing that is easy to miss. The last word and the first also differ in one bit. So the sixteen words close into a ring, not just a list. That ring is exactly what a dial needs.

> Caption: The last word and the first also differ in one bit, so the sixteen words form a cycle.

Exam-trap caption mode adds: *Checking only the fifteen consecutive pairs and declaring the property verified. The sixteenth pair, the wrap, is the one a question usually targets.*

## Scene 7. Why the map works

*3:00 – 3:30 · objective: Recognise the Karnaugh map axis order as a Gray code, and connect one-bit-difference to touching cells.*

**3:00–3:08** — Here is where the code earns its place in the syllabus. The Karnaugh map is labelled zero zero, zero one, one one, one zero. That is the Gray sequence, not counting order.

> Caption: The Karnaugh map axis is labelled 00, 01, 11, 10 — not 00, 01, 10, 11.

Exam-trap caption mode adds: *Writing the axis in counting order and then grouping cells as though they were adjacent. The groups you form will merge cells that differ in two bits.*

**3:08–3:16** — Two labels that differ in one bit are placed side by side. Their cells merge, and the bit that differs drops out of the product term. That is the entire mechanism of minimisation by map.

> Caption: Two labels differing in one bit sit next to each other, so their cells can merge.

Exam-trap caption mode adds: *Grouping cells that touch only at a corner without checking the labels. Touching is necessary, but the labels are what justify the merge.*

**3:16–3:24** — A block of four spans two free bits, so two literals vanish. The rule that a block of two to the k cells keeps n minus k literals is just this counting, done once.

> Caption: A block of four keeps two literals instead of four, because two bits are free to differ.

Exam-trap caption mode adds: *Believing a bigger block is always better. Fewest terms comes first, then fewest literals, and those two goals can disagree.*

**3:24–3:30** — This is checkable rather than memorable. The page compares the axis order with the computed Gray sequence, and tests every adjacent pair including the wrap. Both hold.

> Caption: Checked: the four axis labels are the Gray sequence and every adjacent pair differs in one bit, wrap included.

Exam-trap caption mode adds: *Confusing the map's adjacency with the arithmetic neighbours of the values. In the map, adjacency is about bits, not about numeric closeness.*

## Scene 8. The adder that stops being decimal at ten

*3:30 – 4:00 · objective: See the 0 to 19 range, mark the band that is not a digit, and apply the add-six repair to 7 + 5.*

**3:30–3:38** — Third problem. Two BCD digits and a carry in, added by an ordinary four-bit adder. The true sum runs from zero to nineteen, so there is a carry out and a low nibble left over.

> Caption: Two BCD digits plus a carry in give a binary sum anywhere from 0 to 19.

Exam-trap caption mode adds: *Assuming the adder output is already a BCD digit. It is a binary number, and above nine it is not a digit at all.*

**3:38–3:46** — Ten to nineteen cannot be one digit. So above nine the answer must become a carry plus a corrected digit. The adder counted in sixteens; decimal counts in tens. That mismatch is the whole problem.

> Caption: Ten to nineteen are not one decimal digit, so the answer needs a carry and a corrected nibble.

Exam-trap caption mode adds: *Correcting only when the carry out is high. Sums from ten to fifteen have no carry out and still need the correction, which is the most common error in this question.*

**3:46–3:54** — The repair is one line: if the sum is greater than nine, add six to the low nibble. Seven plus five is twelve. Add six and you get eighteen: carry one, nibble two. Twelve as a decimal answer.

> Caption: The repair is to add six whenever the binary sum exceeds nine.

Exam-trap caption mode adds: *Adding six to the whole result instead of to the low nibble. The six is a nibble-level correction, and adding it anywhere else changes the carry.*

**3:54–4:00** — This is checked, not assumed. Two hundred inputs: every pair of digits with both carry values. The corrected digit and carry match decimal addition in every single case.

> Caption: All 200 inputs are checked against decimal addition: no disagreements.

Exam-trap caption mode adds: *Spot-checking two or three cases and calling it verified. The failures in this family cluster at nine plus nine and at sums just above nine.*

## Scene 9. Why six, and why that condition

*4:00 – 4:30 · objective: Justify six as sixteen minus ten, and read the correction expression as an exact cover of the six invalid words.*

**4:00–4:08** — Why six? Because sixteen minus ten is six. Adding six to a nibble of ten or more pushes it past fifteen, which produces the carry, and what remains is the digit.

> Caption: Six is sixteen minus ten, so adding it wraps the nibble by one decimal place.

Exam-trap caption mode adds: *Believing any constant would do. The constant is forced: it must be sixteen minus ten, because the adder counts in sixteens and the answer counts in tens.*

**4:08–4:16** — Six rows, one per invalid nibble. Ten becomes zero with a carry. Eleven becomes one. Down to fifteen, which becomes five with a carry. Six words rescued, six digits produced.

> Caption: Each of the six rescued words lands on 0 to 5 and raises the carry.

Exam-trap caption mode adds: *Expecting the corrected nibble to be the original digit. It is the digit after the tens have been carried away, so it is always five or less here.*

**4:16–4:23** — The condition has three terms. The carry out handles sixteen and above. S3 S2 covers twelve to fifteen. S3 S1 covers ten, eleven, fourteen and fifteen. Together, exactly ten and above.

> Caption: The correction condition is C-out, or S3 S2, or S3 S1.

Exam-trap caption mode adds: *Dropping one of the two product terms because it looks redundant. Each term covers cells the other misses, so dropping either breaks the condition.*

**4:23–4:30** — And one warning. Those six words are not don't-cares. They genuinely appear at the adder output, so the condition has to be correct on all sixteen nibbles, not merely on the ones you happen to try.

> Caption: Ten to fifteen really do arrive, so this is not a don't-care problem — the condition must be right on all sixteen words.

Exam-trap caption mode adds: *Reusing a don't-care minimisation from a BCD-to-seven-segment decoder. There the invalid words are unreachable inputs; here they are reachable outputs.*

## Scene 10. One procedure, five traps

*4:30 – 5:00 · objective: Run a four-line procedure on any question in this family and name the five traps by sight.*

**4:30–4:38** — One procedure covers all three. First, name what goes in and what comes out. Two words and three flags. One word and one word. Two digits plus a carry, and a digit plus a carry.

> Caption: Name the input word and the output word before writing any gate.

Exam-trap caption mode adds: *Starting from the circuit you remember instead of the specification. The remembered circuit answers a slightly different question.*

**4:38–4:46** — Second, find the small state. The triple for the comparator. The running exclusive-or for the code. The correction flag for the adder. Third, write the rule for one position and check it on everything you can enumerate.

> Caption: Find the small quantity that summarises the lower bits, then write one rule per position.

Exam-trap caption mode adds: *Trying to write a single expression for the whole word. The per-position rule plus the state is shorter and far less error-prone.*

**4:46–4:53** — Now the traps. Comparing from the low end, which is the habit addition gives you. And feeding a cascaded stage anything other than a tie, which quietly answers a question about bits that do not exist.

> Caption: Trap one: comparing from the least significant bit. Trap two: a cascade input that is not a tie.

Exam-trap caption mode adds: *Both traps produce answers that appear among the options, so a careless check does not catch them.*

**4:53–5:00** — Three more. Using the decode chain to encode, which is a different and longer chain. Treating ten to fifteen as don't-cares, when they arrive. And forgetting that the corrected sum raises the carry.

> Caption: Trap three: using the decode chain to encode. Traps four and five: treating 10 to 15 as don't-cares, and forgetting the corrected carry.

Exam-trap caption mode adds: *Answering with the intermediate nibble instead of the digit-and-carry pair the question asked for.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
