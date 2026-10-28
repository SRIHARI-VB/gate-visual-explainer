/* ==========================================================================
   calculus-limits-extrema-and-integration — THE timeline.
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
      id: 'limit',
      n: 1,
      title: 'A limit is the value approached, not the value reached',
      start: 0, end: 30,
      objective: 'Read a limit as a statement about a neighbourhood, substitute first, and recognise the 0/0 form that blocks substitution.'
    },
    {
      id: 'forms',
      n: 2,
      title: 'Five indeterminate forms, five different moves',
      start: 30, end: 60,
      objective: 'Use L\'Hopital only on 0/0 and infinity over infinity, and rewrite the other three forms into a fraction or a logarithm.'
    },
    {
      id: 'cont',
      n: 3,
      title: 'Continuity: three conditions that must all hold',
      start: 60, end: 90,
      objective: 'Test continuity at a point with two one-sided limits plus the value, and solve for an unknown constant in a piecewise function.'
    },
    {
      id: 'diff',
      n: 4,
      title: 'Differentiable means continuous, and the converse fails',
      start: 90, end: 120,
      objective: 'Define the derivative as the two one-sided slopes agreeing, and find every point where a piecewise function has no derivative.'
    },
    {
      id: 'mvt',
      n: 5,
      title: 'The mean value theorem: an average slope is an actual slope',
      start: 120, end: 150,
      objective: 'State the two hypotheses, and use the conclusion as an inequality to bound the value of a function at one endpoint.'
    },
    {
      id: 'extrema',
      n: 6,
      title: 'Maxima and minima: find the critical points, then classify',
      start: 150, end: 180,
      objective: 'Solve f prime equals zero, read the sign change of the first derivative, and confirm with the second derivative.'
    },
    {
      id: 'closed',
      n: 7,
      title: 'On a closed interval the endpoints can win',
      start: 180, end: 210,
      objective: 'Compare the interior candidates with both endpoint values, and see a maximum that sits where no derivative exists.'
    },
    {
      id: 'integ',
      n: 8,
      title: 'Integration by substitution, including the sign',
      start: 210, end: 240,
      objective: 'Change the variable, change the limits, and carry the minus sign that the substitution produces.'
    },
    {
      id: 'symmetry',
      n: 9,
      title: 'Symmetry: the integral you never have to compute',
      start: 240, end: 270,
      objective: 'Use oddness over a symmetric interval, and the reflection trick, to evaluate definite integrals in one line.'
    },
    {
      id: 'procedure',
      n: 10,
      title: 'The four-step procedure and the traps it avoids',
      start: 270, end: 300,
      objective: 'Carry one checklist across limits, continuity, extrema and integration, with the previous-year items it settles.'
    }
  ],

  events: [

    /* ---------------- scene 1: limit ---------------- */
    {
      id: 'lm-1', scene: 'limit', start: 0, end: 7.5,
      caption: 'A limit asks what f(x) settles near a, not what f(a) equals.',
      detail: 'The statement "the limit of f as x tends to a is L" says that f(x) can be made as close to L as we like by taking x close enough to a, on either side, without requiring x to equal a. So the value at a is irrelevant, and the function need not even be defined there.',
      narration: 'A limit is a statement about a neighbourhood, not about a point. It says the values of f can be forced as close to L as we like by keeping x close to a. Whether f is defined at a, and what it equals there, plays no part in the definition.',
      keyword: 'approached, not reached',
      trap: 'Do not answer a limit question by substituting and reporting whatever comes out. Substitution is a shortcut that is valid only when the function is continuous there.'
    },
    {
      id: 'lm-2', scene: 'limit', start: 7.5, end: 15,
      caption: 'Substituting here gives 0/0: the numerator is 0 and so is the denominator.',
      detail: 'With x equal to minus 3 the numerator is the square root of 2 times minus 3 plus 22, minus 4, which is the square root of 16 minus 4, that is 0. The denominator is minus 3 plus 3, which is also 0. The quotient 0 over 0 is not a number, so substitution has failed to decide anything.',
      narration: 'Put x equal to minus 3 into this quotient. The numerator becomes root of 16 minus 4, which is zero. The denominator becomes zero. Zero over zero is undefined, so substitution told us nothing. This is the signal to do work, not the signal that the limit is missing.',
      keyword: 'zero over zero',
      trap: 'A 0/0 result is not evidence that the limit fails to exist. It means the substitution rule does not apply, and a different tool is needed.'
    },
    {
      id: 'lm-3', scene: 'limit', start: 15, end: 22.5,
      caption: 'Differentiate top and bottom separately: the top becomes one over the square root, the bottom becomes 1.',
      detail: 'The derivative of the square root of 2x plus 22 is 1 over twice that square root, multiplied by the inner derivative 2, which cancels to 1 over the square root of 2x plus 22. The derivative of x plus 3 is 1. L\'Hopital replaces the quotient of the functions by the quotient of their derivatives, and that is allowed only because the original form is 0/0.',
      narration: 'Because the form is zero over zero, L\'Hopital applies. Differentiate the top: the chain rule gives one over the square root of 2x plus 22, and the factor of two cancels. Differentiate the bottom: it is one. Now the quotient is one over the square root, and that has no zero in the denominator at minus 3.',
      keyword: 'differentiate top and bottom',
      trap: 'Never use the quotient rule here. L\'Hopital differentiates the numerator and the denominator separately, which is not what the quotient rule does.'
    },
    {
      id: 'lm-4', scene: 'limit', start: 22.5, end: 30,
      caption: 'At x equal to minus 3 the answer is 1 over the square root of 16, which is 0.25.',
      detail: 'The limit of 1 over the square root of 2x plus 22 as x tends to minus 3 is 1 over the square root of 4, which is one quarter, 0.25. Rationalising the numerator instead, by multiplying top and bottom by the square root of 2x plus 22 plus 4, gives the same value, and the approach table agrees to five decimals.',
      narration: 'Put minus 3 into the simplified expression: 2 times minus 3 plus 22 is 16, its square root is 4, and one over 4 is 0.25. The table of values either side of minus 3 climbs to the same number, which is what a limit means. Rationalising the numerator gives the same answer by a longer route.',
      keyword: 'one quarter',
      trap: 'The question asked for two decimal places, so 0.25 is written as 0.25, not as 1/4 and not as 0.2. A fraction answer in a numerical field scores zero.'
    },

    /* ---------------- scene 2: forms ---------------- */
    {
      id: 'fm-1', scene: 'forms', start: 30, end: 37.5,
      caption: 'Only two of the five indeterminate forms may be handed straight to L\'Hopital.',
      detail: 'The forms are 0/0, infinity over infinity, 0 times infinity, infinity minus infinity, and one to the power infinity, together with the rarer infinity to the power zero and zero to the power zero. L\'Hopital is a theorem about a quotient of differentiable functions whose separate limits are both zero or both infinite. Only those two shapes qualify.',
      narration: 'There are five shapes that a limit can take where substitution fails. L\'Hopital is allowed on exactly two of them: zero over zero, and infinity over infinity. For the other three you must first turn the expression into one of those two, or take a logarithm.',
      keyword: 'two of five',
      trap: 'Applying L\'Hopital to 0 times infinity as it stands is a common and fatal error: the derivative quotient is meaningless because there is no quotient yet.'
    },
    {
      id: 'fm-2', scene: 'forms', start: 37.5, end: 45,
      caption: '0 times infinity becomes a fraction; infinity minus infinity becomes a common denominator; 1 to the infinity takes a logarithm.',
      detail: 'A product f times g with one factor going to zero and the other to infinity is rewritten as f divided by 1 over g, which is now 0/0. A difference of two infinite quantities is combined over a common denominator. A power f to the g is evaluated as e to the g ln f, and the exponent g ln f is a product of the 0 times infinity kind.',
      narration: 'Each of the other three shapes has one standard move. A product becomes a quotient by putting one factor underneath. A difference becomes a single fraction over a common denominator. A power is written as e to the g ln f, and then the exponent is the product shape, which you already know how to handle.',
      keyword: 'rewrite, then differentiate',
      trap: 'Taking a logarithm of a limit is valid because the exponential is continuous: the limit of e to the h is e to the limit of h. Without that sentence the step is unjustified.'
    },
    {
      id: 'fm-3', scene: 'forms', start: 45, end: 52.5,
      caption: 'x to the power 1 over x is infinity to the zero; its logarithm has limit zero, so the limit is e to the zero, which is 1.',
      detail: 'Taking logarithms gives ln x divided by x. As x grows, the numerator grows without bound but far more slowly than the denominator, and one application of L\'Hopital on the infinity over infinity form gives 1 over x divided by 1, which tends to 0. So the original limit is e to the 0, that is 1. This is GATE CSE 2015 Set 1.',
      narration: 'Here is the standard example. x to the one over x, as x goes to infinity, is infinity to the power zero. Take logs: ln x over x. Differentiate once and you get one over x, which goes to zero. So the logarithm of the answer is zero, and the answer itself is e to the zero, which is one.',
      keyword: 'log, differentiate, exponentiate',
      trap: 'Reporting the limit of the logarithm as the answer is the error. The logarithm has limit 0; the original expression has limit 1.'
    },
    {
      id: 'fm-4', scene: 'forms', start: 52.5, end: 60,
      caption: 'One plus x squared times e to the minus x is infinity times zero; as a fraction it is infinity over infinity and the limit is 0.',
      detail: 'Writing the expression as 1 plus x squared divided by e to the x makes the shape infinity over infinity. One application of L\'Hopital gives 2x over e to the x, still infinity over infinity, and a second gives 2 over e to the x, whose limit is 0. The exponential beats every polynomial, and this is GATE CSE 2015 Set 3.',
      narration: 'The other direction: one plus x squared times e to the minus x, as x goes to infinity, is infinity times zero. Push the exponential downstairs and it becomes infinity over infinity. Two applications of L\'Hopital leave 2 over e to the x, which is zero. The exponential always wins, and that is why growth comparisons in algorithm analysis look the way they do.',
      keyword: 'exponential beats polynomial',
      trap: 'One application of L\'Hopital is not enough here; stopping at 2x over e to the x still gives infinity over infinity and no answer.'
    },

    /* ---------------- scene 3: cont ---------------- */
    {
      id: 'ct-1', scene: 'cont', start: 60, end: 67.5,
      caption: 'Continuous at a means three things at once: the limit exists, the value exists, and they are equal.',
      detail: 'The definition is that the limit of f as x tends to a equals f of a, where both sides must exist. So continuity fails in exactly three ways: the limit does not exist, the value is not defined, or the two exist and differ. A jump, a hole and a blow-up are the three pictures.',
      narration: 'Continuity at a point is one equation: the limit equals the value. That equation can fail in three ways, and each has a picture. The limit may not exist, which is a jump or a blow-up. The value may not be defined, which is a hole. Or both exist and disagree, which is also a hole, moved.',
      keyword: 'limit equals value',
      trap: 'A function can be continuous everywhere except one point and still be the answer to "where is it discontinuous" with a single point. Do not answer with an interval out of habit.'
    },
    {
      id: 'ct-2', scene: 'cont', start: 67.5, end: 75,
      caption: 'For a piecewise function, compute the two one-sided limits separately and then match them to the stated value.',
      detail: 'Where the formula changes at a, the left-hand limit uses the formula below a and the right-hand limit uses the formula above a. Continuity requires all three of the left limit, the right limit and the value to be one number. A single unknown constant is then fixed by one equation, or by two if two constants are unknown.',
      narration: 'With a piecewise definition, do not substitute blindly. Take the limit from the left using the lower formula, take the limit from the right using the upper formula, and require both to equal the value the definition states at the join. Each unknown constant then costs one equation.',
      keyword: 'two sides, one number',
      trap: 'Using the wrong branch on one side is the most common arithmetic slip in this question type, and it is invisible in the final answer.'
    },
    {
      id: 'ct-3', scene: 'cont', start: 75, end: 82.5,
      caption: 'GATE CSE 2026 Set 1: as x tends to 0 from above, ln of 1 over x runs off to plus infinity.',
      detail: 'The function is c one times e to the x minus c two times ln of 1 over x for positive x, and 3 otherwise. As x tends to 0 from above, e to the x tends to 1, but ln of 1 over x is minus ln x, which tends to plus infinity. So the second term dominates unless its coefficient is zero.',
      narration: 'Take the piecewise function from GATE 2026 Set 1. For positive x it is c one e to the x minus c two ln of one over x. As x shrinks to zero, e to the x goes to one quietly, but ln of one over x goes to plus infinity. A term that runs to infinity cannot be matched to the finite value 3.',
      keyword: 'the logarithm blows up',
      trap: 'ln of 1 over x is minus ln x, and minus ln x tends to plus infinity as x tends to zero from above. Getting that sign wrong reverses the conclusion.'
    },
    {
      id: 'ct-4', scene: 'cont', start: 82.5, end: 90,
      caption: 'So c two must be 0, leaving c one equals 3, and c one plus c two equals 3.',
      detail: 'For the limit to be finite the coefficient of the divergent term must vanish, so c two is 0. Then the limit is c one times 1, and continuity requires that to equal 3, so c one is 3. The sum asked for is therefore 3, and the answer is independent of any derivative.',
      narration: 'The only way to keep the limit finite is to switch the divergent term off, so c two is zero. Then the limit is c one, and it must equal 3. So c one plus c two is 3. Notice that nothing here needed a derivative: continuity is about values, not slopes.',
      keyword: 'kill the divergent term',
      trap: 'Setting the whole limit equal to 3 while leaving c two free gives one equation in two unknowns, which cannot be solved. The vanishing coefficient is a separate requirement.'
    },

    /* ---------------- scene 4: diff ---------------- */
    {
      id: 'df-1', scene: 'diff', start: 90, end: 97.5,
      caption: 'The derivative at a point exists when the two one-sided slopes agree.',
      detail: 'The derivative is the limit of the difference quotient as the step tends to zero. Because it is a two-sided limit, it exists only when the limit from the left and the limit from the right are the same number. Differentiability at a point therefore implies continuity there, since a finite slope forces the values to meet.',
      narration: 'The derivative is itself a limit, and a limit is two-sided. So a function has a derivative at a point only when the slope computed from the left and the slope computed from the right are the same number. When they differ, the graph has a corner, and there is no tangent line.',
      keyword: 'two slopes, one number',
      trap: 'Differentiable implies continuous, never the other way round. |x| at zero is the standard witness: continuous, and no derivative.'
    },
    {
      id: 'df-2', scene: 'diff', start: 97.5, end: 105,
      caption: 'The absolute value has slope minus 1 on the left of 0 and plus 1 on the right, so there is no derivative at 0.',
      detail: 'For negative x the function is minus x, whose derivative is minus 1. For positive x it is x, whose derivative is 1. At zero the two one-sided difference quotients tend to different numbers, so the two-sided limit does not exist. The function is still continuous at 0, because both sides approach 0.',
      narration: 'The absolute value is the picture to keep. To the left of zero the slope is minus one; to the right it is plus one. At zero there is no single slope, so no derivative, even though the graph is unbroken. Continuity does not buy you a tangent.',
      keyword: 'a corner is not a tangent',
      trap: 'A corner is not the only failure. A vertical tangent, as in the cube root at zero, also destroys the derivative while keeping continuity.'
    },
    {
      id: 'df-3', scene: 'diff', start: 105, end: 112.5,
      caption: 'For f equal to the larger of x and x cubed, the formula switches wherever x cubed equals x.',
      detail: 'Solving x cubed equals x gives x times x minus 1 times x plus 1 equals zero, so x is 0, 1 or minus 1. Between those points one branch is above the other: x cubed is larger on the intervals from minus 1 to 0 and beyond 1, while x is larger on the other two pieces. The formula therefore changes three times.',
      narration: 'GATE 2024 Set 1 asks where the larger of x and x cubed fails to have a derivative. The two expressions cross where x cubed equals x, which factors as x times x minus 1 times x plus 1, so at minus 1, 0 and 1. At each crossing the winning formula changes, so each crossing is a candidate corner.',
      keyword: 'three crossings',
      trap: 'Finding the crossings is only half the work. A crossing where both pieces have the same slope would be smooth, so each candidate must still be checked.'
    },
    {
      id: 'df-4', scene: 'diff', start: 112.5, end: 120,
      caption: 'At all three crossings the slopes differ, so the answer is the set minus 1, 0 and 1.',
      detail: 'At minus 1 the slopes are 1 from the linear piece and 3 from the cubic piece, since 3 times x squared at minus 1 is 3. At 0 they are 0 and 1. At 1 they are 1 and 3. Three unequal pairs, three corners, and nowhere else, because away from the crossings the function is a polynomial on a whole neighbourhood.',
      narration: 'Check each crossing. At minus 1 the slopes are one and three. At zero they are zero and one. At one they are one and three. Every pair is unequal, so all three points are corners. Everywhere else the function agrees with a polynomial on a small interval, so it is smooth there. The answer is the set of those three points.',
      keyword: 'all three are corners',
      trap: 'The question asks for a set, so a single number is wrong. Answering 0 because that is where the absolute value breaks is the trap this question was built on.'
    },

    /* ---------------- scene 5: mvt ---------------- */
    {
      id: 'mv-1', scene: 'mvt', start: 120, end: 127.5,
      caption: 'The mean value theorem needs continuity on the closed interval and differentiability on the open one.',
      detail: 'Those two hypotheses are exactly what is required and nothing more. Continuity on the closed interval makes the average slope meaningful, and differentiability inside guarantees a tangent at every interior point. If either hypothesis fails, the conclusion can fail too, which is why both are quoted in every statement of the theorem.',
      narration: 'Two hypotheses, and both are used. Continuous on the closed interval, differentiable on the open one. Continuity at the two ends is what makes the average slope a number; differentiability inside is what makes a tangent exist everywhere it is needed. Rolle\'s theorem is the special case where the two endpoint values are equal.',
      keyword: 'two hypotheses',
      trap: 'Quoting differentiability on the closed interval is wrong and is used as a distractor. The theorem needs it only on the open interval.'
    },
    {
      id: 'mv-2', scene: 'mvt', start: 127.5, end: 135,
      caption: 'Then some interior point c has slope exactly equal to the average slope across the interval.',
      detail: 'The conclusion is that there exists at least one c strictly between a and b with f prime of c equal to f of b minus f of a, divided by b minus a. The word is exists, not for all, and the point need not be unique. Geometrically, some tangent is parallel to the chord joining the endpoints.',
      narration: 'The conclusion is an existence statement: there is at least one interior point where the instantaneous slope equals the average slope over the whole interval. At least one, not exactly one. Picture a chord drawn between the two endpoints and then slide it up until it just touches the curve: the touching point is c.',
      keyword: 'some point, not every point',
      trap: 'A single example does not prove the theorem, and the theorem does not say which c it is. Questions that ask for the value of c need the function, not just the hypotheses.'
    },
    {
      id: 'mv-3', scene: 'mvt', start: 135, end: 142.5,
      caption: 'GATE CSE 2021 Set 2: the average slope from minus 3 to 3 is f(3) minus 7, all over 6, and it equals a slope that is at most 2.',
      detail: 'The interval is from minus 3 to 3, whose width is 6. The theorem supplies an interior c with f prime of c equal to f of 3 minus f of minus 3 divided by 6. Every interior slope is at most 2 by hypothesis, so the average slope is at most 2. That is the whole argument, in one line.',
      narration: 'Here is the previous-year item. The width of the interval is six. By the mean value theorem the average slope equals the slope at some interior point, and every interior slope is at most two. So the average slope is at most two. Write it as f of 3 minus 7 over 6, less than or equal to 2.',
      keyword: 'bound the average slope',
      trap: 'The direction of the inequality matters. The hypothesis bounds the slope above, so it bounds f(3) above; nothing here says f(3) is at least anything.'
    },
    {
      id: 'mv-4', scene: 'mvt', start: 142.5, end: 150,
      caption: 'Multiplying through gives f(3) at most 19, and the straight line 2x plus 13 attains it, so 19 is the best possible bound.',
      detail: 'Multiplying the inequality by 6 gives f of 3 minus 7 at most 12, so f of 3 is at most 19. The bound is sharp: the function 2x plus 13 is continuous on the closed interval, differentiable inside, has derivative exactly 2 everywhere, takes the value 7 at minus 3, and takes the value 19 at 3. So no smaller bound is available.',
      narration: 'Multiply by six: f of 3 minus 7 is at most twelve, so f of 3 is at most nineteen. And nineteen is reached, by the straight line 2x plus 13, which satisfies every hypothesis. A bound that is reached cannot be improved, which is what makes nineteen the answer and not merely a valid upper estimate.',
      keyword: 'the bound is attained',
      trap: 'The word "at most" asks for the tight bound. Giving a larger number that also happens to be an upper bound is a wrong answer.'
    },

    /* ---------------- scene 6: extrema ---------------- */
    {
      id: 'ex-1', scene: 'extrema', start: 150, end: 157.5,
      caption: 'A local extremum can occur only at a critical point or at an endpoint.',
      detail: 'A critical point is an interior point where the derivative is zero or does not exist. Fermat\'s theorem says an interior local extremum of a differentiable function forces the derivative to vanish there, so the candidate list is the critical points together with the two endpoints. That list is complete, and nothing outside it can be an extremum.',
      narration: 'Two kinds of candidate only. Inside the interval, points where the derivative is zero or missing. And the two endpoints, which we treat separately. That is the complete list, so a question can never hide an extremum somewhere else.',
      keyword: 'critical points and endpoints',
      trap: 'Derivative zero does not mean extremum. x cubed at zero has zero slope and no extremum; the sign of the derivative must still change, or the second derivative must be non-zero.'
    },
    {
      id: 'ex-2', scene: 'extrema', start: 157.5, end: 165,
      caption: 'GATE CSE 2023: f prime is 3 times x plus 11 times x minus 1, so the critical points are minus 11 and 1.',
      detail: 'The derivative of x cubed plus 15 x squared minus 33 x minus 36 is 3 x squared plus 30 x minus 33. Dividing by 3 leaves x squared plus 10 x minus 11, which factors as x plus 11 times x minus 1, because 11 times minus 1 is minus 11 and 11 plus minus 1 is 10. So the critical points are minus 11 and 1.',
      narration: 'Take the official GATE 2023 question. Differentiate: 3x squared plus 30x minus 33. Divide by three and factor: x plus 11 times x minus 1. So the only two critical points are minus 11 and 1, and both are inside the domain, which is the whole real line.',
      keyword: 'factor, do not use the formula',
      trap: 'Dividing by 3 before factoring is safe for roots but changes the second derivative, so do the division only in the first derivative step.'
    },
    {
      id: 'ex-3', scene: 'extrema', start: 165, end: 172.5,
      caption: 'The sign of f prime goes plus, minus, plus, so there is a local maximum at minus 11 and a local minimum at 1.',
      detail: 'The product of two linear factors changes sign at each root. To the left of minus 11 both factors are negative, so the product is positive. Between minus 11 and 1 the first is positive and the second negative, so the product is negative. To the right of 1 both are positive. A change from positive to negative is a local maximum, and the reverse is a local minimum.',
      narration: 'Read the sign chart rather than the numbers. Left of minus 11 the derivative is positive, so the function climbs. Between the two roots it is negative, so the function falls. After 1 it is positive again. Climb then fall is a local maximum at minus 11; fall then climb is a local minimum at 1.',
      keyword: 'sign change decides',
      trap: 'The sign chart gives the classification without any second derivative, and it also handles the case where the second derivative is zero. Use whichever is cheaper, but do not skip the sign check.'
    },
    {
      id: 'ex-4', scene: 'extrema', start: 172.5, end: 180,
      caption: 'The second derivative confirms it: minus 36 at minus 11 and plus 36 at 1, so statements B and D are true.',
      detail: 'The second derivative is 6x plus 30. At minus 11 it is minus 36, which is negative, so the curve is concave down and the point is a local maximum. At 1 it is 36, positive, so the curve is concave up and the point is a local minimum. Both statements B and D are therefore true, and it is a multiple-select question.',
      narration: 'Confirm with the second derivative: 6x plus 30. At minus 11 that is minus 36, negative, concave down, local maximum. At 1 it is plus 36, positive, concave up, local minimum. So the function has a local maximum and a local minimum, and the answer is B and D together. The values 811 and minus 53 are never asked for.',
      keyword: 'concavity confirms',
      trap: 'In a multiple-select question, choosing only B because you stopped at the first critical point loses half the marks. Both critical points must be classified.'
    },

    /* ---------------- scene 7: closed ---------------- */
    {
      id: 'cl-1', scene: 'closed', start: 180, end: 187.5,
      caption: 'Setting the derivative to zero finds interior candidates only. On a closed interval the endpoints are candidates too.',
      detail: 'A continuous function on a closed bounded interval attains a maximum and a minimum, by the extreme value theorem. Those extreme points are either interior critical points or the two endpoints. So the reliable procedure is: list the critical points inside, add the two endpoints, evaluate the function at every candidate, and compare the numbers.',
      narration: 'Here is the discipline that saves marks. The derivative only sees the inside. On a closed interval the maximum may sit exactly at an end, where the derivative has nothing to say. So evaluate at the critical points and at both endpoints, and compare the numbers you get.',
      keyword: 'compare the values',
      trap: 'A question that says "in the interval from a to b" almost always has its answer at an endpoint. Reading it as an open interval is the single most expensive misread in this topic.'
    },
    {
      id: 'cl-2', scene: 'closed', start: 187.5, end: 195,
      caption: 'For 2x squared minus 2x plus 6 on the interval from 0 to 2, the vertex is at one half and its value is 5.5.',
      detail: 'The derivative is 4x minus 2, which vanishes at x equal to one half. The value there is 2 times a quarter minus 1 plus 6, which is 0.5 minus 1 plus 6, that is 5.5. Because the coefficient of x squared is positive the parabola opens upward, so this interior critical point is a minimum, not a maximum.',
      narration: 'Take the parabola 2x squared minus 2x plus 6 on the interval from 0 to 2. The derivative 4x minus 2 vanishes at one half. The value there is 5.5. The parabola opens upward, so this is the lowest point of the curve, not the highest. Anyone who stops here reports 5.5 as the maximum and is wrong.',
      keyword: 'the vertex is a minimum here',
      trap: 'Assuming the critical point is the maximum because the question asks for a maximum. The classification must be done, not assumed.'
    },
    {
      id: 'cl-3', scene: 'closed', start: 195, end: 202.5,
      caption: 'The endpoints give 6 and 10, so the maximum on the closed interval is 10, attained at x equal to 2.',
      detail: 'At x equal to 0 the value is 6. At x equal to 2 the value is 8 minus 4 plus 6, which is 10. Comparing the three numbers 6, 5.5 and 10 gives a maximum of 10 at the right endpoint and a minimum of 5.5 at the vertex. This is GATE CSE 1997, and the endpoint is the whole point of the question.',
      narration: 'Now the endpoints. At zero the value is six. At two the value is ten. Compare six, five point five and ten: the maximum is ten, and it is at the right endpoint. The interior critical point was the minimum all along. That is the trap, and it is why the closed interval must be read literally.',
      keyword: 'the endpoint wins',
      trap: 'Answering 6 by checking only the left endpoint, or 5.5 by trusting the vertex, both lose the mark. All candidates must be evaluated.'
    },
    {
      id: 'cl-4', scene: 'closed', start: 202.5, end: 210,
      caption: 'A maximum need not be smooth: 1 minus the absolute value of x peaks at 0, where no derivative exists.',
      detail: 'On the interval from minus 1 to 1 the function 1 minus |x| rises to 1 at x equal to 0 and falls to 0 at both ends. The maximum is 1 at x equal to 0, and there is no derivative at that point. So a maximum can sit at a corner, which is why the candidate list includes points where the derivative fails to exist as well as points where it vanishes.',
      narration: 'One more shape, from the aptitude section of a past paper: one minus the absolute value of x on the interval from minus one to one. It peaks at zero with value one, and at that peak there is a corner, so no derivative exists. A maximum can live exactly where the calculus cannot see it, which is why the candidate list has two kinds of interior point.',
      keyword: 'a corner can be the peak',
      trap: 'If you only solve f prime equals zero you will find no candidate at all here and may conclude the function has no maximum.'
    },

    /* ---------------- scene 8: integ ---------------- */
    {
      id: 'in-1', scene: 'integ', start: 210, end: 217.5,
      caption: 'Substitution reverses the chain rule: put u equal to the inner function and du equal to its derivative times dx.',
      detail: 'If the integrand contains a function g of x together with its derivative g prime of x as a factor, then setting u equal to g of x turns the integral into one in u alone. The relation du equals g prime of x dx is the bookkeeping that makes the change legitimate, and it must account for every factor of the original integrand.',
      narration: 'Substitution is the chain rule read backwards. If you can see an inner function and, beside it, that function\'s derivative, name the inner function u. Then du is its derivative times dx, and the whole integrand rewrites itself in terms of u. What is left over must be only u.',
      keyword: 'the chain rule backwards',
      trap: 'Substituting without replacing dx leaves a mixture of x and u, which is not a valid integral. The du line is not decoration.'
    },
    {
      id: 'in-2', scene: 'integ', start: 217.5, end: 225,
      caption: 'In this integral the inner function is 1 over x, and its derivative brings a minus sign.',
      detail: 'The integrand is cos of 1 over x, divided by x squared. Taking u equal to 1 over x gives du equal to minus 1 over x squared dx, so the factor dx over x squared is minus du. The minus sign is produced by the derivative of 1 over x, and it is the part of the computation most often lost.',
      narration: 'GATE 2015 Set 1. The integrand is cos of one over x, over x squared. Name u equal to one over x. Then du is minus one over x squared dx. So dx over x squared is minus du, and the minus sign arrives from the derivative. Write it down before you do anything else.',
      keyword: 'du carries a minus',
      trap: 'Dropping the minus sign gives plus 1 instead of minus 1, which is exactly the distractor in the original options.'
    },
    {
      id: 'in-3', scene: 'integ', start: 225, end: 232.5,
      caption: 'The limits also change: from 1 over pi and 2 over pi to pi and pi over 2, and the minus sign flips their order.',
      detail: 'When x equals 1 over pi, u equals pi. When x equals 2 over pi, u equals pi over 2. The minus sign from du reverses the direction of integration, and reversing the limits of a definite integral multiplies it by minus 1, so the two minus signs combine into the interval from pi over 2 up to pi.',
      narration: 'The limits are in x, so they must become limits in u. At the lower end x is one over pi, so u is pi. At the upper end x is two over pi, so u is pi over two. The minus sign reverses the direction, and reversing the direction of a definite integral changes its sign, so the interval becomes pi over two up to pi.',
      keyword: 'change the limits too',
      trap: 'Leaving the old limits in place while the variable is u is a silent error: the arithmetic still produces a number, and the number is wrong.'
    },
    {
      id: 'in-4', scene: 'integ', start: 232.5, end: 240,
      caption: 'The integral of cos u from pi over 2 to pi is sine pi minus sine pi over 2, which is 0 minus 1, so the answer is minus 1.',
      detail: 'An antiderivative of cos u is sin u. Evaluating between pi over 2 and pi gives sin of pi minus sin of pi over 2, that is 0 minus 1. The definite integral is therefore minus 1, and a numerical quadrature of the original integrand agrees to ten decimal places.',
      narration: 'The antiderivative of cos u is sin u. Evaluate at the top and subtract the value at the bottom: sin pi is zero, sin of pi over two is one, so the answer is minus one. The page also integrates the original expression numerically, and gets the same minus one, which is the check that the sign was handled correctly.',
      keyword: 'zero minus one',
      trap: 'A definite integral of a positive-looking integrand can be negative, because the integrand is not positive: cos of one over x is negative on part of this interval.'
    },

    /* ---------------- scene 9: symmetry ---------------- */
    {
      id: 'sy-1', scene: 'symmetry', start: 240, end: 247.5,
      caption: 'Over an interval symmetric about zero, an odd integrand contributes exactly nothing.',
      detail: 'A function is odd when f of minus x equals minus f of x, so its graph has half-turn symmetry about the origin. The area to the left of zero is then the negative of the area to the right, and the two cancel. This holds for any odd function that is integrable on the interval, and it needs no antiderivative at all.',
      narration: 'Before you integrate, look at the shape. If the interval runs from minus a to a, and the integrand is odd, meaning f of minus x is minus f of x, then the integral is zero. The two halves are mirror images with opposite signs, so they cancel exactly. No antiderivative is needed.',
      keyword: 'odd over symmetric is zero',
      trap: 'The interval must be symmetric about zero, and the function must be odd. An even function over a symmetric interval doubles instead, and neither rule applies to an interval like 0 to 2.'
    },
    {
      id: 'sy-2', scene: 'symmetry', start: 247.5, end: 255,
      caption: 'GATE CSE 2023: the integrand is 4x squared y minus z cubed, over three symmetric intervals.',
      detail: 'The region is the box from minus 3 to 3 in x, minus 2 to 2 in y and minus 1 to 1 in z. The term 4 x squared y is odd in y, and the term minus z cubed is odd in z. Both terms therefore integrate to zero over their respective symmetric intervals, regardless of the other variables.',
      narration: 'Here is the GATE 2023 triple integral. The integrand is 4x squared y minus z cubed, over a box that is symmetric in all three variables. Look at the first term: as a function of y it is odd, so integrating over y from minus 2 to 2 kills it. Look at the second: z cubed is odd in z, so integrating over z from minus 1 to 1 kills that too.',
      keyword: 'kill each term separately',
      trap: 'Do not expand into a full iterated integral first. The symmetry argument is exact and takes one line, and the expansion is where the arithmetic errors come from.'
    },
    {
      id: 'sy-3', scene: 'symmetry', start: 255, end: 262.5,
      caption: 'Both terms vanish, so the answer is 0, with no antiderivative computed at all.',
      detail: 'Each of the two terms is odd in one of the variables over a symmetric interval, so each of the two iterated integrals is zero. Their difference is zero, and the inner integrals over x, whose interval contributes only a finite positive factor, cannot change that. The value of the whole triple integral is 0.',
      narration: 'Both pieces vanish, so the answer is zero. Nothing was integrated, and nothing needed to be. This is the kind of question where the mark is for spotting the symmetry, and the arithmetic is only there to punish people who start expanding.',
      keyword: 'the answer is zero',
      trap: 'A zero answer feels unsafe and invites a recheck. Verify it by naming the odd variable in each term, which is a proof, not a guess.'
    },
    {
      id: 'sy-4', scene: 'symmetry', start: 262.5, end: 270,
      caption: 'Reflection works too: f(x) equals 1 minus f(2 minus x) forces the integral from 0 to 2 to equal 1.',
      detail: 'Substituting u equal to 2 minus x turns the integral from 0 to 2 of f of x into the integral from 0 to 2 of f of 2 minus u, and the given relation turns that into 2 minus the original integral. So the integral equals 2 minus itself, which forces it to be 1. This is GATE CSE 2024 Set 2.',
      narration: 'The same idea in another costume, from GATE 2024 Set 2. The function satisfies f of x equals one minus f of 2 minus x, a reflection about the point 1. Substitute u equals 2 minus x and the integral becomes 2 minus itself. A number equal to 2 minus itself is 1, and that is the answer.',
      keyword: 'an integral equal to its own complement',
      trap: 'The constant 1 in the relation contributes 1 times the length of the interval, which is 2, not 1. Forgetting to multiply by the width gives 0.5.'
    },

    /* ---------------- scene 10: procedure ---------------- */
    {
      id: 'pc-1', scene: 'procedure', start: 270, end: 277.5,
      caption: 'Step one: substitute. If a number comes out, that is the limit and the work is done.',
      detail: 'Substitution is valid whenever the expression is continuous at the point, which covers most questions in the paper. It is only when substitution produces one of the indeterminate forms that any machinery is needed. So the first move is always the cheap one, and it settles the majority of items.',
      narration: 'Start cheap. Put the number in. If you get a number, that is the answer, because the function is continuous there. Only when you get zero over zero, or infinity over infinity, or one of the other indeterminate shapes, do you reach for a theorem.',
      keyword: 'substitute first',
      trap: 'Skipping the substitution and differentiating immediately can be done on an expression that did not need it, and it produces a wrong value without any warning.'
    },
    {
      id: 'pc-2', scene: 'procedure', start: 277.5, end: 285,
      caption: 'Step two: use L\'Hopital only on 0/0 or infinity over infinity, and rewrite anything else into one of those two.',
      detail: 'The rule is a theorem with hypotheses: both pieces differentiable near the point, both limits zero or both infinite, and the derivative quotient has a limit. If the last condition fails, L\'Hopital says nothing at all, and the original limit may still exist. Each use of the rule should therefore be a deliberate step, not a reflex.',
      narration: 'Step two is the only place where differentiation is licensed, and only for the two quotient shapes. Anything else gets rewritten first. And remember that the rule is one-directional: when the derivative quotient has no limit, that is not a proof that the original limit does not exist.',
      keyword: 'two shapes only',
      trap: 'Repeated application without checking the form each time is how people end up differentiating something that is no longer indeterminate.'
    },
    {
      id: 'pc-3', scene: 'procedure', start: 285, end: 292.5,
      caption: 'Step three: for extrema, list the critical points and both endpoints, evaluate at every candidate, and compare the numbers.',
      detail: 'The candidate list is complete: interior points where the derivative is zero, interior points where it does not exist, and the two endpoints of a closed interval. Classification comes from the sign change of the first derivative or the sign of the second, and the final answer comes from comparing values, never from comparing slopes.',
      narration: 'Step three is bookkeeping. Write every candidate, evaluate the function at each one, and compare the values. A critical point tells you where to look; only the values tell you which one wins. If the interval is closed, both endpoints are on the list.',
      keyword: 'compare values, not slopes',
      trap: 'Reporting the x-coordinate when the question asked for the maximum value, or the other way round, is a free mark lost.'
    },
    {
      id: 'pc-4', scene: 'procedure', start: 292.5, end: 300,
      caption: 'Step four: before integrating, check for symmetry and for an inner derivative, and never drop the minus sign from du.',
      detail: 'Two cheap checks settle most definite integrals in this paper: is the integrand odd on a symmetric interval, and is the integrand an inner function times its own derivative. If a substitution is used, change the limits with the variable and keep the sign that the derivative produced. Then the answer follows in one line.',
      narration: 'The last step is the two checks before integrating. Odd on a symmetric interval means zero. An inner function beside its derivative means substitute. And when you substitute, change the limits and keep the minus sign. Those three habits cover every calculus question the paper has asked in the last ten years.',
      keyword: 'symmetry, substitution, sign',
      trap: 'Treating a definite integral as an antiderivative plus a constant. A definite integral is a number, and the constant of integration cancels.'
    }
  ]
};
