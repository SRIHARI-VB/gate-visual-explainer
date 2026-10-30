# Complexity Classes P Np Np Complete — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/complexity-classes-p-np-np-complete/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. One question, one time budget

*0:00 – 0:30 · objective: Fix what a decision problem is and what "polynomial time" buys: a step count that grows like a power of n, never like two to the n, and why that line is the whole point of the classification.*

**0:00–0:07** — A decision problem asks one question and expects yes or no. Everything in this lesson is a decision problem.

> Caption: A decision problem asks one question and expects yes or no.

Exam-trap caption mode adds: *An optimisation problem such as "find the largest clique" is not a decision problem. Its decision form is "is there a clique of size k", and only that form sits inside NP.*

**0:07–0:15** — P holds the decision problems a deterministic machine can decide within a polynomial number of steps.

> Caption: P holds the problems a machine decides in polynomial time.

Exam-trap caption mode adds: *A polynomial with a huge constant is still polynomial. The definition is about growth, not about speed on the instances you happen to meet.*

**0:15–0:22** — Exhaustive search costs two to the n. A cubic method costs n cubed, and at forty variables the two are about sixteen million apart.

> Caption: Two to the n is not a polynomial, and it is what brute force costs.

Exam-trap caption mode adds: *Exponential cost is not a property of a hard problem, it is a property of a particular method. The open question is whether some polynomial method exists that nobody has found.*

**0:22–0:30** — Eight assignments exist for three variables. Four of them satisfy the formula we are about to check.

> Caption: Four assignments out of eight are yes instances of this formula.

Exam-trap caption mode adds: *The count of assignments is two to the number of variables, not two to the number of clauses. Four clauses over three variables still give eight assignments.*

## Scene 2. NP: hard to solve, easy to check

*0:30 – 1:00 · objective: State NP through the certificate and the verifier, on a concrete four-clause formula, and count how many of the eight assignments the verifier accepts.*

**0:30–0:37** — NP does not mean not polynomial. NP means a yes answer comes with a short certificate that a fast verifier can check.

> Caption: NP means a short certificate can be checked quickly.

Exam-trap caption mode adds: *NP is not "not polynomial". The name means non-deterministic polynomial time, and the class contains all of P.*

**0:37–0:45** — Four clauses of three literals each. Twelve slots in total, and the certificate has one bit per variable.

> Caption: Four clauses, three variables, twelve literal slots in all.

Exam-trap caption mode adds: *A literal is a variable or its negation, not a clause. Twelve slots means four clauses times three literals.*

**0:45–0:52** — The certificate is one, zero, zero. Every clause contains a true literal, so the verifier accepts.

> Caption: Certificate one, zero, zero satisfies all four clauses.

Exam-trap caption mode adds: *The verifier does not search for a certificate. It is handed one, and its job is only to check it — that is why verification is cheap while search is not.*

**0:52–1:00** — Four assignments out of eight satisfy the formula. The verifier accepts exactly those four.

> Caption: Exactly four of the eight assignments are accepted.

Exam-trap caption mode adds: *The number of certificates is two to the number of variables, whatever the number of clauses. Four clauses over three variables still means eight candidate certificates.*

## Scene 3. P sits inside NP

*1:00 – 1:30 · objective: Show by construction that a decider becomes a verifier that ignores its certificate, so every problem in P is in NP, and state the open question precisely.*

**1:00–1:07** — Take a polynomial-time decider and wrap it in a verifier that ignores the certificate. It still accepts exactly the yes instances.

> Caption: Any decider becomes a verifier that ignores the certificate.

Exam-trap caption mode adds: *This shows P is contained in NP. It says nothing about the reverse containment, which is the open question.*

**1:07–1:15** — Three certificates, three identical answers. The certificate is never read.

> Caption: Three different certificates, one unchanged answer.

Exam-trap caption mode adds: *A verifier that ignores its certificate is legal. The definition demands only that some certificate works when the answer is yes, not that the certificate be useful.*

**1:15–1:22** — P sits inside NP. Whether it sits properly inside is the famous open question.

> Caption: So P is contained in NP, in one direction only.

Exam-trap caption mode adds: *NP does not contain all decidable problems, and NP-hard does not mean "harder than NP". Both are statements about polynomial-time reductions, not about difficulty in general.*

**1:22–1:30** — One polynomial algorithm for one NP-complete problem would settle the question by collapsing the two classes.

> Caption: The open question: is P equal to NP?

Exam-trap caption mode adds: *No exam question asks you to prove P equals NP or differs from it. Questions ask what follows from a hypothetical polynomial algorithm, which is a different and answerable thing.*

## Scene 4. NP-hard and NP-complete: two conditions

*1:30 – 2:00 · objective: Separate the two definitions: NP-hard is a statement about everything in NP reducing to it, NP-complete adds membership in NP. Show that the first does not imply the second.*

**1:30–1:37** — A problem is NP-hard when every problem in NP reduces to it in polynomial time.

> Caption: NP-hard: every problem in NP reduces to it.

