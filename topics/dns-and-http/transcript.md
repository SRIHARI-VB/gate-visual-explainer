# Dns And Http — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/dns-and-http/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A name is not an address

*0:00 – 0:30 · objective: State what DNS is for, and read a domain name right to left as a path through the delegation tree.*

**0:00–0:07** — You type a name. The network cannot route a name; it routes to an address. So before anything else can happen, the name has to become a number, and the service that does this is DNS.

> Caption: The browser holds a name; the network needs an address. DNS is the lookup that turns one into the other.

Exam-trap caption mode adds: *DNS is not the web. It is a general name service, and it is also what lets a mail server be found by name.*

**0:07–0:15** — Read the name backwards. The rightmost label, in, is the top-level domain. The next one, org, is a zone inside it. Then gate, a zone inside that. The leftmost label, www, is usually a host, not a zone of its own.

> Caption: A name is read right to left: the last label is the top-level domain, and each label is a delegation.

Exam-trap caption mode adds: *The dots separate labels; a name with four labels is not automatically four delegations. www is usually a host inside the gate.org.in zone.*

**0:15–0:22** — Your machine does not walk the tree itself. A small stub sends the question to one resolver, and that resolver does the walking, on your behalf, and remembers the answers.

> Caption: The stub on your machine asks one resolver. The resolver is the part that walks the tree.

Exam-trap caption mode adds: *The hop from your host to its resolver costs a round trip too. Whether a question counts it depends on where the question says the resolver sits.*

**0:22–0:30** — With an empty cache the resolver visits every level. With a warm cache the answer is already in hand, and the whole tree is skipped. That difference is the difference between a slow first visit and a fast second one.

> Caption: Cold, the walk visits every level. Warm, the first cached record ends the walk early.

Exam-trap caption mode adds: *A cached answer is only usable until its time to live expires. After that the walk starts again.*

## Scene 2. Iterative and recursive resolution, counted

*0:30 – 1:00 · objective: Distinguish an iterative referral from a recursive hand-off, and count the servers asked for a name.*

**0:30–0:37** — Iterative means the resolver does the walking. It asks the root, and the root replies with a referral: not the address, but the name of the server for in. The resolver asks that server and gets another referral. Only the last one answers.

> Caption: In an iterative query the resolver asks each server itself and receives a referral, not an answer.

Exam-trap caption mode adds: *A referral is a correct answer to a different question. Treating it as the address is the classic misreading.*

**0:37–0:45** — Recursive means one server does the walking. You ask, and the server returns the address, having done all the intermediate asking itself. From the client there is one question and one answer.

> Caption: In a recursive query the resolver hands the whole job to one server, which returns the final address.

Exam-trap caption mode adds: *The two modes are not faster or slower by definition. What changes is who spends the queries.*

**0:45–0:52** — This is GATE 2022. Resolving www.gate.org.in iteratively, with no cache, takes four query-response pairs: the root, the in server, the org.in server, and the authoritative server for gate.org.in. Four, and the question is a one-mark numerical.

> Caption: Count the servers asked, not the labels: for www.gate.org.in that is the root, in, org.in and gate.org.in, four pairs.

Exam-trap caption mode adds: *Counting labels gives four here by luck. A name like www.example.com has three labels and three pairs, because www is a host and not a zone.*

**0:52–1:00** — One more pair exists when your host and the resolver are different machines. GATE 2023 says the local DNS server runs on the local host, so that hop is free and the hierarchy alone decides the count. The question always tells you where the resolver sits.

> Caption: Add one pair only when the host and the resolver are different machines — and read the question to see which it is.

Exam-trap caption mode adds: *Adding the host-to-resolver pair when the question puts the resolver on the host turns a correct four into a wrong five.*

## Scene 3. Resource records and the TTL

*1:00 – 1:30 · objective: Read a resource record as name, type, class, TTL and value, and see why the TTL is what makes DNS cheap.*

**1:00–1:07** — A record has five parts. The name it describes, the type, the class, which is internet in every question you will see, a time to live in seconds, and the value. The type is what makes the value readable.

> Caption: A resource record is five fields: name, type, class, time to live, and value.

Exam-trap caption mode adds: *The TTL is not a timeout for the query. It is the lifetime of the answer in a cache.*

**1:07–1:15** — The types you must recognise: A is an IPv4 address, AAAA is IPv6, NS says which server runs a zone, MX says where mail for the domain goes with a preference number, and CNAME says this name is an alias for another name.

> Caption: A gives an IPv4 address, AAAA an IPv6 address, NS names a zone server, MX a mail server, CNAME an alias.

Exam-trap caption mode adds: *A CNAME is not an address. It sends the resolver off to resolve a second name, which costs another lookup.*

