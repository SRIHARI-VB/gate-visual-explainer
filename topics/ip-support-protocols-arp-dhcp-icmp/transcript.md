# IP Support Protocols: ARP, DHCP and ICMP — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/ip-support-protocols-arp-dhcp-icmp/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Two addresses per hop: what IPv4 cannot do alone

*0:00 – 0:30 · objective: See that an IP packet names hosts while the frame that carries it names interfaces, and that ARP, DHCP and ICMP are the three helpers that bridge the gap.*

**0:00–0:07** — An IP packet names hosts. The frame that carries it names interfaces, and those two names are not the same kind of name.

> Caption: An IP packet names hosts. The frame that carries it names interfaces.

Exam-trap caption mode adds: *IP addresses survive every hop; MAC addresses are rewritten at every hop. A question that says "the destination MAC of the packet" is usually testing exactly this.*

**0:07–0:15** — Three helpers sit beside IPv4. ARP finds a hardware address, DHCP finds an IP address, and ICMP reports trouble.

> Caption: Three helpers sit beside IPv4: ARP finds a MAC, DHCP finds an IP, ICMP reports trouble.

Exam-trap caption mode adds: *They are not one protocol family in the standards sense. ARP sits beside IPv4 at the link boundary, ICMP sits inside IPv4, and DHCP sits on top of UDP.*

**0:15–0:22** — Each one is identified in a different place. ARP by an EtherType, ICMP by a protocol number, DHCP by a pair of ports.

> Caption: Each one is identified differently: an EtherType, a protocol number, or a pair of ports.

Exam-trap caption mode adds: *Answering "ICMP uses port 1" is a common slip. ICMP has no ports at all; 1 is the IP protocol number in the header.*

**0:22–0:30** — Without them the first packet never leaves the host, which is why exam questions hide them inside ordinary-looking IPv4 and Ethernet questions.

> Caption: Without them the first packet never leaves the host.

Exam-trap caption mode adds: *None of the three makes IP reliable. ICMP reports a loss; it never repairs one.*

## Scene 2. ARP: ask everybody, answer once

*0:30 – 1:00 · objective: Follow one request and one reply, and add up the 28 octets of the ARP header to see why the frame is padded to 64.*

**0:30–0:37** — A wants to send to B and knows only B’s IP address. Its ARP cache has no entry for it.

> Caption: A wants to send to B and knows only B’s IP address. Its ARP cache is empty.

Exam-trap caption mode adds: *An empty cache is not an error. It is the normal state after a timeout, because entries are cached for a while and then dropped.*

**0:37–0:45** — The request goes to the broadcast hardware address, so every host on the wire has to read it.

> Caption: The request goes to the broadcast MAC address, so every host on the wire reads it.

Exam-trap caption mode adds: *The ARP request is broadcast at the link layer. A router does not forward it, so ARP never crosses a subnet boundary.*

**0:45–0:52** — Only the owner of that address answers, and the answer goes back as a unicast frame.

> Caption: Only the owner of that address answers, and the answer is unicast to the asker.

Exam-trap caption mode adds: *Every other host discards the request silently. Nothing is sent to say "not me", so a request with no owner simply times out.*

**0:52–1:00** — The pair is cached. Twenty-eight octets of ARP header plus a fourteen-octet Ethernet header need padding to reach the minimum frame size.

> Caption: The pair is cached, and 28 octets of ARP are padded to a 64-octet frame.

Exam-trap caption mode adds: *The minimum Ethernet frame is 64 octets including the 4-octet checksum, or 60 without it. Mixing the two conventions is the usual arithmetic slip.*

## Scene 3. The subnet boundary decides who gets asked

*1:00 – 1:30 · objective: Apply the prefix to five destinations and show that four ARP requests name a host and one names the router, while the IP header never changes.*

**1:00–1:07** — Compare the destination with your own prefix. If it is inside, ask for the destination’s own hardware address.

