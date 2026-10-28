/* ==========================================================================
   ip-fragmentation-cidr-and-nat — THE timeline.
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
      id: 'split',
      n: 1,
      title: 'One 32-bit number, cut in two',
      start: 0, end: 30,
      objective: 'Read a CIDR prefix as a cut position in a 32-bit number, and find the block that contains a given address.'
    },
    {
      id: 'blocks',
      n: 2,
      title: 'The five numbers every block has',
      start: 30, end: 60,
      objective: 'Compute network, first host, last host, broadcast and usable count from an address and a prefix.'
    },
    {
      id: 'lpm',
      n: 3,
      title: 'Longest prefix match, on two real tables',
      start: 60, end: 90,
      objective: 'Turn a routing table into a forwarding decision, and see why the longest match wins rather than the first.'
    },
    {
      id: 'aggregate',
      n: 4,
      title: 'Aggregation: when two blocks become one',
      start: 90, end: 120,
      objective: 'State the exact condition under which two adjacent blocks merge, and check that a merged block steals no address.'
    },
    {
      id: 'rules',
      n: 5,
      title: 'Fragmentation: three fields and one rounding',
      start: 120, end: 150,
      objective: 'Fix the fragment budget, the 8-byte granularity of the offset, and the meaning of MF, offset and identification.'
    },
    {
      id: 'frag1',
      n: 6,
      title: 'GATE 2016 Set 1: 1000 bytes into a 100-byte link',
      start: 150, end: 180,
      objective: 'Fragment one datagram completely, and check the three invariants that make the answer self-verifying.'
    },
    {
      id: 'frag2',
      n: 7,
      title: 'Where the transport header sits: GATE 2025 Set 2',
      start: 180, end: 210,
      objective: 'Count from the transport payload, not from the IP datagram, and size the last fragment including its header.'
    },
    {
      id: 'frag3',
      n: 8,
      title: 'Two links, two MTUs: fragmenting twice',
      start: 210, end: 240,
      objective: 'Fragment an already-fragmented datagram again, keeping every offset relative to the original data.'
    },
    {
      id: 'nat',
      n: 9,
      title: 'NAT: rewriting two addresses, one table',
      start: 240, end: 270,
      objective: 'Follow a packet out and back through a translation table, and name exactly which header fields change.'
    },
    {
      id: 'decide',
      n: 10,
      title: 'The procedure, and the four slips',
      start: 270, end: 300,
      objective: 'Fix a routine that covers every addressing and fragmentation question shape, plus the traps that cost marks.'
    }
  ],

  events: [
    /* ---------------- scene 1: one address, two halves ---------------- */
    {
      id: 'split-1', scene: 'split', start: 0, end: 7.5,
      caption: 'An IPv4 address is 32 bits. A prefix is a cut position in those bits.',
      detail: 'The prefix length p, written after a slash, says how many of the leftmost bits belong to the network. The remaining 32 minus p bits belong to the host. Nothing about the value itself says where the cut is; the prefix is supplied separately.',
      narration: 'An IPv4 address is thirty-two bits, usually written as four numbers. A prefix length, written after a slash, says how many of the leftmost bits name the network. The rest name the host. The address alone does not say where the cut is; the prefix is supplied with it.',
      keyword: 'prefix length',
      trap: 'The prefix is not part of the address. Two hosts can have the same 32 bits and different prefixes, and then they are in different blocks.'
    },
    {
      id: 'split-2', scene: 'split', start: 7.5, end: 15,
      caption: 'With p bits fixed, the block holds 2 to the power 32 minus p addresses.',
      detail: 'The host part has 32 minus p bits, so it can take 2 to the power 32 minus p values. Those values are exactly the addresses of one block, and they are contiguous: the block starts at a multiple of its own size.',
      narration: 'If p bits are fixed, the host part has thirty-two minus p bits, so the block contains two to the power thirty-two minus p addresses. They are consecutive, and the block always starts at a multiple of its own size. That alignment is what makes the arithmetic easy.',
      keyword: 'block size',
      trap: 'The block size is two to the power of the host bits, not the number of usable hosts. Those differ by two.'
    },
    {
      id: 'split-3', scene: 'split', start: 15, end: 22.5,
      caption: 'A /27 has 32 addresses, so the block holding .144 starts at .128.',
      detail: 'The fourth octet 144 is 10010000 in binary. A /27 mask keeps the top three bits of that octet, so the network octet is 10000000, which is 128. The block runs from 128 to 159.',
      narration: 'A slash twenty-seven leaves five host bits, so the block size is thirty-two. The given fourth octet is one four four, which is one zero zero one zero zero zero zero in binary. Keeping the top three bits gives one zero zero zero zero zero zero zero, which is one two eight. So the block runs from one two eight to one five nine.',
      keyword: 'one two eight',
      trap: 'Do not round the octet to the nearest multiple of the block size. Always round down to the start of the block.'
    },
    {
      id: 'split-4', scene: 'split', start: 22.5, end: 30,
      caption: 'Network .128, broadcast .159, so the last assignable host is .158.',
      detail: 'GATE CSE 2015 Set 3 Question 38 asks for exactly this number and the accepted answer is 158. The all-zero host value names the network and the all-one host value is the directed broadcast, so neither can be given to a host.',
      narration: 'The network address is dot one two eight. The broadcast address is dot one five nine, where every host bit is one. So the last address that can be given to a host is dot one five eight. That is GATE twenty fifteen, set three, question thirty-eight, and the accepted answer is one five eight.',
      keyword: 'one five eight',
      trap: 'The question asks for the last address that can be assigned to a host, not the last address in the block. Those differ by one, and the option list usually contains both.'
    },

    /* ---------------- scene 2: the five numbers ---------------- */
    {
      id: 'blocks-1', scene: 'blocks', start: 30, end: 37.5,
      caption: 'Every block has five numbers worth naming, and four of them are arithmetic.',
      detail: 'Network address, first host, last host, broadcast address, and the count of usable hosts. Once the block boundaries are known, all five follow by counting from the two ends.',
      narration: 'Every block has five numbers worth naming: the network address, the first host, the last host, the broadcast address, and how many hosts fit. Once you know where the block starts and ends, all five follow by counting from the ends.',
      keyword: 'five numbers',
      trap: 'A question can ask for any one of the five. Read which one before computing anything.'
    },
    {
      id: 'blocks-2', scene: 'blocks', start: 37.5, end: 45,
      caption: 'The mask is all ones in the prefix. Network equals address AND mask.',
      detail: 'Bitwise AND with a mask that is ones in the prefix and zeros elsewhere keeps the network bits and clears the host bits. That single operation gives the network address for any address and any prefix.',
      narration: 'The mask is a thirty-two bit number that is all ones in the prefix and all zeros after it. Bitwise AND of the address with the mask keeps the network bits and clears the host bits, and what remains is the network address.',
      keyword: 'AND with the mask',
      trap: 'AND with the mask gives the network address, never the last host address. The last host is the block end minus one.'
    },
    {
      id: 'blocks-3', scene: 'blocks', start: 45, end: 52.5,
      caption: 'Usable hosts are 2 to the h minus 2: the all-zero and all-one host values are reserved.',
      detail: 'For a prefix of length p on a 32-bit address, h is 32 minus p. The block contains 2 to the h addresses, of which 2 to the h minus 2 can be assigned. The two excluded values are the network name and the directed broadcast.',
      narration: 'If the host part has h bits, the block contains two to the h addresses, and two to the h minus two of them can be assigned. The two that cannot are the all-zero host value, which names the network, and the all-one host value, which is the broadcast.',
      keyword: 'minus two',
      trap: 'Two exceptions exist: a slash thirty-one point-to-point link, where both addresses are usable by a later standard, and a slash thirty-two, which is a single host. Say which convention you are using.'
    },
    {
      id: 'blocks-4', scene: 'blocks', start: 52.5, end: 60,
      caption: 'GATE 2019 Q28: with a /30 mask, .5 and .6 share a block and .2 does not.',
      detail: 'A /30 has block size 4. The three addresses 100.10.5.2, .5 and .6 fall in blocks starting at .0, .4 and .4. So .5 and .6 are neighbours in one block and .2 is alone in the previous one.',
      narration: 'GATE twenty nineteen question twenty-eight gives three machines with the mask two five five dot two five five dot two five five dot two five two, which is a slash thirty, block size four. The addresses end in two, five and six. Two falls in the block starting at zero, while five and six both fall in the block starting at four. So only those two share a subnet.',
      keyword: 'block size four',
      trap: 'Two addresses that are numerically close are not necessarily in the same block. The block boundary is what decides, not the distance.'
    },

    /* ---------------- scene 3: longest prefix match ---------------- */
    {
      id: 'lpm-1', scene: 'lpm', start: 60, end: 67.5,
      caption: 'A router table is a list of prefixes. An entry is a candidate if the first p bits agree.',
      detail: 'For each entry, AND the destination with the entry mask and compare with the entry network. Agreement on the first p bits is the whole test; nothing about class, order or size enters it.',
      narration: 'A router does not store classes any more; it stores prefixes. For each entry, AND the destination address with that entry mask and compare the result with the entry network. If they agree, the entry is a candidate for this packet.',
      keyword: 'candidate entries',
      trap: 'Comparing the printed network address with the destination without ANDing is the usual slip. Two different networks can both be candidates.'
    },
    {
      id: 'lpm-2', scene: 'lpm', start: 67.5, end: 75,
      caption: 'Several entries can match. The longest one wins, not the first one listed.',
      detail: 'Longest prefix match is the rule that makes a table of overlapping blocks work: a specific route for one small block overrides the general route that also covers it. Order in the table is irrelevant.',
      narration: 'Several entries can match the same packet, and that is normal. The router takes the entry with the longest prefix, because that is the most specific description of where the packet should go. The order in the table does not matter.',
      keyword: 'longest, not first',
      trap: 'A default route is a prefix of length zero, so it matches everything and wins nothing. It is the answer only when no other entry matches.'
    },
    {
      id: 'lpm-3', scene: 'lpm', start: 75, end: 82.5,
      caption: 'GATE 2023 Q55: .118 matches /16, /19 and /24, so interface 3 answers.',
      detail: 'The table holds 200.150.0.0/16, 200.150.64.0/19, 200.150.68.0/24 and 200.150.68.64/27. The destination 200.150.68.118 fits the first three, and the /27 block ends at .95 so it does not fit that one. The /24 is the longest match.',
      narration: 'GATE twenty twenty-three question fifty-five. The destination is two hundred dot one fifty dot sixty-eight dot one eighteen. It matches the slash sixteen, the slash nineteen and the slash twenty-four. The slash twenty-seven block ends at dot ninety-five, so it does not match. Among the three that do, the slash twenty-four is longest, so the packet leaves on interface three.',
      keyword: 'interface three',
      trap: 'A /27 block that contains the address on paper can still be the wrong answer if the block boundary puts the address outside it. Always check the range, not the prefix alone.'
    },
    {
      id: 'lpm-4', scene: 'lpm', start: 82.5, end: 90,
      caption: 'GATE 2024 Set 1: five hosts, twenty packets each, two hosts go via R2, so 40.',
      detail: 'Hosts .16, .72, .132, .191 and .205 are matched against 10.1.1.0/24, .128/25, .64/26 and .192/26. The .132 and .191 addresses take the /25, which is R2, and each contributes twenty packets.',
      narration: 'GATE twenty twenty-four, set one. Five hosts receive twenty packets each, and the table has four prefixes. Host sixteen takes the slash twenty-four. Host seventy-two takes the slash twenty-six. Hosts one thirty-two and one ninety-one take the slash twenty-five, which is R two. Host two hundred five takes the slash twenty-six for R four. Two hosts times twenty packets is forty.',
      keyword: 'forty',
      trap: 'The count asked for is packets, not hosts. Multiply by the per-host count before writing the answer.'
    },

    /* ---------------- scene 4: aggregation ---------------- */
    {
      id: 'aggregate-1', scene: 'aggregate', start: 90, end: 97.5,
      caption: 'Two equal blocks merge exactly when they differ only in the bit just left of the prefix.',
      detail: 'Two blocks of size 2 to the k are adjacent if their network addresses differ by 2 to the k, and they merge into one block of size 2 to the k plus one whose prefix is one bit shorter. The merged block is the pair exactly, with no address added.',
      narration: 'Two blocks of the same size can be written as one larger block exactly when they are neighbours, meaning their start addresses differ by one block size. Then they merge into a block with one more bit of room and a prefix one shorter. The merged block covers the two and nothing else.',
      keyword: 'one bit shorter',
      trap: 'Neighbouring numbers are not enough. They must be aligned as a pair, which is why 164 and 168 with a slash twenty-two prefix cannot merge.'
    },
    {
      id: 'aggregate-2', scene: 'aggregate', start: 97.5, end: 105,
      caption: 'Aggregation must not steal addresses. The merged block covers the union, no more.',
      detail: 'A merge that also covers addresses belonging to somebody else is only safe if those addresses are also reached through the same next hop. Otherwise the table now sends foreign traffic into your network.',
      narration: 'Aggregation is only correct if the merged entry covers exactly the addresses you want, or if the extra addresses also belong behind the same next hop. If the merged block swallows a neighbour network, the router will send that traffic to the wrong place.',
      keyword: 'exactly the union',
      trap: 'A shorter prefix always covers more. Ask what else it covers before accepting it.'
    },
    {
      id: 'aggregate-3', scene: 'aggregate', start: 105, end: 112.5,
      caption: 'GATE 2022 Q45: 164.0/22 already covers 166.0/23, and 168.0/22 covers the other two.',
      detail: 'The four entries are 12.20.164.0/22, 12.20.166.0/23, 12.20.168.0/23 and 12.20.170.0/23. The first block runs from 164 to 167, which contains 166 and 167. The last two are 168 and 170, which are the two halves of 168.0/22.',
      narration: 'GATE twenty twenty-two question forty-five. The four subnets are one six four slash twenty-two, one six six slash twenty-three, one six eight slash twenty-three and one seventy slash twenty-three. The first already contains one six six. The other two are the two halves of one six eight slash twenty-two. So two prefixes, one six four slash twenty-two and one six eight slash twenty-two, cover everything with no extra address.',
      keyword: 'two prefixes',
      trap: 'A single slash twenty or slash twenty-one also covers the four, but it also covers addresses nobody asked for. The question asks what aggregates them correctly, which means exactly.'
    },
    {
      id: 'aggregate-4', scene: 'aggregate', start: 112.5, end: 120,
      caption: '164 and 168 differ in the bit that a /21 would fix, so they stay two entries.',
      detail: 'In binary the third octets are 10100100 and 10101000. A /21 fixes five bits of that octet, and these two disagree on the fifth, so no /21 contains both. The answer is a pair of /22 blocks, which is what the official key gives.',
      narration: 'The third octets are one zero one zero zero one zero zero and one zero one zero one zero zero zero. A slash twenty-one would fix five bits of that octet, and these two disagree on the fifth. So no single slash twenty-one contains both, and the answer stays a pair of slash twenty-two entries.',
      keyword: 'they disagree on bit five',
      trap: 'The community discussion of this question notes that merging 168.0/23 with 170.0/23 assumes the same next hop. That assumption is worth stating whenever you aggregate.'
    },

    /* ---------------- scene 5: fragmentation rules ---------------- */
    {
      id: 'rules-1', scene: 'rules', start: 120, end: 127.5,
      caption: 'MTU is the largest IP datagram a link carries, header included.',
      detail: 'The maximum transmission unit counts the whole IP datagram, so the payload budget on a link is the MTU minus the header length. Ethernet is the familiar case at 1500 bytes, which leaves 1480 bytes of data with a 20-byte header.',
      narration: 'The maximum transmission unit of a link is the largest IP datagram it can carry, and that includes the header. So the data budget is the MTU minus the header length. On Ethernet, fifteen hundred minus twenty leaves fourteen hundred and eighty bytes of data.',
      keyword: 'header included',
      trap: 'MTU counts the header. Subtracting the header twice, or not at all, is the most common arithmetic error in this topic.'
    },
    {
      id: 'rules-2', scene: 'rules', start: 127.5, end: 135,
      caption: 'Every fragment but the last carries a multiple of 8 bytes of data.',
      detail: 'The offset field counts 8-byte units, so a fragment boundary must fall on a multiple of 8 in the original data. The largest usable payload is therefore 8 times the floor of the budget divided by 8. The last fragment may carry any remainder.',
      narration: 'The fragment offset is stored in units of eight bytes, so every fragment except the last must carry a multiple of eight bytes. That is why the usable payload is the budget rounded down to a multiple of eight. Only the last fragment may carry a remainder.',
      keyword: 'round down to eight',
      trap: 'Rounding up, or using the raw budget, gives a fragment whose offset is not a whole number of units. GATE answer ranges reject those values.'
    },
    {
      id: 'rules-3', scene: 'rules', start: 135, end: 142.5,
      caption: 'Each fragment repeats the identification, and sets its own length, offset and MF bit.',
      detail: 'Identification is copied so the destination can group the pieces. Total length counts that fragment only. The offset is the position of its first data byte in the original data, divided by 8. MF is one on every fragment except the last. The header checksum is recomputed for each fragment.',
      narration: 'Each fragment carries its own header. The identification field is copied from the original, so the receiver can group the pieces. The total length counts only this fragment. The offset is the position of this fragment first data byte in the original data, divided by eight. The more fragments bit is one everywhere except the last one. And the header checksum is recomputed for each piece.',
      keyword: 'same identification',
      trap: 'The offset is measured from the start of the original data, not from the start of the previous fragment. That matters when a fragment is fragmented again.'
    },
    {
      id: 'rules-4', scene: 'rules', start: 142.5, end: 150,
      caption: 'Reassembly is at the destination only. A router may fragment again on the next link.',
      detail: 'GATE CSE 2024 Set 2 Question 28 asks exactly this as a statement set: fragmentation may happen at the source or at any router whose outgoing link is too small, and reassembly happens only at the destination. Both of those statements are true; the two alternatives offered are false.',
      narration: 'Fragments are put back together only at the destination. A router does not reassemble, because it may face a smaller link again immediately. So a datagram can be fragmented several times on one path. GATE twenty twenty-four, set two, question twenty-eight asks this as a true or false set, and the true statements are the two just stated.',
      keyword: 'destination only',
      trap: 'A router that reassembled would spend memory and would still have to fragment again downstream. The design avoids both.'
    },

    /* ---------------- scene 6: GATE 2016 ---------------- */
    {
      id: 'frag1-1', scene: 'frag1', start: 150, end: 157.5,
      caption: 'GATE 2016 Set 1: 1000 bytes total, 100-byte MTU, 20-byte header.',
      detail: 'The datagram carries 980 bytes of data. The link budget is 100 minus 20, which is 80, and 80 is already a multiple of 8, so the usable payload is 80 bytes per fragment.',
      narration: 'GATE twenty sixteen, set one. The datagram is one thousand bytes including a twenty byte header, so it carries nine hundred and eighty bytes of data. The link allows one hundred bytes including the header, so the budget is eighty, which is already a multiple of eight.',
      keyword: 'nine hundred eighty',
      trap: 'If the question gives the total size, subtract the header before dividing. If it gives the data size, do not subtract again.'
    },
    {
      id: 'frag1-2', scene: 'frag1', start: 157.5, end: 165,
      caption: 'Twelve fragments carry 80 each, which is 960, and 20 bytes remain.',
      detail: 'Nine hundred and eighty divided by eighty is twelve with a remainder of twenty. The twelve full fragments cover bytes 0 to 959 of the data; the remainder is bytes 960 to 979.',
      narration: 'Nine hundred and eighty divided by eighty is twelve with twenty left over. So twelve full fragments carry eighty bytes each, covering the first nine hundred and sixty bytes, and twenty bytes remain.',
      keyword: 'twelve and twenty left',
      trap: 'A remainder of exactly zero would mean no extra fragment. Here the remainder is not zero, so one more fragment is needed.'
    },
    {
      id: 'frag1-3', scene: 'frag1', start: 165, end: 172.5,
      caption: 'Thirteen fragments. Offsets run 0, 10, 20 and up to 120 in units of 8.',
      detail: 'The offset of the first fragment is zero, and each full fragment advances the offset by 80 divided by 8, which is 10. The thirteenth fragment starts at byte 960, so its offset is 120. Its total length is 20 plus 20, which is 40 bytes.',
      narration: 'So the datagram becomes thirteen fragments. The first has offset zero and the more fragments bit set. Each full fragment advances the offset by ten units, because eighty bytes is ten units of eight. The thirteenth fragment starts at byte nine hundred and sixty, so its offset is one hundred and twenty, and its more fragments bit is zero.',
      keyword: 'thirteen',
      trap: 'The answer to the paper is thirteen. Twelve is the count of full fragments, and it is the most popular wrong answer.'
    },
    {
      id: 'frag1-4', scene: 'frag1', start: 172.5, end: 180,
      caption: 'Three checks confirm any fragment list: sizes, offsets and the flag on the last one.',
      detail: 'The data bytes across all fragments must add to 980. Every non-last fragment must carry a multiple of 8 bytes. The offsets must be the running sums divided by 8. The page recomputes all three on every example rather than trusting the arithmetic once.',
      narration: 'Any fragment list can be checked three ways. The data bytes across the fragments must add up to the original data. Every fragment except the last must carry a multiple of eight bytes. And the offsets must be the running sums divided by eight. This page runs those three checks on every example it shows.',
      keyword: 'three checks',
      trap: 'A wrong answer usually fails one of these three checks. Running them takes less time than re-deriving the list.'
    },

    /* ---------------- scene 7: transport header ---------------- */
    {
      id: 'frag2-1', scene: 'frag2', start: 180, end: 187.5,
      caption: 'GATE 2025 Set 2: 7488 bytes of UDP payload, plus 8 bytes of UDP header.',
      detail: 'The UDP header is part of the IP data, so the datagram carries 7496 bytes of data. The Ethernet frame data field is 1500 bytes, and with no options the IP header is 20 bytes, so the budget is 1480.',
      narration: 'GATE twenty twenty-five, set two. The payload handed to UDP is seven thousand four hundred and eighty-eight bytes. UDP adds eight bytes of header, and that header is inside the IP data, so the datagram carries seven thousand four hundred and ninety-six bytes of data. The Ethernet data field is fifteen hundred, and the IP header is twenty, so the budget is fourteen hundred and eighty.',
      keyword: 'seven thousand four hundred ninety-six',
      trap: 'Counting only the payload and forgetting the UDP header changes the last fragment by eight bytes, which is exactly the distance between two of the options.'
    },
    {
      id: 'frag2-2', scene: 'frag2', start: 187.5, end: 195,
      caption: 'Five full fragments of 1480 leave 96 bytes for a sixth.',
      detail: 'Five times fourteen hundred and eighty is seven thousand four hundred, and seven thousand four hundred and ninety-six minus that is ninety-six. Ninety-six is already a multiple of 8, so it needs no rounding.',
      narration: 'Five fragments of fourteen hundred and eighty carry seven thousand four hundred bytes. What is left is ninety-six bytes, which is a multiple of eight, so it forms a sixth fragment exactly.',
      keyword: 'five and ninety-six',
      trap: 'If the remainder were not a multiple of eight, the last fragment would still be allowed to hold it. Only the non-last fragments must align.'
    },
    {
      id: 'frag2-3', scene: 'frag2', start: 195, end: 202.5,
      caption: 'Six fragments, and the last is 96 plus 20, which is 116 bytes.',
      detail: 'The question asks for the size of the last fragment including the IPv4 header, so 96 bytes of data plus 20 bytes of header is 116. That is option D of the four choices offered.',
      narration: 'So there are six fragments, and the last one carries ninety-six bytes of data plus a twenty byte header, which is one hundred and sixteen bytes. Among the options offered, that is the fourth one.',
      keyword: 'one hundred sixteen',
      trap: 'The option list holds 88, 108 and 116, which are the answers you get by mishandling the UDP header or the IP header. Compute the fields, then match.'
    },
    {
      id: 'frag2-4', scene: 'frag2', start: 202.5, end: 210,
      caption: 'The UDP header travels in the first fragment only, so losing any piece costs the whole segment.',
      detail: 'Ports live in the first four bytes of the transport header, which sit at the start of the first fragment. GATE CSE 2021 Set 1 Question 45 uses exactly this: only the first fragment carries the ports, and a lost later fragment still forces the sender to resend the entire segment, because the sender never learns that fragmentation happened.',
      narration: 'The transport header sits at the start of the data, so it travels in the first fragment only. Ports are in its first four bytes. A later fragment carries no port number at all. And if any fragment is lost, the sender must resend the whole segment, because the sender never learns that a router fragmented the datagram.',
      keyword: 'first fragment only',
      trap: 'A statement saying the destination port can be read from any single fragment is false. Only the first fragment carries it.'
    },

    /* ---------------- scene 8: fragmenting twice ---------------- */
    {
      id: 'frag3-1', scene: 'frag3', start: 210, end: 217.5,
      caption: 'GATE 2024 Set 1: 1420 bytes total, then links of 542 and 360 bytes.',
      detail: 'The datagram carries 1400 bytes of data. On the first link the budget is 542 minus 20, which is 522; rounded down to a multiple of 8 that is 520. So the first hop yields fragments of 520, 520 and 360 bytes of data.',
      narration: 'GATE twenty twenty-four, set one. The datagram is fourteen hundred and twenty bytes including the header, so it carries fourteen hundred bytes of data. The first link allows five hundred and forty-two bytes, leaving five hundred and twenty-two for data, rounded down to five hundred and twenty. So three fragments leave the sender, carrying five hundred and twenty, five hundred and twenty and three hundred and sixty bytes.',
      keyword: '520, 520, 360',
      trap: 'The third fragment carries 360 bytes, which is not a multiple of 8? It is: 360 is 45 units of 8. Check the remainder before assuming a rounding error.'
    },
    {
      id: 'frag3-2', scene: 'frag3', start: 217.5, end: 225,
      caption: 'The second link allows 336 bytes of data, so each fragment is cut again.',
      detail: 'The budget on the second link is 360 minus 20, which is 340; rounded down to a multiple of 8 that is 336. Each of the 520-byte fragments becomes 336 plus 184, and the 360-byte fragment becomes 336 plus 24.',
      narration: 'The second link allows three hundred and sixty bytes, leaving three hundred and forty for data, rounded down to three hundred and thirty-six. Now each incoming fragment is cut again. Each five hundred and twenty byte fragment becomes three hundred and thirty-six plus one hundred and eighty-four, and the three hundred and sixty byte fragment becomes three hundred and thirty-six plus twenty-four.',
      keyword: '336 plus the rest',
      trap: 'A fragment that already had the more fragments bit set keeps it on its own non-final pieces. Only the true last piece of the datagram clears it.'
    },
    {
      id: 'frag3-3', scene: 'frag3', start: 225, end: 232.5,
      caption: 'Six fragments reach the receiver, and their data still adds to 1400.',
      detail: 'Two pieces from each of the first two fragments and two from the third make six. The data carried is 336 plus 184, twice, and 336 plus 24, which adds to fourteen hundred bytes. That total is the check that no byte was lost or duplicated.',
      narration: 'So six fragments reach the receiver. Their data adds to fourteen hundred bytes, which is exactly the original data, so nothing was lost or sent twice. That conservation check is the fastest way to test your own answer.',
      keyword: 'six',
      trap: 'The answer to the paper is six, not three. Three is the count after the first hop, and the question asks what reaches the receiver.'
    },
    {
      id: 'frag3-4', scene: 'frag3', start: 232.5, end: 240,
      caption: 'Offsets stay relative to the original data, so the second cut continues from where it was.',
      detail: 'The pieces of the second fragment carry offsets 65 and 88 units, not 0 and 23. Offsets are absolute positions in the original data, which is why a receiver can reassemble pieces from different hops without knowing the path.',
      narration: 'The offsets of every fragment are positions in the original data, not positions inside the fragment that was cut. So the pieces of the second fragment continue from offset sixty-five units, they do not restart at zero. That is what lets the receiver reassemble without knowing how many times the datagram was cut.',
      keyword: 'absolute offsets',
      trap: 'Restarting the offset at zero for each re-fragmentation produces a list the receiver cannot reassemble, and the arithmetic still looks plausible.'
    },

    /* ---------------- scene 9: NAT ---------------- */
    {
      id: 'nat-1', scene: 'nat', start: 240, end: 247.5,
      caption: 'NAT rewrites the source address on the way out, using a table it keeps.',
      detail: 'A private address is not routable on the public Internet, so the border device replaces the source address with one of its own public addresses and records the mapping. Nothing about the destination changes on the way out.',
      narration: 'A private address cannot travel across the public Internet, so the border device replaces the source address with one of its own public addresses and writes the mapping into a table. The destination address is not touched on the way out.',
      keyword: 'rewrite the source',
      trap: 'NAT is not a router feature that changes routing. It changes addresses, and the routing decision is made on the translated packet.'
    },
    {
      id: 'nat-2', scene: 'nat', start: 247.5, end: 255,
      caption: 'With one public address, the port is what tells two private hosts apart.',
      detail: 'Port address translation also rewrites the source port, so several private hosts can share one public address. The table key becomes the pair of public address and public port, and that pair must be unique.',
      narration: 'If one public address must serve many private hosts, the device also rewrites the source port. Then two hosts are distinguished by the pair of public address and public port, and that pair must be unique. This is what a home router does.',
      keyword: 'the port disambiguates',
      trap: 'Without the port rewrite, two hosts using the same source port would collide and replies would go to the wrong machine.'
    },
    {
      id: 'nat-3', scene: 'nat', start: 255, end: 262.5,
      caption: 'GATE 2024 Set 1 Q21: source IP and header checksum change; destination and length do not.',
      detail: 'The header checksum covers the header, so changing the source address invalidates it and forces a recomputation. Total length counts header plus data and neither changed, so it stays. The destination address is what the packet is trying to reach, so it stays.',
      narration: 'GATE twenty twenty-four, set one, question twenty-one asks which header fields a NAT device modifies. The source address changes, and because the checksum covers the header, the checksum is recomputed. The destination address does not change, and the total length does not change because no bytes were added or removed. So the answer is the source address and the header checksum.',
      keyword: 'source IP and checksum',
      trap: 'A transport checksum that covers the pseudo-header also becomes wrong. That is a different checksum from the IP header one, and both need care.'
    },
    {
      id: 'nat-4', scene: 'nat', start: 262.5, end: 270,
      caption: 'The reply is matched on public address and port. No entry, no delivery.',
      detail: 'A returning packet is addressed to the public address and port, so the table is searched on that pair, and both fields are rewritten back to the private host. A packet that matches no entry is dropped, which is why an unsolicited connection from outside cannot reach an internal host.',
      narration: 'The reply comes back addressed to the public address and the public port. The device looks that pair up in the table, rewrites the destination address and port back to the private host, and forwards it inside. A packet that matches no entry is dropped, which is why a connection started from outside cannot get in.',
      keyword: 'matched on the pair',
      trap: 'NAT gives address conservation and a crude barrier, not security. Do not claim it authenticates or encrypts anything.'
    },

    /* ---------------- scene 10: the procedure ---------------- */
    {
      id: 'decide-1', scene: 'decide', start: 270, end: 277.5,
      caption: 'For any addressing question: find the block, then name which of the five numbers is wanted.',
      detail: 'Step one is the prefix to block size. Step two is the block start, by rounding the address down. Step three is the five numbers. Step four is to check which one the question asked for, and step five is to sanity check that it lies inside the block.',
      narration: 'For an addressing question, first turn the prefix into a block size. Second, round the address down to the block start. Third, list the five numbers. Fourth, read again which one is wanted. Fifth, check that your answer lies inside the block you computed.',
      keyword: 'five steps',
      trap: 'Most lost marks here come from answering a neighbouring number: the broadcast instead of the last host, or the total count instead of the usable count.'
    },
    {
      id: 'decide-2', scene: 'decide', start: 277.5, end: 285,
      caption: 'For any fragmentation question: budget, floor to eight, then count.',
      detail: 'Budget is MTU minus header. The usable payload is the budget rounded down to a multiple of 8. The count is the ceiling of data divided by that payload. Then write the offsets as running sums divided by 8, and clear MF only on the last.',
      narration: 'For a fragmentation question, three quantities in order. Budget equals MTU minus header. Usable payload is the budget rounded down to a multiple of eight. Count is data divided by usable payload, rounded up. Then the offsets are the running sums divided by eight, and only the last fragment clears the more fragments bit.',
      keyword: 'budget, floor, count',
      trap: 'Write the units next to every number. Offsets are in units of eight bytes, lengths in bytes, and mixing them is the quiet error.'
    },
    {
      id: 'decide-3', scene: 'decide', start: 285, end: 292.5,
      caption: 'Four slips account for most wrong answers in this clause.',
      detail: 'Total addresses against usable hosts. Block size against mask value. Offset in bytes against offset in units of 8. Longest match against first match. Each one is checked on this page against a definition rather than a memory.',
      narration: 'Four slips account for most wrong answers here. Confusing the number of addresses with the number of usable hosts. Confusing the block size with the mask value. Writing the offset in bytes instead of units of eight. And taking the first matching route instead of the longest. Each one is checked on this page against its definition.',
      keyword: 'four slips',
      trap: 'In a multiple-select question, each of these slips usually appears as one of the options. That is why the options look familiar.'
    },
    {
      id: 'decide-4', scene: 'decide', start: 292.5, end: 300,
      caption: 'This clause connects backwards to routing and forwards to TCP.',
      detail: 'Longest prefix match is what a routing table is for, which is why the distance vector and link state lesson supplies the table this lesson reads. Fragment loss is what makes the transport layer retransmit whole segments, which is the next lesson in this section.',
      narration: 'This clause connects both ways. The routing lesson builds the table that longest prefix match reads. And the transport lesson explains what a lost fragment costs, which is a whole segment retransmitted. Learn this one with those two and the section becomes one idea seen three times.',
      keyword: 'one idea, three places',
      trap: 'Do not treat addressing as isolated arithmetic. Every number here is used by a routing or transport question elsewhere in the paper.'
    }
  ]
};
