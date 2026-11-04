# Amortised Analysis: Aggregate, Accounting and Potential Methods — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/amortised-analysis-aggregate-accounting-potential/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. The bill, not the receipt

*0:00 – 0:30 · objective: Separate the cost of one operation from its share of the bill for a whole sequence, and place amortised analysis beside worst case and average case.*

**0:00–0:07** — An amortised cost is not the cost of an operation. It is that operation’s share of the bill for a whole sequence.

> Caption: An amortised cost is not the cost of an operation. It is that operation’s share of the bill for a whole sequence.

**0:07–0:15** — Insert the ninth item into a table of size eight and it copies all eight: nine units. Insert the tenth and it costs one.

> Caption: Insert the ninth item into a table of size 8 and it copies all eight: 9 units. Insert the tenth and it costs 1.

**0:15–0:22** — Worst case, average case and amortised are three different questions, and only one of them uses probabilities.

> Caption: Worst case, average case and amortised are three different questions, and only one of them uses probabilities.

Exam-trap caption mode adds: *Amortised is not average case. No input distribution is assumed, and none is needed.*

**0:22–0:30** — Amortised is a guarantee about every sequence: whatever you do, n operations cost at most n times the amortised cost.

> Caption: Amortised is a guarantee about every sequence: whatever you do, n operations cost at most n times the amortised cost.

## Scene 2. The doubling table: which insertions are expensive

*0:30 – 1:00 · objective: Watch a dynamic table double when full, and read the per-operation costs 1, 2, 3, 1, 5, 1, 1, 1, 9, 1 — expensive steps, but rare ones.*

**0:30–0:37** — A dynamic table keeps one block of slots. When the block is full, it allocates twice as many and copies everything across.

> Caption: A dynamic table keeps one block of slots. When the block is full, it allocates twice as many and copies everything across.

**0:37–0:45** — The first nine insertions cost one, two, three, one, five, one, one, one, nine units. Only the ninth is expensive.

> Caption: The first nine insertions cost 1, 2, 3, 1, 5, 1, 1, 1, 9 units. Only the ninth is expensive.

**0:45–0:52** — An insertion is expensive exactly when it lands on a table that is full, at item counts one, two, three, five, nine, seventeen, and so on.

> Caption: An insertion is expensive exactly when it lands on a table that is full — at item counts 1, 2, 3, 5, 9, 17, and so on.

**0:52–1:00** — The expensive insertions get twice as costly and half as frequent. That trade is what makes the sequence cheap.

> Caption: The expensive insertions get twice as costly and half as frequent. That trade is what makes the sequence cheap.

## Scene 3. Aggregate method: add up the copies

*1:00 – 1:30 · objective: Sum the copy costs 1 + 2 + 4 + ... + 512 = 1023, add the 1024 writes, and divide: at most 2 units per insertion.*

**1:00–1:07** — The aggregate method adds the whole bill up and divides once. No cleverness, just arithmetic on the copies.

> Caption: The aggregate method adds the whole bill up and divides once. No cleverness, just arithmetic on the copies.

**1:07–1:15** — The copy costs are one, two, four, eight and on to five hundred and twelve, and they add up to one thousand and twenty-three for one thousand and twenty-four insertions.

> Caption: The copy costs are 1, 2, 4, 8 and on to 512, and they add up to 1023 for 1024 insertions.

**1:15–1:22** — Add the one thousand and twenty-four writes: one thousand and twenty-four plus one thousand and twenty-three is two thousand and forty-seven units, which is two n minus one for n equal to one thousand and twenty-four.

> Caption: Add the 1024 writes: 1024 + 1023 = 2047 units, which is 2n - 1 for n = 1024.

**1:22–1:30** — Divide: two thousand and forty-seven over one thousand and twenty-four is one point nine nine nine. At most two units per insertion, for every sequence of that length.

> Caption: Divide: 2047 over 1024 is 1.999. At most 2 units per insertion, for every sequence of that length.

## Scene 4. Accounting method: overcharge and save the change

