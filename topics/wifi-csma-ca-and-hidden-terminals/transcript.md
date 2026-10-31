# Wifi Csma Ca And Hidden Terminals — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/wifi-csma-ca-and-hidden-terminals/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. One channel, three stations, and no one can hear their own collision

*0:00 – 0:30 · objective: See that a Wi-Fi collision happens at the receiver, not at the sender, and that this single fact forces the whole design of 802.11 medium access.*

**0:00–0:07** — One radio channel, three stations. Only one of them may transmit at a time.

> Caption: One radio channel, three stations: A, the access point, and C. Only one of them may transmit at a time.

**0:07–0:15** — A and C both start sending, and both frames arrive at the access point at the same moment.

> Caption: A and C both start sending, and both frames arrive at the access point at the same moment.

**0:15–0:22** — The collision happens at the access point. Neither A nor C can observe it, because each is busy transmitting.

> Caption: The collision happens at the access point. Neither A nor C can observe it, because each is busy transmitting.

Exam-trap caption mode adds: *Assuming a station can tell that its frame collided. It cannot. It only learns that no acknowledgement came back.*

**0:22–0:30** — A and C are both in range of the access point but out of range of each other. That geometry is called the hidden terminal.

> Caption: A and C are both in range of the access point but out of range of each other. That geometry is called the hidden terminal.

## Scene 2. Why radio cannot use Ethernet collision detection

*0:30 – 1:00 · objective: Compare CSMA/CD with CSMA/CA on the one property that separates them: a radio cannot listen while it transmits, and the damage is done somewhere it cannot hear.*

**0:30–0:37** — Ethernet works because every station hears every other station, and hears itself at a comparable strength.

> Caption: Ethernet works because every station hears every other station, and hears itself at a comparable strength.

**0:37–0:45** — Collision detection: send and listen at once, stop the instant the two disagree, and jam the line so the others stop too.

> Caption: Collision detection: send and listen at once, stop the instant the two disagree, and jam the line so the others stop too.

**0:45–0:52** — On radio, the station's own signal is far stronger than anyone else's. The receiver is deaf while it transmits.

> Caption: On radio the station's own signal at its own antenna is orders of magnitude stronger than anyone else's. The receiver is deaf while it transmits.

**0:52–1:00** — So 802.11 replaces detection with avoidance plus acknowledgement: send the whole frame, then wait for an ACK.

> Caption: So 802.11 replaces detection with avoidance plus acknowledgement: send the whole frame, then wait for an ACK.

Exam-trap caption mode adds: *Writing that 802.11 detects collisions and aborts. It does not detect; it infers from a missing ACK, after the full frame has already been spent.*

## Scene 3. Two kinds of carrier sense: the air, and the duration field

*1:00 – 1:30 · objective: Distinguish physical carrier sense from the virtual carrier sense carried by the NAV, and see that the hidden terminal defeats the first but not the second.*

**1:00–1:07** — Physical carrier sense: listen to the air and decide whether energy on the channel looks like a frame preamble.

> Caption: Physical carrier sense: listen to the air and decide whether energy on the channel looks like a frame preamble.

**1:07–1:15** — A and C are 90 metres apart with a 60-metre range, so neither hears the other. Physical sense says the channel is free to both.

> Caption: A and C are 90 metres apart with a 60-metre range, so neither hears the other. Physical sense says the channel is free to both.

**1:15–1:22** — Virtual carrier sense: every frame header carries a duration, and every station keeps a countdown called the NAV.

> Caption: Virtual carrier sense: every frame header carries a duration, and every station keeps a countdown called the NAV.

**1:22–1:30** — For a 1500-byte frame the reservation is 1141.5 microseconds: SIFS, the data, SIFS again, then the ACK.

> Caption: For a 1500-byte frame the reservation is 1141.5 microseconds: SIFS, the data, SIFS again, then the ACK.

## Scene 4. The inter-frame spaces are a priority ladder

*1:30 – 2:00 · objective: Read SIFS, PIFS and DIFS as numbers that create priority out of waiting, and derive DIFS from the slot time.*

**1:30–1:37** — Before transmitting, a station must see the medium idle for an inter-frame space. There are three, of different lengths.

> Caption: Before transmitting, a station must see the medium idle for an inter-frame space. There are three, of different lengths.

**1:37–1:45** — On 802.11b: SIFS is 10 microseconds, PIFS is 30, DIFS is 50. The shortest wins.

