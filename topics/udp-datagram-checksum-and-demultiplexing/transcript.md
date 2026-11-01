# UDP: the Datagram, the Checksum and Demultiplexing — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/udp-datagram-checksum-and-demultiplexing/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. What UDP keeps, and what it throws away

*0:00 – 0:30 · objective: See UDP as the transport that kept exactly two jobs — find the right program, and check the bits — and dropped everything else to the application.*

**0:00–0:07** — A transport layer has to do two things: find the right program at the far end, and notice when the bits arrived damaged. UDP does those two and stops.

> Caption: A transport layer has two jobs to do. UDP does both and stops there.

Exam-trap caption mode adds: *Do not say UDP is unreliable and leave it there. It is unreliable in a precise sense: it offers no acknowledgement and no retransmission. The checksum is still there, and it is the only protection UDP offers.*

**0:07–0:15** — Multiplexing is the port number, sixteen bits of it. Integrity is the checksum, also sixteen bits, and it covers more than the datagram you can see.

> Caption: Multiplexing is the port number. Integrity is the checksum.

Exam-trap caption mode adds: *A port number is not an address. It names a program on a host, and it is only meaningful together with the destination IP address.*

**0:15–0:22** — Everything else is left to the application, and that is deliberate. The standard says so in its first paragraph.

> Caption: Everything else is the application’s problem, by design.

Exam-trap caption mode adds: *A question that asks which protocol is "better" has no answer. UDP is cheaper; TCP is safer. The exam asks which one a named application uses and why.*

**0:22–0:30** — Think of a postcard rather than a registered letter. Cheap, self-contained, and nobody promises it arrives at all.

> Caption: A postcard, not a registered letter.

Exam-trap caption mode adds: *This is an analogy, not a definition. It does not tell you that UDP is connectionless in the header sense, which is what a question actually tests.*

## Scene 2. The eight octets: four fields, two octets each

*0:30 – 1:00 · objective: Read the four header fields, note which two can legally be zero, and see that Length counts the header it sits in.*

**0:30–0:37** — The header is four fields of two octets each: source port, destination port, length, checksum. Eight octets in total.

> Caption: Four fields, two octets each, so eight octets in all.

Exam-trap caption mode adds: *The UDP header is fixed at eight octets. There are no options and no variable part, so the data always begins at offset eight.*

**0:37–0:45** — The source port is optional. If the sender expects no reply it may put zero there, and the standard says exactly that.

> Caption: Source Port is optional: if it is not used, a zero goes there.

Exam-trap caption mode adds: *Zero in the source port is legal. Zero in the checksum field is also legal in IPv4 and means the opposite of a valid checksum: it means none was computed.*

**0:45–0:52** — Length counts the header as well as the data, so its smallest legal value is eight. A query of thirty-three octets reports forty-one.

> Caption: Length counts the header as well as the data.

Exam-trap caption mode adds: *The commonest arithmetic error in this topic is reporting the payload as the Length. The field includes its own eight octets.*

**0:52–1:00** — The destination port is the field that decides which program receives the datagram, and no router along the way changes it.

> Caption: Destination Port is the one field a router never rewrites.

Exam-trap caption mode adds: *NAT is the exception that proves the rule: a NAT box does rewrite ports, which is why it breaks protocols that carry addresses or ports inside the payload.*

## Scene 3. The length field is 16 bits, so the ceiling is 65535

*1:00 – 1:30 · objective: Derive 65527, 65507 and 65467 from the 16-bit ceiling and the IPv4 header, and place a DNS query of 33 octets on the same scale.*

**1:00–1:07** — Sixteen bits can hold sixty-five thousand five hundred and thirty-five, so that is the largest value the length field can report.

> Caption: Sixteen bits hold 65535, so no UDP datagram can be longer.

Exam-trap caption mode adds: *The 16-bit ceiling is a property of the field, not of the network. A link with a larger MTU does not raise it.*

**1:07–1:15** — Take away the eight octets of header and sixty-five thousand five hundred and twenty-seven octets of data remain.

> Caption: So the largest payload is 65535 minus 8, which is 65527.

