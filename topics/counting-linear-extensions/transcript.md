# Counting Linear Extensions — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/counting-linear-extensions/index.html`
- Total duration: 5:36 (336 seconds), 11 scenes, 44 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A partial order fixes only some of the order

*0:00 – 0:30 · objective: see a linear extension as an ordering that keeps every arrow pointing forward*

**0:00–0:08** — Four tasks and three constraints. A before B. A before C. And both B and C before D. That is a partial order: some pairs are ordered and the rest are free.

> Caption: Four tasks and three constraints: A before B, A before C, and both B and C before D.

**0:08–0:16** — A B C D is legal. Read every arrow against the ordering and each one still points forward. A comes before B, A before C, B before C, C before D.

> Caption: A B C D is legal: read every arrow against the ordering and each one still points forward.

**0:16–0:23** — B A C D is not legal. The constraint A before B is broken, so this ordering is not a linear extension of the partial order.

> Caption: B A C D is not legal. The constraint A before B is broken, so this ordering is not a linear extension.

Exam-trap caption mode adds: *A valid topological sort is not a set of independent choices at each step. The count is over whole orderings, so a greedy walk that makes one choice early still has to be counted with every alternative.*

**0:23–0:30** — A linear extension is a full ordering in which every constraint still points forward. This diamond has exactly two: A B C D and A C B D.

> Caption: A linear extension is a full ordering in which every constraint still points forward. This diamond has exactly two.

## Scene 2. The smallest cases, and the two ends of the range

*0:30 – 1:00 · objective: count two and three elements, and see that the answer lies between 1 and n!*

**0:30–0:37** — Two elements with no constraint. A B and B A, so two orderings. Add the constraint A before B and only one is left.

> Caption: Two elements with no constraint: A B and B A, so two orderings. Add A before B and only one is left.

**0:37–0:44** — Three elements with no constraint give six. With A before both others, two. As a chain of three, one.

> Caption: Three elements with no constraint give six. With A first, two. As a chain, one.

**0:44–0:52** — The count always lies between one and n factorial, and both ends are reached: a chain gives one, and an antichain, with no constraints at all, gives n factorial.

> Caption: The count always lies between 1 and n factorial, and both ends are reached.

**0:52–1:00** — Adding a constraint can only lower the count. It can never raise it, and sometimes it changes nothing at all, when the constraint was already implied by the others.

> Caption: Adding a constraint can only lower the count. It can never raise it, and it may leave it unchanged.

## Scene 3. The definition as a search: 24 orderings, 5 survivors

*1:00 – 1:32 · objective: test every ordering of four elements against three constraints*

**1:00–1:08** — Four elements, three constraints. A before C. B before C. B before D. Twenty-four orderings exist, because four factorial is twenty-four.

> Caption: Four elements, three constraints: A before C, B before C, B before D. Twenty-four orderings exist.

**1:08–1:16** — Test each one. C A B D fails, because C comes before B and the constraint says B before C. D B A C fails, because D comes before B.

> Caption: Test each one. C A B D fails, because C comes before B and the constraint says B before C.

**1:16–1:24** — Five survive: A B C D, A B D C, B A C D, B A D C and B D A C. Every other ordering puts something before an element it must follow.

> Caption: Five survive: A B C D, A B D C, B A C D, B A D C and B D A C.

**1:24–1:32** — Twenty-four orderings tested, five accepted. That is the definition, and it is also a method: it costs n factorial, so it settles every instance up to about eight elements and nothing beyond.

> Caption: Twenty-four orderings tested, five accepted. That is the definition, and it is also a method.

## Scene 4. Series multiplies, parallel chooses slots

*1:32 – 2:06 · objective: state the two composition rules that give every closed form in this lesson*

**1:32–1:40** — Two blocks in series. Every element of the first comes before every element of the second. The counts multiply, because the two orders are chosen independently and then concatenated.

> Caption: Two blocks in series: every element of the first comes before every element of the second. The counts multiply.

**1:40–1:48** — Two blocks in parallel. Nothing crosses between them, so their elements interleave freely. Choose which slots of the combined sequence belong to the first block, and the rest belong to the second.

> Caption: Two blocks in parallel: nothing crosses between them, so their elements interleave. Choose which slots belong to the first block.

**1:48–1:57** — Sizes m and n. The number of ways to choose the m slots out of m plus n is the binomial coefficient C of m plus n, choose m. Multiply by the internal counts and the parallel rule is complete.

> Caption: Sizes m and n: the number of ways to choose the m slots is C of m plus n, choose m.

