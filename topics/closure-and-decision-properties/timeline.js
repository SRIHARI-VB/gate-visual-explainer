/* ==========================================================================
   closure-and-decision-properties — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   captions.vtt, captions.srt and transcript.md are generated from this file by
   tools/gen-captions.mjs — never edited by hand.

   Every number quoted below is computed by the model in lesson.js when the page
   loads and printed on the canvas: the 8 witnesses for a^n b^n that leave no
   surviving split; the 132 / 129 / 125 / 117 / 106 members of
   {a^i b^j c^k : i = 1 implies j = k} tried at p = 1..5, of which 24 fail at
   p = 1 and none fail from p = 2; the 6 / 37 / 121 / 295 / 605 / 1106 legal
   CFL splits of a^n b^n c^n for n = 1..6, none of which survives; the seven
   regular operations checked against their definitions on all 255 strings of
   length <= 7, giving 7 / 7 / 7 / 3 / 7 / 3 / 4 states against minimal
   5 / 5 / 5 / 3 / 3 / 3 / 4; the product grammar of 5 nonterminals and 19
   productions verified on all 127 strings of length <= 6; and the parse-tree
   counts 1, 1, 2, 5, 14, 42, 132, 429 for a^1 to a^8 under S -> S S | a.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'why', n: 1,
      title: 'Two questions about a class of languages',
      start: 0, end: 30,
      objective: 'See the two separate questions the syllabus asks about regular and context-free languages — which operations keep a language inside its class, and which questions an algorithm can answer — and why they are different questions.'
    },
    {
      id: 'pumpreg', n: 2,
      title: 'The regular pumping lemma as a game',
      start: 30, end: 60,
      objective: 'State the lemma with its three conditions, see why it must be true for any finite automaton, and watch a^n b^n lose the game at every p tried.'
    },
    {
      id: 'pumplen', n: 3,
      title: 'The pumping length is a number with a direction',
      start: 60, end: 90,
      objective: 'Separate the lemma\'s constant p from the language it belongs to: any p at least as large as the smallest one works, and a proposed p can be too small. Meet the 2019 question.'
    },
    {
      id: 'pumpweak', n: 4,
      title: 'Necessary, never sufficient',
      start: 90, end: 120,
      objective: 'Meet a language that satisfies the lemma from p = 2 upward and is still not regular, and see why passing the test can never be a proof of regularity.'
    },
    {
      id: 'cflpump', n: 5,
      title: 'The same game with five pieces',
      start: 120, end: 150,
      objective: 'State the CFL lemma, count its legal splits, and watch a^n b^n c^n lose at every n — the language that two context-free languages produce when intersected.'
    },
    {
      id: 'closreg', n: 6,
      title: 'Closure: seven operations, all of them kept',
      start: 150, end: 180,
      objective: 'Run union, intersection, difference, complement, concatenation, star and reversal on two automata, count the states each construction needs, and confirm all seven against their definitions.'
    },
    {
      id: 'closurecfl', n: 7,
      title: 'Closure: what context-free languages lose',
      start: 180, end: 210,
      objective: 'Confirm union, concatenation and star by generating grammar, then watch intersection and complement fail — with the witness that fails and the one-line argument that settles complement.'
    },
    {
      id: 'hybrid', n: 8,
      title: 'The one asymmetric tool: CFL intersect regular',
      start: 210, end: 240,
      objective: 'Build the product grammar, count its nonterminals and productions, verify it against its definition, and see why this construction is the standard way to prove a language context-free.'
    },
    {
      id: 'decide', n: 9,
      title: 'Which questions an algorithm can answer',
      start: 240, end: 270,
      objective: 'Read the six decision questions across the two classes, name the procedure for each decidable one, and identify the three that separate regular from context-free.'
    },
    {
      id: 'exam', n: 10,
      title: 'How the question is asked',
      start: 270, end: 300,
      objective: 'Apply the two checks — which class is the language in, and does the claim say "always" or "this instance" — to the five verified previous-year questions that sit on this clause.'
    }
  ],

  events: [
    /* ---------- scene 1: why ---------- */
    {
      id: 's1a', start: 0, end: 7.5, scene: 'why',
      caption: 'A class of languages is judged by what it survives and what it answers.',
      detail: 'Regular languages and context-free languages are two classes. Two separate questions are asked about each. First: if you take languages in the class and combine them with an operation, is the result still in the class? Second: if you are handed a machine or a grammar from the class, is there an algorithm that answers a given question about it?',
      narration: 'Two questions: what survives combination, and what can be answered.',
      keyword: 'two questions'
    },
    {
      id: 's1b', start: 7.5, end: 15, scene: 'why',
      caption: 'Closure is about operations. Decidability is about questions.',
      detail: 'Closure is a statement about a set of languages and an operation on them: the class is closed under the operation when applying it to members never leaves the class. Decidability is a statement about a single machine or grammar and a question asked of it: there is an algorithm that always halts with the right yes or no. A class can be closed under an operation and still have an undecidable question, and the other way round.',
      narration: 'Closure is about operations. Decidability is about questions.',
      keyword: 'closure and decidability'
    },
    {
      id: 's1c', start: 15, end: 22.5, scene: 'why',
      caption: 'The pumping lemma is the tool that proves a language is outside a class.',
      detail: 'Both lemmas have the same shape: a language in the class must have some constant, and every long enough member must contain a piece that can be repeated or removed without leaving the language. Failing the test proves the language is outside the class. Passing it proves nothing, and the difference between those two directions is where most marks are lost.',
      narration: 'Failing proves outside. Passing proves nothing.',
      keyword: 'one direction only',
      trap: 'A language that passes the pumping lemma is not thereby regular. The lemma is necessary, never sufficient.'
    },
    {
      id: 's1d', start: 22.5, end: 30, scene: 'why',
      caption: 'Syllabus position: Section 6 names this clause in its own words.',
      detail: 'Section 6 of the GATE 2027 CS syllabus, IIT Madras, reads: "Regular expressions and finite automata. Context-free grammars and push-down automata. Regular and context-free languages, pumping lemma. Turing machines and undecidability." The third clause is this lesson, so the whole page is class A: named, not inferred.',
      narration: 'The third clause names this page directly. Class A.',
      keyword: 'Section 6, clause three'
    },

    /* ---------- scene 2: pumpreg ---------- */
    {
      id: 's2a', start: 30, end: 37.5, scene: 'pumpreg',
      caption: 'A long enough word in a regular language contains a loop, and the loop can be repeated.',
      detail: 'A finite automaton has finitely many states. A word longer than the number of states must visit some state twice, so the piece of the word between the two visits is a loop. Running that loop once more, or not at all, keeps the machine in the same state, so the pumped word is accepted too.',
      narration: 'Long word, repeated state, so a loop. Repeat the loop.',
      keyword: 'a loop in the run'
    },
    {
      id: 's2b', start: 37.5, end: 45, scene: 'pumpreg',
      caption: 'Three conditions: |y| at least 1, |xy| at most p, and every pump stays inside.',
      detail: 'The word splits as x y z. The piece y must be non-empty, or pumping changes nothing. The prefix x y must be short — at most the pumping length — because the loop is found inside the first p steps. And for every count i from 0 upward, x y^i z must still be in the language. A split satisfying all three is called surviving here.',
      narration: 'Non-empty y, short prefix, every pump inside the language.',
      keyword: 'three conditions'
    },
    {
      id: 's2c', start: 45, end: 52.5, scene: 'pumpreg',
      caption: 'a^n b^n loses at every p from 1 to 8: the only legal y sits among the a\'s.',
      detail: 'The witness for a proposed p is a^p b^p. Any y with |xy| at most p lies entirely inside the a-block, because the first p symbols are all a. Pumping it up gives more a\'s than b\'s, which is outside the language. The page tries every legal split of all eight witnesses and records that none survives.',
      narration: 'Eight witnesses, every legal split, none survives.',
      keyword: 'no surviving split'
    },
    {
      id: 's2d', start: 52.5, end: 60, scene: 'pumpreg',
      caption: 'The witness has to be chosen, not searched: a^p b^p is the whole proof.',
      detail: 'The page searches mechanically, but a person does not have to. For any p, take a^p b^p. Since the first p symbols are a\'s, y is a block of a\'s; pump it and the counts differ. One sentence covers every p at once, which is what a proof is. The search exists to show that the sentence is not hiding a case.',
      narration: 'One sentence covers every p. That is the proof.',
      keyword: 'the witness is chosen',
      trap: 'Proving non-regularity needs one witness per p, given symbolically. Checking a few values of p proves nothing.'
    },

    /* ---------- scene 3: pumplen ---------- */
    {
      id: 's3a', start: 60, end: 67.5, scene: 'pumplen',
      caption: 'The lemma says some p exists. It never says which p.',
      detail: 'The statement is existential: there exists a pumping length p such that every member at least that long can be pumped. It does not name the number, and it does not say the number is the state count, although the state count always works. Any larger number also works, because fewer words are long enough to be tested.',
      narration: 'Some p exists. The lemma does not say which.',
      keyword: 'exists, not which'
    },
    {
      id: 's3b', start: 67.5, end: 75, scene: 'pumplen',
      caption: 'If p works then every larger p works, so the useful number is the smallest one.',
      detail: 'Raising p removes words from the test without adding any, so a language that survives at p survives at every larger value. That makes "the minimum pumping length" a property of the language. In the 2019 question, {a^(2+3k)} union {b^(10+12k)} has minimum pumping length 12, and the option 24 is a correct answer precisely because it is at least 12.',
      narration: 'Larger p is weaker. The smallest one is the property.',
      keyword: 'minimum pumping length'
    },
    {
      id: 's3c', start: 75, end: 82.5, scene: 'pumplen',
      caption: 'At p = 1 this page\'s test language loses 24 of its 132 members; from p = 2 it loses none.',
      detail: 'The language {a^i b^j c^k : i = 1 implies j = k} is the page\'s worked case. At p = 1 the only legal split is y equal to the first symbol, and pumping a word like aab down to ab breaks the condition. At p = 2 the split y equal to the first two symbols, or simply y equal to the first symbol when there are at least two a\'s, survives every pump. The page records 24 failures at p = 1 and none at p = 2, 3, 4 and 5.',
      narration: 'Twenty-four failures at one, none from two upward.',
      keyword: '24 at p = 1'
    },
    {
      id: 's3d', start: 82.5, end: 90, scene: 'pumplen',
      caption: 'A wrong pumping length is not a counterexample to the lemma.',
      detail: 'Showing that a proposed p fails says only that p was too small. Non-regularity needs a failure at every p at once, which is why the a^n b^n argument is symbolic in p rather than a list of values. GATE 2019 Q15 asks for a pumping length, not the minimum, and the keyed answer 24 is correct for exactly that reason.',
      narration: 'A p that fails is a p that was too small.',
      keyword: 'too small, not a counterexample',
      trap: 'Answering "no pumping length exists" because one small p failed is the standard mistake on this question.'
    },

    /* ---------- scene 4: pumpweak ---------- */
    {
      id: 's4a', start: 90, end: 97.5, scene: 'pumpweak',
      caption: 'This page\'s worked language passes the lemma from p = 2 and is still not regular.',
      detail: 'Every member of {a^i b^j c^k : i = 1 implies j = k} of length at least p can be pumped, for p = 2 and above, which the page checks on 129, 125, 117 and 106 members. So the lemma is satisfied. And the language is not regular, so passing the test cannot imply regularity.',
      narration: 'It passes from two upward. It is still not regular.',
      keyword: 'passes and still not regular'
    },
    {
      id: 's4b', start: 97.5, end: 105, scene: 'pumpweak',
      caption: 'The intersection with a b* c* is a b^j c^j, which fails the lemma outright.',
      detail: 'The regular language a b* c* keeps only the members that begin with a single a. Inside it, the worked language becomes {a b^j c^j : j at least 0}, which the page shows failing at every p from 1 to 6 with witness a b^p c^p. Regular languages are closed under intersection, so if the worked language were regular this intersection would be regular too. It is not, so the worked language is not.',
      narration: 'Intersect with a regular language. The result fails, so the original was not regular.',
      keyword: 'intersection proves it'
    },
    {
      id: 's4c', start: 105, end: 112.5, scene: 'pumpweak',
      caption: 'Every finite language is regular, and for it the lemma is vacuous.',
      detail: 'Choose p larger than the longest word in a finite language and no word is long enough to be tested, so the condition holds with nothing to check. That is not a weakness of the lemma: it is the lemma being satisfied by a language that really is regular. The vacuous case is a reminder that the lemma only ever speaks about long words.',
      narration: 'Longer than every word: nothing to test, nothing to prove.',
      keyword: 'vacuous for finite languages'
    },
    {
      id: 's4d', start: 112.5, end: 120, scene: 'pumpweak',
      caption: 'To prove a language regular, build a machine. To prove it irregular, fail the lemma or use closure.',
      detail: 'There are two sound routes and one unsound one. Build a DFA, an NFA or a regular expression: that proves membership in the class. Fail the lemma, or show that intersecting with a regular language produces something already known to be outside the class: that proves non-membership. Passing the lemma proves nothing in either direction.',
      narration: 'Two sound routes. Passing the lemma is not one of them.',
      keyword: 'two sound routes',
      trap: 'A language that passes the pumping lemma is not thereby regular. Use Myhill-Nerode or a closure argument instead.'
    },

    /* ---------- scene 5: cflpump ---------- */
    {
      id: 's5a', start: 120, end: 127.5, scene: 'cflpump',
      caption: 'The CFL lemma splits a word into five pieces: u v w x y.',
      detail: 'A context-free grammar has finitely many nonterminals, so a long enough derivation must repeat one. The repeated nonterminal sits inside the parse tree, and the two pieces it grows between the repetitions — v on the left and x on the right — can be pumped together. The middle piece w sits between them and is never touched.',
      narration: 'Five pieces. Two of them pump together.',
      keyword: 'u v w x y'
    },
    {
      id: 's5b', start: 127.5, end: 135, scene: 'cflpump',
      caption: 'The conditions: |vwx| at most n, and v and x not both empty.',
      detail: 'The window v w x is short, at most the pumping length, because the repeated nonterminal is found near the bottom of the tree. And at least one of v and x is non-empty, or pumping changes nothing. Both pump together with the same count i, which is what makes this lemma weaker than the regular one: the two pieces are tied to each other.',
      narration: 'Short window. Not both empty. Both pump together.',
      keyword: 'tied together'
    },
    {
      id: 's5c', start: 135, end: 142.5, scene: 'cflpump',
      caption: 'a^n b^n c^n loses: the window can cover at most two of the three blocks.',
      detail: 'For the witness a^n b^n c^n the window v w x has length at most n, so it can reach into at most two of the three blocks of n identical symbols. Pumping therefore changes the count of at most two of the three letters, and the three counts can no longer be equal. The page tries 6, 37, 121, 295, 605 and 1106 legal splits for n from 1 to 6, and none survives.',
      narration: 'At most two blocks. At most two counts change.',
      keyword: 'at most two blocks'
    },
    {
      id: 's5d', start: 142.5, end: 150, scene: 'cflpump',
      caption: 'a^n b^n c^n is the intersection of two context-free languages, which is the next scene.',
      detail: 'The language a^n b^n c^m is context-free, because one stack matches the a\'s against the b\'s and the c\'s are free. The language a^m b^n c^n is context-free for the same reason on the other side. Their intersection forces all three counts to be equal, which is a^n b^n c^n. So two context-free languages intersect to something outside the class.',
      narration: 'Two context-free languages, one intersection, outside the class.',
      keyword: 'the intersection witness'
    },

    /* ---------- scene 6: closreg ---------- */
    {
      id: 's6a', start: 150, end: 157.5, scene: 'closreg',
      caption: 'Two automata: a\'s divisible by 3, and contains the substring ab.',
      detail: 'The first has three states and counts a\'s modulo 3, ignoring b\'s. The second has three states and remembers whether it has just seen an a after having seen ab. Both are total, both are minimal, and both are infinite, which the page checks. Every operation in this scene runs on these two.',
      narration: 'Three states each. Every operation runs on these.',
      keyword: 'the two automata'
    },
    {
      id: 's6b', start: 157.5, end: 165, scene: 'closreg',
      caption: 'Union, intersection and difference are one product: 7 states, minimal 5.',
      detail: 'Run both machines at once and remember both states. The pair is accepting for union when either is, for intersection when both are, and for difference when the first is and the second is not. The page builds the product by reachability, so it keeps 7 of the 9 possible pairs, and minimisation then shows that 5 states suffice.',
      narration: 'One product, three answers, seven states, five after minimising.',
      keyword: '7 states, 5 minimal'
    },
    {
      id: 's6c', start: 165, end: 172.5, scene: 'closreg',
      caption: 'Complement is 3 states: flip the accepting set, after adding a sink if needed.',
      detail: 'Complement is the cheapest operation and the only one that needs no product. The one condition is that the automaton must be total, because a missing transition would otherwise become an accepting state by accident. Here both machines are already total, so the complement is the same three states with the accepting set flipped, and it accepts the other 169 of the 255 strings tried.',
      narration: 'Flip the accepting set. Only after making the machine total.',
      keyword: '3 states',
      trap: 'Complementing an NFA by flipping its accepting states gives the complement of nothing. Determinise first.'
    },
    {
      id: 's6d', start: 172.5, end: 180, scene: 'closreg',
      caption: 'Concatenation 7 states, star 3, reversal 4 — and all seven agree with their definitions.',
      detail: 'Concatenation links the first machine to the second with an epsilon move and determinises, reaching 7 subsets that minimise to 3. Star adds a new start state and loops back from the accepting states; because this particular language is already closed under concatenation with itself, the star changes nothing and gives 3 states. Reversal swaps every edge and starts from the old accepting states, giving 4. Every one of the seven results was compared against its set-theoretic definition on all 255 strings of length at most 7.',
      narration: 'Seven constructions, 255 strings each, seven agreements.',
      keyword: 'seven agreements'
    },

    /* ---------- scene 7: closurecfl ---------- */
    {
      id: 's7a', start: 180, end: 187.5, scene: 'closurecfl',
      caption: 'Union, concatenation and star are kept: one new start symbol is enough.',
      detail: 'For union, add a start symbol with one rule per grammar. For concatenation, add a start symbol whose single rule is the two start symbols in order. For star, add a start symbol with an empty rule and a rule that puts the old start symbol after it. Each is a grammar, so each result is context-free by construction. The page checks all three against their definitions on every string of length at most 6.',
      narration: 'One new start symbol each. All three kept.',
      keyword: 'kept'
    },
    {
      id: 's7b', start: 187.5, end: 195, scene: 'closurecfl',
      caption: 'Intersection is lost: a^n b^n c^m and a^m b^n c^n meet at a^n b^n c^n.',
      detail: 'Both inputs are context-free and their intersection is not, so the class is not closed under intersection. This is the single most examined fact on the clause. The 2017 Set 1 question asks exactly this pair: is the union context-free, is the intersection context-free. The union is, because the class is closed under union; the intersection is not.',
      narration: 'Two members, one intersection, outside the class.',
      keyword: 'intersection lost'
    },
    {
      id: 's7c', start: 195, end: 202.5, scene: 'closurecfl',
      caption: 'Complement is lost by one line: closure under complement plus union would give intersection.',
      detail: 'Intersection is expressible from union and complement by De Morgan: the intersection of two languages is the complement of the union of their complements. Union is kept, so if complement were kept, intersection would be kept as well. It is not, so complement is not. That is a derivation, not a counterexample, and it is the argument the exam expects.',
      narration: 'If complement were kept, intersection would be. It is not.',
      keyword: 'De Morgan'
    },
    {
      id: 's7d', start: 202.5, end: 210, scene: 'closurecfl',
      caption: 'Difference with a regular language is kept, even though difference is not.',
      detail: 'A context-free language minus a regular language is context-free, because it equals the intersection of the first language with the complement of the second, and the complement of a regular language is regular. Context-free languages are kept when intersected with anything regular. This is why the 2017 Set 2 answer includes L1 minus R and excludes the plain intersection of two context-free languages.',
      narration: 'Minus a regular language: kept. Minus a context-free one: not.',
      keyword: 'minus regular is fine',
      trap: 'L1 minus R is context-free. L1 minus L2 is not necessarily context-free. The second operand decides it.'
    },

    /* ---------- scene 8: hybrid ---------- */
    {
      id: 's8a', start: 210, end: 217.5, scene: 'hybrid',
      caption: 'A context-free language intersected with a regular one is context-free. That asymmetry is the tool.',
      detail: 'The class is not closed under intersection with itself, but it is closed under intersection with anything regular. The reason is that a regular language needs no stack, so it can be tracked inside the grammar\'s own nonterminals. This is the construction that proves a language context-free in almost every question of the form "is this language context-free".',
      narration: 'With itself, no. With a regular language, yes.',
      keyword: 'the asymmetry'
    },
    {
      id: 's8b', start: 217.5, end: 225, scene: 'hybrid',
      caption: 'Each nonterminal becomes a family [A,p,q]: the strings A makes that carry p to q.',
      detail: 'For a grammar with one nonterminal and a two-state automaton, the construction produces 1 times 2 times 2, which is 4 nonterminals, plus one new start symbol, so 5 in all. The rule for a nonterminal with a terminal in the middle threads the automaton state through the terminal deterministically and leaves the other states free, which is why the construction handles mixed rules and not just pairs of nonterminals.',
      narration: 'Five nonterminals: one grammar symbol times four state pairs.',
      keyword: '5 nonterminals'
    },
    {
      id: 's8c', start: 225, end: 232.5, scene: 'hybrid',
      caption: 'The example: equal counts of a and b, restricted to even length. 19 productions.',
      detail: 'The grammar S to a S b, b S a, S S, or empty generates the strings with as many a\'s as b\'s. The automaton accepts the even-length strings. The product grammar has 5 nonterminals and 19 productions, and the page runs it on all 127 strings of length at most 6, finding the same answers as the definition: equal counts and even length, with no disagreement in either direction.',
      narration: 'Nineteen productions, 127 strings, no disagreement.',
      keyword: '19 productions'
    },
    {
      id: 's8d', start: 232.5, end: 240, scene: 'hybrid',
      caption: 'The result is a grammar, so it is context-free by construction, not by inspection.',
      detail: 'The point of the construction is that it produces a grammar, and a language generated by a grammar is context-free by definition. Nothing has to be checked about stacks or about determinism. This is why the answer to "is L1 intersect L2 context-free, where L1 is context-free and L2 is regular" is always yes, and why the same question with two context-free languages has no general answer.',
      narration: 'A grammar comes out, so the class is decided.',
      keyword: 'a grammar comes out',
      trap: 'Do not answer "not necessarily context-free" when one side is regular. The construction settles it in one direction only.'
    },

    /* ---------- scene 9: decide ---------- */
    {
      id: 's9a', start: 240, end: 247.5, scene: 'decide',
      caption: 'For a regular language, all six questions have algorithms.',
      detail: 'Emptiness is reachability of an accepting state. Finiteness is a live state on a cycle. Membership is running the word through the automaton in time linear in its length. Universality is emptiness of the complement. Equivalence is emptiness of the symmetric difference. Ambiguity does not arise, because a deterministic automaton has exactly one run per word. The page runs the first two on its two automata and reports the answers.',
      narration: 'Six questions, six procedures, all of them terminate.',
      keyword: 'all six decidable'
    },
    {
      id: 's9b', start: 247.5, end: 255, scene: 'decide',
      caption: 'For a grammar, emptiness and finiteness still have algorithms, on the grammar itself.',
      detail: 'Emptiness: compute the productive nonterminals as a fixed point, and the language is empty exactly when the start symbol is not productive. The page runs this on S to A B or a, with A to a A and B to b B, and the fixed point is the single nonterminal S, so the language is the one-word language a. Finiteness: the language is infinite exactly when some reachable, productive nonterminal can derive a string containing itself. The page finds that S does so for a^n b^n and no nonterminal does for the finite grammar.',
      narration: 'Productive nonterminals for emptiness. Self-embedding for finiteness.',
      keyword: 'fixed points'
    },
    {
      id: 's9c', start: 255, end: 262.5, scene: 'decide',
      caption: 'Membership is decidable too: CYK or Earley, in time cubic in the length.',
      detail: 'Membership of a word in a context-free language is decided by parsing it, and the standard algorithms take time proportional to the cube of the word length. That is slower than the linear time a finite automaton needs, and it is still an algorithm: it always halts with the right answer. The page uses an Earley recogniser because it accepts any grammar, including empty rules and rules of mixed length.',
      narration: 'Parse it. Cubic time. Still an algorithm.',
      keyword: 'cubic time'
    },
    {
      id: 's9d', start: 262.5, end: 270, scene: 'decide',
      caption: 'Universality, equivalence and ambiguity are the three that fail for grammars.',
      detail: 'There is no algorithm that decides whether a given grammar generates every string, whether two grammars generate the same language, or whether a given grammar is ambiguous. Ambiguity is worth seeing as a fact before it is a theorem: under S to S S or a, the string a^8 has 429 different parse trees, which the page counts, so that grammar is ambiguous. Counting trees for one grammar is easy; deciding it for every grammar is not possible.',
      narration: 'Three questions, no algorithm. Ambiguity is one of them.',
      keyword: 'the undecidable three',
      trap: 'Membership being decidable does not make equivalence decidable. Equivalence quantifies over every string, and that is what fails.'
    },

    /* ---------- scene 10: exam ---------- */
    {
      id: 's10a', start: 270, end: 277.5, scene: 'exam',
      caption: 'First check: which class is each language in, and is the word "always" doing work?',
      detail: 'A question that says "always true" is asking about every pair of languages in the class, so one counterexample kills the option. A question that says "is this language context-free" is asking about one specific language, and a closure theorem can only be used in the direction that gives a yes. Using a closure theorem to answer no is the standard error, because closure failing does not mean this instance fails.',
      narration: 'Always means every instance. One counterexample ends the option.',
      keyword: 'always or this instance'
    },
    {
      id: 's10b', start: 277.5, end: 285, scene: 'exam',
      caption: 'Second check: is the operation against a regular language, or against the same class?',
      detail: 'Intersection with a regular language is safe for context-free languages; intersection with another context-free language is not. Difference with a regular language is safe; difference with a context-free language is not. In the 2021 Set 1 question the four options differ only in which operation is applied, and the keyed answer is the difference of a regular language and a context-free one.',
      narration: 'Regular on the other side changes the answer completely.',
      keyword: 'which second operand'
    },
    {
      id: 's10c', start: 285, end: 292.5, scene: 'exam',
      caption: 'Five verified questions sit on this clause, and each turns on one of these two checks.',
      detail: 'The 2024 Set 1 question on regular and non-regular languages turns on the word "always". The 2021 Set 1 question turns on the second operand being context-free. The 2017 Set 1 question turns on union against intersection. The 2017 Set 2 question turns on minus a regular language. The 2019 question turns on a pumping length being any value at least the minimum. Each is one check applied once.',
      narration: 'Five questions, two checks, applied once each.',
      keyword: 'five questions'
    },
    {
      id: 's10d', start: 292.5, end: 300, scene: 'exam',
      caption: 'Do the two checks before the arithmetic, and most wrong options remove themselves.',
      detail: 'In the 2019 question, the options 3, 5 and 9 all fall to one observation: the shortest b-string in the language has length 10, so a pumping length below 10 cannot pump it. In the 2024 question, one option falls because the union of a regular language with a non-regular one can be everything. Neither needs a construction. Both need the check to be made first.',
      narration: 'Two checks first. Then the arithmetic, if any is left.',
      keyword: 'checks before arithmetic',
      trap: 'Starting with the arithmetic is how the plausible wrong option gets chosen on both of these questions.'
    }
  ]
};
