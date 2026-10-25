# Partial Orders, Hasse Diagrams and Lattices — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/partial-orders-and-lattices/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. An order is a before-list

*0:00 – 0:30 · objective: See a partial order as a fully specified "must come before" relation, and see that its picture does not have to put every pair in a line.*

**0:00–0:08** — An order on a set says which elements must come before which. The symbol a is-below b means a comes before b, or a is the same element as b.

> Caption: An order on a set says which elements must come before which. The symbol a ⪯ b means a comes before b, or a is the same element as b.

**0:08–0:16** — Draw each element as a dot and each comparison as a line going upward. Two dots with no line either way are simply not compared.

> Caption: Draw each element as a dot and each comparison as a line going upward. Two dots with no line either way are simply not compared.

**0:16–0:23** — Divisibility is an order. On the divisors of 12, 1 is below everything and 12 is above everything, while 2 and 3 sit side by side.

> Caption: Divisibility is an order. On the divisors of 12, the number 1 is below everything and 12 is above everything, while 2 and 3 sit side by side.

**0:23–0:30** — That is why the word is partial: the order is completely known, but not every pair has to be in a line.

> Caption: That is why the word is partial: the order is completely known, but not every pair has to be in a line.

Exam-trap caption mode adds: *Partial does not mean incomplete. Every pair is decided; some pairs are simply decided as "no relation either way".*

## Scene 2. The three promises

*0:30 – 1:00 · objective: Test reflexivity on the diagonal, antisymmetry on mirror pairs, and transitivity on paths of two, and name the promise that usually fails.*

**0:30–0:38** — Promise one, reflexivity: every element comes before itself. In the matrix of the relation, the whole diagonal is ones.

> Caption: Promise one, reflexivity: every element comes before itself. In the matrix of the relation, the whole diagonal is ones.

**0:38–0:45** — Promise two, antisymmetry: if a comes before b and b comes before a, then a and b are the same element.

> Caption: Promise two, antisymmetry: if a comes before b and b comes before a, then a and b are the same element. No pair of ones mirrors across the diagonal.

Exam-trap caption mode adds: *Antisymmetric is not "not symmetric". The identity relation is symmetric and antisymmetric at the same time. The forbidden pattern is a two-way comparison between two distinct elements.*

**0:45–0:52** — Promise three, transitivity: if a comes before b and b comes before c, then a comes before c, whether or not the pair is written down.

> Caption: Promise three, transitivity: if a comes before b and b comes before c, then a comes before c, whether or not the pair is written down.

**0:52–1:00** — A relation with all three promises is a partial order, and the set together with it is a poset.

> Caption: A relation with all three promises is a partial order, and the set together with it is a poset. Take any promise away and it is not one.

Exam-trap caption mode adds: *A relation can be reflexive and transitive and still fail — antisymmetry is the promise that is most often missing. Test all three before concluding.*

## Scene 3. Comparable, chain, antichain

*1:00 – 1:30 · objective: Separate comparable from incomparable pairs, and see a total order as the special case where no pair is incomparable.*

**1:00–1:08** — Two elements are comparable when one comes before the other, and incomparable when neither does.

> Caption: Two elements are comparable when one comes before the other, and incomparable when neither does. Incomparable pairs are drawn side by side.

**1:08–1:15** — If every pair is comparable the order is total, and the whole set is called a chain.

> Caption: If every pair is comparable the order is total, and the whole set is called a chain. A chain is drawn as one straight line.

**1:15–1:23** — A set of elements that are pairwise incomparable is an antichain. In the divisors of 12 the set containing 2 and 3 is one.

> Caption: A set of elements that are pairwise incomparable is an antichain. In the divisors of 12 the set containing 2 and 3 is one.

**1:23–1:30** — In the divisors of 12, twelve pairs are comparable and three are not, so the order is partial and not total.

> Caption: In the divisors of 12, twelve pairs are comparable and three are not, so the order is partial and not total.

## Scene 4. The covering relation

*1:30 – 2:00 · objective: Strip an order down to its covers, and see that closing the covers gives the whole order back.*

**1:30–1:38** — Most of an order is redundant. The element b covers a when a is strictly below b and nothing sits strictly between them.

> Caption: Most of an order is redundant. The element b covers a when a is strictly below b and nothing sits strictly between them.

**1:38–1:45** — On the divisors of 12 the relation has eighteen pairs, and only seven of them are covers.

