# Conditional Expectation And Total Expectation — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/conditional-expectation-and-total-expectation/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A conditional mean is an average over a smaller set

*0:00 – 0:30 · objective: Show that E[X | A] is the mean of X recomputed on the outcomes inside A, using two dice restricted to sums of at least 10.*

**0:00–0:07** — Two dice give thirty-six equally likely outcomes, and the sum of the faces averages seven.

> Caption: Two dice, thirty-six equally likely outcomes. The sum averages seven.

**0:07–0:15** — Now keep only the outcomes where the sum is at least ten. Everything else is discarded.

> Caption: Now keep only the outcomes where the sum is at least ten.

**0:15–0:22** — Six outcomes survive. Their sums are ten, ten, ten, eleven, eleven and twelve, so the mean is ten point six seven.

> Caption: Six outcomes survive, and their mean is 64 over 6, which is 10.67.

Exam-trap caption mode adds: *The condition changes the mean. E[X | A] is not E[X], and it is not P(X in A) either.*

**0:22–0:30** — So the conditional mean is the ordinary mean, computed with the conditional probabilities inside the event.

> Caption: E[X | A] weights each outcome by its conditional probability inside A.

## Scene 2. Conditioning on a variable gives one mean per value

*0:30 – 1:00 · objective: Compute E[max | min = y] for every y and see that conditioning on a random variable produces a list of means, not one mean.*

**0:30–0:37** — Now take two new variables from the same throw: the larger face and the smaller face.

> Caption: Two new variables: the larger face and the smaller face of the same throw.

**0:37–0:45** — Fix the smaller face at some value and ask what the larger face averages, among the throws where that value is the smaller one.

> Caption: Fix the smaller face at y and ask what the larger face averages.

**0:45–0:52** — Six conditions give six different means: three point seven three, four point two two, four point seven one, five point two, five point six seven, and six.

> Caption: Six conditions, six different means: 3.73, 4.22, 4.71, 5.20, 5.67 and 6.

Exam-trap caption mode adds: *One question has six answers here. A conditional mean is a function of the condition, so the answer must be indexed by the value.*

**0:52–1:00** — Each of those means is an ordinary average over a subset. The counts are eleven, nine, seven, five, three and one.

> Caption: Each mean is an ordinary mean of a subset, with the subset counted in order.

## Scene 3. The law of total expectation: average the averages

*1:00 – 1:30 · objective: Weight each conditional mean by the probability of its condition and recover the unconditional mean exactly — 161/36.*

**1:00–1:07** — Now weight each conditional mean by the probability of its condition.

> Caption: Take the six conditional means and weight each by how likely its condition is.

**1:07–1:15** — The weighted average comes to one hundred and sixty-one over thirty-six, which is four point four seven two two.

> Caption: The weighted average is 161 over 36, which is 4.4722.

**1:15–1:22** — This is the law of total expectation. Average the conditional means and you get the unconditional mean.

> Caption: That is the law of total expectation: E of E of X given Y equals E of X.

**1:22–1:30** — It is not a new fact about the dice. It is a route: when the conditional means are easy and the overall mean is hard, average the easy ones.

> Caption: It is not a new fact about the dice: it is a way to reach the mean in two stages.

Exam-trap caption mode adds: *The law needs the conditions to partition the sample space. Overlapping conditions double-count.*

## Scene 4. The same law written over events

*1:30 – 2:00 · objective: Apply E[X] = sum of E[X | A_i] P(A_i) to a two-coin experiment, where the partition is which coin was chosen.*

**1:30–1:37** — Two coins in a bag, one fair and one that lands heads with probability zero point two. Pick one at random and toss it twice.

> Caption: Two coins in a bag: one fair, one that lands heads with probability 0.2.

**1:37–1:45** — Given the fair coin, the expected number of heads is one. Given the biased coin, it is zero point four.

> Caption: Given the fair coin, the expected number of heads is 2 times 1/2, which is 1.

**1:45–1:52** — Average the two answers with equal weights, and the expected number of heads is zero point seven.

> Caption: Average the two: half of 1 plus half of 0.4 is 0.7 heads.

**1:52–2:00** — Written over a partition, the law says: the overall mean is the sum, over the parts, of the conditional mean times the probability of the part.

> Caption: E[X] equals the sum of E[X given A_i] times P(A_i), over a partition.

Exam-trap caption mode adds: *Check that the parts are exhaustive. If the partition misses outcomes, the sum under-counts and the answer is too small.*

## Scene 5. Conditioning on the first step turns a mean into an equation

*2:00 – 2:30 · objective: Derive the expected number of tosses until two consecutive heads — 6 — by conditioning on the first toss, and check it against the exact distribution.*

**2:00–2:07** — Toss a fair coin until two heads appear in a row. How many tosses should you expect to need?

> Caption: Toss a fair coin until two heads appear in a row. How many tosses on average?

**2:07–2:15** — Two states matter: no head in hand, and one head in hand. Call the expected tosses from each state a and b.

> Caption: Two states: nothing in hand, or one head in hand. Call their means a and b.

**2:15–2:22** — Each equation counts the toss just made and adds the mean of the state it leads to. Solving the pair gives a equals six.

> Caption: a equals 1 plus half a plus half b, and b equals 1 plus half a.

**2:22–2:30** — Six tosses. And summing the exact distribution directly gives six as well, so the equation is not an approximation.

> Caption: Six tosses, and the exact distribution agrees: 6.0000 by direct summation.

