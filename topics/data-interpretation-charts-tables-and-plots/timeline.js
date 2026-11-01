/* ==========================================================================
   data-interpretation-charts-tables-and-plots — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   captions.vtt, captions.srt and transcript.md are derived from this file by
   tools/gen-captions.mjs — never edited by hand.

   Every number quoted in a caption is computed by the model in lesson.js and
   printed on the canvas, so the two agree by construction.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'chain', n: 1,
      title: 'A data set is four steps, not a reading',
      start: 0, end: 30,
      objective: 'Turn one table of four departments over three years into a settled procedure: read the units, locate the two cells, compute one ratio, then check the direction against the question.'
    },
    {
      id: 'share', n: 2,
      title: 'A share is a part over its own total',
      start: 30, end: 60,
      objective: 'Compute the share of one department in one year, and see that the denominator is that year\u2019s total and not the grand total of the whole table.'
    },
    {
      id: 'pie', n: 3,
      title: 'A pie is a share turned into an angle',
      start: 60, end: 90,
      objective: 'Convert each 2025 share into degrees, check that the four angles sum to 360, and see why a pie can never show an amount.'
    },
    {
      id: 'rate', n: 4,
      title: 'A rate of change needs a base, and a sign',
      start: 90, end: 120,
      objective: 'Compute the three-year growth of every department from its own 2023 value, and read the minus sign as a fall rather than as a small rise.'
    },
    {
      id: 'points', n: 5,
      title: 'Percentage points are not per cent',
      start: 120, end: 150,
      objective: 'Separate a change of 11.64 percentage points from a change of 32.0 per cent, and see which one the question is asking for.'
    },
    {
      id: 'flip', n: 6,
      title: '"More than" and "less than" use different bases',
      start: 150, end: 180,
      objective: 'Compute 80 per cent more and 44.44 per cent less from the same two numbers, and see that the base flips when the direction flips.'
    },
    {
      id: 'average', n: 7,
      title: 'Averaging percentages is not averaging',
      start: 180, end: 210,
      objective: 'Average the four growth rates and get 3.61 per cent, then compute the same growth from the totals and get 13.64 per cent, and see which one the data set actually grew by.'
    },
    {
      id: 'estimate', n: 8,
      title: 'Estimate, then state the band',
      start: 210, end: 240,
      objective: 'Replace 190 over 700 by a convenient fraction, and bound the error so that an approximate answer can still be defended.'
    },
    {
      id: 'display', n: 9,
      title: 'The same numbers, three displays',
      start: 240, end: 270,
      objective: 'See a zero-based bar chart and a truncated one draw the identical data at a visual ratio of 6 to 1 and 31 to 1, and see what a stacked bar hides.'
    },
    {
      id: 'routine', n: 10,
      title: 'The routine and the four traps',
      start: 270, end: 300,
      objective: 'Leave with a three-line routine that produces an answer from any chart, and the four slips that produce a wrong one.'
    }
  ],

  events: [

    /* ---------- scene 1: chain ---------- */
    { id: 's1-1', scene: 'chain', start: 0, end: 7.5,
      caption: 'One table, three years, four departments. Data interpretation asks one question of it: which two cells, and which ratio between them.',
      detail: 'A data set in a GATE aptitude question is small on purpose. Here it is four departments and three years, twelve numbers and three totals. Every question that can be asked of it is a ratio between two of those numbers, or between two sums of them. So the work is not arithmetic practice; it is deciding which two numbers the sentence names.',
      narration: 'One table, three years, four departments. Data interpretation asks one question of it: which two cells, and which ratio between them.',
      keyword: 'which two cells' },

    { id: 's1-2', scene: 'chain', start: 7.5, end: 15,
      caption: 'Step one: read the axes and the units. Intake is a count of students, the years are the columns, the departments are the rows.',
      detail: 'Most lost marks in this section come from reading the wrong row, the wrong column or the wrong unit, not from a wrong calculation. Before any number is used, say out loud what the rows are, what the columns are, and what the entries are counted in. A table whose entries are percentages is read completely differently from a table whose entries are counts.',
      narration: 'Step one: read the axes and the units. Intake is a count of students, the years are the columns, the departments are the rows.',
      keyword: 'read the axes and the units' },

    { id: 's1-3', scene: 'chain', start: 15, end: 22.5,
      caption: 'Step two: locate the two cells the sentence names, and build the total you need if it is not printed.',
      detail: 'The row totals are 660, 700 and 750. They are not printed in the table, so they are built: 240 + 180 + 150 + 90 = 660 for 2023, and so on. A total that the question needs and the table does not print is part of the work, and forgetting it is the most common cause of a wrong denominator.',
      narration: 'Step two: locate the two cells the sentence names, and build the total you need if it is not printed.',
      keyword: 'build the total' },

    { id: 's1-4', scene: 'chain', start: 22.5, end: 30,
      caption: 'Step three: one ratio. Step four: check the direction — is the answer a share, a rate, a comparison, or an average?',
      detail: 'The four questions this section asks are a share, a rate of change, a comparison between two values, and an average of several values. They use the same twelve numbers and give four different answers. Naming which of the four the sentence wants, before computing, is what stops a right calculation from being attached to the wrong question.',
      narration: 'Step three: one ratio. Step four: check the direction, because a share, a rate, a comparison and an average are four different answers from the same twelve numbers.',
      keyword: 'four different answers' },

    /* ---------- scene 2: share ---------- */
    { id: 's2-1', scene: 'share', start: 30, end: 37.5,
      caption: 'What share of the 2025 intake was CSE? The part is 360. The total is that year\u2019s 750, not the table\u2019s 2,110.',
      detail: 'The phrase "of the 2025 intake" fixes the denominator. 360 over 750 is 0.48. The grand total of the whole table, 660 + 700 + 750 = 2,110, is the answer to a different question — what share of all three years together — and gives 17.06 per cent. Both divisions are correct arithmetic; only one answers the sentence.',
      narration: 'What share of the 2025 intake was CSE? The part is 360. The total is that year\u2019s 750, not the table\u2019s 2,110.',
      keyword: 'that year\u2019s 750' },

    { id: 's2-2', scene: 'share', start: 37.5, end: 45,
      caption: '360 over 750 is 0.48, so 48.0 per cent. The four shares of 2025 are 48.0, 26.67, 17.33 and 8.0, and they sum to 100.',
      detail: 'CSE 360 of 750 is 48.0 per cent. ECE 200 of 750 is 26.67 per cent. ME 130 of 750 is 17.33 per cent. CE 60 of 750 is 8.0 per cent. Four shares of one total must sum to 100 per cent, and these do. That sum is a free check on every share question, and it costs one addition.',
      narration: '360 over 750 is 0.48, so 48.0 per cent. The four shares of 2025 are 48.0, 26.67, 17.33 and 8.0, and they sum to 100.',
      keyword: 'sum to 100' },

    { id: 's2-3', scene: 'share', start: 45, end: 52.5,
      caption: 'A share is silent about size: 8 per cent of 750 is 60 students, and 8 per cent of a class of 50 is 4. The percentage is the same.',
      detail: 'Because a share divides the part by its own total, the total cancels out. Two departments in two colleges can both be 8 per cent while one is sixty students and the other is four. A question that asks "which is larger" is asking for an amount, and a share cannot answer it without the total being supplied.',
      narration: 'A share is silent about size. Eight per cent of 750 is 60 students, and eight per cent of a class of 50 is four. The percentage is the same.',
      keyword: 'silent about size' },

    { id: 's2-4', scene: 'share', start: 52.5, end: 60,
      caption: 'So: the denominator is the phrase after "of". Say it before dividing, and the share question cannot go wrong.',
      detail: 'The single habit that settles every share question is to finish the sentence "as a share of ___" with the words from the question before touching the numbers. "Of the 2025 intake" gives 750. "Of the three-year total" gives 2,110. "Of CSE" gives 360, which is the answer to a comparison question and not a share at all.',
      narration: 'So the denominator is the phrase after "of". Say it before dividing, and the share question cannot go wrong.',
      keyword: 'the phrase after "of"' },

    /* ---------- scene 3: pie ---------- */
    { id: 's3-1', scene: 'pie', start: 60, end: 67.5,
      caption: 'A pie draws each share as a slice of 360 degrees. CSE\u2019s 48 per cent becomes 172.8 degrees.',
      detail: 'A full turn is 360 degrees, so a share of s per cent occupies 3.6 s degrees. CSE 48 per cent gives 172.8 degrees, a little under half the circle. The multiplication is a change of units, not a new idea: the pie carries exactly the same information as the four percentages.',
      narration: 'A pie draws each share as a slice of 360 degrees. CSE at 48 per cent becomes 172.8 degrees.',
      keyword: '172.8 degrees' },

    { id: 's3-2', scene: 'pie', start: 67.5, end: 75,
      caption: 'The four slices are 172.8, 96.0, 62.4 and 28.8 degrees, and they sum to 360 exactly — the same check as before, in degrees.',
      detail: 'ECE 26.67 per cent gives 96.0 degrees, a clean quarter. ME 17.33 per cent gives 62.4 degrees. CE 8.0 per cent gives 28.8 degrees. 172.8 + 96.0 + 62.4 + 28.8 = 360.0. If a pie question gives you three angles and one blank, this sum is the fastest route to the fourth.',
      narration: 'The four slices are 172.8, 96.0, 62.4 and 28.8 degrees, and they sum to 360 exactly.',
      keyword: 'sum to 360' },

    { id: 's3-3', scene: 'pie', start: 75, end: 82.5,
      caption: 'But two pies with the same shares and different totals look identical. Only the total printed beside the pie tells you the amounts.',
      detail: '2023 and 2025 have different totals, 660 and 750, and different shares. A pie for each would differ. Now take two years with the same shares but totals 750 and 1,500: the pies are pixel-identical while every amount has doubled. That is why every pie in a question carries its total, and why a pie alone can never answer "how many".',
      narration: 'But two pies with the same shares and different totals look identical. Only the total printed beside the pie tells you the amounts.',
      keyword: 'look identical' },

    { id: 's3-4', scene: 'pie', start: 82.5, end: 90,
      caption: 'So: a pie answers "what fraction", never "how many". Multiply the share by the printed total when the question asks for an amount.',
      detail: 'A question that says "the number of students in CSE in 2025, as shown by the pie" wants 0.48 times 750, which is 360, and the pie alone cannot produce it. The conversion in the other direction — angle to amount — is the same multiplication, because the angle already encodes the share.',
      narration: 'So a pie answers what fraction, never how many. Multiply the share by the printed total when the question asks for an amount.',
      keyword: 'never how many' },

    /* ---------- scene 4: rate ---------- */
    { id: 's4-1', scene: 'rate', start: 90, end: 97.5,
      caption: 'A rate of change is a difference over the value it started from: new minus old, divided by old.',
      detail: 'Growth is (new − old) / old. The subtraction gives the change in the same units as the data; the division by the old value turns that change into a fraction of where it started. Dividing by the new value instead is the most common single error in this section, and it is invisible when the numbers are close.',
      narration: 'A rate of change is a difference over the value it started from: new minus old, divided by old.',
      keyword: 'divided by old' },

    { id: 's4-2', scene: 'rate', start: 97.5, end: 105,
      caption: 'CSE 240 to 360 is 120 over 240, which is 50.0 per cent. ECE 180 to 200 is 20 over 180, which is 11.11 per cent.',
      detail: 'CSE gained 120 students on a base of 240, so 0.5, that is 50.0 per cent. ECE gained 20 on a base of 180, so 11.11 per cent. The same kind of change, two very different rates, because the bases differ. A growth rate is always a statement about the base as much as about the change.',
      narration: 'CSE from 240 to 360 is 120 over 240, which is 50 per cent. ECE from 180 to 200 is 20 over 180, which is 11.11 per cent.',
      keyword: '50.0 per cent' },

    { id: 's4-3', scene: 'rate', start: 105, end: 112.5,
      caption: 'ME 150 to 130 is minus 13.33 per cent and CE 90 to 60 is minus 33.33 per cent. A minus sign is a fall, not a small rise.',
      detail: 'ME lost 20 on a base of 150, so −13.33 per cent. CE lost 30 on a base of 90, so −33.33 per cent. The sign is part of the answer. An option written as "13.33 per cent" beside an option written as "−13.33 per cent" is testing whether the direction was read, and a fall of 20 from 150 can never be reported as a rise.',
      narration: 'ME from 150 to 130 is minus 13.33 per cent, and CE from 90 to 60 is minus 33.33 per cent. A minus sign is a fall, not a small rise.',
      keyword: 'a minus sign is a fall' },

    { id: 's4-4', scene: 'rate', start: 112.5, end: 120,
      caption: 'The total went 660 to 750, which is 13.64 per cent — and the parts sum to that: plus 120, plus 20, minus 20, minus 30 is plus 90.',
      detail: 'The changes are additive in students even though the rates are not: 120 + 20 − 20 − 30 = 90, and 660 + 90 = 750. So the total rises by 90 on a base of 660, which is 13.64 per cent. Note what this means: a total can rise while three of its four parts fall, because one part rose more than the other three lost.',
      narration: 'The total went from 660 to 750, which is 13.64 per cent, and the parts sum to it: plus 120, plus 20, minus 20, minus 30 is plus 90.',
      keyword: 'parts sum to that' },

    /* ---------- scene 5: points ---------- */
    { id: 's5-1', scene: 'points', start: 120, end: 127.5,
      caption: 'CSE\u2019s share rose from 240 of 660, which is 36.36 per cent, to 360 of 750, which is 48.00 per cent.',
      detail: 'Both numbers are shares of their own year. 240 over 660 is 0.363636, that is 36.36 per cent. 360 over 750 is 0.48. Comparing two shares is legitimate; comparing a share with an amount is not, and the two look alike on the page because both are three-digit numbers.',
      narration: 'CSE\u2019s share rose from 240 of 660, which is 36.36 per cent, to 360 of 750, which is 48 per cent.',
      keyword: '36.36 per cent' },

    { id: 's5-2', scene: 'points', start: 127.5, end: 135,
      caption: 'The difference is 11.64 percentage points. That is a subtraction of two percentages, and it is a change in points, not a change in per cent.',
      detail: '48.00 − 36.36 = 11.64. The unit of that number is percentage points, because it is the difference between two quantities that were themselves percentages. Saying "the share rose by 11.64 per cent" is a different claim from "the share rose by 11.64 percentage points", and only one of them is true here.',
      narration: 'The difference is 11.64 percentage points. That is a subtraction of two percentages, and it is a change in points, not a change in per cent.',
      keyword: 'percentage points' },

    { id: 's5-3', scene: 'points', start: 135, end: 142.5,
      caption: 'As a per cent of the old share, the same move is 11.64 over 36.36, which is 32.0 per cent. Two true answers, two different questions.',
      detail: 'A rise from 36.36 per cent to 48.00 per cent is a rise of 11.64 points. As a fraction of where it started, it is 11.64 / 36.36 = 0.32, that is 32.0 per cent. Both statements describe the same movement. A question that says "by how many percentage points" wants 11.64; one that says "by what per cent" wants 32.0.',
      narration: 'As a per cent of the old share, the same move is 11.64 over 36.36, which is 32 per cent. Two true answers, two different questions.',
      keyword: '32.0 per cent' },

    { id: 's5-4', scene: 'points', start: 142.5, end: 150,
      caption: 'So: points subtract, per cent divides. Read which word the option uses before choosing between 11.64 and 32.0.',
      detail: 'The two numbers differ by a factor of nearly three, so a guess between them is a coin toss with the wrong coin. The rule is mechanical: if the quantity is already a percentage and the question asks how much it moved, subtract and answer in points; if the question asks how much it moved relative to where it was, divide by the old percentage and answer in per cent.',
      narration: 'So points subtract and per cent divides. Read which word the option uses before choosing between 11.64 and 32.',
      keyword: 'points subtract, per cent divides' },

    /* ---------- scene 6: flip ---------- */
    { id: 's6-1', scene: 'flip', start: 150, end: 157.5,
      caption: 'In 2025, CSE is 360 and ECE is 200. CSE is 160 more than ECE, on a base of 200, so 80 per cent more.',
      detail: 'The comparison "CSE against ECE" uses ECE as the base: (360 − 200) / 200 = 0.8, that is 80 per cent more. The base is the thing being compared against, which is the second name in the sentence, not the first. Reading the sentence backwards is what turns 80 into 44.44.',
      narration: 'In 2025, CSE is 360 and ECE is 200. CSE is 160 more than ECE, on a base of 200, so 80 per cent more.',
      keyword: '80 per cent more' },

    { id: 's6-2', scene: 'flip', start: 157.5, end: 165,
      caption: 'Turn the sentence round: ECE is 160 less than CSE, on a base of 360, so 44.44 per cent less.',
      detail: 'Now the base is CSE: (360 − 200) / 360 = 0.4444, that is 44.44 per cent less. The two statements are both true and they are not symmetric. A 25 per cent rise followed by a 20 per cent fall returns to the starting value, and no single percentage can describe both directions.',
      narration: 'Turn the sentence round: ECE is 160 less than CSE, on a base of 360, so 44.44 per cent less.',
      keyword: '44.44 per cent less' },

    { id: 's6-3', scene: 'flip', start: 165, end: 172.5,
      caption: 'Check by going back: 200 times 1.8 is 360, and 360 times 0.5556 is 200. The ratio 1.8 is the same both ways; the percentages are not.',
      detail: 'A ratio has no direction: 360 / 200 = 1.8, and that single number answers both questions once you know which way you are travelling. The percentage is the ratio with one side subtracted and a base divided in, so it does carry a direction. Multiplying back is the check: 200 × 1.8 = 360 and 360 × (1 − 0.4444) = 200.',
      narration: 'Check by going back: 200 times 1.8 is 360, and 360 times 0.5556 is 200. The ratio 1.8 is the same both ways; the percentages are not.',
      keyword: 'the ratio 1.8' },

    { id: 's6-4', scene: 'flip', start: 172.5, end: 180,
      caption: 'So: the base is the word after "than". "More than ECE" divides by 200; "less than CSE" divides by 360.',
      detail: 'This single rule covers the whole family of comparison questions, including the ones phrased as "how many times" or "what per cent of". "What per cent of ECE is CSE" wants 180 per cent, a ratio, with no subtraction at all — which is a third answer to the same pair of numbers.',
      narration: 'So the base is the word after than. More than ECE divides by 200; less than CSE divides by 360.',
      keyword: 'the word after "than"' },

    /* ---------- scene 7: average ---------- */
    { id: 's7-1', scene: 'average', start: 180, end: 187.5,
      caption: 'The four growth rates are plus 50.0, plus 11.11, minus 13.33 and minus 33.33 per cent. Their plain average is 3.61 per cent.',
      detail: 'Add the four and divide by four: (50 + 11.11 − 13.33 − 33.33) / 4 = 14.44 / 4 = 3.61 per cent. The arithmetic is correct. The interpretation is what fails, because the four rates are computed on four different bases of 240, 180, 150 and 90, and a plain average pretends the bases are equal.',
      narration: 'The four growth rates are plus 50, plus 11.11, minus 13.33 and minus 33.33 per cent. Their plain average is 3.61 per cent.',
      keyword: '3.61 per cent' },

    { id: 's7-2', scene: 'average', start: 187.5, end: 195,
      caption: 'But the data set grew from 660 to 750, which is 13.64 per cent. The plain average of the parts is not the growth of the whole.',
      detail: '90 new students on a base of 660 is 13.64 per cent. So the table grew at 13.64 per cent while the average of its four growth rates is 3.61 per cent. Neither number is a mistake; they answer different questions, and a question about "the overall growth" wants the second one.',
      narration: 'But the data set grew from 660 to 750, which is 13.64 per cent. The plain average of the parts is not the growth of the whole.',
      keyword: '13.64 per cent' },

    { id: 's7-3', scene: 'average', start: 195, end: 202.5,
      caption: 'Weighted by the 2023 counts, the same four rates give 13.64 per cent exactly — because a weighted average of growth rates is the growth of the total.',
      detail: 'Weight each rate by the base it was computed on: 240×50 + 180×11.11 + 150×(−13.33) + 90×(−33.33), all divided by 660. The numerator is 12,000 + 2,000 − 2,000 − 3,000 = 9,000, and 9,000 / 660 = 13.64 per cent — the same number the two totals gave. The weighting restores what the plain average threw away: how large each base was.',
      narration: 'Weighted by the 2023 counts, the same four rates give 13.64 per cent exactly, because a weighted average of growth rates is the growth of the total.',
      keyword: 'weighted by the 2023 counts' },

    { id: 's7-4', scene: 'average', start: 202.5, end: 210,
      caption: 'So: average rates only with weights. If the question asks for the growth of the whole, use the two totals and divide once.',
      detail: 'There are two safe routes and one unsafe one. Safe: weight each rate by its base, or compute the growth from the totals directly. Unsafe: add the rates and divide by how many there are. The unsafe route is only correct when every base is equal, which is a special case worth naming rather than assuming.',
      narration: 'So average rates only with weights. If the question asks for the growth of the whole, use the two totals and divide once.',
      keyword: 'only with weights' },

    /* ---------- scene 8: estimate ---------- */
    { id: 's8-1', scene: 'estimate', start: 210, end: 217.5,
      caption: 'What share of the 2024 intake was ECE? 190 over 700. That is 27.14 per cent, and the options are 26, 27, 28 and 30.',
      detail: '190 / 700 = 0.271428..., that is 27.14 per cent. The exact answer is not among the options, so the question is asking for the nearest. Reading it as 190 over 700 = 19 over 70, and 19 over 70 is a little more than 19 over 76 = 0.25 and a little less than 21 over 70 = 0.30, narrows it to 27 without a calculator.',
      narration: 'What share of the 2024 intake was ECE? 190 over 700. That is 27.14 per cent, and the options are 26, 27, 28 and 30.',
      keyword: '27.14 per cent' },

    { id: 's8-2', scene: 'estimate', start: 217.5, end: 225,
      caption: 'Round the fraction, not the answer: 190 over 700 is 19 over 70, and 19 over 70 sits between 0.25 and 0.30, closer to 0.27.',
      detail: 'Cancelling the zero first keeps the numbers small enough to reason about. 19 / 70 = 0.2714. One half of 70 is 35, one quarter is 17.5, so 19 is just above a quarter — 0.25 plus 1.5 over 70, that is 0.271. The estimate and the exact value agree to two decimal places, and the reasoning needed no division.',
      narration: 'Round the fraction, not the answer: 190 over 700 is 19 over 70, and 19 over 70 sits between 0.25 and 0.30, closer to 0.27.',
      keyword: 'round the fraction' },

    { id: 's8-3', scene: 'estimate', start: 225, end: 232.5,
      caption: 'State the band: 27 per cent is 0.14 points low, which is about one student in 700. The estimate is safe.',
      detail: '27 per cent of 700 is 189, and the true value is 190, so the estimate is one student out of seven hundred. Reporting the band — "27 per cent, within about 0.15 points" — is what makes an approximate answer defensible rather than lucky. An estimate with no band is a guess that happened to land.',
      narration: 'State the band: 27 per cent is 0.14 points low, which is about one student in 700. The estimate is safe.',
      keyword: 'state the band' },

    { id: 's8-4', scene: 'estimate', start: 232.5, end: 240,
      caption: 'So: cancel zeros, compare against one half and one quarter, then say how far off you are. Never round the inputs before deciding what the question asks.',
      detail: 'Rounding inputs early is a different operation from estimating the answer, and it can change which option is nearest. Estimate the quotient from a simplified fraction and keep the band in mind; round the inputs only when the question itself says the figures are approximate.',
      narration: 'So cancel zeros, compare against one half and one quarter, then say how far off you are. Never round the inputs before deciding what the question asks.',
      keyword: 'never round the inputs' },

    /* ---------- scene 9: display ---------- */
    { id: 's9-1', scene: 'display', start: 240, end: 247.5,
      caption: 'Two bars for 2025: CSE 360 and CE 60. Drawn from zero, the heights are in the ratio 6 to 1.',
      detail: 'A bar chart encodes a value as a length from a common origin. From zero, the CSE bar is six times the CE bar, which is the true ratio of the amounts. This is the only version of the chart in which the visual comparison is also a numerical comparison.',
      narration: 'Two bars for 2025: CSE 360 and CE 60. Drawn from zero, the heights are in the ratio 6 to 1.',
      keyword: 'ratio 6 to 1' },

    { id: 's9-2', scene: 'display', start: 247.5, end: 255,
      caption: 'Now start the axis at 50 instead of zero: the bars are 310 and 10, a visual ratio of 31 to 1, and the data has not changed.',
      detail: 'Truncating the axis subtracts the same constant from both bars, which is exactly the operation that destroys a ratio. 310 / 10 = 31. The chart now says "thirty-one times" about a pair of numbers whose ratio is six. A truncated axis is common in newspapers and rare in GATE papers, but a question can ask you to spot it, and the arithmetic above is the test.',
      narration: 'Now start the axis at 50 instead of zero: the bars are 310 and 10, a visual ratio of 31 to 1, and the data has not changed.',
      keyword: 'a visual ratio of 31 to 1' },

    { id: 's9-3', scene: 'display', start: 255, end: 262.5,
      caption: 'A stacked bar shows parts of one total. ME\u2019s segment falls from 150 to 130, but its share falls further, from 22.73 to 17.33 per cent.',
      detail: 'In 2023 the stack is 660 tall and ME occupies 150 of it, which is 22.73 per cent. In 2025 the stack is 750 tall and ME occupies 130, which is 17.33 per cent. The segment height fell by 13.33 per cent while the share fell by 5.39 points, that is 23.73 per cent of its old share — because the total grew underneath it.',
      narration: 'A stacked bar shows parts of one total. ME\u2019s segment falls from 150 to 130, but its share falls further, from 22.73 to 17.33 per cent.',
      keyword: 'because the total grew' },

    { id: 's9-4', scene: 'display', start: 262.5, end: 270,
      caption: 'So: read the axis before comparing bars, and read the total before comparing segments. Grouped bars compare parts; stacked bars compare wholes.',
      detail: 'A grouped bar chart puts each department side by side within a year, so heights compare directly across departments. A stacked bar chart puts them end to end, so only the segments within one bar are comparable, and only after the total is known. A line or 2-D plot adds the same caution about its vertical scale, and a map adds a legend: the shade means a band of values, never a point value.',
      narration: 'So read the axis before comparing bars, and read the total before comparing segments. Grouped bars compare parts; stacked bars compare wholes.',
      keyword: 'read the axis' },

    /* ---------- scene 10: routine ---------- */
    { id: 's10-1', scene: 'routine', start: 270, end: 277.5,
      caption: 'The routine, three lines: name the four quantities the sentence contains; write the ratio in words; substitute and simplify.',
      detail: 'Line one: from the question sentence, list the quantities — the part, the base, the year, the unit. Line two: write the ratio as words before numbers, "part over that year\u2019s total", "new minus old over old", "this minus that over that". Line three: substitute the two numbers and simplify by cancelling. Writing the ratio in words is what makes the denominator a decision rather than a reflex.',
      narration: 'The routine, three lines: name the four quantities the sentence contains; write the ratio in words; substitute and simplify.',
      keyword: 'write the ratio in words' },

    { id: 's10-2', scene: 'routine', start: 277.5, end: 285,
      caption: 'Trap one: the wrong denominator. Trap two: points read as per cent. Both are caught by the words in line two.',
      detail: 'The wrong denominator gives 17.06 where 48.0 was wanted, and reading points as per cent gives 11.64 where 32.0 was wanted. Neither error is arithmetic; both are a ratio written in numbers before it was written in words. That is why line two exists.',
      narration: 'Trap one, the wrong denominator. Trap two, points read as per cent. Both are caught by the words in line two.',
      keyword: 'the wrong denominator' },

    { id: 's10-3', scene: 'routine', start: 285, end: 292.5,
      caption: 'Trap three: a plain average of rates. Trap four: a bar read without its axis. Both are caught by one question each.',
      detail: 'Before averaging rates, ask whether the bases were equal; if they were not, weight them or use the totals. Before comparing two bars, ask where the axis starts; if it does not start at zero, subtract the start from both heights before comparing. One question each, and both traps close.',
      narration: 'Trap three, a plain average of rates. Trap four, a bar read without its axis. Both are caught by one question each.',
      keyword: 'one question each' },

    { id: 's10-4', scene: 'routine', start: 292.5, end: 300,
      caption: 'And the free checks: shares sum to 100, angles sum to 360, changes sum to the total change. Three additions that catch most wrong answers.',
      detail: 'Each check costs one addition and each one tests a different part of the work. Shares of one total must sum to 100, which catches a wrong denominator. Pie angles must sum to 360, which catches a share converted wrongly. The parts\u2019 changes must sum to the total change, which catches a change computed on the wrong base. A wrong answer that survives all three is rare.',
      narration: 'And the free checks: shares sum to 100, angles sum to 360, changes sum to the total change. Three additions that catch most wrong answers.',
      keyword: 'the free checks' }
  ]
};
