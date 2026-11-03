# Counting Eulerian Circuits Best Theorem — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/counting-eulerian-circuits-best-theorem/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 50 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. The postman's question

*0:00 – 0:30 · objective: Turn "walk every street once and come back" into a counting question, and name the object being counted: a legal ordering of the arcs, not a set of them.*

**0:00–0:06** — Here is a small set of streets. The postman has to walk each one exactly once, and finish where he began. That is the only rule.

> Caption: A postman must walk every street once and return to the depot.

**0:06–0:12** — A closed walk that uses every arc exactly once is an Euler circuit. The name is Euler's, from the bridges of Koenigsberg in 1736.

> Caption: Such a round is called an Euler circuit: every arc once, ending where it started.

**0:12–0:18** — The same streets support more than one round. Walk the loops in one order, or in another. Both are legal, and they are different rounds.

> Caption: Two rounds can use the same eight streets in different orders.

Exam-trap caption mode adds: *A count that depends on where you start is counting walks, not circuits.*

**0:18–0:24** — The set of arcs is fixed. What varies is the order. The question "how many rounds" is a question about orderings, which is a counting question.

> Caption: So the question is: how many legal orderings of these arcs exist?

**0:24–0:30** — Take four two-arc loops meeting at one hub. Eight arcs, and the answer turns out to be six. By the end of the page you will be able to say why without listing them.

> Caption: This hub with four loops has eight arcs and exactly six rounds.

## Scene 2. First, does a circuit exist at all

*0:30 – 1:00 · objective: State Euler's two conditions for a digraph — in-degree equals out-degree at every vertex, and the arcs lie in one weakly connected piece — and show a graph that fails each one.*

**0:30–0:36** — Every time the postman enters a vertex he must leave it, except at the start, where the two cancel out because the round is closed. So in and out must match everywhere.

> Caption: Before counting, check that any round exists: in-degree must equal out-degree.

**0:36–0:42** — Here is a graph that fails. One vertex has two arcs arriving and only one leaving. Any round would have to leave it as often as it arrives, and it cannot.

> Caption: A vertex with two arcs in and one out can be entered twice and left once.

Exam-trap caption mode adds: *Balanced is necessary, not sufficient. Two disjoint cycles are balanced and have no single round.*

**0:42–0:48** — Balance is not enough. The arcs must also be connected once you forget which way they point. Otherwise a round cannot reach the far piece at all.

> Caption: Second condition: ignoring direction, the arcs must lie in one piece.

**0:48–0:54** — Two cycles with no vertex in common are balanced at every vertex. But a round is one walk, and no walk can jump between them. So the count is zero.

> Caption: Two separate cycles are balanced everywhere and still have no round.

Exam-trap caption mode adds: *On a digraph, weak connectivity is the condition; strong connectivity is stronger than needed.*

**0:54–1:00** — When both hold, a round exists — that is Euler's theorem, and it is an if and only if. So the count is a positive integer, and the question becomes which integer.

> Caption: Both conditions pass, so the graph is Eulerian and the count is at least one.

## Scene 3. The answer everyone tries first

*1:00 – 1:30 · objective: Show that (m − 1)! is not the answer: on the complete digraph on three vertices it gives 120 while only 3 legal rounds exist, because most orderings are not walks.*

**1:00–1:06** — Six arcs, one fixed to start with, and the remaining five in any order. Five factorial is one hundred and twenty. That feels like a derivation.

> Caption: The tempting answer: fix the first arc, then permute the other five.

**1:06–1:12** — The complete digraph on three vertices has three rounds, not a hundred and twenty. So most of those orderings do something a postman cannot: they teleport.

> Caption: But only three rounds exist. Most orderings are not walks.

**1:12–1:18** — Read the three legal rounds and you see the pattern. In each of them the arcs chain together, vertex by vertex, and the last one lands back at the start.

> Caption: A permutation is legal only if each arc starts where the last one ended.

Exam-trap caption mode adds: *The factorial answers "how many orders of the arcs", which is a different question from "how many walks".*

**1:18–1:24** — Any formula that looks only at the number of arcs will fail on some graph. The count depends on the shape of the junctions, and that is what the next quantity measures.

> Caption: So the count needs to know the junctions, not just the number of arcs.

**1:24–1:30** — What replaces the missing information is a spanning tree of the digraph, with all its arcs pointing at one chosen vertex. Count those, and the missing factor appears.

> Caption: The right quantity is a spanning tree, counted.

## Scene 4. A tree that points at the finish

*1:30 – 2:00 · objective: Define an arborescence into the root w, count the three of them on the three-vertex digraph, and see that one of the four exit choices is a cycle and must be excluded.*

**1:30–1:36** — Take every vertex. Give each one except the root exactly one arc leaving it, chosen so that following the arcs always ends at the root. That is an arborescence into the root.

> Caption: An arborescence into w is a spanning tree whose arcs all point at w.

**1:36–1:42** — Two vertices need an exit each, and each has two arcs to choose from. Four combinations. Three of them reach the root and one does not.

