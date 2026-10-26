# Counting and Combinatorics — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/counting-and-combinatorics/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Two rules, and nothing else

*0:00 – 0:30 · objective: Recognise that every count is a sum of alternatives or a product of stages, and choose the operation from the English connective rather than from the numbers.*

**0:00–0:08** — Every counting question is built from two moves. The sum rule: if a job can be done one way or another, add the counts.

> Caption: Every counting question is built from two moves. The sum rule: if a job can be done one way OR another, add the counts.

**0:08–0:16** — The product rule: if the job needs one thing AND then another, multiply the counts.

> Caption: The product rule: if the job needs one thing AND then another, multiply the counts.

**0:16–0:23** — Draw the product as a grid. Three rows and two columns, and every one of the six cells is one outfit — the grid is the multiplication.

> Caption: Draw the product as a grid. Three rows and two columns, and every one of the six cells is one outfit — the grid is the multiplication.

**0:23–0:30** — The connective decides the operation: or means add, and means multiply. But a plain sum needs the alternatives to be disjoint.

> Caption: The connective decides the operation: or means add, and means multiply. But a plain sum needs the alternatives to be disjoint.

Exam-trap caption mode adds: *Do not add just because you see the word "or". If one outcome can satisfy both clauses, the sum rule needs the overlap removed.*

## Scene 2. The four boxes

*0:30 – 1:00 · objective: Place a counting problem in one of four boxes by asking two yes/no questions — does order matter, may items repeat — and read the formula off the box.*

**0:30–0:38** — Two questions decide almost every counting formula: does the order of the chosen items matter, and may an item be chosen more than once?

> Caption: Two questions decide almost every counting formula: does the order of the chosen items matter, and may an item be chosen more than once?

**0:38–0:45** — Order matters and repetition is allowed: n to the power r, one independent choice of n things at each of r stages.

> Caption: Order matters and repetition is allowed: n to the power r, one independent choice of n things at each of r stages.

**0:45–0:52** — Order matters and repetition is banned: n times n minus one down to n minus r plus one, written P of n comma r.

> Caption: Order matters and repetition is banned: n times n minus one down to n minus r plus one, written P of n comma r.

**0:52–1:00** — Order does not matter: C of n comma r when repetition is banned, and C of n plus r minus one comma r when it is allowed.

> Caption: Order does not matter: C of n comma r when repetition is banned, and C of n plus r minus one comma r when it is allowed.

Exam-trap caption mode adds: *The bottom-right box is the one that is missed. It is not C of n comma r; it is C of n plus r minus one comma r, and the next scene shows where that comes from.*

## Scene 3. Divide out the order

*1:00 – 1:30 · objective: See a combination as a permutation with the r! internal orders merged, and use that one idea to justify every division in the unit.*

**1:00–1:08** — Take one combination — the set A, B, C — and write down every order of it. There are six.

> Caption: Take one combination — the set A, B, C — and write down every order of it. There are six.

**1:08–1:15** — Collapse the six into one. Permutations of r things from n are exactly r factorial times the combinations.

> Caption: Collapse the six into one. Permutations of r things from n are exactly r factorial times the combinations.

**1:15–1:23** — So C of n comma r is n factorial over r factorial times n minus r factorial, and the binomial row adds to two to the n.

> Caption: So C of n comma r is n factorial over r factorial times n minus r factorial, and the binomial row adds to two to the n.

**1:23–1:30** — Whenever a count comes out too big, find the thing you counted several times and divide by how many times.

> Caption: Whenever a count comes out too big, find the thing you counted several times and divide by how many times.

Exam-trap caption mode adds: *Divide only by a factor you can name. Dividing by "something that felt repeated" produces a number that looks plausible and is wrong.*

## Scene 4. Divide out what you cannot see

*1:30 – 2:00 · objective: Divide by the size of the symmetry group — rotations at a round table, repeated letters in a word — and check the divisor against a small case.*

**1:30–1:38** — Four people at a round table: seat them in a row and there are twenty-four orders, but the table can be rotated.

> Caption: Four people at a round table: seat them in a row and there are twenty-four orders, but the table can be rotated.

**1:38–1:45** — Twenty-four divided by four is six, and the general answer is n minus one factorial.

