# Antichains, chain covers and the width of a poset: Dilworth, Mirsky, Sperner and the matching that computes them — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/antichains-and-chain-covers/index.html`
- Total duration: 5:36 (336 seconds), 11 scenes, 43 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Two objects: a chain and an antichain

*0:00 – 0:32 · objective: recognise an antichain as a set of mutually incomparable elements, and a chain as a set of mutually comparable ones*

**0:00–0:08** — Five tasks and four constraints. A before B. A before C. Both B and C before D. And E waits for nobody and nothing waits for E.

> Caption: Five tasks, four constraints: A before B, A before C, and both B and C before D. E waits for nobody.

**0:08–0:16** — A chain is a set in which every pair is comparable. A, B and D form a chain of three, because A comes before B and B comes before D, so every pair in the set has an order.

> Caption: A chain is a set in which every pair is comparable: A, B, D is a chain of three.

**0:16–0:24** — An antichain is the opposite: no two distinct elements are comparable. B, C and E form an antichain of size three. B and C are both below D but neither is below the other, and E is below nothing.

> Caption: An antichain is a set in which no two distinct elements are comparable: B, C, E is one of size three.

**0:24–0:32** — A chain and an antichain can share at most one element, because two shared elements would have to be both comparable and incomparable. That single observation carries both theorems on this page.

> Caption: A chain and an antichain share at most one element. That one fact carries both theorems.

## Scene 2. Width and height: two numbers, not one

*0:32 – 1:04 · objective: define width and height and see that either can exceed the other*

**0:32–0:40** — The width of a poset is the size of its largest antichain. Here the width is three, and B, C and E is a largest antichain.

> Caption: The width is the size of the largest antichain. Here it is three, and B, C, E is one of them.

**0:40–0:48** — The height is the size of the longest chain. Here it is three as well, because A to B to D is a chain of three. That equality is a coincidence of this picture and nothing more.

> Caption: The height is the size of the longest chain. Here it is also three, and that is a coincidence.

**0:48–0:56** — A chain of four has width one and height four, since everything is comparable and nothing bigger is incomparable. An antichain of four has width four and height one. So neither number bounds the other in general.

> Caption: A chain of four has width one and height four. An antichain of four has width four and height one.

**0:56–1:04** — For a poset of n elements, the width times the height is at least n. Five elements with width three and height three give nine, which is above five, so the inequality is real and it is not tight.

> Caption: For a poset of n elements, width times height is at least n. That is a real inequality, and it is not an equality.

## Scene 3. Mirsky: the layers by longest chain

*1:04 – 1:36 · objective: partition a poset into antichains whose number equals the height*

**1:04–1:12** — Give every element a level: one plus the length of the longest chain that ends at it. A and E get level one because nothing is below them.

> Caption: Give each element its level: one plus the longest chain that ends at it.

**1:12–1:20** — Two elements of the same level can never be comparable, because the upper one would then have a chain below it one longer than the lower one has. So each level is an antichain.

> Caption: Elements of the same level are never comparable, so each level is an antichain.

**1:20–1:28** — This poset splits into three antichains and its height is three. No partition into two antichains exists, because a longest chain of three would have to put two of its elements in one antichain.

> Caption: Three antichains here, and the height is three: a partition into three antichains, and no fewer will do.

**1:28–1:36** — Mirsky&rsquo;s theorem: the minimum number of antichains needed to cover a finite poset equals the size of its longest chain. Cover and partition coincide here, because a subset of an antichain is an antichain.

> Caption: Mirsky: the minimum number of antichains covering a poset equals its height.

## Scene 4. Dilworth: the fewest chains that cover it

*1:36 – 2:08 · objective: state the equality of width and minimum chain cover and check it on a computed example*

**1:36–1:44** — Now cover the same poset with chains instead of antichains. A, B and D form one chain, C is a second, and E is a third. Three chains cover everything.

> Caption: Now cover the same poset with chains instead. A B D is one chain; C is another; E is a third.

**1:44–1:52** — Two chains cannot do it. B, C and E are pairwise incomparable, so each of the three must sit in a different chain. The antichain is a certificate that three chains are necessary.

> Caption: Two chains cannot do it: B, C and E are pairwise incomparable, so each needs its own chain.

**1:52–2:00** — Dilworth&rsquo;s theorem says the two numbers are equal: the largest antichain and the smallest chain cover of a finite poset have the same size, and that common size is the width.

> Caption: Dilworth: the largest antichain and the smallest chain cover have the same size. That size is the width.

**2:00–2:08** — Width three, height three, three chains, three antichains: both theorems hold here, and they are different theorems. Dilworth constrains the chains by the largest antichain; Mirsky constrains the antichains by the longest chain.

