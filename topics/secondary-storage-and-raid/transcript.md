# Secondary Storage and RAID: Disk Geometry, Access Time and the Five Levels — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/secondary-storage-and-raid/index.html`
- Total duration: 5:06 (306 seconds), 11 scenes, 44 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Where secondary storage sits

*0:00 – 0:27 · objective: Place a disk on the memory hierarchy and read the two numbers that decide its job: latency far worse than DRAM, and cost per byte far better.*

**0:00–0:07** — A memory hierarchy trades latency against cost per byte. Each step down buys about a thousand times the capacity for about a hundred times the delay.

> Caption: A memory hierarchy is a set of memories that trade latency against cost per byte.

Exam-trap caption mode adds: *The hierarchy is not about which memory is better. It is about which memory can afford to hold the data at all.*

**0:07–0:14** — One sector from this disk takes twelve point one eight milliseconds. A DRAM read takes sixty nanoseconds. That is a factor of about two hundred thousand.

> Caption: One sector read from this disk takes 12.18 milliseconds; a DRAM read takes 60 nanoseconds.

Exam-trap caption mode adds: *Do not add a disk latency to a DRAM latency and call the sum a comparison. The disk term is five orders of magnitude larger; a memory-hierarchy average is dominated by the miss rate, not by the fast term.*

**0:14–0:20** — The disk is a hundred times cheaper per byte. It holds what will not fit in memory, and it hands data over in blocks, never in bytes.

> Caption: The disk is 100 times cheaper per byte, so it holds what will not fit — and it must be read in blocks.

Exam-trap caption mode adds: *A program that reads one byte at a time from a disk does not pay for one byte. It pays the full access time for the block that byte lives in, and throws the rest away.*

**0:20–0:27** — So an access is mostly waiting, and the wait is decided by where the head is. Everything else in this lesson is a way of moving data closer to the head.

> Caption: Two consequences follow: an access is mostly waiting, and the wait is decided by position.

Exam-trap caption mode adds: *Throughput and latency are different questions. A disk array can multiply throughput while every individual access still takes twelve milliseconds.*

## Scene 2. Platters, tracks, sectors, cylinders

*0:27 – 0:57 · objective: Turn a named geometry into a capacity by multiplication, and see why a cylinder is the free dimension: one seek reaches every surface.*

**0:27–0:34** — Four platters give eight surfaces. Each surface has a thousand concentric tracks. Each track holds five hundred sectors of five hundred and twelve bytes.

> Caption: A platter has two surfaces; each surface has concentric tracks; each track is cut into sectors.

Exam-trap caption mode adds: *The head does not move between surfaces. All eight heads are on one arm, so a change of surface is free and a change of cylinder is a seek.*

**0:34–0:42** — Capacity is a product of four counts: eight surfaces, a thousand cylinders, five hundred sectors, five hundred and twelve bytes. Two thousand and forty-eight million bytes.

> Caption: Capacity is the product: 8 surfaces times 1000 cylinders times 500 sectors times 512 bytes.

Exam-trap caption mode adds: *Capacity is not measured in cylinders or in tracks. Only the four-way product has units of bytes.*

**0:42–0:49** — In binary units that is one point nine zero seven three gibibytes. A drive sold as one terabyte shows nine hundred and thirty-one gibibytes for exactly this reason.

> Caption: That is 1.9073 GiB, not 2.048 GB — and a drive sold as 1 TB shows 931 GiB for the same reason.

Exam-trap caption mode adds: *A capacity question that does not say which unit it wants cannot be answered. Write the unit before the number.*

**0:49–0:57** — One track is two hundred and fifty-six thousand bytes. One cylinder is two million and forty-eight thousand bytes, all reachable with a single seek.

> Caption: One track is 256,000 bytes and one cylinder is 2,048,000 bytes — reachable with a single seek.

Exam-trap caption mode adds: *A cylinder is not a physical object you can point at. It is the set of tracks at one radius, one per surface, and it is the natural unit of a large sequential read.*

## Scene 3. From a block number to a place on the platter

