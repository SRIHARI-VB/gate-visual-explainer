/* ==========================================================================
   sliding-window-arq-protocols — THE timeline.
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
      id: 'waiting',
      n: 1,
      title: 'One frame at a time, and the empty pipe',
      start: 0, end: 30,
      objective: 'See what a stop-and-wait sender spends its time on, and derive efficiency as one frame per transmission-plus-round-trip.'
    },
    {
      id: 'window',
      n: 2,
      title: 'The window: several frames in flight',
      start: 30, end: 60,
      objective: 'Read a sender window and a receiver window, see the window slide on an acknowledgement, and derive W over one-plus-two-a.'
    },
    {
      id: 'counted',
      n: 3,
      title: 'Stop-and-wait, counted twice',
      start: 60, end: 90,
      objective: 'Run the efficiency formula on a 2025 paper item, and read the direction of the 2023 item without computing either answer.'
    },
    {
      id: 'minwindow',
      n: 4,
      title: 'The smallest window that fills the link',
      start: 90, end: 120,
      objective: 'Invert the formula to get W at least one plus two a, round up, and check the answer against the utilisation it buys.'
    },
    {
      id: 'gbn',
      n: 5,
      title: 'Go-Back-N: discard, then resend the tail',
      start: 120, end: 150,
      objective: 'Trace one lost frame through Go-Back-N, and count the transmissions it costs at two window sizes.'
    },
    {
      id: 'sr',
      n: 6,
      title: 'Selective Repeat: buffer, then resend one',
      start: 150, end: 180,
      objective: 'Trace the same loss through Selective Repeat, and see the receiver buffer buy back the retransmissions.'
    },
    {
      id: 'gbnbound',
      n: 7,
      title: 'Why Go-Back-N stops at two-to-the-m minus one',
      start: 180, end: 210,
      objective: 'Build the wrap-around ambiguity that forces the bound, and read the first failing window size off a computed table.'
    },
    {
      id: 'srbound',
      n: 8,
      title: 'Why Selective Repeat stops at two-to-the-m minus one',
      start: 210, end: 240,
      objective: 'Slide the receiver window into the sender window and see the duplicate that forces the halved bound.'
    },
    {
      id: 'cost',
      n: 9,
      title: 'What the receiver buffer costs, and what it saves',
      start: 240, end: 270,
      objective: 'Compare the two protocols on transmissions, buffering and elapsed time, and read the window requirement from the bandwidth-delay product.'
    },
    {
      id: 'procedure',
      n: 10,
      title: 'The four steps, and the traps that break them',
      start: 270, end: 300,
      objective: 'Run a four-line procedure on any question in this family, and name the five traps by sight.'
    }
  ],

  events: [

    /* ---------------- scene 1: waiting ---------------- */
    {
      id: 'wt-1', scene: 'waiting', start: 0, end: 7.5,
      caption: 'A stop-and-wait sender puts one frame on the wire, then stops and waits for its acknowledgement.',
      detail: 'One frame is transmitted, then nothing is sent until the acknowledgement for it comes back. The link carries data for the transmission time only, and stays idle for the whole round trip.',
      narration: 'Start with the simplest reliable sender there is. It sends one frame, and then it does nothing until the acknowledgement arrives. The link is busy while the frame is going out, and silent for everything after that.',
      keyword: 'one frame, then wait',
      trap: 'The idle time is not a fault; it is the design. Counting it as wasted bandwidth without counting the round trip that causes it gives the wrong formula.'
    },
    {
      id: 'wt-2', scene: 'waiting', start: 7.5, end: 15,
      caption: 'Transmission takes Tt = 8 ms; the round trip takes 2 Tp = 20 ms; the cycle is 28 ms for one frame.',
      detail: 'Tt is the frame size divided by the link rate: 8000 bits over 1 Mbps is 8 ms. Tp is the distance divided by the signal speed: 2000 km at 2 times ten to the eight metres per second is 10 ms, so the round trip is 20 ms. The cycle is 8 + 20 = 28 ms.',
      narration: 'Two different delays. Transmission is how long the sender holds the wire: eight thousand bits at one megabit per second, eight milliseconds. Propagation is how long a bit takes to cross the link: ten milliseconds each way, so twenty for the round trip. The cycle is twenty-eight milliseconds and delivers one frame.',
      keyword: 'Tt = 8 ms, 2Tp = 20 ms, cycle 28 ms',
      trap: 'Doubling Tt instead of Tp, or forgetting the second Tp. The formula has one transmission and two propagation delays in it, never the other way round.'
    },
    {
      id: 'wt-3', scene: 'waiting', start: 15, end: 22.5,
      caption: 'Efficiency is useful time over cycle time: 8 over 28 is 0.2857, so 28.57 per cent of the link.',
      detail: 'The sender is transmitting for 8 ms out of every 28 ms, so the fraction of link capacity used is 8 divided by 28, which is 0.2857. Written in terms of a, the ratio of propagation to transmission, the same number is one over one plus two a.',
      narration: 'Efficiency is the useful part of the cycle over the whole cycle. Eight over twenty-eight is nought point two eight five seven. Write it once in terms of the ratio a, propagation over transmission, and it becomes one over one plus two a. That is the whole of stop-and-wait.',
      keyword: '1 / (1 + 2a)',
      trap: 'Using the round trip where the formula wants one-way a. If a question hands you the RTT, a is the RTT divided by twice Tt.'
    },
    {
      id: 'wt-4', scene: 'waiting', start: 22.5, end: 30,
      caption: 'Twenty of the twenty-eight milliseconds are a pipe with nothing in it. The cure is to keep more frames in that pipe.',
      detail: 'The idle stretch is exactly the time a frame spends travelling, so it can be filled with more frames. That is the entire idea of a sliding window, and it costs nothing except buffers and sequence numbers.',
      narration: 'Look at what those twenty milliseconds are. A pipe, empty, waiting for an answer. If the sender had more frames to put in it, the pipe would be full and the link busy. That is the whole idea of a window, and the next scene does the arithmetic.',
      keyword: 'fill the pipe',
      trap: 'Believing a bigger window always helps. Once the pipe is full, more window buys nothing; the formula caps at one.'
    },

    /* ---------------- scene 2: window ---------------- */
    {
      id: 'wd-1', scene: 'window', start: 30, end: 37.5,
      caption: 'A window of W frames may be outstanding at once. The receiver holds a window too, and it is the receiver window that separates the protocols.',
      detail: 'The sender keeps a window of sequence numbers it is allowed to have unacknowledged. The receiver keeps a window of numbers it will accept. Stop-and-wait has both windows at one. Go-Back-N has a receiver window of one. Selective Repeat has a receiver window equal to the sender window.',
      narration: 'A window is a permission slip. The sender may have W frames unacknowledged at any moment. The receiver also keeps a window: the numbers it is prepared to accept. Stop-and-wait has both at one. Go-back-N keeps the receiver at one. Selective Repeat gives the receiver a full window.',
      keyword: 'sender window, receiver window',
      trap: 'Assuming the two windows are always equal. They are equal only in Selective Repeat.'
    },
    {
      id: 'wd-2', scene: 'window', start: 37.5, end: 45,
      caption: 'An acknowledgement slides the window by one; the frames inside it travel while the sender keeps transmitting.',
      detail: 'The window is a range of sequence numbers, not a fixed set of buffers. When the oldest frame is acknowledged the window advances by one and a new sequence number becomes sendable. Nothing is copied; two integers move.',
      narration: 'When the acknowledgement for the oldest frame arrives, the window slides by one and a new number becomes sendable. Nothing is copied and nothing is reordered: the window is two integers, the base and the base plus W.',
      keyword: 'slide by one',
      trap: 'Thinking the window is a buffer of frames. It is a range of sequence numbers; the buffering is a separate question, and it is what Go-Back-N and Selective Repeat disagree about.'
    },
    {
      id: 'wd-3', scene: 'window', start: 45, end: 52.5,
      caption: 'W frames per cycle of one plus two a gives W over one plus two a, capped at one.',
      detail: 'With a window of W the sender delivers W frames in the time one frame took to be acknowledged, so the efficiency multiplies by W. It cannot exceed one, because a link cannot carry more than its own rate.',
      narration: 'One frame per cycle becomes W frames per cycle, so the efficiency is W over one plus two a. It is capped at one: a link cannot be more than fully used, and any question whose formula gives more than one is telling you the window is already large enough.',
      keyword: 'W / (1 + 2a), capped at 1',
      trap: 'Reporting an efficiency above one, or rounding a window up when the question asks for the efficiency of a given window.'
    },
    {
      id: 'wd-4', scene: 'window', start: 52.5, end: 60,
      caption: 'On our link a is 1.25, so one plus two a is 3.5: windows 1, 2, 3 give 0.286, 0.571, 0.857, and 4 saturates the link.',
      detail: 'With a of 1.25 the denominator is 3.5. Window 1 gives 0.2857, window 2 gives 0.5714, window 3 gives 0.8571, and window 4 gives more than one, which the cap turns into exactly one. A simulated sender transmitting 3000 frames agrees with these figures to within the boundary effect.',
      narration: 'Our link has a of one point two five, so the denominator is three point five. One frame gives nought point two eight six. Two gives nought point five seven one. Three gives nought point eight five seven. Four gives more than one, so the answer is one: the pipe is full.',
      keyword: '3.5, so 4 saturates',
      trap: 'Stopping at three because 3.5 is not an integer. The window that saturates is the ceiling, not the floor.'
    },

    /* ---------------- scene 3: counted ---------------- */
    {
      id: 'ct-1', scene: 'counted', start: 60, end: 67.5,
      caption: 'GATE CSE 2025 Set 2, Q36: 3000-bit frames at 2000 bits per second, one-way delay 100 ms. Utilisation?',
      detail: 'The question gives frame size, link rate and propagation delay, and states that acknowledgement transmission and processing are negligible. That is exactly the three numbers the formula needs.',
      narration: 'A paper item, almost bare. Three thousand bit frames, two thousand bits per second, one hundred milliseconds each way, acknowledgements negligible. Three numbers, one formula, and the only work is converting them.',
      keyword: '3000 bits, 2000 bps, 100 ms',
      trap: 'Treating the 100 ms as the round trip. The question says one-way propagation delay, so the round trip is 200 ms.'
    },
    {
      id: 'ct-2', scene: 'counted', start: 67.5, end: 75,
      caption: 'Tt is 1500 ms and 2 Tp is 200 ms, so the cycle is 1700 ms and efficiency is 1500 over 1700, which is 88.24 per cent.',
      detail: '3000 bits at 2000 bits per second is 1.5 seconds. The round trip is 200 ms. The cycle is 1.7 seconds. 1500 over 1700 is 0.88235, so 88.24 per cent.',
      narration: 'Three thousand bits at two thousand bits per second is one and a half seconds. The round trip is two hundred milliseconds. The cycle is one point seven seconds, and the useful part is one point five of it: nought point eight eight two three, so eighty-eight point two four per cent.',
      keyword: '1500 / 1700 = 88.24%',
      trap: 'The distractor is usually 1500 over 1600, from counting one propagation delay. That gives 93.75 per cent, which is not an option for nothing.'
    },
    {
      id: 'ct-3', scene: 'counted', start: 75, end: 82.5,
      caption: 'GATE CSE 2023, Q7 asks which scenario gives the LOWEST utilisation. Written out, efficiency is L times v over L times v plus two d B.',
      detail: 'Substituting Tt equals L over B and Tp equals d over v into one over one plus two a gives efficiency equal to L v divided by L v plus two d B. The efficiency falls as distance d rises and as rate B rises, and rises with frame size L.',
      narration: 'The next item does not want a number, it wants a direction. Write the efficiency out: frame size times speed, over that same product plus twice distance times rate. Bigger distance lowers it. Bigger rate lowers it. So the lowest utilisation is the long link at the high rate.',
      keyword: 'lower with longer and faster',
      trap: 'Reading higher rate as better utilisation. A faster link finishes transmitting sooner, so it waits longer, so the fraction used falls.'
    },
    {
      id: 'ct-4', scene: 'counted', start: 82.5, end: 90,
      caption: 'Longer link and higher transmission rate. Both changes enlarge the idle stretch, and neither changes the frame.',
      detail: 'Doubling the rate halves Tt, which doubles a and therefore lowers efficiency. Doubling the distance doubles Tp, which also doubles a. The two effects add, so the long fast link is the worst case for a sender that must wait.',
      narration: 'Longer link, higher rate. Both make the wait longer relative to the frame. That is the whole question, and it is why a satellite link at high speed is the classic example of a link that stop-and-wait wastes.',
      keyword: 'both enlarge the idle stretch',
      trap: 'Assuming a high rate always means high throughput. Throughput is efficiency times rate, and here the rate rises while the efficiency falls.'
    },

    /* ---------------- scene 4: minwindow ---------------- */
    {
      id: 'mw-1', scene: 'minwindow', start: 90, end: 97.5,
      caption: 'GATE CSE 2026 Set 1, Q45: 1000-bit frames, 100 kbps, one-way delay 100 ms. What is the smallest window for 100 per cent utilisation?',
      detail: 'The question asks for the minimum window rather than the efficiency, so the formula has to be inverted: set W over one plus two a equal to one.',
      narration: 'Same three numbers, opposite question. Not what efficiency does this window buy, but what window buys full efficiency. The formula is the same; it is turned around.',
      keyword: 'invert the formula',
      trap: 'Computing the efficiency and stopping. The question asks for a window size, so the answer must be a count of frames.'
    },
    {
      id: 'mw-2', scene: 'minwindow', start: 97.5, end: 105,
      caption: 'Tt is 10 ms, Tp is 100 ms, so a is 10 and one plus two a is 21. The window needed is 21 frames.',
      detail: '1000 bits at 100 kbps is 10 ms. The one-way delay is 100 ms, so a is 10 and the round trip plus the transmission is 21 transmission times. A window of 21 keeps the pipe full; 20 leaves it idle for one frame time in every 21.',
      narration: 'One thousand bits at one hundred kilobits per second is ten milliseconds. The delay is ten times that, so a is ten, and the pipe holds twenty-one frames. A window of twenty-one fills it exactly. Twenty leaves a gap of one frame time in every twenty-one.',
      keyword: 'a = 10, W = 21',
      trap: 'Using 20 because a round trip is 20 transmission times. The extra one is the frame being transmitted; the formula is one plus two a, not two a.'
    },
    {
      id: 'mw-3', scene: 'minwindow', start: 105, end: 112.5,
      caption: 'When one plus two a is not a whole number, round up. A window of 3.5 frames does not exist.',
      detail: 'On our first link one plus two a is 3.5, so a window of 3 gives 0.857 and a window of 4 gives one. Rounding down would leave the link idle, so the minimum is always the ceiling.',
      narration: 'The first link gives three and a half, and half a frame is not a window. Rounding down to three leaves the link idle for one frame in seven. Rounding up to four fills it. The rule is always ceiling, never floor.',
      keyword: 'ceiling, never floor',
      trap: 'Rounding to the nearest integer. A required window that is not met leaves the link idle; it is a lower bound, so it rounds up.'
    },
    {
      id: 'mw-4', scene: 'minwindow', start: 112.5, end: 120,
      caption: 'The window is the bandwidth-delay product: the data that must be in flight to keep the link busy.',
      detail: 'One plus two a transmission times, each carrying one frame, is exactly the number of frames the round trip can hold. Multiplying by the frame size gives the bandwidth-delay product, which is why the same number answers questions about buffer size and about bits in flight.',
      narration: 'Notice what that number is. Twenty-one frames in flight is twenty-one frame times of pipe. In bits it is the bandwidth-delay product: the amount of data that has to be travelling at once to keep the link busy. That is why the same number keeps appearing in questions about buffers.',
      keyword: 'bits in flight = rate times round trip',
      trap: 'Computing the bandwidth-delay product in bits and comparing it to a window in frames. Convert with the frame size first.'
    },

    /* ---------------- scene 5: gbn ---------------- */
    {
      id: 'gb-1', scene: 'gbn', start: 120, end: 127.5,
      caption: 'Go-Back-N: the receiver accepts only the next expected frame and acknowledges cumulatively.',
      detail: 'The receiver window is one frame wide. A frame that is not the next expected one is discarded, and the receiver repeats its last acknowledgement. The sender keeps one timer, for the oldest unacknowledged frame.',
      narration: 'Go-back-N gives the receiver no memory at all. It accepts only the frame it expects next, and if anything else arrives it throws it away and repeats the acknowledgement of the last good frame. The sender keeps one timer, for the oldest frame it has not had acknowledged.',
      keyword: 'receiver window of one',
      trap: 'Believing the receiver buffers the good frames that arrive after the gap. It does not; they are discarded and must be sent again.'
    },
    {
      id: 'gb-2', scene: 'gbn', start: 127.5, end: 135,
      caption: 'Frame 2 is lost. Frames 3 and 4 arrive, are discarded, and the sender times out on frame 2.',
      detail: 'With a window of four the sender had frames 1 to 4 outstanding. Frame 2 is lost, so the receiver, expecting 2, discards 3 and 4. No acknowledgement advances past 1, so the timer for frame 2 expires.',
      narration: 'Frame two is lost. Three and four arrive at a receiver that is waiting for two, so both are thrown away. Nothing acknowledges past one, so the timer on two expires, and the sender goes back to two.',
      keyword: 'discard 3 and 4',
      trap: 'Thinking the duplicated acknowledgement of frame 1 tells the sender which frame was lost. It tells the sender that frame 1 arrived, and nothing more.'
    },
    {
      id: 'gb-3', scene: 'gbn', start: 135, end: 142.5,
      caption: 'Twelve frames with frame 2 lost once: window 4 costs 17 transmissions, window 8 costs 21.',
      detail: 'The retransmitted tail is the window, not the frame. At window 4 the sender resends four frames for one loss; at window 8 it resends eight. Both deliver the twelve frames exactly once and in order, which the simulation checks.',
      narration: 'Count the cost. Twelve frames, one loss. At window four the sender transmits seventeen times in all. At window eight, twenty-one. The one lost frame cost four extra transmissions, then eight. That is what going back means.',
      keyword: '17 and 21 for 12 frames',
      trap: 'Assuming a larger window always reduces total transmissions. With loss it does the opposite; it multiplies the cost of each loss.'
    },
    {
      id: 'gb-4', scene: 'gbn', start: 142.5, end: 150,
      caption: 'What Go-Back-N saves is memory: one buffer at the receiver, one timer at the sender, and no reordering.',
      detail: 'The receiver needs storage for one frame and the sender needs a copy of every unacknowledged frame. Nothing arrives out of order, so no reassembly buffer and no reordering logic is needed.',
      narration: 'What the design buys is simplicity. One frame of storage at the receiver. One timer at the sender. Nothing ever arrives out of order, so there is nothing to reassemble. The price is paid in retransmissions, and it is paid in proportion to the window.',
      keyword: 'one buffer, one timer',
      trap: 'Confusing the sender buffer with the receiver buffer. Go-Back-N needs W frames at the sender and one at the receiver.'
    },

    /* ---------------- scene 6: sr ---------------- */
    {
      id: 'sr-1', scene: 'sr', start: 150, end: 157.5,
      caption: 'Selective Repeat gives the receiver a window the same width as the sender and buffers out-of-order frames.',
      detail: 'The receiver accepts any frame inside its window, stores it, and acknowledges it individually. The sender retransmits only the frame whose timer expires, because the others were acknowledged and held.',
      narration: 'Selective Repeat gives the receiver a memory. Any frame inside its window is accepted, stored, and acknowledged on its own. When the gap is filled, everything buffered behind it is delivered in order at once.',
      keyword: 'receiver buffers out of order',
      trap: 'Assuming the receiver delivers buffered frames as they arrive. It delivers them only when the gap is filled, so order is preserved.'
    },
    {
      id: 'sr-2', scene: 'sr', start: 157.5, end: 165,
      caption: 'Frame 2 is lost, but 3 and 4 are buffered and acknowledged. When 2 is resent, all three are delivered.',
      detail: 'The acknowledgements for 3 and 4 stop the sender from resending them. Only frame 2 times out, so only frame 2 is retransmitted, and the receiver then delivers 2, 3 and 4 in order.',
      narration: 'Same loss, different handling. Three and four are stored and acknowledged, so their timers stop. Only frame two times out, so only frame two is sent again, and when it arrives the receiver delivers two, three and four in order.',
      keyword: 'resend only frame 2',
      trap: 'Thinking the individual acknowledgements arrive in order. They may not; what matters is that each frame is acknowledged by number.'
    },
    {
      id: 'sr-3', scene: 'sr', start: 165, end: 172.5,
      caption: 'The same twelve frames with the same loss cost 13 transmissions at either window size.',
      detail: 'One loss costs one retransmission, so 12 frames take 13 transmissions whether the window is 4 or 8. The simulation confirms 13 at both, and confirms that the twelve frames are delivered exactly once and in order.',
      narration: 'Twelve frames, one loss, thirteen transmissions. At window four, and again at window eight. One loss costs one retransmission, and the window size does not change that. The saving against go-back-N is four, then eight.',
      keyword: '13 at both window sizes',
      trap: 'Assuming Selective Repeat also needs more transmissions at a larger window. It does not; the extra cost of a loss is exactly one frame.'
    },
    {
      id: 'sr-4', scene: 'sr', start: 172.5, end: 180,
      caption: 'The price is buffering: W frames at each end, twice the sequence space, and reordering logic.',
      detail: 'Selective Repeat needs a buffer of W frames at the receiver, and the sender must be able to retransmit any single frame, which needs a timer per outstanding frame in the usual implementation.',
      narration: 'The price is memory and bookkeeping. A window of buffers at the receiver. A copy of every outstanding frame at the sender. A timer per frame rather than one for the oldest. And logic to deliver in order from a buffer that is not in order.',
      keyword: 'W buffers at both ends',
      trap: 'Quoting the Go-Back-N buffer figure for Selective Repeat. The receiver buffer is W, not one.'
    },

    /* ---------------- scene 7: gbn bound ---------------- */
    {
      id: 'gb-b1', scene: 'gbnbound', start: 180, end: 187.5,
      caption: 'Three sequence bits give eight numbers, 0 to 7. Can a window of 8 be safe?',
      detail: 'The sequence number is a field of m bits, so it can carry 2 to the m distinct values and then repeats. The question is how many of those values a sender may have outstanding at once.',
      narration: 'Now the field width. Three bits carry eight numbers, nought to seven, and then they repeat. The question is how many of those eight a sender may use at once. The tempting answer is all eight.',
      keyword: 'm bits, 2^m numbers',
      trap: 'Treating the sequence field as a count rather than a set of labels that wrap around.'
    },
    {
      id: 'gb-b2', scene: 'gbnbound', start: 187.5, end: 195,
      caption: 'Send 0 to 7, have them all delivered and acknowledged, send the next eight reusing 0 to 7, and then an old duplicate acknowledgement arrives.',
      detail: 'With a window of 8 the sender may have all eight numbers outstanding. After they are acknowledged it sends the next eight, which reuse the same numbers. A delayed acknowledgement from the first batch now refers to the same number as a frame in the second batch, and the sender cannot tell which.',
      narration: 'Send eight frames numbered nought to seven. All arrive, all are acknowledged. Now send the next eight, and the numbers have to be reused. Now a late acknowledgement from the first batch arrives. It says nought. Which nought does it mean? The sender cannot know.',
      keyword: 'which zero does the ack mean',
      trap: 'Reading this as a receiver-side problem. For Go-Back-N the ambiguity is at the sender, in the acknowledgement, not at the receiver.'
    },
    {
      id: 'gb-b3', scene: 'gbnbound', start: 195, end: 202.5,
      caption: 'So one number must be held back: the window is at most two-to-the-m minus one, which is 7 here.',
      detail: 'Leaving one number unused separates the batch being acknowledged from the batch being sent. The window of 2 to the m minus 1 is the largest that keeps every acknowledgement unambiguous.',
      narration: 'So hold one number back. The window is at most two to the m minus one: seven here. The unused number is the gap between the batch being acknowledged and the batch being sent, and it is what makes an old acknowledgement unambiguous.',
      keyword: 'N at most 2^m - 1',
      trap: 'Forgetting the minus one. It is not a rounding nicety; it is the number that carries the whole argument.'
    },
    {
      id: 'gb-b4', scene: 'gbnbound', start: 202.5, end: 210,
      caption: 'Computed for m equal to 2, 3, 4 and 5, the first window that fails is 4, 8, 16 and 32 — exactly two-to-the-m.',
      detail: 'For each field width the model tests every window from one to 2 to the m and reports the first that produces a duplicate delivery. The first failure is always 2 to the m, so the largest safe window is one less.',
      narration: 'Do not take it on trust. For two, three, four and five bits, test every window size and find the first that goes wrong. Four, eight, sixteen, thirty-two: always two to the m. The safe window is one less than the number that fails.',
      keyword: 'first failure = 2^m',
      trap: 'Quoting the Selective Repeat bound here. Go-Back-N gets one less than the whole space; Selective Repeat gets half of it.'
    },

    /* ---------------- scene 8: sr bound ---------------- */
    {
      id: 'sr-b1', scene: 'srbound', start: 210, end: 217.5,
      caption: 'Selective Repeat buffers, so its receiver window is as wide as the sender window. That is what costs it the sequence space.',
      detail: 'Because the receiver accepts and stores any frame in its window, two windows exist in the number space at once: the sender window and the receiver window. Their ranges must never overlap.',
      narration: 'Selective Repeat has two windows in the same number space: the sender has one, the receiver has one of the same width. Two windows in one space, and they must never overlap.',
      keyword: 'two windows in one space',
      trap: 'Thinking the halved bound is a conservative engineering choice. It is forced by non-overlap.'
    },
    {
      id: 'sr-b2', scene: 'srbound', start: 217.5, end: 225,
      caption: 'With three bits and a window of 5: deliver 0 to 4, lose every acknowledgement, and the receiver window becomes 5, 6, 7, 0, 1.',
      detail: 'After delivering five frames the receiver window advances to start at 5, and wraps to include 0 and 1. The sender, having heard nothing, retransmits from 0. Number 0 is inside the receiver window, so it is accepted as new.',
      narration: 'Three bits, window five. Five frames delivered, every acknowledgement lost. The receiver window moves on to five, six, seven, and wraps to nought and one. The sender retransmits nought, and nought is inside that window, so it is accepted as a brand new frame.',
      keyword: 'the window wraps onto 0',
      trap: 'Assuming a lost acknowledgement is harmless. It is the loss of the acknowledgement that lets the two windows drift into each other.'
    },
    {
      id: 'sr-b3', scene: 'srbound', start: 225, end: 232.5,
      caption: 'A window of 4 is safe, because the receiver window becomes 4, 5, 6, 7 and stops short of 0.',
      detail: 'With a window of half the space, the advanced receiver window ends exactly one short of where the sender restarts. Number 0 falls outside it, so the retransmitted frame is recognised as old and discarded.',
      narration: 'Window four. The receiver window becomes four, five, six, seven and stops. The sender restarts at nought, which is outside the window, so the retransmission is recognised as old and dropped. That is the whole difference, one number of margin.',
      keyword: 'stops one short of 0',
      trap: 'Confusing this with Go-Back-N, where the receiver window is one frame and the margin is one number.'
    },
    {
      id: 'sr-b4', scene: 'srbound', start: 232.5, end: 240,
      caption: 'So the bound is two-to-the-m minus one: 2, 4, 8, 16 for two, three, four and five bits, and the first failing window is one more.',
      detail: 'Testing every window from one to 2 to the m, the first that produces a duplicate is 3, 5, 9 and 17, which is 2 to the m minus 1 plus one. The largest safe window is half the sequence space.',
      narration: 'So the safe window is half the space. For two, three, four and five bits that is two, four, eight, sixteen. And the computed first failure is three, five, nine, seventeen: always one more than the safe value.',
      keyword: 'N at most 2^(m-1)',
      trap: 'Writing two to the m minus one as the Selective Repeat bound. That is Go-Back-N; Selective Repeat is two to the m minus one, the exponent.'
    },

    /* ---------------- scene 9: cost ---------------- */
    {
      id: 'cs-1', scene: 'cost', start: 240, end: 247.5,
      caption: 'One loss, twelve frames: Go-Back-N transmits 17 at window 4 and 21 at window 8; Selective Repeat transmits 13 at both.',
      detail: 'The retransmission cost of Go-Back-N grows with the window, because the whole tail is resent. Selective Repeat pays exactly one frame per loss, whatever the window.',
      narration: 'Put the two side by side. One loss in twelve frames. Go-back-N pays four extra transmissions at window four and eight extra at window eight. Selective Repeat pays one, at either window. The gap widens with the window.',
      keyword: '17 and 21 against 13',
      trap: 'Comparing the two protocols on an error-free link. There they are identical, because the formula does not mention which protocol you are running.'
    },
    {
      id: 'cs-2', scene: 'cost', start: 247.5, end: 255,
      caption: 'Elapsed time differs too: 24 against 23 at window 4, and 24 against 20 at window 8, in transmission times.',
      detail: 'Go-Back-N spends extra transmission slots resending frames that were already received, so its elapsed time grows with the window. Selective Repeat at window 8 finishes in 20 frame times against 24.',
      narration: 'Time as well as count. At window four, twenty-four frame times against twenty-three. At window eight, twenty-four against twenty. Go-back-N wastes slots on frames that already arrived, and the waste grows with the window.',
      keyword: '24 against 20',
      trap: 'Reporting the count and the time as the same quantity. A retransmission costs one slot of the link, which is time as well as bandwidth.'
    },
    {
      id: 'cs-3', scene: 'cost', start: 255, end: 262.5,
      caption: 'The window you need is still the bandwidth-delay product, and it decides whether the sequence field is wide enough.',
      detail: 'A link whose round trip holds 21 frames needs a window of 21 for full utilisation, and 21 frames need 5 sequence bits under Go-Back-N and 6 under Selective Repeat, since 21 exceeds 15 and 16 respectively.',
      narration: 'And the window is still the bandwidth-delay product. Our twenty-one-frame pipe needs twenty-one frames of window, which needs five sequence bits under go-back-N and six under Selective Repeat. Window and field width are one question asked twice.',
      keyword: '21 needs 5 bits, or 6',
      trap: 'Choosing the field width from the window without checking the bound. A window of 21 does not fit in four bits under either protocol.'
    },
    {
      id: 'cs-4', scene: 'cost', start: 262.5, end: 270,
      caption: 'Choose by what the link is like: clean links make the two identical, lossy links favour Selective Repeat, memory-poor receivers favour Go-Back-N.',
      detail: 'On an error-free link the utilisation formula is the same for both, so the simpler protocol is the right engineering choice. Loss changes the arithmetic, and the retransmission cost is what separates them.',
      narration: 'So how do you choose? On a clean link, either: the formula is the same and the simpler one is cheaper. On a lossy link, Selective Repeat, because each loss costs one frame. On a receiver with no memory, Go-Back-N, and accept the retransmissions.',
      keyword: 'clean, lossy, memory-poor',
      trap: 'Answering a "which protocol" question with an efficiency comparison. Efficiency on an error-free link cannot distinguish them.'
    },

    /* ---------------- scene 10: procedure ---------------- */
    {
      id: 'pr-1', scene: 'procedure', start: 270, end: 277.5,
      caption: 'Four lines: Tt, then Tp, then a and one plus two a, then substitute.',
      detail: 'The procedure is fixed. Transmission time is frame size over rate. Propagation time is distance over speed, or whatever the question states. a is propagation over transmission. Then efficiency is W over one plus two a, and the window is the ceiling of that denominator.',
      narration: 'Four lines and you are done. Transmission time, propagation time, the ratio, then substitute. Write them down in that order and the question stops being a network question and becomes arithmetic.',
      keyword: 'Tt, Tp, a, substitute',
      trap: 'Skipping to the formula. Almost every error in this family is in the first two lines, in units.'
    },
    {
      id: 'pr-2', scene: 'procedure', start: 277.5, end: 285,
      caption: 'Trap one: doubling the one-way delay twice. Trap two: bytes against bits. Trap three: forgetting the plus one.',
      detail: 'If the question gives a one-way delay, the formula uses two of them. If it gives frame size in bytes and rate in bits, multiply by eight. And the denominator is one plus two a, not two a.',
      narration: 'Three traps by sight. Doubling a delay the question already gave as a round trip. Mixing bytes and bits. And dropping the plus one, which turns twenty-one into twenty.',
      keyword: 'delay, units, plus one',
      trap: 'All three produce numbers that appear among the options, which is why they survive a careless check.'
    },
    {
      id: 'pr-3', scene: 'procedure', start: 285, end: 292.5,
      caption: 'Trap four: giving Go-Back-N the Selective Repeat bound. Trap five: assuming a bigger window always transmits less.',
      detail: 'Go-Back-N is bounded by 2 to the m minus 1 and Selective Repeat by 2 to the m minus 1 with the exponent, half the space. And on a lossy link a larger window increases the transmissions under Go-Back-N.',
      narration: 'Two more. Go-back-N gets one less than the whole space; Selective Repeat gets half of it. And a bigger window does not always mean fewer transmissions: under go-back-N on a lossy link it means more, because each loss resends the whole window.',
      keyword: '2^m - 1 against 2^(m-1)',
      trap: 'Both bounds contain a minus one. One is in the base, the other in the exponent, and they are not interchangeable.'
    },
    {
      id: 'pr-4', scene: 'procedure', start: 292.5, end: 300,
      caption: 'Write down which quantity the question wants — efficiency, window, bits or transmissions — and the five traps cannot survive.',
      detail: 'The family asks for four different quantities from the same three numbers. Naming the quantity before computing is the cheapest check available, because a window cannot be fractional, a bit count cannot be less than one, and an efficiency cannot exceed one.',
      narration: 'One habit covers the family. Before computing, write the quantity the question wants: an efficiency, a window, a number of bits, or a count of transmissions. Each has its own sanity check, and every trap in this lesson fails one of them.',
      keyword: 'name the quantity first',
      trap: 'Answering with the intermediate you computed rather than the quantity asked for. It is the most common lost mark in this family.'
    }
  ]
};
