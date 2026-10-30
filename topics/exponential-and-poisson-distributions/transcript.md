# The Exponential and Poisson Distributions: One Rate, Two Questions, and the Four Places the Arithmetic Breaks — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/exponential-and-poisson-distributions/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. One rate, two questions

*0:00 – 0:30 · objective: Separate the two questions a single rate answers — how many in a window, and how long until the next one — and name the distribution that answers each.*

**0:00–0:07** — A single rate describes both how often something happens and how long you wait for it. They are two questions about one number.

> Caption: One number, the rate, answers two different questions about the same events.

**0:07–0:15** — How many events fall in this window? That is a count, and the count is Poisson.

> Caption: How many in this window? A count, and the answer is the Poisson distribution.

**0:15–0:22** — How long until the next event? That is a wait, and the wait is exponential.

> Caption: How long until the next one? A wait, and the answer is the exponential distribution.

**0:22–0:30** — Same lambda, two different shapes. Confusing the count with the wait is the commonest error in this topic.

> Caption: Same lambda, two shapes. Confusing the two is the commonest error here.

Exam-trap caption mode adds: *A count is discrete and a wait is continuous. Never put a gap length on the count axis.*

## Scene 2. The Poisson mass function

*0:30 – 1:00 · objective: Write P(X = k) = e^{-lambda} lambda^k / k!, show the masses over every k add to one at lambda = 3, and compute the mean and the variance by summation to see that both are 3.*

**0:30–0:37** — The Poisson mass function: the probability of exactly k events is e to the minus lambda, times lambda to the k, divided by k factorial.

> Caption: P(X = k) = e to the minus lambda, times lambda to the k, over k factorial.

**0:37–0:45** — Summed over every k, the masses add to exactly one. At lambda equal to three the page gets one to fifteen decimal places.

> Caption: Over every k the masses add to one. At lambda = 3 that is 1 to fifteen decimal places.

**0:45–0:52** — Its mean is lambda, and its variance is also lambda. Both are computed here by summing over k, not quoted from a table.

> Caption: The mean is lambda and the variance is also lambda — both computed by summing, not quoted.

**0:52–1:00** — Mean equal to variance is the signature of the Poisson distribution, and it is the first thing to check before using it.

> Caption: Mean equal to variance is the signature of Poisson, and the first thing to check.

Exam-trap caption mode adds: *For a Poisson variable the standard deviation is the square root of lambda, not lambda. GATE CSE 2016 Set 1 Q4 turns on exactly this.*

## Scene 3. Poisson as the limit of a binomial

*1:00 – 1:30 · objective: Hold lambda = np fixed and grow n, watching the largest gap between the binomial and the Poisson mass fall by about one decimal place per factor of ten, then answer GATE CSE 2013 Q2 from the same mass function.*

**1:00–1:07** — The binomial counts successes in n trials. Fix the product n times p and let n grow.

> Caption: Binomial counts successes in n trials. Fix lambda = n times p and grow n.

**1:07–1:15** — At ten trials the largest gap between the binomial and the Poisson mass is about four hundredths.

> Caption: At n = 10 the largest gap between the binomial and Poisson(3) mass is 0.0428.

**1:15–1:22** — At a thousand trials the gap is about three ten-thousandths. Each factor of ten in n buys a factor of ten in accuracy.

> Caption: At n = 1000 it is 0.000337: one decimal place per factor of ten in n.

**1:22–1:30** — GATE 2013 asked for fewer than three cars with mean three. That is the sum of the masses at zero, one and two: seventeen over two e cubed, about 0.4232.

> Caption: GATE CSE 2013 Q2: mean 3, fewer than 3 cars is 17/(2e cubed) = 0.4232.

Exam-trap caption mode adds: *Fewer than three stops at k = 2. Including k = 3 gives 0.6472, which is a different question.*

## Scene 4. The exponential tail and the 37 per cent

*1:30 – 2:00 · objective: Read the density lambda e^{-lambda x}, integrate it to the tail e^{-lambda x}, and see that the chance of outliving the mean is e^{-1} = 0.3679 for every lambda — the GATE CSE 2021 Set 1 Q18 answer.*

**1:30–1:37** — The exponential density is lambda times e to the minus lambda x. Integrating it from x upwards leaves e to the minus lambda x.

