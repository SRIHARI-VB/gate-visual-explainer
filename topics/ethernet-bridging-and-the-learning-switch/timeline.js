/* ==========================================================================
   ethernet-bridging-and-the-learning-switch — THE timeline.
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
      id: 'bridge',
      n: 1,
      title: 'A bridge joins two segments and reads one field',
      start: 0, end: 30,
      objective: 'Say what a transparent bridge decides on, what it leaves alone, and which of the two domain counts it changes.'
    },
    {
      id: 'learn',
      n: 2,
      title: 'Three actions in a fixed order: learn, look up, act',
      start: 30, end: 60,
      objective: 'State the learning rule and the three possible actions, with the condition that selects each.'
    },
    {
      id: 'trace',
      n: 3,
      title: 'Eight frames through one switch, counted',
      start: 60, end: 90,
      objective: 'Run the algorithm frame by frame and read the resulting table, the actions and the copies.'
    },
    {
      id: 'domains',
      n: 4,
      title: 'Collision domains against broadcast domains',
      start: 90, end: 120,
      objective: 'Count both quantities on five small topologies, and say which device changes which count.'
    },
    {
      id: 'loop',
      n: 5,
      title: 'A loop has no end: the broadcast storm',
      start: 120, end: 150,
      objective: 'Show why a correct bridge in a loop produces frames forever, and what the counts look like.'
    },
    {
      id: 'root',
      n: 6,
      title: 'Spanning tree, step one: elect a root',
      start: 150, end: 180,
      objective: 'Read a bridge ID, elect the root by the lowest one, and name what a BPDU carries.'
    },
    {
      id: 'ports',
      n: 7,
      title: 'Step two: root ports, designated ports, blocked ports',
      start: 180, end: 210,
      objective: 'Assign the three port roles on a five-link, four-bridge topology and verify that the forwarding links form a tree.'
    },
    {
      id: 'timers',
      n: 8,
      title: 'From blocking to forwarding, in seconds',
      start: 210, end: 240,
      objective: 'Place the four port states on a time line and compute both convergence figures from the three default timers.'
    },
    {
      id: 'modes',
      n: 9,
      title: 'Where the delay goes: three forwarding modes',
      start: 240, end: 270,
      objective: 'Compute the wait before a frame can leave, for store-and-forward, fragment-free and cut-through.'
    },
    {
      id: 'procedure',
      n: 10,
      title: 'The procedure, and the traps that survive it',
      start: 270, end: 300,
      objective: 'Run a four-step procedure on any bridging question, and recognise the three traps by sight.'
    }
  ],

  events: [

    /* ---------------- scene 1: the bridge ---------------- */
    {
      id: 'br-1', scene: 'bridge', start: 0, end: 7.5,
      caption: 'A bridge joins two segments. It reads the destination MAC address and nothing else.',
      detail: 'A bridge, and the switch that is a fast bridge, is a layer-2 device: it joins two or more LAN segments into one LAN. Its whole decision rests on the 6-octet destination MAC address at the front of the Ethernet frame. It does not read the IP address, and it does not change the frame.',
      narration: 'A bridge joins two segments into one LAN. To decide, it reads one field: the destination MAC address at the front of the frame.',
      keyword: 'destination MAC address',
      trap: 'Reading the IP address. A bridge never does, which is exactly what separates it from a router.'
    },
    {
      id: 'br-2', scene: 'bridge', start: 7.5, end: 15,
      caption: 'A frame from A to D crosses, because D is on the far side. A frame to B would not.',
      detail: 'When the destination is on the other segment, the bridge sends the frame across. When the destination is on the segment the frame came from, the bridge drops it. The frame that crosses is byte for byte the frame that arrived: the bridge is transparent.',
      narration: 'A frame for D crosses, because D is on the far side. A frame for B would be dropped, because B is already on this side. Either way the frame itself is untouched.',
      keyword: 'crosses, dropped, untouched',
      trap: 'Assuming the bridge rewrites the header. It does not; a router does.'
    },
    {
      id: 'br-3', scene: 'bridge', start: 15, end: 22.5,
      caption: 'Bridge and router differ in what they read and in what they leave behind.',
      detail: 'A router strips the incoming frame, reads the IP destination, chooses a route, decrements the hop limit and builds a new frame with a new source MAC. A bridge does none of that. The consequence is that a router ends a broadcast domain and a bridge does not.',
      narration: 'A router rewrites the frame and forwards by IP address. A bridge forwards by MAC address and changes nothing.',
      keyword: 'rewrites against forwards',
      trap: 'Treating bridge and router as interchangeable because both selectively forward. Both filter; only one rewrites.'
    },
    {
      id: 'br-4', scene: 'bridge', start: 22.5, end: 30,
      caption: 'Collision domains: 2. Broadcast domains: 1. The bridge changed only the first.',
      detail: 'Each segment is its own collision domain, so two hosts on opposite segments can transmit at the same instant without colliding. But a broadcast frame is flooded to both segments, so the broadcast domain is still one. This single sentence answers a large share of the questions asked on the clause.',
      narration: 'Two collision domains, one broadcast domain. The bridge split the first and left the second exactly as it was.',
      keyword: 'two collision, one broadcast',
      trap: 'Answering "it splits both". A bridge never splits a broadcast domain; only a router or a VLAN does.'
    },

    /* ---------------- scene 2: the algorithm ---------------- */
    {
      id: 'ln-1', scene: 'learn', start: 30, end: 37.5,
      caption: 'Step one: learn the source address, with the port the frame arrived on.',
      detail: 'The first thing a bridge does with any frame is record the source address against the ingress port. That is the whole learning mechanism: traffic teaches the table where each station lives, and nothing has to be configured. If the address is already known and the port has changed, the entry moves.',
      narration: 'Step one, and it is the only reason the table exists: record the source address against the port the frame came in on.',
      keyword: 'source address, ingress port',
      trap: 'Learning the destination. The destination is the question, not the answer; the source is what the bridge can trust.'
    },
    {
      id: 'ln-2', scene: 'learn', start: 37.5, end: 45,
      caption: 'Step two: look the destination up in the table as it stood before this frame.',
      detail: 'The lookup uses the table as it was before the frame arrived. In this trace the difference never matters, because the source and the destination differ, but it matters when a station sends to itself across two ports, and it matters for the order of the three actions.',
      narration: 'Step two: look the destination up in the table. The answer decides the action.',
      keyword: 'look the destination up',
      trap: 'Confusing the two lookups. The source is written, the destination is read.'
    },
    {
      id: 'ln-3', scene: 'learn', start: 45, end: 52.5,
      caption: 'Step three: not in the table, flood. Same port, filter. Another port, forward.',
      detail: 'Three outcomes, three names. Unknown unicast, broadcast and multicast are flooded out of every port except the ingress port. A destination learned on the ingress port is filtered, which is why two hosts behind one hub do not have their traffic repeated back. A destination on another port is forwarded to that one port only.',
      narration: 'Three outcomes. Unknown, so flood to every port but this one. Same port, so filter and drop. Another port, so forward to that port alone.',
      keyword: 'flood, filter, forward',
      trap: 'Calling a filter a flood with a smaller list. Filtering sends nothing at all.'
    },
    {
      id: 'ln-4', scene: 'learn', start: 52.5, end: 60,
      caption: 'Entries age out after 300 s of silence, so a station that never sends is never learned.',
      detail: 'The table is finite, so entries expire. The default ageing time is 300 seconds of silence from that address. A station that only receives is never learned, so every frame to it is flooded: that is a normal, correct, and slightly wasteful state of affairs, and it is why the first frame of any conversation always floods.',
      narration: 'Entries expire after three hundred seconds of silence. A station that only listens is never learned, and its frames are flooded forever.',
      keyword: 'three hundred seconds',
      trap: 'Assuming the table is complete. It only ever holds the addresses that have spoken recently.'
    },

    /* ---------------- scene 3: the trace ---------------- */
    {
      id: 'tr-1', scene: 'trace', start: 60, end: 67.5,
      caption: 'Frame one: A to B. The table is empty, so the frame floods to three ports.',
      detail: 'Nothing has been sent yet, so the bridge knows no addresses. It learns A on port 1 from the source field, then finds no entry for B and floods the frame out of ports 2, 3 and 4. Three copies leave, one frame arrived.',
      narration: 'Frame one, A to B. The table is empty, so the bridge learns A on port one and floods the frame out of three ports.',
      keyword: 'empty table, three copies',
      trap: 'Forgetting the uplink. Every port except the ingress port gets a copy, including the one towards the next switch.'
    },
    {
      id: 'tr-2', scene: 'trace', start: 67.5, end: 75,
      caption: 'Frame two: B replies. A is known on port 1, so the frame goes to one port only.',
      detail: 'B now sends to A. The bridge learns B on port 2 and finds A already in the table on port 1. One copy leaves, out of port 1. From this moment the conversation costs one copy per frame instead of three.',
      narration: 'B replies. A is already known on port one, so this frame leaves by one port only. The table has paid for itself in one exchange.',
      keyword: 'one copy',
      trap: 'Expecting the reply to flood too. The reply floods nothing, because the request already taught the table where A is.'
    },
    {
      id: 'tr-3', scene: 'trace', start: 75, end: 82.5,
      caption: 'Frame seven: E sends to D, and D is on the ingress port, so the bridge filters.',
      detail: 'E and D both sit behind the uplink port. When E sends to D, the bridge learns E on port 4 and finds D already on port 4, the port the frame arrived on. Forwarding it would put the frame back on the segment it came from, so the bridge drops it. Nothing leaves the bridge at all.',
      narration: 'Frame seven is the interesting one. E sends to D, and D is on the same port the frame arrived on, so the bridge drops it. Nothing leaves.',
      keyword: 'same port, drops it',
      trap: 'Thinking a filter is an error. It is the correct action, and it is what keeps a local conversation local.'
    },
    {
      id: 'tr-4', scene: 'trace', start: 82.5, end: 90,
      caption: 'Eight frames: two floods, five forwards, one filter, eleven copies. Four table entries.',
      detail: 'The counts are the lesson. Eight frames produced two floods of three copies, five forwards of one copy and one filter of none: eleven copies on the wire in total. The table holds four entries, one for each distinct source, and none for C, which never sent anything.',
      narration: 'Eight frames: two floods, five forwards, one filter. Eleven copies on the wire. Four table entries, one per station that spoke.',
      keyword: 'eleven copies, four entries',
      trap: 'Counting destinations. The table has one entry per source that spoke, and C has none.'
    },

    /* ---------------- scene 4: domains ---------------- */
    {
      id: 'dm-1', scene: 'domains', start: 90, end: 97.5,
      caption: 'One hub and four PCs: one collision domain, one broadcast domain.',
      detail: 'A hub is a repeater. Every bit it receives is copied onto every other port, so all four PCs share one medium and one collision domain. One broadcast reaches all four. The two counts are both one.',
      narration: 'One hub, four PCs: one collision domain, because every port shares the same wire. One broadcast domain.',
      keyword: 'one and one',
      trap: 'Counting a hub as four domains because it has four ports. Ports are not domains; media are.'
    },
    {
      id: 'dm-2', scene: 'domains', start: 97.5, end: 105,
      caption: 'One switch and four PCs: four collision domains, still one broadcast domain.',
      detail: 'A switch stores each frame and forwards it out of the right port, so each port is its own medium and its own collision domain: four. But a broadcast is flooded out of all of them, so the broadcast domain is still one. This is the single most asked statement on the clause.',
      narration: 'One switch, four PCs: four collision domains, because each port is its own wire. Still one broadcast domain, because a broadcast is flooded everywhere.',
      keyword: 'four collision, one broadcast',
      trap: 'Saying the switch splits the broadcast domain. It floods broadcasts by design, so it cannot.'
    },
    {
      id: 'dm-3', scene: 'domains', start: 105, end: 112.5,
      caption: 'Two switches joined: seven collision domains, one broadcast domain.',
      detail: 'Each switch contributes three host ports and one inter-switch port. The inter-switch link is one medium shared by both ends, so the count is three plus three plus one, which is seven, not eight. The broadcast domain is still one, because the two switches flood to each other.',
      narration: 'Two switches joined. Three host ports, the shared link, three more host ports: seven collision domains. One broadcast domain, because the switches flood to each other.',
      keyword: 'seven, not eight',
      trap: 'Adding the two port counts and forgetting that the link between them is one medium, not two.'
    },
    {
      id: 'dm-4', scene: 'domains', start: 112.5, end: 120,
      caption: 'Put a router between them: the broadcast domains become two. A hub on one port stays one.',
      detail: 'A router terminates the broadcast domain, so the same picture with a router in the middle gives two broadcast domains and eight collision domains, one more than before because the router adds two media. A hub hung off a single switch port costs one collision domain, not three, and changes no broadcast count.',
      narration: 'A router in the middle makes two broadcast domains, and the counts separate at last. A hub on one switch port costs one collision domain, not three.',
      keyword: 'router ends the domain',
      trap: 'Counting the router as a broadcast domain of its own. It is a boundary, not a domain.'
    },

    /* ---------------- scene 5: the loop ---------------- */
    {
      id: 'lp-1', scene: 'loop', start: 120, end: 127.5,
      caption: 'Four bridges, fully meshed. Each has three trunks and one host port.',
      detail: 'Every bridge is connected to every other bridge, and each also has one port to a host. Redundancy like this is deliberate: it is what survives a link failure. It is also what a bridge cannot cope with, because nothing in the frame says how far it has travelled.',
      narration: 'Four bridges, each connected to all three others, plus one host port. The redundancy is deliberate; the trouble is that a frame carries no history.',
      keyword: 'fully meshed, no history',
      trap: 'Thinking redundancy is the mistake. The mistake is having it without a spanning tree.'
    },
    {
      id: 'lp-2', scene: 'loop', start: 127.5, end: 135,
      caption: 'One broadcast is flooded three ways: three frames. Each of those is flooded three ways again: nine.',
      detail: 'A copy arriving on one port leaves by the other three. One of those three reaches a host and stops there; two keep circulating. So the second round costs nine frames, and from then on the frames per round double: eighteen, thirty-six, seventy-two.',
      narration: 'One broadcast, flooded three ways: three frames. Each arrives somewhere and is flooded three ways again: nine. Two of every three keep going.',
      keyword: 'three, then nine',
      trap: 'Assuming the copies stop at the hosts. The trunk copies do not, and they are the ones that saturate the links.'
    },
    {
      id: 'lp-3', scene: 'loop', start: 135, end: 142.5,
      caption: 'Ten rounds cost 4602 frames, and the count is still rising. Nothing ever dies.',
      detail: 'There is no hop limit in an Ethernet frame and no time to live, so a flooded frame has no way to expire. The storm does not stop when a link saturates; it fills the link and then the next one. The hosts see the same broadcast again and again, and the CPUs servicing those interrupts climb with it.',
      narration: 'Ten rounds, four thousand six hundred and two frames, and still rising. An Ethernet frame has no hop limit, so nothing expires it.',
      keyword: 'no hop limit',
      trap: 'Looking for the faulty bridge. Every bridge here is behaving exactly as specified.'
    },
    {
      id: 'lp-4', scene: 'loop', start: 142.5, end: 150,
      caption: 'The table never settles either: the same source arrives on two ports in turn.',
      detail: 'Because copies of one frame arrive at a bridge from two different neighbours, the bridge learns the same source address on two ports in successive instants. The entry flips from port to port. Frames then follow the wrong port, so unicast traffic is damaged as well as broadcast traffic. This is MAC address flapping.',
      narration: 'The table flips as well. Copies arrive from two directions, so the same source is learned on two ports in turn, and unicast frames start following the wrong one.',
      keyword: 'flapping',
      trap: 'Thinking only broadcasts suffer. A moving table entry breaks ordinary unicast delivery too.'
    },

    /* ---------------- scene 6: the root ---------------- */
    {
      id: 'rt-1', scene: 'root', start: 150, end: 157.5,
      caption: 'The bridge ID is a 2-octet priority and a 6-octet MAC. The lowest ID wins.',
      detail: 'The default priority is 32768, and the priority is configurable only in multiples of 4096. When priorities tie, which they do by default, the lowest MAC address decides. So the root is chosen by an identifier, not by speed, not by position, and not by traffic.',
      narration: 'The bridge ID is a priority plus a MAC address. All four bridges here are at the default 32768, so the lowest MAC wins, and that is B1.',
      keyword: 'lowest ID',
      trap: 'Assuming the most central or the fastest bridge becomes root. Only the identifier decides.'
    },
    {
      id: 'rt-2', scene: 'root', start: 157.5, end: 165,
      caption: 'A BPDU carries the root ID, the root path cost, the sender ID, the port ID and the timers.',
      detail: 'Bridges exchange bridge protocol data units every two seconds. Each one names the root the sender believes in, the cost to reach it, who the sender is, which port sent it, and the three timers. A bridge keeps the best BPDU it has heard and discards the rest.',
      narration: 'Every two seconds a bridge sends a BPDU: who it thinks the root is, what that costs, who it is, which port, and the timers.',
      keyword: 'every two seconds',
      trap: 'Forgetting that only the root originates. Everyone else relays and adds cost.'
    },
    {
      id: 'rt-3', scene: 'root', start: 165, end: 172.5,
      caption: 'Root path cost is accumulated along the way: 19 to B2, 19 to B4, 38 to B3.',
      detail: 'The root advertises cost zero. Each bridge adds the cost of the port it received the BPDU on, using the standard table: 100 for 10 Mb/s, 19 for 100 Mb/s, 4 for 1 Gb/s, 2 for 10 Gb/s. So B2 and B4 each reach the root at 19, and B3 reaches it at 38 by either of two equal routes.',
      narration: 'The root starts at zero and every hop adds its port cost: nineteen for a hundred megabit link. So B2 and B4 sit at nineteen, and B3 at thirty-eight.',
      keyword: 'add the port cost',
      trap: 'Using bandwidth as the cost. The cost is a small integer from a table, and lower is better.'
    },
    {
      id: 'rt-4', scene: 'root', start: 172.5, end: 180,
      caption: 'A tie at equal cost is broken by the lower neighbouring bridge ID: B3 goes through B2.',
      detail: 'B3 has two routes of cost 38: through B2 and through B4. The standard breaks the tie with the lowest sender bridge ID, which is B2. So B3 chooses the port towards B2 as its root port, and the route through B4 is left for the blocking decision later.',
      narration: 'B3 has two routes of cost thirty-eight. The tie goes to the lower neighbour, B2, so that is its root port.',
      keyword: 'tie, lower neighbour',
      trap: 'Breaking a tie by hop count or by port number first. The sender bridge ID comes before the port ID.'
    },

    /* ---------------- scene 7: the ports ---------------- */
    {
      id: 'pt-1', scene: 'ports', start: 180, end: 187.5,
      caption: 'Every non-root bridge picks one root port: the port on its cheapest path to the root.',
      detail: 'B2, B3 and B4 each choose exactly one root port. B2 and B4 point at B1 directly; B3 points at B2, because that is the neighbour its best path came through. A bridge has exactly one root port, or none if it is the root.',
      narration: 'One root port each. B2 and B4 point straight at B1. B3 points at B2, the neighbour its best path came through.',
      keyword: 'exactly one root port',
      trap: 'Giving a bridge two root ports when two routes tie. Only one survives, and the tie-break decides which.'
    },
    {
      id: 'pt-2', scene: 'ports', start: 187.5, end: 195,
      caption: 'Every segment picks one designated port: the end with the lower root path cost.',
      detail: 'A segment is a link. For each link, the two ends compare their root path costs; the lower one becomes the designated port and is responsible for sending BPDUs onto that segment. Where the costs tie, the lower bridge ID wins. Exactly one designated port per segment, always.',
      narration: 'Each link also elects one designated port: the end closer to the root, or the lower bridge ID when the costs tie.',
      keyword: 'one per segment',
      trap: 'Believing the designated port must be on the root bridge. It is on whichever end is closer to the root.'
    },
    {
      id: 'pt-3', scene: 'ports', start: 195, end: 202.5,
      caption: 'Every other port is blocked: B3 towards B4, and B4 towards B2. Two ports, two loops cut.',
      detail: 'A port that is neither a root port nor a designated port is blocked. Here that is B3s port towards B4 and B4s port towards B2. Blocked does not mean dead: the port still receives BPDUs, and it will take over within seconds if the tree changes.',
      narration: 'Everything else is blocked: B3 towards B4, and B4 towards B2. Two blocked ports, and those two are the loops being cut.',
      keyword: 'blocked, not dead',
      trap: 'Calling a blocked port faulty, or assuming it forwards nothing at all. It listens for BPDUs the whole time.'
    },
    {
      id: 'pt-4', scene: 'ports', start: 202.5, end: 210,
      caption: 'Three forwarding links from five: E - (B - 1) = 5 - 3 = 2 blocked, and the rest is a tree.',
      detail: 'With B bridges and E links, a spanning tree keeps B - 1 links, so E - (B - 1) links are removed, one blocked port each. Here five links and four bridges give three forwarding links and two blocked ports. The three forwarding links connect all four bridges with no cycle: verified, not assumed.',
      narration: 'Five links, four bridges: three forwarding links, two blocked ports. That is a tree, and the count is an identity you can check.',
      keyword: 'E minus B minus one',
      trap: 'Counting blocked links instead of blocked ports. Each removed link has exactly one blocked end.'
    },

    /* ---------------- scene 8: the timers ---------------- */
    {
      id: 'tm-1', scene: 'timers', start: 210, end: 217.5,
      caption: 'A port that must start forwarding goes blocking, listening, learning, forwarding.',
      detail: 'A blocked port cannot jump straight to forwarding, because the other bridges may not yet agree on the new tree. It listens for one forward delay, learning nothing; then learns for one forward delay, filling its table without forwarding; then it forwards.',
      narration: 'A port cannot jump to forwarding. It listens for one forward delay, learns for another, and only then forwards.',
      keyword: 'listen, learn, forward',
      trap: 'Skipping the listening state because the port already has a table. Learning comes second for a reason.'
    },
    {
      id: 'tm-2', scene: 'timers', start: 217.5, end: 225,
      caption: 'Each of those two waits is the forward delay: 15 seconds by default, so 30 seconds to forward.',
      detail: 'The forward delay is 15 seconds by default, and the same value governs both the listening and the learning state. Thirty seconds is therefore the shortest time from blocked to forwarding, and it is deliberate: it is longer than the time a stale frame can survive in the network.',
      narration: 'Fifteen seconds each, so thirty seconds from blocked to forwarding. That is the shortest it can be, and it is on purpose.',
      keyword: 'fifteen each, thirty total',
      trap: 'Adding the two waits as if they were one. They are two states of equal length.'
    },
    {
      id: 'tm-3', scene: 'timers', start: 225, end: 232.5,
      caption: 'Worst case after a change: max age 20 plus 15 plus 15, which is 50 seconds.',
      detail: 'If the failure is not directly attached, the bridge has to wait for the max age timer to expire first: 20 seconds without a BPDU, then the two forward delays. That gives 50 seconds. A link that fails on a port of this bridge is noticed at once, so only the two delays apply: 30 seconds.',
      narration: 'If the failure is further away, add the twenty-second max age first: fifty seconds in the worst case. A directly failed link skips it and converges in thirty.',
      keyword: 'twenty plus fifteen plus fifteen',
      trap: 'Quoting 50 seconds for every failure. It is the worst case, not the only case.'
    },
    {
      id: 'tm-4', scene: 'timers', start: 232.5, end: 240,
      caption: 'Hello is 2 s and the MAC ageing time is 300 s: different timers, different jobs.',
      detail: 'The hello timer is 2 seconds, and twenty seconds of silence is ten missed BPDUs, which is why max age is 20. The ageing time of a MAC table entry is 300 seconds and has nothing to do with the tree: it says how long an idle station stays in the forwarding table.',
      narration: 'Hello every two seconds, so twenty seconds is ten missed BPDUs. The table ageing time is three hundred seconds, and it is a separate clock entirely.',
      keyword: 'two, twenty, three hundred',
      trap: 'Mixing the 20-second max age with the 300-second ageing time. One is the tree, the other is the table.'
    },

    /* ---------------- scene 9: the modes ---------------- */
    {
      id: 'md-1', scene: 'modes', start: 240, end: 247.5,
      caption: 'A full frame is 1514 octets: 14 of header and 1500 of payload, so 12112 bits.',
      detail: 'The frame that matters for the arithmetic is the maximum Ethernet frame: 14 octets of header, 1500 of payload, no tag. That is 1514 octets, or 12112 bits. At 100 Mb/s the serialisation time is 12112 divided by one hundred million, which is 121.12 microseconds.',
      narration: 'Fourteen octets of header, fifteen hundred of payload: fifteen hundred and fourteen, which is twelve thousand one hundred and twelve bits.',
      keyword: '1514 octets, 12112 bits',
      trap: 'Forgetting the header, or adding the preamble and the inter-frame gap to a frame that is defined without them.'
    },
    {
      id: 'md-2', scene: 'modes', start: 247.5, end: 255,
      caption: 'Store and forward waits the whole 121.12 microseconds before it decides anything.',
      detail: 'A store-and-forward switch receives the entire frame, checks its CRC, and only then forwards. The wait is the full serialisation time: 121.12 microseconds at 100 Mb/s, and a tenth of that at 1 Gb/s. What it buys is that a corrupted frame is dropped at the switch instead of being carried onward.',
      narration: 'Store and forward waits for the whole frame: a hundred and twenty-one microseconds, and it checks the frame before it goes on.',
      keyword: 'the whole frame',
      trap: 'Assuming the wait is the payload only. The check covers the whole frame, so the whole frame is received.'
    },
    {
      id: 'md-3', scene: 'modes', start: 255, end: 262.5,
      caption: 'Cut-through waits for 6 octets, 0.48 microseconds. Fragment-free waits for 64, 5.12.',
      detail: 'Cut-through reads only the destination address, six octets, and starts forwarding: 48 bits, 0.48 microseconds. Fragment-free is the compromise: it waits for the first 64 octets, the collision window, so a runt frame is caught, at 512 bits and 5.12 microseconds.',
      narration: 'Cut-through waits for six octets: less than half a microsecond. Fragment-free waits for sixty-four: about five microseconds, and it catches the runts.',
      keyword: 'six octets, sixty-four octets',
      trap: 'Calling cut-through faster end to end. It is faster to start; the last bit still takes the full serialisation time.'
    },
    {
      id: 'md-4', scene: 'modes', start: 262.5, end: 270,
      caption: 'The store-and-forward wait is about 252 times the cut-through wait, and it buys the CRC check.',
      detail: '121.12 divided by 0.48 is 252.3. That is the price of checking every frame before forwarding it. Whether it is worth paying is a design question, not an exam one, but the ratio is exactly the kind of number a question asks for, and it is computed here rather than remembered.',
      narration: 'Two hundred and fifty-two times the wait, for one CRC check. At a gigabit, divide all three by ten: the frame does not change.',
      keyword: '252 times',
      trap: 'Dividing by 100 when the rate goes from 100 Mb/s to 1 Gb/s. It is a factor of ten, not a hundred.'
    },

    /* ---------------- scene 10: the procedure ---------------- */
    {
      id: 'pr-1', scene: 'procedure', start: 270, end: 277.5,
      caption: 'Four steps: which device, which table state, which action, which topology.',
      detail: 'Every question on this clause is one of four questions. Name the device, because a hub, a switch and a router give three different counts. Name the table state, because before and after learning differ. Name the action, because flood, forward and filter have three different copy counts. And check for a loop, because a blocked port changes the answer.',
      narration: 'Four steps. Which device. Which table state. Which action. Which topology. Each one removes half the wrong answers.',
      keyword: 'device, state, action, topology',
      trap: 'Starting with the arithmetic. The device and the table state decide the arithmetic.'
    },
    {
      id: 'pr-2', scene: 'procedure', start: 277.5, end: 285,
      caption: 'The invariants: one domain per switch port, one entry per source, E minus B minus one blocked ports.',
      detail: 'Three identities carry the clause. A switch port is one collision domain and a hub is one for all of its ports. The forwarding table has one entry per source that has spoken, never one per destination. And a spanning tree blocks exactly E minus (B minus 1) ports. Each is checkable on the diagram you were given.',
      narration: 'Three identities: a port is a domain, an entry is a source, and a tree blocks E minus B minus one ports. Each one is checkable on the diagram.',
      keyword: 'three identities',
      trap: 'Memorising counts instead of the identity that produces them, so a change of topology loses the answer.'
    },
    {
      id: 'pr-3', scene: 'procedure', start: 285, end: 292.5,
      caption: 'Trap one: a switch splits the broadcast domain. Trap two: it learns destinations.',
      detail: 'The first trap turns a correct broadcast count into a wrong one by exactly one domain per switch. The second reverses the learning rule, and it is tempting because the table is used to look up destinations. It is built from sources. A third trap calls a blocked port broken, when it is the port doing the work.',
      narration: 'Three traps. A switch splitting the broadcast domain, which it does not. Learning destinations, which it does not. And a blocked port being broken, which it is not.',
      keyword: 'broadcast, destination, blocked',
      trap: 'All three produce numbers that appear among the options, which is why they survive a careless check.'
    },
    {
      id: 'pr-4', scene: 'procedure', start: 292.5, end: 300,
      caption: 'Say the unit first: domains, entries, copies, ports or seconds. Then count.',
      detail: 'Four of the five quantities are counts on a small diagram; the fifth is a sum of timers. Writing the unit before the number catches the mistake where a collision domain count is given for a broadcast domain question, and it catches the seconds question answered in ports.',
      narration: 'Say the unit before you compute. Domains, entries, copies, ports or seconds. The unit is where the marks are lost.',
      keyword: 'the unit first',
      trap: 'Answering a question about domains with a count of devices. The two differ by every hub in the picture.'
    }
  ]
};
