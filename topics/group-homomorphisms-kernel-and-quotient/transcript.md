# Group Homomorphisms Kernel And Quotient — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/group-homomorphisms-kernel-and-quotient/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 50 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Drop the bijection

*0:00 – 0:30 · objective: See what survives when the requirement that the map be one-to-one is removed: several elements may land on one image, and the operation is still respected.*

**0:00–0:06** — An isomorphism renames the elements. A homomorphism is allowed to lose information: several elements may land on the same place.

> Caption: An isomorphism renames the elements. A homomorphism is allowed to lose information: several elements may land on the same place.

**0:06–0:12** — Here is the map from Z6 to Z3 that takes each number to its remainder on division by three. Zero and three both land on zero.

> Caption: Here is the map from Z6 to Z3 that takes each number to its remainder on division by three. Zero and three both land on zero.

**0:12–0:18** — It still respects the operation: add first and then map, or map first and then add, and the answer is the same.

> Caption: It still respects the operation: add first and then map, or map first and then add, and the answer is the same.

**0:18–0:24** — Two elements land on each image: six elements in, three out. The map is two to one, so it is not injective.

> Caption: Two elements land on each image: six elements in, three out. The map is two to one, so it is not injective.

**0:24–0:30** — That collapse is not a defect. It is the object: a homomorphism records what survives when a group is folded onto a smaller one.

> Caption: That collapse is not a defect. It is the object: a homomorphism records what survives when a group is folded onto a smaller one.

## Scene 2. The definition and its three consequences

*0:30 – 1:00 · objective: State a homomorphism as the single equation with no bijection, derive the identity and inverse rules, and see that order is divided rather than preserved.*

**0:30–0:36** — Definition: phi of a times b equals phi of a times phi of b, for every a and b. No bijection is required.

> Caption: Definition: phi of a times b equals phi of a times phi of b, for every a and b. No bijection is required.

**0:36–0:42** — The identity goes to the identity. Apply the equation to the identity and the identity, and the image must behave as an identity.

> Caption: The identity goes to the identity. Apply the equation to the identity and the identity, and the image must behave as an identity.

**0:42–0:48** — Inverses go to inverses, by applying the same equation to a and its inverse. Their product is the identity, and its image must be too.

> Caption: Inverses go to inverses, by applying the same equation to a and its inverse. Their product is the identity, and its image must be too.

**0:48–0:54** — Order is divided, not preserved. In Z4 to Z2 by remainder, the element one has order four and its image has order two.

> Caption: Order is divided, not preserved. In Z4 to Z2 by remainder, the element one has order four and its image has order two.

**0:54–1:00** — That last line is the first trap. A homomorphism can shrink order; it can never create it, so the image order always divides the original order.

> Caption: That last line is the first trap. A homomorphism can shrink order; it can never create it, so the image order always divides the original order.

Exam-trap caption mode adds: *Reading "order is preserved" off an isomorphism and reusing it for a homomorphism. Order is preserved only when the kernel is trivial.*

## Scene 3. The kernel: the elements that land on the identity

*1:00 – 1:30 · objective: Define the kernel as the preimage of the identity, see it is always a subgroup, and read its size as the exact measure of the collapse.*

**1:00–1:06** — The kernel is the set of elements that land on the identity. In Z6 to Z3 by remainder, the kernel is the pair zero and three.

> Caption: The kernel is the set of elements that land on the identity. In Z6 to Z3 by remainder, the kernel is the pair zero and three.

**1:06–1:12** — The kernel is always a subgroup: it holds the identity, it is closed, and it holds inverses. Here three plus three is zero, and three is its own inverse.

> Caption: The kernel is always a subgroup: it holds the identity, it is closed, and it holds inverses. Here three plus three is zero, and three is its own inverse.

**1:12–1:18** — Its size measures the collapse. A kernel of two on a group of six means every image has exactly two preimages.

> Caption: Its size measures the collapse. A kernel of two on a group of six means every image has exactly two preimages.

**1:18–1:24** — A kernel of one element means nothing is lost. The kernel is the exact measure of how far the map is from being injective.

> Caption: A kernel of one element means nothing is lost. The kernel is the exact measure of how far the map is from being injective.

**1:24–1:30** — The kernel decides injectivity; the image does not. Image size tells you how much survived, not how much was merged.

> Caption: The kernel decides injectivity; the image does not. Image size tells you how much survived, not how much was merged.

## Scene 4. Injectivity is exactly a trivial kernel

*1:30 – 2:00 · objective: Prove both directions of the equivalence, and test it on every homomorphism between the small cyclic groups.*

**1:30–1:36** — Claim: phi is injective exactly when its kernel is the single identity. Two directions, and both are short.

> Caption: Claim: phi is injective exactly when its kernel is the single identity. Two directions, and both are short.

**1:36–1:42** — Forward: if two elements have the same image, their quotient lands on the identity, so the quotient is in the kernel.

> Caption: Forward: if two elements have the same image, their quotient lands on the identity, so the quotient is in the kernel.