> Caption: Twenty-four divided by four is six, and the general answer is n minus one factorial.

**1:45–1:53** — The same move handles a word with a repeated letter. LILAC has five letters but only sixty distinct arrangements, not a hundred and twenty.

> Caption: The same move handles a word with a repeated letter. LILAC has five letters but only sixty distinct arrangements, not a hundred and twenty.

**1:53–2:00** — A necklace or a bracelet has more symmetry than a table: reflections count too, so the divisor is larger.

> Caption: A necklace or a bracelet has more symmetry than a table: reflections count too, so the divisor is larger.

Exam-trap caption mode adds: *A bracelet is not a round table. Dividing a bracelet count by n only is the standard slip; reflections add another factor of two.*

## Scene 5. Stars and bars

*2:00 – 2:30 · objective: Turn "identical items into distinct bins" into "choose where the bars go", and get combinations with repetition as one binomial coefficient.*

**2:00–2:08** — Five identical sweets into three named children. Write the five as stars, and separate the three shares with two bars.

> Caption: Five identical sweets into three named children. Write the five as stars, and separate the three shares with two bars.

**2:08–2:15** — Every pattern of five stars and two bars is one distribution, and every distribution is one pattern. So count the patterns.

> Caption: Every pattern of five stars and two bars is one distribution, and every distribution is one pattern. So count the patterns.

**2:15–2:23** — Seven positions choose two is twenty-one, and in general n plus r minus one choose r. The bars are the thing you choose.

> Caption: Seven positions choose two is twenty-one, and in general n plus r minus one choose r. The bars are the thing you choose.

**2:23–2:30** — Change the condition and the pattern changes. Each bin at least one means no two bars touch, so reserve one star per bin first.

> Caption: Change the condition and the pattern changes. Each bin at least one means no two bars touch, so reserve one star per bin first.

Exam-trap caption mode adds: *"At least one in every bin" is not C of n plus r minus one comma r. Subtracting one item per bin first is what makes the count right.*

## Scene 6. Inclusion and exclusion

*2:30 – 3:00 · objective: Repair the sum rule when the sets overlap, with the alternating signs, and apply it to a divisibility count.*

**2:30–2:38** — Two sets that overlap. Adding their sizes counts the overlap twice, so subtract it once.

> Caption: Two sets that overlap. Adding their sizes counts the overlap twice, so subtract it once.

**2:38–2:45** — Three sets: add the singles, subtract the pairs, add the triple back. The signs alternate, and the last term is not a mistake.

> Caption: Three sets: add the singles, subtract the pairs, add the triple back. The signs alternate, and the last term is not a mistake.

**2:45–2:53** — Between 1 and 500 there are 166 multiples of 3, 100 of 5 and 71 of 7. Add: 337. Subtract the pairs: 267.

> Caption: Between 1 and 500 there are 166 multiples of 3, 100 of 5 and 71 of 7. Add: 337. Subtract the pairs: 267.

**2:53–3:00** — The answer is 271. Inclusion and exclusion is also the engine behind counting surjections and derangements, later in this lesson.

> Caption: The answer is 271. Inclusion and exclusion is also the engine behind counting surjections and derangements, later in this lesson.

Exam-trap caption mode adds: *The commonest error is to stop after subtracting the pairs and forget to add the triple back, which loses the elements in all three sets.*

## Scene 7. The pigeonhole principle

*3:00 – 3:30 · objective: Distinguish a count from a guarantee, and read the generalised form as a ceiling: N pigeons in k holes force a hole with at least the ceiling of N over k.*

**3:00–3:08** — Five pigeons into four holes. However you place them, some hole holds at least two. That is not a probability; it is forced.

> Caption: Five pigeons into four holes. However you place them, some hole holds at least two. That is not a probability; it is forced.

**3:08–3:15** — Generalised: N pigeons in k holes force some hole to hold at least the ceiling of N over k.

> Caption: Generalised: N pigeons in k holes force some hole to hold at least the ceiling of N over k.

**3:15–3:23** — A deck has four suits. Two cards per suit is eight cards with no three of a kind, so nine cards guarantee three of one suit.

> Caption: A deck has four suits. Two cards per suit is eight cards with no three of a kind, so nine cards guarantee three of one suit.

