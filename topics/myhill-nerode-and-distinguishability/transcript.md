# Myhill–Nerode and Distinguishability: The Classes That Are the States — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/myhill-nerode-and-distinguishability/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Two strings belong to one state when no future tells them apart

*0:00 – 0:30 · objective: Define the relation "x is equivalent to y" as agreement on every possible ending, and name the four properties that make the classes usable as states.*

**0:00–0:07** — A state is what the machine remembers. After a it remembers one odd a. After a a it remembers none.

> Caption: A state is what the machine remembers. After a it remembers one odd a; after aa it remembers none.

Exam-trap caption mode adds: *A state is not the string read so far. Many strings reach one state, and the machine cannot tell them apart afterwards.*

**0:07–0:15** — So ask the question the machine cannot ask. Is there any ending that treats these two strings differently?

> Caption: So ask the question the machine cannot ask: does any ending z treat these two strings differently?

Exam-trap caption mode adds: *The ending may be empty. A string in the language and a string outside it are separated by the empty ending, before any letter is read.*

**0:15–0:22** — X is equivalent to y when, for every ending z, x z is in the language exactly when y z is in the language.

> Caption: x is equivalent to y when, for every ending z, xz is in L exactly when yz is in L.

Exam-trap caption mode adds: *One ending that disagrees is enough to separate two strings. Agreement on many endings proves nothing unless the argument covers all of them.*

**0:22–0:30** — It is an equivalence relation, and it is right-invariant: if x is equivalent to y then x a is equivalent to y a. That second property is what makes classes into states.

> Caption: It is an equivalence relation, and it is right-invariant: x ≈ y implies xa ≈ ya. That second property is what makes classes into states.

Exam-trap caption mode adds: *An arbitrary partition of the strings is not a set of states. Without right-invariance there is no transition function to define.*

## Scene 2. The signature of a string: the endings that complete it

*0:30 – 1:00 · objective: Read a string’s signature as the set of endings that carry it into the language, and see that two strings are equivalent exactly when the signatures match.*

**0:30–0:37** — The signature of x is the set of endings z with x z in the language. Two strings are equivalent exactly when their signatures are equal.

> Caption: The signature of x is the set of endings z with xz in L. Two strings are equivalent exactly when their signatures are equal.

Exam-trap caption mode adds: *The signature is not the set of prefixes. It records what can still happen, not what has already happened.*

**0:37–0:45** — Over endings of length at most two, a accepts only a, and b accepts only b. The two signatures already differ.

> Caption: Endings of length at most two: a accepts only a, and b accepts only b. The two signatures already differ.

**0:45–0:52** — The empty string accepts the empty ending, a a and b b. The string a b accepts a b and b a. Four signatures, four classes.

> Caption: The empty string accepts the empty ending, aa and bb. The string ab accepts ab and ba. Four signatures, four classes.

**0:52–1:00** — A machine with n states is settled by endings shorter than n, so a bound of two already decides this four-state language.

> Caption: A machine with n states is settled by endings shorter than n, so a bound of two already decides this four-state language.

Exam-trap caption mode adds: *Enumerating endings up to some length proves equality of signatures only up to that length, unless the bound is justified by the state count.*

## Scene 3. Even a’s and even b’s: exactly four classes, and they are the four states

*1:00 – 1:30 · objective: Compute the classes of one small language, check that each class is wholly inside or wholly outside the language, and match the classes to the states of the machine that recognises it.*

**1:00–1:07** — Four classes: the empty string, a, b, and a b. Every other string joins one of them.

> Caption: Four classes for even a’s and even b’s: the empty string, a, b, and ab. Every other string joins one of them.

**1:07–1:15** — Each class is wholly inside or wholly outside the language, never both. The empty string’s class is inside; the class of a is outside.

> Caption: Each class is wholly inside or wholly outside L, never both. The empty string’s class is inside; the class of a is outside.

Exam-trap caption mode adds: *Grouping strings by "both in L" or "both outside L" gives a partition too, but it is not this one, and it is not right-invariant.*

**1:15–1:22** — Name the classes by what they remember: even even, odd even, even odd, odd odd. The names are the four states.

> Caption: Name the classes by what they remember: even-even, odd-even, even-odd, odd-odd. The names are the four states.

**1:22–1:30** — The index of a language is its number of classes. Here the index is four, and the four state machine has four states.

> Caption: The index of a language is its number of classes. Here the index is four, and the four-state machine has four states.

Exam-trap caption mode adds: *The index is a property of the language. Two different machines for one language can have different sizes; the index is the smallest possible size.*

## Scene 4. Finite index builds a machine, and a machine gives finite index

*1:30 – 2:00 · objective: Both directions of the theorem: the classes become states of a machine, and the states of any machine divide the strings into finitely many classes.*

**1:30–1:37** — If the index is finite, the classes are the states of a machine. The start class is the class of the empty string.

> Caption: If the index is finite, the classes are the states of a machine. The start class is the class of the empty string.

