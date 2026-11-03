# SMTP, FTP and Email: the three application protocols the 2027 clause dropped — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/smtp-ftp-and-email/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. The clause that changed

*0:00 – 0:30 · objective: State which application protocols the 2027 syllabus names and which three it dropped, and name the three questions that survive the change.*

**0:00–0:07** — Start with what changed. In 2026 this clause named five application protocols. In 2027 it names two, DNS and HTTP. That is a fact about the printed syllabus, not a guess about the paper.

> Caption: The 2026 syllabus named five application protocols. The 2027 syllabus names two.

Exam-trap caption mode adds: *A topic leaving the printed syllabus is not the same as the layer disappearing. DNS and HTTP still sit on top of the same transport.*

**0:07–0:15** — The three that left are not obsolete. They are the three jobs this layer does: one protocol sends a message, one moves a file, one lets you read a mailbox that lives somewhere else.

> Caption: The three that left are still the three jobs of the application layer: send, move a file, fetch a mailbox.

Exam-trap caption mode adds: *Do not treat the removal as a statement that the protocols are wrong or replaced. They are the same protocols; only the printed clause is shorter.*

**0:15–0:22** — So label this lesson honestly. For 2027 it is class C: useful extension, not a named clause. That is why it is worth one careful hour and not five.

> Caption: For 2027 this lesson is class C: outside the named clause, inside the same layer.

Exam-trap caption mode adds: *A class C lesson is not a licence to skip the layer. TCP, DNS and HTTP carry the marks, and they are taught in their own lessons.*

**0:22–0:30** — What survives is three questions, and they are the same three that carry DNS and HTTP. Who opens the connection. How many round trips does the dialog cost. How many bytes does the message take. Hold those three and the rest is bookkeeping.

> Caption: Three questions survive the change: who opens the connection, how many round trips, how many bytes.

Exam-trap caption mode adds: *A question that asks for connections is not asking for round trips. The two numbers differ in every protocol here.*

## Scene 2. The mail chain, one hop at a time

*0:30 – 1:00 · objective: Place the mail user agent, submission server, transfer agents and mailbox in order, with the port each hop uses.*

**0:30–0:37** — A message begins in a client program, the mail user agent. It submits the message to a server on port five-eight-seven. That first server authenticates you and checks the message, and only then queues it.

> Caption: The client composes in a mail user agent and submits to a submission server on port 587.

Exam-trap caption mode adds: *Port 25 and port 587 both speak SMTP. They differ in who is allowed to use them: 25 is server to server, 587 is a user submitting.*

**0:37–0:45** — Then the message travels. Each hop from one server to the next is a single SMTP session on port twenty-five, and each session is one TCP connection.

> Caption: Each hop between two servers is one SMTP session on port 25, and one TCP connection.

Exam-trap caption mode adds: *A hop is not a recipient. Three recipients on one server are one session, because one session can carry several recipient commands.*

**0:45–0:52** — Count them. One submission and two relays is three sessions. Each server that accepts the message adds one Received header at the top, so a message that crossed three servers carries three, newest first.

> Caption: A submission and two relays make three sessions, and each receiving server adds one Received header.

Exam-trap caption mode adds: *The header count tracks receiving servers, not senders, and not the number of recipients.*

**0:52–1:00** — At the end, a delivery agent writes the message into a mailbox. The recipient then reads it with a different protocol entirely: POP3 on one-ten, or IMAP on one-forty-three. Sending and fetching are separate.

> Caption: The last server hands the message to a mailbox, and the client fetches it on 110 or 143.

Exam-trap caption mode adds: *A client that sends with SMTP does not receive with SMTP. Retrieval is always POP3, IMAP, or a web page.*

## Scene 3. One SMTP session, command by command

*1:00 – 1:30 · objective: Trace a whole SMTP delivery and read each reply code as it arrives.*

**1:00–1:07** — Watch one session. The server speaks first with two-two-zero, meaning ready. The client answers EHLO, and the server replies two-five-zero with the list of extensions it supports.

> Caption: The server greets with 220. The client says EHLO and is told what the server can do, answered 250.

Exam-trap caption mode adds: *The server speaks first in SMTP, unlike HTTP. A question that says the client opens the conversation is describing the wrong protocol.*

**1:07–1:15** — Then the envelope. MAIL FROM names the sender and is answered two-five-zero. RCPT TO names one recipient, and you repeat it once per recipient, each answered two-five-zero.

> Caption: MAIL FROM names the sender and RCPT TO names one recipient each. Both are answered 250.

