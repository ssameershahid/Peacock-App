import React, { useState, useEffect, useRef } from 'react';
import { Link, useRoute } from 'wouter';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ArrowLeft, Clock, MapPin, Calendar, Sun, Compass, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Kicker } from '@/components/peacock/Type';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Highlight {
  name: string;
  description: string;
  icon: string;
}

interface DestDetail {
  slug: string;
  name: string;
  region: string;
  tagline: string;
  image: string;
  heroCaption: string;
  overview: string[];
  pullQuote: string;
  highlights: Highlight[];
  bestMonths: number[]; // 0-indexed
  bestTime: string;
  gettingThere: string;
  accommodation: string;
  budget: string;
  tips: string[];
  nearbySlug?: string;
  nearbyName?: string;
}

// ── Destination Data ───────────────────────────────────────────────────────────
const DEST_DATA: Record<string, DestDetail> = {
  ella: {
    slug: 'ella',
    name: 'Ella',
    region: 'Hill Country',
    tagline: 'Nine arches, misty peaks & slow tea-country mornings',
    image: 'https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/698a6aec6368ef419f4ec73b_Screenshot%202026-02-10%20at%204.14.02%E2%80%AFAM.png',
    heroCaption: 'The view from Ella Gap, looking south across the tea estate valleys',
    overview: [
      "Perched at 1,041 metres above sea level in Sri Lanka's lush southern hill country, Ella is the island's most beloved mountain escape. The village sits in a natural gap between two peaks, framing a view so perfect it seems almost designed — misty green valleys rolling toward a distant horizon, tea bushes carpeting every visible slope.",
      "The Nine Arch Bridge is Ella's signature image: a colonial-era viaduct of elegant stone arches that carries the Colombo–Badulla railway line across a ravine 24 metres deep. Arrive before 9am or at golden hour to see it without crowds, and stay to watch the blue diesel train arc slowly across the span — it's one of Sri Lanka's great sights.",
      "Ella moves at its own pace. The main street is one long boulevard of cafés, guesthouses, and hammock bars, and the evening ritual of sitting on a hillside terrace with a locally-grown brew is reason enough to stay longer than you planned.",
    ],
    pullQuote: `"Some places make you feel like you've stumbled into a secret. Ella is one of them."`,
    highlights: [
      {
        name: 'Nine Arch Bridge',
        description: 'Built in 1921 without steel, this colonial marvel spans a 24m-deep ravine 25 minutes from the village. A train passes several times daily.',
        icon: '🌉',
      },
      {
        name: "Little Adam's Peak",
        description: 'A gentle 2km hike from the village rewards with sweeping panoramic views over tea estates. Sunrise here on a clear morning is extraordinary.',
        icon: '⛰️',
      },
      {
        name: 'Ella Rock',
        description: 'A more challenging 3–4 hour return hike to one of the hill country\'s finest viewpoints. Hire a local guide to navigate the tea-estate paths.',
        icon: '🧗',
      },
      {
        name: 'Tea Factory Tours',
        description: 'Several historic tea factories near Ella offer guided tours showing the full journey from leaf to cup, with free tastings of estate-fresh teas.',
        icon: '🍃',
      },
      {
        name: 'Ravana Falls',
        description: 'A dramatic 25m waterfall 6km from town, associated with the Ramayana legend. Best reached by tuk-tuk. Swimming is possible in the dry season.',
        icon: '💧',
      },
      {
        name: 'Ella–Kandy Train Journey',
        description: "One of the world's most scenic rail routes. The 4-hour journey winds through tea country, cloud forest, and dozens of tunnels and bridges.",
        icon: '🚂',
      },
    ],
    bestMonths: [11, 0, 1, 2, 3],
    bestTime: 'December – April',
    gettingThere:
      'By train from Kandy (3h 30m–4h) — one of the world\'s great rail journeys. Book observation-carriage tickets in advance. By road from Colombo: 5–6 hours via Nuwara Eliya. A private driver is the most comfortable option.',
    accommodation:
      'Ella has guesthouses for every budget, from $20 hilltop rooms to boutine eco-lodges. Book ahead November–March as occupancy is very high.',
    budget: 'Budget: $30–50/day · Mid-range: $80–150/day · Luxury lodge: $200–350/day',
    tips: [
      'Arrive on the train from Kandy — the journey is the destination.',
      'Morning mist burns off by 9–10am. Hike Little Adam\'s Peak at 6am for the clearest views.',
      'The Nine Arch Bridge is busiest mid-morning. Visit late afternoon for golden light and fewer tourists.',
      'Most guesthouses can arrange a tuk-tuk driver for the day ($10–15 for a half day).',
    ],
    nearbySlug: 'nuwara-eliya',
    nearbyName: 'Nuwara Eliya',
  },
  kandy: {
    slug: 'kandy',
    name: 'Kandy',
    region: 'Central Province',
    tagline: 'Ancient kingdoms, sacred temples & the soul of Sri Lanka',
    image: 'https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/698a6aec3b53bbedef516144_Screenshot%202026-02-10%20at%204.13.52%E2%80%AFAM.png',
    heroCaption: 'The Kandy Lake at dawn, with the Sri Dalada Maligawa temple visible through the mist',
    overview: [
      "Kandy is Sri Lanka's cultural capital and the last royal capital of the ancient Kandyan kings — a city that resisted colonial rule longer than any other on the island, and whose highland setting protected it from the Portuguese and Dutch for centuries.",
      "At its spiritual centre stands the Temple of the Sacred Tooth Relic (Sri Dalada Maligawa), which houses what is believed to be a tooth of the Buddha. The temple complex draws pilgrims from across the Buddhist world, particularly during the spectacular Esala Perahera festival in July–August, when thousands of costumed performers and caparisoned elephants parade through the city streets.",
      "Beyond the temple, Kandy rewards slow exploration — the Royal Botanical Gardens at Peradeniya (home to one of Asia's finest orchid collections), the lake walks, the traditional Kandyan dance performances, and the vibrant covered market where spice vendors compete for your attention.",
    ],
    pullQuote: '"Kandy is the kind of city that reveals itself slowly, one temple courtyard at a time."',
    highlights: [
      { name: 'Temple of the Sacred Tooth', description: 'Sri Lanka\'s most sacred Buddhist shrine, housing a relic of the Buddha. Visit at dawn for the morning puja ceremony.', icon: '🛕' },
      { name: 'Royal Botanical Gardens', description: 'One of Asia\'s finest botanical gardens at Peradeniya, covering 147 acres with a remarkable orchid house and the famous Java fig tree.', icon: '🌺' },
      { name: 'Kandy Lake', description: 'Built by the last Kandyan king in 1807, the lake at the city centre is the perfect place for an early-morning stroll.', icon: '🌊' },
      { name: 'Esala Perahera', description: 'One of Asia\'s greatest festivals (July–August): 10 nights of drumming, fire-dancing, and over 100 elephants parading through the streets.', icon: '🎭' },
      { name: 'Kandyan Dance Shows', description: 'Nightly cultural performances at the Lake Round, showcasing the island\'s rich tradition of mask dance, fire-walking, and acrobatics.', icon: '💃' },
      { name: 'Tea Museum', description: 'The restored Hantane Tea Factory tells the full history of Sri Lankan tea, with tastings of estate-specific brews.', icon: '🍵' },
    ],
    bestMonths: [0, 1, 2, 3, 7, 8],
    bestTime: 'January – April, August',
    gettingThere:
      'By train from Colombo: 3 hours (book in advance). The scenic Kandy–Ella train departs from here. By road from Colombo: 2.5–3 hours via the highway. A private driver allows stops at spice gardens and gem mines en route.',
    accommodation:
      'Kandy has a wide range of options, from boutique heritage hotels within the old city to hilltop resort hotels with views over the lake and forested peaks.',
    budget: 'Budget: $30–60/day · Mid-range: $80–180/day · Boutique heritage hotel: $150–350/day',
    tips: [
      'Book the Esala Perahera dates a year in advance — accommodation disappears fast.',
      'The temple puja ceremonies happen three times daily — 5:30am, 9:30am, and 6:30pm.',
      'Hire a licensed guide at the temple — the history and symbolism repays the investment.',
      'The botanical gardens are largest and least crowded on weekday mornings.',
    ],
    nearbySlug: 'ella',
    nearbyName: 'Ella',
  },
  galle: {
    slug: 'galle',
    name: 'Galle',
    region: 'Southern Province',
    tagline: 'Dutch colonial charm meets the Indian Ocean',
    image: 'https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/698a6aec8d2e8ca70d64c46c_Screenshot%202026-02-10%20at%204.12.48%E2%80%AFAM.png',
    heroCaption: 'The Galle Lighthouse at the southernmost point of the Dutch Fort ramparts',
    overview: [
      "Within the 16th-century Dutch fort walls — a UNESCO World Heritage Site since 1988 — lies one of Asia's most extraordinary colonial towns. Galle Fort is a place where you can genuinely lose an afternoon wandering narrow lanes between boutique galleries, independent cafés, and old Dutch mansions converted into intimate guesthouses.",
      "The fort was built by the Portuguese in 1589 and substantially expanded by the Dutch East India Company in the 17th century. Its ramparts, up to 3 metres thick in places, enclose a remarkable 52 hectares of history — a living museum with a working population, cricket pitch, and some of Sri Lanka's finest restaurants.",
      "Outside the walls, Galle's southern coast offers excellent surfing at Hikkaduwa (30 minutes north), whale-watching at Mirissa (40 minutes east), and the extraordinary Rumassala jungle, said in the Ramayana to be the fragment of the Himalayas that Hanuman dropped when returning from his mission.",
    ],
    pullQuote: '"Galle Fort is a European colonial town that somehow ended up on the Indian Ocean — and it\'s more beautiful for the contradiction."',
    highlights: [
      { name: 'Galle Fort & Ramparts', description: 'Walk the full perimeter of the fort walls at sunset — one of Sri Lanka\'s great evening rituals, with unbroken Indian Ocean views.', icon: '🏰' },
      { name: 'Dutch Hospital Shopping', description: 'The beautifully restored 18th-century Dutch Hospital complex now houses boutiques, restaurants, and bars within the fort.', icon: '🛍️' },
      { name: 'Lighthouse', description: 'The Dutch-built lighthouse at the fort\'s southernmost tip dates to 1848 and offers spectacular views at golden hour.', icon: '🔦' },
      { name: 'Whale Watching at Mirissa', description: 'Blue whales and sperm whales pass close to Mirissa between November and April. Some of the most accessible whale watching on the planet.', icon: '🐋' },
      { name: 'Jungle Beach', description: 'A hidden cove 3km north of the fort, accessible only by foot through jungle. Crystal water, usually quiet, and no facilities — bring everything.', icon: '🏖️' },
      { name: 'Galle Literary Festival', description: 'The world\'s only tropical literary festival (January) draws international authors to the fort for a week of readings, panels, and parties.', icon: '📚' },
    ],
    bestMonths: [10, 11, 0, 1, 2, 3],
    bestTime: 'November – April',
    gettingThere:
      'By Southern Expressway from Colombo: 1.5–2 hours. The expressway has transformed access — Galle is now an easy day trip from Colombo, though you should stay at least one night.',
    accommodation:
      'The fort has excellent boutique hotels inside the walls — book the best ones 6+ months in advance. More affordable options are on the beaches north and east of the fort.',
    budget: 'Budget: $40–70/day · Mid-range: $120–250/day · Boutique fort hotel: $200–400/day',
    tips: [
      'The best rampart walk is at 6am — empty, golden light, fishermen on the rocks below.',
      'Cricket is played on the fort\'s 400-year-old cricket ground most weekend mornings.',
      'Get a tuk-tuk to Jungle Beach — the driver will wait and take you back.',
      'Mirissa whale season peaks in January–March. Book responsible operators only.',
    ],
    nearbySlug: 'colombo',
    nearbyName: 'Colombo',
  },
  colombo: {
    slug: 'colombo',
    name: 'Colombo',
    region: 'Western Province',
    tagline: 'A capital city in full, exhilarating bloom',
    image: 'https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/698a6aec5e5b8765ccd38e63_Screenshot%202026-02-10%20at%204.12.54%E2%80%AFAM.png',
    heroCaption: 'Galle Face Green, Colombo\'s colonial-era esplanade along the Indian Ocean',
    overview: [
      "Sri Lanka's commercial capital is a city in the middle of its own reinvention — colonial-era buildings and Dutch-built canals sit alongside gleaming towers, rooftop cocktail bars, and a food scene that spans everything from street-side hoppers at dawn to some of Asia's finest tasting menus.",
      "Colombo rewards the visitor who looks beyond the surface. The Fort district — once the colonial centre — contains magnificent but half-forgotten colonial architecture. Pettah is the city's chaotic, exhilarating wholesale market district, where vendors sell everything from spices to electronics in streets unchanged for generations.",
      "Colombo 7, the leafy residential area known as Cinnamon Gardens, is where the city's elite have always lived — and where its best boutique galleries, co-working cafés, and independent restaurants have recently taken root.",
    ],
    pullQuote: '"Colombo doesn\'t announce itself — it grows on you, block by block, meal by meal."',
    highlights: [
      { name: 'Galle Face Green', description: 'The historic 500m esplanade along the ocean, built by the British in 1859. At sunset, it fills with kite-flyers, food vendors, and families.', icon: '🌅' },
      { name: 'Gangaramaya Temple', description: 'Colombo\'s most atmospheric Buddhist temple, a fascinating mix of Sri Lankan, Thai, Indian, and Chinese architecture.', icon: '🛕' },
      { name: 'Pettah Markets', description: 'Dive into the city\'s wholesale market district — chaotic, colourful, and completely authentic. Each street has its own specialist trade.', icon: '🛒' },
      { name: 'Independence Square', description: 'The 1948 independence memorial and surrounding parklands are among the city\'s most pleasant places to walk at dawn.', icon: '🏛️' },
      { name: 'Colombo 7 / Cinnamon Gardens', description: 'The city\'s leafy, embassy-district neighbourhood, home to the best independent cafés, galleries, and the famous Viharamahadevi Park.', icon: '🌳' },
      { name: 'The Colombo Fort', description: 'The colonial-era fort district, whose Dutch and British buildings are slowly being restored. The old lighthouse and World Trade Centre are highlights.', icon: '🏙️' },
    ],
    bestMonths: [11, 0, 1, 2],
    bestTime: 'December – March',
    gettingThere:
      'Colombo is the island\'s hub — Bandaranaike International Airport is 30km north. A metered taxi takes 45–90 minutes depending on traffic. PickMe or Uber are the most reliable ride apps.',
    accommodation:
      'The city has excellent five-star hotels on the ocean, boutique guesthouses in Colombo 7, and a growing number of design hotels in converted colonial mansions.',
    budget: 'Budget: $40–70/day · Mid-range: $100–200/day · Luxury oceanfront hotel: $250–500/day',
    tips: [
      'Traffic is worst on weekday evenings (5–8pm). Plan accordingly.',
      'The tuk-tuk metered app (PickMe) eliminates negotiation and overcharging.',
      'Visit the Pettah markets on a weekday morning for the full experience.',
      'Colombo\'s rooftop bar scene is genuinely excellent — ask your hotel for current recommendations.',
    ],
    nearbySlug: 'galle',
    nearbyName: 'Galle',
  },
  sigiriya: {
    slug: 'sigiriya',
    name: 'Sigiriya',
    region: 'Cultural Triangle',
    tagline: 'An ancient kingdom rising from the jungle floor',
    image: 'https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/6984898b6458e65dd0444751_Must-Visit-Caves-in-Sri-Lanka%20(1).jpg',
    heroCaption: 'The Sigiriya rock fortress rises 200m from the surrounding jungle in the Cultural Triangle',
    overview: [
      "Rising 200 metres sheer above the surrounding jungle, the rock fortress of Sigiriya is one of Sri Lanka's most extraordinary sights — and one of the most remarkable archaeological sites in all of Asia. Built by King Kassapa I in the 5th century AD as a fortified palace in the sky, it was abandoned after his death and lay forgotten in the jungle until British archaeologist H.C.P. Bell rediscovered it in 1831.",
      "The climb to the summit is challenging but manageable for most visitors — around 1,200 steps in total, with the famous pocket of cave frescoes (the 'heavenly maidens') and the mirror wall appearing halfway up. The summit itself reveals the footprint of Kassapa's palace and views across an extraordinary geometric water garden below.",
      "The wider Cultural Triangle — including Polonnaruwa, Anuradhapura, and the Dambulla Cave Temple — is Sri Lanka's archaeological heartland, and Sigiriya is the most spectacular jewel in its crown.",
    ],
    pullQuote: '"Standing at the base of Sigiriya, you understand immediately why a 5th-century king chose this rock as his palace."',
    highlights: [
      { name: 'The Rock Fortress', description: 'The climb to Kassapa\'s 5th-century palace takes 1–1.5 hours. Go early to beat the heat and the crowds.', icon: '🗿' },
      { name: 'Cave Frescoes', description: 'Eighteen "heavenly maiden" frescoes survive on the western face of the rock, dating to the 5th century AD. They were painted by anonymous masters.', icon: '🎨' },
      { name: 'The Mirror Wall', description: 'A polished plaster wall so perfectly smooth that a king could see himself walking by. Still bears ancient graffiti from centuries of visitors.', icon: '🪞' },
      { name: 'Water Gardens', description: 'The geometric water gardens at the base of the rock, with their fountains and bathing pools, are among the earliest landscaped gardens in Asia.', icon: '💧' },
      { name: 'Pidurangala Rock', description: 'The neighbouring rock offers the best view of Sigiriya and is less crowded. Sunset from Pidurangala looking across at the fortress is unmissable.', icon: '🌄' },
      { name: 'Dambulla Cave Temple', description: '22km from Sigiriya, the five golden temples cut into a 160m rock face contain 153 Buddha statues and 2,000 sq metres of ancient murals.', icon: '🪬' },
    ],
    bestMonths: [0, 1, 2, 4, 5, 6, 7, 8],
    bestTime: 'January – September',
    gettingThere:
      'From Colombo: 4–5 hours by road. From Kandy: 2.5 hours. Best visited as part of a Cultural Triangle loop: Kandy → Sigiriya → Polonnaruwa → Anuradhapura. A private driver makes this flexible.',
    accommodation:
      'Sigiriya has excellent boutique lodges and eco-resorts in the surrounding jungle, many with pools and views of the rock. Habarana (15km) has more options at lower prices.',
    budget: 'Budget: $40–80/day · Mid-range: $150–250/day · Boutique jungle lodge: $200–400/day',
    tips: [
      'Arrive at the rock at 7am (opening time) — it\'s cooler and the sunrise light on the frescoes is spectacular.',
      'Hire a licensed guide at the entrance — the history and symbolism are difficult to appreciate alone.',
      'The entrance fee ($30 for foreign visitors) includes the water gardens and museum.',
      'Pidurangala is a short tuk-tuk ride away and the views of Sigiriya are worth the separate climb.',
    ],
    nearbySlug: 'kandy',
    nearbyName: 'Kandy',
  },
  'nuwara-eliya': {
    slug: 'nuwara-eliya',
    name: 'Nuwara Eliya',
    region: 'Hill Country',
    tagline: 'Tea, mist and Little England at 1,868 metres',
    image: 'https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/6984886cfce4578d36659ddd_What-are-the-top-attractions-in-Nuwara-Eliya_20241113112510.jpg',
    heroCaption: 'Tea estates cascade down the hillsides above Nuwara Eliya in the cool central highlands',
    overview: [
      "At 1,868 metres above sea level, Nuwara Eliya is Sri Lanka's highest city — a remnant of British hill-station culture that the colonial administrators established as a cool-climate retreat from the heat of Colombo. The British planted English flowers and built Tudor mansions, and the town retains a peculiar colonial atmosphere to this day: red pillar boxes, a golf club, horse-racing season, and temperatures that occasionally drop to single digits.",
      "The surrounding landscape, however, is entirely Sri Lankan — an astonishing mosaic of tea estates covering every hillside as far as you can see, broken by waterfalls, cloud forest, and the extraordinary Horton Plains, a high-altitude plateau that ends abruptly at World's End, a 880m sheer cliff over the southern lowlands.",
      "This is where Sri Lanka's finest teas are grown: the cool temperatures, thin soil, and persistent mist of the central highlands produce the delicate, high-grown teas that command the highest prices on the Colombo tea auction.",
    ],
    pullQuote: '"The British built Little England up here. The surrounding landscape disagreed entirely, and won."',
    highlights: [
      { name: "Horton Plains & World's End", description: 'A UNESCO World Heritage Site — a 3,160-hectare plateau ending in an 880m cliff. The early-morning walk through cloud forest is unforgettable.', icon: '🌄' },
      { name: 'Tea Plantation Tours', description: 'The Mackwoods Labookellie estate and Pedro Tea Factory offer excellent guided tours showing the full tea-making process, with generous tastings.', icon: '🍵' },
      { name: 'Gregory Lake', description: 'The colonial-era reservoir at the heart of the town, with pedal boats, lakeside cafés, and views to the surrounding peaks.', icon: '🚤' },
      { name: 'Victoria Park', description: 'The English-style Victorian park in the town centre, with manicured lawns, rare highland birds, and excellent birdwatching in April and August.', icon: '🌸' },
      { name: 'Single Tree Mountain', description: 'A hike above the town through pine forest and tea estate to a 360° panorama over the entire central highlands.', icon: '⛰️' },
      { name: 'April Season', description: 'Sri Lankan New Year (April 13–14) coincides with horse-racing season in Nuwara Eliya — the town transforms into a month-long party.', icon: '🐎' },
    ],
    bestMonths: [11, 0, 1, 2, 3],
    bestTime: 'December – April',
    gettingThere:
      'From Kandy: 3–4 hours by road (70km but winding mountain roads). The Nanu Oya railway station is 8km from town — trains arrive from Colombo and Kandy. A private driver allows stops at viewpoints and estates en route.',
    accommodation:
      'The Hill Club colonial hotel is Nuwara Eliya\'s legendary institution. There are also excellent boutique tea-estate lodges in the surrounding hills, some inside operating tea factories.',
    budget: 'Budget: $30–60/day · Mid-range: $100–200/day · Tea estate lodge: $180–380/day',
    tips: [
      "Horton Plains is best visited by 6am — clouds roll in by 10am and obstruct World's End.",
      'Pack warm layers — nights can drop to 5–8°C even in the dry season.',
      'The April horse-racing season (Sri Lankan New Year) is festive but crowds everything. Book well ahead.',
      'Pedro and Mackwoods tea factories both do excellent tours — call ahead to confirm opening times.',
    ],
    nearbySlug: 'ella',
    nearbyName: 'Ella',
  },
  trincomalee: {
    slug: 'trincomalee',
    name: 'Trincomalee',
    region: 'Eastern Province',
    tagline: "Sri Lanka's best-kept east coast secret",
    image: 'https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/6984898716687fc4ba9b5441_Sri-Lanka-5.jpg',
    heroCaption: 'Nilaveli beach, one of Sri Lanka\'s finest stretches of white sand, north of Trincomalee',
    overview: [
      "While the west coast hosts Sri Lanka's busiest beaches, the east coast has long been the better-kept secret — and Trincomalee, the gateway to the east, has one of the world's finest natural harbours and some of the island's most pristine white-sand beaches.",
      "The east coast operates on the reverse monsoon season: when the southwest monsoon brings rains to Colombo and Galle (May–October), the east coast enjoys its own dry season. Trincomalee's Nilaveli and Uppuveli beaches offer conditions between May and September that rival the Maldives — warm, clear water, minimal crowds, and a pace of life that hasn't yet been touched by mass tourism.",
      "The wider region is also significant for wildlife — sperm and blue whales pass the coast between May and September, Pigeon Island is one of Sri Lanka's best snorkelling sites, and the freshwater and saltwater ecosystems attract extraordinary birdlife.",
    ],
    pullQuote: '"The east coast is Sri Lanka before the crowds found it. Come now, while that\'s still true."',
    highlights: [
      { name: 'Nilaveli Beach', description: 'The finest beach in eastern Sri Lanka — 6km of white sand, calm water from May–September, and a laid-back beach bar scene.', icon: '🏖️' },
      { name: 'Pigeon Island', description: 'A protected marine sanctuary 2km offshore with exceptional coral and some of the best snorkelling in Sri Lanka. Black-tip reef sharks are resident.', icon: '🤿' },
      { name: 'Koneswaram Temple', description: 'An ancient Hindu temple perched dramatically on Swami Rock, a cliff rising 130m directly from the ocean. Stunning views at sunset.', icon: '🛕' },
      { name: 'Whale Watching', description: 'Sperm and blue whales pass close to Trincomalee between May and September. The season is less crowded than Mirissa and sightings are excellent.', icon: '🐋' },
      { name: 'Fort Frederick', description: 'The Portuguese-built, Dutch-expanded, British-completed fort on Swami Rock contains Koneswaram Temple and panoramic ocean views.', icon: '🏰' },
      { name: 'Hot Springs at Kanniya', description: 'Ancient wells of natural hot spring water, 8km from the city, believed to have been created by King Ravana. Used by pilgrims for millennia.', icon: '♨️' },
    ],
    bestMonths: [4, 5, 6, 7, 8],
    bestTime: 'May – September',
    gettingThere:
      'From Colombo: 5–6 hours by road via Habarana. Trincomalee has an airport with limited domestic flights. The Northern Line train from Colombo reaches Trinco in 7–8 hours. A private driver offers the most flexible access.',
    accommodation:
      'Nilaveli and Uppuveli beaches have excellent boutique resorts and guesthouses. The town itself has more budget options. The best places are on the beachfront.',
    budget: 'Budget: $30–55/day · Mid-range: $80–180/day · Boutique beach resort: $150–350/day',
    tips: [
      'The east coast season runs May–September. Avoid October–April when the northeast monsoon brings rain.',
      'Book Pigeon Island snorkelling trips through your hotel — they arrange responsible operators.',
      'Uppuveli (closer to town) is more lively. Nilaveli (further north) is quieter and less developed.',
      "The Koneswaram temple is most atmospheric at the Hindu morning puja — arrive by 7am.",
    ],
    nearbySlug: 'sigiriya',
    nearbyName: 'Sigiriya',
  },
  yala: {
    slug: 'yala',
    name: 'Yala National Park',
    region: 'Southern Province',
    tagline: 'Leopards, elephants & wild Sri Lanka at its most raw',
    image: 'https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/698487a2a035dec2b9a0c107_Fishermen.jpeg',
    heroCaption: 'A Sri Lankan leopard surveys its territory at Yala — the park has one of the world\'s highest leopard densities',
    overview: [
      "Yala National Park, covering 979 square kilometres of dry-zone scrub forest, lagoon, and beach in Sri Lanka's deep south, has one of the highest leopard densities in the world — a remarkable concentration that makes leopard sightings here more likely than in most of Africa.",
      "Beyond leopards, the park supports a spectacular range of wildlife: Asian elephants (herds of 30+ are common), sloth bears, sambar deer, spotted deer, golden jackals, crocodiles, and over 215 bird species including the black-necked stork. The block 1 of the park (the most accessible area) is where the famous Patanangala lagoon and beach system creates a wildlife concentration that is extraordinary by any global standard.",
      "Safari experiences at Yala operate from dawn and late afternoon (jeep safaris lasting 3–4 hours). The best sightings are typically in the early morning when leopards are still active. Staying at one of the lodges bordering the park boundary gives you first access at opening time.",
    ],
    pullQuote: '"Yala doesn\'t guarantee a leopard sighting. It does guarantee that you\'ll be watching for one around every corner."',
    highlights: [
      { name: 'Leopard Safaris', description: 'Yala has the world\'s highest density of wild leopards. Block 1 offers the best sightings, particularly around the Patanangala and Yala lagoon areas.', icon: '🐆' },
      { name: 'Elephant Herds', description: 'Large elephant herds are commonly seen, particularly in the dry season (June–September) when they congregate around remaining waterholes.', icon: '🐘' },
      { name: 'Sloth Bear', description: 'One of Sri Lanka\'s rarest sightings — the elusive sloth bear. Best chances are at dawn in the scrub forest areas.', icon: '🐻' },
      { name: 'Patanangala Beach', description: 'A wild beach inside the park boundary — one of the most extraordinary beach experiences in Sri Lanka, shared with nesting turtles and basking crocodiles.', icon: '🐊' },
      { name: 'Birdwatching', description: 'Over 215 bird species including painted stork, black-necked stork, lesser flamingo (seasonal), and the beautiful Sri Lanka junglefowl (national bird).', icon: '🦜' },
      { name: 'Bundala National Park', description: '18km west of Yala, Bundala is a Ramsar wetland site and haven for migratory waterbirds — lesser flamingos in the dry season are unmissable.', icon: '🦩' },
    ],
    bestMonths: [1, 2, 3, 4, 5, 6],
    bestTime: 'February – July',
    gettingThere:
      'From Colombo: 5–6 hours by road (300km). From Galle: 2.5–3 hours. The entrance gate at Palatupana is where all safaris begin. A private driver can get you from Galle or Colombo for an early start.',
    accommodation:
      'Staying inside or directly adjacent to the park boundary gives you first entry at dawn. Excellent eco-lodges border the park. Budget campsites are also available.',
    budget: 'Budget: $50–90/day · Eco-lodge: $150–280/day · Luxury camp: $350–600/day',
    tips: [
      'The morning safari (6–10am) is far better than the afternoon for leopard sightings.',
      'Hire a tracker with your jeep — experienced eyes make an enormous difference.',
      'The park is closed every September (for the annual rest period) — check dates before booking.',
      'Bring binoculars — essential for birdwatching and spotting wildlife in the distance.',
    ],
    nearbySlug: 'galle',
    nearbyName: 'Galle',
  },
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_QUALITY = (active: boolean) => (active ? '#1B5E4A' : '#C5BFBA');
const TABS = ['Overview', 'Highlights', 'When to Go', 'Practical Info'] as const;
type Tab = typeof TABS[number];

// ── Main Component ────────────────────────────────────────────────────────────
export default function DestinationDetail() {
  const [, params] = useRoute('/destinations/:slug');
  const slug = params?.slug ?? '';
  const dest = DEST_DATA[slug];

  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const tabRefs = {
    Overview: useRef<HTMLDivElement>(null),
    Highlights: useRef<HTMLDivElement>(null),
    'When to Go': useRef<HTMLDivElement>(null),
    'Practical Info': useRef<HTMLDivElement>(null),
  };

  const scrollToTab = (tab: Tab) => {
    setActiveTab(tab);
    tabRefs[tab].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    (Object.entries(tabRefs) as [Tab, React.RefObject<HTMLDivElement>][]).forEach(([tab, ref]) => {
      if (!ref.current) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveTab(tab); },
        { threshold: 0.3, rootMargin: '-80px 0px -40% 0px' }
      );
      obs.observe(ref.current);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  if (!dest) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAF8F3' }}>
        <div className="text-center px-6">
          <Kicker className="mb-4">Not Found</Kicker>
          <h1
            className="font-display font-normal mb-6"
            style={{ fontSize: '3rem', color: '#0C2421' }}
          >
            We don't have a guide for this destination yet.
          </h1>
          <Link href="/destinations">
            <Button style={{ backgroundColor: '#0C2421', color: '#FAF8F3' }}>
              Back to the Guide
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#FAF8F3' }}>
      {/* ── Cinematic Hero ── */}
      <div ref={heroRef} className="relative h-screen overflow-hidden">
        <motion.img
          src={dest.image}
          alt={dest.name}
          style={{ y: imageY }}
          className="absolute inset-0 w-full h-full object-cover scale-[1.15]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

        {/* Caption bottom-right */}
        <p
          className="absolute bottom-8 right-6 text-[11px] uppercase tracking-widest hidden lg:block"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          {dest.heroCaption}
        </p>

        <motion.div
          style={{ y: textY, opacity }}
          className="absolute inset-0 flex flex-col justify-end pb-16 lg:pb-20 px-6"
        >
          <div className="max-w-[1200px] mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                href="/destinations"
                className="inline-flex items-center gap-2 mb-8 text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Sri Lanka Guide
              </Link>

              <Kicker className="mb-4">{dest.region}</Kicker>

              <h1
                className="font-display font-normal text-white leading-[0.95] mb-4"
                style={{
                  fontSize: 'clamp(3.5rem, 10vw, 8rem)',
                }}
              >
                {dest.name}
              </h1>

              <p className="text-white/65 text-lg max-w-xl mb-10 leading-relaxed">{dest.tagline}</p>

              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2 text-white/70">
                  <Calendar className="h-4 w-4" style={{ color: '#C4873A' }} />
                  <span>
                    Best: <strong className="text-white">{dest.bestTime}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <MapPin className="h-4 w-4" style={{ color: '#C4873A' }} />
                  <strong className="text-white">{dest.region}</strong>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <Compass className="h-4 w-4" style={{ color: '#C4873A' }} />
                  <span className="text-white">{dest.highlights.length} highlights</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ChevronDown className="h-6 w-6 text-white/40" />
        </motion.div>
      </div>

      {/* ── Sticky Tab Nav ── */}
      <div
        className="sticky top-[64px] z-40 border-b"
        style={{ backgroundColor: '#FAF8F3', borderColor: 'rgba(12,36,33,0.1)' }}
      >
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex gap-0 overflow-x-auto scrollbar-none">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => scrollToTab(tab)}
                className="px-5 py-4 text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2 -mb-px"
                style={{
                  color: activeTab === tab ? '#0C2421' : 'rgba(12,36,33,0.45)',
                  borderBottomColor: activeTab === tab ? '#C4873A' : 'transparent',
                  fontWeight: activeTab === tab ? 600 : 400,
                }}
              >
                {tab}
              </button>
            ))}
            <div className="ml-auto hidden md:flex items-center gap-3 py-3">
              <Link href="/tours">
                <Button
                  size="sm"
                  className="h-9 px-5 rounded-full text-xs font-bold uppercase tracking-wider"
                  style={{ backgroundColor: '#0C2421', color: '#FAF8F3' }}
                >
                  View Related Tours
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Overview ── */}
      <div ref={tabRefs['Overview']} className="scroll-mt-32">
        <section className="py-20 lg:py-28">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="grid lg:grid-cols-[1fr_360px] gap-16 lg:gap-24">
              {/* Main text */}
              <div>
                <Kicker className="mb-8">Overview</Kicker>
                {dest.overview.map((para, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.6, delay: i * 0.08 }}
                    className="text-base leading-[1.85] mb-6"
                    style={{ color: '#2A2420' }}
                  >
                    {para}
                  </motion.p>
                ))}

                {/* Pull quote */}
                <motion.blockquote
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7 }}
                  className="my-10 pl-6 border-l-2"
                  style={{ borderColor: '#C4873A' }}
                >
                  <p
                    className="font-display font-normal italic leading-snug"
                    style={{
                      fontSize: '1.5rem',
                      color: '#0C2421',
                    }}
                  >
                    {dest.pullQuote}
                  </p>
                </motion.blockquote>
              </div>

              {/* Sidebar facts */}
              <div className="lg:pt-10">
                <div
                  className="rounded-2xl p-7 sticky top-32"
                  style={{ backgroundColor: '#F0EDE7', border: '1px solid rgba(12,36,33,0.08)' }}
                >
                  <p
                    className="text-[11px] font-medium uppercase tracking-[0.08em] mb-6"
                    style={{ color: '#C4873A' }}
                  >
                    Quick Facts
                  </p>
                  <div className="space-y-5">
                    {[
                      { label: 'Best time', value: dest.bestTime, icon: Sun },
                      { label: 'Region', value: dest.region, icon: MapPin },
                      { label: 'Highlights', value: `${dest.highlights.length} must-sees`, icon: Compass },
                      { label: 'Getting there', value: dest.gettingThere.split('.')[0] + '.', icon: ArrowRight },
                    ].map(({ label, value, icon: Icon }) => (
                      <div key={label}>
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="h-3.5 w-3.5" style={{ color: '#C4873A' }} />
                          <span className="text-[11px] font-medium uppercase tracking-[0.08em]" style={{ color: '#8A7E74' }}>
                            {label}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed pl-[22px]" style={{ color: '#2A2420' }}>
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6" style={{ borderTop: '1px solid rgba(12,36,33,0.1)' }}>
                    <Link href="/tours">
                      <Button
                        className="w-full h-11 rounded-full font-medium text-sm transition-all duration-200"
                        style={{ backgroundColor: '#0C2421', color: '#FAF8F3' }}
                      >
                        Browse Tours in {dest.name.split(' ')[0]}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── Highlights ── */}
      <div ref={tabRefs['Highlights']} className="scroll-mt-32">
        <section className="py-20 lg:py-24" style={{ backgroundColor: '#111C1A' }}>
          <div className="max-w-[1200px] mx-auto px-6">
            <Kicker className="mb-4">Top Experiences</Kicker>
            <h2
              className="font-display font-normal mb-14 leading-[1.05]"
              style={{
                fontSize: 'clamp(2.25rem, 4vw, 3.5rem)',
                color: '#FAF8F3',
              }}
            >
              What not to miss in{' '}
              <em className="italic" style={{ color: '#6FA394' }}>
                {dest.name.split(' ')[0]}.
              </em>
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
              {dest.highlights.map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                  className="p-7"
                  style={{ backgroundColor: '#111C1A' }}
                >
                  <span className="text-3xl block mb-4">{h.icon}</span>
                  <div className="flex items-start gap-3 mb-3">
                    <span
                      className="font-display font-normal shrink-0 text-sm"
                      style={{ color: 'rgba(196,135,58,0.4)', fontSize: '1.1rem' }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h4
                      className="font-display font-normal text-white leading-snug"
                      style={{ fontSize: '1.2rem' }}
                    >
                      {h.name}
                    </h4>
                  </div>
                  <p className="text-sm leading-relaxed pl-8" style={{ color: 'rgba(250,248,243,0.5)' }}>
                    {h.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ── When to Go ── */}
      <div ref={tabRefs['When to Go']} className="scroll-mt-32">
        <section className="py-20 lg:py-24">
          <div className="max-w-[1200px] mx-auto px-6">
            <Kicker className="mb-4">Seasonality</Kicker>
            <h2
              className="font-display font-normal mb-12 leading-[1.05]"
              style={{
                fontSize: 'clamp(2.25rem, 4vw, 3.5rem)',
                color: '#0C2421',
              }}
            >
              The best time to visit{' '}
              <em className="italic" style={{ color: '#6FA394' }}>
                {dest.name.split(' ')[0]}.
              </em>
            </h2>

            <div className="grid grid-cols-12 gap-2 mb-6">
              {MONTHS.map((m, i) => {
                const isGood = dest.bestMonths.includes(i);
                const isCurrent = i === new Date().getMonth();
                return (
                  <motion.div
                    key={m}
                    initial={{ opacity: 0, scaleY: 0 }}
                    whileInView={{ opacity: 1, scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.04 }}
                    style={{ originY: 1 }}
                  >
                    <div
                      className="rounded-xl transition-all duration-200"
                      style={{
                        height: '80px',
                        backgroundColor: MONTH_QUALITY(isGood),
                        outline: isCurrent ? '2px solid #C4873A' : 'none',
                        outlineOffset: '3px',
                      }}
                    />
                    <p
                      className="text-center text-[11px] font-bold uppercase mt-2"
                      style={{ color: isCurrent ? '#C4873A' : '#8A7E74' }}
                    >
                      {m}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            <div className="flex items-center gap-6 text-sm mb-16">
              <div className="flex items-center gap-2">
                <div className="h-3 w-6 rounded" style={{ backgroundColor: '#1B5E4A' }} />
                <span style={{ color: '#8A7E74' }}>Best time</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-6 rounded" style={{ backgroundColor: '#C5BFBA' }} />
                <span style={{ color: '#8A7E74' }}>Off-season / rains</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-6 rounded border-2" style={{ borderColor: '#C4873A', backgroundColor: 'transparent' }} />
                <span style={{ color: '#8A7E74' }}>Current month</span>
              </div>
            </div>

            <div
              className="rounded-2xl p-7"
              style={{ backgroundColor: '#F0EDE7', border: '1px solid rgba(12,36,33,0.08)' }}
            >
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="h-4 w-4" style={{ color: '#C4873A' }} />
                <span className="text-sm font-bold" style={{ color: '#0C2421' }}>
                  Recommended: {dest.bestTime}
                </span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#5A5046' }}>
                {dest.name.split(' ')[0]} is best visited during the dry season. Outside of these months you may still have good weather, but there's a higher chance of rain and some activities may be limited. Contact our team for advice on your specific travel dates.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* ── Practical Info ── */}
      <div ref={tabRefs['Practical Info']} className="scroll-mt-32">
        <section className="py-20 lg:py-24" style={{ backgroundColor: '#0C2421' }}>
          <div className="max-w-[1200px] mx-auto px-6">
            <Kicker className="mb-4">Before You Go</Kicker>
            <h2
              className="font-display font-normal mb-14 leading-[1.05]"
              style={{
                fontSize: 'clamp(2.25rem, 4vw, 3.5rem)',
                color: '#FAF8F3',
              }}
            >
              Practical information.
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
              {[
                { label: 'Getting There', value: dest.gettingThere, icon: '✈️' },
                { label: 'Where to Stay', value: dest.accommodation, icon: '🛏️' },
                { label: 'Budget Guide', value: dest.budget, icon: '💰' },
              ].map(({ label, value, icon }) => (
                <div
                  key={label}
                  className="rounded-2xl p-6"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <span className="text-2xl block mb-3">{icon}</span>
                  <p className="text-xs font-medium uppercase tracking-[0.08em] mb-3" style={{ color: '#C4873A' }}>
                    {label}
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(250,248,243,0.6)' }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* Tips */}
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.08em] mb-6" style={{ color: 'rgba(250,248,243,0.4)' }}>
                Local tips from our drivers
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {dest.tips.map((tip, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.07 }}
                    className="flex items-start gap-4 p-4 rounded-xl"
                    style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
                  >
                    <span
                      className="font-display font-normal text-sm shrink-0 mt-0.5"
                      style={{ color: 'rgba(196,135,58,0.5)', fontSize: '1.25rem' }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(250,248,243,0.65)' }}>
                      {tip}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── Next Destination + Tours CTA ── */}
      <section className="py-20 lg:py-28">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Book a tour CTA */}
            <div
              className="rounded-2xl p-10 flex flex-col justify-between"
              style={{ backgroundColor: '#0C2421', minHeight: '280px' }}
            >
              <div>
                <Kicker className="mb-4">Ready to visit?</Kicker>
                <h3
                  className="font-display font-normal text-white mb-4 leading-snug"
                  style={{ fontSize: '2rem' }}
                >
                  Browse tours that include {dest.name.split(' ')[0]}.
                </h3>
                <p className="text-sm" style={{ color: 'rgba(250,248,243,0.5)' }}>
                  Private driver, modern vehicle, flexible itinerary. All included.
                </p>
              </div>
              <Link href="/tours" className="mt-8">
                <Button className="h-11 px-7 rounded-full font-medium" style={{ backgroundColor: '#C4873A', color: '#FAF8F3' }}>
                  View All Tours <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Next destination card */}
            {dest.nearbySlug && dest.nearbyName && (
              <Link href={`/destinations/${dest.nearbySlug}`} className="block group">
                <div
                  className="relative rounded-2xl overflow-hidden flex flex-col justify-end p-10"
                  style={{ minHeight: '280px' }}
                >
                  <img
                    src={DEST_DATA[dest.nearbySlug]?.image ?? dest.image}
                    alt={dest.nearbyName}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  <div className="relative">
                    <p className="text-xs font-medium uppercase tracking-[0.08em] mb-2" style={{ color: '#C4873A' }}>
                      Next destination
                    </p>
                    <h3
                      className="font-display font-normal text-white mb-4 leading-snug group-hover:underline"
                      style={{ fontSize: '2rem' }}
                    >
                      {dest.nearbyName}
                    </h3>
                    <div className="flex items-center gap-2 text-white/70 group-hover:gap-4 transition-all duration-300 text-sm font-bold uppercase tracking-wider">
                      Explore <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            )}
          </div>

          {/* Back to guide */}
          <div className="mt-10 text-center">
            <Link
              href="/destinations"
              className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider group"
              style={{ color: '#8A7E74' }}
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to the Sri Lanka Guide
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
