# Probability, Random Variables and Distributions — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/probability-and-random-variables/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Outcomes, events and the three axioms

*0:00 – 0:30 · objective: Read a probability as a count of equally likely outcomes, and state the three axioms that every probability obeys.*

**0:00–0:07** — Probability starts with two objects. The sample space, which is the set of everything that can happen. And an event, which is a subset of that space. A probability is then a rule that gives each event a number between zero and one.

> Caption: Probability starts with a set of outcomes and a rule that gives every event a number.

Exam-trap caption mode adds: *Two dice produce thirty-six ordered outcomes, not twenty-one unordered sums. Counting sums instead of outcomes is the first wrong answer offered.*

**0:07–0:15** — When all thirty-six outcomes are equally likely, the probability of an event is just a count. Six of the thirty-six pairs give a sum of seven, so the probability is six over thirty-six, which is one sixth.

> Caption: P(sum = 7) = 6/36 = 1/6, because six of the thirty-six outcomes give seven.

Exam-trap caption mode adds: *Seven is the most likely sum, and its probability is still only one sixth. Most likely does not mean likely.*

**0:15–0:22** — The sum is more than nine in exactly six outcomes as well. Ten comes in three ways, eleven in two, and twelve in one. Add them and you have six over thirty-six, the same probability as a sum of seven.

> Caption: P(sum > 9) is also 6/36: the sums 10, 11 and 12 carry three, two and one outcomes.

Exam-trap caption mode adds: *The counts are not equal across the sums. Reading the eleven bars as equal heights throws away the whole distribution.*

**0:22–0:30** — Three axioms generate everything else. The whole sample space has probability one. No event has a negative probability. And when two events cannot happen together, the probability that either happens is the sum of the two. Everything else in probability is a consequence.

> Caption: The three axioms: P(S) = 1, every probability lies between 0 and 1, and disjoint events add.

Exam-trap caption mode adds: *The addition rule needs disjointness. Applying it to overlapping events double-counts the intersection.*

## Scene 2. Conditioning shrinks the sample space

*0:30 – 1:00 · objective: Compute a conditional probability by restricting to the conditioning event, and separate independence from mutual exclusivity.*

**0:30–0:37** — Conditioning is the act of discarding part of the sample space. Given that B happened, every outcome outside B is gone. What remains is B, and the probabilities inside it are scaled up so that they again total one.

> Caption: Conditioning on B throws away every outcome outside B and renormalises what is left.

Exam-trap caption mode adds: *P(A | B) and P(B | A) are different numbers with the same ingredients. Never swap them.*

**0:37–0:45** — Here is the grid of thirty-six outcomes. Keeping only the cells whose sum is more than nine leaves six of them. That six is now the whole world, and it becomes the denominator of every probability we compute next.

> Caption: The event "sum > 9" keeps 6 of the 36 outcomes, so the new sample space has size 6.

Exam-trap caption mode adds: *The denominator is the conditioning event, not the original sample space. Dividing by 36 gives the joint probability, not the conditional one.*

**0:45–0:52** — Within those six cells, exactly two give a sum of eleven: five and six, and six and five. So the conditional probability is two over six, one third. The same answer comes from dividing two over thirty-six by six over thirty-six, which is what the definition says.

> Caption: Inside it, 2 outcomes give 11, so P(sum = 11 | sum > 9) = 2/6 = 1/3.

Exam-trap caption mode adds: *The answer is larger than the unconditional one sixth. Conditioning on a rarer event can raise a probability, which feels wrong until you see the smaller denominator.*

**0:52–1:00** — Two words get confused constantly. Independent means the overlap equals the product, so knowing one event tells you nothing about the other. Mutually exclusive means the overlap is empty, so knowing one event tells you everything: the other cannot happen. Disjoint events are dependent, unless one of them has probability zero.

> Caption: Independence is P(A and B) = P(A)P(B); mutual exclusivity is P(A and B) = 0. They are not the same.

Exam-trap caption mode adds: *Options that offer "independent because they cannot both happen" are the classic trap. Disjointness is the opposite of independence in almost every exam example.*

## Scene 3. Bayes' theorem: from evidence back to cause

*1:00 – 1:30 · objective: Apply Bayes' theorem with a two-part partition, and see that a posterior can sit below the prior.*