Exam-trap caption mode adds: *This is the UDP limit. The IP limit is smaller, and a question that says "over IPv4" wants the IP number, not this one.*

**1:15–1:22** — IPv4 has its own sixteen-bit total length, so with a twenty-octet header the real payload ceiling is sixty-five thousand five hundred and seven.

> Caption: IPv4 caps the total at 65535 too, so the payload drops to 65507.

Exam-trap caption mode adds: *Both ceilings are 65535, which is why the subtraction is easy to get wrong. The IPv4 field counts the IP header; the UDP field counts the UDP header. Neither counts the other.*

**1:22–1:30** — A DNS query of thirty-three octets reports a length of forty-one, and forty-one is odd, which the checksum will have to deal with.

> Caption: A DNS query is 33 octets, so its Length field says 41.

Exam-trap caption mode adds: *An odd length is the normal case for DNS, not an error. One padding octet is added for the checksum only; it is not transmitted.*

## Scene 4. The pseudo-header: six words that are never sent

*1:30 – 2:00 · objective: Build the 12-octet IPv4 pseudo-header, see why the addresses are in the checksum, and compare it with the 40-octet IPv6 version.*

**1:30–1:37** — The checksum covers six extra words that are never sent. The sender and the receiver each build them from the IP header.

> Caption: The checksum also covers six words that are never transmitted.

Exam-trap caption mode adds: *The pseudo-header does not enlarge the datagram. If you add twelve octets to a size, you have misunderstood it. The Length field still says the true datagram length.*

**1:37–1:45** — Twelve octets: four for the source address, four for the destination, one zero, protocol seventeen, and the length.

> Caption: Twelve octets: two addresses, a zero, protocol 17, and the length.

Exam-trap caption mode adds: *Protocol 17 identifies UDP in the IP header. It is not a port number, and a question that says "port 17" is testing exactly this confusion.*

**1:45–1:52** — Including the addresses is the point. A datagram delivered to the wrong host fails the check even though its own bytes are perfect.

> Caption: Including the addresses is what detects a misrouted datagram.

Exam-trap caption mode adds: *The checksum therefore cannot be verified without the IP addresses. A capture of the UDP bytes alone is not enough, which is why tools show the pseudo-header when they show a UDP checksum.*

**1:52–2:00** — IPv6 addresses are a hundred and twenty-eight bits each, so its pseudo-header is forty octets instead of twelve.

> Caption: IPv6 uses 128-bit addresses, so its pseudo-header is 40 octets.

Exam-trap caption mode adds: *RFC 8200 also makes the UDP checksum mandatory over IPv6, where IPv4 let it be zero. A question about the checksum being optional is a question about IPv4.*

## Scene 5. The checksum procedure in five steps

*2:00 – 2:30 · objective: State the one’s complement sum precisely: pad to an even count, add in 16-bit words, fold the carries, complement, and map zero to FFFF.*

**2:00–2:07** — Step one is padding. If the octet count is odd, one zero octet is appended for the arithmetic and then forgotten.

> Caption: Step one: pad the data with zero octets to an even count.

Exam-trap caption mode adds: *The padded octet is not transmitted and does not appear in the Length field. It exists only inside the checksum computation.*

**2:07–2:15** — Step two is a plain sum. Every sixteen-bit word, added as an ordinary integer, including the words from the pseudo-header.

> Caption: Step two: add every 16-bit word as an unsigned number.

Exam-trap caption mode adds: *This is not a parity check and not a hash. It is addition, which is why two compensating errors can cancel and go undetected.*

**2:15–2:22** — Step three folds the carry back into the low sixteen bits, and step four complements what is left.

> Caption: Step three: fold the carries back in, until 16 bits remain.

Exam-trap caption mode adds: *Folding is not truncation. If you drop the carry instead of adding it back, the checksum is wrong by exactly one, and the receiver will reject a good datagram.*

**2:22–2:30** — If the arithmetic produces zero the field is sent as all ones, because an all-zero field means no checksum was computed at all.

> Caption: If the result is zero, send FFFF. All zeros means no checksum at all.

