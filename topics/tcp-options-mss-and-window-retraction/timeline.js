/* ==========================================================================
   tcp-options-mss-and-window-retraction — THE timeline.
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
      id: 'budget',
      n: 1,
      title: 'The option space is forty bytes',
      start: 0, end: 30,
      objective: 'Read the data offset field as a count of 32-bit words, see that the TCP header runs from 20 to 60 bytes, and state the option budget as 40 bytes shared by every option.'
    },
    {
      id: 'sizes',
      n: 2,
      title: 'Four handshake options, nineteen bytes',
      start: 30, end: 60,
      objective: 'Add the lengths of MSS, window scale, SACK-permitted and timestamps, round the total up to a multiple of four, and read the header size that follows.'
    },
    {
      id: 'mss',
      n: 3,
      title: 'MSS = MTU minus the fixed headers',
      start: 60, end: 90,
      objective: 'Define the MSS option as a count of data octets only, compute it for four MTUs, and separate the IPv4 subtraction of 40 from the IPv6 subtraction of 60.'
    },
    {
      id: 'nodata',
      n: 4,
      title: 'Options do not lower the MSS; they lower the data',
      start: 90, end: 120,
      objective: 'State the RFC 6691 rule, show that 1460 advertised becomes 1440 sent with 20 bytes of options, and see the 20-byte overshoot that would force fragmentation.'
    },
    {
      id: 'ledger',
      n: 5,
      title: 'Spending the whole budget',
      start: 120, end: 150,
      objective: 'Add an 18-byte option to the 19 bytes already spent, reach exactly the 40-byte budget, and see that a further 4-byte option no longer fits.'
    },
    {
      id: 'granularity',
      n: 6,
      title: 'The window is counted in steps of 2^s',
      start: 150, end: 180,
      objective: 'Show that a scaled window field can only place the right edge on ACK plus a whole number of 2^s steps, and that the receiver\'s buffer end need not be such a point.'
    },
    {
      id: 'retraction',
      n: 7,
      title: 'The retraction: 1301 is past the buffer, 1173 is 127 short',
      start: 180, end: 210,
      objective: 'Walk the four rows of the RFC 7323 appendix example and show why the only two fields available are one byte too large and 127 bytes too small.'
    },
    {
      id: 'rules',
      n: 8,
      title: 'Three rules that make the shrink safe',
      start: 210, end: 240,
      objective: 'State the receiver\'s honour rule, the sender\'s first-retransmission allowance, the rule for later retransmissions, and the tracking a scaled receiver should keep.'
    },
    {
      id: 'cost',
      n: 9,
      title: 'The cost is bounded by 2^s minus one',
      start: 240, end: 270,
      objective: 'Bound the retraction at 2^s minus one bytes, read the 127-byte and 16,383-byte cases, and see why large steps make large shrinks.'
    },
    {
      id: 'consolidate',
      n: 10,
      title: 'Consolidation: the ledger, the arithmetic and the bound',
      start: 270, end: 300,
      objective: 'Collect the budget rule, the MSS rule, the data rule and the retraction bound, and name the five slips that cost a mark.'
    }
  ],

  events: [
    /* ---------- scene 1: the budget ---------- */
    {
      id: 'e1a', scene: 'budget', start: 0, end: 7.5,
      caption: 'The TCP header is twenty bytes of fixed fields, and a data offset field says how long it is.',
      detail: 'The fixed part of the TCP header is 20 bytes: source port, destination port, sequence number, acknowledgement number, a 4-bit data offset, reserved bits and flags, a 16-bit window, checksum and urgent pointer. A 4-bit data offset counts 32-bit words, so the header length is that value times four.',
      narration: 'Every TCP segment starts with twenty bytes of fixed fields. One of them is a small field called the data offset, and its whole job is to say how long the header is.',
      keyword: 'data offset'
    },
    {
      id: 'e1b', scene: 'budget', start: 7.5, end: 15,
      caption: 'Four bits hold 5 to 15 words, so the header is 20 to 60 bytes long.',
      detail: 'The data offset is four bits wide and counts 32-bit words, so its smallest legal value is 5 and its largest is 15. Five words is 20 bytes, which is the header with no options; fifteen words is 60 bytes, which is the header with the largest option area the format allows.',
      narration: 'Four bits can hold values five to fifteen. Counted in thirty-two-bit words, that is twenty bytes at the bottom and sixty at the top.',
      keyword: '20 to 60 bytes'
    },
    {
      id: 'e1c', scene: 'budget', start: 15, end: 22.5,
      caption: 'Sixty minus twenty is forty: every option in the connection shares one budget of 40 bytes.',
      detail: 'The option area is the part of the header beyond the fixed 20 bytes, so it is at most 40 bytes. Every option a connection uses — MSS, window scale, SACK-permitted, timestamps, and anything else — is paid for out of that single 40-byte budget.',
      narration: 'Sixty minus twenty is forty. That is the whole option area, and every option a connection uses has to fit inside it.',
      keyword: 'one budget of 40 bytes'
    },
    {
      id: 'e1d', scene: 'budget', start: 22.5, end: 30,
      caption: 'MSS, window scale, SACK-permitted and timestamps all want bytes from that same forty.',
      detail: 'The four options a modern connection negotiates in its handshake are the maximum segment size, the window scale, SACK-permitted and timestamps. Each is priced in bytes, and the sum is what the header grows by on every segment that carries them.',
      narration: 'Four options want those bytes: the maximum segment size, the window scale, SACK-permitted, and timestamps. Each one has a price in bytes, and the prices add up.',
      keyword: 'same forty',
      trap: 'A question that says options may be up to 40 bytes means the whole option area, not 40 bytes for each option.'
    },

    /* ---------- scene 2: the sizes ---------- */
    {
      id: 'e2a', scene: 'sizes', start: 30, end: 37.5,
      caption: 'MSS is kind 2 and four bytes; window scale is kind 3 and three bytes.',
      detail: 'The MSS option is kind 2, length 4: a kind byte, a length byte and a two-byte value. The window scale option is kind 3, length 3: a kind byte, a length byte and one byte holding the shift count.',
      narration: 'Here are the prices. The maximum segment size option is kind two and costs four bytes. The window scale option is kind three and costs three bytes.',
      keyword: 'kind 2 and four bytes'
    },
    {
      id: 'e2b', scene: 'sizes', start: 37.5, end: 45,
      caption: 'SACK-permitted is kind 4 and two bytes; timestamps is kind 8 and ten bytes.',
      detail: 'SACK-permitted is kind 4 with length 2, so it is a bare permission with no data. The timestamps option is kind 8 with length 10: two header bytes and two four-byte values, the sender\'s timestamp and the echo of the peer\'s.',
      narration: 'SACK-permitted is kind four and costs two bytes, because it carries no data at all. Timestamps is kind eight and costs ten: two for the header and eight for the two four-byte values.',
      keyword: 'kind 8 and ten bytes'
    },
    {
      id: 'e2c', scene: 'sizes', start: 45, end: 52.5,
      caption: 'Four plus three plus two plus ten is nineteen bytes of option data.',
      detail: 'The four lengths add to 19 bytes. That is the raw cost of the option list, before any padding, and it is well inside the 40-byte budget.',
      narration: 'Add them: four, three, two and ten. Nineteen bytes of option data. That is the raw price of the list.',
      keyword: 'nineteen bytes'
    },
    {
      id: 'e2d', scene: 'sizes', start: 52.5, end: 60,
      caption: 'The header must end on a four-byte boundary, so nineteen becomes twenty and the header is forty bytes.',
      detail: 'The data offset counts whole 32-bit words, so the option area is rounded up to a multiple of four: 19 becomes 20, and the header becomes 40 bytes. A stack that pads each option to its own word boundary, as the timestamps layout recommends with two no-operation bytes, spends 22 raw and 24 padded, giving a 44-byte header.',
      narration: 'The header has to end on a four-byte boundary, so nineteen becomes twenty and the header is forty bytes. A stack that pads each option separately spends twenty-four and gets a forty-four-byte header. Both are legal; the difference is four bytes of payload.',
      keyword: 'rounded up',
      trap: 'Sum the option lengths and round the total up to a multiple of four. Rounding each option up and then adding gives a different, larger answer.'
    },

    /* ---------- scene 3: the MSS ---------- */
    {
      id: 'e3a', scene: 'mss', start: 60, end: 67.5,
      caption: 'The MSS option says how much TCP data its sender can receive in one segment.',
      detail: 'The MSS option is sent by the host that will receive the data. Its value is the largest amount of TCP data that host is prepared to accept in a single segment. It is a sixteen-bit value carried in the handshake, and each direction has its own.',
      narration: 'The maximum segment size is a promise about receiving. It says: this is the most data I will take in one segment. Each side makes its own promise, and the two can differ.',
      keyword: 'how much TCP data'
    },
    {
      id: 'e3b', scene: 'mss', start: 67.5, end: 75,
      caption: 'It counts data only: not the TCP header, not the IP header.',
      detail: 'The MSS counts data octets. The TCP header, the IP header and any options are outside the count, which is why an MSS of 1460 on a 1500-byte link leaves room for exactly 20 bytes of IP header and 20 bytes of TCP header.',
      narration: 'The number counts data only. The headers are not in it. That is why an MSS of fourteen hundred and sixty fits a fifteen-hundred-byte link: twenty for IP, twenty for TCP, the rest for data.',
      keyword: 'data only'
    },
    {
      id: 'e3c', scene: 'mss', start: 75, end: 82.5,
      caption: 'So MSS = MTU minus 20 for the IPv4 header minus 20 for the TCP header, which is MTU minus 40.',
      detail: 'For IPv4 with no IP options, the subtraction is 40 bytes: 20 for the fixed IPv4 header and 20 for the fixed TCP header. The general rule is the effective MTU minus the fixed IP header size minus the fixed TCP header size.',
      narration: 'So the arithmetic is: take the MTU, subtract twenty for the IPv4 header, subtract twenty for the TCP header. MTU minus forty.',
      keyword: 'MTU minus 40'
    },
    {
      id: 'e3d', scene: 'mss', start: 82.5, end: 90,
      caption: '576 gives 536, 1500 gives 1460, 9000 gives 8960, and IPv6\'s forty-byte header gives 1440.',
      detail: 'Four values: an MTU of 576 gives 536, which is also the default assumed when no MSS option arrives; 1500 gives 1460; 9000 gives 8960; and an IPv6 MTU of 1500 gives 1440, because the IPv6 base header is 40 bytes. The IPv6 minimum MTU of 1280 gives 1220.',
      narration: 'Four numbers to carry. Five seventy-six gives five thirty-six, which is also what you assume when no option arrives. Fifteen hundred gives fourteen sixty. Nine thousand gives eight nine sixty. And IPv6, whose base header is forty bytes, gives fourteen forty.',
      keyword: '1440',
      trap: 'IPv6 subtracts 60, not 40: 40 bytes of base header plus the 20-byte TCP header.'
    },

    /* ---------- scene 4: the data, not the MSS ---------- */
    {
      id: 'e4a', scene: 'nodata', start: 90, end: 97.5,
      caption: 'The rule: the MSS is the effective MTU minus only the fixed IP and TCP headers.',
      detail: 'RFC 6691 states the rule in one sentence: when calculating the MSS value, decrease the MTU by only the size of the fixed IP and TCP headers, and do not decrease it for possible options. The reason is that the MSS is a receive promise about the largest datagram the host can reassemble, not a report about the options it happens to send.',
      narration: 'The rule is short. When you compute the MSS, subtract only the fixed headers. Do not subtract anything for options.',
      keyword: 'only the fixed headers'
    },
    {
      id: 'e4b', scene: 'nodata', start: 97.5, end: 105,
      caption: 'Options are not subtracted from the advertised MSS, so 1460 stays 1460.',
      detail: 'A host that intends to send timestamps does not advertise 1448. It advertises 1460, because the promise is about what it can receive and reassemble, and the options it sends later are its own business.',
      narration: 'So a host that plans to send timestamps still advertises fourteen sixty. The promise is about what it can receive, not about the options it will use.',
      keyword: '1460 stays 1460'
    },
    {
      id: 'e4c', scene: 'nodata', start: 105, end: 112.5,
      caption: 'But the sender must cut the data by the options it actually sends: 1460 becomes 1440 with 20 bytes of options.',
      detail: 'The same document says the sender must reduce the TCP data length to account for any IP or TCP options it includes. With 20 bytes of options in the header, the header is 40 bytes, so on a 1500-byte MTU the data is 1500 minus 20 minus 40, which is 1440.',
      narration: 'But when the segment is actually built, the options take their bytes out of the data. With twenty bytes of options the header is forty, so the data is fourteen forty on a fifteen-hundred-byte link.',
      keyword: '1460 becomes 1440'
    },
    {
      id: 'e4d', scene: 'nodata', start: 112.5, end: 120,
      caption: 'Sending the full 1460 with those options makes a 1520-byte datagram, 20 bytes past a 1500-byte MTU.',
      detail: '1460 of data plus 40 of TCP header plus 20 of IP header is 1520 bytes, which exceeds a 1500-byte MTU by 20. The IP layer would have to fragment the segment, which is exactly what the MSS exists to avoid. The payload efficiency falls from 97.33 per cent to 96.00 per cent.',
      narration: 'Send the full fourteen sixty and add the options, and the datagram is fifteen twenty: twenty bytes too big. IP would have to fragment it, which is the thing the MSS is for. So the data shrinks instead.',
      keyword: '1520',
      trap: 'The advertised MSS stays 1460 while the segment carrying options carries 1440 bytes of data. Both numbers are correct in their own place.'
    },

    /* ---------- scene 5: the ledger ---------- */
    {
      id: 'e5a', scene: 'ledger', start: 120, end: 127.5,
      caption: 'The four handshake options spend 19 of the 40 bytes, so 21 remain.',
      detail: 'After the four options are counted, 19 of the 40 bytes are committed and 21 are free. That remainder is what any further option has to fit into.',
      narration: 'Now treat the budget as a ledger. Nineteen bytes are committed to the four handshake options. Twenty-one are free.',
      keyword: '21 remain'
    },
    {
      id: 'e5b', scene: 'ledger', start: 127.5, end: 135,
      caption: 'A TCP MD5 option is 18 bytes: 19 plus 18 is 37, which pads to 40.',
      detail: 'The TCP MD5 signature option is kind 19 with length 18. Adding it to the 19 bytes already spent gives 37, which rounds up to 40. The header reaches its maximum of 60 bytes.',
      narration: 'Add the MD5 signature option, which costs eighteen. Thirty-seven. Round it up and the option area is the full forty, and the header is sixty bytes, the largest it can be.',
      keyword: '37'
    },
    {
      id: 'e5c', scene: 'ledger', start: 135, end: 142.5,
      caption: 'That leaves a 60-byte header and 1420 bytes of data on a 1500-byte MTU.',
      detail: 'With a 60-byte TCP header on a 1500-byte MTU and a 20-byte IPv4 header, the data is 1500 minus 20 minus 60, which is 1420. Payload efficiency is 94.67 per cent, down from 97.33 with no options.',
      narration: 'So the header is sixty bytes and the data is fourteen twenty on a fifteen-hundred-byte link. Efficiency has fallen from ninety-seven per cent to under ninety-five.',
      keyword: '1420'
    },
    {
      id: 'e5d', scene: 'ledger', start: 142.5, end: 150,
      caption: 'One more four-byte option would make 41, so something has to be dropped.',
      detail: '37 plus 4 is 41, one byte over the budget, before any padding. The options are not independent: they compete for one fixed space, so adding one can force another out, and the choice is a design decision rather than arithmetic.',
      narration: 'One more four-byte option and the total is forty-one. One byte over. So the options are not independent: adding one can force another out.',
      keyword: '41',
      trap: 'The budget is shared, not per-option: adding an option can require removing another, and a question may ask which combination fits.'
    },

    /* ---------- scene 6: the granularity ---------- */
    {
      id: 'e6a', scene: 'granularity', start: 150, end: 157.5,
      caption: 'With a shift count s, the window field counts steps of 2^s bytes.',
      detail: 'When the window scale option is in use, the sixteen-bit window field is not a count of bytes; it is a count of steps, and each step is 2^s bytes where s is the shift count. The receiver right-shifts its true window by s to get the field, so the field can only describe windows that are whole numbers of steps.',
      narration: 'Now the second half. When the window is scaled, the field does not count bytes. It counts steps, and each step is two to the s bytes.',
      keyword: 'steps of 2^s'
    },
    {
      id: 'e6b', scene: 'granularity', start: 157.5, end: 165,
      caption: 'So the right edge of the window can only land on ACK plus a whole number of 2^s steps.',
      detail: 'The right edge of the advertised window is the acknowledgement number plus the window in bytes. Since the window is a whole number of steps, the right edge is the acknowledgement plus k times 2^s for some whole k.',
      narration: 'The right edge of the window is the acknowledgement plus the window. So the right edge can only land on the acknowledgement plus a whole number of steps.',
      keyword: 'right edge'
    },
    {
      id: 'e6c', scene: 'granularity', start: 165, end: 172.5,
      caption: 'With s = 7 the step is 128 bytes: from ACK 1000 the edges are 1128, 1256 and 1384.',
      detail: 'A shift count of 7 gives a step of 128 bytes. From an acknowledgement of 1000, the only right edges the field can name are 1128 for a field of 1, 1256 for a field of 2, and 1384 for a field of 3.',
      narration: 'Take a shift count of seven. One step is a hundred and twenty-eight bytes. From an acknowledgement of a thousand, the field can name three edges near here: eleven twenty-eight, twelve fifty-six, and thirteen eighty-four.',
      keyword: '128 bytes'
    },
    {
      id: 'e6d', scene: 'granularity', start: 172.5, end: 180,
      caption: 'The receiver\'s buffer ends at 1300, which is not one of those points.',
      detail: 'The receiver\'s buffer ends at byte 1300, so its true window from acknowledgement 1000 is 300 bytes. That is not a multiple of 128, so no field value names it exactly: 2 understates the window by 44 bytes and 3 overstates it by 84.',
      narration: 'But the receiver\'s buffer ends at thirteen hundred, which is not one of those points. The nearest field values are two, which is forty-four bytes short, and three, which is eighty-four too far.',
      keyword: '1300',
      trap: 'The window field names a length, but the length is expressible only in whole steps of 2^s, so a buffer end that is not a step boundary cannot be named.'
    },

    /* ---------- scene 7: the retraction ---------- */
    {
      id: 'e7a', scene: 'retraction', start: 180, end: 187.5,
      caption: 'The true window is 1300 bytes from ACK 1000; the field can only say 2, which means 1256.',
      detail: 'The appendix example runs with a scale factor of 128 and a small window. With acknowledgement 1000 and a true right edge at 1300, the receiver advertises a window field of 2, which the sender reads as 256 bytes, putting the right edge at 1256: 44 bytes short of the truth, and safe.',
      narration: 'Here is the appendix example, with a step of a hundred and twenty-eight. The buffer ends at thirteen hundred. The receiver advertises two, which the sender reads as twelve fifty-six. Forty-four bytes short, and safe.',
      keyword: '1256'
    },
    {
      id: 'e7b', scene: 'retraction', start: 187.5, end: 195,
      caption: 'After 40 more bytes, ACK 1040 and window 2 give 1296, four bytes short.',
      detail: 'The sender writes 40 bytes and the receiver acknowledges 1040. A field of 2 again means 256 bytes, so the right edge is 1296, which is 4 bytes short of 1300. The receiver is still understating, and still safe.',
      narration: 'The sender writes forty bytes and the acknowledgement moves to ten forty. Two again means two hundred and fifty-six, so the edge is twelve ninety-six. Four bytes short now.',
      keyword: '1296'
    },
    {
      id: 'e7c', scene: 'retraction', start: 195, end: 202.5,
      caption: 'Then 5 more bytes: ACK 1045. A field of 2 gives 1301, one byte past the buffer.',
      detail: 'The sender writes 5 more bytes, so the acknowledgement is 1045. A field of 2 would put the right edge at 1301, one byte beyond the buffer, which invites the sender to write a byte the receiver cannot store.',
      narration: 'Then five more bytes. The acknowledgement is ten forty-five. A field of two would put the edge at thirteen oh one: one byte past the buffer.',
      keyword: '1301'
    },
    {
      id: 'e7d', scene: 'retraction', start: 202.5, end: 210,
      caption: 'A field of 1 gives 1173, which is 127 bytes short. The advertised window has shrunk.',
      detail: 'The other available field is 1, meaning 128 bytes, which puts the right edge at 1173: 127 bytes short of 1300. The window the sender may use has shrunk from 256 bytes to 128, so a window that was open has been retracted.',
      narration: 'The only other choice is one, which means a hundred and twenty-eight bytes, and puts the edge at eleven seventy-three. A hundred and twenty-seven bytes short. The window has shrunk.',
      keyword: '1173',
      trap: 'A shrinking window is not an error to reject: the rules require both ends to handle it, and a question may ask what the sender may still send.'
    },

    /* ---------- scene 8: the rules ---------- */
    {
      id: 'e8a', scene: 'rules', start: 210, end: 217.5,
      caption: 'Receiver rule: honour any segment that would have been in window for any ACK you sent.',
      detail: 'The first rule protects data already promised. A receiver must treat as in-window any segment that would have been in window for any acknowledgement it has already sent, even if its latest advertisement is smaller.',
      narration: 'The rules start on the receiving side. If a segment would have been inside the window for any acknowledgement you have already sent, you must still accept it.',
      keyword: 'honour'
    },
    {
      id: 'e8b', scene: 'rules', start: 217.5, end: 225,
      caption: 'Sender rule: the first retransmission may ignore the window if it is out by less than 2^s.',
      detail: 'On the first retransmission, or when the sequence number is out of window by less than 2 to the Rcv.Wind.Shift, the sender may retransmit normally without regard to the receiver window, as long as the original segment was in window when it was sent.',
      narration: 'On the sending side: the first retransmission may ignore the window, provided it is outside by less than one step, and provided the original was in window when it went out.',
      keyword: 'first retransmission'
    },
    {
      id: 'e8c', scene: 'rules', start: 225, end: 232.5,
      caption: 'Later retransmissions must lie inside the latest advertised window.',
      detail: 'Subsequent retransmissions may only be sent if they lie within the window announced by the most recent acknowledgement. The allowance is one segment wide, not a general licence.',
      narration: 'After that first one, every retransmission must sit inside the newest window. The allowance is one segment wide, not a general licence.',
      keyword: 'latest advertised window'
    },
    {
      id: 'e8d', scene: 'rules', start: 232.5, end: 240,
      caption: 'The receiver should also track the largest right edge it has ever advertised.',
      detail: 'A scaled receiver should track the actual maximum window sequence number, which is likely to be greater than the edge implied by its most recent acknowledgement if more than one segment has arrived since the application last read.',
      narration: 'And the receiver should keep the largest edge it has ever advertised, because the latest acknowledgement may name a smaller one than the data it has already accepted.',
      keyword: 'largest right edge',
      trap: 'The window a sender must obey is the latest one, but a first retransmission just outside it is allowed, and the receiver must still honour the older promise.'
    },

    /* ---------- scene 9: the cost ---------- */
    {
      id: 'e9a', scene: 'cost', start: 240, end: 247.5,
      caption: 'The worst retraction is 2^s minus one bytes: 127 at a shift count of 7.',
      detail: 'The distance between two expressible edges is 2^s, so a true edge can fall at most 2^s minus one bytes below the next expressible edge. At a shift count of 7 that is 127 bytes, which is exactly the retraction in the example.',
      narration: 'How bad can it get? The worst case is one step minus one byte, because the true edge can sit just below the next edge the field can name. At seven that is a hundred and twenty-seven bytes.',
      keyword: '2^s minus one'
    },
    {
      id: 'e9b', scene: 'cost', start: 247.5, end: 255,
      caption: 'At a shift count of 14 the step is 16,384 bytes, so the worst retraction is 16,383 bytes.',
      detail: 'A shift count of 14 gives a step of 16,384 bytes, so the bound becomes 16,383 bytes. The shift count is capped at 14, so 16,383 is the largest retraction any legal connection can produce.',
      narration: 'At the largest legal shift count, fourteen, the step is sixteen thousand three hundred and eighty-four, so the bound is sixteen thousand three hundred and eighty-three bytes.',
      keyword: '16,383'
    },
    {
      id: 'e9c', scene: 'cost', start: 255, end: 262.5,
      caption: 'That is more than eleven 1460-byte segments, so a large step makes a large shrink.',
      detail: '16,383 bytes is 11.22 segments of 1460 bytes. A retraction of that size is not a curiosity: it is more than a window of ordinary segments, which is why the rules have to tolerate it rather than forbid it.',
      narration: 'Sixteen thousand bytes is more than eleven full segments. So a large step makes a large shrink, and that is why the rules tolerate it instead of forbidding it.',
      keyword: 'eleven segments'
    },
    {
      id: 'e9d', scene: 'cost', start: 262.5, end: 270,
      caption: 'Stacks reduce it by advertising whole segments and by suppressing small window updates.',
      detail: 'Most stacks announce windows that are a whole number of segments, rounded up to the next scale factor, and they suppress small window updates. Both habits make the window advance more often than it retracts, which is why the problem is rarely seen with a large window.',
      narration: 'Real stacks keep it small: they advertise whole segments, rounded up to the next step, and they refuse to send tiny window updates. That makes windows advance more often than they shrink.',
      keyword: 'whole segments',
      trap: 'The bound is 2^s minus one, not 2^s: a step of 128 can lose at most 127 bytes, and a step of 1 loses none.'
    },

    /* ---------- scene 10: consolidation ---------- */
    {
      id: 'e10a', scene: 'consolidate', start: 270, end: 277.5,
      caption: 'Budget: forty bytes, the sum of the option lengths rounded up to a multiple of four.',
      detail: 'The header is 20 to 60 bytes, so the option area is at most 40. The four handshake options cost 19 raw and 20 padded, giving a 40-byte header.',
      narration: 'Four things to carry away. First, the budget: forty bytes, and the sum of the option lengths is rounded up to a multiple of four.',
      keyword: 'forty bytes'
    },
    {
      id: 'e10b', scene: 'consolidate', start: 277.5, end: 285,
      caption: 'MSS: the MTU minus the fixed headers, counting data only: 1460 on Ethernet, 1440 over IPv6.',
      detail: 'The MSS counts data octets and is the effective MTU minus the fixed IP and TCP headers: 1460 for IPv4 on a 1500-byte MTU, 1440 for IPv6, 536 for a 576-byte MTU and as the default when the option is absent.',
      narration: 'Second, the MSS: the MTU minus the fixed headers, data only. Fourteen sixty on Ethernet, fourteen forty over IPv6, five thirty-six at the old minimum and when no option arrives.',
      keyword: 'data only'
    },
    {
      id: 'e10c', scene: 'consolidate', start: 285, end: 292.5,
      caption: 'Options do not lower the MSS; they lower the data actually sent.',
      detail: 'The advertised MSS stays at 1460 while a segment carrying 20 bytes of options carries 1440 bytes of data. The two numbers answer different questions: what the host can receive, and what this segment can hold.',
      narration: 'Third, options do not lower the MSS. They lower the data in the segment that carries them. Fourteen sixty stays the promise; fourteen forty is what the segment holds.',
      keyword: 'lower the data'
    },
    {
      id: 'e10d', scene: 'consolidate', start: 292.5, end: 300,
      caption: 'Scaling can retract a window by up to 2^s minus one bytes, and the rules say to tolerate it.',
      detail: 'The five slips are: counting headers inside the MSS, lowering the advertised MSS for options, assuming one shared MSS for both directions, treating the 40 bytes as a per-option limit, and treating a shrinking window as an error instead of handling it.',
      narration: 'Fourth, a scaled window can shrink by one step minus one byte, and the rules say to handle it. The five slips are counting headers inside the MSS, lowering the MSS for options, assuming one shared MSS, reading forty bytes as a per-option limit, and treating a shrink as an error.',
      keyword: 'tolerate it',
      trap: 'Five slips: headers counted inside the MSS, an MSS lowered for options, one shared MSS for both directions, a 40-byte per-option budget, and a retraction treated as an error.'
    }
  ]
};
