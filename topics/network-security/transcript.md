# Network Security: Properties, Keys, Signatures and Firewalls — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/network-security/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 30 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Three things a secure channel must do

*0:00 – 0:30 · objective: Name confidentiality, integrity and authentication, and say which key arrangement each one needs.*

**0:00–0:10** — Confidentiality: an eavesdropper who copies every packet learns nothing. Encryption is the only tool for this property.

> Caption: Confidentiality: an eavesdropper who copies every packet learns nothing about the message. Encryption is the only tool for this one.

**0:10–0:20** — Integrity: a changed message is detected. Authentication: the receiver knows who sent it, and the sender cannot deny it later.

> Caption: Integrity: a changed message is detected. Authentication: the receiver knows who sent it, and the sender cannot later deny it.

**0:20–0:30** — Every question here is one of those three, and naming which one decides the keys before any arithmetic starts.

> Caption: Every question on this page is one of those three, and the first step is always to name which. The name decides the keys before any arithmetic starts.

Exam-trap caption mode adds: *The word "secure" is not a property. Confidentiality uses the receiver key, authenticity uses the sender key, and the two answers are different sequences of the same four keys.*

## Scene 2. One key, and N(N-1)/2 of them

*0:30 – 1:00 · objective: Count the shared keys a group needs, and see why the count is the number of pairs rather than the number of people.*

**0:30–0:40** — Symmetric encryption uses one key for both directions. The same key locks and unlocks.

> Caption: Symmetric encryption uses one key for both directions: the same key locks and unlocks. DES and AES are the standard examples.

**0:40–0:50** — If every pair needs its own secret, the number of keys is N times N minus one, over two: the number of pairs.

> Caption: If every pair in a group of N must have its own secret, the number of keys is N(N-1)/2: the number of pairs, not the number of people.

**0:50–1:00** — That is the 2015 answer: N times N minus one over two. The distractors are the per-person count and the two-keys-per-person count.

> Caption: That is the answer to GATE CSE 2015 Set 1: N(N-1)/2. The distractors are the per-person count N(N-1) and the two-keys-per-person count 2N.

Exam-trap caption mode adds: *N(N-1)/2 counts pairs. If the question instead asks how many keys each person holds, the answer is N-1, and if it asks for an asymmetric system the answer is 2N keys in total.*

## Scene 3. Two keys, and which one you use

*1:00 – 1:30 · objective: State the direction rule: encrypt with the receiver public key for secrecy, with your own private key for proof.*

**1:00–1:10** — Public-key encryption gives each person a pair: a public key anyone may read, and a private key only its owner can use.

> Caption: Public-key encryption gives each person a pair: a public key anyone may read, and a private key only its owner can use.

**1:10–1:20** — For secrecy the sender encrypts with the receiver public key, and only the receiver private key opens it.

> Caption: For secrecy the sender encrypts with the receiver public key, and only the receiver private key opens it. Sender keys play no part.

**1:20–1:30** — For proof the direction reverses: the sender uses their own private key, and anyone verifies with the sender public key.

> Caption: For proof the direction reverses: the sender encrypts with their own private key, and anyone verifies with the sender public key.

Exam-trap caption mode adds: *Encrypting with your private key gives no secrecy, because your public key is public. It gives proof, and only proof.*

## Scene 4. RSA: n, phi(n), and the inverse of e

*1:30 – 2:00 · objective: Build a key pair from two primes and recover a private exponent as a modular inverse, on the two numbers GATE has used.*

**1:30–1:40** — RSA picks two primes, sets n to their product, and computes phi of n as p minus one times q minus one. Here n is 221 and phi is 192.

> Caption: RSA picks two primes p and q, sets n = pq, and computes phi(n) = (p-1)(q-1). With p = 13 and q = 17: n = 221 and phi(n) = 192.

**1:40–1:50** — The public exponent must share no factor with phi, and the private exponent is its inverse modulo phi. Thirty-five times eleven is two times one ninety-two plus one.

> Caption: The public exponent e must share no factor with phi(n). The private exponent d is the inverse of e modulo phi(n): here 35 times 11 = 385 = 2 times 192 + 1.

**1:50–2:00** — The 2019 numbers: n is 3007 and phi is 2880, so the primes sum to 128. They are 31 and 97, and the one above fifty is 97.

> Caption: GATE CSE 2019 gave n = 3007 and phi(n) = 2880. Then p + q = n - phi(n) + 1 = 128, the two primes are 31 and 97, and the factor above 50 is 97.

## Scene 5. Why a 51-step power costs 9 multiplications

*2:00 – 2:30 · objective: Run square-and-multiply on 3^51 mod 5 and see why the exponent is reduced modulo phi(n) and not modulo n.*

**2:00–2:10** — Encryption is one modular power, and decryption is the same power with the other exponent. Nothing else in RSA is arithmetic.

> Caption: Encryption is one modular power: the ciphertext is m^e mod n, and decryption is c^d mod n. Nothing else in RSA is arithmetic.

**2:10–2:20** — Square-and-multiply reads the exponent in binary. Fifty-one is one one zero zero one one, so five squarings and four multiplications.

> Caption: Square-and-multiply reads the exponent in binary. For 51 = 110011 that is five squarings and four multiplications: nine in all, against fifty for the naive loop.

**2:20–2:30** — Three to the fifty-one modulo five is two, by square-and-multiply and by the four-step cycle of powers.

