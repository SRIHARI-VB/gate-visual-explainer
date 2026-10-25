# Functions and Their Properties — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/functions-and-their-properties/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 39 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A function is a relation with two promises

*0:00 – 0:30 · objective: See a function from A to B as a relation on A times B that is total and single-valued, and count the functions among the relations.*

**0:00–0:07** — A relation from A to B is any set of arrows. A function is the special case where every element of A has exactly one arrow.

> Caption: A relation from A to B is any set of arrows. A function is the special case where every element of A has exactly one arrow.

**0:07–0:14** — With two elements in A and three in B there are six possible arrows, so 64 relations, and only 9 of them are functions.

> Caption: With two elements in A and three in B there are six possible arrows, so 64 relations — and only 9 of them are functions.

**0:14–0:22** — Promise one: total. No element of the domain is left without an image.

> Caption: Promise one: total. No element of the domain is left without an image.

Exam-trap caption mode adds: *Every function is a relation, but almost no relation is a function. A question that says "let R be a relation" and later assumes R is a function has changed the subject.*

**0:22–0:30** — Promise two: single-valued. No element of the domain gets two images. A relation missing either promise is not a function.

> Caption: Promise two: single-valued. No element of the domain gets two images. A relation missing either promise is not a function.

## Scene 2. Domain, codomain, range: three sets, not two

*0:30 – 0:58 · objective: Separate the codomain, which is declared, from the range, which is computed, and see that they differ exactly when the function is not onto.*

**0:30–0:38** — f from A to B. A is the domain, B is the codomain, and the set of values actually taken is the range.

> Caption: f from A to B. A is the domain, B is the codomain, and the set of values actually taken is the range.

**0:38–0:46** — Here the range is a and c, smaller than the codomain a, b, c, d. The two are equal exactly when f is onto.

> Caption: Here the range is a and c, smaller than the codomain a, b, c, d. The two are equal exactly when f is onto.

Exam-trap caption mode adds: *The codomain is not a fact you can read off the arrows. It is declared by the notation f : A to B, and two functions with identical arrows but different declared codomains are different functions.*

**0:46–0:52** — The codomain is a promise about where values are allowed to live; the range is a fact about where they landed.

> Caption: The codomain is a promise about where values are allowed to live; the range is a fact about where they landed.

**0:52–0:58** — Every element of the domain has an image, so the range is never empty when the domain is not.

> Caption: Every element of the domain has an image, so the range is never empty when the domain is not.

## Scene 3. Injective means no two elements share an image

*0:58 – 1:30 · objective: Test injectivity by looking for a colliding pair, read it off the matrix by columns, and see why m greater than n forces the count to zero.*

**0:58–1:06** — Injective, or one-to-one, means no two different elements of the domain share an image.

> Caption: Injective, or one-to-one, means no two different elements of the domain share an image.

Exam-trap caption mode adds: *One-to-one in GATE means injective. A one-to-one correspondence means bijective. The two phrases are not interchangeable, and the papers use both.*

**1:06–1:14** — Read the matrix down each column: at most one 1 per column. Here column a has two, so f is not injective.

> Caption: Read the matrix down each column: at most one 1 per column. Here column a has two, so f is not injective.

**1:14–1:22** — The witness is a pair: f of 1 equals f of 2 equals a with 1 different from 2. One colliding pair is enough.

> Caption: The witness is a pair: f(1) equals f(2) equals a with 1 different from 2. One colliding pair is enough.

**1:22–1:30** — Consequence: an injection needs at least as many elements in B as in A. If m exceeds n, the number of injections is zero.

> Caption: Consequence: an injection needs at least as many elements in B as in A. If m exceeds n, the number of injections is zero.

Exam-trap caption mode adds: *The pigeonhole bound is about the sizes of the two sets, not about the arrows you happen to draw. No amount of cleverness produces an injection from a larger set into a smaller one.*

## Scene 4. Surjective means every codomain element is hit

*1:30 – 2:02 · objective: Test surjectivity by hunting for an uncovered codomain element, and count onto functions by inclusion and exclusion.*

**1:30–1:38** — Surjective, or onto, means every element of the codomain is hit at least once.

> Caption: Surjective, or onto, means every element of the codomain is hit at least once.

**1:38–1:46** — Read the matrix down each column again: at least one 1 per column. Here column c is empty, so f is not onto.

