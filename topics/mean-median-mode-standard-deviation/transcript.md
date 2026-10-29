# Mean, Median, Mode and Standard Deviation: Three Middles, One Spread, and When Each Rule Fails — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/mean-median-mode-standard-deviation/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Three different middles

*0:00 – 0:30 · objective: See that mean, median and mode answer three different questions about the same nine numbers, and that all three answers are defensible.*

**0:00–0:07** — Nine people in a small office, salaries in thousands of rupees. One question: what does a person here earn? Watch the nine values land on a number line, and notice that they are not spread evenly.

> Caption: Nine salaries, one question: what does a person here earn? Three different answers, and all three are correct.

**0:07–0:15** — The mean pools the money and shares it equally. The total is three hundred and twelve thousand, over nine people, which gives thirty-four point six six seven. Only one person earns more than that.

> Caption: The mean pools everything and shares it out: 312 over 9 gives 34.667.

Exam-trap caption mode adds: *A mean outside the bulk of the data is normal for a skewed list. It is not an arithmetic mistake.*

**0:15–0:22** — The median lines everyone up and takes the person in the middle. Nine values, so the fifth one is the middle, and it is thirty. Half the office earns less, half earns more.

> Caption: The median takes the fifth of nine sorted values: 30.

**0:22–0:30** — The mode asks which value occurs most often. Thirty appears three times, more than any other, so the mode is thirty as well. Mean thirty-four point six seven, median thirty, mode thirty: three numbers, three questions.

> Caption: The mode counts: 30 occurs three times, so the mode is 30.

Exam-trap caption mode adds: *Here the median and the mode coincide. That is a property of this list, not a rule: the next scene shows a list where they differ.*

## Scene 2. The mean is a balance point

*0:30 – 1:00 · objective: Show the deviations cancelling to zero and the mean as the unique minimiser of the sum of squared deviations.*

**0:30–0:37** — Draw the distance from every value to the mean. The small values sit to the left, the single large value sits far to the right. Add the signed distances and the total is zero.

> Caption: Deviations from the mean: five negative, four positive, and they sum to zero.

**0:37–0:45** — That is what the mean is: the point where the list balances, with distances as weights. One salary of ninety, far out on the right, balances eight salaries that are all a little to the left.

> Caption: The mean is the balance point: one value at 90 balances eight small ones.

**0:45–0:52** — Now square every deviation before adding. The total is three thousand five hundred and twenty-six at the mean. Move the reference point to the median and the same total rises to three thousand seven hundred and twenty-two.

> Caption: Squared deviations are smallest at the mean: 3526 here, against 3722 at the median.

**0:52–1:00** — The page does not take that on trust. It sweeps the reference point across a grid of hundredths and reports where the squared total is smallest: thirty-four point six seven. That is the mean, recovered by search.

> Caption: Sweeping the reference point across a fine grid finds its minimum at 34.67 — the mean.

Exam-trap caption mode adds: *Squared deviations, not absolute ones. The next scene shows the absolute sum has a different minimiser.*

## Scene 3. The median is a position

*1:00 – 1:30 · objective: Sort, take the middle, average the two middles when n is even, and show the median minimising the sum of absolute deviations.*

**1:00–1:07** — The median begins with an act of bookkeeping that the mean never needs: sorting. Written in the order the salaries were collected, the middle value means nothing at all.

> Caption: Sort first: the median is defined on the ordered list, not the list you were given.

**1:07–1:15** — With an odd count there is a single middle. With an even count there is a pair, and the convention is to average them. On the list zero, one, two, three, six, six that gives two point five, a number the data never take.

> Caption: Odd n: the middle value. Even n: the average of the two middle values.

**1:15–1:22** — Switch the penalty from squaring to absolute value. Now the total is eighty-two at the median, and it rises to one hundred and ten point six seven at the mean. The minimiser has moved.

> Caption: Absolute deviations are smallest at the median: 82 here, against 110.67 at the mean.

**1:22–1:30** — That single contrast explains the whole difference between the two averages. Squared error gives the mean; absolute error gives the median. Neither is more correct: they are answers to different questions about what a mistake costs.

> Caption: So: squared error → mean; absolute error → median. Two penalties, two answers.

Exam-trap caption mode adds: *For an even-sized list every point between the two middle values ties for the minimum. A question asking for "the" minimiser of absolute deviations then has more than one answer.*

## Scene 4. The mode is a count

*1:30 – 2:00 · objective: Count frequencies: one mode, two modes, or none — and see why the mode is the only average that works on categories.*

**1:30–1:37** — The mode ignores both the size of the values and their order. It only counts. Thirty appears three times, twenty-five twice, and the rest once each.

> Caption: Count how often each value occurs. 30 occurs three times: the highest count wins.

**1:37–1:45** — A tie at the top is allowed. In the list one, one, two, two, three, four the values one and two both occur twice, so the list is bimodal and any statement of the mode must name both.

