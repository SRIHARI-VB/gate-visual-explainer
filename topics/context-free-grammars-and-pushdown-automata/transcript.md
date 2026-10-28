# Context Free Grammars And Pushdown Automata — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/context-free-grammars-and-pushdown-automata/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A grammar is a rewriting machine

*0:00 – 0:30 · objective: Read a four-part grammar, follow a derivation one replacement at a time, and see why the word context-free names a restriction on the left side of a rule.*

**0:00–0:07** — A context-free grammar has four parts. The nonterminals, which are placeholders. The terminals, which are the symbols of the final string. The rules. And one start symbol, which is a nonterminal.

> Caption: A context-free grammar has four parts: nonterminals, terminals, rules, and a start symbol.

Exam-trap caption mode adds: *The start symbol must be a nonterminal, and it must be one of V. A grammar whose start symbol is a terminal is not a context-free grammar.*

**0:07–0:15** — A derivation replaces one nonterminal at a time. Start at S. Replace it by a S b. Replace that S by a S b again. Then replace the last S by the empty string, and the terminal string a a b b remains.

> Caption: A derivation replaces one nonterminal at a time. S becomes a S b, then a a S b b, then a a b b.

Exam-trap caption mode adds: *The intermediate strings are not in the language. Only a string with no nonterminals left, the yield, is a member.*

**0:15–0:22** — A leftmost derivation always expands the leftmost nonterminal. Any order reaches the same strings, so the order is bookkeeping. The tree drops the order and keeps the structure, and that is what the next scene counts.

> Caption: A leftmost derivation always expands the leftmost nonterminal. Every derivation has a tree, and the tree is what ambiguity is about.

Exam-trap caption mode adds: *Two different derivation orders do not make a grammar ambiguous. Only two different trees do.*

**0:22–0:30** — The name context-free states the restriction precisely. The left side of every rule is one nonterminal, so the replacement never looks at what surrounds it. That freedom is why grammars are easy to write, and it is also why some languages have no grammar.

> Caption: Context-free means the left side of every rule is a single nonterminal, so a replacement never inspects its neighbours.

Exam-trap caption mode adds: *A rule with two symbols on the left, such as a B to a c, is context-sensitive, not context-free. It is not a CFG with an unusual notation.*

## Scene 2. Derivation trees and ambiguity

*0:30 – 1:00 · objective: Turn a derivation into a tree, and decide ambiguity by finding two distinct trees for one string rather than by intuition about the rules.*

**0:30–0:37** — Here is the classic example. Three rules: E to E plus E, E to E star E, and E to id. The string id plus id star id has two legal trees. In one, the star is applied first; in the other, the plus is.

> Caption: The grammar E to E plus E, E to E star E, E to id gives the string id plus id star id two different trees.

Exam-trap caption mode adds: *Both trees are correct derivations. The grammar is ambiguous; the string is not malformed.*

**0:37–0:45** — So ambiguity means one string with two distinct trees. The repair is to change the grammar: split E into a chain of levels, so multiplication must sit deeper than addition in every tree. Same language, one tree per string.

> Caption: That is ambiguity: one string, two distinct trees. Precedence is the usual repair, and it is a change to the grammar.

Exam-trap caption mode adds: *Fixing precedence does not change the language. If a question asks whether the language changed, the answer is no.*

**0:45–0:52** — Keep the two levels apart. A grammar is ambiguous or not. A language is inherently ambiguous when every grammar for it is ambiguous. Some context-free languages are, and that is a theorem about the language, not about one description of it.

> Caption: Ambiguity is a property of a grammar. A language is inherently ambiguous when no grammar for it is unambiguous.

Exam-trap caption mode adds: *Showing one ambiguous grammar does not show the language is inherently ambiguous. You must show that no unambiguous grammar exists, which is a much stronger claim.*

**0:52–1:00** — Counting is mechanical, not a matter of taste. The page counts trees by dynamic programming over substrings, then recounts them by brute-force derivation to check the two agree. For two plus signs and three operands, the answer is two.

