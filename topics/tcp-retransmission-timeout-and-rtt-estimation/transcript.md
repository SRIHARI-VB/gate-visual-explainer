# Tcp Retransmission Timeout And Rtt Estimation — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/tcp-retransmission-timeout-and-rtt-estimation/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. One number, restarted by new data

*0:00 – 0:30 · objective: State what the retransmission timer is: one duration, RTO, running for the oldest unacknowledged segment, restarted by an ACK that acknowledges new data and switched off when nothing is outstanding.*

**0:00–0:07** — A TCP sender keeps one retransmission timer. The duration it waits is called the R T O, the retransmission timeout. It is a duration the sender chooses, not one it measures.

> Caption: A TCP sender keeps one retransmission timer. Its duration is the RTO.

Exam-trap caption mode adds: *RTO is not the RTT. The RTT is measured; the RTO is computed from those measurements.*

**0:07–0:15** — The timer guards the oldest segment still unacknowledged. When an ACK arrives that acknowledges new data, the timer restarts, so it always expires R T O after the most recent progress.

> Caption: The timer runs for the oldest unacknowledged segment, and an ACK for new data restarts it.

Exam-trap caption mode adds: *A duplicate ACK does not acknowledge new data, so it does not restart the timer the same way.*

**0:15–0:22** — With a twelve hundred millisecond timer, a send at zero starts a deadline at twelve hundred. The ACK at four hundred moves the deadline to sixteen hundred. The ACK at eight hundred moves it to two thousand, and then nothing is outstanding, so the timer stops.

> Caption: With a 1200 ms timer and ACKs at 400 and 800 ms, the deadline moves to 1600 then 2000 ms.

**0:22–0:30** — If the deadline passes with data still unacknowledged, the sender retransmits the earliest unacknowledged segment, doubles the timer, and starts it again. That doubling is the backoff, and it is the subject of scene eight.

> Caption: On expiry the sender retransmits the earliest unacknowledged segment and doubles the timer.

Exam-trap caption mode adds: *Expiry does not mean the segment was lost. It means no ACK arrived within RTO, which is a different statement.*

## Scene 2. Two ways to be wrong

*0:30 – 1:00 · objective: See both failures of a badly chosen RTO — a timer that fires before the ACK can arrive, and a timer that waits many round trips after a real loss — and compute how much each costs.*

**0:30–0:37** — The timer is a bet about how long an ACK can take. Bet too low and it fires while the ACK is still on its way. Bet too high and it sits idle after a real loss. One error costs bandwidth, the other costs time.

> Caption: The timer is a bet on how long an ACK can take. Both errors are paid in bandwidth.

**0:37–0:45** — Take a path whose round trip is four hundred milliseconds and a timer of only one hundred and twenty. The timer expires at one twenty, two forty and three sixty, so three extra copies go out before the first ACK could even arrive. Three copies, all wasted.

> Caption: A 120 ms timer on a 400 ms path fires three times before the first ACK arrives.

Exam-trap caption mode adds: *Each spurious copy also looks like congestion to the receiver, so the cost is not only bandwidth.*

**0:45–0:52** — Now the other error. A twelve second timer on the same four hundred millisecond path waits thirty round trips before it repairs one loss. Thirty round trips of silence, for one missing segment.

> Caption: A 12 second timer on the same path waits thirty round trips before repairing one loss.

**0:52–1:00** — So the timer has to adapt to the path, and the path changes as queues fill and routes change. That is why the estimator is not a refinement but a requirement: a fixed timer cannot serve both a local network and a path across an ocean.

> Caption: So the timer must adapt to the path, and the path changes minute by minute.

## Scene 3. The first sample: 3R, and then the floor

*1:00 – 1:30 · objective: Apply the first-measurement rule SRTT = R, RTTVAR = R/2, RTO = SRTT + 4 RTTVAR, and see the one-second floor replace the answer on a fast path.*

**1:00–1:07** — Before the sender has measured anything, the timer is one second. That is the modern default; the older document used three seconds, and an implementation may still choose a larger value.

> Caption: Before any measurement the timer is one second. RFC 6298 lowered this from three.

**1:07–1:15** — The first measurement does two things. It puts the smoothed round trip, S R T T, at the sample itself. And it puts the variation, R T T V A R, at half the sample, because one sample gives no spread to measure, so the rule assumes one.

