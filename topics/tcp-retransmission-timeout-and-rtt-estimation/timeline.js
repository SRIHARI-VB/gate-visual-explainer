/* ==========================================================================
   tcp-retransmission-timeout-and-rtt-estimation — THE timeline.
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
      id: 'timer',
      n: 1,
      title: 'One number, restarted by new data',
      start: 0, end: 30,
      objective: 'State what the retransmission timer is: one duration, RTO, running for the oldest unacknowledged segment, restarted by an ACK that acknowledges new data and switched off when nothing is outstanding.'
    },
    {
      id: 'cost',
      n: 2,
      title: 'Two ways to be wrong',
      start: 30, end: 60,
      objective: 'See both failures of a badly chosen RTO — a timer that fires before the ACK can arrive, and a timer that waits many round trips after a real loss — and compute how much each costs.'
    },
    {
      id: 'first',
      n: 3,
      title: 'The first sample: 3R, and then the floor',
      start: 60, end: 90,
      objective: 'Apply the first-measurement rule SRTT = R, RTTVAR = R/2, RTO = SRTT + 4 RTTVAR, and see the one-second floor replace the answer on a fast path.'
    },
    {
      id: 'averages',
      n: 4,
      title: 'Two running averages, not one',
      start: 90, end: 120,
      objective: 'Run the update rules on five samples and read the trace: SRTT tracks the centre, RTTVAR tracks the spread, and the RTO is the centre plus four spreads.'
    },
    {
      id: 'order',
      n: 5,
      title: 'The two updates are ordered',
      start: 120, end: 150,
      objective: 'Show that RTTVAR must be updated with the OLD SRTT, and compute the difference the swapped order makes to the same sample.'
    },
    {
      id: 'spike',
      n: 6,
      title: 'One spike, and the estimate moves',
      start: 150, end: 180,
      objective: 'Feed one sample four times the steady value into a converged estimator and see how far the centre, the spread and the timer move.'
    },
    {
      id: 'karn',
      n: 7,
      title: "Karn's rule: an ACK you cannot time",
      start: 180, end: 210,
      objective: 'Show the retransmission ambiguity with two computed scenarios, and state Karn\'s rule: no RTT sample from a segment that was retransmitted, unless timestamps remove the ambiguity.'
    },
    {
      id: 'backoff',
      n: 8,
      title: 'Doubling, and the ceiling',
      start: 210, end: 240,
      objective: 'Apply RTO <- 2 RTO on every expiry, follow the ladder from the worked value to the sixty-second maximum, and separate backoff from recomputation.'
    },
    {
      id: 'converge',
      n: 9,
      title: 'How fast the estimate settles',
      start: 240, end: 270,
      objective: 'Use the closed form for a constant round trip, count the samples needed to bring the computed timer within ten per cent, and collect the constants worth carrying into an exam.'
    },
    {
      id: 'procedure',
      n: 10,
      title: 'The procedure and the four slips',
      start: 270, end: 300,
      objective: 'Consolidate the five steps that answer any question on this topic, and name the four errors that cost the mark.'
    }
  ],

  events: [

    /* ---------------- scene 1: timer ---------------- */
    {
      id: 'e1a', scene: 'timer', start: 0, end: 7.5,
      caption: 'A TCP sender keeps one retransmission timer. Its duration is the RTO.',
      detail: 'RTO stands for retransmission timeout: a duration the sender chooses, in milliseconds or seconds. It is not the round-trip time; the round-trip time is what the sender measures.',
      narration: 'A TCP sender keeps one retransmission timer. The duration it waits is called the R T O, the retransmission timeout. It is a duration the sender chooses, not one it measures.',
      keyword: 'retransmission timer',
      trap: 'RTO is not the RTT. The RTT is measured; the RTO is computed from those measurements.'
    },
    {
      id: 'e1b', scene: 'timer', start: 7.5, end: 15,
      caption: 'The timer runs for the oldest unacknowledged segment, and an ACK for new data restarts it.',
      detail: 'RFC 6298 rule 5.3: when an ACK arrives that acknowledges new data, restart the timer so that it expires after RTO seconds. Rule 5.2: when all outstanding data has been acknowledged, turn the timer off.',
      narration: 'The timer guards the oldest segment still unacknowledged. When an ACK arrives that acknowledges new data, the timer restarts, so it always expires R T O after the most recent progress.',
      keyword: 'restarts',
      trap: 'A duplicate ACK does not acknowledge new data, so it does not restart the timer the same way.'
    },
    {
      id: 'e1c', scene: 'timer', start: 15, end: 22.5,
      caption: 'With a 1200 ms timer and ACKs at 400 and 800 ms, the deadline moves to 1600 then 2000 ms.',
      detail: 'Send at 0 ms starts the timer for 1200 ms. The ACK at 400 ms acknowledges new data, so the deadline becomes 400 + 1200 = 1600 ms. The ACK at 800 ms makes it 800 + 1200 = 2000 ms. Nothing is outstanding after 800 ms, so the timer is switched off.',
      narration: 'With a twelve hundred millisecond timer, a send at zero starts a deadline at twelve hundred. The ACK at four hundred moves the deadline to sixteen hundred. The ACK at eight hundred moves it to two thousand, and then nothing is outstanding, so the timer stops.',
      keyword: 'deadline moves'
    },
    {
      id: 'e1d', scene: 'timer', start: 22.5, end: 30,
      caption: 'On expiry the sender retransmits the earliest unacknowledged segment and doubles the timer.',
      detail: 'RFC 6298 rules 5.4 to 5.6: retransmit the earliest unacknowledged segment, set RTO to twice its previous value, and start the timer again with the new value.',
      narration: 'If the deadline passes with data still unacknowledged, the sender retransmits the earliest unacknowledged segment, doubles the timer, and starts it again. That doubling is the backoff, and it is the subject of scene eight.',
      keyword: 'doubles',
      trap: 'Expiry does not mean the segment was lost. It means no ACK arrived within RTO, which is a different statement.'
    },

    /* ---------------- scene 2: cost ---------------- */
    {
      id: 'e2a', scene: 'cost', start: 30, end: 37.5,
      caption: 'The timer is a bet on how long an ACK can take. Both errors are paid in bandwidth.',
      detail: 'A timer shorter than the path needs fires while the ACK is still travelling; a timer far longer than the path needs waits after a real loss. The first wastes bandwidth, the second wastes time.',
      narration: 'The timer is a bet about how long an ACK can take. Bet too low and it fires while the ACK is still on its way. Bet too high and it sits idle after a real loss. One error costs bandwidth, the other costs time.',
      keyword: 'bet'
    },
    {
      id: 'e2b', scene: 'cost', start: 37.5, end: 45,
      caption: 'A 120 ms timer on a 400 ms path fires three times before the first ACK arrives.',
      detail: 'The segment is sent at 0 ms and its ACK arrives at 400 ms. A timer of 120 ms expires at 120, 240 and 360 ms, so three copies are sent that could not possibly have been needed. The count is the floor of 400 divided by 120, computed on the page.',
      narration: 'Take a path whose round trip is four hundred milliseconds and a timer of only one hundred and twenty. The timer expires at one twenty, two forty and three sixty, so three extra copies go out before the first ACK could even arrive. Three copies, all wasted.',
      keyword: 'three times',
      trap: 'Each spurious copy also looks like congestion to the receiver, so the cost is not only bandwidth.'
    },
    {
      id: 'e2c', scene: 'cost', start: 45, end: 52.5,
      caption: 'A 12 second timer on the same path waits thirty round trips before repairing one loss.',
      detail: 'Twelve thousand milliseconds divided by four hundred milliseconds is thirty. A single lost segment stalls the connection for thirty round trips of silence, and the receiver has already sent duplicate ACKs that the timer ignores.',
      narration: 'Now the other error. A twelve second timer on the same four hundred millisecond path waits thirty round trips before it repairs one loss. Thirty round trips of silence, for one missing segment.',
      keyword: 'thirty round trips'
    },
    {
      id: 'e2d', scene: 'cost', start: 52.5, end: 60,
      caption: 'So the timer must adapt to the path, and the path changes minute by minute.',
      detail: 'This is why RFC 6298 makes the estimator a MUST: a fixed timer cannot serve both a local network and an intercontinental path, and a path\'s delay changes as queues fill and routes change.',
      narration: 'So the timer has to adapt to the path, and the path changes as queues fill and routes change. That is why the estimator is not a refinement but a requirement: a fixed timer cannot serve both a local network and a path across an ocean.',
      keyword: 'adapt'
    },

    /* ---------------- scene 3: first ---------------- */
    {
      id: 'e3a', scene: 'first', start: 60, end: 67.5,
      caption: 'Before any measurement the timer is one second. RFC 6298 lowered this from three.',
      detail: 'Rule 2.1 of RFC 6298: until an RTT measurement has been made, set RTO to 1 second. The previous document, RFC 2988, used 3 seconds, and an implementation may still use a larger value.',
      narration: 'Before the sender has measured anything, the timer is one second. That is the modern default; the older document used three seconds, and an implementation may still choose a larger value.',
      keyword: 'one second'
    },
    {
      id: 'e3b', scene: 'first', start: 67.5, end: 75,
      caption: 'The first sample R sets the centre to R and the spread to R over 2.',
      detail: 'Rule 2.2: on the first measurement R, set SRTT to R and RTTVAR to R/2. With one sample there is no spread to observe, so the rule invents one half as large as the sample.',
      narration: 'The first measurement does two things. It puts the smoothed round trip, S R T T, at the sample itself. And it puts the variation, R T T V A R, at half the sample, because one sample gives no spread to measure, so the rule assumes one.',
      keyword: 'half the sample'
    },
    {
      id: 'e3c', scene: 'first', start: 75, end: 82.5,
      caption: 'With R = 40 ms the rule gives 40 + 4 x 20 = 120 ms, then the floor raises it to 1000 ms.',
      detail: 'RTO = SRTT + max(G, 4 x RTTVAR) = 40 + 80 = 120 ms. Rule 2.4 then says that whenever RTO is computed and comes out below one second, it should be rounded up to one second. The value used is therefore 1000 ms, twenty-five times the measured round trip.',
      narration: 'Forty milliseconds gives a centre of forty and a spread of twenty. Four spreads is eighty, so the computed timer is one hundred and twenty milliseconds. But the rule says a computed timer below one second is raised to one second, so the value actually used is one thousand milliseconds.',
      keyword: 'one second',
      trap: 'The floor is applied to the computed RTO, not to the estimate. SRTT and RTTVAR still hold 40 and 20.'
    },
    {
      id: 'e3d', scene: 'first', start: 82.5, end: 90,
      caption: 'The floor is deliberate: a minimum timer keeps TCP conservative on fast paths.',
      detail: 'RFC 2988 section 2.4 records the reasoning: coarse clocks impose a large minimum anyway, and research suggested a large minimum RTO keeps TCP conservative and avoids spurious retransmissions. The page quotes the rule, not a proof that one second is optimal.',
      narration: 'The floor is not an accident of arithmetic. A minimum timer keeps the sender conservative: on a fast path, retransmitting too early adds a copy to a network that did not need it. The cost is that a local connection still waits a full second to notice a loss.',
      keyword: 'deliberate',
      trap: 'Do not apply the floor to RTTVAR or SRTT. Only the timer has a floor.'
    },

    /* ---------------- scene 4: averages ---------------- */
    {
      id: 'e4a', scene: 'averages', start: 90, end: 97.5,
      caption: 'A new sample moves the centre by one eighth of the gap, and the spread by one quarter.',
      detail: 'Rule 2.3 with alpha = 1/8 and beta = 1/4: RTTVAR becomes three quarters of itself plus one quarter of the gap between the old SRTT and the new sample; SRTT becomes seven eighths of itself plus one eighth of the sample.',
      narration: 'Each new sample moves two numbers. The centre moves by one eighth of the gap between it and the sample. The spread moves by one quarter of the gap between the old centre and the sample. Slow centre, faster spread.',
      keyword: 'one eighth'
    },
    {
      id: 'e4b', scene: 'averages', start: 97.5, end: 105,
      caption: 'Five samples: 400, 380, 420, 400 and 800 ms, all computed on this page.',
      detail: 'The trace on the canvas is computed by the model in lesson.js: each row applies rule 2.3 to the previous row, then rule 2.4. Nothing in the table is typed in by hand.',
      narration: 'Here are five samples from a four hundred millisecond path, with one eight hundred millisecond outlier at the end. The table is computed when the page loads, so every figure below can be checked against the rules.',
      keyword: 'five samples'
    },
    {
      id: 'e4c', scene: 'averages', start: 105, end: 112.5,
      caption: 'The centre ends at 450.24 ms and the spread at 168.54 ms, so the timer is 1124.42 ms.',
      detail: 'After the fifth sample: SRTT = 450.2392578125 ms, RTTVAR = 168.544921875 ms, so RTO = 450.239 + 4 x 168.545 = 1124.419 ms, above the floor so it is used unchanged.',
      narration: 'After the fifth sample the centre is four hundred and fifty point two four milliseconds and the spread is one hundred and sixty eight point five four. Four spreads is six hundred and seventy four, so the timer is eleven hundred and twenty four point four two milliseconds.',
      keyword: '1124.42'
    },
    {
      id: 'e4d', scene: 'averages',
      start: 112.5, end: 120,
      caption: 'Notice the outlier did not drag the centre all the way to 800; it moved the spread more.',
      detail: 'One eighth of the gap from 400.27 to 800 is 49.97, so the centre moves to 450.24. One quarter of the gap is 99.93, so the spread moves from 91.48 to 168.54. The timer grows by 358 ms although the centre grew by 50.',
      narration: 'The outlier did not drag the centre to eight hundred; it moved it by only fifty, because the centre takes one eighth of a gap. The spread took one quarter, and it nearly doubled. That is why the timer grew by three hundred and fifty eight milliseconds while the centre grew by fifty.',
      keyword: 'spread more',
      trap: 'The estimator is not a mean of the samples. A mean of these five is 480 ms, not 450.24 ms.'
    },

    /* ---------------- scene 5: order ---------------- */
    {
      id: 'e5a', scene: 'order', start: 120, end: 127.5,
      caption: 'The two lines of rule 2.3 must run in the order written: spread first.',
      detail: 'RFC 6298 rule 2.3 states explicitly that the value of SRTT used in the update to RTTVAR is its value before updating SRTT itself, and that updating RTTVAR and SRTT must be computed in that order.',
      narration: 'The two lines of the update have a fixed order. The spread is updated first, using the old centre. Only then is the centre moved. The document says this in as many words, because the other order changes the answer.',
      keyword: 'fixed order'
    },
    {
      id: 'e5b', scene: 'order', start: 127.5, end: 135,
      caption: 'On the fifth sample the correct order gives RTTVAR 168.54 ms and RTO 1124.42 ms.',
      detail: 'Old SRTT 400.2734375, old RTTVAR 91.484375, sample 800. RTTVAR = 0.75 x 91.484375 + 0.25 x |400.2734375 - 800| = 68.61328125 + 99.931640625 = 168.544921875.',
      narration: 'Take the fifth sample. The old centre is four hundred point two seven and the old spread is ninety one point four eight. One quarter of the gap between the old centre and eight hundred is ninety nine point nine three, so the new spread is one hundred and sixty eight point five four, and the timer is eleven hundred and twenty four point four two.',
      keyword: '168.54'
    },
    {
      id: 'e5c', scene: 'order', start: 135, end: 142.5,
      caption: 'Swapping the order gives 156.05 ms and a timer of 1074.45 ms: about 50 ms short.',
      detail: 'With the centre moved first to 450.2392578125, the gap to 800 is only 349.7607421875, so RTTVAR = 68.61328125 + 87.440185546875 = 156.053466796875 and RTO = 450.2392578125 + 624.2138671875 = 1074.453125. The two orders differ by 49.966 ms on this one sample.',
      narration: 'Now swap the order and use the new centre. The gap to eight hundred shrinks to three hundred and forty nine point seven six, so the spread comes out at one hundred and fifty six point zero five and the timer at ten hundred and seventy four point four five. Fifty milliseconds short, from one swapped line.',
      keyword: '50 ms short',
      trap: 'The swapped order is not a different algorithm; it is the same algorithm with one line moved, and it under-estimates the spread.'
    },
    {
      id: 'e5d', scene: 'order', start: 142.5, end: 150,
      caption: 'The error always points the same way: a gap measured from a centre that already moved.',
      detail: 'Because the centre has moved toward the sample, the gap |SRTT - R\'| is smaller than it should be, so RTTVAR is under-estimated and the timer is too short. The under-estimate is largest on the sample that moves the centre furthest.',
      narration: 'The error always points the same way. Once the centre has moved toward the sample, the gap you measure is smaller than the real one, so the spread is too small and the timer too short. It is worst exactly when the path changed, which is when you needed the spread.',
      keyword: 'same way'
    },

    /* ---------------- scene 6: spike ---------------- */
    {
      id: 'e6a', scene: 'spike', start: 150, end: 157.5,
      caption: 'A steady path converges the spread toward zero, so the timer sits just above the round trip.',
      detail: 'With every sample equal to 400 ms, the gap in rule 2.3 is zero, so RTTVAR is multiplied by three quarters on each update: after n samples it is 200 x 0.75^(n-1) ms. The computed timer is 400 + 4 RTTVAR.',
      narration: 'On a steady path every gap is zero, so the spread is multiplied by three quarters each time and shrinks toward zero. The computed timer settles just above the round trip itself, and on this path the one second floor is what the sender actually uses.',
      keyword: 'toward zero'
    },
    {
      id: 'e6b', scene: 'spike', start: 157.5, end: 165,
      caption: 'One sample of 1600 ms lifts the centre to 550 and the spread to 300.04 ms.',
      detail: 'From SRTT 400 and a converged RTTVAR, sample 1600: RTTVAR = 0.75 x 0.0476 + 0.25 x 1200 = 300.0357 ms; SRTT = 350 + 200 = 550 ms; RTO = 550 + 4 x 300.0357 = 1750.14 ms.',
      narration: 'Now one sample of sixteen hundred milliseconds, four times the steady value. The centre rises to five hundred and fifty. The spread rises to three hundred point zero four. The timer becomes seventeen hundred and fifty point one four.',
      keyword: '1600'
    },
    {
      id: 'e6c', scene: 'spike', start: 165, end: 172.5,
      caption: 'The timer grew by a factor of 1.75 from one sample, and it decays back by three quarters a sample.',
      detail: 'From the converged value of 1000 ms to 1750.14 ms is a factor of 1.75. Because the gap term decays by three quarters each update, the timer returns toward the floor geometrically, at the same rate the spread shrank.',
      narration: 'From the floor of one second the timer grew to seventeen hundred and fifty, a factor of one point seven five, from a single sample. And it comes back down at the same rate the spread shrank: three quarters of the remaining excess on each new sample.',
      keyword: '1.75'
    },
    {
      id: 'e6d', scene: 'spike', start: 172.5, end: 180,
      caption: 'So the estimator is a low-pass filter, not a maximum: one delay does not set the timer forever.',
      detail: 'A maximum over recent samples would keep the timer at four times the path delay indefinitely; a smoothed estimator forgets. The cost is that the estimate lags a path that gets worse, which is why the spread term, not the centre, carries the safety margin.',
      narration: 'So the estimator behaves like a low pass filter, not a maximum. One slow sample does not set the timer forever; it fades. The price is that the estimate lags when the path genuinely gets worse, and the spread term is what carries the safety margin.',
      keyword: 'low-pass filter',
      trap: 'Do not describe RTTVAR as a variance. It is a smoothed mean absolute deviation; four of them are four deviations, not four standard deviations.'
    },

    /* ---------------- scene 7: karn ---------------- */
    {
      id: 'e7a', scene: 'karn', start: 180, end: 187.5,
      caption: 'After a retransmission, an arriving ACK may answer either copy. That is the ambiguity.',
      detail: 'The ACK carries a sequence number, and both copies carry the same sequence number. Nothing in the acknowledgement says which transmission provoked it, so the sender cannot tell which send time to subtract.',
      narration: 'After a retransmission the ACK is ambiguous. It acknowledges a sequence number, and both copies carry that same number. Nothing in the ACK says which copy caused it, so the sender does not know which send time to subtract.',
      keyword: 'ambiguous'
    },
    {
      id: 'e7b', scene: 'karn', start: 187.5, end: 195,
      caption: 'An ACK at 1250 ms after a retransmission at 1200 gives 50 ms for a 400 ms path.',
      detail: 'The segment was first sent at 0 ms with a 1200 ms timer. The copy sent at 1200 ms is acknowledged at 1250 ms, and that ACK in fact answers the original. Timing from the retransmission gives 50 ms, one eighth of the true 400 ms round trip.',
      narration: 'Here is the first scenario. The segment went out at zero and the timer was twelve hundred. A copy goes out at twelve hundred and an ACK arrives fifty milliseconds later. If you time from the copy, you record fifty milliseconds for a path whose round trip is four hundred. One eighth of the truth.',
      keyword: '50 ms',
      trap: 'The sample is not merely noisy; it is wrong in a direction that shrinks the timer, which is the dangerous direction.'
    },
    {
      id: 'e7c', scene: 'karn', start: 195, end: 202.5,
      caption: 'The other scenario: the ACK for the copy arrives at 1600 ms, so timing from the original gives 1600.',
      detail: 'If the copy sent at 1200 ms is the one acknowledged, its ACK arrives at 1600 ms. Timing from the original send at 0 ms gives 1600 ms, four times the true round trip, and the timer would be inflated by the same factor.',
      narration: 'And here is the mirror image. This time the ACK really does answer the copy, arriving at sixteen hundred. Time from the original send and you record sixteen hundred milliseconds, four times the truth. Either choice can be wrong by a factor of four or eight.',
      keyword: '1600 ms'
    },
    {
      id: 'e7d', scene: 'karn', start: 202.5, end: 210,
      caption: "Karn's rule: take no sample from a retransmitted segment; keep the timer and let it back off.",
      detail: 'RFC 6298 section 3: TCP must use Karn\'s algorithm, so RTT samples must not be made using segments that were retransmitted. The one safe case is the timestamp option, which removes the ambiguity. The timer is not recomputed; rule 5.5 doubles it.',
      narration: 'So the rule is simple: take no sample from a segment that was retransmitted. Keep the timer you had, and let the doubling in the next scene handle the uncertainty. The one exception is the timestamp option, which puts the send time in the segment and so removes the ambiguity entirely.',
      keyword: "Karn's rule",
      trap: 'Karn\'s rule forbids the sample, not the retransmission. The ACK still acknowledges data and still restarts the timer.'
    },

    /* ---------------- scene 8: backoff ---------------- */
    {
      id: 'e8a', scene: 'backoff', start: 210, end: 217.5,
      caption: 'Every expiry doubles the timer: 1200, 2400, 4800 and on.',
      detail: 'RFC 6298 rule 5.5: the host must set RTO to twice its previous value on each expiry, and rule 5.6 restarts the timer with the new value. No RTT sample is involved in this step.',
      narration: 'On every expiry the timer doubles. Twelve hundred becomes twenty four hundred, then forty eight hundred, then ninety six hundred. No measurement is involved; the doubling is the sender admitting it does not know how long the path is taking.',
      keyword: 'doubles'
    },
    {
      id: 'e8b', scene: 'backoff', start: 217.5, end: 225,
      caption: 'From 1200 ms the ladder reaches the 60 second maximum after six doublings.',
      detail: 'The sequence computed on the page is 1200, 2400, 4800, 9600, 19200, 38400 and then 60000, because 76800 exceeds the maximum. RFC 6298 rule 2.5 allows a maximum provided it is at least 60 seconds.',
      narration: 'From twelve hundred milliseconds the ladder is twenty four hundred, forty eight hundred, ninety six hundred, nineteen thousand two hundred, thirty eight thousand four hundred, and then it stops at sixty thousand, because the next doubling would pass the maximum. Six doublings to reach the ceiling.',
      keyword: '60 second maximum'
    },
    {
      id: 'e8c', scene: 'backoff', start: 225, end: 232.5,
      caption: 'Backoff and recomputation are different operations, and only an ACK ends the backoff.',
      detail: 'A recomputation uses a new RTT sample under rules 2.2 and 2.3. A backoff multiplies the current value under rule 5.5. The value only comes back down when a later sample is taken and the rule 2.3 computation produces something smaller.',
      narration: 'Doubling and recomputing are different operations. Doubling multiplies what you have. Recomputing builds a new value from a fresh sample. The timer only comes back down when a sample is taken again and the formula gives something smaller.',
      keyword: 'different operations',
      trap: 'A doubled timer is not evidence that the path is now slow. It is the sender being conservative while it has no measurement.'
    },
    {
      id: 'e8d', scene: 'backoff', start: 232.5, end: 240,
      caption: 'One more rule: if the timer expires waiting for a SYN ACK, the RTO returns to 3 seconds for data.',
      detail: 'RFC 6298 rule 5.7: if the timer expires awaiting the ACK of a SYN and the implementation uses an RTO below 3 seconds, the RTO must be re-initialised to 3 seconds when data transmission begins after the handshake.',
      narration: 'There is one more rule worth carrying. If the timer expires while waiting for the ACK of a SYN, and your timer is below three seconds, then when the handshake completes the timer must be re-initialised to three seconds for the data. A handshake is not a measurement of the data path.',
      keyword: '3 seconds',
      trap: 'This rule is about the handshake only. It does not raise the timer for ordinary data on an established connection.'
    },

    /* ---------------- scene 9: converge ---------------- */
    {
      id: 'e9a', scene: 'converge', start: 240, end: 247.5,
      caption: 'On a constant path the spread after n samples is 200 times 0.75 to the n minus 1.',
      detail: 'With every sample equal to the centre, the gap term in rule 2.3 is zero, so each update multiplies RTTVAR by three quarters. Starting from R/2 = 200 ms, the closed form is RTTVAR(n) = 200 x 0.75^(n-1) ms, which the page checks against the iteration for forty samples.',
      narration: 'On a path whose round trip never changes, the spread has a closed form: half the sample, times three quarters to the power n minus one. After forty samples it is two thousandths of a millisecond, which is why a steady path has a timer sitting on the floor.',
      keyword: 'closed form'
    },
    {
      id: 'e9b', scene: 'converge', start: 247.5, end: 255,
      caption: 'The computed timer comes within ten per cent of the round trip at the twelfth sample.',
      detail: 'The computed timer is 400 + 4 RTTVAR. Within ten per cent of 400 ms means at most 440 ms, so 4 RTTVAR must fall below 40 ms, that is RTTVAR below 10 ms. The page scans the forty-row trace and finds the first row that satisfies it: row 12.',
      narration: 'The computed timer comes within ten per cent of the round trip when four spreads fall below forty milliseconds, that is when the spread falls below ten. Scanning the trace, that first happens at the twelfth sample. Eleven updates to trust the estimate, on a path that never changed.',
      keyword: 'twelfth sample'
    },
    {
      id: 'e9c', scene: 'converge', start: 255, end: 262.5,
      caption: 'The constants worth carrying: 1/8, 1/4, K = 4, a 1 s floor and a 60 s ceiling.',
      detail: 'Alpha is one eighth, beta is one quarter, K is four, the floor is one second and a maximum may be set provided it is at least sixty seconds. The initial value is one second, and the older document used three.',
      narration: 'So the constants to carry are these. One eighth for the centre, one quarter for the spread, four spreads of margin, a floor of one second, and a ceiling you may set at sixty seconds or more. The initial value is one second.',
      keyword: 'constants',
      trap: 'The floor is one second and the ceiling is at least sixty. Confusing the two is the most common slip in a calculation.'
    },
    {
      id: 'e9d', scene: 'converge', start: 262.5, end: 270,
      caption: 'Every figure on this page is computed, and the count of passing checks is printed under the canvas.',
      detail: 'The model recomputes each displayed number from the rules, compares the iteration with the closed form, compares the two update orders, and re-runs the Karn scenarios. The pass count appears under the canvas so a wrong figure shows up before it is read.',
      narration: 'Every figure here is computed when the page loads, and the count of checks that passed is printed under the canvas. If a number were wrong, the count would say so before you read the number.',
      keyword: 'computed'
    },

    /* ---------------- scene 10: procedure ---------------- */
    {
      id: 'e10a', scene: 'procedure', start: 270, end: 277.5,
      caption: 'Step one: ask whether a sample exists, because that decides which rule applies.',
      detail: 'No sample yet means rule 2.1, the initial one second. One sample means rule 2.2. Two or more means rule 2.3, with the order fixed: spread first.',
      narration: 'Step one is always the same question: does a sample exist? None means the initial value. One means the first-measurement rule. Two or more means the update rule, spread first, centre second.',
      keyword: 'which rule'
    },
    {
      id: 'e10b', scene: 'procedure', start: 277.5, end: 285,
      caption: 'Step two: apply the floor and the ceiling after computing, never before.',
      detail: 'Compute RTO = SRTT + max(G, 4 RTTVAR) first, then raise it to one second if it is below, then cap it at the maximum if a maximum is in use. Applying the floor to RTTVAR instead changes every later row.',
      narration: 'Step two: compute first, then clamp. Raise the result to one second if it came out below, cap it at sixty if your implementation has a ceiling. Never clamp the spread; only the timer has a floor.',
      keyword: 'then clamp',
      trap: 'Clamping SRTT or RTTVAR changes every subsequent row, so the final answer is wrong even if the first clamp looked harmless.'
    },
    {
      id: 'e10c', scene: 'procedure', start: 285, end: 292.5,
      caption: 'Step three: a retransmission in the history means no sample, and a doubling instead.',
      detail: 'If the segment being acknowledged was retransmitted, Karn\'s rule applies: take no RTT sample, and if a timer expiry occurred, the value was doubled under rule 5.5. The ACK still acknowledges data and restarts the timer.',
      narration: 'Step three: look at the history. If the segment was retransmitted, take no sample; the timer was doubled at the expiry, and that is the whole of its update. The ACK still restarts the timer, because it still acknowledges new data.',
      keyword: 'no sample'
    },
    {
      id: 'e10d', scene: 'procedure', start: 292.5, end: 300,
      caption: 'The four slips: a mean instead of a filter, a variance, a swapped order, and a clamped spread.',
      detail: 'The four errors named on the canvas are the ones the model checks: averaging the samples instead of smoothing them, reading RTTVAR as a variance, swapping the two updates, and applying the floor to the spread instead of the timer.',
      narration: 'And the four slips that cost the mark: averaging the samples instead of smoothing them, reading the spread as a variance, swapping the two updates, and clamping the spread instead of the timer. Each one is checked on this page, so you can see what it costs.',
      keyword: 'four slips'
    }
  ]
};
