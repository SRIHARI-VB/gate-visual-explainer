# Variance Of A Sum Covariance And Chebyshev — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/variance-of-a-sum-covariance-and-chebyshev/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 50 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Two distributions, one mean

*0:00 – 0:30 · objective: See that a mean fixes the centre and says nothing about the spread, and that variance is the average squared distance from the centre.*

**0:00–0:06** — Two distributions can share a mean and differ everywhere else. The mean fixes the centre and says nothing about the spread.

> Caption: Two distributions can share a mean and differ everywhere else.

**0:06–0:13** — Variance is the average squared distance from the mean. Square, because the deviations cancel in the mean and we want them to add.

> Caption: Variance is the average of the squared distance from the mean.

**0:13–0:19** — Both bars on this page have mean three. The narrow one is a constant, so its variance is zero. The wide one is two points far apart, and its variance is four.

> Caption: Both bars below have mean 3. One has variance 0, the other 4.

**0:19–0:25** — The square root of the variance is the standard deviation. It is back in the units of the data, which is why questions ask for it.

> Caption: The square root is the standard deviation, back in the original units.

**0:25–0:30** — A variance of zero is not a small spread. It means the variable is a constant, with probability one.

> Caption: And a spread of zero means the variable is constant, with probability 1.

Exam-trap caption mode adds: *A variance of zero means a constant, not "almost certainly near the mean".*

## Scene 2. Two variables on one table

*0:30 – 1:00 · objective: Read a joint distribution, take its two margins, and get the mean and variance of each variable from the same 12 equally likely outcomes.*

**0:30–0:36** — Four balls numbered one to four. Draw two without replacement. Let X be the first draw and Y the second.

> Caption: Four balls numbered 1 to 4. Draw two, without replacement.

**0:36–0:42** — There are four times three, that is twelve, ordered pairs. Each has probability one twelfth, and the twelve entries sum to one.

> Caption: Twelve ordered pairs, each with probability one twelfth.

**0:42–0:48** — Add along the rows and down the columns and each variable is uniform on one to four. So both means are two point five.

> Caption: Each margin is uniform on 1 to 4, so the mean is 2.5 either way.

**0:48–0:54** — The variance of one draw is seven point five minus six point two five, which is one point two five.

> Caption: Var of one draw is 1.25: the second moment 7.5 minus 6.25.

**0:54–1:00** — The table gives both means and both variances. What it has not yet told us is whether the two variables drift together.

> Caption: One table, two variables, and one number still missing: their drift.

## Scene 3. Covariance: the product of the two deviations

*1:00 – 1:30 · objective: Compute the covariance two ways — the definition and the shortcut — and read its sign as the direction of the joint drift.*

**1:00–1:06** — Covariance is the average of the product of the two deviations from their means. A product, not a square.

> Caption: Covariance is the average of the product of the two deviations.

**1:06–1:12** — Put X in both slots and the product of two deviations becomes a square, so the covariance of X with itself is the variance of X.

> Caption: Cov of X with itself is the variance. That is the same formula.

**1:12–1:18** — There is a shortcut: the mean of the product minus the product of the means. Here that is five point eight three three minus six point two five.

> Caption: Shortcut: E of XY minus the product of the means. Here 5.833 minus 6.25.

**1:18–1:24** — The sign is negative, and the reason is mechanical: a big first draw removes a big ball, so the second draw tends to be smaller.

> Caption: Negative: a big first draw leaves a small second one.

**1:24–1:30** — Divide the covariance by the two standard deviations and the correlation is minus one third. Correlation is a pure number.

> Caption: Divide by the two standard deviations and you get minus one third.

## Scene 4. Variance of a sum: three terms, not two

*1:30 – 2:00 · objective: Add the distribution of the sum out of the joint table, and see the three-term identity hold on that independent computation.*

**1:30–1:36** — Add the two draws. The sum runs from three to seven, and the middle value five is twice as likely as the ends.

> Caption: Add the two draws and the sum has only five possible values.

**1:36–1:42** — From that distribution alone the variance of the sum is one point six six seven. This number was computed without any formula.

> Caption: From that distribution, Var of the sum is 1.667.

**1:42–1:48** — Now the identity: variance of X plus variance of Y plus twice the covariance. One point two five, one point two five, and twice minus zero point four one six seven.

> Caption: The three-term identity: 1.25 plus 1.25 plus twice minus 0.4167.