> Caption: Counting trees is mechanical: the number of binary bracketings of n operators is the Catalan number.

Exam-trap caption mode adds: *The count depends on the grammar. A question about the number of parse trees is a question about a named grammar, and the same string under a fixed grammar can have one tree or many.*

## Scene 3. Simplification and Chomsky normal form

*1:00 – 1:30 · objective: Remove useless symbols, epsilon rules and unit rules, then binarise, and know what the binary tree buys you: a bound on the number of steps.*

**1:00–1:07** — Before any normal form, three cleanups. Delete symbols that can never produce a terminal string or can never be reached. Remove epsilon rules by adding rules that omit the symbol. Remove unit rules by copying the target rules onto the source.

> Caption: Three cleanups come first: drop useless symbols, then epsilon rules, then unit rules.

Exam-trap caption mode adds: *Order matters. Removing unit rules before epsilon rules can reintroduce epsilon rules, and the standard order is useless, then epsilon, then unit.*

**1:07–1:15** — Chomsky normal form allows two shapes only: one nonterminal becoming two nonterminals, or one nonterminal becoming one terminal. Every context-free language has such a grammar, with a single exception for the empty string.

> Caption: In Chomsky normal form every rule is A to B C or A to a. Nothing else is allowed.

Exam-trap caption mode adds: *A to B C requires two nonterminals, not a nonterminal and a terminal. A to a B is not in Chomsky normal form and must be split.*

**1:15–1:22** — Why bother? Because a binary tree is countable. With n leaves there are exactly n minus 1 internal nodes, so the derivation takes exactly two n minus one steps. The page converts a grammar in code and checks that no string changed sides.

> Caption: Binarising makes every tree binary, so a string of length n has exactly 2n minus 1 nodes on its derivation.

Exam-trap caption mode adds: *The step count 2n minus 1 holds in Chomsky normal form. In a general grammar a derivation of the same string can be much shorter or longer.*

**1:22–1:30** — Two things need the normal form. The CYK membership test, which fills a table over substrings. And the pumping lemma, whose proof needs a binary tree deep enough that some nonterminal must repeat on one path.

> Caption: Two tools need this form: the CYK membership test, and the pumping lemma for context-free languages.

Exam-trap caption mode adds: *CYK is a membership test, not a parsing strategy for compilers, and it is cubic. A question that asks for the complexity of CYK wants cubic time in the length of the string.*

## Scene 4. The stack: one unbounded memory

*1:30 – 2:00 · objective: Read the seven parts of a pushdown machine, and see a move as read, pop, push.*

**1:30–1:37** — A pushdown automaton is a finite machine with a stack. Seven parts: states, input alphabet, stack alphabet, transition function, start state, bottom-of-stack symbol, and accepting states. The stack is the only part a finite automaton does not have.

> Caption: A pushdown automaton is a finite machine plus a stack. Seven parts, and the stack is the only new one.

Exam-trap caption mode adds: *The stack alphabet is not the input alphabet. A machine may push symbols that never appear in the input, and exam questions often rely on that.*

**1:37–1:45** — One move does three things: it reads one input symbol or nothing at all, it pops the top of the stack, and it pushes a string in its place. A push is that with a one-symbol string; a pop is that with the empty string.

> Caption: One move reads one input symbol or nothing, pops the stack top, and pushes a string in its place.

Exam-trap caption mode adds: *An epsilon move consumes no input but does change the stack. A run that only takes epsilon moves can loop forever without reading anything.*

**1:45–1:52** — A snapshot has three parts: the state, the part of the input not yet read, and the stack. A run is a sequence of snapshots. The machine accepts when some run ends with the input finished, in a state and stack that count as accepting.

> Caption: An instantaneous description records the state, the unread input, and the whole stack.

Exam-trap caption mode adds: *The input is read left to right and never rewound. A machine cannot go back, which is why the order of comparisons matters so much.*

