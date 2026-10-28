/* ==========================================================================
   matrices-systems-and-eigenvalues — THE timeline.
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
      id: 'map',
      n: 1,
      title: 'A matrix is a function, not a table',
      start: 0, end: 30,
      objective: 'Read a matrix as a linear map: Ax mixes the columns of A, and AB means apply B first.'
    },
    {
      id: 'det',
      n: 2,
      title: 'The determinant is an area factor',
      start: 30, end: 60,
      objective: 'Read the determinant as the factor by which area is scaled, with its sign giving orientation, and zero meaning a collapsed map.'
    },
    {
      id: 'rank',
      n: 3,
      title: 'Rank is how many directions survive',
      start: 60, end: 90,
      objective: 'Compute rank as the number of pivots, and use rank plus nullity equals the number of columns.'
    },
    {
      id: 'systems',
      n: 4,
      title: 'Solving Ax = b, and when it cannot be done',
      start: 90, end: 120,
      objective: 'Decide consistency by comparing rank(A) with rank of the augmented matrix, and count free variables as n minus rank.'
    },
    {
      id: 'lu',
      n: 5,
      title: 'LU decomposition: elimination written down',
      start: 120, end: 150,
      objective: 'Split A into a lower and an upper triangular factor, say when that is possible, and use it to solve a system in two cheap passes.'
    },
    {
      id: 'eigen',
      n: 6,
      title: 'Eigenvalues: the directions that do not turn',
      start: 150, end: 180,
      objective: 'Define an eigenvector as a direction preserved by the map, and find eigenvalues from the characteristic polynomial.'
    },
    {
      id: 'special',
      n: 7,
      title: 'Reading eigenvalues off special matrices',
      start: 180, end: 210,
      objective: 'Recognise triangular, all-ones, idempotent, nilpotent and rotation matrices, and give their eigenvalues without a full expansion.'
    },
    {
      id: 'diag',
      n: 8,
      title: 'Diagonalisation, and when it fails',
      start: 210, end: 240,
      objective: 'Diagonalise with a basis of eigenvectors, and see the defective matrix that has too few of them.'
    },
    {
      id: 'traps',
      n: 9,
      title: 'Four arithmetic habits that are false',
      start: 240, end: 270,
      objective: 'Separate determinants, ranks and eigenvalues of a sum from the sum of the parts, and separate row operations from determinant changes.'
    },
    {
      id: 'procedure',
      n: 10,
      title: 'The four-step procedure for any question here',
      start: 270, end: 300,
      objective: 'Run shape, invertibility, rank and characteristic polynomial in order, and check the answer against trace and determinant.'
    }
  ],

  events: [

    /* ---------------- scene 1: map ---------------- */
    {
      id: 'mp-1', scene: 'map', start: 0, end: 7.5,
      caption: 'A matrix is not a table of numbers. It is a function that takes a vector in and gives a vector out.',
      detail: 'An m by n matrix with real entries is a function from the space of n-number columns to the space of m-number columns. Writing it as a rectangle of numbers is a notation for that function, not the object itself.',
      narration: 'A matrix looks like a table, and that is where most of the confusion starts. It is a function. You give it a column of n numbers, and it hands back a column of m numbers, and the rule it follows is fixed in advance.',
      keyword: 'a function, not a table',
      trap: 'A matrix is not a set of solutions and not a system of equations. It is the map that the system is written with.'
    },
    {
      id: 'mp-2', scene: 'map', start: 7.5, end: 15,
      caption: 'Ax mixes the columns of A: each entry of x says how much of that column to take.',
      detail: 'The product Ax is the sum of the columns of A, each multiplied by the matching entry of x. For A equal to the two by two with rows 2,1 and 1,3 and x equal to 1,2 the result is 2 times column one plus 1 times column two, which is the column 4,7.',
      narration: 'Here is the reading that makes everything else easy. Multiply A by x and you are mixing the columns of A. The first entry of x says how much of the first column, the second says how much of the second. One times the column 2,1 plus two times the column 1,3 gives 4,7.',
      keyword: 'columns with weights',
      trap: 'Multiplying row by column gives the same answer, but it hides the picture. Use columns when you want to see what the map does.'
    },
    {
      id: 'mp-3', scene: 'map', start: 15, end: 22.5,
      caption: 'Multiplication is composition: AB means apply B first, then A.',
      detail: 'For any vector x, the product AB applied to x equals A applied to Bx. So the right-hand factor acts first. This is why AB is usually not equal to BA, and why the sizes must line up: A is m by k and B is k by n.',
      narration: 'Products are compositions. A B applied to x is A applied to B x, so B acts first, and A acts on the result. That is the whole reason order matters, and the reason a product is defined only when the inner sizes agree.',
      keyword: 'right factor acts first',
      trap: 'The size rule is inner sizes must match: an m by k times a k by n exists. The outer sizes m and n are the size of the result.'
    },
    {
      id: 'mp-4', scene: 'map', start: 22.5, end: 30,
      caption: 'Shape tells you what can happen: an m by n matrix cannot have rank above the smaller of m and n.',
      detail: 'A map from n numbers to m numbers can never create more than the smaller of m and n independent directions. That single fact settles many questions about rank, about systems with more equations than unknowns, and about wide matrices.',
      narration: 'Shape is the first thing to read, because it caps everything. An m by n matrix maps n numbers to m numbers, so its rank cannot exceed the smaller of the two. Write the shape down before you compute anything.',
      keyword: 'rank at most the smaller side',
      trap: 'More equations does not mean more information. A tall matrix can still have low rank, and then the extra equations are repeats.'
    },

    /* ---------------- scene 2: det ---------------- */
    {
      id: 'dt-1', scene: 'det', start: 30, end: 37.5,
      caption: 'The determinant is the factor by which the map scales area — or volume, in higher dimensions.',
      detail: 'Take the unit square, apply the matrix to every point of it, and look at the picture you get. Its area is the absolute value of the determinant. In three dimensions the same statement holds with volume.',
      narration: 'Take the unit square and push every point of it through the matrix. What comes out is a parallelogram. The determinant is its area, with a sign attached. In three dimensions, replace area with volume and nothing else changes.',
      keyword: 'area factor',
      trap: 'The determinant is not a measure of how large the entries are. A matrix of large numbers can have determinant one, and a matrix of small numbers can have a large one.'
    },
    {
      id: 'dt-2', scene: 'det', start: 37.5, end: 45,
      caption: 'For the two by two with rows 2,1 and 1,3 the determinant is 5, so areas are multiplied by five.',
      detail: 'The determinant of the two by two with rows a,b and c,d is ad minus bc. Here that is two times three minus one times one, which is five. The columns 2,1 and 1,3 form a parallelogram of area five, and the map sends the unit square exactly onto it.',
      narration: 'For this matrix the determinant is five. Two times three, minus one times one. And indeed the two columns, 2,1 and 1,3, span a parallelogram of area five, so the unit square is stretched to five times its size.',
      keyword: 'ad minus bc',
      trap: 'Use the same row or column order every time. Swapping two rows flips the sign, which is the next caption.'
    },
    {
      id: 'dt-3', scene: 'det', start: 45, end: 52.5,
      caption: 'A negative determinant means the map flips orientation; a zero determinant means it flattens space.',
      detail: 'A negative value keeps the size of the area but reverses the sense of rotation, so a counter-clockwise corner becomes clockwise. A zero value means the image has no area at all: the plane is squashed onto a line, and no inverse can undo it.',
      narration: 'The sign carries the orientation. Negative means the picture is turned inside out, like a reflection. And zero means the parallelogram has collapsed to a segment, so different inputs land on the same output, and the map cannot be undone.',
      keyword: 'sign is orientation, zero is collapse',
      trap: 'A zero determinant is the definition of singular. It is not a small determinant; it is exactly zero, and near zero still inverts, badly but legally.'
    },
    {
      id: 'dt-4', scene: 'det', start: 52.5, end: 60,
      caption: 'Determinants multiply, and a row swap negates them. Both facts are asked directly.',
      detail: 'The determinant of a product is the product of the determinants, and swapping two rows changes the sign and nothing else. In GATE CSE 2024 Set 2 the swap question is asked as a statement set: the determinant negates, invertibility survives, symmetry does not and the trace does not.',
      narration: 'Two rules do most of the work. The determinant of a product is the product of the determinants. And swapping two rows negates it, which is why an invertible matrix stays invertible after a swap. GATE 2024 Set 2 asked exactly that, as four statements.',
      keyword: 'multiplies; a swap negates',
      trap: 'A row swap preserves invertibility but destroys symmetry and changes the trace. Those are the two false options in the 2024 question.'
    },

    /* ---------------- scene 3: rank ---------------- */
    {
      id: 'rk-1', scene: 'rank', start: 60, end: 67.5,
      caption: 'Rank is the number of independent directions the columns actually span.',
      detail: 'The columns of a matrix are vectors. Some of them may be combinations of the others. The rank is the size of a largest independent set among them, which is also the dimension of the set of all outputs.',
      narration: 'The columns of a matrix are a list of vectors. If one of them can be built from the others, it adds nothing new. Rank counts the ones that genuinely add something: the number of independent directions the map can reach.',
      keyword: 'independent directions',
      trap: 'Rank is not the number of non-zero entries, and it is not the number of non-zero rows before elimination. Rows can be non-zero and still dependent.'
    },
    {
      id: 'rk-2', scene: 'rank', start: 67.5, end: 75,
      caption: 'Row reduction finds the rank: count the pivots and you have counted the rank.',
      detail: 'Eliminate downwards, column by column, using the first non-zero entry of each row as a pivot. The number of pivots that survive is the rank, because each pivot is a new independent direction and no row operation changes the set of outputs.',
      narration: 'To find it, eliminate. Take the first non-zero entry in the first column, clear everything below it, then move right. Every pivot you create is one independent direction, and the count of pivots is the rank.',
      keyword: 'count the pivots',
      trap: 'Elementary row operations preserve rank, which is why this works. They do not preserve the determinant, which is trap four later.'
    },
    {
      id: 'rk-3', scene: 'rank', start: 75, end: 82.5,
      caption: 'Rank plus nullity equals the number of columns. The nullity counts the directions sent to zero.',
      detail: 'The null space is the set of vectors the map sends to zero. Its dimension, the nullity, plus the rank, equals the number of columns, which is the number of inputs. This is the rank-nullity theorem, and it is the single most useful identity in the topic.',
      narration: 'Here is the identity to memorise. Rank plus nullity equals the number of columns. Nullity is how many independent directions get crushed to zero, and rank is how many survive, and together they account for every input direction.',
      keyword: 'rank + nullity = columns',
      trap: 'It is the number of columns, not the number of rows. For a tall matrix those differ, and that is the commonest slip in the topic.'
    },
    {
      id: 'rk-4', scene: 'rank', start: 82.5, end: 90,
      caption: 'The three by three with rows 1 to 9 has rank two and nullity one, so its determinant is zero.',
      detail: 'Its second row is the average of the first and third, so only two rows are independent. Rank two of three columns leaves nullity one, and a null space with a non-zero vector means a zero determinant. Its eigenvalues are zero and the two roots of lambda squared minus fifteen lambda minus eighteen.',
      narration: 'Look at this famous one. Each row is the one above plus three, so the rows are dependent, and the rank is two. Three columns minus rank two leaves nullity one, so some non-zero vector maps to zero, so the determinant is zero, and zero is one of the eigenvalues.',
      keyword: 'dependent rows, rank two',
      trap: 'GATE 2024 Set 1 asked for the product of the eigenvalues of this matrix. The product is the determinant, so the answer is zero, with no expansion needed.'
    },

    /* ---------------- scene 4: systems ---------------- */
    {
      id: 'sy-1', scene: 'systems', start: 90, end: 97.5,
      caption: 'Ax = b asks which combination of the columns of A produces b.',
      detail: 'Solving a system is the same question as reaching b from the columns of A. If b lies in the span of the columns, a solution exists; if it does not, no combination works and the system is inconsistent.',
      narration: 'A system of equations is one question in disguise: can you mix the columns of A to get b. If b is reachable, there is a solution. If b points somewhere the columns cannot reach, there is none, and no amount of algebra will find one.',
      keyword: 'is b reachable?',
      trap: 'A system can have more equations than unknowns and still be consistent, and fewer and still be inconsistent. The count of equations decides nothing on its own.'
    },
    {
      id: 'sy-2', scene: 'systems', start: 97.5, end: 105,
      caption: 'Compare rank(A) with rank of the augmented matrix: equal means consistent, larger means no solution.',
      detail: 'Append b as an extra column and compare ranks. If the ranks agree, the extra column adds no new direction, so b is reachable. If the augmented rank is larger, b points outside the span and the system has no solution.',
      narration: 'The test is a rank comparison. Put b on the end as another column and compute both ranks. If they are equal, b is inside the reach and the system is consistent. If the bigger one is the augmented matrix, b is outside, and the answer is no solution.',
      keyword: 'rank(A) against rank([A|b])',
      trap: 'Do not compare the number of equations with the number of unknowns. Compare the two ranks; that is the definition.'
    },
    {
      id: 'sy-3', scene: 'systems', start: 105, end: 112.5,
      caption: 'Consistent with rank below the number of unknowns means free variables: infinitely many solutions.',
      detail: 'When the system is consistent and the rank is less than the number of unknowns, the nullity is positive, so adding any null vector to a solution gives another solution. The number of free parameters equals the nullity.',
      narration: 'Suppose it is consistent but the rank is short of the number of unknowns. Then some directions are crushed to zero, and you can slide a solution along any of them and stay a solution. So there are infinitely many, with one free parameter per crushed direction.',
      keyword: 'free variables = nullity',
      trap: 'Infinitely many is not "all vectors". The solution set is a shifted null space: one particular solution plus every null vector.'
    },
    {
      id: 'sy-4', scene: 'systems', start: 112.5, end: 120,
      caption: 'For a wide matrix with m greater than n, the homogeneous system has at least m minus n independent solutions.',
      detail: 'With n rows and m columns and m greater than n, the rank is at most n, so the nullity is at least m minus n. That is exactly the statement GATE CSE 2024 Set 1 asked about Ax = 0, and only the "at least" version is true.',
      narration: 'Now the wide case, which is a favourite. n equations, m unknowns, m bigger than n. The rank can be at most n, so the nullity is at least m minus n, and the homogeneous system always has that many independent solutions. GATE 2024 Set 1 asked this, and the "at least" wording is what makes it true.',
      keyword: 'nullity at least m - n',
      trap: 'The same statement with "exactly m minus n" is false, because the rank can be lower than n. The quantifier carries the mark.'
    },

    /* ---------------- scene 5: lu ---------------- */
    {
      id: 'lu-1', scene: 'lu', start: 120, end: 127.5,
      caption: 'Elimination can be written down as a product: A equals L times U.',
      detail: 'Gaussian elimination clears entries below the diagonal using multipliers. Collect those multipliers in a lower triangular matrix L with ones on the diagonal, and the eliminated matrix is upper triangular, U. Then A equals L times U, exactly, with no arithmetic lost.',
      narration: 'When you eliminate, you multiply a row by a number and subtract it from another. That number is a multiplier, and if you keep every multiplier you can rebuild the original matrix. L holds them below the diagonal with ones down the middle, U is what is left, and A is their product.',
      keyword: 'A = L times U',
      trap: 'L is not the eliminated matrix and U is not the original. L stores the multipliers; U stores the pivots and the cleared rows.'
    },
    {
      id: 'lu-2', scene: 'lu', start: 127.5, end: 135,
      caption: 'Plain LU exists when the leading pivots are all non-zero — the leading principal minors decide.',
      detail: 'Doolittle elimination without row exchanges breaks down exactly when a pivot is zero. That happens precisely when a leading principal minor vanishes. If every leading principal minor is non-zero, the decomposition exists and is unique.',
      narration: 'Plain LU is not always possible. If a pivot comes out zero, elimination stops. That happens exactly when one of the leading principal minors is zero. When none of them is, the decomposition exists and there is only one.',
      keyword: 'leading principal minors',
      trap: 'A non-zero determinant is not enough. The determinant can be non-zero while an early pivot is zero, and then you need a row swap.'
    },
    {
      id: 'lu-3', scene: 'lu', start: 135, end: 142.5,
      caption: 'When a pivot is zero, swap rows: then P A equals L U, with P a permutation matrix.',
      detail: 'A permutation matrix reorders the rows. Allowing one gives PA equals LU for any invertible matrix, because some reordering always brings a non-zero entry into each pivot position. The determinant relation becomes det(P) det(A) equals the product of the pivots.',
      narration: 'If a pivot is zero, reorder the rows first. Write that reordering as a permutation matrix P, and then P A equals L U for any invertible A. The determinant picks up a factor of minus one for each swap, which is how the pivot product still tells you the determinant.',
      keyword: 'PA = LU',
      trap: 'The permutation is part of the answer. Dropping P gives a decomposition of the wrong matrix, and the determinant check will fail.'
    },
    {
      id: 'lu-4', scene: 'lu', start: 142.5, end: 150,
      caption: 'Then solve twice: forward for y in Ly = b, and back for x in Ux = y. Each pass is cheap.',
      detail: 'Forward substitution solves a lower triangular system from the top down, and back substitution solves an upper triangular system from the bottom up. Both cost about n squared over two operations, against n cubed over three for the factorisation itself.',
      narration: 'Once you have L and U, solving is two triangular passes. Forward substitution goes down L to find y, then back substitution goes up U to find x. Each pass is quadratic, which is why the factorisation is worth keeping when several right-hand sides share one matrix.',
      keyword: 'forward, then back',
      trap: 'Solve L y equals b, not L y equals P b, unless the question already applied the permutation. Write down which matrix each pass uses.'
    },

    /* ---------------- scene 6: eigen ---------------- */
    {
      id: 'eg-1', scene: 'eigen', start: 150, end: 157.5,
      caption: 'An eigenvector is a direction the map does not turn; it only stretches or flips it.',
      detail: 'Most vectors change direction when a matrix is applied. A few do not: their image lies on the same line through the origin. Those are the eigenvectors, and each is paired with the factor by which it was stretched.',
      narration: 'Apply a matrix to an arrow and usually the arrow swings to a new direction. But a few special arrows do not swing. Their image lies on the same line, longer or shorter or pointing the other way. Those arrows are the eigenvectors.',
      keyword: 'same line, different length',
      trap: 'Any non-zero multiple of an eigenvector is again an eigenvector, so an eigenvector is never unique. Only the direction is the answer.'
    },
    {
      id: 'eg-2', scene: 'eigen', start: 157.5, end: 165,
      caption: 'The stretch factor is the eigenvalue: A v equals lambda v, with v not the zero vector.',
      detail: 'The defining equation is A v equals lambda times v for some non-zero v. The zero vector is excluded because it satisfies the equation for every lambda and would tell us nothing. Lambda may be negative, which is a flip, or zero, which is a collapse onto the origin.',
      narration: 'The factor is the eigenvalue. A v equals lambda v, and v must not be zero, because zero would satisfy it for every lambda. Lambda can be negative, and that is a flip through the origin, or zero, and that means the direction is crushed to nothing.',
      keyword: 'Av = lambda v',
      trap: 'Zero is a legal eigenvalue but the zero vector is not a legal eigenvector. Mixing those two up is a standard exam slip.'
    },
    {
      id: 'eg-3', scene: 'eigen', start: 165, end: 172.5,
      caption: 'Find them from det(A minus lambda I) equals zero: the characteristic polynomial.',
      detail: 'Rewrite A v equals lambda v as (A minus lambda I) v equals zero. A non-zero v exists exactly when that matrix is singular, so its determinant is zero. Expanding gives a polynomial of degree n whose roots are the eigenvalues.',
      narration: 'To compute them, move everything to one side. A minus lambda I, applied to v, must give zero for a non-zero v, and that is possible only if the matrix is singular. So set its determinant to zero. What you get is a polynomial of degree n, and its roots are the eigenvalues.',
      keyword: 'det(A - lambda I) = 0',
      trap: 'For a two by two, check the discriminant before promising real eigenvalues. A negative discriminant means a complex pair, and the matrix is still real.'
    },
    {
      id: 'eg-4', scene: 'eigen', start: 172.5, end: 180,
      caption: 'Trace is the sum of the eigenvalues and determinant is their product. Two free checks on any answer.',
      detail: 'The coefficient of lambda to the power n minus one is the trace, so the sum of the eigenvalues equals the trace. The constant term is the determinant, up to sign, so the product equals the determinant. Both are visible in the matrix without any work.',
      narration: 'Two free checks come with the polynomial. The eigenvalues add up to the trace, the sum of the diagonal entries, and they multiply to the determinant. So whatever set you find, add it and multiply it before you trust it.',
      keyword: 'sum = trace, product = determinant',
      trap: 'These check the multiset of eigenvalues, not the eigenvectors. A wrong eigenvector passes both tests, so check A v equals lambda v separately.'
    },

    /* ---------------- scene 7: special ---------------- */
    {
      id: 'sp-1', scene: 'special', start: 180, end: 187.5,
      caption: 'A triangular matrix has its eigenvalues written on the diagonal, with no work at all.',
      detail: 'For a triangular matrix the determinant of A minus lambda I is the product of the diagonal entries of that difference, because the difference stays triangular. Each factor vanishes at one diagonal entry, so the eigenvalues are exactly the diagonal entries.',
      narration: 'Triangular matrices are gifts. Subtract lambda from the diagonal and the matrix is still triangular, so its determinant is the product of the diagonal entries. Each one vanishes at one diagonal value, so the eigenvalues are the diagonal, read straight off.',
      keyword: 'diagonal entries are the eigenvalues',
      trap: 'This needs triangular, not merely sparse. A matrix with zeros in a scattering of positions is not triangular and the rule does not apply.'
    },
    {
      id: 'sp-2', scene: 'special', start: 187.5, end: 195,
      caption: 'All ones minus the identity has eigenvalues n minus one, and minus one repeated n minus one times.',
      detail: 'The all-ones matrix has rank one and trace n, so its eigenvalues are n and n minus one zeros. Subtracting the identity shifts every eigenvalue down by one, giving n minus one once and minus one the other n minus one times. For n equal to four that is three and three copies of minus one.',
      narration: 'Here is the shape that GATE 2021 used. All ones, minus the identity. The all-ones matrix sends everything onto one line, so it has one eigenvalue equal to n and the rest zero. Subtract one from each and you get n minus one, and minus one repeated.',
      keyword: 'n-1 and -1',
      trap: 'The row sum is the easy route: every row sums to n minus one, so the all-ones vector is an eigenvector with that value. It gives the largest one, not the whole list.'
    },
    {
      id: 'sp-3', scene: 'special', start: 195, end: 202.5,
      caption: 'Powers and inverses act on the eigenvalue alone: A to the k has lambda to the k, and A inverse has one over lambda.',
      detail: 'If A v equals lambda v then applying A again multiplies by lambda again, so A to the k has eigenvalue lambda to the k on the same vector. An invertible A has no zero eigenvalue, and its inverse has eigenvalue one over lambda.',
      narration: 'Powers are free once you know the eigenvalues. Apply the matrix k times and the stretch factor is applied k times, so the eigenvalue becomes lambda to the k. And if A is invertible, its inverse stretches by one over lambda, on the same directions.',
      keyword: 'lambda to the k',
      trap: 'A to the k has the same eigenvectors only when the matrix is diagonalisable, or when you are content with the eigenvalue list. For a defective matrix the eigenvalue rule still holds; the eigenvector list is short.'
    },
    {
      id: 'sp-4', scene: 'special', start: 202.5, end: 210,
      caption: 'A real matrix can have no real eigenvalue: a quarter turn sends every vector to a perpendicular one.',
      detail: 'The rotation by ninety degrees has matrix with rows 0, minus one and 1, 0. Its trace is zero and its determinant is one, so its characteristic polynomial is lambda squared plus one, whose roots are i and minus i. No real vector is preserved.',
      narration: 'And here is the counterexample to a belief worth killing early. A real matrix need not have a real eigenvalue. A quarter turn sends every vector to one perpendicular to it, so nothing is preserved, and the roots come out as plus and minus i.',
      keyword: 'no real eigenvalue',
      trap: 'Symmetry is what guarantees real eigenvalues. Without it, a real matrix may have a complex pair, and a question that asks for real eigenvalues may have the answer "none".'
    },

    /* ---------------- scene 8: diag ---------------- */
    {
      id: 'dg-1', scene: 'diag', start: 210, end: 217.5,
      caption: 'Diagonalising means writing A as P D P inverse, with D holding the eigenvalues.',
      detail: 'Put the eigenvectors in the columns of P and the matching eigenvalues on the diagonal of D. Then A P equals P D, so A equals P D P inverse whenever P is invertible. The matrix is diagonalisable exactly when that P exists.',
      narration: 'If you can find enough eigenvectors, put them in the columns of a matrix P and their eigenvalues on a diagonal matrix D. Then A equals P D P inverse. In the eigenvector basis the map is just a stretch along each axis, which is the simplest thing a map can do.',
      keyword: 'A = P D P inverse',
      trap: 'P must be invertible, which means the eigenvectors must be independent. Two parallel eigenvectors cannot fill the columns of an invertible matrix.'
    },
    {
      id: 'dg-2', scene: 'diag', start: 217.5, end: 225,
      caption: 'A repeated eigenvalue may fail to supply enough eigenvectors, and then the matrix is defective.',
      detail: 'The number of independent eigenvectors for an eigenvalue is its geometric multiplicity, and it is the nullity of A minus lambda I. The number of times it appears as a root is the algebraic multiplicity. Geometric never exceeds algebraic, and equality for every eigenvalue is what diagonalisability requires.',
      narration: 'Repeats are the danger. An eigenvalue can appear twice as a root and still offer only one direction. The count of directions is the nullity of A minus lambda I, and the count of roots is the algebraic multiplicity. When the directions fall short, the matrix is called defective and it cannot be diagonalised.',
      keyword: 'geometric against algebraic',
      trap: 'Repeated eigenvalue does not by itself mean not diagonalisable. The identity has eigenvalue one twice and two independent directions, so it is already diagonal.'
    },
    {
      id: 'dg-3', scene: 'diag', start: 225, end: 232.5,
      caption: 'Symmetric matrices always succeed, with real eigenvalues and perpendicular eigenvectors.',
      detail: 'A real symmetric matrix has real eigenvalues, because the discriminant of its characteristic polynomial is a sum of squares, and eigenvectors for distinct eigenvalues are orthogonal. An orthogonal matrix of eigenvectors diagonalises it.',
      narration: 'One family always works. A real symmetric matrix has only real eigenvalues, and eigenvectors belonging to different eigenvalues come out perpendicular. So the basis exists, and it can even be made orthonormal. That is the spectral theorem, and it is why symmetric matrices are the friendly case.',
      keyword: 'symmetric always diagonalises',
      trap: 'The theorem is about real symmetric matrices. A general matrix with real entries gets none of it, and may fail on both counts.'
    },
    {
      id: 'dg-4', scene: 'diag', start: 232.5, end: 240,
      caption: 'Once diagonal, powers are free: A to the k is P D to the k P inverse, one power per entry.',
      detail: 'Because the inner P inverse P cancels, the k-th power is P times D to the k times P inverse. Raising a diagonal matrix to a power means raising each diagonal entry, so a matrix power that looked expensive becomes n scalar powers.',
      narration: 'This is why diagonalising is worth the effort. Take a power and the P inverse P in the middle cancel, leaving P, D to the k, and P inverse. A power of a diagonal matrix is one power per diagonal entry, so a hard matrix power becomes a handful of numbers.',
      keyword: 'powers become scalar powers',
      trap: 'The shortcut needs the same P on both sides. If the matrix is not diagonalisable, you cannot use it, and a defective matrix has powers that grow a polynomial factor.'
    },

    /* ---------------- scene 9: traps ---------------- */
    {
      id: 'tr-1', scene: 'traps', start: 240, end: 247.5,
      caption: 'Trap one: determinants do not add. The determinant of a sum is not the sum of determinants.',
      detail: 'Take A and B both equal to the identity in two dimensions. Each has determinant one, but the sum is twice the identity, whose determinant is four. The product rule is real; the sum rule is not.',
      narration: 'First trap. Determinants multiply, they do not add. Two copies of the two by two identity each have determinant one, but their sum has determinant four, not two. If you see a determinant of a sum in an option, be suspicious.',
      keyword: 'det(A+B) is not det A + det B',
      trap: 'There is no general formula for the determinant of a sum. Only the product rule and the row-operation rules are safe.'
    },
    {
      id: 'tr-2', scene: 'traps', start: 247.5, end: 255,
      caption: 'Trap two: ranks do not add. The identity and its negative are both full rank; their sum is zero.',
      detail: 'Take the identity and minus the identity. Each has full rank two, and their sum is the zero matrix, whose rank is zero. So the rank of a sum is not the sum of the ranks. What does hold is an inequality: the rank of a sum is at most the sum of the ranks.',
      narration: 'Second trap, the same shape. Rank of a sum is not the sum of ranks. The identity has full rank, and so does its negative, but adding them gives the zero matrix, rank zero. What survives is only an inequality: the rank of a sum is at most the sum of the two ranks.',
      keyword: 'rank(A+B) at most rank A + rank B',
      trap: 'The inequality can be strict in either direction. Knowing the two ranks bounds the sum from above and tells you nothing exact.'
    },
    {
      id: 'tr-3', scene: 'traps', start: 255, end: 262.5,
      caption: 'Trap three: eigenvalues do not add either. A sum has its own eigenvalues.',
      detail: 'Eigenvalues of A plus B are not the eigenvalues of A plus the eigenvalues of B, unless the two share the same eigenvectors. The sum of the two matrices mixes directions, so the pairing is lost.',
      narration: 'Third trap. Eigenvalues of a sum are not the sum of eigenvalues. Adding two matrices mixes their directions, so the old pairings break. The statement is true only when both matrices have the same eigenvectors, and a question will say so if it is meant.',
      keyword: 'no addition rule for eigenvalues',
      trap: 'What does hold: eigenvalues of A plus c times I are the eigenvalues plus c, because the identity has every direction as an eigenvector.'
    },
    {
      id: 'tr-4', scene: 'traps', start: 262.5, end: 270,
      caption: 'Trap four: row operations preserve rank but change the determinant.',
      detail: 'Adding a multiple of one row to another leaves the determinant unchanged, but swapping two rows negates it and scaling a row scales it. All three preserve the rank, which is why elimination is safe for rank and needs bookkeeping for determinant.',
      narration: 'Last trap. Elimination is safe for rank and needs care for determinant. Adding a multiple of a row changes nothing; swapping two rows flips the sign; multiplying a row by a number multiplies the determinant by that number. Rank survives all three untouched.',
      keyword: 'rank survives, determinant does not',
      trap: 'When you compute a determinant by elimination, track the swaps and the scalings. Forgetting them gives the right magnitude and the wrong sign.'
    },

    /* ---------------- scene 10: procedure ---------------- */
    {
      id: 'pc-1', scene: 'procedure', start: 270, end: 277.5,
      caption: 'Step one: read the shape. It caps the rank and decides what "full rank" can mean.',
      detail: 'Write m and n before anything else. The rank cannot exceed the smaller of them, so a square matrix is the only case where rank can equal the number of columns and the number of rows at once. Every later claim is read against that cap.',
      narration: 'Start with shape. Write down the number of rows and the number of columns, because the rank is capped by the smaller one. For a square matrix the cap is one number, and that is why square matrices get the special vocabulary of invertibility.',
      keyword: 'shape first',
      trap: 'Reading the shape wrong changes which rank counts as full, and every consistency statement after that inherits the error.'
    },
    {
      id: 'pc-2', scene: 'procedure', start: 277.5, end: 285,
      caption: 'Step two: for a square matrix, the determinant or the pivots decide invertibility.',
      detail: 'A square matrix is invertible exactly when its determinant is non-zero, which is exactly when elimination produces n pivots, which is exactly when zero is not an eigenvalue. These three statements are one statement in three costumes.',
      narration: 'For a square matrix, step two is invertibility, and there are three equivalent ways to see it. Determinant not zero. Full set of pivots. Zero is not an eigenvalue. They are the same fact, so use whichever is cheapest on the numbers in front of you.',
      keyword: 'det, pivots, zero eigenvalue',
      trap: 'All three need a square matrix. For a rectangular one, the determinant is not defined, so the other two carry the question.'
    },
    {
      id: 'pc-3', scene: 'procedure', start: 285, end: 292.5,
      caption: 'Step three: compare ranks to decide the number of solutions, and count free variables as n minus rank.',
      detail: 'Compute the rank of A and of the augmented matrix. Equal ranks mean consistent; a larger augmented rank means no solution. When consistent, the number of free parameters is the number of columns minus the rank.',
      narration: 'Step three is the solution count. Compare the two ranks: equal means consistent, bigger augmented rank means nothing. Then the number of free parameters is the columns minus the rank. That single line answers most system questions in the paper.',
      keyword: 'two ranks, one subtraction',
      trap: 'The subtraction uses columns, not rows. A tall consistent system can still have free parameters if its rank is below the number of columns.'
    },
    {
      id: 'pc-4', scene: 'procedure', start: 292.5, end: 300,
      caption: 'Step four: the characteristic polynomial, then check the answer against trace and determinant.',
      detail: 'Expand the determinant of A minus lambda I, solve for the roots, and verify that the roots add to the trace and multiply to the determinant. That check catches almost every arithmetic slip before it costs a mark.',
      narration: 'The last step is the polynomial. Expand, solve, and then check. Add your eigenvalues and compare with the trace, multiply them and compare with the determinant. Those two checks cost a few seconds and catch nearly every arithmetic error in the topic.',
      keyword: 'expand, solve, check',
      trap: 'A correct multiset is not a correct eigenvector. If the question asks for a vector, substitute it back into A v equals lambda v.'
    }
  ]
};
