# Linearity of Expectation: Sums, Indicators and the Counts GATE Asks For — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/linearity-of-expectation/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. The mean of a sum is the sum of the means

*0:00 – 0:30 · objective: Show that E[X + Y] can be computed from the two separate means, and check it against the 36-outcome average for two dice.*

**0:00–0:07** — Two dice give thirty-six equally likely outcomes. The sum of the faces runs from two to twelve, and the question is what it averages to.

> Caption: Two dice: 36 equally likely outcomes. The sum runs from 2 to 12.

Exam-trap caption mode adds: *Eleven possible sums do not mean eleven equally likely sums. The outcomes are the 36 pairs, not the 11 totals.*

**0:07–0:15** — Add all thirty-six sums and divide by thirty-six. The total is two hundred and fifty-two, so the average is seven. That is the honest, brute-force route.

> Caption: Averaging all 36 sums gives 7. That is the brute-force route.

Exam-trap caption mode adds: *Dividing 252 by 11 instead of 36 is the commonest arithmetic slip here.*

**0:15–0:22** — One die averages three and a half. By linearity the sum of two dice averages three and a half plus three and a half, which is seven, and no table was needed.

> Caption: One die averages 3.5, so two dice average 3.5 + 3.5 = 7.

Exam-trap caption mode adds: *A mean need not be a value the variable can take: no pair of dice sums to 3.5.*

**0:22–0:30** — That is the entire idea. The mean of a sum is the sum of the means, whatever the two variables are doing to each other. The next scene tests that word, whatever.

> Caption: That is the whole idea: the mean of a sum is the sum of the means.

Exam-trap caption mode adds: *The rule is about the mean only. It says nothing about variance, products or the shape of the distribution.*

## Scene 2. No independence needed

*0:30 – 1:00 · objective: Show a joint distribution in which X and Y are perfectly dependent, where the sum still adds but the product does not.*

**0:30–0:37** — The two dice happened to be independent. But the rule that gave seven never asked. Nothing in the derivation assumed that the dice do not influence each other.

> Caption: The two dice were independent, but linearity never used that fact.

Exam-trap caption mode adds: *This is the single most common misconception in the topic: that linearity requires independence.*

**0:37–0:45** — Now take one die and copy it. Y equals X always. The joint table keeps only its diagonal: six cells, each with probability one sixth. Nothing could be more dependent.

> Caption: Let X = Y: one die, copied. The joint table collapses onto its diagonal.

Exam-trap caption mode adds: *A joint distribution that is a diagonal is still a joint distribution; linearity applies to it.*

**0:45–0:52** — The sum is now twice one die. Averaging two, four, six, eight, ten and twelve gives seven. Linearity said three and a half plus three and a half, also seven. They agree.

> Caption: E[X + Y] is still 3.5 + 3.5 = 7, and 2X really does average 7.

Exam-trap caption mode adds: *Dependence changes the spread and the shape, never the mean of a sum.*

**0:52–1:00** — Now multiply instead of adding. X times Y is X squared, which averages fifteen point one seven. The product of the means is twelve point two five. For products, dependence matters.

> Caption: But E[X·Y] is 91/6 = 15.17, not 12.25. Products do need independence.

Exam-trap caption mode adds: *Do not carry the linearity licence from sums to products: E[XY] = E[X]E[Y] requires independence.*

## Scene 3. Indicators turn counting into adding probabilities

*1:00 – 1:30 · objective: Define an indicator variable, prove E[I] = P(A), and write a count as a sum of indicators.*

**1:00–1:07** — An indicator is the simplest random variable there is. It is one when something happens and zero when it does not. Nothing else.

> Caption: An indicator is 1 when its event happens and 0 when it does not.

Exam-trap caption mode adds: *An indicator takes only 0 and 1. A variable that can take 2 is not an indicator, and E[I] = P(A) then fails.*

**1:07–1:15** — Average one with probability p and zero with probability one minus p. The answer is p. So the mean of an indicator is the probability of its event, exactly.

> Caption: Its mean is the probability: E[I] = 1·p + 0·(1−p) = p.

Exam-trap caption mode adds: *E[I] = P(A) is a definition-level identity, not an approximation.*

**1:15–1:22** — Suppose you want to know how many of twelve events happen. Write one indicator for each event and add them. The sum is the count, on every single outcome.