> Caption: On 802.11b: SIFS is 10 microseconds, PIFS is 30, DIFS is 50. The shortest wins.

**1:45–1:52** — DIFS is not a free parameter: DIFS equals SIFS plus two slot times, so 10 plus 40 gives 50.

> Caption: DIFS is not a free parameter: DIFS equals SIFS plus two slot times, so 10 plus 40 gives 50.

**1:52–2:00** — Because SIFS is shortest, the ACK always starts before any waiting station may contend. The reply has priority.

> Caption: Because SIFS is shortest, the ACK always starts before any waiting station may contend. The reply has priority.

## Scene 5. One frame, end to end: the airtime budget

*2:00 – 2:30 · objective: Build the airtime of one 802.11b transmission from its parts, and check the result against a published throughput table.*

**2:00–2:07** — A full exchange, in order: DIFS, a backoff countdown, the frame, a SIFS, and the ACK.

> Caption: A full exchange, in order: DIFS, a backoff countdown, the frame, a SIFS, and the ACK.

**2:07–2:15** — Add the parts for a 256-byte frame at 11 megabits per second: 50 plus 320 plus 192 plus 206.5 plus 10 plus 192 plus 10.2 microseconds.

> Caption: Add the parts for a 256-byte frame at 11 megabits per second: 50 plus 320 plus 192 plus 206.5 plus 10 plus 192 plus 10.2 microseconds.

**2:15–2:22** — That is 980.7 microseconds for 2048 bits of payload, which is 2.088 megabits per second of goodput: 19 percent of an 11 megabit radio.

> Caption: That is 980.7 microseconds for 2048 bits of payload, which is 2.088 megabits per second of goodput: 19 percent of an 11 megabit radio.

**2:22–2:30** — The published 802.11b table gives 2,088,246 bits per second for exactly this frame. This page computes the same number.

> Caption: The published 802.11b table gives 2,088,246 bits per second for exactly this frame. This page computes the same number.

Exam-trap caption mode adds: *Quoting the raw 11 Mbps as the throughput of a Wi-Fi link. The goodput for a 256-byte frame is 19 percent of it, and the payload size, not the rate, sets that percentage.*

## Scene 6. Random backoff: the smallest number wins

*2:30 – 3:00 · objective: Compute the probability that the first transmission collides for k stations, and see why the familiar 1 over CW plus 1 is only true for two stations.*

**2:30–2:37** — A station that finds the medium idle for a DIFS does not transmit at once. It draws a random whole number and counts that many slots.

> Caption: A station that finds the medium idle for a DIFS does not transmit at once. It draws a random whole number and counts that many slots.

**2:37–2:45** — The station with the smallest number transmits first. A collision happens only when two stations draw the same smallest number.

> Caption: The station with the smallest number transmits first. A collision happens only when two stations draw the same smallest number.

**2:45–2:52** — For two stations the collision probability is exactly 1 over CW plus 1, which is 3.13 percent at CW equal to 31.

> Caption: For two stations the collision probability is exactly 1 over CW plus 1, which is 3.13 percent at CW equal to 31.

**2:52–3:00** — With eight stations it is 12.04 percent at CW 31 and 23.18 percent at CW 15. The familiar formula is not the general one.

> Caption: With eight stations it is 12.04 percent at CW 31 and 23.18 percent at CW 15. The familiar formula is not the general one.

Exam-trap caption mode adds: *Using 1/(CW+1) for k stations, or computing P(all distinct). Both are wrong beyond two stations; only the smallest-value event is a collision.*

## Scene 7. Binary exponential backoff and its ceiling

*3:00 – 3:30 · objective: Follow the contention window from 31 to 1023, convert it into waiting time, and see what the cap protects against.*

**3:00–3:07** — After a failed attempt the window becomes twice the old one plus one: 31, then 63, 127, 255, 511, and 1023.

> Caption: After a failed attempt the window becomes twice the old one plus one: 31, then 63, 127, 255, 511, and 1023.

**3:07–3:15** — The mean wait is half the window, so it runs from 310 microseconds at the first rung to 10,230 at the last.

> Caption: The mean wait is half the window, so it runs from 310 microseconds at the first rung to 10,230 at the last.

**3:15–3:22** — The ceiling matters: without it the window would double forever and a busy station could wait arbitrarily long.

