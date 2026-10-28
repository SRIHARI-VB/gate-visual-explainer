# TCP Flow Control, Congestion Control and the Socket API — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/tcp-flow-congestion-control-and-sockets/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Two windows, one sender

*0:00 – 0:30 · objective: Separate the two limits on a TCP sender — the advertised receiver window and the congestion window — and state that the smaller one binds.*

**0:00–0:07** — A TCP sender is limited by two numbers. The receiver advertises a window in every acknowledgement, saying how much more it can hold. The sender also keeps a congestion window of its own, which nobody advertises, and which stands for what the network is believed to carry. Flow control protects the receiver. Congestion control protects the network.

> Caption: Two numbers limit a TCP sender: what the receiver can hold, and what the network can carry.

Exam-trap caption mode adds: *The two limits answer different questions. Mixing them up is the commonest conceptual error in this clause.*

**0:07–0:15** — The sender may have in flight at most the smaller of the two. Bytes in flight means bytes sent and not yet acknowledged. If the receiver window is the smaller one, the connection is flow limited. If the congestion window is the smaller one, it is congestion limited. One rule, two possible binding constraints.

> Caption: The sender may have at most the smaller of the two in flight.

Exam-trap caption mode adds: *A question that says "the sender is limited by the window" is ambiguous until you know which window binds.*

**0:15–0:22** — The receiver number is visible on the wire: a sixteen-bit window field in the header of every segment. Sixteen bits means the largest window it can name is sixty-five thousand five hundred and thirty-five bytes. On a fast path with a long round trip that is not enough, so the window scaling option multiplies it by a power of two.

> Caption: The receiver number is visible: a 16-bit window field in every segment header.

Exam-trap caption mode adds: *The advertised window is counted in bytes. A question that reads it as a number of segments has already gone wrong.*

**0:22–0:30** — The congestion window is never carried in a field. The sender grows it while acknowledgements keep arriving and cuts it when it sees a loss, either as a timeout or as duplicate acknowledgements. That is why congestion control is a control loop rather than a header field: the network never tells you its capacity, you estimate it and correct.

> Caption: The congestion window is inferred, not signalled: loss is the only feedback.

Exam-trap caption mode adds: *Do not look for a congestion window field in the TCP header. There is none; only the receiver window has a field.*

## Scene 2. Flow control: the receiver sets a budget

*0:30 – 1:00 · objective: Compute a usable window from the advertised window and the bytes in flight, and name the three diseases of a window that is too small.*

**0:30–0:37** — The sender computes a usable window: the advertised window minus the bytes already in flight. If the receiver advertises six segments and two are still unacknowledged, four more may be sent. The arithmetic is in bytes, and the window slides forward as acknowledgements arrive.

> Caption: Usable window = advertised window − bytes already in flight.

Exam-trap caption mode adds: *The window is a count of bytes measured from the acknowledgement number, not a list of sequence numbers.*

**0:37–0:45** — When the receiver buffer fills it advertises zero. The sender stops sending data but keeps sending a small probe, because the update that reopens the window can itself be lost. Without that probe the connection would wait forever.

> Caption: A zero window is not the end: the sender probes, and the receiver sends a window update.

Exam-trap caption mode adds: *A zero window is a pause, not a close. Only a FIN or a reset ends the connection.*

**0:45–0:52** — Two small-number diseases have the same cure. On the receiver side, do not advertise a tiny window: wait until a useful amount of space is free. On the sender side, the Nagle algorithm holds a small segment back while earlier data is unacknowledged. Both avoid filling the link with tiny segments and one-byte windows.

> Caption: Silly window syndrome: tiny windows and tiny segments both waste the link.

Exam-trap caption mode adds: *Delayed acknowledgement is the third piece: acknowledge at least every second full segment, and within about half a second.*

**0:52–1:00** — Here is the test that separates the two ideas. On a path with no loss at all, the rate is capped by the advertised window divided by the round trip. Sixty-five thousand five hundred and thirty-five bytes over a hundred milliseconds is about five point two megabits per second, no matter how fast the link is.