**1:57–2:06** — Series-parallel posets are exactly the ones these two rules reach. Every closed form in this lesson is built from them, and the poset in scene eight is the smallest one they cannot build.

> Caption: Series-parallel posets are exactly the ones these two rules reach. Every closed form in this lesson is built from them.

## Scene 5. Two chains: a binomial coefficient, not a division

*2:06 – 2:32 · objective: count two parallel chains by choosing slots, and read C(m+n,m)*

**2:06–2:14** — Two chains of two. B before C, and D before E. Four slots between them, and two of those slots go to the first chain.

> Caption: Two chains of two: B before C, and D before E. Four slots between them, and two slots go to the first chain.

**2:14–2:22** — Six ways: slots one and two, one and three, one and four, two and three, two and four, and three and four. C of four choose two is six.

> Caption: Six ways: slots one and two, one and three, one and four, two and three, two and four, three and four.

**2:22–2:28** — Sizes three and two give C of five choose two, which is ten. The smaller chain takes the chosen slots and the larger one fills the rest.

> Caption: Sizes three and two give C of five choose two, which is ten. The smaller chain takes the chosen slots.

**2:28–2:32** — The binomial is not a division by two. It counts the choices of position, and position is exactly what the two chains compete for.

> Caption: The binomial is not a division by two. It counts the choices of position, and positions are what the two chains compete for.

Exam-trap caption mode adds: *Dividing 4 factorial by 2 gives 12, not 6. The denominator is 2 factorial for each chain, so 24 over 4 gives 6.*

## Scene 6. Three chains, and the shortcut that fails

*2:32 – 3:00 · objective: use the multinomial, then break the divide-by-two-per-edge rule*

**2:32–2:40** — Three chains of two, six elements. Choose two slots of six, then two of the remaining four, then the last two. Fifteen times six times one is ninety.

> Caption: Three chains of two: choose two slots of six, then two of four, then two of two. Fifteen times six times one.

**2:40–2:48** — A common shortcut divides n factorial by two for every constraint. Here it happens to give 720 over 8, which is 90, and it agrees with the multinomial.

> Caption: A common shortcut divides n factorial by two for every constraint. Here it happens to give 720 over 8, which is 90.

**2:48–2:55** — On one chain of three it gives six over four, which is one and a half. A count is never a fraction, so the rule has already failed.

> Caption: On one chain of three it gives six over four, which is 1.5. A count is never a fraction.

Exam-trap caption mode adds: *If a proposed formula returns a non-integer, it is wrong. That check takes one second and catches this shortcut every time.*

**2:55–3:00** — On a chain of four it gives twenty-four over eight, which is three, and the true answer is one. Two constraints that share an element are not independent, so their factors cannot be multiplied.

> Caption: On a chain of four it gives twenty-four over eight, which is three, and the true answer is one.

## Scene 7. A rooted tree: n! over the subtree sizes

*3:00 – 3:30 · objective: apply the hook-length formula to a tree and to a forest*

**3:00–3:08** — A rooted tree read downwards is a partial order: each node comes after its parent. Write in each node the size of its subtree, counting the node itself.

> Caption: A rooted tree read downwards is a partial order: each node after its parent. Write in each node its subtree size.

**3:08–3:17** — The hook-length formula: n factorial divided by the product of the subtree sizes. Twenty-four divided by eight is three, and three is the count.

> Caption: Hook length: n factorial over the product of the subtree sizes. Twenty-four over eight is three.

**3:17–3:25** — A forest of two chains of two. The sizes are two, one, two and one, the product is four, and twenty-four over four is six, which the binomial also gives.

> Caption: A forest of two chains of two: sizes 2, 1, 2, 1, product four, so twenty-four over four is six.

**3:25–3:30** — The formula is exact for forests and for series-parallel posets. It fails the moment a poset is neither, which is the next scene.

> Caption: The formula is exact for forests and for series-parallel posets. It fails the moment a poset is neither.

## Scene 8. A poset no formula reaches

*3:30 – 4:04 · objective: count a non-series-parallel poset by cases, and know why no formula exists*

**3:30–3:38** — A before C, B before C, B before D. No series join and no parallel join produces this poset, so none of the formulas applies.

> Caption: A before C, B before C, B before D. No series join and no parallel join produces this poset.

**3:38–3:46** — Count by cases on the last element. If C is last, the remaining three are free except that B comes before D, so there are three orderings: A B D, B A D and B D A.

> Caption: Count by cases on the last element. If C is last, A and B and D are free except B before D: three orderings.

