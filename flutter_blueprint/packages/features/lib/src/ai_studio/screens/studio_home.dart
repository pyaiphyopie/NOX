import 'package:flutter/material.dart';
import '../widgets/studio_card.dart';

class StudioHomeScreen extends StatelessWidget {
  const StudioHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('NOX AI Studio'),
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
      ),
      body: GridView.count(
        padding: const EdgeInsets.all(20),
        crossAxisCount: MediaQuery.sizeOf(context).width > 640 ? 3 : 2,
        crossAxisSpacing: 14,
        mainAxisSpacing: 14,
        childAspectRatio: 1.05,
        children: const <Widget>[
          StudioCard(
            title: 'AI Music',
            icon: Icons.music_note,
            route: '/studio/music',
            accentColor: Colors.cyanAccent,
          ),
          StudioCard(
            title: 'Voiceover',
            icon: Icons.record_voice_over,
            route: '/studio/voice',
            accentColor: Colors.lightGreenAccent,
          ),
          StudioCard(
            title: 'Poster',
            icon: Icons.image,
            route: '/studio/poster',
            accentColor: Colors.pinkAccent,
          ),
          StudioCard(
            title: 'Copywriting',
            icon: Icons.edit,
            route: '/studio/copy',
            accentColor: Colors.amberAccent,
          ),
          StudioCard(
            title: 'Asset Library',
            icon: Icons.inventory_2_outlined,
            route: '/studio/assets',
            accentColor: Colors.deepPurpleAccent,
          ),
        ],
      ),
    );
  }
}
