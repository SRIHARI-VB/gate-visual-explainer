# Ip Fragmentation Cidr And Nat — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/ip-fragmentation-cidr-and-nat/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. One 32-bit number, cut in two

*0:00 – 0:30 · objective: Read a CIDR prefix as a cut position in a 32-bit number, and find the block that contains a given address.*

**0:00–0:07** — An IPv4 address is thirty-two bits, usually written as four numbers. A prefix length, written after a slash, says how many of the leftmost bits name the network. The rest name the host. The address alone does not say where the cut is; the prefix is supplied with it.

> Caption: An IPv4 address is 32 bits. A prefix is a cut position in those bits.

Exam-trap caption mode adds: *The prefix is not part of the address. Two hosts can have the same 32 bits and different prefixes, and then they are in different blocks.*

**0:07–0:15** — If p bits are fixed, the host part has thirty-two minus p bits, so the block contains two to the power thirty-two minus p addresses. They are consecutive, and the block always starts at a multiple of its own size. That alignment is what makes the arithmetic easy.

> Caption: With p bits fixed, the block holds 2 to the power 32 minus p addresses.

Exam-trap caption mode adds: *The block size is two to the power of the host bits, not the number of usable hosts. Those differ by two.*

**0:15–0:22** — A slash twenty-seven leaves five host bits, so the block size is thirty-two. The given fourth octet is one four four, which is one zero zero one zero zero zero zero in binary. Keeping the top three bits gives one zero zero zero zero zero zero zero, which is one two eight. So the block runs from one two eight to one five nine.

> Caption: A /27 has 32 addresses, so the block holding .144 starts at .128.

Exam-trap caption mode adds: *Do not round the octet to the nearest multiple of the block size. Always round down to the start of the block.*

**0:22–0:30** — The network address is dot one two eight. The broadcast address is dot one five nine, where every host bit is one. So the last address that can be given to a host is dot one five eight. That is GATE twenty fifteen, set three, question thirty-eight, and the accepted answer is one five eight.

> Caption: Network .128, broadcast .159, so the last assignable host is .158.

Exam-trap caption mode adds: *The question asks for the last address that can be assigned to a host, not the last address in the block. Those differ by one, and the option list usually contains both.*

## Scene 2. The five numbers every block has

*0:30 – 1:00 · objective: Compute network, first host, last host, broadcast and usable count from an address and a prefix.*

**0:30–0:37** — Every block has five numbers worth naming: the network address, the first host, the last host, the broadcast address, and how many hosts fit. Once you know where the block starts and ends, all five follow by counting from the ends.

> Caption: Every block has five numbers worth naming, and four of them are arithmetic.

Exam-trap caption mode adds: *A question can ask for any one of the five. Read which one before computing anything.*

**0:37–0:45** — The mask is a thirty-two bit number that is all ones in the prefix and all zeros after it. Bitwise AND of the address with the mask keeps the network bits and clears the host bits, and what remains is the network address.

> Caption: The mask is all ones in the prefix. Network equals address AND mask.

Exam-trap caption mode adds: *AND with the mask gives the network address, never the last host address. The last host is the block end minus one.*

**0:45–0:52** — If the host part has h bits, the block contains two to the h addresses, and two to the h minus two of them can be assigned. The two that cannot are the all-zero host value, which names the network, and the all-one host value, which is the broadcast.

> Caption: Usable hosts are 2 to the h minus 2: the all-zero and all-one host values are reserved.

Exam-trap caption mode adds: *Two exceptions exist: a slash thirty-one point-to-point link, where both addresses are usable by a later standard, and a slash thirty-two, which is a single host. Say which convention you are using.*

**0:52–1:00** — GATE twenty nineteen question twenty-eight gives three machines with the mask two five five dot two five five dot two five five dot two five two, which is a slash thirty, block size four. The addresses end in two, five and six. Two falls in the block starting at zero, while five and six both fall in the block starting at four. So only those two share a subnet.

> Caption: GATE 2019 Q28: with a /30 mask, .5 and .6 share a block and .2 does not.

Exam-trap caption mode adds: *Two addresses that are numerically close are not necessarily in the same block. The block boundary is what decides, not the distance.*

## Scene 3. Longest prefix match, on two real tables

