# Path Mtu Discovery And Effective Mss — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/path-mtu-discovery-and-effective-mss/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. The promise is made from the wrong link

*0:00 – 0:30 · objective: See that the MSS a host advertises comes from its own link MTU, while the datagram it sends must fit the smallest hop on the path, and state the gap in bytes.*

**0:00–0:07** — A host on an Ethernet link advertises fourteen sixty. It computes that from its own link: fifteen hundred, less twenty for IP, less twenty for TCP.

> Caption: A host on a 1500-byte link advertises 1460 bytes of data, because its own link can carry that.

**0:07–0:15** — But the path is not the first hop. There is a tunnel in the middle that carries fourteen hundred. The path MTU is the smallest hop, so it is fourteen hundred.

> Caption: The path it actually uses has a 1400-byte hop, so the path MTU is 1400 and not 1500.

**0:15–0:22** — Fourteen sixty of data is fifteen hundred on the wire. The path takes fourteen hundred. So the datagram is one hundred bytes too big.

> Caption: 1460 plus 40 bytes of header is 1500, and 1500 minus 1400 is 100 bytes too many.

Exam-trap caption mode adds: *A question that gives the local link MTU and the path MTU is asking for two different numbers; the MSS comes from the first, the datagram must fit the second.*

**0:22–0:30** — The router will not fragment it, because the host asked it not to. So it throws it away, and tells the host why. That message is the whole mechanism.

> Caption: The router cannot fragment a datagram with DF set, so it drops it and sends back the reason.

## Scene 2. The path MTU is the smallest hop

*0:30 – 1:00 · objective: Define the path MTU as the minimum of the link MTUs along the path, and read the MSS that follows from it over IPv4 and over IPv6.*

**0:30–0:37** — The path MTU is the smallest link on the way. The first hop is just the only number the host knows at the start.

> Caption: The path MTU is the smallest link MTU on the way, and the first hop is only a starting guess.

**0:37–0:45** — One PPPoE hop and the path drops to fourteen ninety-two. Subtract forty and the MSS is fourteen fifty-two.

> Caption: One PPPoE hop takes the path to 1492, and the MSS that follows is 1452 over IPv4.

**0:45–0:52** — A tunnel hop, and the path is fourteen hundred. Subtract forty: thirteen sixty.

> Caption: One tunnel hop takes the path to 1400, and the MSS that follows is 1360 over IPv4.

**0:52–1:00** — A narrow IPv6 hop gives twelve eighty. Over IPv6 the headers are sixty, so twelve twenty of data. Over IPv4 they would be forty, so twelve forty. Use the headers of the version you are actually running.

> Caption: A narrow IPv6 hop takes the path to 1280: the data left is 1220 over IPv6 and 1240 over IPv4.

Exam-trap caption mode adds: *Subtracting 40 on an IPv6 path overstates the data by 20 bytes on every segment.*

## Scene 3. Send too big, be told, send smaller

*1:00 – 1:30 · objective: Walk the classic probe: the DF bit, the router that cannot forward, the ICMP message, and the lowered estimate that ends the search.*

**1:00–1:07** — Start with the first hop, and set the Don't Fragment bit. Now nothing can be fragmented quietly, so every failure comes back as a message.

> Caption: The host starts from the first-hop MTU and sets the Don't Fragment bit on every datagram.

**1:07–1:15** — The fourteen-hundred hop cannot forward fifteen hundred, and cannot fragment it. So it drops it.

> Caption: The 1400-byte hop cannot forward a 1500-byte datagram and cannot fragment it, so it drops it.

**1:15–1:22** — Back comes a type three, code four: fragmentation needed and DF set. And it carries a number: fourteen hundred.

> Caption: The answer is an ICMP type 3 code 4 message carrying the next-hop MTU, 1400.

**1:22–1:30** — The host writes down fourteen hundred and sends again. This one goes through. If there is a narrower hop further on, the same thing happens once more.

> Caption: The host lowers its estimate to 1400 and sends again; that datagram is forwarded and delivered.

## Scene 4. The Next-Hop MTU field

*1:30 – 2:00 · objective: Read the field that carries the answer, understand that its value counts the IP header, and recognise a zero as an unmodified router.*

