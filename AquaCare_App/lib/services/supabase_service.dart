import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseService {
  SupabaseService._privateConstructor() : client = Supabase.instance.client;
  @visibleForTesting
  SupabaseService.forTesting(this.client);
  static final SupabaseService instance = SupabaseService._privateConstructor();

  final SupabaseClient client;

  Future<List<Map<String, dynamic>>> getTanks(String userId) async {
    debugPrint('📡 Requesting tanks for user: $userId');
    final response = await client
        .from('tanks')
        .select('*, fish_species(*), devices(mac_address, last_calib_ph)')
        .eq('user_id', userId);
    debugPrint('📦 Response: $response');
    return response;
  }

  Future<Map<String, dynamic>> createTank({
    required String userId,
    required String name,
  }) async {
    if (userId.isEmpty || name.trim().isEmpty) {
      throw ArgumentError('Cần đăng nhập và nhập tên bể.');
    }
    return await client
        .from('tanks')
        .insert({'user_id': userId, 'tank_name': name.trim()})
        .select('id, tank_name')
        .single();
  }

  /// Returns false only when the tank was deleted but device cleanup failed.
  Future<bool> deleteTank({
    required String userId,
    required String tankId,
  }) async {
    if (userId.isEmpty) throw StateError('Vui lòng đăng nhập lại.');
    final id = int.parse(tankId);
    final devices = await client.from('devices').select('id').eq('tank_id', id);
    // FK ON DELETE SET NULL detaches devices; delete must succeed before cleanup.
    await client
        .from('tanks')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
        .select('id')
        .single();
    if (devices.isEmpty) return true;
    try {
      await client
          .from('devices')
          .update({'is_active': false})
          .inFilter('id', devices.map((device) => device['id']).toList())
          .isFilter('tank_id', null);
      return true;
    } catch (e) {
      debugPrint('Không thể cập nhật thiết bị sau khi xóa bể: $e');
      return false;
    }
  }

  Future<List<Map<String, dynamic>>> getFishSpecies() async {
    final response = await client.from('fish_species').select('*').order('id');
    return response;
  }

  Future<void> addFishSpecies(Map<String, dynamic> data) async {
    final speciesName = (data['species_name'] as String? ?? '').trim();
    if (speciesName.isNotEmpty) {
      final existing = await client
          .from('fish_species')
          .select('id, species_name')
          .ilike('species_name', speciesName)
          .maybeSingle();
      if (existing != null) {
        throw Exception(
          'Tên loài cá "$speciesName" đã tồn tại trong hệ thống!',
        );
      }
    }
    await client.from('fish_species').insert(data);
  }

  Future<void> updateFishSpecies(int id, Map<String, dynamic> data) async {
    final speciesName = (data['species_name'] as String? ?? '').trim();
    if (speciesName.isNotEmpty) {
      final existing = await client
          .from('fish_species')
          .select('id, species_name')
          .ilike('species_name', speciesName)
          .neq('id', id)
          .maybeSingle();
      if (existing != null) {
        throw Exception(
          'Tên loài cá "$speciesName" đã tồn tại trong hệ thống!',
        );
      }
    }
    await client.from('fish_species').update(data).eq('id', id);
  }

  Future<void> deleteFishSpecies(int id) async {
    await client.from('fish_species').delete().eq('id', id);
  }

  // ─── Devices & Warehouse Methods ───
  Future<List<Map<String, dynamic>>> getDevices() async {
    final response = await client
        .from('devices')
        .select('*, tanks(tank_name, users(full_name, phone))')
        .order('created_at', ascending: false);
    return List<Map<String, dynamic>>.from(response);
  }

  Future<Map<String, Map<String, dynamic>>> getMacCustomerMap() async {
    final Map<String, Map<String, dynamic>> macMap = {};
    try {
      final response = await client
          .from('orders')
          .select('*, order_items(product_name, quantity, device_macs)')
          .order('created_at', ascending: false);

      final orders = List<Map<String, dynamic>>.from(response);
      for (final o in orders) {
        final items = o['order_items'] as List?;
        if (items != null) {
          for (final item in items) {
            final macs = item['device_macs'];
            if (macs is List) {
              for (final m in macs) {
                if (m != null && m is String && m.trim().isNotEmpty) {
                  final key = m.trim().toUpperCase();
                  macMap[key] = {
                    'orderId': o['id']?.toString() ?? '',
                    'customerName': o['shipping_name'] ?? 'N/A',
                    'phone': o['shipping_phone'] ?? 'N/A',
                    'address': o['shipping_address'] ?? 'N/A',
                    'email': o['shipping_email'] ?? 'N/A',
                    'productName': item['product_name'] ?? 'Thiết bị AquaCare',
                    'createdAt': o['created_at'] ?? '',
                  };
                }
              }
            }
          }
        }
      }
    } catch (e) {
      debugPrint('⚠️ Error fetching MAC customer map: $e');
    }
    return macMap;
  }

  Future<void> addDeviceBatch({
    required String rawMacInput,
    required String firmwareVersion,
  }) async {
    final macs = rawMacInput
        .split(RegExp(r'[\n,]+'))
        .map((m) => m.trim().toUpperCase())
        .where((m) => m.isNotEmpty)
        .toList();

    if (macs.isEmpty) {
      throw Exception('Vui lòng nhập ít nhất một địa chỉ MAC Address hợp lệ');
    }

    final uniqueMacs = macs.toSet().toList();
    if (uniqueMacs.length < macs.length) {
      throw Exception('Phát hiện mã MAC bị trùng lặp trong danh sách nhập!');
    }

    // Check DB for existing MACs
    final macsLower = uniqueMacs.map((m) => m.toLowerCase()).toList();
    final existingDevs = await client
        .from('devices')
        .select('mac_address')
        .or(
          'mac_address.in.(${uniqueMacs.join(",")}),mac_address.in.(${macsLower.join(",")})',
        );

    if ((existingDevs as List).isNotEmpty) {
      final dupList = (existingDevs as List)
          .map((d) => d['mac_address'])
          .join(', ');
      throw Exception('Mã MAC đã tồn tại trong hệ thống: $dupList');
    }

    final devicesToInsert = uniqueMacs
        .map(
          (mac) => {
            'mac_address': mac,
            'firmware_version': firmwareVersion,
            'is_active': false,
          },
        )
        .toList();

    await client.from('devices').insert(devicesToInsert);
  }

  Future<void> updateDevice({
    required int id,
    required String macAddress,
    required String firmwareVersion,
  }) async {
    final newMac = macAddress.trim().toUpperCase();
    if (newMac.isEmpty) {
      throw Exception('MAC Address không được để trống');
    }

    final existing = await client
        .from('devices')
        .select('id, mac_address')
        .or('mac_address.eq.$newMac,mac_address.eq.${newMac.toLowerCase()}')
        .neq('id', id);

    if ((existing as List).isNotEmpty) {
      throw Exception('Mã MAC "$newMac" đã tồn tại trên một thiết bị khác!');
    }

    await client
        .from('devices')
        .update({'mac_address': newMac, 'firmware_version': firmwareVersion})
        .eq('id', id);
  }

  Future<void> deleteDevice(int id) async {
    await client.from('devices').delete().eq('id', id);
  }

  // ─── Staff Management Methods ───
  Future<List<Map<String, dynamic>>> getStaff() async {
    final response = await client
        .from('users')
        .select('*')
        .like('role', 'staff%')
        .order('created_at', ascending: false);
    return List<Map<String, dynamic>>.from(response);
  }

  Future<void> addStaff({
    required String fullName,
    required String email,
    required String phone,
    required String password,
    required String role,
  }) async {
    final cleanEmail = email.trim().toLowerCase();
    final cleanPhone = phone.trim();
    final cleanName = fullName.trim();

    if (cleanName.isEmpty ||
        cleanEmail.isEmpty ||
        cleanPhone.isEmpty ||
        password.isEmpty) {
      throw Exception('Vui lòng điền đầy đủ các thông tin bắt buộc');
    }

    // Check existing phone
    final existingPhone = await client
        .from('users')
        .select('id')
        .eq('phone', cleanPhone)
        .maybeSingle();
    if (existingPhone != null) {
      throw Exception('Số điện thoại này đã được sử dụng bởi tài khoản khác!');
    }

    // Auth Sign Up
    final authRes = await client.auth.signUp(
      email: cleanEmail,
      password: password,
    );

    if (authRes.user == null) {
      throw Exception('Không thể tạo tài khoản nhân viên trong Auth system');
    }

    // Update users table profile
    final userId = authRes.user!.id;
    await client
        .from('users')
        .update({'full_name': cleanName, 'phone': cleanPhone, 'role': role})
        .eq('id', userId);
  }

  Future<void> updateStaff({
    required String id,
    required String fullName,
    required String phone,
    required String role,
  }) async {
    final cleanPhone = phone.trim();
    final cleanName = fullName.trim();

    if (cleanName.isEmpty || cleanPhone.isEmpty) {
      throw Exception('Vui lòng điền đủ họ tên và số điện thoại');
    }

    final existingPhone = await client
        .from('users')
        .select('id')
        .eq('phone', cleanPhone)
        .neq('id', id)
        .maybeSingle();

    if (existingPhone != null) {
      throw Exception('Số điện thoại này đã được sử dụng bởi tài khoản khác!');
    }

    await client
        .from('users')
        .update({'full_name': cleanName, 'phone': cleanPhone, 'role': role})
        .eq('id', id);
  }

  Future<void> deleteStaff(String id) async {
    await client.from('users').delete().eq('id', id);
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

  /// Cập nhật trạng thái thủ công (Bật/Tắt) của một Relay qua API (0-delay)
  Future<void> updateRelayState(
    String tankId,
    String relayType,
    bool newState,
  ) async {
    try {
      int pin = 0;
      if (relayType == 'pump') {
        pin = 3;
      } else if (relayType == 'aerator')
        pin = 2;
      else if (relayType == 'light')
        pin = 1;

      final url = Uri.parse(
        'https://aquacare-p78r.onrender.com/api/device/relay',
      );
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'pin': pin,
          'state': newState,
          'tank_id': int.parse(tankId),
          'relay_field': 'relay_${relayType}_state',
        }),
      );

      if (response.statusCode == 200) {
        debugPrint(
          '✅ [MQTT API]: Đã gửi lệnh bật/tắt $relayType thành $newState cho bể $tankId (0-delay)',
        );
      } else {
        throw Exception(
          'API trả về lỗi ${response.statusCode}: ${response.body}',
        );
      }
    } catch (e) {
      debugPrint('❌ [MQTT API ERROR]: Lỗi khi gọi API Relay: $e');
      rethrow;
    }
  }

  /// Gửi lệnh raw tới MQTT thông qua Backend (Zero Delay)
  Future<void> sendDeviceCommand(String tankId, String command) async {
    try {
      final url = Uri.parse(
        'https://aquacare-p78r.onrender.com/api/device/command',
      );
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'tank_id': int.parse(tankId), 'command': command}),
      );

      if (response.statusCode == 200) {
        debugPrint(
          '✅ [MQTT API]: Đã gửi lệnh "$command" cho bể $tankId (0-delay)',
        );
      } else {
        throw Exception(
          'API trả về lỗi ${response.statusCode}: ${response.body}',
        );
      }
    } catch (e) {
      debugPrint('❌ [MQTT API ERROR]: Lỗi khi gọi API Command: $e');
      rethrow;
    }
  }

  /// Cập nhật thời gian hiệu chuẩn pH
  Future<void> updateLastCalibPh(String tankId, String isoTime) async {
    try {
      await client
          .from('devices')
          .update({'last_calib_ph': isoTime})
          .eq('tank_id', int.parse(tankId));
      debugPrint(
        '✅ [DB UPDATE]: Cập nhật last_calib_ph thành công cho bể $tankId',
      );
    } catch (e) {
      debugPrint('❌ [DB ERROR]: Lỗi khi cập nhật last_calib_ph: $e');
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
      debugPrint(
        '✅ [DB UPDATE]: Cập nhật app_fcm_token thành công cho user $userId',
      );
    } catch (e) {
      debugPrint('❌ [DB ERROR]: Lỗi khi cập nhật fcm_token: $e');
    }
  }

  /// Lấy danh sách Đơn hàng kèm thông tin order_items
  Future<List<Map<String, dynamic>>> getOrders() async {
    try {
      final res = await client
          .from('orders')
          .select('*, order_items(*)')
          .order('created_at', ascending: false);
      return List<Map<String, dynamic>>.from(res);
    } catch (e) {
      debugPrint('❌ [DB ERROR]: Lỗi khi fetch danh sách đơn hàng: $e');
      rethrow;
    }
  }

  /// Duyệt đơn hàng: Cập nhật status = confirmed & tạo công việc đóng gói cho Kho (packing task)
  Future<void> approveOrder({
    required String orderId,
    required String userId,
    required String customerName,
    required String phone,
    required String address,
  }) async {
    try {
      await client
          .from('orders')
          .update({'status': 'confirmed'})
          .eq('id', orderId);

      await client.from('tasks').insert({
        'task_type': 'packing',
        'customer_id': userId,
        'order_id': orderId,
        'title': 'Đóng gói đơn hàng #$orderId',
        'description':
            'Khách hàng: $customerName\nSĐT: $phone\nĐịa chỉ: $address',
      });
      debugPrint(
        '✅ [DB UPDATE]: Đã duyệt đơn hàng #$orderId và tạo task đóng gói!',
      );
    } catch (e) {
      debugPrint('❌ [DB ERROR]: Lỗi khi duyệt đơn hàng #$orderId: $e');
      rethrow;
    }
  }

  /// Lấy danh sách Gói cước dịch vụ
  Future<List<Map<String, dynamic>>> getSubscriptionPlans() async {
    try {
      final res = await client
          .from('subscription_plans')
          .select('*')
          .order('id');
      return List<Map<String, dynamic>>.from(res);
    } catch (e) {
      debugPrint('❌ [DB ERROR]: Lỗi khi fetch danh sách gói cước: $e');
      rethrow;
    }
  }

  /// Thêm gói cước mới
  Future<void> addSubscriptionPlan(Map<String, dynamic> data) async {
    try {
      await client.from('subscription_plans').insert(data);
      debugPrint('✅ [DB INSERT]: Thêm gói cước mới thành công!');
    } catch (e) {
      debugPrint('❌ [DB ERROR]: Lỗi khi thêm gói cước: $e');
      rethrow;
    }
  }

  /// Cập nhật gói cước
  Future<void> updateSubscriptionPlan(
    dynamic id,
    Map<String, dynamic> data,
  ) async {
    try {
      await client.from('subscription_plans').update(data).eq('id', id);
      debugPrint('✅ [DB UPDATE]: Cập nhật gói cước #$id thành công!');
    } catch (e) {
      debugPrint('❌ [DB ERROR]: Lỗi khi cập nhật gói cước #$id: $e');
      rethrow;
    }
  }

  /// Xóa gói cước
  Future<void> deleteSubscriptionPlan(dynamic id) async {
    try {
      await client.from('subscription_plans').delete().eq('id', id);
      debugPrint('✅ [DB DELETE]: Xóa gói cước #$id thành công!');
    } catch (e) {
      debugPrint('❌ [DB ERROR]: Lỗi khi xóa gói cước #$id: $e');
      rethrow;
    }
  }
}
