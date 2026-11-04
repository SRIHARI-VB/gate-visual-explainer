/* ==========================================================================
   tcp-window-scaling-and-timestamps — THE timeline.
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
      id: 'ceiling',
      n: 1,
      title: 'The wall at 65,535 bytes',
      start: 0, end: 30,
      objective: 'State the size of the TCP window field, convert it into a throughput ceiling for three round-trip times, and see that the ceiling is set by the field width and not by the link.'
    },
    {
      id: 'bdp',
      n: 2,
      title: 'The window is a pipe, and the pipe has a length',
      start: 30, end: 60,
      objective: 'Define the bandwidth-delay product, show that a window smaller than it leaves the link idle, and compute the window three different links need.'
    },
    {
      id: 'shift',
      n: 3,
      title: 'One shift count, thirty bits of window',
      start: 60, end: 90,
      objective: 'Read the scaling rule SEG.WND left-shifted by the shift count, walk the ladder from 0 to 14, and reach the 1 GiB top of the range.'
    },
    {
      id: 'why14',
      n: 4,
      title: 'Why the limit is fourteen and not sixteen',
      start: 90, end: 120,
      objective: 'Derive the bound from the sequence-number test: twice the maximum window must stay below 2^31, so the window must stay below 2^30, and only shift counts up to 14 satisfy that.'
    },
    {
      id: 'handshake',
      n: 5,
      title: 'The offer in the SYN, and the field that is not scaled',
      start: 120, end: 150,
      objective: 'Show the three-byte option in the handshake, the rule that both sides must send it, and the exception that the window field of a SYN segment is never scaled.'
    },
    {
      id: 'sides',
      n: 6,
      title: 'Two counters, one for each direction',
      start: 150, end: 180,
      objective: 'Separate the shift count you send from the shift count you receive, and compute the eight-fold error of applying your own to the peer\'s window field.'
    },
    {
      id: 'choosing',
      n: 7,
      title: 'Choosing your own shift count',
      start: 180, end: 210,
      objective: 'Compute the smallest shift that covers a receive buffer, catch the 1 MiB case where the obvious answer is sixteen bytes short, and see the four-gigabyte buffer clamped at 1 GiB.'
    },
    {
      id: 'tsopt',
      n: 8,
      title: 'The ten-byte timestamps option',
      start: 210, end: 240,
      objective: 'Read the timestamps option, count what it costs in the header, and name its two jobs: measuring a round trip and rejecting a wrapped duplicate.'
    },
    {
      id: 'paws',
      n: 9,
      title: 'PAWS: rejecting a segment from the past',
      start: 240, end: 270,
      objective: 'Apply the modular comparison to three incoming timestamps, see which are rejected and which survive a wraparound, and read the two numbers that bound the timestamp clock.'
    },
    {
      id: 'karn',
      n: 10,
      title: 'Why the timestamp makes Karn\'s rule optional',
      start: 270, end: 300,
      objective: 'Show that the echoed timestamp identifies which copy an acknowledgement answered, compute the sample that timestamps recover, state the rule that blocks an inflated sample, and collect the five slips.'
    }
  ],

  events: [
    /* ---------- scene 1: the ceiling ---------- */
    {
      id: 'e1a', scene: 'ceiling', start: 0, end: 7.5,
      caption: 'The TCP window field is sixteen bits, so the largest value it can carry is 65,535 bytes.',
      detail: 'The window field in the TCP header is 16 bits wide. Sixteen bits hold the values 0 to 65,535, so the largest advertised window in an unextended connection is 65,535 bytes, which is 64 KiB minus one byte.',
      narration: 'Every TCP header carries a window field. It is sixteen bits wide, so the largest number it can hold is sixty-five thousand five hundred and thirty-five. That is the whole receive window, in bytes, with no extension.',
      keyword: 'sixteen bits'
    },
    {
      id: 'e1b', scene: 'ceiling', start: 7.5, end: 15,
      caption: 'A window is bytes in flight, so window divided by round-trip time is the throughput ceiling.',
      detail: 'A sender may have at most one window of unacknowledged data on the path. The path carries that window once per round trip, so the rate is window divided by round-trip time, in bytes per second. Multiplying by eight gives bits per second.',
      narration: 'A window is the number of bytes that may be in flight at once. The path delivers one window per round trip, so the most the connection can carry is the window divided by the round trip. Multiply by eight for bits.',
      keyword: 'throughput ceiling'
    },
    {
      id: 'e1c', scene: 'ceiling', start: 15, end: 22.5,
      caption: 'On a 100 ms path the ceiling is 5,242,800 bits per second, about 5.24 Mbit/s, whatever the link can do.',
      detail: '65,535 bytes divided by 0.1 seconds is 655,350 bytes per second, and times eight that is 5,242,800 bits per second. The same window on a 10 ms path gives 52,428,000 bits per second, and on a one-second path 524,280 bits per second.',
      narration: 'Here is the arithmetic on a hundred-millisecond path. Sixty-five thousand five hundred and thirty-five bytes per hundred milliseconds is five million two hundred and forty-two thousand eight hundred bits per second. Five point two megabits, no matter how fast the fibre is.',
      keyword: '5,242,800'
    },
    {
      id: 'e1d', scene: 'ceiling', start: 22.5, end: 30,
      caption: 'The ceiling is a property of the header, not of the network: a faster link or a longer path makes it worse.',
      detail: 'Shortening the round trip raises the ceiling proportionally, and lengthening it lowers the ceiling. Raising the link rate does nothing at all, because the limit is the number of bytes the receiver is allowed to leave unacknowledged.',
      narration: 'So the ceiling belongs to the header, not to the network. A faster link does not move it. A longer path makes it worse. That is the wall the extension exists to break, and it is broken by spending three bytes in the handshake.',
      keyword: 'property of the header',
      trap: 'A question that gives you a 1 Gbit/s link and a 100 ms round trip and asks for the throughput of an unscaled connection wants 5.24 Mbit/s, not 1 Gbit/s.'
    },

    /* ---------- scene 2: the pipe ---------- */
    {
      id: 'e2a', scene: 'bdp', start: 30, end: 37.5,
      caption: 'Bandwidth times delay is the amount of data the path can hold: the bandwidth-delay product.',
      detail: 'A path of rate B bits per second and round-trip time R holds B times R bits in transit, which is B times R divided by eight bytes. That quantity is the bandwidth-delay product, and a window smaller than it cannot fill the pipe.',
      narration: 'Picture the path as a pipe. Its rate is the bandwidth, its length is the delay, and the water inside it is the bandwidth-delay product: rate times delay. A window smaller than that water cannot fill the pipe, and part of the link stays idle.',
      keyword: 'bandwidth-delay product'
    },
    {
      id: 'e2b', scene: 'bdp', start: 37.5, end: 45,
      caption: 'At 1 Gbit/s over 100 ms the pipe holds 12,500,000 bytes, and 65,535 bytes is about one two-hundredth of it.',
      detail: 'One gigabit per second times 0.1 seconds is 100,000,000 bits, which is 12,500,000 bytes. Dividing by 65,535 gives 190.7, so an unscaled window fills roughly one part in 191 of the pipe.',
      narration: 'One gigabit per second across a hundred milliseconds holds a hundred million bits, which is twelve and a half million bytes. An unscaled window is sixty-five thousand bytes, so it fills about one hundred and ninetieth of the pipe. The rest is idle.',
      keyword: '12,500,000'
    },
    {
      id: 'e2c', scene: 'bdp', start: 45, end: 52.5,
      caption: 'Three links, three required windows: 250,000 bytes, 12,500,000 bytes and 62,500,000 bytes.',
      detail: 'At 100 Mbit/s over 20 ms the product is 250,000 bytes; at 1 Gbit/s over 100 ms it is 12,500,000 bytes; at 10 Gbit/s over 50 ms it is 62,500,000 bytes. Each is larger than 65,535 bytes, so each needs an extension.',
      narration: 'Three examples. A hundred megabits over twenty milliseconds needs a quarter of a million bytes. A gigabit over a hundred milliseconds needs twelve and a half million. Ten gigabits over fifty milliseconds needs sixty-two and a half million. All three are past the wall.',
      keyword: 'three required windows'
    },
    {
      id: 'e2d', scene: 'bdp', start: 52.5, end: 60,
      caption: 'So the question the extension answers is: how do you name a window larger than 65,535 using a sixteen-bit field?',
      detail: 'The field cannot grow without breaking every existing implementation, and the header has a fixed layout. The only way out is to keep the sixteen-bit field and agree, in the handshake, on a multiplier that both sides apply.',
      narration: 'The field cannot grow, and the header layout cannot move. So the extension keeps the sixteen-bit field and agrees, during the handshake, on a multiplier. That agreement is one byte long and it is worth a factor of sixteen thousand.',
      keyword: 'a multiplier'
    },

    /* ---------- scene 3: the shift ---------- */
    {
      id: 'e3a', scene: 'shift', start: 60, end: 67.5,
      caption: 'The window scale option carries one number, a shift count, and the true window is the field shifted left by it.',
      detail: 'The option is three bytes: kind 3, length 3, and a shift count. The true receive window is the field value multiplied by two to the power of the shift count, which is the same as shifting the field left by that many bits.',
      narration: 'The option is three bytes: a kind, a length, and one number called the shift count. The true window is the field value shifted left by that many bits. Shift left by three and the field means eight times as much.',
      keyword: 'shift count'
    },
    {
      id: 'e3b', scene: 'shift', start: 67.5, end: 75,
      caption: 'Shift 0 keeps 65,535 bytes; shift 8 reaches 16,776,960; shift 14 reaches 1,073,725,440 bytes, about 1 GiB.',
      detail: 'The maximum window at a shift count of s is 65,535 times two to the s. At 8 that is 16,776,960 bytes, which covers the 12,500,000-byte pipe of the previous scene. At 14 it is 1,073,725,440 bytes.',
      narration: 'Here is the ladder. Shift zero keeps sixty-five thousand bytes. Shift eight gives sixteen million seven hundred and seventy-six thousand nine hundred and sixty, which covers the gigabit pipe. Shift fourteen gives one thousand and seventy-three million bytes, about a gibibyte.',
      keyword: '16,776,960'
    },
    {
      id: 'e3c', scene: 'shift', start: 75, end: 82.5,
      caption: 'The top of the range is 2^30 minus 2^14, which is 16,384 bytes short of exactly one gibibyte.',
      detail: '65,535 is 2^16 minus 1, so 65,535 times 2^14 is 2^30 minus 2^14. That is 1,073,725,440 bytes, and 2^30 is 1,073,741,824, so the top window is 16,384 bytes short of one gibibyte.',
      narration: 'One detail worth carrying. The top window is not exactly a gibibyte. It is one thousand and seventy-three million, seven hundred and twenty-five thousand, four hundred and forty bytes, which is sixteen thousand three hundred and eighty-four short. The missing piece is the one in two to the sixteenth minus one.',
      keyword: '16,384 bytes short'
    },
    {
      id: 'e3d', scene: 'shift', start: 82.5, end: 90,
      caption: 'At shift 14 and a 100 ms path the ceiling becomes 85,898,035,200 bits per second, about 85.9 Gbit/s.',
      detail: '1,073,725,440 bytes divided by 0.1 seconds is 10,737,254,400 bytes per second, and times eight that is 85,898,035,200 bits per second. The ceiling rose by a factor of 16,384, which is exactly two to the fourteenth.',
      narration: 'The ceiling moves with it. On the same hundred-millisecond path, shift fourteen gives eighty-five thousand million bits per second, about eighty-five point nine gigabits. The factor is sixteen thousand three hundred and eighty-four, exactly two to the fourteenth.',
      keyword: '85.9 Gbit/s'
    },

    /* ---------- scene 4: why 14 ---------- */
    {
      id: 'e4a', scene: 'why14', start: 90, end: 97.5,
      caption: 'TCP decides old from new by asking whether a sequence number is within 2^31 of the left edge of the window.',
      detail: 'The receiver tests an arriving segment by comparing its sequence number with the left edge of the window. Any distance up to 2^31 counts as forward, and anything further counts as old. The test is a modular comparison over a 32-bit space.',
      narration: 'Why stop at fourteen? Because of a test TCP already has. It decides whether a segment is new or old by asking whether its sequence number is within two to the thirty-first of the left edge of the window. That is how a thirty-two-bit space is read as a line.',
      keyword: 'within 2^31'
    },
    {
      id: 'e4b', scene: 'why14', start: 97.5, end: 105,
      caption: 'The sender and receiver windows can be out of phase by one window, so twice the maximum window must stay below 2^31.',
      detail: 'The left edge of one window can sit as far as one window away from the right edge of the other, so the safe condition is that twice the maximum window is less than 2^31. That is the same as saying the maximum window is less than 2^30.',
      narration: 'The two windows can drift apart by a whole window, so the condition is on twice the maximum window: it must stay below two to the thirty-first. Halve it and the maximum window must stay below two to the thirtieth.',
      keyword: 'twice the maximum window'
    },
    {
      id: 'e4c', scene: 'why14', start: 105, end: 112.5,
      caption: 'Shift 14 gives 2,147,450,880 for twice the window, which clears 2^31 by 32,768 bytes; shift 15 overshoots it.',
      detail: 'Twice the maximum window at shift 14 is 2,147,450,880, and 2^31 is 2,147,483,648, so the margin is 32,768 bytes. At shift 15 twice the window is 4,294,901,760, which is past 2^31, so the test would be ambiguous.',
      narration: 'At shift fourteen, twice the window is two thousand one hundred and forty-seven million, four hundred and fifty thousand, eight hundred and eighty. That clears the limit by thirty-two thousand seven hundred and sixty-eight bytes. At shift fifteen it doubles past the limit, and the test breaks.',
      keyword: '32,768 bytes'
    },
    {
      id: 'e4d', scene: 'why14', start: 112.5, end: 120,
      caption: 'So 14 is the largest shift that works, and a peer that sends more must be read as 14.',
      detail: 'The rule in the document is that a received shift count larger than 14 is logged as an error and treated as 14. That is safe because a sender is always free to use less than the window it is offered.',
      narration: 'So fourteen is the largest shift that keeps the test unambiguous, and the document fixes it there. If a peer sends more, you log the error and use fourteen, because a sender is always free to use less than it is offered.',
      keyword: 'treated as 14'
    },

    /* ---------- scene 5: the handshake ---------- */
    {
      id: 'e5a', scene: 'handshake', start: 120, end: 127.5,
      caption: 'The option is sent in the handshake only, and both sides must send it for scaling to be used in either direction.',
      detail: 'The window scale option is three bytes with kind 3 and length 3. It is an offer, not a promise: scaling is enabled in either direction only if both segments of the handshake carry it. It is never sent again on an established connection.',
      narration: 'The option is three bytes, kind three, length three. It goes in the handshake and nowhere else. And it is an offer, not a promise: unless both sides send it, neither direction is scaled. Once the connection is open, the number is fixed.',
      keyword: 'both sides must send it'
    },
    {
      id: 'e5b', scene: 'handshake', start: 127.5, end: 135,
      caption: 'The window field of a SYN segment is never scaled, so the 65,535 in the handshake is 65,535 and not 8,388,480.',
      detail: 'The document states that the window field in a segment where the SYN bit is set must not be scaled. Reading the handshake window with the negotiated shift is therefore wrong, and at shift 7 it overstates the window by a factor of 128.',
      narration: 'Here is the exception that catches people. The window field in a SYN segment is never scaled. So the sixty-five thousand five hundred and thirty-five in the handshake means sixty-five thousand five hundred and thirty-five. Multiply it by shift seven and you are wrong by a factor of one hundred and twenty-eight.',
      keyword: 'never scaled',
      trap: 'Reading the SYN or SYN,ACK window field with the negotiated shift is the single most common window-scaling mistake in an exam answer.'
    },
    {
      id: 'e5c', scene: 'handshake', start: 135, end: 142.5,
      caption: 'Two hosts with buffers of 8,000,000 and 1,000,000 bytes choose shifts 7 and 4.',
      detail: 'The shift is chosen from the receive buffer, before the connection opens, and it is fixed for the life of the connection. A buffer of 8,000,000 bytes needs shift 7, because shift 6 reaches only 4,194,240. A buffer of 1,000,000 bytes needs shift 4, because shift 3 reaches only 524,280.',
      narration: 'Two hosts. The first can buffer eight million bytes, so it needs shift seven, because shift six reaches only four million. The second can buffer one million, so it needs shift four, because shift three reaches only half a million. Each states its own shift in its own handshake segment.',
      keyword: 'shifts 7 and 4'
    },
    {
      id: 'e5d', scene: 'handshake', start: 142.5, end: 150,
      caption: 'Both then advertise the same field value, 62,500, and it means 8,000,000 bytes from one side and 1,000,000 from the other.',
      detail: '8,000,000 right-shifted by 7 is 62,500, and 1,000,000 right-shifted by 4 is also 62,500. The same sixteen-bit number in the two directions means two different windows, because the two shift counts differ by three.',
      narration: 'Now watch the fields. Eight million right-shifted by seven is sixty-two thousand five hundred. One million right-shifted by four is also sixty-two thousand five hundred. The same number in both directions, and it means eight times more in one of them.',
      keyword: '62,500'
    },

    /* ---------- scene 6: two counters ---------- */
    {
      id: 'e6a', scene: 'sides', start: 150, end: 157.5,
      caption: 'Each connection keeps two shift counters: the one you send your own window with, and the one you read the peer\'s with.',
      detail: 'The receive shift is applied to your outgoing window field, which you right-shift before transmission. The send shift is the peer\'s, applied to every incoming window field, which you left-shift before use. Two counters, two directions, and neither is the other.',
      narration: 'Every connection keeps two shift counters, and they are not the same number. One is yours, applied to the window you send. The other is your peer\'s, applied to the window you receive. Mixing them up is the second mistake.',
      keyword: 'two shift counters'
    },
    {
      id: 'e6b', scene: 'sides', start: 157.5, end: 165,
      caption: 'The receiver right-shifts what it sends, and the sender left-shifts what it receives, by the peer\'s count.',
      detail: 'The outgoing rule is the field equals the true window right-shifted by your own count. The incoming rule is the true window equals the field left-shifted by the peer\'s count. The right shift is lossy and the left shift is exact.',
      narration: 'Outgoing, you right-shift your true window by your own count before putting it in the header. Incoming, you left-shift the field by your peer\'s count before you use it. The right shift throws bits away; the left shift costs nothing.',
      keyword: 'right-shifts what it sends'
    },
    {
      id: 'e6c', scene: 'sides', start: 165, end: 172.5,
      caption: 'The first host reads 62,500 with its own shift 7 and gets 8,000,000, eight times the true 1,000,000.',
      detail: 'The field is 62,500 and the peer\'s count is 4, so the true window is 1,000,000. Applying its own count of 7 gives 8,000,000. The error factor is two to the difference of the counts, which is two cubed, or eight.',
      narration: 'The first host receives sixty-two thousand five hundred. The peer said shift four, so the window is one million. Use your own shift seven instead and you read eight million. The error is two to the difference of the counts, so here exactly eight times.',
      keyword: 'eight times',
      trap: 'An error factor is two to the difference of the two shift counts, not two to either count on its own.'
    },
    {
      id: 'e6d', scene: 'sides', start: 172.5, end: 180,
      caption: 'The scale applies to the window field only: the congestion window is kept as a local number and is never scaled.',
      detail: 'The document says the scale factor applies only to the window field as transmitted, and that each implementation keeps its window values locally as thirty-two-bit numbers. The congestion window computed by slow start and congestion avoidance is therefore not scaled, so scaling adds no quantisation to it.',
      narration: 'One more boundary. The scale applies to the window field only. The congestion window is a local thirty-two-bit number and is never scaled, so scaling does not quantise it. If a question asks which window is multiplied by two to the shift, the answer is the advertised one.',
      keyword: 'window field only'
    },

    /* ---------- scene 7: choosing your shift ---------- */
    {
      id: 'e7a', scene: 'choosing', start: 180, end: 187.5,
      caption: 'The shift is chosen from the receive buffer before the connection opens: the smallest count whose maximum window covers it.',
      detail: 'The maximum window at count s is 65,535 times two to the s. The smallest s whose maximum is at least the buffer is the one to advertise, because a larger count than necessary wastes resolution and a smaller one cannot describe the buffer.',
      narration: 'So how is your own count chosen? From your receive buffer, before the connection opens. Take the smallest count whose maximum window is at least the buffer. Larger than necessary wastes resolution; smaller than necessary cannot describe the buffer at all.',
      keyword: 'smallest count'
    },
    {
      id: 'e7b', scene: 'choosing', start: 187.5, end: 195,
      caption: 'A one-mebibyte buffer looks like shift 4, since 2^16 is 65,536, but shift 4 reaches only 1,048,560 bytes.',
      detail: '1,048,576 divided by 65,535 is 16.00024, so the obvious answer is shift 4, because sixteen is two to the fourth. But the maximum at shift 4 is 65,535 times 16, which is 1,048,560, and that is sixteen bytes short of the buffer.',
      narration: 'Take a buffer of one mebibyte, one million forty-eight thousand five hundred and seventy-six bytes. Divide by sixty-five thousand five hundred and thirty-five and you get sixteen point zero zero zero two, so the obvious answer is shift four. But shift four reaches one million forty-eight thousand five hundred and sixty. Sixteen bytes short.',
      keyword: 'sixteen bytes short',
      trap: 'Dividing by 65,536 instead of 65,535 gives exactly 16 and the wrong shift; the shortfall appears only in the last bytes.'
    },
    {
      id: 'e7c', scene: 'choosing', start: 195, end: 202.5,
      caption: 'So the answer is 5, and the general rule is the smallest count with 65,535 times 2^s at least the buffer.',
      detail: 'Shift 5 reaches 2,097,120 bytes, which covers the buffer. The rule is stated as a comparison of maximum windows rather than as a division, because the division rounds in the wrong direction whenever the buffer is an exact power of two times 65,536.',
      narration: 'So the answer is five, and shift five reaches two million and change, which covers it. State the rule as a comparison of maximum windows, not as a division, because the division rounds the wrong way exactly when the buffer is a round number.',
      keyword: 'the answer is 5'
    },
    {
      id: 'e7d', scene: 'choosing', start: 202.5, end: 210,
      caption: 'A four-gigabyte buffer would need shift 17, which is clamped to 14, so only 1,073,725,440 bytes can be advertised.',
      detail: 'Four gibibytes divided by 65,535 is 65,537, whose logarithm to base two is just over 16, so the raw answer is 17. The count is limited to 14, so a four-gigabyte buffer can advertise at most 1,073,725,440 bytes, and the rest of the buffer is unusable by this connection.',
      narration: 'And the ceiling bites from above. A four-gigabyte buffer would want shift seventeen. The count is capped at fourteen, so the largest window that can be advertised is one thousand and seventy-three million bytes, about a gibibyte. The rest of the buffer cannot be used by this connection.',
      keyword: 'clamped to 14'
    },

    /* ---------- scene 8: the timestamps option ---------- */
    {
      id: 'e8a', scene: 'tsopt', start: 210, end: 217.5,
      caption: 'The timestamps option is ten bytes: a kind, a length, a four-byte value and a four-byte echo.',
      detail: 'The option is kind 8 with length 10, carrying two thirty-two-bit fields: the timestamp value, which is the sender\'s current clock, and the timestamp echo reply, which repeats a value the sender previously received.',
      narration: 'The second extension is ten bytes. Kind eight, length ten, then a four-byte timestamp value and a four-byte echo of a timestamp you received. Every segment can carry it, in both directions.',
      keyword: 'ten bytes'
    },
    {
      id: 'e8b', scene: 'tsopt', start: 217.5, end: 225,
      caption: 'It takes the header from 20 to 30 bytes, and with window scaling too, to 34; payload efficiency falls from 98.65 to 97.72 per cent.',
      detail: 'The base header is twenty bytes, and options are limited to forty, so the header can reach sixty. A ten-byte timestamps option gives thirty bytes, and with a three-byte window scale option padded to four it gives thirty-four. With 1,460 bytes of payload, efficiency falls from 98.6486 to 97.7242 per cent.',
      narration: 'The cost, in numbers. The base header is twenty bytes. Add the timestamps option and it is thirty. Add window scaling as well, padded to four bytes, and it is thirty-four. With fourteen hundred and sixty bytes of payload, efficiency drops from ninety-eight point six five to ninety-seven point seven two per cent.',
      keyword: '20 to 30 bytes'
    },
    {
      id: 'e8c', scene: 'tsopt', start: 225, end: 232.5,
      caption: 'The difference between the current clock and an echoed value is a round-trip sample, taken from almost every segment.',
      detail: 'The timestamp value comes from a clock that must tick between once per millisecond and once per second. Subtracting the echoed value from the current clock value gives a round-trip measurement, and because every segment can carry an echo, samples are available far more often than one per window.',
      narration: 'Its first job is measurement. The value comes from a clock ticking between once a millisecond and once a second. Subtract an echoed value from the current clock and you have a round trip. Because every segment can echo, you can sample almost every acknowledgement.',
      keyword: 'a round-trip sample'
    },
    {
      id: 'e8d', scene: 'tsopt', start: 232.5, end: 240,
      caption: 'The echo is one saved value per connection, updated only when the incoming value is at least it and the segment is within the last acknowledged byte.',
      detail: 'The connection keeps one slot, the recent timestamp, and one more, the last acknowledgement sent. An incoming value is copied into the slot only if it is at least the slot and its sequence number is at or below the last acknowledgement sent. Every outgoing option then echoes whatever the slot holds.',
      narration: 'You keep one saved value, not one per segment. An incoming timestamp replaces it only if it is at least as large and its sequence number is not beyond the last acknowledgement you sent. Every segment you send then echoes whatever is saved. One slot, one rule, ten bytes.',
      keyword: 'one saved value'
    },

    /* ---------- scene 9: PAWS ---------- */
    {
      id: 'e9a', scene: 'paws', start: 240, end: 247.5,
      caption: 'A connection at a gigabit per second uses up the whole sequence space in about 34 seconds, so old and new can collide.',
      detail: 'The sequence space is 2^32 bytes. At 1 Gbit/s that is 125,000,000 bytes per second, so the space is consumed in about 34.4 seconds. A segment delayed longer than that carries a sequence number that looks current, and the ordinary test cannot tell it from new data.',
      narration: 'The second job is protection. The sequence space is four thousand million bytes. At a gigabit per second a connection uses all of it in about thirty-four seconds. A segment delayed longer than that carries a sequence number that looks current, and the ordinary window test cannot tell it from new data.',
      keyword: 'about 34 seconds'
    },
    {
      id: 'e9b', scene: 'paws', start: 247.5, end: 255,
      caption: 'The test is modular: an arrival is older when the saved value minus it, modulo 2^32, lies between 1 and 2^31.',
      detail: 'Timestamps are thirty-two-bit unsigned numbers compared the way sequence numbers are. An arriving value s is older than a saved value t when the difference t minus s, computed modulo 2^32, is greater than zero and less than 2^31. No clock synchronisation between the two hosts is needed.',
      narration: 'So the timestamp is used as a serial number, not as a time. An arrival is older than the saved value when the saved value minus the arrival, modulo two to the thirty-second, lies between one and two to the thirty-first. Exactly the test TCP already uses on sequence numbers. The two clocks never have to agree.',
      keyword: 'modular'
    },
    {
      id: 'e9c', scene: 'paws', start: 255, end: 262.5,
      caption: 'A value 1,000 behind the saved 5,000,000 gives a difference of 1,000 and is rejected; 100 ahead gives 4,294,967,196 and is accepted.',
      detail: 'With the saved value at 5,000,000, an incoming 4,999,000 gives a difference of 1,000, which lies strictly between 0 and 2^31, so the segment is treated as old: acknowledge it and drop it. An incoming 5,000,100 gives a difference of 4,294,967,196, which is past 2^31, so the segment is new: it is accepted and becomes the saved value.',
      narration: 'Two arrivals. The saved value is five million. A segment carrying four million nine hundred and ninety-nine thousand is a thousand behind, and the modular difference is one thousand, which is in the backward half, so it is old: acknowledge it and drop it. One hundred ahead, and the difference is four thousand two hundred and ninety-four million, past the halfway mark, so it is new and it becomes the saved value.',
      keyword: '1,000',
      trap: 'The rejected segment still draws an acknowledgement. Dropping it silently is not what the rule says, because the acknowledgement is what detects a half-open connection.'
    },
    {
      id: 'e9d', scene: 'paws', start: 262.5, end: 270,
      caption: 'After the clock wraps the test still works, and a value saved before a wrap is discarded after 24 days of silence.',
      detail: 'With the saved value near the top of the space at 4,294,000,000, an incoming 100 gives a modular difference of 4,293,999,900, which is past 2^31, so it is accepted. The clock must tick at least once per 2^31 bytes sent and its sign bit wraps in 24.8 days at one millisecond per tick and 24,855 days at one second per tick, so the saved value is invalidated after 24 days of idleness.',
      narration: 'And the wrap is handled by the same test. With the saved value near the top of the space, an incoming hundred gives a difference of four thousand two hundred and ninety-three million, past the halfway mark, so it is accepted. The clock is bounded on both sides: a millisecond per tick wraps the sign bit in twenty-four point eight days, a second per tick in twenty-four thousand eight hundred. So a value saved before twenty-four days of silence is thrown away.',
      keyword: '24 days'
    },

    /* ---------- scene 10: Karn ---------- */
    {
      id: 'e10a', scene: 'karn', start: 270, end: 277.5,
      caption: 'Without timestamps a retransmission makes the next acknowledgement untimeable, which is why the sample is refused.',
      detail: 'A segment sent at 0 ms and retransmitted at 400 ms is acknowledged at 500 ms. The acknowledgement does not say which copy it answers, so the sample is either 500 ms or 100 ms, and the estimator refuses both and doubles the timer instead.',
      narration: 'Last scene, and the reason the option is worth its ten bytes. A segment goes out at zero, is retransmitted at four hundred, and is acknowledged at five hundred. That acknowledgement does not say which copy it answers. The sample is either five hundred or one hundred, and without help the estimator must refuse both and just double the timer.',
      keyword: 'untimeable'
    },
    {
      id: 'e10b', scene: 'karn', start: 277.5, end: 285,
      caption: 'With timestamps the echo names the copy: an echo of 1400 measures 100 ms, an echo of 1000 measures 500 ms.',
      detail: 'The retransmission carried a timestamp value of 1400, four hundred ticks after the original value of 1000. If the acknowledgement echoes 1400, the sample is 100 ms and it measures the retransmission. If it echoes 1000, the sample is 500 ms and it measures the original, which was delayed rather than lost.',
      narration: 'Now the echo tells you which. The retransmission carried fourteen hundred. If the acknowledgement echoes fourteen hundred, the sample is a hundred milliseconds and it measures the retransmission. If it echoes one thousand, the sample is five hundred and it measures the original, which was late rather than lost. Either way you have a measurement, and it is the right one.',
      keyword: 'the echo names the copy'
    },
    {
      id: 'e10c', scene: 'karn', start: 285, end: 292.5,
      caption: 'One guard remains: an echo may update the estimate only when the segment advances the left edge of the send window.',
      detail: 'In a one-way flow the receiving host can carry an echo in its own data segments, and a pause in its sending inflates the apparent round trip. On a 40 ms path with a 60 ms pause the difference reads 100 ms, two and a half times the truth. The rule blocks it, because such a segment advances no new data.',
      narration: 'One guard remains, and it is about echoes in the wrong direction. In a one-way flow the other host can carry an echo inside its own data. If it pauses sixty milliseconds on a forty-millisecond path, the difference reads a hundred, two and a half times the truth. The rule refuses that sample, because the segment acknowledges nothing new.',
      keyword: 'advances the left edge',
      trap: 'A timestamp echo is a candidate sample, not a sample: the acknowledgement must advance the left edge of the send window before the value is used.'
    },
    {
      id: 'e10d', scene: 'karn', start: 292.5, end: 300,
      caption: 'The five slips: a scaled SYN, the wrong shift, a divided buffer, a signed comparison, and a sample that acknowledges nothing.',
      detail: 'The five errors are the ones the model checks: scaling the window field of a SYN segment, applying your own shift count to the peer\'s field, choosing the shift by division instead of by comparison, comparing timestamps as signed numbers, and taking a round-trip sample from a segment that advances no new data.',
      narration: 'And the five slips that cost the mark. Scaling the window in the handshake. Reading the peer\'s field with your own shift. Choosing your shift by dividing instead of comparing. Comparing timestamps as signed numbers. And taking a sample from a segment that acknowledges nothing. Every one of them is computed and checked on this page.',
      keyword: 'five slips'
    }
  ]
};
