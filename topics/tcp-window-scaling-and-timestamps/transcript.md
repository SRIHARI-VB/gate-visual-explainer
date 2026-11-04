# Tcp Window Scaling And Timestamps — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/tcp-window-scaling-and-timestamps/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. The wall at 65,535 bytes

*0:00 – 0:30 · objective: State the size of the TCP window field, convert it into a throughput ceiling for three round-trip times, and see that the ceiling is set by the field width and not by the link.*

**0:00–0:07** — Every TCP header carries a window field. It is sixteen bits wide, so the largest number it can hold is sixty-five thousand five hundred and thirty-five. That is the whole receive window, in bytes, with no extension.

> Caption: The TCP window field is sixteen bits, so the largest value it can carry is 65,535 bytes.

**0:07–0:15** — A window is the number of bytes that may be in flight at once. The path delivers one window per round trip, so the most the connection can carry is the window divided by the round trip. Multiply by eight for bits.

> Caption: A window is bytes in flight, so window divided by round-trip time is the throughput ceiling.

**0:15–0:22** — Here is the arithmetic on a hundred-millisecond path. Sixty-five thousand five hundred and thirty-five bytes per hundred milliseconds is five million two hundred and forty-two thousand eight hundred bits per second. Five point two megabits, no matter how fast the fibre is.

> Caption: On a 100 ms path the ceiling is 5,242,800 bits per second, about 5.24 Mbit/s, whatever the link can do.

**0:22–0:30** — So the ceiling belongs to the header, not to the network. A faster link does not move it. A longer path makes it worse. That is the wall the extension exists to break, and it is broken by spending three bytes in the handshake.

> Caption: The ceiling is a property of the header, not of the network: a faster link or a longer path makes it worse.

Exam-trap caption mode adds: *A question that gives you a 1 Gbit/s link and a 100 ms round trip and asks for the throughput of an unscaled connection wants 5.24 Mbit/s, not 1 Gbit/s.*

## Scene 2. The window is a pipe, and the pipe has a length

*0:30 – 1:00 · objective: Define the bandwidth-delay product, show that a window smaller than it leaves the link idle, and compute the window three different links need.*

**0:30–0:37** — Picture the path as a pipe. Its rate is the bandwidth, its length is the delay, and the water inside it is the bandwidth-delay product: rate times delay. A window smaller than that water cannot fill the pipe, and part of the link stays idle.

> Caption: Bandwidth times delay is the amount of data the path can hold: the bandwidth-delay product.

**0:37–0:45** — One gigabit per second across a hundred milliseconds holds a hundred million bits, which is twelve and a half million bytes. An unscaled window is sixty-five thousand bytes, so it fills about one hundred and ninetieth of the pipe. The rest is idle.

> Caption: At 1 Gbit/s over 100 ms the pipe holds 12,500,000 bytes, and 65,535 bytes is about one two-hundredth of it.

**0:45–0:52** — Three examples. A hundred megabits over twenty milliseconds needs a quarter of a million bytes. A gigabit over a hundred milliseconds needs twelve and a half million. Ten gigabits over fifty milliseconds needs sixty-two and a half million. All three are past the wall.

> Caption: Three links, three required windows: 250,000 bytes, 12,500,000 bytes and 62,500,000 bytes.

**0:52–1:00** — The field cannot grow, and the header layout cannot move. So the extension keeps the sixteen-bit field and agrees, during the handshake, on a multiplier. That agreement is one byte long and it is worth a factor of sixteen thousand.

> Caption: So the question the extension answers is: how do you name a window larger than 65,535 using a sixteen-bit field?

## Scene 3. One shift count, thirty bits of window

*1:00 – 1:30 · objective: Read the scaling rule SEG.WND left-shifted by the shift count, walk the ladder from 0 to 14, and reach the 1 GiB top of the range.*

**1:00–1:07** — The option is three bytes: a kind, a length, and one number called the shift count. The true window is the field value shifted left by that many bits. Shift left by three and the field means eight times as much.

> Caption: The window scale option carries one number, a shift count, and the true window is the field shifted left by it.

**1:07–1:15** — Here is the ladder. Shift zero keeps sixty-five thousand bytes. Shift eight gives sixteen million seven hundred and seventy-six thousand nine hundred and sixty, which covers the gigabit pipe. Shift fourteen gives one thousand and seventy-three million bytes, about a gibibyte.

> Caption: Shift 0 keeps 65,535 bytes; shift 8 reaches 16,776,960; shift 14 reaches 1,073,725,440 bytes, about 1 GiB.

