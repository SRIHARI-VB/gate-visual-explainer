# Sets And Set Operations — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/sets-and-set-operations/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 38 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A set is a collection, and membership is the only question

*0:00 – 0:30 · objective: State what a set is, see that order and repetition are not part of it, and read the membership symbol as the one primitive relation every other idea is built from.*

**0:00–0:07** — A set is a collection of distinct objects. The objects are its elements.

> Caption: A set is a collection of distinct objects. The objects are its elements.

**0:07–0:15** — Order and repetition are not part of a set. The set one two three and the set three one two two are the same set.

> Caption: Order and repetition are not part of a set: {1, 2, 3} and {3, 1, 2, 2} are the same set.

Exam-trap caption mode adds: *Writing an element twice does not make a larger set, and writing the elements in another order does not make a different one.*

**0:15–0:22** — Write x in A when x is an element of A, and x not in A when it is not.

> Caption: Write x in A when x is an element of A, and x not in A when it is not.

**0:22–0:30** — Roster form lists the elements. Set-builder form states the rule an element must satisfy.

> Caption: Roster form lists the elements. Set-builder form states the rule an element must satisfy.

## Scene 2. The empty set and the two symbols that look like it

*0:30 – 1:02 · objective: Separate the empty set from the set holding zero and from the set holding the empty set, using computed sizes and membership tests rather than a slogan.*

**0:30–0:37** — The empty set has no elements at all. Its size is zero.

> Caption: The empty set has no elements at all. It is written as the empty-set symbol, or as a pair of braces with nothing between them.

**0:37–0:45** — The set holding zero is not empty. It has one element, the number zero.

> Caption: The set holding zero is not empty. It has one element, the number zero.

Exam-trap caption mode adds: *This is the single most common set-theory error: writing the empty set as a set containing zero.*

**0:45–0:53** — The set holding the empty set is also not empty. Its one element is the empty set.

> Caption: The set holding the empty set is also not empty. Its one element is the empty set.

**0:53–1:02** — So the empty set and the set holding the empty set are different sets: sizes zero and one.

> Caption: So the empty set and the set holding the empty set are different sets: sizes zero and one.

Exam-trap caption mode adds: *A question that writes these two symbols interchangeably has changed the answer, not the notation.*

## Scene 3. Subset is an implication over elements

*1:02 – 1:36 · objective: Evaluate A subset of B by testing every element of the universe, see why the empty set passes automatically, and use double inclusion to prove two sets equal.*

**1:02–1:10** — A is a subset of B when every element of A is also an element of B.

> Caption: A is a subset of B when every element of A is also an element of B.

**1:10–1:18** — Read the definition as an implication: for every x, if x is in A then x is in B.

> Caption: Read the definition as an implication: for every x, if x is in A then x is in B.

Exam-trap caption mode adds: *Testing only the elements of A hides nothing here, but testing only the elements of B answers a different question.*

**1:18–1:27** — The empty set is a subset of every set, because there is no element of it that could fail the test.

> Caption: The empty set is a subset of every set, because there is no element of it that could fail the test.

**1:27–1:36** — Two sets are equal exactly when each is a subset of the other. That is the double-inclusion method.

> Caption: Two sets are equal exactly when each is a subset of the other. That is the double-inclusion method.

## Scene 4. The power set, and why its size is two to the n

*1:36 – 2:08 · objective: Enumerate every subset of a three-element set, count them as 2^n, and see that the power set of the empty set holds exactly one element.*

**1:36–1:44** — The power set of A is the set whose elements are all the subsets of A.

> Caption: The power set of A is the set whose elements are all the subsets of A.

**1:44–1:52** — If A has n elements, the power set has two to the n elements.

> Caption: If A has n elements, the power set has two to the n elements.

**1:52–2:00** — Here are all eight subsets of a three-element set, produced by enumeration in this page.

> Caption: Here are all eight subsets of a three-element set, produced by enumeration in this page.

**2:00–2:08** — The power set of the empty set holds one element, the empty set, and two to the zero is one.

> Caption: The power set of the empty set holds one element, the empty set, and two to the zero is one.

## Scene 5. Union, intersection, difference, symmetric difference, complement

*2:08 – 2:42 · objective: Compute all five operations on one concrete pair of sets and read each result off the picture rather than from memory.*

**2:08–2:16** — The union holds everything that is in A or in B, including what is in both.

> Caption: The union holds everything that is in A or in B, including what is in both.

**2:16–2:24** — The intersection holds what is in both. The difference holds what is in A and not in B.

> Caption: The intersection holds what is in both. The difference holds what is in A and not in B.

Exam-trap caption mode adds: *Set difference does not commute. A minus B and B minus A are different sets whenever the two sets differ.*

