# Matrices, Systems and Eigenvalues — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/matrices-systems-and-eigenvalues/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A matrix is a function, not a table

*0:00 – 0:30 · objective: Read a matrix as a linear map: Ax mixes the columns of A, and AB means apply B first.*

**0:00–0:07** — A matrix looks like a table, and that is where most of the confusion starts. It is a function. You give it a column of n numbers, and it hands back a column of m numbers, and the rule it follows is fixed in advance.

> Caption: A matrix is not a table of numbers. It is a function that takes a vector in and gives a vector out.

Exam-trap caption mode adds: *A matrix is not a set of solutions and not a system of equations. It is the map that the system is written with.*

**0:07–0:15** — Here is the reading that makes everything else easy. Multiply A by x and you are mixing the columns of A. The first entry of x says how much of the first column, the second says how much of the second. One times the column 2,1 plus two times the column 1,3 gives 4,7.

> Caption: Ax mixes the columns of A: each entry of x says how much of that column to take.

Exam-trap caption mode adds: *Multiplying row by column gives the same answer, but it hides the picture. Use columns when you want to see what the map does.*

**0:15–0:22** — Products are compositions. A B applied to x is A applied to B x, so B acts first, and A acts on the result. That is the whole reason order matters, and the reason a product is defined only when the inner sizes agree.

> Caption: Multiplication is composition: AB means apply B first, then A.

Exam-trap caption mode adds: *The size rule is inner sizes must match: an m by k times a k by n exists. The outer sizes m and n are the size of the result.*

**0:22–0:30** — Shape is the first thing to read, because it caps everything. An m by n matrix maps n numbers to m numbers, so its rank cannot exceed the smaller of the two. Write the shape down before you compute anything.

> Caption: Shape tells you what can happen: an m by n matrix cannot have rank above the smaller of m and n.

Exam-trap caption mode adds: *More equations does not mean more information. A tall matrix can still have low rank, and then the extra equations are repeats.*

## Scene 2. The determinant is an area factor

*0:30 – 1:00 · objective: Read the determinant as the factor by which area is scaled, with its sign giving orientation, and zero meaning a collapsed map.*

**0:30–0:37** — Take the unit square and push every point of it through the matrix. What comes out is a parallelogram. The determinant is its area, with a sign attached. In three dimensions, replace area with volume and nothing else changes.

> Caption: The determinant is the factor by which the map scales area — or volume, in higher dimensions.

Exam-trap caption mode adds: *The determinant is not a measure of how large the entries are. A matrix of large numbers can have determinant one, and a matrix of small numbers can have a large one.*

**0:37–0:45** — For this matrix the determinant is five. Two times three, minus one times one. And indeed the two columns, 2,1 and 1,3, span a parallelogram of area five, so the unit square is stretched to five times its size.

> Caption: For the two by two with rows 2,1 and 1,3 the determinant is 5, so areas are multiplied by five.

Exam-trap caption mode adds: *Use the same row or column order every time. Swapping two rows flips the sign, which is the next caption.*

**0:45–0:52** — The sign carries the orientation. Negative means the picture is turned inside out, like a reflection. And zero means the parallelogram has collapsed to a segment, so different inputs land on the same output, and the map cannot be undone.

> Caption: A negative determinant means the map flips orientation; a zero determinant means it flattens space.

Exam-trap caption mode adds: *A zero determinant is the definition of singular. It is not a small determinant; it is exactly zero, and near zero still inverts, badly but legally.*

**0:52–1:00** — Two rules do most of the work. The determinant of a product is the product of the determinants. And swapping two rows negates it, which is why an invertible matrix stays invertible after a swap. GATE 2024 Set 2 asked exactly that, as four statements.

> Caption: Determinants multiply, and a row swap negates them. Both facts are asked directly.

Exam-trap caption mode adds: *A row swap preserves invertibility but destroys symmetry and changes the trace. Those are the two false options in the 2024 question.*

## Scene 3. Rank is how many directions survive

*1:00 – 1:30 · objective: Compute rank as the number of pivots, and use rank plus nullity equals the number of columns.*

