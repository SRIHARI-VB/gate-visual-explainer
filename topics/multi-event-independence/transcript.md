# Independence beyond two events: pairwise, mutual and conditional independence, with the two counterexamples that separate them — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/multi-event-independence/index.html`
- Total duration: 5:30 (330 seconds), 11 scenes, 45 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Independence of two events, read off a grid

*0:00 – 0:30 · objective: see P of A and B equal to P of A times P of B as the definition, checked on a four-cell grid*

**0:00–0:08** — Two fair coins. A is the event that the first toss is a head, B is the event that the second toss is a head. Four outcomes, each with probability one quarter.

> Caption: Two fair coins. A is a head on the first, B a head on the second. Four outcomes, each one quarter.

**0:08–0:15** — A holds two of the four cells, so its probability is one half. B holds two cells as well, so its probability is also one half.

> Caption: A holds two of the four cells, so its probability is one half. B holds two cells as well.

**0:15–0:23** — They overlap in exactly one cell, HH. The probability of the overlap is one quarter, and one half times one half is also one quarter, so A and B are independent.

> Caption: They overlap in one cell. One quarter equals one half times one half, so A and B are independent.

**0:23–0:30** — The product rule is the definition of independence, not a consequence of it. It is checked by computing both sides, never assumed because a picture looks symmetric.

> Caption: The product rule is the definition, not a consequence. It is checked, never assumed from a picture.

Exam-trap caption mode adds: *Two events can look unrelated in a diagram and fail the product test, and two events drawn in the same corner can pass it. Compute both sides.*

## Scene 2. Three events ask four questions, not three

*0:30 – 1:00 · objective: count the conditions mutual independence imposes: every subset of size two or more*

**0:30–0:37** — With three events, the definition multiplies every subset of size two or more: three pairs and the triple. That is four conditions.

> Caption: With three events the definition multiplies every subset of size two or more. That is four conditions.

**0:37–0:44** — Pairwise independence means only the three pair conditions hold. It says nothing at all about the probability of all three events happening together.

> Caption: Pairwise independence means the three pair conditions hold. It says nothing about the triple.

**0:44–0:52** — For n events the number of conditions is two to the n minus n minus one. Two events need one check, three need four, four need eleven, five twenty-six, and six fifty-seven.

> Caption: For n events the count is two to the n, minus n, minus one. Two events need one check, three need four, six need fifty-seven.

**0:52–1:00** — Mutual independence is the full list of conditions. A question that says the events are independent, with no other word, means mutually independent, which means every condition holds.

> Caption: Mutual independence is the full list. A question that says only independent means mutual, and it means all of them.

Exam-trap caption mode adds: *A question that lists pairwise independence as an option is testing whether you know it is weaker. Do not accept it as a synonym for independence.*

## Scene 3. Four tickets where every pair is independent and the triple is not

*1:00 – 1:34 · objective: run Bernstein's four-ticket space and find the one condition that fails*

**1:00–1:08** — Four tickets, each carrying a three-digit label: 112, 121, 211 and 222. One ticket is drawn uniformly at random, so each has probability one quarter.

> Caption: Four tickets, each a three-digit label: 112, 121, 211 and 222. One is drawn uniformly.

**1:08–1:16** — A1 is the event that the first place holds a one, which is the tickets 112 and 121. A2 is a one in the second place, and A3 is a one in the third place. Each event holds two tickets.

> Caption: A1 is a one in the first place: tickets 112 and 121. A2 is a one in the second place, A3 in the third.

**1:16–1:24** — Every pair meets in exactly one ticket: A1 with A2 in 112, A1 with A3 in 121, A2 with A3 in 211. Each overlap has probability one quarter, and one half times one half is one quarter, so all three pairs pass.

> Caption: Every pair meets in exactly one ticket. One quarter against one half times one half: all three pairs pass.

**1:24–1:30** — All three together would need a one in every place. No ticket has three ones, so the triple intersection is empty and its probability is zero. The product is one eighth.

> Caption: All three together would need a one in every place. No ticket has three ones, so the triple intersection is empty.

Exam-trap caption mode adds: *The union is three quarters, not the seven eighths the at-least-one formula would give. Pairwise independence is not enough to multiply, and the next scenes show the damage.*

**1:30–1:34** — That is the whole lesson of the scene. Three passing pair tests say nothing about what happens when all three events are asked for at once.

> Caption: The failure is the whole lesson: three passing pair tests say nothing about the three together.

## Scene 4. The reverse failure: the triple product holds, no pair does

*1:34 – 2:08 · objective: run the two-dice space where checking only the triple product is not enough*

**1:34–1:42** — Two dice, thirty-six equally likely cells. A is a first die showing one, two or three. B is a first die showing three, four or five. Each holds eighteen cells.

