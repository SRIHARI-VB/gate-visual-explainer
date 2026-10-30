# The Normal Distribution: Standardise First, Then Read the Tail — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/normal-distribution/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. The bell, and the two numbers that fix it

*0:00 – 0:30 · objective: Read the normal density, name mu and sigma in words, see that the area under it is one at every parameter pair, and read the parameters off a printed density.*

**0:00–0:07** — A density is a curve whose area is probability. The normal is the curve with a square in its exponent.

> Caption: A density is a curve whose area is probability. The normal is the one with a square in the exponent.

**0:07–0:15** — Mu slides the curve sideways and sigma squeezes it, and the area under it stays one at every pair.

> Caption: Mu slides the curve sideways; sigma squeezes it. The area stays one at every pair.

**0:15–0:22** — The peak height is one over sigma root two pi: 0.3989 at sigma one, 0.1330 at sigma three, and 0.0266 at sigma fifteen.

> Caption: The peak is one over sigma root two pi: 0.3989 at sigma 1, 0.1330 at sigma 3, 0.0266 at sigma 15.

**0:22–0:30** — GATE 2026 Set 2 printed a density and asked which family it belongs to. The constant and the eighteen make it normal with mean zero and variance nine.

> Caption: GATE CSE 2026 Set 2 printed a density and asked which family it is: the constant and the 18 make it N(0,9).

Exam-trap caption mode adds: *The word "exp" in exp(-x squared over 18) is the exponential function, not the exponential distribution. A quadratic exponent means normal; a linear one means exponential.*

## Scene 2. Every normal is the same curve

*0:30 – 1:00 · objective: Define z = (x - mu)/sigma, show that P(X <= x) = Phi(z), and read four values of Phi from one standardised picture.*

**0:30–0:37** — Z is x minus mu, divided by sigma: it counts how many standard deviations x sits from the mean.

> Caption: z = (x minus mu) over sigma: how many standard deviations x sits from the mean.

**0:37–0:45** — The probability that X is at most x is Phi of z, so one table serves every normal distribution.

> Caption: P(X at most x) = Phi of z. One table then serves every normal distribution.

**0:45–0:52** — Phi of zero is one half, Phi of one is 0.8413, Phi of two is 0.9772, Phi of three is 0.9987, and Phi of minus one is 0.1587.

> Caption: Phi(0) = 0.5, Phi(1) = 0.8413, Phi(2) = 0.9772, Phi(3) = 0.9987, and Phi(-1) = 0.1587.

**0:52–1:00** — Phi has no closed form. The page integrates the density by two different quadrature rules and the two agree to nine decimal places.

> Caption: Phi has no closed form. The page integrates the density twice, by two different rules, and they agree.

Exam-trap caption mode adds: *A question that needs Phi either supplies a table value or is designed so the arithmetic cancels. If neither happens, you have probably been asked for a symmetry argument, not an area.*

## Scene 3. Reading Phi without sign errors

*1:00 – 1:30 · objective: Use the symmetry Phi(-z) = 1 - Phi(z), build an interval and a two-sided band from it, and invert the table for a percentile.*

**1:00–1:07** — By symmetry, Phi of minus z is one minus Phi of z, and the page checks that at six values of z.

> Caption: Symmetry: Phi(-z) = 1 - Phi(z), and the page checks it at six values of z.

**1:07–1:15** — The area between two points is Phi of the upper minus Phi of the lower, and a two-sided band is two Phi of z minus one.

> Caption: An interval is Phi(b) minus Phi(a); a two-sided band is 2 Phi(z) minus 1.

**1:15–1:22** — Top five per cent means Phi of z is 0.95, which is z equal to 1.6449. Top two and a half per cent is 1.9600.

> Caption: Top 5 per cent means Phi(z) = 0.95, so z = 1.6449. Top 2.5 per cent is z = 1.9600.

**1:22–1:30** — Divide by sigma and never by sigma squared, and take the square root when the question hands you a variance.

> Caption: Divide by sigma, never by sigma squared; and take the square root when a variance is given.

Exam-trap caption mode adds: *Standardise with the standard deviation. A variance in the stem is a step, not a parameter.*

## Scene 4. 68-95-99.7, computed rather than quoted

*1:30 – 2:00 · objective: Integrate the standard normal to get 0.6827, 0.9545 and 0.9973 within one, two and three sigma, and see what lies beyond three and four.*

**1:30–1:37** — Within one sigma lies 0.6827 of the area, within two 0.9545, and within three 0.9973.

> Caption: Within one sigma: 0.6827. Within two: 0.9545. Within three: 0.9973.

