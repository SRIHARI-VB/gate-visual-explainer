# Bayes' Theorem as a Revision Rule: Prior, Likelihood, Evidence, Posterior — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/bayes-theorem-as-revision/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A belief meets evidence and is revised

*0:00 – 0:30 · objective: Name the three inputs of a Bayes question — prior, likelihood and evidence — and compute the posterior from them, on five coins of which one is fake.*

**0:00–0:07** — A box holds five coins. Four are regular and one is fake. You draw one without looking.

> Caption: Five coins, one of them fake. The draw is the belief; the tosses are the evidence.

**0:07–0:15** — The prior is zero point two. The likelihood of two heads is one under the fake coin and a quarter under a regular one.

> Caption: The prior is 0.20. The likelihood of two heads is 1.00 for the fake, 0.25 for a regular.

**0:15–0:22** — Multiply each prior by its likelihood and add: zero point two plus zero point two is zero point four. Then zero point two over zero point four is one half.

> Caption: Multiply, add, divide: 0.20 x 1.00 over 0.40 is 0.50.

Exam-trap caption mode adds: *The posterior is not the likelihood. Two heads does not make the coin certainly fake.*

**0:22–0:30** — So Bayes is a revision rule. The answer becomes the starting belief when the next piece of evidence arrives.

> Caption: Bayes is a revision rule: the posterior becomes the prior for the next evidence.

## Scene 2. The evidence is a sum over the hypotheses

*0:30 – 1:00 · objective: Show that the denominator is the total probability of the observation, computed once with the shop bulbs and once with the noisy channel, and that it is the same number for every posterior.*

**0:30–0:37** — Every hypothesis contributes one path. The evidence is the total weight of all the paths that produce what you saw.

> Caption: Every hypothesis contributes one path, and the evidence is the total weight of the paths.

**0:37–0:45** — Half the bulbs are of each type. Zero point five times zero point seven plus zero point five times zero point four is zero point five five.

> Caption: The shop bulbs: 0.5 x 0.7 plus 0.5 x 0.4 is 0.55.

**0:45–0:52** — In the noisy channel the two paths weigh zero point zero three and zero point seven two, so the evidence weighs zero point seven five.

> Caption: The same sum is the denominator of Bayes: 0.03 plus 0.72 is 0.75.

**0:52–1:00** — Dividing both paths by the same zero point seven five gives zero point zero four and zero point nine six, and those add to one.

> Caption: 0.03 over 0.75 is 0.04, and the other posterior is 0.96. They add to one.

Exam-trap caption mode adds: *Miss one path and the denominator is too small, so every posterior is too large.*

## Scene 3. A 99 per cent accurate test, and one half

*1:00 – 1:30 · objective: Count 10,000 people to see why a positive result at 1 per cent prevalence is only a 50 per cent chance of disease, and watch the answer move as the prevalence moves.*

**1:00–1:07** — One person in a hundred is ill. The test catches ninety nine in a hundred of the ill and clears ninety nine in a hundred of the healthy.

> Caption: One person in 100 is ill. The test catches 99 in 100 and clears 99 in 100 of the healthy.

**1:07–1:15** — Take ten thousand people. A hundred are ill, and ninety nine of them test positive.

> Caption: Take 10,000 people: 100 are ill, and 99 of them test positive.

**1:15–1:22** — Nine thousand nine hundred are healthy, and ninety nine of them test positive too.

> Caption: 9,900 are healthy, and 99 of them also test positive.

**1:22–1:30** — Ninety nine over ninety nine plus ninety nine is one half. The accuracy of the test was never the answer; the prior sets the scale.

> Caption: 99 over 99 plus 99 is one half. A positive result is not a 99 per cent chance of disease.

Exam-trap caption mode adds: *Sensitivity is the probability of a positive given illness. The question asks for illness given a positive.*

## Scene 4. The odds form: one multiplication per observation

*1:30 – 2:00 · objective: Convert the prior to odds, multiply by the likelihood ratio, and convert back — 1 to 4 becomes 1 to 1, which is 0.50.*

**1:30–1:37** — Odds compare the fake coin with the regular one: zero point two against zero point eight, which is one to four.

> Caption: Odds compare a hypothesis with its rival: 0.20 against 0.80 is 1 to 4.

**1:37–1:45** — Each observation multiplies the odds by the ratio of the two likelihoods, one over a quarter, which is four.

> Caption: Each observation multiplies the odds by a likelihood ratio: 1 over 0.25 is 4.

**1:45–1:52** — One to four multiplied by four is one to one, and odds of one to one are a probability of one half.

> Caption: 1 to 4 times 4 is 1 to 1, and odds of 1 to 1 are one half.

**1:52–2:00** — The odds form and the fraction form are the same rule. Dividing two posteriors cancels the evidence.

> Caption: The odds form and the fraction form are one rule, written two ways.

Exam-trap caption mode adds: *One likelihood ratio per observation. Multiply them only if the observations are independent given the hypothesis.*

## Scene 5. Updating one observation at a time

*2:00 – 2:30 · objective: Update the five-coin belief after each head, 0.200 to 0.333 to 0.500, and check the chain against the one-step answer for zero to five heads.*

**2:00–2:07** — Toss the coin once and see a head. The belief moves from zero point two to one third.

> Caption: Toss the drawn coin once and see a head. The belief moves from 0.200 to 0.333.

**2:07–2:15** — A second head doubles the odds again, from one to two up to one to one, which is one half.

> Caption: A second head multiplies the odds by 2 again: 0.333 becomes 0.500.

**2:15–2:22** — The chain lands on the same one half as updating on both tosses at once. The table gives the posterior for zero to five heads.

> Caption: The chain 0.200, 0.333, 0.500 agrees with the answer for two heads at once.