Exam-trap caption mode adds: *Repeating RCPT is not a second transaction. The transaction began at MAIL FROM and ends after the message body.*

**1:15–1:22** — DATA gets three-five-four, the only intermediate code in the base protocol. It means: send the message now. The message ends with a line holding one dot, and a real line that starts with a dot is doubled so it cannot be confused with the end.

> Caption: DATA earns 354, the one intermediate reply: send the message, and end it with a line holding a single dot.

Exam-trap caption mode adds: *354 is not an error and not a success. It is the only 3xx in base SMTP, and the message has not been accepted yet when it arrives.*

**1:22–1:30** — The final dot earns two-five-zero, and that is the moment the server takes responsibility. QUIT earns two-two-one. Six exchanges, plus one for each recipient.

> Caption: The dot earns 250 and QUIT earns 221. Six exchanges, plus one per recipient.

Exam-trap caption mode adds: *The greeting is not a round trip the client pays for: the server volunteers it on connect. Count the handshake instead.*

## Scene 4. The arithmetic: six plus one per recipient

*1:30 – 2:00 · objective: Count the round trips of one SMTP session, and separate that count from the connection count.*

**1:30–1:37** — Write the six down, because the exam counts them. Handshake one, EHLO two, MAIL three, DATA four, the body five, QUIT six. Six round trips before a single recipient.

> Caption: Handshake, EHLO, MAIL, DATA, body, QUIT: six round trips before any recipient is counted.

Exam-trap caption mode adds: *Folding the handshake into the first command undercounts by one, which is exactly the sort of number that appears among the options.*

**1:37–1:45** — Each recipient is one more command and one more reply, so one more round trip. One recipient is seven. Three is nine. Five is eleven. The formula is six plus r.

> Caption: One round trip per recipient: one recipient gives seven, three give nine, five give eleven.

Exam-trap caption mode adds: *A recipient who is refused still costs a round trip. The reply may be a failure, but the exchange happened.*

**1:45–1:52** — Here is the separation that matters. Connections stay at one, however many recipients there are. Recipients lengthen the dialog; they never open a second connection.

> Caption: Connections stay at one. More recipients do not open more connections.

Exam-trap caption mode adds: *Mixing the SMTP habit into an HTTP question, or the reverse, is the commonest way to lose a counting mark in this layer.*

**1:52–2:00** — Now the fan-out. Three recipients at three different domains: one submission carrying all three costs nine, then three outbound sessions of seven each. Nine plus twenty-one is thirty round trips, over four connections.

> Caption: Three recipients at three domains: a submission of nine plus three relays of seven is thirty round trips over four connections.

Exam-trap caption mode adds: *The recipients are counted twice in that sum, once in the submission and once in the relays. That is correct: they really are named twice.*

## Scene 5. Envelope against header

*2:00 – 2:30 · objective: Separate the addresses the protocol routes on from the addresses the reader sees.*

**2:00–2:07** — The protocol routes on the envelope. Three To addresses, one Cc and two Bcc make six forward paths, so six RCPT commands, and the server is told six recipients exist.

> Caption: RCPT TO is the envelope: three To, one Cc and two Bcc make six recipient commands.

Exam-trap caption mode adds: *Bcc recipients are hidden from other readers, not from the server. They cost a recipient command like everyone else.*

**2:07–2:15** — Inside the message, the headers show four addresses. The two Bcc addresses appear nowhere, which is exactly what the field is for: six people received it, four are named.

> Caption: The headers show four addresses. Bcc shows none, and that is the whole purpose of the field.

Exam-trap caption mode adds: *Do not conclude that the message reached four people. The header is what the reader sees; the envelope is what the server obeyed.*

**2:15–2:22** — MAIL FROM sets where a bounce goes, and the final server records it as Return-Path. The From header is just what the reader sees. On a mailing list they are usually different addresses.

> Caption: MAIL FROM is where a bounce goes. From: is only what the reader sees, and they may differ.

Exam-trap caption mode adds: *A bounce goes to the envelope sender. Reading a bounce as proof of who wrote the message is a mistake the field invites.*

**2:22–2:30** — In transit a relay adds a Received line and may add nothing else. The final delivery agent adds Return-Path. The envelope it was handed is read-only, and the header grows by one line per hop.

> Caption: A relay may add Received and Return-Path. It must not change the envelope it was given.

Exam-trap caption mode adds: *A forged Received line is possible because any server may add one. A trace is evidence of a claim, not proof of a route.*

## Scene 6. Reply codes decide retry or bounce

