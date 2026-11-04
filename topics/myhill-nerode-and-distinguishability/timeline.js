/* ==========================================================================
   myhill-nerode-and-distinguishability — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs — never edited by hand.

   Every number quoted in a caption is computed by the model in lesson.js from
   the language itself and printed on the canvas; the two agree because both
   read the same computation.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'futures',
      n: 1,
      title: 'Two strings belong to one state when no future tells them apart',
      start: 0, end: 30,
      objective: 'Define the relation "x is equivalent to y" as agreement on every possible ending, and name the four properties that make the classes usable as states.'
    },
    {
      id: 'signatures',
      n: 2,
      title: 'The signature of a string: the endings that complete it',
      start: 30, end: 60,
      objective: 'Read a string\u2019s signature as the set of endings that carry it into the language, and see that two strings are equivalent exactly when the signatures match.'
    },
    {
      id: 'fourclasses',
      n: 3,
      title: 'Even a\u2019s and even b\u2019s: exactly four classes, and they are the four states',
      start: 60, end: 90,
      objective: 'Compute the classes of one small language, check that each class is wholly inside or wholly outside the language, and match the classes to the states of the machine that recognises it.'
    },
    {
      id: 'quotient',
      n: 4,
      title: 'Finite index builds a machine, and a machine gives finite index',
      start: 90, end: 120,
      objective: 'Both directions of the theorem: the classes become states of a machine, and the states of any machine divide the strings into finitely many classes.'
    },
    {
      id: 'unique',
      n: 5,
      title: 'So the smallest machine is unique, and its size is the index',
      start: 120, end: 150,
      objective: 'See why no machine can have fewer states than the index, why the machine built from the classes has exactly that many, and what "unique" does and does not mean.'
    },
    {
      id: 'count',
      n: 6,
      title: 'Counting states without drawing the machine',
      start: 150, end: 180,
      objective: 'Answer a state-count question by naming the invariant each class records: two remainders give six classes, and a divisibility language gives n + 1 rather than n.'
    },
    {
      id: 'anbn',
      n: 7,
      title: 'a\u207f b\u207f: the classes never merge',
      start: 180, end: 210,
      objective: 'Prove a language is not regular by exhibiting infinitely many pairwise distinguishable strings, which is a positive proof rather than a failed attempt at one.'
    },
    {
      id: 'converse',
      n: 8,
      title: 'The pumping lemma\u2019s converse fails, and this theorem shows why',
      start: 210, end: 240,
      objective: 'Meet a language that satisfies the pumping lemma and is still not regular, and separate the two tests: one is necessary, the other is exact.'
    },
    {
      id: 'confused',
      n: 9,
      title: 'Three things that look alike, and are not',
      start: 240, end: 270,
      objective: 'Tell distinguishability from table-filling state equivalence from "the two states have the same outgoing letters", and say which of the three is the definition.'
    },
    {
      id: 'payoff',
      n: 10,
      title: 'What this theorem decides, and what it does not',
      start: 270, end: 300,
      objective: 'State the exact question the theorem answers, the two it does not, and the reason the index can be far larger than any machine you would want to draw.'
    }
  ],

  events: [
    /* ---------- scene 1: futures ---------- */
    {
      id: 'e1a', scene: 'futures', start: 0, end: 7.5,
      caption: 'A state is what the machine remembers. After a it remembers one odd a; after aa it remembers none.',
      detail: 'For the language of strings with an even number of a\u2019s and an even number of b\u2019s, the string a leaves one a uncancelled and the string aa cancels both. A deterministic machine can only act on what it remembers, so this difference has to survive in the state.',
      narration: 'A state is what the machine remembers. After a it remembers one odd a. After a a it remembers none.',
      keyword: 'what the machine remembers',
      trap: 'A state is not the string read so far. Many strings reach one state, and the machine cannot tell them apart afterwards.'
    },
    {
      id: 'e1b', scene: 'futures', start: 7.5, end: 15,
      caption: 'So ask the question the machine cannot ask: does any ending z treat these two strings differently?',
      detail: 'Here z is a any string over the same alphabet, including the empty string. Appending z to x and to y and testing membership is the only experiment available, and it is the one the definition uses.',
      narration: 'So ask the question the machine cannot ask. Is there any ending that treats these two strings differently?',
      keyword: 'does any ending treat them differently',
      trap: 'The ending may be empty. A string in the language and a string outside it are separated by the empty ending, before any letter is read.'
    },
    {
      id: 'e1c', scene: 'futures', start: 15, end: 22.5,
      caption: 'x is equivalent to y when, for every ending z, xz is in L exactly when yz is in L.',
      detail: 'This is the Myhill\u2013Nerode relation for the language L. It is defined by a universal statement over all endings, which is why it is a statement about the language and not about any particular machine.',
      narration: 'X is equivalent to y when, for every ending z, x z is in the language exactly when y z is in the language.',
      keyword: 'for every ending z',
      trap: 'One ending that disagrees is enough to separate two strings. Agreement on many endings proves nothing unless the argument covers all of them.'
    },
    {
      id: 'e1d', scene: 'futures', start: 22.5, end: 30,
      caption: 'It is an equivalence relation, and it is right-invariant: x \u2248 y implies xa \u2248 ya. That second property is what makes classes into states.',
      detail: 'Reflexive, symmetric and transitive come straight from the definition, because equality of truth values is. Right-invariance says that appending the same letter to two equivalent strings keeps them equivalent, which is exactly what a transition function needs: the target depends on the class, not on the string.',
      narration: 'It is an equivalence relation, and it is right-invariant: if x is equivalent to y then x a is equivalent to y a. That second property is what makes classes into states.',
      keyword: 'right-invariant',
      trap: 'An arbitrary partition of the strings is not a set of states. Without right-invariance there is no transition function to define.'
    },

    /* ---------- scene 2: signatures ---------- */
    {
      id: 'e2a', scene: 'signatures', start: 30, end: 37.5,
      caption: 'The signature of x is the set of endings z with xz in L. Two strings are equivalent exactly when their signatures are equal.',
      detail: 'The signature is the definition written as a set instead of as a universal statement. It is a set of strings, so it can be computed by enumeration for a bounded ending length, which is what the table on this page does.',
      narration: 'The signature of x is the set of endings z with x z in the language. Two strings are equivalent exactly when their signatures are equal.',
      keyword: 'the signature of x',
      trap: 'The signature is not the set of prefixes. It records what can still happen, not what has already happened.'
    },
    {
      id: 'e2b', scene: 'signatures', start: 37.5, end: 45,
      caption: 'Endings of length at most two: a accepts only a, and b accepts only b. The two signatures already differ.',
      detail: 'For x = a, the endings z with az in L and length at most two are just a: aa has two a\u2019s and no b\u2019s, so it is in L. For x = b, only b works. So a single ending of length one separates a from b.',
      narration: 'Over endings of length at most two, a accepts only a, and b accepts only b. The two signatures already differ.',
      keyword: 'already differ'
    },
    {
      id: 'e2c', scene: 'signatures', start: 45, end: 52.5,
      caption: 'The empty string accepts the empty ending, aa and bb. The string ab accepts ab and ba. Four signatures, four classes.',
      detail: 'The empty ending is in the signature of the empty string because the empty string is in L. The string ab needs an odd number of a\u2019s and an odd number of b\u2019s to be completed, and ab and ba are the two shortest ways.',
      narration: 'The empty string accepts the empty ending, a a and b b. The string a b accepts a b and b a. Four signatures, four classes.',
      keyword: 'four signatures'
    },
    {
      id: 'e2d', scene: 'signatures', start: 52.5, end: 60,
      caption: 'A machine with n states is settled by endings shorter than n, so a bound of two already decides this four-state language.',
      detail: 'If two states of an n-state machine disagreed on some ending, they would disagree on one of length less than n, because a shortest disagreeing ending cannot repeat a state. That is the bound that makes the finite table a proof rather than a sample.',
      narration: 'A machine with n states is settled by endings shorter than n, so a bound of two already decides this four-state language.',
      keyword: 'endings shorter than n',
      trap: 'Enumerating endings up to some length proves equality of signatures only up to that length, unless the bound is justified by the state count.'
    },

    /* ---------- scene 3: four classes ---------- */
    {
      id: 'e3a', scene: 'fourclasses', start: 60, end: 67.5,
      caption: 'Four classes for even a\u2019s and even b\u2019s: the empty string, a, b, and ab. Every other string joins one of them.',
      detail: 'The class of the empty string contains aa, bb, aabb and so on: every string whose two parities are both even. The class of a contains aaa, abb, bab and bba. The class of b contains bbb, aab, aba and baa. The class of ab contains ba, aabb, abab and the rest with both parities odd.',
      narration: 'Four classes: the empty string, a, b, and a b. Every other string joins one of them.',
      keyword: 'four classes'
    },
    {
      id: 'e3b', scene: 'fourclasses', start: 67.5, end: 75,
      caption: 'Each class is wholly inside or wholly outside L, never both. The empty string\u2019s class is inside; the class of a is outside.',
      detail: 'This is a consequence of the definition, not a coincidence: the empty ending is one of the endings, so two equivalent strings must agree on membership with no ending appended. A class that mixed members in and out of L would be a contradiction.',
      narration: 'Each class is wholly inside or wholly outside the language, never both. The empty string\u2019s class is inside; the class of a is outside.',
      keyword: 'wholly inside or wholly outside',
      trap: 'Grouping strings by "both in L" or "both outside L" gives a partition too, but it is not this one, and it is not right-invariant.'
    },
    {
      id: 'e3c', scene: 'fourclasses', start: 75, end: 82.5,
      caption: 'Name the classes by what they remember: even-even, odd-even, even-odd, odd-odd. The names are the four states.',
      detail: 'The first letter of the name records the parity of the number of a\u2019s read, the second the parity of the number of b\u2019s. Every string in a class has the same pair of parities, and the four pairs are the four classes.',
      narration: 'Name the classes by what they remember: even even, odd even, even odd, odd odd. The names are the four states.',
      keyword: 'the names are the four states'
    },
    {
      id: 'e3d', scene: 'fourclasses', start: 82.5, end: 90,
      caption: 'The index of a language is its number of classes. Here the index is four, and the four-state machine has four states.',
      detail: 'The model computes the classes by comparing signatures over all strings up to length three, and separately checks that each class is well defined. The count it reports is four, which is the number of states of the machine a reader would draw by hand.',
      narration: 'The index of a language is its number of classes. Here the index is four, and the four state machine has four states.',
      keyword: 'the index is four',
      trap: 'The index is a property of the language. Two different machines for one language can have different sizes; the index is the smallest possible size.'
    },

    /* ---------- scene 4: quotient ---------- */
    {
      id: 'e4a', scene: 'quotient', start: 90, end: 97.5,
      caption: 'If the index is finite, the classes are the states of a machine. The start class is the class of the empty string.',
      detail: 'Write a class as a square bracket around any of its members. The start state is the class of the empty string, because nothing has been read yet. This is the only sensible choice, and the definition of the language decides it.',
      narration: 'If the index is finite, the classes are the states of a machine. The start class is the class of the empty string.',
      keyword: 'the class of the empty string'
    },
    {
      id: 'e4b', scene: 'quotient', start: 97.5, end: 105,
      caption: 'The transition is the only one available: reading a in the class of x lands in the class of xa. Right-invariance makes it well defined.',
      detail: 'If x and y are in the same class then xa and ya are in the same class, by right-invariance. So the target does not depend on which member of the class was read, which is exactly what a deterministic transition requires.',
      narration: 'The transition is the only one available: reading a in the class of x lands in the class of x a. Right invariance makes it well defined.',
      keyword: 'lands in the class of xa',
      trap: 'Without right-invariance this transition would be ambiguous, and the construction would fail. That is the one property that is not automatic.'
    },
    {
      id: 'e4c', scene: 'quotient', start: 105, end: 112.5,
      caption: 'A class is accepting when its members are in L. The four classes give four states, and the model checks the machine on every string up to length seven.',
      detail: 'Because a class is wholly inside or wholly outside L, "its members are in L" is a well-defined test on the class. The model builds this machine, runs it on all strings up to length seven and compares the verdict with the language: they agree on every one.',
      narration: 'A class is accepting when its members are in the language. The four classes give four states, and the model checks the machine on every string up to length seven.',
      keyword: 'the model checks it'
    },
    {
      id: 'e4d', scene: 'quotient', start: 112.5, end: 120,
      caption: 'The other direction: any machine with n states gives at most n classes, because each state has one right language.',
      detail: 'Take any deterministic machine for L. Two strings that reach the same state are equivalent, because every ending leads both of them to the same state. So the classes of the relation are unions of "reach this state" sets, and there are at most n of them.',
      narration: 'The other direction: any machine with n states gives at most n classes, because each state has one right language. Two strings reaching the same state are equivalent.',
      keyword: 'at most n classes',
      trap: 'Two strings reaching different states may still be equivalent, which is why a machine can be larger than the index but never smaller.'
    },

    /* ---------- scene 5: unique ---------- */
    {
      id: 'e5a', scene: 'unique', start: 120, end: 127.5,
      caption: 'Every machine for L needs at least as many states as the index. That is the lower bound, and it is exact.',
      detail: 'Suppose a machine had fewer states than the index. Two distinguishable strings would have to reach the same state, and then every ending would treat them alike, contradicting that they are distinguishable. So no smaller machine exists.',
      narration: 'Every machine for the language needs at least as many states as the index. That is the lower bound, and it is exact.',
      keyword: 'at least as many states',
      trap: 'The bound is on deterministic machines. A non-deterministic machine can be smaller than the index, and often is.'
    },
    {
      id: 'e5b', scene: 'unique', start: 127.5, end: 135,
      caption: 'The machine built from the classes has exactly that many, so the smallest machine is the quotient, up to renaming states.',
      detail: 'The quotient has one state per class, so it has exactly index(L) states, and it accepts L. Together with the lower bound that makes it minimal. Any other minimal machine is this one with its states relabelled, because its states must also be one per class.',
      narration: 'The machine built from the classes has exactly that many, so the smallest machine is the quotient, up to renaming states.',
      keyword: 'up to renaming states',
      trap: '"Unique" does not mean the drawing is unique. The same machine can be drawn with the states in any positions and with any names.'
    },
    {
      id: 'e5c', scene: 'unique', start: 135, end: 142.5,
      caption: 'Three languages, three indexes: four for the parity language, three for binary value divisible by three, three for ending in 01.',
      detail: 'The model computes each index by comparing signatures over strings up to length four, and separately builds the quotient machine for each and checks it on every string up to length seven. The counts are four, three and three.',
      narration: 'Three languages, three indexes: four for the parity language, three for binary value divisible by three, and three for ending in zero one.',
      keyword: 'four, three, three'
    },
    {
      id: 'e5d', scene: 'unique', start: 142.5, end: 150,
      caption: 'So a question that asks for the minimum number of states is asking for an index, and the answer is an exact count rather than a drawing.',
      detail: 'This is why the theorem is worth learning for an exam: the count is justified by the classes, and the justification is also the proof that no smaller machine exists. A drawing alone shows that a machine exists, not that it is smallest.',
      narration: 'So a question that asks for the minimum number of states is asking for an index, and the answer is an exact count rather than a drawing.',
      keyword: 'an exact count',
      trap: 'Drawing a machine that works and counting its states answers a different question. Without the classes, nothing rules out a smaller machine.'
    },

    /* ---------- scene 6: count ---------- */
    {
      id: 'e6a', scene: 'count', start: 150, end: 157.5,
      caption: 'GATE CSE 1997 Q20: the number of a\u2019s divisible by two and the number of b\u2019s divisible by three.',
      detail: 'The paper asks for a machine with the minimum number of states accepting all strings over a and b in which the number of a\u2019s is divisible by two and the number of b\u2019s is divisible by three. The wording is as recorded on GATE Overflow; the answer here is derived, not quoted.',
      narration: 'GATE C S E 1997 question twenty asks for the minimum number of states for strings where the number of a\u2019s is divisible by two and the number of b\u2019s is divisible by three.',
      keyword: 'divisible by two and by three'
    },
    {
      id: 'e6b', scene: 'count', start: 157.5, end: 165,
      caption: 'Each class records one remainder for a and one for b: two times three is six classes, so six states.',
      detail: 'Two strings are equivalent exactly when they agree on both remainders, because the two conditions are independent. The number of pairs of remainders is two times three, and every pair is reachable, so the index is six. The model confirms six by computing the classes.',
      narration: 'Each class records one remainder for a and one for b: two times three is six classes, so six states.',
      keyword: 'two times three is six',
      trap: 'Multiplying is right only because the two conditions are independent. Two conditions that interact do not multiply.'
    },
    {
      id: 'e6c', scene: 'count', start: 165, end: 172.5,
      caption: 'GATE CSE 2011 Q42: a to the n k with k greater than zero. For n equal to three the index is four, not three.',
      detail: 'The language is the set of strings whose length is a positive multiple of n. The classes are the lengths modulo n, plus one more for the strings that have already passed a positive multiple: lengths nought and n are not equivalent, because the empty ending separates them. The model reports four classes for n equal to three.',
      narration: 'GATE C S E 2011 question forty two: a to the n k with k greater than zero. For n equal to three the index is four, not three.',
      keyword: 'four, not three',
      trap: 'The condition k greater than zero removes the empty string, and that costs one extra state. Reading it as k at least zero gives n instead of n plus one.'
    },
    {
      id: 'e6d', scene: 'count', start: 172.5, end: 180,
      caption: 'The procedure: name the invariant a class remembers, count the values it can take, and check that every value is reachable.',
      detail: 'The invariant is a summary that two strings share exactly when they are equivalent. Counting its possible values gives the index from above; showing each value reachable gives it from below. Both halves are needed for a minimum.',
      narration: 'The procedure: name the invariant a class remembers, count the values it can take, and check that every value is reachable.',
      keyword: 'name the invariant',
      trap: 'A count without a reachability argument gives an upper bound. A machine with that many states is not automatically the smallest.'
    },

    /* ---------- scene 7: a^n b^n ---------- */
    {
      id: 'e7a', scene: 'anbn', start: 180, end: 187.5,
      caption: 'For a to the n b to the n, the strings a, aa, aaa are pairwise distinguishable: b to the i separates a to the i from every longer run.',
      detail: 'Append b to the i to a to the i and the result is a to the i b to the i, which is in the language. Append the same ending to a to the j for any j greater than i and the result has more a\u2019s than b\u2019s, so it is outside. One ending, chosen per pair, separates them.',
      narration: 'For a to the n b to the n, the strings a, a a, a a a are pairwise distinguishable: b to the i separates a to the i from every longer run.',
      keyword: 'pairwise distinguishable',
      trap: 'The separating ending depends on the pair. There is no single ending that separates all of them, and none is needed.'
    },
    {
      id: 'e7b', scene: 'anbn', start: 187.5, end: 195,
      caption: 'So every a to the i is in a class of its own, and there are infinitely many of them. The index is infinite.',
      detail: 'A class of its own means no two of these strings are equivalent, so the classes are at least as numerous as the natural numbers. An infinite index means no finite machine exists, because a machine with n states has at most n classes.',
      narration: 'So every a to the i is in a class of its own, and there are infinitely many of them. The index is infinite.',
      keyword: 'the index is infinite'
    },
    {
      id: 'e7c', scene: 'anbn', start: 195, end: 202.5,
      caption: 'The model counts the classes among a to the nought up to a to the M as M grows: the count keeps rising.',
      detail: 'For endings of length up to one, two and three, the counts are two, three and three. For longer bounds the count keeps climbing: four, four, five, five, six. A count that never settles is what an infinite index looks like from a finite experiment.',
      narration: 'The model counts the classes among a to the nought up to a to the M as M grows, and the count keeps rising.',
      keyword: 'the count keeps rising',
      trap: 'A rising count is evidence, not proof. The proof is the separation witness, one ending per pair, which covers every pair at once.'
    },
    {
      id: 'e7d', scene: 'anbn', start: 202.5, end: 210,
      caption: 'This is a positive proof of non-regularity: exhibit the classes, and the impossibility of a finite machine follows.',
      detail: 'The pumping lemma can only refute regularity by showing that every candidate pumping length fails. Distinguishability refutes it by producing an object, an infinite set of pairwise distinguishable strings, from which the impossibility follows directly.',
      narration: 'This is a positive proof of non regularity: exhibit the classes, and the impossibility of a finite machine follows.',
      keyword: 'a positive proof',
      trap: 'Saying "I could not find a machine" is not a proof. The classes are the proof.'
    },

    /* ---------- scene 8: converse ---------- */
    {
      id: 'e8a', scene: 'converse', start: 210, end: 217.5,
      caption: 'A language that satisfies the pumping lemma: a to the i b to the j c to the k, with j equal to k whenever i is one.',
      detail: 'Every string in this language has all its a\u2019s first, then all its b\u2019s, then all its c\u2019s. The condition binds the b\u2019s to the c\u2019s only in the single case where there is exactly one a. With nought a\u2019s or two or more, any counts of b and c are allowed.',
      narration: 'Here is a language that satisfies the pumping lemma: a to the i, b to the j, c to the k, with j equal to k whenever i is one.',
      keyword: 'satisfies the pumping lemma'
    },
    {
      id: 'e8b', scene: 'converse', start: 217.5, end: 225,
      caption: 'With pumping length two, every string up to length nine can be pumped: the model finds no counterexample at all.',
      detail: 'The model enumerates every string over a, b, c up to length nine, keeps the ones in the language, and tests the pumping condition for every legal split. At length two it finds no failure; at length one it finds many, so the language does satisfy the lemma, with two as its pumping length.',
      narration: 'With pumping length two, every string up to length nine can be pumped: the model finds no counterexample at all.',
      keyword: 'no counterexample at all',
      trap: 'The pumping length is not given to you in an exam question. You have to exhibit one, and a wrong choice looks like a failed proof.'
    },
    {
      id: 'e8c', scene: 'converse', start: 225, end: 232.5,
      caption: 'And it is still not regular: its intersection with a b-star c-star is exactly a b to the j c to the j, which has infinite index.',
      detail: 'Intersecting a regular language with a regular language must give a regular language. The intersection here is the set of strings a followed by some b\u2019s then some c\u2019s with equal counts, and the strings a b to the i are pairwise distinguishable inside it by the ending c to the i, exactly as in the previous scene.',
      narration: 'And it is still not regular: its intersection with a b star c star is exactly a b to the j c to the j, which has infinite index.',
      keyword: 'still not regular',
      trap: 'Intersection is the useful operation here because the regular language is what pins the shape. Closure under intersection is a verified property of regular languages, not an assumption.'
    },
    {
      id: 'e8d', scene: 'converse', start: 232.5, end: 240,
      caption: 'So the pumping lemma is necessary and not sufficient. Distinguishability is both, and that is the difference between the two tests.',
      detail: 'If a language is regular, every long enough string pumps, so the lemma holds. The example shows the converse fails. The index is finite exactly when the language is regular, so it can be used in both directions.',
      narration: 'So the pumping lemma is necessary and not sufficient. Distinguishability is both, and that is the difference between the two tests.',
      keyword: 'necessary and not sufficient',
      trap: 'A language that satisfies the pumping lemma is not thereby regular. Writing that conclusion is the error this scene exists to prevent.'
    },

    /* ---------- scene 9: confused ---------- */
    {
      id: 'e9a', scene: 'confused', start: 240, end: 247.5,
      caption: 'Distinguishability is defined on strings and needs no machine. State equivalence is defined on the states of one machine.',
      detail: 'The first relation asks whether some ending separates two strings, over all endings. The second asks whether two states of a given machine accept the same set of endings. They are different objects, and the second is computable by table filling because the machine is finite.',
      narration: 'Distinguishability is defined on strings and needs no machine. State equivalence is defined on the states of one machine.',
      keyword: 'strings against states'
    },
    {
      id: 'e9b', scene: 'confused', start: 247.5, end: 255,
      caption: 'On a machine, table filling computes state equivalence in a finite number of rounds. Its classes are the right languages of the states.',
      detail: 'Two states are marked distinguishable as soon as one is accepting and the other is not, and then any pair whose successors are marked becomes marked. The unmarked pairs are the equivalent states, and the quotient of the machine by them is the minimal machine.',
      narration: 'On a machine, table filling computes state equivalence in a finite number of rounds. Its classes are the right languages of the states.',
      keyword: 'table filling',
      trap: 'Table filling can only shrink a machine you already have. It cannot tell you that a machine with fewer states exists, and it says nothing about a language with no machine.'
    },
    {
      id: 'e9c', scene: 'confused', start: 255, end: 262.5,
      caption: 'And "the same outgoing letters" is not equivalence: two states can share every label and accept different endings.',
      detail: 'Take a machine where one state is accepting and one is not, both with an a-loop and a b-loop to themselves. Their outgoing labels are identical and their right languages are not, because the empty ending separates them. Equivalence is about futures, not about the shape of the arrows leaving a state.',
      narration: 'And the same outgoing letters is not equivalence: two states can share every label and accept different endings.',
      keyword: 'about futures, not arrows',
      trap: 'Comparing transition tables row by row is a common shortcut that fails on the first machine where an accepting and a non-accepting state look alike.'
    },
    {
      id: 'e9d', scene: 'confused', start: 262.5, end: 270,
      caption: 'The minimal deterministic machine is unique. The minimal non-deterministic one is not: several smallest machines can accept the same language.',
      detail: 'Uniqueness comes from the classes, which are determined by the language. For non-deterministic machines there is no such object: two different machines with the same number of states can accept the same language, and neither is a relabelling of the other.',
      narration: 'The minimal deterministic machine is unique. The minimal non deterministic one is not: several smallest machines can accept the same language.',
      keyword: 'unique only for deterministic',
      trap: 'Quoting uniqueness in a question about non-deterministic machines is wrong, and questions that mention NFA are testing exactly that.'
    },

    /* ---------- scene 10: payoff ---------- */
    {
      id: 'e10a', scene: 'payoff', start: 270, end: 277.5,
      caption: 'What the theorem answers: the minimum number of states, exactly, and whether a language is regular at all.',
      detail: 'The index is the exact minimum, so a state-count question is answered by counting classes. A finite index is the same statement as regularity, so a non-regularity question is answered by exhibiting infinitely many classes.',
      narration: 'What the theorem answers: the minimum number of states, exactly, and whether a language is regular at all.',
      keyword: 'exactly, and whether'
    },
    {
      id: 'e10b', scene: 'payoff', start: 277.5, end: 285,
      caption: 'What it does not answer: it does not build a small machine for you, and it gives no bound on how large the index is.',
      detail: 'The index can be exponentially large in any description of the language you were given. The language of strings whose third symbol from the end is a has index eight, and the same pattern one symbol further back doubles the count each time.',
      narration: 'What it does not answer: it does not build a small machine for you, and it gives no bound on how large the index is.',
      keyword: 'no bound on the index',
      trap: 'A small description of a language says nothing about the size of its smallest machine.'
    },
    {
      id: 'e10c', scene: 'payoff', start: 285, end: 292.5,
      caption: 'Four indexes from this page: four for parity, three for divisibility by three, three for ending in 01, eight for the third symbol from the end.',
      detail: 'Each was computed by comparing signatures over a bounded ending length, and each was confirmed by building the quotient machine and checking it against the language on every string up to a stated length. The numbers are the model\u2019s, printed beside the languages they belong to.',
      narration: 'Four indexes from this page: four for parity, three for divisibility by three, three for ending in zero one, eight for the third symbol from the end.',
      keyword: 'four, three, three, eight'
    },
    {
      id: 'e10d', scene: 'payoff', start: 292.5, end: 300,
      caption: 'One sentence to keep: the states of the smallest machine are the classes of strings that no ending can tell apart.',
      detail: 'Everything on this page is that sentence read in one direction or the other. Counting the classes answers the size question, finding infinitely many answers the regularity question, and the quotient construction turns the classes into the machine.',
      narration: 'One sentence to keep: the states of the smallest machine are the classes of strings that no ending can tell apart.',
      keyword: 'one sentence to keep',
      trap: 'Remembering the sentence without the right-invariance clause leaves out the only part that has to be proved.'
    }
  ]
};
