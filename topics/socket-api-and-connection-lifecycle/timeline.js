/* ==========================================================================
   socket-api-and-connection-lifecycle — THE timeline.
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
      id: 'endpoints',
      n: 1,
      title: 'A socket is an endpoint, not a connection',
      start: 0, end: 30,
      objective: 'Say what a socket identifies, and why a connection is named by four numbers rather than by one port.'
    },
    {
      id: 'calls',
      n: 2,
      title: 'The server makes five calls, the client two',
      start: 30, end: 60,
      objective: 'Order the system calls on both sides and say what each one changes in the kernel.'
    },
    {
      id: 'accept',
      n: 3,
      title: 'accept returns a new socket; the old one keeps listening',
      start: 60, end: 90,
      objective: 'Distinguish the listening socket from the connected socket, and count the sockets in a running system.'
    },
    {
      id: 'handshake',
      n: 4,
      title: 'The handshake happens inside connect and accept',
      start: 90, end: 120,
      objective: 'Place SYN, SYN-ACK and ACK on a timeline and say which call returns after which segment.'
    },
    {
      id: 'backlog',
      n: 5,
      title: 'listen(fd, n): the queue behind accept',
      start: 120, end: 150,
      objective: 'Read the backlog as the length of the completed-connection queue, and count what is dropped when it overflows.'
    },
    {
      id: 'tuple',
      n: 6,
      title: 'One server port, many simultaneous connections',
      start: 150, end: 180,
      objective: 'Count how many connections a single server endpoint can hold, and see why the server does not run out of ports.'
    },
    {
      id: 'timewait',
      n: 7,
      title: 'TIME_WAIT: who waits, for how long, and why',
      start: 180, end: 210,
      objective: 'Name the side that enters TIME_WAIT, the two reasons it exists, and the difference between the specification and Linux.'
    },
    {
      id: 'exhaustion',
      n: 8,
      title: 'Ephemeral port exhaustion, counted',
      start: 210, end: 240,
      objective: 'Turn a connection rate and a TIME_WAIT duration into the number of ports in use, and find the ceiling.'
    },
    {
      id: 'udp',
      n: 9,
      title: 'The same API without a connection',
      start: 240, end: 270,
      objective: 'Write the UDP call sequence and say what disappears when there is no handshake and no connection state.'
    },
    {
      id: 'procedure',
      n: 10,
      title: 'The procedure, and the five traps',
      start: 270, end: 300,
      objective: 'Run a four-step procedure on any socket question, and recognise the five traps by sight.'
    }
  ],

  events: [

    /* ---------------- scene 1: endpoints ---------------- */
    {
      id: 'ep-1', scene: 'endpoints', start: 0, end: 7.5,
      caption: 'A socket names one endpoint: an address and a port. The port is the part the program chooses.',
      detail: 'A socket is a handle on one endpoint of a conversation. Its identity is a pair, the IP address and the transport port, written address:port. The address says which machine, the port says which process on that machine.',
      narration: 'A socket is one end of a conversation, and it is named by two things: an address, which says which machine, and a port, which says which process on that machine.',
      keyword: 'endpoint = address + port',
      trap: 'A port is not a process id and not a connection. Many processes over the years share one port number, and one process can hold many ports.'
    },
    {
      id: 'ep-2', scene: 'endpoints', start: 7.5, end: 15,
      caption: 'A connection is named by four numbers: source address, source port, destination address, destination port.',
      detail: 'TCP identifies a connection by the pair of endpoints, called the four-tuple. The kernel demultiplexes an arriving segment by looking at all four fields, not at the destination port alone.',
      narration: 'The connection is the pair of endpoints. Four numbers: the client address and port, the server address and port. The kernel looks at all four to decide which socket a segment belongs to.',
      keyword: 'four numbers, not one',
      trap: 'Two connections can share a server port. They cannot share all four numbers. That is why a web server needs only one port.'
    },
    {
      id: 'ep-3', scene: 'endpoints', start: 15, end: 22.5,
      caption: 'The port space is 16 bits: 1024 well-known, 48128 registered, 16384 dynamic, summing to 65536.',
      detail: 'Ports run from 0 to 65535. RFC 6335 divides them into the system range 0 to 1023, the user or registered range 1024 to 49151, and the dynamic or private range 49152 to 65535. The three sizes are 1024, 48128 and 16384.',
      narration: 'Sixteen bits of port, so sixty-five thousand five hundred and thirty-six numbers. One thousand and twenty-four are the well-known ports a server binds. Then forty-eight thousand one hundred and twenty-eight registered ones, and sixteen thousand three hundred and eighty-four dynamic ones.',
      keyword: '1024 + 48128 + 16384',
      trap: 'The three ranges sum to 65536, not to 65535. Counting the boundary port twice, or losing port zero, breaks the sum.'
    },
    {
      id: 'ep-4', scene: 'endpoints', start: 22.5, end: 30,
      caption: 'So the unit of a socket question is a pair, and the unit of a connection question is a four-tuple.',
      detail: 'Most marks lost in this clause come from answering in the wrong unit: counting sockets when the question asks for connections, or counting connections when it asks for ports. Name the unit before computing.',
      narration: 'That is the whole vocabulary. A socket is a pair. A connection is a four-tuple. Before you compute anything, decide which of the two the question is asking you to count.',
      keyword: 'pair against four-tuple',
      trap: 'A question that says "how many sockets" is not asking for connections, and the answer differs by one for every connection on the server side.'
    },

    /* ---------------- scene 2: calls ---------------- */
    {
      id: 'ca-1', scene: 'calls', start: 30, end: 37.5,
      caption: 'The server calls socket, then bind, then listen. Only after listen can a client reach it.',
      detail: 'socket() returns an unbound descriptor. bind() fixes the local address and port, and is what makes the port known to the network. listen() marks the socket passive, so arriving SYNs are answered instead of refused.',
      narration: 'The server asks for a socket, then binds it to an address and a port, then listens. Until the listen call the port is not answering anybody: a SYN that arrives before it gets a refusal, not a handshake.',
      keyword: 'socket, bind, listen',
      trap: 'bind does not accept anything, and listen does not accept anything. listen only changes the state of the socket to LISTEN.'
    },
    {
      id: 'ca-2', scene: 'calls', start: 37.5, end: 45,
      caption: 'The client calls socket and connect. connect binds an ephemeral port implicitly and sends the SYN.',
      detail: 'A client normally does not call bind. connect() chooses a free local port from the ephemeral range, records the peer, and starts the three-way handshake. The port it chose can be read afterwards with getsockname.',
      narration: 'The client has two calls. socket, then connect. connect does the binding for it: it picks a free port from the ephemeral range and starts the handshake. That is why a client never writes bind.',
      keyword: 'connect binds implicitly',
      trap: 'A client that calls bind first is not wrong, but it must choose a port itself and can collide with a port already in TIME_WAIT.'
    },
    {
      id: 'ca-3', scene: 'calls', start: 45, end: 52.5,
      caption: 'accept takes one completed connection off the queue and returns a descriptor for it. It does not answer the SYN.',
      detail: 'accept() blocks until the completed-connection queue is non-empty, removes the first entry, and returns a new descriptor connected to that peer. The listening socket is untouched and still in LISTEN.',
      narration: 'accept does one thing: it takes a finished connection off the queue and gives you a new descriptor for it. It never touches the listening socket, which goes on listening.',
      keyword: 'takes one off the queue',
      trap: 'accept does not perform the handshake. The handshake is finished by the kernel before the connection ever reaches the queue.'
    },
    {
      id: 'ca-4', scene: 'calls', start: 52.5, end: 60,
      caption: 'Then read and write on the connected descriptor, and close it. The listening socket closes separately.',
      detail: 'Data flows only on the connected descriptor. close() on it starts the four-way teardown. close() on the listening socket stops new connections; existing ones survive it.',
      narration: 'Data goes on the new descriptor, never on the listening one. Closing the connected descriptor starts the teardown. Closing the listening socket stops new arrivals and leaves the open connections alone.',
      keyword: 'data on the connected fd',
      trap: 'Reading from a listening socket fails. A program that forgets to keep the return value of accept reads and writes on the wrong descriptor.'
    },

    /* ---------------- scene 3: accept ---------------- */
    {
      id: 'ac-1', scene: 'accept', start: 60, end: 67.5,
      caption: 'After one client connects, the server holds two sockets on the same local port 443.',
      detail: 'The listening socket has local port 443 and no peer. The connected socket also has local port 443, and now has a peer. They are distinguished by the peer, which is the other half of the four-tuple.',
      narration: 'One client, two sockets at the server, both with local port four four three. One has no peer and listens. The other has a peer and carries data. The port is the same; the peer is what differs.',
      keyword: 'two sockets, one port',
      trap: 'Seeing two sockets on port 443 and concluding that the port was bound twice. It was bound once; accept created the second socket without binding.'
    },
    {
      id: 'ac-2', scene: 'accept', start: 67.5, end: 75,
      caption: 'Every accept returns a fresh descriptor. Descriptors 3, 4, 5 and so on, one per connection.',
      detail: 'Descriptors are per-process small integers, reused after close. A server that accepts a hundred connections holds a hundred connected descriptors plus one listening descriptor.',
      narration: 'Each accept hands back a new descriptor. Three, then four, then five. A hundred connections means a hundred descriptors, plus the one that is still listening.',
      keyword: 'a fresh descriptor each time',
      trap: 'The descriptor number is not the port number, and it is not stable across runs. It is a slot in the process table.'
    },
    {
      id: 'ac-3', scene: 'accept', start: 75, end: 82.5,
      caption: 'So a server with N connections holds 1 + 2N sockets in the system: one listening, N at the server, N at the clients.',
      detail: 'Count both machines. The server holds the listening socket plus one per connection. Each client holds one. That gives one plus twice N over the whole system, which is the quantity a counting question usually wants.',
      narration: 'Count the whole system. One listening socket. N connected sockets at the server. N at the clients. One plus two N. For eight connections that is seventeen sockets.',
      keyword: '1 + 2N',
      trap: 'Counting only the server gives 1 + N. Counting only the connections gives N. Read which of the three the question wants.'
    },
    {
      id: 'ac-4', scene: 'accept', start: 82.5, end: 90,
      caption: 'A server therefore scales by descriptors and memory, not by port numbers.',
      detail: 'Because every connection is distinguished by its peer, a single listening port serves arbitrarily many clients. The real limits are the descriptor table, the memory per connection, and the accept queue, never the port space.',
      narration: 'This is why one port serves a whole website. The server never runs out of ports, because it never needs a second one. What it can run out of is descriptors and memory.',
      keyword: 'descriptors, not ports',
      trap: 'The phrase "the server ran out of ports" is almost always wrong. The party that runs out of ports is the client, on its outgoing side.'
    },

    /* ---------------- scene 4: handshake ---------------- */
    {
      id: 'hs-1', scene: 'handshake', start: 90, end: 97.5,
      caption: 'connect sends a SYN and waits. Half a round trip later the server answers SYN-ACK.',
      detail: 'The client sends SYN with its initial sequence number. The server, if the port is listening and the queue has room, replies SYN-ACK with its own sequence number and an acknowledgement. The server connection is now in SYN-RECEIVED.',
      narration: 'The client sends a SYN and waits. Half a round trip later the server answers with SYN-ACK, and its own connection moves to SYN-received. Nothing is established yet.',
      keyword: 'SYN, then SYN-ACK',
      trap: 'The server has already spent state at this point. A flood of SYNs with no final ACK is what fills the queue, which is why the queue has two halves.'
    },
    {
      id: 'hs-2', scene: 'handshake', start: 97.5, end: 105,
      caption: 'connect returns when the SYN-ACK arrives, at one round trip. The final ACK is still in flight.',
      detail: 'A blocking connect() returns once the SYN-ACK has been received. The third segment, the ACK, is sent by the kernel at that moment and needs another half round trip to arrive. So the client is usable half a round trip before the server knows.',
      narration: 'connect returns at one round trip, when the SYN-ACK lands. The third segment is in flight at that moment. So the client can write before the server has finished.',
      keyword: 'connect returns at 1 RTT',
      trap: 'Saying connect returns when the handshake is complete. It returns when the client has what it needs, which is one segment earlier.'
    },
    {
      id: 'hs-3', scene: 'handshake', start: 105, end: 112.5,
      caption: 'accept returns at one and a half round trips, when the ACK arrives and the connection joins the queue.',
      detail: 'The final ACK completes the handshake at the server, which moves the connection to ESTABLISHED and places it on the completed queue. A blocked accept() then returns. The gap between the two returns is half a round trip.',
      narration: 'accept returns half a round trip after connect does. That is when the ACK arrives, the connection becomes established, and it joins the queue the accept call is waiting on.',
      keyword: 'accept returns at 1.5 RTT',
      trap: 'A question that asks when the connection is established is asking about the server, which is at one and a half round trips, not one.'
    },
    {
      id: 'hs-4', scene: 'handshake', start: 112.5, end: 120,
      caption: 'The passive states are LISTEN, then SYN-RECEIVED, then ESTABLISHED. The client goes SYN-SENT, then ESTABLISHED.',
      detail: 'RFC 793 names the states. The server side of a normal open passes through LISTEN, SYN-RECEIVED and ESTABLISHED. The client passes through SYN-SENT and ESTABLISHED. Every segment in the handshake moves exactly one side by one state.',
      narration: 'Three states on the server: listen, syn-received, established. Two on the client: syn-sent, established. Each segment of the handshake moves one side forward by one state.',
      keyword: 'LISTEN, SYN-RCVD, ESTABLISHED',
      trap: 'SYN-SENT and SYN-RECEIVED are different states on different machines. A simultaneous open puts both sides in SYN-RECEIVED, which is the case the diagrams usually omit.'
    },

    /* ---------------- scene 5: backlog ---------------- */
    {
      id: 'bl-1', scene: 'backlog', start: 120, end: 127.5,
      caption: 'listen(fd, n) says how many completed connections may wait for accept: the backlog is a queue length.',
      detail: 'The second argument of listen bounds the completed-connection queue, the accept queue. It is a count of connections, not a rate and not a number of SYNs. Linux additionally caps the value at somaxconn.',
      narration: 'The second argument of listen is a queue length. It says how many finished connections may sit waiting for an accept call. It is not a rate, and it is not a number of ports.',
      keyword: 'a queue length',
      trap: 'The backlog is not the number of clients the server can serve. It is only the number that can wait unaccepted at one moment.'
    },
    {
      id: 'bl-2', scene: 'backlog', start: 127.5, end: 135,
      caption: 'Six arrivals, a queue of two, and two accepts: four get queued, two are dropped.',
      detail: 'Simulate the queue: arrivals at 0, 1, 2, 3, 4 and 5 seconds, accepts at 2.5 and 4.5, capacity 2. Arrivals at 0 and 1 fill the queue, the arrival at 2 is dropped, the accept at 2.5 frees a slot, the arrival at 3 fills it, the arrival at 4 is dropped, the accept at 4.5 frees a slot, and the arrival at 5 is queued.',
      narration: 'Six arrivals, two accepts, room for two. Two are queued at the start, the third is dropped. An accept frees a slot, the next arrival takes it, and the pattern repeats. Four queued, two dropped.',
      keyword: '6 arrivals, 4 queued, 2 dropped',
      trap: 'A dropped SYN is not an error to the client. It retransmits after a timeout, so the loss shows up as latency, not as a failure message.'
    },
    {
      id: 'bl-3', scene: 'backlog', start: 135, end: 142.5,
      caption: 'The invariant: every arrival is either queued or dropped, and every queued one is accepted or still waiting.',
      detail: 'The queue is a bookkeeping device, so the counts must balance. Queued equals accepted plus still waiting. Arrivals equal queued plus dropped. Those two identities check any hand simulation in one line.',
      narration: 'Two identities check the whole simulation. Queued equals accepted plus still waiting. Arrivals equals queued plus dropped. If either fails, the simulation is wrong, not the question.',
      keyword: 'queued = accepted + waiting',
      trap: 'Adding the queue length to the accepted count and calling it the number of arrivals. The dropped ones are the missing term.'
    },
    {
      id: 'bl-4', scene: 'backlog', start: 142.5, end: 150,
      caption: 'A full queue is what a SYN flood exploits, and it is why a server separates the half-open and completed queues.',
      detail: 'Linux keeps a SYN queue for half-open connections and an accept queue for completed ones. A flood of SYNs with no final ACK fills the first; a slow accept loop fills the second. Both are bounded, and both are counted in connections.',
      narration: 'Two queues, not one. Half-open connections waiting for the final ACK, and completed connections waiting for accept. A flood fills the first; a slow accept loop fills the second.',
      keyword: 'two queues',
      trap: 'Quoting one number for "the backlog" hides which queue is meant. Say half-open or completed, and the arithmetic becomes unambiguous.'
    },

    /* ---------------- scene 6: tuple ---------------- */
    {
      id: 'tu-1', scene: 'tuple', start: 150, end: 157.5,
      caption: 'Fix the server endpoint and the only thing that can vary is the client side.',
      detail: 'For one server address and port, a connection is distinguished by the client address and the client port. So the count of simultaneous connections from one client address is bounded by the number of client ports it can use.',
      narration: 'Hold the server fixed. Then the client address and the client port are the only free fields. From one client address, the ceiling is the number of ports that client can use.',
      keyword: 'client side varies',
      trap: 'Multiplying by the server port range. The server port is fixed by the listener, so it contributes a factor of one.'
    },
    {
      id: 'tu-2', scene: 'tuple', start: 157.5, end: 165,
      caption: 'With the Linux default range, one client address can hold 28232 connections to one server endpoint.',
      detail: 'The Linux default ip_local_port_range is 32768 to 60999 inclusive, which is 28232 ports. Each may be used once per destination endpoint at a time, so 28232 simultaneous connections from that address are possible, before any TIME_WAIT is counted.',
      narration: 'The Linux default range runs from thirty-two thousand seven hundred and sixty-eight to sixty thousand nine hundred and ninety-nine. That is twenty-eight thousand two hundred and thirty-two ports, so that many connections from one address to one endpoint.',
      keyword: '28232 per client address',
      trap: 'Treating 28232 as a limit on total connections. It is a limit per client address per destination endpoint. A second destination doubles it.'
    },
    {
      id: 'tu-3', scene: 'tuple', start: 165, end: 172.5,
      caption: 'Across all clients the space is 2^48 four-tuples: 2^32 addresses times 2^16 ports on each side.',
      detail: 'The four-tuple has two addresses of 32 bits and two ports of 16 bits. For a fixed server endpoint the free fields are the client address and client port, which give 2^32 times 2^16, that is 2^48, roughly 2.8 times 10^14 combinations.',
      narration: 'Over all clients, the free space is two to the forty-eight. Thirty-two bits of client address and sixteen bits of client port. About two point eight times ten to the fourteen.',
      keyword: '2^48 tuples',
      trap: 'Counting 2^64 by adding the two addresses and the two ports as if each were 32 bits. Ports are 16 bits.'
    },
    {
      id: 'tu-4', scene: 'tuple', start: 172.5, end: 180,
      caption: 'So the server side is bounded by descriptors, and the client side by ports. They are different ceilings.',
      detail: 'A busy server holds many connections on one port and is limited by its descriptor table and memory. A busy client or proxy opening many short connections to one endpoint is limited by its ephemeral ports and the time each is held after close.',
      narration: 'Two different ceilings. The server is limited by descriptors and memory, on one port. The client is limited by ports, and by how long each port is held after the connection closes.',
      keyword: 'server: descriptors; client: ports',
      trap: 'Diagnosing a server with thousands of TIME_WAIT entries as a port problem. On the server those entries do not consume ephemeral ports at all.'
    },

    /* ---------------- scene 7: timewait ---------------- */
    {
      id: 'tw-1', scene: 'timewait', start: 180, end: 187.5,
      caption: 'The side that sends the first FIN enters TIME_WAIT. The side that receives it goes to CLOSE-WAIT.',
      detail: 'The active closer passes FIN-WAIT-1, FIN-WAIT-2, TIME-WAIT and then CLOSED. The passive closer passes CLOSE-WAIT, LAST-ACK and then CLOSED. TIME-WAIT is therefore a property of the closer, not of the server or the client by role.',
      narration: 'Whoever sends the first FIN becomes the active closer, and that is the side that ends in TIME-WAIT. The other side waits in CLOSE-WAIT for its own application to close.',
      keyword: 'the closer waits',
      trap: 'Assuming the server always enters TIME_WAIT. It depends on who closed first, which the question must tell you.'
    },
    {
      id: 'tw-2', scene: 'timewait', start: 187.5, end: 195,
      caption: 'It waits so that a lost final ACK can be answered, and so that old duplicates die before the tuple is reused.',
      detail: 'Two reasons. If the final ACK is lost the peer retransmits its FIN, and the waiting side must still exist to acknowledge it instead of answering with a reset. And a delayed segment from the old connection must not be accepted by a new connection that reuses the same four-tuple.',
      narration: 'Two reasons. A lost final ACK needs an answer, and only a socket that still exists can give it. And an old delayed segment must not be taken by a new connection using the same four numbers.',
      keyword: 'lost ACK, old duplicates',
      trap: 'Calling TIME_WAIT a leak. It is the state that makes the close reliable; removing it trades a delay for a correctness bug.'
    },
    {
      id: 'tw-3', scene: 'timewait', start: 195, end: 202.5,
      caption: 'The specification says two times the maximum segment lifetime: 2 x 120 = 240 seconds. Linux uses 60.',
      detail: 'RFC 793 takes the maximum segment lifetime to be two minutes and keeps the socket in TIME-WAIT for twice that, four minutes. Linux hard-codes TCP_TIMEWAIT_LEN at sixty seconds and offers no sysctl for it. Both are correct in their own terms, and a question must say which it means.',
      narration: 'The specification: two minutes of maximum segment lifetime, so four minutes in TIME-WAIT. Linux: a fixed sixty seconds, with no setting to change it. Both are right; they answer different questions.',
      keyword: '240 s by spec, 60 s on Linux',
      trap: 'Quoting four minutes in a question about Linux, or sixty seconds in a question that says "as specified in RFC 793".'
    },
    {
      id: 'tw-4', scene: 'timewait', start: 202.5, end: 210,
      caption: 'TIME_WAIT holds a four-tuple; CLOSE_WAIT holds a descriptor. Only the first blocks a new connection.',
      detail: 'A socket in TIME-WAIT has no descriptor owned by the process; the kernel keeps the tuple reserved. A socket in CLOSE-WAIT is still open in the process and is waiting for the application to call close, which is a program bug when it persists.',
      narration: 'TIME-WAIT is kept by the kernel and holds the four numbers. CLOSE-WAIT is still your descriptor, waiting for your program to close it. One blocks a new connection; the other leaks a descriptor.',
      keyword: 'tuple against descriptor',
      trap: 'Reading a pile of CLOSE-WAIT as normal. It is the signature of an application that never closes what it accepted.'
    },

    /* ---------------- scene 8: exhaustion ---------------- */
    {
      id: 'ex-1', scene: 'exhaustion', start: 210, end: 217.5,
      caption: 'Ports in use equals the connection rate times the seconds each port is held.',
      detail: 'A client closing first holds each port for the TIME_WAIT interval. If it opens r connections per second to one endpoint and each is held h seconds, then r times h ports are unavailable at any moment. That product, against 28232, is the whole question.',
      narration: 'Multiply the rate by the holding time. If each connection holds a port for sixty seconds and you open four hundred and seventy a second, twenty-eight thousand two hundred ports are busy at any moment.',
      keyword: 'ports in use = rate x hold',
      trap: 'Using the connection duration instead of the TIME_WAIT duration. The port is held after the connection is gone, and that is the part that bites.'
    },
    {
      id: 'ex-2', scene: 'exhaustion', start: 217.5, end: 225,
      caption: '28232 ports held for 60 seconds gives 470 new connections per second. 471 exceeds the range.',
      detail: '28232 divided by 60 is 470.53, so 470 connections per second use 28200 ports and fit, while 471 use 28260 and do not. The ceiling is a floor, not a rounding: the sustainable rate is the largest integer whose product with the hold time stays inside the range.',
      narration: 'Twenty-eight thousand two hundred and thirty-two divided by sixty is four hundred and seventy point five. So four hundred and seventy a second fits, using twenty-eight thousand two hundred ports. Four hundred and seventy-one uses more ports than exist.',
      keyword: '470 fits, 471 does not',
      trap: 'Rounding 470.53 up to 471. The constraint is a ceiling on a count, so it rounds down, always.'
    },
    {
      id: 'ex-3', scene: 'exhaustion', start: 225, end: 232.5,
      caption: 'The failure is EADDRNOTAVAIL from connect, not a refusal from the server.',
      detail: 'When no free port exists for the four-tuple, connect fails immediately with EADDRNOTAVAIL, "cannot assign requested address". The server was never contacted, so the error says nothing about the server being down, which is why it is so often misdiagnosed.',
      narration: 'The error comes from your own kernel, before any packet leaves. Cannot assign requested address. The server was never asked, so the failure is not the server being down.',
      keyword: 'EADDRNOTAVAIL, locally',
      trap: 'Reading a connection error as a server fault. If the port cannot be assigned, the server never saw the request.'
    },
    {
      id: 'ex-4', scene: 'exhaustion', start: 232.5, end: 240,
      caption: 'The fixes change the rate or the hold: reuse connections, or widen the range.',
      detail: 'Connection reuse removes the churn, which removes the TIME_WAIT pressure entirely. Widening ip_local_port_range raises the ceiling proportionally. Both are arithmetic changes to the same product, and neither is a fix for a server-side count of TIME_WAIT entries, which is harmless.',
      narration: 'Two levers on one product. Cut the rate by reusing connections, or raise the ceiling by widening the range. Nothing about the server side needs fixing.',
      keyword: 'lower the rate or raise the range',
      trap: 'Setting tcp_fin_timeout to shorten TIME_WAIT. It governs a different timer, and the TIME_WAIT length on Linux is a constant.'
    },

    /* ---------------- scene 9: udp ---------------- */
    {
      id: 'ud-1', scene: 'udp', start: 240, end: 247.5,
      caption: 'A UDP socket is one endpoint and nothing else: no listen, no accept, no connection.',
      detail: 'The UDP call sequence is socket, optionally bind, then sendto and recvfrom, then close. There is no listen and no accept because there is no connection to queue. A datagram carries its own destination address in each call.',
      narration: 'UDP keeps the socket and the bind and drops the rest. No listen, no accept, no queue. Each datagram carries its own destination, so sendto names the peer every time.',
      keyword: 'socket, bind, sendto, recvfrom',
      trap: 'Calling listen on a UDP socket. It fails, because there is no connection state for a queue to hold.'
    },
    {
      id: 'ud-2', scene: 'udp', start: 247.5, end: 255,
      caption: 'A UDP socket is demultiplexed by its local port alone, so two clients share one receiving socket.',
      detail: 'With no four-tuple there is nothing to distinguish peers, so an unconnected UDP socket receives datagrams from any source, and the application reads the source address from recvfrom to tell them apart. One socket serves every client.',
      narration: 'One UDP socket can receive from everybody, because there is no connection to separate them. The source address arrives with each datagram, and the program sorts them out itself.',
      keyword: 'local port alone',
      trap: 'Expecting a UDP server to hold one socket per client. It holds one, and the peers are told apart by the address on each datagram.'
    },
    {
      id: 'ud-3', scene: 'udp', start: 255, end: 262.5,
      caption: 'connect on a UDP socket only records a default peer; it sends nothing and completes no handshake.',
      detail: 'A connected UDP socket stores the peer address, so send and recv can be used without naming it, and datagrams from other sources are discarded. No segments are exchanged, so no state is created at the peer either.',
      narration: 'connect on UDP is a local bookkeeping call. It remembers the peer so you can use send and receive, and it filters out everyone else. No packet is sent and no state is made at the other end.',
      keyword: 'local bookkeeping only',
      trap: 'Assuming a connected UDP socket is reliable. It only remembers an address; loss, reordering and duplication are unchanged.'
    },
    {
      id: 'ud-4', scene: 'udp', start: 262.5, end: 270,
      caption: 'With no connection there is no TIME_WAIT, so UDP cannot exhaust ports the way TCP does.',
      detail: 'TIME-WAIT exists to protect a four-tuple that could be reused by a new connection. UDP has no connection state to protect, so closing a UDP socket frees its port at once. The port-space ceiling of the previous scene is a TCP phenomenon.',
      narration: 'No connection, so nothing to protect, so no TIME-WAIT. A UDP port is free the moment the socket closes. The ceiling of four hundred and seventy a second belongs to TCP.',
      keyword: 'no state, no wait',
      trap: 'Applying the 28232 over 60 arithmetic to a UDP workload. There is no hold time to divide by.'
    },

    /* ---------------- scene 10: procedure ---------------- */
    {
      id: 'pr-1', scene: 'procedure', start: 270, end: 277.5,
      caption: 'Four steps: name the side, name the quantity, apply the invariant, then check the unit.',
      detail: 'First decide whether the question is about the client, the server or the system. Then decide which quantity is wanted: sockets, connections, four-tuples, ports or round trips. Then apply the one invariant for that quantity, and finally check that the answer is in the unit asked for.',
      narration: 'Four steps. Which side. Which quantity. Which invariant. Which unit. Each step removes half the wrong answers, and the last one catches the rest.',
      keyword: 'side, quantity, invariant, unit',
      trap: 'Skipping step one. The same question has different answers on the two sides, and the wording is the only clue.'
    },
    {
      id: 'pr-2', scene: 'procedure', start: 277.5, end: 285,
      caption: 'The invariants: 1 + 2N sockets, 2^48 tuples, 28232 ports, 1 and 1.5 round trips.',
      detail: 'Four facts carry the clause. A system with N connections holds 1 + 2N sockets. A fixed server endpoint admits 2^48 four-tuples. A client address holds 28232 ports. And connect returns at one round trip while accept returns at one and a half.',
      narration: 'Four numbers carry the clause. One plus two N sockets. Two to the forty-eight tuples. Twenty-eight thousand two hundred and thirty-two ports. And one against one and a half round trips.',
      keyword: 'four numbers',
      trap: 'Memorising the numbers without the condition. Each is true only for the fixed values it was derived from, such as the Linux default port range.'
    },
    {
      id: 'pr-3', scene: 'procedure', start: 285, end: 292.5,
      caption: 'Trap one: accept returns the same socket. Trap two: a new port per connection. Trap three: the server enters TIME_WAIT.',
      detail: 'accept returns a new descriptor and leaves the listening socket in LISTEN. The server keeps one local port for every connection. And TIME-WAIT belongs to whichever side sent the first FIN, which is a fact about the close, not about the role.',
      narration: 'Three traps. accept returning the same socket, which it does not. A new port per connection, which the server never needs. And the server entering TIME-WAIT, which depends only on who closed first.',
      keyword: 'same socket, new port, who closes',
      trap: 'All three produce numbers that appear among the options, which is why they survive a careless check.'
    },
    {
      id: 'pr-4', scene: 'procedure', start: 292.5, end: 300,
      caption: 'Trap four: the backlog is a client count. Trap five: TIME_WAIT is always harmful. Write the unit, then compute.',
      detail: 'The backlog bounds connections waiting unaccepted at one instant, not the number of clients served. And TIME-WAIT is required for a correct close; it costs ports only on the side that churns through short connections to one endpoint.',
      narration: 'Two more. The backlog is not a client count, it is a queue length at one instant. And TIME-WAIT is not a fault: it costs ports only where short connections churn to one endpoint.',
      keyword: 'queue length, not clients',
      trap: 'Reading a question that asks for a rate as if it asked for a count, which turns 470 into 28232 or the other way round.'
    }
  ]
};
