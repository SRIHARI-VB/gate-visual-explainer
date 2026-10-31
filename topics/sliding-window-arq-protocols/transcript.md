# Sliding Window, Go-Back-N and Selective Repeat: Windows, Sequence Numbers and Utilisation — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/sliding-window-arq-protocols/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. One frame at a time, and the empty pipe

*0:00 – 0:30 · objective: See what a stop-and-wait sender spends its time on, and derive efficiency as one frame per transmission-plus-round-trip.*

**0:00–0:07** — Start with the simplest reliable sender there is. It sends one frame, and then it does nothing until the acknowledgement arrives. The link is busy while the frame is going out, and silent for everything after that.

> Caption: A stop-and-wait sender puts one frame on the wire, then stops and waits for its acknowledgement.

Exam-trap caption mode adds: *The idle time is not a fault; it is the design. Counting it as wasted bandwidth without counting the round trip that causes it gives the wrong formula.*

**0:07–0:15** — Two different delays. Transmission is how long the sender holds the wire: eight thousand bits at one megabit per second, eight milliseconds. Propagation is how long a bit takes to cross the link: ten milliseconds each way, so twenty for the round trip. The cycle is twenty-eight milliseconds and delivers one frame.

> Caption: Transmission takes Tt = 8 ms; the round trip takes 2 Tp = 20 ms; the cycle is 28 ms for one frame.

Exam-trap caption mode adds: *Doubling Tt instead of Tp, or forgetting the second Tp. The formula has one transmission and two propagation delays in it, never the other way round.*

**0:15–0:22** — Efficiency is the useful part of the cycle over the whole cycle. Eight over twenty-eight is nought point two eight five seven. Write it once in terms of the ratio a, propagation over transmission, and it becomes one over one plus two a. That is the whole of stop-and-wait.

> Caption: Efficiency is useful time over cycle time: 8 over 28 is 0.2857, so 28.57 per cent of the link.

Exam-trap caption mode adds: *Using the round trip where the formula wants one-way a. If a question hands you the RTT, a is the RTT divided by twice Tt.*

**0:22–0:30** — Look at what those twenty milliseconds are. A pipe, empty, waiting for an answer. If the sender had more frames to put in it, the pipe would be full and the link busy. That is the whole idea of a window, and the next scene does the arithmetic.

> Caption: Twenty of the twenty-eight milliseconds are a pipe with nothing in it. The cure is to keep more frames in that pipe.

Exam-trap caption mode adds: *Believing a bigger window always helps. Once the pipe is full, more window buys nothing; the formula caps at one.*

## Scene 2. The window: several frames in flight

*0:30 – 1:00 · objective: Read a sender window and a receiver window, see the window slide on an acknowledgement, and derive W over one-plus-two-a.*

**0:30–0:37** — A window is a permission slip. The sender may have W frames unacknowledged at any moment. The receiver also keeps a window: the numbers it is prepared to accept. Stop-and-wait has both at one. Go-back-N keeps the receiver at one. Selective Repeat gives the receiver a full window.

> Caption: A window of W frames may be outstanding at once. The receiver holds a window too, and it is the receiver window that separates the protocols.

Exam-trap caption mode adds: *Assuming the two windows are always equal. They are equal only in Selective Repeat.*

**0:37–0:45** — When the acknowledgement for the oldest frame arrives, the window slides by one and a new number becomes sendable. Nothing is copied and nothing is reordered: the window is two integers, the base and the base plus W.

> Caption: An acknowledgement slides the window by one; the frames inside it travel while the sender keeps transmitting.

Exam-trap caption mode adds: *Thinking the window is a buffer of frames. It is a range of sequence numbers; the buffering is a separate question, and it is what Go-Back-N and Selective Repeat disagree about.*

**0:45–0:52** — One frame per cycle becomes W frames per cycle, so the efficiency is W over one plus two a. It is capped at one: a link cannot be more than fully used, and any question whose formula gives more than one is telling you the window is already large enough.

> Caption: W frames per cycle of one plus two a gives W over one plus two a, capped at one.

Exam-trap caption mode adds: *Reporting an efficiency above one, or rounding a window up when the question asks for the efficiency of a given window.*

