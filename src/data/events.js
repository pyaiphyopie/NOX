// ── Event Data ────────────────────────────────────
export const EVENTS = [
  {
    id: '1',
    title: 'NEON DISTRICT',
    venue: 'Warehouse 19',
    genre: 'Techno / Underground',
    category: 'Techno',
    time: 'Tonight • 11:00 PM',
    date: '2026-05-23T23:00:00',
    price: 12,
    currency: 'USD',
    attendance: 842,
    capacity: 1200,
    image:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200&auto=format&fit=crop',
    description:
      "Yangon's premier underground techno experience. World-class sound system in a repurposed industrial space.",
    lineup: ['DJ KYAW', 'Neon Pulse', 'Underground Syndicate'],
    tags: ['18+', 'Indoor', 'Full Bar'],
  },
  {
    id: '2',
    title: 'AFTERHOURS',
    venue: 'NOIR Rooftop',
    genre: 'Hip-Hop / Trap',
    category: 'Hip-Hop',
    time: 'Friday • 10:30 PM',
    date: '2026-05-29T22:30:00',
    price: 18,
    currency: 'USD',
    attendance: 320,
    capacity: 500,
    image:
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1200&auto=format&fit=crop',
    description: 'Premium rooftop hip-hop experience with panoramic Yangon skyline views.',
    lineup: ['MC Yangon', 'DJ Su', 'Trap Lords'],
    tags: ['21+', 'Rooftop', 'VIP Available'],
  },
  {
    id: '3',
    title: 'SKYLINE SIGNAL',
    venue: 'Atlas Terrace',
    genre: 'Rooftop / House',
    category: 'Rooftop',
    time: 'Saturday • 9:30 PM',
    date: '2026-05-30T21:30:00',
    price: 20,
    currency: 'USD',
    attendance: 156,
    capacity: 300,
    image:
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop',
    description: "Sunset house music sessions on Yangon's highest open-air terrace.",
    lineup: ['House Cartel', 'Skyline Collective'],
    tags: ['21+', 'Outdoor', 'Sunset Session'],
  },
  {
    id: '4',
    title: 'AMPLIFIED CITY',
    venue: 'The Foundry',
    genre: 'Live Bands / Indie',
    category: 'Live Bands',
    time: 'Sunday • 8:00 PM',
    date: '2026-05-31T20:00:00',
    price: 10,
    currency: 'USD',
    attendance: 234,
    capacity: 400,
    image:
      'https://images.unsplash.com/photo-1501612780327-45045538702b?q=80&w=1200&auto=format&fit=crop',
    description: "Myanmar's best indie and live band showcase. New artists every week.",
    lineup: ['Side Effect', 'The Rebel Riot', 'Echo Chamber'],
    tags: ['All Ages', 'Indoor', 'Live Music'],
  },
  {
    id: '5',
    title: 'ELECTRIC MONSOON',
    venue: 'Pulse Arena',
    genre: 'EDM / Festival',
    category: 'EDM',
    time: 'Next Friday • 10:00 PM',
    date: '2026-06-05T22:00:00',
    price: 25,
    currency: 'USD',
    attendance: 1890,
    capacity: 2500,
    image:
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=1200&auto=format&fit=crop',
    description:
      "Yangon's largest EDM festival experience. International headliners, immersive production.",
    lineup: ['Headliner TBA', 'Pulse Residents', 'Special Guest'],
    tags: ['18+', 'Festival', 'Multi-Stage'],
  },
];

export const CATEGORIES = ['All', 'Techno', 'Hip-Hop', 'EDM', 'Live Bands', 'Rooftop'];

export const VENUES = [
  { name: 'Warehouse 19', type: 'Club', capacity: 1200, location: 'Dagon Township', rating: 4.8 },
  {
    name: 'NOIR Rooftop',
    type: 'Rooftop Bar',
    capacity: 500,
    location: 'Bahan Township',
    rating: 4.6,
  },
  { name: 'Atlas Terrace', type: 'Open-Air', capacity: 300, location: 'Sanchaung', rating: 4.5 },
  {
    name: 'The Foundry',
    type: 'Live House',
    capacity: 400,
    location: 'Ahlone Township',
    rating: 4.7,
  },
  { name: 'Pulse Arena', type: 'Arena', capacity: 2500, location: 'Hlaing Township', rating: 4.9 },
];

export const DASHBOARD_METRICS = {
  ticketsSold: 1248,
  revenue: 18900,
  attendanceRate: 92,
  checkIns: 1034,
};

export const PROMOTER_WORKFLOW = [
  {
    step: 'Draft event',
    description: 'Create your event listing with details, lineup, and pricing.',
  },
  {
    step: 'Set capacity',
    description: 'Configure venue capacity, ticket tiers, and availability.',
  },
  {
    step: 'Publish tickets',
    description: 'Go live with your event. Instant QR ticket generation.',
  },
  {
    step: 'Scan entry',
    description: 'Use the NOX Scanner to validate digital tickets at the door.',
  },
];

export const PLATFORM_FEATURES = [
  {
    title: 'Event Discovery',
    desc: 'Real-time nightlife discovery optimized for mobile-first urban culture.',
  },
  {
    title: 'QR Ticketing',
    desc: 'Fraud-resistant digital entry infrastructure with instant validation.',
  },
  {
    title: 'Promoter OS',
    desc: 'Operational dashboards, analytics, attendance tracking, and guestlists.',
  },
  {
    title: 'Venue Intelligence',
    desc: 'Customer trends, forecasting, and nightlife behavioral insights.',
  },
];
