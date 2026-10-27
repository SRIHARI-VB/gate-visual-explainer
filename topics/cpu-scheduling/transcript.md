# CPU Scheduling — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/cpu-scheduling/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. What the scheduler decides, and what we measure

*0:00 – 0:30 · objective: Name the only decision a CPU scheduler makes, and define the five quantities every scheduling question is scored on.*

**0:00–0:07** — The scheduler makes one decision, again and again: which ready process runs next.

> Caption: The scheduler makes one decision, again and again: which ready process runs next.

Exam-trap caption mode adds: *Believing the scheduler moves a process through the state diagram. It does not: it only chooses, and the chosen process moves from ready to running.*

**0:07–0:15** — Five numbers describe a schedule: utilisation, throughput, turnaround, waiting and response.

> Caption: Five numbers describe a schedule: utilisation, throughput, turnaround, waiting and response.

Exam-trap caption mode adds: *Treating waiting time and turnaround time as the same thing. Turnaround includes the burst; waiting does not. A question that asks for waiting and is answered with turnaround is off by exactly the burst.*

**0:15–0:22** — Turnaround is completion minus arrival. Waiting is turnaround minus the burst.

> Caption: Turnaround is completion minus arrival. Waiting is turnaround minus the burst.

Exam-trap caption mode adds: *Averaging over the number of processes that arrived by some time, or dividing by the wrong count when a question has four processes and asks for an average. The divisor is the number of processes in the set, always.*

**0:22–0:30** — Response time is the first slice only, which is why round robin can improve it without improving the average.

> Caption: Response time is the first slice only, which is why round robin can improve it without improving the average.

Exam-trap caption mode adds: *Assuming a smaller quantum improves every metric. It improves response time, and it usually makes average turnaround worse while adding switch overhead.*

## Scene 2. First Come First Served and the convoy effect

*0:30 – 1:00 · objective: Read a Gantt chart for FCFS on a fixed process set, compute its average waiting time, and explain the convoy effect.*

**0:30–0:37** — FCFS runs processes in arrival order and never preempts: A, then B, then C, then D.

> Caption: FCFS runs processes in arrival order and never preempts: A, then B, then C, then D.

Exam-trap caption mode adds: *Sorting by arrival time when two processes arrive together. FCFS breaks ties by the order they joined the ready queue, and the question usually says which that is.*

**0:37–0:45** — The waiting times are 0, 8, 12 and 13, so the average waiting time is 8.25.

> Caption: The waiting times are 0, 8, 12 and 13, so the average waiting time is 8.25.

Exam-trap caption mode adds: *Reading the waiting time off the Gantt chart as the gap before a bar rather than arrival to start. The gap you can see is the wait only when the process arrived exactly when the previous one finished.*

**0:45–0:52** — This is the convoy effect: one long job at the head makes everyone behind it late.

> Caption: This is the convoy effect: one long job at the head makes everyone behind it late.

Exam-trap caption mode adds: *Concluding that FCFS is always bad. With bursts of similar length it is close to optimal and costs almost nothing to implement. The convoy effect is a statement about unequal bursts.*

**0:52–1:00** — FCFS never starves anyone, and it cannot preempt, so a long job can block an interactive one.

> Caption: FCFS never starves anyone, and it cannot preempt, so a long job can block an interactive one.

Exam-trap caption mode adds: *Marking FCFS as a starvation-causing algorithm. It is the one simple algorithm that provably does not starve; SJF and priority scheduling are the starvation candidates.*

## Scene 3. Shortest Job First: optimal, and not fair

*1:00 – 1:30 · objective: Show why non-preemptive SJF minimises average waiting time among schedules that respect arrivals, and name the assumption it needs.*

**1:00–1:07** — SJF picks the shortest burst among the processes that have arrived, and still never preempts.

> Caption: SJF picks the shortest burst among the processes that have arrived, and still never preempts.

