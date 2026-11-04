/* ==========================================================================
   left-recursion-elimination-and-left-factoring — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs — never edited by hand.

   Every number quoted in a caption is computed by the model in lesson.js from
   the grammars themselves and printed on the canvas; the two agree because both
   read the same computation.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'loops',
      n: 1,
      title: 'Two ways a top-down parser fails before it starts',
      start: 0, end: 30,
      objective: 'See that a left-recursive rule expands without ever consuming a character, and that a shared prefix leaves two rows of the table applicable to one lookahead.'
    },
    {
      id: 'direct',
      n: 2,
      title: 'The direct rewrite: repeat on the right instead of the left',
      start: 30, end: 60,
      objective: 'Turn A -> A alpha | beta into A -> beta A-prime, A-prime -> alpha A-prime | epsilon, and read the helper as "zero or more repetitions".'
    },
    {
      id: 'count',
      n: 3,
      title: 'Counting the rules: n + m + 1',
      start: 60, end: 90,
      objective: 'Predict the size of the rewritten grammar before writing it: m recursive alternatives and n base alternatives become n + m + 1 productions.'
    },
    {
      id: 'epsilon',
      n: 4,
      title: 'The epsilon is the base case, not decoration',
      start: 90, end: 120,
      objective: 'Delete the empty production from the helper and watch the language empty out, which is why the epsilon can never be dropped as a simplification.'
    },
    {
      id: 'tree',
      n: 5,
      title: 'Same language, different tree: a minus b minus c',
      start: 120, end: 150,
      objective: 'See the rewrite change left association into right association, and compute the two different values that follow.'
    },
    {
      id: 'indirect',
      n: 6,
      title: 'Indirect recursion hides one step further away',
      start: 150, end: 180,
      objective: 'Detect left recursion that no single rule shows, using the left-corner relation rather than a scan of each rule\'s first symbol.'
    },
    {
      id: 'ordered',
      n: 7,
      title: 'GATE CSE 1998 Q6b: substitute first, then eliminate',
      start: 180, end: 210,
      objective: 'Run the ordered algorithm on S -> Aa | b, A -> Ac | Sd | epsilon and obtain the seven-rule answer the paper asks for.'
    },
    {
      id: 'hidden',
      n: 8,
      title: 'The recursion a one-step test misses',
      start: 210, end: 240,
      objective: 'Meet A -> B A a with B nullable, see why the direct rule does nothing to it, and remove it by substituting the nullable nonterminal first.'
    },
    {
      id: 'factor',
      n: 9,
      title: 'Left factoring: one prefix, one helper, two passes',
      start: 240, end: 270,
      objective: 'Factor a shared prefix, and see that one pass can leave another shared prefix behind, so factoring repeats to a fixed point.'
    },
    {
      id: 'limits',
      n: 10,
      title: 'What the two transformations buy, and what they do not',
      start: 270, end: 300,
      objective: 'Show a factored grammar that still conflicts, and a grammar with neither defect that still conflicts, so both transformations are necessary and neither is sufficient.'
    }
  ],

  events: [
    /* ---------- scene 1: the two failures ---------- */
    {
      id: 'e1a', scene: 'loops', start: 0, end: 7.5,
      caption: 'E → E + T | T. Expanding E never consumes a character: E ⇒ E + T ⇒ E + T + T ⇒ …',
      detail: 'The rule for E begins with E, so the first thing the expander does is expand E again. Each step adds the three symbols + T to the sentential form and none of them is matched against the input, because a top-down parser matches from the left end.',
      narration: 'The rule for E begins with E. So expanding E expands E again, and the sentential form grows while the input pointer does not move.',
      keyword: 'never consumes a character',
      trap: 'The failure is not slow parsing. The parser never reaches the input at all, so it does not terminate.'
    },
    {
      id: 'e1b', scene: 'loops', start: 7.5, end: 15,
      caption: 'The stack grows by one + T at every step and the input pointer stays at position 1.',
      detail: 'A predictive parser keeps the sentential form on a stack and compares the top of the stack with the lookahead. While the top is E and E expands to something beginning with E, the stack only gets deeper. Nothing is popped, so no token is ever consumed.',
      narration: 'The stack grows by one plus T at every step, and the input pointer stays where it started. Nothing is ever popped, so no token is ever consumed.',
      keyword: 'the input pointer stays',
      trap: 'A grammar with a left-recursive rule can still describe a perfectly finite language. The infinite behaviour is in the parser, not in the language.'
    },
    {
      id: 'e1c', scene: 'loops', start: 15, end: 22.5,
      caption: 'The second failure is a shared prefix: S → if E then S | if E then S else S.',
      detail: 'Both alternatives begin with the terminal if. FIRST of the first alternative and FIRST of the second are both {if}, so the cell M[S, if] holds two productions and the parser cannot choose. This is a table conflict, not a loop.',
      narration: 'The second failure is a shared prefix. Both alternatives of S begin with if, so the cell for S and if holds two productions and the parser cannot choose.',
      keyword: 'a shared prefix',
      trap: 'Two alternatives that begin with the same terminal always collide in a one-token table, however different their tails are.'
    },
    {
      id: 'e1d', scene: 'loops', start: 22.5, end: 30,
      caption: 'Two transformations answer these two failures. Neither belongs to the LL(1) construction; both run before it.',
      detail: 'Eliminating left recursion removes the loop. Left factoring removes the shared prefix. The LL(1) table is built afterwards, from whatever grammar the two transformations produced, and the table then decides whether that grammar is LL(1).',
      narration: 'Two transformations answer these two failures: eliminating left recursion, and left factoring. Neither belongs to the LL(1) construction. Both run before it.',
      keyword: 'both run before it',
      trap: 'Neither transformation is part of the table construction, so a question that says "the LL(1) table of this grammar" is asking about the grammar as given.'
    },

    /* ---------- scene 2: the direct rewrite ---------- */
    {
      id: 'e2a', scene: 'direct', start: 30, end: 37.5,
      caption: 'A → Aα | β says: a β, then any number of α. The helper A′ → αA′ | ε is that same sentence written as a grammar.',
      detail: 'Here α is the rest of a left-recursive right side once its leading A is removed, and β is a right side that does not begin with A. A word of the language is β followed by zero or more copies of α, which is exactly what the two new rules generate.',
      narration: 'A goes to A alpha or beta means: a beta, then any number of alpha. The helper rule alpha A prime or epsilon is that same sentence written as a grammar.',
      keyword: 'any number of α'
    },
    {
      id: 'e2b', scene: 'direct', start: 37.5, end: 45,
      caption: 'A → βA′ generates β once; then A′ repeats α zero or more times.',
      detail: 'A ⇒ βA′ ⇒ βαA′ ⇒ βααA′ ⇒ … The only way to stop is A′ ⇒ ε, which is why the empty production is part of the helper rather than an afterthought. The number of α copies is the number of times A′ is rewritten before it takes ε.',
      narration: 'A goes to beta A prime generates beta once. Then A prime repeats alpha zero or more times, and the only way to stop is the empty production.',
      keyword: 'zero or more times'
    },
    {
      id: 'e2c', scene: 'direct', start: 45, end: 52.5,
      caption: 'E → E + T | T becomes E → T E′, E′ → + T E′ | ε.',
      detail: 'α is + T and β is T. The new grammar generates T, then T + T, then T + T + T, and so on: the same set of words. The count goes from three productions to four, because one helper was created.',
      narration: 'E goes to E plus T or T becomes E goes to T E prime, and E prime goes to plus T E prime or epsilon. A term, then any number of plus term.',
      keyword: 'E → T E′'
    },
    {
      id: 'e2d', scene: 'direct', start: 52.5, end: 60,
      caption: 'The recursion now sits on the right of the rule, so every expansion consumes a token before it recurses.',
      detail: 'Expanding E produces T first, and T produces the terminal a. So the very first expansion puts a terminal on top of the stack, that terminal matches the lookahead and is popped, and only then can E′ recurse. The loop is gone because progress is forced.',
      narration: 'The recursion now sits on the right of the rule. Expanding E puts a terminal on top of the stack first, so every expansion consumes a token before it recurses.',
      keyword: 'progress is forced',
      trap: 'The rewrite does not make the grammar LL(1) by itself. It removes one of the two obstacles; the table is still to be built.'
    },

    /* ---------- scene 3: the count ---------- */
    {
      id: 'e3a', scene: 'count', start: 60, end: 67.5,
      caption: 'Count first: m recursive alternatives and n base alternatives become n + m + 1 productions.',
      detail: 'The n base alternatives each get one production ending in the helper: n productions. The m recursive alternatives each get one production inside the helper: m productions. The helper needs its empty production: one more. Nothing is lost and nothing is duplicated.',
      narration: 'Count first. With m recursive alternatives and n base alternatives you get n plus m plus one productions: one per base, one per recursive alternative, and one for the empty production.',
      keyword: 'n + m + 1'
    },
    {
      id: 'e3b', scene: 'count', start: 67.5, end: 75,
      caption: 'E has one recursive and one base alternative: 1 + 1 + 1 = 3 rules for E. With T the grammar goes from three to four.',
      detail: 'Before: E → E + T, E → T, T → a, which is three productions. After: E → T E′, E′ → + T E′, E′ → ε, T → a, which is four. The count agrees with the grammar the model builds.',
      narration: 'E has one recursive and one base alternative, so three rules for E. Adding the rule for T, the grammar goes from three productions to four.',
      keyword: 'three to four'
    },
    {
      id: 'e3c', scene: 'count', start: 75, end: 82.5,
      caption: 'S → Sa | Sb | c | d becomes five: two for S, three for S′.',
      detail: 'Here m is 2 and n is 2, so n + m + 1 is 5. The base alternatives c and d each gain the helper, giving S → cS′ and S → dS′; the recursive alternatives a and b each gain the helper inside S′, giving S′ → aS′ and S′ → bS′; and S′ → ε finishes it.',
      narration: 'Four alternatives become five. Two for S, which are c S prime and d S prime, and three for S prime: a S prime, b S prime, and epsilon.',
      keyword: 'four alternatives become five'
    },
    {
      id: 'e3d', scene: 'count', start: 82.5, end: 90,
      caption: 'So a question that asks for the number of rules is answered by the count, before the grammar is written out.',
      detail: 'The count is also the fastest check on a hand-written answer: if the number of productions does not match n + m + 1 for each nonterminal that was rewritten, a production has been dropped or duplicated. Only nonterminals with a recursive alternative change size.',
      narration: 'So a question that asks for the number of rules is answered by the count, before the grammar is written out. And the count is the fastest check on a hand-written answer.',
      keyword: 'the fastest check',
      trap: 'Only the rewritten nonterminals change count. Counting every production in the grammar and applying n + m + 1 to the total is a common slip.'
    },

    /* ---------- scene 4: the epsilon ---------- */
    {
      id: 'e4a', scene: 'epsilon', start: 90, end: 97.5,
      caption: 'Delete the ε from E′ → + T E′ | ε and ask what E generates now.',
      detail: 'The simplified helper is E′ → + T E′ alone. A derivation of E must produce T E′ and then rewrite E′. Every rewriting of E′ adds another + T and leaves another E′ behind, so no derivation ever ends.',
      narration: 'Delete the empty production from the helper and ask what E generates now. The helper is left with one rule, which always leaves another E prime behind.',
      keyword: 'delete the ε',
      trap: 'Deleting an ε-production looks like a simplification. In a helper created by this rewrite it deletes the base case of a repetition.'
    },
    {
      id: 'e4b', scene: 'epsilon', start: 97.5, end: 105,
      caption: 'Every derivation has to end with E′ ⇒ ε. With no ε there is no ending, so nothing is generated at all.',
      detail: 'A derivation is finite, so it must stop rewriting E′ at some point, and the only production that removes E′ is the empty one. Without it, every sentential form still contains E′, which is not a terminal, so no string of terminals is ever produced.',
      narration: 'Every derivation has to end with E prime going to epsilon. With no epsilon there is no ending, so nothing at all is generated.',
      keyword: 'no ending'
    },
    {
      id: 'e4c', scene: 'epsilon', start: 105, end: 112.5,
      caption: 'The enumeration agrees: four strings up to length seven before the deletion, none after.',
      detail: 'The model generates every string over the alphabet {a, +} up to length seven and tests membership by dynamic programming. With the ε present it finds a, a+a, a+a+a and a+a+a+a; with the ε deleted it finds nothing. The same test is what proves the rewrite preserves the language in scene two.',
      narration: 'The enumeration agrees. Four strings up to length seven before the deletion, and none after: a, a plus a, and the two longer ones are all gone.',
      keyword: 'four strings, then none'
    },
    {
      id: 'e4d', scene: 'epsilon', start: 112.5, end: 120,
      caption: 'ε is the base case of the repetition. It is the one production students delete when they tidy up.',
      detail: 'The helper encodes "zero or more". Zero is the empty production; one or more is what you get without it, and here even that is lost because the helper can never finish. Keep the ε, and keep the helper reachable from the nonterminal it was created for.',
      narration: 'Epsilon is the base case of the repetition. It is the one production students delete when they tidy up, and the language empties out.',
      keyword: 'the base case',
      trap: 'A rewritten grammar usually has more ε-productions than the original. That is expected, not a sign of a mistake.'
    },

    /* ---------- scene 5: the tree ---------- */
    {
      id: 'e5a', scene: 'tree', start: 120, end: 127.5,
      caption: 'E → E − T | T parses a − b − c as (a − b) − c. The left recursion is what puts the operator on the left.',
      detail: 'The leftmost derivation is E ⇒ E − T ⇒ E − T − T ⇒ a − T − T ⇒ a − b − c. The first minus is applied to a and b, and its result is the left operand of the second minus, so the tree leans left and the subtraction associates to the left.',
      narration: 'The left-recursive grammar parses a minus b minus c as a minus b, then minus c. The left recursion is what puts the first operator on the left.',
      keyword: '(a − b) − c'
    },
    {
      id: 'e5b', scene: 'tree', start: 127.5, end: 135,
      caption: 'After the rewrite, E → T E′, E′ → − T E′ | ε, the tree leans right: a − (b − c).',
      detail: 'Now the first expansion produces T, which produces a, and the rest of the input is handled by E′. So a becomes the left operand of the first minus, and everything after it is a single right operand: the tree leans right and the operator associates to the right.',
      narration: 'After the rewrite the tree leans the other way: a minus, then the whole of b minus c. The same three symbols, a different shape.',
      keyword: 'the tree leans right'
    },
    {
      id: 'e5c', scene: 'tree', start: 135, end: 142.5,
      caption: 'With a = 10, b = 3 and c = 2 the left tree gives 5 and the right tree gives 9.',
      detail: 'The left tree computes 10 − 3 = 7, then 7 − 2 = 5. The right tree computes 3 − 2 = 1, then 10 − 1 = 9. Both are values of the same string under the same grammar\'s language, because the language does not say which tree to use.',
      narration: 'With a equal to ten, b to three and c to two, the left tree gives five and the right tree gives nine. Same string, same language, different answer.',
      keyword: '5 and 9',
      trap: 'For + and × the two trees agree, which is exactly why the trap survives practice. It shows up on − and ÷.'
    },
    {
      id: 'e5d', scene: 'tree', start: 142.5, end: 150,
      caption: 'Same language, different tree. In a syntax-directed question the tree is what is being marked.',
      detail: 'Eliminating left recursion preserves the set of strings and does not preserve the parse trees. A syntax-directed translation that reads the tree will compute a different value, so a question that asks for the value of an expression after the grammar has been rewritten is asking about the rewritten tree.',
      narration: 'Same language, different tree. In a syntax-directed question the tree is what is being marked, so the rewrite changes the answer even though it does not change the language.',
      keyword: 'the tree is what is marked',
      trap: 'Saying "the language is unchanged, so the value is unchanged" is the single most expensive slip on this topic.'
    },

    /* ---------- scene 6: indirect recursion ---------- */
    {
      id: 'e6a', scene: 'indirect', start: 150, end: 157.5,
      caption: 'S → Aa | b and A → Ac | Sd | ε. No rule of S begins with S.',
      detail: 'Read the first symbol of every right side: A, b for S; A, S, and nothing for A. A scan for "a rule that starts with its own left side" reports A only, because A → Ac begins with A and no rule of S begins with S.',
      narration: 'Here are two rules. No right side of S begins with S, so a scan of first symbols reports only A as left recursive.',
      keyword: 'no rule of S begins with S',
      trap: 'The one-step test finds immediate left recursion only. Indirect left recursion passes it.'
    },
    {
      id: 'e6b', scene: 'indirect', start: 157.5, end: 165,
      caption: 'But S ⇒ Aa ⇒ Sda. The recursion is real, one step longer than the test looks.',
      detail: 'Expand S to Aa, then expand the leading A to Sd, and the sentential form begins with S again with da appended. Repeating it gives S ⇒ S(da)^k a, so the recursion is genuine: any parser that expands S first will keep coming back to S without consuming a terminal.',
      narration: 'But S expands to A a, and A expands to S d, so S reaches S with d a appended. The recursion is real, one step longer than the test looks.',
      keyword: 'S ⇒ Aa ⇒ Sda'
    },
    {
      id: 'e6c', scene: 'indirect', start: 165, end: 172.5,
      caption: 'The left-corner relation finds it: S reaches A, A reaches S, so S reaches itself.',
      detail: 'A reaches B when A ⇒ Bγ for some γ. It is computed from the first symbol of each right side, jumping over a nullable prefix, and then closed transitively. A nonterminal is left recursive exactly when it reaches itself in this relation.',
      narration: 'The left-corner relation finds it. S reaches A, A reaches S, so S reaches itself. That is the definition of left recursion.',
      keyword: 'the left-corner relation'
    },
    {
      id: 'e6d', scene: 'indirect', start: 172.5, end: 180,
      caption: 'Both S and A are left recursive; the one-step test finds only A.',
      detail: 'This is why the exam question is asked at all: a grammar can be left recursive in a way that no single rule shows. The detection procedure is a reachability computation on the left-corner relation, not a scan of first symbols.',
      narration: 'Both S and A are left recursive, and the one-step test finds only A. That is why the transformation has to be run in an order rather than rule by rule.',
      keyword: 'both are left recursive',
      trap: 'Rewriting only the nonterminal the scan reported leaves the grammar left recursive through the other one.'
    },

    /* ---------- scene 7: the 1998 question ---------- */
    {
      id: 'e7a', scene: 'ordered', start: 180, end: 187.5,
      caption: 'GATE CSE 1998 Q6b asks for an equivalent grammar with no left recursion and the fewest rules.',
      detail: 'The paper prints exactly these two rules and asks for an equivalent grammar with no left recursion and the minimum number of production rules. The word "equivalent" is the constraint that matters: the language must not change, and the empty production must survive.',
      narration: 'GATE CSE 1998 question six b asks for an equivalent grammar with no left recursion and the minimum number of production rules.',
      keyword: 'equivalent, and no left recursion',
      trap: '"Equivalent" rules out the easy answers. Dropping a rule removes the recursion and changes the language.'
    },
    {
      id: 'e7b', scene: 'ordered', start: 187.5, end: 195,
      caption: 'Order the nonterminals S then A. Substitute S\'s right sides into A wherever a rule of A begins with S.',
      detail: 'A → Sd begins with S, and S has the right sides Aa and b, so that one rule becomes A → Aad and A → bd. Nothing else in the grammar begins with S, so nothing else changes. The substitution is what turns indirect recursion into immediate recursion.',
      narration: 'Order the nonterminals S then A. Substitute the right sides of S into A wherever a rule of A begins with S. That one rule becomes A goes to A a d and A goes to b d.',
      keyword: 'substitute S into A'
    },
    {
      id: 'e7c', scene: 'ordered', start: 195, end: 202.5,
      caption: 'A → Ac | Aad | bd | ε now begins with itself, so the direct rule applies.',
      detail: 'Here m is 2, with α equal to c and to ad, and n is 2, with β equal to bd and to the empty string. The base alternatives are bd and ε, so they become bdA′ and A′ — the second one is just the helper, because β was empty.',
      narration: 'Now A begins with itself, so the direct rule applies. Two recursive alternatives, c and a d, and two base alternatives, b d and epsilon.',
      keyword: 'the direct rule applies',
      trap: 'An empty β is still a base alternative. It becomes A → A′, not nothing.'
    },
    {
      id: 'e7d', scene: 'ordered', start: 202.5, end: 210,
      caption: 'The answer: S → Aa | b; A → bdA′ | A′; A′ → cA′ | adA′ | ε. Seven rules, and the language is unchanged.',
      detail: 'Five productions became seven, which is n + m + 1 for A plus the two untouched rules of S. The model compares this grammar with the published answer rule for rule, and enumerates every string up to length five over a, b, c, d: seventeen strings, the same seventeen for the original, the rewritten and the published grammar.',
      narration: 'The answer is seven rules: two for S, two for A, three for A prime. The model checks it against the published answer and against the original language, seventeen strings up to length five.',
      keyword: 'seven rules',
      trap: 'Writing S → Aa | b | … with A\'s rules folded into S is a different grammar; the minimum count assumes only A is rewritten.'
    },

    /* ---------- scene 8: hidden recursion ---------- */
    {
      id: 'e8a', scene: 'hidden', start: 210, end: 217.5,
      caption: 'A → BAa | c with B → ε | b. No rule of A begins with A, so the one-step test says no.',
      detail: 'The first symbols of A\'s right sides are B and c, and neither is A. A scan for a rule that begins with its own left side reports nothing, so the direct rule has nothing to rewrite and the grammar is left as it is.',
      narration: 'Here A goes to B A a or c, and B goes to epsilon or b. No rule of A begins with A, so the one-step test says there is no left recursion.',
      keyword: 'the test says no'
    },
    {
      id: 'e8b', scene: 'hidden', start: 217.5, end: 225,
      caption: 'But B derives ε, so A ⇒ BAa ⇒ Aa. The recursion hides behind a nullable symbol.',
      detail: 'This is hidden left recursion: the recursive symbol is the second symbol of the right side, and the first symbol can vanish. The left-corner relation jumps over a nullable prefix, which is why it catches this case and a scan of first symbols does not.',
      narration: 'But B derives epsilon, so A goes to A a. The recursion hides behind a nullable symbol, and the left-corner relation jumps over it.',
      keyword: 'hides behind a nullable symbol',
      trap: 'This is the case that makes "no left recursion" a property of the relation, not of the shape of the rules.'
    },
    {
      id: 'e8c', scene: 'hidden', start: 225, end: 232.5,
      caption: 'Substitute B\'s right sides into A: A → Aa | bAa | c. Now the recursion is immediate.',
      detail: 'Replacing B by each of its right sides, ε and b, turns the one rule into two: A → Aa from the empty alternative, and A → bAa from the b. The empty alternative is what exposes the recursion, and the rule now begins with A.',
      narration: 'Substitute the right sides of B into A. The rule becomes A goes to A a, b A a, or c, and now the recursion is immediate.',
      keyword: 'now it is immediate'
    },
    {
      id: 'e8d', scene: 'hidden', start: 232.5, end: 240,
      caption: 'Then the direct rule applies: A → bAaA′ | cA′, A′ → aA′ | ε.',
      detail: 'With α equal to a and base alternatives bAa and c, the rewrite gives two productions for A and two for the helper. The model confirms that no nonterminal is left recursive afterwards. The lesson is the order: expose the recursion by substitution, then remove it.',
      narration: 'Then the direct rule applies, and no nonterminal is left recursive afterwards. Expose the recursion first, then remove it.',
      keyword: 'expose, then remove',
      trap: 'Running the direct rule first does nothing here, and the grammar still loops in a predictive parser.'
    },

    /* ---------- scene 9: left factoring ---------- */
    {
      id: 'e9a', scene: 'factor', start: 240, end: 247.5,
      caption: 'A → abc | abd | ae. The first character decides nothing: all three alternatives begin with a.',
      detail: 'FIRST of each alternative is {a}, so the cell M[A, a] holds three productions and the table has a conflict. The parser needs to see the second character to choose, and one token of lookahead is all it has.',
      narration: 'Three alternatives all begin with a. The first character decides nothing, so the cell for A and a holds three productions.',
      keyword: 'the first character decides nothing',
      trap: 'A shared prefix is not a left recursion, and the direct rule does not touch it.'
    },
    {
      id: 'e9b', scene: 'factor', start: 247.5, end: 255,
      caption: 'Factor the longest common prefix: A → abA′, A′ → c | d, and keep A → ae.',
      detail: 'The prefix ab is moved out of the two alternatives that share it, and the rest of each becomes an alternative of the helper. The third alternative, ae, does not share the prefix ab, so it is left alone in this pass. The language is unchanged: the same three strings, grouped differently.',
      narration: 'Factor the longest common prefix. A goes to a b A prime, A prime goes to c or d, and the third alternative a e is kept as it is.',
      keyword: 'the longest common prefix'
    },
    {
      id: 'e9c', scene: 'factor', start: 255, end: 262.5,
      caption: 'One pass is not enough: A still has ae and abA′, which both begin with a. Factor again.',
      detail: 'After the first pass the alternatives of A are ae and abA′. They share the prefix a, so the cell M[A, a] still holds two productions. Factoring has to be repeated until no two alternatives of any nonterminal share a non-empty prefix.',
      narration: 'One pass is not enough. A still has a e and a b A prime, which both begin with a, so factor again.',
      keyword: 'factor again',
      trap: 'Factoring one prefix and stopping is the usual half-finished answer. The test is "no two alternatives share a prefix", not "I factored once".'
    },
    {
      id: 'e9d', scene: 'factor', start: 262.5, end: 270,
      caption: 'Two passes turn three productions into five: A → aA″, A″ → e | bA′, A′ → c | d.',
      detail: 'The model runs the passes until nothing changes and reports two of them. Three productions became five, and the factored grammar has no conflict in its LL(1) table, which the model also checks. The primes record the order the passes ran, so here the outer helper is double-primed.',
      narration: 'Two passes turn three productions into five, and the factored grammar has no conflict in its table. The primes record the order the passes ran, not the nesting.',
      keyword: 'three productions into five'
    },

    /* ---------- scene 10: the limits ---------- */
    {
      id: 'e10a', scene: 'limits', start: 270, end: 277.5,
      caption: 'Factor the dangling else: S → iEtSS′ | a, S′ → eS | ε. The shared prefix is gone.',
      detail: 'The two if-alternatives shared the prefix iEtS, which is now a single production followed by the helper. Every nonterminal in this grammar has alternatives with distinct first symbols, so no factoring applies any more and no left recursion is present.',
      narration: 'Factor the dangling else and the shared prefix is gone. Every alternative now begins differently, and there is no left recursion.',
      keyword: 'the shared prefix is gone'
    },
    {
      id: 'e10b', scene: 'limits', start: 277.5, end: 285,
      caption: 'The table still has two entries in M[S′, e]: S′ → eS and S′ → ε. So it is still not LL(1).',
      detail: 'FIRST of eS is {e} and FOLLOW of S′ also contains e, because S′ sits at the end of a rule of S and a rule of S can be followed by e. So the empty alternative applies on e as well, and the cell holds both productions. The conflict comes from the ambiguity, not from the prefix.',
      narration: 'But the table still has two entries for S prime and e: the e S rule and the empty rule. So the grammar is still not LL(1) after factoring.',
      keyword: 'still not LL(1)',
      trap: 'Factoring removes the prefix conflict and cannot remove an ambiguity. The dangling else is ambiguous before and after.'
    },
    {
      id: 'e10c', scene: 'limits', start: 285, end: 292.5,
      caption: 'GATE CSE 2003 Q16: does removing left recursion and factoring suffice for an arbitrary CFG? No.',
      detail: 'The paper offers four options: removing left recursion alone, factoring alone, both, or none. The answer recorded for the paper is none of the above, because an arbitrary grammar can be ambiguous, and neither transformation removes ambiguity.',
      narration: 'GATE CSE 2003 question sixteen asks whether removing left recursion and factoring suffices for an arbitrary grammar. The answer is no.',
      keyword: 'the answer is no'
    },
    {
      id: 'e10d', scene: 'limits', start: 292.5, end: 300,
      caption: 'S → A | B, A → a, B → a has neither defect and still conflicts on a. Necessary, not sufficient.',
      detail: 'No rule begins with its own left side, and no two alternatives of one nonterminal share a prefix, yet FIRST of A and FIRST of B are both {a}, so the cell M[S, a] holds both S → A and S → B. Both transformations are necessary conditions for LL(1); neither is sufficient, and together they are still not sufficient.',
      narration: 'Here is a grammar with neither defect that still conflicts on a, so both transformations are necessary and not sufficient. Build the table and let it decide.',
      keyword: 'necessary, not sufficient',
      trap: 'Reading "no left recursion and no common prefix" as "LL(1)" is the mistake the 2003 question is testing.'
    }
  ]
};
