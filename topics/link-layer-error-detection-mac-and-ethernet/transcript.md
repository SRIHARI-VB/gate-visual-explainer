# Link Layer Error Detection Mac And Ethernet — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/link-layer-error-detection-mac-and-ethernet/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Frames: how the receiver knows where a message ends

*0:00 – 0:30 · objective: See why a stream of bits needs boundaries, and read bit stuffing as the rule that keeps a flag pattern unique.*

**0:00–0:07** — The physical layer hands the link layer a stream of bits. Nothing in that stream says where a message begins or ends, so the very first job of the link layer is to draw boundaries.

> Caption: A receiver sees a stream of bits. Nothing in the stream says where one message stops.

Exam-trap caption mode adds: *A frame is not the same thing as a packet. The frame is the unit on one wire; the packet inside it may cross many wires.*

**0:07–0:15** — A flag pattern marks the ends of the frame, six ones between two zeros. If the data itself could contain that pattern, a receiver would mistake data for a boundary, so the sender must make it impossible.

> Caption: A flag pattern marks the ends. The sender must guarantee that pattern never appears inside the data.

Exam-trap caption mode adds: *The flag is a delimiter, not a checksum. It says where the frame is, not whether it is correct.*

**0:15–0:22** — So the sender stuffs. After every run of five ones it inserts a zero, and the receiver deletes that zero again. GATE 2014 Set 3 question 24 hands you the stuffed string and asks for the original.

> Caption: Bit stuffing: after five ones the sender inserts a zero, and the receiver removes it.

Exam-trap caption mode adds: *Stuffing happens after five ones, not six. Counting six and then removing a bit gives the wrong answer on this exact paper.*

**0:22–0:30** — Destuffing is the same rule read backwards: delete one zero after each run of five ones. Because the rule never depends on later bits, sender and receiver always agree.

> Caption: Destuffing is the same rule backwards: delete the zero after each run of five ones.

Exam-trap caption mode adds: *The delimiter is eight bits, but only the six ones matter for stuffing. Students who count the zeros stuff in the wrong place.*

## Scene 2. Parity, and what a second dimension buys you

*0:30 – 1:00 · objective: Separate detection from correction, and find the error pattern a two-dimensional parity grid cannot see.*

**0:30–0:37** — A single parity bit answers one question: is the number of ones even? Append a bit that makes it even, and any single flip makes it odd, so one flip is caught. Two flips keep the count even and pass.

> Caption: One parity bit answers one question: is the number of ones even?

Exam-trap caption mode adds: *Parity detects an odd number of errors. Two, four or any even number of flips are invisible to it.*

**0:37–0:45** — Now add a parity bit to every row and every column. A single flip breaks exactly one row check and one column check, and their crossing names the bit. That is correction, not just detection.

> Caption: Add a parity bit per row and per column and a single error is not just detected, it is located.

Exam-trap caption mode adds: *Correction needs more than detection. A code that detects one error cannot in general say which bit it was.*

**0:45–0:52** — Here is the blind spot. Flip four bits at the corners of a rectangle. Each affected row has two flips, so its parity is restored; each affected column too. The receiver sees a perfectly valid grid.

> Caption: Four errors at the corners of a rectangle leave every row and every column even.

Exam-trap caption mode adds: *The question "how many errors can two-dimensional parity detect" has no single number. It detects all patterns of three or fewer, and misses some of four.*

**0:52–1:00** — So the honest claim is a bound. Every pattern of one, two or three bits is caught. Some four-bit patterns escape, exactly the rectangles. Anything stronger needs a stronger code.

> Caption: So the honest statement: all one, two and three-bit errors, and some four-bit errors escape.

Exam-trap caption mode adds: *Writing "detects up to two errors" understates it, and "detects up to four" overstates it. Say three, and say which four-bit patterns fail.*

## Scene 3. The Internet checksum and its blind spot

*1:00 – 1:30 · objective: Compute a one's complement sum by hand, and see two errors that cancel and pass the check.*

**1:00–1:07** — The Internet checksum treats the data as sixteen-bit words, adds them in one's complement arithmetic, wrapping any carry back into the low bit, and then complements the total. The receiver repeats the addition including the checksum and should get all ones.

> Caption: The Internet checksum adds the data as 16-bit words in one's complement.

Exam-trap caption mode adds: *The carry is not discarded. Dropping it instead of wrapping it is the single most common arithmetic slip in this question type.*

**1:07–1:15** — Why use something this weak? Because it costs one pass through a plain adder. That is why the IP, TCP and UDP headers all carry it.

