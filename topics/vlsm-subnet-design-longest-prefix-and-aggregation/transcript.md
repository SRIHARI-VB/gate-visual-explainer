# VLSM Subnet Design, Longest Prefix Match and Aggregation — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/vlsm-subnet-design-longest-prefix-and-aggregation/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. An address is 32 bits, a prefix is a length

*0:00 – 0:30 · objective: Read an address as 32 bits, a prefix as the number of bits fixed from the left, and a block as a power-of-two run of addresses that starts at a multiple of its own size.*

**0:00–0:07** — Start with the object itself. An IPv4 address is thirty-two bits. The four numbers are just the bits written in groups of eight. A prefix length counts how many of those bits, from the left, are fixed.

> Caption: An IPv4 address is 32 bits. 100.64.0.0 is 01100100 01000000 00000000 00000000.

Exam-trap caption mode adds: *A prefix counts bits from the left, not from the right. /22 and "the last 22 bits" are different things.*

**0:07–0:15** — Twenty-two fixed bits leave ten free bits, and ten free bits give two to the ten, which is one thousand and twenty-four addresses. The size of a block is decided by its prefix length and by nothing else.

> Caption: A /22 fixes 22 bits and leaves 10 free, so the block holds 2^10 = 1024 addresses.

Exam-trap caption mode adds: *The block size is a power of two. There is no CIDR block of 100 addresses or of 1000 addresses.*

**0:15–0:22** — A block does not float. Its first address must be a multiple of its own size. One thousand and twenty-four divides one hundred point sixty-four point zero point zero, so this block is legal and it ends at one hundred point sixty-four point three point two five five.

> Caption: A block must start at a multiple of its own size: 1024 divides 100.64.0.0, so the block is legal.

Exam-trap caption mode adds: *A range is not a block. 100.64.0.5 to 100.64.3.255 is a range and cannot be written with one prefix.*

**0:22–0:30** — Here is the same rule used backwards. Forty-eight over twenty-six is not a block, because sixty-four does not divide forty-eight. The notation names the block that contains it, and that block begins at one hundred point sixty-four point zero point zero.

> Caption: 100.64.0.48/26 is not a block: 64 does not divide 48, so it means 100.64.0.0/26.

Exam-trap caption mode adds: *When a question gives an address and a prefix, the network address is the address with its host bits cleared. Do not report the address you were given.*

## Scene 2. Halving: equal subnets, and what they cost

*0:30 – 1:00 · objective: See a split as one more prefix bit, so that 2^k equal subnets have prefix p+k, and see why equal sizes waste when the needs are unequal.*

**0:30–0:37** — To split a block, fix one more bit. The first half gets a zero, the second half gets a one. One block of one thousand and twenty-four becomes two blocks of five hundred and twelve.

> Caption: Halve a /22 and you get two /23s. Halve each again and you get four /24s.

Exam-trap caption mode adds: *Splitting does not create addresses. The two halves together are the same 1024 addresses the parent held.*

**0:37–0:45** — In general, splitting into two to the k equal pieces adds k to the prefix. Four equal subnets of a slash twenty-two are slash twenty-fours, and each holds two hundred and fifty-six addresses.

> Caption: Splitting into 2^k equal subnets gives prefix p+k, each holding 2^(32-p-k) addresses.

Exam-trap caption mode adds: *The exponent is 32 minus the new prefix, not 32 minus the old one. Splitting changes both the prefix and the size.*

**0:45–0:52** — Equal subnets are simple and wasteful. A local network with four hundred hosts needs five hundred and ten usable addresses. A link between two routers needs two. Fixed-length subnetting gives both the same five hundred and twelve.

> Caption: Equal subnets are easy to write and wasteful when the needs differ: 400 hosts and 2 hosts would both get 512.

Exam-trap caption mode adds: *A /23 gives 510 usable addresses, not 512. The two reserved addresses are already gone.*

**0:52–1:00** — The cost is not cosmetic. In a slash twenty-two there are four slash twenty-fours. If one of them is a two-host link, a quarter of the whole block is held for two addresses.

> Caption: A /22 holds only four /24s, so an equal split spends a quarter of the block on a link that needs two addresses.

