# Integration Techniques And Definite Integrals — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/integration-techniques-and-definite-integrals/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A definite integral is a limit of rectangle sums

*0:00 – 0:30 · objective: Define the definite integral as the limit of a Riemann sum, and see that the four rectangle rules differ only in where the sample point sits inside each panel — so they share a limit and differ in how fast they get there.*

**0:00–0:07** — A definite integral is the signed area under a curve between two points.

> Caption: A definite integral is the area under a curve, counted with sign.

Exam-trap caption mode adds: *Area is never negative; a definite integral can be. If a curve dips below the axis the integral subtracts that part, and a question that says "area" wants the absolute value of each piece.*

**0:07–0:15** — Four rectangle rules, one limit. At ten panels they give 0.285, 0.385, 0.335 and 0.3325 against one third.

> Caption: Left, right, midpoint and trapezoid differ only in the sample height.

Exam-trap caption mode adds: *The left and right rules straddle the answer only for an increasing function. For a decreasing one the inequality flips, and a question may test exactly that.*

**0:15–0:22** — The left rule is first order, so the error falls like one over n. The trapezoid and midpoint rules are second order, so the error falls like one over n squared.

> Caption: Ten times as many panels cuts the left-rule error by about ten.

Exam-trap caption mode adds: *A rule that is more accurate at large n is not automatically more accurate at small n. At ten panels the midpoint rule beats the trapezoid rule by exactly a factor of two here, not by a factor of n.*

**0:22–0:30** — The sum is the definition. The next scene is the theorem that replaces it.

> Caption: The integral is the limit, and the limit is what the theorem evaluates.

Exam-trap caption mode adds: *A Riemann sum with n panels is an approximation, not the integral. Writing "approximately" is correct at finite n and wrong after the limit is taken.*

## Scene 2. The fundamental theorem: area by antiderivative

*0:30 – 1:00 · objective: State both halves of the fundamental theorem, and use the second half to turn an area into one subtraction F(b) minus F(a) on three standard integrals.*

**0:30–0:37** — Let the upper limit move. The accumulated area grows at a rate equal to the height of the curve.

> Caption: The accumulation function differentiates back to the integrand.

Exam-trap caption mode adds: *The first half needs f continuous at the point where the derivative is taken. At a jump, the accumulation function is continuous but not differentiable, and a question can ask exactly that.*

**0:37–0:45** — If F is an antiderivative, the integral is F at b minus F at a. Any antiderivative works.

> Caption: The second half turns an area into one subtraction.

Exam-trap caption mode adds: *The constant of integration is required for an indefinite integral and irrelevant for a definite one. Adding plus C to a definite answer is not a small slip; it is a wrong answer to a different question.*

**0:45–0:52** — One, two, and pi by four. Each is one subtraction once the antiderivative is known.

> Caption: Three standard integrals, evaluated.

Exam-trap caption mode adds: *The antiderivative of 1 over x is the logarithm of the absolute value of x. Dropping the absolute value is only safe when the interval is entirely positive.*

**0:52–1:00** — Five rows of a table. Substitution, by parts and partial fractions are three ways of reaching them.

> Caption: The table is small, and every technique reduces to it.

Exam-trap caption mode adds: *The power rule fails at exponent minus one, where the answer is a logarithm rather than a power. That single exception is the most frequently tested row in the table.*

## Scene 3. The five properties that do the work

*1:00 – 1:30 · objective: Establish additivity, reversal, linearity, comparison and the odd/even rule, each checked on a function rather than asserted.*

**1:00–1:07** — Splitting the interval at any point splits the integral into two that add back to the original.

> Caption: Additivity: a middle point splits the integral into two.

Exam-trap caption mode adds: *Additivity lets a point sit outside the interval, and then one of the pieces is negative in orientation. A question that says the point lies between a and b is adding a condition the theorem does not need.*

**1:07–1:15** — Swapping the limits multiplies the answer by minus one.

> Caption: Reversal: swapping the limits flips the sign.

Exam-trap caption mode adds: *Reversal changes the sign, not the magnitude, and it is not the same as taking the absolute value. A curve below the axis has a negative integral without any reversal at all.*

**1:15–1:22** — Constants pull out, sums split. That is how a polynomial is integrated one term at a time.

> Caption: Linearity: constants come out and sums split.

Exam-trap caption mode adds: *Linearity applies to sums and constant multiples only. There is no rule for a product or a quotient, which is the whole reason by parts and partial fractions exist.*

**1:22–1:30** — Odd cancels, even doubles. The test is whether f of minus x equals minus f of x or plus f of x.

> Caption: Symmetry: an odd integrand cancels over a symmetric interval.

Exam-trap caption mode adds: *The rule needs the interval symmetric about zero. An odd function over an interval that is not symmetric does not cancel, and the answer is generally not zero.*

## Scene 4. Substitution, and what happens to the limits

*1:30 – 2:00 · objective: Reverse the chain rule, and show on one worked integral that the limits must be converted into the new variable — the single most common lost mark in this topic.*

**1:30–1:37** — Look for an inner function whose derivative is also present. That is the signal for substitution.