> Caption: Width three, height three, three chains, three antichains. Both theorems hold on this poset, and they are different theorems.

## Scene 5. Sperner: the widest level of a power set

*2:08 – 2:42 · objective: read the width of the Boolean lattice off the binomial coefficient, and count antichains*

**2:08–2:16** — Take the eight subsets of a three-element set and order them by inclusion. This is the Boolean lattice, and it is the poset behind every question about subsets of a set.

> Caption: The Boolean lattice of a three-element set: eight subsets, ordered by inclusion.

**2:16–2:25** — An antichain in this poset is a family of sets no one of which contains another. The three two-element subsets form one of size three, and so do the three one-element subsets.

> Caption: An antichain here is a family of sets no one of which contains another. The middle level has three such sets.

**2:25–2:34** — Sperner&rsquo;s theorem: the largest antichain in the power set of an n-element set is the middle level, of size C of n choose floor of n over two. For three elements that is three, and for four elements it is six.

> Caption: Sperner: the widest level of the power set of an n-element set has C of n, floor of n over two members.

**2:34–2:42** — The number of antichains and the number of maximum antichains are different questions. This lattice has twenty antichains in all, counting the empty one, but only two of them have size three.

> Caption: Antichains and maximum antichains are different counts: twenty antichains in this lattice, but only two of size three.

## Scene 6. The divisors of 60, computed

*2:42 – 3:12 · objective: carry out both theorems on a twelve-element poset built from divisibility*

**2:42–2:51** — Twelve divisors of sixty, ordered by divisibility. Four divides twelve and twelve divides sixty; four does not divide six, and six does not divide four, so those two are incomparable.

> Caption: Twelve divisors of 60, ordered by divisibility: 4 divides 12, 12 divides 60, and 4 does not divide 6.

**2:51–3:00** — The width is four. The page finds it the honest way, by testing all four thousand and ninety-six subsets of the twelve elements and keeping the largest one with no comparable pair: four, six, ten and fifteen.

> Caption: The width is four, and the page finds it by testing all 4096 subsets: 4, 6, 10, 15.

**3:00–3:06** — The height is five. The layers are one; then two, three and five; then four, six, ten and fifteen; then twelve, twenty and thirty; then sixty. Each layer is an antichain and there are five of them.

> Caption: The height is five, from the layers 1; 2,3,5; 4,6,10,15; 12,20,30; 60.

**3:06–3:12** — Four chains cover the whole poset: one, two, four, twelve, sixty; then three, six, thirty; then five, ten, twenty; and fifteen alone. Dilworth predicted four from the width, and the cover attains it.

> Caption: Four chains cover it: 1,2,4,12,60 and 3,6,30 and 5,10,20 and 15. Dilworth predicted four.

## Scene 7. The matching that finds the chains

*3:12 – 3:44 · objective: turn a poset into a bipartite graph and read the chain cover off a maximum matching*

**3:12–3:20** — To build the cover rather than just count it, split every element into a left copy and a right copy, and draw an edge from the left copy of x to the right copy of y whenever x is strictly below y.

> Caption: To build the cover, split every element into a left copy and a right copy, and draw an edge for each strict comparison.

**3:20–3:28** — A maximum matching pairs each left copy with at most one right copy and each right copy with at most one left copy. Here the largest matching has size three, which the page finds by the augmenting-path method.

> Caption: A maximum matching pairs each left copy with at most one right copy. Here it has size three.

**3:28–3:36** — The matching turns into chains. Follow the links from any element that is not the target of a link, and you walk a chain. The number of chains is the number of elements minus the size of the matching.

> Caption: The matching turns into chains: follow the links, and every element used as a link is not a chain start.

**3:36–3:44** — So the width of a poset is computable in polynomial time: build the split graph, find a maximum matching, and subtract its size from the number of elements. That route needs no cleverness about the shape.

> Caption: So the width is computable: build the graph, find a maximum matching, subtract from n. That is the exam-safe route.

## Scene 8. When the widest level is not the answer

*3:44 – 4:12 · objective: refute "the biggest level is the maximum antichain" with a computed graded poset*

**3:44–3:52** — Here is a seven-element poset with ranks zero, one and two: one element, then three, then three. Every maximal chain runs through all three ranks, so the poset is graded.

> Caption: A seven-element poset with ranks 0, 1 and 2: one element, then three, then three. Every maximal chain has length three.

**3:52–4:01** — The widest level has three elements. But the width is four: one, two, five and six are pairwise incomparable, and no level contains all four of them.

> Caption: The widest level has three elements. The width is four, and the maximum antichain is 1, 2, 5, 6.

Exam-trap caption mode adds: *This is the most common wrong method on the topic: count the elements of the widest level and call it the width. It answers the 60-divisor poset correctly and this one wrongly.*

