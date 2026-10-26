/* ==========================================================================
   counting-and-combinatorics — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs — never edited by hand.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'rules',
      n: 1,
      title: 'Two rules, and nothing else',
      start: 0, end: 30,
      objective: 'Recognise that every count is a sum of alternatives or a product of stages, and choose the operation from the English connective rather than from the numbers.'
    },
    {
      id: 'boxes',
      n: 2,
      title: 'The four boxes',
      start: 30, end: 60,
      objective: 'Place a counting problem in one of four boxes by asking two yes/no questions — does order matter, may items repeat — and read the formula off the box.'
    },
    {
      id: 'divide',
      n: 3,
      title: 'Divide out the order',
      start: 60, end: 90,
      objective: 'See a combination as a permutation with the r! internal orders merged, and use that one idea to justify every division in the unit.'
    },
    {
      id: 'symmetry',
      n: 4,
      title: 'Divide out what you cannot see',
      start: 90, end: 120,
      objective: 'Divide by the size of the symmetry group — rotations at a round table, repeated letters in a word — and check the divisor against a small case.'
    },
    {
      id: 'stars',
      n: 5,
      title: 'Stars and bars',
      start: 120, end: 150,
      objective: 'Turn "identical items into distinct bins" into "choose where the bars go", and get combinations with repetition as one binomial coefficient.'
    },
    {
      id: 'pie',
      n: 6,
      title: 'Inclusion and exclusion',
      start: 150, end: 180,
      objective: 'Repair the sum rule when the sets overlap, with the alternating signs, and apply it to a divisibility count.'
    },
    {
      id: 'pigeon',
      n: 7,
      title: 'The pigeonhole principle',
      start: 180, end: 210,
      objective: 'Distinguish a count from a guarantee, and read the generalised form as a ceiling: N pigeons in k holes force a hole with at least the ceiling of N over k.'
    },
    {
      id: 'functions',
      n: 8,
      title: 'Counting functions between finite sets',
      start: 210, end: 240,
      objective: 'Count all functions, injections and surjections on the same pair of sets, and see why only surjections need inclusion and exclusion.'
    },
    {
      id: 'derange',
      n: 9,
      title: 'Derangements',
      start: 240, end: 270,
      objective: 'Count the arrangements that fix nothing by subtracting the arrangements that fix something, and apply it to a word with a repeated letter.'
    },
    {
      id: 'procedure',
      n: 10,
      title: 'The decision procedure and four traps',
      start: 270, end: 300,
      objective: 'Consolidate the unit into one ordered checklist, and name the four errors that cost marks in this topic.'
    }
  ],

  events: [

    /* ---------------- scene 1: the two rules ---------------- */
    {
      id: 'ru-1', start: 0, end: 8, scene: 'rules',
      caption: 'Every counting question is built from two moves. The sum rule: if a job can be done one way OR another, add the counts.',
      detail: 'The sum rule applies when the alternatives are disjoint — you do exactly one of them. Three trains or two buses gives three plus two equals five ways to travel, and no journey is counted twice because no journey is both a train and a bus.',
      keyword: 'add',
      trap: null,
      narration: 'Every counting question is built from two moves. The sum rule: if a job can be done one way or another, add the counts.'
    },
    {
      id: 'ru-2', start: 8, end: 16, scene: 'rules',
      caption: 'The product rule: if the job needs one thing AND then another, multiply the counts.',
      detail: 'The product rule applies to stages: a choice is made at each stage, independently, and every combination of choices is a distinct outcome. Three shirts and two trousers give six outfits, because each of the three shirts can be worn with either of the two trousers.',
      keyword: 'multiply',
      trap: null,
      narration: 'The product rule: if the job needs one thing AND then another, multiply the counts.'
    },
    {
      id: 'ru-3', start: 16, end: 23, scene: 'rules',
      caption: 'Draw the product as a grid. Three rows and two columns, and every one of the six cells is one outfit — the grid is the multiplication.',
      detail: 'A grid is the picture of a product rule: rows are the choices at the first stage, columns the choices at the second, and cells the outcomes. If the grid is complete, every cell is a distinct outcome and the count is the number of cells.',
      keyword: 'grid',
      trap: null,
      narration: 'Draw the product as a grid. Three rows and two columns, and every one of the six cells is one outfit — the grid is the multiplication.'
    },
    {
      id: 'ru-4', start: 23, end: 30, scene: 'rules',
      caption: 'The connective decides the operation: or means add, and means multiply. But a plain sum needs the alternatives to be disjoint.',
      detail: 'When the alternatives overlap, adding double-counts the overlap, and the repair is inclusion and exclusion — the fifth scene of this lesson. The sum rule is not wrong; it has a precondition, and that precondition is disjointness.',
      keyword: 'disjoint',
      trap: 'Do not add just because you see the word "or". If one outcome can satisfy both clauses, the sum rule needs the overlap removed.',
      narration: 'The connective decides the operation: or means add, and means multiply. But a plain sum needs the alternatives to be disjoint.'
    },

    /* ---------------- scene 2: the four boxes ---------------- */
    {
      id: 'bo-1', start: 30, end: 38, scene: 'boxes',
      caption: 'Two questions decide almost every counting formula: does the order of the chosen items matter, and may an item be chosen more than once?',
      detail: 'These two questions are independent, so they give four boxes. Fix a set of n things to choose from and a number r of choices to make; the answer depends only on which box the problem sits in.',
      keyword: 'order',
      trap: null,
      narration: 'Two questions decide almost every counting formula: does the order of the chosen items matter, and may an item be chosen more than once?'
    },
    {
      id: 'bo-2', start: 38, end: 45, scene: 'boxes',
      caption: 'Order matters and repetition is allowed: n to the power r, one independent choice of n things at each of r stages.',
      detail: 'A password of two characters from three symbols has nine possibilities, because the product rule applies at each position. Nothing is removed after a choice, so the same symbol may appear twice.',
      keyword: 'n to the power r',
      trap: null,
      narration: 'Order matters and repetition is allowed: n to the power r, one independent choice of n things at each of r stages.'
    },
    {
      id: 'bo-3', start: 45, end: 52, scene: 'boxes',
      caption: 'Order matters and repetition is banned: n times n minus one down to n minus r plus one, written P of n comma r.',
      detail: 'Each stage has one fewer option than the last, because the item already used is gone. The product telescopes to n factorial divided by n minus r factorial. For three things taken two at a time that is six.',
      keyword: 'one fewer',
      trap: null,
      narration: 'Order matters and repetition is banned: n times n minus one down to n minus r plus one, written P of n comma r.'
    },
    {
      id: 'bo-4', start: 52, end: 60, scene: 'boxes',
      caption: 'Order does not matter: C of n comma r when repetition is banned, and C of n plus r minus one comma r when it is allowed.',
      detail: 'The third and fourth boxes are the two that students confuse. Choosing two of three things without repetition gives three; choosing two of three kinds with repetition allowed gives six, because you may take the same kind twice.',
      keyword: 'order does not matter',
      trap: 'The bottom-right box is the one that is missed. It is not C of n comma r; it is C of n plus r minus one comma r, and the next scene shows where that comes from.',
      narration: 'Order does not matter: C of n comma r when repetition is banned, and C of n plus r minus one comma r when it is allowed.'
    },

    /* ---------------- scene 3: divide out the order ---------------- */
    {
      id: 'di-1', start: 60, end: 68, scene: 'divide',
      caption: 'Take one combination — the set A, B, C — and write down every order of it. There are six.',
      detail: 'A permutation counts arrangements; a combination counts sets. One set of three elements has exactly six arrangements, so counting arrangements and counting sets differ by a factor of six, and six is three factorial.',
      keyword: 'six',
      trap: null,
      narration: 'Take one combination — the set A, B, C — and write down every order of it. There are six.'
    },
    {
      id: 'di-2', start: 68, end: 75, scene: 'divide',
      caption: 'Collapse the six into one. Permutations of r things from n are exactly r factorial times the combinations.',
      detail: 'This is the single justification for every division in combinatorics: an over-count by a constant factor is repaired by dividing by that factor. P of n comma r equals C of n comma r times r factorial, so C of n comma r equals P of n comma r divided by r factorial.',
      keyword: 'r factorial',
      trap: null,
      narration: 'Collapse the six into one. Permutations of r things from n are exactly r factorial times the combinations.'
    },
    {
      id: 'di-3', start: 75, end: 83, scene: 'divide',
      caption: 'So C of n comma r is n factorial over r factorial times n minus r factorial, and the binomial row adds to two to the n.',
      detail: 'The formula is symmetric in r and n minus r, which is why C of n comma r equals C of n comma n minus r: choosing which r to keep is the same act as choosing which n minus r to drop. Summing a whole row of Pascal\'s triangle counts every subset, and that is two to the n.',
      keyword: 'symmetric',
      trap: null,
      narration: 'So C of n comma r is n factorial over r factorial times n minus r factorial, and the binomial row adds to two to the n.'
    },
    {
      id: 'di-4', start: 83, end: 90, scene: 'divide',
      caption: 'Whenever a count comes out too big, find the thing you counted several times and divide by how many times.',
      detail: 'This one habit replaces a dozen memorised formulas. If you can name the symmetry or the order that caused the repetition, you can name the divisor, and you can test it on the smallest case where you can list the answers by hand.',
      keyword: 'too big',
      trap: 'Divide only by a factor you can name. Dividing by "something that felt repeated" produces a number that looks plausible and is wrong.',
      narration: 'Whenever a count comes out too big, find the thing you counted several times and divide by how many times.'
    },

    /* ---------------- scene 4: symmetry ---------------- */
    {
      id: 'sy-1', start: 90, end: 98, scene: 'symmetry',
      caption: 'Four people at a round table: seat them in a row and there are twenty-four orders, but the table can be rotated.',
      detail: 'A round table has no labelled first seat, so rotating everybody by one place leaves the same seating. Each seating therefore appears four times among the twenty-four row orders, once per rotation.',
      keyword: 'rotated',
      trap: null,
      narration: 'Four people at a round table: seat them in a row and there are twenty-four orders, but the table can be rotated.'
    },
    {
      id: 'sy-2', start: 98, end: 105, scene: 'symmetry',
      caption: 'Twenty-four divided by four is six, and the general answer is n minus one factorial.',
      detail: 'Fixing one person as a reference point removes the rotation entirely: the remaining n minus one people can be arranged freely, which is exactly n minus one factorial. The division and the fixing give the same number, and they are the same argument.',
      keyword: 'n minus one factorial',
      trap: null,
      narration: 'Twenty-four divided by four is six, and the general answer is n minus one factorial.'
    },
    {
      id: 'sy-3', start: 105, end: 113, scene: 'symmetry',
      caption: 'The same move handles a word with a repeated letter. LILAC has five letters but only sixty distinct arrangements, not a hundred and twenty.',
      detail: 'The two Ls are indistinguishable, so swapping them produces no new word. Every distinct arrangement was counted twice by the five factorial, and the repair is to divide by two factorial. The rule: divide by the factorial of each repeated letter count.',
      keyword: 'indistinguishable',
      trap: null,
      narration: 'The same move handles a word with a repeated letter. LILAC has five letters but only sixty distinct arrangements, not a hundred and twenty.'
    },
    {
      id: 'sy-4', start: 113, end: 120, scene: 'symmetry',
      caption: 'A necklace or a bracelet has more symmetry than a table: reflections count too, so the divisor is larger.',
      detail: 'If turning the necklace over gives the same object, then reflections must also be divided out, and the count drops further. The safe procedure is always the same: identify the full set of symmetries, and divide by its size — not by the one symmetry you happened to notice.',
      keyword: 'reflections',
      trap: 'A bracelet is not a round table. Dividing a bracelet count by n only is the standard slip; reflections add another factor of two.',
      narration: 'A necklace or a bracelet has more symmetry than a table: reflections count too, so the divisor is larger.'
    },

    /* ---------------- scene 5: stars and bars ---------------- */
    {
      id: 'st-1', start: 120, end: 128, scene: 'stars',
      caption: 'Five identical sweets into three named children. Write the five as stars, and separate the three shares with two bars.',
      detail: 'Identical items carry no identity, so only the counts per bin matter. Laying the stars in a line and placing two bars between them encodes one distribution as one pattern of stars and bars.',
      keyword: 'bars',
      trap: null,
      narration: 'Five identical sweets into three named children. Write the five as stars, and separate the three shares with two bars.'
    },
    {
      id: 'st-2', start: 128, end: 135, scene: 'stars',
      caption: 'Every pattern of five stars and two bars is one distribution, and every distribution is one pattern. So count the patterns.',
      detail: 'This is a bijection, not an approximation: the map from distributions to patterns is one to one and onto. Seven positions, choose which two hold bars, and the rest are stars.',
      keyword: 'bijection',
      trap: null,
      narration: 'Every pattern of five stars and two bars is one distribution, and every distribution is one pattern. So count the patterns.'
    },
    {
      id: 'st-3', start: 135, end: 143, scene: 'stars',
      caption: 'Seven positions choose two is twenty-one, and in general n plus r minus one choose r. The bars are the thing you choose.',
      detail: 'For r bins and n items there are n stars and r minus one bars, so n plus r minus one positions in all, and the choice of where the bars sit determines everything. This is the bottom-right box of the four-box table.',
      keyword: 'twenty-one',
      trap: null,
      narration: 'Seven positions choose two is twenty-one, and in general n plus r minus one choose r. The bars are the thing you choose.'
    },
    {
      id: 'st-4', start: 143, end: 150, scene: 'stars',
      caption: 'Change the condition and the pattern changes. Each bin at least one means no two bars touch, so reserve one star per bin first.',
      detail: 'If every bin must receive at least one item, give each bin one item up front and distribute the remaining n minus r freely; the answer becomes C of n minus one comma r minus one. Bins that may be empty, at most one item per bin, and bounded bins are all handled by editing the stars-and-bars pattern, not by starting again.',
      keyword: 'at least one',
      trap: '"At least one in every bin" is not C of n plus r minus one comma r. Subtracting one item per bin first is what makes the count right.',
      narration: 'Change the condition and the pattern changes. Each bin at least one means no two bars touch, so reserve one star per bin first.'
    },

    /* ---------------- scene 6: inclusion and exclusion ---------------- */
    {
      id: 'pi-1', start: 150, end: 158, scene: 'pie',
      caption: 'Two sets that overlap. Adding their sizes counts the overlap twice, so subtract it once.',
      detail: 'The union of A and B is the sum of the sizes minus the intersection. In a two-circle picture the middle lens is covered by both circles, so a plain sum paints it twice and one subtraction restores the true area.',
      keyword: 'subtract',
      trap: null,
      narration: 'Two sets that overlap. Adding their sizes counts the overlap twice, so subtract it once.'
    },
    {
      id: 'pi-2', start: 158, end: 165, scene: 'pie',
      caption: 'Three sets: add the singles, subtract the pairs, add the triple back. The signs alternate, and the last term is not a mistake.',
      detail: 'An element in all three sets is added three times by the singles and removed three times by the pairs, so it has been counted zero times; adding the triple once restores it. The alternating pattern is forced, not chosen.',
      keyword: 'alternate',
      trap: null,
      narration: 'Three sets: add the singles, subtract the pairs, add the triple back. The signs alternate, and the last term is not a mistake.'
    },
    {
      id: 'pi-3', start: 165, end: 173, scene: 'pie',
      caption: 'Between 1 and 500 there are 166 multiples of 3, 100 of 5 and 71 of 7. Add: 337. Subtract the pairs: 267.',
      detail: 'The pairs are the multiples of 15, of 21 and of 35 — 33, 23 and 14 of them, which is 70. Adding the triple, the multiples of 105, there are 4. So the answer is 337 minus 70 plus 4.',
      keyword: '337',
      trap: null,
      narration: 'Between 1 and 500 there are 166 multiples of 3, 100 of 5 and 71 of 7. Add: 337. Subtract the pairs: 267.'
    },
    {
      id: 'pi-4', start: 173, end: 180, scene: 'pie',
      caption: 'The answer is 271. Inclusion and exclusion is also the engine behind counting surjections and derangements, later in this lesson.',
      detail: 'Whenever a condition says "at least one" or "not any", it is easier to count the complement and repair the over-count. Inclusion and exclusion is that repair, made systematic over many overlapping conditions.',
      keyword: '271',
      trap: 'The commonest error is to stop after subtracting the pairs and forget to add the triple back, which loses the elements in all three sets.',
      narration: 'The answer is 271. Inclusion and exclusion is also the engine behind counting surjections and derangements, later in this lesson.'
    },

    /* ---------------- scene 7: pigeonhole ---------------- */
    {
      id: 'pg-1', start: 180, end: 188, scene: 'pigeon',
      caption: 'Five pigeons into four holes. However you place them, some hole holds at least two. That is not a probability; it is forced.',
      detail: 'If every hole held at most one pigeon, four holes would hold at most four pigeons, and the fifth has nowhere to go. The pigeonhole principle is a counting argument about capacities, and it needs no assumption about how the pigeons are placed.',
      keyword: 'forced',
      trap: null,
      narration: 'Five pigeons into four holes. However you place them, some hole holds at least two. That is not a probability; it is forced.'
    },
    {
      id: 'pg-2', start: 188, end: 195, scene: 'pigeon',
      caption: 'Generalised: N pigeons in k holes force some hole to hold at least the ceiling of N over k.',
      detail: 'If every hole held at most the ceiling of N over k minus one, the total would be strictly less than N, which is impossible. The ceiling is the sharp bound: with N equal to k times m, you can place m in each hole and no more.',
      keyword: 'ceiling',
      trap: null,
      narration: 'Generalised: N pigeons in k holes force some hole to hold at least the ceiling of N over k.'
    },
    {
      id: 'pg-3', start: 195, end: 203, scene: 'pigeon',
      caption: 'A deck has four suits. Two cards per suit is eight cards with no three of a kind, so nine cards guarantee three of one suit.',
      detail: 'The holes are the suits and the pigeons are the cards. To guarantee three in one hole, find the largest number of cards that can avoid it — two per suit, eight — and add one. This is the standard shape of every guarantee question.',
      keyword: 'nine',
      trap: null,
      narration: 'A deck has four suits. Two cards per suit is eight cards with no three of a kind, so nine cards guarantee three of one suit.'
    },
    {
      id: 'pg-4', start: 203, end: 210, scene: 'pigeon',
      caption: 'The direction of the inequality is the whole question. More objects than holes forces a collision; fewer objects proves nothing.',
      detail: 'A pigeonhole argument gives a guarantee and never an exact arrangement. If the number of objects is at most the number of holes, no collision is forced and the argument says nothing at all.',
      keyword: 'direction',
      trap: 'The classic inversion: a question asks for the minimum that guarantees a collision and the answer is given as the number of holes. The answer is one more than the largest collision-free arrangement.',
      narration: 'The direction of the inequality is the whole question. More objects than holes forces a collision; fewer objects proves nothing.'
    },

    /* ---------------- scene 8: counting functions ---------------- */
    {
      id: 'fu-1', start: 210, end: 218, scene: 'functions',
      caption: 'A function from a four-element set to a three-element set is four independent choices, one image per element. That is eighty-one.',
      detail: 'Order matters, because the four elements are distinct, and repetition is allowed, because two elements may share an image. So the function count sits in the top-left box of the four-box table, and the answer is three to the power four.',
      keyword: 'eighty-one',
      trap: null,
      narration: 'A function from a four-element set to a three-element set is four independent choices, one image per element. That is eighty-one.'
    },
    {
      id: 'fu-2', start: 218, end: 225, scene: 'functions',
      caption: 'An injection forbids repetition, so the count is P of n comma r — and it is zero as soon as the domain is larger than the codomain.',
      detail: 'With four elements mapped into three, two must collide by the pigeonhole principle, so no injection exists. The formula P of three comma four has no meaning, and the honest answer is zero rather than a negative factorial.',
      keyword: 'zero',
      trap: null,
      narration: 'An injection forbids repetition, so the count is P of n comma r — and it is zero as soon as the domain is larger than the codomain.'
    },
    {
      id: 'fu-3', start: 225, end: 233, scene: 'functions',
      caption: 'A surjection must hit all three images, which is an "at least one" condition. Inclusion and exclusion gives 81 minus 48 plus 3.',
      detail: 'Subtract the functions that miss at least one image: three choices of the missed image, each giving two to the fourth functions, so 48, but the functions missing two images were subtracted twice and must be added back, three of them. The result is 36.',
      keyword: '36',
      trap: null,
      narration: 'A surjection must hit all three images, which is an "at least one" condition. Inclusion and exclusion gives 81 minus 48 plus 3.'
    },
    {
      id: 'fu-4', start: 233, end: 240, scene: 'functions',
      caption: 'Only the surjection count needs the repair. All functions is a product, injections a falling product, and surjections an alternating sum.',
      detail: 'The three answers are genuinely different objects, and the exam tests which one a question is asking for. The phrase "onto" or "every element of the codomain is used" signals the alternating sum; "one to one" signals the falling product.',
      keyword: 'alternating sum',
      trap: 'The words "function" and "one to one function" and "onto function" give three different counts on the same sets. Read which one is asked before computing.',
      narration: 'Only the surjection count needs the repair. All functions is a product, injections a falling product, and surjections an alternating sum.'
    },

    /* ---------------- scene 9: derangements ---------------- */
    {
      id: 'de-1', start: 240, end: 248, scene: 'derange',
      caption: 'A derangement is an arrangement that leaves nothing in its original place. Three items have six arrangements and two derangements.',
      detail: 'Writing each arrangement as a set of arrows from position to item, a fixed point is an arrow that points at its own position. A derangement is an arrangement with no fixed points, and for three items the two that qualify are the two three-cycles.',
      keyword: 'fixed point',
      trap: null,
      narration: 'A derangement is an arrangement that leaves nothing in its original place. Three items have six arrangements and two derangements.'
    },
    {
      id: 'de-2', start: 248, end: 255, scene: 'derange',
      caption: 'Count the complement instead: six total, minus those fixing at least one position. Subtract the singles, add the pairs, subtract the triple.',
      detail: 'Inclusion and exclusion over the events "position i is fixed". Three single events, each leaving two items free, so two arrangements each. Three pairs, each forcing the third, so one each. One triple, impossible. Six minus six plus three minus one is two.',
      keyword: 'complement',
      trap: null,
      narration: 'Count the complement instead: six total, minus those fixing at least one position. Subtract the singles, add the pairs, subtract the triple.'
    },
    {
      id: 'de-3', start: 255, end: 263, scene: 'derange',
      caption: 'The sequence runs 0, 1, 2, 9, 44, 265, and it is always the nearest integer to n factorial over e.',
      detail: 'The four-item case is 24 minus 24 plus 12 minus 4 plus 1, which is 9, and the five-item case is 44. The closed form is the nearest integer to n factorial divided by e, which is why the ratio of derangements to arrangements settles near 0.368.',
      keyword: 'nearest integer',
      trap: null,
      narration: 'The sequence runs 0, 1, 2, 9, 44, 265, and it is always the nearest integer to n factorial over e.'
    },
    {
      id: 'de-4', start: 263, end: 270, scene: 'derange',
      caption: 'LILAC: sixty distinct arrangements, and twelve leave no letter in its own place. The repeated L is handled before the derangement count.',
      detail: 'First collapse the two Ls, which turns one hundred and twenty arrangements into sixty. Then apply the no-fixed-position condition to the sixty. The official answer for that question is twelve, and this page reaches it by listing all sixty arrangements and testing each one.',
      keyword: 'twelve',
      trap: 'A repeated letter must be collapsed first. Deranging the hundred and twenty labelled arrangements and then dividing by two is a different, and usually wrong, procedure.',
      narration: 'LILAC: sixty distinct arrangements, and twelve leave no letter in its own place. The repeated L is handled before the derangement count.'
    },

    /* ---------------- scene 10: procedure ---------------- */
    {
      id: 'pr-1', start: 270, end: 278, scene: 'procedure',
      caption: 'One checklist, in order: are the objects distinct or identical, does order matter, may items repeat, and is there a condition?',
      detail: 'Four questions in a fixed order locate the problem in the four-box table and reveal which extra tool — inclusion and exclusion, or a division by symmetry — the condition needs. Answering them in this order prevents most errors before any arithmetic starts.',
      keyword: 'checklist',
      trap: null,
      narration: 'One checklist, in order: are the objects distinct or identical, does order matter, may items repeat, and is there a condition?'
    },
    {
      id: 'pr-2', start: 278, end: 285, scene: 'procedure',
      caption: 'Trap one: multiplying when the stages are not independent. Trap two: forgetting to divide by the internal order.',
      detail: 'Stages are independent only when the number of choices at a stage does not depend on what was chosen earlier. And any time you count arrangements of a group whose internal order is invisible, you have over-counted by a factorial.',
      keyword: 'independent',
      trap: null,
      narration: 'Trap one: multiplying when the stages are not independent. Trap two: forgetting to divide by the internal order.'
    },
    {
      id: 'pr-3', start: 285, end: 293, scene: 'procedure',
      caption: 'Trap three: adding overlapping alternatives. Trap four: reading a pigeonhole guarantee as an exact count.',
      detail: 'Overlap breaks the sum rule and needs inclusion and exclusion. And a pigeonhole result is a lower bound forced by capacity, not a description of the arrangement — the question asks for the smallest number that guarantees, which is one more than the largest arrangement that avoids.',
      keyword: 'overlap',
      trap: null,
      narration: 'Trap three: adding overlapping alternatives. Trap four: reading a pigeonhole guarantee as an exact count.'
    },
    {
      id: 'pr-4', start: 293, end: 300, scene: 'procedure',
      caption: 'Check every answer on the smallest case you can list by hand. That single habit catches all four traps.',
      detail: 'A formula that is wrong is usually wrong by a factor or by an off-by-one, and both show up immediately at n equals three or four. The practice set that follows asks you to do exactly that.',
      keyword: 'smallest case',
      trap: 'An answer that matches a remembered formula is not checked. A remembered formula applied to the wrong box is the commonest way to lose this mark.',
      narration: 'Check every answer on the smallest case you can list by hand. That single habit catches all four traps.'
    }
  ]
};
