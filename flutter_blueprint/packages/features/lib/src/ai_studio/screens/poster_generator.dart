import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/studio_provider.dart';
import '../services/ai_image_service.dart';
import '../widgets/poster_preview.dart';

class PosterGeneratorScreen extends ConsumerStatefulWidget {
  const PosterGeneratorScreen({super.key});

  @override
  ConsumerState<PosterGeneratorScreen> createState() =>
      _PosterGeneratorScreenState();
}

class _PosterGeneratorScreenState extends ConsumerState<PosterGeneratorScreen> {
  final AiImageService _service = const AiImageService();
  final TextEditingController _promptController = TextEditingController();
  String _style = 'Neon club';
  bool _loading = false;
  String? _imageUrl;

  @override
  void dispose() {
    _promptController.dispose();
    super.dispose();
  }

  Future<void> _generate() async {
    setState(() => _loading = true);
    ref.read(studioProvider.notifier).startGeneration();

    try {
      final String? url = await _service.generatePoster(
        prompt: _promptController.text.trim(),
        style: _style,
      );

      if (!mounted) {
        return;
      }

      setState(() {
        _imageUrl = url;
        _loading = false;
      });

      if (url != null) {
        ref.read(studioProvider.notifier).finishGeneration(
              StudioAsset(
                id: DateTime.now().microsecondsSinceEpoch.toString(),
                title: '$_style poster',
                type: StudioAssetType.poster,
                createdAt: DateTime.now(),
                url: url,
                metadata: <String, Object?>{'style': _style},
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
        title: const Text('AI Poster Generator'),
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: <Widget>[
          TextField(
            controller: _promptController,
            maxLines: 4,
            style: const TextStyle(color: Colors.white),
            decoration: const InputDecoration(
              border: OutlineInputBorder(),
              hintText: 'Event mood, venue, lineup, visuals',
              hintStyle: TextStyle(color: Colors.white54),
            ),
          ),
          const SizedBox(height: 20),
          DropdownButtonFormField<String>(
            dropdownColor: const Color(0xFF101014),
            value: _style,
            decoration: const InputDecoration(border: OutlineInputBorder()),
            style: const TextStyle(color: Colors.white),
            items: <String>[
              'Neon club',
              'Underground techno',
              'Luxury rooftop',
              'Street rave',
            ]
                .map(
                  (String style) => DropdownMenuItem<String>(
                    value: style,
                    child: Text(style),
                  ),
                )
                .toList(growable: false),
            onChanged: (String? value) {
              if (value != null) {
                setState(() => _style = value);
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
                : const Icon(Icons.image),
            label: const Text('Generate Poster'),
          ),
          if (_imageUrl != null) ...<Widget>[
            const SizedBox(height: 20),
            PosterPreview(imageUrl: _imageUrl!),
          ],
        ],
      ),
    );
  }
}
