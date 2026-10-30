# Lu Decomposition — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/lu-decomposition/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 30 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. One factorisation, many right-hand sides

*0:00 – 0:30 · objective: Say what A = LU buys: an O(n^3) factorisation once, then an O(n^2) pair of triangular solves for every right-hand side.*

**0:00–0:10** — A factorisation is a one-time cost. LU splits A into a lower triangular L and an upper triangular U.

> Caption: A factorisation is a one-time cost that pays for every later solve. LU splits A into a lower-triangular L and an upper-triangular U, with A equal to L times U.

**0:10–0:20** — At n equal to ten the factorisation costs 705 operations, and each extra right-hand side costs only 190 more.

> Caption: At n = 10 the factorisation costs 705 multiplications and divisions. Each extra right-hand side then costs only n(n-1) + n squared = 190 more.

**0:20–0:30** — For one right-hand side elimination wins. From two right-hand sides on, the LU route wins.

> Caption: So for a single right-hand side, plain elimination at 705 wins. From two right-hand sides on, the LU route wins: 1085 against 1410.

Exam-trap caption mode adds: *LU is not cheaper than elimination for one system. It is cheaper per additional system with the same coefficient matrix, which is the only claim the numbers support.*

## Scene 2. What A = LU means, entry by entry

*0:30 – 1:00 · objective: Read entry (i,j) of LU as a row of L against a column of U, and count the unknowns to see why one diagonal must be fixed.*

**0:30–0:40** — Entry i j of L U is row i of L against column j of U.

> Caption: Read the product entry by entry: entry (i,j) of LU is the dot product of row i of L with column j of U.

**0:40–0:50** — The unknowns in L and U together are exactly n squared, the number of entries in A.

> Caption: L has n(n-1)/2 unknown off-diagonal entries and U has n(n+1)/2, which together is exactly n squared — the number of entries in A.

**0:50–1:00** — The convention is that the diagonal of L equals one, and then the pair is unique whenever it exists.

> Caption: That leaves one free choice, and the convention is that the diagonal of L equals one. With that, the pair is unique whenever it exists.

Exam-trap caption mode adds: *The uniqueness is conditional. It needs the convention AND the nonzero leading minors of scene 7; drop either and two different pairs multiply back to the same A.*

## Scene 3. Doolittle step one: keep the multipliers

*1:00 – 1:30 · objective: Produce m21 and m31 from the first pivot, put them in column one of L, and let row one of A pass into U unchanged.*

**1:00–1:10** — Doolittle is elimination with the multipliers kept. Step one uses the first pivot to clear the entries below it.

> Caption: Doolittle is Gaussian elimination with the multipliers kept. Step one uses the first pivot, a11 = 2, to clear the two entries below it.

**1:10–1:20** — The multipliers are entry over pivot: minus two and one. They are stored, not discarded.

> Caption: Each multiplier is entry divided by pivot: m21 = -4/2 = -2 and m31 = 2/2 = 1. Those two numbers are stored, not discarded.

**1:20–1:30** — Row one passes into U unchanged, the multipliers pass into column one of L, and the trailing block is updated.

> Caption: Row one of A passes into U unchanged, the multipliers pass into column one of L, and the trailing block is updated.

## Scene 4. Step two on the trailing block

*1:30 – 2:00 · objective: Finish the factorisation on the updated 2x2 block and confirm L times U returns A exactly.*

**1:30–1:40** — Step two works on the trailing block, where the pivot is now one.

> Caption: Step two works on the trailing block alone: after step one it is the two-by-two block with entries 1, 1, 1, 3, so the pivot is now 1.

**1:40–1:50** — The last multiplier is one, the last pivot is two, and the matrices are complete.

> Caption: The multiplier m32 = 1/1 = 1 clears the last entry, and u33 = 3 - 1 times 1 = 2. The matrices are complete.

**1:50–2:00** — Multiply L by U back and all nine entries return.

> Caption: Multiply L by U back: all nine entries return, so this is a factorisation and not just bookkeeping.

## Scene 5. Two triangular solves: Ly = b, then Ux = y

*2:00 – 2:30 · objective: Solve the GATE 2022 system by forward and back substitution and get L32, U33 and x1.*

**2:00–2:10** — First solve L y equals b by forward substitution.

> Caption: Solving Ax = b with the factors is two triangular solves. First Ly = b by forward substitution, which needs no division because L is unit lower triangular.

**2:10–2:20** — Forward substitution gives y equal to four, three and one half. Then back substitution solves U x equals y.

> Caption: y = (4, 3, 0.5): each entry is b_i minus the terms already found. Then Ux = y by back substitution, which does divide.

**2:20–2:30** — x is zero, two, minus one. The 2022 answers are minus one half, minus one half and zero.

> Caption: x = (0, 2, -1). GATE CSE 2022 asked for L32, U33 and x1 together, and the answers are -1/2, -1/2 and 0.

Exam-trap caption mode adds: *The question numbers three different objects at once: an entry of L, an entry of U and a component of x. Reading L32 off U, or reporting the second component of x, are the two usual slips.*

## Scene 6. Determinant and inverse from the factors

*2:30 – 3:00 · objective: Read det(A) as the product of the diagonal of U, and see why each column of the inverse costs one more triangular pair.*

**2:30–2:40** — The determinant is the product of the pivots, because the diagonal of L is all ones.

