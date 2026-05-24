import 'package:supabase_flutter/supabase_flutter.dart';

class AiImageService {
  const AiImageService();

  Future<String?> generatePoster({
    required String prompt,
    required String style,
    String size = '1080x1350',
  }) async {
    final FunctionResponse response =
        await Supabase.instance.client.functions.invoke(
      'generate_poster',
      body: <String, Object?>{
        'prompt': prompt,
        'style': style,
        'size': size,
      },
    );

    final Object? data = response.data;
    if (data is Map && data['url'] is String) {
      return data['url'] as String;
    }
    return null;
  }
}
