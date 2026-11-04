# Tcp Handshake And Teardown — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/tcp-handshake-and-teardown/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Two counters that must agree

*0:00 – 0:30 · objective: See a connection as two independent 32-bit counters, one per direction, and count the segments the opening and the closing cost.*

**0:00–0:07** — A connection is two counters, one for each direction.

> Caption: A TCP connection is two counters that must agree, one for each direction of data.

**0:07–0:15** — Opening costs three segments: one round trip.

> Caption: Opening the connection costs three segments, which is one round trip.

**0:15–0:22** — Closing costs four segments, then two hundred and forty seconds of waiting.

> Caption: Closing costs four segments, and the side that closes first then waits 240 seconds.

**0:22–0:30** — Each counter holds two to the thirty-two values, then wraps.

> Caption: Each counter is 32 bits: it runs to 4,294,967,295 and then wraps to zero.

## Scene 2. Six flags, and the two that cost a number

*0:30 – 1:00 · objective: Name the six control bits, and state which of them occupy sequence space: SYN and FIN yes, ACK no.*

**0:30–0:37** — Six flags: urgent, ack, push, reset, synchronise, finish.

> Caption: Six control bits do the work: URG, ACK, PSH, RST, SYN and FIN, one bit each.

**0:37–0:45** — SYN and FIN each eat one number. ACK eats none.

> Caption: SYN and FIN each occupy one sequence number; ACK occupies none.

**0:45–0:52** — So the answer to a SYN numbered a hundred is a hundred and one.

> Caption: That single rule is why an acknowledgment of a SYN is the SYN number plus one.

**0:52–1:00** — Two reserved bits later became congestion signals, so eight in all.

> Caption: Two more bits, CWR and ECE, were added later for congestion marking, making eight.

## Scene 3. Three messages, byte for byte

*1:00 – 1:30 · objective: Walk the three-way handshake with ISN 100 and ISN 300, and derive 101 and 301 rather than quoting them.*

**1:00–1:07** — A sends a SYN with number one hundred. No acknowledgment yet.

> Caption: A opens with a SYN carrying its initial number, 100, and no acknowledgment.

**1:07–1:15** — B answers with its own number, three hundred, and a hundred and one.

> Caption: B answers with SYN and ACK: its own number 300, and 101 for A's SYN.

**1:15–1:22** — A answers a hundred and one, acknowledging three hundred and one. Both are established.

> Caption: A replies with 101 and acknowledges 301; both sides are now ESTABLISHED.

**1:22–1:30** — Two plus-one steps, carried in three segments.

> Caption: Three segments, one round trip: 101 = 100 + 1 and 301 = 300 + 1.

## Scene 4. Why three messages and not two

*1:30 – 2:00 · objective: Show the one fact a two-message open leaves unconfirmed, and connect it to the stale duplicate SYN.*

**1:30–1:37** — Two messages leave one fact unconfirmed: that B's number was received.

> Caption: Two messages would leave one thing unconfirmed: that B's number was received.

**1:37–1:45** — An old SYN looks exactly like a new one, so the receiver has to ask.

> Caption: A stale SYN from an earlier connection looks exactly like a new one.

**1:45–1:52** — The third message proves A saw B's number. That is why B waits for it.

> Caption: The third message is the only proof that A saw B's number, so B needs it.

**1:52–2:00** — One round trip for the opener, one and a half for the listener.

> Caption: The cost is one round trip for the opener, and one and a half for the listener.

## Scene 5. The initial number is a clock, not a random draw

*2:00 – 2:30 · objective: Explain ISN = M + F(...), the 4-microsecond clock, its wrap time, and why zero is the one value that cannot be used.*

**2:00–2:07** — Not zero, not a random draw: a clock plus a hash.

> Caption: The initial number is neither zero nor a plain random draw: it is a clock plus a hash.

**2:07–2:15** — A tick every four microseconds, wrapping in about four point seven seven hours.

> Caption: The clock ticks about every 4 microseconds and wraps in about 4.77 hours.

**2:15–2:22** — One maximum segment lifetime is thirty million ticks, so the clock outlives it easily.

> Caption: One maximum segment lifetime, 120 seconds, spans 30 million ticks of that clock.

**2:22–2:30** — Zero would make every incarnation use the same numbers. That is the problem it solves.

> Caption: Zero would collide with an old connection's numbering, which is the whole problem.

## Scene 6. The options ride only on the opening segments

*2:30 – 3:00 · objective: Account for the 20 option bytes that make a SYN 40 bytes, and state the default MSS when no option arrives.*

