/* ==========================================================================
   multi-event-independence - THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs - never edited by hand.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 330,

  scenes: [
    { id: 'two',      n: 1,  title: 'Independence of two events, read off a grid', objective: 'see P of A and B equal to P of A times P of B as the definition, checked on a four-cell grid', start: 0,   end: 30  },
    { id: 'three',    n: 2,  title: 'Three events ask four questions, not three', objective: 'count the conditions mutual independence imposes: every subset of size two or more', start: 30,  end: 60  },
    { id: 'parity',   n: 3,  title: 'Four tickets where every pair is independent and the triple is not', objective: 'run Bernstein\'s four-ticket space and find the one condition that fails', start: 60,  end: 94  },
    { id: 'dice',     n: 4,  title: 'The reverse failure: the triple product holds, no pair does', objective: 'run the two-dice space where checking only the triple product is not enough', start: 94,  end: 128 },
    { id: 'bits',     n: 5,  title: 'Any two determine the third', objective: 'see a parity bit give pairwise independence while the three together are as dependent as possible', start: 128, end: 156 },
    { id: 'atleast',  n: 6,  title: 'Why mutual, and not pairwise, licenses the multiplication', objective: 'compare the at-least-one formula against the truth on both counterexamples', start: 156, end: 188 },
    { id: 'cond',     n: 7,  title: 'Conditional independence is a different statement', objective: 'condition the parity example on Z and watch two independent events become dependent', start: 188, end: 216 },
    { id: 'disjoint', n: 8,  title: 'Disjoint, certain, impossible, and complemented', objective: 'fix the three boundaries: disjointness, probability zero or one, and taking complements', start: 216, end: 244 },
    { id: 'count',    n: 9,  title: 'Counting the independent pairs on a four-point space', objective: 'enumerate all sixteen events and count which pairs and triples qualify', start: 244, end: 276 },
    { id: 'pyq2023',  n: 10, title: 'GATE CSE 2023: three events built from two coins', objective: 'answer the verified previous-year item by computing all four options', start: 276, end: 306 },
    { id: 'transfer', n: 11, title: 'Where mutual independence is doing the work', objective: 'name the three places the multiplication is used, and the four-step check', start: 306, end: 330 }
  ],

  events: [
    /* ---- 1. two events on a grid ---------------------------------------- */
    { id: 't1', scene: 'two', start: 0, end: 8,
      caption: 'Two fair coins. A is a head on the first, B a head on the second. Four outcomes, each one quarter.',
      narration: 'Two fair coins. A is the event that the first toss is a head, B is the event that the second toss is a head. Four outcomes, each with probability one quarter.',
      detail: 'The sample space is the four ordered pairs HH, HT, TH and TT. Each atom has probability one quarter because the two tosses are fair and independent of each other. A and B are subsets of these four atoms, not numbers.',
      keyword: 'Four outcomes' },

    { id: 't2', scene: 'two', start: 8, end: 15,
      caption: 'A holds two of the four cells, so its probability is one half. B holds two cells as well.',
      narration: 'A holds two of the four cells, so its probability is one half. B holds two cells as well, so its probability is also one half.',
      detail: 'A is the top row and B is the left column. Each event is a set of atoms, and its probability is the number of atoms it contains divided by four.',
      keyword: 'one half' },

    { id: 't3', scene: 'two', start: 15, end: 23,
      caption: 'They overlap in one cell. One quarter equals one half times one half, so A and B are independent.',
      narration: 'They overlap in exactly one cell, HH. The probability of the overlap is one quarter, and one half times one half is also one quarter, so A and B are independent.',
      detail: 'Independence is not a statement that the events are unrelated in English. It is this arithmetic: the probability of the overlap equals the product of the two probabilities. Nothing else is being asserted.',
      keyword: 'the probability of the overlap equals the product' },

    { id: 't4', scene: 'two', start: 23, end: 30,
      caption: 'The product rule is the definition, not a consequence. It is checked, never assumed from a picture.',
      narration: 'The product rule is the definition of independence, not a consequence of it. It is checked by computing both sides, never assumed because a picture looks symmetric.',
      detail: 'A picture can suggest that two events are independent. It cannot show it. The check is always the same two numbers, computed from the same sample space.',
      keyword: 'definition, not a consequence',
      trap: 'Two events can look unrelated in a diagram and fail the product test, and two events drawn in the same corner can pass it. Compute both sides.' },

    /* ---- 2. how many conditions ----------------------------------------- */
    { id: 'h1', scene: 'three', start: 30, end: 37,
      caption: 'With three events the definition multiplies every subset of size two or more. That is four conditions.',
      narration: 'With three events, the definition multiplies every subset of size two or more: three pairs and the triple. That is four conditions.',
      detail: 'The three pair conditions are the probability of each pair equalling the product of its two members. The fourth condition is the probability of all three together equalling the product of all three.',
      keyword: 'four conditions' },

    { id: 'h2', scene: 'three', start: 37, end: 44,
      caption: 'Pairwise independence means the three pair conditions hold. It says nothing about the triple.',
      narration: 'Pairwise independence means only the three pair conditions hold. It says nothing at all about the probability of all three events happening together.',
      detail: 'This is the whole distinction in one sentence. A family can pass every pair test and still fail the triple test, and a family can pass the triple test and fail every pair test.',
      keyword: 'Pairwise independence means only the three pair conditions' },

    { id: 'h3', scene: 'three', start: 44, end: 52,
      caption: 'For n events the count is two to the n, minus n, minus one. Two events need one check, three need four, six need fifty-seven.',
      narration: 'For n events the number of conditions is two to the n minus n minus one. Two events need one check, three need four, four need eleven, five twenty-six, and six fifty-seven.',
      detail: 'There are two to the n subsets of the family. One is empty and n are singletons, and those impose nothing, so two to the n minus n minus one non-trivial product conditions remain.',
      keyword: 'two to the n minus n minus one' },

    { id: 'h4', scene: 'three', start: 52, end: 60,
      caption: 'Mutual independence is the full list. A question that says only independent means mutual, and it means all of them.',
      narration: 'Mutual independence is the full list of conditions. A question that says the events are independent, with no other word, means mutually independent, which means every condition holds.',
      detail: 'The convention is universal in textbooks and in papers: the unqualified word independence, applied to more than two events, means mutual independence. Pairwise is said only when pairwise is meant.',
      keyword: 'means mutually independent',
      trap: 'A question that lists pairwise independence as an option is testing whether you know it is weaker. Do not accept it as a synonym for independence.' },

    /* ---- 3. Bernstein's four tickets ------------------------------------ */
    { id: 'p1', scene: 'parity', start: 60, end: 68,
      caption: 'Four tickets, each a three-digit label: 112, 121, 211 and 222. One is drawn uniformly.',
      narration: 'Four tickets, each carrying a three-digit label: 112, 121, 211 and 222. One ticket is drawn uniformly at random, so each has probability one quarter.',
      detail: 'This space is Bernstein\'s example from 1928. The labels are strings of two symbols, not numbers: 112 means symbol one, symbol one, symbol two. Reading them as integers would be a mistake.',
      keyword: '112, 121, 211 and 222' },

    { id: 'p2', scene: 'parity', start: 68, end: 76,
      caption: 'A1 is a one in the first place: tickets 112 and 121. A2 is a one in the second place, A3 in the third.',
      narration: 'A1 is the event that the first place holds a one, which is the tickets 112 and 121. A2 is a one in the second place, and A3 is a one in the third place. Each event holds two tickets.',
      detail: 'Each of the three events has probability one half. They are not independent of each other by construction, since the labels were chosen to make the pairs behave.',
      keyword: 'each event holds two tickets' },

    { id: 'p3', scene: 'parity', start: 76, end: 84,
      caption: 'Every pair meets in exactly one ticket. One quarter against one half times one half: all three pairs pass.',
      narration: 'Every pair meets in exactly one ticket: A1 with A2 in 112, A1 with A3 in 121, A2 with A3 in 211. Each overlap has probability one quarter, and one half times one half is one quarter, so all three pairs pass.',
      detail: 'That is pairwise independence, established by three separate computations. Each one is an equality, so each pair is genuinely independent and not merely approximately so.',
      keyword: 'all three pairs pass' },

    { id: 'p4', scene: 'parity', start: 84, end: 90,
      caption: 'All three together would need a one in every place. No ticket has three ones, so the triple intersection is empty.',
      narration: 'All three together would need a one in every place. No ticket has three ones, so the triple intersection is empty and its probability is zero. The product is one eighth.',
      detail: 'Zero against one eighth is the failure. The four conditions of mutual independence are not all satisfied, so the three events are pairwise independent but not mutually independent.',
      keyword: 'zero against one eighth',
      trap: 'The union is three quarters, not the seven eighths the at-least-one formula would give. Pairwise independence is not enough to multiply, and the next scenes show the damage.' },

    { id: 'p5', scene: 'parity', start: 90, end: 94,
      caption: 'The failure is the whole lesson: three passing pair tests say nothing about the three together.',
      narration: 'That is the whole lesson of the scene. Three passing pair tests say nothing about what happens when all three events are asked for at once.',
      detail: 'The three pair conditions constrain the three pair intersections. The triple intersection is a fourth number, and the pair conditions leave it free.',
      keyword: 'say nothing about the three together' },

    /* ---- 4. the reverse failure ----------------------------------------- */
    { id: 'd1', scene: 'dice', start: 94, end: 102,
      caption: 'Two dice, thirty-six equally likely cells. A is a first die of 1, 2 or 3. B is a first die of 3, 4 or 5.',
      narration: 'Two dice, thirty-six equally likely cells. A is a first die showing one, two or three. B is a first die showing three, four or five. Each holds eighteen cells.',
      detail: 'The grid has the first die down the side and the second die across. A is three rows, B is three rows, and they share exactly the row where the first die shows three.',
      keyword: 'eighteen cells' },

    { id: 'd2', scene: 'dice', start: 102, end: 110,
      caption: 'C is the event that the faces sum to nine: four cells. Its probability is one ninth.',
      narration: 'C is the event that the two faces sum to nine, which is four cells: three six, four five, five four and six three. Its probability is four over thirty-six, one ninth.',
      detail: 'Four cells out of thirty-six. The diagonal of constant sum runs the other way from the rows of constant first die, which is what makes the example work.',
      keyword: 'four cells' },

    { id: 'd3', scene: 'dice', start: 110, end: 118,
      caption: 'A with B is six cells, one sixth, not one quarter. A with C is one cell, one thirty-sixth, not one eighteenth.',
      narration: 'A with B is six cells, one sixth, and the product is one quarter. A with C is one cell, one thirty-sixth, and the product is one eighteenth. Both pairs fail.',
      detail: 'B with C is three cells, one twelfth, against a product of one eighteenth. So all three pair conditions fail, and the events are pairwise dependent.',
      keyword: 'Both pairs fail' },

    { id: 'd4', scene: 'dice', start: 118, end: 124,
      caption: 'Yet all three together is one cell, three six, and one thirty-sixth equals one half times one half times one ninth.',
      narration: 'Yet all three together is the single cell three six, and one thirty-sixth equals one half times one half times one ninth. The triple product holds.',
      detail: 'So the fourth condition holds while the first three fail. Checking only the triple product, which is the mistake the first example warns against, gives the wrong answer in the other direction.',
      keyword: 'The triple product holds',
      trap: 'A family that satisfies the triple product can fail every pair test. The condition set is not a hierarchy; each subset of size two or more has to be checked.' },

    { id: 'd5', scene: 'dice', start: 124, end: 128,
      caption: 'Two spaces, two failures. The conditions are independent tests, and both directions of the mistake are real.',
      narration: 'Two spaces and two failures, in opposite directions. The conditions are separate tests, and a shortcut that checks one of them instead of all of them is wrong both ways.',
      detail: 'Bernstein\'s space passes the pairs and fails the triple. The dice space passes the triple and fails the pairs. Neither is independent.',
      keyword: 'both directions' },

    /* ---- 5. any two determine the third --------------------------------- */
    { id: 'b1', scene: 'bits', start: 128, end: 136,
      caption: 'Two fair bits, X and Y, and a third bit Z defined as one when X and Y differ.',
      narration: 'Two fair bits, X and Y, and a third bit Z defined to be one exactly when X and Y differ. That is Z equals X exclusive-or Y.',
      detail: 'The sample space is four equally likely pairs, and Z is a function of the pair. There is no extra randomness: Z is determined, not tossed.',
      keyword: 'Z equals X exclusive-or Y' },

    { id: 'b2', scene: 'bits', start: 136, end: 144,
      caption: 'Four rows: 000, 011, 101, 110. Each of the three bits is one in exactly two rows.',
      narration: 'Four rows: zero zero zero, zero one one, one zero one, one one zero. Each of the three bits is one in exactly two of the rows, so each has probability one half.',
      detail: 'Look at the rows as binary numbers: 0, 3, 5 and 6. The pattern is that the number of ones in each row is even, which is why the three columns behave identically.',
      keyword: 'Four rows' },

    { id: 'b3', scene: 'bits', start: 144, end: 150,
      caption: 'Every pair shares two rows out of four. One quarter equals one half times one half, so all three pairs pass again.',
      narration: 'Every pair shares two rows out of four, so every pair intersection has probability one quarter, which is one half times one half. All three pairs pass.',
      detail: 'The three pair conditions hold for exactly the same reason as in the ticket example: each column is a fair bit, and any two columns are jointly uniform on their four combinations.',
      keyword: 'all three pairs pass again' },

    { id: 'b4', scene: 'bits', start: 150, end: 156,
      caption: 'But all three together is never 111, so the triple is zero against one eighth. Any two bits determine the third.',
      narration: 'But all three bits together are never one one one, so the triple has probability zero against one eighth. Knowing any two bits tells you the third exactly.',
      detail: 'This is as far from independent as three bits can be, while every pair remains independent. It is the standard counterexample, and it is also how a parity check works.',
      keyword: 'knowing any two bits tells you the third',
      trap: 'Pairwise independence is often described as no information between pairs. Here every pair carries no information and the triple carries total information.' },

    /* ---- 6. why mutual is the one you multiply with --------------------- */
    { id: 'u1', scene: 'atleast', start: 156, end: 164,
      caption: 'The at-least-one formula multiplies the complements: one minus the product of one minus each probability.',
      narration: 'The at-least-one formula multiplies the complements: one minus the product of one minus each probability. It is the workhorse of every at-least-one question.',
      detail: 'The formula is derived by taking complements and using the product rule on the complements. It therefore inherits the product rule\'s requirement, which is mutual independence.',
      keyword: 'multiplies the complements' },

    { id: 'u2', scene: 'atleast', start: 164, end: 172,
      caption: 'On the four tickets the formula gives seven eighths. The truth is three quarters, because 222 is the only ticket outside the union.',
      narration: 'On the four tickets the formula gives seven eighths. The truth is three quarters, because only the ticket 222 lies outside the union. The formula is too big.',
      detail: 'The union of the three events contains 112, 121 and 211, which is three of the four tickets. One minus one half cubed is seven eighths, and three quarters is not seven eighths.',
      keyword: 'too big' },

    { id: 'u3', scene: 'atleast', start: 172, end: 180,
      caption: 'On the dice the formula gives twenty-eight thirty-sixths. The truth is thirty-one thirty-sixths, so here it is too small.',
      narration: 'On the dice the formula gives twenty-eight thirty-sixths. The truth is thirty-one thirty-sixths, because the cell six three lies in C and outside A and B. Here the formula is too small.',
      detail: 'So the pairwise version of the formula can err in either direction. It is not a bound and not an approximation: it is simply the wrong computation for these spaces.',
      keyword: 'too small' },

    { id: 'u4', scene: 'atleast', start: 180, end: 188,
      caption: 'With mutual independence the formula is exact, and that is the practical reason the distinction matters.',
      narration: 'With mutual independence the formula is exact. That is the practical reason the distinction matters: the product rule on the complements is what makes at-least-one questions one line instead of a case analysis.',
      detail: 'The check is not decorative. On a space where only pairwise independence holds, the one-line answer is wrong by a computable amount, and the wrongness has no fixed sign.',
      keyword: 'the formula is exact',
      trap: 'Never write one minus the product of the complements unless the events are mutually independent. Pairwise independence does not license it, as both examples show.' },

    /* ---- 7. conditional independence ------------------------------------ */
    { id: 'c1', scene: 'cond', start: 188, end: 196,
      caption: 'Now condition on Z. Keep only the rows where Z is one: 011 and 101.',
      narration: 'Now condition on Z. Keep only the rows where Z is one, which are zero one one and one zero one. Two rows remain, each still equally likely inside the new world.',
      detail: 'Conditioning shrinks the sample space and renormalises. Every probability from here on is computed inside the two remaining rows, not inside the original four.',
      keyword: 'Keep only the rows where Z is one' },

    { id: 'c2', scene: 'cond', start: 196, end: 204,
      caption: 'Inside those rows X is one half and Y is one half. But X and Y together never happens.',
      narration: 'Inside those two rows, X is one in one of them, so one half. Y is one half as well. But X and Y together never happen, because the two remaining rows disagree on exactly one bit.',
      detail: 'The joint probability given Z is zero, while the product of the two conditional probabilities is one quarter. Zero is not one quarter, so X and Y are dependent given Z.',
      keyword: 'never happens' },

    { id: 'c3', scene: 'cond', start: 204, end: 210,
      caption: 'So X and Y are independent, and dependent once Z is known. Conditional independence is a separate statement.',
      narration: 'So X and Y are independent in the original space, and dependent once Z is known. Conditional independence is a separate statement about a smaller space, and neither one implies the other.',
      detail: 'Independence given Z means the product rule holds inside the conditioned space. It is a statement about a different probability measure, so it cannot be read off the unconditional one.',
      keyword: 'a separate statement',
      trap: 'Independence and conditional independence are not linked by implication in either direction. A conditioning event can create dependence, as here, and it can remove it.' },

    { id: 'c4', scene: 'cond', start: 210, end: 216,
      caption: 'This is the shape of explaining-away arguments, and of every question that says given.',
      narration: 'This is the shape of explaining-away arguments, and of every question that says given. The word given changes the space, so it changes the answer.',
      detail: 'When two independent causes can each explain an observation, learning the observation makes the causes dependent. The arithmetic here is the smallest instance of that.',
      keyword: 'the word given changes the space' },

    /* ---- 8. the three boundaries ---------------------------------------- */
    { id: 'x1', scene: 'disjoint', start: 216, end: 224,
      caption: 'Disjoint is not independent. Two events that cannot both happen are dependent, unless one has probability zero.',
      narration: 'Disjoint is not independent. Two events that cannot both happen are dependent, because the probability of the overlap is zero while the product of their probabilities is positive.',
      detail: 'On the four-point space there are fifty ordered pairs of disjoint events with both members non-empty, and every one of them fails the product test. The computation is exhaustive, not illustrative.',
      keyword: 'Disjoint is not independent' },

    { id: 'x2', scene: 'disjoint', start: 224, end: 231,
      caption: 'An impossible event and a certain event are independent of everything, including themselves.',
      narration: 'An impossible event and a certain event are independent of everything, including themselves. Zero times anything is zero, and one times anything is the other probability.',
      detail: 'On the four-point space, exactly two of the sixteen events are independent of every other event: the empty event and the whole space. Nothing else qualifies.',
      keyword: 'independent of everything' },

    { id: 'x3', scene: 'disjoint', start: 231, end: 238,
      caption: 'Taking the complement preserves independence: P of A with not B is P of A minus P of A with B.',
      narration: 'Taking the complement preserves independence. The probability of A with not B is the probability of A minus the probability of A with B, which factors into the probability of A times one minus the probability of B.',
      detail: 'That derivation is the whole proof, and it is why a question can replace any event by its complement without changing an independence verdict. It holds for every event in a mutually independent family.',
      keyword: 'preserves independence' },

    { id: 'x4', scene: 'disjoint', start: 238, end: 244,
      caption: 'So complements are free, disjointness is not, and zero or one is a boundary rather than a rule.',
      narration: 'So complements are free, disjointness is not, and probability zero or one is a boundary case rather than a rule. Each of the three has its own arithmetic.',
      detail: 'Keeping the three apart is most of the accuracy in this topic. They are the three things a question is most likely to build a distractor from.',
      keyword: 'complements are free' },

    /* ---- 9. exact counts ------------------------------------------------- */
    { id: 'k1', scene: 'count', start: 244, end: 252,
      caption: 'A four-point space has sixteen events. Two of them are independent of every other event.',
      narration: 'A four-point space has sixteen events, because each of the four atoms is either in or out. Exactly two of those sixteen are independent of every other event: the empty event and the whole space.',
      detail: 'Sixteen is two to the fourth. The count of events independent of everything is a property of the space, and on a uniform four-point space the answer is exactly the two trivial ones.',
      keyword: 'sixteen events' },

    { id: 'k2', scene: 'count', start: 252, end: 260,
      caption: 'Eighty-four of the two hundred and fifty-six ordered pairs of events are independent pairs.',
      narration: 'Eighty-four of the two hundred and fifty-six ordered pairs of events are independent pairs. The page tests all of them and counts the ones where the product rule holds.',
      detail: 'The count includes pairs where one member is empty or the whole space, which is why it is larger than a naive estimate. Counting unordered pairs instead gives forty-three.',
      keyword: 'Eighty-four' },

    { id: 'k3', scene: 'count', start: 260, end: 268,
      caption: 'Six two-element events give twenty triples. Eight of them are pairwise independent and not mutually independent.',
      narration: 'There are six two-element events, and they form twenty triples. Eight of those twenty triples are pairwise independent and not mutually independent.',
      detail: 'Each of the eight is a copy of Bernstein\'s shape: three pairs meeting in single points, with no point in all three. The count is computed by enumerating every triple, not by a formula.',
      keyword: 'Eight of those twenty' },

    { id: 'k4', scene: 'count', start: 268, end: 276,
      caption: 'On a small space every one of these can be counted by hand. That is the safest way to answer a counting question about independence.',
      narration: 'On a small space every one of these numbers can be counted by hand. That is the safest way to answer a counting question about independence: list the atoms, list the events, and test the products.',
      detail: 'The same enumeration answers how many pairs are disjoint, how many are independent, and how many triples are pairwise but not mutual. The method is uniform.',
      keyword: 'counted by hand' },

    /* ---- 10. the verified previous-year item ---------------------------- */
    { id: 'q1', scene: 'pyq2023', start: 276, end: 284,
      caption: 'GATE CSE 2023: two coins. A is a head on both throws, B a head on the first, C a head on the second.',
      narration: 'GATE CSE 2023. Two fair coins are tossed. A is the event of a head on both throws, B is a head on the first throw, and C is a head on the second throw. Four statements are offered.',
      detail: 'The four options are: A and B independent; A and C independent; B and C independent; and the conditional probability of B given C equal to the probability of B. It is a multiple-select item.',
      keyword: 'two fair coins are tossed' },

    { id: 'q2', scene: 'pyq2023', start: 284, end: 292,
      caption: 'A is one cell, B and C are two each. A with B is one quarter against one eighth, so A with B fails.',
      narration: 'A is one cell, the pair of heads. B and C hold two cells each. A with B is the same single cell, one quarter, against a product of one eighth, so A with B fails. A with C fails the same way.',
      detail: 'The reason is that A is contained in both B and C. An event of positive probability contained in another cannot be independent of it, because the overlap equals the smaller event rather than the product.',
      keyword: 'fails the same way' },

    { id: 'q3', scene: 'pyq2023', start: 292, end: 299,
      caption: 'B with C is the same single cell, one quarter, and one half times one half is one quarter. That pair passes.',
      narration: 'B with C is the pair of heads, one quarter, and one half times one half is one quarter. That pair passes, so B and C are independent and the fourth option follows.',
      detail: 'The conditional probability of B given C is one quarter over one half, which is one half, the same as the probability of B. So the conditional statement is true exactly when the independence statement is.',
      keyword: 'That pair passes' },

    { id: 'q4', scene: 'pyq2023', start: 299, end: 306,
      caption: 'The true statements are B and C independent, and the conditional equality. Both are the same arithmetic.',
      narration: 'The true statements are that B and C are independent, and that the conditional probability of B given C equals the probability of B. Both are the same arithmetic, written two ways.',
      detail: 'This is the pattern to expect: three events, four statements, and each statement is one product computed on a four-cell space. The pair that is independent is the pair whose events are not nested.',
      keyword: 'the same arithmetic' },

    /* ---- 11. where the multiplication is doing the work ----------------- */
    { id: 'z1', scene: 'transfer', start: 306, end: 315,
      caption: 'Three places use it: reliability of components, at-least-one over repeated trials, and the binomial count.',
      narration: 'Three places use the multiplication. Reliability multiplies the survival probabilities of components. At-least-one multiplies the complements over repeated trials. The binomial count multiplies a power of p by a power of one minus p.',
      detail: 'Each of the three is a product rule over more than two events, so each is licensed only by mutual independence. In a system-reliability question the components are usually declared independent, and that declaration is what makes the arithmetic legal.',
      keyword: 'Three places' },

    { id: 'z2', scene: 'transfer', start: 315, end: 323,
      caption: 'The four-step check: how many events, every subset of size two or more, both sides of each product, and no inference from a picture.',
      narration: 'The four-step check. Count how many events the family has. List every subset of size two or more. Compute both sides of each product. And never infer independence from a picture.',
      detail: 'For three events that is four products. For four events it is eleven. The list grows as two to the n minus n minus one, which is why questions stay at three.',
      keyword: 'The four-step check' },

    { id: 'z3', scene: 'transfer', start: 323, end: 330,
      caption: 'Independent means the whole list. Pairwise means three of the four, and a question will offer it as a distractor.',
      narration: 'Independent, with no other word, means the whole list. Pairwise means only the pairs, and a question will offer it as a distractor precisely because it sounds like the same thing.',
      detail: 'The distinction costs marks in one direction only: a family that is pairwise but not mutual is the case questions are built from. The reverse failure exists, but it is rarer in practice items.',
      keyword: 'Independent means the whole list' }
  ]
};
