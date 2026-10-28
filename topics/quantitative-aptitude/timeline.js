/* ==========================================================================
   quantitative-aptitude — THE timeline.
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
      id: 'ask',
      n: 1,
      title: 'What Section 2 actually asks',
      start: 0, end: 30,
      objective: 'Name the five computations that Section 2 of the General Aptitude syllabus asks for, and see that each question in it is one of the five.'
    },
    {
      id: 'base',
      n: 2,
      title: 'Ratios and percentages: one base',
      start: 30, end: 60,
      objective: 'Convert a ratio into amounts by multiplying each share by its unit value, then express the part as a percentage of the total — GATE CSE 2024 Set 1 GA Q4.'
    },
    {
      id: 'data',
      n: 3,
      title: 'Data interpretation is a multiplication chain',
      start: 60, end: 90,
      objective: 'Read a share from a chart, multiply by the total, and divide by a rate from a table, with the units checked at each step — GATE CSE 2024 Set 1 GA Q8.'
    },
    {
      id: 'log',
      n: 4,
      title: 'Logarithms: a product becomes a sum',
      start: 90, end: 120,
      objective: 'Use the single rule log(ab) = log a + log b to turn a logarithmic condition into an algebraic one — GATE CSE 2024 Set 1 GA Q5.'
    },
    {
      id: 'mens',
      n: 5,
      title: 'Mensuration: which edge becomes the circumference',
      start: 120, end: 150,
      objective: 'Fold a sheet into a tube and compare its volume with a cube of equal surface area, deciding the reading of "longer edges" from the geometry rather than from the options — GATE CSE 2024 Set 1 GA Q7.'
    },
    {
      id: 'stat',
      n: 6,
      title: 'Statistics: the median is a position, the mean is a sum',
      start: 150, end: 180,
      objective: 'Compute median, mean and mode from a sorted sample and see how one large value moves the mean and leaves the median where it was — GATE CSE 2024 Set 1 GA Q3.'
    },
    {
      id: 'prob',
      n: 7,
      title: 'Probability: count the complement',
      start: 180, end: 210,
      objective: 'Turn an "at least one" question into one minus "none", by counting outcomes on a small sample space and by counting pairs in a bag.'
    },
    {
      id: 'series',
      n: 8,
      title: 'Series: run the recurrence backwards',
      start: 210, end: 240,
      objective: 'Recover the first term of a Fibonacci-type series from its sixth and seventh terms, and check the answer by running forward — GATE CSE 2023 GA Q3.'
    },
    {
      id: 'est',
      n: 9,
      title: 'Estimation: name the size before you name the digits',
      start: 240, end: 270,
      objective: 'Use ten doublings equals about three decimal digits, and the rule of seventy-two, to decide an answer to one significant figure without long arithmetic.'
    },
    {
      id: 'proc',
      n: 10,
      title: 'The five-step procedure',
      start: 270, end: 300,
      objective: 'Collect the five moves that settle a quantitative question, in the order they should be tried.'
    }
  ],

  events: [
    /* ---------------- scene 1: ask ---------------- */
    {
      id: 'qa-1', scene: 'ask', start: 0, end: 7.5,
      caption: 'Section 2 of General Aptitude asks for five computations, and every question in it is one of them.',
      detail: 'The syllabus names four headings: data interpretation; numerical computation and estimation; mensuration and geometry; elementary statistics and probability. Underneath them there are only five things you are ever asked to do, and this lesson names all five before it does any arithmetic.',
      narration: 'Section two of General Aptitude asks for five computations, and every question in it is one of the five. The syllabus names four headings, and underneath them there are only five things you are ever asked to do.',
      keyword: 'five computations',
      trap: 'The four syllabus headings are not four topics to revise separately. They are four names for the same five moves.'
    },
    {
      id: 'qa-2', scene: 'ask', start: 7.5, end: 15,
      caption: 'A ratio question asks for a share of one total. A data question chains a percentage to a unit.',
      detail: 'The first two computations are the same move in different clothes: put every quantity on one base, then multiply or divide along a chain that keeps the units visible. If the units cancel, the chain is right; if they do not, it is wrong.',
      narration: 'A ratio question asks for a share of one total. A data question chains a percentage to a unit. Both are the same move: put every quantity on one base, and keep the units visible as you go.',
      keyword: 'share of one total',
      trap: 'Two percentages of two different totals cannot be compared. Convert both to the same base first.'
    },
    {
      id: 'qa-3', scene: 'ask', start: 15, end: 22.5,
      caption: 'A logarithm question turns a product into a sum. A mensuration question turns a length into a volume.',
      detail: 'Logarithms exist to move multiplication into addition, which is why a condition that looks unmanageable becomes linear in one step. Mensuration is a chain of powers: a length goes to an area by squaring and to a volume by cubing, and the question is always which length.',
      narration: 'A logarithm question turns a product into a sum. A mensuration question turns a length into a volume. In both, the work is to choose the one identity that reduces the unknown.',
      keyword: 'product into a sum',
      trap: 'log(a + b) is not log a + log b. The rule holds for products and for powers, and for nothing else.'
    },
    {
      id: 'qa-4', scene: 'ask', start: 22.5, end: 30,
      caption: 'A statistics question names a centre. A probability question counts the complement.',
      detail: 'Mean, median and mode answer different questions about the same list, and a single large value separates them. Probability in this section is small-sample counting: enumerate the outcomes, or count the one case the question did not ask for.',
      narration: 'A statistics question names a centre: mean, median or mode, and one large value separates them. A probability question counts the complement. Small samples, counted exactly, settle all of them.',
      keyword: 'names a centre',
      trap: 'Mean and median are not two ways of saying average. In a skewed sample they disagree, and the question usually turns on that.'
    },

    /* ---------------- scene 2: base ---------------- */
    {
      id: 'ba-1', scene: 'base', start: 30, end: 37.5,
      caption: 'Coins of one, five and ten rupees sit in the ratio five to three to thirteen.',
      detail: 'A ratio is a statement about counts, not about money. Five coins of one rupee and thirteen coins of ten rupees are very different amounts, so the ratio alone cannot answer a question about money.',
      narration: 'Coins of one, five and ten rupees sit in the ratio five to three to thirteen. A ratio is a statement about counts, not about money, so it cannot answer a question about money on its own.',
      keyword: 'a ratio is counts',
      trap: 'Adding the ratio numbers gives the number of parts, not the number of rupees.'
    },
    {
      id: 'ba-2', scene: 'base', start: 37.5, end: 45,
      caption: 'Multiply each share by its denomination before you compare anything.',
      detail: 'Five coins of one rupee are five rupees; three coins of five rupees are fifteen; thirteen coins of ten rupees are a hundred and thirty. That step, share times denomination, is the whole of the first computation.',
      narration: 'Multiply each share by its denomination before you compare anything. Five rupees, fifteen rupees, and a hundred and thirty rupees. That single step is the whole of the first computation.',
      keyword: 'share by its denomination',
      trap: 'Comparing the shares 5, 3, 13 directly is comparing counts of unlike things.'
    },
    {
      id: 'ba-3', scene: 'base', start: 45, end: 52.5,
      caption: 'The values are five, fifteen and a hundred and thirty: one hundred and fifty rupees in total.',
      detail: 'The total is the sum of the three values, one hundred and fifty. This total is the base. Every percentage in the question is a share of this one number, and no other number.',
      narration: 'The values are five, fifteen and a hundred and thirty. The total is one hundred and fifty rupees, and that total is the base. Every percentage in the question is a share of this one number.',
      keyword: 'one hundred and fifty',
      trap: 'The base is the total value, not the total number of coins.'
    },
    {
      id: 'ba-4', scene: 'base', start: 52.5, end: 60,
      caption: 'Fifteen out of a hundred and fifty is ten per cent. The official key marks option C.',
      detail: 'Fifteen divided by one hundred and fifty is one tenth, that is ten per cent. The two wrong answers in the paper come from dividing by the wrong base: 3/21 gives about fourteen per cent, and 15/50 gives thirty per cent.',
      narration: 'Fifteen out of a hundred and fifty is ten per cent, and the official key marks option C. The wrong answers come from the wrong base: dividing by the number of coins, or by the wrong part of the total.',
      keyword: 'ten per cent',
      trap: 'The distractor fourteen and two sevenths per cent is three divided by twenty-one: a count over a count.'
    },

    /* ---------------- scene 3: data ---------------- */
    {
      id: 'da-1', scene: 'data', start: 60, end: 67.5,
      caption: 'The chart gives shares of two thousand kilocalories; the table gives kilocalories per gram.',
      detail: 'A pie chart and a table are two different kinds of number, and the question only becomes arithmetic when you join them. The chart speaks in percentages of a stated total; the table speaks in a rate, kilocalories for every gram.',
      narration: 'The chart gives shares of two thousand kilocalories, and the table gives kilocalories per gram. Two different kinds of number, joined by one multiplication chain.',
      keyword: 'two different kinds of number',
      trap: 'A share on its own is not an amount. It needs the total it is a share of.'
    },
    {
      id: 'da-2', scene: 'data', start: 67.5, end: 75,
      caption: 'Multiply the share by the total, then divide by the rate. Two steps, and the units cancel.',
      detail: 'Percent of kilocalories gives kilocalories. Kilocalories divided by kilocalories per gram gives grams. If the unit at the end is the unit the question asked for, the chain is right; this check costs two seconds and catches most errors.',
      narration: 'Multiply the share by the total, then divide by the rate. Percent times kilocalories gives kilocalories, and kilocalories divided by kilocalories per gram gives grams. The units cancel, and that is the check.',
      keyword: 'the units cancel',
      trap: 'Dividing the percentage by the rate, instead of the energy, is the commonest slip here.'
    },
    {
      id: 'da-3', scene: 'data', start: 75, end: 82.5,
      caption: 'The three fats take forty-five per cent of two thousand: nine hundred kilocalories.',
      detail: 'Unsaturated and saturated fat are twenty per cent each and trans fat is five, so the fats together are forty-five per cent. Forty-five per cent of two thousand is nine hundred. Grouping before multiplying is one multiplication instead of three.',
      narration: 'The three fats take forty-five per cent of two thousand, which is nine hundred kilocalories. Grouping before multiplying turns three multiplications into one.',
      keyword: 'forty-five per cent',
      trap: 'The question asks for all three fats, not for one of them. Read the noun the question uses.'
    },
    {
      id: 'da-4', scene: 'data', start: 82.5, end: 90,
      caption: 'All three fats are nine kilocalories per gram, so nine hundred divided by nine is one hundred grams.',
      detail: 'Because the density is the same for all three fats, the grouped calculation is exact rather than approximate. The official key for GATE CSE 2024 Set 1 GA Question 8 is C, one hundred grams. The distractor 44.4 is one fat alone; 3,600 is the total energy times nothing.',
      narration: 'All three fats are nine kilocalories per gram, so nine hundred divided by nine is one hundred grams. The official key is C. The option 44.4 is one fat alone, and 3,600 is a number with no units.',
      keyword: 'one hundred grams',
      trap: 'Two different fats with two different densities would need the division done per row, then added.'
    },

    /* ---------------- scene 4: log ---------------- */
    {
      id: 'lo-1', scene: 'log', start: 90, end: 97.5,
      caption: 'The logarithm of a product is the sum of the logarithms, and the logarithm of a power is the exponent times the logarithm.',
      detail: 'Those two rules are the whole algebraic content of logarithms for this paper. Everything else follows: the logarithm of a quotient is a difference, and the logarithm of one is zero. The base only has to be the same throughout.',
      narration: 'The logarithm of a product is the sum of the logarithms, and the logarithm of a power is the exponent times the logarithm. Those two rules are the whole algebraic content for this paper.',
      keyword: 'sum of the logarithms',
      trap: 'log of a sum does not split. There is no rule for log(a plus b).'
    },
    {
      id: 'lo-2', scene: 'log', start: 97.5, end: 105,
      caption: 'The condition is log of p squared plus q squared, equals log p plus log q plus two log three.',
      detail: 'Read the right-hand side as a single logarithm before doing anything: log p plus log q is log pq, and two log three is log nine, so the right side is log of nine p q. Now the equation has one logarithm on each side.',
      narration: 'The condition is log of p squared plus q squared, equals log p plus log q plus two log three. Combine the right side first: log p q plus log nine, which is log of nine p q.',
      keyword: 'combine the right side',
      trap: 'Two log three is log nine, not log six. The coefficient is an exponent, not a multiplier.'
    },
    {
      id: 'lo-3', scene: 'log', start: 105, end: 112.5,
      caption: 'Exponentiate both sides: p squared plus q squared equals nine times p q.',
      detail: 'Equal logarithms of positive numbers mean equal numbers, so the logarithm disappears entirely and what is left is ordinary algebra. Divide through by p q and the condition becomes p over q plus q over p equals nine.',
      narration: 'Exponentiate both sides, and the logarithms disappear. p squared plus q squared equals nine p q. Divide by p q and the condition becomes p over q plus q over p equals nine.',
      keyword: 'nine times p q',
      trap: 'This step needs both sides positive. A logarithm of zero or of a negative number does not exist, so the paper says non-zero real variables.'
    },
    {
      id: 'lo-4', scene: 'log', start: 112.5, end: 120,
      caption: 'Then p to the fourth plus q to the fourth is eighty-one minus two, so seventy-nine times p squared q squared. The answer is seventy-nine.',
      detail: 'Square the relation p squared plus q squared equals nine p q. The left side becomes p to the fourth plus two p squared q squared plus q to the fourth, and the right becomes eighty-one p squared q squared. Subtract the middle term and the ratio is seventy-nine. The official key is A.',
      narration: 'Square the relation. The left side gains a middle term, two p squared q squared, and the right becomes eighty-one p squared q squared. Subtract the middle term and the ratio is seventy-nine. The official key is A.',
      keyword: 'seventy-nine',
      trap: 'Squaring p squared plus q squared gives three terms. Dropping the middle one produces eighty-one, which is not the answer.'
    },

    /* ---------------- scene 5: mens ---------------- */
    {
      id: 'me-1', scene: 'mens', start: 120, end: 127.5,
      caption: 'The sheet is fifty-four by four, so its area is two hundred and sixteen square centimetres.',
      detail: 'Area is the product of the two sides, and it is the one quantity the tube and the cube share. Every comparison in a mensuration question should start from the quantity that does not change.',
      narration: 'The sheet is fifty-four by four, so its area is two hundred and sixteen square centimetres. Area is the one quantity the tube and the cube share, so it is where the comparison starts.',
      keyword: 'two hundred and sixteen',
      trap: 'The area is conserved when the sheet is rolled. The perimeter is not, and neither is the volume.'
    },
    {
      id: 'me-2', scene: 'mens', start: 127.5, end: 135,
      caption: 'Joining the two longer edges makes the tube fifty-four tall with a circumference of four.',
      detail: 'The two longer edges are the fifty-four centimetre edges. Bringing them together puts the seam along the length, so the fifty-four becomes the height and the four becomes the distance around. Getting this backwards is the whole difficulty of the question.',
      narration: 'The two longer edges are the fifty-four centimetre edges. Bringing them together puts the seam along the length, so fifty-four becomes the height and four becomes the distance around.',
      keyword: 'circumference of four',
      trap: 'Joining the shorter edges would give a different tube: height four, circumference fifty-four.'
    },
    {
      id: 'me-3', scene: 'mens', start: 135, end: 142.5,
      caption: 'The cube has the same surface area, so a side is six and its volume is two hundred and sixteen.',
      detail: 'A cube has six equal square faces, so six times the square of the side equals two hundred and sixteen, the square of the side is thirty-six, and the side is six. Its volume is the cube of the side, which happens to equal the area because the side is six.',
      narration: 'The cube has six equal faces, so six times the square of the side is two hundred and sixteen. The side is six, and the volume is two hundred and sixteen.',
      keyword: 'a side is six',
      trap: 'Setting one face equal to the area gives a side of about fourteen point seven and the wrong volume.'
    },
    {
      id: 'me-4', scene: 'mens', start: 142.5, end: 150,
      caption: 'The tube is two hundred and sixteen over pi, so the ratio is one over pi.',
      detail: 'The radius is four divided by two pi, so the volume, pi r squared h, is pi times four over pi squared times fifty-four, which is two hundred and sixteen over pi. Dividing by two hundred and sixteen leaves one over pi. The official key is A.',
      narration: 'The radius is four over two pi, so the volume is two hundred and sixteen over pi. Divide by the cube and the ratio is one over pi. The official key is A.',
      keyword: 'one over pi',
      trap: 'Using the circumference as if it were the radius multiplies the volume by four and gives four over pi, which is offered as an option.'
    },

    /* ---------------- scene 6: stat ---------------- */
    {
      id: 'st-1', scene: 'stat', start: 150, end: 157.5,
      caption: 'Ten numbers. Sort them first: the median is a position in the sorted list, not a value you can see in the original order.',
      detail: 'The sample is nine, eighteen, eleven, fourteen, fifteen, seventeen, ten, sixty-nine, eleven, thirteen. Sorted it is nine, ten, eleven, eleven, thirteen, fourteen, fifteen, seventeen, eighteen, sixty-nine. Nothing about the median can be read off the unsorted list.',
      narration: 'Ten numbers. Sort them first, because the median is a position in the sorted list, not a value you can see in the original order.',
      keyword: 'sort them first',
      trap: 'The middle of the given order is not the median. Only the sorted middle is.'
    },
    {
      id: 'st-2', scene: 'stat', start: 157.5, end: 165,
      caption: 'With ten values there is no middle one, so the median is the average of the fifth and sixth: thirteen point five.',
      detail: 'An even count puts the median halfway between the two central values. Here those are thirteen and fourteen, so the median is thirteen point five. The official key for GATE CSE 2024 Set 1 GA Question 3 is A, which is this value.',
      narration: 'With ten values there is no middle one, so the median is the average of the fifth and sixth. Thirteen and fourteen give thirteen point five, and the official key is A.',
      keyword: 'thirteen point five',
      trap: 'Taking the fifth value and stopping gives thirteen, which is not the median of an even sample.'
    },
    {
      id: 'st-3', scene: 'stat', start: 165, end: 172.5,
      caption: 'The mean is eighteen point seven, because sixty-nine pulls it up. The median did not move.',
      detail: 'The sum is one hundred and eighty-seven and there are ten values, so the mean is eighteen point seven. Remove the sixty-nine and the mean falls to about thirteen point one, while the median barely changes. That difference is what makes the median the resistant measure.',
      narration: 'The sum is one hundred and eighty-seven over ten, so the mean is eighteen point seven. Remove the sixty-nine and the mean falls to thirteen point one, while the median barely moves.',
      keyword: 'eighteen point seven',
      trap: 'A mean above the median does not mean the data are wrong. It means the data lean right.'
    },
    {
      id: 'st-4', scene: 'stat', start: 172.5, end: 180,
      caption: 'Five of the ten values lie above the median: exactly half, and never more.',
      detail: 'This is the one statement about mean and median that is always true, and GATE CSE 2023 GA Question 4 asked for exactly it: at most half the candidates have a score larger than the median. The same claim is false for the mean, and a sample can be built to show it.',
      narration: 'Five of the ten values lie above the median, exactly half and never more. That statement is true of every sample, and it is what GATE 2023 asked about the median.',
      keyword: 'never more than half',
      trap: 'The same sentence with the word mean in place of median is false, and there are samples that prove it.'
    },

    /* ---------------- scene 7: prob ---------------- */
    {
      id: 'pr-1', scene: 'prob', start: 180, end: 187.5,
      caption: 'At least one head in three tosses. Counting the cases directly means listing eight outcomes.',
      detail: 'Three tosses have two outcomes each, so the sample space has eight equally likely outcomes. Listing them is not laziness; on a sample this small, listing is the fastest exact method and it makes the complement visible.',
      narration: 'At least one head in three tosses. Three tosses have two outcomes each, so there are eight equally likely outcomes, and listing them makes the complement visible.',
      keyword: 'eight outcomes',
      trap: 'Equally likely is an assumption. It holds for a fair coin and it must be stated.'
    },
    {
      id: 'pr-2', scene: 'prob', start: 187.5, end: 195,
      caption: 'The complement is one case, three tails, so the answer is one minus one eighth.',
      detail: 'At least one head fails in exactly one outcome, the one with no heads at all. So the probability is one minus one eighth. The complement works because the two events are exhaustive and disjoint: something either has a head or it does not.',
      narration: 'The complement is the single outcome with three tails, so the answer is one minus one eighth, which is seven eighths. The complement works because the two cases are exhaustive and disjoint.',
      keyword: 'one minus one eighth',
      trap: 'Adding three separate probabilities of a head on each toss gives three halves, which is not a probability at all.'
    },
    {
      id: 'pr-3', scene: 'prob', start: 195, end: 202.5,
      caption: 'Seven eighths. The complement turned eight cases into one.',
      detail: 'The saving is the whole point: instead of checking seven outcomes, you check the one that fails. On a question with twenty tosses the direct count is a million cases and the complement is one.',
      narration: 'Seven eighths. The complement turned eight cases into one, and on a larger question it turns a million cases into one.',
      keyword: 'turned eight cases into one',
      trap: 'The complement of at least one is none, not exactly one.'
    },
    {
      id: 'pr-4', scene: 'prob', start: 202.5, end: 210,
      caption: 'In a bag of five red and three blue, two drawn without replacement: twenty-five over twenty-eight have at least one red.',
      detail: 'There are twenty-eight pairs in all, from eight objects taken two at a time. Both blue happens in three of them, from three objects taken two at a time. So at least one red is one minus three over twenty-eight, which is twenty-five over twenty-eight. The page enumerates all twenty-eight pairs rather than trusting the formula.',
      narration: 'A bag of five red and three blue, two drawn without replacement. Twenty-eight pairs in all, three of them both blue, so twenty-five over twenty-eight have at least one red. The page enumerates all twenty-eight.',
      keyword: 'twenty-five over twenty-eight',
      trap: 'Without replacement changes the second draw. With replacement the answer would be one minus nine over sixty-four.'
    },

    /* ---------------- scene 8: series ---------------- */
    {
      id: 'se-1', scene: 'series', start: 210, end: 217.5,
      caption: 'Each term is the sum of the two before it. Given the sixth and seventh, run the recurrence backwards.',
      detail: 'The relation is F of n plus one equals F of n plus F of n minus one, which is a rule for going up. Read as a subtraction it is equally a rule for going down: the term two below is the upper term minus the lower one.',
      narration: 'Each term is the sum of the two before it. Given the sixth and seventh, run the recurrence backwards: the term two below is the upper term minus the lower one.',
      keyword: 'run it backwards',
      trap: 'A recurrence is not a closed formula. Going backwards is exact because the relation is a bijection between consecutive pairs.'
    },
    {
      id: 'se-2', scene: 'series', start: 217.5, end: 225,
      caption: 'Subtract: the fifth term is sixty minus thirty-seven, twenty-three.',
      detail: 'Thirty-seven plus the fifth term is sixty, so the fifth term is twenty-three. Nothing else is needed, and no pattern has to be guessed. This is the difference between a recurrence question and a series question of the difference-table kind.',
      narration: 'Thirty-seven plus the fifth term is sixty, so the fifth term is twenty-three. No pattern has to be guessed, because the rule is given.',
      keyword: 'twenty-three',
      trap: 'Guessing a ratio, as in a geometric series, is wrong here: the rule is additive.'
    },
    {
      id: 'se-3', scene: 'series', start: 225, end: 232.5,
      caption: 'Then fourteen, then nine, then five, then four. The first term is four.',
      detail: 'Each step subtracts the lower from the upper: twenty-three minus nine is fourteen, fourteen minus five is nine, nine minus four is five, five minus one is four. The answer to GATE CSE 2023 GA Question 3 is four, and the official key marks option A.',
      narration: 'Twenty-three minus nine is fourteen, then nine, then five, then four. The first term is four, and the official key marks option A.',
      keyword: 'the first term is four',
      trap: 'Five is the second term, not the first. Off-by-one is the trap in every backwards series.'
    },
    {
      id: 'se-4', scene: 'series', start: 232.5, end: 240,
      caption: 'Forward again: four, five, nine, fourteen, twenty-three, thirty-seven, sixty. That is the check.',
      detail: 'A backwards derivation is only safe if you run it forward once. The page does that, and the two given terms come out exactly. The check costs ten seconds and removes the off-by-one risk entirely.',
      narration: 'Forward again: four, five, nine, fourteen, twenty-three, thirty-seven, sixty. That is the check, and it costs ten seconds.',
      keyword: 'that is the check',
      trap: 'Never submit a backwards series answer without one forward pass.'
    },

    /* ---------------- scene 9: est ---------------- */
    {
      id: 'es-1', scene: 'est', start: 240, end: 247.5,
      caption: 'Two to the tenth is one thousand and twenty-four, so ten doublings are about three decimal digits.',
      detail: 'This single fact is the most useful number in the whole section. It converts a question about powers of two into a question about decimal size, and it is why a binary search on a thousand items takes about ten steps.',
      narration: 'Two to the tenth is one thousand and twenty-four, so ten doublings are about three decimal digits. This is the most useful single number in the section.',
      keyword: 'ten doublings',
      trap: 'Two to the tenth is a thousand, not exactly a thousand. The error is two point four per cent and it compounds.'
    },
    {
      id: 'es-2', scene: 'est', start: 247.5, end: 255,
      caption: 'That is why log base ten of one thousand is about three: a factor of a thousand is ten doublings.',
      detail: 'Taking logarithms base ten counts decimal digits, and each ten doublings adds three of them. So two to the twentieth is about a million, two to the thirtieth about a billion. A question that asks for the size of two to the hundredth wants one significant figure, not a hundred digits.',
      narration: 'Log base ten of a thousand is about three, because a factor of a thousand is ten doublings. Two to the twentieth is about a million, two to the thirtieth about a billion.',
      keyword: 'counts decimal digits',
      trap: 'Estimating does not excuse a wrong order of magnitude. It is the order of magnitude that is being asked for.'
    },
    {
      id: 'es-3', scene: 'est', start: 255, end: 262.5,
      caption: 'Five per cent growth doubles in about fourteen years: one point zero five to the fourteenth is one point nine eight.',
      detail: 'Compounding is multiplication, so it is repeated doubling in disguise. One point zero five raised to the fourteenth power is one point nine eight, just short of two, and the fifteenth passes it. The page computes both powers rather than quoting a rule.',
      narration: 'Five per cent growth doubles in about fourteen years. One point zero five to the fourteenth is one point nine eight, just short of two, and the fifteenth passes it.',
      keyword: 'doubles in about fourteen years',
      trap: 'Five per cent of the original, added fourteen times, gives seventy per cent, not a hundred. Compounding is the difference.'
    },
    {
      id: 'es-4', scene: 'est', start: 262.5, end: 270,
      caption: 'The rule of seventy-two says seventy-two divided by five, fourteen point four. Estimation names the size; exact work names the digits.',
      detail: 'The rule of seventy-two is the doubling time in years for a growth rate of r per cent: seventy-two over r. It is an approximation, accurate near eight per cent, and it is enough to choose between four options that differ by a factor of two. Use it to eliminate, then compute exactly if two options survive.',
      narration: 'The rule of seventy-two gives seventy-two over five, fourteen point four years. Estimation names the size, and exact work names the digits. Use the first to eliminate, the second to decide.',
      keyword: 'use it to eliminate',
      trap: 'Seventy-two is for growth rates near eight per cent. At one per cent a year the true doubling time is about seventy years, and the rule says seventy-two.'
    },

    /* ---------------- scene 10: proc ---------------- */
    {
      id: 'pc-1', scene: 'proc', start: 270, end: 276,
      caption: 'Step one: name the base, and write the total it is a base of.',
      detail: 'Every percentage, share and ratio in the question is a fraction of one stated total. Write that total down before touching a calculator, and write down what it is a total of. Most wrong options in this section are correct arithmetic on the wrong base.',
      narration: 'Step one: name the base, and write the total it is a base of. Every percentage in the question is a fraction of one stated total, and most wrong options are correct arithmetic on the wrong base.',
      keyword: 'name the base',
      trap: 'A base you did not write down is a base you will change halfway through.'
    },
    {
      id: 'pc-2', scene: 'proc', start: 276, end: 282,
      caption: 'Step two: write the chain with its units, and cancel them before you compute.',
      detail: 'Percent times total gives the amount; amount divided by a rate gives the count. Write the three units in a row. If the last one is not the unit the question asked for, the chain is wrong, and no amount of arithmetic will fix it.',
      narration: 'Step two: write the chain with its units, and cancel them before you compute. If the last unit is not the one the question asked for, the chain is wrong.',
      keyword: 'cancel them',
      trap: 'A chain that produces the right number in the wrong unit is still wrong.'
    },
    {
      id: 'pc-3', scene: 'proc', start: 282, end: 288,
      caption: 'Step three: for a shape, find the quantity that is conserved, and the one power that connects the rest.',
      detail: 'Area is conserved when a sheet is rolled; volume is what changes. A side to a surface goes by squaring, a side to a volume by cubing. Name which length the question gives you before you substitute, because the edge that becomes the circumference is the whole question.',
      narration: 'Step three: for a shape, find the conserved quantity and the power that connects the rest. Area survives rolling, volume does not. Name which length you were given.',
      keyword: 'the quantity that is conserved',
      trap: 'A circumference is not a radius, and a diameter is not a radius. Both mistakes are offered as options.'
    },
    {
      id: 'pc-4', scene: 'proc', start: 288, end: 294,
      caption: 'Step four: sort before you take a median, and count before you take a probability.',
      detail: 'Median needs the sorted order; mean needs only the sum, which is why one large value moves the mean and not the median. Probability on a small space is a count, and counting the complement is usually the shorter count. Say which measure the question named.',
      narration: 'Step four: sort before you take a median, and count before you take a probability. Median needs order, mean needs only the sum, and the complement is usually the shorter count.',
      keyword: 'sort before you take a median',
      trap: 'An even sample has no middle element. Averaging the two central ones is part of the definition.'
    },
    {
      id: 'pc-5', scene: 'proc', start: 294, end: 300,
      caption: 'Step five: estimate first, compute second, and check the answer against the estimate.',
      detail: 'Ten doublings are three digits; seventy-two over the rate is the doubling time. An estimate that disagrees with your computed answer by a factor of ten means an arithmetic slip, and finding that in five seconds is worth more than any amount of practice volume.',
      narration: 'Step five: estimate first, compute second, and check the answer against the estimate. A factor of ten between them means an arithmetic slip, and five seconds of checking finds it.',
      keyword: 'estimate first',
      trap: 'An unchecked answer and a guessed answer look identical on the sheet.'
    }
  ]
};