Exam-trap caption mode adds: *Do not answer a "how many subnets" question with the number of subnets you would like. The prefix fixes the number.*

## Scene 3. What a block holds: 2^h − 2 and its exceptions

*1:00 – 1:30 · objective: Compute usable host addresses from the host-bit count, and know the two prefixes where the formula does not apply: /31 under RFC 3021 and /32.*

**1:00–1:07** — A block with h host bits holds two to the h addresses. Two are reserved: the all-zeros address names the network, and the all-ones address is the broadcast. What is left for hosts is two to the h minus two.

> Caption: A block with h host bits holds 2^h addresses, and two of them are reserved: 2^h − 2 for hosts.

Exam-trap caption mode adds: *The reserved two exist per block, not per parent. Ten /28s lose twenty addresses, not two.*

**1:07–1:15** — These seven numbers are worth knowing. Two hundred and fifty-four, one hundred and twenty-six, sixty-two, thirty, fourteen, six, two. Each step halves the block and roughly halves what is usable.

> Caption: /24 gives 254, /25 gives 126, /26 gives 62, /27 gives 30, /28 gives 14, /29 gives 6, /30 gives 2.

Exam-trap caption mode adds: *The sequence is not exactly halving: 30 to 14 is not 15. The reserved two are subtracted after the halving, not before.*

**1:15–1:22** — One exception, and it is examinable. RFC three zero two one says a slash thirty-one on a point-to-point link uses both addresses as hosts, because there is nobody to broadcast to. The formula gives zero there, and the formula is wrong.

> Caption: /31 is the exception: RFC 3021 gives both addresses to the two ends of a point-to-point link, so a /31 holds 2 hosts.

Exam-trap caption mode adds: *Do not apply 2^h − 2 to a /31 and answer "zero usable". The formula assumes a broadcast medium.*

**1:22–1:30** — The last case is the slash thirty-two. It is one address, a host route, and the subtraction would go negative. So keep the assumptions with the formula: two reserved addresses, on a broadcast medium, with at least two host bits.

> Caption: /32 is a single host route, where 2^h − 2 is negative, so the formula is read with its assumptions attached.

Exam-trap caption mode adds: *A /32 has no network and no broadcast address. It is a single host.*

## Scene 4. The design: largest first, each block aligned

*1:30 – 2:00 · objective: Convert each host requirement to the smallest block that holds it, then allocate from the largest down, and check that every block is aligned and disjoint.*

**1:30–1:37** — Here is a design problem with real numbers. One thousand and twenty-four addresses, and five local networks that need four hundred, two hundred, one hundred, fifty and two hosts. First, convert each need into a prefix.

> Caption: Requirements: 400, 200, 100, 50 and 2 hosts inside 100.64.0.0/22. Convert each need to a prefix.

Exam-trap caption mode adds: *Do not start by drawing blocks. The requirement becomes a prefix before any address is chosen.*

**1:37–1:45** — Four hundred hosts do not fit a slash twenty-four, so the block is a slash twenty-three. Two hundred needs a slash twenty-four. One hundred a slash twenty-five. Fifty a slash twenty-six. Two need a slash thirty-one.

> Caption: 400 hosts needs 510 usable, so /23; 200 needs /24; 100 needs /25; 50 needs /26; 2 needs /31.

Exam-trap caption mode adds: *Choosing a bigger block than needed is not "safe". It takes addresses from a neighbour that may not fit afterwards.*

**1:45–1:52** — Now allocate, and allocate from the largest. The slash twenty-three takes the first five hundred and twelve addresses. The slash twenty-four takes the next two hundred and fifty-six. Then the slash twenty-five, the slash twenty-six, and the slash thirty-one on the end.

> Caption: Allocate largest first: 100.64.0.0/23, 100.64.2.0/24, 100.64.3.0/25, 100.64.3.128/26, 100.64.3.192/31.

Exam-trap caption mode adds: *A block placed at an unaligned address is not a block. Check the divisibility before you write the answer.*

**1:52–2:00** — The five blocks use nine hundred and sixty-two of the one thousand and twenty-four addresses. Largest first is the safe order, because a big block needs a big aligned hole and holes only get smaller as you fill them.