**1:37–1:45** — The transition is the only one available: reading a in the class of x lands in the class of x a. Right invariance makes it well defined.

> Caption: The transition is the only one available: reading a in the class of x lands in the class of xa. Right-invariance makes it well defined.

Exam-trap caption mode adds: *Without right-invariance this transition would be ambiguous, and the construction would fail. That is the one property that is not automatic.*

**1:45–1:52** — A class is accepting when its members are in the language. The four classes give four states, and the model checks the machine on every string up to length seven.

> Caption: A class is accepting when its members are in L. The four classes give four states, and the model checks the machine on every string up to length seven.

**1:52–2:00** — The other direction: any machine with n states gives at most n classes, because each state has one right language. Two strings reaching the same state are equivalent.

> Caption: The other direction: any machine with n states gives at most n classes, because each state has one right language.

Exam-trap caption mode adds: *Two strings reaching different states may still be equivalent, which is why a machine can be larger than the index but never smaller.*

## Scene 5. So the smallest machine is unique, and its size is the index

*2:00 – 2:30 · objective: See why no machine can have fewer states than the index, why the machine built from the classes has exactly that many, and what "unique" does and does not mean.*

**2:00–2:07** — Every machine for the language needs at least as many states as the index. That is the lower bound, and it is exact.

> Caption: Every machine for L needs at least as many states as the index. That is the lower bound, and it is exact.

Exam-trap caption mode adds: *The bound is on deterministic machines. A non-deterministic machine can be smaller than the index, and often is.*

**2:07–2:15** — The machine built from the classes has exactly that many, so the smallest machine is the quotient, up to renaming states.

> Caption: The machine built from the classes has exactly that many, so the smallest machine is the quotient, up to renaming states.

Exam-trap caption mode adds: *"Unique" does not mean the drawing is unique. The same machine can be drawn with the states in any positions and with any names.*

**2:15–2:22** — Three languages, three indexes: four for the parity language, three for binary value divisible by three, and three for ending in zero one.

> Caption: Three languages, three indexes: four for the parity language, three for binary value divisible by three, three for ending in 01.

**2:22–2:30** — So a question that asks for the minimum number of states is asking for an index, and the answer is an exact count rather than a drawing.

> Caption: So a question that asks for the minimum number of states is asking for an index, and the answer is an exact count rather than a drawing.

Exam-trap caption mode adds: *Drawing a machine that works and counting its states answers a different question. Without the classes, nothing rules out a smaller machine.*

## Scene 6. Counting states without drawing the machine

*2:30 – 3:00 · objective: Answer a state-count question by naming the invariant each class records: two remainders give six classes, and a divisibility language gives n + 1 rather than n.*

**2:30–2:37** — GATE C S E 1997 question twenty asks for the minimum number of states for strings where the number of a’s is divisible by two and the number of b’s is divisible by three.

> Caption: GATE CSE 1997 Q20: the number of a’s divisible by two and the number of b’s divisible by three.

**2:37–2:45** — Each class records one remainder for a and one for b: two times three is six classes, so six states.

> Caption: Each class records one remainder for a and one for b: two times three is six classes, so six states.

Exam-trap caption mode adds: *Multiplying is right only because the two conditions are independent. Two conditions that interact do not multiply.*

**2:45–2:52** — GATE C S E 2011 question forty two: a to the n k with k greater than zero. For n equal to three the index is four, not three.

> Caption: GATE CSE 2011 Q42: a to the n k with k greater than zero. For n equal to three the index is four, not three.

Exam-trap caption mode adds: *The condition k greater than zero removes the empty string, and that costs one extra state. Reading it as k at least zero gives n instead of n plus one.*

**2:52–3:00** — The procedure: name the invariant a class remembers, count the values it can take, and check that every value is reachable.

> Caption: The procedure: name the invariant a class remembers, count the values it can take, and check that every value is reachable.

Exam-trap caption mode adds: *A count without a reachability argument gives an upper bound. A machine with that many states is not automatically the smallest.*

## Scene 7. aⁿ bⁿ: the classes never merge

*3:00 – 3:30 · objective: Prove a language is not regular by exhibiting infinitely many pairwise distinguishable strings, which is a positive proof rather than a failed attempt at one.*

**3:00–3:07** — For a to the n b to the n, the strings a, a a, a a a are pairwise distinguishable: b to the i separates a to the i from every longer run.

> Caption: For a to the n b to the n, the strings a, aa, aaa are pairwise distinguishable: b to the i separates a to the i from every longer run.

Exam-trap caption mode adds: *The separating ending depends on the pair. There is no single ending that separates all of them, and none is needed.*

**3:07–3:15** — So every a to the i is in a class of its own, and there are infinitely many of them. The index is infinite.

> Caption: So every a to the i is in a class of its own, and there are infinitely many of them. The index is infinite.

**3:15–3:22** — The model counts the classes among a to the nought up to a to the M as M grows, and the count keeps rising.

> Caption: The model counts the classes among a to the nought up to a to the M as M grows: the count keeps rising.