**1:52–2:00** — The stack is last in, first out. Whatever you push comes back reversed. That single fact decides almost every question in this topic: a mirror can be checked, a copy cannot, and a count can because a count has no order.

> Caption: Last in, first out: the stack can compare a prefix with the reverse of a later block, and nothing else.

Exam-trap caption mode adds: *Do not think of the stack as a tape. It has no head that can move; only the top is ever visible.*

## Scene 5. A run, traced on the stack

*2:00 – 2:30 · objective: Follow a deterministic machine for a to the n b to the n symbol by symbol, and separate acceptance by final state from acceptance by empty stack.*

**2:00–2:07** — The design is two lines. Push a marker for every a. Then pop one marker for every b. If the stack reaches its bottom exactly when the input runs out, the two counts were equal.

> Caption: For a to the n b to the n: push one marker per a, pop one per b, accept when both are exhausted together.

Exam-trap caption mode adds: *The switch from pushing to popping must happen at the first b. If the machine keeps pushing on b, or pops on a, the counts are never compared.*

**2:07–2:15** — Watch the string a a b b. Two markers go on, two come off, the input ends exactly as the bottom marker reappears, and the machine accepts. The page simulates this on every short string and checks each verdict against the definition.

> Caption: Watch a a b b: the stack grows to two markers, then shrinks to the bottom marker, and the input ends at the same moment.

Exam-trap caption mode adds: *A rejected string can still have a run that gets far. Acceptance needs one successful run; rejection needs every run to fail.*

**2:15–2:22** — Two conventions exist: accept in a final state, or accept with an empty stack. For nondeterministic machines they describe the same languages. For deterministic ones the correspondence needs care, which is why the textbooks state it for the nondeterministic case.

> Caption: Acceptance by final state and by empty stack are equivalent for nondeterministic machines, and not for deterministic ones.

Exam-trap caption mode adds: *Do not assume a machine that empties its stack accepts. The acceptance condition is part of the definition, not a consequence of the stack being empty.*

**2:22–2:30** — Here is the one asymmetry that matters. A deterministic machine cannot find the middle of a string without guessing, so the mirror language w w reversed has no deterministic machine, though it plainly has a nondeterministic one. Nondeterminism is real power here, unlike in the finite case.

> Caption: Deterministic pushdown machines are strictly weaker: w w reversed is context-free, and no deterministic machine accepts it.

Exam-trap caption mode adds: *DFA equals NFA, but DPDA is strictly weaker than NPDA. Confusing the two rows is the commonest error in this topic.*

## Scene 6. One comparison, not two

*2:30 – 3:00 · objective: State exactly what a single last-in-first-out memory can compare, and use that to classify a language before writing any proof.*

**2:30–2:37** — The mirror language works because the stack reverses, and the mirror is reversed. The copy language fails for exactly the same reason: the stack hands the first half back backwards, and the second half needs it forwards.

> Caption: The mirror language works because pushing and popping reverses. The copy language fails for the same reason.

Exam-trap caption mode adds: *The copy language w w is not context-free, but its complement is. A non-context-free language can have a context-free complement, because the class is not closed under complement.*

**2:37–2:45** — Now three blocks. Comparing a with b spends the stack. By the time c arrives there is nothing left to compare it with, so the first count is lost. Two comparisons need two counters, and one stack holds one.

> Caption: a to the n b to the n c to the n needs two comparisons, and one stack is spent after the first.

Exam-trap caption mode adds: *It is the number of simultaneous comparisons that matters, not the number of symbols in the alphabet. Three blocks with two comparisons are fine, as the next event shows.*

**2:45–2:52** — Watch the quantifiers. If the third block is free, one comparison remains and the language is context-free. Take two such languages and intersect them, and all three counts are forced equal, which is not context-free.

> Caption: a to the n b to the n c to the m and a to the m b to the n c to the n are both context-free, and their intersection is not.

Exam-trap caption mode adds: *The union of two context-free languages is always context-free. The intersection of two is not, and this pair is the standard counterexample.*

