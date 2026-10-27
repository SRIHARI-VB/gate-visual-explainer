# Disk Scheduling — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/disk-scheduling/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 30 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A stack of tracks, and the three parts of one access

*0:00 – 0:30 · objective: Name the coordinate a disk scheduler actually moves, and split one disk access into seek time, rotational latency and transfer time so the part a scheduler can change is visible.*

**0:00–0:10** — A disk is a stack of concentric tracks, and one arm reads all of them.

> Caption: A disk is a stack of concentric tracks, and one arm reads all of them.

Exam-trap caption mode adds: *Reading the platter or sector number as something the head moves to. The head moves in cylinders only; sector and platter are reached by waiting for the rotation and by switching heads.*

**0:10–0:20** — One access costs seek plus rotational latency plus transfer: ten, four point one seven and zero point zero four milliseconds.

> Caption: One access costs seek + rotational latency + transfer: 10 + 4.17 + 0.04 ms.

Exam-trap caption mode adds: *Using a full rotation as the average rotational latency. The average is half a rotation, 1/(2r), because the sector is equally likely to be anywhere.*

**0:20–0:30** — Only the seek is under the scheduler control, so the whole topic is head movement.

> Caption: Only the seek is under the scheduler control, so the topic is head movement.

Exam-trap caption mode adds: *Answering a question about average seek time with a number of requests. Distance is measured in cylinders, not in requests served.*

## Scene 2. First Come First Served: 640 cylinders of travel

*0:30 – 1:00 · objective: Read a head-movement profile for FCFS on a fixed request queue, sum the absolute differences, and say what FCFS buys with its long travel.*

**0:30–0:40** — Eight requests arrive in this order, and first come first served serves them in exactly that order.

> Caption: Eight requests arrive in this order; FCFS serves them in exactly that order.

Exam-trap caption mode adds: *Sorting the queue before serving it. FCFS is the one algorithm where the arrival order must be preserved exactly as printed.*

**0:40–0:50** — Total movement is six hundred and forty cylinders: forty-five, eighty-five, one hundred and forty-six, eighty-five, one hundred and eight, one hundred and ten, fifty-nine and two.

> Caption: Total movement 640 cylinders: 45 + 85 + 146 + 85 + 108 + 110 + 59 + 2.

Exam-trap caption mode adds: *Adding the cylinder numbers instead of the differences. The cost is the sum of the gaps, never the sum of the destinations.*

**0:50–1:00** — FCFS never starves anyone, and pays for it with the longest travel.

> Caption: FCFS never starves anyone, and pays for it with the longest travel.

Exam-trap caption mode adds: *Calling FCFS optimal for fairness and therefore best. Fairness and total movement are different scores, and FCFS loses badly on the second.*

## Scene 3. SSTF: nearest first, 236 cylinders, and starvation

*1:00 – 1:30 · objective: Run SSTF on the same queue, compute 236, and see why the greedy nearest-first rule can postpone a request indefinitely.*

**1:00–1:10** — Shortest Seek Time First always serves the nearest pending request.

> Caption: SSTF always serves the nearest pending request.

Exam-trap caption mode adds: *Serving the nearest request that arrived, rather than the nearest of all pending requests. SSTF is about position, not about queue order.*

**1:10–1:20** — The same queue costs two hundred and thirty-six cylinders: twelve, two, thirty, twenty-three, eighty-four, twenty-four, two and fifty-nine.

> Caption: Same queue, 236 cylinders: 12 + 2 + 30 + 23 + 84 + 24 + 2 + 59.

Exam-trap caption mode adds: *Assuming the SSTF order is unique. When two requests are equidistant the question must state a tie rule; without one, both orders are legitimate and the totals can differ.*

**1:20–1:30** — The far request at one hundred and eighty-three waits while nearer ones keep arriving. That is starvation.

> Caption: The far request at 183 waits while nearer ones keep arriving.

Exam-trap caption mode adds: *Claiming SSTF minimises total movement. It minimises the next step only; scene 4 shows a queue where that loses.*

## Scene 4. SSTF is greedy, and greedy is not optimal

*1:30 – 2:00 · objective: Show with a four-request counterexample that SSTF can travel 139 cylinders where another order travels 118, so nearest-first is not a proof of minimality.*

**1:30–1:40** — Greedy is not optimal. Head at fifty, requests eleven, forty, sixty and ninety.

> Caption: Greedy is not optimal. Head at 50, requests 11, 40, 60 and 90.