*1:00 – 1:30 · objective: Turn a routing table into a forwarding decision, and see why the longest match wins rather than the first.*

**1:00–1:07** — A router does not store classes any more; it stores prefixes. For each entry, AND the destination address with that entry mask and compare the result with the entry network. If they agree, the entry is a candidate for this packet.

> Caption: A router table is a list of prefixes. An entry is a candidate if the first p bits agree.

Exam-trap caption mode adds: *Comparing the printed network address with the destination without ANDing is the usual slip. Two different networks can both be candidates.*

**1:07–1:15** — Several entries can match the same packet, and that is normal. The router takes the entry with the longest prefix, because that is the most specific description of where the packet should go. The order in the table does not matter.

> Caption: Several entries can match. The longest one wins, not the first one listed.

Exam-trap caption mode adds: *A default route is a prefix of length zero, so it matches everything and wins nothing. It is the answer only when no other entry matches.*

**1:15–1:22** — GATE twenty twenty-three question fifty-five. The destination is two hundred dot one fifty dot sixty-eight dot one eighteen. It matches the slash sixteen, the slash nineteen and the slash twenty-four. The slash twenty-seven block ends at dot ninety-five, so it does not match. Among the three that do, the slash twenty-four is longest, so the packet leaves on interface three.

> Caption: GATE 2023 Q55: .118 matches /16, /19 and /24, so interface 3 answers.

Exam-trap caption mode adds: *A /27 block that contains the address on paper can still be the wrong answer if the block boundary puts the address outside it. Always check the range, not the prefix alone.*

**1:22–1:30** — GATE twenty twenty-four, set one. Five hosts receive twenty packets each, and the table has four prefixes. Host sixteen takes the slash twenty-four. Host seventy-two takes the slash twenty-six. Hosts one thirty-two and one ninety-one take the slash twenty-five, which is R two. Host two hundred five takes the slash twenty-six for R four. Two hosts times twenty packets is forty.

> Caption: GATE 2024 Set 1: five hosts, twenty packets each, two hosts go via R2, so 40.

Exam-trap caption mode adds: *The count asked for is packets, not hosts. Multiply by the per-host count before writing the answer.*

## Scene 4. Aggregation: when two blocks become one

*1:30 – 2:00 · objective: State the exact condition under which two adjacent blocks merge, and check that a merged block steals no address.*

**1:30–1:37** — Two blocks of the same size can be written as one larger block exactly when they are neighbours, meaning their start addresses differ by one block size. Then they merge into a block with one more bit of room and a prefix one shorter. The merged block covers the two and nothing else.

> Caption: Two equal blocks merge exactly when they differ only in the bit just left of the prefix.

Exam-trap caption mode adds: *Neighbouring numbers are not enough. They must be aligned as a pair, which is why 164 and 168 with a slash twenty-two prefix cannot merge.*

**1:37–1:45** — Aggregation is only correct if the merged entry covers exactly the addresses you want, or if the extra addresses also belong behind the same next hop. If the merged block swallows a neighbour network, the router will send that traffic to the wrong place.

> Caption: Aggregation must not steal addresses. The merged block covers the union, no more.

Exam-trap caption mode adds: *A shorter prefix always covers more. Ask what else it covers before accepting it.*

**1:45–1:52** — GATE twenty twenty-two question forty-five. The four subnets are one six four slash twenty-two, one six six slash twenty-three, one six eight slash twenty-three and one seventy slash twenty-three. The first already contains one six six. The other two are the two halves of one six eight slash twenty-two. So two prefixes, one six four slash twenty-two and one six eight slash twenty-two, cover everything with no extra address.

> Caption: GATE 2022 Q45: 164.0/22 already covers 166.0/23, and 168.0/22 covers the other two.

Exam-trap caption mode adds: *A single slash twenty or slash twenty-one also covers the four, but it also covers addresses nobody asked for. The question asks what aggregates them correctly, which means exactly.*

**1:52–2:00** — The third octets are one zero one zero zero one zero zero and one zero one zero one zero zero zero. A slash twenty-one would fix five bits of that octet, and these two disagree on the fifth. So no single slash twenty-one contains both, and the answer stays a pair of slash twenty-two entries.

> Caption: 164 and 168 differ in the bit that a /21 would fix, so they stay two entries.