**0:52–1:00** — Our link has a of one point two five, so the denominator is three point five. One frame gives nought point two eight six. Two gives nought point five seven one. Three gives nought point eight five seven. Four gives more than one, so the answer is one: the pipe is full.

> Caption: On our link a is 1.25, so one plus two a is 3.5: windows 1, 2, 3 give 0.286, 0.571, 0.857, and 4 saturates the link.

Exam-trap caption mode adds: *Stopping at three because 3.5 is not an integer. The window that saturates is the ceiling, not the floor.*

## Scene 3. Stop-and-wait, counted twice

*1:00 – 1:30 · objective: Run the efficiency formula on a 2025 paper item, and read the direction of the 2023 item without computing either answer.*

**1:00–1:07** — A paper item, almost bare. Three thousand bit frames, two thousand bits per second, one hundred milliseconds each way, acknowledgements negligible. Three numbers, one formula, and the only work is converting them.

> Caption: GATE CSE 2025 Set 2, Q36: 3000-bit frames at 2000 bits per second, one-way delay 100 ms. Utilisation?

Exam-trap caption mode adds: *Treating the 100 ms as the round trip. The question says one-way propagation delay, so the round trip is 200 ms.*

**1:07–1:15** — Three thousand bits at two thousand bits per second is one and a half seconds. The round trip is two hundred milliseconds. The cycle is one point seven seconds, and the useful part is one point five of it: nought point eight eight two three, so eighty-eight point two four per cent.

> Caption: Tt is 1500 ms and 2 Tp is 200 ms, so the cycle is 1700 ms and efficiency is 1500 over 1700, which is 88.24 per cent.

Exam-trap caption mode adds: *The distractor is usually 1500 over 1600, from counting one propagation delay. That gives 93.75 per cent, which is not an option for nothing.*

**1:15–1:22** — The next item does not want a number, it wants a direction. Write the efficiency out: frame size times speed, over that same product plus twice distance times rate. Bigger distance lowers it. Bigger rate lowers it. So the lowest utilisation is the long link at the high rate.

> Caption: GATE CSE 2023, Q7 asks which scenario gives the LOWEST utilisation. Written out, efficiency is L times v over L times v plus two d B.

Exam-trap caption mode adds: *Reading higher rate as better utilisation. A faster link finishes transmitting sooner, so it waits longer, so the fraction used falls.*

**1:22–1:30** — Longer link, higher rate. Both make the wait longer relative to the frame. That is the whole question, and it is why a satellite link at high speed is the classic example of a link that stop-and-wait wastes.

> Caption: Longer link and higher transmission rate. Both changes enlarge the idle stretch, and neither changes the frame.

Exam-trap caption mode adds: *Assuming a high rate always means high throughput. Throughput is efficiency times rate, and here the rate rises while the efficiency falls.*

## Scene 4. The smallest window that fills the link

*1:30 – 2:00 · objective: Invert the formula to get W at least one plus two a, round up, and check the answer against the utilisation it buys.*

**1:30–1:37** — Same three numbers, opposite question. Not what efficiency does this window buy, but what window buys full efficiency. The formula is the same; it is turned around.

> Caption: GATE CSE 2026 Set 1, Q45: 1000-bit frames, 100 kbps, one-way delay 100 ms. What is the smallest window for 100 per cent utilisation?

Exam-trap caption mode adds: *Computing the efficiency and stopping. The question asks for a window size, so the answer must be a count of frames.*

**1:37–1:45** — One thousand bits at one hundred kilobits per second is ten milliseconds. The delay is ten times that, so a is ten, and the pipe holds twenty-one frames. A window of twenty-one fills it exactly. Twenty leaves a gap of one frame time in every twenty-one.

> Caption: Tt is 10 ms, Tp is 100 ms, so a is 10 and one plus two a is 21. The window needed is 21 frames.

Exam-trap caption mode adds: *Using 20 because a round trip is 20 transmission times. The extra one is the frame being transmitted; the formula is one plus two a, not two a.*

**1:45–1:52** — The first link gives three and a half, and half a frame is not a window. Rounding down to three leaves the link idle for one frame in seven. Rounding up to four fills it. The rule is always ceiling, never floor.

> Caption: When one plus two a is not a whole number, round up. A window of 3.5 frames does not exist.

Exam-trap caption mode adds: *Rounding to the nearest integer. A required window that is not met leaves the link idle; it is a lower bound, so it rounds up.*