Exam-trap caption mode adds: *Believing a locally best choice at every step gives a globally best schedule. It does not, because the cost of the next leg depends on where the last leg ended.*

**1:40–1:50** — SSTF goes forty, sixty, ninety, eleven and travels one hundred and thirty-nine cylinders.

> Caption: SSTF goes 40, 60, 90, 11 and travels 139 cylinders.

Exam-trap caption mode adds: *Stopping the check after the first two legs. The greedy path looks excellent until the last leg, which is exactly where the cost hides.*

**1:50–2:00** — The order eleven, forty, sixty, ninety travels one hundred and eighteen. Nearest-first lost by twenty-one.

> Caption: The order 11, 40, 60, 90 travels 118. Nearest-first lost by 21.

Exam-trap caption mode adds: *Assuming the smallest total is always produced by an algorithm you know. Minimum movement is a different question from what any named policy does.*

## Scene 5. SCAN: the elevator, and the trip to the end

*2:00 – 2:30 · objective: Trace SCAN upward from the head to the physical end of the disk and back, compute 331, and identify the cylinders of travel that served no request.*

**2:00–2:10** — SCAN keeps one direction until the end of the disk, then reverses.

> Caption: SCAN keeps one direction until the end of the disk, then reverses.

Exam-trap caption mode adds: *Reversing at the last request instead of the end of the disk. That is LOOK, and it gives a smaller number. Reading which one a question means is the whole difference.*

**2:10–2:20** — Upward from fifty-three: sixty-five, sixty-seven, ninety-eight, one hundred and twenty-two, one hundred and twenty-four, one hundred and eighty-three, one hundred and ninety-nine, then back to thirty-seven and fourteen: three hundred and thirty-one.

> Caption: Upward from 53: 65, 67, 98, 122, 124, 183, 199, then back to 37 and 14: 331.

Exam-trap caption mode adds: *Forgetting the head keeps moving after the last request of a pass. Between 183 and 199 there is no request at all, and it still costs 16 cylinders.*

**2:20–2:30** — The trip to one hundred and ninety-nine is part of the definition: sixteen cylinders of pure waste here.

> Caption: The trip to 199 is part of the definition: 16 cylinders of pure waste here.

Exam-trap caption mode adds: *Deducting the waste because it serves nothing. The movement happened; the cost is charged.*

## Scene 6. C-SCAN: return without servicing, 382 cylinders

*2:30 – 3:00 · objective: Compute C-SCAN cost as the climb to the end, the full-range jump and the climb after it, and state what the jump buys in exchange for its movement.*

**2:30–2:40** — C-SCAN returns to cylinder zero without servicing anything on the way.

> Caption: C-SCAN returns to cylinder 0 without servicing anything on the way.

Exam-trap caption mode adds: *Servicing requests during the return. That is SCAN, not C-SCAN, and it changes both the order and the total.*

**2:40–2:50** — Three hundred and eighty-two cylinders: one hundred and forty-six up to one hundred and ninety-nine, the one-hundred-and-ninety-nine-cylinder jump, then thirty-seven more.

> Caption: 382 cylinders: 146 up to 199, the 199-cylinder jump, then 37 more.

Exam-trap caption mode adds: *Dropping the jump as free because nothing is read. The arm physically travels the range, and a question that asks for head movement counts it.*

**2:50–3:00** — The jump costs movement, and buys equal treatment for the middle of the disk.

> Caption: The jump costs movement, and buys equal treatment for the middle.

Exam-trap caption mode adds: *Comparing algorithms on total movement alone when the question asks about fairness or worst-case wait. Different questions, different winners.*

## Scene 7. LOOK and C-LOOK: reverse at the last request

*3:00 – 3:30 · objective: Distinguish SCAN from LOOK by where the head reverses, compute 299 and 322 on the same queue, and reproduce GATE 2016 Set 1 C-LOOK = 346.*

**3:00–3:10** — LOOK reverses at the last request instead of the end of the disk: two hundred and ninety-nine.

> Caption: LOOK reverses at the last request instead of the end of the disk: 299.

Exam-trap caption mode adds: *Confusing the name with the mechanism. LOOK looks ahead for requests; SCAN does not look at all and goes to the end regardless.*

**3:10–3:20** — C-LOOK jumps to the smallest pending request: three hundred and twenty-two.

> Caption: C-LOOK jumps to the smallest pending request: 322.

