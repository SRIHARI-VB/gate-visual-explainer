/* ==========================================================================
   vlsm-subnet-design-longest-prefix-and-aggregation — THE timeline.
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
      id: 'block',
      n: 1,
      title: 'An address is 32 bits, a prefix is a length',
      start: 0, end: 30,
      objective: 'Read an address as 32 bits, a prefix as the number of bits fixed from the left, and a block as a power-of-two run of addresses that starts at a multiple of its own size.'
    },
    {
      id: 'split',
      n: 2,
      title: 'Halving: equal subnets, and what they cost',
      start: 30, end: 60,
      objective: 'See a split as one more prefix bit, so that 2^k equal subnets have prefix p+k, and see why equal sizes waste when the needs are unequal.'
    },
    {
      id: 'hosts',
      n: 3,
      title: 'What a block holds: 2^h − 2 and its exceptions',
      start: 60, end: 90,
      objective: 'Compute usable host addresses from the host-bit count, and know the two prefixes where the formula does not apply: /31 under RFC 3021 and /32.'
    },
    {
      id: 'design',
      n: 4,
      title: 'The design: largest first, each block aligned',
      start: 90, end: 120,
      objective: 'Convert each host requirement to the smallest block that holds it, then allocate from the largest down, and check that every block is aligned and disjoint.'
    },
    {
      id: 'leftover',
      n: 5,
      title: 'What is left is five blocks, not one number',
      start: 120, end: 150,
      objective: 'Decompose the free space into maximal aligned blocks, and decide whether a new requirement fits by comparing sizes rather than by comparing counts.'
    },
    {
      id: 'trap',
      n: 6,
      title: 'The sum of hosts is the wrong test',
      start: 150, end: 180,
      objective: 'Show a design whose host counts fit in the usable addresses and whose block sizes do not, and say what the two numbers measure.'
    },
    {
      id: 'lpm',
      n: 7,
      title: 'Longest prefix match',
      start: 180, end: 210,
      objective: 'Resolve a destination that matches several prefixes to the one with the largest prefix length, and show that row order in the table changes nothing.'
    },
    {
      id: 'trie',
      n: 8,
      title: 'The lookup is a walk down the bits',
      start: 210, end: 240,
      objective: 'Read the same lookup as a binary-trie walk: one step per bit, remembering the deepest stored prefix on the path.'
    },
    {
      id: 'aggregate',
      n: 9,
      title: 'Aggregation: siblings only, and the hole',
      start: 240, end: 270,
      objective: 'Merge sibling blocks into one shorter prefix, refuse to merge non-siblings, and keep a more specific route where part of an aggregate belongs elsewhere.'
    },
    {
      id: 'procedure',
      n: 10,
      title: 'Five steps, two traps, one sentence',
      start: 270, end: 300,
      objective: 'Consolidate the procedure and the computed numbers, and name the two mistakes that decide most marks in this topic.'
    }
  ],

  events: [

    /* ---------------- scene 1: block ---------------- */
    {
      id: 'b-1', scene: 'block', start: 0, end: 7.5,
      caption: 'An IPv4 address is 32 bits. 100.64.0.0 is 01100100 01000000 00000000 00000000.',
      detail: 'Every octet is eight bits written in decimal, so the four numbers 100, 64, 0 and 0 are the same address as the 32-bit string. A prefix length counts bits from the left, which is the only end that matters: /22 fixes the first 22 of the 32.',
      narration: 'Start with the object itself. An IPv4 address is thirty-two bits. The four numbers are just the bits written in groups of eight. A prefix length counts how many of those bits, from the left, are fixed.',
      keyword: '32 bits',
      trap: 'A prefix counts bits from the left, not from the right. /22 and "the last 22 bits" are different things.'
    },
    {
      id: 'b-2', scene: 'block', start: 7.5, end: 15,
      caption: 'A /22 fixes 22 bits and leaves 10 free, so the block holds 2^10 = 1024 addresses.',
      detail: 'The free bits are the host bits. With ten of them every combination is available, so the block is 1024 addresses long, from 100.64.0.0 to 100.64.3.255. The size follows from the prefix alone: 2^(32-p).',
      narration: 'Twenty-two fixed bits leave ten free bits, and ten free bits give two to the ten, which is one thousand and twenty-four addresses. The size of a block is decided by its prefix length and by nothing else.',
      keyword: '2^(32-p)',
      trap: 'The block size is a power of two. There is no CIDR block of 100 addresses or of 1000 addresses.'
    },
    {
      id: 'b-3', scene: 'block', start: 15, end: 22.5,
      caption: 'A block must start at a multiple of its own size: 1024 divides 100.64.0.0, so the block is legal.',
      detail: 'Alignment is the rule that separates a block from a range. The start address, read as one 32-bit number, must be divisible by the block size. 100.64.0.0 is divisible by 1024, and 100.64.0.0 + 1024 is 100.64.4.0, so the block covers exactly the four /24s from .0.0 to .3.255.',
      narration: 'A block does not float. Its first address must be a multiple of its own size. One thousand and twenty-four divides one hundred point sixty-four point zero point zero, so this block is legal and it ends at one hundred point sixty-four point three point two five five.',
      keyword: 'alignment',
      trap: 'A range is not a block. 100.64.0.5 to 100.64.3.255 is a range and cannot be written with one prefix.'
    },
    {
      id: 'b-4', scene: 'block', start: 22.5, end: 30,
      caption: '100.64.0.48/26 is not a block: 64 does not divide 48, so it means 100.64.0.0/26.',
      detail: 'Writing an address with a prefix is shorthand for the block that contains it. The canonical form clears the host bits: 48 is 00110000, and clearing the low six bits gives 0. Two answers are possible — the address as written, or the block it names — and a question that asks for the network address wants the second.',
      narration: 'Here is the same rule used backwards. Forty-eight over twenty-six is not a block, because sixty-four does not divide forty-eight. The notation names the block that contains it, and that block begins at one hundred point sixty-four point zero point zero.',
      keyword: 'canonical form',
      trap: 'When a question gives an address and a prefix, the network address is the address with its host bits cleared. Do not report the address you were given.'
    },

    /* ---------------- scene 2: split ---------------- */
    {
      id: 's-1', scene: 'split', start: 30, end: 37.5,
      caption: 'Halve a /22 and you get two /23s. Halve each again and you get four /24s.',
      detail: 'Splitting a block in half means fixing one more bit: the first half takes 0 in that position and the second half takes 1. Two halves of 1024 addresses are two blocks of 512, and their prefixes are 23.',
      narration: 'To split a block, fix one more bit. The first half gets a zero, the second half gets a one. One block of one thousand and twenty-four becomes two blocks of five hundred and twelve.',
      keyword: 'one more bit',
      trap: 'Splitting does not create addresses. The two halves together are the same 1024 addresses the parent held.'
    },
    {
      id: 's-2', scene: 'split', start: 37.5, end: 45,
      caption: 'Splitting into 2^k equal subnets gives prefix p+k, each holding 2^(32-p-k) addresses.',
      detail: 'Each split costs one bit from the host field and doubles the number of blocks. So k splits give 2^k blocks, prefix p+k, and size 2^(32-p-k). A /22 split twice gives four /24s; split three times it would give eight /25s.',
      narration: 'In general, splitting into two to the k equal pieces adds k to the prefix. Four equal subnets of a slash twenty-two are slash twenty-fours, and each holds two hundred and fifty-six addresses.',
      keyword: 'p + k',
      trap: 'The exponent is 32 minus the new prefix, not 32 minus the old one. Splitting changes both the prefix and the size.'
    },
    {
      id: 's-3', scene: 'split', start: 45, end: 52.5,
      caption: 'Equal subnets are easy to write and wasteful when the needs differ: 400 hosts and 2 hosts would both get 512.',
      detail: 'Equal-length subnetting, sometimes called fixed-length subnet masking, gives every subnet the same prefix. It is simple to document and it ignores the requirement: a LAN with 400 hosts needs 510 usable addresses and a point-to-point link with 2 hosts needs 2, yet both are handed a /23.',
      narration: 'Equal subnets are simple and wasteful. A local network with four hundred hosts needs five hundred and ten usable addresses. A link between two routers needs two. Fixed-length subnetting gives both the same five hundred and twelve.',
      keyword: 'fixed length',
      trap: 'A /23 gives 510 usable addresses, not 512. The two reserved addresses are already gone.'
    },
    {
      id: 's-4', scene: 'split', start: 52.5, end: 60,
      caption: 'A /22 holds only four /24s, so an equal split spends a quarter of the block on a link that needs two addresses.',
      detail: 'The cost is visible as a fraction of the parent. Four /24s in a /22: if one of them is a point-to-point link, 256 addresses are reserved for two endpoints, which is 25 percent of the block. Unequal prefixes are what recover that space.',
      narration: 'The cost is not cosmetic. In a slash twenty-two there are four slash twenty-fours. If one of them is a two-host link, a quarter of the whole block is held for two addresses.',
      keyword: 'a quarter of the block',
      trap: 'Do not answer a "how many subnets" question with the number of subnets you would like. The prefix fixes the number.'
    },

    /* ---------------- scene 3: hosts ---------------- */
    {
      id: 'h-1', scene: 'hosts', start: 60, end: 67.5,
      caption: 'A block with h host bits holds 2^h addresses, and two of them are reserved: 2^h − 2 for hosts.',
      detail: 'The all-zeros host field names the network itself and the all-ones field is the directed broadcast, so neither is assigned to an interface. On a broadcast medium that is the whole rule; on a point-to-point link RFC 3021 changes it.',
      narration: 'A block with h host bits holds two to the h addresses. Two are reserved: the all-zeros address names the network, and the all-ones address is the broadcast. What is left for hosts is two to the h minus two.',
      keyword: '2^h − 2',
      trap: 'The reserved two exist per block, not per parent. Ten /28s lose twenty addresses, not two.'
    },
    {
      id: 'h-2', scene: 'hosts', start: 67.5, end: 75,
      caption: '/24 gives 254, /25 gives 126, /26 gives 62, /27 gives 30, /28 gives 14, /29 gives 6, /30 gives 2.',
      detail: 'These are the numbers a design question expects. Each step halves the block, so each step roughly halves the usable count: 254, 126, 62, 30, 14, 6, 2. Reading the table right to left is the fastest way to convert a requirement into a prefix.',
      narration: 'These seven numbers are worth knowing. Two hundred and fifty-four, one hundred and twenty-six, sixty-two, thirty, fourteen, six, two. Each step halves the block and roughly halves what is usable.',
      keyword: '254, 126, 62, 30, 14, 6, 2',
      trap: 'The sequence is not exactly halving: 30 to 14 is not 15. The reserved two are subtracted after the halving, not before.'
    },
    {
      id: 'h-3', scene: 'hosts', start: 75, end: 82.5,
      caption: '/31 is the exception: RFC 3021 gives both addresses to the two ends of a point-to-point link, so a /31 holds 2 hosts.',
      detail: 'RFC 3021, "Using 31-Bit Prefixes on IPv4 Point-to-Point Links", December 2000, states that in a point-to-point link with a 31-bit mask the two addresses MUST be interpreted as host addresses, and that the limited broadcast is used instead of a directed broadcast. The formula 2^h − 2 gives 0 there and would wrongly call the block unusable.',
      narration: 'One exception, and it is examinable. RFC three zero two one says a slash thirty-one on a point-to-point link uses both addresses as hosts, because there is nobody to broadcast to. The formula gives zero there, and the formula is wrong.',
      keyword: 'RFC 3021',
      trap: 'Do not apply 2^h − 2 to a /31 and answer "zero usable". The formula assumes a broadcast medium.'
    },
    {
      id: 'h-4', scene: 'hosts', start: 82.5, end: 90,
      caption: '/32 is a single host route, where 2^h − 2 is negative, so the formula is read with its assumptions attached.',
      detail: 'A /32 names one address: a host route, used for a loopback or a router\'s own address. There are no host bits, so the subtraction has nothing to take. The lesson: a formula is a statement about a case, and the case is part of the formula.',
      narration: 'The last case is the slash thirty-two. It is one address, a host route, and the subtraction would go negative. So keep the assumptions with the formula: two reserved addresses, on a broadcast medium, with at least two host bits.',
      keyword: 'assumptions travel with the formula',
      trap: 'A /32 has no network and no broadcast address. It is a single host.'
    },

    /* ---------------- scene 4: design ---------------- */
    {
      id: 'd-1', scene: 'design', start: 90, end: 97.5,
      caption: 'Requirements: 400, 200, 100, 50 and 2 hosts inside 100.64.0.0/22. Convert each need to a prefix.',
      detail: 'The first step of any VLSM question is a conversion, not an allocation. For each requirement find the smallest block whose usable count covers it: 400 needs 510, so a /23; 200 needs 254, so a /24; 100 needs 126, so a /25; 50 needs 62, so a /26; 2 needs 2, so a /31.',
      narration: 'Here is a design problem with real numbers. One thousand and twenty-four addresses, and five local networks that need four hundred, two hundred, one hundred, fifty and two hosts. First, convert each need into a prefix.',
      keyword: 'convert first',
      trap: 'Do not start by drawing blocks. The requirement becomes a prefix before any address is chosen.'
    },
    {
      id: 'd-2', scene: 'design', start: 97.5, end: 105,
      caption: '400 hosts needs 510 usable, so /23; 200 needs /24; 100 needs /25; 50 needs /26; 2 needs /31.',
      detail: 'Each answer is the smallest block that holds the need, and each is one step smaller than the obvious guess: 400 hosts do not fit a /24 (254 usable), and 200 hosts do not fit a /25 (126). The page computes these five prefixes from the requirement list rather than reading them from a table.',
      narration: 'Four hundred hosts do not fit a slash twenty-four, so the block is a slash twenty-three. Two hundred needs a slash twenty-four. One hundred a slash twenty-five. Fifty a slash twenty-six. Two need a slash thirty-one.',
      keyword: 'smallest block that holds the need',
      trap: 'Choosing a bigger block than needed is not "safe". It takes addresses from a neighbour that may not fit afterwards.'
    },
    {
      id: 'd-3', scene: 'design', start: 105, end: 112.5,
      caption: 'Allocate largest first: 100.64.0.0/23, 100.64.2.0/24, 100.64.3.0/25, 100.64.3.128/26, 100.64.3.192/31.',
      detail: 'Each block goes at the lowest address that is aligned for its size and still free. The /23 takes 0.0 to 1.255, the /24 takes 2.0 to 2.255, the /25 takes 3.0 to 3.127, the /26 takes 3.128 to 3.191 and the /31 takes 3.192 and 3.193.',
      narration: 'Now allocate, and allocate from the largest. The slash twenty-three takes the first five hundred and twelve addresses. The slash twenty-four takes the next two hundred and fifty-six. Then the slash twenty-five, the slash twenty-six, and the slash thirty-one on the end.',
      keyword: 'largest first',
      trap: 'A block placed at an unaligned address is not a block. Check the divisibility before you write the answer.'
    },
    {
      id: 'd-4', scene: 'design', start: 112.5, end: 120,
      caption: 'The five blocks use 962 of the 1024 addresses. Largest first works because only an untouched region holds a big aligned hole.',
      detail: 'Largest first is the safe order because a large block needs a large aligned hole, and holes only shrink. Allocating a /31 first at the bottom of the block leaves the free space broken into pieces of size 2, 4, 8, 16, 32, 64, 128 and 256, and a later /23 then has fewer places to go.',
      narration: 'The five blocks use nine hundred and sixty-two of the one thousand and twenty-four addresses. Largest first is the safe order, because a big block needs a big aligned hole and holes only get smaller as you fill them.',
      keyword: '962 of 1024',
      trap: 'This is a procedure, not a theorem about all orders. The model checks this design; it does not prove that every other order fails.'
    },

    /* ---------------- scene 5: leftover ---------------- */
    {
      id: 'l-1', scene: 'leftover', start: 120, end: 127.5,
      caption: '62 addresses remain, 100.64.3.194 to 100.64.3.255, and they are not one block: 194 is not divisible by 64.',
      detail: 'The leftover is a set, not a length. Its first address decides how it can be written: 194 is divisible by 2 but not by 4, so the largest block that can start there is a /31.',
      narration: 'Sixty-two addresses are left, from one hundred point sixty-four point three point one nine four to point two five five. They are not one block, because one nine four is not a multiple of sixty-four.',
      keyword: 'a set, not a length',
      trap: '"62 addresses free" is not an answer to "can a /26 fit". The size of the largest free block is the answer.'
    },
    {
      id: 'l-2', scene: 'leftover', start: 127.5, end: 135,
      caption: 'They decompose into five aligned blocks: 3.194/31, 3.196/30, 3.200/29, 3.208/28 and 3.224/27.',
      detail: 'Take the largest block that fits at the current address, then move past it and repeat. Two, four, eight, sixteen and thirty-two addresses: the five blocks sum to 62 and each starts at a multiple of its own size.',
      narration: 'Written as blocks, the leftover is five: a slash thirty-one, a slash thirty, a slash twenty-nine, a slash twenty-eight and a slash twenty-seven. Two, four, eight, sixteen and thirty-two addresses, which add to sixty-two.',
      keyword: 'five blocks',
      trap: 'Decomposition is unique. If your list of free blocks is different, one of them is not maximal.'
    },
    {
      id: 'l-3', scene: 'leftover', start: 135, end: 142.5,
      caption: 'The largest free block is 32 addresses, so 30 usable. A new LAN needing 40 hosts wants a /26 and does not fit.',
      detail: 'A /26 is 64 addresses. No free block is that large, so no /26 can be placed even though 62 addresses are unused. The design is not "62 addresses short"; it is short by one aligned hole of the right size.',
      narration: 'The largest free block is thirty-two addresses, which is thirty usable. A new local network needing forty hosts wants a slash twenty-six, and a slash twenty-six does not fit, although sixty-two addresses are free.',
      keyword: '30 usable, 40 needed',
      trap: 'Adding up free addresses and comparing to the requirement is the mistake this scene exists to remove.'
    },
    {
      id: 'l-4', scene: 'leftover', start: 142.5, end: 150,
      caption: 'Free space is a set of blocks, not a number. A count answers "how many"; the design question is "of what size".',
      detail: 'The same 62 addresses could be one /26, a /27 and a /28 and a /30 and a /31 — but they are not. What the network can grow into is decided by the shape of the free space, which is why a VLSM plan is drawn as blocks and not as a running total.',
      narration: 'So free space is a set of blocks, not a number. A count tells you how many addresses are unused. The design question is always whether a block of the size you need exists at an aligned address.',
      keyword: 'shape, not total',
      trap: 'Two plans can leave the same total free and support different growth. The total does not distinguish them.'
    },

    /* ---------------- scene 6: trap ---------------- */
    {
      id: 't-1', scene: 'trap', start: 150, end: 157.5,
      caption: 'A /24 has 254 usable addresses. Needs of 100, 60, 60 and 30 hosts add to 250, which looks like it fits.',
      detail: 'The host arithmetic is right: 250 is less than 254, with four addresses to spare. Every number in the sum is a number of hosts, and hosts are what the requirement is stated in.',
      narration: 'Now the trap that costs marks. A slash twenty-four has two hundred and fifty-four usable addresses. Four networks need one hundred, sixty, sixty and thirty hosts, which adds to two hundred and fifty. It looks as if it fits.',
      keyword: '250 ≤ 254',
      trap: 'The comparison is between host counts, and host counts are not what you allocate.'
    },
    {
      id: 't-2', scene: 'trap', start: 157.5, end: 165,
      caption: 'The blocks those needs require are /25, /26, /26 and /27: 128 + 64 + 64 + 32 = 288 addresses.',
      detail: 'Each requirement rounds up to a power of two: 100 hosts needs a /25 of 128 addresses, 60 needs a /26 of 64, 30 needs a /27 of 32. Those are address counts, and address counts are what the parent block is measured in.',
      narration: 'But you do not allocate hosts, you allocate blocks. One hundred hosts need a block of one hundred and twenty-eight addresses. Sixty need sixty-four each. Thirty need thirty-two. That is two hundred and eighty-eight addresses.',
      keyword: '128 + 64 + 64 + 32',
      trap: 'Each block also carries the two reserved addresses, so a need of 62 hosts takes 64 addresses, not 62.'
    },
    {
      id: 't-3', scene: 'trap', start: 165, end: 172.5,
      caption: '288 > 256, so the design fails, even though the host total is four under the usable count.',
      detail: 'The parent is 256 addresses. Four blocks of 128, 64, 64 and 32 cannot be packed into it, whatever order they are placed in: the total already exceeds the parent. The host sum hid a 32-address gap.',
      narration: 'Two hundred and eighty-eight is more than two hundred and fifty-six, so the design does not fit, even though the host total was four under the usable count. The gap is thirty-two addresses, and the host sum never shows it.',
      keyword: '288 > 256',
      trap: 'This is a failure by capacity, not by fragmentation. No order of allocation rescues it.'
    },
    {
      id: 't-4', scene: 'trap', start: 172.5, end: 180,
      caption: 'Add block sizes, not host counts. The gap is two reserved addresses per block plus rounding up to a power of two.',
      detail: 'Two effects widen a requirement: the two reserved addresses in each block, and the rounding of the total up to the next power of two. A need of 30 hosts takes 32 addresses for those two reasons together, and a plan of ten subnets can be short by 20 addresses before any fragmentation.',
      narration: 'So add block sizes and never host counts. The difference is the two reserved addresses in every block, plus the rounding up to a power of two. That is why a plan that looks comfortable is often short.',
      keyword: 'blocks, not hosts',
      trap: 'A question may give the parent size in usable addresses and the needs in hosts. Convert one of them before comparing.'
    },

    /* ---------------- scene 7: lpm ---------------- */
    {
      id: 'p-1', scene: 'lpm', start: 180, end: 187.5,
      caption: 'One table holds the five subnets and the block above them. A destination can match several prefixes at once.',
      detail: 'The table has the default route 0.0.0.0/0, the parent 100.64.0.0/22, and the five allocations: /23, /24, /25, /26 and /31. A destination inside the /23 matches the /0, the /22 and the /23, so three rows claim it and one rule decides.',
      narration: 'Every subnet in the design becomes a row of a forwarding table, plus the block above them and a default route. A destination address can match several rows at once, so one rule has to choose.',
      keyword: 'several matches',
      trap: 'A routing table is not a list of exclusive ranges. Overlap is normal and deliberate.'
    },
    {
      id: 'p-2', scene: 'lpm', start: 187.5, end: 195,
      caption: '100.64.3.201 matches /0 and /22 only, so it takes the /22 route: unallocated space inside the block.',
      detail: '201 lies above the /31 at 3.192 and outside the /26 that ends at 3.191, so no subnet claims it. The /22 does, and that is the correct answer: traffic to unallocated space inside the block follows the block route.',
      narration: 'Take a destination that no subnet owns. One hundred point sixty-four point three point two zero one matches the default route and the slash twenty-two, and nothing else. The longer of the two wins, so it takes the slash twenty-two.',
      keyword: 'the /22 catches it',
      trap: 'A destination inside the parent block but outside every subnet is matched by the parent, not by the default route.'
    },
    {
      id: 'p-3', scene: 'lpm', start: 195, end: 202.5,
      caption: '100.64.3.193 matches /0, /22 and /31, and the /31 wins. The rule is the longest prefix, not the first row.',
      detail: 'The /31 at 3.192 covers exactly 3.192 and 3.193, the two ends of the point-to-point link. Its prefix length is 31, which beats 22 and 0. The rule is stated in RFC 4632 section 5.1: forwarding in the Internet is done on a longest-match basis.',
      narration: 'Now a destination that a subnet does own. One hundred point sixty-four point three point one nine three matches three rows, and the slash thirty-one has the longest prefix, so the slash thirty-one wins. Longest prefix, not first row.',
      keyword: 'longest prefix wins',
      trap: 'A /31 route is legal and specific. Do not discard it because it looks like a mistake.'
    },
    {
      id: 'p-4', scene: 'lpm', start: 202.5, end: 210,
      caption: '100.64.9.9 matches only the default route. Row order is irrelevant: the answer is the maximum matching length.',
      detail: 'Nine is outside the /22, which ends at 100.64.3.255, so only the default route matches. Sorting the table by prefix length is an implementation convenience; the answer is the maximum length among the rows that match, and the model checks that shuffling the rows changes no result.',
      narration: 'A destination outside the block matches only the default route. And note that the order of the rows never matters: the answer is the longest prefix among those that match, so a table sorted the other way gives the same answer.',
      keyword: 'order does not matter',
      trap: 'A longer prefix that does not match is not a candidate. Length only competes among matches.'
    },

    /* ---------------- scene 8: trie ---------------- */
    {
      id: 'r-1', scene: 'trie', start: 210, end: 217.5,
      caption: 'Build a binary trie: each bit is a branch, and each stored prefix marks the node where it ends.',
      detail: 'The table can be stored as a tree of bits. Reading a prefix from the left gives a path from the root; the node at the end of that path carries the route. The default route marks the root itself, because its prefix is empty.',
      narration: 'The same table can be drawn as a tree. Each bit of the address is a branch, left for zero and right for one, and each stored prefix marks the node where its bits end. The default route marks the root, because it has no bits at all.',
      keyword: 'one branch per bit',
      trap: 'The trie stores prefixes, not addresses. A node with no route marker is a place traffic passes through, not a destination.'
    },
    {
      id: 'r-2', scene: 'trie', start: 217.5, end: 225,
      caption: 'Walk the destination bits from the left and remember the deepest marked node you pass.',
      detail: 'The walk is mechanical: take the next bit, follow the branch, and if the node you arrive at carries a route, note it as the best so far. After 32 bits the note holds the longest matching prefix, which is the same answer the row scan gave.',
      narration: 'To look up a destination, walk its bits from the left, one branch per bit, and remember the deepest node on the path that carries a route. When the bits run out, the last one you remembered is the answer.',
      keyword: 'deepest mark on the path',
      trap: 'Remember the deepest mark on the path, not the deepest mark in the tree.'
    },
    {
      id: 'r-3', scene: 'trie', start: 225, end: 232.5,
      caption: '100.64.3.201 passes the root and the /22, then branches to 3.128/25 while the design has 3.0/25 there.',
      detail: 'The first 22 bits agree with 100.64.0.0/22, so the walk stays inside that subtree. The next bit sends 201 into the 100.64.2.0/23 half, then into the 100.64.3.0/24, then into the 3.128/25 half. The design put its /25 at 3.0 and its /26 at 3.128, which ends at 3.191, so 201 passes every marked node on its path and still matches only the /22.',
      narration: 'One hundred point sixty-four point three point two zero one goes down the slash twenty-two path, then takes the branch into the second slash twenty-three and the second slash twenty-five. The design put its slash twenty-five in the first of those halves, and its slash twenty-six ends at point one nine one, so the walk passes it by.',
      keyword: 'the branch not taken',
      trap: 'A prefix that shares a long prefix with the destination but branches off early is not a match at all.'
    },
    {
      id: 'r-4', scene: 'trie', start: 232.5, end: 240,
      caption: 'The walk costs at most 32 steps, and the answer is the last mark on the path: exactly the longest match.',
      detail: 'A binary trie lookup is bounded by the address width, so 32 steps for IPv4 and 128 for IPv6, independent of the number of rows in the table. That bound is why routers use tries and not linear scans.',
      narration: 'The walk is at most thirty-two steps, one per bit, whatever the table holds. And the answer is the last mark on the path, which is the longest matching prefix. That is why routers use this structure rather than scanning rows.',
      keyword: 'bounded by 32',
      trap: 'The 32-step bound is for a plain binary trie. A compressed trie or a TCAM gives different bounds.'
    },

    /* ---------------- scene 9: aggregate ---------------- */
    {
      id: 'a-1', scene: 'aggregate', start: 240, end: 247.5,
      caption: 'Two blocks of the same size differing only in their last prefix bit are siblings: 100.64.0.0/24 and 100.64.1.0/24 make /23.',
      detail: 'Sibling blocks are the two halves of one parent. Their prefixes are equal, and their addresses agree on all but the last prefix bit. Replacing both rows with the parent shortens the table by one and covers exactly the same addresses.',
      narration: 'Two blocks of the same size are siblings when they differ only in the last bit of the prefix. One hundred point sixty-four point zero point zero over twenty-four and point one point zero over twenty-four are siblings, and together they are the slash twenty-three.',
      keyword: 'siblings',
      trap: 'Siblings must be the same size. A /24 and a /25 can never merge into a /24 by this rule.'
    },
    {
      id: 'a-2', scene: 'aggregate', start: 247.5, end: 255,
      caption: 'Four sibling /24s make 100.64.0.0/22, so 1024 addresses leave the table as one row.',
      detail: 'Merging is applied repeatedly: two pairs of siblings make two /23s, which are themselves siblings and make one /22. The page computes the minimal set by merging until no pair of siblings remains, then checks that the union of addresses is unchanged.',
      narration: 'Merge twice and four slash twenty-fours become one slash twenty-two. One thousand and twenty-four addresses are advertised as a single row. The page merges until no pair of siblings is left, and then checks that the set of addresses is exactly the same.',
      keyword: 'merge until no siblings remain',
      trap: 'Aggregation is not a renaming. If the union of addresses changes, the aggregate is wrong however tidy it looks.'
    },
    {
      id: 'a-3', scene: 'aggregate', start: 255, end: 262.5,
      caption: '100.64.4.0/24 and 100.64.6.0/24 are not siblings: their common prefix is 22 bits, and 4.0/22 would also cover 5.0 and 7.0.',
      detail: 'The two addresses differ in the second bit of the third octet, so the longest prefix they share is 22 bits. The only block containing both is 100.64.4.0/22, which spans 4.0 to 7.255 and covers 512 addresses that belong to nobody in this table.',
      narration: 'Now two blocks that cannot merge. One hundred point sixty-four point four point zero and point six point zero agree on only twenty-two bits, so the smallest block holding both is a slash twenty-two, which also covers point five and point seven: five hundred and twelve addresses nobody owns.',
      keyword: '512 unowned addresses',
      trap: 'Aggregating non-siblings is not a shortcut. It advertises addresses you do not own, and RFC 4632 requires such an aggregate to be discarded.'
    },
    {
      id: 'a-4', scene: 'aggregate', start: 262.5, end: 270,
      caption: 'When part of an aggregate belongs elsewhere, keep the more specific route: a /22 plus a /24 covers 1280 addresses in two rows.',
      detail: 'RFC 4632 section 5.1 states that a router generating an aggregate must discard packets that match the aggregate but no more specific route, and that a re-homed network must be advertised explicitly. So the table keeps 100.64.0.0/22 and 100.64.6.0/24: 1024 plus 256 addresses in two rows, with the /24 winning by longest match for its own addresses.',
      narration: 'If part of an aggregate belongs somewhere else, you do not drop it: you keep the specific route beside the aggregate. Here that is a slash twenty-two and a slash twenty-four, two rows covering one thousand two hundred and eighty addresses, with the slash twenty-four winning for its own addresses.',
      keyword: 'the hole stays',
      trap: 'An aggregate that covers a hole must not swallow the hole. The specific route is what keeps the hole out.'
    },

    /* ---------------- scene 10: procedure ---------------- */
    {
      id: 'c-1', scene: 'procedure', start: 270, end: 277.5,
      caption: 'Five steps: convert each need to a prefix, sort largest first, place at the lowest aligned free address, read what is left, aggregate siblings.',
      detail: 'The procedure covers both halves of the topic. Steps one to four are the design; step five is the routing table that the design produces. Every step is arithmetic on the address as a 32-bit number.',
      narration: 'One procedure covers the topic. Convert each need into a prefix. Sort the blocks largest first. Place each at the lowest address that is aligned for its size and free. Read what is left as blocks. Then aggregate only siblings.',
      keyword: 'convert, sort, place, read, aggregate',
      trap: 'Skipping step four is what produces the "62 addresses free, so it fits" answer.'
    },
    {
      id: 'c-2', scene: 'procedure', start: 277.5, end: 285,
      caption: 'The numbers this page computed: 1024 addresses, 962 allocated, 62 free in five blocks, largest 32.',
      detail: 'The model runs on load: it converts the five requirements, allocates them, decomposes the free space, tests a /26 against it, sums the block sizes of the failing example, resolves seven destinations by longest prefix match, and merges the routing table twice. The count of passing checks is printed under the canvas.',
      narration: 'Every number here was computed on the page and checked against a definition: one thousand and twenty-four addresses, nine hundred and sixty-two allocated, sixty-two free in five blocks whose largest is thirty-two, and a slash twenty-six that does not fit.',
      keyword: 'computed, then checked',
      trap: 'A diagram is not a proof. The picture shows the blocks; the exhaustive checks are what show the arithmetic is right.'
    },
    {
      id: 'c-3', scene: 'procedure', start: 285, end: 292.5,
      caption: 'The two traps: the sum of hosts is not the sum of blocks, and a longer prefix that does not match is not a candidate.',
      detail: 'The first trap is a units error: hosts are compared with hosts and blocks with blocks, and the two differ by the reserved addresses and by rounding. The second is a logic error: longest prefix match is a maximum over the rows that match, not a lookup of the longest prefix in the table.',
      narration: 'Two traps decide most marks. Adding host counts instead of block sizes, and treating the longest prefix in the table as the answer when it does not match the destination. Both are one-line errors with a whole question behind them.',
      keyword: 'units, then logic',
      trap: 'In a multiple-select question, "the route with the longest prefix" is false unless the route matches.'
    },
    {
      id: 'c-4', scene: 'procedure', start: 292.5, end: 300,
      caption: 'One sentence: a subnet is a power-of-two block at an aligned address, and every question here is that sentence plus arithmetic.',
      detail: 'Everything in the lesson is a consequence: sizes are powers of two, starts are multiples of the size, needs convert to the smallest block that holds them, free space is a set of blocks, the lookup takes the deepest match, and an aggregate is a parent whose two halves you own.',
      narration: 'One sentence to carry. A subnet is a power-of-two block of addresses that starts at a multiple of its own size. Every question in this topic, from design to forwarding to aggregation, is that sentence plus arithmetic.',
      keyword: 'one sentence',
      trap: 'If an answer cannot be written as a block at an aligned address, it is a range, and the question did not ask for a range.'
    }
  ]
};