*0:57 – 1:21 · objective: Convert a logical block address to cylinder, surface and sector by two divisions, and verify the round trip over all four million sectors.*

**0:57–1:03** — The system names a sector by one number, counted from zero. The drive needs three: a cylinder, a surface and a sector within the track.

> Caption: A logical block address is a single number; the disk needs three.

Exam-trap caption mode adds: *There is no unique correct LBA-to-CHS mapping. Any bijection works; the drive documents its own.*

**1:03–1:09** — A cylinder holds four thousand sectors. Divide the address by four thousand for the cylinder, then divide the remainder by five hundred for the surface.

> Caption: Divide by sectors-per-cylinder, then by sectors-per-track: 4,000 and 500 here.

Exam-trap caption mode adds: *The sector number inside a track is conventionally one-based while the address is zero-based. That off-by-one is the most common arithmetic slip in this topic.*

**1:09–1:15** — The last address is three million nine hundred and ninety-nine thousand nine hundred and ninety-nine. It lands on cylinder nine hundred and ninety-nine, surface seven, sector five hundred.

> Caption: Address 3,999,999 is the last sector: cylinder 999, surface 7, sector 500.

Exam-trap caption mode adds: *A round trip that works on the first few addresses proves very little. The failures hide at the boundaries, which is why the check runs over all four million.*

**1:15–1:21** — Two addresses in the same cylinder cost one seek between them. That is why a file system tries to keep consecutive blocks on one cylinder.

> Caption: Two addresses in the same cylinder differ by no seek — only by a surface switch.

Exam-trap caption mode adds: *Skipping to the next cylinder is not free even when the surface does not change. The arm must move, and that is a seek.*

## Scene 4. The three parts of an access time

*1:21 – 1:51 · objective: Decompose an access into seek, rotational latency and transfer, and see which term dominates for a one-sector read.*

**1:21–1:28** — An access is three waits in a row. Move the arm, wait for the sector to come round, then read the bits. They add, because they happen one after another.

> Caption: An access is three waits in a row: seek, then rotation, then transfer.

Exam-trap caption mode adds: *The three terms are not alternatives and they do not overlap. Adding them is correct; taking the maximum is not.*

**1:28–1:36** — At seven thousand two hundred revolutions per minute a turn takes eight point three three three milliseconds. The average wait for a sector is half of that: four point one six seven milliseconds.

> Caption: Rotation is 60,000 over 7,200 milliseconds per turn: 8.3333 ms, so the average wait is 4.1667 ms.

Exam-trap caption mode adds: *One half is an assumption about where the sector is, not a law of physics. It holds when the arrival phase is uniform, which is what "average" means here.*

**1:36–1:43** — One sector takes one five-hundredth of a turn to read: nought point nought one six seven milliseconds. With an eight millisecond average seek the total is twelve point one eight milliseconds.

> Caption: Transfer of one 512-byte sector is 8.3333 divided by 500: 0.0167 ms, and seek is given as 8 ms.

Exam-trap caption mode adds: *Transfer is the smallest of the three terms for a small read. Students routinely expect the opposite because transfer rate is the number printed on the box.*

**1:43–1:51** — Seek is sixty-six per cent, rotation thirty-four, transfer a seventh of one per cent. The only term a scheduler can change is the seek.

> Caption: Seek is 66 per cent of the total and rotation 34 per cent; the transfer is one seventh of one per cent.

Exam-trap caption mode adds: *Improving the transfer rate of a disk by ten per cent improves this access time by about one thousandth. Improving the seek by ten per cent improves it by six and a half per cent.*

## Scene 5. Why the average rotation is half a turn

*1:51 – 2:15 · objective: Justify the factor one half, state the worst case, and see the latency as a function of the arrival phase.*

**1:51–1:57** — The head is still and the platter turns. The sector is somewhere ahead of it, and where it is decides the wait.

> Caption: The head sits still and the platter turns: the target sector arrives at some phase between 0 and one turn.

Exam-trap caption mode adds: *Rotational latency is not the time to spin the disk once. It is the time for the gap between head and sector to close, and that gap shrinks as the platter turns.*

