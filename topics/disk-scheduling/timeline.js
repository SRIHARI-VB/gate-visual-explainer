/* ==========================================================================
   disk-scheduling - THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs - never edited by hand.

   Every number quoted in a caption is computed by the model in lesson.js and
   printed on the canvas; the two agree because both read the same simulation.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'geom',
      n: 1,
      title: 'A stack of tracks, and the three parts of one access',
      start: 0, end: 30,
      objective: 'Name the coordinate a disk scheduler actually moves, and split one disk access into seek time, rotational latency and transfer time so the part a scheduler can change is visible.'
    },
    {
      id: 'fcfs',
      n: 2,
      title: 'First Come First Served: 640 cylinders of travel',
      start: 30, end: 60,
      objective: 'Read a head-movement profile for FCFS on a fixed request queue, sum the absolute differences, and say what FCFS buys with its long travel.'
    },
    {
      id: 'sstf',
      n: 3,
      title: 'SSTF: nearest first, 236 cylinders, and starvation',
      start: 60, end: 90,
      objective: 'Run SSTF on the same queue, compute 236, and see why the greedy nearest-first rule can postpone a request indefinitely.'
    },
    {
      id: 'greedy',
      n: 4,
      title: 'SSTF is greedy, and greedy is not optimal',
      start: 90, end: 120,
      objective: 'Show with a four-request counterexample that SSTF can travel 139 cylinders where another order travels 118, so nearest-first is not a proof of minimality.'
    },
    {
      id: 'scan',
      n: 5,
      title: 'SCAN: the elevator, and the trip to the end',
      start: 120, end: 150,
      objective: 'Trace SCAN upward from the head to the physical end of the disk and back, compute 331, and identify the cylinders of travel that served no request.'
    },
    {
      id: 'cscan',
      n: 6,
      title: 'C-SCAN: return without servicing, 382 cylinders',
      start: 150, end: 180,
      objective: 'Compute C-SCAN cost as the climb to the end, the full-range jump and the climb after it, and state what the jump buys in exchange for its movement.'
    },
    {
      id: 'look',
      n: 7,
      title: 'LOOK and C-LOOK: reverse at the last request',
      start: 180, end: 210,
      objective: 'Distinguish SCAN from LOOK by where the head reverses, compute 299 and 322 on the same queue, and reproduce GATE 2016 Set 1 C-LOOK = 346.'
    },
    {
      id: 'gate2015',
      n: 8,
      title: 'The GATE 2015 comparison: 130 against 140',
      start: 210, end: 240,
      objective: 'Reproduce GATE CSE 2015 Set 1 Q30 from the paper wording: SSTF 130, SCAN toward 100 gives 140, the difference is 10, and LOOK would have given 120.'
    },
    {
      id: 'costmodel',
      n: 9,
      title: 'When movement is not the whole cost',
      start: 240, end: 270,
      objective: 'Convert movement into time and into power, reproduce GATE CSE 2018 Set 1 SSTF = 85 mW from 200 cylinders and 3 reversals, and see why the metric changes the answer.'
    },
    {
      id: 'recipe',
      n: 10,
      title: 'The procedure, and the five traps',
      start: 270, end: 300,
      objective: 'Fix a five-step procedure that works for every disk-scheduling question, and name the five traps that cost marks: the end visit, the direction, the jump, the units and ties.'
    }
  ],

  events: [
    /* ---------------- scene 1: geometry and access time ---------------- */
    {
      id: 'gm-1', start: 0, end: 10, scene: 'geom',
      caption: 'A disk is a stack of concentric tracks, and one arm reads all of them.',
      detail: 'Data lives on concentric circles called tracks; a track is divided into sectors. The set of tracks at one arm position is a cylinder, and cylinders are numbered from 0 at the outer edge to the last number at the inner edge. A request names a block, and the block maps to one cylinder. So the only coordinate the scheduler moves is the cylinder number, which is why every disk-scheduling question is a question about numbers on a line.',
      keyword: 'one arm reads all of them',
      trap: 'Reading the platter or sector number as something the head moves to. The head moves in cylinders only; sector and platter are reached by waiting for the rotation and by switching heads.',
      narration: 'A disk is a stack of concentric tracks, and one arm reads all of them.'
    },
    {
      id: 'gm-2', start: 10, end: 20, scene: 'geom',
      caption: 'One access costs seek + rotational latency + transfer: 10 + 4.17 + 0.04 ms.',
      detail: 'Seek time is the arm moving to the right cylinder. At a stated 0.1 ms per cylinder, a 100-cylinder move costs 10 ms. Rotational latency is waiting for the sector to arrive under the head; at 7200 rpm one rotation takes 8.33 ms, so the average wait is half of that, 4.17 ms. Transfer is the bytes moving; 4 KB at 100 MB per second is about 0.04 ms. The three add to roughly 14.2 ms, and the seek is 70 per cent of it.',
      keyword: 'seek + rotational latency + transfer',
      trap: 'Using a full rotation as the average rotational latency. The average is half a rotation, 1/(2r), because the sector is equally likely to be anywhere.',
      narration: 'One access costs seek plus rotational latency plus transfer: ten, four point one seven and zero point zero four milliseconds.'
    },
    {
      id: 'gm-3', start: 20, end: 30, scene: 'geom',
      caption: 'Only the seek is under the scheduler control, so the topic is head movement.',
      detail: 'The rotational latency is fixed by the hardware speed and the transfer time by the amount of data. The one term a scheduler chooses is how far the arm travels, because it chooses the order of service. That is why every algorithm here is a rule for ordering requests, and why every question is scored in cylinders moved, or in a time or power proportional to it.',
      keyword: 'the topic is head movement',
      trap: 'Answering a question about average seek time with a number of requests. Distance is measured in cylinders, not in requests served.',
      narration: 'Only the seek is under the scheduler control, so the whole topic is head movement.'
    },

    /* ---------------- scene 2: FCFS ---------------- */
    {
      id: 'fc-1', start: 30, end: 40, scene: 'fcfs',
      caption: 'Eight requests arrive in this order; FCFS serves them in exactly that order.',
      detail: 'The queue is 98, 183, 37, 122, 14, 124, 65, 67 and the head sits at cylinder 53 on a disk numbered 0 to 199. First come first served means arrival order and nothing else: the scheduler keeps no state and looks at no distance. The profile reads left to right as time, and up and down as the cylinder the head is on, so every diagonal is a real journey of the arm.',
      keyword: 'in exactly that order',
      trap: 'Sorting the queue before serving it. FCFS is the one algorithm where the arrival order must be preserved exactly as printed.',
      narration: 'Eight requests arrive in this order, and first come first served serves them in exactly that order.'
    },
    {
      id: 'fc-2', start: 40, end: 50, scene: 'fcfs',
      caption: 'Total movement 640 cylinders: 45 + 85 + 146 + 85 + 108 + 110 + 59 + 2.',
      detail: 'Each leg is the absolute difference between consecutive cylinders. From 53 to 98 is 45; 98 to 183 is 85; 183 down to 37 is 146; then 85, 108, 110, 59 and 2. Adding them gives 640 cylinders. The long zigzags are the whole story: the arm crosses the disk twice because it is forbidden to reorder.',
      keyword: '640 cylinders',
      trap: 'Adding the cylinder numbers instead of the differences. The cost is the sum of the gaps, never the sum of the destinations.',
      narration: 'Total movement is six hundred and forty cylinders: forty-five, eighty-five, one hundred and forty-six, eighty-five, one hundred and eight, one hundred and ten, fifty-nine and two.'
    },
    {
      id: 'fc-3', start: 50, end: 60, scene: 'fcfs',
      caption: 'FCFS never starves anyone, and pays for it with the longest travel.',
      detail: 'Every request is served within one pass of the queue, so no request can be postponed indefinitely: the bound is the queue length. In exchange, the arm travels whatever the arrival order demands. FCFS is therefore the fair baseline every other algorithm is measured against, and the one to quote when a question asks which policy cannot starve.',
      keyword: 'never starves anyone',
      trap: 'Calling FCFS optimal for fairness and therefore best. Fairness and total movement are different scores, and FCFS loses badly on the second.',
      narration: 'FCFS never starves anyone, and pays for it with the longest travel.'
    },

    /* ---------------- scene 3: SSTF ---------------- */
    {
      id: 'st-1', start: 60, end: 70, scene: 'sstf',
      caption: 'SSTF always serves the nearest pending request.',
      detail: 'Shortest Seek Time First compares every pending request with the current head position and serves the closest, then repeats from the new position. It uses one number, the distance, and ignores arrival order completely. On the same eight requests the first choice from 53 is 65, twelve cylinders away, not the oldest request at 98.',
      keyword: 'the nearest pending request',
      trap: 'Serving the nearest request that arrived, rather than the nearest of all pending requests. SSTF is about position, not about queue order.',
      narration: 'Shortest Seek Time First always serves the nearest pending request.'
    },
    {
      id: 'st-2', start: 70, end: 80, scene: 'sstf',
      caption: 'Same queue, 236 cylinders: 12 + 2 + 30 + 23 + 84 + 24 + 2 + 59.',
      detail: 'The order is 65, 67, 37, 14, 98, 122, 124, 183. The legs are 12, 2, 30, 23, 84, 24, 2 and 59, which sum to 236. That is 404 cylinders less than FCFS on identical work, which is why the greedy rule is attractive: it costs almost nothing to implement and it usually wins by a wide margin.',
      keyword: '236 cylinders',
      trap: 'Assuming the SSTF order is unique. When two requests are equidistant the question must state a tie rule; without one, both orders are legitimate and the totals can differ.',
      narration: 'The same queue costs two hundred and thirty-six cylinders: twelve, two, thirty, twenty-three, eighty-four, twenty-four, two and fifty-nine.'
    },
    {
      id: 'st-3', start: 80, end: 90, scene: 'sstf',
      caption: 'The far request at 183 waits while nearer ones keep arriving.',
      detail: 'SSTF has no memory and no age: a request is only ever compared by distance. If new requests keep arriving just behind the head, the head keeps turning back and the request at the edge is never the nearest. That is starvation, and it is unbounded, because nothing in the rule ever forces the head outward. The fix is a rule with memory, such as SCAN, or explicit aging.',
      keyword: 'starvation',
      trap: 'Claiming SSTF minimises total movement. It minimises the next step only; scene 4 shows a queue where that loses.',
      narration: 'The far request at one hundred and eighty-three waits while nearer ones keep arriving. That is starvation.'
    },

    /* ---------------- scene 4: greedy is not optimal ---------------- */
    {
      id: 'gr-1', start: 90, end: 100, scene: 'greedy',
      caption: 'Greedy is not optimal. Head at 50, requests 11, 40, 60 and 90.',
      detail: 'Four requests on a short track range make the failure small enough to see. From 50 the distances are 39 to 11, 10 to 40, 10 to 60 and 40 to 90. Two requests tie at ten cylinders, and the tie is broken toward the lower cylinder here, so the head goes to 40 first. Whatever the tie rule, the greedy path is fixed from that point: nearest, then nearest again.',
      keyword: 'Greedy is not optimal',
      trap: 'Believing a locally best choice at every step gives a globally best schedule. It does not, because the cost of the next leg depends on where the last leg ended.',
      narration: 'Greedy is not optimal. Head at fifty, requests eleven, forty, sixty and ninety.'
    },
    {
      id: 'gr-2', start: 100, end: 110, scene: 'greedy',
      caption: 'SSTF goes 40, 60, 90, 11 and travels 139 cylinders.',
      detail: 'The legs are 10, 20, 30 and 79, summing to 139. The last leg is the expensive one: having walked outward to 90, the head must come all the way back to 11. Nearest-first spent its cheap steps early and left itself a long step at the end.',
      keyword: '139 cylinders',
      trap: 'Stopping the check after the first two legs. The greedy path looks excellent until the last leg, which is exactly where the cost hides.',
      narration: 'SSTF goes forty, sixty, ninety, eleven and travels one hundred and thirty-nine cylinders.'
    },
    {
      id: 'gr-3', start: 110, end: 120, scene: 'greedy',
      caption: 'The order 11, 40, 60, 90 travels 118. Nearest-first lost by 21.',
      detail: 'The legs are 39, 29, 20 and 30, summing to 118. Paying a large first step to reach the far end leaves a monotone sweep afterwards, and the total is smaller. This is the disk version of a general fact: greedy is a heuristic, not a theorem, and a question that asks for the minimum movement needs an argument, not a habit.',
      keyword: '118',
      trap: 'Assuming the smallest total is always produced by an algorithm you know. Minimum movement is a different question from what any named policy does.',
      narration: 'The order eleven, forty, sixty, ninety travels one hundred and eighteen. Nearest-first lost by twenty-one.'
    },

    /* ---------------- scene 5: SCAN ---------------- */
    {
      id: 'sc-1', start: 120, end: 130, scene: 'scan',
      caption: 'SCAN keeps one direction until the end of the disk, then reverses.',
      detail: 'SCAN is the elevator: it holds a direction, serves every pending request it passes, and only turns round at the physical end of the disk, cylinder 199 here. Because the direction is held, the profile is monotone in each pass and no request can be postponed more than two passes. The direction at the start must be given by the question, or stated as an assumption.',
      keyword: 'until the end of the disk',
      trap: 'Reversing at the last request instead of the end of the disk. That is LOOK, and it gives a smaller number. Reading which one a question means is the whole difference.',
      narration: 'SCAN keeps one direction until the end of the disk, then reverses.'
    },
    {
      id: 'sc-2', start: 130, end: 140, scene: 'scan',
      caption: 'Upward from 53: 65, 67, 98, 122, 124, 183, 199, then back to 37 and 14: 331.',
      detail: 'The climb from 53 to 199 is 146 cylinders. The return from 199 down to 14 is 185. Together, 331. Every request is served on the way, and the two end points are what make the arithmetic short: total equals the distance to the far end plus the distance from the far end to the last request served.',
      keyword: '331',
      trap: 'Forgetting the head keeps moving after the last request of a pass. Between 183 and 199 there is no request at all, and it still costs 16 cylinders.',
      narration: 'Upward from fifty-three: sixty-five, sixty-seven, ninety-eight, one hundred and twenty-two, one hundred and twenty-four, one hundred and eighty-three, one hundred and ninety-nine, then back to thirty-seven and fourteen: three hundred and thirty-one.'
    },
    {
      id: 'sc-3', start: 140, end: 150, scene: 'scan',
      caption: 'The trip to 199 is part of the definition: 16 cylinders of pure waste here.',
      detail: 'Nothing is served between 183 and 199, yet SCAN insists on going there. That is the price of the guarantee: the pattern is regular, the wait is bounded, and no request is starved. LOOK removes exactly this waste and keeps the guarantee, which is why real systems usually implement the LOOK variant and call it the elevator.',
      keyword: '16 cylinders of pure waste',
      trap: 'Deducting the waste because it serves nothing. The movement happened; the cost is charged.',
      narration: 'The trip to one hundred and ninety-nine is part of the definition: sixteen cylinders of pure waste here.'
    },

    /* ---------------- scene 6: C-SCAN ---------------- */
    {
      id: 'cs-1', start: 150, end: 160, scene: 'cscan',
      caption: 'C-SCAN returns to cylinder 0 without servicing anything on the way.',
      detail: 'Circular SCAN treats the cylinders as a ring. The head climbs, serves everything in that direction, reaches the end, and then jumps back to the first cylinder and climbs again in the same direction. The return trip serves nothing, so a request just below the head at the start has to wait for a full sweep. The payoff is that every request waits at most one sweep, so the spread of waiting times is small.',
      keyword: 'without servicing anything',
      trap: 'Servicing requests during the return. That is SCAN, not C-SCAN, and it changes both the order and the total.',
      narration: 'C-SCAN returns to cylinder zero without servicing anything on the way.'
    },
    {
      id: 'cs-2', start: 160, end: 170, scene: 'cscan',
      caption: '382 cylinders: 146 up to 199, the 199-cylinder jump, then 37 more.',
      detail: 'The climb from 53 to 199 is 146. The jump from 199 to 0 is 199 cylinders, and it is real movement, so it is charged. After the jump the head serves 14 and 37, which is another 37. Total 146 + 199 + 37 = 382. The shortcut formula is: distance to the end, plus the full range, plus the last cylinder served after the wrap.',
      keyword: '382',
      trap: 'Dropping the jump as free because nothing is read. The arm physically travels the range, and a question that asks for head movement counts it.',
      narration: 'Three hundred and eighty-two cylinders: one hundred and forty-six up to one hundred and ninety-nine, the one-hundred-and-ninety-nine-cylinder jump, then thirty-seven more.'
    },
    {
      id: 'cs-3', start: 170, end: 180, scene: 'cscan',
      caption: 'The jump costs movement, and buys equal treatment for the middle.',
      detail: 'In SCAN the middle cylinders are served twice per sweep and the edges once, so the middle is favoured. C-SCAN removes that bias by making the service pattern a circle, at the cost of the empty return. The trade is uniform wait against total movement: 382 against 331 on this queue, for a smaller worst case.',
      keyword: 'equal treatment',
      trap: 'Comparing algorithms on total movement alone when the question asks about fairness or worst-case wait. Different questions, different winners.',
      narration: 'The jump costs movement, and buys equal treatment for the middle of the disk.'
    },

    /* ---------------- scene 7: LOOK and C-LOOK ---------------- */
    {
      id: 'lk-1', start: 180, end: 190, scene: 'look',
      caption: 'LOOK reverses at the last request instead of the end of the disk: 299.',
      detail: 'LOOK is SCAN without the pointless trip. The head climbs while requests remain ahead, reverses at 183, the highest pending request, and comes back down. The climb from 53 to 183 is 130 and the return from 183 to 14 is 169, so 299. That is 32 cylinders less than SCAN on the same queue, and the ordering of service is identical.',
      keyword: 'at the last request',
      trap: 'Confusing the name with the mechanism. LOOK looks ahead for requests; SCAN does not look at all and goes to the end regardless.',
      narration: 'LOOK reverses at the last request instead of the end of the disk: two hundred and ninety-nine.'
    },
    {
      id: 'lk-2', start: 190, end: 200, scene: 'look',
      caption: 'C-LOOK jumps to the smallest pending request: 322.',
      detail: 'C-LOOK is C-SCAN with the same saving: climb to the highest pending request, jump to the lowest pending request without servicing, then climb again. Here the climb 53 to 183 is 130, the jump from 183 to 14 is 169, and 14 to 37 is 23, so 322. The jump is shorter than C-SCAN\u2019s because it stops at 14 instead of 0.',
      keyword: 'smallest pending request',
      trap: 'Jumping to cylinder 0 in C-LOOK. The jump goes to the lowest pending request, which is usually not 0.',
      narration: 'C-LOOK jumps to the smallest pending request: three hundred and twenty-two.'
    },
    {
      id: 'lk-3', start: 200, end: 210, scene: 'look',
      caption: 'GATE 2016: C-LOOK from 63 gives 24 + 5 + 29 + 70 + 181 + 1 + 27 + 9 = 346.',
      detail: 'The queue is 47, 38, 121, 191, 87, 11, 92, 10 on cylinders 0 to 199, the head is at 63 moving toward larger numbers. Climbing: 87, 92, 121, 191. Then the jump to the smallest pending request, 10, and climbing again: 11, 38, 47. The legs are 24, 5, 29, 70, 181, 1, 27 and 9, and the total is 346. The single largest leg is the jump, and it is more than half the answer.',
      keyword: '346',
      trap: 'Jumping to 0 instead of to 10, which would add 10 and give 356. The jump is to the lowest request, not to the lowest cylinder.',
      narration: 'GATE 2016: C-LOOK from sixty-three gives twenty-four, five, twenty-nine, seventy, one hundred and eighty-one, one, twenty-seven and nine: three hundred and forty-six.'
    },

    /* ---------------- scene 8: GATE 2015 ---------------- */
    {
      id: 'g15-1', start: 210, end: 220, scene: 'gate2015',
      caption: 'GATE 2015 Set 1: 100 tracks, head at 50, nine requests including 50 itself.',
      detail: 'The queue is 45, 20, 90, 10, 50, 60, 80, 25, 70 on a disk of 100 tracks, and the head starts on track 50. One request is for the track the head is already on, so it costs zero movement and is served first. The paper adds a direction for SCAN: it moves toward 100. Every one of those details changes the answer, which is why they are quoted rather than paraphrased.',
      keyword: 'including 50 itself',
      trap: 'Dropping the request that equals the head position. It is a real request, it is served, and it contributes 0 to the total.',
      narration: 'GATE 2015, Set 1: one hundred tracks, head at fifty, and nine requests including fifty itself.'
    },
    {
      id: 'g15-2', start: 220, end: 230, scene: 'gate2015',
      caption: 'SSTF gives 130, SCAN toward 100 gives 140, and LOOK would give 120.',
      detail: 'SSTF: 50, 45, 60, 70, 80, 90, 25, 20, 10 with legs 0, 5, 15, 10, 10, 10, 65, 5, 10, summing to 130. SCAN upward must reach track 100, so the climb is 50 and the return from 100 to 10 is 90, giving 140. LOOK reverses at 90, so the climb is 40 and the return from 90 to 10 is 80, giving 120.',
      keyword: '130',
      trap: 'Treating 100 as unreachable because no request is there. SCAN visits the end of the disk whether or not a request waits there.',
      narration: 'SSTF gives one hundred and thirty, SCAN toward one hundred gives one hundred and forty, and LOOK would give one hundred and twenty.'
    },
    {
      id: 'g15-3', start: 230, end: 240, scene: 'gate2015',
      caption: 'The key is 10. Read additional as a magnitude, and notice 50 costs nothing.',
      detail: 'The published key for this numerical item is 10, the size of the gap. Read literally, SSTF travels ten cylinders less, not more, so the word additional is ambiguous and the key takes the absolute difference. Two of the three errors available here are a wrong direction assumption and a wrong end of the disk, and the third is charging movement for the request at 50.',
      keyword: 'The key is 10',
      trap: 'Answering a negative number because the word additional was read literally. Numerical answer items accept only non-negative values, so a gap is quoted as a magnitude.',
      narration: 'The key is ten. Read additional as a magnitude, and notice that the request at fifty costs nothing.'
    },

    /* ---------------- scene 9: cost models ---------------- */
    {
      id: 'cm-1', start: 240, end: 250, scene: 'costmodel',
      caption: 'Movement is not always the whole cost: GATE 2018 charges per cylinder and per reversal.',
      detail: 'The question gives cylinders 0 to 199, head at 80 moving toward higher numbers, and six requests at cylinders 72, 134, 20, 86, 116 and 16. Power is 20 milliwatts per 100 cylinders of movement and 15 milliwatts for each reversal of direction. The platter and sector numbers in the question do not enter the arithmetic at all: only the cylinder matters for seek.',
      keyword: 'per cylinder and per reversal',
      trap: 'Adding the sector or platter numbers into the distance. Only the cylinder coordinate moves the arm.',
      narration: 'Movement is not always the whole cost: GATE 2018 charges per cylinder and per reversal.'
    },
    {
      id: 'cm-2', start: 250, end: 260, scene: 'costmodel',
      caption: 'SSTF from 80: 200 cylinders and 3 reversals, so 40 + 45 = 85 mW.',
      detail: 'SSTF serves 86, 72, 116, 134, 20, 16 with legs 6, 14, 44, 18, 114 and 4, summing to 200 cylinders. The directions are up, down, up, up, down, down, so the head reverses at 86, at 72 and at 134: three reversals. Power is 200/100 times 20, which is 40, plus 3 times 15, which is 45. Total 85 milliwatts.',
      keyword: '85 mW',
      trap: 'Counting the start as a reversal. The head is already moving when the schedule begins, so only changes of direction after that count.',
      narration: 'SSTF from eighty: two hundred cylinders and three reversals, so forty plus forty-five, eighty-five milliwatts.'
    },
    {
      id: 'cm-3', start: 260, end: 270, scene: 'costmodel',
      caption: 'Seek time is movement times a constant; a reversal can cost separately.',
      detail: 'Three cost models cover every question in this topic. Movement in cylinders, which is the default. Seek time, which is movement multiplied by a stated time per cylinder. And an additive model such as the power one, where a second quantity such as the number of reversals is charged separately. The algorithm that wins can change between models, so read which quantity is being scored before choosing a policy.',
      keyword: 'movement times a constant',
      trap: 'Assuming the minimum-movement algorithm also minimises time or power. With a per-reversal charge, a schedule with slightly more movement but fewer reversals can win.',
      narration: 'Seek time is movement times a constant, and a reversal can cost separately.'
    },

    /* ---------------- scene 10: procedure ---------------- */
    {
      id: 'rc-1', start: 270, end: 280, scene: 'recipe',
      caption: 'Fix the disk range, the head position and the direction before anything else.',
      detail: 'Write down four facts first: the lowest and highest cylinder, whether the request at the head position is in the queue, the starting cylinder, and for SCAN and its variants the starting direction. Half the wrong answers in this topic come from a direction nobody fixed. If the question does not state a direction for SCAN, say which one you assumed.',
      keyword: 'the head position and the direction',
      trap: 'Starting SCAN without a direction. The same queue gives different totals upward and downward, so an unstated direction makes the question unanswerable.',
      narration: 'Fix the disk range, the head position and the direction before anything else.'
    },
    {
      id: 'rc-2', start: 280, end: 290, scene: 'recipe',
      caption: 'Then write the service order, and sum the absolute differences.',
      detail: 'The order is the answer to most of the question, and the total is a reading of it. Sum the absolute differences between consecutive cylinders, including the jump in the circular variants, and include the request at the head as a zero-cost step. Keep the service order written down: many options in an MCQ ask which request is served third, and only the order settles it.',
      keyword: 'sum the absolute differences',
      trap: 'Summing destinations instead of gaps, or omitting the jump. Both produce a plausible number that matches no option.',
      narration: 'Then write the service order, and sum the absolute differences between consecutive cylinders.'
    },
    {
      id: 'rc-3', start: 290, end: 300, scene: 'recipe',
      caption: 'Five traps: the end visit, the direction, the jump, the units, and ties.',
      detail: 'One: SCAN goes to the end of the disk, LOOK does not. Two: a direction must be fixed, and the answer depends on it. Three: in C-SCAN and C-LOOK the jump is charged, and it is usually the largest single leg. Four: the answer may be asked in cylinders, in milliseconds or in power, so convert only at the end. Five: ties in SSTF need the question to break them; if it does not, both totals are legitimate and the question is flawed.',
      keyword: 'Five traps',
      trap: 'Converting units in the middle of the sum. Add in cylinders first, then multiply once; rounding early is how a 346 becomes 350.',
      narration: 'Five traps: the end visit, the direction, the jump, the units, and ties.'
    }
  ]
};