*2:30 – 3:00 · objective: Classify a reply by its first digit and act on it: accept, retry, or bounce.*

**2:30–2:37** — Every reply is three digits. The first digit is the class: two means it worked, three means send more, four means try later, five means never again. The text after the number is for humans only.

> Caption: The first digit is the class: two is success, three is intermediate, four is temporary, five is permanent.

Exam-trap caption mode adds: *A 3xx here is not a redirect, as it would be in HTTP. In SMTP it means the server wants more input.*

**2:37–2:45** — Four means the failure may clear, so queue the message and try again. Five means it will not clear, so do not retry: send a bounce to the envelope sender and stop.

> Caption: Four means retry the same message later. Five means do not retry: bounce it to the sender.

Exam-trap caption mode adds: *Retrying a five damages a sender reputation and wastes a queue. Treating a four as final loses mail that would have been delivered.*

**2:45–2:52** — Five messages in a queue. The first is answered two-five-zero and delivered. Four-five-one and four-two-one are both temporary, so both are retried. Five-five-zero and five-five-two are permanent, so both bounce.

> Caption: Five queued messages: 250 accepted, 451 and 421 retried, 550 and 552 bounced.

Exam-trap caption mode adds: *A full mailbox is reported as 552, permanent, while a busy mailbox is 450, temporary. Same words, different class, different action.*

**2:52–3:00** — The second digit says what the code is about: zero syntax, two the connection, five the mail system. Modern servers add an enhanced code such as five point one point one, and its first digit repeats the class.

> Caption: The second digit narrows the reason: zero is syntax, two is connection, five is mail system status.

Exam-trap caption mode adds: *Reading only the enhanced code and ignoring the three-digit code loses nothing here, because the classes agree; reading neither loses everything.*

## Scene 7. FTP: two connections, not one

*3:00 – 3:30 · objective: Count control and data connections and round trips for any number of file transfers.*

**3:00–3:07** — FTP is the protocol with two connections. The first is the control connection on port twenty-one. It stays open for the whole session, and commands and replies travel on it as lines of text.

> Caption: Port 21 carries the commands for the whole session, and it stays open until the client quits.

Exam-trap caption mode adds: *The control connection does not carry file bytes. A question that counts one connection per file has forgotten it.*

**3:07–3:15** — The second connection is opened for the bytes. One transfer, one data connection, closed at the end. A second file means a second data connection, not a reused one.

> Caption: Each transfer opens a second connection for the bytes, and closes it when the transfer ends.

Exam-trap caption mode adds: *A directory listing is a transfer too. LIST and RETR both need a data connection, which is why the count is often one more than the number of files.*

**3:15–3:22** — Now count. The control connection costs three round trips: handshake, user, password. Each transfer costs three more. So one file is two connections and six round trips; five files are six connections and eighteen.

> Caption: One file: two connections, six round trips. Five files: six connections, eighteen round trips.

Exam-trap caption mode adds: *Login happens once, not once per file. Counting it per transfer multiplies the error by the number of files.*

**3:22–3:30** — A question that says three files and a listing is asking about four transfers. Four data connections plus the control connection is five. Three plus twelve is fifteen round trips.

> Caption: Three files and a directory listing: four transfers, so five connections and fifteen round trips.

Exam-trap caption mode adds: *Reading "three files" as three transfers is the trap. Read what the session actually asked for.*

## Scene 8. Who dials the data connection

*3:30 – 4:00 · objective: Distinguish active from passive FTP by the direction of the data connection, and say what state the control connection keeps.*

**3:30–3:37** — Who opens the data connection? In active mode, the client announces a port with the PORT command, and the server dials out to it from port twenty, one below its control port.

> Caption: Active mode: the client sends PORT, and the server dials out from port 20.

Exam-trap caption mode adds: *Active describes the server, not the client. The server is the active opener of the data connection.*

**3:37–3:45** — Passive mode reverses it. The client asks with PASV, the server answers two-two-seven with an address and port, and the client dials out. Both connections now run the same way.

> Caption: Passive mode: the client sends PASV, the server answers 227 with an address, and the client dials.

Exam-trap caption mode adds: *The word passive describes the server, which listens. It does not describe the client, which is the one opening the connection.*

**3:45–3:52** — Why does passive exist? Because a client behind a home router cannot be dialled on an arbitrary port. Passive turns the data connection into an outgoing call, which is why every modern client uses it.

> Caption: Behind a firewall the client cannot be dialled, so passive mode exists to make both connections outgoing.