> Caption: Test: with no loss at all, the advertised window alone caps the rate.

Exam-trap caption mode adds: *If the answer changes when the receiver buffer grows, the limit was flow control, not congestion control.*

## Scene 3. Slow start: doubling, and where it stops

*1:00 – 1:30 · objective: Trace the congestion window through slow start, and tell growth per acknowledgement apart from growth per round trip.*

**1:00–1:07** — Slow start begins with one segment and doubles the congestion window every round trip: one, two, four, eight, sixteen. The name misleads, because this is the fastest growth in the whole algorithm. It is called slow start because it starts small, not because it grows slowly.

> Caption: Slow start: one segment, then two, then four. It doubles every round trip.

Exam-trap caption mode adds: *Nothing about slow start is slow. Exponential growth is the whole point of the phase.*

**1:07–1:15** — Per acknowledgement the window grows by one segment. Per round trip it therefore doubles. GATE twenty eighteen asked which of these statements is true, and only the doubling per round trip is. The other three describe something else: two segments per acknowledgement, doubling per acknowledgement, or one segment per round trip.

> Caption: Per acknowledgement it is plus one segment; per round trip it is a doubling.

Exam-trap caption mode adds: *One segment per round trip is congestion avoidance, not slow start. That sentence is the trap in the 2018 question.*

**1:15–1:22** — Doubling does not continue forever. A second variable, the slow start threshold, marks the switch. While the window is below the threshold it doubles. At or above the threshold the sender switches to congestion avoidance and adds about one segment per round trip.

> Caption: Doubling stops at the threshold. At or above it, growth becomes linear.

Exam-trap caption mode adds: *A doubling that would land above the threshold stops exactly at the threshold, never past it.*

**1:22–1:30** — Why start with doubling at all? Because the sender knows nothing about the path. Starting small and doubling finds a working rate in a logarithmic number of round trips, and if the guess is far too high the damage is small. The growth is exponential because the uncertainty is large.

> Caption: Why exponential first? Because the sender knows nothing about the path.

Exam-trap caption mode adds: *RFC 5681 allows an initial window of up to four segments. GATE questions state a start of one segment; use the number the question gives.*

## Scene 4. Additive increase, multiplicative decrease

*1:30 – 2:00 · objective: Apply the two loss signals — a timeout and three duplicate acknowledgements — and see why they cut the window differently.*

**1:30–1:37** — Above the threshold the rule changes. Each acknowledgement adds a small fraction of a segment, arranged so that a whole window of acknowledgements adds exactly one segment. The window then climbs by one segment per round trip. This is the additive increase of additive increase, multiplicative decrease.

> Caption: Congestion avoidance: about one segment more per round trip. Additive increase.

Exam-trap caption mode adds: *Linear growth is much slower than doubling. Do not carry the doubling rule past the threshold.*

**1:37–1:45** — A timeout is the strong signal. The sender sets the slow start threshold to half of what was in flight, and restarts the congestion window at one segment. Growth becomes exponential again up to the new threshold, and linear after it. That is the multiplicative decrease.

> Caption: A timeout means severe loss: halve the threshold, restart the window at one segment.

Exam-trap caption mode adds: *The threshold is halved from the window at the loss, not from the receiver window.*

**1:45–1:52** — Three duplicate acknowledgements are a gentler signal: later segments are arriving, so the path still works and only one segment is missing. The sender retransmits immediately instead of waiting for the timer, and in the Reno variant it drops the window only to the new threshold rather than to one segment.

> Caption: Three duplicate ACKs are a weaker signal: retransmit at once, and cut less.

Exam-trap caption mode adds: *Tahoe and Reno differ here. Tahoe restarts at one segment; Reno restarts at the threshold. Read which one the question names.*

**1:52–2:00** — Put the two halves together and the window traces a sawtooth: climb by one segment per round trip, then halve, then climb again. It oscillates between half its peak and the peak. That shape is what the next scenes turn into numbers.

> Caption: The sawtooth: climb by one, halve, climb again.

Exam-trap caption mode adds: *The average of the sawtooth is three quarters of the peak, a fact the throughput scene turns into a formula.*