> Caption: Two dice, thirty-six equally likely cells. A is a first die of 1, 2 or 3. B is a first die of 3, 4 or 5.

**1:42–1:50** — C is the event that the two faces sum to nine, which is four cells: three six, four five, five four and six three. Its probability is four over thirty-six, one ninth.

> Caption: C is the event that the faces sum to nine: four cells. Its probability is one ninth.

**1:50–1:58** — A with B is six cells, one sixth, and the product is one quarter. A with C is one cell, one thirty-sixth, and the product is one eighteenth. Both pairs fail.

> Caption: A with B is six cells, one sixth, not one quarter. A with C is one cell, one thirty-sixth, not one eighteenth.

**1:58–2:04** — Yet all three together is the single cell three six, and one thirty-sixth equals one half times one half times one ninth. The triple product holds.

> Caption: Yet all three together is one cell, three six, and one thirty-sixth equals one half times one half times one ninth.

Exam-trap caption mode adds: *A family that satisfies the triple product can fail every pair test. The condition set is not a hierarchy; each subset of size two or more has to be checked.*

**2:04–2:08** — Two spaces and two failures, in opposite directions. The conditions are separate tests, and a shortcut that checks one of them instead of all of them is wrong both ways.

> Caption: Two spaces, two failures. The conditions are independent tests, and both directions of the mistake are real.

## Scene 5. Any two determine the third

*2:08 – 2:36 · objective: see a parity bit give pairwise independence while the three together are as dependent as possible*

**2:08–2:16** — Two fair bits, X and Y, and a third bit Z defined to be one exactly when X and Y differ. That is Z equals X exclusive-or Y.

> Caption: Two fair bits, X and Y, and a third bit Z defined as one when X and Y differ.

**2:16–2:24** — Four rows: zero zero zero, zero one one, one zero one, one one zero. Each of the three bits is one in exactly two of the rows, so each has probability one half.

> Caption: Four rows: 000, 011, 101, 110. Each of the three bits is one in exactly two rows.

**2:24–2:30** — Every pair shares two rows out of four, so every pair intersection has probability one quarter, which is one half times one half. All three pairs pass.

> Caption: Every pair shares two rows out of four. One quarter equals one half times one half, so all three pairs pass again.

**2:30–2:36** — But all three bits together are never one one one, so the triple has probability zero against one eighth. Knowing any two bits tells you the third exactly.

> Caption: But all three together is never 111, so the triple is zero against one eighth. Any two bits determine the third.

Exam-trap caption mode adds: *Pairwise independence is often described as no information between pairs. Here every pair carries no information and the triple carries total information.*

## Scene 6. Why mutual, and not pairwise, licenses the multiplication

*2:36 – 3:08 · objective: compare the at-least-one formula against the truth on both counterexamples*

**2:36–2:44** — The at-least-one formula multiplies the complements: one minus the product of one minus each probability. It is the workhorse of every at-least-one question.

> Caption: The at-least-one formula multiplies the complements: one minus the product of one minus each probability.

**2:44–2:52** — On the four tickets the formula gives seven eighths. The truth is three quarters, because only the ticket 222 lies outside the union. The formula is too big.

> Caption: On the four tickets the formula gives seven eighths. The truth is three quarters, because 222 is the only ticket outside the union.

**2:52–3:00** — On the dice the formula gives twenty-eight thirty-sixths. The truth is thirty-one thirty-sixths, because the cell six three lies in C and outside A and B. Here the formula is too small.

> Caption: On the dice the formula gives twenty-eight thirty-sixths. The truth is thirty-one thirty-sixths, so here it is too small.

**3:00–3:08** — With mutual independence the formula is exact. That is the practical reason the distinction matters: the product rule on the complements is what makes at-least-one questions one line instead of a case analysis.

> Caption: With mutual independence the formula is exact, and that is the practical reason the distinction matters.

Exam-trap caption mode adds: *Never write one minus the product of the complements unless the events are mutually independent. Pairwise independence does not license it, as both examples show.*

## Scene 7. Conditional independence is a different statement

*3:08 – 3:36 · objective: condition the parity example on Z and watch two independent events become dependent*

**3:08–3:16** — Now condition on Z. Keep only the rows where Z is one, which are zero one one and one zero one. Two rows remain, each still equally likely inside the new world.

> Caption: Now condition on Z. Keep only the rows where Z is one: 011 and 101.

**3:16–3:24** — Inside those two rows, X is one in one of them, so one half. Y is one half as well. But X and Y together never happen, because the two remaining rows disagree on exactly one bit.

> Caption: Inside those rows X is one half and Y is one half. But X and Y together never happens.

**3:24–3:30** — So X and Y are independent in the original space, and dependent once Z is known. Conditional independence is a separate statement about a smaller space, and neither one implies the other.

> Caption: So X and Y are independent, and dependent once Z is known. Conditional independence is a separate statement.

