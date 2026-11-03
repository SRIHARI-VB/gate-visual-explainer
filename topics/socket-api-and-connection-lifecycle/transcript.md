# The socket API and the connection lifecycle: calls, four-tuples, TIME_WAIT and port exhaustion — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/socket-api-and-connection-lifecycle/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A socket is an endpoint, not a connection

*0:00 – 0:30 · objective: Say what a socket identifies, and why a connection is named by four numbers rather than by one port.*

**0:00–0:07** — A socket is one end of a conversation, and it is named by two things: an address, which says which machine, and a port, which says which process on that machine.

> Caption: A socket names one endpoint: an address and a port. The port is the part the program chooses.

Exam-trap caption mode adds: *A port is not a process id and not a connection. Many processes over the years share one port number, and one process can hold many ports.*

**0:07–0:15** — The connection is the pair of endpoints. Four numbers: the client address and port, the server address and port. The kernel looks at all four to decide which socket a segment belongs to.

> Caption: A connection is named by four numbers: source address, source port, destination address, destination port.

Exam-trap caption mode adds: *Two connections can share a server port. They cannot share all four numbers. That is why a web server needs only one port.*

**0:15–0:22** — Sixteen bits of port, so sixty-five thousand five hundred and thirty-six numbers. One thousand and twenty-four are the well-known ports a server binds. Then forty-eight thousand one hundred and twenty-eight registered ones, and sixteen thousand three hundred and eighty-four dynamic ones.

> Caption: The port space is 16 bits: 1024 well-known, 48128 registered, 16384 dynamic, summing to 65536.

Exam-trap caption mode adds: *The three ranges sum to 65536, not to 65535. Counting the boundary port twice, or losing port zero, breaks the sum.*

**0:22–0:30** — That is the whole vocabulary. A socket is a pair. A connection is a four-tuple. Before you compute anything, decide which of the two the question is asking you to count.

> Caption: So the unit of a socket question is a pair, and the unit of a connection question is a four-tuple.

Exam-trap caption mode adds: *A question that says "how many sockets" is not asking for connections, and the answer differs by one for every connection on the server side.*

## Scene 2. The server makes five calls, the client two

*0:30 – 1:00 · objective: Order the system calls on both sides and say what each one changes in the kernel.*

**0:30–0:37** — The server asks for a socket, then binds it to an address and a port, then listens. Until the listen call the port is not answering anybody: a SYN that arrives before it gets a refusal, not a handshake.

> Caption: The server calls socket, then bind, then listen. Only after listen can a client reach it.

Exam-trap caption mode adds: *bind does not accept anything, and listen does not accept anything. listen only changes the state of the socket to LISTEN.*

**0:37–0:45** — The client has two calls. socket, then connect. connect does the binding for it: it picks a free port from the ephemeral range and starts the handshake. That is why a client never writes bind.

> Caption: The client calls socket and connect. connect binds an ephemeral port implicitly and sends the SYN.

Exam-trap caption mode adds: *A client that calls bind first is not wrong, but it must choose a port itself and can collide with a port already in TIME_WAIT.*

**0:45–0:52** — accept does one thing: it takes a finished connection off the queue and gives you a new descriptor for it. It never touches the listening socket, which goes on listening.

> Caption: accept takes one completed connection off the queue and returns a descriptor for it. It does not answer the SYN.

Exam-trap caption mode adds: *accept does not perform the handshake. The handshake is finished by the kernel before the connection ever reaches the queue.*

**0:52–1:00** — Data goes on the new descriptor, never on the listening one. Closing the connected descriptor starts the teardown. Closing the listening socket stops new arrivals and leaves the open connections alone.

> Caption: Then read and write on the connected descriptor, and close it. The listening socket closes separately.

Exam-trap caption mode adds: *Reading from a listening socket fails. A program that forgets to keep the return value of accept reads and writes on the wrong descriptor.*

## Scene 3. accept returns a new socket; the old one keeps listening

*1:00 – 1:30 · objective: Distinguish the listening socket from the connected socket, and count the sockets in a running system.*

**1:00–1:07** — One client, two sockets at the server, both with local port four four three. One has no peer and listens. The other has a peer and carries data. The port is the same; the peer is what differs.

> Caption: After one client connects, the server holds two sockets on the same local port 443.

Exam-trap caption mode adds: *Seeing two sockets on port 443 and concluding that the port was bound twice. It was bound once; accept created the second socket without binding.*

**1:07–1:15** — Each accept hands back a new descriptor. Three, then four, then five. A hundred connections means a hundred descriptors, plus the one that is still listening.