> Caption: The ceiling matters: without it the window would double forever and a busy station could wait arbitrarily long.

**3:22–3:30** — One limitation is structural: backoff cannot tell a collision from a frame lost to noise, because both look like a missing ACK.

> Caption: One limitation is structural: backoff cannot tell a collision from a frame lost to noise, because both look like a missing ACK.

## Scene 8. The hidden terminal and the RTS/CTS repair

*3:30 – 4:00 · objective: Show the hidden terminal as a geometry, then show the two-frame reservation that repairs it, and price that repair.*

**3:30–3:37** — Here is the hidden terminal drawn as a geometry: A to the access point 45 metres, C to the access point 45, A to C 90.

> Caption: Here is the hidden terminal drawn as a geometry: A to the access point 45 metres, C to the access point 45, A to C 90.

**3:37–3:45** — Both carrier-sense the channel, both find it idle, both transmit, and both frames are destroyed at the access point.

> Caption: Both carrier-sense the channel, both find it idle, both transmit, and both frames are destroyed at the access point.

Exam-trap caption mode adds: *Calling the hidden terminal a station that is "far away". Both stations are close to the access point; what is missing is the link between them.*

**3:45–3:52** — The repair: a short RTS, a short CTS from the receiver, and the CTS makes every station in its range fall silent.

> Caption: The repair: a short RTS, a short CTS from the receiver, and the CTS makes every station in its range fall silent.

**3:52–4:00** — The repair is not free: RTS 206.6 plus SIFS 10 plus CTS 202.2 plus SIFS 10 is 428.7 microseconds of overhead.

> Caption: The repair is not free: RTS 206.6 plus SIFS 10 plus CTS 202.2 plus SIFS 10 is 428.7 microseconds of overhead.

## Scene 9. The exposed terminal: the cost that is not a collision

*4:00 – 4:30 · objective: Separate a correctness failure from a throughput failure, and see why one fix cannot remove both.*

**4:00–4:07** — A different geometry: B is sending to A, and C wants to send to D. C can hear B, so C defers.

> Caption: A different geometry: B is sending to A, and C wants to send to D. C can hear B, so C defers.

**4:07–4:15** — C to D would not have collided with B to A: C is 90 metres from A, and D is out of range of the access point.

> Caption: C to D would not have collided with B to A: C is 90 metres from A, and D is out of range of the access point.

**4:15–4:22** — Nothing was destroyed. What was lost is capacity: two links that could have run together ran one after the other.

> Caption: Nothing was destroyed. What was lost is capacity: two links that could have run together ran one after the other.

**4:22–4:30** — Hidden costs correctness, exposed costs throughput. RTS/CTS fixes the first and does nothing for the second.

> Caption: Hidden costs correctness, exposed costs throughput. RTS/CTS fixes the first and does nothing for the second.

Exam-trap caption mode adds: *Claiming RTS/CTS solves both problems. It solves the hidden terminal; the exposed terminal remains, and is not a collision at all.*

## Scene 10. Four steps that answer almost any Wi-Fi question

*4:30 – 5:00 · objective: Turn the whole lesson into a repeatable procedure, with the efficiency numbers for seven payload sizes to check it against.*

**4:30–4:37** — Step one: fix the variant, because slot, SIFS and DIFS all change with it.

> Caption: Step one: fix the variant, because slot, SIFS and DIFS all change with it.

**4:37–4:45** — Step two: add the fixed overheads. DIFS, then the mean backoff of CW over 2 slots, then the preamble and header.

> Caption: Step two: add the fixed overheads. DIFS, then the mean backoff of CW over 2 slots, then the preamble and header.

**4:45–4:52** — Step three: add the frame and its reply, so the data at the rate, a SIFS, the preamble again, and the 14-byte ACK.

> Caption: Step three: add the frame and its reply, so the data at the rate, a SIFS, the preamble again, and the 14-byte ACK.

Exam-trap caption mode adds: *Charging the ACK as 14 bytes with no preamble, or charging the payload with no MAC header. Both make the answer look plausible and both are wrong.*

**4:52–5:00** — Step four: divide payload bits by the total airtime. That is goodput: 5.5 percent at 64 bytes, 19 at 256, 57.9 at 1500, 67.8 at 2304.

> Caption: Step four: divide payload bits by the total airtime. That is goodput: 5.5 percent at 64 bytes, 19 at 256, 57.9 at 1500, 67.8 at 2304.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