**1:00–1:07** — The columns of a matrix are a list of vectors. If one of them can be built from the others, it adds nothing new. Rank counts the ones that genuinely add something: the number of independent directions the map can reach.

> Caption: Rank is the number of independent directions the columns actually span.

Exam-trap caption mode adds: *Rank is not the number of non-zero entries, and it is not the number of non-zero rows before elimination. Rows can be non-zero and still dependent.*

**1:07–1:15** — To find it, eliminate. Take the first non-zero entry in the first column, clear everything below it, then move right. Every pivot you create is one independent direction, and the count of pivots is the rank.

> Caption: Row reduction finds the rank: count the pivots and you have counted the rank.

Exam-trap caption mode adds: *Elementary row operations preserve rank, which is why this works. They do not preserve the determinant, which is trap four later.*

**1:15–1:22** — Here is the identity to memorise. Rank plus nullity equals the number of columns. Nullity is how many independent directions get crushed to zero, and rank is how many survive, and together they account for every input direction.

> Caption: Rank plus nullity equals the number of columns. The nullity counts the directions sent to zero.

Exam-trap caption mode adds: *It is the number of columns, not the number of rows. For a tall matrix those differ, and that is the commonest slip in the topic.*

**1:22–1:30** — Look at this famous one. Each row is the one above plus three, so the rows are dependent, and the rank is two. Three columns minus rank two leaves nullity one, so some non-zero vector maps to zero, so the determinant is zero, and zero is one of the eigenvalues.

> Caption: The three by three with rows 1 to 9 has rank two and nullity one, so its determinant is zero.

Exam-trap caption mode adds: *GATE 2024 Set 1 asked for the product of the eigenvalues of this matrix. The product is the determinant, so the answer is zero, with no expansion needed.*

## Scene 4. Solving Ax = b, and when it cannot be done

*1:30 – 2:00 · objective: Decide consistency by comparing rank(A) with rank of the augmented matrix, and count free variables as n minus rank.*

**1:30–1:37** — A system of equations is one question in disguise: can you mix the columns of A to get b. If b is reachable, there is a solution. If b points somewhere the columns cannot reach, there is none, and no amount of algebra will find one.

> Caption: Ax = b asks which combination of the columns of A produces b.

Exam-trap caption mode adds: *A system can have more equations than unknowns and still be consistent, and fewer and still be inconsistent. The count of equations decides nothing on its own.*

**1:37–1:45** — The test is a rank comparison. Put b on the end as another column and compute both ranks. If they are equal, b is inside the reach and the system is consistent. If the bigger one is the augmented matrix, b is outside, and the answer is no solution.

> Caption: Compare rank(A) with rank of the augmented matrix: equal means consistent, larger means no solution.

Exam-trap caption mode adds: *Do not compare the number of equations with the number of unknowns. Compare the two ranks; that is the definition.*

**1:45–1:52** — Suppose it is consistent but the rank is short of the number of unknowns. Then some directions are crushed to zero, and you can slide a solution along any of them and stay a solution. So there are infinitely many, with one free parameter per crushed direction.

> Caption: Consistent with rank below the number of unknowns means free variables: infinitely many solutions.

Exam-trap caption mode adds: *Infinitely many is not "all vectors". The solution set is a shifted null space: one particular solution plus every null vector.*

**1:52–2:00** — Now the wide case, which is a favourite. n equations, m unknowns, m bigger than n. The rank can be at most n, so the nullity is at least m minus n, and the homogeneous system always has that many independent solutions. GATE 2024 Set 1 asked this, and the "at least" wording is what makes it true.

> Caption: For a wide matrix with m greater than n, the homogeneous system has at least m minus n independent solutions.

Exam-trap caption mode adds: *The same statement with "exactly m minus n" is false, because the rank can be lower than n. The quantifier carries the mark.*

## Scene 5. LU decomposition: elimination written down

*2:00 – 2:30 · objective: Split A into a lower and an upper triangular factor, say when that is possible, and use it to solve a system in two cheap passes.*

**2:00–2:07** — When you eliminate, you multiply a row by a number and subtract it from another. That number is a multiplier, and if you keep every multiplier you can rebuild the original matrix. L holds them below the diagonal with ones down the middle, U is what is left, and A is their product.