Exam-trap caption mode adds: *Ordering all four by burst length and starting with C. C has not arrived at time zero, so no non-preemptive scheduler can run it there. The arrival constraint is part of the problem, not a detail.*

**1:07–1:15** — Waiting times 0, 11, 6 and 13: average 7.5, better than 8.25 for FCFS.

> Caption: Waiting times 0, 11, 6 and 13: average 7.5, better than 8.25 for FCFS.

Exam-trap caption mode adds: *Expecting every process to improve. One process in this schedule gets worse, and that is normal: an average is not a guarantee.*

**1:15–1:22** — SJF is optimal for average waiting time, and the proof is an exchange argument.

> Caption: SJF is optimal for average waiting time, and the proof is an exchange argument.

Exam-trap caption mode adds: *Reading this as "SJF is the best algorithm". The theorem is about average waiting time, given known bursts, with arrivals respected. It says nothing about response time, fairness, or the case where bursts are unknown.*

**1:22–1:30** — The theorem assumes the bursts are known. In a real system they must be predicted.

> Caption: The theorem assumes the bursts are known. In a real system they must be predicted.

Exam-trap caption mode adds: *Forgetting the words "if the scheduler has prior knowledge of the burst lengths" in a question. Without them, an answer that relies on exact SJF ordering is not licensed.*

## Scene 4. Shortest Remaining Time First

*1:30 – 2:00 · objective: Preempt at arrivals only, draw the SRTF Gantt chart, and see one process lose badly while the average improves.*

**1:30–1:37** — SRTF is SJF with preemption: at every arrival, compare remaining times.

> Caption: SRTF is SJF with preemption: at every arrival, compare remaining times.

Exam-trap caption mode adds: *Preempting when remaining times are equal. A tie is not a reason to preempt; the question normally states the tie rule, and if it does not, the running process continues.*

**1:37–1:45** — The chart is A 0 to 2, B 2 to 4, C 4 to 7, B 7 to 11, D 11 to 18, A 18 to 26.

> Caption: The chart is A 0 to 2, B 2 to 4, C 4 to 7, B 7 to 11, D 11 to 18, A 18 to 26.

Exam-trap caption mode adds: *Losing a segment when redrawing. A preempted process reappears later, and forgetting one resume changes every completion time after it.*

**1:45–1:52** — Average waiting falls to 6, but A waits 16 instead of 0.

> Caption: Average waiting falls to 6, but A waits 16 instead of 0.

Exam-trap caption mode adds: *Assuming the preemptive version must be better for everyone. It is better on average and worse for the long jobs, and a long job can be starved indefinitely by a steady stream of short ones.*

**1:52–2:00** — Its response time is the best of the four algorithms: 1.25 on average.

> Caption: Its response time is the best of the four algorithms: 1.25 on average.

Exam-trap caption mode adds: *Computing response time as completion minus arrival. That is turnaround. Response stops at the first moment the process ever ran.*

## Scene 5. Round Robin and the time quantum

*2:00 – 2:30 · objective: Run round robin with quantum 4, compare its waiting time with its response time, and show both degenerate limits of the quantum.*

**2:00–2:07** — Round robin gives each process a fixed slice, then sends it to the back of the queue.

> Caption: Round robin gives each process a fixed slice, then sends it to the back of the queue.

Exam-trap caption mode adds: *Putting a preempted process at the head of the queue instead of the tail. That turns round robin into a different algorithm and changes every completion time.*

**2:07–2:15** — The chart is A, B, C, A, D, B, A, D, and the average waiting time is 10.75.

> Caption: The chart is A, B, C, A, D, B, A, D, and the average waiting time is 10.75.

Exam-trap caption mode adds: *Comparing round robin with SJF on average waiting time and concluding round robin is bad. It is being judged on a metric it does not optimise.*

**2:15–2:22** — What round robin buys is response time: 3.75 against 8.25 for FCFS.

> Caption: What round robin buys is response time: 3.75 against 8.25 for FCFS.