**1:57–2:03** — Average the wait over a whole turn and the ramp averages to its midpoint: half a turn. Four point one six seven milliseconds.

> Caption: Averaging the phase over a whole turn gives exactly half: the area under a ramp from 0 to 8.3333.

Exam-trap caption mode adds: *Half a turn is the mean of a uniform phase. If the scheduler knows where the sector is, the wait can be driven below the mean — that is what rotational-position-aware scheduling buys.*

**2:03–2:09** — Best case nothing, average four point one six seven, worst eight point three three three. The worst is twice the average.

> Caption: Best case 0, average 4.1667, worst 8.3333 ms — and the worst is twice the average.

Exam-trap caption mode adds: *A worst-case access time uses one full rotation. Substituting the average rotation there is the single most common error in disk numericals.*

**2:09–2:15** — Each extra sector in the same run costs one sector time, nought point nought one six seven milliseconds, because the head is already there.

> Caption: Reading k sectors adds k sector-times, because the head is already in place.

Exam-trap caption mode adds: *This linear rule holds only while the run stays on one track. Crossing to the next track costs the inter-sector gap, and crossing to another cylinder costs a seek.*

## Scene 6. The same disk, two hundred times faster

*2:15 – 2:45 · objective: Compute effective bandwidth against block size on one fixed geometry, and explain the factor between a random read and a sequential stream.*

**2:15–2:22** — One sector: twelve point one eight milliseconds for five hundred and twelve bytes. That is forty-two kilobytes a second.

> Caption: One sector: 12.1833 ms for 512 bytes, which is 42 kB/s.

Exam-trap caption mode adds: *The number printed on a drive is its sequential rate. A random one-sector workload gets a few hundredths of it, and no amount of buffering in the drive changes the seek.*

**2:22–2:30** — Eight sectors: twelve point three milliseconds and three hundred and thirty-three kilobytes a second. Seven more sectors cost nought point one one seven milliseconds.

> Caption: Eight sectors, one 4 KB block: 12.3 ms and 333 kB/s. The extra seven sectors cost 0.1167 ms.

Exam-trap caption mode adds: *This is why the file system block and the page size are large. It is not that large blocks are read faster; it is that the expensive part is paid once.*

**2:30–2:37** — Sixty-four sectors: two point four eight megabytes a second. A whole track: twelve point four nine megabytes a second.

> Caption: Sixty-four sectors: 13.2333 ms, 2.48 MB/s. A whole track: 20.5 ms, 12.49 MB/s.

Exam-trap caption mode adds: *A full-track read never reaches the platter rate. The platter rate is only reached by a stream that crosses tracks with no gap, which is what track skew exists to approximate.*

**2:37–2:45** — Full track against one sector is two hundred and ninety-seven times the throughput. Same disk, same head. Only the request size changed.

> Caption: Full track against one sector is 297 times the throughput, on the same disk, with the same head.

Exam-trap caption mode adds: *The 297 is a property of this geometry, not a constant. It shrinks as disks get faster and grows as seek times grow; never quote it as a general law.*

## Scene 7. RAID 0: striping, and what it costs

*2:45 – 3:09 · objective: Stripe a block across N disks, add the throughput, and lose everything to one failure — counted, not asserted.*

**2:45–2:51** — RAID zero deals the blocks round the disks, one each. A large read touches every disk at once.

> Caption: RAID 0 cuts the data into blocks and deals them round the disks, one block each.

Exam-trap caption mode adds: *Striping does not make an individual small request faster. A one-block request still goes to one disk and still takes a full access time.*

**2:51–2:57** — Six disks of one terabyte give six terabytes usable, a hundred per cent, and six times the read bandwidth.

> Caption: Six disks of 1 TB give 6 TB usable — 100 per cent — and six times the read bandwidth.

Exam-trap caption mode adds: *The throughput gain is a property of the workload. Six small random requests spread over six disks do run six times faster; six copies of one large sequential stream do not.*

