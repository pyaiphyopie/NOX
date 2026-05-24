import 'package:supabase_flutter/supabase_flutter.dart';

class AiMusicService {
  const AiMusicService();

  Future<String?> generateMusic({
    required String genre,
    required int bpm,
    int durationSeconds = 30,
  }) async {
    final FunctionResponse response =
        await Supabase.instance.client.functions.invoke(
      'generate_music',
      body: <String, Object?>{
        'genre': genre,
        'bpm': bpm,
        'durationSeconds': durationSeconds,
      },
    );

    final Object? data = response.data;
    if (data is Map && data['url'] is String) {
      return data['url'] as String;
    }
    return null;
  }
}