> Caption: Elimination can be written down as a product: A equals L times U.

Exam-trap caption mode adds: *L is not the eliminated matrix and U is not the original. L stores the multipliers; U stores the pivots and the cleared rows.*

**2:07–2:15** — Plain LU is not always possible. If a pivot comes out zero, elimination stops. That happens exactly when one of the leading principal minors is zero. When none of them is, the decomposition exists and there is only one.

> Caption: Plain LU exists when the leading pivots are all non-zero — the leading principal minors decide.

Exam-trap caption mode adds: *A non-zero determinant is not enough. The determinant can be non-zero while an early pivot is zero, and then you need a row swap.*

**2:15–2:22** — If a pivot is zero, reorder the rows first. Write that reordering as a permutation matrix P, and then P A equals L U for any invertible A. The determinant picks up a factor of minus one for each swap, which is how the pivot product still tells you the determinant.

> Caption: When a pivot is zero, swap rows: then P A equals L U, with P a permutation matrix.

Exam-trap caption mode adds: *The permutation is part of the answer. Dropping P gives a decomposition of the wrong matrix, and the determinant check will fail.*

**2:22–2:30** — Once you have L and U, solving is two triangular passes. Forward substitution goes down L to find y, then back substitution goes up U to find x. Each pass is quadratic, which is why the factorisation is worth keeping when several right-hand sides share one matrix.

> Caption: Then solve twice: forward for y in Ly = b, and back for x in Ux = y. Each pass is cheap.

Exam-trap caption mode adds: *Solve L y equals b, not L y equals P b, unless the question already applied the permutation. Write down which matrix each pass uses.*

## Scene 6. Eigenvalues: the directions that do not turn

*2:30 – 3:00 · objective: Define an eigenvector as a direction preserved by the map, and find eigenvalues from the characteristic polynomial.*

**2:30–2:37** — Apply a matrix to an arrow and usually the arrow swings to a new direction. But a few special arrows do not swing. Their image lies on the same line, longer or shorter or pointing the other way. Those arrows are the eigenvectors.

> Caption: An eigenvector is a direction the map does not turn; it only stretches or flips it.

Exam-trap caption mode adds: *Any non-zero multiple of an eigenvector is again an eigenvector, so an eigenvector is never unique. Only the direction is the answer.*

**2:37–2:45** — The factor is the eigenvalue. A v equals lambda v, and v must not be zero, because zero would satisfy it for every lambda. Lambda can be negative, and that is a flip through the origin, or zero, and that means the direction is crushed to nothing.

> Caption: The stretch factor is the eigenvalue: A v equals lambda v, with v not the zero vector.

Exam-trap caption mode adds: *Zero is a legal eigenvalue but the zero vector is not a legal eigenvector. Mixing those two up is a standard exam slip.*

**2:45–2:52** — To compute them, move everything to one side. A minus lambda I, applied to v, must give zero for a non-zero v, and that is possible only if the matrix is singular. So set its determinant to zero. What you get is a polynomial of degree n, and its roots are the eigenvalues.

> Caption: Find them from det(A minus lambda I) equals zero: the characteristic polynomial.

Exam-trap caption mode adds: *For a two by two, check the discriminant before promising real eigenvalues. A negative discriminant means a complex pair, and the matrix is still real.*

**2:52–3:00** — Two free checks come with the polynomial. The eigenvalues add up to the trace, the sum of the diagonal entries, and they multiply to the determinant. So whatever set you find, add it and multiply it before you trust it.

> Caption: Trace is the sum of the eigenvalues and determinant is their product. Two free checks on any answer.

Exam-trap caption mode adds: *These check the multiset of eigenvalues, not the eigenvectors. A wrong eigenvector passes both tests, so check A v equals lambda v separately.*

## Scene 7. Reading eigenvalues off special matrices

*3:00 – 3:30 · objective: Recognise triangular, all-ones, idempotent, nilpotent and rotation matrices, and give their eigenvalues without a full expansion.*

**3:00–3:07** — Triangular matrices are gifts. Subtract lambda from the diagonal and the matrix is still triangular, so its determinant is the product of the diagonal entries. Each one vanishes at one diagonal value, so the eigenvalues are the diagonal, read straight off.

