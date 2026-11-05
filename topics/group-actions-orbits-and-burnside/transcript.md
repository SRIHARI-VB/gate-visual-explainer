# Group Actions Orbits And Burnside — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/group-actions-orbits-and-burnside/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 50 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A group that moves things

*0:00 – 0:30 · objective: See the eight symmetries of a square as eight ways of moving its corners, and see one corner reach all four: the group acts on the object.*

**0:00–0:06** — A square has eight symmetries. Four turn it, four flip it. Each one moves the four corners around.

> Caption: A square has eight symmetries. Four turn it, four flip it. Each one moves the four corners around.

**0:06–0:12** — Follow one corner. A quarter turn sends it to its neighbour, a half turn to the opposite corner, a flip across a diagonal keeps it still.

> Caption: Follow one corner. A quarter turn sends it to its neighbour, a half turn to the opposite corner, a flip across a diagonal keeps it still.

**0:12–0:18** — That is what an action is: a group whose elements move the points of a set. The group is D4, the set is the four corners.

> Caption: That is what an action is: a group whose elements move the points of a set. The group is D4, the set is the four corners.

**0:18–0:24** — Change the set and the same group behaves differently. On the six segments, the four sides stay together and the two diagonals stay together.

> Caption: Change the set and the same group behaves differently. On the six segments, the four sides stay together and the two diagonals stay together.

**0:24–0:30** — So one group can act on many sets, and the picture it produces depends on the set, not on the group alone.

> Caption: So one group can act on many sets, and the picture it produces depends on the set, not on the group alone.

## Scene 2. The two axioms an action must obey

*0:30 – 1:00 · objective: State an action as a map from group and point to point, with the identity fixing every point and the group law composing, and check both on real tables.*

**0:30–0:36** — Formally: a map that takes a group element and a point to a point, written g dot x, obeying two rules.

> Caption: Formally: a map that takes a group element and a point to a point, written g dot x, obeying two rules.

**0:36–0:42** — Rule one: the identity moves nothing. The identity element leaves every point exactly where it was.

> Caption: Rule one: the identity moves nothing. The identity element leaves every point exactly where it was.

**0:42–0:48** — Rule two: doing g after h is the same as doing the product gh once. Move first, then compose, or compose first, then move.

> Caption: Rule two: doing g after h is the same as doing the product gh once. Move first, then compose, or compose first, then move.

**0:48–0:54** — Both rules are checked here by building the full table of moves and testing every triple, not by trusting the picture.

> Caption: Both rules are checked here by building the full table of moves and testing every triple, not by trusting the picture.

**0:54–1:00** — Two rules, and everything else in this lesson is a consequence: orbits, stabilisers, the size identity, and the counting formula.

> Caption: Two rules, and everything else in this lesson is a consequence: orbits, stabilisers, the size identity, and the counting formula.

## Scene 3. The orbit: everything a point can reach

*1:00 – 1:30 · objective: Define the orbit of a point, see that orbits are the classes of an equivalence relation and so partition the set, and see two orbits of different sizes inside one action.*

**1:00–1:06** — The orbit of a point is everything it can reach: apply every element of the group and collect the results.

> Caption: The orbit of a point is everything it can reach: apply every element of the group and collect the results.

**1:06–1:12** — Being in the same orbit is an equivalence relation, so the orbits split the set into disjoint blocks with nothing left over.

> Caption: Being in the same orbit is an equivalence relation, so the orbits split the set into disjoint blocks with nothing left over.

**1:12–1:18** — On the six segments there are two orbits, of sizes four and two. Different sizes in one action are normal, not a mistake.

> Caption: On the six segments there are two orbits, of sizes four and two. Different sizes in one action are normal, not a mistake.

Exam-trap caption mode adds: *Assuming all orbits have the same size. On the six segments of a square they are four and two, because a side and a diagonal have different stabilisers.*