Exam-trap caption mode adds: *Passive is not more secure. It is more reachable. The control connection is still in clear text in the original protocol.*

**3:52–4:00** — One consequence worth naming. The control connection is stateful. The current directory, the transfer type and the login live on the server for the length of the session, and no other session sees them.

> Caption: The control connection is stateful: the current directory, the transfer type and the login all live on the server.

Exam-trap caption mode adds: *Stateful here means per session. It is not a claim that the protocol keeps state after the connection closes.*

## Scene 9. Seven-bit mail, and what base64 costs

*4:00 – 4:30 · objective: Convert an attachment size to the number of bytes actually sent, using the four-thirds rule and the seventy-six character line.*

**4:00–4:07** — One more reason SMTP has arithmetic. The message body is seven-bit text. A photograph is not text, so before it can be sent it must be turned into characters that survive the channel.

> Caption: Mail data is seven-bit text, so a binary attachment must be encoded before it is sent.

Exam-trap caption mode adds: *Eight-bit extensions exist, but the exam question is almost always the classic seven-bit one, and the encoding answer is base64.*

**4:07–4:15** — Base64 takes three bytes and writes four characters. Each character carries six bits, so four of them carry twenty-four bits, which is three bytes. The size grows by exactly one third.

> Caption: Base64 turns three bytes into four characters, so the size grows by a third.

Exam-trap caption mode adds: *The growth is a third of the original, not a quarter. The ratio is four thirds, which is thirty-three and a third per cent.*

**4:15–4:22** — Take one million bytes. Divided by three and rounded up is three hundred thirty-three thousand three hundred thirty-four groups. Four times that is one million three hundred thirty-three thousand three hundred thirty-six characters, wrapped into seventeen thousand five hundred forty-four lines.

> Caption: One million bytes becomes 1,333,336 characters, in 17,544 lines of at most seventy-six characters.

Exam-trap caption mode adds: *Dividing by three without rounding up loses the tail. The ceiling is what makes the answer odd rather than a clean multiple of four.*

**4:22–4:30** — Each line ends with two bytes, and there are seventeen thousand five hundred forty-four lines. That adds thirty-five thousand and eighty-eight bytes. The wire carries one million three hundred sixty-eight thousand four hundred twenty-four: thirty-six point eight per cent more than the file.

> Caption: Each line carries two more bytes, so 1,368,424 bytes go on the wire: an overhead of 36.8 per cent.

Exam-trap caption mode adds: *Quoting thirty-three per cent answers the encoding and not the transmission. The question decides which one it wants.*

## Scene 10. POP3, IMAP, and the procedure

*4:30 – 5:00 · objective: Choose between download-and-delete and server-side mailboxes by counting bytes, then run the four-step procedure over the whole clause.*

**4:30–4:37** — Now the two ways to read a mailbox. POP3 downloads a message and, by default, deletes it from the server when the session ends. The mailbox then lives on the client machine, and a second device sees nothing.

> Caption: POP3 downloads a message and deletes it from the server. The mailbox then lives on the client.

Exam-trap caption mode adds: *Deletion happens in the update state at the end of the session. A client that disconnects early leaves the mail in place.*

**4:37–4:45** — IMAP does the opposite. The mailbox stays on the server, folders stay on the server, and flags such as seen and deleted are synchronised. Two devices see one mailbox, and a client can fetch headers without fetching bodies.

> Caption: IMAP keeps the mailbox on the server and synchronises flags, so two devices see one mailbox.

Exam-trap caption mode adds: *IMAP is not simply POP3 with more commands. It moves the store to the server, and that is the structural difference.*

**4:45–4:52** — Count the bytes. A hundred messages of twenty thousand bytes each is two million bytes over POP3. Over IMAP, a hundred headers of five hundred bytes plus three bodies is a hundred ten thousand. Eighteen times less.

> Caption: A hundred messages of 20,000 bytes: 2,000,000 bytes by POP3, and 110,000 by IMAP reading headers and three bodies.

Exam-trap caption mode adds: *The IMAP client eventually reads the bodies it opens. The saving is real, but it is proportional to what is opened, not absolute.*

**4:52–5:00** — One habit covers the clause. Name the server and the port from the protocol. Open the connection and say who dials. Run the dialog and count its exchanges. Then count the unit the question asked for, because connections, round trips and bytes are three different answers.

> Caption: Four steps: name the server and its port, open the connection, run the dialog, then count the unit the question asked for.

Exam-trap caption mode adds: *The last step is where marks are lost: the arithmetic is right and the unit is wrong.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
