# Binomial Distribution — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/binomial-distribution/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. One trial, then ten of them

*0:00 – 0:30 · objective: Define a Bernoulli trial, define the binomial count as a sum of n of them, and state the three conditions the model needs.*

**0:00–0:07** — A Bernoulli trial has two outcomes. Success happens with probability p, failure with q equal to one minus p. At p equal to 0.3 the bars are 0.70 and 0.30.

> Caption: A Bernoulli trial has two outcomes: success with probability p, failure with q = 1 - p. At p = 0.3 the two bars are 0.70 and 0.30.

**0:07–0:15** — Ten independent trials, each with the same probability. Three of the ten came out a success in this run.

> Caption: Ten independent trials, each with the same p. Here three of the ten came out a success.

**0:15–0:22** — X is the count, written as a sum of ten indicator variables, each one for a success and zero otherwise.

> Caption: X is the count: X = X1 + X2 + ... + X10, where each Xi is 1 for a success and 0 otherwise.

**0:22–0:30** — Three conditions: n fixed, p constant, trials independent. Then the mean is np, three here, and the variance is npq, 2.1.

> Caption: Three conditions: n fixed in advance, p the same every trial, trials independent. Then E[X] = np = 3 and Var = npq = 2.1.

Exam-trap caption mode adds: *Independence is not needed for E[X] = np, which holds by linearity alone. It is needed for Var = npq.*

## Scene 2. The mass function

*0:30 – 1:00 · objective: Build C(n,k) p^k q^(n-k) from the number of sequences, read the bar chart at n = 10, p = 0.3, and see the eleven bars total exactly 1.*

**0:30–0:37** — The mass at k is the number of sequences with k successes, times the probability of one such sequence. It is a mass function, so the probability sits on the integers.

> Caption: P(X = k) = C(n,k) p^k q^(n-k), for k from 0 to n. This is a mass function: the probability sits on the integers.

**0:37–0:45** — At ten trials and p 0.3 the tallest bar is three: one hundred and twenty sequences, each with probability 0.002224.

> Caption: At n = 10 and p = 0.3 the tallest bar is k = 3: C(10,3) = 120 sequences, each of probability 0.3^3 x 0.7^7 = 0.002224.

**0:45–0:52** — One hundred and twenty times 0.002224 gives 0.266828. The two end bars are q to the n and p to the n, 0.028248 and 0.000006.

> Caption: 120 x 0.002224 = 0.266828. The two end bars are 0.7^10 = 0.028248 and 0.3^10 = 0.000006.

**0:52–1:00** — The eleven bars total exactly one, and nothing outside zero to ten carries any mass at all.

> Caption: The eleven bars total 1.000000000000, and nothing outside k = 0 to 10 carries any mass.

Exam-trap caption mode adds: *A binomial has a largest possible count, n. A Poisson does not, so P(X at most k) never reaches exactly 1 for a Poisson.*

## Scene 3. Ratios, and where the peak sits

*1:00 – 1:30 · objective: Use P(k+1)/P(k) = ((n-k)/(k+1))(p/q) to walk the distribution, and locate the peak at floor((n+1)p) rather than at np.*

**1:00–1:07** — Neighbouring masses differ by one multiplication: n minus k over k plus one, times p over q. No factorial is ever needed.

> Caption: Neighbouring masses differ by one multiplication: P(k+1)/P(k) = ((n-k)/(k+1)) x (p/q). No factorial is ever needed.

**1:07–1:15** — The measured ratios are four point two eight, one point nine three, one point one four, then 0.75. The formula gives the same ten numbers.

> Caption: The ratios measured from the bars are 4.285714, 1.928571, 1.142857, then 0.75 — and the formula gives the same ten numbers.

**1:15–1:22** — The peak is at floor of n plus one times p. At ten trials that is three; at nine trials with a fair coin the peak is five and four ties with it.

> Caption: The peak is at floor((n+1)p). At n = 10, p = 0.3 that is floor(3.3) = 3; at n = 9, p = 0.5 it is 5, and 4 ties with it at 0.246094.

**1:22–1:30** — It is not np. At five trials and p 0.3 the mean is one and a half but the peak is at one, because 0.360150 beats 0.308700.

> Caption: Not np: at n = 5 and p = 0.3 the mean is 1.5, but the peak is at 1, because 0.360150 beats 0.308700.

Exam-trap caption mode adds: *The mode is floor((n+1)p), not round(np). At n = 5, p = 0.3 the two rules disagree: the peak is at 1, not 2.*

## Scene 4. np and npq, derived then checked

*1:30 – 2:00 · objective: Derive the mean and variance from indicator variables, confirm them by summing the bars, and see how the variance behaves when the mean is held fixed rather than n.*

**1:30–1:37** — Each trial contributes p to the mean, so the mean of the count is n times p. That step needs only linearity, not independence.

> Caption: Each trial contributes p to the mean, so E[X] = np — by linearity, with no independence needed.