**2:24–2:32** — The complement of A is everything in the universe that is not in A.

> Caption: The complement of A is everything in the universe that is not in A.

Exam-trap caption mode adds: *A complement without a stated universe is not a set at all. Read the question for the universal set before computing anything.*

**2:32–2:42** — One concrete pair, computed five ways. The number under each result is its size.

> Caption: One concrete pair, computed five ways. The number under each result is its size.

## Scene 6. De Morgan for sets is De Morgan for logic

*2:42 – 3:14 · objective: Verify both complement laws on every pair of subsets of a three-element universe, and see the logical law that forces them.*

**2:42–2:50** — The complement of a union is the intersection of the complements.

> Caption: The complement of a union is the intersection of the complements.

**2:50–2:58** — The complement of an intersection is the union of the complements.

> Caption: The complement of an intersection is the union of the complements.

**2:58–3:06** — Both laws come from one logical law, applied element by element.

> Caption: Both laws come from one logical law, applied element by element.

**3:06–3:14** — So set identities are logical identities in disguise, and the truth table you already know settles them.

> Caption: So set identities are logical identities in disguise, and the truth table you already know settles them.

## Scene 7. Counting a union: inclusion and exclusion

*3:14 – 3:48 · objective: Derive the two-set and three-set union formulas from the double count, check both by enumeration, and read off the two inequalities they imply.*

**3:14–3:22** — Adding the two sizes counts the overlap twice, so subtract it once.

> Caption: Adding the two sizes counts the overlap twice, so subtract it once.

**3:22–3:30** — For three sets, add the three sizes, subtract the three pairwise overlaps, add the triple overlap back.

> Caption: For three sets, add the three sizes, subtract the three pairwise overlaps, add the triple overlap back.

Exam-trap caption mode adds: *Leaving out the final plus term is the standard error, and it is wrong exactly on elements that lie in all three sets.*

**3:30–3:38** — Two bounds follow at once: the union is at least as large as either set, and at most the sum of the sizes.

> Caption: Two bounds follow at once: the union is at least as large as either set, and at most the sum of the sizes.

**3:38–3:48** — The same subtraction gives the difference and the symmetric difference.

> Caption: The same subtraction gives the difference and the symmetric difference.

## Scene 8. The Cartesian product is a set of ordered pairs

*3:48 – 4:20 · objective: Build A cross B, count it as the product of the sizes, see that swapping the operands changes the set, and see why a product with the empty set is empty.*

**3:48–3:56** — The Cartesian product is the set of all ordered pairs, first coordinate from A and second from B.

> Caption: The Cartesian product is the set of all ordered pairs, first coordinate from A and second from B.

**3:56–4:04** — Its size is the product of the sizes: every first coordinate is paired with every second coordinate once.

> Caption: Its size is the product of the sizes: every first coordinate is paired with every second coordinate once.

**4:04–4:12** — Swapping the two sets changes the product whenever the sets differ.

> Caption: Swapping the two sets changes the product whenever the sets differ.

Exam-trap caption mode adds: *Equal size does not mean equal set. A question that treats A cross B and B cross A as the same set is wrong even though the sizes agree.*

**4:12–4:20** — A product with the empty set is empty: there is no second coordinate to pair anything with.

> Caption: A product with the empty set is empty: there is no second coordinate to pair anything with.

## Scene 9. Every subset is a bit string

*4:20 – 4:46 · objective: Turn each subset into a row of bits, recover 2^n from the picture, and use the same three-way choice per element to count subset pairs.*

**4:20–4:28** — Fix the universe and put its three elements in a fixed order. A subset becomes a row of three bits.

> Caption: Fix the universe and put its three elements in a fixed order. A subset becomes a row of three bits.

**4:28–4:37** — Eight rows, eight subsets. That is where two to the n comes from.

> Caption: Eight rows, eight subsets. That is where two to the n comes from.

**4:37–4:46** — The same picture counts subset pairs: each element has three choices, so there are three to the n pairs with A inside B.

> Caption: The same picture counts subset pairs: each element has three choices, so there are three to the n pairs with A inside B.

## Scene 10. The three rules to carry into the exam

*4:46 – 5:00 · objective: Consolidate membership as the primitive, the two symbols that are not the empty set, and the two counting formulas into three lines.*

**4:46–4:51** — Rule one: membership is the primitive. Subset is an implication over members.

> Caption: One: membership is the primitive. Subset is an implication over members.

**4:51–4:56** — Rule two: the empty set is not the set holding zero, and not the set holding itself.

> Caption: Two: the empty set is not the set holding zero, and not the set holding itself.

**4:56–5:00** — Rule three: the union size subtracts the overlap, and the product size multiplies the sizes.

> Caption: Three: the union size subtracts the overlap, and the product size multiplies the sizes.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
