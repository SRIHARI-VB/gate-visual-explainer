# Tcp Options Mss And Window Retraction — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/tcp-options-mss-and-window-retraction/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. The option space is forty bytes

*0:00 – 0:30 · objective: Read the data offset field as a count of 32-bit words, see that the TCP header runs from 20 to 60 bytes, and state the option budget as 40 bytes shared by every option.*

**0:00–0:07** — Every TCP segment starts with twenty bytes of fixed fields. One of them is a small field called the data offset, and its whole job is to say how long the header is.

> Caption: The TCP header is twenty bytes of fixed fields, and a data offset field says how long it is.

**0:07–0:15** — Four bits can hold values five to fifteen. Counted in thirty-two-bit words, that is twenty bytes at the bottom and sixty at the top.

> Caption: Four bits hold 5 to 15 words, so the header is 20 to 60 bytes long.

**0:15–0:22** — Sixty minus twenty is forty. That is the whole option area, and every option a connection uses has to fit inside it.

> Caption: Sixty minus twenty is forty: every option in the connection shares one budget of 40 bytes.

**0:22–0:30** — Four options want those bytes: the maximum segment size, the window scale, SACK-permitted, and timestamps. Each one has a price in bytes, and the prices add up.

> Caption: MSS, window scale, SACK-permitted and timestamps all want bytes from that same forty.

Exam-trap caption mode adds: *A question that says options may be up to 40 bytes means the whole option area, not 40 bytes for each option.*

## Scene 2. Four handshake options, nineteen bytes

*0:30 – 1:00 · objective: Add the lengths of MSS, window scale, SACK-permitted and timestamps, round the total up to a multiple of four, and read the header size that follows.*

**0:30–0:37** — Here are the prices. The maximum segment size option is kind two and costs four bytes. The window scale option is kind three and costs three bytes.

> Caption: MSS is kind 2 and four bytes; window scale is kind 3 and three bytes.

**0:37–0:45** — SACK-permitted is kind four and costs two bytes, because it carries no data at all. Timestamps is kind eight and costs ten: two for the header and eight for the two four-byte values.

> Caption: SACK-permitted is kind 4 and two bytes; timestamps is kind 8 and ten bytes.

**0:45–0:52** — Add them: four, three, two and ten. Nineteen bytes of option data. That is the raw price of the list.

> Caption: Four plus three plus two plus ten is nineteen bytes of option data.

**0:52–1:00** — The header has to end on a four-byte boundary, so nineteen becomes twenty and the header is forty bytes. A stack that pads each option separately spends twenty-four and gets a forty-four-byte header. Both are legal; the difference is four bytes of payload.

> Caption: The header must end on a four-byte boundary, so nineteen becomes twenty and the header is forty bytes.

Exam-trap caption mode adds: *Sum the option lengths and round the total up to a multiple of four. Rounding each option up and then adding gives a different, larger answer.*

## Scene 3. MSS = MTU minus the fixed headers

*1:00 – 1:30 · objective: Define the MSS option as a count of data octets only, compute it for four MTUs, and separate the IPv4 subtraction of 40 from the IPv6 subtraction of 60.*

**1:00–1:07** — The maximum segment size is a promise about receiving. It says: this is the most data I will take in one segment. Each side makes its own promise, and the two can differ.

> Caption: The MSS option says how much TCP data its sender can receive in one segment.

**1:07–1:15** — The number counts data only. The headers are not in it. That is why an MSS of fourteen hundred and sixty fits a fifteen-hundred-byte link: twenty for IP, twenty for TCP, the rest for data.

> Caption: It counts data only: not the TCP header, not the IP header.

**1:15–1:22** — So the arithmetic is: take the MTU, subtract twenty for the IPv4 header, subtract twenty for the TCP header. MTU minus forty.

> Caption: So MSS = MTU minus 20 for the IPv4 header minus 20 for the TCP header, which is MTU minus 40.

**1:22–1:30** — Four numbers to carry. Five seventy-six gives five thirty-six, which is also what you assume when no option arrives. Fifteen hundred gives fourteen sixty. Nine thousand gives eight nine sixty. And IPv6, whose base header is forty bytes, gives fourteen forty.

> Caption: 576 gives 536, 1500 gives 1460, 9000 gives 8960, and IPv6's forty-byte header gives 1440.

Exam-trap caption mode adds: *IPv6 subtracts 60, not 40: 40 bytes of base header plus the 20-byte TCP header.*

## Scene 4. Options do not lower the MSS; they lower the data

*1:30 – 2:00 · objective: State the RFC 6691 rule, show that 1460 advertised becomes 1440 sent with 20 bytes of options, and see the 20-byte overshoot that would force fragmentation.*

**1:30–1:37** — The rule is short. When you compute the MSS, subtract only the fixed headers. Do not subtract anything for options.