Exam-trap caption mode adds: *Zero and 0xFFFF are the same number in one’s complement arithmetic and they mean opposite things in this field. That single sentence is worth a mark.*

## Scene 6. One datagram, fifteen words, one checksum

*2:30 – 3:00 · objective: Compute 0x4A6D over a 17-octet datagram and prove it by adding it back in, where the receiver’s sum must come to 0xFFFF.*

**2:30–2:37** — Here is a real one. From 192.168.1.10 to 8.8.8.8, source port 51515, destination port 53, nine octets of data.

> Caption: One datagram: 192.168.1.10 to 8.8.8.8, port 51515 to port 53.

Exam-trap caption mode adds: *The source port 51515 is an ephemeral port chosen by the client. Its exact value never matters to the answer; the arithmetic around it does.*

**2:37–2:45** — Fifteen words in total. Six from the pseudo-header, four from the UDP header, and five from the padded data.

> Caption: Fifteen words in all: six pseudo, four header, five data.

Exam-trap caption mode adds: *The checksum field itself is one of those fifteen words, and it is set to zero before the sum is taken. Adding a stale value first is the classic error.*

**2:45–2:52** — The sum comes to B five nine two, and the complement of that is four A six D.

> Caption: The sum is B592, so the checksum is its complement: 4A6D.

Exam-trap caption mode adds: *The complement of a 16-bit value is not its negation. Invert every bit; do not subtract from 65536.*

**2:52–3:00** — Put four A six D into the field and add again, and the answer is all ones. That is the whole receiver test.

> Caption: Add it back in and the receiver gets FFFF. That is the test.

Exam-trap caption mode adds: *There is no negative acknowledgement for a bad UDP checksum. The datagram is dropped and the application is never told, which is why DNS has its own timeout.*

## Scene 7. Demultiplexing: two fields, not four

*3:00 – 3:30 · objective: Apply the two-tuple rule to three datagrams from two senders and see one socket receive all three, where TCP would need two.*

**3:00–3:07** — To deliver a datagram the receiver looks at two fields: the destination address and the destination port. Nothing else.

> Caption: A UDP socket is named by two things: destination address and port.

Exam-trap caption mode adds: *TCP uses four fields: both addresses and both ports. A question that says "the same connection" is using TCP language, and UDP has no connections to be the same.*

**3:07–3:15** — Three datagrams arrive from two different senders at the same port. All three go to the same socket, and the program tells them apart by the source fields.

> Caption: Three datagrams, two senders, one port: all three reach one socket.

Exam-trap caption mode adds: *This is why a UDP server can be written as a single loop over one socket, and why it must copy the source address out of every request before answering.*

**3:15–3:22** — The same traffic over TCP would need two sockets, because the four-tuple makes them two connections.

> Caption: The same three flows over TCP would need two sockets.

Exam-trap caption mode adds: *Counting sockets is a favourite question shape. Count distinct destination tuples for UDP, and distinct four-tuples for TCP.*

**3:22–3:30** — Two datagrams to the same port stay two messages. UDP never merges them and never splits one across two reads.

> Caption: Two datagrams to the same port are two separate messages.

Exam-trap caption mode adds: *A 100-octet datagram does not arrive as two reads of 50. If a question describes reads of a size the sender did not choose, it is describing TCP.*

## Scene 8. Ports, and the exchange DNS actually has

*3:30 – 4:00 · objective: Place the well-known ports on the 16-bit space and read one DNS exchange as a single request and a single response with no connection.*

**3:30–3:37** — A port is sixteen bits, so there are sixty-five thousand five hundred and thirty-six of them, numbered from zero.

> Caption: Sixteen bits of port: 65536 values, 0 to 65535.

Exam-trap caption mode adds: *Counting values is not the same as the largest value. There are 65536 ports and the highest is 65535; questions ask for both.*

**3:37–3:45** — The ones worth remembering: fifty-three for DNS, sixty-seven and sixty-eight for DHCP, sixty-nine for TFTP, a hundred and twenty-three for NTP, a hundred and sixty-one for SNMP.

