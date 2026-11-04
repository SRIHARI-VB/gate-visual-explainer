/* ==========================================================================
   proving-a-language-is-not-context-free — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   captions.vtt, captions.srt and transcript.md are derived from this file by
   tools/gen-captions.mjs — never edited by hand.

   Every number quoted in a caption is computed by the model in lesson.js from
   the languages and their test families, and the model checks assert that the
   figure a caption states is the figure the computation produced.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'what',
      n: 1,
      title: 'What the lemma is for',
      start: 0, end: 30,
      objective: 'Place the lemma as a one-way test: it can prove a language is outside the context-free class, and it can never prove one is inside it.'
    },
    {
      id: 'tree',
      n: 2,
      title: 'Where the five parts come from',
      start: 30, end: 60,
      objective: 'Derive the five-part split from a parse tree: a long string has a tall tree, a tall tree repeats a nonterminal on one path, and the repeated pair cuts the string into u, v, x, y, z.'
    },
    {
      id: 'conditions',
      n: 3,
      title: 'The two conditions, and the direction',
      start: 60, end: 90,
      objective: 'State both conditions exactly — vxy has at most p letters, v and y are not both empty — and read the quantifier order as a game with three moves.'
    },
    {
      id: 'game',
      n: 4,
      title: 'Playing the game on aⁿbⁿcⁿ',
      start: 90, end: 120,
      objective: 'Run the case analysis that proves aⁿbⁿcⁿ is not context-free, and see why the short condition on vxy is what makes the two cases exhaustive.'
    },
    {
      id: 'search',
      n: 5,
      title: 'The search, and what it can prove',
      start: 120, end: 150,
      objective: 'Run the lemma as an exhaustive search over a stated family of strings, and see exactly what a refutation at one value of p does and does not establish.'
    },
    {
      id: 'direction',
      n: 6,
      title: 'Why a small p proves nothing',
      start: 150, end: 180,
      objective: 'A context-free language can fail the lemma at p = 1 and pass it from p = 2 upwards, so a single failed pumping length is never a counterexample.'
    },
    {
      id: 'ogden',
      n: 7,
      title: "Ogden's lemma",
      start: 180, end: 210,
      objective: 'Mark letters before the split. The pump must touch a marked letter and vxy may carry at most p marked ones, which shortens the case analysis from six cases to two.'
    },
    {
      id: 'counterexample',
      n: 8,
      title: 'A language that passes and is still not context-free',
      start: 210, end: 240,
      objective: 'Show that surviving the lemma proves nothing: one language survives every tested p, fails Ogden\u2019s lemma at every p, and is not context-free by a closure argument.'
    },
    {
      id: 'closure',
      n: 9,
      title: 'The closure route',
      start: 240, end: 270,
      objective: 'Most exam questions fall to closure rather than to the lemma: intersect with a regular set, apply a homomorphism, and the counting constraint becomes visible.'
    },
    {
      id: 'exam',
      n: 10,
      title: 'How GATE asks it',
      start: 270, end: 300,
      objective: 'Name the four question shapes, the counting test that answers most of them, and the two direction traps that decide the rest.'
    }
  ],

  events: [

    /* ---------------- scene 1: what the lemma is for ---------------- */
    { id: 'e01', scene: 'what', start: 0, end: 7.5,
      caption: 'The pumping lemma is a one-way test: it can prove a language is not context-free, and it can never prove one is.',
      detail: 'The lemma says every context-free language has a pumping length p with a repeating property. If a language has no such p, it is not context-free. If it does have one, nothing follows: some languages that are not context-free also have one, and scene 8 exhibits such a language.',
      narration: 'The pumping lemma is a one-way test: it can prove a language is not context-free, and it can never prove one is.',
      keyword: 'one-way test' },

    { id: 'e02', scene: 'what', start: 7.5, end: 15,
      caption: 'Every context-free language has a number p: every string of length p or more splits into five parts.',
      detail: 'The five parts are written u, v, x, y, z and the string is their concatenation. The number p is called the pumping length and it belongs to the language, not to the string: one number must work for every long enough string in that language.',
      narration: 'Every context-free language has a number p: every string of length p or more splits into five parts.',
      keyword: 'five parts' },

    { id: 'e03', scene: 'what', start: 15, end: 22.5,
      caption: 'The two middle parts may be repeated together: v to the i, x, y to the i is still in the language for every i.',
      detail: 'The notation v to the i means the piece v written i times; i may be zero, which deletes the piece. The repeated pieces are v and y, and they are repeated by the same amount. The piece x between them stays put.',
      narration: 'The two middle parts may be repeated together: v to the i, x, y to the i is still in the language for every i.',
      keyword: 'repeated together' },

    { id: 'e04', scene: 'what', start: 22.5, end: 30,
      caption: 'The GATE 2027 syllabus names it directly in Section 6: regular and context-free languages, pumping lemma.',
      detail: 'Section 6 of the verified GATE 2027 Computer Science syllabus reads: regular expressions and finite automata; context-free grammars and push-down automata; regular and context-free languages, pumping lemma; Turing machines and undecidability. This lesson covers the third clause, and the phrase is printed in the syllabus itself, so the topic is class A.',
      narration: 'The GATE 2027 syllabus names it directly in Section 6: regular and context-free languages, pumping lemma.',
      keyword: 'Section 6' },

    /* ---------------- scene 2: where the five parts come from ---------------- */
    { id: 'e05', scene: 'tree', start: 30, end: 37.5,
      caption: 'A long string has a tall parse tree, and a tree taller than the number of nonterminals repeats one on a path.',
      detail: 'The tree is the derivation of the string from the start symbol. Its height is the length of its longest path from the root to a leaf. If the grammar has k nonterminals and a path carries more than k nonterminal nodes, then by the pigeonhole principle some nonterminal appears twice on that path.',
      narration: 'A long string has a tall parse tree, and a tree taller than the number of nonterminals repeats one on a path.',
      keyword: 'repeats one on a path' },

    { id: 'e06', scene: 'tree', start: 37.5, end: 45,
      caption: 'The repeated pair cuts the string into five pieces: the lower copy of the nonterminal derives v x y.',
      detail: 'Take the higher copy A and the lower copy A on the same path. The higher one derives the whole span of the string under it; the lower one derives the middle part of that span. The letters before, between, and after the two spans are u, x and z, so the string is u v x y z.',
      narration: 'The repeated pair cuts the string into five pieces: the lower copy of the nonterminal derives v x y.',
      keyword: 'lower copy' },

    { id: 'e07', scene: 'tree', start: 45, end: 52.5,
      caption: 'Copying the upper subtree in place of the lower one repeats v and y together, so every i is still derivable.',
      detail: 'Both copies derive from the same nonterminal, so either subtree may be replaced by the other. Replacing the lower by the upper repeats the pieces v and y once each; repeating that step gives i copies of each. Because the replacement is a legal derivation, every result is still in the language.',
      narration: 'Copying the upper subtree in place of the lower one repeats v and y together, so every i is still derivable.',
      keyword: 'either subtree may be replaced' },

    { id: 'e08', scene: 'tree', start: 52.5, end: 60,
      caption: 'The pumping length is the grammar\u2019s own number: p = 2 to the k for a grammar in Chomsky normal form with k nonterminals.',
      detail: 'In Chomsky normal form every internal node has two children, so a tree of height k plus one has at most 2 to the k leaves. A string longer than that must repeat a nonterminal, which gives the pumping length 2 to the k. For k equal to 1 to 8 that is 2, 4, 8, 16, 32, 64, 128 and 256.',
      narration: 'The pumping length is the grammar\u2019s own number: p = 2 to the k for a grammar in Chomsky normal form with k nonterminals.',
      keyword: '2 to the k' },

    /* ---------------- scene 3: the two conditions ---------------- */
    { id: 'e09', scene: 'conditions', start: 60, end: 67.5,
      caption: 'Condition one: the window v x y is short, at most p letters. Condition two: v and y are not both empty.',
      detail: 'The first condition comes from the tree: both copies of the repeated nonterminal sit within p letters of each other in the string. The second comes from the fact that the lower copy derives a strictly smaller span than the higher one, so at least one of v and y is non-empty.',
      narration: 'Condition one: the window v x y is short, at most p letters. Condition two: v and y are not both empty.',
      keyword: 'at most p letters' },

    { id: 'e10', scene: 'conditions', start: 67.5, end: 75,
      caption: 'The short window is what makes the lemma bite: a split may only disturb a bounded piece of the string.',
      detail: 'Without the short-window condition the lemma would be useless: you could always choose the split so that v and y were whole blocks in the right proportion. The condition forces the split to be local, and locality is what turns a counting argument into a contradiction.',
      narration: 'The short window is what makes the lemma bite: a split may only disturb a bounded piece of the string.',
      keyword: 'bounded piece' },

    { id: 'e11', scene: 'conditions', start: 75, end: 82.5,
      caption: 'The quantifier order is the whole lemma: there exists p, for every long enough w, there exists a split, for every i.',
      detail: 'Reading the quantifiers in order is the difference between using the lemma and misusing it. The number p is chosen by the language. The string w is chosen by you. The split is chosen by the lemma, after seeing your w. The repetition count i is chosen by you again, after seeing the split.',
      narration: 'The quantifier order is the whole lemma: there exists p, for every long enough w, there exists a split, for every i.',
      keyword: 'quantifier order' },

    { id: 'e12', scene: 'conditions', start: 82.5, end: 90,
      caption: 'Read it as a game: you pick w, the adversary picks the split, you pick i, and you win if some i leaves the language.',
      detail: 'To prove a language is not context-free you must win this game for every p the adversary could name. That is why a proof leaves p as a symbol and produces a string w that depends on p: a single numeric p can be defeated by one clever string, but the next p needs a new one.',
      narration: 'Read it as a game: you pick w, the adversary picks the split, you pick i, and you win if some i leaves the language.',
      keyword: 'a game' },

    /* ---------------- scene 4: playing the game ---------------- */
    { id: 'e13', scene: 'game', start: 90, end: 97.5,
      caption: 'Take w as p a\u2019s, then p b\u2019s, then p c\u2019s. Its length is 3p, so the lemma applies to it.',
      detail: 'The string a to the p, b to the p, c to the p is in the language a to the n, b to the n, c to the n, and it is long enough because 3p is at least p for every p of 1 or more. This is the standard witness: it puts the three equal counts as far apart as the short window allows.',
      narration: 'Take w as p a\u2019s, then p b\u2019s, then p c\u2019s. Its length is 3p, so the lemma applies to it.',
      keyword: '3p' },

    { id: 'e14', scene: 'game', start: 97.5, end: 105,
      caption: 'The window has at most p letters and the middle block has exactly p b\u2019s, so it cannot touch all three blocks.',
      detail: 'A window of length p that contains a letter from the first block and a letter from the third must contain every one of the p b\u2019s in between, and that is already p plus 2 letters. So the window meets at most two of the three blocks. This single sentence is what makes two cases enough.',
      narration: 'The window has at most p letters and the middle block has exactly p b\u2019s, so it cannot touch all three blocks.',
      keyword: 'at most two of the three blocks' },

    { id: 'e15', scene: 'game', start: 105, end: 112.5,
      caption: 'Case one: the window sits inside one block, so pumping changes one count and the three counts no longer agree.',
      detail: 'If v and y both lie inside the a\u2019s, pumping raises the number of a\u2019s while the b\u2019s and c\u2019s stay at p, so the string is no longer of the form a to the n, b to the n, c to the n. The same argument works inside the b\u2019s and inside the c\u2019s, and pumping down to i equal to zero deletes letters the same way.',
      narration: 'Case one: the window sits inside one block, so pumping changes one count and the three counts no longer agree.',
      keyword: 'one count' },

    { id: 'e16', scene: 'game', start: 112.5, end: 120,
      caption: 'Case two: the window straddles two blocks, so two counts move and the third stays, which is again a contradiction.',
      detail: 'If the window covers the end of the a\u2019s and the start of the b\u2019s, pumping changes the number of a\u2019s and the number of b\u2019s by different amounts, while the c\u2019s stay at p. The counts are no longer equal. With two cases and the short window, every possible split is covered, so the language is not context-free.',
      narration: 'Case two: the window straddles two blocks, so two counts move and the third stays, which is again a contradiction.',
      keyword: 'two counts move' },

    /* ---------------- scene 5: the search ---------------- */
    { id: 'e17', scene: 'search', start: 120, end: 127.5,
      caption: 'Run the lemma as a search: fix p, then try every allowed split of every string in a stated family.',
      detail: 'A split is allowed when the window has at most p letters and v and y are not both empty. For each allowed split the search pumps with i from 0 to 6. A string refutes p when no allowed split survives, and the search reports the first such string as its witness.',
      narration: 'Run the lemma as a search: fix p, then try every allowed split of every string in a stated family.',
      keyword: 'every allowed split' },

    { id: 'e18', scene: 'search', start: 127.5, end: 135,
      caption: 'On aⁿbⁿcⁿ the search refutes p = 1 through 6, each time finding a string with no surviving split.',
      detail: 'The family is the eight strings a to the n, b to the n, c to the n for n from 1 to 8. At p equal to 6 the first string that refutes it is the six-letter string aabbcc, and the search tries 182 allowed splits of it before declaring the value refuted. For a string of length 18 with a window of 6 the number of splits is 1106, which is why the short witness matters.',
      narration: 'On aⁿbⁿcⁿ the search refutes p = 1 through 6, each time finding a string with no surviving split.',
      keyword: 'refutes p = 1 through 6' },

    { id: 'e19', scene: 'search', start: 135, end: 142.5,
      caption: 'The witnesses are computed, not chosen: abc refutes p = 1, 2 and 3, and aabbcc refutes p = 4, 5 and 6.',
      detail: 'The search takes the first string in its family that refutes the value, so the witness is a fact about the family order rather than a human choice. Any of the later strings would have done. The point of the witness is that you can check it by hand: abc has three letters, and at p equal to 3 every allowed split changes one count.',
      narration: 'The witnesses are computed, not chosen: abc refutes p = 1, 2 and 3, and aabbcc refutes p = 4, 5 and 6.',
      keyword: 'computed, not chosen' },

    { id: 'e20', scene: 'search', start: 142.5, end: 150,
      caption: 'A refutation at one p is not a proof: the lemma needs some p to work, so a finite search can never finish the job.',
      detail: 'Refuting p proves one thing exactly: no context-free grammar for this language has that pumping length. Since the lemma only promises that some pumping length exists, refuting six of them leaves infinitely many open. The proof in scene 4 is what closes the gap, because it refutes every p at once by leaving p as a symbol.',
      narration: 'A refutation at one p is not a proof: the lemma needs some p to work, so a finite search can never finish the job.',
      keyword: 'not a proof',
      trap: 'Refuting one pumping length never proves a language is not context-free. Only an argument that covers every p does.' },

    /* ---------------- scene 6: the direction ---------------- */
    { id: 'e21', scene: 'direction', start: 150, end: 157.5,
      caption: 'aⁿbⁿ is context-free, and the search refutes it at p = 1: the two-letter string ab has no surviving split.',
      detail: 'At p equal to 1 the only allowed window is a single letter, so v is one letter and y is empty. Pumping a to the 2 gives aab, and pumping b gives abb, and neither is in the language. So p equal to 1 is not a valid pumping length for this language, even though the language is context-free.',
      narration: 'aⁿbⁿ is context-free, and the search refutes it at p = 1: the two-letter string ab has no surviving split.',
      keyword: 'refutes it at p = 1' },

    { id: 'e22', scene: 'direction', start: 157.5, end: 165,
      caption: 'At p = 2 it survives, and at every p up to 6: take one a as v and one b as y, and both counts move together.',
      detail: 'With v equal to a single a and y equal to a single b, pumping gives a to the n plus i, b to the n plus i, which is still in the language, and the window is two letters, which fits inside p equal to 2 and above. The family tested is the twelve strings a to the n, b to the n for n from 1 to 12.',
      narration: 'At p = 2 it survives, and at every p up to 6: take one a as v and one b as y, and both counts move together.',
      keyword: 'survives from p = 2' },

    { id: 'e23', scene: 'direction', start: 165, end: 172.5,
      caption: 'So a failed pumping length is not a counterexample to the lemma. It says only that p was too small.',
      detail: 'This is the direction trap in its purest form. A context-free language must have some valid p; it does not have to have p equal to 1, 2 or any other particular value. Answering that a language is not context-free because one small p failed is a standard wrong answer on this question.',
      narration: 'So a failed pumping length is not a counterexample to the lemma. It says only that p was too small.',
      keyword: 'too small',
      trap: 'A language that fails the lemma at one p has not been shown to be non-context-free. The lemma quantifies over existence of p.' },

    { id: 'e24', scene: 'direction', start: 172.5, end: 180,
      caption: 'The lemma is necessary and never sufficient, and the next two scenes are the two ways that bites.',
      detail: 'One way is the direction just shown: failing at a small p tells you nothing. The other is the converse: passing at some p also tells you nothing, because a language can pass the lemma and still not be context-free. Scenes 7 and 8 take those two in order.',
      narration: 'The lemma is necessary and never sufficient, and the next two scenes are the two ways that bites.',
      keyword: 'necessary and never sufficient' },

    /* ---------------- scene 7: Ogden's lemma ---------------- */
    { id: 'e25', scene: 'ogden', start: 180, end: 187.5,
      caption: 'Ogden\u2019s lemma lets you mark letters first: the pump must touch a marked letter and the window may carry at most p marked ones.',
      detail: 'The statement is the same five parts with one extra ingredient. You choose a set of marked positions, at least p of them. Then the split must satisfy three conditions: v and y together contain at least one marked position, the window v x y contains at most p marked positions, and every pump stays in the language.',
      narration: 'Ogden\u2019s lemma lets you mark letters first: the pump must touch a marked letter and the window may carry at most p marked ones.',
      keyword: 'mark letters' },

    { id: 'e26', scene: 'ogden', start: 187.5, end: 195,
      caption: 'Marking turns a weak condition into a strong one: you decide where the adversary is allowed to pump.',
      detail: 'The plain lemma lets the split fall anywhere in a window of p letters. Ogden\u2019s lemma says the split must land on a marked letter, so a marking that concentrates on one block forces the pump into that block. This is the standard way to shorten a case analysis, and it is the tool that kills the language in scene 8.',
      narration: 'Marking turns a weak condition into a strong one: you decide where the adversary is allowed to pump.',
      keyword: 'forces the pump' },

    { id: 'e27', scene: 'ogden', start: 195, end: 202.5,
      caption: 'On aⁿbⁿcⁿ, marking the a\u2019s cuts the cases: the search tries 2, 13, 44, 110, 230 and 427 splits at p = 1 to 6.',
      detail: 'Those are the splits that survive the marking filters, against 121 allowed splits of a nine-letter string at p equal to 3 under the plain lemma. With the a\u2019s marked, any split that touches a b or a c fails the marking condition at once, so only splits inside the a\u2019s survive the filter and one case refutes them all.',
      narration: 'On aⁿbⁿcⁿ, marking the a\u2019s cuts the cases: the search tries 2, 13, 44, 110, 230 and 427 splits at p = 1 to 6.',
      keyword: 'cuts the cases' },

    { id: 'e28', scene: 'ogden', start: 202.5, end: 210,
      caption: 'Same language, same conclusion, fewer cases: a split that touches a b or a c is killed by the marking at once.',
      detail: 'The plain proof needs six cases because the window may sit in one block or straddle any of three boundaries. With the a\u2019s marked and p marked letters required, the window is forced to lie inside the a\u2019s, and pumping then changes the number of a\u2019s while the b\u2019s and c\u2019s stay put. One case, one contradiction.',
      narration: 'Same language, same conclusion, fewer cases: a split that touches a b or a c is killed by the marking at once.',
      keyword: 'one case' },

    /* ---------------- scene 8: the counterexample ---------------- */
    { id: 'e29', scene: 'counterexample', start: 210, end: 217.5,
      caption: 'Take the strings a to the i, b to the j, c to the k, d to the l where i is 0 or j equals k equals l.',
      detail: 'This language has four blocks. Either it starts with no a at all, in which case nothing is required of the three counts, or it has at least one a, in which case the three counts must be equal. It is the standard example of a language that satisfies the pumping lemma and is not context-free.',
      narration: 'Take the strings a to the i, b to the j, c to the k, d to the l where i is 0 or j equals k equals l.',
      keyword: 'i is 0 or j equals k equals l' },

    { id: 'e30', scene: 'counterexample', start: 217.5, end: 225,
      caption: 'The plain lemma survives at every p from 1 to 6, over 228 tested strings: when there is no a, pump any b.',
      detail: 'The family is every string of the shape b to the j, c to the k, d to the l with total length at most 9, plus the eight strings a, b to the n, c to the n, d to the n for n from 1 to 8. A string with no a is still in the language after any pump, and a string with one a can pump inside the a\u2019s, which keeps the three counts equal. So every tested string has a surviving split at every tested p.',
      narration: 'The plain lemma survives at every p from 1 to 6, over 228 tested strings: when there is no a, pump any b.',
      keyword: '228 tested strings' },

    { id: 'e31', scene: 'counterexample', start: 225, end: 232.5,
      caption: 'Ogden\u2019s lemma refutes it at every p: marking the b\u2019s forces the pump into a block whose count must stay equal.',
      detail: 'With the b\u2019s marked and a window of at most p letters, the window cannot reach from the b\u2019s to the d\u2019s once the block is longer than p, so pumping changes one or two of the three equal counts and leaves the third. The search refutes p equal to 1 through 6, with witnesses abcd, abbccdd, abbbcccddd and so on.',
      narration: 'Ogden\u2019s lemma refutes it at every p: marking the b\u2019s forces the pump into a block whose count must stay equal.',
      keyword: 'refutes it at every p' },

    { id: 'e32', scene: 'counterexample', start: 232.5, end: 240,
      caption: 'And it is not context-free: intersecting it with a-plus b-star c-star d-star leaves three equal counts, which fail at every p.',
      detail: 'Context-free languages are closed under intersection with a regular language, and the set of strings with at least one a and no letter out of order is regular. The intersection is the set of strings a to the i, b to the j, c to the j, d to the j with i at least 1, which the search refutes at every p from 1 to 6 on its eighteen test strings. So the four-block language cannot be context-free.',
      narration: 'And it is not context-free: intersecting it with a-plus b-star c-star d-star leaves three equal counts, which fail at every p.',
      keyword: 'not context-free',
      trap: 'Surviving the pumping lemma is not evidence of being context-free. This language survives at every tested p and is not context-free.' },

    /* ---------------- scene 9: the closure route ---------------- */
    { id: 'e33', scene: 'closure', start: 240, end: 247.5,
      caption: 'Most exam questions fall to closure instead of the lemma: intersect with a regular set, or apply a homomorphism.',
      detail: 'If a language were context-free, then its intersection with any regular language would be context-free too, and so would every homomorphic image. So producing a regular set whose intersection fails the lemma, or a homomorphic image that fails it, proves the original is not context-free. This is usually shorter than a direct pumping proof.',
      narration: 'Most exam questions fall to closure instead of the lemma: intersect with a regular set, or apply a homomorphism.',
      keyword: 'closure' },

    { id: 'e34', scene: 'closure', start: 247.5, end: 255,
      caption: 'GATE CSE 2019 asked which of four languages is not context-free. Computed: w aⁿ w-reverse bⁿ is refuted at every p.',
      detail: 'The four options were w w-reverse, w a to the n b to the n w-reverse, w a to the n w-reverse b to the n, and a to the n b to the i with i in n, 3n and 5n. The third is the answer. The reason is visible in the stack: the copy of w has already used the stack to match w-reverse, and the b\u2019s then have nothing left to count against. The nine test strings for it are a to the k, b, a to the k plus one, b, a to the k, b to the k plus one, and they refute p equal to 1 through 6.',
      narration: 'GATE CSE 2019 asked which of four languages is not context-free. Computed: w aⁿ w-reverse bⁿ is refuted at every p.',
      keyword: 'refuted at every p' },

    { id: 'e35', scene: 'closure', start: 255, end: 262.5,
      caption: 'Its neighbours survive: w w-reverse and w aⁿ bⁿ w-reverse from p = 2, and aⁿ b to the i with i in n, 3n, 5n at p = 6.',
      detail: 'The first two are context-free by grammar: a grammar can build the mirrored copy while it builds the middle. The fourth is a union of three context-free languages, so it is context-free by closure under union, and the search finds a surviving split at p equal to 6 on its thirty test strings.',
      narration: 'Its neighbours survive: w w-reverse and w aⁿ bⁿ w-reverse from p = 2, and aⁿ b to the i with i in n, 3n, 5n at p = 6.',
      keyword: 'survive' },

    { id: 'e36', scene: 'closure', start: 262.5, end: 270,
      caption: 'GATE CSE 2016 Set 2 paired aⁿbᵐcⁿ⁺ᵐ, which survives from p = 2, with aⁿbⁿc²ⁿ, which is refuted at every p.',
      detail: 'The first is context-free: push the a\u2019s and the b\u2019s and pop one symbol per c, because the number of c\u2019s is the sum of the other two counts and a single counter can hold a sum. The second needs two counts at once, which one stack cannot hold. The published key is that the first is context-free and the second is not. On the first, the search refutes p equal to 1, 2, 3 and 4 on its twenty-five strings and finds no refutation at p equal to 5 or 6: a context-free language need not have a small valid p.',
      narration: 'GATE CSE 2016 Set 2 paired aⁿbᵐcⁿ⁺ᵐ, which survives from p = 2, with aⁿbⁿc²ⁿ, which is refuted at every p.',
      keyword: 'survives from p = 2' },

    /* ---------------- scene 10: the exam ---------------- */
    { id: 'e37', scene: 'exam', start: 270, end: 277.5,
      caption: 'Four shapes: which of these is not context-free; is this grammar\u2019s pumping length valid; what does the split force; which statement is false.',
      detail: 'The first is the commonest and asks you to classify four languages. The second hands you a grammar and a value of p. The third describes a split and asks what follows. The fourth is a statement question, where three of four claims are true, as in GATE CSE 2017 Set 2.',
      narration: 'Four shapes: which of these is not context-free; is this grammar\u2019s pumping length valid; what does the split force; which statement is false.',
      keyword: 'four shapes' },

    { id: 'e38', scene: 'exam', start: 277.5, end: 285,
      caption: 'The procedure: count the independent equalities. One stack tracks one, so two at once across three blocks is the usual answer.',
      detail: 'A push-down automaton has one stack, so it can hold one unbounded count while it compares. a to the n b to the m c to the n plus m needs one count, namely the sum, so it is context-free. a to the n b to the n c to the 2n needs two independent comparisons, so it is not. This test answers most of the classify questions before any lemma is written.',
      narration: 'The procedure: count the independent equalities. One stack tracks one, so two at once across three blocks is the usual answer.',
      keyword: 'independent equalities' },

    { id: 'e39', scene: 'exam', start: 285, end: 292.5,
      caption: 'Then check the direction twice: surviving the lemma proves nothing, and a failed small p proves nothing either.',
      detail: 'Both directions are tested in previous papers. GATE CSE 2017 Set 2 asked whether a unary prime language is context-free, where the answer is no because every context-free language over a one-letter alphabet is regular. And a language can pass the lemma and still not be context-free, as scene 8 showed.',
      narration: 'Then check the direction twice: surviving the lemma proves nothing, and a failed small p proves nothing either.',
      keyword: 'direction twice' },

    { id: 'e40', scene: 'exam', start: 292.5, end: 300,
      caption: 'One line to carry: the lemma kills languages, never saves them.',
      detail: 'Every use of the lemma in an exam is a refutation: of a language, or of a particular pumping length. It never establishes that a language is context-free. To show a language is context-free you build a grammar or a push-down automaton, and the counting test in scene 10 tells you which one to look for.',
      narration: 'One line to carry: the lemma kills languages, never saves them.',
      keyword: 'never saves them' }
  ]
};
