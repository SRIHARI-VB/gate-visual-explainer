# Group Isomorphism and the Invariant Hunt: Same Order Is Not the Same Group — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/group-isomorphism-and-invariants/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 50 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Two groups of order 4, and one question

*0:00 – 0:30 · objective: See that two groups can satisfy every axiom, have the same number of elements, and still be different objects, so the axioms alone cannot answer the question.*

**0:00–0:06** — Two groups of order 4. Both satisfy every axiom. Both have four elements. Are they the same group?

> Caption: Two groups of order 4. Both satisfy every axiom. Both have four elements. Are they the same group?

**0:06–0:12** — On the left, the integers 0 to 3 under addition mod 4. On the right, pairs of bits added component by component.

> Caption: On the left, the integers 0 to 3 under addition mod 4. On the right, pairs of bits added component by component.

**0:12–0:18** — The axioms cannot separate them. Everything the axioms demand is true of both. Only the tables differ.

> Caption: The axioms cannot separate them. Everything the axioms demand is true of both. Only the tables differ.

**0:18–0:24** — A relabelling is a bijection that also respects the table. phi of a plus b equals phi of a plus phi of b.

> Caption: A relabelling is a bijection that also respects the table: phi of a plus b equals phi of a plus phi of b.

**0:24–0:30** — Z4 has one element of order 2. V4 has three. A relabelling preserves order, so no relabelling exists.

> Caption: Z4 has one element of order 2. V4 has three. A relabelling preserves order, so no relabelling exists.

## Scene 2. The definition, and what it forces

*0:30 – 1:00 · objective: State an isomorphism as a bijection preserving the operation, derive the three consequences that come free, and see that the relation is an equivalence.*

**0:30–0:36** — Two groups are isomorphic when a bijection exists that preserves the operation. The bijection is the definition.

> Caption: Two groups are isomorphic when a bijection exists that preserves the operation. The bijection is the definition.

**0:36–0:42** — Three things come free. The identity goes to the identity, inverses to inverses, and the order of every element is preserved.

> Caption: Three things come free: the identity goes to the identity, inverses to inverses, and the order of every element is preserved.

**0:42–0:48** — Isomorphism is an equivalence relation. Reflexive by the identity map, symmetric by inverting the bijection, transitive by composing two of them.

> Caption: Isomorphism is an equivalence relation. Reflexive by the identity map, symmetric by inverting the bijection, transitive by composing two of them.

**0:48–0:54** — Checked here on four groups of order 6. Reflexive 4 of 4, symmetric on all 12 ordered pairs, transitive on all 64 ordered triples.

> Caption: Checked here on four groups of order 6: reflexive 4 of 4, symmetric on all 12 ordered pairs, transitive on all 64 ordered triples.

**0:54–1:00** — So isomorphic means the same group with the elements renamed. Every question answerable from the table has the same answer in both.

> Caption: So isomorphic means: the same group with the elements renamed. Every question answerable from the table has the same answer in both.

## Scene 3. A witness: Z6 is Z2 x Z3

*1:00 – 1:30 · objective: Prove two groups are the same by writing the map down and checking it on all 36 pairs, and see that a proof of sameness is always a witness.*

**1:00–1:06** — Now the other direction. Claim: Z6 and Z2 x Z3 are the same group. The proof is a map.

> Caption: Now the other direction. Claim: Z6 and Z2 x Z3 are the same group. The proof is a map.

**1:06–1:12** — The candidate is phi of x equals x mod 2 paired with x mod 3. Send each number to its two remainders.

> Caption: The candidate is phi of x equals x mod 2 paired with x mod 3. Send each number to its two remainders.

**1:12–1:18** — Thirty-six ordered pairs to check. A pair a and b is fine when phi of a plus b equals phi of a plus phi of b.

> Caption: Thirty-six ordered pairs to check. A pair a and b is fine when phi of a plus b equals phi of a plus phi of b.

**1:18–1:24** — Zero violations in thirty-six. And the order of each element is preserved, six of six, which the definition guarantees.

> Caption: Zero violations in thirty-six. And the order of each element is preserved, six of six, which the definition guarantees.

**1:24–1:30** — So the two are one group. A proof of sameness is always a witness; a proof of difference is always an invariant.

> Caption: So the two are one group. A proof of sameness is always a witness; a proof of difference is always an invariant.

## Scene 4. The invariants: what a relabelling cannot change

*1:30 – 2:00 · objective: Name the six numbers a relabelling must preserve, and see that a mismatch is a proof while a match is not.*

**1:30–1:36** — An invariant is a number you can compute from the table that a relabelling cannot change. Six of them are enough for this lesson.

> Caption: An invariant is a number you can compute from the table that a relabelling cannot change. Six of them are enough for this lesson.