> Caption: On the three-vertex digraph there are four exit choices and three trees.

**1:42–1:48** — That fourth combination gives vertex one pointing at vertex two and vertex two pointing at vertex one. They chase each other and never arrive. So it is not a tree.

> Caption: The fourth choice is a cycle: neither of its vertices can reach the root.

Exam-trap caption mode adds: *Multiplying out-degrees counts exit choices, not trees. The cyclic choices must be subtracted.*

**1:48–1:54** — The number of arborescences into the root is written t sub w. Here it is three. Nothing about this count mentions walks; it is a property of the digraph alone.

> Caption: So t_w is three, and the subtraction is the whole content of "tree".

**1:54–2:00** — Choose a different root and the three trees reappear, reflected. The count is unchanged. On an Eulerian digraph the root is a free choice.

> Caption: The same three trees, and the same t_w, whichever vertex is the root.

## Scene 5. The BEST theorem

*2:00 – 2:30 · objective: State ec = t_w times the product of (out-degree − 1) factorial, name what each factor counts, and evaluate it on the three-vertex digraph where both factors are visible.*

**2:00–2:06** — Here is the theorem. The number of Euler circuits equals the number of arborescences into the root, multiplied by, for every vertex, the factorial of one less than its out-degree.

> Caption: The BEST theorem: ec = t_w times the product of (out-degree − 1) factorial.

**2:06–2:12** — Two factors, two jobs. The tree chooses, at every vertex, the exit that is held until last. The factorial then orders all the other exits of that vertex.

> Caption: The tree says which exit is kept back; the factorial orders the rest.

**2:12–2:18** — Every vertex has out-degree two, so every factorial is one factorial, which is one. The product is one, the tree count is three, and the answer is three.

> Caption: On the three-vertex digraph: t_w is three, every factor is one, so three.

**2:18–2:24** — The root is the exception that keeps the formula uniform. Its tree exit is not chosen from its own arcs; instead, fixing the first arc removes one rotation, and the two effects cancel to the same factorial.

> Caption: The root contributes (out-degree − 1)! too, though its tree edge is the last exit.

**2:24–2:30** — Two conditions travel with the formula. The digraph must be Eulerian, and the circuits must be counted as cyclic objects: a rotation is the same circuit. Change either and the number changes.

> Caption: Hypotheses: Eulerian, and circuits counted up to rotation.

Exam-trap caption mode adds: *The formula is for digraphs. For undirected graphs the count is not given by this product.*

## Scene 6. The product alone: six rounds at one hub

*2:30 – 3:00 · objective: On four two-arc loops sharing a hub, t_w is 1 and the whole count is the hub's 3 factorial, which is six — and see why it is 3! and not 4!.*

**2:30–2:36** — Here is the hub with four loops. Every leaf has out-degree one, so every factorial for a leaf is zero factorial, which is one. All the weight sits on the hub.

> Caption: Four two-arc loops at one hub: out-degree four at the hub, one elsewhere.

Exam-trap caption mode adds: *Zero factorial is 1, not 0. A leaf factor is one, not zero.*

**2:36–2:42** — A leaf has one arc leaving it, and that arc goes to the hub. So there is nothing to choose: one tree, and t sub w is one. The whole count is the hub's factorial.

> Caption: Only one arborescence exists: every leaf must point at the hub.

**2:42–2:48** — The hub has four exits. One is kept back by the tree, and the other three can be taken in any order: three factorial is six. Six rounds.

> Caption: The hub's exits can be ordered in 3! = 6 ways, so six rounds.

**2:48–2:54** — Listing them confirms it. Fix the first loop, then the remaining three loops appear in all six orders, and every listing is a legal round.

> Caption: The six rounds, listed: which loop is walked first, second, third.

**2:54–3:00** — Four factorial is twenty-four, and that counts each round four times, once for each loop you could have started on. Dividing by four leaves six, which is three factorial.

> Caption: It is 3! and not 4!, because fixing one loop removes the rotation.

Exam-trap caption mode adds: *4! = 24 counts each round four times. The formula divides by the root out-degree implicitly.*

## Scene 7. Both factors at once: twenty

*3:00 – 3:30 · objective: Double one pair of arcs so that t_w rises to 5 and the product to 4, predict 20 circuits from the formula, and confirm 20 by enumerating all eight arcs.*

**3:00–3:06** — Now take the three-vertex digraph and add a second arc from the first vertex to the second, and a second one back. The arc count rises from six to eight.

> Caption: Double the arcs between two vertices: out-degrees become three, three, two.

**3:06–3:12** — The second vertex now has three arcs to choose from when it decides which one leaves it. The four exit combinations become six, and one of them is still a cycle, so five trees.

> Caption: The tree count rises to five, because a doubled arc doubles a choice.

**3:12–3:18** — Two vertices have out-degree three, so each contributes two factorial, which is two. The third has out-degree two, contributing one. The product is four.

> Caption: The product is 2! × 2! × 1! = 4.

**3:18–3:24** — Five trees times four orderings gives twenty. A brute-force walk over all eight arcs finds twenty circuits, and the two lists match circuit for circuit.