> Caption: The first sample R sets the centre to R and the spread to R over 2.

**1:15–1:22** — Forty milliseconds gives a centre of forty and a spread of twenty. Four spreads is eighty, so the computed timer is one hundred and twenty milliseconds. But the rule says a computed timer below one second is raised to one second, so the value actually used is one thousand milliseconds.

> Caption: With R = 40 ms the rule gives 40 + 4 x 20 = 120 ms, then the floor raises it to 1000 ms.

Exam-trap caption mode adds: *The floor is applied to the computed RTO, not to the estimate. SRTT and RTTVAR still hold 40 and 20.*

**1:22–1:30** — The floor is not an accident of arithmetic. A minimum timer keeps the sender conservative: on a fast path, retransmitting too early adds a copy to a network that did not need it. The cost is that a local connection still waits a full second to notice a loss.

> Caption: The floor is deliberate: a minimum timer keeps TCP conservative on fast paths.

Exam-trap caption mode adds: *Do not apply the floor to RTTVAR or SRTT. Only the timer has a floor.*

## Scene 4. Two running averages, not one

*1:30 – 2:00 · objective: Run the update rules on five samples and read the trace: SRTT tracks the centre, RTTVAR tracks the spread, and the RTO is the centre plus four spreads.*

**1:30–1:37** — Each new sample moves two numbers. The centre moves by one eighth of the gap between it and the sample. The spread moves by one quarter of the gap between the old centre and the sample. Slow centre, faster spread.

> Caption: A new sample moves the centre by one eighth of the gap, and the spread by one quarter.

**1:37–1:45** — Here are five samples from a four hundred millisecond path, with one eight hundred millisecond outlier at the end. The table is computed when the page loads, so every figure below can be checked against the rules.

> Caption: Five samples: 400, 380, 420, 400 and 800 ms, all computed on this page.

**1:45–1:52** — After the fifth sample the centre is four hundred and fifty point two four milliseconds and the spread is one hundred and sixty eight point five four. Four spreads is six hundred and seventy four, so the timer is eleven hundred and twenty four point four two milliseconds.

> Caption: The centre ends at 450.24 ms and the spread at 168.54 ms, so the timer is 1124.42 ms.

**1:52–2:00** — The outlier did not drag the centre to eight hundred; it moved it by only fifty, because the centre takes one eighth of a gap. The spread took one quarter, and it nearly doubled. That is why the timer grew by three hundred and fifty eight milliseconds while the centre grew by fifty.

> Caption: Notice the outlier did not drag the centre all the way to 800; it moved the spread more.

Exam-trap caption mode adds: *The estimator is not a mean of the samples. A mean of these five is 480 ms, not 450.24 ms.*

## Scene 5. The two updates are ordered

*2:00 – 2:30 · objective: Show that RTTVAR must be updated with the OLD SRTT, and compute the difference the swapped order makes to the same sample.*

**2:00–2:07** — The two lines of the update have a fixed order. The spread is updated first, using the old centre. Only then is the centre moved. The document says this in as many words, because the other order changes the answer.

> Caption: The two lines of rule 2.3 must run in the order written: spread first.

**2:07–2:15** — Take the fifth sample. The old centre is four hundred point two seven and the old spread is ninety one point four eight. One quarter of the gap between the old centre and eight hundred is ninety nine point nine three, so the new spread is one hundred and sixty eight point five four, and the timer is eleven hundred and twenty four point four two.

> Caption: On the fifth sample the correct order gives RTTVAR 168.54 ms and RTO 1124.42 ms.

**2:15–2:22** — Now swap the order and use the new centre. The gap to eight hundred shrinks to three hundred and forty nine point seven six, so the spread comes out at one hundred and fifty six point zero five and the timer at ten hundred and seventy four point four five. Fifty milliseconds short, from one swapped line.

> Caption: Swapping the order gives 156.05 ms and a timer of 1074.45 ms: about 50 ms short.

Exam-trap caption mode adds: *The swapped order is not a different algorithm; it is the same algorithm with one line moved, and it under-estimates the spread.*

**2:22–2:30** — The error always points the same way. Once the centre has moved toward the sample, the gap you measure is smaller than the real one, so the spread is too small and the timer too short. It is worst exactly when the path changed, which is when you needed the spread.

