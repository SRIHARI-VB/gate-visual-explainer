/* ==========================================================================
   complexity-classes-p-np-np-complete — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   captions.vtt, captions.srt and transcript.md are generated from this file by
   tools/gen-captions.mjs — never edited by hand.

   Every number quoted in a caption is computed by the model in lesson.js and
   printed on the canvas: 4 clauses, 3 variables, 12 literal slots, 4 satisfying
   assignments, a 12-vertex 42-edge reduction graph with 12 cliques of size 4,
   an unsatisfiable 8-clause instance whose graph has 24 vertices, 204 edges and
   largest clique 7, and the complement identity checked on 1088 graphs.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'decide', n: 1,
      title: 'One question, one time budget',
      start: 0, end: 30,
      objective: 'Fix what a decision problem is and what "polynomial time" buys: a step count that grows like a power of n, never like two to the n, and why that line is the whole point of the classification.'
    },
    {
      id: 'verify', n: 2,
      title: 'NP: hard to solve, easy to check',
      start: 30, end: 60,
      objective: 'State NP through the certificate and the verifier, on a concrete four-clause formula, and count how many of the eight assignments the verifier accepts.'
    },
    {
      id: 'subset', n: 3,
      title: 'P sits inside NP',
      start: 60, end: 90,
      objective: 'Show by construction that a decider becomes a verifier that ignores its certificate, so every problem in P is in NP, and state the open question precisely.'
    },
    {
      id: 'hard', n: 4,
      title: 'NP-hard and NP-complete: two conditions',
      start: 90, end: 120,
      objective: 'Separate the two definitions: NP-hard is a statement about everything in NP reducing to it, NP-complete adds membership in NP. Show that the first does not imply the second.'
    },
    {
      id: 'reduce', n: 5,
      title: 'What a reduction actually proves',
      start: 120, end: 150,
      objective: 'Define the polynomial-time many-one reduction, and read off which of the two arrows proves hardness and which proves membership — the single most examinable fact on the topic.'
    },
    {
      id: 'gadget', n: 6,
      title: '3-SAT to CLIQUE: one vertex per literal',
      start: 150, end: 180,
      objective: 'Build the reduction graph of the four-clause formula — 12 vertices, 42 edges — and read the clause structure off its rows.'
    },
    {
      id: 'witness', n: 7,
      title: 'Both directions, and the unsatisfiable case',
      start: 180, end: 210,
      objective: 'Convert a clique back into a satisfying assignment and an assignment forward into a clique, then run the same reduction on an unsatisfiable instance and watch the largest clique fall one short of the clause count.'
    },
    {
      id: 'cover', n: 8,
      title: 'CLIQUE to VERTEX COVER by complement',
      start: 210, end: 240,
      objective: 'Derive the complement identity: a clique of size k in a graph is a vertex cover of size n minus k in its complement, and check it on every graph with four or five vertices.'
    },
    {
      id: 'boundary', n: 9,
      title: 'Where the labels break',
      start: 240, end: 270,
      objective: 'Distinguish 2-SAT from 3-SAT, note that clique with a fixed k is in P, and place NP-hard outside NP using the halting problem.'
    },
    {
      id: 'exam', n: 10,
      title: 'Reading the question',
      start: 270, end: 300,
      objective: 'Turn the definitions into a three-way decision procedure for an exam item, and state what one polynomial algorithm for an NP-complete problem would collapse.'
    }
  ],

  events: [
    /* ---------- scene 1: decide ---------- */
    {
      id: 's1a', start: 0, end: 7.5, scene: 'decide',
      caption: 'A decision problem asks one question and expects yes or no.',
      detail: 'A decision problem is a set of instances, each of which is either a yes instance or a no instance. "Does this graph contain a cycle?" is a decision problem; "find the cheapest tour" is not, until it is rewritten as one.',
      narration: 'A decision problem asks one question and expects yes or no. Everything in this lesson is a decision problem.',
      keyword: 'decision problem',
      trap: 'An optimisation problem such as "find the largest clique" is not a decision problem. Its decision form is "is there a clique of size k", and only that form sits inside NP.'
    },
    {
      id: 's1b', start: 7.5, end: 15, scene: 'decide',
      caption: 'P holds the problems a machine decides in polynomial time.',
      detail: 'P is the class of decision problems decided by a deterministic Turing machine whose running time is bounded by a polynomial in the input length. Polynomial here means n, n squared, n cubed, n to the seventh — any fixed power.',
      narration: 'P holds the decision problems a deterministic machine can decide within a polynomial number of steps.',
      keyword: 'P',
      trap: 'A polynomial with a huge constant is still polynomial. The definition is about growth, not about speed on the instances you happen to meet.'
    },
    {
      id: 's1c', start: 15, end: 22.5, scene: 'decide',
      caption: 'Two to the n is not a polynomial, and it is what brute force costs.',
      detail: 'Three variables give eight assignments, so trying them all costs two to the n. A cubic method on the same instance costs n cubed. At n equal to 40 the cubic method takes 64000 steps and the exhaustive one takes about 1.1 million million.',
      narration: 'Exhaustive search costs two to the n. A cubic method costs n cubed, and at forty variables the two are about sixteen million apart.',
      keyword: 'two to the n',
      trap: 'Exponential cost is not a property of a hard problem, it is a property of a particular method. The open question is whether some polynomial method exists that nobody has found.'
    },
    {
      id: 's1d', start: 22.5, end: 30, scene: 'decide',
      caption: 'Four assignments out of eight are yes instances of this formula.',
      detail: 'The formula in the next scene has four clauses over three variables. Eight assignments exist; four of them satisfy every clause. The table on the left is the size comparison, the number on the right is this instance.',
      narration: 'Eight assignments exist for three variables. Four of them satisfy the formula we are about to check.',
      keyword: 'eight assignments',
      trap: 'The count of assignments is two to the number of variables, not two to the number of clauses. Four clauses over three variables still give eight assignments.'
    },

    /* ---------- scene 2: verify ---------- */
    {
      id: 's2a', start: 30, end: 37.5, scene: 'verify',
      caption: 'NP means a short certificate can be checked quickly.',
      detail: 'A decision problem is in NP when there is a polynomial-time verifier that accepts an instance together with a certificate of polynomial length exactly when the instance is a yes instance. NP stands for non-deterministic polynomial time, and the verifier definition is equivalent to the non-deterministic machine definition.',
      narration: 'NP does not mean not polynomial. NP means a yes answer comes with a short certificate that a fast verifier can check.',
      keyword: 'certificate',
      trap: 'NP is not "not polynomial". The name means non-deterministic polynomial time, and the class contains all of P.'
    },
    {
      id: 's2b', start: 37.5, end: 45, scene: 'verify',
      caption: 'Four clauses, three variables, twelve literal slots in all.',
      detail: 'The formula is the conjunction of x1 or x2 or x3; not x1 or not x2 or x3; not x1 or x2 or not x3; and x1 or not x2 or not x3. Each clause holds three literals, so the verifier has twelve literal slots to evaluate.',
      narration: 'Four clauses of three literals each. Twelve slots in total, and the certificate has one bit per variable.',
      keyword: 'twelve',
      trap: 'A literal is a variable or its negation, not a clause. Twelve slots means four clauses times three literals.'
    },
    {
      id: 's2c', start: 45, end: 52.5, scene: 'verify',
      caption: 'Certificate one, zero, zero satisfies all four clauses.',
      detail: 'With x1 true, x2 false and x3 false, clause one is satisfied by x1, clause two by not x2, clause three by not x3, and clause four by x1. The verifier reads the certificate once and evaluates twelve literal slots, which is linear in the formula size.',
      narration: 'The certificate is one, zero, zero. Every clause contains a true literal, so the verifier accepts.',
      keyword: 'one, zero, zero',
      trap: 'The verifier does not search for a certificate. It is handed one, and its job is only to check it — that is why verification is cheap while search is not.'
    },
    {
      id: 's2d', start: 52.5, end: 60, scene: 'verify',
      caption: 'Exactly four of the eight assignments are accepted.',
      detail: 'The accepted assignments are one zero zero, zero one zero, zero zero one and one one one. The other four leave at least one clause with all three literals false. This count is computed by the page, not quoted.',
      narration: 'Four assignments out of eight satisfy the formula. The verifier accepts exactly those four.',
      keyword: 'four',
      trap: 'The number of certificates is two to the number of variables, whatever the number of clauses. Four clauses over three variables still means eight candidate certificates.'
    },

    /* ---------- scene 3: subset ---------- */
    {
      id: 's3a', start: 60, end: 67.5, scene: 'subset',
      caption: 'Any decider becomes a verifier that ignores the certificate.',
      detail: 'Given a polynomial-time decider for a problem, build a verifier that reads the certificate, throws it away, and runs the decider. It accepts exactly the yes instances, so the problem satisfies the verifier definition of NP.',
      narration: 'Take a polynomial-time decider and wrap it in a verifier that ignores the certificate. It still accepts exactly the yes instances.',
      keyword: 'ignores',
      trap: 'This shows P is contained in NP. It says nothing about the reverse containment, which is the open question.'
    },
    {
      id: 's3b', start: 67.5, end: 75, scene: 'subset',
      caption: 'Three different certificates, one unchanged answer.',
      detail: 'Run the wrapper with certificate one zero zero, then with zero one zero, then with one one one. The answer is identical every time because the certificate is never consulted. That is what "P is inside NP" means operationally.',
      narration: 'Three certificates, three identical answers. The certificate is never read.',
      keyword: 'identical',
      trap: 'A verifier that ignores its certificate is legal. The definition demands only that some certificate works when the answer is yes, not that the certificate be useful.'
    },
    {
      id: 's3c', start: 75, end: 82.5, scene: 'subset',
      caption: 'So P is contained in NP, in one direction only.',
      detail: 'Every problem in P is in NP, so the picture draws P inside NP. Nobody has proved the containment is strict, and nobody has proved it is not. The known containments are P inside NP inside PSPACE.',
      narration: 'P sits inside NP. Whether it sits properly inside is the famous open question.',
      keyword: 'contained',
      trap: 'NP does not contain all decidable problems, and NP-hard does not mean "harder than NP". Both are statements about polynomial-time reductions, not about difficulty in general.'
    },
    {
      id: 's3d', start: 82.5, end: 90, scene: 'subset',
      caption: 'The open question: is P equal to NP?',
      detail: 'If some NP-complete problem were decided in polynomial time, then every problem in NP would be, because every problem in NP reduces to it. That single implication is the reason the class is worth studying at all.',
      narration: 'One polynomial algorithm for one NP-complete problem would settle the question by collapsing the two classes.',
      keyword: 'P equal to NP',
      trap: 'No exam question asks you to prove P equals NP or differs from it. Questions ask what follows from a hypothetical polynomial algorithm, which is a different and answerable thing.'
    },

    /* ---------- scene 4: hard ---------- */
    {
      id: 's4a', start: 90, end: 97.5, scene: 'hard',
      caption: 'NP-hard: every problem in NP reduces to it.',
      detail: 'A decision problem B is NP-hard when every problem A in NP is polynomial-time reducible to B. The definition quantifies over all of NP, so exhibiting one reduction never proves hardness on its own.',
      narration: 'A problem is NP-hard when every problem in NP reduces to it in polynomial time.',
      keyword: 'every problem in NP',
      trap: 'One reduction from one NP problem proves nothing about hardness. The definition quantifies over the whole class, which is why hardness is proved by starting from a known NP-complete source.'
    },
    {
      id: 's4b', start: 97.5, end: 105, scene: 'hard',
      caption: 'NP-hard says nothing about being in NP.',
      detail: 'The halting problem is NP-hard — every problem in NP reduces to it, since a decider for halting would decide anything — and it is not in NP, because it is not even decidable and NP contains only decidable problems.',
      narration: 'The halting problem is NP-hard and is not in NP at all. Hardness and membership are independent conditions.',
      keyword: 'halting problem',
      trap: 'Every NP-hard problem is not NP-complete. The converse of that mistake — treating NP-complete as a synonym for hard — costs marks in almost every paper that tests the topic.'
    },
    {
      id: 's4c', start: 105, end: 112.5, scene: 'hard',
      caption: 'NP-complete: NP-hard and in NP, both conditions.',
      detail: 'A problem is NP-complete when it is NP-hard and it is in NP. The first condition supplies the hardness, the second keeps it inside the class, and a problem missing either one is not NP-complete.',
      narration: 'NP-complete means two things at once: hard for NP, and itself a member of NP.',
      keyword: 'both conditions',
      trap: 'If a question gives you NP-hardness and asks what is still missing, the answer is membership in NP — a verifier, or a reduction of the problem to something in NP.'
    },
    {
      id: 's4d', start: 112.5, end: 120, scene: 'hard',
      caption: 'SAT and 3-SAT are NP-complete: the Cook-Levin theorem.',
      detail: 'Cook, and independently Levin, showed in 1971 that Boolean satisfiability is NP-complete: every polynomial-time computation can be written as a formula whose satisfying assignments encode accepting runs. 3-SAT follows by a reduction from SAT.',
      narration: 'Boolean satisfiability is the first known NP-complete problem, and 3-SAT follows from it.',
      keyword: 'Cook-Levin',
      trap: 'Cook-Levin is a theorem with a proof, not a convention. Every later hardness result in this lesson is a reduction from it, which is why the chain of reductions matters.'
    },

    /* ---------- scene 5: reduce ---------- */
    {
      id: 's5a', start: 120, end: 127.5, scene: 'reduce',
      caption: 'A reduces to B when one fast function preserves yes and no.',
      detail: 'A is polynomial-time many-one reducible to B, written A reduces to B, when a polynomial-time computable function maps every instance of A to an instance of B with the same answer. The function is computable without solving either problem.',
      narration: 'A reduction is one polynomial-time function that turns instances of the first problem into instances of the second, preserving yes and no.',
      keyword: 'preserves',
      trap: 'The function must run in polynomial time and must preserve both answers. A function that only maps yes instances to yes instances is not a reduction.'
    },
    {
      id: 's5b', start: 127.5, end: 135, scene: 'reduce',
      caption: 'Hardness travels along the arrow, from source to target.',
      detail: 'If A is NP-hard and A reduces to B, then B is NP-hard: every problem in NP reduces to A, and A reduces to B, and polynomial-time reductions compose. So the arrow points from the known hard problem to the candidate.',
      narration: 'Hardness flows along the arrow. A known hard problem reducing to the candidate makes the candidate hard.',
      keyword: 'along the arrow',
      trap: 'The arrow is the one place people lose the mark. Reducing the candidate to 3-SAT proves the candidate is in NP; it proves nothing about hardness.'
    },
    {
      id: 's5c', start: 135, end: 142.5, scene: 'reduce',
      caption: 'So hardness is proved by reducing a known problem to the candidate.',
      detail: 'To show a candidate is NP-hard, take a problem already known to be NP-complete, such as 3-SAT, and reduce it to the candidate. To show a candidate is in NP, either exhibit a polynomial verifier or reduce the candidate to a problem already known to be in NP.',
      narration: 'Reduce a known NP-complete problem to your candidate for hardness. Reduce your candidate to a known NP problem for membership.',
      keyword: 'known NP-complete',
      trap: 'Both arrows can appear in one question, and they prove different halves. Two reductions in opposite directions together prove completeness; one alone proves half.'
    },
    {
      id: 's5d', start: 142.5, end: 150, scene: 'reduce',
      caption: 'Membership travels backwards, against the arrow.',
      detail: 'If B is in NP and A reduces to B, then A is in NP: solve A by transforming to B and using B certifier. This is the pattern behind "X reduces to 3-SAT, so X is in NP".',
      narration: 'Membership travels the other way. If the target is in NP and the source reduces to it, the source is in NP too.',
      keyword: 'against the arrow',
      trap: 'X reducing to 3-SAT makes X a member of NP. It never makes X NP-complete, and it never makes X NP-hard.'
    },

    /* ---------- scene 6: gadget ---------- */
    {
      id: 's6a', start: 150, end: 157.5, scene: 'gadget',
      caption: 'One row of three vertices per clause: twelve vertices.',
      detail: 'Each of the four clauses contributes one vertex per literal, and the vertices of a clause are laid out as a row. Twelve literals give twelve vertices. The rows are the clauses, and the columns are the three literal positions.',
      narration: 'Each clause becomes a row of three vertices, one per literal. Four clauses, twelve vertices.',
      keyword: 'twelve vertices',
      trap: 'A vertex is a literal occurrence, not a variable. The same variable appearing in two clauses gives two different vertices.'
    },
    {
      id: 's6b', start: 157.5, end: 165, scene: 'gadget',
      caption: 'Join two vertices when they are compatible: 42 edges.',
      detail: 'Two vertices are joined when they come from different clauses and their literals are not opposites. Opposite literals can never both be true, so they are never joined. On this instance the rule produces 42 edges out of the 66 possible pairs.',
      narration: 'Join vertices from different clauses whose literals are not opposites. That gives forty-two edges.',
      keyword: 'not opposites',
      trap: 'Vertices inside one clause are never joined, not even when their literals agree. A clique must use one vertex per clause, so it can never pick two from the same row.'
    },
    {
      id: 's6c', start: 165, end: 172.5, scene: 'gadget',
      caption: 'A clique of size four picks one true literal per clause.',
      detail: 'A clique of size four must take exactly one vertex from each of the four rows, because vertices within a row are never joined. Compatibility across rows means no two chosen literals contradict, so all four can be set true at once, and each clause is satisfied.',
      narration: 'A clique of size four takes one vertex from each row, and the chosen literals never contradict each other.',
      keyword: 'clique of size four',
      trap: 'A clique larger than the number of clauses is impossible here, since two vertices from one row are never adjacent. That is what bounds the clique size by the clause count.'
    },
    {
      id: 's6d', start: 172.5, end: 180, scene: 'gadget',
      caption: 'Twelve cliques of size four; the largest clique is four.',
      detail: 'The page enumerates every four-subset of the twelve vertices and finds twelve cliques, matching the four satisfying assignments many-to-one. A branch-and-bound search confirms the largest clique has size four, equal to the number of clauses.',
      narration: 'Twelve cliques of size four, and no clique of size five. The largest clique equals the number of clauses.',
      keyword: 'twelve',
      trap: 'The number of cliques and the number of satisfying assignments need not be equal. Only the existence of a clique of size k matches satisfiability, and that is all the reduction claims.'
    },

    /* ---------- scene 7: witness ---------- */
    {
      id: 's7a', start: 180, end: 187.5, scene: 'witness',
      caption: 'Read a clique and you get a satisfying assignment.',
      detail: 'Take a clique of size four and read its literal labels: x1 from the first clause, not x2 from the second, not x3 from the third and x1 again from the fourth. The implied assignment is x1 true, x2 false, x3 false, and the page checks that it satisfies all four clauses.',
      narration: 'Read the labels of a clique and you get an assignment. Here it is one, zero, zero, and it satisfies every clause.',
      keyword: 'assignment',
      trap: 'A clique can name the same variable twice, as this one names x1. The labels must agree, and the page checks that every clique it finds is consistent.'
    },
    {
      id: 's7b', start: 187.5, end: 195, scene: 'witness',
      caption: 'Read an assignment and you get a clique of size four.',
      detail: 'Given a satisfying assignment, each clause contains at least one true literal; pick one such literal per clause. Those four vertices are in different rows and are never opposites, so they form a clique. Both directions are checked over all twelve cliques and all four assignments.',
      narration: 'The other direction works too: each satisfying assignment marks one true literal per clause, and those four vertices are a clique.',
      keyword: 'both directions',
      trap: 'Checking one direction only proves the reduction is not lying in one direction. A reduction must preserve yes and no, so both directions are part of the proof.'
    },
    {
      id: 's7c', start: 195, end: 202.5, scene: 'witness',
      caption: 'An unsatisfiable instance: eight clauses, no assignment.',
      detail: 'The second formula contains all eight clauses over three variables, one for each assignment, and each clause forbids exactly one assignment. No assignment satisfies all eight. Its reduction graph has 24 vertices and 204 edges.',
      narration: 'Eight clauses over three variables, one forbidding each assignment. Nothing satisfies all eight.',
      keyword: 'unsatisfiable',
      trap: 'An unsatisfiable formula is not a broken instance. The reduction must still run on it and must report no clique of size eight.'
    },
    {
      id: 's7d', start: 202.5, end: 210, scene: 'witness',
      caption: 'Its largest clique is seven: one short of the clause count.',
      detail: 'A branch-and-bound search on the 24-vertex graph finds a largest clique of size seven, so no clique of size eight exists and the reduction answers no. The same code answers yes on the first instance, so the reduction is correct in both directions on both instances.',
      narration: 'The largest clique has size seven, so there is no clique of size eight. The reduction answers no, correctly.',
      keyword: 'seven',
      trap: 'The answer is the comparison of the largest clique with the clause count. A graph with a large clique is not the same as a graph with a clique of the required size.'
    },

    /* ---------- scene 8: cover ---------- */
    {
      id: 's8a', start: 210, end: 217.5, scene: 'cover',
      caption: 'The complement graph keeps exactly the missing edges.',
      detail: 'The complement of a graph on n vertices has an edge wherever the original has none. A set of vertices is a clique in the original exactly when no complement edge lies inside it.',
      narration: 'Take the complement: an edge wherever the original graph had none.',
      keyword: 'complement',
      trap: 'The complement has n choose 2 minus m edges, not m. On five vertices that is ten minus the edge count.'
    },
    {
      id: 's8b', start: 217.5, end: 225, scene: 'cover',
      caption: 'A clique of size k is a cover of size n minus k.',
      detail: 'If k vertices form a clique in G, the other n minus k vertices contain no edge of the complement, so they cover every complement edge. Conversely a vertex cover of size n minus k leaves k vertices with no complement edge inside them, which is a clique.',
      narration: 'A clique of size k in the graph is a vertex cover of size n minus k in the complement.',
      keyword: 'n minus k',
      trap: 'The complement is taken of the same graph, not of a reduced graph. Applying the identity after deleting vertices gives the wrong count.'
    },
    {
      id: 's8c', start: 225, end: 232.5, scene: 'cover',
      caption: 'Here the largest clique is three and the cover is two.',
      detail: 'On the five-vertex graph shown, the largest clique has size three — vertices zero, one and two — and the smallest vertex cover of the complement has size two, since the complement is a path of five vertices and needs two vertices to cover its four edges. Three plus two is five.',
      narration: 'Largest clique three, smallest cover of the complement two. Three plus two is the five vertices.',
      keyword: 'three and two',
      trap: 'A minimum vertex cover is not unique. The identity is about the size, so counting covers rather than measuring one is the wrong move.'
    },
    {
      id: 's8d', start: 232.5, end: 240, scene: 'cover',
      caption: 'Checked on all 1088 graphs with four or five vertices.',
      detail: 'The page computes the largest clique of every graph on four vertices and on five vertices, and the smallest vertex cover of its complement, and confirms the two sizes sum to the vertex count in all 1088 cases. That is a check of the identity, not a proof of it.',
      narration: 'The identity holds on all one thousand and eighty-eight graphs with four or five vertices. A check is not a proof, but it is a good reason to trust the derivation.',
      keyword: '1088',
      trap: 'An exhaustive check on small graphs confirms a formula; it does not prove it. The proof is the two-line argument on the previous beat.'
    },

    /* ---------- scene 9: boundary ---------- */
    {
      id: 's9a', start: 240, end: 247.5, scene: 'boundary',
      caption: '2-SAT is in P, and 3-SAT is not known to be.',
      detail: 'A 2-SAT instance has at most two literals per clause. Its implication graph has an edge from not a to b for every clause a or b, and the instance is satisfiable exactly when no variable sits in the same strongly connected component as its negation. That test is polynomial.',
      narration: 'Two literals per clause is a different problem. Build the implication graph and look at its strongly connected components.',
      keyword: '2-SAT',
      trap: '2-SAT is in P. The number of literals per clause changes the complexity class, so "SAT is NP-complete" must never be applied to a 2-SAT instance.'
    },
    {
      id: 's9b', start: 247.5, end: 255, scene: 'boundary',
      caption: 'On 3060 formulas the component test never disagreed.',
      detail: 'The page builds every four-clause 2-CNF formula over three variables that is not a tautology, 3060 of them, and compares the strongly connected component test with a brute-force search over all eight assignments. They agree on every formula.',
      narration: 'Three thousand and sixty formulas, no disagreement between the fast test and brute force.',
      keyword: '3060',
      trap: 'Agreement on small formulas is evidence, not proof. The proof is that the implication graph encodes exactly the propagation a satisfying assignment must obey.'
    },
    {
      id: 's9c', start: 255, end: 262.5, scene: 'boundary',
      caption: 'Clique with k fixed at three is in P as well.',
      detail: 'Deciding whether a graph has a clique of size three means trying every triple, which costs n cubed. For any fixed k the same argument gives n to the k. NP-completeness of CLIQUE treats k as part of the input, so the running time must be polynomial in the input length, which includes k.',
      narration: 'Clique with a fixed size is polynomial. Hardness appears when k is part of the input.',
      keyword: 'fixed k',
      trap: 'CLIQUE is NP-complete and triangle detection is in P. Both statements are true; they are statements about different problems.'
    },
    {
      id: 's9d', start: 262.5, end: 270, scene: 'boundary',
      caption: 'NP-hard is wider than NP-complete.',
      detail: 'NP-hard contains problems outside NP, including undecidable ones such as the halting problem, and problems whose decision form is in NP while the optimisation form is not a decision problem at all. NP-complete is the intersection of NP-hard with NP.',
      narration: 'NP-hard reaches outside NP. NP-complete is what is left when you also require membership in NP.',
      keyword: 'wider',
      trap: 'If a problem is not in NP it cannot be NP-complete, however hard it is. "Not in NP" and "not hard" are different statements.'
    },

    /* ---------- scene 10: exam ---------- */
    {
      id: 's10a', start: 270, end: 277.5, scene: 'exam',
      caption: 'First decide which of the three claims is being made.',
      detail: 'A question about these classes is asking one of three things: whether a problem is in NP, whether it is NP-hard, or whether it is NP-complete. The three have different proofs and different evidence, and reading the claim first prevents most errors.',
      narration: 'Ask first which claim the question is making: membership, hardness, or completeness.',
      keyword: 'three claims',
      trap: 'A question that mentions an NP-complete problem may still be asking only about membership. Read which claim is being made before choosing a technique.'
    },
    {
      id: 's10b', start: 277.5, end: 285, scene: 'exam',
      caption: 'Membership: a verifier, or a reduction into a known member.',
      detail: 'To show a problem is in NP, exhibit a polynomial verifier with a polynomial certificate, or reduce the problem to something already known to be in NP. Both are accepted; the verifier is usually shorter to write down.',
      narration: 'For membership, either write a verifier or reduce to a problem already known to be in NP.',
      keyword: 'verifier',
      trap: 'Reducing into an NP-complete problem proves membership only. It is the commonest half-answer in the whole topic.'
    },
    {
      id: 's10c', start: 285, end: 292.5, scene: 'exam',
      caption: 'Hardness: reduce a known NP-complete problem to yours.',
      detail: 'To show a problem is NP-hard, take a problem known to be NP-complete and reduce it to yours in polynomial time. To show completeness, add membership in NP — usually a verifier. Both halves are needed and each is a separate sentence in the solution.',
      narration: 'For hardness, reduce a known NP-complete problem to yours. For completeness, add the verifier.',
      keyword: 'reduce a known',
      trap: 'A reduction in the wrong direction is the standard wrong answer offered in multiple-choice questions. Check the arrow before the answer.'
    },
    {
      id: 's10d', start: 292.5, end: 300, scene: 'exam',
      caption: 'One polynomial algorithm for one NP-complete problem collapses all three.',
      detail: 'If any NP-complete problem is in P, then every problem in NP is in P, so P equals NP, and every problem in NP reduces to every other nontrivial problem in NP, so NP-complete equals NP as well. The picture collapses to a single class.',
      narration: 'One polynomial algorithm for one NP-complete problem makes P, NP and NP-complete the same class.',
      keyword: 'collapses',
      trap: 'The collapse is conditional. No such algorithm is known, and the statement "if X is in P then P equals NP" is not the statement "X is in P".'
    }
  ]
};