> Caption: The rule: the MSS is the effective MTU minus only the fixed IP and TCP headers.

**1:37–1:45** — So a host that plans to send timestamps still advertises fourteen sixty. The promise is about what it can receive, not about the options it will use.

> Caption: Options are not subtracted from the advertised MSS, so 1460 stays 1460.

**1:45–1:52** — But when the segment is actually built, the options take their bytes out of the data. With twenty bytes of options the header is forty, so the data is fourteen forty on a fifteen-hundred-byte link.

> Caption: But the sender must cut the data by the options it actually sends: 1460 becomes 1440 with 20 bytes of options.

**1:52–2:00** — Send the full fourteen sixty and add the options, and the datagram is fifteen twenty: twenty bytes too big. IP would have to fragment it, which is the thing the MSS is for. So the data shrinks instead.

> Caption: Sending the full 1460 with those options makes a 1520-byte datagram, 20 bytes past a 1500-byte MTU.

Exam-trap caption mode adds: *The advertised MSS stays 1460 while the segment carrying options carries 1440 bytes of data. Both numbers are correct in their own place.*

## Scene 5. Spending the whole budget

*2:00 – 2:30 · objective: Add an 18-byte option to the 19 bytes already spent, reach exactly the 40-byte budget, and see that a further 4-byte option no longer fits.*

**2:00–2:07** — Now treat the budget as a ledger. Nineteen bytes are committed to the four handshake options. Twenty-one are free.

> Caption: The four handshake options spend 19 of the 40 bytes, so 21 remain.

**2:07–2:15** — Add the MD5 signature option, which costs eighteen. Thirty-seven. Round it up and the option area is the full forty, and the header is sixty bytes, the largest it can be.

> Caption: A TCP MD5 option is 18 bytes: 19 plus 18 is 37, which pads to 40.

**2:15–2:22** — So the header is sixty bytes and the data is fourteen twenty on a fifteen-hundred-byte link. Efficiency has fallen from ninety-seven per cent to under ninety-five.

> Caption: That leaves a 60-byte header and 1420 bytes of data on a 1500-byte MTU.

**2:22–2:30** — One more four-byte option and the total is forty-one. One byte over. So the options are not independent: adding one can force another out.

> Caption: One more four-byte option would make 41, so something has to be dropped.

Exam-trap caption mode adds: *The budget is shared, not per-option: adding an option can require removing another, and a question may ask which combination fits.*

## Scene 6. The window is counted in steps of 2^s

*2:30 – 3:00 · objective: Show that a scaled window field can only place the right edge on ACK plus a whole number of 2^s steps, and that the receiver's buffer end need not be such a point.*

**2:30–2:37** — Now the second half. When the window is scaled, the field does not count bytes. It counts steps, and each step is two to the s bytes.

> Caption: With a shift count s, the window field counts steps of 2^s bytes.

**2:37–2:45** — The right edge of the window is the acknowledgement plus the window. So the right edge can only land on the acknowledgement plus a whole number of steps.

> Caption: So the right edge of the window can only land on ACK plus a whole number of 2^s steps.

**2:45–2:52** — Take a shift count of seven. One step is a hundred and twenty-eight bytes. From an acknowledgement of a thousand, the field can name three edges near here: eleven twenty-eight, twelve fifty-six, and thirteen eighty-four.

> Caption: With s = 7 the step is 128 bytes: from ACK 1000 the edges are 1128, 1256 and 1384.

**2:52–3:00** — But the receiver's buffer ends at thirteen hundred, which is not one of those points. The nearest field values are two, which is forty-four bytes short, and three, which is eighty-four too far.

> Caption: The receiver's buffer ends at 1300, which is not one of those points.

Exam-trap caption mode adds: *The window field names a length, but the length is expressible only in whole steps of 2^s, so a buffer end that is not a step boundary cannot be named.*

## Scene 7. The retraction: 1301 is past the buffer, 1173 is 127 short

*3:00 – 3:30 · objective: Walk the four rows of the RFC 7323 appendix example and show why the only two fields available are one byte too large and 127 bytes too small.*

**3:00–3:07** — Here is the appendix example, with a step of a hundred and twenty-eight. The buffer ends at thirteen hundred. The receiver advertises two, which the sender reads as twelve fifty-six. Forty-four bytes short, and safe.

> Caption: The true window is 1300 bytes from ACK 1000; the field can only say 2, which means 1256.

**3:07–3:15** — The sender writes forty bytes and the acknowledgement moves to ten forty. Two again means two hundred and fifty-six, so the edge is twelve ninety-six. Four bytes short now.

> Caption: After 40 more bytes, ACK 1040 and window 2 give 1296, four bytes short.

**3:15–3:22** — Then five more bytes. The acknowledgement is ten forty-five. A field of two would put the edge at thirteen oh one: one byte past the buffer.