**1:15–1:22** — One detail worth carrying. The top window is not exactly a gibibyte. It is one thousand and seventy-three million, seven hundred and twenty-five thousand, four hundred and forty bytes, which is sixteen thousand three hundred and eighty-four short. The missing piece is the one in two to the sixteenth minus one.

> Caption: The top of the range is 2^30 minus 2^14, which is 16,384 bytes short of exactly one gibibyte.

**1:22–1:30** — The ceiling moves with it. On the same hundred-millisecond path, shift fourteen gives eighty-five thousand million bits per second, about eighty-five point nine gigabits. The factor is sixteen thousand three hundred and eighty-four, exactly two to the fourteenth.

> Caption: At shift 14 and a 100 ms path the ceiling becomes 85,898,035,200 bits per second, about 85.9 Gbit/s.

## Scene 4. Why the limit is fourteen and not sixteen

*1:30 – 2:00 · objective: Derive the bound from the sequence-number test: twice the maximum window must stay below 2^31, so the window must stay below 2^30, and only shift counts up to 14 satisfy that.*

**1:30–1:37** — Why stop at fourteen? Because of a test TCP already has. It decides whether a segment is new or old by asking whether its sequence number is within two to the thirty-first of the left edge of the window. That is how a thirty-two-bit space is read as a line.

> Caption: TCP decides old from new by asking whether a sequence number is within 2^31 of the left edge of the window.

**1:37–1:45** — The two windows can drift apart by a whole window, so the condition is on twice the maximum window: it must stay below two to the thirty-first. Halve it and the maximum window must stay below two to the thirtieth.

> Caption: The sender and receiver windows can be out of phase by one window, so twice the maximum window must stay below 2^31.

**1:45–1:52** — At shift fourteen, twice the window is two thousand one hundred and forty-seven million, four hundred and fifty thousand, eight hundred and eighty. That clears the limit by thirty-two thousand seven hundred and sixty-eight bytes. At shift fifteen it doubles past the limit, and the test breaks.

> Caption: Shift 14 gives 2,147,450,880 for twice the window, which clears 2^31 by 32,768 bytes; shift 15 overshoots it.

**1:52–2:00** — So fourteen is the largest shift that keeps the test unambiguous, and the document fixes it there. If a peer sends more, you log the error and use fourteen, because a sender is always free to use less than it is offered.

> Caption: So 14 is the largest shift that works, and a peer that sends more must be read as 14.

## Scene 5. The offer in the SYN, and the field that is not scaled

*2:00 – 2:30 · objective: Show the three-byte option in the handshake, the rule that both sides must send it, and the exception that the window field of a SYN segment is never scaled.*

**2:00–2:07** — The option is three bytes, kind three, length three. It goes in the handshake and nowhere else. And it is an offer, not a promise: unless both sides send it, neither direction is scaled. Once the connection is open, the number is fixed.

> Caption: The option is sent in the handshake only, and both sides must send it for scaling to be used in either direction.

**2:07–2:15** — Here is the exception that catches people. The window field in a SYN segment is never scaled. So the sixty-five thousand five hundred and thirty-five in the handshake means sixty-five thousand five hundred and thirty-five. Multiply it by shift seven and you are wrong by a factor of one hundred and twenty-eight.

> Caption: The window field of a SYN segment is never scaled, so the 65,535 in the handshake is 65,535 and not 8,388,480.

Exam-trap caption mode adds: *Reading the SYN or SYN,ACK window field with the negotiated shift is the single most common window-scaling mistake in an exam answer.*

**2:15–2:22** — Two hosts. The first can buffer eight million bytes, so it needs shift seven, because shift six reaches only four million. The second can buffer one million, so it needs shift four, because shift three reaches only half a million. Each states its own shift in its own handshake segment.

> Caption: Two hosts with buffers of 8,000,000 and 1,000,000 bytes choose shifts 7 and 4.

**2:22–2:30** — Now watch the fields. Eight million right-shifted by seven is sixty-two thousand five hundred. One million right-shifted by four is also sixty-two thousand five hundred. The same number in both directions, and it means eight times more in one of them.

> Caption: Both then advertise the same field value, 62,500, and it means 8,000,000 bytes from one side and 1,000,000 from the other.

## Scene 6. Two counters, one for each direction

*2:30 – 3:00 · objective: Separate the shift count you send from the shift count you receive, and compute the eight-fold error of applying your own to the peer's window field.*

**2:30–2:37** — Every connection keeps two shift counters, and they are not the same number. One is yours, applied to the window you send. The other is your peer's, applied to the window you receive. Mixing them up is the second mistake.

