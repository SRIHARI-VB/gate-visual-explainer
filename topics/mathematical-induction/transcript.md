# Mathematical Induction — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/mathematical-induction/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Two facts, infinitely many statements

*0:00 – 0:30 · objective: See what induction buys: one base case plus one implication settles infinitely many separate statements, and the implication is the only part that needs thought.*

**0:00–0:07** — Induction is the domino picture, taken seriously. You do not verify forty statements one by one. You push the first, and you check that any toppled domino topples the next. Those two facts settle all forty.

> Caption: Forty dominoes, one push. You do not push forty times: you push once and check that each one topples the next.

**0:07–0:15** — The statements in a GATE question are usually infinitely many. P of one, P of two, P of three, and no largest. You cannot check them all, and checking the first ten proves nothing about the eleventh.

> Caption: The statements here are infinitely many: P of one, P of two, P of three, with no last one to check.

**0:15–0:22** — So the work moves out of the base and into the link. One implication, from the statement at n to the same statement at n plus one, done once for an arbitrary n, is what replaces the infinite check.

> Caption: So the work moves into one link: from a statement about n to the same statement about n plus one.

Exam-trap caption mode adds: *The link must hold for every n in range, not for the n you happen to have written down. A step that only works for n at least 2 leaves the first link unproved.*

**0:22–0:30** — Base plus link gives every statement. The base alone gives one, and the link alone gives nothing, because there is nothing to start it. That is the whole method, and everything else in this lesson is a variation on it.

> Caption: Base plus link gives every statement, and neither alone gives any. That is the whole method.

## Scene 2. The rule, written down

*0:30 – 1:00 · objective: State the induction principle as an inference rule, name the five parts of a written proof, and see why the hypothesis is not circular.*

**0:30–0:37** — Here is the rule in symbols. The first line is the base case, P of zero. The second says that for every n, P of n implies P of n plus one. The conclusion is that P of m holds for every natural number m.

> Caption: The rule in symbols: P of zero, and P of n implies P of n plus one for every n, therefore P of m for every m.

**0:37–0:45** — Unfolded, the implication is a chain. P zero gives P one, which gives P two, which gives P three. The step proves all of those arrows at once, because it was proved for an arbitrary n rather than a chosen one.

> Caption: Unfolded, the link is a chain: P zero gives P one, which gives P two, which gives P three, and so on.

**0:45–0:52** — A written proof has five parts. Name the method. Define the predicate P of n. Prove the base. Prove the step from an arbitrary n. Then invoke the rule. The predicate is the part most often left out, and leaving it out is the largest single source of confused proofs.

> Caption: A written proof has five parts: name the method, define P of n, prove the base, prove the step, invoke the rule.

Exam-trap caption mode adds: *A predicate written as "it holds for n" without saying what "it" is cannot be checked at n plus one. Write P of n as a complete sentence with n in it.*

**0:52–1:00** — The step is not circular. You assume P of n in order to prove P of n plus one, and what you have proved is the implication, not the statement. The statement comes from the base case and the rule together, never from the hypothesis alone.

> Caption: The hypothesis is not circular: you assume P of n to prove P of n plus one, which proves the implication, not P itself.

## Scene 3. Worked: the sum of cubes

*1:00 – 1:30 · objective: Prove the sum of the first n cubes equals the square of the sum of the first n integers: base, hypothesis, algebraic step, and an independent check.*

**1:00–1:07** — Now a worked proof. The claim is that the sum of the first n cubes equals the square of the sum of the first n integers. For n equal to four: one plus eight plus twenty-seven plus sixty-four is one hundred, and one plus two plus three plus four is ten, whose square is one hundred.

> Caption: Claim: one cubed plus two cubed up to n cubed equals the square of one plus two up to n.

**1:07–1:15** — Base case at n equals one. One cubed is one, and the square of one is one. The two sides agree, so the base holds and the chain has a first domino.

> Caption: Base case, n equals one: one cubed is one, and the square of one is one. The two sides agree.

**1:15–1:22** — Now the step. Assume the identity at n. The left side at n plus one is the left side at n plus n plus one cubed. The right side at n plus one is the right side at n plus n plus one cubed, because the two consecutive squares differ by exactly that cube. So both sides grow by the same amount and the identity survives.

> Caption: Step: the n plus one case adds n plus one cubed to the hypothesis, and the right side grows by exactly the same amount.

