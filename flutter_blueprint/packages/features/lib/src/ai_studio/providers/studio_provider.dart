import 'package:flutter_riverpod/flutter_riverpod.dart';

enum StudioAssetType {
  music,
  voiceover,
  poster,
  copy,
}

class StudioAsset {
  const StudioAsset({
    required this.id,
    required this.title,
    required this.type,
    required this.createdAt,
    this.url,
    this.text,
    this.eventId,
    this.metadata = const <String, Object?>{},
  });

  final String id;
  final String title;
  final StudioAssetType type;
  final DateTime createdAt;
  final String? url;
  final String? text;
  final String? eventId;
  final Map<String, Object?> metadata;

  StudioAsset copyWith({
    String? eventId,
  }) {
    return StudioAsset(
      id: id,
      title: title,
      type: type,
      createdAt: createdAt,
      url: url,
      text: text,
      eventId: eventId ?? this.eventId,
      metadata: metadata,
    );
  }
}

class StudioState {
  const StudioState({
    this.assets = const <StudioAsset>[],
    this.isGenerating = false,
    this.errorMessage,
  });

  final List<StudioAsset> assets;
  final bool isGenerating;
  final String? errorMessage;

  StudioState copyWith({
    List<StudioAsset>? assets,
    bool? isGenerating,
    String? errorMessage,
  }) {
    return StudioState(
      assets: assets ?? this.assets,
      isGenerating: isGenerating ?? this.isGenerating,
      errorMessage: errorMessage,
    );
  }
}

class StudioController extends StateNotifier<StudioState> {
  StudioController() : super(const StudioState());

  void startGeneration() {
    state = state.copyWith(isGenerating: true);
  }

  void finishGeneration(StudioAsset asset) {
    state = state.copyWith(
      assets: <StudioAsset>[asset, ...state.assets],
      isGenerating: false,
    );
  }

  void failGeneration(Object error) {
    state = state.copyWith(
      isGenerating: false,
      errorMessage: error.toString(),
    );
  }

  void attachAssetToEvent({
    required String assetId,
    required String eventId,
  }) {
    state = state.copyWith(
      assets: state.assets
          .map(
            (StudioAsset asset) =>
                asset.id == assetId ? asset.copyWith(eventId: eventId) : asset,
          )
          .toList(growable: false),
    );
  }
}

final studioProvider =
    StateNotifierProvider<StudioController, StudioState>((ref) {
  return StudioController();
});