> Caption: Every accept returns a fresh descriptor. Descriptors 3, 4, 5 and so on, one per connection.

Exam-trap caption mode adds: *The descriptor number is not the port number, and it is not stable across runs. It is a slot in the process table.*

**1:15–1:22** — Count the whole system. One listening socket. N connected sockets at the server. N at the clients. One plus two N. For eight connections that is seventeen sockets.

> Caption: So a server with N connections holds 1 + 2N sockets in the system: one listening, N at the server, N at the clients.

Exam-trap caption mode adds: *Counting only the server gives 1 + N. Counting only the connections gives N. Read which of the three the question wants.*

**1:22–1:30** — This is why one port serves a whole website. The server never runs out of ports, because it never needs a second one. What it can run out of is descriptors and memory.

> Caption: A server therefore scales by descriptors and memory, not by port numbers.

Exam-trap caption mode adds: *The phrase "the server ran out of ports" is almost always wrong. The party that runs out of ports is the client, on its outgoing side.*

## Scene 4. The handshake happens inside connect and accept

*1:30 – 2:00 · objective: Place SYN, SYN-ACK and ACK on a timeline and say which call returns after which segment.*

**1:30–1:37** — The client sends a SYN and waits. Half a round trip later the server answers with SYN-ACK, and its own connection moves to SYN-received. Nothing is established yet.

> Caption: connect sends a SYN and waits. Half a round trip later the server answers SYN-ACK.

Exam-trap caption mode adds: *The server has already spent state at this point. A flood of SYNs with no final ACK is what fills the queue, which is why the queue has two halves.*

**1:37–1:45** — connect returns at one round trip, when the SYN-ACK lands. The third segment is in flight at that moment. So the client can write before the server has finished.

> Caption: connect returns when the SYN-ACK arrives, at one round trip. The final ACK is still in flight.

Exam-trap caption mode adds: *Saying connect returns when the handshake is complete. It returns when the client has what it needs, which is one segment earlier.*

**1:45–1:52** — accept returns half a round trip after connect does. That is when the ACK arrives, the connection becomes established, and it joins the queue the accept call is waiting on.

> Caption: accept returns at one and a half round trips, when the ACK arrives and the connection joins the queue.

Exam-trap caption mode adds: *A question that asks when the connection is established is asking about the server, which is at one and a half round trips, not one.*

**1:52–2:00** — Three states on the server: listen, syn-received, established. Two on the client: syn-sent, established. Each segment of the handshake moves one side forward by one state.

> Caption: The passive states are LISTEN, then SYN-RECEIVED, then ESTABLISHED. The client goes SYN-SENT, then ESTABLISHED.

Exam-trap caption mode adds: *SYN-SENT and SYN-RECEIVED are different states on different machines. A simultaneous open puts both sides in SYN-RECEIVED, which is the case the diagrams usually omit.*

## Scene 5. listen(fd, n): the queue behind accept

*2:00 – 2:30 · objective: Read the backlog as the length of the completed-connection queue, and count what is dropped when it overflows.*

**2:00–2:07** — The second argument of listen is a queue length. It says how many finished connections may sit waiting for an accept call. It is not a rate, and it is not a number of ports.

> Caption: listen(fd, n) says how many completed connections may wait for accept: the backlog is a queue length.

Exam-trap caption mode adds: *The backlog is not the number of clients the server can serve. It is only the number that can wait unaccepted at one moment.*

**2:07–2:15** — Six arrivals, two accepts, room for two. Two are queued at the start, the third is dropped. An accept frees a slot, the next arrival takes it, and the pattern repeats. Four queued, two dropped.

> Caption: Six arrivals, a queue of two, and two accepts: four get queued, two are dropped.

Exam-trap caption mode adds: *A dropped SYN is not an error to the client. It retransmits after a timeout, so the loss shows up as latency, not as a failure message.*

**2:15–2:22** — Two identities check the whole simulation. Queued equals accepted plus still waiting. Arrivals equals queued plus dropped. If either fails, the simulation is wrong, not the question.

> Caption: The invariant: every arrival is either queued or dropped, and every queued one is accepted or still waiting.

Exam-trap caption mode adds: *Adding the queue length to the accepted count and calling it the number of arrivals. The dropped ones are the missing term.*

**2:22–2:30** — Two queues, not one. Half-open connections waiting for the final ACK, and completed connections waiting for accept. A flood fills the first; a slow accept loop fills the second.

> Caption: A full queue is what a SYN flood exploits, and it is why a server separates the half-open and completed queues.

Exam-trap caption mode adds: *Quoting one number for "the backlog" hides which queue is meant. Say half-open or completed, and the arithmetic becomes unambiguous.*