**1:36–1:42** — One: the order of the group. Two: whether it is abelian. Three: the element-order profile, which is how many elements have each order.

> Caption: One: the order of the group. Two: whether it is abelian. Three: the element-order profile, which is how many elements have each order.

**1:42–1:48** — Four: the size of the centre. Five: how many subgroups of each order. Six: the automorphism count, the number of relabellings of a group onto itself.

> Caption: Four: the size of the centre. Five: how many subgroups of each order. Six: the automorphism count, which is the number of relabellings of a group onto itself.

**1:48–1:54** — A mismatch in any one of them proves the groups differ. That direction is airtight, and it is all an exam answer needs.

> Caption: A mismatch in any one of them proves the groups differ. That direction is airtight, and it is all an exam answer needs.

**1:54–2:00** — A match proves nothing yet. Every one of these is necessary, and the next scenes show that none of them is sufficient.

> Caption: A match proves nothing yet. Every one of these is necessary, and the next scenes show that none of them is sufficient.

## Scene 5. Order 4: Z4 against V4

*2:00 – 2:30 · objective: Separate the two groups of order 4 by counting elements of order 2, and watch the pruned search confirm it without testing a single product.*

**2:00–2:06** — Order 4, the first real case. Z4 on the left, V4 on the right. Both abelian, so the abelianness test is useless here.

> Caption: Order 4, the first real case. Z4 on the left, V4 on the right. Both abelian, so the abelianness test is useless here.

**2:06–2:12** — In Z4 the element orders are 1, 4, 2, 4. One element has order 2, two have order 4, and the identity has order 1.

> Caption: In Z4 the element orders are 1, 4, 2, 4. One element has order 2, two have order 4, and the identity has order 1.

**2:12–2:18** — In V4 every non-identity element has order 2. The profile is one of order 1 and three of order 2, with nothing above.

> Caption: In V4 every non-identity element has order 2. The profile is one of order 1 and three of order 2, with nothing above.

**2:18–2:24** — One against three. A bijection sends elements of order 2 to elements of order 2, so this one cannot exist.

> Caption: One against three. A bijection sends elements of order 2 to elements of order 2, so this one cannot exist.

**2:24–2:30** — The search agrees and never tests a product. Six bijections fix the identity, the profile filter removes all six, zero survive.

> Caption: The search agrees and never tests a product: six bijections fix the identity, the profile filter removes all six, zero survive.

## Scene 6. Order 6: Z6 against S3

*2:30 – 3:00 · objective: Use abelianness as the one-line invariant that separates the two groups of order 6, and see the profile agree for a second reason.*

**2:30–2:36** — Order 6. Z6 against S3, the permutations of three objects. Six elements each, so the first invariant fails.

> Caption: Order 6. Z6 against S3, the permutations of three objects. Six elements each, so the first invariant fails.

**2:36–2:42** — Z6 is abelian. a plus b equals b plus a for all thirty-six pairs. Every subgroup of an abelian group is normal.

> Caption: Z6 is abelian: a plus b equals b plus a for all thirty-six pairs. Every subgroup of an abelian group is normal.

**2:42–2:48** — S3 is not. The transposition 0 1 and the three-cycle 0 1 2 give different answers in the two orders.

> Caption: S3 is not. The transposition 0 1 and the three-cycle 0 1 2 give different answers in the two orders.

**2:48–2:54** — Abelianness is preserved by every isomorphism, so one line settles it. The profile agrees, and says it a second way.

> Caption: Abelianness is preserved by every isomorphism, so one line settles it. The profile agrees, and says it a second way.

**2:54–3:00** — The search. 120 bijections fix the identity, the profile filter removes all of them, and no product is tested.

> Caption: The search: 120 bijections fix the identity, the profile filter removes all of them, and no product is tested.

## Scene 7. Order 8: D4 against Q8

*3:00 – 3:30 · objective: Separate two non-abelian groups of order 8 whose order, abelianness and centre all match, using only the element-order profile.*

**3:00–3:06** — Order 8. Now the cheap invariants run out. D4 against Q8. Both non-abelian, both with a centre of size 2.

> Caption: Order 8. Now the cheap invariants run out. D4 against Q8: both non-abelian, both with a centre of size 2.

**3:06–3:12** — In D4 the element orders are 1, 4, 2, 4, 2, 2, 2, 2. Two elements of order 4 and five of order 2.

> Caption: In D4 the element orders are 1, 4, 2, 4, 2, 2, 2, 2. Two elements of order 4 and five of order 2.

**3:12–3:18** — In Q8 the element orders are 1, 4, 2, 4, 2, 4, 2, 4. Six elements of order 4 and only one of order 2.