> Caption: The exponential density is lambda e to the minus lambda x, and its tail is e to the minus lambda x.

**1:37–1:45** — The mean is one over lambda. Lambda is a rate and the mean is a wait, so the two are reciprocals.

> Caption: The mean is one over lambda. Lambda is a rate; the mean is a wait.

**1:45–1:52** — The chance of outliving the mean is e to the minus one, about 0.3679, for every value of lambda.

> Caption: Outliving the mean has probability e to the minus one, 0.3679, for every lambda.

**1:52–2:00** — GATE 2021 Set 1 asked for the probability of outliving the expected lifetime at parameter two. The answer is e to the minus one, about 0.37, and the parameter never enters.

> Caption: GATE CSE 2021 Set 1 Q18 asks exactly that at lambda = 2. The answer never uses the 2.

Exam-trap caption mode adds: *Lambda = 2 is a rate. The mean is 0.5, and the question asks for P(X > 0.5), not P(X > 2).*

## Scene 5. Memorylessness, and the two distributions that lack it

*2:00 – 2:30 · objective: Test P(X > s + t | X > s) = P(X > t) directly from the conditional definition for the exponential, and watch a uniform wait and a fixed wait fail the same test.*

**2:00–2:07** — Memorylessness says that given a wait has already lasted s, the chance of lasting t more is the same as the chance a fresh wait lasts t.

> Caption: Memorylessness: given s already survived, the next t has the same law as a fresh t.

**2:07–2:15** — Checked directly from the conditional definition at lambda equal to two, every pair of s and t on the page agrees to the last digit.

> Caption: Checked from the conditional definition at lambda = 2, for every s and t on the page.

**2:15–2:22** — A uniform wait between zero and ten is not memoryless. Given five has been survived, five more has probability zero where a fresh five had one half.

> Caption: A uniform wait on 0 to 10 is not memoryless: given 5 survived, five more has probability 0.

**2:22–2:30** — A fixed wait of ten fails as well. Only the exponential in continuous time and the geometric in discrete time are memoryless.

> Caption: A fixed wait of 10 fails too. Only the exponential and the geometric pass.

Exam-trap caption mode adds: *Memoryless does not mean "no distribution". It means the conditional tail has the same shape as the original tail.*

## Scene 6. The count and the gap are one process

*2:30 – 3:00 · objective: Show that exponential gaps produce a Poisson count: the chance of at least k arrivals by time t equals the chance that the k-th arrival came by t, checked numerically for k = 1 to 4.*

**2:30–2:37** — If the gaps are exponential, the number of arrivals by time t is Poisson with mean lambda t. One rate, two faces of one process.

> Caption: Exponential gaps produce a Poisson count. One rate, two faces of one process.

**2:37–2:45** — The check is that at least k arrivals by time t is the same event as the k-th arrival having happened by t.

> Caption: The test: at least k arrivals by t must equal the k-th arrival having come by t.

**2:45–2:52** — At lambda three, time one, at least two arrivals, both routes give 0.800852.

> Caption: At lambda = 3, t = 1, k = 2 both routes give 0.800852.

**2:52–3:00** — No event in time t is e to the minus lambda t either way: the count is zero, or the first gap exceeds t.

> Caption: So "no event in t" is e to the minus lambda t two ways: count zero, or first gap beyond t.

Exam-trap caption mode adds: *The Poisson parameter for a window is lambda times the window. A rate of 3 per minute is 6 per two minutes.*

## Scene 7. The unit is the whole question

*3:00 – 3:30 · objective: Convert a rate per unit time into lambda for the window actually asked about — 20 requests per hour over 45 minutes is lambda = 15 — and see what the wrong conversion gives.*

**3:00–3:07** — Twenty requests an hour over forty-five minutes is lambda equal to twenty times three quarters, which is fifteen.

> Caption: Twenty requests per hour, over 45 minutes: lambda = 20 times 0.75 = 15.

**3:07–3:15** — The probability of no request is e to the minus fifteen, about three in ten million. Using the rate itself gives a number nine times smaller.

> Caption: No request at all is e to the minus 15 = 3.06 times ten to the minus seven.

**3:15–3:22** — In the other direction, three cars a minute is a mean gap of one third of a minute, which is twenty seconds.