> Caption: Substitution is the chain rule read backwards.

Exam-trap caption mode adds: *If the derivative is present but off by a constant, the constant can be moved outside. If it is missing entirely, substitution is not the technique, and forcing it produces a wrong answer confidently.*

**1:37–1:45** — Both limits move. Zero stays zero and two becomes four, and the answer is e to the fourth minus one.

> Caption: The limits must be rewritten in the new variable.

Exam-trap caption mode adds: *Evaluating the new antiderivative at the old limits is the commonest error in the topic. Either convert the limits, or convert back to x before substituting them.*

**1:45–1:52** — Direct quadrature and the substituted integral agree to twelve decimal places.

> Caption: The two routes agree exactly, not approximately.

Exam-trap caption mode adds: *A numerical agreement to a few places proves nothing about a technique in general. Here the check is worth making because the closed form is known; it is evidence about this instance, not a proof of the rule.*

**1:52–2:00** — Change the variable, change the differential, change the limits. Three changes, one substitution.

> Caption: The differential has to be replaced as well as the variable.

Exam-trap caption mode adds: *A substitution written without its du is not a substitution. It is the most common way to lose the constant that the chain rule put there.*

## Scene 5. Integration by parts and the boundary term

*2:00 – 2:30 · objective: Derive the by-parts formula from the product rule, use the LIATE order to choose the parts, and show a case where the boundary term is the whole answer.*

**2:00–2:07** — Integrate the product rule and rearrange: u d v equals u v minus v d u.

> Caption: By parts comes from the product rule.

Exam-trap caption mode adds: *The formula is symmetric in appearance and not in use. Choosing the parts badly makes the new integral harder than the original, which is the only real failure mode of the technique.*

**2:07–2:15** — Logarithm, inverse trig, algebraic, trig, exponential. Take u from the left of that list.

> Caption: LIATE orders the choices when both parts are plausible.

Exam-trap caption mode adds: *LIATE is a rule of thumb, not a theorem. It gives no answer for a product of two functions from the same group, where the useful move is often to apply the formula twice and solve for the integral.*

**2:15–2:22** — Boundary term e, remaining integral e minus one, and the difference is one.

> Caption: The boundary term carries the whole answer here.

Exam-trap caption mode adds: *Dropping the boundary term, or evaluating it at only one limit, is the standard arithmetic error. The boundary term is a subtraction of two numbers, not a single evaluation.*

**2:22–2:30** — Differentiate the polynomial down to zero, integrate the exponential alongside, alternate the signs. The answer is e minus two.

> Caption: Repeated by parts has a tabular form.

Exam-trap caption mode adds: *The tabular method only terminates for a polynomial factor. Against a logarithm or an inverse trigonometric function the column never reaches zero, and the table gives an infinite series instead of an answer.*

## Scene 6. Partial fractions and the logarithm rule

*2:30 – 3:00 · objective: Split a rational integrand into pieces that are standard forms, and recognise the derivative-over-denominator rule that produces a logarithm.*

**2:30–2:37** — Factor the denominator, split the fraction, solve for the numerators, integrate each piece.

> Caption: A rational integrand is split into standard pieces.

Exam-trap caption mode adds: *The split is valid only when the numerator has lower degree than the denominator. If it does not, polynomial division comes first, and skipping it produces an unsolvable system.*

**2:37–2:45** — A squared factor needs two terms: one over the factor and one over its square.

> Caption: Repeated factors need every power in the split.

Exam-trap caption mode adds: *A quadratic factor that does not factor over the reals gets a linear numerator, not a constant. Assuming a constant there produces a system with no solution and no obvious reason why.*

**2:45–2:52** — Derivative over denominator integrates to a logarithm. Here that is the logarithm of two.

> Caption: Derivative over denominator gives a logarithm.

Exam-trap caption mode adds: *The rule needs the numerator to be the derivative up to a constant, and the constant is a factor outside the logarithm, not inside it. Writing the logarithm of twice the denominator is wrong by a constant.*

**2:52–3:00** — Divide first when the numerator is not smaller. Then split what remains.

> Caption: Long division first, then the split.

Exam-trap caption mode adds: *A question that supplies a fraction with equal degrees is testing exactly this step. The answer options usually differ by a polynomial term that division would have produced.*

## Scene 7. The mean value theorem for integrals

*3:00 – 3:30 · objective: Show that a continuous function takes its average value somewhere on the interval, compute the point for a worked case, and see what fails when continuity is dropped.*

**3:00–3:07** — Average value is the integral divided by the width of the interval.

> Caption: The average value of a function is its integral over the width.

Exam-trap caption mode adds: *The average value is not the average of the endpoint values, and it is not the midpoint value. For x squared on the interval from 0 to 3 the three numbers are 3, 4.5 and 2.25.*

**3:07–3:15** — Continuity forces the curve through its own average value at some point.

> Caption: A continuous function reaches its average value somewhere.

Exam-trap caption mode adds: *The theorem guarantees existence, not uniqueness, and it gives no formula for c. A question that asks for the number of such points is asking something the theorem does not answer.*

**3:15–3:22** — Average three, so c is the square root of three, about 1.732. The negative root is outside the interval.