**1:52–2:00** — Notice what that number is. Twenty-one frames in flight is twenty-one frame times of pipe. In bits it is the bandwidth-delay product: the amount of data that has to be travelling at once to keep the link busy. That is why the same number keeps appearing in questions about buffers.

> Caption: The window is the bandwidth-delay product: the data that must be in flight to keep the link busy.

Exam-trap caption mode adds: *Computing the bandwidth-delay product in bits and comparing it to a window in frames. Convert with the frame size first.*

## Scene 5. Go-Back-N: discard, then resend the tail

*2:00 – 2:30 · objective: Trace one lost frame through Go-Back-N, and count the transmissions it costs at two window sizes.*

**2:00–2:07** — Go-back-N gives the receiver no memory at all. It accepts only the frame it expects next, and if anything else arrives it throws it away and repeats the acknowledgement of the last good frame. The sender keeps one timer, for the oldest frame it has not had acknowledged.

> Caption: Go-Back-N: the receiver accepts only the next expected frame and acknowledges cumulatively.

Exam-trap caption mode adds: *Believing the receiver buffers the good frames that arrive after the gap. It does not; they are discarded and must be sent again.*

**2:07–2:15** — Frame two is lost. Three and four arrive at a receiver that is waiting for two, so both are thrown away. Nothing acknowledges past one, so the timer on two expires, and the sender goes back to two.

> Caption: Frame 2 is lost. Frames 3 and 4 arrive, are discarded, and the sender times out on frame 2.

Exam-trap caption mode adds: *Thinking the duplicated acknowledgement of frame 1 tells the sender which frame was lost. It tells the sender that frame 1 arrived, and nothing more.*

**2:15–2:22** — Count the cost. Twelve frames, one loss. At window four the sender transmits seventeen times in all. At window eight, twenty-one. The one lost frame cost four extra transmissions, then eight. That is what going back means.

> Caption: Twelve frames with frame 2 lost once: window 4 costs 17 transmissions, window 8 costs 21.

Exam-trap caption mode adds: *Assuming a larger window always reduces total transmissions. With loss it does the opposite; it multiplies the cost of each loss.*

**2:22–2:30** — What the design buys is simplicity. One frame of storage at the receiver. One timer at the sender. Nothing ever arrives out of order, so there is nothing to reassemble. The price is paid in retransmissions, and it is paid in proportion to the window.

> Caption: What Go-Back-N saves is memory: one buffer at the receiver, one timer at the sender, and no reordering.

Exam-trap caption mode adds: *Confusing the sender buffer with the receiver buffer. Go-Back-N needs W frames at the sender and one at the receiver.*

## Scene 6. Selective Repeat: buffer, then resend one

*2:30 – 3:00 · objective: Trace the same loss through Selective Repeat, and see the receiver buffer buy back the retransmissions.*

**2:30–2:37** — Selective Repeat gives the receiver a memory. Any frame inside its window is accepted, stored, and acknowledged on its own. When the gap is filled, everything buffered behind it is delivered in order at once.

> Caption: Selective Repeat gives the receiver a window the same width as the sender and buffers out-of-order frames.

Exam-trap caption mode adds: *Assuming the receiver delivers buffered frames as they arrive. It delivers them only when the gap is filled, so order is preserved.*

**2:37–2:45** — Same loss, different handling. Three and four are stored and acknowledged, so their timers stop. Only frame two times out, so only frame two is sent again, and when it arrives the receiver delivers two, three and four in order.

> Caption: Frame 2 is lost, but 3 and 4 are buffered and acknowledged. When 2 is resent, all three are delivered.

Exam-trap caption mode adds: *Thinking the individual acknowledgements arrive in order. They may not; what matters is that each frame is acknowledged by number.*

**2:45–2:52** — Twelve frames, one loss, thirteen transmissions. At window four, and again at window eight. One loss costs one retransmission, and the window size does not change that. The saving against go-back-N is four, then eight.

> Caption: The same twelve frames with the same loss cost 13 transmissions at either window size.

Exam-trap caption mode adds: *Assuming Selective Repeat also needs more transmissions at a larger window. It does not; the extra cost of a loss is exactly one frame.*

