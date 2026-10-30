# The Uniform Distribution: Equal Size Means Equal Probability — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/uniform-distribution/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. One word, two shapes

*0:00 – 0:30 · objective: Define the discrete uniform on 1..n and the continuous uniform on [a,b], and say why the same word names two different objects.*

**0:00–0:07** — A fair die is the discrete uniform on one to six. Six outcomes, each with probability one sixth, 0.166667.

> Caption: A fair die is the discrete uniform on 1 to 6: six outcomes, each with probability 1/6 = 0.166667.

**0:07–0:15** — The continuous uniform on two to eight spreads probability evenly along an interval. Its density is the constant one over the width, one sixth.

> Caption: The continuous uniform on [2,8] spreads probability evenly along an interval. Its density is the constant 1/(b-a) = 1/6 = 0.166667.

**0:15–0:22** — Two different objects: mass on six points, against density on every point of an interval. Both are called uniform, and the word alone does not say which.

> Caption: Two different objects: mass on six points, against density on every point of an interval. Both are called uniform, and the word alone does not say which.

Exam-trap caption mode adds: *The word uniform does not tell you discrete or continuous. The object does: a die, a card, a bit string or a permutation is discrete; a point on a line or an interval of time is continuous.*

**0:22–0:30** — The continuous mean is five and its variance is three. The width sets the spread; the location only shifts it.

> Caption: The continuous mean is (a+b)/2 = 5 and its variance is (b-a)^2/12 = 3. The width sets the spread; the location only shifts it.

## Scene 2. The CDF is a ramp, and a probability is a length

*0:30 – 1:00 · objective: Read a probability off the ramp, and separate P(X = c) = 0 for a continuous uniform from P(X = c) = 1/n for the discrete one.*

**0:30–0:37** — The cumulative distribution of the uniform on two to eight is a straight ramp from zero to one. A probability is the rise of the ramp.

> Caption: The CDF of U(2,8) is F(x) = (x-2)/6 between the endpoints: a straight ramp from 0 to 1. A probability is the rise of the ramp.

**0:37–0:45** — The probability of the interval three to five point five is two point five over six, 0.416667. On a uniform an interval probability is its length divided by the total length.

> Caption: P(3 <= X <= 5.5) = (5.5-3)/6 = 0.416667. On a uniform, an interval probability is its length divided by the total length.

**0:45–0:52** — For a continuous uniform the probability of exactly four is zero, because a single point has zero width. The ramp never jumps.

> Caption: For a continuous uniform P(X = 4) = 0 exactly: a single point has zero width, so it carries no probability. The ramp never jumps.

**0:52–1:00** — For the die the probability of exactly four is one sixth, 0.166667. The same word, two different answers.

> Caption: For the die, P(X = 4) = 1/6 = 0.166667. The same word, two different answers to the question "what is the chance of exactly four".

Exam-trap caption mode adds: *Continuous: P(X = c) = 0 and the endpoints of an interval do not matter. Discrete: P(X = c) > 0 and leaving out an endpoint changes the answer.*

## Scene 3. Every uniform is the standard uniform in disguise

*1:00 – 1:30 · objective: Use X = a + (b - a)U to move between [0,1] and [a,b], and see how the two moments transform.*

**1:00–1:07** — Take U uniform on zero to one. Then a plus b minus a times U is uniform on a to b. One multiplication and one shift.

> Caption: Take U uniform on [0,1]. Then a + (b-a)U is uniform on [a,b]. One multiplication and one shift turn the standard uniform into any other.

**1:07–1:15** — With a two and b eight the map is two plus six U. Over two thousand draws the transformed values have mean five and variance three.

> Caption: With a = 2 and b = 8 the map is 2 + 6U. Over 2000 evenly spaced draws the transformed values have mean 5.0000 and variance 3.0000.

**1:15–1:22** — The mean becomes a plus half the width and the variance a twelfth of the width squared. A shift does not change spread; a scale does, and it squares.

> Caption: The moments transform the same way: the mean becomes a + (b-a)/2 and the variance (b-a)^2/12. A shift does not change spread; a scale does, and it squares.

**1:22–1:30** — Run it backwards: X minus a over the width is uniform on zero to one. Every uniform question can be answered there and then scaled.

> Caption: Run it backwards: (X-a)/(b-a) is uniform on [0,1]. Every uniform question can be answered on [0,1] and then scaled.

Exam-trap caption mode adds: *Standardising a uniform is (X-a)/(b-a), not (X-mean)/sigma. The uniform is not a normal, and dividing by the standard deviation does not give a standard uniform.*

## Scene 4. Standardise back: two moments give the two endpoints

*1:30 – 2:00 · objective: Solve mean and variance for a and b, and check the recovered interval against both moments.*

**1:30–1:37** — Two moments determine the two endpoints. Mean ten gives a plus b equals twenty. Variance four thirds gives a width of four.

