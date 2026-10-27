/* ==========================================================================
   layering-switching-and-performance-metrics — THE timeline.
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
      id: 'layers',
      n: 1,
      title: 'Why a network is built out of layers',
      start: 0, end: 30,
      objective: 'See one large problem split into four small ones, and see the message grow a wrapper at each step down.'
    },
    {
      id: 'stacks',
      n: 2,
      title: 'The two reference stacks, and what each layer owns',
      start: 30, end: 60,
      objective: 'Map the seven OSI layers onto the five-layer Internet stack and name each layer\'s unit of data.'
    },
    {
      id: 'encap',
      n: 3,
      title: 'Encapsulation, and which addresses survive a hop',
      start: 60, end: 90,
      objective: 'Follow one message down and up, and see that the link-layer header is replaced at every hop while the network-layer header is not.'
    },
    {
      id: 'circuit',
      n: 4,
      title: 'Circuit switching: reserve first, then send',
      start: 90, end: 120,
      objective: 'Separate the three phases of a circuit and see why the reserved path costs a setup time but never queues.'
    },
    {
      id: 'packet',
      n: 5,
      title: 'Packet switching: datagram and virtual circuit',
      start: 120, end: 150,
      objective: 'Distinguish the two packet-switched designs, and see store-and-forward at a switch.'
    },
    {
      id: 'delays',
      n: 6,
      title: 'Four delays, and the one everybody confuses',
      start: 150, end: 180,
      objective: 'Separate transmission delay from propagation delay, and read the bandwidth-delay product off the wire.'
    },
    {
      id: 'onepacket',
      n: 7,
      title: 'One packet over three store-and-forward links',
      start: 180, end: 210,
      objective: 'Build the end-to-end formula link by link and use it on the GATE CSE 2022 satellite item.'
    },
    {
      id: 'pipeline',
      n: 8,
      title: 'Many packets: the staircase, and why it is not twice the work',
      start: 210, end: 240,
      objective: 'Derive the pipelined total for P packets over N links and check it against GATE CSE 2012 and GATE 2024.'
    },
    {
      id: 'tradeoff',
      n: 9,
      title: 'Two trade-offs: header overhead, and setup against pipelining',
      start: 240, end: 270,
      objective: 'Show that splitting a file into more packets can make it slower, and find when circuit switching beats packet switching.'
    },
    {
      id: 'decide',
      n: 10,
      title: 'The five-step procedure for any network arithmetic question',
      start: 270, end: 300,
      objective: 'Turn the whole lesson into a decision procedure that starts from what the question asks for.'
    }
  ],

  events: [
    /* ---------------- scene 1: why layers ---------------- */
    {
      id: 'layers-1', scene: 'layers', start: 0, end: 7.5,
      caption: 'Two computers, one wire, and four unrelated problems at once.',
      detail: 'A message has to be turned into signals, framed, routed across many networks, and delivered to the right program. Each problem has its own vocabulary and its own failure modes.',
      narration: 'Start with the problem layering exists to solve. Two computers want to exchange a message. Between the text and the wire sit four unrelated problems: turning bits into signals, framing them for one wire, routing them across many networks, and handing them to the right program.',
      keyword: 'layering',
      trap: 'Layering is not decoration on top of the real work. It is a decision about which problems are allowed to know about each other, and that decision is what makes the Internet possible.'
    },
    {
      id: 'layers-2', scene: 'layers', start: 7.5, end: 15,
      caption: 'Solve each problem separately, and define one interface between neighbours.',
      detail: 'Each layer offers a service to the layer above it and uses the service of the layer below. The interface is narrow on purpose, so a layer can be replaced without disturbing the rest.',
      narration: 'So solve each problem separately. A layer offers a service to the layer above and uses the service of the layer below. Keep the interface between them narrow, and you can replace one layer without rewriting the others.',
      keyword: 'interface between neighbours',
      trap: 'A layer only promises a service. It never promises how the service is implemented — which is exactly why the same TCP code runs over copper, fibre or radio.'
    },
    {
      id: 'layers-3', scene: 'layers', start: 15, end: 22.5,
      caption: 'Layer n talks to layer n on the other machine — logically. Physically, the message walks down and up.',
      detail: 'The peer-to-peer conversation is real only in the header that layer n writes for its peer. The bits themselves always travel down the stack, across the wire, and up the other stack.',
      narration: 'Here is the part that confuses people. Layer four on the sender talks to layer four on the receiver, but only logically. The actual movement is downwards through every layer, across the wire, and upwards through every layer on the far side.',
      keyword: 'peer layer, logical only',
      trap: 'There is no direct wire between two peer layers. If a diagram draws a horizontal arrow between them, it is showing a logical conversation, not a physical one.'
    },
    {
      id: 'layers-4', scene: 'layers', start: 22.5, end: 30,
      caption: 'Each step down adds a header. Each step up removes one. That is the whole mechanism.',
      detail: 'Encapsulation is what makes the logical conversation work: layer n puts what it needs to tell its peer at the front of the message, and the layer below treats that whole thing as payload.',
      narration: 'And the mechanism is one idea repeated. Going down, each layer adds a header for its peer. Going up, each layer reads and removes the header its peer wrote. Everything else in this lesson sits on top of that.',
      keyword: 'encapsulation'
    },

    /* ---------------- scene 2: the two stacks ---------------- */
    {
      id: 'stacks-1', scene: 'stacks', start: 30, end: 37.5,
      caption: 'OSI has seven layers. The Internet stack has five. Both describe the same division of labour.',
      detail: 'OSI splits the top into application, presentation and session, and the bottom into physical and data link. The Internet stack merges the first three into one application layer and keeps the bottom two separate.',
      narration: 'Two stacks are in common use. OSI names seven layers. The Internet stack names five. They describe the same division of labour, cut in slightly different places.',
      keyword: 'OSI, TCP/IP',
      trap: 'The Internet does not run OSI. OSI is a reference model for teaching and for naming layers; the deployed protocols follow the Internet stack.'
    },
    {
      id: 'stacks-2', scene: 'stacks', start: 37.5, end: 45,
      caption: 'Application: the conversation. Transport: end to end, process to process.',
      detail: 'The application layer is where HTTP, DNS and SMTP live. The transport layer is the first layer that is end to end: it addresses a process, not a machine, and it runs only in the two end hosts.',
      narration: 'The application layer is the conversation itself — HTTP, DNS, mail. The transport layer is the first end-to-end layer: it addresses a process rather than a machine, and it exists only in the two end hosts, never in a router.',
      keyword: 'end to end',
      trap: 'Routers do not have a transport layer. A transport header is written once by the sender and read once by the receiver; no router in between looks inside it.'
    },
    {
      id: 'stacks-3', scene: 'stacks', start: 45, end: 52.5,
      caption: 'Network: machine to machine across many networks. Link: one hop on one wire.',
      detail: 'The network layer is the highest layer every router implements, and it is the layer that makes the Internet an internet — a network of networks. The link layer is scoped to a single physical hop.',
      narration: 'The network layer gets a packet from one machine to another across many separate networks, and it is the highest layer every router implements. The link layer is smaller in scope: it carries a frame across one hop on one wire.',
      keyword: 'one hop',
      trap: 'The link layer is hop-scoped, so its header is rewritten at every router. The network layer is host-scoped, so its header survives the whole journey.'
    },
    {
      id: 'stacks-4', scene: 'stacks', start: 52.5, end: 60,
      caption: 'Four units of data: message, segment, packet, frame. A router reads two of them.',
      detail: 'Each layer has its own name for the thing it carries. The name matters because it tells you which header a device is allowed to read: a switch reads frames, a router reads packets.',
      narration: 'Each layer gives its unit a different name — message, segment, packet, frame. The names are not pedantry: they tell you which header a device reads. A switch reads frames, a router reads packets, and neither reads a segment.',
      keyword: 'PDU',
      trap: 'A "packet" in everyday speech is any chunk of data. In this lesson it means specifically a network-layer unit, which is what a router forwards.'
    },

    /* ---------------- scene 3: encapsulation ---------------- */
    {
      id: 'encap-1', scene: 'encap', start: 60, end: 67.5,
      caption: 'Four headers, one message. Each layer treats everything above it as payload.',
      detail: 'The application data is wrapped by a transport header, that whole thing by a network header, and that by a link header. Total size grows by the sum of the header sizes.',
      narration: 'Watch one message being prepared. The application data gets a transport header, which addresses a process. The result gets a network header, which addresses a machine. The result gets a link header, which addresses the next hop.',
      keyword: 'payload',
      trap: 'A header is payload to the layer below. If you forget that, you will under-count the size on the wire and get the transmission delay wrong.'
    },
    {
      id: 'encap-2', scene: 'encap', start: 67.5, end: 75,
      caption: 'Source and destination port: which program. Source and destination IP: which machines.',
      detail: 'The transport header carries port numbers, the network header carries IP addresses, the link header carries the hardware addresses of this hop only.',
      narration: 'Each header answers a different question. The transport header says which program. The network header says which two machines. The link header says which two devices on this one wire.',
      keyword: 'port, IP, MAC',
      trap: 'The link-layer destination is the next hop, not the final destination. On the last hop they coincide, which is why this is easy to get wrong.'
    },
    {
      id: 'encap-3', scene: 'encap', start: 75, end: 82.5,
      caption: 'At a router: strip the link header, choose the next hop, write a new link header. The packet is untouched.',
      detail: 'A router decapsulates only to the network layer. It reads the destination IP, consults its table, and re-encapsulates in a fresh link frame for the next hop.',
      narration: 'Now the packet reaches a router. The router strips the link header, reads the destination address in the network header, picks the next hop, and writes a brand-new link header for that hop. The network header it never rewrites.',
      keyword: 're-encapsulation',
      trap: 'This is why the link-layer header cannot be used to identify the original sender end to end. By the last hop it names only the previous router.'
    },
    {
      id: 'encap-4', scene: 'encap', start: 82.5, end: 90,
      caption: 'At the receiver the process repeats in reverse until only application data is left.',
      detail: 'Each layer checks the header addressed to it, removes it, and hands the remainder up. What arrives at the application is byte-for-byte what was sent.',
      narration: 'At the receiver the same four steps run in reverse. Each layer reads the header its peer wrote, removes it, and passes the rest upwards. What reaches the application is exactly what left the sender.',
      keyword: 'decapsulation'
    },

    /* ---------------- scene 4: circuit switching ---------------- */
    {
      id: 'circuit-1', scene: 'circuit', start: 90, end: 97.5,
      caption: 'Circuit switching begins with a setup that reserves capacity on every link of the path.',
      detail: 'A setup message travels the path and each switch commits a fixed slice of its capacity to this call. If any link cannot spare the slice, the call is refused.',
      narration: 'Circuit switching has three phases. First, setup. A setup message walks the path, and every switch along it reserves a fixed slice of its capacity for this call. If one link cannot spare the slice, the call is refused outright.',
      keyword: 'setup',
      trap: 'The reservation is the point. A circuit that is set up but idle still holds its capacity — which is exactly what makes the telephone network predictable and wasteful.'
    },
    {
      id: 'circuit-2', scene: 'circuit', start: 97.5, end: 105,
      caption: 'Then data flows continuously along the reserved path. No switch ever stores it.',
      detail: 'Because the slice is reserved, bits stream straight through. There is no store-and-forward step, no queue at a switch, and no per-packet decision.',
      narration: 'Second, data. Because the capacity is already reserved, bits stream straight through. No switch stores a packet, waits for the whole thing, and forwards it. There is no queue, and there is no per-packet decision to make.',
      keyword: 'no store-and-forward',
      trap: 'This is the sharpest structural difference from packet switching: a circuit does not pay a transmission delay once per link, because nothing is buffered whole.'
    },
    {
      id: 'circuit-3', scene: 'circuit', start: 105, end: 112.5,
      caption: 'Teardown releases the reservation. The cost of the call is the setup plus the data time.',
      detail: 'Total time is setup plus data transfer plus propagation. The setup is paid once, before any data moves, whether the call is long or short.',
      narration: 'Third, teardown, which releases the reservation. So the cost of a circuit is a one-time setup, then the data at the reserved rate. The setup is paid whether the transfer is long or short.',
      keyword: 'setup plus data',
      trap: 'The setup is a fixed cost. For a short transfer it can dominate the whole time, which is why the Internet does not set up a circuit for every web request.'
    },
    {
      id: 'circuit-4', scene: 'circuit', start: 112.5, end: 120,
      caption: 'Guaranteed rate, no queueing, wasted silence. That is the circuit bargain.',
      detail: 'A circuit gives a constant rate and no contention, at the price of holding capacity that is unused whenever the sender pauses.',
      narration: 'So a circuit buys you a guaranteed rate and no contention, and it charges you for silence. That bargain suits a telephone call, where the sender never pauses for long, and it fits data traffic badly.',
      keyword: 'reserved capacity'
    },

    /* ---------------- scene 5: packet switching ---------------- */
    {
      id: 'packet-1', scene: 'packet', start: 120, end: 127.5,
      caption: 'Packet switching cuts the message into packets and sends each one when it is ready.',
      detail: 'There is no setup. Each packet carries its own destination address in its network header, so any switch can decide what to do with it without knowing about the others.',
      narration: 'Packet switching does the opposite. There is no setup at all. The message is cut into packets, and each packet carries a full destination address, so any switch can handle it without knowing anything about the rest.',
      keyword: 'no setup',
      trap: 'Because there is no reservation, a burst can overflow a queue. That is the price: packet switching trades a guarantee for efficiency.'
    },
    {
      id: 'packet-2', scene: 'packet', start: 127.5, end: 135,
      caption: 'Store-and-forward: a switch receives the whole packet, then transmits it on.',
      detail: 'The packet must be complete before it can be checked and forwarded, so each hop adds one full transmission time. This is the source of the pipelining arithmetic later in the lesson.',
      narration: 'At each switch the packet is stored and then forwarded. The switch waits until the whole packet has arrived, because it cannot forward what it has not fully received. So every hop costs one full transmission time.',
      keyword: 'store-and-forward',
      trap: 'Cut-through switching exists and forwards after reading only the header. GATE questions almost always mean store-and-forward unless they say otherwise — state the assumption.'
    },
    {
      id: 'packet-3', scene: 'packet', start: 135, end: 142.5,
      caption: 'Datagram: every packet is routed on its own, and two packets may take different paths.',
      detail: 'In a datagram network the switch consults a table per packet. Packets of one message can arrive out of order, so the transport layer must reassemble them.',
      narration: 'There are two ways to do this. In a datagram network, every packet is routed independently. Two packets of the same message can take different paths, and they can arrive out of order — which is why the transport layer has to put them back together.',
      keyword: 'datagram',
      trap: 'Different paths and reordering are not a fault. They are a consequence of independent per-packet routing, and IP is designed to tolerate them.'
    },
    {
      id: 'packet-4', scene: 'packet', start: 142.5, end: 150,
      caption: 'Virtual circuit: a label is set up once, and every packet follows the same path.',
      detail: 'A virtual circuit sets up state in each switch and gives the flow a short label. Packets then carry the label, not a full address. But no capacity is reserved, so it can still queue.',
      narration: 'A virtual circuit sits between the two. A label is established once, at setup, and every packet of the flow follows the same path carrying that short label. But no capacity is reserved, so a virtual circuit can still queue and still lose packets.',
      keyword: 'virtual circuit',
      trap: 'A virtual circuit is connection-oriented but not reserved. It shares the circuit\'s setup phase and the datagram network\'s contention — it is not circuit switching under a new name.'
    },

    /* ---------------- scene 6: the four delays ---------------- */
    {
      id: 'delays-1', scene: 'delays', start: 150, end: 157.5,
      caption: 'Transmission delay: how long to push the whole packet onto the wire. Length divided by rate.',
      detail: 'Transmission delay is L over R, where L is the packet size in bits and R the link rate in bits per second. It depends on the packet and the rate, and not at all on how long the wire is.',
      narration: 'Now the arithmetic. Transmission delay is the time to push every bit of the packet onto the wire: packet size in bits, divided by the link rate in bits per second. It depends on the packet and the rate, and not on the length of the wire.',
      keyword: 'transmission delay = L / R',
      trap: 'This is the delay that shrinking the packet helps. Shortening the wire does nothing to it.'
    },
    {
      id: 'delays-2', scene: 'delays', start: 157.5, end: 165,
      caption: 'Propagation delay: how long one bit takes to cross the wire. Length divided by speed.',
      detail: 'Propagation delay is distance over propagation speed. It depends on the medium and the distance, and not at all on the packet size or the link rate.',
      narration: 'Propagation delay is different. It is the time for one bit to cross the wire: distance divided by the speed in the medium. It does not depend on the packet size, and it does not depend on the link rate.',
      keyword: 'propagation delay = d / v',
      trap: 'The single most common error in this topic is swapping these two. Ask which one changes when you double the rate: only transmission delay does.'
    },
    {
      id: 'delays-3', scene: 'delays', start: 165, end: 172.5,
      caption: 'Queuing and processing delays sit at the switch. Unless the question gives them, take both as zero.',
      detail: 'Processing delay is the time to read the header and choose an output port. Queuing delay is the wait behind other packets in the output buffer. Both are properties of the node, not the link.',
      narration: 'Two more delays live at the switch. Processing delay is reading the header and choosing an output. Queuing delay is waiting behind other packets in the buffer. Unless a question gives them a value, take both as zero and say so.',
      keyword: 'processing, queuing',
      trap: 'A GATE question that gives a forwarding delay is giving you processing delay. Leaving it out because "we always ignore it" is the trap.'
    },
    {
      id: 'delays-4', scene: 'delays', start: 172.5, end: 180,
      caption: 'Rate times propagation delay is the number of bits that fit on the wire — the bandwidth-delay product.',
      detail: 'A link of rate R with one-way propagation delay Tp holds R times Tp bits in flight. That is how much data can be outstanding before the first acknowledgement could possibly return.',
      narration: 'One more quantity. Multiply the rate by the propagation delay and you get the number of bits that fit on the wire at once — the bandwidth-delay product. It is how much data can be in flight before any acknowledgement could come back.',
      keyword: 'bandwidth-delay product',
      trap: 'The product uses the one-way propagation delay. Using the round-trip time gives the bits in flight over a whole round trip, which is a different and also useful number.'
    },

    /* ---------------- scene 7: one packet over N links ---------------- */
    {
      id: 'onepacket-1', scene: 'onepacket', start: 180, end: 187.5,
      caption: 'One packet, three links. It pays a transmission delay on every link it crosses.',
      detail: 'Store-and-forward means the packet is fully received before it is forwarded, so the transmission delay is paid once per link. With equal links that is three times L over R.',
      narration: 'Take one packet crossing three links. Because each switch stores the whole packet before forwarding it, the transmission delay is paid once on every link. With three equal links, that is three transmission delays.',
      keyword: 'once per link',
      trap: 'The transmission delay is not paid once for the journey. It is paid once per hop, and the count of hops is the number of links, not the number of routers.'
    },
    {
      id: 'onepacket-2', scene: 'onepacket', start: 187.5, end: 195,
      caption: 'It also pays propagation delay on every link. Add the two sums, and that is the answer.',
      detail: 'End-to-end delay for one packet is the sum of transmission delays plus the sum of propagation delays, one term of each per link. With unequal links, sum them link by link.',
      narration: 'It also crosses every wire, so it pays propagation delay on every link too. Add the transmission terms and the propagation terms and you have the end-to-end delay. If the links differ, sum them one link at a time.',
      keyword: 'sum over links',
      trap: 'For unequal links there is no single "the" rate. Sum each link\'s own term rather than assuming they are all the same.'
    },
    {
      id: 'onepacket-3', scene: 'onepacket', start: 195, end: 202.5,
      caption: 'GATE CSE 2022: 1000 bytes over 100 Mbps, 2100 km at 3 times 10 to the 8. The answer is 7.08 ms.',
      detail: 'Transmission is 8000 bits over 100 million bits per second, which is 0.08 ms. Propagation is 2.1 million metres over 3 times 10 to the 8, which is 7 ms. The total is 7.08 ms.',
      narration: 'Here is that formula on a real question. A thousand bytes is eight thousand bits. At a hundred megabits per second that is zero point zero eight milliseconds of transmission. Two thousand one hundred kilometres at three times ten to the eight metres per second is seven milliseconds of propagation. The total is seven point zero eight milliseconds.',
      keyword: '7.08 ms',
      trap: 'Propagation dominates by a factor of nearly ninety here. If your answer is close to 0.08 ms you computed only the transmission delay.'
    },
    {
      id: 'onepacket-4', scene: 'onepacket', start: 202.5, end: 210,
      caption: 'Notice that the packet size barely matters. On a long fast link, distance is the whole cost.',
      detail: 'The transmission term is 0.08 ms and the propagation term is 7 ms. Halving the packet size or doubling the rate changes almost nothing.',
      narration: 'Look at what dominates. The packet size barely matters on this link. Halving it, or doubling the rate, changes almost nothing, because the distance is the whole cost. That is the counterexample to "more bandwidth means less delay".',
      keyword: 'distance dominates'
    },

    /* ---------------- scene 8: many packets ---------------- */
    {
      id: 'pipeline-1', scene: 'pipeline', start: 210, end: 217.5,
      caption: 'Send many packets back to back and the links start working at the same time.',
      detail: 'While the second link carries packet one, the first link is already carrying packet two. The transmissions overlap, so the total is much less than the sum of every packet on every link.',
      narration: 'Now send many packets instead of one. While the second link carries packet one, the first link is already carrying packet two. The links work at the same time, so the total is far less than adding every packet on every link.',
      keyword: 'pipelining',
      trap: 'This overlap is why the answer to a multi-packet question is not P times the single-packet answer. That multiplication is the classic wrong option.'
    },
    {
      id: 'pipeline-2', scene: 'pipeline', start: 217.5, end: 225,
      caption: 'The first packet needs every link. Each later packet finishes one transmission time after the one before.',
      detail: 'The first packet pays N transmission delays and N propagation delays. Each of the remaining P minus 1 packets adds exactly one transmission delay, because the pipeline is already full.',
      narration: 'The first packet has to cross every link, so it pays N transmission delays and N propagation delays. After that the pipeline is full, and each remaining packet finishes exactly one transmission time after the one before it.',
      keyword: 'first packet, then one per packet',
      trap: 'It is N plus P minus 1 transmission times, not N times P. The minus one is the whole point of pipelining.'
    },
    {
      id: 'pipeline-3', scene: 'pipeline', start: 225, end: 232.5,
      caption: 'GATE CSE 2012: 1000 packets of 1000 bits over three links at 1 Mbps. Total 1005 ms.',
      detail: 'Transmission is 1 ms and propagation is 1 ms per link. Three links and a thousand packets give 1002 transmission terms and 3 propagation terms, so 1005 ms.',
      narration: 'That formula on the 2012 question. A thousand packets of a thousand bits, three links, one megabit per second. Transmission is one millisecond per packet per link and propagation is one millisecond per link. One thousand and two transmission terms plus three propagation terms gives one thousand and five milliseconds.',
      keyword: '1005 ms',
      trap: 'Adding 3000 ms multiplies the transmission by the link count for every packet. The correct count is N plus P minus 1, which is 1002.'
    },
    {
      id: 'pipeline-4', scene: 'pipeline', start: 232.5, end: 240,
      caption: 'GATE 2024: 1000 chunks over two links. The second link adds one chunk time, so 8.008 s.',
      detail: 'Each chunk takes 8 ms on each link. The thousandth chunk is fully received at the first router at 8 s, and needs one more chunk time, so the total is 8.008 s.',
      narration: 'And on the 2024 question: a thousand chunks over two links. Each chunk takes eight milliseconds. The last chunk reaches the router at eight seconds and needs one more chunk time, so the answer is eight point zero zero eight seconds.',
      keyword: '8.008 s',
      trap: 'Sixteen seconds is the answer if you forget that the router forwards while it receives. Two links cost one extra chunk time, not a second full pass.'
    },

    /* ---------------- scene 9: two trade-offs ---------------- */
    {
      id: 'tradeoff-1', scene: 'tradeoff', start: 240, end: 247.5,
      caption: 'Smaller packets pipeline better but repeat the headers more often.',
      detail: 'Splitting a file into more packets lets more links work in parallel, but every packet carries the same headers, so the total bytes on the wire grow.',
      narration: 'Two trade-offs decide most of these questions. First: smaller packets pipeline better, because more of them are in flight at once. But every packet repeats the same headers, so the total number of bytes on the wire goes up.',
      keyword: 'header overhead',
      trap: 'A header is not a rounding error. In the 2014 question it is 100 bytes against 100 bytes of data, which is a hundred percent overhead.'
    },
    {
      id: 'tradeoff-2', scene: 'tradeoff', start: 247.5, end: 255,
      caption: 'GATE CSE 2014: one packet takes 3300 microseconds, ten packets 2400, twenty packets 3300 again.',
      detail: 'One packet: 1100 bytes over three links gives 3300. Ten packets of 200 bytes give 12 times 200, which is 2400. Twenty packets of 150 bytes give 22 times 150, which is 3300.',
      narration: 'On the 2014 question the arithmetic is clean. One packet of eleven hundred bytes over three links is three thousand three hundred microseconds. Ten packets of two hundred bytes is twelve transmission times, twenty-four hundred. Twenty packets of a hundred and fifty bytes is twenty-two times a hundred and fifty, back up to three thousand three hundred.',
      keyword: '3300, 2400, 3300',
      trap: 'So more packets is not monotonically better. The minimum sits in the middle, which is why the answer is that the first and third are equal and both are worse than the second.'
    },
    {
      id: 'tradeoff-3', scene: 'tradeoff', start: 255, end: 262.5,
      caption: 'Second trade-off: a circuit pays a setup once. Packets pay one packet time per extra link.',
      detail: 'A circuit costs setup plus the data time. Packet switching costs the data time plus N minus 1 extra packet times. The circuit wins exactly when the setup is cheaper than that overhead.',
      narration: 'The second trade-off is setup against pipelining. A circuit pays a setup once and then sends at the reserved rate. Packet switching pays no setup but loses one packet time on every link after the first. So the circuit wins when the setup is cheaper than that overhead.',
      keyword: 'setup against pipelining',
      trap: 'The comparison is not "circuits are slow". It is an inequality, and either side can win depending on the setup time and the packet size.'
    },
    {
      id: 'tradeoff-4', scene: 'tradeoff', start: 262.5, end: 270,
      caption: 'Throughput is set by the slowest link, and the bits in flight are set by rate times delay.',
      detail: 'On a path of links in series, throughput cannot exceed the minimum rate. The bandwidth-delay product says how much data must be outstanding to keep that rate busy.',
      narration: 'And two numbers summarise the path. Throughput is capped by the slowest link, because bits cannot arrive faster than the narrowest point can carry them. The bandwidth-delay product says how much data must be outstanding to keep even that rate busy.',
      keyword: 'bottleneck link',
      trap: 'Adding a fast link to a path with one slow link does nothing. The bottleneck is a minimum, not an average.'
    },

    /* ---------------- scene 10: the procedure ---------------- */
    {
      id: 'decide-1', scene: 'decide', start: 270, end: 277.5,
      caption: 'Step one: write down L, R, d, v and P before touching any formula.',
      detail: 'Most lost marks in this topic are unit errors, not conceptual ones. Convert every size to bits, every rate to bits per second, every distance to metres.',
      narration: 'Here is the procedure. Step one: before any formula, write down the five quantities — packet size, rate, distance, speed and packet count — in consistent units. Most lost marks here are unit errors, not conceptual ones.',
      keyword: 'units first',
      trap: 'A rate in Mbps is a power of ten; a file size in MB may be either. The question will tell you, and if it does not, say which convention you used.'
    },
    {
      id: 'decide-2', scene: 'decide', start: 277.5, end: 285,
      caption: 'Step two: one packet or many? That single question picks the formula.',
      detail: 'One packet uses the sum of transmission and propagation over the links. Many packets use N plus P minus 1 transmission terms. Circuits use setup plus data.',
      narration: 'Step two: ask whether the question sends one packet or many. One packet sums the terms over the links. Many packets use N plus P minus 1 transmission terms. A circuit uses setup plus data time.',
      keyword: 'one packet or many',
      trap: 'A "file" is many packets. A "message" or a single chunk is one. Reading which one the question means is half the work.'
    },
    {
      id: 'decide-3', scene: 'decide', start: 285, end: 292.5,
      caption: 'Step three: check which delays the question told you to ignore, and ignore only those.',
      detail: 'Ignoring queuing and processing is a stated assumption in most items. Ignoring propagation is only valid when the question says so, or when the link is negligible.',
      narration: 'Step three: re-read which delays the question told you to ignore, and drop only those. Ignoring queuing and processing is nearly always stated. Ignoring propagation is only safe when the question says so.',
      keyword: 'stated assumptions',
      trap: 'Dropping propagation because "it is usually small" is wrong on any long link. On a satellite link it is the entire answer.'
    },
    {
      id: 'decide-4', scene: 'decide', start: 292.5, end: 300,
      caption: 'Step four: sanity-check the units, then the magnitude, then the option.',
      detail: 'Convert the answer back to the unit the question asked for, check it against the dominant term, and only then choose an option.',
      narration: 'Step four: convert back to the unit asked for, compare the answer with the dominant term to see whether it is the right order of magnitude, and only then pick an option. That habit catches nearly every error in this chapter.',
      keyword: 'sanity-check'
    }
  ]
};