**2:52–3:00** — The price is memory and bookkeeping. A window of buffers at the receiver. A copy of every outstanding frame at the sender. A timer per frame rather than one for the oldest. And logic to deliver in order from a buffer that is not in order.

> Caption: The price is buffering: W frames at each end, twice the sequence space, and reordering logic.

Exam-trap caption mode adds: *Quoting the Go-Back-N buffer figure for Selective Repeat. The receiver buffer is W, not one.*

## Scene 7. Why Go-Back-N stops at two-to-the-m minus one

*3:00 – 3:30 · objective: Build the wrap-around ambiguity that forces the bound, and read the first failing window size off a computed table.*

**3:00–3:07** — Now the field width. Three bits carry eight numbers, nought to seven, and then they repeat. The question is how many of those eight a sender may use at once. The tempting answer is all eight.

> Caption: Three sequence bits give eight numbers, 0 to 7. Can a window of 8 be safe?

Exam-trap caption mode adds: *Treating the sequence field as a count rather than a set of labels that wrap around.*

**3:07–3:15** — Send eight frames numbered nought to seven. All arrive, all are acknowledged. Now send the next eight, and the numbers have to be reused. Now a late acknowledgement from the first batch arrives. It says nought. Which nought does it mean? The sender cannot know.

> Caption: Send 0 to 7, have them all delivered and acknowledged, send the next eight reusing 0 to 7, and then an old duplicate acknowledgement arrives.

Exam-trap caption mode adds: *Reading this as a receiver-side problem. For Go-Back-N the ambiguity is at the sender, in the acknowledgement, not at the receiver.*

**3:15–3:22** — So hold one number back. The window is at most two to the m minus one: seven here. The unused number is the gap between the batch being acknowledged and the batch being sent, and it is what makes an old acknowledgement unambiguous.

> Caption: So one number must be held back: the window is at most two-to-the-m minus one, which is 7 here.

Exam-trap caption mode adds: *Forgetting the minus one. It is not a rounding nicety; it is the number that carries the whole argument.*

**3:22–3:30** — Do not take it on trust. For two, three, four and five bits, test every window size and find the first that goes wrong. Four, eight, sixteen, thirty-two: always two to the m. The safe window is one less than the number that fails.

> Caption: Computed for m equal to 2, 3, 4 and 5, the first window that fails is 4, 8, 16 and 32 — exactly two-to-the-m.

Exam-trap caption mode adds: *Quoting the Selective Repeat bound here. Go-Back-N gets one less than the whole space; Selective Repeat gets half of it.*

## Scene 8. Why Selective Repeat stops at two-to-the-m minus one

*3:30 – 4:00 · objective: Slide the receiver window into the sender window and see the duplicate that forces the halved bound.*

**3:30–3:37** — Selective Repeat has two windows in the same number space: the sender has one, the receiver has one of the same width. Two windows in one space, and they must never overlap.

> Caption: Selective Repeat buffers, so its receiver window is as wide as the sender window. That is what costs it the sequence space.

Exam-trap caption mode adds: *Thinking the halved bound is a conservative engineering choice. It is forced by non-overlap.*

**3:37–3:45** — Three bits, window five. Five frames delivered, every acknowledgement lost. The receiver window moves on to five, six, seven, and wraps to nought and one. The sender retransmits nought, and nought is inside that window, so it is accepted as a brand new frame.

> Caption: With three bits and a window of 5: deliver 0 to 4, lose every acknowledgement, and the receiver window becomes 5, 6, 7, 0, 1.

Exam-trap caption mode adds: *Assuming a lost acknowledgement is harmless. It is the loss of the acknowledgement that lets the two windows drift into each other.*

**3:45–3:52** — Window four. The receiver window becomes four, five, six, seven and stops. The sender restarts at nought, which is outside the window, so the retransmission is recognised as old and dropped. That is the whole difference, one number of margin.

> Caption: A window of 4 is safe, because the receiver window becomes 4, 5, 6, 7 and stops short of 0.

Exam-trap caption mode adds: *Confusing this with Go-Back-N, where the receiver window is one frame and the margin is one number.*

**3:52–4:00** — So the safe window is half the space. For two, three, four and five bits that is two, four, eight, sixteen. And the computed first failure is three, five, nine, seventeen: always one more than the safe value.