> Caption: A triangular matrix has its eigenvalues written on the diagonal, with no work at all.

Exam-trap caption mode adds: *This needs triangular, not merely sparse. A matrix with zeros in a scattering of positions is not triangular and the rule does not apply.*

**3:07–3:15** — Here is the shape that GATE 2021 used. All ones, minus the identity. The all-ones matrix sends everything onto one line, so it has one eigenvalue equal to n and the rest zero. Subtract one from each and you get n minus one, and minus one repeated.

> Caption: All ones minus the identity has eigenvalues n minus one, and minus one repeated n minus one times.

Exam-trap caption mode adds: *The row sum is the easy route: every row sums to n minus one, so the all-ones vector is an eigenvector with that value. It gives the largest one, not the whole list.*

**3:15–3:22** — Powers are free once you know the eigenvalues. Apply the matrix k times and the stretch factor is applied k times, so the eigenvalue becomes lambda to the k. And if A is invertible, its inverse stretches by one over lambda, on the same directions.

> Caption: Powers and inverses act on the eigenvalue alone: A to the k has lambda to the k, and A inverse has one over lambda.

Exam-trap caption mode adds: *A to the k has the same eigenvectors only when the matrix is diagonalisable, or when you are content with the eigenvalue list. For a defective matrix the eigenvalue rule still holds; the eigenvector list is short.*

**3:22–3:30** — And here is the counterexample to a belief worth killing early. A real matrix need not have a real eigenvalue. A quarter turn sends every vector to one perpendicular to it, so nothing is preserved, and the roots come out as plus and minus i.

> Caption: A real matrix can have no real eigenvalue: a quarter turn sends every vector to a perpendicular one.

Exam-trap caption mode adds: *Symmetry is what guarantees real eigenvalues. Without it, a real matrix may have a complex pair, and a question that asks for real eigenvalues may have the answer "none".*

## Scene 8. Diagonalisation, and when it fails

*3:30 – 4:00 · objective: Diagonalise with a basis of eigenvectors, and see the defective matrix that has too few of them.*

**3:30–3:37** — If you can find enough eigenvectors, put them in the columns of a matrix P and their eigenvalues on a diagonal matrix D. Then A equals P D P inverse. In the eigenvector basis the map is just a stretch along each axis, which is the simplest thing a map can do.

> Caption: Diagonalising means writing A as P D P inverse, with D holding the eigenvalues.

Exam-trap caption mode adds: *P must be invertible, which means the eigenvectors must be independent. Two parallel eigenvectors cannot fill the columns of an invertible matrix.*

**3:37–3:45** — Repeats are the danger. An eigenvalue can appear twice as a root and still offer only one direction. The count of directions is the nullity of A minus lambda I, and the count of roots is the algebraic multiplicity. When the directions fall short, the matrix is called defective and it cannot be diagonalised.

> Caption: A repeated eigenvalue may fail to supply enough eigenvectors, and then the matrix is defective.

Exam-trap caption mode adds: *Repeated eigenvalue does not by itself mean not diagonalisable. The identity has eigenvalue one twice and two independent directions, so it is already diagonal.*

**3:45–3:52** — One family always works. A real symmetric matrix has only real eigenvalues, and eigenvectors belonging to different eigenvalues come out perpendicular. So the basis exists, and it can even be made orthonormal. That is the spectral theorem, and it is why symmetric matrices are the friendly case.

> Caption: Symmetric matrices always succeed, with real eigenvalues and perpendicular eigenvectors.

Exam-trap caption mode adds: *The theorem is about real symmetric matrices. A general matrix with real entries gets none of it, and may fail on both counts.*

**3:52–4:00** — This is why diagonalising is worth the effort. Take a power and the P inverse P in the middle cancel, leaving P, D to the k, and P inverse. A power of a diagonal matrix is one power per diagonal entry, so a hard matrix power becomes a handful of numbers.

> Caption: Once diagonal, powers are free: A to the k is P D to the k P inverse, one power per entry.

