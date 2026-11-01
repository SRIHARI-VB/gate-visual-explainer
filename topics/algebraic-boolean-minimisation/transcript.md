# Algebraic Boolean Minimisation — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/algebraic-boolean-minimisation/index.html`
- Total duration: 5:46 (346 seconds), 13 scenes, 42 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Three methods, one clause, three different promises

*0:00 – 0:26 · objective: Name the three methods the syllabus puts in one clause, and see that only two of them can certify a minimum.*

**0:00–0:08** — The syllabus puts three methods in one clause. This lesson takes the first of them.

> Caption: The GATE 2027 syllabus names three ways to minimise a Boolean function: the algebraic technique, the Karnaugh map, and the tabular method.

Exam-trap caption mode adds: *A clause that names three methods does not say they are interchangeable; only two of them can certify a minimum.*

**0:08–0:16** — All three start from the same function and aim at a shorter description of it.

> Caption: All three start from the same object — a function given by a truth table or a canonical expression — and all three aim at a shorter expression.

**0:16–0:26** — Only two of the three can tell you when you are finished. The algebraic route cannot.

> Caption: Only two of them tell you when to stop. The algebraic route stops when nothing looks applicable, which is not the same thing as minimal.

Exam-trap caption mode adds: *"Simplified" is not "minimal". A question that says minimal is asking for a count, not for an improvement.*

## Scene 2. The cost is the number of literals

*0:26 – 0:50 · objective: Define a literal, count literals in terms and in a whole expression, and say why the count is the cost.*

**0:26–0:34** — A literal is one occurrence of a variable. Count the occurrences, not the variables.

> Caption: A literal is one occurrence of a variable, negated or not. ab′c′ has three literals; xy + x′z has four.

**0:34–0:42** — Literals are gate inputs, so the literal count is the cost we minimise.

> Caption: Cost is counted in literals because a literal is a gate input. Terms count gates; literals count the inputs those gates need.

**0:42–0:50** — Canonical form is the expensive starting point: three literals per minterm for three variables.

> Caption: The canonical form of n variables costs n literals per minterm, so a five-minterm three-variable function starts at fifteen literals.

## Scene 3. Eight identities used as rewrites

*0:50 – 1:18 · objective: Read each identity as a licence to replace a sub-expression, and see that no rewrite can change the function.*

**0:50–0:58** — Each identity is a licence to replace a piece of the expression by something equal.

> Caption: Eight identities, each an equality, each usable as a rewrite: replace the left side by the right side anywhere inside the expression.

**0:58–1:06** — Five of the eight actually make the expression smaller. Those five are the method.

> Caption: Five of them reduce: combine, absorb, eliminate a literal, remove a consensus term, and De Morgan to cross between the two normal forms.

**1:06–1:18** — Every rewrite is safe. The page proves it by comparing truth tables, and then the real difficulty begins.

> Caption: Because every one is an equality, no rewrite can change the function. The page tests 250 applications on three-variable pairs and finds none that moves a truth table.

Exam-trap caption mode adds: *Soundness is not completeness: a rule that never changes the function still cannot guarantee you reach the smallest one.*

## Scene 4. One worked chain: ten literals to eight

*1:18 – 1:50 · objective: Follow the textbook example line by line: two factors, two eliminated literals, one expansion, ending at the minimum.*

**1:18–1:26** — Ten literals, three terms. This is the textbook example for eliminating a literal.

> Caption: Start with a′b + a′b′c′d′ + abcd′: ten literals in three terms, none of them canonical.

**1:26–1:34** — Factor first. Factoring deletes nothing; it only makes the next rule applicable.

> Caption: Factor a′ out of the first two terms: a′(b + b′c′d′) + abcd′. Nothing has been deleted yet — the shape changed.

**1:34–1:42** — With the term factored, the elimination rule applies twice. Seven literals in the factored form.

> Caption: Now eliminate: b + b′c′d′ = b + c′d′, because b is a single literal. Then factor again and eliminate again.

**1:42–1:50** — Eight literals in a sum of products, and eight is the minimum. Every line was checked against the truth table.

> Caption: Multiplying out gives a′b + bcd′ + a′c′d′: eight literals, and the exhaustive search confirms eight is the minimum.

Exam-trap caption mode adds: *A 7-literal factored form and an 8-literal minimal sum of products are answers to different questions. Read which form the question asks for.*

## Scene 5. The two rules that do most of the work

