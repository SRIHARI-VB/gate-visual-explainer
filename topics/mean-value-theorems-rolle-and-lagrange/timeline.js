/* ==========================================================================
   mean-value-theorems-rolle-and-lagrange — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   captions.vtt, captions.srt and transcript.md are generated from this file by
   tools/gen-captions.mjs — never edited by hand.

   Every number quoted in a caption is computed by the model in lesson.js and
   printed on the canvas: the chord slope 2 on x squared over 0 to 2 with its
   point c = 1; Rolle on x squared minus 4x plus 3 over 1 to 3 with c = 2; the
   absolute value on minus 1 to 1 whose derivative is never 0; root x over 0 to 1
   with c = 0.25; the two points plus and minus 0.577350 of x cubed minus x; the
   sine difference 0.567689 against the gap 1.8 and its point 1.249936; the
   exponential point 0.541325; root 101 trapped between 10.049751 and 10.05; the
   Cauchy ratio 3/7 with c = 14/9 = 1.555556 against 1.5 and 1.527525 from the two
   separate theorems; the zeros of x cubed minus 3x plus 1 at minus 1.879385,
   0.347296 and 1.532089 separated by minus 1 and 1; and the two mean value
   theorems on x squared over 0 to 2 with points 1 and 1.154701.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'chord', n: 1,
      title: 'A chord, a tangent, and the point between them',
      start: 0, end: 30,
      objective: 'State Lagrange\u2019s mean value theorem, see the chord whose slope is the average rate of change, and watch the tangent at the guaranteed point become parallel to it. One number, computed.'
    },
    {
      id: 'rolle', n: 2,
      title: 'Rolle\u2019s theorem is the flat chord',
      start: 30, end: 60,
      objective: 'See Rolle as the case where the chord is horizontal, watch the point where the derivative vanishes, and follow the auxiliary-function proof that turns Rolle back into the general theorem.'
    },
    {
      id: 'hypotheses', n: 3,
      title: 'Three hypotheses, and what breaks when one fails',
      start: 60, end: 90,
      objective: 'Take the hypotheses one at a time and break each on purpose: absolute value for differentiability, a broken endpoint for continuity, and root x to show that differentiability at the endpoints is not required at all.'
    },
    {
      id: 'howmany', n: 4,
      title: 'The theorem promises one point, not a location',
      start: 90, end: 120,
      objective: 'Separate existence from uniqueness and from computability: one function with two admissible points, and one where every point of the interval is admissible.'
    },
    {
      id: 'bounds', n: 5,
      title: 'The theorem as a bounding tool',
      start: 120, end: 150,
      objective: 'Rewrite the conclusion as a difference equals a derivative times a width, then use it three ways: the sine inequality, the exponential inequality, and a two-sided bound on the square root of 101.'
    },
    {
      id: 'monotone', n: 6,
      title: 'Derivative sign, monotonicity and the constant theorem',
      start: 150, end: 180,
      objective: 'Derive the monotonicity test from the theorem, see why a strictly increasing function may have a zero derivative, and see why a zero derivative on a disconnected domain does not force a constant.'
    },
    {
      id: 'cauchy', n: 7,
      title: 'Cauchy\u2019s version and the two-c error',
      start: 180, end: 210,
      objective: 'State the two-function version, compute its point on a pair where the answer is exactly 14 over 9, and show that applying the theorem to each function separately produces two different points \u2014 so the ratio may not be split.'
    },
    {
      id: 'roots', n: 8,
      title: 'Rolle as a root counter',
      start: 210, end: 240,
      objective: 'Between two zeros of a differentiable function sits a zero of its derivative. Use it forwards to locate derivative zeros and backwards to bound how many zeros a polynomial can have.'
    },
    {
      id: 'neighbours', n: 9,
      title: 'Four theorems that look like this one',
      start: 240, end: 270,
      objective: 'Put the differential mean value theorem beside the mean value theorem for integrals, the intermediate value theorem, the Darboux property of derivatives and Taylor\u2019s theorem, and compute the two points that are most often confused.'
    },
    {
      id: 'exam', n: 10,
      title: 'Reading the question',
      start: 270, end: 300,
      objective: 'Turn the topic into a three-question decision procedure: are the hypotheses met, is a point or a bound being asked for, and in which direction is Rolle being used.'
    }
  ],

  events: [
    /* ---------- scene 1: chord ---------- */
    {
      id: 's1a', start: 0, end: 7.5, scene: 'chord',
      caption: 'The chord joining the two ends of an interval has a computable slope.',
      detail: 'Take a function continuous on the closed interval from a to b and differentiable inside it. Join the point at a to the point at b with a straight line. That line is the chord, and its slope is f of b minus f of a, divided by b minus a. The slope is the average rate of change of the function over the interval, and it is a number you can compute without knowing anything about the function in between.',
      narration: 'The chord joins the two ends, and its slope is the average rate of change.',
      keyword: 'chord'
    },
    {
      id: 's1b', start: 7.5, end: 15, scene: 'chord',
      caption: 'On x squared over 0 to 2 the chord slope is 2.',
      detail: 'The function is x squared. At 0 it is 0 and at 2 it is 4, so the chord slope is 4 minus 0 over 2 minus 0, which is 2. The same number appears in another way: the average of the two end values is 2, and for a quadratic the chord slope is exactly the derivative at the midpoint of the interval.',
      narration: 'From 0 to 2 the chord rises by four over a width of two, so its slope is two.',
      keyword: 'slope 2'
    },
    {
      id: 's1c', start: 15, end: 22.5, scene: 'chord',
      caption: 'The theorem promises a point c where the derivative equals 2, and here c = 1.',
      detail: 'Lagrange\u2019s mean value theorem says there is at least one interior point c with derivative equal to the chord slope. The derivative of x squared is 2x, so 2c equals 2 and c equals 1. The page computes this by bisection on the derivative minus the chord slope, and then checks the derivative at the answer against the chord slope to twelve places.',
      narration: 'The derivative must equal two somewhere, and 2x equals 2 at x equals 1.',
      keyword: 'c = 1'
    },
    {
      id: 's1d', start: 22.5, end: 30, scene: 'chord',
      caption: 'Parallel, not equal: the tangent at c has the chord\u2019s slope, not its position.',
      detail: 'At the point c the tangent line is parallel to the chord. It is not the chord: the tangent touches the curve at one point, while the chord passes through two. The tangent at c equals 2x minus 1, which meets the curve at x equals 1 and is nowhere the chord itself. Confusing the two is the most common misreading of the theorem\u2019s picture.',
      narration: 'The tangent at the point is parallel to the chord. It is not the chord.',
      keyword: 'parallel',
      trap: 'The theorem gives a tangent parallel to the chord. A tangent equal to the chord would require the function to be the chord, which it is not.'
    },

    /* ---------- scene 2: rolle ---------- */
    {
      id: 's2a', start: 30, end: 37.5, scene: 'rolle',
      caption: 'Rolle\u2019s theorem is the mean value theorem with a flat chord.',
      detail: 'If the two end values are equal, the chord slope is zero, so the guaranteed point has derivative zero: a horizontal tangent. Rolle states this directly, with the same three hypotheses, and it is exactly the mean value theorem specialised to the case f of a equals f of b. Nothing else changes, and nothing else is assumed.',
      narration: 'When the ends are level the chord is flat, so the derivative is zero somewhere inside.',
      keyword: 'flat chord'
    },
    {
      id: 's2b', start: 37.5, end: 45, scene: 'rolle',
      caption: 'x squared minus 4x plus 3 on 1 to 3 has level ends, and the derivative vanishes at 2.',
      detail: 'At 1 the function is 1 minus 4 plus 3, which is 0. At 3 it is 9 minus 12 plus 3, which is also 0. The derivative is 2x minus 4, so it is zero exactly at c equals 2, which lies strictly inside the interval. The page finds 2 by bisection and then checks that the function value at 2 is minus 1, the vertex of the parabola.',
      narration: 'Both ends are zero, and the vertex at x equals 2 is where the tangent is flat.',
      keyword: 'c = 2'
    },
    {
      id: 's2c', start: 45, end: 52.5, scene: 'rolle',
      caption: 'The general theorem follows from Rolle by subtracting the chord.',
      detail: 'Define g of x as f of x minus the chord line through the two ends. Then g is continuous on the closed interval, differentiable inside, and g of a and g of b are both zero, so Rolle applies to g. At the resulting point the derivative of g is zero, which says the derivative of f equals the chord slope there. The mean value theorem is therefore Rolle plus a straight-line subtraction.',
      narration: 'Subtract the chord and the ends become level, so Rolle applies to the difference.',
      keyword: 'subtract the chord'
    },
    {
      id: 's2d', start: 52.5, end: 60, scene: 'rolle',
      caption: 'On the same example the auxiliary function is x squared minus 2x, flat-ended on 0 to 2.',
      detail: 'For x squared over 0 to 2 the chord is the line 2x, so the auxiliary function is x squared minus 2x. It is 0 at both ends, its derivative 2x minus 2 vanishes at 1, and that is the same point the theorem gave directly. The page checks both routes and confirms they agree.',
      narration: 'The difference has zero at both ends and a flat tangent at the same point.',
      keyword: 'auxiliary function',
      trap: 'Rolle is a special case, not a weaker theorem: it carries the same three hypotheses. Level ends never replace continuity or differentiability.'
    },

    /* ---------- scene 3: hypotheses ---------- */
    {
      id: 's3a', start: 60, end: 67.5, scene: 'hypotheses',
      caption: 'Continuity on the closed interval, differentiability on the open one, and that is all.',
      detail: 'The two conditions are deliberately asymmetric. The function must be continuous at every point of the closed interval, including both endpoints, because the chord uses the endpoint values. It must be differentiable only at the interior points, because the conclusion only ever names an interior point. Requiring more than this would exclude functions the theorem genuinely covers.',
      narration: 'Continuous including the ends, differentiable only inside. That is the exact hypothesis set.',
      keyword: 'three hypotheses'
    },
    {
      id: 's3b', start: 67.5, end: 75, scene: 'hypotheses',
      caption: 'Absolute x on minus 1 to 1 has level ends, and its derivative is never 0.',
      detail: 'The absolute value function is continuous on the whole interval and its end values are both 1, so the chord is flat. But the derivative is minus 1 on the left half and plus 1 on the right half, and at 0 it does not exist. So there is no point where the derivative is 0, and the conclusion of Rolle fails. The failure is exactly at the one point where differentiability is missing.',
      narration: 'The corner at zero is the whole story: no derivative there, and no flat tangent anywhere.',
      keyword: 'corner',
      trap: 'A single interior point of non-differentiability is enough to break the conclusion. Differentiability at all the other points does not compensate.'
    },
    {
      id: 's3c', start: 75, end: 82.5, scene: 'hypotheses',
      caption: 'Break continuity at an endpoint and the conclusion can fail too.',
      detail: 'Take the function equal to x for every x below 1 and equal to 0 at x equals 1, on the interval from 0 to 1. Both end values are 0, so the chord is flat, but the derivative is 1 at every interior point, so no interior point has derivative 0. The single discontinuity sits at the endpoint, which is precisely where continuity was required.',
      narration: 'Move one endpoint value and the flat chord has nothing to match.',
      keyword: 'endpoint value'
    },
    {
      id: 's3d', start: 82.5, end: 90, scene: 'hypotheses',
      caption: 'Differentiability at the endpoints is not required: root x on 0 to 1 gives c = 0.25.',
      detail: 'The square root is continuous on the closed interval and differentiable at every interior point, but its derivative blows up at 0, so it is not differentiable there. The theorem still applies. The chord slope is 1, and 1 over 2 root c equals 1 gives c equals one quarter, comfortably inside. A question that rejects this example because of the endpoint has misread the hypothesis.',
      narration: 'Root x is not differentiable at zero, and the theorem still holds, with c at a quarter.',
      keyword: 'c = 0.25',
      trap: 'Check where the differentiability is demanded before rejecting an example. At the endpoints it is not demanded at all.'
    },

    /* ---------- scene 4: howmany ---------- */
    {
      id: 's4a', start: 90, end: 97.5, scene: 'howmany',
      caption: 'The theorem promises at least one point. It never promises only one.',
      detail: 'The statement is an existence statement. It says some interior point has the required derivative; it says nothing about how many such points there are, and nothing about where they sit beyond being inside the interval. Any question that asks for the point, rather than for a point, needs an extra argument showing the equation has exactly one solution in the interval.',
      narration: 'At least one point. The word at least is doing all the work.',
      keyword: 'at least one'
    },
    {
      id: 's4b', start: 97.5, end: 105, scene: 'howmany',
      caption: 'x cubed minus x on minus 1 to 1 has level ends and two admissible points.',
      detail: 'Both end values are 0, so Rolle applies. The derivative is 3 x squared minus 1, which vanishes at plus and minus one over root 3, that is plus and minus 0.577350. Both lie inside the interval, so there are two points, and the page counts them rather than assuming the first root it finds is the answer.',
      narration: 'Two points, plus and minus zero point five seven seven three five zero.',
      keyword: 'two points',
      trap: 'An answer that reports a single c for this function is incomplete, and a numerical solver that stops at the first sign change would report only one.'
    },
    {
      id: 's4c', start: 105, end: 112.5, scene: 'howmany',
      caption: 'On the identity over 0 to 1, every interior point is admissible.',
      detail: 'The function x has chord slope 1 and derivative 1 at every point, so the equation holds everywhere in the open interval. There are uncountably many admissible points. The lesson of the pair is that existence is guaranteed, uniqueness is not, and the number of points is a property of the particular function, not of the theorem.',
      narration: 'Here the derivative is the chord slope at every single point.',
      keyword: 'every point'
    },
    {
      id: 's4d', start: 112.5, end: 120, scene: 'howmany',
      caption: 'So a question asking for the point is ill-posed unless uniqueness is forced.',
      detail: 'In practice the equation for c is usually linear or has one root in the interval, which is why exam questions can ask for a number. When it is not, the honest answer is the set of points, or the number of them. Recognising which case you are in takes one line: solve the equation, then count the solutions that lie strictly inside the interval.',
      narration: 'Solve for c, then count the solutions inside the interval before answering.',
      keyword: 'count the solutions'
    },

    /* ---------- scene 5: bounds ---------- */
    {
      id: 's5a', start: 120, end: 127.5, scene: 'bounds',
      caption: 'Rewrite the conclusion: the change equals a derivative times the width.',
      detail: 'The theorem says f of b minus f of a over b minus a equals the derivative at some interior point. Multiplying through gives f of b minus f of a equals that derivative times the width. This form is the useful one, because it turns a statement about an unknown point into a bound: whatever the point is, its derivative lies in the range of the derivative on the interval.',
      narration: 'The change is a derivative value times the width, and the point can be forgotten.',
      keyword: 'change equals derivative times width'
    },
    {
      id: 's5b', start: 127.5, end: 135, scene: 'bounds',
      caption: 'Sine: the difference of two sines is at most the gap between the arguments.',
      detail: 'For sine, the derivative is cosine, whose magnitude never exceeds 1. So the change in sine across an interval is at most the width of the interval. Taking the interval from 0.3 to 2.1, the actual change is 0.567689 while the width is 1.8, and the guaranteed point solves cosine of c equals 0.315383, giving c equals 1.249936.',
      narration: 'Cosine never exceeds one, so the sine difference never exceeds the gap.',
      keyword: '0.567689'
    },
    {
      id: 's5c', start: 135, end: 142.5, scene: 'bounds',
      caption: 'Exponential: e to the x exceeds 1 plus x for every positive x.',
      detail: 'Apply the theorem to the exponential on the interval from 0 to x. The change is e to the x minus 1, and it equals e to the c times x for some c between 0 and x. Since e to the c exceeds 1 for positive c, the change exceeds x, which is the inequality e to the x greater than 1 plus x. At x equals 1 the exponential is 2.718282 against 2.',
      narration: 'The secant slope exceeds one, so the exponential outruns its tangent at zero.',
      keyword: 'e to the c exceeds 1'
    },
    {
      id: 's5d', start: 142.5, end: 150, scene: 'bounds',
      caption: 'Root 101 is trapped between 10.049751 and 10.05 by one secant slope.',
      detail: 'On the interval from 100 to 101 the square root changes by 1 over 2 root c for some interior c. Because that derivative falls as x grows, the change lies between 1 over 2 root 101 and 1 over 20. The first of those depends on the answer itself, but combining the two inequalities gives 10.049751 below and 10.05 above, while the true value is 10.049876.',
      narration: 'Between ten point zero four nine seven five one and ten point zero five.',
      keyword: '10.049751 to 10.05',
      trap: 'A one-sided bound is what the theorem gives immediately. The two-sided version needs one extra step of algebra, which is exactly where marks are lost.'
    },

    /* ---------- scene 6: monotone ---------- */
    {
      id: 's6a', start: 150, end: 157.5, scene: 'monotone',
      caption: 'A positive derivative on an interval forces the function to increase.',
      detail: 'Take any two points of the interval with x below y. The theorem applied to that subinterval gives a point where the derivative equals the change divided by the gap. If the derivative is positive everywhere, the change must be positive, so the function value at y exceeds the value at x. Since the pair was arbitrary, the function is strictly increasing on the whole interval.',
      narration: 'Positive derivative, positive change, for every pair of points.',
      keyword: 'increasing'
    },
    {
      id: 's6b', start: 157.5, end: 165, scene: 'monotone',
      caption: 'A derivative that is zero everywhere on an interval forces a constant.',
      detail: 'With the derivative zero at every interior point, the same argument gives a zero change between any two points of the interval, so all values agree. The word interval is essential: the argument needs to join the two points by a subinterval on which the theorem applies, and a domain in two pieces cannot be joined that way.',
      narration: 'Zero derivative on an interval means the change between any two points is zero.',
      keyword: 'constant'
    },
    {
      id: 's6c', start: 165, end: 172.5, scene: 'monotone',
      caption: 'The converse fails: x cubed is strictly increasing and its derivative is 0 at the origin.',
      detail: 'The function x cubed rises everywhere, and yet its derivative 3 x squared is zero at 0. So a zero derivative does not imply the function fails to increase, and it certainly does not imply a maximum or a minimum. What is true is the one-way implication: a positive derivative forces an increase, but an increase does not force a positive derivative at every point.',
      narration: 'Increasing everywhere, flat tangent at one point. The implication runs one way only.',
      keyword: 'converse fails',
      trap: 'Derivative zero is a candidate for an interior extremum, not a certificate of one. The sign change of the derivative is what decides.'
    },
    {
      id: 's6d', start: 172.5, end: 180, scene: 'monotone',
      caption: 'On a domain in two pieces, a zero derivative everywhere still does not give a constant.',
      detail: 'Define the function to be 0 for negative x and 1 for positive x, on the domain with 0 removed. Its derivative is 0 at every point of that domain, since each piece is constant. Yet the function takes two different values. The theorem was applied to a pair of points with no interval between them inside the domain, which is exactly what the hypothesis forbids.',
      narration: 'Two constant pieces, zero derivative everywhere, and two different values.',
      keyword: 'disconnected domain',
      trap: 'A derivative that vanishes on a disconnected domain says nothing across the gap. Check that the interval you are using lies inside the domain.'
    },

    /* ---------- scene 7: cauchy ---------- */
    {
      id: 's7a', start: 180, end: 187.5, scene: 'cauchy',
      caption: 'Cauchy\u2019s version compares two functions at one and the same point.',
      detail: 'For two functions continuous on the closed interval and differentiable inside, with the second derivative never zero inside, there is an interior point where the ratio of the derivatives equals the ratio of the changes. The point is common to both functions, which is what makes the statement stronger than two separate applications of the ordinary theorem.',
      narration: 'One point, both functions: the ratio of derivatives equals the ratio of changes.',
      keyword: 'one common point'
    },
    {
      id: 's7b', start: 187.5, end: 195, scene: 'cauchy',
      caption: 'x squared against x cubed on 1 to 2 gives a change ratio of 3 over 7, and c = 14 over 9.',
      detail: 'The first function changes by 3 and the second by 7, so the ratio is 3 over 7, about 0.428571. The ratio of derivatives is 2c over 3 c squared, which simplifies to 2 over 3c. Setting that equal to 3 over 7 gives c equals 14 over 9, about 1.555556, which lies inside the interval. The page substitutes it back and recovers 3 over 7 exactly.',
      narration: 'Three over seven, and the point that produces it is fourteen over nine.',
      keyword: '14/9'
    },
    {
      id: 's7c', start: 195, end: 202.5, scene: 'cauchy',
      caption: 'Applied separately, the two theorems give 1.5 and 1.527525 \u2014 different points.',
      detail: 'The ordinary theorem applied to x squared gives 2c equals 3, so c is 1.5. Applied to x cubed it gives 3 c squared equals 7, so c is the square root of 7 over 3, about 1.527525. The two points differ by about 0.0275. So the ratio of the changes is not the ratio of the derivatives at any single point found this way.',
      narration: 'One and a half against one point five two seven five two five: two different points.',
      keyword: 'two different points',
      trap: 'Cancelling the changes and quoting the ordinary theorem twice is the standard wrong argument. The two points need not coincide, which is the entire content of Cauchy\u2019s version.'
    },
    {
      id: 's7d', start: 202.5, end: 210, scene: 'cauchy',
      caption: 'That is why l\u2019H\u00f4pital\u2019s rule needs the two-function version.',
      detail: 'The rule for a ratio of functions whose changes both tend to zero is justified by comparing the two changes at one point, which is Cauchy\u2019s theorem. Using the ordinary theorem on each function separately would leave two unrelated points and no ratio at all. This is the practical reason the two-function form exists, and the reason it is asked for in a proof question.',
      narration: 'A ratio needs one point for both functions, and that is Cauchy\u2019s contribution.',
      keyword: 'ratio needs one point'
    },

    /* ---------- scene 8: roots ---------- */
    {
      id: 's8a', start: 210, end: 217.5, scene: 'roots',
      caption: 'Between two zeros of a differentiable function there is a zero of its derivative.',
      detail: 'If the function is zero at two distinct points, then on the interval between them it satisfies the hypotheses of Rolle, because its two end values are both zero. The guaranteed point is an interior zero of the derivative. Nothing about the function beyond differentiability is needed, so the statement holds for every differentiable function, not only for polynomials.',
      narration: 'Two zeros of the function force at least one zero of the derivative between them.',
      keyword: 'zero of the derivative'
    },
    {
      id: 's8b', start: 217.5, end: 225, scene: 'roots',
      caption: 'x cubed minus 3x plus 1 has three zeros: minus 1.879385, 0.347296 and 1.532089.',
      detail: 'The page locates the zeros by bisection on sign changes over a fine grid, and then checks that the function is within a millionth of zero at each. Three zeros means two gaps, so the derivative must vanish at least twice, once in each gap.',
      narration: 'Three zeros, found by bisection, not read off a sketch.',
      keyword: 'three zeros'
    },
    {
      id: 's8c', start: 225, end: 232.5, scene: 'roots',
      caption: 'The derivative 3 x squared minus 3 vanishes at minus 1 and at 1, one in each gap.',
      detail: 'The derivative is a quadratic with zeros at plus and minus 1. Minus 1 lies between the first two zeros of the function and plus 1 lies between the second and third. The page checks both containments as inequalities. Rolle predicted at least two derivative zeros and the derivative has exactly two, so the count is tight here.',
      narration: 'Minus one sits in the first gap and plus one in the second.',
      keyword: 'minus 1 and 1'
    },
    {
      id: 's8d', start: 232.5, end: 240, scene: 'roots',
      caption: 'Read backwards: a degree n polynomial has at most n real zeros.',
      detail: 'Suppose a differentiable function had more zeros than its derivative can support. Each gap between consecutive zeros would need its own derivative zero, so k zeros of the function force at least k minus 1 zeros of the derivative. A degree n polynomial has a derivative of degree n minus 1 with at most n minus 1 zeros, so it can have at most n zeros. That is the standard proof, and it is Rolle read backwards.',
      narration: 'Each gap costs one derivative zero, so the zeros are capped by the degree.',
      keyword: 'at most n zeros',
      trap: 'Rolle gives a lower bound on derivative zeros from function zeros. Turning it round gives an upper bound on function zeros. Both directions appear in questions, and they are not the same statement.'
    },

    /* ---------- scene 9: neighbours ---------- */
    {
      id: 's9a', start: 240, end: 247.5, scene: 'neighbours',
      caption: 'Four results look like this one and answer different questions.',
      detail: 'The mean value theorem for integrals finds a point where the function equals its average value. The intermediate value theorem finds a point where the function equals a given level. The Darboux property says derivatives attain intermediate values even when discontinuous. Taylor\u2019s theorem extends the mean value theorem to higher derivatives. Each names a point; each names a different equation for that point.',
      narration: 'Four theorems, four different equations for the point they promise.',
      keyword: 'four theorems'
    },
    {
      id: 's9b', start: 247.5, end: 255, scene: 'neighbours',
      caption: 'On x squared over 0 to 2 the differential point is 1, the integral point is 1.154701.',
      detail: 'The differential theorem solves 2c equals the chord slope 2, giving c equals 1. The integral version solves c squared equals the average value 4 over 3, giving c equals the square root of 4 over 3, about 1.154701. Both points exist, both are inside the interval, and they are different numbers. Quoting one when the other was asked for is a reliable way to lose the mark.',
      narration: 'One theorem matches a slope, the other matches a height. Different points.',
      keyword: '1 against 1.154701',
      trap: 'The mean value theorem for integrals is not this theorem. Match the quantity in the equation: a derivative against a chord slope, or a function value against an average.'
    },
    {
      id: 's9c', start: 255, end: 262.5, scene: 'neighbours',
      caption: 'The intermediate value theorem places values, not slopes.',
      detail: 'For x squared on minus 1 to 1, the value one half is attained at plus and minus 0.707107, by continuity alone, with no derivative involved. The intermediate value theorem needs continuity and nothing else, and it promises a value of the function, never a value of the derivative. A question about a level is an intermediate value question even when the word mean appears in the chapter title.',
      narration: 'One half is attained at plus and minus zero point seven zero seven one zero seven.',
      keyword: 'values not slopes'
    },
    {
      id: 's9d', start: 262.5, end: 270, scene: 'neighbours',
      caption: 'Derivatives keep the intermediate value property even where they are discontinuous.',
      detail: 'The function x squared times sine of one over x, extended by zero at the origin, has a derivative at every point, but the derivative is not continuous at the origin. Even so, it takes every value between any two of its values, which is Darboux\u2019s theorem. The page samples the derivative near the origin and exhibits values of both signs and a value of one half between them. Continuity of the derivative is not needed for that property.',
      narration: 'A derivative can jump about and still take every value in between.',
      keyword: 'Darboux',
      trap: 'Do not conclude that a discontinuous derivative skips values. Darboux says it cannot, which is why a derivative can never have a jump discontinuity.'
    },

    /* ---------- scene 10: exam ---------- */
    {
      id: 's10a', start: 270, end: 277.5, scene: 'exam',
      caption: 'First: are the three hypotheses actually met?',
      detail: 'Check continuity on the closed interval, differentiability on the open interval, and equality of the end values if Rolle is being used. A single failure removes the conclusion entirely, and an option that applies the theorem anyway is the intended distractor. Conversely, absence of differentiability at an endpoint is not a failure.',
      narration: 'Hypotheses first: continuity including the ends, differentiability inside only.',
      keyword: 'hypotheses first'
    },
    {
      id: 's10b', start: 277.5, end: 285, scene: 'exam',
      caption: 'Second: is a point wanted, a bound, or a count?',
      detail: 'A point question asks you to solve the derivative equal to the chord slope. A bound question asks you to multiply the range of the derivative by the width. A count question asks how many zeros the derivative must have, or how many zeros the function can have. Naming the type before computing decides which of the three lines of work you write.',
      narration: 'Point, bound or count. The type decides the whole computation.',
      keyword: 'point, bound or count'
    },
    {
      id: 's10c', start: 285, end: 292.5, scene: 'exam',
      caption: 'Third: solve, then count the solutions inside the interval.',
      detail: 'The equation for c is often linear, and then the answer is a single number. When it is quadratic, as for x cubed minus x, both roots may lie inside and the honest answer is two points. When the derivative is constant, every point works. Counting the admissible solutions takes one extra line and prevents the most common incomplete answer.',
      narration: 'Solve, then count what lies strictly inside the interval.',
      keyword: 'count the solutions'
    },
    {
      id: 's10d', start: 292.5, end: 300, scene: 'exam',
      caption: 'Finally: bound the answer before choosing an option.',
      detail: 'A point c must lie strictly inside the interval, so any option outside it is wrong at once. A bound obtained from the derivative\u2019s range must be at least as large as the true change. A count must be consistent with the degree of the derivative. These three checks cost seconds and remove most wrong options without any arithmetic.',
      narration: 'Inside the interval, at least as large as the change, consistent with the degree.',
      keyword: 'bound the answer',
      trap: 'The distractor is usually a conclusion the hypotheses do not license, such as a point at an endpoint, a tangent equal to the chord, or a bound tighter than the derivative allows.'
    }
  ]
};