**2:22–2:30** — Updating one at a time is exact here because the tosses are independent given the coin. It is not exact when they are not.

> Caption: Sequential updating is exact when the tosses are independent given the coin.

Exam-trap caption mode adds: *Entering the same observation twice gives 0.500 where the honest answer is 0.333.*

## Scene 6. Three hypotheses, and the largest likelihood loses

*2:30 – 3:00 · objective: Compute the three-box posteriors 3/8, 1/4 and 3/8 and see that the hypothesis with the largest likelihood has the smallest posterior.*

**2:30–2:37** — Three boxes, chosen with probabilities one half, one sixth and one third. Those add to one.

> Caption: Three boxes, chosen with probabilities one half, one sixth and one third.

**2:37–2:45** — The likelihoods are one third, two thirds and one half, read straight off the box contents.

> Caption: The white-ball likelihoods are 1/3, 2/3 and 1/2.

**2:45–2:52** — The products are one sixth, one ninth and one sixth, which add to four ninths. The posteriors are three eighths, one quarter and three eighths.

> Caption: The evidence is 4/9, so the posteriors are 3/8, 1/4 and 3/8.

**2:52–3:00** — Box two has the biggest likelihood and the smallest posterior, because it was the least likely box to have been chosen.

> Caption: Box 2 has the largest likelihood and the smallest posterior. The prior decides.

Exam-trap caption mode adds: *Never rank hypotheses by likelihood alone. Rank by prior times likelihood.*

## Scene 7. P(A given B) is not P(B given A)

*3:00 – 3:30 · objective: Work the 2017 job question from the joint probability, and see both conditional directions in one place with their different denominators.*

**3:00–3:07** — The question gives the probability that P applies, and one conditional in each direction. Those two conditionals are different numbers.

> Caption: GATE CSE 2017 Set 2: P applies with 1/4, P of P given Q is 1/2, P of Q given P is 1/3.

**3:07–3:15** — Both conditionals contain the same joint probability, one twelfth. That is the quantity to compute first.

> Caption: Both conditionals contain the same joint probability, 1/12.

**3:15–3:22** — Dividing the joint by the other conditional gives one sixth for Q, so Q does not apply with five sixths.

> Caption: From the joint, Q applies with 1/6, so Q does not with 5/6.

**3:22–3:30** — Neither applies with two thirds, and two thirds over five sixths is four fifths.

> Caption: Neither applies with 2/3, and 2/3 over 5/6 is 4/5.

Exam-trap caption mode adds: *P(A given B) and P(B given A) share a numerator and differ in the denominator.*

## Scene 8. A hypothesis left out of the sum

*3:30 – 4:00 · objective: Compute 4/19 for the two boxes, then remove one box from the denominator and watch the answer become 1.*

**3:30–3:37** — Box P is chosen with probability one third and box Q with two thirds. They give red with two fifths and three quarters.

> Caption: GATE CSE 2005: box P chosen with 1/3, box Q with 2/3; red with 2/5 and 3/4.

**3:37–3:45** — The two paths weigh two fifteenths and one half, so the evidence weighs nineteen thirtieths.

> Caption: The two paths weigh 2/15 and 1/2, so the evidence is 19/30.

**3:45–3:52** — Box P takes two fifteenths of nineteen thirtieths, which is four nineteenths.

> Caption: Box P takes 2/15 of 19/30, which is 4/19.

**3:52–4:00** — Leave box Q out of the denominator and the answer becomes one. The hypotheses have to cover every way the evidence can happen.

> Caption: Drop box Q from the sum and the answer becomes 1. A missing hypothesis inflates everything.

Exam-trap caption mode adds: *The hypotheses must be disjoint and exhaustive. Bayes never requires them to be independent.*

## Scene 9. The five steps, in order

*4:00 – 4:30 · objective: State the procedure that works for every Bayes item in the papers, and the two places a correct-looking answer goes wrong.*

**4:00–4:07** — Step one: name the hypotheses, and check that they are disjoint and cover every case.

> Caption: Step one: name the hypotheses and check that they partition the space.

**4:07–4:15** — Step two: write each prior and the likelihood of the evidence under it, in separate columns.

> Caption: Step two: write each prior and the likelihood of the evidence under it.

**4:15–4:22** — Step three: multiply each pair, add the products, and call the total the evidence.

> Caption: Step three: multiply, add the products, and that sum is the evidence.

**4:22–4:30** — Step four: divide, check the posteriors add to one, and re-read which direction the question asks for.

> Caption: Step four: divide, then check the posteriors add to one and re-read the direction asked.

Exam-trap caption mode adds: *Reading the likelihood as the answer is the commonest lost mark in this topic.*

## Scene 10. Where the rule stops applying

*4:30 – 5:00 · objective: Four limits: evidence that cannot happen, overlapping hypotheses, the same observation entered twice, and the prior as an input the theorem does not supply.*

**4:30–4:37** — If the evidence cannot happen under any hypothesis, the denominator is zero and the posterior does not exist.

> Caption: If the evidence is impossible under every hypothesis, the denominator is zero.

**4:37–4:45** — If two hypotheses can both be true, the same outcome is counted twice and the evidence is too large.

> Caption: If the hypotheses overlap, one outcome is counted twice and the evidence is over-counted.

**4:45–4:52** — Entering one head twice gives one half where the honest answer for one head is one third.

> Caption: If the same observation is entered twice, the belief is too confident: 1/2 instead of 1/3.

Exam-trap caption mode adds: *Two reports of one event are not two events.*

**4:52–5:00** — Bayes is arithmetic on conditional probability. It revises whatever prior you supply, and does not choose it.

> Caption: Bayes is arithmetic on conditional probability. It does not choose the prior.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
