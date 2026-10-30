/* ==========================================================================
   network-security — THE timeline.
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
      id: 'goals', n: 1,
      title: 'Three things a secure channel must do',
      start: 0, end: 30,
      objective: 'Name confidentiality, integrity and authentication, and say which key arrangement each one needs.'
    },
    {
      id: 'symmetric', n: 2,
      title: 'One key, and N(N-1)/2 of them',
      start: 30, end: 60,
      objective: 'Count the shared keys a group needs, and see why the count is the number of pairs rather than the number of people.'
    },
    {
      id: 'publickey', n: 3,
      title: 'Two keys, and which one you use',
      start: 60, end: 90,
      objective: 'State the direction rule: encrypt with the receiver public key for secrecy, with your own private key for proof.'
    },
    {
      id: 'rsa', n: 4,
      title: 'RSA: n, phi(n), and the inverse of e',
      start: 90, end: 120,
      objective: 'Build a key pair from two primes and recover a private exponent as a modular inverse, on the two numbers GATE has used.'
    },
    {
      id: 'modexp', n: 5,
      title: 'Why a 51-step power costs 9 multiplications',
      start: 120, end: 150,
      objective: 'Run square-and-multiply on 3^51 mod 5 and see why the exponent is reduced modulo phi(n) and not modulo n.'
    },
    {
      id: 'signature', n: 6,
      title: 'A signature is the private key one job',
      start: 150, end: 180,
      objective: 'Sign a digest with the sender private key and verify it with the sender public key, and show verification failing under the wrong key.'
    },
    {
      id: 'order', n: 7,
      title: 'Sign then encrypt: the order of the two operations',
      start: 180, end: 210,
      objective: 'Apply the key sequence of the 2013 item and say why signing first and encrypting second is the arrangement that keeps both properties.'
    },
    {
      id: 'hash', n: 8,
      title: 'Hashes, and the birthday attack',
      start: 210, end: 240,
      objective: 'Separate a collision from a second preimage, and see why only the signer can profit from a birthday collision.'
    },
    {
      id: 'certificate', n: 9,
      title: 'Certificates and authentication',
      start: 240, end: 270,
      objective: 'Read a certificate as a signed binding of a name to a public key, and distinguish a certificate from a MAC.'
    },
    {
      id: 'firewall', n: 10,
      title: 'Firewalls, and the layer they can see',
      start: 270, end: 300,
      objective: 'Evaluate an ordered rule table by first match, and state what a layer-4 device cannot do.'
    }
  ],

  events: [
    /* ---------- scene 1: the three goals ---------- */
    { id: 's1-1', scene: 'goals', start: 0, end: 10,
      caption: 'Confidentiality: an eavesdropper who copies every packet learns nothing about the message. Encryption is the only tool for this one.',
      detail: 'A network is a broadcast medium in the worst case: every router on the path, and anyone sharing the wireless link, can copy the bytes. Confidentiality is the property that a copy is useless without a key. It says nothing about whether the message was altered, and nothing about who sent it.',
      narration: 'Confidentiality: an eavesdropper who copies every packet learns nothing. Encryption is the only tool for this property.',
      keyword: 'Confidentiality' },
    { id: 's1-2', scene: 'goals', start: 10, end: 20,
      caption: 'Integrity: a changed message is detected. Authentication: the receiver knows who sent it, and the sender cannot later deny it.',
      detail: 'Integrity is about the bits arriving as they left, which a checksum or a hash detects. Authentication is about identity, which needs a secret that only the claimed sender holds. Non-repudiation is the stronger version: the receiver can prove to a third party that this sender sent this message, and that needs a signature rather than a shared key.',
      narration: 'Integrity: a changed message is detected. Authentication: the receiver knows who sent it, and the sender cannot deny it later.',
      keyword: 'Integrity' },
    { id: 's1-3', scene: 'goals', start: 20, end: 30,
      caption: 'Every question on this page is one of those three, and the first step is always to name which. The name decides the keys before any arithmetic starts.',
      detail: 'Secrecy points at the receiver key. Proof points at the sender key. Detection of change points at a hash. A question that says "securely" without saying which property is asking you to pick, and most wrong answers come from picking the wrong one.',
      narration: 'Every question here is one of those three, and naming which one decides the keys before any arithmetic starts.',
      keyword: 'name which',
      trap: 'The word "secure" is not a property. Confidentiality uses the receiver key, authenticity uses the sender key, and the two answers are different sequences of the same four keys.' },

    /* ---------- scene 2: symmetric key count ---------- */
    { id: 's2-1', scene: 'symmetric', start: 30, end: 40,
      caption: 'Symmetric encryption uses one key for both directions: the same key locks and unlocks. DES and AES are the standard examples.',
      detail: 'Because the key is shared, the hard problem moves: it is not the arithmetic, it is getting the key to the other side without anyone seeing it. That is the key-distribution problem, and it is the reason public-key methods exist.',
      narration: 'Symmetric encryption uses one key for both directions. The same key locks and unlocks.',
      keyword: 'one key' },
    { id: 's2-2', scene: 'symmetric', start: 40, end: 50,
      caption: 'If every pair in a group of N must have its own secret, the number of keys is N(N-1)/2: the number of pairs, not the number of people.',
      detail: 'Counting by people overcounts by a factor of two, because the key between A and B is the same key as the key between B and A. Counting by pairs is the correct count. For N = 5 the page counts ten pairs and the formula gives ten; for N = 10 it counts forty-five.',
      narration: 'If every pair needs its own secret, the number of keys is N times N minus one, over two: the number of pairs.',
      keyword: 'N(N-1)/2' },
    { id: 's2-3', scene: 'symmetric', start: 50, end: 60,
      caption: 'That is the answer to GATE CSE 2015 Set 1: N(N-1)/2. The distractors are the per-person count N(N-1) and the two-keys-per-person count 2N.',
      detail: 'N(N-1) counts each pair twice, once from each end. 2N is the number of keys in an asymmetric arrangement, where each person holds a public and a private key, and it appears here because it is the count for the other system. (N-1) squared counts keys per person against keys per person.',
      narration: 'That is the 2015 answer: N times N minus one over two. The distractors are the per-person count and the two-keys-per-person count.',
      keyword: 'N(N-1) counts each pair twice',
      trap: 'N(N-1)/2 counts pairs. If the question instead asks how many keys each person holds, the answer is N-1, and if it asks for an asymmetric system the answer is 2N keys in total.' },

    /* ---------- scene 3: public key ---------- */
    { id: 's3-1', scene: 'publickey', start: 60, end: 70,
      caption: 'Public-key encryption gives each person a pair: a public key anyone may read, and a private key only its owner can use.',
      detail: 'The pair is generated together and the two keys undo each other. Publishing one of them costs nothing, which is what removes the key-distribution problem: you can hand out the encryption key over an open channel, because possession of it does not let anyone decrypt.',
      narration: 'Public-key encryption gives each person a pair: a public key anyone may read, and a private key only its owner can use.',
      keyword: 'a pair' },
    { id: 's3-2', scene: 'publickey', start: 70, end: 80,
      caption: 'For secrecy the sender encrypts with the receiver public key, and only the receiver private key opens it. Sender keys play no part.',
      detail: 'This is the direction rule, and it is the one question type that repeats: which key, whose key, in which order. Secrecy points away from the sender and towards the receiver. A common wrong answer encrypts with the sender private key, which gives proof and no secrecy at all, since anyone holding the sender public key can read it.',
      narration: 'For secrecy the sender encrypts with the receiver public key, and only the receiver private key opens it.',
      keyword: 'receiver public key' },
    { id: 's3-3', scene: 'publickey', start: 80, end: 90,
      caption: 'For proof the direction reverses: the sender encrypts with their own private key, and anyone verifies with the sender public key.',
      detail: 'Only one person can produce a value that the sender public key opens, so a successful check is evidence about who made it. That is the whole of the digital signature idea, and scene 6 makes it precise with a hash. The count of keys in this arrangement is 2N for N people, against N(N-1)/2 shared keys.',
      narration: 'For proof the direction reverses: the sender uses their own private key, and anyone verifies with the sender public key.',
      keyword: 'own private key',
      trap: 'Encrypting with your private key gives no secrecy, because your public key is public. It gives proof, and only proof.' },

    /* ---------- scene 4: RSA ---------- */
    { id: 's4-1', scene: 'rsa', start: 90, end: 100,
      caption: 'RSA picks two primes p and q, sets n = pq, and computes phi(n) = (p-1)(q-1). With p = 13 and q = 17: n = 221 and phi(n) = 192.',
      detail: 'phi(n) counts the numbers below n that share no factor with n. For a product of two distinct primes it is (p-1)(q-1), and that is the only place the primes are used. The modulus n is published; p, q and phi(n) are not, because anyone holding phi(n) can compute the private exponent.',
      narration: 'RSA picks two primes, sets n to their product, and computes phi of n as p minus one times q minus one. Here n is 221 and phi is 192.',
      keyword: 'phi(n) = (p-1)(q-1)' },
    { id: 's4-2', scene: 'rsa', start: 100, end: 110,
      caption: 'The public exponent e must share no factor with phi(n). The private exponent d is the inverse of e modulo phi(n): here 35 times 11 = 385 = 2 times 192 + 1.',
      detail: 'The inverse exists exactly when the greatest common divisor of e and phi(n) is 1, which the page checks by running Euclid. Then e*d leaves remainder 1 on division by phi(n), and that single congruence is the whole of the key relationship. The page also encrypts and decrypts all 220 non-zero messages below 221 and gets every one back.',
      narration: 'The public exponent must share no factor with phi, and the private exponent is its inverse modulo phi. Thirty-five times eleven is two times one ninety-two plus one.',
      keyword: 'inverse of e modulo phi(n)' },
    { id: 's4-3', scene: 'rsa', start: 110, end: 120,
      caption: 'GATE CSE 2019 gave n = 3007 and phi(n) = 2880. Then p + q = n - phi(n) + 1 = 128, the two primes are 31 and 97, and the factor above 50 is 97.',
      detail: 'Because phi(n) = n - p - q + 1, knowing n and phi(n) hands you the sum of the primes. The product and the sum determine them: they are the roots of x^2 - 128x + 3007, whose discriminant is 4356 = 66^2, giving (128-66)/2 = 31 and (128+66)/2 = 97. The page checks 31 times 97 = 3007 and (30)(96) = 2880.',
      narration: 'The 2019 numbers: n is 3007 and phi is 2880, so the primes sum to 128. They are 31 and 97, and the one above fifty is 97.',
      keyword: 'p + q = n - phi(n) + 1' },

    /* ---------- scene 5: modular exponentiation ---------- */
    { id: 's5-1', scene: 'modexp', start: 120, end: 130,
      caption: 'Encryption is one modular power: the ciphertext is m^e mod n, and decryption is c^d mod n. Nothing else in RSA is arithmetic.',
      detail: 'Both operations are the same shape, which is why one routine serves both directions: sign with d, verify with e. The modulus is n for the ciphertext but phi(n) for the exponent relation, and mixing the two moduli up is the classic exam error.',
      narration: 'Encryption is one modular power, and decryption is the same power with the other exponent. Nothing else in RSA is arithmetic.',
      keyword: 'm^e mod n' },
    { id: 's5-2', scene: 'modexp', start: 130, end: 140,
      caption: 'Square-and-multiply reads the exponent in binary. For 51 = 110011 that is five squarings and four multiplications: nine in all, against fifty for the naive loop.',
      detail: 'Each step halves the exponent: square the base and either fold it in or not, according to the next bit. The page counts the multiplications by instrumenting the routine, and compares with the 50 that repeated multiplication by the base would need. On a 2048-bit exponent the saving is the difference between a fast connection and an impossible one.',
      narration: 'Square-and-multiply reads the exponent in binary. Fifty-one is one one zero zero one one, so five squarings and four multiplications.',
      keyword: 'nine in all' },
    { id: 's5-3', scene: 'modexp', start: 140, end: 150,
      caption: '3^51 mod 5 = 2, computed both by square-and-multiply and by the cycle of powers mod 5. GATE CSE 2019 asked this, and it is one line of arithmetic.',
      detail: 'The powers of 3 modulo 5 repeat with period four: 3, 4, 2, 1. Since 51 leaves remainder 3 on division by 4, the answer is the third element of the cycle, 2. The page checks the two routes agree, and that the same value comes back from a naive loop.',
      narration: 'Three to the fifty-one modulo five is two, by square-and-multiply and by the four-step cycle of powers.',
      keyword: '3^51 mod 5 = 2',
      trap: 'The exponent relation is e*d = 1 mod phi(n), not mod n. GATE CSE 2009 offered exactly that confusion, and the correct pair of equations was I and III.' },

    /* ---------- scene 6: signatures ---------- */
    { id: 's6-1', scene: 'signature', start: 150, end: 160,
      caption: 'A signature is not the message encrypted. The sender hashes the message and signs the digest, so the signature is short and fixed in size.',
      detail: 'Signing the whole message would cost as much as encrypting it and would grow with it. A hash compresses any message to a fixed number of bits, and the signature is that number raised to the sender private exponent. Integrity and authenticity then arrive together: a changed message has a different digest.',
      narration: 'A signature is not the message encrypted. The sender hashes the message and signs the digest.',
      keyword: 'signs the digest' },
    { id: 's6-2', scene: 'signature', start: 160, end: 170,
      caption: 'The transmitted pair is the message and the signed digest. GATE CSE 2016 Set 1 asked for exactly this form, and the answer used the sender private key.',
      detail: 'Writing the pair as m together with K_B^-(H(m)) says: here is the message, and here is its digest under B private key. A receiver recomputes H(m), applies B public key to the signature, and compares. Any other arrangement either gives no proof or cannot be checked by the receiver.',
      narration: 'The transmitted pair is the message and the signed digest, with the sender private key doing the signing.',
      keyword: 'K_B^-(H(m))' },
    { id: 's6-3', scene: 'signature', start: 170, end: 180,
      caption: 'Verification uses the sender public key: that is the 2016 Set 2 answer, Anarkali public key. Under any other key the check fails, which the page demonstrates numerically.',
      detail: 'The page signs a digest with one key pair and then verifies with both the correct public key and a wrong one. The correct key returns the digest exactly; the wrong key returns a different number, so the check fails. That failure is the entire security argument: producing a value that the sender public key opens requires the sender private key.',
      narration: 'Verification uses the sender public key. Under any other key the check fails, which the page shows numerically.',
      keyword: 'sender public key',
      trap: 'Verification needs the signer public key, never the verifier own keys. The 2016 Set 2 item is answered in one word once that is clear.' },

    /* ---------- scene 7: order of operations ---------- */
    { id: 's7-1', scene: 'order', start: 180, end: 190,
      caption: 'Signing gives proof. Encrypting gives secrecy. A message that needs both is signed first and encrypted second.',
      detail: 'The order is forced by who can do what. The signature must be produced by the sender and checked by the receiver, and the encryption must be readable only by the receiver. Doing the signature inside the encryption means the signature travels protected, and the receiver unwraps it before checking.',
      narration: 'Signing gives proof, encrypting gives secrecy. A message that needs both is signed first and encrypted second.',
      keyword: 'signed first and encrypted second' },
    { id: 's7-2', scene: 'order', start: 190, end: 200,
      caption: 'At X: apply X private key, then Y public key. At Y: apply Y private key, then X public key. That is GATE CSE 2013, and the answer was the last option.',
      detail: 'Each key is used by the party that holds it and in the direction that gives the intended property. X private is the only key that can create the signature; Y public is the only key that hides it from everyone but Y; Y private is the only key that can open it; X public is the only key that can check it.',
      narration: 'At the sender: own private key, then the receiver public key. At the receiver: own private key, then the sender public key.',
      keyword: 'X private then Y public' },
    { id: 's7-3', scene: 'order', start: 200, end: 210,
      caption: 'Reversing the order still works arithmetically, but the resulting arrangement is weaker: the signature is exposed, and the receiver may act on unverified data.',
      detail: 'Encrypt-then-sign hides the message from an eavesdropper but publishes the signature over ciphertext, which is checkable by anyone. Sign-then-encrypt keeps the signature inside the envelope. The exam asks for the sequence, not for a debate, but the reason the sequence is what it is should be clear rather than memorised.',
      narration: 'Reversing the order still works arithmetically, but it exposes the signature and weakens the arrangement.',
      keyword: 'weaker' },

    /* ---------- scene 8: hashes and the birthday attack ---------- */
    { id: 's8-1', scene: 'hash', start: 210, end: 220,
      caption: 'A hash maps any input to a fixed-length digest, one way. MD5 and SHA-1 are the two named in GATE CSE 2014, where RSA and DES were the distractors.',
      detail: 'One way means the digest does not reveal the input, and fixed length means the message length leaks nothing. RSA and DES are encryption schemes, not digest functions, which is what the 2014 item was testing. A hash is not injective either, since infinitely many inputs share a finite set of digests, which is the other half of that item.',
      narration: 'A hash maps any input to a fixed-length digest, one way. MD5 and SHA-1 are the two the 2014 item named.',
      keyword: 'MD5 and SHA-1' },
    { id: 's8-2', scene: 'hash', start: 220, end: 230,
      caption: 'Collisions arrive early: with 365 possible values, 23 items already collide with probability 0.507297, and 366 items must collide by pigeonhole.',
      detail: 'The probability that k items are all distinct is the falling product (N)(N-1)...(N-k+1)/N^k. The page multiplies it out for k = 23 and N = 365 and gets 0.492703, so a collision has probability 0.507297. At k = 366 the product hits a zero factor, which is the pigeonhole principle appearing inside the arithmetic.',
      narration: 'Collisions arrive early. With three hundred and sixty-five values, twenty-three items already collide with probability about a half.',
      keyword: '0.507297' },
    { id: 's8-3', scene: 'hash', start: 230, end: 240,
      caption: 'For a 64-bit digest a collision needs about 2^32 attempts, not 2^64. Only the signer can use that: a receiver would need a second preimage, at 2^64.',
      detail: 'The birthday bound is about 1.18 times the square root of the digest space: 1.18 times 2^32, some five billion attempts. A collision is two messages the attacker chooses; a second preimage is a different message matching a given digest, and that stays at the full space size. That asymmetry is why the 2017 item says only the sender can mount the attack: the sender chooses both messages before signing.',
      narration: 'For a sixty-four-bit digest a collision needs about two to the thirty-two attempts. Only the signer can use that.',
      keyword: 'about 2^32',
      trap: 'Collision resistance and second-preimage resistance are different numbers: square root of the space against the whole space. The 2017 birthday-attack item turns on exactly that difference.' },

    /* ---------- scene 9: certificates ---------- */
    { id: 's9-1', scene: 'certificate', start: 240, end: 250,
      caption: 'A certificate is a name, a public key, and a validity period, signed by a certificate authority that a stranger already trusts.',
      detail: 'The problem it solves is the man in the middle. Knowing a public key is worthless if you do not know whose it is, and an attacker who can intercept the first exchange can substitute their own. A certificate binds the key to the name, and the authority signature is what makes the binding checkable by someone who has never met either party.',
      narration: 'A certificate is a name, a public key and a validity period, signed by an authority the stranger already trusts.',
      keyword: 'certificate authority' },
    { id: 's9-2', scene: 'certificate', start: 250, end: 260,
      caption: 'Verification walks the chain: the browser trusts a root, the root signed the server certificate, so the server key is believed to belong to the server name.',
      detail: 'Each link is a signature check, and the chain stops at a root key already installed on the machine. Expiry and revocation are part of the same idea: a binding is only believed while the authority says it holds. Without the chain the certificate is just a signed string with no anchor.',
      narration: 'Verification walks the chain from a trusted root down to the server certificate.',
      keyword: 'walks the chain' },
    { id: 's9-3', scene: 'certificate', start: 260, end: 270,
      caption: 'A MAC is a shared-key check: it detects change and proves the sender to a fellow key holder, but it cannot be shown to a third party.',
      detail: 'Because both parties hold the same key, either could have produced the MAC, so it proves nothing to a judge. A signature is different in exactly that respect, since only one party can produce it. This is the closest pair of confused concepts in the topic: MAC for integrity inside a shared-key session, signature for non-repudiation across parties.',
      narration: 'A MAC is a shared-key check. It proves the sender to a fellow key holder, and cannot be shown to a third party.',
      keyword: 'A MAC is a shared-key check',
      trap: 'A MAC gives integrity and authentication but not non-repudiation. Only a signature can be shown to a third party.' },

    /* ---------- scene 10: firewalls ---------- */
    { id: 's10-1', scene: 'firewall', start: 270, end: 280,
      caption: 'A packet filter reads the rule table top to bottom and stops at the first match. The page evaluates six rules against four packets and gets every decision by first match.',
      detail: 'First match, not best match, is the whole semantics: order is part of the policy, and a permissive rule placed too high makes every rule below it dead. The page also moves one rule and shows a decision change, which is what proves that order matters rather than being decoration.',
      narration: 'A packet filter reads the rule table top to bottom and stops at the first match.',
      keyword: 'first match' },
    { id: 's10-2', scene: 'firewall', start: 280, end: 290,
      caption: 'What a device can filter is what its layer can read: addresses at layer 3, ports and flags at layer 4, the actual request only at layer 7.',
      detail: 'A layer-4 device sees the IP header and the TCP or UDP header, plus its own clock. It cannot see a user name, a URL path or a file name, because those live above the transport header. An application proxy terminates the connection and reads the request, which is why it can filter on content and why it is slower.',
      narration: 'What a device can filter is what its layer can read: addresses, then ports, then the request itself.',
      keyword: 'what its layer can read' },
    { id: 's10-3', scene: 'firewall', start: 290, end: 300,
      caption: 'So a layer-4 firewall CANNOT block one user on a multi-user host: all of them share an address and use any port. GATE CSE 2011, answer D.',
      detail: 'Blocking all HTTP traffic is possible by blocking port 80 for a time window; blocking ICMP is possible from the protocol field; filtering one address in one direction is possible from the addresses. Singling out a user needs an identity that no header up to the transport layer carries. The page lists the four capabilities against the four options.',
      narration: 'So a layer-four firewall cannot block one user on a multi-user host, because all of them share an address and use any port.',
      keyword: 'cannot block one user',
      trap: 'Blocking "all HTTP" needs only port 80, so it is within layer 4. Blocking "one user" needs an identity that is not in any header up to layer 4.' }
  ]
};
