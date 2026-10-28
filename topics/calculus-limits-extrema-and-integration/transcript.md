# Calculus: Limits, Extrema and Integration — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/calculus-limits-extrema-and-integration/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A limit is the value approached, not the value reached

*0:00 – 0:30 · objective: Read a limit as a statement about a neighbourhood, substitute first, and recognise the 0/0 form that blocks substitution.*

**0:00–0:07** — A limit is a statement about a neighbourhood, not about a point. It says the values of f can be forced as close to L as we like by keeping x close to a. Whether f is defined at a, and what it equals there, plays no part in the definition.

> Caption: A limit asks what f(x) settles near a, not what f(a) equals.

Exam-trap caption mode adds: *Do not answer a limit question by substituting and reporting whatever comes out. Substitution is a shortcut that is valid only when the function is continuous there.*

**0:07–0:15** — Put x equal to minus 3 into this quotient. The numerator becomes root of 16 minus 4, which is zero. The denominator becomes zero. Zero over zero is undefined, so substitution told us nothing. This is the signal to do work, not the signal that the limit is missing.

> Caption: Substituting here gives 0/0: the numerator is 0 and so is the denominator.

Exam-trap caption mode adds: *A 0/0 result is not evidence that the limit fails to exist. It means the substitution rule does not apply, and a different tool is needed.*

**0:15–0:22** — Because the form is zero over zero, L'Hopital applies. Differentiate the top: the chain rule gives one over the square root of 2x plus 22, and the factor of two cancels. Differentiate the bottom: it is one. Now the quotient is one over the square root, and that has no zero in the denominator at minus 3.

> Caption: Differentiate top and bottom separately: the top becomes one over the square root, the bottom becomes 1.

Exam-trap caption mode adds: *Never use the quotient rule here. L'Hopital differentiates the numerator and the denominator separately, which is not what the quotient rule does.*

**0:22–0:30** — Put minus 3 into the simplified expression: 2 times minus 3 plus 22 is 16, its square root is 4, and one over 4 is 0.25. The table of values either side of minus 3 climbs to the same number, which is what a limit means. Rationalising the numerator gives the same answer by a longer route.

> Caption: At x equal to minus 3 the answer is 1 over the square root of 16, which is 0.25.

Exam-trap caption mode adds: *The question asked for two decimal places, so 0.25 is written as 0.25, not as 1/4 and not as 0.2. A fraction answer in a numerical field scores zero.*

## Scene 2. Five indeterminate forms, five different moves

*0:30 – 1:00 · objective: Use L'Hopital only on 0/0 and infinity over infinity, and rewrite the other three forms into a fraction or a logarithm.*

**0:30–0:37** — There are five shapes that a limit can take where substitution fails. L'Hopital is allowed on exactly two of them: zero over zero, and infinity over infinity. For the other three you must first turn the expression into one of those two, or take a logarithm.

> Caption: Only two of the five indeterminate forms may be handed straight to L'Hopital.

Exam-trap caption mode adds: *Applying L'Hopital to 0 times infinity as it stands is a common and fatal error: the derivative quotient is meaningless because there is no quotient yet.*

**0:37–0:45** — Each of the other three shapes has one standard move. A product becomes a quotient by putting one factor underneath. A difference becomes a single fraction over a common denominator. A power is written as e to the g ln f, and then the exponent is the product shape, which you already know how to handle.

> Caption: 0 times infinity becomes a fraction; infinity minus infinity becomes a common denominator; 1 to the infinity takes a logarithm.

Exam-trap caption mode adds: *Taking a logarithm of a limit is valid because the exponential is continuous: the limit of e to the h is e to the limit of h. Without that sentence the step is unjustified.*

**0:45–0:52** — Here is the standard example. x to the one over x, as x goes to infinity, is infinity to the power zero. Take logs: ln x over x. Differentiate once and you get one over x, which goes to zero. So the logarithm of the answer is zero, and the answer itself is e to the zero, which is one.

> Caption: x to the power 1 over x is infinity to the zero; its logarithm has limit zero, so the limit is e to the zero, which is 1.

Exam-trap caption mode adds: *Reporting the limit of the logarithm as the answer is the error. The logarithm has limit 0; the original expression has limit 1.*

**0:52–1:00** — The other direction: one plus x squared times e to the minus x, as x goes to infinity, is infinity times zero. Push the exponential downstairs and it becomes infinity over infinity. Two applications of L'Hopital leave 2 over e to the x, which is zero. The exponential always wins, and that is why growth comparisons in algorithm analysis look the way they do.

> Caption: One plus x squared times e to the minus x is infinity times zero; as a fraction it is infinity over infinity and the limit is 0.

