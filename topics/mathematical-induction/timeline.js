/* ==========================================================================
   mathematical-induction — THE timeline.
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
      id: 'why',
      n: 1,
      title: 'Two facts, infinitely many statements',
      start: 0, end: 30,
      objective: 'See what induction buys: one base case plus one implication settles infinitely many separate statements, and the implication is the only part that needs thought.'
    },
    {
      id: 'rule',
      n: 2,
      title: 'The rule, written down',
      start: 30, end: 60,
      objective: 'State the induction principle as an inference rule, name the five parts of a written proof, and see why the hypothesis is not circular.'
    },
    {
      id: 'cubes',
      n: 3,
      title: 'Worked: the sum of cubes',
      start: 60, end: 90,
      objective: 'Prove the sum of the first n cubes equals the square of the sum of the first n integers: base, hypothesis, algebraic step, and an independent check.'
    },
    {
      id: 'base',
      n: 4,
      title: 'Choosing the base case',
      start: 90, end: 120,
      objective: 'Prove 2^n > n^2 for n at least 5, and see that a true base at n = 1 is useless when the step is only valid from n = 3 upward.'
    },
    {
      id: 'strong',
      n: 5,
      title: 'Strong induction',
      start: 120, end: 150,
      objective: 'Prove that every amount of 8 or more is payable with 3 and 5 rupee coins, using a hypothesis about n - 3, and see why the ordinary step cannot reach it.'
    },
    {
      id: 'wop',
      n: 6,
      title: 'Well-ordering, and the least counterexample',
      start: 150, end: 180,
      objective: 'Re-prove the coin claim by assuming a least counterexample and deriving a smaller one, and see that the three methods are the same reasoning in three formats.'
    },
    {
      id: 'struct',
      n: 7,
      title: 'Structural induction on trees',
      start: 180, end: 210,
      objective: 'Prove that a full binary tree with i internal nodes has i + 1 leaves by inducting on the recursive definition, and check it on every tree up to six internal nodes.'
    },
    {
      id: 'recur',
      n: 8,
      title: 'Induction on a recurrence',
      start: 210, end: 240,
      objective: 'Verify the closed form of T(n) = 2T(n/2) + n by substituting the hypothesis into the step, which is how a guessed solution becomes a proved one.'
    },
    {
      id: 'invariant',
      n: 9,
      title: 'Loop invariants are induction',
      start: 240, end: 270,
      objective: 'Map initialization, maintenance and termination onto base, step and conclusion, and see the insertion-sort invariant hold at every index of every small array.'
    },
    {
      id: 'breaks',
      n: 10,
      title: 'Where it breaks',
      start: 270, end: 300,
      objective: 'Name the four ways an induction argument fails, with a computed witness for each: the empty middle, a false pattern, a step outside its domain, and a word confused with another.'
    }
  ],

  events: [

    /* ---------------- scene 1: two facts ---------------- */
    {
      id: 'wh-1', start: 0, end: 7.5, scene: 'why',
      visualAction: 'dominoes',
      caption: 'Forty dominoes, one push. You do not push forty times: you push once and check that each one topples the next.',
      narration: 'Induction is the domino picture, taken seriously. You do not verify forty statements one by one. You push the first, and you check that any toppled domino topples the next. Those two facts settle all forty.',
      keyword: 'push once, check the link',
      detail: 'The syllabus does not name induction as its own item. It is the tool behind recurrence solutions, correctness arguments and the counting identities of Section 1, so it is a prerequisite lesson rather than a syllabus clause.'
    },
    {
      id: 'wh-2', start: 7.5, end: 15, scene: 'why',
      visualAction: 'statements',
      caption: 'The statements here are infinitely many: P of one, P of two, P of three, with no last one to check.',
      narration: 'The statements in a GATE question are usually infinitely many. P of one, P of two, P of three, and no largest. You cannot check them all, and checking the first ten proves nothing about the eleventh.',
      keyword: 'no largest',
      detail: 'This is the whole reason a proof technique is needed. A finite check is evidence; induction is proof.'
    },
    {
      id: 'wh-3', start: 15, end: 22.5, scene: 'why',
      visualAction: 'link',
      caption: 'So the work moves into one link: from a statement about n to the same statement about n plus one.',
      narration: 'So the work moves out of the base and into the link. One implication, from the statement at n to the same statement at n plus one, done once for an arbitrary n, is what replaces the infinite check.',
      keyword: 'one implication',
      trap: 'The link must hold for every n in range, not for the n you happen to have written down. A step that only works for n at least 2 leaves the first link unproved.'
    },
    {
      id: 'wh-4', start: 22.5, end: 30, scene: 'why',
      visualAction: 'both',
      caption: 'Base plus link gives every statement, and neither alone gives any. That is the whole method.',
      narration: 'Base plus link gives every statement. The base alone gives one, and the link alone gives nothing, because there is nothing to start it. That is the whole method, and everything else in this lesson is a variation on it.',
      keyword: 'neither alone'
    },

    /* ---------------- scene 2: the rule ---------------- */
    {
      id: 'ru-1', start: 30, end: 37.5, scene: 'rule',
      visualAction: 'rule',
      caption: 'The rule in symbols: P of zero, and P of n implies P of n plus one for every n, therefore P of m for every m.',
      narration: 'Here is the rule in symbols. The first line is the base case, P of zero. The second says that for every n, P of n implies P of n plus one. The conclusion is that P of m holds for every natural number m.',
      keyword: 'P of n implies P of n plus one',
      detail: 'Stated as an inference rule: from P(0) and the universally quantified implication, infer the universally quantified conclusion. The quantification in the second premise is what makes the step a single proof rather than infinitely many.'
    },
    {
      id: 'ru-2', start: 37.5, end: 45, scene: 'rule',
      visualAction: 'chain',
      caption: 'Unfolded, the link is a chain: P zero gives P one, which gives P two, which gives P three, and so on.',
      narration: 'Unfolded, the implication is a chain. P zero gives P one, which gives P two, which gives P three. The step proves all of those arrows at once, because it was proved for an arbitrary n rather than a chosen one.',
      keyword: 'a chain'
    },
    {
      id: 'ru-3', start: 45, end: 52.5, scene: 'rule',
      visualAction: 'five-parts',
      caption: 'A written proof has five parts: name the method, define P of n, prove the base, prove the step, invoke the rule.',
      narration: 'A written proof has five parts. Name the method. Define the predicate P of n. Prove the base. Prove the step from an arbitrary n. Then invoke the rule. The predicate is the part most often left out, and leaving it out is the largest single source of confused proofs.',
      keyword: 'define the predicate',
      trap: 'A predicate written as "it holds for n" without saying what "it" is cannot be checked at n plus one. Write P of n as a complete sentence with n in it.'
    },
    {
      id: 'ru-4', start: 52.5, end: 60, scene: 'rule',
      visualAction: 'not-circular',
      caption: 'The hypothesis is not circular: you assume P of n to prove P of n plus one, which proves the implication, not P itself.',
      narration: 'The step is not circular. You assume P of n in order to prove P of n plus one, and what you have proved is the implication, not the statement. The statement comes from the base case and the rule together, never from the hypothesis alone.',
      keyword: 'the implication, not the statement',
      detail: 'Formally, the step establishes the universally quantified implication. Nothing is assumed about the particular n you care about, only about an arbitrary one.'
    },

    /* ---------------- scene 3: sum of cubes ---------------- */
    {
      id: 'cu-1', start: 60, end: 67.5, scene: 'cubes',
      visualAction: 'claim',
      caption: 'Claim: one cubed plus two cubed up to n cubed equals the square of one plus two up to n.',
      narration: 'Now a worked proof. The claim is that the sum of the first n cubes equals the square of the sum of the first n integers. For n equal to four: one plus eight plus twenty-seven plus sixty-four is one hundred, and one plus two plus three plus four is ten, whose square is one hundred.',
      keyword: 'the square of the sum',
      detail: 'The right side is often written n squared times n plus one squared, over four, because the inner sum is n times n plus one over two.'
    },
    {
      id: 'cu-2', start: 67.5, end: 75, scene: 'cubes',
      visualAction: 'base',
      caption: 'Base case, n equals one: one cubed is one, and the square of one is one. The two sides agree.',
      narration: 'Base case at n equals one. One cubed is one, and the square of one is one. The two sides agree, so the base holds and the chain has a first domino.',
      keyword: 'one cubed is one'
    },
    {
      id: 'cu-3', start: 75, end: 82.5, scene: 'cubes',
      visualAction: 'step',
      caption: 'Step: the n plus one case adds n plus one cubed to the hypothesis, and the right side grows by exactly the same amount.',
      narration: 'Now the step. Assume the identity at n. The left side at n plus one is the left side at n plus n plus one cubed. The right side at n plus one is the right side at n plus n plus one cubed, because the two consecutive squares differ by exactly that cube. So both sides grow by the same amount and the identity survives.',
      keyword: 'both sides grow by the same amount',
      detail: 'The algebraic fact doing the work is that the square of the triangular number T(n+1) minus the square of T(n) equals (n+1)^3, since T(n+1) - T(n) = n+1 and T(n+1) + T(n) = (n+1)^2.'
    },
    {
      id: 'cu-4', start: 82.5, end: 90, scene: 'cubes',
      visualAction: 'check',
      caption: 'The page checks n from one to three hundred and the residual is zero every time, but the check is evidence, not the proof.',
      narration: 'The page checks the identity from n equals one to three hundred, and also checks the algebraic difference at every step, and the residual is zero every time. That check is evidence. The proof is the two paragraphs above, and only the proof covers the numbers past three hundred.',
      keyword: 'evidence, not the proof',
      trap: 'An exhaustive check of finitely many n is not an induction. It is a useful check on your algebra, and it can never replace the step.'
    },

    /* ---------------- scene 4: choosing the base ---------------- */
    {
      id: 'ba-1', start: 90, end: 97.5, scene: 'base',
      visualAction: 'table',
      caption: 'Claim: two to the n beats n squared. At n equal to one it is true, and at n equal to two it is already false.',
      narration: 'Here the base case needs care. The claim is that two to the n is greater than n squared. At n equal to one, two beats one, so it holds. At n equal to two, four is not greater than four, and at n equal to three, eight is less than nine.',
      keyword: 'four is not greater than four',
      detail: 'The truth values for n = 1 to 8 are true, false, false, false, true, true, true, true. The first n from which the claim is permanently true is 5.'
    },
    {
      id: 'ba-2', start: 97.5, end: 105, scene: 'base',
      visualAction: 'fails',
      caption: 'So the claim is not true for all n. It is true for n at least five, and the base case has to be five, not one.',
      narration: 'So the claim as stated is false. The true statement is for n at least five, and that means the base case is five. Choosing one because it is true is choosing a domino that does not reach the rest.',
      keyword: 'the base case has to be five',
      trap: 'Picking a base case because it is easy, rather than because it is the smallest n in the claim, is the commonest way to prove a statement nobody asked about.'
    },
    {
      id: 'ba-3', start: 105, end: 112.5, scene: 'base',
      visualAction: 'stepdomain',
      caption: 'The step needs n plus one squared below two n squared, which holds from n equal to three: sixteen is below eighteen.',
      narration: 'Now the step. To get from n to n plus one you need n plus one squared to be below two n squared. At n equal to three that is sixteen below eighteen, and it stays true. So the step is valid for n at least three, while the base is at five.',
      keyword: 'valid for n at least three'
    },
    {
      id: 'ba-4', start: 112.5, end: 120, scene: 'base',
      visualAction: 'coverage',
      caption: 'The base must sit inside the step domain and the chain must cover the claim. Base one with step three covers only n equal to one.',
      narration: 'Two conditions decide whether the argument reaches the claim. The base must sit where the step is valid, and the chain from the base must cover every n in the claim. With base one and a step valid from three, the chain cannot leave n equal to one, because the first two links are missing. With base five it covers five upward, which is the claim.',
      keyword: 'two conditions',
      trap: 'A step proved only for n at least 2 leaves the link from P(1) to P(2) unproved, which is exactly the hole in the horse argument later in this lesson.'
    },

    /* ---------------- scene 5: strong induction ---------------- */
    {
      id: 'st-1', start: 120, end: 127.5, scene: 'strong',
      visualAction: 'coins',
      caption: 'Claim: every amount from eight rupees upward is a sum of three and five rupee coins.',
      narration: 'Strong induction is the second form. The claim: every amount of eight rupees or more can be paid exactly with three and five rupee coins. Eight is three plus five, nine is three threes, ten is two fives.',
      keyword: 'eight rupees or more',
      detail: 'The three amounts 8, 9 and 10 are the base cases, and there are three of them because the step moves by three.'
    },
    {
      id: 'st-2', start: 127.5, end: 135, scene: 'strong',
      visualAction: 'weak-fails',
      caption: 'The ordinary step cannot work: three rupees is payable and four is not, and six is payable and seven is not.',
      narration: 'The ordinary step cannot work here. Three rupees is payable and four is not, and six rupees is payable while seven is not. So a hypothesis about n alone tells you nothing about n plus one. What it does tell you is that n plus three is payable, because you can add one three rupee coin.',
      keyword: 'n plus three',
      trap: 'Reaching for the n to n plus one step because it is the version you memorised. Read the step the arithmetic actually offers.'
    },
    {
      id: 'st-3', start: 135, end: 142.5, scene: 'strong',
      visualAction: 'hypothesis',
      caption: 'So assume the claim for every amount below n, and pay n by paying n minus three and adding a coin.',
      narration: 'So the hypothesis is widened: assume the claim for every amount from eight up to n minus one. Then pay n by paying n minus three, which the hypothesis allows because n minus three is at least eight once n is at least eleven, and adding one three rupee coin.',
      keyword: 'every amount below n',
      detail: 'The bound n at least 11 is what makes n-3 at least 8, so that the hypothesis applies. The three base cases 8, 9 and 10 are exactly the amounts the step cannot reach.'
    },
    {
      id: 'st-4', start: 142.5, end: 150, scene: 'strong',
      visualAction: 'verdict',
      caption: 'Strong induction is not stronger: it is the same rule with a wider hypothesis, and any strong proof reformats as an ordinary one.',
      narration: 'Strong induction is not a stronger rule. Any proof that uses it can be rewritten as an ordinary induction by putting the universal quantifier inside the predicate: instead of P of n, prove that P holds for everything up to n. It is a convenience, and the seven unpayable amounts below eight, which are one, two, four and seven, are unaffected by which form you use.',
      keyword: 'not stronger',
      detail: 'The unpayable amounts are 1, 2, 4 and 7. Every amount from 8 to 120 is payable, checked in the model.'
    },

    /* ---------------- scene 6: well-ordering ---------------- */
    {
      id: 'wo-1', start: 150, end: 157.5, scene: 'wop',
      visualAction: 'wop',
      caption: 'Well-ordering: every non-empty set of natural numbers has a least element. That is false for the rationals.',
      narration: 'The third format is well-ordering: every non-empty set of natural numbers has a least element. It looks obvious, and it is false if you replace the naturals by the rationals, because the positive rationals have no least element. So it is a real fact about the naturals.',
      keyword: 'has a least element',
      detail: 'The principle is an axiom of the naturals, equivalent to induction. It is the basis of the least-counterexample proof style.'
    },
    {
      id: 'wo-2', start: 157.5, end: 165, scene: 'wop',
      visualAction: 'counterexamples',
      caption: 'So suppose the claim fails somewhere. The set of counterexamples is non-empty, so it has a least member n.',
      narration: 'Now use it. Suppose the coin claim fails for some amount. The set of counterexamples is non-empty, so by well-ordering it has a least member. Call it n. Every amount below n is therefore payable.',
      keyword: 'a least member',
      trap: 'The set of counterexamples must be a set of naturals. Restating the claim over the reals, or over a range with no least element, voids the argument.'
    },
    {
      id: 'wo-3', start: 165, end: 172.5, scene: 'wop',
      visualAction: 'contradiction',
      caption: 'But n minus three is below n, so it is payable, so n is payable: a smaller counterexample, which is a contradiction.',
      narration: 'But n is at least eleven, because eight, nine and ten were checked. So n minus three is at least eight and below n, hence payable by the choice of n as least. Add a three rupee coin and n is payable, contradicting that n was a counterexample. The set is empty, so the claim holds.',
      keyword: 'a smaller counterexample'
    },
    {
      id: 'wo-4', start: 172.5, end: 180, scene: 'wop',
      visualAction: 'equivalence',
      caption: 'Induction, strong induction and well-ordering are three formats for one argument, and any of them reformats as any other.',
      narration: 'The three methods are three formats for the same reasoning, and any one of them can be rewritten as any other. Which you use is a matter of which reads most clearly. What never changes is that something must be checked at the bottom, and something must carry you upward.',
      keyword: 'three formats',
      detail: 'The reformatting is mechanical: decorate the hypothesis with a universal quantifier to turn strong into ordinary, and take the least counterexample to turn ordinary into well-ordering.'
    },

    /* ---------------- scene 7: structural induction ---------------- */
    {
      id: 'sp-1', start: 180, end: 187.5, scene: 'struct',
      visualAction: 'definition',
      caption: 'A full binary tree is a leaf, or a node with two full binary trees. The definition is already a base and a step.',
      narration: 'Structural induction is induction on a recursive definition. A full binary tree is either a single leaf, or an internal node whose two children are full binary trees. That definition has a base case and a step built into it, which is exactly what an induction needs.',
      keyword: 'a base and a step',
      detail: 'This is the same shape as a grammar: a terminal, or a production combining smaller derivations. The CFG lesson uses the identical recursion for derivation trees.'
    },
    {
      id: 'sp-2', start: 187.5, end: 195, scene: 'struct',
      visualAction: 'claim',
      caption: 'Claim: with i internal nodes the tree has i plus one leaves. A lone leaf has zero internal nodes and one leaf.',
      narration: 'The claim: a full binary tree with i internal nodes has i plus one leaves. The base is the lone leaf, which has zero internal nodes and one leaf, so the claim reads one equals one.',
      keyword: 'i plus one leaves'
    },
    {
      id: 'sp-3', start: 195, end: 202.5, scene: 'struct',
      visualAction: 'step',
      caption: 'Step: a node over two trees adds one internal node and merges their leaves, so i plus one becomes i plus two.',
      narration: 'The step: take an internal node whose children are full binary trees with i one and i two internal nodes. By the hypothesis they have i one plus one and i two plus one leaves. The parent adds one internal node and its leaves are the two children\'s leaves, so the count is i one plus i two plus two leaves over i one plus i two plus one internal nodes. The claim holds at the parent.',
      keyword: 'adds one internal node'
    },
    {
      id: 'sp-4', start: 202.5, end: 210, scene: 'struct',
      visualAction: 'check',
      caption: 'The page builds every full binary tree up to six internal nodes: one hundred and ninety-seven trees, and the count holds in all of them.',
      narration: 'The page builds every full binary tree with up to six internal nodes, one hundred and ninety-seven trees in all, counted as the Catalan numbers one, one, two, five, fourteen, forty-two, one hundred and thirty-two. The leaf count equals the internal count plus one in every one of them, and the number of edges is twice the internal count.',
      keyword: 'one hundred and ninety-seven'
    },

    /* ---------------- scene 8: recurrences ---------------- */
    {
      id: 're-1', start: 210, end: 217.5, scene: 'recur',
      visualAction: 'recurrence',
      caption: 'A recurrence gives T at n from T at smaller inputs. A closed form gives it in one step, and induction connects the two.',
      narration: 'Recurrences appear in Section 5 of the syllabus, and induction is what turns a guessed closed form into a proved one. The recurrence here is T of n equals two T of n over two plus n, with T of one equal to zero.',
      keyword: 'turns a guess into a proof',
      detail: 'This is the merge sort recurrence with the base cost set to zero, so that the closed form is exactly n log base two n with no additive term.'
    },
    {
      id: 're-2', start: 217.5, end: 225, scene: 'recur',
      visualAction: 'guess',
      caption: 'Guess: T of n equals n log base two n. At sixteen that is sixty-four, and at one thousand and twenty-four it is ten thousand two hundred and forty.',
      narration: 'The guess is that T of n equals n times log base two n. At sixteen the recurrence gives sixty-four, and sixteen times four is sixty-four. At one thousand and twenty-four it gives ten thousand two hundred and forty, which is one thousand and twenty-four times ten.',
      keyword: 'n log base two n'
    },
    {
      id: 're-3', start: 225, end: 232.5, scene: 'recur',
      visualAction: 'step',
      caption: 'Step: T of two k is two T of k plus two k, which by the hypothesis is two k log k plus two k, which is two k log of two k.',
      narration: 'Now the step, which is where the guess is checked rather than hoped for. T of two k is two T of k plus two k. Substitute the hypothesis: two k log base two k, plus two k, which is two k times log base two k plus one, and that is two k times log base two of two k. The closed form at two k, which is what the step had to produce.',
      keyword: 'substitute the hypothesis',
      trap: 'The substitution only works for powers of two, because the recurrence halves. A proof for n equal to two to the m is a proof for those n, not for every n, and the claim must say so.'
    },
    {
      id: 're-4', start: 232.5, end: 240, scene: 'recur',
      visualAction: 'verify',
      caption: 'The page computes the recurrence exactly for every power of two up to a million, and the closed form matches at all twenty.',
      narration: 'The page runs the recurrence exactly, without floating point, for every power of two from two up to one million and forty-eight thousand five hundred and seventy-six, twenty values, and the closed form matches at every one. That is the check; the substitution above is the proof, and only the proof covers the non-powers of two.',
      keyword: 'the closed form matches',
      detail: 'The base is T(1) = 0. With T(1) = 1 the closed form would be n log n + n, which is the merge sort cost including the leaves.'
    },

    /* ---------------- scene 9: loop invariants ---------------- */
    {
      id: 'in-1', start: 240, end: 247.5, scene: 'invariant',
      visualAction: 'setup',
      caption: 'A loop invariant is a statement true before the loop, after every pass, and at the end: induction with a clock.',
      narration: 'The last use is the one that decides algorithm questions. A loop invariant is a statement about the program state that is true before the first pass, stays true after each pass, and is therefore true when the loop ends. That is induction, with the pass number as n.',
      keyword: 'induction with a clock',
      detail: 'This is the standard correctness argument of CLRS chapter 2, restated in induction language.'
    },
    {
      id: 'in-2', start: 247.5, end: 255, scene: 'invariant',
      visualAction: 'three',
      caption: 'Initialization is the base case, maintenance is the step, and termination is the invocation: three obligations, no more.',
      narration: 'The three obligations map exactly. Initialization is the base case: the invariant holds before the first pass. Maintenance is the step: if it holds at the start of a pass, it holds at the end. Termination is the invocation: when the loop stops, the invariant plus the exit condition gives the result.',
      keyword: 'initialization, maintenance, termination',
      trap: 'Termination needs the exit condition as well as the invariant. The invariant alone rarely says the array is sorted; it says a prefix is sorted, and the exit condition says the prefix is everything.'
    },
    {
      id: 'in-3', start: 255, end: 262.5, scene: 'invariant',
      visualAction: 'insertion',
      caption: 'Insertion sort: after pass i the first i entries are sorted and hold the same values as the original first i entries.',
      narration: 'For insertion sort the invariant is that after pass i, the first i entries are sorted and are exactly the first i entries of the input, rearranged. On the input five, two, four, six, one, three, the prefix after the third pass is two, four, five, which is sorted and is the first three values.',
      keyword: 'sorted, and the same values',
      detail: 'The second half of the invariant is what makes the final array a permutation of the input, and it is the half that students leave out.'
    },
    {
      id: 'in-4', start: 262.5, end: 270, scene: 'invariant',
      visualAction: 'check',
      caption: 'The page runs insertion sort on all twenty-four orderings of four values and the invariant holds at every index of every run.',
      narration: 'The page runs insertion sort on all twenty-four orderings of four values, checking the invariant after every pass of every run, and it holds each time; the final array is sorted in all twenty-four. What the page cannot do is prove it for five values, and that is the difference between a check and an induction.',
      keyword: 'every index of every run'
    },

    /* ---------------- scene 10: where it breaks ---------------- */
    {
      id: 'br-1', start: 270, end: 277.5, scene: 'breaks',
      visualAction: 'horses',
      caption: 'The horse argument: two overlapping groups of n share a middle. With n equal to one the middle is empty.',
      narration: 'Now the failures. The famous one claims all horses are the same colour. Take a set of n plus one horses. The first n are one colour and the last n are one colour, and if those two groups share a horse, all n plus one agree. The middle group has n minus one horses, and that is zero exactly when n is one.',
      keyword: 'zero exactly when n is one',
      detail: 'The model computes the size of the intersection for each n: it is n-1, so it is empty only at n = 1. The step is valid for every n at least 2, and the base case needed is n = 2, which is false.'
    },
    {
      id: 'br-2', start: 277.5, end: 285, scene: 'breaks',
      visualAction: 'fermat',
      caption: 'A pattern is not a proof: two to the two to the k plus one is prime for k up to four, and composite at k equal to five.',
      narration: 'Second failure: mistaking a pattern for a proof. The numbers two to the two to the k, plus one, are three, five, seventeen, two hundred and fifty-seven and sixty-five thousand five hundred and thirty-seven for k from zero to four, and all five are prime. At k equal to five the number is four billion two hundred and ninety-four million nine hundred and sixty-seven thousand two hundred and ninety-seven, and it is six hundred and forty-one times six million seven hundred thousand four hundred and seventeen.',
      keyword: 'prime for k up to four',
      trap: 'Five confirming cases and no counterexample is still not a proof. The counterexample here needed six digits of exponent.'
    },
    {
      id: 'br-3', start: 285, end: 292.5, scene: 'breaks',
      visualAction: 'domain',
      caption: 'A step proved only from n equal to two, or only for powers of two, does not cover the claim it is attached to.',
      narration: 'Third failure: a step outside its domain. A step proved for n at least two leaves the first link open, which is the horse hole. A step proved only for powers of two proves the claim only at powers of two. The domain of the step and the range of the claim have to be compared before the argument is written down.',
      keyword: 'the domain of the step'
    },
    {
      id: 'br-4', start: 292.5, end: 300, scene: 'breaks',
      visualAction: 'words',
      caption: 'And two different words: inductive reasoning generalises from cases, mathematical induction is a deduction.',
      narration: 'Fourth, a confusion of words. Inductive reasoning in the aptitude sense generalises from examples and is never certain. Mathematical induction is a deduction: its conclusion follows from its premises with no residue of doubt. The General Aptitude syllabus uses the first word, and this lesson is about the second.',
      keyword: 'a deduction',
      detail: 'The analytical aptitude lesson treats the first sense, including the trap of treating a finite pattern as a rule. This lesson treats the second.'
    }
  ]
};