> Caption: Two values can tie at the top: 1, 1, 2, 2, 3, 4 is bimodal, with modes 1 and 2.

**1:45–1:52** — At the other extreme, if every value occurs equally often there is no mode, by the usual convention. One, two, three, four, five has five values at frequency one and no winner.

> Caption: And a list where every value occurs once has no mode at all.

**1:52–2:00** — This is why the mode exists. Average a list of blood groups and the question is meaningless, because addition is meaningless for them. Count them instead and the mode is the only one of the three averages that survives.

> Caption: The mode is the only average that works on categories: a blood group has no mean.

## Scene 5. Grouped data: three interpolation formulas

*2:00 – 2:30 · objective: Compute mean by midpoints, median by cumulative frequency and mode by the modal class on one frequency table.*

**2:00–2:07** — Now the data arrive as a frequency table: fifty observations in six classes of width ten. The individual values are lost, and every formula from here is an estimate.

> Caption: Fifty observations in six classes of width 10. The raw values are gone.

**2:07–2:15** — For the mean, treat every observation as sitting at its class midpoint. The weighted sum is one thousand four hundred and eighty, and dividing by fifty gives twenty-nine point six.

> Caption: Mean by midpoints: the weighted sum 1480 over 50 gives 29.6.

Exam-trap caption mode adds: *This is an approximation. Two different raw data sets can share this table and have different true means.*

**2:15–2:22** — For the median, accumulate the frequencies until you pass twenty-five. The cumulative counts are four, twelve, twenty-seven, so the median class is twenty to thirty, and interpolation puts the median at twenty-eight point six six seven.

> Caption: Median: the first class reaching N/2 = 25 is 20–30, giving 28.667.

**2:22–2:30** — For the mode, take the class with the largest frequency and pull the estimate towards the larger neighbour. Fifteen with neighbours eight and twelve gives twenty-seven. So mode twenty-seven, median twenty-eight point six six seven, mean twenty-nine point six.

> Caption: Mode: the modal class 20–30 with neighbours 8 and 12 gives 27.0.

Exam-trap caption mode adds: *The mode formula requires classes of equal width. With unequal widths the largest frequency reflects the widest class, not the densest one.*

## Scene 6. Standard deviation: square, average, root

*2:30 – 3:00 · objective: Build the variance from the squared deviations, take the root, and see that it is not the mean absolute deviation.*

**2:30–2:37** — The averages say where the middle is. Spread says how wide the list is. Start from the distances to the mean, the same nine deviations as before.

> Caption: Spread asks how far the values sit from the mean — and the distances come in two signs.

**2:37–2:45** — Squaring removes the sign, at the cost of making the far value dominate. The squares are one hundred and sixty point four, ninety-three point four, and at the far end three thousand and sixty-one. The total is three thousand five hundred and twenty-six.

> Caption: Squaring removes the sign. The squared deviations total 3526.

**2:45–2:52** — Average the squares by dividing by nine: three hundred and ninety-one point seven seven eight. That is the variance, in squared thousands, which nobody can interpret. Take the square root: nineteen point seven nine three, back in thousands of rupees.

> Caption: Average the squares: variance 391.778. Take the root: standard deviation 19.793.

**2:52–3:00** — The alternative is to remove the signs with absolute value instead of squaring, which gives the mean absolute deviation, twelve point two nine six. It is a perfectly good measure and it is not the standard deviation. Dividing by eight instead of nine gives the sample version, twenty point nine nine four.

> Caption: The mean absolute deviation is 12.296 — not the standard deviation, and 38 per cent smaller.

Exam-trap caption mode adds: *Dividing by n-1 is not "more correct". It answers a different question: estimating the spread of a population from a sample.*

## Scene 7. Shift and scale: GATE CSE 2011

*3:00 – 3:30 · objective: Apply y = 3x + 100 to the data and watch the three averages move with it while the spread scales by 3 and never by 100.*

**3:00–3:07** — Now transform the data. Add a hundred to every salary. The mean moves to a hundred and thirty-four point six six seven, the median to a hundred and thirty, and the standard deviation stays at nineteen point seven nine three.

> Caption: Add 100 to every salary: every average moves by 100, the spread does not move.

**3:07–3:15** — Now the full map, three x plus a hundred. The mean is two hundred and four, the median and mode are a hundred and ninety, and the standard deviation is fifty-nine point three eight, exactly three times the original.

> Caption: Now multiply by 3: mean 204, median 190, mode 190, and the spread triples to 59.38.

**3:15–3:22** — One line explains all of it. The deviation of a transformed value from the transformed mean is a times the original deviation. The added constant cancels; the multiplier does not, and it gets squared inside the variance and then rooted back out.

> Caption: Because y − mean(y) = a(x − mean(x)): the constant cancels, the factor survives.

