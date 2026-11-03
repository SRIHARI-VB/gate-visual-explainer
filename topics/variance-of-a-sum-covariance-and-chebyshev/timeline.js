/* ==========================================================================
   variance-of-a-sum-covariance-and-chebyshev — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   captions.vtt, captions.srt and transcript.md are derived from this file by
   tools/gen-captions.mjs — never edited by hand.

   Every number quoted in a caption is computed by the model in lesson.js and
   printed on the canvas; the two agree because both read the same computation.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'spread', n: 1,
      title: 'Two distributions, one mean',
      start: 0, end: 30,
      objective: 'See that a mean fixes the centre and says nothing about the spread, and that variance is the average squared distance from the centre.'
    },
    {
      id: 'joint', n: 2,
      title: 'Two variables on one table',
      start: 30, end: 60,
      objective: 'Read a joint distribution, take its two margins, and get the mean and variance of each variable from the same 12 equally likely outcomes.'
    },
    {
      id: 'cov', n: 3,
      title: 'Covariance: the product of the two deviations',
      start: 60, end: 90,
      objective: 'Compute the covariance two ways — the definition and the shortcut — and read its sign as the direction of the joint drift.'
    },
    {
      id: 'sumvar', n: 4,
      title: 'Variance of a sum: three terms, not two',
      start: 90, end: 120,
      objective: 'Add the distribution of the sum out of the joint table, and see the three-term identity hold on that independent computation.'
    },
    {
      id: 'dependent', n: 5,
      title: 'When the third term refuses to vanish',
      start: 120, end: 150,
      objective: 'Take two variables that are the same variable, and watch the naive sum of variances fail by a factor of two.'
    },
    {
      id: 'uncorr', n: 6,
      title: 'Uncorrelated is not independent',
      start: 150, end: 180,
      objective: 'Build a dependent pair with zero covariance, and separate "no linear drift" from "no relationship at all".'
    },
    {
      id: 'many', n: 7,
      title: 'Many variables: the diagonal and the pairs',
      start: 180, end: 210,
      objective: 'Generalise to n variables, count the covariance terms, and see why the sample mean has variance sigma squared over n.'
    },
    {
      id: 'markov', n: 8,
      title: 'Markov: one mean, one bound',
      start: 210, end: 240,
      objective: 'Bound a tail using nothing but the mean, see where the bound is attained, and see where it is vacuous.'
    },
    {
      id: 'cheb', n: 9,
      title: 'Chebyshev: one variance, every distribution',
      start: 240, end: 270,
      objective: 'Bound a two-sided tail using the variance, see the distribution that attains the bound, and measure how loose it is on a bell-shaped one.'
    },
    {
      id: 'use', n: 10,
      title: 'What the bounds buy, and the four-step procedure',
      start: 270, end: 300,
      objective: 'Turn a Chebyshev bound into a sample size, then run the four-step procedure that every variance question in the exam rewards.'
    }
  ],

  events: [
    /* ---------------- scene 1: two distributions, one mean ---------------- */
    {
      id: 'e01', scene: 'spread', start: 0, end: 6.5,
      caption: 'Two distributions can share a mean and differ everywhere else.',
      narration: 'Two distributions can share a mean and differ everywhere else. The mean fixes the centre and says nothing about the spread.',
      detail: 'The mean is the centre of mass. It tells you where the distribution balances, not how far its mass sits from that point. Two very different distributions can balance at the same place.',
      keyword: 'mean'
    },
    {
      id: 'e02', scene: 'spread', start: 6.5, end: 13,
      caption: 'Variance is the average of the squared distance from the mean.',
      narration: 'Variance is the average squared distance from the mean. Square, because the deviations cancel in the mean and we want them to add.',
      detail: 'Var of X is the expected value of the squared deviation: the average of (x minus mu) squared, weighted by probability. Without the square, the positive and negative deviations would cancel to zero.',
      keyword: 'variance'
    },
    {
      id: 'e03', scene: 'spread', start: 13, end: 19.5,
      caption: 'Both bars below have mean 3. One has variance 0, the other 4.',
      narration: 'Both bars on this page have mean three. The narrow one is a constant, so its variance is zero. The wide one is two points far apart, and its variance is four.',
      detail: 'The narrow distribution puts all its mass on 3: every deviation is 0, so the average squared deviation is 0. The wide one puts half its mass on 1 and half on 5: each deviation is 2, squared is 4, and the average of 4 and 4 is 4.',
      keyword: 'variance'
    },
    {
      id: 'e04', scene: 'spread', start: 19.5, end: 25,
      caption: 'The square root is the standard deviation, back in the original units.',
      narration: 'The square root of the variance is the standard deviation. It is back in the units of the data, which is why questions ask for it.',
      detail: 'Variance is in squared units. If X is measured in marks, the variance is in marks squared and the standard deviation is in marks. Report the standard deviation when the question asks about spread in the data units.',
      keyword: 'standard deviation'
    },
    {
      id: 'e05', scene: 'spread', start: 25, end: 30,
      caption: 'And a spread of zero means the variable is constant, with probability 1.',
      narration: 'A variance of zero is not a small spread. It means the variable is a constant, with probability one.',
      detail: 'If the average squared deviation is zero, no deviation can be positive on any outcome of positive probability, so the variable equals its mean almost surely. This is the fact behind "a zero-variance estimator is a constant".',
      keyword: 'zero variance',
      trap: 'A variance of zero means a constant, not "almost certainly near the mean".'
    },

    /* ---------------- scene 2: the joint table ---------------- */
    {
      id: 'e06', scene: 'joint', start: 30, end: 36,
      caption: 'Four balls numbered 1 to 4. Draw two, without replacement.',
      narration: 'Four balls numbered one to four. Draw two without replacement. Let X be the first draw and Y the second.',
      detail: 'The pair (X, Y) is ordered: the first ball is X, the second is Y. Drawing without replacement means the second draw cannot repeat the first, and that single fact is what makes X and Y dependent.',
      keyword: 'joint distribution'
    },
    {
      id: 'e07', scene: 'joint', start: 36, end: 42,
      caption: 'Twelve ordered pairs, each with probability one twelfth.',
      narration: 'There are four times three, that is twelve, ordered pairs. Each has probability one twelfth, and the twelve entries sum to one.',
      detail: 'The joint probability mass function puts a number on every pair. The diagonal is zero because a ball cannot be drawn twice. Off the diagonal every entry is one twelfth, and twelve twelfths make one.',
      keyword: 'joint PMF'
    },
    {
      id: 'e08', scene: 'joint', start: 42, end: 48,
      caption: 'Each margin is uniform on 1 to 4, so the mean is 2.5 either way.',
      narration: 'Add along the rows and down the columns and each variable is uniform on one to four. So both means are two point five.',
      detail: 'The row sums give the distribution of X and the column sums give the distribution of Y. Both are uniform on one to four: mean 2.5, and variance (16 minus 1) over 12, which is 1.25.',
      keyword: 'marginal'
    },
    {
      id: 'e09', scene: 'joint', start: 48, end: 54,
      caption: 'Var of one draw is 1.25: the second moment 7.5 minus 6.25.',
      narration: 'The variance of one draw is seven point five minus six point two five, which is one point two five.',
      detail: 'For a uniform variable on one to four the second moment is (1+4+9+16)/4 = 7.5, and the square of the mean is 6.25, so the variance is 1.25. The same number by the definition: average squared deviation.',
      keyword: 'variance'
    },
    {
      id: 'e10', scene: 'joint', start: 54, end: 60,
      caption: 'One table, two variables, and one number still missing: their drift.',
      narration: 'The table gives both means and both variances. What it has not yet told us is whether the two variables drift together.',
      detail: 'Margins are not enough to rebuild the joint table. Two tables can share both margins and differ in how the mass is paired, which is exactly what covariance measures.',
      keyword: 'dependence'
    },

    /* ---------------- scene 3: covariance ---------------- */
    {
      id: 'e11', scene: 'cov', start: 60, end: 66,
      caption: 'Covariance is the average of the product of the two deviations.',
      narration: 'Covariance is the average of the product of the two deviations from their means. A product, not a square.',
      detail: 'Cov of X and Y is the expected value of (X minus its mean) times (Y minus its mean). When the two deviations usually share a sign the product is positive; when they usually oppose, it is negative.',
      keyword: 'covariance'
    },
    {
      id: 'e12', scene: 'cov', start: 66, end: 72,
      caption: 'Cov of X with itself is the variance. That is the same formula.',
      narration: 'Put X in both slots and the product of two deviations becomes a square, so the covariance of X with itself is the variance of X.',
      detail: 'This is why the variance of a sum will need a covariance term: the diagonal entries of the covariance table are variances, and the off-diagonal entries are the new numbers.',
      keyword: 'covariance'
    },
    {
      id: 'e13', scene: 'cov', start: 72, end: 78,
      caption: 'Shortcut: E of XY minus the product of the means. Here 5.833 minus 6.25.',
      narration: 'There is a shortcut: the mean of the product minus the product of the means. Here that is five point eight three three minus six point two five.',
      detail: 'E of XY is 70/12 = 5.8333, from summing xy over the twelve ordered pairs. The product of the means is 6.25. The difference is minus 5/12, about minus 0.4167.',
      keyword: 'E of XY'
    },
    {
      id: 'e14', scene: 'cov', start: 78, end: 84,
      caption: 'Negative: a big first draw leaves a small second one.',
      narration: 'The sign is negative, and the reason is mechanical: a big first draw removes a big ball, so the second draw tends to be smaller.',
      detail: 'Every ordered pair contributes (x - 2.5)(y - 2.5). Eight of the twelve pairs give a negative product and four give a positive one, and the negative products are larger in total, so the average is negative. The diagonal is empty, so no pair can contribute a large positive product.',
      keyword: 'negative covariance'
    },
    {
      id: 'e15', scene: 'cov', start: 84, end: 90,
      caption: 'Divide by the two standard deviations and you get minus one third.',
      narration: 'Divide the covariance by the two standard deviations and the correlation is minus one third. Correlation is a pure number.',
      detail: 'The correlation coefficient is the covariance over the product of the standard deviations. It lies between minus one and one, and it removes the units, so a covariance and a correlation cannot be compared directly.',
      keyword: 'correlation'
    },

    /* ---------------- scene 4: variance of a sum ---------------- */
    {
      id: 'e16', scene: 'sumvar', start: 90, end: 96,
      caption: 'Add the two draws and the sum has only five possible values.',
      narration: 'Add the two draws. The sum runs from three to seven, and the middle value five is twice as likely as the ends.',
      detail: 'The distribution of the sum is read off the same twelve pairs: two pairs give 3, two give 4, four give 5, two give 6 and two give 7. This is a convolution of the joint distribution with the addition map.',
      keyword: 'distribution of a sum'
    },
    {
      id: 'e17', scene: 'sumvar', start: 96, end: 102,
      caption: 'From that distribution, Var of the sum is 1.667.',
      narration: 'From that distribution alone the variance of the sum is one point six six seven. This number was computed without any formula.',
      detail: 'The second moment of the sum is 320/12 = 26.6667 and the square of its mean of 5 is 25, so the variance is 1.6667. Nothing in this line uses the covariance.',
      keyword: 'variance of a sum'
    },
    {
      id: 'e18', scene: 'sumvar', start: 102, end: 108,
      caption: 'The three-term identity: 1.25 plus 1.25 plus twice minus 0.4167.',
      narration: 'Now the identity: variance of X plus variance of Y plus twice the covariance. One point two five, one point two five, and twice minus zero point four one six seven.',
      detail: 'The three terms are 1.25, 1.25 and minus 0.8333, which total 1.6667. The two computations agree because the identity is a theorem, not a coincidence of this example.',
      keyword: 'three terms'
    },
    {
      id: 'e19', scene: 'sumvar', start: 108, end: 114,
      caption: 'So the naive sum 2.5 is wrong here by 0.833, and it is wrong in sign.',
      narration: 'Adding the two variances gives two point five, which is too big by zero point eight three three. Without replacement the sum is steadier than independence would suggest.',
      detail: 'The covariance is negative, so the third term subtracts. A sum of negatively correlated variables varies less than a sum of independent ones with the same variances.',
      keyword: 'naive sum',
      trap: 'Var of X plus Y equals Var X plus Var Y only when the covariance is zero. It is not the general rule.'
    },
    {
      id: 'e20', scene: 'sumvar', start: 114, end: 120,
      caption: 'The exact count: n sigma squared times (N minus n) over (N minus 1).',
      narration: 'The general exact count for drawing n from N without replacement is n sigma squared times N minus n over N minus one. Here that is 5/3 as well.',
      detail: 'With n = 2, N = 4 and sigma squared = 1.25 the formula gives 2 times 1.25 times 2/3 = 1.6667. Draw all four balls and the factor is zero, because the sum is then always 10.',
      keyword: 'finite population correction'
    },

    /* ---------------- scene 5: dependent ---------------- */
    {
      id: 'e21', scene: 'dependent', start: 120, end: 126,
      caption: 'Now the extreme: let Y be X itself. A fair coin, counted twice.',
      narration: 'Now take the extreme case. Let X be a fair coin and let Y be X itself. Both have variance one quarter.',
      detail: 'Two variables do not have to be different functions. Y equals X is a perfectly legal pair, and the joint table has mass only on the two diagonal cells.',
      keyword: 'dependent'
    },
    {
      id: 'e22', scene: 'dependent', start: 126, end: 132,
      caption: 'Cov is 1/4, so Var of the sum is 1/4 plus 1/4 plus 1/2, which is 1.',
      narration: 'The covariance of X with itself is the variance, one quarter. So the sum has variance one quarter plus one quarter plus one half, which is one.',
      detail: 'The sum is two X, and two X is 0 or 2 with probability one half each, so its variance is 4 times one quarter, which is 1. Both routes agree.',
      keyword: 'covariance term'
    },
    {
      id: 'e23', scene: 'dependent', start: 132, end: 138,
      caption: 'The naive answer, 1/2, is half the truth. Same variable, not two.',
      narration: 'Adding the two variances gives one half, which is half of the truth. The two terms are not independent contributions.',
      detail: 'The error is exactly the covariance term. Whenever the two variables move together, the sum is more variable than the parts suggest, and the covariance adds it back.',
      keyword: 'naive sum',
      trap: 'Two terms that both equal X are not two independent pieces of randomness.'
    },
    {
      id: 'e24', scene: 'dependent', start: 138, end: 144,
      caption: 'Let Y be 1 minus X and the sum is the constant 1: variance 0.',
      narration: 'Now let Y be one minus X. The sum is always one, so its variance is zero, while each part still has variance one quarter.',
      detail: 'The covariance is minus one quarter, and one quarter plus one quarter minus one half is zero. A sum of two genuinely random variables can be a constant.',
      keyword: 'zero variance',
      trap: 'A sum with variance zero is a constant. Two random parts can cancel exactly.'
    },
    {
      id: 'e25', scene: 'dependent', start: 144, end: 150,
      caption: 'And for a difference the covariance is subtracted, not added.',
      narration: 'For a difference, the covariance enters with a minus sign. That is the only change in the identity.',
      detail: 'Var of X minus Y is Var X plus Var Y minus twice the covariance. With Y equal to X the difference is identically zero, and the formula gives one quarter plus one quarter minus one half.',
      keyword: 'difference'
    },

    /* ---------------- scene 6: uncorrelated is not independent ---------------- */
    {
      id: 'e26', scene: 'uncorr', start: 150, end: 156,
      caption: 'X uniform on minus one, zero, one. Y is X squared.',
      narration: 'Now X uniform on minus one, zero and one, and Y equal to X squared. The two are as related as two variables can be.',
      detail: 'Y is a function of X, so knowing X determines Y exactly. This is the strongest possible dependence.',
      keyword: 'dependent'
    },
    {
      id: 'e27', scene: 'uncorr', start: 156, end: 162,
      caption: 'The covariance is zero: the products cancel, three values, signs opposite.',
      narration: 'Yet the covariance is zero. The product of the deviations is positive at one, negative at minus one, and the two cancel exactly.',
      detail: 'The mean of X is 0 and the mean of Y is 2/3. The mean of XY is the mean of X cubed, which is 0. So the shortcut gives 0 minus 0, that is zero.',
      keyword: 'zero covariance'
    },
    {
      id: 'e28', scene: 'uncorr', start: 162, end: 168,
      caption: 'Independent would need P of both to equal the product. It is 1/3 against 2/9.',
      narration: 'Independence would need the probability of both to equal the product of the two probabilities. It is one third against two ninths.',
      detail: 'P of X equals 1 and Y equals 1 is 1/3, since it happens exactly when X is 1. The product of P of X equals 1 and P of Y equals 1 is (1/3)(2/3) = 2/9. The two differ, so the variables are dependent.',
      keyword: 'independence',
      trap: 'Zero covariance forbids only a linear relationship. It does not prove independence.'
    },
    {
      id: 'e29', scene: 'uncorr', start: 168, end: 174,
      caption: 'So the variance still adds: 2/3 plus 2/9 is 8/9, and it is exact.',
      narration: 'Because the covariance is zero the variance of the sum still adds: two thirds plus two ninths is eight ninths, and that is the exact answer.',
      detail: 'The sum takes the value 0 with probability 2/3 and 2 with probability 1/3, so its variance is 8/9 computed directly. Uncorrelated is enough for the variance identity, even when the variables are dependent.',
      keyword: 'uncorrelated'
    },
    {
      id: 'e30', scene: 'uncorr', start: 174, end: 180,
      caption: 'Correlation lies in minus one to one, and one means an exact line.',
      narration: 'The correlation lies between minus one and one. A correlation of exactly one or minus one means the two lie on a line with probability one.',
      detail: 'This is Cauchy-Schwarz applied to the two centred variables: the square of the covariance is at most the product of the two variances. Equality holds exactly when one centred variable is a multiple of the other.',
      keyword: 'Cauchy-Schwarz'
    },

    /* ---------------- scene 7: many variables ---------------- */
    {
      id: 'e31', scene: 'many', start: 180, end: 186,
      caption: 'For n variables, square the sum and count the cross terms.',
      narration: 'For n variables, square the sum and every ordered pair contributes a covariance. The diagonal pairs are the variances.',
      detail: 'The variance of a sum of n variables is the sum of the n variances plus twice the sum of the covariances over unordered pairs. There are n diagonal terms and n(n minus 1)/2 pairs.',
      keyword: 'many variables'
    },
    {
      id: 'e32', scene: 'many', start: 186, end: 192,
      caption: 'Three variables: 3 variances and 3 pairs, so 6 terms.',
      narration: 'With three variables there are three variances and three pairs, so six terms, and the pairs are counted twice.',
      detail: 'The count matters in the exam: a question that asks how many covariance terms appear in the variance of a sum of n variables is asking for n(n minus 1)/2 unordered pairs, or n(n minus 1) ordered ones.',
      keyword: 'count of terms'
    },
    {
      id: 'e33', scene: 'many', start: 192, end: 198,
      caption: 'Identical and independent: n sigma squared. The mean of n has sigma squared over n.',
      narration: 'If the variables are identical and independent, the variance of the sum is n sigma squared, and the mean of n of them has variance sigma squared over n.',
      detail: 'Dividing the sum by n divides the variance by n squared, and n sigma squared over n squared is sigma squared over n. That is why averaging reduces spread, and why the standard error falls as the square root of n.',
      keyword: 'sample mean'
    },
    {
      id: 'e34', scene: 'many', start: 198, end: 204,
      caption: 'Perfectly correlated: n squared sigma squared. Spread grows like n, not root n.',
      narration: 'If the four copies are perfectly correlated, the variance of the sum is sixteen times sigma squared, not four times. Averaging then buys nothing at all.',
      detail: 'With covariance equal to the variance, the sum has variance n sigma squared plus n(n minus 1) sigma squared, which is n squared sigma squared. The standard deviation grows linearly in n, and the mean of n copies has the same variance as one copy.',
      keyword: 'perfect correlation',
      trap: 'The square-root-n law needs independence, or at least zero covariance. Correlated copies break it.'
    },
    {
      id: 'e35', scene: 'many', start: 204, end: 210,
      caption: 'Pairwise zero covariance is enough, even without independence.',
      narration: 'Zero covariance for every pair is enough for the identity, even when the variables are not independent as a group.',
      detail: 'Take two fair bits and let the third be their exclusive or. Every pair is independent, all three covariances are zero, and the variance of the sum is three quarters, computed directly. But the three are not mutually independent.',
      keyword: 'pairwise independence'
    },

    /* ---------------- scene 8: Markov ---------------- */
    {
      id: 'e36', scene: 'markov', start: 210, end: 216,
      caption: 'Markov needs one thing: a non-negative variable with a finite mean.',
      narration: 'Markov needs one thing from the distribution: the variable is non-negative and its mean is finite. Nothing else.',
      detail: 'The bound is that the probability of being at least a is at most the mean over a. It holds for every non-negative variable, discrete or continuous, whatever its shape.',
      keyword: "Markov's inequality"
    },
    {
      id: 'e37', scene: 'markov', start: 216, end: 222,
      caption: 'Why: the part above a already carries a times its probability.',
      narration: 'The proof is one line. The part of the mean coming from values at least a is already at least a times the probability of that region.',
      detail: 'The mean is at least the contribution of the upper region, which is at least a times the probability of that region, because every value there is at least a. Divide by a and the bound follows.',
      keyword: 'proof'
    },
    {
      id: 'e38', scene: 'markov', start: 222, end: 228,
      caption: 'Here the mean is 1. At a equals 10 the bound 0.1 is attained exactly.',
      narration: 'This variable is zero nine times in ten and ten the other time, so its mean is one. At a equals ten the bound is zero point one, and the true probability is exactly that.',
      detail: 'A two-point distribution on 0 and a with probability p at a has mean pa, and the bound is p exactly. So no smaller bound can hold for all non-negative variables: the inequality is tight.',
      keyword: 'tight'
    },
    {
      id: 'e39', scene: 'markov', start: 228, end: 234,
      caption: 'At a equals 5 it gives 0.2 where the truth is 0.1. It is a bound, not an estimate.',
      narration: 'At a equals five the bound says at most zero point two while the truth is zero point one. It is an upper bound, and it can be loose.',
      detail: 'Markov uses only the mean, so it cannot see the shape. A distribution that concentrates its mass just below a is invisible to it.',
      keyword: 'loose bound'
    },
    {
      id: 'e40', scene: 'markov', start: 234, end: 240,
      caption: 'At a equals 0.5 the bound is 2, which says nothing at all.',
      narration: 'At a equals zero point five the bound is two. A probability of at most two is no information.',
      detail: 'A bound above one is vacuous. Any probability satisfies it, so the inequality has bought nothing, and the question that quotes it is asking whether you noticed.',
      keyword: 'vacuous',
      trap: 'A quoted bound above 1 is not a strong result; it is no result.'
    },

    /* ---------------- scene 9: Chebyshev ---------------- */
    {
      id: 'e41', scene: 'cheb', start: 240, end: 246,
      caption: 'Chebyshev applies Markov to the squared deviation. The result is 1 over k squared.',
      narration: 'Chebyshev applies Markov to the squared deviation, which is non-negative. The probability of being k standard deviations away is at most one over k squared.',
      detail: 'The squared deviation is non-negative and its mean is the variance. Markov at a equals k squared times the variance gives one over k squared, for any k greater than zero.',
      keyword: "Chebyshev's inequality"
    },
    {
      id: 'e42', scene: 'cheb', start: 246, end: 252,
      caption: 'k equals 2 gives a quarter, k equals 3 gives 1/9, k equals 4 gives 1/16.',
      narration: 'Two standard deviations gives at most a quarter. Three gives one ninth. Four gives one sixteenth.',
      detail: 'These are the three numbers worth remembering, because they are distribution-free: the same quarter holds for every variable with a finite variance, whatever its shape.',
      keyword: 'the numbers'
    },
    {
      id: 'e43', scene: 'cheb', start: 252, end: 258,
      caption: 'A distribution attains it: mass 1 over 2k squared at plus and minus k.',
      narration: 'The bound is attained. Put mass one over two k squared at plus k and the same at minus k, and the rest at zero. Then the variance is one and the tail is exactly one over k squared.',
      detail: 'With mass 1/(2k squared) at each of plus and minus k, the mean is 0 and the variance is k squared times 1/k squared, which is 1. The probability outside the band is 1/k squared, so the bound cannot be improved.',
      keyword: 'tight'
    },
    {
      id: 'e44', scene: 'cheb', start: 258, end: 264,
      caption: 'On six-sided die rolls it says at most 0.25 where the truth is 0.',
      narration: 'On a fair die the bound says at most a quarter while the truth is zero, because no outcome is two standard deviations away. On ten coin flips it says a quarter where the truth is about 0.021.',
      detail: 'A die has a maximum deviation of 2.5 and a standard deviation of about 1.708, so two standard deviations is more than any outcome can reach. The bound is valid and useless on a bounded distribution.',
      keyword: 'looseness'
    },
    {
      id: 'e45', scene: 'cheb', start: 264, end: 270,
      caption: 'And for k below 1 the bound exceeds 1: it needs finite variance, and k at least 1.',
      narration: 'For k below one the bound exceeds one, so it says nothing. And the theorem needs a finite variance, which a heavy-tailed variable may not have.',
      detail: 'The inequality is stated for k greater than zero, but only k at least one can be informative. It also assumes the variance exists, which is a real assumption and not a formality.',
      keyword: 'conditions',
      trap: 'Chebyshev says nothing about a distribution whose variance does not exist.'
    },

    /* ---------------- scene 10: what the bounds buy ---------------- */
    {
      id: 'e46', scene: 'use', start: 270, end: 276,
      caption: 'Averaging n draws divides the variance by n. That turns into a sample size.',
      narration: 'Averaging n independent draws divides the variance by n, so a Chebyshev bound on the average turns into a required number of draws.',
      detail: 'The variance of the average is sigma squared over n, so the probability that the average is more than epsilon from the mean is at most sigma squared over n epsilon squared. Set that at most delta and solve for n.',
      keyword: 'sample size'
    },
    {
      id: 'e47', scene: 'use', start: 276, end: 282,
      caption: 'Sigma 2, epsilon 0.5, delta 0.05 needs 320 draws. A normal bound needs 62.',
      narration: 'With a standard deviation of two, an error of half a unit and a failure probability of five percent, the formula asks for three hundred and twenty draws.',
      detail: 'The formula gives 4 over 0.25 times 0.05, which is 320. A normal quantile would ask for about 62, so Chebyshev costs roughly five times the samples for the same guarantee, and in exchange it assumes nothing about the shape.',
      keyword: 'sample size'
    },
    {
      id: 'e48', scene: 'use', start: 282, end: 288,
      caption: 'Four steps: identify, check zero covariance, use the identity, keep the units.',
      narration: 'The procedure has four steps. Identify what is being asked. Check whether a covariance term is needed. Apply the identity. And keep the units straight.',
      detail: 'Step one separates the variance of a variable from the variance of a sum. Step two asks whether the variables are independent or merely uncorrelated. Step three writes the three terms. Step four remembers that a squared scaling applies to the variance and an absolute one to the standard deviation.',
      keyword: 'procedure'
    },
    {
      id: 'e49', scene: 'use', start: 288, end: 294,
      caption: 'Var of 2X is 4 Var X. Var of X plus a constant is Var X.',
      narration: 'A scale factor is squared in the variance and a shift changes nothing: the variance of two X is four times the variance of X, and adding a constant leaves it alone.',
      detail: 'Var of aX plus b is a squared times Var X. This is why a linear rescaling multiplies the standard deviation by the absolute value of a, and why the correlation coefficient, which divides by both standard deviations, is invariant under such a rescaling.',
      keyword: 'scaling',
      trap: 'A scale factor is squared in the variance and not squared in the standard deviation.'
    },
    {
      id: 'e50', scene: 'use', start: 294, end: 300,
      caption: 'Every number on this page is computed, and the checks are printed beside it.',
      narration: 'Every number on this page is computed from the tables, and each identity is re-checked against an independent enumeration. The count is printed beside the animation.',
      detail: 'The joint tables, the distributions of sums, the covariance identities, the two tight families and the sample-size formula are all produced by the model in the page, and the model reports its own failures rather than hiding them.',
      keyword: 'checked'
    }
  ]
};