**1:48–1:54** — Adding the two variances gives two point five, which is too big by zero point eight three three. Without replacement the sum is steadier than independence would suggest.

> Caption: So the naive sum 2.5 is wrong here by 0.833, and it is wrong in sign.

Exam-trap caption mode adds: *Var of X plus Y equals Var X plus Var Y only when the covariance is zero. It is not the general rule.*

**1:54–2:00** — The general exact count for drawing n from N without replacement is n sigma squared times N minus n over N minus one. Here that is 5/3 as well.

> Caption: The exact count: n sigma squared times (N minus n) over (N minus 1).

## Scene 5. When the third term refuses to vanish

*2:00 – 2:30 · objective: Take two variables that are the same variable, and watch the naive sum of variances fail by a factor of two.*

**2:00–2:06** — Now take the extreme case. Let X be a fair coin and let Y be X itself. Both have variance one quarter.

> Caption: Now the extreme: let Y be X itself. A fair coin, counted twice.

**2:06–2:12** — The covariance of X with itself is the variance, one quarter. So the sum has variance one quarter plus one quarter plus one half, which is one.

> Caption: Cov is 1/4, so Var of the sum is 1/4 plus 1/4 plus 1/2, which is 1.

**2:12–2:18** — Adding the two variances gives one half, which is half of the truth. The two terms are not independent contributions.

> Caption: The naive answer, 1/2, is half the truth. Same variable, not two.

Exam-trap caption mode adds: *Two terms that both equal X are not two independent pieces of randomness.*

**2:18–2:24** — Now let Y be one minus X. The sum is always one, so its variance is zero, while each part still has variance one quarter.

> Caption: Let Y be 1 minus X and the sum is the constant 1: variance 0.

Exam-trap caption mode adds: *A sum with variance zero is a constant. Two random parts can cancel exactly.*

**2:24–2:30** — For a difference, the covariance enters with a minus sign. That is the only change in the identity.

> Caption: And for a difference the covariance is subtracted, not added.

## Scene 6. Uncorrelated is not independent

*2:30 – 3:00 · objective: Build a dependent pair with zero covariance, and separate "no linear drift" from "no relationship at all".*

**2:30–2:36** — Now X uniform on minus one, zero and one, and Y equal to X squared. The two are as related as two variables can be.

> Caption: X uniform on minus one, zero, one. Y is X squared.

**2:36–2:42** — Yet the covariance is zero. The product of the deviations is positive at one, negative at minus one, and the two cancel exactly.

> Caption: The covariance is zero: the products cancel, three values, signs opposite.

**2:42–2:48** — Independence would need the probability of both to equal the product of the two probabilities. It is one third against two ninths.

> Caption: Independent would need P of both to equal the product. It is 1/3 against 2/9.

Exam-trap caption mode adds: *Zero covariance forbids only a linear relationship. It does not prove independence.*

**2:48–2:54** — Because the covariance is zero the variance of the sum still adds: two thirds plus two ninths is eight ninths, and that is the exact answer.

> Caption: So the variance still adds: 2/3 plus 2/9 is 8/9, and it is exact.

**2:54–3:00** — The correlation lies between minus one and one. A correlation of exactly one or minus one means the two lie on a line with probability one.

> Caption: Correlation lies in minus one to one, and one means an exact line.

## Scene 7. Many variables: the diagonal and the pairs

*3:00 – 3:30 · objective: Generalise to n variables, count the covariance terms, and see why the sample mean has variance sigma squared over n.*

**3:00–3:06** — For n variables, square the sum and every ordered pair contributes a covariance. The diagonal pairs are the variances.

> Caption: For n variables, square the sum and count the cross terms.

**3:06–3:12** — With three variables there are three variances and three pairs, so six terms, and the pairs are counted twice.

> Caption: Three variables: 3 variances and 3 pairs, so 6 terms.

**3:12–3:18** — If the variables are identical and independent, the variance of the sum is n sigma squared, and the mean of n of them has variance sigma squared over n.

> Caption: Identical and independent: n sigma squared. The mean of n has sigma squared over n.

**3:18–3:24** — If the four copies are perfectly correlated, the variance of the sum is sixteen times sigma squared, not four times. Averaging then buys nothing at all.

> Caption: Perfectly correlated: n squared sigma squared. Spread grows like n, not root n.

Exam-trap caption mode adds: *The square-root-n law needs independence, or at least zero covariance. Correlated copies break it.*