**1:18–1:24** — A transitive action is one with a single orbit: every point reaches every point. The corners of the square are transitive.

> Caption: A transitive action is one with a single orbit: every point reaches every point. The corners of the square are transitive.

**1:24–1:30** — The count of orbits is the number of genuinely different objects once symmetry is ignored. That count is the thing this lesson computes.

> Caption: The count of orbits is the number of genuinely different objects once symmetry is ignored. That count is the thing this lesson computes.

## Scene 4. The stabiliser: the symmetries that leave a point alone

*1:30 – 2:00 · objective: Define the stabiliser of a point, verify from the table that it is a subgroup, and see that it is not normal in general: conjugating it gives the stabiliser of the moved point.*

**1:30–1:36** — The stabiliser of a point is the set of group elements that leave it exactly where it is.

> Caption: The stabiliser of a point is the set of group elements that leave it exactly where it is.

**1:36–1:42** — The stabiliser is always a subgroup. It contains the identity, and if two elements fix the point then so does their product and their inverse.

> Caption: The stabiliser is always a subgroup. It contains the identity, and if two elements fix the point then so does their product and their inverse.

**1:42–1:48** — It is a subgroup but not in general a normal one. Conjugating the stabiliser of a corner gives the stabiliser of the corner it moved to.

> Caption: It is a subgroup but not in general a normal one. Conjugating the stabiliser of a corner gives the stabiliser of the corner it moved to.

Exam-trap caption mode adds: *Concluding "subgroup therefore normal". The stabiliser of a corner in D4 is a subgroup of order two and is not normal, because its two conjugates are the two different diagonal reflections.*

**1:48–1:54** — So points in one orbit have stabilisers of the same size, related by conjugation. Same orbit, same amount of symmetry.

> Caption: So points in one orbit have stabilisers of the same size, related by conjugation. Same orbit, same amount of symmetry.

**1:54–2:00** — Two named extremes. A free action has every stabiliser trivial. A point fixed by the whole group has stabiliser equal to the group.

> Caption: Two named extremes. A free action has every stabiliser trivial. A point fixed by the whole group has stabiliser equal to the group.

## Scene 5. Orbit-stabiliser: the group size factors

*2:00 – 2:30 · objective: State and use |G| = |orbit| times |stabiliser|, verified on every point of every action, and read the two extreme cases: a transitive action and a free one.*

**2:00–2:06** — The orbit-stabiliser theorem: the size of the group equals the size of the orbit times the size of the stabiliser.

> Caption: The orbit-stabiliser theorem: the size of the group equals the size of the orbit times the size of the stabiliser.

**2:06–2:12** — On the corners: eight is four times two. On a diagonal: eight is two times four. On three points of S3: six is three times two.

> Caption: On the corners: eight is four times two. On a diagonal: eight is two times four. On three points of S3: six is three times two.

**2:12–2:18** — Why it is true: send each group element to the point it moves x to. Every point of the orbit gets exactly as many senders as the stabiliser has elements.

> Caption: Why it is true: send each group element to the point it moves x to. Every point of the orbit gets exactly as many senders as the stabiliser has elements.

**2:18–2:24** — It is checked on every point of every action here: 355 tests, no exception. The identity is read off the table, never assumed.

> Caption: It is checked on every point of every action here: 355 tests, no exception. The identity is read off the table, never assumed.

**2:24–2:30** — One consequence to keep: orbit size always divides the group order, because the stabiliser size is a whole number.

> Caption: One consequence to keep: orbit size always divides the group order, because the stabiliser size is a whole number.

## Scene 6. Burnside's lemma: average the fixed points

*2:30 – 3:00 · objective: Count orbits by averaging the number of points each group element fixes, watch the naive division fail, and see the average agree with a brute-force orbit count.*

**2:30–2:36** — Burnside's lemma: the number of orbits equals the average number of points each group element fixes.

> Caption: Burnside's lemma: the number of orbits equals the average number of points each group element fixes.