Exam-trap caption mode adds: *The community discussion of this question notes that merging 168.0/23 with 170.0/23 assumes the same next hop. That assumption is worth stating whenever you aggregate.*

## Scene 5. Fragmentation: three fields and one rounding

*2:00 – 2:30 · objective: Fix the fragment budget, the 8-byte granularity of the offset, and the meaning of MF, offset and identification.*

**2:00–2:07** — The maximum transmission unit of a link is the largest IP datagram it can carry, and that includes the header. So the data budget is the MTU minus the header length. On Ethernet, fifteen hundred minus twenty leaves fourteen hundred and eighty bytes of data.

> Caption: MTU is the largest IP datagram a link carries, header included.

Exam-trap caption mode adds: *MTU counts the header. Subtracting the header twice, or not at all, is the most common arithmetic error in this topic.*

**2:07–2:15** — The fragment offset is stored in units of eight bytes, so every fragment except the last must carry a multiple of eight bytes. That is why the usable payload is the budget rounded down to a multiple of eight. Only the last fragment may carry a remainder.

> Caption: Every fragment but the last carries a multiple of 8 bytes of data.

Exam-trap caption mode adds: *Rounding up, or using the raw budget, gives a fragment whose offset is not a whole number of units. GATE answer ranges reject those values.*

**2:15–2:22** — Each fragment carries its own header. The identification field is copied from the original, so the receiver can group the pieces. The total length counts only this fragment. The offset is the position of this fragment first data byte in the original data, divided by eight. The more fragments bit is one everywhere except the last one. And the header checksum is recomputed for each piece.

> Caption: Each fragment repeats the identification, and sets its own length, offset and MF bit.

Exam-trap caption mode adds: *The offset is measured from the start of the original data, not from the start of the previous fragment. That matters when a fragment is fragmented again.*

**2:22–2:30** — Fragments are put back together only at the destination. A router does not reassemble, because it may face a smaller link again immediately. So a datagram can be fragmented several times on one path. GATE twenty twenty-four, set two, question twenty-eight asks this as a true or false set, and the true statements are the two just stated.

> Caption: Reassembly is at the destination only. A router may fragment again on the next link.

Exam-trap caption mode adds: *A router that reassembled would spend memory and would still have to fragment again downstream. The design avoids both.*

## Scene 6. GATE 2016 Set 1: 1000 bytes into a 100-byte link

*2:30 – 3:00 · objective: Fragment one datagram completely, and check the three invariants that make the answer self-verifying.*

**2:30–2:37** — GATE twenty sixteen, set one. The datagram is one thousand bytes including a twenty byte header, so it carries nine hundred and eighty bytes of data. The link allows one hundred bytes including the header, so the budget is eighty, which is already a multiple of eight.

> Caption: GATE 2016 Set 1: 1000 bytes total, 100-byte MTU, 20-byte header.

Exam-trap caption mode adds: *If the question gives the total size, subtract the header before dividing. If it gives the data size, do not subtract again.*

**2:37–2:45** — Nine hundred and eighty divided by eighty is twelve with twenty left over. So twelve full fragments carry eighty bytes each, covering the first nine hundred and sixty bytes, and twenty bytes remain.

> Caption: Twelve fragments carry 80 each, which is 960, and 20 bytes remain.

Exam-trap caption mode adds: *A remainder of exactly zero would mean no extra fragment. Here the remainder is not zero, so one more fragment is needed.*

**2:45–2:52** — So the datagram becomes thirteen fragments. The first has offset zero and the more fragments bit set. Each full fragment advances the offset by ten units, because eighty bytes is ten units of eight. The thirteenth fragment starts at byte nine hundred and sixty, so its offset is one hundred and twenty, and its more fragments bit is zero.

> Caption: Thirteen fragments. Offsets run 0, 10, 20 and up to 120 in units of 8.

Exam-trap caption mode adds: *The answer to the paper is thirteen. Twelve is the count of full fragments, and it is the most popular wrong answer.*

**2:52–3:00** — Any fragment list can be checked three ways. The data bytes across the fragments must add up to the original data. Every fragment except the last must carry a multiple of eight bytes. And the offsets must be the running sums divided by eight. This page runs those three checks on every example it shows.

> Caption: Three checks confirm any fragment list: sizes, offsets and the flag on the last one.

