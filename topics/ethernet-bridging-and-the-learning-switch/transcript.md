# Ethernet bridging and the learning switch: forwarding table, flood-forward-filter, loops and the spanning tree — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/ethernet-bridging-and-the-learning-switch/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A bridge joins two segments and reads one field

*0:00 – 0:30 · objective: Say what a transparent bridge decides on, what it leaves alone, and which of the two domain counts it changes.*

**0:00–0:07** — A bridge joins two segments into one LAN. To decide, it reads one field: the destination MAC address at the front of the frame.

> Caption: A bridge joins two segments. It reads the destination MAC address and nothing else.

Exam-trap caption mode adds: *Reading the IP address. A bridge never does, which is exactly what separates it from a router.*

**0:07–0:15** — A frame for D crosses, because D is on the far side. A frame for B would be dropped, because B is already on this side. Either way the frame itself is untouched.

> Caption: A frame from A to D crosses, because D is on the far side. A frame to B would not.

Exam-trap caption mode adds: *Assuming the bridge rewrites the header. It does not; a router does.*

**0:15–0:22** — A router rewrites the frame and forwards by IP address. A bridge forwards by MAC address and changes nothing.

> Caption: Bridge and router differ in what they read and in what they leave behind.

Exam-trap caption mode adds: *Treating bridge and router as interchangeable because both selectively forward. Both filter; only one rewrites.*

**0:22–0:30** — Two collision domains, one broadcast domain. The bridge split the first and left the second exactly as it was.

> Caption: Collision domains: 2. Broadcast domains: 1. The bridge changed only the first.

Exam-trap caption mode adds: *Answering "it splits both". A bridge never splits a broadcast domain; only a router or a VLAN does.*

## Scene 2. Three actions in a fixed order: learn, look up, act

*0:30 – 1:00 · objective: State the learning rule and the three possible actions, with the condition that selects each.*

**0:30–0:37** — Step one, and it is the only reason the table exists: record the source address against the port the frame came in on.

> Caption: Step one: learn the source address, with the port the frame arrived on.

Exam-trap caption mode adds: *Learning the destination. The destination is the question, not the answer; the source is what the bridge can trust.*

**0:37–0:45** — Step two: look the destination up in the table. The answer decides the action.

> Caption: Step two: look the destination up in the table as it stood before this frame.

Exam-trap caption mode adds: *Confusing the two lookups. The source is written, the destination is read.*

**0:45–0:52** — Three outcomes. Unknown, so flood to every port but this one. Same port, so filter and drop. Another port, so forward to that port alone.

> Caption: Step three: not in the table, flood. Same port, filter. Another port, forward.

Exam-trap caption mode adds: *Calling a filter a flood with a smaller list. Filtering sends nothing at all.*

**0:52–1:00** — Entries expire after three hundred seconds of silence. A station that only listens is never learned, and its frames are flooded forever.

> Caption: Entries age out after 300 s of silence, so a station that never sends is never learned.

Exam-trap caption mode adds: *Assuming the table is complete. It only ever holds the addresses that have spoken recently.*

## Scene 3. Eight frames through one switch, counted

*1:00 – 1:30 · objective: Run the algorithm frame by frame and read the resulting table, the actions and the copies.*

**1:00–1:07** — Frame one, A to B. The table is empty, so the bridge learns A on port one and floods the frame out of three ports.

> Caption: Frame one: A to B. The table is empty, so the frame floods to three ports.

Exam-trap caption mode adds: *Forgetting the uplink. Every port except the ingress port gets a copy, including the one towards the next switch.*

**1:07–1:15** — B replies. A is already known on port one, so this frame leaves by one port only. The table has paid for itself in one exchange.

> Caption: Frame two: B replies. A is known on port 1, so the frame goes to one port only.

Exam-trap caption mode adds: *Expecting the reply to flood too. The reply floods nothing, because the request already taught the table where A is.*