Exam-trap caption mode adds: *Jumping to cylinder 0 in C-LOOK. The jump goes to the lowest pending request, which is usually not 0.*

**3:20–3:30** — GATE 2016: C-LOOK from sixty-three gives twenty-four, five, twenty-nine, seventy, one hundred and eighty-one, one, twenty-seven and nine: three hundred and forty-six.

> Caption: GATE 2016: C-LOOK from 63 gives 24 + 5 + 29 + 70 + 181 + 1 + 27 + 9 = 346.

Exam-trap caption mode adds: *Jumping to 0 instead of to 10, which would add 10 and give 356. The jump is to the lowest request, not to the lowest cylinder.*

## Scene 8. The GATE 2015 comparison: 130 against 140

*3:30 – 4:00 · objective: Reproduce GATE CSE 2015 Set 1 Q30 from the paper wording: SSTF 130, SCAN toward 100 gives 140, the difference is 10, and LOOK would have given 120.*

**3:30–3:40** — GATE 2015, Set 1: one hundred tracks, head at fifty, and nine requests including fifty itself.

> Caption: GATE 2015 Set 1: 100 tracks, head at 50, nine requests including 50 itself.

Exam-trap caption mode adds: *Dropping the request that equals the head position. It is a real request, it is served, and it contributes 0 to the total.*

**3:40–3:50** — SSTF gives one hundred and thirty, SCAN toward one hundred gives one hundred and forty, and LOOK would give one hundred and twenty.

> Caption: SSTF gives 130, SCAN toward 100 gives 140, and LOOK would give 120.

Exam-trap caption mode adds: *Treating 100 as unreachable because no request is there. SCAN visits the end of the disk whether or not a request waits there.*

**3:50–4:00** — The key is ten. Read additional as a magnitude, and notice that the request at fifty costs nothing.

> Caption: The key is 10. Read additional as a magnitude, and notice 50 costs nothing.

Exam-trap caption mode adds: *Answering a negative number because the word additional was read literally. Numerical answer items accept only non-negative values, so a gap is quoted as a magnitude.*

## Scene 9. When movement is not the whole cost

*4:00 – 4:30 · objective: Convert movement into time and into power, reproduce GATE CSE 2018 Set 1 SSTF = 85 mW from 200 cylinders and 3 reversals, and see why the metric changes the answer.*

**4:00–4:10** — Movement is not always the whole cost: GATE 2018 charges per cylinder and per reversal.

> Caption: Movement is not always the whole cost: GATE 2018 charges per cylinder and per reversal.

Exam-trap caption mode adds: *Adding the sector or platter numbers into the distance. Only the cylinder coordinate moves the arm.*

**4:10–4:20** — SSTF from eighty: two hundred cylinders and three reversals, so forty plus forty-five, eighty-five milliwatts.

> Caption: SSTF from 80: 200 cylinders and 3 reversals, so 40 + 45 = 85 mW.

Exam-trap caption mode adds: *Counting the start as a reversal. The head is already moving when the schedule begins, so only changes of direction after that count.*

**4:20–4:30** — Seek time is movement times a constant, and a reversal can cost separately.

> Caption: Seek time is movement times a constant; a reversal can cost separately.

Exam-trap caption mode adds: *Assuming the minimum-movement algorithm also minimises time or power. With a per-reversal charge, a schedule with slightly more movement but fewer reversals can win.*

## Scene 10. The procedure, and the five traps

*4:30 – 5:00 · objective: Fix a five-step procedure that works for every disk-scheduling question, and name the five traps that cost marks: the end visit, the direction, the jump, the units and ties.*

**4:30–4:40** — Fix the disk range, the head position and the direction before anything else.

> Caption: Fix the disk range, the head position and the direction before anything else.

Exam-trap caption mode adds: *Starting SCAN without a direction. The same queue gives different totals upward and downward, so an unstated direction makes the question unanswerable.*

**4:40–4:50** — Then write the service order, and sum the absolute differences between consecutive cylinders.

> Caption: Then write the service order, and sum the absolute differences.

Exam-trap caption mode adds: *Summing destinations instead of gaps, or omitting the jump. Both produce a plausible number that matches no option.*

**4:50–5:00** — Five traps: the end visit, the direction, the jump, the units, and ties.

> Caption: Five traps: the end visit, the direction, the jump, the units, and ties.

Exam-trap caption mode adds: *Converting units in the middle of the sum. Add in cylinders first, then multiply once; rounding early is how a 346 becomes 350.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