*1:50 – 2:18 · objective: Prove absorption and literal elimination by splitting on one variable, and see the case where the second rule is misapplied.*

**1:50–1:58** — Absorption deletes a term, and the proof is one case split on X.

> Caption: Absorption: X + XY = X. If X is 1 both terms are 1; if X is 0 both terms are 0, so the second term never decides anything.

**1:58–2:06** — Elimination deletes a literal. The same case split proves it.

> Caption: Eliminating a literal: X + X′Y = X + Y. If X is 1 both sides are 1; if X is 0 then X′ is 1 and both sides are Y.

**2:06–2:18** — With a longer X the same deletion is wrong, and the page finds the row where it breaks.

> Caption: But X must be one literal. With a longer X you must factor first: a′b′ + a′bc′ = a′(b′ + bc′) = a′(b′ + c′).

Exam-trap caption mode adds: *X + X′Y = X + Y is quoted without its condition in many notes. The condition is that X is a single literal.*

## Scene 6. The consensus theorem

*2:18 – 2:50 · objective: Build the consensus of two terms, prove it is redundant row by row, and delete it to save two literals.*

**2:18–2:26** — Two terms disagree on one variable. Their consensus is what is left when that variable goes.

> Caption: The consensus of xy and x′z is yz: keep every literal the two terms share, and drop the variable they disagree on.

**2:26–2:34** — Wherever the consensus term is one, one of the two terms it came from is already one.

> Caption: Row by row: the consensus term is 1 only on rows where one of the two original terms is already 1.

**2:34–2:42** — Split on x. If x is one, xy covers the row. If x is zero, x-prime z covers it.

> Caption: That is the whole proof: yz is 1 only when y and z are both 1, and then x is either 1 or 0, so xy or x′z is 1.

**2:42–2:50** — Removing the consensus term saves two literals and changes nothing.

> Caption: So the term can go: six literals become four, and the model confirms the two expressions agree on all eight rows.

## Scene 7. Where the consensus rule stops

*2:50 – 3:14 · objective: See that a consensus exists only for exactly one opposition, and what goes wrong when it is applied to two.*

**2:50–2:58** — One opposition, or no consensus. Here there are two oppositions.

> Caption: The consensus exists only when the two terms disagree on exactly one variable. xy and x′y′ disagree on two.

**2:58–3:06** — Delete the opposed literals and nothing remains, which reads as the constant one.

> Caption: Apply the rule blindly and the empty term 1 appears: xy + x′y′ becomes xy + x′y′ + 1, which is the constant 1.

**3:06–3:14** — One row is enough to show it is wrong. Count the oppositions first.

> Caption: At x = 1, y = 0 the function is 0 and the constant is 1: minterm 5. Count the oppositions before you remove anything.

Exam-trap caption mode adds: *A rule with an unstated condition is a trap. The consensus needs exactly one opposition, and the dual needs exactly one too.*

## Scene 8. The order decides the answer

*3:14 – 3:42 · objective: Run two correct routes on one expression and get 6 and 8 literals, both equal to F.*

**3:14–3:22** — One expression, five terms. Two orders, two answers, both correct.

> Caption: Five terms, ten literals: a′b′ + ac + a′c′ + b′c + ab. The minimum is six. Two routes both reach a correct answer.

**3:22–3:30** — Remove the consensus terms first and you land on the minimum, six literals.

> Caption: Route one removes consensus terms first: a′c′ + ab + b′c, six literals. That is the minimum.

**3:30–3:42** — The other order stops two literals short of the minimum, with every step still legal.

> Caption: Route two absorbs first and then finds nothing applicable: a′b′ + ac + a′c′ + ab, eight literals, still equal to F.

Exam-trap caption mode adds: *Both answers are correct expressions of F. Only one is minimal, and "I could not simplify it further" does not mean minimal.*

## Scene 9. The stall, and the way out

*3:42 – 4:14 · objective: Meet an expression no reducing rule touches, and escape by adding a term before removing three.*

**3:42–3:50** — Nine literals and every reducing rule refuses. The minimum is six.

> Caption: wx + xy + x′z′ + wy′z′: nine literals, and not one reducing rule applies. No combine, no absorb, no elimination, no consensus term.

**3:50–3:58** — Add a redundant term. The expression gets longer, and that is the point.

> Caption: The escape is to add a term: wz′ is the consensus of wx and x′z′, so adding it is safe. Eleven literals — worse.

