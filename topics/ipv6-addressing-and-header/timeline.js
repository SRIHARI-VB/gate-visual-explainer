/* ==========================================================================
   ipv6-addressing-and-header - THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs - never edited by hand.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 336,

  scenes: [
    { id: 'why',      n: 1,  title: 'A bigger space, not a bigger number',                start: 0,   end: 30  },
    { id: 'groups',   n: 2,  title: 'Eight groups of sixteen bits',                       start: 30,  end: 58  },
    { id: 'compress', n: 3,  title: 'Five rules take thirty-nine characters to seventeen', start: 58,  end: 92  },
    { id: 'expand',   n: 4,  title: 'Reading it back: the double colon is a count',       start: 92,  end: 120 },
    { id: 'prefix',   n: 5,  title: 'A prefix is a cut, and the counts are powers of two', start: 120, end: 152 },
    { id: 'header',   n: 6,  title: 'The base header is fixed at forty octets',           start: 152, end: 186 },
    { id: 'dropped',  n: 7,  title: 'Three things IPv4 needed that IPv6 removed',         start: 186, end: 216 },
    { id: 'payload',  n: 8,  title: 'Payload Length counts what follows the header',      start: 216, end: 246 },
    { id: 'chain',    n: 9,  title: 'Next Header is a chain, not a single value',         start: 246, end: 274 },
    { id: 'eui64',    n: 10, title: 'A link-local address writes itself',                 start: 274, end: 304 },
    { id: 'pyq2018',  n: 11, title: 'GATE CSE 2018, Q13: four widths to match',           start: 304, end: 336 }
  ],

  events: [
    /* ---- 1. why --------------------------------------------------------- */
    { id: 'w1', scene: 'why', start: 0, end: 8,
      caption: 'An IPv4 address is thirty-two bits and an IPv6 address is a hundred and twenty-eight. The extra width is the reason the space stopped being countable.',
      narration: 'An IPv4 address is thirty-two bits. An IPv6 address is a hundred and twenty-eight. The extra width is not decoration: it is the reason the address space stopped being countable.',
      detail: 'Everything else in this lesson follows from that width: the eight groups, the compression rules, the forty-octet header and the prefix arithmetic.',
      keyword: 'stopped being countable' },

    { id: 'w2', scene: 'why', start: 8, end: 16,
      caption: 'IPv4 has two to the thirty-two addresses, about 4.29 billion. IPv6 has two to the hundred and twenty-eight, about 3.4 times ten to the thirty-eight.',
      narration: 'IPv4 has two to the thirty-two addresses, about four point two nine billion. IPv6 has two to the hundred and twenty-eight, about three point four times ten to the thirty-eight.',
      detail: 'The ratio is two to the ninety-six, which is 79,228,162,514,264,337,593,543,950,336. Four times the width is two to the ninety-six times the space.',
      keyword: '4.29 billion' },

    { id: 'w3', scene: 'why', start: 16, end: 23,
      caption: 'By convention the hundred and twenty-eight bits split sixty-four and sixty-four: a routing prefix on the left and an interface ID on the right.',
      narration: 'By convention the hundred and twenty-eight bits split sixty-four and sixty-four. A routing prefix on the left, an interface ID on the right. One slash sixty-four is one subnet.',
      detail: 'RFC 4291 requires a 64-bit interface ID only for unicast addresses that do not begin with the bits 000, and stateless autoconfiguration needs it. The split is a strong convention, not a rule of the header.',
      keyword: 'sixty-four and sixty-four' },

    { id: 'w4', scene: 'why', start: 23, end: 30,
      caption: 'A slash forty-eight site holds 65,536 subnets of size sixty-four, and a slash thirty-two allocation holds 4.29 billion of them.',
      narration: 'A slash forty-eight site holds sixty-five thousand five hundred and thirty-six subnets of size sixty-four, and a slash thirty-two allocation holds four point two nine billion of them.',
      detail: 'Those are the numbers an ISP actually hands out, and they are why the address is hierarchical: the prefix says where, the interface ID says which.',
      keyword: '65,536 subnets' },

    /* ---- 2. groups ------------------------------------------------------ */
    { id: 'g1', scene: 'groups', start: 30, end: 37,
      caption: 'The address is written as eight groups of sixteen bits, separated by colons. Each group is four hexadecimal digits.',
      narration: 'The address is written as eight groups of sixteen bits, separated by colons. Each group is four hexadecimal digits.',
      detail: 'Eight times sixteen is one hundred and twenty-eight, so the eight groups are the whole address and nothing is left over.',
      keyword: 'eight groups' },

    { id: 'g2', scene: 'groups', start: 37, end: 44,
      caption: 'Eight groups times sixteen bits is a hundred and twenty-eight bits, and four hex digits per group makes thirty-two hex digits in all.',
      narration: 'Eight groups times sixteen bits is a hundred and twenty-eight bits, and four hex digits per group makes thirty-two hex digits in all.',
      detail: 'Sixteen bits is four nibbles, so each group is four hex digits: two thousand and one, then zero d b eight, and so on. Thirty-two hex digits is sixteen octets.',
      keyword: 'thirty-two hex digits' },

    { id: 'g3', scene: 'groups', start: 44, end: 51,
      caption: 'One group, zero two zero two, is four zeros, then one, then four zeros, then one: sixteen bits in two nibbles of four.',
      narration: 'One group, zero two zero two, is four zeros then one, then four zeros then one. Sixteen bits, written as four nibbles of four bits each.',
      detail: 'A hex digit is a nibble, four bits. Zero is 0000, two is 0010. So 0202 is 0000 0010 0000 0010, and the value is 514.',
      keyword: 'a nibble' },

    { id: 'g4', scene: 'groups', start: 51, end: 58,
      caption: 'The leading zeros are shown here only to line the boxes up. The written form drops them, and that is the first compression rule.',
      narration: 'The leading zeros are shown here only to line the boxes up. The written form drops them, and that is the first compression rule.',
      detail: 'The padded form is useful while you are counting bits. It is never the form you write in an answer, and RFC 5952 forbids it as a canonical representation.',
      keyword: 'drops them' },

    /* ---- 3. compression ------------------------------------------------- */
    { id: 'c1', scene: 'compress', start: 58, end: 66,
      caption: 'Take the fully padded address, thirty-nine characters long, with three runs of zeros to deal with.',
      narration: 'Take the fully padded address. Thirty-nine characters long, with zeros everywhere, and nobody writes it that way.',
      detail: 'The address is 2001:0db8:0000:0000:0001:0000:0000:0001. Two runs of two zero groups, and several groups with leading zeros.',
      keyword: 'nobody writes it that way' },

    { id: 'c2', scene: 'compress', start: 66, end: 74,
      caption: 'Rule one drops the leading zeros inside every group. Rule two writes the hex digits a to f in lowercase.',
      narration: 'Rule one drops the leading zeros inside every group. Rule two writes the hex digits a to f in lowercase.',
      detail: '0db8 becomes db8 and 0000 becomes 0. RFC 5952 sections 4.1 and 4.3 make both mandatory: a padded group is not acceptable, and a capital A is not acceptable.',
      keyword: 'leading zeros' },

    { id: 'c3', scene: 'compress', start: 74, end: 82,
      caption: 'Rule three: the double colon may appear at most once, because two of them would make the address impossible to expand.',
      narration: 'Rule three. The double colon may appear at most once, because two of them would make the address impossible to expand.',
      detail: 'RFC 4291 says the double colon stands for one or more groups of zeros and can appear only once. With two, the parser cannot tell which run is missing how many groups.',
      keyword: 'at most once',
      trap: 'An answer that writes two double colons is not a shorter address, it is not an address. Check the count of colons before you check anything else.' },

    { id: 'c4', scene: 'compress', start: 82, end: 88,
      caption: 'Rule four compresses the longest run of zero groups. Here two runs tie at two groups each, so the rule needs a tie-break.',
      narration: 'Rule four compresses the longest run of zero groups. Here the two runs tie at two groups each, so the rule needs a tie-break.',
      detail: 'RFC 5952 section 4.2.1 also requires the compression to be used to its maximum: compressing a shorter run while a longer one exists is not canonical.',
      keyword: 'longest run',
      trap: 'A single zero group is never compressed. 2001:db8:0:1:1:1:1:1 keeps its zero, because the double colon stands for one or more groups and would be ambiguous.' },

    { id: 'c5', scene: 'compress', start: 88, end: 92,
      caption: 'Rule five: on a tie, compress the first run. So the canonical form is two thousand and one, db8, double colon, one, zero, zero, one.',
      narration: 'Rule five. On a tie, compress the first run. So the canonical form is 2001:db8::1:0:0:1, and not 2001:db8:0:0:1::1.',
      detail: 'RFC 5952 section 4.2.3 gives exactly this address as its worked tie example. Both forms expand to the same eight groups; only one is canonical.',
      keyword: 'compress the first run' },

    /* ---- 4. expansion --------------------------------------------------- */
    { id: 'e1', scene: 'expand', start: 92, end: 99,
      caption: 'To read an address back, count the groups on both sides of the double colon: two before, one after, so it stands for five groups of zeros.',
      narration: 'To read an address back, count the groups on both sides of the double colon. Two before, one after, so it stands for five groups of zeros.',
      detail: 'The double colon absorbs whatever is missing to make eight. That is the definition, and it is why the expansion is mechanical rather than a guess.',
      keyword: 'count the groups' },

    { id: 'e2', scene: 'expand', start: 99, end: 106,
      caption: 'The count must land on exactly eight groups. That single test accepts every legal address and rejects most malformed input.',
      narration: 'The count must land on exactly eight groups. That single test accepts every legal address and rejects most malformed input.',
      detail: 'Two groups plus five implied plus one gives eight. Nothing else is needed to decide whether a string is an address.',
      keyword: 'exactly eight groups' },

    { id: 'e3', scene: 'expand', start: 106, end: 113,
      caption: 'Two double colons, nine groups with none, five hex digits in a group: each is refused for the same reason, the count cannot be made to work.',
      narration: 'Two double colons, nine groups with none, five hex digits in a group: each is refused for the same reason. The count cannot be made to work.',
      detail: 'A fourth refusal: a double colon at the end of a full eight-group address, where it would have to stand for zero groups. RFC 4291 requires at least one.',
      keyword: 'refused' },

    { id: 'e4', scene: 'expand', start: 113, end: 120,
      caption: 'A legal address can still be non-canonical. The padded form is valid and expands correctly; it is simply not how the standard writes it.',
      narration: 'A legal address can still be non-canonical. The padded form is valid and expands correctly; it is simply not how the standard writes it.',
      detail: 'Every implementation must accept any legitimate RFC 4291 form, and RFC 5952 only recommends one form for output. So reading is generous and writing is strict.',
      keyword: 'non-canonical' },

    /* ---- 5. prefix ------------------------------------------------------ */
    { id: 'p1', scene: 'prefix', start: 120, end: 128,
      caption: 'A prefix of length n leaves a hundred and twenty-eight minus n bits for the interface ID, so the subnet holds two to that power addresses.',
      narration: 'A prefix of length n leaves a hundred and twenty-eight minus n bits for the interface ID, so the subnet holds two to that power addresses.',
      detail: 'A slash sixty-four leaves sixty-four bits, which is 18,446,744,073,709,551,616 addresses. A slash one hundred and twenty-eight leaves none, so it is one address.',
      keyword: 'two to that power' },

    { id: 'p2', scene: 'prefix', start: 128, end: 136,
      caption: 'A slash sixty-four is one subnet, a slash forty-eight site holds 65,536 of them, and a slash thirty-two allocation holds 4.29 billion.',
      narration: 'A slash sixty-four is one subnet, a slash forty-eight site holds sixty-five thousand five hundred and thirty-six of them, and a slash thirty-two allocation holds four point two nine billion.',
      detail: 'Each step of sixteen bits in the prefix multiplies the subnet count by 65,536. That is the same arithmetic as IPv4 CIDR, with a wider field.',
      keyword: '65,536' },

    { id: 'p3', scene: 'prefix', start: 136, end: 144,
      caption: 'One address in every subnet is spoken for: the all-zero interface ID is the subnet-router anycast address.',
      narration: 'One address in every subnet is spoken for. The all-zero interface ID is the subnet-router anycast address, so a router answers for it.',
      detail: 'RFC 4291 section 2.6.1 predefines it, and every router must support it for the subnets it is attached to. That is the only address a subnet reserves.',
      keyword: 'subnet-router anycast' },

    { id: 'p4', scene: 'prefix', start: 144, end: 152,
      caption: 'So a slash sixty-four has two to the sixty-four minus one usable interface IDs, and IPv6 reserves no broadcast address at all.',
      narration: 'So a slash sixty-four has two to the sixty-four minus one usable interface IDs, and IPv6 reserves no broadcast address at all.',
      detail: 'IPv4 reserves two per subnet, the network address and the broadcast address. IPv6 reserves one. The all-nodes group, ff02::1, is multicast and does the job broadcast used to do.',
      keyword: 'minus one',
      trap: 'Do not subtract two out of habit. That is the IPv4 rule. In IPv6 there is no broadcast address to subtract.' },

    /* ---- 6. header ------------------------------------------------------ */
    { id: 'h1', scene: 'header', start: 152, end: 160,
      caption: 'The base header is eight fields: version, traffic class, flow label, payload length, next header, hop limit, and the two addresses.',
      narration: 'The base header is eight fields: version, traffic class, flow label, payload length, next header, hop limit, and the two addresses.',
      detail: 'Every one of the eight is fixed in width. That is what makes the header a fixed forty octets and lets a router read it without a variable-length parse.',
      keyword: 'eight fields' },

    { id: 'h2', scene: 'header', start: 160, end: 168,
      caption: 'Four, eight, twenty, sixteen, eight, eight, a hundred and twenty-eight, a hundred and twenty-eight. They sum to three hundred and twenty bits, which is forty octets.',
      narration: 'Four, eight, twenty, sixteen, eight, eight, a hundred and twenty-eight, a hundred and twenty-eight. They sum to three hundred and twenty bits, which is forty octets, and that never changes.',
      detail: 'The two addresses alone take 256 of the 320 bits. The other six fields share 64 bits, which is two 32-bit words.',
      keyword: 'forty octets' },

    { id: 'h3', scene: 'header', start: 168, end: 177,
      caption: 'Because the size is fixed there is no header-length field and no padding. The first two words hold the small fields and the rest is two addresses.',
      narration: 'Because the size is fixed there is no header-length field and no padding. The first two words hold the small fields, and the rest of the header is the two addresses.',
      detail: 'IPv4 needs a four-bit header-length field because its options make the header variable, and then it needs padding to a 32-bit boundary. IPv6 needs neither.',
      keyword: 'no header-length field' },

    { id: 'h4', scene: 'header', start: 177, end: 186,
      caption: 'Two field meanings to keep straight: hop limit counts hops and not seconds, and payload length counts octets after this header and not including it.',
      narration: 'Two field meanings to keep straight. Hop limit counts hops and not seconds. Payload length counts octets after this header, and not including it.',
      detail: 'The version field always reads 6, the traffic class carries priority, and the flow label marks a flow for special handling. None of them is a length.',
      keyword: 'hop limit',
      trap: 'Payload Length is not IPv4 Total Length. The same packet has 1008 in one field and 1048 in the other, and both are correct.' },

    /* ---- 7. dropped ----------------------------------------------------- */
    { id: 'd1', scene: 'dropped', start: 186, end: 194,
      caption: 'IPv4 carries a header checksum, and every router recomputes it because the time to live changed. IPv6 has no header checksum at all.',
      narration: 'IPv4 carries a header checksum, and every router recomputes it because the time to live changed. IPv6 has no header checksum at all.',
      detail: 'The link layer already detects corruption on each hop, and TCP and UDP check the ends. The second check in the middle bought little and cost every router work.',
      keyword: 'no header checksum' },

    { id: 'd2', scene: 'dropped', start: 194, end: 202,
      caption: 'IPv4 options live inside the header, so its length varies. IPv6 moves them into extension headers and keeps the base header fixed.',
      narration: 'IPv4 options live inside the header, so its length varies. IPv6 moves them into extension headers, and keeps the base header fixed.',
      detail: 'An extension header is optional, can be any length, and is skipped by routers that do not need it, which is exactly what the options field could not offer.',
      keyword: 'extension headers' },

    { id: 'd3', scene: 'dropped', start: 202, end: 209,
      caption: 'IPv4 routers fragment. In IPv6 only the source fragments, and a router that cannot forward the packet sends ICMPv6 Packet Too Big, type two.',
      narration: 'IPv4 routers fragment. In IPv6 only the source fragments, and a router that cannot forward the packet sends ICMPv6 Packet Too Big, type two.',
      detail: 'Path MTU discovery uses that message to lower the size the source sends. The Fragment header, numbered forty-four, is used by the source and by nothing in between.',
      keyword: 'only the source fragments' },

    { id: 'd4', scene: 'dropped', start: 209, end: 216,
      caption: 'The minimum link MTU is 1280 octets, and time to live became hop limit because the standard no longer requires a packet lifetime.',
      narration: 'The minimum link MTU is 1280 octets, and time to live became hop limit because the standard no longer requires a packet lifetime.',
      detail: 'At a 1500-octet MTU, TCP data gets 1500 minus 40 minus 20, which is 1440. Over IPv4 the same link gives 1460, and that twenty-octet difference is the header.',
      keyword: '1280 octets' },

    /* ---- 8. payload ----------------------------------------------------- */
    { id: 'y1', scene: 'payload', start: 216, end: 224,
      caption: 'Build one packet: forty octets of base header, an eight-octet routing header, then a thousand-octet UDP datagram.',
      narration: 'Build one packet. Forty octets of base header, an eight-octet routing header, then a thousand-octet UDP datagram including its own header.',
      detail: 'The UDP datagram is one object of a thousand octets. Its own eight-octet header sits inside that thousand, which is why nothing is added for it.',
      keyword: 'forty octets of base header' },

    { id: 'y2', scene: 'payload', start: 224, end: 231,
      caption: 'Payload length is eight plus a thousand, so 1008. The base header is not counted and the extension header is.',
      narration: 'Payload length is eight plus a thousand, so one thousand and eight. The base header is not counted, and the extension header is.',
      detail: 'RFC 8200 says the payload is the rest of the packet following the base header, and that extension headers count as part of the payload.',
      keyword: '1008' },

    { id: 'y3', scene: 'payload', start: 231, end: 238,
      caption: 'On the wire the packet is 1048 octets. IPv4 would have written 1048 in total length, so the two fields answer different questions.',
      narration: 'On the wire the packet is one thousand and forty-eight octets. IPv4 would have written one thousand and forty-eight in total length, so the two fields answer different questions.',
      detail: 'Total length counts the header and the data. Payload length counts only what follows the header. Reading one as the other is off by exactly forty.',
      keyword: '1048',
      trap: 'The off-by-forty error is the most common arithmetic slip on this topic. Ask which field the question named before you subtract anything.' },

    { id: 'y4', scene: 'payload', start: 238, end: 246,
      caption: 'Above 65,535 the field is set to zero and the jumbo payload option carries the length. TCP over IPv6 takes its MSS as the MTU minus sixty.',
      narration: 'Above sixty-five thousand five hundred and thirty-five the field is set to zero, and the jumbo payload option carries the length. TCP over IPv6 takes its MSS as the MTU minus sixty.',
      detail: 'Forty for the IPv6 header and twenty for the TCP header, so 1440 at a 1500-octet MTU. The same subtraction the UDP lesson runs for its pseudo-header.',
      keyword: 'minus sixty' },

    /* ---- 9. chain ------------------------------------------------------- */
    { id: 'k1', scene: 'chain', start: 246, end: 253,
      caption: 'Next header names the header that follows this one, not the transport protocol directly.',
      narration: 'Next header names the header that follows this one, not the transport protocol directly. That is the whole design.',
      detail: 'Each header in the chain carries its own next header field, so the chain is walked one hop at a time and ends at the transport header.',
      keyword: 'the header that follows' },

    { id: 'k2', scene: 'chain', start: 253, end: 260,
      caption: 'The base header says zero, so hop-by-hop follows. That says forty-three, so routing follows. That says forty-four, so fragment. That says six, which is TCP.',
      narration: 'The base header says zero, so hop-by-hop follows. That says forty-three, so routing follows. That says forty-four, so fragment. And that says six, which is TCP.',
      detail: 'The chain is read in order and never scanned out of order. RFC 8200 forbids processing a later header before the ones in front of it.',
      keyword: 'zero, forty-three, forty-four, six' },

    { id: 'k3', scene: 'chain', start: 260, end: 267,
      caption: 'The values worth knowing: zero, forty-three, forty-four, fifty and fifty-one, fifty-nine, sixty, six, seventeen and fifty-eight.',
      narration: 'The values worth knowing. Zero for hop-by-hop, forty-three routing, forty-four fragment, fifty and fifty-one for ESP and AH, fifty-nine for nothing at all, sixty for destination options, six for TCP, seventeen for UDP and fifty-eight for ICMPv6.',
      detail: 'Fifty-nine is the one people forget: it says there is no next header, which is how a packet can end at an extension header with no payload.',
      keyword: 'fifty-nine' },

    { id: 'k4', scene: 'chain', start: 267, end: 274,
      caption: 'The order is prescribed: hop-by-hop first, then destination options, routing, fragment, and the security headers. A receiver processes them in that order.',
      narration: 'The order is prescribed. Hop-by-hop first, then destination options, routing, fragment, and the security headers. A receiver processes them in the order they arrive.',
      detail: 'Hop-by-hop must be first because every router on the path has to read it. A destination options header appears twice in the order, once for intermediate nodes and once for the final one.',
      keyword: 'hop-by-hop first' },

    /* ---- 10. EUI-64 ----------------------------------------------------- */
    { id: 'u1', scene: 'eui64', start: 274, end: 282,
      caption: 'A host can build its own interface ID from its hardware address. Start with the forty-eight-bit MAC address.',
      narration: 'A host can build its own interface ID from its hardware address. Start with the forty-eight-bit MAC address.',
      detail: 'Six octets of hardware address, which is the same width as the first half of the interface ID plus two octets. That gap is what the insertion fills.',
      keyword: 'its own interface ID' },

    { id: 'u2', scene: 'eui64', start: 282, end: 290,
      caption: 'Insert FF FE between the third and fourth octets, which turns six octets into eight.',
      narration: 'Insert F F F E between the third and fourth octets, which turns six octets into eight.',
      detail: 'RFC 4291 Appendix A inserts 0xFF and 0xFE. Its own errata note records that the text once said 0xFF twice, and that 0xFF 0xFE is the value to use from a MAC-48.',
      keyword: 'FF FE' },

    { id: 'u3', scene: 'eui64', start: 290, end: 297,
      caption: 'Then flip the universal slash local bit, the zero two bit of the first octet. Zero zero becomes zero two, giving the interface ID.',
      narration: 'Then flip the universal slash local bit, the zero two bit of the first octet. Zero zero becomes zero two, giving the interface ID 021a:2bff:fe3c:4d5e.',
      detail: 'The bit is the seventh bit of the first octet counting from one, which is the 0x02 bit. RFC 4291 requires it inverted, so a locally administered identifier is easy to hand-configure.',
      keyword: 'flip the universal slash local bit',
      trap: 'Flipping the wrong bit is the classic error. It is 0x02 of the first octet, not the low bit, and not a bit of a later octet.' },

    { id: 'u4', scene: 'eui64', start: 297, end: 304,
      caption: 'Prefix it with the link-local prefix and the host has an address before anyone configures anything. Duplicate detection then runs.',
      narration: 'Prefix it with the link-local prefix and the host has an address before anyone configures anything. Duplicate detection then runs.',
      detail: 'Two ICMPv6 neighbour solicitations, type 135, and a neighbour advertisement, type 136. Router solicitation is 133 and router advertisement 134, which is what replaces IPv4 router discovery.',
      keyword: 'link-local prefix' },

    /* ---- 11. the previous-year question --------------------------------- */
    { id: 'q1', scene: 'pyq2018', start: 304, end: 312,
      caption: 'GATE CSE 2018, question thirteen: match four fields to their lengths in bits. The IPv6 field in the list is next header.',
      narration: 'GATE CSE 2018, question thirteen. Match four fields to their lengths in bits. The IPv6 field in the list is next header.',
      detail: 'A matching question. Three of the four fields are IPv4-era knowledge; only the fourth needs anything from this lesson.',
      keyword: 'next header' },

    { id: 'q2', scene: 'pyq2018', start: 312, end: 320,
      caption: 'Sixteen for a UDP port, forty-eight for a MAC address, eight for next header, thirty-two for a TCP sequence number. Option C.',
      narration: 'Sixteen for a UDP port, forty-eight for a MAC address, eight for next header, thirty-two for a TCP sequence number. Option C.',
      detail: 'P to four, Q to one, R to two, S to three. Every option that moves next header away from eight is wrong, and two of the four distractors do exactly that.',
      keyword: 'eight' },

    { id: 'q3', scene: 'pyq2018', start: 320, end: 328,
      caption: 'The trap is the word next header. It is one octet because it carries a protocol number, the same field IPv4 calls protocol.',
      narration: 'The trap is the word next header. It is one octet because it carries a protocol number, the same field IPv4 calls protocol.',
      detail: 'The field beside it, payload length, is sixteen bits. Reading the wrong line of the header diagram is how a remembered eight turns into a confident sixteen.',
      keyword: 'one octet',
      trap: 'Next Header is 8 bits and Payload Length is 16 bits. They sit next to each other in the second word of the header.' },

    { id: 'q4', scene: 'pyq2018', start: 328, end: 336,
      caption: 'One caution: the question about IPv6 not supporting broadcast, tagged GATE CSE 2013 by several indexes, comes from ISRO CSE 2013.',
      narration: 'One caution. The question about IPv6 not supporting broadcast, tagged GATE CSE 2013 by several indexes, comes from ISRO CSE 2013, question fifty-six.',
      detail: 'This page does not count it as a GATE CSE previous-year question. The fact it tests is still true: IPv6 has no broadcast address, and ff02::1 is a multicast group.',
      keyword: 'ISRO CSE 2013',
      trap: 'A question is a GATE previous-year question only if it is in a GATE paper. A coaching index labelling it GATE does not make it one.' }
  ]
};