Exam-trap caption mode adds: *One application of L'Hopital is not enough here; stopping at 2x over e to the x still gives infinity over infinity and no answer.*

## Scene 3. Continuity: three conditions that must all hold

*1:00 – 1:30 · objective: Test continuity at a point with two one-sided limits plus the value, and solve for an unknown constant in a piecewise function.*

**1:00–1:07** — Continuity at a point is one equation: the limit equals the value. That equation can fail in three ways, and each has a picture. The limit may not exist, which is a jump or a blow-up. The value may not be defined, which is a hole. Or both exist and disagree, which is also a hole, moved.

> Caption: Continuous at a means three things at once: the limit exists, the value exists, and they are equal.

Exam-trap caption mode adds: *A function can be continuous everywhere except one point and still be the answer to "where is it discontinuous" with a single point. Do not answer with an interval out of habit.*

**1:07–1:15** — With a piecewise definition, do not substitute blindly. Take the limit from the left using the lower formula, take the limit from the right using the upper formula, and require both to equal the value the definition states at the join. Each unknown constant then costs one equation.

> Caption: For a piecewise function, compute the two one-sided limits separately and then match them to the stated value.

Exam-trap caption mode adds: *Using the wrong branch on one side is the most common arithmetic slip in this question type, and it is invisible in the final answer.*

**1:15–1:22** — Take the piecewise function from GATE 2026 Set 1. For positive x it is c one e to the x minus c two ln of one over x. As x shrinks to zero, e to the x goes to one quietly, but ln of one over x goes to plus infinity. A term that runs to infinity cannot be matched to the finite value 3.

> Caption: GATE CSE 2026 Set 1: as x tends to 0 from above, ln of 1 over x runs off to plus infinity.

Exam-trap caption mode adds: *ln of 1 over x is minus ln x, and minus ln x tends to plus infinity as x tends to zero from above. Getting that sign wrong reverses the conclusion.*

**1:22–1:30** — The only way to keep the limit finite is to switch the divergent term off, so c two is zero. Then the limit is c one, and it must equal 3. So c one plus c two is 3. Notice that nothing here needed a derivative: continuity is about values, not slopes.

> Caption: So c two must be 0, leaving c one equals 3, and c one plus c two equals 3.

Exam-trap caption mode adds: *Setting the whole limit equal to 3 while leaving c two free gives one equation in two unknowns, which cannot be solved. The vanishing coefficient is a separate requirement.*

## Scene 4. Differentiable means continuous, and the converse fails

*1:30 – 2:00 · objective: Define the derivative as the two one-sided slopes agreeing, and find every point where a piecewise function has no derivative.*

**1:30–1:37** — The derivative is itself a limit, and a limit is two-sided. So a function has a derivative at a point only when the slope computed from the left and the slope computed from the right are the same number. When they differ, the graph has a corner, and there is no tangent line.

> Caption: The derivative at a point exists when the two one-sided slopes agree.

Exam-trap caption mode adds: *Differentiable implies continuous, never the other way round. |x| at zero is the standard witness: continuous, and no derivative.*

**1:37–1:45** — The absolute value is the picture to keep. To the left of zero the slope is minus one; to the right it is plus one. At zero there is no single slope, so no derivative, even though the graph is unbroken. Continuity does not buy you a tangent.

> Caption: The absolute value has slope minus 1 on the left of 0 and plus 1 on the right, so there is no derivative at 0.

Exam-trap caption mode adds: *A corner is not the only failure. A vertical tangent, as in the cube root at zero, also destroys the derivative while keeping continuity.*

**1:45–1:52** — GATE 2024 Set 1 asks where the larger of x and x cubed fails to have a derivative. The two expressions cross where x cubed equals x, which factors as x times x minus 1 times x plus 1, so at minus 1, 0 and 1. At each crossing the winning formula changes, so each crossing is a candidate corner.

> Caption: For f equal to the larger of x and x cubed, the formula switches wherever x cubed equals x.

Exam-trap caption mode adds: *Finding the crossings is only half the work. A crossing where both pieces have the same slope would be smooth, so each candidate must still be checked.*

**1:52–2:00** — Check each crossing. At minus 1 the slopes are one and three. At zero they are zero and one. At one they are one and three. Every pair is unequal, so all three points are corners. Everywhere else the function agrees with a polynomial on a small interval, so it is smooth there. The answer is the set of those three points.

> Caption: At all three crossings the slopes differ, so the answer is the set minus 1, 0 and 1.

Exam-trap caption mode adds: *The question asks for a set, so a single number is wrong. Answering 0 because that is where the absolute value breaks is the trap this question was built on.*

