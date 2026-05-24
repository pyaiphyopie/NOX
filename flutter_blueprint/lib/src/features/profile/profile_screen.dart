import 'package:flutter/material.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF070707),
      appBar: AppBar(
        title: const Text('Profile'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // Profile header
            const SizedBox(height: 20),
            Container(
              width: 88,
              height: 88,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                gradient: LinearGradient(
                  colors: [Color(0xFF00AEEF), Color(0xFF8B5CF6)],
                ),
              ),
              child: const Center(
                child: Text(
                  'N',
                  style: TextStyle(
                    fontSize: 36,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Nightlife Explorer',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
              decoration: BoxDecoration(
                color: const Color(0xFF00AEEF).withOpacity(0.15),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Text(
                'Beta Insider',
                style: TextStyle(
                  color: Color(0xFF00AEEF),
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),

            // Stats
            const SizedBox(height: 32),
            Row(
              children: [
                _statCard('8', 'Saved Venues'),
                const SizedBox(width: 12),
                _statCard('Techno', 'Top Genre'),
                const SizedBox(width: 12),
                _statCard('\$30', 'Credits'),
                const SizedBox(width: 12),
                _statCard('12', 'Attended'),
              ],
            ),

            // Preferences
            const SizedBox(height: 32),
            _sectionCard(
              'Music Preferences',
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  'Techno',
                  'EDM',
                  'Hip-Hop',
                  'Live Bands',
                  'House',
                  'Underground',
                ]
                    .map(
                      (g) => Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 8,
                        ),
                        decoration: BoxDecoration(
                          color: ['Techno', 'EDM', 'Hip-Hop'].contains(g)
                              ? const Color(0xFF00AEEF).withOpacity(0.15)
                              : Colors.white.withOpacity(0.05),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: ['Techno', 'EDM', 'Hip-Hop'].contains(g)
                                ? const Color(0xFF00AEEF).withOpacity(0.4)
                                : Colors.white10,
                          ),
                        ),
                        child: Text(
                          g,
                          style: TextStyle(
                            color: ['Techno', 'EDM', 'Hip-Hop'].contains(g)
                                ? const Color(0xFF00AEEF)
                                : Colors.white54,
                            fontSize: 13,
                          ),
                        ),
                      ),
                    )
                    .toList(),
              ),
            ),

            const SizedBox(height: 16),
            _sectionCard(
              'Saved Venues',
              Column(
                children: [
                  _venueRow('Warehouse 19', 'Dagon Township', '4.8'),
                  const Divider(color: Colors.white10, height: 1),
                  _venueRow('Pulse Arena', 'Hlaing Township', '4.9'),
                  const Divider(color: Colors.white10, height: 1),
                  _venueRow('NOIR Rooftop', 'Bahan Township', '4.6'),
                ],
              ),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _statCard(String value, String label) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: const Color(0xFF141414),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white10),
        ),
        child: Column(
          children: [
            Text(
              value,
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w800,
                color: Color(0xFF00AEEF),
              ),
            ),
            const SizedBox(height: 4),
            Text(label, style: TextStyle(color: Colors.white38, fontSize: 11)),
          ],
        ),
      ),
    );
  }

  Widget _sectionCard(String title, Widget child) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF141414),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 16),
          child,
        ],
      ),
    );
  }

  Widget _venueRow(String name, String location, String rating) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        children: [
          const Icon(Icons.location_on, color: Color(0xFF00AEEF), size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: const TextStyle(fontWeight: FontWeight.w600)),
                Text(
                  location,
                  style: TextStyle(color: Colors.white38, fontSize: 12),
                ),
              ],
            ),
          ),
          Text(
            '★ $rating',
            style: const TextStyle(color: Color(0xFF00AEEF), fontSize: 13),
          ),
        ],
      ),
    );
  }
}
