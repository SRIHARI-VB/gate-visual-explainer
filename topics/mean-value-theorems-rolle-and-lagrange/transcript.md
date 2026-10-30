# Mean value theorems: Rolle, Lagrange and Cauchy, and what each one licenses — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/mean-value-theorems-rolle-and-lagrange/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A chord, a tangent, and the point between them

*0:00 – 0:30 · objective: State Lagrange’s mean value theorem, see the chord whose slope is the average rate of change, and watch the tangent at the guaranteed point become parallel to it. One number, computed.*

**0:00–0:07** — The chord joins the two ends, and its slope is the average rate of change.

> Caption: The chord joining the two ends of an interval has a computable slope.

**0:07–0:15** — From 0 to 2 the chord rises by four over a width of two, so its slope is two.

> Caption: On x squared over 0 to 2 the chord slope is 2.

**0:15–0:22** — The derivative must equal two somewhere, and 2x equals 2 at x equals 1.

> Caption: The theorem promises a point c where the derivative equals 2, and here c = 1.

**0:22–0:30** — The tangent at the point is parallel to the chord. It is not the chord.

> Caption: Parallel, not equal: the tangent at c has the chord’s slope, not its position.

Exam-trap caption mode adds: *The theorem gives a tangent parallel to the chord. A tangent equal to the chord would require the function to be the chord, which it is not.*

## Scene 2. Rolle’s theorem is the flat chord

*0:30 – 1:00 · objective: See Rolle as the case where the chord is horizontal, watch the point where the derivative vanishes, and follow the auxiliary-function proof that turns Rolle back into the general theorem.*

**0:30–0:37** — When the ends are level the chord is flat, so the derivative is zero somewhere inside.

> Caption: Rolle’s theorem is the mean value theorem with a flat chord.

**0:37–0:45** — Both ends are zero, and the vertex at x equals 2 is where the tangent is flat.

> Caption: x squared minus 4x plus 3 on 1 to 3 has level ends, and the derivative vanishes at 2.

**0:45–0:52** — Subtract the chord and the ends become level, so Rolle applies to the difference.

> Caption: The general theorem follows from Rolle by subtracting the chord.

**0:52–1:00** — The difference has zero at both ends and a flat tangent at the same point.

> Caption: On the same example the auxiliary function is x squared minus 2x, flat-ended on 0 to 2.

Exam-trap caption mode adds: *Rolle is a special case, not a weaker theorem: it carries the same three hypotheses. Level ends never replace continuity or differentiability.*

## Scene 3. Three hypotheses, and what breaks when one fails

*1:00 – 1:30 · objective: Take the hypotheses one at a time and break each on purpose: absolute value for differentiability, a broken endpoint for continuity, and root x to show that differentiability at the endpoints is not required at all.*

**1:00–1:07** — Continuous including the ends, differentiable only inside. That is the exact hypothesis set.

> Caption: Continuity on the closed interval, differentiability on the open one, and that is all.

**1:07–1:15** — The corner at zero is the whole story: no derivative there, and no flat tangent anywhere.

> Caption: Absolute x on minus 1 to 1 has level ends, and its derivative is never 0.

Exam-trap caption mode adds: *A single interior point of non-differentiability is enough to break the conclusion. Differentiability at all the other points does not compensate.*

**1:15–1:22** — Move one endpoint value and the flat chord has nothing to match.

> Caption: Break continuity at an endpoint and the conclusion can fail too.

**1:22–1:30** — Root x is not differentiable at zero, and the theorem still holds, with c at a quarter.

> Caption: Differentiability at the endpoints is not required: root x on 0 to 1 gives c = 0.25.

Exam-trap caption mode adds: *Check where the differentiability is demanded before rejecting an example. At the endpoints it is not demanded at all.*

## Scene 4. The theorem promises one point, not a location

*1:30 – 2:00 · objective: Separate existence from uniqueness and from computability: one function with two admissible points, and one where every point of the interval is admissible.*

**1:30–1:37** — At least one point. The word at least is doing all the work.

> Caption: The theorem promises at least one point. It never promises only one.

**1:37–1:45** — Two points, plus and minus zero point five seven seven three five zero.

> Caption: x cubed minus x on minus 1 to 1 has level ends and two admissible points.

Exam-trap caption mode adds: *An answer that reports a single c for this function is incomplete, and a numerical solver that stops at the first sign change would report only one.*

**1:45–1:52** — Here the derivative is the chord slope at every single point.

> Caption: On the identity over 0 to 1, every interior point is admissible.

**1:52–2:00** — Solve for c, then count the solutions inside the interval before answering.

> Caption: So a question asking for the point is ill-posed unless uniqueness is forced.

## Scene 5. The theorem as a bounding tool

*2:00 – 2:30 · objective: Rewrite the conclusion as a difference equals a derivative times a width, then use it three ways: the sine inequality, the exponential inequality, and a two-sided bound on the square root of 101.*

**2:00–2:07** — The change is a derivative value times the width, and the point can be forgotten.

> Caption: Rewrite the conclusion: the change equals a derivative times the width.

**2:07–2:15** — Cosine never exceeds one, so the sine difference never exceeds the gap.

> Caption: Sine: the difference of two sines is at most the gap between the arguments.

**2:15–2:22** — The secant slope exceeds one, so the exponential outruns its tangent at zero.

> Caption: Exponential: e to the x exceeds 1 plus x for every positive x.

**2:22–2:30** — Between ten point zero four nine seven five one and ten point zero five.

> Caption: Root 101 is trapped between 10.049751 and 10.05 by one secant slope.

