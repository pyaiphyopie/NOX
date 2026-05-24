import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/studio_provider.dart';
import '../services/ai_copy_service.dart';

class CopyGeneratorScreen extends ConsumerStatefulWidget {
  const CopyGeneratorScreen({super.key});

  @override
  ConsumerState<CopyGeneratorScreen> createState() =>
      _CopyGeneratorScreenState();
}

class _CopyGeneratorScreenState extends ConsumerState<CopyGeneratorScreen> {
  final AiCopyService _service = const AiCopyService();
  final TextEditingController _briefController = TextEditingController();
  String _tone = 'High energy';
  String _channel = 'Instagram caption';
  bool _loading = false;
  String? _copy;

  @override
  void dispose() {
    _briefController.dispose();
    super.dispose();
  }

  Future<void> _generate() async {
    setState(() => _loading = true);
    ref.read(studioProvider.notifier).startGeneration();

    try {
      final String? result = await _service.generateCopy(
        brief: _briefController.text.trim(),
        tone: _tone,
        channel: _channel,
      );

      if (!mounted) {
        return;
      }

      setState(() {
        _copy = result;
        _loading = false;
      });

      if (result != null) {
        ref.read(studioProvider.notifier).finishGeneration(
              StudioAsset(
                id: DateTime.now().microsecondsSinceEpoch.toString(),
                title: _channel,
                type: StudioAssetType.copy,
                createdAt: DateTime.now(),
                text: result,
                metadata: <String, Object?>{
                  'tone': _tone,
                  'channel': _channel,
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
        title: const Text('AI Copywriting'),
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: <Widget>[
          TextField(
            controller: _briefController,
            maxLines: 4,
            style: const TextStyle(color: Colors.white),
            decoration: const InputDecoration(
              border: OutlineInputBorder(),
              hintText: 'Event details, audience, offer',
              hintStyle: TextStyle(color: Colors.white54),
            ),
          ),
          const SizedBox(height: 20),
          DropdownButtonFormField<String>(
            dropdownColor: const Color(0xFF101014),
            value: _tone,
            decoration: const InputDecoration(border: OutlineInputBorder()),
            style: const TextStyle(color: Colors.white),
            items: <String>['High energy', 'Luxury', 'Underground', 'Minimal']
                .map(
                  (String tone) => DropdownMenuItem<String>(
                    value: tone,
                    child: Text(tone),
                  ),
                )
                .toList(growable: false),
            onChanged: (String? value) {
              if (value != null) {
                setState(() => _tone = value);
              }
            },
          ),
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(
            dropdownColor: const Color(0xFF101014),
            value: _channel,
            decoration: const InputDecoration(border: OutlineInputBorder()),
            style: const TextStyle(color: Colors.white),
            items: <String>[
              'Instagram caption',
              'Push notification',
              'Event listing',
              'Promoter SMS',
            ]
                .map(
                  (String channel) => DropdownMenuItem<String>(
                    value: channel,
                    child: Text(channel),
                  ),
                )
                .toList(growable: false),
            onChanged: (String? value) {
              if (value != null) {
                setState(() => _channel = value);
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
                : const Icon(Icons.edit),
            label: const Text('Generate Copy'),
          ),
          if (_copy != null) ...<Widget>[
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF101014),
                border: Border.all(color: Colors.amberAccent.withOpacity(0.35)),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(
                    _copy!,
                    style: const TextStyle(
                      color: Colors.white,
                      height: 1.4,
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextButton.icon(
                    onPressed: () {
                      Clipboard.setData(ClipboardData(text: _copy!));
                    },
                    icon: const Icon(Icons.copy),
                    label: const Text('Copy'),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}