> Caption: On the divisors of 12 the relation has eighteen pairs, and only seven of them are covers.

Exam-trap caption mode adds: *Removing only the self-pairs is not enough. Transitivity also has to be stripped: twelve arrows remain after removing the diagonal, but only seven are covers.*

**1:45–1:53** — Close the seven covers transitively and the eighteen pairs come back exactly. Nothing has been lost.

> Caption: Close the seven covers transitively and the eighteen pairs come back exactly. Nothing has been lost.

**1:53–2:00** — So a question that says draw the poset always means the covers. A line between two elements is a cover, never a long comparison.

> Caption: So a question that says "draw the poset" always means the covers. A line between two elements is a cover, never a long comparison.

## Scene 5. Drawing the Hasse diagram

*2:00 – 2:30 · objective: Build the diagram from the covers, level by level, and read the order back off it by walking upward.*

**2:00–2:08** — A Hasse diagram puts a dot for each element, a line for each cover, larger elements higher, and no arrowheads and no self-loops.

> Caption: A Hasse diagram puts a dot for each element, a line for each cover, larger elements higher, and no arrowheads and no self-loops.

**2:08–2:16** — Place the minimal elements on the bottom row, then each element one row above the highest element it covers.

> Caption: Place the minimal elements on the bottom row, then each element one row above the highest element it covers.

**2:16–2:23** — Read the order by walking upward: if you can get from a to b going up along the lines, then a comes before b.

> Caption: Read the order by walking upward: if you can get from a to b going up along the lines, then a comes before b.

**2:23–2:30** — Height on the page is not the order. Only a path of lines is, so a diagram can be redrawn with dots moved and the order is unchanged.

> Caption: Height on the page is not the order. Only a path of lines is, so a diagram can be redrawn with dots moved and the order is unchanged.

Exam-trap caption mode adds: *A dot drawn higher is not thereby larger. Read the lines, not the layout — a common trap when a diagram is drawn with a maximal element lower than a non-maximal one.*

## Scene 6. Maximal against greatest

*2:30 – 3:00 · objective: Separate the local extremal elements from the global ones, and count them on two posets.*

**2:30–2:38** — An element is minimal when nothing is strictly below it, and maximal when nothing is strictly above it. Both are local statements.

> Caption: An element is minimal when nothing is strictly below it, and maximal when nothing is strictly above it. Both are local statements.

**2:38–2:46** — An element is the least when it is below every element, and the greatest when it is above every element. Both are global, and each is unique if it exists.

> Caption: An element is the least when it is below every element, and the greatest when it is above every element. Both are global, and each is unique if it exists.

**2:46–2:53** — Here a and b are both below c and below d. Both c and d are maximal, and there is no greatest element at all.

> Caption: Here a and b are both below c and below d. Both c and d are maximal, and there is no greatest element at all.

Exam-trap caption mode adds: *Counting maximal elements is the fast test. Two or more of them rule out a greatest element; exactly one, on a finite poset, is the greatest element.*

**2:53–3:00** — In the 2024 paper poset, 1 and 3 are minimal and 2 and 4 are maximal, so there is neither a least nor a greatest element.

> Caption: In the 2024 paper poset, 1 and 3 are minimal and 2 and 4 are maximal, so there is neither a least nor a greatest element.

## Scene 7. Bounds of a subset

*3:00 – 3:30 · objective: Find all upper and lower bounds of a named subset, then the least upper bound, and see that it need not be inside the subset.*

**3:00–3:08** — Fix a subset S. An upper bound of S is above every element of S, and a lower bound is below every element of S.

> Caption: Fix a subset S. An upper bound of S is above every element of S, and a lower bound is below every element of S.

**3:08–3:16** — In the divisors of 12 take S as the pair 4 and 6. The only upper bound is 12, so 12 is the least upper bound.

> Caption: In the divisors of 12 take S as the pair 4 and 6. The only upper bound is 12, so 12 is the least upper bound.

**3:16–3:23** — The lower bounds are 1 and 2, and the greatest of those is 2. So the meet of 4 and 6 is 2, which is their greatest common divisor.

> Caption: The lower bounds are 1 and 2, and the greatest of those is 2. So the meet of 4 and 6 is 2, which is their greatest common divisor.

Exam-trap caption mode adds: *The meet is the greatest lower bound, so it is the largest of the lower bounds. Answering with the least element of the poset is the standard slip.*