> Caption: It is cheap: one adder, no division. That is why IP, TCP and UDP all use it.

Exam-trap caption mode adds: *A checksum is not a CRC. They catch different error families, and a question that says "checksum" is not asking for polynomial division.*

**1:15–1:22** — Now the blind spot. Raise one word by one and lower another by one. The total is unchanged, the receiver still gets all ones, and the error sails through.

> Caption: Two errors that add to the same total cancel: one word up by one, another down by one.

Exam-trap caption mode adds: *This is not a rare accident on a real link; it is the reason the checksum is called weak. It catches bit errors, not adversarial or correlated ones.*

**1:22–1:30** — The summary is a trade. Checksum for speed, CRC for strength. Both only detect; repair is done by asking again, which is why ARQ sits right next to error detection in every textbook.

> Caption: So: checksum for speed, CRC for strength. Neither is a correction code.

Exam-trap caption mode adds: *Do not describe the checksum as correcting anything. It has no notion of where the error is.*

## Scene 4. CRC: division, not addition

*1:30 – 2:00 · objective: Divide modulo 2, append the remainder, and know exactly which error patterns the generator catches.*

**1:30–1:37** — A cyclic redundancy check treats the message as a polynomial with coefficients zero and one, and divides it by a fixed generator. In this arithmetic there are no carries: addition is exclusive or.

> Caption: A CRC treats the bits as a polynomial over GF(2) and divides by a generator.

Exam-trap caption mode adds: *Do not subtract with borrows. Every step is XOR, and a leading zero in the running remainder means "shift, do not XOR".*

**1:37–1:45** — The procedure: append as many zeros as the generator's degree, divide, and attach the remainder. GATE 2017 Set 1 question 32 uses generator 1011 on message 01011011 and the remainder comes out 101.

> Caption: Append r zeros, divide, and send the message with the r-bit remainder attached.

Exam-trap caption mode adds: *Appending four zeros for a generator of degree three shifts every partial remainder and changes the answer. The count is the degree.*

**1:45–1:52** — At the far end the receiver divides the whole received word, message plus check bits, by the same generator. A multiple gives remainder zero. Anything else is a detected error.

> Caption: At the receiver the whole codeword must divide exactly: remainder zero means no detected error.

Exam-trap caption mode adds: *Checking only the message part is meaningless. The division is over the entire received codeword.*

**1:52–2:00** — Two guarantees are worth memorising. Any burst of length at most r is caught, provided the generator has a constant term. And every odd number of bit errors is caught exactly when x plus one divides the generator.

> Caption: What is caught: every burst of length at most r, and every odd-weight error if x+1 divides the generator.

Exam-trap caption mode adds: *The odd-error guarantee is conditional. Generator 1011 has three ones, so x+1 does not divide it, and some odd-weight errors do pass.*

## Scene 5. Hamming distance: what a code can detect and correct

*2:00 – 2:30 · objective: Read d_min off a code, convert it to a detection and correction capability, and repair a single bit by syndrome.*

**2:00–2:07** — Hamming distance counts the positions in which two words differ. For a whole code, the number that matters is the smallest distance between any two valid codewords.

> Caption: Hamming distance is the number of positions in which two words differ.

Exam-trap caption mode adds: *It is the minimum over all pairs, not the average and not the distance between two convenient codewords.*

**2:07–2:15** — Two inequalities do all the work. Detecting s errors needs a minimum distance of at least s plus one. Correcting t errors needs at least twice t plus one, because the neighbourhoods around codewords must not overlap.

> Caption: To detect s errors you need d min at least s+1. To correct t errors you need d min at least 2t+1.

Exam-trap caption mode adds: *The common error is using d min for correction directly. Distance three corrects one error, not three.*

**2:15–2:22** — A Hamming code puts the check bits at positions one, two, four, eight, and so on, so that every bit position has a unique address in binary. Eight data bits need four check bits, giving a twelve-bit codeword.

> Caption: Hamming code places check bits at the powers of two, so each position has a unique binary address.

Exam-trap caption mode adds: *The inequality counts the no-error case as well. Dropping the plus one gives one check bit too few for many values of m.*

**2:22–2:30** — Recompute every check group. Each failure contributes its own position number to a syndrome. If the syndrome is zero nothing is wrong; if it is k, bit k flipped, and flipping it back repairs the word.

> Caption: The failed checks, read as a binary number, are the position of the bad bit.

Exam-trap caption mode adds: *The syndrome corrects only single-bit errors. Two flipped bits give a syndrome that points confidently at a third, innocent bit.*

## Scene 6. ALOHA: the cost of not listening