**1:15–1:22** — The time to live is a budget. With three hundred seconds, a cache may answer from memory for five minutes, and then it must ask again. Short values track changes quickly, long values save queries. That is the whole trade.

> Caption: A TTL of 300 seconds means at most one lookup per 300 seconds per cache; the record counts down as it sits.

Exam-trap caption mode adds: *Two caches can hold the same record with different remaining lifetimes. The TTL is counted down, not reset, at each cache.*

**1:22–1:30** — Two boundaries. A CNAME may not share a name with any other record, because the alias would hide it. And a name that does not exist is cached as a negative answer, so a mistyped address does not hammer the servers. Both are one-line facts that turn into one-mark questions.

> Caption: A CNAME cannot sit beside other records at the same name, and a missing name is cached too, as a negative answer.

Exam-trap caption mode adds: *A negative answer is still an answer. A cache hit on "no such name" is a hit, not a miss.*

## Scene 4. The DNS message: twelve bytes, then the question

*1:30 – 2:00 · objective: Lay out a DNS query byte by byte, and explain the 512-byte UDP limit and the TCP fallback.*

**1:30–1:37** — The header is twelve bytes and always the same shape. Two bytes of identifier, so a reply can be matched to its query. Two bytes of flags, where the recursion-desired and truncation bits live. Then four counters, each two bytes, for the four sections that may follow.

> Caption: Every DNS message starts with a twelve-byte header: identifier, flags, and four counts.

Exam-trap caption mode adds: *The counts are for sections, not for records in a single list. A referral puts nothing in the answer section and its servers in the authority section.*

**1:37–1:45** — The name is not stored as text with dots. Each label carries its own length byte in front, and a zero byte closes the name. Four plus five plus four plus three plus one: seventeen bytes. Add two for the type and two for the class, and with the header the whole query is thirty-three bytes.

> Caption: The question encodes the name as length-prefixed labels, so www.gate.org.in takes 17 bytes before the type.

Exam-trap caption mode adds: *The dots are not transmitted. Counting the characters of the name as its wire length is wrong by one byte per label plus the terminator.*

**1:45–1:52** — The classic limit for a DNS answer over UDP is five hundred and twelve bytes. If the answer does not fit, the server sets one bit, the truncation bit, and the client asks again over TCP. That is why DNS uses both transports.

> Caption: A classic UDP answer is capped at 512 bytes; the truncation bit sends the client back over TCP.

Exam-trap caption mode adds: *The truncation bit means the answer was cut, not that the name does not exist. Retrying over TCP is the correct response.*

**1:52–2:00** — Here is the arithmetic a question can ask for. Five hundred and twelve minus twelve minus seventeen minus four leaves four hundred and seventy-nine. Each address record, with a compressed name, is sixteen bytes. Four hundred and seventy-nine over sixteen is twenty-nine point nine, so twenty-nine records fit and the thirtieth does not.

> Caption: In the 479 bytes left of a 512-byte answer, a sixteen-byte A record fits 29 times.

Exam-trap caption mode adds: *Forgetting the two-byte compression pointer makes each record eighteen bytes and gives a different count.*

## Scene 5. HTTP: one request, one response, over TCP

*2:00 – 2:30 · objective: Read an HTTP request and response line by line, and place the methods and status codes in their families.*

**2:00–2:07** — A request is three words on the first line: the method, the target and the version. Then headers, one per line, until a blank line. The Host header is required in version 1.1, because one address can serve many names, and the server has to know which one you meant.

> Caption: An HTTP request is a method, a target and a version, then headers, then an optional body.

Exam-trap caption mode adds: *Without Host, a server holding several sites cannot tell them apart. That is why 1.1 made it mandatory.*

**2:07–2:15** — Two properties, not one. Safe means it changes nothing: GET and HEAD. Idempotent means doing it twice is the same as doing it once: that adds PUT and DELETE. POST is neither safe nor idempotent, which is exactly why a resubmitted form can create a second order.

> Caption: GET and HEAD are safe; GET, HEAD, PUT and DELETE are idempotent; POST is neither.

Exam-trap caption mode adds: *Safe and idempotent are different questions. PUT is idempotent and not safe. Confusing the two is the standard slip.*

**2:15–2:22** — The response starts with a status code. Two hundred and something means it worked. Three hundred means look somewhere else or use what you have. Four hundred means the request was wrong. Five hundred means the server failed. The first digit alone answers most questions.

> Caption: The response begins with a status code: 2xx worked, 3xx look elsewhere, 4xx your fault, 5xx the server.

Exam-trap caption mode adds: *304 is a success with no body, not an error. It says your cached copy is still good.*

**2:22–2:30** — One request per object, always. A page with five images is six objects and six requests. In non-persistent mode each request gets its own connection, so GATE 2020 answers six. The count of requests never changes; only the count of connections does.