**2:57–3:03** — One disk fails and the stripe set is gone. Six single failures, six data losses. The array is six times more likely to fail than one disk.

> Caption: One disk fails and the stripe set is gone: the surviving blocks are not a file, they are a fragment.

Exam-trap caption mode adds: *RAID 0 is not a reliability scheme with a small weakness; it has no redundancy at all. Its name is a level number, not a promise.*

**3:03–3:09** — A hundred disks at two hundred thousand hours each give an array MTTF of two thousand hours, about three months.

> Caption: A hundred disks at 200,000 hours each give an array MTTF of 2,000 hours — about three months.

Exam-trap caption mode adds: *MTTF is a mean, not a guarantee, and it says nothing about a particular array. Dividing by N is the right arithmetic only for independent failures of identical disks.*

## Scene 8. RAID 1: a second copy

*3:09 – 3:33 · objective: Mirror data, double the write cost, halve the capacity, and see exactly which second failure is fatal.*

**3:09–3:15** — RAID one writes every block twice. A read can be served by either copy.

> Caption: RAID 1 writes every block twice, on two disks. A read may be served by either.

Exam-trap caption mode adds: *Mirroring is not striping plus a copy of the stripe. It is a copy of each block, and the unit of failure is the pair.*

**3:15–3:21** — Six disks give three terabytes usable, fifty per cent. Every write costs two disk operations, and there is no read-modify-write.

> Caption: Six disks of 1 TB give 3 TB usable: 50 per cent. Every write costs two disk operations.

Exam-trap caption mode adds: *A write penalty of two is half of the RAID 5 penalty of four. For a write-heavy workload that difference matters more than the capacity difference.*

**3:21–3:27** — Any one failure is survivable. Of the fifteen two-failure patterns, three are fatal: the three that take a whole pair.

> Caption: Any one failure is survivable. Of the fifteen pairs of failures, three are fatal: both disks of one pair.

Exam-trap caption mode adds: *Fault tolerance is a guaranteed number, not a best case. RAID 10 is usually described as tolerating one failure, because three simultaneous failures that happen to fall one per pair are luck, not a guarantee.*

**3:27–3:33** — Mirroring is RAID five with a group of two. The capacity formula agrees: one minus one over two is fifty per cent.

> Caption: Mirroring is the same as RAID 5 with a parity group of two, and the capacity tells you so.

Exam-trap caption mode adds: *This equivalence is about capacity and parity, not about write cost. A two-disk parity group has no old data to read, so its penalty is two and not four.*

## Scene 9. RAID 4 and RAID 5: parity instead of a copy

*3:33 – 4:09 · objective: Compute a parity block by exclusive-or, recover any one lost block from it, and read the four disk operations a small write really costs.*

**3:33–3:42** — Parity is one extra block per stripe: the exclusive-or of the data blocks. Six bytes give one check byte, one hundred and twenty-one.

> Caption: Parity is one extra block per stripe, equal to the exclusive-or of the data blocks.

Exam-trap caption mode adds: *Parity is not a checksum that only detects damage. Exclusive-or is invertible, so the same value both detects a missing block and reconstructs it.*

**3:42–3:51** — Remove any one block, exclusive-or the survivors with the parity, and the missing byte comes back. All six cases recover exactly.

> Caption: Lose any one block and exclusive-or the rest with the parity: the missing byte comes back exactly.

Exam-trap caption mode adds: *Recovery is not free. It reads every surviving block in the stripe, so a degraded stripe serves reads at a fraction of its normal rate until the disk is replaced.*

**3:51–4:00** — A small write is four operations: read the old data, read the old parity, write the new data, write the new parity.

> Caption: A small write is four operations: read old data, read old parity, write new data, write new parity.

Exam-trap caption mode adds: *A write that fills a whole stripe needs no reads at all: the parity is computed from the new data. The penalty of four applies to a small write only.*

**4:00–4:09** — RAID four puts every parity block on one disk, which becomes a bottleneck. RAID five rotates it, so writes to different stripes go in parallel.