**1:00–1:07** — Bayes theorem answers the question you actually have. You know how likely the evidence is given a cause, and you want how likely the cause is given the evidence. The two are linked because both are the same overlap, divided by different things.

> Caption: Bayes' theorem turns P(evidence | cause) into P(cause | evidence).

Exam-trap caption mode adds: *The denominator is the total probability of the evidence over every cause, not just the one you are asking about.*

**1:07–1:15** — Here is a real question. A sender transmits H with probability 0.1 and L with 0.9. The channel is noisy: an H arrives as an H only three times in ten, while an L arrives as an H eight times in ten. We receive an H. What was sent?

> Caption: GATE 2021 Set 1 Q54: H is transmitted with probability 0.1, L with 0.9.

Exam-trap caption mode adds: *The prior and the likelihood are given in different directions. Read which one the question hands you before substituting.*

**1:15–1:22** — First compute how often an H arrives at all. It arrives from an H with probability 0.03, and from an L with probability 0.72. Add the two disjoint paths and an H arrives with probability 0.75. That is the law of total probability, and it is the denominator.

> Caption: P(H received) = 0.3(0.1) + 0.8(0.9) = 0.75, by the law of total probability.

Exam-trap caption mode adds: *Forgetting the second path leaves the denominator at 0.03, and the answer becomes 1. Any posterior above one is a signal that a path was dropped.*

**1:22–1:30** — Now divide. The path where H was sent and H arrived is 0.03. The total is 0.75. The ratio is 0.04. Notice that this is below the prior of 0.1: seeing an H makes an H transmission less likely, not more, because a corrupted L produces H far more often.

> Caption: P(H sent | H received) = 0.03 / 0.75 = 0.04. The posterior sits below the prior.

Exam-trap caption mode adds: *Answering 0.3 means you reported the likelihood and stopped. The likelihood is given; the posterior is the answer.*

## Scene 4. Random variables, PMF, CDF and density

*1:30 – 2:00 · objective: Treat a random variable as a function on outcomes, and read the same distribution from its PMF or density and from its CDF.*

**1:30–1:37** — A random variable is not a variable and it is not random. It is a function. Each outcome of the experiment is mapped to a number. Once the outcome is fixed, the number is fixed; before that, the number is uncertain because the outcome is.

> Caption: A random variable is a function: it assigns a number to each outcome.

Exam-trap caption mode adds: *A capital X is the function; a small x is a value it can take. P(X = x) is the probability that the function lands on that value.*

**1:37–1:45** — For a discrete random variable the distribution is a list: each value, and its probability. Two rules make the list legal. No entry is negative, and the entries add up to one. That is all a probability mass function is.

> Caption: For a discrete variable the PMF gives each value its probability, and those probabilities sum to 1.

Exam-trap caption mode adds: *A table whose entries sum to 1.2 is not a distribution. Many questions hand you one and ask for the constant that fixes it.*

**1:45–1:52** — The cumulative distribution function asks a different question: what is the probability that the variable is at most this value. Add the masses as you move right and you get a staircase. It never goes down, it jumps exactly at the values with mass, and it arrives at one.

> Caption: The CDF F(x) = P(X <= x) is a staircase: non-decreasing, flat between values, reaching 1.

Exam-trap caption mode adds: *The CDF gives P(X at most x), including x. For a discrete variable the jump at a value is the mass at that value, so the left limit differs from the value.*

**1:52–2:00** — A continuous random variable has a density instead of a table. Probability is area under the density. A single point has no width, so it has no area, so the probability of any exact value is zero. That is not a technicality: it is why the density can be greater than one, and why at most and less than give the same answer here.

> Caption: For a continuous variable only intervals carry probability: P(X = a) = 0 for every a.

Exam-trap caption mode adds: *A density of 3 is legal. Reading the height of the curve as a probability is the single most common continuous-distribution error.*

## Scene 5. Expectation as a balance point

*2:00 – 2:30 · objective: Compute an expectation as a weighted sum, and use linearity of expectation with its exact assumption.*

**2:00–2:07** — The expectation is a weighted average. Put each possible value on a bar, hang a weight equal to its probability, and the point where the bar balances is the expectation. It need not be a value the variable can take.

