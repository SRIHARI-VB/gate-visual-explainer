# Master Theorem Cases And Boundaries — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/master-theorem-cases-and-boundaries/index.html`
- Total duration: 5:56 (356 seconds), 11 scenes, 44 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A recurrence is a recipe; the theorem is a closed form

*0:00 – 0:32 · objective: name the three ingredients a, b and f in T(n) = a T(n/b) + f(n), and say what the theorem is asked to decide*

**0:00–0:08** — Three ingredients. How many pieces the problem splits into. How much smaller each piece is. And what it costs to split and recombine. Every recurrence this lesson solves is those three numbers written down.

> Caption: Three ingredients: how many pieces a problem splits into, how much smaller each piece is, and what the splitting costs.

**0:08–0:16** — Written down, that is T of n equals a times T of n over b, plus f of n. a is the number of pieces and is at least one. b is the shrink factor and is greater than one. f of n is the work done at this level, outside the recursive calls.

> Caption: Written T(n) = a T(n/b) + f(n): a pieces, each of size n/b, plus f(n) for the divide and the recombine.

**0:16–0:24** — The theorem answers exactly one question. Of the three parts of the recursion tree, which one carries the work: the root, the middle levels, or the leaves at the bottom? Everything else in the theorem is the bookkeeping of that answer.

> Caption: The theorem answers one question: which part of the work dominates, the top, the levels, or the leaves.

**0:24–0:32** — So this is not a formula to memorise. It is a comparison between two quantities, and the comparison is the method. Get the comparison right and the answer follows without any table.

> Caption: It is not a formula to memorise. It is a comparison between two quantities, and the comparison is the whole method.

Exam-trap caption mode adds: *The theorem applies only to a T(n/b) + f(n) with a and b constant. A recurrence that subtracts instead of divides, or whose coefficient grows with n, is not a near miss; it is a different problem, and scene 10 shows three of them.*

## Scene 2. The watershed: what the leaves of the tree cost

*0:32 – 1:02 · objective: derive n^(log_b a) as the number of leaves, and see why every case is a comparison with it*

**0:32–0:40** — At depth i the tree has a to the i subproblems, and each of them is of size n over b to the i. That is the entire structure of the tree: nothing else varies with depth.

> Caption: At depth i the tree has a^i subproblems, each of size n / b^i. That is the whole structure.

**0:40–0:48** — The recursion stops when a subproblem has size one, which happens after k levels, where k is log base b of n. At n equal to one thousand and twenty-four with b equal to two, k is ten.

> Caption: Subproblems stop when the size reaches 1. Halving 1024 ten times takes 10 levels: k = log base b of n.

**0:48–0:56** — So the number of leaves is a to the k, which is a to the log base b of n, which is n to the log base b of a. With a equal to four and b equal to two, that exponent is two, so the leaves number n squared, which at n equal to one thousand and twenty-four is one million, forty-eight thousand, five hundred and seventy-six.

> Caption: So the leaves number a^k = a^(log_b n) = n^(log_b a). At a = 4, b = 2 that is n squared: 1048576 leaves.

**0:56–1:02** — Call that number the watershed. Every case of the theorem is a comparison between f of n and this quantity, and nothing else.

> Caption: Call it the watershed. Every case of the theorem is a comparison between f(n) and this number.

## Scene 3. Case 1: the leaves pay the bill

*1:02 – 1:36 · objective: read the level weights of 4T(n/2) + n, see them double downward, and sum them to 2n^2 - n*

**1:02–1:10** — Take a equal to four, b equal to two, and f of n equal to n. Level i costs four to the i times n over two to the i, which is n times two to the i. Each level down multiplies the work by two.

> Caption: Take a = 4, b = 2, f(n) = n. Each level down multiplies the work by a/b, which is 2.

**1:10–1:18** — At n equal to one thousand and twenty-four the eleven levels cost one thousand and twenty-four, two thousand and forty-eight, four thousand and ninety-six, and so on, doubling each time, up to one million and forty-eight thousand at the leaves.

> Caption: At n = 1024 the levels cost 1024, 2048, 4096, and so on up to 1048576 at the leaves.

**1:18–1:26** — The last level alone is n squared, which is bigger than the sum of every level above it. So the total is twice the leaves, roughly: exactly two n squared minus n, which at n equal to one thousand and twenty-four is two million, ninety-six thousand, one hundred and twenty-eight.

> Caption: The last level alone is n squared, larger than everything above it. The sum is 2n squared minus n: 2096128.