> Caption: Two moments determine the two endpoints. Mean 10 gives a + b = 20; variance 4/3 gives (b-a)^2 = 12 x 4/3 = 16, so b - a = 4.

**1:37–1:45** — Adding gives two b equals twenty four, so b is twelve and a is eight. Both moments come back as ten and four thirds.

> Caption: Adding gives 2b = 24, so b = 12 and a = 8. The model puts both moments back into the recovered interval and gets 10 and 4/3.

**1:45–1:52** — A second instance: mean three and variance three quarters give a of one point five and b of four point five.

> Caption: A second instance: mean 3 and variance 3/4 give a + b = 6 and b - a = 3, so a = 1.5 and b = 4.5.

**1:52–2:00** — This is the reverse of the usual question, and it appears whenever the endpoints are unknown. Two equations, two unknowns, no guessing.

> Caption: This is the reverse of the usual question, and it is the one that appears when the endpoints are unknown. Two equations, two unknowns, no guessing.

Exam-trap caption mode adds: *The width is sqrt(12 x variance), and only the positive root is a width. A negative width is not an interval, so the negative root is discarded without discussion.*

## Scene 5. Rounding a uniform gives a fair die

*2:00 – 2:30 · objective: Show floor(nU) + 1 making a discrete uniform, and show the same rule failing on a non-uniform input.*

**2:00–2:07** — A random number generator gives a value between zero and one. Floor of six times it, plus one, is uniform on one to six. That is how a computer rolls a fair die.

> Caption: A random number generator gives U on [0,1). The integer floor(6U) + 1 is uniform on 1 to 6: that is how a computer rolls a fair die.

**2:07–2:15** — Over sixty thousand draws the six buckets hold exactly ten thousand each, so every face has probability one sixth.

> Caption: Over 60000 evenly spaced draws the six buckets hold exactly 10000 each, so every face has probability 0.166667.

**2:15–2:22** — Feed the same rule a non-uniform input and fairness dies. With U squared, face one wins in twenty four thousand four hundred and ninety five of sixty thousand draws.

> Caption: Feed the same rule a non-uniform input and fairness dies. With U squared, floor(6U^2) + 1 lands on face 1 in 24495 of 60000 draws: 0.408250 instead of 0.166667.

**2:22–2:30** — That proportion is one over root six: face one wins exactly when U is below that. The transform is only as good as the input.

> Caption: 0.408250 is 1/sqrt(6) = 0.408248: face 1 wins exactly when U is below that. The transform is only as good as the input it is given.

Exam-trap caption mode adds: *floor(6U) + 1 gives 1 to 6, floor(6U) gives 0 to 5, and round(6U) gives 0 to 6 with the two end faces half as likely as the rest.*

## Scene 6. Order statistics: the maximum and the minimum

*2:30 – 3:00 · objective: Derive P(max <= x) = x^n and P(min > x) = (1-x)^n, and quote E[X_(k)] = k/(n+1).*

**2:30–2:37** — Draw n independent uniforms and sort them. The largest is below x exactly when every draw is, so the probability is x to the n.

> Caption: Draw n independent uniforms and sort them. The largest is below x exactly when every draw is, so P(max <= x) = x^n.

**2:37–2:45** — The smallest exceeds x exactly when every draw does, so the probability is one minus x to the n. For three draws the maximum averages three quarters and the minimum one quarter.

> Caption: The smallest exceeds x exactly when every draw does, so P(min > x) = (1-x)^n. For n = 3, E[max] = 3/4 and E[min] = 1/4.

**2:45–2:52** — The k-th smallest has mean k over n plus one. For four draws the four expected positions are 0.2, 0.4, 0.6 and 0.8.

> Caption: The k-th smallest has mean k/(n+1). For n = 4 the four expected positions are 0.2, 0.4, 0.6 and 0.8: the sample spreads itself evenly.

**2:52–3:00** — The page checks these by averaging over a grid of draws as well as by the formulas, and the two routes agree to four decimals.

> Caption: The page checks these by averaging over a grid of draws as well as by the formulas, and the two routes agree to four decimals.

Exam-trap caption mode adds: *The maximum of n uniforms is not the maximum of n numbers you can pick: it is a random variable, and its mean is n/(n+1), strictly below 1 for every finite n.*

## Scene 7. The gaps are all equal, and the stick splits at three quarters

*3:00 – 3:30 · objective: Use the equal-spacing picture to get the order-statistic means, the expected range, and the two different stick answers.*

**3:00–3:07** — Three points cut the unit interval into four gaps. By symmetry every gap has the same expected length, and they sum to one, so each is a quarter.

> Caption: Three points cut the unit interval into four gaps. By symmetry every gap has the same expected length, and the four must sum to 1, so each is 1/4.

**3:07–3:15** — That picture gives the mean minimum, the mean maximum, and the expected range, which is one half for three points, with no calculus.

