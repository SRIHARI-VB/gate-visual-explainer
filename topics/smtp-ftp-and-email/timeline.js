/* ==========================================================================
   smtp-ftp-and-email — THE timeline.
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
      id: 'clause',
      n: 1,
      title: 'The clause that changed',
      start: 0, end: 30,
      objective: 'State which application protocols the 2027 syllabus names and which three it dropped, and name the three questions that survive the change.'
    },
    {
      id: 'chain',
      n: 2,
      title: 'The mail chain, one hop at a time',
      start: 30, end: 60,
      objective: 'Place the mail user agent, submission server, transfer agents and mailbox in order, with the port each hop uses.'
    },
    {
      id: 'dialog',
      n: 3,
      title: 'One SMTP session, command by command',
      start: 60, end: 90,
      objective: 'Trace a whole SMTP delivery and read each reply code as it arrives.'
    },
    {
      id: 'cost',
      n: 4,
      title: 'The arithmetic: six plus one per recipient',
      start: 90, end: 120,
      objective: 'Count the round trips of one SMTP session, and separate that count from the connection count.'
    },
    {
      id: 'envelope',
      n: 5,
      title: 'Envelope against header',
      start: 120, end: 150,
      objective: 'Separate the addresses the protocol routes on from the addresses the reader sees.'
    },
    {
      id: 'codes',
      n: 6,
      title: 'Reply codes decide retry or bounce',
      start: 150, end: 180,
      objective: 'Classify a reply by its first digit and act on it: accept, retry, or bounce.'
    },
    {
      id: 'ftp2',
      n: 7,
      title: 'FTP: two connections, not one',
      start: 180, end: 210,
      objective: 'Count control and data connections and round trips for any number of file transfers.'
    },
    {
      id: 'ftpmodes',
      n: 8,
      title: 'Who dials the data connection',
      start: 210, end: 240,
      objective: 'Distinguish active from passive FTP by the direction of the data connection, and say what state the control connection keeps.'
    },
    {
      id: 'mime',
      n: 9,
      title: 'Seven-bit mail, and what base64 costs',
      start: 240, end: 270,
      objective: 'Convert an attachment size to the number of bytes actually sent, using the four-thirds rule and the seventy-six character line.'
    },
    {
      id: 'popimap',
      n: 10,
      title: 'POP3, IMAP, and the procedure',
      start: 270, end: 300,
      objective: 'Choose between download-and-delete and server-side mailboxes by counting bytes, then run the four-step procedure over the whole clause.'
    }
  ],

  events: [

    /* ---------------- scene 1: clause ---------------- */
    {
      id: 'cl-1', scene: 'clause', start: 0, end: 7.5,
      caption: 'The 2026 syllabus named five application protocols. The 2027 syllabus names two.',
      detail: 'Section 10 of the GATE 2026 CS syllabus ended with "Application layer protocols: DNS, SMTP, HTTP, FTP, Email". The 2027 wording, published by IIT Madras, ends the section with "DNS and HTTP". Three of the five names are gone.',
      narration: 'Start with what changed. In 2026 this clause named five application protocols. In 2027 it names two, DNS and HTTP. That is a fact about the printed syllabus, not a guess about the paper.',
      keyword: 'five names, two names',
      trap: 'A topic leaving the printed syllabus is not the same as the layer disappearing. DNS and HTTP still sit on top of the same transport.'
    },
    {
      id: 'cl-2', scene: 'clause', start: 7.5, end: 15,
      caption: 'The three that left are still the three jobs of the application layer: send, move a file, fetch a mailbox.',
      detail: 'SMTP hands a message from one mail server to the next. FTP moves a file between two file systems. POP3 and IMAP let a client read a mailbox that lives on a server. Each one is still the standard answer to its job.',
      narration: 'The three that left are not obsolete. They are the three jobs this layer does: one protocol sends a message, one moves a file, one lets you read a mailbox that lives somewhere else.',
      keyword: 'send, move, fetch',
      trap: 'Do not treat the removal as a statement that the protocols are wrong or replaced. They are the same protocols; only the printed clause is shorter.'
    },
    {
      id: 'cl-3', scene: 'clause', start: 15, end: 22.5,
      caption: 'For 2027 this lesson is class C: outside the named clause, inside the same layer.',
      detail: 'Class A is explicitly in the syllabus, B is a prerequisite for a syllabus topic, C is a useful extension beyond the syllabus, D is outside the exam scope. These three protocols are C for 2027, because the layer they belong to is still examined through DNS and HTTP.',
      narration: 'So label this lesson honestly. For 2027 it is class C: useful extension, not a named clause. That is why it is worth one careful hour and not five.',
      keyword: 'class C',
      trap: 'A class C lesson is not a licence to skip the layer. TCP, DNS and HTTP carry the marks, and they are taught in their own lessons.'
    },
    {
      id: 'cl-4', scene: 'clause', start: 22.5, end: 30,
      caption: 'Three questions survive the change: who opens the connection, how many round trips, how many bytes.',
      detail: 'Every counting question in this lesson is one of those three. Direction decides who dials. Round trips decide the cost of a dialog. Bytes decide what the encoding adds. Nothing else in this clause is arithmetic.',
      narration: 'What survives is three questions, and they are the same three that carry DNS and HTTP. Who opens the connection. How many round trips does the dialog cost. How many bytes does the message take. Hold those three and the rest is bookkeeping.',
      keyword: 'who dials, how many trips, how many bytes',
      trap: 'A question that asks for connections is not asking for round trips. The two numbers differ in every protocol here.'
    },

    /* ---------------- scene 2: chain ---------------- */
    {
      id: 'ch-1', scene: 'chain', start: 30, end: 37.5,
      caption: 'The client composes in a mail user agent and submits to a submission server on port 587.',
      detail: 'The mail user agent is the program a person types in. It hands the message to a submission server, which authenticates the sender and checks the message before queueing it. Port 587 is the submission port; port 25 is the port servers use between themselves.',
      narration: 'A message begins in a client program, the mail user agent. It submits the message to a server on port five-eight-seven. That first server authenticates you and checks the message, and only then queues it.',
      keyword: '587 is submission',
      trap: 'Port 25 and port 587 both speak SMTP. They differ in who is allowed to use them: 25 is server to server, 587 is a user submitting.'
    },
    {
      id: 'ch-2', scene: 'chain', start: 37.5, end: 45,
      caption: 'Each hop between two servers is one SMTP session on port 25, and one TCP connection.',
      detail: 'A mail transfer agent looks up the mail exchanger record for the recipient domain, connects to that server on port 25, and runs one SMTP session. When the next server accepts, it takes responsibility for the message and queues it in turn.',
      narration: 'Then the message travels. Each hop from one server to the next is a single SMTP session on port twenty-five, and each session is one TCP connection.',
      keyword: 'one hop, one session',
      trap: 'A hop is not a recipient. Three recipients on one server are one session, because one session can carry several recipient commands.'
    },
    {
      id: 'ch-3', scene: 'chain', start: 45, end: 52.5,
      caption: 'A submission and two relays make three sessions, and each receiving server adds one Received header.',
      detail: 'RFC 5321 requires a server that accepts a message for relay or delivery to insert a trace field at the top of the message. Three sessions means three receiving servers, so three Received headers, newest at the top.',
      narration: 'Count them. One submission and two relays is three sessions. Each server that accepts the message adds one Received header at the top, so a message that crossed three servers carries three, newest first.',
      keyword: 'three sessions, three headers',
      trap: 'The header count tracks receiving servers, not senders, and not the number of recipients.'
    },
    {
      id: 'ch-4', scene: 'chain', start: 52.5, end: 60,
      caption: 'The last server hands the message to a mailbox, and the client fetches it on 110 or 143.',
      detail: 'The mail delivery agent writes the message into the recipient mailbox. The client then reads it with POP3 on port 110, or IMAP on port 143. Sending and fetching are different protocols in different directions, which is the single most useful fact in this clause.',
      narration: 'At the end, a delivery agent writes the message into a mailbox. The recipient then reads it with a different protocol entirely: POP3 on one-ten, or IMAP on one-forty-three. Sending and fetching are separate.',
      keyword: 'send and fetch are different',
      trap: 'A client that sends with SMTP does not receive with SMTP. Retrieval is always POP3, IMAP, or a web page.'
    },

    /* ---------------- scene 3: dialog ---------------- */
    {
      id: 'dg-1', scene: 'dialog', start: 60, end: 67.5,
      caption: 'The server greets with 220. The client says EHLO and is told what the server can do, answered 250.',
      detail: '220 means the service is ready. EHLO is the extended greeting: the client names itself and the server replies 250 with the list of extensions it supports. The older HELO gets a bare 250 with no list.',
      narration: 'Watch one session. The server speaks first with two-two-zero, meaning ready. The client answers EHLO, and the server replies two-five-zero with the list of extensions it supports.',
      keyword: '220 ready, 250 fine',
      trap: 'The server speaks first in SMTP, unlike HTTP. A question that says the client opens the conversation is describing the wrong protocol.'
    },
    {
      id: 'dg-2', scene: 'dialog', start: 67.5, end: 75,
      caption: 'MAIL FROM names the sender and RCPT TO names one recipient each. Both are answered 250.',
      detail: 'MAIL FROM starts a transaction and clears the three buffers: reverse path, forward path and message data. Each RCPT TO adds one forward path. Both are accepted with 250, or refused with a code that says temporary or permanent.',
      narration: 'Then the envelope. MAIL FROM names the sender and is answered two-five-zero. RCPT TO names one recipient, and you repeat it once per recipient, each answered two-five-zero.',
      keyword: 'one RCPT per recipient',
      trap: 'Repeating RCPT is not a second transaction. The transaction began at MAIL FROM and ends after the message body.'
    },
    {
      id: 'dg-3', scene: 'dialog', start: 75, end: 82.5,
      caption: 'DATA earns 354, the one intermediate reply: send the message, and end it with a line holding a single dot.',
      detail: '354 means start the mail input. The client then sends the message: the headers defined by RFC 5322, a blank line, then the body. A line containing only a period ends the data. A line of text that begins with a period is doubled by the sender so it cannot be mistaken for the end.',
      narration: 'DATA gets three-five-four, the only intermediate code in the base protocol. It means: send the message now. The message ends with a line holding one dot, and a real line that starts with a dot is doubled so it cannot be confused with the end.',
      keyword: '354 means send it now',
      trap: '354 is not an error and not a success. It is the only 3xx in base SMTP, and the message has not been accepted yet when it arrives.'
    },
    {
      id: 'dg-4', scene: 'dialog', start: 82.5, end: 90,
      caption: 'The dot earns 250 and QUIT earns 221. Six exchanges, plus one per recipient.',
      detail: 'After the final dot the server replies 250 only once it has taken responsibility for the message. QUIT is answered 221. Counting the handshake, EHLO, MAIL, DATA, body and QUIT gives six round trips, and each RCPT adds one.',
      narration: 'The final dot earns two-five-zero, and that is the moment the server takes responsibility. QUIT earns two-two-one. Six exchanges, plus one for each recipient.',
      keyword: 'six, plus one each',
      trap: 'The greeting is not a round trip the client pays for: the server volunteers it on connect. Count the handshake instead.'
    },

    /* ---------------- scene 4: cost ---------------- */
    {
      id: 'ct-1', scene: 'cost', start: 90, end: 97.5,
      caption: 'Handshake, EHLO, MAIL, DATA, body, QUIT: six round trips before any recipient is counted.',
      detail: 'One round trip is one request and its reply. The handshake is the first, because a command cannot be sent before the connection exists. EHLO, MAIL, DATA, the message body and QUIT are the other five. Six in all.',
      narration: 'Write the six down, because the exam counts them. Handshake one, EHLO two, MAIL three, DATA four, the body five, QUIT six. Six round trips before a single recipient.',
      keyword: 'six fixed',
      trap: 'Folding the handshake into the first command undercounts by one, which is exactly the sort of number that appears among the options.'
    },
    {
      id: 'ct-2', scene: 'cost', start: 97.5, end: 105,
      caption: 'One round trip per recipient: one recipient gives seven, three give nine, five give eleven.',
      detail: 'The formula is six plus the number of recipient commands. Each RCPT TO is its own request and its own reply, so each costs a round trip. The count grows by one per recipient and never by more.',
      narration: 'Each recipient is one more command and one more reply, so one more round trip. One recipient is seven. Three is nine. Five is eleven. The formula is six plus r.',
      keyword: 'six plus r',
      trap: 'A recipient who is refused still costs a round trip. The reply may be a failure, but the exchange happened.'
    },
    {
      id: 'ct-3', scene: 'cost', start: 105, end: 112.5,
      caption: 'Connections stay at one. More recipients do not open more connections.',
      detail: 'A session is one connection. Adding recipient commands lengthens the dialog inside that connection. This is the opposite of non-persistent HTTP, where every object opens its own connection, and the difference is worth remembering.',
      narration: 'Here is the separation that matters. Connections stay at one, however many recipients there are. Recipients lengthen the dialog; they never open a second connection.',
      keyword: 'one connection, many commands',
      trap: 'Mixing the SMTP habit into an HTTP question, or the reverse, is the commonest way to lose a counting mark in this layer.'
    },
    {
      id: 'ct-4', scene: 'cost', start: 112.5, end: 120,
      caption: 'Three recipients at three domains: a submission of nine plus three relays of seven is thirty round trips over four connections.',
      detail: 'The sending server accepts all three recipients in one submission session, which costs six plus three, that is nine. It then opens one session per destination server, each carrying one recipient and costing seven. Nine plus twenty-one is thirty, over four connections.',
      narration: 'Now the fan-out. Three recipients at three different domains: one submission carrying all three costs nine, then three outbound sessions of seven each. Nine plus twenty-one is thirty round trips, over four connections.',
      keyword: '9 + 3 x 7 = 30',
      trap: 'The recipients are counted twice in that sum, once in the submission and once in the relays. That is correct: they really are named twice.'
    },

    /* ---------------- scene 5: envelope ---------------- */
    {
      id: 'en-1', scene: 'envelope', start: 120, end: 127.5,
      caption: 'RCPT TO is the envelope: three To, one Cc and two Bcc make six recipient commands.',
      detail: 'The envelope is the addressing the protocol routes on. It has one reverse path from MAIL FROM and one forward path per RCPT TO. Three visible To addresses, one Cc and two Bcc give six forward paths, so six RCPT commands.',
      narration: 'The protocol routes on the envelope. Three To addresses, one Cc and two Bcc make six forward paths, so six RCPT commands, and the server is told six recipients exist.',
      keyword: 'six RCPT for six people',
      trap: 'Bcc recipients are hidden from other readers, not from the server. They cost a recipient command like everyone else.'
    },
    {
      id: 'en-2', scene: 'envelope', start: 127.5, end: 135,
      caption: 'The headers show four addresses. Bcc shows none, and that is the whole purpose of the field.',
      detail: 'The message header carries From, To, Cc and optionally Bcc. A sending client normally strips the Bcc field before transmission, so the delivered message shows four addresses where six people received it.',
      narration: 'Inside the message, the headers show four addresses. The two Bcc addresses appear nowhere, which is exactly what the field is for: six people received it, four are named.',
      keyword: 'four named, six delivered',
      trap: 'Do not conclude that the message reached four people. The header is what the reader sees; the envelope is what the server obeyed.'
    },
    {
      id: 'en-3', scene: 'envelope', start: 135, end: 142.5,
      caption: 'MAIL FROM is where a bounce goes. From: is only what the reader sees, and they may differ.',
      detail: 'MAIL FROM sets the reverse path, which is where a non-delivery report is sent, and which is recorded at delivery as Return-Path. The From header is a claim by the author. Mailing lists and bulk senders routinely make them different.',
      narration: 'MAIL FROM sets where a bounce goes, and the final server records it as Return-Path. The From header is just what the reader sees. On a mailing list they are usually different addresses.',
      keyword: 'bounce address is not From',
      trap: 'A bounce goes to the envelope sender. Reading a bounce as proof of who wrote the message is a mistake the field invites.'
    },
    {
      id: 'en-4', scene: 'envelope', start: 142.5, end: 150,
      caption: 'A relay may add Received and Return-Path. It must not change the envelope it was given.',
      detail: 'RFC 5321 says a relay must not modify the envelope addresses or the meaning of the message; it adds trace fields at the top. The final delivery agent adds Return-Path. So the envelope is read-only in transit, and the header grows by one line per hop.',
      narration: 'In transit a relay adds a Received line and may add nothing else. The final delivery agent adds Return-Path. The envelope it was handed is read-only, and the header grows by one line per hop.',
      keyword: 'add trace, change nothing',
      trap: 'A forged Received line is possible because any server may add one. A trace is evidence of a claim, not proof of a route.'
    },

    /* ---------------- scene 6: codes ---------------- */
    {
      id: 'cd-1', scene: 'codes', start: 150, end: 157.5,
      caption: 'The first digit is the class: two is success, three is intermediate, four is temporary, five is permanent.',
      detail: 'Every SMTP reply begins with three digits. The first digit gives the class, the second narrows the category, and the third adds detail. The text after the number is for people; the number is the contract between the two programs.',
      narration: 'Every reply is three digits. The first digit is the class: two means it worked, three means send more, four means try later, five means never again. The text after the number is for humans only.',
      keyword: '2, 3, 4, 5',
      trap: 'A 3xx here is not a redirect, as it would be in HTTP. In SMTP it means the server wants more input.'
    },
    {
      id: 'cd-2', scene: 'codes', start: 157.5, end: 165,
      caption: 'Four means retry the same message later. Five means do not retry: bounce it to the sender.',
      detail: 'A temporary failure is queued and retried, with the standard advising at least thirty minutes between attempts and several days before giving up. A permanent failure must not be retried; the sender generates a non-delivery notification instead.',
      narration: 'Four means the failure may clear, so queue the message and try again. Five means it will not clear, so do not retry: send a bounce to the envelope sender and stop.',
      keyword: '4 retries, 5 bounces',
      trap: 'Retrying a five damages a sender reputation and wastes a queue. Treating a four as final loses mail that would have been delivered.'
    },
    {
      id: 'cd-3', scene: 'codes', start: 165, end: 172.5,
      caption: 'Five queued messages: 250 accepted, 451 and 421 retried, 550 and 552 bounced.',
      detail: '250 is a completion. 451 is a local processing error and 421 is a service that is not available, both temporary. 550 is a mailbox that does not exist and 552 is a mailbox over quota, both permanent in the sense that the same request will fail again.',
      narration: 'Five messages in a queue. The first is answered two-five-zero and delivered. Four-five-one and four-two-one are both temporary, so both are retried. Five-five-zero and five-five-two are permanent, so both bounce.',
      keyword: '1 accepted, 2 retried, 2 bounced',
      trap: 'A full mailbox is reported as 552, permanent, while a busy mailbox is 450, temporary. Same words, different class, different action.'
    },
    {
      id: 'cd-4', scene: 'codes', start: 172.5, end: 180,
      caption: 'The second digit narrows the reason: zero is syntax, two is connection, five is mail system status.',
      detail: 'Within a class, the second digit names the subject. 5.0 is a syntax problem, 5.2 is a connection problem, 5.5 is the mail system. Enhanced status codes such as 5.1.1 add a third level, and the first of those three repeats the class.',
      narration: 'The second digit says what the code is about: zero syntax, two the connection, five the mail system. Modern servers add an enhanced code such as five point one point one, and its first digit repeats the class.',
      keyword: 'second digit names the subject',
      trap: 'Reading only the enhanced code and ignoring the three-digit code loses nothing here, because the classes agree; reading neither loses everything.'
    },

    /* ---------------- scene 7: ftp2 ---------------- */
    {
      id: 'f2-1', scene: 'ftp2', start: 180, end: 187.5,
      caption: 'Port 21 carries the commands for the whole session, and it stays open until the client quits.',
      detail: 'The control connection is a long-lived TCP connection on port 21. Commands and replies travel on it as lines of text, following the Telnet conventions. Login, changing directory and choosing a transfer type all happen here.',
      narration: 'FTP is the protocol with two connections. The first is the control connection on port twenty-one. It stays open for the whole session, and commands and replies travel on it as lines of text.',
      keyword: '21 is control',
      trap: 'The control connection does not carry file bytes. A question that counts one connection per file has forgotten it.'
    },
    {
      id: 'f2-2', scene: 'ftp2', start: 187.5, end: 195,
      caption: 'Each transfer opens a second connection for the bytes, and closes it when the transfer ends.',
      detail: 'The data connection is opened for one transfer: a file in either direction, or a directory listing. When the transfer finishes the server closes it. A new transfer means a new data connection.',
      narration: 'The second connection is opened for the bytes. One transfer, one data connection, closed at the end. A second file means a second data connection, not a reused one.',
      keyword: 'one data connection per transfer',
      trap: 'A directory listing is a transfer too. LIST and RETR both need a data connection, which is why the count is often one more than the number of files.'
    },
    {
      id: 'f2-3', scene: 'ftp2', start: 195, end: 202.5,
      caption: 'One file: two connections, six round trips. Five files: six connections, eighteen round trips.',
      detail: 'The control connection costs a handshake, a user command and a password command, three round trips. Each transfer costs a passive-mode request, the data handshake and the transfer with its completion, three more. So n transfers cost one plus n connections and three plus three n round trips.',
      narration: 'Now count. The control connection costs three round trips: handshake, user, password. Each transfer costs three more. So one file is two connections and six round trips; five files are six connections and eighteen.',
      keyword: '1 + n connections, 3 + 3n trips',
      trap: 'Login happens once, not once per file. Counting it per transfer multiplies the error by the number of files.'
    },
    {
      id: 'f2-4', scene: 'ftp2', start: 202.5, end: 210,
      caption: 'Three files and a directory listing: four transfers, so five connections and fifteen round trips.',
      detail: 'Three RETR commands and one LIST command are four transfers. Each opens a data connection, and the control connection is the fifth. Three plus three times four is fifteen round trips.',
      narration: 'A question that says three files and a listing is asking about four transfers. Four data connections plus the control connection is five. Three plus twelve is fifteen round trips.',
      keyword: 'the listing counts',
      trap: 'Reading "three files" as three transfers is the trap. Read what the session actually asked for.'
    },

    /* ---------------- scene 8: ftpmodes ---------------- */
    {
      id: 'fm-1', scene: 'ftpmodes', start: 210, end: 217.5,
      caption: 'Active mode: the client sends PORT, and the server dials out from port 20.',
      detail: 'In active mode the client opens a port and tells the server its address and port with the PORT command. The server then initiates the data connection from its own port 20 to that port. The default server data port is one below the control port, which is why it is 20.',
      narration: 'Who opens the data connection? In active mode, the client announces a port with the PORT command, and the server dials out to it from port twenty, one below its control port.',
      keyword: 'server dials in active',
      trap: 'Active describes the server, not the client. The server is the active opener of the data connection.'
    },
    {
      id: 'fm-2', scene: 'ftpmodes', start: 217.5, end: 225,
      caption: 'Passive mode: the client sends PASV, the server answers 227 with an address, and the client dials.',
      detail: 'In passive mode the server listens on a high port and returns that address in a 227 reply. The client then opens the data connection to it. Both connections now run in the same direction, client to server.',
      narration: 'Passive mode reverses it. The client asks with PASV, the server answers two-two-seven with an address and port, and the client dials out. Both connections now run the same way.',
      keyword: 'client dials in passive',
      trap: 'The word passive describes the server, which listens. It does not describe the client, which is the one opening the connection.'
    },
    {
      id: 'fm-3', scene: 'ftpmodes', start: 225, end: 232.5,
      caption: 'Behind a firewall the client cannot be dialled, so passive mode exists to make both connections outgoing.',
      detail: 'A client behind a network address translation cannot accept an incoming connection on an arbitrary port. Passive mode turns the data connection into an outgoing call, which is why it is the default in modern clients.',
      narration: 'Why does passive exist? Because a client behind a home router cannot be dialled on an arbitrary port. Passive turns the data connection into an outgoing call, which is why every modern client uses it.',
      keyword: 'both connections outgoing',
      trap: 'Passive is not more secure. It is more reachable. The control connection is still in clear text in the original protocol.'
    },
    {
      id: 'fm-4', scene: 'ftpmodes', start: 232.5, end: 240,
      caption: 'The control connection is stateful: the current directory, the transfer type and the login all live on the server.',
      detail: 'RFC 959 requires the server to remember the transfer parameters between commands: the last specified type, structure and mode, and the current directory. The state is per session, so two clients do not share it.',
      narration: 'One consequence worth naming. The control connection is stateful. The current directory, the transfer type and the login live on the server for the length of the session, and no other session sees them.',
      keyword: 'state lives on the server',
      trap: 'Stateful here means per session. It is not a claim that the protocol keeps state after the connection closes.'
    },

    /* ---------------- scene 9: mime ---------------- */
    {
      id: 'mi-1', scene: 'mime', start: 240, end: 247.5,
      caption: 'Mail data is seven-bit text, so a binary attachment must be encoded before it is sent.',
      detail: 'RFC 5321 says mail data may contain any of the 128 ASCII characters, and advises against control characters. An image or a program is not text, so MIME encodes it into characters that survive the channel.',
      narration: 'One more reason SMTP has arithmetic. The message body is seven-bit text. A photograph is not text, so before it can be sent it must be turned into characters that survive the channel.',
      keyword: 'seven-bit text only',
      trap: 'Eight-bit extensions exist, but the exam question is almost always the classic seven-bit one, and the encoding answer is base64.'
    },
    {
      id: 'mi-2', scene: 'mime', start: 247.5, end: 255,
      caption: 'Base64 turns three bytes into four characters, so the size grows by a third.',
      detail: 'Sixty-four symbols carry six bits each, so four characters carry twenty-four bits, which is three bytes. The encoded length is four times the ceiling of the byte count divided by three, padded with equals signs to a multiple of four.',
      narration: 'Base64 takes three bytes and writes four characters. Each character carries six bits, so four of them carry twenty-four bits, which is three bytes. The size grows by exactly one third.',
      keyword: '3 bytes become 4 characters',
      trap: 'The growth is a third of the original, not a quarter. The ratio is four thirds, which is thirty-three and a third per cent.'
    },
    {
      id: 'mi-3', scene: 'mime', start: 255, end: 262.5,
      caption: 'One million bytes becomes 1,333,336 characters, in 17,544 lines of at most seventy-six characters.',
      detail: 'One million divided by three is 333,333 and a third, so the ceiling is 333,334 groups, and four times that is 1,333,336 characters. MIME wraps base64 at seventy-six characters per line, and 1,333,336 divided by 76 is 17,543.9, so 17,544 lines.',
      narration: 'Take one million bytes. Divided by three and rounded up is three hundred thirty-three thousand three hundred thirty-four groups. Four times that is one million three hundred thirty-three thousand three hundred thirty-six characters, wrapped into seventeen thousand five hundred forty-four lines.',
      keyword: '1,333,336 characters',
      trap: 'Dividing by three without rounding up loses the tail. The ceiling is what makes the answer odd rather than a clean multiple of four.'
    },
    {
      id: 'mi-4', scene: 'mime', start: 262.5, end: 270,
      caption: 'Each line carries two more bytes, so 1,368,424 bytes go on the wire: an overhead of 36.8 per cent.',
      detail: 'Each of the 17,544 lines ends with a carriage return and a line feed, adding 35,088 bytes. The total is 1,368,424 bytes for a one-million-byte attachment, an overhead of 36.84 per cent, of which a third is the encoding and the rest is the line ends.',
      narration: 'Each line ends with two bytes, and there are seventeen thousand five hundred forty-four lines. That adds thirty-five thousand and eighty-eight bytes. The wire carries one million three hundred sixty-eight thousand four hundred twenty-four: thirty-six point eight per cent more than the file.',
      keyword: '1,368,424 bytes',
      trap: 'Quoting thirty-three per cent answers the encoding and not the transmission. The question decides which one it wants.'
    },

    /* ---------------- scene 10: popimap ---------------- */
    {
      id: 'pi-1', scene: 'popimap', start: 270, end: 277.5,
      caption: 'POP3 downloads a message and deletes it from the server. The mailbox then lives on the client.',
      detail: 'POP3 has three states: authorisation, transaction and update. The update state is where deletions are committed when the client quits. The default behaviour moves mail off the server, so a second device sees an empty mailbox.',
      narration: 'Now the two ways to read a mailbox. POP3 downloads a message and, by default, deletes it from the server when the session ends. The mailbox then lives on the client machine, and a second device sees nothing.',
      keyword: 'download and delete',
      trap: 'Deletion happens in the update state at the end of the session. A client that disconnects early leaves the mail in place.'
    },
    {
      id: 'pi-2', scene: 'popimap', start: 277.5, end: 285,
      caption: 'IMAP keeps the mailbox on the server and synchronises flags, so two devices see one mailbox.',
      detail: 'IMAP stores messages on the server, keeps folders there, and synchronises flags such as seen, answered and deleted. A client can fetch a header list and then fetch only the bodies it opens, which is where the byte saving comes from.',
      narration: 'IMAP does the opposite. The mailbox stays on the server, folders stay on the server, and flags such as seen and deleted are synchronised. Two devices see one mailbox, and a client can fetch headers without fetching bodies.',
      keyword: 'one mailbox, many clients',
      trap: 'IMAP is not simply POP3 with more commands. It moves the store to the server, and that is the structural difference.'
    },
    {
      id: 'pi-3', scene: 'popimap', start: 285, end: 292.5,
      caption: 'A hundred messages of 20,000 bytes: 2,000,000 bytes by POP3, and 110,000 by IMAP reading headers and three bodies.',
      detail: 'POP3 transfers every body once: one hundred times twenty thousand is two million bytes. IMAP transfers one hundred headers of five hundred bytes, fifty thousand, plus three bodies of twenty thousand, sixty thousand, giving one hundred ten thousand. The ratio is about eighteen to one.',
      narration: 'Count the bytes. A hundred messages of twenty thousand bytes each is two million bytes over POP3. Over IMAP, a hundred headers of five hundred bytes plus three bodies is a hundred ten thousand. Eighteen times less.',
      keyword: '2,000,000 against 110,000',
      trap: 'The IMAP client eventually reads the bodies it opens. The saving is real, but it is proportional to what is opened, not absolute.'
    },
    {
      id: 'pi-4', scene: 'popimap', start: 292.5, end: 300,
      caption: 'Four steps: name the server and its port, open the connection, run the dialog, then count the unit the question asked for.',
      detail: 'Every item in this clause is one of those four. Name the server from the protocol, never from memory of the port alone. Count connections and round trips as separate quantities. And check whether the question wants bytes on the wire or bytes in the file.',
      narration: 'One habit covers the clause. Name the server and the port from the protocol. Open the connection and say who dials. Run the dialog and count its exchanges. Then count the unit the question asked for, because connections, round trips and bytes are three different answers.',
      keyword: 'name, open, run, count',
      trap: 'The last step is where marks are lost: the arithmetic is right and the unit is wrong.'
    }
  ]
};
