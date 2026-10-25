# First-Order Logic — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/first-order-logic/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 41 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A predicate waits for a value

*0:00 – 0:30 · objective: Separate a proposition from a predicate, and see that a predicate becomes true or false only once its variable is given a value from the domain.*

**0:00–0:07** — A proposition has a truth value. A predicate does not, until its variable is given one.

> Caption: A proposition has a truth value. A predicate does not — until its variable is given one.

Exam-trap caption mode adds: *A predicate is not a proposition. It becomes one only after a value or a quantifier is supplied.*

**0:07–0:15** — Write P of x for x is greater than five. Then P of two is false, P of seven is true, P of nine is true.

> Caption: Write P(x) for "x is greater than 5". Then P(2) is false, P(7) is true, P(9) is true.

**0:15–0:22** — The domain is the set of values the variable may take. It is part of the meaning.

> Caption: The domain is the set of values the variable may take. It is part of the meaning.

**0:22–0:30** — Bind the variable with a quantifier and the predicate is a proposition again.

> Caption: Bind the variable with a quantifier and the predicate is a proposition again.

## Scene 2. The universal quantifier is a big AND

*0:30 – 1:02 · objective: Evaluate for-all over a finite domain as a conjunction, and see why one false case refutes it while the empty domain makes it vacuously true.*

**0:30–0:37** — For all x, P of x, written with an upside-down A, means every element of the domain satisfies P.

> Caption: For all x, P(x) — written with an upside-down A — means every element of the domain satisfies P.

**0:37–0:45** — Over a finite domain it is just a conjunction: P of a and P of b and P of c.

> Caption: Over a finite domain it is just a conjunction: P(a) and P(b) and P(c).

**0:45–0:53** — One false case refutes it. Here P of b is false, so for-all is false.

> Caption: One false case refutes it. Here P(b) is false, so for-all is false.

Exam-trap caption mode adds: *A single counterexample refutes a for-all claim completely; no number of agreeing elements can establish one.*

**0:53–1:02** — On the empty domain there is nothing to check, so for-all is vacuously true.

> Caption: On the empty domain there is nothing to check, so for-all is vacuously true.

Exam-trap caption mode adds: *For-all over an empty domain is TRUE; there-exists over an empty domain is FALSE. The two quantifiers differ at exactly this boundary.*

## Scene 3. The existential quantifier is a big OR

*1:02 – 1:34 · objective: Evaluate there-exists over a finite domain as a disjunction, name the witness, and note the asymmetry with for-all on the empty domain.*

**1:02–1:09** — There exists x with P of x, written with a backwards E, means at least one element satisfies P.

> Caption: There exists x with P(x) — written with a backwards E — means at least one element satisfies P.

**1:09–1:17** — Over a finite domain it is a disjunction: P of a or P of b or P of c.

> Caption: Over a finite domain it is a disjunction: P(a) or P(b) or P(c).

**1:17–1:25** — One true case is enough. That element is called a witness.

> Caption: One true case is enough. That element is called a witness.

**1:25–1:34** — On the empty domain there is no witness, so there-exists is false.

> Caption: On the empty domain there is no witness, so there-exists is false.

Exam-trap caption mode adds: *for-all x P(x) implies there-exists x P(x) is NOT valid on the empty domain. It is valid as soon as the domain is non-empty.*

## Scene 4. The domain decides the truth value

*1:34 – 2:04 · objective: Show the same formula evaluated over two different domains, computed both times, and state why an unstated domain makes a question incomplete.*

**1:34–1:41** — Truth in first-order logic is always relative to a domain and an interpretation.

> Caption: Truth in first-order logic is always relative to a domain and an interpretation.

**1:41–1:49** — Take: there exists x such that x is even and x is prime. On the domain two, four, six it is true.

> Caption: Take: there exists x such that x is even and x is prime. On {2,4,6} it is true.

**1:49–1:57** — The same formula on nine, fifteen, twenty-one is false: every element fails the first predicate.

> Caption: The same formula on {9,15,21} is false: every element fails the first predicate.

Exam-trap caption mode adds: *A question that never states the domain is incomplete. Read the domain line before evaluating anything.*

**1:57–2:04** — So a quantified formula is never true on its own. The model comes first.

> Caption: So a quantified formula is never true on its own — the model comes first.

## Scene 5. NOT flips the quantifier

*2:04 – 2:40 · objective: Derive and verify both quantifier negation laws, then apply them to the "not all that glitters is gold" pattern.*

**2:04–2:11** — Put not in front of a quantifier and the quantifier flips.

> Caption: Put NOT in front of a quantifier and the quantifier flips.

**2:11–2:19** — Not for all x P of x means some x fails P.

> Caption: NOT for-all is there-exists NOT: not (for all x, P(x)) means some x fails P.

**2:19–2:27** — Not there exists x P of x means every x lacks P.

> Caption: NOT there-exists is for-all NOT: no x has P means every x lacks P.