Exam-trap caption mode adds: *Conditioning on the first toss is only valid if the process restarts identically. If the coin's bias changes over time, the recursion is invalid.*

## Scene 6. E[X | Y] is itself a random variable

*2:30 – 3:00 · objective: Show the six conditional means as a coarsened version of the table, taking each value with the probability of its condition.*

**2:30–2:37** — Before the throw, the conditional mean is not a number. It depends on the smaller face, which is random.

> Caption: Before the throw, E of the larger face given the smaller face is unknown.

**2:37–2:45** — It takes six values, with probabilities from eleven over thirty-six down to one over thirty-six, and those probabilities add to one.

> Caption: It takes six values, with probabilities 11/36 down to 1/36.

**2:45–2:52** — It is a coarsening. Every outcome in a block is replaced by the average of that block.

> Caption: It is a coarsening: many outcomes share one value, and that value is their average.

**2:52–3:00** — Its mean is the mean of X, and it is less spread out than X, because averaging removes variation.

> Caption: Its mean is E of X, and its variance is smaller than the variance of X.

Exam-trap caption mode adds: *E[X | Y] is a random variable, not a number. An option that gives a single constant as the answer to "E[X | Y]" is wrong unless X and Y are independent.*

## Scene 7. The law of total variance

*3:00 – 3:30 · objective: Split Var(X) into the mean of the conditional variances plus the variance of the conditional means, and check the split numerically.*

**3:00–3:07** — The variance of X splits into two parts: the average variance inside the blocks, and the variance of the block averages.

> Caption: Total variance splits into two parts, and both are conditional quantities.

**3:07–3:15** — Inside the blocks, the average variance is one point five one seven six.

> Caption: Inside the blocks the larger face still varies by 1.5176 on average.

**3:15–3:22** — Between the blocks, the six means vary by zero point four five three nine.

> Caption: Between the blocks, the six means themselves vary by 0.4539.

**3:22–3:30** — Add the two and you get the variance of the larger face, one point nine seven one five.

> Caption: The two add to 1.9715, which is the variance of the larger face.

Exam-trap caption mode adds: *Var(X) is not the mean of the conditional variances. That is only the inside part; the between part is left out.*

## Scene 8. Conditioning on a value with probability zero

*3:30 – 4:00 · objective: Condition on a continuous variable through its density, and compute the expected length of the subinterval containing 0.4 as 0.74.*

**3:30–3:37** — A point is chosen uniformly in the unit interval and cuts it into two pieces.

> Caption: A point is chosen uniformly in the unit interval and splits it in two.

**3:37–3:45** — Take the piece containing zero point four. If the cut is above it, the piece runs from zero to the cut; if below, from the cut to one.

> Caption: Take the piece that contains 0.4. Its length depends on where the cut fell.

**3:45–3:52** — Averaging the length over the cut gives zero point seven four.

> Caption: Average that length over the cut: 0.32 plus 0.42 is 0.74.

**3:52–4:00** — For a continuous variable, condition on a small interval and let it shrink. The limit is the conditional expectation.

> Caption: For a continuous variable, condition on an interval and let it shrink.

Exam-trap caption mode adds: *Never write P(Y = y) for a continuous Y. It is zero, and dividing by it is meaningless.*

## Scene 9. A random parameter is a mixture, and mixtures widen

*4:00 – 4:30 · objective: Average a binomial mean over a uniformly random p, and show that the variance is larger than the average conditional variance — 1.25 against 0.5.*

**4:00–4:07** — Now let the coin itself be random: its bias is drawn uniformly between zero and one, and then it is tossed three times.

> Caption: Now let the coin's own bias be random, uniform on the interval from 0 to 1.

**4:07–4:15** — Given the bias, the mean is three times the bias. Averaging the bias, which has mean one half, gives one point five heads.

> Caption: Given p, the mean is 3p, so the overall mean is 3 times the mean of p, 1.5.

**4:15–4:22** — Its variance is one point two five, and only zero point five of that is the average conditional variance. The rest comes from the bias itself varying.

> Caption: Its variance is 1.25, and only 0.5 of that is the average conditional variance.

**4:22–4:30** — Mixing always adds variance. The mixture is wider than the average of its parts.

> Caption: Mixing always adds variance: the mixture is wider than any of its parts.

Exam-trap caption mode adds: *Do not answer a random-parameter question with the fixed-parameter formula. The mean survives, the variance does not.*

## Scene 10. The procedure, and the five places marks are lost

*4:30 – 5:00 · objective: State the four-step procedure for a conditional-expectation question and the five traps that produce a plausible wrong answer.*

**4:30–4:37** — Step one: name the condition, and check the conditions partition the sample space.

> Caption: Step one: name the condition, and check that the conditions partition the space.

**4:37–4:45** — Step two: compute one ordinary mean inside each part.

> Caption: Step two: compute one mean per condition, as an ordinary mean of that part.

**4:45–4:52** — Step three: weight each mean by the probability of its condition, and add. The weights must total one.

> Caption: Step three: weight by the probability of each condition, then add.

Exam-trap caption mode adds: *Using the conditional probabilities as weights, instead of the probabilities of the conditions, is the commonest arithmetic slip.*

**4:52–5:00** — Two failures dominate. Forgetting to count the step already taken, and conditioning on a single value of a continuous variable.

> Caption: Trap: forgetting the first step. Trap: dividing by zero for a continuous condition.

Exam-trap caption mode adds: *In a recursion, every term must count the toss or draw just made. Leaving it out gives an answer that is too small by one.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
