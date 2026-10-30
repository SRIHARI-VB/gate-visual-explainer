/* ==========================================================================
   linearity-of-expectation — THE timeline.
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
      id: 'sum',
      n: 1,
      title: 'The mean of a sum is the sum of the means',
      start: 0, end: 30,
      objective: 'Show that E[X + Y] can be computed from the two separate means, and check it against the 36-outcome average for two dice.'
    },
    {
      id: 'dependence',
      n: 2,
      title: 'No independence needed',
      start: 30, end: 60,
      objective: 'Show a joint distribution in which X and Y are perfectly dependent, where the sum still adds but the product does not.'
    },
    {
      id: 'indicator',
      n: 3,
      title: 'Indicators turn counting into adding probabilities',
      start: 60, end: 90,
      objective: 'Define an indicator variable, prove E[I] = P(A), and write a count as a sum of indicators.'
    },
    {
      id: 'fixedpoints',
      n: 4,
      title: 'Fixed points: exactly one, for every n',
      start: 90, end: 120,
      objective: 'Compute the expected number of fixed points of a random permutation by enumeration and by indicators, and read the n = 5 distribution.'
    },
    {
      id: 'inversions',
      n: 5,
      title: 'Inversions: n(n−1)/4',
      start: 120, end: 150,
      objective: 'Count inversions by counting pairs, and check the closed form against every permutation up to n = 7.'
    },
    {
      id: 'hashing',
      n: 6,
      title: 'Hashing: load n/m and collisions C(n,2)/m',
      start: 150, end: 180,
      objective: 'Derive the expected slot load, the expected number of collisions and the expected number of occupied slots.'
    },
    {
      id: 'quicksort',
      n: 7,
      title: 'Quicksort: 2(n+1)H(n) − 4n comparisons',
      start: 180, end: 210,
      objective: 'Sum pair probabilities to obtain the exact expected comparison count, and compare it with the 2n ln n bound.'
    },
    {
      id: 'variance',
      n: 8,
      title: 'Where linearity stops: variance and products',
      start: 210, end: 240,
      objective: 'Show that variance of a sum needs a covariance term, and that E of a function is not the function of E.'
    },
    {
      id: 'tailsum',
      n: 9,
      title: 'The tail-sum form: E[X] = the sum of P(X ≥ k)',
      start: 240, end: 270,
      objective: 'Prove and use the tail-sum formula on the larger of two dice, checked against the 36-outcome average.'
    },
    {
      id: 'procedure',
      n: 10,
      title: 'The procedure and the traps',
      start: 270, end: 300,
      objective: 'Fix the four-step procedure for an expected-count question and name the five traps that produce plausible wrong options.'
    }
  ],

  events: [
    /* ---------- scene 1: the mean of a sum ---------- */
    {
      id: 's1-1', scene: 'sum', start: 0, end: 7.5,
      caption: 'Two dice: 36 equally likely outcomes. The sum runs from 2 to 12.',
      detail: 'The sample space is every ordered pair (a, b) with a and b from 1 to 6, so 36 equally likely outcomes. The random variable is the sum a + b, whose smallest value is 2 and largest is 12.',
      narration: 'Two dice give thirty-six equally likely outcomes. The sum of the faces runs from two to twelve, and the question is what it averages to.',
      keyword: '36 outcomes',
      trap: 'Eleven possible sums do not mean eleven equally likely sums. The outcomes are the 36 pairs, not the 11 totals.'
    },
    {
      id: 's1-2', scene: 'sum', start: 7.5, end: 15,
      caption: 'Averaging all 36 sums gives 7. That is the brute-force route.',
      detail: 'Adding every cell of the 6 by 6 table gives 252, and 252 divided by 36 is 7. This route needs the whole joint distribution, which for two dice is 36 numbers.',
      narration: 'Add all thirty-six sums and divide by thirty-six. The total is two hundred and fifty-two, so the average is seven. That is the honest, brute-force route.',
      keyword: 'total 252, average 7',
      trap: 'Dividing 252 by 11 instead of 36 is the commonest arithmetic slip here.'
    },
    {
      id: 's1-3', scene: 'sum', start: 15, end: 22.5,
      caption: 'One die averages 3.5, so two dice average 3.5 + 3.5 = 7.',
      detail: 'A single fair die has mean (1 + 2 + 3 + 4 + 5 + 6) / 6 = 3.5. Linearity of expectation says the mean of the sum is the sum of the means, so 7 without ever writing the 36-cell table.',
      narration: 'One die averages three and a half. By linearity the sum of two dice averages three and a half plus three and a half, which is seven, and no table was needed.',
      keyword: '3.5 + 3.5 = 7',
      trap: 'A mean need not be a value the variable can take: no pair of dice sums to 3.5.'
    },
    {
      id: 's1-4', scene: 'sum', start: 22.5, end: 30,
      caption: 'That is the whole idea: the mean of a sum is the sum of the means.',
      detail: 'E[X + Y] = E[X] + E[Y], and more generally E[aX + bY + c] = aE[X] + bE[Y] + c. The statement holds for every joint distribution of X and Y, which is what the next scene tests.',
      narration: 'That is the entire idea. The mean of a sum is the sum of the means, whatever the two variables are doing to each other. The next scene tests that word, whatever.',
      keyword: 'mean of a sum',
      trap: 'The rule is about the mean only. It says nothing about variance, products or the shape of the distribution.'
    },

    /* ---------- scene 2: dependence ---------- */
    {
      id: 's2-1', scene: 'dependence', start: 30, end: 37.5,
      caption: 'The two dice were independent, but linearity never used that fact.',
      detail: 'Independence was not an assumption of the previous scene. The derivation of linearity swaps the order of two finite sums, which is legal for any joint distribution, dependent or not.',
      narration: 'The two dice happened to be independent. But the rule that gave seven never asked. Nothing in the derivation assumed that the dice do not influence each other.',
      keyword: 'never used independence',
      trap: 'This is the single most common misconception in the topic: that linearity requires independence.'
    },
    {
      id: 's2-2', scene: 'dependence', start: 37.5, end: 45,
      caption: 'Let X = Y: one die, copied. The joint table collapses onto its diagonal.',
      detail: 'With Y equal to X, only six of the 36 cells carry probability, each 1/6. The joint distribution is a line of six points rather than a filled square, and the two variables are as dependent as they can be.',
      narration: 'Now take one die and copy it. Y equals X always. The joint table keeps only its diagonal: six cells, each with probability one sixth. Nothing could be more dependent.',
      keyword: 'only six cells',
      trap: 'A joint distribution that is a diagonal is still a joint distribution; linearity applies to it.'
    },
    {
      id: 's2-3', scene: 'dependence', start: 45, end: 52.5,
      caption: 'E[X + Y] is still 3.5 + 3.5 = 7, and 2X really does average 7.',
      detail: 'Averaging 2X over the six equally likely faces gives (2 + 4 + 6 + 8 + 10 + 12)/6 = 42/6 = 7, which equals 2 times 3.5. The linearity answer and the enumeration agree exactly.',
      narration: 'The sum is now twice one die. Averaging two, four, six, eight, ten and twelve gives seven. Linearity said three and a half plus three and a half, also seven. They agree.',
      keyword: 'enumeration agrees',
      trap: 'Dependence changes the spread and the shape, never the mean of a sum.'
    },
    {
      id: 's2-4', scene: 'dependence', start: 52.5, end: 60,
      caption: 'But E[X·Y] is 91/6 = 15.17, not 12.25. Products do need independence.',
      detail: 'For a fair die E[X squared] is (1+4+9+16+25+36)/6 = 91/6 = 15.1667, while (E[X]) squared is 12.25. So E[XY] is not E[X]E[Y] here. The product rule needs independence; the sum rule does not.',
      narration: 'Now multiply instead of adding. X times Y is X squared, which averages fifteen point one seven. The product of the means is twelve point two five. For products, dependence matters.',
      keyword: 'E[XY] needs independence',
      trap: 'Do not carry the linearity licence from sums to products: E[XY] = E[X]E[Y] requires independence.'
    },

    /* ---------- scene 3: indicators ---------- */
    {
      id: 's3-1', scene: 'indicator', start: 60, end: 67.5,
      caption: 'An indicator is 1 when its event happens and 0 when it does not.',
      detail: 'The indicator of an event A, written I(A), takes the value 1 on outcomes where A occurs and 0 elsewhere. It is the smallest non-trivial random variable, and it is the tool that turns counting into probability.',
      narration: 'An indicator is the simplest random variable there is. It is one when something happens and zero when it does not. Nothing else.',
      keyword: 'indicator = 1 or 0',
      trap: 'An indicator takes only 0 and 1. A variable that can take 2 is not an indicator, and E[I] = P(A) then fails.'
    },
    {
      id: 's3-2', scene: 'indicator', start: 67.5, end: 75,
      caption: 'Its mean is the probability: E[I] = 1·p + 0·(1−p) = p.',
      detail: 'Averaging over the two possible values gives E[I] = p, where p is the probability of the event. So the expectation of an indicator is exactly the probability of its event, with no further work.',
      narration: 'Average one with probability p and zero with probability one minus p. The answer is p. So the mean of an indicator is the probability of its event, exactly.',
      keyword: 'E[I] = P(A)',
      trap: 'E[I] = P(A) is a definition-level identity, not an approximation.'
    },
    {
      id: 's3-3', scene: 'indicator', start: 75, end: 82.5,
      caption: 'A count of twelve events is the sum of twelve indicators.',
      detail: 'If X counts how many of twelve events occur, then X equals the sum of the twelve indicators. This is an identity on every outcome, not a statement in expectation: the number of ones in the row is the count.',
      narration: 'Suppose you want to know how many of twelve events happen. Write one indicator for each event and add them. The sum is the count, on every single outcome.',
      keyword: 'count = sum of indicators',
      trap: 'The identity is exact outcome by outcome. If it were only true on average, the next step would be circular.'
    },
    {
      id: 's3-4', scene: 'indicator', start: 82.5, end: 90,
      caption: 'So the expected count is the sum of twelve probabilities — no joint distribution.',
      detail: 'Applying linearity to the sum of indicators gives E[X] = the sum of the twelve probabilities. The joint distribution of the twelve events is never needed, which is why the method survives cases where that joint distribution is enormous.',
      narration: 'Now take the mean of the sum. It is the sum of the means, so it is the sum of the twelve probabilities. The joint distribution of twelve events is never written down, and never needed.',
      keyword: 'sum of probabilities',
      trap: 'You need each event probability separately, and you never need any pair probability. That is the economy the method buys.'
    },

    /* ---------- scene 4: fixed points ---------- */
    {
      id: 's4-1', scene: 'fixedpoints', start: 90, end: 97.5,
      caption: 'Shuffle n cards: a fixed point is a card that lands back in its own place.',
      detail: 'A permutation of n items is a random shuffle, each of the n! shuffles equally likely. A fixed point is a position i with permutation of i equal to i. The random variable counts the fixed points.',
      narration: 'Shuffle a deck. A fixed point is a card that comes back to its own position. The question is how many fixed points a random shuffle has, on average.',
      keyword: 'fixed point',
      trap: 'Fixed points are about positions, not values: a card back in its own slot, not the largest card anywhere.'
    },
    {
      id: 's4-2', scene: 'fixedpoints', start: 97.5, end: 105,
      caption: 'All 5040 shuffles of seven cards contain 5040 fixed points in total: one each.',
      detail: 'Enumerating the 5040 permutations of seven items and adding up their fixed points gives exactly 5040, so the average is 5040/5040 = 1. The same enumeration at n from 1 to 7 gives 1 every time.',
      narration: 'Enumerate all five thousand and forty shuffles of seven cards and add up their fixed points. The total is five thousand and forty. Divided by the number of shuffles, the average is exactly one.',
      keyword: '5040 / 5040 = 1',
      trap: 'The answer does not grow with n. A beginner expects the average to grow; it does not.'
    },
    {
      id: 's4-3', scene: 'fixedpoints', start: 105, end: 112.5,
      caption: 'By indicators: n events of probability 1/n, so the mean is n · (1/n) = 1 for all n.',
      detail: 'Let I(i) be 1 when position i is fixed. Each I(i) has probability 1/n because the image of i is uniform over the n positions. Linearity gives E = n times 1/n = 1, with no independence assumed and no enumeration needed.',
      narration: 'Here is the proof that works for every n. For each position, the probability that it is fixed is one over n. There are n positions, so the mean is n times one over n, which is one.',
      keyword: 'n × 1/n = 1',
      trap: 'The indicators are heavily dependent — if one position is fixed, another is slightly less likely. Linearity does not care.'
    },
    {
      id: 's4-4', scene: 'fixedpoints', start: 112.5, end: 120,
      caption: 'The n = 5 distribution: 44 shuffles have none, 45 have one, and four is impossible.',
      detail: 'Of the 120 permutations of five items, 44 have no fixed point, 45 have one, 20 have two, 10 have three, none has four and 1 has five. Exactly n−1 fixed points is impossible because the last element must also be fixed. The mean is still 1.',
      narration: 'Look at the distribution for five cards. Forty-four shuffles fix nothing, forty-five fix one, twenty fix two, ten fix three, and one fixes all five. Four fixed points never happens, because if four positions are right the fifth must be too.',
      keyword: 'n−1 fixed points is impossible',
      trap: 'A mean of 1 does not mean one fixed point is typical: 89 of the 120 shuffles have zero or one, and 44 have none at all.'
    },

    /* ---------- scene 5: inversions ---------- */
    {
      id: 's5-1', scene: 'inversions', start: 120, end: 127.5,
      caption: 'An inversion is a pair out of order: for n = 5 the average over 120 shuffles is 5.',
      detail: 'A permutation has an inversion at positions i < j when the value at i exceeds the value at j. Enumerating all 120 permutations of five items gives 600 inversions in total, so 5 per permutation.',
      narration: 'An inversion is a pair that is out of order. For five items there are one hundred and twenty orders, and six hundred inversions in total, so five per order on average.',
      keyword: 'inversion = pair out of order',
      trap: 'Counting inversions means counting pairs, not adjacent swaps only. Distant pairs count too.'
    },
    {
      id: 's5-2', scene: 'inversions', start: 127.5, end: 135,
      caption: 'Each of the C(n,2) pairs is inverted in exactly half the permutations.',
      detail: 'Fix two positions i < j. Of the n! permutations, exactly half place the larger value first, because swapping the two values is a bijection between the two halves. So each pair indicator has probability 1/2.',
      narration: 'Fix any two positions. In exactly half of all orders the larger value comes first, because swapping the two values pairs up the orders that do and the orders that do not.',
      keyword: 'probability 1/2',
      trap: 'The half-and-half argument needs the two values to be distinct. Equal keys make the probability depend on ties.'
    },
    {
      id: 's5-3', scene: 'inversions', start: 135, end: 142.5,
      caption: 'So the mean is C(n,2)/2 = n(n−1)/4, which is 5 at n = 5 and 3 at n = 4.',
      detail: 'There are n(n−1)/2 pairs, each contributing 1/2, so the expected number of inversions is n(n−1)/4. Enumeration agrees exactly at n from 2 to 7: 0.5, 1.5, 3, 5, 7.5, 10.5.',
      narration: 'There are n choose two pairs and each contributes one half. So the average number of inversions is n times n minus one, over four. Five items give five, four items give three.',
      keyword: 'n(n−1)/4',
      trap: 'The formula is a quarter, not a half: C(n,2) already carries the factor of one half from the pair count.'
    },
    {
      id: 's5-4', scene: 'inversions', start: 142.5, end: 150,
      caption: 'The pairs are dependent — one swap changes many — and linearity does not care.',
      detail: 'A single transposition can create or destroy several inversions at once, so the pair indicators are strongly dependent. Linear expectation still adds, which is why the argument needs no independence assumption.',
      narration: 'These pair indicators are not independent. Moving one element changes several pairs at once. And yet the means add, because that is all linearity ever promised.',
      keyword: 'dependent pairs, additive means',
      trap: 'Expecting the variance to add here is the trap: it does not, because the pairs are dependent.'
    },

    /* ---------- scene 6: hashing ---------- */
    {
      id: 's6-1', scene: 'hashing', start: 150, end: 157.5,
      caption: 'n keys into m slots, each key equally likely to land in any slot.',
      detail: 'Under simple uniform hashing each key is placed independently and uniformly into one of the m slots. Five slots and three keys give 125 equally likely assignments, which is small enough to enumerate.',
      narration: 'Hash n keys into m slots, each key equally likely to take any slot. Five slots and three keys give one hundred and twenty-five assignments, small enough to check every one.',
      keyword: 'n keys, m slots',
      trap: 'Uniform hashing is an assumption about the hash function, not a property of the keys.'
    },
    {
      id: 's6-2', scene: 'hashing', start: 157.5, end: 165,
      caption: 'One slot holds a sum of n indicators, so its expected load is n/m.',
      detail: 'For a fixed slot, let I(k) be 1 when key k lands there; each has probability 1/m. The load is the sum, so the expected load is n/m. For five slots and three keys that is 0.6, and enumerating all 125 assignments gives the same 0.6.',
      narration: 'Fix one slot. Each key lands there with probability one over m. The load is a sum of indicators, so the expected load is n over m. Three keys in five slots average zero point six per slot.',
      keyword: 'E[load] = n/m',
      trap: 'Expected load is not a load any slot need actually have. A slot holds 0 or 1 or 2 keys, never 0.6.'
    },
    {
      id: 's6-3', scene: 'hashing', start: 165, end: 172.5,
      caption: 'Each of the C(n,2) key pairs collides with probability 1/m, so E[collisions] = C(n,2)/m.',
      detail: 'A collision is a pair of keys in the same slot, which has probability 1/m. There are C(n,2) pairs, so the expected number of colliding pairs is C(n,2)/m. For n = 3 and m = 5 that is 3/5 = 0.6.',
      narration: 'Now count colliding pairs. Any two keys share a slot with probability one over m, and there are n choose two pairs. So the expected number of collisions is n choose two over m.',
      keyword: 'C(n,2)/m',
      trap: 'Collisions are counted as pairs, not as keys. Two keys in one slot is one collision, not two.'
    },
    {
      id: 's6-4', scene: 'hashing', start: 172.5, end: 180,
      caption: 'GATE 2022 used one hash function for odd keys and another for even: the answer stayed n/m.',
      detail: 'In GATE CSE 2022 question 16 the keys are split between two uniform hash functions. Each key still has probability 1/m of reaching a given slot, so the sum of n indicators is still n/m. The answer is n/m whichever function a key uses.',
      narration: 'GATE 2022 split the keys between two hash functions, one for odd keys and one for even. Each key still has probability one over m of reaching a slot, so the expected load is still n over m.',
      keyword: 'still n/m',
      trap: 'A question that looks like it needs a case split usually does not: check the per-key probability before splitting.'
    },

    /* ---------- scene 7: quicksort ---------- */
    {
      id: 's7-1', scene: 'quicksort', start: 180, end: 187.5,
      caption: 'Randomised quicksort compares each pair at most once, so count comparisons by pairs.',
      detail: 'Every comparison in quicksort is between a pivot and another element, and once an element is a pivot it is never compared again. So each unordered pair of keys is compared at most once, and the total is a sum of pair indicators.',
      narration: 'In quicksort every comparison is between a pivot and something else, and a pivot is never touched again. So each pair of keys is compared at most once, and the comparison count is a sum over pairs.',
      keyword: 'each pair at most once',
      trap: 'This is what makes the pair sum exact. In merge sort the same idea gives a different sum, because comparisons are not between arbitrary pairs.'
    },
    {
      id: 's7-2', scene: 'quicksort', start: 187.5, end: 195,
      caption: 'Keys i and j are compared exactly when the first pivot among them is one of the two.',
      detail: 'Consider the sorted ranks from i to j. If any interior key is chosen as a pivot before i or j, the two are separated and never compared. If i or j is chosen first, they are compared. So the pair is compared exactly when the first pivot from that range is one of its endpoints.',
      narration: 'Take two keys and look at everything between them in sorted order. If something in the middle is chosen as a pivot first, they are separated for good. If one of the two is chosen first, they are compared.',
      keyword: 'first pivot in the range',
      trap: 'The probability is not 1/2: it depends on how many keys lie between the pair.'
    },
    {
      id: 's7-3', scene: 'quicksort', start: 195, end: 202.5,
      caption: 'That probability is 2/(j−i+1), and summing over pairs gives 2(n+1)H(n) − 4n.',
      detail: 'The first pivot from a range of j−i+1 keys is uniform in that range, so the probability it is one of the two endpoints is 2/(j−i+1). Summing over all pairs gives the exact expectation 2(n+1)H(n) − 4n, where H(n) is the harmonic number.',
      narration: 'Among j minus i plus one keys the first pivot is uniform, so the chance it is an endpoint is two over that count. Add over all pairs and the exact expectation is two n plus one times the harmonic number, minus four n.',
      keyword: '2(n+1)H(n) − 4n',
      trap: 'The exact form has both terms. Dropping the −4n overstates the count by about 4n comparisons.'
    },
    {
      id: 's7-4', scene: 'quicksort', start: 202.5, end: 210,
      caption: 'At n = 10 the exact expectation is 24.44 comparisons, under the 2n ln n = 46.05 bound.',
      detail: 'With H(10) = 2.928968 the formula gives 2 × 11 × 2.928968 − 40 = 24.4373. The same value comes from the recurrence E(n) = (n−1) + (2/n) times the sum of E(k) for k below n, computed here for every n up to 120 with no discrepancy.',
      narration: 'For ten keys the harmonic number is two point nine three, and the formula gives twenty-four point four four comparisons. The recurrence gives the same number to every decimal place, and both sit under the two n log n bound.',
      keyword: '24.44 comparisons',
      trap: 'Expected O(n log n) is a class; the question usually wants the number. Compute the exact sum for small n.'
    },

    /* ---------- scene 8: where linearity stops ---------- */
    {
      id: 's8-1', scene: 'variance', start: 210, end: 217.5,
      caption: 'Linearity is a property of the mean only. Variance does not inherit it.',
      detail: 'Expectation is a linear functional: it commutes with addition and with scaling by constants. Variance is quadratic in the values, so it does not commute with addition unless a covariance term vanishes.',
      narration: 'Linearity is a statement about the mean and nothing else. Variance is built from squares, and squares do not distribute over sums.',
      keyword: 'mean only',
      trap: 'Writing Var(X+Y) = Var(X) + Var(Y) without saying why is the classic lost mark.'
    },
    {
      id: 's8-2', scene: 'variance', start: 217.5, end: 225,
      caption: 'Var(X+Y) = Var X + Var Y + 2Cov(X,Y); independence removes only the last term.',
      detail: 'Expanding the square of the sum gives the two variances plus twice the covariance. Independence makes the covariance zero. Positive dependence makes it positive, which is why the variance of a dependent sum is larger.',
      narration: 'The variance of a sum is the two variances plus twice the covariance. Independence sets the covariance to zero. Positive dependence makes it positive, so the sum is more spread out than independence would suggest.',
      keyword: 'covariance term',
      trap: 'Uncorrelated is weaker than independent, but it is enough to kill this particular term.'
    },
    {
      id: 's8-3', scene: 'variance', start: 225, end: 232.5,
      caption: 'With X = Y the sum is 2X, so the variance is 4 times Var X = 11.67, not 5.83.',
      detail: 'A fair die has variance 35/12 = 2.9167. For two independent dice the sum has variance 5.8333. For X = Y the sum is 2X, whose variance is 4 times 2.9167 = 11.6667, exactly twice the independent case.',
      narration: 'A fair die has variance two point nine two. Two independent dice sum to variance five point eight three. But copying the die doubles it, and the variance of twice X is four times two point nine two, eleven point six seven.',
      keyword: '4 × 2.9167 = 11.67',
      trap: 'The mean was 7 in both cases. Only the variance tells the two situations apart, which is why the mean alone is not a summary.'
    },
    {
      id: 's8-4', scene: 'variance', start: 232.5, end: 240,
      caption: 'And the mean of a function is not the function of the mean: E[1/X] = 0.408, 1/E[X] = 0.286.',
      detail: 'For a fair die, the mean of the reciprocal is (1 + 1/2 + 1/3 + 1/4 + 1/5 + 1/6)/6 = 49/120 = 0.4083, while the reciprocal of the mean is 1/3.5 = 0.2857. By Jensen, for a convex function the mean of the function exceeds the function of the mean.',
      narration: 'Averaging the reciprocal of a die is not the reciprocal of the average. The first is zero point four one, the second is zero point two nine. Averages commute with sums, not with curves.',
      keyword: 'E[1/X] ≠ 1/E[X]',
      trap: 'Every quantity of the form E of a function must be computed from the distribution, never by substituting the mean.'
    },

    /* ---------- scene 9: the tail sum ---------- */
    {
      id: 's9-1', scene: 'tailsum', start: 240, end: 247.5,
      caption: 'For a non-negative integer variable there is a second route: add the tail probabilities.',
      detail: 'If X takes values 0, 1, 2 and so on, then E[X] equals the sum over k from 1 upward of the probability that X is at least k. This is the tail-sum or layer-cake identity, and it is a reordering of the same double sum.',
      narration: 'There is a second way to average a non-negative whole-number variable. Instead of weighting values, add up the probabilities of being at least one, at least two, at least three, and so on.',
      keyword: 'sum of tail probabilities',
      trap: 'The identity needs non-negative integers. For a variable that can be negative or fractional it does not hold as written.'
    },
    {
      id: 's9-2', scene: 'tailsum', start: 247.5, end: 255,
      caption: 'Each value k is counted exactly k times, which is why the two sums agree.',
      detail: 'An outcome with X equal to k contributes to the first k tail events, so it is counted k times, which is exactly its weight in the mean. Reordering a sum of non-negative terms is always legal, so no convergence subtlety arises.',
      narration: 'An outcome with value k is counted in the first k of those tail probabilities, so it is counted exactly k times. That is precisely its weight in the average, and the two routes coincide.',
      keyword: 'counted k times',
      trap: 'This is where the non-negativity is used: reordering a sum with negative terms is not free.'
    },
    {
      id: 's9-3', scene: 'tailsum', start: 255, end: 262.5,
      caption: 'Larger of two dice: 1 + 35/36 + 32/36 + 27/36 + 20/36 + 11/36.',
      detail: 'The maximum is at least 1 always, at least 2 unless both dice show 1, at least 3 unless both are at most 2, and so on. Each term is 1 minus the square of (k−1)/6.',
      narration: 'For the larger of two dice the tails are one, thirty-five over thirty-six, thirty-two over thirty-six, twenty-seven over thirty-six, twenty over thirty-six and eleven over thirty-six.',
      keyword: 'six tail terms',
      trap: 'The first term is 1, not 0: the maximum is always at least 1. Omitting it loses a whole unit.'
    },
    {
      id: 's9-4', scene: 'tailsum', start: 262.5, end: 270,
      caption: 'That sum is 161/36 = 4.472, and the 36-outcome average agrees exactly.',
      detail: 'The six tail terms sum to 161/36 = 4.4722, and averaging the maximum over all 36 ordered pairs gives the same rational number. Two independent computations of the same quantity, agreeing to the last digit.',
      narration: 'Those six terms add to one hundred and sixty-one over thirty-six, four point four seven. Averaging the larger face over all thirty-six pairs gives the same number exactly.',
      keyword: '161/36 = 4.472',
      trap: 'A mean of 4.472 for a variable that only takes whole values is normal; do not round it to 4 or 5 without being asked.'
    },

    /* ---------- scene 10: procedure and traps ---------- */
    {
      id: 's10-1', scene: 'procedure', start: 270, end: 277.5,
      caption: 'Write the quantity as a sum of indicators. That is the whole procedure.',
      detail: 'Name the unit being counted — pairs, positions, slots, comparisons — then write one indicator per unit. The count is their sum by an identity, so the mean is the sum of their probabilities by linearity.',
      narration: 'Here is the procedure. Decide what you are counting, in units: pairs, positions, slots or comparisons. Write one indicator per unit. The count is their sum, so the mean is the sum of their probabilities.',
      keyword: 'one indicator per unit',
      trap: 'Choosing the wrong unit is the real difficulty. Pairs and positions give different sums, and only one matches the quantity asked.'
    },
    {
      id: 's10-2', scene: 'procedure', start: 277.5, end: 285,
      caption: 'Ask of each indicator only: what is the probability of its event?',
      detail: 'The second step is always the same question, asked once per indicator. No pair of indicators is ever examined, so no joint distribution and no independence check is required at any point.',
      narration: 'Then ask one question of each indicator: what is the probability of its event? That is all. You never examine two indicators together, so you never need a joint distribution.',
      keyword: 'only the marginal probability',
      trap: 'Students often try to compute a joint probability out of habit and then get stuck. It is never needed for the mean.'
    },
    {
      id: 's10-3', scene: 'procedure', start: 285, end: 292.5,
      caption: 'Trap: thinking independence is needed. Trap: applying linearity to variance or to products.',
      detail: 'The two mistakes that cost marks are assuming the method needs independence, and extending it to quantities where it fails: variance of a sum, and the mean of a product. Linearity covers sums of expectations only.',
      narration: 'Two traps. Believing the method needs independence, which it does not. And extending it to variance or to a product, where it is simply false.',
      keyword: 'not variance, not products',
      trap: 'If the option says Var(X+Y) = Var(X) + Var(Y) with no independence hypothesis, it is false.'
    },
    {
      id: 's10-4', scene: 'procedure', start: 292.5, end: 300,
      caption: 'Trap: rejecting a fractional answer. An expected count need not be a count.',
      detail: 'A mean of 0.6 keys per slot, or 3.5 from a die, is a perfectly good expectation. Options are eliminated on reasoning, never on the grounds that the number is not attainable or not an integer.',
      narration: 'And the third trap: rejecting an answer because it is not a whole number. Zero point six keys per slot is a normal mean. Expectations live between the values, not among them.',
      keyword: 'fractional means are normal',
      trap: 'Never eliminate an option for being fractional or unattainable; eliminate it for being wrong.'
    }
  ]
};
