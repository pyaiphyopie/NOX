class Event {
  final String id,
      title,
      coverUrl,
      venue,
      category,
      genre,
      description,
      timeLabel;
  final DateTime dateTime;
  final double price;
  final int attendance, capacity;
  final List<String> lineup, tags;

  const Event({
    required this.id,
    required this.title,
    required this.coverUrl,
    required this.venue,
    required this.category,
    required this.genre,
    required this.description,
    required this.dateTime,
    required this.timeLabel,
    required this.price,
    required this.attendance,
    required this.capacity,
    required this.lineup,
    required this.tags,
  });
}

final List<Event> mockEvents = [
  Event(
    id: '1',
    title: 'NEON DISTRICT',
    coverUrl:
        'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200&auto=format&fit=crop',
    venue: 'Warehouse 19',
    category: 'Techno',
    genre: 'Techno / Underground',
    description: "Yangon's premier underground techno experience.",
    dateTime: DateTime(2026, 5, 23, 23),
    timeLabel: 'Tonight \u2022 11:00 PM',
    price: 12,
    attendance: 842,
    capacity: 1200,
    lineup: ['DJ KYAW', 'Neon Pulse'],
    tags: ['18+', 'Indoor', 'Full Bar'],
  ),
  Event(
    id: '2',
    title: 'AFTERHOURS',
    coverUrl:
        'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1200&auto=format&fit=crop',
    venue: 'NOIR Rooftop',
    category: 'Hip-Hop',
    genre: 'Hip-Hop / Trap',
    description: 'Premium rooftop hip-hop with panoramic Yangon skyline.',
    dateTime: DateTime(2026, 5, 29, 22, 30),
    timeLabel: 'Friday \u2022 10:30 PM',
    price: 18,
    attendance: 320,
    capacity: 500,
    lineup: ['MC Yangon', 'DJ Su'],
    tags: ['21+', 'Rooftop', 'VIP'],
  ),
  Event(
    id: '3',
    title: 'SKYLINE SIGNAL',
    coverUrl:
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop',
    venue: 'Atlas Terrace',
    category: 'Rooftop',
    genre: 'Rooftop / House',
    description: "Sunset house music on Yangon's highest terrace.",
    dateTime: DateTime(2026, 5, 30, 21, 30),
    timeLabel: 'Saturday \u2022 9:30 PM',
    price: 20,
    attendance: 156,
    capacity: 300,
    lineup: ['House Cartel'],
    tags: ['21+', 'Outdoor'],
  ),
  Event(
    id: '4',
    title: 'AMPLIFIED CITY',
    coverUrl:
        'https://images.unsplash.com/photo-1501612780327-45045538702b?q=80&w=1200&auto=format&fit=crop',
    venue: 'The Foundry',
    category: 'Live Bands',
    genre: 'Live Bands / Indie',
    description: "Myanmar's best indie showcase.",
    dateTime: DateTime(2026, 5, 31, 20),
    timeLabel: 'Sunday \u2022 8:00 PM',
    price: 10,
    attendance: 234,
    capacity: 400,
    lineup: ['Side Effect'],
    tags: ['All Ages', 'Live Music'],
  ),
  Event(
    id: '5',
    title: 'ELECTRIC MONSOON',
    coverUrl:
        'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=1200&auto=format&fit=crop',
    venue: 'Pulse Arena',
    category: 'EDM',
    genre: 'EDM / Festival',
    description: "Yangon's largest EDM festival.",
    dateTime: DateTime(2026, 6, 5, 22),
    timeLabel: 'Next Friday \u2022 10:00 PM',
    price: 25,
    attendance: 1890,
    capacity: 2500,
    lineup: ['Headliner TBA'],
    tags: ['18+', 'Festival'],
  ),
];

final List<String> categories = [
  'All',
  'Techno',
  'Hip-Hop',
  'EDM',
  'Live Bands',
  'Rooftop',
];