**1:37–1:45** — Because the rule is an integration of the standardised curve, it holds for every mu and every sigma without adjustment.

> Caption: The rule is an integration, so it holds for every mu and every sigma without adjustment.

**1:45–1:52** — Beyond three sigma lies 0.0027 of the area, and beyond four sigma about six in a hundred thousand.

> Caption: Beyond three sigma lies 0.0027; beyond four sigma, 6.33 times ten to the minus five.

**1:52–2:00** — A GATE aptitude question gave two equal groups with sigmas twenty-five and five. The narrower range belongs to the smaller sigma, and the median of the other group is its mean, not the midpoint of the two means.

> Caption: GATE 2016 GA: two equal groups, sigma 25 against 5. The narrower range belongs to the smaller sigma.

Exam-trap caption mode adds: *A smaller sigma is a narrower range, not a lower or higher score. And for a normal variable the median is the mean, not the midpoint between two groups.*

## Scene 5. Two curves, one equality

*2:00 – 2:30 · objective: Answer GATE CSE 2008 Q29: equate a left tail of one normal with a right tail of another by standardising both and using symmetry, and recover the unknown sigma.*

**2:00–2:07** — X has mean one and variance four, so sigma is two. Minus one sits one sigma below the mean, and the left tail is Phi of minus one, 0.1587.

> Caption: X is N(1,4). The threshold -1 sits one sigma below the mean, so P(X at most -1) = Phi(-1) = 0.1587.

**2:07–2:15** — Y has mean minus one and unknown sigma, so two sits three over sigma above its mean, and the right tail is one minus Phi of three over sigma.

> Caption: Y is N(-1, sigma squared). The threshold 2 sits 3 over sigma above its mean, so P(Y at least 2) = 1 - Phi(3/sigma).

**2:15–2:22** — A left tail equal to a right tail forces the two z values to be negatives, so three over sigma is one and sigma is three.

> Caption: A left tail equalling a right tail makes the two z values negatives, so 3/sigma = 1 and sigma = 3.

**2:22–2:30** — The two wrong routes are using the variance where a sigma belongs, and dropping the sign that symmetry requires.

> Caption: The two wrong routes: using the variance 4 as a sigma, and matching P(X at most -1) with P(X at least 1).

Exam-trap caption mode adds: *Variance 4 means sigma 2. Write the variance and the standard deviation on separate lines before substituting anything.*

## Scene 6. Sliding and scaling

*2:30 – 3:00 · objective: Apply aX + b to a normal variable, see that the mean shifts by b and the variance scales by a squared, and add two independent normals by numerical convolution.*

**2:30–2:37** — A linear map sends a normal variable to a normal variable: the mean becomes a mu plus b and the variance becomes a squared sigma squared.

> Caption: aX + b is normal with mean a mu + b and variance a squared sigma squared.

**2:37–2:45** — Adding five to every mark moves the mean by five and leaves sigma alone; doubling every mark doubles the mean and doubles sigma.

> Caption: Add 5 to every mark: the mean moves from mu to mu + 5 and sigma does not move at all.

**2:45–2:52** — Two independent normals add to a normal with the means added and the variances added, and the page checks it by convolving the densities.

> Caption: Independent normals add: N(1,4) + N(2,9) is N(3,13), and the convolution agrees to four places.

**2:52–3:00** — Standardising is that same rule with a equal to one over sigma and b equal to minus mu over sigma, which is why z is always standard normal.

> Caption: Standardising is the same rule with a = 1/sigma and b = -mu/sigma, which is why z is always N(0,1).

Exam-trap caption mode adds: *Variances add for independent normals; standard deviations do not. Two normals with sigma 3 and 4 have a sum with variance 25 and sigma 5, not sigma 7.*

## Scene 7. Mean, median, mode, and the median at an atom

*3:00 – 3:30 · objective: State the median definition that survives atoms, apply it to Y = max(X, 0), and answer GATE CSE 2017 Set 1 Q19 for the right reason.*

**3:00–3:07** — For a normal curve the mean, the median and the mode are all mu, because the curve is symmetric about it.

> Caption: For a normal curve the mean, the median and the mode are all mu, because the curve is symmetric.

**3:07–3:15** — A median is a value where at least half the distribution lies below it and at least half lies above it, and that definition survives a jump.

> Caption: A median is any m with P(Y at most m) at least 0.5 and P(Y at least m) at least 0.5.

**3:15–3:22** — Taking the positive part puts half the probability at zero, so the median is zero while the mean is 0.3989 sigma.

> Caption: Y = max(X,0) puts mass 0.5 at zero: P(Y at most 0) = 0.5 and P(Y at least 0) = 1, so the median is 0.