**2:36–2:42** — The four rotations fix 16, 2, 4 and 2 of the sixteen two-colourings. The average is 24 over 4, which is 6.

> Caption: The four rotations fix 16, 2, 4 and 2 of the sixteen two-colourings. The average is 24 over 4, which is 6.

**2:42–2:48** — Six is also the count you get by listing every colouring and grouping it with its rotated copies. The average and the listing agree.

> Caption: Six is also the count you get by listing every colouring and grouping it with its rotated copies. The average and the listing agree.

**2:48–2:54** — Why dividing by the group size naively fails: sixteen colourings over eight symmetries is two, and the answer is six.

> Caption: Why dividing by the group size naively fails: sixteen colourings over eight symmetries is two, and the answer is six.

Exam-trap caption mode adds: *Dividing the number of colourings by the group size. For 16 two-colourings under 8 symmetries that gives 2, while the true count is 6, because objects with more symmetry are counted fewer times in the list.*

**2:54–3:00** — The average is right because counting pairs of element and fixed point, in either order, gives the same total.

> Caption: The average is right because counting pairs of element and fixed point, in either order, gives the same total.

## Scene 7. Necklaces and bracelets: six beads, two colours

*3:00 – 3:30 · objective: Run the average on 64 two-coloured six-bead strings under the six rotations (14) and under the twelve symmetries (13), and see why 64 divided by 6 is not the answer.*

**3:00–3:06** — Six beads in a circle, two colours. There are 64 strings. How many are genuinely different if turning the necklace is allowed?

> Caption: Six beads in a circle, two colours. There are 64 strings. How many are genuinely different if turning the necklace is allowed?

**3:06–3:12** — The six rotations fix 64, 2, 4, 8, 4 and 2 strings. The sum is 84, and 84 over 6 is 14 necklaces.

> Caption: The six rotations fix 64, 2, 4, 8, 4 and 2 strings. The sum is 84, and 84 over 6 is 14 necklaces.

**3:12–3:18** — Now allow flipping as well: twelve symmetries, fixed counts 64, 2, 4, 8, 4, 2 and six reflections, and the answer is 13.

> Caption: Now allow flipping as well: twelve symmetries, fixed counts 64, 2, 4, 8, 4, 2 and six reflections, and the answer is 13.

**3:18–3:24** — Fourteen and thirteen differ by one. The group you divide by is part of the answer, not a detail.

> Caption: Fourteen and thirteen differ by one. The group you divide by is part of the answer, not a detail.

Exam-trap caption mode adds: *Using the dihedral group when the question only allows rotation, or the reverse. Six beads in two colours give 14 by rotation and 13 with reflections.*

**3:24–3:30** — And 64 divided by 6 is 10.67, not 14. The strings are not spread evenly over the necklaces, which is exactly what the average repairs.

> Caption: And 64 divided by 6 is 10.67, not 14. The strings are not spread evenly over the necklaces, which is exactly what the average repairs.

## Scene 8. k colours on a square: the two formulas

*3:30 – 4:00 · objective: Derive (k^4 + k^2 + 2k)/4 for rotations and (k^4 + 2k^3 + 3k^2 + 2k)/8 for the full symmetry group, and check both against brute force for k = 1 to 4.*

**3:30–3:36** — Generalise: paint the four corners with k colours. Rotations only gives k to the fourth plus k squared plus 2k, all over 4.

> Caption: Generalise: paint the four corners with k colours. Rotations only gives k to the fourth plus k squared plus 2k, all over 4.

**3:36–3:42** — Add the four reflections: two diagonals fix k cubed each, two side-midpoint lines fix k squared each. Divide by 8.

> Caption: Add the four reflections: two diagonals fix k cubed each, two side-midpoint lines fix k squared each. Divide by 8.

**3:42–3:48** — For k equal to 3 the two answers are 24 and 21. The gap of three is the three paintings that are mirror images and not rotations.