> Caption: The factors carry the determinant for free: det(A) = det(L) times det(U), and det(L) = 1 because its diagonal is all ones.

**2:40–2:50** — The four pivots multiply to twenty, and the cofactor expansion gives twenty as well.

> Caption: On this 4x4 that is 4 times 7/4 times 12/7 times 5/3 = 20, which the cofactor expansion confirms independently.

**2:50–3:00** — Each column of the inverse is one more pair of triangular solves.

> Caption: Each column of the inverse is one more pair of triangular solves, so the inverse costs n times what one solve costs.

Exam-trap caption mode adds: *If rows were swapped during the factorisation, the determinant picks up a factor of minus one for each swap. Reading the product of the pivots alone then gives the wrong sign.*

## Scene 7. When the factorisation fails

*3:00 – 3:30 · objective: Show an invertible matrix with no LU without row swaps, state the leading-minor theorem with its assumption, and repair it as PA = LU.*

**3:00–3:10** — A factorisation can fail even when A is invertible. This matrix has determinant minus one.

> Caption: A factorisation can fail even when A is perfectly invertible. This matrix has determinant -1, so it is invertible.

**3:10–3:20** — Its second leading principal minor is zero, so step two reaches a zero pivot.

> Caption: But its second leading principal minor is 1 times 1 minus 1 times 1 = 0, and elimination reaches a zero pivot at step two. Division by zero, no LU.

**3:20–3:30** — LU exists and is unique exactly when the leading principal minors up to n minus one are nonzero. Swapping rows gives P A equals L U.

> Caption: The theorem needs its assumption: LU without row swaps exists and is unique exactly when every leading principal minor up to n-1 is nonzero. Swapping rows restores it as PA = LU.

Exam-trap caption mode adds: *Do not say that an invertible matrix always has an LU decomposition. It always has a P A = L U decomposition; the P is not optional.*

## Scene 8. Which diagonal carries the ones

*3:30 – 4:00 · objective: Distinguish Doolittle from Crout, and read the GATE 2015 item off the Crout pair rather than the Doolittle pair.*

**3:30–3:40** — Ones on L is Doolittle, ones on U is Crout.

> Caption: Which diagonal holds the ones is a convention, not part of the mathematics. Ones on L is Doolittle; ones on U is Crout.

**3:40–3:50** — With the diagonal of U set to ones, the lower diagonal entry of L is five.

> Caption: GATE CSE 2015 Set 1 fixed the diagonal of U to ones on this matrix and asked for l22 of L: that is 5, not the 1 that Doolittle would give.

Exam-trap caption mode adds: *The answer depends on which convention the question fixed. Read the sentence about the diagonal before computing, because the same matrix gives 1 or 5 depending on it.*

**3:50–4:00** — Same A, a different pair, the same product. For a symmetric positive definite matrix the factor is the Cholesky factor.

> Caption: Same A, a different pair of matrices, the same product. In general A = L D L transpose, and for a positive definite matrix the square-root form is the Cholesky factor.

## Scene 9. The cost, counted rather than quoted

*4:00 – 4:30 · objective: Match measured operation counts against (2/3)n^3 + (1/2)n^2 - (7/6)n for n = 2 to 12.*

**4:00–4:10** — The cost is measured: the algorithm is instrumented and its operations are counted.

> Caption: The cost is measured here rather than quoted: the algorithm is instrumented, and its multiplications, divisions and subtractions are counted for n = 2 to 12.

**4:10–4:20** — Every count matches two thirds n cubed plus one half n squared minus seven sixths n exactly.

> Caption: Every count matches (2/3)n cubed + (1/2)n squared - (7/6)n exactly: 5, 19, 46, 90, 155, 245, 364, 516, 705, 935, 1210.

**4:20–4:30** — The leading term is the same as elimination. LU is cheaper per additional right-hand side, not per solve.

> Caption: The leading term is (2/3)n cubed, the same as elimination. LU is not cheaper per solve; it is cheaper per additional right-hand side.

Exam-trap caption mode adds: *A cost question with no right-hand-side count has no answer. The count of systems is part of the question, and the crossover at n = 10 is s = 2.*

## Scene 10. The four statements of GATE 2025 Set 2

*4:30 – 5:00 · objective: Decide A, B, C and D from the structure of the factorisation, and refute the symmetric one with a computed counterexample.*

**4:30–4:40** — Statement A is true: solve L y equals Q, then U x equals y.

> Caption: GATE CSE 2025 Set 2 asked which statements about P = LU are true. Statement A: solve Ly = Q and then Ux = y — true, that is what the factors are for.

**4:40–4:50** — B and C are true, and both follow from the determinant being the product of the pivots.

> Caption: B: if P is invertible then L and U are invertible — true, since the determinant is one times the product of the pivots. C: if P is singular then some diagonal of U is zero — true, by the same product.

**4:50–5:00** — Statement D is false. A symmetric matrix does not give symmetric factors.

> Caption: D: if P is symmetric then L and U are symmetric — false. This symmetric P gives L = [[1,0],[1/2,1]] and U = [[4,2],[0,2]], and neither is symmetric.

Exam-trap caption mode adds: *Symmetry of P is not inherited by L and U. It is inherited by the Cholesky factor, which is a different factorisation of a positive definite matrix.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