> Caption: The five blocks use 962 of the 1024 addresses. Largest first works because only an untouched region holds a big aligned hole.

Exam-trap caption mode adds: *This is a procedure, not a theorem about all orders. The model checks this design; it does not prove that every other order fails.*

## Scene 5. What is left is five blocks, not one number

*2:00 – 2:30 · objective: Decompose the free space into maximal aligned blocks, and decide whether a new requirement fits by comparing sizes rather than by comparing counts.*

**2:00–2:07** — Sixty-two addresses are left, from one hundred point sixty-four point three point one nine four to point two five five. They are not one block, because one nine four is not a multiple of sixty-four.

> Caption: 62 addresses remain, 100.64.3.194 to 100.64.3.255, and they are not one block: 194 is not divisible by 64.

Exam-trap caption mode adds: *"62 addresses free" is not an answer to "can a /26 fit". The size of the largest free block is the answer.*

**2:07–2:15** — Written as blocks, the leftover is five: a slash thirty-one, a slash thirty, a slash twenty-nine, a slash twenty-eight and a slash twenty-seven. Two, four, eight, sixteen and thirty-two addresses, which add to sixty-two.

> Caption: They decompose into five aligned blocks: 3.194/31, 3.196/30, 3.200/29, 3.208/28 and 3.224/27.

Exam-trap caption mode adds: *Decomposition is unique. If your list of free blocks is different, one of them is not maximal.*

**2:15–2:22** — The largest free block is thirty-two addresses, which is thirty usable. A new local network needing forty hosts wants a slash twenty-six, and a slash twenty-six does not fit, although sixty-two addresses are free.

> Caption: The largest free block is 32 addresses, so 30 usable. A new LAN needing 40 hosts wants a /26 and does not fit.

Exam-trap caption mode adds: *Adding up free addresses and comparing to the requirement is the mistake this scene exists to remove.*

**2:22–2:30** — So free space is a set of blocks, not a number. A count tells you how many addresses are unused. The design question is always whether a block of the size you need exists at an aligned address.

> Caption: Free space is a set of blocks, not a number. A count answers "how many"; the design question is "of what size".

Exam-trap caption mode adds: *Two plans can leave the same total free and support different growth. The total does not distinguish them.*

## Scene 6. The sum of hosts is the wrong test

*2:30 – 3:00 · objective: Show a design whose host counts fit in the usable addresses and whose block sizes do not, and say what the two numbers measure.*

**2:30–2:37** — Now the trap that costs marks. A slash twenty-four has two hundred and fifty-four usable addresses. Four networks need one hundred, sixty, sixty and thirty hosts, which adds to two hundred and fifty. It looks as if it fits.

> Caption: A /24 has 254 usable addresses. Needs of 100, 60, 60 and 30 hosts add to 250, which looks like it fits.

Exam-trap caption mode adds: *The comparison is between host counts, and host counts are not what you allocate.*

**2:37–2:45** — But you do not allocate hosts, you allocate blocks. One hundred hosts need a block of one hundred and twenty-eight addresses. Sixty need sixty-four each. Thirty need thirty-two. That is two hundred and eighty-eight addresses.

> Caption: The blocks those needs require are /25, /26, /26 and /27: 128 + 64 + 64 + 32 = 288 addresses.

Exam-trap caption mode adds: *Each block also carries the two reserved addresses, so a need of 62 hosts takes 64 addresses, not 62.*

**2:45–2:52** — Two hundred and eighty-eight is more than two hundred and fifty-six, so the design does not fit, even though the host total was four under the usable count. The gap is thirty-two addresses, and the host sum never shows it.

> Caption: 288 > 256, so the design fails, even though the host total is four under the usable count.

Exam-trap caption mode adds: *This is a failure by capacity, not by fragmentation. No order of allocation rescues it.*

**2:52–3:00** — So add block sizes and never host counts. The difference is the two reserved addresses in every block, plus the rounding up to a power of two. That is why a plan that looks comfortable is often short.

> Caption: Add block sizes, not host counts. The gap is two reserved addresses per block plus rounding up to a power of two.