**3:46–3:55** — If D is last, C must follow both A and B, so C is last among the remaining three, and A and B may come in either order. Two orderings. Three plus two is five.

> Caption: If D is last, C must follow both A and B, so C is last among the three: two orderings. Three plus two is five.

**3:55–4:04** — Brightwell and Winkler proved in 1991 that counting linear extensions is number-P complete. No formula exists for the general case. Polynomial algorithms exist for trees, for series-parallel posets and for posets of bounded width, and an exam instance is always one of those or small enough to count.

> Caption: Brightwell and Winkler proved in 1991 that counting linear extensions is #P-complete. No formula exists for the general case.

## Scene 9. The general method: dynamic programming over subsets

*4:04 – 4:32 · objective: state and cost the subset recurrence that always works*

**4:04–4:12** — The method that always works is dynamic programming over subsets. Let f of S be the number of ways to order the set S as a prefix of the whole sequence.

> Caption: The method that always works: let f of S be the number of ways to order the set S as a prefix of the sequence.

**4:12–4:20** — The next element must have all of its predecessors already in S. Sum f of S plus that element over every legal choice, and the sum is f of S.

> Caption: The next element must have all of its predecessors already in S. Sum f of S plus that element over every legal choice.

**4:20–4:26** — Four elements give sixteen subsets. Fill them in order of size. The full set counts one way, and f of the empty set is the answer, which is five here.

> Caption: Four elements give sixteen subsets. Fill them in order of size; the full set counts one way and the empty set holds the answer.

**4:26–4:32** — The cost is n times two to the n. That is fine to about twenty elements, which is why a question either keeps n small or gives a shape a formula can reach.

> Caption: The cost is n times two to the n. That is fine to about twenty elements, which is why questions keep n small or the shape special.

## Scene 10. GATE CSE 2016, Set 1, Q11: six orderings

*4:32 – 5:00 · objective: answer the verified previous-year question by decomposition*

**4:32–4:40** — GATE CSE 2016, Set 1, Question 11. Consider the following directed graph. The number of different topological orderings of the vertices of the graph is blank.

> Caption: GATE CSE 2016, Set 1, Question 11: the number of different topological orderings of the given graph.

**4:40–4:48** — A is the only source and F the only sink, so every ordering starts with A and ends with F. Four slots remain in the middle.

> Caption: A is the only source and F the only sink, so every ordering starts with A and ends with F. Four slots remain.

**4:48–4:54** — The middle is two chains in parallel: B before C, and D before E. So the answer is C of four choose two, which is six.

> Caption: The middle is two chains in parallel: B before C, and D before E. So C of four choose two, which is six.

**4:54–5:00** — The six orderings are A B C D E F, A B D C E F, A B D E C F, A D B C E F, A D B E C F and A D E B C F. The answer is six.

> Caption: The six: A B C D E F, A B D C E F, A B D E C F, A D B C E F, A D B E C F, A D E B C F. The answer is 6.

## Scene 11. One arithmetic, three names

*5:00 – 5:36 · objective: recognise the same count inside interleavings and serialisable schedules*

**5:00–5:08** — Two threads, two statements each. The six interleavings are the linear extensions of two parallel chains of two, because each thread keeps its own order and nothing crosses between them.

> Caption: Two threads, two statements each. The six interleavings are the linear extensions of two parallel chains of two.

**5:08–5:17** — GATE CSE 2024, Set 1, Question 40. All six orders are legal, but they produce only three distinct value pairs: four and four, four and three, and three and three.

> Caption: GATE CSE 2024, Set 1, Question 40: all six orders are legal, but they produce only three distinct value pairs.

Exam-trap caption mode adds: *Six interleavings is not the answer. The question asks which value pairs are possible, and four of the six orderings give the same pair.*

**5:17–5:26** — GATE CSE 2017, Set 2, Question 44. Eight operations give C of eight choose four, which is seventy schedules. Sixteen of them create a cycle in the precedence graph, leaving fifty-four conflict serialisable schedules.

> Caption: GATE CSE 2017, Set 2, Question 44: eight operations give C of eight choose four, seventy schedules; sixteen create a cycle, leaving fifty-four.

**5:26–5:36** — One arithmetic, three names: topological orderings, thread interleavings and conflict serialisable schedules. In each case the task is to count the orderings that respect the constraints, so the first move is always to draw the partial order.

> Caption: One arithmetic, three names: topological orderings, thread interleavings, serialisable schedules. Count the orderings that respect the constraints.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
