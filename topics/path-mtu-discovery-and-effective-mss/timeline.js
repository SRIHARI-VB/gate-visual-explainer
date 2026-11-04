/* ==========================================================================
   path-mtu-discovery-and-effective-mss — THE timeline.
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
      id: 'problem',
      n: 1,
      title: 'The promise is made from the wrong link',
      start: 0, end: 30,
      objective: 'See that the MSS a host advertises comes from its own link MTU, while the datagram it sends must fit the smallest hop on the path, and state the gap in bytes.'
    },
    {
      id: 'min',
      n: 2,
      title: 'The path MTU is the smallest hop',
      start: 30, end: 60,
      objective: 'Define the path MTU as the minimum of the link MTUs along the path, and read the MSS that follows from it over IPv4 and over IPv6.'
    },
    {
      id: 'dfprobe',
      n: 3,
      title: 'Send too big, be told, send smaller',
      start: 60, end: 90,
      objective: 'Walk the classic probe: the DF bit, the router that cannot forward, the ICMP message, and the lowered estimate that ends the search.'
    },
    {
      id: 'nextmtu',
      n: 4,
      title: 'The Next-Hop MTU field',
      start: 90, end: 120,
      objective: 'Read the field that carries the answer, understand that its value counts the IP header, and recognise a zero as an unmodified router.'
    },
    {
      id: 'effective',
      n: 5,
      title: 'The effective size is the smaller of two numbers',
      start: 120, end: 150,
      objective: 'Combine the peer\'s advertised MSS with the path ceiling, and check the resulting datagram against the path in bytes.'
    },
    {
      id: 'plateau',
      n: 6,
      title: 'Without the field, the host has to search',
      start: 150, end: 180,
      objective: 'Use the RFC 1191 plateau table to run an old-style search, and price the underestimate it produces.'
    },
    {
      id: 'rules',
      n: 7,
      title: 'What a host may do with the estimate',
      start: 180, end: 210,
      objective: 'State the five rules on the estimate and the four timers that keep the search from costing more than it saves.'
    },
    {
      id: 'ipv6',
      n: 8,
      title: 'IPv6 has no DF bit and no router fragmentation',
      start: 210, end: 240,
      objective: 'Apply the IPv6 floor of 1280, discard a Packet Too Big below the floor, and compute the data that remains.'
    },
    {
      id: 'blackhole',
      n: 9,
      title: 'When the answer never arrives',
      start: 240, end: 270,
      objective: 'Explain the black-hole connection, the clamping that cures it from the middle, and the probing that cures it from the ends.'
    },
    {
      id: 'consolidate',
      n: 10,
      title: 'The chain, from the path to the segment',
      start: 270, end: 300,
      objective: 'Collect the five steps in order, and name the five slips that cost a mark.'
    }
  ],

  events: [
    /* ---------- scene 1: the promise and the path ---------- */
    {
      id: 'e1a', scene: 'problem', start: 0, end: 7.5,
      caption: 'A host on a 1500-byte link advertises 1460 bytes of data, because its own link can carry that.',
      detail: 'The MSS option is built from the MTU of the link the host is attached to: 1500 minus a 20-byte IPv4 header minus a 20-byte TCP header is 1460. It is a promise about what this host can receive, made before it knows anything about the path to its peer.',
      narration: 'A host on an Ethernet link advertises fourteen sixty. It computes that from its own link: fifteen hundred, less twenty for IP, less twenty for TCP.',
      keyword: 'advertises 1460'
    },
    {
      id: 'e1b', scene: 'problem', start: 7.5, end: 15,
      caption: 'The path it actually uses has a 1400-byte hop, so the path MTU is 1400 and not 1500.',
      detail: 'The first hop is 1500 bytes, but a tunnel hop in the middle carries only 1400. The path MTU is the smallest link MTU on the whole path, so it is 1400, and no promise made from the first hop can change that.',
      narration: 'But the path is not the first hop. There is a tunnel in the middle that carries fourteen hundred. The path MTU is the smallest hop, so it is fourteen hundred.',
      keyword: 'path MTU is 1400'
    },
    {
      id: 'e1c', scene: 'problem', start: 15, end: 22.5,
      caption: '1460 plus 40 bytes of header is 1500, and 1500 minus 1400 is 100 bytes too many.',
      detail: 'A segment carrying the full 1460 bytes of data becomes a 1500-byte datagram once the two fixed headers are added. Against a 1400-byte path MTU that is 100 bytes over, so the datagram cannot pass the tunnel hop in one piece.',
      narration: 'Fourteen sixty of data is fifteen hundred on the wire. The path takes fourteen hundred. So the datagram is one hundred bytes too big.',
      keyword: '100 bytes too many',
      trap: 'A question that gives the local link MTU and the path MTU is asking for two different numbers; the MSS comes from the first, the datagram must fit the second.'
    },
    {
      id: 'e1d', scene: 'problem', start: 22.5, end: 30,
      caption: 'The router cannot fragment a datagram with DF set, so it drops it and sends back the reason.',
      detail: 'With the Don\'t Fragment bit set, a router that meets a datagram larger than the next hop MTU must discard it rather than fragment it, and must return an ICMP Destination Unreachable message with the code that means fragmentation was needed. The drop is what makes the path measurable.',
      narration: 'The router will not fragment it, because the host asked it not to. So it throws it away, and tells the host why. That message is the whole mechanism.',
      keyword: 'drops it'
    },

    /* ---------- scene 2: the minimum ---------- */
    {
      id: 'e2a', scene: 'min', start: 30, end: 37.5,
      caption: 'The path MTU is the smallest link MTU on the way, and the first hop is only a starting guess.',
      detail: 'Every path has one MTU that matters: the minimum over all the links it crosses. The first hop is known locally and is therefore the only value a host can start from, but it is an upper bound and not the answer.',
      narration: 'The path MTU is the smallest link on the way. The first hop is just the only number the host knows at the start.',
      keyword: 'smallest link MTU'
    },
    {
      id: 'e2b', scene: 'min', start: 37.5, end: 45,
      caption: 'One PPPoE hop takes the path to 1492, and the MSS that follows is 1452 over IPv4.',
      detail: 'A PPPoE link carries 1492 bytes, eight fewer than Ethernet, because of the eight-byte PPPoE header. The path MTU becomes 1492 and the MSS over IPv4 becomes 1492 minus 40, which is 1452.',
      narration: 'One PPPoE hop and the path drops to fourteen ninety-two. Subtract forty and the MSS is fourteen fifty-two.',
      keyword: '1492'
    },
    {
      id: 'e2c', scene: 'min', start: 45, end: 52.5,
      caption: 'One tunnel hop takes the path to 1400, and the MSS that follows is 1360 over IPv4.',
      detail: 'A tunnel hop that adds its own encapsulation leaves 1400 bytes for the inner datagram. The MSS over IPv4 becomes 1400 minus 40, which is 1360, and over IPv6 it would be 1340.',
      narration: 'A tunnel hop, and the path is fourteen hundred. Subtract forty: thirteen sixty.',
      keyword: '1360'
    },
    {
      id: 'e2d', scene: 'min', start: 52.5, end: 60,
      caption: 'A narrow IPv6 hop takes the path to 1280: the data left is 1220 over IPv6 and 1240 over IPv4.',
      detail: 'The IPv6 minimum link MTU is 1280 bytes, so a path can legitimately be that small. Over IPv6 the fixed headers are 40 and 20, leaving 1220 bytes of data; over IPv4 they are 20 and 20, leaving 1240. The IPv6 subtraction is the one to use on an IPv6 path.',
      narration: 'A narrow IPv6 hop gives twelve eighty. Over IPv6 the headers are sixty, so twelve twenty of data. Over IPv4 they would be forty, so twelve forty. Use the headers of the version you are actually running.',
      keyword: '1220',
      trap: 'Subtracting 40 on an IPv6 path overstates the data by 20 bytes on every segment.'
    },

    /* ---------- scene 3: the probe ---------- */
    {
      id: 'e3a', scene: 'dfprobe', start: 60, end: 67.5,
      caption: 'The host starts from the first-hop MTU and sets the Don\'t Fragment bit on every datagram.',
      detail: 'Path MTU discovery begins with the only number the host knows: the MTU of the link it is attached to. It then sets the Don\'t Fragment bit, so that any router that cannot forward the datagram has to say so instead of fragmenting it silently.',
      narration: 'Start with the first hop, and set the Don\'t Fragment bit. Now nothing can be fragmented quietly, so every failure comes back as a message.',
      keyword: 'Don\'t Fragment'
    },
    {
      id: 'e3b', scene: 'dfprobe', start: 67.5, end: 75,
      caption: 'The 1400-byte hop cannot forward a 1500-byte datagram and cannot fragment it, so it drops it.',
      detail: 'A router whose next hop carries less than the datagram size has two choices: fragment, or drop and report. The DF bit removes the first choice, so the datagram is discarded at that hop and the host learns the path is narrower than it assumed.',
      narration: 'The fourteen-hundred hop cannot forward fifteen hundred, and cannot fragment it. So it drops it.',
      keyword: 'cannot forward'
    },
    {
      id: 'e3c', scene: 'dfprobe', start: 75, end: 82.5,
      caption: 'The answer is an ICMP type 3 code 4 message carrying the next-hop MTU, 1400.',
      detail: 'The message is an ICMP Destination Unreachable, type 3, with code 4 meaning fragmentation was needed and the Don\'t Fragment bit was set. The router fills in the Next-Hop MTU field with the size it could have forwarded, so the host does not have to guess.',
      narration: 'Back comes a type three, code four: fragmentation needed and DF set. And it carries a number: fourteen hundred.',
      keyword: 'type 3 code 4'
    },
    {
      id: 'e3d', scene: 'dfprobe', start: 82.5, end: 90,
      caption: 'The host lowers its estimate to 1400 and sends again; that datagram is forwarded and delivered.',
      detail: 'The estimate falls to the reported value, the datagram is rebuilt to 1400 bytes, and it crosses the tunnel hop. If a narrower hop lies further along, the same exchange repeats and the estimate falls again. The process ends when the estimate fits.',
      narration: 'The host writes down fourteen hundred and sends again. This one goes through. If there is a narrower hop further on, the same thing happens once more.',
      keyword: 'sends again'
    },

    /* ---------- scene 4: the field ---------- */
    {
      id: 'e4a', scene: 'nextmtu', start: 90, end: 97.5,
      caption: 'Two bytes of the ICMP header that used to be padding now carry the next-hop MTU.',
      detail: 'RFC 1191 redefined the 32-bit "unused" word of the ICMP Destination Unreachable header: the low-order 16 bits carry the next-hop MTU and the high-order 16 bits must stay zero. A router that has not been updated leaves the whole word zero.',
      narration: 'The old message had a word of padding. Half of it now carries the MTU of the hop that refused the datagram.',
      keyword: 'next-hop MTU'
    },
    {
      id: 'e4b', scene: 'nextmtu', start: 97.5, end: 105,
      caption: 'The value is a datagram size: it counts the IP header and not the link headers.',
      detail: 'The specification defines the field as the size in octets of the largest datagram that could be forwarded along the path without fragmentation at that router, including the IP header and IP data and excluding any lower-level headers. It is therefore comparable with the datagram size the host already knows.',
      narration: 'It is a datagram size, not a payload size. It counts the IP header and leaves out the link headers.',
      keyword: 'datagram size'
    },
    {
      id: 'e4c', scene: 'nextmtu', start: 105, end: 112.5,
      caption: 'So 1400 means 1400 including the 20-byte IP header, and the data is 1360.',
      detail: 'Because the field counts the IP header, the data a 1400-byte datagram can hold over IPv4 is 1400 minus 20 minus 20, which is 1360. Reading the field as a data size would overstate the segment by 40 bytes.',
      narration: 'Fourteen hundred including the IP header. Take off twenty for IP and twenty for TCP and you have thirteen sixty of data.',
      keyword: '1360 of data',
      trap: 'Treating the next-hop MTU as a payload size gives a segment 40 bytes too large over IPv4, and 60 too large over IPv6.'
    },
    {
      id: 'e4d', scene: 'nextmtu', start: 112.5, end: 120,
      caption: 'A zero in that field means an unmodified router, and the host must fall back to a search.',
      detail: 'A Datagram Too Big message with a zero in the next-hop MTU field comes from a router that never implemented RFC 1191. The host must still handle it: it can fall back to 576 bytes and stop setting DF, or search a table of plausible MTUs.',
      narration: 'A zero means the router was never upgraded. The host still has to do something, and what it does is search.',
      keyword: 'a zero'
    },

    /* ---------- scene 5: the effective size ---------- */
    {
      id: 'e5a', scene: 'effective', start: 120, end: 127.5,
      caption: 'Four paths, and the data each one leaves once the fixed headers are removed.',
      detail: 'The four rows are the 1500-byte Ethernet path, the 1492-byte PPPoE path, the 1400-byte tunnel path and the 1280-byte IPv6 floor. Each row is the path MTU minus 40 over IPv4 and minus 60 over IPv6, and the last column is that data as a share of the path.',
      narration: 'Four paths, four sizes. Fifteen hundred gives fourteen sixty, fourteen ninety-two gives fourteen fifty-two, fourteen hundred gives thirteen sixty, and twelve eighty gives twelve twenty over IPv6.',
      keyword: 'four paths'
    },
    {
      id: 'e5b', scene: 'effective', start: 127.5, end: 135,
      caption: 'The path sets a ceiling and the peer sets a promise; the sender uses the smaller of the two.',
      detail: 'The peer\'s MSS says what that host will accept; the path MTU says what the network will carry. A segment must satisfy both, so the effective size is the minimum of the two, and neither one replaces the other.',
      narration: 'The path is a ceiling. The peer is a promise. You have to satisfy both, so you take the smaller.',
      keyword: 'smaller of the two'
    },
    {
      id: 'e5c', scene: 'effective', start: 135, end: 142.5,
      caption: 'A peer offering 1300 on the 1400-byte path gives 1300; a peer offering 1460 gives 1360.',
      detail: 'On the 1400-byte path the ceiling is 1360 bytes of data. A peer that advertises 1300 makes 1300 the effective size, because its promise is stricter. A peer that advertises the usual 1460 leaves the path as the binding constraint, so the effective size is 1360.',
      narration: 'If the peer says thirteen hundred, use thirteen hundred. If it says fourteen sixty, the path still wins, and you use thirteen sixty.',
      keyword: '1300'
    },
    {
      id: 'e5d', scene: 'effective', start: 142.5, end: 150,
      caption: '1300 bytes of data is 1340 on the wire and fits; 1460 is 1500 and does not.',
      detail: 'Adding the 40 bytes of fixed headers back shows why the minimum is the safe answer: 1300 becomes 1340, inside the 1400-byte path, while 1460 becomes 1500 and would be dropped at the tunnel hop.',
      narration: 'Thirteen hundred becomes thirteen forty on the wire, and thirteen forty fits. Fourteen sixty becomes fifteen hundred, and fifteen hundred does not.',
      keyword: 'fits'
    },

    /* ---------- scene 6: the plateau search ---------- */
    {
      id: 'e6a', scene: 'plateau', start: 150, end: 157.5,
      caption: 'Without the field, the host has only the size it sent and a table of plausible MTUs.',
      detail: 'An old-style message carries no MTU, but every ICMP Destination Unreachable carries the IP header of the original datagram, and therefore its total length. The host knows the datagram was larger than the true path MTU, and can choose the next estimate from a table of values that real links use.',
      narration: 'Without the number, the host still knows one thing: the size of the datagram that failed. That plus a table of likely MTUs is enough.',
      keyword: 'a table'
    },
    {
      id: 'e6b', scene: 'plateau', start: 157.5, end: 165,
      caption: 'The table has eleven plateaus; 1492 stands for 1536, 1500 and 1492 together.',
      detail: 'RFC 1191 table 7-1 groups similar MTUs and uses the lowest of each group as its plateau, so that an estimate errs low rather than high. The 1492 plateau covers 1536, 1500 and 1492, with a maximum inaccuracy of three per cent; the 508 plateau covers 576, 544, 512 and 508.',
      narration: 'The table groups similar MTUs and keeps the lowest of each group, so the guess is never too high. Fourteen ninety-two stands for everything from fifteen thirty-six down.',
      keyword: '1492 stands for three'
    },
    {
      id: 'e6c', scene: 'plateau', start: 165, end: 172.5,
      caption: 'The greatest plateau below 1500 is 1492, still too big, so a second step is needed.',
      detail: 'The first estimate is the greatest plateau below the returned total length of 1500, which is 1492. That is still larger than the true path MTU of 1400, so it is dropped again and a second message returns a total length of 1492.',
      narration: 'The biggest plateau under fifteen hundred is fourteen ninety-two. But the path is fourteen hundred, so that fails too.',
      keyword: 'still too big'
    },
    {
      id: 'e6d', scene: 'plateau', start: 172.5, end: 180,
      caption: 'Then 1006 fits, and the estimate sits 394 bytes and 28.14 per cent below the truth.',
      detail: 'The greatest plateau below 1492 is 1006, which fits and stops the search. The estimate is now 394 bytes below the true path MTU of 1400, which is 28.14 per cent of the path given up on every datagram, and two round trips spent to get there.',
      narration: 'The next plateau down is ten oh six, and that fits. So the search ends four hundred bytes below the truth, after two wasted round trips.',
      keyword: '394 bytes below',
      trap: 'The plateau search is allowed to underestimate by design; a question that asks for the exact path MTU needs the next-hop field, not the table.'
    },

    /* ---------- scene 7: the rules ---------- */
    {
      id: 'e7a', scene: 'rules', start: 180, end: 187.5,
      caption: 'On a Too Big message the host must reduce the estimate and stop provoking more of them.',
      detail: 'RFC 1191 requires a host to reduce its estimate on receipt of a Datagram Too Big message, and to attempt to avoid eliciting more such messages soon afterwards. Reducing the datagram size is one way; ceasing to set DF is the other, and it costs fragmentation.',
      narration: 'First rule: when the message arrives, go down. And stop making the network send you more of them.',
      keyword: 'go down'
    },
    {
      id: 'e7b', scene: 'rules', start: 187.5, end: 195,
      caption: 'It must never go below 68 octets, and never raise the estimate on a message\'s word.',
      detail: 'The estimate must never be reduced below 68 octets, the size every router must forward. It must also never be increased because a message reports a larger path: such a message may be stale, forged, or an artefact of having several paths to the same destination.',
      narration: 'Second and third rules: never go below sixty-eight, and never go up just because a message says the path got bigger.',
      keyword: 'never below 68'
    },
    {
      id: 'e7c', scene: 'rules', start: 195, end: 202.5,
      caption: 'Raising waits five minutes after a Too Big message and one minute after a raise.',
      detail: 'Detecting an increase means deliberately sending something larger than the current estimate, which may be dropped. So an attempt must not be made less than 5 minutes after a Datagram Too Big message for that destination, nor less than 1 minute after a previous successful attempt.',
      narration: 'Going up costs a dropped datagram, so it is rationed: five minutes after a failure, one minute after a success.',
      keyword: 'five minutes'
    },
    {
      id: 'e7d', scene: 'rules', start: 202.5, end: 210,
      caption: 'The recommended values are ten minutes and two, and a cached estimate ages out at ten.',
      detail: 'The recommendation is twice each minimum, so 10 minutes after a failure and 2 minutes after a success. Separately, a cached estimate that has not been reduced for about 10 minutes is reset to the first-hop MTU, so that a route change to a wider path is eventually noticed.',
      narration: 'The recommended timers are ten minutes and two. And a cached value that has not changed for ten minutes is thrown away, so a wider route is eventually found.',
      keyword: 'ten minutes',
      trap: 'These are minimum intervals between attempts to raise the estimate, not how long the estimate is kept.'
    },

    /* ---------- scene 8: IPv6 ---------- */
    {
      id: 'e8a', scene: 'ipv6', start: 210, end: 217.5,
      caption: 'IPv6 routers never fragment, so an oversized packet is dropped and answered.',
      detail: 'In IPv6 only the source may fragment, and it does so with a Fragment header. A router that meets a packet larger than the next hop MTU must discard it and send an ICMPv6 Packet Too Big message back to the source, so the mechanism that PMTUD relies on is built into the protocol rather than switched on by a bit.',
      narration: 'In IPv6 a router never fragments. It drops the packet and says so, every time, with no bit to set.',
      keyword: 'never fragment'
    },
    {
      id: 'e8b', scene: 'ipv6', start: 217.5, end: 225,
      caption: 'The answer is ICMPv6 type 2, Packet Too Big, and there is no DF bit in IPv6 at all.',
      detail: 'The IPv6 message is ICMPv6 type 2, Packet Too Big, and it carries an MTU field. IPv6 has no Don\'t Fragment bit: the equivalent behaviour is the default, which is why the IPv6 procedure can be written without mentioning DF.',
      narration: 'The message is type two, Packet Too Big, and it carries the MTU. IPv6 has no DF bit, because not fragmenting is already the rule.',
      keyword: 'type 2'
    },
    {
      id: 'e8c', scene: 'ipv6', start: 225, end: 232.5,
      caption: 'Every IPv6 link must carry 1280 bytes, so a report below 1280 is discarded.',
      detail: 'The IPv6 minimum link MTU is 1280 octets and every link must carry it, so a Packet Too Big reporting a value below 1280 is inconsistent with the protocol and must be discarded. The estimate must never be reduced below 1280 in response to one.',
      narration: 'Every IPv6 link has to carry twelve eighty. So a message claiming less than that is wrong, and it is thrown away.',
      keyword: 'discarded',
      trap: 'A Packet Too Big below 1280 is not a smaller path; it is a message to discard. Lowering the estimate to it breaks the protocol.'
    },
    {
      id: 'e8d', scene: 'ipv6', start: 232.5, end: 240,
      caption: 'At the floor the data left is 1220 bytes over IPv6 and 1240 over IPv4.',
      detail: 'A 1280-byte path leaves 1280 minus 60, which is 1220, over IPv6, and 1280 minus 40, which is 1240, over IPv4. A node that does not implement discovery at all must simply never send more than 1280, which is legal and wastes the difference on every packet.',
      narration: 'At the floor, twelve twenty of data over IPv6. A node that does not do discovery at all simply never sends more than twelve eighty.',
      keyword: '1220'
    },

    /* ---------- scene 9: the black hole ---------- */
    {
      id: 'e9a', scene: 'blackhole', start: 240, end: 247.5,
      caption: 'A firewall that drops ICMP errors leaves the sender with no answer at all.',
      detail: 'Many networks filter ICMP for policy reasons, including the error messages PMTUD depends on. The sender then has no way to learn that its datagrams are too large, because the only signal the mechanism uses has been removed.',
      narration: 'Many firewalls drop ICMP. Then the sender never hears that its datagram was too big.',
      keyword: 'no answer'
    },
    {
      id: 'e9b', scene: 'blackhole', start: 247.5, end: 255,
      caption: 'The 60-byte handshake passes and the connection opens; the 1500-byte data does not.',
      detail: 'The three-way handshake uses segments far smaller than the path MTU, so it completes normally. The first full-size data segment is 1500 bytes, exceeds the 1400-byte path, and is discarded at the tunnel hop. The connection is therefore established and unusable, which RFC 8201 calls a black-hole connection.',
      narration: 'The handshake is tiny, so it works. Then the first full-size segment is fifteen hundred, and it disappears.',
      keyword: 'connection opens'
    },
    {
      id: 'e9c', scene: 'blackhole', start: 255, end: 262.5,
      caption: 'The sender retransmits the same oversized segment: an open, silent, black-hole connection.',
      detail: 'Retransmission repeats the same size, so it fails the same way. Nothing in the transport layer changes the packet size on its own, and no message arrives to prompt it, so the connection stalls until it times out while the handshake and any small exchanges continue to work.',
      narration: 'It retransmits the same size and fails the same way. The connection is open, silent, and going nowhere.',
      keyword: 'retransmits'
    },
    {
      id: 'e9d', scene: 'blackhole', start: 262.5, end: 270,
      caption: 'Clamping the MSS to 1360, or probing from 1200 without ICMP, restores the flow.',
      detail: 'Two cures exist. A middlebox can rewrite the advertised MSS down to the path size, 1360 on the 1400-byte path, so the sender never builds an oversized datagram. Or the ends can use packetization-layer discovery, which starts from a base of 1200 bytes, probes upward in 32-byte steps, treats silence as a ceiling, and raises again every 600 seconds.',
      narration: 'Two cures. Clamp the MSS to thirteen sixty somewhere in the middle. Or stop trusting ICMP: probe from twelve hundred, climb, and treat silence as the ceiling.',
      keyword: 'clamping',
      trap: 'Clamping changes what is advertised; it does not change the path. A clamped MSS must not be raised again without evidence.'
    },

    /* ---------- scene 10: consolidation ---------- */
    {
      id: 'e10a', scene: 'consolidate', start: 270, end: 277.5,
      caption: 'First the path MTU: the smallest hop MTU on the path, 1400 in this example.',
      detail: 'The path MTU is the minimum of the link MTUs along the path, discovered from the first hop downwards. In this lesson the tunnel hop sets it to 1400, whatever the first hop carries.',
      narration: 'One: the path MTU, the smallest hop. Fourteen hundred here.',
      keyword: 'path MTU'
    },
    {
      id: 'e10b', scene: 'consolidate', start: 277.5, end: 285,
      caption: 'Then the MSS from the path: 1360 over IPv4, and 1220 at the IPv6 floor of 1280.',
      detail: 'The path MTU minus the fixed headers gives the largest segment that fits: 1400 minus 40 is 1360 over IPv4, and 1280 minus 60 is 1220 at the IPv6 floor. The subtraction never includes the TCP options, which reduce the data instead.',
      narration: 'Two: the MSS from the path. Thirteen sixty over IPv4, twelve twenty at the IPv6 floor.',
      keyword: '1360'
    },
    {
      id: 'e10c', scene: 'consolidate', start: 285, end: 292.5,
      caption: 'Then the smaller of that and the peer\'s promise: 1300 when the peer offers 1300.',
      detail: 'The effective send size is the minimum of the path ceiling and the peer\'s advertised MSS. A peer offering 1300 on the 1400-byte path makes 1300 the answer, because its promise is the stricter of the two.',
      narration: 'Three: the smaller of the path and the peer. If the peer says thirteen hundred, that is the number.',
      keyword: 'the smaller'
    },
    {
      id: 'e10d', scene: 'consolidate', start: 292.5, end: 300,
      caption: 'Then the probe, the floors of 68 and 1280, and the fallback when the answer is lost.',
      detail: 'The probe is DF plus the next-hop MTU field, which converges in one step per decrease. The floors are 68 octets for IPv4 and 1280 for IPv6, and neither may be crossed downwards. When the message never arrives, clamping and packetization-layer probing replace it.',
      narration: 'Four: probe with DF and read the field. Five: respect the floors, sixty-eight and twelve eighty, and have a fallback for when the answer is filtered.',
      keyword: 'the floors',
      trap: 'Five slips: the first hop used as the path, headers counted inside the MSS, an estimate raised on a message, a floor crossed, and ICMP assumed to arrive.'
    }
  ]
};