**1:15–1:22** — Frame seven is the interesting one. E sends to D, and D is on the same port the frame arrived on, so the bridge drops it. Nothing leaves.

> Caption: Frame seven: E sends to D, and D is on the ingress port, so the bridge filters.

Exam-trap caption mode adds: *Thinking a filter is an error. It is the correct action, and it is what keeps a local conversation local.*

**1:22–1:30** — Eight frames: two floods, five forwards, one filter. Eleven copies on the wire. Four table entries, one per station that spoke.

> Caption: Eight frames: two floods, five forwards, one filter, eleven copies. Four table entries.

Exam-trap caption mode adds: *Counting destinations. The table has one entry per source that spoke, and C has none.*

## Scene 4. Collision domains against broadcast domains

*1:30 – 2:00 · objective: Count both quantities on five small topologies, and say which device changes which count.*

**1:30–1:37** — One hub, four PCs: one collision domain, because every port shares the same wire. One broadcast domain.

> Caption: One hub and four PCs: one collision domain, one broadcast domain.

Exam-trap caption mode adds: *Counting a hub as four domains because it has four ports. Ports are not domains; media are.*

**1:37–1:45** — One switch, four PCs: four collision domains, because each port is its own wire. Still one broadcast domain, because a broadcast is flooded everywhere.

> Caption: One switch and four PCs: four collision domains, still one broadcast domain.

Exam-trap caption mode adds: *Saying the switch splits the broadcast domain. It floods broadcasts by design, so it cannot.*

**1:45–1:52** — Two switches joined. Three host ports, the shared link, three more host ports: seven collision domains. One broadcast domain, because the switches flood to each other.

> Caption: Two switches joined: seven collision domains, one broadcast domain.

Exam-trap caption mode adds: *Adding the two port counts and forgetting that the link between them is one medium, not two.*

**1:52–2:00** — A router in the middle makes two broadcast domains, and the counts separate at last. A hub on one switch port costs one collision domain, not three.

> Caption: Put a router between them: the broadcast domains become two. A hub on one port stays one.

Exam-trap caption mode adds: *Counting the router as a broadcast domain of its own. It is a boundary, not a domain.*

## Scene 5. A loop has no end: the broadcast storm

*2:00 – 2:30 · objective: Show why a correct bridge in a loop produces frames forever, and what the counts look like.*

**2:00–2:07** — Four bridges, each connected to all three others, plus one host port. The redundancy is deliberate; the trouble is that a frame carries no history.

> Caption: Four bridges, fully meshed. Each has three trunks and one host port.

Exam-trap caption mode adds: *Thinking redundancy is the mistake. The mistake is having it without a spanning tree.*

**2:07–2:15** — One broadcast, flooded three ways: three frames. Each arrives somewhere and is flooded three ways again: nine. Two of every three keep going.

> Caption: One broadcast is flooded three ways: three frames. Each of those is flooded three ways again: nine.

Exam-trap caption mode adds: *Assuming the copies stop at the hosts. The trunk copies do not, and they are the ones that saturate the links.*

**2:15–2:22** — Ten rounds, four thousand six hundred and two frames, and still rising. An Ethernet frame has no hop limit, so nothing expires it.

> Caption: Ten rounds cost 4602 frames, and the count is still rising. Nothing ever dies.

Exam-trap caption mode adds: *Looking for the faulty bridge. Every bridge here is behaving exactly as specified.*

**2:22–2:30** — The table flips as well. Copies arrive from two directions, so the same source is learned on two ports in turn, and unicast frames start following the wrong one.

> Caption: The table never settles either: the same source arrives on two ports in turn.

Exam-trap caption mode adds: *Thinking only broadcasts suffer. A moving table entry breaks ordinary unicast delivery too.*

## Scene 6. Spanning tree, step one: elect a root

*2:30 – 3:00 · objective: Read a bridge ID, elect the root by the lowest one, and name what a BPDU carries.*