**3:23–3:30** — Notice that 12 is not in S, and that S has no greatest element. A bound and an extreme element are different objects.

> Caption: Notice that 12 is not in S, and that S has no greatest element. A bound and an extreme element are different objects.

Exam-trap caption mode adds: *The least upper bound of S need not belong to S, and S need not have a greatest element even when it has a least upper bound.*

## Scene 8. The lattice test

*3:30 – 4:00 · objective: Decide whether a poset is a lattice by testing every pair, and recognise the two shapes that make the test fail.*

**3:30–3:38** — A lattice is a poset in which every pair of elements has both a least upper bound and a greatest lower bound.

> Caption: A lattice is a poset in which every pair of elements has both a least upper bound and a greatest lower bound.

**3:38–3:46** — Two upper bounds that cannot be compared give no join. Two lower bounds that cannot be compared give no meet.

> Caption: Two upper bounds that cannot be compared give no join. Two lower bounds that cannot be compared give no meet.

**3:46–3:53** — The diamond is a lattice: 0 below three pairwise incomparable elements, all three below 1. The join of any two middles is 1 and the meet is 0.

> Caption: The diamond is a lattice: 0 below three pairwise incomparable elements, all three below 1. The join of any two middles is 1 and the meet is 0.

**3:53–4:00** — The 2024 poset fails the test: the pair 1 and 3 has upper bound 2 but no lower bound at all, so it has no meet.

> Caption: The 2024 poset fails the test: the pair 1 and 3 has upper bound 2 but no lower bound at all, so it has no meet.

Exam-trap caption mode adds: *A lattice is not a poset in which every subset has a bound — only every pair, which on a finite poset is equivalent. A question that says "complete lattice" is asking about all subsets, a strictly stronger condition.*

## Scene 9. Distributive and complemented

*4:00 – 4:30 · objective: Test distributivity with one triple, count complements, and see why M3 and N5 are the two obstructions.*

**4:00–4:08** — A lattice is distributive when meet distributes over join: a wedge the join of b and c equals the join of a wedge b and a wedge c, for every triple.

> Caption: A lattice is distributive when meet distributes over join: a ∧ (b ∨ c) equals (a ∧ b) ∨ (a ∧ c) for every triple.

**4:08–4:16** — M3 fails. With a, b and c the three middles, the left side is a meet 1 which is a, and the right side is 0 join 0 which is 0.

> Caption: M3 fails. With a, b, c the three middles, the left side is a ∧ 1 = a and the right side is 0 ∨ 0 = 0.

**4:16–4:23** — A complement of a is an element b with a join b equal to 1 and a meet b equal to 0. In M3 each middle element has two complements.

> Caption: A complement of a is an element b with a ∨ b = 1 and a ∧ b = 0. In M3 each middle element has two complements.

Exam-trap caption mode adds: *Two complements is evidence against distributivity, not a definition of it. Conversely, "not distributive" does not mean "no complements" — M3 is complemented and not distributive.*

**4:23–4:30** — The power set of a three-element set is distributive and every one of its eight elements has exactly one complement, the set difference.

> Caption: The power set of a three-element set is distributive and every one of its eight elements has exactly one complement, the set difference.

## Scene 10. Four rules to carry into the exam

*4:30 – 5:00 · objective: Consolidate the tests and the traps into four rules that cover the questions in this unit.*

**4:30–4:37** — Rule one: test the three promises separately. Antisymmetry is the one usually missing, and it is the one that makes the object an order.

> Caption: One: test the three promises separately. Antisymmetry is the one usually missing, and it is the one that makes the object an order.

**4:37–4:44** — Rule two: draw the covers, not the closure. Then read comparisons by walking upward along the lines.

> Caption: Two: draw the covers, not the closure. Then read comparisons by walking upward along the lines.

**4:44–4:52** — Rule three: keep maximal apart from greatest and minimal apart from least. Count them before answering.

> Caption: Three: keep maximal apart from greatest and minimal apart from least. Count them before answering.

Exam-trap caption mode adds: *Two maximal elements rule out a greatest element, and on a finite poset exactly one maximal element is automatically the greatest — so the count is the whole test.*

**4:52–5:00** — Rule four: a lattice needs a join and a meet for every pair. Then test distributivity with one triple, and count complements.

> Caption: Four: a lattice needs a join and a meet for every pair. Then test distributivity with one triple, and count complements.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
