/* ==========================================================================
   mean-median-mode-standard-deviation — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs — never edited by hand.

   Every number quoted in a caption is computed by the model in lesson.js and
   printed on the canvas; the two agree because both read the same computation.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'middles',
      n: 1,
      title: 'Three different middles',
      start: 0, end: 30,
      objective: 'See that mean, median and mode answer three different questions about the same nine numbers, and that all three answers are defensible.'
    },
    {
      id: 'mean',
      n: 2,
      title: 'The mean is a balance point',
      start: 30, end: 60,
      objective: 'Show the deviations cancelling to zero and the mean as the unique minimiser of the sum of squared deviations.'
    },
    {
      id: 'median',
      n: 3,
      title: 'The median is a position',
      start: 60, end: 90,
      objective: 'Sort, take the middle, average the two middles when n is even, and show the median minimising the sum of absolute deviations.'
    },
    {
      id: 'mode',
      n: 4,
      title: 'The mode is a count',
      start: 90, end: 120,
      objective: 'Count frequencies: one mode, two modes, or none — and see why the mode is the only average that works on categories.'
    },
    {
      id: 'grouped',
      n: 5,
      title: 'Grouped data: three interpolation formulas',
      start: 120, end: 150,
      objective: 'Compute mean by midpoints, median by cumulative frequency and mode by the modal class on one frequency table.'
    },
    {
      id: 'spread',
      n: 6,
      title: 'Standard deviation: square, average, root',
      start: 150, end: 180,
      objective: 'Build the variance from the squared deviations, take the root, and see that it is not the mean absolute deviation.'
    },
    {
      id: 'transform',
      n: 7,
      title: 'Shift and scale: GATE CSE 2011',
      start: 180, end: 210,
      objective: 'Apply y = 3x + 100 to the data and watch the three averages move with it while the spread scales by 3 and never by 100.'
    },
    {
      id: 'dists',
      n: 8,
      title: 'The three middles of a distribution',
      start: 210, end: 240,
      objective: 'Read mean, median and mode off the exponential, uniform, normal, Poisson and binomial, and answer the two numerical PYQs.'
    },
    {
      id: 'skew',
      n: 9,
      title: 'Skewness and the empirical relation',
      start: 240, end: 270,
      objective: 'Use mode ≈ 3·median − 2·mean as an approximation, then break the skew ordering rule with a two-peaked list.'
    },
    {
      id: 'rules',
      n: 10,
      title: 'Which average to compute',
      start: 270, end: 300,
      objective: 'Turn the lesson into a decision procedure: what the wording asks for, and the four numbers worth being able to reproduce.'
    }
  ],

  events: [

    /* ---------------- scene 1: three middles ---------------- */
    {
      id: 'mi-1', start: 0, end: 7.5, scene: 'middles',
      visualAction: 'plot-data',
      caption: 'Nine salaries, one question: what does a person here earn? Three different answers, and all three are correct.',
      narration: 'Nine people in a small office, salaries in thousands of rupees. One question: what does a person here earn? Watch the nine values land on a number line, and notice that they are not spread evenly.',
      keyword: 'three different answers',
      detail: 'The data are 22, 25, 25, 28, 30, 30, 30, 32 and 90. The last value is three times the next largest, which is what makes this list worth teaching with.'
    },
    {
      id: 'mi-2', start: 7.5, end: 15, scene: 'middles',
      visualAction: 'mark-mean',
      caption: 'The mean pools everything and shares it out: 312 over 9 gives 34.667.',
      narration: 'The mean pools the money and shares it equally. The total is three hundred and twelve thousand, over nine people, which gives thirty-four point six six seven. Only one person earns more than that.',
      keyword: '34.667',
      detail: 'Sum = 312, n = 9, mean = 312/9 = 34.667. Eight of the nine salaries lie below the mean.',
      trap: 'A mean outside the bulk of the data is normal for a skewed list. It is not an arithmetic mistake.'
    },
    {
      id: 'mi-3', start: 15, end: 22.5, scene: 'middles',
      visualAction: 'mark-median',
      caption: 'The median takes the fifth of nine sorted values: 30.',
      narration: 'The median lines everyone up and takes the person in the middle. Nine values, so the fifth one is the middle, and it is thirty. Half the office earns less, half earns more.',
      keyword: 'the fifth of nine',
      detail: 'Odd n: the median is the ((n+1)/2)-th smallest value, index 5 of 9, which is 30. No arithmetic beyond sorting.'
    },
    {
      id: 'mi-4', start: 22.5, end: 30, scene: 'middles',
      visualAction: 'mark-mode',
      caption: 'The mode counts: 30 occurs three times, so the mode is 30.',
      narration: 'The mode asks which value occurs most often. Thirty appears three times, more than any other, so the mode is thirty as well. Mean thirty-four point six seven, median thirty, mode thirty: three numbers, three questions.',
      keyword: 'occurs three times',
      detail: 'Frequencies: 30 appears 3 times, 25 twice, and 22, 28, 32, 90 once each. The maximum frequency is 3, attained only by 30.',
      trap: 'Here the median and the mode coincide. That is a property of this list, not a rule: the next scene shows a list where they differ.'
    },

    /* ---------------- scene 2: the mean ---------------- */
    {
      id: 'me-1', start: 30, end: 37.5, scene: 'mean',
      visualAction: 'deviations',
      caption: 'Deviations from the mean: five negative, four positive, and they sum to zero.',
      narration: 'Draw the distance from every value to the mean. The small values sit to the left, the single large value sits far to the right. Add the signed distances and the total is zero.',
      keyword: 'sum to zero',
      detail: 'Deviations: -12.667, -9.667, -9.667, -6.667, -4.667, -4.667, -4.667, -2.667, +55.333. Their sum is 0 up to floating-point rounding.'
    },
    {
      id: 'me-2', start: 37.5, end: 45, scene: 'mean',
      visualAction: 'balance',
      caption: 'The mean is the balance point: one value at 90 balances eight small ones.',
      narration: 'That is what the mean is: the point where the list balances, with distances as weights. One salary of ninety, far out on the right, balances eight salaries that are all a little to the left.',
      keyword: 'balance point',
      detail: 'The identity is exact: sum(x_i - xbar) = sum(x_i) - n*xbar = 0 for any list. It is a consequence of the definition, not a property of this data.'
    },
    {
      id: 'me-3', start: 45, end: 52.5, scene: 'mean',
      visualAction: 'sse',
      caption: 'Squared deviations are smallest at the mean: 3526 here, against 3722 at the median.',
      narration: 'Now square every deviation before adding. The total is three thousand five hundred and twenty-six at the mean. Move the reference point to the median and the same total rises to three thousand seven hundred and twenty-two.',
      keyword: '3526 against 3722',
      detail: 'sum (x_i - c)^2 = n*sigma^2 + n*(xbar - c)^2. At c = xbar the second term vanishes, so the mean is the unique minimiser over all real c.'
    },
    {
      id: 'me-4', start: 52.5, end: 60, scene: 'mean',
      visualAction: 'grid-argmin',
      caption: 'Sweeping the reference point across a fine grid finds its minimum at 34.67 — the mean.',
      narration: 'The page does not take that on trust. It sweeps the reference point across a grid of hundredths and reports where the squared total is smallest: thirty-four point six seven. That is the mean, recovered by search.',
      keyword: 'recovered by search',
      detail: 'The model evaluates the squared-deviation sum at every grid point from 0.00 to 99.99 and checks that the minimiser is within 0.01 of the mean.',
      trap: 'Squared deviations, not absolute ones. The next scene shows the absolute sum has a different minimiser.'
    },

    /* ---------------- scene 3: the median ---------------- */
    {
      id: 'md-1', start: 60, end: 67.5, scene: 'median',
      visualAction: 'sort',
      caption: 'Sort first: the median is defined on the ordered list, not the list you were given.',
      narration: 'The median begins with an act of bookkeeping that the mean never needs: sorting. Written in the order the salaries were collected, the middle value means nothing at all.',
      keyword: 'sort first',
      detail: 'This list happens to arrive sorted. Any permutation of it has the same median, because the definition refers to the sorted order.'
    },
    {
      id: 'md-2', start: 67.5, end: 75, scene: 'median',
      visualAction: 'odd-even',
      caption: 'Odd n: the middle value. Even n: the average of the two middle values.',
      narration: 'With an odd count there is a single middle. With an even count there is a pair, and the convention is to average them. On the list zero, one, two, three, six, six that gives two point five, a number the data never take.',
      keyword: 'average the two middle values',
      detail: 'n = 6: indices 3 and 4 of the sorted list are 2 and 3, so the median is 2.5. The convention is universal in textbooks and is what GATE expects.'
    },
    {
      id: 'md-3', start: 75, end: 82.5, scene: 'median',
      visualAction: 'sad',
      caption: 'Absolute deviations are smallest at the median: 82 here, against 110.67 at the mean.',
      narration: 'Switch the penalty from squaring to absolute value. Now the total is eighty-two at the median, and it rises to one hundred and ten point six seven at the mean. The minimiser has moved.',
      keyword: '82 against 110.67',
      detail: 'Moving the reference point right by a small amount changes the absolute sum by (count below) minus (count above); the minimum is where those counts balance, which is the median.'
    },
    {
      id: 'md-4', start: 82.5, end: 90, scene: 'median',
      visualAction: 'median-rule',
      caption: 'So: squared error → mean; absolute error → median. Two penalties, two answers.',
      narration: 'That single contrast explains the whole difference between the two averages. Squared error gives the mean; absolute error gives the median. Neither is more correct: they are answers to different questions about what a mistake costs.',
      keyword: 'two penalties, two answers',
      detail: 'Both facts hold for any finite list of real numbers and require no distributional assumption. They are the reason robust statistics prefers the median.',
      trap: 'For an even-sized list every point between the two middle values ties for the minimum. A question asking for "the" minimiser of absolute deviations then has more than one answer.'
    },

    /* ---------------- scene 4: the mode ---------------- */
    {
      id: 'mo-1', start: 90, end: 97.5, scene: 'mode',
      visualAction: 'counts',
      caption: 'Count how often each value occurs. 30 occurs three times: the highest count wins.',
      narration: 'The mode ignores both the size of the values and their order. It only counts. Thirty appears three times, twenty-five twice, and the rest once each.',
      keyword: 'it only counts',
      detail: 'Frequencies for the salary list: 22:1, 25:2, 28:1, 30:3, 32:1, 90:1. The maximum frequency is 3.'
    },
    {
      id: 'mo-2', start: 97.5, end: 105, scene: 'mode',
      visualAction: 'bimodal',
      caption: 'Two values can tie at the top: 1, 1, 2, 2, 3, 4 is bimodal, with modes 1 and 2.',
      narration: 'A tie at the top is allowed. In the list one, one, two, two, three, four the values one and two both occur twice, so the list is bimodal and any statement of the mode must name both.',
      keyword: 'bimodal',
      detail: 'The page counts this list and confirms that exactly two values attain the maximum frequency.'
    },
    {
      id: 'mo-3', start: 105, end: 112.5, scene: 'mode',
      visualAction: 'no-mode',
      caption: 'And a list where every value occurs once has no mode at all.',
      narration: 'At the other extreme, if every value occurs equally often there is no mode, by the usual convention. One, two, three, four, five has five values at frequency one and no winner.',
      keyword: 'no mode at all',
      detail: 'A uniform continuous distribution is the limiting case: every point in the support attains the same maximum density, so no single number is the mode.'
    },
    {
      id: 'mo-4', start: 112.5, end: 120, scene: 'mode',
      visualAction: 'categorical',
      caption: 'The mode is the only average that works on categories: a blood group has no mean.',
      narration: 'This is why the mode exists. Average a list of blood groups and the question is meaningless, because addition is meaningless for them. Count them instead and the mode is the only one of the three averages that survives.',
      keyword: 'only average that works on categories',
      detail: 'Ordered categories such as shirt sizes S, M, L also admit a median. Unordered ones admit only the mode.'
    },

    /* ---------------- scene 5: grouped data ---------------- */
    {
      id: 'gr-1', start: 120, end: 127.5, scene: 'grouped',
      visualAction: 'table',
      caption: 'Fifty observations in six classes of width 10. The raw values are gone.',
      narration: 'Now the data arrive as a frequency table: fifty observations in six classes of width ten. The individual values are lost, and every formula from here is an estimate.',
      keyword: 'the raw values are gone',
      detail: 'Classes 0-10:4, 10-20:8, 20-30:15, 30-40:12, 40-50:6, 50-60:5. N = 50.'
    },
    {
      id: 'gr-2', start: 127.5, end: 135, scene: 'grouped',
      visualAction: 'gmean',
      caption: 'Mean by midpoints: the weighted sum 1480 over 50 gives 29.6.',
      narration: 'For the mean, treat every observation as sitting at its class midpoint. The weighted sum is one thousand four hundred and eighty, and dividing by fifty gives twenty-nine point six.',
      keyword: '29.6',
      detail: '4(5) + 8(15) + 15(25) + 12(35) + 6(45) + 5(55) = 1480; 1480/50 = 29.6. Exact only if the values really are the midpoints.',
      trap: 'This is an approximation. Two different raw data sets can share this table and have different true means.'
    },
    {
      id: 'gr-3', start: 135, end: 142.5, scene: 'grouped',
      visualAction: 'gmedian',
      caption: 'Median: the first class reaching N/2 = 25 is 20–30, giving 28.667.',
      narration: 'For the median, accumulate the frequencies until you pass twenty-five. The cumulative counts are four, twelve, twenty-seven, so the median class is twenty to thirty, and interpolation puts the median at twenty-eight point six six seven.',
      keyword: '28.667',
      detail: 'L = 20, F = 12, f = 15, h = 10: 20 + (25-12)/15 * 10 = 28.667. The fraction lies between 0 and 1 by the choice of class, so the answer lands inside the class.'
    },
    {
      id: 'gr-4', start: 142.5, end: 150, scene: 'grouped',
      visualAction: 'gmode',
      caption: 'Mode: the modal class 20–30 with neighbours 8 and 12 gives 27.0.',
      narration: 'For the mode, take the class with the largest frequency and pull the estimate towards the larger neighbour. Fifteen with neighbours eight and twelve gives twenty-seven. So mode twenty-seven, median twenty-eight point six six seven, mean twenty-nine point six.',
      keyword: '27.0',
      detail: 'L = 20, f1 = 15, f0 = 8, f2 = 12: 20 + (15-8)/(30-8-12) * 10 = 27.0. Because 12 > 8 the estimate sits above the class midpoint 25.',
      trap: 'The mode formula requires classes of equal width. With unequal widths the largest frequency reflects the widest class, not the densest one.'
    },

    /* ---------------- scene 6: spread ---------------- */
    {
      id: 'sp-1', start: 150, end: 157.5, scene: 'spread',
      visualAction: 'deviations-again',
      caption: 'Spread asks how far the values sit from the mean — and the distances come in two signs.',
      narration: 'The averages say where the middle is. Spread says how wide the list is. Start from the distances to the mean, the same nine deviations as before.',
      keyword: 'how wide the list is',
      detail: 'The deviations sum to zero, so averaging them as they are would report a spread of zero for every list. Something has to remove the signs.'
    },
    {
      id: 'sp-2', start: 157.5, end: 165, scene: 'spread',
      visualAction: 'squares',
      caption: 'Squaring removes the sign. The squared deviations total 3526.',
      narration: 'Squaring removes the sign, at the cost of making the far value dominate. The squares are one hundred and sixty point four, ninety-three point four, and at the far end three thousand and sixty-one. The total is three thousand five hundred and twenty-six.',
      keyword: 'squaring removes the sign',
      detail: 'Squares: 160.44, 93.44, 93.44, 44.44, 21.78, 21.78, 21.78, 7.11, 3061.78. Total 3526.'
    },
    {
      id: 'sp-3', start: 165, end: 172.5, scene: 'spread',
      visualAction: 'variance',
      caption: 'Average the squares: variance 391.778. Take the root: standard deviation 19.793.',
      narration: 'Average the squares by dividing by nine: three hundred and ninety-one point seven seven eight. That is the variance, in squared thousands, which nobody can interpret. Take the square root: nineteen point seven nine three, back in thousands of rupees.',
      keyword: '19.793',
      detail: 'sigma^2 = 3526/9 = 391.778, sigma = 19.7934. The root is what returns the measure to the units of the data.'
    },
    {
      id: 'sp-4', start: 172.5, end: 180, scene: 'spread',
      visualAction: 'mad',
      caption: 'The mean absolute deviation is 12.296 — not the standard deviation, and 38 per cent smaller.',
      narration: 'The alternative is to remove the signs with absolute value instead of squaring, which gives the mean absolute deviation, twelve point two nine six. It is a perfectly good measure and it is not the standard deviation. Dividing by eight instead of nine gives the sample version, twenty point nine nine four.',
      keyword: '12.296 against 19.793',
      detail: 'Mean absolute deviation = 110.667/9 = 12.296. Sample standard deviation = sqrt(3526/8) = 20.994, which is sigma*sqrt(n/(n-1)).',
      trap: 'Dividing by n-1 is not "more correct". It answers a different question: estimating the spread of a population from a sample.'
    },

    /* ---------------- scene 7: shift and scale ---------------- */
    {
      id: 'tr-1', start: 180, end: 187.5, scene: 'transform',
      visualAction: 'shift',
      caption: 'Add 100 to every salary: every average moves by 100, the spread does not move.',
      narration: 'Now transform the data. Add a hundred to every salary. The mean moves to a hundred and thirty-four point six six seven, the median to a hundred and thirty, and the standard deviation stays at nineteen point seven nine three.',
      keyword: 'the spread does not move',
      detail: 'Adding b adds b to the mean, the median and the mode, and leaves every deviation x_i - xbar unchanged, so sigma is unchanged.'
    },
    {
      id: 'tr-2', start: 187.5, end: 195, scene: 'transform',
      visualAction: 'scale',
      caption: 'Now multiply by 3: mean 204, median 190, mode 190, and the spread triples to 59.38.',
      narration: 'Now the full map, three x plus a hundred. The mean is two hundred and four, the median and mode are a hundred and ninety, and the standard deviation is fifty-nine point three eight, exactly three times the original.',
      keyword: 'exactly three times',
      detail: 'Computed on the transformed list: mean 204 = 3(34.667) + 100; sigma 59.380 = 3(19.793); median and mode 190 = 3(30) + 100.'
    },
    {
      id: 'tr-3', start: 195, end: 202.5, scene: 'transform',
      visualAction: 'why',
      caption: 'Because y − mean(y) = a(x − mean(x)): the constant cancels, the factor survives.',
      narration: 'One line explains all of it. The deviation of a transformed value from the transformed mean is a times the original deviation. The added constant cancels; the multiplier does not, and it gets squared inside the variance and then rooted back out.',
      keyword: 'the constant cancels',
      detail: 'Hence sigma_y = |a| sigma_x. The absolute value matters: a negative a reverses the order but cannot make a spread negative.'
    },
    {
      id: 'tr-4', start: 202.5, end: 210, scene: 'transform',
      visualAction: 'gate2011',
      caption: 'GATE CSE 2011 offered sigma_y = a·sigma_x + b as an option. That is the incorrect one.',
      narration: 'This is exactly what GATE asked in twenty eleven. Four statements, one incorrect, and the incorrect one adds the constant to the spread. The other three hold because a positive multiplier preserves order and equality.',
      keyword: 'the incorrect one',
      detail: 'GATE CSE 2011, question 33, two marks, answer D. The paper states that a and b are positive, which is what makes the index-position options true.',
      trap: 'With a negative multiplier the index position of the median moves from k to n+1-k. The paper avoided that case by saying a is positive.'
    },

    /* ---------------- scene 8: distributions ---------------- */
    {
      id: 'di-1', start: 210, end: 217.5, scene: 'dists',
      visualAction: 'exponential',
      caption: 'Exponential with rate 0.5: mean 2, median 1.386, mode 0 — three different numbers.',
      narration: 'For a random variable the same three questions apply to the distribution. Take the exponential with rate one half. Its mean is two, its median is log two over lambda, one point three eight six, and its mode is zero, where the density is highest.',
      keyword: 'mean 2, median 1.386, mode 0',
      detail: 'The page evaluates the CDF at 1.386 and gets exactly 0.5, which is what "median" means for a continuous variable.'
    },
    {
      id: 'di-2', start: 217.5, end: 225, scene: 'dists',
      visualAction: 'uniform-normal',
      caption: 'Uniform: mean and median agree, but no unique mode. Normal: all three equal the mean.',
      narration: 'The uniform distribution has mean and median both at the middle of its interval, but no unique mode: every point has the same density. The normal is the other extreme: mean, median and mode all sit at the same parameter.',
      keyword: 'no unique mode',
      detail: 'For U(a,b) the density is constant on (a,b), so every point of the support maximises it. For N(mu, sigma^2) all three equal mu.'
    },
    {
      id: 'di-3', start: 225, end: 232.5, scene: 'dists',
      visualAction: 'binomial',
      caption: 'Binomial with n = 1000, p = 0.4: mean 400, variance 240, standard deviation 15.49.',
      narration: 'Now the twenty twenty-one coin. A thousand tosses at probability nought point four gives a binomial with mean four hundred and variance n times p times one minus p, which is two hundred and forty. The standard deviation is its root, fifteen point four nine.',
      keyword: '15.49',
      detail: 'GATE CSE 2021 Set 2, question 22, one mark, numerical answer 15.49. The variance is 240, not the answer; the root is.'
    },
    {
      id: 'di-4', start: 232.5, end: 240, scene: 'dists',
      visualAction: 'truncated',
      caption: 'Y = max(X, 0) puts half the mass on zero, so the median is 0 while the mean is not.',
      narration: 'And the twenty seventeen item. Truncate a standard normal at zero and half the probability lands exactly on zero. The definition of a median accepts that, so the median is zero, while the mean of the truncated variable is a small positive number.',
      keyword: 'the median is 0',
      detail: 'P(Y = 0) = 0.5, so P(Y <= 0) = 0.5 and P(Y >= 0) = 1: both conditions of the median definition hold at 0.',
      trap: 'The mean of max(X,0) is sigma/sqrt(2 pi) ~ 0.399 for a standard normal. Answering the mean where the median was asked is the standard error on this item.'
    },

    /* ---------------- scene 9: skewness ---------------- */
    {
      id: 'sk-1', start: 240, end: 247.5, scene: 'skew',
      visualAction: 'shape',
      caption: 'On the frequency table, mode 27.0 < median 28.667 < mean 29.6: the tail is on the right.',
      narration: 'Put the three grouped answers in order and you can read the shape of the data. Mode below median below mean means a long tail on the right, pulling the mean past the other two.',
      keyword: 'the tail is on the right',
      detail: 'The 50-60 class holds 5 observations far from the bulk, which is what supplies the right tail.'
    },
    {
      id: 'sk-2', start: 247.5, end: 255, scene: 'skew',
      visualAction: 'empirical',
      caption: 'The empirical relation mode ≈ 3·median − 2·mean gives 26.8 against the computed 27.0.',
      narration: 'Textbooks offer a shortcut between the three: mode is about three times median minus two times mean. On this table it gives twenty-six point eight against the computed twenty-seven. Close — and an approximation, not a formula.',
      keyword: 'an approximation, not a formula',
      detail: '3(28.667) - 2(29.6) = 26.8, against the modal-class estimate of 27.0: an error of 0.2 here, with no bound in general.'
    },
    {
      id: 'sk-3', start: 255, end: 262.5, scene: 'skew',
      visualAction: 'counterexample',
      caption: 'The list 0, 1, 2, 3, 6, 6 has mean 3.0, median 2.5 and mode 6 — the ordering rule breaks.',
      narration: 'Here is the part most summaries leave out. Take zero, one, two, three, six, six. The mean is three, the median two point five, and the mode six. The mean exceeds the median, which reads as right skew, yet the mode sits far above both.',
      keyword: 'the ordering rule breaks',
      detail: 'Two peaks with a gap between them: the gap supplies the skew, the second peak supplies the mode, and they pull in opposite directions.'
    },
    {
      id: 'sk-4', start: 262.5, end: 270, scene: 'skew',
      visualAction: 'rule-as-check',
      caption: 'So use the ordering to sanity-check an answer, never to derive one.',
      narration: 'The ordering rule describes single-peaked, moderately skewed data. It is a sanity check on an answer you already have, never a derivation. And the empirical relation is a convenience for questions that hand you two of the three.',
      keyword: 'sanity check, never a derivation',
      detail: 'Both statements are empirical descriptions from Karl Pearson onwards; neither is a theorem about arbitrary lists.'
    },

    /* ---------------- scene 10: the rules ---------------- */
    {
      id: 'ru-1', start: 270, end: 277.5, scene: 'rules',
      visualAction: 'triage',
      caption: 'First question: is the wording about mass, position or frequency?',
      narration: 'So the first thing to decide in an exam is not arithmetic. It is which of the three questions the wording is asking: mass, position or frequency. That decision chooses the formula.',
      keyword: 'mass, position or frequency',
      detail: 'Words that signal mass: average, expected, per head. Position: middle, typical, robust to outliers. Frequency: most common, modal.'
    },
    {
      id: 'ru-2', start: 277.5, end: 285, scene: 'rules',
      visualAction: 'list-or-distribution',
      caption: 'Second question: a list or a distribution? A raw table or a grouped one?',
      narration: 'Second, is the object a list or a distribution, and if a list, is it raw or grouped? Raw gives sums and sorts; grouped gives midpoints and cumulative frequencies; a distribution gives parameters.',
      keyword: 'a list or a distribution',
      detail: 'Grouped formulas are estimates under an equal-width assumption. A distribution question needs no data at all.'
    },
    {
      id: 'ru-3', start: 285, end: 292.5, scene: 'rules',
      visualAction: 'four-numbers',
      caption: 'Four numbers from this lesson: mean 34.667, median 30, mode 30, sigma 19.793.',
      narration: 'The four numbers to be able to reproduce from this data set: mean thirty-four point six six seven, median thirty, mode thirty, standard deviation nineteen point seven nine three. If those come out right, the formulas are in place.',
      keyword: '34.667, 30, 30, 19.793',
      detail: 'Sample standard deviation 20.994 and mean absolute deviation 12.296 are the two distractors worth recognising instantly.'
    },
    {
      id: 'ru-4', start: 292.5, end: 300, scene: 'rules',
      visualAction: 'close',
      caption: 'Decide what the question is measuring before you compute anything.',
      narration: 'Everything in this lesson follows from one distinction: the mean measures mass, the median measures position, the mode measures frequency, and the standard deviation measures width. Decide which one is being asked for, and the arithmetic is the easy part.',
      keyword: 'mass, position, frequency, width',
      detail: 'All 64 model checks on this page re-verify the numbers quoted in these captions against their defining properties.',
      trap: 'The two most expensive slips on this topic are not conceptual: dividing by n-1 when the list is the population, and reporting a variance where a standard deviation was asked.'
    }
  ]
};
