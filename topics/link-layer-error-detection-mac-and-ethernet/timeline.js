/* ==========================================================================
   link-layer-error-detection-mac-and-ethernet — THE timeline.
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
      id: 'frame',
      n: 1,
      title: 'Frames: how the receiver knows where a message ends',
      start: 0, end: 30,
      objective: 'See why a stream of bits needs boundaries, and read bit stuffing as the rule that keeps a flag pattern unique.'
    },
    {
      id: 'parity',
      n: 2,
      title: 'Parity, and what a second dimension buys you',
      start: 30, end: 60,
      objective: 'Separate detection from correction, and find the error pattern a two-dimensional parity grid cannot see.'
    },
    {
      id: 'checksum',
      n: 3,
      title: 'The Internet checksum and its blind spot',
      start: 60, end: 90,
      objective: 'Compute a one\'s complement sum by hand, and see two errors that cancel and pass the check.'
    },
    {
      id: 'crc',
      n: 4,
      title: 'CRC: division, not addition',
      start: 90, end: 120,
      objective: 'Divide modulo 2, append the remainder, and know exactly which error patterns the generator catches.'
    },
    {
      id: 'hamming',
      n: 5,
      title: 'Hamming distance: what a code can detect and correct',
      start: 120, end: 150,
      objective: 'Read d_min off a code, convert it to a detection and correction capability, and repair a single bit by syndrome.'
    },
    {
      id: 'aloha',
      n: 6,
      title: 'ALOHA: the cost of not listening',
      start: 150, end: 180,
      objective: 'See the vulnerable period double when nobody senses the channel, and read 18.4 and 36.8 percent off a simulation.'
    },
    {
      id: 'csma',
      n: 7,
      title: 'Carrier sense, collision detection, and the 2-tau rule',
      start: 180, end: 210,
      objective: 'Shrink the vulnerable window to one round trip, and see why detection forces a minimum frame size.'
    },
    {
      id: 'ethernet',
      n: 8,
      title: 'Ethernet: the frame, the 64 bytes, and the backoff',
      start: 210, end: 240,
      objective: 'Add up the fields of an 802.3 frame and see the doubling window that resolves repeated collisions.'
    },
    {
      id: 'arith',
      n: 9,
      title: 'The arithmetic GATE asks for, on real papers',
      start: 240, end: 270,
      objective: 'Solve the minimum frame size, signal speed and sensing window items from their own numbers.'
    },
    {
      id: 'decide',
      n: 10,
      title: 'The procedure, and the traps that cost marks',
      start: 270, end: 300,
      objective: 'Fix a five-step routine that covers every question shape in this clause.'
    }
  ],

  events: [
    /* ---------------- scene 1: framing ---------------- */
    {
      id: 'frame-1', scene: 'frame', start: 0, end: 7.5,
      caption: 'A receiver sees a stream of bits. Nothing in the stream says where one message stops.',
      detail: 'The physical layer hands up bits and nothing else. Boundaries are the link layer\'s first job, and every later job — error detection, addressing, retransmission — needs them.',
      narration: 'The physical layer hands the link layer a stream of bits. Nothing in that stream says where a message begins or ends, so the very first job of the link layer is to draw boundaries.',
      keyword: 'framing',
      trap: 'A frame is not the same thing as a packet. The frame is the unit on one wire; the packet inside it may cross many wires.'
    },
    {
      id: 'frame-2', scene: 'frame', start: 7.5, end: 15,
      caption: 'A flag pattern marks the ends. The sender must guarantee that pattern never appears inside the data.',
      detail: 'The HDLC-style flag is 01111110, six ones between two zeros. If the data ever contained those six ones, a receiver could mistake data for a boundary.',
      narration: 'A flag pattern marks the ends of the frame, six ones between two zeros. If the data itself could contain that pattern, a receiver would mistake data for a boundary, so the sender must make it impossible.',
      keyword: 'flag 01111110',
      trap: 'The flag is a delimiter, not a checksum. It says where the frame is, not whether it is correct.'
    },
    {
      id: 'frame-3', scene: 'frame', start: 15, end: 22.5,
      caption: 'Bit stuffing: after five ones the sender inserts a zero, and the receiver removes it.',
      detail: 'Five ones followed by an inserted zero can never grow into six ones. GATE CSE 2014 Set 3 Q24 gives the stuffed output 01111100101 and asks for the input: strip the zero after the run of five ones and 0111110101 remains.',
      narration: 'So the sender stuffs. After every run of five ones it inserts a zero, and the receiver deletes that zero again. GATE 2014 Set 3 question 24 hands you the stuffed string and asks for the original.',
      keyword: 'bit stuffing',
      trap: 'Stuffing happens after five ones, not six. Counting six and then removing a bit gives the wrong answer on this exact paper.'
    },
    {
      id: 'frame-4', scene: 'frame', start: 22.5, end: 30,
      caption: 'Destuffing is the same rule backwards: delete the zero after each run of five ones.',
      detail: 'The rule is deterministic in both directions, which is why it is safe: no stuffing decision depends on what comes next in the data.',
      narration: 'Destuffing is the same rule read backwards: delete one zero after each run of five ones. Because the rule never depends on later bits, sender and receiver always agree.',
      keyword: 'destuffing',
      trap: 'The delimiter is eight bits, but only the six ones matter for stuffing. Students who count the zeros stuff in the wrong place.'
    },

    /* ---------------- scene 2: parity ---------------- */
    {
      id: 'parity-1', scene: 'parity', start: 30, end: 37.5,
      caption: 'One parity bit answers one question: is the number of ones even?',
      detail: 'Even parity appends a bit that makes the total count of ones even. A single flipped bit makes the count odd and is caught. Two flipped bits keep the parity and pass.',
      narration: 'A single parity bit answers one question: is the number of ones even? Append a bit that makes it even, and any single flip makes it odd, so one flip is caught. Two flips keep the count even and pass.',
      keyword: 'even parity',
      trap: 'Parity detects an odd number of errors. Two, four or any even number of flips are invisible to it.'
    },
    {
      id: 'parity-2', scene: 'parity', start: 37.5, end: 45,
      caption: 'Add a parity bit per row and per column and a single error is not just detected, it is located.',
      detail: 'The failing row and the failing column cross at the flipped bit. Detection needs one bit of information; correction needs enough information to name a position.',
      narration: 'Now add a parity bit to every row and every column. A single flip breaks exactly one row check and one column check, and their crossing names the bit. That is correction, not just detection.',
      keyword: 'row and column parity',
      trap: 'Correction needs more than detection. A code that detects one error cannot in general say which bit it was.'
    },
    {
      id: 'parity-3', scene: 'parity', start: 45, end: 52.5,
      caption: 'Four errors at the corners of a rectangle leave every row and every column even.',
      detail: 'Two flips in a row restore that row\'s parity; two in a column restore the column\'s. The grid reports no error at all. This is the minimal blind spot of two-dimensional parity, and it is four bits.',
      narration: 'Here is the blind spot. Flip four bits at the corners of a rectangle. Each affected row has two flips, so its parity is restored; each affected column too. The receiver sees a perfectly valid grid.',
      keyword: 'rectangle of errors',
      trap: 'The question "how many errors can two-dimensional parity detect" has no single number. It detects all patterns of three or fewer, and misses some of four.'
    },
    {
      id: 'parity-4', scene: 'parity', start: 52.5, end: 60,
      caption: 'So the honest statement: all one, two and three-bit errors, and some four-bit errors escape.',
      detail: 'Stated as a bound: two-dimensional parity detects every error pattern of weight up to three, and detects a four-bit pattern only when the four bits do not form a rectangle.',
      narration: 'So the honest claim is a bound. Every pattern of one, two or three bits is caught. Some four-bit patterns escape, exactly the rectangles. Anything stronger needs a stronger code.',
      keyword: 'weight up to three',
      trap: 'Writing "detects up to two errors" understates it, and "detects up to four" overstates it. Say three, and say which four-bit patterns fail.'
    },

    /* ---------------- scene 3: checksum ---------------- */
    {
      id: 'checksum-1', scene: 'checksum', start: 60, end: 67.5,
      caption: 'The Internet checksum adds the data as 16-bit words in one\'s complement.',
      detail: 'Add the words with end-around carry, then complement the sum. The receiver adds the same words plus the checksum and should get all ones.',
      narration: 'The Internet checksum treats the data as sixteen-bit words, adds them in one\'s complement arithmetic, wrapping any carry back into the low bit, and then complements the total. The receiver repeats the addition including the checksum and should get all ones.',
      keyword: 'one\'s complement sum',
      trap: 'The carry is not discarded. Dropping it instead of wrapping it is the single most common arithmetic slip in this question type.'
    },
    {
      id: 'checksum-2', scene: 'checksum', start: 67.5, end: 75,
      caption: 'It is cheap: one adder, no division. That is why IP, TCP and UDP all use it.',
      detail: 'A checksum costs one pass over the data with a simple adder. CRC costs a shift register. Both are hardware-cheap, but the checksum is cheaper and weaker.',
      narration: 'Why use something this weak? Because it costs one pass through a plain adder. That is why the IP, TCP and UDP headers all carry it.',
      keyword: 'cheap and weak',
      trap: 'A checksum is not a CRC. They catch different error families, and a question that says "checksum" is not asking for polynomial division.'
    },
    {
      id: 'checksum-3', scene: 'checksum', start: 75, end: 82.5,
      caption: 'Two errors that add to the same total cancel: one word up by one, another down by one.',
      detail: 'The sum is unchanged, so the receiver\'s total is still all ones and the error passes. Any error pattern whose word-level changes sum to zero is invisible.',
      narration: 'Now the blind spot. Raise one word by one and lower another by one. The total is unchanged, the receiver still gets all ones, and the error sails through.',
      keyword: 'compensating errors',
      trap: 'This is not a rare accident on a real link; it is the reason the checksum is called weak. It catches bit errors, not adversarial or correlated ones.'
    },
    {
      id: 'checksum-4', scene: 'checksum', start: 82.5, end: 90,
      caption: 'So: checksum for speed, CRC for strength. Neither is a correction code.',
      detail: 'Detection asks "is this wrong?". Correction asks "what was it?". A checksum answers the first badly and the second not at all; the usual repair is retransmission.',
      narration: 'The summary is a trade. Checksum for speed, CRC for strength. Both only detect; repair is done by asking again, which is why ARQ sits right next to error detection in every textbook.',
      keyword: 'detect versus correct',
      trap: 'Do not describe the checksum as correcting anything. It has no notion of where the error is.'
    },

    /* ---------------- scene 4: CRC ---------------- */
    {
      id: 'crc-1', scene: 'crc', start: 90, end: 97.5,
      caption: 'A CRC treats the bits as a polynomial over GF(2) and divides by a generator.',
      detail: 'Over GF(2), addition and subtraction are both XOR, so there are no borrows and no carries. The generator is a bit pattern whose degree r equals the number of check bits.',
      narration: 'A cyclic redundancy check treats the message as a polynomial with coefficients zero and one, and divides it by a fixed generator. In this arithmetic there are no carries: addition is exclusive or.',
      keyword: 'modulo-2 division',
      trap: 'Do not subtract with borrows. Every step is XOR, and a leading zero in the running remainder means "shift, do not XOR".'
    },
    {
      id: 'crc-2', scene: 'crc', start: 97.5, end: 105,
      caption: 'Append r zeros, divide, and send the message with the r-bit remainder attached.',
      detail: 'GATE CSE 2017 Set 1 Q32: message 01011011 with generator x cubed plus x plus one, that is 1011. Dividing 01011011000 gives remainder 101, so the frame sent is 01011011101.',
      narration: 'The procedure: append as many zeros as the generator\'s degree, divide, and attach the remainder. GATE 2017 Set 1 question 32 uses generator 1011 on message 01011011 and the remainder comes out 101.',
      keyword: 'append r zeros',
      trap: 'Appending four zeros for a generator of degree three shifts every partial remainder and changes the answer. The count is the degree.'
    },
    {
      id: 'crc-3', scene: 'crc', start: 105, end: 112.5,
      caption: 'At the receiver the whole codeword must divide exactly: remainder zero means no detected error.',
      detail: 'This works because the transmitted word is a multiple of the generator by construction. Any received word that is not a multiple has a non-zero remainder, called the syndrome.',
      narration: 'At the far end the receiver divides the whole received word, message plus check bits, by the same generator. A multiple gives remainder zero. Anything else is a detected error.',
      keyword: 'remainder zero',
      trap: 'Checking only the message part is meaningless. The division is over the entire received codeword.'
    },
    {
      id: 'crc-4', scene: 'crc', start: 112.5, end: 120,
      caption: 'What is caught: every burst of length at most r, and every odd-weight error if x+1 divides the generator.',
      detail: 'A generator with a non-zero constant term catches every burst of length up to its degree r. It catches all odd numbers of bit errors exactly when x+1 is a factor, which for a bit pattern means it has an even number of ones.',
      narration: 'Two guarantees are worth memorising. Any burst of length at most r is caught, provided the generator has a constant term. And every odd number of bit errors is caught exactly when x plus one divides the generator.',
      keyword: 'burst of length r',
      trap: 'The odd-error guarantee is conditional. Generator 1011 has three ones, so x+1 does not divide it, and some odd-weight errors do pass.'
    },

    /* ---------------- scene 5: Hamming ---------------- */
    {
      id: 'ham-1', scene: 'hamming', start: 120, end: 127.5,
      caption: 'Hamming distance is the number of positions in which two words differ.',
      detail: 'For a code, the distance that matters is the minimum over all pairs of distinct codewords, written d min. It is a property of the code, not of one message.',
      narration: 'Hamming distance counts the positions in which two words differ. For a whole code, the number that matters is the smallest distance between any two valid codewords.',
      keyword: 'minimum distance',
      trap: 'It is the minimum over all pairs, not the average and not the distance between two convenient codewords.'
    },
    {
      id: 'ham-2', scene: 'hamming', start: 127.5, end: 135,
      caption: 'To detect s errors you need d min at least s+1. To correct t errors you need d min at least 2t+1.',
      detail: 'Detection needs every error pattern to land off the code. Correction needs the balls of radius t around codewords to stay disjoint. GATE CSE 2017 Set 2 Q34 gives four codewords with d min three, so one error can be corrected.',
      narration: 'Two inequalities do all the work. Detecting s errors needs a minimum distance of at least s plus one. Correcting t errors needs at least twice t plus one, because the neighbourhoods around codewords must not overlap.',
      keyword: 'd min at least 2t+1',
      trap: 'The common error is using d min for correction directly. Distance three corrects one error, not three.'
    },
    {
      id: 'ham-3', scene: 'hamming', start: 135, end: 142.5,
      caption: 'Hamming code places check bits at the powers of two, so each position has a unique binary address.',
      detail: 'With m data bits you need the smallest r with 2 to the r at least m plus r plus one. For eight data bits, r is four and the codeword is twelve bits long.',
      narration: 'A Hamming code puts the check bits at positions one, two, four, eight, and so on, so that every bit position has a unique address in binary. Eight data bits need four check bits, giving a twelve-bit codeword.',
      keyword: 'check bits at powers of two',
      trap: 'The inequality counts the no-error case as well. Dropping the plus one gives one check bit too few for many values of m.'
    },
    {
      id: 'ham-4', scene: 'hamming', start: 142.5, end: 150,
      caption: 'The failed checks, read as a binary number, are the position of the bad bit.',
      detail: 'Recomputing each check group gives a syndrome. Syndrome zero means no single-bit error; syndrome k means bit k flipped, so correcting it is one flip at a known place.',
      narration: 'Recompute every check group. Each failure contributes its own position number to a syndrome. If the syndrome is zero nothing is wrong; if it is k, bit k flipped, and flipping it back repairs the word.',
      keyword: 'syndrome',
      trap: 'The syndrome corrects only single-bit errors. Two flipped bits give a syndrome that points confidently at a third, innocent bit.'
    },

    /* ---------------- scene 6: ALOHA ---------------- */
    {
      id: 'aloha-1', scene: 'aloha', start: 150, end: 157.5,
      caption: 'One shared channel, many stations, no coordinator: somebody has to lose.',
      detail: 'Medium access control is the set of rules for sharing one wire. Random access protocols let stations decide for themselves, and pay for that freedom in collisions.',
      narration: 'One channel, many stations, nobody in charge. Medium access control is the set of rules for sharing it, and random access means each station decides for itself when to send.',
      keyword: 'medium access control',
      trap: 'MAC here means medium access control, not a hardware address. GATE uses the same three letters for both.'
    },
    {
      id: 'aloha-2', scene: 'aloha', start: 157.5, end: 165,
      caption: 'Pure ALOHA: transmit at will. A frame is safe only if no other frame starts within one frame time of it.',
      detail: 'The vulnerable period is two frame times, one before the start and one after. That doubling is the whole difference between the two ALOHA variants.',
      narration: 'Pure ALOHA says send whenever you like. A frame survives only if no other frame begins within one frame time before it or after it, so the vulnerable window is two frame times wide.',
      keyword: 'vulnerable period 2T',
      trap: 'The window is two frame times, not one. The overlap can start just before your frame and still destroy it.'
    },
    {
      id: 'aloha-3', scene: 'aloha', start: 165, end: 172.5,
      caption: 'Slotted ALOHA halves the window, because a frame may only start at a slot boundary.',
      detail: 'With slots the vulnerable period is one frame time, so the same offered load yields twice the throughput. The cost is synchronisation and a one-slot delay for every frame.',
      narration: 'Slotted ALOHA forces every frame to start at a slot boundary, which halves the window to one frame time and doubles the achievable throughput. The price is synchronisation and up to one slot of delay.',
      keyword: 'one frame time',
      trap: 'Slots do not remove collisions. Two stations that pick the same slot still collide completely.'
    },
    {
      id: 'aloha-4', scene: 'aloha', start: 172.5, end: 180,
      caption: 'Maximum throughput: 18.4 percent for pure, 36.8 percent for slotted, both at the sweet spot load.',
      detail: 'Pure ALOHA throughput is G times e to the minus 2G, maximised at G equal to 0.5 giving 1 over 2e. Slotted is G times e to the minus G, maximised at G equal to 1 giving 1 over e. The simulation on this page reproduces both within a percent.',
      narration: 'The ceilings are exact. Pure ALOHA peaks at one over two e, about eighteen point four percent, when the offered load is one half. Slotted peaks at one over e, about thirty-six point eight percent, when the load is one.',
      keyword: '1 over 2e and 1 over e',
      trap: 'Those percentages are maxima, not the throughput at every load. At light load both protocols do much better than the peak figure suggests.'
    },

    /* ---------------- scene 7: CSMA ---------------- */
    {
      id: 'csma-1', scene: 'csma', start: 180, end: 187.5,
      caption: 'Carrier sense: listen before you talk. Most collisions come from not having heard yet.',
      detail: 'A station that senses the channel busy waits. That removes collisions with transmissions already in progress, which is most of what ALOHA loses.',
      narration: 'Carrier sense means listening before talking. If the channel is busy, wait. That alone removes collisions with frames already in progress, which is where ALOHA loses most of its capacity.',
      keyword: 'listen before talking',
      trap: 'Sensing cannot see a transmission that has not arrived yet. That delay is what still allows collisions.'
    },
    {
      id: 'csma-2', scene: 'csma', start: 187.5, end: 195,
      caption: 'The window is one propagation delay, not two: only frames started within tau of yours hurt you.',
      detail: 'A station that begins after your first bit has reached it would have heard you, so it waits. Only a station that started before your signal arrived can collide, and that window is one tau wide.',
      narration: 'Because everyone listens, only a station that started before your first bit reached it can hurt you. That window is one propagation delay wide, half of the ALOHA window, so carrier sense roughly doubles the ceiling again.',
      keyword: 'vulnerable window tau',
      trap: 'GATE CSE 2018 Q55 is exactly this window: a five-unit sensing period against a propagation delay of d over ten.'
    },
    {
      id: 'csma-3', scene: 'csma', start: 195, end: 202.5,
      caption: 'Collision detection needs the sender still transmitting when the echo of the collision returns.',
      detail: 'The worst case is the station at the far end starting just before your first bit arrives. You learn of the collision one full round trip after you began, so the frame must last at least that long.',
      narration: 'Collision detection adds a requirement. You only learn about a collision when the corrupted signal returns, which is one round trip after you began. So your frame must still be going out at that moment.',
      keyword: 'one round trip',
      trap: 'This is why the rule has a two in it. The condition is about a round trip, and the propagation delay in the formula is one way.'
    },
    {
      id: 'csma-4', scene: 'csma', start: 202.5, end: 210,
      caption: 'So the minimum frame size is twice the one-way propagation delay times the rate: L at least 2 tau R.',
      detail: 'GATE CSE 2015 Set 3 Q6 runs the inequality backwards: with a 1250-byte frame at 100 Mbps over one kilometre, the speed must be 20000 km per second. That is exactly the standard Ethernet propagation speed.',
      narration: 'That gives the formula to memorise. The frame must be at least twice the one-way propagation delay multiplied by the rate. GATE 2015 Set 3 question 6 turns it around and solves for the signal speed.',
      keyword: 'L at least 2 tau R',
      trap: 'Doubling the cable length doubles the minimum frame. Doubling the rate does too, which is why gigabit Ethernet had to extend the frame, not shorten it.'
    },

    /* ---------------- scene 8: Ethernet ---------------- */
    {
      id: 'eth-1', scene: 'ethernet', start: 210, end: 217.5,
      caption: 'An 802.3 frame: destination, source, type or length, payload, and a four-byte CRC.',
      detail: 'Fourteen bytes of header plus a four-byte frame check sequence is eighteen bytes of overhead. The payload runs from 46 bytes to 1500 bytes, and that upper bound is the familiar MTU.',
      narration: 'The Ethernet frame carries a destination address, a source address, a type or length field, the payload, and a four-byte CRC. Eighteen bytes of overhead in total, with a payload between forty-six and fifteen hundred bytes.',
      keyword: 'eighteen bytes of overhead',
      trap: 'The preamble and the start-of-frame delimiter are transmitted but are not part of the frame length that the 64-byte minimum refers to.'
    },
    {
      id: 'eth-2', scene: 'ethernet', start: 217.5, end: 225,
      caption: 'Sixty-four bytes minimum, because 512 bit times is the slot time that brackets a round trip.',
      detail: 'At 10 Mbps, 512 bit times is 51.2 microseconds. A 2500-metre network at two hundred thousand kilometres per second has a round trip of 25 microseconds, and the rest of the budget covers repeaters and transceivers.',
      narration: 'The minimum frame is sixty-four bytes, which at ten megabits is 512 bit times, or 51.2 microseconds. A 2500-metre segment has a round trip of about 25 microseconds, and the remaining margin pays for repeaters and transceivers.',
      keyword: 'slot time 512 bit times',
      trap: 'A short payload is padded to 46 bytes, not dropped. A frame shorter than 64 bytes is a runt and is discarded by the receiver.'
    },
    {
      id: 'eth-3', scene: 'ethernet', start: 225, end: 232.5,
      caption: 'After a collision the station waits a random number of slots, doubling the window each time.',
      detail: 'After the k-th collision the wait is a random integer of slot times from zero to 2 to the k minus one. The window doubles, so the chance of colliding again falls sharply.',
      narration: 'After a collision the station picks a random number of slot times to wait, from zero up to two to the k minus one after the k-th collision. The window doubles each time, so a repeat collision becomes much less likely.',
      keyword: 'binary exponential backoff',
      trap: 'This is randomised waiting, not a schedule. Two stations can still pick the same slot, which is why collisions do not vanish, only become rare.'
    },
    {
      id: 'eth-4', scene: 'ethernet', start: 232.5, end: 240,
      caption: 'A switch gives each port its own collision domain; a hub does not.',
      detail: 'A hub repeats every bit to every port, so all ports share one collision domain and one CSMA/CD regime. A switch buffers and forwards only where needed, so each port is its own domain and full duplex becomes possible.',
      narration: 'One more distinction. A hub repeats every bit to every port, so the whole hub is one collision domain. A switch forwards per port, so each port is its own domain and can run full duplex with no collisions at all.',
      keyword: 'collision domain',
      trap: 'A switch does not merge collision domains; it splits them. A broadcast domain is a different question, and a switch does not split that.'
    },

    /* ---------------- scene 9: the arithmetic ---------------- */
    {
      id: 'arith-1', scene: 'arith', start: 240, end: 247.5,
      caption: 'Write down tau, R, L and v before touching any formula.',
      detail: 'Almost every lost mark here is a unit or a factor-of-two error. Kilometres against metres, bytes against bits, and one-way against round trip.',
      narration: 'Start by writing the four quantities: the one-way propagation delay, the rate, the frame size and the signal speed. Almost every lost mark in this clause is a unit error or a missing factor of two.',
      keyword: 'units first',
      trap: 'A rate in Mbps is a power of ten. A distance in kilometres must become metres before it meets metres per second.'
    },
    {
      id: 'arith-2', scene: 'arith', start: 247.5, end: 255,
      caption: 'Minimum frame size: L equals 2 tau R. Given any three, the fourth follows.',
      detail: 'GATE CSE 2015 Set 3 Q6 supplies L, R and the distance, and asks for the speed: 1250 bytes at 100 Mbps over 1 km gives 20000 kilometres per second, which is the standard figure.',
      narration: 'The formula is one line, and GATE has asked it in both directions. Given the frame size, the rate and the distance, solve for the speed. That is question 6 of GATE 2015 Set 3, and the answer is 20000 kilometres per second.',
      keyword: 'solve for whichever is missing',
      trap: 'The distance in the question is one way. The formula\'s factor of two is the round trip, so do not double the distance twice.'
    },
    {
      id: 'arith-3', scene: 'arith', start: 255, end: 262.5,
      caption: 'The ratio a equals tau over transmission time. Small a means efficient.',
      detail: 'A stop-and-wait exchange is busy for one frame time and idle for one round trip, so its utilisation is 1 over 1 plus 2a. The same ratio governs why CSMA/CD works on a LAN and fails on a satellite link.',
      narration: 'The second quantity is the ratio a, the propagation delay divided by the transmission time of one frame. A stop-and-wait exchange is busy for one frame time and idle for a round trip, so its utilisation is one over one plus two a.',
      keyword: 'a equals tau over Tt',
      trap: 'a is a ratio of two times, so it is dimensionless. Writing it in seconds is a signal that something has gone wrong.'
    },
    {
      id: 'arith-4', scene: 'arith', start: 262.5, end: 270,
      caption: 'Payload efficiency: 46 of 64 bytes at the minimum, 1500 of 1518 at the maximum.',
      detail: 'At the minimum frame the overhead is 28 percent of the frame; at the maximum it is about 1.2 percent. That is why bulk transfer uses full-size frames and why small frames cost the network real capacity.',
      narration: 'One more number worth having. At the minimum frame only forty-six of sixty-four bytes are payload, so twenty-eight percent of the wire is overhead. At the maximum frame it is about one percent.',
      keyword: 'payload efficiency',
      trap: 'The overhead includes the four-byte CRC. Leaving it out gives 14 of 64 instead of 18 of 64.'
    },

    /* ---------------- scene 10: the procedure ---------------- */
    {
      id: 'decide-1', scene: 'decide', start: 270, end: 277.5,
      caption: 'Step one: is the question about detecting, correcting, or sharing?',
      detail: 'Detection questions name parity, checksum or CRC. Correction questions name Hamming distance or a code. Sharing questions name ALOHA, CSMA or Ethernet. Naming the family picks the whole toolbox.',
      narration: 'Step one is to name the family. Detecting means parity, checksum or CRC. Correcting means Hamming distance and a code. Sharing means ALOHA, carrier sense or Ethernet. Each family has its own short list of formulas.',
      keyword: 'name the family',
      trap: 'A question can mix families. "What is the minimum frame size so that collisions are detected" is a sharing question answered with a detection requirement.'
    },
    {
      id: 'decide-2', scene: 'decide', start: 277.5, end: 285,
      caption: 'Step two: for detection, ask what the generator or the code guarantees, not what it hopes.',
      detail: 'For a CRC, the degree gives the guaranteed burst length and the constant term gives burst detection at all. For a code, d min gives detection and correction capability through the two inequalities.',
      narration: 'Step two, for a detection question: ask what is guaranteed. For a CRC the degree bounds the burst length and the constant term is what makes bursts detectable. For a code, the minimum distance gives both capabilities through the two inequalities.',
      keyword: 'what is guaranteed',
      trap: 'A generator of degree r does not guarantee catching every burst of length r plus one. It guarantees up to r.'
    },
    {
      id: 'decide-3', scene: 'decide', start: 285, end: 292.5,
      caption: 'Step three: for a sharing question, find tau, then decide whether detection is required.',
      detail: 'If the station detects collisions, the round trip enters and the answer carries a factor of two. If it only senses, as in the 2018 question, only one propagation delay enters.',
      narration: 'Step three, for a sharing question: compute the propagation delay first, then decide whether the protocol detects collisions. If it does, the round trip enters and the answer carries a factor of two. If it only senses, one delay enters.',
      keyword: 'factor of two or not',
      trap: 'That single decision separates the 2015 answer from the 2018 answer. Both use the same distance and speed; only the protocol differs.'
    },
    {
      id: 'decide-4', scene: 'decide', start: 292.5, end: 300,
      caption: 'Step four: convert back to the unit asked for, then check the magnitude.',
      detail: 'Kilometres per second against metres per second, bytes against bits, percent against fraction. A right method with the wrong unit still scores zero.',
      narration: 'Step four: convert back to the unit the question asks for, then sanity-check the magnitude against the dominant term. A correct method with the wrong unit still scores nothing.',
      keyword: 'convert back'
    }
  ]
};