**1:22–1:30** — The page checks the identity from n equals one to three hundred, and also checks the algebraic difference at every step, and the residual is zero every time. That check is evidence. The proof is the two paragraphs above, and only the proof covers the numbers past three hundred.

> Caption: The page checks n from one to three hundred and the residual is zero every time, but the check is evidence, not the proof.

Exam-trap caption mode adds: *An exhaustive check of finitely many n is not an induction. It is a useful check on your algebra, and it can never replace the step.*

## Scene 4. Choosing the base case

*1:30 – 2:00 · objective: Prove 2^n > n^2 for n at least 5, and see that a true base at n = 1 is useless when the step is only valid from n = 3 upward.*

**1:30–1:37** — Here the base case needs care. The claim is that two to the n is greater than n squared. At n equal to one, two beats one, so it holds. At n equal to two, four is not greater than four, and at n equal to three, eight is less than nine.

> Caption: Claim: two to the n beats n squared. At n equal to one it is true, and at n equal to two it is already false.

**1:37–1:45** — So the claim as stated is false. The true statement is for n at least five, and that means the base case is five. Choosing one because it is true is choosing a domino that does not reach the rest.

> Caption: So the claim is not true for all n. It is true for n at least five, and the base case has to be five, not one.

Exam-trap caption mode adds: *Picking a base case because it is easy, rather than because it is the smallest n in the claim, is the commonest way to prove a statement nobody asked about.*

**1:45–1:52** — Now the step. To get from n to n plus one you need n plus one squared to be below two n squared. At n equal to three that is sixteen below eighteen, and it stays true. So the step is valid for n at least three, while the base is at five.

> Caption: The step needs n plus one squared below two n squared, which holds from n equal to three: sixteen is below eighteen.

**1:52–2:00** — Two conditions decide whether the argument reaches the claim. The base must sit where the step is valid, and the chain from the base must cover every n in the claim. With base one and a step valid from three, the chain cannot leave n equal to one, because the first two links are missing. With base five it covers five upward, which is the claim.

> Caption: The base must sit inside the step domain and the chain must cover the claim. Base one with step three covers only n equal to one.

Exam-trap caption mode adds: *A step proved only for n at least 2 leaves the link from P(1) to P(2) unproved, which is exactly the hole in the horse argument later in this lesson.*

## Scene 5. Strong induction

*2:00 – 2:30 · objective: Prove that every amount of 8 or more is payable with 3 and 5 rupee coins, using a hypothesis about n - 3, and see why the ordinary step cannot reach it.*

**2:00–2:07** — Strong induction is the second form. The claim: every amount of eight rupees or more can be paid exactly with three and five rupee coins. Eight is three plus five, nine is three threes, ten is two fives.

> Caption: Claim: every amount from eight rupees upward is a sum of three and five rupee coins.

**2:07–2:15** — The ordinary step cannot work here. Three rupees is payable and four is not, and six rupees is payable while seven is not. So a hypothesis about n alone tells you nothing about n plus one. What it does tell you is that n plus three is payable, because you can add one three rupee coin.

> Caption: The ordinary step cannot work: three rupees is payable and four is not, and six is payable and seven is not.

Exam-trap caption mode adds: *Reaching for the n to n plus one step because it is the version you memorised. Read the step the arithmetic actually offers.*

**2:15–2:22** — So the hypothesis is widened: assume the claim for every amount from eight up to n minus one. Then pay n by paying n minus three, which the hypothesis allows because n minus three is at least eight once n is at least eleven, and adding one three rupee coin.

> Caption: So assume the claim for every amount below n, and pay n by paying n minus three and adding a coin.

**2:22–2:30** — Strong induction is not a stronger rule. Any proof that uses it can be rewritten as an ordinary induction by putting the universal quantifier inside the predicate: instead of P of n, prove that P holds for everything up to n. It is a convenience, and the seven unpayable amounts below eight, which are one, two, four and seven, are unaffected by which form you use.

> Caption: Strong induction is not stronger: it is the same rule with a wider hypothesis, and any strong proof reformats as an ordinary one.

## Scene 6. Well-ordering, and the least counterexample

*2:30 – 3:00 · objective: Re-prove the coin claim by assuming a least counterexample and deriving a smaller one, and see that the three methods are the same reasoning in three formats.*