## Scene 5. GATE 2014 Set 1: back to 32 KB after a timeout

*2:00 – 2:30 · objective: Run one complete window trace from a timeout to a target window, and convert round trips into milliseconds.*

**2:00–2:07** — GATE twenty fourteen, set one, question twenty-seven. The congestion window is thirty-two kilobytes when a timeout occurs. The round trip is a hundred milliseconds and the segment size is two kilobytes. How long until the window is back to thirty-two kilobytes? Convert to segments first: sixteen segments, a hundred milliseconds per round trip.

> Caption: GATE 2014 Set 1 Q27: window 32 KB at a timeout, round trip 100 ms, segment 2 KB.

Exam-trap caption mode adds: *Mixing kilobytes and segments inside one trace is the first way this question goes wrong.*

**2:07–2:15** — The timeout halves the threshold: sixteen segments becomes eight. The window restarts at one and doubles while it stays below eight: one, two, four, eight. Three doublings, four round trips, take it to the threshold.

> Caption: The timeout halves the threshold to 8 segments and restarts the window at 1.

Exam-trap caption mode adds: *Halve the window at the loss, not the target window you are trying to reach.*

**2:15–2:22** — From the threshold the growth is linear. Eight segments to sixteen is eight more round trips, one segment each. Counting from the restart, the window reaches sixteen at round trip eleven.

> Caption: Then one segment per round trip: 9, 10, 11, 12, 13, 14, 15, 16.

Exam-trap caption mode adds: *The endpoint counts. Sixteen is reached at the end of the eleventh round trip, not the tenth.*

**2:22–2:30** — Eleven round trips at a hundred milliseconds is eleven hundred milliseconds. The published key allows a range, because solutions differ on whether the round trip in which the timeout occurs is counted. Counting from the restart gives eleven hundred, and that is what this page computes from the stated rule.

> Caption: Eleven round trips at 100 ms is 1100 ms. Count the trace, do not trust a formula.

Exam-trap caption mode adds: *A range in the key means the convention is arguable. Write the convention you used beside the number.*

## Scene 6. GATE 2020: the receiver window that never binds

*2:30 – 3:00 · objective: Walk a ten-round-trip trace with a stated threshold, and see why the advertised window can be irrelevant.*

**2:30–2:37** — GATE twenty twenty, question fifty-five. Round trip six milliseconds, receiver window fifty kilobytes, slow start threshold thirty-two kilobytes, segment two kilobytes. Sixty milliseconds is ten round trips. No timeouts, no errors. Find the congestion window after the tenth.

> Caption: GATE 2020 Q55: round trip 6 ms, receiver window 50 KB, threshold 32 KB, segment 2 KB.

Exam-trap caption mode adds: *Divide the elapsed time by the round trip before touching the window at all.*

**2:37–2:45** — Doubling carries the window from two kilobytes to thirty-two in four round trips: two, four, eight, sixteen, thirty-two. The threshold is reached exactly, and the receiver window of fifty kilobytes has not interfered at all.

> Caption: Doubling to the threshold: 2, 4, 8, 16, 32 KB after four round trips.

Exam-trap caption mode adds: *When the threshold is a power of two, the doubling lands on it exactly and no rounding question arises.*

**2:45–2:52** — The remaining six round trips add one segment each, and a segment is two kilobytes: thirty-four, thirty-six, thirty-eight, forty, forty-two, forty-four. Forty-four kilobytes is the answer, and fifty kilobytes was never reached, so the receiver window never bound.

> Caption: Then two kilobytes per round trip for the remaining six: up to 44 KB.

Exam-trap caption mode adds: *Check the receiver window at the end. If the answer had exceeded 50 KB, the trace would have been capped there.*

**2:52–3:00** — One warning. A common wrong method halves the receiver window to invent a threshold. That gives twenty-five kilobytes and a different answer. Here the threshold is stated in the question. A threshold is derived only after a loss, never from the receiver buffer.

> Caption: Change one number and the answer changes: the threshold is given, not derived.

Exam-trap caption mode adds: *If a question omits the threshold, look for the last loss event. Never default to half the receiver window.*

