/* ==========================================================================
   tcp-flow-congestion-control-and-sockets — THE timeline.
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
      id: 'twowindows',
      n: 1,
      title: 'Two windows, one sender',
      start: 0, end: 30,
      objective: 'Separate the two limits on a TCP sender — the advertised receiver window and the congestion window — and state that the smaller one binds.'
    },
    {
      id: 'flow',
      n: 2,
      title: 'Flow control: the receiver sets a budget',
      start: 30, end: 60,
      objective: 'Compute a usable window from the advertised window and the bytes in flight, and name the three diseases of a window that is too small.'
    },
    {
      id: 'slowstart',
      n: 3,
      title: 'Slow start: doubling, and where it stops',
      start: 60, end: 90,
      objective: 'Trace the congestion window through slow start, and tell growth per acknowledgement apart from growth per round trip.'
    },
    {
      id: 'aimd',
      n: 4,
      title: 'Additive increase, multiplicative decrease',
      start: 90, end: 120,
      objective: 'Apply the two loss signals — a timeout and three duplicate acknowledgements — and see why they cut the window differently.'
    },
    {
      id: 't14',
      n: 5,
      title: 'GATE 2014 Set 1: back to 32 KB after a timeout',
      start: 120, end: 150,
      objective: 'Run one complete window trace from a timeout to a target window, and convert round trips into milliseconds.'
    },
    {
      id: 't20',
      n: 6,
      title: 'GATE 2020: the receiver window that never binds',
      start: 150, end: 180,
      objective: 'Walk a ten-round-trip trace with a stated threshold, and see why the advertised window can be irrelevant.'
    },
    {
      id: 't24',
      n: 7,
      title: 'GATE 2024 Set 2: the signal decides the answer',
      start: 180, end: 210,
      objective: 'Compute the same loss under a timeout and under three duplicate acknowledgements, and show that the two answers differ from the first round trip.'
    },
    {
      id: 'thru',
      n: 8,
      title: 'Throughput, and the window the path needs',
      start: 210, end: 240,
      objective: 'Derive average throughput as three quarters of the peak window over the round trip, and compute the bandwidth-delay product.'
    },
    {
      id: 'sock',
      n: 9,
      title: 'The socket API and the handshake under it',
      start: 240, end: 270,
      objective: 'Order the socket calls on each side, map them onto the three-way handshake, and size a segment from the link MTU.'
    },
    {
      id: 'slips',
      n: 10,
      title: 'The procedure, and the four slips',
      start: 270, end: 300,
      objective: 'Reduce the clause to a four-step routine and four habits that prevent the standard arithmetic errors.'
    }
  ],

  events: [
    /* ---------------- scene 1: two windows ---------------- */
    {
      id: 'tw-1', scene: 'twowindows', start: 0, end: 7.5,
      caption: 'Two numbers limit a TCP sender: what the receiver can hold, and what the network can carry.',
      detail: 'The receiver advertises a window in every acknowledgement. That is flow control, and it protects the receiver buffer. The sender also keeps a congestion window, never advertised, which protects the network.',
      narration: 'A TCP sender is limited by two numbers. The receiver advertises a window in every acknowledgement, saying how much more it can hold. The sender also keeps a congestion window of its own, which nobody advertises, and which stands for what the network is believed to carry. Flow control protects the receiver. Congestion control protects the network.',
      keyword: 'two numbers',
      trap: 'The two limits answer different questions. Mixing them up is the commonest conceptual error in this clause.'
    },
    {
      id: 'tw-2', scene: 'twowindows', start: 7.5, end: 15,
      caption: 'The sender may have at most the smaller of the two in flight.',
      detail: 'Bytes in flight means bytes sent and not yet acknowledged. The rule is: in flight at most the minimum of the receiver window and the congestion window. When the receiver window is smaller the connection is flow limited; when the congestion window is smaller it is congestion limited.',
      narration: 'The sender may have in flight at most the smaller of the two. Bytes in flight means bytes sent and not yet acknowledged. If the receiver window is the smaller one, the connection is flow limited. If the congestion window is the smaller one, it is congestion limited. One rule, two possible binding constraints.',
      keyword: 'the smaller of the two',
      trap: 'A question that says "the sender is limited by the window" is ambiguous until you know which window binds.'
    },
    {
      id: 'tw-3', scene: 'twowindows', start: 15, end: 22.5,
      caption: 'The receiver number is visible: a 16-bit window field in every segment header.',
      detail: 'The header window field is 16 bits, so without options the largest advertised window is 65535 bytes. A scaling option multiplies it by a power of two, because a fast long-distance path needs a bigger window than 64 kilobytes.',
      narration: 'The receiver number is visible on the wire: a sixteen-bit window field in the header of every segment. Sixteen bits means the largest window it can name is sixty-five thousand five hundred and thirty-five bytes. On a fast path with a long round trip that is not enough, so the window scaling option multiplies it by a power of two.',
      keyword: '16-bit field',
      trap: 'The advertised window is counted in bytes. A question that reads it as a number of segments has already gone wrong.'
    },
    {
      id: 'tw-4', scene: 'twowindows', start: 22.5, end: 30,
      caption: 'The congestion window is inferred, not signalled: loss is the only feedback.',
      detail: 'No field carries the congestion window. The sender grows it while acknowledgements arrive and cuts it when a loss is detected, either by a retransmission timeout or by duplicate acknowledgements. That is why congestion control is a control loop rather than a protocol field.',
      narration: 'The congestion window is never carried in a field. The sender grows it while acknowledgements keep arriving and cuts it when it sees a loss, either as a timeout or as duplicate acknowledgements. That is why congestion control is a control loop rather than a header field: the network never tells you its capacity, you estimate it and correct.',
      keyword: 'inferred from loss',
      trap: 'Do not look for a congestion window field in the TCP header. There is none; only the receiver window has a field.'
    },

    /* ---------------- scene 2: flow control ---------------- */
    {
      id: 'fl-1', scene: 'flow', start: 30, end: 37.5,
      caption: 'Usable window = advertised window − bytes already in flight.',
      detail: 'With an advertised window of 6 MSS and 2 MSS unacknowledged, the sender may put 4 MSS more on the wire. The arithmetic is in bytes, not segments, and the window slides forward as acknowledgements arrive.',
      narration: 'The sender computes a usable window: the advertised window minus the bytes already in flight. If the receiver advertises six segments and two are still unacknowledged, four more may be sent. The arithmetic is in bytes, and the window slides forward as acknowledgements arrive.',
      keyword: 'usable window',
      trap: 'The window is a count of bytes measured from the acknowledgement number, not a list of sequence numbers.'
    },
    {
      id: 'fl-2', scene: 'flow', start: 37.5, end: 45,
      caption: 'A zero window is not the end: the sender probes, and the receiver sends a window update.',
      detail: 'When the receiver buffer is full it advertises zero. The sender must not send data, but it keeps sending a zero-window probe, because the update that reopens the window can itself be lost. Without the probe the connection deadlocks.',
      narration: 'When the receiver buffer fills it advertises zero. The sender stops sending data but keeps sending a small probe, because the update that reopens the window can itself be lost. Without that probe the connection would wait forever.',
      keyword: 'zero-window probe',
      trap: 'A zero window is a pause, not a close. Only a FIN or a reset ends the connection.'
    },
    {
      id: 'fl-3', scene: 'flow', start: 45, end: 52.5,
      caption: 'Silly window syndrome: tiny windows and tiny segments both waste the link.',
      detail: 'Receiver side: advertise a window only when it is at least a useful minimum, otherwise hold the update. Sender side: Nagle algorithm holds a small segment while earlier data is unacknowledged, releasing it on the acknowledgement or when a full segment accumulates.',
      narration: 'Two small-number diseases have the same cure. On the receiver side, do not advertise a tiny window: wait until a useful amount of space is free. On the sender side, the Nagle algorithm holds a small segment back while earlier data is unacknowledged. Both avoid filling the link with tiny segments and one-byte windows.',
      keyword: 'tiny windows',
      trap: 'Delayed acknowledgement is the third piece: acknowledge at least every second full segment, and within about half a second.'
    },
    {
      id: 'fl-4', scene: 'flow', start: 52.5, end: 60,
      caption: 'Test: with no loss at all, the advertised window alone caps the rate.',
      detail: 'On a path with no loss the achievable rate is the advertised window divided by the round trip. A 65535-byte window over a 100-millisecond round trip caps the rate near 5.2 megabits per second however fast the link is.',
      narration: 'Here is the test that separates the two ideas. On a path with no loss at all, the rate is capped by the advertised window divided by the round trip. Sixty-five thousand five hundred and thirty-five bytes over a hundred milliseconds is about five point two megabits per second, no matter how fast the link is.',
      keyword: 'window over round trip',
      trap: 'If the answer changes when the receiver buffer grows, the limit was flow control, not congestion control.'
    },

    /* ---------------- scene 3: slow start ---------------- */
    {
      id: 'ss-1', scene: 'slowstart', start: 60, end: 67.5,
      caption: 'Slow start: one segment, then two, then four. It doubles every round trip.',
      detail: 'The name misleads. Each acknowledgement adds one segment to the congestion window, and a whole window is acknowledged per round trip, so the window doubles per round trip: 1, 2, 4, 8, 16.',
      narration: 'Slow start begins with one segment and doubles the congestion window every round trip: one, two, four, eight, sixteen. The name misleads, because this is the fastest growth in the whole algorithm. It is called slow start because it starts small, not because it grows slowly.',
      keyword: 'doubles',
      trap: 'Nothing about slow start is slow. Exponential growth is the whole point of the phase.'
    },
    {
      id: 'ss-2', scene: 'slowstart', start: 67.5, end: 75,
      caption: 'Per acknowledgement it is plus one segment; per round trip it is a doubling.',
      detail: 'GATE 2018 Q14 asked exactly this. Plus 2 MSS per ACK is false. Doubling per ACK is false. Plus 1 MSS per round trip is false, that is congestion avoidance. Approximately doubling every round trip is true.',
      narration: 'Per acknowledgement the window grows by one segment. Per round trip it therefore doubles. GATE twenty eighteen asked which of these statements is true, and only the doubling per round trip is. The other three describe something else: two segments per acknowledgement, doubling per acknowledgement, or one segment per round trip.',
      keyword: 'per ACK against per RTT',
      trap: 'One segment per round trip is congestion avoidance, not slow start. That sentence is the trap in the 2018 question.'
    },
    {
      id: 'ss-3', scene: 'slowstart', start: 75, end: 82.5,
      caption: 'Doubling stops at the threshold. At or above it, growth becomes linear.',
      detail: 'The slow start threshold is a second state variable. While the congestion window is below it the window doubles per round trip; at or above it the sender switches to congestion avoidance and adds about one segment per round trip.',
      narration: 'Doubling does not continue forever. A second variable, the slow start threshold, marks the switch. While the window is below the threshold it doubles. At or above the threshold the sender switches to congestion avoidance and adds about one segment per round trip.',
      keyword: 'the threshold',
      trap: 'A doubling that would land above the threshold stops exactly at the threshold, never past it.'
    },
    {
      id: 'ss-4', scene: 'slowstart', start: 82.5, end: 90,
      caption: 'Why exponential first? Because the sender knows nothing about the path.',
      detail: 'Starting small and doubling finds a working rate in a logarithmic number of round trips, and does little damage if the estimate is far too high. That is the design argument for starting at one segment.',
      narration: 'Why start with doubling at all? Because the sender knows nothing about the path. Starting small and doubling finds a working rate in a logarithmic number of round trips, and if the guess is far too high the damage is small. The growth is exponential because the uncertainty is large.',
      keyword: 'logarithmic discovery',
      trap: 'RFC 5681 allows an initial window of up to four segments. GATE questions state a start of one segment; use the number the question gives.'
    },

    /* ---------------- scene 4: AIMD ---------------- */
    {
      id: 'ai-1', scene: 'aimd', start: 90, end: 97.5,
      caption: 'Congestion avoidance: about one segment more per round trip. Additive increase.',
      detail: 'Above the threshold each acknowledgement adds a fraction of a segment, arranged so that a whole window of acknowledgements adds exactly one segment. The window then climbs by one segment per round trip.',
      narration: 'Above the threshold the rule changes. Each acknowledgement adds a small fraction of a segment, arranged so that a whole window of acknowledgements adds exactly one segment. The window then climbs by one segment per round trip. This is the additive increase of additive increase, multiplicative decrease.',
      keyword: 'one segment per RTT',
      trap: 'Linear growth is much slower than doubling. Do not carry the doubling rule past the threshold.'
    },
    {
      id: 'ai-2', scene: 'aimd', start: 97.5, end: 105,
      caption: 'A timeout means severe loss: halve the threshold, restart the window at one segment.',
      detail: 'On a retransmission timeout the sender sets the slow start threshold to half of the data in flight, then restarts the congestion window at one segment. Growth is exponential again up to the new threshold, then linear.',
      narration: 'A timeout is the strong signal. The sender sets the slow start threshold to half of what was in flight, and restarts the congestion window at one segment. Growth becomes exponential again up to the new threshold, and linear after it. That is the multiplicative decrease.',
      keyword: 'halve, restart at one',
      trap: 'The threshold is halved from the window at the loss, not from the receiver window.'
    },
    {
      id: 'ai-3', scene: 'aimd', start: 105, end: 112.5,
      caption: 'Three duplicate ACKs are a weaker signal: retransmit at once, and cut less.',
      detail: 'A duplicate acknowledgement says a later segment arrived while one is missing. Three of them trigger an immediate retransmission without waiting for the timer. In the Reno variant the window drops to the new threshold rather than to one segment, because the path is still delivering.',
      narration: 'Three duplicate acknowledgements are a gentler signal: later segments are arriving, so the path still works and only one segment is missing. The sender retransmits immediately instead of waiting for the timer, and in the Reno variant it drops the window only to the new threshold rather than to one segment.',
      keyword: 'three duplicate ACKs',
      trap: 'Tahoe and Reno differ here. Tahoe restarts at one segment; Reno restarts at the threshold. Read which one the question names.'
    },
    {
      id: 'ai-4', scene: 'aimd', start: 112.5, end: 120,
      caption: 'The sawtooth: climb by one, halve, climb again.',
      detail: 'Additive increase and multiplicative decrease together produce a sawtooth in time. The window oscillates between half its peak and the peak, which is why its average is three quarters of the peak rather than the peak itself.',
      narration: 'Put the two halves together and the window traces a sawtooth: climb by one segment per round trip, then halve, then climb again. It oscillates between half its peak and the peak. That shape is what the next scenes turn into numbers.',
      keyword: 'sawtooth',
      trap: 'The average of the sawtooth is three quarters of the peak, a fact the throughput scene turns into a formula.'
    },

    /* ---------------- scene 5: GATE 2014 Set 1 ---------------- */
    {
      id: 't14-1', scene: 't14', start: 120, end: 127.5,
      caption: 'GATE 2014 Set 1 Q27: window 32 KB at a timeout, round trip 100 ms, segment 2 KB.',
      detail: 'The question asks how long it takes to get back to a 32-kilobyte window. Convert everything to segments first: 32 KB at 2 KB per segment is 16 segments, and the round trip is 100 milliseconds.',
      narration: 'GATE twenty fourteen, set one, question twenty-seven. The congestion window is thirty-two kilobytes when a timeout occurs. The round trip is a hundred milliseconds and the segment size is two kilobytes. How long until the window is back to thirty-two kilobytes? Convert to segments first: sixteen segments, a hundred milliseconds per round trip.',
      keyword: '16 segments',
      trap: 'Mixing kilobytes and segments inside one trace is the first way this question goes wrong.'
    },
    {
      id: 't14-2', scene: 't14', start: 127.5, end: 135,
      caption: 'The timeout halves the threshold to 8 segments and restarts the window at 1.',
      detail: 'Sixteen segments halved is eight. The window restarts at one segment and doubles while it stays below eight: 1, 2, 4, 8. Three doublings, so four round trips, bring it to the threshold.',
      narration: 'The timeout halves the threshold: sixteen segments becomes eight. The window restarts at one and doubles while it stays below eight: one, two, four, eight. Three doublings, four round trips, take it to the threshold.',
      keyword: 'threshold 8',
      trap: 'Halve the window at the loss, not the target window you are trying to reach.'
    },
    {
      id: 't14-3', scene: 't14', start: 135, end: 142.5,
      caption: 'Then one segment per round trip: 9, 10, 11, 12, 13, 14, 15, 16.',
      detail: 'From eight to sixteen is eight more round trips, because each round trip adds exactly one segment. Counting from the restart, the window reaches sixteen segments at round trip eleven.',
      narration: 'From the threshold the growth is linear. Eight segments to sixteen is eight more round trips, one segment each. Counting from the restart, the window reaches sixteen at round trip eleven.',
      keyword: 'eight more RTTs',
      trap: 'The endpoint counts. Sixteen is reached at the end of the eleventh round trip, not the tenth.'
    },
    {
      id: 't14-4', scene: 't14', start: 142.5, end: 150,
      caption: 'Eleven round trips at 100 ms is 1100 ms. Count the trace, do not trust a formula.',
      detail: 'The published key accepts a range, because solutions differ on whether the round trip in which the timeout occurs is counted. Counting from the restart gives 11 round trips and 1100 milliseconds, which this page computes from the stated rule.',
      narration: 'Eleven round trips at a hundred milliseconds is eleven hundred milliseconds. The published key allows a range, because solutions differ on whether the round trip in which the timeout occurs is counted. Counting from the restart gives eleven hundred, and that is what this page computes from the stated rule.',
      keyword: '1100 ms',
      trap: 'A range in the key means the convention is arguable. Write the convention you used beside the number.'
    },

    /* ---------------- scene 6: GATE 2020 ---------------- */
    {
      id: 't20-1', scene: 't20', start: 150, end: 157.5,
      caption: 'GATE 2020 Q55: round trip 6 ms, receiver window 50 KB, threshold 32 KB, segment 2 KB.',
      detail: 'Sixty milliseconds is ten round trips of six milliseconds. The question asks for the congestion window after the acknowledgements of the tenth round trip are processed, with no timeouts and no errors.',
      narration: 'GATE twenty twenty, question fifty-five. Round trip six milliseconds, receiver window fifty kilobytes, slow start threshold thirty-two kilobytes, segment two kilobytes. Sixty milliseconds is ten round trips. No timeouts, no errors. Find the congestion window after the tenth.',
      keyword: '10 RTTs',
      trap: 'Divide the elapsed time by the round trip before touching the window at all.'
    },
    {
      id: 't20-2', scene: 't20', start: 157.5, end: 165,
      caption: 'Doubling to the threshold: 2, 4, 8, 16, 32 KB after four round trips.',
      detail: 'The threshold is 32 KB, so doubling runs from 2 KB up to exactly 32 KB, reached after four round trips. The receiver window of 50 KB has not bound anything yet.',
      narration: 'Doubling carries the window from two kilobytes to thirty-two in four round trips: two, four, eight, sixteen, thirty-two. The threshold is reached exactly, and the receiver window of fifty kilobytes has not interfered at all.',
      keyword: '2, 4, 8, 16, 32',
      trap: 'When the threshold is a power of two, the doubling lands on it exactly and no rounding question arises.'
    },
    {
      id: 't20-3', scene: 't20', start: 165, end: 172.5,
      caption: 'Then two kilobytes per round trip for the remaining six: up to 44 KB.',
      detail: 'Each round trip adds one segment, which is 2 KB here. Six more round trips take the window from 32 KB to 44 KB. The receiver window of 50 KB still does not bind, so the congestion window is the answer.',
      narration: 'The remaining six round trips add one segment each, and a segment is two kilobytes: thirty-four, thirty-six, thirty-eight, forty, forty-two, forty-four. Forty-four kilobytes is the answer, and fifty kilobytes was never reached, so the receiver window never bound.',
      keyword: '44 KB',
      trap: 'Check the receiver window at the end. If the answer had exceeded 50 KB, the trace would have been capped there.'
    },
    {
      id: 't20-4', scene: 't20', start: 172.5, end: 180,
      caption: 'Change one number and the answer changes: the threshold is given, not derived.',
      detail: 'A common wrong method halves the receiver window to invent a threshold, which gives 25 KB and a different trace. The question states the threshold; a threshold is derived only after a loss event.',
      narration: 'One warning. A common wrong method halves the receiver window to invent a threshold. That gives twenty-five kilobytes and a different answer. Here the threshold is stated in the question. A threshold is derived only after a loss, never from the receiver buffer.',
      keyword: 'given, not derived',
      trap: 'If a question omits the threshold, look for the last loss event. Never default to half the receiver window.'
    },

    /* ---------------- scene 7: GATE 2024 Set 2 ---------------- */
    {
      id: 't24-1', scene: 't24', start: 180, end: 187.5,
      caption: 'GATE 2024 Set 2 Q54: window 12 MSS at a timeout, two clean round trips after.',
      detail: 'Twelve segments halved is six, and the window restarts at one. Two round trips of doubling give two segments, then four. The answer is four segments.',
      narration: 'GATE twenty twenty-four, set two, question fifty-four. The window is twelve segments when a timeout occurs, and the next two round trips are fully acknowledged. Twelve halved is six, so the threshold is six and the window restarts at one. One round trip gives two, the next gives four. The answer is four segments.',
      keyword: '4 MSS',
      trap: 'Count the round trips after the loss. The round trip in which the loss happened is not one of them.'
    },
    {
      id: 't24-2', scene: 't24', start: 187.5, end: 195,
      caption: 'Watch the cap: doubling stops at the threshold, so 4 would become 6, not 8.',
      detail: 'If a third round trip were clean, the window would go from four to six and not to eight, because six is the threshold. From there growth is linear. Missing this cap is the commonest arithmetic slip in this family.',
      narration: 'There is a cap to watch. A third clean round trip would take the window from four to six, not to eight, because six is the threshold. From there the growth is linear. Forgetting that cap is the commonest arithmetic slip in this family of questions.',
      keyword: 'the cap at 6',
      trap: 'Doubling past the threshold is wrong even when the numbers are small.'
    },
    {
      id: 't24-3', scene: 't24', start: 195, end: 202.5,
      caption: 'Had the loss been three duplicate ACKs, the window would be 6, then 7, then 8.',
      detail: 'Under Reno, three duplicate acknowledgements halve the threshold to six and set the window to six. The two clean round trips then add one each: seven, then eight. The signal decides the answer, so read the loss type first.',
      narration: 'Now change one word. If the loss had been detected by three duplicate acknowledgements instead of a timeout, the threshold is still six, but the window is set to six rather than one. The two clean round trips then give seven and eight. The kind of loss decides the answer, so read it first.',
      keyword: 'the signal decides',
      trap: 'A question that names no signal is ambiguous under Reno. Real questions name the signal or the variant.'
    },
    {
      id: 't24-4', scene: 't24', start: 202.5, end: 210,
      caption: 'Same numbers, two answers: 4 MSS after a timeout, 8 MSS after duplicate ACKs.',
      detail: 'The two traces separate at the first round trip after the loss. That is why the loss type is part of the question, not a detail to be guessed.',
      narration: 'Same numbers, two different answers: four segments after a timeout, eight after three duplicate acknowledgements. The traces separate immediately. That is why the loss type is part of the question and not a detail to be guessed.',
      keyword: '4 against 8',
      trap: 'Write the variant at the top of your rough work: timeout with Tahoe, or duplicate acknowledgements with Reno.'
    },

    /* ---------------- scene 8: throughput ---------------- */
    {
      id: 'th-1', scene: 'thru', start: 210, end: 217.5,
      caption: 'Average throughput of AIMD = three quarters of the peak window, over the round trip.',
      detail: 'The window oscillates between half the peak and the peak, so its time average is three quarters of the peak. Dividing that by the round trip gives the average rate, in bytes per second if the window is in bytes.',
      narration: 'Because the sawtooth runs between half the peak and the peak, its average is three quarters of the peak. Divide by the round trip and you have the average rate. That is the whole throughput formula for additive increase, multiplicative decrease.',
      keyword: 'three quarters of the peak',
      trap: 'Use the average window, not the peak. Using the peak overstates the throughput by a third.'
    },
    {
      id: 'th-2', scene: 'thru', start: 217.5, end: 225,
      caption: 'Worked: peak 100 segments of 1460 bytes, round trip 40 ms, gives 21.9 Mbps.',
      detail: 'Three quarters of one hundred segments is seventy-five. Seventy-five segments of 1460 bytes is 109500 bytes per round trip, which over 40 milliseconds is 2737500 bytes per second, about 21.9 megabits per second.',
      narration: 'Take a peak of a hundred segments, a segment of fourteen hundred and sixty bytes, and a forty millisecond round trip. Three quarters of the peak is seventy-five segments, which is a hundred and nine thousand five hundred bytes. Per forty milliseconds that is two million seven hundred and thirty-seven thousand five hundred bytes per second, about twenty-one point nine megabits per second.',
      keyword: '21.9 Mbps',
      trap: 'Keep the units: bytes per second is not bits per second. Multiply by eight only at the end.'
    },
    {
      id: 'th-3', scene: 'thru', start: 225, end: 232.5,
      caption: 'A window that is too small leaves the pipe empty: fill it with bandwidth × round trip.',
      detail: 'The bandwidth-delay product is the data the path can hold in flight. On 100 megabits per second with a 100 millisecond round trip it is 1.25 megabytes, far more than a 16-bit window field can name.',
      narration: 'A window that is too small leaves the pipe empty. The data the path can hold is the bandwidth times the round trip: a hundred megabits per second over a hundred milliseconds is one and a quarter megabytes. That is the window needed to keep the link busy.',
      keyword: 'bandwidth-delay product',
      trap: 'The product is in bits until you divide by eight. Convert before comparing with a window measured in bytes.'
    },
    {
      id: 'th-4', scene: 'thru', start: 232.5, end: 240,
      caption: 'So the 16-bit window is scaled by an option, and the arithmetic is unchanged.',
      detail: 'Window scaling multiplies the advertised field by a power of two agreed at connection setup. A factor of 32 raises the ceiling from about 64 kilobytes to about 2 megabytes, enough for this path.',
      narration: 'Sixteen bits cannot name one and a quarter megabytes, so TCP scales the window field by a power of two agreed when the connection opens. A factor of thirty-two lifts the ceiling to about two megabytes, which covers this path. The formula is unchanged; only the unit got bigger.',
      keyword: 'window scaling',
      trap: 'Scaling is negotiated in the handshake. It cannot be switched on in the middle of a connection.'
    },

    /* ---------------- scene 9: sockets ---------------- */
    {
      id: 'so-1', scene: 'sock', start: 240, end: 247.5,
      caption: 'The socket calls in order: the server binds, listens, accepts; the client connects.',
      detail: 'Server: socket, bind, listen, accept, then read and write, then close. Client: socket, connect, then read and write, then close. listen turns an active socket into a passive one, and accept returns a new connected socket.',
      narration: 'The socket interface is a short list of calls. The server creates a socket, binds it to a port, calls listen to make it passive, and calls accept to take a connection. The client creates a socket and calls connect. After that both sides read and write on connected sockets, and both call close at the end.',
      keyword: 'bind, listen, accept',
      trap: 'GATE 2015 Set 2 asked for the server order and offered accept first as a distractor.'
    },
    {
      id: 'so-2', scene: 'sock', start: 247.5, end: 255,
      caption: 'The handshake maps onto the calls: SYN, SYN-ACK, then ACK.',
      detail: 'connect sends the SYN. The server replies SYN-ACK, and the client kernel sends the final ACK before accept returns, so accept hands back a socket whose connection is already established. The connection is named by four values: both addresses and both ports.',
      narration: 'The handshake maps onto those calls. Connect sends the first packet, the SYN. The server replies with SYN and acknowledgement, and the client kernel sends the final acknowledgement before accept returns. So accept hands back a socket whose connection is already established. The connection is identified by four values: both addresses and both ports.',
      keyword: 'SYN, SYN-ACK, ACK',
      trap: 'The server answers the handshake in its kernel. accept does not send the SYN-ACK.'
    },
    {
      id: 'so-3', scene: 'sock', start: 255, end: 262.5,
      caption: 'Segment size follows from the link: MSS = MTU − 40 for IPv4 TCP.',
      detail: 'Twenty bytes of IP header and twenty of TCP header come out of the link maximum transmission unit. Ethernet 1500 bytes gives a 1460-byte segment. A 10000-byte transfer is seven segments: six full and one of 1240 bytes.',
      narration: 'Segment size is not free. Twenty bytes of IP header and twenty of TCP header come out of the link maximum transmission unit, so an Ethernet frame of fifteen hundred bytes carries fourteen hundred and sixty bytes of data. A ten thousand byte transfer is seven segments: six full ones and a last one of twelve hundred and forty bytes.',
      keyword: 'MSS = MTU − 40',
      trap: 'With IPv6 the overhead is 60 bytes, so the same MTU gives a 1440-byte segment.'
    },
    {
      id: 'so-4', scene: 'sock', start: 262.5, end: 270,
      caption: 'Closing is not symmetric: the active closer waits in TIME_WAIT for two segment lifetimes.',
      detail: 'After sending the final acknowledgement the active closer waits, so that a lost acknowledgement can be retransmitted and so that old duplicates from the same four-tuple expire before the port is reused. That is why a busy server shows sockets in TIME_WAIT.',
      narration: 'Closing is not symmetric in time. The side that closes first waits in a state called TIME_WAIT for twice the maximum segment lifetime. That wait lets a lost final acknowledgement be retransmitted, and it lets old duplicates from the same four-tuple die before the port is reused. It is why a busy server shows sockets in TIME_WAIT.',
      keyword: 'TIME_WAIT',
      trap: 'Only the active closer enters TIME_WAIT. The passive closer goes straight to CLOSED.'
    },

    /* ---------------- scene 10: procedure ---------------- */
    {
      id: 'sl-1', scene: 'slips', start: 270, end: 277.5,
      caption: 'For a window question: convert to segments, then walk round trip by round trip.',
      detail: 'Convert every quantity into segments. Note which loss signal fired and apply it. Walk each round trip, doubling below the threshold and adding one at or above it. Stop at exactly the round trip the question names.',
      narration: 'For any window question, four steps. Convert every quantity into segments. Note which loss signal fired, and apply it. Walk the trace round trip by round trip, doubling below the threshold and adding one at or above it. And stop at exactly the round trip the question names.',
      keyword: 'convert, then walk',
      trap: 'Walking one round trip too far is the quiet error. Mark the round trip you are asked about before you start.'
    },
    {
      id: 'sl-2', scene: 'slips', start: 277.5, end: 285,
      caption: 'Four slips account for most lost marks in this clause.',
      detail: 'Doubling past the threshold. Inventing a threshold by halving the receiver window. Confusing growth per acknowledgement with growth per round trip. Treating flow control and congestion control as one limit.',
      narration: 'Four slips account for most lost marks here. Doubling past the threshold. Inventing a threshold by halving the receiver window. Confusing growth per acknowledgement with growth per round trip. And treating flow control and congestion control as one limit instead of two.',
      keyword: 'four slips',
      trap: 'Each slip is usually offered as an answer option, which is why the options look familiar.'
    },
    {
      id: 'sl-3', scene: 'slips', start: 285, end: 292.5,
      caption: 'Two questions separate the hard cases: which window binds, and which signal fired.',
      detail: 'Ask which of the two windows is smaller over the range the question covers; that is the binding constraint. Ask whether the loss was a timeout or duplicate acknowledgements; that decides the window immediately after the cut.',
      narration: 'Two questions separate the hard cases. Which of the two windows is smaller over the range asked about? That is the binding constraint. And which signal fired at the loss? That decides what the window becomes immediately afterwards.',
      keyword: 'which binds, which fired',
      trap: 'Both questions are answered before any arithmetic. Answer them first and the trace writes itself.'
    },
    {
      id: 'sl-4', scene: 'slips', start: 292.5, end: 300,
      caption: 'This clause connects back to IP and forward to DNS and HTTP.',
      detail: 'Segment size comes from the link MTU and from the IP header taught in the fragmentation lesson. The next clause, DNS and HTTP, sits above these sockets, and its request-response timing is what the round trips here measure.',
      narration: 'This clause connects both ways. The segment size comes from the link maximum transmission unit and from the IP header, which the fragmentation lesson covers. And the next clause, DNS and HTTP, sits above these sockets, using the round trips measured here.',
      keyword: 'one idea, three layers',
      trap: 'Do not treat this clause as isolated arithmetic. Its numbers are reused by every later performance question.'
    }
  ]
};