**2:30–2:37** — The bridge ID is a priority plus a MAC address. All four bridges here are at the default 32768, so the lowest MAC wins, and that is B1.

> Caption: The bridge ID is a 2-octet priority and a 6-octet MAC. The lowest ID wins.

Exam-trap caption mode adds: *Assuming the most central or the fastest bridge becomes root. Only the identifier decides.*

**2:37–2:45** — Every two seconds a bridge sends a BPDU: who it thinks the root is, what that costs, who it is, which port, and the timers.

> Caption: A BPDU carries the root ID, the root path cost, the sender ID, the port ID and the timers.

Exam-trap caption mode adds: *Forgetting that only the root originates. Everyone else relays and adds cost.*

**2:45–2:52** — The root starts at zero and every hop adds its port cost: nineteen for a hundred megabit link. So B2 and B4 sit at nineteen, and B3 at thirty-eight.

> Caption: Root path cost is accumulated along the way: 19 to B2, 19 to B4, 38 to B3.

Exam-trap caption mode adds: *Using bandwidth as the cost. The cost is a small integer from a table, and lower is better.*

**2:52–3:00** — B3 has two routes of cost thirty-eight. The tie goes to the lower neighbour, B2, so that is its root port.

> Caption: A tie at equal cost is broken by the lower neighbouring bridge ID: B3 goes through B2.

Exam-trap caption mode adds: *Breaking a tie by hop count or by port number first. The sender bridge ID comes before the port ID.*

## Scene 7. Step two: root ports, designated ports, blocked ports

*3:00 – 3:30 · objective: Assign the three port roles on a five-link, four-bridge topology and verify that the forwarding links form a tree.*

**3:00–3:07** — One root port each. B2 and B4 point straight at B1. B3 points at B2, the neighbour its best path came through.

> Caption: Every non-root bridge picks one root port: the port on its cheapest path to the root.

Exam-trap caption mode adds: *Giving a bridge two root ports when two routes tie. Only one survives, and the tie-break decides which.*

**3:07–3:15** — Each link also elects one designated port: the end closer to the root, or the lower bridge ID when the costs tie.

> Caption: Every segment picks one designated port: the end with the lower root path cost.

Exam-trap caption mode adds: *Believing the designated port must be on the root bridge. It is on whichever end is closer to the root.*

**3:15–3:22** — Everything else is blocked: B3 towards B4, and B4 towards B2. Two blocked ports, and those two are the loops being cut.

> Caption: Every other port is blocked: B3 towards B4, and B4 towards B2. Two ports, two loops cut.

Exam-trap caption mode adds: *Calling a blocked port faulty, or assuming it forwards nothing at all. It listens for BPDUs the whole time.*

**3:22–3:30** — Five links, four bridges: three forwarding links, two blocked ports. That is a tree, and the count is an identity you can check.

> Caption: Three forwarding links from five: E - (B - 1) = 5 - 3 = 2 blocked, and the rest is a tree.

Exam-trap caption mode adds: *Counting blocked links instead of blocked ports. Each removed link has exactly one blocked end.*

## Scene 8. From blocking to forwarding, in seconds

*3:30 – 4:00 · objective: Place the four port states on a time line and compute both convergence figures from the three default timers.*

**3:30–3:37** — A port cannot jump to forwarding. It listens for one forward delay, learns for another, and only then forwards.

> Caption: A port that must start forwarding goes blocking, listening, learning, forwarding.

Exam-trap caption mode adds: *Skipping the listening state because the port already has a table. Learning comes second for a reason.*

**3:37–3:45** — Fifteen seconds each, so thirty seconds from blocked to forwarding. That is the shortest it can be, and it is on purpose.

> Caption: Each of those two waits is the forward delay: 15 seconds by default, so 30 seconds to forward.

Exam-trap caption mode adds: *Adding the two waits as if they were one. They are two states of equal length.*