**2:30–2:37** — The third format is well-ordering: every non-empty set of natural numbers has a least element. It looks obvious, and it is false if you replace the naturals by the rationals, because the positive rationals have no least element. So it is a real fact about the naturals.

> Caption: Well-ordering: every non-empty set of natural numbers has a least element. That is false for the rationals.

**2:37–2:45** — Now use it. Suppose the coin claim fails for some amount. The set of counterexamples is non-empty, so by well-ordering it has a least member. Call it n. Every amount below n is therefore payable.

> Caption: So suppose the claim fails somewhere. The set of counterexamples is non-empty, so it has a least member n.

Exam-trap caption mode adds: *The set of counterexamples must be a set of naturals. Restating the claim over the reals, or over a range with no least element, voids the argument.*

**2:45–2:52** — But n is at least eleven, because eight, nine and ten were checked. So n minus three is at least eight and below n, hence payable by the choice of n as least. Add a three rupee coin and n is payable, contradicting that n was a counterexample. The set is empty, so the claim holds.

> Caption: But n minus three is below n, so it is payable, so n is payable: a smaller counterexample, which is a contradiction.

**2:52–3:00** — The three methods are three formats for the same reasoning, and any one of them can be rewritten as any other. Which you use is a matter of which reads most clearly. What never changes is that something must be checked at the bottom, and something must carry you upward.

> Caption: Induction, strong induction and well-ordering are three formats for one argument, and any of them reformats as any other.

## Scene 7. Structural induction on trees

*3:00 – 3:30 · objective: Prove that a full binary tree with i internal nodes has i + 1 leaves by inducting on the recursive definition, and check it on every tree up to six internal nodes.*

**3:00–3:07** — Structural induction is induction on a recursive definition. A full binary tree is either a single leaf, or an internal node whose two children are full binary trees. That definition has a base case and a step built into it, which is exactly what an induction needs.

> Caption: A full binary tree is a leaf, or a node with two full binary trees. The definition is already a base and a step.

**3:07–3:15** — The claim: a full binary tree with i internal nodes has i plus one leaves. The base is the lone leaf, which has zero internal nodes and one leaf, so the claim reads one equals one.

> Caption: Claim: with i internal nodes the tree has i plus one leaves. A lone leaf has zero internal nodes and one leaf.

**3:15–3:22** — The step: take an internal node whose children are full binary trees with i one and i two internal nodes. By the hypothesis they have i one plus one and i two plus one leaves. The parent adds one internal node and its leaves are the two children's leaves, so the count is i one plus i two plus two leaves over i one plus i two plus one internal nodes. The claim holds at the parent.

> Caption: Step: a node over two trees adds one internal node and merges their leaves, so i plus one becomes i plus two.

**3:22–3:30** — The page builds every full binary tree with up to six internal nodes, one hundred and ninety-seven trees in all, counted as the Catalan numbers one, one, two, five, fourteen, forty-two, one hundred and thirty-two. The leaf count equals the internal count plus one in every one of them, and the number of edges is twice the internal count.

> Caption: The page builds every full binary tree up to six internal nodes: one hundred and ninety-seven trees, and the count holds in all of them.

## Scene 8. Induction on a recurrence

*3:30 – 4:00 · objective: Verify the closed form of T(n) = 2T(n/2) + n by substituting the hypothesis into the step, which is how a guessed solution becomes a proved one.*

**3:30–3:37** — Recurrences appear in Section 5 of the syllabus, and induction is what turns a guessed closed form into a proved one. The recurrence here is T of n equals two T of n over two plus n, with T of one equal to zero.

> Caption: A recurrence gives T at n from T at smaller inputs. A closed form gives it in one step, and induction connects the two.

**3:37–3:45** — The guess is that T of n equals n times log base two n. At sixteen the recurrence gives sixty-four, and sixteen times four is sixty-four. At one thousand and twenty-four it gives ten thousand two hundred and forty, which is one thousand and twenty-four times ten.

> Caption: Guess: T of n equals n log base two n. At sixteen that is sixty-four, and at one thousand and twenty-four it is ten thousand two hundred and forty.

**3:45–3:52** — Now the step, which is where the guess is checked rather than hoped for. T of two k is two T of k plus two k. Substitute the hypothesis: two k log base two k, plus two k, which is two k times log base two k plus one, and that is two k times log base two of two k. The closed form at two k, which is what the step had to produce.