> Caption: 3^51 mod 5 = 2, computed both by square-and-multiply and by the cycle of powers mod 5. GATE CSE 2019 asked this, and it is one line of arithmetic.

Exam-trap caption mode adds: *The exponent relation is e*d = 1 mod phi(n), not mod n. GATE CSE 2009 offered exactly that confusion, and the correct pair of equations was I and III.*

## Scene 6. A signature is the private key one job

*2:30 – 3:00 · objective: Sign a digest with the sender private key and verify it with the sender public key, and show verification failing under the wrong key.*

**2:30–2:40** — A signature is not the message encrypted. The sender hashes the message and signs the digest.

> Caption: A signature is not the message encrypted. The sender hashes the message and signs the digest, so the signature is short and fixed in size.

**2:40–2:50** — The transmitted pair is the message and the signed digest, with the sender private key doing the signing.

> Caption: The transmitted pair is the message and the signed digest. GATE CSE 2016 Set 1 asked for exactly this form, and the answer used the sender private key.

**2:50–3:00** — Verification uses the sender public key. Under any other key the check fails, which the page shows numerically.

> Caption: Verification uses the sender public key: that is the 2016 Set 2 answer, Anarkali public key. Under any other key the check fails, which the page demonstrates numerically.

Exam-trap caption mode adds: *Verification needs the signer public key, never the verifier own keys. The 2016 Set 2 item is answered in one word once that is clear.*

## Scene 7. Sign then encrypt: the order of the two operations

*3:00 – 3:30 · objective: Apply the key sequence of the 2013 item and say why signing first and encrypting second is the arrangement that keeps both properties.*

**3:00–3:10** — Signing gives proof, encrypting gives secrecy. A message that needs both is signed first and encrypted second.

> Caption: Signing gives proof. Encrypting gives secrecy. A message that needs both is signed first and encrypted second.

**3:10–3:20** — At the sender: own private key, then the receiver public key. At the receiver: own private key, then the sender public key.

> Caption: At X: apply X private key, then Y public key. At Y: apply Y private key, then X public key. That is GATE CSE 2013, and the answer was the last option.

**3:20–3:30** — Reversing the order still works arithmetically, but it exposes the signature and weakens the arrangement.

> Caption: Reversing the order still works arithmetically, but the resulting arrangement is weaker: the signature is exposed, and the receiver may act on unverified data.

## Scene 8. Hashes, and the birthday attack

*3:30 – 4:00 · objective: Separate a collision from a second preimage, and see why only the signer can profit from a birthday collision.*

**3:30–3:40** — A hash maps any input to a fixed-length digest, one way. MD5 and SHA-1 are the two the 2014 item named.

> Caption: A hash maps any input to a fixed-length digest, one way. MD5 and SHA-1 are the two named in GATE CSE 2014, where RSA and DES were the distractors.

**3:40–3:50** — Collisions arrive early. With three hundred and sixty-five values, twenty-three items already collide with probability about a half.

> Caption: Collisions arrive early: with 365 possible values, 23 items already collide with probability 0.507297, and 366 items must collide by pigeonhole.

**3:50–4:00** — For a sixty-four-bit digest a collision needs about two to the thirty-two attempts. Only the signer can use that.

> Caption: For a 64-bit digest a collision needs about 2^32 attempts, not 2^64. Only the signer can use that: a receiver would need a second preimage, at 2^64.

Exam-trap caption mode adds: *Collision resistance and second-preimage resistance are different numbers: square root of the space against the whole space. The 2017 birthday-attack item turns on exactly that difference.*

## Scene 9. Certificates and authentication

*4:00 – 4:30 · objective: Read a certificate as a signed binding of a name to a public key, and distinguish a certificate from a MAC.*

**4:00–4:10** — A certificate is a name, a public key and a validity period, signed by an authority the stranger already trusts.

> Caption: A certificate is a name, a public key, and a validity period, signed by a certificate authority that a stranger already trusts.

**4:10–4:20** — Verification walks the chain from a trusted root down to the server certificate.

> Caption: Verification walks the chain: the browser trusts a root, the root signed the server certificate, so the server key is believed to belong to the server name.

**4:20–4:30** — A MAC is a shared-key check. It proves the sender to a fellow key holder, and cannot be shown to a third party.

> Caption: A MAC is a shared-key check: it detects change and proves the sender to a fellow key holder, but it cannot be shown to a third party.

Exam-trap caption mode adds: *A MAC gives integrity and authentication but not non-repudiation. Only a signature can be shown to a third party.*

## Scene 10. Firewalls, and the layer they can see

*4:30 – 5:00 · objective: Evaluate an ordered rule table by first match, and state what a layer-4 device cannot do.*

**4:30–4:40** — A packet filter reads the rule table top to bottom and stops at the first match.

> Caption: A packet filter reads the rule table top to bottom and stops at the first match. The page evaluates six rules against four packets and gets every decision by first match.

**4:40–4:50** — What a device can filter is what its layer can read: addresses, then ports, then the request itself.

> Caption: What a device can filter is what its layer can read: addresses at layer 3, ports and flags at layer 4, the actual request only at layer 7.

**4:50–5:00** — So a layer-four firewall cannot block one user on a multi-user host, because all of them share an address and use any port.

> Caption: So a layer-4 firewall CANNOT block one user on a multi-user host: all of them share an address and use any port. GATE CSE 2011, answer D.

Exam-trap caption mode adds: *Blocking "all HTTP" needs only port 80, so it is within layer 4. Blocking "one user" needs an identity that is not in any header up to layer 4.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