> Caption: A count of twelve events is the sum of twelve indicators.

Exam-trap caption mode adds: *The identity is exact outcome by outcome. If it were only true on average, the next step would be circular.*

**1:22–1:30** — Now take the mean of the sum. It is the sum of the means, so it is the sum of the twelve probabilities. The joint distribution of twelve events is never written down, and never needed.

> Caption: So the expected count is the sum of twelve probabilities — no joint distribution.

Exam-trap caption mode adds: *You need each event probability separately, and you never need any pair probability. That is the economy the method buys.*

## Scene 4. Fixed points: exactly one, for every n

*1:30 – 2:00 · objective: Compute the expected number of fixed points of a random permutation by enumeration and by indicators, and read the n = 5 distribution.*

**1:30–1:37** — Shuffle a deck. A fixed point is a card that comes back to its own position. The question is how many fixed points a random shuffle has, on average.

> Caption: Shuffle n cards: a fixed point is a card that lands back in its own place.

Exam-trap caption mode adds: *Fixed points are about positions, not values: a card back in its own slot, not the largest card anywhere.*

**1:37–1:45** — Enumerate all five thousand and forty shuffles of seven cards and add up their fixed points. The total is five thousand and forty. Divided by the number of shuffles, the average is exactly one.

> Caption: All 5040 shuffles of seven cards contain 5040 fixed points in total: one each.

Exam-trap caption mode adds: *The answer does not grow with n. A beginner expects the average to grow; it does not.*

**1:45–1:52** — Here is the proof that works for every n. For each position, the probability that it is fixed is one over n. There are n positions, so the mean is n times one over n, which is one.

> Caption: By indicators: n events of probability 1/n, so the mean is n · (1/n) = 1 for all n.

Exam-trap caption mode adds: *The indicators are heavily dependent — if one position is fixed, another is slightly less likely. Linearity does not care.*

**1:52–2:00** — Look at the distribution for five cards. Forty-four shuffles fix nothing, forty-five fix one, twenty fix two, ten fix three, and one fixes all five. Four fixed points never happens, because if four positions are right the fifth must be too.

> Caption: The n = 5 distribution: 44 shuffles have none, 45 have one, and four is impossible.

Exam-trap caption mode adds: *A mean of 1 does not mean one fixed point is typical: 89 of the 120 shuffles have zero or one, and 44 have none at all.*

## Scene 5. Inversions: n(n−1)/4

*2:00 – 2:30 · objective: Count inversions by counting pairs, and check the closed form against every permutation up to n = 7.*

**2:00–2:07** — An inversion is a pair that is out of order. For five items there are one hundred and twenty orders, and six hundred inversions in total, so five per order on average.

> Caption: An inversion is a pair out of order: for n = 5 the average over 120 shuffles is 5.

Exam-trap caption mode adds: *Counting inversions means counting pairs, not adjacent swaps only. Distant pairs count too.*

**2:07–2:15** — Fix any two positions. In exactly half of all orders the larger value comes first, because swapping the two values pairs up the orders that do and the orders that do not.

> Caption: Each of the C(n,2) pairs is inverted in exactly half the permutations.

Exam-trap caption mode adds: *The half-and-half argument needs the two values to be distinct. Equal keys make the probability depend on ties.*

**2:15–2:22** — There are n choose two pairs and each contributes one half. So the average number of inversions is n times n minus one, over four. Five items give five, four items give three.

> Caption: So the mean is C(n,2)/2 = n(n−1)/4, which is 5 at n = 5 and 3 at n = 4.

Exam-trap caption mode adds: *The formula is a quarter, not a half: C(n,2) already carries the factor of one half from the pair count.*

**2:22–2:30** — These pair indicators are not independent. Moving one element changes several pairs at once. And yet the means add, because that is all linearity ever promised.

> Caption: The pairs are dependent — one swap changes many — and linearity does not care.

Exam-trap caption mode adds: *Expecting the variance to add here is the trap: it does not, because the pairs are dependent.*

## Scene 6. Hashing: load n/m and collisions C(n,2)/m

*2:30 – 3:00 · objective: Derive the expected slot load, the expected number of collisions and the expected number of occupied slots.*