## Scene 7. GATE 2024 Set 2: the signal decides the answer

*3:00 – 3:30 · objective: Compute the same loss under a timeout and under three duplicate acknowledgements, and show that the two answers differ from the first round trip.*

**3:00–3:07** — GATE twenty twenty-four, set two, question fifty-four. The window is twelve segments when a timeout occurs, and the next two round trips are fully acknowledged. Twelve halved is six, so the threshold is six and the window restarts at one. One round trip gives two, the next gives four. The answer is four segments.

> Caption: GATE 2024 Set 2 Q54: window 12 MSS at a timeout, two clean round trips after.

Exam-trap caption mode adds: *Count the round trips after the loss. The round trip in which the loss happened is not one of them.*

**3:07–3:15** — There is a cap to watch. A third clean round trip would take the window from four to six, not to eight, because six is the threshold. From there the growth is linear. Forgetting that cap is the commonest arithmetic slip in this family of questions.

> Caption: Watch the cap: doubling stops at the threshold, so 4 would become 6, not 8.

Exam-trap caption mode adds: *Doubling past the threshold is wrong even when the numbers are small.*

**3:15–3:22** — Now change one word. If the loss had been detected by three duplicate acknowledgements instead of a timeout, the threshold is still six, but the window is set to six rather than one. The two clean round trips then give seven and eight. The kind of loss decides the answer, so read it first.

> Caption: Had the loss been three duplicate ACKs, the window would be 6, then 7, then 8.

Exam-trap caption mode adds: *A question that names no signal is ambiguous under Reno. Real questions name the signal or the variant.*

**3:22–3:30** — Same numbers, two different answers: four segments after a timeout, eight after three duplicate acknowledgements. The traces separate immediately. That is why the loss type is part of the question and not a detail to be guessed.

> Caption: Same numbers, two answers: 4 MSS after a timeout, 8 MSS after duplicate ACKs.

Exam-trap caption mode adds: *Write the variant at the top of your rough work: timeout with Tahoe, or duplicate acknowledgements with Reno.*

## Scene 8. Throughput, and the window the path needs

*3:30 – 4:00 · objective: Derive average throughput as three quarters of the peak window over the round trip, and compute the bandwidth-delay product.*

**3:30–3:37** — Because the sawtooth runs between half the peak and the peak, its average is three quarters of the peak. Divide by the round trip and you have the average rate. That is the whole throughput formula for additive increase, multiplicative decrease.

> Caption: Average throughput of AIMD = three quarters of the peak window, over the round trip.

Exam-trap caption mode adds: *Use the average window, not the peak. Using the peak overstates the throughput by a third.*

**3:37–3:45** — Take a peak of a hundred segments, a segment of fourteen hundred and sixty bytes, and a forty millisecond round trip. Three quarters of the peak is seventy-five segments, which is a hundred and nine thousand five hundred bytes. Per forty milliseconds that is two million seven hundred and thirty-seven thousand five hundred bytes per second, about twenty-one point nine megabits per second.

> Caption: Worked: peak 100 segments of 1460 bytes, round trip 40 ms, gives 21.9 Mbps.

Exam-trap caption mode adds: *Keep the units: bytes per second is not bits per second. Multiply by eight only at the end.*

**3:45–3:52** — A window that is too small leaves the pipe empty. The data the path can hold is the bandwidth times the round trip: a hundred megabits per second over a hundred milliseconds is one and a quarter megabytes. That is the window needed to keep the link busy.

> Caption: A window that is too small leaves the pipe empty: fill it with bandwidth × round trip.

Exam-trap caption mode adds: *The product is in bits until you divide by eight. Convert before comparing with a window measured in bytes.*

**3:52–4:00** — Sixteen bits cannot name one and a quarter megabytes, so TCP scales the window field by a power of two agreed when the connection opens. A factor of thirty-two lifts the ceiling to about two megabytes, which covers this path. The formula is unchanged; only the unit got bigger.

> Caption: So the 16-bit window is scaled by an option, and the arithmetic is unchanged.