> Caption: For k equal to 3 the two answers are 24 and 21. The gap of three is the three paintings that are mirror images and not rotations.

**3:48–3:54** — The table: k of 1, 2, 3, 4, 5 gives 1, 6, 24, 70, 165 by rotation and 1, 6, 21, 55, 120 with reflections.

> Caption: The table: k of 1, 2, 3, 4, 5 gives 1, 6, 24, 70, 165 by rotation and 1, 6, 21, 55, 120 with reflections.

**3:54–4:00** — Both formulas are re-derived here from the fixed-point counts, and both are checked against enumerating every colouring for k up to 4.

> Caption: Both formulas are re-derived here from the fixed-point counts, and both are checked against enumerating every colouring for k up to 4.

## Scene 9. Two actions you already know

*4:00 – 4:30 · objective: Recognise left multiplication on the group itself (Cayley) and conjugation on the group itself (conjugacy classes), and see Burnside count the classes of S3 and D4.*

**4:00–4:06** — Left multiplication: let a group act on its own elements by multiplying on the left. One orbit, of size the group order.

> Caption: Left multiplication: let a group act on its own elements by multiplying on the left. One orbit, of size the group order.

**4:06–4:12** — Orbit-stabiliser then says the orbit of the identity has the size of the group. That is the standard proof of Cayley’s theorem.

> Caption: Orbit-stabiliser then says the orbit of the identity has the size of the group. That is the standard proof of Cayley’s theorem.

**4:12–4:18** — Conjugation: let the group act on itself by g h g inverse. The orbits are the conjugacy classes.

> Caption: Conjugation: let the group act on itself by g h g inverse. The orbits are the conjugacy classes.

**4:18–4:24** — So Burnside counts conjugacy classes: 18 over 6 is 3 for S3, and 40 over 8 is 5 for D4.

> Caption: So Burnside counts conjugacy classes: 18 over 6 is 3 for S3, and 40 over 8 is 5 for D4.

**4:24–4:30** — One idea, three questions: how many distinct objects, how large is an orbit, and how many classes are there. Same average, same identity.

> Caption: One idea, three questions: how many distinct objects, how large is an orbit, and how many classes are there. Same average, same identity.

## Scene 10. How GATE asks it, and the four traps

*4:30 – 5:00 · objective: Reduce a counting question to naming the group, the set and the fixed-point counts, and avoid the four traps: naive division, wrong group, swapped roles, normal stabiliser.*

**4:30–4:36** — Four steps: name the group, name the set it acts on, count the points each element fixes, divide by the group order.

> Caption: Four steps: name the group, name the set it acts on, count the points each element fixes, divide by the group order.

**4:36–4:42** — The shortcut that does most of the work: a permutation with c cycles fixes exactly k to the c colourings, where k is the number of colours.

> Caption: The shortcut that does most of the work: a permutation with c cycles fixes exactly k to the c colourings, where k is the number of colours.

**4:42–4:48** — Trap one: dividing the total by the group order. Trap two: using the wrong group, rotation only against rotation and reflection.

> Caption: Trap one: dividing the total by the group order. Trap two: using the wrong group, rotation only against rotation and reflection.

Exam-trap caption mode adds: *Dividing 16 colourings by 8 symmetries to get 2, or 64 strings by 6 rotations to get 10.67. Both are wrong because objects with more symmetry appear fewer times in the list.*

**4:48–4:54** — Trap three: swapping orbit and stabiliser in the size identity. Trap four: assuming a stabiliser is normal because it is a subgroup.

> Caption: Trap three: swapping orbit and stabiliser in the size identity. Trap four: assuming a stabiliser is normal because it is a subgroup.

**4:54–5:00** — One line to carry: orbits are what you count, stabilisers are how much symmetry one point has, and the average over the group joins them.

> Caption: One line to carry: orbits are what you count, stabilisers are how much symmetry one point has, and the average over the group joins them.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