**2:30–2:37** — Hash n keys into m slots, each key equally likely to take any slot. Five slots and three keys give one hundred and twenty-five assignments, small enough to check every one.

> Caption: n keys into m slots, each key equally likely to land in any slot.

Exam-trap caption mode adds: *Uniform hashing is an assumption about the hash function, not a property of the keys.*

**2:37–2:45** — Fix one slot. Each key lands there with probability one over m. The load is a sum of indicators, so the expected load is n over m. Three keys in five slots average zero point six per slot.

> Caption: One slot holds a sum of n indicators, so its expected load is n/m.

Exam-trap caption mode adds: *Expected load is not a load any slot need actually have. A slot holds 0 or 1 or 2 keys, never 0.6.*

**2:45–2:52** — Now count colliding pairs. Any two keys share a slot with probability one over m, and there are n choose two pairs. So the expected number of collisions is n choose two over m.

> Caption: Each of the C(n,2) key pairs collides with probability 1/m, so E[collisions] = C(n,2)/m.

Exam-trap caption mode adds: *Collisions are counted as pairs, not as keys. Two keys in one slot is one collision, not two.*

**2:52–3:00** — GATE 2022 split the keys between two hash functions, one for odd keys and one for even. Each key still has probability one over m of reaching a slot, so the expected load is still n over m.

> Caption: GATE 2022 used one hash function for odd keys and another for even: the answer stayed n/m.

Exam-trap caption mode adds: *A question that looks like it needs a case split usually does not: check the per-key probability before splitting.*

## Scene 7. Quicksort: 2(n+1)H(n) − 4n comparisons

*3:00 – 3:30 · objective: Sum pair probabilities to obtain the exact expected comparison count, and compare it with the 2n ln n bound.*

**3:00–3:07** — In quicksort every comparison is between a pivot and something else, and a pivot is never touched again. So each pair of keys is compared at most once, and the comparison count is a sum over pairs.

> Caption: Randomised quicksort compares each pair at most once, so count comparisons by pairs.

Exam-trap caption mode adds: *This is what makes the pair sum exact. In merge sort the same idea gives a different sum, because comparisons are not between arbitrary pairs.*

**3:07–3:15** — Take two keys and look at everything between them in sorted order. If something in the middle is chosen as a pivot first, they are separated for good. If one of the two is chosen first, they are compared.

> Caption: Keys i and j are compared exactly when the first pivot among them is one of the two.

Exam-trap caption mode adds: *The probability is not 1/2: it depends on how many keys lie between the pair.*

**3:15–3:22** — Among j minus i plus one keys the first pivot is uniform, so the chance it is an endpoint is two over that count. Add over all pairs and the exact expectation is two n plus one times the harmonic number, minus four n.

> Caption: That probability is 2/(j−i+1), and summing over pairs gives 2(n+1)H(n) − 4n.

Exam-trap caption mode adds: *The exact form has both terms. Dropping the −4n overstates the count by about 4n comparisons.*

**3:22–3:30** — For ten keys the harmonic number is two point nine three, and the formula gives twenty-four point four four comparisons. The recurrence gives the same number to every decimal place, and both sit under the two n log n bound.

> Caption: At n = 10 the exact expectation is 24.44 comparisons, under the 2n ln n = 46.05 bound.

Exam-trap caption mode adds: *Expected O(n log n) is a class; the question usually wants the number. Compute the exact sum for small n.*

## Scene 8. Where linearity stops: variance and products

*3:30 – 4:00 · objective: Show that variance of a sum needs a covariance term, and that E of a function is not the function of E.*

**3:30–3:37** — Linearity is a statement about the mean and nothing else. Variance is built from squares, and squares do not distribute over sums.

> Caption: Linearity is a property of the mean only. Variance does not inherit it.

Exam-trap caption mode adds: *Writing Var(X+Y) = Var(X) + Var(Y) without saying why is the classic lost mark.*

**3:37–3:45** — The variance of a sum is the two variances plus twice the covariance. Independence sets the covariance to zero. Positive dependence makes it positive, so the sum is more spread out than independence would suggest.

> Caption: Var(X+Y) = Var X + Var Y + 2Cov(X,Y); independence removes only the last term.

Exam-trap caption mode adds: *Uncorrelated is weaker than independent, but it is enough to kill this particular term.*