*1:30 – 2:00 · objective: Charge 3 per insertion, keep 2 as credit, and check that the credit never goes negative over 4096 insertions.*

**1:30–1:37** — The accounting method overcharges each cheap operation and keeps the change as credit, in the same units.

> Caption: The accounting method overcharges each cheap operation and keeps the change as credit, in the same units.

**1:37–1:45** — Charge three per insertion: one unit to write the item, two units saved. Copying one item costs one unit.

> Caption: Charge 3 per insertion: 1 unit to write the item, 2 units saved. Copying one item costs 1 unit.

**1:45–1:52** — When the table doubles, the banked credit pays for the copies. Over four thousand and ninety-six insertions the credit is never negative.

> Caption: When the table doubles, the banked credit pays for the copies. Over 4096 insertions the credit is never negative.

**1:52–2:00** — The credit is a debt the sequence owes to the future. If it ever went below zero, the charge would be too small.

> Caption: The credit is a debt the sequence owes to the future. If it ever went below zero, the charge would be too small.

Exam-trap caption mode adds: *The credit must stay non-negative at every point in the sequence, not merely at the end.*

## Scene 5. Potential method: the saving as a function

*2:00 – 2:30 · objective: Define the potential 2 x items - capacity, compute the amortised cost of the ninth insertion as 9 + (2 - 8) = 3, and see the changes telescope.*

**2:00–2:07** — The potential method writes the same saving as a function of the data structure: a number that goes up and down.

> Caption: The potential method writes the same saving as a function of the data structure: a number that goes up and down.

**2:07–2:15** — Take the potential to be two times items minus capacity. It is zero when the table is empty and never negative, because the table is always at least half full.

> Caption: Take the potential to be 2 x items - capacity. It is 0 when the table is empty and never negative, because the table is always at least half full.

**2:15–2:22** — Amortised cost is actual cost plus the change in potential: for the ninth insertion, nine plus two minus eight is three.

> Caption: Amortised cost is actual cost plus the change in potential: for the ninth insertion, 9 + (2 - 8) = 3.

**2:22–2:30** — The changes telescope. Summing the amortised costs gives the total cost plus the final potential minus the first.

> Caption: The changes telescope. Summing the amortised costs gives the total cost plus the final potential minus the first.

## Scene 6. A binary counter: flips instead of copies

*2:30 – 3:00 · objective: Count 31 bit flips over 16 increments, derive 2n - popcount(n), and show every increment has amortised cost exactly 2 with the number of ones as the potential.*

**2:30–2:37** — A binary counter is the second classic: an increment flips a run of trailing ones to zero and then one zero to one.

> Caption: A binary counter is the second classic: an increment flips a run of trailing ones to zero and then one zero to one.

**2:37–2:45** — Sixteen increments flip one, two, one, three, one, two, one, four, one, two, one, three, one, two, one, five bits: thirty-one in all.

> Caption: Sixteen increments flip 1, 2, 1, 3, 1, 2, 1, 4, 1, 2, 1, 3, 1, 2, 1, 5 bits — 31 in all.

**2:45–2:52** — The total is two n minus the number of ones in n: two times sixteen minus one is thirty-one. The most expensive single increment still flips five bits.

> Caption: The total is 2n - popcount(n): 2 x 16 - 1 = 31. The most expensive single increment still flips 5 bits.

**2:52–3:00** — With the number of ones as the potential, every increment costs exactly two amortised: flips plus the change in ones.

> Caption: With the number of ones as the potential, every increment costs exactly 2 amortised: flips plus the change in ones.

## Scene 7. A stack with multipop: one budget, three operations

*3:00 – 3:30 · objective: See one multipop cost 7 units, then bound any sequence of n operations by 2n, and check the bound against all 78,125 sequences of seven operations.*

**3:00–3:07** — A stack supports push, pop, and multipop of k items. Each push and each pop costs one unit; multipop costs one per item removed.

> Caption: A stack supports push, pop, and multipop of k items. Each push and each pop costs one unit; multipop costs one per item removed.

**3:07–3:15** — One multipop can cost seven units while a push costs one. Worst case, that single operation is expensive.