> Caption: So 5 × 4 = 20 rounds, and enumerating all eight arcs agrees.

**3:24–3:30** — A question that offers five, four and twenty as options is testing whether you know that the answer is the product. Each factor is a real quantity, and each is the wrong answer on its own.

> Caption: Neither factor alone is the answer: five is not twenty, and four is not twenty.

Exam-trap caption mode adds: *Answering t_w, or the product, instead of their product, is the most common single error.*

## Scene 8. Computing t_w without drawing trees

*3:30 – 4:00 · objective: Build the directed Laplacian, delete the root row and column, and read t_w off the determinant; check the determinant against the trees counted by hand.*

**3:30–3:36** — Drawing trees works for three vertices and stops working at ten. The directed Matrix-Tree theorem gives the same number from one determinant, whatever the size.

> Caption: t_w is computed by a determinant, not by drawing trees.

**3:36–3:42** — Write a matrix. The diagonal entry of a vertex is its in-degree. Off the diagonal, entry row v column u is minus the number of arcs from u to v.

> Caption: Build the Laplacian: in-degrees on the diagonal, minus the arc counts.

Exam-trap caption mode adds: *Using out-degrees on the diagonal of the in-tree Laplacian gives a different matrix and a wrong count on an unbalanced graph.*

**3:42–3:48** — Cross out the row and the column belonging to the root. What is left is a square matrix one size smaller, and its determinant is exactly t sub w.

> Caption: Delete the root's row and column, and take the determinant.

**3:48–3:54** — Four vertices, so a three by three determinant. Its value is two, and the two arborescences we can draw by hand are exactly two. The determinant and the drawing agree.

> Caption: On the de Bruijn graph the reduced determinant is 2, matching the two trees.

**3:54–4:00** — The hub gives one, the three-vertex digraph three, the doubled version five, and the de Bruijn graph two. Each is one determinant of a matrix you can write down in a minute.

> Caption: One, three, five, two: four graphs, four determinants.

## Scene 9. The de Bruijn graph: exactly two sequences

*4:00 – 4:30 · objective: Build B(2,3), read t_w = 2 and the product 1 from it, and decode the two circuits into the two cyclic strings that contain every 3-bit word once.*

**4:00–4:06** — Vertices are the four two-bit words. For each three-bit word, draw an arc from its first two bits to its last two. Eight words, eight arcs.

> Caption: The de Bruijn graph B(2,3): four vertices, eight arcs, one per 3-bit word.

**4:06–4:12** — Each two-bit word extends to two three-bit words on the right and is extended by two on the left. So two arcs leave and two arrive at every vertex, and the graph is balanced and connected.

> Caption: Every vertex has two arcs in and two out, so the graph is Eulerian.

**4:12–4:18** — Every out-degree is two, so every factorial is one. The tree count is two, from the determinant. Two times one is two circuits, and there are no others.

> Caption: t_w is 2 and the product is 1, so exactly two circuits.

**4:18–4:24** — Each circuit walks the arcs in an order. Write down the bit each arc appends, and you get an eight-bit string. The two circuits give two strings.

> Caption: Decoded, the two circuits are 00010111 and 00011101.

**4:24–4:30** — Take either string, read every window of three consecutive bits, and you get all eight words, each exactly once. That property is what makes it a de Bruijn sequence.

> Caption: Each string contains all eight 3-bit words exactly once.

Exam-trap caption mode adds: *A de Bruijn sequence is counted up to rotation, so its eight rotations are one sequence, not eight.*

## Scene 10. What a question actually asks

*4:30 – 5:00 · objective: Reduce the topic to three question shapes and a four-step procedure, and name the four traps that produce a plausible wrong number.*

**4:30–4:36** — The first shape gives a graph and asks whether a round exists. Count in and out at every vertex, then check that the arcs lie in one piece when direction is ignored.

> Caption: Shape one: is this digraph Eulerian? Balance, then connectivity.

**4:36–4:42** — The second shape asks for the number. Write the Laplacian, delete the root, take the determinant, multiply by the factorials of out-degree minus one.

> Caption: Shape two: how many circuits? One determinant, then the factorials.

Exam-trap caption mode adds: *Applying the formula without checking balance: on a non-Eulerian graph the answer is zero, whatever the determinant says.*

**4:42–4:48** — The third shape asks for the tree count on its own. That is the same determinant with no factorial product, and on an Eulerian graph the answer does not depend on which vertex you were given.

> Caption: Shape three: how many arborescences into a vertex? That is one determinant.

**4:48–4:54** — Four traps produce plausible numbers. Treating an undirected graph with the product. Counting rotations separately. Using out-degree instead of out-degree minus one. Forgetting to check balance first.

> Caption: The four traps: undirected input, rotations, factorials of out-degree, balance.

**4:54–5:00** — That is the whole method, and it fits in one line. Everything else on this page is a reason why the line is correct.

> Caption: Draw it, check the balance, take one determinant, multiply, state the convention.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