**3:45–3:52** — If the failure is further away, add the twenty-second max age first: fifty seconds in the worst case. A directly failed link skips it and converges in thirty.

> Caption: Worst case after a change: max age 20 plus 15 plus 15, which is 50 seconds.

Exam-trap caption mode adds: *Quoting 50 seconds for every failure. It is the worst case, not the only case.*

**3:52–4:00** — Hello every two seconds, so twenty seconds is ten missed BPDUs. The table ageing time is three hundred seconds, and it is a separate clock entirely.

> Caption: Hello is 2 s and the MAC ageing time is 300 s: different timers, different jobs.

Exam-trap caption mode adds: *Mixing the 20-second max age with the 300-second ageing time. One is the tree, the other is the table.*

## Scene 9. Where the delay goes: three forwarding modes

*4:00 – 4:30 · objective: Compute the wait before a frame can leave, for store-and-forward, fragment-free and cut-through.*

**4:00–4:07** — Fourteen octets of header, fifteen hundred of payload: fifteen hundred and fourteen, which is twelve thousand one hundred and twelve bits.

> Caption: A full frame is 1514 octets: 14 of header and 1500 of payload, so 12112 bits.

Exam-trap caption mode adds: *Forgetting the header, or adding the preamble and the inter-frame gap to a frame that is defined without them.*

**4:07–4:15** — Store and forward waits for the whole frame: a hundred and twenty-one microseconds, and it checks the frame before it goes on.

> Caption: Store and forward waits the whole 121.12 microseconds before it decides anything.

Exam-trap caption mode adds: *Assuming the wait is the payload only. The check covers the whole frame, so the whole frame is received.*

**4:15–4:22** — Cut-through waits for six octets: less than half a microsecond. Fragment-free waits for sixty-four: about five microseconds, and it catches the runts.

> Caption: Cut-through waits for 6 octets, 0.48 microseconds. Fragment-free waits for 64, 5.12.

Exam-trap caption mode adds: *Calling cut-through faster end to end. It is faster to start; the last bit still takes the full serialisation time.*

**4:22–4:30** — Two hundred and fifty-two times the wait, for one CRC check. At a gigabit, divide all three by ten: the frame does not change.

> Caption: The store-and-forward wait is about 252 times the cut-through wait, and it buys the CRC check.

Exam-trap caption mode adds: *Dividing by 100 when the rate goes from 100 Mb/s to 1 Gb/s. It is a factor of ten, not a hundred.*

## Scene 10. The procedure, and the traps that survive it

*4:30 – 5:00 · objective: Run a four-step procedure on any bridging question, and recognise the three traps by sight.*

**4:30–4:37** — Four steps. Which device. Which table state. Which action. Which topology. Each one removes half the wrong answers.

> Caption: Four steps: which device, which table state, which action, which topology.

Exam-trap caption mode adds: *Starting with the arithmetic. The device and the table state decide the arithmetic.*

**4:37–4:45** — Three identities: a port is a domain, an entry is a source, and a tree blocks E minus B minus one ports. Each one is checkable on the diagram.

> Caption: The invariants: one domain per switch port, one entry per source, E minus B minus one blocked ports.

Exam-trap caption mode adds: *Memorising counts instead of the identity that produces them, so a change of topology loses the answer.*

**4:45–4:52** — Three traps. A switch splitting the broadcast domain, which it does not. Learning destinations, which it does not. And a blocked port being broken, which it is not.

> Caption: Trap one: a switch splits the broadcast domain. Trap two: it learns destinations.

Exam-trap caption mode adds: *All three produce numbers that appear among the options, which is why they survive a careless check.*

**4:52–5:00** — Say the unit before you compute. Domains, entries, copies, ports or seconds. The unit is where the marks are lost.

> Caption: Say the unit first: domains, entries, copies, ports or seconds. Then count.

Exam-trap caption mode adds: *Answering a question about domains with a count of devices. The two differ by every hub in the picture.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