> Caption: One multipop can cost 7 units while a push costs 1. Worst case, that single operation is expensive.

**3:15–3:22** — Every pop was paid for by an earlier push, so n operations cost at most two n units in total.

> Caption: Every pop was paid for by an earlier push, so n operations cost at most 2n units in total.

**3:22–3:30** — All seventy-eight thousand one hundred and twenty-five sequences of seven operations were run: the largest total is ten units, against the bound of fourteen.

> Caption: All 78,125 sequences of seven operations were run: the largest total is 10 units, against the bound of 14.

## Scene 8. What amortised does not say

*3:30 – 4:00 · objective: Hold the worst single insertion (1,025 units) and the amortised cost (2 units) at the same time, and state the claim amortised analysis actually makes.*

**3:30–3:37** — Amortised two does not mean every insertion costs two. The one thousand and twenty-fifth insertion copies one thousand and twenty-four items and costs one thousand and twenty-five units.

> Caption: Amortised 2 does not mean every insertion costs 2. The 1,025th insertion copies 1,024 items and costs 1,025 units.

Exam-trap caption mode adds: *A worst-case answer and an amortised answer are different answers. Read which one is asked.*

**3:37–3:45** — Nor is it an average over random inputs. No distribution appears anywhere in the argument.

> Caption: Nor is it an average over random inputs. No distribution appears anywhere in the argument.

**3:45–3:52** — Amortised always sits between the best case and the worst case. It can never be outside them.

> Caption: Amortised always sits between the best case and the worst case. It can never be outside them.

**3:52–4:00** — The claim is exact: for every sequence of n operations, the total cost is at most n times the amortised cost.

> Caption: The claim is exact: for every sequence of n operations, the total cost is at most n times the amortised cost.

## Scene 9. Where the argument breaks

*4:00 – 4:30 · objective: Add decrement to the counter and the amortised cost becomes 17 flips per operation; halve the table at half full and every alternating insert and delete copies 8 items.*

**4:00–4:07** — A potential function is chosen for an operation set. Change the set and the same function can stop working.

> Caption: A potential function is chosen for an operation set. Change the set and the same function can stop working.

**4:07–4:15** — Allow decrement: alternating between sixty-five thousand five hundred and thirty-five and sixty-five thousand five hundred and thirty-six flips seventeen bits on every single operation.

> Caption: Allow decrement: alternating between 65,535 and 65,536 flips 17 bits on every single operation.

**4:15–4:22** — So increment and decrement together are logarithmic amortised, not constant. The counter can bounce at a boundary.

> Caption: So increment and decrement together are O(log n) amortised, not O(1). The counter can bounce at a boundary.

Exam-trap caption mode adds: *A potential that stays bounded cannot pay for a sequence of expensive operations.*

**4:22–4:30** — The table breaks the same way: halving at half full makes every alternating insert and delete copy eight items.

> Caption: The table breaks the same way: halving at half full makes every alternating insert and delete copy 8 items.

## Scene 10. Reading the question

*4:30 – 5:00 · objective: Name the three methods by what each one does — add, save, telescope — and connect the result to union-find and to the questions the exam asks.*

**4:30–4:37** — The most important application is union-find: alpha of n amortised per operation, at most four for any n below two to the sixty-five thousand five hundred and thirty-six.

> Caption: The most important application is union-find: alpha of n amortised per operation, at most 4 for any n below 2 to the 65536.

**4:37–4:45** — The exam asks for the total over n operations, or for the amortised cost per operation, or which potential function works.

> Caption: The exam asks for the total over n operations, or for the amortised cost per operation, or which potential function works.

**4:45–4:52** — Aggregate adds the bill. Accounting saves the change. Potential telescopes a function. Same conclusion, three routes.

> Caption: Aggregate adds the bill. Accounting saves the change. Potential telescopes a function. Same conclusion, three routes.

**4:52–5:00** — The one-line test: is the expensive step paid for by work already done? If yes, the amortised cost is small.

> Caption: The one-line test: is the expensive step paid for by work already done? If yes, the amortised cost is small.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
