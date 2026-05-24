import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/studio_provider.dart';
import '../services/ai_voice_service.dart';
import '../widgets/audio_player_widget.dart';

class VoiceoverGeneratorScreen extends ConsumerStatefulWidget {
  const VoiceoverGeneratorScreen({super.key});

  @override
  ConsumerState<VoiceoverGeneratorScreen> createState() =>
      _VoiceoverGeneratorScreenState();
}

class _VoiceoverGeneratorScreenState
    extends ConsumerState<VoiceoverGeneratorScreen> {
  final AiVoiceService _service = const AiVoiceService();
  final TextEditingController _scriptController = TextEditingController();
  String _voice = 'Guy';
  bool _loading = false;
  String? _audioUrl;

  @override
  void dispose() {
    _scriptController.dispose();
    super.dispose();
  }

  Future<void> _generate() async {
    setState(() => _loading = true);
    ref.read(studioProvider.notifier).startGeneration();

    try {
      final String? url = await _service.generateVoice(
        script: _scriptController.text.trim(),
        voice: _voice,
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
                title: '$_voice voiceover',
                type: StudioAssetType.voiceover,
                createdAt: DateTime.now(),
                url: url,
                metadata: <String, Object?>{'voice': _voice},
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
        title: const Text('AI Voiceover'),
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: <Widget>[
          TextField(
            controller: _scriptController,
            maxLines: 5,
            style: const TextStyle(color: Colors.white),
            decoration: const InputDecoration(
              border: OutlineInputBorder(),
              hintText: 'Enter script',
              hintStyle: TextStyle(color: Colors.white54),
            ),
          ),
          const SizedBox(height: 20),
          DropdownButtonFormField<String>(
            dropdownColor: const Color(0xFF101014),
            value: _voice,
            decoration: const InputDecoration(border: OutlineInputBorder()),
            style: const TextStyle(color: Colors.white),
            items: <String>['Guy', 'Jenny', 'NeonHost', 'DeepClub']
                .map(
                  (String voice) => DropdownMenuItem<String>(
                    value: voice,
                    child: Text(voice),
                  ),
                )
                .toList(growable: false),
            onChanged: (String? value) {
              if (value != null) {
                setState(() => _voice = value);
              }
            },
          ),
          const SizedBox(height: 20),
          ElevatedButton.icon(
            onPressed: _loading ? null : _generate,
            icon: _loading
                ? const SizedBox.square(
                    dimension: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.record_voice_over),
            label: const Text('Generate Voiceover'),
          ),
          if (_audioUrl != null) ...<Widget>[
            const SizedBox(height: 20),
            AudioPlayerWidget(
              title: 'Generated $_voice voiceover',
              audioUrl: _audioUrl!,
            ),
          ],
        ],
      ),
    );
  }
}