> Caption: Then 5 more bytes: ACK 1045. A field of 2 gives 1301, one byte past the buffer.

**3:22–3:30** — The only other choice is one, which means a hundred and twenty-eight bytes, and puts the edge at eleven seventy-three. A hundred and twenty-seven bytes short. The window has shrunk.

> Caption: A field of 1 gives 1173, which is 127 bytes short. The advertised window has shrunk.

Exam-trap caption mode adds: *A shrinking window is not an error to reject: the rules require both ends to handle it, and a question may ask what the sender may still send.*

## Scene 8. Three rules that make the shrink safe

*3:30 – 4:00 · objective: State the receiver's honour rule, the sender's first-retransmission allowance, the rule for later retransmissions, and the tracking a scaled receiver should keep.*

**3:30–3:37** — The rules start on the receiving side. If a segment would have been inside the window for any acknowledgement you have already sent, you must still accept it.

> Caption: Receiver rule: honour any segment that would have been in window for any ACK you sent.

**3:37–3:45** — On the sending side: the first retransmission may ignore the window, provided it is outside by less than one step, and provided the original was in window when it went out.

> Caption: Sender rule: the first retransmission may ignore the window if it is out by less than 2^s.

**3:45–3:52** — After that first one, every retransmission must sit inside the newest window. The allowance is one segment wide, not a general licence.

> Caption: Later retransmissions must lie inside the latest advertised window.

**3:52–4:00** — And the receiver should keep the largest edge it has ever advertised, because the latest acknowledgement may name a smaller one than the data it has already accepted.

> Caption: The receiver should also track the largest right edge it has ever advertised.

Exam-trap caption mode adds: *The window a sender must obey is the latest one, but a first retransmission just outside it is allowed, and the receiver must still honour the older promise.*

## Scene 9. The cost is bounded by 2^s minus one

*4:00 – 4:30 · objective: Bound the retraction at 2^s minus one bytes, read the 127-byte and 16,383-byte cases, and see why large steps make large shrinks.*

**4:00–4:07** — How bad can it get? The worst case is one step minus one byte, because the true edge can sit just below the next edge the field can name. At seven that is a hundred and twenty-seven bytes.

> Caption: The worst retraction is 2^s minus one bytes: 127 at a shift count of 7.

**4:07–4:15** — At the largest legal shift count, fourteen, the step is sixteen thousand three hundred and eighty-four, so the bound is sixteen thousand three hundred and eighty-three bytes.

> Caption: At a shift count of 14 the step is 16,384 bytes, so the worst retraction is 16,383 bytes.

**4:15–4:22** — Sixteen thousand bytes is more than eleven full segments. So a large step makes a large shrink, and that is why the rules tolerate it instead of forbidding it.

> Caption: That is more than eleven 1460-byte segments, so a large step makes a large shrink.

**4:22–4:30** — Real stacks keep it small: they advertise whole segments, rounded up to the next step, and they refuse to send tiny window updates. That makes windows advance more often than they shrink.

> Caption: Stacks reduce it by advertising whole segments and by suppressing small window updates.

Exam-trap caption mode adds: *The bound is 2^s minus one, not 2^s: a step of 128 can lose at most 127 bytes, and a step of 1 loses none.*

## Scene 10. Consolidation: the ledger, the arithmetic and the bound

*4:30 – 5:00 · objective: Collect the budget rule, the MSS rule, the data rule and the retraction bound, and name the five slips that cost a mark.*

**4:30–4:37** — Four things to carry away. First, the budget: forty bytes, and the sum of the option lengths is rounded up to a multiple of four.

> Caption: Budget: forty bytes, the sum of the option lengths rounded up to a multiple of four.

**4:37–4:45** — Second, the MSS: the MTU minus the fixed headers, data only. Fourteen sixty on Ethernet, fourteen forty over IPv6, five thirty-six at the old minimum and when no option arrives.

> Caption: MSS: the MTU minus the fixed headers, counting data only: 1460 on Ethernet, 1440 over IPv6.

**4:45–4:52** — Third, options do not lower the MSS. They lower the data in the segment that carries them. Fourteen sixty stays the promise; fourteen forty is what the segment holds.

> Caption: Options do not lower the MSS; they lower the data actually sent.

**4:52–5:00** — Fourth, a scaled window can shrink by one step minus one byte, and the rules say to handle it. The five slips are counting headers inside the MSS, lowering the MSS for options, assuming one shared MSS, reading forty bytes as a per-option limit, and treating a shrink as an error.

> Caption: Scaling can retract a window by up to 2^s minus one bytes, and the rules say to tolerate it.

Exam-trap caption mode adds: *Five slips: headers counted inside the MSS, an MSS lowered for options, one shared MSS for both directions, a 40-byte per-option budget, and a retraction treated as an error.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
