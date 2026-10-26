/* ==========================================================================
   greedy-algorithms - THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs - never edited by hand.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'what',
      n: 1,
      title: 'What "greedy" promises, and what it does not',
      start: 0, end: 30,
      objective: 'Separate the three claims that get confused: greedy makes a locally best choice, it never takes that choice back, and it is correct only when a proof says so.'
    },
    {
      id: 'coins',
      n: 2,
      title: 'Greed is not always right: the coin counterexample',
      start: 30, end: 60,
      objective: 'Watch largest-coin-first fail on the coin set 1, 3, 4 for the amount 6, and name the property that is missing.'
    },
    {
      id: 'activity',
      n: 3,
      title: 'Activity selection: sorting by finish time',
      start: 60, end: 90,
      objective: 'Run the earliest-finish rule on eleven intervals, see which are kept and which are rejected, and count the result.'
    },
    {
      id: 'rules',
      n: 4,
      title: 'Why earliest finish, and not the two rules that look right',
      start: 90, end: 120,
      objective: 'Refute shortest-first and earliest-start-first with two small instances, and see that the correct criterion is a claim that needs proof.'
    },
    {
      id: 'exchange',
      n: 5,
      title: 'The exchange argument, drawn',
      start: 120, end: 150,
      objective: 'See the proof shape: take any optimal solution, find the first place it differs from greedy, swap that one choice, and show nothing breaks.'
    },
    {
      id: 'fractional',
      n: 6,
      title: 'Fractional knapsack: greed on a ratio',
      start: 150, end: 180,
      objective: 'Fill a knapsack by value per unit weight, take a fraction of the last item, and see why divisibility is what makes the exchange step work.'
    },
    {
      id: 'knapsack01',
      n: 7,
      title: 'The same instance, one word changed, greed loses',
      start: 180, end: 210,
      objective: 'Run the identical ratio rule on 0/1 knapsack and get 160 where the optimum is 220, then say exactly which step of the proof fails.'
    },
    {
      id: 'huffman',
      n: 8,
      title: 'Huffman coding: merge the two lightest',
      start: 210, end: 240,
      objective: 'Build a Huffman tree by repeatedly merging the two smallest weights, and read the cost off the merges rather than off the leaves.'
    },
    {
      id: 'decide',
      n: 9,
      title: 'The decision procedure: five questions',
      start: 240, end: 270,
      objective: 'Use a fixed five-question order to decide whether a new problem is greedy, dynamic programming, or greedy but only approximately optimal.'
    },
    {
      id: 'table',
      n: 10,
      title: 'One table to hold: problem, criterion, cost, proof',
      start: 270, end: 300,
      objective: 'Hold six greedy problems against their greedy criterion, their running time and the shape of their correctness proof.'
    }
  ],

  events: [

    /* ---------------- scene 1: what greedy promises ---------------- */
    {
      id: 'what-1', start: 0, end: 7.5, scene: 'what',
      caption: 'A greedy algorithm builds a solution one piece at a time, and at each step takes the piece that looks best right now.',
      detail: 'The pieces are the decisions the problem allows. At every step the algorithm compares the available choices by a rule it has fixed in advance, takes the winner, and moves on. Nothing about the future enters the comparison.',
      keyword: 'the piece that looks best right now',
      trap: 'The rule is fixed in advance, not chosen to suit the input. A procedure that tries one rule and then another has stopped being a single greedy algorithm and needs a proof that covers both.',
      narration: 'A greedy algorithm builds a solution one piece at a time, and at each step takes the piece that looks best right now.'
    },
    {
      id: 'what-2', start: 7.5, end: 15, scene: 'what',
      caption: 'The second half of the promise: the choice is never taken back. No backtracking, no trying the alternative.',
      detail: 'That is what makes greedy fast. Every step commits, so the running time is usually one sort plus one pass. Dynamic programming buys correctness by keeping the alternatives; greedy buys speed by throwing them away.',
      keyword: 'never taken back',
      trap: '"Greedy" is not a synonym for "fast" and not a synonym for "optimal". It names a shape of algorithm. Whether that shape is correct is a separate question with a separate proof.',
      narration: 'The second half of the promise: the choice is never taken back. No backtracking, no trying the alternative.'
    },
    {
      id: 'what-3', start: 15, end: 22.5, scene: 'what',
      caption: 'Two properties are needed for a correct greedy algorithm: optimal substructure, and the greedy-choice property.',
      detail: 'Optimal substructure means an optimal solution contains optimal solutions to the subproblems that remain after a choice. The greedy-choice property means there is always an optimal solution that agrees with the choice greedy makes first. The first property is shared with dynamic programming; the second is what greedy needs and DP does not.',
      keyword: 'optimal substructure, and the greedy-choice property',
      trap: 'Optimal substructure alone does not license a greedy algorithm. Knapsack has optimal substructure and still defeats greedy, which is the whole of scene 7.',
      narration: 'Two properties are needed for a correct greedy algorithm: optimal substructure, and the greedy-choice property.'
    },
    {
      id: 'what-4', start: 22.5, end: 30, scene: 'what',
      caption: 'So the exam question is never "is this greedy?" It is "is this greedy choice provably safe, and on which instances?"',
      detail: 'A correct answer names the criterion, the property that makes the criterion safe, and the condition under which the property holds. For fractional knapsack the condition is divisibility; for Dijkstra it is non-negative weights; for Kruskal it is the cut property of spanning trees.',
      keyword: 'provably safe, and on which instances',
      trap: 'An answer that says "greedy works because it is optimal" is circular. The marks are for the exchange step, or for the one-line counterexample that kills the claim.',
      narration: 'So the exam question is never, is this greedy. It is, is this greedy choice provably safe, and on which instances.'
    },

    /* ---------------- scene 2: the coin counterexample ---------------- */
    {
      id: 'coins-1', start: 30, end: 37.5, scene: 'coins',
      caption: 'Making change: pay 6 units using as few coins as possible from the set 1, 3 and 4.',
      detail: 'The set is the input, and the amount is the target. The objective is the number of coins, not their total value, which is fixed at 6 whatever you do. This is an optimisation problem with a numerical objective, so greedy is allowed to apply in principle.',
      keyword: 'as few coins as possible',
      trap: 'Do not confuse "fewest coins" with "largest coins". The largest-coin rule is one candidate criterion, and scene 2 exists to show it is the wrong one here.',
      narration: 'Making change: pay 6 units using as few coins as possible from the set 1, 3 and 4.'
    },
    {
      id: 'coins-2', start: 37.5, end: 45, scene: 'coins',
      caption: 'Greedy takes the largest coin that fits: 4, leaving 2. Then 1, then 1. Three coins.',
      detail: 'At each step the largest usable coin is 4, then 1, then 1. The algorithm stops when the remainder is zero, and it never revisits the choice of 4 even though that choice is what forced two single coins.',
      keyword: '4, leaving 2',
      trap: 'The trace is not an error in the algorithm. Largest-coin-first is exactly this. The error is believing that this rule is optimal for every coin set.',
      narration: 'Greedy takes the largest coin that fits: 4, leaving 2. Then 1, then 1. Three coins.'
    },
    {
      id: 'coins-3', start: 45, end: 52.5, scene: 'coins',
      caption: 'Two coins of 3 also pay 6. The optimum is 2, so this greedy rule is not optimal on this set.',
      detail: 'The comparison is not against another greedy run but against the best possible answer, which here is easy to find by hand: 3 plus 3. Two is less than three, so the greedy answer is wrong on this instance.',
      keyword: 'The optimum is 2',
      trap: 'One counterexample is enough to refute a claimed greedy algorithm. No number of instances where it happens to work can establish that it always works.',
      narration: 'Two coins of 3 also pay 6. The optimum is 2, so this greedy rule is not optimal on this set.'
    },
    {
      id: 'coins-4', start: 52.5, end: 60, scene: 'coins',
      caption: 'With coins 1, 2 and 5 the same rule is optimal, and with 1, 3 and 4 it is not. Correctness is a property of the pair: rule and instance family.',
      detail: 'For the Indian and most decimal currency systems the largest-coin rule is optimal, which is why the everyday habit feels safe. Change the set and the guarantee disappears, so a question must name the set before the answer can be "greedy is correct".',
      keyword: 'a property of the pair',
      trap: '"Greedy fails for coin change" is too strong a conclusion. It fails for some sets and succeeds for others. The exam-safe statement is that greedy has no general guarantee here, so DP is the safe method.',
      narration: 'With coins 1, 2 and 5 the same rule is optimal, and with 1, 3 and 4 it is not. Correctness is a property of the pair: rule and instance family.'
    },

    /* ---------------- scene 3: activity selection ---------------- */
    {
      id: 'activity-1', start: 60, end: 67.5, scene: 'activity',
      caption: 'Eleven activities, each an interval from a start time to a finish time. One room. Choose as many non-overlapping activities as possible.',
      detail: 'Two activities are compatible when one finishes no later than the other starts. Intervals are treated as half-open, so an activity ending at 5 and one starting at 5 do not conflict. The objective is the count of chosen activities, not the total time used.',
      keyword: 'as many non-overlapping activities as possible',
      trap: 'Maximising the number of activities is not the same as maximising the time the room is busy. A schedule of many short activities can cover less time than one long activity.',
      narration: 'Eleven activities, each an interval from a start time to a finish time. One room. Choose as many non-overlapping activities as possible.'
    },
    {
      id: 'activity-2', start: 67.5, end: 75, scene: 'activity',
      caption: 'Sort by finish time. That is the only preparation the algorithm needs.',
      detail: 'The sort is the whole of the setup: after it, the greedy pass is a single left-to-right scan. Sorting costs n log n comparisons, which dominates the linear scan, so the algorithm is n log n overall.',
      keyword: 'Sort by finish time',
      trap: 'The sort key is finish time, not start time and not duration. Sorting by start time gives the earliest-start rule of scene 4, which is refuted there.',
      narration: 'Sort by finish time. That is the only preparation the algorithm needs.'
    },
    {
      id: 'activity-3', start: 75, end: 82.5, scene: 'activity',
      caption: 'Take the first activity, then walk right and keep an activity exactly when its start is at or after the last finish taken.',
      detail: 'Activity a1 runs from 1 to 4, so the last finish becomes 4. a2 starts at 3 and is rejected, a3 starts at 0 and is rejected, a4 starts at 5 and is kept, and the last finish becomes 7. The scan never looks back.',
      keyword: 'at or after the last finish taken',
      trap: 'The comparison is against the last activity taken, not against all activities taken. Keeping the running finish time is what makes the scan linear instead of quadratic.',
      narration: 'Take the first activity, then walk right and keep an activity exactly when its start is at or after the last finish taken.'
    },
    {
      id: 'activity-4', start: 82.5, end: 90, scene: 'activity',
      caption: 'The greedy answer is a1, a4, a8, a11: four activities. An exhaustive search over all subsets confirms that four is the maximum.',
      detail: 'The page enumerates every subset of the eleven activities, checks compatibility, and finds that the largest compatible family has size four. Greedy reached four, so greedy is optimal on this instance. That is evidence, not a proof.',
      keyword: 'four activities',
      trap: 'Matching the optimum on one instance proves nothing in general. Scene 5 supplies the proof; this scene only supplies the check.',
      narration: 'The greedy answer is a1, a4, a8, a11: four activities. An exhaustive search over all subsets confirms that four is the maximum.'
    },

    /* ---------------- scene 4: the two rules that look right ---------------- */
    {
      id: 'rules-1', start: 90, end: 97.5, scene: 'rules',
      caption: 'Three criteria look reasonable: shortest activity first, earliest start first, earliest finish first. Only the third is safe.',
      detail: 'All three are greedy algorithms, all three are fast, and all three can be implemented in a few lines. The difference is not speed or elegance but whether an exchange argument closes.',
      keyword: 'Only the third is safe',
      trap: 'A criterion that gives the right answer on the textbook instance is not thereby correct. Both wrong rules below agree with the right one on many inputs.',
      narration: 'Three criteria look reasonable: shortest activity first, earliest start first, earliest finish first. Only the third is safe.'
    },
    {
      id: 'rules-2', start: 97.5, end: 105, scene: 'rules',
      caption: 'Shortest first fails: with the long activities 0 to 5 and 5 to 10 plus a short one from 4 to 6, greedy takes the short one and stops at one activity.',
      detail: 'The short activity 4 to 6 straddles the boundary at 5, so taking it rules out both long activities, which are compatible with each other. Greedy returns one activity, and the optimum is two. The page enumerates all eight subsets of this three-activity instance and finds exactly one compatible pair.',
      keyword: 'the short one blocks both others',
      trap: 'This is the standard trap in the topic: a locally small choice can be globally expensive, because the cost of a choice is the space it occupies, not its length.',
      narration: 'Shortest first fails. The short activity blocks the two long ones, so greedy returns one activity where two are possible.'
    },
    {
      id: 'rules-3', start: 105, end: 112.5, scene: 'rules',
      caption: 'Earliest start fails on the eleven-activity instance itself: activity a3 starts at 0 and runs to 6, and that single choice leaves only three activities where four are possible.',
      detail: 'The earliest-start rule takes a3 at time 0, then cannot take a1, a2, a4, a5 or a6, and ends with a3, a7, a11. Three activities. The earliest-finish rule on the same input gets four. Same input, different criterion, different count.',
      keyword: 'three activities where four are possible',
      trap: 'This refutation uses the very instance scene 3 used, so the two scenes cannot both be satisfied by the earliest-start rule. That is the point of showing them on one picture.',
      narration: 'Earliest start fails on the eleven-activity instance itself: activity a3 starts at zero and runs to six, and that single choice leaves only three activities where four are possible.'
    },
    {
      id: 'rules-4', start: 112.5, end: 120, scene: 'rules',
      caption: 'Earliest finish is safe because finishing early cannot reduce what remains. That sentence is the intuition; scene 5 turns it into an argument.',
      detail: 'Every activity compatible with a later-finishing choice is also compatible with an earlier-finishing one, provided the earlier one also starts after the same boundary. That one-directional containment is the whole reason the rule survives while the other two do not.',
      keyword: 'finishing early cannot reduce what remains',
      trap: 'An intuition is not a proof. The exam wants the exchange step, and the intuition alone earns nothing on a proof-based question.',
      narration: 'Earliest finish is safe because finishing early cannot reduce what remains. That sentence is the intuition; the next scene turns it into an argument.'
    },

    /* ---------------- scene 5: the exchange argument ---------------- */
    {
      id: 'exchange-1', start: 120, end: 127.5, scene: 'exchange',
      caption: 'An exchange argument compares the greedy solution with an arbitrary optimal one, and swaps one choice at a time until they agree.',
      detail: 'The argument is a transformation, not a computation. You are not running anything; you are showing that a solution which disagrees with greedy can always be edited into one that agrees without losing quality.',
      keyword: 'swaps one choice at a time',
      trap: 'The argument must start from an arbitrary optimal solution, not from the greedy one. Starting from greedy and arguing it is optimal is assuming the conclusion.',
      narration: 'An exchange argument compares the greedy solution with an arbitrary optimal one, and swaps one choice at a time until they agree.'
    },
    {
      id: 'exchange-2', start: 127.5, end: 135, scene: 'exchange',
      caption: 'Let the optimal solution be S star, and let g be the activity greedy takes first. If g is already in S star, there is nothing to do.',
      detail: 'The first case is the easy one. The work is entirely in the second case, and that case is where the finish-time ordering earns its place.',
      keyword: 'If g is already in S star',
      trap: 'A proof that only handles the easy case is not a proof. The exam mark lives in the case where the two solutions differ.',
      narration: 'Let the optimal solution be S star, and let g be the activity greedy takes first. If g is already in S star, there is nothing to do.'
    },
    {
      id: 'exchange-3', start: 135, end: 142.5, scene: 'exchange',
      caption: 'If not, let s be the first activity of S star. Greedy chose g because g finishes no later than s. Replace s by g.',
      detail: 'The replacement keeps the size of S star unchanged at k. It keeps every other activity of S star compatible, because g finishes earlier than s did, so anything that started after s finished also starts after g finishes. So the edited set is still a feasible solution of the same size, hence still optimal.',
      keyword: 'Replace s by g',
      trap: 'Both facts are needed: same size, and still feasible. Same size alone would allow an overlapping set, and feasible alone would allow a smaller one.',
      narration: 'If not, let s be the first activity of S star. Greedy chose g because g finishes no later than s. Replace s by g.'
    },
    {
      id: 'exchange-4', start: 142.5, end: 150, scene: 'exchange',
      caption: 'Now an optimal solution agrees with greedy on the first choice, so the remaining problem is the same shape and smaller. Induct on the number of activities.',
      detail: 'The subproblem after taking g is the set of activities that start at or after the finish of g, which is strictly smaller. The same argument applies to it, so by induction greedy is optimal on every instance. This is the complete proof for activity selection.',
      keyword: 'the same shape and smaller',
      trap: 'The induction needs the subproblem to be an instance of the same problem, which it is here. For a problem where it is not, the greedy proof needs a different tool, and that gap is exactly where greedy claims usually break.',
      narration: 'Now an optimal solution agrees with greedy on the first choice, so the remaining problem is the same shape and smaller. Induct on the number of activities.'
    },

    /* ---------------- scene 6: fractional knapsack ---------------- */
    {
      id: 'fractional-1', start: 150, end: 157.5, scene: 'fractional',
      caption: 'Fractional knapsack: a bag of capacity 50, and three items whose fractions may be taken.',
      detail: 'Item I1 weighs 10 and is worth 60, I2 weighs 20 and is worth 100, I3 weighs 30 and is worth 120. Because any fraction of an item may be taken, the choice is a real number between 0 and 1 for each item, not a yes or no.',
      keyword: 'whose fractions may be taken',
      trap: 'The word "fractional" is the entire licence for greedy here. Nothing else about the problem changes in scene 7, and greedy stops being optimal.',
      narration: 'Fractional knapsack: a bag of capacity 50, and three items whose fractions may be taken.'
    },
    {
      id: 'fractional-2', start: 157.5, end: 165, scene: 'fractional',
      caption: 'The greedy criterion is value per unit weight: 6, 5 and 4. Sort descending, then fill.',
      detail: 'Dividing value by weight turns a two-number comparison into a one-number comparison, which is what a greedy rule needs. I1 gives 6 per unit, I2 gives 5, I3 gives 4, so the order is I1, I2, I3.',
      keyword: 'value per unit weight',
      trap: 'Sorting by total value instead gives the order I3, I2, I1 and is not optimal. The ratio, not the value and not the weight, is the criterion.',
      narration: 'The greedy criterion is value per unit weight: 6, 5 and 4. Sort descending, then fill.'
    },
    {
      id: 'fractional-3', start: 165, end: 172.5, scene: 'fractional',
      caption: 'Take I1 whole for 60 and 10 units of weight, I2 whole for 100 and 20 more. Capacity used is 30, so 20 remain.',
      detail: 'The running total after two items is 160 in value and 30 in weight. The algorithm has spent no decisions on the future, and it has not looked at I3 yet.',
      keyword: '20 remain',
      trap: 'The order of the two whole items is forced by the sort, so there is nothing to optimise in this step. All the freedom lives in the last item.',
      narration: 'Take I1 whole for 60 and 10 units of weight, I2 whole for 100 and 20 more. Capacity used is 30, so 20 remain.'
    },
    {
      id: 'fractional-4', start: 172.5, end: 180, scene: 'fractional',
      caption: 'I3 does not fit whole, so take two thirds of it for 80. Total 240, and the exchange argument works because a fraction can always be trimmed.',
      detail: 'The optimum is 240, and it is attainable by greedy. The exchange step here is: if an optimal solution takes a fraction of a lower-ratio item while a higher-ratio item is not full, move value from the lower to the higher without changing weight, which can only help.',
      keyword: 'take two thirds of it for 80',
      trap: 'At most one item is ever taken partially, and it is the last one reached. A solution with two partial items is not what this greedy produces.',
      narration: 'I3 does not fit whole, so take two thirds of it for 80. Total 240, and the exchange argument works because a fraction can always be trimmed.'
    },

    /* ---------------- scene 7: 0/1 knapsack ---------------- */
    {
      id: 'knapsack01-1', start: 180, end: 187.5, scene: 'knapsack01',
      caption: 'Same bag, same capacity, same three items. One word changes: each item is taken whole or not at all.',
      detail: 'The objective and the constraint are unchanged. Only the allowed values of the decision change, from the interval 0 to 1 to the pair 0 and 1. That single restriction is enough to destroy the greedy proof.',
      keyword: 'whole or not at all',
      trap: 'Students often remember "knapsack is DP". The correct statement is narrower: the 0/1 version needs DP, the fractional version does not.',
      narration: 'Same bag, same capacity, same three items. One word changes: each item is taken whole or not at all.'
    },
    {
      id: 'knapsack01-2', start: 187.5, end: 195, scene: 'knapsack01',
      caption: 'Ratio order is still I1 then I2 then I3. Greedy takes I1 and I2 for 160, and I3 no longer fits.',
      detail: 'Weight used is 30 of 50, value 160. The remaining 20 units cannot hold I3, which weighs 30, and greedy has no second chance at the space it left idle.',
      keyword: 'Greedy takes I1 and I2 for 160',
      trap: 'The idle 20 units are the visible symptom. In the fractional version the same 20 units were filled, which is why the two versions part company here.',
      narration: 'Ratio order is still I1 then I2 then I3. Greedy takes I1 and I2 for 160, and I3 no longer fits.'
    },
    {
      id: 'knapsack01-3', start: 195, end: 202.5, scene: 'knapsack01',
      caption: 'I2 and I3 together weigh exactly 50 and are worth 220. Greedy is off by 60.',
      detail: 'The page runs the standard DP table over all capacities and confirms 220 as the maximum. The gap is not a tie and not a rounding effect: 60 is a real loss, and the ratio rule cannot see it because it never compares a combination against a combination.',
      keyword: 'worth 220',
      trap: 'Do not describe this as greedy being "slightly suboptimal". Greedy can be arbitrarily far from optimal on 0/1 knapsack, and no small tweak to the ratio rule fixes it in general.',
      narration: 'I2 and I3 together weigh exactly 50 and are worth 220. Greedy is off by 60.'
    },
    {
      id: 'knapsack01-4', start: 202.5, end: 210, scene: 'knapsack01',
      caption: 'The exchange step fails because a whole item cannot be trimmed to fill the gap. Divisibility was load-bearing.',
      detail: 'In the fractional proof you could move value between items in arbitrarily small amounts. Here the smallest move is a whole item, so an exchange that improves the objective may not exist. The greedy-choice property is simply false for this problem.',
      keyword: 'Divisibility was load-bearing',
      trap: 'Optimal substructure still holds for 0/1 knapsack, so the failure is not structural. It is the greedy-choice property that fails, and naming the right one of the two properties is worth marks.',
      narration: 'The exchange step fails because a whole item cannot be trimmed to fill the gap. Divisibility was load-bearing.'
    },

    /* ---------------- scene 8: Huffman ---------------- */
    {
      id: 'huffman-1', start: 210, end: 217.5, scene: 'huffman',
      caption: 'Huffman coding: give frequent symbols short codes, and keep the code prefix-free so decoding is unambiguous.',
      detail: 'A prefix-free code is a binary tree with symbols at the leaves. The cost of the tree is the sum over symbols of frequency times depth. Building the cheapest such tree is the optimisation problem, and greedy solves it exactly.',
      keyword: 'keep the code prefix-free',
      trap: 'The objective is total bits, which equals frequency times depth summed. Minimising the average code length and minimising the total bits are the same objective, scaled.',
      narration: 'Huffman coding: give frequent symbols short codes, and keep the code prefix-free so decoding is unambiguous.'
    },
    {
      id: 'huffman-2', start: 217.5, end: 225, scene: 'huffman',
      caption: 'Start with one leaf per symbol. Repeatedly merge the two lightest nodes into a parent whose weight is their sum.',
      detail: 'The parent is not a symbol; it is a group of symbols that will share a common prefix. Merging is the greedy choice, and the criterion is smallest weight, which is the same as least frequent.',
      keyword: 'merge the two lightest nodes',
      trap: 'After each merge the new parent goes back into the pool and can be merged again. Forgetting to reinsert the parent is the most common hand-execution error.',
      narration: 'Start with one leaf per symbol. Repeatedly merge the two lightest nodes into a parent whose weight is their sum.'
    },
    {
      id: 'huffman-3', start: 225, end: 232.5, scene: 'huffman',
      caption: 'Each merge adds one internal node. The total cost equals the sum of all internal node weights, so you can add the merges and never draw the tree.',
      detail: 'Every leaf contributes its frequency once per level it climbs, and it climbs one level per merge it takes part in. Summing the merge weights therefore counts each leaf exactly depth-many times, which is exactly the cost.',
      keyword: 'the sum of all internal node weights',
      trap: 'This identity is a derivation, not a convention, and it is the fastest way to answer a cost question. It fails if you add the leaf weights instead of the merge weights.',
      narration: 'Each merge adds one internal node. The total cost equals the sum of all internal node weights, so you can add the merges and never draw the tree.'
    },
    {
      id: 'huffman-4', start: 232.5, end: 240, scene: 'huffman',
      caption: 'On frequencies 1, 2, 2, 2, 3 the merges cost 3, 4, 6 and 10, so the encoded message is 23 bits. Greedy, and optimal.',
      detail: 'This is the string aabbccddeee, whose letter frequencies are 1, 2, 2, 2 and 3. Adding the merge weights gives 23, which is the minimum encoded length. The proof is again an exchange argument on the two lightest symbols.',
      keyword: 'the encoded message is 23 bits',
      trap: 'Different valid Huffman trees can exist for the same frequencies when weights tie, and they all have the same cost. A question that asks for the code may have several right answers; one that asks for the length does not.',
      narration: 'On frequencies 1, 2, 2, 2, 3 the merges cost 3, 4, 6 and 10, so the encoded message is 23 bits. Greedy, and optimal.'
    },

    /* ---------------- scene 9: the decision procedure ---------------- */
    {
      id: 'decide-1', start: 240, end: 247.5, scene: 'decide',
      caption: 'Question one: is there an exchange argument, or only a counterexample? Try to break the rule on a small instance first.',
      detail: 'Spend one minute looking for a counterexample before spending ten minutes on a proof. A single small instance that defeats the rule settles the question, and the exam usually supplies one if the rule is wrong.',
      keyword: 'Try to break the rule',
      trap: 'Failing to find a counterexample is not evidence of correctness. It only means you have not found one yet, which is why the proof step cannot be skipped.',
      narration: 'Question one: is there an exchange argument, or only a counterexample? Try to break the rule on a small instance first.'
    },
    {
      id: 'decide-2', start: 247.5, end: 255, scene: 'decide',
      caption: 'Question two: are the choices indivisible? If they are, suspect that greedy fails and that DP is needed.',
      detail: 'Indivisibility is the single most reliable warning sign. Whole items, whole coins, whole edges chosen without fractions, whole vertices visited once: each of these can defeat an exchange that would otherwise close.',
      keyword: 'are the choices indivisible',
      trap: 'Indivisibility is a warning, not a verdict. Kruskal chooses whole edges and is still optimal, because spanning trees have the matroid structure that restores the exchange property.',
      narration: 'Question two: are the choices indivisible? If they are, suspect that greedy fails and that DP is needed.'
    },
    {
      id: 'decide-3', start: 255, end: 262.5, scene: 'decide',
      caption: 'Question three: does the problem have overlapping subproblems? If yes and there is no proof, DP is the safe route.',
      detail: 'Overlapping subproblems are what make DP worth its table. If the subproblems do not overlap, divide and conquer is the right frame. If they do overlap and no exchange argument exists, DP is the only correct answer among the three techniques.',
      keyword: 'overlapping subproblems',
      trap: 'Greedy and DP share optimal substructure, so "it has optimal substructure" never decides between them. Overlap plus the absence of a greedy proof is what decides.',
      narration: 'Question three: does the problem have overlapping subproblems? If yes and there is no proof, DP is the safe route.'
    },
    {
      id: 'decide-4', start: 262.5, end: 270, scene: 'decide',
      caption: 'Questions four and five: what exactly does the rule sort on, and what is the resulting running time? Name the criterion out loud before computing anything.',
      detail: 'The criterion is a phrase, such as earliest finish time or value per unit weight, and it must be stated precisely enough to sort by. The running time is then one sort plus one pass, or a heap of size n with n extractions, and the two cases differ.',
      keyword: 'Name the criterion out loud',
      trap: 'Vague criteria lose marks and produce wrong traces. "Pick the best one" is not a criterion; "pick the one with the smallest finish time among those compatible with the last chosen" is.',
      narration: 'Questions four and five: what exactly does the rule sort on, and what is the resulting running time? Name the criterion out loud before computing anything.'
    },

    /* ---------------- scene 10: the table ---------------- */
    {
      id: 'table-1', start: 270, end: 277.5, scene: 'table',
      caption: 'Six greedy problems, six criteria: earliest finish, value per weight, two lightest, lightest edge, nearest unfinalised vertex, highest profit first.',
      detail: 'Activity selection, fractional knapsack, Huffman coding, Kruskal, Dijkstra and unit-time job sequencing. Each is a different rule, and each rule was chosen because its exchange argument closes.',
      keyword: 'six criteria',
      trap: 'The criteria are not interchangeable. Applying the value-per-weight rule to activity selection, or the earliest-finish rule to knapsack, produces a wrong algorithm that still looks greedy.',
      narration: 'Six greedy problems, six criteria: earliest finish, value per weight, two lightest, lightest edge, nearest unfinalised vertex, highest profit first.'
    },
    {
      id: 'table-2', start: 277.5, end: 285, scene: 'table',
      caption: 'Costs: n log n for the three sorting-based ones, E log E for Kruskal, and n squared for the simple slot scan in job sequencing.',
      detail: 'The sort dominates wherever a sort is needed. Huffman uses a heap of n nodes with n minus one extractions, so it is also n log n. Job sequencing with a linear scan for a free slot is n squared, and a disjoint-set version improves it.',
      keyword: 'n log n for the three sorting-based ones',
      trap: 'Kruskal is E log E, not V log V, and Dijkstra with a binary heap is E log V. Quoting a running time without saying which data structure produced it is an incomplete answer.',
      narration: 'Costs: n log n for the three sorting-based ones, E log E for Kruskal, and n squared for the simple slot scan in job sequencing.'
    },
    {
      id: 'table-3', start: 285, end: 292.5, scene: 'table',
      caption: 'Proofs: every one of them is an exchange argument, and each one names the fact that makes the swap safe.',
      detail: 'For activity selection it is that an earlier finish cannot conflict with more. For fractional knapsack it is that a fraction can be trimmed. For Huffman it is that the two lightest symbols can always be siblings at maximum depth. For MSTs it is the cut property.',
      keyword: 'every one of them is an exchange argument',
      trap: 'A proof that says "by induction" without the swap step is incomplete. The swap is the content; the induction is only the bookkeeping.',
      narration: 'Proofs: every one of them is an exchange argument, and each one names the fact that makes the swap safe.'
    },
    {
      id: 'table-4', start: 292.5, end: 300, scene: 'table',
      caption: 'The rule to carry out of this lesson: greedy is a claim about a criterion, not a technique you apply and hope.',
      detail: 'Ask what the criterion is, on which instances it is safe, and what the exchange step is. If any of the three cannot be answered, the honest answer is that greedy is not established for this problem, and DP is the fallback.',
      keyword: 'greedy is a claim about a criterion',
      trap: 'The most expensive mistake in this topic is answering "greedy" to a question that asked for the correct technique on 0/1 knapsack. The second is forgetting that fractional knapsack is greedy and 0/1 is not.',
      narration: 'The rule to carry out of this lesson: greedy is a claim about a criterion, not a technique you apply and hope.'
    }
  ]
};