> Caption: The expectation is the probability-weighted average of the values: the balance point of the PMF.

Exam-trap caption mode adds: *The expectation of a fair die is 3.5, a number the die can never show. Not being attainable is not an error.*

**2:07–2:15** — Here is a distribution from GATE 2026. The variable takes the values one to eight. Four of them carry a probability of one sixth each, and the other four carry one twelfth each. Check the weights first: four sixths plus four twelfths is one.

> Caption: GATE 2026 Set 1: eight values carry weights of one sixth and one twelfth.

Exam-trap caption mode adds: *Assuming the eight values are equally likely gives 4.5. The table is not uniform, and the whole question is the weighting.*

**2:15–2:22** — Multiply and add. The four values weighted by one sixth contribute 2.5. The four weighted by one twelfth contribute 1.75. The expectation is 4.25. Note that it is below the midpoint of the range, because the values carrying the larger weights are the small ones.

> Caption: E[X] = 17/4 = 4.25, a weighted sum and not a plain average of one to eight.

Exam-trap caption mode adds: *The unweighted average of one to eight is 4.5. Quoting it ignores the whole table and is offered as a distractor.*

**2:22–2:30** — One property does most of the work in algorithm analysis. The expectation of a sum is the sum of the expectations, always, with no assumption about dependence. The expectation of a product is the product of the expectations only when the variables are independent. Keep those two apart.

> Caption: Linearity always holds: E[X + Y] = E[X] + E[Y]. E[XY] = E[X]E[Y] needs independence.

Exam-trap caption mode adds: *Splitting a product is the standard error. E[XY] = E[X]E[Y] fails even for simple dependent pairs.*

## Scene 6. Variance, standard deviation, and the three averages

*2:30 – 3:00 · objective: Compute a variance from E[X squared] minus the square of E[X], and tell mean, median and mode apart on skewed data.*

**2:30–2:37** — Two distributions can have the same balance point and nothing else in common. One is tightly packed, one is spread across the range. The mean cannot tell them apart, which is why we need a second number.

> Caption: Two distributions can share a mean and differ completely in spread.

Exam-trap caption mode adds: *Comparing only means is a common shortcut in expectation questions. If the question says variability, spread, or risk, the mean is not the answer.*

**2:37–2:45** — Variance is the average squared distance from the mean. There are two ways to compute it and one is much faster. Take the mean of the squares, which is 23.5833, and subtract the square of the mean, 18.0625. The answer is 5.5208. Square-root it for the standard deviation, 2.3496.

> Caption: Variance is the mean squared distance from the mean: 5.5208 here, so the standard deviation is 2.3496.

Exam-trap caption mode adds: *Forgetting to square the mean is the standard slip. The second term is the square of the mean, not the mean.*

**2:45–2:52** — Two transformation rules. Shift a variable and the variance does not move, because every distance from the mean is unchanged. Scale it and every distance is scaled, so the variance is scaled by the square. Doubling a variable quadruples its variance.

> Caption: Var(aX + b) = a squared times Var(X): shifting does not change spread, scaling squares it.

Exam-trap caption mode adds: *A negative scale still gives a positive variance, because of the square. The sign never survives.*

**2:52–3:00** — Mean, median and mode are three different questions. Where does it balance, where is the middle, and where is the peak. For symmetric data all three agree. For skewed data the mean runs towards the tail and the median does not. And here is a case where the median is obvious without any integration: clip a centred normal at zero and half the mass sits exactly at zero, so the median is zero.

> Caption: Mean, median and mode coincide only for symmetric data; the median of max(X, 0) is 0.

Exam-trap caption mode adds: *The median of a distribution with an atom at zero can be zero even though the variable is otherwise continuous. Do not integrate when the mass already answers it.*

## Scene 7. Bernoulli trials and the binomial distribution

*3:00 – 3:30 · objective: Read a binomial PMF, and get its mean and variance from n and p without summing anything.*

**3:00–3:07** — Start with one trial that succeeds with probability p. Repeat it n times, independently, with the same probability each time, and count the successes. That count is a binomial random variable. Two words in that sentence carry the weight: independently, and the same probability each time.

> Caption: A Bernoulli trial has two outcomes; the binomial counts successes in n independent trials.