> Caption: So the bound is two-to-the-m minus one: 2, 4, 8, 16 for two, three, four and five bits, and the first failing window is one more.

Exam-trap caption mode adds: *Writing two to the m minus one as the Selective Repeat bound. That is Go-Back-N; Selective Repeat is two to the m minus one, the exponent.*

## Scene 9. What the receiver buffer costs, and what it saves

*4:00 – 4:30 · objective: Compare the two protocols on transmissions, buffering and elapsed time, and read the window requirement from the bandwidth-delay product.*

**4:00–4:07** — Put the two side by side. One loss in twelve frames. Go-back-N pays four extra transmissions at window four and eight extra at window eight. Selective Repeat pays one, at either window. The gap widens with the window.

> Caption: One loss, twelve frames: Go-Back-N transmits 17 at window 4 and 21 at window 8; Selective Repeat transmits 13 at both.

Exam-trap caption mode adds: *Comparing the two protocols on an error-free link. There they are identical, because the formula does not mention which protocol you are running.*

**4:07–4:15** — Time as well as count. At window four, twenty-four frame times against twenty-three. At window eight, twenty-four against twenty. Go-back-N wastes slots on frames that already arrived, and the waste grows with the window.

> Caption: Elapsed time differs too: 24 against 23 at window 4, and 24 against 20 at window 8, in transmission times.

Exam-trap caption mode adds: *Reporting the count and the time as the same quantity. A retransmission costs one slot of the link, which is time as well as bandwidth.*

**4:15–4:22** — And the window is still the bandwidth-delay product. Our twenty-one-frame pipe needs twenty-one frames of window, which needs five sequence bits under go-back-N and six under Selective Repeat. Window and field width are one question asked twice.

> Caption: The window you need is still the bandwidth-delay product, and it decides whether the sequence field is wide enough.

Exam-trap caption mode adds: *Choosing the field width from the window without checking the bound. A window of 21 does not fit in four bits under either protocol.*

**4:22–4:30** — So how do you choose? On a clean link, either: the formula is the same and the simpler one is cheaper. On a lossy link, Selective Repeat, because each loss costs one frame. On a receiver with no memory, Go-Back-N, and accept the retransmissions.

> Caption: Choose by what the link is like: clean links make the two identical, lossy links favour Selective Repeat, memory-poor receivers favour Go-Back-N.

Exam-trap caption mode adds: *Answering a "which protocol" question with an efficiency comparison. Efficiency on an error-free link cannot distinguish them.*

## Scene 10. The four steps, and the traps that break them

*4:30 – 5:00 · objective: Run a four-line procedure on any question in this family, and name the five traps by sight.*

**4:30–4:37** — Four lines and you are done. Transmission time, propagation time, the ratio, then substitute. Write them down in that order and the question stops being a network question and becomes arithmetic.

> Caption: Four lines: Tt, then Tp, then a and one plus two a, then substitute.

Exam-trap caption mode adds: *Skipping to the formula. Almost every error in this family is in the first two lines, in units.*

**4:37–4:45** — Three traps by sight. Doubling a delay the question already gave as a round trip. Mixing bytes and bits. And dropping the plus one, which turns twenty-one into twenty.

> Caption: Trap one: doubling the one-way delay twice. Trap two: bytes against bits. Trap three: forgetting the plus one.

Exam-trap caption mode adds: *All three produce numbers that appear among the options, which is why they survive a careless check.*

**4:45–4:52** — Two more. Go-back-N gets one less than the whole space; Selective Repeat gets half of it. And a bigger window does not always mean fewer transmissions: under go-back-N on a lossy link it means more, because each loss resends the whole window.

> Caption: Trap four: giving Go-Back-N the Selective Repeat bound. Trap five: assuming a bigger window always transmits less.

Exam-trap caption mode adds: *Both bounds contain a minus one. One is in the base, the other in the exponent, and they are not interchangeable.*

**4:52–5:00** — One habit covers the family. Before computing, write the quantity the question wants: an efficiency, a window, a number of bits, or a count of transmissions. Each has its own sanity check, and every trap in this lesson fails one of them.

> Caption: Write down which quantity the question wants — efficiency, window, bits or transmissions — and the five traps cannot survive.

Exam-trap caption mode adds: *Answering with the intermediate you computed rather than the quantity asked for. It is the most common lost mark in this family.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
