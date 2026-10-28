/* ==========================================================================
   context-free-grammars-and-pushdown-automata — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs — never edited by hand.

   Every number quoted in a caption is computed by the model in lesson.js and
   printed on the canvas; the two agree because both read the same computation.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'grammar',
      n: 1,
      title: 'A grammar is a rewriting machine',
      start: 0, end: 30,
      objective: 'Read a four-part grammar, follow a derivation one replacement at a time, and see why the word context-free names a restriction on the left side of a rule.'
    },
    {
      id: 'tree',
      n: 2,
      title: 'Derivation trees and ambiguity',
      start: 30, end: 60,
      objective: 'Turn a derivation into a tree, and decide ambiguity by finding two distinct trees for one string rather than by intuition about the rules.'
    },
    {
      id: 'normalform',
      n: 3,
      title: 'Simplification and Chomsky normal form',
      start: 60, end: 90,
      objective: 'Remove useless symbols, epsilon rules and unit rules, then binarise, and know what the binary tree buys you: a bound on the number of steps.'
    },
    {
      id: 'stack',
      n: 4,
      title: 'The stack: one unbounded memory',
      start: 90, end: 120,
      objective: 'Read the seven parts of a pushdown machine, and see a move as read, pop, push.'
    },
    {
      id: 'run',
      n: 5,
      title: 'A run, traced on the stack',
      start: 120, end: 150,
      objective: 'Follow a deterministic machine for a to the n b to the n symbol by symbol, and separate acceptance by final state from acceptance by empty stack.'
    },
    {
      id: 'limits',
      n: 6,
      title: 'One comparison, not two',
      start: 150, end: 180,
      objective: 'State exactly what a single last-in-first-out memory can compare, and use that to classify a language before writing any proof.'
    },
    {
      id: 'closure',
      n: 7,
      title: 'Closure: what keeps you inside the class',
      start: 180, end: 210,
      objective: 'Name the operations context-free languages are closed under, the two they are not, and the one exception that resolves most exam questions.'
    },
    {
      id: 'pump',
      n: 8,
      title: 'The pumping lemma for context-free languages',
      start: 210, end: 240,
      objective: 'Use the five-part split with its two conditions, and see every legal split of a to the p b to the p c to the p fail, exhaustively.'
    },
    {
      id: 'gate',
      n: 9,
      title: 'The question shapes on real papers',
      start: 240, end: 270,
      objective: 'Recognise the five shapes this clause is asked in, and solve one instance of each from its own numbers.'
    },
    {
      id: 'decide',
      n: 10,
      title: 'The procedure, and the traps that cost marks',
      start: 270, end: 300,
      objective: 'Fix a five-step routine that covers every question shape in this clause.'
    }
  ],

  events: [
    /* ---------------- scene 1: grammar ---------------- */
    {
      id: 'grammar-1', scene: 'grammar', start: 0, end: 7.5,
      caption: 'A context-free grammar has four parts: nonterminals, terminals, rules, and a start symbol.',
      detail: 'The four parts are the variables V, the terminals Sigma, the production set P, and the start symbol S which must be one of the variables. A language is the set of terminal strings reachable from S by applying rules.',
      narration: 'A context-free grammar has four parts. The nonterminals, which are placeholders. The terminals, which are the symbols of the final string. The rules. And one start symbol, which is a nonterminal.',
      keyword: 'four parts',
      trap: 'The start symbol must be a nonterminal, and it must be one of V. A grammar whose start symbol is a terminal is not a context-free grammar.'
    },
    {
      id: 'grammar-2', scene: 'grammar', start: 7.5, end: 15,
      caption: 'A derivation replaces one nonterminal at a time. S becomes a S b, then a a S b b, then a a b b.',
      detail: 'Each step picks one nonterminal anywhere in the current string, called a sentential form, and replaces it by the right side of one of its rules. The string aabb needs three steps from S, and the model on this page lists every step.',
      narration: 'A derivation replaces one nonterminal at a time. Start at S. Replace it by a S b. Replace that S by a S b again. Then replace the last S by the empty string, and the terminal string a a b b remains.',
      keyword: 'sentential form',
      trap: 'The intermediate strings are not in the language. Only a string with no nonterminals left, the yield, is a member.'
    },
    {
      id: 'grammar-3', scene: 'grammar', start: 15, end: 22.5,
      caption: 'A leftmost derivation always expands the leftmost nonterminal. Every derivation has a tree, and the tree is what ambiguity is about.',
      detail: 'Restricting which nonterminal you expand next never changes the set of strings reachable, only the order of the steps. The tree records the same information without the order, which is why two different orders can give the same tree and two different trees cannot.',
      narration: 'A leftmost derivation always expands the leftmost nonterminal. Any order reaches the same strings, so the order is bookkeeping. The tree drops the order and keeps the structure, and that is what the next scene counts.',
      keyword: 'leftmost derivation',
      trap: 'Two different derivation orders do not make a grammar ambiguous. Only two different trees do.'
    },
    {
      id: 'grammar-4', scene: 'grammar', start: 22.5, end: 30,
      caption: 'Context-free means the left side of every rule is a single nonterminal, so a replacement never inspects its neighbours.',
      detail: 'A rule A to alpha may be applied wherever A appears, whatever surrounds it. That is the whole restriction, and it is also the whole limitation: a rule cannot ask that A be preceded by an a, which is exactly what a context-sensitive grammar may do.',
      narration: 'The name context-free states the restriction precisely. The left side of every rule is one nonterminal, so the replacement never looks at what surrounds it. That freedom is why grammars are easy to write, and it is also why some languages have no grammar.',
      keyword: 'single nonterminal on the left',
      trap: 'A rule with two symbols on the left, such as a B to a c, is context-sensitive, not context-free. It is not a CFG with an unusual notation.'
    },

    /* ---------------- scene 2: tree ---------------- */
    {
      id: 'tree-1', scene: 'tree', start: 30, end: 37.5,
      caption: 'The grammar E to E plus E, E to E star E, E to id gives the string id plus id star id two different trees.',
      detail: 'One tree multiplies first and then adds; the other adds first and then multiplies. Both are legal derivations of the same string from the same grammar, so the grammar does not determine the meaning.',
      narration: 'Here is the classic example. Three rules: E to E plus E, E to E star E, and E to id. The string id plus id star id has two legal trees. In one, the star is applied first; in the other, the plus is.',
      keyword: 'two trees, one string',
      trap: 'Both trees are correct derivations. The grammar is ambiguous; the string is not malformed.'
    },
    {
      id: 'tree-2', scene: 'tree', start: 37.5, end: 45,
      caption: 'That is ambiguity: one string, two distinct trees. Precedence is the usual repair, and it is a change to the grammar.',
      detail: 'Rewriting the rules as E to E plus T, T to T star F, F to id forces the multiplication to sit deeper in every tree. The language is unchanged; the set of trees shrinks to one per string.',
      narration: 'So ambiguity means one string with two distinct trees. The repair is to change the grammar: split E into a chain of levels, so multiplication must sit deeper than addition in every tree. Same language, one tree per string.',
      keyword: 'precedence by levels',
      trap: 'Fixing precedence does not change the language. If a question asks whether the language changed, the answer is no.'
    },
    {
      id: 'tree-3', scene: 'tree', start: 45, end: 52.5,
      caption: 'Ambiguity is a property of a grammar. A language is inherently ambiguous when no grammar for it is unambiguous.',
      detail: 'The class of inherently ambiguous context-free languages is non-empty; the standard example is the union of a to the i b to the j c to the k with i equals j and the same with j equals k. This page quotes the fact and does not attempt a proof.',
      narration: 'Keep the two levels apart. A grammar is ambiguous or not. A language is inherently ambiguous when every grammar for it is ambiguous. Some context-free languages are, and that is a theorem about the language, not about one description of it.',
      keyword: 'inherently ambiguous',
      trap: 'Showing one ambiguous grammar does not show the language is inherently ambiguous. You must show that no unambiguous grammar exists, which is a much stronger claim.'
    },
    {
      id: 'tree-4', scene: 'tree', start: 52.5, end: 60,
      caption: 'Counting trees is mechanical: the number of binary bracketings of n operators is the Catalan number.',
      detail: 'The model on this page counts parse trees for the three-rule expression grammar by dynamic programming over substrings, then checks the count against an independent enumeration of derivations. For id plus id plus id it reports 2.',
      narration: 'Counting is mechanical, not a matter of taste. The page counts trees by dynamic programming over substrings, then recounts them by brute-force derivation to check the two agree. For two plus signs and three operands, the answer is two.',
      keyword: 'Catalan count',
      trap: 'The count depends on the grammar. A question about the number of parse trees is a question about a named grammar, and the same string under a fixed grammar can have one tree or many.'
    },

    /* ---------------- scene 3: normal form ---------------- */
    {
      id: 'normalform-1', scene: 'normalform', start: 60, end: 67.5,
      caption: 'Three cleanups come first: drop useless symbols, then epsilon rules, then unit rules.',
      detail: 'A symbol is useless if it never appears in a derivation of a terminal string, or is unreachable from the start symbol. An epsilon rule A to epsilon is removed by adding rules that delete A wherever it could appear. A unit rule A to B is removed by copying the rules of B onto A.',
      narration: 'Before any normal form, three cleanups. Delete symbols that can never produce a terminal string or can never be reached. Remove epsilon rules by adding rules that omit the symbol. Remove unit rules by copying the target rules onto the source.',
      keyword: 'useless, epsilon, unit',
      trap: 'Order matters. Removing unit rules before epsilon rules can reintroduce epsilon rules, and the standard order is useless, then epsilon, then unit.'
    },
    {
      id: 'normalform-2', scene: 'normalform', start: 67.5, end: 75,
      caption: 'In Chomsky normal form every rule is A to B C or A to a. Nothing else is allowed.',
      detail: 'Every context-free language not containing the empty string has a grammar in this form, and if the empty string is in the language the only exception permitted is S to epsilon with S absent from every right side.',
      narration: 'Chomsky normal form allows two shapes only: one nonterminal becoming two nonterminals, or one nonterminal becoming one terminal. Every context-free language has such a grammar, with a single exception for the empty string.',
      keyword: 'A to B C or A to a',
      trap: 'A to B C requires two nonterminals, not a nonterminal and a terminal. A to a B is not in Chomsky normal form and must be split.'
    },
    {
      id: 'normalform-3', scene: 'normalform', start: 75, end: 82.5,
      caption: 'Binarising makes every tree binary, so a string of length n has exactly 2n minus 1 nodes on its derivation.',
      detail: 'Each internal node adds exactly two children, so the tree has n leaves and n minus 1 internal nodes, and the derivation takes 2n minus 1 steps. This page converts a grammar to the form in code and checks on every string up to length five that the language did not change.',
      narration: 'Why bother? Because a binary tree is countable. With n leaves there are exactly n minus 1 internal nodes, so the derivation takes exactly two n minus one steps. The page converts a grammar in code and checks that no string changed sides.',
      keyword: '2n minus 1',
      trap: 'The step count 2n minus 1 holds in Chomsky normal form. In a general grammar a derivation of the same string can be much shorter or longer.'
    },
    {
      id: 'normalform-4', scene: 'normalform', start: 82.5, end: 90,
      caption: 'Two tools need this form: the CYK membership test, and the pumping lemma for context-free languages.',
      detail: 'CYK fills a triangular table over substrings in cubic time. The pumping lemma takes its constant from the number of nonterminals, and its proof needs the binary tree to force a repeated nonterminal on a long path.',
      narration: 'Two things need the normal form. The CYK membership test, which fills a table over substrings. And the pumping lemma, whose proof needs a binary tree deep enough that some nonterminal must repeat on one path.',
      keyword: 'CYK and the pumping lemma',
      trap: 'CYK is a membership test, not a parsing strategy for compilers, and it is cubic. A question that asks for the complexity of CYK wants cubic time in the length of the string.'
    },

    /* ---------------- scene 4: stack ---------------- */
    {
      id: 'stack-1', scene: 'stack', start: 90, end: 97.5,
      caption: 'A pushdown automaton is a finite machine plus a stack. Seven parts, and the stack is the only new one.',
      detail: 'The seven parts are states Q, input alphabet Sigma, stack alphabet Gamma, transition function delta, start state, initial stack symbol, and accepting states. delta maps a state, an input symbol or epsilon, and a stack top, to a set of state-and-push-string pairs.',
      narration: 'A pushdown automaton is a finite machine with a stack. Seven parts: states, input alphabet, stack alphabet, transition function, start state, bottom-of-stack symbol, and accepting states. The stack is the only part a finite automaton does not have.',
      keyword: 'seven-tuple',
      trap: 'The stack alphabet is not the input alphabet. A machine may push symbols that never appear in the input, and exam questions often rely on that.'
    },
    {
      id: 'stack-2', scene: 'stack', start: 97.5, end: 105,
      caption: 'One move reads one input symbol or nothing, pops the stack top, and pushes a string in its place.',
      detail: 'A push of one symbol is a replacement of the top by that symbol plus the old contents. A pop is a replacement by the empty string. Every textbook push and pop is therefore the same operation written three ways.',
      narration: 'One move does three things: it reads one input symbol or nothing at all, it pops the top of the stack, and it pushes a string in its place. A push is that with a one-symbol string; a pop is that with the empty string.',
      keyword: 'read, pop, push',
      trap: 'An epsilon move consumes no input but does change the stack. A run that only takes epsilon moves can loop forever without reading anything.'
    },
    {
      id: 'stack-3', scene: 'stack', start: 105, end: 112.5,
      caption: 'An instantaneous description records the state, the unread input, and the whole stack.',
      detail: 'A snapshot is written as state, remaining input, stack contents with the top on the left. A run is a sequence of snapshots, and the machine accepts a string when some run starts at the initial snapshot and ends in an accepting one with the input exhausted.',
      narration: 'A snapshot has three parts: the state, the part of the input not yet read, and the stack. A run is a sequence of snapshots. The machine accepts when some run ends with the input finished, in a state and stack that count as accepting.',
      keyword: 'instantaneous description',
      trap: 'The input is read left to right and never rewound. A machine cannot go back, which is why the order of comparisons matters so much.'
    },
    {
      id: 'stack-4', scene: 'stack', start: 112.5, end: 120,
      caption: 'Last in, first out: the stack can compare a prefix with the reverse of a later block, and nothing else.',
      detail: 'Pushing a block and popping it gives back the block reversed. So the machine can check that a later block is the mirror of an earlier one, or that a count matches, because a count does not care about order. It cannot check that a later block equals an earlier block in the same order.',
      narration: 'The stack is last in, first out. Whatever you push comes back reversed. That single fact decides almost every question in this topic: a mirror can be checked, a copy cannot, and a count can because a count has no order.',
      keyword: 'last in, first out',
      trap: 'Do not think of the stack as a tape. It has no head that can move; only the top is ever visible.'
    },

    /* ---------------- scene 5: run ---------------- */
    {
      id: 'run-1', scene: 'run', start: 120, end: 127.5,
      caption: 'For a to the n b to the n: push one marker per a, pop one per b, accept when both are exhausted together.',
      detail: 'The machine starts with the bottom marker Z on the stack. On each a it pushes A. On the first b it switches state and starts popping one A per b. If the stack reaches the bottom exactly when the input ends, the counts matched.',
      narration: 'The design is two lines. Push a marker for every a. Then pop one marker for every b. If the stack reaches its bottom exactly when the input runs out, the two counts were equal.',
      keyword: 'push then pop',
      trap: 'The switch from pushing to popping must happen at the first b. If the machine keeps pushing on b, or pops on a, the counts are never compared.'
    },
    {
      id: 'run-2', scene: 'run', start: 127.5, end: 135,
      caption: 'Watch a a b b: the stack grows to two markers, then shrinks to the bottom marker, and the input ends at the same moment.',
      detail: 'The model on this page simulates this machine on every string over a and b up to length six and compares its verdict with the definition of the language. It reports the number of strings on which the two agree.',
      narration: 'Watch the string a a b b. Two markers go on, two come off, the input ends exactly as the bottom marker reappears, and the machine accepts. The page simulates this on every short string and checks each verdict against the definition.',
      keyword: 'aabb accepted',
      trap: 'A rejected string can still have a run that gets far. Acceptance needs one successful run; rejection needs every run to fail.'
    },
    {
      id: 'run-3', scene: 'run', start: 135, end: 142.5,
      caption: 'Acceptance by final state and by empty stack are equivalent for nondeterministic machines, and not for deterministic ones.',
      detail: 'For a nondeterministic machine either convention can be converted into the other. For a deterministic machine the two conventions give the same class only with care about how the input ends, which is why textbooks state the equivalence for the nondeterministic case.',
      narration: 'Two conventions exist: accept in a final state, or accept with an empty stack. For nondeterministic machines they describe the same languages. For deterministic ones the correspondence needs care, which is why the textbooks state it for the nondeterministic case.',
      keyword: 'two acceptance modes',
      trap: 'Do not assume a machine that empties its stack accepts. The acceptance condition is part of the definition, not a consequence of the stack being empty.'
    },
    {
      id: 'run-4', scene: 'run', start: 142.5, end: 150,
      caption: 'Deterministic pushdown machines are strictly weaker: w w reversed is context-free, and no deterministic machine accepts it.',
      detail: 'A deterministic machine must decide where the middle is without guessing, and the middle of w w reversed is not detectable from one symbol of lookahead. Nondeterminism guesses the middle, which is exactly the extra power. GATE CSE 2011 asked which pair of models differs in power; this is the pair.',
      narration: 'Here is the one asymmetry that matters. A deterministic machine cannot find the middle of a string without guessing, so the mirror language w w reversed has no deterministic machine, though it plainly has a nondeterministic one. Nondeterminism is real power here, unlike in the finite case.',
      keyword: 'DPDA is weaker',
      trap: 'DFA equals NFA, but DPDA is strictly weaker than NPDA. Confusing the two rows is the commonest error in this topic.'
    },

    /* ---------------- scene 6: limits ---------------- */
    {
      id: 'limits-1', scene: 'limits', start: 150, end: 157.5,
      caption: 'The mirror language works because pushing and popping reverses. The copy language fails for the same reason.',
      detail: 'In w w reversed the second half is the first half backwards, so popping the stack in order reads it out correctly. In w w the second half is the first half forwards, and the stack hands it back backwards.',
      narration: 'The mirror language works because the stack reverses, and the mirror is reversed. The copy language fails for exactly the same reason: the stack hands the first half back backwards, and the second half needs it forwards.',
      keyword: 'mirror works, copy fails',
      trap: 'The copy language w w is not context-free, but its complement is. A non-context-free language can have a context-free complement, because the class is not closed under complement.'
    },
    {
      id: 'limits-2', scene: 'limits', start: 157.5, end: 165,
      caption: 'a to the n b to the n c to the n needs two comparisons, and one stack is spent after the first.',
      detail: 'Comparing a with b consumes the stack. When the c block starts the stack is empty, so the count of a is gone and cannot be compared with the count of c. Two independent counters would be needed, which is a second stack.',
      narration: 'Now three blocks. Comparing a with b spends the stack. By the time c arrives there is nothing left to compare it with, so the first count is lost. Two comparisons need two counters, and one stack holds one.',
      keyword: 'two comparisons',
      trap: 'It is the number of simultaneous comparisons that matters, not the number of symbols in the alphabet. Three blocks with two comparisons are fine, as the next event shows.'
    },
    {
      id: 'limits-3', scene: 'limits', start: 165, end: 172.5,
      caption: 'a to the n b to the n c to the m and a to the m b to the n c to the n are both context-free, and their intersection is not.',
      detail: 'Each language makes one comparison and lets the third block be free, so each has a grammar. Their intersection forces all three counts equal, which is the language of the previous event. GATE CSE 2017 Set 1 asked about exactly this union and this intersection.',
      narration: 'Watch the quantifiers. If the third block is free, one comparison remains and the language is context-free. Take two such languages and intersect them, and all three counts are forced equal, which is not context-free.',
      keyword: 'intersection breaks it',
      trap: 'The union of two context-free languages is always context-free. The intersection of two is not, and this pair is the standard counterexample.'
    },
    {
      id: 'limits-4', scene: 'limits', start: 172.5, end: 180,
      caption: 'The one-line test: count how many independent quantities must be compared at once. One is context-free, two usually is not.',
      detail: 'This is a heuristic for reading a question quickly, not a proof. It fails on languages whose structure hides a comparison, and it says nothing about complements. Every answer must still be backed by a grammar or by the pumping lemma.',
      narration: 'So here is the fast test. Count the independent quantities that must be compared at once. One is context-free. Two is usually not. It is a way to guess quickly, never a way to prove.',
      keyword: 'count the comparisons',
      trap: 'The test is a heuristic. A language with one visible comparison can still be non-context-free, so a question that asks you to prove needs the lemma, not this sentence.'
    },

    /* ---------------- scene 7: closure ---------------- */
    {
      id: 'closure-1', scene: 'closure', start: 180, end: 187.5,
      caption: 'Context-free languages are closed under union, concatenation, star, reversal, and intersection with a regular language.',
      detail: 'Union, concatenation and star are shown by building a new grammar whose start symbol chooses between the two old start symbols, or repeats one. Reversal is shown by reversing every right side. Intersection with a regular language is shown by running the two machines together, which works because the finite machine needs no stack.',
      narration: 'Five operations keep you inside the class. Union, concatenation, star, reversal, and intersection with a regular language. Each has a short construction, and the last one is the one exam questions lean on.',
      keyword: 'closed under union',
      trap: 'Intersection with a regular language is inside the class. Intersection with another context-free language is not, and the two are easy to conflate.'
    },
    {
      id: 'closure-2', scene: 'closure', start: 187.5, end: 195,
      caption: 'Two operations do not: intersection, and complement.',
      detail: 'The pair a to the n b to the n c to the m and a to the m b to the n c to the n is context-free, and their intersection is not, so the class is not closed under intersection. Complementation also fails, and a separate argument is needed for it.',
      narration: 'Two operations fail. Intersection, because of the pair from the previous scene. And complement, which fails for its own reason. Both failures are examinable, and neither is obvious from the grammar.',
      keyword: 'not closed under intersection',
      trap: 'Do not write that context-free languages are closed under complement. Only the deterministic subclass is.'
    },
    {
      id: 'closure-3', scene: 'closure', start: 195, end: 202.5,
      caption: 'The useful exception: if one of the two languages is regular, the intersection is context-free.',
      detail: 'The finite machine tracks the regular condition in its states while the stack does the context-free work, so the product has finitely many extra states and one stack. GATE CSE 2011 used this to ask which expression involving a regular P and a context-free Q inside P is always regular, and the answer was the complement of P.',
      narration: 'The exception is the useful one. If one of the two languages is regular, the intersection stays context-free, because a finite machine can carry the regular condition in its states while the stack does the other job.',
      keyword: 'intersection with regular',
      trap: 'The regular language must be genuinely regular. A context-free language that happens to be described simply is not enough for this argument.'
    },
    {
      id: 'closure-4', scene: 'closure', start: 202.5, end: 210,
      caption: 'Deterministic context-free languages are closed under complement. The whole class is not, and w w proves it.',
      detail: 'GATE CSE 2022 asked about w w, whose complement is context-free: a machine guesses one mismatching position and checks it. The same question asked whether the intersection of two deterministic context-free languages is context-free, and it is not. Three statements were false.',
      narration: 'One asymmetry to keep. Deterministic context-free languages are closed under complement. The whole class is not. The copy language is not context-free, yet its complement is, and a machine finds it by guessing one mismatching position.',
      keyword: 'complement of w w is CFL',
      trap: 'A language and its complement can sit on opposite sides of the boundary. Never infer one from the other in this class.'
    },

    /* ---------------- scene 8: pump ---------------- */
    {
      id: 'pump-1', scene: 'pump', start: 210, end: 217.5,
      caption: 'The pumping lemma: a long enough string splits into five parts, and the two middle pieces can be repeated together.',
      detail: 'If L is context-free there is a constant p such that every string of length at least p can be written u v w x y with v x non-empty, with the whole middle v w x at most p long, and with u v to the i w x to the i y in L for every i.',
      narration: 'The statement has three conditions. Split a long string into five parts. The two pumpable pieces are not both empty, the middle three together are short, and repeating both pieces together keeps the string in the language.',
      keyword: 'u v w x y',
      trap: 'There are two pumped pieces, not one, and they are pumped together. Pumping only one of them, as in the regular lemma, is a different lemma.'
    },
    {
      id: 'pump-2', scene: 'pump', start: 217.5, end: 225,
      caption: 'Why two pieces: a binary tree repeats a nonterminal on a path, and that repeat carries two subtrees side by side.',
      detail: 'In Chomsky normal form the tree is binary, so a long enough string forces a path with more nonterminals than there are nonterminals in the grammar, and some nonterminal repeats. The two occurrences cut out a middle and a pair of sibling subtrees, which is why two pieces move together.',
      narration: 'The reason is the tree. In binary form a long string forces a path longer than the number of nonterminals, so some nonterminal repeats. The repeat cuts out a middle and a pair of sibling subtrees, and that pair is why two pieces move together.',
      keyword: 'repeated nonterminal',
      trap: 'The constant p comes from the grammar, not from the language. Different grammars for the same language can give different constants, and that is fine.'
    },
    {
      id: 'pump-3', scene: 'pump', start: 225, end: 232.5,
      caption: 'Refuting a to the n b to the n c to the n: take a to the p b to the p c to the p and check every legal split.',
      detail: 'The model on this page enumerates every split of the chosen string that satisfies both conditions, and for each one finds a repetition count that leaves the language. It reports the number of splits and confirms that none survives, which is what the lemma requires for a refutation.',
      narration: 'Here is the refutation. Take the string with p of each symbol. Every legal split puts the short middle across at most two of the three blocks, so repeating both pieces unbalances some block and the string leaves the language. The page checks every split rather than arguing in prose.',
      keyword: 'every split fails',
      trap: 'The order matters. You choose the string, the adversary chooses the split. Choosing a convenient split and refuting only that one proves nothing.'
    },
    {
      id: 'pump-4', scene: 'pump', start: 232.5, end: 240,
      caption: 'What it cannot do: satisfying the lemma never proves a language context-free.',
      detail: 'The lemma is necessary, not sufficient. There are languages that satisfy it and are still not context-free, so it can only refute. To prove membership in the class you must exhibit a grammar or a machine, or use a closure property from a known member.',
      narration: 'One limit, stated plainly. Satisfying the lemma proves nothing. It is a necessary condition, so it can refute and never certify. To prove a language context-free you build a grammar or a machine, or you use closure.',
      keyword: 'necessary, not sufficient',
      trap: 'A question that asks you to prove a language is context-free wants a grammar or a PDA. The lemma is the wrong tool and scores zero even when the conclusion is true.'
    },

    /* ---------------- scene 9: gate ---------------- */
    {
      id: 'gate-1', scene: 'gate', start: 240, end: 247.5,
      caption: 'Shape one: four languages, one is not context-free. Test each by the number of comparisons.',
      detail: 'GATE CSE 2019 asked which of four languages over a and b is not context-free. The three that are context-free each make one comparison: the mirror language, the mirror with a matched block in the middle, and a union of three fixed ratios. The fourth needs the mirror and a count at the same time.',
      narration: 'Shape one: four languages, one is not context-free. Three of them make one comparison each and have grammars. The fourth needs the mirror and a count at once, which is two, and that is the answer.',
      keyword: 'which is not context-free',
      trap: 'A union of context-free languages is context-free, so a language that looks like several conditions may be one condition repeated three ways.'
    },
    {
      id: 'gate-2', scene: 'gate', start: 247.5, end: 255,
      caption: 'Shape two: a union and an intersection of the same pair. Union yes, intersection no.',
      detail: 'GATE CSE 2017 Set 1 gave the two languages with a free third block and asked which of their union and intersection are context-free. The union is, because the class is closed under union. The intersection forces three equal counts and is not.',
      narration: 'Shape two: the union and the intersection of one pair. The union is context-free by closure. The intersection forces all three counts equal and is not. The answer is the union only.',
      keyword: 'union yes, intersection no',
      trap: 'Reading the options quickly makes both halves look the same. Write down what the intersection is before you judge it.'
    },
    {
      id: 'gate-3', scene: 'gate', start: 255, end: 262.5,
      caption: 'Shape three: a multiple-select cluster of statements about determinism and complements.',
      detail: 'GATE CSE 2022 gave three languages and four statements, and asked which are false. The copy language is not context-free but its complement is; the two free-block languages are deterministic context-free; their intersection is not context-free. Three of the four statements are false.',
      narration: 'Shape three is a statement cluster, often multiple-select. One statement about determinism, one about context-freeness, one about an intersection, one about a complement. Judge each separately, and expect more than one to be false.',
      keyword: 'statement cluster',
      trap: 'In a multiple-select, a statement that is half true is false. The first statement in the 2022 question is true overall even though it mentions the non-context-free language, because it says that language is not context-free.'
    },
    {
      id: 'gate-4', scene: 'gate', start: 262.5, end: 270,
      caption: 'Shape four: read a grammar back to its language. Shape five: which of four languages are context-free.',
      detail: 'GATE CSE 2009 gave the grammar with a and b wrapping a single symbol and asked what it generates: the odd length palindromes, not all palindromes and not all strings that begin and end alike. GATE CSE 2018 gave four languages built from four blocks and asked which two are context-free.',
      narration: 'Two more shapes. Read a grammar back to a language, which is a matter of generating the first few strings and then generalising carefully. And pick the context-free ones out of four, which is the comparison test again with more arithmetic.',
      keyword: 'grammar to language',
      trap: 'For the grammar with one-symbol bases, the empty string is not generated. All palindromes is the tempting option and it is wrong for exactly that reason.'
    },

    /* ---------------- scene 10: decide ---------------- */
    {
      id: 'decide-1', scene: 'decide', start: 270, end: 277.5,
      caption: 'Step one: read the language as a set of comparisons, and count the independent ones.',
      detail: 'Write the language in the form a count of blocks with conditions between them. One condition means one stack is enough. Two conditions that share no block mean a stack is not enough, unless the conditions are nested rather than crossed.',
      narration: 'Step one. Rewrite the language as blocks and conditions. One condition, one stack. Two conditions on disjoint blocks, and the stack is not enough. Two conditions nested inside each other, and it may still be fine.',
      keyword: 'step one: count comparisons',
      trap: 'Crossing comparisons fail; nesting usually succeeds. The mirror language nests, the copy language crosses.'
    },
    {
      id: 'decide-2', scene: 'decide', start: 277.5, end: 285,
      caption: 'Step two: try to build. A grammar or a machine settles the question, and you can stop.',
      detail: 'For a yes, one construction is a complete answer: name the grammar, or describe the machine and its stack discipline. Do not reach for the pumping lemma to prove membership; it cannot do it.',
      narration: 'Step two. Try to build it. A grammar of three or four rules, or a machine that pushes on one block and pops on the next, is a complete proof of yes. Once it works, stop.',
      keyword: 'step two: construct',
      trap: 'A half-built machine proves nothing. If the stack discipline does not cover every symbol, the construction is not finished.'
    },
    {
      id: 'decide-3', scene: 'decide', start: 285, end: 292.5,
      caption: 'Step three: if the build fails, pump. Choose a string with the right counts, then refute every split.',
      detail: 'Choose a string that pins all the dependent counts, typically one block per count at the pumping length. Then, for each legal split, name a repetition count that breaks a count. The proof is complete only when no split survives.',
      narration: 'Step three. If no construction comes, pump. Choose a string with one block per dependent count, then refute every legal split by naming a repetition count that breaks a count. No split may survive.',
      keyword: 'step three: pump',
      trap: 'Picking i equals zero and showing the string shrinks is not always enough. Some splits survive one choice and die at another, so the refutation must be exhaustive.'
    },
    {
      id: 'decide-4', scene: 'decide', start: 292.5, end: 300,
      caption: 'Step four: check the quantifiers, the empty string, and whether the question says deterministic.',
      detail: 'Four slips account for most lost marks: treating a grammar as ambiguous because two derivations exist, assuming the class is closed under intersection or complement, forgetting that the empty string is excluded from Chomsky normal form, and confusing DFA with NFA on the determinism question.',
      narration: 'Step four, the checklist. Derivations versus trees. Intersection and complement are not closed. The empty string is the exception in the normal form. And determinism costs power here, unlike in the finite case. Those four cover most lost marks.',
      keyword: 'the checklist',
      trap: 'Every one of these four is a statement that is true in the regular case and false here. That is why they are the standard distractors.'
    }
  ]
};