> Caption: RAID 4 sends every parity write to one disk; RAID 5 rotates it, so writes go in parallel.

Exam-trap caption mode adds: *RAID 5 does not make a single small write cheaper than RAID 4. It makes many small writes to different stripes able to proceed at once.*

## Scene 10. RAID 6: two parities, two failures

*4:09 – 4:36 · objective: Add a second check block over the field of 256 bytes, recover any two lost blocks, and count the six operations a small write now costs.*

**4:09–4:15** — RAID six adds a second check block. P is the plain exclusive-or; Q weights each byte by a different power before exclusive-oring. Here P is one hundred and twenty-one and Q is eighty-two.

> Caption: RAID 6 adds a second check block, Q, computed with weights over the field of 256 bytes.

Exam-trap caption mode adds: *Q is not a second copy of P and not a checksum of P. It is a different linear combination of the data, which is what makes two failures solvable.*

**4:15–4:22** — Two lost blocks, two equations. The model recovers all fifteen pairs exactly. One parity block could not: one equation cannot fix two unknowns.

> Caption: Two lost blocks are solved from two equations: the model recovers all fifteen pairs exactly.

Exam-trap caption mode adds: *RAID 6 tolerates two failures, not three. A third lost block leaves three unknowns in two equations, and the stripe is gone.*

**4:22–4:29** — Six disks give four terabytes usable, sixty-six point six seven per cent. A small write costs six operations.

> Caption: Six disks give 4 TB usable, 66.67 per cent, and a small write costs six operations.

Exam-trap caption mode adds: *The capacity loss of RAID 6 relative to RAID 5 is one disk, but the write penalty goes from four to six. On a write-heavy workload that is the number that hurts.*

**4:29–4:36** — RAID six survives all twenty-two patterns of up to two failures. At a one per cent chance per disk, its chance of losing data is nought point nought nought nought one nine six.

> Caption: RAID 6 survives every pattern of up to two failures: 22 of the 64 patterns, and 0.0000196 at p = 0.01.

Exam-trap caption mode adds: *These probabilities assume independent failures. Disks from one batch, in one chassis, fail together, and that correlation is what makes rebuild windows dangerous.*

## Scene 11. Choosing a level: four numbers, not one

*4:36 – 5:06 · objective: Compare the levels on usable capacity, fault tolerance, write penalty and the probability of losing data, all on the same six disks.*

**4:36–4:43** — Four numbers decide the level: capacity, fault tolerance, write penalty and the chance of losing data. On the same six disks they disagree.

> Caption: Four numbers decide the level: usable capacity, fault tolerance, write penalty, and the chance of loss.

Exam-trap caption mode adds: *A question that gives a workload and asks for the best level is asking you to weight these four. A question that gives a table and asks for the capacity is asking for one multiplication.*

**4:43–4:51** — RAID five spends one disk on redundancy and keeps eighty-three per cent. RAID six spends two, keeps sixty-seven per cent, and cuts the chance of loss by a factor of about seventy-five.

> Caption: RAID 5 is the cheapest redundancy; RAID 6 buys a second failure for one more disk of cost.

Exam-trap caption mode adds: *The reliability gain is largest exactly where RAID 5 is weakest: wide stripes on large disks, where a rebuild reads enough data to meet an uncorrectable error.*

**4:51–4:58** — RAID ten spends half the capacity on copies and keeps the write penalty at two, the lowest of any redundant level.

> Caption: RAID 10 spends half the capacity on copies and keeps the write penalty at two.

Exam-trap caption mode adds: *RAID 10 does not guarantee two failures. It guarantees one; two are survivable only if they fall in different pairs.*

**4:58–5:06** — Capacity decides where the data fits, the write penalty decides the workload, redundancy decides the risk. Read the question for which one it fixed.

> Caption: The rule: capacity decides where the data fits, the write penalty decides the workload, redundancy decides the risk.

Exam-trap caption mode adds: *Mixing the units is the usual failure: terabytes for capacity, operations per write for the penalty, and a probability for reliability. They are not comparable, and they are not alternatives to each other.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