Exam-trap caption mode adds: *A wrong answer usually fails one of these three checks. Running them takes less time than re-deriving the list.*

## Scene 7. Where the transport header sits: GATE 2025 Set 2

*3:00 – 3:30 · objective: Count from the transport payload, not from the IP datagram, and size the last fragment including its header.*

**3:00–3:07** — GATE twenty twenty-five, set two. The payload handed to UDP is seven thousand four hundred and eighty-eight bytes. UDP adds eight bytes of header, and that header is inside the IP data, so the datagram carries seven thousand four hundred and ninety-six bytes of data. The Ethernet data field is fifteen hundred, and the IP header is twenty, so the budget is fourteen hundred and eighty.

> Caption: GATE 2025 Set 2: 7488 bytes of UDP payload, plus 8 bytes of UDP header.

Exam-trap caption mode adds: *Counting only the payload and forgetting the UDP header changes the last fragment by eight bytes, which is exactly the distance between two of the options.*

**3:07–3:15** — Five fragments of fourteen hundred and eighty carry seven thousand four hundred bytes. What is left is ninety-six bytes, which is a multiple of eight, so it forms a sixth fragment exactly.

> Caption: Five full fragments of 1480 leave 96 bytes for a sixth.

Exam-trap caption mode adds: *If the remainder were not a multiple of eight, the last fragment would still be allowed to hold it. Only the non-last fragments must align.*

**3:15–3:22** — So there are six fragments, and the last one carries ninety-six bytes of data plus a twenty byte header, which is one hundred and sixteen bytes. Among the options offered, that is the fourth one.

> Caption: Six fragments, and the last is 96 plus 20, which is 116 bytes.

Exam-trap caption mode adds: *The option list holds 88, 108 and 116, which are the answers you get by mishandling the UDP header or the IP header. Compute the fields, then match.*

**3:22–3:30** — The transport header sits at the start of the data, so it travels in the first fragment only. Ports are in its first four bytes. A later fragment carries no port number at all. And if any fragment is lost, the sender must resend the whole segment, because the sender never learns that a router fragmented the datagram.

> Caption: The UDP header travels in the first fragment only, so losing any piece costs the whole segment.

Exam-trap caption mode adds: *A statement saying the destination port can be read from any single fragment is false. Only the first fragment carries it.*

## Scene 8. Two links, two MTUs: fragmenting twice

*3:30 – 4:00 · objective: Fragment an already-fragmented datagram again, keeping every offset relative to the original data.*

**3:30–3:37** — GATE twenty twenty-four, set one. The datagram is fourteen hundred and twenty bytes including the header, so it carries fourteen hundred bytes of data. The first link allows five hundred and forty-two bytes, leaving five hundred and twenty-two for data, rounded down to five hundred and twenty. So three fragments leave the sender, carrying five hundred and twenty, five hundred and twenty and three hundred and sixty bytes.

> Caption: GATE 2024 Set 1: 1420 bytes total, then links of 542 and 360 bytes.

Exam-trap caption mode adds: *The third fragment carries 360 bytes, which is not a multiple of 8? It is: 360 is 45 units of 8. Check the remainder before assuming a rounding error.*

**3:37–3:45** — The second link allows three hundred and sixty bytes, leaving three hundred and forty for data, rounded down to three hundred and thirty-six. Now each incoming fragment is cut again. Each five hundred and twenty byte fragment becomes three hundred and thirty-six plus one hundred and eighty-four, and the three hundred and sixty byte fragment becomes three hundred and thirty-six plus twenty-four.

> Caption: The second link allows 336 bytes of data, so each fragment is cut again.

Exam-trap caption mode adds: *A fragment that already had the more fragments bit set keeps it on its own non-final pieces. Only the true last piece of the datagram clears it.*

**3:45–3:52** — So six fragments reach the receiver. Their data adds to fourteen hundred bytes, which is exactly the original data, so nothing was lost or sent twice. That conservation check is the fastest way to test your own answer.

> Caption: Six fragments reach the receiver, and their data still adds to 1400.

Exam-trap caption mode adds: *The answer to the paper is six, not three. Three is the count after the first hop, and the question asks what reaches the receiver.*

**3:52–4:00** — The offsets of every fragment are positions in the original data, not positions inside the fragment that was cut. So the pieces of the second fragment continue from offset sixty-five units, they do not restart at zero. That is what lets the receiver reassemble without knowing how many times the datagram was cut.

