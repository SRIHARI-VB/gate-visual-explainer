/* ==========================================================================
   dns-and-http — THE timeline.
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
      id: 'names',
      n: 1,
      title: 'A name is not an address',
      start: 0, end: 30,
      objective: 'State what DNS is for, and read a domain name right to left as a path through the delegation tree.'
    },
    {
      id: 'iterative',
      n: 2,
      title: 'Iterative and recursive resolution, counted',
      start: 30, end: 60,
      objective: 'Distinguish an iterative referral from a recursive hand-off, and count the servers asked for a name.'
    },
    {
      id: 'records',
      n: 3,
      title: 'Resource records and the TTL',
      start: 60, end: 90,
      objective: 'Read a resource record as name, type, class, TTL and value, and see why the TTL is what makes DNS cheap.'
    },
    {
      id: 'message',
      n: 4,
      title: 'The DNS message: twelve bytes, then the question',
      start: 90, end: 120,
      objective: 'Lay out a DNS query byte by byte, and explain the 512-byte UDP limit and the TCP fallback.'
    },
    {
      id: 'request',
      n: 5,
      title: 'HTTP: one request, one response, over TCP',
      start: 120, end: 150,
      objective: 'Read an HTTP request and response line by line, and place the methods and status codes in their families.'
    },
    {
      id: 'state',
      n: 6,
      title: 'HTTP keeps no memory; cookies carry the state',
      start: 150, end: 180,
      objective: 'Explain statelessness, and show how Set-Cookie and Cookie turn two unrelated requests into one session.'
    },
    {
      id: 'connections',
      n: 7,
      title: 'Non-persistent, persistent and pipelined',
      start: 180, end: 210,
      objective: 'Count TCP connections and round trips for the three ways of fetching a page with embedded objects.'
    },
    {
      id: 'rtt',
      n: 8,
      title: 'The RTT arithmetic of GATE 2023',
      start: 210, end: 240,
      objective: 'Add DNS, handshake and object time in the right order, and check the sum against a simulated clock.'
    },
    {
      id: 'cache',
      n: 9,
      title: 'Two caches: DNS TTL and HTTP freshness',
      start: 240, end: 270,
      objective: 'Use a cached record and a conditional GET, and see that a 304 still costs a round trip.'
    },
    {
      id: 'procedure',
      n: 10,
      title: 'The procedure, and the traps that break it',
      start: 270, end: 300,
      objective: 'Run the four-step procedure on any question in this clause, and name the five traps by sight.'
    }
  ],

  events: [

    /* ---------------- scene 1: names ---------------- */
    {
      id: 'nm-1', scene: 'names', start: 0, end: 7.5,
      caption: 'The browser holds a name; the network needs an address. DNS is the lookup that turns one into the other.',
      detail: 'Every packet carries a destination address, and a person types a name. DNS is the distributed database that maps a domain name to an address, and it must answer before the first TCP segment can be addressed.',
      narration: 'You type a name. The network cannot route a name; it routes to an address. So before anything else can happen, the name has to become a number, and the service that does this is DNS.',
      keyword: 'name in, address out',
      trap: 'DNS is not the web. It is a general name service, and it is also what lets a mail server be found by name.'
    },
    {
      id: 'nm-2', scene: 'names', start: 7.5, end: 15,
      caption: 'A name is read right to left: the last label is the top-level domain, and each label is a delegation.',
      detail: 'In www.gate.org.in the labels are www, gate, org and in. Reading right to left walks down the tree: in is a top-level domain, org.in is a zone under it, gate.org.in is a zone under that, and www is a host inside it.',
      narration: 'Read the name backwards. The rightmost label, in, is the top-level domain. The next one, org, is a zone inside it. Then gate, a zone inside that. The leftmost label, www, is usually a host, not a zone of its own.',
      keyword: 'right to left',
      trap: 'The dots separate labels; a name with four labels is not automatically four delegations. www is usually a host inside the gate.org.in zone.'
    },
    {
      id: 'nm-3', scene: 'names', start: 15, end: 22.5,
      caption: 'The stub on your machine asks one resolver. The resolver is the part that walks the tree.',
      detail: 'The stub resolver in the operating system forwards the question to a configured recursive resolver, typically the local or ISP resolver. The walking of the hierarchy is done by that resolver, not by the browser.',
      narration: 'Your machine does not walk the tree itself. A small stub sends the question to one resolver, and that resolver does the walking, on your behalf, and remembers the answers.',
      keyword: 'stub asks one resolver',
      trap: 'The hop from your host to its resolver costs a round trip too. Whether a question counts it depends on where the question says the resolver sits.'
    },
    {
      id: 'nm-4', scene: 'names', start: 22.5, end: 30,
      caption: 'Cold, the walk visits every level. Warm, the first cached record ends the walk early.',
      detail: 'With nothing cached, the resolver must ask the root, then the top-level domain, then the next zone, then the authoritative server for the name. With a cached answer still inside its TTL, the walk stops immediately.',
      narration: 'With an empty cache the resolver visits every level. With a warm cache the answer is already in hand, and the whole tree is skipped. That difference is the difference between a slow first visit and a fast second one.',
      keyword: 'cold walks, warm stops',
      trap: 'A cached answer is only usable until its time to live expires. After that the walk starts again.'
    },

    /* ---------------- scene 2: iterative ---------------- */
    {
      id: 'it-1', scene: 'iterative', start: 30, end: 37.5,
      caption: 'In an iterative query the resolver asks each server itself and receives a referral, not an answer.',
      detail: 'The root does not know the address of www.gate.org.in. It knows who runs the in zone, and it says so. Each reply names the next server, and the resolver follows it. Only the last server, the authoritative one, returns the address.',
      narration: 'Iterative means the resolver does the walking. It asks the root, and the root replies with a referral: not the address, but the name of the server for in. The resolver asks that server and gets another referral. Only the last one answers.',
      keyword: 'referral, not answer',
      trap: 'A referral is a correct answer to a different question. Treating it as the address is the classic misreading.'
    },
    {
      id: 'it-2', scene: 'iterative', start: 37.5, end: 45,
      caption: 'In a recursive query the resolver hands the whole job to one server, which returns the final address.',
      detail: 'A recursive query puts the burden on the server being asked: it must return the address or an error, not a referral. The client makes one query and waits.',
      narration: 'Recursive means one server does the walking. You ask, and the server returns the address, having done all the intermediate asking itself. From the client there is one question and one answer.',
      keyword: 'one question, one answer',
      trap: 'The two modes are not faster or slower by definition. What changes is who spends the queries.'
    },
    {
      id: 'it-3', scene: 'iterative', start: 45, end: 52.5,
      caption: 'Count the servers asked, not the labels: for www.gate.org.in that is the root, in, org.in and gate.org.in, four pairs.',
      detail: 'GATE 2022 asks exactly this and the answer is four. The chain is root, then the in top-level domain, then the org.in zone, then the authoritative server for gate.org.in. Four query-response pairs, no cache anywhere.',
      narration: 'This is GATE 2022. Resolving www.gate.org.in iteratively, with no cache, takes four query-response pairs: the root, the in server, the org.in server, and the authoritative server for gate.org.in. Four, and the question is a one-mark numerical.',
      keyword: 'root + every zone cut',
      trap: 'Counting labels gives four here by luck. A name like www.example.com has three labels and three pairs, because www is a host and not a zone.'
    },
    {
      id: 'it-4', scene: 'iterative', start: 52.5, end: 60,
      caption: 'Add one pair only when the host and the resolver are different machines — and read the question to see which it is.',
      detail: 'If the question says the resolver is on the host, the host-to-resolver hop is internal and costs nothing. If it says the host asks a local resolver, that hop is one more pair. GATE 2022 says the resolver resolves the name; GATE 2023 says the local DNS server is on the local host. Both readings are stated in the question, so read it.',
      narration: 'One more pair exists when your host and the resolver are different machines. GATE 2023 says the local DNS server runs on the local host, so that hop is free and the hierarchy alone decides the count. The question always tells you where the resolver sits.',
      keyword: 'where is the resolver',
      trap: 'Adding the host-to-resolver pair when the question puts the resolver on the host turns a correct four into a wrong five.'
    },

    /* ---------------- scene 3: records ---------------- */
    {
      id: 'rr-1', scene: 'records', start: 60, end: 67.5,
      caption: 'A resource record is five fields: name, type, class, time to live, and value.',
      detail: 'The class is IN for internet data in every exam question. The type decides what the value means. The TTL, in seconds, says how long a cache may keep this record.',
      narration: 'A record has five parts. The name it describes, the type, the class, which is internet in every question you will see, a time to live in seconds, and the value. The type is what makes the value readable.',
      keyword: 'name, type, class, TTL, value',
      trap: 'The TTL is not a timeout for the query. It is the lifetime of the answer in a cache.'
    },
    {
      id: 'rr-2', scene: 'records', start: 67.5, end: 75,
      caption: 'A gives an IPv4 address, AAAA an IPv6 address, NS names a zone server, MX a mail server, CNAME an alias.',
      detail: 'NS records are what a referral actually carries. MX carries a preference number before the mail server name, so a sender can try the most preferred first. A CNAME says this name is another name, and the resolver must then look up that other name.',
      narration: 'The types you must recognise: A is an IPv4 address, AAAA is IPv6, NS says which server runs a zone, MX says where mail for the domain goes with a preference number, and CNAME says this name is an alias for another name.',
      keyword: 'A, AAAA, NS, MX, CNAME',
      trap: 'A CNAME is not an address. It sends the resolver off to resolve a second name, which costs another lookup.'
    },
    {
      id: 'rr-3', scene: 'records', start: 75, end: 82.5,
      caption: 'A TTL of 300 seconds means at most one lookup per 300 seconds per cache; the record counts down as it sits.',
      detail: 'The authoritative server chooses the TTL. A cache stores the record with the remaining lifetime and must discard it when it reaches zero. A short TTL makes changes visible quickly and costs more queries; a long TTL does the reverse.',
      narration: 'The time to live is a budget. With three hundred seconds, a cache may answer from memory for five minutes, and then it must ask again. Short values track changes quickly, long values save queries. That is the whole trade.',
      keyword: 'one lookup per TTL',
      trap: 'Two caches can hold the same record with different remaining lifetimes. The TTL is counted down, not reset, at each cache.'
    },
    {
      id: 'rr-4', scene: 'records', start: 82.5, end: 90,
      caption: 'A CNAME cannot sit beside other records at the same name, and a missing name is cached too, as a negative answer.',
      detail: 'RFC 1034 forbids a CNAME at a name that has any other record type, because the alias would make the other records unreachable. RFC 2308 defines negative caching: the fact that a name does not exist is cached for the SOA minimum, so a typo does not flood the servers.',
      narration: 'Two boundaries. A CNAME may not share a name with any other record, because the alias would hide it. And a name that does not exist is cached as a negative answer, so a mistyped address does not hammer the servers. Both are one-line facts that turn into one-mark questions.',
      keyword: 'alias alone; negatives cached',
      trap: 'A negative answer is still an answer. A cache hit on "no such name" is a hit, not a miss.'
    },

    /* ---------------- scene 4: message ---------------- */
    {
      id: 'ms-1', scene: 'message', start: 90, end: 97.5,
      caption: 'Every DNS message starts with a twelve-byte header: identifier, flags, and four counts.',
      detail: 'The identifier is two bytes and lets a client match a reply to its query. The flags carry the query-or-response bit, the recursion-desired bit and the truncation bit. Then four two-byte counts: questions, answers, authority records and additional records.',
      narration: 'The header is twelve bytes and always the same shape. Two bytes of identifier, so a reply can be matched to its query. Two bytes of flags, where the recursion-desired and truncation bits live. Then four counters, each two bytes, for the four sections that may follow.',
      keyword: '12 bytes, 6 fields',
      trap: 'The counts are for sections, not for records in a single list. A referral puts nothing in the answer section and its servers in the authority section.'
    },
    {
      id: 'ms-2', scene: 'message', start: 97.5, end: 105,
      caption: 'The question encodes the name as length-prefixed labels, so www.gate.org.in takes 17 bytes before the type.',
      detail: 'Each label is written as one length byte followed by its characters, and the name ends with a zero-length label. For www.gate.org.in that is four plus five plus four plus three plus one, which is seventeen bytes. Then two bytes of type and two of class.',
      narration: 'The name is not stored as text with dots. Each label carries its own length byte in front, and a zero byte closes the name. Four plus five plus four plus three plus one: seventeen bytes. Add two for the type and two for the class, and with the header the whole query is thirty-three bytes.',
      keyword: 'length byte per label',
      trap: 'The dots are not transmitted. Counting the characters of the name as its wire length is wrong by one byte per label plus the terminator.'
    },
    {
      id: 'ms-3', scene: 'message', start: 105, end: 112.5,
      caption: 'A classic UDP answer is capped at 512 bytes; the truncation bit sends the client back over TCP.',
      detail: 'RFC 1035 sets 512 bytes as the maximum UDP payload for DNS. If the answer does not fit, the server sets the truncation bit and the client repeats the query over TCP, where there is no such cap. EDNS0 later raised the advertised limit.',
      narration: 'The classic limit for a DNS answer over UDP is five hundred and twelve bytes. If the answer does not fit, the server sets one bit, the truncation bit, and the client asks again over TCP. That is why DNS uses both transports.',
      keyword: '512 bytes, then TCP',
      trap: 'The truncation bit means the answer was cut, not that the name does not exist. Retrying over TCP is the correct response.'
    },
    {
      id: 'ms-4', scene: 'message', start: 112.5, end: 120,
      caption: 'In the 479 bytes left of a 512-byte answer, a sixteen-byte A record fits 29 times.',
      detail: 'Take the 512-byte limit, subtract the 12-byte header, the 17-byte encoded name and the 4-byte type and class, and 479 bytes remain. Each compressed A record costs 2 bytes of pointer plus 2 of type, 2 of class, 4 of TTL, 2 of length and 4 of address, which is 16 bytes. 479 divided by 16 is 29.9, so 29 records fit.',
      narration: 'Here is the arithmetic a question can ask for. Five hundred and twelve minus twelve minus seventeen minus four leaves four hundred and seventy-nine. Each address record, with a compressed name, is sixteen bytes. Four hundred and seventy-nine over sixteen is twenty-nine point nine, so twenty-nine records fit and the thirtieth does not.',
      keyword: '29 A records',
      trap: 'Forgetting the two-byte compression pointer makes each record eighteen bytes and gives a different count.'
    },

    /* ---------------- scene 5: request ---------------- */
    {
      id: 'rq-1', scene: 'request', start: 120, end: 127.5,
      caption: 'An HTTP request is a method, a target and a version, then headers, then an optional body.',
      detail: 'GET /index.html HTTP/1.1 is the request line. The Host header is mandatory in HTTP/1.1 because one server address can host many names. The blank line ends the headers, and a body may follow.',
      narration: 'A request is three words on the first line: the method, the target and the version. Then headers, one per line, until a blank line. The Host header is required in version 1.1, because one address can serve many names, and the server has to know which one you meant.',
      keyword: 'method, target, version',
      trap: 'Without Host, a server holding several sites cannot tell them apart. That is why 1.1 made it mandatory.'
    },
    {
      id: 'rq-2', scene: 'request', start: 127.5, end: 135,
      caption: 'GET and HEAD are safe; GET, HEAD, PUT and DELETE are idempotent; POST is neither.',
      detail: 'Safe means the request asks for no change on the server. Idempotent means repeating it has the same effect as doing it once. GET and HEAD are both. PUT and DELETE are idempotent but not safe. POST is neither, which is why a browser warns before resending one.',
      narration: 'Two properties, not one. Safe means it changes nothing: GET and HEAD. Idempotent means doing it twice is the same as doing it once: that adds PUT and DELETE. POST is neither safe nor idempotent, which is exactly why a resubmitted form can create a second order.',
      keyword: 'safe versus idempotent',
      trap: 'Safe and idempotent are different questions. PUT is idempotent and not safe. Confusing the two is the standard slip.'
    },
    {
      id: 'rq-3', scene: 'request', start: 135, end: 142.5,
      caption: 'The response begins with a status code: 2xx worked, 3xx look elsewhere, 4xx your fault, 5xx the server.',
      detail: '200 is OK, 301 moved permanently, 304 not modified, 404 not found, 500 internal error. The first digit names the family, and that is enough to answer most multiple-choice items even when the exact code is unfamiliar.',
      narration: 'The response starts with a status code. Two hundred and something means it worked. Three hundred means look somewhere else or use what you have. Four hundred means the request was wrong. Five hundred means the server failed. The first digit alone answers most questions.',
      keyword: '2, 3, 4, 5',
      trap: '304 is a success with no body, not an error. It says your cached copy is still good.'
    },
    {
      id: 'rq-4', scene: 'request', start: 142.5, end: 150,
      caption: 'A browser needs one request per object: the page and its five images are six requests and, in 1.0, six connections.',
      detail: 'GATE 2020 asks for the number of TCP connections in non-persistent mode for a page with text and five images. Each object is a separate request, and non-persistent HTTP closes the connection after each, so six objects need six connections.',
      narration: 'One request per object, always. A page with five images is six objects and six requests. In non-persistent mode each request gets its own connection, so GATE 2020 answers six. The count of requests never changes; only the count of connections does.',
      keyword: 'one request per object',
      trap: 'The HTML page is an object too. Counting only the five images gives five, and the answer is six.'
    },

    /* ---------------- scene 6: state ---------------- */
    {
      id: 'st-1', scene: 'state', start: 150, end: 157.5,
      caption: 'HTTP is stateless: the second request carries no memory of the first.',
      detail: 'The server keeps no per-client state between requests in the protocol itself. Each request must carry everything needed to interpret it. That is what makes a single server able to serve millions of clients, and it is also what makes a login impossible without help.',
      narration: 'Stateless means the protocol remembers nothing. The second request looks exactly like the first, from a stranger. That is what lets one server serve millions of clients, and it is also why a login would be impossible without something extra.',
      keyword: 'no memory between requests',
      trap: 'Stateless is a property of the protocol, not of the server. A server may keep state; HTTP does not carry it for you.'
    },
    {
      id: 'st-2', scene: 'state', start: 157.5, end: 165,
      caption: 'The server sends Set-Cookie in a response; the browser returns Cookie in every later request to that site.',
      detail: 'A cookie is a name-value pair with attributes. The server sets it, the browser stores it against the site, and it is attached to later requests to that site. The server can then recognise the session without the protocol holding any state.',
      narration: 'The fix is a header. In a response the server sends Set-Cookie. The browser stores that name and value against the site, and from then on attaches it to every request to that site. The state now lives in the browser, and the protocol stays stateless.',
      keyword: 'Set-Cookie out, Cookie back',
      trap: 'The cookie goes back to the site that set it, not to every site. Domain and Path decide the scope.'
    },
    {
      id: 'st-3', scene: 'state', start: 165, end: 172.5,
      caption: 'A cookie is text, not code — which is why GATE 2015 calls that option the false one.',
      detail: 'GATE 2015 Set 2 asks which statement about cookies is NOT correct, and the answer is that a cookie is a piece of code that can compromise security. A cookie is a string. It can raise privacy concerns because it allows tracking, but it does not execute.',
      narration: 'A cookie is a string. GATE 2015 asks which statement is not correct, and the wrong one is that a cookie is a piece of code that can compromise your security. It is data. It enables tracking, which is a privacy question, not an execution question.',
      keyword: 'text, not code',
      trap: 'Privacy and security are different words here. A cookie enables tracking; it does not run.'
    },
    {
      id: 'st-4', scene: 'state', start: 172.5, end: 180,
      caption: 'Expires or Max-Age decides lifetime; Domain and Path decide scope; Secure and HttpOnly decide who may read it.',
      detail: 'Without Expires or Max-Age a cookie lasts only for the browser session. Domain widens the scope to subdomains. Path restricts it to a path prefix. Secure restricts it to secure transport. HttpOnly hides it from scripts, which limits one class of cross-site scripting damage.',
      narration: 'Four attributes carry the marks. Expires or Max-Age gives the lifetime, and without them the cookie dies with the browser session. Domain and Path give the scope. Secure keeps it off plain transport, and HttpOnly hides it from scripts. Each attribute is a one-line fact.',
      keyword: 'lifetime, scope, transport, script',
      trap: 'A session cookie with no expiry is not permanent. It disappears when the browser closes.'
    },

    /* ---------------- scene 7: connections ---------------- */
    {
      id: 'cn-1', scene: 'connections', start: 180, end: 187.5,
      caption: 'Non-persistent HTTP: one TCP connection per object, so N objects and the page cost N+1 connections.',
      detail: 'The server closes the connection after each response. Every object therefore pays a handshake and a request, two round trips each. The cost is paid in parallel if the browser opens several connections at once, which is what the parallel-connection questions count.',
      narration: 'Non-persistent means the connection dies after each response. Every object pays a handshake and then a request: two round trips each. The browser can hide that by opening several connections at once, and that is what a parallel-connection question is really asking.',
      keyword: 'N+1 connections',
      trap: 'Parallel connections reduce elapsed time, not the number of connections. Ten objects over five connections is still ten handshakes.'
    },
    {
      id: 'cn-2', scene: 'connections', start: 187.5, end: 195,
      caption: 'Persistent HTTP keeps the connection open: one handshake for the page, then one round trip per object.',
      detail: 'HTTP/1.1 makes persistence the default. The connection opened for the base page is reused for every object on the same server, so the handshake is paid once. Sequential requests still cost one round trip each, because each waits for the previous response.',
      narration: 'Persistent means the connection stays open. The handshake is paid once, for the page, and every later object rides the same connection. Sequentially, each object still costs a round trip, because each request waits for the answer to the one before it.',
      keyword: 'one handshake, N round trips',
      trap: 'Persistence saves the handshake, not the round trips. Sequential persistent HTTP is still slow.'
    },
    {
      id: 'cn-3', scene: 'connections', start: 195, end: 202.5,
      caption: 'Pipelining sends the requests back to back, so all the objects come back in one round trip.',
      detail: 'Pipelining is a client-side decision: send the next request without waiting for the previous response. The server answers in the order the requests arrived. One round trip covers all the objects, which is the cheapest of the three.',
      narration: 'Pipelining removes the waiting. The client sends every request back to back, and the server answers in order. All the objects then arrive in one round trip. That is the cheapest arrangement of the three.',
      keyword: 'all requests, one round trip',
      trap: 'Pipelining does not reorder responses. They come back in request order, so one slow object still delays the rest.'
    },
    {
      id: 'cn-4', scene: 'connections', start: 202.5, end: 210,
      caption: 'GATE 2026 Set 1: one connection can serve many pages on one server, but never two different servers.',
      detail: 'The correct statements are A, C and D. B is false because a TCP connection is bound to one destination address and port, so objects on a different server need a different connection. D is true because persistence is not limited to one page.',
      narration: 'GATE 2026 asks four statements. Persistent connections carry many objects of a page from one server, so A is true. Pipelining sends a request before the previous answer arrives, so C is true. The connection also carries later pages on that same server, so D is true. B is false: a connection ends at one server, and cannot reach a second one.',
      keyword: 'same server only',
      trap: 'One connection, one server. Nothing about persistence lets a single socket reach two addresses.'
    },

    /* ---------------- scene 8: rtt ---------------- */
    {
      id: 'rt-1', scene: 'rtt', start: 210, end: 217.5,
      caption: 'GATE 2023: three tiers of DNS, one base page, ten objects, one round trip each — add them in order.',
      detail: 'The question fixes the resolver on the local host, so the hierarchy costs three round trips: root, top-level domain and authoritative. Fetching the base page costs one handshake and one request, so two. Then the ten objects are added.',
      narration: 'GATE 2023 gives you a three-tier hierarchy, a base page and ten objects, and says the resolver is on the local host. So DNS costs three round trips. The base page costs a handshake and a request: two. Now add the objects, and the mode decides how.',
      keyword: '3 then 2 then objects',
      trap: 'Fetching the page needs two round trips, not one. The handshake is not free, and the request cannot ride on it in the usual convention.'
    },
    {
      id: 'rt-2', scene: 'rtt', start: 217.5, end: 225,
      caption: 'Non-persistent with five parallel connections: ten objects take two rounds of two round trips, so nine in all.',
      detail: 'Each object costs two round trips, a handshake and a request. Ten objects over five connections run in two rounds, so four round trips. Three for DNS, two for the page, four for the objects: nine. That is option C.',
      narration: 'Non-persistent, five connections at a time. Ten objects divide into two rounds, and each round costs two round trips, so four. Three and two and four make nine. That is option C, and it is correct.',
      keyword: '3 + 2 + 4 = 9',
      trap: 'Five parallel connections do not mean two round trips per batch of five objects: each object still pays its own handshake.'
    },
    {
      id: 'rt-3', scene: 'rtt', start: 225, end: 232.5,
      caption: 'Persistent with pipelining: the connection is already open, so the ten objects cost one round trip, and the total is six.',
      detail: 'No new handshake is needed, and the requests are sent together. The responses return in one round trip. Three plus two plus one is six, which is option D.',
      narration: 'Persistent with pipelining reuses the connection the page already opened, and sends all ten requests together. One round trip for all ten. Three plus two plus one is six. Option D, also correct.',
      keyword: '3 + 2 + 1 = 6',
      trap: 'Pipelining saves the handshakes and the waiting, but it cannot save the DNS or the base page. Six is the floor here, not five.'
    },
    {
      id: 'rt-4', scene: 'rtt', start: 232.5, end: 240,
      caption: 'Seven is what ten parallel connections would give, and five forgets the base page: both options are wrong for a reason.',
      detail: 'With ten parallel connections, the objects take one round instead of two, so the total is seven, which is why option A is a plausible trap. Five comes from forgetting the handshake for the base page.',
      narration: 'Option A says seven, and seven is a real number: it is what ten parallel connections would give, one round instead of two. Option B says five, which forgets the handshake before the base page. Both wrong options are wrong for a specific reason, and naming the reason is faster than recomputing.',
      keyword: '7 and 5 are near misses',
      trap: 'A wrong option in a counting question is usually a right answer to a slightly different question. Find which one.'
    },

    /* ---------------- scene 9: cache ---------------- */
    {
      id: 'ca-1', scene: 'cache', start: 240, end: 247.5,
      caption: 'Two caches sit in the path: DNS records held for a TTL, and web objects held until they are stale.',
      detail: 'The resolver cache holds resource records with a countdown. The browser cache holds pages and images with a freshness lifetime from Cache-Control or Expires. They are separate stores with separate rules, and a question will usually tell you which one is cold.',
      narration: 'There are two caches, not one. The resolver keeps records for a time to live. The browser keeps pages and images until they go stale. They have different rules and different lifetimes, and a question usually tells you which one starts empty.',
      keyword: 'two caches, two rules',
      trap: 'A warm browser cache does not save the DNS lookup, and a warm DNS cache does not save the download.'
    },
    {
      id: 'ca-2', scene: 'cache', start: 247.5, end: 255,
      caption: 'A conditional GET asks whether the copy is still good: If-Modified-Since or If-None-Match.',
      detail: 'The client sends the date it already has, or the entity tag the server gave it. If the object has not changed, the server answers 304 and sends no body. The download is saved, but the request still crosses the network.',
      narration: 'A conditional request asks a question instead of asking for the file. Here is the date I have, or here is the tag you gave me: has it changed? If not, the server answers three-oh-four and sends no body. You saved the download, and you still paid a round trip.',
      keyword: '304, no body',
      trap: 'A 304 saves bandwidth, not latency. It is still one request and one response.'
    },
    {
      id: 'ca-3', scene: 'cache', start: 255, end: 262.5,
      caption: 'Cache-Control with max-age skips the request entirely while the copy is fresh.',
      detail: 'With a max-age the browser may reuse the object without asking at all until the age is exceeded. That saves both the download and the round trip. When the age is exceeded the browser revalidates, which is the conditional GET.',
      narration: 'Max-age is stronger than revalidation. While the copy is fresh, the browser uses it without asking, so both the download and the round trip disappear. Only when the age runs out does it revalidate.',
      keyword: 'fresh: no request at all',
      trap: 'Fresh and stale are decided by age against max-age, not by whether the page looks different.'
    },
    {
      id: 'ca-4', scene: 'cache', start: 262.5, end: 270,
      caption: 'So a second visit costs one round trip when fresh, one when revalidated, and a full download when stale.',
      detail: 'Three outcomes, and the question will tell you which applies. Fresh: zero requests for that object. Revalidated: one request, no body. Stale or absent: one request and the whole object. Counting these is what a caching question is.',
      narration: 'Three cases, three costs. Fresh: no request at all. Revalidated: one request and no body. Stale: one request and the whole object. A caching question is asking you which case you are in, and the arithmetic is the arithmetic of a single object.',
      keyword: '0, 1, 1+body',
      trap: 'Counting a fresh object as one round trip overstates the cost. Counting a revalidated one as free understates it.'
    },

    /* ---------------- scene 10: procedure ---------------- */
    {
      id: 'pr-1', scene: 'procedure', start: 270, end: 277.5,
      caption: 'Four steps: resolve the name, open the connection, request each object, then render.',
      detail: 'The order is forced by dependencies. A connection cannot be opened without an address, a request cannot be sent without a connection, and rendering cannot start until the base page has been parsed to find the objects.',
      narration: 'The order is not a convention; it is forced. No address, no connection. No connection, no request. No base page, no list of objects to request. Write the four steps down and the question becomes arithmetic.',
      keyword: 'resolve, connect, request, render',
      trap: 'Rendering starts only after the base page arrives. A question that asks for the last byte may be asking about the last object, not the page.'
    },
    {
      id: 'pr-2', scene: 'procedure', start: 277.5, end: 285,
      caption: 'Trap one: counting labels as delegations. Trap two: forgetting the handshake. Trap three: one connection across two servers.',
      detail: 'Labels are not zone cuts, so the number of servers asked is a property of the delegation tree. The handshake is a round trip of its own. And a TCP connection is bound to one destination address, so it cannot serve two servers.',
      narration: 'Three traps by sight. Counting labels as if each were a delegation. Forgetting that the handshake is a round trip of its own. And believing one connection can reach two servers, which GATE 2026 used as its false statement.',
      keyword: 'labels, handshake, endpoints',
      trap: 'All three produce a number that appears among the options, which is why they survive a careless check.'
    },
    {
      id: 'pr-3', scene: 'procedure', start: 285, end: 292.5,
      caption: 'Trap four: a 304 is not free. Trap five: parallel connections change time, not the connection count.',
      detail: 'A 304 costs a round trip and saves only the body. Parallel connections reduce elapsed time while the total number of connections stays the same, because every object still needs its own connection in non-persistent mode.',
      narration: 'Two more. A three-oh-four still costs a round trip, so it saves bandwidth and not time. And parallel connections change the elapsed time, never the number of connections: ten objects over five connections is still ten handshakes.',
      keyword: '304 costs time; parallel is not fewer',
      trap: 'The question asks for connections or for time. Read which one before computing anything.'
    },
    {
      id: 'pr-4', scene: 'procedure', start: 292.5, end: 300,
      caption: 'Write the units at the top of your working — pairs, connections or round trips — and the five traps cannot survive.',
      detail: 'The three quantities in this clause are counted in different units. A question asking for pairs is not asking for round trips, and a question asking for connections is not asking for time. Naming the unit first is the cheapest check in the paper.',
      narration: 'One habit covers the clause. Before computing, write the unit at the top: pairs, connections, or round trips. Every trap in this lesson is a unit confusion or a missing round trip, and both are visible the moment the unit is written down.',
      keyword: 'name the unit first',
      trap: 'Reading a question as round trips when it asks for connections is the most common lost mark in this clause.'
    }
  ]
};