**1:30–1:37** — The old message had a word of padding. Half of it now carries the MTU of the hop that refused the datagram.

> Caption: Two bytes of the ICMP header that used to be padding now carry the next-hop MTU.

**1:37–1:45** — It is a datagram size, not a payload size. It counts the IP header and leaves out the link headers.

> Caption: The value is a datagram size: it counts the IP header and not the link headers.

**1:45–1:52** — Fourteen hundred including the IP header. Take off twenty for IP and twenty for TCP and you have thirteen sixty of data.

> Caption: So 1400 means 1400 including the 20-byte IP header, and the data is 1360.

Exam-trap caption mode adds: *Treating the next-hop MTU as a payload size gives a segment 40 bytes too large over IPv4, and 60 too large over IPv6.*

**1:52–2:00** — A zero means the router was never upgraded. The host still has to do something, and what it does is search.

> Caption: A zero in that field means an unmodified router, and the host must fall back to a search.

## Scene 5. The effective size is the smaller of two numbers

*2:00 – 2:30 · objective: Combine the peer's advertised MSS with the path ceiling, and check the resulting datagram against the path in bytes.*

**2:00–2:07** — Four paths, four sizes. Fifteen hundred gives fourteen sixty, fourteen ninety-two gives fourteen fifty-two, fourteen hundred gives thirteen sixty, and twelve eighty gives twelve twenty over IPv6.

> Caption: Four paths, and the data each one leaves once the fixed headers are removed.

**2:07–2:15** — The path is a ceiling. The peer is a promise. You have to satisfy both, so you take the smaller.

> Caption: The path sets a ceiling and the peer sets a promise; the sender uses the smaller of the two.

**2:15–2:22** — If the peer says thirteen hundred, use thirteen hundred. If it says fourteen sixty, the path still wins, and you use thirteen sixty.

> Caption: A peer offering 1300 on the 1400-byte path gives 1300; a peer offering 1460 gives 1360.

**2:22–2:30** — Thirteen hundred becomes thirteen forty on the wire, and thirteen forty fits. Fourteen sixty becomes fifteen hundred, and fifteen hundred does not.

> Caption: 1300 bytes of data is 1340 on the wire and fits; 1460 is 1500 and does not.

## Scene 6. Without the field, the host has to search

*2:30 – 3:00 · objective: Use the RFC 1191 plateau table to run an old-style search, and price the underestimate it produces.*

**2:30–2:37** — Without the number, the host still knows one thing: the size of the datagram that failed. That plus a table of likely MTUs is enough.

> Caption: Without the field, the host has only the size it sent and a table of plausible MTUs.

**2:37–2:45** — The table groups similar MTUs and keeps the lowest of each group, so the guess is never too high. Fourteen ninety-two stands for everything from fifteen thirty-six down.

> Caption: The table has eleven plateaus; 1492 stands for 1536, 1500 and 1492 together.

**2:45–2:52** — The biggest plateau under fifteen hundred is fourteen ninety-two. But the path is fourteen hundred, so that fails too.

> Caption: The greatest plateau below 1500 is 1492, still too big, so a second step is needed.

**2:52–3:00** — The next plateau down is ten oh six, and that fits. So the search ends four hundred bytes below the truth, after two wasted round trips.

> Caption: Then 1006 fits, and the estimate sits 394 bytes and 28.14 per cent below the truth.

Exam-trap caption mode adds: *The plateau search is allowed to underestimate by design; a question that asks for the exact path MTU needs the next-hop field, not the table.*

## Scene 7. What a host may do with the estimate

*3:00 – 3:30 · objective: State the five rules on the estimate and the four timers that keep the search from costing more than it saves.*

**3:00–3:07** — First rule: when the message arrives, go down. And stop making the network send you more of them.

> Caption: On a Too Big message the host must reduce the estimate and stop provoking more of them.

**3:07–3:15** — Second and third rules: never go below sixty-eight, and never go up just because a message says the path got bigger.

> Caption: It must never go below 68 octets, and never raise the estimate on a message's word.

**3:15–3:22** — Going up costs a dropped datagram, so it is rationed: five minutes after a failure, one minute after a success.