**1:42–1:48** — Backward: if the kernel is trivial, phi of a equals phi of b forces a equals b. Only the identity can map to the identity.

> Caption: Backward: if the kernel is trivial, phi of a equals phi of b forces a equals b. Only the identity can map to the identity.

**1:48–1:54** — Z6 to Z3 has a kernel of two, so it is not injective: zero and three collide on zero. Z4 to Z4 by doubling has kernel zero and two.

> Caption: Z6 to Z3 has a kernel of two, so it is not injective: zero and three collide on zero. Z4 to Z4 by doubling has kernel zero and two.

**1:54–2:00** — On this page, 41 homomorphisms between small cyclic groups were tested, and injectivity matched a trivial kernel in every one.

> Caption: On this page, 41 homomorphisms between small cyclic groups were tested, and injectivity matched a trivial kernel in every one.

## Scene 5. The image, and the product of the two sizes

*2:00 – 2:30 · objective: See the image as a subgroup of the target and the identity that the size of the group is the kernel size times the image size.*

**2:00–2:06** — The image is the set of values actually hit, and it is always a subgroup of the target. Here it is all of Z3.

> Caption: The image is the set of values actually hit, and it is always a subgroup of the target. Here it is all of Z3.

**2:06–2:12** — For a finite group the sizes multiply exactly: the size of the group is the size of the kernel times the size of the image. Six is two times three.

> Caption: For a finite group the sizes multiply exactly: the size of the group is the size of the kernel times the size of the image. Six is two times three.

**2:12–2:18** — Z12 to Z4 by remainder: kernel three, image four, and twelve is three times four. So the kernel size is forced once the image is known.

> Caption: Z12 to Z4 by remainder: kernel three, image four, and twelve is three times four. So the kernel size is forced once the image is known.

**2:18–2:24** — The sign map from S3 to Z2: kernel three, image two, six is three times two. The kernel is the three rotations.

> Caption: The sign map from S3 to Z2: kernel three, image two, six is three times two. The kernel is the three rotations.

**2:24–2:30** — The image size always divides the order of the group, and the kernel size always divides it too. Both follow from the same counting.

> Caption: The image size always divides the order of the group, and the kernel size always divides it too. Both follow from the same counting.

## Scene 6. The kernel is normal, and that is a restriction

*2:30 – 3:00 · objective: Show that conjugating a kernel element lands back in the kernel, count normal subgroups in S3 and D4, and name a subgroup that can never be a kernel.*

**2:30–2:36** — The kernel is not just a subgroup. Conjugating any kernel element by any group element puts you back inside the kernel.

> Caption: The kernel is not just a subgroup. Conjugating any kernel element by any group element puts you back inside the kernel.

**2:36–2:42** — In D4, the eight symmetries of the square, there are ten subgroups and exactly six are normal. The four reflection pairs are not.

> Caption: In D4, the eight symmetries of the square, there are ten subgroups and exactly six are normal. The four reflection pairs are not.

**2:42–2:48** — In S3 there are six subgroups and three normal: the identity, the three rotations, and the whole group.

> Caption: In S3 there are six subgroups and three normal: the identity, the three rotations, and the whole group.

**2:48–2:54** — Conjugating one transposition subgroup by the rotations gives all three of them, so no single one is closed under conjugation.

> Caption: Conjugating one transposition subgroup by the rotations gives all three of them, so no single one is closed under conjugation.

**2:54–3:00** — That is the counterexample: the identity and one reflection form a subgroup of D4, and it is the kernel of no homomorphism out of D4.

> Caption: That is the counterexample: the identity and one reflection form a subgroup of D4, and it is the kernel of no homomorphism out of D4.

Exam-trap caption mode adds: *Assuming every subgroup is somebody's kernel. Only normal subgroups are, and the transposition subgroups of S3 are the standard counterexample.*

## Scene 7. Cosets, and why multiplication needs normality

*3:00 – 3:30 · objective: Build the cosets of a kernel, see coset multiplication agree on every pair of representatives, and watch it fail for a non-normal subgroup with a concrete witness.*

**3:00–3:06** — Take the cosets of the kernel: multiply the kernel by each element and collect. Here the three cosets are zero-three, one-four and two-five.

> Caption: Take the cosets of the kernel: multiply the kernel by each element and collect. Here the three cosets are zero-three, one-four and two-five.

**3:06–3:12** — Those three cosets form a group of three elements under coset multiplication, and it is the group Z3 again.

> Caption: Those three cosets form a group of three elements under coset multiplication, and it is the group Z3 again.

**3:12–3:18** — Multiplication is well defined because the kernel is normal: a different representative gives the same coset. Twelve of the 36 ordered pairs share a coset, and all agree.

> Caption: Multiplication is well defined because the kernel is normal: a different representative gives the same coset. Twelve of the 36 ordered pairs share a coset, and all agree.

**3:18–3:24** — With a non-normal subgroup it fails. In S3, take the identity and the transposition (2 3). Multiply the identity by (1 2), then the transposition by (1 2).