> Caption: Each connection keeps two shift counters: the one you send your own window with, and the one you read the peer's with.

**2:37–2:45** — Outgoing, you right-shift your true window by your own count before putting it in the header. Incoming, you left-shift the field by your peer's count before you use it. The right shift throws bits away; the left shift costs nothing.

> Caption: The receiver right-shifts what it sends, and the sender left-shifts what it receives, by the peer's count.

**2:45–2:52** — The first host receives sixty-two thousand five hundred. The peer said shift four, so the window is one million. Use your own shift seven instead and you read eight million. The error is two to the difference of the counts, so here exactly eight times.

> Caption: The first host reads 62,500 with its own shift 7 and gets 8,000,000, eight times the true 1,000,000.

Exam-trap caption mode adds: *An error factor is two to the difference of the two shift counts, not two to either count on its own.*

**2:52–3:00** — One more boundary. The scale applies to the window field only. The congestion window is a local thirty-two-bit number and is never scaled, so scaling does not quantise it. If a question asks which window is multiplied by two to the shift, the answer is the advertised one.

> Caption: The scale applies to the window field only: the congestion window is kept as a local number and is never scaled.

## Scene 7. Choosing your own shift count

*3:00 – 3:30 · objective: Compute the smallest shift that covers a receive buffer, catch the 1 MiB case where the obvious answer is sixteen bytes short, and see the four-gigabyte buffer clamped at 1 GiB.*

**3:00–3:07** — So how is your own count chosen? From your receive buffer, before the connection opens. Take the smallest count whose maximum window is at least the buffer. Larger than necessary wastes resolution; smaller than necessary cannot describe the buffer at all.

> Caption: The shift is chosen from the receive buffer before the connection opens: the smallest count whose maximum window covers it.

**3:07–3:15** — Take a buffer of one mebibyte, one million forty-eight thousand five hundred and seventy-six bytes. Divide by sixty-five thousand five hundred and thirty-five and you get sixteen point zero zero zero two, so the obvious answer is shift four. But shift four reaches one million forty-eight thousand five hundred and sixty. Sixteen bytes short.

> Caption: A one-mebibyte buffer looks like shift 4, since 2^16 is 65,536, but shift 4 reaches only 1,048,560 bytes.

Exam-trap caption mode adds: *Dividing by 65,536 instead of 65,535 gives exactly 16 and the wrong shift; the shortfall appears only in the last bytes.*

**3:15–3:22** — So the answer is five, and shift five reaches two million and change, which covers it. State the rule as a comparison of maximum windows, not as a division, because the division rounds the wrong way exactly when the buffer is a round number.

> Caption: So the answer is 5, and the general rule is the smallest count with 65,535 times 2^s at least the buffer.

**3:22–3:30** — And the ceiling bites from above. A four-gigabyte buffer would want shift seventeen. The count is capped at fourteen, so the largest window that can be advertised is one thousand and seventy-three million bytes, about a gibibyte. The rest of the buffer cannot be used by this connection.

> Caption: A four-gigabyte buffer would need shift 17, which is clamped to 14, so only 1,073,725,440 bytes can be advertised.

## Scene 8. The ten-byte timestamps option

*3:30 – 4:00 · objective: Read the timestamps option, count what it costs in the header, and name its two jobs: measuring a round trip and rejecting a wrapped duplicate.*

**3:30–3:37** — The second extension is ten bytes. Kind eight, length ten, then a four-byte timestamp value and a four-byte echo of a timestamp you received. Every segment can carry it, in both directions.

> Caption: The timestamps option is ten bytes: a kind, a length, a four-byte value and a four-byte echo.

**3:37–3:45** — The cost, in numbers. The base header is twenty bytes. Add the timestamps option and it is thirty. Add window scaling as well, padded to four bytes, and it is thirty-four. With fourteen hundred and sixty bytes of payload, efficiency drops from ninety-eight point six five to ninety-seven point seven two per cent.

> Caption: It takes the header from 20 to 30 bytes, and with window scaling too, to 34; payload efficiency falls from 98.65 to 97.72 per cent.

**3:45–3:52** — Its first job is measurement. The value comes from a clock ticking between once a millisecond and once a second. Subtract an echoed value from the current clock and you have a round trip. Because every segment can echo, you can sample almost every acknowledgement.

> Caption: The difference between the current clock and an echoed value is a round-trip sample, taken from almost every segment.

