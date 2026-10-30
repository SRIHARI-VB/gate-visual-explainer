/* ==========================================================================
   area-between-curves-and-net-change — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   captions.vtt, captions.srt and transcript.md are generated from this file by
   tools/gen-captions.mjs — never edited by hand.

   Every number quoted in a caption is computed by the model in lesson.js and
   printed on the canvas: the signed integral of x squared minus 2x over 0 to 3
   (0.000000 against a geometric 2.666667), the area between y = x and y = x
   squared (0.166667), the area between y = x squared and y = 2x + 3 with its
   crossings at -1 and 3 (10.666667), the two slicings of one region (0.333333
   each way), the difference quotients 1.583333, 1.103333, 1.010033, 1.001000, the
   displacement 1.333333 against a distance travelled of 4.000000, the average
   value of sine over 0 to pi (0.636620) with its two points 0.690107 and
   2.451486, the exponential probability 0.383400, the normal probability
   0.682689, and a rate integral of 12.566371 whose average is 2.000000.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'signed', n: 1,
      title: 'Signed area is not geometric area',
      start: 0, end: 30,
      objective: 'Separate the two questions a definite integral can be asked: the signed total, where pieces below the axis count negative, and the geometric area of the same region, where they do not. Settle it on one function that crosses the axis twice.'
    },
    {
      id: 'between', n: 2,
      title: 'Area between two curves is one difference',
      start: 30, end: 60,
      objective: 'Show that the area between an upper and a lower curve is the integral of upper minus lower, that the crossings decide where to stop and start, and that the same rule covers a region whose curves swap order.'
    },
    {
      id: 'slicing', n: 3,
      title: 'Choose the variable, then check the answer did not change',
      start: 60, end: 90,
      objective: 'Slice the same region vertically and horizontally, see that the second slicing needs a curve read backwards as x of y, and use the agreement of the two answers as a check rather than as an assumption.'
    },
    {
      id: 'accumulation', n: 4,
      title: 'The accumulation function and its derivative',
      start: 90, end: 120,
      objective: 'Treat the integral with a moving upper limit as a function in its own right, see its difference quotient fall onto the integrand as the step shrinks, and understand why a constant added to it changes the level but not the rate.'
    },
    {
      id: 'netchange', n: 5,
      title: 'Net change: integrating a rate',
      start: 120, end: 150,
      objective: 'Read the integral of a rate as the net change in the quantity, and separate it from the total amount travelled when the rate changes sign. One velocity curve, two different answers, both correct for their question.'
    },
    {
      id: 'average', n: 6,
      title: 'Average value and where it is attained',
      start: 150, end: 180,
      objective: 'Define the average value of a function over an interval, see it as the height of the rectangle with the same area, and find the points the mean value theorem promises — including a case where there are two of them.'
    },
    {
      id: 'probability', n: 7,
      title: 'Probability is an area',
      start: 180, end: 210,
      objective: 'Read a probability as the area under a density between two points, equal to a difference of two values of the distribution function, and check the exponential, uniform and normal cases against closed forms.'
    },
    {
      id: 'rates', n: 8,
      title: 'Areas under rate graphs elsewhere in the syllabus',
      start: 210, end: 240,
      objective: 'Carry the same three readings — total, average, and probability — into a rate graph that is not a physics curve, and see that total is the area, average is the area over the width, and a utilisation is the average of an indicator.'
    },
    {
      id: 'traps', n: 9,
      title: 'The four errors that produce the wrong option',
      start: 240, end: 270,
      objective: 'Name the four mistakes that generate plausible wrong answers: signed for geometric, a missed crossing, a missing width divisor, and the wrong variable — plus the two sanity checks that catch them in seconds.'
    },
    {
      id: 'exam', n: 10,
      title: 'Reading the question',
      start: 270, end: 300,
      objective: 'Turn the topic into a decision procedure: classify the item into one of five types, apply the matching first move, and bound the answer before committing to an option.'
    }
  ],

  events: [
    /* ---------- scene 1: signed ---------- */
    {
      id: 's1a', start: 0, end: 7.5, scene: 'signed',
      caption: 'An integral counts area below the axis as negative.',
      detail: 'The definite integral adds up height times width with the sign of the height attached. Above the axis a strip contributes positively, below the axis negatively. That sign is part of the definition, not a convention layered on afterwards, and it is why the integral of a function that dips below the axis can be smaller than the region it encloses.',
      narration: 'A strip above the axis counts positive, a strip below it counts negative.',
      keyword: 'negative'
    },
    {
      id: 's1b', start: 7.5, end: 15, scene: 'signed',
      caption: 'x squared minus 2x is below the axis between 0 and 2, above it after 2.',
      detail: 'Factor the integrand: x squared minus 2x equals x times x minus 2, so it is zero at 0 and at 2. Between those two points the product of a positive and a negative factor is negative, so the curve lies below the axis. After 2 both factors are positive and the curve rises above it.',
      narration: 'The curve crosses at 0 and 2, and spends the interval between them below the axis.',
      keyword: 'crosses at 0 and 2'
    },
    {
      id: 's1c', start: 15, end: 22.5, scene: 'signed',
      caption: 'The two pieces cancel: minus 4/3 plus 4/3 is 0.',
      detail: 'From 0 to 2 the integral is minus four thirds, about minus 1.333333. From 2 to 3 it is plus four thirds, about 1.333333. Their sum is zero, so the signed integral over the whole interval from 0 to 3 is zero even though the region is not empty.',
      narration: 'Minus four thirds and plus four thirds cancel, so the signed total is zero.',
      keyword: 'cancel',
      trap: 'A zero answer does not mean the region has no area. It means the signed contributions balanced. Read what the question asked for before concluding anything from the zero.'
    },
    {
      id: 's1d', start: 22.5, end: 30, scene: 'signed',
      caption: 'The geometric area of the same region is 8/3, about 2.666667.',
      detail: 'Geometric area discards the sign: take the absolute value of each piece before adding. Four thirds plus four thirds is eight thirds. Two questions, one function, two different numbers — and the exam supplies both as options.',
      narration: 'Absolute value each piece and the area is eight thirds. Two questions, two answers.',
      keyword: '8/3',
      trap: 'The words that decide which question is being asked are "the integral of" against "the area enclosed". They are not interchangeable.'
    },

    /* ---------- scene 2: between ---------- */
    {
      id: 's2a', start: 30, end: 37.5, scene: 'between',
      caption: 'Between two curves, integrate the upper one minus the lower one.',
      detail: 'At each x the strip runs from the lower curve up to the upper one, so its height is upper minus lower and its width is dx. Adding the strips gives the area directly. There is no absolute value to worry about as long as you know which curve is on top.',
      narration: 'The strip height is upper minus lower, so the area is the integral of that difference.',
      keyword: 'upper minus lower'
    },
    {
      id: 's2b', start: 37.5, end: 45, scene: 'between',
      caption: 'On 0 to 1, y equals x sits above y equals x squared.',
      detail: 'Both curves pass through 0 and 1, and between those points a number between 0 and 1 is larger than its square. So the strip height is x minus x squared, whose integral is one half minus one third, which is one sixth, about 0.166667.',
      narration: 'x above x squared on that interval gives one sixth.',
      keyword: 'one sixth'
    },
    {
      id: 's2c', start: 45, end: 52.5, scene: 'between',
      caption: 'Find the crossings first: they are the limits.',
      detail: 'For y equals x squared and y equals 2x plus 3, set them equal: x squared equals 2x plus 3, so x squared minus 2x minus 3 is zero, which factors as x minus 3 times x plus 1. The crossings are minus 1 and 3, and they are the limits of the integral.',
      narration: 'Set the curves equal, factor, and the crossings become the limits.',
      keyword: 'crossings',
      trap: 'The limits are not given by the question wording; they are computed. Taking 0 to 3 because 3 appears in the algebra drops the part of the region left of the axis.'
    },
    {
      id: 's2d', start: 52.5, end: 60, scene: 'between',
      caption: 'The area is 32/3, about 10.666667.',
      detail: 'The line is above the parabola throughout, so the integral of 2x plus 3 minus x squared from minus 1 to 3 is evaluated directly: the antiderivative is x squared plus 3x minus x cubed over 3, which gives 9 at 3 and minus five thirds at minus 1, a difference of thirty-two thirds.',
      narration: 'Thirty-two thirds, about ten point six seven.',
      keyword: '32/3'
    },

    /* ---------- scene 3: slicing ---------- */
    {
      id: 's3a', start: 60, end: 67.5, scene: 'slicing',
      caption: 'The same region can be sliced two ways.',
      detail: 'Vertical strips integrate with respect to x, using the height upper minus lower. Horizontal strips integrate with respect to y, using the width right minus left. Both describe the same region, so both must give the same number. That agreement is a check on the setup, not a coincidence.',
      narration: 'Vertical strips or horizontal strips: same region, same area.',
      keyword: 'two ways'
    },
    {
      id: 's3b', start: 67.5, end: 75, scene: 'slicing',
      caption: 'A horizontal slice needs a curve read backwards, as x of y.',
      detail: 'The region between y equals x squared and y equals the square root of x can be read horizontally only if each curve is rewritten with x alone on one side. y equals x squared becomes x equals the square root of y on the right, and y equals the square root of x becomes x equals y squared on the left.',
      narration: 'Read the curves backwards: x as a function of y.',
      keyword: 'backwards',
      trap: 'The inverse of y equals x squared on the whole line does not exist, because the function is not one to one. On this region only the right branch is used, which is why the square root appears without a plus or minus.'
    },
    {
      id: 's3c', start: 75, end: 82.5, scene: 'slicing',
      caption: 'Vertical slicing gives 1/3.',
      detail: 'The square root of x is above x squared between 0 and 1, and the integral of the difference is two thirds minus one third, which is one third, about 0.333333.',
      narration: 'Vertical: one third.',
      keyword: '1/3'
    },
    {
      id: 's3d', start: 82.5, end: 90, scene: 'slicing',
      caption: 'Horizontal slicing gives 1/3 as well.',
      detail: 'The integral with respect to y of the square root of y minus y squared, from 0 to 1, is again two thirds minus one third. The two numbers agree to the last digit the page computes, which is what a correct setup looks like.',
      narration: 'Horizontal: one third as well. The agreement is the check.',
      keyword: 'agree',
      trap: 'Agreement proves the two integrals describe the same region. It does not prove the region was the one the question asked for, so read the bounding curves again.'
    },

    /* ---------- scene 4: accumulation ---------- */
    {
      id: 's4a', start: 90, end: 97.5, scene: 'accumulation',
      caption: 'With a moving upper limit the integral becomes a function.',
      detail: 'Fix the lower limit at a and let the upper limit be the variable x. The integral from a to x of f is then a function of x, called the accumulation function: it reports how much area has been gathered so far, counted with sign.',
      narration: 'Let the top limit move and the integral becomes a function of where you stopped.',
      keyword: 'accumulation function'
    },
    {
      id: 's4b', start: 97.5, end: 105, scene: 'accumulation',
      caption: 'Its difference quotient falls onto the integrand.',
      detail: 'At x equal to 1 with the integrand x squared, a step of 0.5 gives a quotient of 1.583333, a step of 0.1 gives 1.103333, a step of 0.01 gives 1.010033 and a step of 0.001 gives 1.001000. The excess falls from 0.583333 to 0.001000, roughly tenfold for each tenfold shrink of the step once the step is small, and the limit is 1, which is the integrand at that point.',
      narration: 'Shrink the step and the quotient lands on the height of the curve.',
      keyword: 'difference quotient'
    },
    {
      id: 's4c', start: 105, end: 112.5, scene: 'accumulation',
      caption: 'The derivative of the accumulated area is the current height.',
      detail: 'That is the first half of the fundamental theorem. It says the accumulation function grows at a rate equal to the height of the curve at the point where the top limit currently sits. Area accumulated is not a static total; it has a rate, and the rate is the integrand.',
      narration: 'The rate at which area accumulates is the height of the curve.',
      keyword: 'rate',
      trap: 'The statement needs the integrand continuous at that point. Where the integrand jumps, the accumulation function is still continuous but has a corner, and a question can ask exactly that.'
    },
    {
      id: 's4d', start: 112.5, end: 120, scene: 'accumulation',
      caption: 'Adding a constant changes the level, never the rate.',
      detail: 'Two accumulation functions that differ by a constant have the same derivative, because the constant contributes nothing to a difference. That is the reason an indefinite integral carries a plus C and a definite one does not: the constant cancels in the subtraction F of b minus F of a.',
      narration: 'A constant shifts the level. It cannot change a rate, so it cancels in a definite integral.',
      keyword: 'constant'
    },

    /* ---------- scene 5: netchange ---------- */
    {
      id: 's5a', start: 120, end: 127.5, scene: 'netchange',
      caption: 'Integrating a rate gives the net change, not the total activity.',
      detail: 'If f is a rate of change, measured per unit of the variable, then the integral of the rate over an interval is the net change in the quantity over that interval. Net means end value minus start value. It does not count how much happened in each direction.',
      narration: 'The integral of a rate is the net change in the quantity.',
      keyword: 'net change'
    },
    {
      id: 's5b', start: 127.5, end: 135, scene: 'netchange',
      caption: 'This velocity is negative in the middle of the interval.',
      detail: 'Take the velocity t squared minus 4t plus 3, which factors as t minus 1 times t minus 3. It is positive from 0 to 1, negative from 1 to 3, and positive again from 3 to 4. The moving object goes forward, then backward, then forward.',
      narration: 'Positive, then negative, then positive again: forward, backward, forward.',
      keyword: 'negative',
      trap: 'A velocity that changes sign does not mean the object stopped permanently at those points. It means the direction reversed at that instant, and the position is still continuous.'
    },
    {
      id: 's5c', start: 135, end: 142.5, scene: 'netchange',
      caption: 'The three pieces are 4/3, minus 4/3 and 4/3, so the displacement is 4/3.',
      detail: 'Each piece integrates to four thirds in magnitude, with the middle one negative. The signed total, which is the displacement, is four thirds, about 1.333333: the object ends slightly to the right of where it started.',
      narration: 'The signed total is four thirds. That is the displacement.',
      keyword: 'displacement'
    },
    {
      id: 's5d', start: 142.5, end: 150, scene: 'netchange',
      caption: 'Distance travelled takes absolute values, and comes to 4.',
      detail: 'Three pieces of four thirds each, all counted positively, give four. The distance travelled is four, about three times the displacement, because most of the motion was undone. Both numbers are right; they answer different questions.',
      narration: 'Distance counts every piece positively and comes to four.',
      keyword: 'distance',
      trap: 'The two answers differ by a factor of three here, which is why both appear in an option list. The deciding word is displacement against distance, or net change against total.'
    },

    /* ---------- scene 6: average ---------- */
    {
      id: 's6a', start: 150, end: 157.5, scene: 'average',
      caption: 'The average value of a function is its integral over the width.',
      detail: 'For a list of numbers the average is the sum divided by the count. For a function the sum becomes an integral and the count becomes the width of the interval, so the average value is one over b minus a times the integral from a to b.',
      narration: 'Average value is the integral divided by the width of the interval.',
      keyword: 'divided by the width'
    },
    {
      id: 's6b', start: 157.5, end: 165, scene: 'average',
      caption: 'It is the height of the rectangle with the same area.',
      detail: 'Draw a rectangle over the same interval with height equal to the average value. Its area equals the integral of the function, because height times width reproduces exactly the quantity that was divided by the width. The average value is therefore a horizontal line that balances the area.',
      narration: 'A rectangle of that height has the same area as the region.',
      keyword: 'same area'
    },
    {
      id: 's6c', start: 165, end: 172.5, scene: 'average',
      caption: 'For sine over 0 to pi the average is 2 over pi, about 0.636620.',
      detail: 'The integral of sine from 0 to pi is 2, and the width is pi, so the average value is 2 over pi. Notice it is not the midpoint height, which is 1, and it is not the average of the endpoint values, which is 0. A curve that spends time near its peak still has to share the width with the flat parts.',
      narration: 'Two over pi, about zero point six three six six two.',
      keyword: '2 over pi',
      trap: 'Averaging the two endpoint values is the commonest wrong method, and here it gives zero. The trapezoid rule averages endpoints to estimate an integral; that is a different quantity from the average value of the function.'
    },
    {
      id: 's6d', start: 172.5, end: 180, scene: 'average',
      caption: 'Two points attain it: 0.690107 and 2.451486.',
      detail: 'The mean value theorem for integrals guarantees at least one point where the function equals its average, given continuity. Here there are two, because sine is symmetric about the middle of the interval and reaches 2 over pi on the way up and again on the way down. The theorem promises existence, not uniqueness.',
      narration: 'Two points, not one. The theorem promises existence, not uniqueness.',
      keyword: 'not uniqueness',
      trap: 'Solving for the point and finding two answers is not an error. Stopping after the first is, if the question asked for all of them.'
    },

    /* ---------- scene 7: probability ---------- */
    {
      id: 's7a', start: 180, end: 187.5, scene: 'probability',
      caption: 'A probability is an area under a density.',
      detail: 'For a continuous random variable the probability that it lands between a and b is the integral of the density from a to b. The density is non-negative and its total integral over the whole line is 1, so every probability is a piece of an area of one.',
      narration: 'Probability between two points is the area under the density between them.',
      keyword: 'area under a density'
    },
    {
      id: 's7b', start: 187.5, end: 195, scene: 'probability',
      caption: 'That area is a difference of two values of the distribution function.',
      detail: 'The distribution function at x is the accumulation function of the density from minus infinity to x. So the probability of an interval is F of b minus F of a — the same subtraction that turned an area into an antiderivative evaluation. This is the topic of the previous scene, used again.',
      narration: 'It is F of b minus F of a, the accumulation function read twice.',
      keyword: 'F of b minus F of a'
    },
    {
      id: 's7c', start: 195, end: 202.5, scene: 'probability',
      caption: 'Exponential with rate 0.5: the probability between 1 and 3 is 0.383400.',
      detail: 'The exponential density with rate one half has distribution function one minus e to the minus x over two. At 3 and at 1 the difference is e to the minus one half minus e to the minus three halves, which is about 0.383400. The model gets the same number by quadrature.',
      narration: 'Zero point three eight three four zero, by two independent routes.',
      keyword: '0.383400',
      trap: 'Subtracting the densities rather than the distribution functions gives the wrong number, because a density is not a probability. Only its integral is.'
    },
    {
      id: 's7d', start: 202.5, end: 210, scene: 'probability',
      caption: 'Normal between minus 1 and 1 is 0.682689; uniform between 1 and 3 is 0.5.',
      detail: 'The standard normal probability between minus one and one equals the error function at one over the square root of two, about 0.682689, and the model matches it by quadrature. A uniform density on 0 to 4 has constant height one quarter, so the area from 1 to 3 is two quarters, exactly one half.',
      narration: 'Zero point six eight two six eight nine for the normal, exactly one half for the uniform.',
      keyword: '0.682689',
      trap: 'A uniform density whose height looks small can still carry a large probability, because the probability is height times width. Reading the height as the probability is the error.'
    },

    /* ---------- scene 8: rates ---------- */
    {
      id: 's8a', start: 210, end: 217.5, scene: 'rates',
      caption: 'The same three readings work on any rate graph.',
      detail: 'A rate of two plus sine of t, in megabytes per second, is not a physics curve but the arithmetic is identical: the total transferred over an interval is the area under the rate, the average rate is that area divided by the duration, and a fraction of time is the average of a function that is 1 while busy and 0 while idle.',
      narration: 'Total is the area, average is the area over the width, a fraction is an average of ones and zeros.',
      keyword: 'any rate graph'
    },
    {
      id: 's8b', start: 217.5, end: 225, scene: 'rates',
      caption: 'Over 0 to 2 pi the total is 4 pi, about 12.566371.',
      detail: 'The integral of two is 4 pi over that interval, and the integral of sine over a whole period is zero, because the positive and negative halves cancel. So the total is 4 pi, about 12.566371 megabytes, and the sine part contributes nothing to the total.',
      narration: 'Four pi, because the sine contributes nothing over a full period.',
      keyword: '4 pi'
    },
    {
      id: 's8c', start: 225, end: 232.5, scene: 'rates',
      caption: 'The average rate is exactly 2.',
      detail: 'Divide 4 pi by the width 2 pi and the answer is 2, which is the constant part of the rate. That is a general and useful fact: a sinusoid added to a constant changes the shape of the graph and the instantaneous rate, but not the average over a whole number of periods.',
      narration: 'Four pi over two pi is two. The ripple averages away.',
      keyword: 'exactly 2',
      trap: 'Averaging over half a period does not remove the sine term. The cancellation needs a whole number of periods, and the interval is part of the question.'
    },
    {
      id: 's8d', start: 232.5, end: 240, scene: 'rates',
      caption: 'An average of ones and zeros is a fraction of time.',
      detail: 'Write a function that is 1 whenever a device is busy and 0 whenever it is idle. Its average value over an interval is the busy time divided by the total time, which is exactly the utilisation. So utilisation is an average value, and it is computed by the same division by the width.',
      narration: 'Utilisation is the average of an indicator, which is a fraction of time.',
      keyword: 'fraction of time',
      trap: 'This is an educational reading of the arithmetic, not a syllabus formula. The syllabus names performance metrics without prescribing this derivation, so treat it as a way to remember the arithmetic.'
    },

    /* ---------- scene 9: traps ---------- */
    {
      id: 's9a', start: 240, end: 247.5, scene: 'traps',
      caption: 'Trap one: the signed integral offered where the area was asked for.',
      detail: 'On x squared minus 2x over 0 to 3 the two numbers are 0 and 2.666667. An option list containing both is testing the reading of the question, not the integration. Look for the words "the integral of" against "the area enclosed by".',
      narration: 'Zero and two point six six six seven. Which one the question asked for is the whole question.',
      keyword: 'signed against geometric'
    },
    {
      id: 's9b', start: 247.5, end: 255, scene: 'traps',
      caption: 'Trap two: a crossing that was not used to split the integral.',
      detail: 'For y equals x cubed and y equals x over minus 1 to 1, the signed integral is zero because the pieces cancel, while the enclosed area is one half. A solution that never splits at the crossing reports zero and moves on, and the options make that comfortable.',
      narration: 'Zero against one half. The crossing had to be used.',
      keyword: 'split at the crossing',
      trap: 'Splitting at every crossing is required only for geometric area. For the signed integral the crossings are irrelevant, so the same question can want either behaviour.'
    },
    {
      id: 's9c', start: 255, end: 262.5, scene: 'traps',
      caption: 'Trap three: the width divisor left out of an average value.',
      detail: 'The integral of sine from 0 to pi is 2, and the average value is 2 over pi. Reporting 2 is the integral, not the average, and 1 is the height at the midpoint. Three different numbers from one function, and only one answers the question as asked.',
      narration: 'Two is the integral, two over pi is the average, one is the peak.',
      keyword: 'width divisor'
    },
    {
      id: 's9d', start: 262.5, end: 270, scene: 'traps',
      caption: 'Trap four: the wrong variable, or limits left in the old one.',
      detail: 'Slicing horizontally means the differential is dy and the limits are y values, with each curve written as x of y. Mixing an x limit with a dy integral produces a number that looks reasonable and is wrong. The two sanity checks that catch most of these: an area is never negative, and a probability never exceeds one.',
      narration: 'Match the differential to the limits, then check that an area is not negative.',
      keyword: 'match the differential',
      trap: 'A negative answer to an area question is always an error, never a sign convention, because geometric area is defined with absolute values.'
    },

    /* ---------- scene 10: exam ---------- */
    {
      id: 's10a', start: 270, end: 277.5, scene: 'exam',
      caption: 'First name the type: one of five.',
      detail: 'An item on this topic asks one of five things: a signed integral, a geometric area, an area between two curves, a net change from a rate, an average value, or a probability as an area. Each type has a different first move, and naming the type prevents most wasted work.',
      narration: 'Signed, geometric, between curves, net change, average, or probability. Name it first.',
      keyword: 'five types',
      trap: 'An item that mentions a density is a probability item even if it is dressed as an area-between-curves item. The reading comes first, the technique second.'
    },
    {
      id: 's10b', start: 277.5, end: 285, scene: 'exam',
      caption: 'For an area, find the crossings before the antiderivative.',
      detail: 'Set the two curves equal and solve. Those solutions are the limits, and they also tell you where the integrand changes sign, which decides whether the area needs splitting. Doing this first converts the problem into one or more ordinary definite integrals with known limits.',
      narration: 'Crossings first: they are the limits and the split points.',
      keyword: 'crossings first'
    },
    {
      id: 's10c', start: 285, end: 292.5, scene: 'exam',
      caption: 'For a rate, ask net change or total before integrating.',
      detail: 'Net change is the signed integral and needs nothing extra. Total needs the absolute value, which means splitting at every zero of the rate and adding the magnitudes. Deciding which is wanted before integrating saves the whole second computation when the answer is the net change.',
      narration: 'Net change is signed. Total needs absolute values and a split at every zero.',
      keyword: 'net or total',
      trap: 'The word "total" in a question about a rate is the signal for absolute values. The word "displacement" or "net" is the signal for the signed integral.'
    },
    {
      id: 's10d', start: 292.5, end: 300, scene: 'exam',
      caption: 'Bound the answer before you look at the options.',
      detail: 'An area between two curves is at most the widest gap times the width. A probability is between 0 and 1. An average value lies between the minimum and maximum of the function. These bounds eliminate impossible options in seconds and catch a sign or a divisor error before it is committed.',
      narration: 'Bound it first: area under the gap times the width, probability within zero and one.',
      keyword: 'bound the answer',
      trap: 'The bound rules out impossible answers only. It says nothing about whether a plausible one is right, so the arithmetic still has to be done.'
    }
  ]
};
