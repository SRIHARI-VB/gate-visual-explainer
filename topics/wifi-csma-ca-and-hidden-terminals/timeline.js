/* ==========================================================================
   wifi-csma-ca-and-hidden-terminals — THE timeline.
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
      id: 'medium', n: 1,
      title: 'One channel, three stations, and no one can hear their own collision',
      start: 0, end: 30,
      objective: 'See that a Wi-Fi collision happens at the receiver, not at the sender, and that this single fact forces the whole design of 802.11 medium access.'
    },
    {
      id: 'ncd', n: 2,
      title: 'Why radio cannot use Ethernet collision detection',
      start: 30, end: 60,
      objective: 'Compare CSMA/CD with CSMA/CA on the one property that separates them: a radio cannot listen while it transmits, and the damage is done somewhere it cannot hear.'
    },
    {
      id: 'cs', n: 3,
      title: 'Two kinds of carrier sense: the air, and the duration field',
      start: 60, end: 90,
      objective: 'Distinguish physical carrier sense from the virtual carrier sense carried by the NAV, and see that the hidden terminal defeats the first but not the second.'
    },
    {
      id: 'ifs', n: 4,
      title: 'The inter-frame spaces are a priority ladder',
      start: 90, end: 120,
      objective: 'Read SIFS, PIFS and DIFS as numbers that create priority out of waiting, and derive DIFS from the slot time.'
    },
    {
      id: 'exchange', n: 5,
      title: 'One frame, end to end: the airtime budget',
      start: 120, end: 150,
      objective: 'Build the airtime of one 802.11b transmission from its parts, and check the result against a published throughput table.'
    },
    {
      id: 'backoff', n: 6,
      title: 'Random backoff: the smallest number wins',
      start: 150, end: 180,
      objective: 'Compute the probability that the first transmission collides for k stations, and see why the familiar 1 over CW plus 1 is only true for two stations.'
    },
    {
      id: 'beb', n: 7,
      title: 'Binary exponential backoff and its ceiling',
      start: 180, end: 210,
      objective: 'Follow the contention window from 31 to 1023, convert it into waiting time, and see what the cap protects against.'
    },
    {
      id: 'hidden', n: 8,
      title: 'The hidden terminal and the RTS/CTS repair',
      start: 210, end: 240,
      objective: 'Show the hidden terminal as a geometry, then show the two-frame reservation that repairs it, and price that repair.'
    },
    {
      id: 'exposed', n: 9,
      title: 'The exposed terminal: the cost that is not a collision',
      start: 240, end: 270,
      objective: 'Separate a correctness failure from a throughput failure, and see why one fix cannot remove both.'
    },
    {
      id: 'procedure', n: 10,
      title: 'Four steps that answer almost any Wi-Fi question',
      start: 270, end: 300,
      objective: 'Turn the whole lesson into a repeatable procedure, with the efficiency numbers for seven payload sizes to check it against.'
    }
  ],

  events: [
    /* ---------- scene 1: the medium ---------- */
    { id: 's1-1', scene: 'medium', start: 0, end: 7.5,
      caption: 'One radio channel, three stations: A, the access point, and C. Only one of them may transmit at a time.',
      detail: 'A Wi-Fi basic service set shares a single channel in a band. The stations are not connected by a wire, so there is no bus to arbitrate for them; the medium itself is the only thing they share. Everything else in this lesson follows from how hard it is to share it politely.',
      narration: 'One radio channel, three stations. Only one of them may transmit at a time.',
      keyword: 'only one of them may transmit' },

    { id: 's1-2', scene: 'medium', start: 7.5, end: 15,
      caption: 'A and C both start sending, and both frames arrive at the access point at the same moment.',
      detail: 'A and C each begin a transmission without knowing about the other. Radio does not queue frames: two overlapping transmissions occupy the same frequencies at the same time, and the sum of the two is not either one of them.',
      narration: 'A and C both start sending, and both frames arrive at the access point at the same moment.',
      keyword: 'both frames arrive' },

    { id: 's1-3', scene: 'medium', start: 15, end: 22.5,
      caption: 'The collision happens at the access point. Neither A nor C can observe it, because each is busy transmitting.',
      detail: 'This is the sentence the rest of the lesson unpacks. A collision is not an event at the sender; it is an event at the receiver, where two signals sum into garbage. A sender that is transmitting is not listening, so it has no way to notice.',
      narration: 'The collision happens at the access point. Neither A nor C can observe it, because each is busy transmitting.',
      keyword: 'at the access point',
      trap: 'Assuming a station can tell that its frame collided. It cannot. It only learns that no acknowledgement came back.' },

    { id: 's1-4', scene: 'medium', start: 22.5, end: 30,
      caption: 'A and C are both in range of the access point but out of range of each other. That geometry is called the hidden terminal.',
      detail: 'Range is not transitive. Two stations can each be close enough to the access point and still be too far from one another, so neither hears the other carrier-sense. The name for this is the hidden terminal problem, and it is the reason 802.11 needs a mechanism beyond listening.',
      narration: 'A and C are both in range of the access point but out of range of each other. That geometry is called the hidden terminal.',
      keyword: 'out of range of each other' },

    /* ---------- scene 2: no collision detection ---------- */
    { id: 's2-1', scene: 'ncd', start: 30, end: 37.5,
      caption: 'Ethernet works because every station hears every other station, and hears itself at a comparable strength.',
      detail: 'On a shared cable the signal a station sends comes back to its own receiver at roughly the same level as a neighbour sends. That makes a comparison possible: send a bit, listen to the wire, and see whether what comes back is what went out.',
      narration: 'Ethernet works because every station hears every other station, and hears itself at a comparable strength.',
      keyword: 'comparable strength' },

    { id: 's2-2', scene: 'ncd', start: 37.5, end: 45,
      caption: 'Collision detection: send and listen at once, stop the instant the two disagree, and jam the line so the others stop too.',
      detail: 'That is CSMA with collision detection. Detection is what makes Ethernet efficient: a collision costs a few microseconds, not a whole frame, because the sender aborts as soon as it detects one.',
      narration: 'Collision detection: send and listen at once, stop the instant the two disagree, and jam the line so the others stop too.',
      keyword: 'send and listen at once' },

    { id: 's2-3', scene: 'ncd', start: 45, end: 52.5,
      caption: 'On radio the station\'s own signal at its own antenna is orders of magnitude stronger than anyone else\'s. The receiver is deaf while it transmits.',
      detail: 'A transmitter cannot usefully hear anything weaker than its own output, and the difference between its own power and a distant station\'s arriving power is large. The hardware is also half duplex: one radio chain cannot transmit and receive on the same channel at the same time. So the comparison Ethernet relies on does not exist.',
      narration: 'On radio, the station\'s own signal is far stronger than anyone else\'s. The receiver is deaf while it transmits.',
      keyword: 'deaf while it transmits' },

    { id: 's2-4', scene: 'ncd', start: 52.5, end: 60,
      caption: 'So 802.11 replaces detection with avoidance plus acknowledgement: send the whole frame, then wait for an ACK.',
      detail: 'A missing acknowledgement is the only collision signal a Wi-Fi station ever gets, and it arrives after the damage is done. That is why 802.11 tries to prevent collisions before they happen, which is what the phrase collision avoidance means, and why the recovery is a retransmission rather than an abort.',
      narration: 'So 802.11 replaces detection with avoidance plus acknowledgement: send the whole frame, then wait for an ACK.',
      keyword: 'avoidance plus acknowledgement',
      trap: 'Writing that 802.11 detects collisions and aborts. It does not detect; it infers from a missing ACK, after the full frame has already been spent.' },

    /* ---------- scene 3: carrier sense ---------- */
    { id: 's3-1', scene: 'cs', start: 60, end: 67.5,
      caption: 'Physical carrier sense: listen to the air and decide whether energy on the channel looks like a frame preamble.',
      detail: 'The radio measures the energy on the channel and looks for a valid preamble. If it finds one, the medium is busy. This works only against stations that are close enough to be heard, which is exactly what the range circle shows.',
      narration: 'Physical carrier sense: listen to the air and decide whether energy on the channel looks like a frame preamble.',
      keyword: 'listen to the air' },

    { id: 's3-2', scene: 'cs', start: 67.5, end: 75,
      caption: 'A and C are 90 metres apart with a 60-metre range, so neither hears the other. Physical sense says the channel is free to both.',
      detail: 'The numbers on the canvas come from the geometry in the model: A to C is 90 metres, A to the access point is 45, C to the access point is 45, and the range is 60. Two stations can each be inside the access point\'s circle and outside each other\'s.',
      narration: 'A and C are 90 metres apart with a 60-metre range, so neither hears the other. Physical sense says the channel is free to both.',
      keyword: 'neither hears the other' },

    { id: 's3-3', scene: 'cs', start: 75, end: 82.5,
      caption: 'Virtual carrier sense: every frame header carries a duration, and every station keeps a countdown called the NAV.',
      detail: 'A station that overhears a frame reads the duration field from its header and sets a timer, the network allocation vector, to that many microseconds. While the timer runs the medium is treated as busy even if the radio hears nothing. This is a reservation, not a measurement.',
      narration: 'Virtual carrier sense: every frame header carries a duration, and every station keeps a countdown called the NAV.',
      keyword: 'countdown called the NAV' },

    { id: 's3-4', scene: 'cs', start: 82.5, end: 90,
      caption: 'For a 1500-byte frame the reservation is 1141.5 microseconds: SIFS, the data, SIFS again, then the ACK.',
      detail: 'The number is computed from the frame size, not guessed: SIFS 10, data 1111.3, SIFS 10, ACK 10.2 microseconds, which is 1141.5. A hidden station that hears only the CTS will still stay quiet for exactly the right length of time, because the number travelled in the packet.',
      narration: 'For a 1500-byte frame the reservation is 1141.5 microseconds: SIFS, the data, SIFS again, then the ACK.',
      keyword: '1141.5 microseconds' },

    /* ---------- scene 4: the IFS ladder ---------- */
    { id: 's4-1', scene: 'ifs', start: 90, end: 97.5,
      caption: 'Before transmitting, a station must see the medium idle for an inter-frame space. There are three, of different lengths.',
      detail: 'An inter-frame space is a mandatory silence. Its length is not a technicality: because every station must wait at least its own IFS, a station with a shorter IFS always wins the race to the medium. The ladder is a priority scheme built out of nothing but waiting.',
      narration: 'Before transmitting, a station must see the medium idle for an inter-frame space. There are three, of different lengths.',
      keyword: 'inter-frame space' },

    { id: 's4-2', scene: 'ifs', start: 97.5, end: 105,
      caption: 'On 802.11b: SIFS is 10 microseconds, PIFS is 30, DIFS is 50. The shortest wins.',
      detail: 'SIFS is used for the immediate reply: the ACK, the CTS, and the next fragment of a fragmented frame. PIFS is used by the access point when it takes over the channel. DIFS is the ordinary waiting time for a data frame, and it is the longest, so ordinary traffic has the lowest priority.',
      narration: 'On 802.11b: SIFS is 10 microseconds, PIFS is 30, DIFS is 50. The shortest wins.',
      keyword: 'SIFS is 10 microseconds' },

    { id: 's4-3', scene: 'ifs', start: 105, end: 112.5,
      caption: 'DIFS is not a free parameter: DIFS equals SIFS plus two slot times, so 10 plus 40 gives 50.',
      detail: 'The slot time is the unit in which backoff is counted, and the identity DIFS = SIFS + 2 x slot is what ties the ladder to the physical layer. Change the physical layer and DIFS follows: 802.11a has SIFS 16 and slot 9, giving DIFS 34, and 802.11g has SIFS 10 and slot 9, giving 28. The model checks all three identities.',
      narration: 'DIFS is not a free parameter: DIFS equals SIFS plus two slot times, so 10 plus 40 gives 50.',
      keyword: 'SIFS plus two slot times' },

    { id: 's4-4', scene: 'ifs', start: 112.5, end: 120,
      caption: 'Because SIFS is shortest, the ACK always starts before any waiting station may contend. The reply has priority.',
      detail: 'This is the whole point of the ladder. After a data frame ends, every other station must wait a DIFS before it may begin counting down its backoff. The receiver waits only a SIFS, which is shorter, so its ACK reaches the channel first and the frame exchange completes without a new contention round.',
      narration: 'Because SIFS is shortest, the ACK always starts before any waiting station may contend. The reply has priority.',
      keyword: 'the ACK always starts before' },

    /* ---------- scene 5: the exchange ---------- */
    { id: 's5-1', scene: 'exchange', start: 120, end: 127.5,
      caption: 'A full exchange, in order: DIFS, a backoff countdown, the frame, a SIFS, and the ACK.',
      detail: 'Every 802.11 data exchange with the distributed coordination function has this shape. The sender waits a DIFS, then counts its backoff down slot by slot while the medium stays idle, then transmits. The receiver waits a SIFS and replies with an ACK. Only then may anyone else start contending.',
      narration: 'A full exchange, in order: DIFS, a backoff countdown, the frame, a SIFS, and the ACK.',
      keyword: 'DIFS, a backoff countdown, the frame, a SIFS, and the ACK' },

    { id: 's5-2', scene: 'exchange', start: 127.5, end: 135,
      caption: 'Add the parts for a 256-byte frame at 11 megabits per second: 50 plus 320 plus 192 plus 206.5 plus 10 plus 192 plus 10.2 microseconds.',
      detail: 'The parts are DIFS 50, the mean backoff of 16 slots at 20 microseconds each, the 192 microseconds of long preamble and header, the data at 206.5, SIFS 10, the preamble and header again for the ACK, and the ACK itself at 10.2. The preamble is paid twice because the ACK is a separate transmission.',
      narration: 'Add the parts for a 256-byte frame at 11 megabits per second: 50 plus 320 plus 192 plus 206.5 plus 10 plus 192 plus 10.2 microseconds.',
      keyword: '192 plus 206.5' },

    { id: 's5-3', scene: 'exchange', start: 135, end: 142.5,
      caption: 'That is 980.7 microseconds for 2048 bits of payload, which is 2.088 megabits per second of goodput: 19 percent of an 11 megabit radio.',
      detail: 'Goodput is the payload delivered divided by the airtime spent. The difference between 11 and 2.088 is not waste in the sense of an error; it is the fixed cost of gaining access, of the physical preamble, and of the acknowledgement. 774.2 of the 980.7 microseconds carry no payload at all.',
      narration: 'That is 980.7 microseconds for 2048 bits of payload, which is 2.088 megabits per second of goodput: 19 percent of an 11 megabit radio.',
      keyword: '19 percent' },

    { id: 's5-4', scene: 'exchange', start: 142.5, end: 150,
      caption: 'The published 802.11b table gives 2,088,246 bits per second for exactly this frame. This page computes the same number.',
      detail: 'The agreement is the check that the airtime model is the right one: the same seven terms, the same constants, and an error below one part in ten thousand. Any calculation in an exam that uses these terms will match the industry figure for the same frame size.',
      narration: 'The published 802.11b table gives 2,088,246 bits per second for exactly this frame. This page computes the same number.',
      keyword: 'the same number',
      trap: 'Quoting the raw 11 Mbps as the throughput of a Wi-Fi link. The goodput for a 256-byte frame is 19 percent of it, and the payload size, not the rate, sets that percentage.' },

    /* ---------- scene 6: backoff ---------- */
    { id: 's6-1', scene: 'backoff', start: 150, end: 157.5,
      caption: 'A station that finds the medium idle for a DIFS does not transmit at once. It draws a random whole number and counts that many slots.',
      detail: 'The number is uniform from 0 to the contention window CW. The station counts down one slot per idle slot, freezes the counter if the medium becomes busy, and transmits when the counter reaches zero. Randomising is what stops every waiting station from transmitting in the same instant after a long busy period.',
      narration: 'A station that finds the medium idle for a DIFS does not transmit at once. It draws a random whole number and counts that many slots.',
      keyword: 'draws a random whole number' },

    { id: 's6-2', scene: 'backoff', start: 157.5, end: 165,
      caption: 'The station with the smallest number transmits first. A collision happens only when two stations draw the same smallest number.',
      detail: 'This is the precise definition, and it is narrower than it first looks. If two stations draw 9 and 10 while a third draws 4, there is no collision: the third transmits, the others freeze, and their numbers are still different when they resume. A repeated number above the minimum is harmless.',
      narration: 'The station with the smallest number transmits first. A collision happens only when two stations draw the same smallest number.',
      keyword: 'the same smallest number' },

    { id: 's6-3', scene: 'backoff', start: 165, end: 172.5,
      caption: 'For two stations the collision probability is exactly 1 over CW plus 1, which is 3.13 percent at CW equal to 31.',
      detail: 'With two stations there is only one way to collide, which is to draw the same number, and there are CW plus 1 numbers, so the probability is 1 over 32. This is the formula most textbooks quote, and it is correct only for two stations.',
      narration: 'For two stations the collision probability is exactly 1 over CW plus 1, which is 3.13 percent at CW equal to 31.',
      keyword: '3.13 percent' },

    { id: 's6-4', scene: 'backoff', start: 172.5, end: 180,
      caption: 'With eight stations it is 12.04 percent at CW 31 and 23.18 percent at CW 15. The familiar formula is not the general one.',
      detail: 'The general probability is one minus the chance that the minimum is attained exactly once, which the page computes by summing over every possible minimum. The tempting shortcut, all k draws distinct, gives 0.625 where the truth is 0.34375 in the three-station, CW-3 case, so it is not merely imprecise: it is the wrong event. The narrower CW of 802.11a and g nearly doubles the collision rate at eight stations.',
      narration: 'With eight stations it is 12.04 percent at CW 31 and 23.18 percent at CW 15. The familiar formula is not the general one.',
      keyword: 'the familiar formula is not the general one',
      trap: 'Using 1/(CW+1) for k stations, or computing P(all distinct). Both are wrong beyond two stations; only the smallest-value event is a collision.' },

    /* ---------- scene 7: exponential backoff ---------- */
    { id: 's7-1', scene: 'beb', start: 180, end: 187.5,
      caption: 'After a failed attempt the window becomes twice the old one plus one: 31, then 63, 127, 255, 511, and 1023.',
      detail: 'Doubling the window doubles the number of possible numbers to draw, which lowers the chance that two stations pick the same minimum. The rule 2 CW plus 1 applied to 31 gives 63, and six rungs reach the ceiling of 1023. A success returns the window to 31 at once.',
      narration: 'After a failed attempt the window becomes twice the old one plus one: 31, then 63, 127, 255, 511, and 1023.',
      keyword: '31, then 63, 127, 255, 511, and 1023' },

    { id: 's7-2', scene: 'beb', start: 187.5, end: 195,
      caption: 'The mean wait is half the window, so it runs from 310 microseconds at the first rung to 10,230 at the last.',
      detail: 'A uniform draw from 0 to CW has mean CW over 2, and each slot is 20 microseconds on 802.11b. At the first rung the mean wait is 15.5 slots, which is 310 microseconds. At the cap it is 511.5 slots, which is 10,230 microseconds, before the frame is even sent.',
      narration: 'The mean wait is half the window, so it runs from 310 microseconds at the first rung to 10,230 at the last.',
      keyword: 'half the window' },

    { id: 's7-3', scene: 'beb', start: 195, end: 202.5,
      caption: 'The ceiling matters: without it the window would double forever and a busy station could wait arbitrarily long.',
      detail: 'The cap at 1023 slots is 20,460 microseconds of worst-case wait, and the algorithm may keep retrying at that window. Without a cap the mean wait would grow without bound as retries accumulate, and a station that had been unlucky a few times would be starved. The cap trades collision probability for a bounded delay.',
      narration: 'The ceiling matters: without it the window would double forever and a busy station could wait arbitrarily long.',
      keyword: 'The ceiling matters' },

    { id: 's7-4', scene: 'beb', start: 202.5, end: 210,
      caption: 'One limitation is structural: backoff cannot tell a collision from a frame lost to noise, because both look like a missing ACK.',
      detail: 'The only feedback is the absence of an acknowledgement, and interference, a weak signal at the edge of range, and a genuine collision all produce the same silence. So the window doubles for a reason that may have nothing to do with contention, which is a known inefficiency of the scheme rather than a bug in it.',
      narration: 'One limitation is structural: backoff cannot tell a collision from a frame lost to noise, because both look like a missing ACK.',
      keyword: 'cannot tell a collision from a frame lost to noise' },

    /* ---------- scene 8: hidden terminal ---------- */
    { id: 's8-1', scene: 'hidden', start: 210, end: 217.5,
      caption: 'Here is the hidden terminal drawn as a geometry: A to the access point 45 metres, C to the access point 45, A to C 90.',
      detail: 'The range circle is 60 metres. A and C are each inside the access point\'s circle and each outside the other\'s, which the model verifies rather than assumes: the only hidden pair in this four-node layout is A and C. Everything that follows is a consequence of that one missing link.',
      narration: 'Here is the hidden terminal drawn as a geometry: A to the access point 45 metres, C to the access point 45, A to C 90.',
      keyword: 'A to C 90' },

    { id: 's8-2', scene: 'hidden', start: 217.5, end: 225,
      caption: 'Both carrier-sense the channel, both find it idle, both transmit, and both frames are destroyed at the access point.',
      detail: 'Neither station made a mistake. Each did exactly what physical carrier sense told it to do, and the information it needed was not available to it. This is why the hidden terminal is a correctness problem and not a tuning problem: no amount of listening harder fixes a signal that does not arrive.',
      narration: 'Both carrier-sense the channel, both find it idle, both transmit, and both frames are destroyed at the access point.',
      keyword: 'both frames are destroyed',
      trap: 'Calling the hidden terminal a station that is "far away". Both stations are close to the access point; what is missing is the link between them.' },

    { id: 's8-3', scene: 'hidden', start: 225, end: 232.5,
      caption: 'The repair: a short RTS, a short CTS from the receiver, and the CTS makes every station in its range fall silent.',
      detail: 'The sender asks with a request-to-send, and the receiver answers with a clear-to-send that repeats the duration. Any station that hears the CTS sets its NAV to that duration. C is hidden from A but not from the access point, so the CTS reaches C even though the data would have been destroyed.',
      narration: 'The repair: a short RTS, a short CTS from the receiver, and the CTS makes every station in its range fall silent.',
      keyword: 'the CTS makes every station in its range fall silent' },

    { id: 's8-4', scene: 'hidden', start: 232.5, end: 240,
      caption: 'The repair is not free: RTS 206.6 plus SIFS 10 plus CTS 202.2 plus SIFS 10 is 428.7 microseconds of overhead.',
      detail: 'For a 1500-byte frame that is 1111.3 microseconds of data, so the handshake pays only when the collision probability exceeds 0.386. For a 256-byte frame the data is 206.5 microseconds, less than the handshake, so it can never pay, which is exactly why 802.11 makes RTS optional and off by default. And RTS frames can themselves collide.',
      narration: 'The repair is not free: RTS 206.6 plus SIFS 10 plus CTS 202.2 plus SIFS 10 is 428.7 microseconds of overhead.',
      keyword: '428.7 microseconds of overhead' },

    /* ---------- scene 9: exposed terminal ---------- */
    { id: 's9-1', scene: 'exposed', start: 240, end: 247.5,
      caption: 'A different geometry: B is sending to A, and C wants to send to D. C can hear B, so C defers.',
      detail: 'C is within range of B, so physical carrier sense tells it the medium is busy and it waits. That sounds correct, and it is what the protocol requires, but in this layout it is unnecessary.',
      narration: 'A different geometry: B is sending to A, and C wants to send to D. C can hear B, so C defers.',
      keyword: 'C can hear B' },

    { id: 's9-2', scene: 'exposed', start: 247.5, end: 255,
      caption: 'C to D would not have collided with B to A: C is 90 metres from A, and D is out of range of the access point.',
      detail: 'The model checks both distances: C to A is 90 metres, beyond the 60-metre range, and D is 95 metres from the access point. So a transmission from C would not have disturbed A\'s reception of B, and B\'s transmission does not disturb D. Two links could have run at the same time.',
      narration: 'C to D would not have collided with B to A: C is 90 metres from A, and D is out of range of the access point.',
      keyword: 'would not have collided' },

    { id: 's9-3', scene: 'exposed', start: 255, end: 262.5,
      caption: 'Nothing was destroyed. What was lost is capacity: two links that could have run together ran one after the other.',
      detail: 'This is the exposed terminal. It is a throughput problem, not a correctness problem, and it is much harder to detect because no error ever appears. Every fix for the hidden terminal tends to make it worse: the more a station defers, the more capacity it gives away.',
      narration: 'Nothing was destroyed. What was lost is capacity: two links that could have run together ran one after the other.',
      keyword: 'What was lost is capacity' },

    { id: 's9-4', scene: 'exposed', start: 262.5, end: 270,
      caption: 'Hidden costs correctness, exposed costs throughput. RTS/CTS fixes the first and does nothing for the second.',
      detail: 'The two problems pull in opposite directions: the reservation that makes C silent protects A, and that same silence is what wastes the capacity in the exposed case. Keeping them apart is the distinction most Wi-Fi questions turn on, and 802.11 accepts the exposed-terminal loss as the price of a simple distributed rule.',
      narration: 'Hidden costs correctness, exposed costs throughput. RTS/CTS fixes the first and does nothing for the second.',
      keyword: 'Hidden costs correctness, exposed costs throughput',
      trap: 'Claiming RTS/CTS solves both problems. It solves the hidden terminal; the exposed terminal remains, and is not a collision at all.' },

    /* ---------- scene 10: the procedure ---------- */
    { id: 's10-1', scene: 'procedure', start: 270, end: 277.5,
      caption: 'Step one: fix the variant, because slot, SIFS and DIFS all change with it.',
      detail: '802.11b has slot 20, SIFS 10 and DIFS 50 microseconds, with a contention window starting at 31. 802.11a has slot 9, SIFS 16 and DIFS 34, with a window starting at 15. 802.11g has slot 9, SIFS 10 and DIFS 28. A question that does not name the variant does not have one answer.',
      narration: 'Step one: fix the variant, because slot, SIFS and DIFS all change with it.',
      keyword: 'fix the variant' },

    { id: 's10-2', scene: 'procedure', start: 277.5, end: 285,
      caption: 'Step two: add the fixed overheads. DIFS, then the mean backoff of CW over 2 slots, then the preamble and header.',
      detail: 'These terms do not depend on the payload at all, which is the key structural fact: 774.2 microseconds of a 980.7-microsecond cycle are fixed. Any question that changes only the payload changes only one term of the sum.',
      narration: 'Step two: add the fixed overheads. DIFS, then the mean backoff of CW over 2 slots, then the preamble and header.',
      keyword: 'the fixed overheads' },

    { id: 's10-3', scene: 'procedure', start: 285, end: 292.5,
      caption: 'Step three: add the frame and its reply, so the data at the rate, a SIFS, the preamble again, and the 14-byte ACK.',
      detail: 'The payload is charged with 28 bytes of MAC header and checksum. The ACK is charged with its own preamble and header, because it is a separate transmission and the radio must re-acquire the channel. Forgetting the second preamble is the most common arithmetic slip in this topic.',
      narration: 'Step three: add the frame and its reply, so the data at the rate, a SIFS, the preamble again, and the 14-byte ACK.',
      keyword: 'the preamble again',
      trap: 'Charging the ACK as 14 bytes with no preamble, or charging the payload with no MAC header. Both make the answer look plausible and both are wrong.' },

    { id: 's10-4', scene: 'procedure', start: 292.5, end: 300,
      caption: 'Step four: divide payload bits by the total airtime. That is goodput: 5.5 percent at 64 bytes, 19 at 256, 57.9 at 1500, 67.8 at 2304.',
      detail: 'The efficiency is set by the payload size, not the rate, because the overhead is constant while the payload is not. Those four figures come from the same seven-term sum, and the page checks the sum against the published table for two of them. The larger the frame, the closer a Wi-Fi link gets to its nominal rate, which is why frame aggregation exists.',
      narration: 'Step four: divide payload bits by the total airtime. That is goodput: 5.5 percent at 64 bytes, 19 at 256, 57.9 at 1500, 67.8 at 2304.',
      keyword: 'divide payload bits by the total airtime' }
  ]
};
