import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseService {
  SupabaseService._privateConstructor();
  static final SupabaseService instance = SupabaseService._privateConstructor();

  final SupabaseClient client = Supabase.instance.client;

  Future<List<Map<String, dynamic>>> getTanks(String userId) async {
    return await client.from('tanks').select('*').eq('user_id', userId);
  }

  Future<List<Map<String, dynamic>>> getTelemetry(String tankId, {int limit = 30}) async {
    return await client
        .from('telemetry_logs')
        .select('*')
        .eq('tank_id', tankId)
        .order('created_at', ascending: false)
        .limit(limit);
  }
}