Exam-trap caption mode adds: *Independence and conditional independence are not linked by implication in either direction. A conditioning event can create dependence, as here, and it can remove it.*

**3:30–3:36** — This is the shape of explaining-away arguments, and of every question that says given. The word given changes the space, so it changes the answer.

> Caption: This is the shape of explaining-away arguments, and of every question that says given.

## Scene 8. Disjoint, certain, impossible, and complemented

*3:36 – 4:04 · objective: fix the three boundaries: disjointness, probability zero or one, and taking complements*

**3:36–3:44** — Disjoint is not independent. Two events that cannot both happen are dependent, because the probability of the overlap is zero while the product of their probabilities is positive.

> Caption: Disjoint is not independent. Two events that cannot both happen are dependent, unless one has probability zero.

**3:44–3:51** — An impossible event and a certain event are independent of everything, including themselves. Zero times anything is zero, and one times anything is the other probability.

> Caption: An impossible event and a certain event are independent of everything, including themselves.

**3:51–3:58** — Taking the complement preserves independence. The probability of A with not B is the probability of A minus the probability of A with B, which factors into the probability of A times one minus the probability of B.

> Caption: Taking the complement preserves independence: P of A with not B is P of A minus P of A with B.

**3:58–4:04** — So complements are free, disjointness is not, and probability zero or one is a boundary case rather than a rule. Each of the three has its own arithmetic.

> Caption: So complements are free, disjointness is not, and zero or one is a boundary rather than a rule.

## Scene 9. Counting the independent pairs on a four-point space

*4:04 – 4:36 · objective: enumerate all sixteen events and count which pairs and triples qualify*

**4:04–4:12** — A four-point space has sixteen events, because each of the four atoms is either in or out. Exactly two of those sixteen are independent of every other event: the empty event and the whole space.

> Caption: A four-point space has sixteen events. Two of them are independent of every other event.

**4:12–4:20** — Eighty-four of the two hundred and fifty-six ordered pairs of events are independent pairs. The page tests all of them and counts the ones where the product rule holds.

> Caption: Eighty-four of the two hundred and fifty-six ordered pairs of events are independent pairs.

**4:20–4:28** — There are six two-element events, and they form twenty triples. Eight of those twenty triples are pairwise independent and not mutually independent.

> Caption: Six two-element events give twenty triples. Eight of them are pairwise independent and not mutually independent.

**4:28–4:36** — On a small space every one of these numbers can be counted by hand. That is the safest way to answer a counting question about independence: list the atoms, list the events, and test the products.

> Caption: On a small space every one of these can be counted by hand. That is the safest way to answer a counting question about independence.

## Scene 10. GATE CSE 2023: three events built from two coins

*4:36 – 5:06 · objective: answer the verified previous-year item by computing all four options*

**4:36–4:44** — GATE CSE 2023. Two fair coins are tossed. A is the event of a head on both throws, B is a head on the first throw, and C is a head on the second throw. Four statements are offered.

> Caption: GATE CSE 2023: two coins. A is a head on both throws, B a head on the first, C a head on the second.

**4:44–4:52** — A is one cell, the pair of heads. B and C hold two cells each. A with B is the same single cell, one quarter, against a product of one eighth, so A with B fails. A with C fails the same way.

> Caption: A is one cell, B and C are two each. A with B is one quarter against one eighth, so A with B fails.

**4:52–4:59** — B with C is the pair of heads, one quarter, and one half times one half is one quarter. That pair passes, so B and C are independent and the fourth option follows.

> Caption: B with C is the same single cell, one quarter, and one half times one half is one quarter. That pair passes.

**4:59–5:06** — The true statements are that B and C are independent, and that the conditional probability of B given C equals the probability of B. Both are the same arithmetic, written two ways.

> Caption: The true statements are B and C independent, and the conditional equality. Both are the same arithmetic.

## Scene 11. Where mutual independence is doing the work

*5:06 – 5:30 · objective: name the three places the multiplication is used, and the four-step check*

**5:06–5:15** — Three places use the multiplication. Reliability multiplies the survival probabilities of components. At-least-one multiplies the complements over repeated trials. The binomial count multiplies a power of p by a power of one minus p.

> Caption: Three places use it: reliability of components, at-least-one over repeated trials, and the binomial count.

**5:15–5:23** — The four-step check. Count how many events the family has. List every subset of size two or more. Compute both sides of each product. And never infer independence from a picture.

> Caption: The four-step check: how many events, every subset of size two or more, both sides of each product, and no inference from a picture.

**5:23–5:30** — Independent, with no other word, means the whole list. Pairwise means only the pairs, and a question will offer it as a distractor precisely because it sounds like the same thing.

> Caption: Independent means the whole list. Pairwise means three of the four, and a question will offer it as a distractor.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