**3:58–4:06** — The term you added now absorbs one that was stuck. Eight literals.

> Caption: Now wy′z′ is absorbed by wz′: wx + xy + x′z′ + wz′, eight literals.

**4:06–4:14** — Then remove the term you added, and you are at six literals, which is the minimum.

> Caption: And wz′ is itself the consensus of wx and x′z′, so it goes too: wx + x′z′ + xy, six literals, the minimum.

Exam-trap caption mode adds: *This route needs a decision — which consensus term to add. That decision is what the map and the table replace with a search.*

## Scene 10. How often the algebraic route stops short

*4:14 – 4:36 · objective: Read the machine count over every three-variable function, and keep one small witness.*

**4:14–4:22** — Two hundred and fifty-five functions, one fixed strategy, run by machine.

> Caption: Every non-constant three-variable function was tried: 255 of them, from the canonical form, applying the four reducing rules until none applies.

**4:22–4:30** — Fifty-eight per cent stop short. One added consensus term fixes most of them, but not all.

> Caption: 148 of the 255 end above the minimum: 58 per cent. Adding the best single consensus term fixes 108 of those, and leaves 40 still above.

Exam-trap caption mode adds: *A method that works on the examples you tried is not a method that always works. This is the count that shows the difference.*

**4:30–4:36** — The witness is small enough to check by eye: three literals against nine.

> Caption: One witness is kept: the function that is 1 everywhere except minterm 001. The algebraic route stops at nine literals; the answer is a + b + c′, three.

## Scene 11. One function, three methods

*4:36 – 5:00 · objective: Take one function from 18 literals to 6 by three routes, and see which routes can prove they are done.*

**4:36–4:44** — One function, six minterms, eighteen literals in canonical form.

> Caption: One function: Σ(0,1,2,5,6,7) on a, b, c. Canonical form is six terms of three literals — eighteen.

**4:44–4:52** — All three reach six literals. Only two of them can prove six is the smallest.

> Caption: The algebra reaches six literals by removing consensus terms. The map and the table reach the same six, and can prove it is the smallest.

**4:52–5:00** — A minimum need not be unique. Twenty-eight of the two hundred and fifty-five functions have more than one.

> Caption: And the minimum is not always unique: 28 of the 255 three-variable functions have more than one six-literal answer, or more than one answer at their minimum.

Exam-trap caption mode adds: *In a multiple-select question, two minimal expressions can both be correct. Do not eliminate one because "there can only be one".*

## Scene 12. Two levels against many

*5:00 – 5:24 · objective: See factoring cut literals, see depth grow, and see why a redundant term is sometimes kept on purpose.*

**5:00–5:08** — Factor the shared literal and the count falls from six to four.

> Caption: Factoring is a rewrite too: AB + AC + AD is six literals in four gates; A(B + C + D) is four literals in two.

**5:08–5:16** — Fewer literals can mean more delay. Both counts matter.

> Caption: But depth is a cost as well: AB + AC + D is five literals at depth two, while A(B + C) + D is four literals at depth three.

Exam-trap caption mode adds: *"Minimal" in a GATE question means fewest literals in the named form. It does not mean fastest, and it does not mean fewest gates.*

**5:16–5:24** — The term the theorem lets you delete is the term that removes a glitch. Sometimes you keep it.

> Caption: And a redundant term is sometimes kept on purpose: for xy + x′z, the consensus yz holds the output at 1 while x changes, so a glitch cannot pass.

## Scene 13. The procedure for a simplify question

*5:24 – 5:46 · objective: Leave with five ordered steps, the escape when they stall, and the one check that proves the answer.*

**5:24–5:32** — Five steps in order, repeated until nothing applies.

> Caption: Five ordered steps: count the literals, combine, absorb, eliminate, remove a consensus term — and repeat from the top.

**5:32–5:40** — When the rules stall, you have to choose a term to add. That is where the method becomes a search.

> Caption: If nothing applies and you are still long, factor, or add a consensus term and try again. That is a decision, not a rule.

**5:40–5:46** — Check one zero row and one one row. That is the step that catches every mistake.

> Caption: Then check the answer on one assignment where it should be 0 and one where it should be 1. Two expressions that disagree on one row are different functions.

Exam-trap caption mode adds: *Checking only the rows where the function is 1 cannot catch a term that was over-deleted. Check a zero row too.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