> Caption: Compare the destination with your own prefix. Inside, ask for the destination’s MAC.

Exam-trap caption mode adds: *The comparison is on the network part only. Two addresses in different subnets of the same router are still outside each other’s prefix.*

**1:07–1:15** — If it is outside, ask for the router’s hardware address. The IP destination still names the far host.

> Caption: Outside, ask for the router’s MAC. The IP destination still names the far host.

Exam-trap caption mode adds: *This is the pair of facts most often separated by mistake: MAC of the gateway, IP of the destination, in the same frame.*

**1:15–1:22** — Here are five destinations against one prefix. Four are inside it and one is outside.

> Caption: Five destinations, one /24 prefix: four inside, one outside.

Exam-trap caption mode adds: *A /24 mask is not the point. The point is that the answer is computed from the mask, so a different mask gives a different count on the same addresses.*

**1:22–1:30** — So four of the five requests name a host and one names the gateway, and the IP header is the same shape in every case.

> Caption: So four requests name a host and one names the gateway.

Exam-trap caption mode adds: *Caching changes the count. After the first resolution, later packets to the same next hop send no ARP request at all.*

## Scene 4. Gratuitous, proxy and poisoned: three ARP cases

*1:30 – 2:00 · objective: Distinguish an announcement from a question, a router answering on behalf of a host, and a reply nobody asked for — and see what replaced ARP in IPv6.*

**1:30–1:37** — A gratuitous ARP reply announces your own mapping without anyone having asked for it.

> Caption: A gratuitous ARP reply announces your own mapping without being asked.

Exam-trap caption mode adds: *It is a reply, not a request, and it is broadcast. Calling it a request loses the mark in a question that asks which field differs.*

**1:37–1:45** — A DHCP client sends one after its lease, so the rest of the subnet learns the new pair.

> Caption: A DHCP client sends one after its lease, so the subnet learns the new pair.

Exam-trap caption mode adds: *The DHCP exchange itself does not update anybody’s ARP cache. The announcement is a separate ARP frame.*

**1:45–1:52** — Proxy ARP lets a router answer for an address that is not actually on the wire.

> Caption: Proxy ARP lets a router answer for an address that is not on the wire.

Exam-trap caption mode adds: *Proxy ARP hides a configuration error rather than fixing it. A question that asks "who replies" has the router, not the host, as the answer.*

**1:52–2:00** — An unsolicited reply can also poison a cache, and IPv6 replaced the whole mechanism with neighbour discovery.

> Caption: An unsolicited reply can also poison a cache. IPv6 replaced ARP with discovery.

Exam-trap caption mode adds: *ARP has no authentication field at all, so "ARP is secure because it is local" is false. Locality is the attack surface, not a defence.*

## Scene 5. DHCP: the first question has to be a shout

*2:00 – 2:30 · objective: Walk the four messages, with their ports and addresses, and see exactly why two of them must be broadcast.*

**2:00–2:07** — A new host has no address at all, so its source is zero and its destination is the limited broadcast address.

> Caption: A new host has no address, so its source is 0.0.0.0 and its destination is 255.255.255.255.

Exam-trap caption mode adds: *The DHCP client does not know the server’s address, so it cannot unicast. That is the reason for the broadcast, not a preference.*

**2:07–2:15** — Discover is broadcast from the client port to the server port, and every server on the segment may answer with an offer.

> Caption: Discover is broadcast from port 68 to port 67. Every server on the segment may offer.

Exam-trap caption mode adds: *The ports are the reverse of what people remember: the client uses 68 and the server uses 67.*

**2:15–2:22** — The client asks for one of the offers, still by broadcast, so that the servers it did not choose learn the decision.

> Caption: The client requests one offer, still by broadcast, so the other servers learn the choice.

Exam-trap caption mode adds: *A unicast request would leave the other servers holding a reservation. The broadcast is the withdrawal mechanism.*

**2:22–2:30** — The server acknowledges, and after four messages the client has an address, a mask, a gateway and a lease.