**1:26–1:36** — So T of n is Theta of n squared, and n squared is n to the log base b of a. The leaves pay the bill. That is case 1: f is polynomially smaller than the watershed, so the watershed is the answer.

> Caption: So T is Theta of n squared, which is Theta of n^(log_b a). The leaves pay the bill: case 1.

Exam-trap caption mode adds: *Case 1 is not "f is smaller". It is "f is smaller by a polynomial factor". A factor of log n is not a polynomial factor, and scene 8 shows what happens then.*

## Scene 4. Case 2: every level costs the same

*1:36 – 2:10 · objective: read the level weights of 4T(n/2) + n^2, see them constant, and multiply one level by the number of levels*

**1:36–1:44** — Same a and b, but now f of n is n squared. Level i costs four to the i times n squared over four to the i, and the fours cancel exactly. Every level costs the same.

> Caption: Same a and b, but f(n) = n squared. Level i costs 4^i times n squared over 4^i: the 4s cancel.

**1:44–1:52** — Eleven levels, each of them costing one million, forty-eight thousand, five hundred and seventy-six. No level dominates any other, so the total is one level times the number of levels.

> Caption: Eleven levels, each costing 1048576. No level dominates, so the count is one level times the number of levels.

**1:52–2:00** — The sum is n squared times k plus one, which at these numbers is eleven million, five hundred and thirty-four thousand, three hundred and thirty-six. So T is Theta of n squared log n. The extra log is the height of the tree and nothing else.

> Caption: The sum is n squared times (k + 1) = 11534336. T is Theta of n squared log n: the log is the height of the tree.

**2:00–2:10** — That is case 2: f of n is Theta of the watershed. The answer is the watershed times a log, and the constant in front of it is exactly one, which is why the textbook can state it as an equality.

> Caption: Case 2: f equals the watershed. The answer is the watershed times a log, and the constant in front is 1.

Exam-trap caption mode adds: *The log in case 2 does not come from a sorting step or from a binary search inside the algorithm. It comes from the number of levels, and it appears only when the levels tie.*

## Scene 5. Case 3: the root pays the bill

*2:10 – 2:44 · objective: read the level weights of 4T(n/2) + n^3, see them halve downward, and bound the whole sum by twice the root*

**2:10–2:18** — Same a and b once more, and now f of n is n cubed. Level i costs four to the i times n cubed over eight to the i, which is n cubed over two to the i. The work halves with every level down.

> Caption: Same a and b once more, f(n) = n cubed. Level i costs 4^i times n cubed over 8^i: the work halves each level.

**2:18–2:26** — The root alone costs one billion, seventy-three million, seven hundred and forty-one thousand, eight hundred and twenty-four. Everything below it adds up to less than the root again, because the series halves.

> Caption: The root costs 1073741824. Everything below it adds up to less than the root again.

**2:26–2:34** — The exact sum is two billion, one hundred and forty-six million, four hundred and thirty-five thousand and seventy-two, just under twice n cubed. So T is Theta of n cubed, which is Theta of f of n.

> Caption: The exact sum is 2146435072, just under 2n cubed. T is Theta of n cubed, which is Theta of f(n).

**2:34–2:44** — That is case 3: the root pays the bill, and the answer is f of n. This is the only one of the three cases that carries a second condition, and the next two scenes are about that condition and about what happens when it fails.

> Caption: Case 3: the root pays the bill. This is the one case that carries a second condition, and scene 7 is that condition.

## Scene 6. One picture, three regimes

*2:44 – 3:12 · objective: place the watershed curve and three f curves on one axis, and state the decision rule with its polynomial gap*

**2:44–2:52** — Here is the whole theorem in one picture. The watershed n to the log base b of a, drawn against f of n, on axes that are logarithmic in both directions, so that every power of n appears as a straight line and its exponent is its slope.

> Caption: One picture: the watershed n^(log_b a) against f(n), both drawn on log-log axes so a power is a straight line.

**2:52–3:00** — A line below the watershed means f grows more slowly than the leaves can multiply, so the leaves win and the answer is the watershed. A line on it means the levels tie, and the tie contributes one log. A line above it means the root wins and the answer is f.

> Caption: Below: the leaves win. Equal: the levels tie and a log appears. Above: the root wins.

**3:00–3:06** — Below and above do not mean merely smaller or larger. They mean by a polynomial factor: f of n is at most the watershed divided by n to the epsilon, for one fixed epsilon above zero. The gap has to grow without bound.

> Caption: Below and above mean by a polynomial factor: f is at most the watershed over n^epsilon, for one fixed epsilon above zero.