Exam-trap caption mode adds: *Scaling is negotiated in the handshake. It cannot be switched on in the middle of a connection.*

## Scene 9. The socket API and the handshake under it

*4:00 – 4:30 · objective: Order the socket calls on each side, map them onto the three-way handshake, and size a segment from the link MTU.*

**4:00–4:07** — The socket interface is a short list of calls. The server creates a socket, binds it to a port, calls listen to make it passive, and calls accept to take a connection. The client creates a socket and calls connect. After that both sides read and write on connected sockets, and both call close at the end.

> Caption: The socket calls in order: the server binds, listens, accepts; the client connects.

Exam-trap caption mode adds: *GATE 2015 Set 2 asked for the server order and offered accept first as a distractor.*

**4:07–4:15** — The handshake maps onto those calls. Connect sends the first packet, the SYN. The server replies with SYN and acknowledgement, and the client kernel sends the final acknowledgement before accept returns. So accept hands back a socket whose connection is already established. The connection is identified by four values: both addresses and both ports.

> Caption: The handshake maps onto the calls: SYN, SYN-ACK, then ACK.

Exam-trap caption mode adds: *The server answers the handshake in its kernel. accept does not send the SYN-ACK.*

**4:15–4:22** — Segment size is not free. Twenty bytes of IP header and twenty of TCP header come out of the link maximum transmission unit, so an Ethernet frame of fifteen hundred bytes carries fourteen hundred and sixty bytes of data. A ten thousand byte transfer is seven segments: six full ones and a last one of twelve hundred and forty bytes.

> Caption: Segment size follows from the link: MSS = MTU − 40 for IPv4 TCP.

Exam-trap caption mode adds: *With IPv6 the overhead is 60 bytes, so the same MTU gives a 1440-byte segment.*

**4:22–4:30** — Closing is not symmetric in time. The side that closes first waits in a state called TIME_WAIT for twice the maximum segment lifetime. That wait lets a lost final acknowledgement be retransmitted, and it lets old duplicates from the same four-tuple die before the port is reused. It is why a busy server shows sockets in TIME_WAIT.

> Caption: Closing is not symmetric: the active closer waits in TIME_WAIT for two segment lifetimes.

Exam-trap caption mode adds: *Only the active closer enters TIME_WAIT. The passive closer goes straight to CLOSED.*

## Scene 10. The procedure, and the four slips

*4:30 – 5:00 · objective: Reduce the clause to a four-step routine and four habits that prevent the standard arithmetic errors.*

**4:30–4:37** — For any window question, four steps. Convert every quantity into segments. Note which loss signal fired, and apply it. Walk the trace round trip by round trip, doubling below the threshold and adding one at or above it. And stop at exactly the round trip the question names.

> Caption: For a window question: convert to segments, then walk round trip by round trip.

Exam-trap caption mode adds: *Walking one round trip too far is the quiet error. Mark the round trip you are asked about before you start.*

**4:37–4:45** — Four slips account for most lost marks here. Doubling past the threshold. Inventing a threshold by halving the receiver window. Confusing growth per acknowledgement with growth per round trip. And treating flow control and congestion control as one limit instead of two.

> Caption: Four slips account for most lost marks in this clause.

Exam-trap caption mode adds: *Each slip is usually offered as an answer option, which is why the options look familiar.*

**4:45–4:52** — Two questions separate the hard cases. Which of the two windows is smaller over the range asked about? That is the binding constraint. And which signal fired at the loss? That decides what the window becomes immediately afterwards.

> Caption: Two questions separate the hard cases: which window binds, and which signal fired.

Exam-trap caption mode adds: *Both questions are answered before any arithmetic. Answer them first and the trace writes itself.*

**4:52–5:00** — This clause connects both ways. The segment size comes from the link maximum transmission unit and from the IP header, which the fragmentation lesson covers. And the next clause, DNS and HTTP, sits above these sockets, using the round trips measured here.

> Caption: This clause connects back to IP and forward to DNS and HTTP.

Exam-trap caption mode adds: *Do not treat this clause as isolated arithmetic. Its numbers are reused by every later performance question.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