> Caption: The server acknowledges. Four messages, and the client now has an address.

Exam-trap caption mode adds: *Four messages is the happy path. A declined address, an expired lease or a refusal all add messages, which is why counting questions say "in the absence of failures".*

## Scene 6. A lease is a timer, and a relay is a doorway

*2:30 – 3:00 · objective: Compute T1 and T2 from the lease, place renewal and rebinding on the clock, and add up the 236 fixed octets that make the message size.*

**2:30–2:37** — A lease is a timer. T1 is half the lease and T2 is seven eighths of it.

> Caption: A lease is a timer. T1 is half of it and T2 is seven eighths of it.

Exam-trap caption mode adds: *The fractions are defaults, not laws: the server may send other values in options 58 and 59, and the client must use what it is sent.*

**2:37–2:45** — At T1 the client asks its own server again, and this time the request can be unicast.

> Caption: At T1 the client asks its own server again, and that request is unicast.

Exam-trap caption mode adds: *Renewal is not a fresh DORA. It is one request and one acknowledgement, because the client already has everything it needs.*

**2:45–2:52** — If no answer arrives by T2 the client asks any server, and that request has to be broadcast.

> Caption: If nothing arrives by T2, the client asks any server, and that one is broadcast.

Exam-trap caption mode adds: *T1 < T2 < expiry is a required ordering. A question that offers T2 earlier than T1 is offering an invalid configuration.*

**2:52–3:00** — A relay agent carries the message across a router, and the fixed header is 236 octets before any option.

> Caption: A relay agent carries the message across a router, and 236 fixed octets hold the fields.

Exam-trap caption mode adds: *Routers do not forward broadcasts, so a DHCP request from another subnet needs the relay. "DHCP works across subnets by broadcast" is false.*

## Scene 7. ICMP: a messenger carried inside IP

*3:00 – 3:30 · objective: Place ICMP at the right layer — protocol number 1, no ports — and separate its error types from its query types.*

**3:00–3:07** — ICMP travels inside IP with protocol number one. It has no ports and it carries no application data.

> Caption: ICMP travels inside IP with protocol number 1. It has no ports and carries no data.

Exam-trap caption mode adds: *ICMP is not a transport protocol. It is described in the standards as an integral part of IP, and it must be implemented by every IP module.*

**3:07–3:15** — Five of the types are errors and the rest are queries, and every one of them begins with the same eight-octet header.

> Caption: Five types are errors and the rest are queries. The header is 8 octets.

Exam-trap caption mode adds: *Type 3 is an error and type 0 is a query, but both are about one packet. Reading a type number without its class is how the two get confused.*

**3:15–3:22** — An error message quotes the header of the datagram that caused it and the first eight octets of its data.

> Caption: An error quotes the IP header and the first 8 octets of the datagram that caused it.

Exam-trap caption mode adds: *Quoting only the header would not identify a socket. Quoting more than 8 is allowed, quoting fewer is not.*

**3:22–3:30** — ICMP reports a problem. It never repairs one, so IP stays an unreliable service.

> Caption: ICMP reports a problem. It never repairs one, and IP stays unreliable.

Exam-trap caption mode adds: *A silent application is not proof that nothing was sent. Reports may be lost, filtered or suppressed by the rules in the next scene.*

## Scene 8. The five cases where an error message is suppressed

*3:30 – 4:00 · objective: Run the RFC 1122 suppression rules over six concrete cases and report four messages and two silences.*

**3:30–3:37** — No error is sent about an ICMP error, and none about a datagram addressed to a broadcast or multicast address.

> Caption: No error about an ICMP error, or about a broadcast or multicast destination.

Exam-trap caption mode adds: *The rules take precedence over any other requirement to send an error. A question that asks "which message is sent" may have "none" as the answer.*

**3:37–3:45** — No error is sent about a link-layer broadcast, and none about any fragment other than the first.

> Caption: No error about a link-layer broadcast, or about any fragment except the first.