Exam-trap caption mode adds: *A question may give the parent size in usable addresses and the needs in hosts. Convert one of them before comparing.*

## Scene 7. Longest prefix match

*3:00 – 3:30 · objective: Resolve a destination that matches several prefixes to the one with the largest prefix length, and show that row order in the table changes nothing.*

**3:00–3:07** — Every subnet in the design becomes a row of a forwarding table, plus the block above them and a default route. A destination address can match several rows at once, so one rule has to choose.

> Caption: One table holds the five subnets and the block above them. A destination can match several prefixes at once.

Exam-trap caption mode adds: *A routing table is not a list of exclusive ranges. Overlap is normal and deliberate.*

**3:07–3:15** — Take a destination that no subnet owns. One hundred point sixty-four point three point two zero one matches the default route and the slash twenty-two, and nothing else. The longer of the two wins, so it takes the slash twenty-two.

> Caption: 100.64.3.201 matches /0 and /22 only, so it takes the /22 route: unallocated space inside the block.

Exam-trap caption mode adds: *A destination inside the parent block but outside every subnet is matched by the parent, not by the default route.*

**3:15–3:22** — Now a destination that a subnet does own. One hundred point sixty-four point three point one nine three matches three rows, and the slash thirty-one has the longest prefix, so the slash thirty-one wins. Longest prefix, not first row.

> Caption: 100.64.3.193 matches /0, /22 and /31, and the /31 wins. The rule is the longest prefix, not the first row.

Exam-trap caption mode adds: *A /31 route is legal and specific. Do not discard it because it looks like a mistake.*

**3:22–3:30** — A destination outside the block matches only the default route. And note that the order of the rows never matters: the answer is the longest prefix among those that match, so a table sorted the other way gives the same answer.

> Caption: 100.64.9.9 matches only the default route. Row order is irrelevant: the answer is the maximum matching length.

Exam-trap caption mode adds: *A longer prefix that does not match is not a candidate. Length only competes among matches.*

## Scene 8. The lookup is a walk down the bits

*3:30 – 4:00 · objective: Read the same lookup as a binary-trie walk: one step per bit, remembering the deepest stored prefix on the path.*

**3:30–3:37** — The same table can be drawn as a tree. Each bit of the address is a branch, left for zero and right for one, and each stored prefix marks the node where its bits end. The default route marks the root, because it has no bits at all.

> Caption: Build a binary trie: each bit is a branch, and each stored prefix marks the node where it ends.

Exam-trap caption mode adds: *The trie stores prefixes, not addresses. A node with no route marker is a place traffic passes through, not a destination.*

**3:37–3:45** — To look up a destination, walk its bits from the left, one branch per bit, and remember the deepest node on the path that carries a route. When the bits run out, the last one you remembered is the answer.

> Caption: Walk the destination bits from the left and remember the deepest marked node you pass.

Exam-trap caption mode adds: *Remember the deepest mark on the path, not the deepest mark in the tree.*

**3:45–3:52** — One hundred point sixty-four point three point two zero one goes down the slash twenty-two path, then takes the branch into the second slash twenty-three and the second slash twenty-five. The design put its slash twenty-five in the first of those halves, and its slash twenty-six ends at point one nine one, so the walk passes it by.

> Caption: 100.64.3.201 passes the root and the /22, then branches to 3.128/25 while the design has 3.0/25 there.

Exam-trap caption mode adds: *A prefix that shares a long prefix with the destination but branches off early is not a match at all.*

**3:52–4:00** — The walk is at most thirty-two steps, one per bit, whatever the table holds. And the answer is the last mark on the path, which is the longest matching prefix. That is why routers use this structure rather than scanning rows.

> Caption: The walk costs at most 32 steps, and the answer is the last mark on the path: exactly the longest match.

Exam-trap caption mode adds: *The 32-step bound is for a plain binary trie. A compressed trie or a TCAM gives different bounds.*

## Scene 9. Aggregation: siblings only, and the hole

*4:00 – 4:30 · objective: Merge sibling blocks into one shorter prefix, refuse to merge non-siblings, and keep a more specific route where part of an aggregate belongs elsewhere.*

