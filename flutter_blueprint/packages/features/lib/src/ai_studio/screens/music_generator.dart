import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/studio_provider.dart';
import '../services/ai_music_service.dart';
import '../widgets/audio_player_widget.dart';

class MusicGeneratorScreen extends ConsumerStatefulWidget {
  const MusicGeneratorScreen({super.key});

  @override
  ConsumerState<MusicGeneratorScreen> createState() =>
      _MusicGeneratorScreenState();
}

class _MusicGeneratorScreenState extends ConsumerState<MusicGeneratorScreen> {
  final AiMusicService _service = const AiMusicService();
  String _genre = 'EDM';
  double _bpm = 120;
  bool _loading = false;
  String? _audioUrl;

  Future<void> _generate() async {
    setState(() => _loading = true);
    ref.read(studioProvider.notifier).startGeneration();

    try {
      final String? url = await _service.generateMusic(
        genre: _genre,
        bpm: _bpm.round(),
      );

      if (!mounted) {
        return;
      }

      setState(() {
        _audioUrl = url;
        _loading = false;
      });

      if (url != null) {
        ref.read(studioProvider.notifier).finishGeneration(
              StudioAsset(
                id: DateTime.now().microsecondsSinceEpoch.toString(),
                title: '$_genre ${_bpm.round()} BPM',
                type: StudioAssetType.music,
                createdAt: DateTime.now(),
                url: url,
                metadata: <String, Object?>{
                  'genre': _genre,
                  'bpm': _bpm.round(),
                },
              ),
            );
      }
    } catch (error) {
      if (!mounted) {
        return;
      }
      setState(() => _loading = false);
      ref.read(studioProvider.notifier).failGeneration(error);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.toString())),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('AI Music Generator'),
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: <Widget>[
          const Text('Genre', style: TextStyle(color: Colors.white)),
          const SizedBox(height: 8),
          DropdownButtonFormField<String>(
            dropdownColor: const Color(0xFF101014),
            value: _genre,
            decoration: const InputDecoration(border: OutlineInputBorder()),
            style: const TextStyle(color: Colors.white),
            items: <String>['EDM', 'Techno', 'Afrobeat', 'Deep House']
                .map(
                  (String genre) => DropdownMenuItem<String>(
                    value: genre,
                    child: Text(genre),
                  ),
                )
                .toList(growable: false),
            onChanged: (String? value) {
              if (value != null) {
                setState(() => _genre = value);
              }
            },
          ),
          const SizedBox(height: 20),
          Text(
            'BPM ${_bpm.round()}',
            style: const TextStyle(color: Colors.white),
          ),
          Slider(
            value: _bpm,
            min: 80,
            max: 160,
            divisions: 80,
            label: _bpm.round().toString(),
            onChanged: (double value) => setState(() => _bpm = value),
          ),
          const SizedBox(height: 20),
          ElevatedButton.icon(
            onPressed: _loading ? null : _generate,
            icon: _loading
                ? const SizedBox.square(
                    dimension: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.auto_awesome),
            label: const Text('Generate Track'),
          ),
          if (_audioUrl != null) ...<Widget>[
            const SizedBox(height: 20),
            AudioPlayerWidget(
              title: 'Generated $_genre track',
              audioUrl: _audioUrl!,
            ),
          ],
        ],
      ),
    );
  }
}