Exam-trap caption mode adds: *Fragment zero is the one with offset zero. "Any fragment" and "the first fragment" are different rules with different answers.*

**3:45–3:52** — No error is sent when the source address does not identify one single host.

> Caption: No error when the source is not one single host.

Exam-trap caption mode adds: *A datagram from 0.0.0.0 is legitimate during initialisation, but it is not a host you can answer. This is why the rule is about the source, not the sender’s intent.*

**3:52–4:00** — Run the five rules over six cases and four of them produce a message while two stay silent.

> Caption: Five rules, six cases: four messages and two silences.

Exam-trap caption mode adds: *Counting questions usually count messages, not events. Reading "how many ICMP messages" as "how many problems" is the error the two silences are there to catch.*

## Scene 9. ping and traceroute are two uses of one header

*4:00 – 4:30 · objective: Count the messages: eight for four ping probes, and five for a five-hop traceroute — four type 11 and one type 3 code 3.*

**4:00–4:07** — Ping sends an echo request of type eight and reads back an echo reply of type zero.

> Caption: ping sends an echo request, type 8, and reads the echo reply, type 0.

Exam-trap caption mode adds: *A missing ping reply proves only that no reply arrived. It does not prove the host is down: the echo may be filtered, or the reply may be suppressed.*

**4:07–4:15** — Traceroute sends with a time to live of one, then two, then three, and each router that drops a packet reports it.

> Caption: Traceroute sends with TTL 1, then 2, then 3. Each router that drops a packet reports it.

Exam-trap caption mode adds: *The router does not report its own name; it reports the interface address that sent the message. Two hops can therefore share a hostname and differ in address.*

**4:15–4:22** — Each of those reports is type eleven, code zero. On a five-hop path that is four such reports.

> Caption: Each report is type 11 code 0. On a five-hop path that is four reports.

Exam-trap caption mode adds: *Code 1 of the same type means reassembly timed out, which is a different condition. The type alone does not tell you the TTL expired.*

**4:22–4:30** — The fifth packet reaches the host itself, which answers with destination unreachable and code three.

> Caption: The fifth packet reaches the host, which answers port unreachable: type 3, code 3.

Exam-trap caption mode adds: *The tool’s variant matters: an ICMP-based traceroute ends with an echo reply instead. Same TTL ladder, different final message.*

## Scene 10. Which of the three answers this question

*4:30 – 5:00 · objective: Turn the lesson into four ordered questions, three counts and four traps.*

**4:30–4:37** — Ask what is missing. A hardware address, an IP address, or a report about a packet that failed.

> Caption: Ask what is missing: a hardware address, an IP address, or a report about a packet.

Exam-trap caption mode adds: *The protocols are not interchangeable. A DHCP question answered with ARP is wrong even though both start with a broadcast.*

**4:37–4:45** — A missing hardware address is ARP, a missing IP address is DHCP, and trouble is ICMP. Then check the prefix.

> Caption: A missing MAC is ARP, a missing IP is DHCP, and trouble is ICMP. Then check the prefix.

Exam-trap caption mode adds: *Inside the prefix the ARP target is the destination. Outside it the target is the router. The IP destination does not change either way.*

**4:45–4:52** — Count the broadcasts rather than the messages. One ARP request, and two client broadcasts in a clean DHCP exchange.

> Caption: Count broadcasts, not messages: one ARP request, and two DHCP broadcasts per lease.

Exam-trap caption mode adds: *Renewal changes the count again: a renewal is unicast, so a host that renews once a day sends no broadcast at all in that cycle.*

**4:52–5:00** — Name the layer and the identifier for each protocol, and never call ICMP a transport protocol.

> Caption: Name the layer and the identifier, and never call ICMP a transport protocol.

Exam-trap caption mode adds: *Four traps in one line each: ICMP has no ports, ARP does not cross a router, DHCP needs a relay, and T1 is not the expiry time.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