## Scene 5. The mean value theorem: an average slope is an actual slope

*2:00 – 2:30 · objective: State the two hypotheses, and use the conclusion as an inequality to bound the value of a function at one endpoint.*

**2:00–2:07** — Two hypotheses, and both are used. Continuous on the closed interval, differentiable on the open one. Continuity at the two ends is what makes the average slope a number; differentiability inside is what makes a tangent exist everywhere it is needed. Rolle's theorem is the special case where the two endpoint values are equal.

> Caption: The mean value theorem needs continuity on the closed interval and differentiability on the open one.

Exam-trap caption mode adds: *Quoting differentiability on the closed interval is wrong and is used as a distractor. The theorem needs it only on the open interval.*

**2:07–2:15** — The conclusion is an existence statement: there is at least one interior point where the instantaneous slope equals the average slope over the whole interval. At least one, not exactly one. Picture a chord drawn between the two endpoints and then slide it up until it just touches the curve: the touching point is c.

> Caption: Then some interior point c has slope exactly equal to the average slope across the interval.

Exam-trap caption mode adds: *A single example does not prove the theorem, and the theorem does not say which c it is. Questions that ask for the value of c need the function, not just the hypotheses.*

**2:15–2:22** — Here is the previous-year item. The width of the interval is six. By the mean value theorem the average slope equals the slope at some interior point, and every interior slope is at most two. So the average slope is at most two. Write it as f of 3 minus 7 over 6, less than or equal to 2.

> Caption: GATE CSE 2021 Set 2: the average slope from minus 3 to 3 is f(3) minus 7, all over 6, and it equals a slope that is at most 2.

Exam-trap caption mode adds: *The direction of the inequality matters. The hypothesis bounds the slope above, so it bounds f(3) above; nothing here says f(3) is at least anything.*

**2:22–2:30** — Multiply by six: f of 3 minus 7 is at most twelve, so f of 3 is at most nineteen. And nineteen is reached, by the straight line 2x plus 13, which satisfies every hypothesis. A bound that is reached cannot be improved, which is what makes nineteen the answer and not merely a valid upper estimate.

> Caption: Multiplying through gives f(3) at most 19, and the straight line 2x plus 13 attains it, so 19 is the best possible bound.

Exam-trap caption mode adds: *The word "at most" asks for the tight bound. Giving a larger number that also happens to be an upper bound is a wrong answer.*

## Scene 6. Maxima and minima: find the critical points, then classify

*2:30 – 3:00 · objective: Solve f prime equals zero, read the sign change of the first derivative, and confirm with the second derivative.*

**2:30–2:37** — Two kinds of candidate only. Inside the interval, points where the derivative is zero or missing. And the two endpoints, which we treat separately. That is the complete list, so a question can never hide an extremum somewhere else.

> Caption: A local extremum can occur only at a critical point or at an endpoint.

Exam-trap caption mode adds: *Derivative zero does not mean extremum. x cubed at zero has zero slope and no extremum; the sign of the derivative must still change, or the second derivative must be non-zero.*

**2:37–2:45** — Take the official GATE 2023 question. Differentiate: 3x squared plus 30x minus 33. Divide by three and factor: x plus 11 times x minus 1. So the only two critical points are minus 11 and 1, and both are inside the domain, which is the whole real line.

> Caption: GATE CSE 2023: f prime is 3 times x plus 11 times x minus 1, so the critical points are minus 11 and 1.

Exam-trap caption mode adds: *Dividing by 3 before factoring is safe for roots but changes the second derivative, so do the division only in the first derivative step.*

**2:45–2:52** — Read the sign chart rather than the numbers. Left of minus 11 the derivative is positive, so the function climbs. Between the two roots it is negative, so the function falls. After 1 it is positive again. Climb then fall is a local maximum at minus 11; fall then climb is a local minimum at 1.

> Caption: The sign of f prime goes plus, minus, plus, so there is a local maximum at minus 11 and a local minimum at 1.

Exam-trap caption mode adds: *The sign chart gives the classification without any second derivative, and it also handles the case where the second derivative is zero. Use whichever is cheaper, but do not skip the sign check.*

**2:52–3:00** — Confirm with the second derivative: 6x plus 30. At minus 11 that is minus 36, negative, concave down, local maximum. At 1 it is plus 36, positive, concave up, local minimum. So the function has a local maximum and a local minimum, and the answer is B and D together. The values 811 and minus 53 are never asked for.

> Caption: The second derivative confirms it: minus 36 at minus 11 and plus 36 at 1, so statements B and D are true.

