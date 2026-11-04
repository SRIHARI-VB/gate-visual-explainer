/* ==========================================================================
   tcp-handshake-and-teardown — THE timeline.
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
      id: 'counters',
      n: 1,
      title: 'Two counters that must agree',
      start: 0, end: 30,
      objective: 'See a connection as two independent 32-bit counters, one per direction, and count the segments the opening and the closing cost.'
    },
    {
      id: 'flags',
      n: 2,
      title: 'Six flags, and the two that cost a number',
      start: 30, end: 60,
      objective: 'Name the six control bits, and state which of them occupy sequence space: SYN and FIN yes, ACK no.'
    },
    {
      id: 'handshake',
      n: 3,
      title: 'Three messages, byte for byte',
      start: 60, end: 90,
      objective: 'Walk the three-way handshake with ISN 100 and ISN 300, and derive 101 and 301 rather than quoting them.'
    },
    {
      id: 'whythree',
      n: 4,
      title: 'Why three messages and not two',
      start: 90, end: 120,
      objective: 'Show the one fact a two-message open leaves unconfirmed, and connect it to the stale duplicate SYN.'
    },
    {
      id: 'isn',
      n: 5,
      title: 'The initial number is a clock, not a random draw',
      start: 120, end: 150,
      objective: 'Explain ISN = M + F(...), the 4-microsecond clock, its wrap time, and why zero is the one value that cannot be used.'
    },
    {
      id: 'options',
      n: 6,
      title: 'The options ride only on the opening segments',
      start: 150, end: 180,
      objective: 'Account for the 20 option bytes that make a SYN 40 bytes, and state the default MSS when no option arrives.'
    },
    {
      id: 'teardown',
      n: 7,
      title: 'Four messages, one FIN each way',
      start: 180, end: 210,
      objective: 'Close the connection after 1000 bytes of data, deriving 1101, 1102, 301 and 302, and name the state each side holds.'
    },
    {
      id: 'timewait',
      n: 8,
      title: 'TIME-WAIT: twice the maximum segment lifetime',
      start: 210, end: 240,
      objective: 'Compute 2 x MSL as 240 seconds, give the two purposes the standard names, and state the one legal way to reopen early.'
    },
    {
      id: 'edges',
      n: 9,
      title: 'Simultaneous open, simultaneous close, half-close',
      start: 240, end: 270,
      objective: 'Draw the three shapes that break the client-server picture, and count the segments and TIME-WAIT sockets in each.'
    },
    {
      id: 'consolidate',
      n: 10,
      title: 'The chain, and the six slips',
      start: 270, end: 300,
      objective: 'Assemble the whole procedure in order and name the six mistakes that cost marks.'
    }
  ],

  events: [
    /* ---------------- scene 1: two counters ---------------- */
    {
      id: 'e1a', scene: 'counters', start: 0, end: 7.5,
      caption: 'A TCP connection is two counters that must agree, one for each direction of data.',
      detail: 'Each direction has its own sequence number space. The sender of data chooses its initial number and the receiver learns it during the opening exchange. Nothing is shared between the two directions except the acknowledgment fields.',
      narration: 'A connection is two counters, one for each direction.',
      keyword: 'two counters'
    },
    {
      id: 'e1b', scene: 'counters', start: 7.5, end: 15,
      caption: 'Opening the connection costs three segments, which is one round trip.',
      detail: 'Three segments are needed because the second and third steps of a four-step exchange can share one message: B acknowledges A and sends its own number in the same segment.',
      narration: 'Opening costs three segments: one round trip.',
      keyword: 'three segments'
    },
    {
      id: 'e1c', scene: 'counters', start: 15, end: 22.5,
      caption: 'Closing costs four segments, and the side that closes first then waits 240 seconds.',
      detail: 'Each direction is closed separately, so each side sends one FIN and receives one acknowledgment. The side that sends the first FIN keeps its socket for twice the maximum segment lifetime, which is 240 seconds.',
      narration: 'Closing costs four segments, then two hundred and forty seconds of waiting.',
      keyword: '240 seconds'
    },
    {
      id: 'e1d', scene: 'counters', start: 22.5, end: 30,
      caption: 'Each counter is 32 bits: it runs to 4,294,967,295 and then wraps to zero.',
      detail: 'Two to the power 32 is 4,294,967,296 distinct values, so the highest is one less than that. Every byte of data, and the SYN and the FIN, consumes one or more of those values, which is why running out is possible on a long-lived connection.',
      narration: 'Each counter holds two to the thirty-two values, then wraps.',
      keyword: '32 bits'
    },

    /* ---------------- scene 2: flags ---------------- */
    {
      id: 'e2a', scene: 'flags', start: 30, end: 37.5,
      caption: 'Six control bits do the work: URG, ACK, PSH, RST, SYN and FIN, one bit each.',
      detail: 'URG marks the urgent pointer as meaningful, ACK marks the acknowledgment field as meaningful, PSH asks for the data to be pushed to the application, RST aborts the connection, SYN opens it and FIN closes one direction.',
      narration: 'Six flags: urgent, ack, push, reset, synchronise, finish.',
      keyword: 'Six control bits'
    },
    {
      id: 'e2b', scene: 'flags', start: 37.5, end: 45,
      caption: 'SYN and FIN each occupy one sequence number; ACK occupies none.',
      detail: 'The SYN is numbered as if it came before the first data byte, and the FIN as if it came after the last one. The acknowledgment field itself is not numbered, which is why the same sequence number can be used again on the next segment.',
      narration: 'SYN and FIN each eat one number. ACK eats none.',
      keyword: 'occupy one sequence number'
    },
    {
      id: 'e2c', scene: 'flags', start: 45, end: 52.5,
      caption: 'That single rule is why an acknowledgment of a SYN is the SYN number plus one.',
      detail: 'B receives a SYN numbered 100, so the next number it expects from A is 101. Every acknowledgment in this lesson is one of these plus-one arithmetic steps, applied to a SYN, to a run of data, or to a FIN.',
      narration: 'So the answer to a SYN numbered a hundred is a hundred and one.',
      keyword: 'plus one'
    },
    {
      id: 'e2d', scene: 'flags', start: 52.5, end: 60,
      caption: 'Two more bits, CWR and ECE, were added later for congestion marking, making eight.',
      detail: 'The header byte that holds the flags has eight bits. The original design used six and left two reserved; the reserved pair now carries the congestion window reduced and echo bits used by explicit congestion notification.',
      narration: 'Two reserved bits later became congestion signals, so eight in all.',
      keyword: 'CWR and ECE'
    },

    /* ---------------- scene 3: the handshake ---------------- */
    {
      id: 'e3a', scene: 'handshake', start: 60, end: 67.5,
      caption: 'A opens with a SYN carrying its initial number, 100, and no acknowledgment.',
      detail: 'The ACK flag is clear on this segment, so the acknowledgment field is not meaningful and carries zero. A enters the SYN-SENT state, and it will retransmit this segment with the same number if no answer arrives.',
      narration: 'A sends a SYN with number one hundred. No acknowledgment yet.',
      keyword: 'SYN'
    },
    {
      id: 'e3b', scene: 'handshake', start: 67.5, end: 75,
      caption: 'B answers with SYN and ACK: its own number 300, and 101 for A\'s SYN.',
      detail: 'B was in LISTEN, so this segment takes it to SYN-RECEIVED. It carries both jobs in one message: acknowledging 100 plus one, and offering its own starting number, which is 300.',
      narration: 'B answers with its own number, three hundred, and a hundred and one.',
      keyword: '300'
    },
    {
      id: 'e3c', scene: 'handshake', start: 75, end: 82.5,
      caption: 'A replies with 101 and acknowledges 301; both sides are now ESTABLISHED.',
      detail: 'The third segment is a bare acknowledgment. Its sequence number is 101 rather than 102 because an acknowledgment consumes no sequence space, so the first data byte will also be numbered 101.',
      narration: 'A answers a hundred and one, acknowledging three hundred and one. Both are established.',
      keyword: 'ESTABLISHED'
    },
    {
      id: 'e3d', scene: 'handshake', start: 82.5, end: 90,
      caption: 'Three segments, one round trip: 101 = 100 + 1 and 301 = 300 + 1.',
      detail: 'Both results come from the same rule, applied once per direction. Nothing else in the exchange needs a number, so the whole opening is those two plus-one steps carried in three segments.',
      narration: 'Two plus-one steps, carried in three segments.',
      keyword: '101 = 100 + 1'
    },

    /* ---------------- scene 4: why three ---------------- */
    {
      id: 'e4a', scene: 'whythree', start: 90, end: 97.5,
      caption: 'Two messages would leave one thing unconfirmed: that B\'s number was received.',
      detail: 'After the SYN and the SYN-ACK, B knows A\'s number and A knows B\'s, but only A knows that B is still waiting for confirmation. If A never answers, B cannot tell whether its number arrived.',
      narration: 'Two messages leave one fact unconfirmed: that B\'s number was received.',
      keyword: 'one thing unconfirmed'
    },
    {
      id: 'e4b', scene: 'whythree', start: 97.5, end: 105,
      caption: 'A stale SYN from an earlier connection looks exactly like a new one.',
      detail: 'Sequence numbers are not tied to any clock in the network, so the receiver of a SYN has no way to tell a fresh one from a duplicate that has been sitting in a queue. It must ask the sender to confirm.',
      narration: 'An old SYN looks exactly like a new one, so the receiver has to ask.',
      keyword: 'stale SYN'
    },
    {
      id: 'e4c', scene: 'whythree', start: 105, end: 112.5,
      caption: 'The third message is the only proof that A saw B\'s number, so B needs it.',
      detail: 'Because the third segment acknowledges B\'s own initial number, its arrival proves that the number reached A. A duplicate SYN produces a third segment acknowledging a number the real sender never offered, which is how the confusion is caught.',
      narration: 'The third message proves A saw B\'s number. That is why B waits for it.',
      keyword: 'the third message'
    },
    {
      id: 'e4d', scene: 'whythree', start: 112.5, end: 120,
      caption: 'The cost is one round trip for the opener, and one and a half for the listener.',
      detail: 'The opener is established when it sends the third segment, which is one round trip after its SYN. The listener is established when that segment arrives, half a round trip later, which is why an accepting call returns at one and a half.',
      narration: 'One round trip for the opener, one and a half for the listener.',
      keyword: 'one and a half'
    },

    /* ---------------- scene 5: the initial number ---------------- */
    {
      id: 'e5a', scene: 'isn', start: 120, end: 127.5,
      caption: 'The initial number is neither zero nor a plain random draw: it is a clock plus a hash.',
      detail: 'The standard prescribes an initial number of the form M plus F of the four connection identifiers and a secret key. M makes the value climb with time, and F makes it unpredictable to anyone off the path.',
      narration: 'Not zero, not a random draw: a clock plus a hash.',
      keyword: 'a clock plus a hash'
    },
    {
      id: 'e5b', scene: 'isn', start: 127.5, end: 135,
      caption: 'The clock ticks about every 4 microseconds and wraps in about 4.77 hours.',
      detail: 'Two to the power 32 ticks of 4 microseconds each is 17,179.87 seconds, which is 4.7722 hours. The standard states approximately 4.55 hours, which implies a slightly shorter tick; it calls the clock neither realtime nor precise, so both figures describe the same mechanism.',
      narration: 'A tick every four microseconds, wrapping in about four point seven seven hours.',
      keyword: '4.77 hours'
    },
    {
      id: 'e5c', scene: 'isn', start: 135, end: 142.5,
      caption: 'One maximum segment lifetime, 120 seconds, spans 30 million ticks of that clock.',
      detail: '120 seconds divided by 4 microseconds is 30,000,000. Because the clock wraps only after 143 times the maximum segment lifetime, an initial number cannot repeat while a segment from an earlier connection could still be alive.',
      narration: 'One maximum segment lifetime is thirty million ticks, so the clock outlives it easily.',
      keyword: '30 million'
    },
    {
      id: 'e5d', scene: 'isn', start: 142.5, end: 150,
      caption: 'Zero would collide with an old connection\'s numbering, which is the whole problem.',
      detail: 'A fixed starting point makes every incarnation of the same four-tuple use the same numbers, so a duplicate from an earlier incarnation fits the current window perfectly and is accepted as data. A climbing clock keeps the incarnations apart.',
      narration: 'Zero would make every incarnation use the same numbers. That is the problem it solves.',
      keyword: 'Zero'
    },

    /* ---------------- scene 6: the options ---------------- */
    {
      id: 'e6a', scene: 'options', start: 150, end: 157.5,
      caption: 'The opening segments carry 20 bytes of options; the fixed header is 20, so 40 in all.',
      detail: 'The data offset field counts 32-bit words, so a header with 20 bytes of options is 10 words and the field reads 10. The largest legal value is 15 words, which leaves 40 bytes for options and fixes the maximum header at 60 bytes.',
      narration: 'Twenty bytes of options on a twenty-byte header makes forty.',
      keyword: '20 bytes of options'
    },
    {
      id: 'e6b', scene: 'options', start: 157.5, end: 165,
      caption: 'MSS is 4 bytes, SACK-permitted 2, timestamps 10, a NOP and window scale 3.',
      detail: 'Four plus two plus ten plus one plus three is twenty. The no-operation byte exists to align the window scale option on a four-byte boundary, which older routers handled better.',
      narration: 'Four, two, ten, one and three: twenty bytes exactly.',
      keyword: '4 bytes'
    },
    {
      id: 'e6c', scene: 'options', start: 165, end: 172.5,
      caption: 'Options are legal on a SYN; the other segments carry none by default.',
      detail: 'The maximum segment size option must not be sent on any segment without the SYN bit, because a segment size can only be negotiated once, at the start. The window scale and timestamps are also negotiated here and are then assumed by both sides.',
      narration: 'Options belong to the opening. The rest of the connection assumes what was agreed.',
      keyword: 'legal on a SYN'
    },
    {
      id: 'e6d', scene: 'options', start: 172.5, end: 180,
      caption: 'No MSS option means 536 bytes over IPv4 and 1220 over IPv6.',
      detail: 'The default is 576 minus 40 over IPv4, and 1280 minus 60 over IPv6, where the base header is 40 bytes. The largest MSS that can be advertised at all is 65,495, which is 65,535 minus 40, because the IPv4 total length field is 16 bits.',
      narration: 'Silence means five hundred and thirty-six, or twelve twenty over IPv6.',
      keyword: '536'
    },

    /* ---------------- scene 7: the teardown ---------------- */
    {
      id: 'e7a', scene: 'teardown', start: 180, end: 187.5,
      caption: 'A sends 1000 bytes, then a FIN at 1101, which costs one number.',
      detail: 'The data occupies 101 to 1100, so the next number is 1101. The FIN is numbered 1101 and occupies it, which makes the next number 1102. A is now in FIN-WAIT-1, and it may still receive.',
      narration: 'A thousand bytes take the counter to eleven hundred and one, where the FIN sits.',
      keyword: '1101'
    },
    {
      id: 'e7b', scene: 'teardown', start: 187.5, end: 195,
      caption: 'B acknowledges 1102 and enters CLOSE-WAIT; A is in FIN-WAIT-2.',
      detail: 'The acknowledgment is 1102 because the FIN consumed 1101. B has now received a close request but its own application has not closed, so it keeps the connection open and may still send data back.',
      narration: 'B acknowledges eleven hundred and two, and waits for its own application.',
      keyword: 'CLOSE-WAIT'
    },
    {
      id: 'e7c', scene: 'teardown', start: 195, end: 202.5,
      caption: 'B\'s FIN at 301 is acknowledged with 302, and A enters TIME-WAIT.',
      detail: 'B sent no data, so its FIN sits at 301, the number right after its SYN at 300. A answers 302, and because A closed first it is the side that must now wait for twice the maximum segment lifetime.',
      narration: 'B sends its FIN at three hundred and one. A answers three hundred and two and waits.',
      keyword: '302'
    },
    {
      id: 'e7d', scene: 'teardown', start: 202.5, end: 210,
      caption: 'Four segments: FIN, ACK, FIN, ACK, with one sequence number for each FIN.',
      detail: 'The two halves of the close are independent, which is why four segments are needed rather than two. A connection closed this way delivers all buffered data in both directions before either side forgets it.',
      narration: 'Four segments, two of them numbered, and both halves closed separately.',
      keyword: 'Four segments'
    },

    /* ---------------- scene 8: TIME-WAIT ---------------- */
    {
      id: 'e8a', scene: 'timewait', start: 210, end: 217.5,
      caption: 'TIME-WAIT lasts twice the maximum segment lifetime: 2 x 120 is 240 seconds.',
      detail: 'The maximum segment lifetime is taken to be 2 minutes, an engineering choice the standard says may be changed. The state lasts twice that, so 240 seconds, and only the side that closed actively holds it.',
      narration: 'Twice one hundred and twenty is two hundred and forty seconds.',
      keyword: '240 seconds'
    },
    {
      id: 'e8b', scene: 'timewait', start: 217.5, end: 225,
      caption: 'Reason one: if the last ACK is lost, the peer resends its FIN and it is answered.',
      detail: 'Without the wait, the resent FIN would arrive at a closed socket and be answered with a reset, which the peer reports to its application as an error. The wait lets the last acknowledgment be reconstructed by answering the retransmitted FIN.',
      narration: 'If the last acknowledgment is lost, the resent FIN still gets an answer.',
      keyword: 'Reason one'
    },
    {
      id: 'e8c', scene: 'timewait', start: 225, end: 232.5,
      caption: 'Reason two: delayed duplicates from this connection die before the pair is reused.',
      detail: 'A connection is identified by four values, and the same four may be reused at once. If a delayed segment from the old connection arrived during a new one, it would fit the new window and be accepted as data. The wait makes that impossible.',
      narration: 'And old duplicates die out before the same four values are used again.',
      keyword: 'Reason two'
    },
    {
      id: 'e8d', scene: 'timewait', start: 232.5, end: 240,
      caption: 'A host may reopen from TIME-WAIT only with a larger initial number.',
      detail: 'The standard permits a new SYN to be accepted straight from TIME-WAIT if the new initial number is larger than any number used on the previous incarnation, and if an old duplicate turns out to be the cause the socket returns to TIME-WAIT. Timestamps make a cheaper version of this possible.',
      narration: 'Early reopening is allowed, but only with a bigger starting number.',
      keyword: 'larger initial number'
    },

    /* ---------------- scene 9: the three odd shapes ---------------- */
    {
      id: 'e9a', scene: 'edges', start: 240, end: 247.5,
      caption: 'Simultaneous open: both send SYN, both answer SYN and ACK, four segments.',
      detail: 'Two messages cross in the network. Each side receives a SYN after having sent one, so neither is a listener. Four segments replace three, and an implementation is required to support the case.',
      narration: 'Both send a SYN at once, so four segments are needed.',
      keyword: 'Simultaneous open'
    },
    {
      id: 'e9b', scene: 'edges', start: 247.5, end: 255,
      caption: 'Both go CLOSED to SYN-SENT to SYN-RECEIVED to ESTABLISHED.',
      detail: 'The SYN-RECEIVED state is normally reached from LISTEN by a passive opener. In a simultaneous open it is reached from SYN-SENT by an active opener, and the implementation must remember which way it came, because a reset is handled differently.',
      narration: 'Each side passes through syn-received, but by the active path.',
      keyword: 'SYN-RECEIVED'
    },
    {
      id: 'e9c', scene: 'edges', start: 255, end: 262.5,
      caption: 'Simultaneous close leaves both sides in TIME-WAIT, so two sockets wait, not one.',
      detail: 'Each side sends a FIN before receiving the other, so each becomes the active closer and each must wait. The four segments are the same count as a normal close, but the waiting state is held twice.',
      narration: 'Both closed at once, so both wait: two sockets in time-wait.',
      keyword: 'two sockets'
    },
    {
      id: 'e9d', scene: 'edges', start: 262.5, end: 270,
      caption: 'Half-close: CLOSE-WAIT has no timer, so the other side may keep sending.',
      detail: 'A close shuts one direction only. The side that received the FIN stays in CLOSE-WAIT until its own application closes, which may be never, so a server can answer a request long after the client stopped sending.',
      narration: 'A close is one direction only, so the other side may keep talking.',
      keyword: 'Half-close'
    },

    /* ---------------- scene 10: consolidation ---------------- */
    {
      id: 'e10a', scene: 'consolidate', start: 270, end: 277.5,
      caption: 'First the flags: SYN and FIN cost one number each, ACK costs none.',
      detail: 'The whole of the arithmetic on this page follows from that one rule. A SYN numbered n is acknowledged with n plus one, a run of k bytes starting at s is acknowledged with s plus k, and a FIN numbered f is acknowledged with f plus one.',
      narration: 'One: SYN and FIN cost a number each. ACK costs none.',
      keyword: 'SYN and FIN'
    },
    {
      id: 'e10b', scene: 'consolidate', start: 277.5, end: 285,
      caption: 'Then the opening: 101 = 100 + 1 and 301 = 300 + 1, in three segments.',
      detail: 'Both initial numbers come from the clock-plus-hash generator, and both acknowledgments come from the plus-one rule. The third segment is the only one whose purpose is purely confirmation, which is why the handshake needs it.',
      narration: 'Two: the opening is two plus-one steps in three segments.',
      keyword: '101 = 100 + 1'
    },
    {
      id: 'e10c', scene: 'consolidate', start: 285, end: 292.5,
      caption: 'Then the close: 1102 = 1101 + 1 and 302 = 301 + 1, then 240 seconds of waiting.',
      detail: 'The data of 1000 bytes moves the counter to 1101, the FIN occupies 1101, and the acknowledgment is 1102. The peer\'s FIN at 301 is acknowledged with 302, and the active closer waits twice the maximum segment lifetime.',
      narration: 'Three: the close, two more plus-one steps, then two hundred and forty seconds.',
      keyword: '1102 = 1101 + 1'
    },
    {
      id: 'e10d', scene: 'consolidate', start: 292.5, end: 300,
      caption: 'Six slips: a numbered ACK, a FIN that costs nothing, a zero start, options off the SYN, one-sided close, and no wait.',
      detail: 'Each slip has a counterexample on this page: the acknowledgment that would be 102 instead of 101, the FIN that would leave 1101 unanswered, the zero start that reuses an old connection\'s numbers, the option on a data segment, the close that assumes both directions end together, and the reuse of the four values with no wait.',
      narration: 'Six slips, each with its counterexample: numbered acks, free FINs, a zero start, options off the SYN, one-sided close, and no wait.',
      keyword: 'Six slips',
      trap: 'The two that cost the most marks: treating an ACK as consuming a sequence number, and forgetting that only the active closer waits in TIME-WAIT.'
    }
  ]
};