Exam-trap caption mode adds: *Drawing without replacement changes p between trials, so the count is not binomial. It is hypergeometric, and the binomial answer will be slightly wrong.*

**3:07–3:15** — The formula has three parts. Choose which of the trials succeeded, and there are n choose k ways. Give each of those successes probability p, and each failure one minus p. Multiply, and sum over k. The sum is one by the binomial theorem, which is the check that the formula is a distribution.

> Caption: The binomial PMF is C(n, k) p^k (1-p)^(n-k), and its values sum to 1.

Exam-trap caption mode adds: *Dropping the binomial coefficient counts one arrangement instead of all of them, and the probabilities no longer sum to one.*

**3:15–3:22** — The mean and the variance need no summation. The mean is n times p, three here. The variance is n times p times one minus p, which is 2.1. The mean came from linearity alone; the variance needed independence as well, which is where the cross terms disappear.

> Caption: Mean np = 3 and variance np(1-p) = 2.1 for n = 10 and p = 0.3.

Exam-trap caption mode adds: *The variance is not np. That is the Poisson, and it is only the limit when p is small.*

**3:22–3:30** — The probability of exactly three successes is 0.2668. A hundred and twenty arrangements, each with probability 0.3 cubed times 0.7 to the seventh. It is also the largest bar, and it sits at the mean, because ten times 0.3 is a whole number. When np is not an integer, the mode is one of the two integers beside it.

> Caption: P(X = 3) = 0.2668: here the mode and the mean coincide at 3.

Exam-trap caption mode adds: *A whole-number mean does not always mean the mode equals it, but here it does. Compute the neighbouring bars rather than assuming.*

## Scene 8. The Poisson distribution and the binomial limit

*3:30 – 4:00 · objective: Use the Poisson PMF with mean equal to variance, and justify the approximation by the size of the gap.*

**3:30–3:37** — The Poisson distribution counts events in an interval of time or space: arrivals at a queue, errors in a page, packets in a slot. The parameter is the average count in that interval. Its assumptions are that the events are independent, the rate is constant, and the interval is fixed in advance.

> Caption: The Poisson counts events in a fixed interval when they occur independently at a constant rate.

Exam-trap caption mode adds: *Choosing the interval after seeing the data changes the model. The interval must be fixed before you count.*

**3:37–3:45** — The probability of exactly k events is e to the minus lambda, times lambda to the k, over k factorial. One property identifies the distribution instantly: the mean and the variance are both lambda. If a question says the variance is three and asks for the mean, and the variable is Poisson, the answer is three.

> Caption: Its PMF is e to the minus lambda, lambda to the k, over k factorial, with mean and variance both lambda.

Exam-trap caption mode adds: *Mean equals variance is necessary for a Poisson, not sufficient for a variable to be one. It is a recognition cue, not a definition.*

**3:45–3:52** — With lambda equal to three, no event at all has probability 0.0498, which is e to the minus three. Exactly three events has probability 0.2240. Note that the probabilities of two and three events are equal here, because lambda is an integer, and that tie is a common source of confusion in multiple-choice options.

> Caption: With lambda = 3 the probability of no event is 0.0498, and of exactly three events 0.2240.

Exam-trap caption mode adds: *For integer lambda the two central bars are equal. Picking one of them as "the most likely" when the question asks for a single mode is the trap.*

**3:52–4:00** — The Poisson is what a binomial becomes when the number of trials grows, the success probability shrinks, and the product stays put. A thousand trials at three thousandths is a binomial with mean three, and its distribution is within 0.0015 of Poisson with lambda three. That is why the approximation is allowed, and the condition is the whole justification.

> Caption: Poisson is the limit of binomial when n is large and p is small with np = lambda: the gap here is 0.0015.

Exam-trap caption mode adds: *The approximation is about n large and p small, not about np being small. Ten trials at 0.3 has the same mean and is not well approximated.*

## Scene 9. The exponential distribution and memorylessness

*4:00 – 4:30 · objective: Compute tail probabilities from the density, and use memorylessness with the condition that makes it true.*

**4:00–4:07** — The exponential is the continuous partner of the Poisson. If events arrive at a constant rate, the time you wait for the next one is exponential, with the same rate parameter. The Poisson counts events in a fixed window; the exponential measures the gap between them.