**3:22–3:30** — This is exactly what GATE asked in twenty eleven. Four statements, one incorrect, and the incorrect one adds the constant to the spread. The other three hold because a positive multiplier preserves order and equality.

> Caption: GATE CSE 2011 offered sigma_y = a·sigma_x + b as an option. That is the incorrect one.

Exam-trap caption mode adds: *With a negative multiplier the index position of the median moves from k to n+1-k. The paper avoided that case by saying a is positive.*

## Scene 8. The three middles of a distribution

*3:30 – 4:00 · objective: Read mean, median and mode off the exponential, uniform, normal, Poisson and binomial, and answer the two numerical PYQs.*

**3:30–3:37** — For a random variable the same three questions apply to the distribution. Take the exponential with rate one half. Its mean is two, its median is log two over lambda, one point three eight six, and its mode is zero, where the density is highest.

> Caption: Exponential with rate 0.5: mean 2, median 1.386, mode 0 — three different numbers.

**3:37–3:45** — The uniform distribution has mean and median both at the middle of its interval, but no unique mode: every point has the same density. The normal is the other extreme: mean, median and mode all sit at the same parameter.

> Caption: Uniform: mean and median agree, but no unique mode. Normal: all three equal the mean.

**3:45–3:52** — Now the twenty twenty-one coin. A thousand tosses at probability nought point four gives a binomial with mean four hundred and variance n times p times one minus p, which is two hundred and forty. The standard deviation is its root, fifteen point four nine.

> Caption: Binomial with n = 1000, p = 0.4: mean 400, variance 240, standard deviation 15.49.

**3:52–4:00** — And the twenty seventeen item. Truncate a standard normal at zero and half the probability lands exactly on zero. The definition of a median accepts that, so the median is zero, while the mean of the truncated variable is a small positive number.

> Caption: Y = max(X, 0) puts half the mass on zero, so the median is 0 while the mean is not.

Exam-trap caption mode adds: *The mean of max(X,0) is sigma/sqrt(2 pi) ~ 0.399 for a standard normal. Answering the mean where the median was asked is the standard error on this item.*

## Scene 9. Skewness and the empirical relation

*4:00 – 4:30 · objective: Use mode ≈ 3·median − 2·mean as an approximation, then break the skew ordering rule with a two-peaked list.*

**4:00–4:07** — Put the three grouped answers in order and you can read the shape of the data. Mode below median below mean means a long tail on the right, pulling the mean past the other two.

> Caption: On the frequency table, mode 27.0 < median 28.667 < mean 29.6: the tail is on the right.

**4:07–4:15** — Textbooks offer a shortcut between the three: mode is about three times median minus two times mean. On this table it gives twenty-six point eight against the computed twenty-seven. Close — and an approximation, not a formula.

> Caption: The empirical relation mode ≈ 3·median − 2·mean gives 26.8 against the computed 27.0.

**4:15–4:22** — Here is the part most summaries leave out. Take zero, one, two, three, six, six. The mean is three, the median two point five, and the mode six. The mean exceeds the median, which reads as right skew, yet the mode sits far above both.

> Caption: The list 0, 1, 2, 3, 6, 6 has mean 3.0, median 2.5 and mode 6 — the ordering rule breaks.

**4:22–4:30** — The ordering rule describes single-peaked, moderately skewed data. It is a sanity check on an answer you already have, never a derivation. And the empirical relation is a convenience for questions that hand you two of the three.

> Caption: So use the ordering to sanity-check an answer, never to derive one.

## Scene 10. Which average to compute

*4:30 – 5:00 · objective: Turn the lesson into a decision procedure: what the wording asks for, and the four numbers worth being able to reproduce.*

**4:30–4:37** — So the first thing to decide in an exam is not arithmetic. It is which of the three questions the wording is asking: mass, position or frequency. That decision chooses the formula.

> Caption: First question: is the wording about mass, position or frequency?

**4:37–4:45** — Second, is the object a list or a distribution, and if a list, is it raw or grouped? Raw gives sums and sorts; grouped gives midpoints and cumulative frequencies; a distribution gives parameters.

> Caption: Second question: a list or a distribution? A raw table or a grouped one?

**4:45–4:52** — The four numbers to be able to reproduce from this data set: mean thirty-four point six six seven, median thirty, mode thirty, standard deviation nineteen point seven nine three. If those come out right, the formulas are in place.

> Caption: Four numbers from this lesson: mean 34.667, median 30, mode 30, sigma 19.793.

**4:52–5:00** — Everything in this lesson follows from one distinction: the mean measures mass, the median measures position, the mode measures frequency, and the standard deviation measures width. Decide which one is being asked for, and the arithmetic is the easy part.

> Caption: Decide what the question is measuring before you compute anything.

Exam-trap caption mode adds: *The two most expensive slips on this topic are not conceptual: dividing by n-1 when the list is the population, and reporting a variance where a standard deviation was asked.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