> Caption: The numbers worth memorising: 53, 67, 68, 69, 123, 161.

Exam-trap caption mode adds: *DNS uses 53 over both UDP and TCP. The TCP variant exists for responses too large for a single datagram, so "DNS is UDP" is only half true.*

**3:45–3:52** — One query out, one response back, and nothing else. No handshake, no acknowledgement, no connection to tear down.

> Caption: One query out, one response back, and no connection at all.

Exam-trap caption mode adds: *The response is matched to the query by the DNS transaction identifier and the source port, not by any transport-level state. Both are chosen by the client.*

**3:52–4:00** — Eight octets of header instead of twenty, and one round trip saved, at the price of doing your own retransmission.

> Caption: That is the trade: 8 octets of header instead of 20, and no safety net.

Exam-trap caption mode adds: *The saving is the header plus the handshake, not just the header. A question that asks why DNS uses UDP is asking about both.*

## Scene 9. What the missing machinery costs

*4:00 – 4:30 · objective: Trace the consequences of no retransmission, no ordering, no flow control and no congestion control — including the fragment count of a real GATE question.*

**4:00–4:07** — Four things are missing. Nothing is resent, nothing is reordered, nothing is flow controlled, and nothing slows down when the network is congested.

> Caption: No retransmission, no ordering, no flow control, no congestion control.

Exam-trap caption mode adds: *The absence of congestion control is the one with security consequences, because a sender can be made to emit large responses to a forged source address.*

**4:07–4:15** — Over IPv6 the checksum stops being optional. A zero in that field is a datagram to be discarded.

> Caption: Over IPv6 the checksum is not optional, and zero is discarded.

Exam-trap caption mode adds: *The IPv4 rule and the IPv6 rule are opposites on this one point. Read which version a question names before answering.*

**4:15–4:22** — The UDP header travels inside IP, so fragmentation counts it as payload. Eight thousand eight hundred and eighty octets of data become eight thousand eight hundred and eighty-eight at the IP layer.

> Caption: The header sits inside IP, so fragmentation counts it.

Exam-trap caption mode adds: *Fragmenting 8880 instead of 8888 gives six fragments and the wrong answer. The eight octets of UDP header are always part of the IP payload.*

**4:22–4:30** — Six full fragments and a seventh carrying eight octets, whose offset field reads one thousand one hundred and ten.

> Caption: Seven fragments, the last carrying 8 octets, at offset 1110.

Exam-trap caption mode adds: *The offset counts from the start of the IP payload, not from the start of the data, and it is in eight-octet units. Dividing by 8 is the step that is most often forgotten.*

## Scene 10. The four questions, the counts and the traps

*4:30 – 5:00 · objective: Fix a four-question procedure for any UDP question and name the four answers that look right and are wrong.*

**4:30–4:37** — First, decide which length the question means. Data, datagram, IP payload and IP total length are four different numbers.

> Caption: Question one: which length does the question mean?

Exam-trap caption mode adds: *A question saying "the UDP segment" usually means header plus data. A question saying "the payload" usually means the data alone. Neither is universal, so read the options.*

**4:37–4:45** — Second, decide whether you are computing the checksum or checking one. One puts a number in the field, the other expects all ones out.

> Caption: Question two: is the checksum being computed or verified?

Exam-trap caption mode adds: *A verification question that asks for the value of the field wants the value already in it, not the result of the sum.*

**4:45–4:52** — Third, pick the right pseudo-header. Twelve octets over IPv4, forty over IPv6, and protocol seventeen in both.

> Caption: Question three: which pseudo-header, and which protocol number?

Exam-trap caption mode adds: *The pseudo-header changes the checksum but never the Length field. A question that asks for the datagram size is unaffected by it.*

**4:52–5:00** — Fourth, count. Two fields per UDP socket, four per TCP connection, one datagram per message, and fragments are counted at the IP layer.

> Caption: Question four: how many sockets, and how many messages?

Exam-trap caption mode adds: *The number of fragments is never the number of datagrams, and the number of sockets is never the number of datagrams either. Three different counts, three different questions.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