> Caption: That one picture gives E[min] = 1/(n+1), E[max] = n/(n+1) and the expected range (n-1)/(n+1) = 1/2 for n = 3, with no calculus.

**3:15–3:22** — One cut gives two pieces. The longer piece has expected length three quarters, because it is one minus the shorter piece.

> Caption: One cut, two pieces: the longer piece has expected length 3/4, because the longer piece is 1 minus the shorter.

**3:22–3:30** — The piece containing the point zero point four has expected length zero point seven four. Both quantities are computed here.

> Caption: The piece containing the point 0.4 has expected length 0.74 = 1/2 + p - p^2 at p = 0.4. Both quantities are computed here because a 2025 item uses one of them.

Exam-trap caption mode adds: *The piece containing a fixed point is not the longer piece. At p = 0.4 the expected lengths are 0.74 and 0.75, close enough to lose a mark if the wrong one is quoted.*

## Scene 8. From uniform to anything: the inverse transform

*3:30 – 4:00 · objective: Read the CDF backwards to manufacture the exponential and the square-root density from a uniform draw.*

**3:30–3:37** — The cumulative distribution of any continuous variable is itself uniform on zero to one. Read it backwards and you can manufacture any distribution from a uniform one.

> Caption: The CDF of any continuous variable is itself uniform on [0,1]. Read it backwards and you can manufacture any distribution from a uniform one.

**3:37–3:45** — Set the distribution equal to u and solve. For the exponential with rate two, x is minus the log of one minus u, over two.

> Caption: Set F(x) = u and solve for x. For the exponential with rate 2, F(x) = 1 - e^(-2x), so x = -ln(1-u)/2.

**3:45–3:52** — Over a grid of values, the fraction landing at or below one half is zero point six three two one, which is one minus e to the minus one. The transform lands where the formula says.

> Caption: Over a grid of U values, the fraction with -ln(1-u)/2 at most 0.5 is 0.6321, which is 1 - e^(-1) to four places. The transform lands where the formula says.

**3:52–4:00** — Take the square root instead: X is root U, the probability of being below x is x squared, and the density is two x, which rises.

> Caption: Take the square root instead: X = sqrt(U) has P(X <= x) = x^2, so its density is 2x and rises. Uniform in, anything out.

Exam-trap caption mode adds: *The inverse transform needs an increasing map. For a decreasing map the CDF is one minus the input, and using the formula unchanged gives the wrong distribution.*

## Scene 9. Where uniform is the wrong model

*4:00 – 4:30 · objective: Exhibit the disk counterexample and state the rule that "at random" names the object that is uniform.*

**4:00–4:07** — Pick a point by choosing a radius uniformly and an angle uniformly. The result is not uniform on the disk.

> Caption: Pick a point by choosing a radius uniformly in [0,R] and an angle uniformly. The result is not uniform on the disk.

**4:07–4:15** — The inner half radius circle holds a quarter of the area but half the points. Probability 0.5 against area fraction 0.25.

> Caption: The inner half-radius circle holds a quarter of the area but half the points: probability 0.5 against area fraction 0.25.

**4:15–4:22** — Uniform on a region means equal area gets equal probability. The radius must be drawn with density two r over R squared, because the ring at radius r is longer.

> Caption: Uniform on a region means equal area gets equal probability. The radius must be drawn with density 2r/R^2, not flat, because the ring at radius r is longer.

**4:22–4:30** — Chosen at random is not a distribution until you say what is uniform. A uniform bit string is not a uniform integer.

> Caption: This is the general warning: "chosen at random" is not a distribution until you say what is uniform. A uniform bit string is not a uniform integer.

Exam-trap caption mode adds: *"Uniformly at random" names the object that is uniform: a point, an edge, a permutation, a bit string. Different objects give different answers to the same words.*

## Scene 10. The procedure, and the four traps

*4:30 – 5:00 · objective: Run the four-step procedure on any uniform question and name each trap it avoids.*

**4:30–4:37** — Step one: decide whether the object is discrete or continuous. That decides mass against density, and whether the probability of a single point is zero.

> Caption: Step one: decide whether the object is discrete or continuous. That decides mass against density, and it decides whether P(X = c) is zero.

**4:37–4:45** — Step two: find the two endpoints or the two integers. Step three: convert the question into a length or a count.

> Caption: Step two: find the two endpoints or the two integers. Step three: convert the question into a length or a count.

**4:45–4:52** — Step four: if the question mentions a maximum, a minimum or a gap, use the order statistic formulas rather than integrating.

> Caption: Step four: if the question mentions a maximum, a minimum or a gap, use the order-statistic formulas rather than integrating.

**4:52–5:00** — Four traps: rounding a non-uniform input, forgetting the positive root, confusing the piece containing a point with the longer piece, and assuming at random means uniform on whatever you pictured.

> Caption: Four traps: rounding a non-uniform input, forgetting the positive root, confusing the piece containing a point with the longer piece, and assuming "at random" means uniform on whatever you pictured.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