**1:37–1:45** — Each trial has variance p minus p squared, which is p times q. Independent variances add, so the variance of the count is npq.

> Caption: Each trial has variance p - p^2 = pq, and independent variances add, so Var(X) = npq.

**1:45–1:52** — Summing the bars agrees at every parameter pair: at a hundred trials the mean is thirty and the variance twenty-one, by both routes.

> Caption: Summing the bars agrees at every parameter pair: at n = 100, p = 0.3 the mean is 30 and the variance 21, by both routes.

**1:52–2:00** — With the mean held at six the variance is six times one minus p: five point four at p 0.1, three at p 0.5 and 0.6 at p 0.9. Rare events give the quietest count.

> Caption: With the mean held at 6, the variance is 6(1-p): 5.4 at p = 0.1, 3.0 at p = 0.5 and 0.6 at p = 0.9. Rare events give the quietest count.

Exam-trap caption mode adds: *The variance of a binomial is always below its mean, because q is below 1. A variance larger than the mean is evidence against a binomial model.*

## Scene 5. GATE CSE 2004: the Hamming distance

*2:00 – 2:30 · objective: Recognise a binomial in two random bit strings, answer C(n,d)/2^n, and explain why C(n,d)/2^d is the trap.*

**2:00–2:07** — Two random eight-bit strings. In each position the bits differ with probability one half, independently of the other positions.

> Caption: Two random 8-bit strings. In each position the two bits differ with probability 1/2, independently of the other positions.

**2:07–2:15** — So the Hamming distance is the number of successes in n fair trials. It has a binomial distribution with parameters n and one half.

> Caption: So the Hamming distance D is the number of successes in n fair trials: D has a binomial distribution with parameters n and 1/2.

**2:15–2:22** — The probability is C of n choose d over two to the n. At eight bits and distance three that is fifty-six over two hundred and fifty-six, 0.218750.

> Caption: P(D = d) = C(n,d)/2^n. At n = 8 and d = 3 that is 56/256 = 0.218750, the highlighted bar.

**2:22–2:30** — Counting agrees: two to the eight times C of eight choose three is fourteen thousand three hundred and thirty-six pairs out of sixty-five thousand five hundred and thirty-six. The distractor over two to the d forgets the agreeing positions.

> Caption: Counting agrees: 2^8 x C(8,3) = 14336 pairs out of 65536. The distractor C(n,d)/2^d forgets the positions that agree.

Exam-trap caption mode adds: *C(n,d)/2^d is wrong because the n-d agreeing positions each still contribute a factor of 1/2. The denominator is 2^n, never 2^d.*

## Scene 6. GATE CSE 2006: exactly n out of 2n

*2:30 – 3:00 · objective: Answer C(2n,n)/4^n, and see that it is a shrinking probability, not the constant 1/2.*

**2:30–2:37** — A set of size two n, one fair coin per element, chosen on a head. The number chosen is binomial with two n trials and p one half.

> Caption: A set of size 2n, one fair coin per element, an element chosen on a head: the count chosen is Binomial(2n, 1/2).

**2:37–2:45** — The probability of exactly n is C of two n choose n times one half to the n twice, which is C of two n choose n over four to the n.

> Caption: P(X = n) = C(2n,n) (1/2)^n (1/2)^n = C(2n,n)/4^n, because two to the 2n is four to the n.

**2:45–2:52** — The other options fail: one drops a factor of two to the n, one inverts the count, and one half is only the limit.

> Caption: The other options fail: C(2n,n)/2^n drops a factor, 1/C(2n,n) inverts the count, and 1/2 is only the limit.

**2:52–3:00** — It is a shrinking probability: one half at n equals one, 0.375 at n equals two, and 0.112275 at n equals twenty-five, against the limit 0.112838.

> Caption: It is a shrinking probability: 0.5 at n = 1, 0.375 at n = 2, and 0.112275 at n = 25 against the limit 0.112838.

Exam-trap caption mode adds: *Answering 1/2 for C(2n,n)/4^n is right only at n = 1. The expression is a function of n, so an option with no n in it cannot be the general answer.*

## Scene 7. Adding two binomials

*3:00 – 3:30 · objective: Prove by convolution that equal p lets the trial counts add, and exhibit an unequal-p sum that has the same mean and variance and is still not binomial.*

**3:00–3:07** — Two independent binomials with the same p add by adding the trial counts: four and six trials make ten.

> Caption: Two independent binomials with the same p add by adding trial counts: Bin(4,0.3) + Bin(6,0.3) is Bin(10,0.3).

**3:07–3:15** — Convolving the two mass functions reproduces the eleven bars of the ten-trial binomial with no difference at all.

> Caption: Convolving the two mass functions reproduces the eleven bars of Binomial(10, 0.3) with largest difference 0.000000000000.

**3:15–3:22** — Different p and it breaks. Two trials at 0.2 plus three at 0.8 is not the five-trial fair binomial: the probability of one is 0.064 against 0.156250.

