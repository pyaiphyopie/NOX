import 'package:supabase_flutter/supabase_flutter.dart';
import 'app_config.dart';

class NoxSupabase {
  static SupabaseClient get client => Supabase.instance.client;

  static Future<void> init() async {
    await Supabase.initialize(
      url: AppConfig.supabaseUrl,
      anonKey: AppConfig.supabaseAnonKey,
    );
  }
}