> Caption: The error always points the same way: a gap measured from a centre that already moved.

## Scene 6. One spike, and the estimate moves

*2:30 – 3:00 · objective: Feed one sample four times the steady value into a converged estimator and see how far the centre, the spread and the timer move.*

**2:30–2:37** — On a steady path every gap is zero, so the spread is multiplied by three quarters each time and shrinks toward zero. The computed timer settles just above the round trip itself, and on this path the one second floor is what the sender actually uses.

> Caption: A steady path converges the spread toward zero, so the timer sits just above the round trip.

**2:37–2:45** — Now one sample of sixteen hundred milliseconds, four times the steady value. The centre rises to five hundred and fifty. The spread rises to three hundred point zero four. The timer becomes seventeen hundred and fifty point one four.

> Caption: One sample of 1600 ms lifts the centre to 550 and the spread to 300.04 ms.

**2:45–2:52** — From the floor of one second the timer grew to seventeen hundred and fifty, a factor of one point seven five, from a single sample. And it comes back down at the same rate the spread shrank: three quarters of the remaining excess on each new sample.

> Caption: The timer grew by a factor of 1.75 from one sample, and it decays back by three quarters a sample.

**2:52–3:00** — So the estimator behaves like a low pass filter, not a maximum. One slow sample does not set the timer forever; it fades. The price is that the estimate lags when the path genuinely gets worse, and the spread term is what carries the safety margin.

> Caption: So the estimator is a low-pass filter, not a maximum: one delay does not set the timer forever.

Exam-trap caption mode adds: *Do not describe RTTVAR as a variance. It is a smoothed mean absolute deviation; four of them are four deviations, not four standard deviations.*

## Scene 7. Karn's rule: an ACK you cannot time

*3:00 – 3:30 · objective: Show the retransmission ambiguity with two computed scenarios, and state Karn's rule: no RTT sample from a segment that was retransmitted, unless timestamps remove the ambiguity.*

**3:00–3:07** — After a retransmission the ACK is ambiguous. It acknowledges a sequence number, and both copies carry that same number. Nothing in the ACK says which copy caused it, so the sender does not know which send time to subtract.

> Caption: After a retransmission, an arriving ACK may answer either copy. That is the ambiguity.

**3:07–3:15** — Here is the first scenario. The segment went out at zero and the timer was twelve hundred. A copy goes out at twelve hundred and an ACK arrives fifty milliseconds later. If you time from the copy, you record fifty milliseconds for a path whose round trip is four hundred. One eighth of the truth.

> Caption: An ACK at 1250 ms after a retransmission at 1200 gives 50 ms for a 400 ms path.

Exam-trap caption mode adds: *The sample is not merely noisy; it is wrong in a direction that shrinks the timer, which is the dangerous direction.*

**3:15–3:22** — And here is the mirror image. This time the ACK really does answer the copy, arriving at sixteen hundred. Time from the original send and you record sixteen hundred milliseconds, four times the truth. Either choice can be wrong by a factor of four or eight.

> Caption: The other scenario: the ACK for the copy arrives at 1600 ms, so timing from the original gives 1600.

**3:22–3:30** — So the rule is simple: take no sample from a segment that was retransmitted. Keep the timer you had, and let the doubling in the next scene handle the uncertainty. The one exception is the timestamp option, which puts the send time in the segment and so removes the ambiguity entirely.

> Caption: Karn's rule: take no sample from a retransmitted segment; keep the timer and let it back off.

Exam-trap caption mode adds: *Karn's rule forbids the sample, not the retransmission. The ACK still acknowledges data and still restarts the timer.*

## Scene 8. Doubling, and the ceiling

*3:30 – 4:00 · objective: Apply RTO <- 2 RTO on every expiry, follow the ladder from the worked value to the sixty-second maximum, and separate backoff from recomputation.*

**3:30–3:37** — On every expiry the timer doubles. Twelve hundred becomes twenty four hundred, then forty eight hundred, then ninety six hundred. No measurement is involved; the doubling is the sender admitting it does not know how long the path is taking.

> Caption: Every expiry doubles the timer: 1200, 2400, 4800 and on.