> Caption: Read the matrix down each column again: at least one 1 per column. Here column c is empty, so f is not onto.

**1:46–1:54** — Consequence: an onto function needs at least as many domain elements as codomain elements.

> Caption: Consequence: an onto function needs at least as many domain elements as codomain elements.

**1:54–2:02** — Counting onto functions needs inclusion and exclusion: three to the four minus three times two to the four plus three times one to the four, which is 81 minus 48 plus 3, that is 36.

> Caption: Counting onto functions needs inclusion and exclusion: 3 to the 4 minus 3 times 2 to the 4 plus 3 times 1 to the 4, which is 81 minus 48 plus 3, that is 36.

Exam-trap caption mode adds: *Subtracting only the three functions that miss one element each gives 81 minus 48 equals 33, which is wrong. The add-back term is not optional.*

## Scene 5. On equal finite sizes the three properties collapse

*2:02 – 2:30 · objective: See that for finite A and B of the same size, injective, surjective and bijective are the same condition, and that the collapse needs finiteness.*

**2:02–2:10** — Bijective means injective and surjective at once: every codomain element is hit exactly once.

> Caption: Bijective means injective and surjective at once: every codomain element is hit exactly once.

**2:10–2:18** — On finite sets of the same size the three properties collapse: injective, surjective and bijective are the same condition.

> Caption: On finite sets of the same size the three properties collapse: injective, surjective and bijective are the same condition.

Exam-trap caption mode adds: *The collapse is a theorem about finite sets of equal size. It is not a definition, and it does not hold when the sizes differ or when the sets are infinite.*

**2:18–2:24** — Of the 27 functions from a three-element set to itself, 6 are injective, 6 are surjective, and they are the same 6.

> Caption: Of the 27 functions from a three-element set to itself, 6 are injective, 6 are surjective, and they are the same 6.

**2:24–2:30** — The collapse needs finiteness. On the natural numbers, n maps to n plus 1 is injective and not surjective.

> Caption: The collapse needs finiteness. On the natural numbers, n maps to n plus 1 is injective and not surjective.

Exam-trap caption mode adds: *A question that concludes "injective therefore surjective" without the equal-size hypothesis is invalid. It is the single most common error in this topic.*

## Scene 6. Four counts, and only one of them is a product

*2:30 – 3:00 · objective: Collect the counting formulas for functions, injections, surjections and bijections, and check every figure against enumeration.*

**2:30–2:38** — Four counts, one per row: all functions, injections, surjections, bijections.

> Caption: Four counts, one per row: all functions, injections, surjections, bijections.

**2:38–2:46** — All functions: n to the m, because each of the m domain elements picks one of n targets independently.

> Caption: All functions: n to the m, because each of the m domain elements picks one of n targets independently.

Exam-trap caption mode adds: *m to the n and n to the m are different numbers and different questions. The exponent is always the number of things that make a free choice, which here is the domain.*

**2:46–2:53** — Injections: n falling m, that is n factorial over n minus m factorial, and zero as soon as m exceeds n. Bijections: n factorial when m equals n.

> Caption: Injections: n falling m, that is n factorial over n minus m factorial, and zero as soon as m exceeds n. Bijections: n factorial when m equals n.

**2:53–3:00** — Surjections have no product formula. Inclusion and exclusion is the method, and this page checks every figure by enumeration.

> Caption: Surjections have no product formula. Inclusion and exclusion is the method, and this page checks every figure by enumeration.

Exam-trap caption mode adds: *A common wrong answer multiplies n factorial by C of m comma n, which counts onto functions only when m equals n. For m equal to 4 and n equal to 3 that method gives 18 against the correct 36.*

## Scene 7. Composition: what survives, and only in one direction

*3:00 – 3:34 · objective: Compose two functions, see that order matters, and learn which properties of the composite force which properties of the parts.*

**3:00–3:08** — Compose g from A to B with f from B to C. The composite f after g sends a to f of g of a, and the order matters.

> Caption: Compose g from A to B with f from B to C. The composite f after g sends a to f of g of a, and the order matters.

**3:08–3:16** — Injective after injective is injective, and surjective after surjective is surjective.

> Caption: Injective after injective is injective, and surjective after surjective is surjective.