Exam-trap caption mode adds: *One reduction from one NP problem proves nothing about hardness. The definition quantifies over the whole class, which is why hardness is proved by starting from a known NP-complete source.*

**1:37–1:45** — The halting problem is NP-hard and is not in NP at all. Hardness and membership are independent conditions.

> Caption: NP-hard says nothing about being in NP.

Exam-trap caption mode adds: *Every NP-hard problem is not NP-complete. The converse of that mistake — treating NP-complete as a synonym for hard — costs marks in almost every paper that tests the topic.*

**1:45–1:52** — NP-complete means two things at once: hard for NP, and itself a member of NP.

> Caption: NP-complete: NP-hard and in NP, both conditions.

Exam-trap caption mode adds: *If a question gives you NP-hardness and asks what is still missing, the answer is membership in NP — a verifier, or a reduction of the problem to something in NP.*

**1:52–2:00** — Boolean satisfiability is the first known NP-complete problem, and 3-SAT follows from it.

> Caption: SAT and 3-SAT are NP-complete: the Cook-Levin theorem.

Exam-trap caption mode adds: *Cook-Levin is a theorem with a proof, not a convention. Every later hardness result in this lesson is a reduction from it, which is why the chain of reductions matters.*

## Scene 5. What a reduction actually proves

*2:00 – 2:30 · objective: Define the polynomial-time many-one reduction, and read off which of the two arrows proves hardness and which proves membership — the single most examinable fact on the topic.*

**2:00–2:07** — A reduction is one polynomial-time function that turns instances of the first problem into instances of the second, preserving yes and no.

> Caption: A reduces to B when one fast function preserves yes and no.

Exam-trap caption mode adds: *The function must run in polynomial time and must preserve both answers. A function that only maps yes instances to yes instances is not a reduction.*

**2:07–2:15** — Hardness flows along the arrow. A known hard problem reducing to the candidate makes the candidate hard.

> Caption: Hardness travels along the arrow, from source to target.

Exam-trap caption mode adds: *The arrow is the one place people lose the mark. Reducing the candidate to 3-SAT proves the candidate is in NP; it proves nothing about hardness.*

**2:15–2:22** — Reduce a known NP-complete problem to your candidate for hardness. Reduce your candidate to a known NP problem for membership.

> Caption: So hardness is proved by reducing a known problem to the candidate.

Exam-trap caption mode adds: *Both arrows can appear in one question, and they prove different halves. Two reductions in opposite directions together prove completeness; one alone proves half.*

**2:22–2:30** — Membership travels the other way. If the target is in NP and the source reduces to it, the source is in NP too.

> Caption: Membership travels backwards, against the arrow.

Exam-trap caption mode adds: *X reducing to 3-SAT makes X a member of NP. It never makes X NP-complete, and it never makes X NP-hard.*

## Scene 6. 3-SAT to CLIQUE: one vertex per literal

*2:30 – 3:00 · objective: Build the reduction graph of the four-clause formula — 12 vertices, 42 edges — and read the clause structure off its rows.*

**2:30–2:37** — Each clause becomes a row of three vertices, one per literal. Four clauses, twelve vertices.

> Caption: One row of three vertices per clause: twelve vertices.

Exam-trap caption mode adds: *A vertex is a literal occurrence, not a variable. The same variable appearing in two clauses gives two different vertices.*

**2:37–2:45** — Join vertices from different clauses whose literals are not opposites. That gives forty-two edges.

> Caption: Join two vertices when they are compatible: 42 edges.

Exam-trap caption mode adds: *Vertices inside one clause are never joined, not even when their literals agree. A clique must use one vertex per clause, so it can never pick two from the same row.*

**2:45–2:52** — A clique of size four takes one vertex from each row, and the chosen literals never contradict each other.

> Caption: A clique of size four picks one true literal per clause.

Exam-trap caption mode adds: *A clique larger than the number of clauses is impossible here, since two vertices from one row are never adjacent. That is what bounds the clique size by the clause count.*

**2:52–3:00** — Twelve cliques of size four, and no clique of size five. The largest clique equals the number of clauses.

> Caption: Twelve cliques of size four; the largest clique is four.

Exam-trap caption mode adds: *The number of cliques and the number of satisfying assignments need not be equal. Only the existence of a clique of size k matches satisfiability, and that is all the reduction claims.*

## Scene 7. Both directions, and the unsatisfiable case

*3:00 – 3:30 · objective: Convert a clique back into a satisfying assignment and an assignment forward into a clique, then run the same reduction on an unsatisfiable instance and watch the largest clique fall one short of the clause count.*

**3:00–3:07** — Read the labels of a clique and you get an assignment. Here it is one, zero, zero, and it satisfies every clause.

> Caption: Read a clique and you get a satisfying assignment.

Exam-trap caption mode adds: *A clique can name the same variable twice, as this one names x1. The labels must agree, and the page checks that every clique it finds is consistent.*

**3:07–3:15** — The other direction works too: each satisfying assignment marks one true literal per clause, and those four vertices are a clique.

> Caption: Read an assignment and you get a clique of size four.

Exam-trap caption mode adds: *Checking one direction only proves the reduction is not lying in one direction. A reduction must preserve yes and no, so both directions are part of the proof.*