**3:37–3:45** — From twelve hundred milliseconds the ladder is twenty four hundred, forty eight hundred, ninety six hundred, nineteen thousand two hundred, thirty eight thousand four hundred, and then it stops at sixty thousand, because the next doubling would pass the maximum. Six doublings to reach the ceiling.

> Caption: From 1200 ms the ladder reaches the 60 second maximum after six doublings.

**3:45–3:52** — Doubling and recomputing are different operations. Doubling multiplies what you have. Recomputing builds a new value from a fresh sample. The timer only comes back down when a sample is taken again and the formula gives something smaller.

> Caption: Backoff and recomputation are different operations, and only an ACK ends the backoff.

Exam-trap caption mode adds: *A doubled timer is not evidence that the path is now slow. It is the sender being conservative while it has no measurement.*

**3:52–4:00** — There is one more rule worth carrying. If the timer expires while waiting for the ACK of a SYN, and your timer is below three seconds, then when the handshake completes the timer must be re-initialised to three seconds for the data. A handshake is not a measurement of the data path.

> Caption: One more rule: if the timer expires waiting for a SYN ACK, the RTO returns to 3 seconds for data.

Exam-trap caption mode adds: *This rule is about the handshake only. It does not raise the timer for ordinary data on an established connection.*

## Scene 9. How fast the estimate settles

*4:00 – 4:30 · objective: Use the closed form for a constant round trip, count the samples needed to bring the computed timer within ten per cent, and collect the constants worth carrying into an exam.*

**4:00–4:07** — On a path whose round trip never changes, the spread has a closed form: half the sample, times three quarters to the power n minus one. After forty samples it is two thousandths of a millisecond, which is why a steady path has a timer sitting on the floor.

> Caption: On a constant path the spread after n samples is 200 times 0.75 to the n minus 1.

**4:07–4:15** — The computed timer comes within ten per cent of the round trip when four spreads fall below forty milliseconds, that is when the spread falls below ten. Scanning the trace, that first happens at the twelfth sample. Eleven updates to trust the estimate, on a path that never changed.

> Caption: The computed timer comes within ten per cent of the round trip at the twelfth sample.

**4:15–4:22** — So the constants to carry are these. One eighth for the centre, one quarter for the spread, four spreads of margin, a floor of one second, and a ceiling you may set at sixty seconds or more. The initial value is one second.

> Caption: The constants worth carrying: 1/8, 1/4, K = 4, a 1 s floor and a 60 s ceiling.

Exam-trap caption mode adds: *The floor is one second and the ceiling is at least sixty. Confusing the two is the most common slip in a calculation.*

**4:22–4:30** — Every figure here is computed when the page loads, and the count of checks that passed is printed under the canvas. If a number were wrong, the count would say so before you read the number.

> Caption: Every figure on this page is computed, and the count of passing checks is printed under the canvas.

## Scene 10. The procedure and the four slips

*4:30 – 5:00 · objective: Consolidate the five steps that answer any question on this topic, and name the four errors that cost the mark.*

**4:30–4:37** — Step one is always the same question: does a sample exist? None means the initial value. One means the first-measurement rule. Two or more means the update rule, spread first, centre second.

> Caption: Step one: ask whether a sample exists, because that decides which rule applies.

**4:37–4:45** — Step two: compute first, then clamp. Raise the result to one second if it came out below, cap it at sixty if your implementation has a ceiling. Never clamp the spread; only the timer has a floor.

> Caption: Step two: apply the floor and the ceiling after computing, never before.

Exam-trap caption mode adds: *Clamping SRTT or RTTVAR changes every subsequent row, so the final answer is wrong even if the first clamp looked harmless.*

**4:45–4:52** — Step three: look at the history. If the segment was retransmitted, take no sample; the timer was doubled at the expiry, and that is the whole of its update. The ACK still restarts the timer, because it still acknowledges new data.

> Caption: Step three: a retransmission in the history means no sample, and a doubling instead.

**4:52–5:00** — And the four slips that cost the mark: averaging the samples instead of smoothing them, reading the spread as a variance, swapping the two updates, and clamping the spread instead of the timer. Each one is checked on this page, so you can see what it costs.

> Caption: The four slips: a mean instead of a filter, a variance, a swapped order, and a clamped spread.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
