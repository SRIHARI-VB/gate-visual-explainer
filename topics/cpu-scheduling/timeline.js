/* ==========================================================================
   cpu-scheduling - THE timeline.
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
      id: 'metrics',
      n: 1,
      title: 'What the scheduler decides, and what we measure',
      start: 0, end: 30,
      objective: 'Name the only decision a CPU scheduler makes, and define the five quantities every scheduling question is scored on.'
    },
    {
      id: 'fcfs',
      n: 2,
      title: 'First Come First Served and the convoy effect',
      start: 30, end: 60,
      objective: 'Read a Gantt chart for FCFS on a fixed process set, compute its average waiting time, and explain the convoy effect.'
    },
    {
      id: 'sjf',
      n: 3,
      title: 'Shortest Job First: optimal, and not fair',
      start: 60, end: 90,
      objective: 'Show why non-preemptive SJF minimises average waiting time among schedules that respect arrivals, and name the assumption it needs.'
    },
    {
      id: 'srtf',
      n: 4,
      title: 'Shortest Remaining Time First',
      start: 90, end: 120,
      objective: 'Preempt at arrivals only, draw the SRTF Gantt chart, and see one process lose badly while the average improves.'
    },
    {
      id: 'rr',
      n: 5,
      title: 'Round Robin and the time quantum',
      start: 120, end: 150,
      objective: 'Run round robin with quantum 4, compare its waiting time with its response time, and show both degenerate limits of the quantum.'
    },
    {
      id: 'priority',
      n: 6,
      title: 'Priority scheduling, starvation and aging',
      start: 150, end: 180,
      objective: 'Distinguish preemptive from non-preemptive priority, show starvation as a schedule that never ends, and fix it with aging.'
    },
    {
      id: 'mlfq',
      n: 7,
      title: 'Multilevel feedback queues',
      start: 180, end: 210,
      objective: 'Trace one process set through three queues with growing quanta, and read the response-time gain against the turnaround-time cost.'
    },
    {
      id: 'overhead',
      n: 8,
      title: 'The quantum against the switch cost',
      start: 210, end: 240,
      objective: 'Compute the fraction of CPU time lost to context switches as q/(q+s), and use it to explain why the quantum cannot be tiny.'
    },
    {
      id: 'io',
      n: 9,
      title: 'CPU and I/O scheduling together',
      start: 240, end: 270,
      objective: 'Place CPU bursts and I/O bursts in one picture, and say why favouring short bursts raises both utilisation and response.'
    },
    {
      id: 'recipe',
      n: 10,
      title: 'The procedure and the five traps',
      start: 270, end: 300,
      objective: 'Reduce any scheduling question to four steps, and name the five errors that cost marks even when the Gantt chart is right.'
    }
  ],

  events: [
    /* ---------------- scene 1: metrics ---------------- */
    {
      id: 'me-1', start: 0, end: 7.5, scene: 'metrics',
      caption: 'The scheduler makes one decision, again and again: which ready process runs next.',
      detail: 'A ready process is one that could run. The CPU can hold exactly one at a time. So the scheduler is a function from the set of ready processes to a single choice, and it is called again at every dispatch, every completion, every preemption and every block. Everything else in this topic follows from what that function is allowed to look at.',
      keyword: 'one decision',
      trap: 'Believing the scheduler moves a process through the state diagram. It does not: it only chooses, and the chosen process moves from ready to running.',
      narration: 'The scheduler makes one decision, again and again: which ready process runs next.'
    },
    {
      id: 'me-2', start: 7.5, end: 15, scene: 'metrics',
      caption: 'Five numbers describe a schedule: utilisation, throughput, turnaround, waiting and response.',
      detail: 'CPU utilisation is the fraction of time the CPU is doing useful work. Throughput is completed processes per unit time. Turnaround time is completion minus arrival, the whole time the process existed. Waiting time is turnaround minus the burst, the time it spent ready. Response time is the first moment it got the CPU minus its arrival.',
      keyword: 'five numbers',
      trap: 'Treating waiting time and turnaround time as the same thing. Turnaround includes the burst; waiting does not. A question that asks for waiting and is answered with turnaround is off by exactly the burst.',
      narration: 'Five numbers describe a schedule: utilisation, throughput, turnaround, waiting and response.'
    },
    {
      id: 'me-3', start: 15, end: 22.5, scene: 'metrics',
      caption: 'Turnaround is completion minus arrival. Waiting is turnaround minus the burst.',
      detail: 'Both are per process, and both are then averaged over the set. Because the burst is fixed by the process and not by the schedule, minimising the average turnaround and minimising the average waiting time are the same problem on a given process set: they differ by a constant, the sum of the bursts. That is why an argument about one is an argument about the other.',
      keyword: 'completion minus arrival',
      trap: 'Averaging over the number of processes that arrived by some time, or dividing by the wrong count when a question has four processes and asks for an average. The divisor is the number of processes in the set, always.',
      narration: 'Turnaround is completion minus arrival. Waiting is turnaround minus the burst.'
    },
    {
      id: 'me-4', start: 22.5, end: 30, scene: 'metrics',
      caption: 'Response time is the first slice only, which is why round robin can improve it without improving the average.',
      detail: 'Response time stops at the first moment of service, so it measures how long a person would wait before seeing anything happen. A process can be served immediately and still finish last. That single sentence explains the whole trade-off in this topic: interactive systems buy response time and pay in turnaround, and batch systems do the reverse.',
      keyword: 'first slice',
      trap: 'Assuming a smaller quantum improves every metric. It improves response time, and it usually makes average turnaround worse while adding switch overhead.',
      narration: 'Response time is the first slice only, which is why round robin can improve it without improving the average.'
    },

    /* ---------------- scene 2: FCFS ---------------- */
    {
      id: 'fc-1', start: 30, end: 37.5, scene: 'fcfs',
      caption: 'FCFS runs processes in arrival order and never preempts: A, then B, then C, then D.',
      detail: 'Four processes arrive with bursts of 10, 6, 3 and 7. First Come First Served takes them in the order they entered the ready queue and runs each to completion. The Gantt chart is therefore one long bar per process, laid end to end, starting at the first arrival.',
      keyword: 'arrival order',
      trap: 'Sorting by arrival time when two processes arrive together. FCFS breaks ties by the order they joined the ready queue, and the question usually says which that is.',
      narration: 'FCFS runs processes in arrival order and never preempts: A, then B, then C, then D.'
    },
    {
      id: 'fc-2', start: 37.5, end: 45, scene: 'fcfs',
      caption: 'The waiting times are 0, 8, 12 and 13, so the average waiting time is 8.25.',
      detail: 'A starts at its own arrival, so it waits nothing. B arrives at 2 but starts at 10, so it waits 8. C arrives at 4 and starts at 16, waiting 12. D arrives at 6 and starts at 19, waiting 13. The sum is 33 over four processes, which is 8.25.',
      keyword: '8.25',
      trap: 'Reading the waiting time off the Gantt chart as the gap before a bar rather than arrival to start. The gap you can see is the wait only when the process arrived exactly when the previous one finished.',
      narration: 'The waiting times are 0, 8, 12 and 13, so the average waiting time is 8.25.'
    },
    {
      id: 'fc-3', start: 45, end: 52.5, scene: 'fcfs',
      caption: 'This is the convoy effect: one long job at the head makes everyone behind it late.',
      detail: 'C needs three units of work and waits twelve for them. Its waiting time is four times its own requirement, and nothing about C caused that: A did, by holding the CPU for ten units. In FCFS the waiting time of a process is the sum of the bursts of everyone ahead of it, so one long job delays every job behind it.',
      keyword: 'convoy effect',
      trap: 'Concluding that FCFS is always bad. With bursts of similar length it is close to optimal and costs almost nothing to implement. The convoy effect is a statement about unequal bursts.',
      narration: 'This is the convoy effect: one long job at the head makes everyone behind it late.'
    },
    {
      id: 'fc-4', start: 52.5, end: 60, scene: 'fcfs',
      caption: 'FCFS never starves anyone, and it cannot preempt, so a long job can block an interactive one.',
      detail: 'Every process eventually reaches the head of the queue, so starvation is impossible. The price is that the scheduler cannot take the CPU away: a ten-unit job must finish before a one-unit job that arrived a microsecond later gets a turn. Non-preemptive is not a bug in FCFS; it is the definition of FCFS.',
      keyword: 'never starves',
      trap: 'Marking FCFS as a starvation-causing algorithm. It is the one simple algorithm that provably does not starve; SJF and priority scheduling are the starvation candidates.',
      narration: 'FCFS never starves anyone, and it cannot preempt, so a long job can block an interactive one.'
    },

    /* ---------------- scene 3: SJF ---------------- */
    {
      id: 'sj-1', start: 60, end: 67.5, scene: 'sjf',
      caption: 'SJF picks the shortest burst among the processes that have arrived, and still never preempts.',
      detail: 'At time zero only A has arrived, so A must run: SJF has no choice. When A finishes at 10, B, C and D are all waiting, and SJF takes the shortest of them, which is C with 3. Then B with 6, then D with 7. The order is A, C, B, D, and the "shortest" is decided only among arrivals, never among processes still to come.',
      keyword: 'among those that have arrived',
      trap: 'Ordering all four by burst length and starting with C. C has not arrived at time zero, so no non-preemptive scheduler can run it there. The arrival constraint is part of the problem, not a detail.',
      narration: 'SJF picks the shortest burst among the processes that have arrived, and still never preempts.'
    },
    {
      id: 'sj-2', start: 67.5, end: 75, scene: 'sjf',
      caption: 'Waiting times 0, 11, 6 and 13: average 7.5, better than 8.25 for FCFS.',
      detail: 'C now waits only 6 instead of 12, and D waits 13 as before. B waits 11 instead of 8, because C jumped ahead of it. The average falls from 8.25 to 7.5, so the change is a real improvement in the average and a real loss for B. Scheduling is full of these trades, and the exam asks about the average unless it says otherwise.',
      keyword: 'average 7.5',
      trap: 'Expecting every process to improve. One process in this schedule gets worse, and that is normal: an average is not a guarantee.',
      narration: 'Waiting times 0, 11, 6 and 13: average 7.5, better than 8.25 for FCFS.'
    },
    {
      id: 'sj-3', start: 75, end: 82.5, scene: 'sjf',
      caption: 'SJF is optimal for average waiting time, and the proof is an exchange argument.',
      detail: 'Suppose a schedule runs a long job before a short one that was already waiting. Swapping the two leaves the completion time of every other process unchanged, and shortens the short job by the long burst while lengthening the long job by the short burst. Since the short burst is smaller, the sum of waiting times strictly falls. So any schedule with such a pair is improvable, and only the shortest-first order has no such pair.',
      keyword: 'exchange argument',
      trap: 'Reading this as "SJF is the best algorithm". The theorem is about average waiting time, given known bursts, with arrivals respected. It says nothing about response time, fairness, or the case where bursts are unknown.',
      narration: 'SJF is optimal for average waiting time, and the proof is an exchange argument.'
    },
    {
      id: 'sj-4', start: 82.5, end: 90, scene: 'sjf',
      caption: 'The theorem assumes the bursts are known. In a real system they must be predicted.',
      detail: 'The optimality proof uses the true burst length, which the scheduler does not have. Real systems estimate the next burst from the last ones, typically as an exponential average: the new estimate is a blend of the measured last burst and the previous estimate. The algorithm then runs on estimates, and its optimality guarantee is gone. GATE states "the scheduler has prior knowledge" when it wants the true SJF.',
      keyword: 'assumes bursts are known',
      trap: 'Forgetting the words "if the scheduler has prior knowledge of the burst lengths" in a question. Without them, an answer that relies on exact SJF ordering is not licensed.',
      narration: 'The theorem assumes the bursts are known. In a real system they must be predicted.'
    },

    /* ---------------- scene 4: SRTF ---------------- */
    {
      id: 'sr-1', start: 90, end: 97.5, scene: 'srtf',
      caption: 'SRTF is SJF with preemption: at every arrival, compare remaining times.',
      detail: 'A runs from 0. At time 2, B arrives with a burst of 6 while A has 8 left, so B is shorter and takes the CPU. At time 4, C arrives with 3 while B has 4 left, so C takes it. At 6, D arrives with 7 while C has 1 left, so C keeps it. Preemption happens at arrivals, not at arbitrary moments.',
      keyword: 'at every arrival',
      trap: 'Preempting when remaining times are equal. A tie is not a reason to preempt; the question normally states the tie rule, and if it does not, the running process continues.',
      narration: 'SRTF is SJF with preemption: at every arrival, compare remaining times.'
    },
    {
      id: 'sr-2', start: 97.5, end: 105, scene: 'srtf',
      caption: 'The chart is A 0 to 2, B 2 to 4, C 4 to 7, B 7 to 11, D 11 to 18, A 18 to 26.',
      detail: 'Six segments instead of four, because B and A each resume. C completes at 7, the earliest possible. B resumes and finishes at 11, D runs 11 to 18, and A, the longest job, runs last from 18 to 26. Every segment is contiguous with the next, and the total is the sum of the four bursts, 26 units.',
      keyword: 'six segments',
      trap: 'Losing a segment when redrawing. A preempted process reappears later, and forgetting one resume changes every completion time after it.',
      narration: 'The chart is A 0 to 2, B 2 to 4, C 4 to 7, B 7 to 11, D 11 to 18, A 18 to 26.'
    },
    {
      id: 'sr-3', start: 105, end: 112.5, scene: 'srtf',
      caption: 'Average waiting falls to 6, but A waits 16 instead of 0.',
      detail: 'Waiting times are A 16, B 3, C 0 and D 5, averaging 6. A is the process that loses: it started at once under FCFS and now waits 16 units. SRTF minimises the average, and it does so partly by being very bad to the longest job. That is the same trade as SJF, at a larger scale.',
      keyword: 'A waits 16',
      trap: 'Assuming the preemptive version must be better for everyone. It is better on average and worse for the long jobs, and a long job can be starved indefinitely by a steady stream of short ones.',
      narration: 'Average waiting falls to 6, but A waits 16 instead of 0.'
    },
    {
      id: 'sr-4', start: 112.5, end: 120, scene: 'srtf',
      caption: 'Its response time is the best of the four algorithms: 1.25 on average.',
      detail: 'First service times are A 0, B 2, C 4 and D 11, so the response times are 0, 0, 0 and 5, averaging 1.25. Compare FCFS at 8.25 and non-preemptive SJF at 7.5. SRTF is therefore excellent on both averages here, which is exactly why real systems approximate it, and why the long-job starvation is a real cost rather than a curiosity.',
      keyword: '1.25',
      trap: 'Computing response time as completion minus arrival. That is turnaround. Response stops at the first moment the process ever ran.',
      narration: 'Its response time is the best of the four algorithms: 1.25 on average.'
    },

    /* ---------------- scene 5: round robin ---------------- */
    {
      id: 'rr-1', start: 120, end: 127.5, scene: 'rr',
      caption: 'Round robin gives each process a fixed slice, then sends it to the back of the queue.',
      detail: 'The quantum is a hard limit: a process runs for at most q units, and if it is unfinished it rejoins the tail of the ready queue. New arrivals join the tail as they arrive. With q equal to 4 on this set, A runs 0 to 4 and is cut off with 6 left, then B, then C, and so on around the queue.',
      keyword: 'fixed slice',
      trap: 'Putting a preempted process at the head of the queue instead of the tail. That turns round robin into a different algorithm and changes every completion time.',
      narration: 'Round robin gives each process a fixed slice, then sends it to the back of the queue.'
    },
    {
      id: 'rr-2', start: 127.5, end: 135, scene: 'rr',
      caption: 'The chart is A, B, C, A, D, B, A, D, and the average waiting time is 10.75.',
      detail: 'Eight segments: A 0 to 4, B 4 to 8, C 8 to 11 (finished), A 11 to 15, D 15 to 19, B 19 to 21 (finished), A 21 to 23 (finished), D 23 to 26 (finished). Waiting times are A 13, B 13, C 4 and D 12, which sum to 43 and average 10.75. That is worse than SJF and worse than FCFS.',
      keyword: '10.75',
      trap: 'Comparing round robin with SJF on average waiting time and concluding round robin is bad. It is being judged on a metric it does not optimise.',
      narration: 'The chart is A, B, C, A, D, B, A, D, and the average waiting time is 10.75.'
    },
    {
      id: 'rr-3', start: 135, end: 142.5, scene: 'rr',
      caption: 'What round robin buys is response time: 3.75 against 8.25 for FCFS.',
      detail: 'Every process gets its first slice early: A at 0, B at 4, C at 8, D at 15. Response times are 0, 2, 4 and 9, averaging 3.75, less than half the FCFS figure. A time-sharing system is judged on this number, because it is what a user perceives, and that is why round robin exists.',
      keyword: '3.75',
      trap: 'Reporting round robin as improving "performance". It improves response time and typically worsens average turnaround. Say which metric you mean.',
      narration: 'What round robin buys is response time: 3.75 against 8.25 for FCFS.'
    },
    {
      id: 'rr-4', start: 142.5, end: 150, scene: 'rr',
      caption: 'A quantum at least as long as the longest burst makes round robin identical to FCFS.',
      detail: 'Set q to 10 or more and no process is ever cut off, so the schedule is A, B, C, D end to end, which is exactly the FCFS chart. At the other end, a very small quantum turns the CPU into a switch machine: the overhead fraction q/(q+s) falls towards zero and the CPU spends its time saving and restoring contexts.',
      keyword: 'identical to FCFS',
      trap: 'Claiming a tiny quantum is best because it is fairest. Fairness in slices is not throughput; below some quantum the switch cost dominates everything.',
      narration: 'A quantum at least as long as the longest burst makes round robin identical to FCFS.'
    },

    /* ---------------- scene 6: priority ---------------- */
    {
      id: 'pr-1', start: 150, end: 157.5, scene: 'priority',
      caption: 'Priority scheduling always runs the highest-priority ready process.',
      detail: 'Each process carries a number, and the scheduler compares numbers instead of burst lengths. The convention for which end is "highest" differs between books and between questions: sometimes 0 is highest, sometimes a larger number is. Read the question, because every answer depends on that sentence.',
      keyword: 'highest-priority ready process',
      trap: 'Assuming a smaller number means higher priority. Many GATE questions state "0 is the highest priority" precisely because the default is not fixed.',
      narration: 'Priority scheduling always runs the highest-priority ready process.'
    },
    {
      id: 'pr-2', start: 157.5, end: 165, scene: 'priority',
      caption: 'Preemptive priority lets a new higher-priority arrival take the CPU immediately.',
      detail: 'With three processes of priority 2, 1 and 3 arriving at 0, 1 and 2, the preemptive schedule is P1 from 0 to 2, P3 from 2 to 4, P1 from 4 to 10, then P2 to 13. The non-preemptive schedule runs P1 to completion first: P1 0 to 8, P3 8 to 10, P2 10 to 13. The averages differ: 3.67 against 5.0.',
      keyword: 'takes the CPU immediately',
      trap: 'Running the preemptive case as if it were non-preemptive. If the question says preemptive, an arrival is an event and the Gantt chart must break there.',
      narration: 'Preemptive priority lets a new higher-priority arrival take the CPU immediately.'
    },
    {
      id: 'pr-3', start: 165, end: 172.5, scene: 'priority',
      caption: 'Starvation is not slowness. It is a schedule in which a process never runs at all.',
      detail: 'If high-priority processes keep arriving faster than the CPU can finish them, a low-priority process waits forever. Nothing in the algorithm ever says "now run the low one", so the waiting time has no upper bound. This is a different failure from the convoy effect, where every process does eventually run.',
      keyword: 'never runs at all',
      trap: 'Saying "the low-priority process waits a long time". A long wait is not starvation. The defining property is that no finite bound on the wait exists.',
      narration: 'Starvation is not slowness. It is a schedule in which a process never runs at all.'
    },
    {
      id: 'pr-4', start: 172.5, end: 180, scene: 'priority',
      caption: 'Aging raises a waiting process priority until it must be chosen.',
      detail: 'Aging adds to a process priority as it waits, so a starved process eventually outranks the newcomers. The cost is that once everyone has aged, the priorities collapse towards equal and the policy degrades towards round robin. GATE 2013 asked about a policy whose priority is proportional to waiting time, re-evaluated every T units; the answer reported for that paper is round robin, which is exactly this collapse.',
      keyword: 'aging',
      trap: 'Aging changes the schedule, so a question asking for the waiting time under aging must be simulated with the aging rule, not with the base priorities.',
      narration: 'Aging raises a waiting process priority until it must be chosen.'
    },

    /* ---------------- scene 7: MLFQ ---------------- */
    {
      id: 'mq-1', start: 180, end: 187.5, scene: 'mlfq',
      caption: 'A multilevel feedback queue uses several queues with different quanta.',
      detail: 'The top queue has the smallest quantum and the highest priority. A new process enters at the top. The scheduler always takes from the highest non-empty queue, so a process in a lower queue runs only when the queues above it are empty. This is one structure, not several algorithms: it is round robin per queue and priority between queues.',
      keyword: 'several queues',
      trap: 'Describing MLFQ as "priority scheduling with priorities". The distinguishing feature is the feedback: a process moves between queues according to its behaviour.',
      narration: 'A multilevel feedback queue uses several queues with different quanta.'
    },
    {
      id: 'mq-2', start: 187.5, end: 195, scene: 'mlfq',
      caption: 'Use your whole quantum and you are demoted; give up the CPU early and you stay.',
      detail: 'A process that exhausts its slice is assumed to be CPU-bound, so it moves down a queue with a larger slice. A process that blocks for I/O before its slice ends leaves the queue without being demoted, so an interactive job keeps its high priority. The scheduler is inferring the job type from the only evidence it has: how the job used its last slice.',
      keyword: 'demoted',
      trap: 'Thinking demotion is punishment. It is a prediction: a job that keeps using its full slice is probably long, so give it a longer slice less often.',
      narration: 'Use your whole quantum and you are demoted; give up the CPU early and you stay.'
    },
    {
      id: 'mq-3', start: 195, end: 202.5, scene: 'mlfq',
      caption: 'On this process set the average waiting time is 11.5, worse than every single-queue algorithm.',
      detail: 'With quanta of 2, then 4, then first-come-first-served at the bottom, the chart is A, B, C, D, then A, B, C, D, then A and D. Waiting times are A 15, B 8, C 10 and D 13, averaging 11.5. Round robin with quantum 4 managed 10.75 on the same set. Feedback costs average waiting time.',
      keyword: '11.5',
      trap: 'Assuming a more elaborate scheduler is better on every metric. MLFQ is chosen for response and for adapting to unknown job mixes, not for average turnaround.',
      narration: 'On this process set the average waiting time is 11.5, worse than every single-queue algorithm.'
    },
    {
      id: 'mq-4', start: 202.5, end: 210, scene: 'mlfq',
      caption: 'What it buys is that all four processes start at once: response time 0 for each.',
      detail: 'Each process is served in the top queue on arrival, so every response time is zero and the average is zero. That is the strongest possible response result, and it is why interactive systems use this structure. The bottom queue must be first-come-first-served rather than round robin, otherwise a long job can be demoted forever and never finish.',
      keyword: 'response time 0',
      trap: 'Forgetting the promotion rule. Without periodic promotion, a queue of long jobs at the bottom can be starved by a steady trickle of new short jobs at the top.',
      narration: 'What it buys is that all four processes start at once: response time 0 for each.'
    },

    /* ---------------- scene 8: overhead ---------------- */
    {
      id: 'ov-1', start: 210, end: 217.5, scene: 'overhead',
      caption: 'Every switch costs time in which no user instruction runs.',
      detail: 'The kernel saves the outgoing context, loads the incoming one, and if the address space changes, invalidates cached translations. During all of that the CPU is busy and no user process makes progress. This is why the switch is called pure overhead: it consumes the resource it is supposed to be allocating.',
      keyword: 'no user instruction runs',
      trap: 'Counting the switch as part of the quantum. The quantum is the slice the process gets; the switch is added on top, which is why the cycle is q plus s.',
      narration: 'Every switch costs time in which no user instruction runs.'
    },
    {
      id: 'ov-2', start: 217.5, end: 225, scene: 'overhead',
      caption: 'The fraction of time lost is s over q plus s, so utilisation is q over q plus s.',
      detail: 'One cycle is a slice of q followed by a switch of s, so the cycle lasts q + s and useful work is q of it. With a 1 ms switch and a 10 ms quantum, utilisation is 10 over 11, which is 90.9 per cent. At q equal to 4 it is 80 per cent, at 2 it is 66.7 per cent, and at 1 it is exactly half.',
      keyword: 'q over q plus s',
      trap: 'Dividing by q alone, which gives 100 per cent at every quantum and hides the entire effect.',
      narration: 'The fraction of time lost is s over q plus s, so utilisation is q over q plus s.'
    },
    {
      id: 'ov-3', start: 225, end: 232.5, scene: 'overhead',
      caption: 'Halving the quantum doubles the number of switches and doubles the loss.',
      detail: 'The loss per unit time is s/(q+s), which rises as q falls. Small quanta give good response time and burn CPU; large quanta give good throughput and poor response. The curve is steep below a few multiples of s and nearly flat above, so the practical choice is a quantum comfortably larger than the switch, but small enough that most bursts finish inside one slice.',
      keyword: 'doubles the loss',
      trap: 'Treating this as an exact law for all systems. It assumes exactly one switch per cycle and a fixed switch cost, which is a model, not a measurement.',
      narration: 'Halving the quantum doubles the number of switches and doubles the loss.'
    },
    {
      id: 'ov-4', start: 232.5, end: 240, scene: 'overhead',
      caption: 'So the quantum is a compromise between response time and wasted CPU.',
      detail: 'This is the only place in the topic where two metrics pull in opposite directions for the same knob. Waiting time and turnaround move together; response time moves against them. A question that changes the quantum is almost always testing whether you know which metric it is asking about, and whether you remembered to add the switch cost to the cycle.',
      keyword: 'compromise',
      trap: 'Answering "smaller quantum, better performance" without naming the metric. State the metric, then the direction.',
      narration: 'So the quantum is a compromise between response time and wasted CPU.'
    },

    /* ---------------- scene 9: I/O ---------------- */
    {
      id: 'io-1', start: 240, end: 247.5, scene: 'io',
      caption: 'A process alternates CPU bursts and I/O bursts, so the CPU scheduler sees only part of its life.',
      detail: 'The scheduler chooses who runs; it does not decide how long a process runs before it blocks. A CPU-bound process has long bursts and few of them. An I/O-bound process has short bursts and many of them, and spends most of its life waiting for a device. The pattern of bursts is what the scheduler is trying to infer.',
      keyword: 'alternates',
      trap: 'Treating a burst length as a property the scheduler knows. It is a property of the workload, and the scheduler at best predicts it.',
      narration: 'A process alternates CPU bursts and I/O bursts, so the CPU scheduler sees only part of its life.'
    },
    {
      id: 'io-2', start: 247.5, end: 255, scene: 'io',
      caption: 'With one process the CPU idles during every I/O burst; with several it can be filled.',
      detail: 'If a single process is waiting for a disk, the CPU has nothing to do. Add a second process and its CPU burst can occupy the gap. That is what multiprogramming buys, and it is why utilisation is a scheduling metric at all: the total CPU work is fixed, but the idle time is not.',
      keyword: 'CPU idles',
      trap: 'Believing scheduling reduces total CPU work. It cannot. It changes who waits and how much of the timeline is idle.',
      narration: 'With one process the CPU idles during every I/O burst; with several it can be filled.'
    },
    {
      id: "io-3", start: 255, end: 262.5, scene: 'io',
      caption: 'Favouring short bursts keeps I/O-bound processes responsive and fills the CPU.',
      detail: 'An I/O-bound process that gets the CPU quickly issues its next request quickly, which keeps the device queue busy while another process computes. So shortest-first and feedback policies are not only about fairness to small jobs: they are how a system keeps its devices and its CPU busy at the same time.',
      keyword: 'short bursts',
      trap: 'Assuming the device side is free. The I/O scheduler and the disk scheduling policy decide the order of requests at the device, which is a separate decision from which process runs.',
      narration: 'Favouring short bursts keeps I/O-bound processes responsive and fills the CPU.'
    },
    {
      id: 'io-4', start: 262.5, end: 270, scene: 'io',
      caption: 'The syllabus names CPU and I/O scheduling together; the disk side gets its own lesson.',
      detail: 'Section 8 of the official syllabus says "CPU and I/O scheduling". This lesson covers the CPU scheduler: the algorithms, the metrics, the quantum, priority and feedback. The I/O side — first-come-first-served, shortest seek time first, SCAN, C-SCAN, LOOK and the head-movement arithmetic — is a different set of questions with a different diagram, and it remains recorded as uncovered in the coverage tracker.',
      keyword: 'CPU and I/O scheduling',
      trap: 'Mixing the two in one answer. A disk request queue is ordered by cylinder, not by process; the two schedulers are separate and the questions are separate.',
      narration: 'The syllabus names CPU and I/O scheduling together; the disk side gets its own lesson.'
    },

    /* ---------------- scene 10: recipe ---------------- */
    {
      id: 'rc-1', start: 270, end: 277.5, scene: 'recipe',
      caption: 'Step one: fix the rules. Preemptive or not, and are the bursts known?',
      detail: 'Every scheduling question is decided by three facts stated in its first two sentences: whether the algorithm preempts, whether the burst lengths are known in advance, and which quantity is being averaged. Write them down before drawing anything. Most wrong answers come from answering a different question than the one asked.',
      keyword: 'fix the rules',
      trap: 'Starting the Gantt chart before deciding whether an arrival can preempt. The whole chart changes, and redrawing it costs more time than reading the rules.',
      narration: 'Step one: fix the rules. Preemptive or not, and are the bursts known?'
    },
    {
      id: 'rc-2', start: 277.5, end: 285, scene: 'recipe',
      caption: 'Step two: draw the chart from the arrival events, one segment per run.',
      detail: 'Mark every arrival time on the axis first. Then walk the timeline, choosing at each decision point by the stated rule, and break the bar whenever the choice changes. A preempted process that resumes gets a new segment, not a lengthened one. The chart is the answer; the numbers are a reading of it.',
      keyword: 'from the arrival events',
      trap: 'Skipping idle time. If no process has arrived, the axis still advances, and ignoring that gap shifts every completion time and every average.',
      narration: 'Step two: draw the chart from the arrival events, one segment per run.'
    },
    {
      id: 'rc-3', start: 285, end: 292.5, scene: 'recipe',
      caption: 'Step three: read completion times off the chart, then subtract.',
      detail: 'Turnaround is completion minus arrival. Waiting is turnaround minus burst. Response is the first start minus arrival. Do the subtraction per process, check that no waiting time is negative, and only then divide by the number of processes. A negative waiting time means the burst or the arrival was copied wrongly, and it is worth catching before the average is computed.',
      keyword: 'read completion times',
      trap: 'Averaging the wrong column. Waiting and turnaround differ by the burst, so an answer that is off by a constant is usually the other metric.',
      narration: 'Step three: read completion times off the chart, then subtract.'
    },
    {
      id: 'rc-4', start: 292.5, end: 300, scene: 'recipe',
      caption: 'Five traps: the divisor, idle time, ties, the metric, and the ignored switch cost.',
      detail: 'Divide by the number of processes in the set, not by those that had arrived. Advance the axis through idle gaps. Do not preempt on a tie unless told to. Answer the metric that was asked. And if the question says to ignore context switches, do so, but if it gives a switch cost, add it to the cycle before dividing. Those five cover most lost marks in this topic.',
      keyword: 'five traps',
      trap: 'Recomputing the schedule when the question asks only for a comparison. Often two algorithms share a prefix, and the difference can be read off the chart without a full second simulation.',
      narration: 'Five traps: the divisor, idle time, ties, the metric, and the ignored switch cost.'
    }
  ]
};