## Scene 6. One server port, many simultaneous connections

*2:30 – 3:00 · objective: Count how many connections a single server endpoint can hold, and see why the server does not run out of ports.*

**2:30–2:37** — Hold the server fixed. Then the client address and the client port are the only free fields. From one client address, the ceiling is the number of ports that client can use.

> Caption: Fix the server endpoint and the only thing that can vary is the client side.

Exam-trap caption mode adds: *Multiplying by the server port range. The server port is fixed by the listener, so it contributes a factor of one.*

**2:37–2:45** — The Linux default range runs from thirty-two thousand seven hundred and sixty-eight to sixty thousand nine hundred and ninety-nine. That is twenty-eight thousand two hundred and thirty-two ports, so that many connections from one address to one endpoint.

> Caption: With the Linux default range, one client address can hold 28232 connections to one server endpoint.

Exam-trap caption mode adds: *Treating 28232 as a limit on total connections. It is a limit per client address per destination endpoint. A second destination doubles it.*

**2:45–2:52** — Over all clients, the free space is two to the forty-eight. Thirty-two bits of client address and sixteen bits of client port. About two point eight times ten to the fourteen.

> Caption: Across all clients the space is 2^48 four-tuples: 2^32 addresses times 2^16 ports on each side.

Exam-trap caption mode adds: *Counting 2^64 by adding the two addresses and the two ports as if each were 32 bits. Ports are 16 bits.*

**2:52–3:00** — Two different ceilings. The server is limited by descriptors and memory, on one port. The client is limited by ports, and by how long each port is held after the connection closes.

> Caption: So the server side is bounded by descriptors, and the client side by ports. They are different ceilings.

Exam-trap caption mode adds: *Diagnosing a server with thousands of TIME_WAIT entries as a port problem. On the server those entries do not consume ephemeral ports at all.*

## Scene 7. TIME_WAIT: who waits, for how long, and why

*3:00 – 3:30 · objective: Name the side that enters TIME_WAIT, the two reasons it exists, and the difference between the specification and Linux.*

**3:00–3:07** — Whoever sends the first FIN becomes the active closer, and that is the side that ends in TIME-WAIT. The other side waits in CLOSE-WAIT for its own application to close.

> Caption: The side that sends the first FIN enters TIME_WAIT. The side that receives it goes to CLOSE-WAIT.

Exam-trap caption mode adds: *Assuming the server always enters TIME_WAIT. It depends on who closed first, which the question must tell you.*

**3:07–3:15** — Two reasons. A lost final ACK needs an answer, and only a socket that still exists can give it. And an old delayed segment must not be taken by a new connection using the same four numbers.

> Caption: It waits so that a lost final ACK can be answered, and so that old duplicates die before the tuple is reused.

Exam-trap caption mode adds: *Calling TIME_WAIT a leak. It is the state that makes the close reliable; removing it trades a delay for a correctness bug.*

**3:15–3:22** — The specification: two minutes of maximum segment lifetime, so four minutes in TIME-WAIT. Linux: a fixed sixty seconds, with no setting to change it. Both are right; they answer different questions.

> Caption: The specification says two times the maximum segment lifetime: 2 x 120 = 240 seconds. Linux uses 60.

Exam-trap caption mode adds: *Quoting four minutes in a question about Linux, or sixty seconds in a question that says "as specified in RFC 793".*

**3:22–3:30** — TIME-WAIT is kept by the kernel and holds the four numbers. CLOSE-WAIT is still your descriptor, waiting for your program to close it. One blocks a new connection; the other leaks a descriptor.

> Caption: TIME_WAIT holds a four-tuple; CLOSE_WAIT holds a descriptor. Only the first blocks a new connection.

Exam-trap caption mode adds: *Reading a pile of CLOSE-WAIT as normal. It is the signature of an application that never closes what it accepted.*

## Scene 8. Ephemeral port exhaustion, counted

*3:30 – 4:00 · objective: Turn a connection rate and a TIME_WAIT duration into the number of ports in use, and find the ceiling.*

**3:30–3:37** — Multiply the rate by the holding time. If each connection holds a port for sixty seconds and you open four hundred and seventy a second, twenty-eight thousand two hundred ports are busy at any moment.

> Caption: Ports in use equals the connection rate times the seconds each port is held.

Exam-trap caption mode adds: *Using the connection duration instead of the TIME_WAIT duration. The port is held after the connection is gone, and that is the part that bites.*

**3:37–3:45** — Twenty-eight thousand two hundred and thirty-two divided by sixty is four hundred and seventy point five. So four hundred and seventy a second fits, using twenty-eight thousand two hundred ports. Four hundred and seventy-one uses more ports than exist.

