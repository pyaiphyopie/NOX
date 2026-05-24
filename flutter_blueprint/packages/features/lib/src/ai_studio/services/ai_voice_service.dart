import 'package:supabase_flutter/supabase_flutter.dart';

class AiVoiceService {
  const AiVoiceService();

  Future<String?> generateVoice({
    required String script,
    required String voice,
  }) async {
    final FunctionResponse response =
        await Supabase.instance.client.functions.invoke(
      'generate_voice',
      body: <String, Object?>{
        'script': script,
        'voice': voice,
      },
    );

    final Object? data = response.data;
    if (data is Map && data['url'] is String) {
      return data['url'] as String;
    }
    return null;
  }
}
