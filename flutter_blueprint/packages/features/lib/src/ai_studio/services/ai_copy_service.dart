import 'package:supabase_flutter/supabase_flutter.dart';

class AiCopyService {
  const AiCopyService();

  Future<String?> generateCopy({
    required String brief,
    required String tone,
    required String channel,
  }) async {
    final FunctionResponse response =
        await Supabase.instance.client.functions.invoke(
      'generate_copy',
      body: <String, Object?>{
        'brief': brief,
        'tone': tone,
        'channel': channel,
      },
    );

    final Object? data = response.data;
    if (data is Map && data['copy'] is String) {
      return data['copy'] as String;
    }
    return null;
  }
}