**3:06–3:12** — The page does not take this on trust. It takes seventy-two combinations of a, b and p, classifies each one by the rule, and then checks the answer numerically by unrolling. All seventy-two agree with the rule.

> Caption: The page classifies every (a, b, p) on a 72-entry grid and checks each answer numerically. All 72 agree.

## Scene 7. The regularity condition, and why polynomials never fail it

*3:12 – 3:46 · objective: state case 3's second hypothesis, compute a f(n/b) / f(n) = a/b^p for f(n) = n^p, and see it is the same condition as the polynomial gap*

**3:12–3:20** — Case 3 has a second hypothesis, and the textbook states it in the same breath as the first. There must be a constant c strictly below one such that a times f of n over b is at most c times f of n, for every sufficiently large n.

> Caption: Case 3 has a second hypothesis: a times f(n/b) is at most c times f(n), for some c below 1 and every large n.

**3:20–3:28** — In words: each level down costs less than the level above by a fixed fraction, so the series of levels converges and the root dominates. With c equal to a half, the whole tree costs at most twice the root.

> Caption: In words: each level down costs less than the one above, by a fixed fraction. That is what makes the series converge.

**3:28–3:36** — Now the useful part. When f of n is n to the p, the ratio a times f of n over b, divided by f of n, is exactly a over b to the p, with no n in it. So a c below one exists exactly when a over b to the p is below one, which is exactly when p is above log base b of a.

> Caption: For f(n) = n^p the ratio is exactly a / b^p. So c below 1 is the same statement as p above log_b a.

**3:36–3:46** — So for a polynomial f the regularity condition is not extra work at all. It is the same statement as the polynomial gap, which is why papers never test it separately. At a equal to eight, b equal to two and p equal to three the ratio is exactly one: that is the boundary, and it is case 2, not case 3.

> Caption: So for a polynomial f the condition is not extra work: it is case 3 own polynomial gap. At a = 8, b = 2, p = 3 the ratio is exactly 1, the boundary.

Exam-trap caption mode adds: *A theorem whose hypothesis fails does not say the conclusion is false. It says the theorem is silent. Showing that the conclusion still holds in such a case requires a separate argument, not a citation.*

## Scene 8. The gap: n / log n is smaller, but not polynomially smaller

*3:46 – 4:22 · objective: see that no epsilon makes n^epsilon / log n bounded, unroll to the harmonic weights, and land on n(1 + H_k)*

**3:46–3:54** — Now the case the theorem cannot answer. Take a equal to two, b equal to two, so the watershed is n, and take f of n equal to n divided by log base two of n.

> Caption: Now the case the theorem cannot answer: f(n) = n / log n, with a = 2, b = 2. The watershed is n.

**3:54–4:02** — Case 1 would need n over log n to be at most n over n to the epsilon, which is the same as n to the epsilon over log n being bounded. That quantity is not bounded; it grows without limit.

> Caption: Case 1 would need n / log n at most n over n^epsilon, that is n^epsilon over log n bounded. It is not bounded.

**4:02–4:10** — So no positive epsilon makes the gap polynomial, and case 1 does not apply. Case 2 does not apply because f is not equal to the watershed, and case 3 does not apply because f is smaller than it. The theorem is silent.

> Caption: So no epsilon works, and case 1 does not apply. Neither does case 2 or 3: f is not equal to n, and it is not polynomially larger.

Exam-trap caption mode adds: *The most common error in this topic is answering Theta of n for n / log n by quoting case 1. Case 1 needs the polynomial gap, and a log factor is not one.*

**4:10–4:22** — So unroll instead. Level i weighs two to the i times n over two to the i, divided by k minus i, which is n over k minus i. The weights are n over ten, n over nine, and so on up to n over one: a harmonic series. Its sum is n times one plus the k-th harmonic number, which is Theta of n log log n.

> Caption: Unrolling gives level weights n/k, n/(k-1), and so on up to n/1: a harmonic sum. T = n(1 + H_k), which is Theta of n log log n.

## Scene 9. Extended case 2: when f carries a log factor

*4:22 – 4:52 · objective: apply f = n^(log_b a) log^k n giving n^(log_b a) log^(k+1) n, and check the constant at k = 0, 1, 2*

**4:22–4:30** — One more boundary, this time on the other side of case 2. Take a equal to two, b equal to two, and f of n equal to n times log base two of n. It is not equal to the watershed, because of the log, and it is not polynomially larger, because the log is not a power.

> Caption: One more boundary, on the other side: f(n) = n log n with a = 2, b = 2. f is neither equal to n nor polynomially larger.