> Caption: 28232 ports held for 60 seconds gives 470 new connections per second. 471 exceeds the range.

Exam-trap caption mode adds: *Rounding 470.53 up to 471. The constraint is a ceiling on a count, so it rounds down, always.*

**3:45–3:52** — The error comes from your own kernel, before any packet leaves. Cannot assign requested address. The server was never asked, so the failure is not the server being down.

> Caption: The failure is EADDRNOTAVAIL from connect, not a refusal from the server.

Exam-trap caption mode adds: *Reading a connection error as a server fault. If the port cannot be assigned, the server never saw the request.*

**3:52–4:00** — Two levers on one product. Cut the rate by reusing connections, or raise the ceiling by widening the range. Nothing about the server side needs fixing.

> Caption: The fixes change the rate or the hold: reuse connections, or widen the range.

Exam-trap caption mode adds: *Setting tcp_fin_timeout to shorten TIME_WAIT. It governs a different timer, and the TIME_WAIT length on Linux is a constant.*

## Scene 9. The same API without a connection

*4:00 – 4:30 · objective: Write the UDP call sequence and say what disappears when there is no handshake and no connection state.*

**4:00–4:07** — UDP keeps the socket and the bind and drops the rest. No listen, no accept, no queue. Each datagram carries its own destination, so sendto names the peer every time.

> Caption: A UDP socket is one endpoint and nothing else: no listen, no accept, no connection.

Exam-trap caption mode adds: *Calling listen on a UDP socket. It fails, because there is no connection state for a queue to hold.*

**4:07–4:15** — One UDP socket can receive from everybody, because there is no connection to separate them. The source address arrives with each datagram, and the program sorts them out itself.

> Caption: A UDP socket is demultiplexed by its local port alone, so two clients share one receiving socket.

Exam-trap caption mode adds: *Expecting a UDP server to hold one socket per client. It holds one, and the peers are told apart by the address on each datagram.*

**4:15–4:22** — connect on UDP is a local bookkeeping call. It remembers the peer so you can use send and receive, and it filters out everyone else. No packet is sent and no state is made at the other end.

> Caption: connect on a UDP socket only records a default peer; it sends nothing and completes no handshake.

Exam-trap caption mode adds: *Assuming a connected UDP socket is reliable. It only remembers an address; loss, reordering and duplication are unchanged.*

**4:22–4:30** — No connection, so nothing to protect, so no TIME-WAIT. A UDP port is free the moment the socket closes. The ceiling of four hundred and seventy a second belongs to TCP.

> Caption: With no connection there is no TIME_WAIT, so UDP cannot exhaust ports the way TCP does.

Exam-trap caption mode adds: *Applying the 28232 over 60 arithmetic to a UDP workload. There is no hold time to divide by.*

## Scene 10. The procedure, and the five traps

*4:30 – 5:00 · objective: Run a four-step procedure on any socket question, and recognise the five traps by sight.*

**4:30–4:37** — Four steps. Which side. Which quantity. Which invariant. Which unit. Each step removes half the wrong answers, and the last one catches the rest.

> Caption: Four steps: name the side, name the quantity, apply the invariant, then check the unit.

Exam-trap caption mode adds: *Skipping step one. The same question has different answers on the two sides, and the wording is the only clue.*

**4:37–4:45** — Four numbers carry the clause. One plus two N sockets. Two to the forty-eight tuples. Twenty-eight thousand two hundred and thirty-two ports. And one against one and a half round trips.

> Caption: The invariants: 1 + 2N sockets, 2^48 tuples, 28232 ports, 1 and 1.5 round trips.

Exam-trap caption mode adds: *Memorising the numbers without the condition. Each is true only for the fixed values it was derived from, such as the Linux default port range.*

**4:45–4:52** — Three traps. accept returning the same socket, which it does not. A new port per connection, which the server never needs. And the server entering TIME-WAIT, which depends only on who closed first.

> Caption: Trap one: accept returns the same socket. Trap two: a new port per connection. Trap three: the server enters TIME_WAIT.

Exam-trap caption mode adds: *All three produce numbers that appear among the options, which is why they survive a careless check.*

**4:52–5:00** — Two more. The backlog is not a client count, it is a queue length at one instant. And TIME-WAIT is not a fault: it costs ports only where short connections churn to one endpoint.

> Caption: Trap four: the backlog is a client count. Trap five: TIME_WAIT is always harmful. Write the unit, then compute.

Exam-trap caption mode adds: *Reading a question that asks for a rate as if it asked for a count, which turns 470 into 28232 or the other way round.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