**3:15–3:22** — Eight clauses over three variables, one forbidding each assignment. Nothing satisfies all eight.

> Caption: An unsatisfiable instance: eight clauses, no assignment.

Exam-trap caption mode adds: *An unsatisfiable formula is not a broken instance. The reduction must still run on it and must report no clique of size eight.*

**3:22–3:30** — The largest clique has size seven, so there is no clique of size eight. The reduction answers no, correctly.

> Caption: Its largest clique is seven: one short of the clause count.

Exam-trap caption mode adds: *The answer is the comparison of the largest clique with the clause count. A graph with a large clique is not the same as a graph with a clique of the required size.*

## Scene 8. CLIQUE to VERTEX COVER by complement

*3:30 – 4:00 · objective: Derive the complement identity: a clique of size k in a graph is a vertex cover of size n minus k in its complement, and check it on every graph with four or five vertices.*

**3:30–3:37** — Take the complement: an edge wherever the original graph had none.

> Caption: The complement graph keeps exactly the missing edges.

Exam-trap caption mode adds: *The complement has n choose 2 minus m edges, not m. On five vertices that is ten minus the edge count.*

**3:37–3:45** — A clique of size k in the graph is a vertex cover of size n minus k in the complement.

> Caption: A clique of size k is a cover of size n minus k.

Exam-trap caption mode adds: *The complement is taken of the same graph, not of a reduced graph. Applying the identity after deleting vertices gives the wrong count.*

**3:45–3:52** — Largest clique three, smallest cover of the complement two. Three plus two is the five vertices.

> Caption: Here the largest clique is three and the cover is two.

Exam-trap caption mode adds: *A minimum vertex cover is not unique. The identity is about the size, so counting covers rather than measuring one is the wrong move.*

**3:52–4:00** — The identity holds on all one thousand and eighty-eight graphs with four or five vertices. A check is not a proof, but it is a good reason to trust the derivation.

> Caption: Checked on all 1088 graphs with four or five vertices.

Exam-trap caption mode adds: *An exhaustive check on small graphs confirms a formula; it does not prove it. The proof is the two-line argument on the previous beat.*

## Scene 9. Where the labels break

*4:00 – 4:30 · objective: Distinguish 2-SAT from 3-SAT, note that clique with a fixed k is in P, and place NP-hard outside NP using the halting problem.*

**4:00–4:07** — Two literals per clause is a different problem. Build the implication graph and look at its strongly connected components.

> Caption: 2-SAT is in P, and 3-SAT is not known to be.

Exam-trap caption mode adds: *2-SAT is in P. The number of literals per clause changes the complexity class, so "SAT is NP-complete" must never be applied to a 2-SAT instance.*

**4:07–4:15** — Three thousand and sixty formulas, no disagreement between the fast test and brute force.

> Caption: On 3060 formulas the component test never disagreed.

Exam-trap caption mode adds: *Agreement on small formulas is evidence, not proof. The proof is that the implication graph encodes exactly the propagation a satisfying assignment must obey.*

**4:15–4:22** — Clique with a fixed size is polynomial. Hardness appears when k is part of the input.

> Caption: Clique with k fixed at three is in P as well.

Exam-trap caption mode adds: *CLIQUE is NP-complete and triangle detection is in P. Both statements are true; they are statements about different problems.*

**4:22–4:30** — NP-hard reaches outside NP. NP-complete is what is left when you also require membership in NP.

> Caption: NP-hard is wider than NP-complete.

Exam-trap caption mode adds: *If a problem is not in NP it cannot be NP-complete, however hard it is. "Not in NP" and "not hard" are different statements.*

## Scene 10. Reading the question

*4:30 – 5:00 · objective: Turn the definitions into a three-way decision procedure for an exam item, and state what one polynomial algorithm for an NP-complete problem would collapse.*

**4:30–4:37** — Ask first which claim the question is making: membership, hardness, or completeness.

> Caption: First decide which of the three claims is being made.

Exam-trap caption mode adds: *A question that mentions an NP-complete problem may still be asking only about membership. Read which claim is being made before choosing a technique.*

**4:37–4:45** — For membership, either write a verifier or reduce to a problem already known to be in NP.

> Caption: Membership: a verifier, or a reduction into a known member.

Exam-trap caption mode adds: *Reducing into an NP-complete problem proves membership only. It is the commonest half-answer in the whole topic.*

**4:45–4:52** — For hardness, reduce a known NP-complete problem to yours. For completeness, add the verifier.

> Caption: Hardness: reduce a known NP-complete problem to yours.

Exam-trap caption mode adds: *A reduction in the wrong direction is the standard wrong answer offered in multiple-choice questions. Check the arrow before the answer.*

**4:52–5:00** — One polynomial algorithm for one NP-complete problem makes P, NP and NP-complete the same class.

> Caption: One polynomial algorithm for one NP-complete problem collapses all three.

Exam-trap caption mode adds: *The collapse is conditional. No such algorithm is known, and the statement "if X is in P then P equals NP" is not the statement "X is in P".*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
