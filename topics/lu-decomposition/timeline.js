/* ==========================================================================
   lu-decomposition — THE timeline.
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
      id: 'cost', n: 1,
      title: 'One factorisation, many right-hand sides',
      start: 0, end: 30,
      objective: 'Say what A = LU buys: an O(n^3) factorisation once, then an O(n^2) pair of triangular solves for every right-hand side.'
    },
    {
      id: 'product', n: 2,
      title: 'What A = LU means, entry by entry',
      start: 30, end: 60,
      objective: 'Read entry (i,j) of LU as a row of L against a column of U, and count the unknowns to see why one diagonal must be fixed.'
    },
    {
      id: 'step1', n: 3,
      title: 'Doolittle step one: keep the multipliers',
      start: 60, end: 90,
      objective: 'Produce m21 and m31 from the first pivot, put them in column one of L, and let row one of A pass into U unchanged.'
    },
    {
      id: 'step2', n: 4,
      title: 'Step two on the trailing block',
      start: 90, end: 120,
      objective: 'Finish the factorisation on the updated 2x2 block and confirm L times U returns A exactly.'
    },
    {
      id: 'solve', n: 5,
      title: 'Two triangular solves: Ly = b, then Ux = y',
      start: 120, end: 150,
      objective: 'Solve the GATE 2022 system by forward and back substitution and get L32, U33 and x1.'
    },
    {
      id: 'det', n: 6,
      title: 'Determinant and inverse from the factors',
      start: 150, end: 180,
      objective: 'Read det(A) as the product of the diagonal of U, and see why each column of the inverse costs one more triangular pair.'
    },
    {
      id: 'fail', n: 7,
      title: 'When the factorisation fails',
      start: 180, end: 210,
      objective: 'Show an invertible matrix with no LU without row swaps, state the leading-minor theorem with its assumption, and repair it as PA = LU.'
    },
    {
      id: 'crout', n: 8,
      title: 'Which diagonal carries the ones',
      start: 210, end: 240,
      objective: 'Distinguish Doolittle from Crout, and read the GATE 2015 item off the Crout pair rather than the Doolittle pair.'
    },
    {
      id: 'count', n: 9,
      title: 'The cost, counted rather than quoted',
      start: 240, end: 270,
      objective: 'Match measured operation counts against (2/3)n^3 + (1/2)n^2 - (7/6)n for n = 2 to 12.'
    },
    {
      id: 'msq', n: 10,
      title: 'The four statements of GATE 2025 Set 2',
      start: 270, end: 300,
      objective: 'Decide A, B, C and D from the structure of the factorisation, and refute the symmetric one with a computed counterexample.'
    }
  ],

  events: [
    /* ---------- scene 1: what the factorisation buys ---------- */
    { id: 's1-1', scene: 'cost', start: 0, end: 10,
      caption: 'A factorisation is a one-time cost that pays for every later solve. LU splits A into a lower-triangular L and an upper-triangular U, with A equal to L times U.',
      detail: 'Lower triangular means every entry above the diagonal is zero; upper triangular means every entry below it is zero. The point of the split is that a triangular system is solved by plain substitution, with no elimination at all, so the expensive part is done once and reused.',
      narration: 'A factorisation is a one-time cost. LU splits A into a lower triangular L and an upper triangular U.',
      keyword: 'one-time cost' },
    { id: 's1-2', scene: 'cost', start: 10, end: 20,
      caption: 'At n = 10 the factorisation costs 705 multiplications and divisions. Each extra right-hand side then costs only n(n-1) + n squared = 190 more.',
      detail: 'Forward substitution on a unit lower triangular matrix uses n(n-1) operations because the diagonal ones mean there is nothing to divide by; back substitution on U uses n squared because each of the n divisions by a pivot is needed. The page counts both with an instrumented loop rather than quoting them.',
      narration: 'At n equal to ten the factorisation costs 705 operations, and each extra right-hand side costs only 190 more.',
      keyword: '705' },
    { id: 's1-3', scene: 'cost', start: 20, end: 30,
      caption: 'So for a single right-hand side, plain elimination at 705 wins. From two right-hand sides on, the LU route wins: 1085 against 1410.',
      detail: 'This is the whole trade. Eliminating on the augmented matrix repeats the entire factorisation for every new right-hand side, so s systems cost s times 705. Factoring once and reusing the factors costs 705 plus s times 190. The crossover is at s = 2 for n = 10, and the page prints the three rows it computed.',
      narration: 'For one right-hand side elimination wins. From two right-hand sides on, the LU route wins.',
      keyword: 'from two right-hand sides on',
      trap: 'LU is not cheaper than elimination for one system. It is cheaper per additional system with the same coefficient matrix, which is the only claim the numbers support.' },

    /* ---------- scene 2: reading the product ---------- */
    { id: 's2-1', scene: 'product', start: 30, end: 40,
      caption: 'Read the product entry by entry: entry (i,j) of LU is the dot product of row i of L with column j of U.',
      detail: 'Because L is zero above its diagonal and U is zero below its diagonal, that dot product has at most min(i,j) nonzero terms, which is why the multiplication is cheap to check by hand. On this 3x3 every entry is an integer, so the check is exact.',
      narration: 'Entry i j of L U is row i of L against column j of U.',
      keyword: 'row i of L against column j of U' },
    { id: 's2-2', scene: 'product', start: 40, end: 50,
      caption: 'L has n(n-1)/2 unknown off-diagonal entries and U has n(n+1)/2, which together is exactly n squared — the number of entries in A.',
      detail: 'For n = 3 that is 3 plus 6, nine unknowns against nine equations. The count matching exactly is why the pair is determined as soon as one more condition is added: there is no slack and no contradiction.',
      narration: 'The unknowns in L and U together are exactly n squared, the number of entries in A.',
      keyword: 'exactly n squared' },
    { id: 's2-3', scene: 'product', start: 50, end: 60,
      caption: 'That leaves one free choice, and the convention is that the diagonal of L equals one. With that, the pair is unique whenever it exists.',
      detail: 'Without the convention the factorisation is not unique: any diagonal matrix D gives L D times D inverse U as another valid split, because the D and its inverse cancel. Fixing the diagonal of L to ones removes that freedom. Ones on U instead is Crout, and both are correct answers to the same matrix.',
      narration: 'The convention is that the diagonal of L equals one, and then the pair is unique whenever it exists.',
      keyword: 'the diagonal of L equals one',
      trap: 'The uniqueness is conditional. It needs the convention AND the nonzero leading minors of scene 7; drop either and two different pairs multiply back to the same A.' },

    /* ---------- scene 3: step one ---------- */
    { id: 's3-1', scene: 'step1', start: 60, end: 70,
      caption: 'Doolittle is Gaussian elimination with the multipliers kept. Step one uses the first pivot, a11 = 2, to clear the two entries below it.',
      detail: 'Elimination alone would throw the multipliers away and remember only the result. Doolittle stores each multiplier in the position it cleared, which is why L can be read straight off the elimination without any extra work.',
      narration: 'Doolittle is elimination with the multipliers kept. Step one uses the first pivot to clear the entries below it.',
      keyword: 'the multipliers kept' },
    { id: 's3-2', scene: 'step1', start: 70, end: 80,
      caption: 'Each multiplier is entry divided by pivot: m21 = -4/2 = -2 and m31 = 2/2 = 1. Those two numbers are stored, not discarded.',
      detail: 'The multiplier is the factor you subtract. Subtracting minus two times row one from row two is the same as adding two times row one, which is why the multiplier is negative when the entry is negative. Its sign is the commonest arithmetic slip in the topic.',
      narration: 'The multipliers are entry over pivot: minus two and one. They are stored, not discarded.',
      keyword: 'entry divided by pivot' },
    { id: 's3-3', scene: 'step1', start: 80, end: 90,
      caption: 'Row one of A passes into U unchanged, the multipliers pass into column one of L, and the trailing block is updated.',
      detail: 'Nothing about row one changes, because the pivot row is never modified. What changes is the two-by-two block in the bottom right corner, which is the only place the subtraction lands. That block is what step two works on.',
      narration: 'Row one passes into U unchanged, the multipliers pass into column one of L, and the trailing block is updated.',
      keyword: 'trailing block is updated' },

    /* ---------- scene 4: step two ---------- */
    { id: 's4-1', scene: 'step2', start: 90, end: 100,
      caption: 'Step two works on the trailing block alone: after step one it is the two-by-two block with entries 1, 1, 1, 3, so the pivot is now 1.',
      detail: 'The pivot is taken from the current remainder, not from the original diagonal of A. Here they happen to agree because no earlier step touched that position, but in general the second pivot is whatever is sitting in the corner after the first update.',
      narration: 'Step two works on the trailing block, where the pivot is now one.',
      keyword: 'the trailing block alone' },
    { id: 's4-2', scene: 'step2', start: 100, end: 110,
      caption: 'The multiplier m32 = 1/1 = 1 clears the last entry, and u33 = 3 - 1 times 1 = 2. The matrices are complete.',
      detail: 'The last pivot is not computed by any division: it is simply the surviving corner entry. That is why u33 is the number the determinant will be read from, and why a zero there means a singular matrix.',
      narration: 'The last multiplier is one, the last pivot is two, and the matrices are complete.',
      keyword: 'u33 = 3 - 1 times 1 = 2' },
    { id: 's4-3', scene: 'step2', start: 110, end: 120,
      caption: 'Multiply L by U back: all nine entries return, so this is a factorisation and not just bookkeeping.',
      detail: 'The page multiplies the two computed matrices with exact rational arithmetic and compares entry by entry with A. The check is the definition, so it is the only check that matters: a plausible-looking L and U that do not multiply back are simply wrong, however tidy the arithmetic looked.',
      narration: 'Multiply L by U back and all nine entries return.',
      keyword: 'all nine entries return' },

    /* ---------- scene 5: the two solves ---------- */
    { id: 's5-1', scene: 'solve', start: 120, end: 130,
      caption: 'Solving Ax = b with the factors is two triangular solves. First Ly = b by forward substitution, which needs no division because L is unit lower triangular.',
      detail: 'Substituting A = LU gives LUx = b. Naming Ux as a new vector y turns that into Ly = b, which is triangular and can be solved top down. The naming step is the whole trick and it is why the method is two solves rather than one.',
      narration: 'First solve L y equals b by forward substitution.',
      keyword: 'two triangular solves' },
    { id: 's5-2', scene: 'solve', start: 130, end: 140,
      caption: 'y = (4, 3, 0.5): each entry is b_i minus the terms already found. Then Ux = y by back substitution, which does divide.',
      detail: 'Forward substitution walks down: y1 is b1, y2 is b2 minus l21 y1, and so on. Back substitution walks up and divides by each pivot, so a zero on the diagonal of U is exactly where this stage would break.',
      narration: 'Forward substitution gives y equal to four, three and one half. Then back substitution solves U x equals y.',
      keyword: 'y = (4, 3, 0.5)' },
    { id: 's5-3', scene: 'solve', start: 140, end: 150,
      caption: 'x = (0, 2, -1). GATE CSE 2022 asked for L32, U33 and x1 together, and the answers are -1/2, -1/2 and 0.',
      detail: 'The page recomputes all three rather than quoting them: the multiplier that cleared position (3,2) is minus one half, the surviving corner is minus one half, and the first component of the solution is zero. The residual A x minus b is then computed and is exactly the zero vector, which is the check that the solution is right.',
      narration: 'x is zero, two, minus one. The 2022 answers are minus one half, minus one half and zero.',
      keyword: 'x = (0, 2, -1)',
      trap: 'The question numbers three different objects at once: an entry of L, an entry of U and a component of x. Reading L32 off U, or reporting the second component of x, are the two usual slips.' },

    /* ---------- scene 6: determinant and inverse ---------- */
    { id: 's6-1', scene: 'det', start: 150, end: 160,
      caption: 'The factors carry the determinant for free: det(A) = det(L) times det(U), and det(L) = 1 because its diagonal is all ones.',
      detail: 'The determinant of a triangular matrix is the product of its diagonal, so det(L) is a product of ones. That leaves the determinant of U, which is the product of the pivots. No expansion by cofactors is needed once the factorisation is in hand.',
      narration: 'The determinant is the product of the pivots, because the diagonal of L is all ones.',
      keyword: 'product of the pivots' },
    { id: 's6-2', scene: 'det', start: 160, end: 170,
      caption: 'On this 4x4 that is 4 times 7/4 times 12/7 times 5/3 = 20, which the cofactor expansion confirms independently.',
      detail: 'The page computes the determinant twice by different routes: once as the product of the diagonal of U, once by recursive cofactor expansion, and once more as the fourth leading principal minor. All three give 20. Agreement between independent routes is what makes the number trustworthy.',
      narration: 'The four pivots multiply to twenty, and the cofactor expansion gives twenty as well.',
      keyword: '= 20' },
    { id: 's6-3', scene: 'det', start: 170, end: 180,
      caption: 'Each column of the inverse is one more pair of triangular solves, so the inverse costs n times what one solve costs.',
      detail: 'Solving A x = e_j for the j-th unit vector gives the j-th column of the inverse, and that is again Ly = e_j followed by Ux = y. With the factors already known this is n squared per column and n cubed for the whole inverse, which is the reason the inverse is rarely formed in practice.',
      narration: 'Each column of the inverse is one more pair of triangular solves.',
      keyword: 'n times what one solve costs',
      trap: 'If rows were swapped during the factorisation, the determinant picks up a factor of minus one for each swap. Reading the product of the pivots alone then gives the wrong sign.' },

    /* ---------- scene 7: when it fails ---------- */
    { id: 's7-1', scene: 'fail', start: 180, end: 190,
      caption: 'A factorisation can fail even when A is perfectly invertible. This matrix has determinant -1, so it is invertible.',
      detail: 'Invertibility is about the determinant being nonzero, which is a statement about the whole matrix. Having a factorisation without row swaps is a stronger requirement about the intermediate stages, and that is what this matrix lacks.',
      narration: 'A factorisation can fail even when A is invertible. This matrix has determinant minus one.',
      keyword: 'even when A is invertible' },
    { id: 's7-2', scene: 'fail', start: 190, end: 200,
      caption: 'But its second leading principal minor is 1 times 1 minus 1 times 1 = 0, and elimination reaches a zero pivot at step two. Division by zero, no LU.',
      detail: 'The leading principal minors are the determinants of the top left k by k blocks, for k from one upwards. Here they are 1, 0 and -1: the last is nonzero, so the matrix is invertible, but the middle one is zero, so the second pivot vanishes and the multiplier would need to divide by it.',
      narration: 'Its second leading principal minor is zero, so step two reaches a zero pivot.',
      keyword: 'second leading principal minor is zero' },
    { id: 's7-3', scene: 'fail', start: 200, end: 210,
      caption: 'The theorem needs its assumption: LU without row swaps exists and is unique exactly when every leading principal minor up to n-1 is nonzero. Swapping rows restores it as PA = LU.',
      detail: 'The page performs the swap, checks that P times A equals L times U, and then reads the determinant as the product of the new pivots times minus one for the single swap, which returns -1 and agrees with the cofactor value. Partial pivoting also improves accuracy by choosing the largest available pivot, which is why real code always does it.',
      narration: 'LU exists and is unique exactly when the leading principal minors up to n minus one are nonzero. Swapping rows gives P A equals L U.',
      keyword: 'every leading principal minor up to n-1 is nonzero',
      trap: 'Do not say that an invertible matrix always has an LU decomposition. It always has a P A = L U decomposition; the P is not optional.' },

    /* ---------- scene 8: which diagonal ---------- */
    { id: 's8-1', scene: 'crout', start: 210, end: 220,
      caption: 'Which diagonal holds the ones is a convention, not part of the mathematics. Ones on L is Doolittle; ones on U is Crout.',
      detail: 'Both are answers to the same question, and both multiply back to A. The convention has to be stated because the factorisation is otherwise not unique, and a question that fixes a diagonal is really telling you which convention to use.',
      narration: 'Ones on L is Doolittle, ones on U is Crout.',
      keyword: 'a convention' },
    { id: 's8-2', scene: 'crout', start: 220, end: 230,
      caption: 'GATE CSE 2015 Set 1 fixed the diagonal of U to ones on this matrix and asked for l22 of L: that is 5, not the 1 that Doolittle would give.',
      detail: 'The page builds both pairs for the same two-by-two matrix and multiplies each back. The Doolittle pair has L with ones on its diagonal and U with 2 and 5 on its diagonal; the Crout pair moves the ones to U and leaves 2 and 5 on the diagonal of L, so the lower diagonal entry becomes 5.',
      narration: 'With the diagonal of U set to ones, the lower diagonal entry of L is five.',
      keyword: 'l22 of L: that is 5',
      trap: 'The answer depends on which convention the question fixed. Read the sentence about the diagonal before computing, because the same matrix gives 1 or 5 depending on it.' },
    { id: 's8-3', scene: 'crout', start: 230, end: 240,
      caption: 'Same A, a different pair of matrices, the same product. In general A = L D L transpose, and for a positive definite matrix the square-root form is the Cholesky factor.',
      detail: 'The exact general statement is A = L D L-transpose, with D the diagonal of U, which the page verifies on the 4x4. Cholesky is the square-root form, where D is folded into L and the two factors become transposes; it exists only when the matrix is symmetric and positive definite. The page checks the square-root form on the 2x2 [[4,2],[2,5]], whose factor is [[2,0],[1,2]].',
      narration: 'Same A, a different pair, the same product. For a symmetric positive definite matrix the factor is the Cholesky factor.',
      keyword: 'Cholesky' },

    /* ---------- scene 9: the cost ---------- */
    { id: 's9-1', scene: 'count', start: 240, end: 250,
      caption: 'The cost is measured here rather than quoted: the algorithm is instrumented, and its multiplications, divisions and subtractions are counted for n = 2 to 12.',
      detail: 'One multiplication plus one subtraction counts as two operations and one division counts as one, which is the convention the polynomial below assumes. Counting under a stated convention is the only way the number and the formula can be compared honestly.',
      narration: 'The cost is measured: the algorithm is instrumented and its operations are counted.',
      keyword: 'measured here rather than quoted' },
    { id: 's9-2', scene: 'count', start: 250, end: 260,
      caption: 'Every count matches (2/3)n cubed + (1/2)n squared - (7/6)n exactly: 5, 19, 46, 90, 155, 245, 364, 516, 705, 935, 1210.',
      detail: 'The match is exact for all eleven sizes, not asymptotic, because the polynomial is the closed form of the same triple loop the counter walks. A bar chart drawn from the measured values and a curve drawn from the formula sit on top of each other for that reason.',
      narration: 'Every count matches two thirds n cubed plus one half n squared minus seven sixths n exactly.',
      keyword: 'matches exactly' },
    { id: 's9-3', scene: 'count', start: 260, end: 270,
      caption: 'The leading term is (2/3)n cubed, the same as elimination. LU is not cheaper per solve; it is cheaper per additional right-hand side.',
      detail: 'This is the fact that stops a wrong conclusion. A question that asks whether LU is faster than Gaussian elimination has no single answer: per system solved it is the same, and across several systems sharing a coefficient matrix it wins from the second one onward.',
      narration: 'The leading term is the same as elimination. LU is cheaper per additional right-hand side, not per solve.',
      keyword: '(2/3)n cubed',
      trap: 'A cost question with no right-hand-side count has no answer. The count of systems is part of the question, and the crossover at n = 10 is s = 2.' },

    /* ---------- scene 10: the four statements ---------- */
    { id: 's10-1', scene: 'msq', start: 270, end: 280,
      caption: 'GATE CSE 2025 Set 2 asked which statements about P = LU are true. Statement A: solve Ly = Q and then Ux = y — true, that is what the factors are for.',
      detail: 'The two-solve procedure is the definition of using a factorisation, so the statement restates the method rather than adding a condition. The page runs it on a right-hand side and checks the residual, so the truth of A is demonstrated and not merely asserted.',
      narration: 'Statement A is true: solve L y equals Q, then U x equals y.',
      keyword: 'Statement A: true' },
    { id: 's10-2', scene: 'msq', start: 280, end: 290,
      caption: 'B: if P is invertible then L and U are invertible — true, since the determinant is one times the product of the pivots. C: if P is singular then some diagonal of U is zero — true, by the same product.',
      detail: 'Both statements are the same equation read in two directions. A unit lower triangular matrix is always invertible, so everything rests on the product of the pivots: nonzero exactly when P is invertible. C is the contrapositive of B with the unit diagonal factored out.',
      narration: 'B and C are true, and both follow from the determinant being the product of the pivots.',
      keyword: 'B and C are true' },
    { id: 's10-3', scene: 'msq', start: 290, end: 300,
      caption: 'D: if P is symmetric then L and U are symmetric — false. This symmetric P gives L = [[1,0],[1/2,1]] and U = [[4,2],[0,2]], and neither is symmetric.',
      detail: 'A symmetric matrix that is upper triangular must be diagonal, since symmetry forces the entries above the diagonal to equal those below and those below are zero. U here has a 2 above the diagonal, so U cannot be symmetric unless it is diagonal, and a general symmetric P does not produce a diagonal U. The Cholesky factor of scene 8 is the symmetric case, and it is a different factorisation.',
      narration: 'Statement D is false. A symmetric matrix does not give symmetric factors.',
      keyword: 'Statement D: false',
      trap: 'Symmetry of P is not inherited by L and U. It is inherited by the Cholesky factor, which is a different factorisation of a positive definite matrix.' }
  ]
};