Exam-trap caption mode adds: *A one-sided bound is what the theorem gives immediately. The two-sided version needs one extra step of algebra, which is exactly where marks are lost.*

## Scene 6. Derivative sign, monotonicity and the constant theorem

*2:30 – 3:00 · objective: Derive the monotonicity test from the theorem, see why a strictly increasing function may have a zero derivative, and see why a zero derivative on a disconnected domain does not force a constant.*

**2:30–2:37** — Positive derivative, positive change, for every pair of points.

> Caption: A positive derivative on an interval forces the function to increase.

**2:37–2:45** — Zero derivative on an interval means the change between any two points is zero.

> Caption: A derivative that is zero everywhere on an interval forces a constant.

**2:45–2:52** — Increasing everywhere, flat tangent at one point. The implication runs one way only.

> Caption: The converse fails: x cubed is strictly increasing and its derivative is 0 at the origin.

Exam-trap caption mode adds: *Derivative zero is a candidate for an interior extremum, not a certificate of one. The sign change of the derivative is what decides.*

**2:52–3:00** — Two constant pieces, zero derivative everywhere, and two different values.

> Caption: On a domain in two pieces, a zero derivative everywhere still does not give a constant.

Exam-trap caption mode adds: *A derivative that vanishes on a disconnected domain says nothing across the gap. Check that the interval you are using lies inside the domain.*

## Scene 7. Cauchy’s version and the two-c error

*3:00 – 3:30 · objective: State the two-function version, compute its point on a pair where the answer is exactly 14 over 9, and show that applying the theorem to each function separately produces two different points — so the ratio may not be split.*

**3:00–3:07** — One point, both functions: the ratio of derivatives equals the ratio of changes.

> Caption: Cauchy’s version compares two functions at one and the same point.

**3:07–3:15** — Three over seven, and the point that produces it is fourteen over nine.

> Caption: x squared against x cubed on 1 to 2 gives a change ratio of 3 over 7, and c = 14 over 9.

**3:15–3:22** — One and a half against one point five two seven five two five: two different points.

> Caption: Applied separately, the two theorems give 1.5 and 1.527525 — different points.

Exam-trap caption mode adds: *Cancelling the changes and quoting the ordinary theorem twice is the standard wrong argument. The two points need not coincide, which is the entire content of Cauchy’s version.*

**3:22–3:30** — A ratio needs one point for both functions, and that is Cauchy’s contribution.

> Caption: That is why l’Hôpital’s rule needs the two-function version.

## Scene 8. Rolle as a root counter

*3:30 – 4:00 · objective: Between two zeros of a differentiable function sits a zero of its derivative. Use it forwards to locate derivative zeros and backwards to bound how many zeros a polynomial can have.*

**3:30–3:37** — Two zeros of the function force at least one zero of the derivative between them.

> Caption: Between two zeros of a differentiable function there is a zero of its derivative.

**3:37–3:45** — Three zeros, found by bisection, not read off a sketch.

> Caption: x cubed minus 3x plus 1 has three zeros: minus 1.879385, 0.347296 and 1.532089.

**3:45–3:52** — Minus one sits in the first gap and plus one in the second.

> Caption: The derivative 3 x squared minus 3 vanishes at minus 1 and at 1, one in each gap.

**3:52–4:00** — Each gap costs one derivative zero, so the zeros are capped by the degree.

> Caption: Read backwards: a degree n polynomial has at most n real zeros.

Exam-trap caption mode adds: *Rolle gives a lower bound on derivative zeros from function zeros. Turning it round gives an upper bound on function zeros. Both directions appear in questions, and they are not the same statement.*

## Scene 9. Four theorems that look like this one

*4:00 – 4:30 · objective: Put the differential mean value theorem beside the mean value theorem for integrals, the intermediate value theorem, the Darboux property of derivatives and Taylor’s theorem, and compute the two points that are most often confused.*

**4:00–4:07** — Four theorems, four different equations for the point they promise.

> Caption: Four results look like this one and answer different questions.

**4:07–4:15** — One theorem matches a slope, the other matches a height. Different points.

> Caption: On x squared over 0 to 2 the differential point is 1, the integral point is 1.154701.

Exam-trap caption mode adds: *The mean value theorem for integrals is not this theorem. Match the quantity in the equation: a derivative against a chord slope, or a function value against an average.*

**4:15–4:22** — One half is attained at plus and minus zero point seven zero seven one zero seven.

> Caption: The intermediate value theorem places values, not slopes.

**4:22–4:30** — A derivative can jump about and still take every value in between.

> Caption: Derivatives keep the intermediate value property even where they are discontinuous.

Exam-trap caption mode adds: *Do not conclude that a discontinuous derivative skips values. Darboux says it cannot, which is why a derivative can never have a jump discontinuity.*

## Scene 10. Reading the question

*4:30 – 5:00 · objective: Turn the topic into a three-question decision procedure: are the hypotheses met, is a point or a bound being asked for, and in which direction is Rolle being used.*

**4:30–4:37** — Hypotheses first: continuity including the ends, differentiability inside only.

> Caption: First: are the three hypotheses actually met?

**4:37–4:45** — Point, bound or count. The type decides the whole computation.

> Caption: Second: is a point wanted, a bound, or a count?

**4:45–4:52** — Solve, then count what lies strictly inside the interval.

> Caption: Third: solve, then count the solutions inside the interval.

**4:52–5:00** — Inside the interval, at least as large as the change, consistent with the degree.

> Caption: Finally: bound the answer before choosing an option.

Exam-trap caption mode adds: *The distractor is usually a conclusion the hypotheses do not license, such as a point at an endpoint, a tangent equal to the chord, or a bound tighter than the derivative allows.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