> Caption: The exponential is the continuous waiting time between Poisson events.

Exam-trap caption mode adds: *The rate and the mean are reciprocals. A mean of four means a rate of one quarter, and mixing the two inverts every answer.*

**4:07–4:15** — The density falls exponentially from lambda. The probability of waiting longer than t is e to the minus lambda t, a formula worth memorising because it replaces an integral in every question. With a mean of four, waiting more than four has probability e to the minus one, 0.3679.

> Caption: Its density is lambda e to the minus lambda x, so the area beyond 4 is e to the minus 1, which is 0.3679.

Exam-trap caption mode adds: *The mean is four but the median is not. The median solves e to the minus lambda t equals one half, which is about 2.77, not 4.*

**4:15–4:22** — Here is the property that makes the exponential special. Having already waited three units, the chance of waiting four more is the same as the chance of waiting four from the start: 0.3679. The distribution forgets how long you have been waiting. That is memorylessness, and it is true for the exponential and the geometric, and for almost nothing else.

> Caption: It is memoryless: P(X > 7 | X > 3) = P(X > 4) = 0.3679.

Exam-trap caption mode adds: *Memorylessness is a property of the distribution, not of your intuition. A uniform waiting time is not memoryless: having waited three of ten minutes, the remaining wait is shorter.*

**4:22–4:30** — The mean is one over lambda, four. The variance is one over lambda squared, sixteen, so the standard deviation is four as well. The median, though, is about 2.77: below the mean, because the distribution is skewed right. Half of all waits are shorter than 2.77 and half are longer, and the long tail pulls the mean up.

> Caption: Mean 1/lambda = 4, variance 1/lambda squared = 16, and the median is below the mean.

Exam-trap caption mode adds: *Reporting the mean as the typical wait overstates it by about forty percent for an exponential. The question says typical for a reason.*

## Scene 10. The normal distribution, and the procedure

*4:30 – 5:00 · objective: Read mean and variance off a normal density, use the 68-95-99.7 rule, and close with the decision procedure for a probability question.*

**4:30–4:37** — The normal is the symmetric bell. Two numbers fix it completely: the centre and the spread. Within one standard deviation of the mean sits 68.27 percent of the probability, within two 95.45, within three 99.73. Because it is symmetric, the mean, the median and the mode are the same number.

> Caption: The normal is fixed by its mean and variance: 68.27, 95.45 and 99.73 percent within one, two and three sigma.

Exam-trap caption mode adds: *The percentages are two-sided bands about the mean. One side alone holds 34.13, not 68.27.*

**4:37–4:45** — To use any normal table, standardise. Subtract the mean, which slides the curve to zero. Divide by the standard deviation, which scales the width to one. The result is the standard normal, and the distance you measured in original units is now a number of standard deviations.

> Caption: Standardise with z = (x - mu)/sigma to turn any normal into the standard one.

Exam-trap caption mode adds: *Dividing by the variance instead of the standard deviation is the standard slip. The divisor is sigma, not sigma squared.*

**4:45–4:52** — Here is the recognition question. Compare the given density with the standard form of a normal. The exponent is minus x squared over eighteen, and the standard exponent is minus x minus mu squared over twice the variance. So twice the variance is eighteen, the variance is nine, the standard deviation is three, and the three in front confirms it. The mean is zero because there is no shift.

> Caption: GATE 2026 Set 2: the density one over three root two pi, e to the minus x squared over eighteen, is normal with mean 0 and variance 9.

Exam-trap caption mode adds: *The denominator in the exponent is twice the variance, not the variance. Reading eighteen as the variance gives the wrong option.*

**4:52–5:00** — One procedure covers the clause. First name the type: discrete or continuous, and which family, from the mean and variance if they are given. Second, translate the sentence into an event with inequalities, being careful about at most and at least. Third, compute, and then check that the answer is a probability. Every option above one, or below zero, is a slip you can catch in five seconds.

> Caption: Procedure: name the variable type, write the question as an event, then compute — and check the answer is a probability.

Exam-trap caption mode adds: *The last step is the cheapest mark in the paper. An answer outside zero to one needs no further thought to reject.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
