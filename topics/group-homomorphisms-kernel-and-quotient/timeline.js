/* ==========================================================================
   group-homomorphisms-kernel-and-quotient — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   captions.vtt, captions.srt and transcript.md are derived from this file by
   tools/gen-captions.mjs — never edited by hand.

   Every figure quoted in a caption is computed by the model in lesson.js and
   asserted there: the kernel and image of five named maps, the coset counts,
   the quotient checks, the greatest-common-divisor table for 1..6 by full
   enumeration, the 256 maps from Z4 to Z4, the 729 from Z6 to Z3, the ten
   homomorphisms S3 to S3, and the normality of every kernel found.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'relax',
      n: 1,
      title: 'Drop the bijection',
      start: 0, end: 30,
      objective: 'See what survives when the requirement that the map be one-to-one is removed: several elements may land on one image, and the operation is still respected.'
    },
    {
      id: 'def',
      n: 2,
      title: 'The definition and its three consequences',
      start: 30, end: 60,
      objective: 'State a homomorphism as the single equation with no bijection, derive the identity and inverse rules, and see that order is divided rather than preserved.'
    },
    {
      id: 'kernel',
      n: 3,
      title: 'The kernel: the elements that land on the identity',
      start: 60, end: 90,
      objective: 'Define the kernel as the preimage of the identity, see it is always a subgroup, and read its size as the exact measure of the collapse.'
    },
    {
      id: 'inject',
      n: 4,
      title: 'Injectivity is exactly a trivial kernel',
      start: 90, end: 120,
      objective: 'Prove both directions of the equivalence, and test it on every homomorphism between the small cyclic groups.'
    },
    {
      id: 'image',
      n: 5,
      title: 'The image, and the product of the two sizes',
      start: 120, end: 150,
      objective: 'See the image as a subgroup of the target and the identity that the size of the group is the kernel size times the image size.'
    },
    {
      id: 'normal',
      n: 6,
      title: 'The kernel is normal, and that is a restriction',
      start: 150, end: 180,
      objective: 'Show that conjugating a kernel element lands back in the kernel, count normal subgroups in S3 and D4, and name a subgroup that can never be a kernel.'
    },
    {
      id: 'quotient',
      n: 7,
      title: 'Cosets, and why multiplication needs normality',
      start: 180, end: 210,
      objective: 'Build the cosets of a kernel, see coset multiplication agree on every pair of representatives, and watch it fail for a non-normal subgroup with a concrete witness.'
    },
    {
      id: 'firstiso',
      n: 8,
      title: 'The first isomorphism theorem',
      start: 210, end: 240,
      objective: 'State that the quotient by the kernel is isomorphic to the image, and verify the induced map on four worked maps.'
    },
    {
      id: 'count',
      n: 9,
      title: 'Counting the homomorphisms that exist',
      start: 240, end: 270,
      objective: 'Count homomorphisms between cyclic groups by enumerating maps, see the greatest-common-divisor table, and count the onto ones.'
    },
    {
      id: 'exam',
      n: 10,
      title: 'How GATE asks it, and the three traps',
      start: 270, end: 300,
      objective: 'Recognise the four question shapes and avoid the three traps: order divided not preserved, kernel normal not arbitrary, and the size product.'
    }
  ],

  events: [
    /* ---------------- scene 1: relax ---------------- */
    { id: 'e01', scene: 'relax', start: 0, end: 6,
      caption: 'An isomorphism renames the elements. A homomorphism is allowed to lose information: several elements may land on the same place.',
      detail: 'An isomorphism is a bijection that respects the operation. Drop the bijection and one requirement is left: the operation must still be respected. The map may now merge elements, and merging is the whole subject of this page.',
      narration: 'An isomorphism renames the elements. A homomorphism is allowed to lose information: several elements may land on the same place.',
      keyword: 'allowed to lose information' },

    { id: 'e02', scene: 'relax', start: 6, end: 12,
      caption: 'Here is the map from Z6 to Z3 that takes each number to its remainder on division by three. Zero and three both land on zero.',
      detail: 'Z6 is the integers 0 to 5 added modulo 6. Z3 is 0, 1, 2 added modulo 3. The map is phi of x equals x mod 3. It sends 0 to 0, 1 to 1, 2 to 2, 3 to 0, 4 to 1 and 5 to 2.',
      narration: 'Here is the map from Z6 to Z3 that takes each number to its remainder on division by three. Zero and three both land on zero.',
      keyword: 'remainder' },

    { id: 'e03', scene: 'relax', start: 12, end: 18,
      caption: 'It still respects the operation: add first and then map, or map first and then add, and the answer is the same.',
      detail: 'Take 4 and 5 in Z6. Their sum is 9, which is 3 modulo 6, and 3 maps to 0. Map them first: 4 goes to 1 and 5 goes to 2, and 1 plus 2 is 0 in Z3. Both routes give 0. The page checks all 36 ordered pairs and reports no violation.',
      narration: 'It still respects the operation: add first and then map, or map first and then add, and the answer is the same.',
      keyword: 'the answer is the same' },

    { id: 'e04', scene: 'relax', start: 18, end: 24,
      caption: 'Two elements land on each image: six elements in, three out. The map is two to one, so it is not injective.',
      detail: 'Each value in Z3 has exactly two preimages: 0 comes from 0 and 3, 1 from 1 and 4, 2 from 2 and 5. A map that sends two elements to one is not injective, and no relabelling of the target can fix that.',
      narration: 'Two elements land on each image: six elements in, three out. The map is two to one, so it is not injective.',
      keyword: 'two to one' },

    { id: 'e05', scene: 'relax', start: 24, end: 30,
      caption: 'That collapse is not a defect. It is the object: a homomorphism records what survives when a group is folded onto a smaller one.',
      detail: 'A bijection answers the question "are these the same group". A homomorphism answers a different question: "what does this group look like from the point of view of that one". The fold is the answer, so the fold must be measurable. The next scene measures it.',
      narration: 'That collapse is not a defect. It is the object: a homomorphism records what survives when a group is folded onto a smaller one.',
      keyword: 'what survives' },

    /* ---------------- scene 2: def ---------------- */
    { id: 'e06', scene: 'def', start: 30, end: 36,
      caption: 'Definition: phi of a times b equals phi of a times phi of b, for every a and b. No bijection is required.',
      detail: 'Let G and H be groups with operations written as multiplication. A map phi from G to H is a homomorphism when phi of a b equals phi of a times phi of b for all a and b in G. That is the whole definition. Everything else on this page is a consequence of that one line.',
      narration: 'Definition: phi of a times b equals phi of a times phi of b, for every a and b. No bijection is required.',
      keyword: 'No bijection is required' },

    { id: 'e07', scene: 'def', start: 36, end: 42,
      caption: 'The identity goes to the identity. Apply the equation to the identity and the identity, and the image must behave as an identity.',
      detail: 'phi of e times e equals phi of e times phi of e, and also phi of e, since e times e is e. Cancelling one factor leaves phi of e equal to the identity of H. A group has exactly one identity, so there is no ambiguity.',
      narration: 'The identity goes to the identity. Apply the equation to the identity and the identity, and the image must behave as an identity.',
      keyword: 'identity goes to the identity' },

    { id: 'e08', scene: 'def', start: 42, end: 48,
      caption: 'Inverses go to inverses, by applying the same equation to a and its inverse. Their product is the identity, and its image must be too.',
      detail: 'phi of a times phi of a inverse equals phi of a times a inverse, which is phi of e, which is the identity. Two elements multiplying to the identity are inverses of each other, so phi of a inverse is the inverse of phi of a.',
      narration: 'Inverses go to inverses, by applying the same equation to a and its inverse. Their product is the identity, and its image must be too.',
      keyword: 'Inverses go to inverses' },

    { id: 'e09', scene: 'def', start: 48, end: 54,
      caption: 'Order is divided, not preserved. In Z4 to Z2 by remainder, the element one has order four and its image has order two.',
      detail: 'In Z4 the element 1 needs four additions to reach 0. Its image in Z2 is 1, which needs two. So a homomorphism may shorten an element order. What it can never do is create a longer one, because if a taken k times is the identity then phi of a taken k times is too.',
      narration: 'Order is divided, not preserved. In Z4 to Z2 by remainder, the element one has order four and its image has order two.',
      keyword: 'Order is divided, not preserved' },

    { id: 'e10', scene: 'def', start: 54, end: 60,
      caption: 'That last line is the first trap. A homomorphism can shrink order; it can never create it, so the image order always divides the original order.',
      detail: 'The proof is one line: if a to the k is the identity, then phi of a to the k is the identity as well, so the order of the image divides k, and the smallest such k is the order of a. The page checks this on every homomorphism in a fixed set of small cyclic pairs and reports no exception.',
      narration: 'That last line is the first trap. A homomorphism can shrink order; it can never create it, so the image order always divides the original order.',
      keyword: 'can never create it',
      trap: 'Reading "order is preserved" off an isomorphism and reusing it for a homomorphism. Order is preserved only when the kernel is trivial.' },

    /* ---------------- scene 3: kernel ---------------- */
    { id: 'e11', scene: 'kernel', start: 60, end: 66,
      caption: 'The kernel is the set of elements that land on the identity. In Z6 to Z3 by remainder, the kernel is the pair zero and three.',
      detail: 'Written with the Greek letter phi, the kernel of phi is the set of all a in G with phi of a equal to the identity of H. Here phi of 0 is 0 and phi of 3 is 0, and nothing else maps to 0, so the kernel is the two elements 0 and 3.',
      narration: 'The kernel is the set of elements that land on the identity. In Z6 to Z3 by remainder, the kernel is the pair zero and three.',
      keyword: 'kernel' },

    { id: 'e12', scene: 'kernel', start: 66, end: 72,
      caption: 'The kernel is always a subgroup: it holds the identity, it is closed, and it holds inverses. Here three plus three is zero, and three is its own inverse.',
      detail: 'The identity is in the kernel because phi of e is e. If phi of a and phi of b are both the identity then phi of a b is the product of two identities, so it is the identity. If phi of a is the identity then phi of a inverse is the inverse of the identity, which is the identity. All three closures are free.',
      narration: 'The kernel is always a subgroup: it holds the identity, it is closed, and it holds inverses. Here three plus three is zero, and three is its own inverse.',
      keyword: 'always a subgroup' },

    { id: 'e13', scene: 'kernel', start: 72, end: 78,
      caption: 'Its size measures the collapse. A kernel of two on a group of six means every image has exactly two preimages.',
      detail: 'If phi of a equals phi of b then phi of a b inverse is the identity, so a b inverse is in the kernel. That means a and b differ by a kernel element, and the preimage of any value is a coset of the kernel. Every value that is hit is hit exactly as many times as the kernel is big.',
      narration: 'Its size measures the collapse. A kernel of two on a group of six means every image has exactly two preimages.',
      keyword: 'measures the collapse' },

    { id: 'e14', scene: 'kernel', start: 78, end: 84,
      caption: 'A kernel of one element means nothing is lost. The kernel is the exact measure of how far the map is from being injective.',
      detail: 'The kernel always contains the identity, so the smallest possible kernel has one element. That case is exactly the injective case, which the next scene proves. Nothing else in the map carries that information.',
      narration: 'A kernel of one element means nothing is lost. The kernel is the exact measure of how far the map is from being injective.',
      keyword: 'nothing is lost' },

    { id: 'e15', scene: 'kernel', start: 84, end: 90,
      caption: 'The kernel decides injectivity; the image does not. Image size tells you how much survived, not how much was merged.',
      detail: 'Two maps can have the same image and different kernels, so the image cannot answer the injectivity question. The kernel can, because a merge is precisely a non-identity element landing on the identity.',
      narration: 'The kernel decides injectivity; the image does not. Image size tells you how much survived, not how much was merged.',
      keyword: 'The kernel decides injectivity' },

    /* ---------------- scene 4: inject ---------------- */
    { id: 'e16', scene: 'inject', start: 90, end: 96,
      caption: 'Claim: phi is injective exactly when its kernel is the single identity. Two directions, and both are short.',
      detail: 'This is the most used fact about kernels in an exam. It converts a statement about all pairs of elements, which is infinite in general, into a statement about one set, which is a finite computation for a finite group.',
      narration: 'Claim: phi is injective exactly when its kernel is the single identity. Two directions, and both are short.',
      keyword: 'exactly when' },

    { id: 'e17', scene: 'inject', start: 96, end: 102,
      caption: 'Forward: if two elements have the same image, their quotient lands on the identity, so the quotient is in the kernel.',
      detail: 'Suppose phi of a equals phi of b. Multiply both sides by the inverse of phi of b, using that inverses go to inverses: phi of a b inverse is the identity. So a b inverse is a kernel element. If the kernel holds only the identity, then a b inverse is the identity, so a equals b, which is injectivity.',
      narration: 'Forward: if two elements have the same image, their quotient lands on the identity, so the quotient is in the kernel.',
      keyword: 'their quotient lands on the identity' },

    { id: 'e18', scene: 'inject', start: 102, end: 108,
      caption: 'Backward: if the kernel is trivial, phi of a equals phi of b forces a equals b. Only the identity can map to the identity.',
      detail: 'This is the same argument read as a proof by contradiction: a collision would produce a non-identity kernel element, and a trivial kernel has none. Both directions use the same one-line computation, which is why the equivalence is cheap to apply.',
      narration: 'Backward: if the kernel is trivial, phi of a equals phi of b forces a equals b. Only the identity can map to the identity.',
      keyword: 'Only the identity' },

    { id: 'e19', scene: 'inject', start: 108, end: 114,
      caption: 'Z6 to Z3 has a kernel of two, so it is not injective: zero and three collide on zero. Z4 to Z4 by doubling has kernel zero and two.',
      detail: 'The second map sends x to 2x modulo 4, giving 0, 2, 0, 2. Its kernel is 0 and 2, so it is also not injective, and its image is the two-element set 0 and 2. Both maps show the same mechanism at different sizes.',
      narration: 'Z6 to Z3 has a kernel of two, so it is not injective: zero and three collide on zero. Z4 to Z4 by doubling has kernel zero and two.',
      keyword: 'collide' },

    { id: 'e20', scene: 'inject', start: 114, end: 120,
      caption: 'On this page, 41 homomorphisms between small cyclic groups were tested, and injectivity matched a trivial kernel in every one.',
      detail: 'The test is mechanical: build the map, collect the kernel, and compare the size of the kernel with one against the number of distinct images with the size of the group. Forty-one maps, zero disagreements. The check is asserted at load, so the number in this caption is computed rather than quoted.',
      narration: 'On this page, 41 homomorphisms between small cyclic groups were tested, and injectivity matched a trivial kernel in every one.',
      keyword: '41 homomorphisms' },

    /* ---------------- scene 5: image ---------------- */
    { id: 'e21', scene: 'image', start: 120, end: 126,
      caption: 'The image is the set of values actually hit, and it is always a subgroup of the target. Here it is all of Z3.',
      detail: 'The image of phi is the set of phi of a as a runs over G. It contains the identity, is closed under the operation and holds inverses, for exactly the same reason the kernel does. When the image is the whole target the map is called onto, or surjective.',
      narration: 'The image is the set of values actually hit, and it is always a subgroup of the target. Here it is all of Z3.',
      keyword: 'always a subgroup of the target' },

    { id: 'e22', scene: 'image', start: 126, end: 132,
      caption: 'For a finite group the sizes multiply exactly: the size of the group is the size of the kernel times the size of the image. Six is two times three.',
      detail: 'The preimages of the image values are the cosets of the kernel. Every coset has the same size as the kernel, the cosets partition the group, and there is one coset per value in the image. So the group size is the kernel size times the number of values, which is the image size.',
      narration: 'For a finite group the sizes multiply exactly: the size of the group is the size of the kernel times the size of the image. Six is two times three.',
      keyword: 'sizes multiply exactly' },

    { id: 'e23', scene: 'image', start: 132, end: 138,
      caption: 'Z12 to Z4 by remainder: kernel three, image four, and twelve is three times four. So the kernel size is forced once the image is known.',
      detail: 'The kernel is 0, 4 and 8, three elements. The image is all four residues. Twelve equals three times four, so a question that gives you the image and the group leaves you no choice about the kernel size, and the other way round.',
      narration: 'Z12 to Z4 by remainder: kernel three, image four, and twelve is three times four. So the kernel size is forced once the image is known.',
      keyword: 'forced' },

    { id: 'e24', scene: 'image', start: 138, end: 144,
      caption: 'The sign map from S3 to Z2: kernel three, image two, six is three times two. The kernel is the three rotations.',
      detail: 'The sign map sends an even permutation to 0 and an odd permutation to 1. The three even permutations are the identity and the two three-cycles. That set is a subgroup, and the three transpositions are the other coset.',
      narration: 'The sign map from S3 to Z2: kernel three, image two, six is three times two. The kernel is the three rotations.',
      keyword: 'sign map' },

    { id: 'e25', scene: 'image', start: 144, end: 150,
      caption: 'The image size always divides the order of the group, and the kernel size always divides it too. Both follow from the same counting.',
      detail: 'This is Lagrange for the image and for the kernel, obtained without stating Lagrange: the group splits into equal-sized cosets of the kernel, one per image value. A divisor answer to an exam question is a free consistency check on any kernel or image size you compute.',
      narration: 'The image size always divides the order of the group, and the kernel size always divides it too. Both follow from the same counting.',
      keyword: 'always divides' },

    /* ---------------- scene 6: normal ---------------- */
    { id: 'e26', scene: 'normal', start: 150, end: 156,
      caption: 'The kernel is not just a subgroup. Conjugating any kernel element by any group element puts you back inside the kernel.',
      detail: 'Conjugating k by g means g k g inverse. If k is in the kernel then phi of g k g inverse is phi of g times the identity times phi of g inverse, which is the identity. So the conjugate is a kernel element too. A subgroup closed under conjugation by every element is called normal.',
      narration: 'The kernel is not just a subgroup. Conjugating any kernel element by any group element puts you back inside the kernel.',
      keyword: 'normal' },

    { id: 'e27', scene: 'normal', start: 156, end: 162,
      caption: 'In D4, the eight symmetries of the square, there are ten subgroups and exactly six are normal. The four reflection pairs are not.',
      detail: 'The normal ones are the identity, the half turn, the four rotations, the two order-four subgroups containing the half turn and two reflections, and the whole group. Each of the four single reflections forms a subgroup with the identity, and conjugation moves it to another reflection.',
      narration: 'In D4, the eight symmetries of the square, there are ten subgroups and exactly six are normal. The four reflection pairs are not.',
      keyword: 'six are normal' },

    { id: 'e28', scene: 'normal', start: 162, end: 168,
      caption: 'In S3 there are six subgroups and three normal: the identity, the three rotations, and the whole group.',
      detail: 'The three transpositions each give a subgroup of order two, and none of those is normal. The rotations form a subgroup of order three, and that one is normal because the two cosets are the rotations and the reflections, and each is closed under conjugation.',
      narration: 'In S3 there are six subgroups and three normal: the identity, the three rotations, and the whole group.',
      keyword: 'three normal' },

    { id: 'e29', scene: 'normal', start: 168, end: 174,
      caption: 'Conjugating one transposition subgroup by the rotations gives all three of them, so no single one is closed under conjugation.',
      detail: 'The three subgroups are the identity with (2 3), the identity with (1 2), and the identity with (1 3). Conjugation by a rotation cycles through them. A set that moves to a different set under conjugation cannot be a kernel, because a kernel is closed under conjugation.',
      narration: 'Conjugating one transposition subgroup by the rotations gives all three of them, so no single one is closed under conjugation.',
      keyword: 'all three of them' },

    { id: 'e30', scene: 'normal', start: 174, end: 180,
      caption: 'That is the counterexample: the identity and one reflection form a subgroup of D4, and it is the kernel of no homomorphism out of D4.',
      detail: 'The general fact is that every kernel is normal, so a non-normal subgroup is excluded from the start. This page checks the other direction only where it is cheap: it enumerates every homomorphism from S3 to itself, and from D4 to Z2 and to V4, and confirms that every kernel that appears is normal.',
      narration: 'That is the counterexample: the identity and one reflection form a subgroup of D4, and it is the kernel of no homomorphism out of D4.',
      keyword: 'kernel of no homomorphism',
      trap: 'Assuming every subgroup is somebody\'s kernel. Only normal subgroups are, and the transposition subgroups of S3 are the standard counterexample.' },

    /* ---------------- scene 7: quotient ---------------- */
    { id: 'e31', scene: 'quotient', start: 180, end: 186,
      caption: 'Take the cosets of the kernel: multiply the kernel by each element and collect. Here the three cosets are zero-three, one-four and two-five.',
      detail: 'A coset is the set of all products x k as k runs over the kernel, for one fixed x. For the kernel 0 and 3 in Z6, the coset of 0 is 0 and 3, the coset of 1 is 1 and 4, and the coset of 2 is 2 and 5. Three cosets, each of size two.',
      narration: 'Take the cosets of the kernel: multiply the kernel by each element and collect. Here the three cosets are zero-three, one-four and two-five.',
      keyword: 'cosets' },

    { id: 'e32', scene: 'quotient', start: 186, end: 192,
      caption: 'Those three cosets form a group of three elements under coset multiplication, and it is the group Z3 again.',
      detail: 'Multiply two cosets by multiplying a representative from each and taking the coset that contains the answer. The cosets of a kernel close under this, contain the kernel as the identity, and every coset has an inverse coset. The result is the quotient group.',
      narration: 'Those three cosets form a group of three elements under coset multiplication, and it is the group Z3 again.',
      keyword: 'quotient group' },

    { id: 'e33', scene: 'quotient', start: 192, end: 198,
      caption: 'Multiplication is well defined because the kernel is normal: a different representative gives the same coset. Twelve of the 36 ordered pairs share a coset, and all agree.',
      detail: 'The danger is that a coset has many names, so a product might depend on which name you pick. For a normal subgroup it does not. On this page every ordered pair of elements that lies in one coset is tested against the map, and in the Z6 to Z3 case that is 12 of the 36 pairs, all consistent.',
      narration: 'Multiplication is well defined because the kernel is normal: a different representative gives the same coset. Twelve of the 36 ordered pairs share a coset, and all agree.',
      keyword: 'well defined' },

    { id: 'e34', scene: 'quotient', start: 198, end: 204,
      caption: 'With a non-normal subgroup it fails. In S3, take the identity and the transposition (2 3). Multiply the identity by (1 2), then the transposition by (1 2).',
      detail: 'The subgroup is the identity and (2 3). The identity times (1 2) is (1 2). The transposition (2 3) times (1 2) is a different permutation, and it lies in a different coset. Two representatives of the same coset, two different answers, so there is no well-defined product.',
      narration: 'With a non-normal subgroup it fails. In S3, take the identity and the transposition (2 3). Multiply the identity by (1 2), then the transposition by (1 2).',
      keyword: 'it fails' },

    { id: 'e35', scene: 'quotient', start: 204, end: 210,
      caption: 'Same coset, different answer. That is exactly why the quotient is built on normal subgroups and not on subgroups.',
      detail: 'This is the reason the word normal exists at all, and why the first isomorphism theorem is stated with the kernel rather than with an arbitrary subgroup. The obstruction is not a technicality: the multiplication genuinely does not exist.',
      narration: 'Same coset, different answer. That is exactly why the quotient is built on normal subgroups and not on subgroups.',
      keyword: 'Same coset, different answer' },

    /* ---------------- scene 8: firstiso ---------------- */
    { id: 'e36', scene: 'firstiso', start: 210, end: 216,
      caption: 'The first isomorphism theorem: the group of cosets of the kernel is isomorphic to the image of the map.',
      detail: 'Written G modulo the kernel is isomorphic to the image. The two sides have the same number of elements, and there is a canonical map between them: send a coset to the value that all its elements share. The theorem says that map is an isomorphism.',
      narration: 'The first isomorphism theorem: the group of cosets of the kernel is isomorphic to the image of the map.',
      keyword: 'isomorphic to the image' },

    { id: 'e37', scene: 'firstiso', start: 216, end: 222,
      caption: 'The map sends a coset to the value its elements share. It is well defined, injective, onto the image, and it preserves the operation.',
      detail: 'Well defined uses normality. Injective uses that two cosets with the same value differ by a kernel element, so they are the same coset. Onto the image is immediate. Preserving the operation is one line: phi of a b equals phi of a times phi of b.',
      narration: 'The map sends a coset to the value its elements share. It is well defined, injective, onto the image, and it preserves the operation.',
      keyword: 'well defined, injective, onto' },

    { id: 'e38', scene: 'firstiso', start: 222, end: 228,
      caption: 'Checked on Z6 to Z3: three cosets against three image values, and all nine coset products agree with the product in Z3.',
      detail: 'The page builds the cosets, indexes them, multiplies representatives, and compares the induced map against the operation in the target. Nine ordered pairs of cosets, nine agreements, and the induced map is a bijection on three elements.',
      narration: 'Checked on Z6 to Z3: three cosets against three image values, and all nine coset products agree with the product in Z3.',
      keyword: 'all nine coset products' },

    { id: 'e39', scene: 'firstiso', start: 228, end: 234,
      caption: 'And on S3 to Z2: two cosets, the rotations and the reflections, against the two values. Six is three times two.',
      detail: 'The quotient of S3 by the rotations is a group of two elements, and the sign map is the isomorphism onto Z2. Two cosets, two image values, and every product of cosets agrees. This is the smallest interesting example of the theorem.',
      narration: 'And on S3 to Z2: two cosets, the rotations and the reflections, against the two values. Six is three times two.',
      keyword: 'the rotations and the reflections' },

    { id: 'e40', scene: 'firstiso', start: 234, end: 240,
      caption: 'This is the sentence the whole lesson builds to: every homomorphism is a quotient followed by an injective map.',
      detail: 'Factor phi as the natural map from the group onto its cosets, which is onto, followed by the induced map from the cosets to the image, which is injective. The collapse is entirely in the first step, and the second step loses nothing. Once you see that, the kernel and the quotient are the same information.',
      narration: 'This is the sentence the whole lesson builds to: every homomorphism is a quotient followed by an injective map.',
      keyword: 'a quotient followed by an injective map' },

    /* ---------------- scene 9: count ---------------- */
    { id: 'e41', scene: 'count', start: 240, end: 246,
      caption: 'Counting: a homomorphism out of Z_m is fixed by where the element one goes, and the choice must satisfy m times k equals zero modulo n.',
      detail: 'Every element of Z_m is a sum of ones, so the map is determined by the single value k that one is sent to. It is a homomorphism only if sending m copies of one around the circle lands back on the identity, which is the condition m k equal to zero modulo n.',
      narration: 'Counting: a homomorphism out of Z_m is fixed by where the element one goes, and the choice must satisfy m times k equals zero modulo n.',
      keyword: 'fixed by where the element one goes' },

    { id: 'e42', scene: 'count', start: 246, end: 252,
      caption: 'The count is the greatest common divisor of m and n. For Z4 to Z4 the page enumerates 256 maps and finds four homomorphisms.',
      detail: 'The solutions of m k equal to zero modulo n are the multiples of n over the greatest common divisor, and there are exactly that divisor many of them in one period. The page does not take the formula on trust: it builds all n to the m maps and tests each one on every ordered pair.',
      narration: 'The count is the greatest common divisor of m and n. For Z4 to Z4 the page enumerates 256 maps and finds four homomorphisms.',
      keyword: 'greatest common divisor' },

    { id: 'e43', scene: 'count', start: 252, end: 258,
      caption: 'Z6 to Z3: 729 maps, three homomorphisms. The count is three, the greatest common divisor of six and three.',
      detail: 'Each of the six elements of Z6 has three possible images, so there are 3 to the 6, which is 729 maps. Only three respect the operation: the constant zero map, and the two maps that send one to one or to two. The whole table for one to six is computed this way.',
      narration: 'Z6 to Z3: 729 maps, three homomorphisms. The count is three, the greatest common divisor of six and three.',
      keyword: '729 maps' },

    { id: 'e44', scene: 'count', start: 258, end: 264,
      caption: 'Onto homomorphisms exist only when n divides m, and then there are phi of n of them. Twelve to four gives two; six to four gives none.',
      detail: 'An onto map from Z_m must hit a generator of Z_n, and that is possible only if the image can have n elements, which needs n to divide m. The number of generators of Z_n is Euler\'s totient, written phi of n. For n equal to four that is two, and 6 does not divide 12 in the other direction, so six to four has none.',
      narration: 'Onto homomorphisms exist only when n divides m, and then there are phi of n of them. Twelve to four gives two; six to four gives none.',
      keyword: 'phi of n' },

    { id: 'e45', scene: 'count', start: 264, end: 270,
      caption: 'For non-cyclic groups the count is not a formula. S3 to S3 is ten, S3 to Z3 is one, and S3 to V4 is four — all by enumeration.',
      detail: 'The ten from S3 to S3 are the trivial map, the six automorphisms, and three maps whose kernel is the rotations. S3 to Z3 is only the trivial map, because three does not divide six in the way the abelianisation needs. These numbers come from testing all 46656 maps and all 4096 maps respectively.',
      narration: 'For non-cyclic groups the count is not a formula. S3 to S3 is ten, S3 to Z3 is one, and S3 to V4 is four, all by enumeration.',
      keyword: 'not a formula' },

    /* ---------------- scene 10: exam ---------------- */
    { id: 'e46', scene: 'exam', start: 270, end: 276,
      caption: 'GATE asks four shapes: is this map a homomorphism, how many are there, what is the kernel, and is it injective or onto.',
      detail: 'The first shape gives a formula and asks you to check one equation. The second asks for a count. The third asks for a set, usually for a named map. The fourth is answered by the kernel in one line. Every previous-year question on this topic that this page found fits one of the four.',
      narration: 'GATE asks four shapes: is this map a homomorphism, how many are there, what is the kernel, and is it injective or onto.',
      keyword: 'four shapes' },

    { id: 'e47', scene: 'exam', start: 276, end: 282,
      caption: 'The shortcut: the order of phi of a divides the order of a. Use it to rule a candidate out in one line before checking any product.',
      detail: 'For a proposed map, compute the order of an element and the order of its image. If the second does not divide the first, the map is not a homomorphism and you can stop. On a multiple-choice question this usually removes two options before any multiplication.',
      narration: 'The shortcut: the order of phi of a divides the order of a. Use it to rule a candidate out in one line before checking any product.',
      keyword: 'divides the order of a' },

    { id: 'e48', scene: 'exam', start: 282, end: 288,
      caption: 'Trap one: a homomorphism divides order, it does not preserve it. Trap two: the kernel is normal, so a non-normal subgroup is never a kernel.',
      detail: 'Both traps come from carrying a true statement about isomorphisms one step too far. The fix is to keep the two definitions apart: a homomorphism has one equation, an isomorphism has that equation plus a bijection, and only the second preserves order and has a trivial kernel.',
      narration: 'Trap one: a homomorphism divides order, it does not preserve it. Trap two: the kernel is normal, so a non-normal subgroup is never a kernel.',
      keyword: 'never a kernel',
      trap: 'Answering "kernel equals the subgroup I was given" without checking normality. Two of the three options on such a question are usually non-normal.' },

    { id: 'e49', scene: 'exam', start: 288, end: 294,
      caption: 'Trap three: the kernel size times the image size equals the group size. A pair of numbers that does not multiply out is wrong.',
      detail: 'This is a free check on any answer that gives two of the three numbers. It also settles questions that give the kernel and ask for the image size, or the reverse. It is the counting argument from scene five, used backwards.',
      narration: 'Trap three: the kernel size times the image size equals the group size. A pair of numbers that does not multiply out is wrong.',
      keyword: 'multiply out' },

    { id: 'e50', scene: 'exam', start: 294, end: 300,
      caption: 'One line to carry: the kernel measures the collapse, the image is what survives, and the quotient joins them into one theorem.',
      detail: 'Every question on this topic is a question about one of those three objects, or about the relation between them. If you can name which one is being asked about, the method follows: kernel for injectivity, image for surjectivity, and the quotient for structure.',
      narration: 'One line to carry: the kernel measures the collapse, the image is what survives, and the quotient joins them into one theorem.',
      keyword: 'the quotient joins them' }
  ]
};