Exam-trap caption mode adds: *In a multiple-select question, choosing only B because you stopped at the first critical point loses half the marks. Both critical points must be classified.*

## Scene 7. On a closed interval the endpoints can win

*3:00 – 3:30 · objective: Compare the interior candidates with both endpoint values, and see a maximum that sits where no derivative exists.*

**3:00–3:07** — Here is the discipline that saves marks. The derivative only sees the inside. On a closed interval the maximum may sit exactly at an end, where the derivative has nothing to say. So evaluate at the critical points and at both endpoints, and compare the numbers you get.

> Caption: Setting the derivative to zero finds interior candidates only. On a closed interval the endpoints are candidates too.

Exam-trap caption mode adds: *A question that says "in the interval from a to b" almost always has its answer at an endpoint. Reading it as an open interval is the single most expensive misread in this topic.*

**3:07–3:15** — Take the parabola 2x squared minus 2x plus 6 on the interval from 0 to 2. The derivative 4x minus 2 vanishes at one half. The value there is 5.5. The parabola opens upward, so this is the lowest point of the curve, not the highest. Anyone who stops here reports 5.5 as the maximum and is wrong.

> Caption: For 2x squared minus 2x plus 6 on the interval from 0 to 2, the vertex is at one half and its value is 5.5.

Exam-trap caption mode adds: *Assuming the critical point is the maximum because the question asks for a maximum. The classification must be done, not assumed.*

**3:15–3:22** — Now the endpoints. At zero the value is six. At two the value is ten. Compare six, five point five and ten: the maximum is ten, and it is at the right endpoint. The interior critical point was the minimum all along. That is the trap, and it is why the closed interval must be read literally.

> Caption: The endpoints give 6 and 10, so the maximum on the closed interval is 10, attained at x equal to 2.

Exam-trap caption mode adds: *Answering 6 by checking only the left endpoint, or 5.5 by trusting the vertex, both lose the mark. All candidates must be evaluated.*

**3:22–3:30** — One more shape, from the aptitude section of a past paper: one minus the absolute value of x on the interval from minus one to one. It peaks at zero with value one, and at that peak there is a corner, so no derivative exists. A maximum can live exactly where the calculus cannot see it, which is why the candidate list has two kinds of interior point.

> Caption: A maximum need not be smooth: 1 minus the absolute value of x peaks at 0, where no derivative exists.

Exam-trap caption mode adds: *If you only solve f prime equals zero you will find no candidate at all here and may conclude the function has no maximum.*

## Scene 8. Integration by substitution, including the sign

*3:30 – 4:00 · objective: Change the variable, change the limits, and carry the minus sign that the substitution produces.*

**3:30–3:37** — Substitution is the chain rule read backwards. If you can see an inner function and, beside it, that function's derivative, name the inner function u. Then du is its derivative times dx, and the whole integrand rewrites itself in terms of u. What is left over must be only u.

> Caption: Substitution reverses the chain rule: put u equal to the inner function and du equal to its derivative times dx.

Exam-trap caption mode adds: *Substituting without replacing dx leaves a mixture of x and u, which is not a valid integral. The du line is not decoration.*

**3:37–3:45** — GATE 2015 Set 1. The integrand is cos of one over x, over x squared. Name u equal to one over x. Then du is minus one over x squared dx. So dx over x squared is minus du, and the minus sign arrives from the derivative. Write it down before you do anything else.

> Caption: In this integral the inner function is 1 over x, and its derivative brings a minus sign.

Exam-trap caption mode adds: *Dropping the minus sign gives plus 1 instead of minus 1, which is exactly the distractor in the original options.*

**3:45–3:52** — The limits are in x, so they must become limits in u. At the lower end x is one over pi, so u is pi. At the upper end x is two over pi, so u is pi over two. The minus sign reverses the direction, and reversing the direction of a definite integral changes its sign, so the interval becomes pi over two up to pi.

> Caption: The limits also change: from 1 over pi and 2 over pi to pi and pi over 2, and the minus sign flips their order.

Exam-trap caption mode adds: *Leaving the old limits in place while the variable is u is a silent error: the arithmetic still produces a number, and the number is wrong.*

**3:52–4:00** — The antiderivative of cos u is sin u. Evaluate at the top and subtract the value at the bottom: sin pi is zero, sin of pi over two is one, so the answer is minus one. The page also integrates the original expression numerically, and gets the same minus one, which is the check that the sign was handled correctly.

> Caption: The integral of cos u from pi over 2 to pi is sine pi minus sine pi over 2, which is 0 minus 1, so the answer is minus 1.

