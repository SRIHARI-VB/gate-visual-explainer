/* ==========================================================================
   probability-and-random-variables — THE timeline.
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
      id: 'samplespace',
      n: 1,
      title: 'Outcomes, events and the three axioms',
      start: 0, end: 30,
      objective: 'Read a probability as a count of equally likely outcomes, and state the three axioms that every probability obeys.'
    },
    {
      id: 'conditional',
      n: 2,
      title: 'Conditioning shrinks the sample space',
      start: 30, end: 60,
      objective: 'Compute a conditional probability by restricting to the conditioning event, and separate independence from mutual exclusivity.'
    },
    {
      id: 'bayes',
      n: 3,
      title: "Bayes' theorem: from evidence back to cause",
      start: 60, end: 90,
      objective: "Apply Bayes' theorem with a two-part partition, and see that a posterior can sit below the prior."
    },
    {
      id: 'rv',
      n: 4,
      title: 'Random variables, PMF, CDF and density',
      start: 90, end: 120,
      objective: 'Treat a random variable as a function on outcomes, and read the same distribution from its PMF or density and from its CDF.'
    },
    {
      id: 'expect',
      n: 5,
      title: 'Expectation as a balance point',
      start: 120, end: 150,
      objective: 'Compute an expectation as a weighted sum, and use linearity of expectation with its exact assumption.'
    },
    {
      id: 'spread',
      n: 6,
      title: 'Variance, standard deviation, and the three averages',
      start: 150, end: 180,
      objective: 'Compute a variance from E[X squared] minus the square of E[X], and tell mean, median and mode apart on skewed data.'
    },
    {
      id: 'binomial',
      n: 7,
      title: 'Bernoulli trials and the binomial distribution',
      start: 180, end: 210,
      objective: 'Read a binomial PMF, and get its mean and variance from n and p without summing anything.'
    },
    {
      id: 'poisson',
      n: 8,
      title: 'The Poisson distribution and the binomial limit',
      start: 210, end: 240,
      objective: 'Use the Poisson PMF with mean equal to variance, and justify the approximation by the size of the gap.'
    },
    {
      id: 'exponential',
      n: 9,
      title: 'The exponential distribution and memorylessness',
      start: 240, end: 270,
      objective: 'Compute tail probabilities from the density, and use memorylessness with the condition that makes it true.'
    },
    {
      id: 'normal',
      n: 10,
      title: 'The normal distribution, and the procedure',
      start: 270, end: 300,
      objective: 'Read mean and variance off a normal density, use the 68-95-99.7 rule, and close with the decision procedure for a probability question.'
    }
  ],

  events: [

    /* ---------------- scene 1: sample space ---------------- */
    {
      id: 'ss-1', scene: 'samplespace', start: 0, end: 7.5,
      caption: 'Probability starts with a set of outcomes and a rule that gives every event a number.',
      detail: 'The sample space S is the set of everything that can happen. An event is a subset of S. A probability is a function from events to the interval from 0 to 1.',
      narration: 'Probability starts with two objects. The sample space, which is the set of everything that can happen. And an event, which is a subset of that space. A probability is then a rule that gives each event a number between zero and one.',
      keyword: 'outcomes and events',
      trap: 'Two dice produce thirty-six ordered outcomes, not twenty-one unordered sums. Counting sums instead of outcomes is the first wrong answer offered.'
    },
    {
      id: 'ss-2', scene: 'samplespace', start: 7.5, end: 15,
      caption: 'P(sum = 7) = 6/36 = 1/6, because six of the thirty-six outcomes give seven.',
      detail: 'When every outcome is equally likely, the probability of an event is the number of outcomes inside it divided by the size of the sample space. Six pairs give seven: one-six, two-five, three-four and their mirror images.',
      narration: 'When all thirty-six outcomes are equally likely, the probability of an event is just a count. Six of the thirty-six pairs give a sum of seven, so the probability is six over thirty-six, which is one sixth.',
      keyword: '6 of 36',
      trap: 'Seven is the most likely sum, and its probability is still only one sixth. Most likely does not mean likely.'
    },
    {
      id: 'ss-3', scene: 'samplespace', start: 15, end: 22.5,
      caption: 'P(sum > 9) is also 6/36: the sums 10, 11 and 12 carry three, two and one outcomes.',
      detail: 'The distribution of the sum is symmetric and triangular: counts one, two, three, four, five, six, five, four, three, two, one for the sums two to twelve. Above nine sit the counts three, two and one, which total six.',
      narration: 'The sum is more than nine in exactly six outcomes as well. Ten comes in three ways, eleven in two, and twelve in one. Add them and you have six over thirty-six, the same probability as a sum of seven.',
      keyword: 'three, two and one',
      trap: 'The counts are not equal across the sums. Reading the eleven bars as equal heights throws away the whole distribution.'
    },
    {
      id: 'ss-4', scene: 'samplespace', start: 22.5, end: 30,
      caption: 'The three axioms: P(S) = 1, every probability lies between 0 and 1, and disjoint events add.',
      detail: 'Kolmogorov gives three axioms. The whole space has probability one. Every event has a probability at least zero. And for events that cannot happen together, the probability of their union is the sum of their probabilities.',
      narration: 'Three axioms generate everything else. The whole sample space has probability one. No event has a negative probability. And when two events cannot happen together, the probability that either happens is the sum of the two. Everything else in probability is a consequence.',
      keyword: 'the axioms',
      trap: 'The addition rule needs disjointness. Applying it to overlapping events double-counts the intersection.'
    },

    /* ---------------- scene 2: conditional ---------------- */
    {
      id: 'cd-1', scene: 'conditional', start: 30, end: 37.5,
      caption: 'Conditioning on B throws away every outcome outside B and renormalises what is left.',
      detail: 'P(A | B) is the probability of A computed inside the smaller space B. Formally it is the probability of the overlap divided by the probability of B, which is what renormalising means.',
      narration: 'Conditioning is the act of discarding part of the sample space. Given that B happened, every outcome outside B is gone. What remains is B, and the probabilities inside it are scaled up so that they again total one.',
      keyword: 'shrink and renormalise',
      trap: 'P(A | B) and P(B | A) are different numbers with the same ingredients. Never swap them.'
    },
    {
      id: 'cd-2', scene: 'conditional', start: 37.5, end: 45,
      caption: 'The event "sum > 9" keeps 6 of the 36 outcomes, so the new sample space has size 6.',
      detail: 'Restricting the thirty-six cells of the grid to those whose sum exceeds nine leaves six cells. That is the denominator. The grid on the canvas shows the surviving cells filled and the rest faded.',
      narration: 'Here is the grid of thirty-six outcomes. Keeping only the cells whose sum is more than nine leaves six of them. That six is now the whole world, and it becomes the denominator of every probability we compute next.',
      keyword: '6 cells survive',
      trap: 'The denominator is the conditioning event, not the original sample space. Dividing by 36 gives the joint probability, not the conditional one.'
    },
    {
      id: 'cd-3', scene: 'conditional', start: 45, end: 52.5,
      caption: 'Inside it, 2 outcomes give 11, so P(sum = 11 | sum > 9) = 2/6 = 1/3.',
      detail: 'The two outcomes are five-six and six-five. Dividing the two by the six gives one third, which is the same as dividing the joint probability two over thirty-six by the conditioning probability six over thirty-six.',
      narration: 'Within those six cells, exactly two give a sum of eleven: five and six, and six and five. So the conditional probability is two over six, one third. The same answer comes from dividing two over thirty-six by six over thirty-six, which is what the definition says.',
      keyword: '2 of 6',
      trap: 'The answer is larger than the unconditional one sixth. Conditioning on a rarer event can raise a probability, which feels wrong until you see the smaller denominator.'
    },
    {
      id: 'cd-4', scene: 'conditional', start: 52.5, end: 60,
      caption: 'Independence is P(A and B) = P(A)P(B); mutual exclusivity is P(A and B) = 0. They are not the same.',
      detail: 'Independence says the overlap is exactly what multiplying the two probabilities predicts, so conditioning changes nothing. Mutual exclusivity says the overlap is empty, which usually makes the events strongly dependent: if one happens, the other cannot.',
      narration: 'Two words get confused constantly. Independent means the overlap equals the product, so knowing one event tells you nothing about the other. Mutually exclusive means the overlap is empty, so knowing one event tells you everything: the other cannot happen. Disjoint events are dependent, unless one of them has probability zero.',
      keyword: 'independent versus disjoint',
      trap: 'Options that offer "independent because they cannot both happen" are the classic trap. Disjointness is the opposite of independence in almost every exam example.'
    },

    /* ---------------- scene 3: Bayes ---------------- */
    {
      id: 'by-1', scene: 'bayes', start: 60, end: 67.5,
      caption: "Bayes' theorem turns P(evidence | cause) into P(cause | evidence).",
      detail: 'The theorem is one line of algebra from the definition of conditional probability applied in both directions: the joint probability is the same whether you reach it through A or through B.',
      narration: 'Bayes theorem answers the question you actually have. You know how likely the evidence is given a cause, and you want how likely the cause is given the evidence. The two are linked because both are the same overlap, divided by different things.',
      keyword: 'swap the condition',
      trap: 'The denominator is the total probability of the evidence over every cause, not just the one you are asking about.'
    },
    {
      id: 'by-2', scene: 'bayes', start: 67.5, end: 75,
      caption: 'GATE 2021 Set 1 Q54: H is transmitted with probability 0.1, L with 0.9.',
      detail: 'The channel is given by conditional probabilities: given H sent, H is received with probability 0.3 and L with 0.7; given L sent, H is received with probability 0.8 and L with 0.2.',
      narration: 'Here is a real question. A sender transmits H with probability 0.1 and L with 0.9. The channel is noisy: an H arrives as an H only three times in ten, while an L arrives as an H eight times in ten. We receive an H. What was sent?',
      keyword: 'prior 0.1 and 0.9',
      trap: 'The prior and the likelihood are given in different directions. Read which one the question hands you before substituting.'
    },
    {
      id: 'by-3', scene: 'bayes', start: 75, end: 82.5,
      caption: 'P(H received) = 0.3(0.1) + 0.8(0.9) = 0.75, by the law of total probability.',
      detail: 'The evidence H received can happen in two ways: H was sent and survived, or L was sent and was corrupted into H. Those two paths are disjoint, so their probabilities add.',
      narration: 'First compute how often an H arrives at all. It arrives from an H with probability 0.03, and from an L with probability 0.72. Add the two disjoint paths and an H arrives with probability 0.75. That is the law of total probability, and it is the denominator.',
      keyword: '0.03 plus 0.72',
      trap: 'Forgetting the second path leaves the denominator at 0.03, and the answer becomes 1. Any posterior above one is a signal that a path was dropped.'
    },
    {
      id: 'by-4', scene: 'bayes', start: 82.5, end: 90,
      caption: 'P(H sent | H received) = 0.03 / 0.75 = 0.04. The posterior sits below the prior.',
      detail: 'Divide the path you want by the total: three hundredths over seventy-five hundredths is four hundredths. The prior was 0.1, so the evidence pushed the probability of H down, because L is far more likely to produce an H than H is.',
      narration: 'Now divide. The path where H was sent and H arrived is 0.03. The total is 0.75. The ratio is 0.04. Notice that this is below the prior of 0.1: seeing an H makes an H transmission less likely, not more, because a corrupted L produces H far more often.',
      keyword: '0.04, below the prior',
      trap: 'Answering 0.3 means you reported the likelihood and stopped. The likelihood is given; the posterior is the answer.'
    },

    /* ---------------- scene 4: random variables ---------------- */
    {
      id: 'rv-1', scene: 'rv', start: 90, end: 97.5,
      caption: 'A random variable is a function: it assigns a number to each outcome.',
      detail: 'The randomness lives in the outcomes. The variable is a deterministic rule on top of them, which is why we can do arithmetic with it: sums, squares, comparisons, all applied to the numbers it produces.',
      narration: 'A random variable is not a variable and it is not random. It is a function. Each outcome of the experiment is mapped to a number. Once the outcome is fixed, the number is fixed; before that, the number is uncertain because the outcome is.',
      keyword: 'a function, not a variable',
      trap: 'A capital X is the function; a small x is a value it can take. P(X = x) is the probability that the function lands on that value.'
    },
    {
      id: 'rv-2', scene: 'rv', start: 97.5, end: 105,
      caption: 'For a discrete variable the PMF gives each value its probability, and those probabilities sum to 1.',
      detail: 'The probability mass function lists every value the variable can take with its probability. It is a table, and the table must be a probability distribution: every entry non-negative and the entries summing to exactly one.',
      narration: 'For a discrete random variable the distribution is a list: each value, and its probability. Two rules make the list legal. No entry is negative, and the entries add up to one. That is all a probability mass function is.',
      keyword: 'the table sums to one',
      trap: 'A table whose entries sum to 1.2 is not a distribution. Many questions hand you one and ask for the constant that fixes it.'
    },
    {
      id: 'rv-3', scene: 'rv', start: 105, end: 112.5,
      caption: 'The CDF F(x) = P(X <= x) is a staircase: non-decreasing, flat between values, reaching 1.',
      detail: 'The cumulative distribution function adds up the mass up to a point. It never decreases, it jumps at each value of a discrete variable, and it tends to one. It exists for continuous variables too, where it is smooth instead of stepped.',
      narration: 'The cumulative distribution function asks a different question: what is the probability that the variable is at most this value. Add the masses as you move right and you get a staircase. It never goes down, it jumps exactly at the values with mass, and it arrives at one.',
      keyword: 'never decreases',
      trap: 'The CDF gives P(X at most x), including x. For a discrete variable the jump at a value is the mass at that value, so the left limit differs from the value.'
    },
    {
      id: 'rv-4', scene: 'rv', start: 112.5, end: 120,
      caption: 'For a continuous variable only intervals carry probability: P(X = a) = 0 for every a.',
      detail: 'A continuous variable has a density, and probability is the area under the density over an interval. A single point has no width, so it encloses no area. This is why the density may exceed one while the probability may not.',
      narration: 'A continuous random variable has a density instead of a table. Probability is area under the density. A single point has no width, so it has no area, so the probability of any exact value is zero. That is not a technicality: it is why the density can be greater than one, and why at most and less than give the same answer here.',
      keyword: 'area, not height',
      trap: 'A density of 3 is legal. Reading the height of the curve as a probability is the single most common continuous-distribution error.'
    },

    /* ---------------- scene 5: expectation ---------------- */
    {
      id: 'ex-1', scene: 'expect', start: 120, end: 127.5,
      caption: 'The expectation is the probability-weighted average of the values: the balance point of the PMF.',
      detail: 'Multiply each value by its probability and add. Values with more mass pull the average towards them, which is exactly what a fulcrum does under weights placed along a bar.',
      narration: 'The expectation is a weighted average. Put each possible value on a bar, hang a weight equal to its probability, and the point where the bar balances is the expectation. It need not be a value the variable can take.',
      keyword: 'the balance point',
      trap: 'The expectation of a fair die is 3.5, a number the die can never show. Not being attainable is not an error.'
    },
    {
      id: 'ex-2', scene: 'expect', start: 127.5, end: 135,
      caption: 'GATE 2026 Set 1: eight values carry weights of one sixth and one twelfth.',
      detail: 'The values one, two, five and seven each have probability one sixth; the values three, four, six and eight each have probability one twelfth. The eight weights sum to one, so the table is a legal distribution.',
      narration: 'Here is a distribution from GATE 2026. The variable takes the values one to eight. Four of them carry a probability of one sixth each, and the other four carry one twelfth each. Check the weights first: four sixths plus four twelfths is one.',
      keyword: 'four sixths, four twelfths',
      trap: 'Assuming the eight values are equally likely gives 4.5. The table is not uniform, and the whole question is the weighting.'
    },
    {
      id: 'ex-3', scene: 'expect', start: 135, end: 142.5,
      caption: 'E[X] = 17/4 = 4.25, a weighted sum and not a plain average of one to eight.',
      detail: 'The four light values contribute fifteen sixths, which is 2.5. The four heavy values contribute twenty-one twelfths, which is 1.75. Together they give 4.25, above the midpoint of 4.5 only if you weight wrongly: the heavy values sit low, so the mean falls below 4.5.',
      narration: 'Multiply and add. The four values weighted by one sixth contribute 2.5. The four weighted by one twelfth contribute 1.75. The expectation is 4.25. Note that it is below the midpoint of the range, because the values carrying the larger weights are the small ones.',
      keyword: '4.25',
      trap: 'The unweighted average of one to eight is 4.5. Quoting it ignores the whole table and is offered as a distractor.'
    },
    {
      id: 'ex-4', scene: 'expect', start: 142.5, end: 150,
      caption: 'Linearity always holds: E[X + Y] = E[X] + E[Y]. E[XY] = E[X]E[Y] needs independence.',
      detail: 'Expectation is linear for any two random variables, dependent or not, which is why indicator variables solve so many counting problems. The product rule is a different statement, and it needs independence, or at least uncorrelatedness.',
      narration: 'One property does most of the work in algorithm analysis. The expectation of a sum is the sum of the expectations, always, with no assumption about dependence. The expectation of a product is the product of the expectations only when the variables are independent. Keep those two apart.',
      keyword: 'sums always, products rarely',
      trap: 'Splitting a product is the standard error. E[XY] = E[X]E[Y] fails even for simple dependent pairs.'
    },

    /* ---------------- scene 6: spread ---------------- */
    {
      id: 'sp-1', scene: 'spread', start: 150, end: 157.5,
      caption: 'Two distributions can share a mean and differ completely in spread.',
      detail: 'The mean locates the distribution; it says nothing about how far the mass sits from that location. Two PMFs centred at the same value can have very different widths, and every question about risk, jitter or error is a question about the width.',
      narration: 'Two distributions can have the same balance point and nothing else in common. One is tightly packed, one is spread across the range. The mean cannot tell them apart, which is why we need a second number.',
      keyword: 'same mean, different width',
      trap: 'Comparing only means is a common shortcut in expectation questions. If the question says variability, spread, or risk, the mean is not the answer.'
    },
    {
      id: 'sp-2', scene: 'spread', start: 157.5, end: 165,
      caption: 'Variance is the mean squared distance from the mean: 5.5208 here, so the standard deviation is 2.3496.',
      detail: 'Compute the mean of the squares, 23.5833, and subtract the square of the mean, 18.0625. The difference is the variance. Its square root returns to the original units and is the standard deviation.',
      narration: 'Variance is the average squared distance from the mean. There are two ways to compute it and one is much faster. Take the mean of the squares, which is 23.5833, and subtract the square of the mean, 18.0625. The answer is 5.5208. Square-root it for the standard deviation, 2.3496.',
      keyword: 'E of X squared, minus square of E',
      trap: 'Forgetting to square the mean is the standard slip. The second term is the square of the mean, not the mean.'
    },
    {
      id: 'sp-3', scene: 'spread', start: 165, end: 172.5,
      caption: 'Var(aX + b) = a squared times Var(X): shifting does not change spread, scaling squares it.',
      detail: 'Adding a constant slides the distribution without changing any distance from the mean, so the variance is untouched. Multiplying by a constant multiplies every distance by that constant, and the square in the definition turns that into the square of the constant.',
      narration: 'Two transformation rules. Shift a variable and the variance does not move, because every distance from the mean is unchanged. Scale it and every distance is scaled, so the variance is scaled by the square. Doubling a variable quadruples its variance.',
      keyword: 'shift adds nothing, scale squares',
      trap: 'A negative scale still gives a positive variance, because of the square. The sign never survives.'
    },
    {
      id: 'sp-4', scene: 'spread', start: 172.5, end: 180,
      caption: 'Mean, median and mode coincide only for symmetric data; the median of max(X, 0) is 0.',
      detail: 'For a symmetric distribution the three averages agree. For skewed data they separate in a fixed order: the mean is dragged towards the long tail, the median stays in the middle, the mode sits at the peak. GATE 2017 Set 1 asks for the median of a clipped Gaussian, and half the mass sits exactly at zero.',
      narration: 'Mean, median and mode are three different questions. Where does it balance, where is the middle, and where is the peak. For symmetric data all three agree. For skewed data the mean runs towards the tail and the median does not. And here is a case where the median is obvious without any integration: clip a centred normal at zero and half the mass sits exactly at zero, so the median is zero.',
      keyword: 'balance, middle, peak',
      trap: 'The median of a distribution with an atom at zero can be zero even though the variable is otherwise continuous. Do not integrate when the mass already answers it.'
    },

    /* ---------------- scene 7: binomial ---------------- */
    {
      id: 'bi-1', scene: 'binomial', start: 180, end: 187.5,
      caption: 'A Bernoulli trial has two outcomes; the binomial counts successes in n independent trials.',
      detail: 'One trial with success probability p is a Bernoulli variable. Repeat it n times independently with the same p and count the successes: that count is binomial with parameters n and p. Both assumptions matter: independence and a constant p.',
      narration: 'Start with one trial that succeeds with probability p. Repeat it n times, independently, with the same probability each time, and count the successes. That count is a binomial random variable. Two words in that sentence carry the weight: independently, and the same probability each time.',
      keyword: 'n trials, same p, independent',
      trap: 'Drawing without replacement changes p between trials, so the count is not binomial. It is hypergeometric, and the binomial answer will be slightly wrong.'
    },
    {
      id: 'bi-2', scene: 'binomial', start: 187.5, end: 195,
      caption: 'The binomial PMF is C(n, k) p^k (1-p)^(n-k), and its values sum to 1.',
      detail: 'The binomial coefficient counts which of the k positions hold the successes; the two powers carry the probability of that particular pattern. Summing over k gives the binomial theorem applied to p plus one minus p, which is one.',
      narration: 'The formula has three parts. Choose which of the trials succeeded, and there are n choose k ways. Give each of those successes probability p, and each failure one minus p. Multiply, and sum over k. The sum is one by the binomial theorem, which is the check that the formula is a distribution.',
      keyword: 'choose, then power',
      trap: 'Dropping the binomial coefficient counts one arrangement instead of all of them, and the probabilities no longer sum to one.'
    },
    {
      id: 'bi-3', scene: 'binomial', start: 195, end: 202.5,
      caption: 'Mean np = 3 and variance np(1-p) = 2.1 for n = 10 and p = 0.3.',
      detail: 'Both come from writing the count as a sum of n indicator variables, one per trial, and applying linearity. The variance uses independence, which is exactly what makes the cross terms vanish. No summation is needed.',
      narration: 'The mean and the variance need no summation. The mean is n times p, three here. The variance is n times p times one minus p, which is 2.1. The mean came from linearity alone; the variance needed independence as well, which is where the cross terms disappear.',
      keyword: 'np and np(1-p)',
      trap: 'The variance is not np. That is the Poisson, and it is only the limit when p is small.'
    },
    {
      id: 'bi-4', scene: 'binomial', start: 202.5, end: 210,
      caption: 'P(X = 3) = 0.2668: here the mode and the mean coincide at 3.',
      detail: 'One hundred and twenty arrangements, each carrying 0.3 cubed times 0.7 to the seventh, gives 0.2668. The most likely count is the integer at or next to the mean, which for a non-integer mean is the floor.',
      narration: 'The probability of exactly three successes is 0.2668. A hundred and twenty arrangements, each with probability 0.3 cubed times 0.7 to the seventh. It is also the largest bar, and it sits at the mean, because ten times 0.3 is a whole number. When np is not an integer, the mode is one of the two integers beside it.',
      keyword: '0.2668',
      trap: 'A whole-number mean does not always mean the mode equals it, but here it does. Compute the neighbouring bars rather than assuming.'
    },

    /* ---------------- scene 8: Poisson ---------------- */
    {
      id: 'po-1', scene: 'poisson', start: 210, end: 217.5,
      caption: 'The Poisson counts events in a fixed interval when they occur independently at a constant rate.',
      detail: 'The parameter is the average number of events in the interval. The count is unbounded above, the events do not influence one another, and the rate does not change inside the interval. Drop any of the three and the model stops being Poisson.',
      narration: 'The Poisson distribution counts events in an interval of time or space: arrivals at a queue, errors in a page, packets in a slot. The parameter is the average count in that interval. Its assumptions are that the events are independent, the rate is constant, and the interval is fixed in advance.',
      keyword: 'a count in a fixed interval',
      trap: 'Choosing the interval after seeing the data changes the model. The interval must be fixed before you count.'
    },
    {
      id: 'po-2', scene: 'poisson', start: 217.5, end: 225,
      caption: 'Its PMF is e to the minus lambda, lambda to the k, over k factorial, with mean and variance both lambda.',
      detail: 'The mean and the variance being equal is the signature of the Poisson, and it is the quickest way to recognise one in a question. A count whose variance is far below its mean is under-dispersed and is not Poisson.',
      narration: 'The probability of exactly k events is e to the minus lambda, times lambda to the k, over k factorial. One property identifies the distribution instantly: the mean and the variance are both lambda. If a question says the variance is three and asks for the mean, and the variable is Poisson, the answer is three.',
      keyword: 'mean equals variance',
      trap: 'Mean equals variance is necessary for a Poisson, not sufficient for a variable to be one. It is a recognition cue, not a definition.'
    },
    {
      id: 'po-3', scene: 'poisson', start: 225, end: 232.5,
      caption: 'With lambda = 3 the probability of no event is 0.0498, and of exactly three events 0.2240.',
      detail: 'Both come straight from the formula. The zero case is e to the minus three, and the three case adds the factor three cubed over six, which is 4.5, and 4.5 times 0.0498 is 0.2240.',
      narration: 'With lambda equal to three, no event at all has probability 0.0498, which is e to the minus three. Exactly three events has probability 0.2240. Note that the probabilities of two and three events are equal here, because lambda is an integer, and that tie is a common source of confusion in multiple-choice options.',
      keyword: '0.0498 and 0.2240',
      trap: 'For integer lambda the two central bars are equal. Picking one of them as "the most likely" when the question asks for a single mode is the trap.'
    },
    {
      id: 'po-4', scene: 'poisson', start: 232.5, end: 240,
      caption: 'Poisson is the limit of binomial when n is large and p is small with np = lambda: the gap here is 0.0015.',
      detail: 'Binomial with one thousand trials at probability three thousandths has the same mean as Poisson with lambda three, and the two PMFs differ by 0.0015 in total variation. The approximation is good precisely because n is large and p is small while the product stays fixed.',
      narration: 'The Poisson is what a binomial becomes when the number of trials grows, the success probability shrinks, and the product stays put. A thousand trials at three thousandths is a binomial with mean three, and its distribution is within 0.0015 of Poisson with lambda three. That is why the approximation is allowed, and the condition is the whole justification.',
      keyword: 'large n, small p, fixed np',
      trap: 'The approximation is about n large and p small, not about np being small. Ten trials at 0.3 has the same mean and is not well approximated.'
    },

    /* ---------------- scene 9: exponential ---------------- */
    {
      id: 'xp-1', scene: 'exponential', start: 240, end: 247.5,
      caption: 'The exponential is the continuous waiting time between Poisson events.',
      detail: 'If events arrive as a Poisson process with rate lambda, the gap until the next event has an exponential distribution with the same lambda. One parameter, positive support, and a density that falls away from zero.',
      narration: 'The exponential is the continuous partner of the Poisson. If events arrive at a constant rate, the time you wait for the next one is exponential, with the same rate parameter. The Poisson counts events in a fixed window; the exponential measures the gap between them.',
      keyword: 'the gap between events',
      trap: 'The rate and the mean are reciprocals. A mean of four means a rate of one quarter, and mixing the two inverts every answer.'
    },
    {
      id: 'xp-2', scene: 'exponential', start: 247.5, end: 255,
      caption: 'Its density is lambda e to the minus lambda x, so the area beyond 4 is e to the minus 1, which is 0.3679.',
      detail: 'The tail probability has a closed form: the probability of exceeding t is e to the minus lambda t. With a mean of four, exceeding four has probability e to the minus one. No integration is needed, though the integral gives the same number.',
      narration: 'The density falls exponentially from lambda. The probability of waiting longer than t is e to the minus lambda t, a formula worth memorising because it replaces an integral in every question. With a mean of four, waiting more than four has probability e to the minus one, 0.3679.',
      keyword: 'e to the minus lambda t',
      trap: 'The mean is four but the median is not. The median solves e to the minus lambda t equals one half, which is about 2.77, not 4.'
    },
    {
      id: 'xp-3', scene: 'exponential', start: 255, end: 262.5,
      caption: 'It is memoryless: P(X > 7 | X > 3) = P(X > 4) = 0.3679.',
      detail: 'Conditioning on having already waited three units leaves the remaining wait with exactly the original distribution. The conditional probability equals the unconditional probability of waiting four, because the exponential has no memory of elapsed time.',
      narration: 'Here is the property that makes the exponential special. Having already waited three units, the chance of waiting four more is the same as the chance of waiting four from the start: 0.3679. The distribution forgets how long you have been waiting. That is memorylessness, and it is true for the exponential and the geometric, and for almost nothing else.',
      keyword: 'the wait restarts',
      trap: 'Memorylessness is a property of the distribution, not of your intuition. A uniform waiting time is not memoryless: having waited three of ten minutes, the remaining wait is shorter.'
    },
    {
      id: 'xp-4', scene: 'exponential', start: 262.5, end: 270,
      caption: 'Mean 1/lambda = 4, variance 1/lambda squared = 16, and the median is below the mean.',
      detail: 'Both moments come from the single parameter. The median being below the mean is the signature of a right-skewed distribution, and it is why the mean of an exponential is a poor summary of a typical wait.',
      narration: 'The mean is one over lambda, four. The variance is one over lambda squared, sixteen, so the standard deviation is four as well. The median, though, is about 2.77: below the mean, because the distribution is skewed right. Half of all waits are shorter than 2.77 and half are longer, and the long tail pulls the mean up.',
      keyword: 'mean 4, median 2.77',
      trap: 'Reporting the mean as the typical wait overstates it by about forty percent for an exponential. The question says typical for a reason.'
    },

    /* ---------------- scene 10: normal ---------------- */
    {
      id: 'nr-1', scene: 'normal', start: 270, end: 277.5,
      caption: 'The normal is fixed by its mean and variance: 68.27, 95.45 and 99.73 percent within one, two and three sigma.',
      detail: 'The density is symmetric about the mean, so the mean, median and mode coincide. The three band percentages are the fastest way to answer a normal question without a table, and they are exact to two decimals.',
      narration: 'The normal is the symmetric bell. Two numbers fix it completely: the centre and the spread. Within one standard deviation of the mean sits 68.27 percent of the probability, within two 95.45, within three 99.73. Because it is symmetric, the mean, the median and the mode are the same number.',
      keyword: '68, 95, 99.7',
      trap: 'The percentages are two-sided bands about the mean. One side alone holds 34.13, not 68.27.'
    },
    {
      id: 'nr-2', scene: 'normal', start: 277.5, end: 285,
      caption: 'Standardise with z = (x - mu)/sigma to turn any normal into the standard one.',
      detail: 'Subtracting the mean centres the distribution and dividing by the standard deviation scales it to unit spread. The transformation is affine, so the result is still normal, and every question about a general normal becomes a question about the standard one.',
      narration: 'To use any normal table, standardise. Subtract the mean, which slides the curve to zero. Divide by the standard deviation, which scales the width to one. The result is the standard normal, and the distance you measured in original units is now a number of standard deviations.',
      keyword: 'subtract, then divide',
      trap: 'Dividing by the variance instead of the standard deviation is the standard slip. The divisor is sigma, not sigma squared.'
    },
    {
      id: 'nr-3', scene: 'normal', start: 285, end: 292.5,
      caption: 'GATE 2026 Set 2: the density one over three root two pi, e to the minus x squared over eighteen, is normal with mean 0 and variance 9.',
      detail: 'Match the given density against the standard form. The exponent is minus x squared over twice the variance, so twice the variance is eighteen and the variance is nine, giving a standard deviation of three, which is exactly the constant in front.',
      narration: 'Here is the recognition question. Compare the given density with the standard form of a normal. The exponent is minus x squared over eighteen, and the standard exponent is minus x minus mu squared over twice the variance. So twice the variance is eighteen, the variance is nine, the standard deviation is three, and the three in front confirms it. The mean is zero because there is no shift.',
      keyword: 'match the exponent',
      trap: 'The denominator in the exponent is twice the variance, not the variance. Reading eighteen as the variance gives the wrong option.'
    },
    {
      id: 'nr-4', scene: 'normal', start: 292.5, end: 300,
      caption: 'Procedure: name the variable type, write the question as an event, then compute — and check the answer is a probability.',
      detail: 'Three steps cover every question in this clause. Identify discrete or continuous and which family. Translate the words into an event with inequalities. Compute, then verify the result lies between zero and one, and that the pieces add up.',
      narration: 'One procedure covers the clause. First name the type: discrete or continuous, and which family, from the mean and variance if they are given. Second, translate the sentence into an event with inequalities, being careful about at most and at least. Third, compute, and then check that the answer is a probability. Every option above one, or below zero, is a slip you can catch in five seconds.',
      keyword: 'name, translate, compute, check',
      trap: 'The last step is the cheapest mark in the paper. An answer outside zero to one needs no further thought to reject.'
    }
  ]
};