Exam-trap caption mode adds: *The shortcut needs the same P on both sides. If the matrix is not diagonalisable, you cannot use it, and a defective matrix has powers that grow a polynomial factor.*

## Scene 9. Four arithmetic habits that are false

*4:00 – 4:30 · objective: Separate determinants, ranks and eigenvalues of a sum from the sum of the parts, and separate row operations from determinant changes.*

**4:00–4:07** — First trap. Determinants multiply, they do not add. Two copies of the two by two identity each have determinant one, but their sum has determinant four, not two. If you see a determinant of a sum in an option, be suspicious.

> Caption: Trap one: determinants do not add. The determinant of a sum is not the sum of determinants.

Exam-trap caption mode adds: *There is no general formula for the determinant of a sum. Only the product rule and the row-operation rules are safe.*

**4:07–4:15** — Second trap, the same shape. Rank of a sum is not the sum of ranks. The identity has full rank, and so does its negative, but adding them gives the zero matrix, rank zero. What survives is only an inequality: the rank of a sum is at most the sum of the two ranks.

> Caption: Trap two: ranks do not add. The identity and its negative are both full rank; their sum is zero.

Exam-trap caption mode adds: *The inequality can be strict in either direction. Knowing the two ranks bounds the sum from above and tells you nothing exact.*

**4:15–4:22** — Third trap. Eigenvalues of a sum are not the sum of eigenvalues. Adding two matrices mixes their directions, so the old pairings break. The statement is true only when both matrices have the same eigenvectors, and a question will say so if it is meant.

> Caption: Trap three: eigenvalues do not add either. A sum has its own eigenvalues.

Exam-trap caption mode adds: *What does hold: eigenvalues of A plus c times I are the eigenvalues plus c, because the identity has every direction as an eigenvector.*

**4:22–4:30** — Last trap. Elimination is safe for rank and needs care for determinant. Adding a multiple of a row changes nothing; swapping two rows flips the sign; multiplying a row by a number multiplies the determinant by that number. Rank survives all three untouched.

> Caption: Trap four: row operations preserve rank but change the determinant.

Exam-trap caption mode adds: *When you compute a determinant by elimination, track the swaps and the scalings. Forgetting them gives the right magnitude and the wrong sign.*

## Scene 10. The four-step procedure for any question here

*4:30 – 5:00 · objective: Run shape, invertibility, rank and characteristic polynomial in order, and check the answer against trace and determinant.*

**4:30–4:37** — Start with shape. Write down the number of rows and the number of columns, because the rank is capped by the smaller one. For a square matrix the cap is one number, and that is why square matrices get the special vocabulary of invertibility.

> Caption: Step one: read the shape. It caps the rank and decides what "full rank" can mean.

Exam-trap caption mode adds: *Reading the shape wrong changes which rank counts as full, and every consistency statement after that inherits the error.*

**4:37–4:45** — For a square matrix, step two is invertibility, and there are three equivalent ways to see it. Determinant not zero. Full set of pivots. Zero is not an eigenvalue. They are the same fact, so use whichever is cheapest on the numbers in front of you.

> Caption: Step two: for a square matrix, the determinant or the pivots decide invertibility.

Exam-trap caption mode adds: *All three need a square matrix. For a rectangular one, the determinant is not defined, so the other two carry the question.*

**4:45–4:52** — Step three is the solution count. Compare the two ranks: equal means consistent, bigger augmented rank means nothing. Then the number of free parameters is the columns minus the rank. That single line answers most system questions in the paper.

> Caption: Step three: compare ranks to decide the number of solutions, and count free variables as n minus rank.

Exam-trap caption mode adds: *The subtraction uses columns, not rows. A tall consistent system can still have free parameters if its rank is below the number of columns.*

**4:52–5:00** — The last step is the polynomial. Expand, solve, and then check. Add your eigenvalues and compare with the trace, multiply them and compare with the determinant. Those two checks cost a few seconds and catch nearly every arithmetic error in the topic.

> Caption: Step four: the characteristic polynomial, then check the answer against trace and determinant.

Exam-trap caption mode adds: *A correct multiset is not a correct eigenvector. If the question asks for a vector, substitute it back into A v equals lambda v.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