*2:30 – 3:00 · objective: See the vulnerable period double when nobody senses the channel, and read 18.4 and 36.8 percent off a simulation.*

**2:30–2:37** — One channel, many stations, nobody in charge. Medium access control is the set of rules for sharing it, and random access means each station decides for itself when to send.

> Caption: One shared channel, many stations, no coordinator: somebody has to lose.

Exam-trap caption mode adds: *MAC here means medium access control, not a hardware address. GATE uses the same three letters for both.*

**2:37–2:45** — Pure ALOHA says send whenever you like. A frame survives only if no other frame begins within one frame time before it or after it, so the vulnerable window is two frame times wide.

> Caption: Pure ALOHA: transmit at will. A frame is safe only if no other frame starts within one frame time of it.

Exam-trap caption mode adds: *The window is two frame times, not one. The overlap can start just before your frame and still destroy it.*

**2:45–2:52** — Slotted ALOHA forces every frame to start at a slot boundary, which halves the window to one frame time and doubles the achievable throughput. The price is synchronisation and up to one slot of delay.

> Caption: Slotted ALOHA halves the window, because a frame may only start at a slot boundary.

Exam-trap caption mode adds: *Slots do not remove collisions. Two stations that pick the same slot still collide completely.*

**2:52–3:00** — The ceilings are exact. Pure ALOHA peaks at one over two e, about eighteen point four percent, when the offered load is one half. Slotted peaks at one over e, about thirty-six point eight percent, when the load is one.

> Caption: Maximum throughput: 18.4 percent for pure, 36.8 percent for slotted, both at the sweet spot load.

Exam-trap caption mode adds: *Those percentages are maxima, not the throughput at every load. At light load both protocols do much better than the peak figure suggests.*

## Scene 7. Carrier sense, collision detection, and the 2-tau rule

*3:00 – 3:30 · objective: Shrink the vulnerable window to one round trip, and see why detection forces a minimum frame size.*

**3:00–3:07** — Carrier sense means listening before talking. If the channel is busy, wait. That alone removes collisions with frames already in progress, which is where ALOHA loses most of its capacity.

> Caption: Carrier sense: listen before you talk. Most collisions come from not having heard yet.

Exam-trap caption mode adds: *Sensing cannot see a transmission that has not arrived yet. That delay is what still allows collisions.*

**3:07–3:15** — Because everyone listens, only a station that started before your first bit reached it can hurt you. That window is one propagation delay wide, half of the ALOHA window, so carrier sense roughly doubles the ceiling again.

> Caption: The window is one propagation delay, not two: only frames started within tau of yours hurt you.

Exam-trap caption mode adds: *GATE CSE 2018 Q55 is exactly this window: a five-unit sensing period against a propagation delay of d over ten.*

**3:15–3:22** — Collision detection adds a requirement. You only learn about a collision when the corrupted signal returns, which is one round trip after you began. So your frame must still be going out at that moment.

> Caption: Collision detection needs the sender still transmitting when the echo of the collision returns.

Exam-trap caption mode adds: *This is why the rule has a two in it. The condition is about a round trip, and the propagation delay in the formula is one way.*

**3:22–3:30** — That gives the formula to memorise. The frame must be at least twice the one-way propagation delay multiplied by the rate. GATE 2015 Set 3 question 6 turns it around and solves for the signal speed.

> Caption: So the minimum frame size is twice the one-way propagation delay times the rate: L at least 2 tau R.

Exam-trap caption mode adds: *Doubling the cable length doubles the minimum frame. Doubling the rate does too, which is why gigabit Ethernet had to extend the frame, not shorten it.*

## Scene 8. Ethernet: the frame, the 64 bytes, and the backoff

*3:30 – 4:00 · objective: Add up the fields of an 802.3 frame and see the doubling window that resolves repeated collisions.*

**3:30–3:37** — The Ethernet frame carries a destination address, a source address, a type or length field, the payload, and a four-byte CRC. Eighteen bytes of overhead in total, with a payload between forty-six and fifteen hundred bytes.

> Caption: An 802.3 frame: destination, source, type or length, payload, and a four-byte CRC.

Exam-trap caption mode adds: *The preamble and the start-of-frame delimiter are transmitted but are not part of the frame length that the 64-byte minimum refers to.*

**3:37–3:45** — The minimum frame is sixty-four bytes, which at ten megabits is 512 bit times, or 51.2 microseconds. A 2500-metre segment has a round trip of about 25 microseconds, and the remaining margin pays for repeaters and transceivers.