**4:01–4:08** — What the levels do give is Mirsky: three antichains covering everything, matching the height of three. The layer construction is always valid for antichains and only sometimes optimal for chains.

> Caption: What the levels do give is Mirsky: three antichains covering everything, matching the height of three.

**4:08–4:12** — The safe move in an exam is to exhibit both. An antichain you can point at proves the width is at least its size, and a chain cover you can point at proves it is at most the number of chains. When the two numbers meet, you are done.

> Caption: The safe move: prove a lower bound with an antichain you exhibit, and an upper bound with chains you exhibit.

## Scene 9. Four traps, and the greedy that overpays

*4:12 – 4:44 · objective: separate width from height, maximum from maximal, and an optimal cover from a greedy one*

**4:12–4:20** — Width and height are different numbers. Quoting Dilworth as width equals height is simply wrong: the theorem pairs the largest antichain with the smallest chain cover, not with the longest chain.

> Caption: Width and height are different numbers. Quoting Dilworth as "width equals height" is wrong.

Exam-trap caption mode adds: *Width equals height is false. Dilworth: width equals minimum chain cover. Mirsky: height equals minimum antichain cover.*

**4:20–4:28** — A maximal antichain is not a maximum antichain. Maximal means no further element can be added while keeping it an antichain; maximum means no antichain anywhere in the poset is larger.

> Caption: A maximal antichain is not a maximum one. Maximal means you cannot add an element; maximum means nothing bigger exists.

**4:28–4:36** — Greedy chain covers overpay. This seven-element poset has width four, but taking the longest chain first and then repeating costs five chains. Four is attainable and the page exhibits a cover of four.

> Caption: Greedy chain covers overpay: this seven-element poset has width four, and taking the longest chain first costs five chains.

Exam-trap caption mode adds: *Any chain-cover answer obtained by repeatedly taking a longest chain is an upper bound, never a proof of optimality.*

**4:36–4:44** — In a general graph, the largest independent set and the fewest cliques needed to cover the vertices need not agree. In a poset they do, because the comparability graph is perfect, and Dilworth is that statement in order-theoretic language.

> Caption: In a general graph, independence number and clique cover need not agree. In a poset they do, because comparability graphs are perfect.

## Scene 10. GATE CSE 1991, Q1(xiv): partition into n antichains

*4:44 – 5:12 · objective: answer the verified previous-year item, and the 2005 chain item, from the theorems*

**4:44–4:52** — GATE CSE 1991, question one, part fourteen: if the longest chain in a partial order is of length n, then the partial order can be written as a blank of n antichains. The blank is partition.

> Caption: GATE CSE 1991, Q1(xiv): if the longest chain has length n, the poset can be written as a ____ of n antichains.

**4:52–5:00** — Why partition rather than cover: the levels are disjoint by construction, and n is the height, so no smaller number of antichains can work. A chain of n elements needs n antichains because each holds at most one of them.

> Caption: Why partition and not cover: the levels are disjoint, and n is the height, which no smaller number of antichains can beat.

**5:00–5:06** — GATE IT 2005, question thirty-three, which some archives file under the CSE paper: the largest family of subsets of an n-element set in which any two are comparable has n plus one members. That is the height of the Boolean lattice.

> Caption: GATE IT 2005, Q33: the largest family of subsets of an n-set that is totally ordered by inclusion has n plus one members.

**5:06–5:12** — Both previous-year items are the same skill: read whether the question is about a longest chain or a widest antichain, then quote the matching theorem. Mirsky for antichains from a chain, Dilworth for chains from an antichain.

> Caption: Chain questions give a longest chain or a widest antichain; read which, then quote Mirsky or Dilworth, never both at once.

## Scene 11. The four-step procedure

*5:12 – 5:36 · objective: consolidate the method that answers any width or chain-cover question*

**5:12–5:20** — Step one is to decide which number the question wants: the width, the height, a minimum chain cover, or a count of antichains. Those are four different answers and only two of them are numbers the theorems name.

> Caption: Step one: decide which number the question wants. Width, height, a chain cover, or a count of antichains.

**5:20–5:28** — Step two is to exhibit both certificates: an antichain for the lower bound and a chain cover for the upper bound. If the two numbers meet, the answer is proved without quoting any theorem.

> Caption: Step two: exhibit a candidate antichain for the lower bound, and candidate chains for the upper bound.

**5:28–5:36** — Step three, for a poset too big to draw: split every element into two copies, take a maximum matching, and read the width as the number of elements minus the matching. That is polynomial and it needs no insight into the shape.

> Caption: Step three: if the poset is big, use the split graph and a maximum matching. Width equals n minus the matching size.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
