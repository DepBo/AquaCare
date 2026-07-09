import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseService {
  SupabaseService._privateConstructor();
  static final SupabaseService instance = SupabaseService._privateConstructor();

  final SupabaseClient client = Supabase.instance.client;

  Future<List<Map<String, dynamic>>> getTanks(String userId) async {
    debugPrint('📡 Requesting tanks for user: $userId');
    final response = await client
        .from('tanks')
        .select('*')
        .eq('user_id', userId);
    debugPrint('📦 Response: $response');
    return response;
  }

  Future<List<Map<String, dynamic>>> getTelemetry(
    String tankId, {
    int limit = 30,
  }) async {
    debugPrint('🔍 [DB QUERY]: Fetching telemetry for tankId: $tankId');
    try {
      final response = await client
          .from('telemetry_logs')
          .select('*, devices!inner(*)')
          .eq('devices.tank_id', tankId)
          .order('recorded_at', ascending: false)
          .limit(limit);

      return List<Map<String, dynamic>>.from(response);
    } catch (e) {
      debugPrint('❌ [DB ERROR]: $e');
      // Trả về danh sách rỗng thay vì ném Exception để app không crash nếu có lỗi hoặc bể mới chưa có data
      return [];
    }
  }

  Stream<List<Map<String, dynamic>>> getTelemetryStream(
    String tankId, {
    int limit = 10,
  }) async* {
    debugPrint('🔍 [DB QUERY]: Init realtime stream for tankId: $tankId');

    // Do stream() không hỗ trợ JOIN, ta phải lấy device_id trước
    final devices = await client
        .from('devices')
        .select('id')
        .eq('tank_id', tankId);
    if (devices.isEmpty) {
      debugPrint('⚠️ [DB DATA]: Không tìm thấy thiết bị nào cho bể $tankId');
      yield [];
      return;
    }

    final deviceId = devices[0]['id'];
    debugPrint('📡 [REALTIME]: Bắt đầu lắng nghe device_id: $deviceId');

    yield* client
        .from('telemetry_logs')
        .stream(primaryKey: ['id'])
        .eq('device_id', deviceId)
        .order('recorded_at', ascending: false)
        .limit(limit);
  }

  /// Stream realtime từ bảng alerts_history, filter trực tiếp theo tank_id
  Stream<List<Map<String, dynamic>>> getAlertsStream(
    String tankId, {
    int limit = 50,
  }) async* {
    debugPrint('🔔 [ALERTS]: Init alerts stream for tankId: $tankId');

    // alerts_history đã có cột tank_id trực tiếp, không cần JOIN
    yield* client
        .from('alerts_history')
        .stream(primaryKey: ['id'])
        .eq('tank_id', int.parse(tankId))
        .order('created_at', ascending: false)
        .limit(limit);
  }

  /// Lấy danh sách cảnh báo có phân trang và filter
  Future<List<Map<String, dynamic>>> getAlertsWithPagination(
    String tankId, {
    String? type,
    int offset = 0,
    int limit = 50,
  }) async {
    debugPrint(
      '🔍 [DB QUERY]: Fetching alerts for tankId: $tankId, type: $type, offset: $offset',
    );
    try {
      var query = client
          .from('alerts_history')
          .select('*')
          .eq('tank_id', int.parse(tankId));

      if (type != null && type.isNotEmpty && type != 'Tất cả') {
        query = query.eq('alert_type', type);
      }

      final response = await query
          .order('created_at', ascending: false)
          .range(offset, offset + limit - 1);

      return List<Map<String, dynamic>>.from(response);
    } catch (e) {
      debugPrint('❌ [DB ERROR]: Lỗi khi fetch alerts: $e');
      return [];
    }
  }

  /// Tính phân bổ loại cảnh báo cho biểu đồ PieChart
  Future<Map<String, int>> getAlertDistribution(String tankId) async {
    debugPrint(
      '🔍 [DB QUERY]: Fetching alert distribution for tankId: $tankId',
    );
    try {
      final response = await client
          .from('alerts_history')
          .select('alert_type')
          .eq('tank_id', int.parse(tankId));

      final data = List<Map<String, dynamic>>.from(response);
      final distribution = <String, int>{};

      for (final row in data) {
        final type = row['alert_type'] as String? ?? 'Khác';
        distribution[type] = (distribution[type] ?? 0) + 1;
      }

      return distribution;
    } catch (e) {
      debugPrint('❌ [DB ERROR]: Lỗi khi fetch alert distribution: $e');
      return {};
    }
  }

  /// Lắng nghe trạng thái của bảng devices (Relay & Hẹn giờ) theo tankId
  Stream<Map<String, dynamic>?> getDeviceStream(String tankId) async* {
    debugPrint('🔌 [DEVICE]: Init device stream for tankId: $tankId');

    // Tìm device_id từ tank_id
    final devicesRes = await client
        .from('devices')
        .select('id')
        .eq('tank_id', int.parse(tankId));
    if (devicesRes.isEmpty) {
      debugPrint('⚠️ [DB DATA]: Không tìm thấy thiết bị nào cho bể $tankId');
      yield null;
      return;
    }

    final deviceId = devicesRes[0]['id'];

    // Lắng nghe thay đổi của device này
    yield* client
        .from('devices')
        .stream(primaryKey: ['id'])
        .eq('id', deviceId)
        .map((list) => list.isNotEmpty ? list.first : null);
  }

  /// Cập nhật trạng thái thủ công (Bật/Tắt) của một Relay
  Future<void> updateRelayState(
    String tankId,
    String relayType,
    bool newState,
  ) async {
    try {
      final columnName = 'relay_${relayType}_state';
      await client
          .from('devices')
          .update({columnName: newState})
          .eq('tank_id', int.parse(tankId));
      debugPrint(
        '✅ [DB UPDATE]: Cập nhật $columnName thành $newState cho bể $tankId',
      );
    } catch (e) {
      debugPrint('❌ [DB ERROR]: Lỗi khi cập nhật Relay: $e');
      rethrow;
    }
  }

  /// Cập nhật giờ bật/tắt tự động của một Relay
  Future<void> updateDeviceSchedule(
    String tankId,
    String field,
    String? time,
  ) async {
    try {
      await client
          .from('devices')
          .update({field: time})
          .eq('tank_id', int.parse(tankId));
      debugPrint(
        '✅ [DB UPDATE]: Cập nhật hẹn giờ $field thành $time cho bể $tankId',
      );
    } catch (e) {
      debugPrint('❌ [DB ERROR]: Lỗi khi cập nhật Hẹn giờ: $e');
      rethrow;
    }
  }

  /// Cập nhật FCM Token của thiết bị di động
  Future<void> updateFcmToken(String userId, String token) async {
    try {
      await client
          .from('users')
          .update({'app_fcm_token': token})
          .eq('id', userId);
      debugPrint('✅ [DB UPDATE]: Cập nhật app_fcm_token thành công cho user $userId');
    } catch (e) {
      debugPrint('❌ [DB ERROR]: Lỗi khi cập nhật fcm_token: $e');
    }
  }
}