> Caption: Offsets stay relative to the original data, so the second cut continues from where it was.

Exam-trap caption mode adds: *Restarting the offset at zero for each re-fragmentation produces a list the receiver cannot reassemble, and the arithmetic still looks plausible.*

## Scene 9. NAT: rewriting two addresses, one table

*4:00 – 4:30 · objective: Follow a packet out and back through a translation table, and name exactly which header fields change.*

**4:00–4:07** — A private address cannot travel across the public Internet, so the border device replaces the source address with one of its own public addresses and writes the mapping into a table. The destination address is not touched on the way out.

> Caption: NAT rewrites the source address on the way out, using a table it keeps.

Exam-trap caption mode adds: *NAT is not a router feature that changes routing. It changes addresses, and the routing decision is made on the translated packet.*

**4:07–4:15** — If one public address must serve many private hosts, the device also rewrites the source port. Then two hosts are distinguished by the pair of public address and public port, and that pair must be unique. This is what a home router does.

> Caption: With one public address, the port is what tells two private hosts apart.

Exam-trap caption mode adds: *Without the port rewrite, two hosts using the same source port would collide and replies would go to the wrong machine.*

**4:15–4:22** — GATE twenty twenty-four, set one, question twenty-one asks which header fields a NAT device modifies. The source address changes, and because the checksum covers the header, the checksum is recomputed. The destination address does not change, and the total length does not change because no bytes were added or removed. So the answer is the source address and the header checksum.

> Caption: GATE 2024 Set 1 Q21: source IP and header checksum change; destination and length do not.

Exam-trap caption mode adds: *A transport checksum that covers the pseudo-header also becomes wrong. That is a different checksum from the IP header one, and both need care.*

**4:22–4:30** — The reply comes back addressed to the public address and the public port. The device looks that pair up in the table, rewrites the destination address and port back to the private host, and forwards it inside. A packet that matches no entry is dropped, which is why a connection started from outside cannot get in.

> Caption: The reply is matched on public address and port. No entry, no delivery.

Exam-trap caption mode adds: *NAT gives address conservation and a crude barrier, not security. Do not claim it authenticates or encrypts anything.*

## Scene 10. The procedure, and the four slips

*4:30 – 5:00 · objective: Fix a routine that covers every addressing and fragmentation question shape, plus the traps that cost marks.*

**4:30–4:37** — For an addressing question, first turn the prefix into a block size. Second, round the address down to the block start. Third, list the five numbers. Fourth, read again which one is wanted. Fifth, check that your answer lies inside the block you computed.

> Caption: For any addressing question: find the block, then name which of the five numbers is wanted.

Exam-trap caption mode adds: *Most lost marks here come from answering a neighbouring number: the broadcast instead of the last host, or the total count instead of the usable count.*

**4:37–4:45** — For a fragmentation question, three quantities in order. Budget equals MTU minus header. Usable payload is the budget rounded down to a multiple of eight. Count is data divided by usable payload, rounded up. Then the offsets are the running sums divided by eight, and only the last fragment clears the more fragments bit.

> Caption: For any fragmentation question: budget, floor to eight, then count.

Exam-trap caption mode adds: *Write the units next to every number. Offsets are in units of eight bytes, lengths in bytes, and mixing them is the quiet error.*

**4:45–4:52** — Four slips account for most wrong answers here. Confusing the number of addresses with the number of usable hosts. Confusing the block size with the mask value. Writing the offset in bytes instead of units of eight. And taking the first matching route instead of the longest. Each one is checked on this page against its definition.

> Caption: Four slips account for most wrong answers in this clause.

Exam-trap caption mode adds: *In a multiple-select question, each of these slips usually appears as one of the options. That is why the options look familiar.*

**4:52–5:00** — This clause connects both ways. The routing lesson builds the table that longest prefix match reads. And the transport lesson explains what a lost fragment costs, which is a whole segment retransmitted. Learn this one with those two and the section becomes one idea seen three times.

> Caption: This clause connects backwards to routing and forwards to TCP.

Exam-trap caption mode adds: *Do not treat addressing as isolated arithmetic. Every number here is used by a routing or transport question elsewhere in the paper.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