**3:52–4:00** — You keep one saved value, not one per segment. An incoming timestamp replaces it only if it is at least as large and its sequence number is not beyond the last acknowledgement you sent. Every segment you send then echoes whatever is saved. One slot, one rule, ten bytes.

> Caption: The echo is one saved value per connection, updated only when the incoming value is at least it and the segment is within the last acknowledged byte.

## Scene 9. PAWS: rejecting a segment from the past

*4:00 – 4:30 · objective: Apply the modular comparison to three incoming timestamps, see which are rejected and which survive a wraparound, and read the two numbers that bound the timestamp clock.*

**4:00–4:07** — The second job is protection. The sequence space is four thousand million bytes. At a gigabit per second a connection uses all of it in about thirty-four seconds. A segment delayed longer than that carries a sequence number that looks current, and the ordinary window test cannot tell it from new data.

> Caption: A connection at a gigabit per second uses up the whole sequence space in about 34 seconds, so old and new can collide.

**4:07–4:15** — So the timestamp is used as a serial number, not as a time. An arrival is older than the saved value when the saved value minus the arrival, modulo two to the thirty-second, lies between one and two to the thirty-first. Exactly the test TCP already uses on sequence numbers. The two clocks never have to agree.

> Caption: The test is modular: an arrival is older when the saved value minus it, modulo 2^32, lies between 1 and 2^31.

**4:15–4:22** — Two arrivals. The saved value is five million. A segment carrying four million nine hundred and ninety-nine thousand is a thousand behind, and the modular difference is one thousand, which is in the backward half, so it is old: acknowledge it and drop it. One hundred ahead, and the difference is four thousand two hundred and ninety-four million, past the halfway mark, so it is new and it becomes the saved value.

> Caption: A value 1,000 behind the saved 5,000,000 gives a difference of 1,000 and is rejected; 100 ahead gives 4,294,967,196 and is accepted.

Exam-trap caption mode adds: *The rejected segment still draws an acknowledgement. Dropping it silently is not what the rule says, because the acknowledgement is what detects a half-open connection.*

**4:22–4:30** — And the wrap is handled by the same test. With the saved value near the top of the space, an incoming hundred gives a difference of four thousand two hundred and ninety-three million, past the halfway mark, so it is accepted. The clock is bounded on both sides: a millisecond per tick wraps the sign bit in twenty-four point eight days, a second per tick in twenty-four thousand eight hundred. So a value saved before twenty-four days of silence is thrown away.

> Caption: After the clock wraps the test still works, and a value saved before a wrap is discarded after 24 days of silence.

## Scene 10. Why the timestamp makes Karn's rule optional

*4:30 – 5:00 · objective: Show that the echoed timestamp identifies which copy an acknowledgement answered, compute the sample that timestamps recover, state the rule that blocks an inflated sample, and collect the five slips.*

**4:30–4:37** — Last scene, and the reason the option is worth its ten bytes. A segment goes out at zero, is retransmitted at four hundred, and is acknowledged at five hundred. That acknowledgement does not say which copy it answers. The sample is either five hundred or one hundred, and without help the estimator must refuse both and just double the timer.

> Caption: Without timestamps a retransmission makes the next acknowledgement untimeable, which is why the sample is refused.

**4:37–4:45** — Now the echo tells you which. The retransmission carried fourteen hundred. If the acknowledgement echoes fourteen hundred, the sample is a hundred milliseconds and it measures the retransmission. If it echoes one thousand, the sample is five hundred and it measures the original, which was late rather than lost. Either way you have a measurement, and it is the right one.

> Caption: With timestamps the echo names the copy: an echo of 1400 measures 100 ms, an echo of 1000 measures 500 ms.

**4:45–4:52** — One guard remains, and it is about echoes in the wrong direction. In a one-way flow the other host can carry an echo inside its own data. If it pauses sixty milliseconds on a forty-millisecond path, the difference reads a hundred, two and a half times the truth. The rule refuses that sample, because the segment acknowledges nothing new.

> Caption: One guard remains: an echo may update the estimate only when the segment advances the left edge of the send window.

Exam-trap caption mode adds: *A timestamp echo is a candidate sample, not a sample: the acknowledgement must advance the left edge of the send window before the value is used.*

**4:52–5:00** — And the five slips that cost the mark. Scaling the window in the handshake. Reading the peer's field with your own shift. Choosing your shift by dividing instead of comparing. Comparing timestamps as signed numbers. And taking a sample from a segment that acknowledges nothing. Every one of them is computed and checked on this page.

> Caption: The five slips: a scaled SYN, the wrong shift, a divided buffer, a signed comparison, and a sample that acknowledges nothing.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
