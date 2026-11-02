/* ==========================================================================
   selection-lower-bounds-max-min-second-largest - THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs - never edited by hand.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 348,

  scenes: [
    { id: 'pay',        n: 1,  title: 'The question is a count, not a growth rate', objective: 'see that "how many comparisons" is a different question from "how fast does it grow", and that every count below is exact', start: 0,   end: 30  },
    { id: 'knockout',   n: 2,  title: 'The maximum costs n minus 1, and cannot cost less', objective: 'count the knockouts a maximum needs, and see the adversary stop an algorithm one comparison early', start: 30,  end: 60  },
    { id: 'naive',      n: 3,  title: 'Minimum and maximum the obvious way: 2n minus 2', objective: 'count the independent-scan algorithm exactly, and see where its comparisons are wasted', start: 60,  end: 92  },
    { id: 'pairing',    n: 4,  title: 'The pairing trick: 3n/2 minus 2', objective: 'run the pairwise algorithm, count its three parts, and land on 148 for n = 100', start: 92,  end: 126 },
    { id: 'adversary',  n: 5,  title: 'Why 3n/2 minus 2 cannot be beaten', objective: 'run the four-category adversary accounting: 2n - 2 points are needed and only floor(n/2) comparisons can pay two at once', start: 126, end: 160 },
    { id: 'oddn',       n: 6,  title: 'Odd n, the leftover element, and the exact formula', objective: 'repair the count for odd n and check the closed form against the running algorithm for n = 2 to 12', start: 160, end: 188 },
    { id: 'second',     n: 7,  title: 'The second largest the obvious way: 2n minus 3', objective: 'count the two-pass method and see why almost all of its comparisons are wasted', start: 188, end: 220 },
    { id: 'tournament', n: 8,  title: 'The tournament tree: n plus log n minus 2', objective: 'build the knockout tree, keep the beaten lists, and find the second largest among the winner\'s own victims', start: 220, end: 252 },
    { id: 'lower2',     n: 9,  title: 'Why fewer comparisons cannot find the second largest', objective: 'see the adversary force the winner to beat ceil(log2 n) elements, every one of them still a candidate', start: 252, end: 282 },
    { id: 'bruteforce', n: 10, title: 'Searching every strategy for n up to 5', objective: 'exhaust the space of comparison strategies and confirm 1, 3, 4, 6 - then find where the two formulas part company', start: 282, end: 312 },
    { id: 'gate',       n: 11, title: 'Two previous-year items, recomputed', objective: 'answer GATE CSE 2014 Set 1 Q39 and GATE CSE 2021 Set 1 Q2 from the count, not from memory', start: 312, end: 348 }
  ],

  events: [
    /* ---- 1. what is being counted --------------------------------------- */
    { id: 'p1', scene: 'pay', start: 0, end: 8,
      caption: 'Eight numbers. Find the largest. The only operation you may use compares two of them.',
      narration: 'Eight numbers, and the job is to find the largest. The only operation you are allowed to use compares two of them and tells you which is bigger. Every question in this lesson is about how many such comparisons the job costs.',
      detail: 'The model is a comparison model: the algorithm sees numbers only through a test that takes two of them and returns which is larger. Reading a value, adding, or indexing costs nothing here, because those operations are not what the bound is about.',
      keyword: 'compares two of them' },

    { id: 'p2', scene: 'pay', start: 8, end: 15,
      caption: 'A growth rate hides the constant. A count does not. GATE asks for the count.',
      narration: 'A growth rate hides the constant factor. Saying that finding the maximum takes linear time is true and useless when the question asks for a number. A count does not hide anything: seven, or nine, or one hundred and forty-eight.',
      detail: 'Big-O is an upper bound up to a constant. A comparison count is an exact integer, and two algorithms with the same growth rate can differ by a factor near two. That factor is what a numerical-answer question asks for.',
      keyword: 'A count does not hide anything' },

    { id: 'p3', scene: 'pay', start: 15, end: 23,
      caption: 'The counter starts at zero. Every comparison below is paid for, and none is free.',
      narration: 'The counter starts at zero. Everything that follows is a ledger: each comparison is paid for once, and the total at the end is the answer.',
      detail: 'The page counts by running the algorithms, not by recalling a formula. The formula is then checked against the count for every n from 2 to 64, and a disagreement would fail a model check rather than pass unnoticed.',
      keyword: 'Everything that follows is a ledger' },

    { id: 'p4', scene: 'pay', start: 23, end: 30,
      caption: 'Three jobs, three different counts: the largest alone, the largest and smallest together, and the second largest.',
      narration: 'There are three jobs in this lesson, and they have three different answers. The largest alone. The largest and the smallest together. And the second largest, which is the one people get wrong.',
      detail: 'The three are genuinely different problems: the first needs n - 1 comparisons, the second needs about 1.5 n, and the third needs about n plus log n. None of the three is the same as sorting, which needs about n log n.',
      keyword: 'three different answers',
      trap: 'Do not answer "find the largest and smallest" with 2n - 2 without checking whether a cheaper method exists. It does, and the whole difference is one comparison per pair.' },

    /* ---- 2. the maximum -------------------------------------------------- */
    { id: 'k1', scene: 'knockout', start: 30, end: 38,
      caption: 'Scan once, keeping the best so far: seven comparisons for eight numbers.',
      narration: 'Scan the numbers once and keep the best so far. The first number is free, and each of the other seven costs one comparison against the champion. Seven comparisons for eight numbers, which is n minus 1.',
      detail: 'The count is n - 1 because the first element needs no comparison and every later element needs exactly one. The result does not depend on the values, so this is both the worst case and the best case.',
      keyword: 'seven comparisons for eight numbers' },

    { id: 'k2', scene: 'knockout', start: 38, end: 45,
      caption: 'Every comparison knocks one candidate out of the race. Seven knockouts leave one standing.',
      narration: 'Read the same scan as a knockout tournament. A comparison between two undefeated candidates eliminates exactly one of them. To be left with a single candidate, seven of the eight must be eliminated, so seven comparisons are needed.',
      detail: 'This is the lower bound, not just the algorithm. Any method, however clever, must eliminate n - 1 candidates, and one comparison eliminates at most one candidate for the maximum.',
      keyword: 'knocks one candidate out' },

    { id: 'k3', scene: 'knockout', start: 45, end: 52,
      caption: 'Stop after six comparisons and two candidates are still undefeated. The adversary says either could be the largest.',
      narration: 'Suppose an algorithm stops after six comparisons. Two candidates have never lost, so both could be the largest, and the adversary is free to declare whichever one the algorithm did not pick. The answer is not determined, so the algorithm is wrong on some input.',
      detail: 'This is the adversary argument in its smallest form: the adversary answers each comparison so as to keep as many candidates alive as possible, and it can always do that while two undefeated elements remain.',
      keyword: 'two candidates are still undefeated' },

    { id: 'k4', scene: 'knockout', start: 52, end: 60,
      caption: 'So n minus 1 is exact: achievable and unavoidable. That pairing of words is what the rest of the lesson repeats.',
      narration: 'So n minus 1 is exact: it is achieved by the scan and it cannot be beaten. From here on, every count in this lesson has that same two-part shape, an algorithm that attains the number and an argument that no algorithm can go below it.',
      detail: 'A count is only an answer when both halves are known. An algorithm alone gives an upper bound; an adversary alone gives a lower bound. A question that asks for the minimum number of comparisons is asking for the two to meet.',
      keyword: 'achievable and unavoidable',
      trap: 'A lower bound proved for one algorithm is not a lower bound for the problem. The knockout argument constrains every algorithm because it only counts eliminations, which every correct algorithm must achieve.' },

    /* ---- 3. the obvious min and max ------------------------------------- */
    { id: 'n1', scene: 'naive', start: 60, end: 68,
      caption: 'Now find both the smallest and the largest. The obvious method scans twice.',
      narration: 'Now the job is to find both the smallest and the largest. The obvious method runs the scan twice: once for the largest, once for the smallest.',
      detail: 'This is the method almost everyone writes first, and it is correct. The question is whether it is cheap, and the answer is that it pays for the same information twice.',
      keyword: 'scans twice' },

    { id: 'n2', scene: 'naive', start: 68, end: 76,
      caption: 'Two scans cost two lots of n minus 1, which is 2n minus 2. At n = 100 that is 198.',
      narration: 'Two scans cost two lots of n minus 1, which is 2n minus 2. At n equal to one hundred that is one hundred and ninety-eight comparisons.',
      detail: 'Each scan is optimal for its own single question, so the waste is not inside either scan. It is that the second scan re-compares pairs the first scan has already ordered.',
      keyword: '198' },

    { id: 'n3', scene: 'naive', start: 76, end: 84,
      caption: 'Look at what one comparison tells you: of two numbers, one is a candidate for the largest and the other for the smallest.',
      narration: 'Look at what a single comparison already tells you. Compare two numbers and you learn which is the larger and which is the smaller. That one comparison has produced one candidate for the maximum and one candidate for the minimum, at the same time.',
      detail: 'A comparison between two elements gives two pieces of information, not one: the loser cannot be the maximum, and the winner cannot be the minimum. The naive method throws the second piece away.',
      keyword: 'two pieces of information' },

    { id: 'n4', scene: 'naive', start: 84, end: 92,
      caption: 'So the naive count is not the minimum. It is one comparison per pair too many, and the next scene collects that.',
      narration: 'So the naive count is not the minimum. It pays one comparison per pair more than it needs to, and the next scene shows the method that stops paying it.',
      detail: 'The gap is exactly floor(n/2): the number of pairs whose second piece of information the naive method discards. For n equal to one hundred the gap is fifty, and 198 minus 50 is 148.',
      keyword: 'one comparison per pair too many' },

    /* ---- 4. the pairing trick ------------------------------------------- */
    { id: 'g1', scene: 'pairing', start: 92, end: 100,
      caption: 'First compare the numbers in pairs. Fifty comparisons at n = 100, and every pair is now ordered.',
      narration: 'First compare the numbers in pairs. At n equal to one hundred that is fifty comparisons, and every pair is now ordered, so each pair has a larger member and a smaller member.',
      detail: 'This first phase is the only place where a comparison can settle both questions at once, so it is worth doing first and worth doing to every pair.',
      keyword: 'First compare the numbers in pairs' },

    { id: 'g2', scene: 'pairing', start: 100, end: 108,
      caption: 'Now the largest must be among the fifty larger members. Finding it costs 49 comparisons.',
      narration: 'Now the largest of all must be one of the fifty larger members, because every smaller member lost its own pair. Finding the largest among fifty candidates costs forty-nine comparisons.',
      detail: 'The maximum is confined to the winners of the first phase. This is the same knockout argument as before, applied to half the elements.',
      keyword: 'among the fifty larger members' },

    { id: 'g3', scene: 'pairing', start: 108, end: 116,
      caption: 'And the smallest must be among the fifty smaller members: another 49 comparisons.',
      narration: 'By the same argument the smallest must be one of the fifty smaller members, and finding it costs another forty-nine comparisons.',
      detail: 'The two searches run on disjoint sets, which is why their costs add rather than overlap. Fifty plus forty-nine plus forty-nine is one hundred and forty-eight.',
      keyword: 'another 49 comparisons' },

    { id: 'g4', scene: 'pairing', start: 116, end: 126,
      caption: 'Fifty plus 49 plus 49 is 148. In general floor(n/2) plus 2 times ceil(n/2) minus 2, which is 3n/2 minus 2 for even n.',
      narration: 'Fifty plus forty-nine plus forty-nine is one hundred and forty-eight. In general the count is floor of n over 2 for the pairs, plus two lots of ceil of n over 2 minus 1 for the two searches, which for even n is 3n over 2 minus 2.',
      detail: 'The page runs this algorithm and counts, rather than trusting the algebra: for every n from 2 to 64 the running count equals the closed form, and the minimum and maximum it reports are checked against a sort of the same array.',
      keyword: '148',
      trap: 'The saving is not asymptotic. 148 and 198 are both linear, and a question that asks for the constant is not answered by saying "O(n)".' },

    /* ---- 5. the adversary argument -------------------------------------- */
    { id: 'a1', scene: 'adversary', start: 126, end: 134,
      caption: 'To prove no method beats 148, track each element in one of four states.',
      narration: 'To prove that no method can beat one hundred and forty-eight, track every element in one of four states: untouched, has only won, has only lost, or has both won and lost.',
      detail: 'The four sets are disjoint and they cover everything. Untouched means never compared. Has-only-won means every comparison it took part in it won. Has-only-lost means it lost them all. Both means it has at least one win and at least one loss.',
      keyword: 'four states' },

    { id: 'a2', scene: 'adversary', start: 134, end: 142,
      caption: 'At the end, one element has only won, one has only lost, and the other n minus 2 have both.',
      narration: 'When the algorithm finishes, the maximum has only won, the minimum has only lost, and every other element has both a win and a loss, because it is neither the largest nor the smallest.',
      detail: 'So n minus 2 elements must each acquire two facts, one win and one loss, and two more elements must each acquire one. That is 2n minus 2 units of information in total.',
      keyword: '2n minus 2 units of information' },

    { id: 'a3', scene: 'adversary', start: 142, end: 150,
      caption: 'A comparison between two untouched elements pays two units. Every other comparison pays at most one.',
      narration: 'A comparison between two untouched elements can pay two units at once, because the winner gains a win and the loser gains a loss. Every other kind of comparison pays at most one, and some pay none.',
      detail: 'This is the adversary at work: it answers each comparison so that as little information as possible is delivered. Only a comparison between two untouched elements is forced to be generous, and the adversary will avoid those.',
      keyword: 'pays two units' },

    { id: 'a4', scene: 'adversary', start: 150, end: 160,
      caption: 'At most floor(n/2) comparisons can be generous, so at least 2n minus 2 minus floor(n/2) comparisons are needed: ceil(3n/2) minus 2.',
      narration: 'At most floor of n over 2 comparisons can be of the generous kind, because each one consumes two untouched elements. So the total is at least 2n minus 2 minus floor of n over 2, which is ceil of 3n over 2 minus 2. The bound is exact.',
      detail: 'The page computes 2n - 2 - floor(n/2) for every n from 2 to 64 and compares it with the closed form; the two agree everywhere, and both agree with the count of the pairing algorithm.',
      keyword: 'ceil of 3n over 2 minus 2',
      trap: 'The bound counts information, not comparisons of a particular shape. That is why it applies to every possible algorithm, including ones nobody has invented.' },

    /* ---- 6. odd n and the table ----------------------------------------- */
    { id: 'o1', scene: 'oddn', start: 160, end: 168,
      caption: 'With an odd count one element is left over after pairing. Compare it to both champions: two more comparisons.',
      narration: 'With an odd number of elements, one element is left over after the pairs are made. Compare it with the current largest and with the current smallest, which costs two comparisons, and the count becomes 3 times n minus 3, all over 2.',
      detail: 'For odd n the count is 3(n-1)/2. At n equal to 5 that is 6; at n equal to 3 it is 3. The ceiling form ceil(3n/2) - 2 gives the same value in every case, which is why one formula is worth having.',
      keyword: 'one element is left over' },

    { id: 'o2', scene: 'oddn', start: 168, end: 176,
      caption: 'One formula covers both parities: ceil(3n/2) minus 2. Two numbers: 1, and three numbers: 3.',
      narration: 'One formula covers both parities: ceil of 3n over 2, minus 2. For two numbers it gives one comparison, which is right, because comparing them settles both questions. For three numbers it gives three.',
      detail: 'At n equal to 2 the pairing method is degenerate but the formula is still correct. Checking small cases against the formula is the cheapest way to catch a ceiling error before an exam does it for you.',
      keyword: 'ceil(3n/2) minus 2' },

    { id: 'o3', scene: 'oddn', start: 176, end: 184,
      caption: 'The table for n from 2 to 12: naive 2n minus 2, the pairing count, and the formula. They agree on every row.',
      narration: 'The table runs n from 2 to 12 and puts three numbers side by side: the naive 2n minus 2, the count the pairing algorithm actually makes, and the closed form. The last two agree on every row.',
      detail: 'For n equal to 6 the naive method costs 10 and the pairing method 7. For n equal to 12 it is 22 against 16. The gap grows as n/2, so it is proportional, not a fixed saving.',
      keyword: 'They agree on every row' },

    { id: 'o4', scene: 'oddn', start: 184, end: 188,
      caption: 'The saving over the naive method is exactly floor(n/2): one comparison for each pair.',
      narration: 'The saving over the naive method is exactly floor of n over 2, one comparison for every pair. That is the second piece of information the naive method discards, priced exactly.',
      detail: 'Writing the saving as a formula makes it checkable: naive minus optimal equals floor(n/2), which the page verifies for n from 2 to 64.',
      keyword: 'exactly floor(n/2)' },

    /* ---- 7. second largest, the obvious way ------------------------------ */
    { id: 's1', scene: 'second', start: 188, end: 196,
      caption: 'The second largest. The obvious method: find the largest, then find the largest of the rest.',
      narration: 'Now the second largest. The obvious method finds the largest, removes it from consideration, and finds the largest of what remains.',
      detail: 'This is correct and it is what most people write. Its cost is n - 1 comparisons for the maximum plus n - 2 for the second search, which is 2n - 3.',
      keyword: 'the largest of the rest' },

    { id: 's2', scene: 'second', start: 196, end: 204,
      caption: 'At n = 8 that is 13 comparisons. The answer is 9, and the gap is the whole lesson.',
      narration: 'At n equal to eight the obvious method costs thirteen comparisons. The best possible is nine. That gap of four is what the rest of this lesson closes.',
      detail: 'The waste is the same shape as before: the second search re-examines elements the first search has already proved to be smaller than the maximum. Almost all of them cannot be second.',
      keyword: '13 comparisons' },

    { id: 's3', scene: 'second', start: 204, end: 212,
      caption: 'Think about who can be second. Only someone who lost directly to the largest can be.',
      narration: 'Think about who could possibly be the second largest. Someone who lost a comparison to a third element is certainly smaller than that element, so they cannot be second. Only an element that lost directly to the largest can be second.',
      detail: 'That is the key observation, and it is a statement about comparisons, not about values. The candidates for second are exactly the elements the maximum beat, and there are far fewer of those than n - 2.',
      keyword: 'lost directly to the largest' },

    { id: 's4', scene: 'second', start: 212, end: 220,
      caption: 'So the second search does not need the whole array. It needs one list: the elements the largest beat.',
      narration: 'So the second search does not need the whole array at all. It needs one list, the list of elements the largest beat, and that list is short if the tournament is organised well.',
      detail: 'The list is short exactly when the maximum is found by a balanced knockout, because a balanced tournament makes the winner play only about log n matches. That is the design decision the next scene makes.',
      keyword: 'one list',
      trap: 'An unbalanced tournament can make the winner play n - 1 matches, and then the candidate list is long and the method saves nothing. The tree shape is part of the algorithm.' },

    /* ---- 8. the tournament tree ----------------------------------------- */
    { id: 't1', scene: 'tournament', start: 220, end: 228,
      caption: 'Eight leaves, four matches, then two, then one: seven comparisons to find the largest.',
      narration: 'Eight leaves, four matches in the first round, two in the second, one in the final. Seven comparisons, which is n minus 1, and the winner is the largest.',
      detail: 'Every match is one comparison, and a balanced bracket of eight leaves has seven internal nodes, one per comparison. The tree is the ledger: the number of internal nodes is the number of comparisons.',
      keyword: 'seven comparisons' },

    { id: 't2', scene: 'tournament', start: 228, end: 236,
      caption: 'The winner played three matches. Its three victims are the only candidates for second place.',
      narration: 'The winner played exactly three matches, so it beat exactly three elements. Those three are the only candidates for second place, and there are no others.',
      detail: 'Three is ceil of log base 2 of 8. In general a balanced bracket makes the winner play ceil(log2 n) matches, because each match halves the number of survivors.',
      keyword: 'three candidates' },

    { id: 't3', scene: 'tournament', start: 236, end: 244,
      caption: 'Find the largest of those three: two comparisons. Total 7 plus 2 is 9.',
      narration: 'Find the largest among the three candidates, which costs two comparisons. Seven plus two is nine, and nine is n plus ceil(log2 n) minus 2 at n equal to eight.',
      detail: 'The page builds this tree for every n from 2 to 64, counts the comparisons it makes, checks that the winner beat exactly ceil(log2 n) elements, and checks that the second largest it reports is the true second largest of the array.',
      keyword: '7 plus 2 is 9' },

    { id: 't4', scene: 'tournament', start: 244, end: 252,
      caption: 'The saving over 2n minus 3 is n minus 1 minus ceil(log2 n). At n = 8 that is 4, and it grows.',
      narration: 'The saving over the two-pass method is n minus 1 minus ceil of log base 2 of n. At n equal to eight that is four, and it grows with n, so the advantage is not a constant.',
      detail: 'Both methods are linear, so the difference is a constant factor that tends to 1: the tournament spends about n comparisons, the two-pass method about 2n. The log term is the whole of the extra work.',
      keyword: 'n minus 1 minus ceil(log2 n)' },

    /* ---- 9. why fewer cannot work --------------------------------------- */
    { id: 'l1', scene: 'lower2', start: 252, end: 260,
      caption: 'Why can no method use fewer than n plus log n minus 2? Count what the winner must have beaten.',
      narration: 'Why can no method use fewer than n plus log n minus 2? Because of what the winner must have beaten. If the winner beat only a few elements, the adversary still has freedom.',
      detail: 'The lower bound is again an adversary argument, but the currency is different: it is not wins and losses but the length of the winner\'s own victim list, which must be long enough to pin down the second place.',
      keyword: 'what the winner must have beaten' },

    { id: 'l2', scene: 'lower2', start: 260, end: 268,
      caption: 'If the winner beat only two elements, either of the others could be second and the adversary may choose it.',
      narration: 'Suppose the winner beat only two elements. Then an element that never met the winner has lost only to something smaller than the winner, so the adversary can promote it to second place. The answer is not determined.',
      detail: 'The adversary maintains the comparisons as a set of trees and answers each new comparison so that the winner\'s victim list stays short. It can do that until the list reaches ceil(log2 n).',
      keyword: 'the adversary may choose it' },

    { id: 'l3', scene: 'lower2', start: 268, end: 276,
      caption: 'So the winner must beat at least ceil(log2 n) elements, and each must be compared against the others: ceil(log2 n) minus 1 more.',
      narration: 'So the winner must have beaten at least ceil of log base 2 of n elements, and the second largest is the largest of them, which needs ceil of log base 2 of n minus 1 further comparisons. Adding the n minus 1 to find the winner gives n plus ceil(log2 n) minus 2.',
      detail: 'The two halves meet: the tournament attains that number and the adversary forbids anything smaller, so n + ceil(log2 n) - 2 is exact, not merely an upper bound.',
      keyword: 'n plus ceil(log2 n) minus 2',
      trap: 'The logarithm is not optional decoration. It comes from the number of matches the winner plays, which is the depth of the bracket, and an unbalanced bracket breaks the bound in the other direction.' },

    { id: 'l4', scene: 'lower2', start: 276, end: 282,
      caption: 'The same argument gives the maximum alone as n minus 1, and the pair as ceil(3n/2) minus 2: three counts, three proofs.',
      narration: 'The same style of argument gives the maximum alone as n minus 1, and the pair as ceil of 3n over 2 minus 2. Three counts, three proofs, and one method: count what any correct algorithm must know.',
      detail: 'The pattern is worth naming: identify the facts the answer requires, count how many facts one comparison can deliver, and divide. The three problems differ only in which facts are required.',
      keyword: 'count what any correct algorithm must know' },

    /* ---- 10. brute force ------------------------------------------------ */
    { id: 'b1', scene: 'bruteforce', start: 282, end: 290,
      caption: 'Do not take the formulas on trust. Search every comparison strategy for two, three, four and five numbers.',
      narration: 'Do not take the formulas on trust. For two, three, four and five numbers the page searches every possible comparison strategy, with the adversary choosing the worst answer at every step, and reports the best worst-case count.',
      detail: 'The search is a minimax over the consistent orderings. A state is the set of orderings still possible; a move is a pair to compare; the adversary picks the outcome that leaves the largest set. The value of a state is the smallest number of further comparisons that guarantees the answer.',
      keyword: 'searches every possible comparison strategy' },

    { id: 'b2', scene: 'bruteforce', start: 290, end: 298,
      caption: 'The answers are 1, 3, 4 and 6 for both jobs: the same numbers the formulas give.',
      narration: 'The answers are one, three, four and six, for both jobs, and they are exactly what the two formulas predict. The formulas are not approximations.',
      detail: 'The search visits 1 state at n = 2, 13 at n = 3, 183 at n = 4 and 3,851 at n = 5, and it is exact: it explores every pair and every adversarial answer, so its value is the true minimum over all strategies.',
      keyword: '1, 3, 4 and 6' },

    { id: 'b3', scene: 'bruteforce', start: 298, end: 306,
      caption: 'For n up to 6 the two formulas coincide: 1, 3, 4, 6, 7, 7. At n = 7 they part: 9 against 8.',
      narration: 'For n up to six the two formulas give the same number: one, three, four, six, seven, seven. At n equal to seven they part company: nine for the pair, eight for the second largest.',
      detail: 'This is a genuine trap. A student who checks n equal to 4 and sees 4 for both problems may conclude that one formula serves both. It does not: 3n/2 grows faster than n plus log n, so the coincidence is confined to small n.',
      keyword: 'At n = 7 they part',
      trap: 'The coincidence at small n is why so many answers to "second largest" are given as 3n/2 - 2. Check n = 8: the pair costs 10, the second largest 9.' },

    { id: 'b4', scene: 'bruteforce', start: 306, end: 312,
      caption: 'The search is only a check. The proof is the adversary, and the two agree wherever both apply.',
      narration: 'The exhaustive search is only a check on small cases; the proof is the adversary argument. Where both apply they agree, which is what a check is for.',
      detail: 'An exhaustive search for n up to five cannot establish a formula for all n. It can only catch a wrong formula. The general statement rests on the counting argument, which is why the lesson keeps the two separate.',
      keyword: 'The search is only a check' },

    /* ---- 11. previous-year items ---------------------------------------- */
    { id: 'q1', scene: 'gate', start: 312, end: 320,
      caption: 'GATE CSE 2014 Set 1, question 39: the minimum comparisons to find the minimum and maximum of 100 numbers.',
      narration: 'GATE CSE 2014, Set 1, question 39 asks for the minimum number of comparisons needed to find the minimum and the maximum of one hundred numbers.',
      detail: 'This is a numerical-answer item. The wording of the question and the official key are taken from past-paper archives; the official paper itself was not opened this run, and the lesson says so on the Sources tab.',
      keyword: '100 numbers' },

    { id: 'q2', scene: 'gate', start: 320, end: 328,
      caption: 'n = 100 is even, so the count is 3n/2 minus 2, which is 148. The published key is 148, accepted over 147.1 to 148.1.',
      narration: 'One hundred is even, so the count is 3n over 2 minus 2, which is one hundred and forty-eight. The published key is one hundred and forty-eight, accepted over the range one hundred and forty-seven point one to one hundred and forty-eight point one.',
      detail: 'The page recomputes 148 by running the pairing algorithm on one hundred numbers and counting, not by substituting into the formula alone. The two agree.',
      keyword: '148' },

    { id: 'q3', scene: 'gate', start: 328, end: 338,
      caption: 'GATE CSE 2021 Set 1, question 2: t is the lowest upper bound on the comparisons. Answer: t is above n and at most 3 ceil(n/2).',
      narration: 'GATE CSE 2021, Set 1, question 2 asks which statement about the lowest upper bound t is correct. The answer is that t is greater than n and at most 3 times ceil of n over 2, which is what the exact count satisfies.',
      detail: 'The exact count is ceil(3n/2) - 2. It is at most 3 ceil(n/2) for every n, and strictly greater than n from n equal to 5 onwards; at n equal to 3 and n equal to 4 the count equals n exactly, which the page reports rather than smoothing over. The check runs the inequality over n from 2 to 64.',
      keyword: 't is above n' },

    { id: 'q4', scene: 'gate', start: 338, end: 348,
      caption: 'Four steps: name the facts the answer needs, count what one comparison can deliver, divide, then exhibit the algorithm that attains it.',
      narration: 'Four steps answer any question of this family. Name the facts the answer needs. Count how many of them one comparison can deliver. Divide, and round up. Then exhibit an algorithm that attains the number, because a lower bound without an algorithm is only half an answer.',
      detail: 'The same four steps settle the maximum, the pair, and the second largest, and they extend to any fixed number of order statistics, which is where the syllabus stops.',
      keyword: 'Four steps' }
  ]
};