**2:52–3:00** — So here is the fast test. Count the independent quantities that must be compared at once. One is context-free. Two is usually not. It is a way to guess quickly, never a way to prove.

> Caption: The one-line test: count how many independent quantities must be compared at once. One is context-free, two usually is not.

Exam-trap caption mode adds: *The test is a heuristic. A language with one visible comparison can still be non-context-free, so a question that asks you to prove needs the lemma, not this sentence.*

## Scene 7. Closure: what keeps you inside the class

*3:00 – 3:30 · objective: Name the operations context-free languages are closed under, the two they are not, and the one exception that resolves most exam questions.*

**3:00–3:07** — Five operations keep you inside the class. Union, concatenation, star, reversal, and intersection with a regular language. Each has a short construction, and the last one is the one exam questions lean on.

> Caption: Context-free languages are closed under union, concatenation, star, reversal, and intersection with a regular language.

Exam-trap caption mode adds: *Intersection with a regular language is inside the class. Intersection with another context-free language is not, and the two are easy to conflate.*

**3:07–3:15** — Two operations fail. Intersection, because of the pair from the previous scene. And complement, which fails for its own reason. Both failures are examinable, and neither is obvious from the grammar.

> Caption: Two operations do not: intersection, and complement.

Exam-trap caption mode adds: *Do not write that context-free languages are closed under complement. Only the deterministic subclass is.*

**3:15–3:22** — The exception is the useful one. If one of the two languages is regular, the intersection stays context-free, because a finite machine can carry the regular condition in its states while the stack does the other job.

> Caption: The useful exception: if one of the two languages is regular, the intersection is context-free.

Exam-trap caption mode adds: *The regular language must be genuinely regular. A context-free language that happens to be described simply is not enough for this argument.*

**3:22–3:30** — One asymmetry to keep. Deterministic context-free languages are closed under complement. The whole class is not. The copy language is not context-free, yet its complement is, and a machine finds it by guessing one mismatching position.

> Caption: Deterministic context-free languages are closed under complement. The whole class is not, and w w proves it.

Exam-trap caption mode adds: *A language and its complement can sit on opposite sides of the boundary. Never infer one from the other in this class.*

## Scene 8. The pumping lemma for context-free languages

*3:30 – 4:00 · objective: Use the five-part split with its two conditions, and see every legal split of a to the p b to the p c to the p fail, exhaustively.*

**3:30–3:37** — The statement has three conditions. Split a long string into five parts. The two pumpable pieces are not both empty, the middle three together are short, and repeating both pieces together keeps the string in the language.

> Caption: The pumping lemma: a long enough string splits into five parts, and the two middle pieces can be repeated together.

Exam-trap caption mode adds: *There are two pumped pieces, not one, and they are pumped together. Pumping only one of them, as in the regular lemma, is a different lemma.*

**3:37–3:45** — The reason is the tree. In binary form a long string forces a path longer than the number of nonterminals, so some nonterminal repeats. The repeat cuts out a middle and a pair of sibling subtrees, and that pair is why two pieces move together.

> Caption: Why two pieces: a binary tree repeats a nonterminal on a path, and that repeat carries two subtrees side by side.

Exam-trap caption mode adds: *The constant p comes from the grammar, not from the language. Different grammars for the same language can give different constants, and that is fine.*

**3:45–3:52** — Here is the refutation. Take the string with p of each symbol. Every legal split puts the short middle across at most two of the three blocks, so repeating both pieces unbalances some block and the string leaves the language. The page checks every split rather than arguing in prose.

> Caption: Refuting a to the n b to the n c to the n: take a to the p b to the p c to the p and check every legal split.

Exam-trap caption mode adds: *The order matters. You choose the string, the adversary chooses the split. Choosing a convenient split and refuting only that one proves nothing.*

**3:52–4:00** — One limit, stated plainly. Satisfying the lemma proves nothing. It is a necessary condition, so it can refute and never certify. To prove a language context-free you build a grammar or a machine, or you use closure.