Exam-trap caption mode adds: *Reporting round robin as improving "performance". It improves response time and typically worsens average turnaround. Say which metric you mean.*

**2:22–2:30** — A quantum at least as long as the longest burst makes round robin identical to FCFS.

> Caption: A quantum at least as long as the longest burst makes round robin identical to FCFS.

Exam-trap caption mode adds: *Claiming a tiny quantum is best because it is fairest. Fairness in slices is not throughput; below some quantum the switch cost dominates everything.*

## Scene 6. Priority scheduling, starvation and aging

*2:30 – 3:00 · objective: Distinguish preemptive from non-preemptive priority, show starvation as a schedule that never ends, and fix it with aging.*

**2:30–2:37** — Priority scheduling always runs the highest-priority ready process.

> Caption: Priority scheduling always runs the highest-priority ready process.

Exam-trap caption mode adds: *Assuming a smaller number means higher priority. Many GATE questions state "0 is the highest priority" precisely because the default is not fixed.*

**2:37–2:45** — Preemptive priority lets a new higher-priority arrival take the CPU immediately.

> Caption: Preemptive priority lets a new higher-priority arrival take the CPU immediately.

Exam-trap caption mode adds: *Running the preemptive case as if it were non-preemptive. If the question says preemptive, an arrival is an event and the Gantt chart must break there.*

**2:45–2:52** — Starvation is not slowness. It is a schedule in which a process never runs at all.

> Caption: Starvation is not slowness. It is a schedule in which a process never runs at all.

Exam-trap caption mode adds: *Saying "the low-priority process waits a long time". A long wait is not starvation. The defining property is that no finite bound on the wait exists.*

**2:52–3:00** — Aging raises a waiting process priority until it must be chosen.

> Caption: Aging raises a waiting process priority until it must be chosen.

Exam-trap caption mode adds: *Aging changes the schedule, so a question asking for the waiting time under aging must be simulated with the aging rule, not with the base priorities.*

## Scene 7. Multilevel feedback queues

*3:00 – 3:30 · objective: Trace one process set through three queues with growing quanta, and read the response-time gain against the turnaround-time cost.*

**3:00–3:07** — A multilevel feedback queue uses several queues with different quanta.

> Caption: A multilevel feedback queue uses several queues with different quanta.

Exam-trap caption mode adds: *Describing MLFQ as "priority scheduling with priorities". The distinguishing feature is the feedback: a process moves between queues according to its behaviour.*

**3:07–3:15** — Use your whole quantum and you are demoted; give up the CPU early and you stay.

> Caption: Use your whole quantum and you are demoted; give up the CPU early and you stay.

Exam-trap caption mode adds: *Thinking demotion is punishment. It is a prediction: a job that keeps using its full slice is probably long, so give it a longer slice less often.*

**3:15–3:22** — On this process set the average waiting time is 11.5, worse than every single-queue algorithm.

> Caption: On this process set the average waiting time is 11.5, worse than every single-queue algorithm.

Exam-trap caption mode adds: *Assuming a more elaborate scheduler is better on every metric. MLFQ is chosen for response and for adapting to unknown job mixes, not for average turnaround.*

**3:22–3:30** — What it buys is that all four processes start at once: response time 0 for each.

> Caption: What it buys is that all four processes start at once: response time 0 for each.

Exam-trap caption mode adds: *Forgetting the promotion rule. Without periodic promotion, a queue of long jobs at the bottom can be starved by a steady trickle of new short jobs at the top.*

## Scene 8. The quantum against the switch cost

*3:30 – 4:00 · objective: Compute the fraction of CPU time lost to context switches as q/(q+s), and use it to explain why the quantum cannot be tiny.*

**3:30–3:37** — Every switch costs time in which no user instruction runs.

> Caption: Every switch costs time in which no user instruction runs.

Exam-trap caption mode adds: *Counting the switch as part of the quantum. The quantum is the slice the process gets; the switch is added on top, which is why the cycle is q plus s.*