> Caption: Sixty-four bytes minimum, because 512 bit times is the slot time that brackets a round trip.

Exam-trap caption mode adds: *A short payload is padded to 46 bytes, not dropped. A frame shorter than 64 bytes is a runt and is discarded by the receiver.*

**3:45–3:52** — After a collision the station picks a random number of slot times to wait, from zero up to two to the k minus one after the k-th collision. The window doubles each time, so a repeat collision becomes much less likely.

> Caption: After a collision the station waits a random number of slots, doubling the window each time.

Exam-trap caption mode adds: *This is randomised waiting, not a schedule. Two stations can still pick the same slot, which is why collisions do not vanish, only become rare.*

**3:52–4:00** — One more distinction. A hub repeats every bit to every port, so the whole hub is one collision domain. A switch forwards per port, so each port is its own domain and can run full duplex with no collisions at all.

> Caption: A switch gives each port its own collision domain; a hub does not.

Exam-trap caption mode adds: *A switch does not merge collision domains; it splits them. A broadcast domain is a different question, and a switch does not split that.*

## Scene 9. The arithmetic GATE asks for, on real papers

*4:00 – 4:30 · objective: Solve the minimum frame size, signal speed and sensing window items from their own numbers.*

**4:00–4:07** — Start by writing the four quantities: the one-way propagation delay, the rate, the frame size and the signal speed. Almost every lost mark in this clause is a unit error or a missing factor of two.

> Caption: Write down tau, R, L and v before touching any formula.

Exam-trap caption mode adds: *A rate in Mbps is a power of ten. A distance in kilometres must become metres before it meets metres per second.*

**4:07–4:15** — The formula is one line, and GATE has asked it in both directions. Given the frame size, the rate and the distance, solve for the speed. That is question 6 of GATE 2015 Set 3, and the answer is 20000 kilometres per second.

> Caption: Minimum frame size: L equals 2 tau R. Given any three, the fourth follows.

Exam-trap caption mode adds: *The distance in the question is one way. The formula's factor of two is the round trip, so do not double the distance twice.*

**4:15–4:22** — The second quantity is the ratio a, the propagation delay divided by the transmission time of one frame. A stop-and-wait exchange is busy for one frame time and idle for a round trip, so its utilisation is one over one plus two a.

> Caption: The ratio a equals tau over transmission time. Small a means efficient.

Exam-trap caption mode adds: *a is a ratio of two times, so it is dimensionless. Writing it in seconds is a signal that something has gone wrong.*

**4:22–4:30** — One more number worth having. At the minimum frame only forty-six of sixty-four bytes are payload, so twenty-eight percent of the wire is overhead. At the maximum frame it is about one percent.

> Caption: Payload efficiency: 46 of 64 bytes at the minimum, 1500 of 1518 at the maximum.

Exam-trap caption mode adds: *The overhead includes the four-byte CRC. Leaving it out gives 14 of 64 instead of 18 of 64.*

## Scene 10. The procedure, and the traps that cost marks

*4:30 – 5:00 · objective: Fix a five-step routine that covers every question shape in this clause.*

**4:30–4:37** — Step one is to name the family. Detecting means parity, checksum or CRC. Correcting means Hamming distance and a code. Sharing means ALOHA, carrier sense or Ethernet. Each family has its own short list of formulas.

> Caption: Step one: is the question about detecting, correcting, or sharing?

Exam-trap caption mode adds: *A question can mix families. "What is the minimum frame size so that collisions are detected" is a sharing question answered with a detection requirement.*

**4:37–4:45** — Step two, for a detection question: ask what is guaranteed. For a CRC the degree bounds the burst length and the constant term is what makes bursts detectable. For a code, the minimum distance gives both capabilities through the two inequalities.

> Caption: Step two: for detection, ask what the generator or the code guarantees, not what it hopes.

Exam-trap caption mode adds: *A generator of degree r does not guarantee catching every burst of length r plus one. It guarantees up to r.*

**4:45–4:52** — Step three, for a sharing question: compute the propagation delay first, then decide whether the protocol detects collisions. If it does, the round trip enters and the answer carries a factor of two. If it only senses, one delay enters.

> Caption: Step three: for a sharing question, find tau, then decide whether detection is required.

Exam-trap caption mode adds: *That single decision separates the 2015 answer from the 2018 answer. Both use the same distance and speed; only the protocol differs.*

**4:52–5:00** — Step four: convert back to the unit the question asks for, then sanity-check the magnitude against the dominant term. A correct method with the wrong unit still scores nothing.

> Caption: Step four: convert back to the unit asked for, then check the magnitude.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