> Caption: Raising waits five minutes after a Too Big message and one minute after a raise.

**3:22–3:30** — The recommended timers are ten minutes and two. And a cached value that has not changed for ten minutes is thrown away, so a wider route is eventually found.

> Caption: The recommended values are ten minutes and two, and a cached estimate ages out at ten.

Exam-trap caption mode adds: *These are minimum intervals between attempts to raise the estimate, not how long the estimate is kept.*

## Scene 8. IPv6 has no DF bit and no router fragmentation

*3:30 – 4:00 · objective: Apply the IPv6 floor of 1280, discard a Packet Too Big below the floor, and compute the data that remains.*

**3:30–3:37** — In IPv6 a router never fragments. It drops the packet and says so, every time, with no bit to set.

> Caption: IPv6 routers never fragment, so an oversized packet is dropped and answered.

**3:37–3:45** — The message is type two, Packet Too Big, and it carries the MTU. IPv6 has no DF bit, because not fragmenting is already the rule.

> Caption: The answer is ICMPv6 type 2, Packet Too Big, and there is no DF bit in IPv6 at all.

**3:45–3:52** — Every IPv6 link has to carry twelve eighty. So a message claiming less than that is wrong, and it is thrown away.

> Caption: Every IPv6 link must carry 1280 bytes, so a report below 1280 is discarded.

Exam-trap caption mode adds: *A Packet Too Big below 1280 is not a smaller path; it is a message to discard. Lowering the estimate to it breaks the protocol.*

**3:52–4:00** — At the floor, twelve twenty of data over IPv6. A node that does not do discovery at all simply never sends more than twelve eighty.

> Caption: At the floor the data left is 1220 bytes over IPv6 and 1240 over IPv4.

## Scene 9. When the answer never arrives

*4:00 – 4:30 · objective: Explain the black-hole connection, the clamping that cures it from the middle, and the probing that cures it from the ends.*

**4:00–4:07** — Many firewalls drop ICMP. Then the sender never hears that its datagram was too big.

> Caption: A firewall that drops ICMP errors leaves the sender with no answer at all.

**4:07–4:15** — The handshake is tiny, so it works. Then the first full-size segment is fifteen hundred, and it disappears.

> Caption: The 60-byte handshake passes and the connection opens; the 1500-byte data does not.

**4:15–4:22** — It retransmits the same size and fails the same way. The connection is open, silent, and going nowhere.

> Caption: The sender retransmits the same oversized segment: an open, silent, black-hole connection.

**4:22–4:30** — Two cures. Clamp the MSS to thirteen sixty somewhere in the middle. Or stop trusting ICMP: probe from twelve hundred, climb, and treat silence as the ceiling.

> Caption: Clamping the MSS to 1360, or probing from 1200 without ICMP, restores the flow.

Exam-trap caption mode adds: *Clamping changes what is advertised; it does not change the path. A clamped MSS must not be raised again without evidence.*

## Scene 10. The chain, from the path to the segment

*4:30 – 5:00 · objective: Collect the five steps in order, and name the five slips that cost a mark.*

**4:30–4:37** — One: the path MTU, the smallest hop. Fourteen hundred here.

> Caption: First the path MTU: the smallest hop MTU on the path, 1400 in this example.

**4:37–4:45** — Two: the MSS from the path. Thirteen sixty over IPv4, twelve twenty at the IPv6 floor.

> Caption: Then the MSS from the path: 1360 over IPv4, and 1220 at the IPv6 floor of 1280.

**4:45–4:52** — Three: the smaller of the path and the peer. If the peer says thirteen hundred, that is the number.

> Caption: Then the smaller of that and the peer's promise: 1300 when the peer offers 1300.

**4:52–5:00** — Four: probe with DF and read the field. Five: respect the floors, sixty-eight and twelve eighty, and have a fallback for when the answer is filtered.

> Caption: Then the probe, the floors of 68 and 1280, and the fallback when the answer is lost.

Exam-trap caption mode adds: *Five slips: the first hop used as the path, headers counted inside the MSS, an estimate raised on a message, a floor crossed, and ICMP assumed to arrive.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