> Caption: For x squared on the interval from 0 to 3, c is the square root of 3.

Exam-trap caption mode adds: *Both roots of the equation usually appear as answer options. Only the one inside the stated interval satisfies the theorem, and the interval is part of the hypothesis.*

**3:22–3:30** — A step function with average one never takes the value one. Continuity is the hypothesis doing the work.

> Caption: Without continuity there need not be such a point.

Exam-trap caption mode adds: *The theorem is stated for the closed interval. Continuity only on the open interval is not enough, which is why the statement names the closed interval explicitly.*

## Scene 8. Improper integrals: when the area is infinite

*3:30 – 4:00 · objective: Define convergence for an infinite limit and for an infinite integrand, apply the p-test, and see that a function blowing up at an endpoint can still enclose a finite area.*

**3:30–3:37** — Integrate to a finite bound, then take the limit. Finite answer, convergence; otherwise divergence.

> Caption: An infinite limit of integration is handled by a limit.

Exam-trap caption mode adds: *Writing the answer as a number without taking the limit is the error. The symbol for infinity is not a number that can be substituted into an antiderivative.*

**3:37–3:45** — To infinity converges for p above one. To zero converges for p below one. The direction of the tail decides.

> Caption: The p-test settles the whole family at once.

Exam-trap caption mode adds: *The two halves have opposite inequalities, and mixing them up is the single most common error on the topic. A question that names both endpoints is asking for both conditions at once.*

**3:45–3:52** — Six point nine, thirteen point eight, twenty point seven. The values grow without bound, so the area is infinite.

> Caption: The logarithm integral diverges, but only logarithmically.

Exam-trap caption mode adds: *Slow growth is not convergence. A table of three values that look almost stable is exactly the trap this function sets, and the p-test is what settles it.*

**3:52–4:00** — The logarithm goes to minus infinity at zero, and its integral from zero to one is minus one.

> Caption: An integrand that blows up can still enclose a finite area.

Exam-trap caption mode adds: *Unbounded is not divergent. A function with a vertical asymptote can have a finite integral, and the reverse is also possible, so neither word implies the other.*

## Scene 9. Where GATE uses this: continuous probability

*4:00 – 4:30 · objective: Read a density, a cumulative distribution and an expectation as three integrals, and check each against its closed form for the exponential, uniform and normal laws.*

**4:00–4:07** — Density integrates to one. Probability is an integral over an interval. The cumulative distribution is the running integral.

> Caption: A density is a function whose integral is one.

Exam-trap caption mode adds: *A density value is not a probability, and it can exceed one on a narrow interval. Only its integral over an interval is a probability, which is why a density with a height of 2 is perfectly legal.*

**4:07–4:15** — Total one, mean one half, second moment one half, variance one quarter, and the probability below one half is 0.632.

> Caption: Expectation is the integral of x against the density.

Exam-trap caption mode adds: *The mean of an exponential is one over the rate, not the rate. With rate 2 the mean is one half, and an option that says 2 is testing whether the parameter was read as a mean or as a rate.*

**4:15–4:22** — The same three integrals for every law: total, first moment, second moment.

> Caption: Uniform and normal, checked by the same three integrals.

Exam-trap caption mode adds: *The normal has no elementary antiderivative, so its probabilities are read from a table or computed numerically. Claiming a closed form for the tail is a claim that cannot be backed.*

**4:22–4:30** — The integral defines the expectation. Averaging samples only estimates it.

> Caption: A sum over samples is an approximation, not the expectation.

Exam-trap caption mode adds: *The law of large numbers is about convergence of an average, not about equality at any finite sample size. No finite sample equals the expectation in general.*

## Scene 10. Reading the question

*4:30 – 5:00 · objective: Turn the technique list into a decision procedure for an exam item, and name the four errors that are offered as answer options.*

**4:30–4:37** — Evaluate, locate, decide convergence, or connect to probability. Name the type first.

> Caption: First ask which of the four question types this is.

Exam-trap caption mode adds: *A question that presents an improper integral inside a probability setting is still a convergence question first. Reading it as an evaluation question leads to a finite answer that does not exist.*

**4:37–4:45** — Classify the integrand, then pick the technique. Product, inner function, or rational.

> Caption: For evaluation, classify the integrand before choosing a technique.

Exam-trap caption mode adds: *Two techniques often both work, and one is much shorter. The exam does not award the longer route, so it is worth checking whether the derivative of an inner function is already present.*

**4:45–4:52** — Old limits, missing boundary term, a stray constant, a divergent integral treated as finite.

> Caption: Four errors are offered as options, and three are recognisable.

Exam-trap caption mode adds: *An option that differs from yours by a constant is almost always the indefinite-integral answer offered to a definite-integral question. Check which question was asked before checking the arithmetic.*

**4:52–5:00** — Positive function, positive answer. Below the axis, negative. Never more than height times width.

> Caption: Check the answer against the picture before you commit.

Exam-trap caption mode adds: *The height-times-width bound is an inequality, not an estimate. It rules out impossible answers and says nothing about whether a plausible one is correct.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