> Caption: Different p and it breaks: Bin(2,0.2) + Bin(3,0.8) is not Binomial(5, 0.5) — P(1) is 0.064000 against 0.156250.

**3:22–3:30** — The mean and the variance add up either way, 2.8 and 0.8, so equal moments do not make the sum binomial.

> Caption: The mean 2.8 and the variance 0.8 add up either way — so equal moments do not make the sum binomial.

Exam-trap caption mode adds: *Adding two binomials is only binomial when p is the same. Matching means and variances is not evidence that it is.*

## Scene 8. The Poisson limit

*3:30 – 4:00 · objective: Hold np at 3 and measure the gap to the Poisson as n grows by factors of ten, then state when the approximation is worth using.*

**3:30–3:37** — Hold the mean at three and let the trial count grow. The mass function slides towards the Poisson at rate three, drawn here as dots over the bars.

> Caption: Hold the mean at np = 3 and let n grow. The mass function slides towards Poisson(3), drawn here as dots over the bars.

**3:37–3:45** — At ten trials the largest gap is 0.04279, and the probability of zero is 0.028248 against the Poisson 0.049787.

> Caption: At n = 10, p = 0.3 the largest gap is 0.04279; P(0) is 0.028248 against the Poisson 0.049787.

**3:45–3:52** — Each factor of ten in the trial count buys a factor of ten in accuracy, from three in a thousand at a hundred trials to three in a million at a hundred thousand.

> Caption: Each factor of ten in n buys a factor of ten in accuracy: 3.432e-3 at n = 100, 3.368e-4 at 1000, down to 3.361e-6 at 100000.

**3:52–4:00** — The other limit is the normal, when np and nq are both large. Same family, two different directions.

> Caption: The other limit is the normal, when np and nq are both large. Same family, two different directions.

Exam-trap caption mode adds: *The Poisson limit needs np fixed and p small. If np is 30 and p is 0.5, the normal approximation is the right one, not the Poisson.*

## Scene 9. Two questions that sound alike

*4:00 – 4:30 · objective: Separate successes in a fixed number of trials from trials until a fixed number of successes, with the geometric and negative binomial means.*

**4:00–4:07** — Trials until the first success: the probability that it takes exactly n is q to the n minus one times p. This is the geometric distribution, and n has no upper bound.

> Caption: Trials until the first success: P(N = n) = q^(n-1) p. This is the geometric distribution, and N has no upper bound.

**4:07–4:15** — Its mean is one over p, 3.3333, and its median is 2. The chance of at least one success in ten trials is 0.971752.

> Caption: Its mean is 1/p = 3.3333 and its median is 2. The chance of at least one success in ten trials is 1 - 0.7^10 = 0.971752.

**4:15–4:22** — The chance that the third success lands exactly on trial five is 0.079380, not the 0.132300 the binomial gives for three successes in five trials.

> Caption: P(the 3rd success lands on trial 5) = C(4,2) x 0.3^3 x 0.7^2 = 0.079380 — not C(5,3) x 0.3^3 x 0.7^2 = 0.132300.

**4:22–4:30** — The negative binomial counts trials until k successes, with mean k over p, ten here. The geometric is the case k equals one.

> Caption: The negative binomial counts trials until k successes, with mean k/p = 10 here. The geometric is the case k = 1.

Exam-trap caption mode adds: *The two questions differ by 0.052920 at these numbers. Read whether the fixed quantity is the number of trials or the number of successes before writing any coefficient.*

## Scene 10. Where the binomial stops applying

*4:30 – 5:00 · objective: Show sampling without replacement giving a different distribution with the same mean, and finish on the four-step procedure.*

**4:30–4:37** — Drawing four from ten with three marked, without replacement: the probability changes on every draw, so this is the hypergeometric distribution, not the binomial.

> Caption: Draw four from ten with three marked, without replacement: p changes on every draw, so this is hypergeometric, not binomial.

**4:37–4:45** — The probability of one is 0.5 against the binomial 0.4116, and the variance shrinks by two thirds to 0.56, while the mean stays at 1.2.

> Caption: P(1) is 0.500000 against the binomial 0.411600, and the variance shrinks by (N-n)/(N-1) = 0.666667 to 0.560000.

**4:45–4:52** — Break any one condition and the arithmetic changes: no fixed trial count, a probability that drifts, or trials that share a cause.

> Caption: Break any one condition and the arithmetic changes: no fixed n, a p that drifts, or trials that share a cause.

Exam-trap caption mode adds: *A variance larger than the mean is impossible for a binomial. If a problem hands you one, the model is wrong, not the arithmetic.*

**4:52–5:00** — The procedure: check the three conditions, decide which quantity is fixed, then use np, npq, floor of n plus one times p, and the ratio.

> Caption: The procedure: check the three conditions, decide which quantity is fixed, then use np, npq, floor((n+1)p) and the ratio.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