> Caption: In Q8 the element orders are 1, 4, 2, 4, 2, 4, 2, 4. Six elements of order 4 and only one of order 2.

**3:18–3:24** — Five against one. The profiles disagree, so D4 and Q8 are not isomorphic, and nothing else had to be computed.

> Caption: Five against one. The profiles disagree, so D4 and Q8 are not isomorphic, and nothing else had to be computed.

**3:24–3:30** — The subgroup counts agree here, three of order 4 each, and the automorphism counts do not. 8 for D4 against 24 for Q8.

> Caption: The subgroup counts agree here, three of order 4 each, and the automorphism counts do not: 8 for D4 against 24 for Q8.

## Scene 8. The test that always works

*3:30 – 4:00 · objective: See isomorphism decided by a finite search over all bijections fixing the identity, and see the profile test as that search with the impossible candidates removed.*

**3:30–3:36** — There is a test that always works. Try every bijection that sends the identity to the identity, and check every product.

> Caption: There is a test that always works. Try every bijection that sends the identity to the identity, and check every product.

**3:36–3:42** — Order 4 costs 6 bijections and 96 product checks. Order 6 costs 120 and 4320. Order 8 costs 5040 and 322560.

> Caption: Order 4 costs 6 bijections and 96 product checks. Order 6 costs 120 and 4320. Order 8 costs 5040 and 322560.

**3:42–3:48** — Now prune it. Skip any candidate that sends an element of order d to an element of a different order.

> Caption: Now prune it. Skip any candidate that sends an element of order d to an element of a different order.

**3:48–3:54** — D4 against Q8. 5040 candidates become zero before a single product is tested. The profile test is the search.

> Caption: D4 against Q8: 5040 candidates become zero before a single product is tested. The profile test is the search.

**3:54–4:00** — Z6 against Z2 x Z3. Four candidates survive the filter, and two of them pass the product test. Those two are the isomorphisms.

> Caption: Z6 against Z2 x Z3: four candidates survive the filter, and two of them pass the product test. Those two are the isomorphisms.

## Scene 9. Where the profile stops

*4:00 – 4:30 · objective: Exhibit two groups of order 16 with identical element-order profiles and no isomorphism, so a matching profile is never a proof of sameness.*

**4:00–4:06** — Now the trap. Two groups of order 16 on this page have the same element-order profile and are not the same group.

> Caption: Now the trap. Two groups of order 16 on this page have the same element-order profile and are not the same group.

**4:06–4:12** — Z4 x Z4 and Q8 x Z2. Both order 16, both with 1 element of order 1, 3 of order 2 and 12 of order 4.

> Caption: Z4 x Z4 and Q8 x Z2: both order 16, both with 1 element of order 1, 3 of order 2 and 12 of order 4.

**4:12–4:18** — But one is abelian and the other is not. Two groups with the same profile, and no isomorphism between them.

> Caption: But one is abelian and the other is not. Two groups with the same profile, and no isomorphism between them.

**4:18–4:24** — So a matching profile is never a proof of sameness. It removes candidates. It does not produce a map.

> Caption: So a matching profile is never a proof of sameness. It removes candidates. It does not produce a map.

**4:24–4:30** — A mismatching invariant is always a proof of difference. A matching one never is. That single sentence is the topic.

> Caption: A mismatching invariant is always a proof of difference. A matching one never is. That single sentence is the topic.

## Scene 10. The decision procedure, and how it is asked

*4:30 – 5:00 · objective: Run the four-step procedure cheapest-first, mark which steps prove difference and which alone can prove sameness, and read a previous-year question through it.*

**4:30–4:36** — The procedure, cheapest first. Compare the order, then abelianness, then the element-order profile, then write the map.

> Caption: The procedure, cheapest first: compare the order, then abelianness, then the element-order profile, then write the map.

**4:36–4:42** — A question that asks how many non-isomorphic groups of a given order exist is a classification question, not a comparison.

> Caption: A question that asks how many non-isomorphic groups of a given order exist is a classification question, not a comparison.

**4:42–4:48** — Order 4 has two classes, Z4 and V4. So a question asking for the number of non-isomorphic abelian groups of order 4 has answer 2.

> Caption: Order 4 has two classes: Z4 and V4. So a question asking for the number of non-isomorphic abelian groups of order 4 has answer 2.

**4:48–4:54** — Order 6 has two classes, order 8 has five, and order 9 has two. Every group of prime order is cyclic, so prime orders have one.

> Caption: Order 6 has two classes, order 8 has five, and order 9 has two. Every group of prime order is cyclic, so prime orders have one.

**4:54–5:00** — Sameness needs a witness. Difference needs an invariant. Decide which one the question is asking before you compute anything.

> Caption: Sameness needs a witness. Difference needs an invariant. Decide which one the question is asking before you compute anything.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