Exam-trap caption mode adds: *A definite integral of a positive-looking integrand can be negative, because the integrand is not positive: cos of one over x is negative on part of this interval.*

## Scene 9. Symmetry: the integral you never have to compute

*4:00 – 4:30 · objective: Use oddness over a symmetric interval, and the reflection trick, to evaluate definite integrals in one line.*

**4:00–4:07** — Before you integrate, look at the shape. If the interval runs from minus a to a, and the integrand is odd, meaning f of minus x is minus f of x, then the integral is zero. The two halves are mirror images with opposite signs, so they cancel exactly. No antiderivative is needed.

> Caption: Over an interval symmetric about zero, an odd integrand contributes exactly nothing.

Exam-trap caption mode adds: *The interval must be symmetric about zero, and the function must be odd. An even function over a symmetric interval doubles instead, and neither rule applies to an interval like 0 to 2.*

**4:07–4:15** — Here is the GATE 2023 triple integral. The integrand is 4x squared y minus z cubed, over a box that is symmetric in all three variables. Look at the first term: as a function of y it is odd, so integrating over y from minus 2 to 2 kills it. Look at the second: z cubed is odd in z, so integrating over z from minus 1 to 1 kills that too.

> Caption: GATE CSE 2023: the integrand is 4x squared y minus z cubed, over three symmetric intervals.

Exam-trap caption mode adds: *Do not expand into a full iterated integral first. The symmetry argument is exact and takes one line, and the expansion is where the arithmetic errors come from.*

**4:15–4:22** — Both pieces vanish, so the answer is zero. Nothing was integrated, and nothing needed to be. This is the kind of question where the mark is for spotting the symmetry, and the arithmetic is only there to punish people who start expanding.

> Caption: Both terms vanish, so the answer is 0, with no antiderivative computed at all.

Exam-trap caption mode adds: *A zero answer feels unsafe and invites a recheck. Verify it by naming the odd variable in each term, which is a proof, not a guess.*

**4:22–4:30** — The same idea in another costume, from GATE 2024 Set 2. The function satisfies f of x equals one minus f of 2 minus x, a reflection about the point 1. Substitute u equals 2 minus x and the integral becomes 2 minus itself. A number equal to 2 minus itself is 1, and that is the answer.

> Caption: Reflection works too: f(x) equals 1 minus f(2 minus x) forces the integral from 0 to 2 to equal 1.

Exam-trap caption mode adds: *The constant 1 in the relation contributes 1 times the length of the interval, which is 2, not 1. Forgetting to multiply by the width gives 0.5.*

## Scene 10. The four-step procedure and the traps it avoids

*4:30 – 5:00 · objective: Carry one checklist across limits, continuity, extrema and integration, with the previous-year items it settles.*

**4:30–4:37** — Start cheap. Put the number in. If you get a number, that is the answer, because the function is continuous there. Only when you get zero over zero, or infinity over infinity, or one of the other indeterminate shapes, do you reach for a theorem.

> Caption: Step one: substitute. If a number comes out, that is the limit and the work is done.

Exam-trap caption mode adds: *Skipping the substitution and differentiating immediately can be done on an expression that did not need it, and it produces a wrong value without any warning.*

**4:37–4:45** — Step two is the only place where differentiation is licensed, and only for the two quotient shapes. Anything else gets rewritten first. And remember that the rule is one-directional: when the derivative quotient has no limit, that is not a proof that the original limit does not exist.

> Caption: Step two: use L'Hopital only on 0/0 or infinity over infinity, and rewrite anything else into one of those two.

Exam-trap caption mode adds: *Repeated application without checking the form each time is how people end up differentiating something that is no longer indeterminate.*

**4:45–4:52** — Step three is bookkeeping. Write every candidate, evaluate the function at each one, and compare the values. A critical point tells you where to look; only the values tell you which one wins. If the interval is closed, both endpoints are on the list.

> Caption: Step three: for extrema, list the critical points and both endpoints, evaluate at every candidate, and compare the numbers.

Exam-trap caption mode adds: *Reporting the x-coordinate when the question asked for the maximum value, or the other way round, is a free mark lost.*

**4:52–5:00** — The last step is the two checks before integrating. Odd on a symmetric interval means zero. An inner function beside its derivative means substitute. And when you substitute, change the limits and keep the minus sign. Those three habits cover every calculus question the paper has asked in the last ten years.

> Caption: Step four: before integrating, check for symmetry and for an inner derivative, and never drop the minus sign from du.

Exam-trap caption mode adds: *Treating a definite integral as an antiderivative plus a constant. A definite integral is a number, and the constant of integration cancels.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