> Caption: A browser needs one request per object: the page and its five images are six requests and, in 1.0, six connections.

Exam-trap caption mode adds: *The HTML page is an object too. Counting only the five images gives five, and the answer is six.*

## Scene 6. HTTP keeps no memory; cookies carry the state

*2:30 – 3:00 · objective: Explain statelessness, and show how Set-Cookie and Cookie turn two unrelated requests into one session.*

**2:30–2:37** — Stateless means the protocol remembers nothing. The second request looks exactly like the first, from a stranger. That is what lets one server serve millions of clients, and it is also why a login would be impossible without something extra.

> Caption: HTTP is stateless: the second request carries no memory of the first.

Exam-trap caption mode adds: *Stateless is a property of the protocol, not of the server. A server may keep state; HTTP does not carry it for you.*

**2:37–2:45** — The fix is a header. In a response the server sends Set-Cookie. The browser stores that name and value against the site, and from then on attaches it to every request to that site. The state now lives in the browser, and the protocol stays stateless.

> Caption: The server sends Set-Cookie in a response; the browser returns Cookie in every later request to that site.

Exam-trap caption mode adds: *The cookie goes back to the site that set it, not to every site. Domain and Path decide the scope.*

**2:45–2:52** — A cookie is a string. GATE 2015 asks which statement is not correct, and the wrong one is that a cookie is a piece of code that can compromise your security. It is data. It enables tracking, which is a privacy question, not an execution question.

> Caption: A cookie is text, not code — which is why GATE 2015 calls that option the false one.

Exam-trap caption mode adds: *Privacy and security are different words here. A cookie enables tracking; it does not run.*

**2:52–3:00** — Four attributes carry the marks. Expires or Max-Age gives the lifetime, and without them the cookie dies with the browser session. Domain and Path give the scope. Secure keeps it off plain transport, and HttpOnly hides it from scripts. Each attribute is a one-line fact.

> Caption: Expires or Max-Age decides lifetime; Domain and Path decide scope; Secure and HttpOnly decide who may read it.

Exam-trap caption mode adds: *A session cookie with no expiry is not permanent. It disappears when the browser closes.*

## Scene 7. Non-persistent, persistent and pipelined

*3:00 – 3:30 · objective: Count TCP connections and round trips for the three ways of fetching a page with embedded objects.*

**3:00–3:07** — Non-persistent means the connection dies after each response. Every object pays a handshake and then a request: two round trips each. The browser can hide that by opening several connections at once, and that is what a parallel-connection question is really asking.

> Caption: Non-persistent HTTP: one TCP connection per object, so N objects and the page cost N+1 connections.

Exam-trap caption mode adds: *Parallel connections reduce elapsed time, not the number of connections. Ten objects over five connections is still ten handshakes.*

**3:07–3:15** — Persistent means the connection stays open. The handshake is paid once, for the page, and every later object rides the same connection. Sequentially, each object still costs a round trip, because each request waits for the answer to the one before it.

> Caption: Persistent HTTP keeps the connection open: one handshake for the page, then one round trip per object.

Exam-trap caption mode adds: *Persistence saves the handshake, not the round trips. Sequential persistent HTTP is still slow.*

**3:15–3:22** — Pipelining removes the waiting. The client sends every request back to back, and the server answers in order. All the objects then arrive in one round trip. That is the cheapest arrangement of the three.

> Caption: Pipelining sends the requests back to back, so all the objects come back in one round trip.

Exam-trap caption mode adds: *Pipelining does not reorder responses. They come back in request order, so one slow object still delays the rest.*

**3:22–3:30** — GATE 2026 asks four statements. Persistent connections carry many objects of a page from one server, so A is true. Pipelining sends a request before the previous answer arrives, so C is true. The connection also carries later pages on that same server, so D is true. B is false: a connection ends at one server, and cannot reach a second one.

> Caption: GATE 2026 Set 1: one connection can serve many pages on one server, but never two different servers.

Exam-trap caption mode adds: *One connection, one server. Nothing about persistence lets a single socket reach two addresses.*

## Scene 8. The RTT arithmetic of GATE 2023

*3:30 – 4:00 · objective: Add DNS, handshake and object time in the right order, and check the sum against a simulated clock.*

**3:30–3:37** — GATE 2023 gives you a three-tier hierarchy, a base page and ten objects, and says the resolver is on the local host. So DNS costs three round trips. The base page costs a handshake and a request: two. Now add the objects, and the mode decides how.

> Caption: GATE 2023: three tiers of DNS, one base page, ten objects, one round trip each — add them in order.

Exam-trap caption mode adds: *Fetching the page needs two round trips, not one. The handshake is not free, and the request cannot ride on it in the usual convention.*

**3:37–3:45** — Non-persistent, five connections at a time. Ten objects divide into two rounds, and each round costs two round trips, so four. Three and two and four make nine. That is option C, and it is correct.