**3:16–3:24** — Only one direction survives. If the composite is injective then the inner function g is injective, but the outer function f need not be.

> Caption: Only one direction survives. If the composite is injective then the inner function g is injective, but the outer function f need not be.

Exam-trap caption mode adds: *The tempting wrong claim is that the composite being injective makes both parts injective. Only the inner one is forced.*

**3:24–3:34** — If the composite is onto then the outer function f is onto, but the inner function g need not be, even when f is also onto.

> Caption: If the composite is onto then the outer function f is onto, but the inner function g need not be, even when f is also onto. That is the shape of the GATE 2025 question.

Exam-trap caption mode adds: *The false step is assuming that the composite being onto, together with f being onto, forces g to be onto. It does not; a single-element C refutes it.*

## Scene 8. The inverse function exists only for a bijection

*3:34 – 4:00 · objective: Distinguish the inverse function from the preimage of a set, and see why a function that is not injective has no inverse.*

**3:34–3:42** — An inverse function exists exactly when f is bijective. Then f inverse after f is the identity on A, and f after f inverse is the identity on B.

> Caption: An inverse function exists exactly when f is bijective. Then f inverse after f is the identity on A, and f after f inverse is the identity on B.

**3:42–3:50** — The preimage of a set is always defined, bijection or not. The inverse function is the stricter object.

> Caption: The preimage of a set is always defined, bijection or not. The inverse function is the stricter object.

Exam-trap caption mode adds: *Writing f inverse of y as though it were always an element is the trap. For a function that is not injective the preimage of y may hold several elements, or none.*

**3:50–4:00** — Squaring on the reals is not injective, so it has no inverse on the reals. Restricted to the non-negative reals it becomes a bijection and gains one.

> Caption: Squaring on the reals is not injective, so it has no inverse on the reals. Restricted to the non-negative reals it becomes a bijection and gains one.

## Scene 9. Images and preimages behave differently

*4:00 – 4:32 · objective: Prove that images commute with union but only half-commute with intersection, while preimages commute with union, intersection and complement.*

**4:00–4:08** — For subsets S and T of the domain, the image of the union is the union of the images. Always.

> Caption: For subsets S and T of the domain, the image of the union is the union of the images. Always.

**4:08–4:16** — For intersections only one inclusion survives: the image of the intersection sits inside the intersection of the images.

> Caption: For intersections only one inclusion survives: the image of the intersection sits inside the intersection of the images.

Exam-trap caption mode adds: *Writing f of S intersect T equals f of S intersect f of T is the classic error. It is true for preimages and false for images.*

**4:16–4:24** — Here 1 and 3 both map to p, so the image of the intersection is q while the intersection of the images is p and q. Equality holds exactly when f is injective.

> Caption: Here 1 and 3 both map to p, so the image of the intersection is the single element q while the intersection of the images is p and q. Equality holds exactly when f is injective.

**4:24–4:32** — Preimages are better behaved: the preimage of an intersection is the intersection of the preimages, for every function.

> Caption: Preimages are better behaved: the preimage of an intersection is the intersection of the preimages, for every function. That is GATE 2014 Set 3.

## Scene 10. Four rules to carry into the exam

*4:32 – 5:00 · objective: Consolidate the tests and the traps into four rules that cover the function questions in the papers.*

**4:32–4:40** — Rule one: total and single-valued. Check the domain first, because a relation that misses an element is not a function.

> Caption: One: total and single-valued. Check the domain first, because a relation that misses an element is not a function.

**4:40–4:48** — Rule two: read the matrix by columns. Two ones in a column kills injectivity, and an empty column kills surjectivity.

> Caption: Two: read the matrix by columns. Two ones in a column kills injectivity, and an empty column kills surjectivity.

**4:48–4:54** — Rule three: on finite sets of equal size, injective, surjective and bijective are one property. Without that hypothesis they are three.

> Caption: Three: on finite sets of equal size, injective, surjective and bijective are one property. Without that hypothesis they are three.

Exam-trap caption mode adds: *Concluding surjective from injective on sets of different sizes is wrong in one direction and impossible in the other. Always state the two sizes before using the collapse.*

**4:54–5:00** — Rule four: images commute with union only, while preimages commute with union, intersection and complement.

> Caption: Four: images commute with union only, while preimages commute with union, intersection and complement.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