> Caption: What it cannot do: satisfying the lemma never proves a language context-free.

Exam-trap caption mode adds: *A question that asks you to prove a language is context-free wants a grammar or a PDA. The lemma is the wrong tool and scores zero even when the conclusion is true.*

## Scene 9. The question shapes on real papers

*4:00 – 4:30 · objective: Recognise the five shapes this clause is asked in, and solve one instance of each from its own numbers.*

**4:00–4:07** — Shape one: four languages, one is not context-free. Three of them make one comparison each and have grammars. The fourth needs the mirror and a count at once, which is two, and that is the answer.

> Caption: Shape one: four languages, one is not context-free. Test each by the number of comparisons.

Exam-trap caption mode adds: *A union of context-free languages is context-free, so a language that looks like several conditions may be one condition repeated three ways.*

**4:07–4:15** — Shape two: the union and the intersection of one pair. The union is context-free by closure. The intersection forces all three counts equal and is not. The answer is the union only.

> Caption: Shape two: a union and an intersection of the same pair. Union yes, intersection no.

Exam-trap caption mode adds: *Reading the options quickly makes both halves look the same. Write down what the intersection is before you judge it.*

**4:15–4:22** — Shape three is a statement cluster, often multiple-select. One statement about determinism, one about context-freeness, one about an intersection, one about a complement. Judge each separately, and expect more than one to be false.

> Caption: Shape three: a multiple-select cluster of statements about determinism and complements.

Exam-trap caption mode adds: *In a multiple-select, a statement that is half true is false. The first statement in the 2022 question is true overall even though it mentions the non-context-free language, because it says that language is not context-free.*

**4:22–4:30** — Two more shapes. Read a grammar back to a language, which is a matter of generating the first few strings and then generalising carefully. And pick the context-free ones out of four, which is the comparison test again with more arithmetic.

> Caption: Shape four: read a grammar back to its language. Shape five: which of four languages are context-free.

Exam-trap caption mode adds: *For the grammar with one-symbol bases, the empty string is not generated. All palindromes is the tempting option and it is wrong for exactly that reason.*

## Scene 10. The procedure, and the traps that cost marks

*4:30 – 5:00 · objective: Fix a five-step routine that covers every question shape in this clause.*

**4:30–4:37** — Step one. Rewrite the language as blocks and conditions. One condition, one stack. Two conditions on disjoint blocks, and the stack is not enough. Two conditions nested inside each other, and it may still be fine.

> Caption: Step one: read the language as a set of comparisons, and count the independent ones.

Exam-trap caption mode adds: *Crossing comparisons fail; nesting usually succeeds. The mirror language nests, the copy language crosses.*

**4:37–4:45** — Step two. Try to build it. A grammar of three or four rules, or a machine that pushes on one block and pops on the next, is a complete proof of yes. Once it works, stop.

> Caption: Step two: try to build. A grammar or a machine settles the question, and you can stop.

Exam-trap caption mode adds: *A half-built machine proves nothing. If the stack discipline does not cover every symbol, the construction is not finished.*

**4:45–4:52** — Step three. If no construction comes, pump. Choose a string with one block per dependent count, then refute every legal split by naming a repetition count that breaks a count. No split may survive.

> Caption: Step three: if the build fails, pump. Choose a string with the right counts, then refute every split.

Exam-trap caption mode adds: *Picking i equals zero and showing the string shrinks is not always enough. Some splits survive one choice and die at another, so the refutation must be exhaustive.*

**4:52–5:00** — Step four, the checklist. Derivations versus trees. Intersection and complement are not closed. The empty string is the exception in the normal form. And determinism costs power here, unlike in the finite case. Those four cover most lost marks.

> Caption: Step four: check the quantifiers, the empty string, and whether the question says deterministic.

Exam-trap caption mode adds: *Every one of these four is a statement that is true in the regular case and false here. That is why they are the standard distractors.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
