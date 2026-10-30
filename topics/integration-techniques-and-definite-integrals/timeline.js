/* ==========================================================================
   integration-techniques-and-definite-integrals — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   captions.vtt, captions.srt and transcript.md are generated from this file by
   tools/gen-captions.mjs — never edited by hand.

   Every number quoted in a caption is computed by the model in lesson.js and
   printed on the canvas: the four rectangle rules at n = 10 (0.285, 0.385,
   0.335, 0.3325 against 1/3), their error ratios 10 and 100, the standard
   integrals, the substitution e^4 - 1 = 53.598150, the by-parts boundary term
   -1, the tabular result e - 2 = 0.718282, ln 2 = 0.693147, the mean-value
   point c = sqrt(3), the divergence -ln(eps) at 6.907755, 13.815511 and
   20.723266, the p-test limits, and the density checks for the exponential,
   uniform and normal laws.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'area', n: 1,
      title: 'A definite integral is a limit of rectangle sums',
      start: 0, end: 30,
      objective: 'Define the definite integral as the limit of a Riemann sum, and see that the four rectangle rules differ only in where the sample point sits inside each panel — so they share a limit and differ in how fast they get there.'
    },
    {
      id: 'ftc', n: 2,
      title: 'The fundamental theorem: area by antiderivative',
      start: 30, end: 60,
      objective: 'State both halves of the fundamental theorem, and use the second half to turn an area into one subtraction F(b) minus F(a) on three standard integrals.'
    },
    {
      id: 'props', n: 3,
      title: 'The five properties that do the work',
      start: 60, end: 90,
      objective: 'Establish additivity, reversal, linearity, comparison and the odd/even rule, each checked on a function rather than asserted.'
    },
    {
      id: 'subst', n: 4,
      title: 'Substitution, and what happens to the limits',
      start: 90, end: 120,
      objective: 'Reverse the chain rule, and show on one worked integral that the limits must be converted into the new variable — the single most common lost mark in this topic.'
    },
    {
      id: 'parts', n: 5,
      title: 'Integration by parts and the boundary term',
      start: 120, end: 150,
      objective: 'Derive the by-parts formula from the product rule, use the LIATE order to choose the parts, and show a case where the boundary term is the whole answer.'
    },
    {
      id: 'partial', n: 6,
      title: 'Partial fractions and the logarithm rule',
      start: 150, end: 180,
      objective: 'Split a rational integrand into pieces that are standard forms, and recognise the derivative-over-denominator rule that produces a logarithm.'
    },
    {
      id: 'mvt', n: 7,
      title: 'The mean value theorem for integrals',
      start: 180, end: 210,
      objective: 'Show that a continuous function takes its average value somewhere on the interval, compute the point for a worked case, and see what fails when continuity is dropped.'
    },
    {
      id: 'improper', n: 8,
      title: 'Improper integrals: when the area is infinite',
      start: 210, end: 240,
      objective: 'Define convergence for an infinite limit and for an infinite integrand, apply the p-test, and see that a function blowing up at an endpoint can still enclose a finite area.'
    },
    {
      id: 'prob', n: 9,
      title: 'Where GATE uses this: continuous probability',
      start: 240, end: 270,
      objective: 'Read a density, a cumulative distribution and an expectation as three integrals, and check each against its closed form for the exponential, uniform and normal laws.'
    },
    {
      id: 'exam', n: 10,
      title: 'Reading the question',
      start: 270, end: 300,
      objective: 'Turn the technique list into a decision procedure for an exam item, and name the four errors that are offered as answer options.'
    }
  ],

  events: [
    /* ---------- scene 1: area ---------- */
    {
      id: 's1a', start: 0, end: 7.5, scene: 'area',
      caption: 'A definite integral is the area under a curve, counted with sign.',
      detail: 'The integral from a to b of f is defined as a limit: split the interval into n panels of width h, multiply each width by a sample height, add, and let n grow. Area below the axis counts negative, which is why the word is signed area and not area.',
      narration: 'A definite integral is the signed area under a curve between two points.',
      keyword: 'signed area',
      trap: 'Area is never negative; a definite integral can be. If a curve dips below the axis the integral subtracts that part, and a question that says "area" wants the absolute value of each piece.'
    },
    {
      id: 's1b', start: 7.5, end: 15, scene: 'area',
      caption: 'Left, right, midpoint and trapezoid differ only in the sample height.',
      detail: 'For x squared on the interval from 0 to 1 with ten panels: the left rule gives 0.285, the right rule 0.385, the trapezoid rule 0.335 and the midpoint rule 0.3325, against the exact one third. All four converge to the same number.',
      narration: 'Four rectangle rules, one limit. At ten panels they give 0.285, 0.385, 0.335 and 0.3325 against one third.',
      keyword: 'four rules',
      trap: 'The left and right rules straddle the answer only for an increasing function. For a decreasing one the inequality flips, and a question may test exactly that.'
    },
    {
      id: 's1c', start: 15, end: 22.5, scene: 'area',
      caption: 'Ten times as many panels cuts the left-rule error by about ten.',
      detail: 'Going from 10 panels to 100 divides the left-rule error by about 9.7, the trapezoid error by 100 and the midpoint error by 100. The midpoint and trapezoid errors carry opposite signs, which is why their average is far more accurate than either.',
      narration: 'The left rule is first order, so the error falls like one over n. The trapezoid and midpoint rules are second order, so the error falls like one over n squared.',
      keyword: 'one over n squared',
      trap: 'A rule that is more accurate at large n is not automatically more accurate at small n. At ten panels the midpoint rule beats the trapezoid rule by exactly a factor of two here, not by a factor of n.'
    },
    {
      id: 's1d', start: 22.5, end: 30, scene: 'area',
      caption: 'The integral is the limit, and the limit is what the theorem evaluates.',
      detail: 'Nobody evaluates a limit of sums in an exam. The definition is there so that the two halves of the fundamental theorem have something to be a theorem about: the integral is defined by sums, and then computed by antiderivatives.',
      narration: 'The sum is the definition. The next scene is the theorem that replaces it.',
      keyword: 'the limit',
      trap: 'A Riemann sum with n panels is an approximation, not the integral. Writing "approximately" is correct at finite n and wrong after the limit is taken.'
    },

    /* ---------- scene 2: ftc ---------- */
    {
      id: 's2a', start: 30, end: 37.5, scene: 'ftc',
      caption: 'The accumulation function differentiates back to the integrand.',
      detail: 'Fix the lower limit and let the upper limit move. The function F of x defined as the integral from a to x of f has derivative f. That is the first half of the fundamental theorem, and it is the statement that the area accumulated so far grows at a rate equal to the current height.',
      narration: 'Let the upper limit move. The accumulated area grows at a rate equal to the height of the curve.',
      keyword: 'accumulation',
      trap: 'The first half needs f continuous at the point where the derivative is taken. At a jump, the accumulation function is continuous but not differentiable, and a question can ask exactly that.'
    },
    {
      id: 's2b', start: 37.5, end: 45, scene: 'ftc',
      caption: 'The second half turns an area into one subtraction.',
      detail: 'If F is any antiderivative of f on the interval, the integral from a to b of f equals F of b minus F of a. Any antiderivative works, because two antiderivatives differ by a constant and the constant cancels in the subtraction.',
      narration: 'If F is an antiderivative, the integral is F at b minus F at a. Any antiderivative works.',
      keyword: 'F of b minus F of a',
      trap: 'The constant of integration is required for an indefinite integral and irrelevant for a definite one. Adding plus C to a definite answer is not a small slip; it is a wrong answer to a different question.'
    },
    {
      id: 's2c', start: 45, end: 52.5, scene: 'ftc',
      caption: 'Three standard integrals, evaluated.',
      detail: 'The integral of 1 over x from 1 to e is 1, because the antiderivative is the natural logarithm and the logarithm of e is 1. The integral of sine from 0 to pi is 2. The integral of 1 over 1 plus x squared from 0 to 1 is pi by 4, the first appearance of pi from a function with no trigonometry in it.',
      narration: 'One, two, and pi by four. Each is one subtraction once the antiderivative is known.',
      keyword: 'standard integrals',
      trap: 'The antiderivative of 1 over x is the logarithm of the absolute value of x. Dropping the absolute value is only safe when the interval is entirely positive.'
    },
    {
      id: 's2d', start: 52.5, end: 60, scene: 'ftc',
      caption: 'The table is small, and every technique reduces to it.',
      detail: 'Powers, the exponential, sine and cosine, secant squared, and one over x. Every technique in the rest of this lesson exists to turn an unfamiliar integrand into one of these rows.',
      narration: 'Five rows of a table. Substitution, by parts and partial fractions are three ways of reaching them.',
      keyword: 'the table',
      trap: 'The power rule fails at exponent minus one, where the answer is a logarithm rather than a power. That single exception is the most frequently tested row in the table.'
    },

    /* ---------- scene 3: props ---------- */
    {
      id: 's3a', start: 60, end: 67.5, scene: 'props',
      caption: 'Additivity: a middle point splits the integral into two.',
      detail: 'The integral from 0 to 3 of x squared plus 3x minus 2 equals the integral from 0 to 2 plus the integral from 2 to 3, both 16.5. The property holds for any intermediate point, inside the interval or outside it.',
      narration: 'Splitting the interval at any point splits the integral into two that add back to the original.',
      keyword: 'additivity',
      trap: 'Additivity lets a point sit outside the interval, and then one of the pieces is negative in orientation. A question that says the point lies between a and b is adding a condition the theorem does not need.'
    },
    {
      id: 's3b', start: 67.5, end: 75, scene: 'props',
      caption: 'Reversal: swapping the limits flips the sign.',
      detail: 'The integral of 4x squared minus 7x from minus 1 to 1 is 8 over 3; from 1 to minus 1 it is minus 8 over 3. Reversal is a definition, not a theorem, and it is what makes additivity work for points outside the interval.',
      narration: 'Swapping the limits multiplies the answer by minus one.',
      keyword: 'reversal',
      trap: 'Reversal changes the sign, not the magnitude, and it is not the same as taking the absolute value. A curve below the axis has a negative integral without any reversal at all.'
    },
    {
      id: 's3c', start: 75, end: 82.5, scene: 'props',
      caption: 'Linearity: constants come out and sums split.',
      detail: 'The integral of a times f plus b times g equals a times the integral of f plus b times the integral of g. This is what lets a polynomial be integrated term by term, and it is why the table only needs five rows.',
      narration: 'Constants pull out, sums split. That is how a polynomial is integrated one term at a time.',
      keyword: 'linearity',
      trap: 'Linearity applies to sums and constant multiples only. There is no rule for a product or a quotient, which is the whole reason by parts and partial fractions exist.'
    },
    {
      id: 's3d', start: 82.5, end: 90, scene: 'props',
      caption: 'Symmetry: an odd integrand cancels over a symmetric interval.',
      detail: 'The integral of x cubed from minus 2 to 2 is 0, because the negative half cancels the positive half exactly. The integral of x squared over the same interval is 16 over 3, twice the integral from 0 to 2. The test is the parity of the integrand, not the shape of the picture.',
      narration: 'Odd cancels, even doubles. The test is whether f of minus x equals minus f of x or plus f of x.',
      keyword: 'odd cancels',
      trap: 'The rule needs the interval symmetric about zero. An odd function over an interval that is not symmetric does not cancel, and the answer is generally not zero.'
    },

    /* ---------- scene 4: subst ---------- */
    {
      id: 's4a', start: 90, end: 97.5, scene: 'subst',
      caption: 'Substitution is the chain rule read backwards.',
      detail: 'If the integrand contains an inner function and, up to a constant, its derivative, then setting u equal to the inner function turns the integral into one in u. The derivative of the inner function is the part that makes the change of variable possible at all.',
      narration: 'Look for an inner function whose derivative is also present. That is the signal for substitution.',
      keyword: 'chain rule backwards',
      trap: 'If the derivative is present but off by a constant, the constant can be moved outside. If it is missing entirely, substitution is not the technique, and forcing it produces a wrong answer confidently.'
    },
    {
      id: 's4b', start: 97.5, end: 105, scene: 'subst',
      caption: 'The limits must be rewritten in the new variable.',
      detail: 'For the integral from 0 to 2 of 2x times e to the x squared, the substitution u equals x squared sends the limits 0 and 2 to 0 and 4. The integral becomes e to the u from 0 to 4, which is e to the fourth minus 1, about 53.598.',
      narration: 'Both limits move. Zero stays zero and two becomes four, and the answer is e to the fourth minus one.',
      keyword: 'the limits move',
      trap: 'Evaluating the new antiderivative at the old limits is the commonest error in the topic. Either convert the limits, or convert back to x before substituting them.'
    },
    {
      id: 's4c', start: 105, end: 112.5, scene: 'subst',
      caption: 'The two routes agree exactly, not approximately.',
      detail: 'Integrating 2x e to the x squared directly by quadrature gives 53.598150033. Integrating e to the u from 0 to 4 gives the same number to twelve places. The change of variable is an identity, so the agreement is exact.',
      narration: 'Direct quadrature and the substituted integral agree to twelve decimal places.',
      keyword: 'exact agreement',
      trap: 'A numerical agreement to a few places proves nothing about a technique in general. Here the check is worth making because the closed form is known; it is evidence about this instance, not a proof of the rule.'
    },
    {
      id: 's4d', start: 112.5, end: 120, scene: 'subst',
      caption: 'The differential has to be replaced as well as the variable.',
      detail: 'Writing du equals the derivative of the inner function times dx is not decoration. The dx that remains in the integral after the variable is changed is what the rule accounts for, and forgetting to convert it is the same error as forgetting a factor.',
      narration: 'Change the variable, change the differential, change the limits. Three changes, one substitution.',
      keyword: 'the differential',
      trap: 'A substitution written without its du is not a substitution. It is the most common way to lose the constant that the chain rule put there.'
    },

    /* ---------- scene 5: parts ---------- */
    {
      id: 's5a', start: 120, end: 127.5, scene: 'parts',
      caption: 'By parts comes from the product rule.',
      detail: 'The product rule for u times v, integrated and rearranged, gives the integral of u dv equals u v minus the integral of v du. The definite form evaluates the boundary term at both ends: u v at b minus u v at a, minus the remaining integral.',
      narration: 'Integrate the product rule and rearrange: u d v equals u v minus v d u.',
      keyword: 'the product rule',
      trap: 'The formula is symmetric in appearance and not in use. Choosing the parts badly makes the new integral harder than the original, which is the only real failure mode of the technique.'
    },
    {
      id: 's5b', start: 127.5, end: 135, scene: 'parts',
      caption: 'LIATE orders the choices when both parts are plausible.',
      detail: 'Logarithm, inverse trigonometric, algebraic, trigonometric, exponential. The earlier item in that list is chosen as u. For x times e to the x the algebraic part is u, so the exponential is integrated and the x is differentiated away.',
      narration: 'Logarithm, inverse trig, algebraic, trig, exponential. Take u from the left of that list.',
      keyword: 'LIATE',
      trap: 'LIATE is a rule of thumb, not a theorem. It gives no answer for a product of two functions from the same group, where the useful move is often to apply the formula twice and solve for the integral.'
    },
    {
      id: 's5c', start: 135, end: 142.5, scene: 'parts',
      caption: 'The boundary term carries the whole answer here.',
      detail: 'The integral of x e to the x from 0 to 1 is 1. With u equal to x, the boundary term is x e to the x evaluated from 0 to 1, which is e minus 0, and the remaining integral is e to the x from 0 to 1, which is e minus 1. The difference is exactly 1.',
      narration: 'Boundary term e, remaining integral e minus one, and the difference is one.',
      keyword: 'boundary term',
      trap: 'Dropping the boundary term, or evaluating it at only one limit, is the standard arithmetic error. The boundary term is a subtraction of two numbers, not a single evaluation.'
    },
    {
      id: 's5d', start: 142.5, end: 150, scene: 'parts',
      caption: 'Repeated by parts has a tabular form.',
      detail: 'For x squared times e to the x the algebraic factor is differentiated twice, reaching zero. Listing the derivatives of one factor against the integrals of the other, with alternating signs, gives e minus 2, about 0.718282. The table stops when the derivative column reaches zero.',
      narration: 'Differentiate the polynomial down to zero, integrate the exponential alongside, alternate the signs. The answer is e minus two.',
      keyword: 'tabular',
      trap: 'The tabular method only terminates for a polynomial factor. Against a logarithm or an inverse trigonometric function the column never reaches zero, and the table gives an infinite series instead of an answer.'
    },

    /* ---------- scene 6: partial ---------- */
    {
      id: 's6a', start: 150, end: 157.5, scene: 'partial',
      caption: 'A rational integrand is split into standard pieces.',
      detail: 'When the denominator factors, the fraction is written as a sum of simpler fractions with unknown numerators, and the numerators are found by matching coefficients or by substituting the roots. Each piece then integrates to a power or a logarithm.',
      narration: 'Factor the denominator, split the fraction, solve for the numerators, integrate each piece.',
      keyword: 'partial fractions',
      trap: 'The split is valid only when the numerator has lower degree than the denominator. If it does not, polynomial division comes first, and skipping it produces an unsolvable system.'
    },
    {
      id: 's6b', start: 157.5, end: 165, scene: 'partial',
      caption: 'Repeated factors need every power in the split.',
      detail: 'A denominator containing a squared linear factor needs two terms, one over the factor and one over its square. Leaving out the second term is the standard error, and it shows up as an inconsistent system when the coefficients are matched.',
      narration: 'A squared factor needs two terms: one over the factor and one over its square.',
      keyword: 'repeated factors',
      trap: 'A quadratic factor that does not factor over the reals gets a linear numerator, not a constant. Assuming a constant there produces a system with no solution and no obvious reason why.'
    },
    {
      id: 's6c', start: 165, end: 172.5, scene: 'partial',
      caption: 'Derivative over denominator gives a logarithm.',
      detail: 'If the numerator is the derivative of the denominator, the integral is the natural logarithm of the absolute value of the denominator. The integral of 1 over 1 plus x from 0 to 1 is the logarithm of 2, about 0.693147, and the rule recognises it without any splitting at all.',
      narration: 'Derivative over denominator integrates to a logarithm. Here that is the logarithm of two.',
      keyword: 'logarithm rule',
      trap: 'The rule needs the numerator to be the derivative up to a constant, and the constant is a factor outside the logarithm, not inside it. Writing the logarithm of twice the denominator is wrong by a constant.'
    },
    {
      id: 's6d', start: 172.5, end: 180, scene: 'partial',
      caption: 'Long division first, then the split.',
      detail: 'When the degree of the numerator is at least the degree of the denominator, divide first. The quotient integrates as a polynomial and the remainder is a proper fraction that the split applies to. Skipping the division leaves a system with more unknowns than equations.',
      narration: 'Divide first when the numerator is not smaller. Then split what remains.',
      keyword: 'divide first',
      trap: 'A question that supplies a fraction with equal degrees is testing exactly this step. The answer options usually differ by a polynomial term that division would have produced.'
    },

    /* ---------- scene 7: mvt ---------- */
    {
      id: 's7a', start: 180, end: 187.5, scene: 'mvt',
      caption: 'The average value of a function is its integral over the width.',
      detail: 'For a list of numbers the average is the sum divided by the count. For a function the sum becomes an integral and the count becomes the width of the interval, so the average value is one over b minus a times the integral from a to b.',
      narration: 'Average value is the integral divided by the width of the interval.',
      keyword: 'average value',
      trap: 'The average value is not the average of the endpoint values, and it is not the midpoint value. For x squared on the interval from 0 to 3 the three numbers are 3, 4.5 and 2.25.'
    },
    {
      id: 's7b', start: 187.5, end: 195, scene: 'mvt',
      caption: 'A continuous function reaches its average value somewhere.',
      detail: 'If f is continuous on the closed interval, there is a point c in that interval with f of c equal to the average value. The proof traps the average between the minimum and the maximum and then uses the intermediate value theorem.',
      narration: 'Continuity forces the curve through its own average value at some point.',
      keyword: 'somewhere',
      trap: 'The theorem guarantees existence, not uniqueness, and it gives no formula for c. A question that asks for the number of such points is asking something the theorem does not answer.'
    },
    {
      id: 's7c', start: 195, end: 202.5, scene: 'mvt',
      caption: 'For x squared on the interval from 0 to 3, c is the square root of 3.',
      detail: 'The average value is 3, and solving x squared equals 3 inside the interval gives c equal to the square root of 3, about 1.732051. The negative root lies outside the interval and is discarded, which is the step that the theorem requires.',
      narration: 'Average three, so c is the square root of three, about 1.732. The negative root is outside the interval.',
      keyword: 'square root of 3',
      trap: 'Both roots of the equation usually appear as answer options. Only the one inside the stated interval satisfies the theorem, and the interval is part of the hypothesis.'
    },
    {
      id: 's7d', start: 202.5, end: 210, scene: 'mvt',
      caption: 'Without continuity there need not be such a point.',
      detail: 'Take a step function that is 0 on the left half of the interval and 2 on the right half. The average value is 1, but the function never equals 1. Continuity is not a technicality here; it is the whole hypothesis.',
      narration: 'A step function with average one never takes the value one. Continuity is the hypothesis doing the work.',
      keyword: 'continuity',
      trap: 'The theorem is stated for the closed interval. Continuity only on the open interval is not enough, which is why the statement names the closed interval explicitly.'
    },

    /* ---------- scene 8: improper ---------- */
    {
      id: 's8a', start: 210, end: 217.5, scene: 'improper',
      caption: 'An infinite limit of integration is handled by a limit.',
      detail: 'The integral to infinity is defined as the limit of the integral to a finite upper bound. If that limit is a finite number the integral converges; otherwise it diverges. The finite upper bound is what makes the fundamental theorem applicable at all.',
      narration: 'Integrate to a finite bound, then take the limit. Finite answer, convergence; otherwise divergence.',
      keyword: 'the limit',
      trap: 'Writing the answer as a number without taking the limit is the error. The symbol for infinity is not a number that can be substituted into an antiderivative.'
    },
    {
      id: 's8b', start: 217.5, end: 225, scene: 'improper',
      caption: 'The p-test settles the whole family at once.',
      detail: 'The integral of x to the minus p from 1 to infinity converges exactly when p exceeds 1, with value 1 over p minus 1. From 0 to 1 the inequality reverses: it converges exactly when p is below 1. Both halves are proved by integrating the power and taking the limit.',
      narration: 'To infinity converges for p above one. To zero converges for p below one. The direction of the tail decides.',
      keyword: 'p-test',
      trap: 'The two halves have opposite inequalities, and mixing them up is the single most common error on the topic. A question that names both endpoints is asking for both conditions at once.'
    },
    {
      id: 's8c', start: 225, end: 232.5, scene: 'improper',
      caption: 'The logarithm integral diverges, but only logarithmically.',
      detail: 'The integral of 1 over x from a small epsilon to 1 equals minus the logarithm of epsilon. At epsilon one thousandth that is 6.907755, at one millionth 13.815511, at one billionth 20.723266. The values grow without bound, so the integral diverges, but they grow very slowly.',
      narration: 'Six point nine, thirteen point eight, twenty point seven. The values grow without bound, so the area is infinite.',
      keyword: 'diverges',
      trap: 'Slow growth is not convergence. A table of three values that look almost stable is exactly the trap this function sets, and the p-test is what settles it.'
    },
    {
      id: 's8d', start: 232.5, end: 240, scene: 'improper',
      caption: 'An integrand that blows up can still enclose a finite area.',
      detail: 'The logarithm tends to minus infinity at zero, yet its integral from zero to 1 is exactly minus 1. An unbounded integrand is therefore not the same as a divergent integral, and the two questions have to be separated before anything is computed.',
      narration: 'The logarithm goes to minus infinity at zero, and its integral from zero to one is minus one.',
      keyword: 'finite area',
      trap: 'Unbounded is not divergent. A function with a vertical asymptote can have a finite integral, and the reverse is also possible, so neither word implies the other.'
    },

    /* ---------- scene 9: prob ---------- */
    {
      id: 's9a', start: 240, end: 247.5, scene: 'prob',
      caption: 'A density is a function whose integral is one.',
      detail: 'A probability density is non-negative and integrates to one over the whole line. Probability of an interval is the integral over that interval, and the cumulative distribution is the accumulation function from minus infinity to x. These are the three definitions, and all three are integrals.',
      narration: 'Density integrates to one. Probability is an integral over an interval. The cumulative distribution is the running integral.',
      keyword: 'density',
      trap: 'A density value is not a probability, and it can exceed one on a narrow interval. Only its integral over an interval is a probability, which is why a density with a height of 2 is perfectly legal.'
    },
    {
      id: 's9b', start: 247.5, end: 255, scene: 'prob',
      caption: 'Expectation is the integral of x against the density.',
      detail: 'For the exponential law with rate 2, the density is 2 e to the minus 2x. It integrates to 1 over the positive line, the integral of x times the density is one half, and the integral of x squared times the density is also one half, so the variance is one quarter. The probability below one half is 1 minus e to the minus 1, about 0.632121.',
      narration: 'Total one, mean one half, second moment one half, variance one quarter, and the probability below one half is 0.632.',
      keyword: 'expectation',
      trap: 'The mean of an exponential is one over the rate, not the rate. With rate 2 the mean is one half, and an option that says 2 is testing whether the parameter was read as a mean or as a rate.'
    },
    {
      id: 's9c', start: 255, end: 262.5, scene: 'prob',
      caption: 'Uniform and normal, checked by the same three integrals.',
      detail: 'The uniform density on the interval from 0 to 4 is one quarter, and its mean is 2 by symmetry. For the standard normal the total is 1, the mean is 0 and the second moment is 1, so the variance is 1. The probability between minus 1 and 1 is 0.682689 and the upper tail beyond 1 is 0.158655.',
      narration: 'The same three integrals for every law: total, first moment, second moment.',
      keyword: 'same three integrals',
      trap: 'The normal has no elementary antiderivative, so its probabilities are read from a table or computed numerically. Claiming a closed form for the tail is a claim that cannot be backed.'
    },
    {
      id: 's9d', start: 262.5, end: 270, scene: 'prob',
      caption: 'A sum over samples is an approximation, not the expectation.',
      detail: 'Averaging many independent draws approaches the expectation by the law of large numbers, but the expectation itself is defined by an integral. A question that says "the expected value is the average of the observed values" has confused the definition with a procedure for estimating it.',
      narration: 'The integral defines the expectation. Averaging samples only estimates it.',
      keyword: 'estimates it',
      trap: 'The law of large numbers is about convergence of an average, not about equality at any finite sample size. No finite sample equals the expectation in general.'
    },

    /* ---------- scene 10: exam ---------- */
    {
      id: 's10a', start: 270, end: 277.5, scene: 'exam',
      caption: 'First ask which of the four question types this is.',
      detail: 'An item on integration asks one of four things: evaluate a definite integral, find a point guaranteed by a theorem, decide convergence, or connect an integral to a probability. Each type has a different first move, and naming the type prevents most wasted work.',
      narration: 'Evaluate, locate, decide convergence, or connect to probability. Name the type first.',
      keyword: 'four types',
      trap: 'A question that presents an improper integral inside a probability setting is still a convergence question first. Reading it as an evaluation question leads to a finite answer that does not exist.'
    },
    {
      id: 's10b', start: 277.5, end: 285, scene: 'exam',
      caption: 'For evaluation, classify the integrand before choosing a technique.',
      detail: 'A product with a polynomial factor suggests by parts. An inner function with its derivative present suggests substitution. A rational function suggests partial fractions, after a division if the degrees require it. Anything else is a standard row of the table or a trigonometric identity away from one.',
      narration: 'Classify the integrand, then pick the technique. Product, inner function, or rational.',
      keyword: 'classify',
      trap: 'Two techniques often both work, and one is much shorter. The exam does not award the longer route, so it is worth checking whether the derivative of an inner function is already present.'
    },
    {
      id: 's10c', start: 285, end: 292.5, scene: 'exam',
      caption: 'Four errors are offered as options, and three are recognisable.',
      detail: 'Evaluating at the old limits after a substitution, dropping the boundary term in by parts, adding a constant to a definite integral, and treating a divergent integral as finite. Each produces a specific wrong number, which is why the options look plausible.',
      narration: 'Old limits, missing boundary term, a stray constant, a divergent integral treated as finite.',
      keyword: 'four errors',
      trap: 'An option that differs from yours by a constant is almost always the indefinite-integral answer offered to a definite-integral question. Check which question was asked before checking the arithmetic.'
    },
    {
      id: 's10d', start: 292.5, end: 300, scene: 'exam',
      caption: 'Check the answer against the picture before you commit.',
      detail: 'A positive function over an interval gives a positive integral. A function that is below the axis gives a negative one. An integral whose value exceeds the maximum height times the width is wrong. These three checks catch most arithmetic errors in seconds.',
      narration: 'Positive function, positive answer. Below the axis, negative. Never more than height times width.',
      keyword: 'the picture',
      trap: 'The height-times-width bound is an inequality, not an estimate. It rules out impossible answers and says nothing about whether a plausible one is correct.'
    }
  ]
};