**3:37–3:45** — The fraction of time lost is s over q plus s, so utilisation is q over q plus s.

> Caption: The fraction of time lost is s over q plus s, so utilisation is q over q plus s.

Exam-trap caption mode adds: *Dividing by q alone, which gives 100 per cent at every quantum and hides the entire effect.*

**3:45–3:52** — Halving the quantum doubles the number of switches and doubles the loss.

> Caption: Halving the quantum doubles the number of switches and doubles the loss.

Exam-trap caption mode adds: *Treating this as an exact law for all systems. It assumes exactly one switch per cycle and a fixed switch cost, which is a model, not a measurement.*

**3:52–4:00** — So the quantum is a compromise between response time and wasted CPU.

> Caption: So the quantum is a compromise between response time and wasted CPU.

Exam-trap caption mode adds: *Answering "smaller quantum, better performance" without naming the metric. State the metric, then the direction.*

## Scene 9. CPU and I/O scheduling together

*4:00 – 4:30 · objective: Place CPU bursts and I/O bursts in one picture, and say why favouring short bursts raises both utilisation and response.*

**4:00–4:07** — A process alternates CPU bursts and I/O bursts, so the CPU scheduler sees only part of its life.

> Caption: A process alternates CPU bursts and I/O bursts, so the CPU scheduler sees only part of its life.

Exam-trap caption mode adds: *Treating a burst length as a property the scheduler knows. It is a property of the workload, and the scheduler at best predicts it.*

**4:07–4:15** — With one process the CPU idles during every I/O burst; with several it can be filled.

> Caption: With one process the CPU idles during every I/O burst; with several it can be filled.

Exam-trap caption mode adds: *Believing scheduling reduces total CPU work. It cannot. It changes who waits and how much of the timeline is idle.*

**4:15–4:22** — Favouring short bursts keeps I/O-bound processes responsive and fills the CPU.

> Caption: Favouring short bursts keeps I/O-bound processes responsive and fills the CPU.

Exam-trap caption mode adds: *Assuming the device side is free. The I/O scheduler and the disk scheduling policy decide the order of requests at the device, which is a separate decision from which process runs.*

**4:22–4:30** — The syllabus names CPU and I/O scheduling together; the disk side gets its own lesson.

> Caption: The syllabus names CPU and I/O scheduling together; the disk side gets its own lesson.

Exam-trap caption mode adds: *Mixing the two in one answer. A disk request queue is ordered by cylinder, not by process; the two schedulers are separate and the questions are separate.*

## Scene 10. The procedure and the five traps

*4:30 – 5:00 · objective: Reduce any scheduling question to four steps, and name the five errors that cost marks even when the Gantt chart is right.*

**4:30–4:37** — Step one: fix the rules. Preemptive or not, and are the bursts known?

> Caption: Step one: fix the rules. Preemptive or not, and are the bursts known?

Exam-trap caption mode adds: *Starting the Gantt chart before deciding whether an arrival can preempt. The whole chart changes, and redrawing it costs more time than reading the rules.*

**4:37–4:45** — Step two: draw the chart from the arrival events, one segment per run.

> Caption: Step two: draw the chart from the arrival events, one segment per run.

Exam-trap caption mode adds: *Skipping idle time. If no process has arrived, the axis still advances, and ignoring that gap shifts every completion time and every average.*

**4:45–4:52** — Step three: read completion times off the chart, then subtract.

> Caption: Step three: read completion times off the chart, then subtract.

Exam-trap caption mode adds: *Averaging the wrong column. Waiting and turnaround differ by the burst, so an answer that is off by a constant is usually the other metric.*

**4:52–5:00** — Five traps: the divisor, idle time, ties, the metric, and the ignored switch cost.

> Caption: Five traps: the divisor, idle time, ties, the metric, and the ignored switch cost.

Exam-trap caption mode adds: *Recomputing the schedule when the question asks only for a comparison. Often two algorithms share a prefix, and the difference can be read off the chart without a full second simulation.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