**3:22–3:30** — GATE 2017 Set 1 asked for the median of the positive part and the answer is zero. The reason is the jump at zero, not the symmetry of X.

> Caption: GATE CSE 2017 Set 1 Q19 asks exactly this and wants 0. The reason is the atom, not the symmetry of X.

Exam-trap caption mode adds: *A correct answer reached by a wrong argument is worth nothing in a question that shows its steps. Write P(Y at most 0) and P(Y at least 0) before naming the median.*

## Scene 8. Why the bell turns up everywhere

*3:30 – 4:00 · objective: State the central limit theorem, measure how fast standardised sums of exponentials approach Phi, and separate a conclusion about sums from an assumption about one measurement.*

**3:30–3:37** — The central limit theorem says a standardised sum of independent copies tends to standard normal, whatever the shape of a single copy.

> Caption: The central limit theorem: a standardised sum of independent copies tends to N(0,1), whatever the shape of one copy.

**3:37–3:45** — Measured on sums of exponentials, the largest gap from Phi is 0.1587 for one copy, 0.0945 for two and 0.0596 for five.

> Caption: Measured on sums of exponentials: the largest gap from Phi is 0.1587 at n = 1, 0.0945 at n = 2, 0.0596 at n = 5.

**3:45–3:52** — At ten copies the gap is 0.0421, at thirty 0.0243, and at a hundred 0.0133. It falls slowly and never reaches zero.

> Caption: At n = 10 it is 0.0421, at 30 it is 0.0243, at 100 it is 0.0133. Slow, monotone, and never exactly zero.

**3:52–4:00** — Normality is a conclusion about sums and averages, and an assumption when it is applied to a single measurement.

> Caption: So normality is a conclusion about sums and averages, and an assumption when applied to one measurement.

Exam-trap caption mode adds: *The theorem is about the distribution of the sum, not about the distribution of the data. A skewed population does not become normal; its average does.*

## Scene 9. The binomial, and the half-step

*4:00 – 4:30 · objective: Approximate a binomial by a normal, measure the error with and without the continuity correction, and compute the standard error of a sample mean.*

**4:00–4:07** — A binomial with mean n p and standard deviation root n p q is nearly normal, because it is a sum of independent trials.

> Caption: de Moivre-Laplace: a binomial with mean np and standard deviation root npq is nearly normal.

**4:07–4:15** — With a hundred trials and p one half, the exact probability of at most forty-five is 0.1841, the corrected normal gives 0.1841, and the uncorrected normal gives 0.1587.

> Caption: P(X at most 45) at n = 100, p = 0.5: exact 0.184101, corrected 0.184060, uncorrected 0.158655.

**4:15–4:22** — The correction is the half step: the bar at k covers k minus a half to k plus a half, so the boundary moves by a half.

> Caption: The correction is the half-step: the bar at k covers k minus 0.5 to k plus 0.5, so the edge is k + 0.5.

**4:22–4:30** — The correction buys four decimal places at a hundred trials and about two at twenty-five. The spread of an average is sigma over root n.

> Caption: It buys four decimal places here and about two at n = 25, p = 0.2 — a skew needs the larger n.

Exam-trap caption mode adds: *The standard error of a mean is sigma over root n, not sigma over n. At n = 100 and sigma 10 the answer is 1, not 0.1.*

## Scene 10. Where the bell is not the answer

*4:30 – 5:00 · objective: Exhibit distributions with the same mean and variance and different probabilities, a symmetric bimodal curve, and finish on the four-step procedure.*

**4:30–4:37** — A uniform, a two-point distribution and a normal can share a mean and a variance and still disagree about the probability, 0.5774 against 1 against 0.6827.

> Caption: Same mean, same variance, different probabilities: P(|X| at most 1) is 0.5774, 1 and 0.6827.

**4:37–4:45** — A mixture of two normals is symmetric, has mean and median zero, and two peaks. Symmetry and a bell-like outline are not enough.

> Caption: A mixture of two normals is symmetric with mean and median 0, and has two modes at plus and minus 2.

**4:45–4:52** — A mean of n observations has spread sigma over root n, so a hundred observations with sigma ten give a standard error of one.

> Caption: A mean of n observations has spread sigma over root n: sigma 10 with n = 100 gives a standard error of 1.

**4:52–5:00** — The procedure: standardise, read Phi with the sign the question set, and name the assumption that made the curve normal.

> Caption: The procedure: standardise, read Phi with the sign the question set, then say which assumption you used.

Exam-trap caption mode adds: *Phi is always a left tail. Every right tail and every band is a rearrangement of it, and the sign is decided by the question, not by the table.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