**3:24–3:30** — Zero covariance for every pair is enough for the identity, even when the variables are not independent as a group.

> Caption: Pairwise zero covariance is enough, even without independence.

## Scene 8. Markov: one mean, one bound

*3:30 – 4:00 · objective: Bound a tail using nothing but the mean, see where the bound is attained, and see where it is vacuous.*

**3:30–3:36** — Markov needs one thing from the distribution: the variable is non-negative and its mean is finite. Nothing else.

> Caption: Markov needs one thing: a non-negative variable with a finite mean.

**3:36–3:42** — The proof is one line. The part of the mean coming from values at least a is already at least a times the probability of that region.

> Caption: Why: the part above a already carries a times its probability.

**3:42–3:48** — This variable is zero nine times in ten and ten the other time, so its mean is one. At a equals ten the bound is zero point one, and the true probability is exactly that.

> Caption: Here the mean is 1. At a equals 10 the bound 0.1 is attained exactly.

**3:48–3:54** — At a equals five the bound says at most zero point two while the truth is zero point one. It is an upper bound, and it can be loose.

> Caption: At a equals 5 it gives 0.2 where the truth is 0.1. It is a bound, not an estimate.

**3:54–4:00** — At a equals zero point five the bound is two. A probability of at most two is no information.

> Caption: At a equals 0.5 the bound is 2, which says nothing at all.

Exam-trap caption mode adds: *A quoted bound above 1 is not a strong result; it is no result.*

## Scene 9. Chebyshev: one variance, every distribution

*4:00 – 4:30 · objective: Bound a two-sided tail using the variance, see the distribution that attains the bound, and measure how loose it is on a bell-shaped one.*

**4:00–4:06** — Chebyshev applies Markov to the squared deviation, which is non-negative. The probability of being k standard deviations away is at most one over k squared.

> Caption: Chebyshev applies Markov to the squared deviation. The result is 1 over k squared.

**4:06–4:12** — Two standard deviations gives at most a quarter. Three gives one ninth. Four gives one sixteenth.

> Caption: k equals 2 gives a quarter, k equals 3 gives 1/9, k equals 4 gives 1/16.

**4:12–4:18** — The bound is attained. Put mass one over two k squared at plus k and the same at minus k, and the rest at zero. Then the variance is one and the tail is exactly one over k squared.

> Caption: A distribution attains it: mass 1 over 2k squared at plus and minus k.

**4:18–4:24** — On a fair die the bound says at most a quarter while the truth is zero, because no outcome is two standard deviations away. On ten coin flips it says a quarter where the truth is about 0.021.

> Caption: On six-sided die rolls it says at most 0.25 where the truth is 0.

**4:24–4:30** — For k below one the bound exceeds one, so it says nothing. And the theorem needs a finite variance, which a heavy-tailed variable may not have.

> Caption: And for k below 1 the bound exceeds 1: it needs finite variance, and k at least 1.

Exam-trap caption mode adds: *Chebyshev says nothing about a distribution whose variance does not exist.*

## Scene 10. What the bounds buy, and the four-step procedure

*4:30 – 5:00 · objective: Turn a Chebyshev bound into a sample size, then run the four-step procedure that every variance question in the exam rewards.*

**4:30–4:36** — Averaging n independent draws divides the variance by n, so a Chebyshev bound on the average turns into a required number of draws.

> Caption: Averaging n draws divides the variance by n. That turns into a sample size.

**4:36–4:42** — With a standard deviation of two, an error of half a unit and a failure probability of five percent, the formula asks for three hundred and twenty draws.

> Caption: Sigma 2, epsilon 0.5, delta 0.05 needs 320 draws. A normal bound needs 62.

**4:42–4:48** — The procedure has four steps. Identify what is being asked. Check whether a covariance term is needed. Apply the identity. And keep the units straight.

> Caption: Four steps: identify, check zero covariance, use the identity, keep the units.

**4:48–4:54** — A scale factor is squared in the variance and a shift changes nothing: the variance of two X is four times the variance of X, and adding a constant leaves it alone.

> Caption: Var of 2X is 4 Var X. Var of X plus a constant is Var X.

Exam-trap caption mode adds: *A scale factor is squared in the variance and not squared in the standard deviation.*

**4:54–5:00** — Every number on this page is computed from the tables, and each identity is re-checked against an independent enumeration. The count is printed beside the animation.

> Caption: Every number on this page is computed, and the checks are printed beside it.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