**3:23–3:30** — The direction of the inequality is the whole question. More objects than holes forces a collision; fewer objects proves nothing.

> Caption: The direction of the inequality is the whole question. More objects than holes forces a collision; fewer objects proves nothing.

Exam-trap caption mode adds: *The classic inversion: a question asks for the minimum that guarantees a collision and the answer is given as the number of holes. The answer is one more than the largest collision-free arrangement.*

## Scene 8. Counting functions between finite sets

*3:30 – 4:00 · objective: Count all functions, injections and surjections on the same pair of sets, and see why only surjections need inclusion and exclusion.*

**3:30–3:38** — A function from a four-element set to a three-element set is four independent choices, one image per element. That is eighty-one.

> Caption: A function from a four-element set to a three-element set is four independent choices, one image per element. That is eighty-one.

**3:38–3:45** — An injection forbids repetition, so the count is P of n comma r — and it is zero as soon as the domain is larger than the codomain.

> Caption: An injection forbids repetition, so the count is P of n comma r — and it is zero as soon as the domain is larger than the codomain.

**3:45–3:53** — A surjection must hit all three images, which is an "at least one" condition. Inclusion and exclusion gives 81 minus 48 plus 3.

> Caption: A surjection must hit all three images, which is an "at least one" condition. Inclusion and exclusion gives 81 minus 48 plus 3.

**3:53–4:00** — Only the surjection count needs the repair. All functions is a product, injections a falling product, and surjections an alternating sum.

> Caption: Only the surjection count needs the repair. All functions is a product, injections a falling product, and surjections an alternating sum.

Exam-trap caption mode adds: *The words "function" and "one to one function" and "onto function" give three different counts on the same sets. Read which one is asked before computing.*

## Scene 9. Derangements

*4:00 – 4:30 · objective: Count the arrangements that fix nothing by subtracting the arrangements that fix something, and apply it to a word with a repeated letter.*

**4:00–4:08** — A derangement is an arrangement that leaves nothing in its original place. Three items have six arrangements and two derangements.

> Caption: A derangement is an arrangement that leaves nothing in its original place. Three items have six arrangements and two derangements.

**4:08–4:15** — Count the complement instead: six total, minus those fixing at least one position. Subtract the singles, add the pairs, subtract the triple.

> Caption: Count the complement instead: six total, minus those fixing at least one position. Subtract the singles, add the pairs, subtract the triple.

**4:15–4:23** — The sequence runs 0, 1, 2, 9, 44, 265, and it is always the nearest integer to n factorial over e.

> Caption: The sequence runs 0, 1, 2, 9, 44, 265, and it is always the nearest integer to n factorial over e.

**4:23–4:30** — LILAC: sixty distinct arrangements, and twelve leave no letter in its own place. The repeated L is handled before the derangement count.

> Caption: LILAC: sixty distinct arrangements, and twelve leave no letter in its own place. The repeated L is handled before the derangement count.

Exam-trap caption mode adds: *A repeated letter must be collapsed first. Deranging the hundred and twenty labelled arrangements and then dividing by two is a different, and usually wrong, procedure.*

## Scene 10. The decision procedure and four traps

*4:30 – 5:00 · objective: Consolidate the unit into one ordered checklist, and name the four errors that cost marks in this topic.*

**4:30–4:38** — One checklist, in order: are the objects distinct or identical, does order matter, may items repeat, and is there a condition?

> Caption: One checklist, in order: are the objects distinct or identical, does order matter, may items repeat, and is there a condition?

**4:38–4:45** — Trap one: multiplying when the stages are not independent. Trap two: forgetting to divide by the internal order.

> Caption: Trap one: multiplying when the stages are not independent. Trap two: forgetting to divide by the internal order.

**4:45–4:53** — Trap three: adding overlapping alternatives. Trap four: reading a pigeonhole guarantee as an exact count.

> Caption: Trap three: adding overlapping alternatives. Trap four: reading a pigeonhole guarantee as an exact count.

**4:53–5:00** — Check every answer on the smallest case you can list by hand. That single habit catches all four traps.

> Caption: Check every answer on the smallest case you can list by hand. That single habit catches all four traps.

Exam-trap caption mode adds: *An answer that matches a remembered formula is not checked. A remembered formula applied to the wrong box is the commonest way to lose this mark.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