> Caption: Non-persistent with five parallel connections: ten objects take two rounds of two round trips, so nine in all.

Exam-trap caption mode adds: *Five parallel connections do not mean two round trips per batch of five objects: each object still pays its own handshake.*

**3:45–3:52** — Persistent with pipelining reuses the connection the page already opened, and sends all ten requests together. One round trip for all ten. Three plus two plus one is six. Option D, also correct.

> Caption: Persistent with pipelining: the connection is already open, so the ten objects cost one round trip, and the total is six.

Exam-trap caption mode adds: *Pipelining saves the handshakes and the waiting, but it cannot save the DNS or the base page. Six is the floor here, not five.*

**3:52–4:00** — Option A says seven, and seven is a real number: it is what ten parallel connections would give, one round instead of two. Option B says five, which forgets the handshake before the base page. Both wrong options are wrong for a specific reason, and naming the reason is faster than recomputing.

> Caption: Seven is what ten parallel connections would give, and five forgets the base page: both options are wrong for a reason.

Exam-trap caption mode adds: *A wrong option in a counting question is usually a right answer to a slightly different question. Find which one.*

## Scene 9. Two caches: DNS TTL and HTTP freshness

*4:00 – 4:30 · objective: Use a cached record and a conditional GET, and see that a 304 still costs a round trip.*

**4:00–4:07** — There are two caches, not one. The resolver keeps records for a time to live. The browser keeps pages and images until they go stale. They have different rules and different lifetimes, and a question usually tells you which one starts empty.

> Caption: Two caches sit in the path: DNS records held for a TTL, and web objects held until they are stale.

Exam-trap caption mode adds: *A warm browser cache does not save the DNS lookup, and a warm DNS cache does not save the download.*

**4:07–4:15** — A conditional request asks a question instead of asking for the file. Here is the date I have, or here is the tag you gave me: has it changed? If not, the server answers three-oh-four and sends no body. You saved the download, and you still paid a round trip.

> Caption: A conditional GET asks whether the copy is still good: If-Modified-Since or If-None-Match.

Exam-trap caption mode adds: *A 304 saves bandwidth, not latency. It is still one request and one response.*

**4:15–4:22** — Max-age is stronger than revalidation. While the copy is fresh, the browser uses it without asking, so both the download and the round trip disappear. Only when the age runs out does it revalidate.

> Caption: Cache-Control with max-age skips the request entirely while the copy is fresh.

Exam-trap caption mode adds: *Fresh and stale are decided by age against max-age, not by whether the page looks different.*

**4:22–4:30** — Three cases, three costs. Fresh: no request at all. Revalidated: one request and no body. Stale: one request and the whole object. A caching question is asking you which case you are in, and the arithmetic is the arithmetic of a single object.

> Caption: So a second visit costs one round trip when fresh, one when revalidated, and a full download when stale.

Exam-trap caption mode adds: *Counting a fresh object as one round trip overstates the cost. Counting a revalidated one as free understates it.*

## Scene 10. The procedure, and the traps that break it

*4:30 – 5:00 · objective: Run the four-step procedure on any question in this clause, and name the five traps by sight.*

**4:30–4:37** — The order is not a convention; it is forced. No address, no connection. No connection, no request. No base page, no list of objects to request. Write the four steps down and the question becomes arithmetic.

> Caption: Four steps: resolve the name, open the connection, request each object, then render.

Exam-trap caption mode adds: *Rendering starts only after the base page arrives. A question that asks for the last byte may be asking about the last object, not the page.*

**4:37–4:45** — Three traps by sight. Counting labels as if each were a delegation. Forgetting that the handshake is a round trip of its own. And believing one connection can reach two servers, which GATE 2026 used as its false statement.

> Caption: Trap one: counting labels as delegations. Trap two: forgetting the handshake. Trap three: one connection across two servers.

Exam-trap caption mode adds: *All three produce a number that appears among the options, which is why they survive a careless check.*

**4:45–4:52** — Two more. A three-oh-four still costs a round trip, so it saves bandwidth and not time. And parallel connections change the elapsed time, never the number of connections: ten objects over five connections is still ten handshakes.

> Caption: Trap four: a 304 is not free. Trap five: parallel connections change time, not the connection count.

Exam-trap caption mode adds: *The question asks for connections or for time. Read which one before computing anything.*

**4:52–5:00** — One habit covers the clause. Before computing, write the unit at the top: pairs, connections, or round trips. Every trap in this lesson is a unit confusion or a missing round trip, and both are visible the moment the unit is written down.

> Caption: Write the units at the top of your working — pairs, connections or round trips — and the five traps cannot survive.

Exam-trap caption mode adds: *Reading a question as round trips when it asks for connections is the most common lost mark in this clause.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
