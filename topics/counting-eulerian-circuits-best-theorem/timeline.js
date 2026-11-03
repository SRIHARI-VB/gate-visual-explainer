/* ==========================================================================
   counting-eulerian-circuits-best-theorem — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   captions.vtt, captions.srt and transcript.md are derived from this file by
   tools/gen-captions.mjs — never edited by hand.

   Every number quoted in a caption is computed by the model in lesson.js and
   printed on the canvas; the two agree because both read the same computation.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'route', n: 1,
      title: 'The postman\'s question',
      start: 0, end: 30,
      objective: 'Turn "walk every street once and come back" into a counting question, and name the object being counted: a legal ordering of the arcs, not a set of them.'
    },
    {
      id: 'criterion', n: 2,
      title: 'First, does a circuit exist at all',
      start: 30, end: 60,
      objective: 'State Euler\'s two conditions for a digraph — in-degree equals out-degree at every vertex, and the arcs lie in one weakly connected piece — and show a graph that fails each one.'
    },
    {
      id: 'naive', n: 3,
      title: 'The answer everyone tries first',
      start: 60, end: 90,
      objective: 'Show that (m − 1)! is not the answer: on the complete digraph on three vertices it gives 120 while only 3 legal rounds exist, because most orderings are not walks.'
    },
    {
      id: 'tree', n: 4,
      title: 'A tree that points at the finish',
      start: 90, end: 120,
      objective: 'Define an arborescence into the root w, count the three of them on the three-vertex digraph, and see that one of the four exit choices is a cycle and must be excluded.'
    },
    {
      id: 'best', n: 5,
      title: 'The BEST theorem',
      start: 120, end: 150,
      objective: 'State ec = t_w times the product of (out-degree − 1) factorial, name what each factor counts, and evaluate it on the three-vertex digraph where both factors are visible.'
    },
    {
      id: 'bowtie', n: 6,
      title: 'The product alone: six rounds at one hub',
      start: 150, end: 180,
      objective: 'On four two-arc loops sharing a hub, t_w is 1 and the whole count is the hub\'s 3 factorial, which is six — and see why it is 3! and not 4!.'
    },
    {
      id: 'both', n: 7,
      title: 'Both factors at once: twenty',
      start: 180, end: 210,
      objective: 'Double one pair of arcs so that t_w rises to 5 and the product to 4, predict 20 circuits from the formula, and confirm 20 by enumerating all eight arcs.'
    },
    {
      id: 'matrix', n: 8,
      title: 'Computing t_w without drawing trees',
      start: 210, end: 240,
      objective: 'Build the directed Laplacian, delete the root row and column, and read t_w off the determinant; check the determinant against the trees counted by hand.'
    },
    {
      id: 'bruijn', n: 9,
      title: 'The de Bruijn graph: exactly two sequences',
      start: 240, end: 270,
      objective: 'Build B(2,3), read t_w = 2 and the product 1 from it, and decode the two circuits into the two cyclic strings that contain every 3-bit word once.'
    },
    {
      id: 'gate', n: 10,
      title: 'What a question actually asks',
      start: 270, end: 300,
      objective: 'Reduce the topic to three question shapes and a four-step procedure, and name the four traps that produce a plausible wrong number.'
    }
  ],

  events: [
    /* ---------------- scene 1: the postman's question ---------------- */
    {
      id: 'e01', scene: 'route', start: 0, end: 6,
      caption: 'A postman must walk every street once and return to the depot.',
      narration: 'Here is a small set of streets. The postman has to walk each one exactly once, and finish where he began. That is the only rule.',
      detail: 'The streets are drawn as arrows because a one-way street can only be walked one way. An undirected street would be two arrows, one in each direction, and that doubling is the first thing a question about a real road network makes you do.',
      keyword: 'every street once'
    },
    {
      id: 'e02', scene: 'route', start: 6, end: 12,
      caption: 'Such a round is called an Euler circuit: every arc once, ending where it started.',
      narration: 'A closed walk that uses every arc exactly once is an Euler circuit. The name is Euler\'s, from the bridges of Koenigsberg in 1736.',
      detail: 'Three words carry the definition and each rules something out. Closed: the last arc must end at the first vertex. Every arc exactly once: not at most once, and not every vertex. Circuit: the walk is a single continuous walk, so consecutive arcs must share a vertex.',
      keyword: 'Euler circuit'
    },
    {
      id: 'e03', scene: 'route', start: 12, end: 18,
      caption: 'Two rounds can use the same eight streets in different orders.',
      narration: 'The same streets support more than one round. Walk the loops in one order, or in another. Both are legal, and they are different rounds.',
      detail: 'Different means: the sequence of arcs differs. If two sequences are rotations of each other — same round, different starting street — they are the same circuit, because a circuit is closed and has no first arc. That convention decides every count on this page.',
      keyword: 'different orders',
      trap: 'A count that depends on where you start is counting walks, not circuits.'
    },
    {
      id: 'e04', scene: 'route', start: 18, end: 24,
      caption: 'So the question is: how many legal orderings of these arcs exist?',
      narration: 'The set of arcs is fixed. What varies is the order. The question "how many rounds" is a question about orderings, which is a counting question.',
      detail: 'This is why the topic sits where it does. Counting orderings is combinatorics; the legality rule is graph theory. Neither subject alone answers it, and the answer needs a structure that knows where the arcs meet.',
      keyword: 'how many legal orderings'
    },
    {
      id: 'e05', scene: 'route', start: 24, end: 30,
      caption: 'This hub with four loops has eight arcs and exactly six rounds.',
      narration: 'Take four two-arc loops meeting at one hub. Eight arcs, and the answer turns out to be six. By the end of the page you will be able to say why without listing them.',
      detail: 'Six is small enough to check by hand and large enough that the two factors of the theorem are both visible on later scenes. Every number on this page is produced by running the graph, not by quoting a table.',
      keyword: 'exactly six rounds'
    },

    /* ---------------- scene 2: the criterion ---------------- */
    {
      id: 'e06', scene: 'criterion', start: 30, end: 36,
      caption: 'Before counting, check that any round exists: in-degree must equal out-degree.',
      narration: 'Every time the postman enters a vertex he must leave it, except at the start, where the two cancel out because the round is closed. So in and out must match everywhere.',
      detail: 'The in-degree of a vertex is the number of arcs pointing at it; the out-degree is the number leaving it. Equal at every vertex is called balanced, and it is necessary for a directed Euler circuit.',
      keyword: 'in-degree must equal out-degree'
    },
    {
      id: 'e07', scene: 'criterion', start: 36, end: 42,
      caption: 'A vertex with two arcs in and one out can be entered twice and left once.',
      narration: 'Here is a graph that fails. One vertex has two arcs arriving and only one leaving. Any round would have to leave it as often as it arrives, and it cannot.',
      detail: 'The failure is local, which is what makes it fast to test: one vertex with unequal counts is enough, and no amount of connectivity repairs it. The two extra arcs arriving have nowhere to go.',
      keyword: 'entered twice and left once',
      trap: 'Balanced is necessary, not sufficient. Two disjoint cycles are balanced and have no single round.'
    },
    {
      id: 'e08', scene: 'criterion', start: 42, end: 48,
      caption: 'Second condition: ignoring direction, the arcs must lie in one piece.',
      narration: 'Balance is not enough. The arcs must also be connected once you forget which way they point. Otherwise a round cannot reach the far piece at all.',
      detail: 'Connected here means weakly connected: treat every arc as an undirected edge and ask whether all vertices that carry an arc are in one component. Vertices with no arc are ignored, since the round never visits them.',
      keyword: 'one piece'
    },
    {
      id: 'e09', scene: 'criterion', start: 48, end: 54,
      caption: 'Two separate cycles are balanced everywhere and still have no round.',
      narration: 'Two cycles with no vertex in common are balanced at every vertex. But a round is one walk, and no walk can jump between them. So the count is zero.',
      detail: 'This is the case that punishes "in equals out, therefore Eulerian". A statement-selection question often offers exactly this pair of conditions and asks which single condition is sufficient on its own — and the answer is neither.',
      keyword: 'no round',
      trap: 'On a digraph, weak connectivity is the condition; strong connectivity is stronger than needed.'
    },
    {
      id: 'e10', scene: 'criterion', start: 54, end: 60,
      caption: 'Both conditions pass, so the graph is Eulerian and the count is at least one.',
      narration: 'When both hold, a round exists — that is Euler\'s theorem, and it is an if and only if. So the count is a positive integer, and the question becomes which integer.',
      detail: 'Existence is settled in time proportional to the number of arcs. Everything after this point is counting, and the counting theorem needs exactly the hypothesis this check established.',
      keyword: 'Eulerian'
    },

    /* ---------------- scene 3: the naive answer ---------------- */
    {
      id: 'e11', scene: 'naive', start: 60, end: 66,
      caption: 'The tempting answer: fix the first arc, then permute the other five.',
      narration: 'Six arcs, one fixed to start with, and the remaining five in any order. Five factorial is one hundred and twenty. That feels like a derivation.',
      detail: 'The reasoning behind it is sound as far as it goes: fixing the first arc removes the rotation, so each circuit is counted once. The error is in what is being permuted. Arcs are not free to be ordered.',
      keyword: 'one hundred and twenty'
    },
    {
      id: 'e12', scene: 'naive', start: 66, end: 72,
      caption: 'But only three rounds exist. Most orderings are not walks.',
      narration: 'The complete digraph on three vertices has three rounds, not a hundred and twenty. So most of those orderings do something a postman cannot: they teleport.',
      detail: 'A permutation of the arcs is a legal round only when each arc begins where the previous one ended. That is one constraint per step, and it removes almost everything the factorial counted.',
      keyword: 'only three rounds'
    },
    {
      id: 'e13', scene: 'naive', start: 72, end: 78,
      caption: 'A permutation is legal only if each arc starts where the last one ended.',
      narration: 'Read the three legal rounds and you see the pattern. In each of them the arcs chain together, vertex by vertex, and the last one lands back at the start.',
      detail: 'This is the whole content of the word walk, and it is why the answer needs a structure that records where arcs meet. The tree on the next scene is exactly that structure.',
      keyword: 'starts where the last one ended',
      trap: 'The factorial answers "how many orders of the arcs", which is a different question from "how many walks".'
    },
    {
      id: 'e14', scene: 'naive', start: 78, end: 84,
      caption: 'So the count needs to know the junctions, not just the number of arcs.',
      narration: 'Any formula that looks only at the number of arcs will fail on some graph. The count depends on the shape of the junctions, and that is what the next quantity measures.',
      detail: 'Compare two graphs with the same number of arcs and different answers. The hub with four loops has eight arcs and six rounds; the doubled three-vertex digraph has eight arcs and twenty rounds. Same m, different answer.',
      keyword: 'the junctions'
    },
    {
      id: 'e15', scene: 'naive', start: 84, end: 90,
      caption: 'The right quantity is a spanning tree, counted.',
      narration: 'What replaces the missing information is a spanning tree of the digraph, with all its arcs pointing at one chosen vertex. Count those, and the missing factor appears.',
      detail: 'The intuition, stated honestly as intuition: at every vertex all but one exit can be taken in any order, and the exit kept back is the one that leads along the tree toward the finish. The tree is the set of kept-back exits.',
      keyword: 'a spanning tree'
    },

    /* ---------------- scene 4: the arborescence ---------------- */
    {
      id: 'e16', scene: 'tree', start: 90, end: 96,
      caption: 'An arborescence into w is a spanning tree whose arcs all point at w.',
      narration: 'Take every vertex. Give each one except the root exactly one arc leaving it, chosen so that following the arcs always ends at the root. That is an arborescence into the root.',
      detail: 'Two properties together: every vertex except w has exactly one outgoing tree arc, and every vertex reaches w by following them. The first alone allows a cycle, which is why the second is not redundant.',
      keyword: 'all point at w'
    },
    {
      id: 'e17', scene: 'tree', start: 96, end: 102,
      caption: 'On the three-vertex digraph there are four exit choices and three trees.',
      narration: 'Two vertices need an exit each, and each has two arcs to choose from. Four combinations. Three of them reach the root and one does not.',
      detail: 'The four are: both point straight at the root; vertex one points at the root and vertex two at vertex one; the mirror of that; and vertex one pointing at vertex two while vertex two points at vertex one.',
      keyword: 'four exit choices'
    },
    {
      id: 'e18', scene: 'tree', start: 102, end: 108,
      caption: 'The fourth choice is a cycle: neither of its vertices can reach the root.',
      narration: 'That fourth combination gives vertex one pointing at vertex two and vertex two pointing at vertex one. They chase each other and never arrive. So it is not a tree.',
      detail: 'This is the single most common miscount on the topic: multiplying the out-degrees and stopping. The product counts functions from vertices to exits; a tree is a function whose functional graph has one sink and no cycles.',
      keyword: 'a cycle',
      trap: 'Multiplying out-degrees counts exit choices, not trees. The cyclic choices must be subtracted.'
    },
    {
      id: 'e19', scene: 'tree', start: 108, end: 114,
      caption: 'So t_w is three, and the subtraction is the whole content of "tree".',
      narration: 'The number of arborescences into the root is written t sub w. Here it is three. Nothing about this count mentions walks; it is a property of the digraph alone.',
      detail: 'The general fact worth carrying: on a connected Eulerian digraph, t sub w is the same for every choice of root. That is why the theorem can name any vertex as w and still get one answer.',
      keyword: 't sub w is three'
    },
    {
      id: 'e20', scene: 'tree', start: 114, end: 120,
      caption: 'The same three trees, and the same t_w, whichever vertex is the root.',
      narration: 'Choose a different root and the three trees reappear, reflected. The count is unchanged. On an Eulerian digraph the root is a free choice.',
      detail: 'The reason is a matrix fact rather than a picture: on a balanced digraph every cofactor of the Laplacian is equal. The determinant scene later uses exactly this, and it is why one determinant answers for every root at once.',
      keyword: 'whichever vertex is the root'
    },

    /* ---------------- scene 5: the BEST theorem ---------------- */
    {
      id: 'e21', scene: 'best', start: 120, end: 126,
      caption: 'The BEST theorem: ec = t_w times the product of (out-degree − 1) factorial.',
      narration: 'Here is the theorem. The number of Euler circuits equals the number of arborescences into the root, multiplied by, for every vertex, the factorial of one less than its out-degree.',
      detail: 'The name is an acronym of de Bruijn, van Aardenne-Ehrenfest, Smith and Tutte. Van Aardenne-Ehrenfest and de Bruijn proved the general case in 1951; Smith and Tutte had proved the special case where every out-degree is 2, in 1941.',
      keyword: 'BEST theorem'
    },
    {
      id: 'e22', scene: 'best', start: 126, end: 132,
      caption: 'The tree says which exit is kept back; the factorial orders the rest.',
      narration: 'Two factors, two jobs. The tree chooses, at every vertex, the exit that is held until last. The factorial then orders all the other exits of that vertex.',
      detail: 'This is why the factor is out-degree minus one rather than out-degree: one exit is spoken for by the tree. At the root the bookkeeping is different but the factor is the same, and the remark on the next caption says why.',
      keyword: 'which exit is kept back'
    },
    {
      id: 'e23', scene: 'best', start: 132, end: 138,
      caption: 'On the three-vertex digraph: t_w is three, every factor is one, so three.',
      narration: 'Every vertex has out-degree two, so every factorial is one factorial, which is one. The product is one, the tree count is three, and the answer is three.',
      detail: 'That agreement is the point of the next few scenes: the formula reproduces a number that brute force also produces. A formula you have not checked against an enumeration is a formula you have not yet used.',
      keyword: 'so three'
    },
    {
      id: 'e24', scene: 'best', start: 138, end: 144,
      caption: 'The root contributes (out-degree − 1)! too, though its tree edge is the last exit.',
      narration: 'The root is the exception that keeps the formula uniform. Its tree exit is not chosen from its own arcs; instead, fixing the first arc removes one rotation, and the two effects cancel to the same factorial.',
      detail: 'The count is therefore independent of which arc is fixed as the first, and independent of the root. A question that fixes a starting arc and a question that fixes a starting vertex get the same number of circuits, because a circuit has no first arc.',
      keyword: 'the root'
    },
    {
      id: 'e25', scene: 'best', start: 144, end: 150,
      caption: 'Hypotheses: Eulerian, and circuits counted up to rotation.',
      narration: 'Two conditions travel with the formula. The digraph must be Eulerian, and the circuits must be counted as cyclic objects: a rotation is the same circuit. Change either and the number changes.',
      detail: 'Counting labelled starting points multiplies the answer by the number of arcs. Counting an undirected graph is a different and much harder problem — the formula does not transfer, and a later scene says so plainly.',
      keyword: 'up to rotation',
      trap: 'The formula is for digraphs. For undirected graphs the count is not given by this product.'
    },

    /* ---------------- scene 6: the product alone ---------------- */
    {
      id: 'e26', scene: 'bowtie', start: 150, end: 156,
      caption: 'Four two-arc loops at one hub: out-degree four at the hub, one elsewhere.',
      narration: 'Here is the hub with four loops. Every leaf has out-degree one, so every factorial for a leaf is zero factorial, which is one. All the weight sits on the hub.',
      detail: 'Zero factorial is one by definition, and that definition is doing real work here: it says a vertex with one exit has exactly one way to order its exits. A learner who treats 0! as 0 gets a product of zero.',
      keyword: 'out-degree four at the hub',
      trap: 'Zero factorial is 1, not 0. A leaf factor is one, not zero.'
    },
    {
      id: 'e27', scene: 'bowtie', start: 156, end: 162,
      caption: 'Only one arborescence exists: every leaf must point at the hub.',
      narration: 'A leaf has one arc leaving it, and that arc goes to the hub. So there is nothing to choose: one tree, and t sub w is one. The whole count is the hub\'s factorial.',
      detail: 'This is the cleanest illustration of the two factors being independent. Here one of them is one, so the other alone produces the answer, and the answer is easy to verify by listing.',
      keyword: 'one arborescence'
    },
    {
      id: 'e28', scene: 'bowtie', start: 162, end: 168,
      caption: 'The hub\'s exits can be ordered in 3! = 6 ways, so six rounds.',
      narration: 'The hub has four exits. One is kept back by the tree, and the other three can be taken in any order: three factorial is six. Six rounds.',
      detail: 'The six are exactly the six cyclic orders of four loops, which is four factorial divided by four. Both descriptions give six, and the equality is the same division by the number of rotations.',
      keyword: '3! = 6'
    },
    {
      id: 'e29', scene: 'bowtie', start: 168, end: 174,
      caption: 'The six rounds, listed: which loop is walked first, second, third.',
      narration: 'Listing them confirms it. Fix the first loop, then the remaining three loops appear in all six orders, and every listing is a legal round.',
      detail: 'Fix the first loop rather than the first arc and the enumeration is six lines, not twenty-four. That is the rotation convention doing practical work: it is what lets a person check the theorem by hand in under a minute.',
      keyword: 'listed'
    },
    {
      id: 'e30', scene: 'bowtie', start: 174, end: 180,
      caption: 'It is 3! and not 4!, because fixing one loop removes the rotation.',
      narration: 'Four factorial is twenty-four, and that counts each round four times, once for each loop you could have started on. Dividing by four leaves six, which is three factorial.',
      detail: 'This is the same division that turns (m − 1)! into a plausible guess on the previous scene. The difference is that here the division is exact and justified, because every round really does pass through the hub four times.',
      keyword: 'not 4!',
      trap: '4! = 24 counts each round four times. The formula divides by the root out-degree implicitly.'
    },

    /* ---------------- scene 7: both factors ---------------- */
    {
      id: 'e31', scene: 'both', start: 180, end: 186,
      caption: 'Double the arcs between two vertices: out-degrees become three, three, two.',
      narration: 'Now take the three-vertex digraph and add a second arc from the first vertex to the second, and a second one back. The arc count rises from six to eight.',
      detail: 'Parallel arcs are allowed and are not a technicality: a road network has two streets between the same junctions, and a question about a multigraph is a question about this page. Every count here treats arcs as distinguishable.',
      keyword: 'three, three, two'
    },
    {
      id: 'e32', scene: 'both', start: 186, end: 192,
      caption: 'The tree count rises to five, because a doubled arc doubles a choice.',
      narration: 'The second vertex now has three arcs to choose from when it decides which one leaves it. The four exit combinations become six, and one of them is still a cycle, so five trees.',
      detail: 'Six minus one is five. The subtraction is the same subtraction as before: the single cyclic choice. This is the case where a naive product of out-degrees gives six and the right answer is five, which is exactly the off-by-one a question can be built around.',
      keyword: 'five'
    },
    {
      id: 'e33', scene: 'both', start: 192, end: 198,
      caption: 'The product is 2! × 2! × 1! = 4.',
      narration: 'Two vertices have out-degree three, so each contributes two factorial, which is two. The third has out-degree two, contributing one. The product is four.',
      detail: 'The product is computed vertex by vertex and then multiplied. A useful habit: write the out-degrees in a row, subtract one from each, write the factorials under them, and only then multiply. It makes an arithmetic slip visible.',
      keyword: 'four'
    },
    {
      id: 'e34', scene: 'both', start: 198, end: 204,
      caption: 'So 5 × 4 = 20 rounds, and enumerating all eight arcs agrees.',
      narration: 'Five trees times four orderings gives twenty. A brute-force walk over all eight arcs finds twenty circuits, and the two lists match circuit for circuit.',
      detail: 'This is the check that makes the page trustworthy rather than persuasive. The enumeration is written in the lesson and run when the page loads; it is not a number typed into a caption.',
      keyword: '20'
    },
    {
      id: 'e35', scene: 'both', start: 204, end: 210,
      caption: 'Neither factor alone is the answer: five is not twenty, and four is not twenty.',
      narration: 'A question that offers five, four and twenty as options is testing whether you know that the answer is the product. Each factor is a real quantity, and each is the wrong answer on its own.',
      detail: 'The same pattern appears in the exam traps on the GATE patterns tab: a distractor that is t sub w, a distractor that is the product, and the answer. Knowing which is which is worth more than remembering the formula.',
      keyword: 'the product',
      trap: 'Answering t_w, or the product, instead of their product, is the most common single error.'
    },

    /* ---------------- scene 8: the matrix-tree theorem ---------------- */
    {
      id: 'e36', scene: 'matrix', start: 210, end: 216,
      caption: 't_w is computed by a determinant, not by drawing trees.',
      narration: 'Drawing trees works for three vertices and stops working at ten. The directed Matrix-Tree theorem gives the same number from one determinant, whatever the size.',
      detail: 'The theorem is due to Tutte in its directed form, and it is the tool the BEST theorem is actually used with: it turns a count of trees into an integer computed in polynomial time.',
      keyword: 'a determinant'
    },
    {
      id: 'e37', scene: 'matrix', start: 216, end: 222,
      caption: 'Build the Laplacian: in-degrees on the diagonal, minus the arc counts.',
      narration: 'Write a matrix. The diagonal entry of a vertex is its in-degree. Off the diagonal, entry row v column u is minus the number of arcs from u to v.',
      detail: 'Row sums are zero on a balanced digraph, which is the property the next step exploits. In-degrees, not out-degrees, is what this version needs; the two agree here only because the graph is Eulerian.',
      keyword: 'in-degrees on the diagonal',
      trap: 'Using out-degrees on the diagonal of the in-tree Laplacian gives a different matrix and a wrong count on an unbalanced graph.'
    },
    {
      id: 'e38', scene: 'matrix', start: 222, end: 228,
      caption: 'Delete the root\'s row and column, and take the determinant.',
      narration: 'Cross out the row and the column belonging to the root. What is left is a square matrix one size smaller, and its determinant is exactly t sub w.',
      detail: 'The determinant is an integer, and it is never negative on a graph. Exact integer elimination, rather than floating point, is what the lesson uses, so a value like five or sixteen is exact and not a rounded decimal.',
      keyword: 'the determinant'
    },
    {
      id: 'e39', scene: 'matrix', start: 228, end: 234,
      caption: 'On the de Bruijn graph the reduced determinant is 2, matching the two trees.',
      narration: 'Four vertices, so a three by three determinant. Its value is two, and the two arborescences we can draw by hand are exactly two. The determinant and the drawing agree.',
      detail: 'Two independent routes to one number is the standard this page holds itself to. The trees are counted by enumerating exit choices, the determinant by eliminating rows, and the two are compared in the page\'s own checks.',
      keyword: '2'
    },
    {
      id: 'e40', scene: 'matrix', start: 234, end: 240,
      caption: 'One, three, five, two: four graphs, four determinants.',
      narration: 'The hub gives one, the three-vertex digraph three, the doubled version five, and the de Bruijn graph two. Each is one determinant of a matrix you can write down in a minute.',
      detail: 'That is the whole computational content of the topic: balance check, one determinant, a product of factorials. Everything else on this page is either a convention or a trap.',
      keyword: 'four determinants'
    },

    /* ---------------- scene 9: de Bruijn ---------------- */
    {
      id: 'e41', scene: 'bruijn', start: 240, end: 246,
      caption: 'The de Bruijn graph B(2,3): four vertices, eight arcs, one per 3-bit word.',
      narration: 'Vertices are the four two-bit words. For each three-bit word, draw an arc from its first two bits to its last two. Eight words, eight arcs.',
      detail: 'This graph is where the theorem earns its name. Van Aardenne-Ehrenfest and de Bruijn built the proof for exactly this object, and the count of de Bruijn sequences is a corollary of the count of Euler circuits.',
      keyword: 'B(2,3)'
    },
    {
      id: 'e42', scene: 'bruijn', start: 246, end: 252,
      caption: 'Every vertex has two arcs in and two out, so the graph is Eulerian.',
      narration: 'Each two-bit word extends to two three-bit words on the right and is extended by two on the left. So two arcs leave and two arrive at every vertex, and the graph is balanced and connected.',
      detail: 'Connectivity holds because the shift map links the words: from any word you can reach any other by appending the right bits. So Euler\'s criterion passes and a circuit exists.',
      keyword: 'Eulerian'
    },
    {
      id: 'e43', scene: 'bruijn', start: 252, end: 258,
      caption: 't_w is 2 and the product is 1, so exactly two circuits.',
      narration: 'Every out-degree is two, so every factorial is one. The tree count is two, from the determinant. Two times one is two circuits, and there are no others.',
      detail: 'Two is a small answer for an eight-arc graph, and that is the point: the theorem turns an enumeration over eight factorial candidate orders into one determinant and one product.',
      keyword: 'exactly two circuits'
    },
    {
      id: 'e44', scene: 'bruijn', start: 258, end: 264,
      caption: 'Decoded, the two circuits are 00010111 and 00011101.',
      narration: 'Each circuit walks the arcs in an order. Write down the bit each arc appends, and you get an eight-bit string. The two circuits give two strings.',
      detail: 'The string is read cyclically: its end joins its beginning. So the eight rotations of a string are the same object, which is exactly the rotation convention the theorem counts with. The two strings are not rotations of each other.',
      keyword: '00010111 and 00011101'
    },
    {
      id: 'e45', scene: 'bruijn', start: 264, end: 270,
      caption: 'Each string contains all eight 3-bit words exactly once.',
      narration: 'Take either string, read every window of three consecutive bits, and you get all eight words, each exactly once. That property is what makes it a de Bruijn sequence.',
      detail: 'This is the counting content behind a familiar exam fact: the number of de Bruijn sequences of order n over a k-letter alphabet is not k factorial to the something. It is a count of Euler circuits, and the theorem is how it is computed.',
      keyword: 'all eight 3-bit words',
      trap: 'A de Bruijn sequence is counted up to rotation, so its eight rotations are one sequence, not eight.'
    },

    /* ---------------- scene 10: what a question asks ---------------- */
    {
      id: 'e46', scene: 'gate', start: 270, end: 276,
      caption: 'Shape one: is this digraph Eulerian? Balance, then connectivity.',
      narration: 'The first shape gives a graph and asks whether a round exists. Count in and out at every vertex, then check that the arcs lie in one piece when direction is ignored.',
      detail: 'Answer with the failing vertex if there is one. A question that says "justify" wants the vertex and its two counts, not the word no.',
      keyword: 'is this digraph Eulerian'
    },
    {
      id: 'e47', scene: 'gate', start: 276, end: 282,
      caption: 'Shape two: how many circuits? One determinant, then the factorials.',
      narration: 'The second shape asks for the number. Write the Laplacian, delete the root, take the determinant, multiply by the factorials of out-degree minus one.',
      detail: 'State the convention in the answer: circuits up to rotation. If the question says "starting with a given arc", the number is the same, and saying so is worth a mark.',
      keyword: 'how many circuits',
      trap: 'Applying the formula without checking balance: on a non-Eulerian graph the answer is zero, whatever the determinant says.'
    },
    {
      id: 'e48', scene: 'gate', start: 282, end: 288,
      caption: 'Shape three: how many arborescences into a vertex? That is one determinant.',
      narration: 'The third shape asks for the tree count on its own. That is the same determinant with no factorial product, and on an Eulerian graph the answer does not depend on which vertex you were given.',
      detail: 'This shape is where a learner who memorised only the BEST formula loses the mark, because the question stops one step earlier. The determinant is the shared tool, and it is worth being able to write it from scratch.',
      keyword: 'one determinant'
    },
    {
      id: 'e49', scene: 'gate', start: 288, end: 294,
      caption: 'The four traps: undirected input, rotations, factorials of out-degree, balance.',
      narration: 'Four traps produce plausible numbers. Treating an undirected graph with the product. Counting rotations separately. Using out-degree instead of out-degree minus one. Forgetting to check balance first.',
      detail: 'On an undirected graph, each street is two arcs, and the count of undirected Euler circuits is a genuinely harder problem; the product does not answer it. On a graph with a vertex of out-degree one, out-degree factorial gives one, which happens to agree — so the trap only shows itself on a vertex of out-degree three or more.',
      keyword: 'four traps'
    },
    {
      id: 'e50', scene: 'gate', start: 294, end: 300,
      caption: 'Draw it, check the balance, take one determinant, multiply, state the convention.',
      narration: 'That is the whole method, and it fits in one line. Everything else on this page is a reason why the line is correct.',
      detail: 'The lesson has computed every number it shows: three, six, twenty, two and two hundred and fifty-six, each by the formula and again by enumeration or by a second determinant. A formula used without a check is a guess with notation.',
      keyword: 'one line'
    }
  ]
};