**4:30–4:38** — The extension of case 2 says: if f of n is the watershed times log to the k of n, for any k at least zero, then T is the watershed times log to the k plus one of n. Each power of log in f costs exactly one more power in the answer.

> Caption: Extended case 2: if f is the watershed times log^k n, the answer is the watershed times log^(k+1) n. One extra log.

**4:38–4:46** — For this recurrence the exact solution is n times one plus k times k plus one over two. Divided by n k squared it is 0.578 at k equal to eight, 0.549 at k equal to twelve, and it tends to one half. So T is Theta of n log squared n, and the constant is a half.

> Caption: Here T = n(1 + k(k+1)/2) exactly. Divided by n k squared it is 0.578 at k = 8, falling to 0.5: Theta of n log squared n.

**4:46–4:52** — The rule is checked for three values of k. With f equal to n the answer is n log n. With f equal to n log n the answer is n log squared n. With f equal to n log squared n the answer is n log cubed n. Three rungs of one ladder.

> Caption: Checked for k = 0, 1 and 2: f equal to n, n log n, n log squared n give n log n, n log squared n, n log cubed n.

## Scene 10. Three shapes the theorem refuses

*4:52 – 5:24 · objective: recognise subtract-and-conquer, a domain transform, and a non-polynomial gap, and know to unroll instead*

**4:52–5:00** — The theorem applies to a times T of n over b plus f of n, and to nothing else. Here are three shapes it refuses, and each one needs its own method rather than a formula.

> Caption: The theorem applies to a T(n/b) + f(n) and to nothing else. Three shapes it refuses, and each needs its own method.

**5:00–5:08** — First, subtract and conquer: T of n equals two T of n minus one, plus n times two to the n. The size falls by one rather than by a factor, so there is no b, and the theorem has nothing to say. Unrolling gives about a half n squared two to the n, which the page computes exactly at n equal to forty.

> Caption: Subtract and conquer: T(n) = 2T(n-1) + n 2^n. The size falls by one, not by a factor, so b does not exist.

**5:08–5:16** — Second, a domain transform: T of n equals the square root of n times T of the square root of n, plus n. The coefficient in front of the recursive call is not a constant, so there is no a either. Substituting n equal to two to the two to the m turns it into a sum that adds one per step, and the answer is n log log n.

> Caption: A domain transform: T(n) = root n times T(root n) + n. The coefficient is not a constant, so a does not exist.

**5:16–5:24** — And third, the gap: an f that sits between the watershed divided by any power of n and the watershed itself. There the theorem is silent, and the method is to unroll the tree, as scene 8 did, or to guess the answer and prove it by substitution.

> Caption: And a non-polynomial gap: f between the watershed over n^epsilon and the watershed. Unroll, or substitute a guess and prove it.

## Scene 11. Previous-year items, recomputed

*5:24 – 5:56 · objective: answer three verified CSE items from the classification rather than from memory, then state the four-step procedure*

**5:24–5:32** — GATE CSE 2014, Set 2 asks for the solution of T of n equals two T of n over two, plus log n. The watershed is n. A logarithm is below n to the 0.5, which is a polynomial gap, so case 1 applies and the answer is Theta of n. The exact solution is three n minus log n minus two, which the page computes.

> Caption: GATE CSE 2014, Set 2: T(n) = 2T(n/2) + log n. The watershed is n, and a log is polynomially below any power: case 1.

**5:32–5:40** — GATE CSE 2024, Set 1 asks about T of n equals root n times T of root n, plus n. The coefficient is not constant, so this is the second refused shape. Substituting gives n log log n, and the page computes T over n log log n at n equal to two to the 512 and reports it near one point one nine.

> Caption: GATE CSE 2024, Set 1: T(n) = root n T(root n) + n. Not the theorem shape: substituting n = 2^(2^m) gives n log log n.

**5:40–5:48** — GATE CSE 2025, Set 1 asks about T of n equals two T of n minus one, plus n times two to the n, with T of zero equal to one. This is the first refused shape. Unrolling gives about a half n squared two to the n, computed exactly at n equal to forty, and the answer is Theta of n squared two to the n.

> Caption: GATE CSE 2025, Set 1: T(n) = 2T(n-1) + n 2^n. Subtract and conquer: unrolling gives a half n squared 2^n.

**5:48–5:56** — Four steps answer any question of this family. Identify a, b and f. Compute the watershed n to the log base b of a. Decide whether f is below, on, or above it, and by how much. Then check the condition that the chosen case carries, and only then write the answer.

> Caption: Four steps: identify a, b and f; compute the watershed; place f; then check the case own condition before writing the answer.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