**2:27–2:34** — Not all that glitters is gold becomes: some x glitters and is not gold.

> Caption: "Not all that glitters is gold" becomes: some x glitters and is not gold.

Exam-trap caption mode adds: *"Not all that glitters is gold" is NOT "all that glitters is not gold". The first is one counterexample; the second is a universal claim.*

**2:34–2:40** — Both laws hold on every model. They are equivalences, not rules of thumb.

> Caption: Both laws hold on every model — they are equivalences, not rules of thumb.

## Scene 6. Order matters when the quantifiers differ

*2:40 – 3:22 · objective: Read for-all-there-exists and there-exists-for-all off one relation grid, and exhibit a model where the first is true and the second false.*

**2:40–2:47** — Two variables, two quantifiers. Now the order is part of the meaning.

> Caption: Two variables, two quantifiers — now the order is part of the meaning.

**2:47–2:56** — For all x there exists y: each row needs some filled cell, and y may differ per row.

> Caption: For all x there exists y: each row needs some filled cell, and y may differ per row.

**2:56–3:06** — There exists y for all x: one single column must be filled all the way down.

> Caption: There exists y for all x: one single column must be filled all the way down.

**3:06–3:14** — Here the first is true and the second false: the three witnesses are all different.

> Caption: Here the first is true and the second false: the three witnesses are all different.

**3:14–3:22** — So for all x there exists y does not imply there exists y for all x.

> Caption: So for-all-there-exists does not imply there-exists-for-all.

Exam-trap caption mode adds: *Reading "for every x there is a y" as "there is a y for every x" is the single most common quantifier error in GATE translations.*

## Scene 7. Same-kind swap is free, mixed swap is not

*3:22 – 3:48 · objective: Verify that quantifiers of the same kind commute, and that the mixed pair only implies in one direction, with the model counts that show it.*

**3:22–3:29** — Two quantifiers of the same kind may be swapped freely.

> Caption: Two quantifiers of the same kind may be swapped freely.

**3:29–3:36** — For all x for all y equals for all y for all x, and the same for there exists.

> Caption: for-all x for-all y equals for-all y for-all x, and the same for there-exists.

**3:36–3:42** — The mixed pair implies one way only: there exists y for all x implies for all x there exists y.

> Caption: The mixed pair implies one way only: there-exists-for-all implies for-all-there-exists.

**3:42–3:48** — Of the 512 relations on three elements, 169 satisfy there exists y for all x, and 343 satisfy for all x there exists y.

> Caption: Of the 512 relations on three elements, 169 satisfy there-exists-for-all and 343 satisfy for-all-there-exists.

## Scene 8. Implication for ALL, conjunction for SOME

*3:48 – 4:26 · objective: Translate restricted English sentences into the correct shape and compute what the two swapped shapes do on the same domain.*

**3:48–3:55** — Every restricted English sentence has one right shape.

> Caption: Every restricted English sentence has one right shape.

**3:55–4:03** — For all, restrict with an implication: for all x, student implies studies.

> Caption: For ALL, restrict with an implication: for all x, student implies studies.

**4:03–4:11** — For some, restrict with a conjunction: there exists x who is a student and studies.

> Caption: For SOME, restrict with a conjunction: there exists x who is a student and studies.

**4:11–4:19** — Swap them and both sentences break on the same domain.

> Caption: Swap them and both sentences break on the same domain.

Exam-trap caption mode adds: *Under for-all, a conjunction is too strong; under there-exists, an implication is too weak. Both errors are marked wrong, and both are common.*

**4:19–4:26** — The four verdicts on this one domain are computed, not assumed.

> Caption: The four verdicts on this one domain are computed, not assumed.

## Scene 9. Free, bound, and what a sentence is

*4:26 – 4:48 · objective: Find the free variables of a formula mechanically, and state what it means for a formula to be a sentence.*

**4:26–4:33** — A quantifier binds its variable inside its scope only.

> Caption: A quantifier binds its variable inside its scope only.

**4:33–4:40** — In for all x, P of x and Q of y, x is bound and y is free.

> Caption: In for-all x (P(x) and Q(y)), x is bound and y is free.

**4:40–4:48** — No free variables means a sentence: it has a truth value in a model.

> Caption: No free variables means a sentence — it has a truth value in a model.

## Scene 10. The three rules to carry into the exam

*4:48 – 5:00 · objective: Consolidate the quantifier-as-loop picture, the negation law and the order restriction into three lines.*

**4:48–4:53** — Rule one: for all is a big AND, there exists is a big OR.

> Caption: One: for-all is a big AND, there-exists is a big OR.

**4:53–4:57** — Rule two: not flips the quantifier and negates the body.

> Caption: Two: NOT flips the quantifier and negates the body.

**4:57–5:00** — Rule three: mixed order is not swappable. Only there exists y for all x implies for all x there exists y.

> Caption: Three: mixed order is not swappable — only there-exists-for-all implies for-all-there-exists.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