> Caption: With a non-normal subgroup it fails. In S3, take the identity and the transposition (2 3). Multiply the identity by (1 2), then the transposition by (1 2).

**3:24–3:30** — Same coset, different answer. That is exactly why the quotient is built on normal subgroups and not on subgroups.

> Caption: Same coset, different answer. That is exactly why the quotient is built on normal subgroups and not on subgroups.

## Scene 8. The first isomorphism theorem

*3:30 – 4:00 · objective: State that the quotient by the kernel is isomorphic to the image, and verify the induced map on four worked maps.*

**3:30–3:36** — The first isomorphism theorem: the group of cosets of the kernel is isomorphic to the image of the map.

> Caption: The first isomorphism theorem: the group of cosets of the kernel is isomorphic to the image of the map.

**3:36–3:42** — The map sends a coset to the value its elements share. It is well defined, injective, onto the image, and it preserves the operation.

> Caption: The map sends a coset to the value its elements share. It is well defined, injective, onto the image, and it preserves the operation.

**3:42–3:48** — Checked on Z6 to Z3: three cosets against three image values, and all nine coset products agree with the product in Z3.

> Caption: Checked on Z6 to Z3: three cosets against three image values, and all nine coset products agree with the product in Z3.

**3:48–3:54** — And on S3 to Z2: two cosets, the rotations and the reflections, against the two values. Six is three times two.

> Caption: And on S3 to Z2: two cosets, the rotations and the reflections, against the two values. Six is three times two.

**3:54–4:00** — This is the sentence the whole lesson builds to: every homomorphism is a quotient followed by an injective map.

> Caption: This is the sentence the whole lesson builds to: every homomorphism is a quotient followed by an injective map.

## Scene 9. Counting the homomorphisms that exist

*4:00 – 4:30 · objective: Count homomorphisms between cyclic groups by enumerating maps, see the greatest-common-divisor table, and count the onto ones.*

**4:00–4:06** — Counting: a homomorphism out of Z_m is fixed by where the element one goes, and the choice must satisfy m times k equals zero modulo n.

> Caption: Counting: a homomorphism out of Z_m is fixed by where the element one goes, and the choice must satisfy m times k equals zero modulo n.

**4:06–4:12** — The count is the greatest common divisor of m and n. For Z4 to Z4 the page enumerates 256 maps and finds four homomorphisms.

> Caption: The count is the greatest common divisor of m and n. For Z4 to Z4 the page enumerates 256 maps and finds four homomorphisms.

**4:12–4:18** — Z6 to Z3: 729 maps, three homomorphisms. The count is three, the greatest common divisor of six and three.

> Caption: Z6 to Z3: 729 maps, three homomorphisms. The count is three, the greatest common divisor of six and three.

**4:18–4:24** — Onto homomorphisms exist only when n divides m, and then there are phi of n of them. Twelve to four gives two; six to four gives none.

> Caption: Onto homomorphisms exist only when n divides m, and then there are phi of n of them. Twelve to four gives two; six to four gives none.

**4:24–4:30** — For non-cyclic groups the count is not a formula. S3 to S3 is ten, S3 to Z3 is one, and S3 to V4 is four, all by enumeration.

> Caption: For non-cyclic groups the count is not a formula. S3 to S3 is ten, S3 to Z3 is one, and S3 to V4 is four — all by enumeration.

## Scene 10. How GATE asks it, and the three traps

*4:30 – 5:00 · objective: Recognise the four question shapes and avoid the three traps: order divided not preserved, kernel normal not arbitrary, and the size product.*

**4:30–4:36** — GATE asks four shapes: is this map a homomorphism, how many are there, what is the kernel, and is it injective or onto.

> Caption: GATE asks four shapes: is this map a homomorphism, how many are there, what is the kernel, and is it injective or onto.

**4:36–4:42** — The shortcut: the order of phi of a divides the order of a. Use it to rule a candidate out in one line before checking any product.

> Caption: The shortcut: the order of phi of a divides the order of a. Use it to rule a candidate out in one line before checking any product.

**4:42–4:48** — Trap one: a homomorphism divides order, it does not preserve it. Trap two: the kernel is normal, so a non-normal subgroup is never a kernel.

> Caption: Trap one: a homomorphism divides order, it does not preserve it. Trap two: the kernel is normal, so a non-normal subgroup is never a kernel.

Exam-trap caption mode adds: *Answering "kernel equals the subgroup I was given" without checking normality. Two of the three options on such a question are usually non-normal.*

**4:48–4:54** — Trap three: the kernel size times the image size equals the group size. A pair of numbers that does not multiply out is wrong.

> Caption: Trap three: the kernel size times the image size equals the group size. A pair of numbers that does not multiply out is wrong.

**4:54–5:00** — One line to carry: the kernel measures the collapse, the image is what survives, and the quotient joins them into one theorem.

> Caption: One line to carry: the kernel measures the collapse, the image is what survives, and the quotient joins them into one theorem.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