> Caption: The other direction: 3 cars per minute is a mean gap of one third of a minute, 20 seconds.

**3:22–3:30** — So a rate must be multiplied by the window before it can be used as lambda.

> Caption: So a rate must be multiplied by the window before it is a lambda.

Exam-trap caption mode adds: *Lambda is the mean count in the window. A rate alone is not lambda until it has been multiplied by the window.*

## Scene 8. The moments GATE asks for

*3:30 – 4:00 · objective: Generate every Poisson moment from E[X] = lambda and Var(X) = lambda: the second moment 30 at lambda = 5, E[(X+2)^2] = 54, and a standard deviation of the square root of the mean.*

**3:30–3:37** — Two facts generate every moment GATE asks for: the mean is lambda and the variance is lambda.

> Caption: Two facts generate every Poisson moment: the mean is lambda and the variance is lambda.

**3:37–3:45** — So the second moment is the variance plus the square of the mean: five plus twenty-five, which is thirty at lambda equal to five.

> Caption: So E[X squared] = variance + mean squared = lambda + lambda squared, which is 30 at 5.

**3:45–3:52** — Expanding the square and applying linearity gives thirty plus twenty plus four, which is fifty-four. That is GATE 2017 Set 2 question 48.

> Caption: E[(X+2) squared] = 30 + 20 + 4 = 54. That is GATE CSE 2017 Set 2 Q48.

**3:52–4:00** — The standard deviation is the square root of lambda, and so the square root of mu when the mean is written mu. That is GATE 2016 Set 1 question 4.

> Caption: The standard deviation is the square root of lambda, so the square root of mu when the mean is mu.

Exam-trap caption mode adds: *The second moment is not the square of the mean. At lambda = 5 they are 30 and 25, and only one of them is a printed option.*

## Scene 9. Where each one stops applying

*4:00 – 4:30 · objective: Break both models on purpose: clustered arrivals with variance above the mean, and the inspection paradox, where a mean gap of 10 is answered by a mean wait of 41.45.*

**4:00–4:07** — Poisson needs a constant rate and independent arrivals, so its variance must equal its mean.

> Caption: Poisson needs a constant rate and independent arrivals, so its variance must equal its mean.

**4:07–4:15** — Ten one-minute windows with counts zero, zero, three, zero, zero, four, zero, zero, zero, three have mean one and variance two point four. Arrivals that cluster are not Poisson.

> Caption: Ten windows with counts 0,0,3,0,0,4,0,0,0,3 have mean 1 and variance 2.4.

**4:15–4:22** — Arriving at a random time gives a mean wait of forty-one and a half minutes when the mean gap is ten, because long gaps are more likely to be interrupted.

> Caption: Arrive at a random time and the wait you get is not the mean gap: 41.45 against 10.

**4:22–4:30** — The exponential is the one case where the wait equals the mean gap, and that is memorylessness again.

> Caption: The exponential is the one case where the wait equals the mean gap. That is memorylessness again.

Exam-trap caption mode adds: *The mean gap is not the mean wait unless the gaps are exponential. Ten-minute gaps answer five on average for a fixed schedule.*

## Scene 10. The four-step procedure

*4:30 – 5:00 · objective: Fix the decision order — count or wait, convert the rate, read the inequality, then use variance = mean — and finish on the distinction between P(X > the mean) and P(X > the parameter).*

**4:30–4:37** — Step one: is the question a count or a wait? A count is Poisson and a wait is exponential.

> Caption: Step one: is the question a count or a wait? Poisson or exponential follows.

**4:37–4:45** — Step two: convert every rate to the window in the question before touching a formula.

> Caption: Step two: convert the rate to the window the question is about, before any formula.

**4:45–4:52** — Step three: read the inequality. Fewer than k stops at k minus one, and at least one is one minus the probability of zero.

> Caption: Step three: read the inequality. "Fewer than k" stops at k minus one; "at least one" is one minus P of zero.

**4:52–5:00** — Step four: for a spread or a second moment use variance equals mean. And answer the question that was asked.

> Caption: Step four: for a spread or a second moment, use variance = mean. Then answer what was asked.

Exam-trap caption mode adds: *P(X > the mean) is 0.3679 at every lambda, but P(X > lambda) is e to the minus lambda squared. Read which threshold is being used.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
