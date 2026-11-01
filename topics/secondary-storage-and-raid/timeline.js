/* ==========================================================================
   secondary-storage-and-raid — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   captions.vtt, captions.srt and transcript.md are derived from this file by
   tools/gen-captions.mjs — never edited by hand.

   Every number quoted in a caption is produced by the model in lesson.js, which
   builds the disk geometry, the three-part access time, the LBA-to-CHS map, the
   XOR and Reed-Solomon parity, the failure-pattern counts and the reliability
   sums at load, and re-checks each claim before anything is drawn.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 306,

  scenes: [
    {
      id: 'hierarchy', n: 1,
      title: 'Where secondary storage sits',
      start: 0, end: 27,
      objective: 'Place a disk on the memory hierarchy and read the two numbers that decide its job: latency far worse than DRAM, and cost per byte far better.'
    },
    {
      id: 'geometry', n: 2,
      title: 'Platters, tracks, sectors, cylinders',
      start: 27, end: 57,
      objective: 'Turn a named geometry into a capacity by multiplication, and see why a cylinder is the free dimension: one seek reaches every surface.'
    },
    {
      id: 'address', n: 3,
      title: 'From a block number to a place on the platter',
      start: 57, end: 81,
      objective: 'Convert a logical block address to cylinder, surface and sector by two divisions, and verify the round trip over all four million sectors.'
    },
    {
      id: 'access', n: 4,
      title: 'The three parts of an access time',
      start: 81, end: 111,
      objective: 'Decompose an access into seek, rotational latency and transfer, and see which term dominates for a one-sector read.'
    },
    {
      id: 'rotation', n: 5,
      title: 'Why the average rotation is half a turn',
      start: 111, end: 135,
      objective: 'Justify the factor one half, state the worst case, and see the latency as a function of the arrival phase.'
    },
    {
      id: 'blocksize', n: 6,
      title: 'The same disk, two hundred times faster',
      start: 135, end: 165,
      objective: 'Compute effective bandwidth against block size on one fixed geometry, and explain the factor between a random read and a sequential stream.'
    },
    {
      id: 'raid0', n: 7,
      title: 'RAID 0: striping, and what it costs',
      start: 165, end: 189,
      objective: 'Stripe a block across N disks, add the throughput, and lose everything to one failure — counted, not asserted.'
    },
    {
      id: 'raid1', n: 8,
      title: 'RAID 1: a second copy',
      start: 189, end: 213,
      objective: 'Mirror data, double the write cost, halve the capacity, and see exactly which second failure is fatal.'
    },
    {
      id: 'raid45', n: 9,
      title: 'RAID 4 and RAID 5: parity instead of a copy',
      start: 213, end: 249,
      objective: 'Compute a parity block by exclusive-or, recover any one lost block from it, and read the four disk operations a small write really costs.'
    },
    {
      id: 'raid6', n: 10,
      title: 'RAID 6: two parities, two failures',
      start: 249, end: 276,
      objective: 'Add a second check block over the field of 256 bytes, recover any two lost blocks, and count the six operations a small write now costs.'
    },
    {
      id: 'choose', n: 11,
      title: 'Choosing a level: four numbers, not one',
      start: 276, end: 306,
      objective: 'Compare the levels on usable capacity, fault tolerance, write penalty and the probability of losing data, all on the same six disks.'
    }
  ],

  events: [

    /* ---------------------------- scene 1 ---------------------------- */
    { id: 's1a', scene: 'hierarchy', start: 0, end: 7,
      caption: 'A memory hierarchy is a set of memories that trade latency against cost per byte.',
      detail: 'Registers are a few hundred bytes at a few hundred picoseconds. Cache is megabytes at a few nanoseconds. DRAM is gigabytes at about sixty nanoseconds. A disk is terabytes at milliseconds. Each step down multiplies capacity by roughly a thousand and latency by roughly a hundred.',
      narration: 'A memory hierarchy trades latency against cost per byte. Each step down buys about a thousand times the capacity for about a hundred times the delay.',
      keyword: 'trade latency against cost per byte',
      trap: 'The hierarchy is not about which memory is better. It is about which memory can afford to hold the data at all.' },

    { id: 's1b', scene: 'hierarchy', start: 7, end: 14,
      caption: 'One sector read from this disk takes 12.18 milliseconds; a DRAM read takes 60 nanoseconds.',
      detail: 'The model computes the disk access time from the geometry on the next scene: 8 ms average seek plus 4.1667 ms average rotation plus 0.0167 ms to transfer 512 bytes. Dividing 12.18 ms by 60 ns gives a factor of 203,056. That ratio is the reason a cache miss that reaches the disk is measured in milliseconds while everything above it is measured in nanoseconds.',
      narration: 'One sector from this disk takes twelve point one eight milliseconds. A DRAM read takes sixty nanoseconds. That is a factor of about two hundred thousand.',
      keyword: '203,056',
      trap: 'Do not add a disk latency to a DRAM latency and call the sum a comparison. The disk term is five orders of magnitude larger; a memory-hierarchy average is dominated by the miss rate, not by the fast term.' },

    { id: 's1c', scene: 'hierarchy', start: 14, end: 20.5,
      caption: 'The disk is 100 times cheaper per byte, so it holds what will not fit — and it must be read in blocks.',
      detail: 'Cost per gigabyte is a property of the medium, not of the access. A disk wins on capacity per rupee and loses on latency, so it is used for everything that must persist and almost nothing that must be fast. The unit of transfer is a block of sectors, never a single byte, because the mechanical work is paid once per access.',
      narration: 'The disk is a hundred times cheaper per byte. It holds what will not fit in memory, and it hands data over in blocks, never in bytes.',
      keyword: 'blocks, never in bytes',
      trap: 'A program that reads one byte at a time from a disk does not pay for one byte. It pays the full access time for the block that byte lives in, and throws the rest away.' },

    { id: 's1d', scene: 'hierarchy', start: 20.5, end: 27,
      caption: 'Two consequences follow: an access is mostly waiting, and the wait is decided by position.',
      detail: 'Because seek and rotation dominate, the useful question is never "how fast is the disk" but "where is the head, and where is the data". Every idea in this lesson — geometry, block size, striping, parity — is a way of moving data closer to the head or of hiding the wait behind another disk.',
      narration: 'So an access is mostly waiting, and the wait is decided by where the head is. Everything else in this lesson is a way of moving data closer to the head.',
      keyword: 'the wait is decided by position',
      trap: 'Throughput and latency are different questions. A disk array can multiply throughput while every individual access still takes twelve milliseconds.' },

    /* ---------------------------- scene 2 ---------------------------- */
    { id: 's2a', scene: 'geometry', start: 27, end: 34.5,
      caption: 'A platter has two surfaces; each surface has concentric tracks; each track is cut into sectors.',
      detail: 'Four platters give eight surfaces. Each surface carries one thousand concentric tracks. Each track holds five hundred sectors of 512 bytes. The tracks at the same radius on all surfaces form one cylinder, and all eight heads move together, so reaching a cylinder reaches every surface at once.',
      narration: 'Four platters give eight surfaces. Each surface has a thousand concentric tracks. Each track holds five hundred sectors of five hundred and twelve bytes.',
      keyword: 'concentric tracks',
      trap: 'The head does not move between surfaces. All eight heads are on one arm, so a change of surface is free and a change of cylinder is a seek.' },

    { id: 's2b', scene: 'geometry', start: 34.5, end: 42,
      caption: 'Capacity is the product: 8 surfaces times 1000 cylinders times 500 sectors times 512 bytes.',
      detail: 'The model multiplies the four numbers and gets 2,048,000,000 bytes. That is four million sectors. Every term is a count, so the product is exact; no approximation is involved until the answer is converted to a friendlier unit.',
      narration: 'Capacity is a product of four counts: eight surfaces, a thousand cylinders, five hundred sectors, five hundred and twelve bytes. Two thousand and forty-eight million bytes.',
      keyword: 'a product of four counts',
      trap: 'Capacity is not measured in cylinders or in tracks. Only the four-way product has units of bytes.' },

    { id: 's2c', scene: 'geometry', start: 42, end: 49.5,
      caption: 'That is 1.9073 GiB, not 2.048 GB — and a drive sold as 1 TB shows 931 GiB for the same reason.',
      detail: 'The model divides by 1024 three times and gets 1.9073 gibibytes, while dividing by 1000 three times gives 2.048 gigabytes. The ratio between the two conventions is 1.0737. A one-terabyte drive is 10 to the 12 bytes, which is 931.3 gibibytes, and that is the whole mystery of a missing nine per cent.',
      narration: 'In binary units that is one point nine zero seven three gibibytes. A drive sold as one terabyte shows nine hundred and thirty-one gibibytes for exactly this reason.',
      keyword: '1.0737',
      trap: 'A capacity question that does not say which unit it wants cannot be answered. Write the unit before the number.' },

    { id: 's2d', scene: 'geometry', start: 49.5, end: 57,
      caption: 'One track is 256,000 bytes and one cylinder is 2,048,000 bytes — reachable with a single seek.',
      detail: 'Five hundred sectors of 512 bytes make 256,000 bytes per track, and eight surfaces make 2,048,000 bytes per cylinder. Because all heads move together, a request that fills a cylinder pays one seek and then eight track transfers, so the per-byte cost of that request is far below the per-byte cost of a single sector.',
      narration: 'One track is two hundred and fifty-six thousand bytes. One cylinder is two million and forty-eight thousand bytes, all reachable with a single seek.',
      keyword: 'a single seek',
      trap: 'A cylinder is not a physical object you can point at. It is the set of tracks at one radius, one per surface, and it is the natural unit of a large sequential read.' },

    /* ---------------------------- scene 3 ---------------------------- */
    { id: 's3a', scene: 'address', start: 57, end: 63,
      caption: 'A logical block address is a single number; the disk needs three.',
      detail: 'The operating system refers to sectors by a logical block address, counted from zero and increasing. The drive needs a cylinder, a surface and a sector within the track. The mapping between them is not physics — it is a policy, and different drives use different orders.',
      narration: 'The system names a sector by one number, counted from zero. The drive needs three: a cylinder, a surface and a sector within the track.',
      keyword: 'not physics — it is a policy',
      trap: 'There is no unique correct LBA-to-CHS mapping. Any bijection works; the drive documents its own.' },

    { id: 's3b', scene: 'address', start: 63, end: 69,
      caption: 'Divide by sectors-per-cylinder, then by sectors-per-track: 4,000 and 500 here.',
      detail: 'One cylinder holds 8 surfaces times 500 sectors, which is 4,000 sectors. So the cylinder is the address divided by 4,000. The remainder is divided by 500 to give the surface, and what is left is the sector within the track, numbered from one.',
      narration: 'A cylinder holds four thousand sectors. Divide the address by four thousand for the cylinder, then divide the remainder by five hundred for the surface.',
      keyword: 'divide the remainder by five hundred',
      trap: 'The sector number inside a track is conventionally one-based while the address is zero-based. That off-by-one is the most common arithmetic slip in this topic.' },

    { id: 's3c', scene: 'address', start: 69, end: 75,
      caption: 'Address 3,999,999 is the last sector: cylinder 999, surface 7, sector 500.',
      detail: 'The model walks all four million addresses through the forward map and back through the inverse map and finds no disagreement. The last address lands on the last cylinder, the last surface and the last sector, which is what a total of four million sectors should do.',
      narration: 'The last address is three million nine hundred and ninety-nine thousand nine hundred and ninety-nine. It lands on cylinder nine hundred and ninety-nine, surface seven, sector five hundred.',
      keyword: 'no disagreement',
      trap: 'A round trip that works on the first few addresses proves very little. The failures hide at the boundaries, which is why the check runs over all four million.' },

    { id: 's3d', scene: 'address', start: 75, end: 81,
      caption: 'Two addresses in the same cylinder differ by no seek — only by a surface switch.',
      detail: 'Addresses that share a cylinder quotient lie on the same radius. Reading them in order costs one seek and one transfer per track. This is why a file system tries to place consecutive blocks in one cylinder, and why the drive renumbers its own sectors to hide the cost of crossing a track boundary.',
      narration: 'Two addresses in the same cylinder cost one seek between them. That is why a file system tries to keep consecutive blocks on one cylinder.',
      keyword: 'one seek and one transfer per track',
      trap: 'Skipping to the next cylinder is not free even when the surface does not change. The arm must move, and that is a seek.' },

    /* ---------------------------- scene 4 ---------------------------- */
    { id: 's4a', scene: 'access', start: 81, end: 88.5,
      caption: 'An access is three waits in a row: seek, then rotation, then transfer.',
      detail: 'First the arm moves to the right cylinder. Then the platter turns until the right sector arrives under the head. Then the bits are read out as the sector passes. The three are sequential, so the times add. This decomposition is the standard one in operating-systems courses and in the original RAID paper.',
      narration: 'An access is three waits in a row. Move the arm, wait for the sector to come round, then read the bits. They add, because they happen one after another.',
      keyword: 'they add, because they happen one after another',
      trap: 'The three terms are not alternatives and they do not overlap. Adding them is correct; taking the maximum is not.' },

    { id: 's4b', scene: 'access', start: 88.5, end: 96,
      caption: 'Rotation is 60,000 over 7,200 milliseconds per turn: 8.3333 ms, so the average wait is 4.1667 ms.',
      detail: 'A 7,200 revolution-per-minute platter makes one turn in 60,000 divided by 7,200 milliseconds, which is 8.3333 milliseconds. If the target sector is equally likely to be anywhere, the expected wait for it to arrive is half a turn, 4.1667 milliseconds. The model checks that twice the average equals one whole revolution.',
      narration: 'At seven thousand two hundred revolutions per minute a turn takes eight point three three three milliseconds. The average wait for a sector is half of that: four point one six seven milliseconds.',
      keyword: 'half of that',
      trap: 'One half is an assumption about where the sector is, not a law of physics. It holds when the arrival phase is uniform, which is what "average" means here.' },

    { id: 's4c', scene: 'access', start: 96, end: 103.5,
      caption: 'Transfer of one 512-byte sector is 8.3333 divided by 500: 0.0167 ms, and seek is given as 8 ms.',
      detail: 'The sector occupies one five-hundredth of a track, so reading it takes one five-hundredth of a revolution, 0.0167 milliseconds. The average seek is a manufacturer figure for this lesson, taken as 8 milliseconds. The total is therefore 8 plus 4.1667 plus 0.0167, which is 12.1833 milliseconds.',
      narration: 'One sector takes one five-hundredth of a turn to read: nought point nought one six seven milliseconds. With an eight millisecond average seek the total is twelve point one eight milliseconds.',
      keyword: '12.1833 milliseconds',
      trap: 'Transfer is the smallest of the three terms for a small read. Students routinely expect the opposite because transfer rate is the number printed on the box.' },

    { id: 's4d', scene: 'access', start: 103.5, end: 111,
      caption: 'Seek is 66 per cent of the total and rotation 34 per cent; the transfer is one seventh of one per cent.',
      detail: 'The model divides each term by the total: 8 over 12.1833 is 65.7 per cent, 4.1667 over 12.1833 is 34.2 per cent, and 0.0167 over 12.1833 is 0.14 per cent. That split is the whole reason disk scheduling matters: the only term an algorithm can influence is the seek, and it can only influence it by choosing the order of requests.',
      narration: 'Seek is sixty-six per cent, rotation thirty-four, transfer a seventh of one per cent. The only term a scheduler can change is the seek.',
      keyword: 'the only term a scheduler can change',
      trap: 'Improving the transfer rate of a disk by ten per cent improves this access time by about one thousandth. Improving the seek by ten per cent improves it by six and a half per cent.' },

    /* ---------------------------- scene 5 ---------------------------- */
    { id: 's5a', scene: 'rotation', start: 111, end: 117,
      caption: 'The head sits still and the platter turns: the target sector arrives at some phase between 0 and one turn.',
      detail: 'Draw the platter at the instant the seek ends. The target sector is at some angle ahead of the head. If it happens to be exactly under the head, the wait is zero; if it has just passed, the wait is a full revolution. Every intermediate wait is equally likely under a uniform arrival phase.',
      narration: 'The head is still and the platter turns. The sector is somewhere ahead of it, and where it is decides the wait.',
      keyword: 'somewhere ahead of it',
      trap: 'Rotational latency is not the time to spin the disk once. It is the time for the gap between head and sector to close, and that gap shrinks as the platter turns.' },

    { id: 's5b', scene: 'rotation', start: 117, end: 123,
      caption: 'Averaging the phase over a whole turn gives exactly half: the area under a ramp from 0 to 8.3333.',
      detail: 'Latency as a function of phase is a ramp from zero to one full revolution, so its mean over the interval is the midpoint, half a turn. The model integrates the ramp numerically and compares the result with one half of the revolution time; the two agree to within the sampling step.',
      narration: 'Average the wait over a whole turn and the ramp averages to its midpoint: half a turn. Four point one six seven milliseconds.',
      keyword: 'its midpoint',
      trap: 'Half a turn is the mean of a uniform phase. If the scheduler knows where the sector is, the wait can be driven below the mean — that is what rotational-position-aware scheduling buys.' },

    { id: 's5c', scene: 'rotation', start: 123, end: 129,
      caption: 'Best case 0, average 4.1667, worst 8.3333 ms — and the worst is twice the average.',
      detail: 'The best case is a phase of zero, giving no wait at all. The worst is a phase just past the head, giving one whole revolution. The average sits exactly between them, so the worst case is twice the average. A question that asks for a worst-case access time must add a whole revolution, not a half.',
      narration: 'Best case nothing, average four point one six seven, worst eight point three three three. The worst is twice the average.',
      keyword: 'twice the average',
      trap: 'A worst-case access time uses one full rotation. Substituting the average rotation there is the single most common error in disk numericals.' },

    { id: 's5d', scene: 'rotation', start: 129, end: 135,
      caption: 'Reading k sectors adds k sector-times, because the head is already in place.',
      detail: 'Once the first sector of a run arrives, the following sectors pass under the head one after another. So a run of k contiguous sectors costs the average seek, the average rotation, and k times one sector time. The model checks that the marginal cost of each extra sector is constant and equal to 0.0167 milliseconds.',
      narration: 'Each extra sector in the same run costs one sector time, nought point nought one six seven milliseconds, because the head is already there.',
      keyword: 'the head is already there',
      trap: 'This linear rule holds only while the run stays on one track. Crossing to the next track costs the inter-sector gap, and crossing to another cylinder costs a seek.' },

    /* ---------------------------- scene 6 ---------------------------- */
    { id: 's6a', scene: 'blocksize', start: 135, end: 142.5,
      caption: 'One sector: 12.1833 ms for 512 bytes, which is 42 kB/s.',
      detail: 'The access time barely moves with the size of the request, so the useful throughput of a request is its size divided by its access time. One sector of 512 bytes in 12.1833 milliseconds is 42,020 bytes per second, or 42 kilobytes per second — from a disk whose platter streams 30.72 megabytes per second.',
      narration: 'One sector: twelve point one eight milliseconds for five hundred and twelve bytes. That is forty-two kilobytes a second.',
      keyword: '42 kilobytes a second',
      trap: 'The number printed on a drive is its sequential rate. A random one-sector workload gets a few hundredths of it, and no amount of buffering in the drive changes the seek.' },

    { id: 's6b', scene: 'blocksize', start: 142.5, end: 150,
      caption: 'Eight sectors, one 4 KB block: 12.3 ms and 333 kB/s. The extra seven sectors cost 0.1167 ms.',
      detail: 'Adding seven more sectors adds 0.1167 milliseconds, which is less than one per cent of the access. So the 4 KB read costs almost exactly what the 512-byte read cost, and delivers eight times the data. The model reports the measured marginal cost per sector, which stays at 0.0167 milliseconds.',
      narration: 'Eight sectors: twelve point three milliseconds and three hundred and thirty-three kilobytes a second. Seven more sectors cost nought point one one seven milliseconds.',
      keyword: 'delivers eight times the data',
      trap: 'This is why the file system block and the page size are large. It is not that large blocks are read faster; it is that the expensive part is paid once.' },

    { id: 's6c', scene: 'blocksize', start: 150, end: 157.5,
      caption: 'Sixty-four sectors: 13.2333 ms, 2.48 MB/s. A whole track: 20.5 ms, 12.49 MB/s.',
      detail: 'The model tabulates four block sizes on the same geometry: 1 sector gives 42.0 kB/s, 8 sectors 333.0 kB/s, 64 sectors 2.476 MB/s and a full 500-sector track 12.488 MB/s. The last is still below the platter rate of 30.72 MB/s, because even a full track pays the seek and the half-turn.',
      narration: 'Sixty-four sectors: two point four eight megabytes a second. A whole track: twelve point four nine megabytes a second.',
      keyword: '12.488 MB/s',
      trap: 'A full-track read never reaches the platter rate. The platter rate is only reached by a stream that crosses tracks with no gap, which is what track skew exists to approximate.' },

    { id: 's6d', scene: 'blocksize', start: 157.5, end: 165,
      caption: 'Full track against one sector is 297 times the throughput, on the same disk, with the same head.',
      detail: 'The model divides 12.488 megabytes per second by 42.0 kilobytes per second and gets 297.15. Nothing about the hardware changed: only how much data each access carried. A random 4 KB workload on this disk is 81.3 accesses per second, which is 333 kB/s; the same disk read sequentially is nearly three hundred times faster.',
      narration: 'Full track against one sector is two hundred and ninety-seven times the throughput. Same disk, same head. Only the request size changed.',
      keyword: '297 times',
      trap: 'The 297 is a property of this geometry, not a constant. It shrinks as disks get faster and grows as seek times grow; never quote it as a general law.' },

    /* ---------------------------- scene 7 ---------------------------- */
    { id: 's7a', scene: 'raid0', start: 165, end: 171,
      caption: 'RAID 0 cuts the data into blocks and deals them round the disks, one block each.',
      detail: 'The set of blocks dealt to one disk in one round is a stripe, and the unit dealt to each disk is a striping unit. A large read touches every disk at once, so its bandwidth is the sum of the disks. The model builds the map for six disks and a striping unit of one block.',
      narration: 'RAID zero deals the blocks round the disks, one each. A large read touches every disk at once.',
      keyword: 'deals them round the disks',
      trap: 'Striping does not make an individual small request faster. A one-block request still goes to one disk and still takes a full access time.' },

    { id: 's7b', scene: 'raid0', start: 171, end: 177,
      caption: 'Six disks of 1 TB give 6 TB usable — 100 per cent — and six times the read bandwidth.',
      detail: 'Capacity is the number of disks times the size of one, because nothing is spent on redundancy. The model computes 6 times 1 TB, and an efficiency of 100 per cent. Aggregate bandwidth is the sum, so six disks give six times the rate of one, provided the requests are large enough to be spread.',
      narration: 'Six disks of one terabyte give six terabytes usable, a hundred per cent, and six times the read bandwidth.',
      keyword: '100 per cent',
      trap: 'The throughput gain is a property of the workload. Six small random requests spread over six disks do run six times faster; six copies of one large sequential stream do not.' },

    { id: 's7c', scene: 'raid0', start: 177, end: 183,
      caption: 'One disk fails and the stripe set is gone: the surviving blocks are not a file, they are a fragment.',
      detail: 'The model enumerates all six single-failure patterns and finds that every one of them loses data. The probability that the array survives a period is the probability that all six disks survive, which for independent disks is (1-p) to the sixth. So the array is six times more likely to fail than one disk.',
      narration: 'One disk fails and the stripe set is gone. Six single failures, six data losses. The array is six times more likely to fail than one disk.',
      keyword: 'six times more likely to fail',
      trap: 'RAID 0 is not a reliability scheme with a small weakness; it has no redundancy at all. Its name is a level number, not a promise.' },

    { id: 's7d', scene: 'raid0', start: 183, end: 189,
      caption: 'A hundred disks at 200,000 hours each give an array MTTF of 2,000 hours — about three months.',
      detail: 'The model divides the single-disk MTTF of 200,000 hours by 100 and gets 2,000 hours, which is eighty-three days. This is the arithmetic that motivated redundant arrays in the first place: a large array of unprotected disks fails far more often than the disks it replaces.',
      narration: 'A hundred disks at two hundred thousand hours each give an array MTTF of two thousand hours, about three months.',
      keyword: '2,000 hours',
      trap: 'MTTF is a mean, not a guarantee, and it says nothing about a particular array. Dividing by N is the right arithmetic only for independent failures of identical disks.' },

    /* ---------------------------- scene 8 ---------------------------- */
    { id: 's8a', scene: 'raid1', start: 189, end: 195,
      caption: 'RAID 1 writes every block twice, on two disks. A read may be served by either.',
      detail: 'Mirroring is the oldest redundancy scheme. Each write goes to both members of a pair; each read may go to whichever member has the shorter queue, so reads can even be faster than a single disk. The model pairs six disks into three mirrors.',
      narration: 'RAID one writes every block twice. A read can be served by either copy.',
      keyword: 'either copy',
      trap: 'Mirroring is not striping plus a copy of the stripe. It is a copy of each block, and the unit of failure is the pair.' },

    { id: 's8b', scene: 'raid1', start: 195, end: 201,
      caption: 'Six disks of 1 TB give 3 TB usable: 50 per cent. Every write costs two disk operations.',
      detail: 'Half the raw capacity buys the redundancy, so the model reports 3 TB and 50 per cent efficiency. A small write is two operations, one per copy, which is a write penalty of two. There is no read-modify-write, because no parity has to be recomputed.',
      narration: 'Six disks give three terabytes usable, fifty per cent. Every write costs two disk operations, and there is no read-modify-write.',
      keyword: '50 per cent',
      trap: 'A write penalty of two is half of the RAID 5 penalty of four. For a write-heavy workload that difference matters more than the capacity difference.' },

    { id: 's8c', scene: 'raid1', start: 201, end: 207,
      caption: 'Any one failure is survivable. Of the fifteen pairs of failures, three are fatal: both disks of one pair.',
      detail: 'The model enumerates all failure patterns over six disks. Every single failure leaves a copy of everything. Among the fifteen two-disk failures, the three that take both members of one pair lose data and the other twelve do not. So the fault tolerance is one failure guaranteed, and up to three if they fall in different pairs.',
      narration: 'Any one failure is survivable. Of the fifteen two-failure patterns, three are fatal: the three that take a whole pair.',
      keyword: 'three that take a whole pair',
      trap: 'Fault tolerance is a guaranteed number, not a best case. RAID 10 is usually described as tolerating one failure, because three simultaneous failures that happen to fall one per pair are luck, not a guarantee.' },

    { id: 's8d', scene: 'raid1', start: 207, end: 213,
      caption: 'Mirroring is the same as RAID 5 with a parity group of two, and the capacity tells you so.',
      detail: 'The model notes that a two-disk parity group has one data disk and one parity disk, which is exactly a mirror, and gives (2-1) over 2, which is 50 per cent. The RAID 5 capacity formula therefore contains mirroring as its smallest case, and the write penalty of four falls to two because there is nothing to read before writing.',
      narration: 'Mirroring is RAID five with a group of two. The capacity formula agrees: one minus one over two is fifty per cent.',
      keyword: 'a group of two',
      trap: 'This equivalence is about capacity and parity, not about write cost. A two-disk parity group has no old data to read, so its penalty is two and not four.' },

    /* ---------------------------- scene 9 ---------------------------- */
    { id: 's9a', scene: 'raid45', start: 213, end: 222,
      caption: 'Parity is one extra block per stripe, equal to the exclusive-or of the data blocks.',
      detail: 'The model takes six data bytes, 198, 140, 83, 25, 223 and 166, and exclusive-ors them to get 121. The parity block costs one disk of capacity per stripe instead of one disk per copy, which is why parity is cheaper than mirroring. RAID 4 puts that block on one dedicated disk; RAID 5 rotates it.',
      narration: 'Parity is one extra block per stripe: the exclusive-or of the data blocks. Six bytes give one check byte, one hundred and twenty-one.',
      keyword: 'exclusive-or of the data blocks',
      trap: 'Parity is not a checksum that only detects damage. Exclusive-or is invertible, so the same value both detects a missing block and reconstructs it.' },

    { id: 's9b', scene: 'raid45', start: 222, end: 231,
      caption: 'Lose any one block and exclusive-or the rest with the parity: the missing byte comes back exactly.',
      detail: 'The model removes each of the six data blocks in turn, exclusive-ors the five survivors with the parity, and recovers the missing byte. All six recoveries are exact. This is why parity tolerates any single disk failure in the stripe, and only one.',
      narration: 'Remove any one block, exclusive-or the survivors with the parity, and the missing byte comes back. All six cases recover exactly.',
      keyword: 'exactly',
      trap: 'Recovery is not free. It reads every surviving block in the stripe, so a degraded stripe serves reads at a fraction of its normal rate until the disk is replaced.' },

    { id: 's9c', scene: 'raid45', start: 231, end: 240,
      caption: 'A small write is four operations: read old data, read old parity, write new data, write new parity.',
      detail: 'The new parity is the old parity exclusive-or the old data exclusive-or the new data, so both old blocks must be read first. The model counts the operations: one read of old data, one read of old parity, one write of new data, one write of new parity. Four operations, which is a write penalty of four, against one for RAID 0 and two for RAID 1.',
      narration: 'A small write is four operations: read the old data, read the old parity, write the new data, write the new parity.',
      keyword: 'four operations',
      trap: 'A write that fills a whole stripe needs no reads at all: the parity is computed from the new data. The penalty of four applies to a small write only.' },

    { id: 's9d', scene: 'raid45', start: 240, end: 249,
      caption: 'RAID 4 sends every parity write to one disk; RAID 5 rotates it, so writes go in parallel.',
      detail: 'In RAID 4 all parity for every stripe lives on the last disk, so two writes to different data disks still collide on the parity disk, and it becomes the bottleneck. RAID 5 shifts the parity position by one disk per stripe — the left-symmetric layout in the original paper — so different stripes use different parity disks and the writes proceed in parallel.',
      narration: 'RAID four puts every parity block on one disk, which becomes a bottleneck. RAID five rotates it, so writes to different stripes go in parallel.',
      keyword: 'rotates it',
      trap: 'RAID 5 does not make a single small write cheaper than RAID 4. It makes many small writes to different stripes able to proceed at once.' },

    /* ---------------------------- scene 10 ---------------------------- */
    { id: 's10a', scene: 'raid6', start: 249, end: 255.75,
      caption: 'RAID 6 adds a second check block, Q, computed with weights over the field of 256 bytes.',
      detail: 'P is the plain exclusive-or. Q multiplies each data byte by a different power of a generator before exclusive-oring, in the arithmetic of GF(256) with the polynomial 0x11D. For the same six bytes the model computes P as 121 and Q as 82. Two independent equations, so two unknowns can be solved.',
      narration: 'RAID six adds a second check block. P is the plain exclusive-or; Q weights each byte by a different power before exclusive-oring. Here P is one hundred and twenty-one and Q is eighty-two.',
      keyword: 'two independent equations',
      trap: 'Q is not a second copy of P and not a checksum of P. It is a different linear combination of the data, which is what makes two failures solvable.' },

    { id: 's10b', scene: 'raid6', start: 255.75, end: 262.5,
      caption: 'Two lost blocks are solved from two equations: the model recovers all fifteen pairs exactly.',
      detail: 'With two unknowns the pair (P, Q) gives a two-by-two linear system over GF(256), which is solved by division instead of subtraction. The model runs all fifteen pairs of lost disks and recovers both blocks exactly in every case. A single parity block could not do this: one equation cannot fix two unknowns.',
      narration: 'Two lost blocks, two equations. The model recovers all fifteen pairs exactly. One parity block could not: one equation cannot fix two unknowns.',
      keyword: 'all fifteen pairs',
      trap: 'RAID 6 tolerates two failures, not three. A third lost block leaves three unknowns in two equations, and the stripe is gone.' },

    { id: 's10c', scene: 'raid6', start: 262.5, end: 269.25,
      caption: 'Six disks give 4 TB usable, 66.67 per cent, and a small write costs six operations.',
      detail: 'Two check blocks per stripe means two disks of redundancy, so the usable capacity is (6-2) times 1 TB, which is 4 TB and 66.67 per cent. A small write must read the old data and both old check blocks and write the new data and both new check blocks: six operations, a penalty of six.',
      narration: 'Six disks give four terabytes usable, sixty-six point six seven per cent. A small write costs six operations.',
      keyword: '66.67 per cent',
      trap: 'The capacity loss of RAID 6 relative to RAID 5 is one disk, but the write penalty goes from four to six. On a write-heavy workload that is the number that hurts.' },

    { id: 's10d', scene: 'raid6', start: 269.25, end: 276,
      caption: 'RAID 6 survives every pattern of up to two failures: 22 of the 64 patterns, and 0.0000196 at p = 0.01.',
      detail: 'The model enumerates all 64 failure patterns over six disks and confirms that the 1 pattern with no failure, the 6 with one and the 15 with two all survive, while the 42 with three or more lose data. Weighting those patterns with a per-disk failure probability of 0.01 gives a probability of data loss of 0.0000196, against 0.00146 for RAID 5 and 0.0585 for RAID 0.',
      narration: 'RAID six survives all twenty-two patterns of up to two failures. At a one per cent chance per disk, its chance of losing data is nought point nought nought nought one nine six.',
      keyword: '0.0000196',
      trap: 'These probabilities assume independent failures. Disks from one batch, in one chassis, fail together, and that correlation is what makes rebuild windows dangerous.' },

    /* ---------------------------- scene 11 ---------------------------- */
    { id: 's11a', scene: 'choose', start: 276, end: 283.5,
      caption: 'Four numbers decide the level: usable capacity, fault tolerance, write penalty, and the chance of loss.',
      detail: 'On the same six disks of 1 TB the model computes 6, 3, 5, 4 and 3 terabytes usable for RAID 0, 1, 5, 6 and 10; fault tolerance 0, 1, 1, 2 and 1; write penalties 1, 2, 4, 6 and 2. No level wins on all four, which is why the choice is a decision and not a lookup.',
      narration: 'Four numbers decide the level: capacity, fault tolerance, write penalty and the chance of losing data. On the same six disks they disagree.',
      keyword: 'a decision and not a lookup',
      trap: 'A question that gives a workload and asks for the best level is asking you to weight these four. A question that gives a table and asks for the capacity is asking for one multiplication.' },

    { id: 's11b', scene: 'choose', start: 283.5, end: 291,
      caption: 'RAID 5 is the cheapest redundancy; RAID 6 buys a second failure for one more disk of cost.',
      detail: 'RAID 5 spends one disk of six on redundancy and gives 83.33 per cent. RAID 6 spends two and gives 66.67 per cent. The model reports the reliability gain as the ratio of the two loss probabilities at p = 0.01: 0.00146 against 0.0000196, a factor of about seventy-five, bought with 16.67 per cent of the capacity.',
      narration: 'RAID five spends one disk on redundancy and keeps eighty-three per cent. RAID six spends two, keeps sixty-seven per cent, and cuts the chance of loss by a factor of about seventy-five.',
      keyword: 'a factor of about seventy-five',
      trap: 'The reliability gain is largest exactly where RAID 5 is weakest: wide stripes on large disks, where a rebuild reads enough data to meet an uncorrectable error.' },

    { id: 's11c', scene: 'choose', start: 291, end: 298.5,
      caption: 'RAID 10 spends half the capacity on copies and keeps the write penalty at two.',
      detail: 'RAID 10 is striping over mirrors, so its capacity is half the raw total and its write penalty is two, the lowest of any redundant level. Its reads can use either copy of a pair. That combination — full write speed with redundancy — is why it is chosen for write-heavy transaction workloads despite wasting half the disks.',
      narration: 'RAID ten spends half the capacity on copies and keeps the write penalty at two, the lowest of any redundant level.',
      keyword: 'write penalty at two',
      trap: 'RAID 10 does not guarantee two failures. It guarantees one; two are survivable only if they fall in different pairs.' },

    { id: 's11d', scene: 'choose', start: 298.5, end: 306,
      caption: 'The rule: capacity decides where the data fits, the write penalty decides the workload, redundancy decides the risk.',
      detail: 'Read the question for which of the three is fixed. If it fixes capacity, compute the number of disks needed at that level. If it fixes the workload, compare write penalties. If it fixes a failure count, count the parity blocks. The model has checked every figure on this page against its own definition, and the count of passing checks is shown beside the canvas.',
      narration: 'Capacity decides where the data fits, the write penalty decides the workload, redundancy decides the risk. Read the question for which one it fixed.',
      keyword: 'which one it fixed',
      trap: 'Mixing the units is the usual failure: terabytes for capacity, operations per write for the penalty, and a probability for reliability. They are not comparable, and they are not alternatives to each other.' }
  ]
};
