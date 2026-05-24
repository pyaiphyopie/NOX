import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/studio_provider.dart';

class AssetLibraryScreen extends ConsumerWidget {
  const AssetLibraryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final StudioState state = ref.watch(studioProvider);

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('Studio Assets'),
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
      ),
      body: state.assets.isEmpty
          ? const Center(
              child: Text(
                'No assets yet',
                style: TextStyle(color: Colors.white70),
              ),
            )
          : ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: state.assets.length,
              separatorBuilder: (BuildContext context, int index) {
                return const SizedBox(height: 12);
              },
              itemBuilder: (BuildContext context, int index) {
                final StudioAsset asset = state.assets[index];
                return _AssetTile(asset: asset);
              },
            ),
    );
  }
}

class _AssetTile extends ConsumerWidget {
  const _AssetTile({required this.asset});

  final StudioAsset asset;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF101014),
        border: Border.all(color: _accentColor.withOpacity(0.35)),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: <Widget>[
          Icon(_icon, color: _accentColor),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  asset.title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  asset.eventId == null
                      ? asset.type.name
                      : '${asset.type.name} - ${asset.eventId}',
                  style: const TextStyle(color: Colors.white54, fontSize: 12),
                ),
              ],
            ),
          ),
          IconButton(
            tooltip: 'Attach',
            onPressed: () {
              ref.read(studioProvider.notifier).attachAssetToEvent(
                    assetId: asset.id,
                    eventId: 'event-yangon-beta',
                  );
            },
            icon: const Icon(Icons.link, color: Colors.white70),
          ),
        ],
      ),
    );
  }

  Color get _accentColor {
    return switch (asset.type) {
      StudioAssetType.music => Colors.cyanAccent,
      StudioAssetType.voiceover => Colors.lightGreenAccent,
      StudioAssetType.poster => Colors.pinkAccent,
      StudioAssetType.copy => Colors.amberAccent,
    };
  }

  IconData get _icon {
    return switch (asset.type) {
      StudioAssetType.music => Icons.music_note,
      StudioAssetType.voiceover => Icons.record_voice_over,
      StudioAssetType.poster => Icons.image,
      StudioAssetType.copy => Icons.edit,
    };
  }
}