**2:30–2:37** — Twenty bytes of options on a twenty-byte header makes forty.

> Caption: The opening segments carry 20 bytes of options; the fixed header is 20, so 40 in all.

**2:37–2:45** — Four, two, ten, one and three: twenty bytes exactly.

> Caption: MSS is 4 bytes, SACK-permitted 2, timestamps 10, a NOP and window scale 3.

**2:45–2:52** — Options belong to the opening. The rest of the connection assumes what was agreed.

> Caption: Options are legal on a SYN; the other segments carry none by default.

**2:52–3:00** — Silence means five hundred and thirty-six, or twelve twenty over IPv6.

> Caption: No MSS option means 536 bytes over IPv4 and 1220 over IPv6.

## Scene 7. Four messages, one FIN each way

*3:00 – 3:30 · objective: Close the connection after 1000 bytes of data, deriving 1101, 1102, 301 and 302, and name the state each side holds.*

**3:00–3:07** — A thousand bytes take the counter to eleven hundred and one, where the FIN sits.

> Caption: A sends 1000 bytes, then a FIN at 1101, which costs one number.

**3:07–3:15** — B acknowledges eleven hundred and two, and waits for its own application.

> Caption: B acknowledges 1102 and enters CLOSE-WAIT; A is in FIN-WAIT-2.

**3:15–3:22** — B sends its FIN at three hundred and one. A answers three hundred and two and waits.

> Caption: B's FIN at 301 is acknowledged with 302, and A enters TIME-WAIT.

**3:22–3:30** — Four segments, two of them numbered, and both halves closed separately.

> Caption: Four segments: FIN, ACK, FIN, ACK, with one sequence number for each FIN.

## Scene 8. TIME-WAIT: twice the maximum segment lifetime

*3:30 – 4:00 · objective: Compute 2 x MSL as 240 seconds, give the two purposes the standard names, and state the one legal way to reopen early.*

**3:30–3:37** — Twice one hundred and twenty is two hundred and forty seconds.

> Caption: TIME-WAIT lasts twice the maximum segment lifetime: 2 x 120 is 240 seconds.

**3:37–3:45** — If the last acknowledgment is lost, the resent FIN still gets an answer.

> Caption: Reason one: if the last ACK is lost, the peer resends its FIN and it is answered.

**3:45–3:52** — And old duplicates die out before the same four values are used again.

> Caption: Reason two: delayed duplicates from this connection die before the pair is reused.

**3:52–4:00** — Early reopening is allowed, but only with a bigger starting number.

> Caption: A host may reopen from TIME-WAIT only with a larger initial number.

## Scene 9. Simultaneous open, simultaneous close, half-close

*4:00 – 4:30 · objective: Draw the three shapes that break the client-server picture, and count the segments and TIME-WAIT sockets in each.*

**4:00–4:07** — Both send a SYN at once, so four segments are needed.

> Caption: Simultaneous open: both send SYN, both answer SYN and ACK, four segments.

**4:07–4:15** — Each side passes through syn-received, but by the active path.

> Caption: Both go CLOSED to SYN-SENT to SYN-RECEIVED to ESTABLISHED.

**4:15–4:22** — Both closed at once, so both wait: two sockets in time-wait.

> Caption: Simultaneous close leaves both sides in TIME-WAIT, so two sockets wait, not one.

**4:22–4:30** — A close is one direction only, so the other side may keep talking.

> Caption: Half-close: CLOSE-WAIT has no timer, so the other side may keep sending.

## Scene 10. The chain, and the six slips

*4:30 – 5:00 · objective: Assemble the whole procedure in order and name the six mistakes that cost marks.*

**4:30–4:37** — One: SYN and FIN cost a number each. ACK costs none.

> Caption: First the flags: SYN and FIN cost one number each, ACK costs none.

**4:37–4:45** — Two: the opening is two plus-one steps in three segments.

> Caption: Then the opening: 101 = 100 + 1 and 301 = 300 + 1, in three segments.

**4:45–4:52** — Three: the close, two more plus-one steps, then two hundred and forty seconds.

> Caption: Then the close: 1102 = 1101 + 1 and 302 = 301 + 1, then 240 seconds of waiting.

**4:52–5:00** — Six slips, each with its counterexample: numbered acks, free FINs, a zero start, options off the SYN, one-sided close, and no wait.

> Caption: Six slips: a numbered ACK, a FIN that costs nothing, a zero start, options off the SYN, one-sided close, and no wait.

Exam-trap caption mode adds: *The two that cost the most marks: treating an ACK as consuming a sequence number, and forgetting that only the active closer waits in TIME-WAIT.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