> Caption: Step: T of two k is two T of k plus two k, which by the hypothesis is two k log k plus two k, which is two k log of two k.

Exam-trap caption mode adds: *The substitution only works for powers of two, because the recurrence halves. A proof for n equal to two to the m is a proof for those n, not for every n, and the claim must say so.*

**3:52–4:00** — The page runs the recurrence exactly, without floating point, for every power of two from two up to one million and forty-eight thousand five hundred and seventy-six, twenty values, and the closed form matches at every one. That is the check; the substitution above is the proof, and only the proof covers the non-powers of two.

> Caption: The page computes the recurrence exactly for every power of two up to a million, and the closed form matches at all twenty.

## Scene 9. Loop invariants are induction

*4:00 – 4:30 · objective: Map initialization, maintenance and termination onto base, step and conclusion, and see the insertion-sort invariant hold at every index of every small array.*

**4:00–4:07** — The last use is the one that decides algorithm questions. A loop invariant is a statement about the program state that is true before the first pass, stays true after each pass, and is therefore true when the loop ends. That is induction, with the pass number as n.

> Caption: A loop invariant is a statement true before the loop, after every pass, and at the end: induction with a clock.

**4:07–4:15** — The three obligations map exactly. Initialization is the base case: the invariant holds before the first pass. Maintenance is the step: if it holds at the start of a pass, it holds at the end. Termination is the invocation: when the loop stops, the invariant plus the exit condition gives the result.

> Caption: Initialization is the base case, maintenance is the step, and termination is the invocation: three obligations, no more.

Exam-trap caption mode adds: *Termination needs the exit condition as well as the invariant. The invariant alone rarely says the array is sorted; it says a prefix is sorted, and the exit condition says the prefix is everything.*

**4:15–4:22** — For insertion sort the invariant is that after pass i, the first i entries are sorted and are exactly the first i entries of the input, rearranged. On the input five, two, four, six, one, three, the prefix after the third pass is two, four, five, which is sorted and is the first three values.

> Caption: Insertion sort: after pass i the first i entries are sorted and hold the same values as the original first i entries.

**4:22–4:30** — The page runs insertion sort on all twenty-four orderings of four values, checking the invariant after every pass of every run, and it holds each time; the final array is sorted in all twenty-four. What the page cannot do is prove it for five values, and that is the difference between a check and an induction.

> Caption: The page runs insertion sort on all twenty-four orderings of four values and the invariant holds at every index of every run.

## Scene 10. Where it breaks

*4:30 – 5:00 · objective: Name the four ways an induction argument fails, with a computed witness for each: the empty middle, a false pattern, a step outside its domain, and a word confused with another.*

**4:30–4:37** — Now the failures. The famous one claims all horses are the same colour. Take a set of n plus one horses. The first n are one colour and the last n are one colour, and if those two groups share a horse, all n plus one agree. The middle group has n minus one horses, and that is zero exactly when n is one.

> Caption: The horse argument: two overlapping groups of n share a middle. With n equal to one the middle is empty.

**4:37–4:45** — Second failure: mistaking a pattern for a proof. The numbers two to the two to the k, plus one, are three, five, seventeen, two hundred and fifty-seven and sixty-five thousand five hundred and thirty-seven for k from zero to four, and all five are prime. At k equal to five the number is four billion two hundred and ninety-four million nine hundred and sixty-seven thousand two hundred and ninety-seven, and it is six hundred and forty-one times six million seven hundred thousand four hundred and seventeen.

> Caption: A pattern is not a proof: two to the two to the k plus one is prime for k up to four, and composite at k equal to five.

Exam-trap caption mode adds: *Five confirming cases and no counterexample is still not a proof. The counterexample here needed six digits of exponent.*

**4:45–4:52** — Third failure: a step outside its domain. A step proved for n at least two leaves the first link open, which is the horse hole. A step proved only for powers of two proves the claim only at powers of two. The domain of the step and the range of the claim have to be compared before the argument is written down.

> Caption: A step proved only from n equal to two, or only for powers of two, does not cover the claim it is attached to.

**4:52–5:00** — Fourth, a confusion of words. Inductive reasoning in the aptitude sense generalises from examples and is never certain. Mathematical induction is a deduction: its conclusion follows from its premises with no residue of doubt. The General Aptitude syllabus uses the first word, and this lesson is about the second.

> Caption: And two different words: inductive reasoning generalises from cases, mathematical induction is a deduction.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
