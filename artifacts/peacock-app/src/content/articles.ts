// ── Shared article content store ───────────────────────────────────────────────
// Used by Blog.tsx, DestinationsGuide.tsx, and ArticlePage.tsx

export type ArticleCategory =
  | 'Seasonal'
  | 'Wildlife'
  | 'Culture & Tips'
  | 'Food & Drink'
  | 'Itineraries';

export interface ContentSection {
  heading?: string;
  paragraphs?: string[];
  list?: { label?: string; text: string }[];
  pullquote?: string;
  tip?: string;
  tipLabel?: string;
}

export interface FullArticle {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  readTime: number;
  category: ArticleCategory;
  date: string;
  featured?: boolean;
  author: string;
  body: ContentSection[];
  relatedSlugs: string[];
  ctaHref: string;
  ctaLabel: string;
}

export const ARTICLES: FullArticle[] = [
  // ────────────────────────────────────────────────────────────────────────────
  {
    slug: 'when-to-visit-sri-lanka',
    title: 'When to Visit Sri Lanka: The Complete Seasonal Guide',
    excerpt:
      'With two monsoon seasons and year-round sunshine somewhere on the island, knowing when to visit which region changes everything about your trip.',
    image:
      'https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/69838bc1712205ff655de71c_5052216621-ezgif.com-webp-to-jpg-converter.jpg',
    readTime: 5,
    category: 'Seasonal',
    date: 'Mar 2026',
    featured: true,
    author: 'Peacock Drivers Editorial',
    body: [
      {
        heading: 'The two-monsoon paradox',
        paragraphs: [
          "Sri Lanka has two monsoon seasons that affect different coasts at different times — which means there is almost always a dry corner of the island to explore. Understanding this rhythm isn't just useful; it's the difference between a holiday in golden sunshine and one spent waiting out heavy afternoon downpours.",
          "The southwest monsoon (Yala) runs from May through September and brings rain to the west coast, south coast, and hill country. The northeast monsoon (Maha) runs from October through February and drenches the east coast and northern plains. The Cultural Triangle, sitting in the island's drier north-central interior, largely escapes both and enjoys reliable weather year-round.",
        ],
      },
      {
        heading: 'December to March: the classic high season',
        paragraphs: [
          "The west and south coasts are at their best — warm, dry, and with the kind of flat ocean that makes Mirissa and Unawatuna genuinely beautiful. The hill country and Cultural Triangle are also excellent. This is when Sri Lanka sees its highest visitor numbers, so popular spots like Sigiriya, the Nine Arch Bridge in Ella, and the Mirissa whale watching boats all require advance booking.",
          "Nuwara Eliya in the highlands is at its most English — cool misty mornings, firepits in the evening, and cherry blossoms in late February. Temperature-wise, coastal areas sit around 28–32°C; Nuwara Eliya drops to 8°C at night.",
        ],
        pullquote:
          '"There is always a sunny coast in Sri Lanka — you just need to know which one to find."',
      },
      {
        heading: 'April: the shoulder sweet spot',
        paragraphs: [
          "April is arguably Sri Lanka's most interesting month for travellers who know where to go. The Sinhala and Tamil New Year falls on 13–14 April — a genuine national festival that transforms villages across the country with firecrackers, oil-lamp rituals, and communal cooking in every courtyard. Hotels fill quickly over New Year, but the week after is often quiet and warm with lingering dry weather before the southwest monsoon arrives.",
        ],
      },
      {
        heading: 'May to September: go east',
        paragraphs: [
          "When the southwest monsoon makes the west coast choppy and grey, the east coast blooms into its finest season. Trincomalee offers arguably the best snorkelling in Sri Lanka around Pigeon Island, and the bay is calm enough for kayaking by 7am. Arugam Bay becomes a surf destination of genuine international standing, drawing long-boarders from Europe and Australia.",
          "The Cultural Triangle — Sigiriya, Polonnaruwa, Anuradhapura — sees far fewer crowds during this period and stays largely dry. Yala National Park is at its best for wildlife in the dry season (June–September) as animals concentrate around shrinking waterholes, dramatically improving leopard sighting rates.",
        ],
        tip: 'Book safari jeeps for Yala between June and August well in advance — this is peak leopard season and availability at reputable operators fills up months ahead.',
        tipLabel: 'Driver tip',
      },
      {
        heading: 'October and November: the transition',
        paragraphs: [
          "Short, sharp rain showers visit most of the island during these months as the northeast monsoon builds. The hill country can be overcast, but a week-long itinerary structured around the Cultural Triangle and Colombo remains perfectly viable. The landscape is at its most intensely green — waterfalls run hard, tea estates glow, and the roads feel quieter and more personal.",
        ],
      },
    ],
    relatedSlugs: ['monsoon-season-travel', 'east-coast-guide', 'wildlife-safari-yala'],
    ctaHref: '/tours',
    ctaLabel: 'Browse seasonal tours',
  },

  // ────────────────────────────────────────────────────────────────────────────
  {
    slug: 'sri-lankan-food-guide',
    title: "Sri Lankan Food: A Complete Traveller's Guide",
    excerpt:
      'From kottu roti at midnight stalls to hoppers at dawn, the food of Sri Lanka is a revelation. Here\'s what to eat, where, and how.',
    image:
      'https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/6989df099e7a4a0b5ecbcd53_Screenshot%202026-02-09%20at%203.57.01%E2%80%AFPM.png',
    readTime: 8,
    category: 'Food & Drink',
    date: 'Feb 2026',
    author: 'Peacock Drivers Editorial',
    body: [
      {
        heading: 'Why Sri Lankan food is misunderstood',
        paragraphs: [
          "Sri Lankan cuisine is not Indian food, though the two share some ancestry. It is bolder, wetter, and more coconut-forward — built on a foundation of fresh coconut milk, pandan leaf, curry leaf, and a dry-roasted spice blend called unroasted curry powder that gives Sri Lankan curries their characteristically deep, almost smoky base note.",
          "The island's geography explains much of its culinary diversity. The coast is fish country — tuna, seer fish, and crab dominate the south. The highlands are where you find vegetable-heavy dishes, jackfruit curries, and dhal so good it rivals anything you've eaten. Colombo, as ever, mixes everything together and adds a Malay-inflected layering from its trading-port history.",
        ],
      },
      {
        heading: 'The must-eat list',
        paragraphs: [],
        list: [
          { label: 'Hoppers (appa)', text: 'Bowl-shaped fermented rice-flour pancakes, crispy at the edges and soft in the centre. Eat them for breakfast with a runny egg in the well, or with pol sambol (fresh coconut chilli relish).' },
          { label: 'Kottu roti', text: 'Chopped roti stir-fried with egg, vegetables, and curry on a flat iron griddle. The rhythmic metal-on-metal sound of the blades is the sound of Sri Lankan street food. Best after 9pm.' },
          { label: 'Rice and curry', text: 'The national meal. A mound of red or white rice surrounded by 4–8 small dishes: dhal, parippu, pol sambola, fish or meat curry, tempered eggplant, green leaves. Eat with your right hand.' },
          { label: 'String hoppers (idiyappam)', text: 'Steamed nests of pressed rice-flour noodles, served with coconut milk gravy and curry. Light, gluten-free, and completely addictive.' },
          { label: 'Buffalo curd with kithul treacle', text: 'The definitive Sri Lankan dessert: thick, slightly tangy yogurt made from buffalo milk, drizzled with kithul palm syrup. You\'ll find it everywhere in clay pots.' },
          { label: 'Wambatu moju', text: 'A sweet-sour pickle of fried eggplant and shallots with mustard seeds and vinegar. Polarising on first bite, essential on the third.' },
        ],
        pullquote: '"Order the rice and curry lunch before noon — that\'s when the pots are freshest and the cook is proudest."',
      },
      {
        heading: 'Where to eat',
        paragraphs: [
          "For authentic flavour, eat where you see Sri Lankans eating. A packed local 'hotel' (the word for a small lunch restaurant) with a handwritten menu and a single rice and curry option at 250–400 rupees is always worth the gamble. In Colombo, the neighbourhood of Pettah has market-stall food that is genuinely world-class if you know where to stop.",
          "The south coast around Mirissa and Weligama has a cluster of excellent seafood restaurants where the morning catch translates into grilled seer fish by lunchtime. In the hill country, look for roadside stalls selling hot corn on the cob, roasted peanuts, and freshly cut wood-apple — a tart, aromatic fruit almost impossible to find outside Asia.",
        ],
        tip: 'Our drivers know where to eat. Tell them what you want — local rice and curry, fresh seafood, vegetarian — and they will take you somewhere that isn\'t in any guidebook.',
        tipLabel: 'Ask your driver',
      },
      {
        heading: 'Spice and heat',
        paragraphs: [
          "Sri Lankan curries range from mildly fragrant to eye-watering. Dishes marked 'Sri Lanka style' on tourist-facing menus have often been dialled back for Western palates. If you want the real thing, say 'strong chilli, please' or nothing at all — the cook will gauge you.",
          "The iconic 'Lion Lager' beer is the standard pairing for spicy food, though freshly-squeezed lime juice with soda is what most locals actually drink. Ceylon tea — served black and sweet in most local cafés — appears at every meal.",
        ],
      },
    ],
    relatedSlugs: ['spice-gardens-matale', 'cultural-etiquette', 'what-to-pack-for-sri-lanka'],
    ctaHref: '/tours',
    ctaLabel: 'Explore food-focused tours',
  },

  // ────────────────────────────────────────────────────────────────────────────
  {
    slug: 'what-to-pack-for-sri-lanka',
    title: 'What to Pack for Sri Lanka',
    excerpt:
      'Temples, beaches, tea country, and jungle — Sri Lanka demands a versatile bag. Our driver-tested packing list covers every terrain.',
    image:
      'https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/6989df190501fea92245c727_Screenshot%202026-02-09%20at%203.55.06%E2%80%AFPM.png',
    readTime: 4,
    category: 'Culture & Tips',
    date: 'Feb 2026',
    author: 'Peacock Drivers Editorial',
    body: [
      {
        heading: 'The guiding principle: light and layered',
        paragraphs: [
          "Sri Lanka is a compact island but its climates are wildly varied. The southern beach at Mirissa can be 34°C and humid. Nuwara Eliya two hours away can be 10°C with a cold mist coming in off the tea hills. Pack light enough to be comfortable in both — which means layers, not heavy items.",
          "Checked luggage slows you down on a touring holiday. A 40-litre backpack or medium soft bag fits in any vehicle without occupying passenger space. Keep a small day bag for camera gear, sunscreen, and valuables.",
        ],
      },
      {
        heading: 'The essentials',
        paragraphs: [],
        list: [
          { label: 'Lightweight trousers or maxi skirt', text: 'Essential for temple visits. Cotton or linen — avoid synthetics in the heat. Two pairs covers a two-week trip.' },
          { label: 'Sarong', text: 'Doubles as a beach wrap, temple modesty cover, and picnic blanket. Buy one locally for $3–5 — they\'re better quality than anything you\'ll bring.' },
          { label: 'Light layer for hill country', text: 'A thin fleece or hoodie is enough for evenings in Ella or Nuwara Eliya. You won\'t need a proper jacket.' },
          { label: 'Good walking sandals', text: 'You\'ll remove your shoes at every temple. Sandals with back straps are faster than lace-up shoes and survive beach and cobblestone equally well.' },
          { label: 'Reef-safe sunscreen', text: 'SPF50+. Bring from home — local sunscreen is expensive and hard to find outside Colombo supermarkets. The equatorial sun is genuinely intense.' },
          { label: 'Insect repellent', text: 'DEET-based for jungle and wildlife areas. Required for Yala, Udawalawe, and Sinharaja. Less critical on the coast.' },
          { label: 'Microfibre towel', text: 'Many guesthouses only provide one small bathroom towel. A thin microfibre dries fast and adds minimal weight.' },
          { label: 'Unlocked SIM-compatible phone', text: 'A Dialog SIM card at the airport gives you 4G data for around $5/week — faster and cheaper than roaming.' },
        ],
      },
      {
        heading: 'What to leave at home',
        paragraphs: [
          "Denim jeans, formal shoes, and anything that takes more than 12 hours to dry. Heavy rain gear — the island provides monsoon ponchos cheaply everywhere, and a proper waterproof jacket becomes a furnace within minutes.",
          "Travellers consistently report over-packing for Sri Lanka. The shopping is excellent — light cotton shirts, handwoven linen, good-quality sarongs — so leave space in your bag.",
        ],
        tip: 'If you buy more than you expected, most Colombo hotels will hold a sealed bag for collection on your final night before the airport.',
        tipLabel: 'Practical tip',
      },
      {
        heading: 'Health and pharmacy',
        paragraphs: [
          "Bring any prescription medication in sufficient supply — rural pharmacies stock basics but may not carry specialist drugs. A small first-aid kit (blister plasters, rehydration sachets, antihistamine) covers the most common issues. Tap water is not safe to drink anywhere; bottled water costs 60–80 rupees per litre everywhere.",
        ],
      },
    ],
    relatedSlugs: ['cultural-etiquette', 'when-to-visit-sri-lanka', 'sri-lankan-food-guide'],
    ctaHref: '/transfers',
    ctaLabel: 'Arrange an airport transfer',
  },

  // ────────────────────────────────────────────────────────────────────────────
  {
    slug: 'wildlife-safari-yala',
    title: 'Yala National Park: The Ultimate Safari Guide',
    excerpt:
      "Home to the world's densest population of leopards, Yala rewards the patient and the early-rising. What to expect and how to plan your game drive.",
    image:
      'https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/6989c9da9422f8c13806555f_Screenshot%202026-02-09%20at%204.49.15%E2%80%AFPM.png',
    readTime: 7,
    category: 'Wildlife',
    date: 'Jan 2026',
    author: 'Peacock Drivers Editorial',
    body: [
      {
        heading: 'Why Yala',
        paragraphs: [
          "Sri Lanka's most visited national park sits in the dry southeast corner of the island, where scrub jungle, ancient lagoons, and rock outcrops create a landscape that supports an extraordinary density of large mammals. Yala has the highest concentration of leopards anywhere in the world — an estimated one cat per square kilometre in Block 1, the most-visited zone.",
          "Beyond leopards, a morning game drive typically encounters elephant herds, sloth bears (particularly active in the early morning), sambar deer, spotted deer, water buffalo, and a dizzying array of birds including the endemic Sri Lanka junglefowl (the national bird), painted storks, and sea eagles. The adjacent coastal section means you may also encounter saltwater crocodiles and, in season, nesting olive ridley sea turtles.",
        ],
        pullquote: '"The leopard did not come looking for us. We waited, and the jungle handed it over in its own time."',
      },
      {
        heading: 'Planning your visit',
        paragraphs: [
          "Yala is open year-round except for a six-week closure in August–September. The best wildlife viewing is between February and July, when the dry season concentrates animals around waterholes and visibility through the undergrowth improves. June and July are peak months for leopard sightings.",
          "Game drives depart at 6am (sunrise opening) and 2pm (afternoon opening). The morning drive is universally preferred — animals are active, the light is golden, and the park feels less crowded before 9am. Budget 3–4 hours minimum. Half-day packages often feel rushed.",
        ],
        tip: 'Avoid Block 1 on public holidays when the gate queues can be extraordinary. Ask your driver about Block 5, which has excellent wildlife and far fewer jeeps.',
        tipLabel: 'Driver tip',
      },
      {
        heading: 'What to bring',
        paragraphs: [],
        list: [
          { label: 'Binoculars', text: 'Essential. Many sightings begin as a shape in the bush — good glass lets you identify before others do.' },
          { label: 'Long lens camera', text: '200mm minimum. A 400–500mm lens transforms ordinary animal shots into images worth keeping.' },
          { label: 'Neutral colours', text: 'Khaki, green, grey. Bright colours in an open jeep disturb wildlife and attract commentary from other tourists.' },
          { label: 'Sunhat and water', text: 'The jeep has no roof. The equatorial dry-zone sun is fierce by 9am.' },
          { label: 'Patience', text: 'The guides who find leopards are the ones who sit quietly at a rock outcrop for 40 minutes, not the ones who race between sighting alerts.' },
        ],
      },
      {
        heading: 'Getting there and staying nearby',
        paragraphs: [
          "The main park entrance is at Palatupana, roughly 5 hours by road from Colombo. Most travellers combine Yala with a stay in the beach town of Tissamaharama (20 minutes from the gate) or in one of the luxury tented camps that sit on the park boundary — Chena Huts by Uga Escapes and Wild Coast Tented Lodge are the benchmark options.",
          "From Ella, Yala is around 2.5 hours — making it a natural pairing on a south coast circuit.",
        ],
      },
    ],
    relatedSlugs: ['minneriya-elephant-gathering', 'whale-watching-mirissa', 'when-to-visit-sri-lanka'],
    ctaHref: '/tours',
    ctaLabel: 'Book a wildlife tour',
  },

  // ────────────────────────────────────────────────────────────────────────────
  {
    slug: 'cultural-triangle-itinerary',
    title: '5-Day Cultural Triangle: Sigiriya, Polonnaruwa & Kandy',
    excerpt:
      "A self-contained circuit through Sri Lanka's ancient heartland — ruins, dagobas, and a king's rock fortress that commands the entire plain.",
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1400&auto=format&fit=crop',
    readTime: 10,
    category: 'Itineraries',
    date: 'Jan 2026',
    author: 'Peacock Drivers Editorial',
    body: [
      {
        heading: 'The Cultural Triangle in context',
        paragraphs: [
          "The 'Cultural Triangle' is a name coined by UNESCO to describe the three ancient capitals of Sri Lanka that form a rough triangle in the island's north-central dry zone: Anuradhapura, Polonnaruwa, and Kandy. Within this zone are some of the most significant archaeological sites in Asia — dagobas (stupas) larger than the Roman Colosseum, 5th-century frescoes still vivid in colour, and Sigiriya: a palace-fortress built atop a monolithic volcanic plug 200 metres above the surrounding jungle.",
          "A five-day loop covers the highlights comfortably, with a private driver connecting sites at a civilised pace. Most visitors enter the triangle from Colombo (3 hours north) or after the hill country (Kandy makes the logical gateway).",
        ],
      },
      {
        heading: 'Day by day',
        paragraphs: [],
        list: [
          { label: 'Day 1 — Sigiriya & Dambulla', text: 'Climb Sigiriya at 7am before the heat builds. The spiral staircase past the 5th-century "cloud maidens" frescoes and the lion paw entrance is one of the island\'s great experiences. Afternoon: Dambulla Cave Temple, where five cave shrines contain 153 Buddha statues painted floor-to-ceiling.' },
          { label: 'Day 2 — Polonnaruwa', text: 'The medieval capital (10th–13th century) spread across 6 square kilometres. The Gal Vihara — four monumental Buddha figures carved into a single granite face — is the unambiguous highlight. Rent bicycles at the entrance; the ruins are too spread out to walk comfortably.' },
          { label: 'Day 3 — Anuradhapura', text: 'The oldest capital (3rd century BC). The Ruwanwelisaya dagoba rises 91 metres; the sacred Bodhi tree is a direct cutting from the tree under which Buddha attained enlightenment, brought to Sri Lanka in 288 BC. The largest active pilgrimage site on the island.' },
          { label: 'Day 4 — Kandy', text: 'Drive south through the mountains. The Temple of the Tooth Relic (Sri Dalada Maligawa) houses Buddhism\'s most sacred relic and is the spiritual centre of Theravada Buddhism. Evening: the Kandyan cultural dance show if timing aligns.' },
          { label: 'Day 5 — Kandy to departure point', text: 'The Peradeniya Royal Botanical Gardens (a 45-minute visit minimum) before the drive south or east to your next destination.' },
        ],
        pullquote: '"Sigiriya at 7am with the mist still in the jungle below is one of the sights that justifies the entire flight to Sri Lanka."',
      },
      {
        heading: 'Practical notes',
        paragraphs: [
          "The Cultural Triangle Permit covers Polonnaruwa, Sigiriya, Anuradhapura, and Dambulla and costs $62.50 (subject to change). Individual site tickets are available but the combined permit is better value if visiting all four. Purchase in advance at the Cultural Triangle Office in Kandy or online.",
          "Accommodation in the triangle ranges from upmarket eco-lodges near Sigiriya (Vil Uyana, Water Garden Sigiriya) to comfortable guesthouses in Habarana. The drive between sites is part of the experience — dry-zone scrubland with wild peacocks on the road edges and occasional elephant crossings at dusk.",
        ],
        tip: 'Start Sigiriya as early as permitted (7am). The summit is exposed; by 10am it is hot and crowded. By 7:30am you may have the Mirror Wall almost to yourself.',
        tipLabel: 'Timing tip',
      },
    ],
    relatedSlugs: ['hill-country-train-ride', 'when-to-visit-sri-lanka', 'cultural-etiquette'],
    ctaHref: '/tours',
    ctaLabel: 'Explore Cultural Triangle tours',
  },

  // ────────────────────────────────────────────────────────────────────────────
  {
    slug: 'hill-country-train-ride',
    title: 'The Kandy to Ella Train: Everything You Need to Know',
    excerpt:
      "Dubbed one of the world's most scenic rail journeys, the blue train through Sri Lanka's tea country is one ticket worth every minute.",
    image: 'https://images.unsplash.com/photo-1609342122563-a43ac8917a3a?q=80&w=1400&auto=format&fit=crop',
    readTime: 6,
    category: 'Culture & Tips',
    date: 'Dec 2025',
    author: 'Peacock Drivers Editorial',
    body: [
      {
        heading: 'The journey',
        paragraphs: [
          "The rail line from Kandy to Ella is 120 years old and still runs almost exactly as it was built — winding through tea estates on a single-gauge track, crossing colonial-era viaducts, and burrowing through short tunnels carved into the ridgeline. The journey takes 7–9 hours, covers 155 kilometres, and climbs from 474 metres in Kandy to 1,868 metres at Pattipola (the highest railway station in Sri Lanka) before descending into Ella at 1,041 metres.",
          "For most of the route the views out of the left-side windows (Kandy–Ella direction) are the better ones — sweeping vistas over tea estate valleys. The right side has its moments too. Both doors between carriages are usually open; standing in the doorway is the unambiguous best way to photograph the journey.",
        ],
        pullquote: '"At Demodara, the train loops underneath itself in a spiral cutting so tight you can look out one side and see the rear carriages below you."',
      },
      {
        heading: 'Booking the right seat',
        paragraphs: [
          "Three classes are available. First class has reserved seating and is the only air-conditioned option — avoid it. The observation saloon cars (attached to some express services) offer panoramic windows and reserved seats at second-class prices; these sell out weeks in advance and are worth the effort.",
          "Second class unreserved is the authentic experience — shared wooden benches, local families travelling with enormous bags, vendors selling vadai and coffee at every station stop. Book observation car seats at bookme.lk or eztix.lk. For unreserved second class, turn up 30 minutes before departure.",
        ],
        list: [
          { label: 'Best trains', text: 'Train 1005 (Kandy–Badulla Intercity Express, departs ~8:45am) and Train 1017 (Podi Menike, departs ~9:45am) are the most scenic services. Check the Sri Lanka Railways website for current timetables.' },
          { label: 'Key stops', text: 'Nanu Oya (for Nuwara Eliya), Haputale, Idalgashinna, Ella. Ella is the most popular alighting point.' },
          { label: 'The Demodara loop', text: 'Between Ella and Demodara, the train spirals through the famous loop. Watch for it about 15 minutes after departing Ella heading west.' },
        ],
      },
      {
        heading: 'What to bring',
        paragraphs: [
          "Snacks and water (vendors at major stations are reliable but not every stop). A light layer — the hill country air at altitude is surprisingly cool even on a sunny day. A camera, obviously, but also just the willingness to put it down and simply watch the world go by.",
        ],
        tip: 'Travel on a weekday. Weekend trains are heavily booked and the atmosphere on the platforms is more chaotic. Mid-week in low season (May, June, October) the observation cars are sometimes almost empty.',
        tipLabel: 'Booking tip',
      },
    ],
    relatedSlugs: ['cultural-triangle-itinerary', 'tea-plantation-experience', 'when-to-visit-sri-lanka'],
    ctaHref: '/tours',
    ctaLabel: 'Book a hill country tour',
  },

  // ────────────────────────────────────────────────────────────────────────────
  {
    slug: 'whale-watching-mirissa',
    title: 'Whale Watching in Mirissa: Blue Whales Off the Southern Coast',
    excerpt:
      'Between November and April, the waters off Mirissa host the largest animals ever to have lived. A guide to making the most of every early-morning boat.',
    image: 'https://images.unsplash.com/photo-1570481662006-a3a1374699e8?q=80&w=1400&auto=format&fit=crop',
    readTime: 5,
    category: 'Wildlife',
    date: 'Dec 2025',
    author: 'Peacock Drivers Editorial',
    body: [
      {
        heading: 'The world\'s largest animal, close enough to hear',
        paragraphs: [
          "The deep ocean trench off Sri Lanka's southern coast creates the upwelling conditions that blue whales follow on their annual migration. Between November and April, the waters around Dondra Head — the southernmost point of Sri Lanka, a short sail from Mirissa harbour — host some of the most reliable blue whale sightings anywhere in the world.",
          "These are not 'zoo' encounters. The whales are genuinely wild, encountered on open ocean, often in pods of two or three animals. A surfacing blue whale — 30 metres long, exhaling a spout that reaches 12 metres — creates a quiet awe that is difficult to prepare for.",
        ],
      },
      {
        heading: 'Planning your trip',
        paragraphs: [
          "Boats depart Mirissa harbour between 6:30–7am and return around 1pm. Most operators offer free rebooking on days when whales are not spotted, which is rare in peak season but does happen. The sea is calm and flat during the northeast monsoon (November–April) — outside this window the southern coast becomes choppy and sightings drop significantly.",
          "Sperm whales, spinner dolphins, and occasionally orcas are seen alongside blue whales. Some of the most spectacular sightings are of dolphins — hundreds at a time surfing the bow wave of the boat at speed.",
        ],
        pullquote: '"When a blue whale surfaces alongside the boat, it exhales. You hear it before you see it — a sound like a distant fog horn, soft and enormous."',
      },
      {
        heading: 'Choosing an operator',
        paragraphs: [
          "The whale watching industry in Mirissa has a mixed record on responsible practice. Choose an operator that maintains the minimum 50-metre approach distance required by the Marine Environment Protection Authority, limits engine use near whales, and restricts passenger numbers. Raja and the Whales is widely regarded as the most conservation-responsible operator.",
        ],
        tip: 'Take a seasickness tablet the night before and again 30 minutes before boarding. The ocean swell is typically gentle, but the boat does a lot of stopping and idling near whale locations, and that motion affects some people more than the underway passage.',
        tipLabel: 'Practical advice',
      },
    ],
    relatedSlugs: ['wildlife-safari-yala', 'south-coast-road-trip', 'when-to-visit-sri-lanka'],
    ctaHref: '/tours',
    ctaLabel: 'Plan a south coast trip',
  },

  // ────────────────────────────────────────────────────────────────────────────
  {
    slug: 'monsoon-season-travel',
    title: 'Travelling Sri Lanka in Monsoon Season',
    excerpt:
      'The rains are not the enemy. With the right itinerary — and a driver who knows where the sun always shines — the low season is the island at its most honest.',
    image: 'https://images.unsplash.com/photo-1586323827690-95f4e24c4e01?q=80&w=1400&auto=format&fit=crop',
    readTime: 6,
    category: 'Seasonal',
    date: 'Nov 2025',
    author: 'Peacock Drivers Editorial',
    body: [
      {
        heading: 'The case for monsoon travel',
        paragraphs: [
          "High season in Sri Lanka means crowds at Sigiriya, jostling for space on Unawatuna beach, and hotel prices at their annual peak. The low season — loosely May to November for the west coast and south — offers something different: a quieter island, dramatically reduced room rates (often 30–50% lower), lushly green landscapes, and genuinely fewer tourists.",
          "Rain in the tropics is rarely continuous. Sri Lanka's monsoon arrives in short, heavy afternoon bursts followed by clear evenings. Mornings are often perfectly fine, and the cooler post-rain air makes sightseeing far more comfortable than the dry-season heat.",
        ],
      },
      {
        heading: 'What stays dry',
        paragraphs: [
          "The southwest monsoon (May–September) affects the west coast, south coast, and hill country — but leaves the east coast and Cultural Triangle largely dry and accessible. Trincomalee and Arugam Bay are at their best during these months. Sigiriya, Polonnaruwa, and Anuradhapura can be visited comfortably with only afternoon rain to plan around.",
          "The northeast monsoon (October–February) reverses the equation — west and south coasts are superb while the east coast gets its seasonal rains.",
        ],
        pullquote: '"The hill country in June is the greenest place I have ever stood. Every waterfall is running. The tea estates look painted on."',
      },
      {
        heading: 'Practical monsoon travel tips',
        paragraphs: [],
        list: [
          { text: 'Schedule outdoor highlights (Sigiriya climb, game drives, boat trips) in the morning. Afternoons are for guesthouses, cafés, and long lunches.' },
          { text: 'Buy a cheap rain poncho locally — Rs. 200–350. They fold flat and cover you and your camera.' },
          { text: 'Roads in the hill country become very slow after heavy rain. Build buffer time into your itinerary; the scenery en route is reward enough.' },
          { text: 'Waterfalls are at their most spectacular in the monsoon months. Ravana Falls near Ella, Bambarakanda (the island\'s highest), and Diyaluma are all worth detours.' },
          { text: 'The ocean swell on the southwest coast makes swimming unsafe during the southwest monsoon — check rip flags and never swim at unguarded beaches.' },
        ],
        tip: 'Travelling in October or November? The Cultural Triangle is the smart call — both monsoons are winding down, the landscape is at peak greenness, and you may find popular sites almost entirely to yourself.',
        tipLabel: 'Driver recommendation',
      },
    ],
    relatedSlugs: ['when-to-visit-sri-lanka', 'east-coast-guide', 'cultural-triangle-itinerary'],
    ctaHref: '/tours',
    ctaLabel: 'See monsoon-season tours',
  },

  // ────────────────────────────────────────────────────────────────────────────
  {
    slug: 'tea-plantation-experience',
    title: 'Inside a Working Tea Plantation in Nuwara Eliya',
    excerpt:
      'The process from leaf to cup takes less than a day. A visit to a working estate shows you every step — and puts local tea firmly on your shopping list.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1400&auto=format&fit=crop',
    readTime: 5,
    category: 'Culture & Tips',
    date: 'Oct 2025',
    author: 'Peacock Drivers Editorial',
    body: [
      {
        heading: 'Ceylon tea: the short version',
        paragraphs: [
          "Sri Lanka is the world's third-largest tea exporter, producing around 300 million kilograms annually across six major growing regions. The character of the tea changes with altitude: low-grown teas (below 600 metres) are bold and dark; mid-country teas are aromatic and slightly reddish; high-grown teas from Nuwara Eliya and Dimbula produce the delicate, golden, famously complex cup that commands the highest export prices.",
          "The name 'Ceylon Tea' is a protected designation of origin — it can only legally appear on tea produced entirely in Sri Lanka. The Lion Logo on a packet means the tea inside has been certified by the Sri Lanka Tea Board.",
        ],
      },
      {
        heading: 'A morning at the factory',
        paragraphs: [
          "Most working tea factories in the Nuwara Eliya region offer guided visits for around Rs. 500–1,000 per person. Pedro Estate is the most frequently visited; Mackwoods Labookellie has the best roadside setting with a tea room overlooking the estate. Both show you the full process: withering (drying fresh leaf on wire racks for 16–18 hours), rolling, oxidation, firing, and grading.",
          "The tea picker demonstration is worth watching for five minutes — the speed at which experienced pickers work, filling a 15-kilogram sack in a morning, makes the economics of the industry immediately tangible.",
        ],
        pullquote: '"The smell inside a tea factory — warm, malty, slightly floral — is the smell of the entire island concentrated into one room."',
      },
      {
        heading: 'Buying tea to take home',
        paragraphs: [
          "Factory gift shops sell tea directly with no middleman markup. The best value is loose-leaf high-grown from the current flush (season). Ask which batch is freshest. Avoid pre-packaged tourist tins — the tea inside is often a blend of lower grades. A 250-gram bag of properly-sourced Nuwara Eliya high-grown is around Rs. 800–1,200 and genuinely better than most supermarket Ceylon Tea abroad.",
        ],
        tip: 'If you have a morning free in Nuwara Eliya, combine the tea factory visit with a walk to the nearby Gregory Lake and a stop at Mahagastotte Market — a covered produce market where the entire hill country\'s vegetables, spices, and strawberries converge.',
        tipLabel: 'Half-day itinerary',
      },
    ],
    relatedSlugs: ['hill-country-train-ride', 'sri-lankan-food-guide', 'what-to-pack-for-sri-lanka'],
    ctaHref: '/tours',
    ctaLabel: 'Explore hill country tours',
  },

  // ────────────────────────────────────────────────────────────────────────────
  {
    slug: 'south-coast-road-trip',
    title: 'The Ultimate Sri Lanka South Coast Road Trip',
    excerpt:
      'Galle to Tangalle: surf breaks, colonial forts, sea-turtle nesting beaches, and the best fish curry of your life.',
    image: 'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?q=80&w=1400&auto=format&fit=crop',
    readTime: 9,
    category: 'Itineraries',
    date: 'Sep 2025',
    author: 'Peacock Drivers Editorial',
    body: [
      {
        heading: 'The coast road',
        paragraphs: [
          "The A2 highway running east from Galle along Sri Lanka's southern coast is the island's most rewarding drive. At no point does it feel like a motorway — it is a winding two-lane road that passes through fishing villages, coconut groves, beach town strips, and occasional stretches of absolutely undeveloped coast. The ocean is rarely out of sight.",
          "The route from Galle to Tangalle covers roughly 120 kilometres and can be driven in three hours without stopping. Done properly — with stops at every interesting point — it fills four comfortable days.",
        ],
      },
      {
        heading: 'Stop by stop',
        paragraphs: [],
        list: [
          { label: 'Galle Fort (Day 1)', text: 'The 17th-century Dutch fort is a UNESCO World Heritage Site that never feels like a museum — it is lived in, with boutique hotels, galleries, and restaurants inside its ramparts. Walk the full perimeter at sunset.' },
          { label: 'Unawatuna & Jungle Beach (Day 1–2)', text: '8km east of Galle: a sheltered bay with calm water ideal for swimming, and Jungle Beach — accessible only on foot or by boat — which has no facilities and therefore no crowds.' },
          { label: 'Weligama (Day 2)', text: 'The best learn-to-surf beach in Sri Lanka. Consistent, mellow, chest-high waves and dozens of instructors who work the beach. Also the home of the famous stilt fishermen.' },
          { label: 'Mirissa (Day 2–3)', text: 'A crescent beach with a coconut-palm ridge behind it and a small headland that gives the best sunset views on the coast. Whale-watching departs from here November–April.' },
          { label: 'Tangalle (Day 3–4)', text: 'The south coast\'s quietest significant town: a natural harbour, a serious local fishing industry, and 20 kilometres of uncrowded beaches to the east. Rekawa Beach has Sri Lanka\'s most active sea-turtle nesting programme.' },
        ],
        pullquote: '"The fish curry at a Tangalle beach shack — red coconut broth, fresh tuna, served on a banana leaf — was the best meal of the entire trip."',
      },
      {
        heading: 'Practical notes',
        paragraphs: [
          "The coastal road is best driven east-to-west in the morning and west-to-east in the afternoon — you keep the sun behind you. Traffic is heaviest between Galle and Unawatuna in both directions during peak season. Budget two days minimum for Galle alone; the fort rewards slow exploration.",
        ],
        tip: 'At Rekawa Beach (45km east of Tangalle), the turtle-watching programme runs nightly during nesting season (March–August). A local conservation team guides you to nesting females — no flash photography, small groups, and a genuine wild encounter that responsible tourism has protected for years.',
        tipLabel: 'Conservation stop',
      },
    ],
    relatedSlugs: ['whale-watching-mirissa', 'when-to-visit-sri-lanka', 'cultural-etiquette'],
    ctaHref: '/tours',
    ctaLabel: 'Book a south coast tour',
  },

  // ────────────────────────────────────────────────────────────────────────────
  {
    slug: 'spice-gardens-matale',
    title: "Sri Lanka's Spice Gardens: A Sensory Detour in Matale",
    excerpt:
      "Cinnamon, cardamom, pepper, and clove — Sri Lanka's spice belt predates the colonial era by centuries. What a morning in Matale's gardens teaches you.",
    image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=1400&auto=format&fit=crop',
    readTime: 4,
    category: 'Food & Drink',
    date: 'Aug 2025',
    author: 'Peacock Drivers Editorial',
    body: [
      {
        heading: 'Why spices shaped Sri Lanka',
        paragraphs: [
          "The island the Portuguese renamed 'Ceilão' in 1505 was already known throughout the Arab trading world as the source of cinnamon — a spice so valuable that wars were fought over the right to export it. The Dutch who followed the Portuguese, and the British who followed them, all maintained the spice monopoly as a primary economic engine. The hill town of Matale, midway between Kandy and Dambulla, sits in the centre of what was once the world's most productive spice belt.",
          "Today the commercial cultivation of cinnamon has moved to the southwest coast lowlands, but Matale's spice gardens survive as both working farms and visitor experiences — a rare case of tourism and genuine agriculture coexisting without either diminishing the other.",
        ],
      },
      {
        heading: 'What you will see',
        paragraphs: [],
        list: [
          { label: 'True cinnamon (Cinnamomum verum)', text: 'Sri Lanka produces the world\'s only true cinnamon — thinner, more delicate, and more complex than the Cassia bark sold as cinnamon in most supermarkets. Watch the peeling and rolling of the inner bark.' },
          { label: 'Pepper vine', text: 'Black pepper grows as a climbing vine, wound around support trees. The guide picks a green cluster; the flavour is bright and completely unlike dried black pepper.' },
          { label: 'Cardamom', text: 'Grown in partial shade, the pods cluster at the base of the plant. Bite into a fresh pod — the aroma is intensely floral and eucalyptus-like.' },
          { label: 'Nutmeg, clove, vanilla', text: 'All present in a well-stocked garden, along with vanilla orchid, cocoa, and the aloe vera plants that are processed into cosmetics at the attached shop.' },
        ],
        pullquote: '"Smelling pepper straight from the vine — sharp, green, alive — makes you realise the dried version is essentially a memory of the real thing."',
      },
      {
        heading: 'The shop situation',
        paragraphs: [
          "Every spice garden visit ends with a polished walk through the shop, and the pressure to buy can feel heavy. The products are genuinely good quality — pure cinnamon oil, proper Ceylon black pepper, single-origin nutmeg — but prices are elevated for tourists. Negotiate. A quick Google of what spices cost at Colombo's Pettah market gives you a fair benchmark.",
        ],
        tip: 'Combine a Matale spice garden stop with the Nalanda Gedige temple (5th–7th century, a fusion of Hindu and Buddhist architecture unlike anything else in Sri Lanka) 20 minutes north on the same road.',
        tipLabel: 'Combine with',
      },
    ],
    relatedSlugs: ['sri-lankan-food-guide', 'cultural-triangle-itinerary', 'cultural-etiquette'],
    ctaHref: '/tours',
    ctaLabel: 'Plan a Cultural Triangle tour',
  },

  // ────────────────────────────────────────────────────────────────────────────
  {
    slug: 'minneriya-elephant-gathering',
    title: 'The Minneriya Gathering: Hundreds of Elephants at Dusk',
    excerpt:
      "Each year as the ancient tank recedes, wild elephants converge on Minneriya in numbers that still surprise even the rangers.",
    image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1400&auto=format&fit=crop',
    readTime: 7,
    category: 'Wildlife',
    date: 'Jul 2025',
    author: 'Peacock Drivers Editorial',
    body: [
      {
        heading: 'A gathering unlike anything else in Asia',
        paragraphs: [
          "The Minneriya Gathering is the largest single assemblage of Asian elephants in the world. Between July and October, as the ancient Minneriya Tank (a 4th-century reservoir built by King Mahasena) shrinks during the dry season, the grass along its receding shoreline grows fresh and tender. Elephants from across the surrounding forests converge on it — sometimes 200, sometimes 400 animals in a single afternoon, spread across the tank's margin in family groups.",
          "These are completely wild animals on a completely wild grazing ground. There are no feeding stations, no bait, no barriers. The jeeps park at a respectful distance and the elephants essentially ignore them — they have more important business.",
        ],
        pullquote: '"At sunset, with 300 elephants spread across the tank\'s edge and the sky going orange behind them, I ran out of the vocabulary for what I was seeing."',
      },
      {
        heading: 'When to go',
        paragraphs: [
          "The gathering peaks between August and October, when the tank is at its lowest and the concentration of animals is highest. July offers good sightings with fewer jeeps. By November the northeast monsoon begins refilling the tank, elephants disperse into the surrounding forest, and the gathering ends for another year.",
          "Afternoon drives (entering around 2pm) are best — the elephants are most active in the last two hours of daylight, moving from the forest edge onto the tank's open grassland as the temperature drops.",
        ],
      },
      {
        heading: 'Getting there',
        paragraphs: [],
        list: [
          { label: 'Location', text: 'Minneriya National Park is 30 minutes from Habarana and 1.5 hours from Sigiriya — easy to combine with a Cultural Triangle itinerary.' },
          { label: 'Access', text: 'Entry is by open-top jeep only. Operators cluster at the Habarana junction; book a reputable one through your accommodation or driver. Rs. 6,000–8,000 for a half-day shared jeep is typical.' },
          { label: 'Also at Kaudulla', text: 'The adjacent Kaudulla National Park hosts a smaller version of the same gathering and is worth visiting if Minneriya is crowded. Ask your driver which tank the elephants are favouring that week.' },
        ],
        tip: 'Minneriya is significantly better than Udawalawe for the gathering experience, but Udawalawe is better for baby elephants and guaranteed sightings year-round. If you can only do one, Minneriya in season wins.',
        tipLabel: 'Minneriya vs Udawalawe',
      },
    ],
    relatedSlugs: ['wildlife-safari-yala', 'cultural-triangle-itinerary', 'when-to-visit-sri-lanka'],
    ctaHref: '/tours',
    ctaLabel: 'Book a wildlife & culture tour',
  },

  // ────────────────────────────────────────────────────────────────────────────
  {
    slug: 'cultural-etiquette',
    title: 'Cultural Etiquette: How to Travel Sri Lanka Respectfully',
    excerpt:
      'Temple dress codes, dining customs, gestures to learn — everything you need to travel with genuine respect and connection.',
    image:
      'https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/6989df2274d427fd46cdd3f3_Screenshot%202026-02-09%20at%203.55.33%E2%80%AFPM.png',
    readTime: 6,
    category: 'Culture & Tips',
    date: 'Mar 2026',
    author: 'Peacock Drivers Editorial',
    body: [
      {
        heading: 'Sri Lanka\'s cultural context',
        paragraphs: [
          "Sri Lanka is a predominantly Buddhist country (70% of the population) with significant Hindu, Muslim, and Christian minorities. The island's religious sites are active places of worship, not museums — the protocols around them exist because they matter to the people who pray there, not because a tourism board invented them.",
          "Sri Lankan culture is notably warm and accommodating toward visitors. The effort to observe a few basic courtesies is almost always met with disproportionate warmth. This is not a country where locals quietly resent tourist behaviour — it is a country where genuine effort is noticed and rewarded.",
        ],
      },
      {
        heading: 'At temples and religious sites',
        paragraphs: [],
        list: [
          { text: 'Remove shoes before entering any temple, kovil, or mosque — there will be a shoe rack at the entrance, or leave them with your driver.' },
          { text: 'Cover shoulders and knees. Sleeveless tops and shorts are not acceptable. Carry a light sarong for wrapping around — most sites sell or lend them.' },
          { text: 'Never point your feet toward a Buddha statue, a deity image, or a monk. Sit cross-legged or with feet pointing away from sacred images.' },
          { text: 'Do not photograph people praying without their consent. Wait, ask with a gesture, and accept a no graciously.' },
          { text: 'Touching a Buddha statue for a photo — especially standing with your back to it — is deeply offensive. Take photos from a respectful distance.' },
        ],
        pullquote: '"The families praying at Dambulla at dawn had no idea they were creating the most affecting photographs of our entire trip. We didn\'t take any."',
      },
      {
        heading: 'Eating and social customs',
        paragraphs: [
          "Sri Lankans traditionally eat with the right hand. The left hand is considered unclean and is not used for eating, offering, or receiving objects. When sharing food or paying for something, use your right hand or both hands together.",
          "Accepting food or drink when offered is a form of hospitality, and a polite refusal requires a small reason ('I have just eaten, thank you'). A flat no with no explanation can read as cold. Tea is offered constantly — at guesthouses, at shops you browse, by hosts everywhere. Accept it.",
        ],
      },
      {
        heading: 'A few things that matter',
        paragraphs: [],
        list: [
          { text: 'Don\'t sunbathe topless anywhere outside an explicitly designated area. On public beaches this causes significant offence.' },
          { text: 'Photographing military sites, airports, or government buildings is prohibited and will attract attention from security personnel.' },
          { text: 'The head wobble — a sideways tilt of the head — means \'yes\', or agreement, or acknowledgement. It is not dismissal. When a Sri Lankan wobbles their head at something you\'ve said, they are almost certainly agreeing with you.' },
          { text: 'Buddhist monks do not shake hands with women. A respectful nod with hands together (añjali) is the appropriate greeting.' },
        ],
        tip: 'Ask your Peacock Drivers guide. They live in this culture and will tell you, gently and without embarrassment, if something you\'re about to do is likely to cause offence. That is one of the real values of a local driver over self-guided travel.',
        tipLabel: 'The best resource',
      },
    ],
    relatedSlugs: ['what-to-pack-for-sri-lanka', 'sri-lankan-food-guide', 'cultural-triangle-itinerary'],
    ctaHref: '/tours',
    ctaLabel: 'Book a cultural tour',
  },

  // ────────────────────────────────────────────────────────────────────────────
  {
    slug: 'east-coast-guide',
    title: "Why the East Coast Is Sri Lanka's Best-Kept Secret",
    excerpt:
      "While the west coast gets the crowds, the east offers pristine beaches and a slower, more authentic pace — from May through September.",
    image:
      'https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/698487a2a035dec2b9a0c107_Fishermen.jpeg',
    readTime: 7,
    category: 'Seasonal',
    date: 'Mar 2026',
    author: 'Peacock Drivers Editorial',
    body: [
      {
        heading: 'The east coast difference',
        paragraphs: [
          "Sri Lanka's east coast is a different country from the south. While Mirissa and Unawatuna are thronged with sunset bars and Instagram backdrops, Trincomalee has a natural harbour so deep that British naval ships sheltered there in the Second World War, surrounded by near-empty beaches of powder sand and remarkably clear water.",
          "The ethnic mix on the east coast — Tamil, Sinhalese, and Muslim communities living in close proximity — creates a cultural texture that feels more layered and less curated than the tourist-centric south. The food is different (rice and curry with a Tamil inflection, fresh seafood grilled over coconut husks), the temples are different (Hindu kovils outnumber Buddhist viharas), and the pace is slower in the way that places are when they haven't yet noticed that visitors are arriving.",
        ],
      },
      {
        heading: 'Trincomalee',
        paragraphs: [
          "Sri Lanka's most significant eastern city sits on one of the largest natural harbours in the world. Nilaveli Beach, 12km north, has calm, turquoise water and Pigeon Island — a 15-minute boat ride — offers some of the best snorkelling in the country: blacktip reef sharks, hawksbill turtles, and colourful reef fish in water clear enough to see the bottom in 8 metres.",
          "Trincomalee also has the Koneswaram Temple, perched on Swami Rock 130 metres above the ocean — a Shaivite Hindu site of great antiquity with an extraordinary cliff-edge setting.",
        ],
        pullquote: '"At Nilaveli, the water is so clear you can see the shadow of the boat on the sand five metres below before you even look over the side."',
      },
      {
        heading: 'Arugam Bay',
        paragraphs: [
          "The Bay is Sri Lanka's surf capital — a right-hand point break consistently ranked among Asia's best, especially for intermediate and advanced surfers in June and July. But the bay is also a genuinely pleasant place even for non-surfers: a single road lined with simple restaurants, low-key guesthouses, and a lagoon behind the beach that is ideal for kayaking and birdwatching.",
          "Pottuvil Lagoon, just north of Arugam Bay, hosts saltwater crocodiles, monitor lizards, and a remarkable density of wading birds. A morning boat safari costs around Rs. 2,000 per person and is far less visited than any comparable wildlife experience in the south.",
        ],
      },
      {
        heading: 'Getting there',
        paragraphs: [
          "Trincomalee is 6 hours by road from Colombo, or 3.5 hours from Sigiriya — making the east coast a natural extension of a Cultural Triangle itinerary. Arugam Bay is 7 hours from Colombo; most travellers fly into Colombo and route through Ella or Yala before arriving on the east coast.",
        ],
        tip: 'The east coast\'s best season (May–September) exactly inverts the south coast\'s best season (November–April). Build an itinerary that starts in the south (high season, dry) and ends on the east, or vice versa — you\'ll always be on the right coast at the right time.',
        tipLabel: 'Seasonal routing',
      },
    ],
    relatedSlugs: ['when-to-visit-sri-lanka', 'monsoon-season-travel', 'wildlife-safari-yala'],
    ctaHref: '/tours',
    ctaLabel: 'Explore east coast tours',
  },
];

// ── Lookup helpers ─────────────────────────────────────────────────────────────

export function getArticleBySlug(slug: string): FullArticle | undefined {
  return ARTICLES.find(a => a.slug === slug);
}

export function getRelatedArticles(slugs: string[]): FullArticle[] {
  return slugs.map(s => getArticleBySlug(s)).filter(Boolean) as FullArticle[];
}