**3:45–3:52** — A fair die has variance two point nine two. Two independent dice sum to variance five point eight three. But copying the die doubles it, and the variance of twice X is four times two point nine two, eleven point six seven.

> Caption: With X = Y the sum is 2X, so the variance is 4 times Var X = 11.67, not 5.83.

Exam-trap caption mode adds: *The mean was 7 in both cases. Only the variance tells the two situations apart, which is why the mean alone is not a summary.*

**3:52–4:00** — Averaging the reciprocal of a die is not the reciprocal of the average. The first is zero point four one, the second is zero point two nine. Averages commute with sums, not with curves.

> Caption: And the mean of a function is not the function of the mean: E[1/X] = 0.408, 1/E[X] = 0.286.

Exam-trap caption mode adds: *Every quantity of the form E of a function must be computed from the distribution, never by substituting the mean.*

## Scene 9. The tail-sum form: E[X] = the sum of P(X ≥ k)

*4:00 – 4:30 · objective: Prove and use the tail-sum formula on the larger of two dice, checked against the 36-outcome average.*

**4:00–4:07** — There is a second way to average a non-negative whole-number variable. Instead of weighting values, add up the probabilities of being at least one, at least two, at least three, and so on.

> Caption: For a non-negative integer variable there is a second route: add the tail probabilities.

Exam-trap caption mode adds: *The identity needs non-negative integers. For a variable that can be negative or fractional it does not hold as written.*

**4:07–4:15** — An outcome with value k is counted in the first k of those tail probabilities, so it is counted exactly k times. That is precisely its weight in the average, and the two routes coincide.

> Caption: Each value k is counted exactly k times, which is why the two sums agree.

Exam-trap caption mode adds: *This is where the non-negativity is used: reordering a sum with negative terms is not free.*

**4:15–4:22** — For the larger of two dice the tails are one, thirty-five over thirty-six, thirty-two over thirty-six, twenty-seven over thirty-six, twenty over thirty-six and eleven over thirty-six.

> Caption: Larger of two dice: 1 + 35/36 + 32/36 + 27/36 + 20/36 + 11/36.

Exam-trap caption mode adds: *The first term is 1, not 0: the maximum is always at least 1. Omitting it loses a whole unit.*

**4:22–4:30** — Those six terms add to one hundred and sixty-one over thirty-six, four point four seven. Averaging the larger face over all thirty-six pairs gives the same number exactly.

> Caption: That sum is 161/36 = 4.472, and the 36-outcome average agrees exactly.

Exam-trap caption mode adds: *A mean of 4.472 for a variable that only takes whole values is normal; do not round it to 4 or 5 without being asked.*

## Scene 10. The procedure and the traps

*4:30 – 5:00 · objective: Fix the four-step procedure for an expected-count question and name the five traps that produce plausible wrong options.*

**4:30–4:37** — Here is the procedure. Decide what you are counting, in units: pairs, positions, slots or comparisons. Write one indicator per unit. The count is their sum, so the mean is the sum of their probabilities.

> Caption: Write the quantity as a sum of indicators. That is the whole procedure.

Exam-trap caption mode adds: *Choosing the wrong unit is the real difficulty. Pairs and positions give different sums, and only one matches the quantity asked.*

**4:37–4:45** — Then ask one question of each indicator: what is the probability of its event? That is all. You never examine two indicators together, so you never need a joint distribution.

> Caption: Ask of each indicator only: what is the probability of its event?

Exam-trap caption mode adds: *Students often try to compute a joint probability out of habit and then get stuck. It is never needed for the mean.*

**4:45–4:52** — Two traps. Believing the method needs independence, which it does not. And extending it to variance or to a product, where it is simply false.

> Caption: Trap: thinking independence is needed. Trap: applying linearity to variance or to products.

Exam-trap caption mode adds: *If the option says Var(X+Y) = Var(X) + Var(Y) with no independence hypothesis, it is false.*

**4:52–5:00** — And the third trap: rejecting an answer because it is not a whole number. Zero point six keys per slot is a normal mean. Expectations live between the values, not among them.

> Caption: Trap: rejecting a fractional answer. An expected count need not be a count.

Exam-trap caption mode adds: *Never eliminate an option for being fractional or unattainable; eliminate it for being wrong.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