**4:00–4:07** — Two blocks of the same size are siblings when they differ only in the last bit of the prefix. One hundred point sixty-four point zero point zero over twenty-four and point one point zero over twenty-four are siblings, and together they are the slash twenty-three.

> Caption: Two blocks of the same size differing only in their last prefix bit are siblings: 100.64.0.0/24 and 100.64.1.0/24 make /23.

Exam-trap caption mode adds: *Siblings must be the same size. A /24 and a /25 can never merge into a /24 by this rule.*

**4:07–4:15** — Merge twice and four slash twenty-fours become one slash twenty-two. One thousand and twenty-four addresses are advertised as a single row. The page merges until no pair of siblings is left, and then checks that the set of addresses is exactly the same.

> Caption: Four sibling /24s make 100.64.0.0/22, so 1024 addresses leave the table as one row.

Exam-trap caption mode adds: *Aggregation is not a renaming. If the union of addresses changes, the aggregate is wrong however tidy it looks.*

**4:15–4:22** — Now two blocks that cannot merge. One hundred point sixty-four point four point zero and point six point zero agree on only twenty-two bits, so the smallest block holding both is a slash twenty-two, which also covers point five and point seven: five hundred and twelve addresses nobody owns.

> Caption: 100.64.4.0/24 and 100.64.6.0/24 are not siblings: their common prefix is 22 bits, and 4.0/22 would also cover 5.0 and 7.0.

Exam-trap caption mode adds: *Aggregating non-siblings is not a shortcut. It advertises addresses you do not own, and RFC 4632 requires such an aggregate to be discarded.*

**4:22–4:30** — If part of an aggregate belongs somewhere else, you do not drop it: you keep the specific route beside the aggregate. Here that is a slash twenty-two and a slash twenty-four, two rows covering one thousand two hundred and eighty addresses, with the slash twenty-four winning for its own addresses.

> Caption: When part of an aggregate belongs elsewhere, keep the more specific route: a /22 plus a /24 covers 1280 addresses in two rows.

Exam-trap caption mode adds: *An aggregate that covers a hole must not swallow the hole. The specific route is what keeps the hole out.*

## Scene 10. Five steps, two traps, one sentence

*4:30 – 5:00 · objective: Consolidate the procedure and the computed numbers, and name the two mistakes that decide most marks in this topic.*

**4:30–4:37** — One procedure covers the topic. Convert each need into a prefix. Sort the blocks largest first. Place each at the lowest address that is aligned for its size and free. Read what is left as blocks. Then aggregate only siblings.

> Caption: Five steps: convert each need to a prefix, sort largest first, place at the lowest aligned free address, read what is left, aggregate siblings.

Exam-trap caption mode adds: *Skipping step four is what produces the "62 addresses free, so it fits" answer.*

**4:37–4:45** — Every number here was computed on the page and checked against a definition: one thousand and twenty-four addresses, nine hundred and sixty-two allocated, sixty-two free in five blocks whose largest is thirty-two, and a slash twenty-six that does not fit.

> Caption: The numbers this page computed: 1024 addresses, 962 allocated, 62 free in five blocks, largest 32.

Exam-trap caption mode adds: *A diagram is not a proof. The picture shows the blocks; the exhaustive checks are what show the arithmetic is right.*

**4:45–4:52** — Two traps decide most marks. Adding host counts instead of block sizes, and treating the longest prefix in the table as the answer when it does not match the destination. Both are one-line errors with a whole question behind them.

> Caption: The two traps: the sum of hosts is not the sum of blocks, and a longer prefix that does not match is not a candidate.

Exam-trap caption mode adds: *In a multiple-select question, "the route with the longest prefix" is false unless the route matches.*

**4:52–5:00** — One sentence to carry. A subnet is a power-of-two block of addresses that starts at a multiple of its own size. Every question in this topic, from design to forwarding to aggregation, is that sentence plus arithmetic.

> Caption: One sentence: a subnet is a power-of-two block at an aligned address, and every question here is that sentence plus arithmetic.

Exam-trap caption mode adds: *If an answer cannot be written as a block at an aligned address, it is a range, and the question did not ask for a range.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