Exam-trap caption mode adds: *A rising count is evidence, not proof. The proof is the separation witness, one ending per pair, which covers every pair at once.*

**3:22–3:30** — This is a positive proof of non regularity: exhibit the classes, and the impossibility of a finite machine follows.

> Caption: This is a positive proof of non-regularity: exhibit the classes, and the impossibility of a finite machine follows.

Exam-trap caption mode adds: *Saying "I could not find a machine" is not a proof. The classes are the proof.*

## Scene 8. The pumping lemma’s converse fails, and this theorem shows why

*3:30 – 4:00 · objective: Meet a language that satisfies the pumping lemma and is still not regular, and separate the two tests: one is necessary, the other is exact.*

**3:30–3:37** — Here is a language that satisfies the pumping lemma: a to the i, b to the j, c to the k, with j equal to k whenever i is one.

> Caption: A language that satisfies the pumping lemma: a to the i b to the j c to the k, with j equal to k whenever i is one.

**3:37–3:45** — With pumping length two, every string up to length nine can be pumped: the model finds no counterexample at all.

> Caption: With pumping length two, every string up to length nine can be pumped: the model finds no counterexample at all.

Exam-trap caption mode adds: *The pumping length is not given to you in an exam question. You have to exhibit one, and a wrong choice looks like a failed proof.*

**3:45–3:52** — And it is still not regular: its intersection with a b star c star is exactly a b to the j c to the j, which has infinite index.

> Caption: And it is still not regular: its intersection with a b-star c-star is exactly a b to the j c to the j, which has infinite index.

Exam-trap caption mode adds: *Intersection is the useful operation here because the regular language is what pins the shape. Closure under intersection is a verified property of regular languages, not an assumption.*

**3:52–4:00** — So the pumping lemma is necessary and not sufficient. Distinguishability is both, and that is the difference between the two tests.

> Caption: So the pumping lemma is necessary and not sufficient. Distinguishability is both, and that is the difference between the two tests.

Exam-trap caption mode adds: *A language that satisfies the pumping lemma is not thereby regular. Writing that conclusion is the error this scene exists to prevent.*

## Scene 9. Three things that look alike, and are not

*4:00 – 4:30 · objective: Tell distinguishability from table-filling state equivalence from "the two states have the same outgoing letters", and say which of the three is the definition.*

**4:00–4:07** — Distinguishability is defined on strings and needs no machine. State equivalence is defined on the states of one machine.

> Caption: Distinguishability is defined on strings and needs no machine. State equivalence is defined on the states of one machine.

**4:07–4:15** — On a machine, table filling computes state equivalence in a finite number of rounds. Its classes are the right languages of the states.

> Caption: On a machine, table filling computes state equivalence in a finite number of rounds. Its classes are the right languages of the states.

Exam-trap caption mode adds: *Table filling can only shrink a machine you already have. It cannot tell you that a machine with fewer states exists, and it says nothing about a language with no machine.*

**4:15–4:22** — And the same outgoing letters is not equivalence: two states can share every label and accept different endings.

> Caption: And "the same outgoing letters" is not equivalence: two states can share every label and accept different endings.

Exam-trap caption mode adds: *Comparing transition tables row by row is a common shortcut that fails on the first machine where an accepting and a non-accepting state look alike.*

**4:22–4:30** — The minimal deterministic machine is unique. The minimal non deterministic one is not: several smallest machines can accept the same language.

> Caption: The minimal deterministic machine is unique. The minimal non-deterministic one is not: several smallest machines can accept the same language.

Exam-trap caption mode adds: *Quoting uniqueness in a question about non-deterministic machines is wrong, and questions that mention NFA are testing exactly that.*

## Scene 10. What this theorem decides, and what it does not

*4:30 – 5:00 · objective: State the exact question the theorem answers, the two it does not, and the reason the index can be far larger than any machine you would want to draw.*

**4:30–4:37** — What the theorem answers: the minimum number of states, exactly, and whether a language is regular at all.

> Caption: What the theorem answers: the minimum number of states, exactly, and whether a language is regular at all.

**4:37–4:45** — What it does not answer: it does not build a small machine for you, and it gives no bound on how large the index is.

> Caption: What it does not answer: it does not build a small machine for you, and it gives no bound on how large the index is.

Exam-trap caption mode adds: *A small description of a language says nothing about the size of its smallest machine.*

**4:45–4:52** — Four indexes from this page: four for parity, three for divisibility by three, three for ending in zero one, eight for the third symbol from the end.

> Caption: Four indexes from this page: four for parity, three for divisibility by three, three for ending in 01, eight for the third symbol from the end.

**4:52–5:00** — One sentence to keep: the states of the smallest machine are the classes of strings that no ending can tell apart.

> Caption: One sentence to keep: the states of the smallest machine are the classes of strings that no ending can tell apart.

Exam-trap caption mode adds: *Remembering the sentence without the right-invariance clause leaves out the only part that has to be proved.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
